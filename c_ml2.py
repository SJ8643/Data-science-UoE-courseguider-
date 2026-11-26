from dsl import *

# ---------------------------------------------------------------- 7
lesson('ml-classifiers', 'ml', 'Logistic regression and the perceptron', 40,
  'COM1011 Week 4: Classifiers lecture and workshop',
  ['classifier', 'classification', 'logistic', 'sigmoid', 'probability', 'perceptron', 'step function', 'weights', 'linearly separable', 'separability', 'multilayer', 'MLP', 'accuracy', 'confusion'],
  ['Explain how the sigmoid turns a score into a probability',
   'Train logistic regression and read its probabilities and accuracy',
   'Calculate log loss and accuracy from a confusion matrix',
   'Train a perceptron by hand and explain linear separability'],
  [
    prime('A perceptron changes its weights when…', ['every example is seen', 'it predicts an example wrongly', 'the loss is below 0.5', 'never: weights are fixed'], 1, 'Its update rule is w ← w + α(y − ŷ)x. When the prediction is right, y − ŷ = 0 and nothing changes.'),
    fx('logistic regression:  ŷ = 1 / (1 + e<sup>−(ax + b)</sup>)   = probability that y = 1\nloss for one example:  −[ y log ŷ + (1 − y) log(1 − ŷ) ]\naccuracy = (TP + TN) / (TP + TN + FP + FN)\nperceptron:  ŷ = step(w·x + b),   update  w ← w + α (y − ŷ) x', 'From the classifiers lecture. The log loss is small when a confident prediction is right and huge when it is confidently wrong.'),
    code('The sigmoid squashes scores into probabilities', '''
        import numpy as np
        def sigmoid(z):
            return 1 / (1 + np.exp(-z))            #: Any number in, a value between 0 and 1 out.
        for z in [-6, -2, 0, 2, 6]:
            print(z, round(sigmoid(z), 4))
        ''',
        predict=('What is `sigmoid(0)`?', ['0', '0.5', '1', 'undefined'], 1, 'e⁰ = 1, so 1 / (1 + 1) = 0.5: the point of maximum uncertainty and the usual decision threshold.')),
    viz('sigmoid', 'Shape the sigmoid and move the decision boundary'),
    code('Logistic regression on the admissions data', '''
        import pandas as pd
        from sklearn.linear_model import LogisticRegression
        from sklearn.model_selection import train_test_split
        marks = pd.read_csv("marks.csv")
        X = marks[["Module 1", "Module 2"]]
        y = marks["Admitted"]
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=0)
        clf = LogisticRegression().fit(X_train, y_train)
        print("weights:", clf.coef_.round(3), " bias:", clf.intercept_.round(2))
        print("P(admitted), first 3 test students:", clf.predict_proba(X_test[:3])[:, 1].round(3))   #: Column 1 holds P(class 1).
        print("test accuracy:", clf.score(X_test, y_test))   #: For a classifier, `.score` is accuracy, not R².
        ''', files=['marks.csv'],
        investigate=[('What does `predict` do with these probabilities?', 'It predicts class 1 when P ≥ 0.5, and class 0 otherwise.')]),
    code('Confusion matrix and log loss by hand', '''
        from sklearn.metrics import confusion_matrix, log_loss
        pred = clf.predict(X_test)
        cm = confusion_matrix(y_test, pred)       #: sklearn: rows = actual, columns = predicted. The lecture slides put predictions in rows.
        print(cm)
        tn, fp, fn, tp = cm.ravel()
        print("accuracy = (TP+TN)/all =", (tp + tn) / cm.sum())
        p = clf.predict_proba(X_test)[:, 1]
        manual = -np.mean(y_test * np.log(p) + (1 - y_test) * np.log(1 - p))   #: Average of −[y log ŷ + (1−y) log(1−ŷ)].
        print("log loss:", round(manual, 4), "  sklearn:", round(log_loss(y_test, p), 4))
        ''',
        investigate=[('The lecture sums the loss; sklearn averages it. Does that matter?', 'Not for choosing the best model: dividing by the number of examples does not change which parameters are best.')]),
    code('A perceptron, trained by hand', '''
        def step(z):
            return 1 if z >= 0 else 0              #: The perceptron’s activation: a hard yes or no.

        X_and = np.array([[0, 0], [0, 1], [1, 0], [1, 1]])
        y_and = np.array([0, 0, 0, 1])             #: AND: only (1, 1) is 1.
        w, b, alpha = np.zeros(2), 0.0, 0.1        #: Start every weight at 0, as on the slide.
        for epoch in range(10):
            mistakes = 0
            for xi, yi in zip(X_and, y_and):
                y_pred = step(w @ xi + b)          #: w·x + b, then the step function.
                if y_pred != yi:                   #: Only learn from mistakes.
                    w += alpha * (yi - y_pred) * xi
                    b += alpha * (yi - y_pred)
                    mistakes += 1
            print(f"epoch {epoch}: w={w}, b={b:.1f}, mistakes={mistakes}")
            if mistakes == 0:
                break
        ''',
        predict=('Will the perceptron learn AND perfectly?', ['Yes: AND is linearly separable', 'No: it needs a hidden layer', 'Only with alpha = 1'], 0, 'One straight line separates (1, 1) from the other three points, so the perceptron is guaranteed to find a separating line.'),
        modify=[('Change `y_and` to XOR, `[0, 1, 1, 0]`. What happens?', 'Watch the mistakes column.', '''
                y_xor = np.array([0, 1, 1, 0])
                w, b = np.zeros(2), 0.0
                for epoch in range(10):
                    mistakes = 0
                    for xi, yi in zip(X_and, y_xor):
                        y_pred = step(w @ xi + b)
                        if y_pred != yi:
                            w += 0.1 * (yi - y_pred) * xi
                            b += 0.1 * (yi - y_pred)
                            mistakes += 1
                    print(epoch, mistakes)''')],
        investigate=[('Why can no single perceptron learn XOR?', 'No straight line separates (0,1) and (1,0) from (0,0) and (1,1). A multilayer perceptron (MLP), the simplest neural network, can.')]),
    quiz(
      mcq('What does logistic regression output before thresholding?', ['A class label', 'A probability between 0 and 1', 'A distance', 'A residual'], 1, 'The sigmoid maps the linear score ax + b to P(y = 1).'),
      mcq('Where is the decision boundary of `1 / (1 + e^-(ax + b))` with threshold 0.5?', ['x = 0', 'ax + b = 0, i.e. x = −b/a', 'x = a/b', 'There is none'], 1, 'The sigmoid equals 0.5 exactly when its input is 0.'),
      card('Perceptron update rule?', 'w ← w + α(y − ŷ)x and b ← b + α(y − ŷ). Weights change only when the prediction is wrong.'),
      mcq('Which problem can a single perceptron NOT learn?', ['AND', 'OR', 'XOR', 'NOT'], 2, 'XOR is not linearly separable.'),
      card('Why is log loss better than accuracy for training?', 'It is smooth and rewards confident correct probabilities, punishing confident wrong ones heavily. Accuracy only counts right/wrong, so it gives no gradient to follow.'),
      mcq('In sklearn’s `confusion_matrix(y_true, y_pred)`, rows are…', ['predictions', 'actual classes', 'features', 'probabilities'], 1, 'Rows = actual, columns = predicted. Check which layout your lecture or exam uses.'),
    ),
  ],
  summary='Sigmoid and logistic regression, log loss, confusion matrices, and the perceptron.',
  decks=['ml-com1011-l4-1-classifiers'])

# ---------------------------------------------------------------- 8
lesson('ml-model-selection', 'ml', 'Overfitting, cross-validation and regularisation', 45,
  'COM1011 Week 4: Model selection and regularisation lecture, workshop and revision',
  ['overfitting', 'underfitting', 'bias', 'variance', 'cross-validation', 'cross validation', 'k-fold', 'fold', 'leave-one-out', 'holdout', 'AIC', 'BIC', 'regularisation', 'regularization', 'lasso', 'ridge', 'elastic', 'penalty', 'lambda', 'degrees of freedom'],
  ['Diagnose underfitting and overfitting from training and test scores',
   'Estimate performance with k-fold cross-validation',
   'Explain what the Ridge and Lasso penalties do',
   'Tune a hyperparameter with GridSearchCV without leaking test data'],
  [
    prime('A model does badly on BOTH training and test data. It is probably…', ['overfitting (high variance)', 'underfitting (high bias)', 'perfect', 'leaking data'], 1, 'Too simple to capture the pattern: high bias. Overfitting looks like great training scores and poor test scores.'),
    key('''<p><b>Bias</b>: error from a model that is too simple (underfits). <b>Variance</b>: error from a model so flexible it follows the noise in its training sample (overfits). More <b>degrees of freedom</b> (parameters) lower bias and raise variance; good models balance the two.</p>
    <p><b>k-fold cross-validation</b> splits the data into k parts and trains k times, each time testing on a different part. <b>Leave-one-out</b> is the extreme case k = N. Together the k scores give a steadier estimate than one holdout split, plus a sense of the spread.</p>'''),
    code('5-fold cross-validation', '''
        import numpy as np, pandas as pd
        from sklearn.model_selection import cross_val_score, KFold
        from sklearn.linear_model import LogisticRegression
        marks = pd.read_csv("marks.csv")
        X = marks[["Module 1", "Module 2", "Work Experience"]]
        y = marks["Admitted"]
        cv = KFold(n_splits=5, shuffle=True, random_state=0)       #: 5 folds: every row is tested exactly once.
        scores = cross_val_score(LogisticRegression(max_iter=1000), X, y, cv=cv)   #: Trains 5 models, returns 5 test accuracies.
        print(scores.round(3))
        print("mean %.3f ± %.3f" % (scores.mean(), scores.std()))   #: Report the mean and the spread.
        ''', files=['marks.csv'],
        predict=('How many models does this train?', ['1', '4', '5', '1000'], 2, 'One per fold. Each is trained on 4/5 of the data and tested on the remaining 1/5.')),
    code('Complexity versus honesty: tree depth', '''
        from sklearn.datasets import load_breast_cancer
        from sklearn.tree import DecisionTreeClassifier
        Xb, yb = load_breast_cancer(return_X_y=True)           #: 569 tumours, 30 measurements each, malignant or benign (bundled with sklearn).
        for depth in [1, 2, 3, 5, 10, None]:
            tree = DecisionTreeClassifier(max_depth=depth, random_state=0)
            train_acc = tree.fit(Xb, yb).score(Xb, yb)          #: Accuracy on the data it learned from.
            cv_acc = cross_val_score(tree, Xb, yb, cv=cv).mean()  #: Accuracy on folds it did not see.
            print(f"max_depth={str(depth):>4}: train {train_acc:.3f}   cross-validated {cv_acc:.3f}")
        ''',
        intro='The admissions data is too easy for this demo (a depth-5 tree classifies every student correctly), so this cell uses a noisier medical dataset that ships with scikit-learn.',
        predict=('With no depth limit, what will the training accuracy be?', ['About the same as cross-validated', 'Exactly 1.000 or very close', 'Lower than depth 1', '0.5'], 1, 'An unlimited tree can split until every leaf is pure, memorising the training data. The cross-validated score shows that does not help on new data.')),
    viz('overfit', 'The same trade-off with polynomial curves'),
    fx('regularised loss = training error + λ × penalty\nRidge (L2):   penalty = Σ β<sub>j</sub>²       shrinks every coefficient smoothly\nLasso (L1):   penalty = Σ |β<sub>j</sub>|       can push coefficients to exactly 0 (feature selection)\nElastic net:  λ₁ Σ |β<sub>j</sub>| + λ₂ Σ β<sub>j</sub>²\nAIC = 2k − 2 ln L̂        BIC = k ln n − 2 ln L̂        (smaller is better)', 'λ (called alpha in sklearn) sets how strongly large coefficients are punished. AIC and BIC reward fit (L̂) but charge for parameters k.'),
    code('Ridge and Lasso on the Ames house prices', '''
        from sklearn.linear_model import LinearRegression, Ridge, Lasso
        from sklearn.preprocessing import StandardScaler
        from sklearn.pipeline import make_pipeline
        ames = pd.read_csv("AmesHousing_full.csv")
        num = ames.select_dtypes("number").drop(columns=["Id", "SalePrice"]).fillna(0)   #: All 36 numeric features (gaps filled with 0 for this demo).
        target = np.log(ames["SalePrice"])                    #: Log price: errors become relative, the long tail shrinks.
        for name, reg in [("linear", LinearRegression()), ("ridge α=10", Ridge(alpha=10)), ("lasso α=0.01", Lasso(alpha=0.01, max_iter=5000))]:
            model = make_pipeline(StandardScaler(), reg)       #: Scale first, so the penalty treats every feature equally.
            r2 = cross_val_score(model, num, target, cv=5, scoring="r2").mean()
            model.fit(num, target)
            zeros = int(np.sum(np.abs(model[-1].coef_) < 1e-8))   #: `model[-1]` is the last step of the pipeline.
            print(f"{name:13s} CV R² {r2:.3f}   coefficients exactly 0: {zeros}")
        ''', files=['AmesHousing_full.csv'],
        investigate=[('Why must features be scaled before Ridge or Lasso?', 'The penalty adds up coefficient sizes. A feature measured in square feet needs a tiny coefficient and one measured in rooms a big one, so without scaling the penalty would treat them unfairly.')]),
    code('Tuning α with GridSearchCV', '''
        from sklearn.model_selection import GridSearchCV
        search = GridSearchCV(make_pipeline(StandardScaler(), Ridge()),
                              {"ridge__alpha": [0.1, 1, 10, 100, 1000]},   #: `stepname__parameter` reaches inside a pipeline.
                              cv=5, scoring="r2")
        search.fit(num, target)                                   #: 5 folds × 5 values = 25 fits, then a final refit on all data.
        print("best:", search.best_params_, "  CV R² %.3f" % search.best_score_)
        ''',
        investigate=[('Why put the scaler inside the pipeline?', 'In each fold the scaler is fitted on that fold’s training part only. Scaling all the data first lets information from the test folds leak into training.')]),
    bug('A cross-validation slip from the revision workshop', '''
        from sklearn.model_selection import train_test_split
        X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, random_state=0)
        model = LogisticRegression(max_iter=1000).fit(X_tr, y_tr)
        print(model.score(X_te, y_tr))''',
        'Read the shapes in the error message: which two things have different lengths?',
        '''
        from sklearn.model_selection import train_test_split
        X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, random_state=0)
        model = LogisticRegression(max_iter=1000).fit(X_tr, y_tr)
        print(model.score(X_te, y_te))''',
        'Test features must be scored against test labels. `X_te` has 200 rows and `y_tr` 800, so sklearn raises ValueError. Silent versions of this bug (with equal lengths) give meaningless scores, so name variables carefully.'),
    quiz(
      mcq('Great training accuracy, poor test accuracy means…', ['high bias', 'high variance (overfitting)', 'a good model', 'underfitting'], 1, 'The model fits the noise of its training sample.'),
      mcq('Leave-one-out cross-validation is k-fold with k equal to…', ['2', '5', '10', 'N, the number of examples'], 3, 'Each model is tested on a single held-out example.'),
      card('Ridge versus Lasso?', 'Both add a penalty on coefficient size. Ridge (L2, Σβ²) shrinks all coefficients smoothly. Lasso (L1, Σ|β|) can set some exactly to 0, which selects features.'),
      mcq('Making λ (alpha) very large in Ridge tends to…', ['overfit', 'underfit: coefficients shrink towards 0', 'have no effect', 'select features'], 1, 'The penalty dominates, so the model becomes too simple.'),
      card('AIC versus BIC?', 'Both score fit minus a cost per parameter; smaller is better. BIC’s cost, k ln n, grows with the data size, so BIC prefers simpler models than AIC when n is large.'),
      mcq('Why use cross-validation instead of one train/test split?', ['It is faster', 'It averages over several splits, giving a steadier estimate and its spread', 'It needs no test data', 'It always gives higher scores'], 1, 'One split can be lucky or unlucky.'),
      card('What is data leakage?', 'Information from the test data influencing training (e.g. fitting a scaler on all rows). It makes scores look better than they will be on truly new data.'),
    ),
  ],
  summary='Bias and variance, k-fold CV, Ridge/Lasso/Elastic net, AIC/BIC and GridSearchCV.',
  decks=['ml-com1011-l4-2-modelselection-regularisation'])

# ---------------------------------------------------------------- 9
lesson('ml-bayes', 'ml', 'Bayes’ theorem and Naive Bayes', 45,
  'COM1011 Week 5: Bayes and Naive Bayes lecture and practical',
  ['bayes', 'naive', 'prior', 'posterior', 'likelihood', 'conditional', 'spam', 'smoothing', 'log', 'specificity', 'sensitivity', 'recall', 'precision', 'gaussian', 'confusion matrix', 'crowded', 'bus'],
  ['Use the law of total probability and Bayes’ theorem',
   'Classify a message with Naive Bayes by hand, then normalise the scores',
   'Explain smoothing and why we add logs instead of multiplying',
   'Read precision, recall and specificity off a confusion matrix'],
  [
    prime('The bus is crowded on 80% of weekdays and 5% of weekend days. You see a crowded bus. Chance it is a weekday?', ['about 0.58', '0.80', 'about 0.98', 'exactly 1'], 2, 'Weekdays are common and crowding is far more likely on them. Bayes’ theorem gives about 0.976.'),
    fx('total probability:  P(E) = P(E | A) P(A) + P(E | B) P(B)\nBayes:              P(A | B) = P(B | A) · P(A) / P(B)\n                    posterior = likelihood × prior / evidence', 'Read P(A | B) as “the probability of A given that B happened”.'),
    code('The crowded bus, step by step', '''
        p_weekday, p_weekend = 5/7, 2/7                 #: Priors: 5 of 7 days are weekdays.
        p_crowd_wd, p_crowd_we = 0.8, 0.05              #: Likelihoods: P(crowded | weekday), P(crowded | weekend).
        p_crowd = p_crowd_wd * p_weekday + p_crowd_we * p_weekend   #: Total probability: every way of being crowded.
        print("P(crowded) =", round(p_crowd, 3))
        p_wd_given_crowd = p_crowd_wd * p_weekday / p_crowd          #: Bayes’ theorem.
        print("P(weekday | crowded) =", round(p_wd_given_crowd, 3))
        '''),
    code('Naive Bayes spam filter, with the lecture’s numbers', '''
        like = {"spam":     {"send": 0.26, "us": 0.11, "your": 0.30, "password": 0.09},
                "not spam": {"send": 0.17, "us": 0.08, "your": 0.30, "password": 0.25}}   #: P(word | class), from the slides.
        prior = {"spam": 0.8, "not spam": 0.2}          #: The priors used in the lecture example.
        message = "send us your password".split()
        scores = {}
        for cls in like:
            s = prior[cls]
            for w in message:
                s *= like[cls][w]                       #: “Naive”: treat words as independent, so multiply.
            scores[cls] = s
        print(scores)                                   #: Unnormalised scores: 0.00061776 and 0.000204.
        total = sum(scores.values())
        print({c: round(s / total, 3) for c, s in scores.items()})   #: Divide by the total to get probabilities that add to 1.
        print("prediction:", max(scores, key=scores.get))
        ''',
        predict=('Which class wins, and roughly how confident is the filter?', ['spam, about 75%', 'spam, 0.06%', 'not spam, about 60%', 'a tie'], 0, '0.00061776 / (0.00061776 + 0.000204) ≈ 0.75. The raw products are tiny because they are not yet normalised.')),
    slip('''<p>The products 0.00061776 and 0.000204 are <b>scores</b>, not probabilities: they do not add up to 1. Divide each by their sum to get P(spam | message) ≈ 0.75. Count the zeros carefully too: 0.0007722 × 0.8 = 0.00061776, not 0.0061776.</p>''', yours=True),
    viz('bayes', 'Toggle words and change the prior'),
    code('Two practical fixes: logs and smoothing', '''
        import math
        log_score = math.log(0.8) + sum(math.log(like["spam"][w]) for w in message)   #: log(a × b) = log a + log b.
        print("log score:", round(log_score, 4), "  back to a product:", math.exp(log_score))
        print("200 words multiplied:", 0.05 ** 200)        #: Underflow: too small for a float, so it becomes exactly 0.
        print("200 words as a log sum:", 200 * math.log(0.05))
        count, words_in_class, vocab = 0, 5000, 2000       #: A word never seen in this class.
        print("unsmoothed:", count / words_in_class)                        #: 0 would wipe out the whole product.
        print("add-one smoothed:", (count + 1) / (words_in_class + vocab))   #: Small, but not zero.
        ''',
        investigate=[('Why does one zero probability matter so much?', 'Naive Bayes multiplies all the word probabilities, so a single 0 makes the whole score 0, however strong the other evidence.')]),
    code('A real spam filter on the practical’s 5,572 texts', '''
        import pandas as pd
        from sklearn.feature_extraction.text import CountVectorizer
        from sklearn.naive_bayes import MultinomialNB
        from sklearn.model_selection import train_test_split
        from sklearn.metrics import confusion_matrix, classification_report
        sms = pd.read_csv("spam.csv")                                   #: Columns `text` and `spam` (True/False); 747 are spam.
        X_tr, X_te, y_tr, y_te = train_test_split(sms["text"], sms["spam"], test_size=0.2, random_state=0, stratify=sms["spam"])   #: `stratify` keeps the spam share equal in both parts.
        vec = CountVectorizer()                                         #: Each message becomes word counts (“bag of words”).
        Xc_tr = vec.fit_transform(X_tr)                                 #: Learn the vocabulary from training texts only.
        Xc_te = vec.transform(X_te)
        nb = MultinomialNB(alpha=1.0).fit(Xc_tr, y_tr)                  #: alpha=1 is add-one smoothing.
        pred = nb.predict(Xc_te)
        print(confusion_matrix(y_te, pred))
        print(classification_report(y_te, pred, digits=3))
        print(nb.predict(vec.transform(["WIN a FREE prize now, call 0800", "are we still meeting at 3?"])))
        ''', files=['spam.csv'],
        investigate=[('Why `fit_transform` on training texts but only `transform` on test texts?', 'The vocabulary must come from training data only; otherwise test messages leak into the model.')]),
    viz('confusion', 'Precision, recall and specificity: the lecture’s 30 / 10 / 20 / 40 example'),
    slip('''<p>P(actually spam | predicted spam) is the <b>precision</b>, TP / (TP + FP) = 30 / 40 = 0.75. (TP + FN) / total is something else: P(actually spam), the overall share of spam, 0.5 here.</p>''', yours=True),
    code('Gaussian Naive Bayes for numeric features', '''
        from sklearn.datasets import load_iris
        from sklearn.naive_bayes import GaussianNB
        iris = load_iris()                                              #: 150 flowers, 4 measurements, 3 species (bundled with sklearn).
        Xi_tr, Xi_te, yi_tr, yi_te = train_test_split(iris.data, iris.target, test_size=0.3, random_state=0)
        g = GaussianNB().fit(Xi_tr, yi_tr)                              #: Assumes each feature is normally distributed within each class.
        print("accuracy:", round(g.score(Xi_te, yi_te), 3))
        print("mean petal length per species:", g.theta_[:, 2].round(2))   #: The fitted class means.
        '''),
    quiz(
      mcq('In Bayes’ theorem, P(A) is called the…', ['likelihood', 'prior', 'posterior', 'evidence'], 1, 'Your belief about A before seeing the evidence B.'),
      mcq('Why is Naive Bayes called “naive”?', ['It is a simple program', 'It assumes features are independent given the class', 'It ignores the prior', 'It only works for spam'], 1, 'That assumption lets it multiply per-word probabilities.'),
      card('Why add logs instead of multiplying probabilities?', 'Multiplying many small numbers underflows to 0 in floating point. Adding logs keeps the numbers manageable and gives the same ranking.'),
      card('What is smoothing for?', 'A word never seen in a class would have probability 0 and zero out the whole product. Adding a small count (add-one / Laplace smoothing) keeps every probability above 0.'),
      mcq('TP 30, FP 10, FN 20, TN 40. Recall (sensitivity) is…', ['30/40 = 0.75', '30/50 = 0.60', '40/50 = 0.80', '70/100 = 0.70'], 1, 'TP / (TP + FN): of all the actual spam, how much was caught.'),
      mcq('Specificity for the same matrix?', ['40/50 = 0.80', '40/60', '30/50', '10/50'], 0, 'TN / (TN + FP): of all genuine messages, how many were correctly let through.'),
    ),
  ],
  summary='Total probability, Bayes’ theorem, Naive Bayes by hand and in sklearn, smoothing, metrics.',
  decks=['ml-l5-1-bayes-and-naivebayes', 'ml-p5-naivebayes'])

# ---------------------------------------------------------------- 10
lesson('ml-prob', 'ml', 'Probability distributions', 40,
  'COM1011 Week 7: Probability distributions lecture',
  ['probability', 'distribution', 'discrete', 'continuous', 'PDF', 'PMF', 'CDF', 'mean', 'variance', 'standard deviation', 'uniform', 'bernoulli', 'binomial', 'poisson', 'normal', 'exponential', 'covariance', 'correlation', 'dice', 'venn', 'conjunction'],
  ['Tell a probability mass function (PMF) from a density (PDF) and use a CDF',
   'Calculate expected value, variance and standard deviation',
   'Pick the right distribution: uniform, Bernoulli, binomial, Poisson, normal, exponential',
   'Interpret covariance and correlation'],
  [
    prime('Linda studied philosophy and campaigned for social justice. Which is more likely: (a) she is a bank teller, or (b) she is a bank teller AND active in the feminist movement?', ['(a)', '(b)', 'Equal'], 0, 'P(A and B) can never exceed P(A). Many people pick (b): this is the conjunction fallacy from the lecture.'),
    key('''<p>A <b>discrete</b> variable (dice, counts) has a <b>PMF</b>: bars whose heights are probabilities and add to 1. A <b>continuous</b> variable (height, time) has a <b>PDF</b>: probability is the <b>area</b> under the curve, so the chance of one exact value is 0. The <b>CDF</b> gives P(X ≤ x).</p>'''),
    fx('E[X] = Σ x f(x)                     a fair die: 3.5\nVar(X) = Σ (x − μ)² f(x)       sd = √Var\nbinomial(n, p):  P(X = k) = C(n, k) pᵏ (1 − p)ⁿ⁻ᵏ   mean np, variance np(1 − p)\nPoisson(λ):      P(X = k) = λᵏ e<sup>−λ</sup> / k!        mean = variance = λ\nnormal(μ, σ):    68% within 1σ, 95% within 2σ, 99.7% within 3σ', 'Formulas as on the lecture slides.'),
    code('Expected value and variance by simulation', '''
        import numpy as np
        rng = np.random.default_rng(0)
        rolls = rng.integers(1, 7, size=100_000)              #: 100,000 fair dice rolls (the upper limit 7 is excluded).
        print("mean:", rolls.mean().round(3), "  theory: 3.5")
        print("variance:", rolls.var().round(3), "  theory:", round(35 / 12, 3))
        two = rng.integers(1, 7, size=(100_000, 2)).sum(axis=1)   #: The sum of two dice.
        values, counts = np.unique(two, return_counts=True)
        print(dict(zip(values.tolist(), (counts / len(two)).round(3).tolist())))
        ''',
        predict=('Which total of two dice is most likely?', ['2', '6', '7', 'All totals are equally likely'], 2, 'Six of the 36 combinations make 7, more than any other total.')),
    viz('dice', 'Add more dice and watch the bell shape appear'),
    code('Named distributions with scipy.stats', '''
        from scipy import stats
        print("Binomial(10, 0.5): P(X = 5)   =", round(stats.binom.pmf(5, 10, 0.5), 4))   #: Exactly 5 heads in 10 fair flips.
        print("Poisson(3):        P(X = 0)   =", round(stats.poisson.pmf(0, 3), 4))       #: No buses in an hour when 3 arrive on average.
        print("Normal(0, 1): P(−1 < X < 1)   =", round(stats.norm.cdf(1) - stats.norm.cdf(-1), 4))   #: A CDF difference is an area.
        print("Normal(0, 1): pdf at 0        =", round(stats.norm.pdf(0), 4), "(a density, not a probability)")
        print("Exponential(λ = 0.5): mean    =", stats.expon(scale=1 / 0.5).mean())   #: scipy uses scale = 1/λ.
        ''',
        investigate=[('Can a PDF value be bigger than 1?', 'Yes. Density is probability per unit; a very narrow normal curve can be taller than 1 while its total area is still 1.')]),
    code('PDF and CDF for simulated exam marks', '''
        import matplotlib.pyplot as plt
        samples = rng.normal(loc=70, scale=10, size=5000)        #: 5,000 marks with mean 70 and standard deviation 10.
        xs = np.linspace(30, 110, 300)
        fig, ax = plt.subplots(1, 2, figsize=(10, 3.4))
        ax[0].hist(samples, bins=40, density=True, alpha=0.6, label="samples")   #: `density=True` scales bars to areas.
        ax[0].plot(xs, stats.norm.pdf(xs, 70, 10), label="PDF")
        ax[0].set(title="PDF: height is density", xlabel="mark"); ax[0].legend()
        ax[1].plot(xs, stats.norm.cdf(xs, 70, 10), color="#ffb454")
        ax[1].set(title="CDF: P(X ≤ x)", xlabel="mark")
        plt.show()
        print("share within 1 sd:", np.mean(np.abs(samples - 70) < 10).round(3))
        '''),
    viz('normal', 'Area under the normal curve'),
    code('Covariance and correlation', '''
        import pandas as pd
        cars = pd.read_csv("cars_dataset.csv")
        print(round(np.cov(cars["weight"], cars["mpg"], bias=True)[0, 1], 1))   #: (1/n) Σ (x − x̄)(y − ȳ): the sign shows the direction; the size depends on units.
        print(cars.corr().round(3))                                            #: Pearson ρ = cov / (σx σy), always between −1 and 1.
        ''', files=['cars_dataset.csv'],
        investigate=[('Weight and mpg have correlation about −0.8. Does weight cause low mpg?', 'Correlation alone cannot show cause. Here physics suggests it does, but heavier cars also tend to have bigger engines, which is a second explanation.')]),
    quiz(
      mcq('For a continuous variable, P(X = 40.000 exactly) is…', ['the height of the PDF at 40', '0', '1', 'undefined'], 1, 'Probability is area; a single point has no width.'),
      mcq('Mean and variance of a Poisson distribution with λ = 4?', ['4 and 2', '4 and 4', '2 and 4', '4 and 16'], 1, 'For a Poisson distribution the mean equals the variance: both λ.'),
      card('The 68–95–99.7 rule?', 'For a normal distribution, about 68% of values lie within 1 standard deviation of the mean, 95% within 2, and 99.7% within 3.'),
      mcq('Number of heads in 20 coin flips follows a…', ['uniform distribution', 'binomial distribution', 'Poisson distribution', 'exponential distribution'], 1, 'A fixed number of independent yes/no trials, each with the same p.'),
      card('PMF, PDF, CDF?', 'PMF: probabilities of each value of a discrete variable. PDF: density of a continuous variable, where areas are probabilities. CDF: P(X ≤ x), for either kind.'),
      mcq('Correlation of −1 means…', ['no relationship', 'a perfect negative straight-line relationship', 'a weak negative trend', 'an error'], 1, 'All points lie exactly on a downward-sloping line.'),
    ),
  ],
  summary='PMF, PDF and CDF, expectation and variance, named distributions, correlation.',
  decks=['ml-com1011-l05a-probability-distributions'])

# ---------------------------------------------------------------- 11
lesson('ml-hypothesis', 'ml', 'Hypothesis testing', 40,
  'COM1011 Week 7: Hypothesis testing lecture',
  ['hypothesis', 'null', 'p-value', 'p value', 'significance', 'significant', '0.05', 't-test', 't test', 'z-score', 'z score', 't-statistic', 'Student', 'Gosset', 'Guinness', 'reject', 'ttest_rel'],
  ['State a null hypothesis and explain “reject” versus “fail to reject”',
   'Explain what a p-value is and is not',
   'Calculate a z-score and a t-statistic, and run a t-test with scipy',
   'Compare two classifiers fairly with a paired t-test on the same folds'],
  [
    prime('A p-value of 0.03 means…', ['a 3% chance the null hypothesis is true', 'if the null hypothesis were true, results at least this extreme would happen about 3% of the time', 'a 97% chance your idea is right', 'the effect is large'], 1, 'The p-value assumes H₀ is true and asks how surprising the data would be.'),
    key('''<p>The <b>null hypothesis</b> H₀ says there is no effect (no difference between the drugs, the coin is fair). Like “innocent until proven guilty”, we assume H₀ and ask whether the data make it implausible. The <b>p-value</b> is the probability, if H₀ were true, of results at least as extreme as those observed. If p is below a threshold chosen in advance (usually 0.05) we <b>reject</b> H₀; otherwise we <b>fail to reject</b> it. We never “prove” H₀.</p>
    <p>The t-test comes from William Gosset, who published as “Student” while working at the Guinness brewery.</p>'''),
    code('How surprising is “all five are old professors”?', '''
        p_old = 0.2                       #: Suppose 20% of professors are old, and the five were picked at random (H₀).
        p_all_five = p_old ** 5           #: Independent picks: multiply.
        print(p_all_five)                 #: So unlikely under H₀ that we doubt the picks were random.
        ''',
        predict=('Roughly how big is 0.2⁵?', ['0.2', '0.01', '0.0003', '0.00000001'], 2, '0.2⁵ = 0.00032, far below 0.05.')),
    code('A coin lands heads 60 times in 100: fair or not?', '''
        import numpy as np
        from scipy import stats
        heads, n = 60, 100
        ## Simulate a world where H₀ is true: the coin is fair
        rng = np.random.default_rng(1)
        sims = rng.binomial(n, 0.5, size=100_000)              #: 100,000 experiments of 100 fair flips.
        p_sim = np.mean(np.abs(sims - 50) >= abs(heads - 50))  #: How often is a fair coin at least this far from 50? (two-sided)
        print("simulated p-value:  ", round(p_sim, 4))
        ## Exact and approximate tests
        print("exact binomial test:", round(stats.binomtest(heads, n, 0.5).pvalue, 4))
        z = (heads - n * 0.5) / np.sqrt(n * 0.5 * 0.5)          #: z = (x − μ) / σ, using the binomial mean and sd.
        print("z =", z, "  normal approximation p =", round(2 * (1 - stats.norm.cdf(z)), 4))
        ''',
        predict=('Is 60 heads out of 100 significant at the 0.05 level?', 'It sits right on the line: the exact test gives about 0.057 (not significant) while the rough normal approximation gives about 0.046. Borderline results depend on the method, one reason not to treat 0.05 as magic.')),
    viz('normal', 'Two-sided p-value as tail area', mode='tail'),
    fx('z = (x − μ) / σ                                         σ known\nt = (estimate − value under H₀) / (standard error of the estimate)\none-sample: t = (x̄ − μ₀) / (s / √n),  with n − 1 degrees of freedom', 'The t-distribution has fatter tails than the normal: with small samples, s is itself uncertain.'),
    code('A one-sample t-test, by hand and with scipy', '''
        marks = np.array([68, 74, 59, 81, 72, 66, 77, 70, 63, 75])   #: 10 students after a new revision method.
        mu0 = 65                                                     #: H₀: the true mean is still 65.
        t = (marks.mean() - mu0) / (marks.std(ddof=1) / np.sqrt(len(marks)))   #: ddof=1 gives the sample standard deviation.
        p = 2 * stats.t.sf(abs(t), df=len(marks) - 1)                #: Area in both tails beyond ±t.
        print(f"t = {t:.3f},  p = {p:.4f}")
        print(stats.ttest_1samp(marks, mu0))                          #: The same answer from scipy.
        ''',
        modify=[('Test against H₀: mean = 70 instead. Do you reject?', 'Change `mu0`.', '''
                print(stats.ttest_1samp(marks, 70))''')]),
    code('Comparing two classifiers on the same folds', '''
        import pandas as pd
        from sklearn.model_selection import KFold, cross_val_score
        from sklearn.linear_model import LogisticRegression
        from sklearn.tree import DecisionTreeClassifier
        df = pd.read_csv("marks.csv")
        X, y = df[["Module 1", "Module 2", "Work Experience"]], df["Admitted"]
        cv = KFold(n_splits=10, shuffle=True, random_state=0)       #: The SAME folds for both models, so the scores pair up.
        acc_1 = cross_val_score(LogisticRegression(max_iter=1000), X, y, cv=cv)
        acc_2 = cross_val_score(DecisionTreeClassifier(max_depth=3, random_state=0), X, y, cv=cv)
        print("logistic:", acc_1.mean().round(3), "  tree:", acc_2.mean().round(3))
        print(stats.ttest_rel(acc_1, acc_2))                         #: Paired t-test, as on the lecture slide.
        ''', files=['marks.csv'],
        investigate=[('Why a paired test (`ttest_rel`) rather than an independent one?', 'Both models were scored on identical folds, so fold difficulty affects both. Pairing compares them fold by fold and removes that shared noise.')]),
    quiz(
      mcq('p = 0.20 at the 0.05 level. You should say…', ['H₀ is true', 'We fail to reject H₀', 'We reject H₀', 'The test is broken'], 1, 'Not enough evidence against H₀. That is not proof that H₀ is true.'),
      card('Define the p-value.', 'Assuming the null hypothesis is true, the probability of getting results at least as extreme as the ones observed.'),
      mcq('When is a t-test used instead of a z-test?', ['When σ is unknown and estimated from a sample', 'When the data are categorical', 'Only for 2 groups', 'When n > 1000'], 0, 'Estimating σ adds uncertainty, captured by the fatter-tailed t-distribution.'),
      mcq('A z-score of 2 means the value is…', ['2% above the mean', '2 standard deviations above the mean', 'twice the mean', 'significant at 2%'], 1, 'z = (x − μ) / σ.'),
      card('Why compare classifiers with `ttest_rel` on the same CV folds?', 'The fold scores are paired (same data for both models). A paired test compares differences fold by fold, removing variation caused by easy or hard folds.'),
      mcq('Who developed the t-test?', ['Bayes', 'Gosset (“Student”), at the Guinness brewery', 'Pearson', 'Gauss'], 1, 'As told in the lecture.'),
    ),
  ],
  summary='Null hypotheses, p-values, z and t statistics, t-tests and comparing classifiers.',
  decks=['ml-com1011-l05b-hypothesis-testing'])

# ---------------------------------------------------------------- 12
lesson('ml-workflow', 'ml', 'The scikit-learn workflow: revision', 35,
  'COM1011 Week 7 revision workshops 1 and 2',
  ['fit', 'predict', 'score', 'estimator', 'pipeline', 'scaler', 'StandardScaler', 'MinMaxScaler', 'coef_', 'intercept_', 'GridSearchCV', 'cross_val_score', 'diabetes'],
  ['Name the four steps every scikit-learn model follows',
   'Use pipelines so scaling is fitted on training data only',
   'Tune a hyperparameter with GridSearchCV',
   'Recognise the common fit/predict mistakes'],
  [
    prime('Which attribute exists only after `fit` has been called?', ['model.fit', 'model.coef_', 'model.get_params', 'model.predict'], 1, 'Learned values end with an underscore and appear during fit.'),
    code('Anatomy of an estimator', '''
        from sklearn.datasets import load_diabetes
        from sklearn.linear_model import LinearRegression
        from sklearn.model_selection import train_test_split
        X, y = load_diabetes(return_X_y=True, as_frame=True)     #: 442 patients, 10 measurements; target = disease progression a year later.
        X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.25, random_state=42)
        ## 1. Create the estimator (choose its settings)
        model = LinearRegression()
        ## 2. Fit: learn from the training data
        model.fit(X_tr, y_tr)
        ## 3. Use it on new data: predict and score
        print(model.predict(X_te[:3]).round(1))
        print("test R²:", round(model.score(X_te, y_te), 3))
        ## 4. Inspect what it learned
        print(dict(zip(X.columns, model.coef_.round(1))))         #: Names ending in `_` exist only after fit.
        '''),
    parsons('The order every model follows', '''
        from sklearn.linear_model import LogisticRegression
        model = LogisticRegression(max_iter=1000)
        model.fit(X_train, y_train)
        predictions = model.predict(X_test)
        print(accuracy_score(y_test, predictions))''', why='Import, create, fit, predict, evaluate: predicting before fitting raises NotFittedError.'),
    code('When scaling matters: k-nearest neighbours', '''
        import pandas as pd
        from sklearn.neighbors import KNeighborsClassifier
        from sklearn.preprocessing import StandardScaler, MinMaxScaler
        from sklearn.pipeline import make_pipeline
        from sklearn.datasets import load_breast_cancer
        Xm, ym = load_breast_cancer(return_X_y=True, as_frame=True)   #: 30 tumour measurements on very different scales.
        print(Xm[["mean area", "mean smoothness"]].describe().loc[["min", "max"]])
        Xm_tr, Xm_te, ym_tr, ym_te = train_test_split(Xm, ym, test_size=0.25, random_state=0, stratify=ym)
        for scaler in [None, StandardScaler(), MinMaxScaler()]:
            steps = ([scaler] if scaler else []) + [KNeighborsClassifier(n_neighbors=15)]
            pipe = make_pipeline(*steps)                          #: The pipeline fits the scaler on training data, then the model.
            pipe.fit(Xm_tr, ym_tr)
            print(f"{type(scaler).__name__ if scaler else 'no scaling':>15}: test accuracy {pipe.score(Xm_te, ym_te):.3f}")
        ''',
        investigate=[('Why does scaling change KNN’s accuracy here?', 'KNN measures distances. “mean area” runs into the thousands while “mean smoothness” is around 0.1, so without scaling the large-unit features decide every distance on their own.')]),
    code('Tuning with GridSearchCV', '''
        from sklearn.model_selection import GridSearchCV
        pipe = make_pipeline(StandardScaler(), KNeighborsClassifier())
        grid = GridSearchCV(pipe, {"kneighborsclassifier__n_neighbors": [1, 3, 5, 9, 15, 31, 61, 121]}, cv=5)   #: Each value scored by 5-fold CV on the training data.
        grid.fit(Xm_tr, ym_tr)
        print("best:", grid.best_params_, "  CV accuracy %.3f" % grid.best_score_)
        print("test accuracy of the refitted best model: %.3f" % grid.score(Xm_te, ym_te))   #: The test set is used once, at the very end.
        ''',
        predict=('What happens with n_neighbors = 1?', 'It memorises the training set (every training point is its own nearest neighbour), so it overfits. Very large values underfit. The grid search picks the best middle value by cross-validation.')),
    bug('Predicting before fitting', '''
        from sklearn.linear_model import Ridge
        ridge = Ridge(alpha=1.0)
        print(ridge.predict(X_te[:3]))''',
        'What has this model learned so far?',
        '''
        from sklearn.linear_model import Ridge
        ridge = Ridge(alpha=1.0)
        ridge.fit(X_tr, y_tr)
        print(ridge.predict(X_te[:3]))''',
        'A new estimator has no coefficients yet. Call `fit` with training data before `predict`; otherwise sklearn raises NotFittedError.',
        test='assert hasattr(ridge, "coef_")'),
    make('Fit `Lasso(alpha=1.0)` on the diabetes training data (`X_tr`, `y_tr`) and store its test R² in `lasso_r2`. Then print how many coefficients are exactly 0.',
         '''
         from sklearn.linear_model import Lasso
         lasso_r2 = None
         print(lasso_r2)''',
         ['Create the model, then `.fit(X_tr, y_tr)`.', '`.score(X_te, y_te)` gives R². Count zeros with `(model.coef_ == 0).sum()`.'],
         '''
         from sklearn.linear_model import Lasso
         lasso = Lasso(alpha=1.0).fit(X_tr, y_tr)
         lasso_r2 = lasso.score(X_te, y_te)
         print(round(lasso_r2, 3), (lasso.coef_ == 0).sum(), "coefficients are 0")''',
         test='''
         from sklearn.linear_model import Lasso
         assert abs(lasso_r2 - Lasso(alpha=1.0).fit(X_tr, y_tr).score(X_te, y_te)) < 1e-9'''),
    quiz(
      mcq('What does `.score()` return for a regressor and for a classifier?', ['Accuracy for both', 'R² for a regressor, accuracy for a classifier', 'MSE for both', 'Log loss for both'], 1, 'Check which model you have before interpreting the number.'),
      mcq('On the TEST set you should call…', ['scaler.fit_transform(X_test)', 'scaler.transform(X_test)', 'scaler.fit(X_test)', 'nothing'], 1, 'Fit on training data only; transform test data with what was learned.'),
      card('What does a Pipeline buy you?', 'It chains preprocessing and a model into one estimator, so every fit (including inside cross-validation) fits the preprocessing on training data only. No leakage, less code.'),
      mcq('How do you name a pipeline step’s parameter in GridSearchCV?', ['n_neighbors', 'kneighborsclassifier__n_neighbors', 'step.n_neighbors', 'KNN(n_neighbors)'], 1, 'Step name, two underscores, parameter name.'),
      card('Four steps of the estimator workflow?', 'Create it with settings; fit on training data; predict / score on new data; inspect learned attributes such as `coef_`.'),
    ),
  ],
  summary='fit / predict / score, pipelines, scalers, GridSearchCV and common bugs.')

# ---------------------------------------------------------------- 13
lesson('ml-unsupervised', 'ml', 'Unsupervised learning and clustering', 35,
  'COM1011 Week 8: Unsupervised learning lecture',
  ['unsupervised', 'clustering', 'cluster', 'labels', 'ground truth', 'segmentation', 'community detection', 'topic modelling',
   'John Snow', 'cholera', 'Voronoi', 'tessellation', 'K-means', 'centroid', 'DBSCAN', 'hierarchical', 'hard clustering', 'soft clustering',
   'Gaussian mixture', 'Euclidean distance', 'distance metric', 'similarity', 'cohesion', 'separation'],
  ['Tell supervised from unsupervised learning, and clustering from classification and regression',
   'Measure similarity with the Euclidean distance, and spot the missing square root on the slide',
   'Split a map into nearest-point regions, as John Snow did',
   'Judge a clustering by cohesion, separation and expert judgement'],
  [
    text('''<p>Herbert Simon defined learning as adaptive change that lets a system do the same task better the next time. Every model so far learned from <b>labelled</b> examples, the “ground truth”: classification is <b>supervised</b> learning. In <b>unsupervised</b> learning there are no labels. How would you sort fruit into groups if nobody told you their names? By colour, by size, by some other feature: the algorithm can find the groups, but it cannot name them.</p>'''),
    prime('Predicting whether an email is spam is…', ['classification', 'regression', 'unsupervised learning'], 0,
          'It learns from emails already labelled spam or not spam, and outputs a category: supervised classification.'),
    key('''<table class="tbl"><tr><th></th><th>Regression</th><th>Classification</th><th>Clustering</th></tr>
    <tr><td>Output</td><td>a number</td><td>a category</td><td>groups in the data</td></tr>
    <tr><td>Uses labels?</td><td>yes</td><td>yes</td><td>no</td></tr>
    <tr><td>Learning type</td><td>supervised</td><td>supervised</td><td>unsupervised</td></tr>
    <tr><td>Example</td><td>house price</td><td>spam or not spam</td><td>shopper segments</td></tr>
    <tr><td>Algorithms</td><td>linear regression</td><td>logistic regression</td><td>K-means, DBSCAN</td></tr></table>
    <p><b>Clustering</b>, in general steps: go over all the points, measure the distance (or similarity) between them, and find groups of points that are closer to each other than to points outside the group. Real uses: customer segmentation, spotting fraud or bots, identifying new animal species, and creating the classes a classifier needs. <b>Community detection</b> does the same for networks (a community is a densely linked group of nodes inside a “hairball”), and <b>topic modelling</b> groups documents, such as reviews about the bread, the coffee or the store.</p>'''),
    code('What makes two points similar? The Euclidean distance', '''
        import numpy as np
        x = np.array([0.011, 0.132, 0.005, 0.098])
        y = np.array([0.001, 0.056, 0.095, 0.077])      #: The first four values of the slide's example inputs.
        squared = np.sum((x - y) ** 2)                  #: The formula exactly as printed on the slide…
        dist = np.sqrt(squared)                         #: …and the Euclidean distance (L2 norm), which takes the square root.
        print(round(squared, 5), round(dist, 4), round(np.linalg.norm(x - y), 4))
        ## Every pair at once: a distance matrix
        pts = np.array([[1, 1], [2, 1.5], [8, 9], [9, 8], [1.5, 3]])
        D = np.sqrt(((pts[:, None, :] - pts[None, :, :]) ** 2).sum(axis=2))   #: Broadcasting builds all 5 × 5 differences in one go.
        print(D.round(2))
        ''',
        predict=('Does leaving out the square root change which pair of points is closest?', ['yes', 'no'], 1,
                 'For non-negative numbers, squaring keeps the order, so the closest pair stays the closest. The values change, which matters when a threshold such as DBSCAN’s eps is measured in real distance units.'),
        investigate=[('Which two points in `pts` are closest, and how can you read it off `D`?', 'Points 0 and 1, at about 1.12: the smallest entry off the diagonal. The diagonal is 0 because every point is at distance 0 from itself, and the matrix is symmetric.')]),
    slip('''<p>The slide writes the Euclidean distance as ‖x − y‖ = Σ (xᵢ − yᵢ)². That is the <b>squared</b> Euclidean distance. The Euclidean distance (L2 norm) is its square root, √Σ (xᵢ − yᵢ)², as in the L2 error from the linear regression lecture. The two rank pairs of points the same way, but their values differ.</p>'''),
    key('''<p><b>A real use of clustering.</b> In the 19th century, cholera was blamed on “bad air”. The physician John Snow suspected contaminated water instead. He went door to door, marked every death on a street map, and divided London into regions according to their nearest water pump. Most deaths were near the pump in Broad Street; the authorities removed its handle, and the epidemic stopped. (Snow himself noted that the outbreak was already declining by then, but his map was the evidence that water carried the disease.) Data, a hypothesis and a test: this is data science.</p>
    <p>Snow’s technique is a <b>Voronoi tessellation</b>: take N points of interest (water pumps, hospitals, airports) and find the region of the map that is closest to each one.</p>'''),
    code('John Snow’s method: give every death to its nearest pump', '''
        rng = np.random.default_rng(7)
        pumps = np.array([[2.0, 2.0], [6.0, 7.0], [8.0, 2.5], [3.0, 8.0]])     #: Made-up pump positions on a 10 × 10 map; pump 0 plays Broad Street.
        deaths = np.vstack([rng.normal([2.4, 2.6], 0.9, size=(40, 2)),        #: A made-up outbreak: most deaths near pump 0…
                            rng.uniform(0, 10, size=(12, 2))])                #: …and a few scattered across the map.
        dist = np.sqrt(((deaths[:, None, :] - pumps[None, :, :]) ** 2).sum(axis=2))   #: Distance from every death to every pump: shape (52, 4).
        nearest = dist.argmin(axis=1)                                          #: The Voronoi assignment: the index of the closest pump.
        print("deaths in each pump's region:", np.bincount(nearest, minlength=len(pumps)))
        import matplotlib.pyplot as plt
        gx, gy = np.meshgrid(np.linspace(0, 10, 200), np.linspace(0, 10, 200))
        grid = np.c_[gx.ravel(), gy.ravel()]
        region = ((grid[:, None, :] - pumps[None, :, :]) ** 2).sum(axis=2).argmin(axis=1).reshape(gx.shape)
        plt.contourf(gx, gy, region, levels=np.arange(-0.5, 4), alpha=0.35)   #: Colour every spot on the map by its nearest pump.
        plt.scatter(deaths[:, 0], deaths[:, 1], s=12, c="white", label="deaths")
        plt.scatter(pumps[:, 0], pumps[:, 1], s=140, marker="P", c="#ffb454", label="pumps")
        plt.legend(loc="upper right"); plt.title("Nearest-pump regions: a Voronoi tessellation")
        plt.show()
        ''',
        intro='Made-up data in the spirit of Snow’s map, not his records.',
        predict=('Which pump’s region will hold the most deaths?', ['pump 0', 'pump 1', 'pump 2', 'pump 3'], 0, 'The outbreak was placed around pump 0, so most deaths are closer to it than to any other pump.'),
        investigate=[('Is this clustering?', 'It is the assignment half of clustering: every point joins the region of its nearest centre. Snow chose the centres (the pumps) himself; K-means, coming next in the module, also moves its K centres to fit the data.'),
                     ('Why is the square root skipped for the background map?', 'Only the nearest pump matters there, and squaring does not change which pump is nearest.')]),
    key('''<p><b>Three families of clustering algorithms.</b> <b>K-means</b> finds points close to K centroids, where K is given by the user. <b>DBSCAN</b> (Density-Based Spatial Clustering of Applications with Noise) finds core regions of high density and expands clusters from them. <b>Hierarchical clustering</b>, agglomerative or divisive, produces a hierarchy of clusters. Different algorithms on the same data give different results.</p>
    <p><b>Hard clustering</b>: each object belongs to exactly one cluster, as a perceptron gives exactly one class. <b>Soft clustering</b>: objects belong to several clusters, with probabilities, as logistic regression gives a probability.</p>'''),
    code('Hard and soft assignments', '''
        from sklearn.datasets import make_blobs
        from sklearn.cluster import KMeans
        from sklearn.mixture import GaussianMixture
        X, _ = make_blobs(n_samples=300, centers=[[0, 0], [4, 0]], cluster_std=1.2, random_state=0)   #: Two overlapping groups; the true labels are thrown away.
        km = KMeans(n_clusters=2, n_init=10, random_state=0).fit(X)          #: K = 2, chosen by us.
        gm = GaussianMixture(n_components=2, random_state=0).fit(X)         #: A soft method, among the next steps in the clustering lecture.
        probe = np.array([[0, 0], [2, 0], [4, 0]])
        print("hard labels:", km.predict(probe))                             #: One cluster number per point.
        print("soft memberships:")
        print(gm.predict_proba(probe).round(2))                              #: One probability per cluster; each row adds up to 1.
        ''',
        predict=('What soft membership do you expect for the point (2, 0), halfway between the two groups?', 'Something near 0.5 and 0.5 (here about 0.4 and 0.6): it could belong to either group, which a hard label of 0 or 1 cannot express. The cluster numbers themselves are arbitrary: 0 and 1 could swap.')),
    code('Different algorithms, same data, different results', '''
        from sklearn.datasets import make_moons
        from sklearn.cluster import DBSCAN, AgglomerativeClustering
        from sklearn.metrics import adjusted_rand_score
        Xm, ym = make_moons(n_samples=300, noise=0.06, random_state=1)      #: Two interlocking half-moons.
        models = {"K-means": KMeans(n_clusters=2, n_init=10, random_state=0),
                  "DBSCAN": DBSCAN(eps=0.2, min_samples=5),
                  "hierarchical (single)": AgglomerativeClustering(n_clusters=2, linkage="single")}
        fig, axes = plt.subplots(1, 3, figsize=(10, 3.2))
        for ax, (name, model) in zip(axes, models.items()):
            labels = model.fit_predict(Xm)
            score = adjusted_rand_score(ym, labels)                         #: We secretly know the true moons: 1.00 means the same grouping.
            ax.scatter(Xm[:, 0], Xm[:, 1], c=labels, s=10)
            ax.set_title(f"{name}: {score:.2f}")
            ax.set_xticks([]); ax.set_yticks([])
            print(f"{name:>21}: agreement with the true moons {score:.2f}")
        plt.show()
        ''',
        predict=('Which methods will recover the two moons?', ['K-means only', 'DBSCAN and single linkage', 'all three', 'none of them'], 1,
                 'K-means gives each point to the nearer of two centres, so it cuts straight across both moons. DBSCAN follows dense regions and single linkage chains neighbours together, so both trace the curved shapes.'),
        investigate=[('In real unsupervised work you would not have `ym`. How could you judge the result then?', 'With quality measures such as cohesion and separation (below), by trying several algorithms and settings, and above all by asking someone who knows the data whether the groups make sense.')]),
    key('''<p><b>Key ingredients for clustering.</b> First, <b>what data is represented, and how</b>. The lecture’s example is the UK government’s ethnic-group categories for surveys: the categories chosen decide which groups can ever be found (see <i>Data Feminism</i> by D’Ignazio and Klein, chapter 4, “What gets counted counts”). Second, the <b>similarity or distance metric</b>, such as the Euclidean distance.</p>
    <p><b>Can you trust a clustering?</b> You need a measure of how good it is: <b>intra-cluster cohesion</b> (compactness: points in the same cluster are near each other), <b>inter-cluster separation</b> (isolation: points in different clusters are far apart) and, in many applications, <b>expert judgement</b>: get someone to check whether it is right.</p>'''),
    code('Scoring a clustering: cohesion and separation', '''
        def cohesion(X, labels):
            """Average distance from each point to its own cluster's centroid (lower is better)."""
            return np.mean([np.linalg.norm(X[labels == k] - X[labels == k].mean(axis=0), axis=1).mean() for k in np.unique(labels)])

        def separation(X, labels):
            """Smallest distance between two cluster centroids (higher is better)."""
            cents = np.array([X[labels == k].mean(axis=0) for k in np.unique(labels)])
            d = np.sqrt(((cents[:, None] - cents[None]) ** 2).sum(axis=2))
            return d[np.triu_indices(len(cents), 1)].min()

        X3, _ = make_blobs(n_samples=150, centers=3, cluster_std=0.8, random_state=4)
        good = KMeans(n_clusters=3, n_init=10, random_state=0).fit_predict(X3)
        bad = np.random.default_rng(0).integers(0, 3, size=len(X3))       #: Random cluster numbers, for comparison.
        for name, lab in [("K-means", good), ("random labels", bad)]:
            print(f"{name:>13}: cohesion {cohesion(X3, lab):.2f}, separation {separation(X3, lab):.2f}")
        ''',
        predict=('With random labels, what happens to the separation?', ['it rises', 'it drops towards 0', 'it stays the same'], 1,
                 'Each random group mixes all three blobs, so every group’s centroid lands near the middle of the data and the centroids almost coincide.')),
    make('Write <code>nearest_centre(points, centres)</code> that returns, for every point, the index of its closest centre (the Voronoi assignment). Use broadcasting and <code>argmin</code>, not a Python loop.',
         '''
         def nearest_centre(points, centres):
             return np.zeros(len(points), dtype=int)

         print(nearest_centre(np.array([[0, 0], [9, 9], [5, 0]]), np.array([[0, 1], [10, 10], [6, 1]])))''',
         ['`points[:, None, :] - centres[None, :, :]` has shape (points, centres, 2).', 'Square, sum over the last axis, then take `argmin(axis=1)`. The square root is not needed to find the nearest.'],
         '''
         def nearest_centre(points, centres):
             d2 = ((points[:, None, :] - centres[None, :, :]) ** 2).sum(axis=2)
             return d2.argmin(axis=1)

         print(nearest_centre(np.array([[0, 0], [9, 9], [5, 0]]), np.array([[0, 1], [10, 10], [6, 1]])))''',
         test='''
         assert list(nearest_centre(np.array([[0, 0], [9, 9], [5, 0]]), np.array([[0, 1], [10, 10], [6, 1]]))) == [0, 1, 2]
         assert list(nearest_centre(pumps, pumps)) == [0, 1, 2, 3]'''),
    explain('A clustering of your customers found three groups. How would you decide whether to trust it?',
            'Check cohesion (are the members of each group close together?) and separation (are the groups far apart?). Ask whether the result depends on how the data were represented and on the distance metric: try other features, scalings and algorithms, since different algorithms give different results on the same data. Finally, show the groups to people who know the customers: the algorithm finds groups but never names them, so expert judgement decides whether they mean anything.'),
    quiz(
      mcq('Clustering differs from classification because it…', ['outputs numbers', 'uses no labels', 'needs more data', 'is always hierarchical'], 1, 'It finds groups without being told the right answers.'),
      mcq('John Snow divided London into regions by nearest water pump. This is a…', ['decision tree', 'Voronoi tessellation', 'dendrogram', 'confusion matrix'], 1, 'Each region holds the places closest to one point of interest.'),
      mcq('Soft clustering is like which supervised model?', ['the perceptron', 'logistic regression', 'linear regression', 'a decision tree'], 1, 'Both give probabilities rather than one hard answer.'),
      card('Two key ingredients of any clustering?', 'What data is represented and how, and the similarity (distance) metric.'),
      card('Cohesion vs separation?', 'Cohesion (compactness): points in the same cluster are near each other. Separation (isolation): points in different clusters are far apart.'),
      mcq('In K-means, who chooses K?', ['the algorithm', 'the user', 'the data', 'nobody'], 1, 'K is given by the user.'),
      card('Name three real uses of unsupervised learning.', 'Customer segmentation; spotting fraud or bots; identifying new species; creating classes for a classifier; also topic modelling and community detection.'),
      mcq('The slide’s formula Σ (xᵢ − yᵢ)² is…', ['the Euclidean distance', 'the squared Euclidean distance', 'the L1 distance', 'a probability'], 1, 'The Euclidean distance takes the square root of that sum.'),
    ),
  ],
  summary='Supervised vs unsupervised learning, distances, John Snow’s Voronoi map, hard and soft clustering, and judging a clustering.',
  decks=['ml-com1011-l-unsupervisedlearning'])

# ---------------------------------------------------------------- 14
lesson('ml-hierarchical', 'ml', 'Hierarchical clustering and DBSCAN', 40,
  'COM1011 Week 8: Hierarchical clustering and DBSCAN lecture',
  ['hierarchical', 'agglomerative', 'divisive', 'bottom-up', 'top-down', 'dendrogram', 'singleton', 'linkage', 'single linkage', 'complete linkage',
   'average linkage', 'centroid linkage', 'Ward', 'distance matrix', 'cutoff', 'elbow', 'scipy', 'DBSCAN', 'density', 'eps', 'MinPts',
   'min_samples', 'core point', 'border point', 'noise', 'hyperparameter'],
  ['Build a dendrogram bottom-up from a distance matrix, by hand and with scipy',
   'Compute single, complete and average linkage between two clusters',
   'Explain why brute force fails by counting the possible dendrograms',
   'Classify points as core, border or noise, and see how eps and MinPts change DBSCAN'],
  [
    text('''<p>We like organising things hierarchically: languages that are alike sit on the same branch, and biologists arrange living things in a tree of life. <b>Hierarchical clustering</b> represents degrees of similarity as a tree, which is great if the data really has an underlying tree structure, and lets you partition the data at different levels. The tree is drawn as a <b>dendrogram</b> (dendro = tree): every node is a cluster, and clusters with a single member are <b>singletons</b>. You can build it <b>bottom-up</b> (agglomerative: start with every item in its own cluster and repeatedly merge the best pair) or <b>top-down</b> (divisive: keep splitting).</p>'''),
    prime('Two clusters, {Lisa, Marge} and {Patty, Selma}. The four distances between their members are 4, 4, 3 and 3. What is their complete-linkage distance?', ['3', '3.5', '4', '14'], 2,
          'Complete linkage uses the farthest pair (Lisa–Patty, 4). Single linkage would give 3 and average linkage 3.5.'),
    key('''<table class="tbl"><tr><th>Linkage</th><th>Distance between two clusters</th><th>Note on the slides</th></tr>
    <tr><td>Single</td><td>between the two closest members</td><td>can create long, chain-like clusters; sensitive to noise</td></tr>
    <tr><td>Complete</td><td>between the two farthest members</td><td>tends to break large clusters into two or more</td></tr>
    <tr><td>Average</td><td>the average over all pairs of members</td><td>a lot of comparisons</td></tr>
    <tr><td>Centroid</td><td>between the two centroids</td><td>biased towards spherical clusters</td></tr>
    <tr><td>Ward’s method</td><td>merge the pair that increases the total squared distance to the centroids the least</td><td>also biased towards spherical clusters</td></tr></table>
    <p>Two wording notes. One slide calls single linkage “simple linkage”; the usual name, used in the slides’ own table and in scipy and scikit-learn, is <b>single</b>. And the slide says Ward merges two clusters “only if it reduces the total distance from the centroids”: a merge can only increase that total, so Ward chooses the merge that increases it least.</p>'''),
    code('The slides’ example, merge by merge', '''
        import numpy as np
        D = np.array([[ 0,  2,  6, 10,  9],
                      [ 2,  0,  3,  9,  8],
                      [ 6,  3,  0,  7,  5],
                      [10,  9,  7,  0,  4],
                      [ 9,  8,  5,  4,  0]], dtype=float)    #: The distance matrix from the slides, points 1 to 5.

        def single(a, b):
            return min(D[i - 1, j - 1] for i in a for j in b)    #: Single linkage: the closest pair across the two clusters.

        clusters = [[1], [2], [3], [4], [5]]                     #: Start: every point is a singleton.
        while len(clusters) > 1:
            pairs = [(single(a, b), i, j) for i, a in enumerate(clusters) for j, b in enumerate(clusters) if i < j]
            d, i, j = min(pairs)                                 #: The two closest clusters…
            print(f"merge {clusters[i]} and {clusters[j]} at distance {d:g}")
            merged = sorted(clusters[i] + clusters[j])
            clusters = [c for k, c in enumerate(clusters) if k not in (i, j)] + [merged]   #: …become one cluster.
        ''',
        predict=('After merging 1 and 2, which merge comes next?', ['3 joins {1, 2}', '4 and 5', '3 and 5', '1 and 3'], 0,
                 'With single linkage, d({1, 2}, 3) = min(6, 3) = 3, the smallest entry in the updated matrix. Then 4 and 5 merge at 4, and everything joins at 5.'),
        investigate=[('Why recompute from the original matrix instead of updating it, as the slides do?', 'For single, complete and average linkage, the distance between two clusters depends only on the original point-to-point distances, so the answers match the slides’ updated matrices. Updating is faster; recomputing is easier to read.')],
        modify=[('Switch to complete linkage. Does the order of merges change?', 'Use `max` instead of `min` in the linkage function.', '''
                def complete(a, b):
                    return max(D[i - 1, j - 1] for i in a for j in b)

                clusters = [[1], [2], [3], [4], [5]]
                while len(clusters) > 1:
                    pairs = [(complete(a, b), i, j) for i, a in enumerate(clusters) for j, b in enumerate(clusters) if i < j]
                    d, i, j = min(pairs)
                    print(f"merge {clusters[i]} and {clusters[j]} at distance {d:g}")
                    clusters = [c for k, c in enumerate(clusters) if k not in (i, j)] + [sorted(clusters[i] + clusters[j])]''')]),
    code('The same dendrogram with scipy', '''
        from scipy.cluster.hierarchy import linkage, dendrogram
        from scipy.spatial.distance import squareform
        import matplotlib.pyplot as plt
        Z = linkage(squareform(D), method="single")    #: squareform turns the square matrix into the condensed list of pairwise distances that scipy expects.
        print(Z)                                        #: Each row: the two clusters merged, the merge distance, the size of the new cluster.
        dendrogram(Z, labels=[1, 2, 3, 4, 5])
        plt.ylabel("merge distance"); plt.title("Single linkage on the slides' matrix")
        plt.show()
        ''',
        investigate=[('What does the row `[2, 5, 3, 3]` mean?', 'Merge point 3 (scipy counts from 0, so it is index 2) with cluster 5, the cluster made in row 0 from points 1 and 2, at distance 3, giving a cluster of 3 points. New clusters are numbered from n = 5 upwards.')]),
    code('Why not try every dendrogram?', '''
        def dendrograms(n):
            count = 1
            for k in range(3, 2 * n - 2, 2):    #: (2n − 3)!! = 1 × 3 × 5 × … × (2n − 3)
                count *= k
            return count

        for n in [2, 3, 4, 5, 10, 20]:
            print(f"{n:>2} leaves: {dendrograms(n):,} dendrograms")
        ''',
        predict=('The slide stops at 10 leaves, with 34,459,425 dendrograms. About how many are there for 20 leaves?', ['about 70 million', 'about 10¹²', 'about 10²¹', 'about 10¹⁰⁰'], 2,
                 '37 × 35 × … × 3 ≈ 8.2 × 10²¹. Greedy merging needs only n − 1 merges, which is why the bottom-up method is used instead of brute force.'),
        investigate=[('Why is the answer to the slide’s maths challenge a product of odd numbers?', 'A dendrogram with n − 1 leaves has 2n − 3 nodes. A new leaf can be attached on the branch above any of them (including above the root), so there are 2n − 3 choices: count(n) = (2n − 3) × count(n − 1), with count(2) = 1.')]),
    code('Real data: blobs, a dendrogram and a cutoff', '''
        from sklearn.datasets import make_blobs
        from scipy.cluster.hierarchy import fcluster
        X_blobs, _ = make_blobs(n_samples=200, centers=4, cluster_std=0.9, random_state=3)
        X_small = X_blobs[:40]                                     #: A smaller subset keeps the dendrogram readable, as on the slide.
        Z = linkage(X_small, method="average", metric="euclidean")
        plt.figure(figsize=(8, 4))
        dendrogram(Z, no_labels=True)
        plt.axhline(4.5, ls="--", c="#7df0b0")                     #: A cutoff: each vertical line it crosses is one cluster.
        plt.title("Dendrogram (average linkage)"); plt.ylabel("distance")
        plt.show()
        for cut in [2, 4.5, 8, 12]:
            labels = fcluster(Z, t=cut, criterion="distance")      #: Cut the tree at this height.
            print(f"cut at {cut:>4}: {labels.max()} clusters")
        ''',
        predict=('Raising the cutoff line gives…', ['more clusters', 'fewer clusters', 'the same clusters'], 1,
                 'A higher cut crosses fewer vertical lines: clusters that merged below the line count as one.'),
        investigate=[('Here any cut between about 2.8 and 6.6 gives the same four clusters. What does that long gap tell you?', 'The four blobs are far apart compared with the distances inside them, so four is a natural answer. With most real data the gaps are less clear and several cutoffs are defensible; the slide’s elbow plot is one way to choose.')]),
    key('''<p><b>DBSCAN</b> handles clusters that vary in shape and size, with noise in between. Core idea: for any point in a cluster, the local density around it must exceed a threshold, so clusters are dense regions of arbitrary shape. Density is set by two <b>hyperparameters</b> (parameters chosen by the user before fitting a model): <b>eps</b> (epsilon), the radius of the neighbourhood, and <b>MinPts</b>, the minimum number of points within that radius.</p>
    <ul><li>A <b>core point</b> has more than MinPts points within eps: it sits in the interior of a cluster.</li>
    <li>A <b>border point</b> has fewer than MinPts within eps, but lies in the neighbourhood of a core point.</li>
    <li>A <b>noise point</b> is neither.</li></ul>
    <p>All points in a cluster can be reached from each other through steps of size eps. DBSCAN resists noise and handles clusters of different shapes and sizes, but eps and MinPts interact and can be hard to choose, and it struggles when clusters have different densities.</p>'''),
    code('Core, border and noise, by hand and with scikit-learn', '''
        pts = np.array([[1.0, 1.0], [1.2, 1.1], [0.9, 1.3], [1.1, 0.8], [1.4, 1.2],   #: A dense clump…
                        [1.9, 1.3],                                                  #: …a point on its edge…
                        [4.0, 4.0]])                                                 #: …and a loner.
        eps, min_pts = 0.6, 4
        dist = np.sqrt(((pts[:, None] - pts[None]) ** 2).sum(axis=2))
        within = dist <= eps
        neighbours = within.sum(axis=1)                         #: Points within eps, counting the point itself, as scikit-learn does.
        core = neighbours >= min_pts
        border = ~core & (within & core[None, :]).any(axis=1)  #: Not core, but within eps of at least one core point.
        for i in range(len(pts)):
            kind = "core" if core[i] else "border" if border[i] else "noise"
            print(i, pts[i], neighbours[i], kind)
        from sklearn.cluster import DBSCAN
        db = DBSCAN(eps=eps, min_samples=min_pts).fit(pts)
        print("labels:", db.labels_, " core points:", db.core_sample_indices_)   #: Label −1 marks noise.
        ''',
        predict=('What kind of point is number 5, at (1.9, 1.3)?', ['core', 'border', 'noise'], 1,
                 'Only one other point (number 4) lies within 0.6 of it, so it is not core. But number 4 is core, so point 5 joins the cluster as a border point.'),
        investigate=[('The slide says a core point has “more than” MinPts points within eps; scikit-learn counts the point itself and asks for at least min_samples. Does it matter?', 'Only by one or two in the count, but it changes which value of MinPts gives a particular clustering. Whenever you read a definition or a library’s documentation, check exactly how the count is made.')],
        modify=[('Set `min_pts = 7` and redo the classification. What happens?', 'No point has 7 neighbours within 0.6.', '''
                core = neighbours >= 7
                border = ~core & (within & core[None, :]).any(axis=1)
                print(core.sum(), "core points,", border.sum(), "border points")
                print(DBSCAN(eps=eps, min_samples=7).fit(pts).labels_)''')]),
    code('eps matters: DBSCAN on noisy moons', '''
        from sklearn.datasets import make_moons
        Xn, _ = make_moons(n_samples=300, noise=0.07, random_state=2)
        Xn = np.vstack([Xn, np.random.default_rng(0).uniform(-1.5, 2.5, size=(20, 2))])   #: Add 20 scattered noise points.
        for e in [0.05, 0.1, 0.2, 0.3, 1.0]:
            labels = DBSCAN(eps=e, min_samples=5).fit_predict(Xn)
            n_clusters = len(set(labels)) - (1 if -1 in labels else 0)    #: −1 is noise, not a cluster.
            print(f"eps = {e:<4}  clusters: {n_clusters:>2}   noise points: {(labels == -1).sum():>3}")
        labels = DBSCAN(eps=0.2, min_samples=5).fit_predict(Xn)
        plt.scatter(Xn[:, 0], Xn[:, 1], c=labels, s=12)
        plt.title("DBSCAN with eps = 0.2, MinPts = 5 (noise in the darkest colour)")
        plt.show()
        ''',
        predict=('What happens when eps is very large (1.0)?', ['every point becomes noise', 'everything merges into one cluster', 'exactly two clusters'], 1,
                 'With a huge radius, every point can be reached from the others through core points, so the two moons fuse. With a tiny eps, almost everything is noise.')),
    bug('A dendrogram from the wrong input', '''
        from scipy.cluster.hierarchy import linkage
        Z = linkage(D, method="single")
        print(Z[:, 2])''',
        'Read the warning. When you already have distances, in what form does `linkage` expect them?',
        '''
        from scipy.cluster.hierarchy import linkage
        from scipy.spatial.distance import squareform
        Z = linkage(squareform(D), method="single")
        print(Z[:, 2])''',
        'Given a square 2D array, `linkage` treats each row as a point with five coordinates and computes new distances between the rows, so the merge heights are wrong. Pass the condensed list from `squareform(D)`, or the original observations.',
        test='assert list(Z[:, 2]) == [2.0, 3.0, 4.0, 5.0]'),
    make('Write <code>linkage_distance(A, B, method)</code> for two clusters given as arrays of points (one row per point). Return the Euclidean single, complete or average linkage distance, for <code>method</code> equal to <code>"single"</code>, <code>"complete"</code> or <code>"average"</code>.',
         '''
         def linkage_distance(A, B, method):
             return 0.0

         A = np.array([[0, 0], [0, 1]])
         B = np.array([[3, 0], [4, 1]])
         print([round(float(linkage_distance(A, B, m)), 3) for m in ["single", "complete", "average"]])''',
         ['Build all the cross-distances with broadcasting: `A[:, None, :] - B[None, :, :]`.', 'Then return their `min()`, `max()` or `mean()`.'],
         '''
         def linkage_distance(A, B, method):
             d = np.sqrt(((A[:, None, :] - B[None, :, :]) ** 2).sum(axis=2))
             return {"single": d.min(), "complete": d.max(), "average": d.mean()}[method]

         A = np.array([[0, 0], [0, 1]])
         B = np.array([[3, 0], [4, 1]])
         print([round(float(linkage_distance(A, B, m)), 3) for m in ["single", "complete", "average"]])''',
         test='''
         A = np.array([[0, 0], [0, 1]]); B = np.array([[3, 0], [4, 1]])
         assert abs(linkage_distance(A, B, "single") - 3) < 1e-9
         assert abs(linkage_distance(A, B, "complete") - 17 ** 0.5) < 1e-9
         assert abs(linkage_distance(A, B, "average") - (3 + 17 ** 0.5 + 10 ** 0.5 + 4) / 4) < 1e-9'''),
    explain('When would you choose DBSCAN rather than hierarchical clustering, and when not?',
            'DBSCAN suits clusters of arbitrary shape with noise around them: it labels outliers as noise and does not need the number of clusters in advance. It struggles when clusters have very different densities, and eps and MinPts can be hard to set. Hierarchical clustering suits data with a natural tree structure (languages, species) and lets you choose the level after seeing the dendrogram; but it needs all pairwise distances, which is costly for large data, single linkage chains through noise, and centroid and Ward linkage favour round clusters.'),
    quiz(
      mcq('Agglomerative clustering starts with…', ['one cluster holding everything', 'every point in its own cluster', 'K random centroids', 'the densest region'], 1, 'Bottom-up: singletons merge step by step.'),
      mcq('Which linkage tends to create long, chain-like clusters?', ['single', 'complete', 'average', 'Ward'], 0, 'One close pair is enough to join two clusters.'),
      card('What is a dendrogram?', 'A tree diagram of a hierarchy of clusters: each node is a cluster, the height of a merge is the distance at which two clusters joined, and one-member clusters are singletons.'),
      mcq('How many dendrograms are there with 4 leaves?', ['4', '12', '15', '24'], 2, '(2 × 4 − 3)!! = 5 × 3 × 1 = 15, as in the slide’s table.'),
      card('Core, border and noise points?', 'Core: enough points (MinPts) within eps. Border: not core, but within eps of a core point. Noise: neither.'),
      mcq('Which is a weakness of DBSCAN?', ['it cannot find non-spherical clusters', 'it struggles when clusters have very different densities', 'it needs the number of clusters in advance', 'it cannot label noise'], 1, 'One eps cannot suit both dense and sparse clusters.'),
      card('What is a hyperparameter?', 'A setting chosen by the user before fitting a model, such as eps and MinPts in DBSCAN or K in K-means.'),
      mcq('In scipy’s linkage output, what is the third column?', ['the cluster size', 'the merge distance', 'the cluster label', 'the number of leaves'], 1, 'Columns: the two clusters merged, their distance, and the size of the new cluster.'),
    ),
  ],
  summary='Agglomerative clustering from a distance matrix, linkage choices, dendrograms and cutoffs, then DBSCAN’s core, border and noise points.',
  decks=['ml-com1011-hierarchicalclusteringdbscan'])

# ---------------------------------------------------------------- 15
lesson('ml-compare', 'ml', 'Comparing classifiers: ROC–AUC, cross-validation and a paired t-test', 40,
  'COM1011 Week 8 workshop (Comparing classifiers)',
  ['compare', 'comparing classifiers', 'ROC', 'AUC', 'ROC-AUC', 'roc_auc_score', 'one-vs-rest', 'ovr', 'predict_proba', 'threshold',
   'true positive rate', 'false positive rate', 'stratify', 'random_state', 'LabelEncoder', 'cross-validation', 'k-fold', '10-fold',
   'cross_val_score', 'folds', 'paired', 't-test', 'ttest_rel', 'p-value', 'boxplot', 'interquartile range', 'ConvergenceWarning',
   'random forest', 'SVM'],
  ['Prepare a fair comparison: stratified split, fixed random_state, numeric features',
   'Explain what ROC–AUC measures and compute it for three classes with one-vs-rest',
   'Compare models with 10-fold cross-validation and a paired t-test, and report the result honestly',
   'Read a boxplot of fold scores: median, IQR, whiskers and outliers'],
  [
    text('''<p>The Week 8 workshop asks a practical question: given several classifiers, which is best, and is the difference real? It trains logistic regression, a decision tree, a random forest and an SVM on the Palmer penguins data, scores them with ROC–AUC on one split, repeats the comparison with 10-fold cross-validation, runs a paired t-test on the best pair, and draws a boxplot of the fold scores.</p>
    <p>The in-page Python cannot run that notebook as it is: the penguins come from seaborn, which is not available here. So the code below runs the same steps on scikit-learn’s built-in <b>wine</b> data: 178 wines of three types from one region of Italy, with 13 chemical measurements. Like the penguins it has three classes and features on very different scales. Your notebook’s penguin results are quoted alongside.</p>
    <p>Two of the four models are new. A <b>random forest</b> grows many decision trees, each on a random sample of the rows and choosing among a random subset of the features at every split, and averages their predictions. An <b>SVM with an RBF kernel</b> draws a flexible boundary based on similarity to training points; similarity is measured by distance, so features with large units dominate unless you scale them.</p>'''),
    prime('Model A scores 0.95 and model B 0.93 on one test split. What can you conclude?', ['A is the better model', 'Not much yet: another split could reverse the order', 'B is better, because it is less overfitted', 'They are the same model'], 1,
          'One split gives one noisy number per model. The workshop repeats the comparison over ten folds and then asks whether the fold-by-fold differences are bigger than chance would produce.'),
    key('''<p>A classifier that outputs a <b>score</b>, such as a probability, needs a <b>threshold</b> to turn it into a yes/no decision. The <b>ROC curve</b> plots the true positive rate, TP/(TP + FN) (the recall, or sensitivity, from Week 5), against the false positive rate, FP/(FP + TN) (1 − specificity), as the threshold moves from strict to lenient. <b>AUC</b>, the area under that curve, sums it up in one number: 1.0 is perfect and 0.5 is random guessing. It equals the probability that a randomly chosen positive gets a higher score than a randomly chosen negative.</p>
    <p><b>One-vs-rest</b> (<code>multi_class="ovr"</code>, or the scoring name <code>"roc_auc_ovr"</code>): with three classes, compute one AUC for each class against the other two, then average them.</p>
    <p>A fair comparison gives every model the same data: a <b>stratified</b> split (<code>stratify=y</code> keeps the class shares equal in train and test), a fixed <code>random_state</code> (the same split on every run), <b>10-fold cross-validation</b> (ten scores per model instead of one) and a <b>paired t-test</b> (<code>ttest_rel</code>) on those scores, because both models were scored on the same ten folds.</p>'''),
    code('Part 1: a stratified, reproducible split', '''
        import numpy as np
        import pandas as pd
        from sklearn.datasets import load_wine
        from sklearn.model_selection import train_test_split
        X, y = load_wine(return_X_y=True, as_frame=True)          #: 178 wines, 13 measurements; the target is the wine type, 0, 1 or 2.
        print(X.shape, "wines per class:", np.bincount(y))
        print(X[["proline", "hue"]].describe().loc[["min", "max"]])   #: Two features on very different scales.
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42, stratify=y)   #: The workshop's split settings.
        print(len(X_train), "train,", len(X_test), "test")
        print("class shares, all data:", (np.bincount(y) / len(y)).round(2))
        print("class shares, test set:", (np.bincount(y_test) / len(y_test)).round(2))
        ''',
        predict=('test_size=0.25 of 178 wines: how many land in the test set?', ['25', '44', '45', '134'], 2,
                 'scikit-learn rounds the test size up: 0.25 × 178 = 44.5, so 45 test wines and 133 for training.'),
        investigate=[('Why set `random_state=42`?', 'It fixes the shuffle, so every run, and every model, gets exactly the same split. Without it the scores change each time the notebook runs, as the workshop’s answer says.'),
                     ('What could go wrong without `stratify=y` on a small dataset?', 'By bad luck the test set could hold very few wines of one type, so that class’s score would rest on a handful of examples. Stratifying keeps the class shares the same in both parts.')]),
    code('The penguins’ Part 1: encoding text columns', '''
        from sklearn.preprocessing import LabelEncoder
        peng = pd.DataFrame({"species": ["Adelie"] * 5, "island": ["Torgersen"] * 5,
                             "bill_length_mm": [39.1, 39.5, 40.3, 36.7, 39.3],
                             "sex": ["Male", "Female", "Female", "Female", "Male"]})   #: The first rows of the workshop's penguins table.
        print(LabelEncoder().fit_transform(peng["sex"]))                 #: Alphabetical codes: Female → 0, Male → 1.
        islands = pd.Series(["Biscoe", "Dream", "Torgersen"])            #: The three islands in the full data.
        print(LabelEncoder().fit_transform(islands))                     #: 0, 1, 2: an order and spacing that mean nothing.
        print(pd.get_dummies(islands, dtype=int))                        #: One-hot: one 0/1 column per island, and no fake order.
        ''',
        investigate=[('Why encode at all?', 'Most scikit-learn models need numbers, so text columns such as island and sex must become numbers first, as the workshop’s answer says.'),
                     ('LabelEncoder turns the islands into 0, 1 and 2. Why could that mislead logistic regression or an SVM?', 'The codes suggest that Dream lies “between” Biscoe and Torgersen, at equal distances. Trees only split on thresholds and cope, but models that weigh or measure distances read the codes as amounts. scikit-learn’s documentation says LabelEncoder is meant for the target y; for input features, one-hot encoding (`OneHotEncoder` or `pd.get_dummies`) avoids the fake order.')]),
    code('Parts 2 and 3: four classifiers, ROC–AUC on one split', '''
        from sklearn.linear_model import LogisticRegression
        from sklearn.tree import DecisionTreeClassifier
        from sklearn.ensemble import RandomForestClassifier
        from sklearn.svm import SVC
        from sklearn.metrics import roc_auc_score
        models = {
            "Logistic Regression": LogisticRegression(max_iter=1000),
            "Decision Tree": DecisionTreeClassifier(random_state=42),
            "Random Forest": RandomForestClassifier(random_state=42),
            "SVM (RBF kernel)": SVC(probability=True, random_state=42),    #: probability=True lets the SVM give class probabilities.
        }
        for name, model in models.items():
            model.fit(X_train, y_train)
            y_proba = model.predict_proba(X_test)                       #: One column per class: the model's probability for each type.
            auc = roc_auc_score(y_test, y_proba, multi_class="ovr")     #: One AUC per class against the rest, then their average.
            print(f"{name:20s} | ROC-AUC: {auc:.3f}")
        ''',
        predict=('Which model will score worst?', ['Logistic regression', 'Decision tree', 'Random forest', 'SVM'], 3,
                 'The RBF SVM measures distances, and proline (278 to 1,680) swamps features such as hue (about 0.5 to 1.7). Your penguin notebook shows the same pattern, SVM 0.929, with body mass in grams doing the swamping.'),
        investigate=[('Your notebook printed 1.000, 0.976, 1.000 and 0.929 for the penguins. Does a tie at 1.000 on 84 test penguins settle anything?', 'Logistic regression and the random forest tie, as the workshop’s answer notes. But with one small test set, a tie or a gap of a few thousandths can come from which penguins happened to land in the test set. That is why Part 4 uses cross-validation.'),
                     ('What does the ConvergenceWarning mean?', 'The lbfgs optimiser inside logistic regression reached its iteration limit (max_iter = 1000) before the loss stopped improving, so the coefficients may not be the best ones. Scaling the features, or raising max_iter, usually fixes it, as the workshop’s answer says.'),
                     ('What does the FutureWarning about `probability` say?', 'scikit-learn 1.9, which built these saved outputs, deprecated `SVC(probability=True)` and suggests `CalibratedClassifierCV(SVC(), ensemble=False)` instead. The in-page Python runs an older scikit-learn, so you will not see the warning when you run the cell here, and the workshop code still works.')],
        modify=[('Put a `StandardScaler` in front of the SVM and score it again.', 'Use `make_pipeline(StandardScaler(), SVC(probability=True, random_state=42))`.', '''
                from sklearn.pipeline import make_pipeline
                from sklearn.preprocessing import StandardScaler
                svm_scaled = make_pipeline(StandardScaler(), SVC(probability=True, random_state=42)).fit(X_train, y_train)
                print(round(roc_auc_score(y_test, svm_scaled.predict_proba(X_test), multi_class="ovr"), 3))''')]),
    code('What AUC measures: ranking positives above negatives', '''
        from sklearn.metrics import roc_curve
        import matplotlib.pyplot as plt
        is_2 = (y_test == 2).to_numpy()                       #: One-vs-rest for type 2: the positives are type-2 wines.
        for name in ["Logistic Regression", "Decision Tree", "SVM (RBF kernel)"]:
            score = models[name].predict_proba(X_test)[:, 2]  #: Each model's probability of type 2.
            fpr, tpr, thresholds = roc_curve(is_2, score)     #: One (FPR, TPR) point per threshold.
            pos, neg = score[is_2], score[~is_2]
            ranked = np.mean(pos[:, None] > neg[None, :]) + 0.5 * np.mean(pos[:, None] == neg[None, :])   #: Share of (positive, negative) pairs in the right order; ties count half.
            print(f"{name:20s} AUC for type 2: {roc_auc_score(is_2, score):.3f}   pairs in the right order: {ranked:.3f}")
            plt.plot(fpr, tpr, label=name)
        plt.plot([0, 1], [0, 1], "--", label="random guessing (AUC 0.5)")
        plt.xlabel("false positive rate"); plt.ylabel("true positive rate")
        plt.title("ROC curves: type 2 against the rest"); plt.legend()
        plt.show()
        ''',
        predict=('Where does the ROC curve of a perfect classifier run?', ['along the diagonal', 'straight up the left edge, then along the top', 'along the bottom, then up the right edge', 'it depends on the threshold'], 1,
                 'A perfect model scores every positive above every negative, so some threshold catches all the positives (TPR 1) before any negative (FPR 0). The area under it is 1.'),
        investigate=[('Why does AUC need `predict_proba`, not `predict`?', 'The curve sweeps a threshold across the scores. `predict` returns final labels, which is a single threshold already applied, so there is nothing left to sweep.'),
                     ('Why is the decision tree’s curve a single corner?', 'Every leaf of the fully grown tree holds training wines of one type, so it outputs probabilities of only 0 or 1. With just two different scores, only one threshold changes anything, so the curve has one corner: the tree’s own false and true positive rates.'),
                     ('Why is the dashed diagonal “random guessing”?', 'Scores that ignore the input flag positives and negatives at the same rate whatever the threshold, so on average TPR = FPR and the area under the curve is 0.5.')]),
    code('Part 4: 10-fold cross-validation', '''
        import warnings
        from sklearn.exceptions import ConvergenceWarning
        from sklearn.model_selection import cross_val_score
        warnings.filterwarnings("ignore", category=ConvergenceWarning)   #: You met both warnings in Part 3. Here they would repeat for every fold.
        warnings.filterwarnings("ignore", category=FutureWarning)
        cv_results = {}
        for name, model in models.items():
            scores = cross_val_score(model, X, y, cv=10, scoring="roc_auc_ovr")   #: Ten fits per model, each scored on the fold it did not see.
            cv_results[name] = scores
            print(f"{name:20s} | Mean AUC: {scores.mean():.3f} ± {scores.std():.3f}")
        ''',
        predict=('Which model’s score will vary most from fold to fold?', ['Logistic regression', 'Decision tree', 'Random forest', 'SVM'], 1,
                 'A single tree is very sensitive to which rows it trains on (high variance, from Week 4), so its fold scores spread out most. Averaging many trees, as the forest does, smooths that out.'),
        investigate=[('With `cv=10` and a classifier, how are the folds made?', 'scikit-learn uses stratified 10-fold splitting without shuffling: each fold keeps the class shares, every wine is tested exactly once, and each model is trained ten times, each time on the other nine folds.'),
                     ('Is it safe to hide warnings like this?', 'Only once you have read them and know what they mean, as with these two from Part 3, and only for the specific kinds you checked. Switching off all warnings blindly can hide a real problem.'),
                     ('The penguin means were 1.000, 0.980, 0.999 and 0.958. What carries over to the wine?', 'The same overall picture: logistic regression and the random forest are almost perfect, while the single tree and the unscaled SVM trail behind.')],
        modify=[('Repeat the comparison with accuracy instead of ROC–AUC. Does the ranking change?', 'Change the `scoring` argument to `"accuracy"`.', '''
                warnings.filterwarnings("ignore", category=ConvergenceWarning)
                warnings.filterwarnings("ignore", category=FutureWarning)
                for name, model in models.items():
                    s = cross_val_score(model, X, y, cv=10, scoring="accuracy")
                    print(f"{name:20s} | Mean accuracy: {s.mean():.3f}")''')]),
    slip('''<p>A slip on the hypothesis-testing slide that introduces this test (Week 7): its code assigns <code>acc_1</code> twice, once marked “# accuracies 1” and once “# accuracies 2”, and then calls <code>stats.ttest_rel(acc_1, acc_2)</code>. The second list should be called <code>acc_2</code>. As printed, Python would stop with a NameError, or quietly use whatever <code>acc_2</code> held before.</p>'''),
    code('Part 5: a paired t-test on the fold scores', '''
        from scipy.stats import ttest_rel
        for a, b in [("Random Forest", "Logistic Regression"), ("Random Forest", "SVM (RBF kernel)")]:
            t_stat, p_val = ttest_rel(cv_results[a], cv_results[b])     #: Compares the two models fold by fold.
            verdict = "significant" if p_val < 0.05 else "not significant"
            print(f"{a} vs {b}: t = {t_stat:.3f}, p = {p_val:.3g} ({verdict} at 0.05)")
        ## Why your penguin notebook printed exactly t = -1.000
        diff = np.zeros(10)
        diff[3] = -0.01                                                #: Nine folds tie (both models score 1.0); one fold differs.
        print(ttest_rel(diff, np.zeros(10)))                           #: t is exactly ±1, however large that one difference is.
        ''',
        predict=('Random forest against logistic regression on the wine: is the difference significant at 0.05?', ['Yes', 'No'], 1,
                 'p is about 0.2: a gap this size would be quite common if the two models were equally good. Random forest against the unscaled SVM is a different story.'),
        investigate=[('Your notebook gave t = −1.000, p = 0.3434 for random forest against logistic regression. What does that tell you?', 'We fail to reject H₀: there is no evidence that the two penguin models differ. That is not proof that they are equal. Logistic regression scored 1.0 on every fold, and the forest’s 0.999 ± 0.003 fits one imperfect fold, which gives exactly t = −1, so there was almost nothing left to compare (a ceiling effect).'),
                     ('Why can a paired test detect differences that two separate averages hide?', 'Some folds are harder than others for every model. Pairing compares the models on the same fold, so the shared difficulty cancels and only the gap between the models is left.')],
        modify=[('Test the decision tree against the random forest.', 'Call `ttest_rel` on their two arrays in `cv_results`.',
                 'print(ttest_rel(cv_results["Random Forest"], cv_results["Decision Tree"]))')]),
    code('Part 6: reading a boxplot of the fold scores', '''
        results_df = pd.DataFrame(cv_results)
        q = results_df.quantile([0.25, 0.5, 0.75]).T                  #: Per model: Q1, the median and Q3.
        q["IQR"] = q[0.75] - q[0.25]
        print(q.round(3))
        plt.figure(figsize=(7, 3.8))
        plt.boxplot(results_df.to_numpy())                            #: One box per column, i.e. per model.
        plt.xticks([1, 2, 3, 4], ["Logistic\\nRegression", "Decision\\nTree", "Random\\nForest", "SVM\\n(RBF)"])
        plt.ylabel("ROC–AUC (10-fold CV)"); plt.title("Classifier comparison")
        plt.show()
        ''',
        investigate=[('Read the plot: what do the line inside a box, the box, the whiskers and the separate points show?', 'The line is the median fold score. The box spans Q1 to Q3, the middle half of the scores, so its height is the IQR. The whiskers reach the most extreme scores within 1.5 × IQR of the box (matplotlib’s default), and points beyond them are drawn on their own as outliers.'),
                     ('What does a box squashed to a single line mean, as in the workshop’s question 1e?', 'Q1, the median and Q3 are (almost) equal: the scores are tightly clustered. Here a model that scores 1.0 on most folds gets a flat box at the top.'),
                     ('How could you check these findings further?', 'Repeat the cross-validation with shuffled folds and other seeds, test on a completely separate set of data, try other metrics such as accuracy or F1, and give the SVM a fair chance by scaling the features inside a pipeline.')]),
    bug('ROC–AUC from hard labels', '''
        model = models["Random Forest"]
        auc = roc_auc_score(y_test, model.predict(X_test), multi_class="ovr")
        print(auc)''',
        'ROC–AUC sweeps a threshold over scores. What does `predict` return?',
        '''
        model = models["Random Forest"]
        auc = roc_auc_score(y_test, model.predict_proba(X_test), multi_class="ovr")
        print(auc)''',
        '`predict` returns final labels (0, 1 or 2), so there is no threshold left to sweep. For three classes, `roc_auc_score` needs the full table of scores from `predict_proba`, one column per class.',
        test='assert abs(auc - roc_auc_score(y_test, models["Random Forest"].predict_proba(X_test), multi_class="ovr")) < 1e-12'),
    explain('The workshop asks which assumptions of the t-test may not hold for cross-validation scores. Answer it, and say what the lecture slide points to instead.',
            'A paired t-test assumes that the paired differences are independent and roughly normal. In 10-fold cross-validation the training sets overlap heavily (any two share eight of the ten folds), so the fold scores are not independent. Dietterich (1998) found that the paired t-test on 10-fold cross-validation scores has a somewhat raised chance of a Type I error, calling a difference significant when there is none. Ten differences are also too few to check normality, and scores stuck at 1.0 are far from normal. The slide links to mlxtend’s 5×2cv paired t-test, Dietterich’s alternative, which runs 2-fold cross-validation five times. Either way, treat the p-value as one piece of evidence, next to the size of the difference.'),
    make('Write <code>compare(a, b, alpha=0.05)</code>. It takes two arrays of fold scores and returns <code>"A better"</code>, <code>"B better"</code> or <code>"no significant difference"</code>, using a paired t-test. Two identical score lists, for which <code>ttest_rel</code> gives <code>nan</code>, must count as no significant difference.',
         '''
         from scipy.stats import ttest_rel
         def compare(a, b, alpha=0.05):
             return ""

         print(compare(cv_results["Random Forest"], cv_results["SVM (RBF kernel)"]))''',
         ['`t, p = ttest_rel(a, b)` gives the statistic and the p-value.', 'If p is not below alpha there is no significant difference. `not p < alpha` is also True when p is nan.',
          'Otherwise the sign of t says which is higher: positive means a is higher on average.'],
         '''
         from scipy.stats import ttest_rel
         def compare(a, b, alpha=0.05):
             t, p = ttest_rel(a, b)
             if not p < alpha:
                 return "no significant difference"
             return "A better" if t > 0 else "B better"

         print(compare(cv_results["Random Forest"], cv_results["SVM (RBF kernel)"]))''',
         test='''
         base = np.array([0.91, 0.93, 0.92, 0.95, 0.94, 0.92, 0.93, 0.94, 0.96, 0.93])
         gap = np.array([0.05, 0.04, 0.06, 0.05, 0.04, 0.05, 0.06, 0.05, 0.04, 0.05])
         assert compare(base + gap, base) == "A better"
         assert compare(base, base + gap) == "B better"
         assert compare(base, base) == "no significant difference"
         assert compare(base, base + np.array([0.01, -0.01] * 5)) == "no significant difference"'''),
    quiz(
      mcq('An ROC–AUC of 0.5 means…', ['the model is right half the time', 'the model ranks positives above negatives no better than chance', 'half the classes are predicted', 'the model is perfect'], 1, 'AUC is the chance that a random positive is scored above a random negative; 0.5 is a coin flip.'),
      mcq('What does `stratify=y` do in `train_test_split`?', ['shuffles the columns', 'keeps the class shares the same in train and test', 'scales the features', 'removes outliers'], 1, 'Each class is split in the same 75/25 ratio.'),
      mcq('With three classes, `multi_class="ovr"` computes…', ['one AUC for each pair of classes', 'one AUC per class against the other two, then their average', 'accuracy instead of AUC', 'the AUC of the largest class only'], 1, 'One-vs-rest, averaged over the classes.'),
      mcq('Why use `ttest_rel` rather than an independent-samples t-test on fold scores?', ['it is faster', 'both models were scored on the same folds, so the scores come in pairs', 'it assumes equal variances', 'it needs fewer folds'], 1, 'Pairing removes the variation caused by easy and hard folds.'),
      mcq('In a boxplot, the height of the box is…', ['the range', 'the standard deviation', 'the interquartile range, Q3 − Q1', 'the mean'], 2, 'The middle half of the scores.'),
      card('What does ROC–AUC measure?', 'How well a model separates the classes across all thresholds: the probability that a random positive is scored above a random negative. 1.0 is perfect, 0.5 is chance.'),
      card('What does a ConvergenceWarning from logistic regression mean?', 'The optimiser hit max_iter before the loss stopped improving. Scale the features or raise max_iter.'),
      card('Comparing two models gives p = 0.34. What do you conclude?', 'We fail to reject H₀: no evidence of a real difference. That is not proof that the models are equal.'),
    ),
  ],
  summary='The Week 8 workshop on wine data: a stratified split, ROC–AUC with one-vs-rest, 10-fold cross-validation, a paired t-test and a boxplot of fold scores.',
  decks=['ml-com1011-l05b-hypothesis-testing'])
