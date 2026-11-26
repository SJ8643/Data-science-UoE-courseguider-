/* lesson.js – turns lesson data into the interactive page: video, quick checks, code cells, exercises, mastery check, step-by-step mode. */
(function () {
  'use strict';
  const G = window.GUIDE, esc = G.esc;
  const h = function (html) { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
  const $ = function (s, r) { return (r || document).querySelector(s); };
  const WHY = {
    watch: 'Answering questions straight after a video keeps your attention on it and makes it stick.',
    prime: 'Answering before you are taught, or straight after a video, makes the idea stick, even when you get it wrong.',
    code: 'Predict, run, investigate, modify: reading and tracing code comes before writing it.',
    parsons: 'Ordering given lines practises program structure without the typing overhead.',
    bug: 'Finding and explaining an error teaches more than seeing only correct code.',
    explain: 'Explaining a step in your own words exposes the gaps that rereading hides.',
    make: 'The support fades: now you write it, with hints only if you need them.',
    quiz: 'Pulling an answer out of memory strengthens it far more than reading it again.'
  };
  const why = function (k) { return '<span class="why">' + WHY[k] + ' <a href="#research">evidence</a></span>'; };

  /* ---------- videos: played in the page wherever the host allows it ---------- */
  let embedBlocked = false;
  G.canEmbed = function () {
    try {
      if (embedBlocked || window.claude) return false;
      if (location.protocol !== 'http:' && location.protocol !== 'https:') return false;   // YouTube refuses players on file:// pages
      return !/claude|anthropic/i.test(location.hostname);                                  // claude.ai pages block players from other sites
    } catch (e) { return false; }
  };
  function fillFrame(frame, embed) {
    const id = frame.dataset.vid, title = frame.dataset.title, ch = frame.dataset.channel;
    if (embed) {
      const b = h('<button class="vtile" type="button" data-bg="1" aria-label="Play ' + G.attr(title) + '"><span class="play">▶</span><span class="vt">' + esc(title) + '</span><span class="vc">' + esc(ch) + ' · plays here</span></button>');
      b.style.backgroundImage = 'url(https://i.ytimg.com/vi/' + id + '/hqdefault.jpg)';
      b.onclick = function () {
        const f = document.createElement('iframe');
        f.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0&playsinline=1';
        f.title = title;
        f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
        f.allowFullscreen = true;
        f.referrerPolicy = 'strict-origin-when-cross-origin';
        frame.replaceChildren(f);
      };
      frame.replaceChildren(b);
    } else {
      frame.replaceChildren(h('<a class="vtile" href="https://www.youtube.com/watch?v=' + id + '" target="_blank" rel="noopener"><span class="play">▶</span><span class="vt">' + esc(title) + '</span><span class="vc">' + esc(ch) + ' · opens on YouTube</span></a>'));
    }
  }
  const NOEMBED = 'This page can’t play videos inside it, so they open on YouTube. In your desktop copy of the guide they play right here.';
  document.addEventListener('securitypolicyviolation', function (e) {
    if (embedBlocked || !/youtube|ytimg/i.test(String(e.blockedURI || ''))) return;
    embedBlocked = true;
    document.querySelectorAll('.vframe').forEach(function (f) { fillFrame(f, false); });
    document.querySelectorAll('.watch .body').forEach(function (b) { if (!b.querySelector('.vhint')) b.insertBefore(h('<p class="vhint">' + NOEMBED + '</p>'), b.querySelector('.why')); });
  });
  function watchStep(L) {
    const vids = L.videos || [];
    if (!vids.length) return null;
    const embed = G.canEmbed();
    const box = h('<div class="cell watch"><header><span class="tag cy">Watch</span><h3>' + (vids.length > 1 ? 'Watch first: ' + vids.length + ' short videos' : 'Watch first') + '</h3></header><div class="body"><div class="vids"></div>' +
      (embed ? '' : '<p class="vhint">' + NOEMBED + '</p>') + why('watch') + '</div></div>');
    const list = $('.vids', box);
    vids.forEach(function (v, i) {
      const card = h('<div class="vid"><div class="vframe"></div><div class="vmeta"><div><b>' + (vids.length > 1 ? (i + 1) + '. ' : '') + esc(v.title) + '</b><span>' + esc(v.channel) + '</span></div>' +
        (v.note ? '<p class="vnote"><b>Watch for:</b> ' + esc(v.note) + '</p>' : '') + '<label class="wchk"><input type="checkbox"' + (G.S.watched[v.id] ? ' checked' : '') + '> I’ve watched this</label></div></div>');
      const frame = $('.vframe', card);
      frame.dataset.vid = v.id; frame.dataset.title = v.title; frame.dataset.channel = v.channel;
      fillFrame(frame, embed);
      $('input', card).onchange = function (e) {
        const t = G.today();
        if (e.target.checked) { G.S.watched[v.id] = t; G.S.days[t] = (G.S.days[t] || 0) + 1; } else delete G.S.watched[v.id];
        G.save();
      };
      list.appendChild(card);
    });
    return box;
  }

  /* ---------- output rendering ---------- */
  G.showResult = function (res, out, ed, live) {
    if (res.stdout) out.appendChild(h('<pre>' + esc(res.stdout.replace(/\n$/, '')) + '</pre>'));
    if (res.html) { const w = h('<div class="dfwrap"></div>'); w.innerHTML = res.html; out.appendChild(w); }
    if (res.value) out.appendChild(h('<pre class="val">' + esc(res.value) + '</pre>'));
    (res.figs || []).forEach(function (f) {
      const img = document.createElement('img');
      if (typeof f === 'string') img.src = 'data:image/png;base64,' + f;
      else { img.src = f.src; img.width = f.w; img.height = f.h; img.loading = 'lazy'; }
      img.alt = 'Plot produced by the code above';
      out.appendChild(img);
    });
    if (res.error) {
      const e = res.error;
      const box = h('<div class="errbox"><div><b>' + esc(e.type) + '</b>' + (e.line ? ' on line ' + e.line : '') + ': ' + esc(e.msg) + '</div>' +
        (e.src ? '<pre>' + esc(e.src) + '</pre>' : '') + '<div class="small muted">' + esc(G.errorHint(e.type)).replace(/`([^`]+)`/g, '<code>$1</code>') + '</div>' +
        '<div class="row"><button class="btn ai ai-only">Explain this error</button></div><div class="aiout hide"></div></div>');
      $('button', box).onclick = function () {
        G.ask(G.tutor + 'This code raised an error. Explain what the error means, point to the line that caused it, and give one hint for fixing it. Do not rewrite the whole program. Under 150 words.\n\nCode:\n```python\n' + (ed ? ed.get() : '') + '\n```\nError: ' + e.type + (e.line ? ' on line ' + e.line : '') + ': ' + e.msg, $('.aiout', box));
      };
      out.appendChild(box);
      if (ed && e.line) ed.mark(e.line);
    }
    if (!res.stdout && !res.html && !res.value && !(res.figs || []).length && !res.error)
      out.appendChild(h('<pre class="val">(ran with no output: nothing was printed)</pre>'));
  };

  G.execInto = async function (job, out, st, ed, saved) {
    out.innerHTML = '';
    st.className = 'status busy';
    st.textContent = G.py.state === 'ready' ? 'Running…' : 'Starting Python (first run downloads it: a few seconds)…';
    try {
      const res = await G.py.run(job, function (msg) { st.textContent = msg.length > 70 ? msg.slice(0, 70) + '…' : msg; });
      st.className = 'status'; st.textContent = 'Ran live · Python ' + (G.py.version || '');
      G.showResult(res, out, ed, true);
      return res;
    } catch (e) {
      st.className = 'status';
      if (e.message === 'stopped') { st.textContent = 'Stopped.'; return null; }
      if (saved) {
        st.textContent = 'Python is not available here';
        out.appendChild(h('<div class="saved">Live Python could not start in this view (' + esc(e.message) + '). This is the saved output from a real run of the original code. To run edits, copy the code into Jupyter.</div>'));
        G.showResult(saved, out, ed, false);
        return { saved: true, error: saved.error };
      }
      st.textContent = 'Python is not available here';
      out.appendChild(h('<div class="saved">Live Python could not start in this view (' + esc(e.message) + '). Copy the code into Jupyter to run it.</div>'));
      return null;
    }
  };

  /* ---------- which earlier cells has this Python session already run? ---------- */
  const ran = {}, liveCode = {};
  function ranSet(L) { const k = L.id + '@' + G.py.gen; return ran[k] || (ran[k] = new Set()); }
  async function ensureBefore(L, upto, st) {
    const done = ranSet(L);
    for (const b of L.blocks) {
      if (b.i >= upto) break;
      if (b.t !== 'code' || !b.run || b.expect_error || done.has(b.i)) continue;
      st.className = 'status busy'; st.textContent = 'Running the earlier cells of this lesson first…';
      const get = liveCode[L.id + ':' + b.i];
      const r = await G.py.run({ code: get ? get() : b.code, ns: L.id, files: b.files, inputs: b.inputs });
      if (r.error) return { block: b, error: r.error };
      done.add(b.i);
    }
    return null;
  }
  async function runMain(L, b, ed, out, st) {
    try {
      await G.py.boot();
      const bad = await ensureBefore(L, b.i, st);
      if (bad) { st.className = 'status'; st.textContent = ''; out.innerHTML = ''; out.appendChild(h('<div class="errbox"><div>An earlier cell in this lesson (“' + esc(bad.block.title) + '”) raised <b>' + esc(bad.error.type) + '</b>: ' + esc(bad.error.msg) + '. Fix or reset that cell, then run this one again.</div></div>')); return null; }
    } catch (e) { /* fall through: execInto shows the saved output */ }
    const unchanged = ed.get().trim() === b.code.trim();
    const res = await G.execInto({ code: ed.get(), ns: L.id, files: b.files, inputs: readInputs(b, ed) }, out, st, ed, unchanged ? b.out : null);
    if (res && !res.saved && !res.error) ranSet(L).add(b.i);
    return res;
  }
  async function runTemp(L, upto, code, files, inputs, out, st, ed, saved, test) {
    try { await G.py.boot(); await ensureBefore(L, upto, st); } catch (e) {}
    const res = await G.execInto({ code: code, ns: L.id + '~t', base: L.id, files: files, inputs: inputs }, out, st, ed, saved);
    if (test && res && !res.saved && !res.error) {
      try {
        const t = await G.py.run({ code: test, ns: L.id + '~t' });
        out.appendChild(h(t.error
          ? '<div class="fb no"><b class="no">Not yet.</b> The check failed: ' + esc(t.error.msg || t.error.type) + '</div>'
          : '<div class="fb ok"><b class="ok">Check passed.</b> Your code does what was asked.</div>'));
        return { res: res, passed: !t.error };
      } catch (e) {}
    }
    return { res: res, passed: null };
  }
  function readInputs(b, ed) { const box = ed.el.parentNode && ed.el.parentNode.querySelector('.inputs textarea'); return box ? box.value.split('\n').filter(function (x) { return x.length; }) : (b.inputs || []); }

  /* ---------- annotated listing: what each line does ---------- */
  function annotated(b) {
    const lines = b.code.split('\n');
    const goalAt = {}; (b.goals || []).forEach(function (g) { goalAt[g.at] = g.label; });
    let html = '<div class="annot"><table>';
    lines.forEach(function (ln, i) {
      if (goalAt[i] !== undefined) { html += '<tr class="g"><td colspan="3">' + esc(goalAt[i]) + '</td></tr>'; return; }
      if (!ln.trim() && !b.notes[i]) return;
      html += '<tr><td class="n">' + (i + 1) + '</td><td class="c">' + G.highlight(ln) + '</td><td class="x">' + (b.notes[i] || '') + '</td></tr>';
    });
    return h(html + '</table></div>');
  }

  /* ---------- multiple choice helper ---------- */
  function optionButtons(item, onPick) {
    const wrap = h('<div class="opts"></div>');
    const order = item.options.map(function (_, i) { return i; });
    for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = order[i]; order[i] = order[j]; order[j] = t; }
    order.forEach(function (idx, pos) {
      const btn = h('<button class="opt" type="button"><i>' + 'ABCDEF'[pos] + '</i><span>' + item.options[idx] + '</span></button>');
      btn.dataset.idx = idx;
      btn.onclick = function () { onPick(idx, btn, wrap); };
      wrap.appendChild(btn);
    });
    return wrap;
  }
  function gradeOptions(wrap, item, picked) {
    wrap.querySelectorAll('.opt').forEach(function (bn) {
      bn.disabled = true; bn.classList.remove('pick');
      const idx = +bn.dataset.idx;
      if (idx === item.answer) bn.classList.add('right');
      else if (idx === picked) bn.classList.add('wrong');
    });
  }
  function feedback(ok, whyHtml, extra) {
    return h('<div class="fb ' + (ok ? 'ok' : 'no') + '"><b class="' + (ok ? 'ok' : 'no') + '">' + (ok ? 'Correct.' : 'Not quite.') + '</b> ' + (extra || '') + (whyHtml || '') + '</div>');
  }

  /* ---------- block renderers ---------- */
  const R = {};
  R.text = function (L, b) { return h('<div class="prose">' + b.html + '</div>'); };
  R.key = function (L, b) { return h('<div class="keybox">' + b.html + '</div>'); };
  R.fx = function (L, b) { return h('<div><div class="fxbox">' + b.html + '</div>' + (b.caption ? '<div class="cap">' + b.caption + '</div>' : '') + '</div>'); };
  R.slip = function (L, b) { return h('<div class="callout pk"><h4><span class="tag pk">Common slip</span>' + (b.yours ? '<span class="tag vi">seen in your notes</span>' : '') + '</h4>' + b.html + '</div>'); };
  R.feedback = function (L, b) { return h('<div class="callout gn"><h4><span class="tag gn">Feedback</span></h4>' + b.html + '</div>'); };
  R.viz = function (L, b) {
    const box = h('<div class="cell"><header><span class="tag cy">Interactive</span><h3>' + (b.caption || '') + '</h3></header><div class="body"><div class="viz"></div></div></div>');
    try { if (G.viz && G.viz[b.name]) G.viz[b.name]($('.viz', box), b.params || {}); else $('.viz', box).textContent = 'Diagram unavailable.'; }
    catch (e) { $('.viz', box).textContent = 'Diagram could not be drawn.'; }
    return box;
  };

  R.prime = function (L, b) {
    const afterVideo = (L.videos || []).length > 0, qid = L.id + ':' + b.i + ':p';
    const box = h('<div class="cell needs"><header><span class="tag am">' + (afterVideo ? 'Quick check' : 'Warm-up guess') + '</span><h3>' + (afterVideo ? 'What do you think?' : 'Before you read on') + '</h3></header><div class="body"><div class="q">' + b.q + '</div><div class="slot"></div>' + why('prime') + '</div></div>');
    if (G.S.seen[qid]) box.dataset.done = '1';
    const slot = $('.slot', box);
    slot.appendChild(optionButtons(b, function (idx, btn, wrap) {
      const ok = idx === b.answer;
      gradeOptions(wrap, b, idx);
      slot.appendChild(feedback(ok, b.why, ok ? '' : 'That’s useful: a wrong answer now makes the right one stick. It comes back in the mastery check. '));
      G.markAnswer(qid, ok);
      box.dataset.done = '1'; G.stepDone();
    }));
    return box;
  };

  R.code = function (L, b) {
    const box = h('<div class="cell"><header><span class="tag ' + (b.yours ? 'vi' : 'cy') + '">' + (b.yours ? 'Your code' : 'Worked example') + '</span><h3>' + esc(b.title) + '</h3></header><div class="body"></div></div>');
    const body = $('.body', box);
    if (b.intro) body.appendChild(h('<div class="intro">' + b.intro + '</div>'));
    if (b.was) body.appendChild(h('<div class="callout vi small"><h4><span class="tag vi">Changed from your notebook</span></h4>' + b.was + '</div>'));
    let predicted = !b.predict, picked = null, revealed = false, pwrap = null, pslot = null;
    if (b.predict) {
      const st = h('<div class="stage"><div class="stage-h"><b>1 · Predict</b><span>Read the code below. Commit to an answer before you run it.</span></div><div class="q">' + b.predict.q + '</div><div class="slot"></div></div>');
      pslot = $('.slot', st);
      if (b.predict.options) {
        pwrap = optionButtons(b.predict, function (idx, btn, wrap) {
          if (revealed) return;
          wrap.querySelectorAll('.opt').forEach(function (x) { x.classList.remove('pick'); });
          btn.classList.add('pick'); picked = idx; predicted = true;
        });
        pslot.appendChild(pwrap);
      } else {
        const ta = h('<textarea class="free" placeholder="Type your prediction: a rough guess is fine."></textarea>');
        ta.addEventListener('input', function () { predicted = ta.value.trim().length > 0; });
        pslot.appendChild(ta);
      }
      const skip = h('<div class="row"><button class="btn ghost small" type="button">Skip the prediction</button></div>');
      skip.firstChild.onclick = function () { predicted = true; skip.remove(); };
      pslot.appendChild(skip);
      body.appendChild(st);
    }
    const ed = G.editor(b.code, { onRun: function () { run(); }, label: b.title });
    liveCode[L.id + ':' + b.i] = ed.get;
    body.appendChild(h('<div class="stage"><div class="stage-h"><b>' + (b.predict ? '2 · ' : '') + 'Run</b><span>Edit freely. Ctrl/⌘ + Enter runs the cell.</span></div></div>'));
    body.appendChild(ed.el);
    if (b.inputs && b.inputs.length) {
      body.appendChild(h('<div class="inputs"><label>Inputs box: answers for <code>input()</code>, one per line</label><textarea rows="' + Math.min(4, b.inputs.length) + '">' + esc(b.inputs.join('\n')) + '</textarea></div>'));
    }
    const bar = h('<div class="runbar"><button class="btn go" type="button">Run ▶</button><button class="btn" type="button">What each line does</button><button class="btn ai ai-only" type="button">Ask Claude to explain</button><button class="btn ghost" type="button">Reset</button><button class="btn warn hide" type="button">Stop</button><span class="status"></span></div>');
    const btns = bar.querySelectorAll('button'), st = $('.status', bar);
    const out = h('<div class="out"></div>'), ann = h('<div class="hide"></div>'), ai = h('<div class="aiout hide"></div>');
    body.appendChild(bar); body.appendChild(out); body.appendChild(ann); body.appendChild(ai);
    if (!b.run) { btns[0].disabled = true; st.textContent = 'Shown for reading: this cell is not run here'; }
    async function run() {
      if (!b.run) return;
      if (!predicted) { G.toast('Make a prediction first, or press Skip.'); pslot.scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
      btns[0].disabled = true; btns[4].classList.remove('hide');
      const res = b.expect_error
        ? (await runTemp(L, b.i, ed.get(), b.files, b.inputs, out, st, ed, ed.get().trim() === b.code.trim() ? b.out : null)).res
        : await runMain(L, b, ed, out, st);
      btns[0].disabled = false; btns[4].classList.add('hide');
      if (res && b.predict && !revealed) {
        revealed = true;
        if (b.predict.options) {
          if (picked !== null) {
            const ok = picked === b.predict.answer;
            gradeOptions(pwrap, b.predict, picked); pslot.appendChild(feedback(ok, b.predict.why, 'Your prediction: '));
            G.markAnswer(L.id + ':' + b.i + ':pred', ok);
          } else { gradeOptions(pwrap, b.predict, -1); pslot.appendChild(h('<div class="fb">' + b.predict.why + '</div>')); }
        } else pslot.appendChild(h('<div class="fb"><b>What happens:</b> ' + b.predict.why + '</div>'));
      }
    }
    btns[0].onclick = run;
    btns[1].onclick = function () {
      if (!ann.firstChild) { ann.appendChild(annotated(b)); if (ed.get().trim() !== b.code.trim()) ann.appendChild(h('<div class="cap">These notes describe the original code, before your edits.</div>')); }
      ann.classList.toggle('hide');
    };
    btns[2].onclick = function () {
      G.ask(G.tutor + 'The student is on the lesson "' + L.title + '". Explain this code line by line: what each line does and why it is there. Then one question to check understanding. Under 280 words.\n\n```python\n' + ed.get() + '\n```', ai);
    };
    btns[4].onclick = function () { G.py.stop(); ranSet(L).clear(); };
    btns[3].onclick = function () { ed.set(b.code); out.innerHTML = ''; st.textContent = 'Reset to the original code'; ranSet(L).clear(); G.py.reset(L.id); };
    if (b.investigate.length) {
      const s = h('<div class="stage"><div class="stage-h"><b>' + (b.predict ? '3 · ' : '') + 'Investigate</b><span>Answer in your head first, then open.</span></div></div>');
      b.investigate.forEach(function (q) { s.appendChild(h('<details class="rev"><summary>' + q.q + '</summary><div>' + q.a + '</div></details>')); });
      body.appendChild(s);
    }
    if (b.modify.length) {
      const s = h('<div class="stage"><div class="stage-h"><b>' + (b.predict ? '4 · ' : '') + 'Modify</b><span>Edit the code above and run it again.</span></div><div class="modlist"></div></div>');
      b.modify.forEach(function (m) {
        const card = h('<div class="mod"><div>' + m.task + '</div><div class="row"><button class="btn ghost small" type="button">Hint</button><button class="btn ghost small" type="button">Show one solution</button></div></div>');
        const bs = card.querySelectorAll('button');
        bs[0].onclick = function () { if (!card.querySelector('.hintline')) card.appendChild(h('<div class="hintline">' + m.hint + '</div>')); };
        bs[1].onclick = function () {
          if (card.querySelector('.ed')) return;
          const se = G.editor(m.solution, { readOnly: true });
          const sb = h('<div class="runbar"><button class="btn small" type="button">Run this solution ▶</button><span class="status"></span></div>'), so = h('<div class="out"></div>');
          card.appendChild(se.el); card.appendChild(sb); card.appendChild(so);
          sb.firstChild.onclick = function () { runTemp(L, b.i + 1, m.solution, b.files, b.inputs, so, $('.status', sb), null, m.out); };
        };
        $('.modlist', s).appendChild(card);
      });
      body.appendChild(s);
    }
    body.appendChild(h('<div>' + why('code') + '</div>'));
    return box;
  };

  R.bug = function (L, b) {
    const box = h('<div class="cell"><header><span class="tag pk">Fix the bug</span>' + (b.yours ? '<span class="tag vi">from your own work</span>' : '') + '<h3>' + esc(b.title) + '</h3></header><div class="body"></div></div>');
    const body = $('.body', box);
    const ed = G.editor(b.code, { onRun: function () { go(false); } });
    const bar = h('<div class="runbar"><button class="btn go" type="button">Run ▶</button>' + (b.test ? '<button class="btn" type="button" data-k="check">Check my fix</button>' : '') + '<button class="btn ghost" type="button" data-k="hint">Hint</button><button class="btn ghost" type="button" data-k="fix">Show the fix</button><span class="status"></span></div>');
    const out = h('<div class="out"></div>'), extra = h('<div class="grid"></div>');
    body.appendChild(ed.el); body.appendChild(bar); body.appendChild(out); body.appendChild(extra); body.appendChild(h('<div>' + why('bug') + '</div>'));
    function go(check) { return runTemp(L, b.i, ed.get(), b.files, [], out, $('.status', bar), ed, ed.get().trim() === b.code.trim() ? b.out : null, check ? b.test : null); }
    bar.firstChild.onclick = function () { go(false); };
    bar.querySelectorAll('[data-k]').forEach(function (bn) {
      bn.onclick = function () {
        if (bn.dataset.k === 'check') go(true);
        else if (bn.dataset.k === 'hint') { if (!extra.querySelector('.hintline')) extra.appendChild(h('<div class="hintline">' + b.hint + '</div>')); }
        else if (!extra.querySelector('.ed')) { extra.appendChild(G.editor(b.fix, { readOnly: true }).el); extra.appendChild(h('<div class="fb"><b>Why:</b> ' + b.why + '</div>')); }
      };
    });
    return box;
  };

  R.make = function (L, b) {
    const box = h('<div class="cell"><header><span class="tag gn">Make</span><h3>Your turn</h3></header><div class="body"><div class="intro">' + b.task + '</div></div></div>');
    const body = $('.body', box);
    const ed = G.editor(b.starter, { onRun: function () { go(false); } });
    const bar = h('<div class="runbar"><button class="btn go" type="button">Run ▶</button>' + (b.test ? '<button class="btn" type="button" data-k="check">Check</button>' : '') + '<button class="btn ghost" type="button" data-k="hint">Hint (' + b.hints.length + ')</button><button class="btn ghost" type="button" data-k="sol">Show a solution</button><span class="status"></span></div>');
    const out = h('<div class="out"></div>'), extra = h('<div class="grid"></div>');
    if (b.inputs && b.inputs.length) body.appendChild(h('<div class="inputs"><label>Inputs box, one per line</label><textarea rows="2">' + esc(b.inputs.join('\n')) + '</textarea></div>'));
    body.appendChild(ed.el); body.appendChild(bar); body.appendChild(out); body.appendChild(extra); body.appendChild(h('<div>' + why('make') + '</div>'));
    let shown = 0, tried = false;
    function go(check) { tried = true; return runTemp(L, b.i, ed.get(), b.files, b.inputs || [], out, $('.status', bar), ed, null, check ? b.test : null); }
    bar.firstChild.onclick = function () { go(false); };
    bar.querySelectorAll('[data-k]').forEach(function (bn) {
      bn.onclick = function () {
        if (bn.dataset.k === 'check') go(true);
        else if (bn.dataset.k === 'hint') { if (shown < b.hints.length) { extra.appendChild(h('<div class="hintline">Hint ' + (shown + 1) + ': ' + b.hints[shown] + '</div>')); shown++; } }
        else {
          if (!tried && !bn.dataset.sure) { bn.dataset.sure = 1; bn.textContent = 'Not tried yet. Show anyway?'; return; }
          if (!extra.querySelector('.ed')) extra.appendChild(G.editor(b.solution, { readOnly: true }).el);
        }
      };
    });
    return box;
  };

  R.explain = function (L, b) {
    const box = h('<div class="cell"><header><span class="tag am">Explain it</span><h3>In your own words</h3></header><div class="body"><div class="q">' + b.q + '</div><textarea class="free" placeholder="Write one or two sentences as if teaching a friend."></textarea><div class="row"><button class="btn" type="button">Compare with a model answer</button><button class="btn ai ai-only" type="button">Get feedback on mine</button></div><div class="slot"></div><div class="aiout hide"></div>' + why('explain') + '</div></div>');
    const ta = $('textarea', box), bs = box.querySelectorAll('button');
    bs[0].onclick = function () { if (!$('.slot', box).firstChild) $('.slot', box).appendChild(h('<div class="fb"><b>Model answer:</b> ' + b.a + '</div>')); };
    bs[1].onclick = function () {
      if (!ta.value.trim()) { G.toast('Write your explanation first.'); return; }
      G.ask(G.tutor + 'Give brief, kind, specific feedback on the student\'s explanation: what is right, what is missing or wrong, and a one-sentence improved version. Under 120 words.\n\nQuestion: ' + b.q.replace(/<[^>]+>/g, '') + '\nModel answer: ' + b.a.replace(/<[^>]+>/g, '') + '\nStudent answer: ' + ta.value, $('.aiout', box));
    };
    return box;
  };

  R.parsons = function (L, b) {
    const box = h('<div class="cell"><header><span class="tag am">Put in order</span><h3>' + esc(b.title) + '</h3></header><div class="body">' + (b.intro ? '<div class="intro">' + b.intro + '</div>' : '') + '<div class="pz"></div><div class="row"><button class="btn go" type="button">Check order</button><span class="small muted">Drag a line, or use the arrows.</span></div><div class="slot"></div>' + why('parsons') + '</div></div>');
    const pz = $('.pz', box);
    let seed = 0; for (let i = 0; i < L.id.length; i++) seed = (seed * 31 + L.id.charCodeAt(i) + b.i) % 2147483647;
    const order = b.lines.map(function (_, i) { return i; });
    do { for (let i = order.length - 1; i > 0; i--) { seed = (seed * 48271) % 2147483647; const j = seed % (i + 1); const t = order[i]; order[i] = order[j]; order[j] = t; } }
    while (order.length > 1 && order.every(function (v, i) { return b.lines[v] === b.lines[i]; }));
    let dragEl = null;
    order.forEach(function (idx) {
      const row = h('<div class="ln" draggable="true"><button class="mv" type="button" aria-label="Move line up">▲</button><button class="mv" type="button" aria-label="Move line down">▼</button><pre>' + G.highlight(b.lines[idx]) + '</pre></div>');
      row.dataset.text = b.lines[idx];
      const mv = row.querySelectorAll('.mv');
      mv[0].onclick = function () { if (row.previousElementSibling) pz.insertBefore(row, row.previousElementSibling); };
      mv[1].onclick = function () { if (row.nextElementSibling) pz.insertBefore(row.nextElementSibling, row); };
      row.addEventListener('dragstart', function () { dragEl = row; row.classList.add('drag'); });
      row.addEventListener('dragend', function () { row.classList.remove('drag'); dragEl = null; });
      row.addEventListener('dragover', function (e) {
        e.preventDefault(); if (!dragEl || dragEl === row) return;
        const r = row.getBoundingClientRect();
        pz.insertBefore(dragEl, (e.clientY - r.top) > r.height / 2 ? row.nextElementSibling : row);
      });
      pz.appendChild(row);
    });
    $('.btn.go', box).onclick = function () {
      let ok = true;
      Array.prototype.forEach.call(pz.children, function (row, i) { const good = row.dataset.text === b.lines[i]; row.classList.toggle('ok', good); row.classList.toggle('bad', !good); if (!good) ok = false; });
      const slot = $('.slot', box); slot.innerHTML = '';
      slot.appendChild(ok ? feedback(true, b.why || '') : h('<div class="fb no"><b class="no">Not yet.</b> Lines with a red edge are in the wrong place. Ask what must exist before each line can run.</div>'));
    };
    return box;
  };

  /* one question (used in lessons, mastery checks and practice sessions) */
  G.renderQuizItem = function (item, container, onDone, review) {
    if (item.k === 'mcq') {
      container.appendChild(h('<div class="q">' + item.q + '</div>'));
      if (item.code) container.appendChild(G.editor(item.code, { readOnly: true }).el);
      container.appendChild(optionButtons(item, function (idx, btn, wrap) {
        gradeOptions(wrap, item, idx);
        container.appendChild(feedback(idx === item.answer, item.why));
        onDone(idx === item.answer);
      }));
    } else {
      const card = h('<div class="flip"><div class="q">' + item.front + '</div><div class="row"><button class="btn" type="button">Show the answer</button><span class="small muted">Say it to yourself first.</span></div></div>');
      $('button', card).onclick = function () {
        card.querySelector('.row').remove();
        card.appendChild(h('<div class="back">' + item.back + '</div>'));
        const rate = h('<div class="rate"><button class="btn warn" type="button">Missed it</button><button class="btn" type="button">Got it with effort</button><button class="btn" type="button">Knew it</button></div>');
        const g = ['again', 'hard', 'good'];
        rate.querySelectorAll('button').forEach(function (bn, i) { bn.onclick = function () { rate.remove(); onDone(i > 0, g[i]); }; });
        card.appendChild(rate);
      };
      container.appendChild(card);
    }
  };

  /* the mastery check: every miss comes back until it is right */
  R.quiz = function (L, b) {
    const qs = G.lessonQuestions(L), pre = L.id + ':' + b.i + ':';
    const mine = qs.filter(function (q) { return q.kind === 'recall' && q.id.indexOf(pre) === 0; });
    const last = L.blocks.filter(function (x) { return x.t === 'quiz'; }).pop() === b;
    const before = G.S.done[L.id];
    const box = h('<div class="cell mastery' + (before ? '' : ' needs') + '"><header><span class="tag gn">Mastery check</span><h3>Prove it, from memory</h3></header><div class="body">' +
      '<div class="intro"><p>No scrolling back. A question you miss comes back at the end until you get it right' + (last ? ', and any quick check or prediction you missed earlier in this lesson is included' : '') + '. Afterwards, these questions join Refresh knowledge.</p></div>' +
      '<div class="mrun"></div><div class="row mstart"><button class="btn go big" type="button">' + (before ? 'Retake the mastery check' : 'Start the mastery check') + '</button><span class="small muted">' + mine.length + ' questions</span></div>' + why('quiz') + '</div></div>');
    if (before) box.dataset.done = '1';
    const run = $('.mrun', box);
    $('.mstart button', box).onclick = function () {
      $('.mstart', box).remove();
      const extra = last ? qs.filter(function (q) { return q.kind !== 'recall' && !G.isCorrect(q.id); }) : [];
      const queue = mine.concat(extra), total = queue.length, got = {}, tries = {};
      let firstRight = 0;
      const head = h('<div class="mbar"><div class="bar"><i></i></div><span class="mcount"></span></div>'), slot = h('<div class="qitem"></div>');
      run.appendChild(head); run.appendChild(slot);
      function upd() {
        const n = Object.keys(got).length;
        $('.bar > i', head).style.width = (total ? 100 * n / total : 100) + '%';
        $('.mcount', head).textContent = n + ' of ' + total + ' right' + (queue.length ? ' · ' + queue.length + ' to go' : '');
      }
      function next() {
        slot.innerHTML = ''; upd();
        if (!queue.length) return finish();
        const q = queue.shift();
        tries[q.id] = (tries[q.id] || 0) + 1;
        slot.appendChild(h('<div class="qnum">' + (q.kind === 'recall' ? 'Question' : q.kind === 'predict' ? 'A prediction from earlier' : 'A quick check from earlier') + (tries[q.id] > 1 ? ' · another go' : '') + '</div>'));
        G.renderQuizItem(q.item, slot, function (ok) {
          if (tries[q.id] === 1 && ok) firstRight++;
          G.markAnswer(q.id, ok);
          if (ok) got[q.id] = 1; else queue.push(q);
          upd();
          const nb = h('<div class="row"><button class="btn go" type="button">' + (queue.length ? 'Next question →' : 'Finish') + '</button>' + (ok ? '' : '<span class="small muted">This one comes back at the end.</span>') + '</div>');
          nb.firstChild.onclick = next; slot.appendChild(nb); nb.firstChild.focus({ preventScroll: true });
        }, false);
      }
      function finish() {
        G.S.done[L.id] = G.today(); G.save(); G.refreshRail();
        box.dataset.done = '1'; box.classList.remove('needs');
        const m = G.mastery(L), green = G.status(m) === 'green';
        const ls = G.trackLessons(L.track), nextL = ls[ls.indexOf(L) + 1];
        run.innerHTML = '';
        run.appendChild(h('<div class="mdone"><div class="trophy">' + (green ? '★' : '✓') + '</div><h3>' + (green ? 'Lesson mastered' : 'Lesson complete') + '</h3><p>' + firstRight + ' of ' + total + ' right first time, and every one right in the end. Mastery is ' + m.pct + '%' +
          (green ? '.' : ': clear the rest in Strengthen to turn the ring green.') + ' These questions come back in Refresh knowledge tomorrow, then after 3, 7 and 14 days.</p><div class="row" style="justify-content:center">' +
          (nextL ? '<a class="btn go" href="#' + nextL.id + '">Next lesson: ' + esc(nextL.title) + ' →</a>' : '<a class="btn go" href="#exam-' + L.track + '">Exam practice for this course →</a>') + '<a class="btn" href="#course-' + L.track + '">All lessons</a></div></div>'));
        G.stepDone();
        if (G.onProgress) G.onProgress();
      }
      next();
    };
    return box;
  };

  /* ---------- the lesson page ---------- */
  const INTERACTIVE = { watch: 1, prime: 1, code: 1, bug: 1, make: 1, parsons: 1, explain: 1, quiz: 1, viz: 1 };
  G.renderLesson = function (L, main) {
    const S = G.S;
    S.last = L.id; G.save();
    const T = G.track(L.track), ls = G.trackLessons(L.track), k = ls.indexOf(L), nextL = ls[k + 1] || null;
    const nv = (L.videos || []).length, nq = G.lessonQuestions(L).length;
    const col = h('<div class="col lesson t-' + L.track + '"></div>');
    col.appendChild(h('<div class="crumbs"><a href="#course-' + L.track + '">' + esc(T.name) + '</a><span>Lesson ' + (k + 1) + ' of ' + ls.length + '</span></div>'));
    const head = h('<div class="lhead blk"><div class="lrow"><div><h1>' + esc(L.title) + '</h1><div class="lmeta"><span>⏱ about ' + L.mins + ' min</span>' + (nv ? '<span>▶ ' + nv + ' video' + (nv > 1 ? 's' : '') + '</span>' : '') + '<span>✓ ' + nq + ' questions</span><span>' + esc(L.sources) + '</span></div></div><div class="lring"></div></div>' +
      '<div class="goalbox"><b>By the end you can:</b><ul class="goals">' + L.goals.map(function (g) { return '<li>' + g + '</li>'; }).join('') + '</ul></div>' +
      '<label class="focus"><input type="checkbox"' + (S.focus ? ' checked' : '') + '> Step-by-step mode: one step at a time</label></div>');
    col.appendChild(head);
    const ringBox = $('.lring', head);
    function drawRing() { const m = G.mastery(L); ringBox.innerHTML = G.ring(m.pct, G.status(m), 76, m.pct + '%') + '<small>Mastery</small>'; }
    drawRing();

    const steps = []; let cur = [];
    function add(node, t) { node.classList.add('blk'); col.appendChild(node); cur.push(node); if (INTERACTIVE[t]) { steps.push(cur); cur = []; } }
    const w = watchStep(L); if (w) add(w, 'watch');
    L.blocks.forEach(function (b) {
      let node;
      try { node = R[b.t] ? R[b.t](L, b) : null; } catch (e) { node = h('<div class="callout pk">This part could not be shown (' + esc(e.message) + ').</div>'); }
      if (node) add(node, b.t);
    });
    if (cur.length) { if (steps.length) steps[steps.length - 1] = steps[steps.length - 1].concat(cur); else steps.push(cur); }

    const tail = [];
    const strip = G.slideStrip ? G.slideStrip(L) : null;
    if (strip) { strip.classList.add('blk'); col.appendChild(strip); tail.push(strip); }
    const foot = h('<div class="lfoot"><div class="row fstat"></div><div class="row">' + (nq ? '' : '<button class="btn ghost" type="button" data-k="done"></button>') +
      (nextL ? '<a class="btn go" href="#' + nextL.id + '">Next: ' + esc(nextL.title) + ' →</a>' : '<a class="btn go" href="#exam-' + L.track + '">Exam practice for this course →</a>') + '<a class="btn" href="#course-' + L.track + '">All lessons</a></div></div>');
    function drawFoot() {
      const m = G.mastery(L), due = G.lessonDue(L);
      $('.fstat', foot).innerHTML = G.ring(m.pct, G.status(m), 34) + '<span><b>' + m.pct + '% mastered</b> · ' + m.ok + ' of ' + m.n + ' questions right' + (due ? ' · ' + due + ' due for a refresh' : '') + '</span>';
      const d = foot.querySelector('[data-k="done"]'); if (d) d.textContent = S.done[L.id] ? '✓ Completed (click to undo)' : 'Mark lesson complete';
    }
    const doneBtn = foot.querySelector('[data-k="done"]');
    if (doneBtn) doneBtn.onclick = function () { if (S.done[L.id]) delete S.done[L.id]; else S.done[L.id] = G.today(); G.save(); G.refreshRail(); drawFoot(); drawRing(); };
    drawFoot();
    col.appendChild(foot); tail.push(foot);

    /* step-by-step mode: reveal one step at a time, like a video lesson with pauses for questions */
    const bar = h('<div class="nextbar"><div class="nb-in"><div class="nb-prog"><span></span><div class="bar"><i></i></div></div><button class="btn go" type="button"></button></div></div>');
    col.appendChild(bar);
    let pos = Math.max(0, Math.min(S.pos[L.id] || 0, steps.length - 1));
    if (S.done[L.id]) pos = steps.length - 1;
    function on() { return S.focus && steps.length > 1; }
    function blocked() { return (steps[pos] || []).some(function (n) { return n.classList.contains('needs') && !n.dataset.done; }); }
    function updBar() {
      const last = pos >= steps.length - 1, btn = $('button', bar);
      $('.nb-prog span', bar).textContent = 'Step ' + (pos + 1) + ' of ' + steps.length;
      $('.bar > i', bar).style.width = (100 * (pos + 1) / steps.length) + '%';
      if (!last) { const bl = blocked(); btn.disabled = bl; btn.textContent = bl ? 'Answer the question to continue' : 'Continue ↓'; }
      else { btn.disabled = false; btn.textContent = nextL ? 'Next lesson →' : 'Back to the course →'; }
    }
    function apply() {
      const f = on();
      steps.forEach(function (grp, i) { grp.forEach(function (n) { n.classList.toggle('later', f && i > pos); }); });
      tail.forEach(function (n) { n.classList.toggle('later', f && pos < steps.length - 1); });
      bar.classList.toggle('hide', !f);
      updBar();
    }
    $('button', bar).onclick = function () {
      if (pos < steps.length - 1) {
        pos++; S.pos[L.id] = pos; G.save(); apply();
        const first = steps[pos][0]; if (first) first.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else location.hash = nextL ? nextL.id : 'course-' + L.track;
    };
    $('input', head).onchange = function (e) { S.focus = e.target.checked; G.save(); apply(); };
    G.stepDone = updBar;
    G.onProgress = function () { if (col.isConnected) { drawRing(); drawFoot(); updBar(); } };
    apply();
    main.appendChild(col);
  };
})();
