/* slides.js – your lecture slides: library, deck pages, viewer, and automatic matching to lessons. */
(function () {
  'use strict';
  const G = window.GUIDE, esc = G.esc;
  const h = function (html) { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
  const SL = window.SLIDES || { decks: [], generated: '' };
  const byId = {}; SL.decks.forEach(function (d) { byId[d.id] = d; });
  const MOD = { ml: 'COM1011 Machine Learning', py: 'ECM1400 Programming', dm: 'ECM1415 Discrete Mathematics', spi: 'ECM1407 Social and Professional Issues' };
  const packs = {}, waits = {};
  G.pack = function (id, arr) { packs[id] = arr; };
  function loadPack(id) {
    if (packs[id]) return Promise.resolve(packs[id]);
    if (!waits[id]) waits[id] = new Promise(function (res, rej) {
      const s = document.createElement('script'); s.src = 'slides/' + id + '.js';
      s.onload = function () { packs[id] ? res(packs[id]) : rej(new Error('empty')); };
      s.onerror = function () { delete waits[id]; rej(new Error('Could not load slides')); };
      document.head.appendChild(s);
    });
    return waits[id];
  }
  function thumb(d, p, w, label) {
    const sc = w / d.tw, hh = d.th * sc, col = (p - 1) % d.cols, row = Math.floor((p - 1) / d.cols);
    const b = h('<button class="thumb" type="button"><span>' + esc(label || String(p)) + '</span></button>');
    b.title = d.title + ', slide ' + p; b.setAttribute('aria-label', 'Open ' + d.title + ', slide ' + p);
    b.style.width = w + 'px'; b.style.height = hh.toFixed(1) + 'px';
    b.style.backgroundImage = 'url(slides/' + d.id + '.webp)';
    b.style.backgroundSize = (d.cols * w) + 'px auto';
    b.style.backgroundPosition = (-col * w) + 'px ' + (-row * hh).toFixed(1) + 'px';
    b.onclick = function () { G.openViewer(d.id, p); };
    return b;
  }

  G.openViewer = function (id, p) {
    const d = byId[id]; if (!d) return;
    let cur = Math.max(1, Math.min(d.n, p)), txt = false;
    const v = h('<div id="viewer" role="dialog" aria-modal="true" aria-label="Slide viewer"><header><b></b><button class="btn ghost" type="button" data-k="t">Slide text</button><a class="btn ghost" href="#deck-' + d.id + '">Whole deck</a><button class="btn" type="button" data-k="x">Close ✕</button></header><div class="stagev"><img alt=""><div class="txt hide"></div></div><footer><button class="btn" type="button" data-k="p">← Previous</button><span class="count"></span><button class="btn" type="button" data-k="n">Next →</button><span class="small muted">Arrow keys move · Esc closes</span></footer></div>');
    const img = v.querySelector('img'), tx = v.querySelector('.txt');
    function show() {
      v.querySelector('header b').textContent = d.title + ' · ' + MOD[d.module] + (d.week ? ' · week ' + d.week : '');
      v.querySelector('.count').textContent = cur + ' / ' + d.n;
      tx.textContent = d.pages[cur - 1].t || '(no text on this slide)';
      img.alt = d.title + ', slide ' + cur;
      loadPack(d.id).then(function (arr) { img.src = 'data:image/webp;base64,' + arr[cur - 1]; }).catch(function () { img.alt = 'This slide could not be loaded.'; });
    }
    function close() { document.removeEventListener('keydown', key); window.removeEventListener('hashchange', close); v.remove(); }
    function key(e) {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight' && cur < d.n) { cur++; show(); }
      else if (e.key === 'ArrowLeft' && cur > 1) { cur--; show(); }
    }
    v.addEventListener('click', function (e) {
      const k = e.target.closest('[data-k]'); if (!k) return;
      if (k.dataset.k === 'x') close();
      else if (k.dataset.k === 'p' && cur > 1) { cur--; show(); }
      else if (k.dataset.k === 'n' && cur < d.n) { cur++; show(); }
      else if (k.dataset.k === 't') { txt = !txt; tx.classList.toggle('hide', !txt); }
    });
    document.addEventListener('keydown', key);
    window.addEventListener('hashchange', close);
    document.body.appendChild(v); show(); v.querySelector('[data-k="x"]').focus();
  };

  G.renderSlides = function (main) {
    const total = SL.decks.reduce(function (a, d) { return a + d.n; }, 0);
    const col = h('<div class="col"><div class="lhead"><div class="eyebrow">Library <i>scanned from your Data folder on ' + esc(SL.generated) + '</i></div><h1>Your lecture slides</h1>' +
      '<p class="lead">Every PDF in your four module folders: ' + SL.decks.length + ' decks, ' + total + ' pages. Each lesson shows the slides that match its topic, found automatically from the words on each slide.</p>' +
      '<input class="search" type="search" placeholder="Search every slide: gini, p-value, docstring…" aria-label="Search all slides"></div><div class="res blk"></div><div class="lib"></div></div>');
    const lib = col.querySelector('.lib'), res = col.querySelector('.res'), inp = col.querySelector('.search');
    ['py', 'ml', 'dm', 'spi'].forEach(function (m) {
      const ds = SL.decks.filter(function (d) { return d.module === m; }); if (!ds.length) return;
      const sec = h('<section class="block"><h2>' + MOD[m] + '</h2><div class="deckcards"></div></section>');
      ds.forEach(function (d) {
        const c = h('<a class="deckcard" href="#deck-' + d.id + '"><div class="cv"></div><div class="m"><b>' + esc(d.title) + '</b><span>' + (d.week ? 'Week ' + d.week + ' · ' : '') + d.n + ' ' + (d.kind === 'handout' ? 'pages' : 'slides') + '</span></div></a>');
        const t = thumb(d, 1, 280); t.tabIndex = -1; t.onclick = null; t.style.pointerEvents = 'none';
        c.querySelector('.cv').appendChild(t);
        sec.querySelector('.deckcards').appendChild(c);
      });
      lib.appendChild(sec);
    });
    let tm = null;
    inp.addEventListener('input', function () { clearTimeout(tm); tm = setTimeout(search, 180); });
    function search() {
      const q = inp.value.toLowerCase().trim(); res.innerHTML = '';
      if (q.length < 2) { lib.classList.remove('hide'); return; }
      lib.classList.add('hide');
      const terms = q.split(/\s+/), hits = [];
      SL.decks.forEach(function (d) {
        d.pages.forEach(function (pg, i) { if (pg.b) return; const t = pg.t.toLowerCase(); if (terms.every(function (w) { return t.indexOf(w) >= 0; })) hits.push([d, i + 1]); });
      });
      res.appendChild(h('<p class="muted small">' + hits.length + ' slide' + (hits.length === 1 ? '' : 's') + ' mention “' + esc(q) + '”' + (hits.length > 60 ? '. Showing the first 60.' : '.') + '</p>'));
      const g = h('<div class="tgrid"></div>');
      hits.slice(0, 60).forEach(function (x) { g.appendChild(thumb(x[0], x[1], 210, x[0].title.slice(0, 22) + ' · ' + x[1])); });
      res.appendChild(g);
    }
    main.appendChild(col);
  };

  G.renderDeck = function (id, main) {
    const d = byId[id];
    if (!d) { main.innerHTML = '<div class="col"><h1>Deck not found</h1><p><a href="#slides">Back to your slides</a></p></div>'; return; }
    const users = G.lessons.filter(function (L) { return (L.decks || []).indexOf(id) >= 0; });
    const col = h('<div class="col"><div class="lhead"><div class="eyebrow">' + MOD[d.module] + (d.week ? ' <i>week ' + d.week + '</i>' : '') + '</div><h1>' + esc(d.title) + '</h1><p class="muted small" style="margin:0">' + esc(d.file) + ' · ' + d.n + ' pages</p>' +
      (users.length ? '<div class="row"><span class="small muted">Taught in:</span>' + users.map(function (L) { return '<a class="btn small" href="#' + L.id + '">' + esc(L.title) + '</a>'; }).join('') + '</div>' : '') +
      '<label class="small muted"><input type="checkbox" checked> Hide animation build-up steps (slides repeated in full on the next page)</label></div><div class="tgrid blk"></div></div>');
    const grid = col.querySelector('.tgrid'), cb = col.querySelector('input');
    function draw() { grid.innerHTML = ''; d.pages.forEach(function (pg, i) { if (cb.checked && pg.b) return; grid.appendChild(thumb(d, i + 1, 220)); }); }
    cb.onchange = draw; draw(); main.appendChild(col);
  };

  /* automatic matching: score every slide by how often it uses the lesson's key terms */
  function score(text, kws) {
    const t = text.toLowerCase(); let s = 0;
    kws.forEach(function (k) {
      const kk = k.toLowerCase(); let i = t.indexOf(kk), c = 0;
      while (i >= 0 && c < 6) { c++; i = t.indexOf(kk, i + kk.length); }
      if (c) s += (1 + Math.log2(c)) * (kk.length > 5 ? 1.3 : 1);
    });
    return s;
  }
  G.slideStrip = function (L) {
    if (!SL.decks.length) return null;
    const mod = L.track, own = L.decks || [], cands = [];
    SL.decks.forEach(function (d) {
      if (d.module !== mod) return;
      const bonus = own.indexOf(d.id) >= 0 ? 1.8 : 1;
      d.pages.forEach(function (pg, i) { if (pg.b || !pg.t) return; const s = score(pg.t, L.keywords || []) * bonus; if (s >= 2.2) cands.push({ d: d, p: i + 1, s: s }); });
    });
    cands.sort(function (a, b) { return b.s - a.s; });
    const top = cands.slice(0, 14).sort(function (a, b) { return SL.decks.indexOf(a.d) - SL.decks.indexOf(b.d) || a.p - b.p; });
    const box = h('<div class="cell"><header><span class="tag cy">Your slides</span><h3>Matching slides from your lectures</h3></header><div class="body"><p class="small muted" style="margin:0">Picked automatically: these slides use this lesson’s key terms. Click one to read it full size.</p><div class="strip"></div><div class="row"></div></div></div>');
    const strip = box.querySelector('.strip'), row = box.querySelector('.row');
    if (!top.length) strip.appendChild(h('<p class="muted small">No slide matched this lesson’s terms.</p>'));
    top.forEach(function (c) { strip.appendChild(thumb(c.d, c.p, 230, c.d.title.slice(0, 20) + ' · ' + c.p)); });
    own.forEach(function (id) { const d = byId[id]; if (d) row.appendChild(h('<a class="btn ghost small" href="#deck-' + id + '">Open the full deck: ' + esc(d.title) + ' →</a>')); });
    return box;
  };
})();
