// AceRecord (shared/ace-record.js) and AceSet.build (shared/ace-set.js): node --test
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const DAY = 864e5;
const j = (x) => JSON.parse(JSON.stringify(x));   // arrays made inside the vm belong to another realm
function boot(seed) {
  const store = Object.assign({}, seed || {});
  const localStorage = {
    getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: (k) => { delete store[k]; },
    key: (i) => Object.keys(store)[i] || null, get length() { return Object.keys(store).length; }
  };
  const window = { localStorage };
  const ctx = vm.createContext({ window, localStorage, document: { addEventListener() {} }, console, Promise, Date, Math, JSON, Object, Array, String, Number, Error, fetch: () => Promise.reject(new Error('no network')) });
  for (const f of ['ace-record.js', 'ace-set.js']) vm.runInContext(fs.readFileSync(path.join(__dirname, '..', '..', 'shared', f), 'utf8'), ctx);
  return { R: window.AceRecord, S: window.AceSet, store };
}
const item = (id, topic) => ({ id, section: 'gchem', topic: topic || 'buffers', topicName: 'Buffers', stem: 's' + id, choices: ['a', 'b', 'c', 'd', 'e'], answer: 0, why: 'w' });

test('one key family: every write is under ace.v1.', () => {
  const { R, store } = boot();
  R.record({ item: item('q1'), picked: 0, answer: 0, ok: true, ms: 900, src: 't' });
  assert.ok(Object.keys(store).length >= 3);
  assert.ok(Object.keys(store).every((k) => k.startsWith('ace.v1.')), Object.keys(store).join(','));
});

test('right answers climb the ladder 1, 3, 7, 14, 30 days; a miss resets to tomorrow', () => {
  const { R } = boot(); const t0 = Date.UTC(2026, 10, 14, 12);
  const gaps = [];
  let at = t0;
  for (let i = 0; i < 5; i++) { const it = R.record({ item: item('q1'), picked: 0, answer: 0, ok: true, at }); gaps.push(Math.round((it.due - at) / DAY)); at = it.due; }
  assert.deepStrictEqual(gaps, [1, 3, 7, 14, 30]);
  assert.strictEqual(R.stats({ section: 'gchem', now: at + 400 * DAY }).held, 1, 'top box counts as held, never due again');
  const miss = R.record({ item: item('q1'), picked: 2, answer: 0, ok: false, at });
  assert.strictEqual(miss.box, 0); assert.strictEqual(Math.round((miss.due - at) / DAY), 1);
});

test('stats are raw counts; due and missed lists follow the answers', () => {
  const { R } = boot(); const t0 = Date.UTC(2026, 10, 14, 12);
  R.record({ item: item('a'), picked: 0, answer: 0, ok: true, at: t0 });
  R.record({ item: item('b'), picked: 1, answer: 0, ok: false, at: t0 });
  R.record({ item: item('c', 'gibbs'), picked: 0, answer: 0, ok: true, at: t0 });
  const s = R.stats({ section: 'gchem', now: t0 });
  assert.deepStrictEqual({ items: s.items, answers: s.answers, right: s.right, missed: s.missed, due: s.due }, { items: 3, answers: 3, right: 2, missed: 1, due: 0 });
  assert.deepStrictEqual(j(R.missed({ section: 'gchem' })), ['b']);
  assert.deepStrictEqual(j(R.due({ section: 'gchem', now: t0 + 1.5 * DAY })).sort(), ['a', 'b', 'c']);
  assert.strictEqual(R.topics('gchem').buffers.items, 2);
  assert.strictEqual(R.stats({ section: 'qr' }).items, 0);
});

test('outbox survives until the sync adapter accepts it; a failed push keeps it', async () => {
  const { R } = boot();
  R.record({ item: item('a'), picked: 0, answer: 0, ok: true });
  R.record({ item: item('b'), picked: 0, answer: 0, ok: true });
  assert.strictEqual(R.pending(), 2);
  await R.setSync({ push: () => Promise.reject(new Error('offline')) });
  assert.strictEqual(R.pending(), 2);
  let got = 0;
  await R.setSync({ push: (batch) => { got = batch.length; return Promise.resolve(); } });
  assert.strictEqual(got, 2); assert.strictEqual(R.pending(), 0);
});

test('migration finds all twelve older key families and deletes nothing', () => {
  const seed = { 'acelabs.rc.v1.attempts': '[]', 'aceLabs:onboarding': '{}', 'acethedat_bio_cards': '[]', 'atDAT_minitest': '{}', 'al:prometricHistory': '[]', 'tt-face-x': '1',
    'ochem-rem-v1:attempts': '[]', 'gc-rem-v1:attempts': '[]', 'qr-rem-v2:attempts': '[]', 'bio-x': '1', 'vo-studio:autopick': 'k', 'tdr-seen': '1', 'unrelated': 'x', 'ace.v1.review': '{}' };
  const { R, store } = boot(seed);
  const m = R.migrate();
  assert.strictEqual(m.keys.length, 12);
  assert.deepStrictEqual(Object.keys(j(m.families)).sort(), j(R.FAMILIES).sort());
  for (const k of Object.keys(seed)) assert.strictEqual(store[k], seed[k], k + ' must be untouched');
  assert.strictEqual(Object.keys(R.exportAll().legacy).length, 12);
});

test('a daily set is new items near the student\'s level, spread over topics; misses go to Repair (2026-11-16)', () => {
  const { R, S } = boot(); const now = Date.now();
  const all = []; for (let i = 0; i < 30; i++) all.push(item('q' + i, 't' + (i % 6)));
  R.record({ item: all[0], picked: 0, answer: 0, ok: true, at: now - 2 * DAY });   // seen
  R.record({ item: all[1], picked: 1, answer: 0, ok: false, at: now - 3600e3 });   // missed: in Repair, not repeated here
  const set = S.build(all, { mode: 'daily', section: 'gchem', size: 10 });
  assert.strictEqual(set.length, 10);
  assert.ok(!set.some((x) => x.id === 'q0' || x.id === 'q1'), 'seen and missed items are not repeated in a new set');
  assert.strictEqual(new Set(set.map((x) => x.id)).size, 10, 'no repeats inside a set');
  assert.ok(new Set(set.map((x) => x.topic)).size >= 5, 'new items are spread across topics');
  assert.deepStrictEqual(j(S.build(all, { mode: 'misses', section: 'gchem' })).map((x) => x.id), ['q1']);
  const tw = S.twin(all, all[0], { q0: 1 }); assert.ok(tw && tw.topic === 't0' && tw.id !== 'q0');
});
