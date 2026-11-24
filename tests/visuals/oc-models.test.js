// The chemistry behind the OChem 3D models (/oc/models/): every label, angle and energy the page
// shows is computed by oc/models/chem.js, and checked here against the textbook facts. node --test
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.join(__dirname, '..', '..');
const C = require(path.join(ROOT, 'oc/models/chem.js'));
const V = C.vec;
const dist = (m, i, j) => V.len(V.sub(m.pos(i), m.pos(j)));
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, (msg || '') + ' ' + a + ' vs ' + b);
function closest(m) {
  let d = 9;
  for (let i = 0; i < m.atoms.length; i++) for (let j = i + 1; j < m.atoms.length; j++) {
    if (m.bonds.some((b) => (b[0] === i && b[1] === j) || (b[0] === j && b[1] === i))) continue;
    d = Math.min(d, dist(m, i, j));
  }
  return d;
}

test('R and S: the triple product agrees with known molecules, and a mirror flips it', () => {
  // D-glyceraldehyde is R. Fischer projection: CHO up, CH2OH down, OH right, H left; sideways bonds toward you.
  const fischer = [{ x: 1, y: 0, z: 1, rank: 1 }, { x: 0, y: -1, z: -1, rank: 2 }, { x: 0, y: 1, z: -1, rank: 3 }, { x: -1, y: 0, z: 1, rank: 4 }];
  assert.strictEqual(C.label2D(fischer), 'R');
  assert.strictEqual(C.label2D(fischer.map((s) => Object.assign({}, s, { x: -s.x }))), 'S', 'swap left and right: the enantiomer');
  // group 4 away from the viewer, 1 to 2 to 3 clockwise: R
  assert.strictEqual(C.chirality([1, 0, 0], [-0.5, -0.866, 0], [-0.5, 0.866, 0], [0, 0, -1]), 'R');
  assert.strictEqual(C.chirality([1, 0, 0], [-0.5, 0.866, 0], [-0.5, -0.866, 0], [0, 0, -1]), 'S');
  // a wedge and a dash on the same bond give opposite labels, with the hydrogen implied
  const subs = [{ x: 0, y: -40, rank: 1 }, { x: 40, y: 25, rank: 2 }, { x: -40, y: 25, rank: 3 }];
  const w = C.stereoBond('R', subs, 0), d = C.stereoBond('S', subs, 0);
  assert.notStrictEqual(w, d);
  assert.strictEqual(C.label2D(subs.map((s, i) => Object.assign({ z: i === 0 ? (w === 'wedge' ? 1 : -1) : 0 }, s))), 'R');
});

test('2,3-dibromobutane: three stereoisomers, and the relationships between them', () => {
  for (const [a, b] of [['R', 'R'], ['S', 'S'], ['R', 'S'], ['S', 'R']]) {
    const m = C.dibromobutane(a, b);
    assert.deepStrictEqual(m.info.labels, [a, b]);
    assert.strictEqual(m.atoms.filter((x) => x.el === 'Br').length, 2);
    assert.strictEqual(m.atoms.filter((x) => x.el === 'C').length, 4);
    assert.strictEqual(m.atoms.filter((x) => x.el === 'H').length, 8);
    assert.ok(closest(m) > 1.5, 'no atoms on top of each other');
  }
  const rr = C.dibromobutane('R', 'R');
  assert.deepStrictEqual(C.dibromoLabels(rr.mirror()), ['S', 'S'], 'the mirror image of (2R,3R) is (2S,3S)');
  assert.strictEqual(C.relate(['R', 'R'], ['S', 'S']), 'enantiomers');
  assert.strictEqual(C.relate(['R', 'R'], ['R', 'S']), 'diastereomers');
  assert.strictEqual(C.relate(['R', 'R'], ['R', 'R']), 'identical');
  assert.ok(C.isMeso(['R', 'S']) && !C.isMeso(['R', 'R']));
  // meso: with the methyls eclipsed, reflecting through the plane between C2 and C3 gives the same molecule back
  const meso = C.dibromobutane('R', 'S', 0), I = meso.info;
  for (const k of [0, 1, 2]) {
    const f = meso.atoms[I.front[k]], bMatch = I.back.map((j) => meso.atoms[j]).find((b) => b.el === f.el);
    near(f.x, bMatch.x, 1e-6, 'x'); near(f.y, bMatch.y, 1e-6, 'y'); near(f.z, -bMatch.z, 1e-6, 'z');
  }
  assert.deepStrictEqual(C.dibromoLabels(meso.mirror()), ['S', 'R'], 'and (2S,3R) is the same compound as (2R,3S)');
});

test('chair: a ring flip swaps axial and equatorial but never up and down', () => {
  for (let i = 0; i < 6; i++) for (const face of ['up', 'down']) {
    assert.notStrictEqual(C.chairPosition(i, face, 0), C.chairPosition(i, face, 1), 'carbon ' + i + ' ' + face);
    assert.notStrictEqual(C.chairPosition(i, 'up', 0), C.chairPosition(i, 'down', 0), 'one axial and one equatorial on each carbon');
    assert.notStrictEqual(C.chairPosition(i, face, 0), C.chairPosition((i + 1) % 6, face, 0), 'axial alternates up and down around the ring');
  }
  for (const key of ['Me', 'tBu']) for (const t of [0, 1]) {
    const m = C.chairMol(key, t), I = m.info, sub = m.pos(I.sub), c0 = m.pos(I.ring[0]);
    const dir = V.unit(V.sub(sub, c0));
    assert.ok(dir[2] > 0, 'the group stays on the top face');
    if (I.position === 'axial') assert.ok(dir[2] > 0.97, 'axial points straight up'); else assert.ok(dir[2] < 0.5, 'equatorial points out');
    for (let i = 0; i < 6; i++) near(dist(m, I.ring[i], I.ring[(i + 1) % 6]), 1.53, 1e-6, 'ring bond');
    assert.strictEqual(m.atoms.filter((a) => a.el === 'C').length, key === 'Me' ? 7 : 10);
    assert.strictEqual(m.atoms.filter((a) => a.el === 'H').length, key === 'Me' ? 14 : 20);
    assert.strictEqual(m.atoms.filter((a) => / clash/.test(a.tag)).length, I.position === 'axial' ? 2 : 0, 'two 1,3-diaxial hydrogens when axial');
  }
  assert.strictEqual(C.chairMol('Me', 0).info.position, 'axial');
  assert.strictEqual(C.chairMol('Me', 1).info.position, 'equatorial');
  near(C.CHAIR.Me.strain, 7.6, 0); near(C.CHAIR.tBu.strain, 22.8, 0);
  near(C.eqPercent(C.CHAIR.Me.strain), 95, 1, 'about 95 percent equatorial for methyl');
  assert.ok(C.eqPercent(C.CHAIR.tBu.strain) > 99.9, 'tert-butyl locks the ring');
});

test('butane: the four named conformations and their energies', () => {
  near(C.butaneEnergy(0), 19, 0.01); near(C.butaneEnergy(60), 3.8, 0.01); near(C.butaneEnergy(120), 16, 0.01); near(C.butaneEnergy(180), 0, 0.01);
  near(C.butaneEnergy(300), 3.8, 0.01, 'the curve is symmetric');
  for (let a = 0; a <= 360; a += 5) assert.ok(C.butaneEnergy(a) >= -0.6 && C.butaneEnergy(a) <= 19.01, 'energy in range at ' + a);
  assert.strictEqual(C.conformer(180).key, 'anti'); assert.strictEqual(C.conformer(60).key, 'gauche'); assert.strictEqual(C.conformer(300).key, 'gauche');
  assert.strictEqual(C.conformer(0).key, 'syn'); assert.strictEqual(C.conformer(120).key, 'eclipsed'); assert.strictEqual(C.conformer(240).key, 'eclipsed');
  assert.strictEqual(C.conformer(90).key, 'between');
  assert.ok(C.conformer(180).kJ < C.conformer(60).kJ && C.conformer(60).kJ < C.conformer(120).kJ && C.conformer(120).kJ < C.conformer(0).kJ, 'anti < gauche < eclipsed < fully eclipsed');
  // the model's methyl to methyl dihedral really is the slider angle
  for (const phi of [0, 60, 180]) {
    const m = C.butaneMol(phi), I = m.info, f = m.pos(I.front[0]), b = m.pos(I.back[0]);
    const ang = Math.acos(V.dot(V.unit([f[0], f[1], 0]), V.unit([b[0], b[1], 0]))) * 180 / Math.PI;
    near(ang, phi, 1e-6, 'dihedral');
    assert.strictEqual(m.atoms.filter((a) => a.el === 'C').length, 4); assert.strictEqual(m.atoms.filter((a) => a.el === 'H').length, 10);
  }
});

test('SN2: backside attack, a flat transition state, and inversion', () => {
  const L = C.sn2Labels();
  assert.strictEqual(L.reactant, 'S', '(S)-2-bromobutane');
  assert.strictEqual(L.product, 'R', 'gives (R)-butan-2-ol');
  for (const p of [0, 0.25, 0.5, 0.75, 1]) {
    const m = C.sn2Mol(p), I = m.info, c = m.pos(I.center);
    const toNu = V.unit(V.sub(m.pos(I.o), c)), toLg = V.unit(V.sub(m.pos(I.br), c));
    near(V.dot(toNu, toLg), -1, 1e-9, 'nucleophile, carbon and leaving group stay in line: 180 degrees');
    assert.ok(closest(m) > 1.4, 'no overlap at p=' + p);
  }
  const ts = C.sn2Mol(0.5), It = ts.info;
  assert.strictEqual(It.stage, 'ts');
  for (const k of ['H', 'Me', 'Et']) near(ts.pos(It.ids[k])[0], 0, 1e-9, 'the three groups are flat at the transition state');
  assert.strictEqual(ts.bonds.filter((b) => b[3] === 'partial').length, 2, 'two partial bonds');
  assert.ok(C.sn2Mol(0).pos(C.sn2Mol(0).info.ids.H)[0] < 0 && C.sn2Mol(1).pos(C.sn2Mol(1).info.ids.H)[0] > 0, 'the umbrella flips');
  near(dist(C.sn2Mol(1), C.sn2Mol(1).info.center, C.sn2Mol(1).info.o), 1.43, 1e-9, 'C-O bond formed');
  assert.strictEqual(C.sn2Mol(0, true).info.reactant, 'R', 'the mirror-image start gives the mirror-image result');
});

test('E2: only an anti hydrogen can leave, and the conformer sets cis or trans', () => {
  assert.deepStrictEqual([C.e2State(180).anti, C.e2State(180).product], ['Ha', 'cis']);
  assert.deepStrictEqual([C.e2State(60).anti, C.e2State(60).product], ['Hb', 'trans']);
  assert.strictEqual(C.e2State(300).anti, null, 'with the methyl anti to Br, no hydrogen on this carbon can leave');
  assert.strictEqual(C.e2State(0).anti, null); assert.strictEqual(C.e2State(120).anti, null);
  assert.strictEqual(C.e2State(60).methylDihedral, 180); assert.strictEqual(C.e2State(180).methylDihedral, 60);
  for (const [th, same] of [[180, true], [60, false]]) {
    const m0 = C.e2Mol(th, 0), I0 = m0.info;
    const br = m0.pos(I0.front[0]), h = m0.pos(I0.leavingH);
    near(V.dot(V.unit([br[0], br[1], 0]), V.unit([h[0], h[1], 0])), -1, 1e-9, 'H and Br are anti-periplanar: 180 degrees');
    const m = C.e2Mol(th, 1), I = m.info;
    assert.strictEqual(I.methylsSameSide, same, same ? 'gauche methyls end up cis' : 'anti methyls end up trans');
    near(dist(m, I.cf, I.cb), 1.34, 1e-9, 'C=C length');
    assert.strictEqual(m.bonds.find((b) => b[0] === I.cf && b[1] === I.cb)[2], 2, 'double bond');
    for (const j of [I.front[1], I.front[2], I.back[0], I.back[1], I.back[2]].filter((x) => x !== I.leavingH)) near(Math.abs(m.pos(j)[1]), 0, 1e-6, 'the alkene is flat');
    near(dist(m, I.base, I.leavingH), 0.96, 1e-9, 'the base holds the hydrogen');
    for (const p of [0, 0.5, 1]) assert.ok(closest(C.e2Mol(th, p)) > 1.3, 'no overlap');
  }
  assert.strictEqual(C.e2Mol(300, 1).info.s, 0, 'no anti hydrogen: the reaction does not run');
});

test('hybridization: the angles are measured from the models', () => {
  near(C.bondAngle(C.hybridMol('sp3'), 0), 109.47, 0.01); near(C.bondAngle(C.hybridMol('sp2'), 0), 120, 0.01); near(C.bondAngle(C.hybridMol('sp'), 0), 180, 0.01);
  assert.strictEqual(C.hybridOf(4), 'sp3'); assert.strictEqual(C.hybridOf(3), 'sp2'); assert.strictEqual(C.hybridOf(2), 'sp');
  for (const k of ['sp3', 'sp2', 'sp']) {
    const f = C.HYBRID[k], m = C.hybridMol(k);
    assert.strictEqual(f.groups + f.pLeft, 4, 'four valence orbitals on carbon');
    assert.strictEqual(f.pi, f.pLeft, 'each leftover p orbital makes one pi bond');
    const c0 = m.orbitals.filter((o) => V.len(V.sub(o.at, m.pos(0))) < 1e-9);
    assert.strictEqual(c0.filter((o) => o.kind === 'hyb').length, f.groups, k + ' hybrid lobes');
    assert.strictEqual(c0.filter((o) => o.kind !== 'hyb').length, 2 * f.pLeft, k + ' p lobes');
  }
  assert.ok(C.HYBRID.sp.sChar > C.HYBRID.sp2.sChar && C.HYBRID.sp2.sChar > C.HYBRID.sp3.sChar);
});

test('benzene and the Huckel count', () => {
  const m = C.benzeneMol(), I = m.info;
  for (let i = 0; i < 6; i++) { near(dist(m, I.ring[i], I.ring[(i + 1) % 6]), 1.39, 1e-9, 'all six C-C bonds equal'); near(m.pos(I.ring[i])[2], 0, 0, 'planar'); }
  assert.strictEqual(m.orbitals.length, 12, 'one p orbital, two lobes, on each carbon');
  assert.strictEqual(C.huckel(6), 'aromatic'); assert.strictEqual(C.huckel(2), 'aromatic'); assert.strictEqual(C.huckel(10), 'aromatic');
  assert.strictEqual(C.huckel(4), 'antiaromatic'); assert.strictEqual(C.huckel(8), 'antiaromatic');
  assert.strictEqual(C.huckel(8, { planar: false }), 'nonaromatic', 'cyclooctatetraene is tub shaped');
  assert.strictEqual(C.huckel(6, { cyclic: false }), 'nonaromatic'); assert.strictEqual(C.huckel(4, { conjugated: false }), 'nonaromatic');
});

test('the page keeps the hard rule: every model has a 3D view, a line drawing and words', () => {
  const html = fs.readFileSync(path.join(ROOT, 'oc/models/index.html'), 'utf8'), js = fs.readFileSync(path.join(ROOT, 'oc/models/lab.js'), 'utf8');
  for (const id of ['view', 'draw', 'words']) assert.match(html, new RegExp('id="' + id + '"'));
  const ids = [...js.matchAll(/^  (\w+): \{ title:/gm)].map((x) => x[1]);
  assert.deepStrictEqual(ids, ['hybrid', 'newman', 'chair', 'stereo', 'sn2', 'e2', 'benzene']);
  for (const id of ids) {
    const body = js.slice(js.indexOf('  ' + id + ': { title:'));
    const end = body.indexOf('\n  },\n'); const one = body.slice(0, end < 0 ? undefined : end);
    assert.match(one, /\bdraw\(/, id + ' has a line drawing'); assert.match(one, /\bwords\(/, id + ' has a written version'); assert.match(one, /\bbuild\(/, id + ' has a 3D model');
  }
  assert.ok(!/[\u2013\u2014]/.test(html + js), 'no long dashes');
});
