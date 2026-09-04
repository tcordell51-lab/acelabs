// The Tree of Organic · Level 7 · Module 2: Count the peaks first (1H NMR)
// ES module, no imports. Structures are drawn by the shell from SMILES; the
// stick spectra are SVG synthesized here from a curated signal table.

export const SMILES = [
  'CCO', 'CC(C)=O', 'CCOC(C)=O', 'Cc1ccccc1', 'c1ccc(C=O)cc1', 'CC(C)O', 'CO', 'c1ccccc1', 'Cc1ccc(C)cc1', 'CC(C)(C)O',
  'CCC(C)=O', 'CC=O', 'CCC(=O)O', 'CCOCC', 'CCCO', 'COC(C)=O', 'ClCCCl', 'COC(C)(C)C', 'CC(C)Br', 'CCBr',
  'CC(=O)O', 'CCC=O', 'CCc1ccccc1', 'CC(=O)c1ccccc1', 'C1CCCCC1'
];

export const meta = {
  id: 't7-hnmr',
  level: 7,
  order: 2,
  needs3D: false,
  title: 'Count the peaks first',
  concept: '1H NMR: count, symmetry, n plus 1, then where it sits',
  tagline: 'The number of signals kills half the answer choices before you read a single shift.',
  story: 'Proton NMR is a counting game before it is anything else. First count the signals: that is the number of different hydrogen environments, and every answer choice with a different count is gone. Symmetry means fewer signals, so a molecule that folds onto itself gives fewer peaks than its formula suggests. Second, splitting: n plus 1, where n is every hydrogen on the neighboring carbons, all of them. Zero neighbors is a singlet, two is a triplet, three is a quartet. Third, where it sits: an acid H near 12, an aldehyde H near 9 to 10, ring hydrogens near 7, vinyl near 5 to 6, a carbon bonded to oxygen or a halogen near 3 to 4, plain alkyl near 1. An O-H shows up as a singlet because the oxygen blocks the neighbors from splitting it. Rule of thumb: count, symmetry, n plus 1, then the landmarks.',
  moveName: 'Count, symmetry, n plus 1, then the landmarks',
  move: [
    'Count the signals. Cross out every choice with a different number of hydrogen environments. Symmetry means fewer.',
    'For each signal, count every hydrogen on the neighboring carbons and add one. That is the splitting.',
    'Read where it sits: acid near 12, aldehyde near 9 to 10, aromatic near 7, vinyl near 5 to 6, next to O or a halogen near 3 to 4, alkyl near 1.',
    'Match the integration: the step heights are the hydrogen count of each signal.'
  ],
  trap: 'Careful: an O-H or N-H is a singlet no matter how many neighbors it has; the heteroatom blocks the splitting, and a shake with D2O makes that peak vanish.',
  holdsUp: ['Unknown structure problems', 'Isomer questions', 'Symmetry counting', 'D2O shake questions'],
  drill: 'Booster OChem: Spectroscopy & Lab Techniques'
};

const SERIF = 'Georgia, "Times New Roman", serif';
const MONO = 'ui-monospace, "SF Mono", Menlo, monospace';
const ROOTS = ['l1-skeletal', 'l1-unsat'];

/* ------------------------------------------------------------------ */
/* The curated table. Signals are sorted by ppm. mult: s d t q quint    */
/* sext sept m br. H = integration, nb = neighbor hydrogens counted for */
/* n plus 1 (null when the rule is not the story: ring multiplets,      */
/* equivalent neighbors). role names what the hydrogens are. frags is   */
/* the condensed structure: [text, signal index | [indices] | null].    */
/* ------------------------------------------------------------------ */
const S = (ppm, mult, H, nb, role, label) => ({ ppm, mult, H, nb, role, label });
const NMR = [
  { id: 'ethanol', name: 'ethanol', smiles: 'CCO', sig: [S(1.2, 't', 3, 2, 'alkyl', 'the CH3'), S(2.6, 'br', 1, 0, 'OH', 'the O-H'), S(3.7, 'q', 2, 3, 'nextToO', 'the CH2 on the oxygen')],
    frags: [['CH3', 0], ['CH2', 2], ['OH', 1]], tell: 'Triplet plus quartet is an ethyl group, and the quartet sits at 3.7 because that CH2 is on the oxygen. The O-H is a broad singlet.' },
  { id: 'acetone', name: 'acetone', smiles: 'CC(C)=O', sig: [S(2.1, 's', 6, 0, 'alphaCO', 'both CH3, equivalent by symmetry')],
    frags: [['CH3', 0], ['C(=O)', null], ['CH3', 0]], tell: 'One singlet for six hydrogens. Both methyls are the same by symmetry and the carbonyl between them has no hydrogens to split them.' },
  { id: 'ethylacetate', name: 'ethyl acetate', smiles: 'CCOC(C)=O', sig: [S(1.25, 't', 3, 2, 'alkyl', 'the CH3 of the ethyl'), S(2.05, 's', 3, 0, 'alphaCO', 'the CH3 on the carbonyl'), S(4.1, 'q', 2, 3, 'nextToO', 'the O-CH2')],
    frags: [['CH3', 1], ['C(=O)', null], ['O', null], ['CH2', 2], ['CH3', 0]], tell: 'An ethyl (triplet plus quartet) with the quartet pushed to 4.1 by the oxygen, plus a lone singlet at 2.05 for the methyl on the carbonyl.' },
  { id: 'toluene', name: 'toluene', smiles: 'Cc1ccccc1', sig: [S(2.35, 's', 3, 0, 'alkyl', 'the CH3'), S(7.2, 'm', 5, null, 'aromatic', 'the five ring hydrogens')],
    frags: [['CH3', 0], ['C6H5', 1]], tell: 'A methyl singlet at 2.35 and the ring multiplet near 7.2 for five hydrogens. Two signals.' },
  { id: 'benzaldehyde', name: 'benzaldehyde', smiles: 'c1ccc(C=O)cc1', sig: [S(7.55, 'm', 3, null, 'aromatic', 'the meta and para ring hydrogens'), S(7.85, 'd', 2, null, 'aromatic', 'the two ortho ring hydrogens'), S(10.0, 's', 1, 0, 'aldehyde', 'the aldehyde H')],
    frags: [['C6H5', [0, 1]], ['CHO', 2]], tell: 'Nothing else lives at 10: that singlet is the aldehyde H, and it is a singlet because the ring carbon next to it has no hydrogen.' },
  { id: 'isopropanol', name: '2-propanol', smiles: 'CC(C)O', sig: [S(1.15, 'd', 6, 1, 'alkyl', 'both CH3'), S(2.4, 'br', 1, 0, 'OH', 'the O-H'), S(4.0, 'sept', 1, 6, 'nextToO', 'the CH on the oxygen')],
    frags: [['CH3', 0], ['CH', 2], ['(OH)', 1], ['CH3', 0]], tell: 'A doublet for six hydrogens next to a septet for one: the isopropyl fingerprint. Six equivalent neighbors give 6 plus 1 = 7 lines.' },
  { id: 'methanol', name: 'methanol', smiles: 'CO', sig: [S(2.5, 'br', 1, 0, 'OH', 'the O-H'), S(3.4, 's', 3, 0, 'nextToO', 'the CH3 on the oxygen')],
    frags: [['CH3', 1], ['OH', 0]], tell: 'A methyl singlet pushed to 3.4 by the oxygen, and a broad O-H. Methanol versus ethanol is singlet versus triplet-quartet.' },
  { id: 'benzene', name: 'benzene', smiles: 'c1ccccc1', sig: [S(7.36, 's', 6, 0, 'aromatic', 'all six ring hydrogens, one environment')],
    frags: [['C6H6', 0]], tell: 'Maximum symmetry, minimum peaks: one singlet for all six hydrogens.' },
  { id: 'pxylene', name: 'p-xylene', smiles: 'Cc1ccc(C)cc1', sig: [S(2.3, 's', 6, 0, 'alkyl', 'both CH3'), S(7.05, 's', 4, 0, 'aromatic', 'all four ring hydrogens, equivalent by para symmetry')],
    frags: [['CH3', 0], ['C6H4', 1], ['CH3', 0]], tell: 'Two singlets: 6H for the methyls and 4H for the ring. Para symmetry makes all four ring hydrogens the same.' },
  { id: 'tbutanol', name: 'tert-butanol', smiles: 'CC(C)(C)O', sig: [S(1.25, 's', 9, 0, 'alkyl', 'the three CH3'), S(2.0, 'br', 1, 0, 'OH', 'the O-H')],
    frags: [['(CH3)3', 0], ['C', null], ['OH', 1]], tell: 'A 9H singlet is a tert-butyl group: three equivalent methyls on a carbon with no hydrogens.' },
  { id: 'butanone', name: '2-butanone', smiles: 'CCC(C)=O', sig: [S(1.05, 't', 3, 2, 'alkyl', 'the CH3 of the ethyl'), S(2.1, 's', 3, 0, 'alphaCO', 'the CH3 on the carbonyl'), S(2.45, 'q', 2, 3, 'alphaCO', 'the CH2 on the carbonyl')],
    frags: [['CH3', 1], ['C(=O)', null], ['CH2', 2], ['CH3', 0]], tell: 'Ethyl (triplet plus quartet) and a methyl singlet. The quartet sits at 2.45, next to the carbonyl, not at 4.' },
  { id: 'acetaldehyde', name: 'acetaldehyde', smiles: 'CC=O', sig: [S(2.2, 'd', 3, 1, 'alphaCO', 'the CH3'), S(9.8, 'q', 1, 3, 'aldehyde', 'the aldehyde H')],
    frags: [['CH3', 0], ['CHO', 1]], tell: 'The aldehyde H at 9.8 is a quartet because it has three neighbors on the methyl; the methyl is a doublet because it has one.' },
  { id: 'propanoicacid', name: 'propanoic acid', smiles: 'CCC(=O)O', sig: [S(1.15, 't', 3, 2, 'alkyl', 'the CH3'), S(2.4, 'q', 2, 3, 'alphaCO', 'the CH2 on the carbonyl'), S(11.9, 's', 1, 0, 'acid', 'the acid O-H')],
    frags: [['CH3', 0], ['CH2', 1], ['COOH', 2]], tell: 'A lonely singlet near 12 is a carboxylic acid H. The ethyl pair sits below it.' },
  { id: 'ether', name: 'diethyl ether', smiles: 'CCOCC', sig: [S(1.2, 't', 6, 2, 'alkyl', 'both CH3'), S(3.5, 'q', 4, 3, 'nextToO', 'both O-CH2')],
    frags: [['CH3', 0], ['CH2', 1], ['O', null], ['CH2', 1], ['CH3', 0]], tell: 'Two signals, not four: the molecule is symmetric, so both ethyls are the same. Triplet 6H, quartet 4H at 3.5.' },
  { id: 'propanol', name: '1-propanol', smiles: 'CCCO', sig: [S(0.95, 't', 3, 2, 'alkyl', 'the CH3'), S(1.55, 'sext', 2, 5, 'alkyl', 'the middle CH2, five neighbors'), S(2.3, 'br', 1, 0, 'OH', 'the O-H'), S(3.6, 't', 2, 2, 'nextToO', 'the CH2 on the oxygen')],
    frags: [['CH3', 0], ['CH2', 1], ['CH2', 3], ['OH', 2]], tell: 'The middle CH2 has five neighbors, three on one side and two on the other, so it is a sextet. Count all of them.' },
  { id: 'methylacetate', name: 'methyl acetate', smiles: 'COC(C)=O', sig: [S(2.05, 's', 3, 0, 'alphaCO', 'the CH3 on the carbonyl'), S(3.65, 's', 3, 0, 'nextToO', 'the O-CH3')],
    frags: [['CH3', 0], ['C(=O)', null], ['O', null], ['CH3', 1]], tell: 'Two singlets, both 3H. The one at 3.65 is on the oxygen; the one at 2.05 is on the carbonyl.' },
  { id: 'dce', name: '1,2-dichloroethane', smiles: 'ClCCCl', sig: [S(3.7, 's', 4, null, 'nextToX', 'both CH2, equivalent, so they do not split each other')],
    frags: [['Cl', null], ['CH2', 0], ['CH2', 0], ['Cl', null]], tell: 'One singlet for four hydrogens. Equivalent hydrogens do not split each other, so n plus 1 never starts.' },
  { id: 'mtbe', name: 'tert-butyl methyl ether', smiles: 'COC(C)(C)C', sig: [S(1.2, 's', 9, 0, 'alkyl', 'the three CH3 of the tert-butyl'), S(3.2, 's', 3, 0, 'nextToO', 'the O-CH3')],
    frags: [['CH3', 1], ['O', null], ['C', null], ['(CH3)3', 0]], tell: 'Two singlets, 9H and 3H. Nobody has a hydrogen neighbor, so nobody splits.' },
  { id: 'bromopropane2', name: '2-bromopropane', smiles: 'CC(C)Br', sig: [S(1.7, 'd', 6, 1, 'alkyl', 'both CH3'), S(4.3, 'sept', 1, 6, 'nextToX', 'the CH on the bromine')],
    frags: [['CH3', 0], ['CH', 1], ['(Br)', null], ['CH3', 0]], tell: 'Doublet 6H plus septet 1H is isopropyl, and the septet sits at 4.3 because that carbon holds the bromine.' },
  { id: 'bromoethane', name: 'bromoethane', smiles: 'CCBr', sig: [S(1.7, 't', 3, 2, 'alkyl', 'the CH3'), S(3.4, 'q', 2, 3, 'nextToX', 'the CH2 on the bromine')],
    frags: [['CH3', 0], ['CH2', 1], ['Br', null]], tell: 'Ethyl pattern: the CH3 is a triplet (two neighbors), the CH2 is a quartet (three neighbors) pushed to 3.4 by the bromine.' },
  { id: 'aceticacid', name: 'acetic acid', smiles: 'CC(=O)O', sig: [S(2.1, 's', 3, 0, 'alphaCO', 'the CH3'), S(11.5, 's', 1, 0, 'acid', 'the acid O-H')],
    frags: [['CH3', 0], ['COOH', 1]], tell: 'A methyl singlet and the acid H way out near 12. Two singlets, nobody has a neighbor.' },
  { id: 'propanal', name: 'propanal', smiles: 'CCC=O', sig: [S(1.1, 't', 3, 2, 'alkyl', 'the CH3'), S(2.45, 'quint', 2, 4, 'alphaCO', 'the CH2, four neighbors: three on the CH3 plus the aldehyde H'), S(9.8, 't', 1, 2, 'aldehyde', 'the aldehyde H, two neighbors')],
    frags: [['CH3', 0], ['CH2', 1], ['CHO', 2]], tell: 'The aldehyde H is a triplet because the CH2 next to it has two hydrogens. The CH2 sees four neighbors, so it is a quintet.' },
  { id: 'ethylbenzene', name: 'ethylbenzene', smiles: 'CCc1ccccc1', sig: [S(1.25, 't', 3, 2, 'alkyl', 'the CH3'), S(2.65, 'q', 2, 3, 'alkyl', 'the CH2 on the ring'), S(7.2, 'm', 5, null, 'aromatic', 'the five ring hydrogens')],
    frags: [['CH3', 0], ['CH2', 1], ['C6H5', 2]], tell: 'Ethyl pair plus a ring multiplet: three signals. Compare p-xylene, same formula, two singlets.' },
  { id: 'acetophenone', name: 'acetophenone', smiles: 'CC(=O)c1ccccc1', sig: [S(2.6, 's', 3, 0, 'alphaCO', 'the CH3 on the carbonyl'), S(7.5, 'm', 3, null, 'aromatic', 'the meta and para ring hydrogens'), S(7.95, 'd', 2, null, 'aromatic', 'the two ortho ring hydrogens')],
    frags: [['CH3', 0], ['C(=O)', null], ['C6H5', [1, 2]]], tell: 'A methyl singlet at 2.6 next to the carbonyl, and the ring split into ortho (2H) and the rest (3H).' },
  { id: 'cyclohexane', name: 'cyclohexane', smiles: 'C1CCCCC1', sig: [S(1.4, 's', 12, null, 'alkyl', 'all twelve hydrogens, one environment')],
    frags: [['(CH2)6', 0]], tell: 'One singlet for twelve hydrogens. The ring flips fast, so every hydrogen averages to the same environment.' }
];

const MULT_NAME = { s: 'singlet', d: 'doublet', t: 'triplet', q: 'quartet', quint: 'quintet', sext: 'sextet', sept: 'septet', m: 'multiplet', br: 'broad singlet' };
const PASCAL = { s: [1], d: [1, 1], t: [1, 2, 1], q: [1, 3, 3, 1], quint: [1, 4, 6, 4, 1], sext: [1, 5, 10, 10, 5, 1], sept: [1, 6, 15, 20, 15, 6, 1] };
const MULT_BY_N = ['s', 'd', 't', 'q', 'quint', 'sext', 'sept'];
const ROLE_TEXT = { aldehyde: 'the aldehyde H', acid: 'the carboxylic acid O-H', OH: 'the alcohol O-H', nextToO: 'the hydrogens on the carbon bonded to the oxygen', nextToX: 'the hydrogens on the carbon bonded to the halogen', alphaCO: 'the hydrogens on the carbon next to the carbonyl' };
const ROLE_RANGE = { aldehyde: [9, 10.5], acid: [10.5, 13], aromatic: [6.5, 8.5], nextToO: [3, 4.5], nextToX: [3, 4.5], alphaCO: [2, 2.7], alkyl: [0.7, 2.7], OH: [1, 5.5] };
const REGIONS = [[10.5, 13, 'acid'], [9, 10.5, 'aldehyde'], [6.5, 8.5, 'aromatic'], [4.5, 6.5, 'vinyl'], [3, 4.5, 'next to O or X'], [0.5, 2.7, 'alkyl']];

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
// molecular formula from a simple organic SMILES (implicit hydrogens filled by valence)
function formulaOf(smi){
  const VAL = { C: 4, N: 3, O: 2, S: 2, P: 3, F: 1, Cl: 1, Br: 1, I: 1, B: 3 };
  const atoms = [], rings = {}, stack = []; let prev = -1, order = 0, i = 0;
  const bond = (a, b, o) => { atoms[a].bonds += o; atoms[b].bonds += o; };
  while (i < smi.length){
    const ch = smi[i];
    if (ch === '['){
      const j = smi.indexOf(']', i), m = smi.slice(i + 1, j).match(/^(\d*)([A-Z][a-z]?|[a-z]{1,2})(@*)(H\d*)?([+-]\d*)?/);
      const el = m[2], arom = el === el.toLowerCase(), hs = m[4] ? (m[4].length > 1 ? parseInt(m[4].slice(1), 10) : 1) : 0;
      atoms.push({ el: arom ? el[0].toUpperCase() + el.slice(1) : el, arom, hs, bonds: 0, bracket: true });
      if (prev >= 0) bond(prev, atoms.length - 1, order || 1); prev = atoms.length - 1; order = 0; i = j + 1; continue;
    }
    if (/[A-Z]/.test(ch)){ let el = ch; if ((ch === 'C' && smi[i + 1] === 'l') || (ch === 'B' && smi[i + 1] === 'r')){ el += smi[i + 1]; i++; } atoms.push({ el, arom: false, hs: null, bonds: 0 }); if (prev >= 0) bond(prev, atoms.length - 1, order || 1); prev = atoms.length - 1; order = 0; i++; continue; }
    if (/[a-z]/.test(ch)){ atoms.push({ el: ch.toUpperCase(), arom: true, hs: null, bonds: 0 }); if (prev >= 0) bond(prev, atoms.length - 1, order || 1); prev = atoms.length - 1; order = 0; i++; continue; }
    if (ch === '='){ order = 2; i++; continue; } if (ch === '#'){ order = 3; i++; continue; }
    if (ch === '-' || ch === '/' || ch === '\\' || ch === ':'){ order = 1; i++; continue; }
    if (ch === '('){ stack.push(prev); i++; continue; } if (ch === ')'){ prev = stack.pop(); i++; continue; } if (ch === '.'){ prev = -1; i++; continue; }
    if (/\d/.test(ch) || ch === '%'){ let key; if (ch === '%'){ key = smi.slice(i + 1, i + 3); i += 3; } else { key = ch; i++; } if (rings[key] != null){ bond(rings[key].idx, prev, order || rings[key].order || 1); delete rings[key]; } else rings[key] = { idx: prev, order }; order = 0; continue; }
    i++;
  }
  const out = { C: 0, H: 0, N: 0, O: 0, X: 0 };
  for (const a of atoms){
    if (a.el === 'C') out.C++; else if (a.el === 'N') out.N++; else if (a.el === 'O') out.O++; else if (a.el === 'F' || a.el === 'Cl' || a.el === 'Br' || a.el === 'I') out.X++;
    out.H += a.bracket ? a.hs : Math.max(0, (VAL[a.el] || 0) - a.bonds - (a.arom ? 1 : 0));
  }
  return out;
}
function totalH(m){ return m.sig.reduce((s, x) => s + x.H, 0); }
function signature(m){ return m.sig.length + ':' + m.sig.map(s => s.mult + s.H).join(','); }
function sigWords(m){ return m.sig.map(s => 'a ' + MULT_NAME[s.mult] + ' at ' + s.ppm + ' (' + s.H + 'H)').join(', '); }
function subText(api, t){ const span = api.el('span', {}); t.split(/(\d+)/).forEach((p, i) => { if (!p) return; span.append(i % 2 ? api.el('sub', { text: p }) : p); }); return span; }

/* ------------------------------------------------------------------ */
/* the condensed structure strip with fragments lit by signal           */
/* ------------------------------------------------------------------ */
function drawStrip(api, m, lit){   // lit: Set of signal indices to light gold; others ink
  const C = api.colors, el = api.el;
  const row = el('div', { style: { fontFamily: MONO, fontSize: '17px', color: C.ink2, display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '0', margin: '8px 0 0' } });
  m.frags.forEach((f, i) => {
    const idx = f[1] == null ? [] : Array.isArray(f[1]) ? f[1] : [f[1]];
    const on = idx.some(k => lit && lit.has(k));
    if (i > 0 && !f[0].startsWith('(')) row.append(el('span', { text: '-', style: { color: C.ink3 } }));
    const s = subText(api, f[0]);
    Object.assign(s.style, { color: on ? C.goldhi : (idx.length ? C.ink : C.ink3), fontWeight: on ? '700' : '400', borderBottom: on ? '2px solid ' + C.gold : '2px solid transparent', padding: '0 2px' });
    row.append(s);
  });
  return row;
}

/* ------------------------------------------------------------------ */
/* the stick spectrum                                                   */
/* ------------------------------------------------------------------ */
// o: { mini, show (Set of signal indices, default all), lit (signal index), integ, regions, onTap(i), label }
function drawHNMR(api, m, o){
  o = o || {};
  const C = api.colors, svg = api.svg, mini = !!o.mini;
  const W = mini ? 300 : 760, H = mini ? 120 : 296;
  const L = mini ? 8 : 34, R = mini ? 292 : 742, T = mini ? 8 : 48, B = mini ? 96 : 236;
  const S = mini ? T : 12;
  const x = ppm => L + (12.6 - ppm) / 12.9 * (R - L);
  const J = mini ? 0.07 : 0.085;
  const show = o.show || new Set(m.sig.map((s, i) => i));
  const root = svg('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': o.label || ('1H NMR of ' + m.name), style: { width: '100%', height: 'auto', display: 'block' } });
  if (!mini && o.regions !== false){
    const cols = { acid: C.coral, aldehyde: C.goldhi, aromatic: C.green, vinyl: C.blue, 'next to O or X': C.blue, alkyl: C.grey };
    for (const [a, b, name] of REGIONS){
      root.append(svg('rect', { x: x(b).toFixed(1), y: S, width: (x(a) - x(b)).toFixed(1), height: B - S, fill: cols[name], 'fill-opacity': .07 }));
      root.append(svg('text', { x: ((x(a) + x(b)) / 2).toFixed(1), y: S + 18, fill: cols[name], 'font-family': SERIF, 'font-size': 13, 'text-anchor': 'middle', text: name === 'acid' ? 'acid 12' : name === 'aldehyde' ? 'aldehyde 9 to 10' : name === 'aromatic' ? 'aromatic 7' : name === 'vinyl' ? 'vinyl 5 to 6' : name === 'alkyl' ? 'alkyl 1 to 2' : 'next to O or X 3 to 4' }));
    }
  }
  // axis
  root.append(svg('line', { x1: L, y1: B, x2: R, y2: B, stroke: C.ink3, 'stroke-width': 1 }));
  for (let p = 0; p <= 12; p += mini ? 2 : 1){
    root.append(svg('line', { x1: x(p), y1: B, x2: x(p), y2: B + 4, stroke: C.ink3 }));
    root.append(svg('text', { x: x(p), y: B + (mini ? 12 : 16), fill: C.ink3, 'font-family': MONO, 'font-size': mini ? 8 : 11, 'text-anchor': 'middle', text: String(p) }));
  }
  if (!mini) root.append(svg('text', { x: (L + R) / 2, y: H - 6, fill: C.ink3, 'font-family': MONO, 'font-size': 10, 'text-anchor': 'middle', text: 'ppm, 12 on the left, 0 on the right' }));
  // heights: the tallest line of a signal grows with its integration, the rest follow Pascal
  const maxH = Math.max(...m.sig.map(s => s.H));
  const room = (B - T) * (mini ? .8 : .72);
  const tall = s => room * (0.35 + 0.65 * Math.sqrt(s.H / maxH));
  const gHit = svg('g');
  m.sig.forEach((s, i) => {
    if (!show.has(i)) return;
    const lit = o.lit === i, col = lit ? C.goldhi : C.ink;
    const g = svg('g');
    if (s.mult === 'br'){
      const h = tall(s) * .55, w = mini ? 8 : 16;
      const pts = []; for (let k = -w; k <= w; k++){ const xx = x(s.ppm) + k; const yy = B - h * Math.exp(-(k * k) / (2 * (w / 2.6) * (w / 2.6))); pts.push((k === -w ? 'M' : 'L') + xx.toFixed(1) + ',' + yy.toFixed(1)); }
      g.append(svg('path', { d: pts.join(' '), fill: 'none', stroke: col, 'stroke-width': mini ? 1.2 : 1.8 }));
    } else {
      const rows = s.mult === 'm' ? [2, 3, 5, 4, 3, 2] : PASCAL[s.mult];
      const mx = Math.max(...rows), n = rows.length, th = tall(s);
      rows.forEach((r, k) => { const xx = x(s.ppm + (k - (n - 1) / 2) * J * (s.mult === 'm' ? 0.75 : 1)); const h = th * r / mx; g.append(svg('line', { x1: xx.toFixed(1), y1: B, x2: xx.toFixed(1), y2: (B - h).toFixed(1), stroke: col, 'stroke-width': mini ? 1.2 : 1.8 })); });
    }
    if (lit) root.append(svg('rect', { x: (x(s.ppm) - (mini ? 12 : 26)).toFixed(1), y: T, width: mini ? 24 : 52, height: B - T, fill: C.gold, 'fill-opacity': .12, rx: 4 }));
    root.append(g);
    if (!mini) root.append(svg('text', { x: x(s.ppm).toFixed(1), y: (B - tall(s) - 8).toFixed(1), fill: lit ? C.goldhi : C.ink2, 'font-family': MONO, 'font-size': 11, 'text-anchor': 'middle', text: s.ppm + ' ' + s.mult + ' ' + s.H + 'H' }));
    if (o.onTap){
      const hit = svg('rect', { x: (x(s.ppm) - 26).toFixed(1), y: T, width: 52, height: B - T, fill: 'transparent', style: { cursor: 'pointer' } });
      hit.addEventListener('click', () => o.onTap(i)); gHit.append(hit);
    }
  });
  // integration steps: cumulative from the left (high ppm), the step height is the H count
  if (o.integ && !mini){
    const shown = m.sig.map((s, i) => i).filter(i => show.has(i)).sort((a, b) => m.sig[b].ppm - m.sig[a].ppm);
    const total = shown.reduce((t, i) => t + m.sig[i].H, 0);
    const y0 = T + 34, span = (B - T) * .32, unit = span / Math.max(total, 1);
    let acc = 0, d = 'M' + L + ',' + y0.toFixed(1);
    for (const i of shown){ const s = m.sig[i]; const xa = x(s.ppm + 0.3), xb = x(s.ppm - 0.3); d += ' L' + xa.toFixed(1) + ',' + (y0 - acc * unit).toFixed(1); acc += s.H; d += ' L' + xb.toFixed(1) + ',' + (y0 - acc * unit).toFixed(1); root.append(svg('text', { x: (xb + 4).toFixed(1), y: (y0 - acc * unit + 4).toFixed(1), fill: C.gold, 'font-family': MONO, 'font-size': 11, text: s.H + 'H' })); }
    d += ' L' + R + ',' + (y0 - acc * unit).toFixed(1);
    root.append(svg('path', { d, fill: 'none', stroke: C.gold, 'stroke-width': 1.5, 'stroke-opacity': .9 }));
  }
  root.append(gHit);
  return root;
}
// the zoom on one multiplet: the lines with Pascal heights and the counting sentence
function drawZoom(api, s){
  const C = api.colors, svg = api.svg;
  const W = 340, H = 170, B = 120;
  const root = svg('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': 'zoom on the ' + MULT_NAME[s.mult], style: { width: '100%', maxWidth: '360px', height: 'auto', display: 'block' } });
  root.append(svg('line', { x1: 20, y1: B, x2: W - 20, y2: B, stroke: C.ink3 }));
  const rows = s.mult === 'br' ? [1] : s.mult === 'm' ? [2, 3, 5, 4, 3, 2] : PASCAL[s.mult];
  const mx = Math.max(...rows), n = rows.length, gap = Math.min(40, (W - 80) / Math.max(n, 2));
  rows.forEach((r, k) => {
    const xx = W / 2 + (k - (n - 1) / 2) * gap, h = 80 * r / mx;
    if (s.mult === 'br'){ const pts = []; for (let q = -30; q <= 30; q++) pts.push((q === -30 ? 'M' : 'L') + (xx + q).toFixed(1) + ',' + (B - 50 * Math.exp(-(q * q) / 200)).toFixed(1)); root.append(svg('path', { d: pts.join(' '), fill: 'none', stroke: C.goldhi, 'stroke-width': 2 })); }
    else root.append(svg('line', { x1: xx, y1: B, x2: xx, y2: B - h, stroke: C.goldhi, 'stroke-width': 2.4 }));
    if (s.mult !== 'br' && s.mult !== 'm') root.append(svg('text', { x: xx, y: B - h - 6, fill: C.gold, 'font-family': MONO, 'font-size': 12, 'text-anchor': 'middle', text: String(r) }));
  });
  const line = s.mult === 'br' ? 'A broad singlet: the O-H swaps too fast to split, and the oxygen blocks its neighbors.' : s.mult === 'm' ? 'A multiplet: overlapping ring hydrogens. Count it as one signal and move on.' : s.nb == null ? 'A singlet: the neighbors are equivalent hydrogens, and equivalent hydrogens do not split each other.' : 'n = ' + s.nb + ' neighbor' + (s.nb === 1 ? '' : 's') + ', so ' + s.nb + ' + 1 = ' + (s.nb + 1) + ' line' + (s.nb ? 's' : '') + ': a ' + MULT_NAME[s.mult] + '. Heights ' + rows.join(' : ') + '.';
  root.append(svg('text', { x: W / 2, y: H - 22, fill: C.ink, 'font-family': SERIF, 'font-size': 13, 'text-anchor': 'middle', text: line.length > 62 ? line.slice(0, line.lastIndexOf(' ', 62)) : line }));
  if (line.length > 62) root.append(svg('text', { x: W / 2, y: H - 6, fill: C.ink, 'font-family': SERIF, 'font-size': 13, 'text-anchor': 'middle', text: line.slice(line.lastIndexOf(' ', 62) + 1) }));
  return root;
}

/* ------------------------------------------------------------------ */
/* generators (pure). The answer is always the table entry.             */
/* ------------------------------------------------------------------ */
function numberChoices(rng, v){
  const cands = [v - 2, v - 1, v + 1, v + 2, v + 3].filter(x => x >= 1);
  const picks = []; const pool = cands.slice();
  while (picks.length < 3 && pool.length) picks.push(pool.splice(Math.floor(rng() * pool.length), 1)[0]);
  return shuffleWith(rng, [{ text: String(v), ok: true }, ...picks.map(p => ({ text: String(p), ok: false }))]);
}
function genCount(rng){ const m = pickWith(rng, NMR); return { kind: 'count', mol: m, choices: numberChoices(rng, m.sig.length) }; }
function genMatch(rng){
  const m = pickWith(rng, NMR);
  const pool = NMR.filter(x => x.id !== m.id && signature(x) !== signature(m));
  const others = [], used = new Set([signature(m)]);
  for (const x of shuffleWith(rng, pool)){ if (used.has(signature(x))) continue; used.add(signature(x)); others.push(x); if (others.length === 3) break; }
  const choices = shuffleWith(rng, [{ mol: m, smiles: m.smiles, ok: true }, ...others.map(x => ({ mol: x, smiles: x.smiles, ok: false }))]);
  return { kind: 'match', mol: m, choices };
}
const SPLIT_POOL = NMR.flatMap(m => m.sig.map((s, i) => ({ m, s, i })).filter(q => q.s.nb != null && PASCAL[q.s.mult]));
function genSplit(rng){
  const q = pickWith(rng, SPLIT_POOL);
  const names = MULT_BY_N.map(k => MULT_NAME[k]).filter(n => n !== MULT_NAME[q.s.mult]);
  const others = shuffleWith(rng, names).slice(0, 3);
  const choices = shuffleWith(rng, [{ text: MULT_NAME[q.s.mult], ok: true }, ...others.map(n => ({ text: n, ok: false }))]);
  return { kind: 'split', mol: q.m, sig: q.s, idx: q.i, choices };
}
const TAP_POOL = NMR.flatMap(m => { if (m.sig.length < 2) return []; const out = []; for (const role of Object.keys(ROLE_TEXT)){ const hits = m.sig.map((s, i) => s.role === role ? i : -1).filter(i => i >= 0); if (hits.length === 1) out.push({ m, role, i: hits[0] }); } return out; });
function genTap(rng){
  const q = pickWith(rng, TAP_POOL);
  const choices = q.m.sig.map((s, i) => ({ text: s.ppm + ' ppm, ' + MULT_NAME[s.mult] + ', ' + s.H + 'H', ok: i === q.i, idx: i }));
  return { kind: 'tap', mol: q.m, role: q.role, idx: q.i, choices };
}
function coachFor(g){
  if (g.kind === 'count') return 'Count the different hydrogen environments, and let symmetry fold the equal ones together. ' + g.mol.tell;
  if (g.kind === 'match') return 'Count the signals first and cross out every structure with a different count, then check the splitting. ' + g.mol.tell;
  if (g.kind === 'split') return g.sig.nb + ' neighbor' + (g.sig.nb === 1 ? '' : 's') + ' plus one is ' + (g.sig.nb + 1) + ' lines. Count every hydrogen on the neighboring carbons, all of them.';
  return 'Where it sits tells you what it is: acid near 12, aldehyde near 9 to 10, ring near 7, next to O or a halogen near 3 to 4, alkyl near 1. ' + g.mol.tell;
}

/* ------------------------------------------------------------------ */
/* makeItem for the Summit                                              */
/* ------------------------------------------------------------------ */
function toSummit(g){
  const base = { sub: null, reagent: null, prod: null, coach: coachFor(g), home: meta.id, roots: ROOTS, source: 'generated' };
  if (g.kind === 'count') return Object.assign(base, { stem: 'How many signals appear in the 1H NMR spectrum of this molecule?', sub: g.mol.smiles, choices: g.choices.map(c => ({ text: c.text, smiles: null })), correct: g.choices.findIndex(c => c.ok) });
  if (g.kind === 'match') return Object.assign(base, { stem: 'A compound shows this 1H NMR: ' + sigWords(g.mol) + '. Which structure fits?', choices: g.choices.map(c => ({ text: '', smiles: c.smiles })), correct: g.choices.findIndex(c => c.ok) });
  return Object.assign(base, { stem: 'In ' + g.mol.name + ', the hydrogens of ' + g.sig.label.replace(/,.*$/, '') + ' appear as which multiplet?', sub: g.mol.smiles, choices: g.choices.map(c => ({ text: c.text, smiles: null })), correct: g.choices.findIndex(c => c.ok) });
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
  if (bank.length && api.rng() < 0.4) return trimBank(api, api.pick(bank));
  const r = api.rng();
  return toSummit(r < 0.34 ? genCount(api.rng) : r < 0.67 ? genMatch(api.rng) : genSplit(api.rng));
}

/* ------------------------------------------------------------------ */
/* mount                                                                */
/* ------------------------------------------------------------------ */
export function mount(slots, api){
  const C = api.colors, el = api.el;

  /* ---------- VISUAL ---------- */
  let cur = NMR[0], mode = 'all', revealed = 0, integ = true, zoomAt = -1;
  const chips = el('div', { class: 'controls', style: { marginTop: '0' } });
  const head = el('div', { style: { display: 'flex', gap: '16px', alignItems: 'flex-start', flexWrap: 'wrap', margin: '12px 0 8px' } });
  const molCard = el('div', { style: { width: '250px', flex: 'none', background: 'rgba(255,255,255,.02)', border: '1px solid ' + C.line, borderRadius: '10px', padding: '8px' } });
  const molPic = el('div', {}); const stripHost = el('div', {});
  molCard.append(molPic, stripHost);
  const side = el('div', { style: { flex: '1 1 300px', minWidth: '0' } });
  const nameEl = el('div', { style: { fontFamily: SERIF, fontSize: '22px', color: C.ink } });
  const countEl = el('div', { style: { fontFamily: MONO, fontSize: '11px', letterSpacing: '.14em', textTransform: 'uppercase', color: C.gold, margin: '2px 0 8px' } });
  const ledger = el('ol', { style: { margin: '0 0 8px', paddingLeft: '20px', fontSize: '15px', color: C.ink } });
  const tellEl = el('p', { style: { margin: '0', fontSize: '15px', color: C.ink2, fontFamily: SERIF } });
  side.append(nameEl, countEl, ledger, tellEl);
  head.append(molCard, side);
  const stage = el('div', {});
  const modes = el('div', { class: 'controls' });
  const chipAll = el('button', { type: 'button', class: 'chip', text: 'Show every signal', 'aria-pressed': 'true', onclick(){ mode = 'all'; revealed = cur.sig.length; paint(); } });
  const chipCount = el('button', { type: 'button', class: 'chip', text: 'Count the peaks', 'aria-pressed': 'false', onclick(){ mode = 'count'; revealed = 0; paint(); } });
  const btnReveal = el('button', { type: 'button', class: 'secondary', text: 'Reveal the next signal', onclick(){ if (revealed < cur.sig.length) revealed++; paint(); } });
  const chipInteg = el('button', { type: 'button', class: 'chip', text: 'Integration steps', 'aria-pressed': 'true', onclick(){ integ = !integ; chipInteg.setAttribute('aria-pressed', String(integ)); paint(); } });
  modes.append(chipAll, chipCount, btnReveal, chipInteg);
  const zoomRow = el('div', { class: 'controls' });
  const zoomHost = el('div', { style: { marginTop: '8px' } });
  const hint = el('div', { style: { fontFamily: MONO, fontSize: '12px', color: C.ink3, marginTop: '8px' }, text: 'Tap a peak on the spectrum, or a zoom chip, to open its n plus 1 lines.' });
  slots.visual.append(chips, head, stage, modes, hint, zoomRow, zoomHost);

  function order(){ return cur.sig.map((s, i) => i).sort((a, b) => cur.sig[b].ppm - cur.sig[a].ppm); }   // left to right on the plot
  function paint(){
    chipAll.setAttribute('aria-pressed', String(mode === 'all')); chipCount.setAttribute('aria-pressed', String(mode === 'count'));
    btnReveal.style.display = mode === 'count' ? '' : 'none'; btnReveal.disabled = revealed >= cur.sig.length;
    btnReveal.textContent = revealed >= cur.sig.length ? 'All ' + cur.sig.length + ' signals found' : 'Reveal the next signal';
    const ord = order();
    const shown = new Set(mode === 'all' ? ord : ord.slice(0, revealed));
    const lit = mode === 'count' && revealed > 0 ? ord[revealed - 1] : zoomAt;
    clear(stage); stage.append(drawHNMR(api, cur, { show: shown, lit, integ, onTap(i){ zoomAt = i; paint(); } }));
    clear(stripHost); stripHost.append(drawStrip(api, cur, mode === 'count' ? new Set(lit >= 0 ? [lit] : []) : new Set(zoomAt >= 0 ? [zoomAt] : [])));
    countEl.textContent = mode === 'count' ? (revealed + ' of ' + cur.sig.length + ' signals found') : (cur.sig.length + ' signal' + (cur.sig.length === 1 ? '' : 's') + ', ' + totalH(cur) + ' hydrogens');
    clear(ledger);
    for (const i of (mode === 'count' ? ord.slice(0, revealed) : ord)){
      const s = cur.sig[i];
      const li = el('li', { style: { margin: '2px 0', color: i === lit ? C.goldhi : C.ink } });
      li.append(el('b', { text: s.ppm + ' ppm, ' + MULT_NAME[s.mult] + ', ' + s.H + 'H. ' }), s.label.charAt(0).toUpperCase() + s.label.slice(1) + '.' + (s.nb != null && PASCAL[s.mult] && s.mult !== 's' ? ' ' + s.nb + ' + 1 = ' + (s.nb + 1) + ' lines.' : ''));
      ledger.append(li);
    }
    tellEl.textContent = mode === 'count' && revealed < cur.sig.length ? 'Scan left to right. Each new peak is one more hydrogen environment.' : cur.tell;
    clear(zoomRow); zoomRow.append(el('span', { style: { fontFamily: MONO, fontSize: '11px', color: C.ink3, letterSpacing: '.12em', textTransform: 'uppercase' }, text: 'zoom' }));
    cur.sig.forEach((s, i) => zoomRow.append(el('button', { type: 'button', class: 'chip', text: s.ppm + ' ' + s.mult, 'aria-pressed': String(zoomAt === i), onclick(){ zoomAt = zoomAt === i ? -1 : i; paint(); } })));
    clear(zoomHost); if (zoomAt >= 0 && cur.sig[zoomAt]) zoomHost.append(drawZoom(api, cur.sig[zoomAt]));
  }
  function show(m){
    cur = m; zoomAt = -1; revealed = mode === 'count' ? 0 : m.sig.length;
    for (const b of chips.children) b.setAttribute('aria-pressed', String(b.dataset.id === m.id));
    clear(molPic); api.drawSmiles(molPic, m.smiles, { width: 230, height: 130, label: m.name });
    nameEl.textContent = m.name;
    paint();
  }
  for (const m of NMR) chips.append(el('button', { type: 'button', class: 'chip', text: m.name, dataset: { id: m.id }, 'aria-pressed': 'false', onclick: () => show(m) }));
  show(cur);

  /* ---------- YOU TRY ---------- */
  const bank = api.bank && api.bank.items ? api.bank.items(meta.id) : [];
  let turn = 0;
  function generated(){
    const k = turn % 4;
    if (k === 0){
      const g = genCount(api.rng);
      const node = el('div', { style: { maxWidth: '280px' } }); api.drawSmiles(node, g.mol.smiles, { width: 260, height: 150, label: 'a structure' });
      return { prompt: 'How many signals in the 1H NMR of this molecule?', node, choices: g.choices, coach: coachFor(g) };
    }
    if (k === 1){
      const g = genMatch(api.rng);
      return { prompt: 'Which structure matches this spectrum?', node: drawHNMR(api, g.mol, { integ: true, label: 'a 1H NMR spectrum' }), choices: g.choices.map(c => ({ smiles: c.smiles, label: c.mol.name, ok: c.ok })), coach: coachFor(g) };
    }
    if (k === 2){
      const g = genSplit(api.rng);
      const node = el('div', { style: { maxWidth: '300px' } }); api.drawSmiles(node, g.mol.smiles, { width: 260, height: 150, label: g.mol.name }); node.append(drawStrip(api, g.mol, new Set([g.idx])));
      return { prompt: 'In ' + g.mol.name + ', what splitting do the highlighted hydrogens (' + g.sig.label.replace(/,.*$/, '') + ') show?', node, choices: g.choices, coach: coachFor(g) };
    }
    const g = genTap(api.rng);
    let btns = null;
    const node = drawHNMR(api, g.mol, { integ: false, regions: true, label: 'a 1H NMR spectrum', onTap(i){ if (btns && btns[i]) btns[i].click(); } });
    return { prompt: 'Tap the signal that belongs to ' + ROLE_TEXT[g.role] + '.', node, choices: g.choices, coach: coachFor(g), link(b){ btns = b; } };
  }
  function fromBank(it){
    const t = api.bank.toItem(it);
    let node = null;
    if (t.sub){ node = el('div', { style: { maxWidth: '280px' } }); api.drawSmiles(node, t.sub, { width: 260, height: 160, label: 'the structure in the question' }); }
    return { prompt: t.stem, node, choices: t.choices.map((c, i) => ({ text: c.text, smiles: c.smiles, ok: i === t.correct })), coach: t.coach, source: 'bank' };
  }
  runTry(slots.try, api, () => { turn++; if (bank.length && turn % 2 === 0) return fromBank(api.pick(bank)); return generated(); });
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
      const body = el('span', { style: { minWidth: '0' } });
      if (c.smiles){ const w = el('span', { style: { display: 'block', maxWidth: '230px' } }); api.drawSmiles(w, c.smiles, { width: 220, height: 130, label: c.label || 'a structure' }); body.append(w); }
      else if (c.node){ const w = el('span', { style: { display: 'block', maxWidth: '360px' } }); w.append(c.node); body.append(w); }
      if (c.text) body.append(el('span', { text: c.text, style: c.smiles ? { display: 'block', fontFamily: MONO, fontSize: '12px', color: C.ink3 } : {} }));
      const bt = el('button', { class: 'opt', type: 'button', 'aria-label': c.text || c.label || ('choice ' + 'ABCDE'[i]), onclick(){ if (done || bt.disabled) return; picked = i; btns.forEach((x, j) => x.classList.toggle('picked', j === i)); check.disabled = false; } },
        el('span', { class: 'k', text: 'ABCDE'[i] }), body);
      btns.push(bt); opts.append(bt);
    });
    if (item.link) item.link(btns);
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
  // 0. the formula reader is right on known molecules
  const known = [['CCO', 2, 6, 0, 1, 0], ['c1ccccc1', 6, 6, 0, 0, 0], ['CC(=O)O', 2, 4, 0, 2, 0], ['CCCC#N', 4, 7, 1, 0, 0], ['Cc1ccc(C)cc1', 8, 10, 0, 0, 0], ['ClCCCl', 2, 4, 0, 0, 2], ['[O-]C(=O)c1ccccc1', 7, 5, 0, 2, 0], ['[NH3+]c1ccccc1', 6, 8, 1, 0, 0], ['C1CCCCC1', 6, 12, 0, 0, 0], ['CC(C)(C)O', 4, 10, 0, 1, 0]];
  for (const [s, c, h, n, o, x] of known){ const f = formulaOf(s); if (f.C !== c || f.H !== h || f.N !== n || f.O !== o || f.X !== x) return { ok: false, tried, notes: 'formulaOf ' + s + ' gave ' + JSON.stringify(f) }; }
  // 1. the table proves itself
  if (NMR.length < 14) return { ok: false, tried, notes: 'table too small' };
  for (const m of NMR){
    if (!smilesSane(m.smiles) || !SMILES.includes(m.smiles)) return { ok: false, tried, notes: m.id + ': smiles not listed or not sane' };
    if (totalH(m) !== formulaOf(m.smiles).H) return { ok: false, tried, notes: m.id + ': integrations sum to ' + totalH(m) + ' but the formula has ' + formulaOf(m.smiles).H + ' H' };
    for (let i = 1; i < m.sig.length; i++) if (!(m.sig[i].ppm > m.sig[i - 1].ppm)) return { ok: false, tried, notes: m.id + ': signals not sorted' };
    for (const s of m.sig){
      if (!MULT_NAME[s.mult]) return { ok: false, tried, notes: m.id + ': unknown multiplicity ' + s.mult };
      if (s.nb != null && PASCAL[s.mult] && PASCAL[s.mult].length !== s.nb + 1) return { ok: false, tried, notes: m.id + ': ' + s.ppm + ' has ' + s.nb + ' neighbors but is a ' + MULT_NAME[s.mult] };
      if (s.mult === 'br' && s.role !== 'OH') return { ok: false, tried, notes: m.id + ': broad singlet that is not an O-H' };
      const r = ROLE_RANGE[s.role]; if (!r) return { ok: false, tried, notes: m.id + ': unknown role ' + s.role };
      if (!(s.ppm >= r[0] && s.ppm <= r[1])) return { ok: false, tried, notes: m.id + ': ' + s.role + ' at ' + s.ppm + ' is outside its landmark' };
      if (!s.label) return { ok: false, tried, notes: m.id + ': signal without a label' };
    }
    const covered = new Set();
    for (const f of m.frags){ const idx = f[1] == null ? [] : Array.isArray(f[1]) ? f[1] : [f[1]]; for (const k of idx){ if (!m.sig[k]) return { ok: false, tried, notes: m.id + ': fragment points at a missing signal' }; covered.add(k); } }
    if (covered.size !== m.sig.length) return { ok: false, tried, notes: m.id + ': strip does not cover every signal' };
    if (!m.tell) return { ok: false, tried, notes: m.id + ': no tell' };
  }
  if (!SPLIT_POOL.length || !TAP_POOL.length) return { ok: false, tried, notes: 'empty pools' };
  // 2. generators
  const rng = makeRng(20260904);
  for (let k = 0; k < 240; k++){
    const g = k % 4 === 0 ? genCount(rng) : k % 4 === 1 ? genMatch(rng) : k % 4 === 2 ? genSplit(rng) : genTap(rng);
    const oks = g.choices.filter(c => c.ok);
    if (oks.length !== 1) return { ok: false, tried, notes: g.kind + ': answer not unique' };
    if (g.kind !== 'tap' && g.choices.length !== 4) return { ok: false, tried, notes: g.kind + ': not four choices' };
    if (g.kind === 'count'){ if (Number(oks[0].text) !== g.mol.sig.length) return { ok: false, tried, notes: 'count mismatch' }; if (new Set(g.choices.map(c => c.text)).size !== 4) return { ok: false, tried, notes: 'count duplicates' }; }
    if (g.kind === 'match'){ if (oks[0].mol.id !== g.mol.id) return { ok: false, tried, notes: 'match mismatch' }; if (new Set(g.choices.map(c => signature(c.mol))).size !== 4 || new Set(g.choices.map(c => c.smiles)).size !== 4) return { ok: false, tried, notes: 'match signatures not distinct' }; }
    if (g.kind === 'split'){ if (oks[0].text !== MULT_NAME[MULT_BY_N[g.sig.nb]]) return { ok: false, tried, notes: 'split mismatch' }; if (new Set(g.choices.map(c => c.text)).size !== 4) return { ok: false, tried, notes: 'split duplicates' }; }
    if (g.kind === 'tap'){ if (g.mol.sig[g.idx].role !== g.role) return { ok: false, tried, notes: 'tap mismatch' }; if (g.mol.sig.filter(s => s.role === g.role).length !== 1) return { ok: false, tried, notes: 'tap role not unique' }; }
    tried++;
  }
  // 3. makeItem
  const api = tinyApi(deps, 77);
  for (let k = 0; k < 220; k++){
    const it = makeItem(api); tried++;
    if (!it || !Array.isArray(it.choices) || it.choices.length !== 4) return { ok: false, tried, notes: 'makeItem: not four choices' };
    if (!(it.correct >= 0 && it.correct < 4)) return { ok: false, tried, notes: 'makeItem: bad correct index' };
    if (new Set(it.choices.map(c => c.smiles || c.text)).size !== 4) return { ok: false, tried, notes: 'makeItem: duplicate choices' };
    for (const c of it.choices) if (c.smiles && !smilesSane(c.smiles)) return { ok: false, tried, notes: 'makeItem: bad smiles' };
    if (it.sub && !smilesSane(it.sub)) return { ok: false, tried, notes: 'makeItem: bad sub' };
    if (!it.coach || !it.stem) return { ok: false, tried, notes: 'makeItem: empty coach or stem' };
    if (it.home !== meta.id || !it.roots || !it.roots.length) return { ok: false, tried, notes: 'makeItem: home/roots' };
  }
  const a = makeItem(tinyApi(deps, 5)), b = makeItem(tinyApi(deps, 5));
  if (JSON.stringify(a) !== JSON.stringify(b)) return { ok: false, tried, notes: 'same seed gave a different item' };
  return { ok: true, tried, notes: NMR.length + ' molecules; integrations match formulas; n plus 1 matches every multiplet' };
}
