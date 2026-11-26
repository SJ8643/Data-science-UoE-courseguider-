/* gens_ml.js – COM1011 Machine Learning: unlimited questions for each week. The exam is closed book with a
   calculator, so most questions are calculations by hand with full working, plus short explanations. */
(function () {
  'use strict';
  const P = window.GUIDE.P, R = P.R, f = P.fmt;
  const S = function (deck, kw) { return P.slide(deck, kw); };
  const sum = function (a) { return a.reduce(function (x, y) { return x + y; }, 0); };
  const mean = function (a) { return sum(a) / a.length; };
  const lg = Math.log2, ln = Math.log;
  function tbl(head, rows) { return '<table class="tbl"><tr>' + head.map(function (x) { return '<th>' + x + '</th>'; }).join('') + '</tr>' + rows.map(function (r) { return '<tr>' + r.map(function (x) { return '<td>' + x + '</td>'; }).join('') + '</tr>'; }).join('') + '</table>'; }
  function cm(tp, fp, fn, tn) { return tbl(['', 'Predicted positive', 'Predicted negative'], [['<b>Actually positive</b>', tp, fn], ['<b>Actually negative</b>', fp, tn]]); }
  function gini(c) { const n = sum(c); return 1 - sum(c.map(function (x) { return (x / n) * (x / n); })); }
  function ent(c) { const n = sum(c); return -sum(c.filter(function (x) { return x > 0; }).map(function (x) { return (x / n) * lg(x / n); })); }
  function choose(n, k) { let r = 1; for (let i = 1; i <= k; i++) r = r * (n - k + i) / i; return Math.round(r); }
  function fact(n) { let r = 1; for (let i = 2; i <= n; i++) r *= i; return r; }

  /* ===== Week 1 ===== */
  P.week('ml', 1, 'What machine learning is: your first predictor', { lessons: ['ml-intro'] }, [
    ['Baseline accuracy', function () {
      const a = R.int(20, 400), b = R.int(20, 400), lab = R.pick([['spam', 'not spam'], ['pass', 'fail'], ['fraud', 'genuine'], ['churn', 'stay']]);
      const acc = 100 * Math.max(a, b) / (a + b);
      return P.num('A dataset has ' + a + ' “' + lab[0] + '” rows and ' + b + ' “' + lab[1] + '” rows. A baseline model always predicts the most common class. What is its accuracy, as a percentage?', acc, 1, 'It predicts “' + (a >= b ? lab[0] : lab[1]) + '” every time, so it is right on ' + Math.max(a, b) + ' of ' + (a + b) + ' rows: ' + f(acc, 2) + '%. Any real model must beat this to be worth using.', { src: S('ml-com1011-l01-introduction', 'baseline') });
    }],
    ['One-rule predictor', function () {
      const n = R.int(8, 10), rows = [], t = R.int(4, 7);
      for (let i = 0; i < n; i++) { const h = R.int(1, 10); const pass = R.chance(h >= t ? 0.8 : 0.25); rows.push([h, pass ? 'pass' : 'fail']); }
      const right = rows.filter(function (r) { return (r[0] >= t) === (r[1] === 'pass'); }).length;
      return P.num('Rule: predict <b>pass</b> if hours studied ≥ ' + t + ', otherwise <b>fail</b>. What is the rule’s accuracy on this data, as a percentage?' + tbl(['Hours studied', 'Result'], rows), 100 * right / n, 1,
        'Check each row: the rule is right when (hours ≥ ' + t + ') matches “pass”. It gets ' + right + ' of ' + n + ' right = ' + f(100 * right / n, 2) + '%.', { src: S('ml-com1011-l01-introduction', 'predict') });
    }],
    ['Kinds of data', function () {
      return P.cls([['Temperature in °C', 'Numerical, continuous', 'It can take any value in a range.'], ['Number of children in a family', 'Numerical, discrete', 'Counts are whole numbers.'], ['Postcode', 'Categorical, nominal', 'Labels with no order, even though some contain digits.'],
        ['Degree classification (First, 2:1, 2:2, Third)', 'Categorical, ordinal', 'Categories with a natural order.'], ['Eye colour', 'Categorical, nominal', 'No order.'], ['Hotel star rating, 1 to 5', 'Categorical, ordinal', 'Ordered categories: the gap between 1 and 2 stars need not equal the gap between 4 and 5.'],
        ['Height in metres', 'Numerical, continuous', 'Any value in a range.'], ['Emails received per day', 'Numerical, discrete', 'A count.'], ['T-shirt size (S, M, L, XL)', 'Categorical, ordinal', 'Ordered categories.']], 'What kind of data is <b>%s</b>?', ['Numerical, continuous', 'Numerical, discrete', 'Categorical, nominal', 'Categorical, ordinal']);
    }],
    ['What kind of task?', function () {
      return P.cls([['Predicting tomorrow’s electricity demand in megawatts', 'Regression', 'The target is a number.'], ['Deciding whether an email is spam', 'Classification', 'The target is a category.'], ['Grouping shoppers by behaviour with no labels', 'Clustering (unsupervised)', 'No target: find structure.'],
        ['Predicting a house’s sale price', 'Regression', 'A number.'], ['Recognising handwritten digits 0–9', 'Classification', 'Ten categories.'], ['Finding communities in a social network with no labels', 'Clustering (unsupervised)', 'No labels.'], ['Predicting whether a patient will be readmitted', 'Classification', 'Yes or no.'], ['Estimating a student’s exam mark out of 100', 'Regression', 'A number.']],
        'What kind of machine-learning task is this?<br><b>%s</b>', ['Regression', 'Classification', 'Clustering (unsupervised)'], { src: S('ml-com1011-l01-introduction', 'classification') });
    }],
    ['Features and targets', function () {
      const D = R.pick([['house prices', ['floor area', 'bedrooms', 'postcode'], 'sale price'], ['spam filtering', ['number of links', 'sender domain', 'word counts'], 'spam or not'], ['exam results', ['hours studied', 'attendance', 'previous mark'], 'final mark'], ['penguins', ['bill length', 'flipper length', 'body mass'], 'species']]);
      return P.mcq('A model for ' + D[0] + ' uses ' + D[1].join(', ') + ' to predict ' + D[2] + '. In this dataset, what is “' + D[2] + '”?', 'The target (label)', ['A feature', 'A row (example)', 'The model'], 'Features are the inputs (' + D[1].join(', ') + '). The target is what we predict. Each row is one example.');
    }],
    ['Why compare with a baseline?', function () {
      return P.written('A classifier reaches 94% accuracy on a test set. Explain why that number alone does not show the model is useful, and what you would check.', 4,
        ['Accuracy depends on class balance: if 94% of rows are one class, always predicting it scores 94% (1)', 'So compare with a baseline such as the majority class (1)', 'Look at per-class performance, e.g. a confusion matrix, precision and recall (1)', 'Make sure the score is on unseen test data, not training data (1)'],
        'If 94% of the test rows belong to one class, a baseline that always predicts that class also scores 94%, so the model may have learned nothing. I would compare with the majority-class baseline, look at the confusion matrix (precision and recall for the rare class), and check the score is on held-out data.', { src: S('ml-com1011-l01-introduction', 'baseline') });
    }]
  ]);

  /* ===== Week 2 ===== */
  P.week('ml', 2, 'Data, visualisation, decision trees and preprocessing', { lessons: ['ml-numpy-pandas', 'ml-dataviz', 'ml-trees'] }, [
    ['Gini impurity', function () {
      const k = R.pick([2, 2, 3]), cs = []; for (let i = 0; i < k; i++) cs.push(R.int(0, 12)); if (sum(cs) === 0) cs[0] = 3;
      const n = sum(cs), g = gini(cs);
      return P.num('A node holds ' + cs.join(', ') + ' samples of ' + k + ' classes. What is its Gini impurity?', g, 3, 'Gini = 1 − Σ pᵢ² = 1 − (' + cs.map(function (x) { return '(' + x + '/' + n + ')²'; }).join(' + ') + ') = ' + f(g, 4) + '. 0 means pure; ' + f(1 - 1 / k, 3) + ' is the maximum for ' + k + ' classes.', { src: S('ml-com1011-l04-decisiontrees-preprocessing', 'gini') });
    }],
    ['Entropy', function () {
      const k = R.pick([2, 2, 3]), cs = []; for (let i = 0; i < k; i++) cs.push(R.int(1, 12));
      const n = sum(cs), e = ent(cs);
      return P.num('A node holds ' + cs.join(', ') + ' samples of ' + k + ' classes. What is its entropy (log base 2)?', e, 3, 'H = −Σ pᵢ log₂ pᵢ = −(' + cs.map(function (x) { return '(' + x + '/' + n + ')·log₂(' + x + '/' + n + ')'; }).join(' + ') + ') = ' + f(e, 4) + ' bits. Maximum is log₂ ' + k + ' = ' + f(lg(k), 3) + '.', { src: S('ml-com1011-l04-decisiontrees-preprocessing', 'entropy') });
    }],
    ['Information gain', function () {
      const a = R.int(4, 12), b = R.int(4, 12), a1 = R.int(0, a), b1 = R.int(0, b);
      const L = [a1, b1], Rr = [a - a1, b - b1];
      if (sum(L) === 0 || sum(Rr) === 0) return null;
      const useG = R.chance(0.5), imp = useG ? gini : ent, nm = useG ? 'Gini impurity' : 'entropy';
      const n = a + b, wl = sum(L) / n, wr = sum(Rr) / n, parent = imp([a, b]), child = wl * imp(L) + wr * imp(Rr), gain = parent - child;
      return P.num('A node has ' + a + ' positive and ' + b + ' negative samples. A split sends ' + a1 + ' positive and ' + b1 + ' negative to the left, and the rest to the right. Using ' + nm + ', what is the gain (decrease in impurity)?', gain, 3,
        'Parent ' + nm + ' = ' + f(parent, 4) + '. Left (' + L.join(', ') + ') = ' + f(imp(L), 4) + ', right (' + Rr.join(', ') + ') = ' + f(imp(Rr), 4) + '. Weighted children = ' + sum(L) + '/' + n + ' × ' + f(imp(L), 4) + ' + ' + sum(Rr) + '/' + n + ' × ' + f(imp(Rr), 4) + ' = ' + f(child, 4) + '. Gain = ' + f(parent, 4) + ' − ' + f(child, 4) + ' = ' + f(gain, 4) + '. The tree picks the split with the largest gain.', { src: S('ml-com1011-l04-decisiontrees-preprocessing', 'information gain') });
    }],
    ['Which plot?', function () {
      return P.cls([['How are exam marks spread out: one peak or two?', 'Histogram', 'Distribution of one numerical variable.'], ['Do students who study longer score higher?', 'Scatter plot', 'Relationship between two numerical variables.'], ['How many penguins of each species are there?', 'Bar chart', 'A value per category.'],
        ['Is house price related to floor area?', 'Scatter plot', 'Two numerical variables.'], ['What is the distribution of passenger ages?', 'Histogram', 'One numerical variable.'], ['Which module has the highest average mark?', 'Bar chart', 'Compare categories.']],
        'Which plot answers this question best?<br><b>%s</b>', ['Histogram', 'Scatter plot', 'Bar chart'], { src: S('ml-com1011-l03-before-ml-dataviz', 'histogram') });
    }],
    ['Scaling features', function () {
      const t = R.int(0, 1);
      if (t === 0) { const mu = R.int(40, 80), sd = R.pick([4, 5, 8, 10, 12.5]), x = R.int(20, 100); return P.num('A feature has mean ' + mu + ' and standard deviation ' + sd + '. What is the standardised value (z-score) of x = ' + x + '?', (x - mu) / sd, 2, 'z = (x − mean) / sd = (' + x + ' − ' + mu + ') / ' + sd + ' = ' + f((x - mu) / sd, 4) + '. After standardising, the feature has mean 0 and standard deviation 1.', { src: S('ml-com1011-l04-decisiontrees-preprocessing', 'standard') }); }
      const mn = R.int(0, 30), mx = mn + R.int(20, 100), x = R.int(mn, mx);
      return P.num('A feature ranges from ' + mn + ' to ' + mx + '. What is x = ' + x + ' after min–max normalisation to [0, 1]?', (x - mn) / (mx - mn), 3, '(x − min) / (max − min) = (' + x + ' − ' + mn + ') / (' + mx + ' − ' + mn + ') = ' + f((x - mn) / (mx - mn), 4) + '.', { src: S('ml-com1011-l04-decisiontrees-preprocessing', 'normalis') });
    }],
    ['Shape and axis', function () {
      const r = R.int(3, 200), c = R.int(2, 9), ax = R.int(0, 1);
      return P.mcq('<code>X</code> has shape (' + r + ', ' + c + '): ' + r + ' rows (samples) and ' + c + ' columns (features). What is the shape of <code>X.mean(axis=' + ax + ')</code>?', '(' + (ax ? r : c) + ',)', ['(' + (ax ? c : r) + ',)', '(' + r + ', ' + c + ')', '(1,)'], 'The axis you name is the one that disappears. axis=0 averages down the rows, giving one mean per column (' + c + ' numbers); axis=1 averages across each row (' + r + ' numbers).', { src: S('ml-com1011-machine-learning-study-guide', 'axis') });
    }],
    ['Summary statistics can mislead', function () {
      return P.mcq('Four datasets have the same mean, variance and correlation (to two decimal places). What follows?', 'Their scatter plots can still look completely different, so plot the data before modelling', ['They must have the same shape when plotted', 'A linear model will fit all four equally well', 'They must be the same data in a different order'], 'Matching summary statistics can hide curves, outliers and clusters (Anscombe’s quartet is the classic example). Look at the data first.', { src: S('ml-com1011-l03-before-ml-dataviz', 'summary') });
    }]
  ]);

  /* ===== Week 3 ===== */
  function pts(n) { const xs = R.distinct(n, 0, 9).sort(function (a, b) { return a - b; }); return xs.map(function (x) { return [x, R.int(0, 12)]; }); }
  P.week('ml', 3, 'Linear regression, loss, train/test split and R²', { lessons: ['ml-linreg', 'ml-split-r2'] }, [
    ['Make a prediction', function () {
      const a = R.pick([0.5, 1.5, 2, 2.5, 3, -1.5, 4]), b = R.int(-10, 20), x = R.int(1, 30);
      return P.num('A fitted model is ŷ = ' + a + 'x ' + (b < 0 ? '− ' + (-b) : '+ ' + b) + '. What does it predict for x = ' + x + '?', a * x + b, 2, 'ŷ = ' + a + ' × ' + x + ' + (' + b + ') = ' + f(a * x + b) + '. The slope ' + a + ' is the change in ŷ per unit of x; the intercept is ŷ at x = 0.', { src: S('ml-com1011-l02-linearregression', 'slope') });
    }],
    ['L1 and L2 loss', function () {
      const ps = pts(4), a = R.pick([0.5, 1, 1.5, 2]), b = R.int(0, 4);
      const e = ps.map(function (p) { return p[1] - (a * p[0] + b); }), sq = R.chance(0.5);
      const v = sq ? mean(e.map(function (x) { return x * x; })) : mean(e.map(Math.abs));
      return P.num('Model ŷ = ' + a + 'x + ' + b + '. What is the <b>' + (sq ? 'mean squared error (L2)' : 'mean absolute error (L1)') + '</b> on these points?' + tbl(['x', 'y'], ps), v, 3,
        'Errors y − ŷ: ' + e.map(function (x) { return f(x); }).join(', ') + '. ' + (sq ? 'Square, then average: (' + e.map(function (x) { return f(x * x); }).join(' + ') + ') / 4 = ' + f(v, 4) + '. Squaring makes one big miss count much more than several small ones.' : 'Absolute values, then average: (' + e.map(function (x) { return f(Math.abs(x)); }).join(' + ') + ') / 4 = ' + f(v, 4) + '.'), { src: S('ml-com1011-l02-linearregression', 'L2') });
    }],
    ['R² by hand', function () {
      const ys = [], yh = []; for (let i = 0; i < 4; i++) { const y = R.int(2, 20); ys.push(y); yh.push(y + R.int(-3, 3)); }
      const yb = mean(ys), sse = sum(ys.map(function (y, i) { return (y - yh[i]) * (y - yh[i]); })), sse0 = sum(ys.map(function (y) { return (y - yb) * (y - yb); }));
      if (sse0 === 0) return null;
      const r2 = 1 - sse / sse0;
      return P.num('On the test set, the actual values are ' + ys.join(', ') + ' and the model predicts ' + yh.join(', ') + '. What is R²?', r2, 3,
        'SSE = Σ(y − ŷ)² = ' + f(sse) + '. The baseline predicts the mean ȳ = ' + f(yb) + ': SSE₀ = Σ(y − ȳ)² = ' + f(sse0, 4) + '. R² = 1 − SSE/SSE₀ = 1 − ' + f(sse) + '/' + f(sse0, 4) + ' = ' + f(r2, 4) + '. ' + (r2 < 0 ? 'Negative: worse than always predicting the mean.' : 'The model removes ' + f(100 * r2, 1) + '% of the squared error the mean leaves.'), { src: S('ml-com1011-l06-train-test-split-r2', 'R²') });
    }],
    ['Gradient descent step', function () {
      const xs = R.distinct(3, 1, 4), a = R.pick([0, 0.5, 1, 2]), tr = R.pick([1, 1.5, 2, 3]), ys = xs.map(function (x) { return x * tr + R.int(-1, 1); }), eta = R.pick([0.01, 0.02, 0.05, 0.1]);
      const g = (2 / 3) * sum(xs.map(function (x, i) { return (a * x - ys[i]) * x; })), a2 = a - eta * g;
      return P.num('Model ŷ = a·x (no intercept), loss L = mean of (ŷ − y)². Data: ' + xs.map(function (x, i) { return '(' + x + ', ' + ys[i] + ')'; }).join(', ') + '. Starting from a = ' + a + ' with learning rate ' + eta + ', what is a after one gradient-descent step?', a2, 3,
        'dL/da = (2/n) Σ (a·xᵢ − yᵢ)·xᵢ = (2/3)(' + xs.map(function (x, i) { return '(' + a + '·' + x + ' − ' + ys[i] + ')·' + x; }).join(' + ') + ') = ' + f(g, 4) + '. a ← a − η·dL/da = ' + a + ' − ' + eta + ' × ' + f(g, 4) + ' = ' + f(a2, 4) + '. ' + (g < 0 ? 'The gradient is negative, so a increases.' : 'The gradient is positive, so a decreases.'), { src: S('ml-com1011-l02-linearregression', 'gradient') });
    }],
    ['Least squares by hand', function () {
      const ps = pts(4), xb = mean(ps.map(function (p) { return p[0]; })), yb = mean(ps.map(function (p) { return p[1]; }));
      const sxy = sum(ps.map(function (p) { return (p[0] - xb) * (p[1] - yb); })), sxx = sum(ps.map(function (p) { return (p[0] - xb) * (p[0] - xb); }));
      const a = sxy / sxx, b = yb - a * xb, ask = R.chance(0.5) ? 'slope' : 'intercept';
      return P.num('Fit ŷ = ax + b by least squares to these points. What is the ' + ask + ' ' + (ask === 'slope' ? 'a' : 'b') + '?' + tbl(['x', 'y'], ps), ask === 'slope' ? a : b, 3,
        'x̄ = ' + f(xb) + ', ȳ = ' + f(yb) + '. a = Σ(x − x̄)(y − ȳ) / Σ(x − x̄)² = ' + f(sxy, 4) + ' / ' + f(sxx, 4) + ' = ' + f(a, 4) + '. b = ȳ − a·x̄ = ' + f(yb) + ' − ' + f(a, 4) + ' × ' + f(xb) + ' = ' + f(b, 4) + '. LinearRegression().fit gives the same numbers.', { src: S('ml-com1011-l02-linearregression', 'LinearRegression') });
    }],
    ['Train/test split', function () {
      if (R.chance(0.5)) { const n = 5 * R.int(20, 400); return P.num('A dataset has ' + n + ' rows. <code>train_test_split(X, y, test_size=0.2)</code>: how many rows go into the training set?', n * 0.8, 0, '20% (' + n * 0.2 + ' rows) is held back for testing; ' + n * 0.8 + ' rows are used to fit the model.', { src: S('ml-com1011-l06-train-test-split-r2', 'train_test_split') }); }
      return P.cls([['R² = 1 on the test set', 'Perfect predictions on unseen data (check for leakage!)', 'SSE = 0.'], ['R² = 0 on the test set', 'No better than always predicting the mean', 'SSE = SSE₀.'], ['R² is negative on the test set', 'Worse than always predicting the mean', 'SSE > SSE₀: possible on unseen data.'],
        ['Training R² = 0.98 but test R² = 0.41', 'The model has overfitted the training data', 'It memorised noise that does not generalise.']], 'What does this tell you?<br><b>%s</b>', ['Perfect predictions on unseen data (check for leakage!)', 'No better than always predicting the mean', 'Worse than always predicting the mean', 'The model has overfitted the training data'], { src: S('ml-com1011-l06-train-test-split-r2', 'R²') });
    }]
  ]);

  /* ===== Week 4 ===== */
  P.week('ml', 4, 'Classifiers, overfitting, cross-validation and regularisation', { lessons: ['ml-classifiers', 'ml-model-selection'] }, [
    ['The sigmoid', function () {
      const w1 = R.pick([-2, -1, -0.5, 0.5, 1, 1.5, 2]), w2 = R.pick([-1, -0.5, 0.5, 1, 2]), b = R.pick([-3, -2, -1, 0, 1, 2]), x1 = R.int(0, 4), x2 = R.int(0, 4);
      const z = w1 * x1 + w2 * x2 + b, p = 1 / (1 + Math.exp(-z));
      return P.num('A logistic regression has weights w = (' + w1 + ', ' + w2 + ') and bias b = ' + b + '. For x = (' + x1 + ', ' + x2 + '), what probability does it give for class 1?', p, 3,
        'z = w·x + b = ' + w1 + '·' + x1 + ' + ' + w2 + '·' + x2 + ' + (' + b + ') = ' + f(z) + '. σ(z) = 1 / (1 + e^(−z)) = ' + f(p, 4) + '. At threshold 0.5 it predicts class ' + (p >= 0.5 ? 1 : 0) + ' (σ(z) ≥ 0.5 exactly when z ≥ 0).', { src: S('ml-com1011-l4-1-classifiers', 'sigmoid') });
    }],
    ['Confusion-matrix metrics', function () {
      const tp = R.int(5, 60), fp = R.int(1, 30), fn = R.int(1, 30), tn = R.int(10, 90);
      const M = R.pick([['accuracy', (tp + tn) / (tp + fp + fn + tn), '(TP + TN) / total = (' + tp + ' + ' + tn + ') / ' + (tp + fp + fn + tn)], ['precision', tp / (tp + fp), 'TP / (TP + FP) = ' + tp + ' / ' + (tp + fp) + ': of everything predicted positive, how much was right'],
        ['recall (sensitivity)', tp / (tp + fn), 'TP / (TP + FN) = ' + tp + ' / ' + (tp + fn) + ': of all real positives, how many were found'], ['specificity', tn / (tn + fp), 'TN / (TN + FP) = ' + tn + ' / ' + (tn + fp) + ': of all real negatives, how many were correctly rejected'],
        ['F1 score', 2 * tp / (2 * tp + fp + fn), '2·precision·recall / (precision + recall) = 2TP / (2TP + FP + FN) = ' + (2 * tp) + ' / ' + (2 * tp + fp + fn)]]);
      return P.num('From this confusion matrix, what is the <b>' + M[0] + '</b>?' + cm(tp, fp, fn, tn), M[1], 3, M[0][0].toUpperCase() + M[0].slice(1) + ' = ' + M[2] + ' = ' + f(M[1], 4) + '.', { src: S('ml-com1011-l4-1-classifiers', 'confusion') });
    }],
    ['Log loss', function () {
      const ys = [R.int(0, 1), R.int(0, 1), R.int(0, 1)], ps = [R.pick([0.9, 0.8, 0.7, 0.6]), R.pick([0.2, 0.4, 0.5, 0.95]), R.pick([0.1, 0.3, 0.75, 0.85])];
      const terms = ys.map(function (y, i) { return -(y ? ln(ps[i]) : ln(1 - ps[i])); }), L = mean(terms);
      return P.num('Three predictions: (y = ' + ys[0] + ', p = ' + ps[0] + '), (y = ' + ys[1] + ', p = ' + ps[1] + '), (y = ' + ys[2] + ', p = ' + ps[2] + '), where p is the predicted probability of class 1. What is the mean log loss (natural log)?', L, 3,
        'Each term is −[y ln p + (1 − y) ln(1 − p)]: ' + terms.map(function (t, i) { return '−ln(' + (ys[i] ? ps[i] : f(1 - ps[i])) + ') = ' + f(t, 4); }).join(', ') + '. Mean = ' + f(L, 4) + '. Confident wrong answers are punished hardest.', { src: S('ml-com1011-l4-1-classifiers', 'log') });
    }],
    ['Perceptron update', function () {
      const w = [R.int(-2, 2), R.int(-2, 2)], b = R.int(-2, 2), x = [R.int(-3, 3), R.int(-3, 3)], eta = R.pick([1, 0.5]);
      const z = w[0] * x[0] + w[1] * x[1] + b, yh = z >= 0 ? 1 : 0, y = 1 - yh, d = eta * (y - yh);
      const nw = [w[0] + d * x[0], w[1] + d * x[1]], nb = b + d;
      return P.text('Perceptron: predict 1 if w·x + b ≥ 0, else 0. Update rule: w ← w + η(y − ŷ)x and b ← b + η(y − ŷ), with η = ' + eta + '. Now w = (' + w.join(', ') + '), b = ' + b + ', and the training point x = (' + x.join(', ') + ') has label y = ' + y + '. Give the new w₁, w₂, b separated by commas.', 'custom', null,
        'w·x + b = ' + w[0] + '·' + x[0] + ' + ' + w[1] + '·' + x[1] + ' + ' + b + ' = ' + z + ', so ŷ = ' + yh + ' but y = ' + y + ': a mistake, so update with y − ŷ = ' + (y - yh) + '. w₁ = ' + w[0] + ' + ' + d + '·' + x[0] + ' = ' + f(nw[0]) + ', w₂ = ' + w[1] + ' + ' + d + '·' + x[1] + ' = ' + f(nw[1]) + ', b = ' + b + ' + ' + d + ' = ' + f(nb) + '.',
        { ph: 'w1, w2, b', showAns: f(nw[0]) + ', ' + f(nw[1]) + ', ' + f(nb), checkFn: function (s) { const v = String(s).replace(/[()]/g, '').split(/[,;\s]+/).filter(Boolean).map(Number); if (v.length !== 3 || v.some(isNaN)) return { bad: 'Give three numbers: w1, w2, b.' }; return { ok: Math.abs(v[0] - nw[0]) < 1e-9 && Math.abs(v[1] - nw[1]) < 1e-9 && Math.abs(v[2] - nb) < 1e-9 }; }, src: S('ml-com1011-l4-1-classifiers', 'perceptron') });
    }],
    ['Under- or overfitting?', function () {
      const k = R.int(0, 2);
      const tr = [R.int(97, 100) / 100, R.int(55, 65) / 100, R.int(86, 92) / 100][k], te = [R.int(58, 72) / 100, R.int(52, 60) / 100, R.int(83, 88) / 100][k];
      const ans = ['Overfitting: high variance', 'Underfitting: high bias', 'A good fit'][k];
      return P.mcq('A model scores ' + tr.toFixed(2) + ' accuracy on the training set and ' + te.toFixed(2) + ' on the test set. What is going on?', ans, ['Overfitting: high variance', 'Underfitting: high bias', 'A good fit', 'Data leakage from test to train'].filter(function (x) { return x !== ans; }).slice(0, 3),
        ['A big gap between training and test scores means it learned the training data too closely. Simplify, regularise or get more data.', 'Both scores are low and close: the model is too simple to capture the pattern. Add features or use a more flexible model.', 'High scores that are close together: it generalises well.'][k], { src: S('ml-com1011-l4-2-modelselection-regularisation', 'overfit') });
    }],
    ['Cross-validation arithmetic', function () {
      if (R.chance(0.5)) { const a = R.int(2, 6), b = R.int(2, 4), k = R.pick([3, 5, 10]); return P.num('GridSearchCV tries ' + a + ' values of alpha and ' + b + ' values of another hyperparameter, with cv=' + k + '. How many models are trained during the search (not counting the final refit on all the training data)?', a * b * k, 0, a + ' × ' + b + ' = ' + a * b + ' combinations, each trained ' + k + ' times (once per fold): ' + a * b * k + '.', { src: S('ml-com1011-l4-2-modelselection-regularisation', 'GridSearch') }); }
      const k = R.pick([4, 5, 10]), n = k * R.int(10, 60); return P.num('k-fold cross-validation with k = ' + k + ' on ' + n + ' training rows: how many rows is each model trained on?', n * (k - 1) / k, 0, 'Each fold holds out 1/' + k + ' (' + n / k + ' rows) for validation and trains on the other ' + (k - 1) + '/' + k + ': ' + n * (k - 1) / k + ' rows. Every row is used for validation exactly once.', { src: S('ml-com1011-l4-2-modelselection-regularisation', 'fold') });
    }],
    ['Ridge and Lasso', function () {
      const pool = [['Which penalty can set some coefficients exactly to zero, removing features?', 'Lasso (L1, Σ|w|)', ['Ridge (L2, Σw²)', 'Neither: both only shrink', 'Ordinary least squares'], 'The L1 penalty has corners at zero, so the best solution often puts weights exactly at 0: built-in feature selection.'],
        ['What happens to the coefficients as you increase alpha in Ridge regression?', 'They shrink towards zero', ['They grow', 'They stay the same; only the intercept changes', 'They become exactly zero at any alpha above 1'], 'Larger alpha means a bigger penalty on Σw², so the model trades training fit for smaller weights (more bias, less variance).'],
        ['Why should the test set not be used to choose alpha?', 'The test score would then be optimistically biased: it was used to make a choice', ['It makes the model train more slowly', 'Alpha has no effect on the test score', 'scikit-learn does not allow it'], 'Choose hyperparameters with cross-validation on the training set; touch the test set once, at the end.']];
      const r = R.pick(pool); return P.mcq(r[0], r[1], r[2], r[3], { src: S('ml-com1011-l4-2-modelselection-regularisation', 'Lasso') });
    }]
  ]);

  /* ===== Week 5 ===== */
  P.week('ml', 5, 'Bayes’ theorem and Naive Bayes', { lessons: ['ml-bayes'] }, [
    ['Bayes’ theorem', function () {
      const p = R.pick([0.001, 0.005, 0.01, 0.02, 0.05, 0.1]), se = R.pick([0.9, 0.95, 0.99]), sp = R.pick([0.9, 0.95, 0.98, 0.99]);
      const pp = se * p + (1 - sp) * (1 - p), post = se * p / pp;
      return P.num('A condition affects ' + f(100 * p, 2) + '% of people. A test detects it ' + f(100 * se) + '% of the time when present (sensitivity) and correctly says “no” ' + f(100 * sp) + '% of the time when absent (specificity). Someone tests positive. What is the probability they have the condition?', post, 3,
        'P(+) = P(+|D)P(D) + P(+|¬D)P(¬D) = ' + se + ' × ' + p + ' + ' + f(1 - sp) + ' × ' + f(1 - p) + ' = ' + f(pp, 5) + '. P(D|+) = P(+|D)P(D) / P(+) = ' + f(se * p, 5) + ' / ' + f(pp, 5) + ' = ' + f(post, 4) + '. When the condition is rare, most positives are false positives.', { src: S('ml-l5-1-bayes-and-naivebayes', 'Bayes') });
    }],
    ['Law of total probability', function () {
      const pa = R.pick([0.2, 0.3, 0.4, 0.6]), x = R.pick([0.1, 0.25, 0.5, 0.7]), y = R.pick([0.05, 0.2, 0.3, 0.6]);
      const v = x * pa + y * (1 - pa);
      return P.num('' + f(100 * pa) + '% of emails are spam. The word “prize” appears in ' + f(100 * x) + '% of spam and ' + f(100 * y) + '% of non-spam. What fraction of all emails contain “prize”?', v, 3, 'P(prize) = P(prize|spam)P(spam) + P(prize|not spam)P(not spam) = ' + x + ' × ' + pa + ' + ' + y + ' × ' + f(1 - pa) + ' = ' + f(v, 4) + '.', { src: S('ml-l5-1-bayes-and-naivebayes', 'total probability') });
    }],
    ['Naive Bayes by hand', function () {
      const ps = R.pick([0.3, 0.4, 0.5]), a1 = R.pick([0.4, 0.5, 0.6]), a2 = R.pick([0.1, 0.2, 0.3]), b1 = R.pick([0.05, 0.1, 0.2]), b2 = R.pick([0.2, 0.3, 0.4]);
      const s = ps * a1 * b1, h = (1 - ps) * a2 * b2, post = s / (s + h);
      return P.num('P(spam) = ' + ps + '. P(“free” | spam) = ' + a1 + ', P(“free” | ham) = ' + a2 + '. P(“meeting” | spam) = ' + b1 + ', P(“meeting” | ham) = ' + b2 + '. Assuming the words are independent given the class, what is P(spam | “free” and “meeting”)?', post, 3,
        'Spam score = ' + ps + ' × ' + a1 + ' × ' + b1 + ' = ' + f(s, 5) + '. Ham score = ' + f(1 - ps) + ' × ' + a2 + ' × ' + b2 + ' = ' + f(h, 5) + '. Normalise: ' + f(s, 5) + ' / (' + f(s, 5) + ' + ' + f(h, 5) + ') = ' + f(post, 4) + '. The “naive” step is multiplying the word probabilities as if independent.', { src: S('ml-l5-1-bayes-and-naivebayes', 'Naive') });
    }],
    ['Laplace smoothing', function () {
      const cnt = R.int(0, 8), N = R.int(40, 200), V = R.int(20, 80), al = 1;
      return P.num('In spam emails the word “winner” appears ' + cnt + ' times out of ' + N + ' words, and the vocabulary has ' + V + ' words. With add-one (Laplace) smoothing, what is P(“winner” | spam)?', (cnt + al) / (N + al * V), 4,
        '(count + 1) / (total words + V) = (' + cnt + ' + 1) / (' + N + ' + ' + V + ') = ' + f((cnt + 1) / (N + V), 5) + '. Without smoothing a count of 0 would make the whole product 0, whatever the other words say.', { src: S('ml-l5-1-bayes-and-naivebayes', 'smooth') });
    }],
    ['Why add logs?', function () {
      return P.mcq('Naive Bayes on a long email multiplies hundreds of probabilities. Why do implementations add their logarithms instead?', 'Multiplying many small numbers underflows to 0 in floating point; log turns the product into a sum that stays representable', ['Logs make the probabilities larger, so the model is more accurate', 'Adding is required because the words are not independent', 'Logs remove the need for smoothing'], 'log(a·b·c) = log a + log b + log c, and log is increasing, so the class with the largest sum is the class with the largest product.', { src: S('ml-l5-1-bayes-and-naivebayes', 'log') });
    }],
    ['Explain Naive Bayes', function () {
      return P.written('Explain how a Naive Bayes classifier decides whether an email is spam, and why it is called “naive”.', 5,
        ['Uses Bayes’ theorem: P(spam | words) ∝ P(words | spam) P(spam) (1)', 'Priors and word likelihoods are estimated from counts in training data (1)', 'Assumes words are conditionally independent given the class, so P(words | class) is a product: that is the “naive” part (1)', 'Compares (normalised) scores for spam and ham and picks the larger (1)', 'Mentions smoothing for unseen words or logs to avoid underflow (1)'],
        'It applies Bayes’ theorem: the score for spam is P(spam) × Π P(wordᵢ | spam), and similarly for ham, with all probabilities estimated by counting in the training emails. It picks the class with the larger score (normalising gives probabilities). It is naive because it assumes the words are independent once you know the class, which is false in real text but works well. Add-one smoothing stops unseen words giving probability 0, and summing logs avoids underflow.', { src: S('ml-l5-1-bayes-and-naivebayes', 'Naive') });
    }]
  ]);

  /* ===== Week 7 ===== */
  P.week('ml', 7, 'Probability distributions, hypothesis testing and comparing classifiers', { lessons: ['ml-prob', 'ml-hypothesis', 'ml-compare', 'ml-workflow'] }, [
    ['Expected value and variance', function () {
      const xs = R.distinct(R.int(3, 4), 0, 6).sort(function (a, b) { return a - b; }); const ws = xs.map(function () { return R.int(1, 5); }), tot = sum(ws), ps = ws.map(function (w) { return w / tot; });
      const E = sum(xs.map(function (x, i) { return x * ps[i]; })), V = sum(xs.map(function (x, i) { return (x - E) * (x - E) * ps[i]; })), askV = R.chance(0.5);
      return P.num('X takes the values ' + xs.join(', ') + ' with probabilities ' + ws.map(function (w) { return w + '/' + tot; }).join(', ') + '. What is ' + (askV ? 'Var(X)' : 'E[X]') + '?', askV ? V : E, 3,
        'E[X] = Σ x·p(x) = ' + xs.map(function (x, i) { return x + '·' + ws[i] + '/' + tot; }).join(' + ') + ' = ' + f(E, 4) + '.' + (askV ? ' Var(X) = Σ (x − E[X])²·p(x) = ' + f(V, 4) + ' (or E[X²] − E[X]² = ' + f(sum(xs.map(function (x, i) { return x * x * ps[i]; })), 4) + ' − ' + f(E * E, 4) + ').' : ''), { src: S('ml-com1011-l05a-probability-distributions', 'expect') });
    }],
    ['Binomial', function () {
      const n = R.int(4, 12), k = R.int(0, n), p = R.pick([0.1, 0.2, 0.25, 0.3, 0.5, 0.6, 0.8]), v = choose(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
      return P.num('A classifier is right on each test case independently with probability ' + p + '. On ' + n + ' cases, what is the probability it is right on exactly ' + k + '?', v, 4, 'Binomial(n = ' + n + ', p = ' + p + '): P(X = ' + k + ') = C(' + n + ', ' + k + ') p^' + k + ' (1 − p)^' + (n - k) + ' = ' + choose(n, k) + ' × ' + f(Math.pow(p, k), 6) + ' × ' + f(Math.pow(1 - p, n - k), 6) + ' = ' + f(v, 5) + '.', { src: S('ml-com1011-l05a-probability-distributions', 'binomial') });
    }],
    ['Poisson', function () {
      const lam = R.pick([0.5, 1, 1.5, 2, 3, 4, 5]), k = R.int(0, 6), v = Math.pow(lam, k) * Math.exp(-lam) / fact(k);
      return P.num('A server gets on average ' + lam + ' failed logins per minute (a Poisson process). What is the probability of exactly ' + k + ' in a given minute?', v, 4, 'P(X = k) = λ^k e^(−λ) / k! = ' + lam + '^' + k + ' × e^(−' + lam + ') / ' + k + '! = ' + f(v, 5) + '. The Poisson counts events in a fixed interval at a constant average rate.', { src: S('ml-com1011-l05a-probability-distributions', 'Poisson') });
    }],
    ['Which distribution?', function () {
      return P.cls([['The number of heads in 20 coin flips', 'Binomial', 'A count of successes in a fixed number of independent trials.'], ['Whether one email is spam (1) or not (0)', 'Bernoulli', 'One trial with two outcomes.'], ['The number of emails arriving in an hour', 'Poisson', 'Events counted in an interval at a constant rate.'],
        ['Adult heights in a population', 'Normal', 'Continuous, symmetric, bell-shaped.'], ['The time until the next bus arrives, at a constant rate', 'Exponential', 'Waiting time between Poisson events.'], ['The face shown by a fair die', 'Uniform', 'Every outcome equally likely.'],
        ['Measurement error from many small independent causes', 'Normal', 'The sum of many small effects tends to a normal distribution.']], 'Which distribution fits best?<br><b>%s</b>', ['Bernoulli', 'Binomial', 'Poisson', 'Normal', 'Exponential', 'Uniform'], { src: S('ml-com1011-l05a-probability-distributions', 'distribution') });
    }],
    ['z-scores', function () {
      const mu = R.int(50, 70), sd = R.pick([5, 8, 10, 12]), x = R.int(30, 100);
      return P.num('Marks have mean ' + mu + ' and standard deviation ' + sd + '. What is the z-score of a mark of ' + x + '?', (x - mu) / sd, 2, 'z = (x − μ) / σ = (' + x + ' − ' + mu + ') / ' + sd + ' = ' + f((x - mu) / sd, 4) + ': ' + f(Math.abs((x - mu) / sd), 2) + ' standard deviations ' + (x >= mu ? 'above' : 'below') + ' the mean.', { src: S('ml-com1011-l05b-hypothesis-testing', 'z-value') });
    }],
    ['Reject or fail to reject?', function () {
      const p = R.pick([0.001, 0.01, 0.03, 0.049, 0.051, 0.12, 0.24, 0.6]), a = R.pick([0.05, 0.05, 0.01]);
      const rej = p < a, ans = rej ? 'Reject H₀: a result this extreme is unlikely if H₀ is true' : 'Fail to reject H₀: the data are consistent with H₀';
      return P.mcq('A t-test comparing two classifiers gives p = ' + p + '. With significance level α = ' + a + ', what do you conclude?', ans, [rej ? 'Fail to reject H₀: the data are consistent with H₀' : 'Reject H₀: a result this extreme is unlikely if H₀ is true', rej ? 'Prove that H₀ is false with probability ' + f(1 - p) : 'Accept H₀: the classifiers are proven equal', 'p is the probability that H₀ is true'],
        'Compare p with α: ' + p + (rej ? ' &lt; ' : ' ≥ ') + a + '. The p-value is the probability, if H₀ were true, of a result at least this extreme. We never “prove” or “accept” H₀; we only fail to reject it (innocent until proven guilty).', { src: S('ml-com1011-l05b-hypothesis-testing', 'p-value') });
    }],
    ['Paired t-test', function () {
      const A = [], B = []; for (let i = 0; i < 5; i++) { const b = R.int(80, 92); B.push(b / 100); A.push((b + R.int(-2, 5)) / 100); }
      const d = A.map(function (a, i) { return a - B[i]; }), md = mean(d), sd = Math.sqrt(sum(d.map(function (x) { return (x - md) * (x - md); })) / 4);
      if (sd === 0) return null;
      const t = md / (sd / Math.sqrt(5));
      return P.num('Two classifiers are scored on the same 5 folds. A: ' + A.join(', ') + '. B: ' + B.join(', ') + '. What is the paired t-statistic (as <code>scipy.stats.ttest_rel(A, B)</code> computes it)?', t, 3,
        'Differences d = A − B: ' + d.map(function (x) { return f(x, 2); }).join(', ') + '. Mean d̄ = ' + f(md, 4) + '. Sample sd (n − 1) = ' + f(sd, 5) + '. t = d̄ / (s / √n) = ' + f(md, 4) + ' / (' + f(sd, 5) + ' / √5) = ' + f(t, 4) + ', with 4 degrees of freedom. Pairing by fold removes the fold-to-fold variation both models share.', { src: S('ml-com1011-l05b-hypothesis-testing', 'ttest_rel') });
    }],
    ['ROC–AUC and the workflow', function () {
      const pool = [['A classifier has ROC–AUC 0.5. What does that mean?', 'It ranks a random positive above a random negative only half the time: no better than guessing', ['It is right 50% of the time at threshold 0.5', 'Half of its predictions are positive', 'It is perfect on half the classes'], 'AUC is the probability that a random positive gets a higher score than a random negative. 1.0 is perfect ranking; 0.5 is chance.'],
        ['You standardise all the data with StandardScaler, then split into train and test. What is wrong?', 'The scaler saw the test data, so information leaks into training', ['Nothing: scaling does not change the labels', 'StandardScaler must come after fitting the model', 'Test data should be normalised, not standardised'], 'Fit preprocessing on the training data only. A Pipeline does this automatically inside cross-validation.'],
        ['What are the steps every scikit-learn model follows?', 'Create the model, fit on training data, predict, evaluate', ['Fit on all data, then split, then predict', 'Predict, then fit, then evaluate', 'Evaluate on training data, then tune on the test data'], 'model = Estimator(...); model.fit(X_train, y_train); y_pred = model.predict(X_test); score with a metric.'],
        ['Why use 10-fold cross-validation rather than one train/test split to compare two models?', 'One split’s score depends on which rows land in the test set; ten folds give a mean and a spread', ['It trains each model on more test data', 'It removes the need for a test set', 'It guarantees the better model wins'], 'Repeating over folds gives ten scores per model, so you can see the variation and test the difference (paired t-test).']];
      const r = R.pick(pool); return P.mcq(r[0], r[1], r[2], r[3], { src: S('ml-com1011-l05b-hypothesis-testing', 'fold') });
    }]
  ]);

  /* ===== Week 8 ===== */
  function dmat(n) { const m = []; for (let i = 0; i < n; i++) { m.push([]); for (let j = 0; j < n; j++) m[i].push(0); } const used = new Set(); for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) { let v; do { v = R.int(2, 20); } while (used.has(v)); used.add(v); m[i][j] = m[j][i] = v; } return m; }
  function mtab(m, L) { return tbl([''].concat(L), m.map(function (r, i) { return ['<b>' + L[i] + '</b>'].concat(r); })); }
  P.week('ml', 8, 'Unsupervised learning, clustering, hierarchical clustering and DBSCAN', { lessons: ['ml-unsupervised', 'ml-hierarchical'] }, [
    ['Euclidean distance', function () {
      const d3 = R.chance(0.3), a = [R.int(-5, 9), R.int(-5, 9)], b = [R.int(-5, 9), R.int(-5, 9)]; if (d3) { a.push(R.int(-5, 9)); b.push(R.int(-5, 9)); }
      const man = R.chance(0.25), sq = a.map(function (x, i) { return (x - b[i]) * (x - b[i]); }), v = man ? sum(a.map(function (x, i) { return Math.abs(x - b[i]); })) : Math.sqrt(sum(sq));
      return P.num('What is the ' + (man ? 'Manhattan' : 'Euclidean') + ' distance between (' + a.join(', ') + ') and (' + b.join(', ') + ')?', v, man ? 0 : 3,
        man ? 'Σ|aᵢ − bᵢ| = ' + a.map(function (x, i) { return '|' + x + ' − ' + b[i] + '|'; }).join(' + ') + ' = ' + v + '.' : '√(Σ (aᵢ − bᵢ)²) = √(' + sq.join(' + ') + ') = √' + sum(sq) + ' = ' + f(v, 4) + '. Do not forget the square root: the slide’s formula leaves it out.', { src: S('ml-com1011-l-unsupervisedlearning', 'Euclidean') });
    }],
    ['Nearest centroid', function () {
      const C = [[R.int(0, 3), R.int(0, 3)], [R.int(6, 9), R.int(0, 3)], [R.int(3, 6), R.int(6, 9)]], p = [R.int(0, 9), R.int(0, 9)];
      const d = C.map(function (c) { return Math.hypot(c[0] - p[0], c[1] - p[1]); }), best = d.indexOf(Math.min.apply(null, d));
      if (d.filter(function (x) { return Math.abs(x - d[best]) < 1e-9; }).length > 1) return null;
      const names = ['A (' + C[0] + ')', 'B (' + C[1] + ')', 'C (' + C[2] + ')'];
      return P.mcq('k-means has centroids A = (' + C[0].join(', ') + '), B = (' + C[1].join(', ') + '), C = (' + C[2].join(', ') + '). Which cluster is the point (' + p.join(', ') + ') assigned to?', names[best], names.filter(function (_, i) { return i !== best; }), 'Distances: ' + d.map(function (x, i) { return 'ABC'[i] + ' = ' + f(x, 3); }).join(', ') + '. Assign to the nearest centroid. (Comparing squared distances gives the same answer.)', { src: S('ml-com1011-l-unsupervisedlearning', 'centroid') });
    }],
    ['k-means update', function () {
      const n = R.int(3, 4), ps = []; for (let i = 0; i < n; i++) ps.push([R.int(0, 9), R.int(0, 9)]);
      const cx = mean(ps.map(function (p) { return p[0]; })), cy = mean(ps.map(function (p) { return p[1]; }));
      return P.text('After the assignment step these points are in one cluster: ' + ps.map(function (p) { return '(' + p.join(', ') + ')'; }).join(', ') + '. Where is the cluster’s new centroid? Give x, y (to 2 decimal places if needed).', 'custom', null,
        'The update step moves the centroid to the mean of its points: x = (' + ps.map(function (p) { return p[0]; }).join(' + ') + ') / ' + n + ' = ' + f(cx, 3) + ', y = (' + ps.map(function (p) { return p[1]; }).join(' + ') + ') / ' + n + ' = ' + f(cy, 3) + '.',
        { ph: 'x, y', showAns: '(' + f(cx, 2) + ', ' + f(cy, 2) + ')', checkFn: function (s) { const v = String(s).replace(/[()]/g, '').split(/[,;\s]+/).filter(Boolean).map(Number); if (v.length !== 2 || v.some(isNaN)) return { bad: 'Give two numbers: x, y.' }; return { ok: Math.abs(v[0] - cx) <= 0.006 && Math.abs(v[1] - cy) <= 0.006 }; }, src: S('ml-com1011-l-unsupervisedlearning', 'mean') });
    }],
    ['Linkage between clusters', function () {
      const L = ['P', 'Q', 'R', 'S'], m = dmat(4), cross = [m[0][2], m[0][3], m[1][2], m[1][3]];
      const k = R.pick(['single', 'complete', 'average']), v = k === 'single' ? Math.min.apply(null, cross) : k === 'complete' ? Math.max.apply(null, cross) : mean(cross);
      return P.num('Using this distance matrix, what is the <b>' + k + '-linkage</b> distance between clusters {P, Q} and {R, S}?' + mtab(m, L), v, 2,
        'The cross-cluster distances are P–R ' + cross[0] + ', P–S ' + cross[1] + ', Q–R ' + cross[2] + ', Q–S ' + cross[3] + '. Single linkage takes the smallest, complete the largest, average the mean: ' + k + ' = ' + f(v, 3) + '.', { src: S('ml-com1011-hierarchicalclusteringdbscan', 'linkage') });
    }],
    ['Agglomerative clustering', function () {
      const L = ['A', 'B', 'C', 'D', 'E'], m = dmat(5);
      let best = [0, 1]; for (let i = 0; i < 5; i++) for (let j = i + 1; j < 5; j++) if (m[i][j] < m[best[0]][best[1]]) best = [i, j];
      const pair = L[best[0]] + ' and ' + L[best[1]], others = [];
      for (let i = 0; i < 5; i++) for (let j = i + 1; j < 5; j++) if (!(i === best[0] && j === best[1])) others.push([L[i] + ' and ' + L[j], m[i][j]]);
      others.sort(function (a, b) { return a[1] - b[1]; });
      if (R.chance(0.5)) return P.mcq('Agglomerative clustering starts with every point in its own cluster. Which two are merged first?' + mtab(m, L), pair, [others[0][0], others[others.length - 1][0], others[3][0]], 'Merge the closest pair: ' + pair + ' at distance ' + m[best[0]][best[1]] + ', the smallest entry. That is the height of the first join in the dendrogram.', { src: S('ml-com1011-hierarchicalclusteringdbscan', 'dendrogram') });
      /* second merge with single linkage */
      const [i0, j0] = best, cl = [[i0, j0]]; for (let i = 0; i < 5; i++) if (i !== i0 && i !== j0) cl.push([i]);
      const dist = function (a, b) { let d = Infinity; a.forEach(function (x) { b.forEach(function (y) { d = Math.min(d, m[x][y]); }); }); return d; };
      let h2 = Infinity; for (let a = 0; a < cl.length; a++) for (let b = a + 1; b < cl.length; b++) h2 = Math.min(h2, dist(cl[a], cl[b]));
      return P.num('With <b>single linkage</b>, the first merge joins ' + pair + '. At what height (distance) is the second merge?' + mtab(m, L), h2, 0, 'After merging ' + pair + ', the distance from {' + L[i0] + ', ' + L[j0] + '} to any other point is the smaller of its two distances. The second merge happens at the smallest distance left between any two clusters: ' + h2 + '.', { src: S('ml-com1011-hierarchicalclusteringdbscan', 'single') });
    }],
    ['DBSCAN points', function () {
      const minPts = R.int(3, 6), eps = R.pick([0.5, 1, 1.5, 2]), k = R.int(0, 2);
      const nb = [R.int(minPts, minPts + 4), R.int(1, minPts - 1), R.int(1, minPts - 1)][k];
      const nearCore = k === 1;
      const desc = 'A point has ' + nb + ' points (counting itself) within ε = ' + eps + '. ' + (k === 0 ? '' : nearCore ? 'One of those neighbours is a core point.' : 'None of its neighbours is a core point.') + ' MinPts = ' + minPts + '.';
      const ans = ['Core point', 'Border point', 'Noise (outlier)'][k];
      return P.mcq('DBSCAN: ' + desc + ' What kind of point is it?', ans, ['Core point', 'Border point', 'Noise (outlier)'].filter(function (x) { return x !== ans; }), 'Core: at least MinPts points within ε. Border: fewer than MinPts, but within ε of a core point. Noise: neither. Here ' + nb + (nb >= minPts ? ' ≥ ' : ' &lt; ') + minPts + '.', { src: S('ml-com1011-hierarchicalclusteringdbscan', 'core') });
    }],
    ['Counting dendrograms', function () {
      const n = R.int(3, 8); let v = 1; for (let k = 2 * n - 3; k > 1; k -= 2) v *= k;
      return P.num('How many different (rooted, binary) dendrograms are there for ' + n + ' labelled points?', v, 0, '(2n − 3)!! = ' + Array.from({ length: n - 1 }, function (_, i) { return 2 * n - 3 - 2 * i; }).filter(function (x) { return x > 0; }).join(' × ') + ' = ' + v.toLocaleString('en-GB') + '. It grows faster than exponentially, which is why we build dendrograms greedily instead of trying them all.', { src: S('ml-com1011-hierarchicalclusteringdbscan', '!!') });
    }]
  ]);
})();
