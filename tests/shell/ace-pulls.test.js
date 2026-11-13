/* shared/ace-pulls.js (B1.2t): three lists (the release snapshot, the last good
   list in localStorage acelabs.v1.pulls, the live list from the approvals
   function, cached 60 s in sessionStorage), a pull in any one wins, and it never
   fails open. jsdom, plain node:test, fetch stubbed per URL. */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

const ROOT = path.resolve(__dirname, '../..');
const SRC = fs.readFileSync(path.join(ROOT, 'shared/ace-pulls.js'), 'utf8');
const KEY = 'acelabs.v1.pulls';
const SNAP = '/content/approvals/pulls-snapshot.json';
const LIVE = '/.netlify/functions/approvals?pulls=1';
const OPEN = [];
test.afterEach(() => { while (OPEN.length) { try { OPEN.pop().window.close(); } catch (e) { /* closed */ } } });

const ok = (body) => () => Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(body) });
const status = (n) => () => Promise.resolve({ ok: false, status: n, json: () => Promise.resolve({}) });
const offline = () => () => Promise.reject(new TypeError('Failed to fetch'));
const badJson = () => () => Promise.resolve({ ok: true, status: 200, json: () => Promise.reject(new SyntaxError('Unexpected token <')) });
const never = () => () => new Promise(() => {});

/* routes: { snapshot, live } handlers; local / session: seeds; throwLocal / throwSession: the store getter throws */
function boot(o = {}) {
  const dom = new JSDOM('<!doctype html><html><head></head><body></body></html>', { url: 'https://acelabs.netlify.app/tools/bio-retold/', runScripts: 'outside-only', pretendToBeVisual: true });
  OPEN.push(dom);
  const w = dom.window;
  const calls = [];
  if (o.local) w.localStorage.setItem(KEY, JSON.stringify(o.local));
  if (o.session) w.sessionStorage.setItem(KEY, JSON.stringify(o.session));
  if (o.throwLocal) Object.defineProperty(w, 'localStorage', { configurable: true, get() { throw new w.DOMException('blocked', 'SecurityError'); } });
  if (o.throwSession) Object.defineProperty(w, 'sessionStorage', { configurable: true, get() { throw new w.DOMException('blocked', 'SecurityError'); } });
  if (o.fullLocal) { const S = w.Storage.prototype.setItem; w.Storage.prototype.setItem = function () { throw new w.DOMException('full', 'QuotaExceededError'); }; o._restore = () => { w.Storage.prototype.setItem = S; }; }
  if (o.noFetch) w.fetch = undefined;
  else w.fetch = (url, init) => {
    calls.push(url);
    const h = url === SNAP ? (o.snapshot || status(404)) : url === LIVE ? (o.live || status(404)) : status(404);
    return h(url, init);
  };
  /* the 4 s fetch limit, run at once (the timer still has to fire) */
  if (o.fastTimeout) { const ST = w.setTimeout.bind(w); w.setTimeout = (fn, ms) => ST(fn, ms >= 4000 ? 5 : ms); }
  const events = [];
  w.addEventListener('acelabs:pulls', (e) => events.push(e.detail.ids.slice()));
  w.eval(SRC);
  return { w, A: w.AcePulls, calls, events, stored: () => { try { return JSON.parse(w.localStorage.getItem(KEY)); } catch (e) { return 'throws'; } }, cached: () => JSON.parse(w.sessionStorage.getItem(KEY)) };
}
const plain = (v) => JSON.parse(JSON.stringify(v));

test('snapshot only: the release snapshot applies when the live list is not there (404)', async () => {
  const { A, stored, calls } = boot({ snapshot: ok({ v: 1, tag: 'study-r1', pulls: ['retold:bio:1', { id: 'g1:FULL_1:12' }] }) });
  assert.equal(A.isPulled('retold:bio:1'), false, 'nothing known before the snapshot lands (first visit)');
  const st = await A.ready();
  assert.deepEqual(plain(st), { ids: ['g1:FULL_1:12', 'retold:bio:1'], snapshot: 'ok', live: 'failed', storage: 'empty' });
  assert.equal(A.isPulled('retold:bio:1'), true);
  assert.equal(A.isPulled('g1:FULL_1:12'), true);
  assert.equal(A.isPulled('retold:bio:2'), false);
  assert.deepEqual(stored().snap, ['retold:bio:1', 'g1:FULL_1:12'], 'the snapshot is kept for the next page');
  assert.deepEqual(stored().ids, [], 'no live list yet');
  assert.deepEqual(calls.sort(), [LIVE, SNAP].sort());
});

test('the next page knows before anything loads: storage answers synchronously', () => {
  const { A } = boot({ local: { v: 1, at: 1, ids: ['retold:gchem:4'], snap: ['retold:bio:1'] }, snapshot: never(), live: never() });
  assert.equal(A.isPulled('retold:gchem:4'), true, 'the last live list');
  assert.equal(A.isPulled('retold:bio:1'), true, 'the last snapshot');
  assert.equal(A.state().storage, 'ok');
});

test('live: a pull from the review page lands, is stored as the last good list and cached for 60 s', async () => {
  const { A, stored, cached, events } = boot({ snapshot: ok({ pulls: [] }), live: ok({ pulls: ['retold:pat:2'] }) });
  const st = await A.ready();
  assert.equal(st.live, 'ok');
  assert.equal(A.isPulled('retold:pat:2'), true);
  assert.deepEqual(stored().ids, ['retold:pat:2']);
  assert.deepEqual(cached().ids, ['retold:pat:2']);
  assert.ok(Math.abs(cached().at - Date.now()) < 5000);
  assert.deepEqual(plain(events[events.length - 1]), ['retold:pat:2'], 'acelabs:pulls fires with the new set');
});

test('cache: a live list under 60 s old is used without a fetch; an older one is fetched again', async () => {
  const fresh = boot({ session: { at: Date.now() - 30e3, ids: ['x:1'] }, snapshot: ok({ pulls: [] }), live: ok({ pulls: [] }) });
  assert.equal(fresh.A.isPulled('x:1'), true, 'known at once from the cache');
  const st = await fresh.A.ready();
  assert.equal(st.live, 'cached');
  assert.ok(!fresh.calls.includes(LIVE), 'no live fetch inside the cache window');
  const stale = boot({ session: { at: Date.now() - 61e3, ids: ['x:1'] }, snapshot: ok({ pulls: [] }), live: ok({ pulls: ['x:2'] }) });
  await stale.A.ready();
  assert.ok(stale.calls.includes(LIVE), 'refetched after 60 s');
  assert.equal(stale.A.isPulled('x:2'), true);
  assert.equal(stale.A.isPulled('x:1'), false, 'the old cache entry is gone once the new list lands');
  const future = boot({ session: { at: Date.now() + 3600e3, ids: ['x:9'] }, snapshot: ok({ pulls: [] }), live: ok({ pulls: [] }) });
  await future.A.ready();
  assert.ok(future.calls.includes(LIVE), 'a cache stamped in the future is not trusted');
  /* refresh() goes past the cache */
  const r = boot({ session: { at: Date.now() - 1e3, ids: [] }, snapshot: ok({ pulls: [] }), live: ok({ pulls: ['now:1'] }) });
  await r.A.ready();
  assert.equal(r.A.isPulled('now:1'), false);
  await r.A.refresh();
  assert.equal(r.A.isPulled('now:1'), true);
});

test('an unpull lands when the live list arrives whole; until then the stored pull holds', async () => {
  let release;
  const gate = new Promise((r) => { release = r; });
  const { A, stored } = boot({ local: { v: 1, at: 1, ids: ['retold:rc:3'], snap: [] }, snapshot: ok({ pulls: [] }), live: () => gate.then(() => ({ ok: true, status: 200, json: () => Promise.resolve({ pulls: [] }) })) });
  assert.equal(A.isPulled('retold:rc:3'), true, 'held while the live list is on its way');
  release();
  await A.ready();
  assert.equal(A.isPulled('retold:rc:3'), false, 'unpulled');
  assert.deepEqual(stored().ids, []);
});

test('the live list fails every way: the stored list and the snapshot still apply, storage is left as it was', async () => {
  for (const [name, live] of [['offline', offline()], ['500', status(500)], ['404', status(404)], ['not JSON', badJson()], ['not a list', ok({ nope: 1 })], ['null', ok(null)]]) {
    const local = { v: 1, at: 7, ids: ['retold:bio:5'], snap: ['old:1'] };
    const { A, stored } = boot({ local, snapshot: ok({ pulls: ['retold:bio:1'] }), live });
    const st = await A.ready();
    assert.equal(st.live, 'failed', name);
    assert.equal(A.isPulled('retold:bio:5'), true, name + ': the last good live list');
    assert.equal(A.isPulled('retold:bio:1'), true, name + ': the snapshot');
    assert.deepEqual(stored().ids, ['retold:bio:5'], name + ': the last good list is not overwritten');
  }
});

test('a live fetch that hangs times out (4 s); the snapshot applies and ready() still settles', async () => {
  const { A } = boot({ fastTimeout: true, snapshot: ok({ pulls: ['retold:qr:2'] }), live: never() });
  const st = await A.ready();
  assert.equal(st.live, 'failed');
  assert.equal(A.isPulled('retold:qr:2'), true);
});

test('storage throws and the live fetch fails: the snapshot still applies', async () => {
  const { A, stored } = boot({ throwLocal: true, throwSession: true, snapshot: ok({ pulls: ['retold:ochem:7'] }), live: offline() });
  assert.equal(A.isPulled('retold:ochem:7'), false);
  const st = await A.ready();
  assert.deepEqual(plain(st), { ids: ['retold:ochem:7'], snapshot: 'ok', live: 'failed', storage: 'empty' });
  assert.equal(A.isPulled('retold:ochem:7'), true);
  assert.equal(stored(), 'throws');
  /* a full store: writes fail quietly, the lists still apply */
  const o = { fullLocal: true, snapshot: ok({ pulls: ['a:1'] }), live: ok({ pulls: ['b:1'] }) };
  const full = boot(o);
  await full.A.ready();
  assert.ok(full.A.isPulled('a:1') && full.A.isPulled('b:1'));
  o._restore();
});

test('the snapshot fails too: the last snapshot this browser stored applies; no fetch at all: storage applies', async () => {
  const { A } = boot({ local: { v: 1, at: 1, ids: [], snap: ['retold:bio:1'] }, snapshot: offline(), live: offline() });
  const st = await A.ready();
  assert.equal(st.snapshot, 'failed');
  assert.equal(A.isPulled('retold:bio:1'), true);
  const nf = boot({ noFetch: true, local: { v: 1, at: 1, ids: ['x:3'], snap: [] } });
  const s2 = await nf.A.ready();
  assert.equal(s2.live, 'failed');
  assert.equal(nf.A.isPulled('x:3'), true);
  /* a snapshot whose shape is wrong is a failed snapshot, not an empty one */
  const bad = boot({ local: { v: 1, at: 1, ids: [], snap: ['keep:1'] }, snapshot: ok({ pulls: 'retold:bio:1' }), live: offline() });
  assert.equal((await bad.A.ready()).snapshot, 'failed');
  assert.equal(bad.A.isPulled('keep:1'), true);
  assert.deepEqual(bad.stored().snap, ['keep:1'], 'the stored snapshot is kept');
});

test('a pull in any list wins; a pulled night pulls its scenes, never the other way', async () => {
  const { A } = boot({ local: { v: 1, at: 1, ids: ['s:1'], snap: [] }, session: { at: Date.now(), ids: ['l:1'] }, snapshot: ok(['retold:bio:3', 'retold:pat']) });
  await A.ready();
  for (const id of ['s:1', 'l:1', 'retold:bio:3', 'retold:bio:3:2', 'retold:pat:1', 'retold:pat:9:4']) assert.equal(A.isPulled(id), true, id);
  for (const id of ['retold:bio', 'retold:bio:30', 'retold:bio:2:3', 'retold:patx:1', 'l', '', null, 42]) assert.equal(A.isPulled(id), false, String(id));
});

test('ids are checked: bad entries are dropped, good ones kept', async () => {
  const { A } = boot({ snapshot: ok({ pulls: ['ok:1', '', ' bad', 'x'.repeat(201), '<script>', 5, null, { id: 'ok:2' }, { id: {} }, 'ok:1'] }) });
  const st = await A.ready();
  assert.deepEqual(plain(st.ids), ['ok:1', 'ok:2']);
});

test('one instance per page; the only requests are the snapshot and the live list; plain ASCII', async () => {
  const { w, A, calls } = boot({ snapshot: ok({ pulls: [] }), live: ok({ pulls: [] }) });
  w.eval(SRC);
  assert.equal(w.AcePulls, A);
  await A.ready();
  assert.deepEqual(calls.sort(), [LIVE, SNAP].sort());
  assert.equal(A.KEY, KEY);
  assert.equal(A.CACHE_MS, 60000);
  assert.doesNotMatch(SRC, /[^\x00-\x7e]/);
});
