/* Unit tests for the shell's storage interface (shared/ace-progress.js) and
   router (shared/ace-route.js). Plain node:test with a fake localStorage. */
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '../..');
function load(seed) {
  const store = new Map(Object.entries(seed || {}).map(([k, v]) => [k, typeof v === 'string' ? v : JSON.stringify(v)]));
  const localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k), key: (i) => [...store.keys()][i], get length() { return store.size; },
  };
  const window = { localStorage };
  const ctx = vm.createContext({ window, localStorage, location: { search: '' }, URLSearchParams, Date, JSON, Math, Promise, setTimeout, clearTimeout });
  for (const f of ['shared/ace-index.js', 'shared/ace-route.js', 'shared/ace-progress.js']) vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx);
  return { P: window.AceProgress, R: window.AceRoute, store };
}
const DAY = 864e5, now = Date.now();
const SEED = {
  'al:prometricHistory': [{ testId: 'MOCK_1', testName: 'Practice Test 1', ts: now - 2 * DAY, subjects: { Biology: { correct: 30, total: 40 }, QR: { correct: 28, total: 40 } },
    byTopic: { Biology: { 'The nephron': { c: 1, n: 3 } }, QR: { Probability: { c: 3, n: 3 } } }, timeSec: { sons: 5000, qr: 2500 } }],
  atDAT_minitest: { attempts: [{ mode: 'test', n: 1, correct: 30, total: 40, dateISO: new Date(now - DAY).toISOString(), sect: { bio: { c: 9, t: 10 } } }],
    mistakes: { k1: { section: 'ochem', topic: 'Alcohols & carbonyls', q: { stem: '<b>Which</b> reagent?' }, box: 0, due: now - 1, resolved: false, ts: now - DAY },
      k2: { section: 'qr', topic: 'Percentages', q: { stem: 'x' }, resolved: true, ts: now - 5 * DAY } } },
  'qr-rem-v2:attempts': [{ probId: 'a', skill: 'pct-chg', correct: false, t: now }, { probId: 'b', skill: 'ratios', correct: false, t: now - 10 }, { probId: 'b', skill: 'ratios', correct: true, t: now }],
};

test('misses: practice-test misses lead, mastered hidden by default, one shape', () => {
  const { P } = load(SEED);
  const ms = P.misses();
  assert.strictEqual(ms[0].source, 'practice-test');
  assert.strictEqual(ms[0].concept, 'The nephron');
  assert.ok(!ms.some((m) => m.topic === 'Probability'), 'a topic with no misses is not a miss');
  assert.ok(!ms.some((m) => m.status === 'mastered'));
  assert.ok(P.misses({ includeMastered: true }).some((m) => m.status === 'mastered'), 'a resolved Climb miss shows as mastered');
  for (const m of ms) for (const k of ['id', 'section', 'concept', 'source', 'when', 'status']) assert.ok(k in m, k + ' on ' + m.id);
  const qr = ms.filter((m) => m.source === 'qr-engine');
  assert.strictEqual(qr.map((m) => m.skill).join(','), 'pct-chg', 'only the latest attempt per question counts');
  assert.strictEqual(qr[0].concept, 'Percent Increase/Decrease');
});

test('Leitner ladder: 1, 3, 7 days, then mastered; a miss resets', () => {
  const { P } = load(SEED);
  const id = P.misses()[0].id;
  const days = [];
  for (let i = 0; i < 3; i++) { const r = P.mark(id, true); days.push(Math.round((r.due - Date.now()) / DAY)); }
  assert.deepStrictEqual(days, [1, 3, 7]);
  assert.strictEqual(P.misses().find((m) => m.id === id).status, 'reviewing');
  assert.ok(P.mark(id, true).mastered);
  assert.ok(!P.misses().some((m) => m.id === id));
  const r = P.mark(id, false);
  assert.strictEqual(r.box, 0);
  assert.strictEqual(P.misses().find((m) => m.id === id).status, 'learning');
});

test('results: raw counts only, never a forecast field', () => {
  const { P } = load(SEED);
  const rs = P.results();
  assert.strictEqual(rs.length, 2);
  const banned = /predict|percentile|scaled|estimate|academicAvg/i;
  assert.ok(!banned.test(JSON.stringify(rs)));
  const pt = rs.find((r) => r.kind === 'practice-test');
  assert.strictEqual(pt.correct, 58); assert.strictEqual(pt.total, 80); assert.strictEqual(pt.timeSec, 7500);
});

test('sync adapter: writes queue, push drains, failures stay queued', async () => {
  const { P, store } = load({});
  let ok = false; const pushed = [];
  P.setSyncAdapter({ push: (c) => { pushed.push(c.key); return ok ? Promise.resolve() : Promise.reject(new Error('offline')); } });
  P.set('review', { a: 1 });
  await new Promise((r) => setTimeout(r, 10));
  assert.strictEqual(JSON.parse(store.get('ace.v1.pending')).length, 1);
  ok = true; await P.flush();
  assert.strictEqual(JSON.parse(store.get('ace.v1.pending')).length, 0);
  assert.ok(pushed.includes('review'));
});

test('router: concept -> Canon sheet, Retold night, drill', () => {
  const { R } = load({});
  const l = R.links({ section: 'qr', concept: 'Percent Increase/Decrease', skill: 'pct-chg' });
  assert.match(l.sheet, /sheets\/qr-percent-change\.html$/);
  assert.strictEqual(l.learn, '/tools/qr-retold/?night=4');
  assert.match(l.drill, /pct-chg\.html$/);
  assert.strictEqual(R.links({ section: 'PAT', concept: 'Cube counting' }).drill, '/tools/pat/cubes.html');
});

test('today: a finite queue of at most four tasks with links', () => {
  const { P } = load(SEED);
  const t = P.today();
  assert.ok(t.length >= 1 && t.length <= 4);
  t.forEach((x) => assert.ok(x.href && x.title));
  assert.ok(!/behind|overdue|late|streak/i.test(JSON.stringify(t)), 'no pace or streak language');
});
