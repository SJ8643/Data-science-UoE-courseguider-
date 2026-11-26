/* gens_dm.js – ECM1415 Discrete Mathematics: unlimited questions for each week. The exam is closed book with
   compulsory questions: short calculations done carefully by hand, and proofs marked step by step. */
(function () {
  'use strict';
  const P = window.GUIDE.P, R = P.R, LG = P.logic, esc = P.esc;
  const S = function (deck, kw) { return P.slide(deck, kw); };
  const V = function (n) { return { op: 'var', n: n }; }, N = function (a) { return { op: 'not', a: a }; }, B = function (op, a, b) { return { op: op, a: a, b: b }; };
  const show = function (e) { return LG.show(e, true); };
  const setS = function (a) { return a.length ? '{' + a.join(', ') + '}' : '∅'; };
  const sortN = function (a) { return a.slice().sort(function (x, y) { return (typeof x === 'number' && typeof y === 'number') ? x - y : String(x) < String(y) ? -1 : 1; }); };
  const D1 = 'dm-intro-to-modal-logic-slides', D2 = 'dm-handouts', D3 = 'dm-handouts-03-1', D4 = 'dm-handouts-04', D5 = 'dm-handouts-05', D7 = 'dm-handouts-06', D9 = 'dm-week9-slides';
  const PH = [['it is raining', 'it is not raining'], ['the train is late', 'the train is not late'], ['you revise', 'you do not revise'], ['the program compiles', 'the program does not compile'], ['the light is on', 'the light is off'],
    ['Sam is at home', 'Sam is not at home'], ['the server is down', 'the server is not down'], ['you pass the exam', 'you do not pass the exam'], ['the shop is open', 'the shop is closed'], ['the alarm sounds', 'the alarm does not sound']];

  function tt(e, vs) { return LG.col(e, vs); }
  function kind(col) { return col.indexOf('F') < 0 ? 'A tautology' : col.indexOf('T') < 0 ? 'A contradiction' : 'A contingency'; }
  function sub(e, m) { if (e.op === 'var') return m[e.n] || e; if (e.op === 'const') return e; return { op: e.op, a: e.a && sub(e.a, m), b: e.b && sub(e.b, m) }; }

  /* ===== Week 1: propositional logic and equivalences ===== */
  const LAWS = [
    ['A → B', '¬A ∨ B', ['B → A', '¬A → ¬B', 'A ∨ ¬B'], 'Conditional–disjunction equivalence: p → q ≡ ¬p ∨ q.'],
    ['¬(A ∧ B)', '¬A ∨ ¬B', ['¬A ∧ ¬B', 'A ∨ B', '¬A ∨ B'], 'De Morgan: negating an AND gives an OR of the negations.'],
    ['¬(A ∨ B)', '¬A ∧ ¬B', ['¬A ∨ ¬B', 'A ∧ B', '¬A ∧ B'], 'De Morgan: negating an OR gives an AND of the negations.'],
    ['A → B', '¬B → ¬A', ['B → A', '¬A → ¬B', '¬B ∧ A'], 'The contrapositive is equivalent to the original; the converse and inverse are not.'],
    ['A ↔ B', '(A → B) ∧ (B → A)', ['(A → B) ∨ (B → A)', 'A ∧ B', '(A ∧ B) ∨ ¬A'], 'A biconditional is two conditionals, one each way.'],
    ['A ∧ (B ∨ C)', '(A ∧ B) ∨ (A ∧ C)', ['(A ∧ B) ∨ C', '(A ∨ B) ∧ (A ∨ C)', 'A ∧ B ∧ C'], 'Distributive law: ∧ distributes over ∨.'],
    ['A ∨ (B ∧ C)', '(A ∨ B) ∧ (A ∨ C)', ['(A ∨ B) ∧ C', '(A ∧ B) ∨ (A ∧ C)', 'A ∨ B ∨ C'], 'Distributive law: ∨ distributes over ∧.'],
    ['¬(A → B)', 'A ∧ ¬B', ['¬A → ¬B', '¬A ∧ B', '¬A ∨ ¬B'], 'An implication is false only when the hypothesis is true and the conclusion false.'],
    ['A ∨ (A ∧ B)', 'A', ['B', 'A ∧ B', 'A ∨ B'], 'Absorption law.'],
    ['A → (B → C)', '(A ∧ B) → C', ['(A → B) → C', '(A ∨ B) → C', 'A ∧ (B → C)'], 'Exportation: p → (q → r) ≡ (p ∧ q) → r.']
  ];
  const UNSAT = ['(p ∨ q) ∧ (¬p ∨ q) ∧ (p ∨ ¬q) ∧ (¬p ∨ ¬q)', 'p ∧ (p → q) ∧ ¬q', '(p ∨ q) ∧ ¬p ∧ ¬q', '(p → q) ∧ (q → r) ∧ p ∧ ¬r', '(p ↔ q) ∧ (p ↔ ¬q)'];
  const TAUT = ['p ∨ ¬p', '(p ∧ (p → q)) → q', '(p → q) ∨ (q → p)', '¬(p ∧ ¬p)', '(p ∧ q) → p', '((p → q) ∧ (q → r)) → (p → r)', '(¬q ∧ (p → q)) → ¬p'];
  const CONTRA = ['p ∧ ¬p', '¬(p → p)', '(p ∨ q) ∧ ¬p ∧ ¬q', '(p ↔ q) ∧ (p ↔ ¬q)', '¬((p ∧ q) → p)'];
  P.week('dm', 1, 'Propositional logic, truth tables and equivalences', { lessons: ['dm-prop', 'dm-equiv'] }, [
    ['Truth tables', function () {
      const vs = R.chance(0.6) ? ['p', 'q'] : ['p', 'q', 'r'];
      let e; do { e = LG.rand(vs, vs.length === 2 ? 2 : 3); } while (LG.vars(e).length < vs.length);
      const col = tt(e, vs);
      return P.text('Complete the truth table of <b>' + esc(show(e)) + '</b>. Type the final column from top to bottom (for example ' + (vs.length === 2 ? 'TFTT' : 'TFTTFFTF') + '). Rows are in the usual order, starting with every variable T.', 'tf', [col],
        LG.table(e, vs) + 'Work column by column: innermost brackets first. p → q is false only when p is T and q is F; p ↔ q is true when both sides match.', { ph: vs.length === 2 ? 'e.g. TFTT' : 'e.g. TFTTFFTF', src: S(D1, 'Truth Tables for Compound') });
    }],
    ['Tautology, contradiction or contingency', function () {
      const r = Math.random(); let e;
      if (r < 0.3) e = LG.parse(R.pick(TAUT)); else if (r < 0.55) e = LG.parse(R.pick(CONTRA)); else { const vs = ['p', 'q']; e = LG.rand(vs, 2); }
      const vs = LG.vars(e), col = tt(e, vs), k = kind(col);
      return P.mcq('Is <b>' + esc(show(e)) + '</b> a tautology, a contradiction or a contingency?', k, ['A tautology', 'A contradiction', 'A contingency'].filter(function (x) { return x !== k; }), LG.table(e, vs) + 'Final column ' + col + ': ' + (k === 'A tautology' ? 'always T.' : k === 'A contradiction' ? 'always F.' : 'some T and some F.'), { src: S(D1, 'tautology') });
    }],
    ['Is it a proposition?', function () {
      return P.cls([['“The Moon is made of green cheese.”', 'A proposition', 'A declarative sentence that is false is still a proposition.'], ['“Sit down!”', 'Not a proposition', 'A command is neither true nor false.'], ['“1 + 0 = 1”', 'A proposition', 'Declarative and true.'],
        ['“What time is it?”', 'Not a proposition', 'A question has no truth value.'], ['“x + 1 = 2”', 'Not a proposition', 'Its truth depends on x: it becomes a proposition once x is given a value (or quantified).'], ['“Exeter is in Devon.”', 'A proposition', 'Declarative and true.'],
        ['“2 + 2 = 5”', 'A proposition', 'Declarative and false.'], ['“Please close the door.”', 'Not a proposition', 'A request.'], ['“n is a prime number.”', 'Not a proposition', 'It depends on n.']], 'Is this a proposition?<br><b>%s</b>', ['A proposition', 'Not a proposition'], { src: S(D1, 'declarative') });
    }],
    ['Converse, contrapositive, inverse', function () {
      const ab = R.sample(PH, 2), p = ab[0], q = ab[1], k = R.pick(['converse', 'contrapositive', 'inverse']);
      const forms = { converse: 'If ' + q[0] + ', then ' + p[0] + '.', contrapositive: 'If ' + q[1] + ', then ' + p[1] + '.', inverse: 'If ' + p[1] + ', then ' + q[1] + '.' };
      const wrong = Object.keys(forms).filter(function (x) { return x !== k; }).map(function (x) { return forms[x]; }).concat(['If ' + p[0] + ', then ' + q[1] + '.']);
      return P.mcq('Statement: “If ' + p[0] + ', then ' + q[0] + '.” What is its <b>' + k + '</b>?', forms[k], wrong, 'For p → q: converse q → p, contrapositive ¬q → ¬p, inverse ¬p → ¬q. Only the contrapositive is equivalent to the original statement; the converse and inverse are equivalent to each other.', { src: S(D1, 'contrapositive') });
    }],
    ['Equivalent formulas', function () {
      const L = R.pick(LAWS), lits = R.sample([V('p'), V('q'), V('r'), N(V('p')), N(V('q'))], 3);
      const m = { A: lits[0], B: lits[1], C: lits[2] };
      const conv = function (s) { return sub(LG.parse(s.replace(/A/g, 'a').replace(/B/g, 'b').replace(/C/g, 'c')), { a: m.A, b: m.B, c: m.C }); };
      const left = conv(L[0]), right = conv(L[1]), vs = Array.from(new Set(LG.vars(left).concat(LG.vars(right)))).sort();
      const target = tt(left, vs), wrongs = L[2].map(conv).filter(function (w) { const all = Array.from(new Set(vs.concat(LG.vars(w)))).sort(); return tt(w, all) !== tt(left, all); });
      if (wrongs.length < 2) return null;
      return P.mcq('Which formula is logically equivalent to <b>' + esc(show(left)) + '</b>?', esc(show(right)), wrongs.map(function (w) { return esc(show(w)); }), L[3] + ' Check with a truth table if unsure: the right answer has the same column (' + target + ') in every row.', { src: S(D1, 'Key Logical Equivalences') });
    }],
    ['Rewrite without → and ↔', function () {
      const vs = ['p', 'q'].concat(R.chance(0.4) ? ['r'] : []);
      let e; do { e = LG.rand(vs, 2); } while (!/"op":"(imp|iff)"/.test(JSON.stringify(e)) || LG.vars(e).length < 2);
      const v2 = LG.vars(e);
      return P.text('Write a formula equivalent to <b>' + esc(show(e)) + '</b> that uses only ¬, ∧ and ∨ (no → or ↔). Type ~ or ¬ for not, &amp; or ∧ for and, | or ∨ for or.', 'formula', null,
        'Replace each p → q by ¬p ∨ q, and each p ↔ q by (¬p ∨ q) ∧ (¬q ∨ p). One answer: <b>' + esc(show(elimImp(e))) + '</b>. Any formula with the same truth table (' + tt(e, v2) + ') and no → or ↔ is accepted.', { vars: v2, target: tt(e, v2), noImp: true, showAns: show(elimImp(e)), src: S(D1, 'Key Logical Equivalences') });
    }],
    ['Normal forms (DNF and CNF)', function () {
      const vs = R.chance(0.7) ? ['p', 'q'] : ['p', 'q', 'r'];
      let e, col; do { e = LG.rand(vs, 2); col = tt(e, vs); } while (col.indexOf('T') < 0 || col.indexOf('F') < 0);
      const form = R.chance(0.65) ? 'dnf' : 'cnf', rows = LG.rows(vs);
      const dnf = rows.map(function (env, i) { return col[i] === 'T' ? '(' + vs.map(function (v) { return env[v] ? v : '¬' + v; }).join(' ∧ ') + ')' : null; }).filter(Boolean).join(' ∨ ');
      const cnf = rows.map(function (env, i) { return col[i] === 'F' ? '(' + vs.map(function (v) { return env[v] ? '¬' + v : v; }).join(' ∨ ') + ')' : null; }).filter(Boolean).join(' ∧ ');
      return P.text('Write <b>' + esc(show(e)) + '</b> in <b>' + (form === 'dnf' ? 'disjunctive normal form (an OR of ANDs of literals)' : 'conjunctive normal form (an AND of ORs of literals)') + '</b>.', 'formula', null,
        LG.table(e, vs) + (form === 'dnf' ? 'DNF from the table: one conjunction for each T row, true exactly on that row, joined by ∨: <b>' + esc(dnf) + '</b>. Simplified forms are also accepted.' : 'CNF from the table: one clause for each F row, false exactly on that row, joined by ∧: <b>' + esc(cnf) + '</b>. Simplified forms are also accepted.'),
        { vars: vs, target: col, form: form, showAns: form === 'dnf' ? dnf : cnf, src: S('dm-propositional-logic-1', form === 'dnf' ? 'disjunct' : 'conjunct') });
    }],
    ['Satisfiable?', function () {
      let e;
      if (R.chance(0.35)) e = LG.parse(R.pick(UNSAT)); else { const cl = []; for (let i = 0; i < R.int(3, 4); i++) { const a = R.sample(['p', 'q', 'r'], 2); cl.push('(' + a.map(function (v) { return (R.chance(0.5) ? '¬' : '') + v; }).join(' ∨ ') + ')'); } e = LG.parse(cl.join(' ∧ ')); }
      const vs = LG.vars(e), rows = LG.rows(vs), i = rows.findIndex(function (env) { return LG.ev(e, env); });
      const ans = i >= 0 ? 'Satisfiable' : 'Unsatisfiable';
      return P.mcq('Is <b>' + esc(show(e)) + '</b> satisfiable?', ans, [i >= 0 ? 'Unsatisfiable' : 'Satisfiable', 'It is a tautology', 'It cannot be decided from a truth table'], i >= 0 ? 'Yes: ' + vs.map(function (v) { return v + ' = ' + (rows[i][v] ? 'T' : 'F'); }).join(', ') + ' makes it true. One satisfying assignment is enough.' : 'No row of the truth table makes it true (' + tt(e, vs) + '), so it is unsatisfiable: its negation is a tautology.', { src: S('dm-propositional-logic-1', 'satisfiable') });
    }],
    ['Prove an equivalence', function () {
      const T = R.pick([
        ['¬(p ∨ (¬p ∧ q)) ≡ ¬p ∧ ¬q', '¬(p ∨ (¬p ∧ q))<br>≡ ¬p ∧ ¬(¬p ∧ q) &nbsp; (De Morgan)<br>≡ ¬p ∧ (¬¬p ∨ ¬q) &nbsp; (De Morgan)<br>≡ ¬p ∧ (p ∨ ¬q) &nbsp; (double negation)<br>≡ (¬p ∧ p) ∨ (¬p ∧ ¬q) &nbsp; (distributive)<br>≡ F ∨ (¬p ∧ ¬q) &nbsp; (negation law)<br>≡ ¬p ∧ ¬q &nbsp; (identity)', 6],
        ['(p → q) ∧ (p → r) ≡ p → (q ∧ r)', '(p → q) ∧ (p → r)<br>≡ (¬p ∨ q) ∧ (¬p ∨ r) &nbsp; (conditional–disjunction, twice)<br>≡ ¬p ∨ (q ∧ r) &nbsp; (distributive)<br>≡ p → (q ∧ r) &nbsp; (conditional–disjunction)', 4],
        ['¬(p → q) ≡ p ∧ ¬q', '¬(p → q)<br>≡ ¬(¬p ∨ q) &nbsp; (conditional–disjunction)<br>≡ ¬¬p ∧ ¬q &nbsp; (De Morgan)<br>≡ p ∧ ¬q &nbsp; (double negation)', 3],
        ['(p ∧ q) → p is a tautology', '(p ∧ q) → p<br>≡ ¬(p ∧ q) ∨ p &nbsp; (conditional–disjunction)<br>≡ (¬p ∨ ¬q) ∨ p &nbsp; (De Morgan)<br>≡ (¬p ∨ p) ∨ ¬q &nbsp; (commutative, associative)<br>≡ T ∨ ¬q &nbsp; (negation law)<br>≡ T &nbsp; (domination)', 5],
        ['p → (q → r) ≡ (p ∧ q) → r', 'p → (q → r)<br>≡ ¬p ∨ (¬q ∨ r) &nbsp; (conditional–disjunction, twice)<br>≡ (¬p ∨ ¬q) ∨ r &nbsp; (associative)<br>≡ ¬(p ∧ q) ∨ r &nbsp; (De Morgan)<br>≡ (p ∧ q) → r &nbsp; (conditional–disjunction)', 4],
        ['¬(p ↔ q) ≡ p ↔ ¬q', 'Using a truth table is acceptable: both columns are F T T F for rows TT, TF, FT, FF. Or: p ↔ ¬q is true exactly when p and q differ, which is when p ↔ q is false.', 3]
      ]);
      return P.written('Show that <b>' + T[0] + '</b> using a chain of logical equivalences, naming the law at each step.', T[2], ['One mark for each correct step with the law named, up to ' + (T[2] - 1), 'Final line reaches the target, with a clear chain from start to end (1)'], T[1], { src: S(D1, 'Constructing New Logical Equivalences') });
    }]
  ]);
  function elimImp(e) {
    if (e.op === 'var' || e.op === 'const') return e;
    if (e.op === 'not') return N(elimImp(e.a));
    const a = elimImp(e.a), b = elimImp(e.b);
    if (e.op === 'imp') return B('or', N(a), b);
    if (e.op === 'iff') return B('and', B('or', N(a), b), B('or', N(b), a));
    if (e.op === 'xor') return B('or', B('and', a, N(b)), B('and', N(a), b));
    return B(e.op, a, b);
  }

  /* ===== Week 2: predicate logic ===== */
  const PREDS = [['x > K', function (x, k) { return x > k; }], ['x is even', function (x) { return x % 2 === 0; }], ['x² < K', function (x, k) { return x * x < k; }], ['x ≠ K', function (x, k) { return x !== k; }], ['x² ≥ x', function (x) { return x * x >= x; }], ['x + K > 0', function (x, k) { return x + k > 0; }]];
  P.week('dm', 2, 'Predicate logic and quantifiers', { lessons: ['dm-pred'] }, [
    ['Evaluate ∀ and ∃', function () {
      const dom = sortN(R.distinct(R.int(4, 6), -3, 6)), pr = R.pick(PREDS), k = R.int(-1, 9), q = R.pick(['∀x', '∃x', '∃x ¬', '∀x ¬']);
      const P0 = function (x) { return pr[1](x, k); }, txt = pr[0].replace('K', k);
      const val = q === '∀x' ? dom.every(P0) : q === '∃x' ? dom.some(P0) : q === '∃x ¬' ? dom.some(function (x) { return !P0(x); }) : dom.every(function (x) { return !P0(x); });
      const st = q === '∀x' ? '∀x. P(x)' : q === '∃x' ? '∃x. P(x)' : q === '∃x ¬' ? '∃x. ¬P(x)' : '∀x. ¬P(x)';
      const yes = dom.filter(P0), no = dom.filter(function (x) { return !P0(x); });
      return P.mcq('Let P(x) be “' + txt + '” and the domain be ' + setS(dom) + '. Is <b>' + st + '</b> true?', val ? 'True' : 'False', [val ? 'False' : 'True'], 'P(x) holds for ' + setS(yes) + ' and fails for ' + setS(no) + '. ∀ needs every element (one counterexample makes it false); ∃ needs just one witness. Think of ∀ as a loop that must never find a failure.', { src: S(D2, 'Quantifiers') });
    }],
    ['Nested quantifiers', function () {
      const n = R.int(2, 4), dom = Array.from({ length: n }, function (_, i) { return i + 1; });
      const Ps = [['x + y = ' + (n + 1), function (x, y) { return x + y === n + 1; }], ['x < y', function (x, y) { return x < y; }], ['x ≤ y', function (x, y) { return x <= y; }], ['x · y = x', function (x, y) { return x * y === x; }], ['x + y is even', function (x, y) { return (x + y) % 2 === 0; }]];
      const pr = R.pick(Ps), Qs = ['∀x ∃y', '∃y ∀x', '∀x ∀y', '∃x ∃y', '∃x ∀y', '∀y ∃x'], q = R.pick(Qs);
      const ev = function (q) {
        const f = pr[1];
        if (q === '∀x ∃y') return dom.every(function (x) { return dom.some(function (y) { return f(x, y); }); });
        if (q === '∃y ∀x') return dom.some(function (y) { return dom.every(function (x) { return f(x, y); }); });
        if (q === '∀x ∀y') return dom.every(function (x) { return dom.every(function (y) { return f(x, y); }); });
        if (q === '∃x ∃y') return dom.some(function (x) { return dom.some(function (y) { return f(x, y); }); });
        if (q === '∃x ∀y') return dom.some(function (x) { return dom.every(function (y) { return f(x, y); }); });
        return dom.every(function (y) { return dom.some(function (x) { return f(x, y); }); });
      };
      const v = ev(q);
      return P.mcq('Domain ' + setS(dom) + ' for both x and y. Let P(x, y) be “' + pr[0] + '”. Is <b>' + q + '. P(x, y)</b> true?', v ? 'True' : 'False', [v ? 'False' : 'True'], 'Read it as nested loops, outer quantifier first. ' + q + ': ' + (v ? 'true.' : 'false.') + ' For comparison: ∀x ∃y is ' + (ev('∀x ∃y') ? 'true' : 'false') + ', ∃y ∀x is ' + (ev('∃y ∀x') ? 'true' : 'false') + '. Swapping ∀ and ∃ can change the meaning.', { src: S(D2, 'nested loops') });
    }],
    ['Negate a quantified statement', function () {
      const nm = R.pick([['S', 'J'], ['P', 'Q'], ['M', 'R']]), a = nm[0], b = nm[1];
      const T = R.pick([
        ['¬∀x. ' + a + '(x)', '∃x. ¬' + a + '(x)', ['∀x. ¬' + a + '(x)', '¬∃x. ' + a + '(x)', '∃x. ' + a + '(x)']],
        ['¬∃x. (' + a + '(x) ∧ ' + b + '(x))', '∀x. (' + a + '(x) → ¬' + b + '(x))', ['∃x. (¬' + a + '(x) ∧ ¬' + b + '(x))', '∀x. (¬' + a + '(x) ∧ ¬' + b + '(x))', '∃x. (' + a + '(x) → ¬' + b + '(x))']],
        ['¬∀x. (' + a + '(x) → ' + b + '(x))', '∃x. (' + a + '(x) ∧ ¬' + b + '(x))', ['∃x. (' + a + '(x) → ¬' + b + '(x))', '∀x. (' + a + '(x) ∧ ¬' + b + '(x))', '∃x. (¬' + a + '(x) → ' + b + '(x))']],
        ['¬∀x ∃y. ' + a + '(x, y)', '∃x ∀y. ¬' + a + '(x, y)', ['∀x ∃y. ¬' + a + '(x, y)', '∃y ∀x. ¬' + a + '(x, y)', '∃x ∃y. ¬' + a + '(x, y)']],
        ['¬∃x ∀y. ' + a + '(x, y)', '∀x ∃y. ¬' + a + '(x, y)', ['∃x ∀y. ¬' + a + '(x, y)', '∀y ∃x. ¬' + a + '(x, y)', '∀x ∀y. ¬' + a + '(x, y)']]
      ]);
      return P.mcq('Which statement is equivalent to <b>' + T[0] + '</b>?', T[1], T[2], 'Push ¬ inwards one quantifier at a time: ¬∀ becomes ∃¬ and ¬∃ becomes ∀¬ (De Morgan’s laws for quantifiers). Then use ¬(p → q) ≡ p ∧ ¬q and ¬(p ∧ q) ≡ p → ¬q.', { src: S(D2, 'De Morgan’s Laws for Quantifiers') });
    }],
    ['English to logic', function () {
      const W = R.pick([['student', 'has taken Java'], ['lecturer', 'has a PhD'], ['dog', 'is friendly'], ['module', 'has an exam']]), s = 'S(x): x is a ' + W[0] + ', T(x): x ' + W[1];
      const T = R.pick([['Every ' + W[0] + ' ' + W[1] + '.', '∀x. (S(x) → T(x))', ['∀x. (S(x) ∧ T(x))', '∃x. (S(x) → T(x))', '∀x. (T(x) → S(x))'], '“Every A is B” uses ∀ with →. ∀x (S(x) ∧ T(x)) would say everything is a ' + W[0] + '.'],
        ['Some ' + W[0] + ' ' + W[1] + '.', '∃x. (S(x) ∧ T(x))', ['∃x. (S(x) → T(x))', '∀x. (S(x) ∧ T(x))', '∃x. S(x) → T(x)'], '“Some A is B” uses ∃ with ∧. ∃x (S(x) → T(x)) is true as soon as anything is not a ' + W[0] + '.'],
        ['No ' + W[0] + ' ' + W[1] + '.', '∀x. (S(x) → ¬T(x))', ['∀x. ¬(S(x) → T(x))', '∃x. (S(x) ∧ ¬T(x))', '¬∀x. (S(x) → T(x))'], '“No A is B” is ¬∃x (S(x) ∧ T(x)), which is equivalent to ∀x (S(x) → ¬T(x)).'],
        ['Not every ' + W[0] + ' ' + W[1] + '.', '∃x. (S(x) ∧ ¬T(x))', ['∀x. (S(x) → ¬T(x))', '∃x. (S(x) → ¬T(x))', '¬∃x. (S(x) ∧ T(x))'], '¬∀x (S(x) → T(x)) ≡ ∃x (S(x) ∧ ¬T(x)): there is a ' + W[0] + ' who does not.']]);
      return P.mcq('Domain: everything. ' + s + '. Translate: “' + T[0] + '”', T[1], T[2], T[3], { src: S(D2, 'every student') });
    }],
    ['Order of quantifiers', function () {
      const T = R.pick([['∀x ∃y. (x + y = 0)', 'ℝ', true, 'Take y = −x.'], ['∃y ∀x. (x + y = 0)', 'ℝ', false, 'No single y works for every x.'], ['∀x ∃y. (x < y)', 'ℤ', true, 'Take y = x + 1.'], ['∃y ∀x. (x < y)', 'ℤ', false, 'There is no largest integer.'],
        ['∀x ∃y. (x · y = 1)', 'ℝ', false, 'x = 0 has no inverse: the slide’s “every real number has an inverse” needs x ≠ 0.'], ['∃x ∀y. (x · y = 0)', 'ℝ', true, 'x = 0 works for every y.'], ['∀x ∀y. (x + y = y + x)', 'ℝ', true, 'Addition is commutative.'], ['∃x ∃y. (x + y ≠ y + x)', 'ℝ', false, 'Negation of the commutativity statement.'],
        ['∀x ∃y. (y = x²)', 'ℤ', true, 'Square x.'], ['∀y ∃x. (y = x²)', 'ℤ', false, 'y = 2 (or any negative y) is not a square of an integer.']]);
      return P.mcq('Domain ' + T[1] + '. Is <b>' + T[0] + '</b> true?', T[2] ? 'True' : 'False', [T[2] ? 'False' : 'True'], T[3] + ' With ∀x ∃y, y may depend on x; with ∃y ∀x, one y must work for all x.', { src: S(D2, 'Order of Quantifiers') });
    }]
  ]);

  /* ===== Week 3: proofs ===== */
  const RULES = [['Modus ponens', function (p, q) { return [['If ' + p[0] + ', then ' + q[0] + '.', p[0][0].toUpperCase() + p[0].slice(1) + '.'], q[0]]; }],
    ['Modus tollens', function (p, q) { return [['If ' + p[0] + ', then ' + q[0] + '.', q[1][0].toUpperCase() + q[1].slice(1) + '.'], p[1]]; }],
    ['Hypothetical syllogism', function (p, q, r) { return [['If ' + p[0] + ', then ' + q[0] + '.', 'If ' + q[0] + ', then ' + r[0] + '.'], 'if ' + p[0] + ', then ' + r[0]]; }],
    ['Disjunctive syllogism', function (p, q) { return [[p[0][0].toUpperCase() + p[0].slice(1) + ' or ' + q[0] + '.', p[1][0].toUpperCase() + p[1].slice(1) + '.'], q[0]]; }],
    ['Addition', function (p, q) { return [[p[0][0].toUpperCase() + p[0].slice(1) + '.'], p[0] + ' or ' + q[0]]; }],
    ['Simplification', function (p, q) { return [[p[0][0].toUpperCase() + p[0].slice(1) + ' and ' + q[0] + '.'], p[0]]; }],
    ['Conjunction', function (p, q) { return [[p[0][0].toUpperCase() + p[0].slice(1) + '.', q[0][0].toUpperCase() + q[0].slice(1) + '.'], p[0] + ' and ' + q[0]]; }],
    ['Resolution', function (p, q, r) { return [[p[0][0].toUpperCase() + p[0].slice(1) + ' or ' + q[0] + '.', p[1][0].toUpperCase() + p[1].slice(1) + ' or ' + r[0] + '.'], q[0] + ' or ' + r[0]]; }]];
  const FORMS = { 'Modus ponens': 'p → q, p ∴ q', 'Modus tollens': 'p → q, ¬q ∴ ¬p', 'Hypothetical syllogism': 'p → q, q → r ∴ p → r', 'Disjunctive syllogism': 'p ∨ q, ¬p ∴ q', 'Addition': 'p ∴ p ∨ q', 'Simplification': 'p ∧ q ∴ p', 'Conjunction': 'p, q ∴ p ∧ q', 'Resolution': 'p ∨ q, ¬p ∨ r ∴ q ∨ r' };
  function isPrime(n) { if (n < 2) return false; for (let i = 2; i * i <= n; i++) if (n % i === 0) return false; return true; }
  function ints(s) { return String(s).split(/[,;\s]+/).filter(Boolean).map(Number); }
  P.week('dm', 3, 'Rules of inference and proof methods', { lessons: ['dm-proofs'] }, [
    ['Name the rule of inference', function () {
      const ph = R.sample(PH, 3), rule = R.pick(RULES), a = rule[1](ph[0], ph[1], ph[2]);
      return P.mcq('Which rule of inference justifies this argument?<br>' + a[0].map(function (x) { return x; }).join('<br>') + '<br>∴ ' + a[1][0].toUpperCase() + a[1].slice(1) + '.', rule[0], R.sample(RULES.filter(function (r) { return r !== rule; }).map(function (r) { return r[0]; }), 3), rule[0] + ': ' + FORMS[rule[0]] + '.', { src: S(D3, rule[0]) });
    }],
    ['Valid or a fallacy?', function () {
      const ph = R.sample(PH, 2), p = ph[0], q = ph[1], k = R.int(0, 3);
      const T = [[q[0], p[0], 'Invalid: affirming the conclusion', 'From p → q and q you cannot conclude p: q might be true for another reason.'], [p[1], q[1], 'Invalid: denying the hypothesis', 'From p → q and ¬p you cannot conclude ¬q.'], [p[0], q[0], 'Valid: modus ponens', 'p → q and p give q.'], [q[1], p[1], 'Valid: modus tollens', 'p → q and ¬q give ¬p.']][k];
      const cap = function (s) { return s[0].toUpperCase() + s.slice(1); };
      return P.mcq('If ' + p[0] + ', then ' + q[0] + '. ' + cap(T[0]) + '. Therefore ' + T[1] + '. Is this argument valid?', T[2], ['Invalid: affirming the conclusion', 'Invalid: denying the hypothesis', 'Valid: modus ponens', 'Valid: modus tollens'].filter(function (x) { return x !== T[2]; }), T[3] + ' An argument is valid when the conclusion must be true whenever all the premises are: check (premises) → conclusion is a tautology.', { src: S(D3, 'valid') });
    }],
    ['Choose a proof method', function () {
      return P.cls([['If n² is even, then n is even.', 'Proof by contraposition', 'Proving “if n is odd then n² is odd” is direct and easy.'], ['√2 is irrational.', 'Proof by contradiction', 'Assume √2 = a/b in lowest terms and derive a contradiction.'], ['If n is an integer, then n² ≥ n.', 'Proof by cases', 'The slides split into n = 0, n ≥ 1 and n ≤ −1.'],
        ['(n + 1)³ ≥ 3ⁿ for every positive integer n ≤ 4.', 'Exhaustive proof', 'Only four cases: check them all.'], ['If n is odd, then n² is odd.', 'Direct proof', 'Write n = 2k + 1 and expand.'], ['There are irrational x and y with xʸ rational.', 'Non-constructive existence proof', 'The slides consider √2^√2 without deciding which case holds.'],
        ['“Every positive integer is the sum of two squares.”', 'Counterexample', '3 is not a sum of two squares, so the “for all” claim is false.'], ['There is a positive integer that is the sum of two cubes in two different ways.', 'Constructive existence proof', '1729 = 1³ + 12³ = 9³ + 10³.']],
        'Which proof method fits best?<br><b>%s</b>', ['Direct proof', 'Proof by contraposition', 'Proof by contradiction', 'Proof by cases', 'Exhaustive proof', 'Counterexample', 'Constructive existence proof', 'Non-constructive existence proof'], { src: S(D3, 'Proof by Contradiction') });
    }],
    ['Find a counterexample', function () {
      const cc = R.pick([5, 11, 17, 41]);
      const T = R.pick([
        ['For every positive integer n, n² + n + ' + cc + ' is prime.', function (v) { const n = v[0]; return Number.isInteger(n) && n > 0 && !isPrime(n * n + n + cc); }, 'n = ' + (cc - 1) + ': ' + (cc - 1) + '² + ' + (cc - 1) + ' + ' + cc + ' = ' + cc * cc + ' = ' + cc + '², not prime.', 'n', String(cc - 1)],
        ['For every positive integer n, 2ⁿ > n².', function (v) { const n = v[0]; return Number.isInteger(n) && n > 0 && Math.pow(2, n) <= n * n; }, 'n = 2, 3 or 4: for example 2⁴ = 16 = 4².', 'n', '3'],
        ['Every positive integer is the sum of the squares of two integers.', function (v) { const n = v[0]; if (!Number.isInteger(n) || n < 1) return false; for (let a = 0; a * a <= n; a++) { const b = Math.round(Math.sqrt(n - a * a)); if (b * b === n - a * a) return false; } return true; }, 'n = 3 (also 6, 7, 11, …): 3 − 0 = 3, 3 − 1 = 2 and neither is a square.', 'n', '3'],
        ['For every integer n, if n² is divisible by 4 then n is divisible by 4.', function (v) { const n = v[0]; return Number.isInteger(n) && (n * n) % 4 === 0 && n % 4 !== 0; }, 'n = 2: 4 is divisible by 4 but 2 is not (any n ≡ 2 mod 4 works).', 'n', '6'],
        ['Every odd integer greater than 1 is prime.', function (v) { const n = v[0]; return Number.isInteger(n) && n > 1 && n % 2 === 1 && !isPrime(n); }, 'n = 9 = 3 × 3.', 'n', '15'],
        ['For all integers a and b, if a² = b² then a = b.', function (v) { return v.length === 2 && v.every(Number.isInteger) && v[0] * v[0] === v[1] * v[1] && v[0] !== v[1]; }, 'a = 2, b = −2: both squares are 4.', 'a, b', '3, −3'],
        ['For every real number x, x² > x.', function (v) { const x = v[0]; return v.length === 1 && isFinite(x) && x * x <= x; }, 'x = 1 (or 0, or 0.5): 1² = 1 is not greater than 1.', 'x', '0.5']
      ]);
      return P.text('Disprove with a counterexample: <b>' + T[0] + '</b> Type your counterexample (' + T[3] + ').', 'custom', null, 'To disprove a “for all” statement, one value that makes it false is enough. One counterexample: ' + T[2],
        { ph: T[3], showAns: T[2], testAns: T[4], checkFn: function (s) { const v = ints(String(s).replace(/−/g, '-').replace(/[a-z=]/gi, ' ')); if (!v.length || v.some(isNaN)) return { bad: 'Type a value, e.g. ' + (T[3] === 'a, b' ? '3, 5' : '7') + '.' }; return { ok: T[1](v) }; }, src: S(D3, 'Counterexamples') });
    }],
    ['Write a proof', function () {
      if (R.chance(0.5)) {
        const k = R.int(2, 9), c = R.int(1, 9), even = (k + c) % 2 === 0;
        return P.written('Prove: if n is an odd integer, then ' + k + 'n + ' + c + ' is ' + (even ? 'even' : 'odd') + '.', 4,
          ['Uses the definition: n odd means n = 2m + 1 for some integer m (1)', 'Substitutes and expands: ' + k + 'n + ' + c + ' = ' + (2 * k) + 'm + ' + (k + c) + ' (1)', 'Writes it as ' + (even ? '2(' + k + 'm + ' + (k + c) / 2 + ')' : '2(' + k + 'm + ' + (k + c - 1) / 2 + ') + 1') + ' with the bracket an integer (1)', 'Concludes by the definition of ' + (even ? 'even' : 'odd') + ' (1)'],
          'Assume n is odd, so n = 2m + 1 for some integer m. Then ' + k + 'n + ' + c + ' = ' + k + '(2m + 1) + ' + c + ' = ' + (2 * k) + 'm + ' + (k + c) + ' = ' + (even ? '2(' + k + 'm + ' + (k + c) / 2 + ')' : '2(' + k + 'm + ' + (k + c - 1) / 2 + ') + 1') + '. Since ' + k + 'm + ' + (even ? (k + c) / 2 : (k + c - 1) / 2) + ' is an integer, ' + k + 'n + ' + c + ' is ' + (even ? 'even' : 'odd') + ' by definition. ∎', { src: S(D3, 'Even and Odd') });
      }
      const T = R.pick([
        ['If n² is even, then n is even.', ['Chooses contraposition: prove “if n is odd then n² is odd” (1)', 'n = 2k + 1 (1)', 'n² = 4k² + 4k + 1 = 2(2k² + 2k) + 1 (1)', 'So n² is odd; the contrapositive proves the statement (1)'], 'By contraposition. Suppose n is odd, n = 2k + 1. Then n² = 4k² + 4k + 1 = 2(2k² + 2k) + 1, which is odd. So “n odd → n² odd”, and by contraposition “n² even → n even”. ∎', 4],
        ['√2 is irrational.', ['Assumes the opposite: √2 = a/b with integers a, b, b ≠ 0, in lowest terms (1)', 'Gets a² = 2b², so a² is even, so a is even: a = 2c (1)', 'Then 4c² = 2b², b² = 2c², so b is even too (1)', 'Contradiction with lowest terms (1)', 'Concludes √2 is irrational (1)'], 'Suppose √2 = a/b in lowest terms. Then a² = 2b², so a² is even and hence a is even, a = 2c. So 4c² = 2b², giving b² = 2c², so b is even. Both even contradicts lowest terms. Hence √2 is irrational. ∎', 5],
        ['If n is an integer, then n² ≥ n.', ['Splits into cases that cover every integer, e.g. n = 0, n ≥ 1, n ≤ −1 (1)', 'n = 0: 0 ≥ 0 (1)', 'n ≥ 1: multiply n ≥ 1 by n > 0 to get n² ≥ n (1)', 'n ≤ −1: n² ≥ 0 > n (1)'], 'Case n = 0: 0² = 0 ≥ 0. Case n ≥ 1: multiplying both sides of n ≥ 1 by the positive n gives n² ≥ n. Case n ≤ −1: n² ≥ 0 and n &lt; 0, so n² &gt; n. The cases cover all integers. ∎', 4],
        ['The sum of two odd integers is even.', ['Writes a = 2j + 1, b = 2k + 1 with integers j, k (different letters!) (1)', 'a + b = 2j + 2k + 2 (1)', '= 2(j + k + 1), an integer times 2 (1)', 'Concludes even by definition (1)'], 'Let a = 2j + 1 and b = 2k + 1. Then a + b = 2j + 2k + 2 = 2(j + k + 1), and j + k + 1 is an integer, so a + b is even. ∎ (Using the same letter for both would only prove it for a = b.)', 4]
      ]);
      return P.written('Prove: ' + T[0], T[3], T[1], T[2], { src: S(D3, 'Proof') });
    }],
    ['Quantifier rules', function () {
      return P.cls([['From “∀x. Mortal(x)” conclude “Mortal(Socrates)”.', 'Universal instantiation (UI)', 'What holds for all holds for any particular element.'], ['Having shown P(c) for an arbitrary c, conclude ∀x. P(x).', 'Universal generalisation (UG)', 'c must be arbitrary: nothing special assumed about it.'],
        ['From ∃x. P(x), introduce a new name c with P(c).', 'Existential instantiation (EI)', 'c must be a fresh name, not one already used.'], ['From P(7), conclude ∃x. P(x).', 'Existential generalisation (EG)', 'One example is a witness.']],
        'Which rule is used?<br><b>%s</b>', ['Universal instantiation (UI)', 'Universal generalisation (UG)', 'Existential instantiation (EI)', 'Existential generalisation (EG)'], { src: S(D3, 'Universal Instantiation') });
    }]
  ]);

  /* ===== Week 4: sets ===== */
  function U10() { return Array.from({ length: 10 }, function (_, i) { return i + 1; }); }
  function sub10(k) { return sortN(R.sample(U10(), k)); }
  P.week('dm', 4, 'Set theory', { lessons: ['dm-sets'] }, [
    ['Set operations', function () {
      const U = U10(), A = sub10(R.int(3, 6)), Bs = sub10(R.int(3, 6)), C = sub10(R.int(3, 5));
      const has = function (s, x) { return s.indexOf(x) >= 0; };
      const ops = [['A ∪ B', function (x) { return has(A, x) || has(Bs, x); }], ['A ∩ B', function (x) { return has(A, x) && has(Bs, x); }], ['A − B', function (x) { return has(A, x) && !has(Bs, x); }], ['B − A', function (x) { return has(Bs, x) && !has(A, x); }],
        ['Ā (complement of A in U)', function (x) { return !has(A, x); }], ['A ∩ (B ∪ C)', function (x) { return has(A, x) && (has(Bs, x) || has(C, x)); }], ['(A ∪ B) − C', function (x) { return (has(A, x) || has(Bs, x)) && !has(C, x); }], ['complement of (A ∪ B)', function (x) { return !(has(A, x) || has(Bs, x)); }]];
      const o = R.pick(ops), res = U.filter(o[1]), useC = o[0].indexOf('C') >= 0;
      return P.text('U = {1, 2, …, 10}, A = ' + setS(A) + ', B = ' + setS(Bs) + (useC ? ', C = ' + setS(C) : '') + '. Write <b>' + o[0] + '</b> in roster form (type {} for the empty set).', 'set', [setS(res)], 'Go through U one element at a time and test membership. Result: ' + setS(res) + '.', { ph: '{1, 2, 3}', src: S(D4, o[0].indexOf('∪') >= 0 ? 'Union' : o[0].indexOf('∩') >= 0 ? 'Intersection' : o[0].indexOf('−') >= 0 ? 'Difference' : 'Complement') });
    }],
    ['Cardinality and power sets', function () {
      const t = R.int(0, 3);
      if (t === 0) { const k = R.int(0, 6); return P.num('A set A has ' + k + ' elements. How many elements does its power set P(A) have?', Math.pow(2, k), 0, '|P(A)| = 2^|A| = 2^' + k + ' = ' + Math.pow(2, k) + ': each element is either in a subset or not. (Even P(∅) = {∅} has 1 element.)', { src: S(D4, 'power set') }); }
      if (t === 1) { const a = R.int(2, 5), b = R.int(2, 5); return P.num('|A| = ' + a + ' and |B| = ' + b + '. What is |A × B|?', a * b, 0, 'The Cartesian product has one pair (x, y) for each choice of x ∈ A and y ∈ B: ' + a + ' × ' + b + ' = ' + a * b + '.', { src: S(D7, 'Cartesian') }); }
      if (t === 2) { const a = R.int(20, 80), b = R.int(20, 80), both = R.int(5, Math.min(a, b) - 1); return P.num('In a class, ' + a + ' students take Python, ' + b + ' take Java and ' + both + ' take both. How many take at least one of the two?', a + b - both, 0, '|P ∪ J| = |P| + |J| − |P ∩ J| = ' + a + ' + ' + b + ' − ' + both + ' = ' + (a + b - both) + '. Subtract the overlap because it was counted twice.'); }
      const k = R.int(1, 4); return P.num('How many subsets of {1, 2, …, ' + (k + 2) + '} contain the element 1?', Math.pow(2, k + 1), 0, 'Fix 1 as included; each of the other ' + (k + 1) + ' elements is in or out: 2^' + (k + 1) + ' = ' + Math.pow(2, k + 1) + '. That is half of all 2^' + (k + 2) + ' subsets.');
    }],
    ['∈ or ⊆?', function () {
      const pool = ['1', '2', '3', '{1}', '{2}', '{1, 2}', '∅'];
      const A = R.sample(pool, R.int(3, 4)), inA = function (x) { return A.indexOf(x) >= 0; };
      const stm = [];
      ['1', '2', '3', '{1}', '{2}', '{1, 2}', '∅'].forEach(function (x) { stm.push([x + ' ∈ A', inA(x)]); });
      stm.push(['∅ ⊆ A', true], ['{1} ⊆ A', inA('1')], ['{2} ⊆ A', inA('2')], ['{1, 2} ⊆ A', inA('1') && inA('2')], ['{{1}} ⊆ A', inA('{1}')]);
      const tr = R.shuffle(stm.filter(function (s) { return s[1]; })), fl = R.shuffle(stm.filter(function (s) { return !s[1]; }));
      if (!tr.length || fl.length < 3) return null;
      return P.mcq('A = {' + A.join(', ') + '}. Which statement is true?', tr[0][0], fl.slice(0, 3).map(function (s) { return s[0]; }), 'x ∈ A asks whether x is listed as an element of A. S ⊆ A asks whether every element of S is an element of A. So {1} ⊆ A needs 1 ∈ A, while {1} ∈ A needs {1} itself to be listed. ∅ ⊆ A is always true; ∅ ∈ A only if ∅ is listed.', { src: S(D4, 'Subsets') });
    }],
    ['Set-builder to roster', function () {
      const T = R.pick([function () { const a = R.int(1, 4), b = R.int(10, 30); const r = []; for (let x = -6; x <= 6; x++) if (a <= x * x && x * x < b) r.push(x); return ['{x ∈ ℤ | ' + a + ' ≤ x² &lt; ' + b + '}', r]; },
        function () { const k = R.int(2, 5), m = R.int(12, 30); const r = []; for (let x = 0; x < m; x++) if (x % k === 0) r.push(x); return ['{x ∈ ℕ | x is a multiple of ' + k + ' and x &lt; ' + m + '}', r]; },
        function () { const a = R.int(1, 5), b = R.int(3, 9); const r = []; for (let x = -a + 1; x <= b; x++) if (Math.abs(x % 2) === 1) r.push(x); return ['{x ∈ ℤ | −' + a + ' &lt; x ≤ ' + b + ' and x is odd}', r]; }])();
      return P.text('Write <b>' + T[0] + '</b> in roster form.', 'set', [setS(T[1])], 'Test each candidate: ' + setS(T[1]) + '. Remember ℕ starts at 0 on your slides, and x² ≥ a includes negative x.', { ph: '{…}', src: S(D4, 'Set-Builder') });
    }],
    ['Membership tables', function () {
      const ex = R.pick([['A ∩ (B ∪ C)', 'A ∧ (B ∨ C)'], ['(A ∩ B) ∪ C', '(A ∧ B) ∨ C'], ['A − (B ∩ C)', 'A ∧ ¬(B ∧ C)'], ['(A ∪ B) − C', '(A ∨ B) ∧ ¬C'], ['A ∩ B̄', 'A ∧ ¬B'], ['(A − B) ∪ (B − A)', '(A ∧ ¬B) ∨ (B ∧ ¬A)']]);
      const e = LG.parse(ex[1].toLowerCase()), vs = LG.vars(e), col = tt(e, vs).replace(/T/g, '1').replace(/F/g, '0');
      return P.text('Build the membership table for <b>' + ex[0] + '</b>. Type its final column from top to bottom as 1s and 0s. Rows run in the usual order: ' + (vs.length === 3 ? '111, 110, 101, 100, 011, 010, 001, 000' : '11, 10, 01, 00') + ' for ' + vs.join(', ').toUpperCase() + '.', 'tf', [col],
        'Membership tables work like truth tables: ∩ is ∧, ∪ is ∨, complement is ¬ and A − B is A ∧ ¬B. Column: ' + col + '.', { ph: vs.length === 3 ? '8 digits' : '4 digits', src: S(D4, 'Membership Table') });
    }],
    ['Prove a set identity', function () {
      const T = R.pick([
        ['complement of (A ∩ B) = Ā ∪ B̄ (De Morgan)', 'Subset method. (⊆) Let x ∈ complement of (A ∩ B). Then x ∉ A ∩ B, so ¬(x ∈ A ∧ x ∈ B), so x ∉ A ∨ x ∉ B (De Morgan for logic), so x ∈ Ā ∨ x ∈ B̄, so x ∈ Ā ∪ B̄. (⊇) Each step reverses. Hence the sets are equal. ∎'],
        ['A ∪ (A ∩ B) = A (absorption)', '(⊆) Let x ∈ A ∪ (A ∩ B). Then x ∈ A, or x ∈ A ∩ B, which also gives x ∈ A. (⊇) If x ∈ A then x ∈ A ∪ (anything). So both inclusions hold. ∎'],
        ['A − B = A ∩ B̄', 'x ∈ A − B ⇔ x ∈ A ∧ x ∉ B ⇔ x ∈ A ∧ x ∈ B̄ ⇔ x ∈ A ∩ B̄. Each step is a definition, so the sets are equal. ∎'],
        ['A ∩ (B ∪ C) = (A ∩ B) ∪ (A ∩ C)', 'Membership table: list the 8 rows for A, B, C; the columns for A ∩ (B ∪ C) and (A ∩ B) ∪ (A ∩ C) are both 1,1,1,0,0,0,0,0. Identical columns prove the identity. (Or: x ∈ LHS ⇔ x ∈ A ∧ (x ∈ B ∨ x ∈ C) ⇔ (x ∈ A ∧ x ∈ B) ∨ (x ∈ A ∧ x ∈ C) ⇔ x ∈ RHS, by the distributive law of logic.) ∎']
      ]);
      return P.written('Prove the set identity <b>' + T[0] + '</b>.', 4, ['States a valid method: subset method (show ⊆ both ways), a membership table, or a chain of identities (1)', 'Each step follows from a definition or a named law (1)', 'Covers both directions / all rows (1)', 'Concludes the sets are equal (1)'], T[1], { src: S(D4, 'Proving Set Identities') });
    }]
  ]);

  /* ===== Week 5: functions and sequences ===== */
  function mapping(nA, nB, kind0) {
    const A = ['a', 'b', 'c', 'd'].slice(0, nA), Bv = [1, 2, 3, 4].slice(0, nB), m = {};
    A.forEach(function (x) { m[x] = R.pick(Bv); });
    return { A: A, B: Bv, m: m };
  }
  function classify(F) {
    const vals = F.A.map(function (x) { return F.m[x]; }), inj = new Set(vals).size === vals.length, sur = F.B.every(function (y) { return vals.indexOf(y) >= 0; });
    return inj && sur ? 'Bijective' : inj ? 'Injective but not surjective' : sur ? 'Surjective but not injective' : 'Neither injective nor surjective';
  }
  P.week('dm', 5, 'Functions, sequences and sums', { lessons: ['dm-functions'] }, [
    ['Injective, surjective, bijective?', function () {
      const nA = R.int(3, 4), nB = R.int(3, 4), F = mapping(nA, nB), k = classify(F);
      return P.mcq('f : {' + F.A.join(', ') + '} → {' + F.B.join(', ') + '} with ' + F.A.map(function (x) { return 'f(' + x + ') = ' + F.m[x]; }).join(', ') + '. Which describes f?', k, ['Bijective', 'Injective but not surjective', 'Surjective but not injective', 'Neither injective nor surjective'].filter(function (x) { return x !== k; }),
        'Injective: no two inputs share an output. Surjective: every element of the codomain is hit. Range = ' + setS(sortN(Array.from(new Set(F.A.map(function (x) { return F.m[x]; }))))) + '. ' + (nA > nB ? 'With more inputs than outputs it can never be injective.' : nA < nB ? 'With fewer inputs than outputs it can never be surjective.' : ''), { src: S(D5, 'injective') });
    }],
    ['Functions on ℤ and ℝ', function () {
      const a = R.pick([2, 3, -2, 5]), b = R.int(-5, 5);
      const T = R.pick([['f : ℝ → ℝ, f(x) = ' + a + 'x ' + (b < 0 ? '− ' + -b : '+ ' + b), 'Bijective', 'Injective: ' + a + 'x + b = ' + a + 'y + b gives x = y. Surjective: for any y take x = (y − b)/' + a + ', a real number.'],
        ['f : ℤ → ℤ, f(x) = ' + a + 'x ' + (b < 0 ? '− ' + -b : '+ ' + b), 'Injective but not surjective', 'Injective as before, but (y − b)/' + a + ' is not always an integer, so some integers are never hit.'],
        ['f : ℤ → ℤ, f(x) = x ' + (b < 0 ? '− ' + -b : '+ ' + b), 'Bijective', 'Shifting by a constant is undone by shifting back: inverse f⁻¹(y) = y ' + (b < 0 ? '+ ' + -b : '− ' + b) + '.'],
        ['f : ℤ → ℤ, f(x) = x²', 'Neither injective nor surjective', 'f(−1) = f(1), and negative numbers (and 2) are never outputs.'],
        ['f : ℕ → ℕ, f(x) = x²', 'Injective but not surjective', 'On non-negative numbers squaring is one-to-one, but 2 is not a square.'],
        ['f : ℝ → ℝ, f(x) = x³', 'Bijective', 'Strictly increasing and every real number has a real cube root.'],
        ['f : ℤ → ℕ, f(x) = |x|', 'Surjective but not injective', 'Every n ∈ ℕ is |n|, but |−3| = |3|.']]);
      return P.mcq(T[0] + '. Which describes f?', T[1], ['Bijective', 'Injective but not surjective', 'Surjective but not injective', 'Neither injective nor surjective'].filter(function (x) { return x !== T[1]; }), T[2] + ' The domain and codomain matter as much as the formula.', { src: S(D5, 'Proving Properties') });
    }],
    ['Composition and inverse', function () {
      const a = R.pick([2, 3, -1, 4]), b = R.int(-5, 5), c = R.pick([2, -3, 5, 1]), d = R.int(-4, 4), x0 = R.int(-3, 5);
      if (R.chance(0.6)) { const fg = R.chance(0.5), v = fg ? a * (c * x0 + d) + b : c * (a * x0 + b) + d; return P.num('f(x) = ' + a + 'x + ' + b + ' and g(x) = ' + c + 'x + ' + d + '. What is (' + (fg ? 'f ∘ g' : 'g ∘ f') + ')(' + x0 + ')?', v, 0, '(' + (fg ? 'f ∘ g' : 'g ∘ f') + ')(x) means ' + (fg ? 'f(g(x))' : 'g(f(x))') + ': apply the right-hand function first. ' + (fg ? 'g(' + x0 + ') = ' + (c * x0 + d) + ', then f(' + (c * x0 + d) + ') = ' + v : 'f(' + x0 + ') = ' + (a * x0 + b) + ', then g(' + (a * x0 + b) + ') = ' + v) + '.', { src: S(D5, 'Composition') }); }
      const y = a * x0 + b; return P.num('f : ℝ → ℝ, f(x) = ' + a + 'x + ' + b + ' is a bijection. What is f⁻¹(' + y + ')?', x0, 2, 'f⁻¹(y) = x exactly when f(x) = y: solve ' + a + 'x + ' + b + ' = ' + y + ', x = (' + y + ' − ' + b + ') / ' + a + ' = ' + x0 + '.', { src: S(D5, 'Inverse Functions') });
    }],
    ['Image and preimage', function () {
      const F = mapping(4, 4), S1 = R.sample(F.A, 2), T1 = R.sample(F.B, 2), img = sortN(Array.from(new Set(S1.map(function (x) { return F.m[x]; })))), pre = F.A.filter(function (x) { return T1.indexOf(F.m[x]) >= 0; });
      const ask = R.chance(0.5);
      return P.text('f : {a, b, c, d} → {1, 2, 3, 4} with ' + F.A.map(function (x) { return 'f(' + x + ') = ' + F.m[x]; }).join(', ') + '. Write ' + (ask ? 'the image f({' + S1.join(', ') + '})' : 'the preimage f⁻¹({' + T1.join(', ') + '})') + ' as a set.', 'set', [setS(ask ? img : pre)], ask ? 'The image is the set of outputs of the given inputs: ' + setS(img) + '.' : 'The preimage is every input whose output lies in the set: ' + setS(pre) + ' (it can be empty, and f need not be invertible).', { ph: '{…}', src: S(D5, 'image') });
    }],
    ['Arithmetic and geometric progressions', function () {
      const t = R.int(0, 2);
      if (t === 0) { const a = R.int(-5, 10), d = R.pick([-3, -2, 2, 3, 4, 5]), k = R.int(5, 20); return P.num('An arithmetic progression has first term ' + a + ' and common difference ' + d + '. What is its ' + k + 'th term?', a + (k - 1) * d, 0, 'Terms are a, a + d, a + 2d, …, so the k-th term is a + (k − 1)d = ' + a + ' + ' + (k - 1) + ' × ' + d + ' = ' + (a + (k - 1) * d) + '.', { src: S(D5, 'Arithmetic Progression') }); }
      if (t === 1) { const a = R.int(1, 5), r = R.pick([2, 3, -2]), k = R.int(4, 8); return P.num('A geometric progression has first term ' + a + ' and common ratio ' + r + '. What is its ' + k + 'th term?', a * Math.pow(r, k - 1), 0, 'Terms are a, ar, ar², …, so the k-th term is a·r^(k − 1) = ' + a + ' × (' + r + ')^' + (k - 1) + ' = ' + a * Math.pow(r, k - 1) + '.', { src: S(D5, 'Geometric Progression') }); }
      const a = R.int(1, 4), r = R.pick([2, 3]), n = R.int(3, 7), v = a * (Math.pow(r, n + 1) - 1) / (r - 1);
      return P.num('What is Σ_{j=0}^{' + n + '} ' + a + '·' + r + '^j?', v, 0, 'Geometric sum: Σ_{j=0}^{n} a·r^j = a(r^(n+1) − 1)/(r − 1) = ' + a + '(' + r + '^' + (n + 1) + ' − 1)/' + (r - 1) + ' = ' + v + '. (Check by adding the ' + (n + 1) + ' terms.)', { src: S(D5, 'sum') });
    }],
    ['Recurrence relations', function () {
      if (R.chance(0.5)) { const c = R.pick([2, 3, -1]), d = R.int(-3, 4), a0 = R.int(0, 5), k = R.int(3, 6); let a = a0; const seq = [a0]; for (let i = 1; i <= k; i++) { a = c * a + d; seq.push(a); } return P.num('a₀ = ' + a0 + ' and aₙ = ' + c + '·aₙ₋₁ ' + (d < 0 ? '− ' + -d : '+ ' + d) + ' for n ≥ 1. What is a' + String(k).replace(/\d/g, function (x) { return '₀₁₂₃₄₅₆₇₈₉'[x]; }) + '?', a, 0, 'Apply the recurrence step by step: ' + seq.join(', ') + '.', { src: S(D5, 'Recurrence') }); }
      const a0 = R.int(0, 3), a1 = R.int(1, 4), k = R.int(4, 8); const s = [a0, a1]; for (let i = 2; i <= k; i++) s.push(s[i - 1] + s[i - 2]);
      return P.num('a₀ = ' + a0 + ', a₁ = ' + a1 + ' and aₙ = aₙ₋₁ + aₙ₋₂ for n ≥ 2. What is a' + String(k).replace(/\d/g, function (x) { return '₀₁₂₃₄₅₆₇₈₉'[x]; }) + '?', s[k], 0, 'Two initial conditions, then each term is the sum of the previous two: ' + s.join(', ') + '.', { src: S(D5, 'Recurrence') });
    }],
    ['Prove a function is a bijection', function () {
      const a = R.pick([2, 3, -4, 5]), b = R.int(-6, 6);
      return P.written('Prove that f : ℝ → ℝ, f(x) = ' + a + 'x ' + (b < 0 ? '− ' + -b : '+ ' + b) + ' is a bijection, and give its inverse.', 5,
        ['Injective: assume f(x) = f(y) (1)', 'Deduce ' + a + 'x = ' + a + 'y and so x = y (1)', 'Surjective: take an arbitrary y ∈ ℝ and give x = (y ' + (b < 0 ? '+ ' + -b : '− ' + b) + ')/' + a + ' (1)', 'Check f(x) = y and note x ∈ ℝ (1)', 'Inverse f⁻¹(y) = (y ' + (b < 0 ? '+ ' + -b : '− ' + b) + ')/' + a + ' (1)'],
        'Injective: if f(x) = f(y) then ' + a + 'x + ' + b + ' = ' + a + 'y + ' + b + ', so ' + a + 'x = ' + a + 'y and x = y. Surjective: let y ∈ ℝ and put x = (y − ' + b + ')/' + a + ' ∈ ℝ; then f(x) = y. So f is a bijection with f⁻¹(y) = (y − ' + b + ')/' + a + '. ∎', { src: S(D5, 'Proving Properties') });
    }]
  ]);

  /* ===== Week 7: relations ===== */
  function pairs(R0) { return R0.length ? '{' + R0.map(function (p) { return '(' + p[0] + ', ' + p[1] + ')'; }).join(', ') + '}' : '∅'; }
  function has(R0, a, b) { return R0.some(function (p) { return p[0] === a && p[1] === b; }); }
  function cmp(a, b) { return typeof a === 'number' && typeof b === 'number' ? a - b : String(a) < String(b) ? -1 : String(a) > String(b) ? 1 : 0; }
  function uniq(R0) { const s = {}; return R0.filter(function (p) { const k = p[0] + ',' + p[1]; if (s[k]) return false; s[k] = 1; return true; }).sort(function (x, y) { return cmp(x[0], y[0]) || cmp(x[1], y[1]); }); }
  function props(R0, A) {
    const r = A.every(function (a) { return has(R0, a, a); }), s = R0.every(function (p) { return has(R0, p[1], p[0]); }), an = R0.every(function (p) { return p[0] === p[1] || !has(R0, p[1], p[0]); });
    const t = R0.every(function (p) { return R0.every(function (q) { return p[1] !== q[0] || has(R0, p[0], q[1]); }); });
    return { R: r, S: s, A: an, T: t };
  }
  function compose(S0, R0) { const out = []; R0.forEach(function (p) { S0.forEach(function (q) { if (p[1] === q[0]) out.push([p[0], q[1]]); }); }); return uniq(out); }
  function randRel(A, k) { const out = []; for (let i = 0; i < k; i++) out.push([R.pick(A), R.pick(A)]); return uniq(out); }
  function tclose(R0) { let cur = uniq(R0); for (;;) { const nx = uniq(cur.concat(compose(cur, cur))); if (nx.length === cur.length) return cur; cur = nx; } }
  P.week('dm', 7, 'Relations, closures, equivalence relations and partial orders', { lessons: ['dm-relations'] }, [
    ['Properties of a relation', function () {
      const A = [1, 2, 3].concat(R.chance(0.3) ? [4] : []); let R0;
      const r = Math.random();
      if (r < 0.2) { R0 = A.map(function (a) { return [a, a]; }); const b = R.sample(A, 2); R0.push([b[0], b[1]], [b[1], b[0]]); R0 = uniq(R0); }
      else if (r < 0.35) { R0 = []; A.forEach(function (a) { A.forEach(function (b) { if (a <= b) R0.push([a, b]); }); }); }
      else R0 = randRel(A, R.int(3, 6));
      const pr = props(R0, A), ans = ['R', 'S', 'A', 'T'].filter(function (k) { return pr[k]; }).join('');
      return P.text('On A = ' + setS(A) + ', let R = ' + pairs(R0) + '. Which properties does R have? Type the letters: <b>R</b> reflexive, <b>S</b> symmetric, <b>A</b> antisymmetric, <b>T</b> transitive (type <b>none</b> if it has none).', 'custom', null,
        'Reflexive: ' + (pr.R ? 'every (a, a) is there' : 'missing ' + A.filter(function (a) { return !has(R0, a, a); }).map(function (a) { return '(' + a + ', ' + a + ')'; }).join(', ')) + '. Symmetric: ' + (pr.S ? 'every pair has its mirror' : 'e.g. ' + R0.filter(function (p) { return !has(R0, p[1], p[0]); }).slice(0, 1).map(function (p) { return '(' + p[0] + ', ' + p[1] + ') is in but (' + p[1] + ', ' + p[0] + ') is not'; })) + '. Antisymmetric: ' + (pr.A ? 'no two different elements are related both ways' : 'some a ≠ b are related both ways') + '. Transitive: ' + (pr.T ? 'every (a, b), (b, c) has (a, c)' : 'some (a, b), (b, c) lacks (a, c)') + '.',
        { ph: 'e.g. RST', showAns: ans || 'none', checkFn: function (s) { const t = String(s).toUpperCase(); const mine = /NONE/.test(t) ? '' : t.replace(/[^RSAT]/g, '').split('').sort().filter(function (c, i, a) { return a.indexOf(c) === i; }).join(''); if (!/NONE/.test(t) && !mine) return { bad: 'Type letters from R, S, A, T, or none.' }; return { ok: mine === ans.split('').sort().join('') }; }, src: S(D7, 'Reflexive Relations') });
    }],
    ['Composition S ∘ R', function () {
      const R0 = uniq([[1, R.pick(['a', 'b', 'c'])], [2, R.pick(['a', 'b'])], [R.pick([1, 2, 3]), R.pick(['b', 'c'])], [3, R.pick(['a', 'c'])]].map(function (p) { return [p[0], p[1]]; }));
      const S0 = uniq([['a', R.pick(['x', 'y'])], ['b', R.pick(['y', 'z'])], [R.pick(['a', 'c']), R.pick(['x', 'z'])], ['c', R.pick(['x', 'y', 'z'])]]);
      const res = []; R0.forEach(function (p) { S0.forEach(function (q) { if (p[1] === q[0]) res.push([p[0], q[1]]); }); });
      const ps = function (x) { return '{' + x.map(function (p) { return '(' + p[0] + ', ' + p[1] + ')'; }).join(', ') + '}'; };
      const out = uniq(res.map(function (p) { return [p[0], p[1]]; }));
      return P.text('R ⊆ {1, 2, 3} × {a, b, c} is ' + ps(R0) + ' and S ⊆ {a, b, c} × {x, y, z} is ' + ps(S0) + '. Write <b>S ∘ R</b> as a set of pairs.', 'pairs', [out.length ? ps(out) : '{}'], 'S ∘ R = {(a, c) | ∃b. (a, b) ∈ R ∧ (b, c) ∈ S}: follow an R-arrow, then an S-arrow. Result: ' + (out.length ? ps(out) : '∅') + '. Note R is applied first, even though it is written second.', { ph: '{(1, x), …}', src: S(D7, 'Composition') });
    }],
    ['Closures', function () {
      const A = [1, 2, 3, 4], R0 = randRel(A, R.int(3, 5)), k = R.pick(['reflexive', 'symmetric', 'transitive', 'transitive']);
      const res = k === 'reflexive' ? uniq(R0.concat(A.map(function (a) { return [a, a]; }))) : k === 'symmetric' ? uniq(R0.concat(R0.map(function (p) { return [p[1], p[0]]; }))) : tclose(R0);
      return P.text('On A = {1, 2, 3, 4}, R = ' + pairs(R0) + '. Write the <b>' + k + ' closure</b> of R.', 'pairs', [pairs(res)], 'The closure is the smallest relation containing R with the property. ' + (k === 'reflexive' ? 'Add every missing (a, a).' : k === 'symmetric' ? 'Add the mirror (b, a) of every (a, b).' : 'Keep adding (a, c) whenever (a, b) and (b, c) are present, until nothing changes (R ∪ R² ∪ R³ ∪ …).') + ' Result: ' + pairs(res) + '.', { ph: '{(1, 2), …}', src: S(D7, 'Closures') });
    }],
    ['Equivalence classes', function () {
      const m = R.int(2, 4), n = R.int(7, 12), a = R.int(0, n), cls = []; for (let x = 0; x <= n; x++) if (((x - a) % m + m) % m === 0) cls.push(x);
      return P.text('On A = {0, 1, …, ' + n + '}, x ~ y when x − y is divisible by ' + m + '. This is an equivalence relation. Write the equivalence class [' + a + '].', 'set', [setS(cls)], '[' + a + '] = {y ∈ A | ' + a + ' ~ y}: every element with the same remainder as ' + a + ' on division by ' + m + ': ' + setS(cls) + '. The ' + m + ' classes partition A.', { ph: '{…}', src: S(D7, 'Equivalence Classes') });
    }],
    ['Equivalence relation or partial order?', function () {
      return P.cls([['≤ on ℤ', 'A partial order', 'Reflexive, antisymmetric and transitive.'], ['“divides” on the positive integers', 'A partial order', '1 | 2 and 2 | 4 gives 1 | 4; a | b and b | a forces a = b for positive integers.'], ['= on ℤ', 'Both', 'Equality is reflexive, symmetric, antisymmetric and transitive.'],
        ['“has the same remainder mod 3” on ℤ', 'An equivalence relation', 'Reflexive, symmetric and transitive.'], ['&lt; on ℤ', 'Neither', 'Not reflexive (3 &lt; 3 is false).'], ['⊆ on the subsets of {1, 2, 3}', 'A partial order', 'Reflexive, antisymmetric, transitive.'],
        ['“has the same birthday as” on people', 'An equivalence relation', 'Reflexive, symmetric, transitive.'], ['“x − y is even” on ℤ', 'An equivalence relation', 'Two classes: the evens and the odds.'], ['≠ on ℤ', 'Neither', 'Not reflexive, and not transitive (1 ≠ 2, 2 ≠ 1 but 1 = 1).'], ['≥ on ℤ', 'A partial order', 'The slides’ example of a partial order.']],
        'What is this relation?<br><b>%s</b>', ['An equivalence relation', 'A partial order', 'Both', 'Neither'], { src: S(D7, 'Partial Orderings') });
    }],
    ['Powers of a relation', function () {
      const A = [1, 2, 3, 4], R0 = A.map(function (a) { return [a, R.pick(A)]; }), R2 = compose(R0, R0);
      return P.text('On {1, 2, 3, 4}, R = ' + pairs(R0) + '. Write R² = R ∘ R.', 'pairs', [pairs(R2)], 'R² contains (a, c) whenever you can go a → b → c in two R-steps. ' + R0.map(function (p) { const nx = R0.filter(function (q) { return q[0] === p[1]; }); return p[0] + ' → ' + p[1] + ' → ' + nx.map(function (q) { return q[1]; }).join('/'); }).join('; ') + '. Result: ' + pairs(R2) + '.', { ph: '{(1, 2), …}', src: S(D7, 'Powers') });
    }],
    ['Counting pairs and relations', function () {
      const a = R.int(2, 4), b = R.int(2, 4);
      if (R.chance(0.5)) return P.num('|A| = ' + a + ' and |B| = ' + b + '. How many ordered pairs are in A × B?', a * b, 0, 'One pair for each (x, y): ' + a + ' × ' + b + ' = ' + a * b + '.', { src: S(D7, 'Cartesian') });
      return P.num('|A| = ' + a + ' and |B| = ' + b + '. How many different relations from A to B are there?', Math.pow(2, a * b), 0, 'A relation is any subset of A × B, which has ' + a * b + ' pairs, so there are |P(A × B)| = 2^' + a * b + ' = ' + Math.pow(2, a * b) + ' relations (including ∅).', { src: S(D7, 'Binary Relations') });
    }]
  ]);

  /* ===== Week 9: lists, trees, recursion and structural induction ===== */
  function randTree(d) { if (d <= 0 || R.chance(0.3)) return 'leaf'; return { l: randTree(d - 1), x: R.int(1, 9), r: randTree(d - 1) }; }
  function tshow(t) { return t === 'leaf' ? 'leaf' : 'node(' + tshow(t.l) + ', ' + t.x + ', ' + tshow(t.r) + ')'; }
  function tsize(t) { return t === 'leaf' ? 0 : tsize(t.l) + 1 + tsize(t.r); }
  function tleaves(t) { return t === 'leaf' ? 1 : tleaves(t.l) + tleaves(t.r); }
  function theight(t) { return t === 'leaf' ? 0 : 1 + Math.max(theight(t.l), theight(t.r)); }
  function tsum(t) { return t === 'leaf' ? 0 : tsum(t.l) + t.x + tsum(t.r); }
  P.week('dm', 9, 'Lists, trees, recursion and structural induction', { lessons: ['dm-lists-trees'] }, [
    ['Evaluate a fold', function () {
      const xs = Array.from({ length: R.int(3, 5) }, function () { return R.int(0, 6); });
      const C = R.pick([['0', 'x + r', function (x, r) { return x + r; }, 0, 'this is sum'], ['1', 'x · r', function (x, r) { return x * r; }, 1, 'this is product'], ['0', 'max(x, r)', function (x, r) { return Math.max(x, r); }, 0, 'the largest element (0 for [])'],
        ['0', '2x + r', function (x, r) { return 2 * x + r; }, 0, 'twice the sum'], ['0', 'x + 2r', function (x, r) { return x + 2 * r; }, 0, 'reading the list as binary digits from the right'], ['0', '1 + r', function (x, r) { return 1 + r; }, 0, 'this is length'], ['0', 'r − x', function (x, r) { return r - x; }, 0, 'minus the sum']]);
      let v = C[3]; const steps = []; for (let i = xs.length - 1; i >= 0; i--) { v = C[2](xs[i], v); steps.push(v); }
      return P.num('Using fold(e, c)([]) = e and fold(e, c)(x :: xs) = c(x, fold(e, c)(xs)), evaluate fold(' + C[0] + ', c)([' + xs.join(', ') + ']) where c(x, r) = ' + C[1] + '.', v, 0,
        'Fold replaces [] by e = ' + C[0] + ' and each :: by c, working from the right: starting from ' + C[3] + ', the running values are ' + steps.join(', ') + '. Result ' + v + ' (' + C[4] + ').', { src: S(D9, 'Fold') });
    }],
    ['Lists built from cons', function () {
      const xs = Array.from({ length: R.int(2, 4) }, function () { return R.int(0, 9); });
      if (R.chance(0.5)) return P.text('Write the list [' + xs.join(', ') + '] using only [] and :: (cons).', 'custom', null, '[' + xs.join(', ') + '] = ' + xs.slice(0, -1).map(function (x) { return x + ' :: ('; }).join('') + xs[xs.length - 1] + ' :: []' + ')'.repeat(xs.length - 1) + ', and since :: associates to the right we can drop the brackets: ' + xs.join(' :: ') + ' :: [].',
        { ph: 'e.g. 1 :: 2 :: []', showAns: xs.join(' :: ') + ' :: []', checkFn: function (s) { const t = String(s).replace(/[\s()]/g, ''); return { ok: t === xs.join('::') + '::[]' }; }, src: S(D9, 'Constructing lists') });
      return P.text('Write ' + xs.join(' :: ') + ' :: [] in bracket notation.', 'nospace', ['[' + xs.join(',') + ']'], 'Each :: adds an element to the front of the list on its right: [' + xs.join(', ') + '].', { ph: '[…]', showAns: '[' + xs.join(', ') + ']', src: S(D9, 'Constructing lists') });
    }],
    ['Trees: size, leaves and height', function () {
      let t; do { t = randTree(3); } while (t === 'leaf');
      const k = R.pick([['size', tsize(t), 'size(leaf) = 0 and size(node(l, x, r)) = size(l) + 1 + size(r): it counts the labelled nodes.'], ['number of leaves', tleaves(t), 'leaves(leaf) = 1 and leaves(node(l, x, r)) = leaves(l) + leaves(r). It is always size + 1.'], ['height', theight(t), 'height(leaf) = 0 and height(node(l, x, r)) = 1 + max(height(l), height(r)).'],
        ['sum of the labels, foldtree(0, (a, x, b) ↦ a + x + b)', tsum(t), 'foldtree replaces each leaf by 0 and combines the two results with the label.']]);
      return P.num('For t = ' + tshow(t) + ', what is the ' + k[0] + '?', k[1], 0, k[2] + ' Here: ' + k[1] + '.', { src: S(D9, k[0] === 'height' ? 'The height of a tree' : k[0] === 'size' ? 'The size of a tree' : 'Binary trees') });
    }],
    ['Valid recursive definitions', function () {
      const T = R.pick([['f([]) = 0, f(x :: xs) = 1 + f(xs)', 'Valid: it defines a unique function (the length)', 'A base case for [] and a recursive call on the tail.'],
        ['f([]) = 0, f(x :: xs) = f(x :: xs) + 1', 'Invalid: f(x :: xs) is defined in terms of itself, not the tail', 'There is no f with f(y) = f(y) + 1, so the equations define nothing.'],
        ['f(x :: xs) = x + f(xs) (no equation for [])', 'Invalid: the empty list has no value', 'Every constructor needs a case, or the recursion never stops.'],
        ['f([]) = [], f(x :: xs) = f(xs) ++ [x]', 'Valid: it defines a unique function (reverse)', 'Base case plus recursion on the tail: this reverses the list.'],
        ['f([]) = 0, f(x :: xs) = f(x :: x :: xs)', 'Invalid: the recursive call is on a longer list', 'Recursion must work on smaller components (the tail), or it never reaches the base case.']]);
      return P.mcq('Is this a valid recursive definition of f : List ℕ → ℕ or List A → List A?<br><b>' + T[0] + '</b>', T[1], ['Valid: it defines a unique function (the length)', 'Invalid: f(x :: xs) is defined in terms of itself, not the tail', 'Invalid: the empty list has no value', 'Valid: it defines a unique function (reverse)', 'Invalid: the recursive call is on a longer list'].filter(function (x) { return x !== T[1]; }).slice(0, 3), T[2], { src: S(D9, 'Valid recursive definitions') });
    }],
    ['Structural induction', function () {
      const T = R.pick([
        ['For every tree t, leaves(t) = size(t) + 1, where leaves(leaf) = 1 and leaves(node(l, x, r)) = leaves(l) + leaves(r).', ['Leaf case: leaves(leaf) = 1 = 0 + 1 = size(leaf) + 1 (1)', 'Node case states both inductive hypotheses for l and r (1)', 'leaves(node(l, x, r)) = leaves(l) + leaves(r) = (size(l) + 1) + (size(r) + 1) (1)', '= (size(l) + 1 + size(r)) + 1 = size(node(l, x, r)) + 1 (1)', 'Concludes by induction on trees (1)'],
          'Leaf: leaves(leaf) = 1 = size(leaf) + 1. Node: assume leaves(l) = size(l) + 1 and leaves(r) = size(r) + 1. Then leaves(node(l, x, r)) = leaves(l) + leaves(r) = size(l) + 1 + size(r) + 1 = size(node(l, x, r)) + 1. By induction on trees the claim holds for every t. ∎'],
        ['For all lists xs and ys, length(concat(xs, ys)) = length(xs) + length(ys).', ['Inducts on xs, the list concat recurses on (1)', 'Empty case: length(concat([], ys)) = length(ys) = 0 + length(ys) (1)', 'Cons case states the hypothesis for xs (1)', 'length(concat(x :: xs, ys)) = length(x :: concat(xs, ys)) = 1 + length(concat(xs, ys)) = 1 + length(xs) + length(ys) (1)', '= length(x :: xs) + length(ys); concludes (1)'],
          'Induction on xs. Empty: length(concat([], ys)) = length(ys) = length([]) + length(ys). Cons: assume length(concat(xs, ys)) = length(xs) + length(ys). Then length(concat(x :: xs, ys)) = length(x :: concat(xs, ys)) = 1 + length(concat(xs, ys)) = 1 + length(xs) + length(ys) = length(x :: xs) + length(ys). ∎'],
        ['For every list xs, map(id, xs) = xs.', ['Empty case: map(id, []) = [] (1)', 'Cons case: assume map(id, xs) = xs (1)', 'map(id, x :: xs) = id(x) :: map(id, xs) by the definition of map (1)', '= x :: xs, using id(x) = x and the hypothesis; concludes (1)'],
          'Empty: map(id, []) = []. Cons: assume map(id, xs) = xs. Then map(id, x :: xs) = id(x) :: map(id, xs) = x :: xs. ∎ (This is the example on your slides.)'],
        ['For every tree t, size(t) ≥ height(t).', ['Leaf case: 0 ≥ 0 (1)', 'Two hypotheses for l and r (1)', 'size(node) = size(l) + 1 + size(r) ≥ height(l) + 1 + height(r) (1)', '≥ 1 + max(height(l), height(r)) = height(node), using a + b ≥ max(a, b) for natural numbers (1)', 'Concludes (1)'],
          'Leaf: size(leaf) = 0 ≥ 0 = height(leaf). Node: assume size(l) ≥ height(l) and size(r) ≥ height(r). Then size(node(l, x, r)) = size(l) + 1 + size(r) ≥ height(l) + 1 + height(r) ≥ 1 + max(height(l), height(r)) = height(node(l, x, r)). ∎']
      ]);
      return P.written('Prove by structural induction: ' + T[0], T[1].length, T[1], T[2], { src: S(D9, 'Induction on') });
    }]
  ]);
})();
