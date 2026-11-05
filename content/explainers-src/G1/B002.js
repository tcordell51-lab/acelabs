// content/explainers-src/G1/B002.js: batch B002 of group G1 (Full-Length
// Test 1, the free practice test), Biology part 2: 24 items in the batch plan
// (docs/release-2026-10-30/questions/batches.json), 23 written here. The 24th,
// fm:bio:BIO_g011 (Hardy-Weinberg), is pilot BIO-1 and lives in
// content/explainers-src/pilot/pilot.js.
//
// Written in Thomas's coaching voice (docs/release-2026-10-30/questions/voice-codex.md)
// from the independent expert's blind solve (docs/explainers/solves/B002.json:
// 24 of 24 keys agree, no key dispute). The expert's families were weighed and
// kept unless noted in CHANGES. Bank-copy notes the expert passed on are flags.
//
// Authoring source, never published: /content/explainers-src/* is
// force-redirected like /docs/*. The build (scripts/explainers/build.mjs) copies
// the student fields to content/explainers/ and the coach fields (flags,
// changes, demo pick, gate results) to docs/explainers/ only.
//
// Rules this file keeps: plain ASCII (bank choice texts with subscripts are
// written as \u escapes and must equal the bank), no em dashes, never "wrong",
// "incorrect" or "failed", never a choice letter (choices are matched by their
// text), step 1 opens with a move, one family from the closed list on every
// non-key choice, concepts first. Visuals: the picture types the batch row
// names (bio.tree, bio.chart, bio.diagram) drawn by tools/explain/visuals.
'use strict';

const FM = (id, n) => ({ bank: 'tools/mock/data/full-mocks.js', global: 'ACE_FULL_MOCKS', locator: { mock: 'FULL_1', section: 'bio', id }, servedAs: 'Full-Length Test 1, Natural Sciences, question ' + n });
const D = (band) => ({ band, from: 'bank field d (1-3)' });
const VID = (slot, title) => ({ slot, title, id: null, start: null });

// play-with targets (Bio hubs; every one opens today, tab clicks noted in routing)
const FIELD_GUIDE = 'tools/bio/bio-diversity.html#phylGuide';
const EVO_LAB = 'tools/bio/bio-evolution.html#evoSim';
const CELL_LAB = 'tools/bio/bio-cell.html#cellLab';
const PHOTO = 'tools/bio/bio-cell.html#node-photo';
const EMBRYO = 'tools/bio/bio-devo.html#embryoAtlas';
const TAB = (hub, tab) => 'The anchor opens the ' + hub + '; the ' + tab + ' tab is one click (no URL route opens a lab tab yet).';

// the fungal tree, shared by the two fungi items: the key row differs, and
// keyChoice is the served choice the key row stands for (the phylum names are
// choices only on the yeast item)
function fungiTree(key, keyChoice) {
  const row = (label, sub) => Object.assign({ label, sub }, keyChoice ? (key === label ? { key: true, choice: keyChoice } : {}) : { choice: label }, !keyChoice && key === label ? { key: true } : {});
  return {
    label: 'Fungi', sub: 'all: chitin walls, food absorbed from outside, reproduce by spores',
    children: [
      row('Chytridiomycota', 'spores swim with one flagellum; water and wet soil'),
      { label: 'All other fungi', trait: 'lost the flagellum',
        children: [
          row('Zygomycota', 'zygospores; the bread mold Rhizopus'),
          row('Glomeromycota', 'grow inside plant roots (mycorrhizae)'),
          row('Ascomycota', 'spores in a sac, the ascus: baker\'s yeast, Penicillium, morels'),
          row('Basidiomycota', 'spores on a club, the basidium: mushrooms, rusts')
        ] }
    ]
  };
}

// the Calvin cycle, laid out on three columns (used by two items)
const CALVIN_LEGEND = [
  { n: 2, label: 'Reduction: ATP and NADPH turn 3-PGA into G3P' },
  { n: 3, label: 'Regeneration: ATP rebuilds RuBP from G3P' }
];

const ENTRIES = [
  /* ===================================================== Diversity of life */
  {
    qid: 'fm:bio:BIO_d036',
    servesAlso: [],
    section: 'bio',
    subtopic: 'bio.diversity.fungi',
    difficulty: D(2),
    source: FM('bio:BIO_d036', 7),
    keyText: 'Ascomycota',
    answer: { line: 'Baker\'s yeast makes its spores in a sac, the ascus. The sac fungi are Ascomycota.' },
    steps: [
      'Name the spore structure, not the body shape. The big fungal phyla are named for where they make their sexual spores.',
      'Baker\'s yeast makes its spores inside a sac, the ascus. Ascus means sac, so yeast sits with the sac fungi.',
      'One cell does not change the phylum. Yeast buds as single cells and still forms asci; its relatives include Penicillium and morels.'
    ],
    choices: [
      { text: 'Zygomycota', role: 'trap', family: 'neighbor-fact', trap: 'The bread mold', note: 'Bread pulls you here, but that is the bread mold Rhizopus, a zygote fungus. The yeast that raises bread is a sac fungus.' },
      { text: 'Basidiomycota', role: 'trap', family: 'neighbor-fact', trap: 'The mushroom group', note: 'Mushrooms, puffballs and rusts are club fungi, so fungus-means-mushroom lands here. Their spores form on a club, the basidium, not in a sac.' },
      { text: 'Glomeromycota', role: 'trap', family: 'neighbor-fact', trap: 'The root partners', note: 'These are the mycorrhizal fungi that grow inside plant roots. A real phylum, but never a free single cell like yeast.' },
      { text: 'Chytridiomycota', role: 'trap', family: 'neighbor-fact', trap: 'Sorted by single cells', note: 'Chytrids are often single celled too, which pulls if you sort by cell count. They live in water and make swimming spores; yeast does not.' },
      { text: 'Ascomycota', role: 'key', note: 'The sac fungi, named for the ascus: baker\'s yeast, Penicillium, morels and truffles.' }
    ],
    lockIt: 'Sort fungi by where the spores form: a sac is Ascomycota, a club is Basidiomycota.',
    hook: null,
    playWith: { label: 'Field Guide, Fungi tab: open Ascomycota and Basidiomycota and compare where each makes its spores', href: FIELD_GUIDE, state: { tab: 'fungi', mode: 'asco' }, expect: ['data-fungi="asco"', 'data-fungi="basidio"'], routing: TAB('Phylogenetic Field Guide', 'Fungi') + ' Ascomycota and Basidiomycota are buttons inside it.' },
    video: VID('bio.diversity.fungi', 'Fungi: sort the phyla by their spores'),
    visual: {
      type: 'bio.tree',
      root: fungiTree('Ascomycota'),
      focus: 'Ascomycota',
      reuse: 'new: a pure bracket-tree renderer (initTree and initCladogramBuilder in tools/bio/bio-shared.js are DOM-bound)',
      alt: 'A tree of the fungal phyla. Chytrids branch off first with swimming spores; on the branch to the rest, a bar marks where the flagellum was lost. Ascomycota, the sac fungi with baker\'s yeast, Penicillium and morels, is outlined as the answer, beside the club fungi, the bread molds and the root fungi.',
      caption: 'Find baker\'s yeast in the tree. Its group is named for the sac where its spores form.'
    },
    demoPick: 'Basidiomycota',
    flags: [
      { kind: 'bank-copy', text: 'The bank explanation opens "Yeasts are ascomycetes". True of baker\'s and brewer\'s yeast, but some yeasts are basidiomycetes (Cryptococcus). This explainer says baker\'s yeast. Wording only; key unchanged.' }
    ]
  },
  {
    qid: 'fm:bio:BIO_d039',
    servesAlso: [],
    section: 'bio',
    subtopic: 'bio.diversity.fungi',
    difficulty: D(2),
    source: FM('bio:BIO_d039', 11),
    keyText: 'Flagellated spores',
    answer: { line: 'Chytrids are the only fungi that kept a swimming stage: spores that each carry one flagellum.' },
    steps: [
      'List what every fungus shares first: chitin walls, food absorbed from outside, reproduction by spores.',
      'Cross off anything true of fungi in general. A shared trait cannot set one group apart.',
      'What is left is the swimming spore. Chytrids make zoospores with one tail; every other fungus lost the flagellum.'
    ],
    choices: [
      { text: 'Flagellated spores', role: 'key', note: 'Zoospores with a single flagellum. No other fungus swims.' },
      { text: 'Photosynthesis', role: 'trap', family: 'neighbor-fact', trap: 'A plant trait', note: 'No fungus photosynthesizes. Every fungus, chytrids included, absorbs food it digested outside its body.' },
      { text: 'Cell walls built from cellulose instead of chitin', role: 'trap', family: 'neighbor-fact', trap: 'The water mold wall', note: 'Cellulose walls belong to plants and to the fungus-like water molds. Chytrid walls are chitin, like every other fungus.' },
      { text: 'Multicellularity', role: 'trap', family: 'reversed', trap: 'Points the other way', note: 'Most chytrids are single cells or simple threads. Big multicellular bodies belong to the molds and mushrooms.' },
      { text: 'Asexual only', role: 'trap', family: 'neighbor-fact', trap: 'The imperfect fungi idea', note: 'Chytrids reproduce both sexually and asexually. Asexual only was the old catch-all for fungi with no known sexual stage.' }
    ],
    lockIt: 'Only chytrids swim. Every other fungus lost the flagellum.',
    hook: null,
    playWith: { label: 'Field Guide, Fungi tab: open Chytridiomycota and see the swimming spore', href: FIELD_GUIDE, state: { tab: 'fungi', mode: 'chytrid' }, expect: ['data-fungi="chytrid"'], routing: TAB('Phylogenetic Field Guide', 'Fungi') + ' Chytridiomycota is a button inside it.' },
    video: VID('bio.diversity.fungi', 'Fungi: sort the phyla by their spores'),
    visual: {
      type: 'bio.tree',
      root: fungiTree('Chytridiomycota', 'Flagellated spores'),
      focus: 'Chytridiomycota',
      reuse: 'new: a pure bracket-tree renderer (initTree and initCladogramBuilder in tools/bio/bio-shared.js are DOM-bound)',
      alt: 'A tree of the fungi. Every fungus shares chitin walls and absorbed food; chytrids branch off first and are outlined as the answer, the only group whose spores swim with a flagellum. On the branch to all the other fungi, a bar marks where the flagellum was lost.',
      caption: 'Look for the bar on the branch: past it, no fungus swims. Chytrids sit before it.'
    },
    demoPick: 'Cell walls built from cellulose instead of chitin',
    flags: [
      { kind: 'stem-style', text: 'The choice "Asexual only" is a two-word fragment beside full phrases. Suggested, not applied: "Reproduction that is only asexual". Key unchanged.' }
    ]
  },

  /* ================================================= Ecology and behavior */
  {
    qid: 'fm:bio:BIO_e009',
    servesAlso: [],
    section: 'bio',
    subtopic: 'bio.ecology.nutrient-cycles',
    difficulty: D(2),
    source: FM('bio:BIO_e009', 20),
    keyText: 'N₂ to NH₃',
    answer: { line: 'Fixation is the step that pulls N2 out of the air and turns it into ammonia.' },
    steps: [
      'Start in the air. N2 is most of the atmosphere, but its triple bond keeps almost every organism from using it.',
      'Fixation is the one step that breaks that bond: bacteria with nitrogenase turn N2 into NH3.',
      'Every other choice starts from nitrogen that is already fixed, so it comes later. Each one is a numbered step in the picture.'
    ],
    choices: [
      { text: 'NH₃ to NO₃⁻', role: 'trap', family: 'neighbor-fact', trap: 'The next step', note: 'That is nitrification: soil bacteria oxidize ammonia to nitrite, then nitrate. It starts from nitrogen fixation already delivered.' },
      { text: 'NO₃⁻ to N₂', role: 'trap', family: 'reversed', trap: 'The cycle run backward', note: 'That is denitrification. It sends nitrogen back to the air, the opposite of fixation, which brings it in.' },
      { text: 'N₂ to NH₃', role: 'key', note: 'Nitrogenase in bacteria, free living or in root nodules, breaks the triple bond and makes ammonia.' },
      { text: 'NH₄⁺ to amino acids in plant tissue', role: 'trap', family: 'neighbor-fact', trap: 'Building it into tissue', note: 'That is assimilation: a plant builds fixed nitrogen into its own amino acids. Fixation had to happen first.' },
      { text: 'Organic to inorganic', role: 'trap', family: 'neighbor-fact', trap: 'The decomposers\' step', note: 'That is ammonification: decomposers free ammonium from dead matter. It recycles nitrogen already in living things.' }
    ],
    lockIt: 'Fixation is the only way in from the air: N2 to NH3.',
    hook: null,
    playWith: { label: 'Biogeochem Cycles tab: pick the nitrogen cycle and follow the atom step by step', href: EVO_LAB, state: { tab: 'cycles', cycle: 'nitrogen' }, expect: ['data-cycle="nitrogen"', 'cyclesBody'], routing: TAB('Selection Simulator lab', 'Biogeochem Cycles') + ' Nitrogen is a button inside it.' },
    video: VID('bio.ecology.nutrient-cycles', 'The nitrogen cycle: follow the atom'),
    visual: {
      type: 'bio.diagram',
      diagram: 'pathway',
      labels: ['n2', 'ammonia', 'nitrite', 'nitrate', 'organic-n'],
      focus: 'fixation',
      cols: 3, gap: 40,
      nodes: [
        { id: 'n2', label: 'N2 gas', sub: 'in the air', col: 1, row: 0, kind: 'start', w: 0.86 },
        { id: 'no3', label: 'NO3-', sub: 'nitrate', col: 0, row: 1, w: 0.7 },
        { id: 'org', label: 'Organic N', sub: 'in living things', col: 1, row: 1, w: 0.72 },
        { id: 'nh', label: 'NH3, NH4+', sub: 'in the soil', col: 2, row: 1, w: 0.7 },
        { id: 'no2', label: 'NO2-', sub: 'nitrite', col: 1, row: 2, w: 0.7 }
      ],
      edges: [
        { from: 'n2', to: 'nh', n: 1, key: true, choice: 'N₂ to NH₃' },
        { from: 'nh', to: 'no2', n: 2, choice: 'NH₃ to NO₃⁻' },
        { from: 'no2', to: 'no3', n: 2 },
        { from: 'no3', to: 'org', n: 3 },
        { from: 'nh', to: 'org', n: 3, at: 0.9, toAt: 0.9, choice: 'NH₄⁺ to amino acids in plant tissue' },
        { from: 'org', to: 'nh', n: 4, at: 0.36, toAt: 0.36, choice: 'Organic to inorganic' },
        { from: 'no3', to: 'n2', n: 5, choice: 'NO₃⁻ to N₂' }
      ],
      legend: [
        { n: 1, label: 'Fixation: bacteria turn N2 into ammonia', key: true },
        { n: 2, label: 'Nitrification: NH4+ to NO2- to NO3-' },
        { n: 3, label: 'Assimilation: plants build nitrate or ammonium into amino acids' },
        { n: 4, label: 'Ammonification: decomposers free NH4+ from dead matter' },
        { n: 5, label: 'Denitrification: NO3- back to N2 gas' }
      ],
      reuse: 'new: the bio.diagram pathway layout (boxes and numbered arrows on a grid)',
      alt: 'The nitrogen cycle as five boxes joined by numbered arrows: N2 gas in the air, ammonia in the soil, nitrite, nitrate, and organic nitrogen in living things. Arrow 1, fixation from N2 to ammonia, is drawn in green and named the answer in the legend. The other arrows are nitrification, assimilation, ammonification and denitrification, one for each trap.',
      caption: 'Every choice is a numbered step here. Only arrow 1 starts in the air.'
    },
    demoPick: 'NH₃ to NO₃⁻',
    flags: [
      { kind: 'stem-style', text: 'The stem ends on "converts:" (a completion stem), and the choice "Organic to inorganic" is a fragment beside formula choices. Suggested, not applied: "...converts which form of nitrogen into which?" and "Organic nitrogen to ammonium". Key unchanged.' }
    ]
  },
  {
    qid: 'fm:bio:BIO_xp008',
    servesAlso: [],
    section: 'bio',
    subtopic: 'bio.ecology.food-webs',
    difficulty: D(3),
    source: FM('bio:BIO_xp008', 22),
    keyText: 'Trophic cascade; secondary-consumer numbers decline, primary consumers rebound, producer biomass decreases',
    answer: { line: 'The new predator pushes each level below it the other way in turn: down, up, down.' },
    steps: [
      'Start at the top and trace one level at a time. The new predator eats the secondary consumers, so they decline.',
      'Fewer secondary consumers means less predation on the primary consumers. Released, they rebound.',
      'More grazers eat more plants, so producer biomass falls. The pattern alternates all the way down.'
    ],
    choices: [
      { text: 'Trophic cascade; secondary-consumer numbers decline, primary consumers rebound, producer biomass decreases', role: 'key', note: 'Down, up, down: each level flips the one below it.' },
      { text: 'Trophic cascade; secondary-consumer numbers decline, primary consumers also decline, producer biomass INCREASES', role: 'trap', family: 'half-right', trap: 'Skipped the flip', note: 'The cascade and the drop in secondary consumers are right. But prey rise when their predator falls, so primary consumers rebound and the plants lose.' },
      { text: 'No effect; the new predator only eats producers', role: 'trap', family: 'neighbor-fact', trap: 'A plant eater\'s role', note: 'An animal that eats producers is a primary consumer by definition. A tertiary consumer eats secondary consumers, and that starts the cascade.' },
      { text: 'Loss of primary consumers across the food web', role: 'trap', family: 'neighbor-fact', trap: 'The secondary consumers\' job', note: 'Eating herbivores is what secondary consumers do. The new top predator eats the secondary consumers instead, which spares the herbivores.' },
      { text: 'Linear decline in all populations', role: 'trap', family: 'one-step-short', trap: 'A predator lowers everything', note: 'This stops at "predators lower numbers" and paints every level with it. Trace the chain and the effects alternate.' }
    ],
    lockIt: 'In a trophic cascade, each level moves opposite to the level above it.',
    hook: null,
    playWith: { label: 'Ecology tab, food web builder: drag organisms onto the four trophic levels and see the energy passed up', href: EVO_LAB, state: { tab: 'eco' }, expect: ['webOrgList', 'Food web builder'], routing: TAB('Selection Simulator lab', 'Ecology') + ' It shows the levels and the energy rule; it does not animate a cascade.' },
    video: VID('bio.ecology.food-webs', 'Food webs and the trophic cascade'),
    visual: {
      type: 'bio.chart',
      kind: 'levels',
      levels: [
        { label: 'Tertiary consumer', sub: 'the new top predator', before: 0, after: 14, change: 'new', word: 'added' },
        { label: 'Secondary consumers', before: 40, after: 16, change: 'down', word: 'decline' },
        { label: 'Primary consumers', before: 60, after: 92, change: 'up', word: 'rebound' },
        { label: 'Producers', sub: 'plant biomass', before: 100, after: 60, change: 'down', word: 'decrease' }
      ],
      keyLabel: 'answer',
      choice: 'Trophic cascade; secondary-consumer numbers decline, primary consumers rebound, producer biomass decreases',
      focus: 'alternation',
      reuse: 'new: bio.chart levels (illustrative bars, no numbers on an axis)',
      alt: 'Illustrative bars for four trophic levels before and after a top predator is added. The new predator appears at the top; secondary consumers decline, primary consumers rebound and producer biomass decreases. The column of changes, down, up, down, is outlined as the answer.',
      caption: 'Read the right-hand column from the top. Each level moves opposite to the one above it.'
    },
    demoPick: 'Trophic cascade; secondary-consumer numbers decline, primary consumers also decline, producer biomass INCREASES',
    flags: [
      { kind: 'letter-cite', text: 'The bank explanation says "Option A describes this classic four-level cascade correctly", citing a letter; the player shows this explainer instead. The bank has no per-choice trap notes for this item, so every note here is new. Key unchanged.' },
      { kind: 'stem-style', text: 'A choice capitalizes INCREASES for emphasis. Suggested, not applied: "increases". Key unchanged.' },
      { kind: 'tool-gap', text: 'No Ace Labs tool animates a trophic cascade yet. The food web builder (Ecology tab) places organisms on levels and shows the energy rule only.' }
    ]
  },

  /* ============================================================ Evolution */
  {
    qid: 'fm:bio:BIO_e005',
    servesAlso: [],
    section: 'bio',
    subtopic: 'bio.evolution.selection-modes',
    difficulty: D(2),
    source: FM('bio:BIO_e005', 30),
    keyText: 'Stabilizing',
    answer: { line: 'Selection against both extremes keeps the peak narrow and in place. That is stabilizing selection.' },
    steps: [
      'Read the two clues: weights cluster tightly in the middle, and the average has barely moved.',
      'Ask which shape gives a tight peak that stays put. Trim both tails and the spread narrows while the average holds.',
      'Very small and very large babies both fared worse, so the middle wins. That is stabilizing selection.'
    ],
    choices: [
      { text: 'Directional', role: 'trap', family: 'neighbor-fact', trap: 'A peak that slides', note: 'Directional selection moves the average one way over generations. The stem says the average held still.' },
      { text: 'Drift', role: 'trap', family: 'neighbor-fact', trap: 'Chance, not selection', note: 'Drift is random change in allele frequency, not selection at all. Chance would not hold a trait tight at one value.' },
      { text: 'Sexual selection acting on a trait that improves mating success', role: 'trap', family: 'neighbor-fact', trap: 'The mating pressure', note: 'Sexual selection acts on traits that win mates. Birth weight is about infant survival, a different pressure.' },
      { text: 'Stabilizing', role: 'key', note: 'Both tails trimmed, the middle favored: one narrow peak that stays put.' },
      { text: 'Disruptive', role: 'trap', family: 'reversed', trap: 'Both ends favored', note: 'Disruptive selection favors both extremes over the middle and splits the peak in two, the opposite of one tight cluster.' }
    ],
    lockIt: 'Peak narrows and stays: stabilizing. Peak slides: directional. Peak splits: disruptive.',
    hook: null,
    playWith: { label: 'Selection Modes tab: switch between stabilizing, directional and disruptive and compare the curves', href: EVO_LAB, state: { tab: 'selmode', mode: 'stabilizing' }, expect: ['data-sel="stabilizing"', 'data-sel="disruptive"'], routing: TAB('Selection Simulator lab', 'Selection Modes') + ' Each mode is a button inside it.' },
    video: VID('bio.evolution.selection-modes', 'Three shapes of natural selection'),
    visual: {
      type: 'bio.chart',
      kind: 'selection',
      x: 'birth weight',
      before: { mean: 0, sd: 1 },
      panels: [
        { title: 'Stabilizing', note: 'both tails trimmed; the peak stays put', after: [{ mean: 0, sd: 0.55 }], key: true, choice: 'Stabilizing', meanLabel: 'about 7 lb' },
        { title: 'Directional', note: 'the peak slides one way', after: [{ mean: 0.95, sd: 0.85 }], choice: 'Directional' },
        { title: 'Disruptive', note: 'two peaks; the middle loses', after: [{ mean: -1.3, sd: 0.5, w: 0.5 }, { mean: 1.3, sd: 0.5, w: 0.5 }], choice: 'Disruptive' }
      ],
      focus: 'stabilizing',
      reuse: 'new: bio.chart selection (curves computed from mean and spread)',
      alt: 'Three small charts of birth weight, each with the starting bell curve dashed. Stabilizing, outlined as the answer, keeps the peak at about 7 pounds and makes it narrower; directional slides the peak to one side; disruptive splits it into two peaks.',
      caption: 'Compare each solid curve with the dashed one. Only stabilizing keeps the peak where it was.'
    },
    demoPick: 'Directional',
    flags: [
      { kind: 'note', text: 'The choice "Drift" is not a type of natural selection, which the stem asks for. It still works as a distractor; no change asked.' }
    ]
  },

  /* ============================================================== Meiosis */
  {
    qid: 'fm:originals:ab-d8063fa866',
    servesAlso: [],
    section: 'bio',
    subtopic: 'bio.genetics.meiosis',
    difficulty: D(3),
    source: FM('originals:ab-d8063fa866', 15),
    keyText: '16 at metaphase I and 8 at metaphase II',
    answer: { line: 'Copying once makes 16 chromatids at metaphase I. Meiosis I halves the chromosomes, but sisters stay joined: 8 at metaphase II.' },
    steps: [
      'Count the copies first. 2n = 8 means 8 chromosomes, and S phase copies each one once, so metaphase I holds 16 chromatids.',
      'Meiosis I pulls the homologs apart. Each new cell gets 4 chromosomes, and each is still two sister chromatids.',
      'Sisters split only at anaphase II. So metaphase II holds 4 x 2 = 8 chromatids.'
    ],
    choices: [
      { text: '16 at metaphase I and 8 at metaphase II', role: 'key', note: '8 chromosomes copied once make 16; half the chromosomes, still doubled, make 8.' },
      { text: '16 at metaphase I and 16 at metaphase II', role: 'trap', family: 'one-step-short', trap: 'Forgot the first split', note: 'This leaves out meiosis I. By metaphase II the cell has split once, so it holds half the DNA it had at metaphase I.' },
      { text: '32 at metaphase I and 16 at metaphase II', role: 'trap', family: 'one-step-too-far', trap: 'Copied twice', note: 'This treats 8 as already copied and doubles again. DNA is copied once, in S phase, so 8 chromosomes give 16 chromatids.' },
      { text: '8 at metaphase I and 4 at metaphase II', role: 'trap', family: 'other-unit', trap: 'Counted chromosomes', note: 'These are the chromosome counts at both stages. Each chromosome here is two chromatids, so double each number.' },
      { text: '16 at metaphase I and 4 at metaphase II', role: 'trap', family: 'half-right', trap: 'Switched units midway', note: 'Metaphase I is counted in chromatids, but metaphase II switches to chromosomes. Four chromosomes, each still doubled, make 8 chromatids.' }
    ],
    lockIt: 'Chromatids double once in S phase and halve at each division; sisters stay joined until anaphase II.',
    hook: null,
    playWith: { label: 'Meiosis node: before and after S phase, the chromosome and chromatid counts side by side', href: 'tools/bio/bio-genetics.html#node-meiosis', state: { node: 'meiosis' }, expect: ['node-meiosis', 'sister chromatids'], routing: 'Works today: the anchor opens the meiosis node, a written walk-through with retrieval cards.' },
    video: VID('bio.genetics.meiosis', 'Meiosis: count chromosomes, then chromatids'),
    visual: {
      type: 'bio.diagram',
      diagram: 'chromosomes',
      view: 'meiosis-counts',
      n2: 8,
      keyStages: ['mi', 'mii'],
      steps: ['S phase copies each chromosome once', 'meiosis I pulls the homologs apart'],
      labels: ['start', 'metaphase-I', 'metaphase-II'],
      focus: 'chromatid-counts',
      choice: '16 at metaphase I and 8 at metaphase II',
      reuse: 'new: bio.diagram chromosomes (the counts under each cell are read off the drawing)',
      alt: 'Three cells. At the start, 8 single chromosomes in 4 colored pairs; at metaphase I, the pairs line up side by side, 8 chromosomes made of 16 chromatids; at metaphase II, one of each pair, 4 chromosomes made of 8 chromatids. The two chromatid counts, 16 and 8, are marked as the answer.',
      caption: 'Count the rods in each cell. After copying, every chromosome is two rods side by side.'
    },
    demoPick: '8 at metaphase I and 4 at metaphase II',
    flags: []
  },
  {
    qid: 'fm:bio:BIO_g077',
    servesAlso: [],
    section: 'bio',
    subtopic: 'bio.genetics.chromosome-abnormalities',
    difficulty: D(2),
    source: FM('bio:BIO_g077', 25),
    keyText: 'Trisomies',
    answer: { line: 'Think scale. A whole extra chromosome throws off hundreds of genes at once. Autosomal trisomies are the largest cause of early loss.' },
    steps: [
      'Ask what error is big enough to stop development early. One base or one flipped piece rarely is; a whole extra chromosome is.',
      'Among early losses with a chromosome error, autosomal trisomies are the largest group, well ahead of triploidy and structural changes.',
      'Trisomies come from nondisjunction in meiosis: a pair fails to separate, so one gamete carries an extra copy.'
    ],
    choices: [
      { text: 'Translocations', role: 'trap', family: 'close-second', trap: 'Real, but rarer', note: 'An unbalanced translocation can end a pregnancy, often passed down from a balanced carrier parent. It accounts for far fewer losses than trisomies.' },
      { text: 'Point mutations', role: 'trap', family: 'neighbor-fact', trap: 'Too small a change', note: 'One base change usually affects one protein. That is rarely enough on its own to stop development.' },
      { text: 'Inversions', role: 'trap', family: 'neighbor-fact', trap: 'Nothing lost or gained', note: 'An inversion flips a piece in place and keeps every gene, so carriers are often unaffected.' },
      { text: 'Triploidy, from two sperm fertilizing one egg', role: 'trap', family: 'close-second', trap: 'Real, but less common', note: 'Triploidy, often from two sperm entering one egg, does cause early loss. As a group, the autosomal trisomies are more common.' },
      { text: 'Trisomies', role: 'key', note: 'One whole extra chromosome, from nondisjunction: the largest single class of early loss.' }
    ],
    lockIt: 'Early loss most often traces to a whole extra chromosome: an autosomal trisomy.',
    hook: null,
    playWith: { label: 'Chromosomal Abnormalities tab: compare aneuploidy, polyploidy, translocations and inversions', href: 'tools/bio/bio-genetics.html#genStudio', state: { tab: 'chrab', mode: 'aneu' }, expect: ['data-chrab="aneu"', 'data-chrab="poly"', 'data-chrab="trans"', 'data-chrab="inv"'], routing: TAB('Genetics Studio', 'Chromosomal Abnormalities') + ' Each change is a button inside it.' },
    video: VID('bio.genetics.chromosome-abnormalities', 'Chromosome errors: which ones matter most'),
    visual: {
      type: 'bio.diagram',
      diagram: 'chromosomes',
      view: 'changes',
      items: [
        { id: 'normal', title: 'Normal pair', note: 'two copies of one chromosome' },
        { id: 'trisomy', title: 'Trisomy', note: 'a whole extra copy: hundreds of genes at three doses; the largest group of early losses', key: true, choice: 'Trisomies' },
        { id: 'triploidy', title: 'Triploidy', note: 'a full extra set; a real cause, but less common', choice: 'Triploidy, from two sperm fertilizing one egg' },
        { id: 'translocation', title: 'Translocation', note: 'pieces trade places; harmful when a gamete gets them unbalanced', choice: 'Translocations' },
        { id: 'inversion', title: 'Inversion', note: 'a piece flipped; nothing gained or lost', choice: 'Inversions' },
        { id: 'point', title: 'Point mutation', note: 'one base changed; usually one protein', choice: 'Point mutations' }
      ],
      labels: ['normal', 'trisomy', 'triploidy', 'translocation', 'inversion', 'point-mutation'],
      focus: 'trisomy',
      reuse: 'new: bio.diagram chromosomes (side-by-side compare)',
      alt: 'Six small chromosome pictures in a grid: a normal pair, a trisomy with one whole extra copy, triploidy with a full extra set, a translocation, an inversion and a point mutation. Trisomy is outlined as the answer and noted as the largest group of early losses.',
      caption: 'Compare how much each change throws off. A trisomy adds a whole chromosome\'s worth of genes.'
    },
    demoPick: 'Triploidy, from two sperm fertilizing one egg',
    flags: [
      { kind: 'note', text: 'The bank files this item under Meiosis; it fits through nondisjunction, and the explainer says so in step 3. The subtopic here is chromosome abnormalities.' }
    ]
  },

  /* ======================================================= Photosynthesis */
  {
    qid: 'fm:written:bio-5-nd28q3',
    servesAlso: [],
    section: 'bio',
    subtopic: 'bio.cell.photosynthesis.light-reactions',
    difficulty: D(3),
    source: FM('written:bio-5-nd28q3', 10),
    keyText: 'Electron transport continues while ATP synthesis collapses',
    answer: { line: 'The leak drains the proton gradient. The chain still pumps, but ATP synthase has nothing left to run on.' },
    steps: [
      'Put the gradient in the middle. Electron transport pumps H+ into the lumen; ATP synthase spends that gradient to make ATP.',
      'Make the membrane leak and H+ slips back without turning ATP synthase. The gradient is gone, so ATP synthesis collapses.',
      'Nothing blocked the carriers. Light still drives electrons from water to NADP+, and with no gradient pushing back they may run faster.'
    ],
    choices: [
      { text: 'Both electron transport and ATP synthesis speed up together', role: 'trap', family: 'half-right', trap: 'Only the chain speeds up', note: 'Electron transport can run faster with no gradient pushing back. ATP synthesis cannot rise once the gradient is gone.' },
      { text: 'Electron transport continues while ATP synthesis collapses', role: 'key', note: 'The pumps keep pumping; the turbine stops. That is uncoupling.' },
      { text: 'Water splitting stops while NADPH production continues', role: 'trap', family: 'half-right', trap: 'Split the chain in two', note: 'NADPH production does continue, but its electrons come from water splitting, so water splitting keeps going too.' },
      { text: 'Electron transport halts while ATP synthesis continues', role: 'trap', family: 'reversed', trap: 'Swapped the two effects', note: 'The leak hits the gradient, not the carriers. So the chain keeps going, and ATP synthesis is what stops.' },
      { text: 'The Calvin cycle speeds up because more protons reach the stroma', role: 'trap', family: 'reversed', trap: 'Protons as fuel', note: 'Protons leaking into the stroma do no work. The Calvin cycle needs ATP, so it slows.' }
    ],
    lockIt: 'An uncoupler drains the gradient: electron transport keeps running, ATP synthesis stops. Chloroplast or mitochondrion, same rule.',
    hook: 'Pumps keep pumping. The turbine stops.',
    playWith: { label: 'Photosynthesis scrubber: drag through the light reactions to ATP synthase and the Calvin cycle', href: PHOTO, state: { node: 'photo', zone: 'atps' }, expect: ['zSchemeBody', 'data-zone="atps"'], routing: 'Works today. It shows the normal flow; a proton leak is not one of its states.' },
    video: VID('bio.cell.photosynthesis.light-reactions', 'Light reactions: the gradient and the turbine'),
    visual: {
      type: 'bio.diagram',
      diagram: 'thylakoid',
      leak: true,
      labels: ['electron-chain', 'proton-pump', 'atp-synthase', 'leak'],
      focus: 'leak',
      reuse: 'new: bio.diagram thylakoid (membrane slice, numbered parts)',
      alt: 'A slice of thylakoid membrane, stroma above and lumen below. Electrons still run through photosystem II, cytochrome b6f and photosystem I to NADPH, and water splitting and b6f still load H+ into the lumen, but H+ leaks straight back through a hole in the membrane, outlined as the answer. ATP synthase sits idle; no ATP is made.',
      caption: 'Follow the H+ arrows. With the leak open, they skip ATP synthase entirely.'
    },
    demoPick: 'Electron transport halts while ATP synthesis continues',
    flags: [
      { kind: 'note', text: 'Over minutes NADP+ would run short and the chain would slow; the stem asks the immediate effect, so the key holds (expert note).' }
    ]
  },
  {
    qid: 'fm:written:bio-5-xm2ae3',
    servesAlso: [],
    section: 'bio',
    subtopic: 'bio.cell.photosynthesis.calvin-cycle',
    difficulty: D(2),
    source: FM('written:bio-5-xm2ae3', 17),
    keyText: 'Two molecules of the three carbon acid 3-PGA',
    answer: { line: 'Five carbons plus one makes six, and that six-carbon piece splits at once into two 3-PGA.' },
    steps: [
      'Count carbons. RuBP brings 5 and carbon dioxide brings 1, so RuBisCO makes a 6-carbon piece.',
      'That 6-carbon piece is unstable. It splits at once into two 3-carbon acids, 3-PGA.',
      'G3P comes later, after ATP and NADPH reduce 3-PGA. Stop at the first step, as the stem does.'
    ],
    choices: [
      { text: 'One two carbon fragment and one three carbon acid', role: 'trap', family: 'other-conditions', trap: 'RuBisCO grabbed oxygen', note: 'That pair comes from RuBisCO adding O2 instead of CO2: photorespiration. With carbon dioxide you get two 3-PGA.' },
      { text: 'Two molecules of G3P, ready to leave the cycle', role: 'trap', family: 'one-step-too-far', trap: 'Two steps ahead', note: 'G3P appears after ATP and NADPH reduce 3-PGA. It is not what comes out of the first step.' },
      { text: 'Two molecules of the three carbon acid 3-PGA', role: 'key', note: '5 + 1 = 6 carbons, split into two 3-carbon acids.' },
      { text: 'One stable six carbon sugar that leaves the cycle', role: 'trap', family: 'one-step-short', trap: 'Stopped at six', note: 'A 6-carbon piece does form, but it lasts an instant. It splits in half before anything leaves the cycle.' },
      { text: 'One four carbon oxaloacetate', role: 'trap', family: 'other-conditions', trap: 'The C4 enzyme', note: 'Oxaloacetate is what PEP carboxylase makes in C4 and CAM plants. RuBisCO makes 3-PGA.' }
    ],
    lockIt: 'RuBisCO: 5 carbons plus 1 makes 6, and the 6 splits into two 3s.',
    hook: null,
    playWith: { label: 'Photosynthesis scrubber: drag into the Calvin cycle and watch RuBisCO fix carbon dioxide', href: PHOTO, state: { node: 'photo', zone: 'calv' }, expect: ['zSchemeBody', 'data-zone="calv"'], routing: 'Works today: the anchor opens the photosynthesis node and its scrubber.' },
    video: VID('bio.cell.photosynthesis.calvin-cycle', 'The Calvin cycle: count the carbons'),
    visual: {
      type: 'bio.diagram',
      diagram: 'pathway',
      labels: ['co2', 'rubp', 'six-carbon', '3-pga', 'g3p'],
      focus: 'first-step',
      cols: 3, gap: 36,
      nodes: [
        { id: 'co2', label: 'CO2', sub: '1 carbon', col: 1, row: 0, kind: 'start', w: 0.8 },
        { id: 'rubp', label: 'RuBP', sub: '5 carbons', col: 0, row: 1, w: 0.8 },
        { id: 'six', label: '6-carbon piece', sub: 'splits at once', col: 1, row: 1, w: 0.8 },
        { id: 'pga', label: '2 x 3-PGA', sub: '3 carbons each', col: 2, row: 1, key: true, w: 0.86, choice: 'Two molecules of the three carbon acid 3-PGA' },
        { id: 'g3p', label: 'G3P', sub: 'some leave as sugar', col: 1, row: 2, w: 0.8 }
      ],
      edges: [
        { from: 'rubp', to: 'six', key: true },
        { from: 'co2', to: 'six', key: true },
        { from: 'six', to: 'pga', key: true, n: 1 },
        { from: 'pga', to: 'g3p', n: 2 },
        { from: 'g3p', to: 'rubp', n: 3 }
      ],
      legend: [{ n: 1, label: 'Fixation by RuBisCO: RuBP and CO2, 5 + 1 = 6 carbons, split at once into two 3-PGA', key: true }].concat(CALVIN_LEGEND),
      swatches: [{ sw: '#00704f', label: 'green arrows: step 1, fixation' }],
      reuse: 'new: the bio.diagram pathway layout',
      alt: 'The Calvin cycle as boxes and arrows. RuBP, 5 carbons, and CO2, 1 carbon, join into a 6-carbon piece that splits at once into two 3-PGA of 3 carbons each, outlined as the answer. Arrows then run on to G3P, using ATP and NADPH, and back to RuBP.',
      caption: 'Add the carbons along the green arrows: 5 plus 1 is 6. Then watch the 6 break into two 3s.'
    },
    demoPick: 'One stable six carbon sugar that leaves the cycle',
    flags: []
  },
  {
    qid: 'fm:written:bio-5-a4a4xb',
    servesAlso: [],
    section: 'bio',
    subtopic: 'bio.cell.photosynthesis.calvin-cycle',
    difficulty: D(3),
    source: FM('written:bio-5-a4a4xb', 18),
    keyText: 'RuBP falls and 3-PGA rises',
    answer: { line: 'Darkness stops the steps that need ATP. 3-PGA is made but not used, so it piles up; RuBP is used but not rebuilt.' },
    steps: [
      'Split the cycle at RuBisCO. Fixation, RuBP plus CO2 to 3-PGA, needs no ATP; using 3-PGA and rebuilding RuBP both need ATP.',
      'Turn off the light and ATP and NADPH run out within seconds. 3-PGA keeps being made but stops being used, so it piles up.',
      'RuBisCO keeps using RuBP for a few seconds, and none is rebuilt. RuBP falls.'
    ],
    choices: [
      { text: 'RuBP rises and 3-PGA falls', role: 'trap', family: 'other-conditions', trap: 'Cut off CO2 instead', note: 'That is the pattern when CO2 runs out with the light on: fixation stops, RuBP piles up and 3-PGA drains.' },
      { text: 'Both rise together', role: 'trap', family: 'half-right', trap: 'Only one piles up', note: '3-PGA does rise. RuBP is still being used and no longer rebuilt, so it cannot rise.' },
      { text: 'Both fall immediately', role: 'trap', family: 'half-right', trap: 'Only one drains', note: 'RuBP does fall. But fixation keeps running for a few seconds, so 3-PGA builds up instead of dropping.' },
      { text: 'Neither changes until the leaf runs out of carbon dioxide', role: 'trap', family: 'neighbor-fact', trap: 'Took dark reactions literally', note: 'The Calvin cycle needs ATP and NADPH from the light reactions, so darkness shows up within seconds. The old name, dark reactions, misleads here.' },
      { text: 'RuBP falls and 3-PGA rises', role: 'key', note: 'Made but not used piles up; used but not rebuilt drains.' }
    ],
    lockIt: 'Block a step: the molecule just before it piles up, and the one just after it drains.',
    hook: null,
    playWith: { label: 'Photosynthesis scrubber: see where ATP and NADPH from the light reactions enter the Calvin cycle', href: PHOTO, state: { node: 'photo', zone: 'calv' }, expect: ['zSchemeBody', 'data-zone="calv"'], routing: 'Works today. It shows the lit cycle; switching the light off is not one of its states.' },
    video: VID('bio.cell.photosynthesis.calvin-cycle', 'The Calvin cycle: count the carbons'),
    visual: {
      type: 'bio.diagram',
      diagram: 'pathway',
      labels: ['rubp', 'rubisco', '3-pga', 'g3p', 'light'],
      focus: 'levels-in-the-dark',
      cols: 3, gap: 38,
      nodes: [
        { id: 'rubp', label: 'RuBP', col: 0, row: 0, key: true, change: 'down', changeText: 'falls', w: 0.8 },
        { id: 'rub', label: 'RuBisCO', sub: '+ CO2; no ATP needed', col: 1, row: 0, kind: 'protein', w: 0.8 },
        { id: 'pga', label: '3-PGA', col: 2, row: 0, key: true, change: 'up', changeText: 'piles up', w: 0.8, choice: 'RuBP falls and 3-PGA rises' },
        { id: 'g3p', label: 'G3P', col: 1, row: 1, w: 0.7 },
        { id: 'dark', label: 'Lights off', sub: 'no ATP, no NADPH', col: 1, row: 2, kind: 'blocked', w: 0.9 }
      ],
      edges: [
        { from: 'rubp', to: 'rub', key: true },
        { from: 'rub', to: 'pga', key: true, n: 1 },
        { from: 'pga', to: 'g3p', n: 2, style: 'blocked' },
        { from: 'g3p', to: 'rubp', n: 3, style: 'blocked' },
        { from: 'dark', to: 'g3p', style: 'blocked' }
      ],
      legend: [{ n: 1, label: 'Fixation by RuBisCO: needs no ATP, so it keeps running for a few seconds' }].concat(CALVIN_LEGEND.map((x) => Object.assign({}, x, { label: x.label + '; stopped in the dark' }))),
      swatches: [{ sw: '#9b4500', label: 'crossed, dashed arrows: steps that stop without ATP' }],
      reuse: 'new: the bio.diagram pathway layout',
      alt: 'The Calvin cycle in the dark. RuBisCO still joins RuBP and CO2 into 3-PGA, which needs no ATP, but the two arrows that need ATP, 3-PGA to G3P (which also needs NADPH) and G3P back to RuBP, are crossed out. RuBP, marked falls, and 3-PGA, marked piles up, are outlined as the answer.',
      caption: 'Find the crossed-out arrows. The box before them piles up; the box they used to refill drains.'
    },
    demoPick: 'RuBP rises and 3-PGA falls',
    flags: []
  },
  {
    qid: 'fm:written:bio-5-1hzdpw4',
    servesAlso: [],
    section: 'bio',
    subtopic: 'bio.cell.photosynthesis.calvin-cycle',
    difficulty: D(1),
    source: FM('written:bio-5-1hzdpw4', 26),
    keyText: 'ADP and NADP+',
    answer: { line: 'The Calvin cycle spends ATP and NADPH and sends the empties, ADP and NADP+, back to be recharged.' },
    steps: [
      'Here is the loop: the light reactions charge carriers, and the Calvin cycle spends them.',
      'A spent ATP is ADP plus phosphate. A spent NADPH is NADP+.',
      'Those empties go back to the thylakoid to be recharged. Stall either trip and the other stops within seconds.'
    ],
    choices: [
      { text: 'ADP and NADP+', role: 'key', note: 'The empty carriers, heading back to be recharged.' },
      { text: 'Carbon dioxide and G3P', role: 'trap', family: 'neighbor-fact', trap: 'The cycle\'s input and output', note: 'CO2 comes in from the air and G3P leaves to become sugar. Neither one goes back to the thylakoid.' },
      { text: 'Oxygen and water', role: 'trap', family: 'neighbor-fact', trap: 'The thylakoid\'s own traffic', note: 'Water is split at the thylakoid and oxygen leaves the leaf. The Calvin cycle sends neither one back.' },
      { text: 'ATP and NADPH', role: 'trap', family: 'reversed', trap: 'The trip out', note: 'These are the charged carriers that arrive at the Calvin cycle. The stem asks what goes back.' },
      { text: 'Glucose and phosphate', role: 'trap', family: 'half-right', trap: 'Phosphate yes, glucose no', note: 'Phosphate does go back, riding with ADP. Glucose is built from G3P after it leaves the cycle and never returns.' }
    ],
    lockIt: 'Charged carriers, ATP and NADPH, go to the stroma; the empties, ADP and NADP+, come back.',
    hook: 'Full trucks out, empty trucks back.',
    playWith: { label: 'Photosynthesis scrubber: drag from the light reactions into the Calvin cycle and back', href: PHOTO, state: { node: 'photo', zone: 'calv' }, expect: ['zSchemeBody', 'data-zone="calv"'], routing: 'Works today: the anchor opens the photosynthesis node and its scrubber.' },
    video: VID('bio.cell.photosynthesis.calvin-cycle', 'The Calvin cycle: count the carbons'),
    visual: {
      type: 'bio.diagram',
      diagram: 'pathway',
      labels: ['light-reactions', 'calvin-cycle'],
      focus: 'return-trip',
      cols: 3, gap: 14,
      nodes: [
        { id: 'light', label: 'Light reactions', sub: 'thylakoid', col: 0, row: 0, kind: 'start', w: 0.9, minH: 176 },
        { id: 'calvin', label: 'Calvin cycle', sub: 'stroma', col: 2, row: 0, w: 0.9, minH: 176 },
        { id: 'lio', label: 'H2O in, O2 out', col: 0, row: 1, kind: 'note' },
        { id: 'cio', label: 'CO2 in, G3P out', col: 2, row: 1, kind: 'note' }
      ],
      edges: [
        { from: 'light', to: 'calvin', at: 0.42, label: 'ATP', labelDy: -12 },
        { from: 'light', to: 'calvin', at: 0.58, label: 'NADPH', labelDy: -12 },
        { from: 'calvin', to: 'light', at: 0.74, label: 'ADP + Pi', key: true, labelDy: -12, choice: 'ADP and NADP+' },
        { from: 'calvin', to: 'light', at: 0.9, label: 'NADP+', key: true, labelDy: -12 }
      ],
      swatches: [{ sw: '#3b4a43', label: 'gray arrows out: charged carriers' }, { sw: '#00704f', label: 'green arrows back: the empties, the answer' }],
      reuse: 'new: the bio.diagram pathway layout',
      alt: 'Two boxes, the light reactions in the thylakoid and the Calvin cycle in the stroma, joined by four arrows. ATP and NADPH run out to the Calvin cycle; ADP plus phosphate and NADP+ run back, drawn in green as the answer. Water, oxygen, carbon dioxide and G3P stay on their own sides.',
      caption: 'Read the green arrows pointing back to the thylakoid. Those are the empties.'
    },
    demoPick: 'ATP and NADPH',
    flags: []
  },
  {
    qid: 'fm:written:bio-5-104j1lu',
    servesAlso: [],
    section: 'bio',
    subtopic: 'bio.cell.photosynthesis.light-reactions',
    difficulty: D(2),
    source: FM('written:bio-5-104j1lu', 40),
    keyText: 'From the lumen into the stroma, with the ATP appearing in the stroma',
    answer: { line: 'Protons crowd the lumen and flow back out through ATP synthase. Its head faces the stroma, so ATP appears there.' },
    steps: [
      'Find where the protons pile up. Water splitting and cytochrome b6f load H+ into the thylakoid lumen.',
      'Pumps push uphill; the turbine runs downhill. H+ flows down its gradient through ATP synthase, out of the lumen into the stroma.',
      'Check where the head sits. It sticks into the stroma, so ATP is made right where the Calvin cycle spends it.'
    ],
    choices: [
      { text: 'From the stroma into the lumen, with the ATP appearing in the lumen', role: 'trap', family: 'reversed', trap: 'The pumping direction', note: 'Stroma to lumen is the way the carriers pump H+, uphill. Through the synthase H+ runs the other way, and ATP never appears in the lumen.' },
      { text: 'From the cytosol into the stroma, with the ATP appearing in the stroma', role: 'trap', family: 'neighbor-fact', trap: 'Borrowed the mitochondrion', note: 'The cytosol sits outside the chloroplast and is not part of this gradient. This borrows an outside-to-inside layout like the mitochondrion\'s.' },
      { text: 'From the lumen into the stroma, with the ATP appearing in the lumen', role: 'trap', family: 'half-right', trap: 'Right flow, other side', note: 'The proton direction is right. But the head of the enzyme faces the stroma, so the ATP is released there.' },
      { text: 'From the lumen into the stroma, with the ATP appearing in the stroma', role: 'key', note: 'Downhill out of the lumen; ATP made in the stroma, next to the Calvin cycle.' },
      { text: 'From the stroma into the lumen, with the ATP appearing in the stroma', role: 'trap', family: 'half-right', trap: 'Right side, other flow', note: 'ATP does appear in the stroma. But H+ moves through the synthase down its gradient, out of the lumen, not into it.' }
    ],
    lockIt: 'Protons run downhill out of the lumen through ATP synthase; the ATP appears in the stroma.',
    hook: null,
    playWith: { label: 'Photosynthesis scrubber: drag to ATP synthase and watch protons leave the lumen', href: PHOTO, state: { node: 'photo', zone: 'atps' }, expect: ['zSchemeBody', 'data-zone="atps"'], routing: 'Works today: the anchor opens the photosynthesis node and its scrubber.' },
    video: VID('bio.cell.photosynthesis.light-reactions', 'Light reactions: the gradient and the turbine'),
    visual: {
      type: 'bio.diagram',
      diagram: 'thylakoid',
      leak: false,
      labels: ['electron-chain', 'proton-pump', 'atp-synthase'],
      focus: 'atp-synthase',
      reuse: 'new: bio.diagram thylakoid (membrane slice, numbered parts)',
      alt: 'A slice of thylakoid membrane with the stroma above and the lumen below. Electrons run from water through photosystem II, cytochrome b6f and photosystem I to NADPH, while water splitting and b6f load H+ into the lumen; ATP synthase, outlined as the answer, lets H+ flow back up into the stroma, where its head makes ATP.',
      caption: 'Follow the H+ arrow through ATP synthase, lumen to stroma. The ATP comes off the head in the stroma.'
    },
    demoPick: 'From the lumen into the stroma, with the ATP appearing in the lumen',
    flags: []
  },

  /* =============================================== Replication and mitosis */
  {
    qid: 'fm:written:bio-7-p9zot1',
    servesAlso: [],
    section: 'bio',
    subtopic: 'bio.cell.cycle.apoptosis',
    difficulty: D(2),
    source: FM('written:bio-7-p9zot1', 6),
    keyText: 'The extrinsic pathway, working through a death receptor, activating caspase-8',
    answer: { line: 'The signal came from outside, through Fas, a death receptor. That is the extrinsic pathway, and its first caspase is caspase-8.' },
    steps: [
      'Spot where the signal starts. Fas ligand on the T cell binds Fas on the target\'s surface, so the signal comes from outside: extrinsic.',
      'Fas clusters and pulls in procaspase-8, so caspase-8 is the first caspase switched on.',
      'Caspase-8 then turns on executioners such as caspase-3. Cytochrome c and caspase-9 belong to the inside route, through the mitochondrion.'
    ],
    choices: [
      { text: 'The extrinsic pathway, working through a death receptor, activating caspase-8', role: 'key', note: 'Outside signal, death receptor, caspase-8 first.' },
      { text: 'The extrinsic pathway, working through cytochrome c release, activating caspase-9', role: 'trap', family: 'half-right', trap: 'Right name, inside parts', note: 'Extrinsic is right. Cytochrome c and caspase-9 belong to the intrinsic route, which starts at the mitochondrion.' },
      { text: 'Neither pathway, since Fas binding produces necrosis rather than apoptosis', role: 'trap', family: 'neighbor-fact', trap: 'Mixed up with necrosis', note: 'Fas runs a controlled caspase program with every mark of apoptosis. Necrosis is uncontrolled swelling and bursting.' },
      { text: 'The intrinsic pathway, working through a death receptor, activating caspase-3 first', role: 'trap', family: 'half-right', trap: 'Receptor right, rest off', note: 'A death receptor is right, but that makes it extrinsic. Caspase-3 is an executioner, switched on after the initiator.' },
      { text: 'The intrinsic pathway, working through the mitochondrion, activating caspase-9', role: 'trap', family: 'neighbor-fact', trap: 'The other pathway', note: 'This describes the intrinsic route, set off by damage inside the cell. This signal came from outside, through a surface receptor.' }
    ],
    lockIt: 'Outside signal through a death receptor: extrinsic, caspase-8. Inside damage through the mitochondrion: intrinsic, caspase-9.',
    hook: null,
    playWith: { label: 'Innate vs adaptive immunity page: the cytotoxic T cell card lists its weapons, Fas ligand among them', href: 'tools/bio/bio-immune-cells.html', state: null, expect: ['Fas-FasL'], routing: 'Works today as a reference card. No Ace Labs tool walks the two apoptosis pathways yet.' },
    video: VID('bio.cell.cycle.apoptosis', 'Apoptosis: two ways in, one way out'),
    visual: {
      type: 'bio.diagram',
      diagram: 'pathway',
      labels: ['fas-ligand', 'fas', 'caspase-8', 'damage', 'mitochondrion', 'caspase-9', 'executioners'],
      focus: 'extrinsic',
      cols: 2, gap: 24,
      heads: [{ col: 0, label: 'Extrinsic: signal from outside' }, { col: 1, label: 'Intrinsic: trouble inside' }],
      bands: [{ row: 1 }],
      nodes: [
        { id: 'fasl', label: 'Fas ligand', sub: 'on the T cell', col: 0, row: 0, kind: 'start', w: 0.86 },
        { id: 'fas', label: 'Fas', sub: 'death receptor', col: 0, row: 1, kind: 'protein', w: 0.86 },
        { id: 'c8', label: 'Caspase-8', sub: 'first caspase on', col: 0, row: 2, key: true, w: 0.86, choice: 'The extrinsic pathway, working through a death receptor, activating caspase-8' },
        { id: 'dmg', label: 'DNA damage', sub: 'or other stress', col: 1, row: 2, kind: 'start', w: 0.86 },
        { id: 'mito', label: 'Mitochondrion', sub: 'releases cytochrome c', col: 1, row: 3, w: 0.86 },
        { id: 'c9', label: 'Caspase-9', sub: 'first caspase on', col: 1, row: 4, w: 0.86 },
        { id: 'c3', label: 'Caspase-3, 6, 7', sub: 'executioners take the cell apart', col: 0, row: 5, span: 2, w: 0.8 }
      ],
      edges: [
        { from: 'fasl', to: 'fas', key: true },
        { from: 'fas', to: 'c8', key: true },
        { from: 'dmg', to: 'mito' },
        { from: 'mito', to: 'c9' },
        { from: 'c8', to: 'c3', key: true, at: 0.5, toAt: 0.25 },
        { from: 'c9', to: 'c3', at: 0.5, toAt: 0.75 }
      ],
      regions: [{ row: 1, col: 1, label: 'cell membrane' }],
      reuse: 'new: the bio.diagram pathway layout with a membrane band',
      alt: 'Two routes into apoptosis. Left, extrinsic: Fas ligand on a T cell binds the Fas death receptor in the membrane, and caspase-8 switches on first, outlined as the answer. Right, intrinsic: damage inside makes the mitochondrion release cytochrome c, and caspase-9 switches on; both routes end at the executioner caspases.',
      caption: 'Start where the signal starts. Fas sits in the membrane, so follow the left side down.'
    },
    demoPick: 'The intrinsic pathway, working through the mitochondrion, activating caspase-9',
    flags: [
      { kind: 'tool-gap', text: 'No Ace Labs tool shows the extrinsic and intrinsic apoptosis pathways. The play-with link is a reference card only; a pathway view would fit the Cell Lab.' },
      { kind: 'note', text: 'In some cells caspase-8 also cleaves Bid and recruits the mitochondrial route as an amplifier; the first caspase is still caspase-8, so the key holds (expert note).' }
    ]
  },
  {
    qid: 'fm:written:bio-7-3vie62',
    servesAlso: [],
    section: 'bio',
    subtopic: 'bio.cell.cycle.mitosis',
    difficulty: D(2),
    source: FM('written:bio-7-3vie62', 14),
    keyText: 'Metaphase, held by balanced pull from microtubules reaching to each pole',
    answer: { line: 'One tight line in the middle, gripped from both sides, is metaphase. Equal pull from the two poles holds it there.' },
    steps: [
      'Read the scene the stem describes. One tight line across the middle is the metaphase plate.',
      'Gripped from both sides means each chromosome\'s two kinetochores are hooked to microtubules from opposite poles.',
      'The two pulls come out even, so the line holds. The spindle checkpoint waits for exactly this before anaphase starts.'
    ],
    choices: [
      { text: 'Telophase, held by the two nuclear envelopes that are reassembling nearby', role: 'trap', family: 'neighbor-fact', trap: 'Two stages later', note: 'In telophase the chromosomes sit at the two poles and unwind while envelopes re-form. Nothing is lined up in the middle.' },
      { text: 'Interphase, held by the cell plate that is forming across the equator', role: 'trap', family: 'neighbor-fact', trap: 'Before division starts', note: 'Interphase chromatin is too loose to see as separate chromosomes. A cell plate belongs to plant cytokinesis, after mitosis.' },
      { text: 'Prophase, held together by a nuclear envelope that has not yet broken down', role: 'trap', family: 'neighbor-fact', trap: 'One stage early', note: 'Prophase chromosomes condense but sit scattered inside the nucleus, with nothing gripping them yet.' },
      { text: 'Metaphase, held by balanced pull from microtubules reaching to each pole', role: 'key', note: 'Balanced pull from both poles: the metaphase plate.' },
      { text: 'Anaphase, held in place by the contractile ring forming around the equator', role: 'trap', family: 'neighbor-fact', trap: 'One stage late', note: 'In anaphase the sisters have left the middle, so you would see two groups moving apart. The contractile ring belongs to animal cytokinesis.' }
    ],
    lockIt: 'One line, pulled evenly from both poles: metaphase.',
    hook: null,
    playWith: { label: 'Cell Cycle tab: step around G1, S, G2 and M and the three checkpoints, the spindle checkpoint included', href: CELL_LAB, state: { tab: 'cycle', checkpoint: 'spindle' }, expect: ['cycleSvg', 'data-checkpoint="spindle"'], routing: TAB('Cell Lab', 'Cell Cycle') + ' Its Play cycle button animates the wheel only when pressed.' },
    video: VID('bio.cell.cycle.mitosis', 'Mitosis: read the stage off the picture'),
    visual: {
      type: 'bio.diagram',
      diagram: 'chromosomes',
      view: 'mitosis-stages',
      stages: [
        { id: 'interphase', title: 'Interphase', note: 'loose chromatin, nothing to see', choice: 'Interphase, held by the cell plate that is forming across the equator' },
        { id: 'prophase', title: 'Prophase', note: 'condensed and scattered', choice: 'Prophase, held together by a nuclear envelope that has not yet broken down' },
        { id: 'metaphase', title: 'Metaphase', note: 'one line, pulled from both poles', key: true, choice: 'Metaphase, held by balanced pull from microtubules reaching to each pole' },
        { id: 'anaphase', title: 'Anaphase', note: 'sisters pulled apart', choice: 'Anaphase, held in place by the contractile ring forming around the equator' },
        { id: 'telophase', title: 'Telophase', note: 'two nuclei; the cell pinches', choice: 'Telophase, held by the two nuclear envelopes that are reassembling nearby' }
      ],
      labels: ['interphase', 'prophase', 'metaphase', 'anaphase', 'telophase'],
      focus: 'metaphase',
      reuse: 'new: bio.diagram chromosomes (stage strip)',
      alt: 'Five small cells, one per stage: interphase with loose chromatin, prophase with condensed chromosomes scattered in the nucleus, metaphase with one line of chromosomes held by fibers from both poles, anaphase with two groups moving apart, and telophase with two nuclei forming. Metaphase is outlined as the answer.',
      caption: 'Find the one cell with a single line in the middle and fibers reaching it from both sides.'
    },
    demoPick: 'Anaphase, held in place by the contractile ring forming around the equator',
    flags: [
      { kind: 'note', text: 'Metaphase II of meiosis would look the same; the stem says "a dividing cell" and only one metaphase choice is served, so there is no ambiguity (expert note).' }
    ]
  },
  {
    qid: 'fm:written:bio-7-1v7ag0l',
    servesAlso: [],
    section: 'bio',
    subtopic: 'bio.cell.cycle.apoptosis',
    difficulty: D(2),
    source: FM('written:bio-7-1v7ag0l', 16),
    keyText: 'Proteases, switched on by cleavage, initiator caspases activating executioner ones',
    answer: { line: 'Caspases are proteases. They wait as inactive precursors, and each active one cuts the next one on: initiators first, then executioners.' },
    steps: [
      'Name the enzyme family: caspases are proteases that cut proteins after aspartate.',
      'They sit ready as inactive procaspases. A cut switches each one on, so the cell can commit fast without making anything new.',
      'Initiators, caspase-8 or 9, cut the executioners, caspase-3, 6 and 7, on. The executioners then cut hundreds of cell proteins.'
    ],
    choices: [
      { text: 'Proteases, switched on by cleavage, initiator caspases activating executioner ones', role: 'key', note: 'Cutting is both how they switch on and how they work.' },
      { text: 'Nucleases, activated by a calcium surge, which cut the plasma membrane into blebs', role: 'trap', family: 'neighbor-fact', trap: 'A later helper', note: 'A nuclease does chop DNA late in apoptosis, downstream of the caspases. A nuclease cannot cut a membrane.' },
      { text: 'Phosphatases, activated by cytochrome c, which strip phosphate off the mitotic spindle', role: 'trap', family: 'half-right', trap: 'Right trigger, other enzyme', note: 'Cytochrome c is part of apoptosis, but it switches on a protease cascade through caspase-9. Stripping phosphates off the spindle is not part of cell death.' },
      { text: 'Kinases, activated by cyclin binding, which phosphorylate the nuclear lamins', role: 'trap', family: 'neighbor-fact', trap: 'The mitosis enzymes', note: 'Cyclin-dependent kinases phosphorylate lamins to take the nuclear envelope apart for mitosis. A nearby process, not cell death.' },
      { text: 'Ligases, activated by ATP binding, which crosslink the cytoskeleton into a rigid mesh', role: 'trap', family: 'reversed', trap: 'Building, not cutting', note: 'Ligases join molecules. Apoptosis takes cell structures apart, the opposite job.' }
    ],
    lockIt: 'Caspases are proteases switched on by cuts: initiators cut executioners on, and executioners take the cell apart.',
    hook: null,
    playWith: { label: 'Innate vs adaptive immunity page: the cytotoxic T cell card names granzymes, which set off the caspase cascade', href: 'tools/bio/bio-immune-cells.html', state: null, expect: ['granzyme'], routing: 'Works today as a reference card. No Ace Labs tool steps through the caspase cascade yet.' },
    video: VID('bio.cell.cycle.apoptosis', 'Apoptosis: two ways in, one way out'),
    visual: {
      type: 'bio.diagram',
      diagram: 'pathway',
      labels: ['procaspase-initiator', 'initiator', 'procaspase-executioner', 'executioner', 'targets'],
      focus: 'cut-to-activate',
      cols: 2, gap: 34,
      heads: [{ col: 0, label: 'Waiting: inactive' }, { col: 1, label: 'Cut, so active' }],
      nodes: [
        { id: 'p8', label: 'Procaspase', sub: '8 or 9, always present', col: 0, row: 0, w: 0.8 },
        { id: 'i8', label: 'Caspase-8, 9', sub: 'initiator, active', col: 1, row: 0, key: true, tag: 'protease', w: 0.8 },
        { id: 'p3', label: 'Procaspase', sub: '3, 6, 7, always present', col: 0, row: 1, w: 0.8 },
        { id: 'e3', label: 'Caspase-3, 6, 7', sub: 'executioners, active', col: 1, row: 1, key: true, tag: 'protease', w: 0.8 },
        { id: 'tg', label: 'Hundreds of cell proteins cut', sub: 'lamins, cytoskeleton, repair enzymes', col: 0, row: 2, span: 2, kind: 'end', w: 0.8 }
      ],
      edges: [
        { from: 'p8', to: 'i8', key: true, label: 'cut' },
        { from: 'i8', to: 'p3', key: true, label: 'cuts' },
        { from: 'p3', to: 'e3', key: true, label: 'cut' },
        { from: 'e3', to: 'tg', key: true, label: 'cut', at: 0.5, toAt: 0.75 }
      ],
      swatches: [{ sw: '#00704f', label: 'green arrows: one protein cutting another, the answer' }],
      reuse: 'new: the bio.diagram pathway layout',
      alt: 'A cascade of cuts. An inactive procaspase-8 or 9 is cut into an active initiator; the initiator cuts procaspase-3, 6 and 7 into active executioners; the executioners cut hundreds of cell proteins. Every arrow is a protease cut, drawn in green as the answer.',
      caption: 'Every green arrow is one protein cutting another. That is what a protease does.'
    },
    demoPick: 'Kinases, activated by cyclin binding, which phosphorylate the nuclear lamins',
    flags: [
      { kind: 'tool-gap', text: 'No Ace Labs tool steps through the caspase cascade. The play-with link is a reference card only.' }
    ]
  },

  /* ========================================== Reproduction and development */
  {
    qid: 'fm:bio:BIO_dev007',
    servesAlso: [],
    section: 'bio',
    subtopic: 'bio.devo.extraembryonic',
    difficulty: D(2),
    source: FM('bio:BIO_dev007', 5),
    keyText: 'Allantois',
    answer: { line: 'A shelled embryo cannot flush its waste, so it stores uric acid in a sac off its gut: the allantois.' },
    steps: [
      'List the four membranes with one job each: amnion cushions, chorion trades gas, yolk sac feeds, allantois stores waste.',
      'A bird embryo is sealed in a shell, so its waste has nowhere to go. It packs uric acid, nearly insoluble and low in toxicity, into the allantois.',
      'Albumen is the egg white the hen packed in. It is not a membrane.'
    ],
    choices: [
      { text: 'Chorion', role: 'trap', family: 'neighbor-fact', trap: 'The gas exchanger', note: 'The chorion lines the shell and trades gases with the air, working with the allantois. It stores no waste.' },
      { text: 'The albumen surrounding the embryo', role: 'trap', family: 'neighbor-fact', trap: 'Egg white, not a membrane', note: 'Albumen is water and protein the hen packed in. It is a supply for the embryo, not a structure that collects waste.' },
      { text: 'Amnion', role: 'trap', family: 'neighbor-fact', trap: 'The cushion', note: 'The amnion is the fluid-filled sac around the embryo. It cushions and keeps it moist; it holds water, not waste.' },
      { text: 'Allantois', role: 'key', note: 'The waste sac: it stores uric acid until hatching.' },
      { text: 'Yolk sac', role: 'trap', family: 'neighbor-fact', trap: 'Traffic the other way', note: 'The yolk sac delivers food from the yolk to the embryo. That is traffic in, not waste out.' }
    ],
    lockIt: 'Amnion cushions, chorion breathes, yolk sac feeds, allantois stores waste.',
    hook: null,
    playWith: { label: 'Extra-embryonic tab: the amnion, chorion, allantois and yolk sac on one egg', href: EMBRYO, state: { tab: 'extra' }, expect: ['extraBody', 'data-tab="extra"'], routing: TAB('Embryo Atlas', 'Extra-embryonic') },
    video: VID('bio.devo.extraembryonic', 'The amniote egg: four membranes, four jobs'),
    visual: {
      type: 'bio.diagram',
      diagram: 'amniote-egg',
      labels: ['chorion', 'amnion', 'allantois', 'yolk-sac', 'albumen'],
      focus: 'allantois',
      legendText: { Chorion: 'lines the shell; trades gas with the air', Amnion: 'fluid cushion around the embryo', Allantois: 'stores uric acid waste', 'Yolk sac': 'delivers food from the yolk', Albumen: 'egg white from the hen; not a membrane' },
      reuse: 'new: bio.diagram amniote egg (numbered parts, legend under it)',
      alt: 'A shelled egg in cross section with five numbered parts: the chorion just inside the shell, the amnion around the embryo, the allantois as a sac on a stalk from the embryo, the yolk sac around the yolk, and the albumen. The allantois, the waste store, is outlined as the answer.',
      caption: 'Find the sac on a stalk from the embryo. That is where its waste goes.'
    },
    demoPick: 'Chorion',
    flags: [
      { kind: 'stem-style', text: 'The choice "The albumen surrounding the embryo" is the only one with an article and a description. Suggested, not applied: "Albumen". Key unchanged.' }
    ]
  },
  {
    qid: 'fm:bio:BIO_dev009',
    servesAlso: [],
    section: 'bio',
    subtopic: 'bio.devo.germ-layers',
    difficulty: D(2),
    source: FM('bio:BIO_dev009', 24),
    keyText: 'Ectoderm',
    answer: { line: 'The lens forms from surface ectoderm, after the optic vesicle grows out from the brain and touches it.' },
    steps: [
      'Trace the induction. The optic vesicle grows out of the forebrain and touches the surface ectoderm of the head.',
      'That touch tells the surface ectoderm to thicken into a lens placode, fold in and pinch off as the lens.',
      'So the retina comes from the brain side, and the lens from the outer layer the brain reached out and touched.'
    ],
    choices: [
      { text: 'Neural crest', role: 'trap', family: 'neighbor-fact', trap: 'Builds the eye\'s front', note: 'Neural crest builds the cornea\'s middle layer and the iris stroma, which makes it tempting. The lens comes from the surface layer instead.' },
      { text: 'Mesoderm and neural crest together', role: 'trap', family: 'neighbor-fact', trap: 'Real eye builders', note: 'Both build parts of the eye: muscles, vessels, corneal layers. Neither one makes the lens.' },
      { text: 'Ectoderm', role: 'key', note: 'Surface ectoderm, induced by the optic vesicle.' },
      { text: 'Mesoderm', role: 'trap', family: 'neighbor-fact', trap: 'The eye\'s muscles', note: 'Head mesoderm makes the muscles that move the eye and its blood vessels, not the clear lens.' },
      { text: 'Endoderm', role: 'trap', family: 'neighbor-fact', trap: 'Never reaches the eye', note: 'Endoderm lines the gut tube and the organs that bud from it. It never reaches the surface of the head.' }
    ],
    lockIt: 'The lens is surface ectoderm, induced by the optic vesicle; the retina comes from the brain.',
    hook: null,
    playWith: { label: 'Germ Layer Tracker tab: sort adult tissues into ectoderm, mesoderm and endoderm, the eye included', href: EMBRYO, state: { tab: 'germ' }, expect: ['germQuizBank', 'data-glayer="ecto"'], routing: TAB('Embryo Atlas', 'Germ Layer Tracker') },
    video: VID('bio.devo.germ-layers', 'Germ layers: which layer builds which tissue'),
    visual: {
      type: 'bio.tree',
      root: {
        label: 'Three germ layers', sub: 'laid down at gastrulation',
        children: [
          { label: 'Ectoderm', sub: 'the outer layer', key: true, choice: 'Ectoderm',
            children: [
              { label: 'Surface ectoderm', sub: 'skin epidermis, cornea surface',
                children: [{ label: 'Lens', sub: 'induced when the optic vesicle touches it', key: true, tag: 'start here' }] },
              { label: 'Neural tube', sub: 'brain and retina; the optic vesicle grows from here' },
              { label: 'Neural crest', sub: 'cornea stroma, iris stroma, face cartilage', choice: 'Neural crest' }
            ] },
          { label: 'Mesoderm', sub: 'eye muscles, blood vessels, bone', choice: 'Mesoderm' },
          { label: 'Endoderm', sub: 'gut lining, lungs, liver', choice: 'Endoderm' }
        ]
      },
      focus: 'lens',
      reuse: 'new: a pure bracket-tree renderer, here as a fate map',
      alt: 'A fate map from the three germ layers. Ectoderm, outlined as the answer, splits into surface ectoderm, neural tube and neural crest; the lens sits under surface ectoderm, and a green path runs from it back up to ectoderm. Mesoderm builds the eye muscles and vessels, and endoderm the gut lining.',
      caption: 'Follow the green path up from the lens. It never passes through the crest, mesoderm or endoderm.'
    },
    demoPick: 'Neural crest',
    flags: [
      { kind: 'note', text: 'Neural crest itself comes from ectoderm; "Ectoderm" in the key means surface ectoderm, which the picture shows. DAT-standard, no dispute (expert note).' }
    ]
  },

  /* ================================== The membrane and what crosses it */
  {
    qid: 'fm:written:bio-3-dh8m7c',
    servesAlso: [],
    section: 'bio',
    subtopic: 'bio.cell.signaling.second-messengers',
    difficulty: D(1),
    source: FM('written:bio-3-dh8m7c', 8),
    keyText: 'ATP',
    answer: { line: 'cAMP is AMP closed into a ring, cut straight out of ATP. Adenylyl points to adenine, so the enzyme starts from ATP.' },
    steps: [
      'Read the name. Adenylyl points to adenine, and cAMP is cyclic adenosine monophosphate.',
      'The enzyme takes ATP, pops off two phosphates as pyrophosphate, and closes the ring: cAMP.',
      'GTP sits upstream. GTP on the G protein switches the enzyme on, but the enzyme\'s raw material is ATP.'
    ],
    choices: [
      { text: 'PIP2', role: 'trap', family: 'neighbor-fact', trap: 'Phospholipase C\'s job', note: 'PIP2 is the membrane lipid that phospholipase C splits into IP3 and DAG, a neighbor pathway.' },
      { text: 'GTP', role: 'trap', family: 'neighbor-fact', trap: 'The switch, not the stock', note: 'GTP feeds guanylyl cyclase, which makes cGMP. GTP on the G protein switches adenylyl cyclase on, which is why it pulls.' },
      { text: 'ATP', role: 'key', note: 'Adenylyl cyclase cuts cAMP straight out of ATP.' },
      { text: 'Phosphocreatine', role: 'trap', family: 'neighbor-fact', trap: 'Muscle\'s backup phosphate', note: 'Phosphocreatine is muscle\'s quick reserve for remaking ATP. It is not a signaling substrate.' },
      { text: 'Cholesterol', role: 'trap', family: 'neighbor-fact', trap: 'The steroid starter', note: 'Cholesterol is the raw material for steroid hormones, not for a cyclic nucleotide.' }
    ],
    lockIt: 'Match the first letters: adenylyl cyclase takes ATP to cAMP; guanylyl cyclase takes GTP to cGMP.',
    hook: null,
    playWith: { label: 'Signal Transduction tab, GPCR view: follow the hormone to adenylyl cyclase and cAMP', href: CELL_LAB, state: { tab: 'sig', mode: 'gpcr' }, expect: ['data-sig-mode="gpcr"', 'sigSvg'], routing: TAB('Cell Lab', 'Signal Transduction') + ' The GPCR view opens first.' },
    video: VID('bio.cell.signaling.second-messengers', 'Second messengers: who makes what, from what'),
    visual: {
      type: 'bio.diagram',
      diagram: 'pathway',
      labels: ['atp', 'gtp', 'pip2', 'phosphocreatine', 'cholesterol'],
      focus: 'atp-to-camp',
      cols: 2, gap: 10,
      heads: [{ col: 0, label: 'Starting material' }, { col: 1, label: 'What it becomes, and how' }],
      nodes: [
        { id: 'atp', label: 'ATP', col: 0, row: 0, key: true, w: 0.8, choice: 'ATP' },
        { id: 'camp', label: 'cAMP', sub: 'by adenylyl cyclase', col: 1, row: 0, w: 0.8 },
        { id: 'gtp', label: 'GTP', col: 0, row: 1, w: 0.8, choice: 'GTP' },
        { id: 'cgmp', label: 'cGMP', sub: 'by guanylyl cyclase', col: 1, row: 1, w: 0.8 },
        { id: 'pip2', label: 'PIP2', sub: 'a membrane lipid', col: 0, row: 2, w: 0.8, choice: 'PIP2' },
        { id: 'ip3', label: 'IP3 + DAG', sub: 'by phospholipase C', col: 1, row: 2, w: 0.8 },
        { id: 'pcr', label: 'Phosphocreatine', sub: 'in muscle', col: 0, row: 3, w: 0.8, choice: 'Phosphocreatine' },
        { id: 'atp2', label: 'ATP again', sub: 'a quick phosphate reserve', col: 1, row: 3, w: 0.8 },
        { id: 'chol', label: 'Cholesterol', col: 0, row: 4, w: 0.8, choice: 'Cholesterol' },
        { id: 'ster', label: 'Steroid hormones', sub: 'by several enzymes', col: 1, row: 4, w: 0.8 }
      ],
      edges: [
        { from: 'atp', to: 'camp', key: true },
        { from: 'gtp', to: 'cgmp' },
        { from: 'pip2', to: 'ip3' },
        { from: 'pcr', to: 'atp2' },
        { from: 'chol', to: 'ster' }
      ],
      reuse: 'new: the bio.diagram pathway layout as a matching table',
      alt: 'A matching table: each starting material in the choices, an arrow, and what it becomes. ATP becomes cAMP through adenylyl cyclase, outlined as the answer; GTP becomes cGMP through guanylyl cyclase; PIP2 is split into IP3 and DAG by phospholipase C; phosphocreatine remakes ATP in muscle; cholesterol becomes steroid hormones.',
      caption: 'Read the top row. Adenylyl cyclase starts from ATP, guanylyl cyclase from GTP.'
    },
    demoPick: 'GTP',
    flags: []
  },
  {
    qid: 'fm:written:bio-3-2c5o89',
    servesAlso: [],
    section: 'bio',
    subtopic: 'bio.cell.signaling.receptors',
    difficulty: D(2),
    source: FM('written:bio-3-2c5o89', 9),
    keyText: 'Adds phosphate groups to tyrosines on its own cytoplasmic tails',
    answer: { line: 'The insulin receptor is a receptor tyrosine kinase. Binding switches its kinase on, and it phosphorylates its own tyrosines.' },
    steps: [
      'Name the receptor class first. Insulin uses a receptor tyrosine kinase, and the word kinase is the whole mechanism.',
      'Insulin binds the outer part. The two halves then add phosphates to tyrosines on each other\'s tails inside the cell.',
      'Those phosphotyrosines are docking sites. Relay proteins dock there and carry the message on, toward glucose uptake.'
    ],
    choices: [
      { text: 'Adds phosphate groups to tyrosines on its own cytoplasmic tails', role: 'key', note: 'A kinase working on itself: autophosphorylation of its own tyrosines.' },
      { text: 'Cleaves PIP2 into IP3 and DAG', role: 'trap', family: 'neighbor-fact', trap: 'Phospholipase C\'s move', note: 'Splitting PIP2 is the job of phospholipase C, a separate enzyme most often switched on by Gq receptors. It is not the insulin receptor\'s own first act.' },
      { text: 'Carries insulin with it into the nucleus', role: 'trap', family: 'other-conditions', trap: 'The steroid route', note: 'Riding the hormone to the nucleus is how steroid hormones work. Insulin is a peptide and signals from the surface.' },
      { text: 'Opens as an ion channel and lets sodium in', role: 'trap', family: 'neighbor-fact', trap: 'Ion channel receptors', note: 'Receptors that open for ions, like the acetylcholine receptor at muscle, are a different class. Insulin\'s receptor is an enzyme.' },
      { text: 'Exchanges GDP for GTP on an attached G protein at the inner surface', role: 'trap', family: 'neighbor-fact', trap: 'The G protein receptor', note: 'Swapping GDP for GTP on a G protein is what a G protein-coupled receptor does, the other big surface class.' }
    ],
    lockIt: 'Receptor tyrosine kinases phosphorylate their own tyrosines first; relay proteins dock on those phosphates.',
    hook: null,
    playWith: { label: 'Signal Transduction tab, receptor tyrosine kinase view: the receptor pairs up and phosphorylates itself', href: CELL_LAB, state: { tab: 'sig', mode: 'rtk' }, expect: ['data-sig-mode="rtk"', 'Auto-phosphorylation'], routing: TAB('Cell Lab', 'Signal Transduction') + ' The receptor tyrosine kinase view is one more click.' },
    video: VID('bio.cell.signaling.receptors', 'Four receptor classes and what each does next'),
    visual: {
      type: 'bio.diagram',
      diagram: 'pathway',
      labels: ['rtk', 'gpcr', 'ion-channel', 'gq-plc', 'steroid'],
      focus: 'autophosphorylation',
      cols: 3, gap: 10,
      vband: { col: 1 },
      heads: [{ col: 0, label: 'Outside: the signal' }, { col: 1, label: 'In the membrane' }, { col: 2, label: 'Inside: what happens next' }],
      nodes: [
        { id: 'ins', label: 'Insulin', col: 0, row: 0, kind: 'start', w: 0.86 },
        { id: 'rtk', label: 'Tyrosine kinase receptor', col: 1, row: 0, kind: 'protein', w: 0.86 },
        { id: 'autop', label: 'P added to its own tyrosines', col: 2, row: 0, key: true, w: 0.92, choice: 'Adds phosphate groups to tyrosines on its own cytoplasmic tails' },
        { id: 'epi', label: 'Epinephrine', col: 0, row: 1, kind: 'start', w: 0.86 },
        { id: 'gpcr', label: 'G protein receptor', col: 1, row: 1, kind: 'protein', w: 0.86 },
        { id: 'gdp', label: 'G protein swaps GDP for GTP', col: 2, row: 1, w: 0.92, choice: 'Exchanges GDP for GTP on an attached G protein at the inner surface' },
        { id: 'ach', label: 'ACh', sub: 'acetylcholine', col: 0, row: 2, kind: 'start', w: 0.86 },
        { id: 'chan', label: 'Ion channel receptor', col: 1, row: 2, kind: 'protein', w: 0.86 },
        { id: 'na', label: 'Opens; Na+ rushes in', col: 2, row: 2, w: 0.92, choice: 'Opens as an ion channel and lets sodium in' },
        { id: 'oth', label: 'Other hormones', col: 0, row: 3, kind: 'start', w: 0.86 },
        { id: 'gq', label: 'G protein receptor (Gq)', col: 1, row: 3, kind: 'protein', w: 0.86 },
        { id: 'plc', label: 'PLC splits PIP2', sub: 'phospholipase C', col: 2, row: 3, w: 0.92, choice: 'Cleaves PIP2 into IP3 and DAG' },
        { id: 'ster', label: 'Steroid', col: 0, row: 4, kind: 'start', w: 0.86 },
        { id: 'nuc', label: 'Its receptor rides to the nucleus', col: 2, row: 4, w: 0.92, choice: 'Carries insulin with it into the nucleus' }
      ],
      edges: [
        { from: 'ins', to: 'rtk', key: true }, { from: 'rtk', to: 'autop', key: true },
        { from: 'epi', to: 'gpcr' }, { from: 'gpcr', to: 'gdp' },
        { from: 'ach', to: 'chan' }, { from: 'chan', to: 'na' },
        { from: 'oth', to: 'gq' }, { from: 'gq', to: 'plc' },
        { from: 'ster', to: 'nuc', label: 'crosses', labelDy: -11 }
      ],
      reuse: 'new: the bio.diagram pathway layout with a membrane column',
      alt: 'Five signals in rows: signal outside, receptor in the membrane, next step inside. Insulin\'s receptor tyrosine kinase adds phosphate to its own tyrosines, outlined as the answer. The other rows: a G protein receptor swapping GDP for GTP, an ion channel letting Na+ in, phospholipase C splitting PIP2, a steroid riding to the nucleus.',
      caption: 'Find insulin\'s row and read across. The receptor is itself the kinase.'
    },
    demoPick: 'Exchanges GDP for GTP on an attached G protein at the inner surface',
    flags: [
      { kind: 'bank-copy', text: 'The bank trap note for "Carries insulin with it into the nucleus" says insulin "never enters the cell"; the insulin-receptor complex is taken in by endocytosis. Suggested: "Insulin signals from the surface; riding the hormone to the nucleus is the steroid route." This explainer uses that wording. Key unchanged.' }
    ]
  },
  {
    qid: 'fm:written:bio-3-x1d1j6',
    servesAlso: [],
    section: 'bio',
    subtopic: 'bio.cell.membrane.junctions',
    difficulty: D(2),
    source: FM('written:bio-3-x1d1j6', 12),
    keyText: 'A gap junction',
    answer: { line: 'Gap junctions are channels that join two cytoplasms, so ions pass straight across. That is how heart cells beat as one.' },
    steps: [
      'Match the job. Passing directly from cytoplasm to cytoplasm needs a channel through both membranes.',
      'In animal cells that channel is the gap junction, built from connexons.',
      'Heart cells pack gap junctions into their intercalated discs, so the action potential spreads from cell to cell.'
    ],
    choices: [
      { text: 'A hemidesmosome', role: 'trap', family: 'neighbor-fact', trap: 'Anchors to the floor', note: 'A hemidesmosome anchors a cell to the basement membrane below it, not to a neighbor cell.' },
      { text: 'A gap junction', role: 'key', note: 'Connexon channels: ions walk straight from one cell into the next.' },
      { text: 'A tight junction', role: 'trap', family: 'neighbor-fact', trap: 'A seal, not a channel', note: 'Tight junctions seal the space between cells so nothing leaks through. They do not join the cytoplasms.' },
      { text: 'A plasmodesma', role: 'trap', family: 'other-conditions', trap: 'The plant version', note: 'Plasmodesmata do this exact job, but through plant cell walls. Cardiac muscle is animal tissue.' },
      { text: 'A desmosome', role: 'trap', family: 'neighbor-fact', trap: 'A rivet, no channel', note: 'Desmosomes are rivets that hold cells together under stress. Heart discs have them too, but nothing passes through.' }
    ],
    lockIt: 'Gap junctions pass, tight junctions seal, desmosomes rivet, hemidesmosomes anchor.',
    hook: null,
    playWith: { label: 'Cytoskeleton node: the filaments that desmosomes anchor, with what holds tissues together', href: 'tools/bio/bio-cell.html#node-cytoskeleton', state: { node: 'cytoskeleton' }, expect: ['node-cytoskeleton', 'desmosomes'], routing: 'Works today: the anchor opens the cytoskeleton node. No Ace Labs tool shows cell junctions themselves yet.' },
    video: VID('bio.cell.membrane.junctions', 'Cell junctions: seal, rivet, anchor, pass'),
    visual: {
      type: 'bio.diagram',
      diagram: 'junctions',
      labels: ['tight-junction', 'desmosome', 'gap-junction', 'hemidesmosome'],
      focus: 'gap-junction',
      legendText: { 'Tight junction': 'seals the gap; nothing leaks between cells', Desmosome: 'a rivet; holds cells together, no channel', 'Gap junction': 'channels join the two cytoplasms; ions pass straight through', Hemidesmosome: 'anchors a cell to the basement membrane' },
      swatches: [{ sw: '#1f57b5', label: 'blue arrows: ions crossing from cell 1 into cell 2' }],
      reuse: 'new: bio.diagram junctions (numbered parts, legend under it)',
      alt: 'Two animal cells side by side with four numbered junctions: along their shared border, a tight junction sealing the gap, a desmosome riveting the cells and a gap junction with channels through both membranes and ions crossing; at the base, a hemidesmosome anchoring cell 1 to the basement membrane. The gap junction is outlined as the answer.',
      caption: 'Find the junction with arrows running straight through it. Only that one joins the two cytoplasms.'
    },
    demoPick: 'A desmosome',
    flags: [
      { kind: 'tool-gap', text: 'No Ace Labs tool shows cell junctions (tight, desmosome, gap, hemidesmosome). The play-with link goes to the cytoskeleton node, which mentions desmosomes only.' }
    ]
  },
  {
    qid: 'fm:written:bio-3-194ncsd',
    servesAlso: [],
    section: 'bio',
    subtopic: 'bio.cell.membrane.transport',
    difficulty: D(3),
    source: FM('written:bio-3-194ncsd', 13),
    keyText: 'The sodium gradient that powers the cotransporter runs down',
    answer: { line: 'The cotransporter runs on the sodium gradient the pump builds. Block the pump and the gradient drains, so glucose uptake fades.' },
    steps: [
      'Trace the energy. The Na+/K+ pump spends ATP to keep sodium low inside the cell.',
      'The cotransporter lets sodium run down that gradient and drags glucose in with it, uphill. It never touches ATP itself.',
      'Block the pump and sodium leaks in until the gradient is gone. That takes minutes, which is why uptake falls off then.'
    ],
    choices: [
      { text: 'The sodium gradient that powers the cotransporter runs down', role: 'key', note: 'No pump, no gradient, no free ride for glucose.' },
      { text: 'The cotransporter needs ATP, and the drug has cut off its supply', role: 'trap', family: 'neighbor-fact', trap: 'The pump\'s fuel', note: 'ATP powers the pump, primary active transport. The cotransporter never hydrolyzes ATP; it runs on the gradient.' },
      { text: 'The apical membrane depolarizes, which closes the carrier', role: 'trap', family: 'close-second', trap: 'A smaller side effect', note: 'Some depolarization does happen and trims the driving force. But the carrier does not close; losing the sodium gradient is the main cause.' },
      { text: 'The drug binds the glucose carrier directly and jams its binding site', role: 'trap', family: 'other-conditions', trap: 'A different drug', note: 'The stem says the drug blocks the pump. A delay of minutes fits a gradient running down, not a direct block of the carrier.' },
      { text: 'Glucose is no longer phosphorylated once it arrives inside the cell', role: 'trap', family: 'neighbor-fact', trap: 'Trapping, not powering', note: 'Hexokinase traps glucose in many cells by phosphorylating it. That is not the energy source for this carrier.' }
    ],
    lockIt: 'Secondary active transport runs on a gradient; look upstream for the pump that built it.',
    hook: null,
    playWith: { label: 'Membrane Transport tab: switch between the Na/K pump and the SGLT cotransporter', href: CELL_LAB, state: { tab: 'mem', mode: 'secondary' }, expect: ['data-mem-mode="primary"', 'data-mem-mode="secondary"'], routing: TAB('Cell Lab', 'Membrane Transport') + ' Each mode is a button inside it.' },
    video: VID('bio.cell.membrane.transport', 'Membrane transport: who pays, and how'),
    visual: {
      type: 'bio.diagram',
      diagram: 'pathway',
      labels: ['lumen', 'cotransporter', 'cell', 'pump', 'blood'],
      focus: 'gradient',
      cols: 3, gap: 22,
      bands: [{ row: 1 }, { row: 3 }],
      nodes: [
        { id: 'lumen', label: 'Gut lumen', sub: 'Na+ high; glucose', col: 0, row: 0, span: 2, kind: 'start', w: 0.86 },
        { id: 'sglt', label: 'Na+ glucose cotransporter', sub: 'Na+ runs in, drags glucose', col: 0, row: 1, span: 2, kind: 'protein', change: 'down', changeText: 'slows down', w: 0.86 },
        { id: 'cell', label: 'Inside the cell', sub: 'the gradient runs down', col: 0, row: 2, span: 2, key: true, change: 'up', changeText: 'Na+ builds up', w: 0.86, choice: 'The sodium gradient that powers the cotransporter runs down' },
        { id: 'pump', label: 'Na+/K+ pump', sub: 'spends ATP; blocked by the drug', col: 0, row: 3, span: 2, kind: 'blocked', w: 0.86 },
        { id: 'blood', label: 'Blood side', col: 0, row: 4, span: 2, kind: 'note', w: 0.86 }
      ],
      edges: [
        { from: 'lumen', to: 'sglt', key: true },
        { from: 'sglt', to: 'cell', key: true },
        { from: 'cell', to: 'pump', style: 'blocked', label: 'Na+ out', labelDx: 40 },
        { from: 'pump', to: 'blood', style: 'blocked' }
      ],
      regions: [{ row: 1, col: 2, label: 'top membrane' }, { row: 3, col: 2, label: 'bottom membrane' }],
      reuse: 'new: the bio.diagram pathway layout with two membrane bands',
      alt: 'An intestinal cell between the gut lumen above and the blood below. In the top membrane the sodium glucose cotransporter lets Na+ run in and drags glucose with it; in the bottom membrane the Na+/K+ pump, crossed out by the drug, no longer sends Na+ out. Inside, Na+ builds up and the gradient runs down, outlined as the answer.',
      caption: 'Find the crossed-out pump, then look up. The carrier above ran on the gradient that pump kept.'
    },
    demoPick: 'The cotransporter needs ATP, and the drug has cut off its supply',
    flags: [
      { kind: 'note', text: 'The expert left the family for "The drug binds the glucose carrier directly" to the writer (read-backward or neighbor-fact). Written as other-conditions: it describes a different drug, a carrier blocker, which the stem does not give.' }
    ]
  },
  {
    qid: 'fm:written:bio-3-i1qexy',
    servesAlso: [],
    section: 'bio',
    subtopic: 'bio.cell.membrane.transport',
    difficulty: D(2),
    source: FM('written:bio-3-i1qexy', 27),
    keyText: 'The carrier proteins are saturated, so transport has a ceiling',
    answer: { line: 'A plateau means a limited number of something. Here every glucose carrier is busy, so the rate cannot climb.' },
    steps: [
      'Look at the shape. Uptake rises, then flattens at a maximum.',
      'A ceiling means a fixed number of something. Here it is the glucose carriers, the GLUT proteins.',
      'Once every carrier is busy, more glucose outside cannot speed anything up. Simple diffusion would keep climbing in a straight line.'
    ],
    choices: [
      { text: 'Glucose is entering by simple diffusion straight through the lipid bilayer', role: 'trap', family: 'read-backward', trap: 'The no-ceiling route', note: 'Simple diffusion climbs in a straight line with concentration and never levels off. The plateau points the other way: to proteins.' },
      { text: 'The cell has begun pumping glucose back out at an equal rate', role: 'trap', family: 'neighbor-fact', trap: 'Invented an outflow', note: 'Nothing in the data shows glucose leaving. An outflow equal to the inflow would bring net uptake to zero, not hold it at a maximum.' },
      { text: 'Glucose crossing has switched over to active transport', role: 'trap', family: 'neighbor-fact', trap: 'Saw a mode change', note: 'Active carriers saturate too, so a plateau does not show a change of mode. Glucose entering down its gradient needs no energy.' },
      { text: 'The membrane became impermeable to glucose at high concentration', role: 'trap', family: 'neighbor-fact', trap: 'Shut the door', note: 'Membranes do not switch off at high concentration. Uptake holds at its maximum; it does not drop to zero.' },
      { text: 'The carrier proteins are saturated, so transport has a ceiling', role: 'key', note: 'Every carrier busy: the rate hits its ceiling.' }
    ],
    lockIt: 'A curve that levels off means saturated carrier proteins; a straight line means simple diffusion.',
    hook: 'Limited seats, so the rate tops out.',
    playWith: { label: 'Enzyme Kinetics tab: the same rise-then-level-off curve, drawn for an enzyme, with its Vmax line', href: CELL_LAB, state: { tab: 'kinetics', mode: 'none' }, expect: ['data-mode="none"', 'V<sub>max</sub>'], routing: TAB('Cell Lab', 'Enzyme Kinetics') + ' It plots an enzyme, not a carrier; the saturation idea is the same.' },
    video: VID('bio.cell.membrane.transport', 'Membrane transport: who pays, and how'),
    visual: {
      type: 'bio.chart',
      kind: 'saturation',
      x: 'glucose outside the cell',
      y: 'uptake rate',
      carrier: { vmax: 1, km: 0.22 },
      diffusion: { k: 0.22 },
      xmax: 3.5,
      labels: { carrier: 'carrier: rises, then levels off', diffusion: 'simple diffusion: no ceiling', ceiling: 'ceiling: every carrier busy' },
      choice: 'The carrier proteins are saturated, so transport has a ceiling',
      focus: 'plateau',
      reuse: 'new: bio.chart saturation (curves computed from vmax, km and k)',
      alt: 'A graph of uptake rate against outside glucose. The carrier curve, in green, rises steeply and then levels off at a dashed ceiling marked as the answer: every carrier busy. A dashed straight line for simple diffusion keeps climbing with no ceiling.',
      caption: 'Compare the two lines at the right edge. Only the carrier curve stops climbing.'
    },
    demoPick: 'Glucose is entering by simple diffusion straight through the lipid bilayer',
    flags: [
      { kind: 'bank-copy', text: 'The bank trap note for the efflux choice says growing efflux "would bend the curve downward rather than flatten it". Clearer: an outflow equal to the inflow would bring net uptake to zero, not hold it at a maximum. This explainer uses that wording. Key unchanged.' }
    ]
  },
  {
    qid: 'fm:written:bio-3-11djtx4',
    servesAlso: [],
    section: 'bio',
    subtopic: 'bio.cell.signaling.second-messengers',
    difficulty: D(3),
    source: FM('written:bio-3-11djtx4', 32),
    keyText: 'IP3 and DAG, and IP3 releases calcium from the smooth endoplasmic reticulum',
    answer: { line: 'Phospholipase C splits PIP2 into DAG, which stays in the membrane, and IP3, which travels to the smooth ER and lets calcium out.' },
    steps: [
      'Name the cut. Phospholipase C splits the membrane lipid PIP2 into two pieces: IP3 and DAG.',
      'Sort them by solubility. DAG is fatty and stays in the membrane; IP3 is water soluble and drifts through the cytosol.',
      'IP3 opens calcium channels on the smooth ER, and the calcium drives smooth muscle contraction.'
    ],
    choices: [
      { text: 'cAMP and cGMP, and cAMP activates protein kinase A in the cytoplasm of the cell', role: 'trap', family: 'neighbor-fact', trap: 'The cyclases\' products', note: 'cAMP and cGMP come from the two cyclases, not phospholipase C. The protein kinase A link is real, but it belongs to the cAMP pathway.' },
      { text: 'IP3 and DAG, and IP3 stays in the membrane to activate protein kinase C', role: 'trap', family: 'half-right', trap: 'Swapped the two pieces', note: 'The pair is right, but the roles are swapped. DAG stays in the membrane for protein kinase C; IP3 is the one that travels.' },
      { text: 'DAG and calcium, and DAG travels to the nucleus to bind DNA', role: 'trap', family: 'half-right', trap: 'Calcium comes later', note: 'DAG is one product, but calcium is released later, not made by the cut. DAG stays in the membrane; it does not bind DNA.' },
      { text: 'IP3 and DAG, and IP3 releases calcium from the smooth endoplasmic reticulum', role: 'key', note: 'Water-soluble IP3 travels to the smooth ER and lets the calcium out.' },
      { text: 'cAMP and calcium, and cAMP opens calcium channels in the nucleus', role: 'trap', family: 'neighbor-fact', trap: 'The adenylyl cyclase product', note: 'cAMP comes from adenylyl cyclase, not phospholipase C. The calcium store IP3 opens is the ER, not the nucleus.' }
    ],
    lockIt: 'Phospholipase C splits PIP2: fatty DAG stays in the membrane, water-soluble IP3 frees calcium from the ER.',
    hook: null,
    playWith: { label: 'Cell signaling node: the GPCR card names both branches, cAMP and the PLC route to IP3, DAG and calcium', href: 'tools/bio/bio-cell.html#node-signaling', state: { node: 'signaling' }, expect: ['node-signaling', 'PLC'], routing: 'Works today: the anchor opens the signaling node. The Signal Transduction lab has no phospholipase C view yet.' },
    video: VID('bio.cell.signaling.second-messengers', 'Second messengers: who makes what, from what'),
    visual: {
      type: 'bio.diagram',
      diagram: 'pathway',
      labels: ['hormone', 'receptor', 'plc', 'dag', 'ip3', 'pkc', 'smooth-er', 'calcium'],
      focus: 'ip3-to-er',
      cols: 3, gap: 26,
      bands: [{ row: 1 }],
      nodes: [
        { id: 'h', label: 'Hormone', col: 0, row: 0, kind: 'start', w: 0.86 },
        { id: 'rec', label: 'Receptor + Gq', col: 0, row: 1, kind: 'protein', w: 0.86 },
        { id: 'plc', label: 'PLC', sub: 'phospholipase C cuts PIP2', col: 1, row: 1, kind: 'protein', w: 0.86 },
        { id: 'dag', label: 'DAG', sub: 'fatty: stays in the membrane', col: 2, row: 1, w: 0.86 },
        { id: 'ip3', label: 'IP3', sub: 'water soluble: travels', col: 1, row: 2, w: 0.86 },
        { id: 'pkc', label: 'PKC', sub: 'protein kinase C, on', col: 2, row: 2, w: 0.86 },
        { id: 'er', label: 'Smooth ER', sub: 'calcium channels open', col: 1, row: 3, key: true, w: 0.9, choice: 'IP3 and DAG, and IP3 releases calcium from the smooth endoplasmic reticulum' },
        { id: 'ca', label: 'Calcium floods the cytosol', sub: 'smooth muscle contracts', col: 0, row: 4, span: 3, kind: 'end', w: 0.7 }
      ],
      edges: [
        { from: 'h', to: 'rec' },
        { from: 'rec', to: 'plc' },
        { from: 'plc', to: 'dag' },
        { from: 'plc', to: 'ip3', key: true },
        { from: 'dag', to: 'pkc' },
        { from: 'ip3', to: 'er', key: true },
        { from: 'er', to: 'ca', key: true }
      ],
      regions: [{ row: 0, col: 2, label: 'outside' }, { row: 2, col: 0, label: 'cytosol' }],
      reuse: 'new: the bio.diagram pathway layout with a membrane band',
      alt: 'A slice of membrane with the outside above and the cytosol below. A hormone\'s receptor turns on phospholipase C, which cuts PIP2 into DAG, staying in the membrane to switch on protein kinase C, and IP3, which travels down to the smooth ER. The ER\'s calcium channels open, outlined as the answer, and calcium floods the cytosol.',
      caption: 'Watch which piece leaves the membrane. DAG stays put; IP3 travels to the ER.'
    },
    demoPick: 'IP3 and DAG, and IP3 stays in the membrane to activate protein kinase C',
    flags: [
      { kind: 'tool-gap', text: 'The Signal Transduction lab (Cell Lab) has GPCR-cAMP, RTK, JAK/STAT, steroid and ligand-gated views but no phospholipase C, IP3 and DAG view. The play-with link goes to the signaling node text instead.' },
      { kind: 'note', text: 'In smooth muscle the calcium store is the sarcoplasmic reticulum, a specialized smooth ER; the key wording holds at DAT level (expert note).' }
    ]
  }
];

// What changed from the expert's suggested families, and the fixes from the
// expert review of B002 (coach record only).
const CHANGES = {
  'fm:bio:BIO_d036': [
    'Review fix: the tree root reads "reproduce by spores" (was "sexual and asexual cycles"; Glomeromycota and the imperfect fungi have no known sexual stage)',
    'Review suggestion taken: step 1 says the big phyla are named for where they make their sexual spores'
  ],
  'fm:bio:BIO_d039': [
    'Expert family reversed kept for "Multicellularity"; label says it points the other way',
    'Review fix: step 1 and the tree root list reproduction by spores as the shared trait (was "sexual and asexual cycles", which the "Asexual only" note contradicts)'
  ],
  'fm:bio:BIO_e009': [
    'Review fix: alt says arrow 1 is drawn in green and named the answer in the legend (was "outlined")',
    'Review fix: the Organic N box draws neutral (was the mint end style, which read as the key\'s place)',
    'Review fix: caption and step 3 say each choice is a numbered step (the ammonium choice is legend step 3; no arrow runs from ammonium to organic N)'
  ],
  'fm:written:bio-3-194ncsd': ['Family for "The drug binds the glucose carrier directly" set to other-conditions (expert left it to the writer: read-backward or neighbor-fact)'],
  'fm:written:bio-5-nd28q3': [
    'Expert families kept: half-right twice, reversed twice',
    'Review fix: alt says water splitting and b6f load H+ (was all three complexes pumping H+; photosystem I does not)'
  ],
  'fm:written:bio-5-1hzdpw4': [
    'Review fix: "Glucose and phosphate" is half-right, label "Phosphate yes, glucose no"; the note says phosphate does go back with ADP (was neighbor-fact, glucose only)',
    'Review suggestion taken: the Calvin cycle box draws neutral (was the mint end style)'
  ],
  'fm:written:bio-5-104j1lu': ['Review fix: alt says water splitting and b6f load H+ (was all three complexes pumping H+; photosystem I does not)'],
  'fm:written:bio-7-1v7ag0l': ['Review suggestion taken: step 2 says the cell can commit fast (was "in seconds"; the caspase cascade runs over minutes)'],
  'fm:written:bio-3-2c5o89': [
    'Review fix: the PIP2 note says phospholipase C is most often switched on by Gq receptors (receptor tyrosine kinases can switch it on too)',
    'Review fix: alt opens "Five signals in rows" (was "Five receptor classes"; two rows are G protein receptors)'
  ],
  'fm:written:bio-3-x1d1j6': ['Review fix: alt puts the hemidesmosome at the base, anchoring cell 1 to the basement membrane, not joining the two cells']
};

module.exports = {
  schema: 'ace.explainer-src/1',
  group: 'G1',
  batch: 'B002',
  title: 'G1 B002: Full-Length Test 1, Biology part 2 (diversity, ecology, evolution, meiosis, photosynthesis, cell cycle, development, membrane)',
  entries: ENTRIES,
  changes: CHANGES
};
