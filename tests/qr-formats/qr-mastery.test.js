/* QR mastery check (tools/qr/index.html, stage 5): Mastered must come from graded answers on
   distinct problems, and a repeated Record on one answer must count once. Loads the pure
   MCHECK block straight out of the page so the test runs the shipped code. */
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const SRC = fs.readFileSync(path.join(__dirname, '../../tools/qr/index.html'), 'utf8');
const block = SRC.slice(SRC.indexOf('/* MCHECK-CORE-START'), SRC.indexOf('/* MCHECK-CORE-END */'));
const MCHECK = vm.runInNewContext(block + '\nMCHECK;', { Math });
const rec = (...a) => ({ ...MCHECK.record(...a) });

test('no self-report path to mastery is left on the page', () => {
  assert.ok(!/honor[- ]system/i.test(SRC), 'honor-system wording is gone');
  assert.ok(!/onclick="markMastered\(/.test(SRC), 'no button calls markMastered directly');
  assert.strictEqual((SRC.match(/[^.\w]markMastered\(skillId\);/g) || []).length, 1, 'only the graded check calls markMastered');
});

test('pressing Record again on the same answer counts once', () => {
  const st = MCHECK.fresh();
  MCHECK.show(st, 'p1', 't1');
  assert.deepStrictEqual(rec(st, 't1', true), { counted: true, mastered: false });
  assert.deepStrictEqual(rec(st, 't1', true), { counted: false, mastered: false });
  assert.deepStrictEqual(rec(st, 't1', true), { counted: false, mastered: false });
  assert.strictEqual(st.n, 1);
  assert.deepStrictEqual(rec(st, 'stale', true), { counted: false, mastered: false });
});

test('mastery needs three correct in a row on three different problems', () => {
  const st = MCHECK.fresh(), pool = ['a', 'b', 'c', 'd'];
  let mastered = false, i = 0;
  const seen = [];
  while (!mastered && i < 10) {
    const id = MCHECK.pick(pool, st, () => 0);
    assert.ok(!st.streak.includes(id), 'a streak never repeats a problem');
    seen.push(id);
    MCHECK.show(st, id, 't' + i);
    mastered = MCHECK.record(st, 't' + i, true).mastered;
    i++;
  }
  assert.ok(mastered);
  assert.strictEqual(new Set(seen).size, 3);
  // Re-showing the same problem cannot extend a streak.
  const st2 = MCHECK.fresh();
  MCHECK.show(st2, 'a', 'x1'); MCHECK.record(st2, 'x1', true);
  MCHECK.show(st2, 'a', 'x2'); MCHECK.record(st2, 'x2', true);
  assert.strictEqual(st2.n, 1);
});

test('a miss resets the streak, and draws avoid problems already shown', () => {
  const st = MCHECK.fresh(), pool = ['a', 'b', 'c', 'd', 'e'];
  MCHECK.show(st, 'a', '1'); MCHECK.record(st, '1', true);
  MCHECK.show(st, 'b', '2'); MCHECK.record(st, '2', false);
  assert.strictEqual(st.n, 0);
  for (let k = 0; k < 20; k++) assert.ok(['c', 'd', 'e'].includes(MCHECK.pick(pool, st)), 'unseen problems first');
  // When everything has been shown, it recycles, but never into the current streak.
  st.shown = pool.slice(); st.streak = ['c']; st.n = 1;
  for (let k = 0; k < 20; k++) assert.notStrictEqual(MCHECK.pick(pool, st), 'c');
});

test('a pool smaller than a streak cannot master', () => {
  const st = MCHECK.fresh(), pool = ['a', 'b'];
  for (const [id, t] of [['a', '1'], ['b', '2']]) { MCHECK.show(st, MCHECK.pick(pool, st) && id, t); MCHECK.record(st, t, true); }
  assert.strictEqual(st.n, 2);
  assert.strictEqual(MCHECK.pick(pool, st), null);
  assert.strictEqual(MCHECK.pick([], MCHECK.fresh()), null);
});
