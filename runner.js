/* runner.js – in-browser Python (Pyodide, loaded from cdn.jsdelivr.net/pyodide) + a small code editor. */
(function () {
  'use strict';
  const G = window.GUIDE = window.GUIDE || {};
  const PY_VERSIONS = ['v0.28.0', 'v0.27.7', 'v0.26.4'];
  G.files = G.files || {};
  G.file = function (name, kind, payload) { G.files[name] = { kind: kind, payload: payload }; };

  /* ---------- lazy dataset loading (each dataset is a small script in data/) ---------- */
  const fileWaits = {};
  G.needFile = function (name) {
    if (G.files[name]) return Promise.resolve(G.files[name]);
    if (!fileWaits[name]) {
      fileWaits[name] = new Promise(function (res, rej) {
        const s = document.createElement('script');
        s.src = 'data/' + encodeURIComponent(name) + '.js';
        s.onload = function () { G.files[name] ? res(G.files[name]) : rej(new Error('File ' + name + ' did not load')); };
        s.onerror = function () { delete fileWaits[name]; rej(new Error('Could not load the data file ' + name)); };
        document.head.appendChild(s);
      });
    }
    return fileWaits[name];
  };

  /* ---------- the engine: same code runs inside a Web Worker, or on the page as a fallback ---------- */
  function engineMain() {
    /* runs in worker scope */
    let py = null, runCell = null, resetNs = null;
    const written = {};
    async function boot(versions, runtimeSrc) {
      let lastErr = null;
      for (const v of versions) {
        const base = 'https://cdn.jsdelivr.net/pyodide/' + v + '/full/';
        try {
          importScripts(base + 'pyodide.js');
          py = await self.loadPyodide({ indexURL: base });
          break;
        } catch (e) { lastErr = e; py = null; }
      }
      if (!py) throw lastErr || new Error('Pyodide did not load');
      py.FS.mkdirTree('/guide_lib'); py.FS.mkdirTree('/work');
      py.FS.writeFile('/guide_lib/guide_runtime.py', runtimeSrc);
      py.runPython("import os, sys\nos.environ['MPLBACKEND'] = 'AGG'\nsys.path.insert(0, '/guide_lib')\nos.chdir('/work')\nimport guide_runtime");
      const mod = py.globals.get('guide_runtime');
      runCell = mod.run_cell; resetNs = mod.reset;
      return py.version;
    }
    function b64ToBytes(b64) {
      const bin = atob(b64), out = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
      return out;
    }
    self.onmessage = async function (ev) {
      const m = ev.data;
      try {
        if (m.type === 'boot') {
          const version = await boot(m.versions, m.runtime);
          self.postMessage({ type: 'ready', version: version });
        } else if (m.type === 'run') {
          for (const f of (m.files || [])) {
            if (written[f.name]) continue;
            py.FS.writeFile('/work/' + f.name, f.kind === 'base64' ? b64ToBytes(f.payload) : f.payload);
            written[f.name] = true;
          }
          let last = '';
          await py.loadPackagesFromImports(m.code, {
            messageCallback: function (msg) { if (msg !== last) { last = msg; self.postMessage({ type: 'status', id: m.id, msg: msg }); } }
          });
          if (m.base) py.runPython('guide_runtime._NS[' + JSON.stringify(m.ns) + '] = dict(guide_runtime._NS.get(' + JSON.stringify(m.base) + ', {"__name__": "__main__"}))');
          const out = runCell(m.code, m.ns, JSON.stringify(m.inputs || []), !!m.fresh);
          self.postMessage({ type: 'result', id: m.id, result: JSON.parse(out) });
        } else if (m.type === 'reset') {
          resetNs(m.ns);
        }
      } catch (e) {
        self.postMessage({ type: m.type === 'boot' ? 'bootfail' : 'fail', id: m.id, msg: String(e && e.message || e) });
      }
    };
  }

  const Py = G.py = {
    state: 'idle', version: null, worker: null, waiting: {}, seq: 0, bootPromise: null, gen: 0, statusCb: {},
    boot: function () {
      if (Py.bootPromise) return Py.bootPromise;
      Py.state = 'loading';
      Py.bootPromise = new Promise(function (res, rej) {
        let w;
        try {
          const blob = new Blob(['(' + engineMain.toString() + ')()'], { type: 'text/javascript' });
          w = new Worker(URL.createObjectURL(blob));
        } catch (e) { Py.state = 'failed'; rej(e); return; }
        Py.worker = w;
        const timer = setTimeout(function () { if (Py.state === 'loading') fail(new Error('Python took too long to start')); }, 90000);
        function fail(e) { clearTimeout(timer); Py.state = 'failed'; try { w.terminate(); } catch (x) {} Py.worker = null; rej(e); }
        w.onerror = function (e) { if (Py.state === 'loading') fail(new Error(e.message || 'worker error')); };
        w.onmessage = function (ev) {
          const m = ev.data;
          if (m.type === 'ready') { clearTimeout(timer); Py.state = 'ready'; Py.version = m.version; res(m.version); }
          else if (m.type === 'bootfail') fail(new Error(m.msg));
          else if (m.type === 'status') { const cb = Py.statusCb[m.id]; if (cb) cb(m.msg); }
          else if (m.type === 'result' || m.type === 'fail') {
            const p = Py.waiting[m.id]; delete Py.waiting[m.id]; delete Py.statusCb[m.id];
            if (p) m.type === 'result' ? p.res(m.result) : p.rej(new Error(m.msg));
          }
        };
        w.postMessage({ type: 'boot', versions: PY_VERSIONS, runtime: window.GUIDE_RUNTIME_PY });
      });
      Py.bootPromise.catch(function () { Py.bootPromise = null; });
      return Py.bootPromise;
    },
    /* run({code, ns, base, inputs, files:[names], fresh}, onStatus) -> Promise<result> */
    run: async function (job, onStatus) {
      await Py.boot();
      const files = [];
      for (const name of (job.files || [])) { const f = await G.needFile(name); files.push({ name: name, kind: f.kind, payload: f.payload }); }
      const id = ++Py.seq;
      if (onStatus) Py.statusCb[id] = onStatus;
      return new Promise(function (res, rej) {
        Py.waiting[id] = { res: res, rej: rej };
        Py.worker.postMessage({ type: 'run', id: id, code: job.code, ns: job.ns, base: job.base || null, inputs: job.inputs || [], files: files, fresh: !!job.fresh });
      });
    },
    reset: function (ns) { if (Py.worker && Py.state === 'ready') Py.worker.postMessage({ type: 'reset', ns: ns }); },
    stop: function () {
      if (Py.worker) { try { Py.worker.terminate(); } catch (e) {} }
      Object.keys(Py.waiting).forEach(function (k) { Py.waiting[k].rej(new Error('stopped')); });
      Py.waiting = {}; Py.statusCb = {}; Py.worker = null; Py.bootPromise = null; Py.state = 'idle'; Py.gen++;
    }
  };

  /* ---------- syntax highlighting ---------- */
  const KW = new Set('False None True and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield'.split(' '));
  const BI = new Set('print len range int float str bool list dict set tuple input open sum min max abs round sorted enumerate zip map filter type isinstance any all reversed'.split(' '));
  const TOK = /(#[^\n]*)|("""[\s\S]*?"""|'''[\s\S]*?'''|[rRfFbB]{0,2}"(?:\\.|[^"\\\n])*"?|[rRfFbB]{0,2}'(?:\\.|[^'\\\n])*'?)|(\b\d+\.?\d*(?:[eE][+-]?\d+)?\b)|([A-Za-z_]\w*)/g;
  const esc = G.esc = function (s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); };
  function span(cls, text) {
    return text.split('\n').map(function (part) { return part ? '<span class="tk-' + cls + '">' + esc(part) + '</span>' : ''; }).join('\n');
  }
  G.highlight = function (code) {
    let out = '', last = 0, m, prevWord = '';
    TOK.lastIndex = 0;
    while ((m = TOK.exec(code))) {
      out += esc(code.slice(last, m.index)); last = TOK.lastIndex;
      if (m[1]) out += span('c', m[1]);
      else if (m[2]) out += span('s', m[2]);
      else if (m[3]) out += span('n', m[3]);
      else {
        const w = m[4];
        if (KW.has(w)) out += span('k', w);
        else if (prevWord === 'def' || prevWord === 'class') out += span('f', w);
        else if (BI.has(w)) out += span('b', w);
        else out += esc(w);
        prevWord = w; continue;
      }
      prevWord = '';
    }
    return out + esc(code.slice(last));
  };
  G.highlightLines = function (code, errLine) {
    return G.highlight(code).split('\n').map(function (l, i) {
      return '<span class="l' + (errLine === i + 1 ? ' err' : '') + '">' + (l || ' ') + '</span>';
    }).join('');
  };

  /* ---------- editor: a textarea layered over highlighted code ---------- */
  G.editor = function (code, opts) {
    opts = opts || {};
    const root = document.createElement('div');
    root.className = 'ed' + (opts.readOnly ? ' ro' : '');
    root.innerHTML = '<div class="scroll"><div class="inner"><pre aria-hidden="true"></pre><textarea spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" aria-label="' + (opts.label || 'Python code') + '"></textarea></div></div>';
    const pre = root.querySelector('pre'), ta = root.querySelector('textarea');
    let errLine = null;
    function paint() { pre.innerHTML = G.highlightLines(ta.value, errLine); }
    ta.value = code;
    ta.addEventListener('input', function () { errLine = null; paint(); if (opts.onChange) opts.onChange(ta.value); });
    ta.addEventListener('keydown', function (e) {
      if (e.key === 'Tab' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        const s = ta.selectionStart, t = ta.selectionEnd;
        ta.setRangeText('    ', s, t, 'end'); ta.dispatchEvent(new Event('input'));
      } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault(); if (opts.onRun) opts.onRun();
      } else if (e.key === 'Enter') {
        const s = ta.selectionStart, before = ta.value.slice(0, s);
        const line = before.slice(before.lastIndexOf('\n') + 1);
        let ind = (line.match(/^\s*/) || [''])[0];
        if (/:\s*(#.*)?$/.test(line)) ind += '    ';
        e.preventDefault();
        ta.setRangeText('\n' + ind, s, ta.selectionEnd, 'end'); ta.dispatchEvent(new Event('input'));
      }
    });
    paint();
    return {
      el: root,
      get: function () { return ta.value; },
      set: function (v) { ta.value = v; errLine = null; paint(); },
      mark: function (line) { errLine = line; paint(); },
      focus: function () { ta.focus(); }
    };
  };

  /* ---------- plain-English notes for the errors beginners meet most ---------- */
  const HINTS = {
    NameError: 'Python met a name it has not seen yet. Check the spelling and capital letters, and check that the line creating it has already run.',
    SyntaxError: 'Python could not read this line as valid code. Look for a missing colon, bracket or quote, or `=` where `==` was meant.',
    IndentationError: 'The spaces at the start of the line do not match the block it belongs to. Lines inside if / for / while / def need the same indent (4 spaces).',
    TypeError: 'A value has the wrong type for this operation, for example adding text to a number, or calling something that is not a function.',
    IndexError: 'The position you asked for is past the end of the list or string. Positions start at 0 and stop at len(...) - 1.',
    KeyError: 'That key or column name does not exist. Print the keys / columns and compare the spelling exactly.',
    ValueError: 'The type is right but the value is not acceptable, for example int("abc") or arrays with mismatched lengths.',
    ZeroDivisionError: 'Something was divided by zero. Check the value of the denominator before dividing.',
    AttributeError: 'That object has no method or attribute with this name. Check the spelling, and check the object is the type you think it is.',
    ModuleNotFoundError: 'This library is not available in the in-page Python. numpy, pandas, matplotlib, scipy and scikit-learn are; seaborn and requests are not.',
    FileNotFoundError: 'No file with that name is in the working folder. The course datasets used in this guide are loaded for you by name.',
    EOFError: 'The code called input() more times than there were answers in the Inputs box.',
    NotFittedError: 'You called predict or score before fit. A model must learn from training data first.'
  };
  G.errorHint = function (type) { return HINTS[type] || 'Read the last line of the message first: it names the problem. The highlighted line is where Python noticed it.'; };
})();
