// Review schedule (2026-11-24): a miss returns about 1, 3 and 7 days out and clears when the
// 7-day return is answered right. Older records move over once without losing anything.
// node --test tests/shell/ace-review-schedule.test.js
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const DAY = 864e5;
const j = (x) => JSON.parse(JSON.stringify(x));
function boot(seed) {
  const store = Object.assign({}, seed || {});
  const localStorage = { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: (k) => { delete store[k]; }, key: (i) => Object.keys(store)[i] || null, get length() { return Object.keys(store).length; } };
  const window = { localStorage };
  const ctx = vm.createContext({ window, localStorage, document: { addEventListener() {} }, console, Promise, Date, Math, JSON, Object, Array, String, Number, Error, isFinite });
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', '..', 'shared', 'ace-record.js'), 'utf8'), ctx);
  return { R: window.AceRecord, store };
}
const it = (id) => ({ id, section: 'gchem', topic: 'imf', topicName: 'Intermolecular forces', stem: 's' + id, choices: ['a', 'b', 'c', 'd', 'e'], answer: 0 });
const T0 = new Date(2026, 10, 16, 9, 0, 0).getTime();
const dayOf = (t) => Math.round((new Date(t).setHours(0, 0, 0, 0) - new Date(T0).setHours(0, 0, 0, 0)) / DAY);

test('the schedule is 1, 3 and 7 days', () => {
  const { R } = boot();
  assert.deepStrictEqual(j(R.RETURN_DAYS), [1, 3, 7]);
});

test('a miss returns 1 day out, then 3 days after that win, then 7 days after that win, then clears', () => {
  const { R } = boot();
  R.record({ item: it('m1'), picked: 2, answer: 0, ok: false, at: T0 });
  assert.strictEqual(dayOf(R.repairEntry('m1').due), 1);
  let e = j(R.repairAnswer('m1', { ok: true, at: T0 + 1 * DAY }));
  assert.strictEqual(dayOf(e.due), 4, 'second return is 3 days after the first win'); assert.strictEqual(e.cleared, 0);
  assert.strictEqual(j(R.repairList({ now: T0 + 3 * DAY })).due.length, 0, 'not due before day 4');
  assert.strictEqual(j(R.repairList({ now: T0 + 4 * DAY })).due.length, 1);
  e = j(R.repairAnswer('m1', { ok: true, at: T0 + 4 * DAY }));
  assert.strictEqual(dayOf(e.due), 11, 'third return is 7 days after the second win'); assert.strictEqual(e.cleared, 0);
  assert.strictEqual(j(R.repairList({ now: T0 + 10 * DAY })).due.length, 0);
  e = j(R.repairAnswer('m1', { ok: true, at: T0 + 11 * DAY }));
  assert.ok(e.cleared > 0, 'cleared by the right answer on the 7-day return');
  assert.strictEqual(e.wins.length, 3);
});

test('a wrong answer on any return starts the schedule over, due the next day', () => {
  const { R } = boot();
  R.record({ item: it('m1'), picked: 2, answer: 0, ok: false, at: T0 });
  R.repairAnswer('m1', { ok: true, at: T0 + DAY });
  R.repairAnswer('m1', { ok: true, at: T0 + 4 * DAY });
  let e = j(R.repairAnswer('m1', { ok: false, at: T0 + 11 * DAY }));
  assert.strictEqual(e.wins.length, 0); assert.strictEqual(e.cleared, 0); assert.strictEqual(dayOf(e.due), 12);
  e = j(R.repairAnswer('m1', { ok: true, at: T0 + 12 * DAY }));
  assert.strictEqual(dayOf(e.due), 15);
});

test('an assisted right answer is not a win and does not move the schedule forward', () => {
  const { R } = boot();
  R.record({ item: it('m1'), picked: 2, answer: 0, ok: false, at: T0 });
  const e = j(R.repairAnswer('m1', { ok: true, assisted: true, at: T0 + DAY }));
  assert.strictEqual(e.wins.length, 0); assert.strictEqual(dayOf(e.due), 2);
});

test('tagging a reason after a win does not pull the next return earlier', () => {
  const { R } = boot();
  R.record({ item: it('m1'), picked: 2, answer: 0, ok: false, at: T0 });
  R.repairAnswer('m1', { ok: true, at: T0 + DAY });
  const e = j(R.repairReason('m1', 'trap', T0 + DAY));
  assert.strictEqual(dayOf(e.due), 4);
});

test('older records migrate once: nothing lost, nothing reopened', () => {
  const at = (d, h) => new Date(2026, 10, 16 + d, h || 9, 0, 0).getTime();
  const old = { schema: 1, updated: at(3), items: { a: { section: 'gchem', topic: 'imf', seen: 1, right: 0, last: at(0), lastOk: false, box: 0, due: at(1) } }, days: { '2026-11-16': { seen: 4, right: 1 } }, imported: {}, model: { sec: {}, top: {}, ib: {} },
    repair: {
      none: { id: 'none', section: 'gchem', topic: 'imf', topicName: 'IMF', wins: [], due: at(2, 1), missedAt: at(0), resets: 0, cleared: 0, reason: 'trap' },
      one: { id: 'one', section: 'gchem', topic: 'imf', topicName: 'IMF', wins: [at(1)], due: at(3, 1), missedAt: at(0), resets: 0, cleared: 0 },
      done: { id: 'done', section: 'gchem', topic: 'imf', topicName: 'IMF', wins: [at(1), at(3)], due: at(3, 1), missedAt: at(0), resets: 0, cleared: at(3) },
      noWins: { id: 'noWins', section: 'qr', topic: 'ratios', topicName: 'Ratios', due: at(1, 1), missedAt: at(0), resets: 0, cleared: 0 }
    } };
  const { R, store } = boot({ 'ace.v1.record': JSON.stringify(old) });
  const none = j(R.repairEntry('none')), one = j(R.repairEntry('one')), done = j(R.repairEntry('done')), noWins = j(R.repairEntry('noWins'));
  assert.strictEqual(none.due, at(2, 1), 'an entry with no win keeps its date');
  assert.strictEqual(none.reason, 'trap');
  assert.strictEqual(one.wins.length, 1, 'the win is kept');
  assert.strictEqual(dayOf(one.due), 4, 'one win: back 3 days after that win');
  assert.strictEqual(one.cleared, 0);
  assert.strictEqual(done.cleared, at(3), 'an entry cleared under the old rule stays cleared');
  assert.deepStrictEqual(noWins.wins, [], 'a record with no wins list gets an empty one');
  const saved = JSON.parse(store['ace.v1.record']);
  assert.strictEqual(saved.repairSched, 137, 'the move is written once');
  assert.strictEqual(saved.items.a.seen, 1); assert.deepStrictEqual(saved.days['2026-11-16'], { seen: 4, right: 1 });
  assert.strictEqual(Object.keys(saved.repair).length, 4, 'no entry dropped');
  // the migrated entry now follows the new ladder
  const e = j(R.repairAnswer('one', { ok: true, at: at(4) }));
  assert.strictEqual(e.cleared, 0); assert.strictEqual(dayOf(e.due), 11);
  assert.ok(j(R.repairAnswer('one', { ok: true, at: at(11) })).cleared > 0);
});

test('a damaged repair entry does not break loading', () => {
  const bad = { schema: 1, items: {}, days: {}, imported: {}, repair: { x: null, y: { id: 'y', section: 'bio', topic: 't', wins: 'no', cleared: 0 } } };
  const { R } = boot({ 'ace.v1.record': JSON.stringify(bad) });
  const L = j(R.repairList({ now: T0 }));
  assert.strictEqual(L.open.length, 1);
  assert.deepStrictEqual(j(R.repairEntry('y')).wins, []);
});

test('the wording students see matches the schedule', () => {
  const read = (f) => fs.readFileSync(path.join(__dirname, '..', '..', f), 'utf8');
  assert.match(read('repair/index.html'), /1 day, then 3 days, then 7 days/);
  for (const f of ['repair/index.html', 'shared/ace-set.js', 'shared/ace-question.js', 'shared/ace-plan.js', 'shared/ace-next-steps.js', 'shared/ace-repair-page.js'])
    assert.doesNotMatch(read(f), /beat (it|each one) twice|2 wins|in 2 days/i, f + ' still describes the old rule');
});
