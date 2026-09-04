// The Tree of Organic · Level 7 · Module 4: Read like a detective (combined spectra)
// ES module, no imports. Structures are drawn by the shell from SMILES; the IR
// curve and the 1H stick spectrum are synthesized here from each case file.

export const SMILES = [
  'CCC(C)=O', 'CCOCC', 'C1CCOC1', 'CCCC=O', 'OCc1ccccc1', 'Cc1ccccc1', 'COc1ccccc1', 'Cc1ccc(O)cc1',
  'CC(C)C=O', 'CCC(C)O', 'CCO', 'CC=O', 'COC', 'OCCO', 'Cc1ccc(C)cc1', 'c1ccccc1', 'CCc1ccccc1', 'Cc1ccccc1C',
  'CC(C)=O', 'CCCO', 'C=CCO', 'CCC=O', 'COC(C)=O', 'CCC(=O)O', 'CCOC=O', 'CC(=O)c1ccccc1', 'c1ccc(C=O)cc1',
  'C=Cc1ccc(O)cc1', 'Cc1ccc(C=O)cc1', 'CC(C)(C)O', 'CCCCO', 'OC(=O)c1ccccc1', 'COC(=O)c1ccccc1',
  'Oc1ccccc1C=O', 'Oc1ccc(C=O)cc1', 'CCOC(C)=O', 'CCCC(=O)O', 'CCC(=O)OC', 'CCC(=O)CC', 'CCCCCO',
  'C1CCCOC1', 'CCCC(C)=O', 'COC(C)(C)C', 'CCC(C)(C)O', 'CCOC(C)C', 'OC1CCCCC1', 'C1CCC(=O)CC1',
  'CC1CCCCO1', 'C=CCCCCO', 'CC(=O)c1ccc(O)cc1', 'CC(=O)Oc1ccccc1', 'C1=CCCCC1', 'C1CCCCC1', 'CCCCC#C',
  'C=CCCC=C', 'CC(C)O', 'CCOC', 'CCCC(=O)OC', 'CCCCC(=O)O', 'CCOC(=O)CC', 'CC(C)C(=O)O'
];

export const meta = {
  id: 't7-multi',
  level: 7,
  order: 4,
  needs3D: false,
  title: 'Read like a detective',
  concept: 'Combined spectra: kill answer choices with clues',
  tagline: 'You are not identifying the compound. You are killing three answer choices.',
  story: 'An unknown problem is a lineup, not a puzzle. Work the clues in order and let each one kill somebody. Formula first: degrees of unsaturation is two C plus two, plus N, minus H, minus halogen, all over two, and four of those means a benzene ring. Then the loudest IR clue: a broad tongue is O-H, a sharp dagger near 1700 is C=O, and no tongue and no dagger is loud too. Then the hydrogen count: how many signals, and how big is each one. Then the splitting: a triplet with a quartet is an ethyl, a doublet with a septet is an isopropyl. By the last clue only one structure is still standing. Rule of thumb: never identify, always eliminate.',
  moveName: 'Formula, loudest IR clue, hydrogen count, splitting',
  move: [
    'Do the degrees of unsaturation from the formula and cross out every choice that does not match.',
    'Take the loudest IR clue next. Broad band is O-H, sharp band near 1700 is C=O, and the absence of either is a clue too.',
    'Count the 1H signals and read the integrations. A different number of signals is a dead choice.',
    'Read the splitting last: triplet plus quartet is an ethyl, 6H doublet plus septet is an isopropyl, a 9H singlet is a tert-butyl.',
    'One structure should be left. If two are left, you skipped a clue.'
  ],
  trap: 'Careful: do not fall in love with the first structure that fits one clue. A structure has to survive every clue, and the clue students skip most is the formula itself.',
  holdsUp: ['Unknown structure problems', 'Isomer questions', 'Degrees of unsaturation', 'Reading IR and NMR together'],
  drill: 'Booster OChem: Spectroscopy & Lab Techniques'
};

const SERIF = 'Georgia, "Times New Roman", serif';
const MONO = 'ui-monospace, "SF Mono", Menlo, monospace';
const ROOTS = ['l1-unsat', 'l1-skeletal'];

/* ------------------------------------------------------------------ */
/* formulas: stored as counts so nothing can drift, printed and         */
/* counted by the same two functions                                    */
/* ------------------------------------------------------------------ */
const HAL = ['Br', 'Cl', 'F', 'I'];
function F(C, H, o){ return Object.assign({ C, H, N: 0, O: 0, X: 0, xs: '' }, o || {}); }
function formulaText(f){
  let s = 'C' + f.C + 'H' + f.H;
  const tail = [];
  if (f.X) tail.push([f.xs, f.X]);
  if (f.N) tail.push(['N', f.N]);
  if (f.O) tail.push(['O', f.O]);
  tail.sort((a, b) => a[0] < b[0] ? -1 : 1);
  for (const [sym, n] of tail) s += sym + (n > 1 ? n : '');
  return s;
}
// the one piece of arithmetic this module computes instead of curating
function dou(f){ return (2 * f.C + 2 + f.N - f.H - f.X) / 2; }
function douWork(f){ return '(2 times ' + f.C + ' + 2' + (f.N ? ' + ' + f.N : '') + ' - ' + f.H + (f.X ? ' - ' + f.X : '') + ') / 2 = ' + dou(f); }
const DOU_MEANING = {
  0: 'No ring, no double bond, no triple bond anywhere.',
  1: 'One ring or one double bond. One, not both.',
  2: 'Two of them in any mix: two double bonds, two rings, one of each, or one triple bond.',
  3: 'Three in any mix. A ring plus two double bonds is common.',
  4: 'Four is exactly what a benzene ring costs: three double bonds plus the ring.',
  5: 'Four of those are a benzene ring, so one more double bond is left over.',
  6: 'A benzene ring plus two more, or two rings plus four double bonds.',
  7: 'Two fused benzene rings cost seven.'
};
function douLine(f){ return formulaText(f) + '. Degrees of unsaturation: ' + douWork(f) + '. ' + (DOU_MEANING[dou(f)] || 'Count them off against the structure.'); }

/* ------------------------------------------------------------------ */
/* the IR and 1H shorthand the case files are written in                */
/* ------------------------------------------------------------------ */
// kind: [depth, width, the plain-words name, whether it gets labeled on the plot]
const IRK = {
  OH: [58, 220, 'O-H, broad', 1], OHacid: [64, 560, 'O-H of an acid, smeared to 2500', 1],
  NH2: [30, 60, 'N-H', 1], NH: [26, 60, 'N-H', 1],
  CO: [66, 40, 'C=O', 1], CHald: [17, 24, 'aldehyde C-H', 1],
  CN: [40, 26, 'C to N triple', 1], CC3: [16, 28, 'C to C triple', 1], CHsp: [42, 34, 'sp C-H', 1],
  'C=C': [22, 35, 'C=C', 1], arene: [26, 30, 'ring', 1],
  CHsp2: [20, 35, 'sp2 C-H', 0], CHsp3: [38, 70, 'sp3 C-H', 0], CO1: [44, 50, 'C-O', 1], fp: [14, 30, '', 0]
};
const MULT_NAME = { s: 'singlet', d: 'doublet', t: 'triplet', q: 'quartet', quint: 'quintet', sext: 'sextet', sept: 'septet', m: 'multiplet', br: 'broad singlet' };
const PASCAL = { s: [1], d: [1, 1], t: [1, 2, 1], q: [1, 3, 3, 1], quint: [1, 4, 6, 4, 1], sext: [1, 5, 10, 10, 5, 1], sept: [1, 6, 15, 20, 15, 6, 1] };

/* ------------------------------------------------------------------ */
/* The case files. Every case: a formula, four clues in the order a     */
/* coach would work them, the answer, and three candidates each with    */
/* the clue that kills it and why. The first five are the drills from   */
/* the Ace Labs unknown set; the rest are built the same way.           */
/* ------------------------------------------------------------------ */
const CASES = [
  { id: 'mek', f: F(4, 8, { O: 1 }), name: '2-butanone', smiles: 'CCC(C)=O',
    ir: [['CHsp3', 2965], ['CO', 1715], ['fp', 1360], ['fp', 1170]],
    h: [[1.05, 't', 3], [2.10, 's', 3], [2.45, 'q', 2]],
    clues: ['A sharp strong band at 1715 and nothing broad above 3200.', 'Three signals: 3H near 1.05, 3H near 2.1, 2H near 2.45, and nothing past 9.', 'The 3H at 1.05 is a triplet and the 2H at 2.45 is a quartet, so those two are an ethyl group. The 3H at 2.1 is a lone singlet.'],
    cands: [
      { smiles: 'CCOCC', name: 'diethyl ether', by: 0, why: 'Diethyl ether is C4H10O with zero degrees of unsaturation. The formula alone kills it.' },
      { smiles: 'C1CCOC1', name: 'tetrahydrofuran', by: 1, why: 'THF spends its one degree on the ring, so it has no carbonyl and no band at 1715.' },
      { smiles: 'CCCC=O', name: 'butanal', by: 2, why: 'Butanal is an aldehyde, so it would put a hydrogen near 9.8 and give four signals, not three.' }],
    read: 'Ethyl plus a lone methyl singlet, hung on a carbonyl at 1715. That is 2-butanone.' },

  { id: 'benzylalc', f: F(7, 8, { O: 1 }), name: 'benzyl alcohol', smiles: 'OCc1ccccc1',
    ir: [['OH', 3350], ['CHsp2', 3060], ['CHsp3', 2930], ['arene', 1600], ['arene', 1495], ['CO1', 1015]],
    h: [[2.2, 'br', 1], [4.6, 's', 2], [7.3, 'm', 5]],
    clues: ['A broad rounded band near 3350 and nothing near 1700.', 'A 2H singlet at 4.6, a 5H multiplet at 7.3, and a broad 1H.', 'Five ring hydrogens in one multiplet means one substituent on the ring, and the 2H at 4.6 sits between the ring and an oxygen.'],
    cands: [
      { smiles: 'Cc1ccccc1', name: 'toluene', by: 0, why: 'Toluene is C7H8. There is no oxygen in it at all.' },
      { smiles: 'COc1ccccc1', name: 'anisole', by: 1, why: 'Anisole has no O-H bond, so the broad band near 3350 cannot be there.' },
      { smiles: 'Cc1ccc(O)cc1', name: 'p-cresol', by: 2, why: 'p-Cresol would show a 3H methyl singlet near 2.3 and only 4 ring hydrogens, not a 2H singlet at 4.6 with 5 ring hydrogens.' }],
    read: 'Four degrees for the ring, a tongue for the O-H, and a CH2 parked between the ring and the oxygen. Benzyl alcohol.' },

  { id: 'isobutyraldehyde', f: F(4, 8, { O: 1 }), name: '2-methylpropanal', smiles: 'CC(C)C=O',
    ir: [['CHsp3', 2965], ['CHald', 2820], ['CHald', 2715], ['CO', 1725], ['fp', 1465]],
    h: [[1.15, 'd', 6], [2.4, 'm', 1], [9.6, 'd', 1]],
    clues: ['A sharp band at 1725 plus two small twin bands at 2820 and 2715.', 'A 6H doublet at 1.15, a 1H multiplet at 2.4, and a 1H at 9.6.', 'A 6H doublet next to a 1H that is split many ways is an isopropyl group, and the 1H at 9.6 is a doublet because it has exactly one neighbor.'],
    cands: [
      { smiles: 'CCC(C)O', name: 'butan-2-ol', by: 0, why: 'Butan-2-ol is C4H10O with zero degrees of unsaturation.' },
      { smiles: 'CCC(C)=O', name: '2-butanone', by: 1, why: 'A ketone has no C-H twins at 2820 and 2715. Those twins are the aldehyde flag.' },
      { smiles: 'CCCC=O', name: 'butanal', by: 2, why: 'Butanal is an aldehyde too, but it would give a 3H triplet at the top of the chain, not a 6H doublet.' }],
    read: 'Aldehyde twins in the IR, a hydrogen at 9.6, and a 6H doublet. An isopropyl group wearing a CHO.' },

  { id: 'ethanol', f: F(2, 6, { O: 1 }), name: 'ethanol', smiles: 'CCO',
    ir: [['OH', 3340], ['CHsp3', 2940], ['CO1', 1050]],
    h: [[1.2, 't', 3], [2.6, 'br', 1], [3.7, 'q', 2]],
    clues: ['A very broad band from 3200 to 3500 and nothing near 1700.', 'Three signals: a 3H triplet at 1.2, a 2H quartet at 3.7, and a broad 1H at 2.6 that vanishes on a D2O shake.', 'Triplet plus quartet is an ethyl group, and the quartet sits at 3.7 because that carbon carries the oxygen.'],
    cands: [
      { smiles: 'CC=O', name: 'acetaldehyde', by: 0, why: 'Acetaldehyde is C2H4O: one degree of unsaturation, not zero.' },
      { smiles: 'OCCO', name: 'ethylene glycol', by: 0, why: 'Ethylene glycol is C2H6O2. Two oxygens, one too many.' },
      { smiles: 'COC', name: 'dimethyl ether', by: 1, why: 'Dimethyl ether is the other C2H6O, but it has no O-H bond, so nothing broad can appear and nothing vanishes on a D2O shake.' }],
    read: 'Zero degrees, a broad O-H, and the triplet-quartet pair. Ethanol, and the D2O shake proves the O-H.' },

  { id: 'pxylene', f: F(8, 10), name: 'p-xylene', smiles: 'Cc1ccc(C)cc1',
    ir: [['CHsp2', 3020], ['CHsp3', 2920], ['arene', 1610], ['arene', 1515], ['fp', 795]],
    h: [[2.3, 's', 6], [7.05, 's', 4]],
    clues: ['Ring bands near 1600 and 1500 with C-H on both sides of 3000. Nothing broad, nothing near 1700.', 'Only two signals, both singlets: 6H at 2.3 and 4H at 7.05.', 'The 13C spectrum shows only three lines.'],
    cands: [
      { smiles: 'c1ccccc1', name: 'benzene', by: 0, why: 'Benzene is C6H6. Two carbons short.' },
      { smiles: 'CCc1ccccc1', name: 'ethylbenzene', by: 2, why: 'Ethylbenzene gives a triplet, a quartet and a 5H multiplet: three signals, and none of them a clean singlet.' },
      { smiles: 'Cc1ccccc1C', name: 'o-xylene', by: 3, why: 'Ortho substitution leaves four different carbons in the ring, so the 13C shows four lines plus the methyl. Only para folds it down to three.' }],
    read: 'Two singlets and three carbon lines is the most symmetry a disubstituted ring can have. Para, every time.' },

  { id: 'acetone', f: F(3, 6, { O: 1 }), name: 'acetone', smiles: 'CC(C)=O',
    ir: [['CHsp3', 2965], ['CO', 1715], ['fp', 1360]],
    h: [[2.1, 's', 6]],
    clues: ['A sharp strong band at 1715, nothing broad above 3200, and no twin bands near 2720.', 'One signal only: a 6H singlet at 2.1.', 'The 13C spectrum shows two lines, one of them at 207.'],
    cands: [
      { smiles: 'CCCO', name: '1-propanol', by: 0, why: '1-Propanol is C3H8O with zero degrees of unsaturation.' },
      { smiles: 'C=CCO', name: '2-propen-1-ol', by: 1, why: 'An allylic alcohol spends its degree on the C=C and shows a broad O-H, so it has a tongue and no dagger. This spectrum is the other way around.' },
      { smiles: 'CCC=O', name: 'propanal', by: 2, why: 'Propanal gives three signals and puts a hydrogen near 9.8. One 6H singlet needs two identical methyls.' }],
    read: 'One signal for six hydrogens means perfect symmetry, and 1715 says carbonyl. Two methyls on a C=O.' },

  { id: 'methylacetate', f: F(3, 6, { O: 2 }), name: 'methyl acetate', smiles: 'COC(C)=O',
    ir: [['CHsp3', 2960], ['CO', 1740], ['CO1', 1240], ['CO1', 1050]],
    h: [[2.05, 's', 3], [3.65, 's', 3]],
    clues: ['A sharp strong band at 1740 with a strong band near 1240, and nothing smeared from 3400 down to 2500.', 'Two signals, both 3H singlets: one at 2.05 and one at 3.65.', 'The 13C shows three lines and the carbonyl one sits at 171, not past 190.'],
    cands: [
      { smiles: 'CC(C)=O', name: 'acetone', by: 0, why: 'Acetone is C3H6O. One oxygen short.' },
      { smiles: 'CCC(=O)O', name: 'propanoic acid', by: 1, why: 'An acid smears its O-H from 3400 all the way down to 2500. No smear, no acid.' },
      { smiles: 'CCOC=O', name: 'ethyl formate', by: 2, why: 'Ethyl formate gives a triplet, a quartet and a 1H singlet near 8. Two 3H singlets is a different molecule.' }],
    read: 'Two 3H singlets, 1740 for the C=O, 171 on the carbon axis. The singlet at 3.65 is the methyl sitting on the oxygen.' },

  { id: 'acetophenone', f: F(8, 8, { O: 1 }), name: 'acetophenone', smiles: 'CC(=O)c1ccccc1',
    ir: [['CHsp2', 3060], ['CHsp3', 2960], ['CO', 1685], ['arene', 1600], ['arene', 1450], ['fp', 760]],
    h: [[2.6, 's', 3], [7.5, 'm', 3], [7.95, 'd', 2]],
    clues: ['A strong sharp band at 1685 and nothing broad above 3200.', 'A 3H singlet at 2.6, a 2H signal near 7.95 and a 3H signal near 7.5. Nothing past 8.', 'Five ring hydrogens split 2 and 3 is a monosubstituted ring, and a 3H singlet next to a carbonyl sits near 2.6.'],
    cands: [
      { smiles: 'c1ccc(C=O)cc1', name: 'benzaldehyde', by: 0, why: 'Benzaldehyde is C7H6O. One carbon and two hydrogens short.' },
      { smiles: 'C=Cc1ccc(O)cc1', name: '4-vinylphenol', by: 1, why: 'A phenol shows a broad band above 3200 and has no carbonyl at all, so 1685 cannot be there.' },
      { smiles: 'Cc1ccc(C=O)cc1', name: '4-methylbenzaldehyde', by: 2, why: 'That aldehyde puts a hydrogen near 9.95, and the clue says nothing past 8.' }],
    read: 'Monosubstituted ring, a methyl singlet at 2.6, C=O at 1685. A methyl ketone on a benzene ring.' },

  { id: 'tbutanol', f: F(4, 10, { O: 1 }), name: 'tert-butanol', smiles: 'CC(C)(C)O',
    ir: [['OH', 3360], ['CHsp3', 2970], ['CO1', 1200]],
    h: [[1.25, 's', 9], [2.0, 'br', 1]],
    clues: ['A broad rounded band near 3360 and nothing near 1700.', 'Two signals: a 9H singlet at 1.25 and a broad 1H.', 'The 13C shows only two lines.'],
    cands: [
      { smiles: 'CCOCC', name: 'diethyl ether', by: 1, why: 'An ether has no O-H bond, so there is nothing to make the broad band near 3360.' },
      { smiles: 'CCCCO', name: '1-butanol', by: 2, why: '1-Butanol gives four alkyl signals plus the O-H. A single 9H singlet needs three identical methyls.' },
      { smiles: 'CCC(C)O', name: 'butan-2-ol', by: 3, why: 'Butan-2-ol has four different carbons, so the 13C shows four lines, not two.' }],
    read: 'All four candidates are C4H10O, so the formula proves nothing here. The 9H singlet and two carbon lines do all the work.' },

  { id: 'benzoicacid', f: F(7, 6, { O: 2 }), name: 'benzoic acid', smiles: 'OC(=O)c1ccccc1',
    ir: [['OHacid', 3000], ['CHsp2', 3070], ['CO', 1690], ['arene', 1600], ['fp', 710]],
    h: [[7.5, 'm', 3], [8.1, 'd', 2], [12.0, 's', 1]],
    clues: ['A very broad band smeared from 3400 down to 2500 with a sharp band at 1690 sitting beside it.', 'Five ring hydrogens split 2 and 3, plus a 1H singlet near 12.', 'A hydrogen at 12 is a carboxylic acid O-H and nothing else on the DAT.'],
    cands: [
      { smiles: 'COC(=O)c1ccccc1', name: 'methyl benzoate', by: 0, why: 'Methyl benzoate is C8H8O2: one carbon and two hydrogens too many.' },
      { smiles: 'Oc1ccccc1C=O', name: 'salicylaldehyde', by: 1, why: 'A phenol O-H is broad but stops well above 2500, and this smear runs all the way down.' },
      { smiles: 'Oc1ccc(C=O)cc1', name: '4-hydroxybenzaldehyde', by: 2, why: 'A para ring gives 4 ring hydrogens, not 5, and its aldehyde hydrogen sits near 9.8, not 12.' }],
    read: 'Tongue smeared to 2500 plus a dagger at 1690 plus a hydrogen at 12. Carboxylic acid, on a ring with one substituent.' },

  { id: 'ethylacetate', f: F(4, 8, { O: 2 }), name: 'ethyl acetate', smiles: 'CCOC(C)=O',
    ir: [['CHsp3', 2985], ['CO', 1740], ['CO1', 1240], ['CO1', 1050]],
    h: [[1.25, 't', 3], [2.05, 's', 3], [4.1, 'q', 2]],
    clues: ['A sharp strong band at 1740 with a strong band near 1240 and nothing broad.', 'Three signals: a 3H triplet at 1.25, a 3H singlet at 2.05, and a 2H quartet at 4.1.', 'The quartet at 4.1 is the giveaway: that CH2 is sitting on the oxygen, not on the carbonyl.'],
    cands: [
      { smiles: 'CCC(C)=O', name: '2-butanone', by: 0, why: '2-Butanone is C4H8O. One oxygen short.' },
      { smiles: 'CCCC(=O)O', name: 'butanoic acid', by: 1, why: 'An acid would smear its O-H down to 2500 and put a hydrogen near 12. Nothing broad here.' },
      { smiles: 'CCC(=O)OC', name: 'methyl propanoate', by: 2, why: 'The same pieces, flipped: methyl propanoate puts its 3H singlet at 3.65 and its quartet at 2.35. Which side of the ester the ethyl sits on is exactly what those shifts tell you.' }],
    read: 'Ester at 1740, and the quartet dragged out to 4.1. The ethyl is on the oxygen side, so it is ethyl acetate, not methyl propanoate.' },

  { id: 'pentanone3', f: F(5, 10, { O: 1 }), name: '3-pentanone', smiles: 'CCC(=O)CC',
    ir: [['CHsp3', 2975], ['CO', 1715], ['fp', 1370]],
    h: [[1.05, 't', 6], [2.4, 'q', 4]],
    clues: ['A sharp strong band at 1715, nothing broad, and no twin bands near 2720.', 'Only two signals: a 6H triplet at 1.05 and a 4H quartet at 2.4.', 'The 13C shows three lines, one of them at 212.'],
    cands: [
      { smiles: 'CCCCCO', name: '1-pentanol', by: 0, why: '1-Pentanol is C5H12O with zero degrees of unsaturation.' },
      { smiles: 'C1CCCOC1', name: 'tetrahydropyran', by: 1, why: 'The ring uses up the one degree, so there is no carbonyl to make the band at 1715.' },
      { smiles: 'CCCC(C)=O', name: '2-pentanone', by: 2, why: '2-Pentanone gives four signals. Two signals in a 6:4 ratio means the carbonyl sits dead center with identical ethyls on both sides.' }],
    read: 'Two signals for ten hydrogens is symmetry, and the carbonyl at 1715 sits in the middle of it. Diethyl ketone.' },

  { id: 'mtbe', f: F(5, 12, { O: 1 }), name: 'tert-butyl methyl ether', smiles: 'COC(C)(C)C',
    ir: [['CHsp3', 2975], ['CO1', 1080], ['fp', 1200]],
    h: [[1.2, 's', 9], [3.2, 's', 3]],
    clues: ['Nothing broad above 3200, nothing near 1700, and one strong band near 1080.', 'Two signals, both singlets: 9H at 1.2 and 3H at 3.2.', 'Neither signal is split at all, so no hydrogen in this molecule has a hydrogen neighbor.'],
    cands: [
      { smiles: 'CCOCC', name: 'diethyl ether', by: 0, why: 'Diethyl ether is C4H10O. One carbon short.' },
      { smiles: 'CCC(C)(C)O', name: '2-methyl-2-butanol', by: 1, why: 'An alcohol shows the broad O-H band. No broad band means the oxygen is an ether oxygen.' },
      { smiles: 'CCOC(C)C', name: 'ethyl isopropyl ether', by: 2, why: 'That ether gives four signals, and two of them are split. Two singlets is a much more symmetric molecule.' }],
    read: 'No O-H, no C=O, one C-O band, and nothing split. A 9H singlet is a tert-butyl group and the 3H at 3.2 sits on the oxygen.' },

  { id: 'cyclohexanol', f: F(6, 12, { O: 1 }), name: 'cyclohexanol', smiles: 'OC1CCCCC1',
    ir: [['OH', 3340], ['CHsp3', 2930], ['CO1', 1070]],
    h: [[1.3, 'm', 5], [1.75, 'm', 5], [2.1, 'br', 1], [3.55, 'm', 1]],
    clues: ['A broad rounded band near 3340 and nothing near 1700.', 'A 1H multiplet at 3.55, a broad 1H, and ten hydrogens bunched between 1.2 and 1.9. Nothing past 5.', 'One degree of unsaturation with no C=O and no vinyl hydrogens means the degree is a ring.'],
    cands: [
      { smiles: 'C1CCC(=O)CC1', name: 'cyclohexanone', by: 0, why: 'Cyclohexanone is C6H10O: two degrees, a ring plus a C=O. The formula says one.' },
      { smiles: 'CC1CCCCO1', name: '2-methyltetrahydropyran', by: 1, why: 'That ether has no O-H bond, so there is nothing to make the broad band.' },
      { smiles: 'C=CCCCCO', name: 'hex-5-en-1-ol', by: 2, why: 'A terminal alkene puts hydrogens near 5.0 and 5.8. The clue says nothing past 5.' }],
    read: 'Broad O-H, one degree, and no vinyl hydrogens. The degree has to be the ring, with the O-H on it.' },

  { id: 'methylbenzoate', f: F(8, 8, { O: 2 }), name: 'methyl benzoate', smiles: 'COC(=O)c1ccccc1',
    ir: [['CHsp2', 3060], ['CHsp3', 2950], ['CO', 1720], ['arene', 1600], ['CO1', 1280], ['fp', 710]],
    h: [[3.9, 's', 3], [7.45, 'm', 3], [8.0, 'd', 2]],
    clues: ['A strong sharp band at 1720 with a strong band near 1280, and nothing broad above 3200.', 'A 3H singlet at 3.9 and five ring hydrogens split 2 and 3.', 'A 3H singlet out at 3.9 is a methyl sitting on an oxygen, not on a carbonyl.'],
    cands: [
      { smiles: 'OC(=O)c1ccccc1', name: 'benzoic acid', by: 0, why: 'Benzoic acid is C7H6O2. A carbon and two hydrogens short.' },
      { smiles: 'CC(=O)c1ccc(O)cc1', name: '4-hydroxyacetophenone', by: 1, why: 'The phenol O-H makes a broad band above 3200, and the clue says there is none.' },
      { smiles: 'CC(=O)Oc1ccccc1', name: 'phenyl acetate', by: 2, why: 'Phenyl acetate is the same pieces flipped, and its methyl sits at 2.3 because it is on the carbonyl, not on the oxygen.' }],
    read: 'Five degrees: four for the ring and one for the C=O. The methyl at 3.9 is on the oxygen, so the ester points that way.' },

  { id: 'cyclohexene', f: F(6, 10), name: 'cyclohexene', smiles: 'C1=CCCCC1',
    ir: [['CHsp2', 3025], ['CHsp3', 2930], ['C=C', 1650], ['fp', 720]],
    h: [[1.6, 'm', 4], [1.95, 'm', 4], [5.65, 'm', 2]],
    clues: ['C-H just above and just below 3000, a medium band at 1650, and nothing near 2120 or 3300.', 'Three signals: 2H near 5.65 and eight hydrogens between 1.5 and 2.0.', 'The 13C shows only three lines.'],
    cands: [
      { smiles: 'C1CCCCC1', name: 'cyclohexane', by: 0, why: 'Cyclohexane is C6H12: one degree, not two.' },
      { smiles: 'CCCCC#C', name: '1-hexyne', by: 1, why: 'A terminal alkyne shows a thin sharp peak at 3310 and a band near 2120. Neither is here, and 1650 is a C=C, not a triple bond.' },
      { smiles: 'C=CCCC=C', name: '1,5-hexadiene', by: 2, why: 'A diene with two terminal alkenes puts four hydrogens near 5.0 and two near 5.8. This spectrum has only two hydrogens past 5.' }],
    read: 'Two degrees, but only one C=C in the IR and only two vinyl hydrogens. The second degree has to be a ring.' },

  { id: 'isopropanol', f: F(3, 8, { O: 1 }), name: '2-propanol', smiles: 'CC(C)O',
    ir: [['OH', 3350], ['CHsp3', 2970], ['CO1', 1130]],
    h: [[1.15, 'd', 6], [2.4, 'br', 1], [4.0, 'sept', 1]],
    clues: ['A broad rounded band near 3350 and nothing near 1700.', 'A 6H doublet at 1.15, a 1H septet at 4.0, and a broad 1H.', 'Six equivalent neighbors give 6 plus 1 = 7 lines, which is why that 1H is a septet.'],
    cands: [
      { smiles: 'CCC=O', name: 'propanal', by: 0, why: 'Propanal is C3H6O: one degree of unsaturation, and this formula has zero.' },
      { smiles: 'CCOC', name: 'methyl ethyl ether', by: 1, why: 'An ether has no O-H bond, so nothing makes the broad band near 3350.' },
      { smiles: 'CCCO', name: '1-propanol', by: 2, why: '1-Propanol gives a triplet, a sextet and a triplet. A 6H doublet needs two methyls hanging on one carbon.' }],
    read: 'Doublet 6H plus septet 1H is the isopropyl fingerprint, and the broad band puts the O-H on the middle carbon.' },

  { id: 'methylbutanoate', f: F(5, 10, { O: 2 }), name: 'methyl butanoate', smiles: 'CCCC(=O)OC',
    ir: [['CHsp3', 2960], ['CO', 1735], ['CO1', 1175]],
    h: [[0.95, 't', 3], [1.65, 'sext', 2], [2.3, 't', 2], [3.65, 's', 3]],
    clues: ['A strong sharp band at 1735 and nothing smeared down to 2500.', 'Four signals: a 3H triplet at 0.95, a 2H sextet at 1.65, a 2H triplet at 2.3, and a 3H singlet at 3.65.', 'The 3H singlet at 3.65 is a methyl on an oxygen, and the sextet says the middle CH2 has five neighbors.'],
    cands: [
      { smiles: 'CCCC(C)=O', name: '2-pentanone', by: 0, why: '2-Pentanone is C5H10O. One oxygen short.' },
      { smiles: 'CCCCC(=O)O', name: 'pentanoic acid', by: 1, why: 'An acid smears its O-H from 3400 down to 2500 and puts a hydrogen near 12. Neither is here.' },
      { smiles: 'CCOC(=O)CC', name: 'ethyl propanoate', by: 2, why: 'Ethyl propanoate gives a quartet near 4.1 and two triplets. There is no 3H singlet anywhere in it.' }],
    read: 'Ester at 1735, a propyl chain on one side, and a lone methyl singlet at 3.65 on the oxygen side.' },

  { id: 'butanoicacid', f: F(4, 8, { O: 2 }), name: 'butanoic acid', smiles: 'CCCC(=O)O',
    ir: [['OHacid', 2980], ['CHsp3', 2960], ['CO', 1710], ['CO1', 1280]],
    h: [[0.95, 't', 3], [1.65, 'sext', 2], [2.35, 't', 2], [11.5, 's', 1]],
    clues: ['A very broad band smeared from 3400 down to 2500 with the C-H riding on top of it, plus a sharp band at 1710.', 'Four signals: a 3H triplet at 0.95, a 2H sextet at 1.65, a 2H triplet at 2.35, and a 1H singlet at 11.5.', 'A 3H triplet and a 2H sextet at the far end of the chain means a straight propyl, not a branched one.'],
    cands: [
      { smiles: 'CCC(=O)O', name: 'propanoic acid', by: 0, why: 'Propanoic acid is C3H6O2. One carbon short.' },
      { smiles: 'CCOC(C)=O', name: 'ethyl acetate', by: 1, why: 'An ester has no O-H, so nothing smears down to 2500 and there is no hydrogen at 11.5.' },
      { smiles: 'CC(C)C(=O)O', name: '2-methylpropanoic acid', by: 2, why: 'The branched acid gives a 6H doublet and a 1H septet, not a triplet, a sextet and a triplet.' }],
    read: 'Smear to 2500 plus a hydrogen at 11.5 is an acid, and the triplet-sextet-triplet chain is straight. Butanoic acid.' }
];

/* extra formulas for the arithmetic drill, each one a real molecule */
const FORMULAS = [
  { f: F(6, 6), name: 'benzene' }, { f: F(6, 12), name: 'cyclohexane' }, { f: F(6, 14), name: 'hexane' },
  { f: F(2, 4), name: 'ethene' }, { f: F(2, 2), name: 'ethyne' }, { f: F(10, 8), name: 'naphthalene' },
  { f: F(3, 4), name: 'propyne' }, { f: F(5, 8), name: 'cyclopentene' }, { f: F(8, 8, { O: 1 }), name: 'acetophenone' },
  { f: F(7, 6, { O: 1 }), name: 'benzaldehyde' }, { f: F(6, 7, { N: 1 }), name: 'aniline' }, { f: F(5, 11, { N: 1 }), name: 'a cyclic amine' },
  { f: F(4, 9, { X: 1, xs: 'Br' }), name: '1-bromobutane' }, { f: F(6, 5, { X: 1, xs: 'Cl' }), name: 'chlorobenzene' },
  { f: F(3, 7, { X: 1, xs: 'Cl' }), name: '1-chloropropane' }, { f: F(2, 3, { N: 1 }), name: 'acetonitrile' },
  { f: F(7, 8, { O: 1 }), name: 'benzyl alcohol' }, { f: F(9, 8, { O: 4 }), name: 'aspirin' },
  { f: F(4, 6), name: '1,3-butadiene' }, { f: F(8, 10), name: 'p-xylene' }, { f: F(5, 10, { O: 1 }), name: '3-pentanone' },
  { f: F(7, 7, { X: 1, xs: 'Br' }), name: 'benzyl bromide' }, { f: F(6, 10, { O: 1 }), name: 'cyclohexanone' },
  { f: F(4, 10, { O: 1 }), name: 'tert-butanol' }, { f: F(9, 12), name: 'mesitylene' }, { f: F(8, 8), name: 'styrene' }
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
// molecular formula from a simple organic SMILES, implicit hydrogens filled by valence
function formulaOf(smi){
  const VAL = { C: 4, N: 3, O: 2, S: 2, P: 3, F: 1, Cl: 1, Br: 1, I: 1, B: 3 };
  const atoms = [], rings = {}, stack = []; let prev = -1, order = 0, i = 0;
  const bond = (a, b, o) => { atoms[a].bonds += o; atoms[b].bonds += o; };
  while (i < smi.length){
    const ch = smi[i];
    if (ch === '['){
      const j = smi.indexOf(']', i), m = smi.slice(i + 1, j).match(/^(\d*)([A-Z][a-z]?|[a-z]{1,2})(@*)(H\d*)?([+-]\d*)?/);
      const e = m[2], arom = e === e.toLowerCase(), hs = m[4] ? (m[4].length > 1 ? parseInt(m[4].slice(1), 10) : 1) : 0;
      atoms.push({ el: arom ? e[0].toUpperCase() + e.slice(1) : e, arom, hs, bonds: 0, bracket: true });
      if (prev >= 0) bond(prev, atoms.length - 1, order || 1); prev = atoms.length - 1; order = 0; i = j + 1; continue;
    }
    if (/[A-Z]/.test(ch)){ let e = ch; if ((ch === 'C' && smi[i + 1] === 'l') || (ch === 'B' && smi[i + 1] === 'r')){ e += smi[i + 1]; i++; } atoms.push({ el: e, arom: false, hs: null, bonds: 0 }); if (prev >= 0) bond(prev, atoms.length - 1, order || 1); prev = atoms.length - 1; order = 0; i++; continue; }
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
function sameFormula(a, b){ return a.C === b.C && a.H === b.H && a.N === b.N && a.O === b.O && a.X === b.X; }
// the same formula, but drawn with real subscripts so O never reads as a zero
function formulaNode(api, f, size){
  const span = api.el('span', { style: { fontFamily: SERIF, fontSize: (size || 26) + 'px', letterSpacing: '.01em' } });
  const put = (sym, n) => { span.append(sym); if (n > 1) span.append(api.el('sub', { text: String(n), style: { fontSize: '.62em' } })); };
  put('C', f.C); put('H', f.H);
  const tail = [];
  if (f.X) tail.push([f.xs, f.X]);
  if (f.N) tail.push(['N', f.N]);
  if (f.O) tail.push(['O', f.O]);
  tail.sort((a, b) => a[0] < b[0] ? -1 : 1);
  for (const [sym, n] of tail) put(sym, n);
  return span;
}
function clueList(c){ return [douLine(c.f), 'IR: ' + c.clues[0], '1H NMR: ' + c.clues[1], 'And one more: ' + c.clues[2]]; }
const CLUE_TAG = ['the formula', 'the IR', 'the 1H NMR', 'the last clue'];
function allCands(c){ return [{ smiles: c.smiles, name: c.name, by: -1, why: '' }].concat(c.cands); }
function caseWords(c){
  return formulaText(c.f) + '. IR: ' + c.clues[0] + ' 1H NMR: ' + c.clues[1];
}

/* ------------------------------------------------------------------ */
/* the IR strip: the same synthesized curve the IR module uses          */
/* ------------------------------------------------------------------ */
function irSamples(peaks){
  const N = 560, out = [];
  for (let i = 0; i <= N; i++){
    const wn = 4000 - 3500 * i / N;
    let T = 95;
    for (const [kind, c] of peaks){ const [d, w] = IRK[kind]; const s = w / 2; T -= d * Math.exp(-((wn - c) * (wn - c)) / (2 * s * s)); }
    T -= 0.6 * Math.sin(wn / 41) + 0.4 * Math.sin(wn / 17.3);
    if (wn < 1500) T -= 2 + 1.6 * Math.sin(wn / 23) + 1.1 * Math.sin(wn / 9.1);
    out.push([wn, Math.max(4, Math.min(99, T))]);
  }
  return out;
}
function drawIR(api, peaks, o){
  o = o || {};
  const C = api.colors, svg = api.svg;
  const W = 700, H = 192, Lx = 34, R = 690, T = 30, B = 138;
  const x = wn => Lx + (4000 - wn) / 3500 * (R - Lx);
  const y = t => B - (t / 100) * (B - T);
  const root = svg('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': o.label || 'the IR spectrum of the unknown', style: { width: '100%', height: 'auto', display: 'block' } });
  const reg = (a, b, col, op) => root.append(svg('rect', { x: x(a).toFixed(1), y: T, width: (x(b) - x(a)).toFixed(1), height: B - T, fill: col, 'fill-opacity': op }));
  reg(3650, 3150, C.blue, .1); reg(2280, 2080, C.amber, .1); reg(1790, 1640, C.coral, .13); reg(1500, 500, C.grey, .16);
  root.append(svg('rect', { x: Lx, y: T, width: R - Lx, height: B - T, fill: 'none', stroke: C.line }));
  root.append(svg('line', { x1: x(3000), y1: T, x2: x(3000), y2: B, stroke: C.ink3, 'stroke-width': 1, 'stroke-dasharray': '4 4' }));
  for (const t of [4000, 3500, 3000, 2500, 2000, 1500, 1000, 500]){
    root.append(svg('line', { x1: x(t), y1: B, x2: x(t), y2: B + 4, stroke: C.ink3 }));
    root.append(svg('text', { x: x(t), y: B + 16, fill: C.ink3, 'font-family': MONO, 'font-size': 10, 'text-anchor': 'middle', text: String(t) }));
  }
  root.append(svg('text', { x: R, y: B + 33, fill: C.ink3, 'font-family': SERIF, 'font-size': 12, 'text-anchor': 'end', text: 'below 1500 is the fingerprint, cross it out' }));
  root.append(svg('text', { x: Lx, y: B + 33, fill: C.ink3, 'font-family': MONO, 'font-size': 10, text: 'wavenumber, read right to left' }));
  const pts = irSamples(peaks);
  root.append(svg('path', { d: pts.map((p, i) => (i ? 'L' : 'M') + x(p[0]).toFixed(1) + ',' + y(p[1]).toFixed(1)).join(' '), fill: 'none', stroke: C.ink, 'stroke-width': 1.8, 'stroke-linejoin': 'round' }));
  // name the loud landmarks, pushed apart so the words never stack
  const named = peaks.filter(p => IRK[p[0]][3]).sort((a, b) => b[1] - a[1]);
  const lx = named.map(p => x(p[1]));
  for (let i = 1; i < lx.length; i++) if (lx[i] - lx[i - 1] < 96) lx[i] = lx[i - 1] + 96;
  const spill = lx.length ? lx[lx.length - 1] - (R - 40) : 0;
  if (spill > 0) for (let i = 0; i < lx.length; i++) lx[i] = Math.max(Lx + 40, lx[i] - spill);
  named.forEach((p, i) => {
    const col = p[0] === 'CO' ? C.coral : (p[0] === 'OH' || p[0] === 'OHacid' || p[0] === 'NH' || p[0] === 'NH2') ? C.blue : (p[0] === 'C=C' || p[0] === 'arene') ? C.green : C.amber;
    root.append(svg('line', { x1: x(p[1]).toFixed(1), y1: y(60), x2: lx[i].toFixed(1), y2: 22, stroke: col, 'stroke-width': 1, 'stroke-opacity': .8 }));
    root.append(svg('text', { x: lx[i].toFixed(1), y: 16, fill: col, 'font-family': MONO, 'font-size': 10, 'text-anchor': 'middle', text: p[1] + ' ' + IRK[p[0]][2] }));
  });
  return root;
}

/* ------------------------------------------------------------------ */
/* the 1H strip                                                         */
/* ------------------------------------------------------------------ */
function drawH(api, sigs, o){
  o = o || {};
  const C = api.colors, svg = api.svg;
  const W = 700, H = 178, Lx = 30, R = 690, T = 58, B = 140;
  const x = ppm => Lx + (12.6 - ppm) / 12.9 * (R - Lx);
  const root = svg('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': o.label || 'the 1H NMR spectrum of the unknown', style: { width: '100%', height: 'auto', display: 'block' } });
  const zone = (a, b, col, name) => {
    root.append(svg('rect', { x: x(b).toFixed(1), y: T, width: (x(a) - x(b)).toFixed(1), height: B - T, fill: col, 'fill-opacity': .07 }));
    root.append(svg('text', { x: ((x(a) + x(b)) / 2).toFixed(1), y: 14, fill: col, 'font-family': MONO, 'font-size': 10, 'text-anchor': 'middle', text: name }));
  };
  zone(10.5, 13, C.coral, 'acid 12'); zone(9, 10.5, C.goldhi, 'aldehyde 9 to 10'); zone(6.5, 8.5, C.green, 'aromatic 7');
  zone(4.5, 6.5, C.blue, 'vinyl 5 to 6'); zone(3, 4.5, C.blue, 'next to O or X'); zone(0.5, 2.7, C.grey, 'alkyl 1 to 2');
  root.append(svg('line', { x1: Lx, y1: B, x2: R, y2: B, stroke: C.ink3 }));
  for (let p = 0; p <= 12; p++){
    root.append(svg('line', { x1: x(p).toFixed(1), y1: B, x2: x(p).toFixed(1), y2: B + 4, stroke: C.ink3 }));
    root.append(svg('text', { x: x(p).toFixed(1), y: B + 16, fill: C.ink3, 'font-family': MONO, 'font-size': 10, 'text-anchor': 'middle', text: String(p) }));
  }
  const maxH = Math.max(...sigs.map(s => s[2]));
  const J = 0.085;
  // the captions get their own band above the plot, pushed apart and leaned back onto their peak
  const lx = sigs.map(s => x(s[0]));
  const ord = sigs.map((s, i) => i).sort((a, b) => lx[a] - lx[b]);   // left to right on the plot
  for (let k = 1; k < ord.length; k++) if (lx[ord[k]] - lx[ord[k - 1]] < 88) lx[ord[k]] = lx[ord[k - 1]] + 88;
  const spill = ord.length ? lx[ord[ord.length - 1]] - (R - 44) : 0;
  if (spill > 0) for (const i of ord) lx[i] = Math.max(Lx + 44, lx[i] - spill);
  sigs.forEach(([ppm, mult, nH], si) => {
    const tall = (B - T) * (0.3 + 0.6 * Math.sqrt(nH / maxH));
    if (mult === 'br'){
      const w = 16, d = [];
      for (let k = -w; k <= w; k++) d.push((k === -w ? 'M' : 'L') + (x(ppm) + k).toFixed(1) + ',' + (B - tall * .5 * Math.exp(-(k * k) / (2 * 38))).toFixed(1));
      root.append(svg('path', { d: d.join(' '), fill: 'none', stroke: C.ink, 'stroke-width': 1.8 }));
    } else {
      const rows = mult === 'm' ? [2, 3, 5, 4, 3, 2] : PASCAL[mult];
      const mx = Math.max(...rows), n = rows.length;
      rows.forEach((r, k) => {
        const xx = x(ppm + (k - (n - 1) / 2) * J * (mult === 'm' ? .75 : 1));
        root.append(svg('line', { x1: xx.toFixed(1), y1: B, x2: xx.toFixed(1), y2: (B - tall * r / mx).toFixed(1), stroke: C.ink, 'stroke-width': 1.8 }));
      });
    }
    const ty = 32 + (ord.indexOf(si) % 2) * 14;
    if (Math.abs(lx[si] - x(ppm)) > 1.5) root.append(svg('line', { x1: x(ppm).toFixed(1), y1: (B - tall - 4).toFixed(1), x2: lx[si].toFixed(1), y2: (ty + 4).toFixed(1), stroke: C.line, 'stroke-width': 1 }));
    root.append(svg('text', { x: lx[si].toFixed(1), y: ty, fill: C.ink2, 'font-family': MONO, 'font-size': 11, 'text-anchor': 'middle', text: ppm + ' ' + mult + ' ' + nH + 'H' }));
  });
  root.append(svg('text', { x: (Lx + R) / 2, y: H - 4, fill: C.ink3, 'font-family': MONO, 'font-size': 10, 'text-anchor': 'middle', text: 'ppm, 12 on the left, 0 on the right' }));
  return root;
}

/* ------------------------------------------------------------------ */
/* generators (pure). Every answer comes from the case file.            */
/* ------------------------------------------------------------------ */
function numberChoices(rng, v, floor){
  const lo = floor == null ? 1 : floor;
  const pool = [v - 2, v - 1, v + 1, v + 2, v + 3].filter(x => x >= lo);
  const picks = [], rest = pool.slice();
  while (picks.length < 3 && rest.length) picks.push(rest.splice(Math.floor(rng() * rest.length), 1)[0]);
  return shuffleWith(rng, [{ text: String(v), ok: true }, ...picks.map(p => ({ text: String(p), ok: false }))]);
}
function genCase(rng){
  const c = pickWith(rng, CASES);
  const choices = shuffleWith(rng, allCands(c).map(x => ({ smiles: x.smiles, label: x.name, ok: x.by < 0, cand: x })));
  return { kind: 'case', c, choices };
}
function genDou(rng){
  const e = pickWith(rng, FORMULAS.concat(CASES.map(c => ({ f: c.f, name: c.name }))));
  return { kind: 'dou', entry: e, choices: numberChoices(rng, dou(e.f), 0) };
}
function genElim(rng){
  const c = pickWith(rng, CASES);
  const k = pickWith(rng, c.cands).by;
  const dead = c.cands.filter(x => x.by === k);
  if (dead.length !== 1) return genElim(rng);
  const choices = shuffleWith(rng, allCands(c).map(x => ({ smiles: x.smiles, label: x.name, ok: x === dead[0], cand: x })));
  return { kind: 'elim', c, clue: k, choices };
}
function coachFor(g){
  if (g.kind === 'dou') return 'Degrees of unsaturation is two C plus two, plus N, minus H, minus halogen, all over two. Here: ' + douWork(g.entry.f) + '. ' + (DOU_MEANING[dou(g.entry.f)] || '');
  if (g.kind === 'elim') return 'Take one clue at a time and ask what it kills. ' + g.c.cands.filter(x => x.by === g.clue)[0].why;
  return g.c.read + ' The three that die: ' + g.c.cands.map(x => x.name + ', by ' + CLUE_TAG[x.by]).join('; ') + '.';
}

/* ------------------------------------------------------------------ */
/* makeItem for the Summit                                              */
/* ------------------------------------------------------------------ */
function toSummit(g){
  const base = { sub: null, reagent: null, prod: null, coach: coachFor(g), home: meta.id, roots: ROOTS, source: 'generated' };
  if (g.kind === 'dou') return Object.assign(base, { stem: 'How many degrees of unsaturation does ' + formulaText(g.entry.f) + ' have?', choices: g.choices.map(c => ({ text: c.text, smiles: null })), correct: g.choices.findIndex(c => c.ok) });
  if (g.kind === 'elim') return Object.assign(base, { stem: 'An unknown is ' + formulaText(g.c.f) + '. ' + clueList(g.c)[g.clue] + ' Which candidate does that one clue eliminate?', choices: g.choices.map(c => ({ text: '', smiles: c.smiles })), correct: g.choices.findIndex(c => c.ok) });
  return Object.assign(base, { stem: 'An unknown has the formula ' + caseWords(g.c) + ' Which structure is it?', choices: g.choices.map(c => ({ text: '', smiles: c.smiles })), correct: g.choices.findIndex(c => c.ok) });
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
  if (bank.length && api.rng() < 0.35) return trimBank(api, api.pick(bank));
  const r = api.rng();
  return toSummit(r < 0.42 ? genCase(api.rng) : r < 0.74 ? genDou(api.rng) : genElim(api.rng));
}

/* ------------------------------------------------------------------ */
/* mount                                                                */
/* ------------------------------------------------------------------ */
export function mount(slots, api){
  const C = api.colors, el = api.el;

  /* ---------- VISUAL: the case file, one clue at a time ---------- */
  let cur = CASES[0], upTo = 1;   // upTo = how many clues have been turned over
  const chips = el('div', { class: 'controls', style: { marginTop: '0' } });
  const top = el('div', { style: { display: 'flex', gap: '16px', alignItems: 'flex-start', flexWrap: 'wrap', margin: '12px 0 0' } });
  const fCard = el('div', { style: { width: '250px', flex: 'none', background: 'rgba(201,168,76,.06)', border: '1px solid ' + C.line, borderLeft: '3px solid ' + C.gold, borderRadius: '10px', padding: '12px 14px' } });
  const fBig = el('div', { style: { color: C.goldhi, minHeight: '32px' } });
  const fWork = el('div', { style: { fontFamily: MONO, fontSize: '13px', color: C.ink2, margin: '8px 0 2px' } });
  const fDou = el('div', { style: { fontFamily: SERIF, fontSize: '17px', color: C.ink } });
  const fMean = el('div', { style: { fontSize: '14px', color: C.ink2, marginTop: '6px' } });
  fCard.append(el('span', { class: 'eyebrow', text: 'the formula', style: { display: 'block', marginBottom: '4px' } }), fBig, fWork, fDou, fMean);
  const specs = el('div', { style: { flex: '1 1 380px', minWidth: '0' } });
  const irHost = el('div', {}); const hHost = el('div', {});
  specs.append(irHost, hHost);
  top.append(fCard, specs);
  const grid = el('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '10px', margin: '14px 0 0' } });
  const ledger = el('ol', { style: { margin: '10px 0 0', paddingLeft: '20px', fontSize: '15px', color: C.ink } });
  const row = el('div', { class: 'controls' });
  const btnNext = el('button', { type: 'button', class: 'primary', text: 'Turn over the first clue', onclick(){ if (upTo < 4){ upTo++; paint(); } } });
  const btnReset = el('button', { type: 'button', class: 'secondary', text: 'Start the case over', onclick(){ upTo = 0; paint(); } });
  row.append(btnNext, btnReset);
  const verdict = el('div', { style: { fontFamily: SERIF, fontSize: '17px', color: C.goldhi, borderLeft: '3px solid ' + C.gold, paddingLeft: '10px', margin: '12px 0 0', minHeight: '1.4em' } });
  slots.visual.append(chips, top, row, ledger, grid, verdict);

  function paint(){
    const clues = clueList(cur);
    btnNext.disabled = upTo >= 4;
    btnNext.textContent = upTo === 0 ? 'Turn over the first clue' : upTo >= 4 ? 'Every clue is out' : 'Next clue: ' + CLUE_TAG[upTo];
    const known = upTo > 0;
    clear(fBig); fBig.append(known ? formulaNode(api, cur.f, 28) : el('span', { style: { fontFamily: SERIF, fontSize: '28px', color: C.ink3 }, text: 'C?H?' }));
    fWork.textContent = known ? douWork(cur.f) : 'degrees of unsaturation: turn over clue one';
    fDou.textContent = known ? dou(cur.f) + ' degree' + (dou(cur.f) === 1 ? '' : 's') + ' of unsaturation' : '';
    fMean.textContent = known ? (DOU_MEANING[dou(cur.f)] || '') : '';
    clear(irHost); if (upTo >= 2) irHost.append(drawIR(api, cur.ir));
    else irHost.append(el('div', { style: { border: '1px dashed ' + C.line, borderRadius: '10px', padding: '22px 14px', textAlign: 'center', color: C.ink3, fontFamily: MONO, fontSize: '12px' }, text: 'the IR is clue two' }));
    clear(hHost); if (upTo >= 3) hHost.append(drawH(api, cur.h));
    else hHost.append(el('div', { style: { border: '1px dashed ' + C.line, borderRadius: '10px', padding: '22px 14px', textAlign: 'center', color: C.ink3, fontFamily: MONO, fontSize: '12px', marginTop: '8px' }, text: 'the 1H NMR is clue three' }));
    clear(ledger);
    for (let i = 0; i < upTo; i++) ledger.append(el('li', { style: { margin: '3px 0' } }, el('b', { text: CLUE_TAG[i] + '. ', style: { color: C.goldhi, fontFamily: SERIF } }), clues[i]));
    if (!upTo) ledger.append(el('li', { style: { color: C.ink3, listStyle: 'none', marginLeft: '-20px' }, text: 'Four clues, four candidates. Turn them over one at a time and watch who dies.' }));
    clear(grid);
    const solved = upTo >= 4;
    for (const cand of allCands(cur)){
      const dead = cand.by >= 0 && cand.by < upTo;
      const win = solved && cand.by < 0;
      const card = el('div', { style: { border: '1px solid ' + (win ? C.gold : dead ? C.line : C.line), borderRadius: '10px', padding: '8px', background: win ? 'rgba(201,168,76,.1)' : 'rgba(255,255,255,.02)', opacity: dead ? '.5' : '1' } });
      const pic = el('div', {}); api.drawSmiles(pic, cand.smiles, { width: 190, height: 116, label: cand.name });
      card.append(pic, el('div', { style: { fontFamily: SERIF, fontSize: '15px', color: win ? C.goldhi : C.ink, textDecoration: dead ? 'line-through' : 'none' }, text: cand.name }));
      if (dead) card.append(el('div', { style: { fontSize: '13px', color: C.ink3, marginTop: '4px' } }, el('b', { text: 'Out on ' + CLUE_TAG[cand.by] + '. ', style: { color: C.amber } }), cand.why));
      else if (win) card.append(el('div', { style: { fontSize: '13px', color: C.goldhi, marginTop: '4px' }, text: 'Last one standing.' }));
      grid.append(card);
    }
    verdict.textContent = solved ? cur.read : (upTo ? 'Still standing: ' + allCands(cur).filter(x => !(x.by >= 0 && x.by < upTo)).length + ' of 4.' : 'Never identify. Always eliminate.');
  }
  function show(c){ cur = c; upTo = 1; for (const b of chips.children) b.setAttribute('aria-pressed', String(b.dataset.id === c.id)); paint(); }
  chips.append(el('span', { style: { fontFamily: MONO, fontSize: '11px', color: C.ink3, letterSpacing: '.12em', textTransform: 'uppercase' }, text: 'case' }));
  CASES.forEach((c, i) => chips.append(el('button', { type: 'button', class: 'chip', text: String(i + 1), dataset: { id: c.id }, 'aria-label': 'case ' + (i + 1) + ', formula ' + formulaText(c.f), title: formulaText(c.f) + ', ' + c.name, 'aria-pressed': 'false', onclick: () => show(c) })));
  show(cur);

  /* ---------- YOU TRY ---------- */
  const bank = api.bank && api.bank.items ? api.bank.items(meta.id) : [];
  let turn = 0;
  function generated(){
    const k = (turn - 1) % 3;
    if (k === 0){
      const g = genCase(api.rng);
      const node = el('div', {});
      node.append(el('div', { style: { color: C.goldhi, margin: '2px 0 6px' } }, formulaNode(api, g.c.f, 22)));
      node.append(el('div', { style: { fontSize: '15px', color: C.ink2, margin: '0 0 6px' }, text: 'IR: ' + g.c.clues[0] }));
      node.append(drawIR(api, g.c.ir), drawH(api, g.c.h));
      return { prompt: 'Work the clues and name the structure.', node, choices: g.choices, coach: coachFor(g) };
    }
    if (k === 1){
      const g = genDou(api.rng);
      const node = el('div', { style: { color: C.goldhi, margin: '4px 0 10px' } }, formulaNode(api, g.entry.f, 34));
      return { prompt: 'How many degrees of unsaturation does this formula have?', node, choices: g.choices, coach: coachFor(g) };
    }
    const g = genElim(api.rng);
    const node = el('div', {});
    node.append(el('div', { style: { fontFamily: SERIF, fontSize: '16px', color: C.ink, borderLeft: '3px solid ' + C.gold, paddingLeft: '10px', margin: '2px 0 6px' }, text: clueList(g.c)[g.clue] }));
    if (g.clue === 1) node.append(drawIR(api, g.c.ir));
    if (g.clue === 2) node.append(drawH(api, g.c.h));
    node.append(el('div', { style: { color: C.goldhi, margin: '2px 0 4px' } }, formulaNode(api, g.c.f, 20)));
    return { prompt: 'Which candidate does this one clue kill?', node, choices: g.choices, coach: coachFor(g) };
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
      else if (c.label) bodyEl.append(el('span', { text: c.label, style: { display: 'block', fontFamily: MONO, fontSize: '12px', color: C.ink3 } }));
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
  // 0. the arithmetic, checked against degrees of unsaturation counted by hand
  const KNOWN = [['C6H6', 4], ['C6H12', 1], ['C6H14', 0], ['C2H4', 1], ['C2H2', 2], ['C10H8', 7], ['C3H4', 2], ['C5H8', 2],
    ['C8H8O', 5], ['C7H6O', 5], ['C6H7N', 4], ['C5H11N', 1], ['C4H9Br', 0], ['C6H5Cl', 4], ['C3H7Cl', 0], ['C2H3N', 2],
    ['C7H8O', 4], ['C9H8O4', 6], ['C4H6', 2], ['C8H10', 4], ['C9H12', 4], ['C8H8', 5]];
  const byText = {};
  for (const e of FORMULAS) byText[formulaText(e.f)] = e.f;
  for (const c of CASES) byText[formulaText(c.f)] = c.f;
  for (const [txt, want] of KNOWN){
    const f = byText[txt];
    if (!f) continue;
    if (dou(f) !== want) return { ok: false, tried, notes: 'dou ' + txt + ' gave ' + dou(f) + ', hand count says ' + want };
  }
  for (const [txt, want] of [['C6H6', 4], ['C10H8', 7], ['C6H5Cl', 4], ['C6H7N', 4], ['C9H10O2', 5]]){
    const m = txt.match(/^C(\d+)H(\d+)(Br|Cl|F|I)?(\d*)(N)?(\d*)(O)?(\d*)$/);
    const f = F(+m[1], +m[2], { X: m[3] ? (+m[4] || 1) : 0, xs: m[3] || '', N: m[5] ? (+m[6] || 1) : 0, O: m[7] ? (+m[8] || 1) : 0 });
    if (dou(f) !== want) return { ok: false, tried, notes: 'dou parse of ' + txt + ' gave ' + dou(f) };
    if (formulaText(f) !== txt) return { ok: false, tried, notes: 'formulaText round trip broke on ' + txt };
  }
  // 1. the formula reader, so the case files can be checked against their own structures
  for (const [s, c, h, n, o, x] of [['CCO', 2, 6, 0, 1, 0], ['c1ccccc1', 6, 6, 0, 0, 0], ['CC(=O)O', 2, 4, 0, 2, 0], ['C1CCOC1', 4, 8, 0, 1, 0], ['Oc1ccc(C=O)cc1', 7, 6, 0, 2, 0], ['C=CCCC=C', 6, 10, 0, 0, 0]]){
    const f = formulaOf(s);
    if (f.C !== c || f.H !== h || f.N !== n || f.O !== o || f.X !== x) return { ok: false, tried, notes: 'formulaOf ' + s + ' gave ' + JSON.stringify(f) };
  }
  // 2. every case file proves itself
  if (CASES.length < 17) return { ok: false, tried, notes: 'fewer than 17 cases' };
  const ids = new Set();
  for (const c of CASES){
    if (ids.has(c.id)) return { ok: false, tried, notes: 'duplicate case ' + c.id };
    ids.add(c.id);
    if (c.clues.length !== 3 || c.cands.length !== 3) return { ok: false, tried, notes: c.id + ': a case is four clues and four candidates' };
    if (!c.read || !c.name) return { ok: false, tried, notes: c.id + ': no read or no name' };
    for (const cand of allCands(c)){
      if (!smilesSane(cand.smiles) || !SMILES.includes(cand.smiles)) return { ok: false, tried, notes: c.id + ': smiles not listed or not sane, ' + cand.smiles };
    }
    if (new Set(allCands(c).map(x => x.smiles)).size !== 4) return { ok: false, tried, notes: c.id + ': repeated candidate' };
    if (new Set(allCands(c).map(x => x.name)).size !== 4) return { ok: false, tried, notes: c.id + ': repeated candidate name' };
    // the answer really has the stated formula
    if (!sameFormula(formulaOf(c.smiles), c.f)) return { ok: false, tried, notes: c.id + ': the answer is ' + JSON.stringify(formulaOf(c.smiles)) + ' but the case says ' + formulaText(c.f) };
    // the integrations add up to the hydrogens in the formula
    const sumH = c.h.reduce((s, x) => s + x[2], 0);
    if (sumH !== c.f.H) return { ok: false, tried, notes: c.id + ': integrations add to ' + sumH + ' but the formula has ' + c.f.H + ' H' };
    for (const [ppm, mult, nH] of c.h){
      if (!MULT_NAME[mult]) return { ok: false, tried, notes: c.id + ': unknown multiplicity ' + mult };
      if (!(ppm > 0 && ppm < 13) || !(nH >= 1)) return { ok: false, tried, notes: c.id + ': a signal off the page' };
    }
    for (let i = 1; i < c.h.length; i++) if (!(c.h[i][0] > c.h[i - 1][0])) return { ok: false, tried, notes: c.id + ': signals not sorted' };
    for (const [kind, wn] of c.ir){
      if (!IRK[kind]) return { ok: false, tried, notes: c.id + ': unknown IR kind ' + kind };
      if (!(wn > 400 && wn < 4000)) return { ok: false, tried, notes: c.id + ': an IR band off the page' };
      if (kind === 'CO' && !(wn >= 1650 && wn <= 1790)) return { ok: false, tried, notes: c.id + ': C=O outside the dagger' };
      if (kind === 'OH' && !(wn >= 3200 && wn <= 3600)) return { ok: false, tried, notes: c.id + ': O-H outside the tongue' };
    }
    if (!c.ir.some(p => IRK[p[0]][3]) && !/nothing/i.test(c.clues[0])) return { ok: false, tried, notes: c.id + ': the IR neither names a landmark nor calls out an absence' };
    // the kill list: a candidate dies on the formula only if its formula really differs,
    // and dies on a later clue only if it really is an isomer of the answer
    const bys = [];
    for (const cand of c.cands){
      if (!(cand.by >= 0 && cand.by <= 3)) return { ok: false, tried, notes: c.id + ': ' + cand.name + ' has no clue that kills it' };
      if (!cand.why || cand.why.length < 20) return { ok: false, tried, notes: c.id + ': ' + cand.name + ' has no reason' };
      const same = sameFormula(formulaOf(cand.smiles), c.f);
      if (cand.by === 0 && same) return { ok: false, tried, notes: c.id + ': ' + cand.name + ' is an isomer, so the formula clue cannot kill it' };
      if (cand.by > 0 && !same) return { ok: false, tried, notes: c.id + ': ' + cand.name + ' is not an isomer, so it dies on the formula, not on clue ' + cand.by };
      bys.push(cand.by);
    }
    if (new Set(bys).size < 2) return { ok: false, tried, notes: c.id + ': one clue does all the killing' };
    if (clueList(c).length !== 4) return { ok: false, tried, notes: c.id + ': the clue list is not four long' };
  }
  if (CASES.filter(c => c.cands.every(x => x.by > 0)).length < 1) return { ok: false, tried, notes: 'no case where the formula proves nothing' };
  if (new Set(CASES.map(c => dou(c.f))).size < 4) return { ok: false, tried, notes: 'the cases do not span enough degrees of unsaturation' };
  // 3. generators
  const rng = makeRng(20260904);
  for (let k = 0; k < 260; k++){
    const g = k % 3 === 0 ? genCase(rng) : k % 3 === 1 ? genDou(rng) : genElim(rng);
    const oks = g.choices.filter(c => c.ok);
    if (oks.length !== 1 || g.choices.length !== 4) return { ok: false, tried, notes: g.kind + ': answer not unique or not four choices' };
    if (new Set(g.choices.map(c => c.smiles || c.text)).size !== 4) return { ok: false, tried, notes: g.kind + ': duplicate choices' };
    if (g.kind === 'case' && oks[0].smiles !== g.c.smiles) return { ok: false, tried, notes: 'case answer is not the case answer' };
    if (g.kind === 'dou' && Number(oks[0].text) !== dou(g.entry.f)) return { ok: false, tried, notes: 'dou answer mismatch' };
    if (g.kind === 'elim'){
      if (oks[0].cand.by !== g.clue) return { ok: false, tried, notes: 'elim answer is not killed by that clue' };
      if (g.c.cands.filter(x => x.by === g.clue).length !== 1) return { ok: false, tried, notes: 'elim clue kills more than one' };
    }
    tried++;
  }
  // 4. makeItem for the Summit
  const api = tinyApi(deps, 77);
  for (let k = 0; k < 240; k++){
    const it = makeItem(api); tried++;
    if (!it || !Array.isArray(it.choices) || it.choices.length !== 4) return { ok: false, tried, notes: 'makeItem: not four choices' };
    if (!(it.correct >= 0 && it.correct < 4)) return { ok: false, tried, notes: 'makeItem: bad correct index' };
    if (new Set(it.choices.map(c => c.smiles || c.text)).size !== 4) return { ok: false, tried, notes: 'makeItem: duplicate choices' };
    for (const c of it.choices) if (c.smiles && !smilesSane(c.smiles)) return { ok: false, tried, notes: 'makeItem: bad smiles ' + c.smiles };
    if (!it.coach || !it.stem) return { ok: false, tried, notes: 'makeItem: empty coach or stem' };
    if (it.home !== meta.id || !it.roots || !it.roots.length) return { ok: false, tried, notes: 'makeItem: home/roots' };
  }
  const a = makeItem(tinyApi(deps, 5)), b = makeItem(tinyApi(deps, 5));
  if (JSON.stringify(a) !== JSON.stringify(b)) return { ok: false, tried, notes: 'same seed gave a different item' };
  return { ok: true, tried, notes: CASES.length + ' cases; every answer matches its formula, every integration adds up, every kill checked against the real formulas' };
}
