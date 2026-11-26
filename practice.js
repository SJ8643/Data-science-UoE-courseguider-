/* practice.js – unlimited questions for every week of every module.
   Generators (gens_*.js) build a fresh question each time from the week's lecture content, with random values
   and a worked solution. Where the page can ask Claude, it can also write a new question from the week's slide
   text and mark written answers against a mark scheme. */
(function () {
  'use strict';
  const G = window.GUIDE = window.GUIDE || {};
  const P = G.P = G.P || {};
  const $ = function (s, el) { return (el || document).querySelector(s); };
  function h(html) { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstChild; }
  const esc = P.esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };

  /* ---------- random helpers ---------- */
  const R = P.R = {
    int: function (a, b) { return a + Math.floor(Math.random() * (b - a + 1)); },
    pick: function (a) { return a[Math.floor(Math.random() * a.length)]; },
    shuffle: function (a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; },
    sample: function (a, k) { return R.shuffle(a.slice()).slice(0, k); },
    chance: function (p) { return Math.random() < p; },
    distinct: function (k, a, b) { const s = new Set(); while (s.size < k) s.add(R.int(a, b)); return Array.from(s); }
  };
  /* round for display, without trailing zeros */
  P.fmt = function (x, dp) { if (dp == null) dp = 4; const v = Number(x.toFixed(dp)); return String(Object.is(v, -0) ? 0 : v); };
  /* exactly what Python's print() shows for an int or float */
  P.pyNum = function (x) { return Number.isInteger(x) ? x.toFixed(1) : String(x); };
  P.pyStr = function (v) { /* repr of a Python value made of str / number / list / bool / None */
    if (v === null) return 'None';
    if (v === true) return 'True'; if (v === false) return 'False';
    if (typeof v === 'string') return v.indexOf("'") >= 0 && v.indexOf('"') < 0 ? '"' + v + '"' : "'" + v.replace(/'/g, "\\'") + "'";
    if (Array.isArray(v)) return '[' + v.map(P.pyStr).join(', ') + ']';
    if (typeof v === 'object' && v.f !== undefined) return P.pyNum(v.f);  /* {f: 2} marks a float */
    if (typeof v === 'object') return '{' + Object.keys(v).map(function (k) { return P.pyStr(k) + ': ' + P.pyStr(v[k]); }).join(', ') + '}';
    return String(v);
  };

  /* ---------- question builders ---------- */
  P.mcq = function (q, right, wrongs, why, extra) {
    const opts = [String(right)];
    (wrongs || []).forEach(function (w) { w = String(w); if (opts.indexOf(w) < 0 && opts.length < 5) opts.push(w); });
    return Object.assign({ k: 'mcq', q: q, options: opts, answer: 0, why: why || '' }, extra || {});
  };
  P.num = function (q, ans, dp, why, extra) { return Object.assign({ k: 'num', q: q, ans: ans, dp: dp, why: why || '' }, extra || {}); };
  P.text = function (q, norm, accept, why, extra) { return Object.assign({ k: 'text', q: q, norm: norm, accept: accept, why: why || '' }, extra || {}); };
  P.out = function (code, lines, why, extra) {
    return Object.assign({ k: 'text', q: 'What does this print? Work it out by hand first: the exam is closed book.', code: code, norm: 'lines', accept: [lines.join('\n')], why: why || '', multi: lines.length > 1 }, extra || {});
  };
  P.written = function (q, marks, scheme, model, extra) { return Object.assign({ k: 'written', q: q, marks: marks, scheme: scheme, model: model }, extra || {}); };
  P.code = function (q, starter, test, solution, why, extra) { return Object.assign({ k: 'code', q: q, starter: starter, test: test, solution: solution, why: why || '' }, extra || {}); };
  /* pick one row of a pool [[situation, label, why], …] and ask which label fits */
  P.cls = function (pool, stem, labels, extra) {
    const row = R.pick(pool);
    const others = R.shuffle(labels.filter(function (l) { return l !== row[1]; }));
    return P.mcq(stem.replace('%s', row[0]), row[1], others.slice(0, 4), row[2], extra);
  };
  P.code_ = function (s) { return '<code>' + esc(s) + '</code>'; };

  /* ---------- point a question at the slide it comes from: first page of the deck whose text contains kw ---------- */
  const slideMemo = {};
  P.slide = function (deck, kw) {
    const key = deck + '|' + kw;
    if (key in slideMemo) return slideMemo[key];
    const d = ((window.SLIDES && window.SLIDES.decks) || []).find(function (x) { return x.id === deck; });
    let res = null;
    if (d) {
      /* prefer a slide whose title (the start of its text) names the topic; avoid agenda and contents slides */
      const low = String(kw).toLowerCase();
      let best = -1, bestScore = 0;
      d.pages.forEach(function (p, i) {
        const t = (p.t || '').replace(/\s+/g, ' ').toLowerCase();
        const at = t.indexOf(low); if (at < 0) return;
        let sc = 1 + Math.min(3, t.split(low).length - 1) * 0.5;
        if (at < 70) sc += 4;
        if (p.b) sc -= 3;
        if (/^(today|overview|lecture overview|contents|agenda|outline)\b|module structure|today:/.test(t.slice(0, 40)) || i < 2) sc -= 4;
        if (sc > bestScore) { bestScore = sc; best = i; }
      });
      res = { deck: d.id, p: best >= 0 ? best + 1 : 1, label: d.title + (best >= 0 ? ', slide ' + (best + 1) : '') };
    }
    return (slideMemo[key] = res);
  };

  /* ---------- propositional logic: parse, evaluate, print, generate ---------- */
  const LG = P.logic = {};
  LG.parse = function (src) {
    const s = src.replace(/\s+/g, ' ').trim();
    let i = 0;
    const toks = [];
    const rx = /^(<->|<=>|↔|iff\b|->|=>|→|implies\b|¬|~|!|not\b|∧|&&?|\^|and\b|∨|\|\|?|or\b|⊕|xor\b|\(|\)|[a-z]\b|T\b|F\b|⊤|⊥|true\b|false\b)/i;
    while (i < s.length) {
      if (s[i] === ' ') { i++; continue; }
      const m = rx.exec(s.slice(i));
      if (!m) throw new Error('I could not read "' + s.slice(i, i + 6) + '"');
      let t = m[1], tl = t.toLowerCase();
      if (/^(<->|<=>|↔|iff)$/.test(tl)) t = 'iff'; else if (/^(->|=>|→|implies)$/.test(tl)) t = 'imp';
      else if (/^(¬|~|!|not)$/.test(tl)) t = 'not'; else if (/^(∧|&|&&|\^|and)$/.test(tl)) t = 'and';
      else if (/^(∨|\||\|\||or)$/.test(tl)) t = 'or'; else if (/^(⊕|xor)$/.test(tl)) t = 'xor';
      else if (/^(t|⊤|true)$/.test(tl) && t !== 't') t = 'T'; else if (/^(f|⊥|false)$/.test(tl) && t !== 'f') t = 'F';
      else if (t === '(' || t === ')') { /* keep */ } else t = 'v:' + tl;
      toks.push(t); i += m[1].length;
    }
    let p = 0;
    function peek() { return toks[p]; }
    function bin(next, op, right) {
      let a = next();
      while (peek() === op) { p++; const b = right ? bin(next, op, true) : next(); a = { op: op, a: a, b: b }; if (right) return a; }
      return a;
    }
    function atom() {
      const t = toks[p++];
      if (t === undefined) throw new Error('the formula ends too early');
      if (t === 'not') return { op: 'not', a: atom() };
      if (t === '(') { const e = iff(); if (toks[p++] !== ')') throw new Error('a bracket is not closed'); return e; }
      if (t === 'T' || t === 'F') return { op: 'const', v: t === 'T' };
      if (t.indexOf('v:') === 0) return { op: 'var', n: t.slice(2) };
      throw new Error('unexpected "' + t + '"');
    }
    function and() { return bin(atom, 'and'); }
    function xor() { return bin(and, 'xor'); }
    function or() { return bin(xor, 'or'); }
    function imp() { return bin(or, 'imp', true); }
    function iff() { return bin(imp, 'iff'); }
    const e = iff();
    if (p < toks.length) throw new Error('there is something extra after the formula');
    return e;
  };
  LG.ev = function (e, env) {
    switch (e.op) {
      case 'var': return !!env[e.n];
      case 'const': return e.v;
      case 'not': return !LG.ev(e.a, env);
      case 'and': return LG.ev(e.a, env) && LG.ev(e.b, env);
      case 'or': return LG.ev(e.a, env) || LG.ev(e.b, env);
      case 'xor': return LG.ev(e.a, env) !== LG.ev(e.b, env);
      case 'imp': return !LG.ev(e.a, env) || LG.ev(e.b, env);
      case 'iff': return LG.ev(e.a, env) === LG.ev(e.b, env);
    }
  };
  const SYM = { and: '∧', or: '∨', imp: '→', iff: '↔', xor: '⊕' };
  LG.show = function (e, top) {
    if (e.op === 'var') return e.n;
    if (e.op === 'const') return e.v ? 'T' : 'F';
    if (e.op === 'not') return '¬' + LG.show(e.a);
    const s = LG.show(e.a) + ' ' + SYM[e.op] + ' ' + LG.show(e.b);
    return top ? s : '(' + s + ')';
  };
  LG.vars = function (e, out) { out = out || []; if (e.op === 'var') { if (out.indexOf(e.n) < 0) out.push(e.n); } else { if (e.a) LG.vars(e.a, out); if (e.b) LG.vars(e.b, out); } return out.sort(); };
  LG.rows = function (vs) { const rows = []; const n = vs.length; for (let k = 0; k < (1 << n); k++) { const env = {}; vs.forEach(function (v, j) { env[v] = !((k >> (n - 1 - j)) & 1); }); rows.push(env); } return rows; };  /* T first, as on the slides */
  LG.col = function (e, vs) { return LG.rows(vs).map(function (env) { return LG.ev(e, env) ? 'T' : 'F'; }).join(''); };
  LG.rand = function (vs, depth) {
    if (depth <= 0 || (depth < 2 && R.chance(0.3))) { const v = { op: 'var', n: R.pick(vs) }; return R.chance(0.3) ? { op: 'not', a: v } : v; }
    if (R.chance(0.15)) return { op: 'not', a: LG.rand(vs, depth - 1) };
    return { op: R.pick(['and', 'or', 'imp', 'and', 'or', 'imp', 'iff']), a: LG.rand(vs, depth - 1), b: LG.rand(vs, depth - 1) };
  };
  /* is e a disjunction of conjunctions of literals (DNF) / conjunction of disjunctions (CNF)? */
  function lit(e) { return e.op === 'var' || (e.op === 'not' && e.a.op === 'var'); }
  function flat(e, op) { return e.op === op ? flat(e.a, op).concat(flat(e.b, op)) : [e]; }
  LG.isNF = function (e, outer, inner) { return flat(e, outer).every(function (c) { return flat(c, inner).every(lit); }); };
  LG.table = function (e, vs) {
    let t = '<table class="tbl tt"><tr>' + vs.map(function (v) { return '<th>' + v + '</th>'; }).join('') + '<th>' + esc(LG.show(e, true)) + '</th></tr>';
    LG.rows(vs).forEach(function (env) { t += '<tr>' + vs.map(function (v) { return '<td>' + (env[v] ? 'T' : 'F') + '</td>'; }).join('') + '<td><b>' + (LG.ev(e, env) ? 'T' : 'F') + '</b></td></tr>'; });
    return t + '</table>';
  };

  /* ---------- marking typed answers ---------- */
  function parseNum(s) {
    s = String(s).trim().replace(/[,\s]/g, '').replace(/%$/, '').replace(/^\+/, '').replace(/−/g, '-');
    if (/^-?\d*\.?\d+(e-?\d+)?\/-?\d*\.?\d+$/i.test(s)) { const ab = s.split('/'); return Number(ab[0]) / Number(ab[1]); }
    if (s === '' || isNaN(Number(s))) return null;
    return Number(s);
  }
  function setOf(s) {
    s = String(s).trim().replace(/^\{|\}$/g, '').replace(/∅/g, '').trim();
    if (!s) return [];
    return Array.from(new Set(s.split(',').map(function (x) { return x.trim().replace(/^['"]|['"]$/g, ''); }).filter(Boolean))).sort();
  }
  function pairsOf(s) {
    const out = new Set(); const rx = /\(\s*([^,()\s]+)\s*,\s*([^,()\s]+)\s*\)/g; let m;
    while ((m = rx.exec(s))) out.add(m[1] + ',' + m[2]);
    return Array.from(out).sort();
  }
  function lines(s) {
    const ls = String(s).replace(/\r/g, '').split('\n').map(function (l) { return l.trim(); });
    while (ls.length && !ls[ls.length - 1]) ls.pop();
    while (ls.length && !ls[0]) ls.shift();
    return ls.join('\n');
  }
  function plain(s) { return String(s).toLowerCase().replace(/[‘’]/g, "'").replace(/\s+/g, ' ').replace(/[.\s]+$/, '').trim(); }
  P.check = function (it, input) {
    if (it.k === 'num') {
      const x = parseNum(input); if (x === null) return { bad: 'Type a number (fractions such as 3/8 are fine).' };
      const tol = it.tol != null ? it.tol : (it.dp == null ? 1e-9 : 0.5 * Math.pow(10, -it.dp) + 1e-9);
      return { ok: Math.abs(x - it.ans) <= tol || Math.abs(x - it.ans) <= 1e-9 * Math.max(1, Math.abs(it.ans)) };
    }
    const n = it.norm;
    if (n === 'formula') {
      let e; try { e = LG.parse(input); } catch (err) { return { bad: 'I could not read that formula: ' + err.message + '. Use letters, ¬ or ~, ∧ or &, ∨ or |, → or ->, ↔ or <->, and brackets.' }; }
      const vs = it.vars, extra = LG.vars(e).filter(function (v) { return vs.indexOf(v) < 0; });
      if (extra.length) return { ok: false, note: 'Your formula uses ' + extra.join(', ') + ', which is not in the question.' };
      const same = LG.col(e, vs) === it.target;
      if (same && it.form === 'dnf' && !LG.isNF(e, 'or', 'and')) return { ok: false, note: 'It is equivalent, but it is not in disjunctive normal form (an OR of ANDs of literals).' };
      if (same && it.form === 'cnf' && !LG.isNF(e, 'and', 'or')) return { ok: false, note: 'It is equivalent, but it is not in conjunctive normal form (an AND of ORs of literals).' };
      if (same && it.noImp && JSON.stringify(e).match(/"op":"(imp|iff)"/)) return { ok: false, note: 'It is equivalent, but the question asked for no → or ↔.' };
      return { ok: same, note: same ? '' : 'Its truth table is ' + LG.col(e, vs) + ' but the right column is ' + it.target + ' (rows in the usual order, T first).' };
    }
    if (it.checkFn) return it.checkFn(input);
    const acc = it.accept || [];
    const f = n === 'set' ? function (s) { return setOf(s).join('|'); } : n === 'pairs' ? function (s) { return pairsOf(s).join('|'); } :
      n === 'lines' ? lines : n === 'letters' ? function (s) { return String(s).toUpperCase().replace(/[^A-Z]/g, '').split('').sort().filter(function (c, i, a) { return a.indexOf(c) === i; }).join(''); } :
      n === 'tf' ? function (s) { return String(s).toUpperCase().replace(/[^TF01]/g, '').replace(/1/g, 'T').replace(/0/g, 'F'); } :
      n === 'caps' ? function (s) { return String(s).toUpperCase().replace(/[^A-Z]/g, ''); } :
      n === 'loose' ? function (s) { return lines(s).replace(/\[\s+/g, '[').replace(/\s+\]/g, ']').replace(/[ \t]+/g, ' ').replace(/'/g, '"'); } :
      n === 'nospace' ? function (s) { return String(s).replace(/[\s()]/g, '').replace(/[‘’']/g, '"').toLowerCase(); } : plain;
    const mine = f(input);
    if (!mine && n !== 'set' && n !== 'pairs') return { bad: 'Type an answer first.' };
    return { ok: acc.some(function (a) { return f(a) === mine; }) };
  };

  /* ---------- rendering one question ---------- */
  function fb(ok, html) { return h('<div class="fb ' + (ok ? 'ok' : 'no') + '"><b class="' + (ok ? 'ok' : 'no') + '">' + (ok ? 'Correct.' : 'Not quite.') + '</b> ' + (html || '') + '</div>'); }
  function srcLink(it) {
    if (!it.src) return '';
    const d = it.src;
    return '<button class="btn ghost small srcbtn" type="button" data-deck="' + esc(d.deck) + '" data-p="' + (d.p || 1) + '">From your slides: ' + esc(d.label) + ' ↗</button>';
  }
  function wireSrc(el) { el.querySelectorAll('.srcbtn').forEach(function (b) { b.onclick = function () { if (G.openViewer) G.openViewer(b.dataset.deck, +b.dataset.p); }; }); }
  function solution(it, extra) {
    const s = (extra || '') + (it.why ? '<div class="worked"><b>Worked solution.</b> ' + it.why + '</div>' : '') + srcLink(it);
    return s;
  }
  P.render = function (it, box, done) {
    box.appendChild(h('<div class="q">' + it.q + '</div>'));
    if (it.code) box.appendChild(G.editor ? G.editor(it.code, { readOnly: true }).el : h('<pre>' + esc(it.code) + '</pre>'));
    if (it.k === 'mcq') renderMcq(it, box, done);
    else if (it.k === 'num' || it.k === 'text') renderTyped(it, box, done);
    else if (it.k === 'code') renderCode(it, box, done);
    else if (it.k === 'written') renderWritten(it, box, done);
  };
  function renderMcq(it, box, done) {
    const wrap = h('<div class="opts"></div>');
    R.shuffle(it.options.map(function (_, i) { return i; })).forEach(function (idx, pos) {
      const b = h('<button class="opt" type="button"><i>' + 'ABCDE'[pos] + '</i><span>' + it.options[idx] + '</span></button>');
      b.onclick = function () {
        wrap.querySelectorAll('.opt').forEach(function (x) { x.disabled = true; });
        const ok = idx === it.answer;
        b.classList.add(ok ? 'right' : 'wrong');
        if (!ok) wrap.querySelectorAll('.opt').forEach(function (x) { if (x.dataset.i === String(it.answer)) x.classList.add('right'); });
        const f = fb(ok, solution(it)); box.appendChild(f); wireSrc(f);
        done(ok);
      };
      b.dataset.i = idx;
      wrap.appendChild(b);
    });
    box.appendChild(wrap);
  }
  function renderTyped(it, box, done) {
    const multi = it.multi || it.norm === 'lines';
    const hint = it.hint || (it.k === 'num' ? (it.dp ? 'Give your answer to ' + it.dp + ' decimal place' + (it.dp > 1 ? 's' : '') + '.' : it.dp === 0 ? 'Give a whole number.' : '') : '');
    const row = h('<div class="pans">' + (multi ? '<textarea class="free mono" rows="' + Math.min(8, Math.max(2, (it.accept && it.accept[0] ? it.accept[0].split('\n').length : 2))) + '" spellcheck="false" placeholder="' + esc(it.ph || 'Type the exact output, one line per line') + '"></textarea>' :
      '<input type="text" autocomplete="off" spellcheck="false" placeholder="' + esc(it.ph || (it.k === 'num' ? 'Your answer' : 'Type your answer')) + '">') +
      '<div class="row"><button class="btn go" type="button">Check</button><button class="btn ghost" type="button" data-k="give">I don’t know: show me</button>' + (hint ? '<span class="small muted">' + esc(hint) + '</span>' : '') + '</div></div>');
    box.appendChild(row);
    const inp = row.querySelector('input,textarea'), btns = row.querySelectorAll('button');
    let finished = false;
    function finish(ok, note) {
      if (finished) return; finished = true;
      inp.disabled = true; btns.forEach(function (b) { b.disabled = true; });
      const ans = it.k === 'num' ? P.fmt(it.ans, it.dp == null ? 6 : it.dp) + (it.unit ? ' ' + it.unit : '') : it.showAns || (it.accept ? it.accept[0] : it.target ? it.model || '' : '');
      const ansHtml = ok ? '' : '<div class="ansline">Answer: ' + (it.norm === 'lines' ? '<pre class="out1">' + esc(ans) + '</pre>' : '<b>' + (it.ansHtml || esc(ans)) + '</b>') + '</div>';
      const f = fb(ok, (note ? esc(note) + ' ' : '') + ansHtml + solution(it)); box.appendChild(f); wireSrc(f);
      done(ok);
    }
    btns[0].onclick = function () {
      const r = P.check(it, inp.value);
      if (r.bad) { G.toast ? G.toast(r.bad) : alert(r.bad); return; }
      finish(r.ok, r.note);
    };
    btns[1].onclick = function () { finish(false); };
    inp.addEventListener('keydown', function (e) { if (e.key === 'Enter' && (!multi || e.ctrlKey || e.metaKey)) { e.preventDefault(); btns[0].click(); } });
    setTimeout(function () { try { inp.focus({ preventScroll: true }); } catch (e) {} }, 30);
  }
  function renderCode(it, box, done) {
    const ed = G.editor(it.starter, { onRun: function () { test(); } });
    const bar = h('<div class="runbar"><button class="btn go" type="button">Run the tests ▶</button><button class="btn ghost" type="button">Show a solution</button><span class="status"></span></div>');
    const out = h('<div class="out"></div>');
    box.appendChild(h('<div class="small muted">Write it on paper first if you can: in the exam there is no computer to test on. Then type it here and run the tests.</div>'));
    box.appendChild(ed.el); box.appendChild(bar); box.appendChild(out);
    const st = $('.status', bar);
    let finished = false, tries = 0;
    function finish(ok) {
      if (finished) return; finished = true;
      const f = fb(ok, (ok ? (tries > 1 ? 'All tests pass after ' + tries + ' runs.' : 'All tests pass first time.') : 'Compare your code with this solution, then try the next one like it.') + solution(it));
      box.appendChild(f); wireSrc(f);
      box.appendChild(G.editor(it.solution, { readOnly: true }).el);
      done(ok);
    }
    async function test() {
      tries++;
      const ns = 'prac-' + Date.now();
      try {
        st.className = 'status busy'; st.textContent = G.py.state === 'ready' ? 'Running…' : 'Starting Python (first run downloads it)…';
        await G.py.boot();
        const res = await G.py.run({ code: ed.get(), ns: ns });
        out.innerHTML = ''; G.showResult(res, out, ed, true);
        if (res.error) { st.className = 'status'; st.textContent = 'Your code raised an error: fix it and run again.'; return; }
        const t = await G.py.run({ code: it.test, ns: ns });
        st.className = 'status';
        if (t.error) { st.textContent = ''; out.appendChild(h('<div class="fb no"><b class="no">A test failed.</b> ' + esc(t.error.msg || t.error.type) + '</div>')); }
        else { st.textContent = 'Tests passed'; finish(true); }
      } catch (e) { st.className = 'status'; st.textContent = 'Python could not run here (' + (e.message || e) + '). Check your answer against the solution.'; }
    }
    bar.firstChild.onclick = test;
    bar.children[1].onclick = function () { finish(false); };
  }
  function renderWritten(it, box, done) {
    const el = h('<div><div class="small muted">Written answer, ' + it.marks + ' mark' + (it.marks > 1 ? 's' : '') + '. Write it as you would in the ' + (it.essay ? 'essay' : 'exam') + ', then mark it against the scheme.</div>' +
      '<textarea class="free" rows="6" placeholder="Your answer"></textarea><div class="row"><button class="btn go" type="button">Show the mark scheme</button><button class="btn ai ai-only" type="button">Mark it with Claude</button></div><div class="slot"></div><div class="aiout hide"></div></div>');
    box.appendChild(el);
    const ta = $('textarea', el), slot = $('.slot', el), bs = el.querySelectorAll('button');
    let finished = false;
    function record(score) {
      if (finished) return; finished = true;
      done(score / it.marks >= 0.6, score);
    }
    function showScheme() {
      if (slot.firstChild) return;
      const sc = h('<div class="scheme"><b>Mark scheme</b><ul>' + it.scheme.map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ul>' +
        (it.model ? '<details class="rev" open><summary>Model answer</summary><div>' + it.model + '</div></details>' : '') + srcLink(it) +
        '<div class="selfmark"><span>Your mark:</span>' + Array.from({ length: it.marks + 1 }, function (_, i) { return '<button class="btn small" type="button" data-m="' + i + '">' + i + '</button>'; }).join('') + '<span class="small muted">out of ' + it.marks + '</span></div></div>');
      slot.appendChild(sc); wireSrc(sc);
      sc.querySelectorAll('[data-m]').forEach(function (b) {
        b.onclick = function () {
          sc.querySelectorAll('[data-m]').forEach(function (x) { x.disabled = true; x.classList.remove('go'); });
          b.classList.add('go'); record(+b.dataset.m);
        };
      });
    }
    bs[0].onclick = showScheme;
    bs[1].onclick = async function () {
      if (!ta.value.trim()) { G.toast('Write your answer first.'); return; }
      const out = $('.aiout', el); out.classList.remove('hide'); out.textContent = 'Claude is marking…'; bs[1].disabled = true;
      const strip = function (x) { return String(x).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(); };
      const prompt = G.tutor + 'Mark this answer strictly but fairly, as a University of Exeter examiner would, using the mark scheme. Award whole marks only. ' +
        'Reply with JSON only: {"score": <integer 0-' + it.marks + '>, "good": "<what earned marks, one sentence>", "missing": "<what lost marks, one or two sentences>", "better": "<one improved sentence or step>"}.\n\n' +
        'Question (' + it.marks + ' marks): ' + strip(it.q) + '\nMark scheme: ' + it.scheme.map(strip).join(' | ') + '\nModel answer: ' + strip(it.model || '') + '\nStudent answer: ' + ta.value;
      try {
        const sample = await G.getSample();
        if (!sample) throw { message: 'Claude is not available in this view' };
        const r = await sample(prompt, { modelTier: 'default' });
        const j = P.json(r.text);
        const score = Math.max(0, Math.min(it.marks, Math.round(+j.score || 0)));
        out.innerHTML = '<b>Claude’s mark: ' + score + ' / ' + it.marks + '</b><br>' + esc(j.good || '') + (j.missing ? '<br><b>Lost marks:</b> ' + esc(j.missing) : '') + (j.better ? '<br><b>Better:</b> ' + esc(j.better) : '');
        showScheme();
        const b = slot.querySelector('[data-m="' + score + '"]'); if (b && !finished) b.click();
      } catch (e) {
        bs[1].disabled = false;
        out.textContent = e && e.code === 'rate_limited' ? 'Claude is busy right now. Mark it yourself with the scheme, or try again in a minute.' : 'Claude could not mark this just now' + (e && e.message ? ' (' + e.message + ')' : '') + '. Use the mark scheme instead.';
      }
    };
  }
  P.json = function (t) { const a = String(t).indexOf('{'), b = String(t).lastIndexOf('}'); if (a < 0 || b < a) throw new Error('no JSON in the reply'); return JSON.parse(String(t).slice(a, b + 1)); };

  /* ---------- the registry of weeks ---------- */
  P.weeks = [];
  P.week = function (track, week, title, opts, gens) {
    const W = { track: track, week: week, title: title, id: track + '-' + week, lessons: opts.lessons || [], decks: opts.decks, label: opts.label || ('Week ' + week), gens: [] };
    gens.forEach(function (g, i) { W.gens.push({ id: W.id + ':' + i, topic: g[0], fn: g[1], w: W }); });
    P.weeks.push(W);
    return W;
  };
  P.trackWeeks = function (tid) { return P.weeks.filter(function (W) { return W.track === tid; }).sort(function (a, b) { return a.week - b.week; }); };
  P.find = function (id) { return P.weeks.find(function (W) { return W.id === id; }); };
  P.forLesson = function (L) { return P.weeks.find(function (W) { return W.lessons.indexOf(L.id) >= 0; }); };
  P.weekDecks = function (W) {
    const all = (window.SLIDES && window.SLIDES.decks) || [];
    if (W.decks) return W.decks.map(function (id) { return all.find(function (d) { return d.id === id; }); }).filter(Boolean);
    return all.filter(function (d) { return d.module === W.track && d.week === W.week; });
  };

  /* ---------- how each module is assessed (from your slides and Exeter's published exam rubrics) ---------- */
  P.assess = {
    py: { short: 'A digital assessment worth 40% (week 8, in your tutorial) and a closed-book exam in January 2027 worth 60%.',
      how: 'The last ECM1400 exam rubric Exeter published (January 2020) was 1.5 hours, closed book, with no calculators. So most questions here make you trace code by hand, predict exact output, find bugs and write short functions, as you would on paper.',
      src: { deck: 'py-programming-lecture-1', p: 18, label: 'Programming lecture 1, slide 18' } },
    ml: { short: 'Coursework worth 40% (due 2 November 2026) and an exam worth 60% in 2027.',
      how: 'The last COM1011 exam rubric Exeter published (January 2020) was 2 hours, closed book, “answer ALL questions”, with a non-programmable calculator allowed. So expect calculations by hand (impurity, R², confusion-matrix metrics, Bayes, distances, linkage) and short written explanations of why a method works or fails.',
      src: { deck: 'ml-com1011-l01-introduction', p: 13, label: 'COM1011 Lecture 1, slide 13' } },
    dm: { short: 'Continuous assessment worth 40% and an exam worth 60%.',
      how: 'The last ECM1415 exam rubric Exeter published (January 2020) was 2 hours and closed book (calculators allowed), with every question compulsory: question 1 worth 40 marks, the others 30 each. So: short calculations (truth tables, sets, functions, relations) done carefully by hand, plus written proofs marked step by step. This year counting and probability were removed and induction expanded.',
      src: { deck: 'dm-intro-to-modal-logic-slides', p: 6, label: 'ECM1415 Lecture 1, slide 6' } },
    spi: { short: 'An individual 2,000-word essay in LaTeX worth 80% (due 7 December 2026) and a group presentation worth 20% (done on 19 October).',
      how: 'There is no exam. So these questions train what the essay is marked on: knowing the laws, cases and figures exactly, applying ethical theories and the BCS Code to a situation, and building an argument with evidence and a counter-argument. Written answers come with a mark scheme.',
      src: { deck: 'spi-week-01', p: 13, label: 'ECM1407 Week 1, slides 12–14' } }
  };

  /* ---------- progress ---------- */
  function store() { const S = G.S; if (!S.prac || typeof S.prac !== 'object') S.prac = {}; ['g', 'w'].forEach(function (k) { if (!S.prac[k]) S.prac[k] = {}; }); return S.prac; }
  P.stats = function (wid) {
    const st = store().w[wid] || { n: 0, ok: 0, rec: [] };
    const rec = st.rec || [];
    return { n: st.n || 0, ok: st.ok || 0, recent: rec.length ? Math.round(100 * rec.reduce(function (a, b) { return a + b; }, 0) / rec.length) : null, best: st.best || 0, cur: st.cur || 0, nrec: rec.length };
  };
  function record(gen, ok) {
    const s = store(), t = G.today();
    const g = s.g[gen.id] || (s.g[gen.id] = { n: 0, ok: 0 });
    g.n++; if (ok) g.ok++; g.last = t; g.lastOk = ok ? 1 : 0;
    [gen.w.id, gen.w.track + '-all'].forEach(function (k) {
      const w = s.w[k] || (s.w[k] = { n: 0, ok: 0, rec: [], best: 0, cur: 0 });
      w.n++; if (ok) w.ok++;
      w.rec.push(ok ? 1 : 0); if (w.rec.length > 20) w.rec.shift();
      w.cur = ok ? (w.cur || 0) + 1 : 0; if (w.cur > (w.best || 0)) w.best = w.cur;
      w.last = t;
    });
    G.S.days[t] = (G.S.days[t] || 0) + 1;
    G.save(); if (G.refreshRail) G.refreshRail();
  }
  /* adaptive choice: topics you get wrong, and topics you have not tried, come up more often */
  function choose(gens, lastId) {
    const s = store().g;
    const ws = gens.map(function (g) {
      const st = s[g.id]; let w = 1;
      if (!st) w += 1.5; else { w += 2.5 * (1 - st.ok / st.n); if (st.lastOk === 0) w += 1.5; }
      if (g.id === lastId) w *= 0.15;
      return w;
    });
    let r = Math.random() * ws.reduce(function (a, b) { return a + b; }, 0);
    for (let i = 0; i < gens.length; i++) { r -= ws[i]; if (r <= 0) return gens[i]; }
    return gens[gens.length - 1];
  }
  P.make = function (gen) {
    for (let k = 0; k < 6; k++) { try { const it = gen.fn(); if (it) return it; } catch (e) { if (k === 5) throw e; } }
    return null;
  };

  /* ---------- Claude: a new question from this week's slide text ---------- */
  function slideContext(W) {
    const decks = P.weekDecks(W);
    if (!decks.length) {
      const txt = W.lessons.map(function (id) { const L = G.byId[id]; return L ? L.blocks.filter(function (b) { return b.t === 'key' || b.t === 'text'; }).map(function (b) { return b.html; }).join(' ') : ''; }).join(' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
      return { text: txt.slice(0, 7000), ref: 'lesson notes for ' + W.label };
    }
    const d = R.pick(decks);
    const pages = d.pages.map(function (p, i) { return { i: i, t: (p.t || '').replace(/\s+/g, ' ').trim(), b: p.b }; }).filter(function (p) { return !p.b && p.t.length > 60; });
    if (!pages.length) return { text: '', ref: d.title };
    const span = Math.min(pages.length, 10), start = R.int(0, pages.length - span);
    let text = '';
    const chosen = pages.slice(start, start + span);
    chosen.forEach(function (p) { if (text.length < 6500) text += '[slide ' + (p.i + 1) + '] ' + p.t + '\n'; });
    return { text: text, ref: d.title + ', slides ' + (chosen[0].i + 1) + '–' + (chosen[chosen.length - 1].i + 1), deck: d.id, p: chosen[0].i + 1, title: d.title };
  }
  P.aiQuestion = async function (W) {
    const sample = await G.getSample();
    if (!sample) throw new Error('Claude is not available in this view');
    const T = G.track(W.track), A = P.assess[W.track], ctx = slideContext(W);
    if (!ctx.text) throw new Error('this week has no slide text to work from');
    const kinds = W.track === 'spi' ? ['mcq', 'mcq', 'written'] : W.track === 'py' ? ['mcq', 'text', 'written', 'mcq'] : ['mcq', 'num', 'written', 'num'];
    const kind = R.pick(kinds);
    const shape = {
      mcq: '{"type":"mcq","question":"…","code":"(optional Python)","options":["…","…","…","…"],"answer":<index of the right option>,"explanation":"…","slide":<slide number>}',
      num: '{"type":"num","question":"… (say how many decimal places)","answer":<number>,"decimals":<integer>,"explanation":"… full working …","slide":<slide number>}',
      text: '{"type":"text","question":"What does this print?","code":"<short Python program>","answer":"<exact output, lines separated by \\n>","explanation":"…","slide":<slide number>}',
      written: '{"type":"written","question":"…","marks":<4 to 8>,"scheme":["… (1 mark)","…"],"model":"<model answer>","slide":<slide number>}'
    }[kind];
    const prompt = 'You set practice questions for a first-year student at the University of Exeter, module ' + T.code + ' ' + T.name + '. ' +
      'Assessment: ' + A.short + ' ' + A.how + '\n\nWrite ONE new ' + (kind === 'mcq' ? 'multiple-choice' : kind === 'num' ? 'calculation' : kind === 'text' ? 'trace-the-code' : 'exam-style written') + ' question based on the lecture slides below. ' +
      'Use only facts and methods in these slides. Test understanding: apply, calculate, trace, compare or explain, not "what does slide 3 say". Wrong options must be plausible mistakes. Do not mention slide numbers in the question. ' +
      'Plain text only: Unicode symbols are fine (¬ ∧ ∨ → ∈ ⊆ Σ √ ²), no LaTeX, no HTML, no markdown. ' +
      'Reply with JSON only, exactly this shape:\n' + shape + '\n\nSLIDES (' + ctx.ref + '):\n' + ctx.text;
    const r = await sample(prompt, { modelTier: 'default' });
    const j = P.json(r.text);
    const t = function (x) { return esc(String(x || '')).replace(/\n/g, '<br>'); };
    const src = ctx.deck ? { deck: ctx.deck, p: +j.slide || ctx.p, label: ctx.title + ', slide ' + (+j.slide || ctx.p) } : null;
    let it;
    if (j.type === 'mcq' && Array.isArray(j.options) && j.options.length >= 2 && j.options[+j.answer] !== undefined) it = { k: 'mcq', q: t(j.question), options: j.options.map(t), answer: +j.answer, why: t(j.explanation) };
    else if (j.type === 'num' && isFinite(+j.answer)) it = { k: 'num', q: t(j.question), ans: +j.answer, dp: Math.max(0, Math.min(6, +j.decimals || 0)), why: t(j.explanation) };
    else if (j.type === 'text' && j.answer != null) it = { k: 'text', q: t(j.question), norm: 'lines', accept: [String(j.answer)], why: t(j.explanation) };
    else if (j.type === 'written' && Array.isArray(j.scheme)) it = { k: 'written', q: t(j.question), marks: Math.max(1, Math.min(12, +j.marks || j.scheme.length)), scheme: j.scheme.map(t), model: t(j.model) };
    else throw new Error('the question came back in an unexpected shape');
    if (j.code) it.code = String(j.code);
    it.src = src; it.ai = true;
    return it;
  };

  /* ---------- pages ---------- */
  function ringFor(st) { const p = st.recent == null ? 0 : st.recent; return G.ring(p, st.nrec < 5 ? (st.n ? 'amber' : 'none') : p >= 80 ? 'green' : p >= 50 ? 'amber' : 'red', 44, st.recent == null ? '∞' : p + '%'); }
  function weekCard(W) {
    const st = P.stats(W.id), topics = Array.from(new Set(W.gens.map(function (g) { return g.topic; })));
    return '<a class="wcard t-' + W.track + '" href="#practice-' + W.id + '">' + ringFor(st) + '<div><div class="eyebrow">' + esc(W.label) + '</div><h3>' + esc(W.title) + '</h3><p class="small muted">' + esc(topics.slice(0, 5).join(' · ')) + (topics.length > 5 ? ' …' : '') + '</p>' +
      '<span class="meta">' + (st.n ? st.n + ' answered · best run ' + st.best + ' in a row' : W.gens.length + ' question types, unlimited questions') + '</span></div></a>';
  }
  P.courseSection = function (tid) {
    const ws = P.trackWeeks(tid); if (!ws.length) return '';
    const all = P.stats(tid + '-all');
    return '<h2 class="sec" id="unlimited">Unlimited questions, week by week</h2><p class="muted">Every question is generated fresh from that week’s lecture content, with new numbers and examples each time, in the style ' + G.track(tid).code + ' is assessed. Topics you get wrong come up more often.</p>' +
      '<div class="wgrid">' + ws.map(weekCard).join('') +
      '<a class="wcard mixed t-' + tid + '" href="#practice-' + tid + '-all">' + ringFor(all) + '<div><div class="eyebrow">All weeks</div><h3>Mixed practice</h3><p class="small muted">Questions from every week, interleaved: the best preparation for an exam that mixes topics.</p><span class="meta">' + (all.n ? all.n + ' answered in this module' : 'Start here once you have done a few weeks') + '</span></div></a></div>';
  };
  function renderHub(main) {
    let html = '<div class="col wide"><div class="eyebrow">Practice <i>unlimited</i></div><h1>Unlimited questions</h1><p class="lead">Pick a week. Each question is built fresh from that week’s lecture slides, with new values every time and a worked solution, in the style your module is assessed. Get one wrong and a similar one comes back two questions later.</p>';
    G.tracks.forEach(function (T) {
      if (!P.trackWeeks(T.id).length) return;
      html += '<h2 class="sec t-' + T.id + '"><a href="#course-' + T.id + '">' + esc(T.name) + '</a> <span class="muted small">' + T.code + '</span></h2><p class="small muted">' + esc(P.assess[T.id].short) + '</p><div class="wgrid">' + P.trackWeeks(T.id).map(weekCard).join('') +
        '<a class="wcard mixed t-' + T.id + '" href="#practice-' + T.id + '-all">' + ringFor(P.stats(T.id + '-all')) + '<div><div class="eyebrow">All weeks</div><h3>Mixed practice</h3><p class="small muted">Every week, interleaved.</p></div></a></div>';
    });
    main.innerHTML = html + '</div>';
  }

  P.page = function (arg, main) {
    if (!arg) return renderHub(main);
    const m = /^(py|ml|dm|spi)-(all|\d+)$/.exec(arg);
    if (!m) return renderHub(main);
    const tid = m[1], T = G.track(tid), A = P.assess[tid];
    const W = m[2] === 'all' ? { id: tid + '-all', track: tid, week: 0, label: 'All weeks', title: 'Mixed practice: every week', lessons: [], gens: [].concat.apply([], P.trackWeeks(tid).map(function (w) { return w.gens; })) } : P.find(arg);
    if (!W) return renderHub(main);
    const decks = m[2] === 'all' ? [] : P.weekDecks(W);
    const topics = Array.from(new Set(W.gens.map(function (g) { return m[2] === 'all' ? g.w.label : g.topic; })));
    const col = h('<div class="col prac t-' + tid + '"></div>');
    col.innerHTML = '<div class="crumbs"><a href="#practice">Unlimited questions</a><span><a href="#course-' + tid + '">' + esc(T.name) + '</a></span><span>' + esc(W.label) + '</span></div>' +
      '<div class="phead"><div><div class="eyebrow">' + T.code + ' <i>' + esc(W.label) + ' · unlimited questions</i></div><h1>' + esc(W.title) + '</h1>' +
      '<div class="pstats"></div></div><div class="pring"></div></div>' +
      '<details class="rev assess"><summary>How ' + T.code + ' is assessed, and what these questions train</summary><div><p><b>' + esc(A.short) + '</b></p><p>' + esc(A.how) + '</p><button class="btn ghost small srcbtn" type="button" data-deck="' + A.src.deck + '" data-p="' + A.src.p + '">Source: ' + esc(A.src.label) + ' ↗</button></div></details>' +
      '<div class="chips ptopics"><button class="chip on" type="button" data-t="">All topics</button>' + topics.map(function (t) { return '<button class="chip" type="button" data-t="' + esc(t) + '">' + esc(t) + '</button>'; }).join('') +
      (m[2] === 'all' ? '' : '<button class="chip aichip ai-only" type="button" data-ai="1">✦ New question from your slides (Claude)</button>') + '</div>' +
      '<div class="pq"></div>' +
      (decks.length ? '<div class="pdecks small muted">This week’s slides: ' + decks.map(function (d) { return '<a href="#deck-' + d.id + '">' + esc(d.title) + '</a>'; }).join(' · ') + '</div>' : '') +
      (W.lessons.length ? '<div class="pdecks small muted">Lesson' + (W.lessons.length > 1 ? 's' : '') + ': ' + W.lessons.map(function (id) { const L = G.byId[id]; return L ? '<a href="#' + id + '">' + esc(L.title) + '</a>' : ''; }).join(' · ') + '</div>' : '');
    main.appendChild(col);
    wireSrc(col);
    let filter = '', aiMode = false, lastId = null, count = 0, pending = [];
    const pq = $('.pq', col);
    function drawStats() {
      const st = P.stats(W.id);
      $('.pstats', col).innerHTML = '<span><b>' + st.n + '</b> answered</span><span><b>' + (st.recent == null ? '–' : st.recent + '%') + '</b> right, last ' + (st.nrec || 20) + '</span><span><b>' + st.cur + '</b> in a row (best ' + st.best + ')</span>';
      $('.pring', col).innerHTML = ringFor(st);
    }
    function pool() { return W.gens.filter(function (g) { return !filter || (m[2] === 'all' ? g.w.label === filter : g.topic === filter); }); }
    function nextGen() {
      pending.forEach(function (p) { p.wait--; });
      const due = pending.findIndex(function (p) { return p.wait <= 0 && pool().indexOf(p.g) >= 0; });
      if (due >= 0) { const g = pending[due].g; pending.splice(due, 1); return { g: g, again: true }; }
      return { g: choose(pool(), lastId), again: false };
    }
    async function show(forceGen) {
      pq.innerHTML = '';
      count++;
      const card = h('<div class="cell pcard"><header><span class="tag"></span><h3></h3><span class="qn small muted">Question ' + count + '</span></header><div class="body"></div></div>');
      pq.appendChild(card);
      const body = $('.body', card);
      let item = null, gen = null, again = false;
      if (aiMode && !forceGen) {
        $('.tag', card).textContent = '✦ From your slides'; $('.tag', card).className = 'tag vi';
        $('h3', card).textContent = 'Claude is writing a new question from this week’s slides…';
        body.innerHTML = '<div class="small muted">This takes a few seconds.</div>';
        try { item = await P.aiQuestion(W); } catch (e) {
          body.innerHTML = ''; body.appendChild(h('<div class="callout pk">Claude could not write a question just now (' + esc(e.message || e.code || e) + '). Here is a generated one instead.</div>'));
          aiMode = false; col.querySelectorAll('.ptopics .chip').forEach(function (c) { c.classList.toggle('on', c.dataset.t === ''); });
          setTimeout(function () { show(); }, 1600); return;
        }
        $('h3', card).textContent = 'New question from ' + (item.src ? item.src.label.replace(/, slide.*$/, '') : 'your slides');
        body.innerHTML = '';
        body.appendChild(h('<div class="small muted aiwarn">Written by Claude from your slide text. If anything disagrees with the slide, the slide wins: open it with the button below the answer.</div>'));
      } else {
        const pick = forceGen ? { g: forceGen, again: true } : nextGen();
        gen = pick.g; again = pick.again;
        try { item = P.make(gen); } catch (e) { body.innerHTML = '<div class="callout pk">This question could not be made (' + esc(e.message) + ').</div>'; return addNext(card, null, true); }
        $('.tag', card).textContent = gen.topic; $('.tag', card).className = 'tag ' + (item.k === 'written' ? 'am' : item.k === 'code' ? 'gn' : item.k === 'mcq' ? '' : 'cy');
        $('h3', card).textContent = (again ? 'Another like the one you missed · ' : '') + ({ mcq: 'Choose one', num: 'Calculate', text: item.norm === 'lines' ? 'Trace the code' : 'Short answer', code: 'Write the code', written: 'Written answer' }[item.k]) + (m[2] === 'all' ? ' · ' + gen.w.label : '');
        lastId = gen.id;
      }
      P.render(item, body, function (ok) {
        if (gen) { record(gen, ok); if (!ok) pending.push({ g: gen, wait: 2 }); }
        else if (item.ai) record({ id: W.id + ':ai', w: W }, ok);
        drawStats();
        addNext(card, gen, ok);
      });
    }
    function addNext(card, gen, ok) {
      const row = h('<div class="row pnext"><button class="btn go" type="button">Next question →</button>' + (gen && !ok ? '<button class="btn" type="button" data-k="like">Try one like it now</button>' : '') + '<span class="small muted">' + (gen && !ok ? 'A similar question comes back in two questions anyway.' : '') + '</span></div>');
      $('.body', card).appendChild(row);
      row.firstChild.onclick = function () { show(); window.scrollTo({ top: col.querySelector('.ptopics').offsetTop - 10, behavior: 'smooth' }); };
      const like = row.querySelector('[data-k="like"]'); if (like) like.onclick = function () { pending = pending.filter(function (p) { return p.g !== gen; }); show(gen); };
      try { row.firstChild.focus({ preventScroll: true }); } catch (e) {}
    }
    col.querySelectorAll('.ptopics .chip').forEach(function (c) {
      c.onclick = function () {
        col.querySelectorAll('.ptopics .chip').forEach(function (x) { x.classList.remove('on'); });
        c.classList.add('on');
        if (c.dataset.ai) { aiMode = true; filter = ''; } else { aiMode = false; filter = c.dataset.t; }
        show();
      };
    });
    G.getSample(); setTimeout(function () { G.getSample(); }, 1500);
    drawStats();
    show();
  };

  /* ---------- links from lessons ---------- */
  const origLesson = G.renderLesson;
  if (origLesson) G.renderLesson = function (L, main) {
    origLesson(L, main);
    const W = P.forLesson(L); if (!W) return;
    const st = P.stats(W.id);
    const box = h('<a class="callout gn plink" href="#practice-' + W.id + '"><h4><span class="tag gn">∞ Unlimited questions</span>' + esc(W.label) + ': ' + esc(W.title) + '</h4><p>Endless fresh questions on this week’s slides, in the style ' + G.track(L.track).code + ' is assessed' + (st.n ? ' · ' + st.n + ' answered so far' : '') + '. →</p></a>');
    const foot = main.querySelector('.lfoot');
    if (foot) foot.parentNode.insertBefore(box, foot); else (main.firstChild || main).appendChild(box);
  };
})();
