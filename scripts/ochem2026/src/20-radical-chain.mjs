// Fishhook (one-electron) arrow items and combined-mechanism chains.
// Every figure is pushed for real by verify.py.
const f = (from, to) => ({ fish: true, from, to });
const a = (from, to) => ({ from, to });
const lp = x => ({ lp: x }), e = x => ({ e: x }), b = (x, y) => ({ bond: [x, y] }), at = x => ({ atom: x });
const mech = (species, arrows) => ({ kind: 'mech', species, arrows });

/* ---------------- fishhook: shared species ---------------- */
const BR2 = [{ smi: 'BrBr' }];
const PEROX = [{ smi: 'CC(C)(C)OOC(C)(C)C' }];
const BR_ISOBUTANE = [{ smi: '[Br]', rad: [0] }, { smi: 'CC([H])(C)C' }];
const BR_PROPENE = [{ smi: '[Br]', rad: [0] }, { smi: 'C=CC' }];
const TBU_BR2 = [{ smi: 'C[C](C)C', rad: [1] }, { smi: 'BrBr' }];
const TBU_BR = [{ smi: 'C[C](C)C', rad: [1] }, { smi: '[Br]', rad: [0] }];
const PRENYL = [{ smi: 'CC(C)=C[CH2]', rad: [4] }];
const BR_BUTENE = [{ smi: '[Br]', rad: [0] }, { smi: 'C=CC([H])C' }];

/* ---------------- chains: shared steps ---------------- */
// acid-catalyzed hydration of 2-methylpropene
const HYDRATION = {
  kind: 'chain',
  steps: [
    { name: 'protonate the alkene', species: [{ smi: 'C=C(C)C' }, { smi: '[H][OH2+]' }], arrows: [a(b('0.0', '0.1'), b('0.0', '1.0')), a(b('1.0', '1.1'), at('1.1'))] },
    { name: 'water attacks the cation', species: [{ smi: 'C[C+](C)C' }, { smi: 'O' }], arrows: [a(lp('1.0'), b('1.0', '0.1'))] },
    { name: 'water takes the extra proton', species: [{ smi: 'CC(C)(C)[OH+][H]' }, { smi: 'O' }], adds: ['O'], arrows: [a(lp('1.0'), b('1.0', '0.5')), a(b('0.4', '0.5'), at('0.4'))] }
  ],
  product: [{ smi: 'CC(C)(C)O' }, { smi: '[OH3+]' }]
};
// E1 dehydration of tert-butanol
const E1 = {
  kind: 'chain',
  steps: [
    { name: 'protonate the OH', species: [{ smi: 'CC(C)(C)O' }, { smi: '[H][OH2+]' }], arrows: [a(lp('0.4'), b('0.4', '1.0')), a(b('1.0', '1.1'), at('1.1'))] },
    { name: 'water leaves', species: [{ smi: 'CC(C)(C)[OH2+]' }, { smi: 'O' }], arrows: [a(b('0.1', '0.4'), at('0.4'))] },
    { name: 'lose a beta proton', species: [{ smi: 'C[C+](C)C[H]' }, { smi: 'O' }, { smi: 'O' }], arrows: [a(lp('1.0'), b('1.0', '0.4')), a(b('0.3', '0.4'), b('0.3', '0.1'))] }
  ],
  product: [{ smi: 'C=C(C)C' }, { smi: '[OH3+]' }, { smi: 'O' }]
};
// SN1 hydrolysis of tert-butyl bromide
const SN1 = {
  kind: 'chain',
  steps: [
    { name: 'the leaving group leaves', species: [{ smi: 'CC(C)(C)Br' }], arrows: [a(b('0.1', '0.4'), at('0.4'))], drops: ['[Br-]'] },
    { name: 'water attacks', species: [{ smi: 'C[C+](C)C' }, { smi: 'O' }], adds: ['O'], arrows: [a(lp('1.0'), b('1.0', '0.1'))] },
    { name: 'water takes the proton', species: [{ smi: 'CC(C)(C)[OH+][H]' }, { smi: 'O' }], adds: ['O'], arrows: [a(lp('1.0'), b('1.0', '0.5')), a(b('0.4', '0.5'), at('0.4'))] }
  ],
  product: [{ smi: 'CC(C)(C)O' }, { smi: '[OH3+]' }]
};
// HBr addition to 3-methylbut-1-ene with a hydride shift
const SHIFT = {
  kind: 'chain',
  steps: [
    { name: 'protonate the alkene', species: [{ smi: 'C=CC([H])(C)C' }, { smi: 'Br[H]' }], arrows: [a(b('0.0', '0.1'), b('0.0', '1.1')), a(b('1.0', '1.1'), at('1.0'))] },
    { name: 'the shift', species: [{ smi: 'C[CH+]C([H])(C)C' }, { smi: '[Br-]' }], arrows: [a(b('0.2', '0.3'), b('0.1', '0.3'))] },
    { name: 'bromide attacks', species: [{ smi: 'CC[C+](C)C' }, { smi: '[Br-]' }], arrows: [a(lp('1.0'), b('1.0', '0.2'))] }
  ],
  product: [{ smi: 'CCC(C)(C)Br' }]
};
// acid-catalyzed hydrolysis of methyl acetate
const ESTER = {
  kind: 'chain',
  steps: [
    { name: 'protonate the carbonyl', species: [{ smi: 'CC(=O)OC' }, { smi: '[H][OH2+]' }], arrows: [a(lp('0.2'), b('0.2', '1.0')), a(b('1.0', '1.1'), at('1.1'))] },
    { name: 'water attacks', species: [{ smi: 'CC(=[OH+])OC' }, { smi: 'O' }], arrows: [a(lp('1.0'), b('1.0', '0.1')), a(b('0.1', '0.2'), at('0.2'))] },
    { name: 'pass the proton off', species: [{ smi: 'CC(O)([OH+][H])OC' }, { smi: 'O' }], adds: ['O'], arrows: [a(lp('1.0'), b('1.0', '0.4')), a(b('0.3', '0.4'), at('0.3'))], drops: ['[OH3+]'] },
    { name: 'protonate the OCH3', species: [{ smi: 'CC(O)(O)OC' }, { smi: '[H][OH2+]' }], adds: ['[OH3+]'], arrows: [a(lp('0.4'), b('0.4', '1.0')), a(b('1.0', '1.1'), at('1.1'))], drops: ['O'] },
    { name: 'methanol leaves', species: [{ smi: 'CC(O)(O)[OH+]C' }], arrows: [a(lp('0.2'), b('0.2', '0.1')), a(b('0.1', '0.4'), at('0.4'))] },
    { name: 'lose the last proton', species: [{ smi: 'CC(O)=[O+][H]' }, { smi: 'CO' }, { smi: 'O' }], adds: ['O'], arrows: [a(lp('2.0'), b('2.0', '0.4')), a(b('0.3', '0.4'), at('0.3'))] }
  ],
  product: [{ smi: 'CC(=O)O' }, { smi: 'CO' }, { smi: '[OH3+]' }]
};
// base-catalyzed aldol addition of acetaldehyde
const ALDOL = {
  kind: 'chain',
  steps: [
    { name: 'make the enolate', species: [{ smi: '[OH-]' }, { smi: '[H]CC=O' }], arrows: [a(lp('0.0'), b('0.0', '1.0')), a(b('1.1', '1.0'), b('1.1', '1.2')), a(b('1.2', '1.3'), at('1.3'))], drops: ['O'] },
    { name: 'the enolate attacks a carbonyl', species: [{ smi: 'C=C[O-]' }, { smi: 'CC=O' }], adds: ['CC=O'], arrows: [a(lp('0.2'), b('0.2', '0.1')), a(b('0.0', '0.1'), b('0.0', '1.1')), a(b('1.1', '1.2'), at('1.2'))] },
    { name: 'protonate the alkoxide', species: [{ smi: 'O=CCC(C)[O-]' }, { smi: 'O[H]' }], adds: ['O'], arrows: [a(lp('0.5'), b('0.5', '1.1')), a(b('1.0', '1.1'), at('1.0'))] }
  ],
  product: [{ smi: 'CC(O)CC=O' }, { smi: '[OH-]' }]
};
// Claisen condensation of ethyl acetate (through the loss of ethoxide)
const CLAISEN = {
  kind: 'chain',
  steps: [
    { name: 'make the ester enolate', species: [{ smi: 'CC[O-]' }, { smi: '[H]CC(=O)OCC' }], arrows: [a(lp('0.2'), b('0.2', '1.0')), a(b('1.1', '1.0'), b('1.1', '1.2')), a(b('1.2', '1.3'), at('1.3'))], drops: ['CCO'] },
    { name: 'the enolate attacks a second ester', species: [{ smi: 'C=C([O-])OCC' }, { smi: 'CC(=O)OCC' }], adds: ['CC(=O)OCC'], arrows: [a(lp('0.2'), b('0.2', '0.1')), a(b('0.0', '0.1'), b('0.0', '1.1')), a(b('1.1', '1.2'), at('1.2'))] },
    { name: 'the tetrahedral intermediate collapses', species: [{ smi: 'CCOC(=O)CC(C)([O-])OCC' }], arrows: [a(lp('0.8'), b('0.8', '0.6')), a(b('0.6', '0.9'), at('0.9'))] }
  ],
  product: [{ smi: 'CCOC(=O)CC(C)=O' }, { smi: 'CC[O-]' }]
};
// acid-catalyzed hemiacetal formation from acetaldehyde and methanol
const HEMI = {
  kind: 'chain',
  steps: [
    { name: 'protonate the carbonyl', species: [{ smi: 'CC=O' }, { smi: '[H][OH2+]' }], arrows: [a(lp('0.2'), b('0.2', '1.0')), a(b('1.0', '1.1'), at('1.1'))], drops: ['O'] },
    { name: 'methanol attacks', species: [{ smi: 'CC=[OH+]' }, { smi: 'CO' }], adds: ['CO'], arrows: [a(lp('1.1'), b('1.1', '0.1')), a(b('0.1', '0.2'), at('0.2'))] },
    { name: 'methanol takes the proton', species: [{ smi: 'CC(O)[O+]([H])C' }, { smi: 'CO' }], adds: ['CO'], arrows: [a(lp('1.1'), b('1.1', '0.4')), a(b('0.3', '0.4'), at('0.3'))] }
  ],
  product: [{ smi: 'COC(C)O' }, { smi: 'C[OH2+]' }]
};
// LDA enolate, then methyl iodide
const ALKYL = {
  kind: 'chain',
  steps: [
    { name: 'LDA pulls the alpha proton', species: [{ smi: '[N-](C(C)C)C(C)C' }, { smi: 'O=C1C([H])CCCC1' }], arrows: [a(lp('0.0'), b('0.0', '1.3')), a(b('1.2', '1.3'), b('1.1', '1.2')), a(b('1.1', '1.0'), at('1.0'))] },
    { name: 'the enolate carbon attacks CH3I', species: [{ smi: '[O-]C1=CCCCC1' }, { smi: 'CI' }, { smi: 'CC(C)NC(C)C' }], adds: ['CI'], arrows: [a(lp('0.0'), b('0.0', '0.1')), a(b('0.1', '0.2'), b('0.2', '1.0')), a(b('1.0', '1.1'), at('1.1'))] }
  ],
  product: [{ smi: 'CC1CCCCC1=O' }, { smi: '[I-]' }, { smi: 'CC(C)NC(C)C' }]
};
const hide = (chain, k) => Object.assign({}, chain, { hide: k });

export default [
  /* ======================= fishhook, predict the product ======================= */
  {
    id: 'fh-01', type: 'fishhook-forward', roots: ['l2-arrows'], difficulty: 1,
    stem: 'Light hits a molecule of bromine. Follow the two fishhook arrows exactly as drawn. What do they make?',
    fig: Object.assign(mech(BR2, [f(b('0.0', '0.1'), at('0.0')), f(b('0.0', '0.1'), at('0.1'))]), { hideProduct: true }),
    choices: [
      { text: 'two bromine radicals', smiles: '[Br].[Br]' },
      { text: 'a bromide ion and a bromine cation', smiles: '[Br-].[Br+]' },
      { text: 'Br2 again, nothing breaks', smiles: 'BrBr' },
      { text: 'two molecules of HBr', smiles: 'Br.Br' },
      { text: 'a bromide ion and a bromine radical', smiles: '[Br-].[Br]' }
    ],
    correct: 0,
    coach: 'A fishhook moves one electron. Two fishhooks leaving one bond in opposite directions split it evenly: one electron to each atom.',
    why: 'Each half-headed arrow carries one electron of the Br-Br bond, one onto each bromine. That is homolysis, the even split, so each bromine walks away with seven valence electrons and no charge: two bromine radicals. The ion pair would need one full-headed arrow sending both electrons to one side.'
  },
  {
    id: 'fh-02', type: 'fishhook-forward', roots: ['l2-arrows'], difficulty: 2,
    stem: 'A dialkyl peroxide is warmed to start a radical reaction. Follow the fishhook arrows. What do they make?',
    fig: Object.assign(mech(PEROX, [f(b('0.4', '0.5'), at('0.4')), f(b('0.4', '0.5'), at('0.5'))]), { hideProduct: true }),
    choices: [
      { text: 'two tert-butoxy radicals', smiles: 'CC(C)(C)[O].CC(C)(C)[O]' },
      { text: 'two tert-butoxide anions', smiles: 'CC(C)(C)[O-].CC(C)(C)[O-]' },
      { text: 'a tert-butyl radical and a tert-butylperoxy radical', smiles: 'C[C](C)C.CC(C)(C)O[O]' },
      { text: 'two molecules of tert-butanol', smiles: 'CC(C)(C)O.CC(C)(C)O' },
      { text: 'a tert-butoxide anion and a tert-butanol', smiles: 'CC(C)(C)[O-].CC(C)(C)O' }
    ],
    correct: 0,
    coach: 'Find the bond the arrows leave from. Here it is the weak O-O bond, and one electron goes to each oxygen.',
    why: 'Both fishhooks start on the O-O bond, the weakest bond in the molecule, and send one electron to each oxygen. Each oxygen keeps one unpaired electron and no charge, so you get two tert-butoxy radicals. Breaking a C-O bond instead would need the arrows to start on a C-O bond, which they do not.'
  },
  {
    id: 'fh-03', type: 'fishhook-forward', roots: ['l2-carbocation', 'l2-arrows'], difficulty: 2,
    stem: 'A bromine radical meets isobutane. Follow the three fishhook arrows exactly as drawn. What do they make?',
    fig: Object.assign(mech(BR_ISOBUTANE, [f(e('0.0'), b('0.0', '1.2')), f(b('1.1', '1.2'), b('0.0', '1.2')), f(b('1.1', '1.2'), at('1.1'))]), { hideProduct: true }),
    choices: [
      { text: 'HBr and the tert-butyl radical', smiles: 'Br.C[C](C)C' },
      { text: 'HBr and the isobutyl radical', smiles: 'Br.[CH2]C(C)C' },
      { text: 'tert-butyl bromide and a hydrogen atom', smiles: 'CC(C)(C)Br.[H]' },
      { text: 'bromide and the tert-butyl cation', smiles: '[Br-].C[C+](C)C' },
      { text: 'HBr and isobutylene', smiles: 'Br.C=C(C)C' }
    ],
    correct: 0,
    coach: 'Three fishhooks around one hydrogen means the hydrogen is being handed over: bromine takes the H, the carbon keeps one electron.',
    why: 'The bromine single electron and one electron from the C-H bond pair up into a new H-Br bond. The other C-H electron stays on the carbon, which becomes a radical. The H came off the central carbon, so the radical is tertiary: HBr plus the tert-butyl radical. Bromine never bonds to carbon in this step.'
  },
  {
    id: 'fh-04', type: 'fishhook-forward', roots: ['l2-carbocation', 'l2-arrows'], difficulty: 2,
    stem: 'In HBr addition with peroxides, a bromine radical adds to 2-methylpropene. Follow the fishhook arrows. What do they make?',
    fig: Object.assign(mech([{ smi: '[Br]', rad: [0] }, { smi: 'C=C(C)C' }], [f(e('0.0'), b('0.0', '1.0')), f(b('1.0', '1.1'), b('0.0', '1.0')), f(b('1.0', '1.1'), at('1.1'))]), { hideProduct: true }),
    choices: [
      { text: 'tertiary radical, Br on the end carbon', smiles: 'BrC[C](C)C' },
      { text: 'primary radical, Br on the middle carbon', smiles: 'BrC(C)(C)[CH2]' },
      { text: 'a tertiary cation, Br on the end carbon', smiles: 'BrC[C+](C)C' },
      { text: '2-bromo-2-methylpropane', smiles: 'CC(C)(C)Br' },
      { text: '1-bromo-2-methylpropane', smiles: 'BrCC(C)C' }
    ],
    correct: 0,
    coach: 'One fishhook from bromine and one from the pi bond build the new C-Br bond; the other pi electron is left on the far carbon as the radical.',
    why: 'Bromine bonds to the CH2 end, and the leftover pi electron sits on the other alkene carbon, the one with two methyls. That carbon is now a tertiary radical, the most stable choice, which is exactly why peroxide HBr addition ends up anti-Markovnikov. The step makes a radical, not a finished alkyl bromide; the H arrives in the next step.'
  },
  {
    id: 'fh-05', type: 'fishhook-forward', roots: ['l2-arrows'], difficulty: 2,
    stem: 'A propagation step in radical bromination: the tert-butyl radical meets Br2. Follow the fishhook arrows. What do they make?',
    fig: Object.assign(mech(TBU_BR2, [f(e('0.1'), b('0.1', '1.0')), f(b('1.0', '1.1'), b('0.1', '1.0')), f(b('1.0', '1.1'), at('1.1'))]), { hideProduct: true }),
    choices: [
      { text: 'tert-butyl bromide and a bromine radical', smiles: 'CC(C)(C)Br.[Br]' },
      { text: 'tert-butyl bromide and a bromide ion', smiles: 'CC(C)(C)Br.[Br-]' },
      { text: 'the tert-butyl cation, a bromide ion and a bromine radical', smiles: 'C[C+](C)C.[Br-].[Br]' },
      { text: '2-methylpropene and HBr', smiles: 'C=C(C)C.Br' },
      { text: 'the radical dimer and Br2', smiles: 'CC(C)(C)C(C)(C)C.BrBr' }
    ],
    correct: 0,
    coach: 'Propagation is one radical in, one radical out. The carbon radical takes one bromine, and the other bromine leaves with one electron.',
    why: 'The carbon single electron and one Br-Br electron make the new C-Br bond. The other Br-Br electron leaves on the far bromine, which is now a radical that goes on to abstract the next hydrogen. One radical went in, one came out, so the chain keeps running.'
  },
  {
    id: 'fh-06', type: 'fishhook-forward', roots: ['l2-arrows'], difficulty: 1,
    stem: 'Two methyl radicals collide. Follow the two fishhook arrows. What do they make?',
    fig: Object.assign(mech([{ smi: '[CH3]', rad: [0] }, { smi: '[CH3]', rad: [0] }], [f(e('0.0'), b('0.0', '1.0')), f(e('1.0'), b('0.0', '1.0'))]), { hideProduct: true }),
    choices: [
      { text: 'ethane, one new C-C bond', smiles: 'CC' },
      { text: 'two methane molecules', smiles: 'C.C' },
      { text: 'ethylene', smiles: 'C=C' },
      { text: 'a methyl cation and a methyl anion', smiles: '[CH3+].[CH3-]' },
      { text: 'ethylene and hydrogen gas', smiles: 'C=C.[H][H]' }
    ],
    correct: 0,
    coach: 'Each radical sends its one electron into the space between them: one plus one makes a new two-electron bond.',
    why: 'Each fishhook brings one electron into the same new C-C bond, so two radicals become one neutral molecule, ethane. That is a termination step: two radicals in, zero out, and the chain stops.'
  },
  {
    id: 'fh-07', type: 'fishhook-forward', roots: ['l2-resonance', 'l2-arrows'], difficulty: 3,
    stem: 'The arrows below draw a second resonance form of the but-2-enyl radical. Which structure do they lead to?',
    fig: Object.assign(mech([{ smi: 'CC=C[CH2]', rad: [3] }], [f(e('0.3'), b('0.2', '0.3')), f(b('0.1', '0.2'), b('0.2', '0.3')), f(b('0.1', '0.2'), at('0.1'))]), { hideProduct: true }),
    choices: [
      { text: 'radical next to the methyl, C=C at the end', smiles: 'C[CH]C=C' },
      { text: 'radical on the end carbon, C=C at the other end', smiles: '[CH2]CC=C' },
      { text: 'a cation on the second carbon, C=C at the end', smiles: 'C[CH+]C=C' },
      { text: 'radical on a carbon of the double bond', smiles: 'C[C]=CC' },
      { text: 'an anion on the second carbon, C=C at the end', smiles: 'C[CH-]C=C' }
    ],
    correct: 0,
    coach: 'Allylic resonance with fishhooks: the lone electron and one pi electron make a new pi bond, and the other pi electron lands two carbons over.',
    why: 'The single electron pairs with one electron from the old pi bond to make a new C=C at the end. The other old pi electron is left on the carbon two over, so the radical moves from the CH2 end to the second carbon. No atoms move and nothing gets a charge, which is how you know it is resonance.'
  },
  {
    id: 'fh-08', type: 'fishhook-forward', roots: ['l2-arrows'], difficulty: 1,
    stem: 'In the chlorination of methane, a chlorine radical meets methane. Follow the fishhook arrows. What do they make?',
    fig: Object.assign(mech([{ smi: '[Cl]', rad: [0] }, { smi: 'C[H]' }], [f(e('0.0'), b('0.0', '1.1')), f(b('1.0', '1.1'), b('0.0', '1.1')), f(b('1.0', '1.1'), at('1.0'))]), { hideProduct: true }),
    choices: [
      { text: 'HCl and a methyl radical', smiles: 'Cl.[CH3]' },
      { text: 'chloromethane and a hydrogen atom', smiles: 'CCl.[H]' },
      { text: 'HCl and a methyl cation', smiles: 'Cl.[CH3+]' },
      { text: 'chloride and methane', smiles: '[Cl-].C' },
      { text: 'chloromethane', smiles: 'CCl' }
    ],
    correct: 0,
    coach: 'The arrows end on the hydrogen, not the carbon, so chlorine leaves with the H and the carbon keeps one electron.',
    why: 'Chlorine pairs its single electron with one electron from the C-H bond to make H-Cl. The carbon keeps the other electron and becomes a methyl radical, which then attacks Cl2 in the next propagation step. Chloromethane only forms in that later step.'
  },
  {
    id: 'fh-09', type: 'fishhook-forward', roots: ['l2-arrows'], difficulty: 2,
    stem: 'After a peroxide splits, a tert-butoxy radical meets HBr. Follow the fishhook arrows. What do they make?',
    fig: Object.assign(mech([{ smi: 'CC(C)(C)[O]', rad: [4] }, { smi: 'Br[H]' }], [f(e('0.4'), b('0.4', '1.1')), f(b('1.0', '1.1'), b('0.4', '1.1')), f(b('1.0', '1.1'), at('1.0'))]), { hideProduct: true }),
    choices: [
      { text: 'tert-butanol and a bromine radical', smiles: 'CC(C)(C)O.[Br]' },
      { text: 'tert-butyl hypobromite and a hydrogen atom', smiles: 'CC(C)(C)OBr.[H]' },
      { text: 'tert-butanol and a bromide ion', smiles: 'CC(C)(C)O.[Br-]' },
      { text: 'tert-butoxide and a bromine radical', smiles: 'CC(C)(C)[O-].[Br]' },
      { text: 'tert-butyl bromide and a hydroxyl radical', smiles: 'CC(C)(C)Br.[OH]' }
    ],
    correct: 0,
    coach: 'Oxygen takes the hydrogen; the bromine keeps one electron. That is how the peroxide hands the chain its first bromine radical.',
    why: 'The oxygen single electron and one H-Br electron form the new O-H bond, giving neutral tert-butanol. The other H-Br electron stays on bromine, so a bromine radical is born. That bromine radical is what adds to the alkene and makes peroxide HBr addition anti-Markovnikov.'
  },

  /* ======================= fishhook, predict the arrows ======================= */
  {
    id: 'fh-10', type: 'fishhook-reverse', roots: ['l2-arrows'], difficulty: 1,
    stem: 'Light turns Br2 into two bromine radicals. Which set of arrows shows this step correctly?',
    fig: { kind: 'mech', species: BR2, product: [{ smi: '[Br]', rad: [0] }, { smi: '[Br]', rad: [0] }] },
    choices: [
      { fig: mech(BR2, [f(b('0.0', '0.1'), at('0.0')), f(b('0.0', '0.1'), at('0.1'))]) },
      { fig: mech(BR2, [a(b('0.0', '0.1'), at('0.0'))]) },
      { fig: mech(BR2, [f(b('0.0', '0.1'), at('0.0')), f(b('0.0', '0.1'), at('0.0'))]) },
      { fig: mech(BR2, [f(b('0.0', '0.1'), at('0.0'))]) },
      { fig: mech(BR2, [a(b('0.0', '0.1'), at('0.1'))]) }
    ],
    correct: 0,
    coach: 'Two radicals out means the bond split evenly: two half-headed arrows, one to each atom.',
    why: 'Homolysis gives each atom one electron, so it takes two fishhooks leaving the same bond in opposite directions. A single full-headed arrow sends both electrons to one bromine and makes ions. Two fishhooks to the same bromine also make ions, and one fishhook alone leaves half a bond unpaired.'
  },
  {
    id: 'fh-11', type: 'fishhook-reverse', roots: ['l2-carbocation', 'l2-arrows'], difficulty: 2,
    stem: 'A bromine radical takes the tertiary hydrogen from isobutane, giving HBr and the tert-butyl radical. Which arrows show this?',
    fig: { kind: 'mech', species: BR_ISOBUTANE, product: [{ smi: 'Br' }, { smi: 'C[C](C)C', rad: [1] }] },
    choices: [
      { fig: mech(BR_ISOBUTANE, [f(e('0.0'), b('0.0', '1.2')), f(b('1.1', '1.2'), b('0.0', '1.2')), f(b('1.1', '1.2'), at('1.1'))]) },
      { fig: mech(BR_ISOBUTANE, [a(e('0.0'), b('0.0', '1.2')), a(b('1.1', '1.2'), at('1.1'))]) },
      { fig: mech(BR_ISOBUTANE, [f(e('0.0'), b('0.0', '1.1')), f(b('1.1', '1.2'), b('0.0', '1.1')), f(b('1.1', '1.2'), at('1.2'))]) },
      { fig: mech(BR_ISOBUTANE, [f(e('0.0'), b('0.0', '1.2')), f(b('1.1', '1.2'), b('0.0', '1.2'))]) },
      { fig: mech(BR_ISOBUTANE, [f(b('1.1', '1.2'), at('1.1')), f(b('1.1', '1.2'), at('1.2'))]) }
    ],
    correct: 0,
    coach: 'Three fishhooks around the H: one from bromine and one from the C-H bond meet in the new H-Br bond, the last C-H electron stays on carbon.',
    why: 'Hydrogen abstraction takes three fishhooks: bromine sends its electron toward the H, one C-H electron joins it to finish the H-Br bond, and the other C-H electron stays on carbon as the radical. Full-headed arrows cannot start from a single electron. Aiming bromine at the carbon makes a C-Br bond instead, and only two fishhooks leave half a bond unpaired.'
  },
  {
    id: 'fh-12', type: 'fishhook-reverse', roots: ['l2-carbocation', 'l2-arrows'], difficulty: 2,
    stem: 'A bromine radical adds to propene to give the more stable carbon radical shown. Which arrows show this step?',
    fig: { kind: 'mech', species: BR_PROPENE, product: [{ smi: 'BrC[CH]C', rad: [2] }] },
    choices: [
      { fig: mech(BR_PROPENE, [f(e('0.0'), b('0.0', '1.1')), f(b('1.0', '1.1'), b('0.0', '1.1')), f(b('1.0', '1.1'), at('1.0'))]) },
      { fig: mech(BR_PROPENE, [f(e('0.0'), b('0.0', '1.0')), f(b('1.0', '1.1'), b('0.0', '1.0')), f(b('1.0', '1.1'), at('1.1'))]) },
      { fig: mech(BR_PROPENE, [a(e('0.0'), b('0.0', '1.0')), a(b('1.0', '1.1'), at('1.1'))]) },
      { fig: mech(BR_PROPENE, [f(e('0.0'), b('0.0', '1.0')), f(b('1.0', '1.1'), b('0.0', '1.0'))]) },
      { fig: mech(BR_PROPENE, [f(b('1.0', '1.1'), at('1.0')), f(b('1.0', '1.1'), at('1.1'))]) }
    ],
    correct: 1,
    coach: 'Bromine bonds to the CH2 end so the leftover electron lands on the middle carbon, the secondary radical.',
    why: 'One fishhook from bromine and one from the pi bond build the C-Br bond on the terminal carbon; the other pi electron stays on the middle carbon, a secondary radical. Adding bromine to the middle carbon would leave a primary radical on the end, which is less stable and is not the product shown.'
  },
  {
    id: 'fh-13', type: 'fishhook-reverse', roots: ['l2-arrows'], difficulty: 2,
    stem: 'The tert-butyl radical reacts with Br2 to give tert-butyl bromide and a bromine radical. Which arrows show this step?',
    fig: { kind: 'mech', species: TBU_BR2, product: [{ smi: 'CC(C)(C)Br' }, { smi: '[Br]', rad: [0] }] },
    choices: [
      { fig: mech(TBU_BR2, [f(e('0.1'), b('0.1', '1.0')), f(b('1.0', '1.1'), b('0.1', '1.0')), f(b('1.0', '1.1'), at('1.1'))]) },
      { fig: mech(TBU_BR2, [a(b('1.0', '1.1'), at('1.1')), a(e('0.1'), b('0.1', '1.0'))]) },
      { fig: mech(TBU_BR2, [f(e('0.1'), b('0.1', '1.0')), f(b('1.0', '1.1'), b('0.1', '1.0')), f(b('1.0', '1.1'), at('1.0'))]) },
      { fig: mech(TBU_BR2, [f(e('0.1'), b('0.1', '1.0')), f(b('1.0', '1.1'), at('1.1'))]) },
      { fig: mech(TBU_BR2, [f(b('1.0', '1.1'), at('1.0')), f(b('1.0', '1.1'), at('1.1'))]) }
    ],
    correct: 0,
    coach: 'The new C-Br bond needs one electron from carbon and one from Br-Br; the second Br-Br electron rides off on the far bromine.',
    why: 'Three fishhooks: the carbon electron and one Br-Br electron meet in the new C-Br bond, and the other Br-Br electron goes to the far bromine, making the new bromine radical. Sending that last electron to the near bromine instead overloads it. Two fishhooks leave a half bond, and simply splitting Br2 leaves the carbon radical untouched.'
  },
  {
    id: 'fh-14', type: 'fishhook-reverse', roots: ['l2-arrows'], difficulty: 1,
    stem: 'Termination: the tert-butyl radical and a bromine radical combine into tert-butyl bromide. Which arrows show it?',
    fig: { kind: 'mech', species: TBU_BR, product: [{ smi: 'CC(C)(C)Br' }] },
    choices: [
      { fig: mech(TBU_BR, [f(e('0.1'), b('0.1', '1.0')), f(e('1.0'), b('0.1', '1.0'))]) },
      { fig: mech(TBU_BR, [f(e('0.1'), b('0.1', '1.0'))]) },
      { fig: mech(TBU_BR, [f(e('1.0'), at('0.1'))]) },
      { fig: mech(TBU_BR, [f(b('0.0', '0.1'), at('0.0')), f(b('0.0', '0.1'), at('0.1'))]) },
      { fig: mech(TBU_BR, [a(e('0.1'), b('0.1', '1.0'))]) }
    ],
    correct: 0,
    coach: 'Two lone electrons make one new bond: each radical sends its electron into the space between the atoms.',
    why: 'A new two-electron bond from two radicals needs one fishhook from each, both ending in the new C-Br bond. One fishhook alone builds half a bond. Moving bromine electron onto the carbon makes a carbanion and a bromine cation, and splitting a C-C bond makes more radicals instead of pairing the two you have.'
  },
  {
    id: 'fh-15', type: 'fishhook-reverse', roots: ['l2-arrows'], difficulty: 2,
    stem: 'Heat splits di-tert-butyl peroxide into two tert-butoxy radicals. Which arrows show this initiation step?',
    fig: { kind: 'mech', species: PEROX, product: [{ smi: 'CC(C)(C)[O]', rad: [4] }, { smi: 'CC(C)(C)[O]', rad: [4] }] },
    choices: [
      { fig: mech(PEROX, [f(b('0.1', '0.4'), at('0.1')), f(b('0.1', '0.4'), at('0.4'))]) },
      { fig: mech(PEROX, [f(b('0.4', '0.5'), at('0.4')), f(b('0.4', '0.5'), at('0.5'))]) },
      { fig: mech(PEROX, [a(b('0.4', '0.5'), at('0.4'))]) },
      { fig: mech(PEROX, [f(b('0.4', '0.5'), at('0.5')), f(b('0.4', '0.5'), at('0.5'))]) },
      { fig: mech(PEROX, [f(b('0.4', '0.5'), at('0.4'))]) }
    ],
    correct: 1,
    coach: 'Peroxides break at the weak O-O bond, evenly: two fishhooks, one to each oxygen.',
    why: 'The O-O bond is the weakest bond in a peroxide, and two identical radicals out means an even split, so two fishhooks leave the O-O bond, one toward each oxygen. Splitting a C-O bond gives a carbon radical and a peroxy radical instead. One full-headed arrow, or both fishhooks to one oxygen, makes ions.'
  },
  {
    id: 'fh-16', type: 'fishhook-reverse', roots: ['l2-resonance', 'l2-arrows'], difficulty: 3,
    stem: 'The two structures are resonance forms of one allylic radical. Which arrows convert the first into the second?',
    fig: { kind: 'mech', species: PRENYL, product: [{ smi: 'C[C](C)C=C', rad: [1] }] },
    choices: [
      { fig: mech(PRENYL, [a(e('0.4'), b('0.3', '0.4')), a(b('0.1', '0.3'), at('0.1'))]) },
      { fig: mech(PRENYL, [f(e('0.4'), b('0.3', '0.4')), f(b('0.1', '0.3'), b('0.3', '0.4'))]) },
      { fig: mech(PRENYL, [f(e('0.4'), b('0.3', '0.4')), f(b('0.1', '0.3'), b('0.3', '0.4')), f(b('0.1', '0.3'), at('0.1'))]) },
      { fig: mech(PRENYL, [f(e('0.4'), b('0.3', '0.4')), f(b('0.1', '0.3'), b('0.3', '0.4')), f(b('0.1', '0.3'), at('0.3'))]) },
      { fig: mech(PRENYL, [f(b('0.1', '0.2'), at('0.1')), f(b('0.1', '0.2'), at('0.2'))]) }
    ],
    correct: 2,
    coach: 'Allylic radical resonance takes three fishhooks: the lone electron and one pi electron form the new pi bond, the other pi electron moves two carbons over.',
    why: 'Three fishhooks: the single electron on the CH2 and one electron from the C=C make a new pi bond at the end, and the other pi electron lands on the carbon carrying two methyls, now a tertiary radical. Full-headed arrows cannot start from a single electron, two fishhooks leave a half bond, and sending the last electron to the middle carbon gives it nine electrons. Breaking off a methyl is a different reaction, not resonance.'
  },
  {
    id: 'fh-17', type: 'fishhook-reverse', roots: ['l2-resonance', 'l2-arrows'], difficulty: 3,
    stem: 'Under NBS conditions a bromine radical removes an allylic hydrogen from but-1-ene. Which arrows give HBr and the allylic radical shown?',
    fig: { kind: 'mech', species: BR_BUTENE, product: [{ smi: 'Br' }, { smi: 'C=C[CH]C', rad: [2] }] },
    choices: [
      { fig: mech(BR_BUTENE, [f(e('0.0'), b('0.0', '1.0')), f(b('1.0', '1.1'), b('0.0', '1.0')), f(b('1.0', '1.1'), at('1.1'))]) },
      { fig: mech(BR_BUTENE, [f(b('1.2', '1.3'), at('1.2')), f(b('1.2', '1.3'), at('1.3'))]) },
      { fig: mech(BR_BUTENE, [f(e('0.0'), b('0.0', '1.3')), f(b('1.2', '1.3'), b('0.0', '1.3')), f(b('1.2', '1.3'), at('1.3'))]) },
      { fig: mech(BR_BUTENE, [f(e('0.0'), b('0.0', '1.3')), f(b('1.2', '1.3'), b('0.0', '1.3')), f(b('1.2', '1.3'), at('1.2'))]) },
      { fig: mech(BR_BUTENE, [a(e('0.0'), b('0.0', '1.3')), a(b('1.2', '1.3'), at('1.2'))]) }
    ],
    correct: 3,
    coach: 'Abstraction, not addition: all three fishhooks gather at the allylic C-H, and the carbon keeps the last electron.',
    why: 'Bromine sends one electron toward the allylic hydrogen, one C-H electron joins it to make H-Br, and the other C-H electron stays on the allylic carbon, the radical shown. Arrows into the pi bond describe addition, which gives a bromoalkyl radical instead. Leaving the last electron on the hydrogen gives hydrogen three electrons, and full-headed arrows cannot start from a single electron.'
  },

  /* ======================= fishhook, concepts ======================= */
  {
    id: 'fh-18', type: 'fishhook-concept', roots: ['l2-arrows'], difficulty: 1,
    stem: 'In a radical chain, a bromine radical takes a hydrogen from methane to give HBr and a methyl radical. What kind of step is this?',
    choices: [
      { text: 'Propagation: one radical in, one radical out' },
      { text: 'Initiation: radicals made from a neutral molecule' },
      { text: 'Termination: two radicals pair up and the chain stops' },
      { text: 'Heterolysis: both electrons of a bond go to bromine' },
      { text: 'Rearrangement: the radical shifts to a better carbon' }
    ],
    correct: 0,
    coach: 'Count radicals on each side. One in and one out keeps the chain running, which is propagation.',
    why: 'The left side has one radical, the bromine, and the right side has one radical, the methyl. Radical count unchanged means propagation. Initiation starts with zero radicals and makes two; termination starts with two and ends with zero.'
  },
  {
    id: 'fh-19', type: 'fishhook-concept', roots: ['l2-carbocation', 'l2-resonance'], difficulty: 2,
    stem: 'Which of these carbon radicals is the most stable?',
    choices: [
      { text: 'methyl', smiles: '[CH3]' },
      { text: 'vinyl', smiles: 'C=[CH]' },
      { text: '2-propyl', smiles: 'C[CH]C' },
      { text: 'tert-butyl', smiles: 'C[C](C)C' },
      { text: 'allyl', smiles: 'C=C[CH2]' }
    ],
    correct: 4,
    coach: 'Radicals rank like carbocations, and resonance beats neighbors: allylic and benzylic first, then tertiary, secondary, primary, methyl, and vinylic last.',
    why: 'Like a carbocation, a radical is electron poor and loves help. Alkyl neighbors help a little, which is why tertiary beats secondary, but resonance spreads the odd electron over two carbons, and that beats any number of neighbors. The allyl radical wins. The vinyl radical, sitting on a double-bond carbon, is the least stable.'
  },
  {
    id: 'fh-20', type: 'fishhook-concept', roots: ['l2-carbocation'], difficulty: 3,
    stem: 'Radical bromination of 2-methylbutane is far more selective for the tertiary hydrogen than radical chlorination is. What explains this?',
    choices: [
      { text: 'Bromine abstraction is uphill, so its transition state looks like the radical it makes' },
      { text: 'Bromine radicals are more reactive than chlorine radicals' },
      { text: 'Bromine is larger, so it only fits next to a tertiary carbon' },
      { text: 'The C-Br bond is stronger than the C-Cl bond' },
      { text: 'Chlorine radicals rearrange to the most substituted carbon before they abstract a hydrogen, and bromine radicals do not' }
    ],
    correct: 0,
    coach: 'Hammond: an uphill step has a late transition state that resembles the product, so radical stability shows up in the rate.',
    why: 'Hydrogen abstraction by bromine is endothermic, so its transition state comes late and looks like the carbon radical being formed. The more stable tertiary radical then means a noticeably lower hill, and bromine strongly prefers that hydrogen. Chlorine abstraction is downhill with an early transition state that barely feels the difference. Bromine is the less reactive radical, which is exactly why it is choosy.'
  },
  {
    id: 'fh-21', type: 'fishhook-concept', roots: ['l2-carbocation'], difficulty: 2,
    stem: 'Propene is treated with HBr in the presence of a peroxide and heat. What is the major product?',
    sub: 'C=CC', reagent: 'HBr, ROOR, heat',
    choices: [
      { text: '1-bromopropane', smiles: 'BrCCC' },
      { text: '2-bromopropane', smiles: 'CC(C)Br' },
      { text: '1,2-dibromopropane', smiles: 'BrCC(C)Br' },
      { text: '1-propanol', smiles: 'OCCC' },
      { text: '1-bromopropene', smiles: 'CC=CBr' }
    ],
    correct: 0,
    coach: 'With peroxide the attacker is a bromine radical, and it adds to the end carbon so the radical left over is the more stable secondary one.',
    why: 'The peroxide starts a radical chain, so the first thing to hit the alkene is a bromine radical, not a proton. Bromine adds to the CH2 end, leaving the more stable secondary radical in the middle, which then takes an H from HBr. Bromine ends up on carbon 1: anti-Markovnikov. Without peroxide the ionic path puts bromine on carbon 2.'
  },
  {
    id: 'fh-22', type: 'fishhook-concept', roots: ['l2-resonance'], difficulty: 2,
    stem: 'Cyclohexene is treated with NBS and light. What is the major product?',
    sub: 'C1=CCCCC1', reagent: 'NBS, light, CCl4',
    choices: [
      { text: 'trans-1,2-dibromocyclohexane', smiles: 'BrC1CCCCC1Br' },
      { text: '4-bromocyclohexene', smiles: 'BrC1CC=CCC1' },
      { text: '3-bromocyclohexene', smiles: 'BrC1C=CCCC1' },
      { text: 'bromocyclohexane', smiles: 'BrC1CCCCC1' },
      { text: '1-bromocyclohexene', smiles: 'BrC1=CCCCC1' }
    ],
    correct: 2,
    coach: 'NBS keeps Br2 very low, so the radical path wins: abstract the allylic H, then bromine lands on that allylic carbon.',
    why: 'NBS feeds in only a trace of Br2, so addition across the double bond barely happens. A bromine radical removes an allylic hydrogen, the one next to the double bond, because that radical is resonance-stabilized. The allylic radical takes Br from Br2, giving 3-bromocyclohexene with the double bond kept. Symmetry makes both resonance ends give the same product here.'
  },

  /* ======================= combined mechanisms ======================= */
  {
    id: 'ch-01', type: 'chain', roots: ['l2-carbocation', 'l2-arrows'], difficulty: 1,
    stem: 'The mechanism shows acid-catalyzed hydration of 2-methylpropene. Which carbon species is present after step 1?',
    fig: HYDRATION, verify: { stateAfter: 1, distinct: true },
    choices: [
      { text: 'the tert-butyl cation', smiles: 'C[C+](C)C' },
      { text: 'the isobutyl cation', smiles: '[CH2+]C(C)C' },
      { text: 'protonated tert-butanol', smiles: 'CC(C)(C)[OH2+]' },
      { text: 'the tert-butyl anion', smiles: 'C[C-](C)C' },
      { text: '2-methylpropene, unchanged', smiles: 'C=C(C)C' }
    ],
    correct: 0,
    coach: 'Rich attacks poor: the pi bond grabs the proton and puts it on the CH2 end, leaving the plus on the carbon with the most neighbors.',
    why: 'In step 1 the pi electrons reach out and grab a proton from hydronium, landing it on the CH2 carbon. That leaves the other alkene carbon with only three bonds and a positive charge, the tertiary cation. Water only arrives in step 2, so the protonated alcohol is not here yet.'
  },
  {
    id: 'ch-02', type: 'chain', roots: ['l2-carbocation', 'l2-arrows'], difficulty: 2,
    stem: 'Step 1 of this acid-catalyzed hydration is hidden. Which move fills it in?',
    fig: hide(HYDRATION, 0),
    choices: [
      { text: 'The pi bond takes a proton from hydronium onto the CH2 carbon' },
      { text: 'The pi bond takes a proton from hydronium onto the carbon that holds the two methyls' },
      { text: 'Water attacks the alkene carbon directly' },
      { text: 'A hydride shifts to make the cation tertiary' },
      { text: 'Hydroxide adds to the alkene' }
    ],
    correct: 0,
    coach: 'Read step 2 backward: it starts with a tertiary cation, so step 1 must have put the proton on the CH2 end.',
    why: 'Step 2 begins with the tertiary cation, so step 1 must make it. The pi bond picks up a proton from hydronium on the CH2 carbon, leaving the plus on the carbon with two methyls. Protonating the other carbon would give a primary cation, and no shift appears in the steps that follow.'
  },
  {
    id: 'ch-03', type: 'chain', roots: ['l2-carbocation'], difficulty: 2,
    stem: 'The mechanism shows E1 dehydration of tert-butanol in acid. Which step is rate-determining?',
    fig: E1,
    choices: [
      { text: 'Protonation of the OH group' },
      { text: 'Loss of water to make the carbocation' },
      { text: 'Removal of a beta hydrogen by water' },
      { text: 'Attack of a second water molecule on the carbocation carbon' },
      { text: 'All three steps are equally slow' }
    ],
    correct: 1,
    coach: 'In E1 and SN1 the slow step is always the one that makes the carbocation.',
    why: 'Proton transfers between oxygens are fast. The hard step is breaking the C-O bond so water leaves on its own, creating a charged, electron-poor carbocation. That is the biggest hill, so step 2 sets the rate. Once the cation exists, losing a beta proton is quick.'
  },
  {
    id: 'ch-04', type: 'chain', roots: ['l2-carbocation', 'l2-arrows'], difficulty: 2,
    stem: 'Step 2 of this E1 dehydration is hidden. Which move belongs there?',
    fig: hide(E1, 1),
    choices: [
      { text: 'The C-O bond breaks and water leaves with both electrons' },
      { text: 'A water lone pair attacks the carbocation' },
      { text: 'A beta C-H bond swings into a new pi bond' },
      { text: 'The C-O bond breaks evenly, with one electron going to each atom' },
      { text: 'Oxygen grabs a proton from hydronium' }
    ],
    correct: 0,
    coach: 'Step 1 made a good leaving group and step 3 starts from a cation, so step 2 is the leaving group walking away with the bond electrons.',
    why: 'After step 1 the oxygen carries a plus and wants to leave as neutral water. Step 3 already begins with the tertiary cation, so step 2 is the heterolysis: one full-headed arrow from the C-O bond onto oxygen. An even split would make radicals, and nothing in this mechanism is a radical.'
  },
  {
    id: 'ch-06', type: 'chain', roots: ['l2-carbocation', 'l2-arrows'], difficulty: 1,
    stem: 'In this SN1 hydrolysis, which species is made in step 2?',
    fig: SN1, verify: { stateAfter: 2, distinct: true },
    choices: [
      { text: 'protonated tert-butanol', smiles: 'CC(C)(C)[OH2+]' },
      { text: 'tert-butanol, the neutral alcohol', smiles: 'CC(C)(C)O' },
      { text: 'the tert-butyl cation', smiles: 'C[C+](C)C' },
      { text: 'tert-butoxide', smiles: 'CC(C)(C)[O-]' },
      { text: '2-methylpropene', smiles: 'C=C(C)C' }
    ],
    correct: 0,
    coach: 'A neutral water attacking a cation does not lose its proton yet: the oxygen keeps three bonds and the plus.',
    why: 'In step 2 a lone pair on neutral water bonds to the cation. The oxygen now has three bonds and a positive charge, which is protonated tert-butanol. The proton only comes off in step 3, when a second water takes it.'
  },
  {
    id: 'ch-07', type: 'chain', roots: ['l2-carbocation', 'l2-arrows'], difficulty: 2,
    stem: 'HBr adds to 3-methylbut-1-ene. Which carbocation is present after step 2?',
    fig: SHIFT, verify: { stateAfter: 2, distinct: true },
    choices: [
      { text: 'the tertiary 2-methylbutan-2-yl cation', smiles: 'CC[C+](C)C' },
      { text: 'the secondary 3-methylbutan-2-yl cation', smiles: 'C[CH+]C(C)C' },
      { text: 'a primary cation at the end of the chain', smiles: '[CH2+]CC(C)C' },
      { text: '2-bromo-2-methylbutane', smiles: 'CCC(C)(C)Br' },
      { text: '2-methylbut-2-ene', smiles: 'CC=C(C)C' }
    ],
    correct: 0,
    coach: 'A secondary cation next to a carbon with an H and more neighbors will slide that hydride over to become tertiary.',
    why: 'Step 1 makes the secondary cation. In step 2 the hydrogen on the neighboring carbon moves over with its bonding electrons, a 1,2-hydride shift, so the plus jumps to the carbon carrying two methyls and becomes tertiary. Bromide has not attacked yet; that is step 3.'
  },
  {
    id: 'ch-08', type: 'chain', roots: ['l2-carbocation', 'l2-arrows'], difficulty: 3,
    stem: 'Step 2 of this HBr addition is hidden. Step 3 begins with a tertiary cation. What happened in step 2?',
    fig: hide(SHIFT, 1),
    choices: [
      { text: 'A hydride slid from the neighboring carbon to the cation carbon' },
      { text: 'A methyl group slid from the neighboring carbon to the cation carbon' },
      { text: 'Bromide attacked the secondary cation' },
      { text: 'A proton left to re-form the alkene' },
      { text: 'The cation picked up a second proton' }
    ],
    correct: 0,
    coach: 'Compare before and after: same carbon skeleton, plus moved one carbon over, so a hydride shifted.',
    why: 'The skeleton in step 3 matches the starting chain, and the charge moved from the secondary carbon to its neighbor, which now has three carbon neighbors. A hydride shift does that. A methyl shift here would only trade one secondary cation for an identical secondary cation, so it cannot explain the tertiary cation in step 3.'
  },
  {
    id: 'ch-09', type: 'chain', roots: ['l2-arrows', 'l2-bully'], difficulty: 2,
    stem: 'The mechanism shows acid-catalyzed hydrolysis of methyl acetate. Which species does step 2 make?',
    fig: ESTER, verify: { stateAfter: 2, distinct: true },
    choices: [
      { text: 'the protonated tetrahedral adduct', smiles: 'CC(O)([OH2+])OC' },
      { text: 'the protonated ester', smiles: 'CC(=[OH+])OC' },
      { text: 'the neutral tetrahedral intermediate', smiles: 'CC(O)(O)OC' },
      { text: 'acetic acid', smiles: 'CC(=O)O' },
      { text: 'protonated acetic acid', smiles: 'CC(O)=[OH+]' }
    ],
    correct: 0,
    coach: 'Water attacks the carbonyl carbon and the pi bond swings up onto oxygen, so the carbon goes tetrahedral and the new oxygen still holds the plus.',
    why: 'Step 1 protonated the carbonyl, making the carbon even more electron poor. In step 2 neutral water attacks that carbon and the pi electrons go up to the oxygen, giving a tetrahedral carbon. The oxygen that came from water now has three bonds and the plus. The neutral tetrahedral intermediate only appears in step 3, after a proton is passed off.'
  },
  {
    id: 'ch-10', type: 'chain', roots: ['l2-arrows'], difficulty: 2,
    stem: 'In step 5 of this acid-catalyzed ester hydrolysis, what leaves the tetrahedral carbon?',
    fig: ESTER,
    choices: [
      { text: 'methanol' },
      { text: 'water' },
      { text: 'methoxide anion' },
      { text: 'hydroxide anion' },
      { text: 'acetic acid' }
    ],
    correct: 0,
    coach: 'In acid, nothing leaves as an anion: the OCH3 gets protonated first and leaves as neutral methanol.',
    why: 'Step 4 put a proton on the OCH3 oxygen, turning a poor leaving group into a good one. In step 5 the C-O bond breaks onto that oxygen, and it walks away as neutral methanol. Methoxide is the leaving group in base-promoted hydrolysis, not under acid.'
  },
  {
    id: 'ch-11', type: 'chain', roots: ['l2-acidity', 'l2-resonance'], difficulty: 1,
    stem: 'The mechanism shows a base-catalyzed aldol addition of acetaldehyde. Which species does step 1 make from acetaldehyde?',
    fig: ALDOL, verify: { stateAfter: 1, distinct: true },
    choices: [
      { text: 'the enolate ion', smiles: 'C=C[O-]' },
      { text: 'the enol', smiles: 'C=CO' },
      { text: 'the hydrate anion, hydroxide added to the carbonyl', smiles: 'CC([O-])O' },
      { text: 'the acyl anion, the aldehyde H removed', smiles: 'C[C-]=O' },
      { text: 'ethoxide', smiles: 'CC[O-]' }
    ],
    correct: 0,
    coach: 'Hydroxide takes an alpha hydrogen, and the electrons slide into the pi system until the minus sits on oxygen: an enolate.',
    why: 'Hydroxide pulls a proton off the alpha carbon, the one next to the carbonyl, because the anion left over is shared with oxygen by resonance. The arrows push that pair into a C=C and the C=O pair up onto oxygen, giving the enolate. The aldehyde H is not acidic, and the neutral enol would need a proton put back on oxygen.'
  },
  {
    id: 'ch-12', type: 'chain', roots: ['l2-arrows', 'l2-bully'], difficulty: 2,
    stem: 'In this aldol addition, which species is present after step 2?',
    fig: ALDOL, verify: { stateAfter: 2, distinct: true },
    choices: [
      { text: 'the aldol alkoxide', smiles: 'O=CCC(C)[O-]' },
      { text: '3-hydroxybutanal', smiles: 'CC(O)CC=O' },
      { text: 'an enol ether from oxygen attack', smiles: 'CC([O-])OC=C' },
      { text: 'but-2-enal', smiles: 'C/C=C/C=O' },
      { text: 'the enolate, unchanged', smiles: 'C=C[O-]' }
    ],
    correct: 0,
    coach: 'The enolate attacks through its alpha carbon, and the second carbonyl pi bond goes up onto its oxygen, so you get an alkoxide.',
    why: 'In step 2 the enolate alpha carbon bonds to the carbonyl carbon of a second acetaldehyde, and that carbonyl oxygen picks up the pi electrons as a negative charge. The new C-C bond is made, but the oxygen is still an alkoxide. It becomes the OH of 3-hydroxybutanal only in step 3, when water donates a proton.'
  },
  {
    id: 'ch-13', type: 'chain', roots: ['l2-arrows', 'l2-resonance'], difficulty: 2,
    stem: 'In step 2 of this aldol addition the enolate forms a new bond. Which atom of the enolate forms it?',
    fig: ALDOL,
    choices: [
      { text: 'the alpha carbon of the enolate' },
      { text: 'the oxygen carrying the negative charge' },
      { text: 'the carbon bonded to oxygen' },
      { text: 'a hydrogen on the alpha carbon' },
      { text: 'the aldehyde hydrogen' }
    ],
    correct: 0,
    coach: 'Follow the arrow tail: it starts on the C=C pi bond and ends at the carbonyl carbon, so the alpha carbon is the attacker.',
    why: 'The oxygen lone pair pushes down into the C-O bond, and the C=C pi electrons swing out from the alpha carbon to the electron-poor carbonyl carbon. That is why aldol reactions make carbon-carbon bonds. The minus may be drawn on oxygen, but the alpha carbon does the attacking.'
  },
  {
    id: 'ch-14', type: 'chain', roots: ['l2-arrows'], difficulty: 2,
    stem: 'In step 3 of this Claisen condensation, what leaves the tetrahedral carbon?',
    fig: CLAISEN,
    choices: [
      { text: 'ethoxide' },
      { text: 'hydroxide' },
      { text: 'the ester enolate' },
      { text: 'a methyl anion' },
      { text: 'acetate' }
    ],
    correct: 0,
    coach: 'The oxygen minus pushes back down to re-form C=O, and the best group on that carbon leaves: the OEt, as ethoxide.',
    why: 'The tetrahedral carbon holds O-, CH3, the new CH2 and OEt. When the oxygen pushes back down to re-form the C=O, one group must leave, and ethoxide is by far the best leaving group there. A methyl anion is far too unstable to leave, and there is no OH on that carbon.'
  },
  {
    id: 'ch-15', type: 'chain', roots: ['l2-arrows', 'l2-bully'], difficulty: 3,
    stem: 'In this Claisen condensation, which species is present after step 2?',
    fig: CLAISEN, verify: { stateAfter: 2, distinct: true },
    choices: [
      { text: 'the tetrahedral alkoxide', smiles: 'CCOC(=O)CC(C)([O-])OCC' },
      { text: 'ethyl acetoacetate', smiles: 'CCOC(=O)CC(C)=O' },
      { text: 'the ester enolate', smiles: 'C=C([O-])OCC' },
      { text: 'diethyl methylmalonate', smiles: 'CCOC(=O)C(C)C(=O)OCC' },
      { text: 'a neutral tetrahedral carbon with OH', smiles: 'CCOC(=O)CC(C)(O)OCC' }
    ],
    correct: 0,
    coach: 'Step 2 is only the attack: the enolate carbon bonds to the ester carbon, the C=O opens onto oxygen, and nothing has left yet.',
    why: 'The enolate alpha carbon attacks the carbonyl carbon of a second ethyl acetate, and that carbonyl oxygen takes the pi electrons as a minus. The carbon is now tetrahedral and still holds its OEt. Ethoxide leaves in step 3, which is when the beta-keto ester forms.'
  },
  {
    id: 'ch-16', type: 'chain', roots: ['l2-arrows'], difficulty: 2,
    stem: 'Acetaldehyde reacts with methanol under acid catalysis. What do these three steps make?',
    fig: Object.assign({}, HEMI, { showProduct: false }), verify: { stateAfter: 3, distinct: true },
    choices: [
      { text: 'the hemiacetal', smiles: 'COC(C)O' },
      { text: 'the acetal', smiles: 'COC(C)OC' },
      { text: 'the hydrate', smiles: 'CC(O)O' },
      { text: 'methyl acetate', smiles: 'COC(C)=O' },
      { text: 'methyl vinyl ether', smiles: 'C=COC' }
    ],
    correct: 0,
    coach: 'One alcohol added means one OR and one OH on the same carbon: a hemiacetal. The acetal needs a second alcohol and the loss of water.',
    why: 'The carbonyl is protonated, methanol attacks, and a proton is passed off, leaving one OCH3 and one OH on the former carbonyl carbon. That is a hemiacetal. Getting to the acetal takes four more steps: protonate the OH, lose water, add a second methanol, and remove the last proton.'
  },
  {
    id: 'ch-17', type: 'chain', roots: ['l2-acidity', 'l2-arrows'], difficulty: 2,
    stem: 'Cyclohexanone is treated with LDA, then with methyl iodide. What is the product?',
    fig: Object.assign({}, ALKYL, { showProduct: false }), verify: { stateAfter: 2, distinct: true },
    choices: [
      { text: '2-methylcyclohexanone', smiles: 'CC1CCCCC1=O' },
      { text: '1-methoxycyclohexene', smiles: 'COC1=CCCCC1' },
      { text: '1-methylcyclohexanol', smiles: 'CC1(O)CCCCC1' },
      { text: '2,6-dimethylcyclohexanone', smiles: 'CC1CCCC(C)C1=O' },
      { text: 'cyclohexanone, unchanged', smiles: 'O=C1CCCCC1' }
    ],
    correct: 0,
    coach: 'LDA makes the enolate; the enolate carbon is the nucleophile, and it does SN2 on methyl iodide.',
    why: 'LDA removes an alpha hydrogen completely, making the enolate. Its alpha carbon attacks the methyl carbon of CH3I in an SN2 step, kicking out iodide, and the oxygen lone pair re-forms the C=O. One methyl ends up on the alpha carbon: 2-methylcyclohexanone. A Grignard would add to the carbonyl, but an enolate does not.'
  },
  {
    id: 'ch-18', type: 'chain', roots: ['l2-acidity'], difficulty: 2,
    stem: 'Why is LDA used in step 1 of this alkylation instead of hydroxide?',
    fig: ALKYL,
    choices: [
      { text: 'It is strong and bulky, so it turns all the ketone into enolate without adding to the carbonyl' },
      { text: 'It is a good nucleophile that adds to the carbonyl first' },
      { text: 'It protonates the carbonyl oxygen to activate it' },
      { text: 'It is a weak base, so only a little enolate forms at a time and aldol is favored' },
      { text: 'It removes the alpha hydrogen on the more substituted side of an unsymmetrical ketone, so the methyl always lands on the more crowded carbon' }
    ],
    correct: 0,
    coach: 'LDA is a big, very strong base that cannot reach the carbonyl carbon, so it only pulls the alpha proton, and it pulls it all the way.',
    why: 'The conjugate acid of LDA has a pKa near 36, far above the ketone alpha hydrogen near 20, so deprotonation is essentially complete. Its bulky isopropyl groups keep it from attacking the carbonyl. Hydroxide would leave mostly ketone in solution, inviting aldol side reactions. With unsymmetrical ketones LDA favors the less substituted side, not the more substituted one.'
  }
];
