#!/usr/bin/env python3
"""Runs every code cell of every lesson for real, records its output, and writes the site content bundle.
usage: python3 build_content.py [lesson-id ...]     (no ids = build everything)"""
import sys, os, io, json, glob, importlib.util, base64, shutil, hashlib, time, copy

HERE = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.join(HERE, 'site')
DATA = os.path.join(HERE, 'datafiles')          # datasets the cells may open
RUN = '/tmp/guide_run'
sys.path.insert(0, HERE)
sys.path.insert(0, os.path.join(HERE, 'runtime'))
import dsl, guide_runtime as rt
from PIL import Image

only = set(sys.argv[1:])
for f in sorted(glob.glob(os.path.join(HERE, 'lessons', '*.py'))):
    spec = importlib.util.spec_from_file_location(os.path.basename(f)[:-3], f)
    spec.loader.exec_module(importlib.util.module_from_spec(spec))

shutil.rmtree(RUN, ignore_errors=True); os.makedirs(RUN)
for f in os.listdir(DATA):
    shutil.copy(os.path.join(DATA, f), RUN)
os.chdir(RUN)
os.makedirs(os.path.join(SITE, 'out'), exist_ok=True)
os.makedirs(os.path.join(SITE, 'content'), exist_ok=True)

problems, stats = [], {'cells': 0, 'figs': 0}
DUMP = open('/tmp/guide_dump.txt', 'w')


def save_figs(figs, stem):
    paths = []
    for k, b64 in enumerate(figs):
        im = Image.open(io.BytesIO(base64.b64decode(b64))).convert('RGB')
        buf = io.BytesIO()
        im.save(buf, 'WEBP', quality=80, method=5)
        paths.append({'src': 'data:image/webp;base64,' + base64.b64encode(buf.getvalue()).decode(), 'w': im.width, 'h': im.height})
        stats['figs'] += 1
    return paths


def run(code, ns, stem, inputs=None, expect_error=False, label=''):
    t0 = time.time()
    r = json.loads(rt.run_cell(code, ns, inputs=inputs))
    dt = time.time() - t0
    stats['cells'] += 1
    if bool(r['error']) != bool(expect_error):
        problems.append(f"{stem} {label}: " + (f"ERROR {r['error']}" if r['error'] else 'expected an error, got none')
                        + '\n    stdout: ' + r['stdout'][-300:])
    if dt > 6:
        print(f'   slow cell {stem} {label}: {dt:.1f}s')
    r['figs'] = save_figs(r['figs'], stem)
    DUMP.write(f'### {stem} {label}\n' + r['stdout'][-1500:] + (('\nVALUE ' + str(r['value'])[:600]) if r['value'] else '') + (('\nERR ' + str(r['error'])) if r['error'] else '') + '\n')
    r['secs'] = round(dt, 2)
    return r


ids = set()
for L in dsl.LESSONS:
    assert L['id'] not in ids, 'duplicate lesson id ' + L['id']
    ids.add(L['id'])
    if only and L['id'] not in only:
        continue
    ns = L['id']
    rt.reset(ns)
    print('building', L['id'])
    for i, b in enumerate(L['blocks']):
        b['i'] = i
        stem = f"{L['id']}-{i}"
        t = b['t']
        if t == 'code':
            if b['run']:
                b['out'] = run(b['code'], ns, stem, b['inputs'], b['expect_error'], 'cell')
            for j, m in enumerate(b['modify']):
                snap = dict(rt._NS.get(ns, {}))            # try the modification without disturbing later cells
                rt._NS[ns + '~m'] = dict(snap)
                m['out'] = run(m['solution'], ns + '~m', f'{stem}-m{j}', b['inputs'], False, f'modify {j}')
                rt.reset(ns + '~m')
        elif t == 'bug':
            rt._NS[ns + '~b'] = dict(rt._NS.get(ns, {}))
            b['out'] = json.loads(rt.run_cell(b['code'], ns + '~b'))
            b['out']['figs'] = []
            rt._NS[ns + '~b'] = dict(rt._NS.get(ns, {}))
            fixed = b['fix'] + ('\n' + b['test'] if b['test'] else '')
            b['fixout'] = run(b['fix'], ns + '~b', stem + '-fix', None, False, 'fix')
            if b['test']:
                r = json.loads(rt.run_cell(b['test'], ns + '~b'))
                if r['error']:
                    problems.append(f"{stem} bug-test failed on the fix: {r['error']}")
            rt.reset(ns + '~b')
        elif t == 'make':
            rt._NS[ns + '~k'] = dict(rt._NS.get(ns, {}))
            b['out'] = run(b['solution'], ns + '~k', stem + '-sol', b.get('inputs'), False, 'solution')
            if b['test']:
                r = json.loads(rt.run_cell(b['test'], ns + '~k'))
                if r['error']:
                    problems.append(f"{stem} make-test failed on the solution: {r['error']}")
                # the starter must NOT already pass the test (otherwise the test checks nothing)
                rt._NS[ns + '~s'] = dict(rt._NS.get(ns, {}))
                r1 = json.loads(rt.run_cell(b['starter'], ns + '~s'))
                r2 = json.loads(rt.run_cell(b['test'], ns + '~s')) if not r1['error'] else {'error': 1}
                if not r2['error']:
                    problems.append(f"{stem} make-test passes on the unmodified starter")
                rt.reset(ns + '~s')
            rt.reset(ns + '~k')
        elif t in ('prime',) or t == 'quiz':
            items = [b] if t == 'prime' else [x for x in b['items'] if x['k'] == 'mcq']
            for it in items:
                if not (0 <= it['answer'] < len(it['options'])):
                    problems.append(f"{stem} bad answer index")
        if t == 'code' and b.get('predict') and 'options' in b['predict']:
            if not (0 <= b['predict']['answer'] < len(b['predict']['options'])):
                problems.append(f"{stem} bad predict index")
    rt.reset(ns)

built = [L for L in dsl.LESSONS if not only or L['id'] in only]
if not only:
    with open(os.path.join(SITE, 'content', 'lessons.js'), 'w', encoding='utf-8') as f:
        f.write('window.GUIDE_LESSONS = ' + json.dumps(dsl.LESSONS, ensure_ascii=False, separators=(',', ':')) + ';\n')
    src = open(os.path.join(HERE, 'runtime', 'guide_runtime.py'), encoding='utf-8').read()
    with open(os.path.join(SITE, 'js', 'runtime_py.js'), 'w', encoding='utf-8') as f:
        f.write('window.GUIDE_RUNTIME_PY = ' + json.dumps(src) + ';\n')
    print('wrote content/lessons.js', os.path.getsize(os.path.join(SITE, 'content', 'lessons.js')) // 1024, 'KB')
print(f"{len(built)} lessons, {stats['cells']} cells run, {stats['figs']} figures")
if problems:
    print('\nPROBLEMS:')
    for p in problems:
        print(' -', p)
    sys.exit(1)
print('all cells ran as expected')
