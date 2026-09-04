// The Tree of Organic, Level 4, Trunk 9: Different arrows.
// Radical chains (half arrows, a ledger you can audit) and the Diels-Alder
// (three arrows, s-cis, an electron-poor partner). No imports (contract).

export const meta = {
  id: 't4-radical-pericyclic',
  level: 4,
  order: 9,
  needs3D: false,
  title: 'Different arrows',
  concept: 'Radicals and the Diels-Alder',
  tagline: 'Half arrows for one electron. Three arrows for a ring.',
  story: 'When you see light or a peroxide, think radicals, and switch your pen: half arrows, one electron each, not the full arrows you use everywhere else. A radical chain is a ledger you can audit. Initiation takes zero radicals in and hands two out. Propagation takes one in and gives one back, which is why a few radicals can chew through a whole flask. Termination takes two in and gives none back, and the chain dies. Bromine is picky and takes the tertiary hydrogen; chlorine does not care, so you count hydrogens and let the numbers decide. NBS with light works next door to a pi system, allylic or benzylic, because resonance holds that radical up. Vinylic is poison: we never want a radical or a carbocation touching a double bond. Diels-Alder is a different animal, three arrows every time, and the diene has to be s-cis. Rule of thumb: audit the ledger, then ask which hydrogen is easiest to take.',
  moveName: 'Audit the ledger, then ask which hydrogen',
  move: [
    'Light, a peroxide, or NBS? You are in radical chemistry. Draw half arrows, one electron each.',
    'Audit the ledger. Initiation: zero radicals in, two out. Propagation: one in, one out. Termination: two in, none out.',
    'Which hydrogen? Bromine is picky and takes the tertiary one. Chlorine is not picky, so count hydrogens. NBS takes the allylic or benzylic one, because resonance holds that radical up.',
    'Diels-Alder: three arrows, the diene must be s-cis, and the dienophile wants an electron-withdrawing group hanging off it.',
    'Place the new pi bond between the two middle carbons of the old diene, and put the two new single bonds at the ends.'
  ],
  trap: 'Careful: NBS and light take a hydrogen from the carbon NEXT to the pi system, never from the pi system itself, because a vinylic radical has no resonance holding it up; that is the same reason a vinylic cation is a bad idea.',
  holdsUp: ['Allylic and benzylic positions', 'Resonance stability', 'Building rings', 'Predicting mixtures', 'Multi-step synthesis'],
  drill: 'Booster OChem: Free Radical & Diels Alder Cycloaddition Reactions'
};

// Every SMILES this module draws. Substrates and major products come from the verified
// reaction table; the radicals, the minor products and the wrong adducts are listed here.
export const SMILES = [
  'BrBr', '[Br]', 'CC(C)C', 'C[C](C)C', 'Br', 'CC(C)(C)Br',
  'CC(C)CBr', 'CC(C)(C)Cl', 'CC(C)CCl',
  'Cc1ccccc1', 'BrCc1ccccc1', 'Cc1ccc(Br)cc1', 'OC(=O)c1ccccc1', 'BrCc1ccc(Br)cc1',
  'C=CC=C', 'C=CC=O', 'O=CC1CCC=CC1', 'O=CC1CCCCC1', 'O=CC1CCC=C1', 'O=CC1=CCCCC1',
  'CCCC', 'CC=CC', 'CCC=C',
  'CC(=C)C=C', 'CC(=C)C(C)=C', 'C/C=C/C=C/C', 'C/C=C\\C=C/C', 'C1=CCC=C1', 'C1=CCCC=C1', 'C=CCC=C', 'C=CCCC=C'
];

/* Species: the name, plus the marks the renderer cannot show.
   kind: dot (a single electron), H (an explicit hydrogen), lp (a lone pair). */
const SPECIES = {
  'BrBr': { name: 'Br2', marks: [] },
  '[Br]': { name: 'a bromine radical', marks: [{ id: 'rad', kind: 'dot', at: { t: 'Br' } }] },
  'CC(C)C': { name: '2-methylpropane', marks: [{ id: 'Ht', kind: 'H', at: { v: { deg: 3 } } }] },
  'C[C](C)C': { name: 'the tert-butyl radical', marks: [{ id: 'rad', kind: 'dot', at: { v: { deg: 3 } } }] },
  'Br': { name: 'HBr', marks: [] },
  'CC(C)(C)Br': { name: 'tert-butyl bromide', marks: [] },
  'CC(C)CBr': { name: 'isobutyl bromide', marks: [] },
  'CC(C)(C)Cl': { name: 'tert-butyl chloride', marks: [] },
  'CC(C)CCl': { name: 'isobutyl chloride', marks: [] },
  'Cc1ccccc1': { name: 'toluene', marks: [] },
  'BrCc1ccccc1': { name: 'benzyl bromide', marks: [] },
  'Cc1ccc(Br)cc1': { name: 'para-bromotoluene', marks: [] },
  'OC(=O)c1ccccc1': { name: 'benzoic acid', marks: [] },
  'BrCc1ccc(Br)cc1': { name: 'para-bromobenzyl bromide', marks: [] },
  'C=CC=C': { name: '1,3-butadiene', marks: [] },
  'C=CC=O': { name: 'acrolein, the dienophile', marks: [] },
  'O=CC1CCC=CC1': { name: 'cyclohex-3-ene-1-carbaldehyde', marks: [] },
  'O=CC1CCCCC1': { name: 'cyclohexanecarbaldehyde', marks: [] },
  'O=CC1CCC=C1': { name: 'cyclopent-2-ene-1-carbaldehyde', marks: [] },
  'O=CC1=CCCCC1': { name: 'cyclohex-1-ene-1-carbaldehyde', marks: [] },
  'CCCC': { name: 'butane', marks: [] },
  'CC=CC': { name: '2-butene', marks: [] },
  'CCC=C': { name: '1-butene', marks: [] },
  'CC(=C)C=C': { name: 'isoprene', marks: [] },
  'CC(=C)C(C)=C': { name: '2,3-dimethyl-1,3-butadiene', marks: [] },
  'C/C=C/C=C/C': { name: '(2E,4E)-2,4-hexadiene', marks: [] },
  'C/C=C\\C=C/C': { name: '(2Z,4Z)-2,4-hexadiene', marks: [] },
  'C1=CCC=C1': { name: '1,3-cyclopentadiene', marks: [] },
  'C1=CCCC=C1': { name: '1,3-cyclohexadiene', marks: [] },
  'C=CCC=C': { name: '1,4-pentadiene', marks: [] },
  'C=CCCC=C': { name: '1,5-hexadiene', marks: [] }
};
const nameOf = smi => (SPECIES[smi] && SPECIES[smi].name) || smi;

/* The chain, one stage per chip, plus the cycloaddition. ledger is the whole point
   of the radical stages: radicals in, radicals out. */
const MECHANISMS = [
  {
    id: 'init', chip: '1. Initiation', name: 'initiation', stage: 'Initiation', ledger: { in: 0, out: 2 }, scale: 1.5, roots: ['l2-carbocation', 'l2-arrows'],
    after: 'Zero radicals went in, two came out. That is the only step that makes radicals from nothing, and light or heat is what pays for it.',
    states: [
      { main: 'BrBr', with: [], side: 'left', label: 'Br2, with light' },
      { main: '[Br]', with: ['[Br]'], side: 'right', label: 'two bromine radicals' }
    ],
    steps: [{
      name: 'split the bond evenly', nuc: 'neither, this is homolysis', ele: 'neither, this is homolysis',
      say: 'Light hits the Br-Br bond and splits it right down the middle, one electron to each bromine. That is homolysis, and it needs HALF arrows: each hook carries one electron, not two. Nothing is attacking anything here. Ledger: zero radicals in, two out.',
      arrows: [
        { from: { b: { t: 'Br' } }, to: { t: 'Br', pick: 'left' }, bend: 1, fish: true, fromName: 'one electron of the Br-Br bond', toName: 'the left bromine', say: 'One electron goes left. Half arrow, one hook.' },
        { from: { b: { t: 'Br' } }, to: { t: 'Br', pick: 'right' }, bend: -1, fish: true, fromName: 'the other electron of the Br-Br bond', toName: 'the right bromine', say: 'The other goes right. Two radicals, and the chain is lit.' }
      ]
    }]
  },
  {
    id: 'prop1', chip: '2. Propagation: take the H', name: 'the first propagation step', stage: 'Propagation', ledger: { in: 1, out: 1 }, roots: ['l2-carbocation'],
    after: 'One radical in, one radical out. The bromine left with a hydrogen and handed the radical to carbon, and it picked the tertiary hydrogen because that radical is the most stable one available.',
    states: [
      { main: 'CC(C)C', with: ['[Br]'], side: 'right', label: '2-methylpropane + a bromine radical' },
      { main: 'C[C](C)C', with: ['Br'], side: 'right', label: 'the tertiary radical + HBr' }
    ],
    steps: [{
      name: 'take a hydrogen', nuc: 'the bromine radical', ele: 'the tertiary C-H',
      say: 'The bromine radical wants one more electron. It takes a whole hydrogen atom: its own single electron pairs with one of the C-H electrons to make H-Br, and the other C-H electron stays behind on carbon. Two half arrows. It takes the TERTIARY hydrogen, because a tertiary radical is the one the neighbors can hold up, same ranking as carbocations. Ledger: one radical in, one out.',
      arrows: [
        { from: { in: 'w0', m: 'rad' }, to: { m: 'Ht' }, bend: 1, fish: true, fromName: 'the single electron on the bromine radical', toName: 'the tertiary hydrogen', say: 'One electron from bromine reaches for the hydrogen.' },
        { from: { mb: 'Ht' }, to: { v: { deg: 3 } }, bend: -1, fish: true, fromName: 'one electron of the C-H bond', toName: 'the tertiary carbon', say: 'One C-H electron goes with the hydrogen, the other stays on carbon: a tertiary radical.' }
      ]
    }]
  },
  {
    id: 'prop2', chip: '3. Propagation: take the Br', name: 'the second propagation step', stage: 'Propagation', ledger: { in: 1, out: 1 }, roots: ['l2-carbocation'],
    after: 'One radical in, one radical out, and a fresh bromine radical to go start the whole thing again. That is what makes it a chain.',
    states: [
      { main: 'C[C](C)C', with: ['BrBr'], side: 'right', label: 'the tertiary radical + Br2' },
      { main: 'CC(C)(C)Br', with: ['[Br]'], side: 'right', label: 'tert-butyl bromide + a new radical' }
    ],
    steps: [{
      name: 'take a bromine', nuc: 'the carbon radical', ele: 'Br2',
      say: 'The carbon radical grabs one bromine out of Br2. Its single electron pairs with one Br-Br electron to make the C-Br bond, and the other Br-Br electron leaves on the far bromine. That regenerated radical goes back to step two, which is why a tiny amount of light keeps the whole flask going. Ledger: one in, one out.',
      arrows: [
        { from: { m: 'rad' }, to: { in: 'w0', t: 'Br', pick: 'left' }, bend: 1, fish: true, fromName: 'the single electron on the carbon radical', toName: 'the near bromine of Br2', say: 'The carbon electron reaches for a bromine.' },
        { from: { in: 'w0', b: { t: 'Br' } }, to: { in: 'w0', t: 'Br', pick: 'right' }, bend: -1, fish: true, fromName: 'one electron of the Br-Br bond', toName: 'the far bromine', say: 'The far bromine leaves with one electron: a brand new radical.' }
      ]
    }]
  },
  {
    id: 'term', chip: '4. Termination', name: 'termination', stage: 'Termination', ledger: { in: 2, out: 0 }, roots: ['l2-carbocation'],
    after: 'Two radicals in, zero out. The chain is over. Termination is rare, because at any moment there are very few radicals in the flask and they are unlikely to find each other.',
    states: [
      { main: 'C[C](C)C', with: ['[Br]'], side: 'right', label: 'two radicals meet' },
      { main: 'CC(C)(C)Br', with: [], side: 'right', label: 'tert-butyl bromide, chain over' }
    ],
    steps: [{
      name: 'two radicals combine', nuc: 'both, at once', ele: 'both, at once',
      say: 'Two radicals bump into each other and their single electrons pair up into one bond. Nothing is left over. Two half arrows pointing at the same new bond. Ledger: two radicals in, zero out, and that is how a chain dies.',
      arrows: [
        { from: { m: 'rad' }, to: { in: 'w0', t: 'Br' }, bend: 1, fish: true, fromName: 'the single electron on the carbon radical', toName: 'the bromine radical', say: 'One electron from carbon.' },
        { from: { in: 'w0', m: 'rad' }, to: { v: { deg: 3 } }, bend: 1, fish: true, fromName: 'the single electron on the bromine radical', toName: 'the tertiary carbon', say: 'One electron from bromine. Together they make one ordinary bond.' }
      ]
    }]
  },
  {
    id: 'da', chip: 'Diels-Alder', name: 'the Diels-Alder cycloaddition', rid: 'diels_alder', scale: 1.45, roots: ['l2-arrows', 'l1-unsat'],
    after: 'One step, three arrows, six electrons going around in a circle. Two new single bonds at the ends and one new double bond between the two middle carbons of the old diene.',
    states: [
      { main: ['C=CC=O', 'C=CC=C'], mainLabels: ['the dienophile: the CHO makes it electron poor', 'the diene: curled into s-cis'], with: [], side: 'left', label: 'butadiene + acrolein, heated' },
      { main: 'O=CC1CCC=CC1', with: [], side: 'right', label: 'the adduct: a cyclohexene' }
    ],
    steps: [{
      name: 'three arrows at once', nuc: 'the diene, the electron-rich partner', ele: 'the dienophile, made poor by its CHO',
      say: 'Nothing attacks first here. All six electrons move at the same instant, in a circle. Count the arrows: three, every time. The diene has to be curled into s-cis so both ends can reach the same partner, and the dienophile wants an electron-withdrawing group like this CHO pulling density out of its double bond. Follow them around: one end of the diene reaches the far carbon of the dienophile, the dienophile reaches back to the other end, and what used to be the middle single bond becomes the new double bond.',
      arrows: [
        { from: { in: 'main1', b: [{ v: { deg: 1, pick: 'left' } }, { v: { deg: 2, pick: 'left' } }] }, to: { v: { deg: 1 } }, bend: 1, fromName: 'the pi bond at the near end of the diene', toName: 'the near carbon of the dienophile', say: 'Arrow one: the near end of the diene reaches across and makes a new single bond.' },
        { from: { b: [{ v: { deg: 1 } }, { v: { deg: 2, nnb: 'O' } }] }, to: { in: 'main1', v: { deg: 1, pick: 'right' } }, bend: -1, fromName: 'the pi bond of the dienophile', toName: 'the far end of the diene', say: 'Arrow two: the dienophile reaches around to the far end. That is the second new single bond.' },
        { from: { in: 'main1', b: [{ v: { deg: 1, pick: 'right' } }, { v: { deg: 2, pick: 'right' } }] }, to: { in: 'main1', b: [{ v: { deg: 2, pick: 'left' } }, { v: { deg: 2, pick: 'right' } }] }, bend: 1, fromName: 'the pi bond at the far end of the diene', toName: 'the middle single bond of the diene', say: 'Arrow three: the old middle single bond becomes the new double bond. That is where the alkene ends up.' }
      ]
    }]
  }
];

/* Selectivity: same alkane, two halogens, and the arithmetic that settles it.
   rate3 and rate1 are the per-hydrogen relative rates every textbook quotes. */
const SELECT = [
  { id: 'radical_br2', chip: 'Br2, light', halogen: 'bromine', sub: 'CC(C)C', n1: 9, n3: 1, rate1: 1, rate3: 1600, prod1: 'CC(C)CBr', prod3: 'CC(C)(C)Br',
    line: 'Bromine is slow and picky. Taking the tertiary hydrogen is about 1600 times easier per hydrogen than taking a primary one, and that swamps the fact that there are nine primary hydrogens against one tertiary. You get essentially one product. When a test says Br2 and light, look for the most substituted carbon that still has a hydrogen on it.' },
  { id: 'radical_cl2', chip: 'Cl2, light', halogen: 'chlorine', sub: 'CC(C)C', n1: 9, n3: 1, rate1: 1, rate3: 5, prod1: 'CC(C)CCl', prod3: 'CC(C)(C)Cl',
    line: 'Chlorine is fast and does not care. Tertiary is only about five times easier per hydrogen, so the nine primary hydrogens win on sheer numbers and the PRIMARY chloride is the major product. This is the one place in organic chemistry where you literally count hydrogens and do arithmetic.' },
  { id: 'toluene_nbs', chip: 'NBS, light', halogen: 'NBS', sub: 'Cc1ccccc1', prod3: 'BrCc1ccccc1', nbs: true,
    line: 'NBS keeps the bromine concentration tiny, which shuts off addition to the ring or to a double bond and leaves only the picky hydrogen grab. It takes the benzylic hydrogen, the one on the carbon NEXT to the ring, because that radical spreads out over the whole ring by resonance. On a plain alkene the same reagent takes the allylic hydrogen for exactly the same reason. What it never touches is a hydrogen ON the double bond: vinylic is poison.' }
];

/* Can this diene reach s-cis? Four honest verdicts, and every structure is drawn. */
const DIENES = [
  { smi: 'C=CC=C', v: 'rotate' },
  { smi: 'CC(=C)C=C', v: 'rotate' },
  { smi: 'CC(=C)C(C)=C', v: 'rotate' },
  { smi: 'C/C=C/C=C/C', v: 'rotate' },
  { smi: 'C1=CCC=C1', v: 'locked' },
  { smi: 'C1=CCCC=C1', v: 'locked' },
  { smi: 'C/C=C\\C=C/C', v: 'blocked' },
  { smi: 'C=CCC=C', v: 'notconj' },
  { smi: 'C=CCCC=C', v: 'notconj' }
];
const SCIS_CHOICES = [
  { key: 'rotate', text: 'Yes. It can turn about the middle single bond into s-cis.' },
  { key: 'locked', text: 'Yes, and it does not even have to turn: the ring holds it in s-cis already.' },
  { key: 'blocked', text: 'No. Turning it into s-cis jams the two inner groups into each other, so it stays s-trans.' },
  { key: 'notconj', text: 'No. The two double bonds are not conjugated, so this is not a diene for this reaction at all.' }
];
const SCIS_WHY = {
  rotate: 'The middle bond is a single bond, so it can turn. At room temperature s-trans is the resting shape, but enough molecules sit in s-cis at any moment for the reaction to run.',
  locked: 'The ring welds the diene into s-cis permanently, so it never has to make that turn at all. That is why cyclopentadiene is the fastest diene you will meet, and why it slowly dimerizes with itself on the shelf.',
  blocked: 'Turn this one into s-cis and the two inner methyl groups collide. The molecule will not accept that crowding, so it sits in s-trans and does no Diels-Alder. Geometry, not electronics.',
  notconj: 'There is an sp3 carbon between the two double bonds, so the four p orbitals are not in one system. A Diels-Alder needs four pi electrons in a row.'
};

/* Adduct distractors: the three things students actually draw instead. */
const ADDUCT_WRONG = {
  'O=CC1CCCCC1': 'You made the two new single bonds but forgot the new pi bond. Six electrons moved, so an alkene has to come out.',
  'O=CC1CCC=C1': 'That ring has five carbons. Four from the diene plus two from the dienophile is six, always.',
  'O=CC1=CCCCC1': 'The new double bond does not go there. It lands between the two carbons that were in the MIDDLE of the diene.'
};
// Honest same-substrate alternatives for the product item.
const ALT = {
  radical_br2: ['CC(C)CBr', 'CC(C)(C)Cl', 'CC(C)CCl'],
  radical_cl2: ['CC(C)(C)Cl', 'CC(C)CBr', 'CC(C)(C)Br'],
  diels_alder: ['O=CC1CCCCC1', 'O=CC1CCC=C1', 'O=CC1=CCCCC1'],
  diene_h2: ['CC=CC', 'CCC=C', 'C=CC=C'],
  toluene_nbs: ['Cc1ccc(Br)cc1', 'OC(=O)c1ccccc1', 'BrCc1ccc(Br)cc1']
};

/* ------------------------------------------------------------------ */
/* Node-safe helpers                                                    */
/* ------------------------------------------------------------------ */
function mulberry(seed){ let s = seed | 0; return function(){ s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function heavy(smi){ const s = smi.replace(/\[([A-Z][a-z]?|[a-z])[^\]]*\]/g, (m, g) => g); return (s.match(/Cl|Br|[BCNOSPFI]|[cnos]/g) || []).length; }
function charge(smi){ let q = 0; for (const b of smi.match(/\[[^\]]*\]/g) || []){ const p = /([+-])(\d?)/.exec(b); if (p) q += (p[1] === '+' ? 1 : -1) * (p[2] ? +p[2] : 1); } return q; }
function balanced(smi){ let d = 0; for (const ch of smi){ if (ch === '(') d++; if (ch === ')') d--; if (d < 0) return false; } if (d) return false; const ring = {}; for (const m of smi.replace(/\[[^\]]*\]/g, 'X').match(/\d/g) || []) ring[m] = (ring[m] || 0) + 1; return Object.values(ring).every(n => n % 2 === 0); }
function stateSmiles(st){ return (Array.isArray(st.main) ? st.main : [st.main]).concat(st.with || []); }
function shuffled(rng, a){ const b = a.slice(); for (let i = b.length - 1; i > 0; i--){ const j = Math.floor(rng() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; }
function pickN(rng, arr, n, not){ const pool = arr.filter(x => !not.includes(x)); const out = []; while (out.length < n && pool.length){ const i = Math.floor(rng() * pool.length); out.push(pool.splice(i, 1)[0]); } return out; }
// The share of product from one kind of hydrogen: how many there are, times how easy each one is.
export function share(n, rate, other){ return n * rate / (n * rate + other.n * other.rate); }
export function majorOf(S){ return share(S.n3, S.rate3, { n: S.n1, rate: S.rate1 }) > 0.5 ? S.prod3 : S.prod1; }
function pct(x){ return Math.round(x * 1000) / 10; }
function label(r){ return r.cond ? r.reagent + (/^\d\./.test(r.reagent) ? '; ' : ', ') + r.cond : r.reagent; }
function subName(api, r){ const s = api.reactions.SUBSTRATES[r.subClass]; return s ? s.name : 'the substrate'; }

/* ------------------------------------------------------------------ */
/* Item generators. Every answer is computed from the tables above.     */
/* ------------------------------------------------------------------ */
const KINDS = ['product', 'stage', 'halogen', 'scis', 'adduct'];
const STAGE_CHOICES = [
  { key: 'Initiation', text: 'Initiation: zero radicals go in, two come out.' },
  { key: 'Propagation', text: 'Propagation: one radical goes in, one comes out.' },
  { key: 'Termination', text: 'Termination: two radicals go in, none come out.' },
  { key: 'none', text: 'None of these. No radicals are involved in this step.' }
];
export function radicalPool(api){
  const R = api && api.reactions ? api.reactions.REACTIONS : null;
  if (!R) return [];
  return R.filter(r => ALT[r.id]);
}
export function genItem(rng, api, kind){
  kind = kind || KINDS[Math.floor(rng() * KINDS.length)];
  if (kind === 'product'){
    const pool = radicalPool(api);
    if (!pool.length) return genItem(rng, api, 'stage');
    const r = pool[Math.floor(rng() * pool.length)];
    const ds = pickN(rng, ALT[r.id], 3, [r.prod]);
    if (ds.length < 3) return genItem(rng, api, 'stage');
    const choices = shuffled(rng, [r.prod].concat(ds));
    const note = r.prodNote ? ' ' + r.prodNote.charAt(0).toUpperCase() + r.prodNote.slice(1) + '.' : '';
    return { kind, rid: r.id, sub: r.sub, reagent: label(r), drawn: true,
      stem: 'Major product? ' + subName(api, r) + ' with ' + label(r) + '.',
      choices: choices.map(s => ({ text: nameOf(s), smiles: s })), correct: choices.indexOf(r.prod),
      coach: r.thomas + note + ' ' + r.trap, roots: r.roots && r.roots.length ? r.roots : ['l2-carbocation'] };
  }
  if (kind === 'stage'){
    const pool = MECHANISMS.filter(M => M.ledger);
    const M = pool[Math.floor(rng() * pool.length)];
    const choices = shuffled(rng, STAGE_CHOICES.slice());
    return { kind, M, i: 0, stem: 'Here is one step of the bromination chain: ' + M.states[0].label + ' becomes ' + M.states[1].label + '. Which part of the chain is this?',
      choices: choices.map(c => ({ text: c.text, smiles: null })), correct: choices.findIndex(c => c.key === M.stage),
      coach: 'Audit the ledger. Count the radicals on the left: ' + M.ledger.in + '. Count them on the right: ' + M.ledger.out + '. That is ' + M.stage.toLowerCase() + '.', roots: M.roots };
  }
  if (kind === 'halogen'){
    const pool = SELECT.filter(S => !S.nbs);
    const S = pool[Math.floor(rng() * pool.length)];
    const others = SELECT.filter(S => !S.nbs);
    const all = []; for (const X of others){ all.push(X.prod3); all.push(X.prod1); }
    const ans = majorOf(S);
    const choices = shuffled(rng, [ans].concat(pickN(rng, all, 3, [ans])));
    const p3 = share(S.n3, S.rate3, { n: S.n1, rate: S.rate1 });
    return { kind, sid: S.id, sub: S.sub, reagent: S.chip, drawn: true,
      stem: '2-methylpropane with ' + S.chip + '. Which product dominates?',
      choices: choices.map(s => ({ text: nameOf(s), smiles: s })), correct: choices.indexOf(ans),
      coach: 'Do the arithmetic: ' + S.n1 + ' primary hydrogens at a relative rate of ' + S.rate1 + ' each, against ' + S.n3 + ' tertiary hydrogen at ' + S.rate3 + '. That is about ' + pct(p3) + ' per cent tertiary, so ' + nameOf(ans) + ' wins. ' + (S.rate3 > 100 ? 'Bromine is picky.' : 'Chlorine does not care, so the count decides.'), roots: ['l2-carbocation', 'l1-skeletal'] };
  }
  if (kind === 'scis'){
    const D = DIENES[Math.floor(rng() * DIENES.length)];
    const choices = shuffled(rng, SCIS_CHOICES.slice());
    return { kind, sub: D.smi, stem: 'Can this diene get into the s-cis shape a Diels-Alder needs?',
      choices: choices.map(c => ({ text: c.text, smiles: null })), correct: choices.findIndex(c => c.key === D.v),
      coach: 'This is ' + nameOf(D.smi) + '. ' + SCIS_WHY[D.v], roots: ['l1-unsat', 'l3-ez'] };
  }
  const r = api && api.reactions ? api.reactions.find('diels_alder') : null;
  if (!r) return genItem(rng, api, 'stage');
  const wrongs = Object.keys(ADDUCT_WRONG);
  const choices = shuffled(rng, [r.prod].concat(wrongs));
  return { kind: 'adduct', rid: r.id, sub: r.sub, reagent: label(r), drawn: true,
    stem: 'Butadiene is heated with acrolein. Which one is the Diels-Alder adduct?',
    choices: choices.map(s => ({ text: nameOf(s), smiles: s, why: ADDUCT_WRONG[s] ? ADDUCT_WRONG[s] : null })), correct: choices.indexOf(r.prod),
    coach: 'Four carbons from the diene plus two from the dienophile makes a six-membered ring, and the new double bond sits between the two carbons that were in the middle of the diene. ' + r.thomas, roots: r.roots && r.roots.length ? r.roots : ['l2-arrows', 'l1-unsat'] };
}

export function makeItem(api){
  const it = genItem(api.rng, api);
  return { stem: it.stem, sub: it.sub || (it.M ? it.M.states[0].main : null), reagent: it.reagent || null, prod: null,
    choices: it.choices.map(c => ({ text: c.text, smiles: c.smiles || null })), correct: it.correct, coach: it.coach,
    home: meta.id, roots: it.roots && it.roots.length ? it.roots : ['l2-carbocation', 'l2-arrows'] };
}

export function selfTest(deps){
  const rng = mulberry(67);
  const api = { rng, pick: a => a[Math.floor(rng() * a.length)], shuffle: a => shuffled(rng, a), reactions: deps && deps.reactions, bank: deps && deps.bank };
  const bad = m => ({ ok: false, tried: 0, notes: m });
  for (const s of SMILES){ if (!balanced(s)) return bad('unbalanced SMILES in the list: ' + s); if (!SPECIES[s]) return bad(s + ' missing from SPECIES'); }
  for (const D of DIENES) if (!SMILES.includes(D.smi)) return bad('diene not listed: ' + D.smi);
  for (const S of SELECT){ for (const s of [S.sub, S.prod1, S.prod3]) if (s && !SMILES.includes(s)) return bad('selectivity SMILES not listed: ' + s); }
  for (const s in ADDUCT_WRONG) if (!SMILES.includes(s)) return bad('adduct distractor not listed: ' + s);
  for (const id in ALT) for (const s of ALT[id]) if (!SMILES.includes(s)) return bad('alternative product not listed: ' + s);
  // the four verdicts and the three chain stages are all reachable
  for (const k of ['rotate', 'locked', 'blocked', 'notconj']) if (!DIENES.some(D => D.v === k)) return bad('no diene is ' + k);
  for (const k of ['Initiation', 'Propagation', 'Termination']) if (!MECHANISMS.some(M => M.ledger && M.stage === k)) return bad('no mechanism is ' + k);
  // mechanism invariants
  for (const M of MECHANISMS){
    if (M.steps.length !== M.states.length - 1) return bad(M.id + ': steps must be states minus one');
    for (const st of M.states) for (const s of stateSmiles(st)){ if (!SMILES.includes(s)) return bad(M.id + ': ' + s + ' missing from SMILES'); if (!balanced(s)) return bad(s + ' unbalanced'); }
    for (let i = 0; i < M.steps.length; i++){
      const a = M.states[i], b = M.states[i + 1];
      const hv = st => stateSmiles(st).reduce((n, s) => n + heavy(s), 0);
      const qv = st => stateSmiles(st).reduce((n, s) => n + charge(s), 0);
      if (hv(a) !== hv(b)) return bad(M.id + ' step ' + i + ': heavy atoms not conserved (' + hv(a) + ' to ' + hv(b) + ')');
      if (qv(a) !== qv(b)) return bad(M.id + ' step ' + i + ': charge not conserved');
      const step = M.steps[i];
      if (!step.arrows.length || !step.nuc || !step.ele || !step.say) return bad(M.id + ' step ' + i + ': incomplete');
      for (const ar of step.arrows){
        const f = ar.from;
        const electrons = f.m != null || f.mb != null || f.b != null || (f.t && f.part === 'HB');
        if (!electrons) return bad(M.id + ' step ' + i + ': an arrow starts at an atom, not at electrons');
        if (!ar.fromName || !ar.toName) return bad(M.id + ': every arrow needs names');
      }
      // radical steps push half arrows, the cycloaddition pushes whole ones
      const fish = step.arrows.filter(ar => ar.fish).length;
      if (M.ledger && fish !== step.arrows.length) return bad(M.id + ': a radical step must use half arrows for every arrow');
      if (!M.ledger && fish) return bad(M.id + ': a non-radical step must not use half arrows');
    }
    if (M.ledger && M.ledger.in - M.ledger.out !== (M.stage === 'Initiation' ? -2 : M.stage === 'Termination' ? 2 : 0)) return bad(M.id + ': the ledger disagrees with its stage');
  }
  if (MECHANISMS.find(M => M.id === 'da').steps[0].arrows.length !== 3) return bad('a Diels-Alder is three arrows, always');
  // the selectivity arithmetic agrees with the verified table
  if (api.reactions){
    for (const S of SELECT){
      const r = api.reactions.find(S.id); if (!r) return bad('missing reaction ' + S.id);
      const m = S.nbs ? S.prod3 : majorOf(S);
      if (m !== r.prod) return bad(S.id + ': the arithmetic gives ' + m + ' but the table says ' + r.prod);
    }
    const da = api.reactions.find('diels_alder');
    if (!da || da.prod !== 'O=CC1CCC=CC1') return bad('the Diels-Alder row moved');
    if (ADDUCT_WRONG[da.prod]) return bad('the real adduct is listed as a distractor');
    if (radicalPool(api).length < 4) return bad('the product pool is too thin');
  }
  // items
  let tried = 0; const seen = {};
  for (let n = 0; n < 320; n++){
    const it = makeItem(api); tried++;
    if (!it.choices || it.choices.length !== 4) return { ok: false, tried, notes: 'four choices required' };
    const ks = it.choices.map(c => (c.smiles || '') + '|' + c.text);
    if (new Set(ks).size !== 4) return { ok: false, tried, notes: 'choices not distinct: ' + ks.join(' / ') };
    if (!(it.correct >= 0 && it.correct < 4)) return { ok: false, tried, notes: 'correct index out of range' };
    for (const c of it.choices) if (c.smiles && !balanced(c.smiles)) return { ok: false, tried, notes: 'unbalanced choice SMILES ' + c.smiles };
    if (it.sub && !balanced(it.sub)) return { ok: false, tried, notes: 'unbalanced sub ' + it.sub };
    if (!it.coach || !it.stem) return { ok: false, tried, notes: 'coach or stem empty' };
    if (it.home !== meta.id) return { ok: false, tried, notes: 'home is ' + it.home };
    if (!it.roots || !it.roots.length) return { ok: false, tried, notes: 'roots empty' };
  }
  for (const k of KINDS){ const it = genItem(mulberry(13), api, k); if (!it || it.correct < 0) return { ok: false, tried, notes: k + ' failed to build' }; seen[k] = 1; }
  // the computed answers keep agreeing with the tables
  for (let n = 0; n < 200; n++){
    const p = genItem(rng, api, 'product');
    if (p.rid){ const r = api.reactions.find(p.rid); if (p.choices[p.correct].smiles !== r.prod) return { ok: false, tried, notes: 'product answer does not match the table for ' + p.rid }; }
    const h = genItem(rng, api, 'halogen');
    const S = SELECT.find(x => x.id === h.sid);
    if (h.choices[h.correct].smiles !== majorOf(S)) return { ok: false, tried, notes: 'the halogen answer does not match the arithmetic' };
    const sc = genItem(rng, api, 'scis');
    const D = DIENES.find(x => x.smi === sc.sub);
    if (sc.choices[sc.correct].text !== SCIS_CHOICES.find(c => c.key === D.v).text) return { ok: false, tried, notes: 's-cis answer does not match the diene table' };
    const ad = genItem(rng, api, 'adduct');
    if (ADDUCT_WRONG[ad.choices[ad.correct].smiles]) return { ok: false, tried, notes: 'the adduct item keyed a distractor' };
  }
  const a = genItem(mulberry(17), api), b = genItem(mulberry(17), api);
  if (JSON.stringify(a) !== JSON.stringify(b)) return { ok: false, tried, notes: 'not reproducible' };
  return { ok: true, tried, notes: MECHANISMS.length + ' stages, ' + Object.keys(seen).length + ' item kinds, ' + DIENES.length + ' dienes' };
}

/* ================================================================== */
/* The mechanism engine, shared verbatim with t5-proton: species are    */
/* drawn by the shell's SMILES renderer, then read back (atom labels,   */
/* vertices, bonds) so curved arrows can anchor to real atoms. Marks    */
/* the renderer cannot show (lone pairs, charges on carbon, explicit    */
/* hydrogens, radical dots) are drawn here. Modules cannot import, so   */
/* this block is duplicated across the mechanism modules on purpose.    */
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
  else if (spec.v){ const c = spec.v; const list = G.V.filter(v => (c.deg == null || v.deg === c.deg) && (c.order == null || v.order === ORD[c.order]) && (c.el == null ? v.el === 'C' : v.el === c.el) && (c.nb == null || v.nb.some(j => G.V[j].el === c.nb)) && (c.nnb == null || !v.nb.some(j => G.V[j].el === c.nnb))); const v = pickOne(list, c); if (v) p = { x: v.x, y: v.y }; }
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
function prepareSpecies(api, layer, smi, k, marksOverride){
  const sp = SPECIES[smi] || { name: smi, marks: [] };
  const markList = marksOverride || sp.marks || [];
  const node = api.drawSmiles(layer, smi, { width: 240, height: 160, label: sp.name });
  const G = analyze(node);
  // marks in drawer units
  const placed = [];
  for (const mk of markList){
    const base = resolve(G, mk.at); if (!base) continue;
    const dir = mk.dir != null ? mk.dir : freeDir(G, base, placed.filter(m => Math.hypot(m.bx - base.x, m.by - base.y) < 1).map(m => m.dir));
    const dist = mk.kind === 'lp' ? 11 : mk.kind === 'H' ? 13 : mk.kind === 'dot' ? 9 : 12;
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
      else if (m.kind === 'dot'){ out.marksG.append(api.svg('circle', { cx: q.x, cy: q.y, r: 2.6 * k, fill: C.amber })); }
      else if (m.kind === 'H'){ const b = out.T({ x: m.bx, y: m.by }); const ux = (q.x - b.x) / Math.hypot(q.x - b.x, q.y - b.y), uy = (q.y - b.y) / Math.hypot(q.x - b.x, q.y - b.y); out.marksG.append(api.svg('line', { x1: b.x + ux * 2 * k, y1: b.y + uy * 2 * k, x2: q.x - ux * 6 * k, y2: q.y - uy * 6 * k, stroke: C.ink2, 'stroke-width': String(1.5 * k), 'stroke-linecap': 'round' }), api.svg('text', { x: q.x, y: q.y + 4.2 * k, 'text-anchor': 'middle', 'font-family': 'Arial, Helvetica, sans-serif', 'font-size': String(12 * k), fill: C.ink, text: 'H' })); }
    }
  };
  // taps: every lone pair, bond and atom, with a kind, for the you-try
  out.hits = () => {
    const h = [];
    for (const m of placed){ if (m.kind === 'lp') h.push({ kind: 'lp', p: out.T(m), name: 'the lone pair on ' + (G.V.find(v => Math.hypot(v.x - m.bx, v.y - m.by) < 2) || { el: 'the atom' }).el }); if (m.kind === 'H') h.push({ kind: 'atom', p: out.T(m), name: 'a hydrogen' }); if (m.kind === 'H') h.push({ kind: 'sigma', p: out.T({ x: (m.x + m.bx) / 2, y: (m.y + m.by) / 2 }), name: 'the C-H bond' }); if (m.kind === '+') h.push({ kind: 'plus', p: out.T(m), name: 'the plus sign' }); if (m.kind === 'dot') h.push({ kind: 'lp', p: out.T(m), name: 'the single electron of the radical' }); if (m.kind === '-') h.push({ kind: 'lp', p: out.T(m), name: 'the minus, a lone pair on carbon' }); }
    for (const e of G.edges) h.push({ kind: e.order > 1 ? 'pi' : 'sigma', p: out.T(e.mid), name: e.order > 1 ? 'the pi bond' : 'a sigma bond' });
    for (const v of G.V) h.push({ kind: 'atom', p: out.T(v), name: v.text ? 'the ' + v.el + ' atom' : 'a carbon' });
    for (const t of G.texts) if (t.hasH){ h.push({ kind: 'atom', p: out.T({ x: t.hx, y: t.hy }), name: 'a hydrogen on ' + t.el }); h.push({ kind: 'sigma', p: out.T({ x: (t.x + t.hx) / 2, y: (t.y + t.hy) / 2 }), name: 'the ' + t.el + '-H bond' }); }
    return h;
  };
  return out;
}
// Build one state box (partners beside the main species) into a layer. Returns the box with parts.
function buildState(api, layer, st, k, X, Y, opts){
  const kp = k * 0.92, gap = 17 * k / 1.5, padX = 12, padY = 10;
  const mk = st.marks || null;
  const mains = (Array.isArray(st.main) ? st.main : [st.main]).map(s => prepareSpecies(api, layer, s, k, mk && mk[s]));
  const withs = (st.with || []).map(s => prepareSpecies(api, layer, s, kp, mk && mk[s]));
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
function curved(api, from, to, bend, markerId, k, color){
  const dx = to.x - from.x, dy = to.y - from.y, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
  const fx = from.x + dx / L * 3 * k, fy = from.y + dy / L * 3 * k, tx = to.x - dx / L * 9 * k, ty = to.y - dy / L * 9 * k;
  const amp = Math.max(18 * k, Math.min(L * 0.38, 60 * k));
  const cx = (fx + tx) / 2 + nx * bend * amp, cy = (fy + ty) / 2 + ny * bend * amp;
  return api.svg('path', { d: 'M' + fx.toFixed(1) + ' ' + fy.toFixed(1) + ' Q' + cx.toFixed(1) + ' ' + cy.toFixed(1) + ' ' + tx.toFixed(1) + ' ' + ty.toFixed(1), fill: 'none', stroke: color || api.colors.goldhi, 'stroke-width': String(1.9 * Math.min(k, 1.7)), 'stroke-linecap': 'round', 'marker-end': 'url(#' + markerId + ')' });
}
function markerDefs(api, id, color, half){ return api.svg('defs', {}, api.svg('marker', { id, viewBox: '0 0 10 10', refX: '8', refY: '5', markerWidth: half ? 6 : 5, markerHeight: half ? 6 : 5, orient: 'auto' }, api.svg('path', { d: half ? 'M0 0 L10 5 L1.5 4.4 z' : 'M0 0 L10 5 L0 10 z', fill: color }))); }
function arrowPath(api, box, ar, markerId, k){
  const partOf = spec => box.parts[spec.in || 'main'];
  const pf = partOf(ar.from), pt = partOf(ar.to); if (!pf || !pt) return null;
  const a = resolve(pf.G, ar.from), b = resolve(pt.G, ar.to); if (!a || !b) return null;
  return curved(api, pf.T(a), pt.T(b), ar.bend || 1, markerId + (ar.fish ? 'h' : ''), k, ar.fish ? api.colors.amber : null);
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
  const chipEls = MECHS.map(M => el('button', { class: 'chip', type: 'button', 'aria-pressed': M === mech ? 'true' : 'false', text: M.chip, onClick: () => { stopPlay(); mech = M; cur = { step: 0, arrow: 0, done: false }; chipEls.forEach((c, i) => c.setAttribute('aria-pressed', MECHS[i] === M ? 'true' : 'false')); render(); speak(); paintExtra(); } }));
  chips.append(...chipEls);
  const legend = el('div', { style: { display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', marginTop: '10px', fontSize: '12px', color: C.ink3, fontFamily: 'ui-monospace, Menlo, monospace', letterSpacing: '.04em' } });
  const legendItem = (draw, text) => { const s = svg('svg', { viewBox: '0 0 26 16', width: '26', height: '16', style: { display: 'inline-block', width: '26px', height: '16px', verticalAlign: 'middle', marginRight: '4px' } }); draw(s); return el('span', {}, s, text); };
  legend.append(
    legendItem(s => s.append(svg('circle', { cx: 9, cy: 8, r: 2.4, fill: C.blue }), svg('circle', { cx: 16, cy: 8, r: 2.4, fill: C.blue })), 'lone pair, electrons ready to attack'),
    legendItem(s => s.append(svg('circle', { cx: 13, cy: 8, r: 6, fill: 'none', stroke: C.coral, 'stroke-width': '1.4' }), svg('line', { x1: 9.5, y1: 8, x2: 16.5, y2: 8, stroke: C.coral, 'stroke-width': '1.6' }), svg('line', { x1: 13, y1: 4.5, x2: 13, y2: 11.5, stroke: C.coral, 'stroke-width': '1.6' })), 'plus: electron poor, an empty spot'),
    legendItem(s => s.append(svg('circle', { cx: 13, cy: 8, r: 6, fill: 'none', stroke: C.blue, 'stroke-width': '1.4' }), svg('line', { x1: 9.5, y1: 8, x2: 16.5, y2: 8, stroke: C.blue, 'stroke-width': '1.6' })), 'minus: electron rich'),
    legendItem(s => s.append(svg('path', { d: 'M3 13 Q13 -2 23 9', fill: 'none', stroke: C.goldhi, 'stroke-width': '2', 'stroke-linecap': 'round' }), svg('path', { d: 'M19 5 L23.5 9.5 L17.5 10.5 z', fill: C.goldhi })), 'gold arrow: two electrons moving')
  );
  if (opts.fishhook) legend.append(legendItem(s => s.append(svg('circle', { cx: 5, cy: 12, r: 2.4, fill: C.amber }), svg('path', { d: 'M3 13 Q13 -2 23 9', fill: 'none', stroke: C.amber, 'stroke-width': '2', 'stroke-linecap': 'round' }), svg('path', { d: 'M19 5 L23.5 9.5 L20.5 8 z', fill: C.amber })), 'fishhook: ONE electron moving'));
  const extra = el('div', {});
  slots.visual.append(opts.eyebrow ? el('span', { class: 'eyebrow', text: opts.eyebrow }) : null, wrap, el('div', { class: 'controls' }, nextBtn, playBtn, resetBtn), cap, chips, extra, legend);
  function paintExtra(){ if (opts.extra){ extra.replaceChildren(); opts.extra(extra, mech, cur); } }

  let boxes = [], mid = '', layers = null, W = 960, k = 1.5, laidHidden = false;
  function layout(){
    W = Math.max(300, Math.round(wrap.clientWidth || 0)) || 960; laidHidden = !wrap.clientWidth;
    k = W < 560 ? 1.25 : 1.5;
    stage.replaceChildren(); mid = 'mk' + (++uid);
    stage.append(markerDefs(api, mid, C.goldhi), markerDefs(api, mid + 'f', C.gold), markerDefs(api, mid + 'h', C.amber, true));
    layers = { boxes: svg('g', {}), species: svg('g', {}), labels: svg('g', {}), arrows: svg('g', { class: 'mech-arrows' }) };
    stage.append(layers.boxes, layers.species, layers.labels, layers.arrows);
    boxes = mech.states.map(st => buildState(api, layers.species, st, k * (mech.scale || 1), 0, 0));
    // pack rows
    const conn = Math.max(54, ...mech.steps.map(st => st.name.length * 6.6 + 26)) * k / 1.5, rows = [[]]; let x = 0;
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
    paint(true); speak(); paintExtra();
    if (playing && !cur.done) timers.push(setTimeout(() => step(false), api.reduced ? 0 : 900)); else if (cur.done) stopPlay();
  }
  function play(){ if (playing){ stopPlay(); return; } if (cur.done){ cur = { step: 0, arrow: 0, done: false }; render(); } playing = true; playBtn.textContent = 'Pause'; step(false); }
  function stopPlay(){ playing = false; playBtn.textContent = 'Play'; timers.forEach(clearTimeout); timers = []; busy = false; }
  let lastW = 0;
  const onResize = () => { const w = wrap.clientWidth; if (w && w !== lastW){ lastW = w; render(); } };
  window.addEventListener('resize', onResize);
  if (typeof ResizeObserver !== 'undefined'){ try { new ResizeObserver(onResize).observe(wrap); } catch (e){} }
  render(); speak(); paintExtra();
  return { get mech(){ return mech; }, render };
}

/* ------------------------------------------------------------------ */
/* You try: drawn states, tap targets, and bank items in between.       */
/* ------------------------------------------------------------------ */
function stateSvg(api, st, k){
  const s = api.svg('svg', { role: 'img', 'aria-label': st.label, style: { display: 'block', maxWidth: '100%', height: 'auto' } });
  const id = 'tr' + (++uid); s.append(markerDefs(api, id, api.colors.goldhi), markerDefs(api, id + 'h', api.colors.amber, true));
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
  const bank = (api.bank && api.bank.items) ? (opts.groups || []).flatMap(g => api.bank.items(g)) : [];
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
    if (it.M && it.tap){
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
      const first = it.twoTap ? 'Tap where the electrons START: a lone pair, a bond or a single electron.' : 'Tap where the arrow starts.';
      prompt.textContent = it.stem + ' ' + first;
      const resetTaps = () => { stage = 0; src = null; marks.replaceChildren(); prompt.textContent = 'Same one again. ' + first; };
      const choose = h => {
        if (done) return;
        if (!it.twoTap || stage === 0){
          const ok = near(h, F);
          if (ok){ marks.append(svg('circle', { cx: h.p.x, cy: h.p.y, r: 9 * kk / 1.5, fill: 'none', stroke: C.goldhi, 'stroke-width': '2' })); if (!it.twoTap){ hitLayer.replaceChildren(); commit(true); return; } src = h; stage = 1; prompt.textContent = 'Now tap where they GO.'; return; }
          const why = h.kind === 'plus' ? 'A plus has nothing to give. The arrow starts at electrons: here ' + ar.fromName + '.' : h.kind === 'atom' ? 'The arrow starts at electrons, not at an atom. Here that is ' + ar.fromName + '.' : h.kind === 'sigma' && ar.from.mb == null && !(ar.from.t && ar.from.part === 'HB') ? 'That is a sigma bond; sigma electrons do not attack. Start at ' + ar.fromName + ', the base.' : 'Rich attacks poor. The electrons that move first are ' + ar.fromName + '.';
          commit(false, why); if (it.twoTap) resetTaps(); return;
        }
        const ok = near(h, T);
        marks.append(curved(api, src.p, h.p, ar.bend || 1, sv.id + (ar.fish ? 'h' : ''), kk, ar.fish ? C.amber : null));
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
    optionGrid(it.choices, it.correct, it.coach, !!it.drawn);
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
    else { item = opts.gen(api.rng); renderGenerated(item); }
  }
  next();
}

/* ------------------------------------------------------------------ */
/* The ledger strip under the stage: radicals in, radicals out.         */
/* ------------------------------------------------------------------ */
function ledgerStrip(api, host, mech){
  const { el } = api, C = api.colors;
  const badge = (text, color) => el('span', { style: { fontFamily: 'ui-monospace, Menlo, monospace', fontSize: '11px', letterSpacing: '.06em', textTransform: 'uppercase', padding: '5px 10px', borderRadius: '999px', border: '1px solid ' + color, color }, text });
  if (!mech.ledger){
    host.append(el('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' } },
      badge('three arrows, always', C.gold), badge('the diene must be s-cis', C.blue), badge('the dienophile wants an electron-withdrawing group', C.coral)));
    return;
  }
  const strip = el('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px', alignItems: 'stretch' } });
  for (const M of MECHANISMS){
    if (!M.ledger) continue;
    const on = M === mech;
    const net = M.ledger.out - M.ledger.in;
    strip.append(el('div', { style: { flex: '1 1 150px', minWidth: '140px', border: '1px solid ' + (on ? C.gold : C.line), background: on ? 'rgba(201,168,76,.10)' : 'rgba(255,255,255,.02)', borderRadius: '10px', padding: '8px 10px', opacity: on ? '1' : '.6' } },
      el('div', { style: { fontFamily: 'ui-monospace, Menlo, monospace', fontSize: '10px', letterSpacing: '.12em', textTransform: 'uppercase', color: on ? C.goldhi : C.ink3 }, text: M.stage }),
      el('div', { style: { fontFamily: 'Georgia, serif', fontSize: '17px', color: on ? C.ink : C.ink2 }, text: M.ledger.in + ' in, ' + M.ledger.out + ' out' }),
      el('div', { style: { fontSize: '12px', color: net > 0 ? C.amber : net < 0 ? C.green : C.ink3 }, text: net > 0 ? 'radicals made' : net < 0 ? 'radicals used up' : 'radicals handed on' })));
  }
  host.append(strip, el('p', { style: { margin: '8px 0 0', fontFamily: 'Georgia, serif', fontSize: '16px', color: C.goldhi, maxWidth: '70ch' }, text: 'Propagation is the engine: one radical in, one radical out, over and over. That is why a flash of light can run a whole flask.' }));
}

/* ------------------------------------------------------------------ */
/* Selectivity: same alkane, two halogens, and the arithmetic.          */
/* ------------------------------------------------------------------ */
function mountSelectivity(container, api){
  const { el } = api, C = api.colors;
  let pick = SELECT[0];
  const holder = el('div', { style: { marginTop: '18px', paddingTop: '14px', borderTop: '1px solid ' + C.line } });
  holder.append(el('span', { class: 'eyebrow', text: 'Which hydrogen does it take? Bromine is picky, chlorine is not' }));
  const body = el('div', { style: { marginTop: '8px' } });
  const line = el('p', { style: { margin: '10px 0 0', color: C.ink2, fontSize: '15px', maxWidth: '70ch' } });
  const chips = el('div', { class: 'controls', role: 'group', 'aria-label': 'Pick a reagent' });
  const chipEls = SELECT.map(S => el('button', { class: 'chip', type: 'button', 'aria-pressed': S === pick ? 'true' : 'false', text: S.chip,
    onClick: () => { pick = S; chipEls.forEach((c, i) => c.setAttribute('aria-pressed', SELECT[i] === S ? 'true' : 'false')); draw(); } }));
  chips.append(...chipEls);
  holder.append(body, chips, line);
  container.append(holder);
  function cell(smi, cap, major){
    const box = el('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,.02)', border: '1px solid ' + (major ? C.gold : C.line), borderRadius: '10px', padding: '8px 10px', boxShadow: major ? '0 0 0 2px rgba(201,168,76,.18)' : 'none' } });
    const sp = speciesSvg(api, smi, 1.25, 190);
    box.append(sp.svg, el('span', { style: { fontFamily: 'Georgia, serif', fontSize: '13px', color: major ? C.goldhi : C.ink2, textAlign: 'center' }, text: cap }));
    return { box, sp };
  }
  function bar(text, frac, color){
    return el('div', { style: { margin: '6px 0' } },
      el('div', { style: { fontFamily: 'ui-monospace, Menlo, monospace', fontSize: '12px', color: C.ink2 }, text }),
      el('div', { style: { height: '9px', borderRadius: '999px', background: 'rgba(255,255,255,.06)', overflow: 'hidden', marginTop: '3px' } },
        el('div', { style: { height: '100%', width: Math.max(1.5, frac * 100) + '%', background: color, borderRadius: '999px' } })));
  }
  function draw(){
    body.replaceChildren();
    const builds = [];
    const row = el('div', { style: { display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' } });
    const sub = cell(pick.sub, nameOf(pick.sub), false); builds.push(sub.sp);
    row.append(sub.box);
    if (pick.nbs){
      const prod = cell(pick.prod3, nameOf(pick.prod3) + ', the benzylic product', true); builds.push(prod.sp);
      row.append(el('div', { style: { fontFamily: 'ui-monospace, Menlo, monospace', fontSize: '12px', color: C.goldhi, textAlign: 'center', minWidth: '90px' } }, 'NBS, light'), prod.box);
      body.append(row, el('div', { style: { marginTop: '10px', display: 'flex', gap: '8px', flexWrap: 'wrap' } },
        el('span', { style: { fontFamily: 'ui-monospace, Menlo, monospace', fontSize: '11px', letterSpacing: '.06em', textTransform: 'uppercase', padding: '5px 10px', borderRadius: '999px', border: '1px solid ' + C.green, color: C.green }, text: 'benzylic and allylic: resonance holds the radical up' }),
        el('span', { style: { fontFamily: 'ui-monospace, Menlo, monospace', fontSize: '11px', letterSpacing: '.06em', textTransform: 'uppercase', padding: '5px 10px', borderRadius: '999px', border: '1px solid ' + C.coral, color: C.coral }, text: 'vinylic: poison, never here' })));
    } else {
      const s3 = share(pick.n3, pick.rate3, { n: pick.n1, rate: pick.rate1 }), s1 = 1 - s3;
      const major = majorOf(pick);
      const counts = el('div', { style: { flex: '1 1 260px', minWidth: '240px' } },
        bar(pick.n1 + ' primary hydrogens, relative rate ' + pick.rate1 + ' each: about ' + pct(s1) + ' per cent of the product', s1, s1 > s3 ? C.gold : C.grey),
        bar(pick.n3 + ' tertiary hydrogen, relative rate ' + pick.rate3 + ': about ' + pct(s3) + ' per cent of the product', s3, s3 > s1 ? C.gold : C.grey));
      const p1 = cell(pick.prod1, nameOf(pick.prod1) + ' (' + pct(s1) + ' per cent)', major === pick.prod1);
      const p3 = cell(pick.prod3, nameOf(pick.prod3) + ' (' + pct(s3) + ' per cent)', major === pick.prod3);
      builds.push(p1.sp, p3.sp);
      row.append(el('div', { style: { fontFamily: 'ui-monospace, Menlo, monospace', fontSize: '12px', color: C.goldhi, textAlign: 'center', minWidth: '80px' } }, pick.chip), counts);
      body.append(row, el('div', { style: { display: 'flex', gap: '14px', flexWrap: 'wrap', marginTop: '10px' } }, p1.box, p3.box));
    }
    for (const b of builds) b.build();
    line.textContent = pick.line;
  }
  draw();
  return { draw };
}

/* ------------------------------------------------------------------ */
/* s-cis versus s-trans. The renderer cannot draw a conformer, so this  */
/* is a rotation sketch of the four diene carbons, the same way a       */
/* Newman projection is a sketch; the real dienes beside it are drawn   */
/* from SMILES.                                                         */
/* ------------------------------------------------------------------ */
const SHAPE_EXAMPLES = [
  { key: 'rotate', chip: 'Free to turn', smi: 'C=CC=C' },
  { key: 'locked', chip: 'Locked s-cis', smi: 'C1=CCC=C1' },
  { key: 'blocked', chip: 'Jammed', smi: 'C/C=C\\C=C/C' }
];
function mountScis(container, api){
  const { el, svg } = api, C = api.colors;
  let deg = 0, ex = SHAPE_EXAMPLES[0];
  const holder = el('div', { style: { marginTop: '18px', paddingTop: '14px', borderTop: '1px solid ' + C.line } });
  holder.append(el('span', { class: 'eyebrow', text: 'The diene has to curl up: turn the middle single bond' }));
  const grid = el('div', { style: { display: 'flex', gap: '18px', flexWrap: 'wrap', alignItems: 'flex-start', marginTop: '8px' } });
  const stage = svg('svg', { role: 'img', 'aria-label': 'a sketch of the diene turning about its middle single bond', viewBox: '0 0 380 210', style: { display: 'block', width: '100%', maxWidth: '380px', height: 'auto' } });
  const verdict = el('p', { style: { margin: '6px 0 0', fontFamily: 'Georgia, serif', fontSize: '17px', color: C.goldhi } });
  const range = el('input', { type: 'range', min: '0', max: '180', step: '5', value: '0', 'aria-label': 'turn the middle single bond, in degrees' });
  range.addEventListener('input', () => { deg = +range.value; draw(); });
  const left = el('div', { style: { flex: '1 1 380px', minWidth: '300px' } }, stage, verdict,
    el('div', { class: 'slider', style: { marginTop: '10px' } }, el('span', { text: 's-cis' }), range, el('span', { text: 's-trans' })),
    el('div', { class: 'controls' },
      el('button', { class: 'chip', type: 'button', text: 'Snap to s-cis', onClick: () => { deg = 0; range.value = '0'; draw(); } }),
      el('button', { class: 'chip', type: 'button', text: 'Snap to s-trans', onClick: () => { deg = 180; range.value = '180'; draw(); } })));
  const rightBox = el('div', { style: { flex: '1 1 260px', minWidth: '240px' } });
  const exHolder = el('div', { style: { display: 'flex', justifyContent: 'center', marginTop: '6px' } });
  const exLine = el('p', { style: { margin: '8px 0 0', color: C.ink2, fontSize: '15px' } });
  const exChips = el('div', { class: 'controls', role: 'group', 'aria-label': 'Pick a real diene' });
  const exEls = SHAPE_EXAMPLES.map(E => el('button', { class: 'chip', type: 'button', 'aria-pressed': E === ex ? 'true' : 'false', text: E.chip,
    onClick: () => { ex = E; exEls.forEach((c, i) => c.setAttribute('aria-pressed', SHAPE_EXAMPLES[i] === E ? 'true' : 'false')); drawEx(); } }));
  exChips.append(...exEls);
  rightBox.append(el('span', { class: 'eyebrow', text: 'and here it is on real dienes' }), exHolder, exChips, exLine);
  grid.append(left, rightBox);
  holder.append(grid);
  container.append(holder);

  function dbl(a, b, side){
    const g = svg('g', {});
    const dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy) || 1, nx = -dy / L * 4 * side, ny = dx / L * 4 * side;
    g.append(svg('line', { x1: a.x, y1: a.y, x2: b.x, y2: b.y, stroke: C.ink, 'stroke-width': '2.2', 'stroke-linecap': 'round' }));
    g.append(svg('line', { x1: a.x + nx, y1: a.y + ny, x2: b.x + nx, y2: b.y + ny, stroke: C.ink, 'stroke-width': '2.2', 'stroke-linecap': 'round' }));
    return g;
  }
  function draw(){
    stage.replaceChildren();
    const t = deg * Math.PI / 180;
    const C2 = { x: 155, y: 120 }, C3 = { x: 225, y: 120 };
    const C1 = { x: 95, y: 120 - 52 };
    const C4 = { x: 285, y: 120 - 52 * Math.cos(t) };
    const close = deg <= 55, far = deg >= 125;
    // the partner sits in the pocket the two ends make
    if (close){
      const px = (C1.x + C4.x) / 2, py = Math.min(C1.y, C4.y) - 34;
      stage.append(svg('rect', { x: px - 44, y: py - 14, width: 88, height: 28, rx: 8, fill: 'rgba(87,180,135,.10)', stroke: C.green, 'stroke-width': '1.2', 'stroke-dasharray': '4 3' }));
      stage.append(svg('text', { x: px, y: py + 5, 'text-anchor': 'middle', 'font-family': 'ui-monospace, Menlo, monospace', 'font-size': '11', fill: C.green, text: 'the dienophile' }));
      stage.append(svg('line', { x1: C1.x, y1: C1.y - 8, x2: px - 30, y2: py + 12, stroke: C.green, 'stroke-width': '1.2', 'stroke-dasharray': '3 3' }));
      stage.append(svg('line', { x1: C4.x, y1: C4.y - 8, x2: px + 30, y2: py + 12, stroke: C.green, 'stroke-width': '1.2', 'stroke-dasharray': '3 3' }));
    }
    stage.append(dbl(C1, C2, 1));
    stage.append(svg('line', { x1: C2.x, y1: C2.y, x2: C3.x, y2: C3.y, stroke: C.gold, 'stroke-width': '2.6', 'stroke-linecap': 'round' }));
    stage.append(dbl(C3, C4, C4.y <= 120 ? 1 : -1));
    for (const [p, name, gold] of [[C1, 'C1', true], [C2, 'C2', false], [C3, 'C3', false], [C4, 'C4', true]]){
      stage.append(svg('circle', { cx: p.x, cy: p.y, r: gold ? 5 : 3.4, fill: gold ? C.goldhi : C.ink2 }));
      stage.append(svg('text', { x: p.x, y: p.y + (p.y < 120 ? -11 : 18), 'text-anchor': 'middle', 'font-family': 'ui-monospace, Menlo, monospace', 'font-size': '11', fill: C.ink3, text: name }));
    }
    stage.append(svg('text', { x: 190, y: 152, 'text-anchor': 'middle', 'font-family': 'ui-monospace, Menlo, monospace', 'font-size': '10', 'letter-spacing': '.1em', fill: C.gold, text: 'TURN THIS SINGLE BOND' }));
    stage.append(svg('text', { x: 190, y: 196, 'text-anchor': 'middle', 'font-family': 'ui-monospace, Menlo, monospace', 'font-size': '11', fill: C.ink3, text: deg + ' degrees about the C2-C3 bond' }));
    verdict.textContent = close
      ? 's-cis. Both ends point the same way, so they can reach the same partner. This is the only shape that reacts.'
      : far
        ? 's-trans. The two ends point away from each other, so there is nothing for a dienophile to sit in. This shape does no Diels-Alder.'
        : 'Twisted. The four p orbitals are out of plane, so there is no conjugated system to move six electrons through.';
  }
  function drawEx(){
    exHolder.replaceChildren();
    const box = el('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,.02)', border: '1px solid ' + C.line, borderRadius: '10px', padding: '10px 12px' } });
    const sp = speciesSvg(api, ex.smi, 1.4, 220);
    box.append(sp.svg, el('span', { style: { fontFamily: 'Georgia, serif', fontSize: '13px', color: C.ink2, textAlign: 'center' }, text: nameOf(ex.smi) }));
    exHolder.append(box); sp.build();
    exLine.textContent = SCIS_WHY[ex.key];
  }
  draw(); drawEx();
  return { draw };
}

export function mount(slots, api){
  mountStage(slots, api, {
    mechanisms: MECHANISMS,
    fishhook: true,
    eyebrow: 'walk the chain one half arrow at a time, then push the cycloaddition'
    , extra: (host, mech) => ledgerStrip(api, host, mech)
  });
  mountSelectivity(slots.visual, api);
  mountScis(slots.visual, api);
  mountTry(slots, api, { gen: rng => genItem(rng, api), groups: ['radical-reactions', 'diels-alder', 'pericyclic-other'] });
}
