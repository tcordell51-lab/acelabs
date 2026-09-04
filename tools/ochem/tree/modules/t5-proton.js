// The Tree of Organic, Level 5, Branch 1: The first arrow is usually a proton.
// Proton transfer arrows, acid catalysis, and the pKa direction call. No imports (contract).
//
// Mechanism stage: every state is a list of species (SMILES drawn by api.drawSmiles, one inner
// <svg> each, placed at one shared scale inside one outer <svg>), curved gold arrows anchored to
// the rendered atom labels and to vertices rebuilt from the bond lines. The drawer does not show
// a charge on carbon, so carbocation and carbanion badges, lone pairs and explicit hydrogens are
// drawn here. The same engine sits in t5-sn-e and t5-addition.

export const meta = {
  id: 't5-proton',
  level: 5,
  order: 1,
  needs3D: false,
  title: 'The first arrow is usually a proton',
  concept: 'Proton transfer arrows and acid catalysis',
  tagline: 'Lone pair to proton, bond back to the atom. Then read the pKa.',
  story: 'Most mechanisms open with a proton moving, so learn that arrow first. A base has a lone pair; an acid has a hydrogen it can spare. The first arrow starts at the lone pair and lands on the proton, and a second arrow takes the old H-A bond electrons back onto the atom that held them. That is the whole move, and it never starts at a plus sign. Acid catalysis is the same move pointed at a carbonyl or an alcohol: protonate the oxygen and you get a hungrier electrophile, or a leaving group that is now water instead of hydroxide. Which way does it go? Toward the weaker acid, and you read that straight off the pKa: the side holding the acid with the higher pKa is the side the equilibrium sits on. Rule of thumb: lone pair to proton, bond to atom, then check the numbers.',
  moveName: 'Lone pair to proton, bond to atom, check the pKa',
  move: [
    'Find the base: the lone pair or the minus sign. The first arrow starts there.',
    'Find the acidic H: on oxygen, on nitrogen, on an sp carbon, or on H3O+. The first arrow lands on that H, never on the atom under it.',
    'Second arrow: from the H-A bond onto A, which keeps the pair and a charge one unit lower.',
    'Draw the products: the base gained an H, the acid kept a lone pair.',
    'Direction: compare the two acids. The equilibrium lies toward the acid with the higher pKa.'
  ],
  trap: 'Careful: the arrow lands on the hydrogen, not on the oxygen holding it, and it never starts at a plus sign; H3O+ is the acid, and its plus is not where electrons come from.',
  holdsUp: ['SN1 on an alcohol', 'Acid-catalyzed hydration', 'Acetylide formation', 'Enolate chemistry', 'Fischer esterification'],
  drill: 'Booster OChem: The Fundamentals'
};

// Every SMILES this module draws (states, partners, the pKa table).
export const SMILES = ['CCC=O', '[OH3+]', 'CCC=[OH+]', 'O', 'CC(C)(C)O', 'Br', 'CC(C)(C)[OH2+]', '[Br-]', 'CCC#C', '[NH2-]', 'CCC#[C-]', 'N', 'CC(C)=O', '[OH-]', 'CC(=C)[O-]', 'CCO', 'CC[O-]', 'CC(=O)O', 'CC(=O)[O-]', 'Cl', '[Cl-]'];

/* ------------------------------------------------------------------ */
/* Species: names plus the marks the drawer cannot show.                */
/* kind: lp (lone pair dots), + or - (charge badge on a carbon), H      */
/* (an explicit hydrogen label). at: an anchor spec (see resolve()).    */
/* ------------------------------------------------------------------ */
const SPECIES = {
  'CCC=O': { name: 'propanal', marks: [{ id: 'lpO', kind: 'lp', at: { t: 'O' } }] },
  '[OH3+]': { name: 'hydronium, H3O+', marks: [] },
  'CCC=[OH+]': { name: 'protonated propanal', marks: [] },
  'O': { name: 'water', marks: [{ id: 'lpO', kind: 'lp', at: { t: 'O' } }] },
  'CC(C)(C)O': { name: 'tert-butanol', marks: [{ id: 'lpO', kind: 'lp', at: { t: 'O' } }] },
  'Br': { name: 'HBr', marks: [] },
  'CC(C)(C)[OH2+]': { name: 'tert-butyl oxonium ion', marks: [] },
  '[Br-]': { name: 'bromide', marks: [{ id: 'lpBr', kind: 'lp', at: { t: 'Br' } }] },
  'CCC#C': { name: '1-butyne', marks: [{ id: 'H', kind: 'H', at: { v: { deg: 1, order: 'tpl' } } }] },
  '[NH2-]': { name: 'amide ion, NH2-', marks: [{ id: 'lpN', kind: 'lp', at: { t: 'N' } }] },
  'CCC#[C-]': { name: 'butynide, an acetylide', marks: [{ id: 'minus', kind: '-', at: { v: { deg: 1, order: 'tpl' } } }] },
  'N': { name: 'ammonia', marks: [{ id: 'lpN', kind: 'lp', at: { t: 'N' } }] },
  'CC(C)=O': { name: 'acetone', marks: [{ id: 'Ha', kind: 'H', at: { v: { deg: 1, pick: 'right' } } }] },
  '[OH-]': { name: 'hydroxide', marks: [{ id: 'lpO', kind: 'lp', at: { t: 'O' } }] },
  'CC(=C)[O-]': { name: 'acetone enolate', marks: [] },
  'CCO': { name: 'ethanol', marks: [] },
  'CC[O-]': { name: 'ethoxide', marks: [{ id: 'lpO', kind: 'lp', at: { t: 'O' } }] },
  'CC(=O)O': { name: 'acetic acid', marks: [] },
  'CC(=O)[O-]': { name: 'acetate', marks: [{ id: 'lpO', kind: 'lp', at: { t: 'O', q: '-' } }] },
  'Cl': { name: 'HCl', marks: [] },
  '[Cl-]': { name: 'chloride', marks: [{ id: 'lpCl', kind: 'lp', at: { t: 'Cl' } }] }
};
const nameOf = smi => (SPECIES[smi] && SPECIES[smi].name) || smi;

/* ------------------------------------------------------------------ */
/* The curated mechanisms. A state is main + partners (drawn to the     */
/* side named by `side`); partners tagged in `arrives` are new to the   */
/* scene (the self test uses that to check atoms and charge conserve).  */
/* Arrows anchor into a species: in = 'main' (default), 'w0', 'w1'.     */
/* ------------------------------------------------------------------ */
const MECHANISMS = [
  {
    id: 'carbonyl', chip: 'Carbonyl + H3O+', name: 'protonating a carbonyl', reagent: 'H3O+', roots: ['l2-acidity', 'l2-arrows', 'l2-bully'],
    states: [
      { main: 'CCC=O', with: ['[OH3+]'], side: 'left', label: 'propanal + H3O+' },
      { main: 'CCC=[OH+]', with: ['O'], side: 'left', label: 'protonated carbonyl + water' }
    ],
    steps: [{
      name: 'take the proton', nuc: 'the carbonyl oxygen', ele: 'the proton on H3O+',
      say: 'The carbonyl oxygen has lone pairs, so it is a base. It takes a proton from H3O+, and the O-H electrons fall back onto the water oxygen. Now the carbonyl carbon is a much better electrophile: the electron bully next door just got hungrier.',
      arrows: [
        { from: { m: 'lpO' }, to: { in: 'w0', t: 'O', part: 'H' }, bend: 1, fromName: 'the lone pair on the carbonyl oxygen', toName: 'the proton on H3O+', say: 'Lone pair to proton.' },
        { from: { in: 'w0', t: 'O', part: 'HB' }, to: { in: 'w0', t: 'O' }, bend: 1, fromName: 'the O-H bond of H3O+', toName: 'the oxygen of H3O+', say: 'The O-H electrons fall back on oxygen: water.' }
      ]
    }]
  },
  {
    id: 'alcohol', chip: 'Alcohol + HBr', name: 'protonating an alcohol (the first step of SN1)', reagent: 'HBr', roots: ['l2-acidity', 'l2-arrows', 'l2-carbocation'],
    states: [
      { main: 'CC(C)(C)O', with: ['Br'], side: 'left', label: 'tert-butanol + HBr' },
      { main: 'CC(C)(C)[OH2+]', with: ['[Br-]'], side: 'left', label: 'oxonium ion + bromide' }
    ],
    steps: [{
      name: 'take the proton', nuc: 'the alcohol oxygen', ele: 'the proton on HBr',
      say: 'OH is a terrible leaving group, because hydroxide is a strong base and strong bases do not leave. Protonate it and the leaving group becomes water, which leaves happily. That is why SN1 on an alcohol always opens with a proton.',
      arrows: [
        { from: { m: 'lpO' }, to: { in: 'w0', t: 'Br', part: 'H' }, bend: 1, fromName: 'the lone pair on the alcohol oxygen', toName: 'the proton on HBr', say: 'Lone pair to proton.' },
        { from: { in: 'w0', t: 'Br', part: 'HB' }, to: { in: 'w0', t: 'Br' }, bend: 1, fromName: 'the H-Br bond', toName: 'the bromine', say: 'The H-Br electrons fall back on bromine: bromide.' }
      ]
    }]
  },
  {
    id: 'alkyne', chip: 'Alkyne + NaNH2', name: 'deprotonating a terminal alkyne', reagent: 'NaNH2', roots: ['l2-acidity', 'l1-geometry', 'l2-arrows'],
    states: [
      { main: 'CCC#C', with: ['[NH2-]'], side: 'left', label: '1-butyne + amide ion' },
      { main: 'CCC#[C-]', with: ['N'], side: 'left', label: 'acetylide + ammonia' }
    ],
    steps: [{
      name: 'take the proton', nuc: 'the amide ion', ele: 'the sp C-H proton of the alkyne',
      say: 'The sp C-H is the most acidic hydrocarbon proton, pKa about 25, because an sp carbon holds its pair close. Amide is a strong enough base (ammonia is 38) to take it. The C-H electrons stay on carbon: an acetylide, a carbon nucleophile you can alkylate.',
      arrows: [
        { from: { in: 'w0', m: 'lpN' }, to: { m: 'H' }, bend: -1, fromName: 'the lone pair on the amide nitrogen', toName: 'the alkyne C-H proton', say: 'Lone pair to proton.' },
        { from: { mb: 'H' }, to: { v: { deg: 1, order: 'tpl' } }, bend: -1, fromName: 'the alkyne C-H bond', toName: 'the terminal alkyne carbon', say: 'The C-H electrons stay on carbon: a carbanion.' }
      ]
    }]
  },
  {
    id: 'enolate', chip: 'Ketone + hydroxide', name: 'making an enolate', reagent: 'NaOH', roots: ['l2-acidity', 'l2-resonance', 'l2-arrows'],
    states: [
      { main: 'CC(C)=O', with: ['[OH-]'], side: 'right', label: 'acetone + hydroxide' },
      { main: 'CC(=C)[O-]', with: ['O'], side: 'right', label: 'enolate + water' }
    ],
    steps: [{
      name: 'take the alpha proton', nuc: 'hydroxide', ele: 'an alpha C-H proton of acetone',
      say: 'Hydroxide takes a proton from the carbon next to the carbonyl, the alpha carbon (pKa about 20). The C-H electrons swing in to make a new pi bond, and the C=O pi bond kicks up onto the bully. Three arrows, one step. The enolate is the nucleophile behind aldol, Claisen and alkylation. Water is 15.7, so the equilibrium sits left; a little enolate is enough, and LDA would do it completely.',
      arrows: [
        { from: { in: 'w0', m: 'lpO' }, to: { m: 'Ha' }, bend: 1, fromName: 'the lone pair on hydroxide', toName: 'the alpha C-H proton', say: 'Lone pair to proton.' },
        { from: { mb: 'Ha' }, to: { b: [{ v: { deg: 1, pick: 'right' } }, { v: { deg: 3 } }] }, bend: -1, fromName: 'the alpha C-H bond', toName: 'the alpha carbon to carbonyl carbon bond', say: 'The C-H electrons become the new pi bond.' },
        { from: { b: 'dbl' }, to: { t: 'O' }, bend: 1, fromName: 'the C=O pi bond', toName: 'the carbonyl oxygen', say: 'The C=O pi bond kicks up onto oxygen.' }
      ]
    }]
  }
];

// The pKa table for the direction call (pKa of the acid; base = its conjugate).
const ACIDS = [
  { acid: 'Cl', acidName: 'HCl', base: '[Cl-]', baseName: 'chloride', pKa: -7 },
  { acid: '[OH3+]', acidName: 'H3O+', base: 'O', baseName: 'water', pKa: -1.7 },
  { acid: 'CC(=O)O', acidName: 'acetic acid', base: 'CC(=O)[O-]', baseName: 'acetate', pKa: 4.8 },
  { acid: 'O', acidName: 'water', base: '[OH-]', baseName: 'hydroxide', pKa: 15.7 },
  { acid: 'CCO', acidName: 'ethanol', base: 'CC[O-]', baseName: 'ethoxide', pKa: 16 },
  { acid: 'CCC#C', acidName: '1-butyne (a terminal alkyne)', base: 'CCC#[C-]', baseName: 'butynide (the acetylide)', pKa: 25 },
  { acid: 'N', acidName: 'ammonia', base: '[NH2-]', baseName: 'amide ion', pKa: 38 }
];
// The three see-saw pairs in the visual: acid index, base-of-acid index, and the CARDIO line to say.
const PAIRS = [
  { a: 2, b: 3, chip: 'Acetic acid + hydroxide', line: 'Strip both protons and compare acetate with hydroxide. Charge ties, Atom ties (oxygen, oxygen), Resonance separates them: acetate spreads its minus over two oxygens, so acetate is the happier base and acetic acid is the stronger acid. Toward the weaker acid: right, to water. About 10 to the 11th.' },
  { a: 5, b: 6, chip: 'Alkyne + NaNH2', line: 'Amide takes the alkyne proton. CARDIO Atom says nitrogen beats carbon, but the Orbital line shouts here: an sp carbon is half s-character and hugs its pair so tightly that the alkyne (25) is the stronger acid, ammonia (38) the weaker. Right, to ammonia and the acetylide. Know this pair by its numbers.' },
  { a: 5, b: 3, chip: 'Alkyne + hydroxide', line: 'Now try hydroxide on the same alkyne. Water is 15.7 and the alkyne is 25, so water is the stronger acid and the equilibrium sits on the left: hydroxide is not strong enough. That is exactly why the acetylide recipe says NaNH2, never NaOH.' }
];

/* ------------------------------------------------------------------ */
/* Node-safe helpers                                                    */
/* ------------------------------------------------------------------ */
function mulberry(seed){ let s = seed | 0; return function(){ s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function heavy(smi){ const s = smi.replace(/\[([A-Z][a-z]?|[a-z])[^\]]*\]/g, (m, g) => g); return (s.match(/Cl|Br|[BCNOSPFI]|[cnos]/g) || []).length; }
function charge(smi){ let q = 0; for (const b of smi.match(/\[[^\]]*\]/g) || []){ const p = /([+-])(\d?)/.exec(b); if (p) q += (p[1] === '+' ? 1 : -1) * (p[2] ? +p[2] : 1); } return q; }
function balanced(smi){ let d = 0; for (const ch of smi){ if (ch === '(') d++; if (ch === ')') d--; if (d < 0) return false; } if (d) return false; const ring = {}; for (const m of smi.replace(/\[[^\]]*\]/g, 'X').match(/\d/g) || []) ring[m] = (ring[m] || 0) + 1; return Object.values(ring).every(n => n % 2 === 0); }
function stateSmiles(st){ return (Array.isArray(st.main) ? st.main : [st.main]).concat(st.with || []); }
function fmtK(n){ return n === 0 ? '1' : '10 to the ' + Math.abs(n) + (Math.abs(n) === 1 ? 'st' : Math.abs(n) === 2 ? 'nd' : Math.abs(n) === 3 ? 'rd' : 'th'); }

/* ------------------------------------------------------------------ */
/* Item generators (pure). Every answer is computed from the tables.    */
/* ------------------------------------------------------------------ */
const KINDS = ['next', 'start', 'arrows', 'nuc', 'draw', 'equil', 'base'];
const WRONG_STARTS = ['the positive charge on H3O+', 'the hydrogen atom itself', 'the carbon skeleton'];
function allMains(){ const s = new Set(); for (const M of MECHANISMS) for (const st of M.states) if (!Array.isArray(st.main)) s.add(st.main); return [...s]; }
function pickN(rng, arr, n, not){ const pool = arr.filter(x => !not.includes(x)); const out = []; while (out.length < n && pool.length){ const i = Math.floor(rng() * pool.length); out.push(pool.splice(i, 1)[0]); } return out; }
function shuffled(rng, a){ const b = a.slice(); for (let i = b.length - 1; i > 0; i--){ const j = Math.floor(rng() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; }
function stepOf(rng){ const M = MECHANISMS[Math.floor(rng() * MECHANISMS.length)]; const i = Math.floor(rng() * M.steps.length); return { M, i, step: M.steps[i], state: M.states[i], nextState: M.states[i + 1] }; }
function genItem(rng, kind){
  kind = kind || KINDS[Math.floor(rng() * KINDS.length)];
  if (kind === 'next'){
    let pick; do { pick = stepOf(rng); } while (Array.isArray(pick.nextState.main));
    const ans = pick.nextState.main, h = heavy(ans);
    const others = allMains().filter(s => s !== ans && s !== pick.state.main);
    const same = others.filter(s => heavy(s) === h), rest = others.filter(s => heavy(s) !== h);
    let d = pickN(rng, same, 3, []); if (d.length < 3) d = d.concat(pickN(rng, rest, 3 - d.length, d));
    const choices = shuffled(rng, [ans].concat(d));
    return { kind, M: pick.M, i: pick.i, stem: 'Here is ' + pick.state.label + '. The step is: ' + pick.step.name + '. Which species comes next?', choices: choices.map(s => ({ text: nameOf(s), smiles: s })), correct: choices.indexOf(ans), coach: 'Push the arrows on the drawing: ' + pick.step.arrows.map(a => a.fromName + ' to ' + a.toName).join(', then ') + '. The product is ' + nameOf(ans) + '.', roots: pick.M.roots };
  }
  if (kind === 'start' || kind === 'draw'){
    const pick = stepOf(rng), ar = pick.step.arrows[0];
    const otherFrom = []; for (const M of MECHANISMS) for (const s of M.steps) for (const a of s.arrows) if (a.fromName !== ar.fromName && !otherFrom.includes(a.fromName)) otherFrom.push(a.fromName);
    if (kind === 'start'){
      const d = pickN(rng, WRONG_STARTS.concat(otherFrom), 3, [ar.fromName]);
      const choices = shuffled(rng, [ar.fromName].concat(d));
      return { kind, M: pick.M, i: pick.i, arrow: 0, stem: 'Here is ' + pick.state.label + '. Where does the FIRST arrow of this step (' + pick.step.name + ') start?', choices: choices.map(t => ({ text: t, smiles: null })), correct: choices.indexOf(ar.fromName), coach: 'Arrows start at electrons. Here the base is ' + pick.step.nuc + ', so the arrow starts at ' + ar.fromName + ' and lands on ' + ar.toName + '.', roots: pick.M.roots };
    }
    const right = 'from ' + ar.fromName + ' to ' + ar.toName;
    const others = []; for (const M of MECHANISMS) for (const s of M.steps) for (const a of s.arrows) if (a !== ar) others.push(a);
    const alt = others[Math.floor(rng() * others.length)];
    const cands = ['from ' + ar.toName + ' to ' + ar.fromName, 'from ' + ar.fromName + ' to ' + alt.toName, 'from ' + alt.fromName + ' to ' + ar.toName, 'from ' + alt.fromName + ' to ' + alt.toName];
    const d = pickN(rng, cands, 3, [right]);
    const choices = shuffled(rng, [right].concat(d));
    return { kind, M: pick.M, i: pick.i, arrow: 0, stem: 'Here is ' + pick.state.label + '. Draw the first arrow of the step (' + pick.step.name + '): where does it start, and where does it land?', choices: choices.map(t => ({ text: t, smiles: null })), correct: choices.indexOf(right), coach: 'Rich attacks poor. The electrons are on ' + pick.step.nuc + '; they go to ' + pick.step.ele + '. So: ' + right + '.', roots: pick.M.roots };
  }
  if (kind === 'arrows'){
    const pick = stepOf(rng), n = pick.step.arrows.length;
    const choices = shuffled(rng, [1, 2, 3, 4]);
    return { kind, M: pick.M, i: pick.i, stem: 'How many curved arrows does this step take: ' + pick.step.name + ', ' + pick.M.name + '?', choices: choices.map(k => ({ text: String(k) + (k === 1 ? ' arrow' : ' arrows'), smiles: null })), correct: choices.indexOf(n), coach: 'Count the bonds that change: one arrow per bond made or broken. Here: ' + pick.step.arrows.map(a => a.fromName + ' to ' + a.toName).join('; ') + '. That is ' + n + '.', roots: pick.M.roots };
  }
  if (kind === 'nuc'){
    const pick = stepOf(rng);
    const pool = []; for (const M of MECHANISMS) for (const s of M.steps){ if (s.nuc !== pick.step.nuc && !pool.includes(s.nuc)) pool.push(s.nuc); if (s.ele !== pick.step.nuc && !pool.includes(s.ele)) pool.push(s.ele); }
    const d = [pick.step.ele].concat(pickN(rng, pool, 2, [pick.step.ele, pick.step.nuc]));
    const choices = shuffled(rng, [pick.step.nuc].concat(d));
    return { kind, M: pick.M, i: pick.i, stem: 'In this step (' + pick.step.name + ', ' + pick.M.name + '), which species is the nucleophile, the base doing the attacking?', choices: choices.map(t => ({ text: t, smiles: null })), correct: choices.indexOf(pick.step.nuc), coach: 'The nucleophile is the electron-rich one, the one with the lone pair or the minus: ' + pick.step.nuc + '. The proton it takes belongs to ' + pick.step.ele + '.', roots: pick.M.roots };
  }
  if (kind === 'equil'){
    let A, B; do { A = ACIDS[Math.floor(rng() * ACIDS.length)]; B = ACIDS[Math.floor(rng() * ACIDS.length)]; } while (A === B || Math.abs(A.pKa - B.pKa) < 1);
    const right = B.pKa > A.pKa;   // products hold HB; the weaker acid (higher pKa) wins the side
    const opts = ['Right, toward ' + B.acidName + ' and ' + A.baseName, 'Left, toward ' + A.acidName + ' and ' + B.baseName, 'Evenly balanced', 'It depends on the concentrations, not the pKa'];
    const choices = shuffled(rng, opts), ans = right ? opts[0] : opts[1];
    const n = Math.round(Math.abs(A.pKa - B.pKa));
    return { kind, stem: A.acidName + ' (pKa ' + A.pKa + ') meets ' + B.baseName + ', the conjugate base of ' + B.acidName + ' (pKa ' + B.pKa + '). Which side does the equilibrium favor?', choices: choices.map(t => ({ text: t, smiles: null })), correct: choices.indexOf(ans), coach: 'The equilibrium lies toward the weaker acid, the higher pKa. ' + (right ? B.acidName + ' (' + B.pKa + ') is weaker than ' + A.acidName + ' (' + A.pKa + '), so it sits right' : A.acidName + ' (' + A.pKa + ') is weaker than ' + B.acidName + ' (' + B.pKa + '), so it sits left') + ', by about ' + fmtK(n) + '.', roots: ['l2-acidity'], pair: { A, B } };
  }
  // base: which base deprotonates this acid essentially completely (its conjugate acid pKa at least 2 units higher)
  let A, strong, weak;
  do { A = ACIDS[Math.floor(rng() * ACIDS.length)]; strong = ACIDS.filter(x => x.pKa >= A.pKa + 2); weak = ACIDS.filter(x => x.pKa <= A.pKa - 1); } while (!strong.length || weak.length < 3);
  const S = strong[Math.floor(rng() * strong.length)], W = pickN(rng, weak, 3, []);
  const choices = shuffled(rng, [S].concat(W));
  return { kind, stem: 'Which base takes the proton off ' + A.acidName + ' (pKa ' + A.pKa + ') essentially completely?', choices: choices.map(x => ({ text: x.baseName + ' (its conjugate acid ' + x.acidName + ' has pKa ' + x.pKa + ')', smiles: null })), correct: choices.indexOf(S), coach: 'A base deprotonates an acid completely when its own conjugate acid is the weaker acid by a wide margin, a higher pKa. ' + S.baseName + ' gives ' + S.acidName + ' (' + S.pKa + '), well above ' + A.pKa + '; the others sit below it, so the proton stays put.', roots: ['l2-acidity'] };
}

export function makeItem(api){
  const it = genItem(api.rng);
  const st = it.M ? it.M.states[it.i] : null;
  return { stem: it.stem, sub: st ? st.main : (it.pair ? it.pair.A.acid : null), reagent: st ? (st.with || []).map(nameOf).join(' + ') || null : (it.pair ? it.pair.B.baseName : null), prod: null, choices: it.choices, correct: it.correct, coach: it.coach, home: meta.id, roots: it.roots || ['l2-acidity', 'l2-arrows'] };
}

export function selfTest(deps){
  const rng = mulberry(51);
  const api = { rng, pick: a => a[Math.floor(rng() * a.length)], shuffle: a => shuffled(rng, a), reactions: deps && deps.reactions, bank: deps && deps.bank };
  // table invariants
  for (const M of MECHANISMS){
    if (M.steps.length !== M.states.length - 1) return { ok: false, tried: 0, notes: M.id + ': steps must be states minus one' };
    for (const st of M.states) for (const s of stateSmiles(st)){ if (!SMILES.includes(s)) return { ok: false, tried: 0, notes: M.id + ': ' + s + ' missing from SMILES' }; if (!SPECIES[s]) return { ok: false, tried: 0, notes: M.id + ': ' + s + ' missing from SPECIES' }; if (!balanced(s)) return { ok: false, tried: 0, notes: s + ' unbalanced' }; }
    for (let i = 0; i < M.steps.length; i++){
      const a = M.states[i], b = M.states[i + 1];
      const hv = st => stateSmiles(st).filter(s => !Array.isArray(st.main) || s !== st.main[1]).reduce((n, s) => n + heavy(s), 0);
      const qv = st => stateSmiles(st).filter(s => !Array.isArray(st.main) || s !== st.main[1]).reduce((n, s) => n + charge(s), 0);
      const arr = (b.arrives || []).reduce((n, j) => n + heavy(b.with[j]), 0), arrQ = (b.arrives || []).reduce((n, j) => n + charge(b.with[j]), 0);
      if (hv(a) + arr !== hv(b)) return { ok: false, tried: 0, notes: M.id + ' step ' + i + ': heavy atoms not conserved' };
      if (qv(a) + arrQ !== qv(b)) return { ok: false, tried: 0, notes: M.id + ' step ' + i + ': charge not conserved' };
      const step = M.steps[i];
      if (!step.arrows.length || !step.nuc || !step.ele || !step.say) return { ok: false, tried: 0, notes: M.id + ' step ' + i + ': incomplete' };
      for (const ar of step.arrows){
        const f = ar.from;
        const electrons = f.m != null || f.mb != null || f.b != null || (f.t && (f.part === 'HB')) || (f.t && !f.part && false);
        if (!electrons && !(f.t && f.part === 'HB')) return { ok: false, tried: 0, notes: M.id + ' step ' + i + ': an arrow starts at an atom, not at electrons' };
        if (!ar.fromName || !ar.toName) return { ok: false, tried: 0, notes: M.id + ': arrow needs names' };
      }
    }
  }
  // items
  let tried = 0; const seen = {};
  for (let n = 0; n < 320; n++){
    const it = makeItem(api); tried++;
    if (!it.choices || it.choices.length !== 4) return { ok: false, tried, notes: 'four choices required' };
    const keys = it.choices.map(c => c.smiles || c.text);
    if (new Set(keys).size !== 4) return { ok: false, tried, notes: 'choices not distinct: ' + keys.join(' | ') };
    if (!(it.correct >= 0 && it.correct < 4)) return { ok: false, tried, notes: 'bad correct index' };
    for (const c of it.choices) if (c.smiles && !balanced(c.smiles)) return { ok: false, tried, notes: 'unbalanced SMILES ' + c.smiles };
    if (it.sub && !balanced(it.sub)) return { ok: false, tried, notes: 'unbalanced sub' };
    if (!it.coach || !it.stem) return { ok: false, tried, notes: 'coach or stem empty' };
    if (it.home !== meta.id) return { ok: false, tried, notes: 'home' };
    seen[it.stem.slice(0, 12)] = 1;
  }
  // every kind builds, and the equilibrium call is right by construction: recheck against the table
  for (const k of KINDS){ const it = genItem(mulberry(7), k); if (!it || it.correct < 0) return { ok: false, tried, notes: k + ' failed' }; }
  for (let n = 0; n < 200; n++){ const it = genItem(rng, 'equil'); const A = it.pair.A, B = it.pair.B; const txt = it.choices[it.correct].text; if ((B.pKa > A.pKa) !== txt.startsWith('Right')) return { ok: false, tried, notes: 'equilibrium side wrong' }; }
  const a = genItem(mulberry(9)), b = genItem(mulberry(9));
  if (JSON.stringify(a) !== JSON.stringify(b)) return { ok: false, tried, notes: 'not reproducible' };
  return { ok: true, tried, notes: MECHANISMS.length + ' mechanisms, ' + KINDS.length + ' item kinds' };
}

/* ================================================================== */
/* Browser side: the mechanism engine.                                  */
/* ================================================================== */
const SUBS = {}; for (let d = 0; d < 10; d++) SUBS[String.fromCharCode(0x2080 + d)] = String(d);
SUBS[String.fromCharCode(0x207A)] = '+'; SUBS[String.fromCharCode(0x207B)] = '-'; SUBS[String.fromCharCode(0x2212)] = '-';
function norm(s){ let o = ''; for (const ch of s) o += SUBS[ch] || ch; return o; }
const GW = { H: 8.7, O: 9.3, N: 8.7, C: 8.7, S: 8, F: 7.3, I: 3.3, Br: 12.2, Cl: 11.4, P: 8.7, B: 8.7 };
function gw(tok){ if (/\d/.test(tok)) return 4.8; if (tok === '+' || tok === '-') return 3.5; return GW[tok] || 8.7; }
const ORD = { single: 1, dbl: 2, tpl: 3 };
let uid = 0;

// Read one drawn species: heteroatom labels (position from the mask circles, H glyph position from the
// tspans), vertices and bonds from the lines (hash-wedge strokes and the short inner line of a double
// bond are filtered or merged), wedge polygons bridged by proximity.
function analyze(node){
  const vb = (node.getAttribute('viewBox') || '0 0 240 160').trim().split(/[\s,]+/).map(Number);
  const circles = [...node.querySelectorAll('mask circle')].map(c => ({ x: +c.getAttribute('cx'), y: +c.getAttribute('cy') }));
  const texts = [...node.querySelectorAll('text')].map((t, i) => {
    const st = (t.parentNode && t.parentNode.getAttribute('style')) || '';
    const mx = /translateX\(([-\d.e]+)px\)/.exec(st), my = /translateY\(([-\d.e]+)px\)/.exec(st);
    const tx = mx ? +mx[1] : 0, ty = my ? +my[1] : 0;
    const raw = norm(t.textContent || ''), toks = raw.match(/Cl|Br|[A-Z]|\d|[+-]/g) || [];
    const el = toks.find(k => /^[A-Z]/.test(k) && k !== 'H') || 'H';
    const dir = t.getAttribute('data-direction') || 'right';
    const total = toks.reduce((s, k) => s + gw(k), 0);
    let hx = null;
    for (const sp of t.querySelectorAll('tspan')){
      let bb = null; try { bb = sp.getBBox(); } catch (e){ bb = null; }
      if (!bb || !bb.width) continue;
      const s = norm(sp.textContent || ''), k = s.indexOf('H');
      if (k >= 0){ const pre = (s.slice(0, k).match(/Cl|Br|[A-Z]|\d|[+-]/g) || []).reduce((a, b) => a + gw(b), 0); hx = tx + bb.x + pre + gw('H') / 2; break; }
    }
    if (hx == null){ let x = dir === 'left' ? tx - total : tx; for (const k of toks){ if (k === 'H'){ hx = x + gw('H') / 2; break; } x += gw(k); } }
    const pos = circles[i] || { x: tx + (dir === 'left' ? -gw(el) / 2 : gw(el) / 2), y: ty };
    const x0 = dir === 'left' ? tx - total : tx;
    return { el, raw, x: pos.x, y: pos.y, hx, hy: ty, hasH: hx != null, dir, x0, x1: x0 + total, charge: raw.includes('+') ? 1 : raw.includes('-') ? -1 : 0 };
  });
  const raw = [...node.querySelectorAll('line')].map(l => [+l.getAttribute('x1'), +l.getAttribute('y1'), +l.getAttribute('x2'), +l.getAttribute('y2')]).map(a => ({ a, len: Math.hypot(a[2] - a[0], a[3] - a[1]) })).filter(l => l.len >= 12).sort((p, q) => q.len - p.len);
  const V = [];
  const cluster = (x, y) => { for (let i = 0; i < V.length; i++) if (Math.hypot(V[i].x - x, V[i].y - y) < 7) return i; V.push({ x, y, pts: [], el: 'C', nb: [], text: null }); return V.length - 1; };
  const E = new Map(), key = (a, b) => a < b ? a + '-' + b : b + '-' + a;
  for (const l of raw){ const a = cluster(l.a[0], l.a[1]), b = cluster(l.a[2], l.a[3]); if (a === b) continue; V[a].pts.push({ x: l.a[0], y: l.a[1], len: l.len }); V[b].pts.push({ x: l.a[2], y: l.a[3], len: l.len }); E.set(key(a, b), (E.get(key(a, b)) || 0) + 1); }
  for (const v of V){ const mx = Math.max(...v.pts.map(p => p.len)); const top = v.pts.filter(p => p.len > mx - 0.6); v.x = top.reduce((s, p) => s + p.x, 0) / top.length; v.y = top.reduce((s, p) => s + p.y, 0) / top.length; }
  for (const t of texts){
    let i = -1, bd = 4.5; V.forEach((v, j) => { const d = Math.hypot(v.x - t.x, v.y - t.y); if (d < bd){ bd = d; i = j; } });
    if (i < 0){ V.push({ x: t.x, y: t.y, pts: [], el: t.el, nb: [], text: t }); i = V.length - 1; let best = -1, dd = 27; V.forEach((v, j) => { if (j !== i){ const d = Math.hypot(v.x - t.x, v.y - t.y); if (d < dd){ dd = d; best = j; } } }); if (best >= 0 && !E.has(key(i, best))) E.set(key(i, best), 1); }
    else { V[i].el = t.el; V[i].text = t; V[i].x = t.x; V[i].y = t.y; }
  }
  const edges = [...E.entries()].map(([k, n]) => { const [a, b] = k.split('-').map(Number); return { a, b, order: Math.min(3, n) }; });
  for (const e of edges){ V[e.a].nb.push(e.b); V[e.b].nb.push(e.a); e.mid = { x: (V[e.a].x + V[e.b].x) / 2, y: (V[e.a].y + V[e.b].y) / 2 }; }
  V.forEach((v, i) => { v.i = i; v.deg = v.nb.length; v.order = Math.max(1, ...edges.filter(e => e.a === i || e.b === i).map(e => e.order)); });
  return { vb, texts, V, edges, marks: {} };
}
function freeDir(G, p, extra){
  let v = null, bd = 4; for (const w of G.V){ const d = Math.hypot(w.x - p.x, w.y - p.y); if (d < bd){ bd = d; v = w; } }
  const taken = (extra || []).slice();
  if (v){ for (const j of v.nb) taken.push(Math.atan2(-(G.V[j].y - v.y), G.V[j].x - v.x) * 180 / Math.PI); if (v.text && v.text.hasH) taken.push(v.text.hx < v.x ? 180 : 0); if (v.text && v.text.charge) taken.push(v.text.dir === 'left' ? 180 : 0); }
  const gap = deg => taken.reduce((m, t) => Math.min(m, Math.abs(((deg - t) % 360 + 540) % 360 - 180)), 999);
  let best = 90, bg = -1; for (const c of [90, 270, 180, 0, 135, 45, 225, 315]){ const g = gap(c); if (g > bg + 0.01){ bg = g; best = c; } }
  return best;
}
function pickOne(list, c){
  if (!list.length) return null;
  if (c && c.pick){ const k = c.pick; return list.reduce((b, v) => (k === 'left' ? v.x < b.x : k === 'right' ? v.x > b.x : k === 'top' ? v.y < b.y : v.y > b.y) ? v : b, list[0]); }
  return list[(c && c.n) || 0];
}
// Resolve an anchor spec to a point in the species' drawer units.
function resolve(G, spec){
  let p = null;
  if (spec.m != null){ const m = G.marks[spec.m]; p = m ? { x: m.x, y: m.y } : null; }
  else if (spec.mb != null){ const m = G.marks[spec.mb]; p = m ? { x: (m.x + m.bx) / 2, y: (m.y + m.by) / 2 } : null; }
  else if (spec.t){ const list = G.texts.filter(t => t.el === spec.t && (!spec.q || t.raw.includes(spec.q)) && (!spec.nq || !t.raw.includes(spec.nq))); const t = pickOne(list, spec); if (t) p = spec.part === 'H' ? { x: t.hx, y: t.hy } : spec.part === 'HB' ? { x: (t.x + t.hx) / 2, y: (t.y + t.hy) / 2 } : { x: t.x, y: t.y }; }
  else if (spec.v){ const c = spec.v; const list = G.V.filter(v => (c.deg == null || v.deg === c.deg) && (c.order == null || v.order === ORD[c.order]) && (c.el == null ? v.el === 'C' : v.el === c.el) && (c.nb == null || v.nb.some(j => G.V[j].el === c.nb))); const v = pickOne(list, c); if (v) p = { x: v.x, y: v.y }; }
  else if (spec.b){
    const b = spec.b;
    if (Array.isArray(b)){ const a = resolve(G, b[0]), c = resolve(G, b[1]); if (a && c) p = { x: (a.x + c.x) / 2, y: (a.y + c.y) / 2 }; }
    else if (b === 'dbl' || b === 'tpl'){ const e = G.edges.filter(e => e.order === ORD[b])[spec.n || 0]; if (e) p = { x: e.mid.x, y: e.mid.y }; }
    else if (b.t){ const t = pickOne(G.texts.filter(t => t.el === b.t && (!b.q || t.raw.includes(b.q))), b); const v = t && G.V.find(v => v.text === t); const e = v && G.edges.filter(e => e.a === v.i || e.b === v.i)[b.n || 0]; if (e) p = { x: e.mid.x, y: e.mid.y }; }
  }
  else if (spec.f){ p = { x: G.vb[0] + spec.f[0] * G.vb[2], y: G.vb[1] + spec.f[1] * G.vb[3] }; }
  if (p && spec.off) p = { x: p.x + spec.off[0], y: p.y + spec.off[1] };
  return p;
}
// Draw one species into an outer svg group at scale k. Returns geometry with T() into outer units.
function prepareSpecies(api, layer, smi, k){
  const sp = SPECIES[smi] || { name: smi, marks: [] };
  const node = api.drawSmiles(layer, smi, { width: 240, height: 160, label: sp.name });
  const G = analyze(node);
  // marks in drawer units
  const placed = [];
  for (const mk of sp.marks){
    const base = resolve(G, mk.at); if (!base) continue;
    const dir = mk.dir != null ? mk.dir : freeDir(G, base, placed.filter(m => Math.hypot(m.bx - base.x, m.by - base.y) < 1).map(m => m.dir));
    const dist = mk.kind === 'lp' ? 11 : mk.kind === 'H' ? 13 : 12;
    const t = dir * Math.PI / 180;
    const m = { kind: mk.kind, x: base.x + Math.cos(t) * dist, y: base.y - Math.sin(t) * dist, bx: base.x, by: base.y, dir };
    if (mk.id) G.marks[mk.id] = m; placed.push(m);
  }
  G.placed = placed;
  // content bounds
  const xs = [], ys = [];
  for (const v of G.V){ xs.push(v.x); ys.push(v.y); }
  for (const t of G.texts){ xs.push(t.x0, t.x1); ys.push(t.y - 8, t.y + 8); }
  for (const m of placed){ xs.push(m.x - 8, m.x + 8); ys.push(m.y - 8, m.y + 8); }
  if (!xs.length){ xs.push(G.vb[0], G.vb[0] + G.vb[2]); ys.push(G.vb[1], G.vb[1] + G.vb[3]); }
  const pad = 9, bx0 = Math.min(...xs) - pad, by0 = Math.min(...ys) - pad, bw = Math.max(...xs) - Math.min(...xs) + 2 * pad, bh = Math.max(...ys) - Math.min(...ys) + 2 * pad;
  node.setAttribute('viewBox', bx0 + ' ' + by0 + ' ' + bw + ' ' + bh);
  node.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  const out = { smi, name: sp.name, node, G, w: bw * k, h: bh * k, k, X: 0, Y: 0, marksG: api.svg('g', {}) };
  layer.append(out.marksG);
  out.T = p => ({ x: out.X + (p.x - bx0) * k, y: out.Y + (p.y - by0) * k });
  out.place = (X, Y) => {
    out.X = X; out.Y = Y;
    node.setAttribute('x', X); node.setAttribute('y', Y); node.setAttribute('width', out.w); node.setAttribute('height', out.h);
    Object.assign(node.style, { width: out.w + 'px', height: out.h + 'px', maxWidth: 'none', display: '' });
    out.marksG.replaceChildren();
    const C = api.colors;
    for (const m of placed){
      const q = out.T(m), t = m.dir * Math.PI / 180;
      if (m.kind === 'lp'){ const px = -Math.sin(t) * 3.2 * k, py = -Math.cos(t) * 3.2 * k; out.marksG.append(api.svg('circle', { cx: q.x + px, cy: q.y + py, r: 2.1 * k, fill: C.blue }), api.svg('circle', { cx: q.x - px, cy: q.y - py, r: 2.1 * k, fill: C.blue })); }
      else if (m.kind === '+' || m.kind === '-'){ const col = m.kind === '+' ? C.coral : C.blue, R = 5.2 * k; const g = api.svg('g', {}); g.append(api.svg('circle', { cx: q.x, cy: q.y, r: R, fill: C.panel, stroke: col, 'stroke-width': String(1.3 * k) }), api.svg('line', { x1: q.x - R * 0.55, y1: q.y, x2: q.x + R * 0.55, y2: q.y, stroke: col, 'stroke-width': String(1.5 * k), 'stroke-linecap': 'round' })); if (m.kind === '+') g.append(api.svg('line', { x1: q.x, y1: q.y - R * 0.55, x2: q.x, y2: q.y + R * 0.55, stroke: col, 'stroke-width': String(1.5 * k), 'stroke-linecap': 'round' })); out.marksG.append(g); }
      else if (m.kind === 'H'){ const b = out.T({ x: m.bx, y: m.by }); const ux = (q.x - b.x) / Math.hypot(q.x - b.x, q.y - b.y), uy = (q.y - b.y) / Math.hypot(q.x - b.x, q.y - b.y); out.marksG.append(api.svg('line', { x1: b.x + ux * 2 * k, y1: b.y + uy * 2 * k, x2: q.x - ux * 6 * k, y2: q.y - uy * 6 * k, stroke: C.ink2, 'stroke-width': String(1.5 * k), 'stroke-linecap': 'round' }), api.svg('text', { x: q.x, y: q.y + 4.2 * k, 'text-anchor': 'middle', 'font-family': 'Arial, Helvetica, sans-serif', 'font-size': String(12 * k), fill: C.ink, text: 'H' })); }
    }
  };
  // taps: every lone pair, bond and atom, with a kind, for the you-try
  out.hits = () => {
    const h = [];
    for (const m of placed){ if (m.kind === 'lp') h.push({ kind: 'lp', p: out.T(m), name: 'the lone pair on ' + (G.V.find(v => Math.hypot(v.x - m.bx, v.y - m.by) < 2) || { el: 'the atom' }).el }); if (m.kind === 'H') h.push({ kind: 'atom', p: out.T(m), name: 'a hydrogen' }); if (m.kind === 'H') h.push({ kind: 'sigma', p: out.T({ x: (m.x + m.bx) / 2, y: (m.y + m.by) / 2 }), name: 'the C-H bond' }); if (m.kind === '+') h.push({ kind: 'plus', p: out.T(m), name: 'the plus sign' }); if (m.kind === '-') h.push({ kind: 'lp', p: out.T(m), name: 'the minus, a lone pair on carbon' }); }
    for (const e of G.edges) h.push({ kind: e.order > 1 ? 'pi' : 'sigma', p: out.T(e.mid), name: e.order > 1 ? 'the pi bond' : 'a sigma bond' });
    for (const v of G.V) h.push({ kind: 'atom', p: out.T(v), name: v.text ? 'the ' + v.el + ' atom' : 'a carbon' });
    for (const t of G.texts) if (t.hasH){ h.push({ kind: 'atom', p: out.T({ x: t.hx, y: t.hy }), name: 'a hydrogen on ' + t.el }); h.push({ kind: 'sigma', p: out.T({ x: (t.x + t.hx) / 2, y: (t.y + t.hy) / 2 }), name: 'the ' + t.el + '-H bond' }); }
    return h;
  };
  return out;
}
// Build one state box (partners beside the main species) into a layer. Returns the box with parts.
function buildState(api, layer, st, k, X, Y, opts){
  const kp = k * 0.92, gap = 12 * k / 1.5, padX = 12, padY = 10;
  const mains = (Array.isArray(st.main) ? st.main : [st.main]).map(s => prepareSpecies(api, layer, s, k));
  const withs = (st.with || []).map(s => prepareSpecies(api, layer, s, kp));
  const mainW = mains.reduce((s, m) => s + m.w, 0) + (mains.length - 1) * gap, mainH = Math.max(...mains.map(m => m.h));
  const withW = withs.length ? Math.max(...withs.map(w => w.w)) : 0, withH = withs.reduce((s, w) => s + w.h, 0) + Math.max(0, withs.length - 1) * 6;
  const innerW = mainW + (withs.length ? withW + gap : 0), innerH = Math.max(mainH, withH);
  const w = innerW + 2 * padX, h = innerH + 2 * padY + (opts && opts.noLabel ? 0 : 20);
  const box = { st, x: X, y: Y, w, h, parts: {}, mains, withs, layer };
  box.place = (X2, Y2) => {
    box.x = X2; box.y = Y2;
    const left = st.side === 'right';
    let x = X2 + padX + (left ? 0 : (withs.length ? withW + gap : 0));
    const yMid = Y2 + padY + innerH / 2;
    mains.forEach((m, i) => { m.place(x, yMid - m.h / 2); box.parts[i === 0 ? 'main' : 'main' + i] = m; x += m.w + gap; });
    let wx = left ? x : X2 + padX, wy = yMid - withH / 2;
    withs.forEach((wv, i) => { wv.place(wx + (withW - wv.w) / 2, wy); box.parts['w' + i] = wv; wy += wv.h + 6; });
    return box;
  };
  return box;
}
function curved(api, from, to, bend, markerId, k){
  const dx = to.x - from.x, dy = to.y - from.y, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
  const fx = from.x + dx / L * 3 * k, fy = from.y + dy / L * 3 * k, tx = to.x - dx / L * 9 * k, ty = to.y - dy / L * 9 * k;
  const amp = Math.max(18 * k, Math.min(L * 0.38, 60 * k));
  const cx = (fx + tx) / 2 + nx * bend * amp, cy = (fy + ty) / 2 + ny * bend * amp;
  return api.svg('path', { d: 'M' + fx.toFixed(1) + ' ' + fy.toFixed(1) + ' Q' + cx.toFixed(1) + ' ' + cy.toFixed(1) + ' ' + tx.toFixed(1) + ' ' + ty.toFixed(1), fill: 'none', stroke: api.colors.goldhi, 'stroke-width': String(1.9 * k), 'stroke-linecap': 'round', 'marker-end': 'url(#' + markerId + ')' });
}
function markerDefs(api, id, color){ return api.svg('defs', {}, api.svg('marker', { id, viewBox: '0 0 10 10', refX: '8', refY: '5', markerWidth: '5', markerHeight: '5', orient: 'auto' }, api.svg('path', { d: 'M0 0 L10 5 L0 10 z', fill: color }))); }
function arrowPath(api, box, ar, markerId, k){
  const partOf = spec => box.parts[spec.in || 'main'];
  const pf = partOf(ar.from), pt = partOf(ar.to); if (!pf || !pt) return null;
  const a = resolve(pf.G, ar.from), b = resolve(pt.G, ar.to); if (!a || !b) return null;
  return curved(api, pf.T(a), pt.T(b), ar.bend || 1, markerId, k);
}

// The stage: chips pick a mechanism, Next arrow / Play / Reset walk it, a caption speaks each step.
function mountStage(slots, api, opts){
  const { el, svg } = api, C = api.colors, MECHS = opts.mechanisms;
  let mech = MECHS[0], cur = { step: 0, arrow: 0, done: false }, busy = false, playing = false, timers = [];
  const wrap = el('div', { style: { position: 'relative' } });
  const stage = svg('svg', { role: 'img', 'aria-label': 'arrow-pushing stage', style: { display: 'block', width: '100%', height: 'auto' } });
  wrap.append(stage);
  const cap = el('div', { style: { marginTop: '10px', minHeight: '4.2em' } });
  const capHead = el('div', { style: { fontFamily: 'Georgia, serif', color: C.goldhi, fontSize: '18px' } });
  const capBody = el('p', { style: { margin: '4px 0 0', color: C.ink2, fontSize: '15px', maxWidth: '70ch' } });
  cap.append(capHead, capBody);
  const nextBtn = el('button', { class: 'primary', type: 'button', text: 'Next arrow', onClick: () => step(true) });
  const playBtn = el('button', { class: 'secondary', type: 'button', text: 'Play', onClick: play });
  const resetBtn = el('button', { class: 'secondary', type: 'button', text: 'Reset', onClick: () => { stopPlay(); cur = { step: 0, arrow: 0, done: false }; render(); speak(); } });
  const chips = el('div', { class: 'controls', role: 'group', 'aria-label': 'Pick a mechanism' });
  const chipEls = MECHS.map(M => el('button', { class: 'chip', type: 'button', 'aria-pressed': M === mech ? 'true' : 'false', text: M.chip, onClick: () => { stopPlay(); mech = M; cur = { step: 0, arrow: 0, done: false }; chipEls.forEach((c, i) => c.setAttribute('aria-pressed', MECHS[i] === M ? 'true' : 'false')); render(); speak(); } }));
  chips.append(...chipEls);
  const legend = el('div', { style: { display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', marginTop: '10px', fontSize: '12px', color: C.ink3, fontFamily: 'ui-monospace, Menlo, monospace', letterSpacing: '.04em' } });
  const legendItem = (draw, text) => { const s = svg('svg', { viewBox: '0 0 26 16', width: '26', height: '16', style: { display: 'inline-block', width: '26px', height: '16px', verticalAlign: 'middle', marginRight: '4px' } }); draw(s); return el('span', {}, s, text); };
  legend.append(
    legendItem(s => s.append(svg('circle', { cx: 9, cy: 8, r: 2.4, fill: C.blue }), svg('circle', { cx: 16, cy: 8, r: 2.4, fill: C.blue })), 'lone pair, electrons ready to attack'),
    legendItem(s => s.append(svg('circle', { cx: 13, cy: 8, r: 6, fill: 'none', stroke: C.coral, 'stroke-width': '1.4' }), svg('line', { x1: 9.5, y1: 8, x2: 16.5, y2: 8, stroke: C.coral, 'stroke-width': '1.6' }), svg('line', { x1: 13, y1: 4.5, x2: 13, y2: 11.5, stroke: C.coral, 'stroke-width': '1.6' })), 'plus: electron poor, an empty spot'),
    legendItem(s => s.append(svg('circle', { cx: 13, cy: 8, r: 6, fill: 'none', stroke: C.blue, 'stroke-width': '1.4' }), svg('line', { x1: 9.5, y1: 8, x2: 16.5, y2: 8, stroke: C.blue, 'stroke-width': '1.6' })), 'minus: electron rich'),
    legendItem(s => s.append(svg('path', { d: 'M3 13 Q13 -2 23 9', fill: 'none', stroke: C.goldhi, 'stroke-width': '2', 'stroke-linecap': 'round' }), svg('path', { d: 'M19 5 L23.5 9.5 L17.5 10.5 z', fill: C.goldhi })), 'gold arrow: two electrons moving')
  );
  slots.visual.append(wrap, el('div', { class: 'controls' }, nextBtn, playBtn, resetBtn), cap, chips, legend);

  let boxes = [], mid = '', layers = null, W = 960, k = 1.5, laidHidden = false;
  function layout(){
    W = Math.max(300, Math.round(wrap.clientWidth || 0)) || 960; laidHidden = !wrap.clientWidth;
    k = W < 560 ? 1.25 : 1.5;
    stage.replaceChildren(); mid = 'mk' + (++uid);
    stage.append(markerDefs(api, mid, C.goldhi), markerDefs(api, mid + 'f', C.gold));
    layers = { boxes: svg('g', {}), species: svg('g', {}), labels: svg('g', {}), arrows: svg('g', {}) };
    stage.append(layers.boxes, layers.species, layers.labels, layers.arrows);
    boxes = mech.states.map(st => buildState(api, layers.species, st, k, 0, 0));
    // pack rows
    const conn = 54 * k / 1.5, rows = [[]]; let x = 0;
    for (const b of boxes){ const need = (rows[rows.length - 1].length ? conn : 0) + b.w; if (x + need > W && rows[rows.length - 1].length){ rows.push([]); x = 0; } if (rows[rows.length - 1].length) x += conn; rows[rows.length - 1].push(b); x += b.w; }
    let y = 8; const rowGap = 34;
    for (const row of rows){
      const rowW = row.reduce((s, b) => s + b.w, 0) + (row.length - 1) * conn, rowH = Math.max(...row.map(b => b.h));
      let rx = Math.max(0, (W - rowW) / 2);
      for (const b of row){ b.place(rx, y + (rowH - b.h) / 2); b.row = rows.indexOf(row); rx += b.w + conn; }
      y += rowH + rowGap;
    }
    const H = y - rowGap + 8;
    stage.setAttribute('viewBox', '0 0 ' + W + ' ' + H); stage.style.aspectRatio = W + ' / ' + H;
    // boxes, labels, connectors
    boxes.forEach((b, i) => {
      b.rect = svg('rect', { x: b.x, y: b.y, width: b.w, height: b.h, rx: 10, fill: 'rgba(255,255,255,.02)', stroke: C.line, 'stroke-width': '1' });
      layers.boxes.append(b.rect);
      b.label = svg('text', { x: b.x + b.w / 2, y: b.y + b.h - 7, 'text-anchor': 'middle', 'font-family': 'Georgia, serif', 'font-size': String(12.5 * k / 1.5), fill: C.ink2, text: b.st.label });
      layers.labels.append(b.label);
      if (Array.isArray(b.st.main) && b.st.mainLabels) b.mains.forEach((m, j) => layers.labels.append(svg('text', { x: m.X + m.w / 2, y: m.Y + m.h + 2, 'text-anchor': 'middle', 'font-family': 'ui-monospace, Menlo, monospace', 'font-size': String(10 * k / 1.5), fill: C.gold, text: b.st.mainLabels[j] })));
      if (i < boxes.length - 1){
        const n = boxes[i + 1], name = mech.steps[i].name, g = svg('g', {});
        if (n.row === b.row){
          const x1 = b.x + b.w + 6, x2 = n.x - 6, ym = b.y + b.h / 2;
          g.append(svg('line', { x1, y1: ym, x2: x2 - 4, y2: ym, stroke: C.gold, 'stroke-width': '1.6', 'marker-end': 'url(#' + mid + 'f)' }));
          g.append(svg('text', { x: (x1 + x2) / 2, y: ym - 7, 'text-anchor': 'middle', 'font-family': 'ui-monospace, Menlo, monospace', 'font-size': '10', 'letter-spacing': '.08em', fill: C.gold, text: name.toUpperCase() }));
        } else {
          const x1 = b.x + b.w + 6, ym = b.y + b.h / 2, yg = n.y - rowGap / 2, x2 = n.x + 26;
          g.append(svg('path', { d: 'M' + x1 + ' ' + ym + ' H' + (x1 + 14) + ' V' + yg + ' H' + x2 + ' V' + (n.y - 5), fill: 'none', stroke: C.gold, 'stroke-width': '1.6', 'marker-end': 'url(#' + mid + 'f)' }));
          g.append(svg('text', { x: (x1 + 14 + x2) / 2, y: yg - 6, 'text-anchor': 'middle', 'font-family': 'ui-monospace, Menlo, monospace', 'font-size': '10', 'letter-spacing': '.08em', fill: C.gold, text: name.toUpperCase() }));
        }
        b.conn = g; layers.labels.append(g);
      }
    });
    paint(false);
  }
  // opacity of boxes and the arrows already pushed
  function paint(animateReveal){
    boxes.forEach((b, i) => {
      const vis = i <= cur.step ? 1 : 0.22;
      for (const p of Object.values(b.parts)){ p.node.style.opacity = String(vis); p.marksG.style.opacity = String(vis); }
      b.rect.setAttribute('stroke', i === cur.step && !cur.done ? C.gold : C.line);
      b.rect.setAttribute('opacity', String(vis));
      b.label.setAttribute('opacity', String(i <= cur.step ? 1 : 0.35));
      if (b.conn) b.conn.setAttribute('opacity', String(i < cur.step ? 0.55 : i === cur.step ? 1 : 0.28));
    });
    layers.arrows.replaceChildren();
    for (let s = 0; s < cur.step; s++) for (const ar of mech.steps[s].arrows){ const p = arrowPath(api, boxes[s], ar, mid, k); if (p){ p.setAttribute('opacity', '0.35'); layers.arrows.append(p); } }
    if (!cur.done && cur.step < mech.steps.length) for (let a = 0; a < cur.arrow; a++){ const p = arrowPath(api, boxes[cur.step], mech.steps[cur.step].arrows[a], mid, k); if (p) layers.arrows.append(p); }
    if (animateReveal && cur.step < boxes.length){ const b = boxes[cur.step]; const D = api.reduced ? 0 : 320; for (const p of Object.values(b.parts)){ p.node.style.transition = 'opacity ' + D + 'ms'; p.marksG.style.transition = 'opacity ' + D + 'ms'; } b.rect.style.transition = 'opacity ' + D + 'ms'; }
    nextBtn.disabled = cur.done; nextBtn.textContent = cur.done ? 'Done' : cur.step === 0 && cur.arrow === 0 ? 'Next arrow' : 'Next arrow';
  }
  function render(){ layout(); }
  function speak(){
    const N = mech.steps.length;
    if (cur.done){ capHead.textContent = 'Done: ' + mech.states[mech.states.length - 1].label + '.'; capBody.textContent = (mech.after || 'That is the whole mechanism. Reset to push it again, or pick another one.'); return; }
    const st = mech.steps[cur.step];
    capHead.textContent = 'Step ' + (cur.step + 1) + ' of ' + N + ': ' + st.name + '.';
    capBody.textContent = cur.arrow === 0 ? st.say : (st.arrows[cur.arrow - 1].say || st.say);
  }
  function step(byHand){
    if (busy || cur.done) return;
    if (laidHidden && wrap.clientWidth) layout();
    const st = mech.steps[cur.step];
    if (cur.arrow < st.arrows.length){
      busy = true;
      const p = arrowPath(api, boxes[cur.step], st.arrows[cur.arrow], mid, k);
      cur.arrow++;
      if (p){
        layers.arrows.append(p);
        const D = api.reduced ? 0 : 520;
        let len = 200; try { len = p.getTotalLength(); } catch (e){ len = 200; }
        if (D){ p.setAttribute('stroke-dasharray', String(len)); p.style.strokeDashoffset = String(len); void p.getBoundingClientRect(); p.style.transition = 'stroke-dashoffset ' + D + 'ms ease-out'; p.style.strokeDashoffset = '0'; }
        capHead.textContent = 'Step ' + (cur.step + 1) + ' of ' + mech.steps.length + ': ' + st.name + ', arrow ' + cur.arrow + ' of ' + st.arrows.length + '.';
        capBody.textContent = st.arrows[cur.arrow - 1].say || st.say;
        timers.push(setTimeout(() => { busy = false; if (cur.arrow === st.arrows.length) reveal(); else if (playing) timers.push(setTimeout(() => step(false), api.reduced ? 0 : 380)); }, D + 40));
      } else { busy = false; if (cur.arrow === st.arrows.length) reveal(); }
    }
  }
  function reveal(){
    cur.step++; cur.arrow = 0;
    if (cur.step >= mech.steps.length){ cur.done = true; }
    paint(true); speak();
    if (playing && !cur.done) timers.push(setTimeout(() => step(false), api.reduced ? 0 : 900)); else if (cur.done) stopPlay();
  }
  function play(){ if (playing){ stopPlay(); return; } if (cur.done){ cur = { step: 0, arrow: 0, done: false }; render(); } playing = true; playBtn.textContent = 'Pause'; step(false); }
  function stopPlay(){ playing = false; playBtn.textContent = 'Play'; timers.forEach(clearTimeout); timers = []; busy = false; }
  let lastW = 0;
  const onResize = () => { const w = wrap.clientWidth; if (w && w !== lastW){ lastW = w; render(); } };
  window.addEventListener('resize', onResize);
  if (typeof ResizeObserver !== 'undefined'){ try { new ResizeObserver(onResize).observe(wrap); } catch (e){} }
  render(); speak();
  return { get mech(){ return mech; }, render };
}

/* ------------------------------------------------------------------ */
/* You try: generated items (drawn states, tap targets) alternating     */
/* with bank items.                                                     */
/* ------------------------------------------------------------------ */
function stateSvg(api, st, k){
  const s = api.svg('svg', { role: 'img', 'aria-label': st.label, style: { display: 'block', maxWidth: '100%', height: 'auto' } });
  const id = 'tr' + (++uid); s.append(markerDefs(api, id, api.colors.goldhi));
  const species = api.svg('g', {}); s.append(species);
  const holder = api.el('div', { style: { margin: '0 auto' } }); holder.append(s);
  return { svg: s, holder, id, build(){ const box = buildState(api, species, st, k, 0, 0, { noLabel: true }); box.place(0, 0); s.setAttribute('viewBox', '0 0 ' + box.w + ' ' + box.h); s.style.width = Math.min(box.w, 640) + 'px'; s.style.aspectRatio = box.w + ' / ' + box.h; return box; } };
}
function speciesSvg(api, smi, k, maxW){
  const s = api.svg('svg', { role: 'img', 'aria-label': nameOf(smi), style: { display: 'block', maxWidth: '100%', height: 'auto' } });
  const g = api.svg('g', {}); s.append(g);
  return { svg: s, build(){ const p = prepareSpecies(api, g, smi, k); p.place(0, 0); s.setAttribute('viewBox', '0 0 ' + p.w + ' ' + p.h); s.style.width = Math.min(p.w, maxW || 220) + 'px'; s.style.aspectRatio = p.w + ' / ' + p.h; return p; } };
}
function mountTry(slots, api, opts){
  const { el, svg } = api, C = api.colors;
  const bank = (api.bank && api.bank.items) ? opts.groups.flatMap(g => api.bank.items(g)) : [];
  let item = null, firstTry = true, done = false, turn = 0;
  const box = el('div', { class: 'item' }); slots.try.append(box);
  function verdictGood(){ box.append(el('div', { class: 'verdict good', text: 'You can read it.' }), el('div', { class: 'controls' }, el('button', { class: 'primary', type: 'button', text: 'Another one', onClick: next }))); }
  function commit(ok, coachText){
    if (done) return;
    if (ok){ done = true; api.report(firstTry); api.clearCoach(); verdictGood(); }
    else { if (firstTry) api.report(false); firstTry = false; if (!box.querySelector('.verdict')) box.append(el('div', { class: 'verdict notyet', text: 'Not yet.' })); api.coach(coachText); }
  }
  function optionGrid(choices, correct, coachText, drawn){
    const grid = el('div', { class: 'opts' }), btns = [];
    choices.forEach((c, i) => {
      const b = el('button', { class: 'opt', type: 'button', 'aria-label': c.text || ('choice ' + (i + 1)) });
      b.append(el('span', { class: 'k', text: String.fromCharCode(65 + i) }));
      if (drawn && c.smiles){ const holder = el('div', {}); if (c.text) holder.append(el('div', { style: { fontSize: '13px', color: C.ink2, marginBottom: '2px' }, text: c.text })); const sp = speciesSvg(api, c.smiles, 1.15, 200); holder.append(sp.svg); b.append(holder); b._draw = sp; }
      else b.append(el('span', { text: c.text }));
      b.addEventListener('click', () => { if (done) return; btns.forEach(x => x.classList.remove('picked')); b.classList.add('picked'); if (i === correct){ b.classList.add('ok'); btns.forEach(x => x.disabled = true); commit(true); } else commit(false, coachText); });
      btns.push(b); grid.append(b);
    });
    box.append(grid);
    for (const b of btns) if (b._draw) b._draw.build();
  }
  function showState(st){ const sv = stateSvg(api, st, 1.35); box.append(sv.holder); const bx = sv.build(); return { sv, bx }; }
  function renderGenerated(it){
    box.append(el('p', { class: 'prompt', text: it.stem }));
    if (it.M && (it.kind === 'start' || it.kind === 'draw')){
      const st = it.M.states[it.i], step = it.M.steps[it.i], ar = step.arrows[it.arrow || 0];
      const { sv, bx } = showState(st);
      const hitLayer = svg('g', {}), marks = svg('g', {}); sv.svg.append(marks, hitLayer);
      const partOf = spec => bx.parts[spec.in || 'main'];
      const pf = partOf(ar.from), pt = partOf(ar.to);
      const fromP = pf && resolve(pf.G, ar.from), toP = pt && resolve(pt.G, ar.to);
      if (!fromP || !toP){ hitLayer.remove(); optionGrid(it.choices, it.correct, it.coach, false); return; }
      const F = pf.T(fromP), T = pt.T(toP);
      const hits = [];
      for (const part of Object.values(bx.parts)) for (const h of part.hits()) hits.push(h);
      const near = (h, P) => Math.hypot(h.p.x - P.x, h.p.y - P.y) < 9;
      if (!hits.some(h => near(h, F))) hits.push({ kind: 'lp', p: F, name: ar.fromName });
      if (!hits.some(h => near(h, T))) hits.push({ kind: 'atom', p: T, name: ar.toName });
      // dedupe hits by position (first wins), lone pairs and bonds before atoms
      const order = { lp: 0, pi: 1, sigma: 2, plus: 3, atom: 4 };
      hits.sort((a, b) => order[a.kind] - order[b.kind]);
      const uniq = []; for (const h of hits) if (!uniq.some(u => Math.hypot(u.p.x - h.p.x, u.p.y - h.p.y) < 7)) uniq.push(h);
      const kk = bx.mains[0].k;
      let stage = 0, src = null;
      const prompt = box.querySelector('.prompt');
      const first = it.kind === 'draw' ? 'Tap where the electrons START: a lone pair or a pi bond.' : 'Tap where the arrow starts.';
      prompt.textContent = it.stem + ' ' + first;
      const resetTaps = () => { stage = 0; src = null; marks.replaceChildren(); prompt.textContent = 'Same one again. ' + first; };
      const choose = h => {
        if (done) return;
        if (it.kind === 'start' || stage === 0){
          const ok = near(h, F);
          if (ok){ marks.append(svg('circle', { cx: h.p.x, cy: h.p.y, r: 9 * kk / 1.5, fill: 'none', stroke: C.goldhi, 'stroke-width': '2' })); if (it.kind === 'start'){ hitLayer.replaceChildren(); commit(true); return; } src = h; stage = 1; prompt.textContent = 'Now tap where they GO.'; return; }
          const why = h.kind === 'plus' ? 'A plus has nothing to give. The arrow starts at electrons: here ' + ar.fromName + '.' : h.kind === 'atom' ? 'The arrow starts at electrons, not at an atom. Here that is ' + ar.fromName + '.' : h.kind === 'sigma' && ar.from.mb == null && !(ar.from.t && ar.from.part === 'HB') ? 'That is a sigma bond; sigma electrons do not attack. Start at ' + ar.fromName + ', the base.' : 'Rich attacks poor. The electrons that move first are ' + ar.fromName + '.';
          commit(false, why); if (it.kind === 'draw') resetTaps(); return;
        }
        const ok = near(h, T);
        marks.append(curved(api, src.p, h.p, ar.bend || 1, sv.id, kk));
        if (ok){ hitLayer.replaceChildren(); commit(true); return; }
        commit(false, 'The arrow lands on ' + ar.toName + ': ' + (ar.toName.includes('proton') || ar.toName.includes('H') ? 'the hydrogen itself, never the atom holding it.' : 'the electron-poor spot.')); resetTaps();
      };
      for (const h of uniq){
        const g = svg('g', { role: 'button', tabindex: '0', 'aria-label': h.name, style: { cursor: 'pointer' } });
        g.append(svg('circle', { cx: h.p.x, cy: h.p.y, r: 11 * kk / 1.5, fill: 'transparent' }));
        g.addEventListener('click', () => choose(h));
        g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); choose(h); } });
        hitLayer.append(g);
      }
      return;
    }
    if (it.M) showState(it.M.states[it.i]);
    optionGrid(it.choices, it.correct, it.coach, it.kind === 'next');
  }
  function renderBank(b){
    box.append(el('p', { class: 'prompt', text: b.q }));
    if (b.q_smiles){ const sp = speciesSvg(api, b.q_smiles, 1.35, 320); box.append(el('div', { style: { margin: '0 auto 6px' } }, sp.svg)); sp.build(); }
    const structural = !!b.opts_are_structures;
    optionGrid(b.opts.map(o => structural ? { text: '', smiles: o } : { text: String(o), smiles: null }), b.correct, b.why, structural);
  }
  function next(){
    box.replaceChildren(); api.clearCoach(); firstTry = true; done = false; turn++;
    const useBank = bank.length && turn % 2 === 0;
    if (useBank){ item = api.pick(bank); renderBank(item); }
    else { item = genItem(api.rng); renderGenerated(item); }
  }
  next();
}

/* ------------------------------------------------------------------ */
/* The pKa see-saw: which side does the equilibrium sit on.             */
/* ------------------------------------------------------------------ */
function mountSeesaw(container, api){
  const { el, svg } = api, C = api.colors;
  let pair = PAIRS[0];
  const holder = el('div', { style: { marginTop: '18px', paddingTop: '14px', borderTop: '1px solid ' + C.line } });
  holder.append(el('div', { class: 'eyebrow', text: 'Which way does it go? Toward the weaker acid.' }));
  const stage = svg('svg', { role: 'img', 'aria-label': 'equilibrium see-saw', style: { display: 'block', width: '100%', maxWidth: '760px', height: 'auto', margin: '8px auto 0' } });
  const line = el('p', { style: { margin: '8px 0 0', color: C.ink2, fontSize: '15px', maxWidth: '70ch' } });
  const chips = el('div', { class: 'controls', role: 'group', 'aria-label': 'Pick an acid-base pair' });
  const chipEls = PAIRS.map(P => el('button', { class: 'chip', type: 'button', 'aria-pressed': P === pair ? 'true' : 'false', text: P.chip, onClick: () => { pair = P; chipEls.forEach((c, i) => c.setAttribute('aria-pressed', PAIRS[i] === P ? 'true' : 'false')); draw(); } }));
  chips.append(...chipEls);
  holder.append(stage, chips, line); container.append(holder);
  function draw(){
    stage.replaceChildren();
    const A = ACIDS[pair.a], B = ACIDS[pair.b];
    const W = 760, H = 250; stage.setAttribute('viewBox', '0 0 ' + W + ' ' + H); stage.style.aspectRatio = W + ' / ' + H;
    const rightWins = B.pKa > A.pKa;         // products carry HB; the higher pKa acid is the side it sits on
    const tilt = rightWins ? 7 : -7, cx = W / 2, cy = 168;
    const beam = svg('g', { transform: 'rotate(' + tilt + ' ' + cx + ' ' + cy + ')' });
    beam.append(svg('line', { x1: cx - 300, y1: cy, x2: cx + 300, y2: cy, stroke: C.gold, 'stroke-width': '3', 'stroke-linecap': 'round' }));
    stage.append(svg('path', { d: 'M' + (cx - 16) + ' ' + (cy + 40) + ' L' + cx + ' ' + (cy + 2) + ' L' + (cx + 16) + ' ' + (cy + 40) + ' z', fill: C.panel, stroke: C.gold, 'stroke-width': '1.5' }));
    stage.append(beam);
    const pan = (x, species, names, pk, side) => {
      const yTop = cy - 8 + (side === 'L' ? -1 : 1) * Math.tan(tilt * Math.PI / 180) * (x - cx) * (side === 'L' ? -1 : 1);
      const g = svg('g', {}); stage.append(g);
      const holderG = svg('g', {}); g.append(holderG);
      const parts = species.map(s => prepareSpecies(api, holderG, s, 1.1));
      const totalW = parts.reduce((s, p) => s + p.w, 0) + 26, hmax = Math.max(...parts.map(p => p.h));
      let px = x - totalW / 2; const py = yTop - hmax - 14;
      parts.forEach((p, i) => { p.place(px, py + (hmax - p.h) / 2); px += p.w; if (i === 0) g.append(svg('text', { x: px + 13, y: py + hmax / 2 + 6, 'text-anchor': 'middle', 'font-family': 'Georgia, serif', 'font-size': '18', fill: C.ink2, text: '+' })); px += 26; });
      g.append(svg('line', { x1: x - totalW / 2, y1: yTop - 6, x2: x + totalW / 2, y2: yTop - 6, stroke: C.ink3, 'stroke-width': '1.2' }));
      g.append(svg('text', { x, y: yTop + 44 + (side === 'L' ? 0 : 0), 'text-anchor': 'middle', 'font-family': 'Georgia, serif', 'font-size': '13', fill: C.ink2, text: names }));
      g.append(svg('text', { x, y: yTop + 62, 'text-anchor': 'middle', 'font-family': 'ui-monospace, Menlo, monospace', 'font-size': '11', fill: side === 'L' ? (rightWins ? C.ink3 : C.green) : (rightWins ? C.green : C.ink3), text: 'acid pKa ' + pk }));
    };
    // left pan: HA + B-, right pan: A- + HB
    pan(cx - 200, [A.acid, B.base], A.acidName + ' + ' + B.baseName, A.pKa, 'L');
    pan(cx + 200, [A.base, B.acid], A.baseName + ' + ' + B.acidName, B.pKa, 'R');
    const n = Math.round(Math.abs(A.pKa - B.pKa));
    stage.append(svg('text', { x: cx, y: 24, 'text-anchor': 'middle', 'font-family': 'Georgia, serif', 'font-size': '16', fill: C.goldhi, text: (rightWins ? 'Sits right, toward ' + B.acidName : 'Sits left, toward ' + A.acidName) + ' (the weaker acid), K about ' + fmtK(n) }));
    stage.append(svg('text', { x: cx, y: H - 8, 'text-anchor': 'middle', 'font-family': 'ui-monospace, Menlo, monospace', 'font-size': '10', 'letter-spacing': '.1em', fill: C.ink3, text: 'THE HEAVY SIDE IS THE ONE WITH THE HIGHER PKA' }));
    line.textContent = pair.line;
  }
  draw();
  return { draw };
}

export function mount(slots, api){
  mountStage(slots, api, { mechanisms: MECHANISMS });
  mountSeesaw(slots.visual, api);
  mountTry(slots, api, { groups: ['acid-base-pka'] });
}
