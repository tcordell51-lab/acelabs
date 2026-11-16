// Repair queue (2026-11-16): one queue, twin versions, 2 unassisted wins on different days.
// node --test tests/shell/ace-repair.test.js
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const DAY = 864e5;
const j = (x) => JSON.parse(JSON.stringify(x));
function boot() {
  const store = {};
  const localStorage = { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: (k) => { delete store[k]; }, key: (i) => Object.keys(store)[i] || null, get length() { return Object.keys(store).length; } };
  const window = { localStorage };
  const ctx = vm.createContext({ window, localStorage, document: { addEventListener() {} }, console, Promise, Date, Math, JSON, Object, Array, String, Number, Error });
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', '..', 'shared', 'ace-record.js'), 'utf8'), ctx);
  return window.AceRecord;
}
const it = (id, topic) => ({ id, section: 'gchem', topic: topic || 'imf', topicName: 'Intermolecular forces', stem: 's' + id, choices: ['a', 'b', 'c', 'd', 'e'], answer: 0 });
const bank = [it('m1'), it('t1'), it('t2'), it('x1', 'gas')];
const T0 = new Date(2026, 10, 16, 9, 0, 0).getTime();

test('a miss opens one repair entry, due the next day', () => {
  const R = boot();
  R.record({ item: it('m1'), picked: 2, answer: 0, ok: false, at: T0 });
  const L = j(R.repairList({ now: T0 }));
  assert.strictEqual(L.open.length, 1);
  assert.strictEqual(L.due.length, 0, 'not due the same day');
  assert.strictEqual(j(R.repairList({ now: T0 + DAY })).due.length, 1);
});

test('the return is a twin: same section and skill, a different stem', () => {
  const R = boot();
  R.record({ item: it('m1'), picked: 2, answer: 0, ok: false, at: T0 });
  const e = R.repairEntry('m1');
  for (let k = 0; k < 20; k++) {
    const v = j(R.repairVersion(e, bank));
    assert.ok(['t1', 't2'].includes(v.item.id), v.item.id);
    assert.strictEqual(v.sameItem, false);
  }
  const lone = j(R.repairVersion(R.repairEntry('m1'), [it('m1')]));
  assert.strictEqual(lone.sameItem, true, 'falls back to the same item only when no twin exists');
});

test('clears after 2 unassisted wins on different days; same-day wins count once', () => {
  const R = boot();
  R.record({ item: it('m1'), picked: 2, answer: 0, ok: false, at: T0 });
  R.repairAnswer('m1', { servedId: 't1', ok: true, at: T0 + DAY });
  R.repairAnswer('m1', { servedId: 't2', ok: true, at: T0 + DAY + 3600e3 });
  let e = j(R.repairEntry('m1'));
  assert.strictEqual(e.wins.length, 1); assert.strictEqual(e.cleared, 0);
  R.repairAnswer('m1', { servedId: 't2', ok: true, assisted: true, at: T0 + 3 * DAY });
  e = j(R.repairEntry('m1')); assert.strictEqual(e.wins.length, 1, 'an assisted answer is not a win');
  R.repairAnswer('m1', { servedId: 't1', ok: true, at: T0 + 4 * DAY });
  e = j(R.repairEntry('m1'));
  assert.ok(e.cleared > 0);
  assert.strictEqual(j(R.repairList({ now: T0 + 4 * DAY })).clearedThisWeek.length, 1);
});

test('a wrong answer resets the wins and brings it back the next day', () => {
  const R = boot();
  R.record({ item: it('m1'), picked: 2, answer: 0, ok: false, at: T0 });
  R.repairAnswer('m1', { ok: true, at: T0 + DAY });
  R.repairAnswer('m1', { ok: false, at: T0 + 3 * DAY });
  const e = j(R.repairEntry('m1'));
  assert.strictEqual(e.wins.length, 0); assert.strictEqual(e.resets, 1);
  assert.strictEqual(new Date(e.due).getDate(), new Date(T0 + 4 * DAY).getDate());
});

test('the reason sets the first return', () => {
  const R = boot();
  ['know', 'trap', 'time'].forEach((r, k) => R.record({ item: it('r' + k), picked: 2, answer: 0, ok: false, at: T0 }));
  const know = j(R.repairReason('r0', 'know', T0)), trap = j(R.repairReason('r1', 'trap', T0)), time = j(R.repairReason('r2', 'time', T0));
  assert.strictEqual(know.lessonFirst, true);
  assert.strictEqual(time.untimedFirst, true);
  assert.strictEqual(new Date(know.due).getDate(), new Date(T0 + DAY).getDate());
  assert.strictEqual(new Date(trap.due).getDate(), new Date(T0 + 2 * DAY).getDate(), 'trap, misread and changed return in 2 days');
  assert.throws(() => R.repairReason('r0', 'bored', T0));
});
