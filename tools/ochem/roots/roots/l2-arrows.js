// The Roots of Organic, Level 2, Root 6: Attack, kick it off, attach.
// Nucleophile, electrophile, curved arrows. No imports (contract).

export const meta = {
  id: 'l2-arrows',
  level: 2,
  order: 6,
  needs3D: false,
  title: 'Attack, kick it off, attach',
  concept: 'Nucleophiles, electrophiles and curved arrows',
  tagline: 'The arrow starts where the electrons are. Rich attacks poor.',
  story: 'A nucleophile is electron rich: it has a lone pair, a pi bond, or a flat-out negative charge, and it is looking for somewhere to put those electrons. An electrophile is electron poor: a carbon left partial positive by a bully next door, or an acidic hydrogen. Rich attacks poor. A curved arrow is how we write that, and this is a rule: the arrow starts at the electrons and ends where they go. It never starts at a plus sign, because a plus has nothing to give. When the carbon being attacked already has four bonds, something has to leave, so the leaving group takes its bond with it. Attack, kick it off, attach. A proton transfer is the same move on a hydrogen. Rule of thumb: find the electrons, find the poor atom, draw the arrow between them.',
  moveName: 'Attack, kick it off, attach',
  move: [
    'Find the nucleophile: the lone pair, pi bond, or minus. That is where the arrow starts.',
    'Find the electrophile: the partial positive carbon, or the acidic H. That is where the arrow ends.',
    'Attack: draw the arrow from the electrons to the poor atom.',
    'Kick it off: if that atom already has four bonds, a second arrow sends one bond onto the leaving group.',
    'Attach: draw the product with the new bond and the leaving group holding its old bond as a lone pair.'
  ],
  trap: 'Careful: arrows show electrons moving, never atoms, and an arrow never starts at a positive charge, because a plus has nothing to give.',
  holdsUp: ['Every mechanism question', 'SN1 versus SN2', 'Carbonyl chemistry', 'Acid-base'],
  drill: 'Booster OChem: The Fundamentals'
};


// ---------- fragments ----------
// Nucleophiles sit on the left, electrophiles on the right, in a 420 by 220 frame. Every fragment is a small graph:
// atoms (id, x, y, label), bonds [a, b, order], lp {id: [angles]}, charges {id: '+' | '-'}.
const NUC = {
  hydroxide: { name: 'hydroxide', atoms: [{ id: 'nH', x: 55, y: 110, label: 'H' }, { id: 'nO', x: 105, y: 110, label: 'O' }], bonds: [['nH', 'nO', 1]], lp: { nO: [0, 90, 270] }, charges: { nO: '-' }, nuc: 'nO' },
  methoxide: { name: 'methoxide', atoms: [{ id: 'nMe', x: 45, y: 110, label: 'H3C' }, { id: 'nO', x: 115, y: 110, label: 'O' }], bonds: [['nMe', 'nO', 1]], lp: { nO: [0, 90, 270] }, charges: { nO: '-' }, nuc: 'nO' },
  cyanide: { name: 'cyanide', atoms: [{ id: 'nN', x: 50, y: 110, label: 'N' }, { id: 'nC', x: 115, y: 110, label: 'C' }], bonds: [['nN', 'nC', 3]], lp: { nC: [0], nN: [180] }, charges: { nC: '-' }, nuc: 'nC' },
  hydrosulfide: { name: 'hydrosulfide', atoms: [{ id: 'nH', x: 55, y: 110, label: 'H' }, { id: 'nS', x: 105, y: 110, label: 'S' }], bonds: [['nH', 'nS', 1]], lp: { nS: [0, 90, 270] }, charges: { nS: '-' }, nuc: 'nS' },
  iodide: { name: 'iodide', atoms: [{ id: 'nI', x: 105, y: 110, label: 'I' }], bonds: [], lp: { nI: [0, 90, 180, 270] }, charges: { nI: '-' }, nuc: 'nI' },
  hydride: { name: 'hydride', atoms: [{ id: 'nH', x: 105, y: 110, label: 'H' }], bonds: [], lp: { nH: [0] }, charges: { nH: '-' }, nuc: 'nH' },
  methyl: { name: 'a methyl carbanion (the business end of a Grignard)', atoms: [{ id: 'nC', x: 100, y: 110, label: 'H3C' }], bonds: [], lp: { nC: [0] }, charges: { nC: '-' }, nuc: 'nC' },
  amide: { name: 'amide ion', atoms: [{ id: 'nHa', x: 62, y: 82, label: 'H' }, { id: 'nHb', x: 62, y: 138, label: 'H' }, { id: 'nN', x: 105, y: 110, label: 'N' }], bonds: [['nHa', 'nN', 1], ['nHb', 'nN', 1]], lp: { nN: [0, 90] }, charges: { nN: '-' }, nuc: 'nN' },
  ethene: { name: 'ethene', atoms: [{ id: 'nC1', x: 50, y: 110, label: 'H2C' }, { id: 'nC2', x: 125, y: 110, label: 'CH2' }], bonds: [['nC1', 'nC2', 2]], lp: {}, charges: {}, nuc: 'nC2', pi: ['nC1', 'nC2'], via: 'nC2', plusOn: 'nC1' },
  propene: { name: 'propene', atoms: [{ id: 'nC3', x: 30, y: 140, label: 'H3C' }, { id: 'nC2', x: 85, y: 105, label: 'CH' }, { id: 'nC1', x: 140, y: 140, label: 'CH2' }], bonds: [['nC3', 'nC2', 1], ['nC2', 'nC1', 2]], lp: {}, charges: {}, nuc: 'nC1', pi: ['nC2', 'nC1'], via: 'nC1', plusOn: 'nC2' }
};
const ELE = {
  bromomethane: { name: 'bromomethane', atoms: [{ id: 'eC', x: 255, y: 110, label: 'H3C' }, { id: 'eX', x: 335, y: 110, label: 'Br' }], bonds: [['eC', 'eX', 1]], lp: { eX: [45, 315, 0] }, charges: {}, ele: 'eC', lg: 'eX', lgBond: ['eC', 'eX'], kind: 'sn2' },
  chloromethane: { name: 'chloromethane', atoms: [{ id: 'eC', x: 255, y: 110, label: 'H3C' }, { id: 'eX', x: 335, y: 110, label: 'Cl' }], bonds: [['eC', 'eX', 1]], lp: { eX: [45, 315, 0] }, charges: {}, ele: 'eC', lg: 'eX', lgBond: ['eC', 'eX'], kind: 'sn2' },
  iodomethane: { name: 'iodomethane', atoms: [{ id: 'eC', x: 255, y: 110, label: 'H3C' }, { id: 'eX', x: 335, y: 110, label: 'I' }], bonds: [['eC', 'eX', 1]], lp: { eX: [45, 315, 0] }, charges: {}, ele: 'eC', lg: 'eX', lgBond: ['eC', 'eX'], kind: 'sn2' },
  bromoethane: { name: 'bromoethane', atoms: [{ id: 'eMe', x: 215, y: 145, label: 'H3C' }, { id: 'eC', x: 270, y: 110, label: 'CH2' }, { id: 'eX', x: 345, y: 110, label: 'Br' }], bonds: [['eMe', 'eC', 1], ['eC', 'eX', 1]], lp: { eX: [45, 315, 0] }, charges: {}, ele: 'eC', lg: 'eX', lgBond: ['eC', 'eX'], kind: 'sn2' },
  formaldehyde: { name: 'formaldehyde', atoms: [{ id: 'eHa', x: 245, y: 155, label: 'H' }, { id: 'eHb', x: 245, y: 75, label: 'H' }, { id: 'eC', x: 285, y: 115, label: 'C' }, { id: 'eO', x: 345, y: 75, label: 'O' }], bonds: [['eHa', 'eC', 1], ['eHb', 'eC', 1], ['eC', 'eO', 2]], lp: { eO: [30, 100] }, charges: {}, ele: 'eC', lg: 'eO', lgBond: ['eC', 'eO'], kind: 'carbonyl' },
  acetaldehyde: { name: 'acetaldehyde', atoms: [{ id: 'eMe', x: 232, y: 160, label: 'H3C' }, { id: 'eHb', x: 245, y: 72, label: 'H' }, { id: 'eC', x: 285, y: 115, label: 'C' }, { id: 'eO', x: 345, y: 75, label: 'O' }], bonds: [['eMe', 'eC', 1], ['eHb', 'eC', 1], ['eC', 'eO', 2]], lp: { eO: [30, 100] }, charges: {}, ele: 'eC', lg: 'eO', lgBond: ['eC', 'eO'], kind: 'carbonyl' },
  acetone: { name: 'acetone', atoms: [{ id: 'eMe', x: 232, y: 162, label: 'H3C' }, { id: 'eMb', x: 232, y: 68, label: 'H3C' }, { id: 'eC', x: 285, y: 115, label: 'C' }, { id: 'eO', x: 345, y: 75, label: 'O' }], bonds: [['eMe', 'eC', 1], ['eMb', 'eC', 1], ['eC', 'eO', 2]], lp: { eO: [30, 100] }, charges: {}, ele: 'eC', lg: 'eO', lgBond: ['eC', 'eO'], kind: 'carbonyl' },
  hcl: { name: 'HCl', atoms: [{ id: 'eH', x: 255, y: 110, label: 'H' }, { id: 'eX', x: 325, y: 110, label: 'Cl' }], bonds: [['eH', 'eX', 1]], lp: { eX: [45, 315, 0] }, charges: {}, ele: 'eH', lg: 'eX', lgBond: ['eH', 'eX'], kind: 'proton' },
  hbr: { name: 'HBr', atoms: [{ id: 'eH', x: 255, y: 110, label: 'H' }, { id: 'eX', x: 325, y: 110, label: 'Br' }], bonds: [['eH', 'eX', 1]], lp: { eX: [45, 315, 0] }, charges: {}, ele: 'eH', lg: 'eX', lgBond: ['eH', 'eX'], kind: 'proton' },
  ethyne: { name: 'ethyne', atoms: [{ id: 'eH', x: 235, y: 110, label: 'H' }, { id: 'eC1', x: 290, y: 110, label: 'C' }, { id: 'eC2', x: 360, y: 110, label: 'CH' }], bonds: [['eH', 'eC1', 1], ['eC1', 'eC2', 3]], lp: {}, charges: {}, ele: 'eH', lg: 'eC1', lgBond: ['eH', 'eC1'], kind: 'proton' },
  acetic: { name: 'acetic acid', atoms: [{ id: 'eMe', x: 225, y: 120, label: 'H3C' }, { id: 'eC', x: 285, y: 120, label: 'C' }, { id: 'eO1', x: 335, y: 80, label: 'O' }, { id: 'eO2', x: 335, y: 160, label: 'O' }, { id: 'eH', x: 388, y: 188, label: 'H' }], bonds: [['eMe', 'eC', 1], ['eC', 'eO1', 2], ['eC', 'eO2', 1], ['eO2', 'eH', 1]], lp: { eO1: [40, 110], eO2: [-20, 200] }, charges: {}, ele: 'eH', lg: 'eO2', lgBond: ['eH', 'eO2'], kind: 'proton' },
  water: { name: 'water', atoms: [{ id: 'eH', x: 255, y: 110, label: 'H' }, { id: 'eO', x: 315, y: 110, label: 'O' }, { id: 'eHb', x: 365, y: 140, label: 'H' }], bonds: [['eH', 'eO', 1], ['eO', 'eHb', 1]], lp: { eO: [90, 300] }, charges: {}, ele: 'eH', lg: 'eO', lgBond: ['eH', 'eO'], kind: 'proton' }
};
// Which nucleophile meets which electrophile. Curated so every scene is a real, clean elementary step.
export const COMBOS = {
  sn2: { nucs: ['hydroxide', 'methoxide', 'cyanide', 'hydrosulfide', 'iodide'], eles: ['bromomethane', 'chloromethane', 'iodomethane', 'bromoethane'], skip: [['iodide', 'iodomethane']], title: 'SN2', line: 'Attack the carbon, kick the halide off, attach.' },
  carbonyl: { nucs: ['hydride', 'cyanide', 'methyl'], eles: ['formaldehyde', 'acetaldehyde', 'acetone'], skip: [], title: 'Carbonyl addition', line: 'Attack the carbonyl carbon; the pi bond kicks up onto oxygen. Nothing leaves.' },
  proton: { pairs: [['hydroxide', 'hcl'], ['methoxide', 'hbr'], ['amide', 'ethyne'], ['hydroxide', 'acetic'], ['amide', 'water']], title: 'Proton transfer', line: 'Same move on a hydrogen: the base attacks H, the H-A bond kicks onto A.' },
  alkene: { pairs: [['ethene', 'hbr'], ['propene', 'hbr'], ['ethene', 'hcl']], title: 'Pi bond attacks', line: 'A pi bond is a nucleophile too: it grabs the H, and the other carbon is left with the plus.' }
};
const FAMILIES = ['sn2', 'carbonyl', 'proton', 'alkene'];
const EN = { F: 4.0, O: 3.4, Cl: 3.2, N: 3.0, Br: 3.0, I: 2.7, S: 2.6, C: 2.6, H: 2.2 };
function element(label){ const m = /^(H\d?)?([A-Z][a-z]?)/.exec(label.replace(/\d/g, '')); if (label === 'H') return 'H'; const s = label.replace(/^H\d*/, '').replace(/\d/g, ''); return s.startsWith('Cl') ? 'Cl' : s.startsWith('Br') ? 'Br' : s.charAt(0); }

// Assemble a scene: reactants, the two arrows, and the product COMPUTED by applying the arrows.
export function buildScene(family, nucId, eleId){
  const N = NUC[nucId], E = ELE[eleId];
  const atoms = N.atoms.concat(E.atoms).map(a => Object.assign({}, a));
  const bonds = N.bonds.concat(E.bonds).map(b => b.slice());
  const lp = {}; for (const k in N.lp) lp[k] = N.lp[k].slice(); for (const k in E.lp) lp[k] = E.lp[k].slice();
  const charges = Object.assign({}, N.charges, E.charges);
  const same = (b, x, y) => (b[0] === x && b[1] === y) || (b[0] === y && b[1] === x);
  const arrows = [];
  if (N.pi) arrows.push({ from: 'bond:' + N.pi[0] + '-' + N.pi[1], to: 'atom:' + E.ele, bend: -1, via: N.via, plusOn: N.plusOn });
  else arrows.push({ from: 'lp:' + N.nuc, to: 'atom:' + E.ele, bend: -1 });
  const lgDrawn = bonds.find(b => same(b, E.lgBond[0], E.lgBond[1]));
  arrows.push({ from: 'bond:' + lgDrawn[0] + '-' + lgDrawn[1], to: 'atom:' + E.lg, bend: E.kind === 'carbonyl' ? -1 : 1 });
  // ----- product -----
  const pAtoms = atoms.map(a => Object.assign({}, a)), pBonds = bonds.map(b => b.slice());
  const pLp = {}; for (const k in lp) pLp[k] = lp[k].slice();
  const pCharges = Object.assign({}, charges);
  const nucAtom = N.pi ? N.via : N.nuc;
  // attack: new sigma bond from the nucleophilic atom to the electrophilic atom
  pBonds.push([nucAtom, E.ele, 1]);
  if (N.pi){ const pb = pBonds.find(b => same(b, N.pi[0], N.pi[1])); pb[2] -= 1; pCharges[N.plusOn] = '+'; }
  else { pLp[nucAtom] = pLp[nucAtom].slice(1); delete pCharges[nucAtom]; }
  // kick it off: the leaving bond drops one order; the leaving atom keeps the pair
  const lgb = pBonds.find(b => same(b, E.lgBond[0], E.lgBond[1]));
  lgb[2] -= 1;
  if (lgb[2] === 0) pBonds.splice(pBonds.indexOf(lgb), 1);
  pCharges[E.lg] = '-';
  pLp[E.lg] = (pLp[E.lg] || []).concat([E.kind === 'carbonyl' ? 170 : 180]);
  // layout: slide the nucleophile group next to the electrophilic atom, and the leaving group away
  const nucIds = new Set(N.atoms.map(a => a.id));
  const eleAtom = atoms.find(a => a.id === E.ele), nucA = atoms.find(a => a.id === nucAtom);
  const off = E.kind === 'carbonyl' ? { x: -62, y: 30 } : E.kind === 'proton' ? { x: -64, y: 0 } : { x: -70, y: 0 };
  const dx = eleAtom.x + off.x - nucA.x, dy = eleAtom.y + off.y - nucA.y;
  for (const a of pAtoms) if (nucIds.has(a.id)){ a.x += dx; a.y += dy; }
  if (lgb[2] === 0){ const lgA = pAtoms.find(a => a.id === E.lg); lgA.x += 40; if (E.kind === 'proton' && E.lg !== 'eO') lgA.x += 0; }
  if (E.kind === 'proton' && lgb[2] === 0){
    // the whole acid fragment (minus its lost H) drifts right so the new B-H bond has room
    const acidIds = new Set(E.atoms.map(a => a.id)); acidIds.delete(E.ele);
    for (const a of pAtoms) if (acidIds.has(a.id)) a.x += 30;
  }
  const cap = E.kind === 'sn2' ? cap1(N.name) + ' attacks the carbon from the back, the C-' + E.atoms[E.atoms.length - 1].label + ' bond kicks off onto the halide, and the halide leaves with its pair.'
    : E.kind === 'carbonyl' ? cap1(N.name) + ' attacks the partial positive carbonyl carbon. The C=O pi bond kicks up onto oxygen, which becomes an alkoxide. Nothing leaves: the carbon had only three neighbors.'
    : E.kind === 'proton' ? cap1(N.name) + ' grabs the acidic H. The H-' + element(atoms.find(a => a.id === E.lg).label) + ' bond kicks onto ' + element(atoms.find(a => a.id === E.lg).label) + ', which keeps the pair. Same move, on a hydrogen.'
    : 'The pi bond is the nucleophile. It grabs the H of ' + E.name + ', the H-' + E.atoms[1].label + ' bond kicks onto the halide, and the other alkene carbon is left holding the plus.';
  return { family, nucId, eleId, react: { atoms, bonds, lp, charges }, product: { atoms: pAtoms, bonds: pBonds, lp: pLp, charges: pCharges }, arrows, nucAtom, eleAtom: E.ele, nucIds: [...nucIds], eleIds: E.atoms.map(a => a.id), caption: cap, kind: E.kind, nucName: N.name, eleName: E.name };
}
function cap1(s){ return s.charAt(0).toUpperCase() + s.slice(1); }
// mirror a scene left to right so the nucleophile is not always on the left
export function mirror(sc){
  const flipLabel = l => ({ H2C: 'CH2', CH2: 'H2C', H3C: 'CH3', CH3: 'H3C' })[l] || l;
  const m = g => ({ atoms: g.atoms.map(a => Object.assign({}, a, { x: 420 - a.x, label: flipLabel(a.label) })), bonds: g.bonds.map(b => b.slice()), lp: Object.fromEntries(Object.entries(g.lp).map(([k, v]) => [k, v.map(d => (180 - d + 360) % 360)])), charges: Object.assign({}, g.charges) });
  return Object.assign({}, sc, { react: m(sc.react), product: m(sc.product), arrows: sc.arrows.map(a => Object.assign({}, a, { bend: -a.bend })), mirrored: true });
}

// ---------- item generator (pure, node-safe) ----------
export function pickScene(rng, family){
  const fam = family || FAMILIES[Math.floor(rng() * FAMILIES.length)];
  const cfg = COMBOS[fam];
  let nuc, ele;
  if (cfg.pairs){ const p = cfg.pairs[Math.floor(rng() * cfg.pairs.length)]; nuc = p[0]; ele = p[1]; }
  else {
    for (let t = 0; t < 50; t++){ nuc = cfg.nucs[Math.floor(rng() * cfg.nucs.length)]; ele = cfg.eles[Math.floor(rng() * cfg.eles.length)]; if (!cfg.skip.some(s => s[0] === nuc && s[1] === ele)) break; }
  }
  return buildScene(fam, nuc, ele);
}
export function gen(rng){
  let sc = pickScene(rng);
  const flip = rng() < 0.5;
  if (flip) sc = mirror(sc);
  const type = rng() < 0.6 ? 'draw' : 'who';
  return { type, scene: sc, from: sc.arrows[0].from, to: sc.arrows[0].to, nucIds: sc.nucIds, eleIds: sc.eleIds };
}

function mulberry(seed){ let s = seed | 0; return function(){ s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const IMPLICIT_H = { H2C: 2, CH2: 2, CH: 1, H3C: 3, CH3: 3, C: 0, O: 0, N: 0, H: 0, S: 0, I: 0, Br: 0, Cl: 0, F: 0 };
function bondCount(g, id){ return g.bonds.filter(b => b[0] === id || b[1] === id).reduce((n, b) => n + b[2], 0); }
function netCharge(g){ return Object.values(g.charges).reduce((n, c) => n + (c === '+' ? 1 : -1), 0); }

export function selfTest(){
  let tried = 0; const fams = { sn2: 0, carbonyl: 0, proton: 0, alkene: 0 };
  const rng = mulberry(31);
  for (let i = 0; i < 400; i++){
    const it = gen(rng); tried++;
    const sc = it.scene; fams[sc.family]++;
    const R = sc.react, Pd = sc.product;
    const atom = (g, id) => g.atoms.find(a => a.id === id);
    // rich attacks poor: the source is a lone pair on a non-positive atom or a pi bond; the destination is the electrophilic atom
    const [kind, ref] = it.from.split(':');
    if (kind === 'lp'){
      if (!(R.lp[ref] && R.lp[ref].length)) return { ok: false, tried, notes: 'source lone pair not drawn' };
      if (R.charges[ref] === '+') return { ok: false, tried, notes: 'arrow starts at a plus' };
      if (!sc.nucIds.includes(ref)) return { ok: false, tried, notes: 'source not on the nucleophile' };
    } else {
      const [a, b] = ref.split('-');
      if (!R.bonds.some(x => x[0] === a && x[1] === b && x[2] >= 2)) return { ok: false, tried, notes: 'pi source is not a pi bond' };
    }
    const dest = it.to.split(':')[1];
    if (!sc.eleIds.includes(dest) || dest !== sc.eleAtom) return { ok: false, tried, notes: 'destination is not the electrophilic atom' };
    // the electrophilic atom is poor: a carbon bonded to something more electronegative, or an H on a heteroatom or sp carbon
    const dA = atom(R, dest), dEl = element(dA.label);
    const nb = R.bonds.filter(b => b[0] === dest || b[1] === dest).map(b => element(atom(R, b[0] === dest ? b[1] : b[0]).label));
    if (dEl === 'C' && !nb.some(e => EN[e] > EN.C)) return { ok: false, tried, notes: 'electrophilic carbon has no bully neighbor' };
    if (dEl === 'H' && !nb.some(e => EN[e] >= EN.C)) return { ok: false, tried, notes: 'acidic H on nothing' };
    // the product conserves charge and never overfills a carbon
    if (netCharge(Pd) !== netCharge(R)) return { ok: false, tried, notes: 'charge not conserved in ' + sc.family };
    for (const a of Pd.atoms){
      const el = element(a.label), n = bondCount(Pd, a.id) + (IMPLICIT_H[a.label] || 0);
      if (el === 'C' && n > 4) return { ok: false, tried, notes: 'product carbon with ' + n + ' bonds (' + sc.nucId + ' + ' + sc.eleId + ')' };
      if (el === 'H' && bondCount(Pd, a.id) > 1) return { ok: false, tried, notes: 'product H with two bonds' };
    }
    if (!Pd.bonds.some(b => (b[0] === sc.nucAtom && b[1] === sc.eleAtom) || (b[1] === sc.nucAtom && b[0] === sc.eleAtom))) return { ok: false, tried, notes: 'product lacks the new bond' };
    if (sc.kind !== 'carbonyl' && !(Pd.charges[sc.product.atoms.find(a => a.id === (ELE[sc.eleId].lg)).id] === '-')) return { ok: false, tried, notes: 'leaving group did not keep its pair' };
    if (it.type !== 'draw' && it.type !== 'who') return { ok: false, tried, notes: 'bad type' };
  }
  // every combo builds
  for (const f of FAMILIES){ const c = COMBOS[f]; const list = c.pairs ? c.pairs : c.nucs.flatMap(n => c.eles.filter(e => !c.skip.some(s => s[0] === n && s[1] === e)).map(e => [n, e])); for (const [n, e] of list) buildScene(f, n, e); }
  const a = gen(mulberry(6)), b = gen(mulberry(6));
  if (JSON.stringify(a) !== JSON.stringify(b)) return { ok: false, tried, notes: 'not reproducible' };
  return { ok: true, tried, notes: 'sn2 ' + fams.sn2 + ', carbonyl ' + fams.carbonyl + ', proton ' + fams.proton + ', pi ' + fams.alkene };
}

// ---------- drawing ----------
let uid = 0;
function labelRadius(label){ return label === '' ? 0 : label.length === 1 ? 13 : label.length === 2 ? 18 : 24; }
function labelText(api, x, y, label, fill, size){
  const t = api.svg('text', { x, y: y + size * 0.36, 'text-anchor': 'middle', 'font-family': 'Georgia, serif', 'font-size': String(size), fill });
  for (const r of label.match(/[A-Za-z]+|\d+/g) || []){
    if (/\d/.test(r)) t.append(api.svg('tspan', { dy: String(size * 0.28), 'font-size': String(size * 0.7), text: r }), api.svg('tspan', { dy: String(-size * 0.28), text: '' }));
    else t.append(api.svg('tspan', { text: r }));
  }
  return t;
}
function badge(api, cx, cy, sign, col, S){
  const { svg } = api, R = 7 * S, g = svg('g', {});
  g.append(svg('circle', { cx, cy, r: R, fill: 'none', stroke: col, 'stroke-width': String(1.6 * S) }));
  g.append(svg('line', { x1: cx - R * 0.55, y1: cy, x2: cx + R * 0.55, y2: cy, stroke: col, 'stroke-width': String(1.8 * S), 'stroke-linecap': 'round' }));
  if (sign === '+') g.append(svg('line', { x1: cx, y1: cy - R * 0.55, x2: cx, y2: cy + R * 0.55, stroke: col, 'stroke-width': String(1.8 * S), 'stroke-linecap': 'round' }));
  return g;
}
// Draw a graph. Returns the group plus geometry lookups (atom centers, bond midpoints, lone pair points) and hit shapes.
function drawGraph(api, g0, opts){
  const { svg } = api, C = api.colors;
  const S = opts.scale || 1, ox = opts.ox || 0, oy = opts.oy || 0, size = 20 * S;
  const g = svg('g', {}), hits = [];
  const pos = {}; for (const a of g0.atoms) pos[a.id] = a;
  const P = a => ({ x: ox + a.x * S, y: oy + a.y * S });
  const mids = {}, lpPts = {}, centers = {};
  for (const [ai, bi, order] of g0.bonds){
    const a = pos[ai], b = pos[bi], pa = P(a), pb = P(b);
    const dx = pb.x - pa.x, dy = pb.y - pa.y, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
    const ra = labelRadius(a.label) * S, rb = labelRadius(b.label) * S;
    const x1 = pa.x + ux * ra, y1 = pa.y + uy * ra, x2 = pb.x - ux * rb, y2 = pb.y - uy * rb;
    mids[ai + '-' + bi] = { x: (x1 + x2) / 2, y: (y1 + y2) / 2 };
    const line = off => svg('line', { x1: x1 - uy * off, y1: y1 + ux * off, x2: x2 - uy * off, y2: y2 + ux * off, stroke: C.ink2, 'stroke-width': String(2.4 * S), 'stroke-linecap': 'round' });
    if (order === 1) g.append(line(0)); else if (order === 2) g.append(line(4.2 * S), line(-4.2 * S)); else g.append(line(0), line(5 * S), line(-5 * S));
    hits.push({ ref: 'bond:' + ai + '-' + bi, shape: svg('line', { x1, y1, x2, y2, stroke: 'transparent', 'stroke-width': String(22 * S), 'stroke-linecap': 'round' }) });
  }
  for (const a of g0.atoms){
    const p = P(a); centers[a.id] = p;
    const ch = g0.charges[a.id];
    const isNuc = opts.nucIds && opts.nucIds.includes(a.id) && opts.tint;
    g.append(labelText(api, p.x, p.y, a.label, ch === '+' ? C.coral : ch === '-' ? C.blue : isNuc ? C.ink : C.ink, size));
    const r = labelRadius(a.label) * S;
    const lps = g0.lp[a.id] || [];
    lps.forEach((deg, k) => {
      const t = deg * Math.PI / 180, d = r + 8 * S;
      const cx = p.x + Math.cos(t) * d, cy = p.y - Math.sin(t) * d, px = -Math.sin(t) * 3.4 * S, py = -Math.cos(t) * 3.4 * S;
      g.append(svg('circle', { cx: cx + px, cy: cy + py, r: 2.2 * S, fill: C.blue }), svg('circle', { cx: cx - px, cy: cy - py, r: 2.2 * S, fill: C.blue }));
      if (k === 0) lpPts[a.id] = { x: cx, y: cy };
      hits.push({ ref: 'lp:' + a.id, shape: svg('circle', { cx, cy, r: 13 * S, fill: 'transparent' }) });
    });
    if (ch){
      const taken = lps.slice();
      for (const [ai, bi] of g0.bonds){ const o = ai === a.id ? pos[bi] : bi === a.id ? pos[ai] : null; if (o) taken.push(Math.atan2(-(o.y - a.y), o.x - a.x) * 180 / Math.PI); }
      const gapTo = deg => taken.reduce((m, t) => Math.min(m, Math.abs(((deg - t) % 360 + 540) % 360 - 180)), 999);
      let deg = 50, best = -1; for (const c of [50, 130, -50, 230, 90, 0, 180, 270]){ const q = gapTo(c); if (q > best){ best = q; deg = c; } }
      const t = deg * Math.PI / 180, d = r + 13 * S;
      g.append(badge(api, p.x + Math.cos(t) * d, p.y - Math.sin(t) * d, ch, ch === '+' ? C.coral : C.blue, S));
    }
    hits.push({ ref: 'atom:' + a.id, shape: svg('circle', { cx: p.x, cy: p.y, r: Math.max(16 * S, r + 4), fill: 'transparent' }) });
  }
  const point = ref => { const [k, key] = ref.split(':'); if (k === 'lp') return lpPts[key]; if (k === 'atom') return centers[key]; return mids[key] || mids[key.split('-').reverse().join('-')]; };
  return { g, point, hits, centers, S };
}
function curvedArrow(api, from, to, bend, markerId, S){
  const dx = to.x - from.x, dy = to.y - from.y, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
  const fx = from.x + dx / L * 4 * S, fy = from.y + dy / L * 4 * S, tx = to.x - dx / L * 14 * S, ty = to.y - dy / L * 14 * S;
  const cx = (fx + tx) / 2 + nx * bend * Math.max(24 * S, L * 0.35), cy = (fy + ty) / 2 + ny * bend * Math.max(24 * S, L * 0.35);
  return api.svg('path', { d: 'M' + fx.toFixed(1) + ' ' + fy.toFixed(1) + ' Q' + cx.toFixed(1) + ' ' + cy.toFixed(1) + ' ' + tx.toFixed(1) + ' ' + ty.toFixed(1), fill: 'none', stroke: api.colors.goldhi, 'stroke-width': String(2.6 * S), 'stroke-linecap': 'round', 'marker-end': 'url(#' + markerId + ')' });
}
function markerDefs(api, id, color){ return api.svg('defs', {}, api.svg('marker', { id, viewBox: '0 0 10 10', refX: '8', refY: '5', markerWidth: '6', markerHeight: '6', orient: 'auto' }, api.svg('path', { d: 'M0 0 L10 5 L0 10 z', fill: color }))); }

export function mount(slots, api){
  const { el, svg } = api, C = api.colors;

  // ---------- VISUAL ----------
  const VIS = { sn2: buildScene('sn2', 'hydroxide', 'bromomethane'), carbonyl: buildScene('carbonyl', 'cyanide', 'acetone'), proton: buildScene('proton', 'hydroxide', 'hcl'), alkene: buildScene('alkene', 'propene', 'hbr') };
  let fam = 'sn2', showing = 'react', busy = false, cur = null;
  const W = 800, H = 300, S = 1.6;
  const stage = el('div', {});
  const caption = el('p', { style: { margin: '10px 0 0', color: C.ink2, fontSize: '15px', minHeight: '3.6em' }, text: '' });
  function frame(){
    const sc = VIS[fam], id = 'arr' + (++uid);
    const root = svg('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': COMBOS[fam].title + ': ' + sc.nucName + ' and ' + sc.eleName });
    root.append(markerDefs(api, id + 'h', C.goldhi));
    const gph = showing === 'react' ? sc.react : sc.product;
    const ys = gph.atoms.map(a => a.y), cy = (Math.min(...ys) + Math.max(...ys)) / 2;
    const xs = gph.atoms.map(a => a.x), cx = (Math.min(...xs) + Math.max(...xs)) / 2;
    const m = drawGraph(api, gph, { scale: S, ox: W / 2 - cx * S, oy: H / 2 - cy * S + 6 });
    root.append(m.g);
    const arrows = svg('g', { opacity: '0' });
    if (showing === 'react') for (const ar of sc.arrows) arrows.append(curvedArrow(api, m.point(ar.from), m.point(ar.to), ar.bend, id + 'h', S));
    root.append(arrows);
    root.append(svg('text', { x: 16, y: 24, 'font-family': 'ui-monospace, Menlo, monospace', 'font-size': '12', fill: C.ink3, text: (showing === 'react' ? 'REACTANTS' : 'PRODUCT') + ' · ' + COMBOS[fam].title.toUpperCase() }));
    root.append(svg('text', { x: W - 16, y: 24, 'text-anchor': 'end', 'font-family': 'Georgia, serif', 'font-size': '16', fill: C.ink2, text: sc.nucName.split(' (')[0] + ' + ' + sc.eleName }));
    return { root, arrows, mol: m.g };
  }
  function render(){ stage.replaceChildren(); cur = frame(); stage.append(cur.root); pushBtn.textContent = showing === 'react' ? 'Push' : 'Back to the start'; }
  function push(){
    if (busy) return;
    if (showing === 'product'){ showing = 'react'; render(); caption.textContent = COMBOS[fam].line; return; }
    busy = true;
    const D = api.reduced ? 0 : 1;
    const paths = [...cur.arrows.querySelectorAll('path')];
    const lens = paths.map(p => { try { return p.getTotalLength(); } catch (e){ return 200; } });
    paths.forEach((p, i) => { p.style.transition = 'none'; p.setAttribute('stroke-dasharray', String(lens[i])); p.style.strokeDashoffset = String(lens[i]); });
    cur.arrows.setAttribute('opacity', '1');
    void cur.root.getBoundingClientRect();
    paths.forEach((p, i) => { p.style.transition = 'stroke-dashoffset ' + (650 * D) + 'ms ease-out ' + (i * 450 * D) + 'ms'; p.style.strokeDashoffset = '0'; });
    caption.textContent = 'Attack (first gold arrow), then kick it off (second). Electrons move, atoms stay put.';
    setTimeout(() => {
      cur.mol.style.transition = 'opacity ' + (260 * D) + 'ms'; cur.arrows.style.transition = 'opacity ' + (260 * D) + 'ms';
      cur.mol.style.opacity = '0'; cur.arrows.style.opacity = '0';
      setTimeout(() => {
        showing = 'product'; render();
        cur.mol.style.opacity = '0'; void cur.root.getBoundingClientRect();
        cur.mol.style.transition = 'opacity ' + (300 * D) + 'ms'; cur.mol.style.opacity = '1';
        setTimeout(() => { busy = false; caption.textContent = 'Attach. ' + VIS[fam].caption; }, 300 * D + 20);
      }, 260 * D + 20);
    }, (650 + 450 + 500) * D);
  }
  const pushBtn = el('button', { class: 'primary', type: 'button', text: 'Push', onClick: push });
  const chips = el('div', { class: 'controls', role: 'group', 'aria-label': 'Pick a scene' });
  const chipEls = FAMILIES.map(f => el('button', { class: 'chip', type: 'button', 'aria-pressed': f === fam ? 'true' : 'false', text: COMBOS[f].title, onClick: () => { if (busy) return; fam = f; showing = 'react'; chipEls.forEach(c => c.setAttribute('aria-pressed', c.textContent === COMBOS[f].title ? 'true' : 'false')); render(); caption.textContent = COMBOS[f].line; } }));
  chips.append(...chipEls);
  slots.visual.append(stage, el('div', { class: 'controls' }, pushBtn), caption, chips);
  render(); caption.textContent = COMBOS[fam].line;

  // ---------- YOU TRY ----------
  let item = null, firstTry = true, done = false;
  const tryBox = el('div', { class: 'item' });
  slots.try.append(tryBox);
  function verdictGood(){ tryBox.append(el('div', { class: 'verdict good', text: 'You can read it.' }), el('div', { class: 'controls' }, el('button', { class: 'primary', type: 'button', text: 'Another one', onClick: next }))); }
  function commit(ok, coachText){
    if (done) return;
    if (ok){ done = true; api.report(firstTry); api.clearCoach(); verdictGood(); }
    else { if (firstTry) api.report(false); firstTry = false; if (!tryBox.querySelector('.verdict')) tryBox.append(el('div', { class: 'verdict notyet', text: 'Not yet.' })); api.coach(coachText); }
  }
  function sceneSvg(sc, opts){
    const id = 'arri' + (++uid);
    const s = svg('svg', { viewBox: '0 0 700 250', width: '100%', style: { display: 'block' }, role: 'img', 'aria-label': sc.nucName + ' and ' + sc.eleName });
    s.append(markerDefs(api, id + 'h', C.goldhi));
    const g = sc.react, ys = g.atoms.map(a => a.y), xs = g.atoms.map(a => a.x);
    const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cy = (Math.min(...ys) + Math.max(...ys)) / 2, sc2 = 1.35;
    const m = drawGraph(api, g, { scale: sc2, ox: 350 - cx * sc2, oy: 125 - cy * sc2 });
    s.append(m.g);
    return { svg: s, m, id, S: sc2 };
  }
  function makeHit(h, label, onChoose){
    const g = svg('g', { role: 'button', tabindex: '0', 'aria-label': label, style: { cursor: 'pointer' } });
    g.append(h.shape);
    const choose = () => onChoose(h.ref, g);
    g.addEventListener('click', choose);
    g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); choose(); } });
    return g;
  }
  function refLabel(ref, sc){
    const [k, key] = ref.split(':');
    const name = id => { const a = sc.react.atoms.find(x => x.id === id); return a ? a.label.replace(/\d/g, '') : id; };
    if (k === 'lp') return 'lone pair on ' + name(key);
    if (k === 'atom') return name(key) + ' atom';
    const [a, b] = key.split('-'); return name(a) + '-' + name(b) + ' bond';
  }
  function renderDraw(it){
    const sc = it.scene;
    const prompt = el('p', { class: 'prompt', text: 'Draw the attack arrow. First tap where the electrons START (a lone pair, a pi bond).' });
    tryBox.append(prompt);
    const { svg: s, m, id, S } = sceneSvg(sc);
    const hitLayer = svg('g', {});
    const marks = svg('g', {});
    s.append(marks, hitLayer);
    let step = 0, src = null;
    const reset = () => { step = 0; src = null; marks.replaceChildren(); prompt.textContent = 'Try the same one again. Tap where the electrons START.'; };
    const onChoose = (ref) => {
      if (done) return;
      const p = m.point(ref);
      if (step === 0){
        const [k] = ref.split(':');
        if (k === 'atom'){ commit(false, 'The arrow starts at electrons, not at an atom: a lone pair or a pi bond. Rich attacks poor.'); return; }
        src = ref; step = 1;
        marks.append(svg('circle', { cx: p.x, cy: p.y, r: 10, fill: 'none', stroke: C.goldhi, 'stroke-width': '2' }));
        prompt.textContent = 'Now tap where they GO: the electron-poor atom.';
        return;
      }
      const [k2] = ref.split(':');
      if (k2 !== 'atom'){ commit(false, 'The arrow ends on an atom, the electron-poor one. Find the partial positive carbon or the acidic H.'); reset(); return; }
      const normalize = r => { const [kk, key] = r.split(':'); if (kk !== 'bond') return r; const [a, b] = key.split('-'); return sc.react.bonds.some(x => x[0] === a && x[1] === b) ? r : 'bond:' + b + '-' + a; };
      const okSrc = normalize(src) === it.from, okDst = ref === it.to;
      const path = curvedArrow(api, m.point(src), p, sc.arrows[0].bend, id + 'h', S);
      marks.append(path);
      if (okSrc && okDst){ hitLayer.replaceChildren(); commit(true); return; }
      if (!okSrc){
        const srcKind = src.split(':')[0];
        commit(false, srcKind === 'bond' && !sc.react.bonds.some(b => 'bond:' + b[0] + '-' + b[1] === normalize(src) && b[2] >= 2)
          ? 'That is a sigma bond, and sigma electrons do not attack. Start at the ' + refLabel(it.from, sc) + ': that is the nucleophile, the electron-rich one.'
          : 'The arrow starts where the electrons that ATTACK are: on the nucleophile. Here that is the ' + refLabel(it.from, sc) + '. Rich attacks poor.');
      } else commit(false, 'Rich attacks poor. The arrow ends on the electron-poor atom: here the ' + refLabel(it.to, sc) + ', the one left short by its neighbor.');
      reset();
    };
    for (const h of m.hits) hitLayer.append(makeHit(h, refLabel(h.ref, sc), onChoose));
    tryBox.append(el('div', { style: { maxWidth: '640px', margin: '0 auto' } }, s));
    tryBox.append(el('div', { style: { textAlign: 'center', fontFamily: 'Georgia, serif', fontSize: '14px', color: C.ink2 }, text: sc.nucName.split(' (')[0] + ' and ' + sc.eleName }));
  }
  function renderWho(it){
    const sc = it.scene;
    tryBox.append(el('p', { class: 'prompt', text: 'Which one is the nucleophile? Tap it.' }));
    const { svg: s, m } = sceneSvg(sc);
    const layer = svg('g', {}); s.append(layer);
    const groups = [{ ids: sc.nucIds, ok: true, name: sc.nucName }, { ids: sc.eleIds, ok: false, name: sc.eleName }];
    for (const grp of groups){
      const pts = grp.ids.map(id => m.centers[id]);
      const x0 = Math.min(...pts.map(p => p.x)) - 36, x1 = Math.max(...pts.map(p => p.x)) + 36, y0 = Math.min(...pts.map(p => p.y)) - 36, y1 = Math.max(...pts.map(p => p.y)) + 36;
      const g = svg('g', { role: 'button', tabindex: '0', 'aria-label': grp.name, style: { cursor: 'pointer' } });
      const rect = svg('rect', { x: x0, y: y0, width: x1 - x0, height: y1 - y0, rx: 12, fill: 'transparent', stroke: C.gold, 'stroke-width': '1.2', 'stroke-dasharray': '4 5', opacity: '0.6' });
      g.append(rect);
      const choose = () => {
        if (done) return;
        if (grp.ok){ rect.setAttribute('stroke', C.blue); rect.setAttribute('opacity', '1'); rect.setAttribute('stroke-dasharray', 'none'); rect.setAttribute('stroke-width', '2'); commit(true); }
        else { rect.setAttribute('stroke', C.coral); commit(false, 'The nucleophile is the electron-rich one: a lone pair, a pi bond, or a minus, with electrons to give. ' + cap1(sc.nucName.split(' (')[0]) + ' has them; ' + sc.eleName + ' is the poor one being attacked.'); }
      };
      g.addEventListener('click', choose);
      g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); choose(); } });
      layer.append(g);
    }
    tryBox.append(el('div', { style: { maxWidth: '640px', margin: '0 auto' } }, s));
  }
  function next(){
    tryBox.replaceChildren(); api.clearCoach();
    item = gen(api.rng); firstTry = true; done = false;
    if (item.type === 'draw') renderDraw(item); else renderWho(item);
  }
  next();
}
