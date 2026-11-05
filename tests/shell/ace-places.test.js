/* <ace-places> (shared/places/ace-places-v1.js) and shared/kit-manifest.json (B1.2t).
   jsdom, plain node:test: it renders in a shadow root, marks the current place,
   lists only what `show` asks for, draws the brand's own logo inline, asks the
   network for nothing, and the manifest hashes match the files the portal,
   Apply and the site copy. */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { JSDOM, requestInterceptor } = require('jsdom');

const ROOT = path.resolve(__dirname, '../..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const JS = read('shared/places/ace-places-v1.js');
const HOST_CSS = read('shared/places/ace-places-v1.css');
const OPEN = [];
test.afterEach(() => { while (OPEN.length) { try { OPEN.pop().window.close(); } catch (e) { /* closed */ } } });

function boot(markup) {
  const requests = [];
  const dom = new JSDOM('<!doctype html><html><head></head><body>' + markup + '</body></html>', {
    url: 'https://acethedat-portal.netlify.app/student/dashboard',
    runScripts: 'outside-only',
    pretendToBeVisual: true,
    resources: { interceptors: [requestInterceptor((req) => { requests.push(req.url); return new Response('', { status: 404 }); })] },
  });
  OPEN.push(dom);
  const w = dom.window;
  const calls = [];
  w.fetch = (u) => { calls.push('fetch ' + u); return Promise.reject(new Error('no network in this test')); };
  const XO = w.XMLHttpRequest.prototype.open;
  w.XMLHttpRequest.prototype.open = function (m, u) { calls.push('xhr ' + u); return XO.apply(this, arguments); };
  w.eval(JS);
  return { w, doc: w.document, requests, calls };
}
const shadow = (doc, i = 0) => doc.querySelectorAll('ace-places')[i].shadowRoot;
const links = (sr) => [...sr.querySelectorAll('a.place')];

test('renders in a shadow root: the logo, then Study, Coaching and Apply, each to its login', () => {
  const { doc, w } = boot('<ace-places></ace-places>');
  const sr = shadow(doc);
  assert.ok(sr, 'an open shadow root');
  assert.equal(w.AcePlaces.version, '1');
  assert.deepEqual(links(sr).map((a) => a.textContent), ['Study', 'Coaching', 'Apply']);
  assert.deepEqual(links(sr).map((a) => a.getAttribute('href')), [
    'https://acelabs.netlify.app/',
    'https://acethedat-portal.netlify.app/login',
    'https://acethedat-aadsas-workbench.netlify.app/login.html',
  ]);
  assert.equal(sr.querySelector('nav').getAttribute('aria-label'), 'AceTheDAT places');
  const brand = sr.querySelector('.brand');
  assert.equal(brand.tagName, 'SPAN', 'no home attribute: the logo is a picture');
  assert.equal(brand.getAttribute('role'), 'img');
  assert.equal(brand.getAttribute('aria-label'), 'AceTheDAT', 'one product name');
  assert.ok(brand.querySelector('svg.lockup[aria-hidden="true"]') && brand.querySelector('svg.mark[aria-hidden="true"]'));
  assert.doesNotMatch(sr.innerHTML, /\bLabs\b/, 'never "Labs"');
  assert.equal(doc.querySelector('ace-places').children.length, 0, 'nothing in the light DOM');
});

test('the current place is marked: aria-current, mint at weight 700, a tick; only one', () => {
  for (const cur of ['study', 'coaching', 'apply']) {
    const { doc } = boot('<ace-places current="' + cur + '"></ace-places>');
    const marked = links(shadow(doc)).filter((a) => a.getAttribute('aria-current') === 'page');
    assert.equal(marked.length, 1, cur);
    assert.equal(marked[0].getAttribute('data-place'), cur);
  }
  const { doc } = boot('<ace-places current="nowhere"></ace-places>');
  assert.equal(shadow(doc).querySelectorAll('[aria-current]').length, 0, 'an unknown place marks nothing');
  const css = shadow(doc).querySelector('style').textContent;
  assert.match(css, /a\.place\[aria-current="page"\]\{color:var\(--ap-cur\);font-weight:700\}/);
  assert.match(css, /a\.place\[aria-current="page"\]::after\{[^}]*width:24px;height:3px;[^}]*background:var\(--ap-tick\)/, 'not by color alone');
});

test('show picks the places (in product order); the current one is always listed; attribute changes re-render', () => {
  const { doc } = boot('<ace-places current="coaching" show="study,coaching"></ace-places><ace-places current="coaching" show="apply study"></ace-places>');
  assert.deepEqual(links(shadow(doc, 0)).map((a) => a.textContent), ['Study', 'Coaching'], 'the portal without an application package');
  assert.deepEqual(links(shadow(doc, 1)).map((a) => a.textContent), ['Study', 'Coaching', 'Apply'], 'current kept, order fixed');
  const el = doc.querySelectorAll('ace-places')[0];
  el.setAttribute('show', 'study coaching apply');
  assert.deepEqual(links(shadow(doc, 0)).map((a) => a.textContent), ['Study', 'Coaching', 'Apply']);
  el.setAttribute('current', 'apply');
  assert.equal(shadow(doc, 0).querySelector('[aria-current="page"]').textContent, 'Apply');
});

test('home makes the logo a link; href-<place> overrides a link; neither takes a script URL', () => {
  const { doc } = boot('<ace-places current="apply" home="/student/dashboard" href-study="http://localhost:4000/" href-apply="javascript:alert(1)"></ace-places>' +
    '<ace-places home="javascript:alert(1)" href-coaching="//evil.example/"></ace-places>');
  const a = shadow(doc, 0).querySelector('a.brand');
  assert.ok(a);
  assert.equal(a.getAttribute('href'), '/student/dashboard');
  assert.equal(a.getAttribute('aria-label'), 'AceTheDAT');
  assert.deepEqual(links(shadow(doc, 0)).map((x) => x.getAttribute('href')), ['http://localhost:4000/', 'https://acethedat-portal.netlify.app/login', 'https://acethedat-aadsas-workbench.netlify.app/login.html']);
  assert.equal(shadow(doc, 1).querySelector('a.brand'), null, 'a script URL is no home');
  assert.equal(links(shadow(doc, 1))[1].getAttribute('href'), 'https://acethedat-portal.netlify.app/login', 'a protocol-relative URL is ignored');
  assert.doesNotMatch(shadow(doc, 0).innerHTML + shadow(doc, 1).innerHTML, /javascript:/);
});

test('no network: no stylesheet, font, image or script is requested, and nothing is fetched', async () => {
  const { doc, requests, calls, w } = boot('<ace-places current="study" theme="dark"></ace-places>');
  await new Promise((r) => w.setTimeout(r, 30));
  assert.deepEqual(requests, [], 'jsdom saw no subresource request');
  assert.deepEqual(calls, [], 'no fetch or XHR');
  const sr = shadow(doc);
  assert.equal(sr.querySelectorAll('link, img, script, iframe, object, use').length, 0);
  assert.doesNotMatch(sr.querySelector('style').textContent, /url\(|@import|@font-face/);
  assert.doesNotMatch(JS.replace(/\/\*[\s\S]*?\*\//g, ''), /\bfetch\(|XMLHttpRequest|import\(|\.src\s*=|<link|<img/, 'the source asks for nothing');
});

test('the logo is the brand file: the same two paths as shared/brand/ace-dat-lockup-v1.svg; the mark shows on phones', () => {
  const brand = read('shared/brand/ace-dat-lockup-v1.svg');
  const want = [...brand.matchAll(/<path fill="(#[0-9A-Fa-f]+)"(?: fill-rule="evenodd")? d="([^"]+)"/g)].map((m) => m[2]);
  const { doc } = boot('<ace-places></ace-places>');
  for (const cls of ['lockup', 'mark']) {
    const svg = shadow(doc).querySelector('svg.' + cls);
    assert.deepEqual([...svg.querySelectorAll('path')].map((p) => p.getAttribute('d')), want, cls);
  }
  assert.equal(shadow(doc).querySelector('svg.lockup').getAttribute('viewBox'), /viewBox="([^"]+)"/.exec(brand)[1]);
  assert.equal(shadow(doc).querySelector('svg.mark').getAttribute('viewBox'), /viewBox="([^"]+)"/.exec(read('shared/brand/ace-dat-mark-v1.svg'))[1]);
  const css = shadow(doc).querySelector('style').textContent;
  assert.match(css, /\.brand \.mark\{display:none;/);
  assert.match(css, /@media \(max-width:759px\)\{[^}]*\}?.*\.brand \.lockup\{display:none\}\.brand \.mark\{display:block\}/);
  assert.match(css, /\.gold\{fill:var\(--ap-gold\)\}/);
  assert.match(css, /--ap-gold:#C9A84C/);
});

test('light and dark: tokens v2 colors, every text passes 4.5:1 on the page and paper of its theme', () => {
  const { doc } = boot('<ace-places></ace-places>');
  const css = shadow(doc).querySelector('style').textContent;
  const block = (re) => re.exec(css)[1];
  const vars = (s) => Object.fromEntries([...s.matchAll(/--(ap-[\w-]+):(#[0-9A-Fa-f]{6})/g)].map((m) => [m[1], m[2]]));
  const light = vars(block(/:host\{([^}]*)\}/));
  const darkTheme = vars(block(/:host\(\[theme="dark"\]\)\{([^}]*)\}/));
  const darkAuto = vars(block(/@media \(prefers-color-scheme:dark\)\{:host\(:not\(\[theme="light"\]\)\)\{([^}]*)\}/));
  assert.deepEqual(darkAuto, darkTheme, 'the device setting and theme="dark" draw the same');
  const lum = (h) => { const c = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((x) => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4)); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
  const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  /* tokens v2 (shared/al-tokens.css): light page #f5f0e8 and paper #fffdf7; dark page #08150f and surface #0f1f17; the bench #0b1a12 */
  for (const bg of ['#f5f0e8', '#fffdf7']) for (const k of ['ap-ink', 'ap-ink-hi', 'ap-cur']) assert.ok(ratio(light[k], bg) >= 4.5, k + ' on ' + bg);
  for (const bg of ['#08150f', '#0f1f17', '#0b1a12']) for (const k of ['ap-ink', 'ap-ink-hi', 'ap-cur']) assert.ok(ratio(darkTheme[k], bg) >= 4.5, k + ' dark on ' + bg);
  assert.equal(light['ap-logo'], '#1B3A2D', 'the deep green logo on light');
  assert.equal(darkTheme['ap-logo'], '#F5F0E8', 'the cream (reversed) logo on dark');
  assert.equal(darkTheme['ap-cur'], '#6FF0C3');
  assert.equal(light['ap-cur'], '#096E4F');
});

test('targets: every link at least 44 x 44 px; the host stylesheet reserves the row; plain ASCII', () => {
  const { doc } = boot('<ace-places home="/"></ace-places>');
  const css = shadow(doc).querySelector('style').textContent;
  assert.match(css, /a\.place\{[^}]*min-width:44px;min-height:44px;/);
  assert.match(css, /\.brand\{[^}]*min-height:44px;min-width:44px;/);
  assert.match(HOST_CSS, /ace-places \{\s*display: block;\s*min-height: 44px;/);
  for (const [f, s] of [['ace-places-v1.js', JS], ['ace-places-v1.css', HOST_CSS]]) assert.doesNotMatch(s, /[^\x00-\x7e]/, f + ' is ASCII');
  assert.doesNotMatch(JS + HOST_CSS, /Ace Labs|\bLabs\b/);
});

test('kit-manifest.json: a SHA-256 for every kit file, and each one matches (the portal, Apply and the site copy these bytes)', () => {
  const m = JSON.parse(read('shared/kit-manifest.json'));
  assert.equal(m.v, 1);
  assert.deepEqual(Object.keys(m.files).sort(), ['shared/places/ace-places-v1.css', 'shared/places/ace-places-v1.js']);
  for (const [f, e] of Object.entries(m.files)) {
    const buf = fs.readFileSync(path.join(ROOT, f));
    const sha = crypto.createHash('sha256').update(buf).digest('hex');
    assert.equal(e.sha256, sha, f + ' changed: a kit file is never edited in place (new name, new entry); if this is the first release, record ' + sha);
    assert.equal(e.bytes, buf.length, f + ' size');
  }
});

test('defined once: a second copy of the script on the page is a no-op', () => {
  const { w, doc } = boot('<ace-places current="study"></ace-places>');
  assert.doesNotThrow(() => w.eval(JS));
  assert.equal(shadow(doc).querySelectorAll('a.place').length, 3);
});
