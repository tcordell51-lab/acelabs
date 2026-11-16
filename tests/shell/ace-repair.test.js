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

// ---- 2026-11-16 rework: skill-first twins, assisted saved, learner model, skill repair ----
const sk = (id, topic, skill, d) => Object.assign(it(id, topic), { skill, skillName: skill, difficulty: d || 2 });

test('a new version matches the skill first, then the topic, then the same question (marked)', () => {
  const R = boot();
  const b2 = [sk('m1', 'lewis', 'lewis/valence-count'), sk('a1', 'lewis', 'lewis/resonance'), sk('a2', 'lewis', 'lewis/valence-count'), sk('z1', 'gas', 'gas/ideal')];
  R.record({ item: b2[0], picked: 1, answer: 0, ok: false, at: T0 });
  const e = R.repairEntry('m1');
  assert.strictEqual(e.skill, 'lewis/valence-count');
  assert.strictEqual(R.repairVersion(e, b2).item.id, 'a2');
  assert.strictEqual(R.repairVersion(e, b2).match, 'skill');
  assert.strictEqual(R.repairVersion(e, [b2[0], b2[1]]).match, 'topic');
  const self = R.repairVersion(e, []);
  assert.strictEqual(self.sameItem, true);
  assert.strictEqual(self.item.id, 'm1', 'a test miss keeps its own text, so it can always come back');
});

test('assisted is saved on the attempt row and keeps the model still', () => {
  const R = boot();
  R.record({ item: sk('q1', 'gas', 'gas/ideal'), picked: 0, answer: 0, ok: true, at: T0, assisted: true });
  assert.strictEqual(R.attempts()[0].assisted, true);
  assert.strictEqual(R.ratings('gchem').length, 0);
  R.record({ item: sk('q2', 'gas', 'gas/ideal'), picked: 0, answer: 0, ok: true, at: T0 });
  assert.strictEqual(R.attempts()[1].assisted, false);
  assert.strictEqual(R.ratings('gchem').length, 1);
});

test('the rating falls after misses and rises after wins; picks follow it', () => {
  const R = boot();
  const pool = [sk('e1', 'gas', 'g', 1), sk('e2', 'gas', 'g', 1), sk('h1', 'gas', 'g', 3), sk('h2', 'gas', 'g', 3), sk('h3', 'gas', 'g', 3)];
  const start = R.expect(pool[2]);
  for (let i = 0; i < 4; i++) R.record({ item: sk('w' + i, 'gas', 'g', 2), picked: 1, answer: 0, ok: false, at: T0 + i });
  const low = R.expect(pool[2]);
  assert.ok(low < start, 'misses lower the chance on a hard item');
  assert.strictEqual(R.pickNear(pool, { random: () => 0 })[0].difficulty, 1, 'after misses the easiest comes first');
  for (let i = 0; i < 14; i++) R.record({ item: sk('v' + i, 'gas', 'g', 3), picked: 0, answer: 0, ok: true, at: T0 + 100 + i });
  assert.ok(R.expect(pool[2]) > low);
  assert.strictEqual(R.pickNear(pool, { random: () => 0 })[0].difficulty, 3, 'after wins a hard item comes first');
});

test('PAT misses repair by skill: two practice wins on different days clear it', () => {
  const R = boot();
  const pat = (n) => ({ id: 'pat:holepunch:' + n, section: 'pat', topic: 'holepunch', topicName: 'Hole punching', skill: 'holepunch', skillName: 'Hole punching' });
  R.record({ item: pat(1), picked: 1, answer: 0, ok: false, at: T0 });
  R.record({ item: pat(2), picked: 1, answer: 0, ok: false, at: T0 + 1000 });
  assert.strictEqual(j(R.repairList({ now: T0 })).open.length, 1, 'one entry per skill');
  R.record({ item: pat(3), picked: 0, answer: 0, ok: true, at: T0 + 2000 });
  assert.strictEqual(R.repairEntry('pat:holepunch').wins.length, 0, 'not due yet, no win');
  R.record({ item: pat(4), picked: 0, answer: 0, ok: true, at: T0 + DAY });
  assert.strictEqual(R.repairEntry('pat:holepunch').wins.length, 1);
  R.record({ item: pat(5), picked: 0, answer: 0, ok: true, at: T0 + 3 * DAY });
  assert.ok(R.repairEntry('pat:holepunch').cleared);
});
