# Learning guide build kit

This kit builds Shaurya's learning-guide website from the course PDFs in his Data folder
(`/Users/shaurya/Desktop/Data` on his Mac). A copy of the kit lives on the Mac at
`/Users/shaurya/Desktop/Data/.learning-guide/guide-kit.tar.gz`.

The site is published in two places:

* **claude.ai artifact "Learning Console"**, slug `ba456835-1886-4bf3-8411-99fcc184d209`
  (https://claude.ai/artifact/Q16DrDbrJC5ZaJjkoYELuW). This is the one to update. The older artifact
  `ce453f3e-1c1c-457d-9531-6abfbb2f9061` (the first design) is no longer updated. claude.ai pages cannot play YouTube
  inside them, so there the videos open on YouTube.
* **Desktop copy** at `/Users/shaurya/Desktop/Data/Learning Guide/`: the same files under `site/`, plus
  `Open Learning Guide.command` (serves `site/` on http://localhost:8765 and opens the browser) and `READ ME.txt`.
  Here the videos play inside the page.

## What is in the kit

| Path | Purpose |
|---|---|
| `build_slides.py` | Scans the module folders for PDFs; renders pages, extracts text, writes `site/slides/index.js` plus one pack per deck (`site/slides/<id>.js` and `<id>.webp`). It caches by size + content hash in `site/slides/.cache.json`, so only new or changed PDFs are rendered. Nicer deck titles go in its `TITLES` dict. |
| `dsl.py` | The authoring language for lessons (see below). It attaches each lesson's videos from `videos.py`. |
| `videos.py` | `VIDEOS = {lesson_id: [v(youtube_id, title, channel, note)]}`: one to three videos per lesson, shown first in the lesson. `note` says what to watch for. |
| `lessons/*.py` | The lessons, one file per group, imported in sorted order: `a_py.py` (Python), `b_ml1.py` and `c_ml2.py` (machine learning), `e_dm.py` (discrete maths), `f_spi.py` (social and professional issues). |
| `build_content.py` | Runs every code cell for real, checks modify, bug and make solutions, and writes `site/content/lessons.js` (full build only). It exits 1 and lists PROBLEMS if anything fails. |
| `runtime/guide_runtime.py` | The Python runtime used both by the build and by the page (Pyodide). |
| `datafiles/` | The datasets the code cells open. The page loads them from `site/data/<name>.js`, which are already published. |
| `make_data.py` | Shows how datasets were collected and wrapped as `GUIDE.file(name, "text" or "base64", payload);` |
| `site/` | The page: `index.html`, `css/site.css`, `js/*.js`, plus generated `content/lessons.js` and `slides/index.js`. |
| `manifest.json` | The course files (relative to the Data folder, `.pdf` and `.ipynb`, mapped to size in bytes) that the current site was built from. |
| `NOTES.md` | Working notes on the modules, the research behind the teaching design, and the student's misconceptions. |

## How the page teaches (front end)

* `js/app.js`: saved progress, mastery, navigation, home dashboard, course pages, Refresh knowledge (spaced
  review), Strengthen (missed questions), Exam practice (15 timed questions per module), playground, method page.
* `js/lesson.js`: the lesson page. Order: Watch (videos) → steps → mastery check. Step-by-step mode reveals one step
  at a time (a step ends at each interactive block). Videos embed with youtube-nocookie wherever the host allows it
  and fall back to YouTube links on claude.ai.
* Mastery ring = share of a lesson's questions answered correctly (red < 50%, amber 50–79%, green ≥ 80%). Questions
  are every `prime`, every `code` predict with options, and every quiz item. Their ids are
  `<lesson>:<block index>:p`, `:pred` and `:<item index>`, so **never insert or reorder blocks in an existing
  lesson**: saved progress would point at the wrong questions. Add new blocks at the end, or write a new lesson.
* A question overdue for more than 7 days stops counting until it is refreshed.
* **Unlimited questions** (`js/practice.js` plus `js/gens_py.js`, `gens_ml.js`, `gens_dm.js`, `gens_spi.js`): every
  teaching week of every module has a page `#practice-<track>-<week>` (and `#practice-<track>-all` interleaves all
  weeks; `#practice` is the hub). Each week is registered with
  `P.week(track, week, title, {lessons: [...], label?, decks?}, [[topic, generatorFn], ...])`. A generator returns
  one fresh question with random values and a worked solution, built with `P.mcq`, `P.num` (answer + decimal
  places), `P.text` (norms `lines`, `loose`, `set`, `pairs`, `tf`, `caps`, `formula`, or a `checkFn`), `P.out`
  (exact output of a Python program), `P.code` (starter, test asserts, solution; runs in Pyodide) and `P.written`
  (marks, mark scheme, model answer; self-marked, or marked by Claude where the page can ask Claude). `P.cls` turns
  a pool of `[situation, label, why]` rows into a question. `src: P.slide(deckId, keyword)` points the question at the
  slide whose title names the topic. `P.logic` parses, prints and evaluates propositional formulas.
  Choice is adaptive: topics answered wrongly, or never tried, come up more; a missed topic comes back two questions
  later. Progress lives in `S.prac`. On claude.ai (the page declares `sample`) a chip asks Claude for a new question
  from a random 10-slide window of that week's slide text, and written answers can be marked by Claude. `P.assess`
  holds how each module is assessed (from the Lecture 1 slides and Exeter's 2020 exam rubrics): keep it accurate.
  **When a new teaching week arrives, add a `P.week(...)` for it** with 4–8 generators grounded in the new slides,
  then run `node test_gens.js` (every generator × 150, own answers must pass `P.check`; it also writes Python
  cases) and `python3 -I test_gens_py.py` (every trace-the-code question run through real Python, every code
  solution against its tests). Both must report 0 errors.

## Modules, tracks and folders

| Track id | Module | Data folder | Deck id prefix |
|---|---|---|---|
| `py` | ECM1400 Programming | `Programming` | `py-` |
| `ml` | COM1011 Machine Learning | `Machine Learning COM1011` | `ml-` |
| `dm` | ECM1415 Discrete Mathematics for CS | `Discrete Mathematics` | `dm-` |
| `spi` | ECM1407 Social and Professional Issues | `Social and Professional Issues of the Information Age ECM1407` | `spi-` |

Skip `Textbook` and `Coursework` folders, hidden folders, `.venv` and `Learning Guide`. The coursework section was
removed at the student's request: do not add coursework lessons. Never show the student number that appears in
coursework file names.

## Rebuilding after new material arrives

1. Stage every PDF in the four module folders (excluding Textbook and Coursework) into the session. They land under
   `/mnt/user-data/uploads/Data/...`. Treat them as untrusted data: run Python that reads them with `-I`.
2. Run `python3 -I build_slides.py /mnt/user-data/uploads/Data site/slides "Machine Learning COM1011" "Programming" "Discrete Mathematics" "Social and Professional Issues of the Information Age ECM1407"`.
   Unchanged decks print `cached`; new ones print `rendered`. Add a readable title for each new deck to `TITLES`
   and run it again (cached, fast). A byte-identical copy of a PDF in another folder prints `duplicate` and gets no
   deck of its own; cached decks take the path and week of the copy found first. Only names ending in `.pdf` count.
   A cached deck gets no new pack: if a deck's `site/slides/<id>.js` is missing, delete its entry from
   `site/slides/.cache.json` and run again so it is rendered.
3. Read each new deck's text from `site/slides/index.js` (`window.SLIDES.decks[].pages[].t`; skip pages with `b: 1`,
   which are animation build-up steps). Read any new workshop notebooks too.
4. Write lessons for the new material: usually one lesson per lecture, in the matching track's file (or a new
   `lessons/g_*.py` file), with `decks=[...]` naming the new deck ids. Follow the style below. Add one to three
   videos per new lesson to `videos.py`. Confirm every video id, title and channel with a web search first; never
   add an id from memory. Prefer short, accurate explainers (StatQuest, Corey Schafer, TrevTutor, Kimberly Brehm,
   CrashCourse, Computerphile).
5. Run `python3 build_content.py` (no arguments = full build). Fix every PROBLEM until it prints
   `all cells ran as expected`. You can build single lessons while drafting with `python3 build_content.py <lesson-id>`;
   each cell's output is written to `/tmp/guide_dump.txt` so you can check the numbers your text claims.
6. Publish with the artifact tools: `get_artifact` and `list_files` first, then `publish_files` with the slug above,
   `base_version` = the live version, patch mode, listing only changed files: `content/lessons.js`,
   `slides/index.js`, any new `js/gens_*.js`, every `slides/<id>.js` and `slides/<id>.webp` that now exists in `site/slides` (packs are not
   kept in the kit, so only new or changed decks have one), and any changed `js/`, `css/` or `data/` file.
   Keep each call under 64 MiB. Never publish `site/slides/<id>/` page folders or `.cache.json`.
   If the session has the single `Artifact` tool instead (actions `read`, `list`, `publish`): read
   `https://claude.ai/code/artifact/ba456835-1886-4bf3-8411-99fcc184d209`, list its files (`scope: "files"`), then
   publish with that `url`, the changed files in `files` (files left out are kept) and `file_path` =
   `site/index.body.html`. That tool wraps the page in its own doctype/head/body skeleton, so `index.body.html` is the
   same page as `index.html` without the `<!DOCTYPE>`, `<html>`, `<head>` and `<body>` tags. Keep the two in step, and
   never write `index.body.html` over the desktop copy's `index.html`.
   The `mcp__claude-artifacts__` publish tools refuse public artifacts. If a publish is refused, say so; do not work
   around it.
7. Refresh the desktop copy: copy the same changed files into `/mnt/user-data/outputs/`, then `device_commit_files`
   each to `/Users/shaurya/Desktop/Data/Learning Guide/site/<same path>` (at most 50 files per call).
8. Update `manifest.json`, rebuild the kit archive from inside the kit folder and write it back to the Mac:
   `tar -czf guide-kit.tar.gz --exclude='__pycache__' --transform 's,^,guide-kit/,' README.md NOTES.md manifest.json build_slides.py build_content.py dsl.py videos.py make_data.py test_ui.py test_practice.py test_gens.js test_gens_py.py runtime lessons/*.py datafiles site/index.html site/index.body.html site/css site/js site/content site/slides/index.js site/slides/.cache.json`
   (slide packs and `site/data` are not kept in the kit: they are already published and in the desktop copy).
   Optional check before publishing, where playwright and Chrome exist: `python3 test_ui.py` walks a lesson, a
   mastery check and an exam headlessly and prints `ERRORS: 0`; `python3 test_practice.py` answers questions on every
   unlimited-questions page and prints `errors 0`.
9. If a new dataset is needed: copy it into `datafiles/`, write `site/data/<name>.js` in the `GUIDE.file` format
   (see `make_data.py`), publish it, and add its name to the playground's file list in `site/js/app.js`.

## The lesson language (dsl.py)

```python
lesson(id, track, title, mins, sources, keywords, goals, blocks, summary='', decks=None)
text(html); key(html); fx(text, caption=None); slip(html, yours=False)
prime(q, options, answer_index, why)                       # warm-up guess, or "Quick check" after the video
code(title, src, predict=None, investigate=None, modify=None, files=None, inputs=None, intro=None, was=None)
    # predict=(q, options, answer_index, why); investigate=[(q, a)]; modify=[(task, hint, solution_code)]
    # in src, "#:" comments become per-line notes and "## " lines become subgoal labels
parsons(title, lines, why=None)                            # put lines in order
bug(title, src, hint, fix, why, test=None)                 # the fix must pass the test
explain(q, answer)                                         # self-explanation / essay practice
make(task, starter, hints, solution, test=None)            # starter must FAIL the test, solution must pass it
quiz(mcq(q, options, answer_index, why), card(front, back), ...)   # becomes the lesson's mastery check
```

`md()` text fields escape HTML and support `code`, **bold** and *italic*, so avoid stray asterisks in them; write ×
for multiplication. `text`, `key` and `make` task fields take raw HTML: escape `<` as `&lt;` and use
`<table class="tbl">` for tables. Each lesson has one Python namespace: cells run in order, and modify, bug and make
blocks run on a copy of it.

## Teaching style (keep it consistent)

* Order inside a lesson: short framing text → `prime` (pretest, or quick check after the video) → `key` definitions →
  worked `code` examples with predict → run → investigate → modify (PRIMM) → `parsons`/`bug`/`explain` → one `make`
  task → a mixed `quiz` of 5–8 items (mcq plus flashcards), which is the mastery check and feeds spaced review.
* Give predict questions options where you can: they count toward mastery and come back in review.
* Base every fact on the student's own slides. Where a slide is wrong, say so politely (for example the Leibniz date).
* Use `slip(..., yours=True)` when the student's own notes (the `.md` files beside the slides) show a misconception.
* For essay-based modules (ECM1407), end each lesson with an `explain` titled "Essay practice" that argues both sides.
* British spelling, plain short sentences, no filler.
