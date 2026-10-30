/* Shell v2: shared/ace-shell.js and shared/ace-shell.css. jsdom, plain node:test.
   Five doors, the current door marked three ways, the Review dot from
   acelabs.v1.dueToday, the bottom tab bar only on pages that opt in, and every
   v1 hide rule and the ?student= carry-over kept. */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

const ROOT = path.resolve(__dirname, '../..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const SHELL = read('shared/ace-shell.js');
const CSS = read('shared/ace-shell.css');
const KIT = read('shared/al-kit.js');
const OPEN = [];
test.afterEach(() => { while (OPEN.length) { try { OPEN.pop().window.close(); } catch (e) { /* closed */ } } });

function boot(opts = {}) {
  const dom = new JSDOM('<!doctype html><html' + (opts.htmlAttrs || '') + '><head></head><body>' + (opts.body || '<main><p>page</p></main>') + '</body></html>',
    { runScripts: 'outside-only', pretendToBeVisual: true, url: 'http://localhost' + (opts.path || '/learn/') });
  OPEN.push(dom);
  const w = dom.window;
  const state = { narrow: !!opts.narrow, reduced: !!opts.reduced };
  w.matchMedia = (q) => ({ matches: /reduce/.test(q) ? state.reduced : /max-width/.test(q) ? state.narrow : false, media: q, addListener() {}, removeListener() {} });
  w.scrollTo = () => {};
  /* a laid-out bar: five 100 px doors from x = 600 */
  w.Element.prototype.getBoundingClientRect = function () {
    const a = this.closest && this.closest('a.door');
    const ids = ['today', 'learn', 'practice', 'tests', 'review'];
    if (a) { const i = ids.indexOf(a.getAttribute('data-id')); const left = 600 + i * 100 + (this === a ? 0 : 40); const width = this === a ? 100 : 20; return { left, right: left + width, width, top: 0, bottom: 60, height: 60 }; }
    if (this.classList && this.classList.contains('doors')) return { left: 600, right: 1100, width: 500, top: 0, bottom: 60, height: 60 };
    return { left: 0, right: 0, width: 0, top: 0, bottom: 0, height: 0 };
  };
  for (const [k, v] of Object.entries(opts.storage || {})) w.localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v));
  if (opts.before) opts.before(w);
  w.eval(SHELL);
  return { w, doc: w.document, S: w.AceShell, state };
}
const sr = (doc) => doc.getElementById('ace-shell').shadowRoot;
/* the bar's stylesheet arrives (jsdom loads no resources), then two frames */
async function styled(w, doc) {
  sr(doc).querySelector('link[rel="stylesheet"]').dispatchEvent(new w.Event('load'));
  await new Promise((r) => w.requestAnimationFrame(() => w.requestAnimationFrame(r)));
}
const doors = (doc) => [...sr(doc).querySelectorAll('a.door')];

test('five doors, plain words, an icon each; the Canon is no longer a door', () => {
  const { doc, S } = boot();
  assert.equal(S.version, '2');
  assert.deepEqual(doors(doc).map((a) => a.querySelector('.dl').textContent), ['Today', 'Learn', 'Practice', 'Tests', 'Review']);
  assert.deepEqual(doors(doc).map((a) => a.getAttribute('href')), ['/', '/learn/', '/practice/', '/tests/', '/review/']);
  assert.ok(doors(doc).every((a) => a.querySelector('svg.ico[aria-hidden="true"]')), 'an icon beside every word');
  assert.ok(!/canon/i.test(sr(doc).innerHTML), 'no Canon door');
  const today = doors(doc)[0].querySelector('svg').innerHTML;
  assert.match(today, /M3 17\.5h18/, 'Today is a sunrise over a horizon line');
  assert.doesNotMatch(today, /<circle/, 'never a clock face');
  assert.equal(sr(doc).querySelector('link[rel="stylesheet"]').getAttribute('href'), '/shared/ace-shell.css?v=2');
  assert.equal(sr(doc).querySelector('nav').getAttribute('aria-label'), 'Ace Labs');
});

test('the brand is the ACE DAT lockup, then Labs, linking to Today', () => {
  const { doc } = boot();
  const b = sr(doc).querySelector('a.brand');
  assert.equal(b.getAttribute('href'), '/');
  assert.equal(b.getAttribute('aria-label'), 'Ace Labs, Today');
  assert.equal(b.querySelector('img.lockup').getAttribute('src'), '/shared/brand/ace-dat-lockup-reversed.svg');
  assert.equal(b.querySelector('img.lockup').getAttribute('alt'), '', 'the link carries the name');
  assert.equal(b.querySelector('.labs').textContent, 'Labs');
  assert.ok(fs.existsSync(path.join(ROOT, 'shared/brand/ace-dat-lockup-reversed.svg')));
});

test('the current door is marked three ways: aria-current, a mint 800 label, the bead or the tick', async () => {
  const { doc, S, w } = boot({ path: '/review/' });
  assert.equal(S.door, 'review', 'v1 kept AceShell.door as the current door id');
  assert.equal(S.current, 'review');
  const cur = doors(doc).filter((a) => a.getAttribute('aria-current') === 'page');
  assert.equal(cur.length, 1);
  assert.equal(cur[0].getAttribute('data-id'), 'review');
  assert.match(CSS, /\.door\[aria-current="page"\]\s*\{\s*color:\s*var\(--mint-ink\);\s*font-weight:\s*800;/);
  assert.match(CSS, /--mint-ink:\s*#6FF0C3/);
  assert.match(CSS, /\.door\[aria-current="page"\]::after\s*\{[^}]*width:\s*28px;[^}]*height:\s*3px;/, 'the phone tick');
  const bead = sr(doc).querySelector('.bead');
  assert.ok(!bead.classList.contains('on'), 'no bead before the bar is styled');
  await styled(w, doc);
  assert.ok(bead.classList.contains('on'), 'the bead is placed');
  assert.equal(bead.style.left, (4 * 100 + 50) + 'px', 'under the Review icon (from the start of the doors)');
  const ring = sr(doc).querySelector('.ring');
  assert.equal(ring.style.left, (100 + 2) + 'px', 'the ring starts at Learn');
  assert.equal(ring.style.width, (400 - 4) + 'px', 'and ends at Review');
});

test('the bead travels from the last door in this tab, and cuts under reduced motion', async () => {
  for (const reduced of [false, true]) {
    const { doc, w } = boot({ path: '/tests/', reduced, before: (win) => win.sessionStorage.setItem('al.lastDoor', 'learn') });
    const bead = sr(doc).querySelector('.bead');
    const seen = [];
    Object.defineProperty(bead.style, 'left', { configurable: true, get() { return this.getPropertyValue('left'); }, set(v) { seen.push(v); this.setProperty('left', v); } });
    await styled(w, doc);
    assert.deepEqual(seen, reduced ? ['350px'] : ['150px', '350px'], reduced ? 'a cut' : 'starts under Learn, ends under Tests');
    assert.equal(bead.style.left, (3 * 100 + 50) + 'px', 'ends under Tests');
    assert.equal(bead.style.transition, '', 'the transition is back on after the jump to the start');
    assert.equal(w.sessionStorage.getItem('al.lastDoor'), 'tests');
  }
  assert.match(CSS, /\.bead\s*\{[^}]*transition:\s*left 420ms/);
  assert.match(CSS, /prefers-reduced-motion: reduce\)\s*\{\s*\.door, \.bead \{ transition: none !important; \}/);
});

test('door rules: sections light Practice, results light Tests, Sheets live in Learn, Settings in Today', () => {
  const { S } = boot();
  const cases = {
    '/': 'today', '/ace-labs.html': 'today', '/settings/': 'today', '/onboarding.html': 'today', '/for-retakers.html': 'today',
    '/learn/': 'learn', '/learn/sheets/gc-thermo-delta-g.html': 'learn', '/tools/rc-retold/': 'learn', '/cheat-sheets.html': 'learn',
    '/practice/': 'practice', '/bio/': 'practice', '/qr/': 'practice', '/tools/gc/titration.html': 'practice', '/games/': 'practice',
    '/tests/': 'tests', '/performance/': 'tests', '/tools/mock/full.html': 'tests', '/diagnostic.html': 'tests', '/tools/minitests/': 'tests',
    '/review/': 'review', '/nowhere-else': null
  };
  for (const [p, d] of Object.entries(cases)) assert.equal(S.doorFor(p), d, p);
});

test('the Review dot reads acelabs.v1.dueToday: a dot, never a number, and a spoken count', () => {
  const now = Date.now();
  const { doc, S, w } = boot({ storage: { 'acelabs.v1.dueToday': { v: 1, n: 3, later: [now + 864e5], at: now } } });
  const dot = sr(doc).querySelector('.door[data-id="review"] .due');
  const say = sr(doc).querySelector('[data-due-sr]');
  assert.equal(dot.hidden, false);
  assert.equal(dot.textContent, '', 'never a number');
  assert.equal(say.textContent, ', 3 cards back today');
  assert.equal(S.due(), 3);
  S.setDue(1);
  assert.equal(say.textContent, ', 1 card back today');
  S.setDue(0);
  assert.equal(dot.hidden, true);
  assert.equal(say.textContent, '');
  /* a later due time that has passed counts without any page listing misses */
  w.localStorage.setItem('acelabs.v1.dueToday', JSON.stringify({ v: 1, n: 0, later: [now - 1000, now + 864e5], at: now - 864e5 }));
  assert.equal(S.refreshDue(), 1);
  assert.equal(dot.hidden, false);
  /* ace-progress tells the page at once */
  w.dispatchEvent(new w.CustomEvent('acelabs:due', { detail: { n: 0 } }));
  assert.equal(dot.hidden, true);
  /* and other tabs through storage */
  w.localStorage.setItem('acelabs.v1.dueToday', JSON.stringify({ v: 1, n: 2, later: [] }));
  w.dispatchEvent(new w.StorageEvent('storage', { key: 'acelabs.v1.dueToday' }));
  assert.equal(S.due(), 2);
  /* a miss with no date of its own: counted on its next day only, then it rests */
  w.localStorage.setItem('acelabs.v1.dueToday', JSON.stringify({ v: 1, n: 0, later: [], once: [now - 1000, now - 864e5 - 1000, now + 3600e3] }));
  assert.equal(S.refreshDue(), 1, 'today\'s next-day return only; yesterday\'s has rested, tomorrow\'s is not back yet');
  /* a broken cache never breaks the bar */
  w.localStorage.setItem('acelabs.v1.dueToday', '{nope');
  assert.equal(S.refreshDue(), 0);
});

test('no key, no dot', () => {
  const { doc, S } = boot();
  assert.equal(sr(doc).querySelector('.due').hidden, true);
  assert.equal(S.due(), 0);
});

test('the bottom tab bar only where a page opts in, and only on phones', () => {
  let r = boot({ narrow: true });
  assert.equal(r.S.position(), 'top', 'phones keep the top bar during migration');
  assert.equal(r.doc.getElementById('ace-shell').getAttribute('data-pos'), 'top');
  r = boot({ narrow: true, htmlAttrs: ' data-ace-shell-pos="top"' });
  assert.equal(r.S.position(), 'top');
  r = boot({ narrow: true, htmlAttrs: ' data-ace-shell-pos="bottom"' });
  assert.equal(r.S.position(), 'bottom');
  assert.equal(r.doc.getElementById('ace-shell').getAttribute('data-pos'), 'bottom');
  assert.ok(r.doc.documentElement.classList.contains('ace-shell-shown'));
  r = boot({ narrow: false, htmlAttrs: ' data-ace-shell-pos="bottom"' });
  assert.equal(r.S.position(), 'top', 'desktop is always the top bar');
  const doc = r.doc.getElementById('ace-shell-doc').textContent;
  assert.match(doc, /@media \(max-width:759px\)\{[^]*html\[data-ace-shell-pos="bottom"\] #ace-shell\{position:fixed;left:0;right:0;bottom:0;z-index:160;min-height:calc\(64px \+ env\(safe-area-inset-bottom,0px\)\)\}/);
  assert.match(doc, /html\.ace-shell-on\.ace-shell-shown\[data-ace-shell-pos="bottom"\] body\{padding-bottom:calc\(64px/, 'room for the bar, only while it shows');
  assert.match(CSS, /:host\(\[data-pos="bottom"\]\) \.in \{ height: 64px; \}/);
  assert.match(CSS, /:host\(\[data-pos="bottom"\]\) \.door\[aria-current="page"\]::after \{ top: 0;/, 'the tick sits on the top edge of a bottom bar');
});

test('a page that switches to the bottom bar later is followed', async () => {
  const { doc, S } = boot({ narrow: true });
  doc.documentElement.setAttribute('data-ace-shell-pos', 'bottom');
  await new Promise((r) => setTimeout(r, 0));
  assert.equal(S.position(), 'bottom');
  assert.equal(doc.getElementById('ace-shell').getAttribute('data-pos'), 'bottom');
});

/* the phone tab bar never sits on a page's own fixed bottom UI (bio-cell's coach button, say) */
function fixedAt(w, id, box, style) {
  const el = w.document.createElement('button');
  el.id = id; el.textContent = 'C'; el.setAttribute('style', style);
  w.document.body.appendChild(el);
  const rect = w.Element.prototype.getBoundingClientRect;
  w.Element.prototype.getBoundingClientRect = function () { return this.id === id ? box : rect.call(this); };
  return el;
}
test('with the tab bar down, a fixed bottom button is lifted above it, and put back when the bar goes', async () => {
  let fab = null, overlay = null, high = null;
  const { w, doc, S, state } = boot({ narrow: true, htmlAttrs: ' data-ace-shell-pos="bottom"', before(w) {
    const vh = w.innerHeight;
    fab = fixedAt(w, 'fab', { top: vh - 80, bottom: vh - 24, height: 56, left: 310, right: 366, width: 56 }, 'position:fixed;bottom:24px;right:24px');
    overlay = fixedAt(w, 'veil', { top: 0, bottom: vh, height: vh, left: 0, right: 390, width: 390 }, 'position:fixed;inset:0');
    high = fixedAt(w, 'high', { top: vh - 200, bottom: vh - 150, height: 50, left: 0, right: 100, width: 100 }, 'position:fixed;bottom:150px;left:0');
  } });
  await styled(w, doc);
  await new Promise((r) => setTimeout(r, 650));
  assert.equal(S.position(), 'bottom');
  /* jsdom cannot parse env() inside calc(), so read what the shell asks for from its source; the browser run checks the result */
  assert.match(fab.style.bottom, /^calc\(/, 'lifted');
  assert.match(SHELL, /el\.style\.bottom = 'calc\(' \+ off \+ 'px \+ 64px \+ env\(safe-area-inset-bottom, 0px\)\)'/, 'its own offset kept, plus the bar and the safe area');
  assert.equal(fab.style.top, 'auto');
  assert.ok(fab.hasAttribute('data-ace-lifted'));
  assert.ok(!overlay.hasAttribute('data-ace-lifted') && overlay.style.top !== 'auto', 'a full-screen layer is left alone');
  assert.equal(high.style.bottom, '150px', 'UI already above the bar is left alone');
  /* desktop width: the bar is at the top, the button goes back */
  state.narrow = false;
  w.dispatchEvent(new w.Event('resize'));
  assert.equal(S.position(), 'top');
  assert.equal(fab.style.bottom, '24px');
  assert.equal(fab.style.top, '');
  assert.ok(!fab.hasAttribute('data-ace-lifted'));
  /* phone again, then a timed section hides the bar: back where it was */
  state.narrow = true;
  w.dispatchEvent(new w.Event('resize'));
  assert.ok(fab.hasAttribute('data-ace-lifted'));
  w.localStorage.setItem('acelabs.timed', JSON.stringify({ until: Date.now() + 60000 }));
  w.dispatchEvent(new w.Event('acelabs:timed'));
  assert.equal(fab.style.bottom, '24px');
  assert.equal(typeof S.relift, 'function');
  const docCss = doc.getElementById('ace-shell-doc').textContent;
  assert.match(docCss, /html\.ace-shell-on\.ace-shell-shown\[data-ace-shell-pos="bottom"\]\{--ace-shell-bottom:calc\(64px \+ env\(safe-area-inset-bottom,0px\)\)\}/, 'new work reads --ace-shell-bottom');
});

test('pages that keep the top bar are never touched', async () => {
  let fab = null;
  const { w, doc } = boot({ narrow: true, before(w) {
    fab = fixedAt(w, 'fab', { top: w.innerHeight - 80, bottom: w.innerHeight - 24, height: 56, left: 310, right: 366, width: 56 }, 'position:fixed;bottom:24px;right:24px');
  } });
  await styled(w, doc);
  await new Promise((r) => setTimeout(r, 650));
  assert.equal(fab.style.bottom, '24px');
  assert.ok(!fab.hasAttribute('data-ace-lifted'));
});

test('hidden while a timed section runs, and back when it ends', () => {
  const { doc, w } = boot({ storage: { 'acelabs.timed': { until: Date.now() + 60000 } } });
  const host = doc.getElementById('ace-shell');
  assert.equal(host.hidden, true);
  assert.ok(!doc.documentElement.classList.contains('ace-shell-shown'), 'no tab-bar room while hidden');
  w.localStorage.setItem('acelabs.timed', JSON.stringify({ until: 0 }));
  w.dispatchEvent(new w.Event('acelabs:timed'));
  assert.equal(host.hidden, false);
  assert.ok(doc.documentElement.classList.contains('ace-shell-shown'));
});

test('never mounts on ?embed, on data-ace-shell="off", or inside a frame', () => {
  let r = boot({ path: '/learn/?embed=1' });
  assert.equal(r.doc.getElementById('ace-shell'), null);
  r = boot({ htmlAttrs: ' data-ace-shell="off"' });
  assert.equal(r.doc.getElementById('ace-shell'), null);
  assert.equal(r.doc.getElementById('ace-shell-doc'), null, 'nothing added to the page');
});

test('never mounts inside a frame (engine modals, the portal embed)', async () => {
  const { doc } = boot();
  const f = doc.createElement('iframe');
  doc.body.appendChild(f);
  await new Promise((r) => setTimeout(r, 0));
  const fw = f.contentWindow;
  assert.notEqual(fw.top, fw.self, 'a framed window');
  fw.matchMedia = () => ({ matches: false });
  fw.eval(SHELL);
  assert.equal(fw.document.getElementById('ace-shell'), null);
  assert.equal(fw.document.getElementById('ace-shell-doc'), null);
});

test('print hides it; legacy navs and the old chip are retired', () => {
  const { doc } = boot({ body: '<header class="al-top"><nav class="al-nav"><a href="/">Home</a></nav></header><header class="al-top" id="keep"><h1>Tool</h1></header><a id="al-home">Ace Labs</a>' });
  const css = doc.getElementById('ace-shell-doc').textContent;
  assert.match(css, /@media print\{#ace-shell\{display:none!important\}/);
  assert.match(css, /html\.ace-shell-on #al-home\{display:none!important\}/);
  assert.ok(doc.querySelector('header.al-top').classList.contains('ace-legacy-nav'));
  assert.ok(!doc.getElementById('keep').classList.contains('ace-legacy-nav'), 'a tool header without the old links stays');
  assert.ok(doc.documentElement.classList.contains('ace-shell-on'));
});

test('?student= rides on every door and the brand', () => {
  const { doc } = boot({ path: '/review/?student=rec%20A1&x=2' });
  const hrefs = doors(doc).map((a) => a.getAttribute('href'));
  assert.deepEqual(hrefs, ['/?student=rec%20A1', '/learn/?student=rec%20A1', '/practice/?student=rec%20A1', '/tests/?student=rec%20A1', '/review/?student=rec%20A1']);
  assert.equal(sr(doc).querySelector('a.brand').getAttribute('href'), '/?student=rec%20A1');
});

test('fonts: the shell declares its two faces on the document under private names, from the versioned files', () => {
  const { doc } = boot();
  const css = doc.getElementById('ace-shell-doc').textContent;
  assert.match(css, /font-family:"Ace Shell Sans";src:url\("\/shared\/fonts\/dmsans-v1\.woff2"\)/);
  assert.match(css, /font-family:"Ace Shell Sora";src:url\("\/shared\/fonts\/sora-v1\.woff2"\)/);
  assert.doesNotMatch(css, /Hanken|Playfair|fonts\.googleapis|fonts\.gstatic/);
  assert.ok(fs.existsSync(path.join(ROOT, 'shared/fonts/dmsans-v1.woff2')) && fs.existsSync(path.join(ROOT, 'shared/fonts/sora-v1.woff2')));
  const al = read('shared/al-fonts.css');
  assert.match(al, /fonts\/dmsans-v1\.woff2/);
  assert.match(al, /fonts\/sora-v1\.woff2/, 'the same files the kit loads, so nothing downloads twice');
  assert.doesNotMatch(CSS, /Hanken|Georgia|Playfair/);
});

test('the kit finds the shell: AL.door targets the Review icon in the shadow root, AL.setDue goes through the shell', () => {
  const { doc, w, S } = boot();
  w.eval(KIT);
  const target = w.AL.door('review');
  assert.ok(target && target.classList.contains('di'));
  assert.equal(S.doorEl('review'), target);
  w.AL.setDue(4);
  assert.equal(sr(doc).querySelector('[data-due-sr]').textContent, ', 4 cards back today');
});

test('targets: every door is at least 44 px; copy is plain ASCII', () => {
  assert.match(CSS, /\.door \{[^}]*min-width: 44px;[^}]*min-height: 44px;/);
  assert.match(CSS, /\.brand \{[^}]*min-height: 44px;/);
  for (const [f, s] of [['ace-shell.js', SHELL], ['ace-shell.css', CSS]]) assert.doesNotMatch(s, /[^\x00-\x7e]/, f + ' is ASCII');
  assert.doesNotMatch(SHELL, /acethedat-portal|canon\//, 'no Canon door or portal link left in the shell');
});

test('contrast on the bar: every text color passes 4.5:1 on both ends of the gradient', () => {
  const host = /:host \{([^}]*)\}/.exec(CSS)[1];
  const v = (n) => new RegExp('--' + n + ':\\s*(#[0-9a-fA-F]{6})').exec(host)[1];
  const lum = (h) => { const c = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((x) => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4)); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
  const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  for (const bg of ['bg', 'bg-deep']) {
    for (const fg of ['ink', 'ink-2', 'mint-ink']) assert.ok(ratio(v(fg), v(bg)) >= 4.5, fg + ' on ' + bg + ': ' + ratio(v(fg), v(bg)).toFixed(2));
    for (const mark of ['mint', 'gold-hi']) assert.ok(ratio(v(mark), v(bg)) >= 3, mark + ' as a mark on ' + bg);
  }
});
