/* The one-product gate (scripts/gate-one-product.mjs, Thomas's rule 7): every check fires on a fixture
   page built to break it, and a page built on the kit, the tokens and shell v2 passes them all.
   Static checks run on fixture markup (no browser). Browser checks load fixture pages in Chromium from a
   throwaway site (the fixtures plus a link to the real shared/); they skip, with a note, on a machine
   without a Chromium Playwright can start. */
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '../..');
const imp = (rel) => import(path.join(ROOT, rel));
const GOOD = fs.readFileSync(path.join(__dirname, 'fixtures/one-product/good.html'), 'utf8');
const inject = (html) => GOOD.replace('<!--FIXTURE-->', html);

/* ---------- static ---------- */
test('static: a page on the kit, the tokens and the shell passes every static check', async () => {
  const { staticCheck } = await imp('scripts/gate-one-product.mjs');
  assert.deepEqual(staticCheck(ROOT, 'x/good.html', GOOD), {});
});

test('static: each check fires on the markup that breaks it', async () => {
  const { staticCheck } = await imp('scripts/gate-one-product.mjs');
  const fires = (html, rel = 'x/page.html') => Object.keys(staticCheck(ROOT, rel, html)).sort();
  assert.deepEqual(fires(GOOD.replace(/<script src="\/shared\/ace-shell\.js[^>]*><\/script>/, '')), ['shell'], 'no shell script');
  assert.deepEqual(fires(GOOD.replace('<html lang="en" class="al">', '<html lang="en" class="al" data-ace-shell="off">').replace(/<script src="\/shared\/ace-shell\.js[^>]*><\/script>/, '')), ['logo'], 'an exam screen without the mark');
  assert.deepEqual(fires(GOOD.replace('<html lang="en" class="al">', '<html lang="en" class="al" data-ace-shell="off">').replace('<!--FIXTURE-->', '<img src="/shared/brand/ace-dat-mark-v1.svg" alt="">')), [], 'an exam screen with the mark from /shared/brand/');
  assert.deepEqual(fires(inject('<img src="/img/site-logo.png" alt="">')), ['other-logo'], 'another logo file');
  assert.deepEqual(fires(inject('<link rel="icon" href="/img/favicon-old.png">')), ['other-logo'], 'another icon');
  assert.deepEqual(fires(inject('<div class="sb-brand">Ace Labs</div>')), ['other-logo'], 'a brand box of its own');
  assert.deepEqual(fires(inject('<div style="background:url(/img/logo-mark.svg)"></div>')), ['other-logo'], 'a logo as a background');
  assert.deepEqual(fires(inject('<a href="https://acethedat.com/logo-page/">Main site</a>')), [], 'a plain link to the main site is not a logo');
  assert.deepEqual(fires(inject('<img src="/favicon.ico" alt=""><img src="/shared/brand/icon-v1.svg" alt="">')), [], 'the site icons and /shared/brand/ are the logo');
  assert.deepEqual(fires(inject('<h2>AceTheDAT</h2>')), ['wordmark'], 'the old wordmark as a heading');
  assert.deepEqual(fires(inject('<div class="logo-word">Ace The <span>DAT</span></div>')).sort(), ['other-logo', 'wordmark'], 'the old wordmark as a brand line');
  assert.deepEqual(fires(inject('<p>Content is written by the AceTheDAT coaches.</p>')), [], 'a mention in a sentence is fine');
  assert.deepEqual(fires(inject('<img src="/shared/ace-dat-mark-reversed.svg" alt="">')).sort(), ['old-logo-ref', 'other-logo'], 'the old copy');
  assert.deepEqual(fires(GOOD.replace('class="tool-head"', 'class="intro"')), ['header'], 'no door or tool header');
  assert.deepEqual(fires(GOOD.replace('<!--FIXTURE-->', '<!--FIXTURE-->').replace('</head>', '<style>.x h2{font-family:"Playfair Display",Georgia,serif}</style></head>')), ['fonts'], 'a font-family outside the three');
  assert.deepEqual(fires(GOOD.replace('</head>', '<style>.y{font:700 18px/1.2 Georgia,serif}</style></head>')), ['fonts'], 'the font shorthand counts');
  assert.deepEqual(fires(inject('<p style="font-family:Arial">x</p>')), ['fonts'], 'an inline style counts');
  assert.deepEqual(fires(GOOD.replace('</head>', '<style>.a{font-family:var(--f-body)} .b{font:var(--font-h1)} .c{font-family:"DM Sans",system-ui} svg text{font-family:Arial} .pm-run{font-family:Arial}</style></head>')), [], 'tokens, the three faces, figures and the exam screen pass');
});

test('the page list: served pages minus what spec 1.5 hides and the inventory marks internal', async () => {
  const { studentPages, hiddenPaths, isHidden } = await imp('scripts/gate-one-product.mjs');
  const urls = studentPages(ROOT).map((p) => p.url);
  for (const u of ['/', '/learn/', '/practice/', '/tests/', '/review/', '/prometric-mock.html', '/tools/pat/holepunch.html', '/games/play.html']) assert.ok(urls.includes(u), u + ' is a student page');
  for (const u of ['/onboarding.html', '/booster-map.html', '/tools/ochem/tree/dev.html', '/tools/qr/tiktoks/', '/tools/gc/tiktoks/q-vs-k-tiktok.html', '/tools/bio/sliding-filament-tiktok.html',
    '/tools/qr/proposals/agent-10-sarah/sarah-dashboard.html', '/tools/qr/proposals/agent-06-geometry/', '/tricks/series/', '/retold/', '/unified-mock.html', '/calendar.html', '/mocks-catalog.html'])
    assert.ok(!urls.includes(u), u + ' is hidden, internal or redirected');
  assert.ok(!urls.some((u) => /^\/(docs|scripts|test-screenshots|tests\/[^/]+)\//.test(u)), 'no docs, scripts, shots or test folders');
  const hidden = hiddenPaths(ROOT);
  assert.ok(!isHidden(hidden, '/tests/', 'tests/index.html'), 'the Tests door stays (spec 1.5 hides /tests/<subfolder>/ only)');
  assert.ok(isHidden(hidden, '/tools/qr/proposals/agent-01-audit/x.html', 'tools/qr/proposals/agent-01-audit/x.html'));
});

test('the palette and the color distance', async () => {
  const { palette, nearest, colorsIn, over } = await imp('scripts/gate-one-product.mjs');
  const pal = palette(ROOT);
  for (const c of [[245, 240, 232], [255, 253, 247], [13, 32, 24], [27, 58, 45], [201, 168, 76], [8, 104, 148], [255, 255, 255], [8, 21, 15]]) assert.ok(nearest(pal, c) < 1, c.join(','));
  assert.ok(nearest(pal, [255, 0, 255]) > 6, 'magenta is off the palette');
  assert.ok(nearest(pal, over([0, 158, 115, 0.10], [245, 240, 232])) < 1, 'a token wash over the page is in the palette');
  assert.deepEqual(colorsIn('a{color:#abc;background:rgba(1,2,3,.5)}'), [[170, 187, 204, 1], [1, 2, 3, 0.5]]);
});

test('the ratchet: a page fails only on a check it did not fail before; a new page must pass', async () => {
  const { ratchet } = await imp('scripts/gate-one-product.mjs');
  const r = ratchet({ '/a': ['fonts@390-light', 'header@390-light'] }, { '/a': ['fonts@390-light', 'colors@390-light'], '/new': ['header@390-light'] });
  assert.deepEqual(r.gained.map((g) => g.page + ' ' + g.check).sort(), ['/a colors@390-light', '/new header@390-light']);
  assert.equal(r.gained.find((g) => g.page === '/new').isNew, true);
  assert.deepEqual(r.fixed, [{ page: '/a', check: 'header@390-light' }]);
});

/* ---------- browser ---------- */
const BROWSER_CASES = [
  // [fixture name, html, the check that must fire, the width]
  ['good', GOOD, null],
  ['no-shell', GOOD.replace(/<script src="\/shared\/ace-shell\.js[^>]*><\/script>/, ''), 'shell'],
  ['exam-no-mark', GOOD.replace('<html lang="en" class="al">', '<html lang="en" class="al" data-ace-shell="off">'), 'logo'],
  ['exam-mark', GOOD.replace('<html lang="en" class="al">', '<html lang="en" class="al" data-ace-shell="off">').replace('<!--FIXTURE-->', '<img src="/shared/brand/ace-dat-mark-v1.svg" alt="" width="28" height="28">'), null],
  ['other-logo', inject('<div class="site-logo" style="height:40px">Ace Labs</div>'), 'other-logo'],
  ['other-logo-file', inject('<img src="/logo-old.svg" alt="" width="40" height="40">'), 'other-logo'],
  ['second-lockup', inject('<img src="/shared/brand/ace-dat-lockup-v1.svg" alt="" width="113" height="24">'), 'other-logo'],
  ['wordmark', inject('<h2>AceTheDAT</h2>'), 'wordmark'],
  ['old-logo-ref', inject('<img src="/shared/ace-dat-mark-reversed.svg" alt="" width="20" height="20">'), 'old-logo-ref'],
  ['fonts', inject('<p style="font-family:Georgia,serif">A serif line.</p>'), 'fonts'],
  ['colors', inject('<button class="btn" type="button" style="background:#ff00ff;color:#000">Go</button>'), 'colors'],
  ['targets', inject('<div><a href="#x" style="display:inline-block;padding:2px;font-size:12px">tiny</a></div>'), 'targets'],
  ['header', GOOD.replace('class="tool-head"', 'class="intro"'), 'header'],
  ['overflow', inject('<div style="width:900px;height:10px"></div>'), 'overflow'],
  ['console', inject('<script>console.error("boom")</script>'), 'console'],
];

test('browser: each check fires on a fixture page; the kit page passes every check', async (t) => {
  const site = await imp('scripts/lib/site.mjs');
  const gate = await imp('scripts/gate-one-product.mjs');
  let browser;
  try { browser = await site.launchChromium(); } catch (e) { t.skip('no Chromium here: ' + String(e.message).split('\n')[0]); return; }
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'one-product-'));
  let server;
  try {
    fs.symlinkSync(path.join(ROOT, 'shared'), path.join(dir, 'shared'), 'dir');
    fs.copyFileSync(path.join(ROOT, 'favicon.ico'), path.join(dir, 'favicon.ico'));
    for (const [name, html] of BROWSER_CASES) fs.writeFileSync(path.join(dir, name + '.html'), html);
    server = await site.startServer(dir, { csp: false });
    const pages = BROWSER_CASES.map(([name]) => ({ url: '/' + name + '.html', rel: name + '.html' }));
    const got = await gate.browserRun(pages, { base: server.url, jobs: 4, sizes: [390], themes: ['light'], pal: gate.palette(ROOT), browser });
    for (const [name, , want] of BROWSER_CASES) {
      const failing = Object.keys(got.get('/' + name + '.html')).map((k) => k.split('@')[0]);
      if (!want) assert.deepEqual(failing, [], name + ' passes every check: ' + JSON.stringify(got.get('/' + name + '.html')));
      else assert.ok(failing.includes(want), `${name}: ${want} fires (got ${failing.join(', ') || 'nothing'})`);
    }
    /* the kit page also passes on a desktop and in dark mode */
    const more = await gate.browserRun([pages[0]], { base: server.url, jobs: 2, sizes: [1280, 390], themes: ['dark', 'light'], pal: gate.palette(ROOT), browser });
    assert.deepEqual(more.get('/good.html'), {}, 'good.html at 1280 and 390, dark and light');
  } finally {
    if (server) await server.close();
    await browser.close();
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
