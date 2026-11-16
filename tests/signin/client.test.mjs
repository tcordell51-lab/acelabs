// sign-in/ace-session.js: one student per browser cache.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

function boot(seed) {
  const store = { ...seed };
  const localStorage = { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: (k) => { delete store[k]; }, key: (i) => Object.keys(store)[i] || null, get length() { return Object.keys(store).length; } };
  const window = { localStorage }; window.top = window.self = window;
  const ctx = vm.createContext({ window, document: { readyState: 'loading', addEventListener() {} }, location: { pathname: '/sign-in/', search: '', hash: '', origin: 'https://acelabs.netlify.app' }, history: {}, console, fetch: () => Promise.reject(new Error('no network')), setTimeout, clearTimeout, Promise, Date, JSON, Math, Object, Number, String, Array, Error, isFinite });
  vm.runInContext(fs.readFileSync(new URL('../../sign-in/ace-session.js', import.meta.url), 'utf8'), ctx);
  return { S: window.AceSession, store };
}

test("student B never sees student A's cache on a shared browser; A gets it back", () => {
  const { S, store } = boot({ 'ace.v1.owner': 'S22', 'ace.v1.record': '{"schema":1,"items":{"a":{}}}', 'ace.v1.outbox': '[{"id":"a"}]', 'gc.progress': 'A-legacy' });
  assert.equal(S._claim('S35'), true);
  assert.equal(store['ace.v1.record'], undefined); assert.equal(store['ace.v1.outbox'], undefined); assert.equal(store['gc.progress'], undefined);
  assert.equal(store['ace.v1.owner'], 'S35');
  store['ace.v1.record'] = '{"schema":1,"items":{"b":{}}}';
  assert.equal(S._claim('S22'), true);
  assert.match(store['ace.v1.record'], /"a"/); assert.equal(store['gc.progress'], 'A-legacy'); assert.equal(store['ace.v1.outbox'], '[{"id":"a"}]');
  assert.match(store['ace.v1.park.S35.record'], /"b"/);
});

test('work done signed out carries into the first account that signs in', () => {
  const { S, store } = boot({ 'ace.v1.record': '{"schema":1,"items":{"free":{}}}' });
  assert.equal(S._claim('S22'), false); assert.match(store['ace.v1.record'], /free/);
});

test('merge: newest copy wins both ways, and what the browser has ahead is sent up', () => {
  const { S } = boot();
  const local = { items: { a: { last: 5, seen: 1 }, b: { last: 9, seen: 2 } }, repair: { m: { missedAt: 1, reason: null } }, days: {} };
  const out = S._merge(local, { items: { a: { last: 7, seen: 2 }, b: { last: 3, seen: 1 } }, repair: { m: { missedAt: 1, _u: 4, reason: 'trap' } }, days: { '2026-11-16': { seen: 3, right: 2 } } });
  assert.equal(out.changed, true); assert.equal(local.items.a.last, 7); assert.equal(local.items.b.last, 9); assert.equal(local.repair.m.reason, 'trap');
  assert.deepEqual(Object.keys(out.ahead.items), ['b']);
});

test('the way back and the portal link cannot leave the two sites', () => {
  const { S } = boot();
  assert.equal(S.safeNext('//evil.example'), '/'); assert.equal(S.safeNext('https://evil.example'), '/');
  assert.equal(S.portalSignInUrl('', '/repair/'), 'https://acethedat-portal.netlify.app/labs/go?next=%2Frepair%2F');
});
