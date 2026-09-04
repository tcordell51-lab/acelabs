// The Tree of Organic · Level 7 · Module 1: The tongue and the dagger (IR)
// ES module, no imports. Structures are drawn by the shell from SMILES; the
// spectra are SVG synthesized here from a curated peak table.

export const SMILES = [
  'CCCCO', 'CC(=O)O', 'CCC(C)=O', 'CCCC=O', 'COC(C)=O', 'CC(N)=O', 'CCCCN', 'CCNCC', 'CCN(CC)CC', 'CCCC#N',
  'CCCCC#C', 'CCCCC=C', 'Cc1ccccc1', 'CCOCC', 'CCCCCC', 'Oc1ccccc1', 'C1CCC(=O)CC1', 'CC(=O)c1ccccc1', 'CCCCCC(=O)O', 'c1ccc(C=O)cc1'
];

export const meta = {
  id: 't7-ir',
  level: 7,
  order: 1,
  needs3D: false,
  title: 'The tongue and the dagger',
  concept: 'IR: the tongue and the dagger',
  tagline: 'Three landmarks and one line carry ninety percent of the IR the DAT asks.',
  story: 'Infrared is not a memory test, it is three landmarks and a line. Read it right to left, higher wavenumber on the left. A broad rounded blob between 3200 and 3600 is an O-H, a hand holding a wet sponge. An N-H is its sharper twin near 3300: two little peaks for a primary amine, one for a secondary. A sharp strong spike near 1700 is a C=O, the loudest voice in the room. Anything near 2200 is a triple bond, a nitrile or an alkyne. The C-H line sits at 3000: just above it means sp2, just below it means sp3. Everything under 1500 is the fingerprint, so cross it out. Rule of thumb: tongue, dagger, triple flag. That is ninety percent of DAT IR.',
  moveName: 'Tongue, dagger, triple flag, then the 3000 line',
  move: [
    'Look at 3200 to 3600 first. Broad and rounded is O-H. A sharp twin near 3300 is N-H.',
    'Look near 1700. A sharp strong spike is C=O. If the O-H smears all the way down to 2500 beside it, that is a carboxylic acid.',
    'Look near 2200. Anything there is a triple bond, nitrile or alkyne.',
    'Find the 3000 line. C-H just above it is sp2, just below it is sp3. Two small twins near 2720 and 2820 are an aldehyde.',
    'Cross out everything below 1500.'
  ],
  trap: 'Careful: a carboxylic acid O-H is so broad it swallows the whole C-H region down to 2500; that smear plus a 1700 spike is an acid, not an alcohol sitting next to a ketone.',
  holdsUp: ['Unknown structure problems', 'Product checks after an oxidation', 'Amine versus alcohol', 'Aldehyde versus ketone'],
  drill: 'Booster OChem: Spectroscopy & Lab Techniques'
};

const SERIF = 'Georgia, "Times New Roman", serif';
const MONO = 'ui-monospace, "SF Mono", Menlo, monospace';
const ROOTS = ['l1-groups', 'l1-unsat'];

/* ------------------------------------------------------------------ */
/* The curated table. Every peak is a Gaussian dip: c = center (cm-1),  */
/* d = depth (% transmittance lost), w = full width. kind names the    */
/* bond; tier is the Alaina-packet tier (1 must know, 2 commit next,   */
/* 3 recognize). words is the spectrum in plain words for the Summit.   */
/* ------------------------------------------------------------------ */
const P = (c, d, w, kind, label, tier) => ({ c, d, w, kind, label, tier });
const IR = [
  { id: 'butanol', name: '1-butanol', group: 'alcohol', smiles: 'CCCCO',
    peaks: [P(3340, 58, 220, 'OH', 'O-H stretch, broad and rounded: the tongue', 1), P(2935, 38, 70, 'CHsp3', 'sp3 C-H, just below 3000', 3), P(1060, 40, 50, 'CO1', 'C-O stretch, in the fingerprint', 3), P(1460, 14, 30, 'fp', '', 3), P(1380, 9, 30, 'fp', '', 3)],
    words: 'a broad rounded band centered near 3350, sp3 C-H just below 3000, and nothing near 1700',
    read: 'A broad tongue near 3350 and no dagger near 1700. That is an alcohol. Everything below 1500 gets crossed out.' },
  { id: 'aceticacid', name: 'acetic acid', group: 'carboxylic acid', smiles: 'CC(=O)O',
    peaks: [P(3000, 66, 560, 'OHacid', 'O-H of an acid: so broad it swallows the C-H region down to 2500', 1), P(1715, 66, 40, 'CO', 'C=O stretch, sharp and strong: the dagger', 1), P(1290, 34, 60, 'CO1', 'C-O stretch, in the fingerprint', 3), P(1410, 16, 30, 'fp', '', 3)],
    words: 'a very broad band smeared from 3500 down to 2500 plus a sharp strong band at 1715',
    read: 'The tongue smears all the way down to 2500 and the dagger at 1715 sits right beside it. Tongue plus dagger is a carboxylic acid, every time.' },
  { id: 'butanone', name: '2-butanone', group: 'ketone', smiles: 'CCC(C)=O',
    peaks: [P(2965, 35, 75, 'CHsp3', 'sp3 C-H, just below 3000', 3), P(1715, 68, 40, 'CO', 'C=O stretch, sharp and strong: the dagger', 1), P(1360, 20, 30, 'fp', '', 3), P(1170, 24, 40, 'fp', '', 3)],
    words: 'a sharp strong band at 1715, sp3 C-H just below 3000, and nothing above 3000',
    read: 'A dagger at 1715 and no tongue. No N-H twin, no aldehyde twins near 2720 and 2820. A ketone by elimination.' },
  { id: 'butanal', name: 'butanal', group: 'aldehyde', smiles: 'CCCC=O',
    peaks: [P(2940, 34, 70, 'CHsp3', 'sp3 C-H, just below 3000', 3), P(2820, 18, 24, 'CHald', 'aldehyde C-H, the first of the twins', 2), P(2720, 18, 24, 'CHald', 'aldehyde C-H, the second twin near 2720', 2), P(1725, 66, 40, 'CO', 'C=O stretch of an aldehyde: the dagger', 1), P(1460, 11, 30, 'fp', '', 3), P(1390, 9, 30, 'fp', '', 3)],
    words: 'a sharp strong band at 1725 plus two small twin peaks near 2820 and 2720',
    read: 'A dagger at 1725 plus the small twins near 2820 and 2720. Those twins are the aldehyde flag; without them this would read as a ketone.' },
  { id: 'methylacetate', name: 'methyl acetate', group: 'ester', smiles: 'COC(C)=O',
    peaks: [P(2960, 28, 70, 'CHsp3', 'sp3 C-H, just below 3000', 3), P(1740, 68, 40, 'CO', 'C=O stretch of an ester, a little high near 1740: the dagger', 1), P(1240, 48, 50, 'CO1', 'C-O stretch, strong, the ester tell', 3), P(1050, 30, 40, 'CO1', 'C-O stretch, second band', 3), P(1370, 18, 30, 'fp', '', 3)],
    words: 'a sharp strong band near 1740, a strong band near 1240, and nothing above 3000',
    read: 'A dagger sitting a little high at 1740, no tongue, and a strong C-O band near 1240. An ester. Ketone versus ester is subtle; the strong C-O is the tell.' },
  { id: 'acetamide', name: 'acetamide', group: 'amide', smiles: 'CC(N)=O',
    peaks: [P(3350, 40, 90, 'NH2', 'N-H stretch, first of the amide twins', 2), P(3180, 38, 90, 'NH2', 'N-H stretch, second twin', 2), P(2940, 16, 60, 'CHsp3', 'sp3 C-H, just below 3000', 3), P(1660, 62, 45, 'CO', 'C=O stretch of an amide, slid down to about 1660: the dagger', 1), P(1620, 38, 40, 'NHbend', 'N-H bend, in the fingerprint', 3), P(1400, 18, 30, 'fp', '', 3)],
    words: 'two medium N-H bands near 3350 and 3180 plus a strong band near 1660',
    read: 'An N-H twin up near 3350 and 3180 next to a dagger that has slid down to 1660. N-H plus a low C=O is an amide.' },
  { id: 'butylamine', name: 'butylamine', group: 'primary amine', smiles: 'CCCCN',
    peaks: [P(3380, 28, 55, 'NH2', 'N-H stretch, one of the twins of a primary amine', 2), P(3300, 30, 55, 'NH2', 'N-H stretch, the second twin', 2), P(2930, 40, 70, 'CHsp3', 'sp3 C-H, just below 3000', 3), P(1600, 16, 35, 'NHbend', 'N-H bend, in the fingerprint', 3), P(1470, 11, 30, 'fp', '', 3)],
    words: 'two sharp medium peaks near 3380 and 3300, sp3 C-H just below 3000, and nothing near 1700',
    read: 'Two sharp little peaks near 3380 and 3300, not a rounded tongue. Two N-H bonds, two peaks: a primary amine. No dagger.' },
  { id: 'diethylamine', name: 'diethylamine', group: 'secondary amine', smiles: 'CCNCC',
    peaks: [P(3300, 26, 60, 'NH', 'N-H stretch, one peak: a secondary amine', 2), P(2965, 40, 75, 'CHsp3', 'sp3 C-H, just below 3000', 3), P(1460, 11, 30, 'fp', '', 3), P(1130, 20, 40, 'fp', '', 3)],
    words: 'one sharp medium peak near 3300, sp3 C-H just below 3000, and nothing near 1700',
    read: 'One sharp N-H peak near 3300, no rounded tongue, no dagger. One N-H bond, one peak: a secondary amine.' },
  { id: 'triethylamine', name: 'triethylamine', group: 'tertiary amine', smiles: 'CCN(CC)CC',
    peaks: [P(2970, 42, 75, 'CHsp3', 'sp3 C-H, just below 3000', 3), P(1460, 13, 30, 'fp', '', 3), P(1200, 18, 40, 'fp', '', 3), P(1070, 20, 40, 'fp', '', 3)],
    words: 'only sp3 C-H just below 3000 with nothing above 3000, nothing near 2200, and nothing near 1700',
    read: 'No tongue, no twin, no dagger, no triple flag. A tertiary amine has no N-H bond to stretch, so it hides in IR. The formula would have to tell you.' },
  { id: 'butanenitrile', name: 'butanenitrile', group: 'nitrile', smiles: 'CCCC#N',
    peaks: [P(2950, 32, 70, 'CHsp3', 'sp3 C-H, just below 3000', 3), P(2245, 40, 26, 'CN', 'C to N triple bond, medium and sharp near 2245: the triple flag', 2), P(1460, 11, 30, 'fp', '', 3)],
    words: 'a medium sharp band near 2245, sp3 C-H just below 3000, and nothing near 1700 or above 3000',
    read: 'A clean medium spike near 2245 in the empty middle of the spectrum. That region is only triple bonds; strong and sharp means nitrile.' },
  { id: 'hexyne', name: '1-hexyne', group: 'terminal alkyne', smiles: 'CCCCC#C',
    peaks: [P(3310, 42, 34, 'CHsp', 'sp C-H of a terminal alkyne, thin and sharp near 3300', 2), P(2950, 30, 70, 'CHsp3', 'sp3 C-H, just below 3000', 3), P(2120, 16, 28, 'CC3', 'C to C triple bond, weak near 2120: the triple flag', 2), P(1460, 9, 30, 'fp', '', 3), P(630, 30, 50, 'fp', '', 3)],
    words: 'a thin sharp peak near 3310, a weak band near 2120, and sp3 C-H just below 3000',
    read: 'A thin sharp peak at 3310 (too thin to be a tongue) plus a weak flag at 2120. A terminal alkyne. An internal alkyne would lose the 3300 peak.' },
  { id: 'hexene', name: '1-hexene', group: 'alkene', smiles: 'CCCCC=C',
    peaks: [P(3080, 20, 30, 'CHsp2', 'sp2 C-H, just above 3000', 3), P(2930, 38, 70, 'CHsp3', 'sp3 C-H, just below 3000', 3), P(1640, 22, 35, 'C=C', 'C=C stretch, medium near 1640', 2), P(990, 26, 30, 'fp', '', 3), P(910, 34, 30, 'fp', '', 3)],
    words: 'C-H just above 3000 and just below it, a medium band near 1640, and nothing near 1700 or above 3200',
    read: 'C-H on both sides of the 3000 line and a medium C=C near 1640. No tongue, no dagger. An alkene.' },
  { id: 'toluene', name: 'toluene', group: 'aromatic ring', smiles: 'Cc1ccccc1',
    peaks: [P(3030, 26, 40, 'CHsp2', 'sp2 C-H of the ring, just above 3000', 3), P(2920, 22, 60, 'CHsp3', 'sp3 C-H of the methyl, just below 3000', 3), P(1600, 24, 30, 'arene', 'ring stretch near 1600, half of the aromatic pair', 2), P(1495, 30, 30, 'arene', 'ring stretch near 1500, the other half of the pair', 2), P(1460, 14, 30, 'fp', '', 3), P(730, 44, 30, 'fp', '', 3), P(695, 40, 30, 'fp', '', 3)],
    words: 'C-H on both sides of 3000, a pair of medium bands near 1600 and 1500, and nothing near 1700',
    read: 'C-H just above 3000 and just below it, plus the ring pair near 1600 and 1500. Both sides of the line together is aromatic plus alkyl.' },
  { id: 'ether', name: 'diethyl ether', group: 'ether', smiles: 'CCOCC',
    peaks: [P(2970, 42, 75, 'CHsp3', 'sp3 C-H, just below 3000', 3), P(1120, 50, 60, 'CO1', 'C-O stretch, strong near 1120, the only loud thing here', 3), P(1380, 16, 30, 'fp', '', 3)],
    words: 'sp3 C-H just below 3000, one strong band near 1120, and nothing above 3000 or near 1700',
    read: 'No tongue, no dagger, no flag. One strong C-O down at 1120 in the fingerprint. An ether keeps its oxygen quiet.' },
  { id: 'hexane', name: 'hexane', group: 'alkane', smiles: 'CCCCCC',
    peaks: [P(2930, 50, 80, 'CHsp3', 'sp3 C-H, just below 3000, always there', 3), P(1465, 22, 30, 'fp', '', 3), P(1380, 14, 30, 'fp', '', 3), P(725, 8, 30, 'fp', '', 3)],
    words: 'only sp3 C-H just below 3000 and a little fingerprint noise',
    read: 'Only the sp3 C-H just below 3000 and some fingerprint noise. Nothing above 3000, nothing at 1700. An alkane.' },
  { id: 'phenol', name: 'phenol', group: 'phenol', smiles: 'Oc1ccccc1',
    peaks: [P(3350, 55, 230, 'OH', 'O-H stretch, broad and rounded: the tongue', 1), P(3040, 18, 40, 'CHsp2', 'sp2 C-H of the ring, just above 3000', 3), P(1600, 30, 30, 'arene', 'ring stretch near 1600', 2), P(1500, 34, 30, 'arene', 'ring stretch near 1500', 2), P(1230, 40, 45, 'CO1', 'C-O stretch, in the fingerprint', 3), P(750, 40, 30, 'fp', '', 3), P(690, 34, 30, 'fp', '', 3)],
    words: 'a broad rounded band near 3350, C-H only above 3000, the ring pair near 1600 and 1500, and nothing near 1700',
    read: 'A tongue at 3350, C-H only above 3000, and the ring pair. An O-H on an aromatic ring: a phenol.' },
  { id: 'cyclohexanone', name: 'cyclohexanone', group: 'ketone', smiles: 'C1CCC(=O)CC1',
    peaks: [P(2935, 42, 70, 'CHsp3', 'sp3 C-H, just below 3000', 3), P(1715, 70, 40, 'CO', 'C=O stretch, sharp and strong: the dagger', 1), P(1450, 14, 30, 'fp', '', 3), P(1120, 18, 40, 'fp', '', 3)],
    words: 'a sharp strong band at 1715 with sp3 C-H just below 3000 and nothing above 3000',
    read: 'Dagger at 1715, no tongue, no twins, no N-H. A ketone. The ring does not change the reading.' },
  { id: 'acetophenone', name: 'acetophenone', group: 'ketone', smiles: 'CC(=O)c1ccccc1',
    peaks: [P(3060, 14, 40, 'CHsp2', 'sp2 C-H of the ring, just above 3000', 3), P(2960, 12, 60, 'CHsp3', 'sp3 C-H of the methyl, just below 3000', 3), P(1685, 66, 40, 'CO', 'C=O stretch, sharp and strong, a little low because the ring shares its electrons: the dagger', 1), P(1600, 30, 30, 'arene', 'ring stretch near 1600', 2), P(1450, 22, 30, 'arene', 'ring stretch near 1450', 2), P(1260, 34, 40, 'fp', '', 3), P(760, 38, 30, 'fp', '', 3), P(690, 34, 30, 'fp', '', 3)],
    words: 'a sharp strong band near 1685, C-H on both sides of 3000, the ring pair near 1600 and 1450, and no broad band',
    read: 'A dagger near 1685 (a ring next door drags it a little lower) with no tongue and no twins. A ketone on an aromatic ring.' },
  { id: 'hexanoicacid', name: 'hexanoic acid', group: 'carboxylic acid', smiles: 'CCCCCC(=O)O',
    peaks: [P(2980, 64, 560, 'OHacid', 'O-H of an acid: so broad it swallows the C-H region down to 2500', 1), P(2930, 30, 70, 'CHsp3', 'sp3 C-H, riding on top of the acid smear', 3), P(1710, 68, 40, 'CO', 'C=O stretch, sharp and strong: the dagger', 1), P(1280, 30, 60, 'CO1', 'C-O stretch, in the fingerprint', 3), P(1410, 14, 30, 'fp', '', 3)],
    words: 'a very broad band smeared from 3400 down to 2500 with the C-H riding on top of it, plus a sharp strong band at 1710',
    read: 'The acid smear from 3400 down to 2500 with the C-H sitting on top of it, and the dagger at 1710. Tongue plus dagger: carboxylic acid.' },
  { id: 'benzaldehyde', name: 'benzaldehyde', group: 'aldehyde', smiles: 'c1ccc(C=O)cc1',
    peaks: [P(3060, 16, 40, 'CHsp2', 'sp2 C-H of the ring, just above 3000', 3), P(2820, 16, 24, 'CHald', 'aldehyde C-H, the first of the twins', 2), P(2730, 16, 24, 'CHald', 'aldehyde C-H, the second twin', 2), P(1700, 68, 40, 'CO', 'C=O stretch of an aldehyde on a ring: the dagger', 1), P(1600, 26, 30, 'arene', 'ring stretch near 1600', 2), P(1585, 20, 30, 'arene', 'ring stretch, the partner band', 2), P(1200, 30, 40, 'fp', '', 3), P(750, 40, 30, 'fp', '', 3), P(690, 36, 30, 'fp', '', 3)],
    words: 'a sharp strong band near 1700, two small twin peaks near 2820 and 2730, C-H only above 3000, and the ring pair',
    read: 'Dagger at 1700, the aldehyde twins near 2820 and 2730, and C-H only above 3000 with the ring pair. An aldehyde on a benzene ring.' }
];

const LANDMARK = new Set(['OH', 'OHacid', 'NH2', 'NH', 'CO', 'CN', 'CC3', 'CHsp', 'CHald', 'CHsp2', 'arene', 'C=C']);
const TIER_NAME = { 1: 'Tier 1, must know', 2: 'Tier 2, commit next', 3: 'Tier 3, recognize' };
const GROUP_TELL = {
  'alcohol': 'A broad rounded tongue at 3200 to 3600 with no dagger near 1700 is an alcohol.',
  'carboxylic acid': 'The acid is the tongue that smears all the way down to 2500 with the 1700 dagger right beside it.',
  'ketone': 'A sharp dagger near 1715 with no tongue, no N-H twin and no aldehyde twins near 2720 and 2820 is a ketone.',
  'aldehyde': 'A dagger near 1725 plus the small twin peaks near 2720 and 2820 is an aldehyde.',
  'ester': 'A dagger a little high near 1740, a strong C-O band near 1250 and no tongue is an ester.',
  'amide': 'An N-H twin near 3350 and 3180 sitting next to a dagger that has slid down to about 1660 is an amide.',
  'primary amine': 'Two sharp N-H peaks near 3300 and 3380 with no dagger is a primary amine.',
  'secondary amine': 'One sharp N-H peak near 3300 with no dagger is a secondary amine.',
  'tertiary amine': 'No tongue, no N-H, no dagger, nothing at 2200: a tertiary amine has no N-H to stretch, so it hides.',
  'nitrile': 'A medium sharp peak near 2245 is the triple flag for a nitrile.',
  'terminal alkyne': 'A thin sharp peak near 3300 plus a weak flag near 2120 is a terminal alkyne.',
  'alkene': 'C-H just above 3000 plus a medium C=C near 1640 is an alkene.',
  'aromatic ring': 'C-H on both sides of 3000 plus the ring pair near 1600 and 1500 is an aromatic ring.',
  'ether': 'No tongue, no dagger, only sp3 C-H and one strong C-O band near 1120 is an ether.',
  'alkane': 'Only sp3 C-H just below 3000 and fingerprint noise: an alkane.',
  'phenol': 'A tongue near 3350 together with sp2 C-H above 3000 and the ring pair near 1600 and 1500 is a phenol.'
};
// what each group must and must not show, so the table can be checked instead of trusted
const REQ = {
  'alcohol': { has: ['OH'], not: ['CO', 'OHacid', 'CHsp2'] },
  'carboxylic acid': { has: ['OHacid', 'CO'], not: ['NH', 'NH2'] },
  'ketone': { has: ['CO'], not: ['OH', 'OHacid', 'CHald', 'NH2', 'NH'] },
  'aldehyde': { has: ['CO', 'CHald'], not: ['OH', 'OHacid'] },
  'ester': { has: ['CO', 'CO1'], not: ['OH', 'OHacid', 'CHald', 'NH2', 'NH'] },
  'amide': { has: ['CO'], any: ['NH2', 'NH'], not: ['OH', 'OHacid'] },
  'primary amine': { has: ['NH2'], not: ['CO', 'OH'] },
  'secondary amine': { has: ['NH'], not: ['CO', 'OH', 'NH2'] },
  'tertiary amine': { has: ['CHsp3'], not: ['NH', 'NH2', 'CO', 'OH', 'OHacid', 'CN'] },
  'nitrile': { has: ['CN'], not: ['CO', 'OH'] },
  'terminal alkyne': { has: ['CHsp', 'CC3'], not: ['CO', 'OH'] },
  'alkene': { has: ['CHsp2', 'C=C'], not: ['arene', 'CO', 'OH'] },
  'aromatic ring': { has: ['CHsp2', 'arene'], not: ['OH', 'CO', 'C=C'] },
  'ether': { has: ['CO1'], not: ['OH', 'CO', 'OHacid'] },
  'alkane': { has: ['CHsp3'], not: ['OH', 'OHacid', 'CO', 'NH', 'NH2', 'CN', 'CC3', 'CHsp2', 'CO1'] },
  'phenol': { has: ['OH', 'arene'], not: ['CO', 'OHacid'] }
};
function sigOf(m){ return [...new Set(m.peaks.filter(p => LANDMARK.has(p.kind)).map(p => p.kind))].sort().join(','); }

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
function kindColor(C, kind){
  if (kind === 'OH' || kind === 'OHacid' || kind === 'NH' || kind === 'NH2') return C.blue;
  if (kind === 'CO') return C.coral;
  if (kind === 'CN' || kind === 'CC3' || kind === 'CHsp') return C.amber;
  if (kind === 'arene' || kind === 'C=C') return C.green;
  if (kind === 'CHald') return C.goldhi;
  return C.grey;
}

/* ------------------------------------------------------------------ */
/* the spectrum: transmittance synthesized from the peak table          */
/* ------------------------------------------------------------------ */
function irSamples(peaks){
  const N = 700, out = [];
  for (let i = 0; i <= N; i++){
    const wn = 4000 - 3500 * i / N;
    let T = 95;
    for (const p of peaks){ const s = p.w / 2; T -= p.d * Math.exp(-((wn - p.c) * (wn - p.c)) / (2 * s * s)); }
    T -= 0.6 * Math.sin(wn / 41) + 0.4 * Math.sin(wn / 17.3);
    if (wn < 1500) T -= 2 + 1.6 * Math.sin(wn / 23) + 1.1 * Math.sin(wn / 9.1);
    out.push([wn, Math.max(3, Math.min(99, T))]);
  }
  return out;
}
// o: { mini, onHover(peak|null), label }. Returns { svg, focus(peak|null) } so chips can light a band too.
function drawIR(api, mol, o){
  o = o || {};
  const C = api.colors, svg = api.svg, mini = !!o.mini;
  const W = mini ? 300 : 760, H = mini ? 130 : 322;
  const L = mini ? 10 : 62, R = mini ? 292 : 738, T = mini ? 10 : 52, B = mini ? 104 : 266;
  const S = mini ? T : 14;   // the label strip above the plot (full size only)
  const x = wn => L + (4000 - wn) / 3500 * (R - L);
  const y = t => B - (t / 100) * (B - T);
  const root = svg('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': o.label || ('IR spectrum of ' + mol.name), style: { width: '100%', height: 'auto', display: 'block' } });
  const font = mini ? 9 : 12;
  // regions
  const reg = (a, b, color, op) => svg('rect', { x: x(a).toFixed(1), y: S, width: (x(b) - x(a)).toFixed(1), height: B - S, fill: color, 'fill-opacity': op });
  root.append(reg(3650, 3150, C.blue, mini ? .09 : .11), reg(2280, 2080, C.amber, mini ? .09 : .11), reg(1790, 1640, C.coral, mini ? .12 : .14), reg(1500, 500, C.grey, mini ? .14 : .17));
  // cross out the fingerprint
  const fx0 = x(1500), fx1 = x(500);
  root.append(svg('line', { x1: fx0, y1: T, x2: fx1, y2: B, stroke: C.grey, 'stroke-width': mini ? 1 : 1.5, 'stroke-opacity': .5 }), svg('line', { x1: fx0, y1: B, x2: fx1, y2: T, stroke: C.grey, 'stroke-width': mini ? 1 : 1.5, 'stroke-opacity': .5 }));
  if (!mini){
    root.append(svg('text', { x: ((fx0 + fx1) / 2).toFixed(1), y: S + 22, fill: C.ink2, 'font-family': SERIF, 'font-size': 15, 'text-anchor': 'middle', text: 'fingerprint: cross it out' }));
    const tag = (a, b, t, color) => root.append(svg('text', { x: ((x(a) + x(b)) / 2).toFixed(1), y: S + 22, fill: color, 'font-family': SERIF, 'font-size': 15, 'text-anchor': 'middle', text: t }));
    tag(3650, 3150, 'the tongue', C.blue); tag(2280, 2080, 'triple flag', C.amber); tag(1790, 1640, 'the dagger', C.coral);
  }
  // the 3000 line
  root.append(svg('line', { x1: x(3000), y1: T, x2: x(3000), y2: B, stroke: C.ink3, 'stroke-width': 1, 'stroke-dasharray': '4 4' }));
  if (!mini){
    root.append(svg('text', { x: x(3000) - 5, y: B - 8, fill: C.ink3, 'font-family': MONO, 'font-size': 10, 'text-anchor': 'end', text: 'sp2 side' }));
    root.append(svg('text', { x: x(3000) + 5, y: B - 8, fill: C.ink3, 'font-family': MONO, 'font-size': 10, text: 'sp3 side' }));
  }
  // axes
  root.append(svg('rect', { x: L, y: T, width: R - L, height: B - T, fill: 'none', stroke: C.line, 'stroke-width': 1 }));
  const ticks = mini ? [4000, 3000, 2000, 1500, 1000] : [4000, 3500, 3000, 2500, 2000, 1500, 1000, 500];
  for (const t of ticks){
    root.append(svg('line', { x1: x(t), y1: B, x2: x(t), y2: B + 4, stroke: C.ink3 }));
    root.append(svg('text', { x: x(t), y: B + (mini ? 13 : 18), fill: C.ink3, 'font-family': MONO, 'font-size': font, 'text-anchor': 'middle', text: String(t) }));
  }
  if (!mini){
    for (const t of [0, 25, 50, 75, 100]) root.append(svg('text', { x: L - 6, y: y(t) + 4, fill: C.ink3, 'font-family': MONO, 'font-size': 10, 'text-anchor': 'end', text: String(t) }));
    root.append(svg('text', { x: 14, y: (T + B) / 2, fill: C.ink3, 'font-family': MONO, 'font-size': 10, 'text-anchor': 'middle', transform: `rotate(-90 14 ${(T + B) / 2})`, text: '% transmittance' }));
    root.append(svg('text', { x: (L + R) / 2, y: H - 6, fill: C.ink3, 'font-family': MONO, 'font-size': 10, 'text-anchor': 'middle', text: 'wavenumber, read right to left: 4000 on the left, 500 on the right' }));
  }
  // the curve
  const pts = irSamples(mol.peaks);
  const d = pts.map((p, i) => (i ? 'L' : 'M') + x(p[0]).toFixed(1) + ',' + y(p[1]).toFixed(1)).join(' ');
  const gHi = svg('g'); root.append(gHi);
  root.append(svg('path', { d, fill: 'none', stroke: C.ink, 'stroke-width': mini ? 1.4 : 2, 'stroke-linejoin': 'round' }));
  // highlight polygons and hit areas for labeled peaks
  const hi = new Map();
  const labeled = mol.peaks.filter(p => p.label);
  const gHit = svg('g'); root.append(gHit);
  for (const p of labeled){
    const lo = p.c - p.w * 0.9, hiw = p.c + p.w * 0.9;
    const seg = pts.filter(q => q[0] >= lo && q[0] <= hiw);
    if (!seg.length) continue;
    const poly = 'M' + x(seg[0][0]).toFixed(1) + ',' + y(95).toFixed(1) + ' ' + seg.map(q => 'L' + x(q[0]).toFixed(1) + ',' + y(q[1]).toFixed(1)).join(' ') + ' L' + x(seg[seg.length - 1][0]).toFixed(1) + ',' + y(95).toFixed(1) + ' Z';
    const fill = svg('path', { d: poly, fill: kindColor(C, p.kind), 'fill-opacity': 0, style: { transition: api.reduced ? 'none' : 'fill-opacity .2s ease' } });
    gHi.append(fill); hi.set(p, fill);
    if (!mini && o.onHover){
      const span = Math.max(p.w * 1.2, 90);
      const hit = svg('rect', { x: x(p.c + span / 2).toFixed(1), y: T, width: (x(p.c - span / 2) - x(p.c + span / 2)).toFixed(1), height: B - T, fill: 'transparent', style: { cursor: 'help' } });
      hit.addEventListener('mouseenter', () => o.onHover(p)); hit.addEventListener('mouseleave', () => o.onHover(null)); hit.addEventListener('click', () => o.onHover(p));
      gHit.append(hit);
    }
  }
  function focus(p){ for (const [q, f] of hi) f.setAttribute('fill-opacity', q === p ? .45 : 0); }
  return { svg: root, focus };
}

/* ------------------------------------------------------------------ */
/* generators (pure: rng in, item out). The answer is the table entry.  */
/* ------------------------------------------------------------------ */
function distinctBy(rng, pool, keyFn, n, used){
  const out = []; used = new Set(used || []);
  for (const m of shuffleWith(rng, pool)){ const k = keyFn(m); if (used.has(k)) continue; used.add(k); out.push(m); if (out.length === n) break; }
  return out;
}
// which functional group: the answer molecule's group; distractors are groups whose landmarks differ
function genFG(rng){
  const m = pickWith(rng, IR);
  const pool = IR.filter(x => x.group !== m.group && sigOf(x) !== sigOf(m));
  const others = distinctBy(rng, pool, x => x.group, 3, [m.group]);
  const choices = shuffleWith(rng, [{ text: m.group, ok: true, mol: m }, ...others.map(x => ({ text: x.group, ok: false, mol: x }))]);
  return { kind: 'fg', mol: m, choices };
}
// which molecule matches: four structures with pairwise different landmark signatures
function genMatch(rng){
  const m = pickWith(rng, IR);
  const pool = IR.filter(x => x.id !== m.id && sigOf(x) !== sigOf(m));
  const others = distinctBy(rng, pool, sigOf, 3, [sigOf(m)]);
  const choices = shuffleWith(rng, [{ smiles: m.smiles, text: '', ok: true, mol: m }, ...others.map(x => ({ smiles: x.smiles, text: '', ok: false, mol: x }))]);
  return { kind: 'match', mol: m, choices };
}
// which spectrum is the X: four spectra, different groups, different signatures
function genWhich(rng){
  const m = pickWith(rng, IR);
  const pool = IR.filter(x => x.group !== m.group && sigOf(x) !== sigOf(m));
  const others = [], usedSig = new Set([sigOf(m)]), usedGroup = new Set([m.group]);
  for (const x of shuffleWith(rng, pool)){ if (usedSig.has(sigOf(x)) || usedGroup.has(x.group)) continue; usedSig.add(sigOf(x)); usedGroup.add(x.group); others.push(x); if (others.length === 3) break; }
  const choices = shuffleWith(rng, [{ mol: m, ok: true }, ...others.map(x => ({ mol: x, ok: false }))]);
  return { kind: 'which', mol: m, choices };
}
function withArticle(g){ return (/^[aeiou]/.test(g) ? 'an ' : 'a ') + g; }

/* ------------------------------------------------------------------ */
/* makeItem for the Summit                                              */
/* ------------------------------------------------------------------ */
function toSummit(g){
  if (g.kind === 'fg'){
    return { stem: 'An IR spectrum shows ' + g.mol.words + '. Which functional group is present?', sub: null, reagent: null, prod: null,
      choices: g.choices.map(c => ({ text: c.text, smiles: null })), correct: g.choices.findIndex(c => c.ok), coach: GROUP_TELL[g.mol.group], home: meta.id, roots: ROOTS, source: 'generated' };
  }
  return { stem: 'An IR spectrum shows ' + g.mol.words + '. Which structure fits?', sub: null, reagent: null, prod: null,
    choices: g.choices.map(c => ({ text: '', smiles: c.smiles })), correct: g.choices.findIndex(c => c.ok), coach: GROUP_TELL[g.mol.group], home: meta.id, roots: ROOTS, source: 'generated' };
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
  const g = api.rng() < 0.5 ? genFG(api.rng) : genMatch(api.rng);
  return toSummit(g);
}

/* ------------------------------------------------------------------ */
/* mount                                                                */
/* ------------------------------------------------------------------ */
export function mount(slots, api){
  const C = api.colors, el = api.el;

  /* ---------- VISUAL: pick a molecule, read its spectrum ---------- */
  let cur = IR[0], drawn = null;
  const chips = el('div', { class: 'controls', style: { marginTop: '0' } });
  const head = el('div', { style: { display: 'flex', gap: '16px', alignItems: 'stretch', flexWrap: 'wrap', margin: '12px 0 8px' } });
  const molCard = el('div', { style: { width: '210px', flex: 'none', background: 'rgba(255,255,255,.02)', border: '1px solid ' + C.line, borderRadius: '10px', padding: '6px' } });
  const readCard = el('div', { style: { flex: '1 1 300px', minWidth: '0' } });
  const nameEl = el('div', { style: { fontFamily: SERIF, fontSize: '22px', color: C.ink } });
  const groupEl = el('div', { style: { fontFamily: MONO, fontSize: '11px', letterSpacing: '.14em', textTransform: 'uppercase', color: C.gold, margin: '2px 0 8px' } });
  const readEl = el('p', { style: { margin: '0 0 8px', fontSize: '16px', color: C.ink } });
  const capt = el('div', { style: { fontFamily: SERIF, fontSize: '15px', color: C.goldhi, minHeight: '2.6em', borderLeft: '3px solid ' + C.gold, paddingLeft: '10px' } });
  readCard.append(nameEl, groupEl, readEl, capt);
  head.append(molCard, readCard);
  const stage = el('div', {});
  const peakRow = el('div', { class: 'controls' });
  const legend = el('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '8px', marginTop: '12px', fontSize: '13px', color: C.ink2 } });
  const tierBox = (tier, title, text, color) => el('div', { style: { border: '1px solid ' + C.line, borderLeft: '3px solid ' + color, borderRadius: '8px', padding: '8px 10px' } },
    el('div', { style: { fontFamily: MONO, fontSize: '10px', letterSpacing: '.14em', textTransform: 'uppercase', color }, text: 'Tier ' + tier + ' · ' + title }), el('div', { text }));
  legend.append(
    tierBox(1, 'must know', 'The tongue: O-H, broad and rounded, 3200 to 3600. The dagger: C=O, sharp and strong, near 1715.', C.gold),
    tierBox(2, 'commit next', 'N-H twin near 3300 (two peaks primary, one secondary). Triple flag 2100 to 2260. Aromatic: C-H above 3000 plus the 1600 and 1500 pair. Aldehyde twins near 2720 and 2820.', C.amber),
    tierBox(3, 'recognize', 'sp3 C-H just below 3000 is always there. Below 1500 is the fingerprint: cross it out.', C.grey));
  const hint = el('div', { style: { fontFamily: MONO, fontSize: '12px', color: C.ink3, marginTop: '8px' }, text: 'Hover or tap a band on the spectrum to name it. The chips below the plot do the same by keyboard.' });
  slots.visual.append(chips, head, stage, hint, peakRow, legend);

  function describe(p){
    if (!p){ capt.textContent = 'Tongue, dagger, triple flag, then the 3000 line. Hover a band.'; if (drawn) drawn.focus(null); return; }
    capt.textContent = p.c + ': ' + p.label + '. ' + TIER_NAME[p.tier] + '.';
    if (drawn) drawn.focus(p);
  }
  function show(m){
    cur = m;
    for (const b of chips.children) b.setAttribute('aria-pressed', String(b.dataset.id === m.id));
    clear(molCard); api.drawSmiles(molCard, m.smiles, { width: 200, height: 130, label: m.name });
    nameEl.textContent = m.name; groupEl.textContent = m.group; readEl.textContent = m.read;
    clear(stage); drawn = drawIR(api, m, { onHover: describe }); stage.append(drawn.svg);
    clear(peakRow);
    peakRow.append(el('span', { style: { fontFamily: MONO, fontSize: '11px', color: C.ink3, letterSpacing: '.12em', textTransform: 'uppercase' }, text: 'bands' }));
    for (const p of m.peaks.filter(q => q.label)){
      const b = el('button', { type: 'button', class: 'chip', text: p.c + ' ' + (p.kind === 'OH' ? 'O-H' : p.kind === 'OHacid' ? 'O-H acid' : p.kind === 'CO' ? 'C=O' : p.kind === 'CO1' ? 'C-O' : p.kind === 'CN' ? 'C=N triple' : p.kind === 'CC3' ? 'C=C triple' : p.kind === 'CHsp' ? 'sp C-H' : p.kind === 'CHsp2' ? 'sp2 C-H' : p.kind === 'CHsp3' ? 'sp3 C-H' : p.kind === 'CHald' ? 'aldehyde C-H' : p.kind === 'NH2' || p.kind === 'NH' ? 'N-H' : p.kind === 'NHbend' ? 'N-H bend' : p.kind === 'arene' ? 'ring' : p.kind),
        onfocus: () => describe(p), onmouseenter: () => describe(p), onclick: () => describe(p), onblur: () => describe(null), onmouseleave: () => describe(null), style: { borderLeftColor: kindColor(C, p.kind), borderLeftWidth: '3px' } });
      b.textContent = b.textContent.replace('C=N triple', 'C to N triple').replace('C=C triple', 'C to C triple');
      peakRow.append(b);
    }
    describe(null);
  }
  for (const m of IR) chips.append(el('button', { type: 'button', class: 'chip', text: m.name, dataset: { id: m.id }, 'aria-pressed': 'false', onclick: () => show(m) }));
  show(cur);

  /* ---------- YOU TRY: generated items alternate with bank items ---------- */
  const bank = api.bank && api.bank.items ? api.bank.items(meta.id) : [];
  let turn = 0;
  function generated(){
    const k = turn % 3;
    if (k === 0){
      const g = genFG(api.rng);
      const node = drawIR(api, g.mol, { label: 'an IR spectrum' }).svg;
      return { prompt: 'Which functional group is present?', node, choices: g.choices.map(c => ({ text: c.text, ok: c.ok })), coach: GROUP_TELL[g.mol.group] };
    }
    if (k === 1){
      const g = genMatch(api.rng);
      const node = drawIR(api, g.mol, { label: 'an IR spectrum' }).svg;
      return { prompt: 'Which molecule matches this IR?', node, choices: g.choices.map(c => ({ smiles: c.smiles, label: c.mol.name, ok: c.ok })), coach: GROUP_TELL[g.mol.group] };
    }
    const g = genWhich(api.rng);
    return { prompt: 'Which spectrum is ' + withArticle(g.mol.group) + '?', node: null, choices: g.choices.map(c => ({ node: drawIR(api, c.mol, { mini: true, label: 'a small IR spectrum' }).svg, ok: c.ok })), coach: GROUP_TELL[g.mol.group] };
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
      const bt = el('button', { class: 'opt', type: 'button', 'aria-label': c.text || c.label || ('choice ' + 'ABCDE'[i]), onclick(){ if (done) return; picked = i; btns.forEach((x, j) => x.classList.toggle('picked', j === i)); check.disabled = false; } },
        el('span', { class: 'k', text: 'ABCDE'[i] }), body);
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
  // 1. the table proves itself: every group shows what it must and hides what it must not
  if (IR.length < 14) return { ok: false, tried, notes: 'table too small' };
  for (const m of IR){
    if (!smilesSane(m.smiles) || !SMILES.includes(m.smiles)) return { ok: false, tried, notes: m.id + ': smiles not listed or not sane' };
    if (!GROUP_TELL[m.group] || !REQ[m.group]) return { ok: false, tried, notes: m.id + ': unknown group ' + m.group };
    const kinds = new Set(m.peaks.map(p => p.kind));
    const r = REQ[m.group];
    for (const k of r.has || []) if (!kinds.has(k)) return { ok: false, tried, notes: m.id + ' lacks ' + k };
    for (const k of r.not || []) if (kinds.has(k)) return { ok: false, tried, notes: m.id + ' must not show ' + k };
    if (r.any && !r.any.some(k => kinds.has(k))) return { ok: false, tried, notes: m.id + ' lacks one of ' + r.any.join('/') };
    if (!m.words || !m.read) return { ok: false, tried, notes: m.id + ' missing words/read' };
    for (const p of m.peaks){ if (!(p.c > 400 && p.c < 4000) || !(p.d > 0 && p.d < 100) || !(p.w > 0)) return { ok: false, tried, notes: m.id + ' bad peak' }; if (p.kind === 'OH' && !(p.c >= 3200 && p.c <= 3600)) return { ok: false, tried, notes: m.id + ' O-H off the tongue' }; if (p.kind === 'CO' && !(p.c >= 1650 && p.c <= 1780)) return { ok: false, tried, notes: m.id + ' C=O off the dagger' }; if ((p.kind === 'CN' || p.kind === 'CC3') && !(p.c >= 2100 && p.c <= 2260)) return { ok: false, tried, notes: m.id + ' triple off the flag' }; if (p.kind === 'CHsp3' && !(p.c < 3000 && p.c > 2800)) return { ok: false, tried, notes: m.id + ' sp3 C-H on the sp2 side' }; if (p.kind === 'CHsp2' && !(p.c > 3000 && p.c < 3150)) return { ok: false, tried, notes: m.id + ' sp2 C-H on the sp3 side' }; }
    const s = irSamples(m.peaks); if (s.some(q => !(q[1] >= 3 && q[1] <= 99))) return { ok: false, tried, notes: m.id + ' curve out of range' };
  }
  const groups = new Set(IR.map(m => m.group));
  for (const g of ['alcohol', 'carboxylic acid', 'ketone', 'aldehyde', 'ester', 'amide', 'primary amine', 'nitrile', 'terminal alkyne', 'alkene', 'aromatic ring', 'ether', 'alkane', 'tertiary amine']) if (!groups.has(g)) return { ok: false, tried, notes: 'missing group ' + g };
  // 2. generators: the correct choice is the table entry, distractors differ in landmarks
  const rng = makeRng(20260904);
  for (let k = 0; k < 240; k++){
    const g = k % 3 === 0 ? genFG(rng) : k % 3 === 1 ? genMatch(rng) : genWhich(rng);
    const oks = g.choices.filter(c => c.ok);
    if (oks.length !== 1 || g.choices.length !== 4) return { ok: false, tried, notes: g.kind + ': answer not unique or not four choices' };
    if (g.kind === 'fg'){ if (oks[0].text !== g.mol.group) return { ok: false, tried, notes: 'fg answer mismatch' }; if (new Set(g.choices.map(c => c.text)).size !== 4) return { ok: false, tried, notes: 'fg duplicate groups' }; for (const c of g.choices) if (!c.ok && sigOf(c.mol) === sigOf(g.mol)) return { ok: false, tried, notes: 'fg distractor shares landmarks' }; }
    else {
      if (oks[0].mol.id !== g.mol.id) return { ok: false, tried, notes: g.kind + ' answer mismatch' };
      const sigs = g.choices.map(c => sigOf(c.mol)); if (new Set(sigs).size !== 4) return { ok: false, tried, notes: g.kind + ': signatures not pairwise distinct' };
      if (g.kind === 'match' && new Set(g.choices.map(c => c.smiles)).size !== 4) return { ok: false, tried, notes: 'match duplicate smiles' };
      if (g.kind === 'which' && new Set(g.choices.map(c => c.mol.group)).size !== 4) return { ok: false, tried, notes: 'which duplicate groups' };
    }
    tried++;
  }
  // 3. makeItem for the Summit
  const api = tinyApi(deps, 77);
  for (let k = 0; k < 220; k++){
    const it = makeItem(api); tried++;
    if (!it || !Array.isArray(it.choices) || it.choices.length !== 4) return { ok: false, tried, notes: 'makeItem: not four choices' };
    if (!(it.correct >= 0 && it.correct < 4)) return { ok: false, tried, notes: 'makeItem: bad correct index' };
    const keys = it.choices.map(c => c.smiles || c.text); if (new Set(keys).size !== 4) return { ok: false, tried, notes: 'makeItem: duplicate choices' };
    for (const c of it.choices) if (c.smiles && !smilesSane(c.smiles)) return { ok: false, tried, notes: 'makeItem: bad smiles ' + c.smiles };
    if (!it.coach || !it.stem) return { ok: false, tried, notes: 'makeItem: empty coach or stem' };
    if (it.home !== meta.id || !it.roots || !it.roots.length) return { ok: false, tried, notes: 'makeItem: home/roots' };
  }
  const a = makeItem(tinyApi(deps, 5)), b = makeItem(tinyApi(deps, 5));
  if (JSON.stringify(a) !== JSON.stringify(b)) return { ok: false, tried, notes: 'same seed gave a different item' };
  return { ok: true, tried, notes: IR.length + ' molecules, ' + groups.size + ' groups, landmarks checked against the peak table' };
}
