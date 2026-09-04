// The Roots of Organic, Level 2, Root 5: Judge the base, not the acid.
// Acidity by CARDIO: Charge, Atom, Resonance, Dipole induction, Orbital. No imports (contract).

export const meta = {
  id: 'l2-acidity',
  level: 2,
  order: 5,
  needs3D: false,
  title: 'Judge the base, not the acid',
  concept: 'Acidity and CARDIO',
  tagline: 'Strip the proton, look at what is left, run CARDIO top to bottom.',
  story: 'Acidity is not about the proton. It is about how comfortable the leftover electrons are after the proton leaves. So judge the conjugate base, always. Strip the H off both acids, look at the two bases, and run CARDIO top to bottom: Charge, Atom, Resonance, Dipole induction, Orbital. Stop at the first line that separates them, that line decides. Charge: a positive acid is stronger. Atom: across a row the more electronegative atom wins, down a column the bigger atom wins, so H-I beats H-F. Resonance: spread the charge over roommates. Induction: a nearby vacuum thins the charge. Orbital: more s-character hugs the nucleus tighter, sp beats sp2 beats sp3, which is why NaNH2 can rip the proton off a terminal alkyne. Rule of thumb: the happier the base, the stronger the acid.',
  moveName: 'Strip the proton, then run CARDIO',
  move: [
    'Take the acidic H off both acids. You are now comparing the two conjugate bases.',
    'Charge: is one base neutral while the other is negative? A positive acid wins.',
    'Atom: which atom holds the leftover pair? Across a row, more electronegative wins; down a column, bigger wins.',
    'Resonance, then Dipole induction, then Orbital: stop at the first line that separates them.',
    'That line decides. The more comfortable base belongs to the stronger acid.'
  ],
  trap: 'Careful: down a column size beats electronegativity, so H-I is a stronger acid than H-F even though F pulls harder.',
  holdsUp: ['Every acid-base ranking', 'Which base deprotonates what', 'Enolate formation', 'Grignard incompatibility'],
  drill: 'Booster OChem: Acids and Bases'
};


// ---------- species ----------
// Each species: a drawing (atoms in a 300 by 210 frame, bonds [a, b, order]), the acidic H (acidH), the atom that
// keeps the pair (site), and the CARDIO features: charge of the acid, site element, resonance class
// (0 none, 1 into carbons, 2 onto oxygens), induction score, s-character of the site orbital. pKa is the hand check.
const ROW = { C: 2, N: 2, O: 2, F: 2, S: 3, Cl: 3, Br: 4, I: 5 };
const COL = { C: 14, N: 15, O: 16, F: 17, S: 16, Cl: 17, Br: 17, I: 17 };
const EN = { C: 2.6, N: 3.0, O: 3.4, F: 4.0 };
const ORB_NAME = { 25: 'sp3 (25 percent s)', 33: 'sp2 (33 percent s)', 50: 'sp (50 percent s)' };

function ringAtoms(cx, cy, R){ const a = []; for (let k = 0; k < 6; k++){ const t = (k * 60) * Math.PI / 180; a.push({ id: 'R' + k, x: +(cx + R * Math.cos(t)).toFixed(1), y: +(cy - R * Math.sin(t)).toFixed(1), label: '' }); } return a; }
function ringBonds(arom){ const b = []; for (let k = 0; k < 6; k++) b.push(['R' + k, 'R' + ((k + 1) % 6), arom && k % 2 === 0 ? 2 : 1]); return b; }

export const SPECIES = {
  water: { name: 'water', charge: 0, atom: 'O', res: 0, ind: 0, orb: 25, pKa: 15.7,
    atoms: [{ id: 'O', x: 150, y: 105, label: 'O' }, { id: 'Ha', x: 95, y: 140, label: 'H' }, { id: 'Hb', x: 205, y: 140, label: 'H' }], bonds: [['O', 'Ha', 1], ['O', 'Hb', 1]], acidH: 'Ha', site: 'O' },
  hydronium: { name: 'hydronium', charge: 1, atom: 'O', res: 0, ind: 0, orb: 25, pKa: -1.7,
    atoms: [{ id: 'O', x: 150, y: 110, label: 'O' }, { id: 'Ha', x: 95, y: 145, label: 'H' }, { id: 'Hb', x: 205, y: 145, label: 'H' }, { id: 'Hc', x: 150, y: 48, label: 'H' }], bonds: [['O', 'Ha', 1], ['O', 'Hb', 1], ['O', 'Hc', 1]], acidH: 'Ha', site: 'O' },
  ammonia: { name: 'ammonia', charge: 0, atom: 'N', res: 0, ind: 0, orb: 25, pKa: 38,
    atoms: [{ id: 'N', x: 150, y: 110, label: 'N' }, { id: 'Ha', x: 95, y: 145, label: 'H' }, { id: 'Hb', x: 205, y: 145, label: 'H' }, { id: 'Hc', x: 150, y: 48, label: 'H' }], bonds: [['N', 'Ha', 1], ['N', 'Hb', 1], ['N', 'Hc', 1]], acidH: 'Ha', site: 'N' },
  ammonium: { name: 'ammonium', charge: 1, atom: 'N', res: 0, ind: 0, orb: 25, pKa: 9.2,
    atoms: [{ id: 'N', x: 150, y: 110, label: 'N' }, { id: 'Ha', x: 92, y: 110, label: 'H' }, { id: 'Hb', x: 208, y: 110, label: 'H' }, { id: 'Hc', x: 150, y: 48, label: 'H' }, { id: 'Hd', x: 150, y: 172, label: 'H' }], bonds: [['N', 'Ha', 1], ['N', 'Hb', 1], ['N', 'Hc', 1], ['N', 'Hd', 1]], acidH: 'Ha', site: 'N' },
  methylamine: { name: 'methylamine', charge: 0, atom: 'N', res: 0, ind: 0, orb: 25, pKa: 40,
    atoms: [{ id: 'Me', x: 75, y: 110, label: 'H3C' }, { id: 'N', x: 160, y: 110, label: 'N' }, { id: 'Ha', x: 215, y: 148, label: 'H' }, { id: 'Hb', x: 215, y: 72, label: 'H' }], bonds: [['Me', 'N', 1], ['N', 'Ha', 1], ['N', 'Hb', 1]], acidH: 'Ha', site: 'N' },
  methylammonium: { name: 'methylammonium', charge: 1, atom: 'N', res: 0, ind: 0, orb: 25, pKa: 10.6,
    atoms: [{ id: 'Me', x: 65, y: 110, label: 'H3C' }, { id: 'N', x: 150, y: 110, label: 'N' }, { id: 'Ha', x: 205, y: 148, label: 'H' }, { id: 'Hb', x: 205, y: 72, label: 'H' }, { id: 'Hc', x: 150, y: 48, label: 'H' }], bonds: [['Me', 'N', 1], ['N', 'Ha', 1], ['N', 'Hb', 1], ['N', 'Hc', 1]], acidH: 'Ha', site: 'N' },
  h2s: { name: 'hydrogen sulfide', charge: 0, atom: 'S', res: 0, ind: 0, orb: 25, pKa: 7.0,
    atoms: [{ id: 'S', x: 150, y: 105, label: 'S' }, { id: 'Ha', x: 95, y: 140, label: 'H' }, { id: 'Hb', x: 205, y: 140, label: 'H' }], bonds: [['S', 'Ha', 1], ['S', 'Hb', 1]], acidH: 'Ha', site: 'S' },
  hf: { name: 'HF', charge: 0, atom: 'F', res: 0, ind: 0, orb: 25, pKa: 3.2, atoms: [{ id: 'F', x: 125, y: 110, label: 'F' }, { id: 'Ha', x: 190, y: 110, label: 'H' }], bonds: [['F', 'Ha', 1]], acidH: 'Ha', site: 'F' },
  hcl: { name: 'HCl', charge: 0, atom: 'Cl', res: 0, ind: 0, orb: 25, pKa: -7, atoms: [{ id: 'X', x: 120, y: 110, label: 'Cl' }, { id: 'Ha', x: 195, y: 110, label: 'H' }], bonds: [['X', 'Ha', 1]], acidH: 'Ha', site: 'X' },
  hbr: { name: 'HBr', charge: 0, atom: 'Br', res: 0, ind: 0, orb: 25, pKa: -9, atoms: [{ id: 'X', x: 120, y: 110, label: 'Br' }, { id: 'Ha', x: 195, y: 110, label: 'H' }], bonds: [['X', 'Ha', 1]], acidH: 'Ha', site: 'X' },
  hi: { name: 'HI', charge: 0, atom: 'I', res: 0, ind: 0, orb: 25, pKa: -10, atoms: [{ id: 'X', x: 125, y: 110, label: 'I' }, { id: 'Ha', x: 190, y: 110, label: 'H' }], bonds: [['X', 'Ha', 1]], acidH: 'Ha', site: 'X' },
  methane: { name: 'methane', charge: 0, atom: 'C', res: 0, ind: 0, orb: 25, pKa: 50, atoms: [{ id: 'C', x: 120, y: 110, label: 'H3C' }, { id: 'Ha', x: 200, y: 110, label: 'H' }], bonds: [['C', 'Ha', 1]], acidH: 'Ha', site: 'C' },
  acetic: { name: 'acetic acid', charge: 0, atom: 'O', res: 2, ind: 0, orb: 25, pKa: 4.76,
    atoms: [{ id: 'Me', x: 55, y: 120, label: 'H3C' }, { id: 'C', x: 125, y: 120, label: 'C' }, { id: 'O1', x: 180, y: 78, label: 'O' }, { id: 'O2', x: 180, y: 162, label: 'O' }, { id: 'Ha', x: 238, y: 190, label: 'H' }], bonds: [['Me', 'C', 1], ['C', 'O1', 2], ['C', 'O2', 1], ['O2', 'Ha', 1]], acidH: 'Ha', site: 'O2' },
  ethanol: { name: 'ethanol', charge: 0, atom: 'O', res: 0, ind: 0, orb: 25, pKa: 15.9,
    atoms: [{ id: 'Me', x: 45, y: 110, label: 'H3C' }, { id: 'C2', x: 120, y: 110, label: 'CH2' }, { id: 'O', x: 190, y: 110, label: 'O' }, { id: 'Ha', x: 245, y: 110, label: 'H' }], bonds: [['Me', 'C2', 1], ['C2', 'O', 1], ['O', 'Ha', 1]], acidH: 'Ha', site: 'O' },
  methanol: { name: 'methanol', charge: 0, atom: 'O', res: 0, ind: 0, orb: 25, pKa: 15.5,
    atoms: [{ id: 'Me', x: 85, y: 110, label: 'H3C' }, { id: 'O', x: 160, y: 110, label: 'O' }, { id: 'Ha', x: 215, y: 110, label: 'H' }], bonds: [['Me', 'O', 1], ['O', 'Ha', 1]], acidH: 'Ha', site: 'O' },
  phenol: { name: 'phenol', charge: 0, atom: 'O', res: 1, ind: 0, orb: 25, pKa: 10.0,
    atoms: ringAtoms(95, 110, 42).concat([{ id: 'O', x: 185, y: 110, label: 'O' }, { id: 'Ha', x: 235, y: 78, label: 'H' }]), bonds: ringBonds(true).concat([['R0', 'O', 1], ['O', 'Ha', 1]]), ringCenter: [95, 110], acidH: 'Ha', site: 'O' },
  cyclohexanol: { name: 'cyclohexanol', charge: 0, atom: 'O', res: 0, ind: 0, orb: 25, pKa: 16,
    atoms: ringAtoms(95, 110, 42).concat([{ id: 'O', x: 185, y: 110, label: 'O' }, { id: 'Ha', x: 235, y: 78, label: 'H' }]), bonds: ringBonds(false).concat([['R0', 'O', 1], ['O', 'Ha', 1]]), ringCenter: [95, 110], acidH: 'Ha', site: 'O' },
  fluoroacetic: { name: 'fluoroacetic acid', charge: 0, atom: 'O', res: 2, ind: 1.0, orb: 25, pKa: 2.66,
    atoms: [{ id: 'X', x: 35, y: 160, label: 'F' }, { id: 'Ca', x: 85, y: 120, label: 'CH2' }, { id: 'C', x: 150, y: 120, label: 'C' }, { id: 'O1', x: 205, y: 78, label: 'O' }, { id: 'O2', x: 205, y: 162, label: 'O' }, { id: 'Ha', x: 262, y: 190, label: 'H' }], bonds: [['X', 'Ca', 1], ['Ca', 'C', 1], ['C', 'O1', 2], ['C', 'O2', 1], ['O2', 'Ha', 1]], acidH: 'Ha', site: 'O2' },
  chloroacetic: { name: 'chloroacetic acid', charge: 0, atom: 'O', res: 2, ind: 0.8, orb: 25, pKa: 2.86,
    atoms: [{ id: 'X', x: 32, y: 160, label: 'Cl' }, { id: 'Ca', x: 85, y: 120, label: 'CH2' }, { id: 'C', x: 150, y: 120, label: 'C' }, { id: 'O1', x: 205, y: 78, label: 'O' }, { id: 'O2', x: 205, y: 162, label: 'O' }, { id: 'Ha', x: 262, y: 190, label: 'H' }], bonds: [['X', 'Ca', 1], ['Ca', 'C', 1], ['C', 'O1', 2], ['C', 'O2', 1], ['O2', 'Ha', 1]], acidH: 'Ha', site: 'O2' },
  trichloroacetic: { name: 'trichloroacetic acid', charge: 0, atom: 'O', res: 2, ind: 2.4, orb: 25, pKa: 0.66,
    atoms: [{ id: 'Ca', x: 60, y: 120, label: 'Cl3C' }, { id: 'C', x: 140, y: 120, label: 'C' }, { id: 'O1', x: 195, y: 78, label: 'O' }, { id: 'O2', x: 195, y: 162, label: 'O' }, { id: 'Ha', x: 252, y: 190, label: 'H' }], bonds: [['Ca', 'C', 1], ['C', 'O1', 2], ['C', 'O2', 1], ['O2', 'Ha', 1]], acidH: 'Ha', site: 'O2' },
  trifluoroethanol: { name: 'trifluoroethanol', charge: 0, atom: 'O', res: 0, ind: 1.2, orb: 25, pKa: 12.4,
    atoms: [{ id: 'CF', x: 40, y: 110, label: 'F3C' }, { id: 'C2', x: 118, y: 110, label: 'CH2' }, { id: 'O', x: 188, y: 110, label: 'O' }, { id: 'Ha', x: 243, y: 110, label: 'H' }], bonds: [['CF', 'C2', 1], ['C2', 'O', 1], ['O', 'Ha', 1]], acidH: 'Ha', site: 'O' },
  ethyne: { name: 'ethyne', charge: 0, atom: 'C', res: 0, ind: 0, orb: 50, pKa: 25,
    atoms: [{ id: 'Hb', x: 45, y: 110, label: 'H' }, { id: 'C1', x: 105, y: 110, label: 'C' }, { id: 'C2', x: 180, y: 110, label: 'C' }, { id: 'Ha', x: 240, y: 110, label: 'H' }], bonds: [['Hb', 'C1', 1], ['C1', 'C2', 3], ['C2', 'Ha', 1]], acidH: 'Ha', site: 'C2' },
  ethene: { name: 'ethene', charge: 0, atom: 'C', res: 0, ind: 0, orb: 33, pKa: 44,
    atoms: [{ id: 'C1', x: 75, y: 115, label: 'H2C' }, { id: 'C2', x: 160, y: 115, label: 'CH' }, { id: 'Ha', x: 212, y: 78, label: 'H' }], bonds: [['C1', 'C2', 2], ['C2', 'Ha', 1]], acidH: 'Ha', site: 'C2' },
  ethane: { name: 'ethane', charge: 0, atom: 'C', res: 0, ind: 0, orb: 25, pKa: 50,
    atoms: [{ id: 'C1', x: 75, y: 110, label: 'H3C' }, { id: 'C2', x: 150, y: 110, label: 'CH2' }, { id: 'Ha', x: 212, y: 110, label: 'H' }], bonds: [['C1', 'C2', 1], ['C2', 'Ha', 1]], acidH: 'Ha', site: 'C2' },
  ethanethiol: { name: 'ethanethiol', charge: 0, atom: 'S', res: 0, ind: 0, orb: 25, pKa: 10.6,
    atoms: [{ id: 'Me', x: 45, y: 110, label: 'H3C' }, { id: 'C2', x: 120, y: 110, label: 'CH2' }, { id: 'S', x: 190, y: 110, label: 'S' }, { id: 'Ha', x: 245, y: 110, label: 'H' }], bonds: [['Me', 'C2', 1], ['C2', 'S', 1], ['S', 'Ha', 1]], acidH: 'Ha', site: 'S' }
};

// The curated pairs. `line` is the hand-checked deciding line; selfTest proves decide() agrees with it AND with pKa.
export const PAIRS = [
  { a: 'hydronium', b: 'water', line: 'C' },
  { a: 'methylammonium', b: 'methylamine', line: 'C' },
  { a: 'ammonium', b: 'ammonia', line: 'C' },
  { a: 'h2s', b: 'water', line: 'A' },
  { a: 'hi', b: 'hf', line: 'A' },
  { a: 'hbr', b: 'hcl', line: 'A' },
  { a: 'water', b: 'ammonia', line: 'A' },
  { a: 'hf', b: 'water', line: 'A' },
  { a: 'ammonia', b: 'methane', line: 'A' },
  { a: 'ethanethiol', b: 'ethanol', line: 'A' },
  { a: 'methanol', b: 'methylamine', line: 'A' },
  { a: 'acetic', b: 'ethanol', line: 'R' },
  { a: 'phenol', b: 'cyclohexanol', line: 'R' },
  { a: 'acetic', b: 'phenol', line: 'R' },
  { a: 'fluoroacetic', b: 'acetic', line: 'D' },
  { a: 'chloroacetic', b: 'acetic', line: 'D' },
  { a: 'trichloroacetic', b: 'chloroacetic', line: 'D' },
  { a: 'fluoroacetic', b: 'chloroacetic', line: 'D' },
  { a: 'trifluoroethanol', b: 'ethanol', line: 'D' },
  { a: 'ethyne', b: 'ethene', line: 'O' },
  { a: 'ethene', b: 'ethane', line: 'O' },
  { a: 'ethyne', b: 'ethane', line: 'O' }
];
const VISUAL_PAIRS = [0, 1, 3, 4, 6, 11, 12, 14, 18, 19, 20];
export const LINES = [
  { k: 'C', name: 'Charge', q: 'Is one acid positively charged?' },
  { k: 'A', name: 'Atom', q: 'Which atom holds the pair? Row: more electronegative wins. Column: bigger wins.' },
  { k: 'R', name: 'Resonance', q: 'Can the base spread its charge?' },
  { k: 'D', name: 'Dipole induction', q: 'Is a vacuum nearby thinning the charge?' },
  { k: 'O', name: 'Orbital', q: 'More s-character holds the pair tighter: sp beats sp2 beats sp3.' }
];

// Run CARDIO top to bottom on two species. Returns the deciding line, the stronger acid, and the reason. Pure.
export function decide(a, b){
  const A = SPECIES[a], B = SPECIES[b];
  if (A.charge !== B.charge){
    const w = A.charge > B.charge ? A : B, l = w === A ? B : A;
    return { line: 'C', stronger: w === A ? a : b, reason: 'Charge decided it. ' + cap(w.name) + ' carries a plus, so losing the proton relieves a charge instead of creating one. ' + cap(l.name) + ' would have to build a minus from nothing.' };
  }
  if (A.atom !== B.atom){
    if (COL[A.atom] === COL[B.atom]){
      const w = ROW[A.atom] > ROW[B.atom] ? A : B, l = w === A ? B : A;
      return { line: 'A', stronger: w === A ? a : b, reason: 'Atom decided it, by size. ' + w.atom + ' sits below ' + l.atom + ' in the same column, and a bigger atom spreads the minus over a bigger balloon. Down a column, size beats electronegativity.' };
    }
    if (ROW[A.atom] === ROW[B.atom] && EN[A.atom] != null && EN[B.atom] != null){
      const w = EN[A.atom] > EN[B.atom] ? A : B, l = w === A ? B : A;
      return { line: 'A', stronger: w === A ? a : b, reason: 'Atom decided it, by electronegativity. ' + w.atom + ' and ' + l.atom + ' are in the same row, and ' + w.atom + ' pulls harder, so it is happier holding the minus.' };
    }
    return null;
  }
  if (A.res !== B.res){
    const w = A.res > B.res ? A : B, l = w === A ? B : A;
    const why = w.res === 2 && l.res === 0 ? 'the base of ' + w.name + ' spreads the minus over two oxygens; the base of ' + l.name + ' cannot spread it at all.'
      : w.res === 1 && l.res === 0 ? 'the base of ' + w.name + ' spreads the minus into the ring; the base of ' + l.name + ' leaves it stuck on one atom.'
      : 'both bases spread the charge, but ' + w.name + ' puts it on two oxygens while ' + l.name + ' pushes some of it onto carbons. Onto oxygens beats onto carbons.';
    return { line: 'R', stronger: w === A ? a : b, reason: 'Resonance decided it: ' + why };
  }
  if (A.ind !== B.ind){
    const w = A.ind > B.ind ? A : B, l = w === A ? B : A;
    return { line: 'D', stronger: w === A ? a : b, reason: 'Dipole induction decided it. ' + cap(w.name) + ' has the stronger vacuum next to the minus (' + (l.ind === 0 ? cap(l.name) + ' has none' : 'more or stronger pullers than ' + l.name) + '), and a vacuum next to a negative charge thins it out.' };
  }
  if (A.orb !== B.orb){
    const w = A.orb > B.orb ? A : B, l = w === A ? B : A;
    return { line: 'O', stronger: w === A ? a : b, reason: 'Orbital decided it. The pair on the base of ' + w.name + ' sits in an ' + ORB_NAME[w.orb] + ' orbital versus ' + ORB_NAME[l.orb] + ' for ' + l.name + '. More s-character hugs the nucleus tighter, so the pair is happier.' };
  }
  return null;
}
function cap(s){ return s.charAt(0).toUpperCase() + s.slice(1); }

// ---------- item generator (pure, node-safe) ----------
export function gen(rng){
  const pr = PAIRS[Math.floor(rng() * PAIRS.length)];
  const d = decide(pr.a, pr.b);
  const flip = rng() < 0.5;
  const ids = flip ? [pr.b, pr.a] : [pr.a, pr.b];
  if (rng() < 0.6) return { type: 'stronger', ids, answer: ids.indexOf(d.stronger), line: d.line, reason: d.reason };
  return { type: 'line', ids, answer: LINES.findIndex(L => L.k === d.line), line: d.line, reason: d.reason, stronger: d.stronger };
}

function mulberry(seed){ let s = seed | 0; return function(){ s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

export function selfTest(){
  let tried = 0;
  // every pair: CARDIO agrees with the hand-checked line, and the winner has the lower pKa
  for (const pr of PAIRS){
    const d = decide(pr.a, pr.b);
    if (!d) return { ok: false, tried, notes: pr.a + ' vs ' + pr.b + ': CARDIO cannot separate them' };
    if (d.line !== pr.line) return { ok: false, tried, notes: pr.a + ' vs ' + pr.b + ': CARDIO says ' + d.line + ', table says ' + pr.line };
    const w = SPECIES[d.stronger], l = SPECIES[d.stronger === pr.a ? pr.b : pr.a];
    if (!(w.pKa < l.pKa)) return { ok: false, tried, notes: pr.a + ' vs ' + pr.b + ': winner does not have the lower pKa' };
    const d2 = decide(pr.b, pr.a);
    if (d2.line !== d.line || d2.stronger !== d.stronger) return { ok: false, tried, notes: pr.a + ' vs ' + pr.b + ': order-dependent' };
  }
  // every species: the acidic H is bonded to the site atom, and the drawing is consistent
  for (const [id, sp] of Object.entries(SPECIES)){
    const ids = new Set(sp.atoms.map(a => a.id));
    if (!ids.has(sp.acidH) || !ids.has(sp.site)) return { ok: false, tried, notes: id + ': acidH or site missing' };
    if (!sp.bonds.some(b => (b[0] === sp.acidH && b[1] === sp.site) || (b[1] === sp.acidH && b[0] === sp.site))) return { ok: false, tried, notes: id + ': acidic H not on the site atom' };
    const siteLabel = sp.atoms.find(a => a.id === sp.site).label.replace(/\d/g, '');
    if (!siteLabel.includes(sp.atom) && !(sp.atom === 'C' && siteLabel === '')) return { ok: false, tried, notes: id + ': site label does not match atom ' + sp.atom };
    for (const b of sp.bonds) if (!ids.has(b[0]) || !ids.has(b[1])) return { ok: false, tried, notes: id + ': bond to unknown atom' };
  }
  const rng = mulberry(17);
  let strong = 0, lines = 0;
  for (let i = 0; i < 400; i++){
    const it = gen(rng); tried++;
    if (it.type === 'stronger'){
      strong++;
      if (it.answer < 0 || it.answer > 1) return { ok: false, tried, notes: 'answer out of range' };
      const d = decide(it.ids[0], it.ids[1]);
      if (it.ids[it.answer] !== d.stronger) return { ok: false, tried, notes: 'stronger answer mismatch' };
      if (SPECIES[it.ids[it.answer]].pKa >= SPECIES[it.ids[1 - it.answer]].pKa) return { ok: false, tried, notes: 'pKa disagrees' };
    } else {
      lines++;
      if (LINES[it.answer].k !== decide(it.ids[0], it.ids[1]).line) return { ok: false, tried, notes: 'line answer mismatch' };
    }
  }
  const a = gen(mulberry(2)), b = gen(mulberry(2));
  if (JSON.stringify(a) !== JSON.stringify(b)) return { ok: false, tried, notes: 'not reproducible' };
  return { ok: true, tried, notes: strong + ' which-is-stronger, ' + lines + ' which-line-decides, ' + PAIRS.length + ' pairs' };
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
// Draw a species. Returns handles: hGroup (acidic H and its bond), plusGroup (charge before), minusGroup (charge after, hidden).
function drawSpecies(api, sp, opts){
  const { svg } = api, C = api.colors;
  const S = opts.scale || 1, ox = opts.ox || 0, oy = opts.oy || 0, size = 20 * S;
  const pos = {}; for (const a of sp.atoms) pos[a.id] = a;
  const P = a => ({ x: ox + a.x * S, y: oy + a.y * S });
  const g = svg('g', {}), hGroup = svg('g', {}), plusGroup = svg('g', {}), minusGroup = svg('g', { opacity: '0' });
  for (const [ai, bi, order] of sp.bonds){
    const a = pos[ai], b = pos[bi], pa = P(a), pb = P(b);
    const dx = pb.x - pa.x, dy = pb.y - pa.y, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
    const ra = labelRadius(a.label) * S, rb = labelRadius(b.label) * S;
    const x1 = pa.x + ux * ra, y1 = pa.y + uy * ra, x2 = pb.x - ux * rb, y2 = pb.y - uy * rb;
    const isH = ai === sp.acidH || bi === sp.acidH;
    const target = isH ? hGroup : g;
    const stroke = isH ? C.coral : C.ink2, w = 2.4 * S;
    const line = (off) => svg('line', { x1: x1 - uy * off, y1: y1 + ux * off, x2: x2 - uy * off, y2: y2 + ux * off, stroke, 'stroke-width': String(w), 'stroke-linecap': 'round' });
    if (order === 1) target.append(line(0));
    else if (order === 3) target.append(line(0), line(5 * S), line(-5 * S));
    else if (sp.ringCenter && a.label === '' && b.label === ''){
      const c = P({ x: sp.ringCenter[0], y: sp.ringCenter[1] }), mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
      const side = ((c.x - mx) * -uy + (c.y - my) * ux) > 0 ? 1 : -1;
      target.append(line(0));
      target.append(svg('line', { x1: x1 + (x2 - x1) * 0.16 - uy * 7 * S * side, y1: y1 + (y2 - y1) * 0.16 + ux * 7 * S * side, x2: x2 - (x2 - x1) * 0.16 - uy * 7 * S * side, y2: y2 - (y2 - y1) * 0.16 + ux * 7 * S * side, stroke, 'stroke-width': String(w), 'stroke-linecap': 'round' }));
    } else target.append(line(4.2 * S), line(-4.2 * S));
  }
  for (const a of sp.atoms){
    const p = P(a);
    if (a.label === '') continue;
    const isH = a.id === sp.acidH, isSite = a.id === sp.site;
    (isH ? hGroup : g).append(labelText(api, p.x, p.y, a.label, isH ? C.coral : isSite ? C.blue : C.ink, size));
  }
  // charge badges on the site atom, placed away from its bonds
  const site = pos[sp.site], ps = P(site);
  const taken = sp.bonds.filter(b => b[0] === sp.site || b[1] === sp.site).map(b => { const o = pos[b[0] === sp.site ? b[1] : b[0]]; return Math.atan2(-(o.y - site.y), o.x - site.x) * 180 / Math.PI; });
  const gapTo = deg => taken.reduce((m, t) => Math.min(m, Math.abs(((deg - t) % 360 + 540) % 360 - 180)), 999);
  let deg = 50, best = -1; for (const c of [50, 130, -50, 230, 90, 0, 180, 270]){ const q = gapTo(c); if (q > best){ best = q; deg = c; } }
  const t = deg * Math.PI / 180, d = labelRadius(site.label) * S + 13 * S;
  const bx = ps.x + Math.cos(t) * d, by = ps.y - Math.sin(t) * d;
  if (sp.charge > 0) plusGroup.append(badge(api, bx, by, '+', C.coral, S));
  else minusGroup.append(badge(api, bx, by, '-', C.blue, S));
  // when a cation loses its proton it becomes neutral: nothing to show, so the minus group stays empty
  g.append(hGroup, plusGroup, minusGroup);
  return { g, hGroup, plusGroup, minusGroup, P };
}
function fitScale(sp, boxW, boxH){
  const xs = sp.atoms.map(a => a.x), ys = sp.atoms.map(a => a.y);
  const w = Math.max(...xs) - Math.min(...xs) + 70, h = Math.max(...ys) - Math.min(...ys) + 60;
  const s = Math.min(boxW / w, boxH / h, 1.15);
  return { s, cx: (Math.max(...xs) + Math.min(...xs)) / 2, cy: (Math.max(...ys) + Math.min(...ys)) / 2 };
}

export function mount(slots, api){
  const { el, svg } = api, C = api.colors;

  // ---------- VISUAL ----------
  let pairIdx = VISUAL_PAIRS[0], stripped = false, busy = false;
  const W = 800, H = 272;
  const stage = el('div', {});
  const caption = el('p', { style: { margin: '10px 0 0', color: C.ink2, fontSize: '15px', minHeight: '3.6em' }, text: '' });
  let handles = [], rows = [];

  function render(){
    stage.replaceChildren(); handles = []; rows = []; stripped = false;
    const pr = PAIRS[pairIdx];
    const root = svg('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': SPECIES[pr.a].name + ' and ' + SPECIES[pr.b].name + ' side by side, with the CARDIO checklist' });
    [pr.a, pr.b].forEach((id, i) => {
      const sp = SPECIES[id];
      const cellX = 20 + i * 250, cellW = 240, cellH = 220;
      root.append(svg('rect', { x: cellX, y: 30, width: cellW, height: cellH, rx: 10, fill: C.card, stroke: C.line }));
      const f = fitScale(sp, cellW - 24, cellH - 50);
      const h = drawSpecies(api, sp, { scale: f.s, ox: cellX + cellW / 2 - f.cx * f.s, oy: 30 + (cellH - 30) / 2 - f.cy * f.s });
      root.append(h.g);
      root.append(svg('text', { x: cellX + cellW / 2, y: 30 + cellH - 12, 'text-anchor': 'middle', 'font-family': 'Georgia, serif', 'font-size': '15', fill: C.ink2, text: sp.name }));
      handles.push(h);
    });
    root.append(svg('text', { x: 20, y: 18, 'font-family': 'ui-monospace, Menlo, monospace', 'font-size': '12', fill: C.ink3, text: 'TWO ACIDS. STRIP THE PROTON, THEN JUDGE THE BASES.' }));
    // CARDIO checklist
    const lx = 540, ly = 40;
    root.append(svg('text', { x: lx, y: ly - 14, 'font-family': 'ui-monospace, Menlo, monospace', 'font-size': '12', fill: C.ink3, text: 'CARDIO, TOP TO BOTTOM' }));
    LINES.forEach((L, i) => {
      const y = ly + i * 46;
      const row = svg('g', { opacity: '0.45' });
      row.append(svg('rect', { x: lx, y, width: 240, height: 38, rx: 8, fill: C.card, stroke: C.line }));
      row.append(svg('rect', { x: lx + 8, y: y + 7, width: 24, height: 24, rx: 6, fill: C.panel, stroke: C.line }));
      row.append(svg('text', { x: lx + 20, y: y + 24, 'text-anchor': 'middle', 'font-family': 'ui-monospace, Menlo, monospace', 'font-size': '13', fill: C.gold, text: L.k }));
      row.append(svg('text', { x: lx + 42, y: y + 24, 'font-family': 'Georgia, serif', 'font-size': '16', fill: C.ink, text: L.name }));
      const tag = svg('text', { x: lx + 232, y: y + 24, 'text-anchor': 'end', 'font-family': 'ui-monospace, Menlo, monospace', 'font-size': '11', fill: C.ink3, text: '' });
      row.append(tag);
      root.append(row);
      rows.push({ row, tag, rect: row.querySelector('rect') });
    });
    stage.append(root);
    stripBtn.disabled = false;
    caption.textContent = 'Press "Strip the proton". Both acids lose their coral H, and the checklist runs until one line separates them.';
  }
  function strip(){
    if (stripped || busy) return;
    stripped = true; busy = true; stripBtn.disabled = true;
    const D = api.reduced ? 0 : 1;
    const pr = PAIRS[pairIdx], d = decide(pr.a, pr.b);
    for (const h of handles){
      h.hGroup.style.transition = 'opacity ' + (600 * D) + 'ms, transform ' + (600 * D) + 'ms';
      h.plusGroup.style.transition = 'opacity ' + (400 * D) + 'ms ' + (400 * D) + 'ms';
      h.minusGroup.style.transition = 'opacity ' + (400 * D) + 'ms ' + (400 * D) + 'ms';
    }
    void stage.getBoundingClientRect();
    for (const h of handles){ h.hGroup.style.opacity = '0'; h.hGroup.style.transform = 'matrix(1,0,0,1,0,-22)'; h.plusGroup.style.opacity = '0'; h.minusGroup.style.opacity = '1'; }
    const stopAt = LINES.findIndex(L => L.k === d.line);
    const stepMs = 380 * D;
    LINES.forEach((L, i) => {
      setTimeout(() => {
        const r = rows[i];
        if (i < stopAt){ r.row.setAttribute('opacity', '1'); r.rect.setAttribute('stroke', C.gold); r.tag.textContent = 'same'; }
        else if (i === stopAt){ r.row.setAttribute('opacity', '1'); r.rect.setAttribute('stroke', C.green); r.rect.setAttribute('stroke-width', '2'); r.rect.setAttribute('fill', 'rgba(87,180,135,.12)'); r.tag.textContent = 'decides'; r.tag.setAttribute('fill', C.green); caption.textContent = d.reason + ' Stronger acid: ' + SPECIES[d.stronger].name + '.'; busy = false; }
        else { r.row.setAttribute('opacity', '0.25'); r.tag.textContent = 'not needed'; }
      }, 700 * D + i * stepMs);
    });
    if (D === 0) busy = false;
  }
  const stripBtn = el('button', { class: 'primary', type: 'button', text: 'Strip the proton', onClick: strip });
  const resetBtn = el('button', { class: 'secondary', type: 'button', text: 'Reset', onClick: () => { if (!busy) render(); } });
  const chips = el('div', { class: 'controls', role: 'group', 'aria-label': 'Pick a pair' });
  const chipEls = VISUAL_PAIRS.map(i => { const pr = PAIRS[i]; return el('button', { class: 'chip', type: 'button', 'aria-pressed': i === pairIdx ? 'true' : 'false', text: SPECIES[pr.a].name + ' vs ' + SPECIES[pr.b].name, onClick: () => { if (busy) return; pairIdx = i; chipEls.forEach(c => c.setAttribute('aria-pressed', 'false')); chipEls[VISUAL_PAIRS.indexOf(i)].setAttribute('aria-pressed', 'true'); render(); } }); });
  chips.append(...chipEls);
  slots.visual.append(stage, el('div', { class: 'controls' }, stripBtn, resetBtn), caption, chips);
  render();

  // ---------- YOU TRY ----------
  let item = null, firstTry = true, done = false;
  const tryBox = el('div', { class: 'item' });
  slots.try.append(tryBox);
  function card(id){
    const sp = SPECIES[id];
    const s = svg('svg', { viewBox: '0 0 300 190', width: '100%', style: { display: 'block', maxHeight: '150px' }, 'aria-hidden': 'true' });
    const f = fitScale(sp, 280, 160);
    s.append(drawSpecies(api, sp, { scale: f.s, ox: 150 - f.cx * f.s, oy: 88 - f.cy * f.s }).g);
    return el('span', { style: { display: 'block' } }, s, el('span', { style: { display: 'block', textAlign: 'center', fontFamily: 'Georgia, serif', fontSize: '14px', color: C.ink2 }, text: sp.name }));
  }
  function options(contents, answer, ariaLabels, onMiss){
    const box = el('div', { class: 'opts' });
    const btns = contents.map((content, i) => {
      const btn = el('button', { class: 'opt', type: 'button', 'aria-label': ariaLabels[i] }, el('span', { class: 'k', text: 'ABCDE'[i] }), content);
      btn.addEventListener('click', () => {
        if (done) return;
        btns.forEach(x => x.classList.remove('picked')); btn.classList.add('picked');
        if (i === answer){ btn.classList.add('ok'); btns.forEach(x => { x.disabled = true; }); done = true; api.report(firstTry); api.clearCoach(); tryBox.append(el('div', { class: 'verdict good', text: 'You can read it.' }), el('div', { class: 'controls' }, el('button', { class: 'primary', type: 'button', text: 'Another one', onClick: next }))); }
        else { if (firstTry) api.report(false); firstTry = false; if (!tryBox.querySelector('.verdict')) tryBox.append(el('div', { class: 'verdict notyet', text: 'Not yet.' })); api.coach(onMiss(i)); }
      });
      return btn;
    });
    box.append(...btns);
    return box;
  }
  function next(){
    tryBox.replaceChildren(); api.clearCoach();
    item = gen(api.rng); firstTry = true; done = false;
    if (item.type === 'stronger'){
      tryBox.append(el('p', { class: 'prompt', text: 'Which is the stronger acid? Strip the proton in your head and judge the base.' }));
      tryBox.append(options(item.ids.map(card), item.answer, item.ids.map(id => SPECIES[id].name), () => item.reason));
    } else {
      tryBox.append(el('p', { class: 'prompt', text: 'Run CARDIO on this pair. Which line is the first one that separates them?' }));
      const pairRow = el('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '4px' } });
      item.ids.forEach(id => pairRow.append(el('div', { style: { background: C.card, border: '1px solid ' + C.line, borderRadius: '12px', padding: '8px' } }, card(id))));
      tryBox.append(pairRow);
      tryBox.append(options(LINES.map(L => el('span', { text: L.name })), item.answer, LINES.map(L => L.name), i => 'Top to bottom, stop at the first line that separates them. ' + LINES[i].name + (i < item.answer ? ' comes out the same for both here.' : ' is further down than you need.') + ' ' + item.reason));
    }
  }
  next();
}
