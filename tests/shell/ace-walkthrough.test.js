// The miss walkthrough: the explanation standard as code, follow-up selection, and the science of
// the two pilots (galvanic lab, GuacaMOLE). Run: node --test tests/shell/ace-walkthrough.test.js
const test = require('node:test');
const assert = require('node:assert');
const path = require('node:path');
const W = require(path.join(__dirname, '../../shared/ace-walkthrough.js'));
const G = require(path.join(__dirname, '../../gc/galvanic/galvanic-walk.js'));
const Q = require(path.join(__dirname, '../../gc/guacamole/guac-walk.js'));

const good = () => ({ answer: 'Zinc is the anode.', trick: { text: 'Electrons always flow from the anode to the cathode.', src: 'Zoom' },
  steps: ['Compare the **potentials**.', 'Higher one is **reduced**.', 'Electrons go anode to cathode.'], traps: { 1: 'Backwards.' },
  check: { q: 'Which is the anode?', a: 'Zinc.' }, sources: ['OpenStax'] });

test('the standard: a clean explanation passes', () => { assert.deepStrictEqual(W.validate(good()), []); });
test('the standard: brick paragraphs, em dashes, step counts and bold are caught', () => {
  const e = good();
  e.answer = 'One. Two. Three sentences is a paragraph, not an answer line.';
  e.trick = { text: 'An attributed line with no source' };
  e.steps = ['a', 'b', 'c', 'd', 'e', 'f'];
  e.traps = { 0: 'x '.repeat(90) };
  e.check = { q: 'Is this — fine?' };
  const p = W.validate(e).join(' | ');
  for (const want of ['answer: more than 2 sentences', 'trick: needs a recorded source', 'steps: 6', 'trap 0: over 2 lines', 'check: em dash']) assert.ok(p.includes(want), want + ' in ' + p);
  assert.ok(W.validate(Object.assign(good(), { steps: ['**one** and **two**', 'b', 'c'] })).some((x) => /bold/.test(x)));
  assert.ok(W.validate(Object.assign(good(), { steps: ['one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen', 'b', 'c'] })).some((x) => /words/.test(x)));
});
test('marks: bold, sub and superscript runs', () => {
  assert.deepStrictEqual(W.runs('**E**cell Cu^{2+} H_2O').map((r) => [r.t, r.k, r.b]), [['E', 0, true], ['cell Cu', 0, false], ['2+', 1, false], [' H', 0, false], ['2', -1, false], ['O', 0, false]]);
  assert.strictEqual(W.plain('**E** cell 10^{23}'), 'E cell 1023');
});
test('pickMore: approved bank items by id first, never the missed item, then generated', () => {
  const five = ['a', 'b', 'c', 'd', 'e'];
  const pool = [{ id: 'gc:gc-0289', choices: five }, { id: 'gc:other', choices: five, skill: 'gc_galvanic', trapFamily: 'gc-concept-swap' }, { id: 'missed', choices: five }, { id: 'gc:x', choices: five, skill: 'gc_x' }];
  const out = W.pickMore({ n: 3, pool, poolIds: ['gc:gc-0289', 'missed'], subtopic: 'gc_galvanic', family: 'gc-concept-swap', exclude: ['missed'], generate: (k) => ({ id: 'gen' + k, choices: five }) });
  assert.deepStrictEqual(out.map((x) => x.id), ['gc:gc-0289', 'gc:other', 'gen0']);
});

test('galvanic: the cathode is the higher reduction potential, electrons run anode to cathode, E cell positive', () => {
  for (const a of G.HALF) for (const b of G.HALF) {
    const c = G.cell(a.id, b.id); if (!c) continue;
    assert.ok(c.cat.e > c.an.e); assert.ok(c.ecell > 0);
    assert.strictEqual(c.dir, c.cathode === 'right' ? 'lr' : 'rl');
    const e = G.explain(c);
    assert.strictEqual(e.traps[c.dir], null);
    assert.ok(e.traps[c.dir === 'lr' ? 'rl' : 'lr']);
    assert.deepStrictEqual(W.validate(e), [], a.id + '|' + b.id);
    assert.strictEqual(G.board(c).frames.length, e.steps.length);
  }
});
test('galvanic: Appendix L values used on the page', () => {
  const want = { Ag: 0.7996, Cu: 0.337, Pb: -0.1262, Sn: -0.1375, Ni: -0.257, Fe: -0.447, Zn: -0.7618, Al: -1.662, Mg: -2.372 };
  for (const h of G.HALF) assert.strictEqual(h.e, want[h.id], h.id);
  assert.strictEqual(G.fmtCell(G.cell('Zn', 'Cu').ecell), '+1.099');
});
test('galvanic: follow-ups have five different choices, one key, a trap on every wrong one', () => {
  for (const [x, y] of G.pairs(0.1)) for (const t of G.TYPES) {
    const v = G.variant(t, x, y, 3);
    assert.strictEqual(new Set(v.choices).size, 5);
    const an = G.byId[x].e < G.byId[y].e ? G.byId[x] : G.byId[y], cat = an === G.byId[x] ? G.byId[y] : G.byId[x];
    const key = v.choices[v.answer];
    if (t === 'flow') assert.ok(key.startsWith('From the ' + an.metal + ' electrode to the ' + cat.metal));
    if (t === 'anode') assert.ok(key.startsWith('The ' + an.metal + ' electrode'));
    if (t === 'mass') assert.ok(key.startsWith('The ' + cat.metal + ' electrode'));
    v.traps.forEach((tr, i) => assert.strictEqual(tr == null, i === v.answer));
    assert.ok(v.stem.indexOf(cat.id) < v.stem.indexOf(an.id), 'cathode written on the left');
  }
  const gen = G.generator(G.cell('Zn', 'Cu'), 9), ids = [0, 1, 2].map((k) => gen(k).id);
  assert.strictEqual(new Set(ids).size, 3); assert.ok(ids.every((id) => !/Zn-Cu|Cu-Zn/.test(id)));
});

test('guacamole: every wrong choice has a trap family and a walkthrough that meets the standard', () => {
  for (const it of Q.ITEMS) {
    assert.strictEqual(it.ch.filter((c) => c.ok).length, 1, it.id);
    it.ch.forEach((c, i) => {
      const spec = Q.SPEC[it.id].ch[i];
      assert.strictEqual(spec == null, !!c.ok, it.id + ' ' + i);
      if (c.ok) return;
      assert.ok(Q.FAMILIES[spec[0]], it.id + ' family');
      const w = Q.explain(it.id, i);
      assert.deepStrictEqual(W.validate(w.explain), [], it.id + ' ' + i);
      assert.strictEqual(w.board.frames.length, w.explain.steps.length);
    });
  }
});
test('guacamole: follow-up keys recomputed from the stem numbers', () => {
  const NA = 6.022e23;
  for (const fam of Object.keys(Q.FAMILIES)) {
    const [A, B] = Q.grid(fam); let n = 0;
    for (let a = 0; a < A; a++) for (let b = 0; b < B; b++) {
      const v = Q.variant(fam, a, b); if (!v) continue; n++;
      assert.strictEqual(new Set(v.choices).size, 5);
      const key = v.values[v.answer];
      const nums = v.stem.replace(/\b(?:[A-Z][a-z]?\d*)+\b/g, 'X').replace(/× 10([⁰¹²³⁴-⁹⁻]+)/g, (m, s) => 'e' + s.split('').map((ch) => ({ '⁰': 0, '¹': 1, '²': 2, '³': 3, '⁴': 4, '⁵': 5, '⁶': 6, '⁷': 7, '⁸': 8, '⁹': 9, '⁻': '-' })[ch]).join('')).replace(/ e/g, 'e').match(/\d+(\.\d+)?(e-?\d+)?/g).map(Number);
      let expect;
      if (fam === 'inverted') expect = nums[0] / nums[1];
      if (fam === 'skip') expect = nums[0] / nums[1] * NA;
      if (fam === 'stop') expect = nums[0] / nums[1] * 22.4;
      if (fam === 'exit') expect = nums[0] / NA * nums[1];
      if (expect != null) assert.ok(Math.abs(expect - key) / key < 0.006, fam + ' ' + v.id + ' ' + expect + ' vs ' + key);
    }
    assert.ok(n >= 12, fam + ' has variants');
  }
});
