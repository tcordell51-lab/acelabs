// Reaction coordinate diagrams (drawn) and conformations. Every computable claim
// (steps, intermediates, rate-determining step, heats, barriers) is recomputed
// by the build from the drawn levels through verify.rcd.

const two = (a, b, c, d, e, extra = {}) => Object.assign({ kind: 'rcd', yLabel: 'Energy', points: [{ kind: 'start', y: a }, { kind: 'ts', y: b }, { kind: 'int', y: c }, { kind: 'ts', y: d }, { kind: 'end', y: e }] }, extra);
const tagAll = pts => pts.map((p, i) => Object.assign({}, p, { tag: String(i + 1) }));
const showAll = pts => pts.map(p => Object.assign({}, p, { show: true }));

// butane: dihedral angle between the two methyls, 0 to 360
const BUTANE = [
  { kind: 'ts', y: 19, tag: '1' }, { kind: 'min', y: 3.8, tag: '2' }, { kind: 'ts', y: 16, tag: '3' },
  { kind: 'min', y: 0, tag: '4' }, { kind: 'ts', y: 16 }, { kind: 'min', y: 3.8 }, { kind: 'ts', y: 19 }
];
const TICKS = ['0', '60', '120', '180', '240', '300', '360'];
const butane = (pts, extra = {}) => Object.assign({ kind: 'rcd', yLabel: 'Energy, kJ/mol', xLabel: 'Dihedral angle, degrees', xTicks: TICKS, points: pts }, extra);

// SN1 hydrolysis of tert-butyl bromide in water: ionize, water attacks, lose a proton
const SN1 = [
  { kind: 'start', y: 0 }, { kind: 'ts', y: 95 }, { kind: 'int', y: 60 }, { kind: 'ts', y: 68 },
  { kind: 'int', y: 25 }, { kind: 'ts', y: 32 }, { kind: 'end', y: -15 }
];

export default [
  /* ---------------- counting what is drawn ---------------- */
  {
    id: 'rcd-01', type: 'rcd', roots: ['l2-carbocation'], difficulty: 1,
    stem: 'How many steps does the mechanism drawn in this reaction coordinate diagram have?',
    fig: two(0, 90, 40, 70, -20),
    choices: [{ text: '2 steps' }, { text: '1 step' }, { text: '3 steps' }, { text: '4 steps' }, { text: 'It cannot be told from a diagram' }],
    correct: 0, verify: { rcd: 'steps' },
    coach: 'Count the peaks, not the points: every peak is one step.',
    why: 'There are two peaks, so two transition states and two steps. The valley between them is an intermediate, not a step of its own. Counting every bend in the curve is what gives the larger numbers.'
  },
  {
    id: 'rcd-02', type: 'rcd', roots: ['l2-carbocation'], difficulty: 1,
    stem: 'How many intermediates does this reaction pass through on the way from reactants to products?',
    fig: { kind: 'rcd', yLabel: 'Energy', points: [{ kind: 'start', y: 0 }, { kind: 'ts', y: 70 }, { kind: 'int', y: 45 }, { kind: 'ts', y: 85 }, { kind: 'int', y: 30 }, { kind: 'ts', y: 50 }, { kind: 'end', y: -25 }] },
    choices: [{ text: '2 intermediates' }, { text: '3 intermediates' }, { text: '1 intermediate' }, { text: '5, one for every turn in the curve' }, { text: 'None, only transition states' }],
    correct: 0, verify: { rcd: 'intermediates' },
    coach: 'Intermediates are the valleys between two peaks; the starting line and the finish line do not count.',
    why: 'Three peaks means three steps, and two valleys sit between them. Each valley is a real species with a lifetime. Three is the number of transition states, which is the most common mix-up on this question.'
  },
  {
    id: 'rcd-03', type: 'rcd', roots: ['l2-carbocation'], difficulty: 1,
    stem: 'Which numbered point on the diagram is an intermediate?',
    fig: { kind: 'rcd', yLabel: 'Energy', points: tagAll(two(0, 90, 45, 65, -20).points) },
    choices: [{ text: 'Point 3' }, { text: 'Point 2' }, { text: 'Point 4' }, { text: 'Points 2 and 4' }, { text: 'Point 5, the products' }],
    correct: 0,
    coach: 'A peak is a transition state; a valley sitting between two peaks is an intermediate.',
    why: 'Point 3 is a valley between two hills, so it is a real molecule with a real lifetime, an intermediate. Points 2 and 4 are peaks, transition states that can never be isolated. Point 5 is the finish line, the products.'
  },
  {
    id: 'rcd-04', type: 'rcd', roots: ['l2-carbocation'], difficulty: 1,
    stem: 'Which numbered points are transition states?',
    fig: { kind: 'rcd', yLabel: 'Energy', points: tagAll(two(10, 80, 50, 95, 0).points) },
    choices: [{ text: 'Points 2 and 4' }, { text: 'Point 3 only' }, { text: 'Points 1 and 5' }, { text: 'Points 2, 3 and 4' }, { text: 'Every point on the curve' }],
    correct: 0,
    coach: 'Transition states live at the very tops of the hills.',
    why: 'Points 2 and 4 are the peaks, the moments where bonds are half made and half broken. Point 3 is a valley, an intermediate. Points 1 and 5 are the reactants and products.'
  },
  {
    id: 'rcd-23', type: 'rcd', roots: ['l2-carbocation'], difficulty: 2,
    stem: 'tert-Butyl bromide reacts with water by SN1 to give tert-butanol. How many transition states does its diagram show?',
    fig: { kind: 'rcd', yLabel: 'Energy', points: SN1 },
    choices: [{ text: '3 transition states' }, { text: '2 transition states' }, { text: '1 transition state' }, { text: '6, one per change in direction' }, { text: '5 transition states' }],
    correct: 0, verify: { rcd: 'steps' },
    coach: 'One peak per step: ionize, water attacks, lose the proton.',
    why: 'The water route to the alcohol has three steps: the C-Br bond breaks to form the carbocation, water attacks the flat cation, and a second water takes a proton off the oxonium ion. Three peaks, three transition states. Two is the answer if you forget the final proton transfer.'
  },

  /* ---------------- rate-determining step ---------------- */
  {
    id: 'rcd-05', type: 'rcd', roots: ['l2-carbocation'], difficulty: 2,
    stem: 'For this two-step reaction, which labeled distance is the activation energy of the rate-determining step?',
    fig: two(0, 60, 30, 110, -10, { marks: [{ from: 0, to: 1, label: 'w' }, { from: 2, to: 3, label: 'x' }, { from: 0, to: 3, label: 'y', dx: 26 }, { from: 0, to: 4, label: 'z', dx: 30 }] }),
    choices: [{ text: 'x' }, { text: 'w' }, { text: 'y' }, { text: 'z' }, { text: 'w plus x' }],
    correct: 0, verify: { rcd: 'rdsMark' },
    coach: 'Measure each climb from the valley it starts in; the biggest climb is the slow step.',
    why: 'Step one climbs from the reactants by w. Step two climbs from the intermediate valley by x, which is the bigger climb, so step two is rate-determining and x is its activation energy. y is measured from the reactants, not from the valley step two actually starts in, and z is the heat of reaction.'
  },
  {
    id: 'rcd-06', type: 'rcd', roots: ['l2-carbocation'], difficulty: 2,
    stem: 'Which step of this three-step mechanism is rate-determining?',
    fig: { kind: 'rcd', yLabel: 'Energy', points: [{ kind: 'start', y: 0 }, { kind: 'ts', y: 55 }, { kind: 'int', y: 30 }, { kind: 'ts', y: 100 }, { kind: 'int', y: 20 }, { kind: 'ts', y: 45 }, { kind: 'end', y: -30 }] },
    choices: [{ text: 'Step 2' }, { text: 'Step 1' }, { text: 'Step 3' }, { text: 'All three equally' }, { text: 'The step with the lowest valley after it' }],
    correct: 0, verify: { rcd: 'rds' },
    coach: 'Find the biggest climb, measured from the valley just before each peak.',
    why: 'Step 1 climbs 55, step 2 climbs 70 from its valley at 30, and step 3 climbs 25. Step 2 is the tallest hill and also the highest point on the trip, so it sets the rate. Steps do not share the rate equally; the slowest one is the bottleneck.'
  },
  {
    id: 'rcd-13', type: 'rcd', roots: ['l2-carbocation'], difficulty: 2,
    stem: 'Which step of the reaction drawn here is the fastest?',
    fig: two(0, 85, 50, 62, -20),
    choices: [{ text: 'The second step' }, { text: 'The first step' }, { text: 'Both run at one rate' }, { text: 'It cannot be told' }, { text: 'The overall reaction' }],
    correct: 0,
    coach: 'Fast means a small climb from the valley the step starts in.',
    why: 'Step 1 climbs 85 from the reactants; step 2 climbs only 12 from the intermediate valley at 50. The smaller hill is the faster step, so step 2 is fast and step 1 is rate-determining. Starting low does not make a step fast; the height of its own hill does.'
  },
  {
    id: 'rcd-24', type: 'rcd', roots: ['l2-carbocation'], difficulty: 3,
    stem: 'Energies are in kJ/mol. What is the activation energy of the rate-determining step?',
    fig: { kind: 'rcd', yLabel: 'Energy, kJ/mol', points: showAll(two(0, 80, 30, 60, -40).points) },
    choices: [{ text: '80 kJ/mol' }, { text: '30 kJ/mol' }, { text: '60 kJ/mol' }, { text: '120 kJ/mol' }, { text: '-40 kJ/mol, the heat of reaction' }],
    correct: 0, verify: { rcd: 'value', kind: 'rdsEa' },
    coach: 'Each hill is its peak minus the valley it starts from: 80 minus 0, then 60 minus 30.',
    why: 'Step one climbs 80 kJ/mol from the reactants. Step two climbs from the intermediate at 30 to 60, only 30 kJ/mol. The bigger climb, 80 kJ/mol, belongs to the rate-determining step. 60 is just the height of the second peak above the reactants.'
  },

  /* ---------------- the landing: heat of reaction ---------------- */
  {
    id: 'rcd-07', type: 'rcd', roots: ['l2-carbocation'], difficulty: 1,
    stem: 'Is the overall reaction drawn here exothermic or endothermic?',
    fig: { kind: 'rcd', yLabel: 'Enthalpy', points: [{ kind: 'start', y: 10 }, { kind: 'ts', y: 90 }, { kind: 'end', y: 45 }] },
    choices: [{ text: 'Endothermic' }, { text: 'Exothermic' }, { text: 'Depends on temperature' }, { text: 'Thermoneutral' }, { text: 'Depends on a catalyst' }],
    correct: 0, verify: { rcd: 'heat' },
    coach: 'Read the landing and ignore the hill: products above reactants means heat went in.',
    why: 'The products finish higher than the reactants started, so energy was taken in: endothermic. The height of the hill tells you how fast, not which way the heat flows.'
  },
  {
    id: 'rcd-26', type: 'rcd', roots: ['l2-carbocation'], difficulty: 2,
    stem: 'This three-step reaction passes through high-energy intermediates. What is the overall reaction?',
    fig: { kind: 'rcd', yLabel: 'Enthalpy', points: [{ kind: 'start', y: 20 }, { kind: 'ts', y: 100 }, { kind: 'int', y: 70 }, { kind: 'ts', y: 85 }, { kind: 'int', y: 55 }, { kind: 'ts', y: 75 }, { kind: 'end', y: -10 }] },
    choices: [{ text: 'Exothermic' }, { text: 'Endothermic' }, { text: 'Thermoneutral' }, { text: 'Exothermic in step 1 only' }, { text: 'Cannot be read' }],
    correct: 0, verify: { rcd: 'heat' },
    coach: 'Only the start and the finish decide the heat of reaction; the middle is just the route.',
    why: 'The products land below where the reactants started, so the overall reaction gives off heat. The intermediates being high only means the route is uphill for a while. Step 1 on its own is uphill, the opposite of the fourth choice.'
  },
  {
    id: 'rcd-08', type: 'rcd', roots: ['l2-carbocation'], difficulty: 2,
    stem: 'Energies are in kJ/mol. What is the heat of reaction for the forward reaction?',
    fig: { kind: 'rcd', yLabel: 'Enthalpy, kJ/mol', points: [{ kind: 'start', y: 40, show: true }, { kind: 'ts', y: 100, show: true }, { kind: 'end', y: 10, show: true }] },
    choices: [{ text: '-30 kJ/mol' }, { text: '+30 kJ/mol' }, { text: '+60 kJ/mol' }, { text: '+90 kJ/mol' }, { text: '+100 kJ/mol' }],
    correct: 0, verify: { rcd: 'value', kind: 'dh' },
    coach: 'Heat of reaction is products minus reactants: 10 minus 40.',
    why: 'The products sit at 10 and the reactants at 40, so the landing is 30 kJ/mol lower: -30 kJ/mol, exothermic. +60 is the forward activation energy and +90 is the reverse one, both measured to the peak.'
  },
  {
    id: 'rcd-22', type: 'rcd', roots: ['l2-carbocation'], difficulty: 1,
    stem: 'Which labeled distance on this diagram is the heat of reaction?',
    fig: two(0, 75, 35, 55, -35, { marks: [{ from: 0, to: 1, label: 'w' }, { from: 2, to: 3, label: 'x' }, { from: 0, to: 2, label: 'y', dx: -36 }, { from: 0, to: 4, label: 'z', dx: 26 }] }),
    choices: [{ text: 'z' }, { text: 'w' }, { text: 'x' }, { text: 'y' }, { text: 'w minus x' }],
    correct: 0, verify: { rcd: 'mark', from: 0, to: 4 },
    coach: 'The heat of reaction runs from the reactant line to the product line, nothing else.',
    why: 'z measures from the reactants down to the products, the landing. w and x are the two hills, the activation energies of the two steps. y is how far the intermediate sits above the reactants, which is not the heat of the overall reaction.'
  },

  /* ---------------- forward and reverse barriers ---------------- */
  {
    id: 'rcd-09', type: 'rcd', roots: ['l2-carbocation'], difficulty: 2,
    stem: 'Energies are in kJ/mol. What is the activation energy of the forward reaction?',
    fig: { kind: 'rcd', yLabel: 'Energy, kJ/mol', points: [{ kind: 'start', y: 20, show: true }, { kind: 'ts', y: 85, show: true }, { kind: 'end', y: 50, show: true }] },
    choices: [{ text: '65 kJ/mol' }, { text: '30 kJ/mol' }, { text: '35 kJ/mol' }, { text: '85 kJ/mol' }, { text: '105 kJ/mol' }],
    correct: 0, verify: { rcd: 'value', kind: 'ea', from: 0, to: 1 },
    coach: 'Activation energy is the peak minus where you start: 85 minus 20.',
    why: 'The reactants start at 20 and must climb to the peak at 85, a 65 kJ/mol hill. 35 is the reverse barrier, from the products at 50 up to the peak, and 30 is the heat of reaction. The peak value alone ignores where the trip begins.'
  },
  {
    id: 'rcd-10', type: 'rcd', roots: ['l2-carbocation'], difficulty: 3,
    stem: 'Energies are in kJ/mol. What is the activation energy of the reverse reaction, products back to reactants?',
    fig: { kind: 'rcd', yLabel: 'Energy, kJ/mol', points: [{ kind: 'start', y: 10, show: true }, { kind: 'ts', y: 70, show: true }, { kind: 'end', y: -30, show: true }] },
    choices: [{ text: '100 kJ/mol' }, { text: '60 kJ/mol' }, { text: '40 kJ/mol' }, { text: '70 kJ/mol' }, { text: '-40 kJ/mol, the heat' }],
    correct: 0, verify: { rcd: 'value', kind: 'ea', from: 2, to: 1 },
    coach: 'Going backward you start at the products, so climb from -30 up to 70.',
    why: 'The reverse trip begins at the products, -30 kJ/mol, and has to reach the same peak at 70: a climb of 100 kJ/mol. 60 is the forward barrier from the reactants at 10. An exothermic reaction always has a bigger reverse barrier than forward barrier.'
  },

  /* ---------------- catalysts ---------------- */
  {
    id: 'rcd-11', type: 'rcd', roots: ['l2-carbocation'], difficulty: 1,
    stem: 'The dashed curve is the same reaction with a catalyst added. What did the catalyst change?',
    fig: { kind: 'rcd', yLabel: 'Energy', points: [{ kind: 'start', y: 20 }, { kind: 'ts', y: 100 }, { kind: 'end', y: -10 }], alt: { points: [{ kind: 'start', y: 20 }, { kind: 'ts', y: 60 }, { kind: 'end', y: -10 }], label: 'with catalyst' } },
    choices: [{ text: 'Only the barrier height' }, { text: 'The heat of reaction and the barrier' }, { text: 'The energy of the products' }, { text: 'The position of equilibrium' }, { text: 'Nothing, the two curves are one path' }],
    correct: 0,
    coach: 'A catalyst lowers the hill and never moves the landing.',
    why: 'Both curves start and finish at the same levels, so the reactants, products, heat of reaction and equilibrium are untouched. Only the peak came down: the catalyst opened a lower path, so the reaction is faster without being any more favorable.'
  },
  {
    id: 'rcd-12', type: 'rcd', roots: ['l2-carbocation'], difficulty: 2,
    stem: 'The dashed curve shows the reaction with a catalyst. What does the catalyst do to the reverse reaction?',
    fig: { kind: 'rcd', yLabel: 'Energy', points: [{ kind: 'start', y: 0 }, { kind: 'ts', y: 90 }, { kind: 'end', y: -30 }], alt: { points: [{ kind: 'start', y: 0 }, { kind: 'ts', y: 55 }, { kind: 'end', y: -30 }], label: 'with catalyst' } },
    choices: [{ text: 'Speeds it up too' }, { text: 'Slows it down' }, { text: 'Leaves it unchanged' }, { text: 'Stops it completely' }, { text: 'Speeds it more than the forward one' }],
    correct: 0,
    coach: 'Both directions cross the same peak, so lowering the peak helps both.',
    why: 'The reverse reaction climbs from the products to the same transition state, and that peak dropped by the same amount. Forward and reverse both get faster by the same factor, which is exactly why a catalyst cannot shift an equilibrium, only reach it sooner.'
  },

  /* ---------------- kinetic and thermodynamic control ---------------- */
  {
    id: 'rcd-14', type: 'rcd', roots: ['l2-carbocation'], difficulty: 2,
    stem: 'One starting material can form two products. The solid gold curve leads to product A, the dashed curve to product B. Which product dominates at low temperature with a short reaction time?',
    fig: { kind: 'rcd', yLabel: 'Free energy', points: [{ kind: 'start', y: 0 }, { kind: 'ts', y: 60 }, { kind: 'end', y: -20 }], alt: { points: [{ kind: 'start', y: 0 }, { kind: 'ts', y: 85 }, { kind: 'end', y: -50 }], label: 'path to product B' }, names: { 2: 'A' } },
    choices: [{ text: 'Product A' }, { text: 'Product B' }, { text: 'Equal A and B' }, { text: 'Neither product' }, { text: 'Only starting material' }],
    correct: 0,
    coach: 'Cold and quick, the lower hill wins: kinetic control.',
    why: 'At low temperature most molecules can only clear the lower barrier, the path to A, and nothing has the energy to come back. So the faster-forming product A dominates. B is more stable, but stability only wins when there is heat and time to reach equilibrium.'
  },
  {
    id: 'rcd-15', type: 'rcd', roots: ['l2-carbocation'], difficulty: 2,
    stem: 'Same two products: the solid gold curve leads to product A, the dashed curve to product B. The reaction is heated for a long time so both paths can run backward. Which product dominates?',
    fig: { kind: 'rcd', yLabel: 'Free energy', points: [{ kind: 'start', y: 0 }, { kind: 'ts', y: 60 }, { kind: 'end', y: -20 }], alt: { points: [{ kind: 'start', y: 0 }, { kind: 'ts', y: 85 }, { kind: 'end', y: -50 }], label: 'path to product B' }, names: { 2: 'A' } },
    choices: [{ text: 'Product B' }, { text: 'Product A' }, { text: 'Neither product' }, { text: 'A 1:1 mixture' }, { text: 'Starting material' }],
    correct: 0,
    coach: 'Heat and time let everything go back over the hills and settle in the lowest landing.',
    why: 'With enough heat, A keeps reverting and the mixture drains toward the most stable product, B, which sits lowest. That is thermodynamic control. Forming faster only matters when the reaction cannot reverse.'
  },
  {
    id: 'rcd-16', type: 'rcd', roots: ['l2-carbocation'], difficulty: 2,
    stem: 'In this diagram the solid gold curve leads to product A and the dashed curve to product B. Which statement is accurate?',
    fig: { kind: 'rcd', yLabel: 'Free energy', points: [{ kind: 'start', y: 0 }, { kind: 'ts', y: 55 }, { kind: 'end', y: -15 }], alt: { points: [{ kind: 'start', y: 0 }, { kind: 'ts', y: 80 }, { kind: 'end', y: -45 }], label: 'path to product B' }, names: { 2: 'A' } },
    choices: [{ text: 'A is kinetic, B is thermodynamic' }, { text: 'A is thermodynamic, B is kinetic' }, { text: 'A is both kinetic and thermodynamic' }, { text: 'B forms faster because it is more stable' }, { text: 'A and B form at equal rates' }],
    correct: 0,
    coach: 'Kinetic is the lower hill; thermodynamic is the lower landing.',
    why: 'A has the smaller barrier, so it forms faster: the kinetic product. B sits lower in energy, so it is more stable: the thermodynamic product. Stability does not set the speed; the barrier does.'
  },

  /* ---------------- Hammond postulate ---------------- */
  {
    id: 'rcd-17', type: 'rcd', roots: ['l2-carbocation'], difficulty: 3,
    stem: 'For this strongly exothermic one-step reaction, the transition state most closely resembles which species?',
    fig: { kind: 'rcd', yLabel: 'Energy', points: [{ kind: 'start', y: 60 }, { kind: 'ts', y: 75 }, { kind: 'end', y: -40 }] },
    choices: [{ text: 'The reactants' }, { text: 'The products' }, { text: 'Halfway between' }, { text: 'Both equally' }, { text: 'A carbocation' }],
    correct: 0,
    coach: 'Hammond: a transition state looks like whichever neighbor is closer to it in energy.',
    why: 'The peak sits only a little above the reactants and far above the products, so it is an early transition state that looks like the reactants. That is the Hammond postulate. An endothermic step flips it: a late transition state that looks like the products.'
  },
  {
    id: 'rcd-18', type: 'rcd', roots: ['l2-carbocation'], difficulty: 3,
    stem: 'This is the SN1 reaction of tert-butyl bromide with azide ion. By the Hammond postulate, the transition state at point 2 most closely resembles which numbered point?',
    fig: { kind: 'rcd', yLabel: 'Energy', points: tagAll(two(0, 90, 72, 80, -20).points) },
    choices: [{ text: 'Point 3' }, { text: 'Point 1' }, { text: 'Point 5' }, { text: 'Point 4' }, { text: 'None of the drawn points' }],
    correct: 0,
    coach: 'Look for the neighbor closest in energy to the peak: here that is the carbocation valley.',
    why: 'Ionization is steeply uphill, so its transition state sits close in energy to the carbocation at point 3 and looks like it, with the C-Br bond mostly broken. That is why anything that stabilizes the carbocation also lowers this barrier and speeds up SN1.'
  },

  /* ---------------- matching diagrams to mechanisms ---------------- */
  {
    id: 'rcd-19', type: 'rcd', roots: ['l2-arrows'], difficulty: 1,
    stem: 'Which mechanism matches this reaction coordinate diagram?',
    fig: { kind: 'rcd', yLabel: 'Energy', points: [{ kind: 'start', y: 30 }, { kind: 'ts', y: 85 }, { kind: 'end', y: 5 }] },
    choices: [{ text: 'SN2 reaction' }, { text: 'SN1 substitution' }, { text: 'E1 elimination' }, { text: 'SN1 plus a shift' }, { text: 'Acid hydration' }],
    correct: 0,
    coach: 'One peak and no valley is one concerted step.',
    why: 'A single hill with no intermediate is a one-step, concerted mechanism. SN2 forms the new bond and breaks the old one at the same moment. SN1, E1 and acid-catalyzed hydration all pass through a carbocation, which would show up as a valley.'
  },
  {
    id: 'rcd-20', type: 'rcd', roots: ['l2-carbocation'], difficulty: 2,
    stem: 'The diagram shows two steps, the first much slower than the second, with one intermediate between them. Which reaction fits it?',
    fig: two(0, 95, 55, 65, -15),
    choices: [{ text: 'SN1' }, { text: 'SN2' }, { text: 'E2' }, { text: 'Diels-Alder' }, { text: 'Any one-step concerted reaction' }],
    correct: 0,
    coach: 'A slow first hill into a valley is ionization to a carbocation. With a neutral nucleophile like water, a third proton-transfer hill appears.',
    why: 'SN1 starts with a slow ionization that makes a carbocation, the valley, and then a fast attack by the nucleophile. SN2, E2 and Diels-Alder are concerted: one hill, no valley.'
  },
  {
    id: 'rcd-21', type: 'rcd', roots: ['l2-carbocation'], difficulty: 2,
    stem: 'tert-Butyl bromide reacts with water by SN1 to give tert-butanol. What is point 3 on its diagram?',
    fig: { kind: 'rcd', yLabel: 'Energy', points: tagAll(SN1) },
    choices: [{ text: 'The tert-butyl carbocation' }, { text: 'A transition state with a partial bond to Br' }, { text: 'tert-Butanol, the final product' }, { text: 'Protonated tert-butanol' }, { text: 'tert-Butyl bromide' }],
    correct: 0,
    coach: 'The first valley after the slow hill is the cation that hill made.',
    why: 'Step one breaks the C-Br bond, so the first valley is the flat tert-butyl carbocation. Water attacks it to give protonated tert-butanol, which is the second valley at point 5. The peaks are transition states, never isolable species.'
  },

  /* ---------------- temperature ---------------- */
  {
    id: 'rcd-25', type: 'rcd', roots: ['l2-carbocation'], difficulty: 2,
    stem: 'The reaction drawn here is warmed by 20 degrees. What happens to the curve itself?',
    fig: { kind: 'rcd', yLabel: 'Potential energy', points: [{ kind: 'start', y: 20 }, { kind: 'ts', y: 90 }, { kind: 'end', y: 0 }] },
    choices: [{ text: 'Nothing, it stays put' }, { text: 'The peak gets lower' }, { text: 'The products move up' }, { text: 'The barrier and the products both drop' }, { text: 'The heat of reaction flips sign' }],
    correct: 0,
    coach: 'Heat gives more molecules enough energy to clear the same hill; it does not move the hill.',
    why: 'Temperature changes how many molecules have enough energy to get over the barrier, so the rate rises, but the barrier and the landing stay where they are. Only a catalyst lowers the peak.'
  },

  /* ================= conformations ================= */
  {
    id: 'cf-01', type: 'conform', roots: ['l3-newman'], difficulty: 1,
    stem: 'This is the energy of butane as it spins about its C2-C3 bond. Which numbered point is the anti conformation?',
    fig: butane(BUTANE),
    choices: [{ text: 'Point 4' }, { text: 'Point 1' }, { text: 'Point 2' }, { text: 'Point 3' }, { text: 'Points 2 and 4 both' }],
    correct: 0,
    coach: 'Anti means the two methyls are 180 degrees apart, as far as they can get.',
    why: 'At 180 degrees the methyl groups point opposite ways, so there is no crowding at all: the lowest point on the curve. Point 2 is gauche, staggered but with the methyls 60 degrees apart and bumping elbows.'
  },
  {
    id: 'cf-02', type: 'conform', roots: ['l3-newman'], difficulty: 1,
    stem: 'On the butane rotation diagram, which numbered point is a gauche conformation?',
    fig: butane(BUTANE),
    choices: [{ text: 'Point 2' }, { text: 'Point 1' }, { text: 'Point 3' }, { text: 'Point 4' }, { text: 'Every valley on the curve' }],
    correct: 0,
    coach: 'Gauche is the higher of the two kinds of valley: staggered, methyls 60 degrees apart.',
    why: 'Gauche is still staggered, so it is a valley, but the methyls sit 60 degrees apart and crowd each other, so it sits about 3.8 kJ/mol above anti. Point 4 is anti; points 1 and 3 are eclipsed peaks.'
  },
  {
    id: 'cf-03', type: 'conform', roots: ['l3-newman'], difficulty: 1,
    stem: 'Which numbered point on the butane rotation diagram has the two methyl groups eclipsing each other?',
    fig: butane(BUTANE),
    choices: [{ text: 'Point 1' }, { text: 'Point 3' }, { text: 'Point 2' }, { text: 'Point 4' }, { text: 'Every peak on the curve' }],
    correct: 0,
    coach: 'Methyl lined up on methyl is the worst crowding, so it is the tallest peak, at 0 degrees.',
    why: 'At 0 degrees the methyls sit directly on top of each other, like a solar eclipse: the highest energy on the curve. Point 3 is also eclipsed, but methyl over hydrogen, which costs less.'
  },
  {
    id: 'cf-04', type: 'conform', roots: ['l3-newman'], difficulty: 2,
    stem: 'Energies are in kJ/mol. How much more energy does gauche butane have than anti butane?',
    fig: butane(BUTANE.map(p => p.tag === '2' || p.tag === '4' ? Object.assign({}, p, { show: true }) : p)),
    choices: [{ text: '3.8 kJ/mol' }, { text: '0 kJ/mol' }, { text: '16 kJ/mol' }, { text: '19 kJ/mol' }, { text: '15.2 kJ/mol, gauche to peak' }],
    correct: 0, verify: { rcd: 'value', kind: 'ea', from: 3, to: 1 },
    coach: 'Read the two valleys and subtract: gauche at 3.8, anti at 0.',
    why: 'Gauche sits at 3.8 kJ/mol and anti at 0, so gauche is 3.8 kJ/mol higher, the cost of two methyls sitting 60 degrees apart. 16 and 19 are the eclipsed peaks, not valleys.'
  },
  {
    id: 'cf-05', type: 'conform', roots: ['l3-newman'], difficulty: 2,
    stem: 'Energies are in kJ/mol. What is the smallest barrier butane must cross to rotate out of the anti conformation?',
    fig: butane(BUTANE.map(p => p.tag === '3' || p.tag === '4' ? Object.assign({}, p, { show: true }) : p)),
    choices: [{ text: '16 kJ/mol' }, { text: '3.8 kJ/mol' }, { text: '19 kJ/mol' }, { text: '0 kJ/mol' }, { text: '12.2 kJ/mol, peak minus gauche' }],
    correct: 0, verify: { rcd: 'value', kind: 'ea', from: 3, to: 2 },
    coach: 'From anti, the nearest hill is the methyl-over-hydrogen eclipse at 16.',
    why: 'Leaving anti at 0, the next peak in either direction is the eclipsed conformation with methyl over hydrogen at 16 kJ/mol, so the barrier is 16. The 19 kJ/mol peak is further along, past the gauche valley.'
  },
  {
    id: 'cf-07', type: 'conform', roots: ['l3-newman'], difficulty: 1,
    stem: 'This is the energy of ethane as it spins about its C-C bond. Energies are in kJ/mol. What is the barrier to rotation?',
    fig: { kind: 'rcd', yLabel: 'Energy, kJ/mol', xLabel: 'Dihedral angle, degrees', xTicks: TICKS, points: [{ kind: 'ts', y: 12, show: true }, { kind: 'min', y: 0, show: true }, { kind: 'ts', y: 12 }, { kind: 'min', y: 0 }, { kind: 'ts', y: 12 }, { kind: 'min', y: 0 }, { kind: 'ts', y: 12 }] },
    choices: [{ text: '12 kJ/mol' }, { text: '8 kJ/mol' }, { text: '4 kJ/mol' }, { text: '24 kJ/mol' }, { text: '0 kJ/mol, all conformations are equal' }],
    correct: 0, verify: { rcd: 'value', kind: 'ea', from: 1, to: 0 },
    coach: 'Barrier is peak minus valley: eclipsed 12 minus staggered 0.',
    why: 'Staggered ethane sits at 0 and eclipsed at 12 kJ/mol, so it must climb 12 kJ/mol to rotate, about 4 kJ/mol for each of the three eclipsing H-H pairs. That is small enough that ethane spins freely at room temperature, but the conformations are not equal in energy.'
  },
  {
    id: 'cf-08', type: 'conform', roots: ['l3-chair'], difficulty: 1,
    stem: 'Methylcyclohexane flips between two chair conformations. Which chair dominates at room temperature?',
    sub: 'CC1CCCCC1',
    choices: [{ text: 'The methyl-equatorial chair' }, { text: 'The methyl-axial chair' }, { text: 'A 50:50 mix of the two chairs' }, { text: 'The boat, which avoids crowding' }, { text: 'Neither, the ring cannot flip' }],
    correct: 0,
    coach: 'Big groups go equatorial, out at the edge where they have elbow room.',
    why: 'Equatorial methyl points out along the ring edge with nothing in its way. Axial methyl points straight up like a sail and bumps the axial hydrogens two carbons away, costing about 7.3 kJ/mol, so roughly 95 percent of the molecules sit in the equatorial chair. The boat is higher in energy than either chair.'
  },
  {
    id: 'cf-09', type: 'conform', roots: ['l3-chair'], difficulty: 2,
    stem: 'Why is axial methylcyclohexane higher in energy than equatorial methylcyclohexane?',
    sub: 'CC1CCCCC1',
    choices: [{ text: 'Steric crowding with 1,3-diaxial H' }, { text: 'Angle strain in the ring' }, { text: 'Eclipsed bonds around the ring' }, { text: 'Hydrogen bonding between ring carbons' }, { text: 'Axial bonds are longer than equatorial' }],
    correct: 0,
    coach: 'An axial group is on the same side as the axial hydrogens two carbons over, and they crowd each other.',
    why: 'An axial methyl sits parallel to the axial hydrogens on carbons 3 and 5, close enough to bump them: 1,3-diaxial interactions, the same crowding as gauche butane twice over. Both chairs have the same ideal angles and all-staggered bonds, so angle and eclipsing strain do not explain the difference.'
  },
  {
    id: 'cf-10', type: 'conform', roots: ['l3-chair'], difficulty: 3,
    stem: 'In the more stable chair of cis-1-tert-butyl-4-methylcyclohexane, where are the two groups?',
    choices: [{ text: 't-Bu equatorial, methyl axial' }, { text: 'Both equatorial' }, { text: 'Both axial' }, { text: 't-Bu axial, methyl equatorial' }, { text: 'The ring flips evenly between the chairs' }],
    correct: 0,
    coach: 'tert-Butyl is huge, so it takes equatorial first, and cis-1,4 forces the other group axial.',
    why: 'In a cis-1,4 ring one group must be axial and the other equatorial. tert-Butyl is so bulky that it locks itself equatorial, which leaves the methyl axial. Both equatorial would be the trans isomer, a different compound, not a different chair.'
  },
  {
    id: 'cf-06', type: 'conform', roots: ['l3-chair'], difficulty: 2,
    stem: 'What does the more stable chair of trans-1,2-dimethylcyclohexane look like?',
    choices: [{ text: 'Both methyls equatorial' }, { text: 'Both methyls axial' }, { text: 'One axial, one equatorial' }, { text: 'Both chairs are equal in energy' }, { text: 'It sits in a boat instead' }],
    correct: 0,
    coach: 'Trans-1,2 is one up and one down, which in a chair means both axial or both equatorial.',
    why: 'Trans-1,2 lets the two methyls be both equatorial or, after a flip, both axial. Diequatorial avoids the 1,3-diaxial crowding, so it is far more stable. One axial and one equatorial is the cis-1,2 isomer.'
  },
  {
    id: 'cf-11', type: 'conform', roots: ['l3-chair'], difficulty: 3,
    stem: 'Which of these isomers can place both methyl groups equatorial in one of its chairs?',
    choices: [{ text: 'cis-1,3-dimethylcyclohexane' }, { text: 'cis-1,2-dimethylcyclohexane' }, { text: 'trans-1,3-dimethylcyclohexane' }, { text: 'cis-1,4-dimethylcyclohexane' }, { text: 'Any of them, after a ring flip' }],
    correct: 0,
    coach: 'Track up and down: diequatorial needs cis for 1,3, and trans for 1,2 and 1,4.',
    why: 'On a chair, equatorial positions alternate up and down around the ring. So two equatorial groups at 1,3 are both up or both down, cis, while at 1,2 and 1,4 they point opposite ways, trans. cis-1,2, trans-1,3 and cis-1,4 always have one axial group, in both chairs.'
  },
  {
    id: 'cf-12', type: 'conform', roots: ['l3-chair'], difficulty: 3,
    stem: 'An E2 elimination on a substituted chlorocyclohexane needs a specific shape. How must the C-Cl bond and the beta C-H bond be arranged?',
    choices: [{ text: 'Trans and both axial' }, { text: 'Cis and both equatorial' }, { text: 'Both equatorial' }, { text: 'One axial, one equatorial' }, { text: 'Any way, E2 has no shape demand' }],
    correct: 0,
    coach: 'E2 needs the H and the leaving group anti, and on a chair that only happens trans-diaxial.',
    why: 'In E2 the base pulls the hydrogen as the chloride leaves, so the two bonds must line up anti, 180 degrees apart. On a cyclohexane chair only two axial bonds on neighboring carbons, one up and one down, line up that way. If the chlorine sits equatorial, the ring must flip it axial before E2 can happen.'
  },
  {
    id: 'cf-13', type: 'conform', roots: ['l3-chair'], difficulty: 2,
    stem: 'A substituent on a cyclohexane chair is axial and pointing up. Where is it after a ring flip?',
    choices: [{ text: 'Equatorial, still up' }, { text: 'Equatorial and down' }, { text: 'Axial and down' }, { text: 'Axial, still up' }, { text: 'It stays exactly where it was' }],
    correct: 0,
    coach: 'A ring flip swaps axial and equatorial, but up stays up.',
    why: 'Flipping the chair turns every axial position equatorial and every equatorial axial, but no bonds break, so a group on the top face stays on the top face. That is why cis and trans never change in a flip, only which group gets the axial spot.'
  }
];
