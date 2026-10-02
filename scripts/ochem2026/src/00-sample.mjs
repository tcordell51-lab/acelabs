// Pipeline sample: one item per figure family. Kept as real items.
export default [
  {
    id: 'af-sample-1', type: 'arrows-forward', roots: ['l2-arrows'], difficulty: 1,
    stem: 'Follow the curved arrows exactly as drawn. What do they make?',
    fig: { kind: 'mech', species: [{ smi: '[OH-]' }, { smi: 'CCBr' }], arrows: [{ from: { lp: '0.0' }, to: { bond: ['0.0', '1.1'] } }, { from: { bond: ['1.1', '1.2'] }, to: { atom: '1.2' } }], hideProduct: true },
    choices: [
      { text: 'ethanol and bromide', smiles: 'CCO.[Br-]' },
      { text: 'ethylene, water and bromide', smiles: 'C=C.O.[Br-]' },
      { text: 'ethoxide and HBr', smiles: 'CC[O-].Br' },
      { text: 'bromoethanol and hydride', smiles: 'OCCBr.[H-]' },
      { text: 'ethane and hypobromite', smiles: 'CC.[O-]Br' }
    ],
    correct: 0,
    coach: 'Read each arrow as a sentence: the lone pair on oxygen becomes the new O to C bond, and the C to Br bond walks off onto bromine.',
    why: 'The first arrow starts on the oxygen lone pair and ends at the carbon holding bromine, so a new C to O bond forms. The second arrow takes the C to Br bond electrons onto bromine, so bromide leaves. One step, attack and kick it off: ethanol plus bromide.'
  },
  {
    id: 'rcd-sample-1', type: 'rcd', roots: ['l2-carbocation'], difficulty: 2,
    stem: 'The diagram shows a two-step reaction. Which labeled distance is the activation energy of the rate-determining step?',
    fig: { kind: 'rcd', points: [{ kind: 'start', y: 0 }, { kind: 'ts', y: 95 }, { kind: 'int', y: 55 }, { kind: 'ts', y: 70 }, { kind: 'end', y: -30 }], marks: [{ from: 0, to: 1, label: 'w' }, { from: 2, to: 3, label: 'x' }, { from: 0, to: 4, label: 'y', dx: 24 }, { from: 0, to: 2, label: 'z', dx: -40 }] },
    choices: [{ text: 'w' }, { text: 'x' }, { text: 'y' }, { text: 'z' }, { text: 'w plus x' }],
    correct: 0,
    verify: { rcd: 'rdsMark' },
    coach: 'The rate-determining step is the biggest climb measured from the valley in front of it.',
    why: 'Step one climbs from the reactants to the first peak, which is distance w. Step two only climbs from the intermediate valley to the second peak, distance x, which is much smaller. The biggest climb sets the rate, so w is the activation energy of the rate-determining step. y is the heat of reaction and z is how far above the reactants the intermediate sits.'
  }
];
