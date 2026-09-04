// The Tree of Organic · Level 7 · Module 3: The carbonyl carbon lives up high (13C)
// ES module, no imports. Structures are drawn by the shell from SMILES; the
// ladder and the stick spectrum are SVG built here from a curated shift table.

export const SMILES = [
  'CO', 'CCO', 'CCCO', 'CCCCO', 'CC(C)O', 'CC(C)(C)O', 'CCOCC', 'CC(C)=O', 'CCC(C)=O', 'CCC(=O)CC',
  'CCC=O', 'C1CCC(=O)CC1', 'CC(=O)O', 'CCCC(=O)O', 'COC(C)=O', 'CCOC(C)=O', 'CC(N)=O', 'c1ccccc1', 'Cc1ccccc1', 'Cc1ccc(C)cc1',
  'CCc1ccccc1', 'c1ccc(C=O)cc1', 'CC(=O)c1ccccc1', 'OC(=O)c1ccccc1', 'C1CCCCC1', 'C1=CCCCC1', 'CC=C', 'CC(C)(C)C'
];

export const meta = {
  id: 't7-cnmr',
  level: 7,
  order: 3,
  needs3D: false,
  title: 'The carbonyl carbon lives up high',
  concept: '13C NMR: the ladder of regions',
  tagline: 'One line past 190 and you already know there is a ketone or an aldehyde in the molecule.',
  story: 'Carbon NMR runs 0 to 220, and the top of that ladder is the giveaway. A ketone or aldehyde carbonyl sits at 190 to 220. Put an oxygen or a nitrogen on that same carbonyl and it slides down to 160 to 185: an acid, an ester or an amide. sp2 carbons, ring or alkene, sit at 110 to 150. A carbon bonded to oxygen or nitrogen sits at 50 to 90. Plain alkyl sits at 5 to 50. Then count the lines: that is how many different carbons there are, and symmetry folds the equal ones onto one line. Rule of thumb: read the top of the ladder first, then count.',
  moveName: 'Top of the ladder first, then count the lines',
  move: [
    'Look at the top of the ladder. A line past 190 is a ketone or an aldehyde carbonyl.',
    'A line from 160 to 185 is a carbonyl carrying an oxygen or a nitrogen: an acid, an ester or an amide.',
    'Read the rest: 110 to 150 is sp2, 50 to 90 is a carbon bonded to oxygen or nitrogen, 5 to 50 is plain alkyl.',
    'Count the lines. That is the number of different carbons, and symmetry folds equal carbons onto one line.'
  ],
  trap: 'Careful: never mix the two NMR scales. An aldehyde hydrogen shows up near 9 or 10 on the proton axis, but the aldehyde carbon shows up near 195 on the carbon axis, and 9 on a carbon axis is just a plain alkyl carbon.',
  holdsUp: ['Ketone versus ester', 'Symmetry counting', 'Unknown structure problems', 'Aromatic substitution patterns'],
  drill: 'Booster OChem: Spectroscopy & Lab Techniques'
};

const SERIF = 'Georgia, "Times New Roman", serif';
const MONO = 'ui-monospace, "SF Mono", Menlo, monospace';
const ROOTS = ['l1-skeletal', 'l1-groups'];

/* ------------------------------------------------------------------ */
/* The ladder. Five bands, bottom to top, with the gaps left empty on   */
/* purpose: the empty stretches are what make the top of the scale read */
/* at a glance.                                                         */
/* ------------------------------------------------------------------ */
const BANDS = [
  { id: 'alkyl', lo: 5, hi: 50, name: 'plain alkyl', line: 'A carbon with only carbons and hydrogens on it.' },
  { id: 'nextO', lo: 50, hi: 90, name: 'next to O or N', line: 'A carbon single bonded to an oxygen or a nitrogen.' },
  { id: 'sp2', lo: 110, hi: 150, name: 'sp2: ring or alkene', line: 'A carbon inside a double bond or an aromatic ring.' },
  { id: 'acidCO', lo: 160, hi: 185, name: 'acid, ester, amide C=O', line: 'A carbonyl with an oxygen or a nitrogen on it. The neighbor shares, so the carbon slides down.' },
  { id: 'ketoneCO', lo: 190, hi: 220, name: 'ketone or aldehyde C=O', line: 'A carbonyl with only carbon and hydrogen around it. The loudest clue on the page.' }
];
const BAND = {}; for (const b of BANDS) BAND[b.id] = b;
// the five things a 13C alone can honestly tell you, in the order the ladder is read
const CATS = ['a ketone or an aldehyde', 'an ester, an acid or an amide', 'an alkene or an aromatic ring', 'an alcohol or an ether', 'an alkane'];
function catFromBands(kinds){
  if (kinds.has('ketoneCO')) return CATS[0];
  if (kinds.has('acidCO')) return CATS[1];
  if (kinds.has('sp2')) return CATS[2];
  if (kinds.has('nextO')) return CATS[3];
  return CATS[4];
}

/* ------------------------------------------------------------------ */
/* The curated table. C is every LINE (not every atom), sorted from     */
/* high ppm to low. n = how many carbons of the molecule fold onto that */
/* line, so the n values must add up to the carbon count of the formula.*/
/* low = a quaternary or carbonyl carbon, which draws a short peak.     */
/* frags = the condensed structure, each piece pointing at its line.    */
/* ------------------------------------------------------------------ */
const L = (ppm, band, n, label, o) => Object.assign({ ppm, band, n, label }, o || {});
const CN = [
  { id: 'methanol', name: 'methanol', smiles: 'CO', cat: CATS[3],
    C: [L(50.3, 'nextO', 1, 'the CH3 on the oxygen')], frags: [['CH3', 0], ['OH', null]],
    tell: 'One line, and it sits at 50 because the oxygen pulls that carbon out of the alkyl region.' },
  { id: 'ethanol', name: 'ethanol', smiles: 'CCO', cat: CATS[3],
    C: [L(57.9, 'nextO', 1, 'the CH2 bonded to the oxygen'), L(18.4, 'alkyl', 1, 'the CH3')], frags: [['CH3', 1], ['CH2', 0], ['OH', null]],
    tell: 'Two lines. The one at 58 is the carbon holding the oxygen; the one at 18 is the plain methyl.' },
  { id: 'propanol', name: '1-propanol', smiles: 'CCCO', cat: CATS[3],
    C: [L(64.5, 'nextO', 1, 'the CH2 bonded to the oxygen'), L(25.8, 'alkyl', 1, 'the middle CH2'), L(10.2, 'alkyl', 1, 'the CH3')], frags: [['CH3', 2], ['CH2', 1], ['CH2', 0], ['OH', null]],
    tell: 'Three carbons, three lines: no symmetry to fold anything. Only the carbon on the oxygen leaves the alkyl band.' },
  { id: 'butanol', name: '1-butanol', smiles: 'CCCCO', cat: CATS[3],
    C: [L(62.6, 'nextO', 1, 'the CH2 bonded to the oxygen'), L(34.9, 'alkyl', 1, 'the CH2 next to that one'), L(19.2, 'alkyl', 1, 'the third CH2'), L(13.9, 'alkyl', 1, 'the CH3')], frags: [['CH3', 3], ['CH2', 2], ['CH2', 1], ['CH2', 0], ['OH', null]],
    tell: 'Four lines for four carbons. The farther a carbon sits from the oxygen, the lower it drops.' },
  { id: 'isopropanol', name: '2-propanol', smiles: 'CC(C)O', cat: CATS[3],
    C: [L(64.3, 'nextO', 1, 'the CH holding the oxygen'), L(25.2, 'alkyl', 2, 'both CH3, equal by symmetry')], frags: [['CH3', 1], ['CH', 0], ['(OH)', null], ['CH3', 1]],
    tell: 'Three carbons, two lines. The two methyls are mirror images of each other, so they land on one line.' },
  { id: 'tbutanol', name: 'tert-butanol', smiles: 'CC(C)(C)O', cat: CATS[3],
    C: [L(69.0, 'nextO', 1, 'the carbon holding the oxygen', { low: true }), L(31.2, 'alkyl', 3, 'all three CH3, equal by symmetry')], frags: [['(CH3)3', 1], ['C', 0], ['OH', null]],
    tell: 'Four carbons, two lines. Three equal methyls fold together, and the carbon they sit on is short because it carries no hydrogens.' },
  { id: 'ether', name: 'diethyl ether', smiles: 'CCOCC', cat: CATS[3],
    C: [L(65.9, 'nextO', 2, 'both CH2 on the oxygen'), L(15.2, 'alkyl', 2, 'both CH3')], frags: [['CH3', 1], ['CH2', 0], ['O', null], ['CH2', 0], ['CH3', 1]],
    tell: 'Four carbons, two lines. The molecule folds in half at the oxygen, so each side gives the same two carbons.' },
  { id: 'acetone', name: 'acetone', smiles: 'CC(C)=O', cat: CATS[0],
    C: [L(206.6, 'ketoneCO', 1, 'the carbonyl carbon', { low: true }), L(30.8, 'alkyl', 2, 'both CH3, equal by symmetry')], frags: [['CH3', 1], ['C(=O)', 0], ['CH3', 1]],
    tell: 'The line at 207 is the whole story: past 190 means a ketone or an aldehyde. Two lines for three carbons is the symmetry.' },
  { id: 'butanone', name: '2-butanone', smiles: 'CCC(C)=O', cat: CATS[0],
    C: [L(208.9, 'ketoneCO', 1, 'the carbonyl carbon', { low: true }), L(36.8, 'alkyl', 1, 'the CH2 next to the carbonyl'), L(29.3, 'alkyl', 1, 'the CH3 on the carbonyl'), L(7.9, 'alkyl', 1, 'the CH3 of the ethyl')],
    frags: [['CH3', 3], ['CH2', 1], ['C(=O)', 0], ['CH3', 2]],
    tell: 'Four carbons, four lines, one of them at 209. No symmetry here, so nothing folds.' },
  { id: 'pentanone3', name: '3-pentanone', smiles: 'CCC(=O)CC', cat: CATS[0],
    C: [L(211.9, 'ketoneCO', 1, 'the carbonyl carbon', { low: true }), L(35.4, 'alkyl', 2, 'both CH2 next to the carbonyl'), L(7.8, 'alkyl', 2, 'both CH3')],
    frags: [['CH3', 2], ['CH2', 1], ['C(=O)', 0], ['CH2', 1], ['CH3', 2]],
    tell: 'Five carbons, three lines. The carbonyl sits in the middle, so the two ethyls are the same and fold together.' },
  { id: 'propanal', name: 'propanal', smiles: 'CCC=O', cat: CATS[0],
    C: [L(202.7, 'ketoneCO', 1, 'the aldehyde carbon'), L(36.7, 'alkyl', 1, 'the CH2'), L(5.2, 'alkyl', 1, 'the CH3')], frags: [['CH3', 2], ['CH2', 1], ['CHO', 0]],
    tell: 'An aldehyde carbon lands near 200, right beside a ketone. The carbon axis cannot separate them; the hydrogen at 9.8 can.' },
  { id: 'cyclohexanone', name: 'cyclohexanone', smiles: 'C1CCC(=O)CC1', cat: CATS[0],
    C: [L(211.5, 'ketoneCO', 1, 'the carbonyl carbon', { low: true }), L(41.9, 'alkyl', 2, 'both CH2 next to the carbonyl'), L(27.0, 'alkyl', 2, 'the two CH2 one step further'), L(25.0, 'alkyl', 1, 'the CH2 across the ring')],
    frags: [['C(=O)', 0], ['(CH2)2', 1], ['(CH2)2', 2], ['CH2', 3]],
    tell: 'Six carbons, four lines. The ring is symmetric down the middle, so the carbons pair up two by two.' },
  { id: 'aceticacid', name: 'acetic acid', smiles: 'CC(=O)O', cat: CATS[1],
    C: [L(178.1, 'acidCO', 1, 'the acid carbonyl carbon', { low: true }), L(20.8, 'alkyl', 1, 'the CH3')], frags: [['CH3', 1], ['COOH', 0]],
    tell: 'The carbonyl sits at 178, not past 190. The oxygen on it shares electrons, and that shove drops it into the 160 to 185 band.' },
  { id: 'butanoicacid', name: 'butanoic acid', smiles: 'CCCC(=O)O', cat: CATS[1],
    C: [L(180.6, 'acidCO', 1, 'the acid carbonyl carbon', { low: true }), L(36.2, 'alkyl', 1, 'the CH2 next to the carbonyl'), L(18.4, 'alkyl', 1, 'the middle CH2'), L(13.6, 'alkyl', 1, 'the CH3')],
    frags: [['CH3', 3], ['CH2', 2], ['CH2', 1], ['COOH', 0]],
    tell: 'Four lines and the carbonyl at 181. Ketone or acid is decided by one number: past 190 or not.' },
  { id: 'methylacetate', name: 'methyl acetate', smiles: 'COC(C)=O', cat: CATS[1],
    C: [L(171.3, 'acidCO', 1, 'the ester carbonyl carbon', { low: true }), L(51.5, 'nextO', 1, 'the O-CH3'), L(20.6, 'alkyl', 1, 'the CH3 on the carbonyl')],
    frags: [['CH3', 2], ['C(=O)', 0], ['O', null], ['CH3', 1]],
    tell: 'Three lines: the ester carbonyl at 171, the methyl sitting on the oxygen at 52, and the plain methyl at 21.' },
  { id: 'ethylacetate', name: 'ethyl acetate', smiles: 'CCOC(C)=O', cat: CATS[1],
    C: [L(171.0, 'acidCO', 1, 'the ester carbonyl carbon', { low: true }), L(60.4, 'nextO', 1, 'the O-CH2'), L(21.0, 'alkyl', 1, 'the CH3 on the carbonyl'), L(14.2, 'alkyl', 1, 'the CH3 of the ethyl')],
    frags: [['CH3', 3], ['CH2', 1], ['O', null], ['C(=O)', 0], ['CH3', 2]],
    tell: 'Four carbons, four lines. One at 171 for the ester carbonyl and one at 60 for the carbon sitting on the oxygen.' },
  { id: 'acetamide', name: 'acetamide', smiles: 'CC(N)=O', cat: CATS[1],
    C: [L(172.7, 'acidCO', 1, 'the amide carbonyl carbon', { low: true }), L(22.3, 'alkyl', 1, 'the CH3')], frags: [['CH3', 1], ['C(=O)', 0], ['NH2', null]],
    tell: 'A nitrogen on the carbonyl does the same job an oxygen does: it drags the carbon down to 173.' },
  { id: 'benzene', name: 'benzene', smiles: 'c1ccccc1', cat: CATS[2],
    C: [L(128.5, 'sp2', 6, 'all six ring carbons, one environment')], frags: [['C6H6', 0]],
    tell: 'Six carbons, one line. Maximum symmetry gives the shortest 13C on the DAT.' },
  { id: 'toluene', name: 'toluene', smiles: 'Cc1ccccc1', cat: CATS[2],
    C: [L(137.8, 'sp2', 1, 'the ring carbon carrying the methyl', { low: true }), L(129.0, 'sp2', 2, 'the two ring carbons beside it'), L(128.3, 'sp2', 2, 'the next two ring carbons'), L(125.3, 'sp2', 1, 'the ring carbon across from the methyl'), L(21.4, 'alkyl', 1, 'the CH3')],
    frags: [['CH3', 4], ['C6H5', [0, 1, 2, 3]]],
    tell: 'Seven carbons, five lines. One substituent on a ring gives four ring lines plus whatever is hanging off it.' },
  { id: 'pxylene', name: 'p-xylene', smiles: 'Cc1ccc(C)cc1', cat: CATS[2],
    C: [L(134.6, 'sp2', 2, 'both ring carbons carrying a methyl', { low: true }), L(129.0, 'sp2', 4, 'all four ring C-H carbons'), L(21.0, 'alkyl', 2, 'both CH3')],
    frags: [['CH3', 2], ['C6H4', [0, 1]], ['CH3', 2]],
    tell: 'Eight carbons, three lines. Para symmetry is the most folding a benzene ring can do with two groups.' },
  { id: 'ethylbenzene', name: 'ethylbenzene', smiles: 'CCc1ccccc1', cat: CATS[2],
    C: [L(144.3, 'sp2', 1, 'the ring carbon carrying the ethyl', { low: true }), L(128.3, 'sp2', 2, 'two ring C-H carbons'), L(127.9, 'sp2', 2, 'the other two ring C-H carbons'), L(125.6, 'sp2', 1, 'the ring carbon across from the ethyl'), L(28.9, 'alkyl', 1, 'the CH2'), L(15.6, 'alkyl', 1, 'the CH3')],
    frags: [['CH3', 5], ['CH2', 4], ['C6H5', [0, 1, 2, 3]]],
    tell: 'Six lines. Compare p-xylene: same formula, three lines. Line count alone separates those two isomers.' },
  { id: 'benzaldehyde', name: 'benzaldehyde', smiles: 'c1ccc(C=O)cc1', cat: CATS[0],
    C: [L(192.4, 'ketoneCO', 1, 'the aldehyde carbon'), L(136.4, 'sp2', 1, 'the ring carbon carrying the CHO', { low: true }), L(134.4, 'sp2', 1, 'the ring carbon across from the CHO'), L(129.7, 'sp2', 2, 'the two ring carbons beside the CHO'), L(128.9, 'sp2', 2, 'the other two ring carbons')],
    frags: [['C6H5', [1, 2, 3, 4]], ['CHO', 0]],
    tell: 'One line past 190 and four lines in the ring region. Aldehyde plus a single-substituted ring, read straight off the ladder.' },
  { id: 'acetophenone', name: 'acetophenone', smiles: 'CC(=O)c1ccccc1', cat: CATS[0],
    C: [L(198.1, 'ketoneCO', 1, 'the ketone carbonyl carbon', { low: true }), L(137.1, 'sp2', 1, 'the ring carbon carrying the carbonyl', { low: true }), L(133.1, 'sp2', 1, 'the ring carbon across from the carbonyl'), L(128.6, 'sp2', 2, 'two ring C-H carbons'), L(128.3, 'sp2', 2, 'the other two ring C-H carbons'), L(26.6, 'alkyl', 1, 'the CH3')],
    frags: [['CH3', 5], ['C(=O)', 0], ['C6H5', [1, 2, 3, 4]]],
    tell: 'Eight carbons, six lines, one at 198. The ring next door drags the carbonyl a little lower than acetone, but it is still past 190.' },
  { id: 'benzoicacid', name: 'benzoic acid', smiles: 'OC(=O)c1ccccc1', cat: CATS[1],
    C: [L(172.6, 'acidCO', 1, 'the acid carbonyl carbon', { low: true }), L(133.8, 'sp2', 1, 'the ring carbon across from the COOH'), L(130.2, 'sp2', 2, 'the two ring carbons beside the COOH'), L(129.4, 'sp2', 1, 'the ring carbon carrying the COOH', { low: true }), L(128.5, 'sp2', 2, 'the other two ring carbons')],
    frags: [['COOH', 0], ['C6H5', [1, 2, 3, 4]]],
    tell: 'Same ring pattern as benzaldehyde, but the carbonyl sits at 173 instead of 192. That one number is acid versus aldehyde.' },
  { id: 'cyclohexane', name: 'cyclohexane', smiles: 'C1CCCCC1', cat: CATS[4],
    C: [L(26.9, 'alkyl', 6, 'all six CH2, one environment')], frags: [['(CH2)6', 0]],
    tell: 'One line, low on the ladder. Nothing above 50 means no oxygen, no nitrogen, no double bond anywhere.' },
  { id: 'cyclohexene', name: 'cyclohexene', smiles: 'C1=CCCCC1', cat: CATS[2],
    C: [L(127.2, 'sp2', 2, 'both alkene carbons'), L(25.4, 'alkyl', 2, 'the two CH2 next to the alkene'), L(23.0, 'alkyl', 2, 'the two CH2 across the ring')],
    frags: [['CH=CH', 0], ['(CH2)2', 1], ['(CH2)2', 2]],
    tell: 'Six carbons, three lines. The line at 127 is sp2, and there is nothing past 150, so this is an alkene, not a ring of them.' },
  { id: 'propene', name: 'propene', smiles: 'CC=C', cat: CATS[2],
    C: [L(133.4, 'sp2', 1, 'the middle alkene carbon'), L(115.7, 'sp2', 1, 'the CH2 end of the alkene'), L(19.5, 'alkyl', 1, 'the CH3')], frags: [['CH2=', 1], ['CH', 0], ['CH3', 2]],
    tell: 'Two lines in the sp2 band and one down low. An alkene puts both of its carbons in 110 to 150, not just one.' },
  { id: 'neopentane', name: '2,2-dimethylpropane', smiles: 'CC(C)(C)C', cat: CATS[4],
    C: [L(31.7, 'alkyl', 4, 'all four CH3, equal by symmetry'), L(28.0, 'alkyl', 1, 'the center carbon', { low: true })], frags: [['(CH3)4', 0], ['C', 1]],
    tell: 'Five carbons, two lines. The center carbon carries no hydrogens, so its peak is the short one.' }
];

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
// carbon count from a simple organic SMILES, so the table can be checked instead of trusted
function carbonCount(smi){
  let n = 0, i = 0;
  while (i < smi.length){
    const ch = smi[i];
    if (ch === '['){ const j = smi.indexOf(']', i); const m = smi.slice(i + 1, j).match(/[A-Z][a-z]?|[a-z]/); if (m && (m[0] === 'C' || m[0] === 'c')) n++; i = j + 1; continue; }
    if (ch === 'C' && smi[i + 1] === 'l'){ i += 2; continue; }
    if (ch === 'C' || ch === 'c'){ n++; i++; continue; }
    i++;
  }
  return n;
}
function lines(m){ return m.C.length; }
function atomsOf(m){ return m.C.reduce((s, c) => s + c.n, 0); }
function bandsOf(m){ return new Set(m.C.map(c => c.band)); }
function signature(m){ return lines(m) + ':' + m.C.map(c => c.band).join(','); }
function bandColor(C, id){
  if (id === 'ketoneCO') return C.coral;
  if (id === 'acidCO') return C.amber;
  if (id === 'sp2') return C.green;
  if (id === 'nextO') return C.blue;
  return C.grey;
}
function subText(api, t){ const span = api.el('span', {}); t.split(/(\d+)/).forEach((p, i) => { if (!p) return; span.append(i % 2 ? api.el('sub', { text: p }) : p); }); return span; }

/* ------------------------------------------------------------------ */
/* the ladder: 220 at the top, 0 at the bottom, one rung per line       */
/* ------------------------------------------------------------------ */
function drawLadder(api, m, o){
  o = o || {};
  const C = api.colors, svg = api.svg;
  const W = 700, H = 452, T = 16, B = 396, AX = 52, X0 = 118, X1 = 384;
  const y = ppm => B - (ppm / 224) * (B - T);
  const root = svg('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': 'the 13C ladder with the carbons of ' + m.name + ' placed on it', style: { width: '100%', height: 'auto', display: 'block' } });
  // the bands
  for (const b of BANDS){
    const col = bandColor(C, b.id);
    root.append(svg('rect', { x: AX, y: y(b.hi).toFixed(1), width: W - AX - 8, height: (y(b.lo) - y(b.hi)).toFixed(1), fill: col, 'fill-opacity': .1, rx: 5 }));
    root.append(svg('rect', { x: AX, y: y(b.hi).toFixed(1), width: 3, height: (y(b.lo) - y(b.hi)).toFixed(1), fill: col, 'fill-opacity': .7 }));
    root.append(svg('text', { x: AX + 12, y: (y(b.hi) + 15).toFixed(1), fill: b.id === 'alkyl' ? C.ink2 : col, 'font-family': SERIF, 'font-size': 14, text: b.lo + ' to ' + b.hi + ': ' + b.name }));
  }
  // the ppm axis
  root.append(svg('line', { x1: AX, y1: T, x2: AX, y2: B, stroke: C.line }));
  for (let p = 0; p <= 220; p += 20){
    root.append(svg('line', { x1: AX - 4, y1: y(p).toFixed(1), x2: AX, y2: y(p).toFixed(1), stroke: C.ink3 }));
    root.append(svg('text', { x: AX - 8, y: (y(p) + 4).toFixed(1), fill: C.ink3, 'font-family': MONO, 'font-size': 10, 'text-anchor': 'end', text: String(p) }));
  }
  root.append(svg('text', { x: 14, y: (T + B) / 2, fill: C.ink3, 'font-family': MONO, 'font-size': 10, 'text-anchor': 'middle', transform: `rotate(-90 14 ${(T + B) / 2})`, text: 'ppm on the carbon axis' }));
  root.append(svg('text', { x: AX + 2, y: H - 30, fill: C.ink2, 'font-family': SERIF, 'font-size': 14, text: 'The higher a carbon sits on this ladder, the more its electrons have been pulled away from it.' }));
  root.append(svg('text', { x: AX + 2, y: H - 11, fill: C.ink3, 'font-family': MONO, 'font-size': 11, text: 'a wider rung means more carbons folded onto that one line' }));
  // rungs, with the labels pushed apart so they never sit on top of each other
  const order = m.C.map((c, i) => i);
  const want = order.map(i => y(m.C[i].ppm));
  const lab = want.slice();
  for (let i = 1; i < lab.length; i++) if (lab[i] - lab[i - 1] < 19) lab[i] = lab[i - 1] + 19;
  const over = lab[lab.length - 1] - (B - 6);
  if (over > 0) for (let i = 0; i < lab.length; i++) lab[i] = Math.max(T + 10, lab[i] - over);
  order.forEach((i, k) => {
    const c = m.C[i], lit = o.lit === i, col = bandColor(C, c.band);
    const g = svg('g', { style: { cursor: o.onTap ? 'pointer' : 'default' } });
    const w = 26 + 22 * c.n;
    g.append(svg('rect', { x: X0, y: (want[k] - 5).toFixed(1), width: w, height: 10, rx: 5, fill: lit ? C.goldhi : col, 'fill-opacity': lit ? .95 : .8 }));
    g.append(svg('line', { x1: X0 + w, y1: want[k].toFixed(1), x2: X1 - 6, y2: lab[k].toFixed(1), stroke: lit ? C.gold : C.line, 'stroke-width': 1 }));
    g.append(svg('text', { x: X1, y: (lab[k] + 4).toFixed(1), fill: lit ? C.goldhi : C.ink2, 'font-family': MONO, 'font-size': 12, text: c.ppm.toFixed(1) }));
    g.append(svg('text', { x: X1 + 46, y: (lab[k] + 4).toFixed(1), fill: lit ? C.ink : C.ink3, 'font-family': SERIF, 'font-size': 13, text: c.label + (c.n > 1 ? ' (' + c.n + ' carbons)' : '') }));
    if (o.onTap){
      const hit = svg('rect', { x: X0 - 6, y: (lab[k] - 11).toFixed(1), width: W - X0, height: 22, fill: 'transparent' });
      hit.addEventListener('click', () => o.onTap(i)); g.append(hit);
    }
    root.append(g);
  });
  return root;
}

/* ------------------------------------------------------------------ */
/* the printout: a 13C stick spectrum, 220 on the left, 0 on the right  */
/* ------------------------------------------------------------------ */
function drawCNMR(api, m, o){
  o = o || {};
  const C = api.colors, svg = api.svg, mini = !!o.mini;
  const W = mini ? 300 : 700, H = mini ? 116 : 208;
  const Lx = mini ? 8 : 30, R = mini ? 292 : 686, T = mini ? 8 : 60, B = mini ? 92 : 168;
  const x = ppm => R - (ppm / 224) * (R - Lx);
  const root = svg('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': o.label || ('the 13C spectrum of ' + m.name), style: { width: '100%', height: 'auto', display: 'block' } });
  for (const b of BANDS){
    root.append(svg('rect', { x: x(b.hi).toFixed(1), y: T, width: (x(b.lo) - x(b.hi)).toFixed(1), height: B - T, fill: bandColor(C, b.id), 'fill-opacity': .1 }));
    if (!mini) root.append(svg('text', { x: ((x(b.hi) + x(b.lo)) / 2).toFixed(1), y: 15, fill: bandColor(C, b.id), 'font-family': MONO, 'font-size': 10, 'text-anchor': 'middle', text: b.lo + ' to ' + b.hi }));
  }
  root.append(svg('line', { x1: Lx, y1: B, x2: R, y2: B, stroke: C.ink3 }));
  for (let p = 0; p <= 220; p += mini ? 40 : 20){
    root.append(svg('line', { x1: x(p).toFixed(1), y1: B, x2: x(p).toFixed(1), y2: B + 4, stroke: C.ink3 }));
    root.append(svg('text', { x: x(p).toFixed(1), y: B + (mini ? 12 : 16), fill: C.ink3, 'font-family': MONO, 'font-size': mini ? 8 : 10, 'text-anchor': 'middle', text: String(p) }));
  }
  if (!mini) root.append(svg('text', { x: (Lx + R) / 2, y: H - 4, fill: C.ink3, 'font-family': MONO, 'font-size': 10, 'text-anchor': 'middle', text: 'ppm, 220 on the left, 0 on the right' }));
  const maxN = Math.max(...m.C.map(c => c.n));
  // the numbers over crowded lines get pushed apart, then leaned back onto their line
  const lx = m.C.map(c => x(c.ppm));   // the table runs high ppm to low, so these run left to right
  for (let i = 1; i < lx.length; i++) if (lx[i] - lx[i - 1] < 26) lx[i] = lx[i - 1] + 26;
  const spill = lx[lx.length - 1] - (R - 6);
  if (spill > 0) for (let i = 0; i < lx.length; i++) lx[i] = Math.max(Lx + 12, lx[i] - spill);
  m.C.forEach((c, i) => {
    const lit = o.lit === i;
    const h = (B - T) * (0.42 + 0.42 * Math.sqrt(c.n / maxN)) * (c.low ? 0.55 : 1);
    root.append(svg('line', { x1: x(c.ppm).toFixed(1), y1: B, x2: x(c.ppm).toFixed(1), y2: (B - h).toFixed(1), stroke: lit ? C.goldhi : C.ink, 'stroke-width': mini ? 1.4 : 2 }));
    if (mini) return;
    const ty = 34 + (i % 2) * 14;
    if (Math.abs(lx[i] - x(c.ppm)) > 1.5) root.append(svg('line', { x1: x(c.ppm).toFixed(1), y1: (B - h - 3).toFixed(1), x2: lx[i].toFixed(1), y2: (ty + 4).toFixed(1), stroke: lit ? C.gold : C.line, 'stroke-width': 1 }));
    root.append(svg('text', { x: lx[i].toFixed(1), y: ty, fill: lit ? C.goldhi : C.ink2, 'font-family': MONO, 'font-size': 11, 'text-anchor': 'middle', text: String(Math.round(c.ppm)) }));
  });
  root.append(svg('line', { x1: x(0).toFixed(1), y1: B, x2: x(0).toFixed(1), y2: (B - 14).toFixed(1), stroke: C.ink3, 'stroke-width': 1.5 }));
  return root;
}

/* ------------------------------------------------------------------ */
/* generators (pure). Every answer is the table entry.                  */
/* ------------------------------------------------------------------ */
function numberChoices(rng, v){
  const pool = [v - 2, v - 1, v + 1, v + 2, v + 3].filter(x => x >= 1);
  const picks = [];
  const rest = pool.slice();
  while (picks.length < 3 && rest.length) picks.push(rest.splice(Math.floor(rng() * rest.length), 1)[0]);
  return shuffleWith(rng, [{ text: String(v), ok: true }, ...picks.map(p => ({ text: String(p), ok: false }))]);
}
// how many lines does this molecule give
function genCount(rng){ const m = pickWith(rng, CN); return { kind: 'count', mol: m, choices: numberChoices(rng, lines(m)) }; }
// which carbon gives the line at X. Only lines that stand alone by more than 6 ppm
// get asked, so the student is never asked to split hairs inside a ring multiplet.
// The choices are the other carbons of the SAME molecule.
function standsAlone(m, i){ return m.C.every((c, k) => k === i || Math.abs(c.ppm - m.C[i].ppm) > 6); }
const ASK_POOL = CN.flatMap(m => (lines(m) >= 4 && new Set(m.C.map(c => c.label)).size >= 4) ? m.C.map((c, i) => ({ m, i })).filter(q => standsAlone(m, q.i)) : []);
function genWhichCarbon(rng){
  const q = pickWith(rng, ASK_POOL), m = q.m, i = q.i;
  const others = shuffleWith(rng, m.C.map((c, k) => k).filter(k => k !== i && m.C[k].label !== m.C[i].label)).slice(0, 3);
  const choices = shuffleWith(rng, [{ text: m.C[i].label, ok: true, idx: i }, ...others.map(k => ({ text: m.C[k].label, ok: false, idx: k }))]);
  return { kind: 'which', mol: m, idx: i, choices };
}
// what class of compound is this: the answer is forced by the top band on the ladder
function genClass(rng){
  const m = pickWith(rng, CN);
  const others = shuffleWith(rng, CATS.filter(c => c !== m.cat)).slice(0, 3);
  const choices = shuffleWith(rng, [{ text: m.cat, ok: true }, ...others.map(c => ({ text: c, ok: false }))]);
  return { kind: 'class', mol: m, choices };
}
// which structure gives this spectrum: candidates differ in line count and in bands
function genMatch(rng){
  const m = pickWith(rng, CN);
  const others = [], used = new Set([signature(m)]), usedN = new Set([lines(m)]);
  for (const x of shuffleWith(rng, CN)){
    if (x.id === m.id || used.has(signature(x)) || usedN.has(lines(x))) continue;
    used.add(signature(x)); usedN.add(lines(x)); others.push(x);
    if (others.length === 3) break;
  }
  const choices = shuffleWith(rng, [{ mol: m, smiles: m.smiles, ok: true }, ...others.map(x => ({ mol: x, smiles: x.smiles, ok: false }))]);
  return { kind: 'match', mol: m, choices };
}
function words(m){
  return m.C.map(c => Math.round(c.ppm)).join(', ') + ' ppm';
}
function coachFor(g){
  if (g.kind === 'count') return 'Count the different carbons, and let symmetry fold the equal ones onto one line. ' + g.mol.tell;
  if (g.kind === 'which'){ const b = BAND[g.mol.C[g.idx].band]; return 'A line at ' + Math.round(g.mol.C[g.idx].ppm) + ' sits in the ' + b.lo + ' to ' + b.hi + ' band: ' + b.name + '. ' + b.line; }
  if (g.kind === 'class') return 'Read the top of the ladder first. Past 190 is a ketone or an aldehyde; 160 to 185 is an acid, an ester or an amide; nothing past 150 and you are below the carbonyls entirely. ' + g.mol.tell;
  return 'Count the lines first and cross out every structure with a different count, then check which bands those lines sit in. ' + g.mol.tell;
}

/* ------------------------------------------------------------------ */
/* makeItem for the Summit                                              */
/* ------------------------------------------------------------------ */
function toSummit(g){
  const base = { sub: null, reagent: null, prod: null, coach: coachFor(g), home: meta.id, roots: ROOTS, source: 'generated' };
  if (g.kind === 'count') return Object.assign(base, { stem: 'How many lines appear in the proton-decoupled 13C NMR spectrum of this molecule?', sub: g.mol.smiles, choices: g.choices.map(c => ({ text: c.text, smiles: null })), correct: g.choices.findIndex(c => c.ok) });
  if (g.kind === 'which') return Object.assign(base, { stem: 'The 13C NMR of ' + g.mol.name + ' shows lines at ' + words(g.mol) + '. Which carbon gives the line at ' + Math.round(g.mol.C[g.idx].ppm) + '?', sub: g.mol.smiles, choices: g.choices.map(c => ({ text: c.text, smiles: null })), correct: g.choices.findIndex(c => c.ok) });
  if (g.kind === 'class') return Object.assign(base, { stem: 'A 13C NMR spectrum shows lines at ' + words(g.mol) + ' and nothing else. From the carbon spectrum alone, what is this compound?', choices: g.choices.map(c => ({ text: c.text, smiles: null })), correct: g.choices.findIndex(c => c.ok) });
  return Object.assign(base, { stem: 'A 13C NMR spectrum shows ' + lines(g.mol) + ' line' + (lines(g.mol) === 1 ? '' : 's') + ' at ' + words(g.mol) + '. Which structure fits?', choices: g.choices.map(c => ({ text: '', smiles: c.smiles })), correct: g.choices.findIndex(c => c.ok) });
}
// the bank group for this module is the shared NMR group; keep only the carbon items
function carbonBank(api){
  const all = api.bank && api.bank.items ? api.bank.items('spectroscopy-nmr') : [];
  return all.filter(it => /13\s*C|carbon/i.test(String(it.q || '')));
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
  const bank = carbonBank(api);
  if (bank.length && api.rng() < 0.35) return trimBank(api, api.pick(bank));
  const r = api.rng();
  return toSummit(r < 0.28 ? genCount(api.rng) : r < 0.52 ? genWhichCarbon(api.rng) : r < 0.76 ? genClass(api.rng) : genMatch(api.rng));
}

/* ------------------------------------------------------------------ */
/* mount                                                                */
/* ------------------------------------------------------------------ */
export function mount(slots, api){
  const C = api.colors, el = api.el;

  /* ---------- VISUAL: the ladder with one molecule's carbons on it ---------- */
  let cur = CN[7], lit = -1;
  const chips = el('div', { class: 'controls', style: { marginTop: '0' } });
  const body = el('div', { style: { display: 'flex', gap: '18px', alignItems: 'flex-start', flexWrap: 'wrap', margin: '12px 0 0' } });
  const left = el('div', { style: { width: '270px', flex: 'none' } });
  const molCard = el('div', { style: { background: 'rgba(255,255,255,.02)', border: '1px solid ' + C.line, borderRadius: '10px', padding: '8px' } });
  const molPic = el('div', {});
  const stripHost = el('div', {});
  molCard.append(molPic, stripHost);
  const nameEl = el('div', { style: { fontFamily: SERIF, fontSize: '22px', color: C.ink, marginTop: '10px' } });
  const countEl = el('div', { style: { fontFamily: MONO, fontSize: '11px', letterSpacing: '.14em', textTransform: 'uppercase', color: C.gold, margin: '2px 0 8px' } });
  const tellEl = el('p', { style: { margin: '0 0 10px', fontSize: '15px', color: C.ink2, fontFamily: SERIF } });
  const capt = el('div', { style: { fontFamily: SERIF, fontSize: '15px', color: C.goldhi, minHeight: '3.4em', borderLeft: '3px solid ' + C.gold, paddingLeft: '10px' } });
  left.append(molCard, nameEl, countEl, tellEl, capt);
  const right = el('div', { style: { flex: '1 1 380px', minWidth: '0' } });
  const ladderHost = el('div', {});
  const specHost = el('div', { style: { marginTop: '6px' } });
  const specLabel = el('div', { class: 'eyebrow', style: { display: 'block', margin: '10px 0 2px' }, text: 'the same carbons on the printout' });
  right.append(ladderHost, specLabel, specHost);
  body.append(left, right);
  const rungRow = el('div', { class: 'controls' });
  const hint = el('div', { style: { fontFamily: MONO, fontSize: '12px', color: C.ink3, marginTop: '8px' }, text: 'Tap a carbon on the structure to light its rung, or tap a rung to light the carbon. Both directions work.' });
  slots.visual.append(chips, body, rungRow, hint);

  function stripFor(m, on){
    const row = el('div', { style: { display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '2px', marginTop: '10px' } });
    m.frags.forEach((f, i) => {
      const idx = f[1] == null ? [] : Array.isArray(f[1]) ? f[1] : [f[1]];
      if (i > 0 && !f[0].startsWith('(')) row.append(el('span', { text: '-', style: { color: C.ink3, fontFamily: MONO } }));
      if (!idx.length){ const s = subText(api, f[0]); Object.assign(s.style, { fontFamily: MONO, fontSize: '16px', color: C.ink3, padding: '0 2px' }); row.append(s); return; }
      const isOn = idx.some(k => k === on);
      const b = el('button', { type: 'button', 'aria-pressed': String(isOn), 'aria-label': 'the carbon drawn as ' + f[0],
        style: { minHeight: '34px', padding: '2px 6px', border: '1px solid ' + (isOn ? C.gold : 'transparent'), borderRadius: '7px', background: isOn ? 'rgba(201,168,76,.16)' : 'transparent', fontFamily: MONO, fontSize: '16px', color: isOn ? C.goldhi : C.ink, textDecoration: isOn ? 'none' : 'underline dotted', textUnderlineOffset: '4px', textDecorationColor: C.ink3 },
        onclick(){ set(idx[0] === on ? -1 : idx[0]); } });
      b.append(subText(api, f[0]));
      row.append(b);
    });
    return row;
  }
  function set(i){
    lit = i;
    clear(ladderHost); ladderHost.append(drawLadder(api, cur, { lit, onTap: k => set(k === lit ? -1 : k) }));
    clear(specHost); specHost.append(drawCNMR(api, cur, { lit }));
    clear(stripHost); stripHost.append(stripFor(cur, lit));
    for (const b of rungRow.querySelectorAll('button')) b.setAttribute('aria-pressed', String(Number(b.dataset.k) === lit));
    if (i < 0) capt.textContent = 'Read the top of the ladder first, then count the lines. Tap any carbon.';
    else { const c = cur.C[i], b = BAND[c.band]; capt.textContent = Math.round(c.ppm) + ' ppm: ' + c.label + '. That is the ' + b.lo + ' to ' + b.hi + ' band, ' + b.name + '. ' + b.line; }
  }
  function show(m){
    cur = m; lit = -1;
    for (const b of chips.children) b.setAttribute('aria-pressed', String(b.dataset.id === m.id));
    clear(molPic); api.drawSmiles(molPic, m.smiles, { width: 250, height: 140, label: m.name });
    nameEl.textContent = m.name;
    countEl.textContent = lines(m) + ' line' + (lines(m) === 1 ? '' : 's') + ' for ' + atomsOf(m) + ' carbon' + (atomsOf(m) === 1 ? '' : 's');
    tellEl.textContent = m.tell;
    clear(rungRow);
    rungRow.append(el('span', { style: { fontFamily: MONO, fontSize: '11px', color: C.ink3, letterSpacing: '.12em', textTransform: 'uppercase' }, text: 'lines' }));
    m.C.forEach((c, i) => rungRow.append(el('button', { type: 'button', class: 'chip', text: Math.round(c.ppm) + ' ppm', dataset: { k: String(i) }, 'aria-pressed': 'false',
      style: { borderLeftColor: bandColor(C, c.band), borderLeftWidth: '3px' }, onclick(){ set(i === lit ? -1 : i); } })));
    set(-1);
  }
  for (const m of CN) chips.append(el('button', { type: 'button', class: 'chip', text: m.name, dataset: { id: m.id }, 'aria-pressed': 'false', onclick: () => show(m) }));
  show(cur);

  /* ---------- YOU TRY ---------- */
  const bank = carbonBank(api);
  let turn = 0;
  function generated(){
    const k = turn % 4;
    if (k === 0){
      const g = genCount(api.rng);
      const node = el('div', { style: { maxWidth: '280px' } }); api.drawSmiles(node, g.mol.smiles, { width: 260, height: 150, label: 'a structure' });
      return { prompt: 'How many lines does this molecule give in its 13C NMR spectrum?', node, choices: g.choices, coach: coachFor(g) };
    }
    if (k === 1){
      const g = genWhichCarbon(api.rng);
      const node = el('div', {});
      const pic = el('div', { style: { maxWidth: '280px' } }); api.drawSmiles(pic, g.mol.smiles, { width: 260, height: 150, label: g.mol.name });
      node.append(pic, drawCNMR(api, g.mol, { lit: g.idx, label: 'a 13C spectrum with one line marked' }));
      return { prompt: 'In ' + g.mol.name + ', which carbon gives the marked line at ' + Math.round(g.mol.C[g.idx].ppm) + ' ppm?', node, choices: g.choices, coach: coachFor(g) };
    }
    if (k === 2){
      const g = genClass(api.rng);
      return { prompt: 'From this 13C spectrum alone, what is the compound?', node: drawCNMR(api, g.mol, { label: 'a 13C spectrum' }), choices: g.choices, coach: coachFor(g) };
    }
    const g = genMatch(api.rng);
    return { prompt: 'Which structure gives this 13C spectrum?', node: drawCNMR(api, g.mol, { label: 'a 13C spectrum' }), choices: g.choices.map(c => ({ smiles: c.smiles, label: c.mol.name, ok: c.ok })), coach: coachFor(g) };
  }
  function fromBank(it){
    const t = api.bank.toItem(it);
    let node = null;
    if (t.sub){ node = el('div', { style: { maxWidth: '280px' } }); api.drawSmiles(node, t.sub, { width: 260, height: 160, label: 'the structure in the question' }); }
    return { prompt: t.stem, node, choices: t.choices.map((c, i) => ({ text: c.text, smiles: c.smiles, ok: i === t.correct })), coach: t.coach, source: 'bank' };
  }
  runTry(slots.try, api, () => { turn++; if (bank.length && turn % 3 === 0) return fromBank(api.pick(bank)); return generated(); });
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
  // 0. the carbon counter is right on molecules counted by hand
  for (const [s, n] of [['CCO', 2], ['c1ccccc1', 6], ['CC(=O)O', 2], ['Cc1ccc(C)cc1', 8], ['C1CCC(=O)CC1', 6], ['CC(C)(C)C', 5], ['CC(=O)c1ccccc1', 8], ['OC(=O)c1ccccc1', 7], ['CCOC(C)=O', 4], ['CC=C', 3]])
    if (carbonCount(s) !== n) return { ok: false, tried, notes: 'carbonCount ' + s + ' gave ' + carbonCount(s) };
  // 1. the table proves itself
  if (CN.length < 12) return { ok: false, tried, notes: 'table too small' };
  const seen = new Set();
  for (const m of CN){
    if (seen.has(m.id)) return { ok: false, tried, notes: 'duplicate id ' + m.id };
    seen.add(m.id);
    if (!smilesSane(m.smiles) || !SMILES.includes(m.smiles)) return { ok: false, tried, notes: m.id + ': smiles not listed or not sane' };
    if (atomsOf(m) !== carbonCount(m.smiles)) return { ok: false, tried, notes: m.id + ': lines cover ' + atomsOf(m) + ' carbons but the formula has ' + carbonCount(m.smiles) };
    for (let i = 1; i < m.C.length; i++) if (!(m.C[i].ppm < m.C[i - 1].ppm)) return { ok: false, tried, notes: m.id + ': lines not sorted high to low' };
    for (const c of m.C){
      const b = BAND[c.band];
      if (!b) return { ok: false, tried, notes: m.id + ': unknown band ' + c.band };
      if (!(c.ppm >= b.lo && c.ppm <= b.hi)) return { ok: false, tried, notes: m.id + ': ' + c.ppm + ' is outside its ' + c.band + ' band' };
      if (!(c.n >= 1)) return { ok: false, tried, notes: m.id + ': a line covering no carbon' };
      if (!c.label) return { ok: false, tried, notes: m.id + ': a line with no label' };
    }
    if (catFromBands(bandsOf(m)) !== m.cat) return { ok: false, tried, notes: m.id + ': the bands say ' + catFromBands(bandsOf(m)) + ' but the table says ' + m.cat };
    if (CATS.indexOf(m.cat) < 0) return { ok: false, tried, notes: m.id + ': unknown class' };
    const covered = new Set();
    for (const f of m.frags){ const idx = f[1] == null ? [] : Array.isArray(f[1]) ? f[1] : [f[1]]; for (const k of idx){ if (!m.C[k]) return { ok: false, tried, notes: m.id + ': a fragment points at a missing line' }; covered.add(k); } }
    if (covered.size !== m.C.length) return { ok: false, tried, notes: m.id + ': the structure strip does not cover every line' };
    if (!m.tell) return { ok: false, tried, notes: m.id + ': no tell' };
  }
  // every band and every class has to be represented, or the ladder teaches half a story
  for (const b of BANDS) if (!CN.some(m => bandsOf(m).has(b.id))) return { ok: false, tried, notes: 'no molecule uses the ' + b.id + ' band' };
  for (const c of CATS) if (!CN.some(m => m.cat === c)) return { ok: false, tried, notes: 'no molecule is ' + c };
  if (new Set(CN.map(m => lines(m))).size < 5) return { ok: false, tried, notes: 'not enough different line counts' };
  if (ASK_POOL.length < 12) return { ok: false, tried, notes: 'which-carbon pool too small' };
  for (const q of ASK_POOL) if (!standsAlone(q.m, q.i)) return { ok: false, tried, notes: q.m.id + ': an asked line is crowded' };
  // 2. generators
  const rng = makeRng(20260904);
  for (let k = 0; k < 260; k++){
    const g = k % 4 === 0 ? genCount(rng) : k % 4 === 1 ? genWhichCarbon(rng) : k % 4 === 2 ? genClass(rng) : genMatch(rng);
    const oks = g.choices.filter(c => c.ok);
    if (oks.length !== 1 || g.choices.length !== 4) return { ok: false, tried, notes: g.kind + ': answer not unique or not four choices' };
    if (new Set(g.choices.map(c => c.text || c.smiles)).size !== 4) return { ok: false, tried, notes: g.kind + ': duplicate choices' };
    if (g.kind === 'count' && Number(oks[0].text) !== lines(g.mol)) return { ok: false, tried, notes: 'count mismatch' };
    if (g.kind === 'which' && (oks[0].idx !== g.idx || !standsAlone(g.mol, g.idx))) return { ok: false, tried, notes: 'which-carbon mismatch or crowded line' };
    if (g.kind === 'class' && oks[0].text !== catFromBands(bandsOf(g.mol))) return { ok: false, tried, notes: 'class mismatch' };
    if (g.kind === 'match'){
      if (oks[0].mol.id !== g.mol.id) return { ok: false, tried, notes: 'match mismatch' };
      if (new Set(g.choices.map(c => lines(c.mol))).size !== 4) return { ok: false, tried, notes: 'match: line counts not distinct' };
    }
    tried++;
  }
  // 3. makeItem for the Summit
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
  return { ok: true, tried, notes: CN.length + ' molecules; every line inside its band, every carbon accounted for, class forced by the bands' };
}
