'use strict';
/* PAT engine tests: deterministic seeds, independent key-correctness (the
   generator audit as a test), verifier sensitivity, analyzer and store.
   Run: npm run test:pat   (node --test, no dependencies) */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { loadEngine, checkItem, ENGINE_FILES } = require('./helpers.js');
const crypto = require('crypto');

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
/* engine v2 item kinds (heavier checks, so 12 seeds here; the audit runs 50) */
const SEEDS2 = SEEDS.slice(0, 12);
const GEN2 = {
  'keyholes machined': (s) => PAT.keyholesCSG.generate(s),
  'tfe machined': (s) => PAT.tfeCSG.generate(s),
  'patternfold prism': (s) => PAT.patternfoldPoly.generate(s, { kind: 'box' }),
  'patternfold triangular prism': (s) => PAT.patternfoldPoly.generate(s, { kind: 'triprism' }),
  'patternfold pyramid': (s) => PAT.patternfoldPoly.generate(s, { kind: 'pyramid' }),
  'patternfold tetrahedron': (s) => PAT.patternfoldPoly.generate(s, { kind: 'tetra' }),
  'holepunch half-holes': (s, i) => PAT.holepunch.generate(s, { folds: 2 + (i % 2), halfHoles: true }),
  'angles 1-degree tier': (s) => PAT.angles.generate(s, { tier: '1deg' })
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

for (const name of Object.keys(GEN2)) {
  test(name + ': fixed-seed items, every key independently verified, no second correct answer', () => {
    SEEDS2.forEach((sd, i) => {
      const it = GEN2[name](sd, i);
      assert.deepEqual(checkItem(PAT, it), [], name + ' seed ' + sd + ': ' + checkItem(PAT, it).join('; '));
    });
  });
  test(name + ': same seed gives the identical item', () => {
    assert.equal(JSON.stringify(GEN2[name](SEEDS2[3], 3)), JSON.stringify(GEN2[name](SEEDS2[3], 3)));
  });
}
test('v2 verifiers catch broken items (mutation checks)', () => {
  const kh = PAT.keyholesCSG.generate(SEEDS[1]);
  const kh1 = JSON.parse(JSON.stringify(kh)); kh1.answer = (kh.answer + 1) % 5;
  assert.notDeepEqual(checkItem(PAT, kh1), [], 'keyholes wrong key');
  const kh2 = JSON.parse(JSON.stringify(kh)); kh2.options[kh.answer].loops = kh2.options[kh.answer].loops.map((L) => L.map((q) => [q[0] * 1.08, q[1]]));
  assert.notDeepEqual(checkItem(PAT, kh2), [], 'keyholes stretched key');
  const kh3 = JSON.parse(JSON.stringify(kh)); kh3.figure.lines.splice(0, 4);
  assert.notDeepEqual(checkItem(PAT, kh3), [], 'keyholes drawing with missing lines');
  const tf = PAT.tfeCSG.generate(SEEDS[1]);
  const tf1 = JSON.parse(JSON.stringify(tf)); tf1.answer = (tf.answer + 1) % 4;
  assert.notDeepEqual(checkItem(PAT, tf1, { family: false }), [], 'tfe wrong key');
  const tf2 = JSON.parse(JSON.stringify(tf)), key = tf2.options[tf.answer].prims, g = PAT.tfeCSG.groups(key)[0];
  g.forEach((i) => { key[i].dash = !key[i].dash; });
  assert.notDeepEqual(checkItem(PAT, tf2, { family: false }), [], 'tfe key with a line flipped solid/dashed');
  const tf3 = JSON.parse(JSON.stringify(tf)); const gv = Object.keys(tf3.figure.given)[0]; tf3.figure.given[gv].splice(0, 2);
  assert.notDeepEqual(checkItem(PAT, tf3, { family: false }), [], 'tfe given view with lines missing');
  const pf = PAT.patternfoldPoly.generate(SEEDS[1]);
  const pf1 = JSON.parse(JSON.stringify(pf)); pf1.answer = (pf.answer + 1) % 4;
  assert.notDeepEqual(checkItem(PAT, pf1), [], 'pattern folding wrong key');
  const hp = PAT.holepunch.generate(SEEDS[2], { folds: 2, halfHoles: true });
  const hp1 = JSON.parse(JSON.stringify(hp)); hp1.answer = (hp.answer + 1) % 5;
  assert.notDeepEqual(checkItem(PAT, hp1), [], 'hole punching wrong key');
});
test('TFE machined: the family search proves every distractor wrong (engine and verifier agree)', () => {
  SEEDS2.slice(0, 4).forEach((sd) => {
    const it = PAT.tfeCSG.generate(sd), probs = checkItem(PAT, it);
    assert.deepEqual(probs, []);
    assert.ok(it.meta.validMissing >= 1);
  });
});

/* v1 must stay byte-identical so every saved v1 attempt maps onto the same items */
const V1_HASH = { 1: '01f2b411e76a1989', 2: '349095f322061eb2', 3: '0de0b1938358fef6', 4: 'a3286c62fdbd420a', 5: 'd7bca3b7b98e0f54', 6: '8cb03bac96eb5a8f', 7: 'e3abdb3510f7d14c', 8: 'a83123eddc17f7cd', 9: '12743c4f42ad7344', 10: '519a75b40ddc07fa', 11: '5d9ad4a16d78d21f', 12: 'a1a2603f23e71b22', 13: 'fa4412d9ee83a3b3', 14: '61d6a74f2bef4f41', 15: 'f7affbad801d0b74', F123456: '2ab1c516fbed3663' };
test('engine v1: all 15 numbered tests and a fresh test are byte-identical to the pre-v2 engine', () => {
  for (const k of Object.keys(V1_HASH)) {
    const id = k[0] === 'F' ? k : Number(k);
    const h = crypto.createHash('sha256').update(JSON.stringify(PAT.test.build(id, { version: 1 }).items)).digest('hex').slice(0, 16);
    assert.equal(h, V1_HASH[k], 'v1 test ' + k + ' changed');
  }
});
test('versions: new attempts record v2; v1 and v2 differ; v2 has only multi-fold hole punching', () => {
  assert.equal(PAT.test.VERSION, 2);
  const T2 = PAT.test.build(9), T1 = PAT.test.build(9, { version: 1 });
  assert.equal(T2.version, 2); assert.equal(T1.version, 1);
  assert.notEqual(JSON.stringify(T1.items), JSON.stringify(T2.items));
  const a = PAT.store.newAttempt(T2, 'standard');
  assert.equal(a.engine, 2);
  T2.items.filter((it) => it.type === 'holepunch').forEach((it) => assert.ok(it.meta.folds >= 2, 'one-fold item in v2'));
  assert.ok(T1.items.filter((it) => it.type === 'holepunch').some((it) => it.meta.folds === 1), 'v1 still has its original one-fold items');
  const kinds = new Set(T2.items.map((it) => it.type + ':' + (it.figure.kind || 'classic')));
  ['keyholes:machined', 'tfe:machined', 'patternfold:poly', 'keyholes:classic', 'tfe:classic', 'patternfold:classic'].forEach((k) => assert.ok(kinds.has(k), 'v2 test lacks ' + k));
  const E = PAT.test.build(9, { angles1deg: true });
  assert.ok(E.items.filter((it) => it.type === 'angles').every((it) => it.meta.minGap === 1));
  assert.ok(T2.items.filter((it) => it.type === 'angles').every((it) => it.meta.minGap >= 2), '1-degree tier is off by default');
});

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
  const files = ENGINE_FILES.map((n) => 'engine/pat-' + n + '.js').concat(['engine/pat-core.js', 'test.html', 'pat-test.css']);
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
  assert.equal(a.cursor, 0);
  assert.equal(PAT.test.order(a.mode)[a.cursor], 31);
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
