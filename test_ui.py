"""Headless check of the redesigned guide: renders each view, walks a lesson, a mastery check and an exam, and saves screenshots."""
import subprocess, sys, time, random
from playwright.sync_api import sync_playwright

OUT = '/tmp/shots'
srv = subprocess.Popen([sys.executable, '-m', 'http.server', '8765', '--bind', '127.0.0.1'], cwd='site', stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(1)
errors = []
IGNORE = ('fonts.g', 'pyodide', 'ytimg', 'youtube', 'ERR_', 'Failed to load resource', 'net::')

def answer_until_done(page, scope, limit=300):
    """Answer questions inside `scope` (a CSS selector) until no question is left."""
    for _ in range(limit):
        opts = page.locator(scope + ' .qitem .opt:not([disabled])')
        if opts.count():
            opts.nth(random.randrange(opts.count())).click()
        elif page.locator(scope + ' .qitem .flip button:has-text("Show the answer")').count():
            page.locator(scope + ' .qitem .flip button:has-text("Show the answer")').click()
            page.locator(scope + ' .qitem .rate button').nth(2).click()
        nxt = page.locator(scope + ' .qitem .row .btn.go')
        if nxt.count():
            label = nxt.first.inner_text()
            nxt.first.click()
            if 'Finish' in label or 'See results' in label:
                return True
        if page.locator(scope + ' .mdone').count():
            return True
    return False

with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
    pg = b.new_page(viewport={'width': 1360, 'height': 900})
    pg.on('pageerror', lambda e: errors.append('pageerror: ' + str(e)))
    pg.on('console', lambda m: m.type == 'error' and not any(s in m.text for s in IGNORE) and errors.append('console: ' + m.text))
    base = 'http://127.0.0.1:8765/index.html'
    pg.goto(base + '#home'); pg.wait_for_timeout(600)
    pg.screenshot(path=OUT + '/home.png', full_page=True)
    pg.goto(base + '#course-ml'); pg.wait_for_timeout(400)
    pg.screenshot(path=OUT + '/course.png', full_page=True)

    # lesson in step-by-step mode
    pg.goto(base + '#ml-linreg'); pg.wait_for_timeout(600)
    print('watch tiles:', pg.locator('.watch .vtile').count(), 'button tiles:', pg.locator('.watch button.vtile').count())
    print('steps visible before:', pg.locator('#view .blk:not(.later)').count(), 'hidden:', pg.locator('#view .later').count())
    pg.screenshot(path=OUT + '/lesson_top.png')
    pg.locator('.watch button.vtile').first.click(); pg.wait_for_timeout(300)
    print('iframe after click:', pg.locator('.watch iframe').count(), pg.locator('.watch iframe').first.get_attribute('src'))
    for i in range(40):
        btn = pg.locator('.nextbar button')
        if btn.is_disabled():
            o = pg.locator('.cell.needs:not([data-done]) .opt:not([disabled])')
            if o.count(): o.first.click(); pg.wait_for_timeout(100); continue
        t = btn.inner_text()
        if 'Next lesson' in t or 'Back to' in t: break
        btn.click(); pg.wait_for_timeout(150)
    print('after walking, hidden:', pg.locator('#view .later').count(), 'bar says:', pg.locator('.nextbar button').inner_text())
    pg.locator('.mastery .mstart button').click()
    ok = answer_until_done(pg, '.mastery')
    pg.wait_for_timeout(300)
    print('mastery finished:', ok, '|', pg.locator('.mastery .mdone h3').inner_text() if pg.locator('.mastery .mdone h3').count() else 'no panel')
    print('header ring:', pg.locator('.lring .ring').get_attribute('aria-label'))
    pg.locator('.mastery').scroll_into_view_if_needed(); pg.screenshot(path=OUT + '/lesson_mastered.png')

    # sessions
    pg.goto(base + '#review'); pg.wait_for_timeout(300)
    pg.screenshot(path=OUT + '/review.png', full_page=True)
    pg.goto(base + '#exam-ml'); pg.wait_for_timeout(300)
    pg.locator('.sess-head .btn.go').click()
    ok = answer_until_done(pg, '.run')
    print('exam finished:', ok, '| breakdown rows:', pg.locator('.breakdown a').count())
    pg.screenshot(path=OUT + '/exam_done.png', full_page=True)
    pg.goto(base + '#strengthen'); pg.wait_for_timeout(300)
    print('strengthen button:', pg.locator('.sess-head .btn.go').inner_text())
    pg.screenshot(path=OUT + '/strengthen.png', full_page=True)
    pg.goto(base + '#home'); pg.wait_for_timeout(300)
    pg.screenshot(path=OUT + '/home_after.png', full_page=True)
    print('streak:', pg.locator('.streak b').inner_text(), '| continue:', pg.locator('.continue h2').inner_text())

    # other views, dark mode, phone
    for r in ['slides', 'playground', 'research', 'deck-ml-com1011-l02-linearregression', 'dm-proofs', 'spi-security']:
        pg.goto(base + '#' + r); pg.wait_for_timeout(300)
    pg.screenshot(path=OUT + '/spi.png')
    pg.locator('#themebtn').click(); pg.goto(base + '#course-dm'); pg.wait_for_timeout(300)
    pg.screenshot(path=OUT + '/dark_course.png', full_page=True)
    pg.goto(base + '#dm-proofs'); pg.wait_for_timeout(300)
    pg.screenshot(path=OUT + '/dark_lesson.png')
    pg.locator('#themebtn').click()
    m = b.new_page(viewport={'width': 390, 'height': 844}, device_scale_factor=2)
    m.on('pageerror', lambda e: errors.append('mobile pageerror: ' + str(e)))
    m.goto(base + '#py-loops'); m.wait_for_timeout(500)
    m.screenshot(path=OUT + '/phone_lesson.png')
    m.goto(base + '#home'); m.wait_for_timeout(400)
    m.screenshot(path=OUT + '/phone_home.png')
    b.close()
srv.terminate()
print('ERRORS:', len(errors))
for e in errors[:20]: print(' ', e)
