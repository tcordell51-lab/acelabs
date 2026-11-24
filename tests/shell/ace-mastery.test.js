// XP, daily streak, quick check and mastery (shared/ace-mastery.js), plus the wiring that makes the
// quick check reachable from a hub row and from the end of a drill.
// node --test tests/shell/ace-mastery.test.js
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..', '..');
const DAY = 864e5;
const j = (x) => JSON.parse(JSON.stringify(x));
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
function boot(seed) {
  const store = Object.assign({}, seed || {});
  const localStorage = { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: (k) => { delete store[k]; } };
  const window = { localStorage };
  const ctx = vm.createContext({ window, localStorage, console, Promise, Date, Math, JSON, Object, Array, String, Number, Error, isFinite });
  vm.runInContext(read('shared/ace-record.js'), ctx);
  vm.runInContext(read('shared/ace-mastery.js'), ctx);
  return { R: window.AceRecord, M: window.AceMastery, store };
}
const item = (id, topic) => ({ id, section: 'gchem', topic: topic || 'imf', topicName: 'T', stem: 's' + id, choices: ['a', 'b', 'c', 'd', 'e'], answer: 0 });
const T0 = new Date(2026, 10, 16, 9, 0, 0).getTime();

test('XP is 10 per right answer and 50 per mastered topic, worked out from the record', () => {
  const { R, M } = boot();
  assert.strictEqual(M.xp(T0).total, 0);
  R.record({ item: item('a'), picked: 0, answer: 0, ok: true, at: T0 });
  R.record({ item: item('b'), picked: 1, answer: 0, ok: false, at: T0 });
  R.record({ item: item('c'), picked: 0, answer: 0, ok: true, at: T0 - DAY });
  const x = j(M.xp(T0));
  assert.strictEqual(x.total, 20); assert.strictEqual(x.today, 10);
  M.saveCheck('gchem', 'imf', 4, 5, T0);
  assert.strictEqual(M.xp(T0).total, 70);
});

test('the streak counts days in a row, and yesterday keeps it alive until today is answered', () => {
  const { R, M } = boot();
  assert.strictEqual(M.streak(T0).days, 0);
  R.record({ item: item('a'), picked: 0, answer: 0, ok: true, at: T0 - 2 * DAY });
  R.record({ item: item('b'), picked: 3, answer: 0, ok: false, at: T0 - DAY });
  assert.deepStrictEqual(j(M.streak(T0)), { days: 2, today: false });
  R.record({ item: item('c'), picked: 0, answer: 0, ok: true, at: T0 });
  assert.deepStrictEqual(j(M.streak(T0)), { days: 3, today: true });
  assert.strictEqual(M.streak(T0 + 2 * DAY).days, 0, 'a missed day ends it');
});

test('a quick check masters a topic at 4 of 5, not at 3, and mastery stays once earned', () => {
  const { M, store } = boot();
  let r = j(M.saveCheck('gchem', 'imf', 3, 5, T0));
  assert.strictEqual(r.mastered, false); assert.strictEqual(M.topic('gchem', 'imf').mastered, 0);
  r = j(M.saveCheck('gchem', 'imf', 4, 5, T0 + 1000));
  assert.strictEqual(r.mastered, true); assert.strictEqual(r.newly, true); assert.strictEqual(r.xp, 50);
  r = j(M.saveCheck('gchem', 'imf', 1, 5, T0 + 2000));
  assert.strictEqual(r.mastered, true); assert.strictEqual(r.newly, false); assert.strictEqual(r.xp, 0);
  const t = j(M.topic('gchem', 'imf'));
  assert.strictEqual(t.best, 4); assert.strictEqual(t.last, 1); assert.strictEqual(t.tries, 3);
  assert.strictEqual(JSON.parse(store['ace.v1.mastery']).schema, 1, 'mastery is kept in localStorage');
  assert.deepStrictEqual(j(M.section('gchem', ['imf', 'gases'])), { mastered: 1, total: 2 });
});

test('a short check can never master a topic', () => {
  const { M } = boot();
  assert.strictEqual(M.saveCheck('gchem', 'imf', 4, 4, T0).mastered, false);
});

test('the check needs 5 items in the topic and serves 5, unseen ones first', () => {
  const { R, M } = boot();
  const items = []; for (let i = 0; i < 8; i++) items.push(item('q' + i));
  items.push(item('other', 'gases'));
  assert.strictEqual(M.canCheck(items.slice(0, 4), 'gchem', 'imf'), false);
  assert.strictEqual(M.pickCheck(items.slice(0, 4), 'gchem', 'imf').length, 0);
  assert.strictEqual(M.canCheck(items, 'gchem', 'imf'), true);
  ['q0', 'q1', 'q2'].forEach((id, k) => R.record({ item: items[k], picked: 0, answer: 0, ok: true, at: T0 + k }));
  const got = j(M.pickCheck(items, 'gchem', 'imf')).map((x) => x.id);
  assert.strictEqual(got.length, 5); assert.strictEqual(new Set(got).size, 5);
  assert.deepStrictEqual(got.slice().sort(), ['q3', 'q4', 'q5', 'q6', 'q7'], 'the five unseen items come first');
  assert.ok(!got.includes('other'), 'only this topic');
});

test('a damaged mastery store does not throw and starts clean', () => {
  const { M } = boot({ 'ace.v1.mastery': '{not json', 'ace.v1.record': '[]' });
  assert.strictEqual(M.xp(T0).total, 0); assert.strictEqual(M.streak(T0).days, 0);
  assert.strictEqual(M.saveCheck('bio', 'cells', 5, 5, T0).mastered, true);
});

test('wiring: one shared system, reachable from the hub row and after a drill', () => {
  const hub = read('shared/ace-hub.js'), set = read('shared/ace-set.js'), rec = read('shared/ace-record.js'), ui = read('shared/ace-ui.js');
  assert.match(hub, /M\.runCheck/); assert.match(hub, /AceMastery/); assert.match(hub, /data-check/); assert.match(hub, /checkHref/);
  assert.match(set, /quick-check/); assert.match(set, /checkHref/);
  assert.match(rec, /ace-mastery\.js\?v=/); assert.match(ui, /ace-mastery\.js\?v=|AceMastery/);
  for (const p of ['gc/index.html', 'bio/index.html', 'oc/index.html', 'qr/drill/index.html']) {
    const h = read(p);
    assert.match(h, /shared\/ace-hub\.js\?v=/, p + ' uses the shared hub');
    assert.match(h, /shared\/ace-mastery\.js\?v=/, p + ' loads the shared mastery file');
    assert.doesNotMatch(h, /ace\.v1\.mastery/, p + ' keeps no copy of its own');
  }
  const vers = new Set();
  for (const f of ['shared/ace-record.js', 'shared/ace-ui.js', 'gc/index.html', 'bio/index.html', 'oc/index.html', 'qr/drill/index.html']) (read(f).match(/ace-mastery\.js\?v=([0-9]+)/g) || []).forEach((m) => vers.add(m));
  assert.strictEqual(vers.size, 1, 'one version of ace-mastery.js everywhere: ' + [...vers].join(', '));
});

test('no em dash in the mastery file', () => { assert.doesNotMatch(read('shared/ace-mastery.js'), new RegExp(String.fromCharCode(0x2014))); });
