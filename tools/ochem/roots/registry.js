// Every root, in teaching order. The shell imports each module lazily and
// skips any that has not been built yet, so the page always loads.
export const LEVELS = [
  { n: 1, name: 'See the molecule', line: 'Every corner is a carbon. Every carbon gets four. Until you can read a drawing, nothing above this is learnable.' },
  { n: 2, name: 'Where the electrons want to go', line: 'This is the level where organic clicks. Once you can feel where the electrons want to go, reactions stop being a list.' },
  { n: 3, name: 'See it in three dimensions', line: 'Wedge toward, dash away. Walk around it and look at it.' }
];
export const ROOTS = [
  'l1-skeletal', 'l1-charge', 'l1-geometry', 'l1-unsat', 'l1-groups', 'l1-naming',
  'l2-bully', 'l2-resonance', 'l2-induction', 'l2-carbocation', 'l2-acidity', 'l2-arrows',
  'l3-wedge', 'l3-newman', 'l3-chair', 'l3-fischer', 'l3-isomers', 'l3-ez'
];
