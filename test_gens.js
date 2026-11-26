// Load the generators in Node with a minimal fake page, generate many questions from every generator and check them.
const fs = require('fs'), vm = require('vm');
const site = __dirname + '/site/';
const ctx = { window: {}, console, Math, JSON, Date, Number, String, Array, Object, Set, isFinite, isNaN, parseInt, setTimeout };
ctx.window = ctx; ctx.GUIDE = { S: { days: {} }, today: () => 0, save() {}, track: () => ({}) }; ctx.window.GUIDE = ctx.GUIDE;
ctx.document = { createElement: () => ({ content: {} }) };
vm.createContext(ctx);
const sl = fs.readFileSync(site + 'slides/index.js', 'utf8'); vm.runInContext(sl, ctx);
for (const f of ['practice.js', 'gens_py.js', 'gens_ml.js', 'gens_dm.js', 'gens_spi.js']) vm.runInContext(fs.readFileSync(site + 'js/' + f, 'utf8'), ctx, { filename: f });
const P = ctx.GUIDE.P;
const N = +process.argv[2] || 150;
let errors = 0, count = 0, nulls = 0; const pyCases = [], codeCases = [], srcMissing = new Set();
const byKind = {};
for (const W of P.weeks) {
  for (const g of W.gens) {
    for (let i = 0; i < N; i++) {
      let it;
      try { it = P.make(g); } catch (e) { errors++; console.log('THROW', g.id, g.topic, e.message); break; }
      if (!it) { nulls++; continue; }
      count++; byKind[it.k] = (byKind[it.k] || 0) + 1;
      const bad = (m) => { errors++; if (errors < 60) console.log('BAD', g.id, g.topic, m, JSON.stringify(it).slice(0, 300)); };
      if (!it.q) bad('no q');
      if (it.src === null) srcMissing.add(g.id + ' ' + g.topic);
      if (it.src && (!it.src.label || !it.src.p)) bad('src');
      if (it.k === 'mcq') {
        if (!Array.isArray(it.options) || it.options.length < 2) bad('options');
        if (new Set(it.options).size !== it.options.length) bad('dup options');
        if (it.options[it.answer] === undefined) bad('answer idx');
        if (it.options.some(o => o === 'undefined' || /undefined|NaN/.test(o))) bad('undefined in options');
      } else if (it.k === 'num') {
        if (!isFinite(it.ans)) bad('ans not finite');
        const r = P.check(it, String(it.ans)); if (!r.ok) bad('own answer fails');
        const r2 = P.check(it, P.fmt(it.ans, it.dp == null ? 6 : it.dp)); if (!r2.ok) bad('rounded answer fails ' + P.fmt(it.ans, it.dp));
      } else if (it.k === 'text') {
        const a = it.testAns != null ? it.testAns : it.showAns != null ? it.showAns : it.accept && it.accept[0];
        if (a == null) bad('no answer');
        const r = P.check(it, a); if (!r.ok) bad('own answer fails: ' + a + ' ' + (r.note || r.bad || ''));
        if (it.norm === 'lines' || it.norm === 'loose') pyCases.push({ id: g.id, code: it.code, out: it.accept[0], norm: it.norm });
      } else if (it.k === 'code') {
        if (!it.solution || !it.test) bad('code parts');
        codeCases.push({ id: g.id, sol: it.solution, test: it.test, starter: it.starter });
      } else if (it.k === 'written') {
        if (!it.marks || !it.scheme || !it.scheme.length) bad('written parts');
      } else bad('unknown kind');
      if (/undefined|NaN/.test(it.q) || /undefined|NaN/.test(it.why || '')) bad('undefined/NaN in text');
    }
  }
}
console.log('weeks', P.weeks.length, 'gens', P.weeks.reduce((a, W) => a + W.gens.length, 0), 'items', count, 'nulls', nulls, 'errors', errors, JSON.stringify(byKind));
if (srcMissing.size) console.log('no slide found for', [...srcMissing].slice(0, 20));
fs.writeFileSync('/tmp/py_cases.json', JSON.stringify(pyCases));
const seen = {}; fs.writeFileSync('/tmp/code_cases.json', JSON.stringify(codeCases.filter(c => !seen[c.sol] && (seen[c.sol] = 1))));
