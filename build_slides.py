#!/usr/bin/env python3
"""
build_slides.py  –  the automatic slide pipeline for the learning guide.

Scans the chosen module folders inside the Data folder for every PDF, and for each one:
  * renders every page to a WebP image            ->  <out>/<deck-id>/<NNN>.webp
  * builds one thumbnail sprite sheet per deck    ->  <out>/<deck-id>/sprite.webp
  * extracts the text on every page (for search and for matching slides to lessons)
and writes <out>/index.js, which the website loads.  Nothing is hand-picked: any PDF you add
to those folders is picked up on the next run.  Unchanged PDFs are skipped (cache by size + content hash).

usage:  python3 build_slides.py <data_root> <out_dir> "<module folder>" ["<module folder>" ...]
needs:  poppler-utils (pdfinfo, pdftoppm, pdftotext) and Pillow
"""
import hashlib, sys, os, re, json, subprocess, tempfile, shutil, time
from PIL import Image

W_LAND, W_PORT = 1100, 1000          # rendered width in px (landscape slides / portrait handouts)
Q_PAGE, Q_SPRITE = 62, 55            # WebP quality
THUMB_W, SPRITE_COLS = 240, 8

def slug(s):
    return re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-')

def module_code(folder):
    f = folder.lower()
    if 'machine learning' in f: return 'ml'
    if 'programming' in f: return 'py'
    if 'discrete' in f: return 'dm'
    if 'social' in f or 'ecm1407' in f: return 'spi'
    return slug(folder)[:8]

def find_week(rel):
    # deepest folder that mentions a week wins: ".../ML week 3/..." -> 3
    weeks = re.findall(r'week[ _-]*0*(\d+)', rel, flags=re.I)
    return int(weeks[0]) if weeks else None

def nice_title(fname):
    t = os.path.splitext(fname)[0]
    t = re.sub(r'^COM1011[-_ ]*', '', t)
    t = t.replace('_', ' ').replace('-', ' ')
    t = re.sub(r'\bL0?(\d)([ab]?)\b', r'L\1\2', t)
    t = re.sub(r'\bL(\d) (\d)\b', r'L\1.\2', t)
    t = re.sub(r'\bWeek(\d)', r'Week \1', t)
    t = re.sub(r'([a-z])([A-Z])', r'\1 \2', t)          # LinearRegression -> Linear Regression
    return re.sub(r'\s+', ' ', t).strip()

def page_text(pdf, i):
    t = subprocess.run(['pdftotext', '-f', str(i), '-l', str(i), '-layout', pdf, '-'],
                       capture_output=True, text=True).stdout
    t = t.replace('\x0c', ' ')
    t = re.sub(r'[ \t]{2,}', ' ', t)
    t = re.sub(r'\s*\n\s*', '\n', t).strip()
    return t

def is_build_step(a, b):
    """True if page a looks like an earlier animation step of page b (b repeats a and adds to it)."""
    if not a or not b or a == b: return a == b and bool(a)
    la, lb = a.split('\n'), b.split('\n')
    if la[0].strip() != lb[0].strip(): return False
    # every line of a must reappear on b, so hiding a loses nothing (decks with a navigation sidebar share most words)
    if not all(l in b for l in la if l.strip()): return False
    ta, tb = set(re.findall(r'\w+', a.lower())), set(re.findall(r'\w+', b.lower()))
    if not ta: return False
    return len(ta & tb) / len(ta) >= 0.9 and len(tb) >= len(ta)

TITLES = {
    'dm-intro-to-modal-logic-slides': 'Lecture 1: Propositional logic', 'dm-propositional-logic-1': 'Workshop 1: Propositional logic',
    'dm-handouts': 'Lecture 2: Predicate logic', 'dm-exercises02': 'Workshop 2: Predicate logic',
    'dm-handouts-03-1': 'Lecture 3: Proofs', 'dm-exercises03': 'Workshop 3: Proofs',
    'dm-handouts-04': 'Lecture 4: Set theory', 'dm-handouts-05': 'Lecture 5: Functions', 'dm-handouts-06': 'Lecture 6: Relations',
    'spi-week-01': 'Module overview and history of computing', 'spi-tutorial-02': 'Tutorial: Security, cryptography and society',
    'spi-week-02': 'Security, cryptography and society', 'spi-week-03': 'Intellectual property', 'spi-week-04': 'Computer misuse',
    'spi-week-5-software-contract': 'Software contracts', 'spi-week-7-professional-issues': 'Professional issues',
    'py-week-8a-why-we-write-computer-programs': 'Week 8a: Why we write computer programs', 'py-week-8b-numpy-and-pandas': 'Week 8b: NumPy and pandas',
    'ml-com1011-l-unsupervisedlearning': 'Unsupervised learning', 'ml-com1011-hierarchicalclusteringdbscan': 'Hierarchical clustering and DBSCAN',
    'dm-week9-slides': 'Week 9: Lists and trees',
    'spi-week-08-social-issues-1': 'Social issues I: technology, climate and sustainability', 'spi-week-09': 'Social issues II: online and offline case studies',
}

def file_key(path, st):
    h = hashlib.sha1()
    with open(path, 'rb') as fh:
        for chunk in iter(lambda: fh.read(1 << 20), b''):
            h.update(chunk)
    return f'{st.st_size}:{h.hexdigest()[:16]}'

def main():
    root, out = sys.argv[1], sys.argv[2]
    modules = sys.argv[3:]
    os.makedirs(out, exist_ok=True)
    cache_path = os.path.join(out, '.cache.json')
    cache = json.load(open(cache_path)) if os.path.exists(cache_path) else {}
    decks, seen, keys = [], set(), {}
    for m in modules:
        for dp, dn, fn in os.walk(os.path.join(root, m)):
            dn[:] = sorted(d for d in dn if not d.startswith('.') and d not in ('.venv', '__pycache__') and 'textbook' not in d.lower())
            for f in sorted(fn):
                if not f.lower().endswith('.pdf') or 'textbook' in f.lower(): continue
                pdf = os.path.join(dp, f)
                rel = os.path.relpath(pdf, root)
                st = os.stat(pdf)
                key = file_key(pdf, st)
                if key in keys:                          # byte-identical copy of a PDF already listed: one deck is enough
                    print('duplicate', rel, '=', keys[key]); continue
                did = module_code(m) + '-' + slug(os.path.splitext(f)[0])
                while did in seen: did += '-x'
                seen.add(did)
                keys[key] = did
                ddir = os.path.join(out, did)
                if cache.get(did, {}).get('key') == key:   # unchanged PDF: keep its published pack, render nothing
                    d0 = cache[did]['deck']                 # refresh title, path and week (the file may have moved folder)
                    d0['title'] = TITLES.get(did, nice_title(f)); d0['file'] = rel; d0['week'] = find_week(rel)
                    decks.append(d0); print('cached ', did); continue
                info = subprocess.run(['pdfinfo', pdf], capture_output=True, text=True).stdout
                n = int(re.search(r'Pages:\s+(\d+)', info).group(1))
                w, h = map(float, re.search(r'Page size:\s+([\d.]+) x ([\d.]+)', info).groups())
                land = w >= h
                px = W_LAND if land else W_PORT
                shutil.rmtree(ddir, ignore_errors=True); os.makedirs(ddir)
                tmp = tempfile.mkdtemp()
                subprocess.run(['pdftoppm', '-png', '-scale-to-x', str(px), '-scale-to-y', '-1', pdf,
                                os.path.join(tmp, 'p')], check=True)
                pngs = sorted(os.listdir(tmp))
                assert len(pngs) == n, (did, len(pngs), n)
                th = round(THUMB_W * h / w)
                rows = (n + SPRITE_COLS - 1) // SPRITE_COLS
                sprite = Image.new('RGB', (THUMB_W * SPRITE_COLS, th * rows), (10, 13, 23))
                pages, ph = [], None
                for i, png in enumerate(pngs, 1):
                    im = Image.open(os.path.join(tmp, png)).convert('RGB')
                    ph = im.height
                    im.save(os.path.join(ddir, f'{i:03d}.webp'), 'WEBP', quality=Q_PAGE, method=5)
                    sprite.paste(im.resize((THUMB_W, th), Image.LANCZOS),
                                 (((i - 1) % SPRITE_COLS) * THUMB_W, ((i - 1) // SPRITE_COLS) * th))
                    pages.append({'t': page_text(pdf, i)})
                sprite.save(os.path.join(ddir, 'sprite.webp'), 'WEBP', quality=Q_SPRITE, method=5)
                shutil.rmtree(tmp)
                for i in range(n - 1):
                    if is_build_step(pages[i]['t'], pages[i + 1]['t']): pages[i]['b'] = 1
                deck = {'id': did, 'module': module_code(m), 'moduleName': m, 'week': find_week(rel),
                        'title': TITLES.get(did, nice_title(f)), 'file': rel, 'kind': 'slides' if land else 'handout',
                        'n': n, 'w': px, 'h': ph, 'tw': THUMB_W, 'th': th, 'cols': SPRITE_COLS,
                        'mtime': int(st.st_mtime), 'pages': pages}
                decks.append(deck)
                cache[did] = {'key': key, 'deck': deck}
                print('rendered', did, n, 'pages')
    # drop folders for decks that no longer exist
    for d in os.listdir(out):
        if os.path.isdir(os.path.join(out, d)) and d not in seen:
            shutil.rmtree(os.path.join(out, d)); cache.pop(d, None); print('removed', d)
    import base64
    for d in list(cache):
        if d not in seen: cache.pop(d)                  # PDF deleted from the Data folder
    for d in decks:
        ddir = os.path.join(out, d['id'])
        if not os.path.isdir(ddir):
            continue                                    # unchanged deck from the cache: its pack is already published
        pages = [base64.b64encode(open(os.path.join(ddir, f'{i:03d}.webp'), 'rb').read()).decode() for i in range(1, d['n'] + 1)]
        with open(os.path.join(out, d['id'] + '.js'), 'w') as f:
            f.write('GUIDE.pack(' + json.dumps(d['id']) + ',' + json.dumps(pages) + ');\n')
        shutil.copy(os.path.join(ddir, 'sprite.webp'), os.path.join(out, d['id'] + '.webp'))
    for f in os.listdir(out):
        stem, ext = os.path.splitext(f)
        if ext in ('.js', '.webp') and f != 'index.js' and stem not in seen:
            os.remove(os.path.join(out, f))
    decks.sort(key=lambda d: (d['module'], d['week'] if d['week'] is not None else 99, d['file']))
    json.dump(cache, open(cache_path, 'w'))
    payload = {'generated': time.strftime('%Y-%m-%d'), 'modules': modules, 'decks': decks}
    with open(os.path.join(out, 'index.js'), 'w', encoding='utf-8') as f:
        f.write('window.SLIDES = ' + json.dumps(payload, ensure_ascii=False, separators=(',', ':')) + ';\n')
    total = sum(d['n'] for d in decks)
    print(f'{len(decks)} decks, {total} pages -> {out}/index.js')

if __name__ == '__main__':
    main()
