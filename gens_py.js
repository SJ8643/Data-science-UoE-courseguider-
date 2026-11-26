/* gens_py.js – ECM1400 Programming: unlimited questions for each week. The exam is closed book with no computer,
   so most questions are trace-by-hand, spot-the-error and write-a-function. */
(function () {
  'use strict';
  const P = window.GUIDE.P, R = P.R, c = P.code_, esc = P.esc, py = P.pyStr;
  const S = function (deck, kw) { return P.slide(deck, kw); };
  const NAMES = ['Ana', 'Ben', 'Cleo', 'Dev', 'Ewan', 'Fatima', 'Grace', 'Hari', 'Isla', 'Jamal'];
  const WORDS = ['Exeter', 'Python', 'algorithm', 'dataset', 'Forum', 'lecture', 'variable', 'Devon', 'module', 'string'];
  const VAR = ['total', 'count', 'score', 'mark', 'n', 'value', 'price', 'age'];

  /* ===== Week 1: programs, algorithms, errors ===== */
  P.week('py', 1, 'Programs, algorithms and your first Python', { lessons: ['py-start'] }, [
    ['Algorithm or program', function () {
      return P.cls([
        ['A recipe for a martini, written as numbered steps', 'An algorithm', 'A recipe is a finite, ordered list of clear steps that solves a problem: an algorithm. It becomes a program only when written in a language a computer can run.'],
        ['A file <code>average.py</code> that reads numbers and prints their mean', 'A program', 'It is an algorithm written in Python, so a computer can run it: a program.'],
        ['Walking directions: “turn left, walk 200 m, take the second right”', 'An algorithm', 'Precise, ordered steps that solve a problem, in English rather than a programming language.'],
        ['A flowchart deciding whether a year is a leap year', 'An algorithm', 'A flowchart is one way to write an algorithm. A computer cannot run it directly.'],
        ['Pseudo-code: “for each mark, add it to total; then divide total by the count”', 'An algorithm', 'Pseudo-code is structured English: it plans an algorithm but is not a program the computer can run.'],
        ['A shopping list of ingredients', 'Neither', 'A list of items has no steps to carry out: it is data, not an algorithm.'],
        ['A Jupyter cell containing <code>print(sum([3, 4]) / 2)</code>', 'A program', 'Python code the interpreter can run is a program (a very short one).'],
        ['A table of exam marks', 'Neither', 'A table is data. An algorithm would be the steps you follow to process it.']
      ], 'Is this an algorithm, a program, or neither?<br><b>%s</b>', ['An algorithm', 'A program', 'Neither'], { src: S('py-programming-lecture-1', 'algorithm') });
    }],
    ['Reading error messages', function () {
      const v = R.pick(VAR), k = R.int(2, 9), w = R.pick(WORDS);
      const pool = [
        [v + ' = ' + k + '\nprint(' + v[0].toUpperCase() + v.slice(1) + ' + 1)', 'NameError', 'Names are case-sensitive: <code>' + v[0].toUpperCase() + v.slice(1) + '</code> was never assigned (only <code>' + v + '</code> was), so Python cannot find it.'],
        [v + ' = ' + k + '\nprint("' + w + ': " + ' + v + ')', 'TypeError', 'You cannot add a str and an int with <code>+</code>. Use <code>str(' + v + ')</code> or an f-string.'],
        ['print("' + w + '"', 'SyntaxError', 'The bracket is never closed, so the line is not valid Python. Python reports it before running anything.'],
        [v + ' = 0\nprint(' + (k * 10) + ' / ' + v + ')', 'ZeroDivisionError', 'Dividing by zero is impossible, so Python raises ZeroDivisionError when that line runs.'],
        ['if ' + k + ' > 3:\nprint("big")', 'IndentationError', 'The body of an <code>if</code> must be indented. Python expected an indented block after the colon.'],
        [v + ' = int("' + k + '.5")', 'ValueError', '<code>int()</code> only converts strings that look like whole numbers. "' + k + '.5" has the right type (str) but the wrong value.']
      ];
      const row = R.pick(pool);
      return P.mcq('Which error does Python report when you run this?', row[1], ['NameError', 'TypeError', 'SyntaxError', 'ZeroDivisionError', 'IndentationError', 'ValueError'].filter(function (e) { return e !== row[1]; }).slice(0, 4).sort(function () { return Math.random() - 0.5; }).slice(0, 3), row[2] + ' Read the last line of an error message first: it names the error.', { code: row[0], src: S('py-week1-l2', 'error') });
    }],
    ['Predict the output', function () {
      const a = R.int(2, 20), b = R.int(2, 12), w = R.pick(WORDS), n = R.int(2, 4);
      const t = R.int(0, 2);
      if (t === 0) return P.out('a = ' + a + '\nb = ' + b + '\nprint(a + b)\nprint("a" + "b")\nprint(a, b, sep="-")', [String(a + b), 'ab', a + '-' + b], '<code>a + b</code> adds the numbers. <code>"a" + "b"</code> joins two strings (the letters, not the variables). <code>sep="-"</code> replaces the space print normally puts between items.', { src: S('py-week1-l2', 'print') });
      if (t === 1) return P.out('word = "' + w + '"\nprint(word * ' + n + ')\nprint(len(word))', [w.repeat(n), String(w.length)], '<code>*</code> on a string repeats it. <code>len</code> counts the characters: ' + w.length + '.');
      return P.out('x = ' + a + '\nx = x + ' + b + '\nprint("x is", x)\nprint(x * 2)', ['x is ' + (a + b), String(2 * (a + b))], '<code>=</code> is assignment: the right side is worked out first (' + a + ' + ' + b + ' = ' + (a + b) + ') and then stored in x. print puts a space between items.');
    }],
    ['Interpreted and dynamically typed', function () {
      const T = ['Python runs your program through an interpreter, so an error on line 10 shows up only after lines 1 to 9 have run.',
        'In Python, a variable can hold an int and later a str: types belong to values, not to variable names.',
        'Python is general-purpose: the same language is used for web servers, data science and scripting.',
        'A high-level language such as Python hides details like memory addresses from you.'];
      const F = ['Python must be compiled into an .exe file before it can run.', 'Once <code>x = 5</code> has run, x can only ever hold integers.',
        'Python checks every line for type errors before running any of them.', 'Pseudo-code can be run directly by the Python interpreter.',
        'An algorithm must be written in a programming language.', 'Dynamically typed means the program changes its own code while running.'];
      return P.mcq('Which statement is true?', R.pick(T), R.sample(F, 3), 'Python is interpreted (run line by line, so later errors appear only when reached), dynamically typed (a name can be re-bound to a value of any type), high-level and general-purpose.', { src: S('py-week1-l2', 'interpret') });
    }],
    ['Plan with pseudo-code', function () {
      const T = R.pick([
        ['find the largest of three numbers a, b and c', ['Takes the three numbers as input (1)', 'Keeps a “largest so far”, starting with a (1)', 'Compares with b and with c, updating largest when bigger (1)', 'Outputs largest; steps are ordered and unambiguous (1)'],
          'INPUT a, b, c<br>SET largest TO a<br>IF b &gt; largest THEN SET largest TO b<br>IF c &gt; largest THEN SET largest TO c<br>OUTPUT largest'],
        ['decide whether a year is a leap year (divisible by 4, except centuries, unless divisible by 400)', ['Inputs the year (1)', 'Tests divisible by 400 → leap first, or handles the order correctly (1)', 'Centuries not divisible by 400 → not leap (1)', 'Other years divisible by 4 → leap, otherwise not; outputs the result (1)'],
          'INPUT year<br>IF year MOD 400 = 0 THEN OUTPUT "leap"<br>ELSE IF year MOD 100 = 0 THEN OUTPUT "not leap"<br>ELSE IF year MOD 4 = 0 THEN OUTPUT "leap"<br>ELSE OUTPUT "not leap"'],
        ['count the vowels in a word', ['Inputs the word and sets a counter to 0 (1)', 'Loops over every letter (1)', 'Adds 1 when the letter is one of a, e, i, o, u, ignoring case (1)', 'Outputs the count after the loop (1)'],
          'INPUT word<br>SET count TO 0<br>FOR EACH letter IN word<br>&nbsp;&nbsp;IF lowercase(letter) IN "aeiou" THEN count ← count + 1<br>OUTPUT count'],
        ['total a shopping basket and take 10% off if the total is over £50', ['Sets total to 0 and inputs the prices (1)', 'Adds every price to the total in a loop (1)', 'Checks total &gt; 50 after the loop (1)', 'Applies total × 0.9 only then, and outputs the total (1)'],
          'SET total TO 0<br>FOR EACH price IN basket: total ← total + price<br>IF total &gt; 50 THEN total ← total × 0.9<br>OUTPUT total']
      ]);
      return P.written('Write pseudo-code to ' + T[0] + '.', 4, T[1], T[2], { src: S('py-week1-l2', 'pseudo') });
    }]
  ]);

  /* ===== Week 2: variables, types, strings, operators, decisions ===== */
  function strOps(s) {
    const n = s.length, i = R.int(0, n - 1), k = R.int(1, Math.min(4, n - 1)), a = R.int(0, n - 3), b = R.int(a + 1, n), ch = R.pick(s.split(''));
    return R.sample([
      ['s[' + i + ']', s[i]], ['s[-' + k + ']', s[n - k]], ['s[' + a + ':' + b + ']', s.slice(a, b)], ['s[:' + k + ']', s.slice(0, k)], ['s[' + k + ':]', s.slice(k)],
      ['s[::-1]', s.split('').reverse().join('')], ['s[::2]', s.split('').filter(function (_, j) { return j % 2 === 0; }).join('')], ['len(s)', String(n)],
      ['s.upper()', s.toUpperCase()], ['s.lower()', s.toLowerCase()], ['s.count("' + ch + '")', String(s.split(ch).length - 1)], ['s.find("' + ch + '")', String(s.indexOf(ch))]
    ], 3);
  }
  function pyFloorDiv(a, b) { return Math.floor(a / b); }
  function pyMod(a, b) { return ((a % b) + b) % b; }
  P.week('py', 2, 'Variables, types, strings, operators and decisions', { lessons: ['py-vars', 'py-ops'] }, [
    ['Strings: index and slice', function () {
      const s = R.pick(WORDS), ops = strOps(s);
      return P.out('s = "' + s + '"\n' + ops.map(function (o) { return 'print(' + o[0] + ')'; }).join('\n'), ops.map(function (o) { return o[1]; }),
        'Index from 0 at the left and from −1 at the right. A slice <code>s[a:b]</code> includes index a but stops before b. ' + ops.map(function (o) { return c(o[0]) + ' → ' + c(o[1]); }).join(', ') + '.', { src: S('py-week2-l1', 'slic') });
    }],
    ['Arithmetic and precedence', function () {
      const a = R.int(7, 31), b = R.int(2, 6), k = R.int(2, 5);
      const pool = [['a // b', String(pyFloorDiv(a, b)), 'floor division drops the remainder'], ['a % b', String(pyMod(a, b)), 'the remainder after dividing'], ['a / b', P.pyNum(a / b), '/ always gives a float'],
        ['a ** 2', String(a * a), '** is power'], ['-b ** 2', String(-(b * b)), '** binds tighter than unary minus, so this is −(b²)'], ['a - b * ' + k, String(a - b * k), '* before -'],
        ['(a - b) * ' + k, String((a - b) * k), 'brackets first'], ['2 ** 3 ** 2', '512', '** groups from the right: 2 ** 9'], ['a // b * b + a % b', String(a), 'quotient × divisor + remainder gives back a'],
        [a + ' / ' + (b * 2) + ' * 2', P.pyNum(a / (b * 2) * 2), '/ and * have equal precedence and go left to right']];
      const ch = R.sample(pool, 3);
      return P.out('a = ' + a + '\nb = ' + b + '\n' + ch.map(function (o) { return 'print(' + o[0] + ')'; }).join('\n'), ch.map(function (o) { return o[1]; }),
        ch.map(function (o) { return c(o[0]) + ' → ' + c(o[1]) + ' (' + o[2] + ')'; }).join('; ') + '.', { src: S('py-week2-l2', 'precedence') });
    }],
    ['Types and conversion', function () {
      const n = R.int(2, 9), m = R.int(1, 9), x = R.int(2, 9), y = R.int(1, 9), w = R.pick(['hi', 'ab', 'no', 'ok']), d = R.pick([2, 4, 5]);
      const pool = [['int("' + n + '") + ' + m, String(n + m)], ['str(' + n + ') + "' + m + '"', '' + n + m], ['type(' + (n * d) + ' / ' + d + ')', "<class 'float'>"], ['int(' + x + '.' + y + ')', String(x)],
        ['int(-' + x + '.' + y + ')', String(-x)], ['"' + w + '" * ' + m, w.repeat(m)], ['float(' + n + ')', n + '.0'], ['bool(0), bool("' + w + '")', 'False True'], ['type("' + n + '")', "<class 'str'>"], [n + ' == "' + n + '"', 'False'], [n + ' == ' + n + '.0', 'True']];
      const ch = R.sample(pool, 3);
      return P.out(ch.map(function (o) { return 'print(' + o[0] + ')'; }).join('\n'), ch.map(function (o) { return o[1]; }),
        'int() of a float cuts towards zero; str + str joins; / always makes a float; an int never equals a str, but 3 == 3.0 is True. ' + ch.map(function (o) { return c(o[0]) + ' → ' + c(o[1]); }).join(', ') + '.', { src: S('py-week2-l1', 'type') });
    }],
    ['Variable names', function () {
      const good = ['total_marks', '_count', 'studentAge', 'x2', 'max_value', 'Exeter2026'], bad = [['2nd_place', 'cannot start with a digit'], ['first-name', '- is the minus operator'], ['class', 'a reserved keyword'], ['my var', 'no spaces allowed'], ['total$', '$ is not allowed'], ['for', 'a reserved keyword'], ['import', 'a reserved keyword']];
      const g = R.pick(good), bs = R.sample(bad, 3);
      return P.mcq('Which of these is a legal Python variable name?', c(g), bs.map(function (b) { return c(b[0]); }), 'Names use letters, digits and underscores and cannot start with a digit or be a keyword. ' + bs.map(function (b) { return c(b[0]) + ': ' + b[1]; }).join('; ') + '.', { src: S('py-week2-l1', 'name') });
    }],
    ['if / elif / else', function () {
      const t2 = R.int(5, 20), t1 = t2 + R.int(5, 20), x = R.int(0, t1 + 10);
      const first = x > t1 ? 'big' : x > t2 ? 'medium' : 'small';
      const out = [first]; if (x % 2 === 0 && x > t2) out.push('even and over ' + t2); if (!(x > t1) || x === t1 + 1) out.push('check');
      const code = 'x = ' + x + '\nif x > ' + t1 + ':\n    print("big")\nelif x > ' + t2 + ':\n    print("medium")\nelse:\n    print("small")\nif x % 2 == 0 and x > ' + t2 + ':\n    print("even and over ' + t2 + '")\nif not x > ' + t1 + ' or x == ' + (t1 + 1) + ':\n    print("check")';
      return P.out(code, out, 'Only the first true branch of an if/elif/else chain runs. x = ' + x + ': ' + (x > t1 ? 'x > ' + t1 : x > t2 ? 'x > ' + t2 + ' but not > ' + t1 : 'neither test is true') + '. The second if is separate: ' + (x % 2 === 0 ? 'x is even' : 'x is odd') + ' and ' + (x > t2 ? '' : 'not ') + 'over ' + t2 + '. The third: <code>not x > ' + t1 + '</code> is ' + (!(x > t1) ? 'True' : 'False') + ', so it prints only if one side of <code>or</code> is true.', { src: S('py-week2-l2', 'elif') });
    }],
    ['Write a decision function', function () {
      const T = R.pick([
        ['Write <code>classify(mark)</code> that returns <code>"First"</code> for 70 or more, <code>"2:1"</code> for 60–69, <code>"2:2"</code> for 50–59, <code>"Third"</code> for 40–49 and <code>"Fail"</code> below 40.', 'def classify(mark):\n    pass\n',
          'assert classify(70) == "First" and classify(95) == "First"\nassert classify(69) == "2:1" and classify(60) == "2:1"\nassert classify(59) == "2:2" and classify(50) == "2:2"\nassert classify(49) == "Third" and classify(40) == "Third"\nassert classify(39) == "Fail" and classify(0) == "Fail"',
          'def classify(mark):\n    if mark >= 70:\n        return "First"\n    elif mark >= 60:\n        return "2:1"\n    elif mark >= 50:\n        return "2:2"\n    elif mark >= 40:\n        return "Third"\n    return "Fail"'],
        ['Write <code>is_leap(year)</code> that returns True for leap years: divisible by 4, except centuries, unless divisible by 400.', 'def is_leap(year):\n    pass\n',
          'assert is_leap(2024) and is_leap(2000) and is_leap(1996)\nassert not is_leap(1900) and not is_leap(2023) and not is_leap(2100)',
          'def is_leap(year):\n    return year % 400 == 0 or (year % 4 == 0 and year % 100 != 0)'],
        ['Write <code>count_roots(a, b, c)</code> that returns how many real roots ax² + bx + c = 0 has (0, 1 or 2), using the discriminant b² − 4ac. Assume a ≠ 0.', 'def count_roots(a, b, c):\n    pass\n',
          'assert count_roots(1, -6, -2) == 2\nassert count_roots(1, 2, 1) == 1\nassert count_roots(1, 0, 4) == 0\nassert count_roots(2, -4, 2) == 1',
          'def count_roots(a, b, c):\n    d = b * b - 4 * a * c\n    if d > 0:\n        return 2\n    elif d == 0:\n        return 1\n    return 0'],
        ['Write <code>bigger_abs(x, y)</code> that returns whichever of x and y is further from zero (return x if they tie), without using <code>abs</code> or <code>max</code>.', 'def bigger_abs(x, y):\n    pass\n',
          'assert bigger_abs(3, -7) == -7\nassert bigger_abs(-2, 1) == -2\nassert bigger_abs(4, -4) == 4\nassert bigger_abs(0, 0) == 0',
          'def bigger_abs(x, y):\n    ax = x if x >= 0 else -x\n    ay = y if y >= 0 else -y\n    if ay > ax:\n        return y\n    return x']
      ]);
      return P.code(T[0], T[1], T[2], T[3], 'Test the boundaries (exactly 70, exactly 60, …): that is where if/elif chains usually go wrong.', { src: S('py-week2-l2', 'if') });
    }],
    ['The quadratic formula', function () {
      const r1 = R.int(-6, 6), r2 = R.int(-6, 6), a = R.pick([1, 1, 2]);
      const b = -a * (r1 + r2), cc = a * r1 * r2, D = b * b - 4 * a * cc;
      if (R.chance(0.5)) return P.num('For ' + a + 'x² ' + (b < 0 ? '− ' + (-b) : '+ ' + b) + 'x ' + (cc < 0 ? '− ' + (-cc) : '+ ' + cc) + ' = 0, what is the discriminant b² − 4ac?', D, 0, 'b² − 4ac = ' + b + '² − 4 × ' + a + ' × ' + cc + ' = ' + (b * b) + ' − ' + (4 * a * cc) + ' = ' + D + '. ' + (D > 0 ? 'Positive: two real roots.' : D === 0 ? 'Zero: one repeated root.' : 'Negative: no real roots.'), { src: S('py-week2-l2', 'quadratic') });
      const big = Math.max(r1, r2);
      return P.num('The program computes <code>(-b + sqrt(b**2 - 4*a*c)) / (2*a)</code> for a = ' + a + ', b = ' + b + ', c = ' + cc + '. What value does it give?', big, 2, 'Discriminant = ' + D + ', √' + D + ' = ' + Math.sqrt(D) + '. (−(' + b + ') + ' + Math.sqrt(D) + ') / ' + (2 * a) + ' = ' + big + '.', { src: S('py-week2-l2', 'quadratic') });
    }]
  ]);

  /* ===== Week 3: loops and functions ===== */
  P.week('py', 3, 'Loops and functions', { lessons: ['py-loops', 'py-functions'] }, [
    ['Trace a while loop', function () {
      const n0 = R.int(1, 5), lim = R.int(20, 70), dbl = R.chance(0.5), k = R.int(3, 9);
      const out = []; let n = n0; while (n < lim) { out.push(String(n)); n = dbl ? n * 2 : n + k; } out.push('done ' + n);
      return P.out('n = ' + n0 + '\nwhile n < ' + lim + ':\n    print(n)\n    n = ' + (dbl ? 'n * 2' : 'n + ' + k) + '\nprint("done", n)', out, 'The test is checked before each pass. It stops the first time n reaches ' + lim + ' or more, so the last value printed inside the loop is the last one below ' + lim + ', and “done” shows the value that broke the condition (' + n + ').', { src: S('py-week3-l1', 'while') });
    }],
    ['range()', function () {
      let a, b, s;
      do { s = R.pick([1, 2, 3, 5, -1, -2, -3]); a = R.int(-5, 12); b = R.int(-5, 20); } while (s > 0 ? b <= a || (b - a) / s > 9 : b >= a || (a - b) / -s > 9);
      const vals = []; for (let i = a; s > 0 ? i < b : i > b; i += s) vals.push(i);
      if (R.chance(0.4)) return P.num('How many times does the body of <code>for i in range(' + a + ', ' + b + ', ' + s + '):</code> run?', vals.length, 0, 'range(start, stop, step) starts at ' + a + ' and stops <i>before</i> ' + b + ': ' + vals.join(', ') + ' → ' + vals.length + ' values.', { src: S('py-week3-l1', 'range') });
      return P.out('for i in range(' + a + ', ' + b + ', ' + s + '):\n    print(i, end=" ")\nprint()', [vals.join(' ')], 'Start at ' + a + ', add ' + s + ' each time, and stop before reaching ' + b + ' (the stop value is never included).', { src: S('py-week3-l1', 'range') });
    }],
    ['Accumulator pattern', function () {
      const n = R.int(8, 25), k = R.int(2, 5), cnt = R.chance(0.4);
      let tot = 0; const used = []; for (let i = 1; i <= n; i++) if (i % k === 0) { tot += cnt ? 1 : i; used.push(i); }
      return P.num('What does this print?', tot, 0, 'Values of i from 1 to ' + n + ' divisible by ' + k + ': ' + used.join(', ') + '. ' + (cnt ? 'Counting them gives ' + tot : 'Their sum is ' + tot) + '. Note range(1, ' + (n + 1) + ') includes ' + n + '.', { code: 'total = 0\nfor i in range(1, ' + (n + 1) + '):\n    if i % ' + k + ' == 0:\n        total += ' + (cnt ? '1' : 'i') + '\nprint(total)', src: S('py-week3-l1', 'accumulat') });
    }],
    ['return versus print', function () {
      const k = R.int(2, 9), v = R.int(2, 12);
      return P.out('def f(x):\n    print(x * ' + k + ')\n\ndef g(x):\n    return x * ' + k + '\n\na = f(' + v + ')\nb = g(' + v + ')\nprint(a, b)', [String(v * k), 'None ' + v * k], 'f prints ' + v * k + ' while running, but has no return, so it gives back None and a = None. g prints nothing and returns ' + v * k + '. The last line prints both.', { src: S('py-week3-l2', 'return') });
    }],
    ['Default and keyword arguments', function () {
      const d = R.int(2, 6), w1 = R.int(2, 9), w2 = R.int(2, 9), h3 = R.int(2, 9), w3 = R.int(2, 9);
      return P.out('def area(w, h=' + d + ', unit="cm"):\n    return str(w * h) + unit\n\nprint(area(' + w1 + '))\nprint(area(' + w2 + ', unit="m"))\nprint(area(h=' + h3 + ', w=' + w3 + '))', [w1 * d + 'cm', w2 * d + 'm', w3 * h3 + 'cm'],
        'Missing arguments take their defaults (h = ' + d + ', unit = "cm"). Keyword arguments can come in any order. str(...) + unit joins text, so there is no space.', { src: S('py-week3-l2', 'default') });
    }],
    ['Local or global?', function () {
      const a = R.int(1, 9), b = R.int(2, 9);
      if (R.chance(0.5)) return P.out('x = ' + a + '\n\ndef change(x):\n    x = x + ' + b + '\n    return x\n\ny = change(x)\nprint(x, y)', [a + ' ' + (a + b)], 'The parameter x inside change is a new local name. Reassigning it does not touch the global x, which stays ' + a + '. The returned value ' + (a + b) + ' goes into y.', { src: S('py-week3-l2', 'local') });
      return P.out('count = ' + a + '\n\ndef bump():\n    global count\n    count += ' + b + '\n\nbump()\nbump()\nprint(count)', [String(a + 2 * b)], '<code>global count</code> makes the function change the global variable, so each call adds ' + b + ': ' + a + ' + ' + b + ' + ' + b + ' = ' + (a + 2 * b) + '.', { src: S('py-week3-l2', 'global') });
    }],
    ['break and continue', function () {
      const n = R.int(12, 20), k = R.int(2, 4), m = R.int(5, n - 3);
      const out = []; for (let i = 1; i < n; i++) { if (i % k === 0) continue; if (i > m) break; out.push(i); }
      return P.out('for i in range(1, ' + n + '):\n    if i % ' + k + ' == 0:\n        continue\n    if i > ' + m + ':\n        break\n    print(i, end=" ")\nprint()', [out.join(' ')], '<code>continue</code> skips multiples of ' + k + ' and goes to the next i. <code>break</code> ends the loop at the first non-multiple above ' + m + '.', { src: S('py-week3-l1', 'break') });
    }],
    ['Write a function with a loop', function () {
      const T = R.pick([
        ['Write <code>sum_multiples(n, k)</code> that returns the sum of the multiples of k from 1 up to and including n.', 'def sum_multiples(n, k):\n    pass\n', 'assert sum_multiples(10, 3) == 18\nassert sum_multiples(20, 5) == 50\nassert sum_multiples(4, 5) == 0\nassert sum_multiples(6, 6) == 6', 'def sum_multiples(n, k):\n    total = 0\n    for i in range(k, n + 1, k):\n        total += i\n    return total'],
        ['Write <code>count_vowels(s)</code> that returns how many of the letters in s are vowels (a, e, i, o, u, upper or lower case).', 'def count_vowels(s):\n    pass\n', 'assert count_vowels("Exeter") == 3\nassert count_vowels("rhythm") == 0\nassert count_vowels("AEIOU") == 5\nassert count_vowels("") == 0', 'def count_vowels(s):\n    count = 0\n    for ch in s.lower():\n        if ch in "aeiou":\n            count += 1\n    return count'],
        ['Write <code>factorial(n)</code> using a loop (not recursion). factorial(0) is 1.', 'def factorial(n):\n    pass\n', 'assert factorial(0) == 1\nassert factorial(1) == 1\nassert factorial(5) == 120\nassert factorial(10) == 3628800', 'def factorial(n):\n    result = 1\n    for i in range(2, n + 1):\n        result *= i\n    return result'],
        ['Write <code>is_prime(n)</code> that returns True if n is prime. Numbers below 2 are not prime.', 'def is_prime(n):\n    pass\n', 'assert [x for x in range(30) if is_prime(x)] == [2, 3, 5, 7, 11, 13, 17, 19, 23, 29]\nassert not is_prime(1) and not is_prime(-7) and is_prime(97)', 'def is_prime(n):\n    if n < 2:\n        return False\n    i = 2\n    while i * i <= n:\n        if n % i == 0:\n            return False\n        i += 1\n    return True'],
        ['Write <code>digit_sum(n)</code> that returns the sum of the digits of a non-negative integer, using a while loop with // and %.', 'def digit_sum(n):\n    pass\n', 'assert digit_sum(0) == 0\nassert digit_sum(7) == 7\nassert digit_sum(1234) == 10\nassert digit_sum(9009) == 18', 'def digit_sum(n):\n    total = 0\n    while n > 0:\n        total += n % 10\n        n //= 10\n    return total']
      ]);
      return P.code(T[0], T[1], T[2], T[3], 'Write the loop by hand first: initialise, loop, update, return after the loop (not inside it).', { src: S('py-week3-l1', 'for') });
    }]
  ]);

  /* ===== Weeks 4–5: lists, dictionaries, files, comprehensions ===== */
  P.week('py', 4, 'Lists, dictionaries and files', { lessons: ['py-collections'], label: 'Weeks 4–5', decks: [] }, [
    ['List methods', function () {
      let a = R.distinct(4, 1, 20); const code = ['a = ' + py(a)], steps = [];
      const x = R.int(21, 30), y = R.int(31, 40);
      R.sample(['append', 'insert', 'pop', 'remove', 'sort', 'reverse'], 3).forEach(function (op) {
        if (op === 'append') { a.push(x); code.push('a.append(' + x + ')'); }
        if (op === 'insert') { a.splice(1, 0, y); code.push('a.insert(1, ' + y + ')'); }
        if (op === 'pop') { const v = a.pop(); code.push('last = a.pop()'); steps.push('pop removed ' + v); }
        if (op === 'remove') { const v = a[R.int(0, a.length - 1)]; a.splice(a.indexOf(v), 1); code.push('a.remove(' + v + ')'); }
        if (op === 'sort') { a.sort(function (p, q) { return p - q; }); code.push('a.sort()'); }
        if (op === 'reverse') { a.reverse(); code.push('a.reverse()'); }
      });
      code.push('print(a)', 'print(len(a), a[-1])');
      return P.out(code.join('\n'), [py(a), a.length + ' ' + a[a.length - 1]], 'Apply each method in order to the same list. append adds at the end, insert(1, v) puts v at index 1, pop() removes and returns the last item, remove(v) deletes the first v, sort and reverse change the list in place. ' + steps.join('. '), { norm: 'loose' });
    }],
    ['Aliasing', function () {
      const a = R.distinct(3, 1, 9), x = R.int(10, 19), y = R.int(20, 29), how = R.pick(['a[:]', 'list(a)', 'a.copy()']);
      return P.out('a = ' + py(a) + '\nb = a\nc = ' + how + '\nb.append(' + x + ')\nc.append(' + y + ')\nprint(a)\nprint(c)', [py(a.concat([x])), py(a.concat([y]))], '<code>b = a</code> does not copy: b and a name the same list, so appending through b changes a. <code>' + how + '</code> makes a new list, so c changes alone.', { norm: 'loose' });
    }],
    ['Dictionaries', function () {
      const pool = ['red', 'blue', 'green', 'red', 'blue', 'red', 'gold'];
      const words = []; const n = R.int(6, 9); for (let i = 0; i < n; i++) words.push(R.pick(pool));
      const counts = {}; words.forEach(function (w) { counts[w] = (counts[w] || 0) + 1; });
      const q = R.pick(Object.keys(counts)), miss = 'pink';
      return P.out('text = "' + words.join(' ') + '"\ncounts = {}\nfor w in text.split():\n    counts[w] = counts.get(w, 0) + 1\nprint(counts["' + q + '"], len(counts))\nprint(counts.get("' + miss + '", 0))', [counts[q] + ' ' + Object.keys(counts).length, '0'],
        'The loop counts each word: ' + Object.keys(counts).map(function (k) { return k + ' → ' + counts[k]; }).join(', ') + '. len gives the number of different keys. <code>get(key, 0)</code> returns 0 instead of raising KeyError for a missing key.');
    }],
    ['Comprehensions', function () {
      const n = R.int(5, 10), ws = R.sample(['data', 'loop', 'variable', 'set', 'graph', 'Python', 'tree', 'module'], 4), k = R.int(3, 5);
      const t = R.int(0, 2);
      if (t === 0) { const v = []; for (let x = 0; x < n; x++) if (x % 2 === 0) v.push(x * x); return P.out('print([x * x for x in range(' + n + ') if x % 2 == 0])', [py(v)], 'Keep the even x from 0 to ' + (n - 1) + ', then square each.', { norm: 'loose' }); }
      if (t === 1) return P.out('words = ' + py(ws) + '\nprint([w[0].upper() for w in words])', [py(ws.map(function (w) { return w[0].toUpperCase(); }))], 'The first character of each word, in upper case, in the same order.', { norm: 'loose' });
      return P.out('words = ' + py(ws) + '\nprint([len(w) for w in words if len(w) > ' + k + '])', [py(ws.filter(function (w) { return w.length > k; }).map(function (w) { return w.length; }))], 'Filter first (length more than ' + k + '), then map each kept word to its length.', { norm: 'loose' });
    }],
    ['Write a function on collections', function () {
      const T = R.pick([
        ['Write <code>word_counts(text)</code> that returns a dictionary mapping each word (split on spaces) to how many times it appears.', 'def word_counts(text):\n    pass\n', 'assert word_counts("a b a") == {"a": 2, "b": 1}\nassert word_counts("") == {}\nassert word_counts("x x x") == {"x": 3}', 'def word_counts(text):\n    counts = {}\n    for w in text.split():\n        counts[w] = counts.get(w, 0) + 1\n    return counts'],
        ['Write <code>dedupe(items)</code> that returns a new list without repeats, keeping the first time each item appears.', 'def dedupe(items):\n    pass\n', 'assert dedupe([3, 1, 3, 2, 1]) == [3, 1, 2]\nassert dedupe([]) == []\nassert dedupe(["a", "a"]) == ["a"]', 'def dedupe(items):\n    seen = []\n    for x in items:\n        if x not in seen:\n            seen.append(x)\n    return seen'],
        ['Write <code>invert(d)</code> that swaps keys and values (assume the values are all different).', 'def invert(d):\n    pass\n', 'assert invert({"a": 1, "b": 2}) == {1: "a", 2: "b"}\nassert invert({}) == {}', 'def invert(d):\n    return {v: k for k, v in d.items()}'],
        ['Write <code>evens_squared(nums)</code> that returns the squares of the even numbers in nums, in order, using a list comprehension.', 'def evens_squared(nums):\n    pass\n', 'assert evens_squared([1, 2, 3, 4]) == [4, 16]\nassert evens_squared([]) == []\nassert evens_squared([-2, 5]) == [4]', 'def evens_squared(nums):\n    return [x * x for x in nums if x % 2 == 0]'],
        ['Write <code>longest(words)</code> that returns the longest word in a non-empty list (the first one if there is a tie).', 'def longest(words):\n    pass\n', 'assert longest(["hi", "hello", "hey"]) == "hello"\nassert longest(["ab", "cd"]) == "ab"\nassert longest(["x"]) == "x"', 'def longest(words):\n    best = words[0]\n    for w in words[1:]:\n        if len(w) > len(best):\n            best = w\n    return best']
      ]);
      return P.code(T[0], T[1], T[2], T[3], 'Build the result in a new variable, loop, and return it after the loop.');
    }],
    ['Files', function () {
      const f = R.pick(['log.txt', 'marks.txt', 'notes.txt']), n = R.int(3, 12);
      return R.pick([
        function () { return P.mcq(f + ' has ' + n + ' lines. What does <code>open("' + f + '", "w")</code> do to them?', 'Deletes them: "w" empties the file before writing', ['Keeps them and adds new text at the end', 'Raises an error because the file exists', 'Keeps them until you call close()'], '"w" creates the file or truncates (empties) it. Use "a" to append, "r" to read.'); },
        function () { return P.mcq('What does <code>open("' + f + '", "a")</code> do when you then write a line?', 'Adds the line after the existing ' + n + ' lines', ['Replaces the first line', 'Deletes the file first', 'Raises an error unless the file is empty'], '"a" means append: writing starts at the end and keeps what was there.'); },
        function () { return P.mcq('Why is <code>with open("' + f + '") as fh:</code> preferred to <code>fh = open("' + f + '")</code>?', 'It closes the file automatically, even if an error happens inside the block', ['It reads the file faster', 'It allows writing as well as reading', 'It stops other programs reading the file'], 'The with statement guarantees the file is closed when the block ends, error or not.'); },
        function () { return P.mcq('What does <code>open("missing.txt", "r")</code> do if the file does not exist?', 'Raises FileNotFoundError', ['Creates an empty file', 'Returns None', 'Raises KeyError'], 'Reading needs the file to exist. Modes "w" and "a" would create it.'); },
        function () { return P.mcq('<code>lines = fh.readlines()</code> on a ' + n + '-line file gives…', 'a list of ' + n + ' strings, each ending in "\\n" (except perhaps the last)', ['one string with all the text', 'a list of ' + n + ' strings with the "\\n" removed', 'the first line only'], 'readlines keeps the newline characters: use <code>line.strip()</code> to remove them.'); }
      ])();
    }],
    ['Mutable or immutable', function () {
      const imm = ['a tuple <code>(1, 2, 3)</code>', 'a string <code>"abc"</code>', 'an int <code>7</code>', 'a frozenset <code>frozenset({1, 2})</code>'], mut = ['a list <code>[1, 2, 3]</code>', 'a dictionary <code>{"a": 1}</code>', 'a set <code>{1, 2}</code>'];
      return P.mcq('Which of these can be changed in place (is mutable)?', R.pick(mut), R.sample(imm, 3), 'Lists, dictionaries and sets are mutable. Tuples, strings, numbers and frozensets are immutable: <code>t[0] = 5</code> on a tuple raises TypeError, and string methods return new strings.');
    }]
  ]);

  /* ===== Week 7: exceptions, testing, logging, APIs and JSON ===== */
  P.week('py', 7, 'Exceptions, testing, logging, APIs and JSON', { lessons: ['py-errors', 'py-apis'] }, [
    ['try / except / else / finally', function () {
      if (R.chance(0.5)) {
        const bb = R.pick([0, 2, 4, 5]), a = bb ? bb * R.int(1, 9) : R.int(2, 30);
        const out = bb === 0 ? ['cannot divide', 'done', 'None'] : ['ok', 'done', P.pyNum(a / bb)];
        return P.out('def safe_div(a, b):\n    try:\n        r = a / b\n    except ZeroDivisionError:\n        print("cannot divide")\n        return None\n    else:\n        print("ok")\n        return r\n    finally:\n        print("done")\n\nprint(safe_div(' + a + ', ' + bb + '))', out,
          (bb === 0 ? 'Dividing by 0 raises ZeroDivisionError, so the except block runs.' : 'No error, so the else block runs.') + ' <code>finally</code> always runs, even when the function is returning, so “done” comes before the caller prints the result.' + (bb ? ' / gives a float: ' + P.pyNum(a / bb) + '.' : ''), { src: S('py-programming-7-2-logging-testing-and-exception-handling', 'finally') });
      }
      const vals = R.sample(['12', '7', 'x', '3', 'ten', '20', '4.5', '-2'], 4); let tot = 0; const out = [];
      vals.forEach(function (v) { if (/^-?\d+$/.test(v)) tot += parseInt(v, 10); else out.push('skip ' + v); }); out.push(String(tot));
      return P.out('values = ' + py(vals) + '\ntotal = 0\nfor v in values:\n    try:\n        total += int(v)\n    except ValueError:\n        print("skip", v)\nprint(total)', out, '<code>int()</code> raises ValueError for text that is not a whole number (including "4.5"). The except block prints and the loop carries on with the next value.', { src: S('py-programming-7-2-logging-testing-and-exception-handling', 'except') });
    }],
    ['Which exception?', function () {
      const nm = R.pick(NAMES), k = R.int(3, 6);
      const pool = [['marks = {"' + nm + '": 70}\nprint(marks["' + R.pick(NAMES.filter(function (x) { return x !== nm; })) + '"])', 'KeyError', 'The key is not in the dictionary. <code>marks.get(name)</code> would return None instead.'],
        ['items = ' + py(R.distinct(k, 1, 9)) + '\nprint(items[' + k + '])', 'IndexError', 'A list of ' + k + ' items has indexes 0 to ' + (k - 1) + '.'],
        ['n = int("' + R.pick(['ten', 'seven', '3.5']) + '")', 'ValueError', 'Right type (a string), wrong value for int().'],
        ['print("' + k + '" + ' + k + ')', 'TypeError', 'str + int is not defined.'],
        ['open("' + R.pick(['data', 'results', 'old']) + '_missing.csv")', 'FileNotFoundError', 'Reading a file that does not exist.'],
        ['print(' + k + ' / (' + k + ' - ' + k + '))', 'ZeroDivisionError', 'The bracket is 0.']];
      const row = R.pick(pool);
      return P.mcq('Which exception does this raise?', row[1], ['KeyError', 'IndexError', 'ValueError', 'TypeError', 'FileNotFoundError', 'ZeroDivisionError'].filter(function (e) { return e !== row[1]; }).sort(function () { return Math.random() - 0.5; }).slice(0, 3), row[2], { code: row[0], src: S('py-programming-7-2-logging-testing-and-exception-handling', 'ValueError') });
    }],
    ['Logging levels', function () {
      const L = ['DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL'], lvl = R.int(0, 4), msgs = [];
      for (let i = 0; i < 5; i++) msgs.push(R.int(0, 4));
      const shown = msgs.filter(function (m) { return m >= lvl; }).length;
      return P.num('How many messages does this show?', shown, 0, 'Levels in order: DEBUG &lt; INFO &lt; WARNING &lt; ERROR &lt; CRITICAL. With the level set to ' + L[lvl] + ', only messages at ' + L[lvl] + ' or above appear: ' + msgs.map(function (m) { return L[m] + (m >= lvl ? ' ✓' : ' ✗'); }).join(', ') + '.',
        { code: 'import logging\nlogging.basicConfig(level=logging.' + L[lvl] + ')\n' + msgs.map(function (m) { return 'logging.' + L[m].toLowerCase() + '("' + R.pick(['loading file', 'value checked', 'disk nearly full', 'request failed', 'database down', 'retrying', 'user saved']) + '")'; }).join('\n'), src: S('py-programming-7-2-logging-testing-and-exception-handling', 'logging') });
    }],
    ['Navigate JSON', function () {
      const ns = R.sample(NAMES, 3), ms = ns.map(function () { return R.int(40, 90); }), mod = R.pick(['ECM1400', 'COM1011', 'ECM1415']), i = R.int(0, 2), j = R.int(0, 2);
      const txt = '{"module": "' + mod + '", "students": [' + ns.map(function (n, k) { return '{"name": "' + n + '", "mark": ' + ms[k] + '}'; }).join(', ') + ']}';
      return P.out("import json\ntext = '" + txt + "'\ndata = json.loads(text)\nprint(data[\"students\"][" + i + "][\"name\"])\nprint(len(data[\"students\"]), data[\"module\"])\nprint(data[\"students\"][" + j + "][\"mark\"] + 1)", [ns[i], '3 ' + mod, String(ms[j] + 1)],
        'json.loads turns the text into a dictionary. "students" is a list of dictionaries: index it with a number, then use the key. Numbers in JSON become ints, so + 1 works.', { src: S('py-week-7-1-apis', 'json') });
    }],
    ['REST requests', function () {
      if (R.chance(0.5)) {
        const city = R.pick(['Exeter', 'Plymouth', 'Bristol']), u = R.pick(['metric', 'imperial']), base = 'https://api.example.com/weather';
        return P.mcq('Which URL asks this API for the weather in ' + city + ' with units=' + u + '?', c(base + '?city=' + city + '&units=' + u), [c(base + '&city=' + city + '?units=' + u), c(base + '/city=' + city + '/units=' + u), c(base + '?city=' + city + '?units=' + u)], 'Query parameters start after a single <code>?</code> and are separated by <code>&amp;</code>. requests builds this for you from <code>params={"city": "' + city + '", "units": "' + u + '"}</code>.', { src: S('py-week-7-1-apis', '?') });
      }
      const codes = [['200', 'OK: the request worked'], ['404', 'Not Found: there is nothing at that URL'], ['401', 'Unauthorised: missing or bad credentials, such as an API key'], ['500', 'Internal Server Error: the server failed']];
      const row = R.pick(codes);
      return P.mcq('An API call returns status code ' + row[0] + '. What does it mean?', row[1], codes.filter(function (r) { return r !== row; }).map(function (r) { return r[1]; }), 'Check <code>response.status_code</code> (or call <code>raise_for_status()</code>) before using <code>response.json()</code>. 2xx success, 4xx your mistake, 5xx the server’s.');
    }],
    ['Raise your own exception', function () {
      const T = R.pick([
        ['Write <code>percentage(score, total)</code> that returns <code>round(100 * score / total, 1)</code>, but raises ValueError if total is not positive or score is outside 0..total.', 'def percentage(score, total):\n    pass\n',
          'assert percentage(17, 20) == 85.0\nassert percentage(0, 5) == 0.0\nfor bad in [(5, 0), (-1, 10), (11, 10), (3, -4)]:\n    try:\n        percentage(*bad)\n        raise AssertionError("no ValueError for %s" % (bad,))\n    except ValueError:\n        pass',
          'def percentage(score, total):\n    if total <= 0 or score < 0 or score > total:\n        raise ValueError("score must be between 0 and a positive total")\n    return round(100 * score / total, 1)'],
        ['Write <code>check_mark(m)</code> that returns m if it is an int from 0 to 100, raises TypeError if it is not an int, and raises ValueError if it is out of range.', 'def check_mark(m):\n    pass\n',
          'assert check_mark(0) == 0 and check_mark(100) == 100\nfor bad, err in [("70", TypeError), (7.5, TypeError), (101, ValueError), (-1, ValueError)]:\n    try:\n        check_mark(bad)\n        raise AssertionError("no error for %r" % (bad,))\n    except err:\n        pass',
          'def check_mark(m):\n    if not isinstance(m, int):\n        raise TypeError("mark must be an int")\n    if m < 0 or m > 100:\n        raise ValueError("mark must be 0 to 100")\n    return m']
      ]);
      return P.code(T[0], T[1], T[2], T[3], 'Check the bad cases first and <code>raise</code> straight away; the normal case comes last.', { src: S('py-programming-7-2-logging-testing-and-exception-handling', 'raise') });
    }],
    ['assert and unittest', function () {
      const fn = R.pick(['add', 'area', 'average']), a = R.int(2, 9), b = R.int(2, 9), r = fn === 'add' ? a + b : fn === 'area' ? a * b : (a + b) / 2;
      const rs = fn === 'average' ? P.pyNum(r) : String(r);
      return P.mcq('In a <code>unittest.TestCase</code>, which line properly tests that <code>' + fn + '(' + a + ', ' + b + ')</code> returns ' + rs + '?', c('self.assertEqual(' + fn + '(' + a + ', ' + b + '), ' + rs + ')'), [c('self.assertTrue(' + fn + '(' + a + ', ' + b + '))'), c('print(' + fn + '(' + a + ', ' + b + ') == ' + rs + ')'), c('assert ' + fn + '(' + a + ', ' + b + ') = ' + rs)],
        'assertEqual fails, with a helpful message, when the two values differ. assertTrue passes for any truthy result, print never fails a test, and <code>=</code> inside assert is a SyntaxError (it needs <code>==</code>).', { src: S('py-programming-7-2-logging-testing-and-exception-handling', 'assertEqual') });
    }]
  ]);

  /* ===== Week 8: why we write programs; NumPy and pandas ===== */
  function fib(n) { let a = 0, b = 1; for (let i = 0; i < n; i++) { const t = a + b; a = b; b = t; } return a; }
  function npArr(v) { const s = v.map(String), w = Math.max.apply(null, s.map(function (x) { return x.length; })); return '[' + s.map(function (x) { return x.padStart(w); }).join(' ') + ']'; }
  P.week('py', 8, 'From silicon to algorithms; NumPy and pandas', { lessons: ['py-why-programs', 'py-numpy-pandas'] }, [
    ['Counting steps', function () {
      const t = R.int(0, 3);
      if (t === 0) { const n = R.pick([7, 15, 31, 100, 1000, 1024, 5000, 1000000]); const k = Math.floor(Math.log2(n)) + 1; return P.num('Binary search on a sorted list of ' + n.toLocaleString('en-GB') + ' items: at most how many comparisons does it need?', k, 0, 'Each comparison halves what is left, so the worst case is ⌊log₂ ' + n + '⌋ + 1 = ' + k + ' comparisons. A linear search could need ' + n.toLocaleString('en-GB') + '.', { src: S('py-week-8a-why-we-write-computer-programs', 'binary') }); }
      if (t === 1) { const n = R.int(5, 60); return P.num('Finding the largest of ' + n + ' marks by keeping the best so far: how many comparisons?', n - 1, 0, 'Compare each element after the first once: n − 1 = ' + (n - 1) + '. The slide adds that no algorithm can do it with fewer.', { src: S('py-week-8a-why-we-write-computer-programs', 'largest') }); }
      if (t === 2) { const n = R.int(4, 15); return P.num('How many calls in total does the plain recursive <code>fib(' + n + ')</code> make (counting the first call)?', 2 * fib(n + 1) - 1, 0, 'calls(n) = 1 + calls(n − 1) + calls(n − 2) with calls(0) = calls(1) = 1, which works out to 2·F(n + 1) − 1 = 2 × ' + fib(n + 1) + ' − 1. For fib(30) the slide quotes 2,692,537 calls: why memoisation matters.', { code: 'def fib(n):\n    if n < 2:\n        return n\n    return fib(n - 1) + fib(n - 2)', src: S('py-week-8a-why-we-write-computer-programs', 'fib') }); }
      const n = R.pick([10, 50, 200, 1000]); return P.num('A linear search through ' + n + ' unsorted items for a value that is not there: how many comparisons?', n, 0, 'It must check every item before it can say “not found”: ' + n + '.');
    }],
    ['CPU, RAM and storage', function () {
      return P.cls([['Holds the running program and its data; loses everything when the power goes off', 'RAM (main memory)', 'RAM is fast, temporary working memory.'],
        ['Repeats fetch → decode → execute on one instruction after another', 'CPU', 'The processor runs machine instructions in that loop.'],
        ['Keeps your files when the computer is switched off', 'Storage (SSD or hard disk)', 'Storage is permanent but much slower than RAM.'],
        ['Is where a program is loaded from before it can run', 'Storage (SSD or hard disk)', 'Programs live on storage and are copied into RAM to run.'],
        ['Does the arithmetic in <code>a + b</code>', 'CPU', 'The arithmetic and logic unit inside the CPU.']], '%s. Which part is this?', ['CPU', 'RAM (main memory)', 'Storage (SSD or hard disk)'], { src: S('py-week-8a-why-we-write-computer-programs', 'RAM') });
    }],
    ['Algorithm design', function () {
      return P.cls([['Merge sort: split the list in half, sort each half, then merge', 'Divide and conquer', 'Split into independent smaller problems and combine.'],
        ['Binary search: compare with the middle and keep only one half', 'Divide and conquer', 'Each step throws away half of the problem.'],
        ['fib(n) that stores each answer in a dictionary the first time it is computed', 'Dynamic programming (memoisation)', 'Overlapping subproblems are solved once and reused.'],
        ['fib(n) = fib(n − 1) + fib(n − 2) with no stored results', 'Plain recursion', 'Correct, but recomputes the same values exponentially often.'],
        ['factorial(n) = n × factorial(n − 1), with factorial(0) = 1', 'Plain recursion', 'One smaller call each time and no repeated work, so no memo is needed.'],
        ['Building a table of the cheapest way to make every amount from 1p to £5', 'Dynamic programming (memoisation)', 'Fill in answers to small cases first and reuse them.']], 'Which strategy is this?<br><b>%s</b>', ['Divide and conquer', 'Dynamic programming (memoisation)', 'Plain recursion'], { src: S('py-week-8a-why-we-write-computer-programs', 'divide') });
    }],
    ['NumPy shapes and axis', function () {
      const r = R.int(2, 4), cc = R.int(2, 5), i = R.int(0, r - 1);
      const sum0 = [], row = []; for (let j = 0; j < cc; j++) { let s = 0; for (let k = 0; k < r; k++) s += k * cc + j; sum0.push(s); row.push(i * cc + j); }
      return P.out('import numpy as np\na = np.arange(' + (r * cc) + ').reshape(' + r + ', ' + cc + ')\nprint(a.shape)\nprint(a.sum(axis=0))\nprint(a[' + i + ', :])', ['(' + r + ', ' + cc + ')', npArr(sum0), npArr(row)],
        'arange(' + r * cc + ') is 0…' + (r * cc - 1) + ', filled row by row into ' + r + ' rows and ' + cc + ' columns. <code>axis=0</code> collapses the rows, giving one total per column (' + cc + ' numbers). <code>a[' + i + ', :]</code> is row ' + i + '.', { norm: 'loose', src: S('py-week-8b-numpy-and-pandas', 'axis') });
    }],
    ['Broadcasting', function () {
      const r = R.int(2, 5), cc = R.int(2, 6);
      const cases = [['(' + r + ', 1) and (1, ' + cc + ')', '(' + r + ', ' + cc + ')', 'Each size-1 axis is stretched to match.'], ['(' + r + ', ' + cc + ') and (' + cc + ',)', '(' + r + ', ' + cc + ')', 'The (' + cc + ',) array is treated as one row and repeated for every row.'],
        ['(' + r + ', ' + cc + ') and (' + r + ', ' + cc + ')', '(' + r + ', ' + cc + ')', 'Same shape: element by element.']];
      if (r !== cc) cases.push(['(' + r + ', ' + cc + ') and (' + r + ',)', 'Error: shapes cannot be broadcast', 'Shapes are compared from the right: ' + cc + ' and ' + r + ' differ and neither is 1. Reshape to (' + r + ', 1) to add a value per row.']);
      const row = R.pick(cases);
      return P.mcq('Arrays with shapes ' + row[0] + ' are added. What is the shape of the result?', row[1], ['(' + r + ', ' + cc + ')', '(' + cc + ', ' + r + ')', 'Error: shapes cannot be broadcast', '(' + (r * cc) + ',)', '(' + r + ', 1)'].filter(function (x) { return x !== row[1]; }).slice(0, 3), row[2], { src: S('py-week-8b-numpy-and-pandas', 'broadcast') });
    }],
    ['pandas DataFrames', function () {
      const mods = ['CP', 'CP', 'DS', 'DS', 'DS'], ms = mods.map(function () { return R.int(45, 90); }), t = R.int(55, 75);
      const cnt = ms.filter(function (m) { return m >= t; }).length, dsMax = Math.max(ms[2], ms[3], ms[4]), mean = ms.reduce(function (a, b) { return a + b; }, 0) / 5;
      const ix = ms.indexOf(Math.max.apply(null, ms));
      return P.out('import pandas as pd\ndf = pd.DataFrame({"Module": ' + py(mods) + ',\n                   "Mark": ' + py(ms) + '})\nprint(df[df["Mark"] >= ' + t + '].shape[0])\nprint(df.groupby("Module")["Mark"].max()["DS"])\nprint(round(df["Mark"].mean(), 1))\nprint(df.loc[df["Mark"].idxmax(), "Module"])',
        [String(cnt), String(dsMax), P.pyNum(Number(mean.toFixed(1))), mods[ix]],
        'Boolean indexing keeps rows with Mark ≥ ' + t + ' (' + cnt + ' rows; shape[0] counts rows). groupby splits by Module and max takes the largest DS mark. The mean of all five marks is ' + mean + '. idxmax gives the row label of the top mark, and loc reads its Module.', { norm: 'loose', src: S('py-week-8b-numpy-and-pandas', 'groupby') });
    }]
  ]);
})();
