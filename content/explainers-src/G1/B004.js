// content/explainers-src/G1/B004.js: batch B004 of group G1 (Full-Length
// Test 1, the free practice test), Organic Chemistry: 30 items in the batch
// plan (docs/release-2026-10-30/questions/batches.json), 28 written here. The
// other two, fm:organic:oc-dbrfsk (radical bromination) and
// fm:own-organic:ace-0002 (HBr with a hydride shift), are pilot OC-1 and OC-2
// and live in content/explainers-src/pilot/pilot.js.
//
// Written in Thomas's coaching voice (docs/release-2026-10-30/questions/voice-codex.md)
// from the independent expert's blind solve (docs/explainers/solves/B004.json:
// 30 of 30 keys agree, no key dispute, no open picture dispute). The expert's
// families were weighed and kept unless CHANGES says otherwise. Bank-copy,
// letter-citation and stem-style notes the expert passed on are flags.
//
// Authoring source, never published: /content/explainers-src/* is
// force-redirected like /docs/*. The build (scripts/explainers/build.mjs) copies
// the student fields to content/explainers/ and the coach fields (flags,
// changes, demo pick, gate results) to docs/explainers/ only.
//
// Rules this file keeps: plain ASCII, no em dashes, never "wrong", "incorrect"
// or "failed", never a choice letter (choices are matched by their text, and
// alkene geometry is written cis and trans, never with a parenthesized letter),
// step 1 opens with a move, one family from the closed list on every non-key
// choice, concepts first (no arithmetic beyond one pKa subtraction).
//
// Pictures: the types the batch row names. chem.reaction and chem.molecule
// draw through the light copy of tools/ochem/tree/draw.js, with marks, a
// ladder and (meso only) a mirror-plane line; chem.molecule stereo cards are
// read off the drawing; chem.mechanism figures are written here as chains and
// the build pushes every arrow in RDKit with the 2026 set's verifier
// (scripts/ochem2026/verify.py), from the stem molecule to the key; chem.spectrum
// draws IR bands the build checks against landmark windows. The row planned
// chem.spectrum for three "Reading the machines" items; only one is
// spectroscopy, so the acetal and extraction items are reactions (CHANGES).
'use strict';

const FM = (id, n) => ({ bank: 'tools/mock/data/full-mocks.js', global: 'ACE_FULL_MOCKS', locator: { mock: 'FULL_1', section: 'ochem', id }, servedAs: 'Full-Length Test 1, Natural Sciences, question ' + (70 + n) });
const D = (band) => ({ band, from: 'bank field d (1-3)' });
const VID = (slot, title) => ({ slot, title, id: null, start: null });

// play-with targets: the OChem Tree and Roots open today; neither opens a module, tab or chip from the URL
const TREE = 'tools/ochem/tree/';
const ROOTS = 'tools/ochem/roots/';
const TREE_ROUTE = (mod, taps) => 'Needs a route: the tree opens modules from its own menu, not from the URL. Open ' + mod + '; ' + taps + '.';
const ROOT_ROUTE = (root) => 'Needs a route: the roots page opens one root from its own menu, not from the URL. Open ' + root + '.';

// curved-arrow chains (the build pushes every arrow in RDKit; atom refs are species.atom in SMILES order, explicit [H] counted)
const B = (a, b) => ({ bond: [a, b] });
const LP = (a) => ({ lp: a });
const AT = (a) => ({ atom: a });
const ARW = (from, to) => ({ from, to });
const RING_EXPANSION = {
  kind: 'chain',
  steps: [
    { name: 'protonate the OH', species: [{ smi: 'CC(O)C1CCC1' }, { smi: '[H][OH2+]' }], arrows: [ARW(LP('0.2'), B('0.2', '1.0')), ARW(B('1.0', '1.1'), AT('1.1'))], drops: ['O'] },
    { name: 'water leaves', species: [{ smi: 'CC([OH2+])C1CCC1' }], arrows: [ARW(B('0.1', '0.2'), AT('0.2'))], drops: ['O'] },
    { name: 'a ring bond shifts: four becomes five', species: [{ smi: 'C[CH+]C1CCC1' }], arrows: [ARW(B('0.2', '0.3'), B('0.3', '0.1'))] },
    { name: 'a hydride shift: secondary becomes tertiary', species: [{ smi: 'CC1([H])CCC[CH+]1' }], arrows: [ARW(B('0.1', '0.2'), B('0.2', '0.6'))] },
    { name: 'water takes a ring H: the alkene', species: [{ smi: 'C[C+]1C([H])CCC1' }, { smi: 'O' }], adds: ['O'], arrows: [ARW(LP('1.0'), B('1.0', '0.3')), ARW(B('0.2', '0.3'), B('0.2', '0.1'))] }
  ],
  product: [{ smi: 'CC1=CCCC1' }, { smi: '[OH3+]' }]
};
const NEOPENTYL = {
  kind: 'chain',
  steps: [
    { name: 'protonate the OH', species: [{ smi: 'CC(C)(C)CO' }, { smi: 'Br[H]' }], arrows: [ARW(LP('0.5'), B('0.5', '1.1')), ARW(B('1.0', '1.1'), AT('1.0'))] },
    { name: 'water leaves as a methyl shifts over', species: [{ smi: 'CC(C)(C)C[OH2+]' }, { smi: '[Br-]' }], arrows: [ARW(B('0.0', '0.1'), B('0.0', '0.4')), ARW(B('0.4', '0.5'), AT('0.5'))], drops: ['O'] },
    { name: 'bromide adds to the tertiary cation', species: [{ smi: 'CC[C+](C)C' }, { smi: '[Br-]' }], arrows: [ARW(LP('1.0'), B('1.0', '0.2'))] }
  ],
  product: [{ smi: 'CCC(C)(C)Br' }]
};
const METHYL_SHIFT = {
  kind: 'chain',
  steps: [
    { name: 'protonate the alkene', species: [{ smi: 'C=CC(C)(C)C' }, { smi: 'Br[H]' }], arrows: [ARW(B('0.0', '0.1'), B('0.0', '1.1')), ARW(B('1.0', '1.1'), AT('1.0'))] },
    { name: 'a methyl shifts: secondary becomes tertiary', species: [{ smi: 'C[CH+]C(C)(C)C' }, { smi: '[Br-]' }], arrows: [ARW(B('0.2', '0.3'), B('0.3', '0.1'))] },
    { name: 'bromide adds', species: [{ smi: 'CC(C)[C+](C)C' }, { smi: '[Br-]' }], arrows: [ARW(LP('1.0'), B('1.0', '0.3'))] }
  ],
  product: [{ smi: 'CC(C)C(C)(C)Br' }]
};
const COPE = {
  kind: 'chain',
  steps: [
    { name: 'three pairs move at once: one sigma bond breaks, one forms', species: [{ smi: 'C=CC(C1=CC=CC=C1)CC=C' }], arrows: [ARW(B('0.0', '0.1'), B('0.1', '0.2')), ARW(B('0.2', '0.9'), B('0.9', '0.10')), ARW(B('0.10', '0.11'), B('0.11', '0.0'))] }
  ],
  product: [{ smi: 'C=CCCC=CC1=CC=CC=C1' }]
};
const E2 = {
  kind: 'chain',
  steps: [
    { name: 'ethoxide takes a beta H as bromide leaves', species: [{ smi: 'CC(C)(C)C(Br)C[H]' }, { smi: 'CC[O-]' }], arrows: [ARW(LP('1.2'), B('1.2', '0.7')), ARW(B('0.6', '0.7'), B('0.6', '0.4')), ARW(B('0.4', '0.5'), AT('0.5'))] }
  ],
  product: [{ smi: 'CC(C)(C)C=C' }, { smi: 'CCO' }, { smi: '[Br-]' }]
};
const DECARBOX = {
  kind: 'chain',
  steps: [
    { name: 'six atoms in a ring: the H moves as CO2 leaves', species: [{ smi: 'O=C(C1=CC=CC=C1)CC(=O)O[H]' }], arrows: [ARW(LP('0.0'), B('0.0', '0.12')), ARW(B('0.11', '0.12'), B('0.11', '0.9')), ARW(B('0.9', '0.8'), B('0.8', '0.1')), ARW(B('0.1', '0.0'), AT('0.0'))] }
  ],
  product: [{ smi: 'OC(=C)C1=CC=CC=C1' }, { smi: 'O=C=O' }]
};

const ENTRIES = [
  /* ============================================ The center of the universe: alkenes */
  {
    qid: 'fm:organic:oc-1o9d4eq',
    servesAlso: [],
    section: 'ochem',
    subtopic: 'oc.alkenes.hydration',
    difficulty: D(1),
    source: FM('organic:oc-1o9d4eq', 1),
    keyText: '1. BH3-THF; 2. H2O2, NaOH',
    answer: { line: 'Hydroboration is the one hydration that is both anti-Markovnikov and syn. Those two words are the whole stem.' },
    steps: [
      'Ask the two questions: which carbon, and which face? The OH goes to the less substituted carbon, so anti-Markovnikov, and H and OH add to one face, so syn.',
      'Boron goes to the less crowded carbon, and B and H add together in one step from one face. No cation forms, so nothing shifts.',
      'H2O2 and NaOH swap boron for OH right where it sat. The new H and the OH are cis, which leaves the OH trans to the methyl.'
    ],
    choices: [
      { text: '1. Hg(OAc)2, H2O; 2. NaBH4', role: 'trap', family: 'other-conditions', trap: 'Markovnikov, no shift', note: 'Oxymercuration skips the rearrangement, which is why it pulls. But it is Markovnikov: the OH lands on the methyl carbon and gives the tertiary alcohol.' },
      { text: 'Dilute H3PO4, H2O', role: 'trap', family: 'other-conditions', trap: 'Acid water', note: 'Acid hydration runs through the tertiary cation. Markovnikov puts the OH on the methyl carbon, and a flat cation gives no face control.' },
      { text: 'HBr, then NaOH', role: 'trap', family: 'other-conditions', trap: 'Two steps, same address', note: 'HBr without peroxide puts Br on the tertiary carbon. NaOH on a tertiary bromide eliminates or gives the tertiary alcohol, never the secondary one.' },
      { text: 'H2O, cat. H2SO4, heat', role: 'trap', family: 'other-conditions', trap: 'Acid water, plus heat', note: 'Same Markovnikov address as any acid hydration, and heat pushes the equilibrium back toward the alkene.' },
      { text: '1. BH3-THF; 2. H2O2, NaOH', role: 'key', note: 'Anti-Markovnikov and syn in one reagent: OH on the less substituted carbon, trans to the methyl.' }
    ],
    lockIt: 'Hydroboration-oxidation puts OH on the less substituted carbon, with H and OH added to the same face.',
    hook: 'Boron is bulky: it goes where the room is.',
    playWith: { label: 'Tree, alkene additions: on the propene board, tap BH3, then H2O2 and read the address and face badges', href: TREE, state: { module: 't4-alkene', tab: 'propene', reagent: 'alkene_hydroboration' }, expect: [], routing: TREE_ROUTE('Alkene additions', 'the propene board and the BH3 chip are taps inside it') },
    video: VID('oc.alkenes.hydration', 'Alkene hydration: which carbon, which face'),
    visual: {
      type: 'chem.reaction',
      reactants: [{ smi: 'CC1=CCCC1', label: '1-methylcyclopentene', marks: [{ atom: 2, text: 'less substituted: OH here', key: true }, { atom: 1, text: 'methyl carbon: H here' }] }],
      reagent: '1. BH3; 2. H2O2, NaOH',
      products: [{ smi: 'C[C@@H]1CCC[C@H]1O', label: 'trans-2-methylcyclopentan-1-ol (one of the pair)', cip: [{ atom: 1, config: 'R' }, { atom: 5, config: 'R' }], marks: [{ atom: 6, text: 'OH, trans to CH3', key: true }] }],
      note: 'B and H land on one face in one step, so the new H and the OH are cis. That puts the OH trans to the methyl.',
      reuse: 'SmilesDrawer through the light copy of tools/ochem/tree/draw.js (drawSmilesGeom for atom positions)',
      alt: '1-Methylcyclopentene, with the less substituted alkene carbon marked for the OH and the methyl carbon marked for the H, reacts with BH3, then H2O2 and NaOH, to give trans-2-methylcyclopentan-1-ol, drawn with the OH and the methyl on opposite faces.',
      caption: 'Two marks on the alkene: OH to the open carbon, H to the methyl carbon, both from the same face.'
    },
    demoPick: '1. Hg(OAc)2, H2O; 2. NaBH4',
    flags: [
      { kind: 'stem-style', text: 'The stem states the principle it tests ("anti-Markovnikov, syn-addition outcome", "OH placed on the LESS substituted alkene carbon") and capitalizes LESS. Suggested, not applied: "Which reagent sequence converts 1-methylcyclopentene to trans-2-methylcyclopentan-1-ol?" Key unchanged.' }
    ]
  },
  {
    qid: 'fm:organic:oc-p5414p',
    servesAlso: [],
    section: 'ochem',
    subtopic: 'oc.alkenes.epoxidation',
    difficulty: D(1),
    source: FM('organic:oc-p5414p', 23),
    keyText: 'CC[C@H]1O[C@@H]1CC',
    answer: { line: 'mCPBA hands one oxygen to one face in a single step, so nothing rotates: the trans alkene becomes the trans epoxide.' },
    steps: [
      'Read the alkene: trans-3-hexene, its two ethyl groups on opposite sides of the C=C.',
      'mCPBA delivers one O to one face in one step, with no cation and no rotation. The ethyls stay put.',
      'Pick the epoxide that shows them trans, one ethyl toward you and one away. mCPBA makes both mirror images; one is drawn.'
    ],
    choices: [
      { text: 'CC[C@@H]1O[C@@H]1CC', display: 'cis-2,3-diethyloxirane (both ethyls on one face)', role: 'trap', family: 'reversed', relation: 'diastereomer', trap: 'Trans turned to cis', note: 'Both ethyls on one face is the cis epoxide, a meso compound and a diastereomer of the key. It comes from cis-3-hexene.' },
      { text: 'CCC1OC1CC', display: '2,3-diethyloxirane, stereochemistry not shown', role: 'trap', family: 'half-right', trap: 'Right ring, faces not shown', note: 'Right ring, right atoms, but the reaction fixes the ethyls trans, and only one choice shows that. Pick the drawing that carries the stereochemistry.' },
      { text: 'CCC(O)C(O)CC', display: 'hexane-3,4-diol, stereochemistry not shown', role: 'trap', family: 'other-conditions', trap: 'Diol reagents', note: 'A diol comes from OsO4 or KMnO4, or from opening the epoxide with aqueous acid. One equivalent of mCPBA stops at the epoxide.' },
      { text: 'CC[C@H](O)[C@H](O)CC', display: 'meso-hexane-3,4-diol', role: 'trap', family: 'one-step-too-far', trap: 'Opened the ring', note: 'This meso diol is what you get after aqueous acid opens the trans epoxide, anti across the ring. mCPBA alone does not open it.' },
      { text: 'CC[C@H]1O[C@@H]1CC', display: 'trans-2,3-diethyloxirane (ethyls on opposite faces)', role: 'key', relation: 'same', note: 'Trans in, trans out: one ethyl on each face of the ring.' }
    ],
    lockIt: 'Epoxidation is syn and concerted, so the alkene geometry carries over: trans gives trans, cis gives cis.',
    hook: null,
    playWith: { label: 'Tree, alkene additions: the trans-2-butene tab, compare a syn reagent with an anti reagent on a trans alkene', href: TREE, state: { module: 't4-alkene', tab: 'internal' }, expect: [], routing: TREE_ROUTE('Alkene additions', 'the trans-2-butene tab is a tap inside it; it shows OsO4 and Br2, not mCPBA') },
    video: VID('oc.alkenes.epoxidation', 'Epoxides: one face, one step'),
    visual: {
      type: 'chem.reaction',
      reactants: [{ smi: 'CC/C=C/CC', label: 'trans-3-hexene', marks: [] }],
      reagent: 'mCPBA, 1 equiv',
      products: [{ smi: 'CC[C@H]1O[C@@H]1CC', label: 'trans-2,3-diethyloxirane (one of the pair)', cip: [{ atom: 2, config: 'R' }, { atom: 4, config: 'R' }], marks: [{ atom: 3, text: 'one O, one face', key: true }] }],
      note: 'One step, one face: the ethyls keep their trans relationship. mCPBA makes both mirror images; one is drawn.',
      reuse: 'SmilesDrawer through the light copy of tools/ochem/tree/draw.js; the drawn configuration is checked by the render gate',
      alt: 'Trans-3-hexene, its two ethyl groups on opposite sides of the C=C, reacts with one equivalent of mCPBA to give trans-2,3-diethyloxirane, drawn with the two ethyls on opposite faces and the new ring oxygen outlined.',
      caption: 'The ethyls start on opposite sides and end on opposite faces. One step, no rotation.'
    },
    demoPick: 'CC[C@@H]1O[C@@H]1CC',
    flags: [
      { kind: 'stem-style', text: 'The stem capitalizes MAJOR and asks the question twice ("Predict the MAJOR product of the following reaction" and "Which structure is the major product?"). Suggested, not applied: keep one question. Key unchanged.' },
      { kind: 'bank-copy', text: 'The bank explanation ends "Two-concept (stereospecific syn + trans recognition).", an authoring note shown to students on the review screen. Key unchanged.' }
    ]
  },
  {
    qid: 'fm:organic:oc-9wwa4n',
    servesAlso: [],
    section: 'ochem',
    subtopic: 'oc.alkenes.ozonolysis',
    difficulty: D(2),
    source: FM('organic:oc-9wwa4n', 27),
    keyText: 'Two ketones (a diketone)',
    answer: { line: 'Each alkene carbon carries two carbon groups and no H. Cut the C=C, put an O on each carbon, and both become ketones.' },
    steps: [
      'Look at the two alkene carbons. Each holds a methyl and a ring carbon, and neither holds an H.',
      'Cut the C=C and put =O on each of its carbons. The ring opens into one chain.',
      'A carbon with two carbon groups becomes a ketone. Both qualify, so the product is heptane-2,6-dione, a diketone.'
    ],
    choices: [
      { text: 'Two aldehydes (a dialdehyde)', role: 'trap', family: 'neighbor-fact', trap: 'True of plain cyclopentene', note: 'Plain cyclopentene has an H on each alkene carbon, so it gives a dialdehyde. Here the methyls take those spots.' },
      { text: 'Two carboxylic acids (a diacid)', role: 'trap', family: 'other-conditions', trap: 'Oxidative workup', note: 'Acids come from alkene carbons with an H, under an oxidative workup such as H2O2. Zn and acetic acid is reductive, and these carbons have no H anyway.' },
      { text: 'One ketone and one carboxylic acid', role: 'trap', family: 'other-conditions', trap: 'Other alkene, other workup', note: 'That is 1-methylcyclopentene with an oxidative workup. This alkene has two methyls, and the workup is reductive.' },
      { text: 'One ketone and one aldehyde', role: 'trap', family: 'neighbor-fact', trap: 'True of 1-methylcyclopentene', note: 'With one methyl, one alkene carbon keeps an H and becomes an aldehyde. Here both carbons carry a methyl.' },
      { text: 'Two ketones (a diketone)', role: 'key', note: 'Two carbon groups on each alkene carbon, so two ketones.' }
    ],
    lockIt: 'Ozonolysis with a reductive workup: an alkene carbon with an H becomes an aldehyde, one without becomes a ketone.',
    hook: null,
    playWith: { label: 'Tree, alkene additions: on the propene board, tap O3, then Zn and see the C=C cut into two carbonyls', href: TREE, state: { module: 't4-alkene', tab: 'propene', reagent: 'alkene_o3_zn' }, expect: [], routing: TREE_ROUTE('Alkene additions', 'the propene board and the O3 chip are taps inside it') },
    video: VID('oc.alkenes.ozonolysis', 'Ozonolysis: cut the C=C, count the H'),
    visual: {
      type: 'chem.reaction',
      reactants: [{ smi: 'CC1=C(C)CCC1', label: '1,2-dimethylcyclopentene', marks: [{ atom: 1, text: 'no H: ketone', key: true }, { atom: 2, text: 'no H: ketone', key: true }] }],
      reagent: '1. O3; 2. Zn, AcOH',
      products: [{ smi: 'CC(=O)CCCC(C)=O', label: 'heptane-2,6-dione', marks: [{ atom: 1, text: 'ketone', key: true }, { atom: 6, text: 'ketone', key: true }] }],
      reuse: 'SmilesDrawer through the light copy of tools/ochem/tree/draw.js',
      alt: '1,2-Dimethylcyclopentene with both alkene carbons marked as holding no H. Ozone, then zinc and acetic acid, cut the C=C and open the ring to heptane-2,6-dione, with both new carbonyls marked as ketones.',
      caption: 'Check each alkene carbon for an H. Neither has one, so both ends become ketones.'
    },
    demoPick: 'One ketone and one aldehyde',
    flags: []
  },
  {
    qid: 'fm:organic:oc-1oitbuh',
    servesAlso: [],
    section: 'ochem',
    subtopic: 'oc.alkenes.hydrogenation',
    difficulty: D(1),
    source: FM('organic:oc-1oitbuh', 28),
    keyText: 'Cyclohexane',
    answer: { line: 'H2 and Pd add one H to each alkene carbon and nothing else. The C=C is gone: cyclohexane.' },
    steps: [
      'Read the reagent. H2 with a metal catalyst brings hydrogen, and only hydrogen.',
      'Add one H to each alkene carbon, both from the same face, off the metal surface.',
      'No O and no Br came in, and the ring stays a ring. The product is cyclohexane.'
    ],
    choices: [
      { text: 'Cyclohexanol', role: 'trap', family: 'other-conditions', trap: 'Hydration reagents', note: 'Adding H and OH is hydration, with acid and water or with hydroboration. This flask has only H2.' },
      { text: 'Benzene', role: 'trap', family: 'reversed', trap: 'Hydrogen out, not in', note: 'Benzene would mean taking hydrogen away. Hydrogenation adds it.' },
      { text: '1,2-dibromocyclohexane', role: 'trap', family: 'other-conditions', trap: 'The Br2 product', note: 'Two Br atoms across the C=C is what Br2 adds. A different reagent.' },
      { text: 'Cyclohexane', role: 'key', note: 'Two H across the C=C, nothing else: the alkane.' },
      { text: 'Cyclohexanone', role: 'trap', family: 'other-conditions', trap: 'Needs oxygen in', note: 'A ketone needs an oxygen brought in, by hydration and then oxidation. H2 and Pd bring none.' }
    ],
    lockIt: 'Catalytic hydrogenation adds two H across the C=C, syn, and nothing else.',
    hook: null,
    playWith: { label: 'Tree, alkene additions: on the propene board, tap H2, Pt and read the syn badge', href: TREE, state: { module: 't4-alkene', tab: 'propene', reagent: 'alkene_h2' }, expect: [], routing: TREE_ROUTE('Alkene additions', 'the propene board and the H2 chip are taps inside it') },
    video: VID('oc.alkenes.hydrogenation', 'Hydrogenation: two H, one face'),
    visual: {
      type: 'chem.reaction',
      reactants: [{ smi: 'C1CCC=CC1', label: 'cyclohexene', marks: [{ atom: 3, text: 'H adds here', key: true }, { atom: 4, text: 'and here', key: true }] }],
      reagent: 'H2, Pd',
      products: [{ smi: 'C1CCCCC1', label: 'cyclohexane' }],
      reuse: 'SmilesDrawer through the light copy of tools/ochem/tree/draw.js',
      alt: 'Cyclohexene, with both alkene carbons marked where an H adds, reacts with H2 and Pd to give cyclohexane, the same ring with no C=C.',
      caption: 'Two marked carbons, one H each. Nothing else enters the ring.'
    },
    demoPick: 'Cyclohexanol',
    flags: []
  },
  {
    qid: 'fm:organic:oc-8neusk',
    servesAlso: [],
    section: 'ochem',
    subtopic: 'oc.carbocations.rearrangement',
    difficulty: D(2),
    source: FM('organic:oc-8neusk', 21),
    keyText: 'CC(C)(Br)C(C)C',
    answer: { line: 'H+ makes a secondary cation next to a carbon holding three methyls. One methyl slides over, the cation turns tertiary, and bromide adds there.' },
    steps: [
      'Protonate the alkene the Markovnikov way: H+ goes to the CH2 end and the plus sits on C2, a secondary carbon.',
      'Look next door. C3 holds three methyls and no H, so a methyl slides over with its bond pair, and the plus moves to C3, now tertiary.',
      'Bromide adds to the tertiary carbon: 2-bromo-2,3-dimethylbutane. Some unshifted bromide forms too, often a lot; the shifted one is the product the item counts as major.'
    ],
    choices: [
      { text: 'BrCC(C)C(C)C', display: '1-bromo-2,3-dimethylbutane', role: 'trap', family: 'half-right', trap: 'Shifted, Br on the end', note: 'The skeleton did rearrange. But Br sits on a primary end carbon, not on the tertiary carbon that holds the charge.' },
      { text: 'BrCCC(C)(C)C', display: '1-bromo-3,3-dimethylbutane', role: 'trap', family: 'other-conditions', trap: 'Peroxide path', note: 'Br on the end carbon is anti-Markovnikov, the radical result of HBr with peroxides. There is no peroxide here.' },
      { text: 'CCC(C)(C)CBr', display: '1-bromo-2,2-dimethylbutane', role: 'trap', family: 'miscount', trap: 'Br where no cation formed', note: 'This puts Br on one of the tert-butyl methyls. No cation ever forms on that carbon, so bromide has no way to reach it.' },
      { text: 'CC(C)(Br)C(C)C', display: '2-bromo-2,3-dimethylbutane', role: 'key', note: 'Methyl shift to the tertiary cation, then bromide.' },
      { text: 'CC(Br)C(C)(C)C', display: '3-bromo-2,2-dimethylbutane (no shift)', role: 'trap', family: 'close-second', trap: 'No shift', note: 'This Markovnikov bromide forms too, from bromide catching the secondary cation first. The methyl shift to the tertiary cation is the move the item tests.' }
    ],
    lockIt: 'Check the neighbor of every new cation: a hydride or methyl shift to a more stable cation comes first.',
    hook: null,
    playWith: { label: 'Tree, alkene additions: the hydride shift tab, where a secondary cation moves its charge to a better neighbor', href: TREE, state: { module: 't4-alkene', tab: 'shift' }, expect: [], routing: TREE_ROUTE('Alkene additions', 'the hydride shift tab is a tap inside it; it shows a hydride shift, not a methyl shift') },
    video: VID('oc.carbocations.rearrangement', 'Carbocation shifts'),
    visual: {
      type: 'chem.mechanism',
      fig: METHYL_SHIFT,
      showProduct: false,
      stepper: 'phone',
      reuse: 'drawChain() in tools/ochem/tree/mechdraw.js; the chain is written here and every arrow is pushed in RDKit by scripts/ochem2026/verify.py (build)',
      alt: 'Three mechanism steps with curved arrows: 3,3-dimethyl-1-butene takes H+ from HBr to form a secondary cation; a methyl shifts from the neighboring carbon, moving the charge to a tertiary carbon; bromide adds to give 2-bromo-2,3-dimethylbutane.',
      caption: 'Step 2 is the move: a methyl, not an H, slides over, because the neighbor has no H to give.'
    },
    demoPick: 'CC(Br)C(C)(C)C',
    flags: [
      { kind: 'letter-cite', text: 'The bank explanation says "keyed option A" (the key is served fourth, index 3) and calls the unrearranged bromide "option B" (served fifth). Students see it on the full-test review screen. Key unchanged.' },
      { kind: 'bank-copy', text: 'The bank explanation carries an authoring note, "canonical CC(C)C(C)(C)Br". Key unchanged.' },
      { kind: 'stem-style', text: 'The stem ends with a hint, "(Consider carbocation stability carefully.)". Suggested, not applied: drop it. Key unchanged.' },
      { kind: 'note', text: 'Expert note: measured HBr additions to 3,3-dimethyl-1-butene give a lot of unrearranged bromide too, so the explainer says major, never only.' },
      { kind: 'note', text: 'Review note, left for Thomas: the miscount family on 1-bromo-2,2-dimethylbutane is a loose fit, since the slip is Br on a carbon that never held a cation, not a count. Both reviews left the family to you; it is unchanged.' }
    ]
  },
  {
    qid: 'fm:organic:oc-18i1svf',
    servesAlso: [],
    section: 'ochem',
    subtopic: 'oc.carbocations.rearrangement',
    difficulty: D(1),
    source: FM('organic:oc-18i1svf', 6),
    keyText: 'CC1=CCCC1',
    answer: { line: 'The cation grows the ring from four to five, shifts once more to tertiary, then drops a proton: 1-methylcyclopentene.' },
    steps: [
      'Protonate the OH and let water leave. That leaves a secondary cation on the carbon right next to the four-membered ring.',
      'Shift a ring bond onto the cation, which relieves most of the ring strain and puts the charge on a ring carbon. Four becomes five.',
      'Look next door: that carbon holds the methyl and one H. A hydride shift makes the tertiary cation, and losing a ring H gives the most substituted alkene.'
    ],
    choices: [
      { text: 'CC1(O)CCCC1', display: '1-methylcyclopentan-1-ol', role: 'trap', family: 'other-question', trap: 'Alcohol, not alkene', note: 'Water can trap the tertiary cation and give this alcohol, and the ring is right, which is why it pulls. But the stem asks for the alkene.' },
      { text: 'CC=C1CCC1', display: 'ethylidenecyclobutane', role: 'trap', family: 'one-step-short', trap: 'Eliminated before the shift', note: 'This is the alkene before any shift: the four-membered ring and its strain are still there. The stem tells you the ring expands first.' },
      { text: 'C=CC1CCC1', display: 'vinylcyclobutane', role: 'trap', family: 'other-conditions', trap: 'No cation, no shift', note: 'The least substituted alkene, ring intact, is the kind of product a bulky base gives by E2 from a halide. Acid makes a cation, and the cation rearranges.' },
      { text: 'C1=CCCCC1', display: 'cyclohexene', role: 'trap', family: 'miscount', trap: 'Methyl counted into the ring', note: 'One ring bond moves, so the ring grows by one carbon, four to five. The methyl stays outside the ring; it never joins it.' },
      { text: 'CC1=CCCC1', display: '1-methylcyclopentene', role: 'key', note: 'Four to five, secondary to tertiary, then the trisubstituted alkene.' }
    ],
    lockIt: 'A cation beside a strained small ring expands it; then E1 gives the most substituted alkene.',
    hook: 'Four-ring next to a plus? Expect five.',
    playWith: { label: 'Tree, alkene additions: the hydride shift tab, where a secondary cation moves its charge to a better neighbor', href: TREE, state: { module: 't4-alkene', tab: 'shift' }, expect: [], routing: TREE_ROUTE('Alkene additions', 'the hydride shift tab is a tap inside it; it shows a hydride shift, not a ring expansion') },
    video: VID('oc.carbocations.rearrangement', 'Carbocation shifts'),
    visual: {
      type: 'chem.mechanism',
      fig: RING_EXPANSION,
      showProduct: false,
      stepper: 'phone',
      reuse: 'drawChain() in tools/ochem/tree/mechdraw.js; the chain is written here and every arrow is pushed in RDKit by scripts/ochem2026/verify.py (build)',
      alt: 'Five mechanism steps with curved arrows: the OH is protonated and water leaves, giving a secondary cation beside the cyclobutane ring; a ring bond shifts so the ring grows to five carbons; a hydride shift makes the tertiary cation; water takes a ring H to give 1-methylcyclopentene.',
      caption: 'Step through the arrows. Step 3 is the one to see: a ring bond moves and four becomes five.'
    },
    demoPick: 'CC=C1CCC1',
    flags: [
      { kind: 'stem-style', text: 'The stem states the mechanism it tests ("A ring-expansion (alkyl) shift relieves ring strain before elimination."). Suggested, not applied: drop that sentence and ask for the major alkene. Key unchanged.' },
      { kind: 'letter-cite', text: 'The bank explanation names the key "option A" (served fifth) and maps letters to choices in another order. Students see it on the full-test review screen. Key unchanged.' },
      { kind: 'bank-copy', text: 'The bank explanation says ring expansion gives the tertiary 1-methylcyclopentyl cation directly; expansion gives the secondary 2-methylcyclopentyl cation, and a hydride shift is the second step (the explainer shows both). It also carries "Single correct answer", an authoring note, and "wrong ring size". Key unchanged.' }
    ]
  },

  /* ================================ The four questions: substitution and elimination */
  {
    qid: 'fm:organic:oc-1v0wmr4',
    servesAlso: [],
    section: 'ochem',
    subtopic: 'oc.sn-e.e2',
    difficulty: D(2),
    source: FM('organic:oc-1v0wmr4', 18),
    keyText: 'CC(C)(C)C=C',
    answer: { line: 'E2: one step, no cation, nothing shifts. The only beta H are on the methyl, so the C=C forms at the chain end.' },
    steps: [
      'List the beta carbons, the neighbors of the C-Br carbon: the CH3 at C1 and the quaternary C3, which has no H.',
      'E2 pulls a beta H as Br leaves, in a single step. No cation ever forms, so no methyl can shift.',
      'Only C1 has hydrogens, so only one alkene is possible: 3,3-dimethylbut-1-ene. Zaitsev has nothing to choose between.'
    ],
    choices: [
      { text: 'C=C(C)C(C)C', display: '2,3-dimethylbut-1-ene', role: 'trap', family: 'other-conditions', trap: 'Needs a cation', note: 'This skeleton needs a methyl shift, and a shift needs a carbocation, as in E1 with no strong base. E2 never makes one.' },
      { text: 'CC(C)(C)C=C', display: '3,3-dimethylbut-1-ene', role: 'key', note: 'The only beta H is on the methyl, so the C=C forms at the end.' },
      { text: 'CC(C)=C(C)C', display: '2,3-dimethylbut-2-ene', role: 'trap', family: 'other-conditions', trap: 'Zaitsev through a shift', note: 'The most substituted alkene pulls you because of Zaitsev. Reaching it takes a methyl shift through a cation, which is the E1 product when no strong base is present.' },
      { text: 'CCOC(C)C(C)(C)C', display: '2-ethoxy-3,3-dimethylbutane (an ether)', role: 'trap', family: 'close-second', trap: 'Ethoxide as nucleophile', note: 'Ethoxide can substitute, but this carbon is secondary and sits next to a tert-butyl group. Crowding plus heat hands it to E2.' },
      { text: 'CC(O)C(C)(C)C', display: '3,3-dimethylbutan-2-ol', role: 'trap', family: 'other-conditions', trap: 'Needs water or hydroxide', note: 'An alcohol needs water or hydroxide as the nucleophile. This flask holds ethoxide in ethanol.' }
    ],
    lockIt: 'E2 is concerted: no cation, no shift, and it needs a beta H.',
    hook: null,
    playWith: { label: 'Tree, SN2, SN1, E2 and E1: tap E2: 2-bromopropane + NaOEt and step through one step with three arrows', href: TREE, state: { module: 't5-sn-e', mech: 'e2' }, expect: [], routing: TREE_ROUTE('SN2, SN1, E2 and E1', 'the E2 chip is a tap inside it') },
    video: VID('oc.sn-e.e2', 'E2: one step, a beta H, no cation'),
    visual: {
      type: 'stack',
      alt: '2-Bromo-3,3-dimethylbutane with its two beta carbons marked: the methyl, outlined, with three H, and the quaternary carbon with none. Below, one E2 step with curved arrows: ethoxide takes a methyl H, the C=C forms, and bromide leaves.',
      caption: 'Two neighbors of the C-Br carbon, and only one has an H to give. One step, three arrows, no cation.',
      panels: [
        { type: 'chem.molecule', smi: 'CC(C)(C)C(C)Br', label: '2-bromo-3,3-dimethylbutane', marks: [{ atom: 5, text: 'beta C: three H', key: true }, { atom: 1, text: 'beta C: no H', labelDir: 45 }], reuse: 'SmilesDrawer through the light copy of tools/ochem/tree/draw.js' },
        { type: 'chem.mechanism', fig: E2, showProduct: false, reuse: 'drawChain() in tools/ochem/tree/mechdraw.js; arrows pushed in RDKit by scripts/ochem2026/verify.py (build)' }
      ]
    },
    demoPick: 'CC(C)=C(C)C',
    flags: [
      { kind: 'stem-style', text: 'The stem capitalizes MAJOR and names the mechanism ("this E2 reaction"), which is the item\'s main clue. Suggested, not applied: "major", and ask for the major product with NaOEt and heat. Key unchanged.' },
      { kind: 'letter-cite', text: 'The bank explanation calls the key "option A" (served second) and the rearranged Zaitsev alkene "option B" (served third), and says "hydride/methyl shift" where only a methyl shift reaches that skeleton. Key unchanged.' }
    ]
  },

  /* ================================== The switchboard: alcohols, ethers, epoxides */
  {
    qid: 'fm:organic:oc-11r58ig',
    servesAlso: [],
    section: 'ochem',
    subtopic: 'oc.alcohols.hx',
    difficulty: D(2),
    source: FM('organic:oc-11r58ig', 9),
    keyText: 'CCC(C)(C)Br',
    answer: { line: 'The tert-butyl group blocks SN2, so water leaves with a methyl sliding over, and bromide adds to the tertiary cation that results.' },
    steps: [
      'Protonate the OH so water can leave. HBr supplies both the proton and the bromide.',
      'Check SN2 first. The CH2 is primary, but the tert-butyl group next door blocks its back side, so bromide cannot get in.',
      'Water leaves as a methyl shifts over with its bond pair, so no primary cation ever forms. The charge lands on a tertiary carbon, and bromide adds there.'
    ],
    choices: [
      { text: 'CCC(C)CBr', display: '1-bromo-2-methylbutane', role: 'trap', family: 'half-right', trap: 'Shifted, Br on the end', note: 'The skeleton did rearrange, so half of it holds. But after the shift the charge sits on the tertiary carbon, so that is where Br goes.' },
      { text: 'CC(C)=CC', display: '2-methylbut-2-ene', role: 'trap', family: 'close-second', trap: 'E1 from the same cation', note: 'Losing a proton from the same tertiary cation gives this alkene, and some forms. With concentrated HBr, bromide capture wins.' },
      { text: 'CC(C)(C)CCl', display: 'neopentyl chloride', role: 'trap', family: 'other-conditions', trap: 'A chloride from HBr', note: 'A chloride needs HCl, often with ZnCl2. This flask has only HBr, and the skeleton here has not rearranged either.' },
      { text: 'CCC(C)(C)Br', display: '2-bromo-2-methylbutane', role: 'key', note: 'Methyl shift as water leaves, then bromide on the tertiary carbon.' },
      { text: 'CC(C)(C)CBr', display: 'neopentyl bromide (no rearrangement)', role: 'trap', family: 'missed-exception', trap: 'Primary means SN2, usually', note: 'Primary alcohol plus HBr usually means SN2 with no shift. Neopentyl is the exception: the tert-butyl group walls off the back side.' }
    ],
    lockIt: 'Neopentyl carbons block SN2; in acid they shift a methyl and react at the tertiary carbon.',
    hook: null,
    playWith: { label: 'Roots, the stability staircase: count the neighbors on a carbocation and rank it, primary to tertiary', href: ROOTS, state: { root: 'l2-carbocation' }, expect: [], routing: ROOT_ROUTE('The stability staircase (l2-carbocation)') },
    video: VID('oc.alcohols.hx', 'Alcohols with HX: SN2, SN1 and the shift'),
    visual: {
      type: 'chem.mechanism',
      fig: NEOPENTYL,
      showProduct: false,
      stepper: 'phone',
      reuse: 'drawChain() in tools/ochem/tree/mechdraw.js; the chain is written here and every arrow is pushed in RDKit by scripts/ochem2026/verify.py (build)',
      alt: 'Three mechanism steps with curved arrows: HBr protonates the OH of neopentyl alcohol; water leaves as a methyl moves over, so the charge lands on a tertiary carbon; bromide adds to give 2-bromo-2-methylbutane.',
      caption: 'Step 2 holds the whole question: water leaves and a methyl moves at the same time.'
    },
    demoPick: 'CC(C)(C)CBr',
    flags: [
      { kind: 'letter-cite', text: 'Every letter in the bank explanation points elsewhere in the served order: the key is called "option A" (served fourth), neopentyl bromide "option B" (served fifth), and so on. Students see it on the full-test review screen. Key unchanged.' },
      { kind: 'tool-gap', text: 'No Ace Labs tool shows the neopentyl methyl shift. The play-with link goes to the carbocation stability root.' }
    ]
  },
  {
    qid: 'fm:organic:oc-1vndb83',
    servesAlso: [],
    section: 'ochem',
    subtopic: 'oc.carbonyl.hydride-reduction',
    difficulty: D(2),
    source: FM('organic:oc-1vndb83', 5),
    keyText: 'Benzaldehyde is reduced faster than acetophenone because the aldehyde carbonyl is less hindered and more electrophilic',
    answer: { line: 'The aldehyde carbon carries an H where the ketone carries a methyl: more room and more plus charge, so hydride arrives faster.' },
    steps: [
      'Compare what sits on each carbonyl carbon. Benzaldehyde has a phenyl and an H; acetophenone has a phenyl and a methyl.',
      'The methyl pushes electron density in, so that carbon is less positive. It also crowds the path hydride takes in.',
      'NaBH4 reduces both. The question is speed, and the aldehyde goes first.'
    ],
    choices: [
      { text: 'Acetophenone is reduced faster because ketones are inherently more electrophilic than aldehydes at the carbonyl carbon in every solvent', role: 'trap', family: 'reversed', trap: 'Order turned around', note: 'Ketones are the less electrophilic of the two. Two carbon groups donate more than one, so the order runs the other way.' },
      { text: 'Benzaldehyde is reduced faster than acetophenone because the aldehyde carbonyl is less hindered and more electrophilic', role: 'key', note: 'Less hindered and more electrophilic: both reasons point the same way, toward the aldehyde.' },
      { text: 'Both are reduced at identical rates because NaBH4 reacts only with esters', role: 'trap', family: 'reversed', trap: 'Selectivity turned around', note: 'NaBH4 is the mild hydride: it reduces aldehydes and ketones and walks past most esters. LiAlH4 is the one that takes esters.' },
      { text: 'Neither reacts because NaBH4 cannot reduce conjugated aryl carbonyls', role: 'trap', family: 'neighbor-fact', trap: 'True of the ring only', note: 'NaBH4 does leave the benzene ring and isolated C=C bonds alone. The C=O next to the ring is still a target, and it gets reduced.' },
      { text: 'Acetophenone is reduced faster because the extra methyl group donates electron density that makes the carbonyl a better hydride acceptor', role: 'trap', family: 'half-right', trap: 'Donation, read as help', note: 'The methyl does donate electron density. But donation makes the carbonyl carbon less positive, a worse hydride acceptor, not a better one.' }
    ],
    lockIt: 'Aldehydes beat ketones to a nucleophile: one carbon group means more room and more plus charge.',
    hook: null,
    playWith: { label: 'Tree, aldehydes and ketones: switch the substrate between propanal and 2-butanone and run NaBH4 on each', href: TREE, state: { module: 't4-carbonyl', substrate: 'aldehyde', reagent: 'ald_nabh4' }, expect: [], routing: TREE_ROUTE('Aldehydes and ketones', 'the substrate switch and the NaBH4 chip are taps inside it; it shows the product, not the rate') },
    video: VID('oc.carbonyl.hydride-reduction', 'Hydride reductions: who goes first'),
    visual: {
      type: 'stack',
      alt: 'Benzaldehyde and acetophenone, one above the other. The aldehyde carbonyl carbon, outlined as the answer, carries an H and is open and more positive; the ketone carbonyl carbon carries a methyl that crowds it and pushes electrons in.',
      caption: 'Look at what sits beside each C=O carbon: an H on top, a methyl below.',
      panels: [
        { type: 'chem.molecule', smi: 'O=C([H])c1ccccc1', label: 'benzaldehyde: reduced faster', marks: [{ atom: 1, text: 'H beside it: open, more positive', key: true }], reuse: 'SmilesDrawer through the light copy of tools/ochem/tree/draw.js' },
        { type: 'chem.molecule', smi: 'CC(=O)c1ccccc1', label: 'acetophenone: reduced slower', marks: [{ atom: 1, text: 'CH3 beside it: crowded, less positive' }], reuse: 'SmilesDrawer through the light copy of tools/ochem/tree/draw.js' }
      ]
    },
    demoPick: 'Acetophenone is reduced faster because the extra methyl group donates electron density that makes the carbonyl a better hydride acceptor',
    flags: [
      { kind: 'stem-style', text: 'The stem hands over the method ("Considering electronic and steric effects on hydride addition"), a hint. Suggested, not applied: drop that phrase. Key unchanged.' },
      { kind: 'note', text: 'The "NaBH4 reacts only with esters" choice here and the "NaBH4 only reduces esters" choice in fm:organic:oc-163l4so carry the same trap label and family, so the Ace Log counts them as one miss (expert note).' }
    ]
  },

  /* ================================= The hungry carbon: aldehydes and ketones */
  {
    qid: 'fm:organic:oc-163l4so',
    servesAlso: [],
    section: 'ochem',
    subtopic: 'oc.carbonyl.hydride-reduction',
    difficulty: D(2),
    source: FM('organic:oc-163l4so', 26),
    keyText: 'The aldehyde is reduced first because aldehydes are more electrophilic and less sterically hindered than ketones',
    answer: { line: 'With only one equivalent in the cold, NaBH4 goes to the faster carbonyl: the aldehyde, which is more positive and less crowded.' },
    steps: [
      'Find both carbonyls: a ketone at C4 and an aldehyde at C1, the chain end.',
      'Rank them. The aldehyde carbon has one carbon group and an H; the ketone carbon has two carbon groups, more donation and more crowding.',
      'One equivalent at 0 C goes to the faster target. The aldehyde becomes CH2OH and the ketone survives: 5-hydroxypentan-2-one.'
    ],
    choices: [
      { text: 'The aldehyde is reduced first because aldehydes are more electrophilic and less sterically hindered than ketones', role: 'key', note: 'More positive and more open: the aldehyde takes the hydride first.' },
      { text: 'The ketone is reduced first, because the two alkyl groups on a ketone make its carbonyl carbon more electrophilic than an aldehyde carbon', role: 'trap', family: 'reversed', trap: 'Order turned around', note: 'Alkyl groups donate electron density, so the ketone carbon is less positive. The order runs the other way.' },
      { text: 'The aldehyde is reduced first because its carbonyl carbon is the more sterically hindered of the two and binds borohydride more tightly', role: 'trap', family: 'half-right', trap: 'Right carbonyl, reason backward', note: 'The aldehyde does react first. But it is the less hindered of the two, and that openness is part of why.' },
      { text: 'Neither is reduced; NaBH4 only reduces esters', role: 'trap', family: 'reversed', trap: 'Selectivity turned around', note: 'NaBH4 reduces aldehydes and ketones and is too mild for most esters. The selectivity is turned around.' },
      { text: 'Both are reduced equally; NaBH4 shows no selectivity', role: 'trap', family: 'assumed-equal', trap: 'Treated both the same', note: 'NaBH4 does tell them apart. The aldehyde reacts faster, which is exactly why one cold equivalent is used.' }
    ],
    lockIt: 'Limited hydride, two carbonyls: the aldehyde reacts first because it is more positive and less crowded.',
    hook: null,
    playWith: { label: 'Tree, selectivity: pick a molecule and NaBH4 and see which groups it can reach', href: TREE, state: { module: 't6-selectivity', reagent: 'nabh4' }, expect: [], routing: TREE_ROUTE('Selectivity and protecting groups', 'the molecule and reagent pickers are taps inside it; it shows which groups NaBH4 reaches, not which goes first') },
    video: VID('oc.carbonyl.hydride-reduction', 'Hydride reductions: who goes first'),
    visual: {
      type: 'chem.reaction',
      reactants: [{ smi: 'CC(=O)CCC=O', label: '4-oxopentanal', marks: [{ atom: 5, text: 'aldehyde C: first', key: true }, { atom: 1, text: 'ketone C: slower' }] }],
      reagent: 'NaBH4, 1 equiv, 0 C',
      products: [{ smi: 'CC(=O)CCCO', label: '5-hydroxypentan-2-one', marks: [{ atom: 5, text: 'now CH2OH', key: true }] }],
      reuse: 'SmilesDrawer through the light copy of tools/ochem/tree/draw.js',
      alt: '4-Oxopentanal with two carbonyls marked: the aldehyde carbon, outlined, reacts first; the ketone carbon is slower. With one equivalent of NaBH4 at 0 C it gives 5-hydroxypentan-2-one, the aldehyde now CH2OH and the ketone untouched.',
      caption: 'Two carbonyls, one cold equivalent of NaBH4. The open, more positive aldehyde carbon takes the hydride first.'
    },
    demoPick: 'Both are reduced equally; NaBH4 shows no selectivity',
    flags: []
  },
  {
    qid: 'fm:organic:oc-1mc2sbd',
    servesAlso: [],
    section: 'ochem',
    subtopic: 'oc.carbonyl.acetals',
    difficulty: D(2),
    source: FM('organic:oc-1mc2sbd', 7),
    keyText: 'CCC(OC)OC',
    answer: { line: 'Two methanols, an acid catalyst and water leaving in between: the old C=O carbon ends up holding two OCH3 groups, an acetal.' },
    steps: [
      'Protonate the C=O so it is hungrier, and let one methanol add. That gives the hemiacetal: one OH and one OCH3 on the same carbon.',
      'Protonate that OH, let water leave, and a second methanol adds to the cation that is left. Water out, methanol in.',
      'Excess methanol pushes it all the way. Two OCH3 groups on the old carbonyl carbon: 1,1-dimethoxypropane.'
    ],
    choices: [
      { text: 'CCC(O)O', display: 'propane-1,1-diol (the hydrate)', role: 'trap', family: 'neighbor-fact', trap: 'Water added, not methanol', note: 'Two OH groups on one carbon is the hydrate, what water adds to an aldehyde. The nucleophile in this flask is methanol.' },
      { text: 'CCC(=O)OC', display: 'methyl propanoate (an ester)', role: 'trap', family: 'other-conditions', trap: 'Oxidized to an ester', note: 'An ester sits one oxidation level above an aldehyde: you get it from the carboxylic acid and methanol, or with an oxidant. Methanol and acid here only add.' },
      { text: 'CCC(OC)OC', display: '1,1-dimethoxypropane (an acetal)', role: 'key', note: 'Two OCH3 on one carbon, made with water leaving in the middle.' },
      { text: 'CCC(O)OC', display: '1-methoxypropan-1-ol (the hemiacetal)', role: 'trap', family: 'one-step-short', trap: 'Stopped at the hemiacetal', note: 'The hemiacetal is real: it is the first adduct. With excess methanol and acid it keeps going, loses water and becomes the acetal.' },
      { text: 'CCCO', display: 'propan-1-ol', role: 'trap', family: 'other-conditions', trap: 'Needs a hydride', note: 'Propanol is the reduction product, from NaBH4 or LiAlH4. Methanol and acid bring no hydride.' }
    ],
    lockIt: 'Aldehyde plus two alcohols under acid: hemiacetal first, acetal last, water lost in between.',
    hook: null,
    playWith: { label: 'Tree, aldehydes and ketones: pick propanal and the acetal reagent and see the carbon end as C(OR)2', href: TREE, state: { module: 't4-carbonyl', substrate: 'aldehyde', reagent: 'ald_acetal' }, expect: [], routing: TREE_ROUTE('Aldehydes and ketones', 'the substrate switch and the acetal chip are taps inside it') },
    video: VID('oc.carbonyl.acetals', 'Hemiacetals and acetals'),
    visual: {
      type: 'stack',
      alt: 'Two reactions, one above the other. Propanal with methanol and acid gives the hemiacetal, one OH and one OCH3 on the old carbonyl carbon; the hemiacetal with more methanol and acid loses water and gives 1,1-dimethoxypropane, the acetal, outlined with its two OCH3 groups.',
      caption: 'Top row: the stop students make. Bottom row: water leaves and the second methanol finishes the job.',
      panels: [
        { type: 'chem.reaction', reactants: [{ smi: 'CCC=O', label: 'propanal' }], reagent: 'CH3OH, H+', products: [{ smi: 'CCC(O)OC', label: 'hemiacetal: one OH left', marks: [{ atom: 2, text: 'OH and OCH3' }] }], reuse: 'SmilesDrawer through the light copy of tools/ochem/tree/draw.js' },
        { type: 'chem.reaction', reactants: [{ smi: 'CCC(O)OC', label: 'hemiacetal' }], reagent: 'CH3OH, H+, water out', products: [{ smi: 'CCC(OC)OC', label: 'acetal: two OCH3', marks: [{ atom: 2, text: 'two OCH3', key: true }] }], reuse: 'SmilesDrawer through the light copy of tools/ochem/tree/draw.js' }
      ]
    },
    demoPick: 'CCC(O)OC',
    flags: [
      { kind: 'bank-copy', text: 'The bank explanation calls the ester "wrong connectivity", a word the house rules exclude. Key unchanged.' }
    ]
  },

  /* ========================================= The alpha carbon wakes up */
  {
    qid: 'fm:organic:oc-1eq5a2f',
    servesAlso: [],
    section: 'ochem',
    subtopic: 'oc.alpha.claisen-dieckmann',
    difficulty: D(2),
    source: FM('organic:oc-1eq5a2f', 4),
    keyText: 'CCOC(=O)C1CCC(C)C1=O',
    answer: { line: 'Both rings can close, but only this one keeps an H between the two carbonyls. Ethoxide takes it, and that locks the product in.' },
    steps: [
      'Find the two alpha carbons: C2, a CH carrying the methyl, and C5, a CH2. Each can attack the ester at the other end.',
      'Count both rings: each closes five atoms. The C5 enolate leaves a CH between ketone and ester; the C2 enolate leaves a carbon with no H at all.',
      'Dieckmann is reversible until ethoxide pulls that doubly activated H, so a ring without one reopens and drains to the ring that has one. That is the favored ring.'
    ],
    choices: [
      { text: 'CCOC(=O)C1CCCCC1=O', display: 'ethyl 2-oxocyclohexane-1-carboxylate (six-membered ring, no methyl)', role: 'trap', family: 'miscount', trap: 'Methyl folded into the ring', note: 'Same formula as the key, but the methyl carbon was counted into the ring. The chain closes five atoms, and the methyl stays outside.' },
      { text: 'CCOC(=O)C1CCC(C)C1=O', display: 'ethyl 3-methyl-2-oxocyclopentane-1-carboxylate', role: 'key', note: 'The CH2 end attacks, the methyl rides beside the ketone, and an acidic H sits between the two carbonyls.' },
      { text: 'CCOC(=O)C1CCCC1=O', display: 'ethyl 2-oxocyclopentane-1-carboxylate (no methyl)', role: 'trap', family: 'neighbor-fact', trap: 'Lost the methyl', note: 'This is the product from plain diethyl adipate. Here the 2-methyl group has nowhere to go, so it has to show up on the ring.' },
      { text: 'CCOC(=O)C1CC(C)CC1=O', display: 'ethyl 4-methyl-2-oxocyclopentane-1-carboxylate', role: 'trap', family: 'neighbor-fact', trap: 'Methyl one carbon over', note: 'This is one ring a 3-methyl diester could give. Here the methyl sits on an alpha carbon, so it ends up next to a carbonyl, not across the ring.' },
      { text: 'CCOC(=O)C1(C)CCCC1=O', display: 'ethyl 1-methyl-2-oxocyclopentane-1-carboxylate (no H between the carbonyls)', role: 'trap', family: 'close-second', trap: 'Closes, then reopens', note: 'This ring does form. But its carbon between the carbonyls carries the methyl and no H, so ethoxide cannot lock it in, and it reverts.' }
    ],
    lockIt: 'A Dieckmann ends where ethoxide can pull an H from between the two carbonyls.',
    hook: null,
    playWith: { label: 'Tree, the alpha carbon: pick ethyl acetate and the Claisen, the same ester enolate move a Dieckmann makes inside one chain', href: TREE, state: { module: 't4-alpha', substrate: 'ethyl_acetate', reaction: 'claisen' }, expect: [], routing: TREE_ROUTE('Enolates and the alpha carbon', 'the substrate and reaction pickers are taps inside it') },
    video: VID('oc.alpha.claisen-dieckmann', 'Claisen and Dieckmann'),
    visual: {
      type: 'chem.reaction',
      reactants: [{ smi: 'CCOC(=O)C(C)CCCC(=O)OCC', label: 'diethyl 2-methyladipate: C5 or C2 can attack', marks: [{ atom: 9, text: 'C5: attacks', key: true }, { atom: 3, text: 'C=O it hits' }, { atom: 5, text: 'C2' }] }],
      reagent: 'NaOEt, then H3O+',
      products: [
        { smi: 'CCOC(=O)C1CCC(C)C1=O', label: 'favored: an H left between the C=O groups', marks: [{ atom: 5, text: 'H', key: true, labelDir: 90 }] },
        { smi: 'CCOC(=O)C1(C)CCCC1=O', label: 'other closure: no H there, it reopens', marks: [{ atom: 5, text: 'no H here' }] }
      ],
      note: 'Both closures make five-membered rings. Ethoxide pulling the H between the carbonyls is the step that keeps one.',
      reuse: 'SmilesDrawer through the light copy of tools/ochem/tree/draw.js',
      alt: 'Diethyl 2-methyladipate, with its CH2 alpha carbon marked as the attacker, gives two possible five-membered rings with NaOEt. In the favored ring a marked acidic H sits on the carbon between the ketone and the ester; the other closure puts the methyl there, leaves no H, and reopens.',
      caption: 'Look at the carbon between the two C=O groups in each ring. Only one still has an H.'
    },
    demoPick: 'CCOC(=O)C1(C)CCCC1=O',
    flags: [
      { kind: 'letter-cite', text: 'The bank explanation cites "option B" for the quaternary closure (served fifth) and "option A" for the favored product (served second, the key). Students see it on the full-test review screen. Key unchanged.' },
      { kind: 'bank-copy', text: 'The bank explanation keeps an authoring note, "verified to equal the path-B closure". Key unchanged.' },
      { kind: 'tool-gap', text: 'No Ace Labs tool runs a Dieckmann. The play-with link goes to the intermolecular Claisen in the alpha-carbon module.' }
    ]
  },
  {
    qid: 'fm:organic:oc-csbizj',
    servesAlso: [],
    section: 'ochem',
    subtopic: 'oc.alpha.claisen-dieckmann',
    difficulty: D(1),
    source: FM('organic:oc-csbizj', 24),
    keyText: 'O=C1CCCCC1C(=O)OCC',
    answer: { line: 'The alpha carbon attacks the far ester, closing C2 through C7: a six-membered ring, with the other ester left beside the new ketone.' },
    steps: [
      'Find the attacker and the target: the alpha carbon C2, next to one ester, and the C=O carbon C7 of the other ester.',
      'Count the ring they close: C2, C3, C4, C5, C6 and C7, six atoms. C1 stays outside as the ester group.',
      'Ethoxide leaves from C7, which becomes the ring ketone, and the ester on C2 stays: ethyl 2-oxocyclohexane-1-carboxylate.'
    ],
    choices: [
      { text: 'O=C1CCCCC1C(=O)OCC', display: 'ethyl 2-oxocyclohexane-1-carboxylate', role: 'key', note: 'Six-membered ring: pimelate closes six, as adipate closes five.' },
      { text: 'CCOC(=O)CCCCC(=O)CC(=O)OCC', display: 'an open-chain beta-keto diester (no ring)', role: 'trap', family: 'other-conditions', trap: 'Two molecules, not one', note: 'An open chain like this is what a Claisen between two molecules gives. With both esters on one chain, the chain bites its own tail and a ring closes.' },
      { text: 'O=C1CCCC1C(=O)OCC', display: 'ethyl 2-oxocyclopentane-1-carboxylate', role: 'trap', family: 'neighbor-fact', trap: 'The adipate ring', note: 'The five-membered ring comes from diethyl adipate, one carbon shorter. Pimelate has seven chain carbons and closes six.' },
      { text: 'O=C1CCCCCC1C(=O)OCC', display: 'ethyl 2-oxocycloheptane-1-carboxylate', role: 'trap', family: 'miscount', trap: 'All seven counted in', note: 'This counts all seven chain carbons into the ring. The ring runs from C2 to C7; C1 stays outside as the ester.' },
      { text: 'OC1CCCCC1C(=O)OCC', display: 'ethyl 2-hydroxycyclohexane-1-carboxylate', role: 'trap', family: 'one-step-too-far', trap: 'Reduced on the way out', note: 'Turning the ketone into an alcohol needs a hydride like NaBH4. Acid workup only protonates the enolate.' }
    ],
    lockIt: 'Dieckmann ring size: count from the alpha carbon to the other C=O carbon. Adipate closes five, pimelate six.',
    hook: null,
    playWith: { label: 'Tree, the alpha carbon: pick ethyl acetate and the Claisen, the same ester enolate move a Dieckmann makes inside one chain', href: TREE, state: { module: 't4-alpha', substrate: 'ethyl_acetate', reaction: 'claisen' }, expect: [], routing: TREE_ROUTE('Enolates and the alpha carbon', 'the substrate and reaction pickers are taps inside it') },
    video: VID('oc.alpha.claisen-dieckmann', 'Claisen and Dieckmann'),
    visual: {
      type: 'chem.reaction',
      reactants: [{ smi: 'CCOC(=O)CCCCCC(=O)OCC', label: 'diethyl pimelate', marks: [{ atom: 5, text: 'C2: attacks', key: true }, { atom: 10, text: 'C7: attacked' }] }],
      reagent: 'NaOEt, then H3O+',
      products: [{ smi: 'O=C1CCCCC1C(=O)OCC', label: 'ethyl 2-oxocyclohexane-1-carboxylate', marks: [{ atom: 1, text: 'old C7: the ketone', key: true }, { atom: 6, text: 'old C2' }] }],
      reuse: 'SmilesDrawer through the light copy of tools/ochem/tree/draw.js',
      alt: 'Diethyl pimelate with C2, its alpha carbon, marked as the attacker and C7, the far ester carbon, marked as the target. With NaOEt, then acid, it closes ethyl 2-oxocyclohexane-1-carboxylate, a six-membered ring with old C7 as the ketone.',
      caption: 'Count the atoms from the marked C2 to the marked C7. Six atoms, six-membered ring.'
    },
    demoPick: 'O=C1CCCCCC1C(=O)OCC',
    flags: [
      { kind: 'bank-copy', text: 'The bank explanation is only a distractor list ("Distractors: 5-ring, 7-ring, acyclic, beta-hydroxy ester."), with no reasoning for the key. Key unchanged.' },
      { kind: 'tool-gap', text: 'No Ace Labs tool runs a Dieckmann. The play-with link goes to the intermolecular Claisen in the alpha-carbon module.' }
    ]
  },
  {
    qid: 'fm:organic:oc-anc6po',
    servesAlso: [],
    section: 'ochem',
    subtopic: 'oc.alpha.conjugate-addition',
    difficulty: D(2),
    source: FM('organic:oc-anc6po', 11),
    keyText: 'CC(=O)CC(C)c1ccccc1',
    answer: { line: 'A cuprate is a soft nucleophile: it adds 1,4, putting the methyl on the beta carbon, and water gives the ketone back.' },
    steps: [
      'Mark the enone: the C=O carbon, the alpha carbon, and the beta carbon that holds the phenyl.',
      'Me2CuLi adds its methyl to the beta carbon, the 1,4 position. The C=C electrons shift toward oxygen, and an enolate forms.',
      'Water protonates the alpha carbon and the C=O comes back. The C=C is used up: 4-phenylpentan-2-one.'
    ],
    choices: [
      { text: 'CC(=O)CC(C)c1ccccc1', display: '4-phenylpentan-2-one (methyl on the beta carbon)', role: 'key', note: 'Methyl on the beta carbon, ketone kept, C=C gone.' },
      { text: 'CC(O)(C)/C=C/c1ccccc1', display: 'a tertiary allylic alcohol (methyl added to the C=O)', role: 'trap', family: 'other-conditions', trap: 'The organolithium answer', note: 'Adding straight to the C=O is what MeLi or MeMgBr does. The cuprate goes to the far end, 1,4.' },
      { text: 'CC(=O)/C=C(C)/c1ccccc1', display: '4-phenylpent-3-en-2-one (C=C kept)', role: 'trap', family: 'half-right', trap: 'Right carbon, alkene kept', note: 'The methyl is on the right carbon. But conjugate addition spends the C=C, and nothing in the workup puts it back.' },
      { text: 'CC(=O)C(C)Cc1ccccc1', display: '3-methyl-4-phenylbutan-2-one (methyl on the alpha carbon)', role: 'trap', family: 'neighbor-fact', trap: 'Alpha, not beta', note: 'A methyl on the alpha carbon is what an enolate plus CH3I gives. The cuprate attacks the beta carbon.' },
      { text: 'CC(O)CC(C)c1ccccc1', display: '4-phenylpentan-2-ol (C=O reduced too)', role: 'trap', family: 'one-step-too-far', trap: 'Reduced on the way out', note: 'Turning the C=O into an alcohol needs a hydride. The cuprate leaves the ketone alone, and the workup is only water.' }
    ],
    lockIt: 'Gilman cuprates add 1,4 to an enone: R on the beta carbon, ketone kept.',
    hook: 'Hard nucleophiles hit the C=O; soft ones reach the beta carbon.',
    playWith: { label: 'Tree, the alpha carbon: pick the Michael reaction and see the nucleophile land on the beta carbon, 1,4', href: TREE, state: { module: 't4-alpha', reaction: 'michael' }, expect: [], routing: TREE_ROUTE('Enolates and the alpha carbon', 'the reaction picker is a tap inside it; it shows an enolate nucleophile, not a cuprate') },
    video: VID('oc.alpha.conjugate-addition', 'Conjugate addition: 1,2 or 1,4'),
    visual: {
      type: 'chem.reaction',
      reactants: [{ smi: 'CC(=O)/C=C/c1ccccc1', label: 'benzalacetone', marks: [{ atom: 1, text: 'C=O: MeLi lands here' }, { atom: 4, text: 'beta C: cuprate lands here', key: true }] }],
      reagent: '1. Me2CuLi; 2. H2O',
      products: [{ smi: 'CC(=O)CC(C)c1ccccc1', label: '4-phenylpentan-2-one', marks: [{ atom: 5, text: 'new methyl', key: true }] }],
      reuse: 'SmilesDrawer through the light copy of tools/ochem/tree/draw.js',
      alt: 'Benzalacetone with two sites marked: the C=O carbon, where an organolithium adds, and the beta carbon, outlined, where the cuprate adds. With Me2CuLi, then water, it gives 4-phenylpentan-2-one with the new methyl on the beta carbon.',
      caption: 'Two places a methyl could land. The cuprate skips the C=O and takes the far end.'
    },
    demoPick: 'CC(O)(C)/C=C/c1ccccc1',
    flags: [
      { kind: 'stem-style', text: 'The stem capitalizes MAJOR. Suggested, not applied: "major". Key unchanged.' },
      { kind: 'letter-cite', text: 'The bank explanation maps letters B to E to the alpha-methyl, allylic alcohol, reduced and alkene-kept choices; served, they sit fourth, second, fifth and third. Students see it on the full-test review screen. Key unchanged.' },
      { kind: 'bank-copy', text: 'The bank explanation gives no reasoning for the key (no 1,4-addition), ends with the authoring note "Index 0 is correct", and uses "incorrect". The bank has no per-choice notes for this item, so every note here is new. Key unchanged.' }
    ]
  },
  {
    qid: 'fm:organic:oc-zlk3b3',
    servesAlso: [],
    section: 'ochem',
    subtopic: 'oc.alpha.aldol',
    difficulty: D(2),
    source: FM('organic:oc-zlk3b3', 13),
    keyText: 'CC1=CC(=O)CCC1',
    answer: { line: 'The end methyl\'s enolate reaches the other C=O and closes a six-membered ring; warming then loses water to the conjugated enone.' },
    steps: [
      'List the carbons that can become enolates: the two end methyls, C1 and C7, and the CH2 groups beside the carbonyls, C3 and C5.',
      'Count each ring. The C1 enolate attacking the C6 carbonyl closes six atoms; the C3 enolate attacking C6 closes only four, far too strained.',
      'Warming dehydrates the beta-hydroxy ketone and puts the C=C in line with the C=O: 3-methylcyclohex-2-en-1-one.'
    ],
    choices: [
      { text: 'CC1=CC(=O)CC1', display: '3-methylcyclopent-2-en-1-one (five-membered ring)', role: 'trap', family: 'miscount', trap: 'One carbon short', note: 'This five-membered enone comes from hexane-2,5-dione. Heptane-2,6-dione is one carbon longer, so its ring closes six.' },
      { text: 'CC1=CC(=O)CCC1', display: '3-methylcyclohex-2-en-1-one', role: 'key', note: 'Six-membered ring, C=C conjugated with the C=O.' },
      { text: 'O=C1CCCCC1', display: 'cyclohexanone', role: 'trap', family: 'half-right', trap: 'Right ring, pieces missing', note: 'The ring size is right. But the methyl from the second ketone is gone, and so is the C=C that dehydration makes.' },
      { text: 'CC1=CCCC(=O)C1', display: '3-methylcyclohex-3-en-1-one (C=C not conjugated)', role: 'trap', family: 'close-second', trap: 'C=C one spot over', note: 'Right ring, right atoms, but the C=C sits out of line with the C=O. Dehydration gives the conjugated enone, which is more stable.' },
      { text: 'CC1CCCC(=O)C1=O', display: '3-methylcyclohexane-1,2-dione (both C=O kept)', role: 'trap', family: 'other-conditions', trap: 'Kept both carbonyls', note: 'Keeping both C=O groups is what an acylation does, and even then they end up 1,3, not side by side. In an aldol, one C=O is the target and becomes the new C=C.' }
    ],
    lockIt: 'Intramolecular aldol: close the five or six ring, then lose water to the conjugated enone.',
    hook: null,
    playWith: { label: 'Tree, the alpha carbon: pick the aldol condensation and play the move, enolate attack and then water lost', href: TREE, state: { module: 't4-alpha', substrate: 'acetaldehyde', reaction: 'aldol_condensation' }, expect: [], routing: TREE_ROUTE('Enolates and the alpha carbon', 'the substrate and reaction pickers are taps inside it; the aldol there is between two molecules') },
    video: VID('oc.alpha.aldol', 'Aldol and aldol condensation'),
    visual: {
      type: 'chem.reaction',
      reactants: [{ smi: 'CC(=O)CCCC(C)=O', label: 'heptane-2,6-dione', marks: [{ atom: 0, text: 'C1: enolate attacks', key: true }, { atom: 6, text: 'C6: attacked' }, { atom: 3, text: 'C3: would close four' }] }],
      reagent: 'NaOH, warm',
      products: [{ smi: 'CC1=CC(=O)CCC1', label: '3-methylcyclohex-2-en-1-one', marks: [{ atom: 1, text: 'new C=C, in line with C=O', key: true }] }],
      reuse: 'SmilesDrawer through the light copy of tools/ochem/tree/draw.js',
      alt: 'Heptane-2,6-dione with three carbons marked: C1, whose enolate attacks; C6, the carbonyl it attacks; and C3, which would close only a four-membered ring. With NaOH and warming it gives 3-methylcyclohex-2-en-1-one, its C=C in line with the C=O.',
      caption: 'Count from C1 to C6: six atoms. From C3 you get four, too strained to close.'
    },
    demoPick: 'CC1=CC(=O)CC1',
    flags: [
      { kind: 'stem-style', text: 'The stem names the reaction ("(intramolecular aldol condensation)"), a hint. Suggested, not applied: drop the parenthesis. Key unchanged.' },
      { kind: 'letter-cite', text: 'The bank explanation says "Keyed option A"; the key is served second and the first choice is the five-membered enone. Students see it on the full-test review screen. Key unchanged.' },
      { kind: 'bank-copy', text: 'The bank explanation keeps authoring notes: "verified identical to O=C1CCCC(C)=C1" and "All valid, unique". Key unchanged.' }
    ]
  },
  {
    qid: 'fm:organic:oc-1boz2p7',
    servesAlso: [],
    section: 'ochem',
    subtopic: 'oc.alpha.decarboxylation',
    difficulty: D(2),
    source: FM('organic:oc-1boz2p7', 20),
    keyText: 'Only the beta-keto acid decarboxylates readily on heating; the gamma-keto acid does not, because its carbonyl is too far for a six-membered cyclic transition state',
    answer: { line: 'Easy loss of CO2 needs a C=O beta to the acid, so the H passes through a six-membered ring. Only the beta-keto acid has that.' },
    steps: [
      'Draw the ring the H travels through: the acid H, its O, the carboxyl carbon, the alpha carbon, the ketone carbon and the ketone O. Six atoms.',
      'Count it for each acid. The beta-keto acid closes six; the gamma-keto acid would need seven, and its geometry does not fit.',
      'So only the beta-keto acid loses CO2 on warming, through an enol that becomes acetophenone. Levulinic acid keeps its carboxyl.'
    ],
    choices: [
      { text: 'The gamma-keto acid decarboxylates faster, because the extra distance between its carbonyl and its carboxyl relieves strain in the cyclic transition state that delivers the proton', role: 'trap', family: 'reversed', trap: 'More room read as easier', note: 'The six-membered ring is already strain-free. Adding a carbon does not relieve anything; it breaks the ring the H needs.' },
      { text: 'Both decarboxylate equally well because both contain a ketone', role: 'trap', family: 'assumed-equal', trap: 'Any ketone will do', note: 'Having a ketone is not enough. Its place, beta to the acid, is what lets the H transfer through the ring.' },
      { text: 'Neither decarboxylates; a ketone cannot assist loss of CO2', role: 'trap', family: 'neighbor-fact', trap: 'True of plain acids', note: 'An ordinary carboxylic acid with no beta carbonyl does hold on to its CO2. A beta ketone is exactly what makes the loss easy.' },
      { text: 'Only the gamma-keto acid decarboxylates, because only its carbonyl and carboxyl are spaced to close a ring, and the product is a cyclic lactone rather than a simple ketone', role: 'trap', family: 'half-right', trap: 'A ring, not this one', note: 'Gamma-keto acids can close toward lactone-type rings, but that keeps the carbon: no CO2 is lost. The beta-keto acid is the one that decarboxylates.' },
      { text: 'Only the beta-keto acid decarboxylates readily on heating; the gamma-keto acid does not, because its carbonyl is too far for a six-membered cyclic transition state', role: 'key', note: 'Beta puts the C=O where the six-membered ring can form; gamma puts it one carbon too far.' }
    ],
    lockIt: 'Only a beta-keto acid, or a malonic acid, loses CO2 easily on heating: the H moves through a six-membered ring.',
    hook: null,
    playWith: { label: 'Tree, the alpha carbon: pick the beta-keto acid and the decarboxylation, and play the move', href: TREE, state: { module: 't4-alpha', substrate: 'betaketoacid', reaction: 'decarboxylation' }, expect: [], routing: TREE_ROUTE('Enolates and the alpha carbon', 'the substrate and reaction pickers are taps inside it') },
    video: VID('oc.alpha.decarboxylation', 'Decarboxylation: the six-membered ring'),
    visual: {
      type: 'stack',
      alt: 'One step with curved arrows: in 3-oxo-3-phenylpropanoic acid the ketone O takes the acid H through a six-membered ring as CO2 leaves, giving an enol and CO2. Below, levulinic acid with its ketone O marked one carbon too far to close that ring.',
      caption: 'Count the atoms in the loop the H travels: six for the beta-keto acid, seven for levulinic acid.',
      panels: [
        { type: 'chem.mechanism', fig: DECARBOX, fromStem: false, showProduct: true, reuse: 'drawChain() in tools/ochem/tree/mechdraw.js; arrows pushed in RDKit by scripts/ochem2026/verify.py (build). The beta-keto acid is named in the stem; the drawn stem molecule is the gamma-keto acid, shown below' },
        { type: 'chem.molecule', smi: 'CC(=O)CCC(=O)O', label: 'levulinic acid, the gamma-keto acid', marks: [{ atom: 2, text: 'ketone O: one carbon too far' }, { atom: 7, text: 'acid H' }], reuse: 'SmilesDrawer through the light copy of tools/ochem/tree/draw.js' }
      ]
    },
    demoPick: 'Both decarboxylate equally well because both contain a ketone',
    flags: []
  },

  /* ================================ Pay twice, plus the acidic H: alkynes */
  {
    qid: 'fm:organic:oc-1mnmhwn',
    servesAlso: [],
    section: 'ochem',
    subtopic: 'oc.alkynes.hydration',
    difficulty: D(2),
    source: FM('organic:oc-1mnmhwn', 19),
    keyText: 'A roughly equal mixture of two regioisomeric ketones (2-pentanone and 3-pentanone) forms, because neither alkyne carbon is strongly favored',
    answer: { line: 'Each alkyne carbon carries one alkyl group, so water has no favorite end. Oxygen lands on C2 about as often as on C3: two ketones.' },
    steps: [
      'Name the reaction. Water with HgSO4 and H2SO4 adds across the triple bond Markovnikov style, giving an enol that turns into a ketone.',
      'Compare the two alkyne carbons. One carries a methyl, the other an ethyl: each has one alkyl group, so neither is clearly more substituted.',
      'With no favorite, oxygen goes to C2 or C3 in about equal amounts: 2-pentanone and 3-pentanone.'
    ],
    choices: [
      { text: 'A carboxylic acid forms by oxidative cleavage of the triple bond', role: 'trap', family: 'other-conditions', trap: 'Cut instead of hydrated', note: 'Cleaving an alkyne to acids is what ozone or hot KMnO4 does. Mercury and acid only add water.' },
      { text: 'A single aldehyde forms, because Markovnikov addition of water to an internal alkyne always delivers the oxygen to a chain-end carbon of the molecule', role: 'trap', family: 'neighbor-fact', trap: 'The terminal-alkyne answer', note: 'An aldehyde comes from a terminal alkyne by hydroboration. An internal alkyne has no end carbon in the triple bond to put the oxygen on.' },
      { text: 'A roughly equal mixture of two regioisomeric ketones (2-pentanone and 3-pentanone) forms, because neither alkyne carbon is strongly favored', role: 'key', note: 'Two equally substituted carbons, two ketones in about equal amounts.' },
      { text: 'No reaction occurs, because internal alkynes are unreactive toward Hg(II)/acid', role: 'trap', family: 'neighbor-fact', trap: 'Only terminal ones react', note: 'The textbook example is a terminal alkyne, which is where this idea comes from. Internal alkynes hydrate too.' },
      { text: 'Only 2-pentanone forms, because Markovnikov addition always places the carbonyl oxygen on C2, the alkyne carbon carrying the shorter alkyl chain', role: 'trap', family: 'half-right', trap: 'Half the mixture', note: '2-Pentanone does form. But Markovnikov has nothing to choose between two equally substituted carbons, so 3-pentanone forms too.' }
    ],
    lockIt: 'Alkyne hydration gives ketones; an internal alkyne with similar ends gives both regioisomers.',
    hook: null,
    playWith: { label: 'Tree, alkyne reactions: on the terminal board tap H2O, H2SO4, HgSO4 and see where the oxygen sits when one end is favored', href: TREE, state: { module: 't4-alkyne', tab: 'alkyne_terminal', reagent: 'alkyne_hg_h2o' }, expect: [], routing: TREE_ROUTE('Alkyne reactions', 'the terminal board and the HgSO4 chip are taps inside it; the internal board has no hydration chip') },
    video: VID('oc.alkynes.hydration', 'Alkyne hydration: the enol and the ketone'),
    visual: {
      type: 'chem.reaction',
      reactants: [{ smi: 'CC#CCC', label: '2-pentyne', marks: [{ atom: 1, text: 'C2: one alkyl' }, { atom: 2, text: 'C3: one alkyl' }] }],
      reagent: 'H2O, HgSO4, H2SO4',
      products: [
        { smi: 'CC(=O)CCC', label: '2-pentanone, about half', marks: [{ atom: 1, text: 'O on C2', key: true }] },
        { smi: 'CCC(=O)CC', label: '3-pentanone, about half', marks: [{ atom: 2, text: 'O on C3', key: true }] }
      ],
      note: 'Both alkyne carbons carry one alkyl group, so neither end is favored.',
      reuse: 'SmilesDrawer through the light copy of tools/ochem/tree/draw.js',
      alt: '2-Pentyne with its two alkyne carbons marked, each holding one alkyl group, reacts with water, HgSO4 and H2SO4 to give two ketones in about equal amounts: 2-pentanone, with O on C2, and 3-pentanone, with O on C3, both outlined as the answer.',
      caption: 'Two alkyne carbons, one alkyl each. With no favorite end, both ketones come out.'
    },
    demoPick: 'Only 2-pentanone forms, because Markovnikov addition always places the carbonyl oxygen on C2, the alkyne carbon carrying the shorter alkyl chain',
    flags: [
      { kind: 'stem-style', text: 'The stem capitalizes inside a word ("UNsymmetrical"). Suggested, not applied: "unsymmetrical". Key unchanged.' },
      { kind: 'tool-gap', text: 'The alkyne module\'s internal board has Lindlar, Na/NH3 and ozone but no HgSO4 hydration, so the play-with link shows hydration on a terminal alkyne.' }
    ]
  },
  {
    qid: 'fm:organic:oc-1rhxjv',
    servesAlso: [],
    section: 'ochem',
    subtopic: 'oc.alkynes.synthesis',
    difficulty: D(2),
    source: FM('organic:oc-1rhxjv', 29),
    keyText: 'CC/C=C\\CCCC',
    answer: { line: 'NaNH2 makes the acetylide, ethyl bromide adds two carbons, and Lindlar adds H2 to one face and stops: cis-oct-3-ene.' },
    steps: [
      'Start with the acidic H. The terminal C-H of 1-hexyne, pKa about 25, goes to NaNH2 and leaves an acetylide anion.',
      'The acetylide does SN2 on CH3CH2Br and adds two carbons: oct-3-yne, with the triple bond starting at C3, counted from the ethyl end.',
      'Lindlar\'s poisoned catalyst adds both H to one face and quits at the alkene. One face means cis.'
    ],
    choices: [
      { text: 'C/C=C\\CCCCC', display: 'cis-oct-2-ene', role: 'trap', family: 'miscount', trap: 'C=C one spot over', note: 'Cis and eight carbons are right, but the C=C sits at C2, with one carbon on the short side. Ethyl bromide puts two carbons there, so the C=C sits at C3.' },
      { text: 'CCCCCCCC', display: 'octane', role: 'trap', family: 'one-step-too-far', trap: 'Did not stop', note: 'Octane is what plain H2 with Pd or Pt gives: two additions. Lindlar is poisoned so it stops after one.' },
      { text: 'CCC#CCCCC', display: 'oct-3-yne', role: 'trap', family: 'one-step-short', trap: 'Stopped after step 2', note: 'This is the product of steps 1 and 2. Step 3 has not touched it yet.' },
      { text: 'CC/C=C\\CCCC', display: 'cis-oct-3-ene', role: 'key', note: 'Two carbons added, then one H2 to one face: cis at C3.' },
      { text: 'CC/C=C/CCCC', display: 'trans-oct-3-ene', role: 'trap', family: 'other-conditions', trap: 'The sodium answer', note: 'Trans comes from sodium in liquid ammonia. Lindlar gives cis.' }
    ],
    lockIt: 'Lindlar stops at the cis alkene; sodium in ammonia stops at trans; H2 with Pd goes on to the alkane.',
    hook: null,
    playWith: { label: 'Tree, alkyne reactions: tap NaNH2, then CH3Br on the terminal board, then H2, Lindlar on the internal board', href: TREE, state: { module: 't4-alkyne', tab: 'alkyne_terminal', reagent: 'alkyne_alkylation' }, expect: [], routing: TREE_ROUTE('Alkyne reactions', 'the two boards and their chips are taps inside it') },
    video: VID('oc.alkynes.synthesis', 'Building with alkynes: the acetylide and Lindlar'),
    visual: {
      type: 'stack',
      alt: 'Two reactions. 1-Hexyne, its acidic terminal H marked, takes NaNH2 and then ethyl bromide to become oct-3-yne; oct-3-yne with H2 and Lindlar catalyst becomes cis-oct-3-ene, outlined, with both new H on one side of the C=C.',
      caption: 'Top row builds the chain, bottom row sets the geometry. Lindlar adds once, from one side.',
      panels: [
        { type: 'chem.reaction', reactants: [{ smi: 'C#CCCCC', label: '1-hexyne', marks: [{ atom: 0, text: 'acidic H, pKa 25', key: true }] }], reagent: '1. NaNH2; 2. CH3CH2Br', products: [{ smi: 'CCC#CCCCC', label: 'oct-3-yne: two carbons added', marks: [{ atom: 1, text: 'from ethyl bromide' }] }], reuse: 'SmilesDrawer through the light copy of tools/ochem/tree/draw.js' },
        { type: 'chem.reaction', reactants: [{ smi: 'CCC#CCCCC', label: 'oct-3-yne' }], reagent: 'H2, Lindlar', products: [{ smi: 'CC/C=C\\CCCC', label: 'cis-oct-3-ene', marks: [{ atom: 2, text: 'both H on one side', key: true }] }], reuse: 'SmilesDrawer through the light copy of tools/ochem/tree/draw.js' }
      ]
    },
    demoPick: 'CC/C=C/CCCC',
    flags: [
      { kind: 'letter-cite', text: 'The bank explanation cites served indexes that point elsewhere ("[3] is the alkyne": index 3 is the key; "[4] is cis-2-octene": index 4 is the trans 3-ene) and uses "wrong position". Students see it on the full-test review screen. Key unchanged.' }
    ]
  },

  /* ================================ The only reaction in organic chemistry */
  {
    qid: 'fm:originals:ab-13b7fabf1b',
    servesAlso: [],
    section: 'ochem',
    subtopic: 'oc.acid-base.pka-direction',
    difficulty: D(3),
    source: FM('originals:ab-13b7fabf1b', 2),
    keyText: 'Sodium amide, NaNH2 (the pKa of ammonia is about 38)',
    answer: { line: 'Amide\'s partner, ammonia, is a far weaker acid than the alkyne, so the proton moves over and stays.' },
    steps: [
      'Cross out the sodium. The real base is the anion, and its partner acid is the number in parentheses.',
      'Compare each partner with the alkyne at 25. A proton moves toward the weaker acid, the one with the higher pKa.',
      'Ammonia at 38 sits 13 units above the alkyne, so amide takes the proton essentially completely. Water and ethanol at 16 sit below it, so they hand it back.'
    ],
    choices: [
      { text: 'Sodium bicarbonate, NaHCO3 (the pKa of carbonic acid is about 6)', role: 'trap', family: 'reversed', trap: 'Read the scale upside down', note: 'Carbonic acid at 6 is a far stronger acid than the alkyne. Bicarbonate is a weak base; the alkyne proton never leaves for it.' },
      { text: 'Sodium acetate (the pKa of acetic acid is about 5)', role: 'trap', family: 'reversed', trap: 'Low pKa read as strong', note: 'Acetic acid at 5 is stronger still. Its anion is one of the weakest bases here, about 20 units short.' },
      { text: 'Sodium hydroxide, NaOH (the pKa of water is about 16)', role: 'trap', family: 'close-second', trap: 'Strong in general chemistry', note: 'Hydroxide feels strong, but water at 16 is a stronger acid than the alkyne at 25. The equilibrium sits on the alkyne side.' },
      { text: 'Sodium amide, NaNH2 (the pKa of ammonia is about 38)', role: 'key', note: 'Ammonia at 38 is the weakest acid in the set, so its anion pulls the alkyne proton for good.' },
      { text: 'Sodium ethoxide, NaOEt (the pKa of ethanol is about 16)', role: 'trap', family: 'close-second', trap: 'Strong enough for enolates', note: 'Ethoxide makes enolates and runs E2, so it feels strong. Ethanol at 16 is still the stronger acid, so the alkyne stays mostly protonated.' }
    ],
    lockIt: 'A base takes a proton for good only when its own partner acid has the higher pKa.',
    hook: null,
    playWith: { label: 'Tree, proton transfers: tap Alkyne + NaNH2 to see amide take the alkyne proton, with both pKa values', href: TREE, state: { module: 't5-proton', reaction: 'alkyne' }, expect: [], routing: TREE_ROUTE('Proton transfer arrows and acid catalysis', 'the Alkyne + NaNH2 chip is a tap inside it') },
    video: VID('oc.acid-base.pka-direction', 'Acid-base: the proton goes to the weaker acid side'),
    visual: {
      type: 'chem.reaction',
      reactants: [{ smi: 'C#CCCCC', label: 'a terminal alkyne (1-hexyne)', marks: [{ atom: 0, text: 'sp C-H, pKa 25', key: true }] }],
      reagent: 'NaNH2',
      products: [{ smi: '[C-]#CCCCC', label: 'the acetylide' }, { smi: 'N', label: 'ammonia, pKa 38' }],
      ladder: { heading: 'Partner acids, weakest acid on top', order: ['ammonia, 38: amide keeps the H', 'the alkyne, 25: the line to beat', 'water and ethanol, 16', 'carbonic acid 6, acetic acid 5'], key: 0, mark: 'works' },
      reuse: 'SmilesDrawer through the light copy of tools/ochem/tree/draw.js; the ladder lists the pKa values the choices give',
      alt: '1-Hexyne, its terminal sp C-H marked pKa 25, reacts with NaNH2 to give the acetylide and ammonia. Below, a ladder of partner acids by pKa puts ammonia at 38 on top, outlined, then the alkyne at 25, water and ethanol at 16, and carbonic and acetic acids at 6 and 5.',
      caption: 'Find 25 on the ladder. Only a partner acid above it lets the base keep the proton.'
    },
    demoPick: 'Sodium hydroxide, NaOH (the pKa of water is about 16)',
    flags: [
      { kind: 'note', text: 'The stem names no particular alkyne; the picture draws 1-hexyne as the example (the alkyne of question 99) and says so in its label.' }
    ]
  },
  {
    qid: 'fm:organic:oc-yraq7h',
    servesAlso: [],
    section: 'ochem',
    subtopic: 'oc.acid-base.amine-basicity',
    difficulty: D(2),
    source: FM('organic:oc-yraq7h', 22),
    keyText: 'Anilinium; its conjugate base aniline has the N lone pair delocalized into the benzene ring, making aniline a weak base and anilinium the strongest acid',
    answer: { line: 'Judge each acid by its base. Aniline\'s lone pair spreads into the ring, so aniline is the weakest base and anilinium the strongest acid.' },
    steps: [
      'Turn each acid into its base by taking off the N-H proton: aniline, pyridine and methylamine.',
      'Rank the bases: aniline\'s lone pair spreads into the ring, so it is the weakest. Pyridine\'s sp2 pair is held close to N, and methylamine\'s sits free, pushed by a methyl.',
      'Weakest base, strongest acid. Anilinium, about 4.6, edges out pyridinium, about 5.2; methylammonium, about 10.6, is the weakest acid of the three.'
    ],
    choices: [
      { text: 'All three have identical pKa because each loses an N-H proton', role: 'trap', family: 'assumed-equal', trap: 'Same proton, same pKa', note: 'The proton is the same, but what is left behind is not. The three bases hold their lone pairs very differently.' },
      { text: 'Anilinium; its conjugate base aniline has the N lone pair delocalized into the benzene ring, making aniline a weak base and anilinium the strongest acid', role: 'key', note: 'The ring soaks up aniline\'s lone pair, so anilinium lets its proton go most easily.' },
      { text: 'Methylammonium; a primary amine cation is always the most acidic', role: 'trap', family: 'reversed', trap: 'Ranking turned around', note: 'Methylammonium is the weakest acid here, because methylamine, with its lone pair free, is the strongest base.' },
      { text: 'Pyridinium; the aromatic ring feeds electron density to nitrogen and makes pyridine a stronger base than methylamine', role: 'trap', family: 'close-second', trap: 'Close number, backward reason', note: 'Pyridinium, about 5.2, really is close. But its reason runs backward: pyridine is a much weaker base than methylamine, not a stronger one.' },
      { text: 'Methylammonium; the alkyl group\'s electron donation makes methylamine the weakest base of the three, which leaves its cation as the strongest acid of the set by a wide margin', role: 'trap', family: 'half-right', trap: 'Donation, read backward', note: 'Alkyl groups do donate electron density. That makes methylamine the strongest base here, so its cation is the weakest acid.' }
    ],
    lockIt: 'The strongest acid leaves the weakest, most stabilized base. Judge the base, not the acid.',
    hook: null,
    playWith: { label: 'Roots, judge the base, not the acid: strip the proton and run CARDIO on what is left', href: ROOTS, state: { root: 'l2-acidity' }, expect: [], routing: ROOT_ROUTE('Judge the base, not the acid (l2-acidity)') },
    video: VID('oc.acid-base.amine-basicity', 'Amines as bases: where the lone pair lives'),
    visual: {
      type: 'chem.molecule',
      smi: 'Nc1ccccc1',
      label: 'aniline, the base anilinium leaves',
      marks: [{ atom: 0, text: 'lone pair spread into the ring', key: true, labelDir: 65 }],
      ladder: { heading: 'Acid strength, strongest first', order: ['anilinium, about 4.6: aniline is the weakest base', 'pyridinium, about 5.2: pair held close in an sp2 orbital', 'methylammonium, about 10.6: pair free, pushed by CH3'], key: 0, mark: 'strongest' },
      reuse: 'SmilesDrawer through the light copy of tools/ochem/tree/draw.js; textbook pKa values',
      alt: 'Aniline with its nitrogen lone pair marked as spread into the benzene ring. Below, a ladder ranks the three acids from strongest: anilinium at about 4.6, outlined, then pyridinium at about 5.2, then methylammonium at about 10.6.',
      caption: 'Start at the nitrogen of aniline: its pair is busy with the ring. That puts anilinium at the top of the ladder.'
    },
    demoPick: 'Pyridinium; the aromatic ring feeds electron density to nitrogen and makes pyridine a stronger base than methylamine',
    flags: [
      { kind: 'stem-style', text: 'The stem capitalizes WEAKEST, states the principle ("reflecting the WEAKEST/most-stabilized conjugate base") and uses slash shorthand. Suggested, not applied: "Which is the strongest acid (lowest pKa)?" Key unchanged.' },
      { kind: 'note', text: 'The deciding gap, anilinium about 4.6 against pyridinium about 5.2, is narrow; the pyridinium choice also gives a reason that runs backward, so it is still clearly out. The explainer teaches the lone-pair reasoning first (expert note).' }
    ]
  },

  /* ================================== Reading the machines: spectroscopy, lab */
  {
    qid: 'fm:organic:oc-1lfvsj4',
    servesAlso: [],
    section: 'ochem',
    subtopic: 'oc.spectroscopy.ir',
    difficulty: D(2),
    source: FM('organic:oc-1lfvsj4', 3),
    keyText: 'The O-H stretch is broadened and shifted to LOWER wavenumber (below ~3200 cm-1)',
    answer: { line: 'The H-bond pulls on the hydrogen and weakens the O-H bond. A weaker bond vibrates lower, and a spread of strengths smears the band broad.' },
    steps: [
      'Picture the ring. The phenol H reaches over to the aldehyde O and closes a six-membered ring, and that hold stays even in dilute solution.',
      'Ask what a hold does to a bond. Sharing the H with a second oxygen weakens the O-H bond, and a weaker bond vibrates at lower wavenumber.',
      'The hold is never one fixed strength, so the band smears out. Broad and low, below about 3200, instead of sharp near 3600.'
    ],
    choices: [
      { text: 'The O-H stretch becomes a sharp doublet, much like the two N-H bands of a primary aromatic amine', role: 'trap', family: 'neighbor-fact', trap: 'Borrowed from NH2', note: 'Two sharp bands belong to an NH2 group, two N-H bonds stretching together and apart. An O-H has one H, so it gives one band.' },
      { text: 'The O-H band moves to ~2250 cm-1, overlapping the nitrile region', role: 'trap', family: 'neighbor-fact', trap: 'Moved into the triple-bond zone', note: 'Near 2250 is where C-N and C-C triple bonds absorb. An H-bond lowers the O-H stretch, but nowhere near that far.' },
      { text: 'The O-H stretch sharpens and shifts to HIGHER wavenumber (above 3600 cm-1)', role: 'trap', family: 'reversed', trap: 'The free O-H picture', note: 'Sharp and above 3600 is a free O-H, one with no H-bond, as in a dilute simple phenol. Bonding sends the band the other way.' },
      { text: 'The O-H stretch disappears entirely from the spectrum once the internal hydrogen bond forms', role: 'trap', family: 'one-step-too-far', trap: 'Shifted is not gone', note: 'The band moves and spreads, sometimes under the C-H bands, but the O-H bond is still there and still absorbs.' },
      { text: 'The O-H stretch is broadened and shifted to LOWER wavenumber (below ~3200 cm-1)', role: 'key', note: 'Broad and below 3200: the signature of an O-H held by a hydrogen bond.' }
    ],
    lockIt: 'Hydrogen bonding weakens O-H: the stretch moves lower and turns broad.',
    hook: 'An H-bonded O-H is the tongue: wide, rounded, low.',
    playWith: { label: 'Tree, IR: tap the bands of phenol and benzaldehyde to name each one, the O-H tongue included', href: TREE, state: { module: 't7-ir', molecules: ['phenol', 'benzaldehyde'] }, expect: [], routing: TREE_ROUTE('IR: the tongue and the dagger', 'the molecule picker and the band taps are inside it') },
    video: VID('oc.spectroscopy.ir', 'IR: the tongue and the dagger'),
    visual: {
      type: 'chem.spectrum',
      kind: 'ir',
      range: [4000, 1500],
      traces: [
        { label: 'A simple phenol, dilute: free O-H', bands: [{ group: 'O-H free', at: 3610, width: 50, depth: 0.62, text: 'sharp, near 3600' }] },
        { label: 'Salicylaldehyde: O-H held by the H-bond', key: true, bands: [{ group: 'O-H chelated', at: 3150, width: 430, depth: 0.5, text: 'broad, below 3200', key: true }] }
      ],
      shift: { from: 3610, to: 3200, text: 'lower and broader' },
      zones: [{ group: 'triple bonds', from: 2100, to: 2260, text: 'triple bonds, 2250' }],
      note: 'Only the O-H band is drawn; the ring, C-H and C=O bands are left out.',
      reuse: 'new: chem.spectrum in tools/explain/visuals/chem-oc.js; band places checked against IR landmark windows by the build',
      alt: 'Two IR traces with higher wavenumber on the left. A simple phenol in dilute solution shows a sharp O-H dip near 3600; salicylaldehyde shows its O-H as a broad, outlined dip below 3200, and the triple-bond zone near 2250 stays empty.',
      caption: 'Follow the arrow from the sharp free O-H to the broad, low band the H-bond makes.'
    },
    demoPick: 'The O-H stretch sharpens and shifts to HIGHER wavenumber (above 3600 cm-1)',
    flags: [
      { kind: 'stem-style', text: 'Two choices capitalize for emphasis (HIGHER, LOWER). Bank text, flag only. Suggested, not applied: "higher", "lower". Key unchanged.' },
      { kind: 'note', text: 'The stem compares with "a simple phenol". Neat phenol also shows a broad band near 3350 from H-bonds between molecules; the explainer\'s comparison trace says dilute, where the free O-H sits sharp near 3600.' }
    ]
  },
  {
    qid: 'fm:organic:oc-1olhj21',
    servesAlso: [],
    section: 'ochem',
    subtopic: 'oc.lab.extraction',
    difficulty: D(1),
    source: FM('organic:oc-1olhj21', 25),
    keyText: 'Aqueous HCl',
    answer: { line: 'Aniline is a base. Acid turns it into anilinium chloride, a salt, and salts move into water while the neutral impurity stays in the ether.' },
    steps: [
      'Name what aniline is: a weak base, with a lone pair on N ready for a proton.',
      'To charge a base, add an acid. Aqueous HCl protonates the nitrogen and makes anilinium chloride.',
      'Charged things go to the water layer. The neutral hydrocarbon has nothing to grab a proton with, so it stays in the ether on top.'
    ],
    choices: [
      { text: 'Aqueous NaHCO3', role: 'trap', family: 'neighbor-fact', trap: 'The acid puller', note: 'Bicarbonate is the wash that pulls a carboxylic acid out of ether. Aniline stays neutral with a base, so it stays put.' },
      { text: 'Aqueous HCl', role: 'key', note: 'Acid charges the base: anilinium chloride moves into the water.' },
      { text: 'Brine', role: 'trap', family: 'neighbor-fact', trap: 'A drying wash', note: 'Brine pulls dissolved water out of the organic layer and breaks emulsions. It changes no charges, so it separates nothing here.' },
      { text: 'Anhydrous MgSO4', role: 'trap', family: 'neighbor-fact', trap: 'The drying step', note: 'MgSO4 dries the organic layer at the end of a workup. It is a solid drying agent and moves nothing into water.' },
      { text: 'Aqueous NaOH', role: 'trap', family: 'reversed', trap: 'Base for a base', note: 'NaOH deprotonates acids, like phenols and carboxylic acids. A base needs the opposite, an acid, to become a salt.' }
    ],
    lockIt: 'To pull a compound into water, charge it: acid for an amine, base for an acid.',
    hook: null,
    playWith: { label: 'Tree, lab techniques: put aniline in the separatory funnel and shake with aqueous HCl', href: TREE, state: { module: 't7-lab', compound: 'aniline', wash: 'hcl' }, expect: [], routing: TREE_ROUTE('Lab theory and techniques', 'the funnel contents and the wash are taps inside it') },
    video: VID('oc.lab.extraction', 'Extraction: charge it to move it'),
    visual: {
      type: 'chem.reaction',
      reactants: [{ smi: 'Nc1ccccc1', label: 'aniline, in ether', marks: [{ atom: 0, text: 'lone pair takes H+', key: true, labelDir: 65 }] }],
      reagent: 'aqueous HCl',
      products: [{ smi: '[NH3+]c1ccccc1.[Cl-]', label: 'anilinium chloride, now in the water', marks: [{ atom: 0, text: 'charged: water layer', key: true }] }],
      note: 'Ether sits on top of water. The charged salt drops into the water layer; the neutral hydrocarbon stays in the ether.',
      reuse: 'SmilesDrawer through the light copy of tools/ochem/tree/draw.js',
      alt: 'Aniline, its nitrogen lone pair marked, reacts with aqueous HCl to give anilinium chloride, marked as charged and bound for the water layer. A note says ether sits on top and the neutral hydrocarbon stays there.',
      caption: 'Watch the nitrogen pick up the proton. Once it is charged, it belongs to the water.'
    },
    demoPick: 'Aqueous NaOH',
    flags: []
  },

  /* =========================================== The ring that refuses: aromatics */
  {
    qid: 'fm:organic:oc-qn8vo7',
    servesAlso: [],
    section: 'ochem',
    subtopic: 'oc.aromatics.directing-effects',
    difficulty: D(1),
    source: FM('organic:oc-qn8vo7', 10),
    keyText: 'Deactivating but ortho/para directing; the acyl group enters mainly para',
    answer: { line: 'Bromine pulls electrons through the sigma bond and slows the ring, but its lone pair steers the newcomer ortho and para. Bulk picks para.' },
    steps: [
      'Split the two effects. By induction, bromine pulls electron density out and slows every attack; by resonance, a bromine lone pair helps only the ortho and para attacks.',
      'Induction decides the speed, so bromobenzene is deactivated. Resonance decides the place, so the group goes ortho or para.',
      'The acylium ion is bulky, and ortho sits right beside the bromine. Para is open, so para is the main product.'
    ],
    choices: [
      { text: 'Activating and meta directing; the acyl group enters mainly meta', role: 'trap', family: 'reversed', trap: 'Both halves flipped', note: 'Both halves run the other way: bromine slows the ring and directs ortho and para.' },
      { text: 'Deactivating and ortho/para directing; the acyl group enters mainly ortho only', role: 'trap', family: 'half-right', trap: 'Right class, crowded spot', note: 'The classification holds. But ortho sits next to bromine and the acylium is bulky, so para is the main product, not ortho.' },
      { text: 'Deactivating but ortho/para directing; the acyl group enters mainly para', role: 'key', note: 'Deactivating by induction, ortho/para by resonance, para by room.' },
      { text: 'Deactivating and meta directing; the acyl group enters mainly meta', role: 'trap', family: 'missed-exception', trap: 'The usual rule, misapplied', note: 'Most deactivators do direct meta. Halogens are the one class that breaks that rule, because the lone pair still donates by resonance.' },
      { text: 'Activating and ortho/para directing; the acyl group enters mainly para', role: 'trap', family: 'half-right', trap: 'Ortho/para read as activating', note: 'Direction and position hold. But ortho/para does not make bromine an activator; its pull still slows the ring.' }
    ],
    lockIt: 'Halogens are deactivating by induction and ortho/para directing by resonance.',
    hook: null,
    playWith: { label: 'Tree, aromatic rings: pick bromobenzene and open the directing map', href: TREE, state: { module: 't4-aromatic', ring: 'bromobenzene', view: 'directing map' }, expect: [], routing: TREE_ROUTE('Aromatic rings and EAS', 'the ring picker and the directing map are taps inside it') },
    video: VID('oc.aromatics.directing-effects', 'Directing effects: speed and place'),
    visual: {
      type: 'chem.molecule',
      smi: 'Brc1ccccc1',
      label: 'bromobenzene',
      marks: [{ atom: 4, text: 'para: main', key: true }, { atom: 2, text: 'ortho: crowded' }, { atom: 3, text: 'meta: no help' }],
      note: 'Induction slows the whole ring. The lone pair helps only ortho and para, and the bulky acyl group takes para.',
      reuse: 'SmilesDrawer through the light copy of tools/ochem/tree/draw.js',
      alt: 'Bromobenzene with three ring positions marked: ortho, beside the bromine and crowded; meta, which the bromine lone pair does not help; and para, outlined as the main site for the acyl group.',
      caption: 'Three spots on the ring. The lone pair helps two of them, and room picks para.'
    },
    demoPick: 'Deactivating and meta directing; the acyl group enters mainly meta',
    flags: [
      { kind: 'stem-style', text: 'The stem hints the exception ("Halogens are an unusual class of substituent in EAS."). Suggested, not applied: drop that sentence. Key unchanged.' }
    ]
  },
  {
    qid: 'fm:organic:oc-8gdlsf',
    servesAlso: [],
    section: 'ochem',
    subtopic: 'oc.aromatics.friedel-crafts',
    difficulty: D(2),
    source: FM('organic:oc-8gdlsf', 17),
    keyText: 'CC(C)c1ccccc1',
    answer: { line: 'AlCl3 pulls the chloride off, the primary carbon grabs a hydride from its neighbor, and benzene attacks the secondary isopropyl cation.' },
    steps: [
      'Start with what AlCl3 does: it pulls Cl off 1-chloropropane and leaves a primary carbon that is nearly a cation.',
      'A primary cation sits at the bottom of the staircase. An H slides over from C2 with its pair, a 1,2-hydride shift, and the charge moves to a secondary carbon.',
      'Benzene attacks that isopropyl cation and gives the proton back. Cumene, isopropylbenzene, is the major product.'
    ],
    choices: [
      { text: 'CCc1ccccc1', display: 'ethylbenzene', role: 'trap', family: 'miscount', trap: 'Lost a carbon', note: 'Ethylbenzene has two carbons on the ring. The reagent brings three, and no step here removes one.' },
      { text: 'CCCc1ccccc1', display: 'propylbenzene (no shift)', role: 'trap', family: 'close-second', trap: 'Skipped the shift', note: 'Some propylbenzene forms, which is why it pulls, and how much depends on temperature. The shift to the secondary cation is the classic limit of alkylation and gives the major product.' },
      { text: 'CC(C)c1ccccc1', display: 'isopropylbenzene (cumene)', role: 'key', note: 'Ring on the middle carbon, after the hydride shift.' },
      { text: 'CC(C)(C)c1ccccc1', display: 'tert-butylbenzene', role: 'trap', family: 'one-step-too-far', trap: 'Chased tertiary', note: 'Tertiary is the most stable cation, so it pulls. But a tert-butyl group needs four carbons, and the propyl chain has three.' },
      { text: 'CC(C)Cc1ccccc1', display: 'isobutylbenzene', role: 'trap', family: 'miscount', trap: 'A fourth carbon', note: 'Isobutylbenzene has four carbons in its side chain. The reagent brings three.' }
    ],
    lockIt: 'Friedel-Crafts alkylation goes through a cation, so a primary chain shifts first and attaches where the charge settles.',
    hook: 'Acylation never shifts; alkylation does.',
    playWith: { label: 'Tree, aromatic substitution: tap CH3CH2CH2Cl + AlCl3 and see the electrophile it really makes', href: TREE, state: { module: 't5-eas', electrophile: 'propyl' }, expect: [], routing: TREE_ROUTE('Electrophilic aromatic substitution', 'the CH3CH2CH2Cl + AlCl3 chip is a tap inside it') },
    video: VID('oc.aromatics.friedel-crafts', 'Friedel-Crafts: alkylation shifts, acylation does not'),
    visual: {
      type: 'chem.reaction',
      reactants: [{ smi: 'ClCCC', label: '1-chloropropane', marks: [{ atom: 1, text: 'C1: Cl leaves' }, { atom: 2, text: 'C2: H moves from here', key: true }] }],
      reagent: 'benzene, AlCl3',
      products: [{ smi: 'CC(C)c1ccccc1', label: 'isopropylbenzene (cumene)', marks: [{ atom: 1, text: 'ring on the middle C', key: true }] }],
      ladder: { title: 'Carbocation stability', order: ['tertiary', 'secondary: isopropyl, what attacks the ring', 'primary: propyl, shifts first'], key: 1 },
      reuse: 'SmilesDrawer through the light copy of tools/ochem/tree/draw.js',
      alt: '1-Chloropropane with C1 marked where Cl leaves and C2 marked where an H moves from reacts with benzene and AlCl3 to give isopropylbenzene, the ring on the middle carbon. A ladder ranks carbocations: tertiary, then secondary, outlined, then primary, which shifts first.',
      caption: 'Read the two marks: an H moves from C2 to C1, so the charge, and the ring, land on the middle carbon.'
    },
    demoPick: 'CCCc1ccccc1',
    flags: [
      { kind: 'stem-style', text: 'The stem capitalizes MAJOR. Suggested, not applied: "major". Key unchanged.' },
      { kind: 'letter-cite', text: 'The bank explanation calls cumene "choice A" (served third) and maps tert-butyl and ethyl to C and D (served fourth and first); it also uses "wrong carbon count" and "wrong skeleton". Students see it on the full-test review screen. Key unchanged.' },
      { kind: 'note', text: 'Real Friedel-Crafts propylation gives a mixture whose ratio depends on temperature; the DAT-level answer is cumene, so the explainer says major, never only (expert note).' }
    ]
  },

  /* ================================= Different arrows: radicals and Diels-Alder */
  {
    qid: 'fm:organic:oc-1sm5f0m',
    servesAlso: [],
    section: 'ochem',
    subtopic: 'oc.pericyclic.sigmatropic',
    difficulty: D(2),
    source: FM('organic:oc-1sm5f0m', 14),
    keyText: 'C=CCCC=Cc1ccccc1',
    answer: { line: 'The Cope breaks C3-C4, joins C1 to C6 and moves both pi bonds. The new C=C lands beside the ring, so that side wins.' },
    steps: [
      'Mark the six carbons: C1=C2, C3 holding the phenyl, C4, then C5=C6.',
      'Move three pairs at once. The C3-C4 sigma bond breaks, a new C1-C6 bond forms, and the pi bonds shift to C2=C3 and C4=C5.',
      'The reaction runs both ways, so it settles on the more stable side. Now C2=C3 sits on the phenyl carbon, conjugated with the ring: 1-phenylhexa-1,5-diene.'
    ],
    choices: [
      { text: 'C=CCC(C=C)c1ccccc1', display: '3-phenylhexa-1,5-diene (the starting diene, drawn turned around)', role: 'trap', family: 'one-step-short', trap: 'Nothing moved', note: 'This is the starting diene, drawn turned around: the same molecule. No bond has moved yet.' },
      { text: 'C=Cc1ccccc1CCC=C', display: 'a vinyl and a butenyl group on neighboring ring carbons', role: 'trap', family: 'neighbor-fact', trap: 'Onto the ring', note: 'A group landing on the ortho ring carbon is the aromatic Claisen pattern, from allyl aryl ethers. A Cope never touches the ring.' },
      { text: 'C=CCCC=Cc1ccccc1', display: '1-phenylhexa-1,5-diene (C=C beside the ring)', role: 'key', note: 'One sigma bond out, one in, both pi bonds moved, and the new C=C conjugated with the ring.' },
      { text: 'C=CC(c1ccccc1)C=CC', display: '3-phenylhexa-1,4-diene', role: 'trap', family: 'half-right', trap: 'Moved one pi bond', note: 'One pi bond moved, but the sigma bond never broke and the other pi bond stayed put. A [3,3] shift moves all three pairs.' },
      { text: 'C1=CC=CC(c2ccccc2)C1', display: '5-phenylcyclohexa-1,3-diene (a ring)', role: 'trap', family: 'neighbor-fact', trap: 'Closed into a ring', note: 'The six-membered ring belongs to the chair-shaped transition state and to Diels-Alder products. The Cope product is still an open chain, and this choice has lost two H.' }
    ],
    lockIt: 'A Cope shifts a 1,5-diene: break the C3-C4 sigma bond, join C1 and C6, move both pi bonds.',
    hook: 'Reversible, so the conjugated side wins.',
    playWith: { label: 'Tree, different arrows: the Diels-Alder, three arrows moving at once in a ring, the same pattern a Cope uses', href: TREE, state: { module: 't4-radical-pericyclic', reaction: 'da' }, expect: [], routing: TREE_ROUTE('Radicals and the Diels-Alder', 'the Diels-Alder chip is a tap inside it') },
    video: VID('oc.pericyclic.sigmatropic', 'Sigmatropic shifts: the Cope'),
    visual: {
      type: 'stack',
      alt: '3-Phenylhexa-1,5-diene with C1, C3 and C6 marked turns into 1-phenylhexa-1,5-diene, where C1 is now bonded to C6 and the new C=C at C3 sits beside the ring, outlined. Below, the one step with three curved arrows that moves the bonds.',
      caption: 'Track the numbers: C3 lets go of C4, C1 grabs C6, and the new C=C lands beside the ring.',
      panels: [
        { type: 'chem.reaction', reactants: [{ smi: 'C=CC(c1ccccc1)CC=C', label: '3-phenylhexa-1,5-diene', marks: [{ atom: 0, text: 'C1' }, { atom: 2, text: 'C3' }, { atom: 11, text: 'C6' }] }], reagent: 'heat', products: [{ smi: 'C=CCCC=Cc1ccccc1', label: '1-phenylhexa-1,5-diene', marks: [{ atom: 3, text: 'C1' }, { atom: 2, text: 'C6' }, { atom: 5, text: 'C3: C=C by the ring', key: true }] }], reuse: 'SmilesDrawer through the light copy of tools/ochem/tree/draw.js' },
        { type: 'chem.mechanism', fig: COPE, showProduct: false, reuse: 'drawChain() in tools/ochem/tree/mechdraw.js; the step is written here and every arrow is pushed in RDKit by scripts/ochem2026/verify.py (build)' }
      ]
    },
    demoPick: 'C=CCC(C=C)c1ccccc1',
    flags: [
      { kind: 'stem-style', text: 'The stem names the reaction ("Cope ([3,3]-sigmatropic)") and the outcome rule ("to reach the more stable isomer"). Flag only. Key unchanged.' },
      { kind: 'letter-cite', text: 'The bank explanation gives the key as "opt 0" (served third, index 2) and the starting material as "Option 1" (served first), and uses "incorrect connectivity". Students see it on the full-test review screen. Key unchanged.' },
      { kind: 'note', text: 'One distractor is the starting diene written turned around (RDKit gives the same canonical SMILES as the stem); the explainer names it the same molecule.' },
      { kind: 'tool-gap', text: 'No Ace Labs tool runs a Cope rearrangement. The play-with link goes to the Diels-Alder, which uses the same three-arrow ring pattern.' }
    ]
  },

  /* ==================================== The reactivity ladder: acid derivatives */
  {
    qid: 'fm:organic:oc-1op9odj',
    servesAlso: [],
    section: 'ochem',
    subtopic: 'oc.amines.synthesis',
    difficulty: D(2),
    source: FM('organic:oc-1op9odj', 15),
    keyText: '1-bromobutane (a primary alkyl halide)',
    answer: { line: 'The phthalimide nitrogen alkylates by SN2, and SN2 wants an open back side on an sp3 carbon. A primary halide is the best fit.' },
    steps: [
      'Name the step that decides it: the phthalimide anion attacks the halide\'s carbon by SN2.',
      'SN2 needs a back side to come in from: tertiary is walled off, and an sp2 carbon on a ring or a C=C has none it can use. Primary is open.',
      'Hydrazine then frees the amine, so 1-bromobutane gives butan-1-amine. Phthalimide attacks once and is boxed in, so it never alkylates twice.'
    ],
    choices: [
      { text: '1-bromobutane (a primary alkyl halide)', role: 'key', note: 'Primary, sp3, unhindered: the substrate SN2 wants.' },
      { text: 'bromobenzene (an aryl halide)', role: 'trap', family: 'missed-exception', trap: 'Leaves well, no back side', note: 'Bromide leaves well, which is the pull. But an aryl C-Br sits on an sp2 carbon whose back side is inside the ring, so no SN2.' },
      { text: '2-chloro-2-methylbutane (a tertiary halide)', role: 'trap', family: 'reversed', trap: 'The SN1 favorite', note: 'Tertiary is the best SN1 substrate and the worst SN2 one. With the basic phthalimide anion it eliminates instead.' },
      { text: '2-bromo-2-methylpropane (tert-butyl bromide)', role: 'trap', family: 'reversed', trap: 'A walled-off carbon', note: 'Three methyls block the back side, so SN2 cannot happen. The anion acts as a base and E2 gives isobutylene.' },
      { text: 'vinyl bromide (a vinyl halide)', role: 'trap', family: 'missed-exception', trap: 'Another sp2 C-Br', note: 'Same story as the aryl halide: the C-Br is on an sp2 carbon, the bond is strong, and the pi system blocks the back side.' }
    ],
    lockIt: 'The Gabriel synthesis runs on SN2: use a primary alkyl halide, never tertiary, aryl or vinyl.',
    hook: null,
    playWith: { label: 'Tree, combined mechanisms: tap Gabriel synthesis and follow 1-bromopropane through to the amine', href: TREE, state: { module: 't5-combined', chain: 'gabriel' }, expect: [], routing: TREE_ROUTE('Combined mechanisms', 'the Gabriel synthesis chip is a tap inside it') },
    video: VID('oc.amines.synthesis', 'Making amines: Gabriel and friends'),
    visual: {
      type: 'chem.molecule',
      smi: 'CCCCBr',
      label: '1-bromobutane',
      marks: [{ atom: 3, text: 'primary CH2: open back side', key: true }],
      ladder: { heading: 'SN2 at the carbon that holds the halide', order: ['primary, like 1-bromobutane: open back side', 'secondary: slower, E2 competes', 'tertiary: blocked, E2 instead', 'aryl or vinyl: sp2 carbon, no SN2'], key: 0, mark: 'use this' },
      reuse: 'SmilesDrawer through the light copy of tools/ochem/tree/draw.js',
      alt: '1-Bromobutane with its CH2-Br carbon outlined as an open back side for SN2. Below, a ladder ranks substrates for SN2: primary best, then secondary, then tertiary, which is blocked and eliminates, and last aryl or vinyl halides, whose sp2 carbons do no SN2.',
      caption: 'The ladder is the whole question. Gabriel is SN2, so the top rung wins.'
    },
    demoPick: '2-bromo-2-methylpropane (tert-butyl bromide)',
    flags: []
  },
  {
    qid: 'fm:organic:oc-y8rsnv',
    servesAlso: [],
    section: 'ochem',
    subtopic: 'oc.acid-derivatives.reduction',
    difficulty: D(2),
    source: FM('organic:oc-y8rsnv', 30),
    keyText: 'NC[C@@H](C)c1ccccc1',
    answer: { line: 'LiAlH4 turns the amide C=O into CH2 and keeps the nitrogen. No bond to the stereocenter breaks, so it stays S.' },
    steps: [
      'Name what LiAlH4 does to a primary amide: C(=O)NH2 becomes CH2NH2. The oxygen leaves; the nitrogen stays.',
      'Check the stereocenter. None of its four bonds breaks, so every group keeps its place, wedges and dashes included.',
      'Check the label. CH2NH2 and phenyl tie at the first atom, a C each, so look one atom out: N, H, H beats C, C, C, and the order holds: still S.'
    ],
    choices: [
      { text: 'NC[C@@H](C)c1ccccc1', display: '(S)-2-phenylpropan-1-amine (methyl kept on the wedge)', role: 'key', relation: 'same', note: 'C=O out, nitrogen kept, stereocenter untouched: still S.' },
      { text: 'NC[C@H](C)c1ccccc1', display: '(R)-2-phenylpropan-1-amine (methyl on a dash)', role: 'trap', family: 'reversed', relation: 'enantiomer', trap: 'Inverted for no reason', note: 'This is the mirror image, the enantiomer. Nothing in the reaction touches the stereocenter, so nothing inverts.' },
      { text: 'NC[C@@H](C)c1ccccc1C', display: 'the amine with an extra methyl on the ring', role: 'trap', family: 'miscount', trap: 'A carbon from nowhere', note: 'This adds a methyl to the ring. No reagent here brings a carbon.' },
      { text: 'O=C[C@@H](C)c1ccccc1', display: '(S)-2-phenylpropanal (an aldehyde)', role: 'trap', family: 'one-step-short', trap: 'Stopped at the aldehyde', note: 'An aldehyde is a partial reduction, what DIBAL-H gives from an ester or a nitrile. LiAlH4 on an amide goes all the way to the amine.' },
      { text: 'OC[C@@H](C)c1ccccc1', display: '(S)-2-phenylpropan-1-ol (an alcohol)', role: 'trap', family: 'neighbor-fact', trap: 'The ester answer', note: 'LiAlH4 on an ester or an acid gives a primary alcohol. An amide keeps its nitrogen and gives an amine.' }
    ],
    lockIt: 'LiAlH4 reduces an amide to an amine: C=O becomes CH2, the nitrogen stays, and nearby stereocenters stay.',
    hook: null,
    playWith: { label: 'Tree, acid derivatives: the reactivity ladder, where the hydride rule takes an amide all the way to an amine', href: TREE, state: { module: 't4-acid-deriv' }, expect: [], routing: TREE_ROUTE('Acids and their derivatives', 'the ladder is its main picture; the amide rule is in its moves and its trap line') },
    video: VID('oc.acid-derivatives.reduction', 'Hydrides on acid derivatives: who stops where'),
    visual: {
      type: 'chem.reaction',
      reactants: [{ smi: 'O=C(N)[C@@H](C)c1ccccc1', label: '(S)-2-phenylpropanamide', explicitH: false, cip: [{ atom: 3, config: 'S' }], marks: [{ atom: 1, text: 'C=O: becomes CH2', key: true }] }],
      reagent: '1. LiAlH4; 2. H2O',
      products: [{ smi: 'NC[C@@H](C)c1ccccc1', label: '(S)-2-phenylpropan-1-amine: the center is still S', explicitH: false, cip: [{ atom: 2, config: 'S' }], marks: [{ atom: 1, text: 'now CH2', key: true }] }],
      note: 'No bond to the stereocenter breaks, and CH2NH2 still outranks phenyl, so S stays S.',
      reuse: 'SmilesDrawer through the light copy of tools/ochem/tree/draw.js; the drawn configuration is checked by the render gate and the S labels by RDKit (build)',
      alt: '(S)-2-Phenylpropanamide, its C=O carbon marked to become CH2, reacts with LiAlH4, then water, to give (S)-2-phenylpropan-1-amine, with the new CH2 outlined and the stereocenter drawn the same way, still S.',
      caption: 'The change happens at the C=O carbon. The stereocenter next door never loses a bond.'
    },
    demoPick: 'OC[C@@H](C)c1ccccc1',
    flags: [
      { kind: 'stem-style', text: 'The stem points at the stereocenter ("The stereocenter is at the carbon alpha to the carbonyl."), a hint. Flag only. Key unchanged.' },
      { kind: 'letter-cite', text: 'The bank explanation says "the last option adds a ring methyl"; the last served choice is the alcohol, and the ring-methyl amine is third. It also uses "wrongly" and "incorrect". Students see it on the full-test review screen. Key unchanged.' }
    ]
  },

  /* ============================================================ Molecules in 3D */
  {
    qid: 'fm:organic:oc-vqku6',
    servesAlso: [],
    section: 'ochem',
    subtopic: 'oc.stereo.meso',
    difficulty: D(2),
    source: FM('organic:oc-vqku6', 16),
    keyText: 'It is a meso compound: it has stereocenters but an internal mirror plane, so it is achiral and optically inactive',
    answer: { line: 'Both Cl carbons are stereocenters, one R and one S, and a mirror plane runs between them. Stereocenters plus a mirror plane: meso.' },
    steps: [
      'Check each Cl carbon: it holds H, Cl and two ring paths that differ, because one path reaches the other Cl sooner. So both are stereocenters.',
      'Look for symmetry: in the cis isomer a mirror plane runs through C2 and C5 and swaps the two Cl carbons. One reads R, the other S.',
      'Stereocenters plus an internal mirror plane is meso: the molecule is its own mirror image, so it is achiral and does not rotate light.'
    ],
    choices: [
      { text: 'It is a meso compound: it has stereocenters but an internal mirror plane, so it is achiral and optically inactive', role: 'key', note: 'Two stereocenters, one mirror plane: meso, achiral, optically inactive.' },
      { text: 'It is chiral and optically active, existing as a pair of non-superimposable enantiomers that each rotate plane-polarized light in opposite directions', role: 'trap', family: 'neighbor-fact', trap: 'True of the trans isomer', note: 'That describes trans-1,3-dichlorocyclohexane, which has no mirror plane. The cis isomer drawn here has one.' },
      { text: 'It is a constitutional isomer of 1,4-dichlorocyclohexane and is optically active', role: 'trap', family: 'half-right', trap: 'True start, false finish', note: 'It is a constitutional isomer of the 1,4 compound. But its mirror plane makes it optically inactive.' },
      { text: 'It exists only as a single non-superimposable mirror image, so it has no achiral stereoisomer at all', role: 'trap', family: 'reversed', trap: 'Turned around', note: 'This molecule is itself the achiral stereoisomer. Its mirror image lies right on top of it.' },
      { text: 'It has no stereocenters at all, so chirality is not possible', role: 'trap', family: 'neighbor-fact', trap: 'True of the 1,4 isomer', note: 'In 1,4-dichlorocyclohexane the two ring paths from each C-Cl are the same, so no stereocenters. In the 1,3 isomer they differ.' }
    ],
    lockIt: 'Meso means stereocenters plus an internal mirror plane. Find the plane, and the molecule is achiral.',
    hook: null,
    playWith: { label: 'Roots, enantiomers, diastereomers and meso: label every center, then count the flips', href: ROOTS, state: { root: 'l3-isomers' }, expect: [], routing: ROOT_ROUTE('All four must flip (l3-isomers)') },
    video: VID('oc.stereo.meso', 'Meso: stereocenters and a mirror plane'),
    visual: {
      type: 'chem.molecule',
      smi: 'C1C[C@H](Cl)C[C@H](Cl)C1',
      label: 'cis-1,3-dichlorocyclohexane',
      centers: [
        { atom: 2, name: 'C1', rank: [{ atom: 3, name: 'Cl' }, { atom: 4, name: 'C2 (to the other Cl)' }, { atom: 1, name: 'C6' }, { h: true, name: 'H' }], config: 'S', labelDir: -55 },
        { atom: 5, name: 'C3', rank: [{ atom: 6, name: 'Cl' }, { atom: 4, name: 'C2 (to the other Cl)' }, { atom: 7, name: 'C4' }, { h: true, name: 'H' }], config: 'R', labelDir: -125 }
      ],
      mirror: [4, 0],
      meso: true,
      note: 'One center reads S and the other R; the dashed mirror plane through C2 and C5 swaps them.',
      verify: 'RDKit CIP on the SMILES and the meso check (build); each card read off the drawn wedges by the swap rule and the signed volume, and the drawing rebuilt in RDKit (render gate)',
      reuse: 'SmilesDrawer through the light copy of tools/ochem/tree/draw.js; stereo cards built from the drawing',
      alt: 'cis-1,3-Dichlorocyclohexane with both Cl atoms on the same face. A card for each Cl carbon ranks its groups and reads one center S and the other R, and a dashed mirror plane through C2 and C5 swaps the two halves.',
      caption: 'Read both cards, then find the dashed line. Opposite labels plus a mirror plane is meso.'
    },
    demoPick: 'It is chiral and optically active, existing as a pair of non-superimposable enantiomers that each rotate plane-polarized light in opposite directions',
    flags: [
      { kind: 'letter-cite', text: 'The bank explanation says "option C wrongly denies stereocenters" (served fifth) and "option D confuses constitutional vs stereoisomerism" (served third), and opens mid-thought with "So". Students see it on the full-test review screen. Key unchanged.' }
    ]
  }
];

// What changed from the expert's suggested families and from the batch row, and the fixes from the
// expert review of B004 (coach record only).
const CHANGES = {
  'fm:organic:oc-1mc2sbd': [
    'Visual is chem.reaction (propanal to hemiacetal to acetal); the batch row counted the "Reading the machines" items as chem.spectrum, but this item is a reaction',
    'Re-review round 2 fix: the "One oxidation level up" note keeps two sentences, the ester level and its two routes joined by a colon (was three; trap notes are one or two)'
  ],
  'fm:organic:oc-1olhj21': [
    'Visual is chem.reaction (aniline to anilinium chloride); the batch row counted it as chem.spectrum, and chem.lab has no renderer yet',
    'Review suggestion taken: the "lone pair takes H+" label sits below and right of the N (labelDir 65; was -90, whose halo clipped the ring corner; 90 clipped the lower corner)'
  ],
  'fm:originals:ab-13b7fabf1b': ['Visual is chem.reaction with a pKa ladder; the stem shows no structure, so 1-hexyne is drawn as the example terminal alkyne'],
  'fm:organic:oc-1op9odj': [
    'Visual is chem.molecule with an SN2 ladder instead of the full Gabriel reaction, to keep the phone picture under one screen',
    'Re-review suggestion taken: step 2 keeps two sentences, ending on "Primary is open." (was three)'
  ],
  'fm:organic:oc-1o9d4eq': [
    'Trap labels in the coach\'s words for four other-conditions choices; expert families kept',
    'Re-review suggestion taken: step 1 asks both questions at once and answers them in one sentence (was five sentences)'
  ],
  'fm:organic:oc-y8rsnv': [
    'Review fix: step 3 says CH2NH2 and phenyl tie at the first atom (a C each), and N wins one atom out, N, H, H against C, C, C (was "N beats C at the first atom")',
    'Review suggestion taken: reactant and product are drawn with explicit hydrogens off, as the served page draws them, so the methyl sits on the wedge as in the stem and the key (was phenyl on a dash with H drawn)',
    'Re-review suggestion taken: step 3 keeps two sentences and 32 words, "N, H, H beats C, C, C, and the order holds: still S." (was three sentences, 38 words)'
  ],
  'fm:organic:oc-yraq7h': [
    'Review fix: the "lone pair spread into the ring" label sits below and right of the N (labelDir 65; was -90, whose halo erased the top of the ring; 90 clipped the lower corner), so the ring draws complete',
    'Re-review suggestion taken: step 2 keeps two sentences, aniline first, then pyridine and methylamine together (was four)'
  ],
  'fm:organic:oc-163l4so': ['Review fix: the caption reads "Two carbonyls, one cold equivalent of NaBH4" (was "Two targets, one hydride each", which read as both carbonyls reduced)'],
  'fm:organic:oc-11r58ig': ['Review suggestion taken: the 1-bromo-2-methylbutane label is "Shifted, Br on the end" (was "Br in the old spot"; that Br is not on the old carbinol carbon)'],
  'fm:organic:oc-1eq5a2f': [
    'Review suggestion taken: the "Lost the methyl" note says the methyl shows up on the ring (was "in the ring", which echoed the folded-in-methyl trap)',
    'Re-review fix: the favored product\'s mark is a green "H" drawn under the circled CH (labelDir 90; was "acidic H here", whose halo erased the C-O single bond from the ester carbon to the ethoxy O, so OEt looked detached from the C=O at 390 and 1280); the alt says a marked acidic H sits on that carbon',
    'Re-review suggestion taken: the "Methyl one carbon over" note says "This is one ring a 3-methyl diester could give." (was "what a 3-methyl diester would give"; that diester gives the 4-methyl and the 5-methyl rings)',
    'Re-review suggestion taken: step 3 keeps two sentences, ending on "That is the first product." (was three)',
    'Re-review round 2 suggestion taken: step 3 ends "That is the favored ring." (was "That is the first product.", which could read as the product that forms first); still 5 words, so the short line stays'
  ],
  'fm:organic:oc-zlk3b3': [
    'Review suggestion taken: the 1,2-dione note says keeping both C=O groups is what an acylation does, and even then they end up 1,3 (was "a Claisen-type pattern")',
    'Re-review suggestion taken: step 2 keeps two sentences, the two ring counts joined by a semicolon (was three)',
    'Re-review round 2 fix: the "C=C one spot over" note keeps two sentences, "Right ring, right atoms, but the C=C sits out of line with the C=O." (was three, so the phone showed only "Right ring, right atoms.")'
  ],
  'fm:organic:oc-1v0wmr4': ['Review suggestion taken: the two cation notes say E1 with no strong base (was "hot acid", the alcohol dehydration setting; this substrate is a bromide)'],
  'fm:organic:oc-1rhxjv': [
    'Review suggestion taken: the oct-2-ene note says ethyl bromide puts two carbons on the short side, so the C=C sits at C3; label "C=C one spot over" (was "Ethyl counted as one carbon", which would give seven carbons)',
    'Re-review suggestion taken: step 2 says the triple bond starts at C3, counted from the ethyl end (was "three carbons from the ethyl end", which could read as three carbons in between)'
  ],
  'fm:organic:oc-8gdlsf': ['Review suggestion taken: the caption says to read the two marks (was "Follow the H", but no H or arrow is drawn)'],
  'fm:organic:oc-1vndb83': [
    'Review suggestion taken: Lock it in says "to a nucleophile" (was "to every nucleophile")',
    'Review note: benzaldehyde is drawn with its aldehyde H shown, so the caption\'s "an H on top" points at a drawn H'
  ],
  'fm:organic:oc-p5414p': [
    'Re-review suggestion taken: step 2 keeps two sentences, ending on "The ethyls stay put." (was three)',
    'Re-review round 2 fix: the "Right ring, faces not shown" note keeps two sentences, its first two joined with "but" (was three; trap notes are one or two)'
  ],
  'fm:organic:oc-8neusk': [
    'Re-review suggestion taken: step 2 keeps two sentences (was three)',
    'Re-review note: the miscount family on 1-bromo-2,2-dimethylbutane is a loose fit; both reviews left it to Thomas, so it is unchanged and a note flag says so'
  ],
  'fm:organic:oc-18i1svf': ['Re-review suggestion taken: step 2 keeps two sentences, ending on "Four becomes five." (was three)'],
  'fm:organic:oc-csbizj': ['Re-review suggestion taken: step 2 keeps two sentences, the ring count and "six atoms" in one (was three)'],
  'fm:organic:oc-qn8vo7': ['Re-review suggestion taken: step 1 keeps two sentences, "By induction ...; by resonance ..." (was three)'],
  'fm:organic:oc-vqku6': [
    'Re-review suggestion taken: the "Turned around" note says its mirror image "lies" right on top of it (was "lays")',
    'Re-review suggestion taken: steps 1 and 2 keep two sentences each (were three)',
    'Re-review round 2 suggestion taken: the C1 and C3 card labels sit at labelDir -55 and -125 (were -70 and -110, whose halos thinned the outer edge of the two vertical ring bonds); with and without the labels, 0 ink pixels differ at 390 and 1280'
  ],
  'fm:organic:oc-anc6po': ['Re-review round 2 note: the "C=O: MeLi lands here" halo nicks 1 to 2 px off the inner C=C tip at 1280 (0 px at 390). Kept: the only clear spot, lower right (labelDir 30, tried), makes the drawing 81 percent wider at 390, so the molecule shrinks to 56 percent of its height on phones']
};

module.exports = {
  schema: 'ace.explainer-src/1',
  group: 'G1',
  batch: 'B004',
  title: 'G1 B004: Full-Length Test 1, Organic Chemistry (alkenes, carbocations, substitution and elimination, alcohols, carbonyls, the alpha carbon, alkynes, acid-base, spectroscopy and lab, aromatics, pericyclic, acid derivatives, stereochemistry)',
  entries: ENTRIES,
  changes: CHANGES
};
