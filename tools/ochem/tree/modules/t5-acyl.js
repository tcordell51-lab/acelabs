// The Tree of Organic, Level 5, Branch 4: Attack, then the tetrahedral intermediate decides.
// Nucleophilic acyl substitution as addition then elimination. No imports (contract).
//
// Mechanism stage: every state is a list of species (SMILES drawn by api.drawSmiles, one inner
// <svg> each, placed at one shared scale inside one outer <svg>), curved gold arrows anchored to
// the rendered atom labels and to vertices rebuilt from the bond lines. The drawer does not show
// a charge on carbon, so carbocation and carbanion badges, lone pairs and explicit hydrogens are
// drawn here. Same engine as t5-proton.

export const meta = {
  id: 't5-acyl',
  level: 5,
  order: 4,
  needs3D: false,
  title: 'Attack, then the tetrahedral intermediate decides',
  concept: 'Nucleophilic acyl substitution',
  tagline: 'Addition, then elimination. The intermediate picks the best leaving group.',
  story: 'Every acid-derivative reaction is the same two beats: addition, then elimination. The nucleophile attacks the carbonyl carbon, the pi bond kicks up onto the electron bully, and now you are holding a tetrahedral intermediate with four things on that carbon. Then the intermediate decides: the best leaving group leaves, the oxygen pushes back down, and the carbonyl comes back. That is the whole family, and it is exactly why you can only go down the ladder, because the group that leaves has to beat the group that attacked. Saponification never goes back, because at the very end the acid hands its proton to the alkoxide. A Grignard on an ester adds twice, because the first substitution hands you a ketone. Rule of thumb: attack, then let the intermediate decide.',
  moveName: 'Attack the carbonyl, draw the tetrahedral intermediate, then let the best leaving group go',
  move: [
    'Find the carbonyl carbon. The nucleophile attacks it, and the C=O pi bond kicks up onto the oxygen.',
    'Draw the tetrahedral intermediate: four groups on that carbon and a minus sitting on the oxygen.',
    'Read the four groups and rank them as leaving groups: chloride, then carboxylate, then alkoxide or hydroxide, then the nitrogen of an amide, and a carbon group never.',
    'The oxygen lone pair pushes back down, the winner leaves, and the carbonyl is back.',
    'Clean up the charges. In acid a proton comes off at the end; in base the new acid hands its proton to the alkoxide, and that is the step that makes saponification a one-way trip.'
  ],
  trap: 'Careful: the tetrahedral intermediate is never the final answer, and it does not spit back out whatever just attacked. It releases the BETTER leaving group, which is why an amide will not become an ester no matter how much alcohol you pour on it.',
  holdsUp: ['Acid chloride to anything below it', 'Fischer esterification', 'Saponification versus acid hydrolysis', 'Why a Grignard hits an ester twice', 'Why the ladder only goes down'],
  drill: 'Booster OChem: Carboxylic Acid Derivatives'
};

// Every SMILES this module draws, tetrahedral intermediates included.
export const SMILES = [
  'CC(=O)Cl', 'CO', 'CC([O-])(Cl)[OH+]C', 'CC(=[OH+])OC', '[Cl-]', 'COC(C)=O', 'Cl',
  '[OH-]', 'CC([O-])(O)OC', 'CC(=O)O', 'C[O-]', 'CC(=O)[O-]',
  '[OH3+]', 'CCO', 'CC(=[OH+])O', 'O', 'CC(O)(O)[OH+]CC', 'CC(O)(O)OCC', 'CC(O)([OH2+])OCC', 'CC(=[OH+])OCC', 'CCOC(C)=O',
  '[CH3-]', 'CC([O-])(C)OC', 'CC(C)=O', 'CC(C)(C)[O-]', 'CC(C)(C)O'
];

/* ------------------------------------------------------------------ */
/* Species: names plus the marks the drawer cannot show.                */
/* kind: lp (lone pair dots), + or - (charge badge on a carbon), H      */
/* (an explicit hydrogen label). at: an anchor spec (see resolve()).     */
/* ------------------------------------------------------------------ */
const SPECIES = {
  'CC(=O)Cl': { name: 'acetyl chloride', marks: [{ id: 'lpO', kind: 'lp', at: { v: { deg: 1, el: 'O' } } }] },
  'CO': { name: 'methanol', marks: [{ id: 'lpO', kind: 'lp', at: { t: 'O' } }] },
  'CC([O-])(Cl)[OH+]C': { name: 'the tetrahedral intermediate', marks: [{ id: 'lpOm', kind: 'lp', at: { t: 'O', q: '-' } }] },
  'CC(=[OH+])OC': { name: 'protonated methyl acetate', marks: [] },
  '[Cl-]': { name: 'chloride', marks: [{ id: 'lpCl', kind: 'lp', at: { t: 'Cl' } }] },
  'COC(C)=O': { name: 'methyl acetate', marks: [] },
  'Cl': { name: 'HCl', marks: [] },
  '[OH-]': { name: 'hydroxide', marks: [{ id: 'lpO', kind: 'lp', at: { t: 'O' } }] },
  'CC([O-])(O)OC': { name: 'the tetrahedral intermediate', marks: [{ id: 'lpOm', kind: 'lp', at: { t: 'O', q: '-' } }] },
  'CC(=O)O': { name: 'acetic acid', marks: [{ id: 'lpO', kind: 'lp', at: { t: 'O', nq: 'H' } }] },
  'C[O-]': { name: 'methoxide', marks: [{ id: 'lpO', kind: 'lp', at: { t: 'O' } }] },
  'CC(=O)[O-]': { name: 'acetate', marks: [] },
  '[OH3+]': { name: 'hydronium, H3O+', marks: [] },
  'CCO': { name: 'ethanol', marks: [{ id: 'lpO', kind: 'lp', at: { t: 'O' } }] },
  'CC(=[OH+])O': { name: 'protonated acetic acid', marks: [] },
  'O': { name: 'water', marks: [{ id: 'lpO', kind: 'lp', at: { t: 'O' } }] },
  'CC(O)(O)[OH+]CC': { name: 'the tetrahedral intermediate, still holding the proton', marks: [] },
  'CC(O)(O)OCC': { name: 'the neutral tetrahedral intermediate', marks: [{ id: 'lpOH', kind: 'lp', at: { t: 'O', q: 'H' } }] },
  'CC(O)([OH2+])OCC': { name: 'the intermediate with water made', marks: [{ id: 'lpOH', kind: 'lp', at: { t: 'O', q: 'H', nq: '+' } }] },
  'CC(=[OH+])OCC': { name: 'protonated ethyl acetate', marks: [] },
  'CCOC(C)=O': { name: 'ethyl acetate', marks: [] },
  '[CH3-]': { name: 'the Grignard carbon, CH3MgBr', marks: [{ id: 'lpC', kind: 'lp', at: { t: 'C' } }] },
  'CC([O-])(C)OC': { name: 'the tetrahedral intermediate', marks: [{ id: 'lpOm', kind: 'lp', at: { t: 'O', q: '-' } }] },
  'CC(C)=O': { name: 'acetone, a ketone', marks: [{ id: 'lpO', kind: 'lp', at: { v: { deg: 1, el: 'O' } } }] },
  'CC(C)(C)[O-]': { name: 'the tertiary alkoxide', marks: [] },
  'CC(C)(C)O': { name: 'tert-butanol', marks: [] }
};
const nameOf = smi => (SPECIES[smi] && SPECIES[smi].name) || smi;

/* ------------------------------------------------------------------ */
/* The curated mechanisms. steps.length must be states.length - 1.      */
/* A step tagged `leaves` is a collapse: that is the group that goes.   */
/* ------------------------------------------------------------------ */
const CARBONYL_C = { v: { deg: 3 } };            // the only three-connected carbon in these substrates
const CARBONYL_O = { v: { deg: 1, el: 'O' } };   // the doubly bonded oxygen (one connection)

const MECHANISMS = [
  {
    id: 'acyl', chip: 'Acid chloride + methanol', name: 'acid chloride to ester', reagent: 'CH3OH, pyridine',
    roots: ['l2-bully', 'l2-arrows', 'l2-resonance'],
    after: 'Three steps: attack, collapse, lose the proton. Chloride is the best leaving group in the whole family, so this one runs at room temperature with nothing pushing it.',
    states: [
      { main: 'CC(=O)Cl', with: ['CO'], side: 'right', label: 'acetyl chloride + methanol' },
      { main: 'CC([O-])(Cl)[OH+]C', label: 'the tetrahedral intermediate' },
      { main: 'CC(=[OH+])OC', with: ['[Cl-]'], side: 'right', label: 'protonated ester + chloride' },
      { main: 'COC(C)=O', with: ['Cl'], side: 'right', label: 'methyl acetate + HCl' }
    ],
    steps: [
      {
        name: 'attack', nuc: 'the methanol oxygen', ele: 'the carbonyl carbon of the acid chloride',
        say: 'Methanol has lone pairs, the carbonyl carbon is the hungriest carbon in the molecule, so the oxygen attacks it. The C=O pi bond has to go somewhere, so it kicks up onto the oxygen. That carbon now holds four things. That is the tetrahedral intermediate.',
        arrows: [
          { from: { in: 'w0', m: 'lpO' }, to: CARBONYL_C, bend: 1, fromName: 'the lone pair on the methanol oxygen', toName: 'the carbonyl carbon', say: 'Lone pair to the hungry carbon.' },
          { from: { b: 'dbl' }, to: CARBONYL_O, bend: 1, fromName: 'the C=O pi bond', toName: 'the carbonyl oxygen', say: 'The pi bond kicks up onto the electron bully.' }
        ]
      },
      {
        name: 'collapse', nuc: 'the oxygen with the minus', ele: 'the carbon holding four groups',
        leaves: 'chloride', leavesWhy: 'HCl has a pKa of about -7, so chloride is the happiest leaving group in the family. Nothing else on that carbon comes close.',
        onCarbon: ['a methyl group, which never leaves', 'the oxygen with the minus, which pushes back down instead of leaving', 'the protonated methanol oxygen', 'chloride'],
        say: 'Now the intermediate decides. Four things sit on that carbon: a methyl, the oxygen with the minus, the new methanol oxygen and the chlorine. The oxygen pushes its lone pair back down to rebuild the C=O, and that push has to shove something off. It shoves off the best leaving group, chloride.',
        arrows: [
          { from: { m: 'lpOm' }, to: { b: { t: 'O', q: '-', n: 0 } }, bend: 1, fromName: 'a lone pair on the oxygen with the minus', toName: 'the carbon-oxygen bond, rebuilding the C=O', say: 'The oxygen pushes back down.' },
          { from: { b: { t: 'Cl', n: 0 } }, to: { t: 'Cl' }, bend: 1, fromName: 'the carbon-chlorine bond', toName: 'the chlorine', say: 'Chloride leaves with the pair.' }
        ]
      },
      {
        name: 'lose the proton', nuc: 'chloride', ele: 'the proton on the ester oxygen',
        say: 'Last beat: something takes the extra proton off. Chloride, or the pyridine you added to mop up acid, does it. Now you have a neutral ester.',
        arrows: [
          { from: { in: 'w0', m: 'lpCl' }, to: { t: 'O', q: '+', part: 'H' }, bend: -1, fromName: 'the lone pair on chloride', toName: 'the proton on the oxygen', say: 'Lone pair to proton.' },
          { from: { t: 'O', q: '+', part: 'HB' }, to: { t: 'O', q: '+' }, bend: 1, fromName: 'the O-H bond', toName: 'the oxygen', say: 'The O-H electrons fall back on oxygen.' }
        ]
      }
    ]
  },
  {
    id: 'saponification', chip: 'Ester + NaOH (saponification)', name: 'saponification', reagent: 'NaOH, H2O, heat',
    roots: ['l2-bully', 'l2-acidity', 'l2-arrows'],
    after: 'Look at the last step. The acid you just made is a stronger acid than methanol, so methoxide takes its proton on the spot. The carboxylate that comes out has no hungry carbon left to attack. That is why saponification does not go backward and acid hydrolysis does.',
    states: [
      { main: 'COC(C)=O', with: ['[OH-]'], side: 'right', label: 'methyl acetate + hydroxide' },
      { main: 'CC([O-])(O)OC', label: 'the tetrahedral intermediate' },
      { main: 'CC(=O)O', with: ['C[O-]'], side: 'right', label: 'acetic acid + methoxide' },
      { main: 'CC(=O)[O-]', with: ['CO'], side: 'right', label: 'acetate + methanol. It cannot go back.' }
    ],
    steps: [
      {
        name: 'attack', nuc: 'hydroxide', ele: 'the carbonyl carbon of the ester',
        say: 'Hydroxide is a real nucleophile, not a catalyst, so you use a full equivalent of it. It attacks the carbonyl carbon and the pi bond kicks up onto oxygen. Tetrahedral intermediate again.',
        arrows: [
          { from: { in: 'w0', m: 'lpO' }, to: CARBONYL_C, bend: 1, fromName: 'the lone pair on hydroxide', toName: 'the carbonyl carbon', say: 'Lone pair to the hungry carbon.' },
          { from: { b: 'dbl' }, to: CARBONYL_O, bend: 1, fromName: 'the C=O pi bond', toName: 'the carbonyl oxygen', say: 'The pi bond kicks up onto the bully.' }
        ]
      },
      {
        name: 'collapse', nuc: 'the oxygen with the minus', ele: 'the carbon holding four groups',
        leaves: 'methoxide', leavesWhy: 'Methanol (pKa 16) and water (15.7) are nearly the same, so both oxygens take turns leaving. Only the methoxide departure leads anywhere, because of what happens next.',
        onCarbon: ['a methyl group, which never leaves', 'the oxygen with the minus, which pushes back down instead of leaving', 'hydroxide, which just came on', 'methoxide'],
        say: 'The oxygen pushes back down and something has to go. Hydroxide and methoxide are nearly tied, so this step is reversible and it goes back and forth. Methoxide leaving is the one that counts.',
        arrows: [
          { from: { m: 'lpOm' }, to: { b: { t: 'O', q: '-', n: 0 } }, bend: 1, fromName: 'a lone pair on the oxygen with the minus', toName: 'the carbon-oxygen bond, rebuilding the C=O', say: 'The oxygen pushes back down.' },
          { from: { b: [{ v: { deg: 2, el: 'O' } }, { v: { deg: 4 } }] }, to: { v: { deg: 2, el: 'O' } }, bend: 1, fromName: 'the carbon to methoxy bond', toName: 'the methoxy oxygen', say: 'Methoxide leaves with the pair.' }
        ]
      },
      {
        name: 'the proton that ends it', nuc: 'methoxide', ele: 'the O-H proton of the new acid',
        say: 'Here is the whole reason saponification is a one-way trip. You just made a carboxylic acid, pKa about 5, sitting next to methoxide, whose conjugate acid is 16. That proton is gone instantly. And a carboxylate is not electrophilic, so methanol has nothing to attack. Base hydrolysis is done; acid hydrolysis would still be an equilibrium.',
        arrows: [
          { from: { in: 'w0', m: 'lpO' }, to: { t: 'O', q: 'H', part: 'H' }, bend: -1, fromName: 'the lone pair on methoxide', toName: 'the O-H proton of the acid', say: 'Lone pair to proton.' },
          { from: { t: 'O', q: 'H', part: 'HB' }, to: { t: 'O', q: 'H' }, bend: 1, fromName: 'the O-H bond', toName: 'the acid oxygen', say: 'The pair stays on oxygen: a carboxylate.' }
        ]
      }
    ]
  },
  {
    id: 'fischer', chip: 'Fischer esterification (every proton)', name: 'Fischer esterification', reagent: 'CH3CH2OH, H+ (cat.), heat',
    roots: ['l2-acidity', 'l2-bully', 'l2-arrows'],
    after: 'Six steps, and four of them are proton moves. Count them: protonate, attack, shuffle the proton, protonate again, kick out water, deprotonate. Every arrow is one you already own. Every single step is reversible, which is why you drive it with excess alcohol or by boiling the water off.',
    states: [
      { main: 'CC(=O)O', with: ['[OH3+]', 'CCO'], side: 'right', label: 'acetic acid + acid + ethanol' },
      { main: 'CC(=[OH+])O', with: ['O', 'CCO'], side: 'right', label: 'protonated carbonyl + water + ethanol' },
      { main: 'CC(O)(O)[OH+]CC', with: ['O'], side: 'right', label: 'the tetrahedral intermediate, plus one proton' },
      { main: 'CC(O)(O)OCC', with: ['[OH3+]'], side: 'right', label: 'the neutral intermediate' },
      { main: 'CC(O)([OH2+])OCC', with: ['O'], side: 'right', label: 'one OH is now water: a real leaving group' },
      { main: 'CC(=[OH+])OCC', with: ['O', 'O'], side: 'right', label: 'protonated ester + water' },
      { main: 'CCOC(C)=O', with: ['O', '[OH3+]'], side: 'right', label: 'ethyl acetate. The catalyst is back.' }
    ],
    steps: [
      {
        name: 'protonate the carbonyl', nuc: 'the carbonyl oxygen', ele: 'the proton on H3O+',
        say: 'An acid on its own is a poor electrophile, so first you make it hungrier. Protonate the carbonyl oxygen and that carbon gets much more electron poor. This is acid catalysis, the same move as everywhere else.',
        arrows: [
          { from: { m: 'lpO' }, to: { in: 'w0', t: 'O', part: 'H' }, bend: 1, fromName: 'a lone pair on the carbonyl oxygen', toName: 'a proton on H3O+', say: 'Lone pair to proton.' },
          { from: { in: 'w0', t: 'O', part: 'HB' }, to: { in: 'w0', t: 'O' }, bend: 1, fromName: 'the O-H bond of H3O+', toName: 'the oxygen of H3O+', say: 'That gives you water back.' }
        ]
      },
      {
        name: 'ethanol attacks', nuc: 'the ethanol oxygen', ele: 'the protonated carbonyl carbon',
        say: 'Now ethanol, a weak nucleophile, is good enough, because the carbon it is attacking is much more electron poor than it was. Attack, pi bond up onto oxygen, tetrahedral intermediate.',
        arrows: [
          { from: { in: 'w1', m: 'lpO' }, to: CARBONYL_C, bend: -1, fromName: 'the lone pair on the ethanol oxygen', toName: 'the carbonyl carbon', say: 'Lone pair to the hungry carbon.' },
          { from: { b: 'dbl' }, to: { t: 'O', q: '+' }, bend: 1, fromName: 'the C=O pi bond', toName: 'the protonated oxygen', say: 'The pi bond goes up onto oxygen.' }
        ]
      },
      {
        name: 'shuffle the proton', nuc: 'water', ele: 'the proton on the new oxygen',
        say: 'The oxygen that just attacked is carrying a plus it does not want. Water takes that proton. Nothing dramatic happened, but you cannot skip it: the plus has to move to the oxygen that is about to leave.',
        arrows: [
          { from: { in: 'w0', m: 'lpO' }, to: { t: 'O', q: '+', part: 'H' }, bend: -1, fromName: 'the lone pair on water', toName: 'the proton on the oxonium', say: 'Lone pair to proton.' },
          { from: { t: 'O', q: '+', part: 'HB' }, to: { t: 'O', q: '+' }, bend: 1, fromName: 'the O-H bond', toName: 'the oxygen', say: 'Neutral intermediate.' }
        ]
      },
      {
        name: 'protonate an OH', nuc: 'one of the OH oxygens', ele: 'the proton on H3O+',
        say: 'Hydroxide is a terrible leaving group. So protonate one of the OH groups and it becomes water, which leaves happily. Same trick as SN1 on an alcohol.',
        arrows: [
          { from: { m: 'lpOH' }, to: { in: 'w0', t: 'O', part: 'H' }, bend: 1, fromName: 'a lone pair on one of the OH oxygens', toName: 'a proton on H3O+', say: 'Lone pair to proton.' },
          { from: { in: 'w0', t: 'O', part: 'HB' }, to: { in: 'w0', t: 'O' }, bend: 1, fromName: 'the O-H bond of H3O+', toName: 'the oxygen of H3O+', say: 'The catalyst hands over its proton.' }
        ]
      },
      {
        name: 'water leaves', nuc: 'the remaining OH oxygen', ele: 'the carbon holding four groups',
        leaves: 'water', leavesWhy: 'Water is the best leaving group on that carbon once you have protonated it; the plain OH and the OEt are both still bad.',
        onCarbon: ['a methyl group, which never leaves', 'the plain OH, which pushes back down instead of leaving', 'the ethoxy group', 'water'],
        say: 'The intermediate decides. The other oxygen pushes its lone pair down to rebuild the C=O, and that push shoves off the water.',
        arrows: [
          { from: { m: 'lpOH' }, to: { b: { t: 'O', q: 'H', nq: '+', n: 0 } }, bend: 1, fromName: 'a lone pair on the OH oxygen', toName: 'the carbon-oxygen bond, rebuilding the C=O', say: 'The oxygen pushes back down.' },
          { from: { b: { t: 'O', q: '+', n: 0 } }, to: { t: 'O', q: '+' }, bend: 1, fromName: 'the carbon to water bond', toName: 'the leaving water', say: 'Water leaves with the pair.' }
        ]
      },
      {
        name: 'lose the proton', nuc: 'water', ele: 'the proton on the ester oxygen',
        say: 'Water takes the last proton and hands the catalyst back. Ethyl acetate, and the H+ you started with is still there ready to do it again. That is what catalytic means.',
        arrows: [
          { from: { in: 'w0', m: 'lpO' }, to: { t: 'O', q: '+', part: 'H' }, bend: -1, fromName: 'the lone pair on water', toName: 'the proton on the ester oxygen', say: 'Lone pair to proton.' },
          { from: { t: 'O', q: '+', part: 'HB' }, to: { t: 'O', q: '+' }, bend: 1, fromName: 'the O-H bond', toName: 'the oxygen', say: 'Neutral ester, catalyst regenerated.' }
        ]
      }
    ]
  },
  {
    id: 'grignard', chip: 'Ester + 2 Grignards', name: 'a Grignard on an ester', reagent: '1. 2 CH3MgBr, 2. H3O+',
    roots: ['l2-bully', 'l2-arrows', 'l2-carbocation'],
    after: 'This is why you cannot stop at the ketone. The first equivalent runs a substitution and leaves you a ketone, and a ketone is a hungrier electrophile than the ester you started with, so the second equivalent is gone before you can blink. Aqueous workup then gives tert-butanol, with two identical new methyls on the carbon.',
    states: [
      { main: 'COC(C)=O', with: ['[CH3-]'], side: 'right', label: 'methyl acetate + CH3MgBr' },
      { main: 'CC([O-])(C)OC', label: 'the tetrahedral intermediate' },
      { main: 'CC(C)=O', with: ['C[O-]', '[CH3-]'], side: 'right', arrives: [1], label: 'acetone, methoxide, and a second equivalent' },
      { main: 'CC(C)(C)[O-]', with: ['C[O-]'], side: 'right', label: 'the tertiary alkoxide. Water gives tert-butanol.' }
    ],
    steps: [
      {
        name: 'the first attack', nuc: 'the Grignard carbon', ele: 'the carbonyl carbon of the ester',
        say: 'A Grignard is a carbon with a minus on it, the strongest nucleophile you meet on this test. It attacks the ester carbonyl and the pi bond goes up onto oxygen.',
        arrows: [
          { from: { in: 'w0', m: 'lpC' }, to: CARBONYL_C, bend: 1, fromName: 'the lone pair on the Grignard carbon', toName: 'the carbonyl carbon', say: 'Carbon attacks carbon.' },
          { from: { b: 'dbl' }, to: CARBONYL_O, bend: 1, fromName: 'the C=O pi bond', toName: 'the carbonyl oxygen', say: 'The pi bond kicks up onto the bully.' }
        ]
      },
      {
        name: 'collapse to a ketone', nuc: 'the oxygen with the minus', ele: 'the carbon holding four groups',
        leaves: 'methoxide', leavesWhy: 'Methoxide is the only real leaving group up there. A methyl carbanion would be a pKa 50 base, so it never leaves once it has attached.',
        onCarbon: ['the old methyl group, which never leaves', 'the oxygen with the minus, which pushes back down instead of leaving', 'the methyl that just attacked, which never leaves', 'methoxide'],
        say: 'The oxygen pushes back down and methoxide goes. Notice what you are holding now: a ketone. That is the substitution half, and it is where a lot of people stop.',
        arrows: [
          { from: { m: 'lpOm' }, to: { b: { t: 'O', q: '-', n: 0 } }, bend: 1, fromName: 'a lone pair on the oxygen with the minus', toName: 'the carbon-oxygen bond, rebuilding the C=O', say: 'The oxygen pushes back down.' },
          { from: { b: [{ v: { deg: 2, el: 'O' } }, { v: { deg: 4 } }] }, to: { v: { deg: 2, el: 'O' } }, bend: 1, fromName: 'the carbon to methoxy bond', toName: 'the methoxy oxygen', say: 'Methoxide leaves. That is a ketone now.' }
        ]
      },
      {
        name: 'the second attack, and it does not stop', nuc: 'the second Grignard carbon', ele: 'the carbonyl carbon of the ketone',
        say: 'The ketone is more electron poor than the ester was, because it has no oxygen next door donating in. So the second equivalent attacks faster than the first did, and this time there is no leaving group on that carbon. Addition, not substitution. Game over at the alkoxide.',
        arrows: [
          { from: { in: 'w1', m: 'lpC' }, to: CARBONYL_C, bend: -1, fromName: 'the lone pair on the second Grignard carbon', toName: 'the ketone carbonyl carbon', say: 'Carbon attacks carbon again.' },
          { from: { b: 'dbl' }, to: CARBONYL_O, bend: 1, fromName: 'the C=O pi bond', toName: 'the carbonyl oxygen', say: 'The pi bond goes up. Nothing can leave, so it stays.' }
        ]
      }
    ]
  }
];

// The intermediates panel: what is on that carbon and how badly each wants to go.
const LG_RANK = [
  { key: 'chloride', label: 'chloride', score: 5, why: 'HCl pKa about -7. The happiest leaving group in the family.' },
  { key: 'water', label: 'water', score: 4, why: 'H3O+ pKa -1.7. Once you protonate an OH, it leaves willingly.' },
  { key: 'carboxylate', label: 'a carboxylate', score: 3.5, why: 'A carboxylic acid pKa about 5. Very good, which is why anhydrides sit one rung under acid chlorides.' },
  { key: 'methoxide', label: 'methoxide', score: 2.05, why: 'Methanol pKa 16. Mediocre, so this step is reversible.' },
  { key: 'ethoxide', label: 'ethoxide', score: 2.05, why: 'Ethanol pKa 16. Mediocre, so this step is reversible.' },
  { key: 'hydroxide', label: 'hydroxide', score: 2, why: 'Water pKa 15.7. Mediocre, and a hair behind an alkoxide.' },
  { key: 'amide', label: 'the nitrogen of an amide', score: 0.5, why: 'Ammonia pKa 38. It will not leave, which is why an amide is the bottom rung.' },
  { key: 'carbon', label: 'a carbon group', score: 0, why: 'An alkane pKa about 50. A carbon that just attached never leaves again.' },
  { key: 'alkoxide-down', label: 'the oxygen with the minus', score: 0, why: 'It does not leave. It pushes back down and rebuilds the carbonyl, and that push is what shoves the winner off.' }
];
function rankOf(k){ return LG_RANK.find(x => x.key === k); }
const INTERMEDIATES = [
  { mech: 'acyl', smi: 'CC([O-])(Cl)[OH+]C', chip: 'From the acid chloride', groups: ['carbon', 'alkoxide-down', 'water', 'chloride'], names: ['the old methyl group', 'the oxygen with the minus', 'the protonated methanol oxygen', 'the chlorine'], winner: 3, line: 'Four groups, one obvious winner. Chloride is so much better than anything else here that this collapse is not even a contest, and it is why an acid chloride reacts with anything you put near it.' },
  { mech: 'saponification', smi: 'CC([O-])(O)OC', chip: 'From saponification', groups: ['carbon', 'alkoxide-down', 'hydroxide', 'methoxide'], names: ['the methyl group', 'the oxygen with the minus', 'the OH that just attacked', 'the methoxy group'], winner: 3, line: 'Hydroxide and methoxide are nearly tied, so this intermediate collapses both ways all day. Only one direction leads anywhere: methoxide leaves, and the acid it leaves behind immediately loses its proton to methoxide. That last proton is what makes saponification a one-way trip.' },
  { mech: 'fischer', smi: 'CC(O)([OH2+])OCC', chip: 'From Fischer, after protonation', groups: ['carbon', 'alkoxide-down', 'ethoxide', 'water'], names: ['the methyl group', 'the plain OH, which pushes down', 'the ethoxy group', 'the protonated OH, now water'], winner: 3, line: 'You protonated one OH on purpose. That turns a terrible leaving group into water, the best one on this carbon, so it goes and the ester forms. Every step here is reversible, which is exactly why the same drawing run backward is acid hydrolysis.' },
  { mech: 'grignard', smi: 'CC([O-])(C)OC', chip: 'From the Grignard', groups: ['carbon', 'alkoxide-down', 'carbon', 'methoxide'], names: ['the old methyl group', 'the oxygen with the minus', 'the methyl that just attacked', 'the methoxy group'], winner: 3, line: 'Methoxide is the only thing on that carbon that can leave, so out it goes and you are holding a ketone. The methyl that just attacked cannot leave again; a carbanion is a pKa 50 base. That is the whole reason a Grignard cannot stop at the ketone.' }
];

/* ------------------------------------------------------------------ */
/* Node-safe helpers                                                    */
/* ------------------------------------------------------------------ */
function mulberry(seed){ let s = seed | 0; return function(){ s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function heavy(smi){ const s = smi.replace(/\[([A-Z][a-z]?|[a-z])[^\]]*\]/g, (m, g) => g); return (s.match(/Cl|Br|[BCNOSPFI]|[cnos]/g) || []).length; }
function charge(smi){ let q = 0; for (const b of smi.match(/\[[^\]]*\]/g) || []){ const p = /([+-])(\d?)/.exec(b); if (p) q += (p[1] === '+' ? 1 : -1) * (p[2] ? +p[2] : 1); } return q; }
function smilesSane(smi){
  if (typeof smi !== 'string' || !smi) return false;
  let d = 0; for (const ch of smi){ if (ch === '(') d++; if (ch === ')') d--; if (d < 0) return false; }
  if (d) return false;
  const ring = {}; for (const m of smi.replace(/\[[^\]]*\]/g, 'X').match(/\d/g) || []) ring[m] = (ring[m] || 0) + 1;
  return Object.values(ring).every(n => n % 2 === 0);
}
function stateSmiles(st){ return (Array.isArray(st.main) ? st.main : [st.main]).concat(st.with || []); }
function mainsOf(st){ return Array.isArray(st.main) ? st.main : [st.main]; }

/* ------------------------------------------------------------------ */
/* Item generators (pure). Every answer is computed from the tables.    */
/* ------------------------------------------------------------------ */
const KINDS = ['next', 'start', 'draw', 'leaves', 'steps'];
function allMains(){ const s = new Set(); for (const M of MECHANISMS) for (const st of M.states) for (const m of mainsOf(st)) s.add(m); return [...s]; }
function pickN(rng, arr, n, not){ const pool = arr.filter(x => !not.includes(x)); const out = []; while (out.length < n && pool.length){ const i = Math.floor(rng() * pool.length); out.push(pool.splice(i, 1)[0]); } return out; }
function shuffled(rng, a){ const b = a.slice(); for (let i = b.length - 1; i > 0; i--){ const j = Math.floor(rng() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; }
function stepOf(rng){ const M = MECHANISMS[Math.floor(rng() * MECHANISMS.length)]; const i = Math.floor(rng() * M.steps.length); return { M, i, step: M.steps[i], state: M.states[i], nextState: M.states[i + 1] }; }
function collapseSteps(){ const out = []; for (const M of MECHANISMS) M.steps.forEach((s, i) => { if (s.leaves) out.push({ M, i, step: s }); }); return out; }

function genItem(rng, kind){
  kind = kind || KINDS[Math.floor(rng() * KINDS.length)];
  if (kind === 'next'){
    const pick = stepOf(rng);
    const ans = mainsOf(pick.nextState)[0], h = heavy(ans);
    const others = allMains().filter(s => s !== ans && s !== mainsOf(pick.state)[0]);
    const same = others.filter(s => Math.abs(heavy(s) - h) <= 1), rest = others.filter(s => Math.abs(heavy(s) - h) > 1);
    let d = pickN(rng, same, 3, []); if (d.length < 3) d = d.concat(pickN(rng, rest, 3 - d.length, d));
    if (d.length < 3) d = d.concat(pickN(rng, SMILES.filter(s => s !== ans && !d.includes(s)), 3 - d.length, []));
    const choices = shuffled(rng, [ans].concat(d));
    return { kind, drawn: true, M: pick.M, i: pick.i, stem: 'Here is ' + pick.state.label + '. The step is: ' + pick.step.name + '. Which species comes next?', choices: choices.map(s => ({ text: nameOf(s), smiles: s })), correct: choices.indexOf(ans), coach: 'Push the arrows on the drawing: ' + pick.step.arrows.map(a => a.fromName + ' to ' + a.toName).join(', then ') + '. That gives ' + nameOf(ans) + '.', roots: pick.M.roots };
  }
  if (kind === 'start' || kind === 'draw'){
    const pick = stepOf(rng), ar = pick.step.arrows[0];
    const otherFrom = []; for (const M of MECHANISMS) for (const s of M.steps) for (const a of s.arrows) if (a.fromName !== ar.fromName && !otherFrom.includes(a.fromName)) otherFrom.push(a.fromName);
    if (kind === 'start'){
      const pool = []; for (const t of otherFrom.concat(['the plus sign on the oxygen', 'the carbonyl carbon itself', 'the hydrogen atom itself'])) if (t !== ar.fromName && !pool.includes(t)) pool.push(t);
      const d = pickN(rng, pool, 3, []);
      const choices = shuffled(rng, [ar.fromName].concat(d));
      return { kind, tap: true, M: pick.M, i: pick.i, arrow: 0, stem: 'Here is ' + pick.state.label + '. Where does the FIRST arrow of this step (' + pick.step.name + ') start?', choices: choices.map(t => ({ text: t, smiles: null })), correct: choices.indexOf(ar.fromName), coach: 'Arrows start at electrons. Here the electron-rich partner is ' + pick.step.nuc + ', so the arrow starts at ' + ar.fromName + ' and lands on ' + ar.toName + '.', roots: pick.M.roots };
    }
    const right = 'from ' + ar.fromName + ' to ' + ar.toName;
    const all = []; for (const M of MECHANISMS) for (const s of M.steps) for (const a of s.arrows) all.push(a);
    const cands = [], push = t => { if (t !== right && !cands.includes(t)) cands.push(t); };
    push('from ' + ar.toName + ' to ' + ar.fromName);
    for (const alt of shuffled(rng, all)){ push('from ' + ar.fromName + ' to ' + alt.toName); push('from ' + alt.fromName + ' to ' + ar.toName); push('from ' + alt.fromName + ' to ' + alt.toName); if (cands.length >= 9) break; }
    const d = pickN(rng, cands, 3, []);
    const choices = shuffled(rng, [right].concat(d));
    return { kind, M: pick.M, i: pick.i, arrow: 0, stem: 'Here is ' + pick.state.label + '. Draw the first arrow of the step (' + pick.step.name + '): where does it start, and where does it land?', choices: choices.map(t => ({ text: t, smiles: null })), correct: choices.indexOf(right), coach: 'Rich attacks poor. The electrons sit on ' + pick.step.nuc + '; they go to ' + pick.step.ele + '. So: ' + right + '.', roots: pick.M.roots };
  }
  if (kind === 'leaves'){
    const list = collapseSteps(), pick = list[Math.floor(rng() * list.length)], step = pick.step;
    const pool = []; for (const t of step.onCarbon.concat(list.map(s => s.step.leaves), ['the nitrogen of an amide'])) if (t !== step.leaves && !pool.includes(t)) pool.push(t);
    const d = pickN(rng, pool, 3, []);
    const choices = shuffled(rng, [step.leaves].concat(d));
    return { kind, M: pick.M, i: pick.i, stem: 'This is the tetrahedral intermediate in ' + pick.M.name + '. The oxygen is about to push back down. Which group leaves?', choices: choices.map(t => ({ text: t, smiles: null })), correct: choices.indexOf(step.leaves), coach: 'Rank the four groups as leaving groups, which means judging their conjugate acids. ' + step.leavesWhy + ' So ' + step.leaves + ' goes.', roots: pick.M.roots };
  }
  // steps: how many steps does the whole mechanism take
  const M = MECHANISMS[Math.floor(rng() * MECHANISMS.length)], n = M.steps.length;
  const pool = [1, 2, 3, 4, 5, 6, 7].filter(k => k !== n);
  const near = pool.filter(k => Math.abs(k - n) <= 3);
  const choices = shuffled(rng, [n].concat(pickN(rng, near, 3, [])));
  return { kind: 'steps', noState: true, M, i: 0, stem: 'How many steps does ' + M.name + ' take, counting every proton transfer as its own step?', choices: choices.map(k => ({ text: String(k) + (k === 1 ? ' step' : ' steps'), smiles: null })), correct: choices.indexOf(n), coach: 'Walk the drawing: ' + M.steps.map(s => s.name).join(', then ') + '. That is ' + n + '.', roots: M.roots };
}

export function makeItem(api){
  const it = genItem(api.rng);
  const st = it.M ? it.M.states[it.i] : null;
  return { stem: it.stem, sub: st ? mainsOf(st)[0] : null, reagent: st ? (st.with || []).map(nameOf).join(' + ') || null : null, prod: null, choices: it.choices, correct: it.correct, coach: it.coach, home: meta.id, roots: it.roots || ['l2-bully', 'l2-arrows'] };
}

export function selfTest(deps){
  let tried = 0;
  try {
    const rng = mulberry(77);
    const api = { rng, pick: a => a[Math.floor(rng() * a.length)], shuffle: a => shuffled(rng, a), reactions: deps && deps.reactions, bank: deps && deps.bank };
    // table invariants
    for (const M of MECHANISMS){
      if (M.steps.length !== M.states.length - 1) throw new Error(M.id + ': steps must be states minus one');
      for (const st of M.states) for (const s of stateSmiles(st)){
        if (!SMILES.includes(s)) throw new Error(M.id + ': ' + s + ' missing from SMILES');
        if (!SPECIES[s]) throw new Error(M.id + ': ' + s + ' missing from SPECIES');
        if (!smilesSane(s)) throw new Error(s + ' has unmatched parentheses or ring digits');
      }
      for (let i = 0; i < M.steps.length; i++){
        const a = M.states[i], b = M.states[i + 1];
        const hv = st => stateSmiles(st).reduce((n, s) => n + heavy(s), 0);
        const qv = st => stateSmiles(st).reduce((n, s) => n + charge(s), 0);
        const arr = (b.arrives || []).reduce((n, j) => n + heavy(b.with[j]), 0), arrQ = (b.arrives || []).reduce((n, j) => n + charge(b.with[j]), 0);
        if (hv(a) + arr !== hv(b)) throw new Error(M.id + ' step ' + i + ': heavy atoms not conserved (' + hv(a) + ' plus ' + arr + ' is not ' + hv(b) + ')');
        if (qv(a) + arrQ !== qv(b)) throw new Error(M.id + ' step ' + i + ': charge not conserved');
        const step = M.steps[i];
        if (!step.arrows.length || !step.nuc || !step.ele || !step.say) throw new Error(M.id + ' step ' + i + ': incomplete');
        for (const ar of step.arrows){
          const f = ar.from;
          const fromElectrons = f.m != null || f.mb != null || f.b != null || (f.t && (f.part === 'HB' || !f.part));
          if (!fromElectrons) throw new Error(M.id + ' step ' + i + ': an arrow starts at something that is not electrons');
          if (!ar.fromName || !ar.toName) throw new Error(M.id + ': every arrow needs names');
        }
        if (step.leaves){
          if (!step.onCarbon || step.onCarbon.length !== 4) throw new Error(M.id + ' step ' + i + ': a collapse needs four groups on the carbon');
          if (!step.onCarbon.includes(step.leaves)) throw new Error(M.id + ' step ' + i + ': the leaving group is not on the carbon');
          if (!step.leavesWhy) throw new Error(M.id + ' step ' + i + ': a collapse needs its reason');
        }
      }
    }
    for (const s of SMILES) if (!smilesSane(s)) throw new Error('bad SMILES ' + s);
    for (const I of INTERMEDIATES){
      if (!SMILES.includes(I.smi)) throw new Error(I.mech + ': intermediate missing from SMILES');
      if (I.groups.length !== 4 || I.names.length !== 4) throw new Error(I.mech + ': four groups required');
      for (const g of I.groups) if (!rankOf(g)) throw new Error(I.mech + ': unknown leaving group ' + g);
      const best = I.groups.reduce((b, g, k) => rankOf(g).score > rankOf(I.groups[b]).score ? k : b, 0);
      if (best !== I.winner) throw new Error(I.mech + ': the ranking does not agree with the stated winner');
      if (!MECHANISMS.some(M => M.id === I.mech)) throw new Error('no mechanism ' + I.mech);
    }
    // items
    const kinds = {};
    for (let n = 0; n < 320; n++){
      const it = makeItem(api); tried++;
      if (!it.choices || it.choices.length !== 4) throw new Error('four choices required');
      const keys = it.choices.map(c => (c.smiles || '') + '|' + (c.text || ''));
      if (new Set(keys).size !== 4) throw new Error('choices not distinct: ' + keys.join(' / '));
      if (!(it.correct >= 0 && it.correct < 4)) throw new Error('bad correct index');
      for (const c of it.choices) if (c.smiles && !smilesSane(c.smiles)) throw new Error('bad SMILES ' + c.smiles);
      if (it.sub && !smilesSane(it.sub)) throw new Error('bad sub SMILES');
      if (!it.coach || !it.stem) throw new Error('coach or stem empty');
      if (it.home !== meta.id) throw new Error('home');
      if (!Array.isArray(it.roots) || !it.roots.length) throw new Error('roots');
    }
    for (const k of KINDS){ const it = genItem(mulberry(11), k); if (!it || it.correct < 0) throw new Error(k + ' failed'); kinds[k] = 1; }
    // the leaving-group answer agrees with the ranking table every time
    for (let n = 0; n < 200; n++){
      const it = genItem(rng, 'leaves');
      const step = it.M.steps[it.i];
      const scores = step.onCarbon.map((t, k) => ({ t, s: (rankOf((INTERMEDIATES.find(I => I.mech === it.M.id) || { groups: [] }).groups[k] || 'carbon') || { score: 0 }).score }));
      const best = scores.reduce((b, x) => x.s > b.s ? x : b, scores[0]);
      if (best.t !== step.leaves) throw new Error('the collapse answer does not match the ranking for ' + it.M.id);
      if (it.choices[it.correct].text !== step.leaves) throw new Error('leaves item marked the wrong choice');
    }
    const a = genItem(mulberry(9)), b = genItem(mulberry(9));
    if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error('not reproducible');
    return { ok: true, tried, notes: MECHANISMS.length + ' mechanisms, ' + MECHANISMS.reduce((n, M) => n + M.steps.length, 0) + ' steps, ' + KINDS.length + ' item kinds' };
  } catch (e){ return { ok: false, tried, notes: e.message }; }
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

// Read one drawn species: heteroatom labels (position from the mask circles, H glyph position from
// the tspans), vertices and bonds from the lines (the short inner line of a double bond merges).
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
  else if (spec.ringc){ const list = G.V.filter(v => v.el === 'C' && v.deg >= 2); if (list.length) p = { x: list.reduce((s, v) => s + v.x, 0) / list.length, y: list.reduce((s, v) => s + v.y, 0) / list.length }; }
  else if (spec.t){ const list = G.texts.filter(t => t.el === spec.t && (!spec.q || t.raw.includes(spec.q)) && (!spec.nq || !t.raw.includes(spec.nq))); const t = pickOne(list, spec); if (t) p = spec.part === 'H' ? { x: t.hx, y: t.hy } : spec.part === 'HB' ? { x: (t.x + t.hx) / 2, y: (t.y + t.hy) / 2 } : { x: t.x, y: t.y }; }
  else if (spec.v){ const c = spec.v; const list = G.V.filter(v => (c.deg == null || v.deg === c.deg) && (c.order == null || v.order === ORD[c.order]) && (c.el == null ? v.el === 'C' : v.el === c.el) && (c.nb == null || v.nb.some(j => G.V[j].el === c.nb)) && (c.notnb == null || !v.nb.some(j => G.V[j].el === c.notnb))); const v = pickOne(list, c); if (v) p = { x: v.x, y: v.y }; }
  else if (spec.b){
    const b = spec.b;
    if (Array.isArray(b)){ const a = resolve(G, b[0]), c = resolve(G, b[1]); if (a && c) p = { x: (a.x + c.x) / 2, y: (a.y + c.y) / 2 }; }
    else if (b === 'dbl' || b === 'tpl'){ const list = G.edges.filter(e => e.order === ORD[b]).map(e => ({ x: e.mid.x, y: e.mid.y })); const e = pickOne(list, spec); if (e) p = { x: e.x, y: e.y }; }
    else if (b === 'cc2'){ const list = G.edges.filter(e => e.order === 2 && G.V[e.a].el === 'C' && G.V[e.b].el === 'C').map(e => ({ x: e.mid.x, y: e.mid.y })); const e = pickOne(list, spec); if (e) p = { x: e.x, y: e.y }; }
    else if (b.t){ const t = pickOne(G.texts.filter(t => t.el === b.t && (!b.q || t.raw.includes(b.q)) && (!b.nq || !t.raw.includes(b.nq))), b); const v = t && G.V.find(v => v.text === t); const e = v && G.edges.filter(e => e.a === v.i || e.b === v.i)[b.n || 0]; if (e) p = { x: e.mid.x, y: e.mid.y }; }
    else if (b.v){ const v0 = resolve(G, { v: b.v }); if (v0){ let vv = null, bd = 3; for (const w of G.V) { const d = Math.hypot(w.x - v0.x, w.y - v0.y); if (d < bd){ bd = d; vv = w; } } const e = vv && G.edges.filter(e => e.a === vv.i || e.b === vv.i)[b.n || 0]; if (e) p = { x: e.mid.x, y: e.mid.y }; } }
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
  out.hits = () => {
    const h = [];
    for (const m of placed){
      if (m.kind === 'lp') h.push({ kind: 'lp', p: out.T(m), name: 'the lone pair on ' + (G.V.find(v => Math.hypot(v.x - m.bx, v.y - m.by) < 2) || { el: 'the atom' }).el });
      if (m.kind === 'H'){ h.push({ kind: 'atom', p: out.T(m), name: 'a hydrogen' }); h.push({ kind: 'sigma', p: out.T({ x: (m.x + m.bx) / 2, y: (m.y + m.by) / 2 }), name: 'the C-H bond' }); }
      if (m.kind === '+') h.push({ kind: 'plus', p: out.T(m), name: 'the plus sign' });
      if (m.kind === '-') h.push({ kind: 'lp', p: out.T(m), name: 'the minus, a lone pair' });
    }
    for (const e of G.edges) h.push({ kind: e.order > 1 ? 'pi' : 'sigma', p: out.T(e.mid), name: e.order > 1 ? 'the pi bond' : 'a sigma bond' });
    for (const v of G.V) h.push({ kind: 'atom', p: out.T(v), name: v.text ? 'the ' + v.el + ' atom' : 'a carbon' });
    for (const t of G.texts) if (t.hasH){ h.push({ kind: 'atom', p: out.T({ x: t.hx, y: t.hy }), name: 'a hydrogen on ' + t.el }); h.push({ kind: 'sigma', p: out.T({ x: (t.x + t.hx) / 2, y: (t.y + t.hy) / 2 }), name: 'the ' + t.el + '-H bond' }); }
    return h;
  };
  return out;
}
// Build one state box (partners beside the main species) into a layer.
function buildState(api, layer, st, k, X, Y, opts){
  const kp = k * 0.92, gap = 12 * k / 1.5, padX = 12, padY = 10;
  const mains = mainsOf(st).map(s => prepareSpecies(api, layer, s, k));
  const withs = (st.with || []).map(s => prepareSpecies(api, layer, s, kp));
  const mainW = mains.reduce((s, m) => s + m.w, 0) + (mains.length - 1) * gap, mainH = Math.max(...mains.map(m => m.h));
  const withW = withs.length ? Math.max(...withs.map(w => w.w)) : 0, withH = withs.reduce((s, w) => s + w.h, 0) + Math.max(0, withs.length - 1) * 6;
  const innerW = mainW + (withs.length ? withW + gap : 0), innerH = Math.max(mainH, withH);
  const w = innerW + 2 * padX, h = innerH + 2 * padY + (opts && opts.noLabel ? 0 : 20) + (st.mainLabels ? 13 : 0);
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
  const t0 = Math.min(3 * k, L * 0.12), t1 = Math.min(9 * k, L * 0.3);
  const fx = from.x + dx / L * t0, fy = from.y + dy / L * t0, tx = to.x - dx / L * t1, ty = to.y - dy / L * t1;
  const amp = Math.min(Math.max(10 * k, L * 0.34), 60 * k);
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
  const cap = el('div', { style: { marginTop: '10px', minHeight: '4.6em' } });
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
    legendItem(s => s.append(svg('path', { d: 'M3 13 Q13 -2 23 9', fill: 'none', stroke: C.goldhi, 'stroke-width': '2', 'stroke-linecap': 'round' }), svg('path', { d: 'M19 5 L23.5 9.5 L17.5 10.5 z', fill: C.goldhi })), 'gold arrow: two electrons moving'),
    legendItem(s => s.append(svg('rect', { x: 3, y: 3, width: 20, height: 10, rx: 3, fill: 'none', stroke: C.gold, 'stroke-width': '1.6' })), 'the state being built right now')
  );
  slots.visual.append(wrap, el('div', { class: 'controls' }, nextBtn, playBtn, resetBtn), cap, chips, legend);

  let boxes = [], mid = '', layers = null, W = 960, k = 1.5, laidHidden = false;
  function layout(){
    W = Math.max(300, Math.round(wrap.clientWidth || 0)) || 960; laidHidden = !wrap.clientWidth;
    k = W < 560 ? 1.15 : W < 800 ? 1.3 : 1.45;
    stage.replaceChildren(); mid = 'mk' + (++uid);
    stage.append(markerDefs(api, mid, C.goldhi), markerDefs(api, mid + 'f', C.gold));
    layers = { boxes: svg('g', {}), species: svg('g', {}), labels: svg('g', {}), arrows: svg('g', {}) };
    stage.append(layers.boxes, layers.species, layers.labels, layers.arrows);
    boxes = mech.states.map(st => buildState(api, layers.species, st, k, 0, 0));
    const conn = Math.max(54 * k / 1.5, Math.max(...mech.steps.map(s => s.name.length)) * 6.3 + 18), rows = [[]]; let x = 0;
    for (const b of boxes){ const need = (rows[rows.length - 1].length ? conn : 0) + b.w; if (x + need > W && rows[rows.length - 1].length){ rows.push([]); x = 0; } if (rows[rows.length - 1].length) x += conn; rows[rows.length - 1].push(b); x += b.w; }
    let y = 8; const rowGap = 46;
    for (const row of rows){
      const rowW = row.reduce((s, b) => s + b.w, 0) + (row.length - 1) * conn, rowH = Math.max(...row.map(b => b.h));
      let rx = Math.max(0, (W - rowW) / 2);
      for (const b of row){ b.place(rx, y + (rowH - b.h) / 2); b.row = rows.indexOf(row); rx += b.w + conn; }
      y += rowH + rowGap;
    }
    const H = y - rowGap + 8;
    stage.setAttribute('viewBox', '0 0 ' + W + ' ' + H); stage.style.aspectRatio = W + ' / ' + H;
    boxes.forEach((b, i) => {
      b.rect = svg('rect', { x: b.x, y: b.y, width: b.w, height: b.h, rx: 10, fill: 'rgba(255,255,255,.02)', stroke: C.line, 'stroke-width': '1' });
      layers.boxes.append(b.rect);
      b.label = svg('text', { x: b.x + b.w / 2, y: b.y + b.h - 7, 'text-anchor': 'middle', 'font-family': 'Georgia, serif', 'font-size': String(12.5 * k / 1.5), fill: C.ink2, text: b.st.label });
      layers.labels.append(b.label);
      if (Array.isArray(b.st.main) && b.st.mainLabels) b.mains.forEach((m, j) => layers.labels.append(svg('text', { x: m.X + m.w / 2, y: m.Y + m.h + 2, 'text-anchor': 'middle', 'font-family': 'ui-monospace, Menlo, monospace', 'font-size': String(9.5 * k / 1.5), fill: C.gold, text: b.st.mainLabels[j] })));
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
    for (let s = 0; s < cur.step; s++) for (const ar of mech.steps[s].arrows){ const p = arrowPath(api, boxes[s], ar, mid, k); if (p){ p.setAttribute('opacity', '0.3'); layers.arrows.append(p); } }
    if (!cur.done && cur.step < mech.steps.length) for (let a = 0; a < cur.arrow; a++){ const p = arrowPath(api, boxes[cur.step], mech.steps[cur.step].arrows[a], mid, k); if (p) layers.arrows.append(p); }
    if (animateReveal && cur.step < boxes.length){ const b = boxes[cur.step]; const D = api.reduced ? 0 : 320; for (const p of Object.values(b.parts)){ p.node.style.transition = 'opacity ' + D + 'ms'; p.marksG.style.transition = 'opacity ' + D + 'ms'; } b.rect.style.transition = 'opacity ' + D + 'ms'; }
    nextBtn.disabled = cur.done; nextBtn.textContent = cur.done ? 'Done' : 'Next arrow';
  }
  function render(){ layout(); }
  function speak(){
    const N = mech.steps.length;
    if (cur.done){ capHead.textContent = 'Done: ' + mech.states[mech.states.length - 1].label; capBody.textContent = mech.after || 'That is the whole mechanism. Reset to push it again, or pick another one.'; return; }
    const st = mech.steps[cur.step];
    capHead.textContent = 'Step ' + (cur.step + 1) + ' of ' + N + ': ' + st.name + '.';
    capBody.textContent = cur.arrow === 0 ? st.say : (st.arrows[cur.arrow - 1].say || st.say);
  }
  function step(){
    if (busy || cur.done) return;
    if (laidHidden && wrap.clientWidth) layout();
    const st = mech.steps[cur.step];
    if (cur.arrow >= st.arrows.length){ reveal(); return; }
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
      timers.push(setTimeout(() => { busy = false; if (cur.arrow === st.arrows.length) reveal(); else if (playing) timers.push(setTimeout(() => step(), api.reduced ? 0 : 380)); }, D + 40));
    } else { busy = false; if (cur.arrow === st.arrows.length) reveal(); }
  }
  function reveal(){
    cur.step++; cur.arrow = 0;
    if (cur.step >= mech.steps.length) cur.done = true;
    paint(true); speak();
    if (playing && !cur.done) timers.push(setTimeout(() => step(), api.reduced ? 0 : 900)); else if (cur.done) stopPlay();
  }
  function play(){ if (playing){ stopPlay(); return; } if (cur.done){ cur = { step: 0, arrow: 0, done: false }; render(); } playing = true; playBtn.textContent = 'Pause'; step(); }
  function stopPlay(){ playing = false; playBtn.textContent = 'Play'; timers.forEach(clearTimeout); timers = []; busy = false; }
  let lastW = 0;
  const onResize = () => { const w = wrap.clientWidth; if (w && w !== lastW){ lastW = w; render(); } };
  window.addEventListener('resize', onResize);
  if (typeof ResizeObserver !== 'undefined'){ try { new ResizeObserver(onResize).observe(wrap); } catch (e){} }
  render(); speak();
  return { get mech(){ return mech; }, render, show(id){ const M = MECHS.find(x => x.id === id); if (!M) return; stopPlay(); mech = M; cur = { step: 0, arrow: 0, done: false }; chipEls.forEach((c, i) => c.setAttribute('aria-pressed', MECHS[i] === M ? 'true' : 'false')); render(); speak(); } };
}

/* ------------------------------------------------------------------ */
/* The intermediate panel: four groups on one carbon, ranked.           */
/* ------------------------------------------------------------------ */
function mountIntermediates(container, api, stage){
  const { el, svg } = api, C = api.colors;
  let cur = INTERMEDIATES[0], openAt = -1;
  const holder = el('div', { style: { marginTop: '18px', paddingTop: '14px', borderTop: '1px solid ' + C.line } });
  holder.append(el('div', { class: 'eyebrow', text: 'The intermediate decides: rank what is on that carbon' }));
  const row = el('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-start', marginTop: '10px' } });
  const molBox = el('div', { style: { flex: '0 0 240px', maxWidth: '100%', border: '1px solid ' + C.line, borderRadius: '12px', padding: '8px', background: 'rgba(255,255,255,.02)' } });
  const list = el('div', { style: { flex: '1 1 380px', minWidth: '0' } });
  const line = el('p', { style: { margin: '10px 0 0', color: C.ink2, fontSize: '15px', maxWidth: '72ch' } });
  const chips = el('div', { class: 'controls', role: 'group', 'aria-label': 'Pick a tetrahedral intermediate' });
  const chipEls = INTERMEDIATES.map(I => el('button', { class: 'chip', type: 'button', 'aria-pressed': I === cur ? 'true' : 'false', text: I.chip, onClick: () => { cur = I; openAt = -1; chipEls.forEach((c, i) => c.setAttribute('aria-pressed', INTERMEDIATES[i] === I ? 'true' : 'false')); draw(); } }));
  chips.append(...chipEls);
  row.append(molBox, list);
  holder.append(chips, row, line);
  container.append(holder);
  const maxScore = Math.max(...LG_RANK.map(x => x.score));
  function draw(){
    molBox.replaceChildren();
    const holderSvg = el('div', { style: { margin: '0 auto' } });
    api.drawSmiles(holderSvg, cur.smi, { width: 240, height: 170, label: 'the tetrahedral intermediate' });
    molBox.append(holderSvg, el('div', { style: { textAlign: 'center', fontFamily: 'Georgia, serif', fontSize: '14px', color: C.ink2, marginTop: '2px' }, text: 'the tetrahedral intermediate' }));
    list.replaceChildren();
    cur.groups.forEach((g, i) => {
      const R = rankOf(g), win = i === cur.winner, open = openAt === i;
      const b = el('button', { type: 'button', 'aria-pressed': open ? 'true' : 'false', style: { display: 'block', width: '100%', textAlign: 'left', minHeight: '46px', padding: '8px 12px', marginTop: i ? '6px' : '0', borderRadius: '10px', border: '1px solid ' + (win ? C.gold : C.line), background: win ? 'rgba(201,168,76,.12)' : 'rgba(255,255,255,.02)', color: C.ink2 }, onClick: () => { openAt = open ? -1 : i; draw(); } });
      const head = el('div', { style: { display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'center' } });
      head.append(el('span', { style: { fontFamily: 'Georgia, serif', fontSize: '15px', color: win ? C.goldhi : C.ink }, text: cur.names[i] }));
      const bar = svg('svg', { viewBox: '0 0 100 10', width: '92', height: '10', 'aria-hidden': 'true', style: { flex: '0 0 92px' } });
      bar.append(svg('rect', { x: 0, y: 3, width: 100, height: 4, rx: 2, fill: 'rgba(255,255,255,.07)' }));
      bar.append(svg('rect', { x: 0, y: 3, width: Math.max(3, 100 * R.score / maxScore), height: 4, rx: 2, fill: win ? C.gold : C.grey }));
      head.append(bar);
      b.append(head);
      b.append(el('div', { style: { fontSize: '13px', color: win ? C.gold : C.ink3, fontFamily: 'ui-monospace, Menlo, monospace', letterSpacing: '.04em', marginTop: '2px' }, text: win ? 'this one leaves' : 'stays put' }));
      if (open) b.append(el('div', { style: { fontSize: '14px', color: C.ink2, marginTop: '6px' }, text: R.why }));
      list.append(b);
    });
    list.append(el('p', { style: { margin: '8px 0 0', fontSize: '13px', color: C.ink3 }, text: 'Tap a group to hear why. The bar is how good a leaving group it is, which is just how weak a base it is.' }));
    line.textContent = cur.line;
  }
  chips.append(el('button', { class: 'chip', type: 'button', text: 'Push this one', onClick: () => { stage.show(cur.mech); } }));
  draw();
  return { draw };
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
  return { svg: s, holder, id, build(){ const box = buildState(api, species, st, k, 0, 0, { noLabel: true }); box.place(0, 0); s.setAttribute('viewBox', '0 0 ' + box.w + ' ' + box.h); s.style.width = Math.min(box.w, 660) + 'px'; s.style.aspectRatio = box.w + ' / ' + box.h; return box; } };
}
function speciesSvg(api, smi, k, maxW){
  const s = api.svg('svg', { role: 'img', 'aria-label': nameOf(smi), style: { display: 'block', maxWidth: '100%', height: 'auto' } });
  const g = api.svg('g', {}); s.append(g);
  return { svg: s, build(){ const p = prepareSpecies(api, g, smi, k); p.place(0, 0); s.setAttribute('viewBox', '0 0 ' + p.w + ' ' + p.h); s.style.width = Math.min(p.w, maxW || 220) + 'px'; s.style.aspectRatio = p.w + ' / ' + p.h; return p; } };
}
function shortWhy(t){
  const parts = String(t || '').split(/(?<=\.)\s+/);
  let out = '';
  for (const p of parts){ if (/RDKit|\bopt\d|keyed|SMILES/i.test(p)) break; out += (out ? ' ' : '') + p; if (out.length > 190) break; }
  return out || String(t || '');
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
      b.addEventListener('click', () => { if (done) return; btns.forEach(x => x.classList.remove('picked')); b.classList.add('picked'); if (i === correct){ b.classList.add('ok'); btns.forEach(x => { x.disabled = true; }); commit(true); } else commit(false, coachText); });
      btns.push(b); grid.append(b);
    });
    box.append(grid);
    for (const b of btns) if (b._draw) b._draw.build();
  }
  function solo(st){ return { main: mainsOf(st)[0], with: st.with, side: st.side, label: st.label }; }
  function showState(st){ const sv = stateSvg(api, st, 1.3); box.append(sv.holder); const bx = sv.build(); return { sv, bx }; }
  function renderGenerated(it){
    box.append(el('p', { class: 'prompt', text: it.stem }));
    if (it.M && it.tap){
      const st = solo(it.M.states[it.i]), step = it.M.steps[it.i], ar = step.arrows[it.arrow || 0];
      const { sv, bx } = showState(st);
      const hitLayer = svg('g', {}), marks = svg('g', {}); sv.svg.append(marks, hitLayer);
      const partOf = spec => bx.parts[spec.in || 'main'];
      const pf = partOf(ar.from), pt = partOf(ar.to);
      const fromP = pf && resolve(pf.G, ar.from), toP = pt && resolve(pt.G, ar.to);
      if (!fromP || !toP){ hitLayer.remove(); optionGrid(it.choices, it.correct, it.coach, false); return; }
      const F = pf.T(fromP);
      const hits = [];
      for (const part of Object.values(bx.parts)) for (const h of part.hits()) hits.push(h);
      const near = (h, P) => Math.hypot(h.p.x - P.x, h.p.y - P.y) < 9;
      if (!hits.some(h => near(h, F))) hits.push({ kind: 'lp', p: F, name: ar.fromName });
      const order = { lp: 0, pi: 1, sigma: 2, plus: 3, atom: 4 };
      hits.sort((a, b) => order[a.kind] - order[b.kind]);
      const uniq = []; for (const h of hits) if (!uniq.some(u => Math.hypot(u.p.x - h.p.x, u.p.y - h.p.y) < 7)) uniq.push(h);
      const kk = bx.mains[0].k;
      const prompt = box.querySelector('.prompt');
      prompt.textContent = it.stem + ' Tap it on the drawing.';
      const choose = h => {
        if (done) return;
        if (near(h, F)){ marks.append(svg('circle', { cx: h.p.x, cy: h.p.y, r: 9 * kk / 1.5, fill: 'none', stroke: C.goldhi, 'stroke-width': '2' })); hitLayer.replaceChildren(); commit(true); return; }
        const why = h.kind === 'plus' ? 'A plus has nothing to give. Arrows start at electrons: here ' + ar.fromName + '.'
          : h.kind === 'atom' ? 'The arrow starts at electrons, not at an atom. Here that is ' + ar.fromName + '.'
          : h.kind === 'sigma' && ar.from.mb == null && !(ar.from.t && ar.from.part === 'HB') && ar.from.b == null ? 'That is a plain sigma bond, and sigma electrons do not attack. Start at ' + ar.fromName + '.'
          : 'Rich attacks poor. The electrons that move first are ' + ar.fromName + '.';
        commit(false, why);
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
    if (it.M && !it.noState) showState(it.M.states[it.i]);
    optionGrid(it.choices, it.correct, it.coach, !!it.drawn);
  }
  function renderBank(b){
    box.append(el('p', { class: 'prompt', text: b.q }));
    if (b.q_smiles){ const holder = el('div', { style: { margin: '0 auto 6px', maxWidth: '340px' } }); api.drawSmiles(holder, b.q_smiles, { width: 300, height: 190, label: 'the structure in the question' }); box.append(holder); }
    box.append(el('p', { class: 'eyebrow', style: { margin: '6px 0 0' }, text: 'From the verified bank, DAT phrasing' }));
    const structural = !!b.opts_are_structures;
    optionGrid(b.opts.map(o => structural ? { text: '', smiles: o } : { text: String(o), smiles: null }), b.correct, shortWhy(b.why), structural);
  }
  function next(){
    box.replaceChildren(); api.clearCoach(); firstTry = true; done = false; turn++;
    const useBank = bank.length && turn % 2 === 0;
    if (useBank){ item = api.pick(bank); renderBank(item); }
    else { item = genItem(api.rng); renderGenerated(item); }
  }
  next();
}

export function mount(slots, api){
  const stage = mountStage(slots, api, { mechanisms: MECHANISMS });
  mountIntermediates(slots.visual, api, stage);
  mountTry(slots, api, { groups: ['acyl-substitution', 'ester-formation-hydrolysis'] });
}
