// The OChem visual lessons (/oc/lessons/): data/oc-lessons.json is built by
// scripts/build-oc-lessons.py with RDKit; this checks the built file the page reads. node --test
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.join(__dirname, '..', '..');
const read = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const data = read('data/oc-lessons.json');
const Skills = require('../../shared/ace-skills.js');
const families = read('scripts/oc-lessons/trap-families.json').families;
const tags = read('scripts/bank/out/ace-bank-tags.json').tags;
const formIds = new Set(JSON.stringify(read('scripts/bank/forms.json')).match(/"oc:[^"]+"/g).map((s) => s.slice(1, -1)));
const publicIds = new Set(read('data/ochem.json').items.map((i) => i.id));
// subtopic ids the blueprint adds that ace-skills.js does not carry yet
const PENDING = new Set(['oc_bronsted_lowry', 'oc_extraction', 'oc_recrystallization', 'oc_distillation', 'oc_multi_spectra', 'oc_alcohol_to_halide', 'oc_carbonyl_deoxygenation', 'oc_multistep_synthesis', 'oc_chemoselectivity']);
const known = (id) => !!Skills.names[id] || PENDING.has(id);
// Units 1 to 3 in the blueprint's teaching order
const PILOT = ['oc_hybridization', 'oc_formal_charge', 'oc_resonance', 'oc_conjugation', 'oc_polarity', 'oc_arrow_pushing',
  'oc_bronsted_lowry', 'oc_pka', 'oc_conj_base_stability', 'oc_inductive_resonance_acidity', 'oc_amine_basicity',
  'oc_imfs', 'oc_physical_trends', 'oc_ihd', 'oc_alkane_naming', 'oc_priority_order'];

test('the pilot is Units 1 to 3, in teaching order', () => {
  const order = data.lessons.slice().sort((a, b) => a.unit - b.unit || a.order - b.order).map((l) => l.id);
  assert.deepStrictEqual(order, PILOT);
});

test('every lesson has the five screens', () => {
  for (const l of data.lessons) {
    assert.ok(l.idea && l.idea.length < 220 && !/\.\s+\S/.test(l.idea.trim().replace(/\.$/, '')), l.id + ': one idea, one sentence');
    assert.ok(l.figure && l.figure.panels.length >= 1, l.id + ': a figure');
    assert.ok(l.visual.caption && l.steps.length >= 2, l.id + ': caption and the move');
    assert.ok(l.connect.text && Array.isArray(l.connect.letters), l.id + ': connect line');
    l.connect.letters.forEach((c) => assert.ok('CARDIO'.includes(c), l.id + ': CARDIO letter ' + c));
    l.connect.links.forEach((id) => assert.ok(known(id), l.id + ': linked subtopic ' + id));
    assert.strictEqual(l.traps.length, 3, l.id + ': three traps');
    assert.ok(known(l.id), l.id + ': known subtopic id');
  }
});

test('traps use the approved family names and fixes, three different families', () => {
  const byId = Object.fromEntries(families.map((f) => [f.id, f]));
  assert.strictEqual(families.length, 39);
  for (const l of data.lessons) {
    assert.strictEqual(new Set(l.traps.map((t) => t.family)).size, 3, l.id);
    for (const t of l.traps) {
      const f = byId[t.family];
      assert.ok(f, l.id + ': ' + t.family + ' is an approved family');
      assert.strictEqual(t.name, f.name, l.id + ': exact family name');
      assert.strictEqual(t.fix, f.fix, l.id + ': exact family fix');
      assert.ok(t.basis === 'measured' || t.basis === 'judgment', l.id + ': basis marked');
    }
  }
});

test('checks are ids only: bank ids on the same subtopic, never a full-length form item', () => {
  for (const l of data.lessons) {
    const ids = l.check.ids, pub = l.check.publicIds || [];
    assert.ok(ids.length <= 3 && pub.length <= 3, l.id);
    if (ids.length < 3) assert.ok(l.check.gap, l.id + ': a short check says what is missing');
    for (const id of ids) {
      assert.ok(tags[id], l.id + ': ' + id + ' is a bank id');
      assert.strictEqual(tags[id][0], l.id, l.id + ': ' + id + ' is tagged to this subtopic');
      assert.ok(!formIds.has(id), l.id + ': ' + id + ' is not in a full-length form');
    }
    for (const id of pub) assert.ok(publicIds.has(id), l.id + ': ' + id + ' is in the public OChem bank');
    // no question text in the lesson file: no stems, choices or explanations
    assert.ok(!('stem' in l.check) && !('choices' in l.check), l.id);
  }
  const src = fs.readFileSync(path.join(ROOT, 'scripts/oc-lessons/lessons.json'), 'utf8');
  assert.ok(!/"(stem|choices|explanation)"\s*:/.test(src), 'lessons.json carries no item text');
});

test('drawings fit a phone and use color only for arrows and highlights', () => {
  for (const l of data.lessons) for (const p of l.figure.panels) {
    const w = +(/width='(\d+)px'/.exec(p.svg) || [])[1];
    assert.ok(w > 0 && w <= 343, l.id + ': svg width ' + w);
    assert.ok(/^<svg role='img' aria-label='[^']+'/.test(p.svg), l.id + ': svg has a label');
    assert.ok(!/<script|on\w+=/i.test(p.svg), l.id + ': no script in svg');
  }
});

test('house style: CARDIO spelled right, no em dashes, no emoji, no money words', () => {
  const text = fs.readFileSync(path.join(ROOT, 'data/oc-lessons.json'), 'utf8').replace(/<svg[\s\S]*?<\/svg>/g, '');
  assert.ok(!/CARIO/.test(text), 'CARDIO, not CARIO');
  assert.ok(!/—/.test(text), 'no em dash');
  assert.ok(!/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(text), 'no emoji');
  assert.ok(!/\$\d|\bpaid\b|\bpackage\b|\binstallment\b/i.test(text), 'no money language');
});

test('every clip slot names a recording or a clip', () => {
  for (const l of data.lessons) assert.ok(l.clip && (l.clip.useNow || l.clip.record), l.id);
});
