/* app.js – progress and mastery, navigation, dashboard, course paths, practice sessions, playground, method page. */
(function () {
  'use strict';
  const G = window.GUIDE;
  const esc = G.esc;
  const $ = G.$ = function (s, r) { return (r || document).querySelector(s); };
  const h = G.h = function (html) { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
  G.attr = function (s) { return esc(s).replace(/"/g, '&quot;'); };
  G.lessons = window.GUIDE_LESSONS || [];
  G.byId = {}; G.lessons.forEach(function (L) { G.byId[L.id] = L; });
  G.tracks = [
    { id: 'py', name: 'Python Programming', code: 'ECM1400', icon: '{ }', blurb: 'The language itself, from your Programming lectures and workshops: values, loops, functions, collections, errors and APIs.' },
    { id: 'ml', name: 'Machine Learning', code: 'COM1011', icon: '∿', blurb: 'Every COM1011 lecture and workshop so far: data, models, evaluation, probability and hypothesis testing.' },
    { id: 'dm', name: 'Discrete Mathematics', code: 'ECM1415', icon: '∀', blurb: 'Logic, proofs, sets and functions, with truth tables and set laws you can check in code.' },
    { id: 'spi', name: 'Social & Professional Issues', code: 'ECM1407', icon: '⚖', blurb: 'History, security, intellectual property, misuse, contracts and ethics: the cases your essay draws on.' }
  ];
  G.track = function (id) { return G.tracks.find(function (t) { return t.id === id; }); };
  const trackLessons = G.trackLessons = function (id) { return G.lessons.filter(function (L) { return L.track === id; }); };

  /* ---------- saved progress (this browser only) ---------- */
  const KEY = 'codeml-guide-v1';
  let S = {};
  try { const raw = localStorage.getItem(KEY); if (raw) S = JSON.parse(raw) || {}; } catch (e) { S = {}; }
  ['done', 'cards', 'marks', 'correct', 'seen', 'days', 'pos', 'watched'].forEach(function (k) { if (!S[k] || typeof S[k] !== 'object') S[k] = {}; });
  if (typeof S.focus !== 'boolean') S.focus = true;
  if (typeof S.draft !== 'string') S.draft = '';
  G.S = S;
  let saveTimer = null;
  G.save = function () {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* storage unavailable: progress lasts for this visit only */ } }, 250);
  };
  const today = G.today = function () { return Math.floor((Date.now() - new Date().getTimezoneOffset() * 60000) / 86400000); };
  if (!S.v2) {            /* saves from the first version only scheduled quiz cards: carry their right answers over */
    Object.keys(S.cards).forEach(function (id) { const c = S.cards[id]; if (c && c.ok > 0 && !S.correct[id]) S.correct[id] = today(); if (c && !S.seen[id]) S.seen[id] = c.n || 1; });
    S.v2 = 1; G.save();
  }
  G.setTheme = function (t) {
    S.theme = t;
    if (t === 'dark') document.documentElement.dataset.theme = 'dark'; else delete document.documentElement.dataset.theme;
    G.save();
  };
  if (S.theme === 'dark') document.documentElement.dataset.theme = 'dark';

  /* ---------- spaced review schedule ---------- */
  const STEPS = [1, 3, 7, 14, 30, 60], FADE = 7;
  function cardSeen(id, ok) {                  /* met in a lesson */
    const c = S.cards[id] || { s: 0, n: 0, ok: 0 };
    c.n++; if (ok) c.ok++;
    c.s = 0; c.due = today() + (ok ? STEPS[0] : 0);
    S.cards[id] = c;
  }
  function cardReviewed(id, grade) {           /* grade: 'again' | 'hard' | 'good' */
    const c = S.cards[id] || { s: 0, n: 0, ok: 0 };
    c.n++;
    if (grade === 'again') { c.s = 0; c.due = today() + 1; }
    else if (grade === 'hard') { c.ok++; c.due = today() + 1; }
    else { c.ok++; c.s = Math.min(c.s + 1, STEPS.length - 1); c.due = today() + STEPS[c.s]; }
    S.cards[id] = c;
  }

  /* ---------- every question in a lesson counts toward its mastery ring ---------- */
  G.lessonQuestions = function (L) {
    if (L._qs) return L._qs;
    const out = [];
    L.blocks.forEach(function (b) {
      if (b.t === 'prime' && b.options) out.push({ id: L.id + ':' + b.i + ':p', lesson: L, kind: 'check', item: { k: 'mcq', q: b.q, options: b.options, answer: b.answer, why: b.why } });
      else if (b.t === 'code' && b.predict && b.predict.options) out.push({ id: L.id + ':' + b.i + ':pred', lesson: L, kind: 'predict', item: { k: 'mcq', q: b.predict.q, options: b.predict.options, answer: b.predict.answer, why: b.predict.why, code: b.code } });
      else if (b.t === 'quiz') b.items.forEach(function (it, k) { out.push({ id: L.id + ':' + b.i + ':' + k, lesson: L, kind: 'recall', item: it }); });
    });
    return (L._qs = out);
  };
  G.allCards = function () { let out = []; G.lessons.forEach(function (L) { out = out.concat(G.lessonQuestions(L)); }); return out; };
  G.dueCards = function () { const t = today(); return G.allCards().filter(function (c) { const s = S.cards[c.id]; return s && s.due <= t; }); };
  G.isFaded = function (id) { const c = S.cards[id]; return !!(c && c.due + FADE < today()); };
  G.isCorrect = function (id) { return !!S.correct[id] && !G.isFaded(id); };
  G.weakCards = function () { return G.allCards().filter(function (c) { return S.seen[c.id] && !G.isCorrect(c.id); }); };
  G.markAnswer = function (id, ok, opt) {
    opt = opt || {};
    const t = today();
    S.seen[id] = (S.seen[id] || 0) + 1;
    if (ok) S.correct[id] = t; else delete S.correct[id];
    S.days[t] = (S.days[t] || 0) + 1;
    if (opt.review && S.cards[id]) cardReviewed(id, opt.grade || (ok ? 'good' : 'again'));
    else cardSeen(id, ok);
    G.save(); G.refreshRail();
    if (G.onProgress) G.onProgress();
  };
  G.mastery = function (L) {
    const qs = G.lessonQuestions(L);
    let ok = 0, seen = false;
    qs.forEach(function (q) { if (G.isCorrect(q.id)) ok++; if (S.seen[q.id]) seen = true; });
    const n = qs.length;
    return { pct: n ? Math.round(100 * ok / n) : (S.done[L.id] ? 100 : 0), ok: ok, n: n, started: seen || !!S.done[L.id] };
  };
  const statusOf = G.status = function (m) { return !m.started ? 'none' : m.pct >= 80 ? 'green' : m.pct >= 50 ? 'amber' : 'red'; };
  G.lessonDue = function (L) { const t = today(); return G.lessonQuestions(L).filter(function (q) { const c = S.cards[q.id]; return c && c.due <= t; }).length; };
  G.courseStats = function (tid) {
    const ls = trackLessons(tid);
    const r = { ls: ls, ok: 0, n: 0, mastered: 0, started: 0, due: 0, mins: 0, vids: 0 };
    ls.forEach(function (L) {
      const m = G.mastery(L);
      r.ok += m.ok; r.n += m.n; r.due += G.lessonDue(L); r.mins += L.mins || 0; r.vids += (L.videos || []).length;
      if (statusOf(m) === 'green') r.mastered++;
      if (m.started) r.started++;
    });
    r.pct = r.n ? Math.round(100 * r.ok / r.n) : 0;
    r.status = statusOf({ pct: r.pct, started: r.started > 0 });
    return r;
  };
  G.streak = function () { const t = today(); let d = S.days[t] ? t : t - 1, n = 0; while (S.days[d]) { n++; d--; } return { n: n, today: !!S.days[t] }; };
  G.nextIn = function (tid) {
    const L0 = S.last && G.byId[S.last];
    if (L0 && L0.track === tid && statusOf(G.mastery(L0)) !== 'green') return L0;
    return trackLessons(tid).find(function (L) { return statusOf(G.mastery(L)) !== 'green'; }) || null;
  };
  G.nextLesson = function () {
    const L0 = S.last && G.byId[S.last];
    if (L0) { if (statusOf(G.mastery(L0)) !== 'green') return L0; const n = G.nextIn(L0.track); if (n) return n; }
    return G.lessons.find(function (L) { return statusOf(G.mastery(L)) !== 'green'; }) || null;
  };

  /* ---------- mastery ring and status pill ---------- */
  G.ring = function (pct, status, size, label) {
    size = size || 40;
    const sw = Math.max(3, Math.round(size / 11)), r = (size - sw) / 2 - 0.5, c = 2 * Math.PI * r, mid = size / 2;
    const p = Math.max(0, Math.min(100, pct || 0));
    const val = (status !== 'none' && p > 0) ? '<circle class="val" cx="' + mid + '" cy="' + mid + '" r="' + r.toFixed(2) + '" style="stroke-width:' + sw + ';stroke-dasharray:' + c.toFixed(2) + ';stroke-dashoffset:' + (c * (1 - p / 100)).toFixed(2) + '"/>' : '';
    return '<span class="ring r-' + status + '" style="width:' + size + 'px;height:' + size + 'px" role="img" aria-label="' + (status === 'none' ? 'Not started' : p + '% mastered') + '">' +
      '<svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '" aria-hidden="true"><circle class="trk" cx="' + mid + '" cy="' + mid + '" r="' + r.toFixed(2) + '" style="stroke-width:' + sw + '"/>' + val + '</svg>' +
      (label !== undefined && label !== null && label !== '' ? '<b>' + label + '</b>' : '') + '</span>';
  };
  G.pill = function (L) {
    const m = G.mastery(L), st = statusOf(m);
    if (st === 'green') return G.lessonDue(L) ? '<span class="pill p-refresh">Refresh due</span>' : '<span class="pill p-green">Mastered</span>';
    if (st === 'none') return '<span class="pill p-none">Start</span>';
    return '<span class="pill p-' + st + '">In progress · ' + m.pct + '%</span>';
  };

  /* ---------- optional: ask Claude from the page ---------- */
  let samplePromise = null;
  G.getSample = function () {
    if (!samplePromise) {
      if (!(window.claude && typeof window.claude.use === 'function')) return Promise.resolve(null);   // not injected yet: try again later
      samplePromise = window.claude.use('sample').catch(function () { return null; });
      samplePromise.then(function (s) { if (s) document.body.classList.add('has-ai'); });
    }
    return samplePromise;
  };
  G.ask = async function (prompt, target) {
    target.classList.remove('hide'); target.textContent = 'Thinking…';
    try {
      const sample = await G.getSample();
      if (!sample) { target.textContent = 'Claude is not available in this view.'; return; }
      const r = await sample(prompt, { onText: function (p) { if (p && p.text) target.textContent = p.text; } });
      if (r && r.text) target.textContent = r.text;
    } catch (e) {
      const code = e && e.code;
      if (code === 'not_granted') { document.body.classList.remove('has-ai'); target.textContent = 'Asking Claude was not allowed for this page.'; }
      else if (code === 'rate_limited') target.textContent = 'Claude is busy right now. Try again in a minute.';
      else target.textContent = 'Claude could not answer just now' + (e && e.message ? ' (' + e.message + ').' : '.');
    }
  };
  G.tutor = 'You are a patient tutor for a first-year computer science student (Python programming, introductory machine learning, discrete mathematics, and social and professional issues in computing). Use plain English and short sentences. ';

  G.toast = function (msg) {
    const t = h('<div class="toast" role="status">' + esc(msg) + '</div>');
    document.body.appendChild(t); setTimeout(function () { t.remove(); }, 2600);
  };

  /* ---------- navigation rail ---------- */
  function navLink(id, ico, label, on, extra) { return '<a href="#' + id + '"' + (on ? ' class="on"' : '') + '><span class="ico">' + ico + '</span><span>' + label + '</span>' + (extra || '') + '</a>'; }
  function courseOf(r) {
    if (G.byId[r]) return G.byId[r].track;
    const m = /^(course|exam)-(\w+)$/.exec(r); return m ? m[2] : null;
  }
  G.refreshRail = function () {
    const cur = route(), open = courseOf(cur), due = G.dueCards().length;
    let html = '<a class="brand" href="#home"><span class="logo">L</span><span><b>Learning Console</b><small>ECM1400 · COM1011 · ECM1415 · ECM1407</small></span></a><nav class="nav" aria-label="Practice">' +
      navLink('home', '⌂', 'Home', cur === 'home') +
      navLink('review', '↻', 'Refresh knowledge', cur === 'review', due ? '<span class="badge">' + due + '</span>' : '') +
      navLink('strengthen', '▲', 'Strengthen', cur === 'strengthen') +
      (G.P && G.P.weeks && G.P.weeks.length ? navLink('practice', '∞', 'Unlimited questions', cur.indexOf('practice') === 0) : '') +
      '</nav><div class="navg">Courses</div><nav class="nav" aria-label="Courses">';
    G.tracks.forEach(function (T) {
      const cs = G.courseStats(T.id); if (!cs.ls.length) return;
      html += '<a href="#course-' + T.id + '" class="crs t-' + T.id + (cur === 'course-' + T.id ? ' on' : '') + '">' + G.ring(cs.pct, cs.status, 26) + '<span>' + esc(T.name) + '</span><small>' + T.code + '</small></a>';
      if (open === T.id) cs.ls.forEach(function (L) {
        const m = G.mastery(L);
        html += '<a href="#' + L.id + '" class="sub t-' + T.id + (cur === L.id ? ' on' : '') + '">' + G.ring(m.pct, statusOf(m), 18) + '<span>' + esc(L.title) + '</span></a>';
      });
    });
    html += '</nav><div class="navg">Tools</div><nav class="nav" aria-label="Tools">' +
      navLink('slides', '▤', 'Your lecture slides', cur === 'slides' || cur.indexOf('deck-') === 0) +
      navLink('playground', '▶', 'Code playground', cur === 'playground') +
      navLink('research', '※', 'How this teaches', cur === 'research') +
      '</nav><div class="railfoot"><button class="themebtn" type="button" id="themebtn">' + (S.theme === 'dark' ? '☀ Light mode' : '☾ Dark mode') + '</button><span class="small muted" style="padding:0 4px">Progress is saved in this browser.</span></div>';
    $('#rail').innerHTML = html;
    $('#themebtn').onclick = function () { G.setTheme(S.theme === 'dark' ? '' : 'dark'); G.refreshRail(); };
  };

  /* ---------- router ---------- */
  function route() { return (location.hash || '#home').slice(1) || 'home'; }
  G.route = route;
  function render() {
    const r = route();
    document.body.classList.remove('navopen');
    G.onProgress = null; G.stepDone = function () {};
    const main = $('#view');
    main.innerHTML = '';
    let title = null;
    try {
      if (G.byId[r]) { G.renderLesson(G.byId[r], main); title = G.byId[r].title; }
      else if (r === 'review') { renderRefresh(main); title = 'Refresh knowledge'; }
      else if (r === 'strengthen') { renderStrengthen(main); title = 'Strengthen'; }
      else if (r.indexOf('course-') === 0 && G.track(r.slice(7))) { renderCourse(r.slice(7), main); title = G.track(r.slice(7)).name; }
      else if (r.indexOf('exam-') === 0 && G.track(r.slice(5))) { renderExam(r.slice(5), main); title = 'Exam practice'; }
      else if ((r === 'practice' || r.indexOf('practice-') === 0) && G.P && G.P.page) { G.P.page(r.slice(9), main); title = 'Unlimited questions'; }
      else if (r === 'slides') G.renderSlides(main);
      else if (r.indexOf('deck-') === 0) G.renderDeck(r.slice(5), main);
      else if (r === 'playground') renderPlayground(main);
      else if (r === 'research') renderResearch(main);
      else renderHome(main);
    } catch (e) {
      main.innerHTML = '<div class="col"><div class="callout pk">This page could not be shown (' + esc(e.message) + ').</div></div>';
    }
    G.refreshRail();
    window.scrollTo(0, 0);
    document.title = (title ? title + ' · ' : '') + 'Learning Console';
  }
  window.addEventListener('hashchange', render);

  /* ---------- home dashboard ---------- */
  function greeting() { const hr = new Date().getHours(); return hr < 5 ? 'Up late' : hr < 12 ? 'Good morning' : hr < 18 ? 'Good afternoon' : 'Good evening'; }
  function plural(n, one, many) { return n + ' ' + (n === 1 ? one : (many || one + 's')); }
  function renderHome(main) {
    const st = G.streak(), due = G.dueCards().length, weak = G.weakCards().length, next = G.nextLesson();
    const mastered = G.lessons.filter(function (L) { return statusOf(G.mastery(L)) === 'green'; }).length;
    let html = '<div class="col wide"><div class="dash-hero"><div><div class="eyebrow">Your learning console <i>ECM1400 · COM1011 · ECM1415 · ECM1407</i></div><h1>' + greeting() + '.</h1><p class="lead">' +
      (mastered ? mastered + ' of ' + G.lessons.length + ' lessons mastered. ' : 'Watch, check, practise, master: one lesson at a time. ') +
      (due ? plural(due, 'question') + ' due for a refresh today.' : '') + '</p></div>' +
      '<div class="streak' + (st.today ? ' on' : '') + '" title="Days in a row with at least one question answered"><span class="flame" aria-hidden="true">🔥</span><b>' + st.n + '</b><small>day streak</small></div></div>';
    if (next) {
      const T = G.track(next.track), m = G.mastery(next), ls = trackLessons(next.track);
      html += '<a class="continue t-' + next.track + '" href="#' + next.id + '"><span class="cbadge">' + esc(T.icon) + '</span><div><div class="eyebrow">' + (m.started ? 'Continue' : 'Up next') + ' <i>' + esc(T.name) + ' · Lesson ' + (ls.indexOf(next) + 1) + ' of ' + ls.length + '</i></div><h2>' + esc(next.title) + '</h2><span class="muted small">' + esc(next.summary || next.sources) + '</span></div>' +
        G.ring(m.pct, statusOf(m), 56, m.started ? m.pct + '%' : '') + '<span class="btn go">' + (m.started ? 'Continue' : 'Start') + ' →</span></a>';
    } else {
      html += '<div class="continue t-dm"><span class="cbadge">★</span><div><h2>Every lesson is mastered.</h2><span class="muted small">Keep the rings green with Refresh knowledge, and test yourself with exam practice.</span></div></div>';
    }
    html += '<div class="acts">' +
      '<a class="act" href="#review"><span class="ai">↻</span><b>Refresh knowledge</b><span>' + (due ? plural(due, 'question') + ' due today, mixed from every lesson.' : 'Nothing due today. Questions return after 1, 3, 7, 14, 30 and 60 days.') + '</span></a>' +
      '<a class="act" href="#strengthen"><span class="ai">▲</span><b>Strengthen</b><span>' + (weak ? plural(weak, 'question') + ' you missed. Get them right to turn rings green.' : 'Nothing to fix yet. Questions you miss collect here.') + '</span></a>' +
      '<div class="act"><span class="ai">✎</span><b>Exam practice</b><span>15 mixed questions from one module, timed, with a breakdown by lesson.</span><div class="row" style="margin-top:6px">' +
      G.tracks.map(function (T) { return '<a class="chip t-' + T.id + '" href="#exam-' + T.id + '">' + T.code + '</a>'; }).join('') + '</div></div>' +
      (G.P && G.P.weeks && G.P.weeks.length ? '<a class="act" href="#practice"><span class="ai">∞</span><b>Unlimited questions</b><span>Endless fresh questions for every week of every module, built from the lecture slides in the style each module is assessed.</span></a>' : '') + '</div>';
    html += '<h2 class="sec">Your courses</h2><div class="courses">';
    G.tracks.forEach(function (T) {
      const cs = G.courseStats(T.id); if (!cs.ls.length) return;
      html += '<a class="course t-' + T.id + '" href="#course-' + T.id + '"><div class="band"><span class="cicon">' + esc(T.icon) + '</span><span class="ccode">' + T.code + '</span></div><div class="cbody"><h3>' + esc(T.name) + '</h3><p>' + esc(T.blurb) + '</p>' +
        '<div class="cfoot">' + G.ring(cs.pct, cs.status, 36) + '<span><b>' + cs.mastered + '</b> / ' + cs.ls.length + ' lessons mastered' + (cs.due ? ' · ' + cs.due + ' due' : '') + '</span></div></div></a>';
    });
    html += '</div></div>';
    main.innerHTML = html;
  }

  /* ---------- course page: the lesson path ---------- */
  function renderCourse(tid, main) {
    const T = G.track(tid), cs = G.courseStats(tid), next = G.nextIn(tid);
    let html = '<div class="col"><div class="chead t-' + tid + '"><div><div class="eyebrow">' + T.code + ' <i>course</i></div><h1>' + esc(T.name) + '</h1><p class="lead">' + esc(T.blurb) + '</p>' +
      '<div class="cstats"><span>' + cs.ls.length + ' lessons</span><span>about ' + (Math.round(cs.mins / 30) / 2) + ' hours</span><span>' + plural(cs.vids, 'video') + '</span><span>' + cs.mastered + ' mastered</span>' + (cs.due ? '<span>' + cs.due + ' due for a refresh</span>' : '') + '</div>' +
      '<div class="row" style="margin-top:16px">' + (next ? '<a class="btn go big" href="#' + next.id + '">' + (G.mastery(next).started ? 'Continue: ' : 'Start: ') + esc(next.title) + ' →</a>' : '') +
      '<a class="btn" href="#exam-' + tid + '">Exam practice</a>' + (G.P && G.P.trackWeeks && G.P.trackWeeks(tid).length ? '<a class="btn" href="#unlimited" onclick="document.getElementById(\'unlimited\').scrollIntoView({behavior:\'smooth\'});return false">∞ Unlimited questions</a>' : '') + '<a class="btn" href="#slides">Lecture slides</a></div></div>' + G.ring(cs.pct, cs.status, 104, cs.pct + '%') + '</div><ol class="path">';
    cs.ls.forEach(function (L, i) {
      const m = G.mastery(L), nv = (L.videos || []).length;
      html += '<li><a href="#' + L.id + '" class="t-' + tid + '">' + G.ring(m.pct, statusOf(m), 52, i + 1) + '<div><h3>' + esc(L.title) + '</h3><p>' + esc(L.summary || L.sources) + '</p><span class="meta">' + L.mins + ' min · ' + plural(nv, 'video') + ' · ' + m.n + ' questions</span></div>' + G.pill(L) + '</a></li>';
    });
    main.innerHTML = html + '</ol>' + (G.P && G.P.courseSection ? G.P.courseSection(tid) : '') + '</div>';
  }

  /* ---------- practice sessions: refresh, strengthen, exam, pre-test ---------- */
  function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  G.shuffle = shuffle;
  G.runSession = function (cards, box, opts) {
    opts = opts || {};
    const exam = opts.mode === 'exam', pre = opts.mode === 'pretest', requeue = !exam && !pre;
    const queue = cards.slice(), total = cards.length, first = {}, got = {};
    let right = 0, answered = 0, timer = null;
    const t0 = Date.now();
    box.innerHTML = '';
    const wrap = h('<div class="cell blk"><header><span class="tag ' + (exam ? 'vi' : pre ? 'cy' : 'am') + '">' + esc(opts.label || 'Practice') + '</span><h3 class="small" style="font-family:var(--body);font-weight:600"></h3>' + (exam ? '<span class="timer">0:00</span>' : '') + '</header><div class="body"><div class="mbar"><div class="bar"><i></i></div><span class="mcount"></span></div><div class="qitem"></div></div></div>');
    box.appendChild(wrap);
    const slot = $('.qitem', wrap), from = $('h3', wrap);
    if (exam) timer = setInterval(function () {
      if (!wrap.isConnected) { clearInterval(timer); return; }
      const s = Math.floor((Date.now() - t0) / 1000); $('.timer', wrap).textContent = Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
    }, 1000);
    function update() {
      const n = requeue ? Object.keys(got).length : answered;
      $('.bar > i', wrap).style.width = (total ? 100 * n / total : 100) + '%';
      $('.mcount', wrap).textContent = requeue ? n + ' of ' + total + ' right' + (queue.length ? ' · ' + queue.length + ' to go' : '') : 'Question ' + Math.min(answered + 1, total) + ' of ' + total;
    }
    function next() {
      slot.innerHTML = '';
      if (!queue.length) return finish();
      const c = queue.shift(), T = G.track(c.lesson.track);
      from.innerHTML = 'from <a href="#' + c.lesson.id + '">' + esc(c.lesson.title) + '</a> <span class="muted">· ' + esc(T.name) + '</span>';
      update();
      G.renderQuizItem(c.item, slot, function (ok, grade) {
        if (!(c.id in first)) { first[c.id] = ok; if (ok) right++; }
        if (!pre) G.markAnswer(c.id, ok, { review: true, grade: grade });
        answered++;
        if (ok) got[c.id] = 1; else if (requeue) queue.push(c);
        update();
        const nb = h('<div class="row"><button class="btn go" type="button">' + (queue.length ? 'Next →' : 'See results') + '</button>' + (!ok && requeue ? '<span class="small muted">This one comes back at the end.</span>' : '') + '</div>');
        nb.firstChild.onclick = next;
        slot.appendChild(nb); nb.firstChild.focus({ preventScroll: true });
      }, true);
    }
    function finish() {
      if (timer) clearInterval(timer);
      from.textContent = '';
      $('.mbar', wrap).remove();
      const secs = Math.round((Date.now() - t0) / 1000);
      let html = '<div class="mdone"><div class="trophy">' + (right === total ? '★' : '✓') + '</div><h3>' + (exam ? 'Exam practice finished' : pre ? 'Pre-test finished' : 'Session complete') + '</h3><p><b>' + right + ' of ' + total + '</b> right first time' +
        (exam ? ', in ' + Math.floor(secs / 60) + ' min ' + (secs % 60) + ' s' : '') + '. ' +
        (requeue ? 'Everything you missed was repeated until you got it, and returns tomorrow.' : pre ? 'This did not change your rings. The lessons below teach what you just met.' : 'Lessons you dropped marks on are at the top: revise those first.') + '</p></div>';
      if (!requeue) {
        const by = {};
        cards.forEach(function (c) { const k = c.lesson.id; by[k] = by[k] || { L: c.lesson, n: 0, ok: 0 }; by[k].n++; if (first[c.id]) by[k].ok++; });
        const rows = Object.keys(by).map(function (k) { return by[k]; }).sort(function (a, b) { return a.ok / a.n - b.ok / b.n; });
        html += '<div class="breakdown">' + rows.map(function (r) {
          const p = Math.round(100 * r.ok / r.n);
          return '<a href="#' + r.L.id + '">' + G.ring(p, statusOf({ pct: p, started: true }), 26) + esc(r.L.title) + '<span>' + r.ok + ' / ' + r.n + '</span></a>';
        }).join('') + '</div>';
      }
      html += '<div class="row" style="justify-content:center;margin-top:14px">' + (opts.again ? '<button class="btn go" type="button" data-k="again">' + esc(opts.againLabel || 'Another set') + '</button>' : '') +
        (exam ? '<a class="btn" href="#strengthen">Strengthen what I missed</a>' : '') + '<a class="btn ghost" href="' + (opts.backHref || '#home') + '">' + esc(opts.backLabel || 'Back to home') + '</a></div>';
      slot.innerHTML = html;
      const again = slot.querySelector('[data-k="again"]'); if (again) again.onclick = opts.again;
    }
    next();
    box.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  function sessHead(eyebrow, title, lead, stats, extra) {
    return '<div class="sess-head"><div class="eyebrow">' + eyebrow + '</div><h1>' + title + '</h1><p class="lead">' + lead + '</p><div class="stats">' +
      stats.map(function (s) { return '<div class="stat"><b>' + s[0] + '</b><span>' + s[1] + '</span></div>'; }).join('') + '</div>' + (extra || '') + '</div>';
  }
  function renderRefresh(main) {
    const all = G.allCards(), met = all.filter(function (c) { return S.cards[c.id]; }), due = shuffle(G.dueCards());
    const strong = met.filter(function (c) { return S.cards[c.id].s >= 3; }).length;
    const col = h('<div class="col">' + sessHead('Spaced practice <i>mixed topics, from memory</i>', 'Refresh knowledge',
      'Questions return after 1, 3, 7, 14, 30 and 60 days, mixed from every lesson. Working out which idea a question needs is part of the practice, and it keeps your rings green.',
      [[due.length, 'due today'], [met.length, 'questions in your schedule'], [strong, 'at a 14-day gap or longer'], [all.length, 'in the whole guide']],
      '<div class="row"><button class="btn go big" type="button" data-k="due"' + (due.length ? '' : ' disabled') + '>' + (due.length ? 'Start: ' + plural(Math.min(due.length, 20), 'question') : 'Nothing due today') + '</button>' +
      '<button class="btn" type="button" data-k="mix"' + (met.length ? '' : ' disabled') + '>Extra practice: 10 I have met</button><button class="btn ghost" type="button" data-k="pre">Pre-test: 10 from lessons I have not started</button></div>' +
      (due.length > 20 ? '<p class="why">' + (due.length - 20) + ' more are due: start another session after this one.</p>' : '') +
      '<p class="why">The pre-test asks about lessons you have not started and does not change your rings. A wrong guess now makes that lesson stick better later (<a href="#research">pretesting</a>).</p>') + '<div class="run"></div></div>');
    main.appendChild(col);
    const run = $('.run', col);
    col.querySelector('[data-k="due"]').onclick = function () { G.runSession(due.slice(0, 20), run, { mode: 'refresh', label: 'Refresh' }); };
    col.querySelector('[data-k="mix"]').onclick = function () { G.runSession(shuffle(met.slice()).slice(0, 10), run, { mode: 'refresh', label: 'Extra practice' }); };
    col.querySelector('[data-k="pre"]').onclick = function () {
      const fresh = all.filter(function (c) { return !G.mastery(c.lesson).started; });
      G.runSession(shuffle((fresh.length >= 5 ? fresh : all).slice()).slice(0, 10), run, { mode: 'pretest', label: 'Pre-test' });
    };
  }
  function renderStrengthen(main) {
    const weak = G.weakCards();
    const lessonsW = G.lessons.filter(function (L) { const m = G.mastery(L); return m.started && statusOf(m) !== 'green'; })
      .sort(function (a, b) { return G.mastery(a).pct - G.mastery(b).pct; });
    const rank = {}; lessonsW.forEach(function (L, i) { rank[L.id] = i; });
    function pick() {
      const sorted = shuffle(weak.slice()).sort(function (a, b) { return (rank[a.lesson.id] === undefined ? 99 : rank[a.lesson.id]) - (rank[b.lesson.id] === undefined ? 99 : rank[b.lesson.id]); });
      return shuffle(sorted.slice(0, 12));
    }
    const col = h('<div class="col">' + sessHead('Fix weak spots <i>your missed questions first</i>', 'Strengthen',
      'Every question you have missed, or left to fade, collects here. Up to 12 at a time, weakest lessons first, mixed together; a miss comes back until you get it.',
      [[weak.length, 'questions to strengthen'], [lessonsW.length, 'lessons below green']],
      '<div class="row"><button class="btn go big" type="button"' + (weak.length ? '' : ' disabled') + '>' + (weak.length ? 'Start: ' + plural(Math.min(weak.length, 12), 'question') : 'Nothing to strengthen yet') + '</button><a class="btn ghost" href="#review">Refresh knowledge</a></div>') +
      '<div class="run"></div>' + (lessonsW.length ? '<section class="block"><h2>Lessons below green</h2><div class="breakdown">' + lessonsW.map(function (L) {
        const m = G.mastery(L); return '<a href="#' + L.id + '">' + G.ring(m.pct, statusOf(m), 26) + esc(L.title) + '<span>' + m.pct + '%</span></a>';
      }).join('') + '</div></section>' : '') + '</div>');
    main.appendChild(col);
    const run = $('.run', col);
    $('.btn.go', col).onclick = function () { G.runSession(pick(), run, { mode: 'refresh', label: 'Strengthen', backHref: '#strengthen', backLabel: 'Back to Strengthen' }); };
  }
  function renderExam(tid, main) {
    const T = G.track(tid), pool = [];
    trackLessons(tid).forEach(function (L) { pool.push.apply(pool, G.lessonQuestions(L)); });
    const started = pool.filter(function (c) { return G.mastery(c.lesson).started; });
    const col = h('<div class="col t-' + tid + '">' + sessHead(T.code + ' <i>exam practice</i>', esc(T.name) + ': exam practice',
      'Fifteen questions drawn from across the module and mixed together, against the clock. You see each answer straight away; at the end, a breakdown by lesson shows what to revise.',
      [[pool.length, 'questions in this module'], [started.length, 'from lessons you have started']],
      '<div class="row"><button class="btn go big" type="button">Start 15 questions</button><label class="focus"><input type="checkbox"' + (started.length < 15 ? ' checked' : '') + '> Include lessons I have not started</label></div>') +
      '<div class="run"></div></div>');
    main.appendChild(col);
    const run = $('.run', col), all = $('input', col);
    function start() {
      const src = (all.checked || started.length < 5) ? pool : started, groups = {};
      src.forEach(function (c) { (groups[c.lesson.id] = groups[c.lesson.id] || []).push(c); });
      const keys = shuffle(Object.keys(groups)), picked = [];
      keys.forEach(function (k) { shuffle(groups[k]); });
      while (picked.length < 15 && keys.some(function (k) { return groups[k].length; })) keys.forEach(function (k) { if (picked.length < 15 && groups[k].length) picked.push(groups[k].pop()); });
      G.runSession(shuffle(picked), run, { mode: 'exam', label: 'Exam practice', again: start, againLabel: 'Another 15', backHref: '#course-' + tid, backLabel: 'Back to the course' });
    }
    $('.btn.go', col).onclick = start;
  }

  /* ---------- playground ---------- */
  function renderPlayground(main) {
    const files = ['week01_development.csv', 'cars_dataset.csv', 'marks.csv', 'spam.csv', 'AmesHousing_full.csv', 'words.txt', 'train-images-idx3-ubyte.gz', 'train-labels-idx1-ubyte.gz'];
    const start = S.draft || '# Paste any code here: yours, a workshop cell, a line from a lecture slide.\nimport numpy as np\n\nmarks = np.array([52, 67, 71, 48, 90])\nprint("mean:", marks.mean())\nprint("above 60:", marks[marks > 60])\n';
    const col = h('<div class="col"><div class="lhead"><div class="eyebrow">Tool <i>free practice</i></div><h1>Code playground</h1><p class="lead" style="margin:0">Run anything. Tick a dataset to make that file available to <code>pd.read_csv()</code> or <code>open()</code>.</p></div>' +
      '<div class="cell blk"><div class="body"><div class="row small" id="pg-files"></div><div id="pg-ed"></div>' +
      '<div class="inputs"><label for="pg-in">Inputs box: answers for <code>input()</code>, one per line</label><textarea id="pg-in" rows="2"></textarea></div>' +
      '<div class="runbar"><button class="btn go" id="pg-run">Run ▶</button><button class="btn ghost" id="pg-stop">Stop</button><button class="btn ai ai-only" id="pg-ai">Explain each line</button><span class="status" id="pg-st"></span></div>' +
      '<div class="out" id="pg-out"></div><div class="aiout hide" id="pg-aiout"></div></div></div></div>');
    main.appendChild(col);
    const fb = $('#pg-files', col);
    files.forEach(function (f, i) { fb.appendChild(h('<label style="display:inline-flex;gap:6px;align-items:center"><input type="checkbox" id="pgf' + i + '" value="' + f + '"> <code>' + f + '</code></label>')); });
    const ed = G.editor(start, { onRun: run, onChange: function (v) { S.draft = v; G.save(); } });
    $('#pg-ed', col).appendChild(ed.el);
    const out = $('#pg-out', col), st = $('#pg-st', col);
    async function run() {
      const chosen = Array.prototype.slice.call(fb.querySelectorAll('input:checked')).map(function (x) { return x.value; });
      const inputs = $('#pg-in', col).value.split('\n').filter(function (x) { return x.length; });
      await G.execInto({ code: ed.get(), ns: 'playground', files: chosen, inputs: inputs }, out, st, ed, null);
    }
    $('#pg-run', col).onclick = run;
    $('#pg-stop', col).onclick = function () { G.py.stop(); st.className = 'status'; st.textContent = 'Stopped. Variables were cleared.'; };
    $('#pg-ai', col).onclick = function () {
      G.ask(G.tutor + 'Explain this Python code line by line. For each line (or small group of lines) say what it does and why it is there. Finish with a two-sentence summary and one question the student should now be able to answer. Under 300 words.\n\n```python\n' + ed.get() + '\n```', $('#pg-aiout', col));
    };
  }

  /* ---------- method page ---------- */
  function renderResearch(main) {
    const R = G.research;
    let html = '<div class="col"><div class="lhead"><div class="eyebrow">Method <i>the evidence behind the layout</i></div><h1>How this teaches</h1><p class="lead" style="margin:0">' + R.intro + '</p></div>';
    R.techniques.forEach(function (t) {
      html += '<div class="tech"><h3><span class="tag ' + t.color + '">' + esc(t.tag) + '</span>' + esc(t.name) + '</h3><p style="margin:0">' + t.claim + '</p><p class="here" style="margin:0"><b>In this guide:</b> ' + t.here + '</p><ul class="refs">';
      t.refs.forEach(function (k) { const p = R.papers[k]; if (p) html += '<li>' + p.cite + ' <a href="' + p.url + '" target="_blank" rel="noopener">' + (p.doi ? 'doi' : 'find paper') + '</a></li>'; });
      html += '</ul></div>';
    });
    html += '<div class="tech"><h3>Limits worth knowing</h3><div>' + R.limits + '</div></div></div>';
    main.innerHTML = html;
  }

  /* ---------- start ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    $('#menu').onclick = function () { document.body.classList.toggle('navopen'); };
    $('#rail').addEventListener('click', function (e) { if (e.target.closest('a')) document.body.classList.remove('navopen'); });
    render();
    G.getSample();
    window.addEventListener('load', function () { G.getSample(); });
    setTimeout(function () { G.getSample(); }, 3000);
  });
})();
