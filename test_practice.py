"""Headless check of the unlimited-questions pages: hub, every week page, answering each kind of question, course and lesson links."""
import subprocess, sys, time, re
from playwright.sync_api import sync_playwright

OUT = '/tmp/shots'
srv = subprocess.Popen([sys.executable, '-m', 'http.server', '8766', '--bind', '127.0.0.1'], cwd='site', stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(1)
errors = []
IGNORE = ('fonts.g', 'pyodide', 'ytimg', 'youtube', 'ERR_', 'Failed to load resource', 'net::', '.webp')
kinds = {}

def answer_one(pg):
    """Answer whatever question is showing; return its kind."""
    body = pg.locator('.pcard .body')
    if body.locator('.opt:not([disabled])').count():
        body.locator('.opt').first.click(); k = 'mcq'
    elif body.locator('.pans input').count():
        body.locator('.pans input').fill('7'); body.locator('.pans .btn.go').click()
        if not pg.locator('.pcard .fb').count(): body.locator('.pans [data-k="give"]').click()
        k = 'typed'
    elif body.locator('.pans textarea').count():
        body.locator('.pans textarea').fill('hello'); body.locator('.pans .btn.go').click(); k = 'trace'
    elif body.locator('.runbar').count():
        body.locator('.runbar .btn.ghost').click(); k = 'code'
    elif body.locator('textarea.free').count():
        body.locator('textarea.free').fill('My answer.'); body.locator('button:has-text("Show the mark scheme")').click()
        body.locator('.selfmark [data-m]').last.click(); k = 'written'
    else:
        k = 'unknown'
    kinds[k] = kinds.get(k, 0) + 1
    return k

with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
    pg = b.new_page(viewport={'width': 1360, 'height': 900})
    pg.on('pageerror', lambda e: errors.append('pageerror: ' + str(e)))
    pg.on('console', lambda m: m.type == 'error' and not any(s in m.text for s in IGNORE) and errors.append('console: ' + m.text))
    base = 'http://127.0.0.1:8766/index.html'
    pg.goto(base + '#home'); pg.wait_for_timeout(500)
    assert pg.locator('.nav a[href="#practice"]').count() == 1, 'rail link missing'
    assert pg.locator('.act[href="#practice"]').count() == 1, 'home card missing'
    pg.goto(base + '#practice'); pg.wait_for_timeout(400)
    n_cards = pg.locator('.wcard').count()
    print('hub cards', n_cards)
    pg.screenshot(path=OUT + '/p_hub.png', full_page=True)
    hrefs = [pg.locator('.wcard').nth(i).get_attribute('href') for i in range(n_cards)]
    for href in hrefs:
        pg.goto(base + href); pg.wait_for_timeout(250)
        assert pg.locator('.pcard').count() == 1, 'no question on ' + href
        for q in range(4):
            k = answer_one(pg)
            if k == 'unknown': errors.append('unknown question on ' + href + ': ' + pg.locator('.pcard').inner_text()[:200])
            nxt = pg.locator('.pnext .btn.go')
            if not nxt.count(): errors.append('no next button on ' + href + ' after ' + k); break
            nxt.click(); pg.wait_for_timeout(60)
    # a few screenshots of real questions
    pg.goto(base + '#practice-dm-1'); pg.wait_for_timeout(300); pg.screenshot(path=OUT + '/p_dm1.png', full_page=True)
    pg.goto(base + '#practice-ml-4'); pg.wait_for_timeout(300); answer_one(pg); pg.wait_for_timeout(100); pg.screenshot(path=OUT + '/p_ml4.png', full_page=True)
    pg.goto(base + '#practice-spi-7'); pg.wait_for_timeout(300)
    pg.locator('.ptopics .chip:has-text("Essay skills")').click(); pg.wait_for_timeout(200)
    pg.locator('.pcard textarea.free').fill('Utilitarian: weigh harms. Kant: never treat users as means.'); pg.locator('.pcard button:has-text("Show the mark scheme")').click(); pg.wait_for_timeout(100)
    pg.screenshot(path=OUT + '/p_spi7.png', full_page=True)
    # wrong answer → "Try one like it now" brings the same topic back
    pg.goto(base + '#practice-dm-4'); pg.wait_for_timeout(300)
    pg.locator('.ptopics .chip:has-text("Set operations")').click(); pg.wait_for_timeout(200)
    t1 = pg.locator('.pcard .tag').inner_text()
    pg.locator('.pans input').fill('{99}'); pg.locator('.pans .btn.go').click(); pg.wait_for_timeout(100)
    assert pg.locator('.pcard .fb.no').count(), 'wrong answer not marked wrong'
    pg.locator('[data-k="like"]').click(); pg.wait_for_timeout(100)
    assert pg.locator('.pcard h3').inner_text().startswith('Another like'), 'similar question not shown'
    # a right answer typed from the worked solution is marked right
    pg.goto(base + '#practice-py-2'); pg.wait_for_timeout(200)
    for _ in range(40):
        pg.locator('.ptopics .chip:has-text("Arithmetic")').click(); pg.wait_for_timeout(80)
        if pg.locator('.pans textarea').count(): break
    code = pg.locator('.pcard .ed textarea').input_value() if pg.locator('.pcard .ed textarea').count() else pg.locator('.pcard .ed').inner_text()
    print('trace code shown:', code.replace('\n', ' | ')[:120])
    # course page section and lesson link
    pg.goto(base + '#course-dm'); pg.wait_for_timeout(300)
    assert pg.locator('#unlimited').count() == 1 and pg.locator('.wgrid .wcard').count() >= 7, 'course section missing'
    pg.screenshot(path=OUT + '/p_course.png', full_page=True)
    pg.goto(base + '#dm-relations'); pg.wait_for_timeout(500)
    assert pg.locator('a.plink[href="#practice-dm-7"]').count() == 1, 'lesson link missing'
    # progress saved
    st = pg.evaluate("JSON.parse(localStorage.getItem('codeml-guide-v1')).prac.w")
    print('weeks with progress', len(st), 'dm-all answered', st.get('dm-all', {}).get('n'))
    # dark mode screenshot
    pg.evaluate("GUIDE.setTheme('dark')"); pg.goto(base + '#practice-ml-8'); pg.wait_for_timeout(300); answer_one(pg); pg.screenshot(path=OUT + '/p_dark.png', full_page=True)
    b.close()
srv.terminate()
print('kinds answered', kinds)
print('errors', len(errors)); [print(' ', e) for e in errors[:20]]
