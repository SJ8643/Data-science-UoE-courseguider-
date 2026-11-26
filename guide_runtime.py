# guide_runtime.py – runs one code cell and reports what happened.
# The same file runs inside the browser (Pyodide) and in the build step that records saved outputs.
import sys, io, ast, json, builtins, traceback, warnings, base64, os

_NS = {}            # one namespace per lesson, so cells in a lesson share variables like a notebook
_MPL_READY = False
_MAX_OUT = 24000

_THEME = {
    'figure.facecolor': '#0b1020', 'axes.facecolor': '#0b1020', 'savefig.facecolor': '#0b1020',
    'axes.edgecolor': '#3a4670', 'axes.labelcolor': '#c9d4f5', 'text.color': '#dfe7ff',
    'xtick.color': '#9fb0dc', 'ytick.color': '#9fb0dc', 'grid.color': '#1f2947',
    'axes.grid': False, 'grid.linewidth': 0.6, 'axes.spines.top': False, 'axes.spines.right': False,
    'axes.titlecolor': '#eef3ff', 'axes.titlesize': 12, 'axes.labelsize': 10.5, 'font.size': 10,
    'legend.facecolor': '#121a33', 'legend.edgecolor': '#2a355c', 'legend.framealpha': 0.9,
    'figure.figsize': (6.4, 4.0), 'figure.dpi': 110, 'savefig.dpi': 110, 'lines.linewidth': 2,
    'image.cmap': 'viridis', 'scatter.edgecolors': 'none',
}
_CYCLE = ['#4dd8ff', '#ffb454', '#ff6fa3', '#7df0b0', '#b79cff', '#ffe066', '#6f9bff', '#ff8f6b']


def _setup_mpl(figs):
    """Use a non-interactive backend, the guide's dark style, and make plt.show() hand figures to the page."""
    global _MPL_READY
    import matplotlib
    if not _MPL_READY:
        matplotlib.use('AGG', force=True)
        import matplotlib.pyplot as plt
        from cycler import cycler
        plt.rcParams.update(_THEME)
        plt.rcParams['axes.prop_cycle'] = cycler(color=_CYCLE)
        _MPL_READY = True
    import matplotlib.pyplot as plt

    def _grab():
        for num in plt.get_fignums():
            fig = plt.figure(num)
            buf = io.BytesIO()
            try:
                fig.savefig(buf, format='png', bbox_inches='tight')
                figs.append(base64.b64encode(buf.getvalue()).decode('ascii'))
            except Exception as e:  # pragma: no cover
                print('Could not draw figure:', e)
        plt.close('all')

    def show(*args, **kwargs):
        _grab()
    plt.show = show
    return _grab


def _display(value):
    """Mimic a notebook: show the value of the last expression in a cell."""
    if value is None:
        return None, None
    try:
        import pandas as pd  # only if the cell already uses pandas
        if isinstance(value, pd.DataFrame):
            html = value.to_html(max_rows=12, max_cols=12, border=0, classes='df', float_format=lambda v: f'{v:.6g}')
            return None, html + f'<div class="dfshape">{value.shape[0]} rows × {value.shape[1]} columns</div>'
    except Exception:
        pass
    text = repr(value)
    return text, None


def _friendly(etype, evalue, tb, code):
    """Keep only the part of the traceback that points into the learner's own cell."""
    line = None
    if isinstance(evalue, SyntaxError) and evalue.filename == '<cell>':
        line = evalue.lineno
    else:
        for fr in traceback.extract_tb(tb):
            if fr.filename == '<cell>':
                line = fr.lineno
    src = code.split('\n')
    shown = src[line - 1].rstrip() if line and 0 < line <= len(src) else ''
    msg = str(evalue)
    if isinstance(evalue, SyntaxError):
        msg = evalue.msg
    return {'type': etype.__name__, 'msg': msg, 'line': line, 'src': shown}


def run_cell(code, ns_key='main', inputs=None, fresh=False):
    """Run `code` in the namespace `ns_key`. Returns a JSON string:
    {stdout, value, html, figs:[png base64], error:{type,msg,line,src}|null}"""
    if fresh or ns_key not in _NS:
        _NS[ns_key] = {'__name__': '__main__'}
    ns = _NS[ns_key]
    out = io.StringIO()
    figs, grab = [], None
    result = {'stdout': '', 'value': None, 'html': None, 'figs': figs, 'error': None}
    if isinstance(inputs, str):
        inputs = json.loads(inputs) if inputs else []
    pending = list(inputs or [])

    def fake_input(prompt=''):
        out.write(str(prompt))
        if not pending:
            raise EOFError('This cell called input() but there were no more answers in the Inputs box. '
                           'Type one answer per line in the Inputs box, then run again.')
        ans = pending.pop(0)
        out.write(str(ans) + '\n')
        return ans

    def showwarning(message, category, filename, lineno, file=None, line=None):
        text = str(message).strip().split('\n')
        out.write(f'[{category.__name__}] {text[0]}' + (' …' if len(text) > 1 else '') + '\n')

    old = (sys.stdout, sys.stderr, builtins.input, warnings.showwarning)
    sys.stdout = sys.stderr = out
    builtins.input = fake_input
    warnings.showwarning = showwarning
    try:
        if 'matplotlib' in code or 'plt.' in code or 'matplotlib' in sys.modules:
            try:
                grab = _setup_mpl(figs)
            except Exception:
                grab = None
        tree = ast.parse(code, '<cell>', 'exec')
        last = None
        if tree.body and isinstance(tree.body[-1], ast.Expr):
            last = ast.Expression(tree.body.pop().value)
        with warnings.catch_warnings():
            warnings.simplefilter('default')
            warnings.filterwarnings('ignore', category=DeprecationWarning)
            exec(compile(tree, '<cell>', 'exec'), ns)
            if last is not None:
                value = eval(compile(last, '<cell>', 'eval'), ns)
                result['value'], result['html'] = _display(value)
        if grab:
            grab()
    except BaseException as e:  # show the learner a short, readable error
        if grab:
            try: grab()
            except Exception: pass
        result['error'] = _friendly(type(e), e, e.__traceback__, code)
    finally:
        sys.stdout, sys.stderr, builtins.input, warnings.showwarning = old
    text = out.getvalue()
    if len(text) > _MAX_OUT:
        text = text[:_MAX_OUT] + '\n… output cut off (it was very long)'
    result['stdout'] = text
    return json.dumps(result)


def reset(ns_key):
    _NS.pop(ns_key, None)
