// The Tree of Organic, Level 5, Branch 3: Protonate, then the cation decides.
// Electrophilic addition pushed arrow by arrow: the free cation that rearranges,
// the bridge that cannot, and the enol that will not stay. No imports (contract).

export const meta = {
  id: 't5-addition',
  level: 5,
  order: 3,
  needs3D: false,
  title: 'Protonate, then the cation decides',
  concept: 'Electrophilic addition mechanisms',
  tagline: 'The first arrow makes the intermediate. The intermediate makes the product.',
  story: 'Almost every addition opens the same way: the pi bond, which is the electron-rich part sticking out of the molecule, reaches up and grabs the electrophile. That first arrow is not the interesting part. What matters is what it leaves behind. If it leaves a free carbocation, the plus lands on the more substituted carbon because that is the one the neighbors can hold up, and now a hydride or a methyl next door can slide over to make an even better cation. That is a rearrangement, and it only happens here. If instead the electrophile bridges, like bromine does, there is no free cation at all, nothing can slide, and the nucleophile has to open the ring from the back side. Alkynes add the same way and then quietly tautomerize: the enol you drew is never the answer, the carbonyl is. Rule of thumb: name the intermediate before you name the product.',
  moveName: 'Name the intermediate before you name the product',
  move: [
    'Find the pi bond and push it at the electrophile. That is arrow one, every time.',
    'Name what you just made: a free carbocation, a bridged ion, or neither.',
    'Free cation? Put the plus on the more substituted carbon, then look next door for a better neighbor and slide a hydride or a methyl over.',
    'Bridged ion? Nothing slides. The nucleophile opens the ring from the back, at the more substituted carbon.',
    'Last look: if you drew an OH on a double bond, that is an enol. Tautomerize it and hand in the carbonyl.'
  ],
  trap: 'Careful: a rearrangement can only happen when a free carbocation actually forms, so HBr and acid water are on the table while bromine, mercury and hydroboration are not; if you shift a hydride inside a bromonium bridge you have invented chemistry that does not exist.',
  holdsUp: ['Markovnikov addition', 'Halohydrins and epoxides', 'Alkyne hydration', 'Alcohol synthesis', 'Multi-step synthesis'],
  drill: 'Booster OChem: Alkene Addition Reactions'
};

// Every SMILES this module draws. The substrates and products come from the verified
// reaction table; the intermediates are the drawn states of the mechanisms below.
export const SMILES = [
  'C=CC', 'Br', 'C[CH+]C', '[Br-]', 'CC(C)Br',
  'C=CC(C)C', 'C[CH+]C(C)C', 'CC[C+](C)C', 'CCC(C)(C)Br',
  '[OH3+]', 'O', 'CC(C)[OH2+]', 'CC(C)O',
  'BrBr', 'CC1C[Br+]1', 'CC(Br)CBr', 'CC([OH2+])CBr', 'CC(O)CBr',
  'CCC#C', 'CC[C+]=C', 'CCC([OH2+])=C', 'CCC(O)=C', 'CCC(C)=[OH+]', 'CCC(C)=O'
];

/* Species: the name, plus the marks the renderer cannot show.
   kind: lp (lone pair), + (a charge badge on carbon), H (an explicit hydrogen). */
const SPECIES = {
  'C=CC': { name: 'propene', marks: [] },
  'Br': { name: 'HBr', marks: [] },
  'C[CH+]C': { name: 'the secondary carbocation', marks: [{ id: 'plus', kind: '+', at: { v: { deg: 2 } } }] },
  '[Br-]': { name: 'bromide', marks: [{ id: 'lpBr', kind: 'lp', at: { t: 'Br' } }] },
  'CC(C)Br': { name: '2-bromopropane', marks: [] },
  'C=CC(C)C': { name: '3-methyl-1-butene', marks: [] },
  'C[CH+]C(C)C': { name: 'the secondary cation', marks: [{ id: 'plus', kind: '+', at: { v: { deg: 2 } } }, { id: 'Hs', kind: 'H', at: { v: { deg: 3 } } }] },
  'CC[C+](C)C': { name: 'the tertiary cation', marks: [{ id: 'plus', kind: '+', at: { v: { deg: 3 } } }] },
  'CCC(C)(C)Br': { name: '2-bromo-2-methylbutane', marks: [] },
  '[OH3+]': { name: 'hydronium, H3O+', marks: [] },
  'O': { name: 'water', marks: [{ id: 'lpO', kind: 'lp', at: { t: 'O' } }] },
  'CC(C)[OH2+]': { name: 'the oxonium ion', marks: [] },
  'CC(C)O': { name: '2-propanol', marks: [] },
  'BrBr': { name: 'Br2', marks: [] },
  'CC1C[Br+]1': { name: 'the bromonium bridge', marks: [] },
  'CC(Br)CBr': { name: '1,2-dibromopropane', marks: [] },
  'CC([OH2+])CBr': { name: 'the protonated halohydrin', marks: [] },
  'CC(O)CBr': { name: '1-bromo-2-propanol, the halohydrin', marks: [] },
  'CCC#C': { name: '1-butyne', marks: [] },
  'CC[C+]=C': { name: 'the vinyl cation', marks: [{ id: 'plus', kind: '+', at: { v: { deg: 2, order: 'dbl' } } }] },
  'CCC([OH2+])=C': { name: 'the protonated enol', marks: [] },
  'CCC(O)=C': { name: 'the enol: an OH on a double bond', marks: [] },
  'CCC(C)=[OH+]': { name: 'the protonated ketone', marks: [] },
  'CCC(C)=O': { name: '2-butanone', marks: [] }
};
const nameOf = smi => (SPECIES[smi] && SPECIES[smi].name) || smi;

/* The mechanisms, drawn state by state. rid points at the verified reaction table
   entry, so the badges under the stage and the generated items read the same row. */
const MECHANISMS = [
  {
    id: 'hbr', chip: 'HBr on propene', name: 'HBr addition', rid: 'alkene_hbr', roots: ['l2-carbocation', 'l2-arrows'],
    after: 'Two steps. The plus went to the middle carbon because secondary beats primary, and the bromide followed it there.',
    states: [
      { main: 'C=CC', with: ['Br'], side: 'left', label: 'propene + HBr' },
      { main: 'C[CH+]C', with: ['[Br-]'], side: 'right', label: 'secondary cation + bromide' },
      { main: 'CC(C)Br', with: [], side: 'right', label: '2-bromopropane' }
    ],
    steps: [
      {
        name: 'protonate', nuc: 'the pi bond of the alkene', ele: 'the proton on HBr',
        say: 'The pi bond is the electron-rich part sticking out of the molecule, so it acts as the base. It reaches up and takes the proton from HBr, and the H-Br electrons fall back onto bromine. The H lands on the end carbon, which puts the plus on the middle carbon: secondary, not primary. The rich get richer.',
        arrows: [
          { from: { b: 'dbl' }, to: { in: 'w0', t: 'Br', part: 'H' }, bend: 1, fromName: 'the pi bond of the alkene', toName: 'the proton on HBr', say: 'Pi bond to proton. The H goes on the carbon that already has more hydrogens.' },
          { from: { in: 'w0', t: 'Br', part: 'HB' }, to: { in: 'w0', t: 'Br' }, bend: 1, fromName: 'the H-Br bond', toName: 'the bromine', say: 'The H-Br electrons fall back on bromine: bromide, now a nucleophile.' }
        ]
      },
      {
        name: 'bromide attacks', nuc: 'bromide', ele: 'the carbocation carbon',
        say: 'Now it is just rich attacks poor. Bromide has lone pairs and a minus, the cation has an empty p orbital, and they find each other. The bromine ends up on the more substituted carbon, which is what Markovnikov is really telling you.',
        arrows: [{ from: { in: 'w0', m: 'lpBr' }, to: { v: { deg: 2 } }, bend: -1, fromName: 'a lone pair on bromide', toName: 'the carbocation carbon', say: 'Lone pair into the empty orbital. Attack, and attach.' }]
      }
    ]
  },
  {
    id: 'shift', chip: 'HBr with a hydride shift', name: 'HBr with a 1,2-hydride shift', rid: 'alkene_rearr_hbr', roots: ['l2-carbocation'],
    after: 'Three steps, and the middle one is the one people miss. The bromine is not where Markovnikov first put it, because the cation moved before the bromide arrived.',
    states: [
      { main: 'C=CC(C)C', with: ['Br'], side: 'left', label: '3-methyl-1-butene + HBr' },
      { main: 'C[CH+]C(C)C', with: ['[Br-]'], side: 'right', label: 'secondary cation, tertiary neighbor' },
      { main: 'CC[C+](C)C', with: ['[Br-]'], side: 'right', label: 'the tertiary cation, after the shift' },
      { main: 'CCC(C)(C)Br', with: [], side: 'right', label: '2-bromo-2-methylbutane' }
    ],
    steps: [
      {
        name: 'protonate', nuc: 'the pi bond', ele: 'the proton on HBr',
        say: 'Same opening as before. The pi bond takes the proton, the H lands on the end carbon, and you get a secondary cation. Stop and look at the neighbors before you do anything else.',
        arrows: [
          { from: { b: 'dbl' }, to: { in: 'w0', t: 'Br', part: 'H' }, bend: 1, fromName: 'the pi bond of the alkene', toName: 'the proton on HBr', say: 'Pi bond to proton.' },
          { from: { in: 'w0', t: 'Br', part: 'HB' }, to: { in: 'w0', t: 'Br' }, bend: 1, fromName: 'the H-Br bond', toName: 'the bromine', say: 'The H-Br electrons fall back on bromine.' }
        ]
      },
      {
        name: 'hydride shift', nuc: 'the C-H bond next door', ele: 'the empty carbon',
        say: 'The carbon next door is tertiary and it is carrying a hydrogen. That hydrogen slides over WITH its two electrons, which is what hydride means, and the plus moves to where the hydrogen came from. Secondary became tertiary, and the whole molecule got more stable. One arrow.',
        arrows: [{ from: { mb: 'Hs' }, to: { v: { deg: 2 } }, bend: -1, fromName: 'the C-H bond on the tertiary carbon', toName: 'the carbocation carbon', say: 'The hydrogen slides over with both electrons. The plus trades places with it.' }]
      },
      {
        name: 'bromide attacks', nuc: 'bromide', ele: 'the tertiary carbocation',
        say: 'Only now does the bromide arrive, and it arrives at the tertiary carbon, not the secondary one. If a rearrangement ever surprises you on a test, carbocation stability is the root that was missing.',
        arrows: [{ from: { in: 'w0', m: 'lpBr' }, to: { v: { deg: 3 } }, bend: -1, fromName: 'a lone pair on bromide', toName: 'the tertiary carbocation carbon', say: 'Attack, and attach, at the carbon the plus moved to.' }]
      }
    ]
  },
  {
    id: 'hydration', chip: 'Acid hydration of propene', name: 'acid-catalyzed hydration', rid: 'alkene_h3o', roots: ['l2-carbocation', 'l2-arrows'],
    after: 'Three steps. Same cation as HBr, but the nucleophile is neutral water, so there is a cleanup proton to lose at the end.',
    states: [
      { main: 'C=CC', with: ['[OH3+]'], side: 'left', label: 'propene + aqueous acid' },
      { main: 'C[CH+]C', with: ['O'], side: 'right', label: 'the secondary cation + water' },
      { main: 'CC(C)[OH2+]', with: ['O'], side: 'right', arrives: [0], label: 'oxonium ion + water' },
      { main: 'CC(C)O', with: ['[OH3+]'], side: 'right', label: '2-propanol + hydronium' }
    ],
    steps: [
      {
        name: 'protonate', nuc: 'the pi bond', ele: 'a proton on hydronium',
        say: 'Acid first. The pi bond takes a proton from hydronium and the O-H electrons go back on oxygen, leaving water. Markovnikov again: the H goes where the hydrogens already are, so the plus goes to the middle carbon.',
        arrows: [
          { from: { b: 'dbl' }, to: { in: 'w0', t: 'O', part: 'H' }, bend: 1, fromName: 'the pi bond of the alkene', toName: 'a proton on hydronium', say: 'Pi bond to proton.' },
          { from: { in: 'w0', t: 'O', part: 'HB' }, to: { in: 'w0', t: 'O' }, bend: 1, fromName: 'the O-H bond of hydronium', toName: 'the oxygen', say: 'Those electrons fall back on oxygen: water.' }
        ]
      },
      {
        name: 'water attacks', nuc: 'water', ele: 'the carbocation carbon',
        say: 'Water is a weak nucleophile, but there is an ocean of it and the cation is desperate. A lone pair goes into the empty orbital. Notice the oxygen is now holding three bonds and a plus.',
        arrows: [{ from: { in: 'w0', m: 'lpO' }, to: { v: { deg: 2 } }, bend: -1, fromName: 'a lone pair on water', toName: 'the carbocation carbon', say: 'Lone pair into the empty orbital.' }]
      },
      {
        name: 'lose the proton', nuc: 'a second water', ele: 'a proton on the oxonium oxygen',
        say: 'Cleanup. Another water takes one proton off the oxygen and you have the neutral alcohol back. Any time a neutral nucleophile attacks, look for this last step, and notice the acid you used at the start is handed back at the end. That is what catalytic means.',
        arrows: [
          { from: { in: 'w0', m: 'lpO' }, to: { t: 'O', part: 'H' }, bend: 1, fromName: 'a lone pair on the second water', toName: 'a proton on the oxonium oxygen', say: 'Lone pair to proton.' },
          { from: { t: 'O', part: 'HB' }, to: { t: 'O' }, bend: 1, fromName: 'the O-H bond of the oxonium', toName: 'the oxygen', say: 'Back on oxygen: the neutral alcohol.' }
        ]
      }
    ]
  },
  {
    id: 'br2', chip: 'Br2 on propene', name: 'bromination through the bromonium', rid: 'alkene_br2', roots: ['l2-arrows', 'l3-isomers'],
    after: 'Two steps and no free cation anywhere. The bridge is why the second bromine has to land on the opposite face: anti addition.',
    states: [
      { main: 'C=CC', with: ['BrBr'], side: 'left', label: 'propene + Br2' },
      { main: 'CC1C[Br+]1', with: ['[Br-]'], side: 'right', label: 'the bromonium bridge' },
      { main: 'CC(Br)CBr', with: [], side: 'right', label: '1,2-dibromopropane' }
    ],
    steps: [
      {
        name: 'build the bridge', nuc: 'the pi bond', ele: 'the near bromine of Br2',
        say: 'Br2 has no charge, but it is big and soft and its electrons slosh around, so as the alkene comes close one end goes partly positive. The pi bond attacks that end, and the Br-Br electrons leave with the other bromine. What forms is a three-membered ring: bromine bridging both carbons. There is no free cation here at all.',
        arrows: [
          { from: { b: 'dbl' }, to: { in: 'w0', t: 'Br', pick: 'left' }, bend: 1, fromName: 'the pi bond of the alkene', toName: 'the near bromine of Br2', say: 'Pi bond to the near bromine.' },
          { from: { in: 'w0', b: { t: 'Br' } }, to: { in: 'w0', t: 'Br', pick: 'right' }, bend: 1, fromName: 'the Br-Br bond', toName: 'the far bromine', say: 'The Br-Br electrons leave with the far bromine: bromide.' }
        ]
      },
      {
        name: 'open it from the back', nuc: 'bromide', ele: 'the more substituted ring carbon',
        say: 'The bridge blocks one whole face of the molecule, so bromide has to attack from the other side. It goes for the more substituted carbon, which carries more of the positive character, and the C-Br bond of the ring breaks as it arrives. Two bromines, opposite faces. That is anti addition, and it is a bridge that made it happen, not a rule you memorize.',
        arrows: [
          { from: { in: 'w0', m: 'lpBr' }, to: { v: { deg: 3 } }, bend: -1, fromName: 'a lone pair on bromide', toName: 'the more substituted ring carbon', say: 'Attack from the back side, at the more substituted carbon.' },
          { from: { b: [{ v: { deg: 3 } }, { t: 'Br' }] }, to: { t: 'Br' }, bend: 1, fromName: 'the ring C-Br bond', toName: 'the bridging bromine', say: 'And the ring opens: those electrons go back onto the bromine.' }
        ]
      }
    ]
  },
  {
    id: 'halohydrin', chip: 'Br2 in water: the halohydrin', name: 'halohydrin formation', rid: 'alkene_halohydrin', roots: ['l2-carbocation', 'l2-arrows'],
    after: 'Same bridge, different nucleophile. Water wins the race because there is an ocean of it, and it opens the ring at the more substituted carbon.',
    states: [
      { main: 'C=CC', with: ['BrBr', 'O'], side: 'left', label: 'propene + Br2 in water' },
      { main: 'CC1C[Br+]1', with: ['[Br-]', 'O'], side: 'right', label: 'the same bridge' },
      { main: 'CC([OH2+])CBr', with: ['[Br-]', 'O'], side: 'right', arrives: [1], label: 'protonated halohydrin + water' },
      { main: 'CC(O)CBr', with: ['[Br-]', '[OH3+]'], side: 'right', label: 'the halohydrin' }
    ],
    steps: [
      {
        name: 'build the bridge', nuc: 'the pi bond', ele: 'the near bromine of Br2',
        say: 'Identical opening to plain bromination. The pi bond attacks Br2 and the bromonium bridge forms. Nothing about the solvent has mattered yet.',
        arrows: [
          { from: { b: 'dbl' }, to: { in: 'w0', t: 'Br', pick: 'left' }, bend: 1, fromName: 'the pi bond of the alkene', toName: 'the near bromine of Br2', say: 'Pi bond to the near bromine.' },
          { from: { in: 'w0', b: { t: 'Br' } }, to: { in: 'w0', t: 'Br', pick: 'right' }, bend: 1, fromName: 'the Br-Br bond', toName: 'the far bromine', say: 'The far bromine leaves as bromide.' }
        ]
      },
      {
        name: 'water opens it', nuc: 'water, the solvent', ele: 'the more substituted ring carbon',
        say: 'Now the solvent matters. Bromide and water both want to open the bridge, and water wins on sheer numbers. It attacks the more substituted carbon from the back, because that carbon carries more of the positive character. So the OH ends up on the crowded carbon and the Br on the other one.',
        arrows: [
          { from: { in: 'w1', m: 'lpO' }, to: { v: { deg: 3 } }, bend: -1, fromName: 'a lone pair on water', toName: 'the more substituted ring carbon', say: 'Water attacks the crowded carbon, from the back.' },
          { from: { b: [{ v: { deg: 3 } }, { t: 'Br' }] }, to: { t: 'Br' }, bend: 1, fromName: 'the ring C-Br bond', toName: 'the bridging bromine', say: 'The ring opens.' }
        ]
      },
      {
        name: 'lose the proton', nuc: 'a second water', ele: 'a proton on the oxonium oxygen',
        say: 'Cleanup again, because a neutral nucleophile attacked. Take the extra proton off and you have the halohydrin: OH on the more substituted carbon, Br on the less substituted one, on opposite faces.',
        arrows: [
          { from: { in: 'w1', m: 'lpO' }, to: { t: 'O', part: 'H' }, bend: 1, fromName: 'a lone pair on the second water', toName: 'a proton on the oxonium oxygen', say: 'Lone pair to proton.' },
          { from: { t: 'O', part: 'HB' }, to: { t: 'O' }, bend: 1, fromName: 'the O-H bond of the oxonium', toName: 'the oxygen', say: 'Back on oxygen: the neutral halohydrin.' }
        ]
      }
    ]
  },
  {
    id: 'enol', chip: 'Alkyne + water: to the enol', name: 'alkyne hydration to the enol', rid: 'alkyne_hg_h2o', roots: ['l2-carbocation', 'l2-resonance'],
    after: 'Three steps and you are holding an enol: an OH sitting on a double bond. Do not stop here. Switch to the next chip.',
    states: [
      { main: 'CCC#C', with: ['[OH3+]'], side: 'left', label: '1-butyne + aqueous acid, HgSO4' },
      { main: 'CC[C+]=C', with: ['O'], side: 'right', label: 'the vinyl cation, Markovnikov' },
      { main: 'CCC([OH2+])=C', with: ['O'], side: 'right', arrives: [0], label: 'protonated enol + water' },
      { main: 'CCC(O)=C', with: ['[OH3+]'], side: 'right', label: 'the enol' }
    ],
    steps: [
      {
        name: 'protonate', nuc: 'a pi bond of the alkyne', ele: 'a proton on hydronium',
        say: 'An alkyne has two pi bonds, so it can do the same trick an alkene does. One pi bond takes a proton, and the H lands on the end carbon so the plus sits on the inside carbon: Markovnikov. What is left is still a double bond, with the plus on one of its carbons.',
        arrows: [
          { from: { b: 'tpl' }, to: { in: 'w0', t: 'O', part: 'H' }, bend: 1, fromName: 'a pi bond of the alkyne', toName: 'a proton on hydronium', say: 'Pi bond to proton, H on the open end.' },
          { from: { in: 'w0', t: 'O', part: 'HB' }, to: { in: 'w0', t: 'O' }, bend: 1, fromName: 'the O-H bond of hydronium', toName: 'the oxygen', say: 'Back on oxygen: water.' }
        ]
      },
      {
        name: 'water attacks', nuc: 'water', ele: 'the vinyl cation carbon',
        say: 'Water attacks the carbon carrying the plus. Mercury is the catalyst that makes this happen at a sensible rate; on the test it is a label that means Markovnikov water on an alkyne.',
        arrows: [{ from: { in: 'w0', m: 'lpO' }, to: { v: { deg: 2, order: 'dbl' } }, bend: -1, fromName: 'a lone pair on water', toName: 'the carbon carrying the plus', say: 'Lone pair into the empty orbital.' }]
      },
      {
        name: 'lose the proton', nuc: 'a second water', ele: 'a proton on the oxygen',
        say: 'Take the extra proton off and look at what you are holding: an OH stuck on a double bond. That is an enol, and an enol is a message, not an answer.',
        arrows: [
          { from: { in: 'w0', m: 'lpO' }, to: { t: 'O', part: 'H' }, bend: 1, fromName: 'a lone pair on the second water', toName: 'a proton on the oxygen', say: 'Lone pair to proton.' },
          { from: { t: 'O', part: 'HB' }, to: { t: 'O' }, bend: 1, fromName: 'the O-H bond', toName: 'the oxygen', say: 'Back on oxygen: the enol.' }
        ]
      }
    ]
  },
  {
    id: 'tautomer', chip: 'The enol will not stay', name: 'keto-enol tautomerization', rid: 'alkyne_hg_h2o', roots: ['l2-resonance', 'l2-acidity'],
    after: 'The ketone is the answer. A terminal alkyne plus mercury water gives a methyl ketone, every single time.',
    states: [
      { main: 'CCC(O)=C', with: ['[OH3+]'], side: 'left', label: 'the enol + acid' },
      { main: 'CCC(C)=[OH+]', with: ['O'], side: 'right', label: 'the protonated ketone' },
      { main: 'CCC(C)=O', with: ['[OH3+]'], side: 'right', label: '2-butanone' }
    ],
    steps: [
      {
        name: 'protonate the carbon', nuc: 'the pi bond of the enol', ele: 'a proton on hydronium',
        say: 'The enol is not stable, and acid gives it a way out. Its pi bond takes a proton onto the end carbon. The plus that would sit on the other carbon is caught immediately by the oxygen next door, which pushes a lone pair down: you are really looking at a protonated carbonyl.',
        arrows: [
          { from: { b: 'dbl' }, to: { in: 'w0', t: 'O', part: 'H' }, bend: 1, fromName: 'the pi bond of the enol', toName: 'a proton on hydronium', say: 'Pi bond to proton, onto the end carbon.' },
          { from: { in: 'w0', t: 'O', part: 'HB' }, to: { in: 'w0', t: 'O' }, bend: 1, fromName: 'the O-H bond of hydronium', toName: 'the oxygen', say: 'Back on oxygen: water.' }
        ]
      },
      {
        name: 'lose the O-H proton', nuc: 'water', ele: 'the proton on the carbonyl oxygen',
        say: 'Water takes the proton off the oxygen and the C=O is finished. Count the carbons: 1-2-3-4, and the oxygen is on carbon two. A methyl ketone. This whole two-step dance is what tautomerize means, and it happens on its own.',
        arrows: [
          { from: { in: 'w0', m: 'lpO' }, to: { t: 'O', part: 'H' }, bend: 1, fromName: 'a lone pair on water', toName: 'the proton on the oxygen', say: 'Lone pair to proton.' },
          { from: { t: 'O', part: 'HB' }, to: { t: 'O' }, bend: 1, fromName: 'the O-H bond', toName: 'the oxygen', say: 'Back on oxygen: the ketone.' }
        ]
      }
    ]
  }
];

// The intermediate gallery: three intermediates, three different sets of rules.
const INTERMEDIATES = [
  { id: 'free', chip: 'A free carbocation', smi: 'C[CH+]C(C)C', title: 'A free carbocation: things can move',
    line: 'The plus is sitting on one carbon with an empty p orbital and nothing holding it in place. A hydride or a methyl on the carbon next door can slide over if that makes a better cation. This is the ONLY intermediate where a rearrangement is allowed, and HBr, HCl, HI and acid water are the reagents that make one.' },
  { id: 'bridge', chip: 'A bridged ion', smi: 'CC1C[Br+]1', title: 'A bridge: nothing can move',
    line: 'The bromine is bonded to both carbons at once, so there is no empty orbital and no free cation. Nothing slides, so there is never a rearrangement. The bridge also blocks one whole face, which forces the nucleophile to come in from the back: anti addition. Mercury does the same thing, which is why oxymercuration is the no-rearrangement version of hydration.' },
  { id: 'vinyl', chip: 'A vinyl cation', smi: 'CC[C+]=C', title: 'A vinyl cation: only on an alkyne',
    line: 'This is the plus you get from protonating an alkyne, and it sits on a carbon that is still part of a double bond. It is high energy, which is why alkyne hydration needs a mercury catalyst to get going. Remember the wider rule: we never want a radical or a carbocation touching a double bond unless we have no choice.' }
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
/* Reading the verified table. Both badges and items use these.         */
/* ------------------------------------------------------------------ */
export function interOf(r){
  const m = r.mech || '';
  if (/cleavage/i.test(m)) return 'other';
  if (/carbocation/i.test(m)) return 'free';
  if (/bridged/i.test(m)) return 'bridged';
  if (/radical/i.test(m)) return 'radical';
  if (/concerted|catalytic/i.test(m)) return 'concerted';
  return 'other';
}
export function addrOf(r){
  const g = r.regio || '';
  if (/either carbon/i.test(g)) return 'either';
  if (/anti-Markovnikov/i.test(g)) return 'less';
  if (/Markovnikov|more substituted/i.test(g)) return 'more';
  return 'none';
}
const INTER_CHOICES = [
  { key: 'free', text: 'Yes. A free carbocation forms, so a better neighbor can pull a rearrangement.' },
  { key: 'bridged', text: 'No. A bridged ion forms, so there is never a free cation and nothing can slide.' },
  { key: 'concerted', text: 'No. Both new bonds form on one face at the same moment, so nothing is free to move.' },
  { key: 'radical', text: 'No. This one runs through a radical, not a cation.' }
];
const ADDR_CHOICES = [
  { key: 'more', text: 'The more substituted carbon, the one with fewer hydrogens on it.' },
  { key: 'less', text: 'The less substituted carbon, the open end.' },
  { key: 'either', text: 'Either one. The alkene is symmetric, so both carbons are the same address.' },
  { key: 'none', text: 'Neither. The double bond is cut apart instead of added to.' }
];
const INTER_NAME = { free: 'a free carbocation', bridged: 'a bridged ion', concerted: 'no intermediate at all, it is concerted', radical: 'a radical' };
function label(r){ return r.cond ? r.reagent + (/^\d\./.test(r.reagent) ? '; ' : ', ') + r.cond : r.reagent; }
function subName(api, r){ const s = api.reactions.SUBSTRATES[r.subClass]; return s ? s.name : 'the substrate'; }
export function addPool(api){
  const R = api && api.reactions ? api.reactions.REACTIONS : null;
  if (!R) return [];
  return R.filter(r => (r.family === 'alkenes' || r.family === 'alkynes' || r.family === 'radical') && /addition/i.test(r.mech || '') && !/cleavage/i.test(r.mech || ''));
}

/* ------------------------------------------------------------------ */
/* Item generators. Every answer is computed from the tables above.     */
/* ------------------------------------------------------------------ */
const KINDS = ['next', 'start', 'inter', 'addr'];
const WRONG_STARTS = ['the positive charge on the carbocation', 'the hydrogen atom itself', 'the carbon skeleton'];
function stepOf(rng){
  const pool = [];
  for (const M of MECHANISMS) for (let i = 0; i < M.steps.length; i++) pool.push({ M, i });
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
    return { kind, drawn: true, M: pick.M, i: pick.i, stem: 'Here is ' + pick.state.label + '. The step is: ' + pick.step.name + '. What comes next?',
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
  if (kind === 'inter'){
    const pool = addPool(api).filter(r => interOf(r) !== 'other');
    if (!pool.length) return genItem(rng, api, 'next');
    const r = pool[Math.floor(rng() * pool.length)], key = interOf(r);
    const choices = shuffled(rng, INTER_CHOICES.slice());
    return { kind, rid: r.id, sub: r.sub, reagent: label(r), stem: 'Does this go through a free carbocation: ' + subName(api, r) + ' with ' + label(r) + '?',
      choices: choices.map(c => ({ text: c.text, smiles: null })), correct: choices.findIndex(c => c.key === key),
      coach: 'Name the intermediate first: ' + r.mech + '. That is ' + INTER_NAME[key] + ', so a rearrangement is ' + (key === 'free' ? 'on the table' : 'off the table') + '. ' + r.trap, roots: r.roots && r.roots.length ? r.roots : ['l2-carbocation'] };
  }
  const pool = addPool(api).filter(r => addrOf(r) !== 'none');
  if (!pool.length) return genItem(rng, api, 'next');
  const r = pool[Math.floor(rng() * pool.length)], key = addrOf(r);
  const choices = shuffled(rng, ADDR_CHOICES.slice());
  return { kind: 'addr', rid: r.id, sub: r.sub, reagent: label(r), stem: 'Which carbon does the new group land on: ' + subName(api, r) + ' with ' + label(r) + '?',
    choices: choices.map(c => ({ text: c.text, smiles: null })), correct: choices.findIndex(c => c.key === key),
    coach: 'Read the address off the reagent: ' + r.regio + '. ' + r.thomas, roots: r.roots && r.roots.length ? r.roots : ['l2-carbocation'] };
}

export function makeItem(api){
  const it = genItem(api.rng, api);
  const st = it.M ? it.M.states[it.i] : null;
  return { stem: it.stem, sub: st ? st.main : (it.sub || null), reagent: st ? (st.with || []).map(nameOf).join(' + ') || null : (it.reagent || null), prod: null,
    choices: it.choices, correct: it.correct, coach: it.coach, home: meta.id, roots: it.roots && it.roots.length ? it.roots : ['l2-carbocation', 'l2-arrows'] };
}

export function selfTest(deps){
  const rng = mulberry(23);
  const api = { rng, pick: a => a[Math.floor(rng() * a.length)], shuffle: a => shuffled(rng, a), reactions: deps && deps.reactions, bank: deps && deps.bank };
  const bad = m => ({ ok: false, tried: 0, notes: m });
  for (const s of SMILES){ if (!balanced(s)) return bad('unbalanced SMILES in the list: ' + s); if (!SPECIES[s]) return bad(s + ' missing from SPECIES'); }
  for (const I of INTERMEDIATES) if (!SMILES.includes(I.smi)) return bad('gallery SMILES not listed: ' + I.smi);
  // the mechanisms point at real rows of the verified table
  for (const M of MECHANISMS){
    if (M.rid && api.reactions && !api.reactions.find(M.rid)) return bad(M.id + ' points at a reaction that is not in the table: ' + M.rid);
    if (M.steps.length !== M.states.length - 1) return bad(M.id + ': steps must be states minus one');
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
  // the table readers agree with what the table says in words
  if (api.reactions){
    const expect = { alkene_hbr: ['free', 'more'], alkene_hbr_peroxide: ['radical', 'less'], alkene_h3o: ['free', 'more'], alkene_oxymerc: ['bridged', 'more'], alkene_hydroboration: ['concerted', 'less'], alkene_br2: ['bridged', 'none'], alkene_halohydrin: ['bridged', 'more'], alkene_int_hbr: ['free', 'either'], alkene_rearr_hbr: ['free', 'none'] };
    for (const id in expect){ const r = api.reactions.find(id); if (!r) return bad('missing reaction ' + id); const got = [interOf(r), addrOf(r)]; if (got.join() !== expect[id].join()) return bad(id + ' reads ' + got.join('/') + ', expected ' + expect[id].join('/')); }
    const P = addPool(api);
    if (P.filter(r => interOf(r) !== 'other').length < 10) return bad('the intermediate pool is too thin');
    if (P.filter(r => addrOf(r) !== 'none').length < 6) return bad('the address pool is too thin');
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
  for (const k of KINDS){ const it = genItem(mulberry(3), api, k); if (!it || it.correct < 0) return { ok: false, tried, notes: k + ' failed to build' }; seen[k] = 1; }
  // the two table-read kinds keep agreeing with the table over many draws
  for (let n = 0; n < 200; n++){
    const it = genItem(rng, api, 'inter');
    if (it.rid){ const r = api.reactions.find(it.rid); const c = INTER_CHOICES.find(x => x.key === interOf(r)); if (it.choices[it.correct].text !== c.text) return { ok: false, tried, notes: 'intermediate answer does not match the table for ' + it.rid }; }
    const ad = genItem(rng, api, 'addr');
    if (ad.rid){ const r = api.reactions.find(ad.rid); const c = ADDR_CHOICES.find(x => x.key === addrOf(r)); if (ad.choices[ad.correct].text !== c.text) return { ok: false, tried, notes: 'address answer does not match the table for ' + ad.rid }; }
  }
  const a = genItem(mulberry(11), api), b = genItem(mulberry(11), api);
  if (JSON.stringify(a) !== JSON.stringify(b)) return { ok: false, tried, notes: 'not reproducible' };
  return { ok: true, tried, notes: MECHANISMS.length + ' mechanisms, ' + Object.keys(seen).length + ' item kinds, ' + addPool(api).length + ' table rows' };
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
/* The intermediate gallery: three middles, three different rule sets.  */
/* ------------------------------------------------------------------ */
function mountGallery(container, api){
  const { el } = api, C = api.colors;
  let pick = INTERMEDIATES[0];
  const holder = el('div', { style: { marginTop: '18px', paddingTop: '14px', borderTop: '1px solid ' + C.line } });
  holder.append(el('span', { class: 'eyebrow', text: 'The intermediate decides what is allowed next' }));
  const head = el('p', { style: { fontFamily: 'Georgia, serif', fontSize: '19px', color: C.goldhi, margin: '6px 0 4px' } });
  const row = el('div', { style: { display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap', margin: '6px 0 0' } });
  const line = el('p', { style: { margin: '0', color: C.ink2, fontSize: '15px', maxWidth: '62ch', flex: '1 1 320px' } });
  const chips = el('div', { class: 'controls', role: 'group', 'aria-label': 'Pick an intermediate' });
  const chipEls = INTERMEDIATES.map(I => el('button', { class: 'chip', type: 'button', 'aria-pressed': I === pick ? 'true' : 'false', text: I.chip,
    onClick: () => { pick = I; chipEls.forEach((c, i) => c.setAttribute('aria-pressed', INTERMEDIATES[i] === I ? 'true' : 'false')); draw(); } }));
  chips.append(...chipEls);
  holder.append(head, row, chips);
  container.append(holder);
  function draw(){
    row.replaceChildren();
    head.textContent = pick.title;
    const cell = el('div', { style: { background: 'rgba(255,255,255,.02)', border: '1px solid ' + C.line, borderRadius: '10px', padding: '10px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' } });
    const sp = speciesSvg(api, pick.smi, 1.5, 240);
    cell.append(sp.svg, el('span', { style: { fontFamily: 'Georgia, serif', fontSize: '13px', color: C.ink2 }, text: nameOf(pick.smi) }));
    line.textContent = pick.line;
    row.append(cell, line);
    sp.build();
  }
  draw();
  return { draw };
}

/* Badges under the stage, read straight off the verified reaction table. */
function tableBadges(api, host, mech){
  const { el } = api, C = api.colors;
  const r = mech.rid && api.reactions ? api.reactions.find(mech.rid) : null;
  if (!r) return;
  const badge = (text, color) => el('span', { style: { fontFamily: 'ui-monospace, Menlo, monospace', fontSize: '11px', letterSpacing: '.06em', textTransform: 'uppercase', padding: '5px 10px', borderRadius: '999px', border: '1px solid ' + color, color }, text });
  const key = interOf(r), addr = addrOf(r);
  const moved = /rearrangement/i.test(r.mech || '');
  const addrText = moved ? 'the address moves: the cation rearranges first' : addr === 'more' ? 'Markovnikov: the more substituted carbon' : addr === 'less' ? 'anti-Markovnikov: the open end' : addr === 'either' ? 'symmetric: either carbon' : 'no address question';
  const interText = key === 'free' ? 'free carbocation' : key === 'bridged' ? 'bridged ion' : key === 'radical' ? 'radical' : key === 'concerted' ? 'concerted, no intermediate' : 'through an enol';
  host.append(el('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' } },
    badge(interText, key === 'free' ? C.amber : key === 'bridged' ? C.blue : C.green),
    badge(addrText, moved ? C.amber : addr === 'less' ? C.blue : addr === 'none' ? C.grey : C.gold),
    badge(key === 'free' ? 'rearrangement possible' : 'no rearrangement', key === 'free' ? C.amber : C.green)),
    el('p', { style: { margin: '8px 0 0', fontFamily: 'Georgia, serif', fontSize: '16px', color: C.goldhi, maxWidth: '70ch' }, text: r.thomas }));
}

export function mount(slots, api){
  mountStage(slots, api, {
    mechanisms: MECHANISMS,
    eyebrow: 'pick a reaction, then push it one arrow at a time',
    extra: (host, mech) => tableBadges(api, host, mech)
  });
  mountGallery(slots.visual, api);
  mountTry(slots, api, { gen: rng => genItem(rng, api), groups: ['alkene-hx', 'carbocation-rearrangement', 'alkene-hydration', 'alkyne-hydration'] });
}
