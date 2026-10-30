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
  assert.equal(S.version, '3');
  assert.deepEqual(doors(doc).map((a) => a.querySelector('.dl').textContent), ['Today', 'Learn', 'Practice', 'Tests', 'Review']);
  assert.deepEqual(doors(doc).map((a) => a.getAttribute('href')), ['/', '/learn/', '/practice/', '/tests/', '/review/']);
  assert.ok(doors(doc).every((a) => a.querySelector('svg.ico[aria-hidden="true"]')), 'an icon beside every word');
  assert.ok(!/canon/i.test(sr(doc).innerHTML), 'no Canon door');
  const today = doors(doc)[0].querySelector('svg').innerHTML;
  assert.match(today, /M3 17\.5h18/, 'Today is a sunrise over a horizon line');
  assert.doesNotMatch(today, /<circle/, 'never a clock face');
  assert.equal(sr(doc).querySelector('link[rel="stylesheet"]').getAttribute('href'), '/shared/ace-shell.css?v=3');
  assert.equal(sr(doc).querySelector('nav').getAttribute('aria-label'), 'Ace Labs');
});

test('the brand is the ACE DAT lockup, then Labs, linking to Today', () => {
  const { doc } = boot();
  const b = sr(doc).querySelector('a.brand');
  assert.equal(b.getAttribute('href'), '/');
  assert.equal(b.getAttribute('aria-label'), 'ACE DAT Labs, Today', 'the spoken name holds the visible words (label in name)');
  assert.equal(b.querySelector('img.lockup').getAttribute('src'), '/shared/brand/ace-dat-lockup-reversed-v1.svg');
  assert.equal(b.querySelector('img.lockup').getAttribute('alt'), '', 'the link carries the name');
  assert.equal(b.querySelector('.labs').textContent, 'Labs');
  assert.ok(fs.existsSync(path.join(ROOT, 'shared/brand/ace-dat-lockup-reversed-v1.svg')));
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
  assert.equal(say.parentElement.className, 'dl', 'inside the label, so the name reads "Review, 3 cards back today"');
  assert.equal(sr(doc).querySelector('.door[data-id="review"] .dl').textContent, 'Review, 3 cards back today');
  assert.equal(sr(doc).querySelector('.door[data-id="review"]').getAttribute('aria-label'), 'Review, 3 cards back today', 'the spoken name, with no stray space');
  assert.equal(S.due(), 3);
  S.setDue(1);
  assert.equal(say.textContent, ', 1 card back today');
  S.setDue(0);
  assert.equal(dot.hidden, true);
  assert.equal(say.textContent, '');
  assert.equal(sr(doc).querySelector('.door[data-id="review"]').getAttribute('aria-label'), null, 'no count, the visible word is the name');
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
  /* the gold top line is drawn inside the 64 px, so the bar, the body padding, --ace-shell-bottom and the lift agree */
  const bottomBar = /:host\(\[data-pos="bottom"\]\) \.bar \{([^}]*)\}/.exec(CSS)[1];
  assert.doesNotMatch(bottomBar, /border-top/, 'no border adds a 65th pixel');
  assert.match(bottomBar, /box-shadow: inset 0 1px 0 /);
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

test('a rescan never lifts twice: the kit toast waiting below, UI on --ace-shell-bottom, rotation, relift()', async () => {
  let fab = null, toast = null, own = null, out = null;
  const { w, doc, S, state } = boot({ narrow: true, htmlAttrs: ' data-ace-shell-pos="bottom"', before(w) {
    const vh = w.innerHeight;
    fab = fixedAt(w, 'fab', { top: vh - 80, bottom: vh - 24, height: 56, left: 310, right: 366, width: 56 }, 'position:fixed;bottom:24px;right:24px');
    /* the kit toast while hidden: bottom = --tabbar-h + 12px (76 px), opacity 0, translated 16 px down, so its
       transformed box reaches into the bar although its own box sits 12 px above it */
    toast = fixedAt(w, 'al-toast', { top: vh - 76 - 49 + 16, bottom: vh - 76 + 16, height: 49, left: 40, right: 350, width: 310 }, 'position:fixed;left:50%;bottom:76px;opacity:0;transform:translate(-50%,16px)');
    /* new work: bottom:calc(16px + var(--ace-shell-bottom,0px)), resolved by the browser to 80px */
    own = fixedAt(w, 'own', { top: vh - 80 - 48, bottom: vh - 80, height: 48, left: 0, right: 390, width: 390 }, 'position:fixed;left:0;right:0;bottom:80px');
    /* a page that asks to be left alone */
    out = fixedAt(w, 'out', { top: vh - 50, bottom: vh, height: 50, left: 0, right: 100, width: 100 }, 'position:fixed;bottom:0;left:0');
    out.setAttribute('data-ace-no-lift', '');
  } });
  await styled(w, doc);
  await new Promise((r) => setTimeout(r, 650));
  const once = fab.style.bottom;
  assert.match(once, /^calc\(/, 'the coach button is lifted');
  for (const [el, why] of [[toast, 'the hidden kit toast (its own bottom already clears the bar)'], [own, 'UI that reads --ace-shell-bottom'], [out, 'data-ace-no-lift']]) {
    assert.ok(!el.hasAttribute('data-ace-lifted'), why + ' is left alone');
    assert.notEqual(el.style.top, 'auto', why);
  }
  assert.equal(toast.style.bottom, '76px');
  assert.equal(own.style.bottom, '80px');
  /* relift() (UI shown later) and a phone rotation rescan: still lifted once */
  S.relift(); S.relift();
  assert.equal(fab.style.bottom, once, 'relift never adds a second 64 px');
  state.narrow = false; w.dispatchEvent(new w.Event('resize'));
  assert.equal(fab.style.bottom, '24px', 'landscape: the bar is at the top, the button is back');
  state.narrow = true; w.dispatchEvent(new w.Event('resize'));
  assert.equal(fab.style.bottom, once, 'portrait again: lifted once, from its own 24px');
  assert.ok(!toast.hasAttribute('data-ace-lifted'), 'the toast is still left alone after the rotation');
  assert.equal(toast.style.bottom, '76px');
  /* a timed section starts and ends */
  w.localStorage.setItem('acelabs.timed', JSON.stringify({ until: Date.now() + 60000 }));
  w.dispatchEvent(new w.Event('acelabs:timed'));
  w.localStorage.setItem('acelabs.timed', JSON.stringify({ until: 0 }));
  w.dispatchEvent(new w.Event('acelabs:timed'));
  assert.equal(fab.style.bottom, once);
  assert.ok(!toast.hasAttribute('data-ace-lifted'));
});

test('with the tab bar down, UI the page shows later is lifted by the watch', async () => {
  let bar = null;
  const { w, doc } = boot({ narrow: true, htmlAttrs: ' data-ace-shell-pos="bottom"', before(w) {
    const vh = w.innerHeight;
    bar = fixedAt(w, 'coachBar', { top: vh - 120, bottom: vh, height: 120, left: 0, right: 390, width: 390 }, 'position:fixed;left:0;right:0;bottom:0;display:none');
  } });
  await styled(w, doc);
  await new Promise((r) => setTimeout(r, 650));
  assert.ok(!bar.hasAttribute('data-ace-lifted'), 'not shown yet');
  bar.style.display = 'block';
  await new Promise((r) => setTimeout(r, 400));
  assert.ok(bar.hasAttribute('data-ace-lifted'), 'caught within a throttled rescan');
  assert.match(bar.style.bottom, /^calc\(/, 'lifted (jsdom folds the calc; the browser run checks the pixels)');
});

/* on a busy page the watch's rescan can come while a coach bar's slide-in has only just begun (still below
   the screen, so it is skipped); it is looked at again once the slide ends (GC Coach-Mode, QR Sarah bar) */
test('with the tab bar down, a bar still sliding in when the watch looks is lifted once it lands', async () => {
  let bar = null, land = null;
  const box = { top: 0, bottom: 0, height: 120, left: 0, right: 390, width: 390 };
  const { w, doc } = boot({ narrow: true, htmlAttrs: ' data-ace-shell-pos="bottom"', before(w) {
    box.top = w.innerHeight; box.bottom = w.innerHeight + 120;  /* translated 120 px down: parked */
    bar = fixedAt(w, 'coachBar', box, 'position:fixed;left:0;right:0;bottom:0');
  } });
  await styled(w, doc);
  await new Promise((r) => setTimeout(r, 650));
  assert.ok(!bar.hasAttribute('data-ace-lifted'), 'parked below the screen: left alone');
  /* shown: the slide-in starts, but it has not moved yet when the watch looks */
  const finished = new Promise((r) => { land = r; });
  bar.getAnimations = () => [{ playState: 'running', pending: false, finished, effect: { getComputedTiming: () => ({ endTime: 300 }) } }, { playState: 'running', pending: false, finished: new Promise(() => {}), effect: { getComputedTiming: () => ({ endTime: Infinity }) } }];
  bar.className = 'on';
  await new Promise((r) => setTimeout(r, 400));
  assert.ok(!bar.hasAttribute('data-ace-lifted'), 'still parked when the watch looks');
  /* the slide ends in view, under the bar: no page mutation follows, so only the end of the slide can catch it */
  box.top = w.innerHeight - 120; box.bottom = w.innerHeight;
  land();
  /* the rescan runs from a timer once the slide's promise settles: two ticks */
  await new Promise((r) => setTimeout(r, 0));
  await new Promise((r) => setTimeout(r, 0));
  assert.ok(bar.hasAttribute('data-ace-lifted'), 'lifted once the slide ends (an endless animation is not waited for)');
  assert.match(bar.style.bottom, /^calc\(/);
});

/* a bar the page dismissed below the screen with a fill-forwards animation: the finished animation stays in
   getAnimations() with its promise already settled. Waiting on it would rescan without end in microtasks
   (the tab froze in Chromium at load, on a rotation and when a timed section ended); it is not a slide, so
   it is not waited for. Each scan asks the parked bar for its animations once, so that count is the scan
   count; past 50 the mock answers [] so a regression fails here instead of hanging the run. */
function parkedBar(w, anim) {
  const box = { top: w.innerHeight + 7, bottom: w.innerHeight + 79, height: 72, left: 0, right: 390, width: 390 };
  const bar = fixedAt(w, 'coachBar', box, 'position:fixed;left:0;right:0;bottom:0');
  bar.box = box; bar.looks = 0;
  bar.getAnimations = () => (++bar.looks > 50 ? [] : [anim()]);
  return bar;
}
const ticks = async (n) => { for (let i = 0; i < n; i++) await new Promise((r) => setTimeout(r, 0)); };
test('with the tab bar down, a bar parked by a finished fill-forwards animation never starts an endless rescan', async () => {
  let bar = null;
  const { w, doc, S, state } = boot({ narrow: true, htmlAttrs: ' data-ace-shell-pos="bottom"', before(w) {
    bar = parkedBar(w, () => ({ playState: 'finished', pending: false, finished: Promise.resolve(), effect: { getComputedTiming: () => ({ endTime: 200 }) } }));
  } });
  await styled(w, doc);
  await new Promise((r) => setTimeout(r, 650));
  const settled = bar.looks;
  assert.ok(settled >= 1 && settled <= 4, 'looked at on the scans at load only (' + settled + ')');
  /* relift(), a rotation (drop, then a fresh scan) and a timed section ending: one look each, nothing queued */
  S.relift();
  state.narrow = false; w.dispatchEvent(new w.Event('resize'));
  state.narrow = true; w.dispatchEvent(new w.Event('resize'));
  w.localStorage.setItem('acelabs.timed', JSON.stringify({ until: Date.now() + 60000 }));
  w.dispatchEvent(new w.Event('acelabs:timed'));
  w.localStorage.setItem('acelabs.timed', JSON.stringify({ until: 0 }));
  w.dispatchEvent(new w.Event('acelabs:timed'));
  const after = bar.looks;
  assert.equal(after - settled, 3, 'relift, portrait again, the timed section ending: one scan each');
  await ticks(5);
  await new Promise((r) => setTimeout(r, 50));
  assert.equal(bar.looks, after, 'no rescan follows on its own');
  assert.ok(!bar.hasAttribute('data-ace-lifted'), 'parked: left alone');
});

/* belt and braces: a slide that keeps ending with the element still parked is followed 3 times in a row at
   most, and each follow-up scan runs from a timer, so the page always gets the event loop back */
test('with the tab bar down, slides that keep ending parked are followed at most 3 times in a row', async () => {
  let bar = null;
  const { w, doc, S, state } = boot({ narrow: true, htmlAttrs: ' data-ace-shell-pos="bottom"', before(w) {
    /* a mis-reported animation: says running, but its promise has already settled */
    bar = parkedBar(w, () => ({ playState: 'running', pending: false, finished: Promise.resolve(), effect: { getComputedTiming: () => ({ endTime: 200 }) } }));
  } });
  await styled(w, doc);
  await new Promise((r) => setTimeout(r, 650));
  await ticks(10);
  const settled = bar.looks;
  assert.ok(settled <= 8, 'a few looks at most (' + settled + ')');
  await ticks(10);
  assert.equal(bar.looks, settled, 'the follow-ups stop');
  S.relift();
  await ticks(10);
  assert.equal(bar.looks, settled + 1, 'past the cap a relift is one scan and nothing more');
  assert.ok(!bar.hasAttribute('data-ace-lifted'));
  /* shown at last: a scan that finds it in view lifts it and resets the count, so a later slide is followed again */
  const vh = w.innerHeight;
  bar.box.top = vh - 72; bar.box.bottom = vh;
  S.relift();
  assert.ok(bar.hasAttribute('data-ace-lifted'), 'in view under the bar: lifted');
  bar.box.top = vh + 7; bar.box.bottom = vh + 79;
  const before = bar.looks;
  state.narrow = false; w.dispatchEvent(new w.Event('resize'));
  state.narrow = true; w.dispatchEvent(new w.Event('resize'));
  await ticks(10);
  assert.ok(bar.looks - before >= 2 && bar.looks - before <= 4, 'parked again after a rotation: followed again, within the cap (' + (bar.looks - before) + ')');
  assert.ok(!bar.hasAttribute('data-ace-lifted'), 'put back by the rotation and parked: left alone');
});

/* the kit's own flying Ace Card: a source card whose box ends under the bar. The watch rescans 300 ms
   into the 620 ms flight; lifting the clone then would move its landing 64 px up, off the Review door. */
test('with the tab bar down, AL.fly is never lifted mid-flight and lands on the Review door', async () => {
  const FLY = /\.al\.flying\{[^}]*\}/.exec(read('shared/al-kit.css'))[0];
  let src = null;
  const { w, doc, S } = boot({ narrow: true, htmlAttrs: ' data-ace-shell-pos="bottom"', before(w) {
    const st = w.document.createElement('style'); st.textContent = FLY; w.document.head.appendChild(st);
    src = w.document.createElement('div'); src.className = 'acecard'; src.id = 'src'; src.textContent = 'Ace Card';
    w.document.body.appendChild(src);
  } });
  await styled(w, doc);
  await new Promise((r) => setTimeout(r, 650));
  w.eval(KIT);
  /* 768 px tall: the bar starts at 704; the card spans 592 to 744, so its own box reaches under the bar */
  const vh = w.innerHeight;
  const card = { left: 16, right: 374, width: 358, top: vh - 176, bottom: vh - 24, height: 152 };
  const icon = S.doorEl('review');
  const dot = { left: 337, right: 359, width: 22, top: vh - 51, bottom: vh - 29, height: 22 };
  const rect = w.Element.prototype.getBoundingClientRect;
  w.Element.prototype.getBoundingClientRect = function () {
    if (this === icon) return dot;
    if (this === src || (this.classList && this.classList.contains('flying'))) return card;
    return rect.call(this);
  };
  /* jsdom has no Web Animations: record the flight and finish it by hand */
  let flight = null;
  w.Element.prototype.animate = function (frames, opts) { flight = { el: this, frames, opts, onfinish: null }; return flight; };
  let landed = false;
  w.AL.fly(src, () => { landed = true; });
  const clone = doc.querySelector('.al.flying');
  assert.ok(clone && flight && flight.el === clone, 'the clone flies');
  assert.equal(w.getComputedStyle(clone).position, 'fixed');
  assert.ok(clone.hasAttribute('data-ace-no-lift'), 'the kit marks its flight for the shell');
  await new Promise((r) => setTimeout(r, 400));
  S.relift();
  assert.ok(!clone.hasAttribute('data-ace-lifted'), 'never lifted by the watch or a relift');
  assert.equal(clone.style.top, card.top + 'px');
  assert.equal(clone.style.bottom, '');
  /* the last frame carries the card's centre onto the Review icon's centre */
  const end = /translate\((-?[\d.]+)px,\s*(-?[\d.]+)px\)/.exec(flight.frames[flight.frames.length - 1].transform);
  assert.ok(end, 'the last frame is a translate');
  assert.ok(Math.abs(card.left + card.width / 2 + Number(end[1]) - (dot.left + dot.width / 2)) < 0.5, 'lands on the door (x)');
  assert.ok(Math.abs(card.top + card.height / 2 + Number(end[2]) - (dot.top + dot.height / 2)) < 0.5, 'lands on the door (y)');
  flight.onfinish();
  assert.ok(landed && !clone.parentNode, 'the clone is gone once it lands');
});

test('a decorative layer is never lifted; a toast that ignores the pointer still is; UI that leaves is put back', async () => {
  let deco = null, note = null, fab = null;
  const { w, doc, S, state } = boot({ narrow: true, htmlAttrs: ' data-ace-shell-pos="bottom"', before(w) {
    const vh = w.innerHeight;
    /* aria-hidden and pointer-events:none: nothing to read or press, so nothing to lift */
    deco = fixedAt(w, 'deco', { top: vh - 90, bottom: vh - 10, height: 80, left: 0, right: 390, width: 390 }, 'position:fixed;left:0;right:0;bottom:10px;pointer-events:none');
    deco.setAttribute('aria-hidden', 'true');
    /* review/index.html: a role=status toast at bottom:22px with pointer-events:none must still clear the bar */
    note = fixedAt(w, 'note', { top: vh - 62, bottom: vh - 22, height: 40, left: 100, right: 290, width: 190 }, 'position:fixed;left:50%;bottom:22px;pointer-events:none');
    note.setAttribute('role', 'status');
    fab = fixedAt(w, 'fab', { top: vh - 80, bottom: vh - 24, height: 56, left: 310, right: 366, width: 56 }, 'position:fixed;bottom:24px;right:24px');
  } });
  await styled(w, doc);
  await new Promise((r) => setTimeout(r, 650));
  assert.ok(!deco.hasAttribute('data-ace-lifted'), 'the decorative layer is left alone');
  assert.equal(deco.style.bottom, '10px');
  assert.ok(note.hasAttribute('data-ace-lifted'), 'the status toast is lifted');
  assert.ok(fab.hasAttribute('data-ace-lifted'));
  const once = fab.style.bottom;
  /* the button leaves the page: put back as it was and forgotten */
  fab.remove();
  S.relift();
  assert.equal(fab.style.bottom, '24px');
  assert.equal(fab.style.top, '');
  assert.ok(!fab.hasAttribute('data-ace-lifted'));
  /* it comes back: lifted once, and still put back when the bar goes to the top */
  doc.body.appendChild(fab);
  S.relift(); S.relift();
  assert.equal(fab.style.bottom, once);
  state.narrow = false; w.dispatchEvent(new w.Event('resize'));
  assert.equal(fab.style.bottom, '24px');
  assert.ok(!fab.hasAttribute('data-ace-lifted') && !note.hasAttribute('data-ace-lifted'));
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
  /* no watch either: a later class change lifts nothing */
  fab.className = 'on';
  await new Promise((r) => setTimeout(r, 400));
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

test('ace-shell.css only changes with a new VERSION (no page names its URL, so no gate sees it)', () => {
  /* the CSS loads as /shared/ace-shell.css?v=<VERSION> under an immutable cache. When this fails because
     ace-shell.css changed: bump VERSION in ace-shell.js, bump ace-shell.js ?v= on every includer, and
     record the new hash here. */
  const PINNED = { '3': '81543f99e4999b63' };
  const v = /var VERSION = '(\d+)'/.exec(SHELL)[1];
  const sha = require('node:crypto').createHash('sha256').update(CSS).digest('hex').slice(0, 16);
  assert.equal(PINNED[v], sha, 'ace-shell.css changed under VERSION ' + v);
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
