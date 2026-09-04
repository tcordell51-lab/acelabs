// The Tree of Organic, Level 5, Branch 2: Four mechanisms, two shapes.
// SN2, SN1, E2 and E1 pushed arrow by arrow on drawn states, plus the shape
// check: backside attack inverts, a flat cation racemizes. No imports (contract).

export const meta = {
  id: 't5-sn-e',
  level: 5,
  order: 2,
  needs3D: true,
  title: 'Four mechanisms, two shapes',
  concept: 'SN2, SN1, E2 and E1',
  tagline: 'One step or two. Count the steps, then read the center.',
  story: 'There are only four of these, and they come in two shapes. SN2 and E2 are one step: the nucleophile or the base arrives while the leaving group is already walking out, one picture, arrows all at once. SN1 and E1 are two steps: the leaving group goes first, a flat carbocation sits in the middle, and then something attacks it or a proton falls off it. Ask the questions in order and it stops being guesswork. The substrate decides first, and it is not a suggestion: primary never SN1, tertiary never SN2. Then the reagent, then the solvent, then heat. Then the stereo check, which is really the shape check. SN2 comes in from the back, so the center flips. SN1 goes through a flat cation, so both faces get hit and you get both enantiomers. Rule of thumb: count the steps, then read the center.',
  moveName: 'Count the steps, then read the center',
  move: [
    'Cross out the metal. NaOEt is ethoxide, NaOH is hydroxide; sodium never does anything.',
    'Which carbon holds the leaving group? Primary never SN1, tertiary never SN2. Secondary hands the call to the reagent.',
    'Which reagent? Strong nucleophile and weak base means SN2. Strong small base means E2 and the Zaitsev alkene. Weak nucleophile in a protic solvent means SN1, with E1 riding along.',
    'Count the steps. One step for SN2 and E2. Two steps with a carbocation in the middle for SN1 and E1.',
    'Read the center. SN2 flips it, SN1 gives you both enantiomers, E1 and E2 erase it into a pi bond.'
  ],
  trap: 'Careful: SN1 and E1 share the exact same first step, so they always travel together; a tertiary halide in warm water hands you both the alcohol and the alkene, and the real question is which one dominates, never which one happens.',
  holdsUp: ['Williamson ether synthesis', 'Alcohol to halide swaps', 'Zaitsev versus Hofmann', 'Product stereochemistry', 'Energy diagrams'],
  drill: 'Booster OChem: Substitution & Elimination'
};

// Every SMILES this module draws. The (R)-2-bromobutane to (S)-2-butanol pair and the
// 3-bromo-3-methylhexane racemization set are the bank's RDKit-checked structures, the
// same ones t4-subelim draws; the rest are the drawn states of the four mechanisms.
export const SMILES = [
  'CC[C@@H](C)Br', '[OH-]', 'CC[C@H](C)O', '[Br-]',
  'CC(C)(C)Br', 'O', 'C[C+](C)C', 'CC(C)(C)[OH2+]', 'CC(C)(C)O', '[OH3+]',
  'CC(C)Br', 'CC[O-]', 'C=CC', 'CCO', 'C=C(C)C',
  'CCC[C@](C)(Br)CC', 'CCC[C+](C)CC', 'CCC[C@](C)(O)CC', 'CCC[C@@](C)(O)CC',
  'CCCBr', 'CCCO', 'CC(C)I'
];

/* Species: the name, plus the marks the renderer cannot show.
   kind: lp (lone pair), + or - (a charge badge on carbon), H (an explicit hydrogen). */
const SPECIES = {
  'CC[C@@H](C)Br': { name: '(R)-2-bromobutane', marks: [] },
  '[OH-]': { name: 'hydroxide', marks: [{ id: 'lpO', kind: 'lp', at: { t: 'O' } }] },
  'CC[C@H](C)O': { name: '(S)-2-butanol', marks: [] },
  '[Br-]': { name: 'bromide', marks: [{ id: 'lpBr', kind: 'lp', at: { t: 'Br' } }] },
  'CC(C)(C)Br': { name: 'tert-butyl bromide', marks: [] },
  'O': { name: 'water', marks: [{ id: 'lpO', kind: 'lp', at: { t: 'O' } }] },
  'C[C+](C)C': { name: 'the tert-butyl cation', marks: [{ id: 'plus', kind: '+', at: { v: { deg: 3 } } }, { id: 'Hb', kind: 'H', at: { v: { deg: 1, pick: 'right' } } }] },
  'CC(C)(C)[OH2+]': { name: 'the oxonium ion', marks: [] },
  'CC(C)(C)O': { name: 'tert-butanol', marks: [] },
  '[OH3+]': { name: 'hydronium, H3O+', marks: [] },
  'CC(C)Br': { name: '2-bromopropane', marks: [{ id: 'Hb', kind: 'H', at: { v: { deg: 1, pick: 'right' } } }] },
  'CC[O-]': { name: 'ethoxide', marks: [{ id: 'lpO', kind: 'lp', at: { t: 'O' } }] },
  'C=CC': { name: 'propene', marks: [] },
  'CCO': { name: 'ethanol', marks: [] },
  'C=C(C)C': { name: '2-methylpropene', marks: [] },
  'CCC[C@](C)(Br)CC': { name: '(R)-3-bromo-3-methylhexane', marks: [] },
  'CCC[C+](C)CC': { name: 'the flat cation', marks: [{ id: 'plus', kind: '+', at: { v: { deg: 3 } } }] },
  'CCC[C@](C)(O)CC': { name: 'the (R) alcohol', marks: [] },
  'CCC[C@@](C)(O)CC': { name: 'the (S) alcohol', marks: [] },
  'CCCBr': { name: '1-bromopropane', marks: [] },
  'CCCO': { name: '1-propanol', marks: [] },
  'CC(C)I': { name: '2-iodopropane', marks: [] }
};
const nameOf = smi => (SPECIES[smi] && SPECIES[smi].name) || smi;

/* The four mechanisms, drawn state by state. shape and stereo are the two
   things the whole module is about, so every generated item reads them here. */
const MECHANISMS = [
  {
    id: 'sn2', key: 'SN2', chip: 'SN2: (R)-2-bromobutane + NaOH', name: 'SN2 on a secondary carbon',
    shape: 'one', stereo: 'invert', roots: ['l2-arrows', 'l3-wedge', 'l2-carbocation'],
    caseText: '(R)-2-bromobutane with NaOH in DMSO, a strong nucleophile in an aprotic solvent',
    after: 'One step, one picture. Hydroxide came in from the back, bromide left out the front, and the center flipped from R to S.',
    states: [
      { main: 'CC[C@@H](C)Br', with: ['[OH-]'], side: 'left', label: '(R)-2-bromobutane + hydroxide' },
      { main: 'CC[C@H](C)O', with: ['[Br-]'], side: 'right', label: '(S)-2-butanol + bromide' }
    ],
    steps: [{
      name: 'attack and leave', nuc: 'hydroxide', ele: 'the carbon holding the bromine',
      say: 'This is one step, so both arrows move at the same moment. Hydroxide attacks the carbon from the side opposite the bromine, the back side, because that is the only place the empty lobe is pointing. As it arrives, the C-Br electrons leave with the bromine. Nothing ever sits alone in the middle.',
      arrows: [
        { from: { in: 'w0', m: 'lpO' }, to: { v: { deg: 3 } }, bend: 1, fromName: 'the lone pair on hydroxide', toName: 'the carbon holding the bromine', say: 'Attack: the lone pair goes to the carbon, from the back side.' },
        { from: { b: { t: 'Br' } }, to: { t: 'Br' }, bend: 1, fromName: 'the C-Br bond', toName: 'the bromine', say: 'Kick it off: the C-Br electrons leave with the bromine, in the same step.' }
      ]
    }]
  },
  {
    id: 'sn1', key: 'SN1', chip: 'SN1: tert-butyl bromide + H2O', name: 'SN1 on a tertiary carbon',
    shape: 'two', stereo: 'racemize', roots: ['l2-carbocation', 'l3-isomers', 'l2-arrows'],
    caseText: 'tert-butyl bromide warmed in water, a weak nucleophile in a protic solvent',
    after: 'Three steps, and the middle one is the whole story: a flat, empty cation that water can hit from either face.',
    states: [
      { main: 'CC(C)(C)Br', with: ['O'], side: 'left', label: 'tert-butyl bromide + water' },
      { main: 'C[C+](C)C', with: ['[Br-]', 'O'], side: 'left', marks: { 'C[C+](C)C': [{ id: 'plus', kind: '+', at: { v: { deg: 3 } } }] }, label: 'the flat tert-butyl cation + bromide' },
      { main: 'CC(C)(C)[OH2+]', with: ['[Br-]', 'O'], side: 'left', arrives: [1], label: 'the oxonium ion + a second water' },
      { main: 'CC(C)(C)O', with: ['[OH3+]', '[Br-]'], side: 'right', label: 'tert-butanol + hydronium + bromide' }
    ],
    steps: [
      {
        name: 'the bromide leaves', nuc: 'nothing yet', ele: 'the C-Br bond',
        say: 'Step one, and nothing is attacking. The bromide walks out by itself because the carbon it leaves behind is tertiary, and a tertiary cation is the one the neighbors can hold up. This slow step sets the rate, which is why the nucleophile does not appear in the rate law.',
        arrows: [{ from: { b: { t: 'Br' } }, to: { t: 'Br' }, bend: 1, fromName: 'the C-Br bond', toName: 'the bromine', say: 'The C-Br electrons leave with bromide. Now there is an empty p orbital.' }]
      },
      {
        name: 'water attacks', nuc: 'water', ele: 'the carbocation carbon',
        say: 'The cation is sp2 and flat, a peace sign, 120 degrees. Water can come at it from the top face or the bottom face with equal ease. On tert-butyl the two faces give the same molecule, but put the cation on a stereocenter and you get both enantiomers, a 50-50 pair. That is racemization.',
        arrows: [{ from: { in: 'w1', m: 'lpO' }, to: { v: { deg: 3 } }, bend: -1, fromName: 'a lone pair on water', toName: 'the empty carbon', say: 'Water fills the empty orbital. Either face, same ease.' }]
      },
      {
        name: 'lose the proton', nuc: 'a second water', ele: 'a proton on the oxonium oxygen',
        say: 'Water attacked with its own hydrogens still attached, so the oxygen is left holding a plus. Another water takes one proton off and you have the neutral alcohol. Any time a neutral nucleophile attacks, look for this cleanup step.',
        arrows: [
          { from: { in: 'w1', m: 'lpO' }, to: { t: 'O', part: 'H' }, bend: 1, fromName: 'the lone pair on the second water', toName: 'a proton on the oxonium oxygen', say: 'Lone pair to proton.' },
          { from: { t: 'O', part: 'HB' }, to: { t: 'O' }, bend: 1, fromName: 'the O-H bond of the oxonium', toName: 'the oxygen', say: 'The O-H electrons fall back on oxygen: a neutral alcohol.' }
        ]
      }
    ]
  },
  {
    id: 'e2', key: 'E2', chip: 'E2: 2-bromopropane + NaOEt', name: 'E2 on a secondary carbon',
    shape: 'one', stereo: 'erase', roots: ['l3-newman', 'l2-acidity', 'l2-arrows'],
    caseText: '2-bromopropane with NaOEt in ethanol, a strong small base',
    after: 'One step, three arrows, and the stereocenter is gone: it is part of the new pi bond now.',
    states: [
      { main: 'CC(C)Br', with: ['CC[O-]'], side: 'right', label: '2-bromopropane + ethoxide' },
      { main: 'C=CC', with: ['CCO', '[Br-]'], side: 'right', label: 'propene + ethanol + bromide' }
    ],
    steps: [{
      name: 'take the beta H', nuc: 'ethoxide', ele: 'a hydrogen on the carbon next door',
      say: 'Ethoxide is a strong small base, so it does not go for the crowded carbon, it goes for a hydrogen next door. Three arrows in one step: the base takes the beta hydrogen, those C-H electrons swing in to make the pi bond, and the C-Br electrons leave with bromide. For all of that to happen at once the H and the Br have to be anti-periplanar, 180 degrees apart in a Newman.',
      arrows: [
        { from: { in: 'w0', m: 'lpO' }, to: { m: 'Hb' }, bend: -1, fromName: 'the lone pair on ethoxide', toName: 'the beta hydrogen', say: 'Lone pair to proton, one carbon over from the bromine.' },
        { from: { mb: 'Hb' }, to: { b: [{ v: { deg: 1, pick: 'right' } }, { v: { deg: 3 } }] }, bend: -1, fromName: 'the beta C-H bond', toName: 'the bond between the two carbons', say: 'Those C-H electrons become the new pi bond.' },
        { from: { b: { t: 'Br' } }, to: { t: 'Br' }, bend: 1, fromName: 'the C-Br bond', toName: 'the bromine', say: 'And the bromide leaves in the same breath. Anti-periplanar is what makes that possible.' }
      ]
    }]
  },
  {
    id: 'e1', key: 'E1', chip: 'E1: tert-butyl bromide + heat', name: 'E1 on a tertiary carbon',
    shape: 'two', stereo: 'erase', roots: ['l2-carbocation', 'l3-newman'],
    caseText: 'tert-butyl bromide in warm ethanol, heated hard, taking the alkene product',
    after: 'Same first step as SN1, different second step. That is why heat is the dial: it pushes the cation toward losing a proton instead of catching a nucleophile.',
    states: [
      { main: 'CC(C)(C)Br', with: ['O'], side: 'left', label: 'tert-butyl bromide, warm' },
      { main: 'C[C+](C)C', with: ['[Br-]', 'O'], side: 'left', label: 'the same flat cation' },
      { main: 'C=C(C)C', with: ['[Br-]', '[OH3+]'], side: 'right', label: '2-methylpropene + hydronium' }
    ],
    steps: [
      {
        name: 'the bromide leaves', nuc: 'nothing yet', ele: 'the C-Br bond',
        say: 'Identical to SN1 step one. The bromide leaves by itself and you get the tertiary cation. Up to here the two mechanisms are the same reaction, which is exactly why they always show up together.',
        arrows: [{ from: { b: { t: 'Br' } }, to: { t: 'Br' }, bend: 1, fromName: 'the C-Br bond', toName: 'the bromine', say: 'The C-Br electrons leave with bromide.' }]
      },
      {
        name: 'lose a beta proton', nuc: 'water, acting as a weak base', ele: 'a hydrogen next to the plus',
        say: 'Now a weak base, the solvent, takes a hydrogen from a carbon next to the plus, and those C-H electrons drop into the empty orbital as a pi bond. On tert-butyl every beta hydrogen is the same, so there is one alkene. On a substrate with a choice, the more substituted alkene wins: Zaitsev.',
        arrows: [
          { from: { in: 'w1', m: 'lpO' }, to: { m: 'Hb' }, bend: -1, fromName: 'a lone pair on water', toName: 'a beta hydrogen', say: 'Lone pair to proton, one carbon over from the plus.' },
          { from: { mb: 'Hb' }, to: { b: [{ v: { deg: 1, pick: 'right' } }, { v: { deg: 3 } }] }, bend: -1, fromName: 'the beta C-H bond', toName: 'the bond between that carbon and the cation carbon', say: 'The C-H electrons fill the empty orbital: that is the new pi bond.' }
        ]
      }
    ]
  }
];

// The racemization panel: one step and inverted, next to two steps and both faces.
const SHAPE_PANELS = [
  {
    id: 'sn2', chip: 'SN2: one step, flipped', title: 'SN2 flips the center',
    rows: [{ smi: 'CC[C@@H](C)Br', cap: '(R)-2-bromobutane' }, { arrow: 'NaOH, DMSO' }, { smi: 'CC[C@H](C)O', cap: '(S)-2-butanol, the only product' }],
    line: 'The nucleophile can only come in from the side opposite the leaving group, so the other three groups get pushed through like an umbrella in the wind. One product, one configuration, flipped. If the starting material was R here, the product is S.'
  },
  {
    id: 'sn1', chip: 'SN1: two steps, both faces', title: 'SN1 gives you both',
    rows: [{ smi: 'CCC[C@](C)(Br)CC', cap: '(R)-3-bromo-3-methylhexane' }, { arrow: 'H2O, heat' }, { smi: 'CCC[C+](C)CC', cap: 'the flat cation, sp2, 120 degrees' }, { arrow: 'water, either face' }, { smi: 'CCC[C@](C)(O)CC', cap: 'the (R) alcohol' }, { smi: 'CCC[C@@](C)(O)CC', cap: 'the (S) alcohol' }],
    line: 'The cation in the middle is flat, so water hits the top face and the bottom face at the same rate. You get a 50-50 pair of enantiomers, which is what racemic means. Any time you see a flat carbocation on a stereocenter, stop looking for one answer.'
  }
];

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
function allMains(){ const s = new Set(); for (const M of MECHANISMS) for (const st of M.states) if (!Array.isArray(st.main)) s.add(st.main); return [...s]; }

/* ------------------------------------------------------------------ */
/* The case list, read straight off the verified reaction table.        */
/* Only reactions whose mech field IS one of the four get through.      */
/* ------------------------------------------------------------------ */
const CLASS_RULE = {
  halide_primary: 'a primary carbon, and primary never runs SN1',
  halide_secondary: 'a secondary carbon, so the reagent makes the call',
  halide_tertiary: 'a tertiary carbon, and tertiary never runs SN2',
  halide_tertiary_b: 'a tertiary carbon, and tertiary never runs SN2',
  alcohol_secondary: 'a secondary alcohol, so nothing leaves until the OH is protonated',
  alcohol_tertiary: 'a tertiary alcohol, which ionizes as soon as it is protonated'
};
function label(r){ return r.cond ? r.reagent + (/^\d\./.test(r.reagent) ? '; ' : ', ') + r.cond : r.reagent; }
export function cases(api){
  const R = api && api.reactions ? api.reactions.REACTIONS : null;
  if (!R) return [];
  return R.filter(r => /^(SN1|SN2|E1|E2)$/.test(r.mech || '') && CLASS_RULE[r.subClass]).map(r => ({
    key: r.mech,
    text: (api.reactions.SUBSTRATES[r.subClass] || { name: 'the substrate' }).name + ' with ' + label(r),
    subName: (api.reactions.SUBSTRATES[r.subClass] || { name: 'the substrate' }).name,
    sub: r.sub, subClass: r.subClass, reagent: label(r), rid: r.id,
    why: 'Carbon first: ' + (api.reactions.SUBSTRATES[r.subClass] || { name: 'it' }).name + ' is ' + CLASS_RULE[r.subClass] + '. Then the reagent: ' + label(r) + '. That is ' + r.mech + '. ' + r.thomas,
    roots: r.roots && r.roots.length ? r.roots : ['l2-carbocation', 'l2-arrows']
  }));
}
function mechCases(api){
  return MECHANISMS.map(M => ({ key: M.key, text: M.caseText, subName: nameOf(Array.isArray(M.states[0].main) ? M.states[0].main[0] : M.states[0].main), sub: Array.isArray(M.states[0].main) ? M.states[0].main[0] : M.states[0].main, subClass: null, reagent: null, rid: M.id, M,
    why: 'Count the steps and read the reagent. ' + M.caseText + ' is ' + M.key + ': ' + (M.shape === 'one' ? 'one step, nothing sits alone in the middle' : 'two steps, with a flat carbocation in the middle') + '.', roots: M.roots })).concat(cases(api));
}

const SHAPE_CHOICES = [
  { key: 'one', text: 'One step. Everything happens at the same moment.' },
  { key: 'two', text: 'Two steps, with a carbocation sitting in the middle.' },
  { key: 'carbanion', text: 'Two steps, with a carbanion sitting in the middle.' },
  { key: 'three', text: 'Three steps, with two different intermediates.' }
];
const STEREO_CHOICES = [
  { key: 'invert', text: 'It flips. The nucleophile comes in from the back side, so the configuration inverts.' },
  { key: 'racemize', text: 'You get both. The cation is flat, so both faces get attacked and the product is a 50-50 pair.' },
  { key: 'erase', text: 'It is gone. That carbon is part of the new double bond now.' },
  { key: 'retain', text: 'It keeps its configuration. The nucleophile comes in on the same face the leaving group left from.' }
];
const MECH_KEYS = ['SN1', 'SN2', 'E1', 'E2'];
const SHAPE_OF = { SN1: 'two', SN2: 'one', E1: 'two', E2: 'one' };
const STEREO_OF = { SN1: 'racemize', SN2: 'invert', E1: 'erase', E2: 'erase' };
const KEY_TEXT = {
  SN1: 'SN1: two steps through a carbocation, rate depends only on the substrate',
  SN2: 'SN2: one step, backside attack, rate depends on both partners',
  E1: 'E1: two steps through a carbocation, then a proton falls off',
  E2: 'E2: one step, the base takes a beta H as the leaving group goes'
};

/* ------------------------------------------------------------------ */
/* Item generators. Every answer is computed from the tables above.     */
/* ------------------------------------------------------------------ */
const KINDS = ['next', 'start', 'steps', 'stereo', 'which'];
const WRONG_STARTS = ['the positive charge on the carbocation', 'the leaving group atom itself', 'the carbon skeleton'];
function stepOf(rng, filter){
  const pool = [];
  for (const M of MECHANISMS) for (let i = 0; i < M.steps.length; i++) if (!filter || filter(M, i)) pool.push({ M, i });
  const p = pool[Math.floor(rng() * pool.length)];
  return { M: p.M, i: p.i, step: p.M.steps[p.i], state: p.M.states[p.i], nextState: p.M.states[p.i + 1] };
}
export function genItem(rng, api, kind){
  kind = kind || KINDS[Math.floor(rng() * KINDS.length)];
  if (kind === 'next'){
    const pick = stepOf(rng);
    const ans = pick.nextState.main, h = heavy(ans);
    const others = allMains().filter(s => s !== ans && s !== pick.state.main);
    const same = others.filter(s => heavy(s) === h), rest = others.filter(s => heavy(s) !== h);
    let d = pickN(rng, same, 3, []); if (d.length < 3) d = d.concat(pickN(rng, rest, 3 - d.length, d));
    const choices = shuffled(rng, [ans].concat(d));
    return { kind, drawn: true, M: pick.M, i: pick.i, stem: 'Here is ' + pick.state.label + '. The step is: ' + pick.step.name + '. Which species comes next?',
      choices: choices.map(s => ({ text: nameOf(s), smiles: s })), correct: choices.indexOf(ans),
      coach: 'Push the arrows on the drawing: ' + pick.step.arrows.map(a => a.fromName + ' to ' + a.toName).join(', then ') + '. That gives ' + nameOf(ans) + '.', roots: pick.M.roots };
  }
  if (kind === 'start'){
    const pick = stepOf(rng), ar = pick.step.arrows[0];
    const otherFrom = []; for (const M of MECHANISMS) for (const s of M.steps) for (const a of s.arrows) if (a.fromName !== ar.fromName && !otherFrom.includes(a.fromName)) otherFrom.push(a.fromName);
    const d = pickN(rng, WRONG_STARTS.concat(otherFrom), 3, [ar.fromName]);
    const choices = shuffled(rng, [ar.fromName].concat(d));
    return { kind, tap: true, M: pick.M, i: pick.i, arrow: 0, stem: 'Here is ' + pick.state.label + '. Where does the FIRST arrow of this step (' + pick.step.name + ') start?',
      choices: choices.map(t => ({ text: t, smiles: null })), correct: choices.indexOf(ar.fromName),
      coach: 'Arrows start at electrons, never at an atom and never at a plus. Here they start at ' + ar.fromName + ' and land on ' + ar.toName + '.', roots: pick.M.roots };
  }
  if (kind === 'steps'){
    const pool = mechCases(api), c = pool[Math.floor(rng() * pool.length)];
    const ans = SHAPE_OF[c.key];
    const choices = shuffled(rng, SHAPE_CHOICES.slice());
    return { kind, M: c.M || null, i: 0, stem: 'One step or two: ' + c.text + '?',
      choices: choices.map(x => ({ text: x.text, smiles: null })), correct: choices.findIndex(x => x.key === ans),
      coach: 'That is ' + c.key + '. ' + (ans === 'one' ? 'SN2 and E2 are one step: the partner arrives while the leaving group is going, so nothing ever sits alone in the middle.' : 'SN1 and E1 are two steps: the leaving group goes first and a flat carbocation waits in the middle.') + ' ' + c.why, roots: c.roots };
  }
  if (kind === 'stereo'){
    const pool = mechCases(api).filter(c => c.subClass !== 'halide_primary'), c = pool[Math.floor(rng() * pool.length)];
    const ans = STEREO_OF[c.key];
    const choices = shuffled(rng, STEREO_CHOICES.slice());
    return { kind, M: c.M || null, i: 0, stem: 'Take ' + c.text + ', and say the carbon carrying the leaving group is a stereocenter. What happens to that center?',
      choices: choices.map(x => ({ text: x.text, smiles: null })), correct: choices.findIndex(x => x.key === ans),
      coach: 'That is ' + c.key + ', so read its shape. ' + (ans === 'invert' ? 'One step, backside attack, so the center flips.' : ans === 'racemize' ? 'Two steps through a flat cation, so both faces get hit and you get a 50-50 pair.' : 'Elimination puts that carbon in a double bond, so the center is not a center any more.'), roots: c.roots };
  }
  const pool = mechCases(api), c = pool[Math.floor(rng() * pool.length)];
  const choices = shuffled(rng, MECH_KEYS.slice());
  return { kind: 'which', M: c.M || null, i: 0, stem: 'Which mechanism runs here: ' + c.text + '?',
    choices: choices.map(k => ({ text: KEY_TEXT[k], smiles: null })), correct: choices.indexOf(c.key),
    coach: c.why, roots: c.roots };
}

export function makeItem(api){
  const it = genItem(api.rng, api);
  const st = it.M ? it.M.states[it.i] : null;
  return { stem: it.stem, sub: st ? st.main : null, reagent: st ? (st.with || []).map(nameOf).join(' + ') || null : null, prod: null,
    choices: it.choices, correct: it.correct, coach: it.coach, home: meta.id, roots: it.roots && it.roots.length ? it.roots : ['l2-carbocation', 'l2-arrows'] };
}

export function selfTest(deps){
  const rng = mulberry(41);
  const api = { rng, pick: a => a[Math.floor(rng() * a.length)], shuffle: a => shuffled(rng, a), reactions: deps && deps.reactions, bank: deps && deps.bank };
  const bad = m => ({ ok: false, tried: 0, notes: m });
  // every drawn SMILES is listed, named and well formed
  for (const s of SMILES) if (!balanced(s)) return bad('unbalanced SMILES in the list: ' + s);
  for (const s of SMILES) if (!SPECIES[s]) return bad(s + ' missing from SPECIES');
  for (const P of SHAPE_PANELS) for (const r of P.rows) if (r.smi && !SMILES.includes(r.smi)) return bad('panel SMILES not listed: ' + r.smi);
  // mechanism invariants: states minus one steps, atoms and charge conserved, arrows start at electrons
  for (const M of MECHANISMS){
    if (M.steps.length !== M.states.length - 1) return bad(M.id + ': steps must be states minus one');
    if (!SHAPE_OF[M.key] || SHAPE_OF[M.key] !== M.shape) return bad(M.id + ': shape disagrees with its key');
    if (STEREO_OF[M.key] !== M.stereo) return bad(M.id + ': stereo disagrees with its key');
    for (const st of M.states) for (const s of stateSmiles(st)){ if (!SMILES.includes(s)) return bad(M.id + ': ' + s + ' missing from SMILES'); if (!balanced(s)) return bad(s + ' unbalanced'); }
    for (let i = 0; i < M.steps.length; i++){
      const a = M.states[i], b = M.states[i + 1];
      const hv = st => stateSmiles(st).reduce((n, s) => n + heavy(s), 0);
      const qv = st => stateSmiles(st).reduce((n, s) => n + charge(s), 0);
      const arr = (b.arrives || []).reduce((n, j) => n + heavy(b.with[j]), 0);
      const arrQ = (b.arrives || []).reduce((n, j) => n + charge(b.with[j]), 0);
      if (hv(a) + arr !== hv(b)) return bad(M.id + ' step ' + i + ': heavy atoms not conserved (' + hv(a) + ' plus ' + arr + ' to ' + hv(b) + ')');
      if (qv(a) + arrQ !== qv(b)) return bad(M.id + ' step ' + i + ': charge not conserved');
      const step = M.steps[i];
      if (!step.arrows.length || !step.nuc || !step.ele || !step.say) return bad(M.id + ' step ' + i + ': incomplete');
      for (const ar of step.arrows){
        const f = ar.from;
        const electrons = f.m != null || f.mb != null || f.b != null || (f.t && f.part === 'HB');
        if (!electrons) return bad(M.id + ' step ' + i + ': an arrow starts at an atom, not at electrons');
        if (!ar.fromName || !ar.toName) return bad(M.id + ': every arrow needs names');
      }
    }
  }
  // the case list actually reaches all four mechanisms
  const keys = new Set(mechCases(api).map(c => c.key));
  for (const k of MECH_KEYS) if (!keys.has(k)) return bad('no case generates ' + k);
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
  // every kind builds, and the computed answers agree with the tables
  for (const k of KINDS){ const it = genItem(mulberry(5), api, k); if (!it || it.correct < 0) return { ok: false, tried, notes: k + ' failed to build' }; seen[k] = 1; }
  for (let n = 0; n < 200; n++){
    const it = genItem(rng, api, 'steps');
    if (!/One step|Two steps, with a carbocation/.test(it.choices[it.correct].text)) return { ok: false, tried, notes: 'shape answer is not one of the two real shapes' };
    const st = genItem(rng, api, 'stereo');
    const retain = STEREO_CHOICES.find(x => x.key === 'retain').text;
    if (st.choices[st.correct].text === retain) return { ok: false, tried, notes: 'retention is never the answer' };
    const w = genItem(rng, api, 'which');
    if (!MECH_KEYS.some(k => w.choices[w.correct].text.startsWith(k))) return { ok: false, tried, notes: 'mechanism answer is not one of the four' };
  }
  const a = genItem(mulberry(9), api), b = genItem(mulberry(9), api);
  if (JSON.stringify(a) !== JSON.stringify(b)) return { ok: false, tried, notes: 'not reproducible' };
  return { ok: true, tried, notes: MECHANISMS.length + ' mechanisms, ' + Object.keys(seen).length + ' item kinds, ' + mechCases(api).length + ' cases' };
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
/* The shape check: one step and flipped, next to two steps and both.   */
/* ------------------------------------------------------------------ */
function mountShapePanel(container, api){
  const { el, svg } = api, C = api.colors;
  let panel = SHAPE_PANELS[0];
  const holder = el('div', { style: { marginTop: '18px', paddingTop: '14px', borderTop: '1px solid ' + C.line } });
  holder.append(el('span', { class: 'eyebrow', text: 'The shape check: what happens to the center' }));
  const head = el('p', { style: { fontFamily: 'Georgia, serif', fontSize: '19px', color: C.goldhi, margin: '6px 0 4px' } });
  const strip = el('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', justifyContent: 'center', margin: '6px 0 0' } });
  const line = el('p', { style: { margin: '10px 0 0', color: C.ink2, fontSize: '15px', maxWidth: '70ch' } });
  const chips = el('div', { class: 'controls', role: 'group', 'aria-label': 'Pick a shape' });
  const chipEls = SHAPE_PANELS.map(P => el('button', { class: 'chip', type: 'button', 'aria-pressed': P === panel ? 'true' : 'false', text: P.chip,
    onClick: () => { panel = P; chipEls.forEach((c, i) => c.setAttribute('aria-pressed', SHAPE_PANELS[i] === P ? 'true' : 'false')); draw(); } }));
  chips.append(...chipEls);
  holder.append(head, strip, chips, line);
  container.append(holder);
  function draw(){
    strip.replaceChildren();
    head.textContent = panel.title;
    const builds = [];
    for (const r of panel.rows){
      if (r.arrow){
        strip.append(el('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', minWidth: '96px', fontFamily: 'ui-monospace, Menlo, monospace', fontSize: '11px', color: C.goldhi } },
          el('span', { text: r.arrow }),
          (() => { const s = svg('svg', { viewBox: '0 0 80 12', style: { width: '80px', height: '12px', display: 'block' } });
            s.append(svg('line', { x1: 2, y1: 6, x2: 66, y2: 6, stroke: C.gold, 'stroke-width': '1.6' }), svg('path', { d: 'M64 1.5 L74 6 L64 10.5 z', fill: C.gold })); return s; })()));
        continue;
      }
      const cell = el('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,.02)', border: '1px solid ' + C.line, borderRadius: '10px', padding: '8px 10px' } });
      const sp = speciesSvg(api, r.smi, 1.3, 210);
      cell.append(sp.svg, el('span', { style: { fontFamily: 'Georgia, serif', fontSize: '13px', color: C.ink2, textAlign: 'center' }, text: r.cap }));
      strip.append(cell); builds.push(sp);
    }
    for (const b of builds) b.build();
    line.textContent = panel.line;
  }
  draw();
  return { draw };
}

/* The two shapes, read off the mechanism the student is standing in. */
function shapeBadges(api, host, mech){
  const { el } = api, C = api.colors;
  const badge = (text, color) => el('span', { style: { fontFamily: 'ui-monospace, Menlo, monospace', fontSize: '11px', letterSpacing: '.06em', textTransform: 'uppercase', padding: '5px 10px', borderRadius: '999px', border: '1px solid ' + color, color }, text });
  const shapeText = mech.shape === 'one' ? 'one step: nothing sits in the middle' : 'two steps: a flat carbocation in the middle';
  const stereoText = mech.stereo === 'invert' ? 'the center flips' : mech.stereo === 'racemize' ? 'the center racemizes: both enantiomers' : 'the center is erased into a pi bond';
  host.append(el('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' } },
    badge(mech.key, C.goldhi),
    badge(shapeText, mech.shape === 'one' ? C.green : C.amber),
    badge(stereoText, mech.stereo === 'invert' ? C.blue : mech.stereo === 'racemize' ? C.coral : C.grey)));
}


/* ------------------------------------------------------------------ */
/* The 3D model: what a flat drawing cannot show                        */
/*                                                                     */
/* Two things on this page are geometry, not bookkeeping, and a page    */
/* quietly lies about both. SN2 turns the center inside out like an     */
/* umbrella, and E2 only fires when the hydrogen and the leaving group  */
/* are anti-periplanar. Build them and let the student turn them.       */
/* ------------------------------------------------------------------ */
const M3D = {
  sn2: {
    chip: 'SN2: the umbrella turns inside out',
    title: 'Backside attack, and the center turns inside out',
    line: 'The nucleophile can only reach the lobe on the far side of the leaving group, so it arrives opposite the bromine. As the new bond forms the other three groups sweep past flat and keep going, exactly like an umbrella in the wind. That is why one product comes out and the center is flipped.',
    tag: 'ONE STEP, ONE PRODUCT, FLIPPED'
  },
  e2: {
    chip: 'E2: anti-periplanar or nothing',
    title: 'The hydrogen has to be opposite the leaving group',
    line: 'Look straight down the bond between the two carbons. The base can only take a hydrogen that sits opposite the bromine, because the C to H bond and the C to Br bond have to line up to become the new pi bond. Turn the front carbon and watch the reaction switch on and off.',
    tag: 'TURN IT UNTIL IT LINES UP'
  }
};

function mount3D(container, api){
  const { el } = api, C = api.colors, G = api.geom;
  const holder = el('div', { style: { marginTop: '18px', paddingTop: '14px', borderTop: '1px solid ' + C.line } });
  holder.append(el('span', { class: 'eyebrow', text: 'Turn it yourself: the part a flat drawing cannot show' }));
  const S = api.stage3d({ label: 'A three dimensional model of the reacting molecule. Drag to turn it.' });
  const cap = el('div', { class: 's3d-cap' }); const capName = el('b'); const capTag = el('span', { class: 'tag' });
  cap.append(capName, capTag); S.stage.append(cap);
  S.stage.append(el('div', { class: 's3d-hint', text: 'DRAG TO TURN' }));
  // The same reaction as the test prints it, so the model is never a separate
  // world: a student reads left, then right, and the two are the same molecule.
  const paper = el('div', { class: 's3d-paper' });
  const paperRow = el('div', { class: 'row' });
  const paperCap = el('div', { class: 'cap' });
  paper.append(el('span', { class: 'head', text: 'On the test it looks like this' }), paperRow, paperCap);
  const pair = el('div', { class: 's3d-pair' }, paper, S.stage);
  const line = el('p', { style: { margin: '10px 0 0', color: C.ink2, fontSize: '15px', maxWidth: '70ch', lineHeight: '1.55' } });
  const controls = el('div', { class: 'controls' });
  holder.append(pair, controls, line);

  // what the printed version of each mechanism looks like
  const PAPER = {
    sn2: { sub: 'CC[C@@H](C)Br', reagent: 'NaOH', cond: 'DMSO', prod: 'CC[C@H](C)O',
      cap: 'Flat on the page you get a wedge and a dash and you are expected to know the center flipped. ' },
    e2: { sub: 'CC(C)Br', reagent: 'NaOEt', cond: 'EtOH, heat', prod: 'C=CC',
      cap: 'The page shows no geometry at all. You are expected to know the hydrogen had to be anti to the bromine. ' }
  };
  function drawPaper(k){
    paperRow.replaceChildren(); paperCap.replaceChildren();
    const P = PAPER[k];
    const a = el('div', { style: { width: '116px', flex: '0 0 auto' } }); api.drawSmiles(a, P.sub, { width: 116, height: 88, label: 'starting material' });
    const b = el('div', { style: { width: '116px', flex: '0 0 auto' } }); api.drawSmiles(b, P.prod, { width: 116, height: 88, label: 'product' });
    paperRow.append(a, el('div', { class: 'arrow' }, el('span', { class: 'reagent', text: P.reagent }), el('div', { class: 'line' }), el('span', { class: 'reagent', text: P.cond })), b);
    paperCap.append(P.cap, el('b', { text: 'The model on the right is that same reaction, turned.' }));
  }
  container.append(holder);
  if (!S.ok){ line.textContent = M3D.sn2.line; return; }

  let which = 'sn2', t = 0, playing = null;
  const V = a => new api.THREE.Vector3(a[0], a[1], a[2]);
  const labelFor = (text, cls) => el('div', { class: 's3d-lab' + (cls ? ' ' + cls : ''), text });

  /* ---- SN2: one carbon, three spectator groups, Br leaving, OH arriving ---- */
  function buildSN2(){
    S.clear(); S.clearLabels();
    const axis = [0, 0, 1];                       // Br sits at +z, hydroxide comes from -z
    const spokes = G.tetraAround(axis, Math.PI / 2);  // the three groups, umbrella open toward -z
    const C0 = V([0, 0, 0]);
    const carbon = S.atom('C', C0);
    const brStart = 1.94, nuStart = 3.2;
    S.camera.position.set(0, 0.2, 9.8); S.camera.lookAt(0, 0, 0);
    S.spin.position.set(0.63, 0, 0);         // centre the Br-to-nucleophile span on screen
    const br = S.atom('Br', V([0, 0, brStart]));
    const nu = S.atom('O', V([0, 0, -nuStart]));
    const nuH = S.atom('H', V([0.55, 0.55, -nuStart - 0.5]));
    S.bond(nu.position, nuH.position, 0.06);
    const spokeAtoms = spokes.map((d, i) => S.atom(i === 0 ? 'C' : 'H', V(G.mul(d, i === 0 ? 1.54 : 1.09))));
    const spokeBonds = spokeAtoms.map(a => S.bond(C0, a.position, 0.075));
    const brBond = S.bond(C0, br.position, 0.085);
    const nuBond = S.ghostBond(C0, nu.position, 0x8fb4ff);
    S.addLabel(labelFor('Br', 'gold'), v => br.getWorldPosition(v), { radial: 30 });
    S.addLabel(labelFor('HO', 'blue'), v => nu.getWorldPosition(v), { radial: 30 });
    capName.textContent = 'A secondary carbon, hydroxide coming from the far side';
    capTag.textContent = M3D.sn2.tag;

    // t from 0 (start) to 1 (product): the umbrella sweeps through flat and inverts
    S.setT = k => {
      const inv = k;                                  // 0 = original pyramid, 1 = inverted
      for (let i = 0; i < 3; i++){
        // rotate each spoke from its start direction toward the mirrored direction
        const d0 = spokes[i], d1 = [d0[0], d0[1], -d0[2]];
        const d = G.unit([d0[0] * (1 - inv) + d1[0] * inv, d0[1] * (1 - inv) + d1[1] * inv, d0[2] * (1 - inv) + d1[2] * inv]);
        const len = i === 0 ? 1.54 : 1.09;
        spokeAtoms[i].position.set(d[0] * len, d[1] * len, d[2] * len);
        S.place(spokeBonds[i], C0, spokeAtoms[i].position, 0.075);
      }
      br.position.set(0, 0, brStart + k * 2.2);
      nu.position.set(0, 0, -(nuStart - k * (nuStart - 1.43)));
      nuH.position.set(0.55, 0.55, nu.position.z - 0.5);
      brBond.visible = k < 0.75;
      if (brBond.visible) S.place(brBond, C0, br.position, 0.085 * (1 - k));
      nuBond.visible = true;
      S.clear(nuBond);
      const g = S.ghostBond(C0, nu.position, k > 0.6 ? 0xb9a878 : 0x8fb4ff, nuBond);
      S.needs = true;
    };
    S.setT(0);
  }

  /* ---- E2: two carbons, look down the bond, turn the front one ---- */
  function buildE2(){
    S.clear(); S.clearLabels();
    S.camera.position.set(0, 0.2, 8.4); S.camera.lookAt(0, 0, 0); S.spin.position.set(0, 0, 0);
    const half = 0.77;
    const CB = V([0, 0, half]);     // the front carbon, carries the hydrogens
    const CA = V([0, 0, -half]);    // the back carbon, carries the bromine
    const cb = S.atom('C', CB), ca = S.atom('C', CA);
    S.bond(CA, CB, 0.09);
    const backDirs = G.tetraAround([0, 0, -1], Math.PI / 2);   // on CA, pointing away from CB
    const br = S.atom('Br', V(G.add([0, 0, -half], G.mul(backDirs[0], 1.94))));
    S.bond(CA, br.position, 0.085);
    const caH = [1, 2].map(i => { const a = S.atom('H', V(G.add([0, 0, -half], G.mul(backDirs[i], 1.09)))); S.bond(CA, a.position, 0.065); return a; });
    const frontBase = G.tetraAround([0, 0, 1], 0);
    const cbAtoms = [0, 1, 2].map(i => S.atom(i === 0 ? 'H' : 'C', V([0, 0, 0])));
    const cbBonds = cbAtoms.map(a => S.bond(CB, CB, 0.065));
    const baseO = S.atom('O', V([0, 3.2, 2.2]));
    const baseH = S.atom('H', V([0.5, 3.7, 2.5]));
    S.bond(baseO.position, baseH.position, 0.06);
    S.addLabel(labelFor('Br', 'gold'), v => br.getWorldPosition(v), { radial: 30 });
    S.addLabel(labelFor('EtO', 'blue'), v => baseO.getWorldPosition(v), { radial: 30 });
    const hLab = labelFor('H', 'small');
    S.addLabel(hLab, v => cbAtoms[0].getWorldPosition(v), { radial: 24 });
    capTag.textContent = M3D.e2.tag;

    // dihedral: the angle of the front carbon's H measured from the Br
    S.setT = k => {
      const ang = k * Math.PI * 2;
      const dirs = G.tetraAround([0, 0, 1], ang);
      for (let i = 0; i < 3; i++){
        const len = i === 0 ? 1.09 : 1.54;
        const p = G.add([0, 0, half], G.mul(dirs[i], len));
        cbAtoms[i].position.set(p[0], p[1], p[2]);
        S.place(cbBonds[i], CB, cbAtoms[i].position, i === 0 ? 0.065 : 0.075);
      }
      // the dihedral between the front H and the back Br, in degrees
      const hv = G.unit([cbAtoms[0].position.x, cbAtoms[0].position.y, 0]);
      const bv = G.unit([br.position.x, br.position.y, 0]);
      let deg = Math.acos(Math.max(-1, Math.min(1, G.dot ? G.dot(hv, bv) : hv[0] * bv[0] + hv[1] * bv[1]))) * 180 / Math.PI;
      if (!isFinite(deg)) deg = 0;
      const anti = deg > 155;
      // the base moves in over the H when it is lined up
      const hp = cbAtoms[0].position;
      baseO.position.set(hp.x * 2.1, hp.y * 2.1 + 0.4, hp.z + 1.3);
      baseH.position.set(baseO.position.x + 0.5, baseO.position.y + 0.5, baseO.position.z + 0.3);
      capName.textContent = anti ? 'Anti-periplanar: 180 degrees. This one reacts.' : Math.round(deg) + ' degrees apart. Not lined up, nothing happens.';
      capTag.textContent = anti ? 'E2 CAN FIRE' : 'KEEP TURNING';
      capTag.style.background = anti ? '' : 'rgba(255,255,255,.08)';
      capTag.style.color = anti ? '' : C.ink2;
      hLab.className = 's3d-lab small' + (anti ? ' gold' : '');
      S.needs = true;
    };
    S.setT(0.5);
  }

  function build(){
    if (playing){ clearInterval(playing); playing = null; }
    if (which === 'sn2'){
      buildSN2(); t = 0;
      // side on: the attack line runs across the screen so the bromine leaving,
      // the three spokes and the nucleophile arriving are all visible at once
      S.spin.quaternion.setFromAxisAngle(new api.THREE.Vector3(0, 1, 0), Math.PI / 2);
      S.needs = true;
    }
    else { buildE2(); t = 0.5; S.focus(V([0, 0, 1]), false, 0); }
    line.textContent = M3D[which].line;
    drawPaper(which);
    if (which === 'sn2'){ capName.textContent = 'A secondary carbon, hydroxide coming from the far side'; }
    rebuild();
  }

  function rebuild(){
    controls.replaceChildren();
    for (const k of ['sn2', 'e2']){
      controls.append(el('button', { type: 'button', class: 'chip' + (which === k ? ' on' : ''), 'aria-pressed': String(which === k), text: M3D[k].chip,
        onClick: () => { which = k; build(); } }));
    }
    if (which === 'sn2'){
      controls.append(el('button', { type: 'button', class: 'primary', text: 'Push it through', onClick: () => {
        S.tween(1800, k => { S.setT(k); }, () => { capName.textContent = 'The center is flipped, and there is only one product.'; });
      } }));
      controls.append(el('button', { type: 'button', class: 'secondary', text: 'Reset', onClick: () => { S.setT(0); S.spin.quaternion.setFromAxisAngle(new api.THREE.Vector3(0, 1, 0), Math.PI / 2); S.needs = true; capName.textContent = 'A secondary carbon, hydroxide coming from the far side'; } }));
      controls.append(el('button', { type: 'button', class: 'secondary', text: 'Look down the attack line', onClick: () => S.focus(V([0, 0, -1]), false) }));
      controls.append(el('button', { type: 'button', class: 'secondary', text: 'Side on', onClick: () => { const from = S.spin.quaternion.clone(), to = new api.THREE.Quaternion().setFromAxisAngle(new api.THREE.Vector3(0, 1, 0), Math.PI / 2); S.tween(700, k => { S.spin.quaternion.slerpQuaternions(from, to, k); S.needs = true; }); } }));
    } else {
      const slider = el('input', { type: 'range', min: '0', max: '360', step: '1', value: String(Math.round(t * 360)), 'aria-label': 'Turn the front carbon' });
      slider.addEventListener('input', () => { t = (+slider.value) / 360; S.setT(t); });
      controls.append(el('label', { class: 'slider' }, 'Turn the front carbon ', slider));
      controls.append(el('button', { type: 'button', class: 'primary', text: 'Snap to anti-periplanar', onClick: () => { t = 0.5; slider.value = '180'; S.setT(0.5); } }));
      controls.append(el('button', { type: 'button', class: 'secondary', text: 'Look down the bond', onClick: () => S.focus(V([0, 0, 1]), false) }));
    }
  }
  build();
  return { build };
}

export function mount(slots, api){
  mountStage(slots, api, {
    mechanisms: MECHANISMS,
    eyebrow: 'pick a mechanism, then push it one arrow at a time',
    extra: (host, mech) => shapeBadges(api, host, mech)
  });
  mountShapePanel(slots.visual, api);
  mount3D(slots.visual, api);
  mountTry(slots, api, { gen: rng => genItem(rng, api), groups: ['sn1-sn2', 'e1-e2', 'sub-vs-elim'] });
}
