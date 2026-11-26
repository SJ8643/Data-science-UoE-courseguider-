from dsl import *

# ---------------------------------------------------------------- 1
lesson('py-start', 'py', 'Programs, algorithms and your first Python', 20,
  'ECM1400 Week 1: Lecture 1 and “What is programming?”',
  ['algorithm', 'program', 'pseudo-code', 'pseudocode', 'flowchart', 'interpreted', 'interpreter', 'high-level', 'dynamically typed', 'general-purpose', 'martini'],
  ['Tell an algorithm apart from a program',
   'Plan a solution as pseudo-code before writing Python',
   'Run Python, read its output and read its error messages',
   'Explain what *interpreted* and *dynamically typed* mean for you'],
  [
    prime('A recipe for making a martini is…', ['a program', 'an algorithm', 'neither: it contains no code', 'a data structure'], 1,
          'An algorithm is a finite list of clear, ordered steps that solves a problem. A recipe is one. A program is an algorithm written in a language a computer can run.'),
    key('''<p><b>Algorithm</b>: a precise, finite sequence of steps that solves a problem. It can be written in English, as a flowchart, or as <b>pseudo-code</b> (structured English that looks a bit like code).</p>
    <p><b>Program</b>: an algorithm written in a programming language, so a computer can carry it out.</p>
    <p><b>Python</b> is a <i>general-purpose</i>, <i>high-level</i> (reads close to English), <i>interpreted</i> (run line by line by the interpreter, no separate compile step) and <i>dynamically typed</i> (a name can refer to any type of value, checked while running) language.</p>'''),
    code('Your first program', '''
        print("Hello, ECM1400")      #: `print` shows a value on screen. Text in quotes is a *string*.
        print(7 * 6)                 #: Python works out `7 * 6` first, then prints 42.
        print("7 * 6")               #: In quotes it is only text, so nothing is calculated.
        print("Total:", 7 * 6)       #: Several values separated by commas print with a space between.
        ''',
        predict=('What does the third line print?', ['42', '7 * 6', '"7 * 6"', 'An error'], 1,
                 'Anything inside quotes is a string: Python prints the characters exactly, without calculating.'),
        investigate=[('Why are the quotes not printed?', 'Quotes mark where a string starts and ends; they are not part of the text itself.'),
                     ('What would `print(7 * "6")` show?', '`6666666`: multiplying a string by a whole number repeats it.')],
        modify=[('Make the last line print `Total: 42 minutes`.', 'Add another comma-separated value.', 'print("Total:", 7 * 6, "minutes")')]),
    text('''<h3>From algorithm to program</h3><p>Plan first, code second. A pseudo-code plan for “turn a number of minutes into hours and minutes”:</p>
    <pre class="fxbox">SET minutes TO 135
SET hours TO whole part of minutes ÷ 60
SET left TO remainder of minutes ÷ 60
DISPLAY hours and left</pre><p>Each pseudo-code line becomes one line of Python. The labels in the code below name each step’s purpose.</p>'''),
    code('Pseudo-code to Python', '''
        ## Input
        minutes = 135                #: Store 135 under the name `minutes` (a variable).
        ## Process
        hours = minutes // 60        #: `//` divides and drops the remainder: 135 // 60 is 2.
        left = minutes % 60          #: `%` (modulo) gives the remainder: 135 % 60 is 15.
        ## Output
        print(hours, "h", left, "min")
        ''',
        predict=('What is printed?', ['2.25 h 0 min', '2 h 15 min', '2 h 25 min', '135 h 60 min'], 1,
                 '135 // 60 = 2 whole hours; 135 % 60 = 15 minutes left over.'),
        modify=[('Change it to convert 1000 minutes.', 'Only the input line changes: that is the point of variables.', '''
                minutes = 1000
                hours = minutes // 60
                left = minutes % 60
                print(hours, "h", left, "min")''')]),
    code('Interpreted and dynamically typed, seen in action', '''
        x = 5                        #: `x` refers to an integer.
        print(x)
        x = "five"                   #: Same name, now a string: Python allows this (dynamic typing).
        print(x)
        print(x + 1)                 #: Text plus a number has no meaning, but Python only finds out when it reaches this line.
        ''', expect_error=True,
        predict=('What happens when you run this?', ['An error before anything prints', '`5`, then `five`, then a TypeError', '`5`, `five`, `five1`', '`5`, `five`, `6`'], 1,
                 'The interpreter runs lines in order, so the first two prints work. The error appears only when line 5 runs.'),
        investigate=[('Is every error reported only when its line is reached?', 'No. A *SyntaxError* (code Python cannot read at all) is caught before anything runs, because Python reads the whole cell first. Errors such as TypeError happen while running.'),
                     ('How would you fix line 5 to print `five1`?', 'Turn the number into text first: `print(x + str(1))`, or simply `print(x + "1")`.')]),
    parsons('Order the minutes-converter', '''
        minutes = int(input("Minutes? "))
        hours = minutes // 60
        left = minutes % 60
        print(hours, "hours and", left, "minutes")''',
        why='Input, then process, then output: a value must exist before a later line can use it.'),
    explain('In your own words: what is the difference between an algorithm and a program?',
            'An algorithm is the method: a finite, ordered, unambiguous list of steps. A program is that method written in a language a computer can run, such as Python. One algorithm can be written as many different programs.'),
    quiz(
      mcq('Python is called *interpreted*. What does that mean for you?', ['You must compile it to machine code before running it', 'The interpreter runs your code statement by statement, so most errors appear when their line is reached', 'It can only run inside a web browser', 'It translates English into code'], 1,
          'No separate compile step: you run the file and the interpreter carries out each statement in turn.'),
      mcq('What does `print("3 + 4")` display?', ['7', '3 + 4', '"3 + 4"', 'Error'], 1, 'Text in quotes is printed exactly as written.'),
      card('What do `//` and `%` do?', '`//` divides and rounds down to a whole number (floor division). `%` gives the remainder. 17 // 5 is 3 and 17 % 5 is 2.'),
      mcq('*Dynamically typed* means…', ['Types never matter', 'A variable can refer to values of different types over time, and types are checked while the program runs', 'You must declare every variable’s type', 'Numbers change type automatically'], 1,
          'Python checks types at run time; the same name can refer to an int and later a string.'),
      card('Pseudo-code is…', 'Structured English for planning an algorithm, written before the real code. No computer runs it; it helps you get the steps right first.'),
      mcq('Which is a property of a good algorithm?', ['It is written in Python', 'Its steps are finite and unambiguous', 'It uses at least one loop', 'It is as short as possible'], 1,
          'An algorithm must finish (finite) and each step must have exactly one meaning (unambiguous).'),
    ),
  ],
  summary='Algorithms vs programs, pseudo-code, and what “interpreted” and “dynamically typed” mean.',
  decks=['py-programming-lecture-1', 'py-week1-l2'])

# ---------------------------------------------------------------- 2
lesson('py-vars', 'py', 'Variables, types and strings', 30,
  'ECM1400 Week 2, lecture 1: Variables',
  ['variable', 'assignment', 'identifier', 'keyword', 'literal', 'expression', 'statement', 'string', 'f-string', 'escape', 'PEP 8', 'namespace', 'type(', 'int', 'float'],
  ['Read `=` as assignment, not equality',
   'Name the four basic types and convert between them',
   'Choose legal, readable variable names',
   'Index, slice, format and transform strings'],
  [
    prime('After `x = 10`, `x = x + 1`, `y = x`, `x = 0`: what is `y`?', ['0', '10', '11', 'Error: x = x + 1 is impossible'], 2,
          '`y = x` makes `y` refer to the value 11. Changing `x` afterwards does not change `y`.'),
    key('''<p>A <b>variable</b> is a name that refers to a value. <code>=</code> is <b>assignment</b>: work out the right-hand side, then make the name on the left refer to the result. That is why <code>x = x + 1</code> is fine in Python even though it is impossible in maths.</p>
    <p>A <b>literal</b> is a value written directly (<code>42</code>, <code>"hi"</code>). An <b>expression</b> combines values into a new one (<code>x + 1</code>). A <b>statement</b> is a complete instruction (<code>x = x + 1</code>).</p>'''),
    code('Assignment step by step', '''
        x = 10                 #: Assignment: make the name `x` refer to 10. Read `=` as “becomes”.
        x = x + 1              #: Right side first: `x + 1` is 11; then `x` becomes 11.
        y = x                  #: `y` now refers to the same value as `x`: 11.
        x = 0                  #: Re-pointing `x` does not affect `y`.
        print(x, y)
        ''',
        predict=('What does `print(x, y)` show?', ['0 0', '0 11', '11 11', '11 0'], 1, 'After `y = x`, `y` is 11. The last assignment changes only `x`.')),
    code('The four basic types', '''
        age = 19                 #: `int`: a whole number.
        height_m = 1.82          #: `float`: a number with a decimal point.
        name = "Ada"             #: `str`: text, in single or double quotes.
        enrolled = True          #: `bool`: only `True` or `False`, with a capital letter.
        print(type(age), type(height_m), type(name), type(enrolled))
        print(age / 2, age // 2)            #: `/` always gives a float (9.5); `//` gives a whole number (9).
        print(int("42") + 1, str(age) + " years", float("2.5") * 2)   #: `int()`, `str()`, `float()` convert between types.
        ''',
        predict=('What does `age / 2` give when age is 19?', ['9', '9.5', '10', '9.0'], 1, 'True division `/` always returns a float, so 19 / 2 is 9.5.'),
        investigate=[('What would `"42" + 1` do?', 'TypeError: you cannot add a string and an int. Convert first: `int("42") + 1`.'),
                     ('What does `int(3.9)` give?', '3. `int()` cuts off the decimal part; it does not round.')]),
    text('''<h3>Naming rules (identifiers)</h3><ul><li>Letters, digits and underscores only; must not start with a digit.</li><li>Case-sensitive: <code>Total</code> and <code>total</code> are different names.</li><li>Cannot be a keyword such as <code>if</code>, <code>for</code>, <code>class</code> or <code>True</code>.</li><li>PEP 8 style: lower case with underscores, <code>exam_mark</code>, and a name that says what it holds.</li></ul>'''),
    bug('Case matters', '''
        Total = 10
        total = total + 5
        print(total)''',
        'Read the error message: which name has Python never seen?',
        '''
        total = 10
        total = total + 5
        print(total)''',
        '`Total` and `total` are different names. Line 2 asks for the value of `total` before anything has been assigned to it, so Python raises NameError.',
        test='assert total == 15'),
    code('Working with strings', '''
        module = "ECM1400 Programming"
        print(len(module))                  #: Number of characters, spaces included: 19.
        print(module[0], module[-1])        #: Positions start at 0; -1 means the last character.
        print(module[:7])                   #: A slice: from the start up to, but not including, position 7.
        print(module.lower())               #: Methods return a NEW string; `module` itself is unchanged.
        print(module.split())               #: Split on spaces into a list of words.
        print(module.replace("Programming", "Python"))
        mark = 68.456
        print(f"{module}: {mark:.1f}%")     #: f-string: values inside `{}`; `:.1f` means one decimal place.
        print("Line one\\nLine two\\ttabbed")  #: Escape sequences: `\\n` new line, `\\t` tab.
        ''',
        predict=('What does `module[:7]` give?', ['ECM1400', 'ECM140', 'ECM1400 (with a space)', 'Programming'], 0,
                 'Positions 0 to 6 are E, C, M, 1, 4, 0, 0. The stop position 7 is not included.'),
        modify=[('Print just the word `Programming` using a slice.', 'It starts at position 8 and runs to the end: leave the stop out.', 'print(module[8:])'),
                ('Print `ecm1400` using a slice and a method together.', 'Methods can follow a slice directly.', 'print(module[:7].lower())')]),
    slip('''<p><code>module.upper()</code> on its own changes nothing. Strings are <b>immutable</b>: methods give back a new string. Keep it with <code>module = module.upper()</code>.</p>'''),
    make('Write code that stores your first name in `first` and your surname in `last`, then builds `initials` like `"A.L."` (first letter of each, upper case, each followed by a full stop).',
         '''
         first = "ada"
         last = "lovelace"
         initials = ""''',
         ['Index 0 gives the first character: `first[0]`.', 'Use `.upper()` and join the pieces with `+`.', '`first[0].upper() + "." + last[0].upper() + "."`'],
         '''
         first = "ada"
         last = "lovelace"
         initials = first[0].upper() + "." + last[0].upper() + "."
         print(initials)''',
         test='assert initials == first[0].upper() + "." + last[0].upper() + "."'),
    quiz(
      mcq('Which is a valid variable name?', ['2nd_mark', 'class', 'exam-mark', '_total'], 3, 'Names cannot start with a digit, cannot be keywords, and cannot contain hyphens. A leading underscore is allowed.'),
      mcq('What is the type of `7 / 7`?', ['int', 'float', 'bool', 'str'], 1, '`/` always gives a float: 1.0.'),
      card('What does `"abc"[-1]` give, and why?', '`"c"`. Negative indices count from the end: -1 is the last character.'),
      mcq('`s = "hello"`, then `s.upper()`. What is `s` now?', ['HELLO', 'hello', 'Hello', 'Error'], 1, 'Strings are immutable; `upper()` returns a new string that was not stored.'),
      card('Write an f-string that prints the float `p` as a percentage with 2 decimals.', '`f"{p:.2f}%"`. Inside the braces, `:.2f` formats to two decimal places.'),
      mcq('What does `x = x + 1` mean in Python?', ['x equals x plus 1, which is false', 'Work out x + 1, then make x refer to the result', 'Compare x with x + 1', 'Define a function x'], 1, 'Assignment evaluates the right side first.'),
    ),
  ],
  summary='Assignment, int/float/str/bool, naming rules, and string slicing, methods and f-strings.',
  decks=['py-week2-l1'])

# ---------------------------------------------------------------- 3
lesson('py-ops', 'py', 'Operators and decisions', 30,
  'ECM1400 Week 2, lecture 2: Operators and conditionals',
  ['operator', 'precedence', 'modulo', 'comparison', 'boolean', 'elif', 'else', 'condition', 'discriminant', 'quadratic', 'roots', 'defensive'],
  ['Predict results using operator precedence',
   'Combine comparisons with `and`, `or` and `not`',
   'Write `if` / `elif` / `else` chains with correct indentation',
   'Program the quadratic formula defensively'],
  [
    prime('What does `-3 ** 2` evaluate to in Python?', ['9', '-9', '-6', 'Error'], 1, '`**` binds tighter than the minus sign, so it is -(3 ** 2) = -9.'),
    key('''<p><b>Precedence</b>, highest first: <code>**</code>, then unary minus, then <code>* / // %</code>, then <code>+ -</code>, then comparisons (<code>== != &lt; &gt; &lt;= &gt;=</code>), then <code>not</code>, <code>and</code>, <code>or</code>. Brackets beat everything, so use them when in doubt.</p>
    <p>A comparison gives a <b>bool</b>. <code>if</code> runs its indented block only when its condition is <code>True</code>.</p>'''),
    code('Precedence', '''
        print(2 + 3 * 4)        #: `*` before `+`: 2 + 12 = 14.
        print((2 + 3) * 4)      #: Brackets first: 5 * 4 = 20.
        print(2 ** 3 ** 2)      #: `**` groups right to left: 3 ** 2 = 9 first, then 2 ** 9 = 512.
        print(-3 ** 2)          #: -(3 ** 2) = -9.
        print(17 // 5, 17 % 5)  #: Floor division and remainder: 3 and 2.
        ''',
        predict=('What does `2 ** 3 ** 2` print?', ['64', '512', '36', '12'], 1, 'Powers are evaluated right to left: 2 ** (3 ** 2) = 2 ** 9 = 512.')),
    code('Comparisons and booleans', '''
        mark = 68
        print(mark >= 70)                    #: A comparison gives a bool: False.
        print(60 <= mark < 70)               #: Chained comparison: True if both parts hold.
        print(mark == 68 and mark != 70)     #: `and`: both sides must be True.
        print(mark < 40 or mark > 90)        #: `or`: at least one side True.
        print(not (mark > 50))               #: `not` flips True and False.
        print(0.1 + 0.2 == 0.3)              #: False! Floats are stored in binary and are slightly off.
        print(abs((0.1 + 0.2) - 0.3) < 1e-9) #: Compare floats with a small tolerance instead.
        ''',
        predict=('What does `0.1 + 0.2 == 0.3` print?', ['True', 'False', '0.3', 'Error'], 1, '0.1 + 0.2 is stored as 0.30000000000000004, so the equality test fails.')),
    slip('''<p><code>if x+1 = 3:</code> is a SyntaxError: a single <code>=</code> assigns, <code>==</code> compares. The line after <code>if …:</code> must also be indented (4 spaces), or Python raises IndentationError.</p>''', yours=True),
    code('A grade classifier with if / elif / else', '''
        mark = 64
        ## Decide the classification
        if mark >= 70:                  #: Conditions are checked top to bottom; the first True one wins.
            result = "First"            #: The indented block runs only when its condition is True.
        elif mark >= 60:                #: `elif` (else if) is checked only if everything above was False.
            result = "2:1"
        elif mark >= 50:
            result = "2:2"
        elif mark >= 40:
            result = "Third"
        else:                           #: `else` catches everything left over.
            result = "Fail"
        ## Report it
        print(mark, "->", result)
        ''',
        predict=('With `mark = 64`, which branches run?', ['Only 2:1', '2:1 and 2:2', 'First', 'Third'], 0, 'The first True condition is `mark >= 60`. After a branch runs, the rest of the chain is skipped.'),
        investigate=[('Why does the `elif mark >= 60` line not need `mark < 70` as well?', 'It is only checked when `mark >= 70` was False, so `mark < 70` is already known.'),
                     ('What changes if every `elif` becomes `if`?', 'Each test runs separately, so 64 would set "2:1", then be overwritten by "2:2" and "Third". The order of independent ifs matters.')],
        modify=[('Test the boundaries: try 70, 69.9 and 40.', 'Edge values are where bugs hide.', '''
                for mark in [70, 69.9, 40]:
                    if mark >= 70:
                        result = "First"
                    elif mark >= 60:
                        result = "2:1"
                    elif mark >= 50:
                        result = "2:2"
                    elif mark >= 40:
                        result = "Third"
                    else:
                        result = "Fail"
                    print(mark, "->", result)''')]),
    code('Quadratic roots, programmed defensively', '''
        import math                      #: The math module gives `math.sqrt`.
        a, b, c = 1, -3, 2               #: The equation x² − 3x + 2 = 0.
        ## Work out the discriminant
        d = b ** 2 - 4 * a * c           #: b² − 4ac decides how many real roots there are.
        ## Branch on its sign
        if d > 0:
            r1 = (-b + math.sqrt(d)) / (2 * a)   #: Divide by (2a) in brackets, not by 2 then times a.
            r2 = (-b - math.sqrt(d)) / (2 * a)
            print("Two roots:", r1, r2)
        elif d == 0:
            print("One root:", -b / (2 * a))
        else:
            print("No real roots")       #: Defensive: `math.sqrt` of a negative number would crash.
        ''',
        predict=('What is printed for x² − 3x + 2 = 0?', ['Two roots: 2.0 1.0', 'One root: 1.5', 'No real roots', 'Two roots: 1 2'], 0, 'd = 9 − 8 = 1, so the roots are (3 ± 1) / 2 = 2.0 and 1.0. `/` always gives floats.'),
        modify=[('Try a, b, c = 1, 2, 5 and then 1, 2, 1.', 'Predict which branch runs before you run it.', '''
                for a, b, c in [(1, 2, 5), (1, 2, 1)]:
                    d = b ** 2 - 4 * a * c
                    if d > 0:
                        print("Two roots:", (-b + math.sqrt(d)) / (2 * a), (-b - math.sqrt(d)) / (2 * a))
                    elif d == 0:
                        print("One root:", -b / (2 * a))
                    else:
                        print("No real roots")''')]),
    bug('Two errors in four lines', '''
        temperature = 25
        if temperature > 20
        print("Warm")''',
        'Python reports the first problem it finds. Fix that, run again, and look for the next.',
        '''
        temperature = 25
        if temperature > 20:
            print("Warm")''',
        'An `if` line must end with a colon, and the block under it must be indented. Python stops at the first error, so fixing code often reveals the next one.'),
    parsons('Odd or even', '''
        n = int(input("Number? "))
        if n % 2 == 0:
            print(n, "is even")
        else:
            print(n, "is odd")''', why='`n % 2` is 0 exactly when n divides by 2. `else` must line up with its `if`.'),
    quiz(
      mcq('What does `2 + 3 * 4 ** 2` give?', ['400', '50', '98', '56'], 1, '4 ** 2 = 16, then 3 × 16 = 48, then 2 + 48 = 50.'),
      mcq('In an if / elif / elif chain, how many branches can run?', ['All whose conditions are True', 'At most one', 'Exactly two', 'Always the last'], 1, 'The first True condition runs its block and the rest of the chain is skipped.'),
      card('Why is `0.1 + 0.2 == 0.3` False, and what should you do instead?', 'Floats are stored in binary, so 0.1 + 0.2 is 0.30000000000000004. Compare with a tolerance: `abs(a - b) < 1e-9`.'),
      mcq('`x = 7`. Which expression is True?', ['x > 5 and x > 10', 'not x > 5', 'x < 5 or x % 7 == 0', 'x == "7"'], 2, '`x % 7 == 0` is True and `or` needs only one True side. `x == "7"` compares an int with a string: False.'),
      card('Write a one-line conditional expression that sets `status` to "pass" if `mark >= 40`, else "fail".', '`status = "pass" if mark >= 40 else "fail"`'),
      mcq('What is wrong with `if mark = 70:`?', ['Nothing', '`=` assigns; comparing needs `==`', 'Marks cannot be compared', 'It needs brackets'], 1, 'Using `=` in a condition is a SyntaxError in Python.'),
    ),
  ],
  summary='Precedence, comparisons, booleans, if/elif/else, and the quadratic formula.',
  decks=['py-week2-l2'])

# ---------------------------------------------------------------- 4
lesson('py-loops', 'py', 'Loops: while, for and range', 30,
  'ECM1400 Week 3, lecture 1: Loops',
  ['while', 'for loop', 'range', 'break', 'continue', 'iteration', 'loop', 'green bottles', 'infinite'],
  ['Trace a `while` loop and spot when it stops',
   'Use `for` with `range(start, stop, step)` and with lists',
   'Use the accumulator pattern',
   'Validate input with `while True`, `break` and `continue`'],
  [
    prime('How many numbers does `range(1, 10, 3)` produce?', ['3', '4', '9', '10'], 0, 'It gives 1, 4, 7. The next value, 10, is not included because the stop value is exclusive.'),
    code('Green bottles: a while loop', '''
        bottles = 3
        while bottles > 0:                                    #: Checked before every pass; when False, the loop ends.
            print(bottles, "green bottles hanging on the wall")
            bottles = bottles - 1                             #: Without this line the condition never turns False: an infinite loop.
        print("No green bottles left")                         #: Not indented: runs once, after the loop.
        ''',
        predict=('How many times does the indented print run?', ['2', '3', '4', 'Forever'], 1, 'It runs for 3, 2 and 1. When bottles reaches 0 the condition is False.'),
        investigate=[('What is the value of `bottles` after the loop?', '0: that is what made the condition False.'),
                     ('What happens if you delete line 4?', 'An infinite loop: `bottles` stays 3 forever. Press Stop if you try it.')]),
    code('for loops, range and the accumulator pattern', '''
        for i in range(5):            #: 0, 1, 2, 3, 4: five numbers, stopping before 5.
            print(i, end=" ")         #: `end=" "` keeps the output on one line.
        print()
        for i in range(2, 11, 2):     #: start 2, stop before 11, step 2.
            print(i, end=" ")
        print()
        total = 0                     #: Accumulator: start from 0…
        for mark in [55, 72, 61, 48]: #: A for loop can walk through a list directly.
            total = total + mark      #: …add each item…
        print("average:", total / 4)  #: …then use the total after the loop.
        ''',
        predict=('What does `range(2, 11, 2)` produce?', ['2 4 6 8 10', '2 4 6 8 10 12', '2 4 6 8', '0 2 4 6 8 10'], 0, 'Start at 2 and step by 2 while the value is below 11.'),
        modify=[('Count down from 10 to 0 with one `range`.', 'A negative step counts down; stop at -1 to include 0.', '''
                for i in range(10, -1, -1):
                    print(i, end=" ")''')]),
    code('Input validation: while True, continue, break', '''
        ## Keep asking until the answer is valid
        while True:                               #: Loop “forever”; `break` is the only way out.
            text = input("Enter a mark 0-100: ")
            if not text.isdigit():                #: `.isdigit()` is True only if every character is 0-9.
                print("  not a whole number, try again")
                continue                          #: Skip the rest of this pass and go back to the top.
            mark = int(text)
            if mark <= 100:
                break                             #: Valid: leave the loop now.
            print("  too big, try again")
        ## Use the value
        print("Accepted:", mark)
        ''', inputs=['sixty', '150', '64'],
        intro='This cell reads three answers from the Inputs box below the code, one per line, as if you typed them.',
        predict=('With the answers sixty, 150, 64, how many times is the prompt shown?', ['1', '2', '3', '4'], 2, 'Once for each answer: sixty fails `isdigit`, 150 is too big, 64 is accepted.')),
    bug('Off by one', '''
        numbers = []
        for i in range(1, 5):      # should give 1 to 5
            numbers.append(i)
        print(numbers)''',
        'What is the last number `range(1, 5)` produces?',
        '''
        numbers = []
        for i in range(1, 6):
            numbers.append(i)
        print(numbers)''',
        'The stop value of `range` is excluded, so to include 5 the stop must be 6. This is the classic off-by-one error.',
        test='assert numbers == [1, 2, 3, 4, 5]'),
    make('Use a `for` loop to compute `total`, the sum of the squares 1² + 2² + … + 10².',
         '''
         total = 0
         # your loop here
         print(total)''',
         ['Loop over `range(1, 11)`.', 'Square with `i ** 2` and add it to `total` inside the loop.'],
         '''
         total = 0
         for i in range(1, 11):
             total += i ** 2
         print(total)''',
         test='assert total == 385'),
    quiz(
      mcq('When is a `while` condition checked?', ['Once, before the loop', 'Before every pass, including the first', 'Only after the last pass', 'After every line inside the loop'], 1, 'If it is False at the start, the body never runs at all.'),
      mcq('What is the difference between `break` and `continue`?', ['None', '`break` leaves the loop; `continue` skips to the next pass', '`continue` leaves the loop; `break` restarts it', 'Both end the program'], 1, '`continue` jumps back to the loop test; `break` exits immediately.'),
      card('Which values does `range(5)` give?', '0, 1, 2, 3, 4. Five values, starting at 0, stopping before 5.'),
      mcq('Which loop fits “keep asking until the password is right”?', ['for i in range(3)', 'while loop', 'Neither', 'A list'], 1, 'Use `while` when you do not know how many repeats you need; use `for` to go through a known sequence.'),
      card('What causes an infinite loop?', 'A `while` condition that never becomes False, usually because nothing in the body changes the variables it tests.'),
      mcq('After `for i in range(3): pass`, what is `i`?', ['0', '2', '3', 'Undefined'], 1, 'The loop variable keeps its last value, which is 2.'),
    ),
  ],
  summary='while loops, for and range, break and continue, and the accumulator pattern.',
  decks=['py-week3-l1'])

# ---------------------------------------------------------------- 5
lesson('py-functions', 'py', 'Functions', 35,
  'ECM1400 Week 3: Functions and “More on functions”',
  ['function', 'def ', 'return', 'argument', 'parameter', 'docstring', 'default', 'keyword argument', 'type hint', 'global', 'local', 'namespace', 'procedure', 'None'],
  ['Define functions with parameters and return values',
   'Explain why `return` is more useful than `print`',
   'Use default and keyword arguments, docstrings and type hints',
   'Predict which variable a name refers to (local or global)'],
  [
    prime('A function only calls `print(w * h)`. What do you get from `a = area(3, 4)`?', ['12', 'None', '"12"', 'An error'], 1, 'It prints 12, but a function without `return` gives back None, so `a` is None.'),
    code('return versus print', '''
        def area_print(w, h):
            print(w * h)          #: Shows the value but hands nothing back.

        def area_return(w, h):
            return w * h          #: Hands the value back to whoever called the function.

        a = area_print(3, 4)      #: Prints 12, but `a` receives None.
        b = area_return(3, 4)     #: Prints nothing; `b` receives 12.
        print("a =", a, "  b =", b)
        ''',
        predict=('What does the last line print?', ['a = 12   b = 12', 'a = None   b = 12', 'a = 12   b = None', 'An error'], 1, '`area_print` has no return statement, so it returns None.'),
        investigate=[('Why prefer `return`?', 'A returned value can be stored, tested, or passed to another function: `area_return(3, 4) * 2` works; `area_print(3, 4) * 2` raises a TypeError.'),
                     ('What is a *procedure* in the lecture’s terms?', 'A function used for its effect (like printing) that returns None.')]),
    code('Docstrings, defaults, keywords and type hints', '''
        def c2f(celsius: float) -> float:         #: Type hints document the expected types; Python does not enforce them.
            """Convert a temperature from Celsius to Fahrenheit."""   #: Docstring: the first line inside says what the function does (PEP 257).
            return celsius * 9 / 5 + 32

        def describe(temp_c, unit="C", decimals=1):   #: `unit` and `decimals` have defaults, so callers may leave them out.
            if unit == "F":
                value = c2f(temp_c)               #: Functions can call other functions.
            else:
                value = temp_c
            return round(value, decimals), unit   #: Returning two values really returns one tuple.

        print(describe(21.456))
        print(describe(21.456, "F"))
        print(describe(21.456, decimals=0, unit="F"))   #: Keyword arguments can come in any order.
        value, unit = describe(100, "F")          #: Unpack the tuple into two names.
        print(value, unit)
        print(c2f.__doc__)
        ''',
        predict=('What does `describe(21.456)` return?', ['21.456', "(21.5, 'C')", "(70.6, 'F')", '21.5'], 1, 'Defaults apply: unit "C", one decimal place, returned as a tuple.'),
        modify=[('Add a parameter `label=False`; when True, return a string like `"70.6 F"` instead of a tuple.', 'Use an `if` before the return and an f-string.', '''
                def describe(temp_c, unit="C", decimals=1, label=False):
                    value = c2f(temp_c) if unit == "F" else temp_c
                    value = round(value, decimals)
                    if label:
                        return f"{value} {unit}"
                    return value, unit

                print(describe(21.456, "F", label=True))''')]),
    code('Local and global names', '''
        count = 0                   #: A global name, created at the top level.

        def bump_local():
            count = 99              #: Assigning inside a function creates a NEW local `count`.
            return count

        def bump_global():
            global count            #: Inside this function, `count` means the global one.
            count = count + 1

        print(bump_local(), count)
        bump_global()
        bump_global()
        print(count)
        ''',
        predict=('What does the first print show?', ['99 99', '99 0', '0 0', 'An error'], 1, 'The 99 lives in the function’s own namespace; the global `count` is still 0.'),
        investigate=[('Why is `global` usually avoided?', 'Functions that change globals are harder to test and reuse. Passing values in and returning results keeps each function self-contained.')]),
    bug('The missing piece', '''
        def average(values):
            total = sum(values)
            total / len(values)

        result = average([60, 70, 80])
        print(result)''',
        'The function calculates the right number. What happens to it?',
        '''
        def average(values):
            total = sum(values)
            return total / len(values)

        result = average([60, 70, 80])
        print(result)''',
        'The division is calculated and then thrown away. Without `return`, the function returns None.',
        test='assert result == 70'),
    make('Write `sum_powers(n, p=2)` that returns 1ᵖ + 2ᵖ + … + nᵖ. (This is one of the Week 4 workshop tasks.)',
         '''
         def sum_powers(n, p=2):
             # your code here
             pass

         print(sum_powers(10), sum_powers(3, 3))''',
         ['Start a total at 0 and loop `for k in range(1, n + 1)`.', 'Add `k ** p` each time and `return` the total after the loop.'],
         '''
         def sum_powers(n, p=2):
             """Return 1**p + 2**p + ... + n**p."""
             total = 0
             for k in range(1, n + 1):
                 total += k ** p
             return total

         print(sum_powers(10), sum_powers(3, 3))''',
         test='assert sum_powers(10) == 385 and sum_powers(3, 3) == 36 and sum_powers(4, 1) == 10'),
    explain('Why is a function that prints its answer harder to reuse than one that returns it?',
            'A printed value goes to the screen and is gone; the caller gets None. A returned value can be stored in a variable, used in further calculations, tested with assert, or passed to another function.'),
    quiz(
      mcq('In `def f(x):` and the call `f(5)`, what are `x` and `5`?', ['Both arguments', '`x` is a parameter; `5` is an argument', '`x` is an argument; `5` is a parameter', 'Both parameters'], 1, 'The parameter is the name in the definition; the argument is the value passed in.'),
      mcq('What does a function return if it has no `return` statement?', ['0', 'An empty string', 'None', 'The last value calculated'], 2, 'Every function returns something; without `return` it is None.'),
      card('What is a docstring, and where does it go?', 'A string literal as the first statement in a function body that says what the function does. `help(f)` and `f.__doc__` show it.'),
      mcq('`def g(a, b=2):` Which call is invalid?', ['g(1)', 'g(1, 3)', 'g(b=3, a=1)', 'g(b=3)'], 3, '`a` has no default, so it must be supplied.'),
      card('What does `x, y = f()` need `f` to return?', 'Two values (a tuple, or any sequence of exactly two items), which are unpacked into `x` and `y`.'),
      mcq('A variable assigned inside a function (without `global`) is…', ['Global', 'Local to that function', 'Shared by all functions', 'Deleted immediately'], 1, 'Each call gets its own namespace for local names.'),
    ),
  ],
  summary='def, return vs print, defaults and keywords, docstrings, type hints and scope.',
  decks=['py-week3-l1', 'py-week3-l2'])

# ---------------------------------------------------------------- 6
lesson('py-collections', 'py', 'Lists, dictionaries and files', 35,
  'ECM1400 Workshops, weeks 4 and 5',
  ['list', 'append', 'index', 'slice', 'dictionary', 'file', 'open(', 'palindrome', 'copy'],
  ['Change lists and avoid the aliasing trap',
   'Store and look up data in dictionaries',
   'Read and write text files with `with open(...)`',
   'Build lists with comprehensions'],
  [
    prime('`a = [1, 2, 3]`, `b = a`, `a.append(4)`. What is `b`?', ['[1, 2, 3]', '[1, 2, 3, 4]', '[4]', 'Error'], 1, '`b = a` does not copy: both names refer to the same list.'),
    code('Two names, one list', '''
        a = [1, 2, 3]
        b = a                 #: `b` is another name for the SAME list.
        c = a.copy()          #: `c` is a new list with the same items.
        a.append(4)           #: Changes the list that both `a` and `b` refer to.
        print("a:", a)
        print("b:", b)
        print("c:", c)
        print(a is b, a is c) #: `is` asks “the very same object?”
        ''',
        predict=('What is `c` at the end?', ['[1, 2, 3]', '[1, 2, 3, 4]', '[]', 'Error'], 0, '`c` was copied before the append, so it keeps the old contents.')),
    code('List operations', '''
        marks = [55, 72, 61, 48]
        marks.append(90)              #: Add to the end.
        marks.insert(0, 40)           #: Insert at position 0; the rest shift right.
        print(marks, len(marks))
        print(marks[1:3], marks[-2:]) #: Positions 1 and 2; the last two items.
        print(sorted(marks), max(marks), sum(marks) / len(marks))   #: `sorted` returns a new list; `marks` keeps its order.
        running, total = [], 0
        for m in marks:               #: Cumulative sums, from the Week 5 workshop.
            total += m
            running.append(total)
        print(running)
        squares = [m * m for m in marks if m >= 50]   #: List comprehension with a filter.
        print(squares)
        ''',
        predict=('After `insert(0, 40)`, what is `marks[1]`?', ['40', '55', '72', '90'], 1, '40 went to position 0, so the old first item, 55, moved to position 1.')),
    code('Dictionaries', '''
        grades = {"ECM1400": 68, "COM1011": 74}     #: A dictionary maps keys to values.
        grades["ECM1407"] = 61                       #: Add a new key (or overwrite an old one).
        print(grades["COM1011"])                     #: Look up by key, not by position.
        print(grades.get("ECM9999", "no mark yet"))  #: `.get` returns a default instead of raising KeyError.
        for module, mark in grades.items():          #: `.items()` gives (key, value) pairs.
            print(f"{module}: {mark}")
        print("COM1011" in grades, len(grades))      #: `in` checks the keys.
        ''',
        investigate=[('What would `grades["ECM9999"]` do?', 'Raise KeyError, because that key does not exist. Use `.get()` or test with `in` first.')]),
    code('Files: the dictionary from your Programming data folder', '''
        with open("words.txt") as f:                  #: `with` opens the file and closes it automatically.
            words = f.read().split()                  #: One word per line, as a list of strings.
        print(len(words), words[:5])
        ## Find long palindromes
        pals = [w for w in words if len(w) >= 7 and w.lower() == w.lower()[::-1]]   #: `[::-1]` reverses a string.
        print(pals)
        ## Count words whose only vowel is e
        count = 0
        for w in words:
            lw = w.lower()
            if "e" in lw and not any(v in lw for v in "aiou"):   #: `any(...)` is True if a, i, o or u appears.
                count += 1
        print(count, "words have e as their only vowel")
        ## Write the palindromes to a new file
        with open("palindromes.txt", "w") as out:     #: Mode "w" creates the file, or overwrites it.
            for p in pals:
                out.write(p + "\\n")
        print(open("palindromes.txt").read().count("\\n"), "lines written")
        ''', files=['words.txt'],
        predict=('Is "Racecar" a palindrome by this code’s test?', ['Yes', 'No: the capital R differs'], 0, 'Both sides are lower-cased first, so the comparison is "racecar" == "racecar".')),
    bug('Your right_justify attempt from the Week 4 workshop', '''
        def right_justify(s):
            spaces = 70 - length(s)
            print('' * spaces + s)

        right_justify("monty")''',
        'There are two bugs. The first raises an error; the second is silent.',
        '''
        def right_justify(s):
            spaces = 70 - len(s)
            print(' ' * spaces + s)

        right_justify("monty")''',
        'Python’s function is `len`, not `length` (NameError). And `\'\' * spaces` repeats an empty string, which is still empty: you need a space character `\' \'` between the quotes.',
        test='''
        import io, contextlib
        buf = io.StringIO()
        with contextlib.redirect_stdout(buf):
            right_justify("monty")
        assert buf.getvalue() == " " * 65 + "monty\\n"''', yours=True),
    make('Write `is_palindrome(word)` that returns True if the word reads the same backwards, ignoring upper and lower case.',
         '''
         def is_palindrome(word):
             # your code here
             pass

         print(is_palindrome("Level"), is_palindrome("python"))''',
         ['Lower-case the word first.', 'Compare it with its reverse, `w[::-1]`, and return the result of the comparison.'],
         '''
         def is_palindrome(word):
             w = word.lower()
             return w == w[::-1]

         print(is_palindrome("Level"), is_palindrome("python"))''',
         test='assert is_palindrome("Level") is True and is_palindrome("python") is False and is_palindrome("a") is True'),
    quiz(
      mcq('How do you make a real copy of list `a`?', ['b = a', 'b = a.copy()', 'b == a', 'copy(a) = b'], 1, '`a.copy()` (or `a[:]` or `list(a)`) creates a new list; `b = a` makes a second name for the same one.'),
      mcq('`d = {"x": 1}`. What does `d.get("y", 0)` return?', ['KeyError', 'None', '0', '"y"'], 2, '`.get` returns the default you give when the key is missing.'),
      card('Why use `with open(...) as f:`?', 'It closes the file automatically when the block ends, even if an error happens inside.'),
      mcq('What does `"stressed"[::-1]` give?', ['stressed', 'desserts', 'detsserts', 'Error'], 1, 'A step of -1 walks backwards through the string.'),
      card('Write a list comprehension of the squares of the even numbers from 0 to 10.', '`[n * n for n in range(11) if n % 2 == 0]` gives [0, 4, 16, 36, 64, 100].'),
      mcq('`marks.sort()` versus `sorted(marks)`?', ['Identical', '`.sort()` changes the list and returns None; `sorted()` returns a new list', '`sorted` changes the list', '`.sort()` returns a new list'], 1, 'A classic slip is `marks = marks.sort()`, which leaves `marks` as None.'),
    ),
  ],
  summary='Lists and aliasing, dictionaries, comprehensions and reading/writing files.')

# ---------------------------------------------------------------- 7
lesson('py-errors', 'py', 'Exceptions, testing and logging', 35,
  'ECM1400 Week 7, lecture 2: Logging, testing and exception handling',
  ['exception', 'try', 'except', 'finally', 'raise', 'assert', 'unit test', 'unittest', 'pytest', 'test-driven', 'TDD', 'logging', 'debug', 'warning', 'critical'],
  ['Handle errors with try / except / else / finally',
   'Raise your own exceptions for bad input',
   'Write assert checks and unittest test cases',
   'Use logging levels instead of scattered prints'],
  [
    prime('In `try / except / else / finally`, which block always runs?', ['try', 'except', 'else', 'finally'], 3, '`finally` runs whether or not an error happened, which makes it the place for clean-up.'),
    code('Catching an error', '''
        def safe_divide(a, b):
            try:
                result = a / b                     #: Code that might fail goes in `try`.
            except ZeroDivisionError:              #: Runs only if that specific error happens.
                print("  can't divide by zero")
                return None
            else:                                  #: Runs only if no error happened.
                return result
            finally:                               #: Always runs, error or not.
                print("  finished dividing", a, "by", b)

        print(safe_divide(10, 4))
        print(safe_divide(1, 0))
        ''',
        predict=('What is the very last line printed?', ['None', 'finished dividing 1 by 0', "can't divide by zero", '2.5'], 0, '`finally` prints before the function finishes returning; then the outer `print` shows the returned None.')),
    code('Raising your own errors', '''
        def set_mark(mark):
            if not isinstance(mark, (int, float)):
                raise TypeError("mark must be a number")          #: `raise` stops the function and reports the problem to the caller.
            if not 0 <= mark <= 100:
                raise ValueError(f"mark {mark} is outside 0-100")
            return mark

        for attempt in [65, 140, "seventy"]:
            try:
                print("stored", set_mark(attempt))
            except (TypeError, ValueError) as err:                 #: Catch either type; `err` holds the message.
                print(type(err).__name__, "->", err)
        ''',
        investigate=[('Why raise an error rather than print a warning and carry on?', 'The caller must deal with bad data. A printed warning is easy to miss, and the program would continue with a wrong value.')]),
    slip('''<p>A bare <code>except:</code> (with no error type) also catches typing mistakes such as NameError, hiding real bugs. Catch the specific errors you expect.</p>'''),
    code('assert and unit tests', '''
        def c2f(c):
            return c * 9 / 5 + 32

        assert c2f(0) == 32          #: Silent when True…
        assert c2f(100) == 212       #: …raises AssertionError when False.

        import unittest

        class TestC2F(unittest.TestCase):                 #: A test case groups related tests.
            def test_freezing(self):
                self.assertEqual(c2f(0), 32)              #: Every method whose name starts with `test_` is one test.
            def test_body_temperature(self):
                self.assertAlmostEqual(c2f(37), 98.6)     #: Allows tiny float rounding errors.
            def test_minus_forty(self):
                self.assertEqual(c2f(-40), -40)

        suite = unittest.TestLoader().loadTestsFromTestCase(TestC2F)
        result = unittest.TextTestRunner(verbosity=2).run(suite)   #: In a .py file you would run `python -m unittest` or `pytest`.
        ''',
        investigate=[('Why `assertAlmostEqual` for 37 °C?', '37 × 9 / 5 + 32 is 98.60000000000001 as a float, so an exact comparison would fail.'),
                     ('What does test-driven development (TDD) add?', 'You write a failing test first, then the code to make it pass, then tidy up. The tests describe what “correct” means before you start.')],
        modify=[('Add a test that fails on purpose, e.g. expecting `c2f(10) == 49`, and read the report.', 'c2f(10) is 50.', '''
                class TestFail(unittest.TestCase):
                    def test_ten(self):
                        self.assertEqual(c2f(10), 49)

                unittest.TextTestRunner(verbosity=2).run(unittest.TestLoader().loadTestsFromTestCase(TestFail))''')]),
    code('Logging levels', '''
        import logging
        logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s", force=True)   #: Show INFO and above.
        log = logging.getLogger("marks")

        def average(marks):
            log.debug("got %d marks", len(marks))      #: DEBUG is below INFO, so it is hidden.
            if not marks:
                log.warning("empty list, returning 0")
                return 0
            avg = sum(marks) / len(marks)
            log.info("average is %.1f", avg)
            return avg

        average([60, 70, 80])
        average([])
        ''',
        predict=('Which messages appear?', ['All three kinds', 'INFO and WARNING only', 'WARNING only', 'None'], 1, 'The level is INFO, so DEBUG messages are filtered out. The order is DEBUG < INFO < WARNING < ERROR < CRITICAL.'),
        modify=[('Change the level to `logging.DEBUG` and run again.', 'Edit the `level=` argument.', '''
                logging.basicConfig(level=logging.DEBUG, format="%(levelname)s: %(message)s", force=True)
                average([60, 70, 80])''')]),
    make('Write `parse_mark(text)` that returns the mark as an int, but raises `ValueError("not a mark")` if `text` is not all digits or the number is above 100.',
         '''
         def parse_mark(text):
             # your code here
             pass

         print(parse_mark("64"))''',
         ['`text.isdigit()` checks that every character is a digit.', 'Convert with `int(text)`, check `<= 100`, and `raise ValueError("not a mark")` otherwise.'],
         '''
         def parse_mark(text):
             if not text.isdigit() or int(text) > 100:
                 raise ValueError("not a mark")
             return int(text)

         print(parse_mark("64"))''',
         test='''
         assert parse_mark("64") == 64
         for bad in ["abc", "101", "-5"]:
             try:
                 parse_mark(bad)
                 raise AssertionError(bad + " should raise ValueError")
             except ValueError:
                 pass'''),
    quiz(
      mcq('When does the `else` block of a try statement run?', ['Always', 'Only if an exception happened', 'Only if no exception happened', 'Never'], 2, '`else` is for code that should run only after `try` succeeds.'),
      mcq('Put the logging levels in order from least to most severe.', ['INFO, DEBUG, WARNING, ERROR, CRITICAL', 'DEBUG, INFO, WARNING, ERROR, CRITICAL', 'DEBUG, WARNING, INFO, CRITICAL, ERROR', 'CRITICAL, ERROR, WARNING, INFO, DEBUG'], 1, 'Setting a level shows that level and everything more severe.'),
      card('What does `raise ValueError("...")` do?', 'Stops the current function immediately and sends a ValueError, with your message, to the caller, which can catch it with `except ValueError`.'),
      mcq('In unittest, which methods are run as tests?', ['All methods', 'Methods whose names start with `test`', 'Methods with docstrings', 'Only `__init__`'], 1, 'The test loader collects methods named `test...`.'),
      card('Test-driven development in three steps?', 'Write a failing test; write just enough code to pass it; refactor (tidy up) while the tests stay green.'),
      mcq('Why prefer logging over print for diagnostics?', ['It is faster to type', 'Messages have levels you can switch on and off without editing the code', 'print is deprecated', 'Logging cannot fail'], 1, 'Change one setting to show debug detail, or hide it in normal runs.'),
    ),
  ],
  summary='try/except/else/finally, raise, assert, unittest, TDD and logging levels.',
  decks=['py-programming-7-2-logging-testing-and-exception-handling'])

# ---------------------------------------------------------------- 8
lesson('py-apis', 'py', 'APIs and JSON', 20,
  'ECM1400 Week 7, lecture 1: APIs',
  ['API', 'JSON', 'XML', 'REST', 'request', 'endpoint', 'query string', 'parse', 'requests'],
  ['Explain what an API is and how a REST request is built',
   'Parse JSON text into Python dictionaries and lists, and back',
   'Navigate nested JSON data',
   'Read the `requests` pattern for calling a web API'],
  [
    prime('A JSON document arrives from a web API. In Python, before you parse it, it is…', ['a dictionary', 'a string', 'a list', 'an object'], 1, 'Over the network, everything is text. `json.loads` turns that text into Python data.'),
    key('''<p>An <b>API</b> (application programming interface) is a defined way for one program to ask another for data or actions. A <b>REST</b> web API is reached with an HTTP request to a URL. Options go in the <b>query string</b>: <code>?</code> starts it and <code>&amp;</code> separates <code>key=value</code> pairs. Replies usually come as <b>JSON</b> (or XML): text that maps neatly onto Python dicts and lists.</p>'''),
    code('Parsing JSON', '''
        import json
        text = '{"city": "Exeter", "temp_c": 11.5, "tags": ["rain", "wind"], "ok": true}'   #: JSON is just a string…
        data = json.loads(text)                  #: …`json.loads` parses it into Python dicts and lists.
        print(type(data), data["city"], data["tags"][0])
        print(data["ok"])                        #: JSON `true` becomes Python True; `null` becomes None.
        back = json.dumps(data, indent=2)        #: `json.dumps` turns Python data back into JSON text.
        print(back)
        ''',
        predict=('What type is `data` after `json.loads`?', ['str', 'dict', 'list', 'json'], 1, 'A JSON object (curly braces) becomes a Python dict.')),
    code('Building a REST request URL', '''
        from urllib.parse import urlencode
        base = "https://api.open-meteo.com/v1/forecast"          #: The endpoint: which resource you want.
        params = {"latitude": 50.72, "longitude": -3.53, "current": "temperature_2m"}   #: Exeter’s coordinates.
        url = base + "?" + urlencode(params)                     #: `?` starts the query string; `&` joins the pairs.
        print(url)
        '''),
    code('Calling the API with requests', '''
        import requests
        response = requests.get(url, timeout=10)    #: Send an HTTP GET request.
        response.raise_for_status()                 #: Raise an error for 4xx/5xx status codes (e.g. 404 Not Found).
        weather = response.json()                   #: Parse the JSON body: same as json.loads(response.text).
        print(weather["current"]["temperature_2m"])
        ''', run=False,
        intro='This page cannot reach the internet, so this cell is for reading. Run it in Jupyter or PyCharm, where `requests` is installed.'),
    code('Navigating a nested reply', '''
        reply = """{"current": {"time": "2026-11-15T12:00", "temperature_2m": 9.8},
                    "hourly": {"time": ["12:00", "13:00", "14:00"], "temperature_2m": [9.8, 10.4, 10.1]}}"""
        weather = json.loads(reply)
        print(weather["current"]["temperature_2m"])               #: Chain keys to go one level deeper each time.
        hours = weather["hourly"]
        for t, temp in zip(hours["time"], hours["temperature_2m"]):   #: `zip` pairs items from two lists.
            print(t, temp)
        print(max(hours["temperature_2m"]))
        ''',
        predict=('What does `weather["hourly"]["time"][1]` give?', ['12:00', '13:00', '10.4', 'KeyError'], 1, 'Index 1 is the second item in the list of times.')),
    quiz(
      mcq('In `https://site/api?city=Exeter&units=metric`, what does `&` do?', ['Ends the URL', 'Separates query parameters', 'Starts the query string', 'Encodes a space'], 1, '`?` starts the query string and `&` separates each key=value pair.'),
      mcq('`json.loads` versus `json.dumps`?', ['Same thing', '`loads` parses JSON text into Python; `dumps` turns Python into JSON text', '`loads` reads a file; `dumps` deletes one', '`dumps` parses; `loads` writes'], 1, 'Memory hook: the s stands for string.'),
      card('What does an HTTP status code of 404 mean?', 'Not Found: the server has no resource at that URL. 200 means OK; 5xx codes are server errors.'),
      mcq('What does JSON `null` become in Python?', ['0', '"null"', 'None', 'False'], 2, 'true/false/null map to True/False/None.'),
      card('Why do web APIs return JSON or XML rather than Python objects?', 'They are language-neutral text formats: any language on any machine can send and parse them.'),
    ),
  ],
  summary='What an API is, REST query strings, and parsing JSON.',
  decks=['py-week-7-1-apis'])

# ---------------------------------------------------------------- 9
lesson('py-why-programs', 'py', 'Why we write programs: from silicon to algorithms', 40,
  'ECM1400 Week 8a lecture (Why we write computer programs) and its companion notebook',
  ['CPU', 'RAM', 'register', 'fetch', 'decode', 'execute', 'bytecode', 'dis', 'assembly', 'machine code', 'abstraction',
   'paradigm', 'imperative', 'object-oriented', 'functional', 'logic', 'declarative', 'SQL', 'algorithm', 'specification',
   'binary search', 'divide and conquer', 'recursion', 'base case', 'dynamic programming', 'memoisation', 'lru_cache', 'Fibonacci', 'prime', 'sieve'],
  ['Describe what the CPU, RAM and storage do, and the fetch–decode–execute loop',
   'Step one rung down the ladder of abstraction with `dis`',
   'Specify an algorithm as problem, input, output and procedure, and count its steps',
   'Compare divide and conquer, recursion and dynamic programming on real code'],
  [
    text('''<p>A program is a precise description of a task that a machine can carry out again and again, without getting tired or bored. The lecture gives four reasons to write one: <b>automate</b> (hand repetitive work to the machine), <b>scale</b> (ten records or ten million, same effort), <b>precision</b> (exactly the same steps every time) and <b>discover</b> (simulate, analyse data, test ideas). It opens the second half of the module: from the silicon up to algorithms, before NumPy and pandas in Week 8b.</p>'''),
    prime('The plain recursive `fib(30)` on the slides makes how many function calls?', ['30', 'about 900', 'about 2.7 million', 'about a billion'], 2,
          'The slide counts 2,692,537 calls, because the same smaller Fibonacci numbers are recomputed again and again. The dynamic-programming loop needs only 30 steps.'),
    key('''<p><b>Inside a computer.</b> The <b>CPU</b> executes instructions: its control unit directs the work, the ALU does arithmetic and logic, and <b>registers</b> are its fastest memory. <b>RAM</b> holds running programs and their data: fast (about 100 ns per access) but volatile. <b>Storage</b> (SSD or disk) keeps files and installed programs: persistent, but about a thousand times slower (about 100 µs per read). Add input and output (keyboard, screen, network). The CPU loops forever: <b>fetch</b> an instruction from RAM, <b>decode</b> it, <b>execute</b> it.</p>
    <table class="tbl"><tr><th>Rung of the ladder</th><th>Example</th><th>For whom</th></tr>
    <tr><td>High-level language</td><td>`total = sum(scores)`</td><td>written and read by people</td></tr>
    <tr><td>Bytecode</td><td>`CALL 1 · STORE_NAME total`</td><td>what Python compiles to</td></tr>
    <tr><td>Assembly</td><td>`add eax, [rbp-8]`</td><td>names for CPU instructions</td></tr>
    <tr><td>Machine code</td><td>`03 45 F8`</td><td>bytes the CPU decodes</td></tr></table>
    <p>The single line `c = a + b` becomes three CPU instructions: load a into the register eax, add b, store the result in c. To the machine, the whole program is just bytes. Compilers and interpreters walk down the ladder for us, so we can think about the problem, not the circuitry.</p>'''),
    code('One rung down: Python bytecode', '''
        import dis
        dis.dis("c = a + b")              #: Load a, load b, add, store into c: the same pattern as the three CPU instructions on the slide.
        dis.dis("total = sum(scores)")    #: Load the function and its argument, CALL it with 1 argument, store the result.
        ''',
        predict=('How many instructions do you expect for the real work of `c = a + b`?', 'Four: LOAD_NAME a, LOAD_NAME b, BINARY_OP +, STORE_NAME c. RESUME and the final return are housekeeping, and the exact names change between Python versions.'),
        investigate=[('Where are the registers in this listing?', 'Nowhere: bytecode is for the Python virtual machine, which keeps values on a stack. The interpreter is itself a compiled program, and its machine code does the real work in CPU registers.'),
                     ('So is Python compiled or interpreted?', 'Both, in two steps: it compiles your source to bytecode, then interprets the bytecode. Compiled versus interpreted is a separate question from which family a language belongs to.')]),
    key('''<table class="tbl"><tr><th>Family</th><th>Core idea</th><th>Examples</th></tr>
    <tr><td>Imperative</td><td>step-by-step commands that change state</td><td>C, Fortran</td></tr>
    <tr><td>Object-oriented</td><td>objects bundle data and behaviour</td><td>Java, C++, Python</td></tr>
    <tr><td>Functional</td><td>compose functions; avoid changing state</td><td>Haskell, Lisp</td></tr>
    <tr><td>Logic</td><td>facts and rules; the system finds answers</td><td>Prolog</td></tr>
    <tr><td>Declarative</td><td>say what you want, not how to get it</td><td>SQL, HTML</td></tr></table>
    <p>Python is <b>multi-paradigm</b>: mostly imperative, with objects and functions along the way.</p>'''),
    code('One task in four styles', '''
        marks = [72, 85, 64, 90]
        ## Imperative: commands that change state
        total = 0
        for m in marks:
            total = total + m              #: The variable `total` changes on every pass.
        print("imperative:", total)
        ## Functional: combine functions, change nothing
        from functools import reduce
        print("functional:", reduce(lambda acc, m: acc + m, marks, 0))   #: `reduce` folds the list with a function; no variable is updated.
        ## Object-oriented: data and behaviour together
        class Module:
            def __init__(self, marks):
                self.marks = marks         #: The object keeps its own data…
            def total(self):
                return sum(self.marks)     #: …and the behaviour that works on it.
        print("object-oriented:", Module(marks).total())
        ## Declarative: say what you want, in SQL
        import sqlite3
        db = sqlite3.connect(":memory:")   #: A throwaway database in memory.
        db.execute("CREATE TABLE results (mark INTEGER)")
        db.executemany("INSERT INTO results VALUES (?)", [(m,) for m in marks])
        print("declarative:", db.execute("SELECT SUM(mark) FROM results").fetchone()[0])   #: You never say how to add them up.
        ''',
        predict=('Which style never updates a variable after creating it?', ['imperative', 'functional', 'object-oriented', 'all four update variables'], 1,
                 'The functional version passes each partial total on to the next function call instead of changing `total` in place.')),
    key('''<p>An <b>algorithm</b> is a finite, unambiguous procedure that turns an input into an output, solving a problem.</p>
    <table class="tbl"><tr><th></th><th>Finding the largest mark</th></tr>
    <tr><td>Problem</td><td>what the output must satisfy, for every valid input: the largest value in a list</td></tr>
    <tr><td>Input</td><td>a non-empty list of n numbers</td></tr>
    <tr><td>Output</td><td>a value ≥ every element</td></tr>
    <tr><td>Procedure</td><td>keep the best so far; compare each element once</td></tr></table>
    <p>Two questions to ask of any algorithm: is it correct, and how many steps does it take?</p>'''),
    code('Finding the largest mark, and counting the work', '''
        def largest_traced(marks):
            best = marks[0]                       #: Start with the first element as the best so far.
            comparisons = 0
            for m in marks[1:]:                   #: Every other element is compared exactly once.
                comparisons += 1
                if m > best:
                    best = m
                print(f"saw {m:>3} -> best = {best}")
            print(f"{comparisons} comparisons for {len(marks)} elements")
            return best

        largest_traced([72, 85, 64, 90])
        ''',
        predict=('How many comparisons for a list of 4 marks?', ['3', '4', '6', '16'], 0,
                 'n − 1: the first element starts as the best and each of the other three is compared once. The slide adds that no algorithm can do it with fewer.'),
        investigate=[('What does `largest_traced([])` do?', 'It crashes with IndexError at `marks[0]`. The specification says the input must be non-empty; to accept empty lists you would change both the specification and the code, for example by raising ValueError.')],
        modify=[('Make an empty list raise `ValueError("empty list")` instead of IndexError.', 'Check `if not marks:` before touching `marks[0]`.', '''
                def largest(marks):
                    if not marks:
                        raise ValueError("empty list")
                    best = marks[0]
                    for m in marks[1:]:
                        if m > best:
                            best = m
                    return best

                print(largest([72, 85, 64, 90]))
                try:
                    largest([])
                except ValueError as e:
                    print("ValueError:", e)''')]),
    code('Divide and conquer: binary search', '''
        def binary_search(items, target):
            """Return the index of target in the sorted list items, or -1."""
            lo, hi = 0, len(items) - 1
            steps = 0
            while lo <= hi:
                steps += 1
                mid = (lo + hi) // 2              #: Look at the middle element.
                if items[mid] == target:
                    print(f"found after {steps} steps")
                    return mid
                elif items[mid] < target:
                    lo = mid + 1                  #: Throw away the left half.
                else:
                    hi = mid - 1                  #: Throw away the right half.
            print(f"not found after {steps} steps")
            return -1

        million = list(range(0, 2_000_000, 2))    #: A million sorted even numbers.
        print(binary_search(million, 1_234_568))
        ''',
        predict=('A million sorted numbers. At most how many steps can binary search need?', ['about 20', 'about 1,000', 'about 500,000', '1,000,000'], 0,
                 'Each step halves the part still to search, and 2²⁰ ≈ 1,000,000, so about 20 halvings leave a single element.'),
        investigate=[('Why must the list be sorted?', 'Throwing away half is only safe if everything left of the middle is smaller and everything right of it is larger.')],
        modify=[('Search for an odd number, which is not in the list. How many steps now?', 'Try `binary_search(million, 1_234_567)`.', 'print(binary_search(million, 1_234_567))')]),
    code('Recursion, and why plain recursive Fibonacci explodes', '''
        def factorial(n):
            if n == 0:                            #: Base case: stops the recursion.
                return 1
            return n * factorial(n - 1)           #: Recursive case: a smaller input each time.
        print([factorial(n) for n in range(6)])

        calls = 0
        def fib_rec(n):
            global calls
            calls += 1
            if n < 2:
                return n
            return fib_rec(n - 1) + fib_rec(n - 2)   #: Two recursive calls that repeat each other's work.

        def fib_dp(n):
            a, b = 0, 1
            for _ in range(n):
                a, b = b, a + b                   #: Each Fibonacci number is computed once, from the previous two.
            return a

        for n in [10, 20, 25]:
            calls = 0
            print(f"fib({n}) = {fib_rec(n):,}: {calls:,} recursive calls, {n} loop steps")
        ## Count the calls for fib(30) without making them
        c = [1, 1]                                #: fib(0) and fib(1) each make one call.
        for n in range(2, 31):
            c.append(c[n - 1] + c[n - 2] + 1)     #: calls(n) = calls(n − 1) + calls(n − 2) + 1
        print(f"fib(30) would make {c[30]:,} calls; fib_dp(30) = {fib_dp(30):,}")
        ''',
        predict=('`fib_rec(25)` makes 242,785 calls. Roughly how many will `fib_rec(26)` make?', ['242,786', 'about 300,000', 'about 390,000', 'about 485,000'], 2,
                 'calls(26) = calls(25) + calls(24) + 1 = 242,785 + 150,049 + 1 = 392,835. The count grows by a factor of about 1.6 for each extra n.'),
        investigate=[('Why does the number of calls follow almost the same rule as the Fibonacci numbers?', 'fib_rec(n) makes one call for itself plus all the calls of fib_rec(n − 1) and fib_rec(n − 2). In fact calls(n) = 2 × fib(n + 1) − 1.'),
                     ('The last loop is itself dynamic programming. Why?', 'It works out each calls(n) once, from the two stored answers before it, instead of recomputing them.')],
        modify=[('Keep the recursive code but remember the answers: decorate it with `@lru_cache(maxsize=None)` from `functools`, then compute `fib(200)`.', 'This is memoisation, the middle way in the notebook.', '''
                from functools import lru_cache

                @lru_cache(maxsize=None)
                def fib_memo(n):
                    if n < 2:
                        return n
                    return fib_memo(n - 1) + fib_memo(n - 2)

                print(fib_memo(30), fib_memo(200))''')]),
    parsons('Fibonacci by dynamic programming', '''
        def fib(n):
            a, b = 0, 1
            for _ in range(n):
                a, b = b, a + b
            return a''', why='Start from the first two numbers, slide the pair along n times, then return a. Each subproblem is solved once, so fib(30) takes 30 steps.'),
    bug('A base case that is never reached', '''
        def factorial(n):
            if n == 1:
                return 1
            return n * factorial(n - 1)

        print(factorial(5))
        print(factorial(0))''',
        'Trace `factorial(0)`: does any call ever reach the base case?',
        '''
        def factorial(n):
            if n == 0:
                return 1
            return n * factorial(n - 1)

        print(factorial(5))
        print(factorial(0))''',
        'From 0, n goes to −1, −2, … and never equals 1, so the calls never stop and Python raises RecursionError. A base case must be reachable from every valid input; since 0! = 1, test for `n == 0`.',
        test='assert factorial(0) == 1 and factorial(5) == 120'),
    make('Write <code>primes_up_to(n)</code> that returns every prime p with 2 ≤ p ≤ n, in increasing order, and <code>[]</code> if n &lt; 2. Use plain Python only: loops, <code>if</code> and lists. (This is the exercise at the end of the Week 8a notebook, with its tests.)',
         '''
         def primes_up_to(n):
             # your code here
             return []

         print(primes_up_to(30))''',
         ['Write a helper `is_prime(k)`: does any d from 2 to k − 1 divide k? (`k % d == 0` means d divides k.)',
          'Loop over every candidate from 2 to n and keep those that pass.',
          'Faster: if k has a divisor bigger than √k, it also has one smaller than √k, so you can stop at `int(k ** 0.5)`.'],
         '''
         def primes_up_to(n):
             def is_prime(k):
                 for d in range(2, int(k ** 0.5) + 1):
                     if k % d == 0:
                         return False
                 return True
             return [k for k in range(2, n + 1) if is_prime(k)]

         print(primes_up_to(30))''',
         test='''
         tests = [(-5, []), (0, []), (1, []), (2, [2]), (3, [2, 3]), (10, [2, 3, 5, 7]),
                  (13, [2, 3, 5, 7, 11, 13]), (30, [2, 3, 5, 7, 11, 13, 17, 19, 23, 29])]
         for n, expected in tests:
             assert primes_up_to(n) == expected, f"primes_up_to({n}) returned {primes_up_to(n)}, expected {expected}"
         assert len(primes_up_to(1000)) == 168 and primes_up_to(1000)[-1] == 997'''),
    explain('Why does the dynamic-programming Fibonacci need only n steps when the plain recursive one needs millions of calls?',
            'The recursive version solves the same subproblems again and again: inside fib(30), fib(28) is computed twice, fib(27) three times, fib(26) five times, and so on, so the work grows like the Fibonacci numbers themselves (about ×1.6 per step). Dynamic programming solves each subproblem once, from the bottom up, keeping only the last two answers. Memoisation gets the same saving by caching the results of the recursive calls.'),
    quiz(
      mcq('Which memory is fastest?', ['RAM', 'an SSD', 'CPU registers', 'a hard disk'], 2, 'Registers sit inside the CPU. RAM takes about 100 ns per access; an SSD about 100 µs per read.'),
      mcq('Python first turns your source code into…', ['machine code for the CPU', 'bytecode for the Python virtual machine', 'assembly', 'C'], 1, 'Then the interpreter runs the bytecode, which `dis` shows.'),
      mcq('SQL and HTML belong to which family?', ['imperative', 'functional', 'logic', 'declarative'], 3, 'You say what you want, not how to get it.'),
      card('The four parts of an algorithm specification?', 'Problem (what the output must satisfy for every valid input), input, output and procedure.'),
      mcq('Binary search needs the list to be…', ['short', 'sorted', 'made of integers', 'free of duplicates'], 1, 'Halving is only safe when the order tells you which half to throw away.'),
      card('What must every recursive function have?', 'A base case that stops it, reachable from every valid input, and recursive calls on smaller inputs.'),
      card('Dynamic programming in one sentence?', 'Solve each overlapping subproblem once and store its answer instead of recomputing it.'),
      mcq('Fetch, decode, execute describes…', ['how Python imports modules', 'the CPU’s endless instruction loop', 'how files are saved', 'what a compiler does'], 1, 'The CPU fetches an instruction from RAM, decodes it and executes it, forever.'),
    ),
  ],
  summary='The machine, the ladder of abstraction, language families, algorithm specifications and three design strategies.',
  decks=['py-week-8a-why-we-write-computer-programs'])

# ---------------------------------------------------------------- 10
lesson('py-numpy-pandas', 'py', 'NumPy arrays and pandas DataFrames', 45,
  'ECM1400 Week 8b lecture (NumPy and Pandas)',
  ['NumPy', 'ndarray', 'array', 'vectorised', 'vectorized', 'dtype', 'shape', 'ndim', 'reshape', 'resize', 'arange', 'linspace',
   'zeros', 'concatenate', 'boolean indexing', 'fancy indexing', 'axis', 'argsort', 'argmax', 'where', 'broadcasting', 'matrix product',
   'pandas', 'Series', 'DataFrame', 'iloc', 'loc', 'isnull', 'isna', 'fillna', 'dropna', 'merge', 'join', 'concat', 'read_csv', 'info',
   'describe', 'groupby', 'sort_values'],
  ['Explain why NumPy arrays beat lists for numbers: memory, speed and vectorised code',
   'Create, reshape and index arrays, and use `axis`',
   'Predict broadcasting results from the shapes',
   'Select, clean, combine and group pandas DataFrames'],
  [
    text('''<p>Week 8a previewed two lines: `a * 1.1` on a NumPy array and `df[df["score"] > 70]` on a pandas DataFrame. This lecture explains them. <b>NumPy</b> (Numerical Python) gives fast, typed arrays and matrices, with maths that works on a whole array without loops. <b>pandas</b> gives labelled tables for real-world data: mixed types, missing values, merging and grouping. The Machine learning track has its own NumPy and pandas lesson; this one follows the Programming slides.</p>'''),
    prime('`scores` has shape (2, 3) and `bonus` has shape (3,). What is the shape of `scores + bonus`?', ['(3,)', '(2, 3)', 'an error: the shapes differ', '(2, 3, 3)'], 1,
          'Broadcasting compares shapes from the right: 3 matches 3, and the missing first dimension is stretched, so the bonus is added to each row.'),
    code('Why arrays: memory and speed', '''
        import numpy as np, sys, time
        list_data = list(range(1000))
        array_data = np.arange(1000, dtype=np.int64)
        pointers = sys.getsizeof(list_data)                  #: The list object itself holds only pointers…
        ints = sum(sys.getsizeof(x) for x in list_data)      #: …to separate int objects of about 28 bytes each.
        print("Python list:", pointers + ints, "bytes")
        print("NumPy array:", array_data.nbytes, "bytes")    #: Raw 8-byte numbers, side by side.
        ## Speed: add 1 to a million numbers
        big_list = list(range(1_000_000))
        big_array = np.arange(1_000_000)
        t0 = time.perf_counter()
        list_result = [x + 1 for x in big_list]              #: A Python loop: the interpreter handles every element.
        t1 = time.perf_counter()
        array_result = big_array + 1                         #: One vectorised operation: the loop runs in compiled C.
        t2 = time.perf_counter()
        print(f"list {t1 - t0:.4f} s, array {t2 - t1:.4f} s: about {(t1 - t0) / max(t2 - t1, 1e-9):.0f} times faster")
        ''',
        predict=('Roughly how many times more memory does the list use?', ['about the same', 'about 4 times', 'about 100 times', 'about 1,000 times'], 1,
                 'About 36,000 bytes against 8,000: each element costs a pointer plus a whole int object, while the array stores raw 8-byte numbers.'),
        investigate=[('Why does `sys.getsizeof(list_data)` on its own understate the list?', 'It counts only the list’s own array of pointers, not the int objects they point to. The slide makes the same point.'),
                     ('Your timing differs from the slide’s “about 56 times”. Why?', 'Speed depends on the machine, the Python version and the size of the data, and byte counts depend on the Python build. The direction of the result does not change.')]),
    code('Vectorised maths, types and shapes', '''
        a = np.array([1, 2, 3, 4])
        b = np.array([10, 20, 30, 40])
        print(a + b, a * b, b - a)                   #: Element by element, no loop.
        A = np.array([[1, 2], [3, 4]])
        B = np.array([[5, 6], [7, 8]])
        print(A * B)                                 #: `*` is element by element, even for 2D arrays…
        print(A @ B)                                 #: …while `@` (or `np.dot`) is the matrix product.
        print(np.array([1, 2, 3]).dtype, np.array([1.0, 2.5]).dtype, np.array([True, False]).dtype)
        print(np.array([1, 2.5, 3]))                 #: One type per array: the ints become floats.
        m = np.array([[1, 2, 3], [4, 5, 6]])
        print(m.shape, m.ndim, m.size)               #: (rows, columns), number of dimensions, number of elements.
        ''',
        predict=('What is the top-left entry of `A @ B`?', ['5', '12', '19', '26'], 2,
                 'Row 0 of A times column 0 of B: 1×5 + 2×7 = 19. Element by element, `A * B` gives 5 there.')),
    code('Creating and reshaping arrays', '''
        print(np.zeros(3), np.ones((2, 3)))
        print(np.arange(0, 10, 2), np.linspace(0, 1, 5))    #: arange works like range; linspace gives 5 evenly spaced values.
        print(np.concatenate([np.ones(2), np.zeros(2)]))
        arr = np.array([1, 2, 3, 4, 5, 6])
        print(arr.reshape(2, 3))                            #: The same six values in a new shape: 2 × 3 must equal 6.
        print(np.resize(arr, (3, 3)))                       #: np.resize repeats the data to fill nine places.
        try:
            arr.reshape(4, 2)
        except ValueError as e:
            print("reshape(4, 2) fails:", e)
        ''',
        predict=('What is the last row of `np.resize(arr, (3, 3))`?', ['[7 8 9]', '[1 2 3]', '[0 0 0]', 'an error'], 1,
                 'np.resize repeats the six values from the start: 1 to 6, then 1, 2, 3.')),
    code('Four kinds of indexing, and axis', '''
        a = np.array([[1, 2, 3],
                      [4, 5, 6]])
        print(a[1, 2])              #: Basic: row 1, column 2.
        print(a[:, 1])              #: Slicing: every row, column 1.
        print(a[a > 2])             #: Boolean: a True/False mask picks the values.
        print(a[0, [0, 2]])         #: Fancy: a list of positions.
        print(a.sum(), a.sum(axis=0), a.sum(axis=1))    #: axis=0 runs down the columns; axis=1 runs across the rows.
        values = np.array([10, 50, 30, 20, 40])
        print(np.where(values > 25)[0], np.argmax(values), np.argsort(values))   #: Positions, not values.
        ''',
        predict=('What does `a.sum(axis=0)` give?', ['21', '[ 6 15]', '[5 7 9]', '[1 4]'], 2, 'axis=0 collapses the rows: 1 + 4, 2 + 5 and 3 + 6.'),
        investigate=[('What is `np.argsort` good for?', 'It gives the order that would sort an array, so you can sort one array by another: `names[np.argsort(values)]`.')],
        modify=[('Print these names in order of value, highest first.', 'Reverse the argsort order with `[::-1]`, then use it as a fancy index.', '''
                names = np.array(["Ana", "Ben", "Cleo", "Dev", "Eve"])
                print(names[np.argsort(values)[::-1]])''')]),
    code('Broadcasting', '''
        scores = np.array([[60, 70, 80],
                           [50, 65, 90]])      #: shape (2, 3): two students, three assessments
        bonus = np.array([5, 0, 10])           #: shape (3,): one bonus per assessment
        print(scores + bonus)                  #: The bonus row is added to each student's row.
        print(scores * 1.1)                    #: A single number broadcasts everywhere.
        print(scores - scores.mean(axis=0))    #: Centre each column on its mean.
        ''',
        investigate=[('Why would `scores + np.array([1, 2])` fail?', 'Shapes are compared from the right: 3 and 2 are neither equal nor 1. A column of shape (2, 1) would work, giving one bonus per student.')],
        modify=[('Give student 0 a bonus of 2 and student 1 a bonus of 3 on every assessment.', 'Use a column: `np.array([[2], [3]])` has shape (2, 1).', '''
                print(scores + np.array([[2], [3]]))''')]),
    key('''<p>In pandas, a <b>Series</b> is a one-dimensional labelled array (one spreadsheet column) and a <b>DataFrame</b> is a two-dimensional labelled table whose columns can each hold a different type.</p>
    <table class="tbl"><tr><th>Task</th><th>Tool</th></tr>
    <tr><td>Select by position</td><td>`df.iloc[1:3]`: rows 1 and 2, the end is excluded</td></tr>
    <tr><td>Select by label</td><td>`df.loc[0:2, ["Name", "Score"]]`: rows 0 to 2, the end is included</td></tr>
    <tr><td>Filter</td><td>`df[df["Age"] > 25]`</td></tr>
    <tr><td>Missing data</td><td>find with `isnull()` (the same as `isna()`); drop, fill or interpolate; assign the result back</td></tr>
    <tr><td>Combine</td><td>`pd.merge` on common columns; `join` on the index (inner, outer, left or right); `pd.concat` stacks rows or columns</td></tr>
    <tr><td>Explore and summarise</td><td>`read_csv`, `head`, `info`, `describe`, `groupby`, `sort_values`</td></tr></table>'''),
    code('Selecting rows: iloc, loc and filters', '''
        import pandas as pd
        df = pd.DataFrame({"Name": ["Alice", "Bob", "Charlie", "David"],
                           "Age": [24, 27, 22, 32],
                           "Score": [88, 79, 93, 85]})
        print(df["Age"].tolist())                  #: One column, as a plain list.
        print(df.iloc[1:3])                        #: By position: rows 1 and 2; the end is excluded.
        print(df.loc[0:2, ["Name", "Score"]])      #: By label: rows 0, 1 and 2; the end is included.
        print(df[df["Age"] > 25])                  #: A boolean mask, exactly as in NumPy.
        ''',
        predict=('How many rows does `df.loc[0:2]` return?', ['2', '3', '4', '1'], 1, 'loc slices by label and includes the end label: rows 0, 1 and 2.')),
    code('Missing data, from a CSV file', '''
        csv_text = """Name,Age,Score
        Alice,24,88
        Bob,27,79
        Charlie,,93
        David,32,
        ,29,85
        """
        with open("sample_data.csv", "w") as f:    #: Recreate the lecture's sample_data.csv: empty fields are missing values.
            f.write(csv_text)
        df = pd.read_csv("sample_data.csv")
        print(df)
        df.info()                                  #: Prints its own summary and returns None, so no print() around it.
        print(df.isnull().sum())                   #: Missing values in each column.
        print(df.describe().round(2))              #: Count, mean, spread and quartiles of the numeric columns.
        means = df.select_dtypes(include="number").mean()
        print(df.fillna(means).dropna())           #: Fill the numbers with column means, then drop the row with no name.
        ''',
        predict=('Charlie’s age is missing. What does `fillna(means)` put there?', ['0', '27', '28.0', 'NaN'], 2, 'The mean of the four known ages (24, 27, 32 and 29) is 28.'),
        investigate=[('Why does the last row disappear?', 'Its Name is missing, and a text column has no mean to fill it with, so the NaN survives `fillna` and `dropna` removes the row.')]),
    slip('''<p>A classic slip: `df.fillna(0)` or `df.dropna()` on a line of its own changes nothing. These methods return a new DataFrame, so assign the result back: `df = df.dropna()`, or `df["Age"] = df["Age"].fillna(df["Age"].mean())`.</p>'''),
    code('Combining tables: merge, join and concat', '''
        df1 = pd.DataFrame({"ID": [1, 2, 3], "Name": ["Alice", "Bob", "Charlie"]})
        df2 = pd.DataFrame({"ID": [3, 4, 5], "Score": [85, 90, 95]})
        print(pd.merge(df1, df2, on="ID", how="inner"))          #: Only IDs found in both tables survive.
        left = pd.DataFrame({"Name": ["Alice", "Bob", "Charlie"], "Age": [24, 27, 22]})
        right = pd.DataFrame({"Name": ["Alice", "Bob", "David"],
                              "City": ["New York", "LA", "Chicago"]}).set_index("Name")
        print(left.join(right, on="Name", how="left"))           #: Keep every row of `left`; Charlie has no city, so NaN.
        df3 = pd.DataFrame({"ID": [6, 7], "Name": ["Eve", "Frank"]})
        print(pd.concat([df1, df3], axis=0, ignore_index=True))  #: Stack the rows and renumber them.
        ''',
        predict=('How many rows does the inner merge produce?', ['0', '1', '3', '6'], 1, 'Only ID 3 appears in both tables.'),
        modify=[('Change the merge to `how="outer"`. How many rows now?', 'Outer keeps the IDs from either table and fills the gaps with NaN.', '''
                print(pd.merge(df1, df2, on="ID", how="outer"))''')]),
    code('Grouping and sorting', '''
        marks = pd.DataFrame({"Module": ["CP", "CP", "DS", "DS", "DS"],
                              "Student": ["Ana", "Ben", "Ana", "Cleo", "Dev"],
                              "Mark": [68, 74, 81, 59, 77]})
        print(marks.groupby("Module")["Mark"].mean().round(1))       #: Split by module, average each group, combine.
        print(marks.groupby("Module")["Mark"].agg(["count", "max"]))
        print(marks.sort_values("Mark", ascending=False).head(2))   #: The two highest marks.
        ''',
        predict=('What is the DS mean?', ['72.3', '71.0', '77.0', '81.0'], 0, '(81 + 59 + 77) ÷ 3 = 72.3.')),
    bug('The filled values vanish', '''
        import numpy as np, pandas as pd
        ages = pd.DataFrame({"Age": [24, np.nan, 22, 32]})
        ages.fillna(ages["Age"].mean())
        print(ages["Age"].isnull().sum(), "missing")''',
        'Does `fillna` change `ages`, or hand something back?',
        '''
        import numpy as np, pandas as pd
        ages = pd.DataFrame({"Age": [24, np.nan, 22, 32]})
        ages = ages.fillna(ages["Age"].mean())
        print(ages["Age"].isnull().sum(), "missing")''',
        '`fillna` returns a new DataFrame and leaves the original unchanged, so the filled copy was thrown away. Assign it back, as the slide says.',
        test='assert ages["Age"].isnull().sum() == 0 and ages["Age"][1] == 26.0'),
    make('Write <code>normalise(a)</code> that min–max scales an array so that each column runs from 0 to 1: (x − min) ÷ (max − min). Use NumPy with <code>axis=0</code> and broadcasting, not a loop, so that it works for 1D and 2D arrays.',
         '''
         def normalise(a):
             return a

         print(normalise(np.array([10.0, 20.0, 30.0])))''',
         ['`a.min(axis=0)` gives the minimum of each column (or of the whole array, if it is 1D).', 'Subtract the minimum, then divide by `a.max(axis=0) - a.min(axis=0)`: broadcasting does the rest.'],
         '''
         def normalise(a):
             lo, hi = a.min(axis=0), a.max(axis=0)
             return (a - lo) / (hi - lo)

         print(normalise(np.array([10.0, 20.0, 30.0])))''',
         test='''
         assert np.allclose(normalise(np.array([10.0, 20.0, 30.0])), [0, 0.5, 1])
         assert np.allclose(normalise(np.array([[1.0, 50.0], [3.0, 100.0], [2.0, 75.0]])), [[0, 0], [1, 1], [0.5, 0.5]])'''),
    quiz(
      mcq('Which gives the matrix product of 2D arrays A and B?', ['`A * B`', '`A @ B`', '`A + B`', '`A ** B`'], 1, '`*` multiplies element by element; `@` (or `np.dot`) is the matrix product.'),
      mcq('`np.array([1, 2.5, 3])` has dtype…', ['int64', 'float64', 'object', 'a mixture'], 1, 'All elements of an array share one type, so the ints are converted.'),
      mcq('Which pair of shapes broadcasts together?', ['(2, 3) and (2,)', '(2, 3) and (3,)', '(4, 2) and (3,)', '(2, 3) and (3, 2)'], 1, 'Compare from the right: sizes must be equal or 1.'),
      card('iloc vs loc?', 'iloc selects by position and excludes the end of a slice; loc selects by label and includes the end.'),
      card('Four kinds of NumPy indexing?', 'Basic (integer positions), slicing (the colon), boolean (a True/False mask) and fancy (a list of positions).'),
      mcq('What does `np.argsort(np.array([10, 50, 30]))` return?', ['[10 30 50]', '[0 2 1]', '[1 2 0]', '[2 1 0]'], 1, 'The positions in sorted order: 10 is at 0, 30 at 2 and 50 at 1.'),
      card('merge vs join vs concat?', '`merge` combines tables on common columns; `join` does database-style joins on the index; `concat` stacks tables along rows (axis=0) or side by side (axis=1).'),
      mcq('After `df.dropna()` on a line of its own, `df`…', ['has no missing values', 'is unchanged', 'is empty', 'raises an error'], 1, 'The method returns a new DataFrame; assign it back to keep it.'),
    ),
  ],
  summary='Why NumPy is fast, creating and indexing arrays, axis and broadcasting, then pandas selection, cleaning, merging and grouping.',
  decks=['py-week-8b-numpy-and-pandas'])
