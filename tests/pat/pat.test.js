'use strict';
/* PAT engine tests: deterministic seeds, independent key-correctness (the
   generator audit as a test), verifier sensitivity, analyzer and store.
   Run: npm run test:pat   (node --test, no dependencies) */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { loadEngine, checkItem } = require('./helpers.js');

// minimal localStorage for the store tests (installed before the engine loads)
const mem = {};
globalThis.localStorage = { getItem: (k) => (k in mem ? mem[k] : null), setItem: (k, v) => { mem[k] = String(v); }, removeItem: (k) => { delete mem[k]; } };
const PAT = loadEngine();

const SEEDS = Array.from({ length: 50 }, (_, i) => 9000 + i * 101);
const GEN = {
  keyholes: (s, i) => PAT.keyholes.generate(s, ['medium', 'hard', 'brutal'][i % 3]),
  tfe: (s) => PAT.tfe.generate(s),
  angles: (s) => PAT.angles.generate(s),
  holepunch: (s, i) => PAT.holepunch.generate(s, { folds: 1 + (i % 3) }),
  cubes: (s, i) => PAT.cubes.generateSet(s, 4, 'A')[i % 4],
  patternfold: (s) => PAT.patternfold.generate(s)
};

for (const type of Object.keys(GEN)) {
  test(type + ': 50 fixed-seed items, every key independently verified, no second correct answer', () => {
    SEEDS.forEach((s, i) => {
      const it = GEN[type](s, i);
      assert.equal(it.type, type);
      const probs = checkItem(PAT, it);
      assert.deepEqual(probs, [], type + ' seed ' + s + ': ' + probs.join('; '));
    });
  });
  test(type + ': same seed gives the identical item', () => {
    const a = JSON.stringify(GEN[type](SEEDS[3], 3)), b = JSON.stringify(GEN[type](SEEDS[3], 3));
    assert.equal(a, b);
  });
  test(type + ': verifiers catch a wrong key (mutation check)', () => {
    const it = GEN[type](SEEDS[5], 5);
    const bad = JSON.parse(JSON.stringify(it));
    bad.answer = (it.answer + 1) % it.options.length;
    if (type === 'cubes') { bad.answer = it.answer; bad.options[it.answer] = { count: it.options[it.answer].count === 5 ? 4 : it.options[it.answer].count + 1 }; }
    if (type === 'keyholes') { bad.meta = Object.assign({}, it.meta); }
    assert.notDeepEqual(checkItem(PAT, bad), [], 'mutated ' + type + ' item was not caught');
  });
}

test('full test: 90 items in real order with real choice counts', () => {
  const T = PAT.test.build(1);
  assert.equal(T.items.length, 90);
  PAT.SECTIONS.forEach((sec) => {
    const items = T.items.slice(sec.from - 1, sec.to);
    assert.equal(items.length, 15);
    items.forEach((it) => { assert.equal(it.type, sec.type); assert.equal(it.options.length, sec.choices, sec.type + ' choices'); });
  });
  T.items.forEach((it, i) => assert.equal(it.n, i + 1));
  // cube counting: four figures, labelled A-D, each question on its figure
  const labels = T.items.slice(60, 75).map((it) => it.figure.label);
  assert.deepEqual([...new Set(labels)], ['A', 'B', 'C', 'D']);
});

test('Test N is reproducible and different tests differ', () => {
  const a = PAT.test.build(7), b = PAT.test.build(7), c = PAT.test.build(8);
  assert.equal(JSON.stringify(a.items), JSON.stringify(b.items));
  assert.notEqual(JSON.stringify(a.items), JSON.stringify(c.items));
  const f = PAT.test.build('F123456'), g = PAT.test.build('F123456');
  assert.equal(JSON.stringify(f.items), JSON.stringify(g.items));
});

test('a full test passes the independent checks on all 90 items', () => {
  const T = PAT.test.build(2);
  T.items.forEach((it) => assert.deepEqual(checkItem(PAT, it), [], 'item ' + it.n));
});

test('answer letters are spread out (no position tell)', () => {
  const T = PAT.test.build(3), counts = {};
  T.items.filter((it) => it.type !== 'cubes').forEach((it) => { counts[it.answer] = (counts[it.answer] || 0) + 1; });
  [0, 1, 2, 3].forEach((k) => assert.ok((counts[k] || 0) >= 6, 'letter ' + 'ABCD'[k] + ' used ' + (counts[k] || 0) + ' times'));
});

test('Thomas order starts at 31 and jumps back to 1 exactly once', () => {
  const o = PAT.test.order('thomas');
  assert.equal(o.length, 90); assert.equal(o[0], 31); assert.equal(o[59], 90); assert.equal(o[60], 1); assert.equal(o[89], 30);
  let jumps = 0; for (let i = 1; i < 90; i++) if (o[i] < o[i - 1]) jumps++;
  assert.equal(jumps, 1);
  assert.deepEqual(PAT.test.order('standard').slice(0, 3), [1, 2, 3]);
});

test('analyzer: per-section scores, time, patterns, and 2-3 next steps for weak sections', () => {
  const T = PAT.test.build(4);
  const perfect = { answers: T.items.map((it) => it.answer), timeSpent: T.items.map(() => 20) };
  const A = PAT.test.analyze(T, perfect);
  assert.equal(A.total, 90);
  A.sections.forEach((s) => { assert.equal(s.correct, 15); assert.equal(s.steps.length, 0); assert.equal(s.timeSec, 300); });
  const rough = { answers: T.items.map((it, i) => (i % 2 ? it.answer : (it.answer + 1) % it.options.length)), timeSpent: T.items.map(() => 40) };
  const B = PAT.test.analyze(T, rough);
  assert.ok(B.total < 90);
  B.sections.forEach((s) => {
    assert.ok(s.steps.length >= 2 && s.steps.length <= 3, s.type + ' steps ' + s.steps.length);
    s.steps.forEach((st) => assert.ok(st.href && st.text));
    assert.ok(s.pattern.rows.length >= 1);
  });
  const angles = B.sections.find((s) => s.type === 'angles');
  assert.ok(angles.pattern.missedGaps.length > 0);
  assert.ok(B.sections.every((s) => s.steps.some((st) => /canon\/sheets\/pat-/.test(st.href)) || s.steps.length === 0));
});

test('student-facing text: no em dashes, no emojis, no predictions, no pace-shaming', () => {
  const files = ['engine/pat-test.js', 'engine/pat-angles.js', 'engine/pat-holepunch.js', 'engine/pat-cubes.js', 'engine/pat-patternfold.js', 'engine/pat-tfe.js', 'engine/pat-keyholes.js', 'test.html', 'pat-test.css', 'engine/pat-store.js', 'engine/pat-core.js'];
  const dir = path.join(__dirname, '..', '..', 'tools', 'pat');
  files.forEach((f) => {
    const src = fs.readFileSync(path.join(dir, f), 'utf8');
    assert.ok(!/—/.test(src), f + ' contains an em dash');
    assert.ok(!/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(src), f + ' contains an emoji or glyph');
  });
  const T = PAT.test.build(5);
  const B = PAT.test.analyze(T, { answers: T.items.map(() => 0), timeSpent: T.items.map(() => 90) });
  const text = JSON.stringify(B.sections.map((s) => s.steps)).toLowerCase();
  ['predict', 'scaled', 'behind', 'slow', 'overdue', 'off pace', 'off-pace', 'too long', 'percentile'].forEach((w) => assert.ok(!text.includes(w), 'next steps mention "' + w + '"'));
});

test('store: save, resume, finish, and a sync adapter receives pushes', async () => {
  const T = PAT.test.build(6);
  const a = PAT.store.newAttempt(T, 'thomas');
  assert.equal(a.cursor, 30);
  a.answers[30] = 2; PAT.store.save(a);
  assert.equal(PAT.store.inProgressFor(6).id, a.id);
  const pushed = [];
  await PAT.store.setSyncAdapter({ push: (x) => { pushed.push(x.id); return Promise.resolve(); } });
  a.status = 'finished'; PAT.store.save(a);
  await PAT.store.flush();
  assert.ok(pushed.includes(a.id));
  assert.equal(PAT.store.inProgressFor(6), null);
  assert.equal(PAT.store.latestFinished(6).answers[30], 2);
  await PAT.store.setSyncAdapter(null);
});
