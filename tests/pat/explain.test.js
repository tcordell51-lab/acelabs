'use strict';
/* PAT worked explanations (tools/pat/engine/pat-explain.js): every reviewed item gets
   the answer, 3 to 5 steps and one trap line per wrong choice, inside the limits of
   docs/EXPLANATION-STANDARD.md (checked with the shared validator), computed from the
   item without changing it. Run: npm run test:pat */
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const { execFileSync } = require('child_process');
const { loadEngine } = require('./helpers.js');
const W = require(path.join(__dirname, '..', '..', 'shared', 'ace-walkthrough.js'));

const PAT = loadEngine();
const TESTS = [1, 9, 'F20261001'].map((id) => PAT.test.build(id));
const kindOf = (it) => it.type + (it.figure && it.figure.kind ? ' ' + it.figure.kind : '');

test('every item: answer, 3 to 5 steps, a trap per wrong choice, within the standard', () => {
  const seen = {};
  TESTS.forEach((T) => T.items.forEach((it, k) => {
    seen[kindOf(it)] = 1;
    it.options.forEach((o, picked) => {
      if (picked > 1) return;   // two picks per item keep the run short; traps do not depend on the pick
      const ex = PAT.explain(it, picked);
      const where = T.label + ' Q' + (k + 1) + ' (' + kindOf(it) + ')';
      const problems = W.validate(ex).filter((p) => p !== 'missing trick');   // no trick is recorded for PAT, and none is invented
      assert.deepEqual(problems, [], where + ': ' + problems.join('; '));
      it.options.forEach((_, i) => {
        if (i === it.answer) assert.equal(ex.traps[i], undefined, where + ': the key has no trap line');
        else assert.ok(ex.traps[i] && ex.traps[i].length > 10, where + ': choice ' + PAT.LETTERS[i] + ' has no trap line');
      });
      assert.ok(!/\u2014/.test(JSON.stringify(ex)), where + ': em dash');
      const html = PAT.explain.html(ex, { chosen: picked });
      if (picked !== it.answer) assert.ok(html.indexOf('pex-mine') > 0 && html.indexOf('pex-mine') < html.indexOf('pex-answer'), where + ': a miss opens on the trap');
    });
  }));
  ['keyholes', 'keyholes machined', 'tfe', 'tfe machined', 'angles', 'holepunch', 'cubes', 'patternfold', 'patternfold poly'].forEach((k) => assert.ok(seen[k], 'covered: ' + k));
});

test('explaining an item never changes it (saved attempts map by seed)', () => {
  TESTS[0].items.forEach((it) => {
    const before = JSON.stringify(it);
    PAT.explain(it, null); PAT.explain.figure(it);
    assert.equal(JSON.stringify(it), before);
  });
  const a = JSON.stringify(PAT.test.build(1).items.map((it) => PAT.explain(it, 0)));
  const b = JSON.stringify(PAT.test.build(1).items.map((it) => PAT.explain(it, 0)));
  assert.equal(a, b, 'same item, same explanation');
});

test('steps use the item\'s own numbers', () => {
  TESTS[0].items.forEach((it) => {
    const ex = PAT.explain(it, null), text = ex.steps.map((s) => s.text).join(' ');
    if (it.type === 'angles') it.figure.degs.forEach((d) => assert.ok(text.includes(String(d)), 'angle ' + d + ' in the steps'));
    if (it.type === 'cubes') assert.ok(text.includes(String(it.figure.cubes.length)) && text.includes(String(it.options[it.answer].count)));
    if (it.type === 'holepunch') assert.ok(text.includes(String(it.options[it.answer].holes.length) + ' hole'));
  });
});

test('pattern folding never calls a non-cube solid a cube', () => {
  let n = 0;
  TESTS.forEach((T) => T.items.forEach((it) => {
    if (it.type !== 'patternfold' || it.figure.kind !== 'poly') return;
    it.options.forEach((o, i) => {
      if (i === it.answer) return;
      n++;
      assert.ok(!/\bcubes?\b/i.test(JSON.stringify(PAT.explain(it, i))), T.label + ': ' + it.meta.netType);
      assert.ok(!/\bcubes?\b/i.test((PAT.test.TRAP_NAMES.patternfold || {})[o.trap] || ''), 'label for ' + o.trap);
    });
  }));
  assert.ok(n > 20);
  const out = execFileSync(process.execPath, [path.join(__dirname, '..', '..', 'scripts', 'qrp', 'pat-pf-check.js'), '--tests', '1-2'], { encoding: 'utf8' });
  assert.match(out, /bad notes: 0 items, 0 reviews/);
});

test('cube counting: every wrong choice gets a trap family computed from the figure', () => {
  let n = 0;
  TESTS.forEach((T) => T.items.forEach((it) => {
    if (it.type !== 'cubes') return;
    it.options.forEach((o, i) => {
      if (i === it.answer) return;
      n++;
      const k = PAT.explain.trapOf(it, i);
      assert.ok(k && PAT.test.TRAP_NAMES.cubes[k], 'family ' + k + ' has a label');
    });
  }));
  assert.ok(n >= 3 * 60 * 0.9);
  const T = TESTS[0];
  const at = { answers: T.items.map((it) => (it.type === 'cubes' ? (it.answer + 1) % it.options.length : it.answer)), timeSpent: T.items.map(() => 30) };
  const sec = PAT.test.analyze(T, at).sections.filter((s) => s.type === 'cubes')[0];
  assert.ok(sec.traps.length > 0, 'the report counts cube traps');
});
