/* viz.js – small interactive diagrams drawn on canvas. */
(function () {
  'use strict';
  const G = window.GUIDE, V = G.viz = {};
  const C = { cy: '#4dd8ff', am: '#ffb454', pk: '#ff6fa3', gn: '#7df0b0', vi: '#b79cff', ink: '#e6ecff', ink2: '#aab7df', ink3: '#7180ad', grid: '#18223f', axis: '#37447a' };
  const pct = function (v) { return (100 * v).toFixed(1) + '%'; };
  const f3 = function (v) { return (Math.abs(v) < 1e-3 && v !== 0) ? v.toExponential(3) : String(+v.toFixed(4)); };

  function canvas(el, w, hh) {
    const c = document.createElement('canvas'), dpr = Math.min(2, window.devicePixelRatio || 1);
    c.width = Math.round(w * dpr); c.height = Math.round(hh * dpr); el.appendChild(c);
    const x = c.getContext('2d'); x.scale(dpr, dpr);
    return { c: c, x: x, w: w, h: hh };
  }
  function box(el, cls) { const d = document.createElement('div'); d.className = cls; el.appendChild(d); return d; }
  let uid = 0;
  function slider(ctl, label, min, max, step, val, fmt, on) {
    const id = 'vz' + (++uid), l = document.createElement('label');
    l.setAttribute('for', id);
    l.innerHTML = '<span>' + label + '</span><input type="range" id="' + id + '" min="' + min + '" max="' + max + '" step="' + step + '" value="' + val + '"><output></output>';
    const inp = l.querySelector('input'), out = l.querySelector('output'), f = fmt || String;
    const show = function () { out.textContent = f(+inp.value); };
    inp.addEventListener('input', function () { show(); on(); });
    ctl.appendChild(l); show();
    return { get: function () { return +inp.value; }, set: function (v) { inp.value = v; show(); } };
  }
  function button(parent, label, on) { const b = document.createElement('button'); b.type = 'button'; b.className = 'btn small'; b.textContent = label; b.onclick = on; parent.appendChild(b); return b; }
  function niceTicks(lo, hi, n) {
    const raw = (hi - lo) / (n || 5), mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const step = [1, 2, 2.5, 5, 10].map(function (m) { return m * mag; }).find(function (s) { return s >= raw; }) || raw;
    const out = []; for (let v = Math.ceil(lo / step - 1e-9) * step; v <= hi + 1e-9; v += step) out.push(+v.toFixed(10));
    return out;
  }
  function tfmt(v) { const a = Math.abs(v); return a >= 1000 ? (v / 1000) + 'k' : String(+v.toFixed(3)); }
  function axes(cv, xr, yr, o) {
    o = o || {};
    const x = cv.x, W = cv.w, H = cv.h, p = { l: o.l || 48, r: 14, t: 14, b: 32 };
    const X = function (v) { return p.l + (v - xr[0]) / (xr[1] - xr[0]) * (W - p.l - p.r); };
    const Y = function (v) { return H - p.b - (v - yr[0]) / (yr[1] - yr[0]) * (H - p.t - p.b); };
    x.clearRect(0, 0, W, H);
    x.font = '11px "JetBrains Mono", monospace'; x.lineWidth = 1; x.strokeStyle = C.grid; x.fillStyle = C.ink3; x.textAlign = 'center';
    (o.xt || niceTicks(xr[0], xr[1], 6)).forEach(function (t) { const v = Array.isArray(t) ? t[0] : t; x.beginPath(); x.moveTo(X(v), p.t); x.lineTo(X(v), H - p.b); x.stroke(); x.fillText(Array.isArray(t) ? t[1] : tfmt(v), X(v), H - p.b + 15); });
    x.textAlign = 'right';
    (o.yt || niceTicks(yr[0], yr[1], 5)).forEach(function (t) { const v = Array.isArray(t) ? t[0] : t; x.beginPath(); x.moveTo(p.l, Y(v)); x.lineTo(W - p.r, Y(v)); x.stroke(); x.fillText(Array.isArray(t) ? t[1] : tfmt(v), p.l - 6, Y(v) + 4); });
    x.strokeStyle = C.axis; x.beginPath(); x.moveTo(p.l, p.t); x.lineTo(p.l, H - p.b); x.lineTo(W - p.r, H - p.b); x.stroke();
    x.fillStyle = C.ink2;
    if (o.xl) { x.textAlign = 'right'; x.fillText(o.xl, W - p.r, H - p.b - 6); }
    if (o.yl) { x.textAlign = 'left'; x.fillText(o.yl, p.l + 6, p.t + 10); }
    return { X: X, Y: Y, p: p, x: x };
  }
  function dot(x, px, py, r, fill, alpha) { x.globalAlpha = alpha == null ? 1 : alpha; x.beginPath(); x.arc(px, py, r, 0, 2 * Math.PI); x.fillStyle = fill; x.fill(); x.globalAlpha = 1; }
  function path(x, n, fx, fy) { x.beginPath(); for (let i = 0; i <= n; i++) { const a = fx(i), b = fy(i); i ? x.lineTo(a, b) : x.moveTo(a, b); } x.stroke(); }
  function rand(seed) { let s = seed % 2147483647; if (s <= 0) s += 2147483646; return function () { s = s * 16807 % 2147483647; return s / 2147483647; }; }
  function gauss(r) { const u = Math.max(r(), 1e-12), v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
  function erf(z) { const t = 1 / (1 + 0.3275911 * Math.abs(z)); const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-z * z); return z >= 0 ? y : -y; }
  const Phi = function (z) { return 0.5 * (1 + erf(z / Math.SQRT2)); };

  /* week 1: a one-rule predictor */
  V.threshold = function (el, P) {
    const data = P.data, n = data.length, late = data.filter(function (d) { return d[1]; }).length, base = Math.max(late, n - late) / n;
    const cv = canvas(el, 760, 220), ctl = box(el, 'ctl'), ro = box(el, 'readout');
    const s = slider(ctl, 'Threshold', 0, 250, 5, P.start || 150, function (v) { return v + ' km'; }, draw);
    function draw() {
      const t = s.get(), A = axes(cv, [0, 250], [-0.7, 1.7], { xl: 'distance_km', yt: [[0, 'on time'], [1, 'late']], l: 70 }), x = A.x;
      x.fillStyle = 'rgba(255,111,163,0.08)'; x.fillRect(A.X(t), A.p.t, A.X(250) - A.X(t), cv.h - A.p.t - A.p.b);
      x.strokeStyle = C.am; x.lineWidth = 2; x.setLineDash([5, 4]); x.beginPath(); x.moveTo(A.X(t), A.p.t); x.lineTo(A.X(t), cv.h - A.p.b); x.stroke(); x.setLineDash([]);
      x.fillStyle = C.am; x.textAlign = 'left'; x.fillText('predict late →', Math.min(A.X(t) + 6, cv.w - 110), A.p.t + 12);
      let ok = 0;
      data.forEach(function (d, i) {
        const good = (d[0] > t ? 1 : 0) === d[1], j = ((i * 7919) % 9 - 4) * 0.07; if (good) ok++;
        dot(x, A.X(d[0]), A.Y(d[1] + j), 6, d[1] ? C.pk : C.cy, good ? 0.95 : 0.3);
        if (!good) { x.strokeStyle = C.am; x.lineWidth = 1.5; x.beginPath(); x.arc(A.X(d[0]), A.Y(d[1] + j), 8.5, 0, 7); x.stroke(); }
      });
      ro.innerHTML = 'Rule: late if distance &gt; <b>' + t + ' km</b> · correct <b class="gn">' + ok + ' / ' + n + ' = ' + pct(ok / n) + '</b> · baseline, always guessing the majority <b class="am">' + pct(base) + '</b> · ringed points are wrong';
    }
    draw();
  };

  /* linear regression: drag the line, or let gradient descent move it */
  V.linefit = function () {
    const el = arguments[0], r = rand(7), xs = [], ys = [];
    for (let i = 0; i < 12; i++) { const xv = 0.5 + i * 0.8 + r() * 0.4; xs.push(xv); ys.push(1.6 * xv + 3 + gauss(r) * 1.4); }
    const n = xs.length, ybar = ys.reduce(function (a, b) { return a + b; }) / n;
    const cv = canvas(el, 760, 300), ctl = box(el, 'ctl'), btns = box(el, 'row'), ro = box(el, 'readout');
    let a = 0.5, b = 6;
    const sa = slider(ctl, 'slope a', -1, 4, 0.01, a, function (v) { return v.toFixed(2); }, function () { a = sa.get(); draw(); });
    const sb = slider(ctl, 'intercept b', -4, 12, 0.05, b, function (v) { return v.toFixed(2); }, function () { b = sb.get(); draw(); });
    const sl = slider(ctl, 'learning rate', 0.001, 0.04, 0.001, 0.01, function (v) { return v.toFixed(3); }, function () {});
    function grad() { let ga = 0, gb = 0; for (let i = 0; i < n; i++) { const e = a * xs[i] + b - ys[i]; ga += 2 * e * xs[i] / n; gb += 2 * e / n; } return [ga, gb]; }
    function steps(k) { for (let i = 0; i < k; i++) { const g = grad(), lr = sl.get(); a -= lr * g[0]; b -= lr * g[1]; if (!isFinite(a) || Math.abs(a) > 1e6) break; } sa.set(a); sb.set(b); draw(); }
    button(btns, 'Gradient descent: 1 step', function () { steps(1); });
    button(btns, '20 steps', function () { steps(20); });
    button(btns, 'Least-squares best fit', function () {
      const mx = xs.reduce(function (s, v) { return s + v; }) / n; let sxy = 0, sxx = 0;
      for (let i = 0; i < n; i++) { sxy += (xs[i] - mx) * (ys[i] - ybar); sxx += (xs[i] - mx) * (xs[i] - mx); }
      a = sxy / sxx; b = ybar - a * mx; sa.set(a); sb.set(b); draw();
    });
    function draw() {
      const A = axes(cv, [0, 10.5], [-2, 24], { xl: 'x', yl: 'y' }), x = A.x;
      let l1 = 0, sse = 0, sse0 = 0;
      for (let i = 0; i < n; i++) {
        const pr = a * xs[i] + b, e = pr - ys[i]; l1 += Math.abs(e); sse += e * e; sse0 += (ybar - ys[i]) * (ybar - ys[i]);
        x.strokeStyle = 'rgba(255,111,163,.7)'; x.lineWidth = 1.5; x.beginPath(); x.moveTo(A.X(xs[i]), A.Y(ys[i])); x.lineTo(A.X(xs[i]), A.Y(pr)); x.stroke();
      }
      x.save(); x.beginPath(); x.rect(A.p.l, A.p.t, cv.w - A.p.l - A.p.r, cv.h - A.p.t - A.p.b); x.clip();
      x.strokeStyle = C.am; x.lineWidth = 2.5; x.beginPath(); x.moveTo(A.X(0), A.Y(b)); x.lineTo(A.X(10.5), A.Y(a * 10.5 + b)); x.stroke(); x.restore();
      xs.forEach(function (v, i) { dot(x, A.X(v), A.Y(ys[i]), 5, C.cy); });
      ro.innerHTML = 'y = <b>' + a.toFixed(2) + '</b>x + <b>' + b.toFixed(2) + '</b> · L1 = Σ|e| <b class="pk">' + l1.toFixed(2) + '</b> · L2 = √Σe² <b class="pk">' + Math.sqrt(sse).toFixed(2) + '</b> · SSE <b>' + sse.toFixed(2) + '</b> · R² = 1 − SSE/SSE₀ <b class="gn">' + (1 - sse / sse0).toFixed(3) + '</b> · pink lines are the errors';
    }
    draw();
  };

  /* logistic regression in one dimension */
  V.sigmoid = function (el) {
    const r = rand(11), pts = [];
    for (let i = 0; i < 14; i++) pts.push([-1.6 + gauss(r) * 1.1, 0]);
    for (let i = 0; i < 14; i++) pts.push([1.4 + gauss(r) * 1.1, 1]);
    const cv = canvas(el, 760, 280), ctl = box(el, 'ctl'), ro = box(el, 'readout');
    const sa = slider(ctl, 'a (steepness)', 0.2, 8, 0.1, 1.5, function (v) { return v.toFixed(1); }, draw);
    const sb = slider(ctl, 'b (shift)', -6, 6, 0.1, 0, function (v) { return v.toFixed(1); }, draw);
    function draw() {
      const a = sa.get(), b = sb.get(), A = axes(cv, [-5, 5], [-0.08, 1.08], { xl: 'x', yl: 'P(y = 1)', yt: [0, 0.5, 1] }), x = A.x, bx = -b / a;
      x.strokeStyle = C.ink3; x.setLineDash([4, 4]); x.beginPath(); x.moveTo(A.X(-5), A.Y(0.5)); x.lineTo(A.X(5), A.Y(0.5)); x.stroke();
      if (bx > -5 && bx < 5) { x.strokeStyle = C.vi; x.beginPath(); x.moveTo(A.X(bx), A.Y(-0.08)); x.lineTo(A.X(bx), A.Y(1.08)); x.stroke(); }
      x.setLineDash([]); x.strokeStyle = C.am; x.lineWidth = 2.5;
      path(x, 200, function (i) { return A.X(-5 + i / 20); }, function (i) { return A.Y(1 / (1 + Math.exp(-(a * (-5 + i / 20) + b)))); });
      let ok = 0, loss = 0;
      pts.forEach(function (p) {
        const pr = 1 / (1 + Math.exp(-(a * p[0] + b))), good = (pr >= 0.5 ? 1 : 0) === p[1], q = Math.min(Math.max(pr, 1e-12), 1 - 1e-12);
        if (good) ok++; loss += -(p[1] * Math.log(q) + (1 - p[1]) * Math.log(1 - q));
        dot(x, A.X(p[0]), A.Y(p[1]), 5.5, p[1] ? C.pk : C.cy, good ? 0.95 : 0.35);
      });
      ro.innerHTML = 'P(y=1) = 1 / (1 + e<sup>−(' + a.toFixed(1) + 'x + ' + b.toFixed(1) + ')</sup>) · decision boundary x = −b/a = <b class="am">' + bx.toFixed(2) + '</b> · accuracy <b class="gn">' + ok + '/' + pts.length + '</b> · total log loss <b class="pk">' + loss.toFixed(2) + '</b> · faded points are misclassified';
    }
    draw();
  };

  /* decision tree split: Gini, entropy, information gain */
  V.gini = function (el) {
    const cv = canvas(el, 760, 250), ctl = box(el, 'ctl'), ro = box(el, 'readout');
    const sA = slider(ctl, 'blue points sent left', 0, 10, 1, 9, String, draw);
    const sB = slider(ctl, 'pink points sent left', 0, 10, 1, 3, String, draw);
    const gini = function (c) { const n = c[0] + c[1]; return n ? 1 - Math.pow(c[0] / n, 2) - Math.pow(c[1] / n, 2) : 0; };
    const ent = function (c) { const n = c[0] + c[1]; let hh = 0; c.forEach(function (k) { if (k) { const p = k / n; hh -= p * Math.log2(p); } }); return hh; };
    function node(x, cx, cy, c, label) {
      const n = c[0] + c[1], w = 170;
      x.fillStyle = '#121a33'; x.strokeStyle = '#37447a'; x.lineWidth = 1; x.fillRect(cx - w / 2, cy - 30, w, 62); x.strokeRect(cx - w / 2, cy - 30, w, 62);
      if (n) { x.fillStyle = C.cy; x.fillRect(cx - w / 2 + 8, cy - 2, (w - 16) * c[0] / n, 22); x.fillStyle = C.pk; x.fillRect(cx - w / 2 + 8 + (w - 16) * c[0] / n, cy - 2, (w - 16) * c[1] / n, 22); }
      x.fillStyle = C.ink; x.textAlign = 'center'; x.font = '12px "JetBrains Mono", monospace';
      x.fillText(label + ': ' + c[0] + ' blue, ' + c[1] + ' pink', cx, cy - 12);
    }
    function draw() {
      const L = [sA.get(), sB.get()], R = [10 - L[0], 10 - L[1]], x = cv.x;
      x.clearRect(0, 0, cv.w, cv.h);
      x.strokeStyle = '#37447a'; x.lineWidth = 1.5; x.beginPath(); x.moveTo(380, 72); x.lineTo(200, 163); x.moveTo(380, 72); x.lineTo(560, 163); x.stroke();
      node(x, 380, 40, [10, 10], 'parent'); node(x, 200, 195, L, 'left'); node(x, 560, 195, R, 'right');
      const nl = L[0] + L[1], nr = R[0] + R[1], wg = (nl * gini(L) + nr * gini(R)) / 20, wh = (nl * ent(L) + nr * ent(R)) / 20;
      ro.innerHTML = 'Gini left <b>' + gini(L).toFixed(3) + '</b>, right <b>' + gini(R).toFixed(3) + '</b>, weighted <b class="am">' + wg.toFixed(3) + '</b> (parent 0.500, lower is purer) · entropy left <b>' + ent(L).toFixed(3) + '</b>, right <b>' + ent(R).toFixed(3) + '</b> · information gain = 1 − weighted entropy = <b class="gn">' + (1 - wh).toFixed(3) + '</b>';
    }
    draw();
  };

  /* confusion matrix in the lecture layout: rows = predictions, columns = actual */
  V.confusion = function (el, P) {
    const v = { tp: 30, fp: 10, fn: 20, tn: 40 }; Object.keys(v).forEach(function (k) { if (P && P[k] != null) v[k] = P[k]; });
    const g = box(el, 'cm');
    g.innerHTML = '<div class="h"></div><div class="h">actually spam</div><div class="h">actually not spam</div><div class="h">predicted spam</div><div>TP <input type="number" min="0" data-k="tp"></div><div>FP <input type="number" min="0" data-k="fp"></div><div class="h">predicted not spam</div><div>FN <input type="number" min="0" data-k="fn"></div><div>TN <input type="number" min="0" data-k="tn"></div>';
    const ro = box(el, 'readout');
    g.querySelectorAll('input').forEach(function (i) { i.value = v[i.dataset.k]; i.setAttribute('aria-label', i.dataset.k.toUpperCase()); i.addEventListener('input', function () { v[i.dataset.k] = Math.max(0, +i.value || 0); draw(); }); });
    function draw() {
      const all = v.tp + v.fp + v.fn + v.tn, d = function (a, b) { return b ? a / b : NaN; }, f = function (x) { return isNaN(x) ? '—' : x.toFixed(3); };
      const prec = d(v.tp, v.tp + v.fp), rec = d(v.tp, v.tp + v.fn);
      ro.innerHTML = 'accuracy (TP+TN)/all <b>' + f(d(v.tp + v.tn, all)) + '</b> · precision TP/(TP+FP) = P(actually spam | predicted spam) <b class="am">' + f(prec) + '</b> · recall = sensitivity TP/(TP+FN) <b class="gn">' + f(rec) + '</b> · specificity TN/(TN+FP) <b>' + f(d(v.tn, v.tn + v.fp)) + '</b> · F1 <b class="pk">' + f(d(2 * prec * rec, prec + rec)) + '</b> · P(predicted spam) <b>' + f(d(v.tp + v.fp, all)) + '</b> · P(actually spam) <b>' + f(d(v.tp + v.fn, all)) + '</b>';
    }
    draw();
  };

  /* naive Bayes spam filter with the lecture's likelihoods */
  V.bayes = function (el) {
    const L = { spam: { send: 0.26, us: 0.11, your: 0.30, password: 0.09 }, ham: { send: 0.17, us: 0.08, your: 0.30, password: 0.25 } };
    const words = Object.keys(L.spam), on = { send: 1, us: 1, your: 1, password: 1 };
    const row = box(el, 'row'), ctl = box(el, 'ctl'), cv = canvas(el, 760, 112), ro = box(el, 'readout');
    words.forEach(function (w) {
      const b = button(row, w, function () { on[w] = !on[w]; b.classList.toggle('go', !!on[w]); b.setAttribute('aria-pressed', String(!!on[w])); draw(); });
      b.classList.add('go'); b.setAttribute('aria-pressed', 'true');
    });
    const sp = slider(ctl, 'prior P(spam)', 0.01, 0.99, 0.01, 0.8, function (v) { return v.toFixed(2); }, draw);
    function draw() {
      const p = sp.get(), used = words.filter(function (w) { return on[w]; }); let s = p, hm = 1 - p;
      used.forEach(function (w) { s *= L.spam[w]; hm *= L.ham[w]; });
      const post = s / (s + hm), x = cv.x;
      x.clearRect(0, 0, cv.w, cv.h); x.font = '12px "JetBrains Mono", monospace';
      [['spam', post, C.pk], ['not spam', 1 - post, C.cy]].forEach(function (r, i) {
        const y = 14 + i * 48; x.fillStyle = C.ink2; x.textAlign = 'left'; x.fillText(r[0], 8, y + 17);
        x.fillStyle = '#121a33'; x.fillRect(100, y, 560, 26); x.fillStyle = r[2]; x.fillRect(100, y, 560 * r[1], 26); x.fillStyle = C.ink; x.fillText(pct(r[1]), 672, y + 17);
      });
      ro.innerHTML = 'message: “<b>' + (used.join(' ') || 'no words') + '</b>” · score(spam) = P(spam) × Π P(word | spam) = <b class="pk">' + f3(s) + '</b> · score(not spam) = <b>' + f3(hm) + '</b> · P(spam | message) = score ÷ (sum of both scores) = <b class="am">' + post.toFixed(3) + '</b>';
    }
    draw();
  };

  /* normal distribution: area between a and b, or two-sided tail area (p-value) */
  V.normal = function (el, P) {
    const tail = P && P.mode === 'tail', cv = canvas(el, 760, 260), ctl = box(el, 'ctl'), row = box(el, 'row'), ro = box(el, 'readout');
    const pdf = function (x, m, s) { return Math.exp(-0.5 * Math.pow((x - m) / s, 2)) / (s * Math.sqrt(2 * Math.PI)); };
    let mu, sd, a, b, t;
    if (tail) t = slider(ctl, 'test statistic z', 0, 4, 0.01, 1.96, function (v) { return v.toFixed(2); }, draw);
    else {
      mu = slider(ctl, 'mean μ', -3, 3, 0.1, 0, function (v) { return v.toFixed(1); }, draw);
      sd = slider(ctl, 'standard deviation σ', 0.3, 3, 0.05, 1, function (v) { return v.toFixed(2); }, draw);
      a = slider(ctl, 'from a', -6, 6, 0.05, -1, function (v) { return v.toFixed(2); }, draw);
      b = slider(ctl, 'to b', -6, 6, 0.05, 1, function (v) { return v.toFixed(2); }, draw);
      [1, 2, 3].forEach(function (k) { button(row, 'μ ± ' + k + 'σ', function () { a.set(mu.get() - k * sd.get()); b.set(mu.get() + k * sd.get()); draw(); }); });
    }
    function draw() {
      const m = tail ? 0 : mu.get(), s = tail ? 1 : sd.get();
      const A = axes(cv, [-6, 6], [0, Math.max(0.42, pdf(m, m, s) * 1.08)], { xl: 'x', yl: 'density' }), x = A.x;
      const lo = tail ? 0 : Math.min(a.get(), b.get()), hi = tail ? 0 : Math.max(a.get(), b.get());
      const inside = tail ? function (v) { return Math.abs(v) >= t.get(); } : function (v) { return v >= lo && v <= hi; };
      x.fillStyle = tail ? 'rgba(255,111,163,.45)' : 'rgba(77,216,255,.35)';
      for (let i = 0; i < 600; i++) {
        const v0 = -6 + i * 0.02, v1 = v0 + 0.02; if (!inside((v0 + v1) / 2)) continue;
        x.beginPath(); x.moveTo(A.X(v0), A.Y(0)); x.lineTo(A.X(v0), A.Y(pdf(v0, m, s))); x.lineTo(A.X(v1), A.Y(pdf(v1, m, s))); x.lineTo(A.X(v1), A.Y(0)); x.fill();
      }
      x.strokeStyle = C.am; x.lineWidth = 2.5;
      path(x, 600, function (i) { return A.X(-6 + i * 0.02); }, function (i) { return A.Y(pdf(-6 + i * 0.02, m, s)); });
      if (tail) {
        const z = t.get(), pv = 2 * (1 - Phi(z));
        ro.innerHTML = 'two-sided p-value = P(|Z| ≥ ' + z.toFixed(2) + ' if H₀ is true) = shaded area = <b class="pk">' + pv.toFixed(4) + '</b> · ' + (pv < 0.05 ? '<b class="gn">below 0.05: reject H₀</b>' : '<b class="am">0.05 or more: fail to reject H₀</b>');
      } else {
        const pr = Phi((hi - m) / s) - Phi((lo - m) / s);
        ro.innerHTML = 'P(' + lo.toFixed(2) + ' ≤ X ≤ ' + hi.toFixed(2) + ') = shaded area = <b class="gn">' + pr.toFixed(4) + '</b> · z-scores: a → <b>' + ((lo - m) / s).toFixed(2) + '</b>, b → <b>' + ((hi - m) / s).toFixed(2) + '</b> · the probability of any one exact value is 0';
      }
    }
    draw();
  };

  /* sums of dice: from flat to bell-shaped */
  V.dice = function (el) {
    const cv = canvas(el, 760, 250), ctl = box(el, 'ctl'), ro = box(el, 'readout');
    const s = slider(ctl, 'number of dice', 1, 10, 1, 2, String, draw);
    function draw() {
      const n = s.get(); let dist = [1];
      for (let k = 0; k < n; k++) { const nd = new Array(dist.length + 6).fill(0); dist.forEach(function (p, i) { for (let f = 1; f <= 6; f++) nd[i + f] += p / 6; }); dist = nd; }
      const A = axes(cv, [n - 0.5, 6 * n + 0.5], [0, Math.max.apply(null, dist) * 1.15], { xl: 'sum of the dice', yl: 'probability' }), x = A.x;
      const bw = Math.max(1, (A.X(1) - A.X(0)) * 0.8);
      x.fillStyle = C.cy;
      for (let v = n; v <= 6 * n; v++) x.fillRect(A.X(v) - bw / 2, A.Y(dist[v]), bw, A.Y(0) - A.Y(dist[v]));
      const mean = 3.5 * n, vr = n * 35 / 12, sd = Math.sqrt(vr);
      x.strokeStyle = C.am; x.lineWidth = 2;
      path(x, 300, function (i) { return A.X(n - 0.5 + i * (5 * n + 1) / 300); }, function (i) { const v = n - 0.5 + i * (5 * n + 1) / 300; return A.Y(Math.exp(-0.5 * Math.pow((v - mean) / sd, 2)) / (sd * Math.sqrt(2 * Math.PI))); });
      ro.innerHTML = 'mean = 3.5 × ' + n + ' = <b>' + mean.toFixed(1) + '</b> · variance = ' + n + ' × 35/12 = <b>' + vr.toFixed(2) + '</b> · standard deviation <b>' + sd.toFixed(2) + '</b> · orange: a normal curve with the same mean and spread';
    }
    draw();
  };

  /* overfitting: polynomial degree vs training and test error */
  V.overfit = function (el) {
    const r = rand(5), f = function (v) { return Math.sin(2 * Math.PI * v); }, tr = [], te = [];
    for (let i = 0; i < 12; i++) { const v = (i + 0.5) / 12 + (r() - 0.5) * 0.04; tr.push([v, f(v) + gauss(r) * 0.25]); }
    for (let i = 0; i < 40; i++) { const v = r(); te.push([v, f(v) + gauss(r) * 0.25]); }
    function fit(d) {
      const m = d + 1, A = [], B = new Array(m).fill(0);
      for (let i = 0; i < m; i++) A.push(new Array(m).fill(0));
      tr.forEach(function (q) { const t = 2 * q[0] - 1, pw = []; for (let k = 0; k < m; k++) pw.push(Math.pow(t, k)); for (let i = 0; i < m; i++) { B[i] += pw[i] * q[1]; for (let j = 0; j < m; j++) A[i][j] += pw[i] * pw[j]; } });
      for (let i = 0; i < m; i++) A[i][i] += 1e-10;
      for (let c = 0; c < m; c++) {
        let p = c; for (let i = c + 1; i < m; i++) if (Math.abs(A[i][c]) > Math.abs(A[p][c])) p = i;
        let tmp = A[c]; A[c] = A[p]; A[p] = tmp; tmp = B[c]; B[c] = B[p]; B[p] = tmp;
        for (let i = c + 1; i < m; i++) { const k = A[i][c] / A[c][c]; for (let j = c; j < m; j++) A[i][j] -= k * A[c][j]; B[i] -= k * B[c]; }
      }
      const w = new Array(m).fill(0);
      for (let i = m - 1; i >= 0; i--) { let s = B[i]; for (let j = i + 1; j < m; j++) s -= A[i][j] * w[j]; w[i] = s / A[i][i]; }
      return function (v) { const t = 2 * v - 1; let s = 0, p = 1; for (let k = 0; k < m; k++) { s += w[k] * p; p *= t; } return s; };
    }
    const mse = function (g, d) { return d.reduce(function (s, q) { return s + Math.pow(g(q[0]) - q[1], 2); }, 0) / d.length; };
    const curve = []; for (let d = 0; d <= 11; d++) { const g = fit(d); curve.push([d, mse(g, tr), mse(g, te)]); }
    const best = curve.reduce(function (m, q) { return Math.min(m, q[2]); }, 99);
    const cv = canvas(el, 760, 280), cv2 = canvas(el, 760, 160), ctl = box(el, 'ctl'), ro = box(el, 'readout');
    const s = slider(ctl, 'polynomial degree', 0, 11, 1, 3, String, draw);
    function draw() {
      const d = s.get(), g = fit(d), A = axes(cv, [0, 1], [-2, 2], { xl: 'x', yl: 'y' }), x = A.x;
      x.strokeStyle = 'rgba(170,183,223,.35)'; x.setLineDash([4, 4]); x.lineWidth = 1.5;
      path(x, 200, function (i) { return A.X(i / 200); }, function (i) { return A.Y(f(i / 200)); }); x.setLineDash([]);
      te.forEach(function (p) { dot(x, A.X(p[0]), A.Y(p[1]), 3.5, C.vi, 0.6); });
      tr.forEach(function (p) { dot(x, A.X(p[0]), A.Y(p[1]), 5.5, C.cy); });
      x.save(); x.beginPath(); x.rect(A.p.l, A.p.t, cv.w - A.p.l - A.p.r, cv.h - A.p.t - A.p.b); x.clip();
      x.strokeStyle = C.am; x.lineWidth = 2.5; path(x, 400, function (i) { return A.X(i / 400); }, function (i) { return A.Y(g(i / 400)); }); x.restore();
      const B = axes(cv2, [-0.5, 11.5], [-3, 1.5], { xl: 'degree', yl: 'log10 MSE: blue train, violet test', xt: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] }), y = B.x;
      [[1, C.cy], [2, C.vi]].forEach(function (k) {
        y.strokeStyle = k[1]; y.lineWidth = 2;
        path(y, curve.length - 1, function (i) { return B.X(curve[i][0]); }, function (i) { return B.Y(Math.max(-3, Math.min(1.5, Math.log10(curve[i][k[0]])))); });
      });
      y.strokeStyle = C.am; y.setLineDash([3, 3]); y.beginPath(); y.moveTo(B.X(d), B.p.t); y.lineTo(B.X(d), cv2.h - B.p.b); y.stroke(); y.setLineDash([]);
      const c = curve[d];
      ro.innerHTML = 'degree <b>' + d + '</b> (' + (d + 1) + ' parameters for 12 training points) · training MSE <b>' + c[1].toFixed(3) + '</b> · test MSE <b class="' + (c[2] > 2 * best ? 'pk' : 'gn') + '">' + c[2].toFixed(3) + '</b> · blue = training points, violet = unseen test points, dashed = the true curve';
    }
    draw();
  };
})();
