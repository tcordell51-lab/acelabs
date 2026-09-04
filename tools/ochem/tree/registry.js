// Every module of the tree, in teaching order. Ids are provisional until the
// modules exist; the shell skips any that are not built yet.
export const LEVELS = [
  { n: 4, name: 'The trunk: recognize the reagent, name the move', line: 'You see the reagent, you know its one move before you read the choices. Pattern recognition on top of the roots.' },
  { n: 5, name: 'The branches: push the arrows', line: 'Every mechanism is attack, kick it off, attach, done with the right atoms in the right order. This is where the 2026 test moved its weight.' },
  { n: 6, name: 'The canopy: build it in steps', line: 'Two-step and multi-step synthesis is the trunk chained. Work backward from the product and protect what has to survive.' },
  { n: 7, name: 'The evidence: read the data', line: 'The tongue and the dagger, count the peaks first, n plus one, then the landmarks. Working backward from data to structure.' }
];
export const MODULES = [
  't4-alkene', 't4-alkyne', 't4-subelim', 't4-alcohol', 't4-carbonyl', 't4-acid-deriv', 't4-alpha', 't4-aromatic', 't4-radical-pericyclic',
  't5-proton', 't5-sn-e', 't5-addition', 't5-acyl', 't5-eas', 't5-coordinate', 't5-combined',
  't6-two-step', 't6-retro', 't6-selectivity',
  't7-ir', 't7-hnmr', 't7-cnmr', 't7-multi', 't7-properties', 't7-lab'
];
