// bank-map.js - which module and roots each verified bank group belongs to.
//
// Ace Labs' games/ochem-bank-1000.js (window.OCHEM_DB, 1213 items, every one
// with keep, scope_ok and smiles_valid true and an RDKit-checked answer) is
// the verified item bank. Its 51 group tags map here to the tree module that
// teaches them and the roots they stand on. Modules pull their group's items
// through bankItems(); the Summit draws a whole section through it.

export const GROUP_MAP = {
  'alkene-hx': { module: 't4-alkene', roots: ['l2-carbocation'] },
  'alkene-hydration': { module: 't4-alkene', roots: ['l2-carbocation'] },
  'alkene-halogenation': { module: 't4-alkene', roots: ['l2-arrows', 'l3-isomers'] },
  'alkene-radical-hbr': { module: 't4-alkene', roots: ['l2-carbocation'] },
  'alkene-hydrogenation': { module: 't4-alkene', roots: ['l1-unsat'] },
  'alkene-epoxidation-diol': { module: 't4-alkene', roots: ['l3-isomers'] },
  'alkene-ozonolysis': { module: 't4-alkene', roots: ['l1-groups', 'l1-skeletal'] },
  'carbocation-rearrangement': { module: 't4-alkene', roots: ['l2-carbocation'] },
  'alkyne-addition': { module: 't4-alkyne', roots: ['l2-carbocation'] },
  'alkyne-hydration': { module: 't4-alkyne', roots: ['l2-carbocation', 'l2-resonance'] },
  'alkyne-reduction-alkylation': { module: 't4-alkyne', roots: ['l3-ez', 'l2-acidity'] },
  'sn1-sn2': { module: 't4-subelim', roots: ['l2-carbocation', 'l2-arrows', 'l3-wedge'] },
  'e1-e2': { module: 't4-subelim', roots: ['l3-newman', 'l2-carbocation'] },
  'sub-vs-elim': { module: 't4-subelim', roots: ['l2-carbocation', 'l2-acidity'] },
  'alcohol-oxidation': { module: 't4-alcohol', roots: ['l1-groups'] },
  'alcohol-substitution-dehydration': { module: 't4-alcohol', roots: ['l2-carbocation', 'l2-arrows'] },
  'ether-epoxide': { module: 't4-alcohol', roots: ['l2-arrows'] },
  'oxidation-reduction-overview': { module: 't4-alcohol', roots: ['l1-groups', 'l2-bully'] },
  'carbonyl-grignard-hydride': { module: 't4-carbonyl', roots: ['l2-bully', 'l2-arrows'] },
  'carbonyl-acetal-imine': { module: 't4-carbonyl', roots: ['l2-arrows', 'l1-charge'] },
  'wittig': { module: 't4-carbonyl', roots: ['l2-arrows'] },
  'ester-formation-hydrolysis': { module: 't4-acid-deriv', roots: ['l2-arrows'] },
  'acyl-substitution': { module: 't4-acid-deriv', roots: ['l2-resonance', 'l2-bully'] },
  'carboxylic-reduction-decarb': { module: 't4-acid-deriv', roots: ['l2-bully'] },
  'amine-synthesis': { module: 't4-acid-deriv', roots: ['l2-arrows'] },
  'amine-reactions': { module: 't4-acid-deriv', roots: ['l2-acidity'] },
  'aldol': { module: 't4-alpha', roots: ['l2-acidity', 'l2-arrows'] },
  'claisen': { module: 't4-alpha', roots: ['l2-acidity', 'l2-arrows'] },
  'michael': { module: 't4-alpha', roots: ['l2-resonance'] },
  'malonic-acetoacetic': { module: 't4-alpha', roots: ['l2-acidity', 'l2-resonance'] },
  'enolate-alkylation-halogenation': { module: 't4-alpha', roots: ['l2-acidity'] },
  'eas-reactions': { module: 't4-aromatic', roots: ['l2-resonance', 'l2-arrows'] },
  'eas-directing': { module: 't4-aromatic', roots: ['l2-resonance', 'l2-induction'] },
  'aromatic-other': { module: 't4-aromatic', roots: ['l2-resonance'] },
  'aromaticity': { module: 't4-aromatic', roots: ['l1-unsat', 'l2-resonance', 'l1-geometry'] },
  'radical-reactions': { module: 't4-radical-pericyclic', roots: ['l2-carbocation'] },
  'diels-alder': { module: 't4-radical-pericyclic', roots: ['l2-arrows', 'l1-unsat'] },
  'pericyclic-other': { module: 't4-radical-pericyclic', roots: ['l2-arrows'] },
  'multistep-synthesis': { module: 't6-retro', roots: ['l1-groups', 'l2-arrows'] },
  'spectroscopy-ir': { module: 't7-ir', roots: ['l1-groups', 'l1-unsat'] },
  'spectroscopy-nmr': { module: 't7-hnmr', roots: ['l1-skeletal', 'l1-unsat'] },
  'spectroscopy-ms-dou': { module: 't7-multi', roots: ['l1-unsat', 'l1-skeletal'] },
  'lab-techniques': { module: 't7-lab', roots: ['l2-bully', 'l1-groups'] },
  'functional-group-id': { module: 't7-properties', roots: ['l1-groups'] },
  // roots-level groups: the bank items still count for the summit, home is the root page
  'acid-base-pka': { module: 'roots', roots: ['l2-acidity'] },
  'resonance-stability': { module: 'roots', roots: ['l2-resonance', 'l2-carbocation'] },
  'hybridization-geometry': { module: 'roots', roots: ['l1-geometry'] },
  'stereo-relationships': { module: 'roots', roots: ['l3-isomers'] },
  'stereo-rs-ez': { module: 'roots', roots: ['l3-wedge', 'l3-ez'] },
  'nomenclature': { module: 'roots', roots: ['l1-naming'] },
  'misc': { module: 'roots', roots: ['l1-skeletal'] }
};

/** All bank items (window.OCHEM_DB) for a module id, or for a group. Empty if the bank is not loaded. */
export function bankItems(where){
  const db = (typeof window !== 'undefined' && window.OCHEM_DB) || [];
  return db.filter(it => it.keep !== false && it.scope_ok !== false && it.smiles_valid !== false && (GROUP_MAP[it.group] && (GROUP_MAP[it.group].module === where || it.group === where)));
}
/** Normalize a bank item to the Summit item shape. */
export function bankToItem(it){
  const g = GROUP_MAP[it.group] || { module: 'roots', roots: [] };
  const structural = !!it.opts_are_structures;
  return {
    stem: it.q, sub: it.q_smiles || null, reagent: null, prod: null,
    choices: it.opts.map(o => structural ? { text: '', smiles: o } : { text: o, smiles: null }),
    correct: it.correct, coach: it.why, home: g.module, roots: g.roots, group: it.group, difficulty: it.difficulty || 1, source: 'bank'
  };
}
