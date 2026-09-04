// The Tree of Organic · Level 7 · Module 5: Polarity is the whole story
// ES module, no imports. Structures are drawn by the shell from SMILES; the
// force ladder and the boiling-point chart are built here from a curated table.

export const SMILES = [
  'CCC', 'CCCC', 'CCCCC', 'CCCCCC', 'CCCCCCCC', 'CC(C)CC', 'CC(C)(C)C', 'C1CCCCC1', 'CCCCC=C', 'c1ccccc1', 'Cc1ccccc1',
  'CCBr', 'CCCCCl', 'ClCCl', 'COC', 'CCOCC', 'C1CCOC1', 'COC(C)(C)C', 'COc1ccccc1',
  'CCC=O', 'CCCC=O', 'c1ccc(C=O)cc1', 'CC(C)=O', 'CCC(C)=O', 'C1CCC(=O)CC1', 'COC(C)=O', 'CCOC(C)=O', 'CC#N',
  'CCCN', 'CCNCC', 'CCN(CC)CC', 'Nc1ccccc1', 'CO', 'CCO', 'CCCO', 'CC(C)O', 'CCCCO', 'CCC(C)O', 'CC(C)(C)O',
  'CCCCCO', 'OC1CCCCC1', 'OCCO', 'Oc1ccccc1', 'CC(=O)O', 'CCC(=O)O', 'CCCC(=O)O', 'CCCCC(=O)O', 'OC(=O)c1ccccc1', 'CC(N)=O'
];

export const meta = {
  id: 't7-properties',
  level: 7,
  order: 5,
  needs3D: false,
  title: 'Polarity is the whole story',
  concept: 'Boiling point, solubility and functional group',
  tagline: 'Hydrogen bonding first, then dipoles, then size. That order answers almost every physical property question.',
  story: 'Boiling means tearing molecules apart from each other, so ask one question: how hard do these two stick together? Hydrogen bonding is the strongest grip, and it needs an O-H or an N-H, not just an oxygen. Then a plain dipole. Then size, because bigger molecules touch over more surface. Carboxylic acids sit on top of everything because they pair up two at a time, two hydrogen bonds at once. Branching lowers boiling point: a branched molecule is a ball, and balls touch less than sticks do. Water solubility runs on the same grip, with a size limit: past about four carbons for every polar group, the greasy part wins. Rule of thumb: grip first, size second.',
  moveName: 'Grip first, then size',
  move: [
    'Look for an O-H or an N-H. That is hydrogen bonding, the strongest grip, and it wins first.',
    'A carboxylic acid beats every other hydrogen bonder its size, because two of them pair up and hold on twice.',
    'No O-H or N-H: look for a dipole. A C=O or a C to N triple bond beats an ether or a halide, which beats nothing at all.',
    'Same grip on both sides: more carbons boils higher, and more branching boils lower.',
    'For water solubility, count carbons per polar group. Past about four, it stops dissolving.'
  ],
  trap: 'Careful: an oxygen is not automatically a hydrogen bond. An ether and a ketone both have an oxygen, but neither has a hydrogen on it, so neither can hold hands with its own kind; that is why diethyl ether boils at 35 and 1-butanol, the same number of carbons, boils at 118.',
  holdsUp: ['Boiling point ranking', 'Water solubility', 'Extraction and washing steps', 'Which solvent to use'],
  drill: 'Booster OChem: Spectroscopy & Lab Techniques'
};

const SERIF = 'Georgia, "Times New Roman", serif';
const MONO = 'ui-monospace, "SF Mono", Menlo, monospace';
const ROOTS = ['l1-groups', 'l2-bully'];

/* ------------------------------------------------------------------ */
/* the grip ladder, low to high                                         */
/* ------------------------------------------------------------------ */
const GROUP_TIER = {
  'alkane': 1, 'alkene': 1, 'aromatic hydrocarbon': 1,
  'alkyl halide': 2, 'ether': 2,
  'aldehyde': 3, 'ketone': 3, 'ester': 3, 'nitrile': 3,
  'amine': 4, 'alcohol': 5, 'phenol': 5, 'carboxylic acid': 6, 'amide': 7
};
const TIER_NOTE = {
  1: 'London forces only. Nothing to grip with but surface.',
  2: 'A weak dipole. An oxygen or a halogen pulls, but there is no hydrogen on it to hold hands with.',
  3: 'A strong dipole. A C=O or a nitrile pulls hard, but still no hydrogen on the pulling atom.',
  4: 'An N-H hydrogen bond. Nitrogen is less greedy than oxygen, so the grip is real but softer.',
  5: 'An O-H hydrogen bond. The strong grip.',
  6: 'A carboxylic acid: two molecules pair up and hold with two hydrogen bonds at once.',
  7: 'An amide: N-H donors plus the strongest C=O acceptor on the page. Nothing organic sticks harder.'
};
const FORCE_ROW = [
  { id: 'london', name: 'London dispersion', line: 'Every molecule has it. It grows with size and with straightness.', tiers: [1] },
  { id: 'dipole', name: 'Dipole to dipole', line: 'A permanent pull, but no hydrogen sitting on the greedy atom.', tiers: [2, 3] },
  { id: 'hbond', name: 'Hydrogen bonding', line: 'An O-H or an N-H reaching for the next molecule. The strongest grip on the DAT.', tiers: [4, 5, 6, 7] }
];
function rowOf(m){ return FORCE_ROW.find(r => r.tiers.includes(m.tier)); }
const GROUP_TELL = {
  'alkane': 'Only carbon and hydrogen, all single bonds.',
  'alkene': 'A carbon to carbon double bond in a chain.',
  'aromatic hydrocarbon': 'A benzene ring with nothing polar hanging off it.',
  'alkyl halide': 'A halogen sitting on an sp3 carbon.',
  'ether': 'An oxygen with a carbon on each side and no C=O anywhere.',
  'aldehyde': 'A C=O at the end of a chain, carrying a hydrogen.',
  'ketone': 'A C=O with a carbon on both sides.',
  'ester': 'A C=O with an oxygen on one side and a carbon on the other.',
  'nitrile': 'A carbon to nitrogen triple bond.',
  'amine': 'A nitrogen bonded only to carbon and hydrogen, with no C=O on it.',
  'alcohol': 'An O-H on an sp3 carbon.',
  'phenol': 'An O-H bonded straight onto a benzene ring.',
  'carboxylic acid': 'A C=O and an O-H on the same carbon.',
  'amide': 'A C=O with a nitrogen bonded to it.'
};

/* ------------------------------------------------------------------ */
/* The curated table. bp is degrees Celsius at one atmosphere. hb = how */
/* many N-H or O-H hydrogens it can donate. pol = polar groups. br =    */
/* branch points. sol: 3 mixes with water in any amount, 2 dissolves    */
/* well, 1 dissolves a little, 0 does not dissolve.                     */
/* ------------------------------------------------------------------ */
const M = (id, name, smiles, group, bp, C, o) => Object.assign({ id, name, smiles, group, bp, C, tier: GROUP_TIER[group], hb: 0, pol: 0, br: 0, sol: 0 }, o || {});
const MOL = [
  M('propane', 'propane', 'CCC', 'alkane', -42, 3),
  M('butane', 'butane', 'CCCC', 'alkane', 0, 4),
  M('pentane', 'pentane', 'CCCCC', 'alkane', 36, 5),
  M('hexane', 'hexane', 'CCCCCC', 'alkane', 69, 6),
  M('octane', 'octane', 'CCCCCCCC', 'alkane', 126, 8),
  M('isopentane', '2-methylbutane', 'CC(C)CC', 'alkane', 28, 5, { br: 1 }),
  M('neopentane', '2,2-dimethylpropane', 'CC(C)(C)C', 'alkane', 10, 5, { br: 2 }),
  M('cyclohexane', 'cyclohexane', 'C1CCCCC1', 'alkane', 81, 6),
  M('hexene', '1-hexene', 'CCCCC=C', 'alkene', 63, 6),
  M('benzene', 'benzene', 'c1ccccc1', 'aromatic hydrocarbon', 80, 6),
  M('toluene', 'toluene', 'Cc1ccccc1', 'aromatic hydrocarbon', 111, 7),
  M('bromoethane', 'bromoethane', 'CCBr', 'alkyl halide', 38, 2),
  M('chlorobutane', '1-chlorobutane', 'CCCCCl', 'alkyl halide', 78, 4),
  M('dcm', 'dichloromethane', 'ClCCl', 'alkyl halide', 40, 1, { sol: 1 }),
  M('dimethylether', 'dimethyl ether', 'COC', 'ether', -24, 2, { pol: 1, sol: 2 }),
  M('ether', 'diethyl ether', 'CCOCC', 'ether', 35, 4, { pol: 1, sol: 1 }),
  M('thf', 'tetrahydrofuran', 'C1CCOC1', 'ether', 66, 4, { pol: 1, sol: 3 }),
  M('mtbe', 'tert-butyl methyl ether', 'COC(C)(C)C', 'ether', 55, 5, { pol: 1, sol: 1, br: 2 }),
  M('anisole', 'anisole', 'COc1ccccc1', 'ether', 154, 7, { pol: 1, sol: 0 }),
  M('propanal', 'propanal', 'CCC=O', 'aldehyde', 49, 3, { pol: 1, sol: 2 }),
  M('butanal', 'butanal', 'CCCC=O', 'aldehyde', 75, 4, { pol: 1, sol: 1 }),
  M('benzaldehyde', 'benzaldehyde', 'c1ccc(C=O)cc1', 'aldehyde', 178, 7, { pol: 1, sol: 0 }),
  M('acetone', 'acetone', 'CC(C)=O', 'ketone', 56, 3, { pol: 1, sol: 3, br: 1 }),
  M('butanone', '2-butanone', 'CCC(C)=O', 'ketone', 80, 4, { pol: 1, sol: 2, br: 1 }),
  M('cyclohexanone', 'cyclohexanone', 'C1CCC(=O)CC1', 'ketone', 156, 6, { pol: 1, sol: 1 }),
  M('methylacetate', 'methyl acetate', 'COC(C)=O', 'ester', 57, 3, { pol: 1, sol: 2 }),
  M('ethylacetate', 'ethyl acetate', 'CCOC(C)=O', 'ester', 77, 4, { pol: 1, sol: 1 }),
  M('acetonitrile', 'acetonitrile', 'CC#N', 'nitrile', 82, 2, { pol: 1, sol: 3 }),
  M('propylamine', 'propylamine', 'CCCN', 'amine', 48, 3, { hb: 2, pol: 1, sol: 3 }),
  M('diethylamine', 'diethylamine', 'CCNCC', 'amine', 55, 4, { hb: 1, pol: 1, sol: 3 }),
  M('triethylamine', 'triethylamine', 'CCN(CC)CC', 'amine', 89, 6, { hb: 0, pol: 1, sol: 1, tier: 2 }),
  M('aniline', 'aniline', 'Nc1ccccc1', 'amine', 184, 6, { hb: 2, pol: 1, sol: 1 }),
  M('methanol', 'methanol', 'CO', 'alcohol', 65, 1, { hb: 1, pol: 1, sol: 3 }),
  M('ethanol', 'ethanol', 'CCO', 'alcohol', 78, 2, { hb: 1, pol: 1, sol: 3 }),
  M('propanol', '1-propanol', 'CCCO', 'alcohol', 97, 3, { hb: 1, pol: 1, sol: 3 }),
  M('isopropanol', '2-propanol', 'CC(C)O', 'alcohol', 82, 3, { hb: 1, pol: 1, sol: 3, br: 1 }),
  M('butanol', '1-butanol', 'CCCCO', 'alcohol', 118, 4, { hb: 1, pol: 1, sol: 1 }),
  M('butanol2', '2-butanol', 'CCC(C)O', 'alcohol', 99, 4, { hb: 1, pol: 1, sol: 2, br: 1 }),
  M('tbutanol', 'tert-butanol', 'CC(C)(C)O', 'alcohol', 83, 4, { hb: 1, pol: 1, sol: 3, br: 2 }),
  M('pentanol', '1-pentanol', 'CCCCCO', 'alcohol', 138, 5, { hb: 1, pol: 1, sol: 1 }),
  M('cyclohexanol', 'cyclohexanol', 'OC1CCCCC1', 'alcohol', 161, 6, { hb: 1, pol: 1, sol: 1 }),
  M('glycol', 'ethylene glycol', 'OCCO', 'alcohol', 197, 2, { hb: 2, pol: 2, sol: 3 }),
  M('phenol', 'phenol', 'Oc1ccccc1', 'phenol', 182, 6, { hb: 1, pol: 1, sol: 2 }),
  M('aceticacid', 'acetic acid', 'CC(=O)O', 'carboxylic acid', 118, 2, { hb: 1, pol: 1, sol: 3 }),
  M('propanoicacid', 'propanoic acid', 'CCC(=O)O', 'carboxylic acid', 141, 3, { hb: 1, pol: 1, sol: 3 }),
  M('butanoicacid', 'butanoic acid', 'CCCC(=O)O', 'carboxylic acid', 164, 4, { hb: 1, pol: 1, sol: 3 }),
  M('pentanoicacid', 'pentanoic acid', 'CCCCC(=O)O', 'carboxylic acid', 186, 5, { hb: 1, pol: 1, sol: 1 }),
  M('benzoicacid', 'benzoic acid', 'OC(=O)c1ccccc1', 'carboxylic acid', 249, 7, { hb: 1, pol: 1, sol: 0 }),
  M('acetamide', 'acetamide', 'CC(N)=O', 'amide', 221, 2, { hb: 2, pol: 1, sol: 3 })
];
const BY = {}; for (const m of MOL) BY[m.id] = m;

/* the sets the visual sorts, each one making one point */
const SETS = [
  { id: 'groups', name: 'Four carbons, four groups', ids: ['butane', 'ether', 'butanol', 'butanoicacid'],
    point: 'Same size for all four. Only the grip changes, and it changes the boiling point by 164 degrees.' },
  { id: 'branch', name: 'Branching', ids: ['neopentane', 'isopentane', 'pentane', 'hexane'],
    point: 'The first three are the same formula. A branched molecule is a ball, and balls touch less than sticks, so branching lowers the boiling point.' },
  { id: 'oh', name: 'One O-H changes everything', ids: ['propane', 'dimethylether', 'ethanol', 'propanol'],
    point: 'Dimethyl ether and ethanol are the same formula, C2H6O. The one with the hydrogen on the oxygen boils 102 degrees higher.' },
  { id: 'carbonyl', name: 'Up the ladder at four carbons', ids: ['butanal', 'butanone', 'butanol', 'butanoicacid'],
    point: 'Dipole, dipole, hydrogen bond, then the acid dimer. Every step up the grip ladder is a step up in boiling point.' },
  { id: 'nitrogen', name: 'Three carbons, four grips', ids: ['propane', 'propylamine', 'propanol', 'propanoicacid'],
    point: 'N-H is a real hydrogen bond but a softer one than O-H, so the amine sits between the alkane and the alcohol.' },
  { id: 'ring', name: 'On a benzene ring', ids: ['benzene', 'toluene', 'anisole', 'phenol'],
    point: 'Same ring underneath. Add a methyl, add an ether oxygen, then add the O-H, and each one grips harder than the last.' },
  { id: 'size', name: 'Size alone', ids: ['butane', 'pentane', 'hexane', 'octane'],
    point: 'No dipole, no hydrogen bond, nothing but surface. When the grip is equal, size is the only thing left.' }
];

/* ------------------------------------------------------------------ */
/* the rule, written down so a generated item can be checked against it */
/* ------------------------------------------------------------------ */
function beats(a, b){
  if (a.tier !== b.tier) return a.tier > b.tier;
  if (a.hb !== b.hb) return a.hb > b.hb;
  if (a.C !== b.C) return a.C > b.C;
  return a.br < b.br;
}
function cpp(m){ return m.pol ? m.C / m.pol : 99; }   // carbons per polar group

/* ------------------------------------------------------------------ */
/* helpers                                                              */
/* ------------------------------------------------------------------ */
function makeRng(seed){ let s = seed | 0; return function(){ s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function pickWith(rng, a){ return a[Math.floor(rng() * a.length)]; }
function shuffleWith(rng, a){ const b = a.slice(); for (let i = b.length - 1; i > 0; i--){ const j = Math.floor(rng() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; }
function smilesSane(s){
  if (typeof s !== 'string' || !s) return false;
  if (/[^A-Za-z0-9@+\-\[\]()=#\/\\%.]/.test(s)) return false;
  let depth = 0; for (const ch of s){ if (ch === '(') depth++; else if (ch === ')'){ depth--; if (depth < 0) return false; } } if (depth) return false;
  const digits = {}; for (const m of s.replace(/\[[^\]]*\]/g, 'A').matchAll(/\d/g)) digits[m[0]] = (digits[m[0]] || 0) + 1;
  return Object.values(digits).every(n => n % 2 === 0);
}
function clear(n){ while (n.firstChild) n.removeChild(n.firstChild); }
function degrees(v){ return (v > 0 ? '+' : '') + v + ' C'; }
function tierColor(C, t){ return t >= 6 ? C.coral : t >= 4 ? C.gold : t >= 2 ? C.blue : C.grey; }

/* ------------------------------------------------------------------ */
/* the boiling-point chart: bars out from the zero line                 */
/* ------------------------------------------------------------------ */
function drawBP(api, mols, o){
  o = o || {};
  const C = api.colors, svg = api.svg;
  const rows = mols.length, RH = 34, W = 700, H = rows * RH + 46;
  const Lx = 150, R = 676, lo = -60, hi = 260;
  const x = v => Lx + (v - lo) / (hi - lo) * (R - Lx);
  const root = svg('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': o.label || 'boiling points in degrees Celsius', style: { width: '100%', height: 'auto', display: 'block' } });
  for (let v = -50; v <= 250; v += 50){
    root.append(svg('line', { x1: x(v).toFixed(1), y1: 16, x2: x(v).toFixed(1), y2: rows * RH + 20, stroke: C.line, 'stroke-opacity': v === 0 ? .9 : .35, 'stroke-width': v === 0 ? 1.4 : 1 }));
    root.append(svg('text', { x: x(v).toFixed(1), y: rows * RH + 34, fill: C.ink3, 'font-family': MONO, 'font-size': 10, 'text-anchor': 'middle', text: String(v) }));
  }
  root.append(svg('text', { x: R, y: 12, fill: C.ink3, 'font-family': MONO, 'font-size': 10, 'text-anchor': 'end', text: 'boiling point, degrees Celsius' }));
  mols.forEach((m, i) => {
    const y = 22 + i * RH, col = tierColor(C, m.tier);
    const a = Math.min(x(0), x(m.bp)), w = Math.abs(x(m.bp) - x(0));
    root.append(svg('rect', { x: a.toFixed(1), y: y.toFixed(1), width: Math.max(2, w).toFixed(1), height: 16, rx: 4, fill: col, 'fill-opacity': o.lit === i ? .95 : .65 }));
    root.append(svg('text', { x: Lx - 8, y: (y + 13).toFixed(1), fill: o.lit === i ? C.goldhi : C.ink, 'font-family': SERIF, 'font-size': 14, 'text-anchor': 'end', text: m.name }));
    root.append(svg('text', { x: (m.bp >= 0 ? x(m.bp) + 6 : x(m.bp) - 6).toFixed(1), y: (y + 13).toFixed(1), fill: C.ink2, 'font-family': MONO, 'font-size': 11, 'text-anchor': m.bp >= 0 ? 'start' : 'end', text: degrees(m.bp) }));
  });
  return root;
}

/* ------------------------------------------------------------------ */
/* generators (pure). Every answer is the curated number, and an item   */
/* is only offered when the taught rule picks that same answer.         */
/* ------------------------------------------------------------------ */
function genBP(rng){
  for (let tryN = 0; tryN < 60; tryN++){
    const four = shuffleWith(rng, MOL).slice(0, 4);
    const ans = four.reduce((a, b) => a.bp > b.bp ? a : b);
    const rest = four.filter(m => m !== ans);
    if (!rest.every(m => ans.bp - m.bp >= 8)) continue;      // the data has to be clear
    if (!rest.every(m => beats(ans, m))) continue;           // and the rule has to agree with the data
    return { kind: 'bp', ans, choices: shuffleWith(rng, four.map(m => ({ smiles: m.smiles, label: m.name, ok: m === ans, mol: m }))) };
  }
  return null;
}
function genSol(rng){
  for (let tryN = 0; tryN < 60; tryN++){
    const four = shuffleWith(rng, MOL).slice(0, 4);
    const ans = four.reduce((a, b) => a.sol > b.sol ? a : b);
    const rest = four.filter(m => m !== ans);
    if (!ans.pol) continue;
    if (!rest.every(m => ans.sol > m.sol)) continue;          // one clear winner
    if (!rest.every(m => cpp(ans) < cpp(m))) continue;        // and the carbons-per-polar-group rule agrees
    return { kind: 'sol', ans, choices: shuffleWith(rng, four.map(m => ({ smiles: m.smiles, label: m.name, ok: m === ans, mol: m }))) };
  }
  return null;
}
function genGroup(rng){
  const m = pickWith(rng, MOL);
  const others = shuffleWith(rng, Object.keys(GROUP_TIER).filter(g => g !== m.group)).slice(0, 3);
  return { kind: 'group', ans: m, choices: shuffleWith(rng, [{ text: m.group, ok: true }, ...others.map(g => ({ text: g, ok: false }))]) };
}
function some(rng, k){
  let g = null;
  while (!g) g = k === 0 ? genBP(rng) : k === 1 ? genSol(rng) : genGroup(rng);
  return g;
}
function coachFor(g){
  if (g.kind === 'group') return 'That drawing is ' + withArticle(g.ans.group) + ': ' + GROUP_TELL[g.ans.group];
  if (g.kind === 'sol'){
    return 'Water solubility needs a hydrogen bond and dies past about four carbons per polar group. ' + g.ans.name + ' runs ' + (Math.round(cpp(g.ans) * 10) / 10) + ' carbons per polar group, the lowest of the four.';
  }
  const a = g.ans, rest = g.choices.filter(c => !c.ok).map(c => c.mol);
  if (rest.every(m => m.tier < a.tier)){
    if (a.tier === 6) return 'A carboxylic acid pairs up two at a time, two hydrogen bonds at once, so it boils highest here. Grip beats size.';
    if (a.tier === 7) return 'An amide has N-H donors and the hungriest C=O on the page, so nothing organic grips harder. ' + a.name + ' boils at ' + a.bp + '.';
    if (a.tier >= 4) return a.name + ' is the only one here with a hydrogen on its oxygen or nitrogen, so it is the only one hydrogen bonding to its own kind. Grip beats size.';
    return a.name + ' has the strongest dipole of the four, and a dipole beats plain surface area.';
  }
  if (rest.every(m => m.tier === a.tier && m.C < a.C)) return 'Same grip on all four, so size decides: ' + a.name + ' has the most carbons, so it has the most surface touching.';
  if (rest.every(m => m.tier === a.tier && m.C === a.C)) return 'Same grip and the same carbon count, so branching decides: ' + a.name + ' is the straightest, and straight molecules touch along their whole length.';
  return 'Grip first, then size. ' + a.name + ' has the strongest grip of the four, and it boils at ' + a.bp + '.';
}
function withArticle(g){ return (/^[aeiou]/.test(g) ? 'an ' : 'a ') + g; }

/* ------------------------------------------------------------------ */
/* makeItem for the Summit                                              */
/* ------------------------------------------------------------------ */
function toSummit(g){
  const base = { sub: null, reagent: null, prod: null, coach: coachFor(g), home: meta.id, roots: ROOTS, source: 'generated' };
  if (g.kind === 'group') return Object.assign(base, { stem: 'Which functional group is drawn here?', sub: g.ans.smiles, choices: g.choices.map(c => ({ text: c.text, smiles: null })), correct: g.choices.findIndex(c => c.ok) });
  if (g.kind === 'sol') return Object.assign(base, { stem: 'Which of these is the most soluble in water?', choices: g.choices.map(c => ({ text: '', smiles: c.smiles })), correct: g.choices.findIndex(c => c.ok) });
  return Object.assign(base, { stem: 'Which of these has the highest boiling point?', choices: g.choices.map(c => ({ text: '', smiles: c.smiles })), correct: g.choices.findIndex(c => c.ok) });
}
function trimBank(api, it){
  const item = api.bank.toItem(it);
  if (item.choices.length > 4){
    const keep = item.choices[item.correct];
    const rest = api.shuffle(item.choices.filter((c, i) => i !== item.correct)).slice(0, 3);
    const choices = api.shuffle([keep, ...rest]);
    item.choices = choices; item.correct = choices.indexOf(keep);
  }
  item.home = meta.id; item.roots = ROOTS;
  return item;
}
export function makeItem(api){
  const bank = api.bank && api.bank.items ? api.bank.items(meta.id) : [];
  if (bank.length && api.rng() < 0.3) return trimBank(api, api.pick(bank));
  const r = api.rng();
  return toSummit(some(api.rng, r < 0.38 ? 0 : r < 0.7 ? 1 : 2));
}

/* ------------------------------------------------------------------ */
/* mount                                                                */
/* ------------------------------------------------------------------ */
export function mount(slots, api){
  const C = api.colors, el = api.el;

  /* ---------- VISUAL: put four molecules in boiling order ---------- */
  let set = SETS[0], order = [], checked = false;
  const chips = el('div', { class: 'controls', style: { marginTop: '0' } });
  const point = el('p', { style: { margin: '12px 0 6px', fontSize: '16px', color: C.ink2, fontFamily: SERIF } });
  const cards = el('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(158px, 1fr))', gap: '10px' } });
  const ladder = el('div', { style: { display: 'grid', gap: '8px', margin: '14px 0 0' } });
  const rowHosts = {};
  for (const r of FORCE_ROW.slice().reverse()){
    const box = el('div', { style: { border: '1px solid ' + C.line, borderLeft: '3px solid ' + (r.id === 'hbond' ? C.gold : r.id === 'dipole' ? C.blue : C.grey), borderRadius: '9px', padding: '8px 12px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' } });
    const head = el('div', { style: { minWidth: '190px' } },
      el('div', { style: { fontFamily: SERIF, fontSize: '16px', color: r.id === 'hbond' ? C.goldhi : C.ink }, text: r.name }),
      el('div', { style: { fontSize: '12px', color: C.ink3 }, text: r.line }));
    const host = el('div', { style: { display: 'flex', gap: '6px', flexWrap: 'wrap' } });
    rowHosts[r.id] = host;
    box.append(head, host); ladder.append(box);
  }
  const answerRow = el('div', { style: { fontFamily: SERIF, fontSize: '16px', color: C.ink, margin: '14px 0 0', minHeight: '1.5em' } });
  const btns = el('div', { class: 'controls' });
  const btnCheck = el('button', { type: 'button', class: 'primary', text: 'Check the order', onclick(){ if (order.length === 4){ checked = true; paint(); } } });
  const btnClear = el('button', { type: 'button', class: 'secondary', text: 'Clear', onclick(){ order = []; checked = false; paint(); } });
  btns.append(btnCheck, btnClear);
  const chartHost = el('div', { style: { marginTop: '10px' } });
  const verdict = el('div', { style: { fontFamily: SERIF, fontSize: '17px', paddingLeft: '10px', margin: '10px 0 0', color: C.goldhi } });
  slots.visual.append(chips, point, cards, answerRow, btns, ladder, chartHost, verdict);

  function mols(){ return set.ids.map(i => BY[i]); }
  function truth(){ return mols().slice().sort((a, b) => a.bp - b.bp); }
  function paint(){
    const list = mols(), t = truth();
    point.textContent = checked ? set.point : 'Tap the four molecules in order, lowest boiling point first. Tap one again to take it back.';
    clear(cards);
    for (const m of list){
      const at = order.indexOf(m.id);
      const right = checked && at >= 0 && t[at].id === m.id;
      const card = el('button', { type: 'button', 'aria-pressed': String(at >= 0), 'aria-label': m.name + (at >= 0 ? ', placed at position ' + (at + 1) : ', not placed'),
        style: { textAlign: 'left', padding: '8px', borderRadius: '10px', background: at >= 0 ? 'rgba(201,168,76,.09)' : 'rgba(255,255,255,.02)', border: '1px solid ' + (checked ? (right ? C.green : C.amber) : at >= 0 ? C.gold : C.line), cursor: 'pointer', minHeight: '44px' },
        onclick(){ if (checked) return; const k = order.indexOf(m.id); if (k >= 0) order.splice(k, 1); else if (order.length < 4) order.push(m.id); paint(); } });
      const top = el('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px' } },
        el('span', { style: { fontFamily: SERIF, fontSize: '15px', color: C.ink }, text: m.name }),
        el('span', { style: { fontFamily: MONO, fontSize: '13px', width: '24px', height: '24px', flex: 'none', borderRadius: '50%', display: 'grid', placeItems: 'center', border: '1px solid ' + (at >= 0 ? C.gold : C.line), color: at >= 0 ? C.goldhi : C.ink3 }, text: at >= 0 ? String(at + 1) : '' }));
      const pic = el('div', {}); api.drawSmiles(pic, m.smiles, { width: 158, height: 96, label: m.name });
      card.append(top, pic);
      if (checked) card.append(el('div', { style: { fontFamily: MONO, fontSize: '12px', color: right ? C.green : C.amber }, text: degrees(m.bp) }));
      cards.append(card);
    }
    answerRow.textContent = order.length ? 'Lowest to highest: ' + order.map(i => BY[i].name).join(', ') + (order.length < 4 ? ', and ' + (4 - order.length) + ' to go' : '') : '';
    btnCheck.disabled = order.length !== 4 || checked;
    for (const r of FORCE_ROW) clear(rowHosts[r.id]);
    for (const m of list){
      const on = order.includes(m.id);
      rowHosts[rowOf(m).id].append(el('span', { style: { fontFamily: MONO, fontSize: '12px', padding: '5px 10px', borderRadius: '999px', border: '1px solid ' + (on ? C.gold : C.line), color: on ? C.goldhi : C.ink2, background: on ? 'rgba(201,168,76,.1)' : 'transparent' }, text: m.name + (checked ? ' ' + degrees(m.bp) : '') }));
    }
    clear(chartHost);
    if (checked) chartHost.append(drawBP(api, t, { label: 'the four boiling points in order' }));
    const gotIt = checked && order.every((id, i) => t[i].id === id);
    verdict.textContent = !checked ? '' : gotIt ? 'That is the order. ' + TIER_NOTE[t[3].tier] : 'Not yet. The real order is ' + t.map(m => m.name).join(', then ') + '. ' + TIER_NOTE[t[3].tier];
    verdict.style.color = gotIt ? C.green : C.goldhi;
    verdict.style.borderLeft = checked ? '3px solid ' + (gotIt ? C.green : C.gold) : 'none';
  }
  function show(s){ set = s; order = []; checked = false; for (const b of chips.children) if (b.dataset) b.setAttribute('aria-pressed', String(b.dataset.id === s.id)); paint(); }
  for (const s of SETS) chips.append(el('button', { type: 'button', class: 'chip', text: s.name, dataset: { id: s.id }, 'aria-pressed': 'false', onclick: () => show(s) }));
  show(set);

  /* ---------- YOU TRY ---------- */
  const bank = api.bank && api.bank.items ? api.bank.items(meta.id) : [];
  let turn = 0;
  function generated(){
    const k = (turn - 1) % 3;
    const g = some(api.rng, k);
    if (g.kind === 'group'){
      const node = el('div', { style: { maxWidth: '280px' } }); api.drawSmiles(node, g.ans.smiles, { width: 260, height: 150, label: 'a structure' });
      return { prompt: 'Which functional group is this?', node, choices: g.choices, coach: coachFor(g) };
    }
    return { prompt: g.kind === 'bp' ? 'Which of these has the highest boiling point?' : 'Which of these is the most soluble in water?', node: null, choices: g.choices, coach: coachFor(g) };
  }
  function fromBank(it){
    const t = api.bank.toItem(it);
    let node = null;
    if (t.sub){ node = el('div', { style: { maxWidth: '280px' } }); api.drawSmiles(node, t.sub, { width: 260, height: 160, label: 'the structure in the question' }); }
    return { prompt: t.stem, node, choices: t.choices.map((c, i) => ({ text: c.text, smiles: c.smiles, ok: i === t.correct })), coach: t.coach, source: 'bank' };
  }
  runTry(slots.try, api, () => { turn++; if (bank.length && turn % 4 === 0) return fromBank(api.pick(bank)); return generated(); });
}

/* ------------------------------------------------------------------ */
/* the you-try harness                                                  */
/* ------------------------------------------------------------------ */
function runTry(host, api, nextItem){
  const el = api.el, C = api.colors;
  function show(){
    clear(host); api.clearCoach();
    const item = nextItem();
    const box = el('div', { class: 'item' });
    if (item.source === 'bank') box.append(el('span', { class: 'eyebrow', text: 'From the verified bank, DAT phrasing', style: { display: 'block', marginBottom: '6px' } }));
    box.append(el('p', { class: 'prompt', text: item.prompt, style: { whiteSpace: 'pre-line' } }));
    if (item.node) box.append(item.node);
    const verdict = el('div', { class: 'verdict', style: { minHeight: '1.4em' } });
    const actions = el('div', { class: 'controls' });
    const another = el('button', { class: 'primary', type: 'button', text: 'Another one', onclick: show });
    let reported = false, done = false, missed = false;
    const settle = ok => {
      if (!reported){ reported = true; api.report(ok); }
      if (ok){ done = true; verdict.className = 'verdict good'; verdict.textContent = missed ? 'There it is.' : 'You can read it.'; actions.append(another); another.focus(); }
      else { missed = true; verdict.className = 'verdict notyet'; verdict.textContent = 'Not yet.'; }
    };
    const opts = el('div', { class: 'opts' });
    const btns = []; let picked = -1;
    const check = el('button', { class: 'primary', type: 'button', text: 'Check', onclick(){
      if (picked < 0 || done) return;
      const ok = item.choices[picked].ok;
      if (ok){ btns[picked].classList.add('ok'); btns.forEach(x => { x.disabled = true; }); check.remove(); settle(true); }
      else { btns[picked].classList.remove('picked'); btns[picked].disabled = true; picked = -1; check.disabled = true; api.coach(item.coach); settle(false); }
    } });
    check.disabled = true;
    item.choices.forEach((c, i) => {
      const bodyEl = el('span', { style: { minWidth: '0' } });
      if (c.smiles){ const w = el('span', { style: { display: 'block', maxWidth: '230px' } }); api.drawSmiles(w, c.smiles, { width: 220, height: 130, label: c.label || 'a structure' }); bodyEl.append(w); }
      else if (c.node){ const w = el('span', { style: { display: 'block', maxWidth: '360px' } }); w.append(c.node); bodyEl.append(w); }
      if (c.text) bodyEl.append(el('span', { text: c.text, style: c.smiles ? { display: 'block', fontFamily: MONO, fontSize: '12px', color: C.ink3 } : {} }));
      else if (c.label) bodyEl.append(el('span', { text: c.label, style: { display: 'block', fontFamily: MONO, fontSize: '12px', color: C.ink3 } }));
      const bt = el('button', { class: 'opt', type: 'button', 'aria-label': c.text || c.label || ('choice ' + 'ABCDE'[i]), onclick(){ if (done || bt.disabled) return; picked = i; btns.forEach((x, j) => x.classList.toggle('picked', j === i)); check.disabled = false; } },
        el('span', { class: 'k', text: 'ABCDE'[i] }), bodyEl);
      btns.push(bt); opts.append(bt);
    });
    box.append(opts, verdict, actions);
    actions.append(check);
    host.append(box);
    if (host.dataset.started) btns[0].focus();
    host.dataset.started = '1';
  }
  show();
}

/* ------------------------------------------------------------------ */
/* selfTest (node-safe)                                                 */
/* ------------------------------------------------------------------ */
function tinyApi(deps, seed){
  const rng = makeRng(seed);
  return { rng, seed(){}, pick(a){ return a[Math.floor(rng() * a.length)]; }, shuffle(a){ return shuffleWith(rng, a); }, reactions: deps && deps.reactions, bank: (deps && deps.bank) || { items: () => [], toItem: x => x } };
}
export function selfTest(deps){
  let tried = 0;
  // 0. the anchors Thomas quotes out loud, checked one by one
  const ANCHOR = { butane: 0, ether: 35, butanol: 118, propanoicacid: 141, pentane: 36, neopentane: 10, ethanol: 78, dimethylether: -24 };
  for (const [id, bp] of Object.entries(ANCHOR)){
    if (!BY[id]) return { ok: false, tried, notes: 'the table is missing ' + id };
    if (BY[id].bp !== bp) return { ok: false, tried, notes: id + ' should boil at ' + bp + ' but the table says ' + BY[id].bp };
  }
  // 1. the table proves itself
  if (MOL.length < 30) return { ok: false, tried, notes: 'table too small' };
  const seen = new Set();
  for (const m of MOL){
    if (seen.has(m.id)) return { ok: false, tried, notes: 'duplicate id ' + m.id };
    seen.add(m.id);
    if (!smilesSane(m.smiles) || !SMILES.includes(m.smiles)) return { ok: false, tried, notes: m.id + ': smiles not listed or not sane' };
    if (!GROUP_TIER[m.group] || !GROUP_TELL[m.group]) return { ok: false, tried, notes: m.id + ': unknown group ' + m.group };
    const want = (m.group === 'amine' && !m.hb) ? 2 : GROUP_TIER[m.group];
    if (m.tier !== want) return { ok: false, tried, notes: m.id + ': tier ' + m.tier + ' does not match its group' };
    if (!rowOf(m)) return { ok: false, tried, notes: m.id + ': no force row' };
    if (m.tier >= 4 && !m.hb) return { ok: false, tried, notes: m.id + ': hydrogen bonding with nothing to donate' };
    if (m.tier <= 3 && m.hb) return { ok: false, tried, notes: m.id + ': a donor that is not on the hydrogen bonding row' };
    if (!(m.sol >= 0 && m.sol <= 3)) return { ok: false, tried, notes: m.id + ': solubility out of range' };
    if (!m.pol && m.sol > 1) return { ok: false, tried, notes: m.id + ': soluble with nothing polar on it' };
    if (!(m.bp > -60 && m.bp < 260)) return { ok: false, tried, notes: m.id + ': boiling point off the chart' };
    if (!(m.C >= 1 && m.C <= 8)) return { ok: false, tried, notes: m.id + ': carbon count out of range' };
  }
  // the four carbons per polar group rule has to hold where the table claims it does
  for (const m of MOL){
    if (m.pol && cpp(m) <= 2 && m.sol < 2) return { ok: false, tried, notes: m.id + ': tiny and polar but not called soluble' };
    if (m.pol && cpp(m) >= 6 && m.sol === 3) return { ok: false, tried, notes: m.id + ': greasy but called fully miscible' };
  }
  for (const r of FORCE_ROW) if (!MOL.some(m => rowOf(m).id === r.id)) return { ok: false, tried, notes: 'nothing on the ' + r.id + ' row' };
  for (const g of Object.keys(GROUP_TIER)) if (!MOL.some(m => m.group === g)) return { ok: false, tried, notes: 'no molecule is ' + withArticle(g) };
  // 2. every set really is in boiling order, and the ladder point it makes is true
  if (SETS.length < 5) return { ok: false, tried, notes: 'not enough sets' };
  for (const s of SETS){
    if (s.ids.length !== 4) return { ok: false, tried, notes: s.id + ': a set is four molecules' };
    if (new Set(s.ids).size !== 4) return { ok: false, tried, notes: s.id + ': a repeated molecule' };
    for (const id of s.ids) if (!BY[id]) return { ok: false, tried, notes: s.id + ': unknown molecule ' + id };
    const bps = s.ids.map(i => BY[i].bp);
    for (let i = 1; i < bps.length; i++) if (!(bps[i] > bps[i - 1])) return { ok: false, tried, notes: s.id + ': not listed in boiling order' };
    if (!s.point) return { ok: false, tried, notes: s.id + ': no point' };
  }
  // 3. generators: the rule and the data agree on every item that gets offered
  const rng = makeRng(20260904);
  for (let k = 0; k < 300; k++){
    const g = some(rng, k % 3);
    const oks = g.choices.filter(c => c.ok);
    if (oks.length !== 1 || g.choices.length !== 4) return { ok: false, tried, notes: g.kind + ': answer not unique or not four choices' };
    if (new Set(g.choices.map(c => c.smiles || c.text)).size !== 4) return { ok: false, tried, notes: g.kind + ': duplicate choices' };
    if (g.kind === 'bp'){
      const rest = g.choices.filter(c => !c.ok).map(c => c.mol);
      if (!rest.every(m => g.ans.bp - m.bp >= 8)) return { ok: false, tried, notes: 'bp: the answer is not clearly highest' };
      if (!rest.every(m => beats(g.ans, m))) return { ok: false, tried, notes: 'bp: the rule disagrees with the table' };
    }
    if (g.kind === 'sol'){
      const rest = g.choices.filter(c => !c.ok).map(c => c.mol);
      if (!rest.every(m => g.ans.sol > m.sol && cpp(g.ans) < cpp(m))) return { ok: false, tried, notes: 'sol: the rule disagrees with the table' };
    }
    if (g.kind === 'group' && oks[0].text !== g.ans.group) return { ok: false, tried, notes: 'group mismatch' };
    if (!coachFor(g)) return { ok: false, tried, notes: g.kind + ': empty coach' };
    tried++;
  }
  // 4. makeItem for the Summit
  const api = tinyApi(deps, 77);
  for (let k = 0; k < 240; k++){
    const it = makeItem(api); tried++;
    if (!it || !Array.isArray(it.choices) || it.choices.length !== 4) return { ok: false, tried, notes: 'makeItem: not four choices' };
    if (!(it.correct >= 0 && it.correct < 4)) return { ok: false, tried, notes: 'makeItem: bad correct index' };
    if (new Set(it.choices.map(c => c.smiles || c.text)).size !== 4) return { ok: false, tried, notes: 'makeItem: duplicate choices' };
    for (const c of it.choices) if (c.smiles && !smilesSane(c.smiles)) return { ok: false, tried, notes: 'makeItem: bad smiles ' + c.smiles };
    if (it.sub && !smilesSane(it.sub)) return { ok: false, tried, notes: 'makeItem: bad sub' };
    if (!it.coach || !it.stem) return { ok: false, tried, notes: 'makeItem: empty coach or stem' };
    if (it.home !== meta.id || !it.roots || !it.roots.length) return { ok: false, tried, notes: 'makeItem: home/roots' };
  }
  const a = makeItem(tinyApi(deps, 5)), b = makeItem(tinyApi(deps, 5));
  if (JSON.stringify(a) !== JSON.stringify(b)) return { ok: false, tried, notes: 'same seed gave a different item' };
  return { ok: true, tried, notes: MOL.length + ' molecules with real boiling points; every generated ranking checked against the grip rule and against the table' };
}
