import json, io, contextlib, re, sys, warnings
warnings.filterwarnings('ignore')
def norm(s, loose):
    ls=[l.strip() for l in s.replace('\r','').split('\n')]
    while ls and not ls[-1]: ls.pop()
    while ls and not ls[0]: ls.pop(0)
    s='\n'.join(ls)
    if loose:
        s=re.sub(r'\[\s+','[',s); s=re.sub(r'\s+\]',']',s); s=re.sub(r'[ \t]+',' ',s); s=s.replace("'",'"')
    return s
cases=json.load(open('/tmp/py_cases.json'))
bad=0; seen=set()
for c in cases:
    if c['code'] in seen: continue
    seen.add(c['code'])
    buf=io.StringIO()
    try:
        with contextlib.redirect_stdout(buf):
            exec(c['code'], {'__name__':'__main__'})
    except Exception as e:
        # logging writes to stderr: handled below
        print('EXC', c['id'], type(e).__name__, e); bad+=1; continue
    got=norm(buf.getvalue(), c['norm']=='loose'); exp=norm(c['out'], c['norm']=='loose')
    if got!=exp:
        bad+=1
        if bad<15: print('MISMATCH', c['id'], '\n--code--\n'+c['code']+'\n--expected--\n'+exp+'\n--python--\n'+got)
print('trace cases', len(seen), 'mismatches', bad)
codes=json.load(open('/tmp/code_cases.json')); cb=0
for c in codes:
    ns={}
    try:
        exec(c['sol'], ns); exec(c['test'], ns)
    except Exception as e:
        cb+=1; print('CODE FAIL', c['id'], type(e).__name__, e)
    ns={}
    try:
        exec(c['starter'], ns); exec(c['test'], ns); print('STARTER PASSES?!', c['id'])
    except Exception: pass
print('code solutions', len(codes), 'failures', cb)
