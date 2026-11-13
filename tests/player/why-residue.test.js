// CONTENT-FIX 3: every full-length explanation override is clean student copy
// (scripts/scan-why-residue.mjs): no SMILES, no internal QA notes, no option letters or
// index pointers, no verdict words, no dashes, emojis or non-ASCII outside the notation list.
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const SCAN = path.resolve(__dirname, '..', '..', 'scripts', 'scan-why-residue.mjs');

test('the scanner catches each kind of residue', async () => {
  const { scanText } = await import(SCAN);
  const rules = (t) => scanText(t).map((h) => h.rule);
  assert.ok(rules('gives 6-oxoheptanal (CC(=O)CCCCC=O, C7H12O2)').includes('smiles'));
  assert.ok(rules('yielding the bromide (canonical CC(C)C(C)(C)Br)').includes('qa'));
  assert.ok(rules('(C7H12O2 verified)').includes('qa'));
  assert.ok(rules('Distractors: a dione').includes('qa'));
  assert.ok(rules('Keyed correct=0 is right.').includes('letter'));
  assert.ok(rules('option B is the enol ether').includes('letter'));
  assert.ok(rules('(Z) is wrong geometry').includes('verdict'));
  assert.ok(rules('a ring — opened').includes('dash'));
  assert.ok(rules('nice ✅').includes('emoji'));
  assert.ok(rules('an arrow → here').includes('non-ascii'));
  assert.deepEqual(rules('C1-C6 bond, Cl2/CCl4, CH3-C=O, C7H12O2, (E)-1-bromo-2-hexene, 10⁻³ M'), []);
});

test('no override carries residue', async () => {
  const { scanAll } = await import(SCAN);
  const r = scanAll();
  assert.equal(r.overrideCount, 72);
  assert.deepEqual(r.overrides.map((e) => e.id + ': ' + e.hits.map((h) => h.rule + ' ' + h.match).join(', ')), []);
});

// CONTENT-FIX 4: the 25 served OChem bank explanations the scanner still flagged now carry
// overrides, so no OChem item in the full-length forms shows residue to a student.
test('every served OChem full-length explanation is clean: overridden or clean in the bank', async () => {
  const { scanAll } = await import(SCAN);
  const r = scanAll();
  assert.ok(r.bankOchemScanned > 0);
  assert.deepEqual(r.bank.map((e) => e.id + ': ' + e.hits.map((h) => h.rule + ' ' + h.match).join(', ')), []);
});
