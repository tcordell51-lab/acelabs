// The "See it" matcher: a miss opens the right visual, or no button at all. node --test
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const V = require('../../shared/ace-visuals.js');
const ROOT = path.join(__dirname, '..', '..');
const url = (q) => { const m = V.match(q); return m ? m.url : null; };

test('sample misses open the matching visual', () => {
  const cases = [
    [{ section: 'ochem', topic: 'Alkene addition reactions' }, '/see/?b=alkene-map'],
    [{ section: 'ochem', topic: 'SN1/SN2/E1/E2' }, '/see/?b=sn-e-decide'],
    [{ section: 'ochem', topic: 'Aromaticity & EAS' }, '/tools/ochem/#aromatic'],
    [{ section: 'ochem', concept: 'EAS on benzene' }, '/tools/ochem/?game=wheel&wheel=benzene'],
    [{ section: 'ochem', concept: 'Ketone reductions' }, '/tools/ochem/?game=wheel&wheel=ketone'],
    [{ section: 'ochem', concept: 'Ketone reactions' }, '/tools/ochem/?game=wheel&wheel=ketone'],
    [{ section: 'ochem', concept: 'Reagents and reactions' }, '/tools/ochem/?game=wheel'],
    [{ section: 'ochem', topic: 'Stereochemistry (R/S, chirality)' }, '/games/chirality/'],
    [{ section: 'ochem', topic: 'IR & H-NMR spectroscopy' }, '/tools/ochem/#spec-trainer'],
    [{ section: 'ochem', topic: 'Mechanisms' }, '/tools/ochem/#mech-library'],
    [{ section: 'ochem', concept: 'Diels-Alder product' }, '/tools/ochem/#diels-alder'],
    [{ section: 'Organic Chemistry', topic: 'Acidity & pKa' }, '/see/?b=pka-ladder'],
    [{ section: 'gchem', topic: 'vsepr', topicName: 'VSEPR and Geometry' }, '/see/?b=bonding'],
    [{ section: 'gchem', topic: 'lewis', topicName: 'Lewis Structures' }, '/see/?b=bonding'],
    [{ section: 'gchem', topic: 'periodic', topicName: 'Periodic Trends' }, '/see/?b=periodic-trends'],
    [{ section: 'gchem', topic: 'galvanic', topicName: 'Electrochem: Galvanic Cells' }, '/see/?b=redox'],
    [{ section: 'gchem', topic: 'phase-diag', topicName: 'Phase Diagrams' }, '/tools/gc/recognition-lab.html'],
    [{ section: 'bio', topic: 'body-systems', topicName: 'Body systems' }, '/tools/bio/bio-physiology.html'],
    [{ section: 'bio', topic: 'membranes', topicName: 'Membranes and transport' }, '/see/?b=cell-membrane'],
    [{ section: 'bio', topic: 'Mendelian genetics' }, '/see/?b=genetics'],
    [{ section: 'bio', concept: 'Osmosis and tonicity' }, '/tools/bio/bio-osmosis.html'],
    [{ section: 'qr', topic: 'probability', topicName: 'Probability' }, '/see/?b=probability'],
    [{ section: 'qr', topic: 'Statistics (mean/median/SD)' }, '/see/?b=statistics'],
    [{ section: 'qr', skill: 'geo-2d', concept: '2D Geometry: Circles, Squares' }, '/see/?b=geometry'],
    [{ section: 'pat', skill: 'holepunch', concept: 'Hole punching' }, '/see/?b=pat-holepunch'],
    [{ section: 'pat', skill: 'tfe', concept: 'Top front end' }, '/see/?b=pat-tfe'],
    [{ section: 'rc', topic: 'detail', concept: 'Detail questions' }, '/see/?b=rc-question-types'],
    // whiteboards (2026-11-24): these five used to return nothing
    [{ section: 'gchem', topic: 'mole-conv', topicName: 'Mole Conversions' }, '/see/?b=mole-bridge'],
    [{ section: 'gchem', topic: 'ph-basics', topicName: 'Acid-Base: pH/pOH/Ka/Kb' }, '/see/?b=acid-base'],
    [{ section: 'gchem', topic: 'nernst', topicName: 'Electrochem: Nernst Eqn' }, '/see/?b=redox'],
    [{ section: 'qr', topic: 'trigonometry', topicName: 'Trigonometry' }, '/see/?b=trig-triangle'],
    [{ section: 'qr', topic: 'Exponents & roots' }, '/see/?b=powers-roots']
  ];
  for (const [q, want] of cases) assert.strictEqual(url(q), want, JSON.stringify(q));
});

test('no match means no button, never a wrong one', () => {
  for (const q of [
    { section: 'gchem', concept: 'General Chemistry mixed' },
    { section: 'bio', concept: 'Biology mixed' },
    { section: 'rc', topic: 'vocab', concept: 'Vocabulary in context' },
    { section: '', topic: 'VSEPR' },
    { section: 'ochem', topic: 'general', concept: 'Organic Chemistry mixed' },
    null
  ]) assert.strictEqual(V.match(q), null, JSON.stringify(q));
});

test('a visual never crosses sections', () => {
  assert.strictEqual(url({ section: 'qr', topic: 'Bonding' }), null);
  assert.strictEqual(url({ section: 'bio', topic: 'probability' }), null);
});

test('every tool in the inventory is a real file with a known section and group', () => {
  const ids = new Set();
  for (const t of V.tools) {
    assert.ok(!ids.has(t.id), 'duplicate id ' + t.id); ids.add(t.id);
    const sec = V.sections.find((s) => s.id === t.section);
    assert.ok(sec, t.id + ' section'); assert.ok(sec.groups.includes(t.group), t.id + ' group ' + t.group);
    for (const p of [t.path].concat((t.links || []).map((l) => l.path))) {
      let f = p.split('#')[0].split('?')[0]; if (f.endsWith('/')) f += 'index.html';
      assert.ok(fs.existsSync(path.join(ROOT, f)), t.id + ' missing ' + f);
      const hash = p.split('#')[1];
      const wheel = (p.match(/[?&]wheel=([a-z_]+)/) || [])[1];
      if (wheel) assert.ok(fs.readFileSync(path.join(ROOT, f), 'utf8').includes("{key:'" + wheel + "'"), t.id + ' missing wheel ' + wheel);
      if (hash) assert.ok(fs.readFileSync(path.join(ROOT, f), 'utf8').includes('id="' + hash + '"'), t.id + ' missing #' + hash);
    }
    for (const k of ['title', 'blurb', 'does', 'next']) assert.ok(t[k] && !/—/.test(t[k]), t.id + ' ' + k);
  }
  for (const s of V.sections) for (const g of s.groups) assert.ok(V.tools.some((t) => t.section === s.id && t.group === g), 'empty group ' + g);
});

test('withFrom keeps the hash at the end', () => {
  assert.strictEqual(V.withFrom('/tools/ochem/?game=wheel&wheel=ketone', 'review'), '/tools/ochem/?game=wheel&wheel=ketone&from=review');
  assert.strictEqual(V.withFrom('/tools/ochem/#alkenes', 'repair'), '/tools/ochem/?from=repair#alkenes');
});

// Reaction misses open the exact wheel spoke (2026-11-16, with the wheels rebuild in #16).
test('every See it spoke points at a reaction the wheel really has', () => {
  const V = require('../../shared/ace-visuals.js');
  const products = JSON.parse(require('node:fs').readFileSync(require('node:path').join(__dirname, '../../tools/ochem/wheel/wheel-structures.json'), 'utf8')).products;
  for (const r of V.SPOKES) assert.ok(products[r[1] + '__' + r[2]], r[1] + '__' + r[2] + ' is not on a wheel');
});
test('an OChem reagent miss opens its spoke; other sections are untouched', () => {
  const V = require('../../shared/ace-visuals.js');
  const m = V.match({ section: 'ochem', topic: 'alkene-add', topicName: 'Alkene additions', stem: 'Propene is treated with BH3 in THF, then H2O2 and NaOH. What is the major product?' });
  assert.match(m.url, /\?game=wheel&wheel=alkene_terminal&spoke=bh3_h2o2$/);
  assert.strictEqual(V.spoke({ section: 'gchem', stem: 'HBr' }), null);
});
