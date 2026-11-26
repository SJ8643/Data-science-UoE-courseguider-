"""Tiny authoring DSL for the learning guide lessons (turned into JSON by build_content.py)."""
import re, textwrap, html as _html

LESSONS = []


def md(s):
    """Escape plain text, then allow `code`, **bold** and *italic*."""
    if s is None:
        return None
    s = _html.escape(str(s), quote=False)
    keep = []
    def stash(m):
        keep.append('<code>' + m.group(1) + '</code>')
        return '\x00%d\x00' % (len(keep) - 1)
    s = re.sub(r'`([^`]+)`', stash, s)
    s = re.sub(r'\*\*([^*]+)\*\*', r'<b>\1</b>', s)
    s = re.sub(r'(?<![\w*])\*([^*\n]+)\*(?![\w*])', r'<i>\1</i>', s)
    return re.sub('\x00(\\d+)\x00', lambda m: keep[int(m.group(1))], s)


def rich(s):
    """Raw HTML with `code` spans allowed (content inside backticks is escaped)."""
    s = textwrap.dedent(s).strip()
    return re.sub(r'`([^`\n]+)`', lambda m: '<code>' + _html.escape(m.group(1), quote=False) + '</code>', s)


def parse_code(src):
    """Split '#:' line notes and '## ' subgoal labels out of a code listing."""
    src = textwrap.dedent(src).strip('\n')
    lines, notes, goals = [], {}, []
    for raw in src.split('\n'):
        st = raw.strip()
        if st.startswith('## '):
            indent = raw[:len(raw) - len(raw.lstrip())]
            goals.append({'at': len(lines), 'label': st[3:]})
            lines.append(indent + '# ── ' + st[3:])
            continue
        if '#:' in raw:
            c, n = raw.split('#:', 1)
            lines.append(c.rstrip())
            notes[str(len(lines) - 1)] = md(n.strip())
        else:
            lines.append(raw.rstrip())
    return '\n'.join(lines), notes, goals


def _mcq(q, options, answer, why):
    return {'q': md(q), 'options': [md(o) for o in options], 'answer': answer, 'why': md(why)}


def lesson(id, track, title, mins, sources, keywords, goals, blocks, summary='', decks=None):
    try:
        from videos import VIDEOS
    except ImportError:
        VIDEOS = {}
    L = {'id': id, 'track': track, 'title': title, 'mins': mins, 'sources': sources, 'summary': summary,
         'keywords': keywords, 'decks': decks or [], 'goals': [md(g) for g in goals], 'blocks': blocks,
         'videos': VIDEOS.get(id, [])}
    LESSONS.append(L)
    return L


def text(html):
    return {'t': 'text', 'html': rich(html)}


def key(html):
    return {'t': 'key', 'html': rich(html)}


def fx(html, caption=None):
    return {'t': 'fx', 'html': rich(html), 'caption': md(caption)}


def slip(html, yours=False):
    return {'t': 'slip', 'html': rich(html), 'yours': yours}


def prime(q, options, answer, why):
    return dict(_mcq(q, options, answer, why), t='prime')


def code(title, src, predict=None, files=None, investigate=None, modify=None, inputs=None,
         intro=None, run=True, yours=False, expect_error=False, was=None):
    c, notes, goals = parse_code(src)
    b = {'t': 'code', 'title': title, 'code': c, 'notes': notes, 'goals': goals, 'files': files or [],
         'inputs': inputs or [], 'intro': rich(intro) if intro else None, 'run': run, 'yours': yours,
         'expect_error': expect_error, 'was': rich(was) if was else None}
    if predict:
        if len(predict) == 2:      # free-text prediction: (question, what actually happens)
            b['predict'] = {'q': md(predict[0]), 'why': md(predict[1])}
        else:
            b['predict'] = _mcq(*predict)
    b['investigate'] = [{'q': md(q), 'a': md(a)} for q, a in (investigate or [])]
    b['modify'] = [{'task': md(m[0]), 'hint': md(m[1]), 'solution': textwrap.dedent(m[2]).strip('\n')}
                   for m in (modify or [])]
    return b


def parsons(title, lines, why=None, intro=None):
    return {'t': 'parsons', 'title': title, 'lines': textwrap.dedent(lines).strip('\n').split('\n'),
            'why': md(why), 'intro': md(intro)}


def bug(title, src, hint, fix, why, test=None, files=None, yours=False):
    return {'t': 'bug', 'title': title, 'code': textwrap.dedent(src).strip('\n'), 'hint': md(hint),
            'fix': textwrap.dedent(fix).strip('\n'), 'why': md(why),
            'test': textwrap.dedent(test).strip('\n') if test else None, 'files': files or [], 'yours': yours}


def explain(q, answer):
    return {'t': 'explain', 'q': md(q), 'a': md(answer)}


def make(task, starter, hints, solution, test=None, files=None, inputs=None):
    return {'t': 'make', 'task': rich(task), 'starter': textwrap.dedent(starter).strip('\n'),
            'hints': [md(h) for h in hints], 'solution': textwrap.dedent(solution).strip('\n'),
            'test': textwrap.dedent(test).strip('\n') if test else None, 'files': files or [],
            'inputs': inputs or []}


def mcq(q, options, answer, why):
    return dict(_mcq(q, options, answer, why), k='mcq')


def card(front, back):
    return {'k': 'card', 'front': md(front), 'back': md(back)}


def quiz(*items):
    return {'t': 'quiz', 'items': list(items)}


def viz(name, caption=None, **params):
    return {'t': 'viz', 'name': name, 'caption': md(caption), 'params': params}


def cwq(html, marks=None):
    return {'t': 'cwq', 'html': rich(html), 'marks': marks}


def yours(html):
    return {'t': 'yours', 'html': rich(html)}


def feedback(html):
    return {'t': 'feedback', 'html': rich(html)}
