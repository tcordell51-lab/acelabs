// Annotate OChem bank questions with SMILES strings where molecules are
// unambiguously identified from the question text or answer choices.
// Conservative approach — only add SMILES we're confident about.

const fs = require('fs');
const bank = require('/tmp/dat-mock-bank.json');

// Lookup table: human-readable name → canonical SMILES
// Curated subset most likely to appear in DAT OChem questions.
const NAME_SMILES = {
  // Alkanes / alkenes / alkynes
  'methane': 'C',
  'ethane': 'CC',
  'propane': 'CCC',
  'butane': 'CCCC',
  'isobutane': 'CC(C)C',
  '2-methylpropane': 'CC(C)C',
  'pentane': 'CCCCC',
  'hexane': 'CCCCCC',
  'cyclopentane': 'C1CCCC1',
  'cyclohexane': 'C1CCCCC1',
  'cyclohexene': 'C1=CCCCC1',
  'cyclohexanone': 'O=C1CCCCC1',
  'cyclohexanol': 'OC1CCCCC1',
  'ethylene': 'C=C',
  'ethene': 'C=C',
  'propene': 'CC=C',
  '1-propene': 'CC=C',
  'propylene': 'CC=C',
  '1-butene': 'CCC=C',
  '2-butene': 'CC=CC',
  'cis-2-butene': 'C/C=C\\C',
  'trans-2-butene': 'C/C=C/C',
  '2-methyl-2-butene': 'CC=C(C)C',
  'isobutylene': 'CC(=C)C',
  'isobutene': 'CC(=C)C',
  '2-methylpropene': 'CC(=C)C',
  'ethyne': 'C#C',
  'acetylene': 'C#C',
  '1-butyne': 'CCC#C',
  '2-butyne': 'CC#CC',
  'butane': 'CCCC',

  // Alcohols / ethers / epoxides
  'methanol': 'CO',
  'ethanol': 'CCO',
  '1-propanol': 'CCCO',
  '2-propanol': 'CC(O)C',
  'isopropanol': 'CC(O)C',
  'tert-butanol': 'CC(C)(C)O',
  'tert-butyl alcohol': 'CC(C)(C)O',
  'phenol': 'Oc1ccccc1',
  'benzyl alcohol': 'OCc1ccccc1',
  'glycerol': 'OCC(O)CO',
  'ethylene glycol': 'OCCO',
  'diethyl ether': 'CCOCC',
  'tetrahydrofuran': 'C1CCOC1',
  'thf': 'C1CCOC1',
  'ethylene oxide': 'C1CO1',
  'oxirane': 'C1CO1',
  'epoxide': 'C1CO1',

  // Carbonyls
  'formaldehyde': 'C=O',
  'acetaldehyde': 'CC=O',
  'propanal': 'CCC=O',
  'butanal': 'CCCC=O',
  'benzaldehyde': 'O=Cc1ccccc1',
  'acetone': 'CC(=O)C',
  'butanone': 'CCC(=O)C',
  '2-butanone': 'CCC(=O)C',
  'methyl ethyl ketone': 'CCC(=O)C',
  'cyclopentanone': 'O=C1CCCC1',
  'acetophenone': 'CC(=O)c1ccccc1',

  // Carboxylic acids + derivatives
  'formic acid': 'OC=O',
  'acetic acid': 'CC(=O)O',
  'propanoic acid': 'CCC(=O)O',
  'butyric acid': 'CCCC(=O)O',
  'butanoic acid': 'CCCC(=O)O',
  'benzoic acid': 'OC(=O)c1ccccc1',
  'salicylic acid': 'OC(=O)c1ccccc1O',
  'acetic anhydride': 'CC(=O)OC(=O)C',
  'acetyl chloride': 'CC(=O)Cl',
  'acetamide': 'CC(=O)N',
  'methyl acetate': 'CC(=O)OC',
  'ethyl acetate': 'CC(=O)OCC',

  // Amines
  'methylamine': 'CN',
  'ethylamine': 'CCN',
  'dimethylamine': 'CNC',
  'trimethylamine': 'CN(C)C',
  'aniline': 'Nc1ccccc1',
  'pyridine': 'c1ccncc1',
  'pyrrolidine': 'C1CCNC1',
  'piperidine': 'C1CCNCC1',

  // Aromatics
  'benzene': 'c1ccccc1',
  'toluene': 'Cc1ccccc1',
  'xylene': 'Cc1ccccc1C',
  'o-xylene': 'Cc1ccccc1C',
  'naphthalene': 'c1ccc2ccccc2c1',
  'nitrobenzene': '[O-][N+](=O)c1ccccc1',
  'chlorobenzene': 'Clc1ccccc1',
  'bromobenzene': 'Brc1ccccc1',
  'phenyl': 'c1ccccc1',
  'styrene': 'C=Cc1ccccc1',
  'anisole': 'COc1ccccc1',

  // Halides
  'methyl chloride': 'CCl',
  'chloromethane': 'CCl',
  'methyl iodide': 'CI',
  'ethyl chloride': 'CCCl',
  'ethyl bromide': 'CCBr',
  '1-bromobutane': 'CCCCBr',
  '2-bromobutane': 'CC(Br)CC',
  'tert-butyl bromide': 'CC(C)(C)Br',
  '2-bromo-2-methylpropane': 'CC(C)(C)Br',
  'allyl bromide': 'C=CCBr',
  'benzyl bromide': 'BrCc1ccccc1',
  'benzyl chloride': 'ClCc1ccccc1',

  // Sugars / common bio
  'glucose': 'OCC1OC(O)C(O)C(O)C1O',
  'fructose': 'OCC1(O)OCC(O)C1O',

  // Reagents that often appear in answers
  'water': 'O',
  'h2o': 'O',
  'hydrogen': '[HH]',
  'oxygen': 'O=O',
  'carbon dioxide': 'O=C=O',
  'co2': 'O=C=O',
  'ammonia': 'N',
  'hcl': 'Cl[H]',
  'hbr': 'Br[H]',
  'hi': 'I[H]',
  'sodium ethoxide': '[Na+].CC[O-]',
  'sodium methoxide': '[Na+].C[O-]',
  'lda': '[Li]N(C(C)C)C(C)C',
};

// Short generic species that match too aggressively in question text — skip them
// when scanning the question stem (still allowed for direct option matches where
// the option literally IS the molecule).
const QUESTION_BLACKLIST = new Set([
  'water','h2o','hydrogen','oxygen','ammonia','co2','carbon dioxide','phenyl',
  'hcl','hbr','hi','methane','methanol'  // too commonly mentioned as solvent/reagent, not the substrate
]);

function findSmilesForText(text, isQuestion){
  if (!text) return null;
  const lower = text.toLowerCase();
  const norm = lower.replace(/[\(\)\[\],.;:!?]/g, ' ').replace(/\s+/g, ' ');
  const trimmed = norm.trim();
  if (NAME_SMILES[trimmed]) return NAME_SMILES[trimmed];
  const names = Object.keys(NAME_SMILES).sort((a,b) => b.length - a.length);
  for (const n of names){
    if (isQuestion && QUESTION_BLACKLIST.has(n)) continue;
    if (norm.includes(' ' + n + ' ') || norm.startsWith(n + ' ') || norm.endsWith(' ' + n) || norm === n){
      return NAME_SMILES[n];
    }
  }
  return null;
}

// Augment OChem bank
let qHits = 0, optHits = 0, total = 0;
for (const p of bank.ochem){
  total++;
  // Skip if this entry already has SMILES (don't overwrite hand-authored arrow questions)
  if (p.q_smiles || p.opts_smiles){ continue; }
  const qSmiles = findSmilesForText(p.q, true);
  if (qSmiles) {
    p.q_smiles = qSmiles;
    qHits++;
  }
  // Check each option for a SMILES match (no blacklist — options often ARE small molecules)
  const optSmiles = (p.opts || []).map(o => findSmilesForText(o, false));
  if (optSmiles.some(s => s)){
    p.opts_smiles = optSmiles;
    optHits++;
  }
}

console.log('OChem bank annotated:');
console.log('  total questions:', total);
console.log('  with q_smiles:', qHits, '(' + (100*qHits/total).toFixed(1) + '%)');
console.log('  with opts_smiles:', optHits, '(' + (100*optHits/total).toFixed(1) + '%)');

fs.writeFileSync('/tmp/dat-mock-bank.json', JSON.stringify(bank));
console.log('Bank updated at /tmp/dat-mock-bank.json');
