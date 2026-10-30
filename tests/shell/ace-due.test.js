/* One due rule (B1.1): AceProgress.dueState / dueCount, which Today, Review and the shell's Review dot all
   read, so the counts and the dot tell the same story. A scheduled card is due once its date has come; an
   undated legacy miss (no review date, no date of its own) is due on its next day only and Open after it.
   misses() rows keep their v3 fields (isDue included). The dot's count is computed here by the shell's own
   readDue, lifted from shared/ace-shell.js. */
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '../..');
const DAY = 864e5;
const NOW = new Date(2026, 9, 30, 10, 0, 0).getTime();
const at = (days, h = 10) => new Date(2026, 9, 30 + days, h, 0, 0).getTime();
const SHELL = fs.readFileSync(path.join(ROOT, 'shared/ace-shell.js'), 'utf8');
const READ_DUE = /function readDue\(\) \{[\s\S]*?\n  \}/.exec(SHELL)[0];

function load(seed) {
  let now = NOW;
  const FakeDate = class extends Date { constructor(...a) { if (a.length) super(...a); else super(now); } static now() { return now; } };
  const store = new Map(Object.entries(seed || {}).map(([k, v]) => [k, typeof v === 'string' ? v : JSON.stringify(v)]));
  const localStorage = { getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)), removeItem: (k) => store.delete(k) };
  class CustomEvent { constructor(type, init) { this.type = type; this.detail = init && init.detail; } }
  const window = { localStorage, CustomEvent, dispatchEvent: () => true, location: { search: '' } };
  const ctx = vm.createContext({ window, localStorage, location: window.location, URLSearchParams, Date: FakeDate, JSON, Math, Promise, setTimeout, clearTimeout });
  for (const f of ['shared/ace-index.js', 'shared/ace-route.js', 'shared/ace-progress.js']) vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx);
  vm.runInContext('var DUE_KEY = "acelabs.v1.dueToday";\n' + READ_DUE + '\nwindow.__dot = readDue;', ctx);
  return { P: ctx.window.AceProgress, dot: ctx.window.__dot, tick: (ms) => { now += ms; }, store };
}
/* Today's numbers and Review's: the counts each page shows */
const todayCount = (P) => P.dueCount(P.misses());
const reviewCount = (P) => P.misses({ includeMastered: true }).filter((m) => P.dueState(m) === 'due').length;

test('an undated miss: later on the day it is made, due on its next day, Open after; the dot agrees every day', () => {
  /* a practice test this morning with an osmosis miss: no date of its own */
  const { P, dot, tick } = load({ 'al:prometricHistory': [{ testId: 'MOCK_2', testName: 'Practice Test 2', ts: at(0, 8), subjects: { Biology: { correct: 38, total: 40 } }, byTopic: { Biology: { Osmosis: { c: 1, n: 3 } } } }] });
  const id = 'pt:bio|Osmosis';
  const state = () => P.dueState(P.misses().find((m) => m.id === id));
  assert.equal(state(), 'later', 'made today: back tomorrow');
  assert.deepEqual([todayCount(P), reviewCount(P), dot()], [0, 0, 0]);
  tick(DAY);
  assert.equal(state(), 'due', 'its next day');
  assert.deepEqual([todayCount(P), reviewCount(P), dot()], [1, 1, 1]);
  assert.ok(P.today().some((t) => t.kind === 'review'), 'Today lists the retry');
  tick(DAY);
  assert.equal(state(), 'open', 'the day after: Open, waiting in Review');
  assert.deepEqual([todayCount(P), reviewCount(P), dot()], [0, 0, 0]);
  assert.ok(!P.today().some((t) => t.kind === 'review'), 'no retry step for an Open card');
  const row = P.misses().find((m) => m.id === id);
  assert.ok(row, 'Review still lists it');
  assert.equal(row.isDue, true, 'misses() rows unchanged: isDue keeps its v3 meaning');
});

test('a scheduled card follows its date; a mastered one is kept; an old backlog never counts', () => {
  const { P, dot, tick } = load({
    'al:prometricHistory': [{ testId: 'MOCK_1', testName: 'Practice Test 1', ts: at(-1), subjects: {}, byTopic: { Biology: { Osmosis: { c: 1, n: 3 } } } }],
    'gc-rem-v1:attempts': [{ probId: 'a', skill: 'titration', correct: false, t: at(-42) }],
    atDAT_minitest: { attempts: [{ mode: 'test', n: 1, correct: 30, total: 40, dateISO: new Date(at(-2)).toISOString() }],
      mistakes: { k1: { section: 'qr', topic: 'Percentages', q: { stem: 'x' }, box: 0, due: at(-1), resolved: false, ts: at(-2) }, k2: { section: 'qr', topic: 'Ratios', q: { stem: 'y' }, box: 1, due: at(2), resolved: false, ts: at(-2) } } },
  });
  const by = () => Object.fromEntries(P.misses({ includeMastered: true }).map((m) => [m.id, P.dueState(m)]));
  const s = by();
  const pick = (re) => Object.entries(s).find(([k]) => re.test(k));
  assert.equal(pick(/Osmosis/)[1], 'due', 'yesterday\'s practice-test miss is back today');
  assert.equal(pick(/titration/)[1], 'open', 'a six-week-old engine miss with no date is Open');
  assert.deepEqual(Object.entries(s).filter(([, v]) => v === 'due').length, todayCount(P));
  assert.equal(todayCount(P), dot(), 'Today and the dot agree');
  assert.equal(reviewCount(P), dot(), 'Review and the dot agree');
  /* review the osmosis card once: it is on the ladder, due in a day */
  P.mark(pick(/Osmosis/)[0], false);
  assert.equal(by()[pick(/Osmosis/)[0]], 'later');
  assert.equal(todayCount(P), dot());
  tick(3 * DAY);
  assert.equal(by()[pick(/Osmosis/)[0]], 'due', 'its review date has come');
  assert.equal(todayCount(P), dot(), 'still in step three days on');
  assert.equal(reviewCount(P), dot());
  /* mastered is kept, never due */
  assert.equal(P.dueState({ id: 'x', status: 'mastered', due: 0, when: at(-1) }), 'kept');
  assert.equal(P.dueState(null), 'kept');
});

test('the plan behind Today counts with the same rule', () => {
  const { P, dot, tick } = load({
    'aceLabs:onboarding': { testDate: new Date(at(60)).toISOString().slice(0, 10), attempt: 'first', weakAreas: ['gchem'], setAt: at(-12) },
    'gc-rem-v1:attempts': [{ probId: 'a', skill: 'titration', correct: false, t: at(-1) }, { probId: 'b', skill: 'gas-laws', correct: false, t: at(-9) }],
    'acelabs.v1.settings': { minutes: 90 },
  });
  const cards = (plan) => (plan.steps.find((x) => x.key === 'cards') || { count: 0 }).count;
  assert.equal(cards(P.todayPlan()), 1, 'one card back today (the nine-day-old one is Open)');
  assert.equal(dot(), 1);
  tick(DAY);
  assert.equal(cards(P.todayPlan()), 0);
  assert.equal(dot(), 0);
});
