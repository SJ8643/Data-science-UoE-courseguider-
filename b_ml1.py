import os, csv
from dsl import *

_rows = list(csv.DictReader(open(os.path.join(os.path.dirname(__file__), '..', 'datafiles', 'week01_development.csv'))))
_W1 = [[int(r['distance_km']), int(r['late'])] for r in _rows]

# ---------------------------------------------------------------- 1
lesson('ml-intro', 'ml', 'What machine learning is: your first predictor', 30,
  'COM1011 Week 1: Introduction lecture and Workshop 1, “Build your first predictor”',
  ['machine learning', 'algorithm', 'learning', 'data', 'predict', 'feature', 'label', 'categorical', 'numerical', 'ordinal', 'nominal', 'baseline', 'accuracy'],
  ['Say what makes a program “learn”',
   'Describe a dataset in terms of rows, features, a target, and data types',
   'Build a one-rule predictor and measure its accuracy',
   'Compare any model with a baseline before trusting it'],
  [
    prime('Only 9 of 30 parcels arrived late. What accuracy does “always predict on time” score?', ['0.30', '0.50', '0.70', '0.90'], 2, 'It is right for the 21 on-time parcels: 21 / 30 = 0.70. Any real model has to beat this baseline.'),
    key('''<p>The lecture’s definition, after Herbert Simon: a system <b>learns</b> when experience changes it so it does the same task, or similar tasks, better next time. In machine learning, the experience is <b>data</b>.</p>
    <p>Each <b>row</b> is one example (a parcel). <b>Features</b> are the inputs (distance, priority). The <b>target</b> or <b>label</b> is what we predict (late or not). Data can be <b>numerical</b> (continuous like 40.5 km, or discrete like a count) or <b>categorical</b> (nominal like express/standard, or ordinal like low/medium/high).</p>'''),
    code('Load and look at the data first', '''
        import pandas as pd
        df = pd.read_csv("week01_development.csv")     #: The parcel-delivery data from your Week 1 workshop.
        print(df.shape)                                 #: (rows, columns)
        df.head()                                       #: The first five rows. `late` is 1 if the parcel arrived late.
        ''', files=['week01_development.csv'],
        predict=('How many rows and columns does this file have?', ['(30, 5)', '(5, 30)', '(30, 4)', '(29, 5)'], 0, '30 parcels, each described by 5 columns. Shape is always (rows, columns).'),
        investigate=[('Which columns are numerical and which categorical?', '`distance_km` and `actual_delivery_days` are numerical; `priority` is categorical (nominal). `late` is a 0/1 label; `order_id` is an identifier, not a feature.')]),
    code('A model can be a single rule', '''
        def predict_late(distance_km, threshold=150):   #: “Long trips arrive late.”
            return 1 if distance_km > threshold else 0

        ## Predict every row
        df["predicted"] = df["distance_km"].apply(predict_late)   #: Apply the rule to each distance.
        ## Score the rule
        accuracy = (df["predicted"] == df["late"]).mean()          #: True counts as 1 and False as 0, so the mean is the fraction correct.
        baseline = max(df["late"].mean(), 1 - df["late"].mean())   #: Always guessing the most common answer.
        print(f"rule accuracy {accuracy:.3f}   baseline {baseline:.3f}")
        ''',
        investigate=[('Is the 150 km rule any better than the baseline here?', 'No: both score 0.700. A rule that only ties the baseline has not learned anything useful yet. The next cell searches for a better threshold.'),
                     ('Why can a high accuracy still be bad news?', 'If 95% of parcels are on time, “always on time” scores 95% while finding no late parcels at all. Always compare against the baseline.')]),
    viz('threshold', 'Move the threshold and watch accuracy change', data=_W1, start=150),
    code('“Learning” the threshold from data', '''
        results = []
        for t in range(0, 251, 10):                                     #: Try thresholds 0, 10, …, 250 km.
            preds = (df["distance_km"] > t).astype(int)                 #: The rule applied to every row at once.
            results.append(((preds == df["late"]).mean(), t))
        best_acc, best_t = max(results)                                 #: Tuples compare by their first item: highest accuracy wins.
        print("best threshold:", best_t, "km   accuracy:", round(best_acc, 3))
        ''',
        predict=('Choosing the threshold from the data is a tiny act of learning. What is the catch in scoring it on the same 30 rows?', 'The threshold was picked to suit these 30 parcels, so its accuracy here is optimistic. A fair score needs new parcels it never saw: that is what the train/test split lesson is about.'),
        modify=[('Try a finer search with steps of 5 km. Does the best accuracy change?', 'Change the range step.', '''
                results = [(((df["distance_km"] > t).astype(int) == df["late"]).mean(), t) for t in range(0, 251, 5)]
                print(max(results))''')]),
    code('Check the data before trusting it', '''
        print(df.isna().sum().sum(), "missing values")
        print(df["priority"].value_counts())                     #: How many of each category.
        print(df.groupby("priority")["late"].mean().round(2))    #: Late rate for each priority.
        df[(df["distance_km"] >= 180) & (df["actual_delivery_days"] <= 1)]   #: Suspicious rows: very long trips delivered in a day.
        ''',
        investigate=[('Why look for rows like these?', 'Errors in data (a typo, a wrong unit) become errors in the model. The workshop asked you to check the data for exactly this reason.')]),
    quiz(
      mcq('What makes a program a machine-learning system rather than a hand-written rule?', ['It uses Python', 'Its behaviour is adjusted using data so it performs better', 'It has more than one if statement', 'It runs on a GPU'], 1, 'Picking the threshold by searching the data is already a small example of learning.'),
      card('What is a baseline, and why compute one?', 'The score of a trivial strategy, such as always predicting the majority class. A model is only useful if it beats it.'),
      mcq('“Priority: low / medium / high” is…', ['numerical, continuous', 'categorical, nominal', 'categorical, ordinal', 'numerical, discrete'], 2, 'Categories with a natural order are ordinal.'),
      mcq('Accuracy is…', ['(correct predictions) / (all predictions)', 'correct − wrong', 'TP / (TP + FP)', 'the error squared'], 0, 'The fraction of predictions that were right.'),
      card('Why is a threshold chosen on the same data you score it on too optimistic?', 'It was tuned to fit those rows. On new data it will usually score lower, so you need held-out test data.'),
      mcq('In `df.shape == (30, 5)`, what is 30?', ['columns', 'rows', 'features', 'missing values'], 1, 'Shape is (rows, columns).'),
    ),
  ],
  summary='What learning from data means, features and labels, a one-rule predictor, accuracy and baselines.',
  decks=['ml-com1011-l01-introduction'])

# ---------------------------------------------------------------- 2
lesson('ml-numpy-pandas', 'ml', 'NumPy and pandas essentials', 35,
  'COM1011 Workshop 2: Pandas and NumPy',
  ['numpy', 'pandas', 'array', 'dataframe', 'series', 'column', 'shape', 'axis', 'mean', 'groupby', 'csv'],
  ['Create NumPy arrays and calculate with them without loops',
   'Read shape and axis correctly',
   'Load, filter and summarise a DataFrame',
   'Find and fill missing values'],
  [
    prime('`X` has shape (2, 3). What does `X.mean(axis=0)` return?', ['2 numbers, one per row', '3 numbers, one per column', 'one number', 'an error'], 1, '`axis=0` runs down the rows, collapsing them: one mean per column.'),
    slip('''<p>The library is <code>pandas</code>, with an s, and the convention is <code>import pandas as pd</code> and <code>import numpy as np</code>. Arrays come from <code>np.array</code>, not <code>pd</code>. NumPy prints arrays without commas: <code>[110 205]</code>, which is easy to misread as one number.</p>''', yours=True),
    code('Arrays: maths on every element at once', '''
        import numpy as np
        prices = np.array([110, 205, 150, 98])       #: A NumPy array: one data type, fast maths on all elements.
        print(prices)                                #: Printed with spaces, no commas.
        print(prices * 1.2)                          #: Vectorised: multiplies every element; no loop needed.
        print(prices.shape, prices.dtype)            #: Shape (4,): four elements in one dimension.
        print(prices.mean(), prices.std(), prices.max())
        cheap = prices < 120                         #: A comparison gives a boolean array: a mask.
        print(cheap, prices[cheap])                  #: Indexing with the mask keeps the True positions.
        ''',
        predict=('What does `prices[prices < 120]` give?', ['[True False False True]', '[110  98]', '[205 150]', '2'], 1, 'The mask is True for 110 and 98, so only those elements are kept.')),
    code('Two dimensions: rows, columns and axis', '''
        X = np.array([[1, 2, 3],
                      [4, 5, 6]])            #: 2 rows, 3 columns.
        print(X.shape)                       #: (2, 3): rows first.
        print(X[1, 2], X[:, 0], X[0])        #: Row 1, column 2; every row of column 0; all of row 0.
        print(X.mean(axis=0))                #: Down the rows: one mean per column.
        print(X.mean(axis=1))                #: Across the columns: one mean per row.
        print(X.reshape(3, 2))               #: The same 6 numbers in a new shape (your coursework reshapes 784 pixels to 28×28).
        ''',
        predict=('What is `X.mean(axis=1)`?', ['[2. 5.]', '[2.5 3.5 4.5]', '3.5', '[1 4]'], 0, 'Across each row: (1+2+3)/3 = 2 and (4+5+6)/3 = 5.')),
    code('pandas: tables with named columns', '''
        import pandas as pd
        cars = pd.read_csv("cars_dataset.csv")       #: Week 3 workshop data: weight, horsepower and mpg for 93 cars.
        print(cars.shape)
        print(cars.describe().round(1))              #: Count, mean, std, min, quartiles and max for every numeric column.
        heavy = cars[cars["weight"] > 3500]          #: Filter rows with a boolean mask, just like NumPy.
        print(len(heavy), "heavy cars; mean mpg", round(heavy["mpg"].mean(), 1))
        cars["kw"] = cars["horsepower"] * 0.7457     #: A new column calculated from an existing one.
        cars[["weight", "kw", "mpg"]].head(3)        #: A list of column names gives a smaller DataFrame.
        ''', files=['cars_dataset.csv'],
        investigate=[('What is the difference between `cars["mpg"]` and `cars[["mpg"]]`?', 'Single brackets give a Series (one column). Double brackets pass a list of names and give a DataFrame, which is what scikit-learn wants for X.')]),
    code('Groups and missing values', '''
        cars["size"] = pd.cut(cars["weight"], bins=[0, 2500, 3500, 5000], labels=["light", "medium", "heavy"])   #: Turn numbers into categories.
        print(cars.groupby("size", observed=True)["mpg"].agg(["count", "mean"]).round(1))   #: Split by category, then summarise each group.
        messy = pd.DataFrame({"x": [1.0, None, 3.0], "y": ["a", "b", None]})
        print(messy.isna().sum())                    #: Count missing values per column.
        print(messy["x"].fillna(messy["x"].mean()))  #: Fill gaps with the column mean, as in coursework Q1.3.
        '''),
    make('Using `cars`, store in `best` the highest mpg among cars with more than 150 horsepower.',
         '''
         best = None
         print(best)''',
         ['Filter first: `cars[cars["horsepower"] > 150]`.', 'Then take the `"mpg"` column and call `.max()`.'],
         '''
         best = cars[cars["horsepower"] > 150]["mpg"].max()
         print(best)''',
         test='assert best == cars.loc[cars["horsepower"] > 150, "mpg"].max()'),
    quiz(
      mcq('Why are NumPy operations like `prices * 1.2` preferred to a Python loop?', ['They give different answers', 'They are vectorised: shorter code that runs much faster', 'Loops do not work on numbers', 'They use less precision'], 1, 'The loop happens inside NumPy’s compiled code.'),
      card('Array shape (100, 784): what are the two numbers?', '100 rows (examples) and 784 columns (features, e.g. pixels). Rows come first.'),
      mcq('Which gives a DataFrame with only the `mpg` column?', ['cars["mpg"]', 'cars[["mpg"]]', 'cars.mpg()', 'cars("mpg")'], 1, 'A list of names inside the brackets returns a DataFrame.'),
      mcq('How should you count missing values in each column?', ['df == None', 'df.isna().sum()', 'len(df)', 'df.count() == 0'], 1, '`isna()` marks each missing cell True; `.sum()` counts them per column.'),
      card('What does `df.groupby("size")["mpg"].mean()` do?', 'Splits the rows by `size`, then works out the mean mpg in each group.'),
      mcq('`X.shape == (2, 3)`. What is the shape of `X.mean(axis=0)`?', ['(2,)', '(3,)', '(2, 3)', '()'], 1, 'Collapsing the 2 rows leaves one value for each of the 3 columns.'),
    ),
  ],
  summary='Arrays, vectorised maths, shape and axis, DataFrames, filtering, groupby and missing values.',
  decks=['ml-com1011-machine-learning-study-guide'])

# ---------------------------------------------------------------- 3
lesson('ml-dataviz', 'ml', 'Look at the data before modelling', 25,
  'COM1011 Week 2: “Before ML: data visualisation”',
  ['visualisation', 'visualization', 'scatter', 'histogram', 'plot', 'model', 'simplification', 'classifier', 'decision boundary', 'generalisation', 'supervised', 'unsupervised', 'correlation'],
  ['Choose a histogram, scatter plot or bar chart for a question',
   'Explain why summary statistics can hide what a plot shows',
   'Describe a classifier and its decision boundary',
   'Tell supervised from unsupervised learning'],
  [
    prime('Four datasets have the same means, variances and correlation (0.82). Do they look alike when plotted?', ['Yes, the statistics guarantee it', 'Not necessarily'], 1, 'Anscombe’s quartet, below, has identical summaries and four completely different shapes.'),
    key('''<p>A <b>model</b> is an intentional simplification of reality: it keeps what matters for the task and drops the rest. Before choosing one, plot the data: shape, outliers and relationships decide which simplification is reasonable.</p>
    <p><b>Supervised</b> learning learns from examples with known answers (labels): regression for numbers, classification for categories. <b>Unsupervised</b> learning finds structure without labels, for example clusters.</p>'''),
    code('Distributions and relationships', '''
        import pandas as pd
        import matplotlib.pyplot as plt
        cars = pd.read_csv("cars_dataset.csv")
        fig, axes = plt.subplots(1, 2, figsize=(10, 3.6))      #: One figure holding two plots side by side.
        axes[0].hist(cars["mpg"], bins=12)                     #: Histogram: how one variable is spread.
        axes[0].set(title="Distribution of mpg", xlabel="mpg", ylabel="number of cars")
        axes[1].scatter(cars["weight"], cars["mpg"], s=18)     #: Scatter plot: how two variables relate.
        axes[1].set(title="Heavier cars use more fuel", xlabel="weight (lb)", ylabel="mpg")
        plt.show()                                             #: Draws the figure (in Jupyter too).
        ''', files=['cars_dataset.csv'],
        investigate=[('Is the weight–mpg relationship a straight line?', 'Roughly, but it bends: mpg falls fast for light cars and more slowly for heavy ones. That matters when you choose a linear model.')]),
    code('Anscombe’s quartet: same numbers, different stories', '''
        import numpy as np
        x = [10, 8, 13, 9, 11, 14, 6, 4, 12, 7, 5]
        sets = {"I":   (x, [8.04, 6.95, 7.58, 8.81, 8.33, 9.96, 7.24, 4.26, 10.84, 4.82, 5.68]),
                "II":  (x, [9.14, 8.14, 8.74, 8.77, 9.26, 8.10, 6.13, 3.10, 9.13, 7.26, 4.74]),
                "III": (x, [7.46, 6.77, 12.74, 7.11, 7.81, 8.84, 6.08, 5.39, 8.15, 6.42, 5.73]),
                "IV":  ([8, 8, 8, 8, 8, 8, 8, 19, 8, 8, 8], [6.58, 5.76, 7.71, 8.84, 8.47, 7.04, 5.25, 12.50, 5.56, 7.91, 6.89])}
        fig, axes = plt.subplots(1, 4, figsize=(13, 3), sharey=True)
        for ax, (name, (xs, ys)) in zip(axes, sets.items()):
            r = np.corrcoef(xs, ys)[0, 1]                      #: Pearson correlation of this dataset.
            ax.scatter(xs, ys, s=20)
            ax.set_title(f"{name}: mean y {np.mean(ys):.2f}, r {r:.2f}")
        plt.show()
        ''',
        predict=('Which dataset is the line-fitting “typical case”?', 'Only I looks like a noisy straight line. II is a curve, III is a perfect line with one outlier, and IV is a vertical stack plus one extreme point that creates the whole correlation.')),
    code('A classifier draws a boundary', '''
        marks = pd.read_csv("marks.csv")                        #: Week 4 workshop data: two module marks and whether the student was admitted.
        ## Try boundaries of the form Module 1 + Module 2 >= k
        best = max((((marks["Module 1"] + marks["Module 2"] >= k) == marks["Admitted"]).mean(), k) for k in range(120, 200))
        print("best k:", best[1], " accuracy:", round(best[0], 3))
        ## Plot the classes and the boundary line
        colours = marks["Admitted"].map({0: "#4dd8ff", 1: "#ff6fa3"})
        plt.scatter(marks["Module 1"], marks["Module 2"], c=colours, s=10, alpha=0.7)
        xs = np.array([68, 100])
        plt.plot(xs, best[1] - xs, color="#ffb454", label="decision boundary")   #: The line where Module 1 + Module 2 = k.
        plt.xlabel("Module 1"); plt.ylabel("Module 2"); plt.legend(); plt.show()
        ''', files=['marks.csv'],
        investigate=[('What is a decision boundary?', 'The line (or surface) where the classifier switches from predicting one class to the other.'),
                     ('Is this “supervised” learning?', 'Yes: the Admitted labels were used to choose k.')]),
    quiz(
      mcq('Which plot shows the distribution of one numeric variable?', ['Scatter plot', 'Histogram', 'Line plot of time', 'Pie chart'], 1, 'A histogram counts how many values fall into each bin.'),
      mcq('Grouping customers into similar types without any labels is…', ['supervised classification', 'regression', 'unsupervised learning (clustering)', 'a decision boundary'], 2, 'No target labels means unsupervised.'),
      card('What lesson does Anscombe’s quartet teach?', 'Identical summary statistics (means, variances, correlation) can come from very different data. Always plot before modelling.'),
      card('What does “a model is an intentional simplification” mean?', 'A model deliberately ignores detail so it can capture the pattern that matters for the task, and so it generalises to new cases.'),
      mcq('Generalisation means…', ['memorising the training data', 'performing well on new, unseen data', 'using more features', 'drawing a curved boundary'], 1, 'The goal of learning is good predictions on cases the model has not seen.'),
    ),
  ],
  summary='Histograms and scatter plots, Anscombe’s quartet, decision boundaries, supervised vs unsupervised.',
  decks=['ml-com1011-l03-before-ml-dataviz'])

# ---------------------------------------------------------------- 4
lesson('ml-trees', 'ml', 'Decision trees and preprocessing', 40,
  'COM1011 Week 2: Decision trees and preprocessing',
  ['decision tree', 'gini', 'entropy', 'information gain', 'impurity', 'split', 'node', 'leaf', 'preprocessing', 'standardis', 'normalis', 'cleaning', 'integration', 'transformation', 'log'],
  ['Calculate Gini impurity and entropy for a node',
   'Compare splits with information gain',
   'Train and read a scikit-learn decision tree',
   'Choose between standardising, normalising and log-scaling'],
  [
    prime('A node holds 10 cats and 0 dogs. Its Gini impurity is…', ['1', '0.5', '0', '10'], 2, 'A pure node has impurity 0. Fifty–fifty is the most impure for two classes: Gini 0.5.'),
    fx('p<sub>k</sub> = (number of points of class k) / N\nGini   G = 1 − Σ p<sub>k</sub>²\nEntropy H = − Σ p<sub>k</sub> log₂ p<sub>k</sub>\nInformation gain = H(parent) − Σ (N<sub>child</sub> / N) · H(child)', 'The formulas from the lecture. Lower impurity is better; higher information gain is better.'),
    code('Impurity by hand', '''
        import numpy as np
        def gini(counts):
            p = np.array(counts) / sum(counts)     #: Counts to proportions p_k.
            return 1 - np.sum(p ** 2)              #: G = 1 − Σ p_k²

        def entropy(counts):
            p = np.array(counts) / sum(counts)
            p = p[p > 0]                           #: Skip empty classes: 0 × log 0 counts as 0.
            return -np.sum(p * np.log2(p))         #: H = −Σ p_k log₂ p_k

        for c in [(5, 5), (9, 1), (10, 0)]:
            print(c, " gini", round(gini(c), 3), "  entropy", round(entropy(c), 3))
        ''',
        predict=('What is the entropy of a 50/50 node?', ['0', '0.5', '1', '2'], 2, 'For two classes, the maximum entropy is 1 bit, at p = 0.5 each.')),
    code('Which split is better?', '''
        def info_gain(parent, children):
            n = sum(parent)
            weighted = sum(sum(ch) / n * entropy(ch) for ch in children)   #: Each child’s entropy, weighted by its share of the points.
            return entropy(parent) - weighted

        print("split A:", round(info_gain((10, 10), [(9, 3), (1, 7)]), 3))   #: 12 points left, 8 right: the lecture’s first example.
        print("split B:", round(info_gain((10, 10), [(9, 1), (1, 9)]), 3))   #: 10 and 10.
        ''',
        predict=('Which split has the higher information gain?', ['A', 'B', 'They are equal'], 1, 'B’s children are purer (9:1 each), so entropy drops more. The lecture gets 0.295 and 0.531; small differences come from rounding the child entropies.')),
    viz('gini', 'Send points left or right and watch the impurity'),
    slip('''<p>Gini and entropy usually choose the same or very similar splits. Neither is “more accurate” in general; Gini is a little cheaper to compute because it needs no logarithm. Information gain is the drop in entropy, not a separate kind of impurity.</p>''', yours=True),
    code('A decision tree in scikit-learn', '''
        import pandas as pd
        from sklearn.tree import DecisionTreeClassifier, export_text
        from sklearn.model_selection import train_test_split
        marks = pd.read_csv("marks.csv")
        X = marks[["Module 1", "Module 2", "Work Experience"]]
        y = marks["Admitted"]
        ## Split, fit, evaluate
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=0)
        tree = DecisionTreeClassifier(criterion="gini", max_depth=3, random_state=0)   #: Same settings as the lecture slide.
        tree.fit(X_train, y_train)                    #: Greedy: at each node, choose the split that lowers impurity most.
        print("test accuracy:", tree.score(X_test, y_test))
        print(export_text(tree, feature_names=list(X.columns)))   #: The learned rules as text.
        ''', files=['marks.csv'],
        investigate=[('Why limit `max_depth`?', 'An unlimited tree keeps splitting until every leaf is pure, memorising the training data (overfitting).'),
                     ('Do trees need scaled features?', 'No. Each split compares one feature with a threshold, so the units do not matter.')],
        modify=[('Change `max_depth` to 1, then to None. Compare test accuracy.', 'Depth 1 is a single split (a “stump”).', '''
                for d in [1, 3, None]:
                    t = DecisionTreeClassifier(max_depth=d, random_state=0).fit(X_train, y_train)
                    print(d, round(t.score(X_train, y_train), 3), round(t.score(X_test, y_test), 3))''')]),
    text('''<h3>Preprocessing</h3><p>The lecture’s four steps: <b>integration</b> (combine sources), <b>cleaning</b> (missing values, errors, duplicates), <b>transformation</b> (rescale or reshape features) and <b>visualisation</b> (check the result).</p>'''),
    fx('Standardise: x′ = (x − μ) / σ        → mean 0, standard deviation 1\nNormalise:   x′ = (x − min) / (max − min) → range [0, 1]\nLog-scale:   x′ = log x                → shrinks long right tails'),
    code('Three transformations, one outlier', '''
        x = np.array([1300, 7554, 9478, 11602, 215245], dtype=float)   #: Lot areas from the Ames data: one huge plot of land.
        standard = (x - x.mean()) / x.std()           #: Standardise.
        minmax = (x - x.min()) / (x.max() - x.min())  #: Normalise (min–max).
        logged = np.log(x)                            #: Log scale.
        for name, v in [("standardised", standard), ("min-max", minmax), ("log", logged)]:
            print(f"{name:>13}:", np.round(v, 3))
        ''',
        predict=('After min–max scaling, where do the four ordinary lots end up?', ['Spread evenly between 0 and 1', 'All squashed near 0', 'All near 1', 'Negative'], 1, 'The outlier becomes 1 and stretches the range, so everything else lands close to 0. A log scale keeps them distinguishable.')),
    quiz(
      mcq('Gini for a node with proportions (0.9, 0.1)?', ['0.10', '0.18', '0.50', '0.90'], 1, '1 − (0.81 + 0.01) = 0.18, as on the slide.'),
      mcq('A tree picks the split with…', ['the highest impurity', 'the largest information gain (largest impurity drop)', 'the most children', 'random choice'], 1, 'Greedy: at each node, the best immediate improvement.'),
      card('Information gain formula?', 'IG = H(parent) − Σ (N_child / N) × H(child): parent entropy minus the size-weighted entropy of the children.'),
      mcq('Which transformation gives every feature mean 0 and standard deviation 1?', ['Normalisation', 'Standardisation', 'Log-scaling', 'One-hot encoding'], 1, 'Subtract the mean, divide by the standard deviation.'),
      card('Why can an unlimited-depth tree overfit?', 'It keeps splitting until every leaf is pure, so it memorises noise in the training data and generalises badly.'),
      mcq('Which preprocessing step deals with missing values?', ['Integration', 'Cleaning', 'Transformation', 'Visualisation'], 1, 'Cleaning fixes missing, wrong or duplicated data.'),
    ),
  ],
  summary='Gini, entropy and information gain; sklearn trees; standardise, normalise, log.',
  decks=['ml-com1011-l04-decisiontrees-preprocessing'])

# ---------------------------------------------------------------- 5
lesson('ml-linreg', 'ml', 'Linear regression, loss and gradient descent', 40,
  'COM1011 Week 3: Linear regression lecture and workshop',
  ['linear regression', 'regression', 'loss', 'cost function', 'error', 'L1', 'L2', 'norm', 'gradient descent', 'grid search', 'random', 'slope', 'intercept', 'fit', 'quadratic', 'sigmoid'],
  ['Explain a model as an assumption about the shape of the data',
   'Measure fit with L1 and L2 errors (the loss)',
   'Find parameters by grid search and by gradient descent',
   'Fit and read `LinearRegression` in scikit-learn'],
  [
    prime('Gradient descent changes the parameters in which direction?', ['Up the slope of the loss', 'Down the slope of the loss', 'At random', 'Towards zero'], 1, 'It steps opposite the gradient, downhill, so the loss gets smaller.'),
    key('''<p>Every model starts from an assumption about shape: a line <code>y = ax + b</code>, a quadratic <code>y = ax² + bx + c</code>, or a sigmoid <code>y = a / (1 + e^(b − x))</code>. <b>Fitting</b> means choosing the parameters (a, b, …) that make the errors small. The function that scores the errors is the <b>loss</b> (or cost) function.</p>'''),
    fx('error for point i:  e<sub>i</sub> = y<sub>pred,i</sub> − y<sub>data,i</sub>\nL1 error = Σ |e<sub>i</sub>|          L2 error = √( Σ e<sub>i</sub>² )\nSSE (sum of squared errors) = Σ e<sub>i</sub>²', 'L2 squares each error, so one big miss costs much more than several small ones.'),
    slip('''<p>SSE stands for <b>sum of squared errors</b>: square each residual, then add them up. It is not a sum of square roots.</p>''', yours=True),
    code('Score candidate lines by hand', '''
        import numpy as np, pandas as pd
        cars = pd.read_csv("cars_dataset.csv")
        x = cars["weight"].to_numpy() / 1000      #: Weight in thousands of lb keeps the numbers small.
        y = cars["mpg"].to_numpy()

        def errors(a, b):
            pred = a * x + b                      #: The model: a straight line.
            e = pred - y                          #: One error (residual) per car.
            return np.sum(np.abs(e)), np.sqrt(np.sum(e ** 2))   #: L1 and L2, as defined on the slides.

        for a, b in [(-5, 40), (-8, 47), (-10, 52)]:
            l1, l2 = errors(a, b)
            print(f"a={a:>4} b={b}:  L1={l1:7.1f}  L2={l2:6.1f}")
        ''', files=['cars_dataset.csv'],
        predict=('Which line do you expect to fit best?', 'Run it and compare: the line with the smallest L2 error fits best by that measure. The middle one, a = −8, b = 47, wins here.')),
    code('Grid search: try every combination', '''
        best = None
        for a in np.arange(-15, 0, 0.25):                 #: A grid of slopes…
            for b in np.arange(20, 70, 0.5):              #: …times a grid of intercepts.
                l2 = errors(a, b)[1]
                if best is None or l2 < best[0]:
                    best = (l2, a, b)                     #: Keep the smallest error so far.
        print("grid best: a=%.2f  b=%.2f  L2=%.2f" % (best[1], best[2], best[0]))
        print("combinations tried:", len(np.arange(-15, 0, 0.25)) * len(np.arange(20, 70, 0.5)))
        ''',
        investigate=[('Why does grid search not scale to many parameters?', 'The number of combinations multiplies: 60 values each for 10 parameters is 60¹⁰ evaluations. Random search and gradient descent avoid this.')]),
    code('Gradient descent: walk downhill', '''
        a, b = 0.0, 0.0
        lr = 0.01                                          #: Learning rate: the size of each step.
        for step in range(5001):
            e = (a * x + b) - y
            grad_a = 2 * np.mean(e * x)                    #: Slope of the mean squared error with respect to a…
            grad_b = 2 * np.mean(e)                        #: …and with respect to b.
            a -= lr * grad_a                               #: Step against the gradient.
            b -= lr * grad_b
            if step in (0, 10, 100, 1000, 5000):
                print(f"step {step:>4}: a={a:7.3f}  b={b:7.3f}  MSE={np.mean(e ** 2):8.2f}")
        ''',
        predict=('What happens to the MSE as the steps go by?', ['It rises', 'It falls, quickly at first, then slowly', 'It stays the same', 'It jumps around randomly'], 1, 'Big gradients far from the minimum give big steps; near the minimum the slope flattens and progress slows.'),
        modify=[('Set `lr = 0.1` and run. What happens, and why?', 'Watch the MSE column.', '''
                a, b, lr = 0.0, 0.0, 0.1
                for step in range(30):
                    e = (a * x + b) - y
                    a -= lr * 2 * np.mean(e * x)
                    b -= lr * 2 * np.mean(e)
                    if step % 5 == 0:
                        print(step, round(np.mean(e ** 2), 1))''')]),
    viz('linefit', 'Fit a line yourself, then let gradient descent do it'),
    code('The same fit in one line of scikit-learn', '''
        from sklearn.linear_model import LinearRegression
        import matplotlib.pyplot as plt
        X = cars[["weight"]] / 1000                      #: X must be 2-D (a table), hence the double brackets.
        model = LinearRegression().fit(X, y)             #: Solves for the best line exactly; no stepping needed.
        print("sklearn: a=%.3f  b=%.3f" % (model.coef_[0], model.intercept_))
        plt.scatter(x, y, s=16, label="cars")
        xs = np.linspace(x.min(), x.max(), 50)
        plt.plot(xs, model.coef_[0] * xs + model.intercept_, color="#ffb454", label="least-squares line")
        plt.xlabel("weight (1000 lb)"); plt.ylabel("mpg"); plt.legend(); plt.show()
        ''',
        investigate=[('Why do gradient descent and sklearn agree?', 'Both minimise the same squared error. sklearn solves it directly (least squares); gradient descent approaches the same answer step by step.')]),
    quiz(
      mcq('Which error measure punishes one large miss the most?', ['L1 (sum of absolute errors)', 'L2 (based on squared errors)', 'Both equally', 'Neither'], 1, 'Squaring makes a 10-unit error count 100, not 10.'),
      mcq('If the learning rate is too large…', ['training is slow but safe', 'the steps overshoot and the loss can grow without limit', 'gradient descent stops immediately', 'the model becomes non-linear'], 1, 'Each step jumps past the minimum, further each time.'),
      card('What do `coef_` and `intercept_` hold after fitting `LinearRegression`?', 'The learned slope(s) a and the intercept b. The trailing underscore means “learned during fit”.'),
      mcq('Grid search finds parameters by…', ['following the gradient', 'trying every combination on a grid and keeping the best', 'solving equations exactly', 'random guessing only'], 1, 'Simple and reliable, but the cost grows exponentially with the number of parameters.'),
      card('What is a loss (cost) function?', 'A number that measures how badly the model’s predictions match the data. Fitting means finding parameters that make it as small as possible.'),
      mcq('Why does `model.fit(cars["weight"], y)` raise an error?', ['Weight is not numeric', 'sklearn needs X to be 2-D: use cars[["weight"]]', 'y must be a DataFrame', 'fit needs three arguments'], 1, 'X is a table of shape (rows, features), even with one feature.'),
    ),
  ],
  summary='Models as assumptions, L1/L2 loss, grid search, gradient descent and LinearRegression.',
  decks=['ml-com1011-l02-linearregression'])

# ---------------------------------------------------------------- 6
lesson('ml-split-r2', 'ml', 'Train/test split and R²', 35,
  'COM1011 Week 3: “Train-test split and R²”',
  ['train', 'test', 'split', 'overfitting', 'R2', 'R²', 'SSE', 'generalis', 'memor', 'Funes', '80', 'multi', 'variable'],
  ['Explain why a model is scored on data it never saw',
   'Split data 80/20 with `train_test_split`',
   'Calculate R² from SSE and SSE₀ and interpret it',
   'Fit and compare models with more than one feature'],
  [
    prime('A model scores R² = 0.99 on its training data and −0.4 on test data. It is…', ['excellent', 'overfitting', 'underfitting', 'impossible: R² cannot be negative'], 1, 'It memorised the training data. On new data it is worse than always predicting the mean, which is what a negative R² means.'),
    key('''<p>The lecture’s example is Borges’ story of Funes, who remembered every detail of everything and so could not form general ideas. A model that memorises its training data has the same problem: <b>overfitting</b>. The cure is to hold back a <b>test set</b> (typically 20%) that is used only once, at the end, to estimate performance on new data.</p>'''),
    fx('SSE₀ = Σ (ȳ − y<sub>i</sub>)²      the “zero model” that always predicts the mean\nSSE  = Σ (y<sub>pred,i</sub> − y<sub>i</sub>)²\nR²   = 1 − SSE / SSE₀', 'R² = 0.65 means the model explains 65% of the variation that the mean alone leaves unexplained.'),
    code('R² by hand, and from sklearn', '''
        import numpy as np, pandas as pd
        from sklearn.linear_model import LinearRegression
        cars = pd.read_csv("cars_dataset.csv")
        X, y = cars[["weight"]], cars["mpg"]
        model = LinearRegression().fit(X, y)
        pred = model.predict(X)
        sse = np.sum((pred - y) ** 2)                #: Squared errors of the model.
        sse_zero = np.sum((y.mean() - y) ** 2)       #: Squared errors of always guessing the mean.
        r2 = 1 - sse / sse_zero
        print(round(r2, 4), round(model.score(X, y), 4))   #: For a regressor, `.score` returns R².
        ''', files=['cars_dataset.csv'],
        predict=('What R² does the zero model (always the mean) get?', ['1', '0', '−1', 'It is undefined'], 1, 'Its SSE equals SSE₀, so R² = 1 − 1 = 0. Better than the mean gives R² above 0; worse gives below 0.')),
    code('An honest score with train_test_split', '''
        from sklearn.model_selection import train_test_split
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=1)   #: 80% to learn from, 20% locked away.
        print(len(X_train), "train rows,", len(X_test), "test rows")
        model = LinearRegression().fit(X_train, y_train)             #: Fit on the training rows ONLY.
        print("train R²:", round(model.score(X_train, y_train), 3))
        print("test  R²:", round(model.score(X_test, y_test), 3))    #: The number to report.
        ''',
        investigate=[('What does `random_state=1` do?', 'Fixes the shuffle, so the same rows land in the test set every run and results can be reproduced and compared.'),
                     ('Why is the test R² higher than the training R² here?', 'Luck: with only 19 test cars, which cars land in the test set moves the score a lot. That instability is one reason cross-validation exists.')]),
    code('More than one feature', '''
        X2 = cars[["weight", "horsepower"]]
        X2_train, X2_test, y_train, y_test = train_test_split(X2, y, test_size=0.2, random_state=1)   #: Same random_state: the same cars are held out.
        m2 = LinearRegression().fit(X2_train, y_train)               #: Fits y = a₁·weight + a₂·horsepower + b.
        print("coefficients:", dict(zip(X2.columns, m2.coef_.round(4))), " intercept:", round(m2.intercept_, 2))
        print("test R² with 2 features:", round(m2.score(X2_test, y_test), 3))
        '''),
    code('Watching overfitting happen', '''
        from sklearn.preprocessing import PolynomialFeatures, StandardScaler
        from sklearn.pipeline import make_pipeline
        small = cars.sample(15, random_state=3)                      #: Only 15 cars: easy to memorise.
        Xs, ys = small[["weight"]], small["mpg"]
        Xs_tr, Xs_te, ys_tr, ys_te = train_test_split(Xs, ys, test_size=0.33, random_state=0)   #: 10 cars to train on.
        for d in [1, 3, 9]:
            m = make_pipeline(StandardScaler(), PolynomialFeatures(d), LinearRegression()).fit(Xs_tr, ys_tr)   #: Scale, then fit a degree-d curve.
            print(f"degree {d}: train R² {m.score(Xs_tr, ys_tr):6.3f}   test R² {m.score(Xs_te, ys_te):11.1f}")
        ''',
        predict=('As the degree rises from 1 to 9, what happens to the training R²?', ['It falls', 'It rises towards 1', 'It stays the same', 'It becomes negative'], 1, 'A degree-9 curve has 10 parameters for 10 training cars, so it passes through every point: training R² 1.0. The test R² collapses far below 0.')),
    viz('overfit', 'Polynomial degree versus training and test error'),
    quiz(
      mcq('Why must the test set stay unseen until the end?', ['It is too small to train on', 'Any use of it during training makes the final score optimistic', 'sklearn forbids it', 'It contains the labels'], 1, 'Once a choice depends on the test data, it no longer measures performance on genuinely new data.'),
      card('R² = 1 − SSE/SSE₀. What does R² = 0.65 mean?', 'The model explains 65% of the variation in y around its mean; 35% is left unexplained.'),
      mcq('Adding a feature to a linear regression and re-fitting on the same training data makes the training R²…', ['lower', 'the same or higher', 'negative', 'exactly 1'], 1, 'The extra coefficient can always be set to 0, so the fit cannot get worse on the training data. Test R² can still drop.'),
      mcq('Train R² 0.95, test R² 0.40. Most likely…', ['underfitting', 'overfitting', 'a perfect model', 'a bug in R²'], 1, 'A large gap between training and test performance is the signature of overfitting.'),
      card('What is the “zero model”?', 'The model that always predicts the mean of y. Its error is SSE₀, the baseline in the R² formula.'),
      mcq('Typical split from the lecture?', ['50/50', '80% train / 20% test', '20% train / 80% test', '100% train'], 1, 'Enough data to learn from, enough held out to measure.'),
    ),
  ],
  summary='Overfitting, 80/20 splits, R² from SSE and SSE₀, and multi-variable regression.',
  decks=['ml-com1011-l06-train-test-split-r2'])
