/* boards/oc.js : Organic Chemistry whiteboards (shared/ace-board.js draws them).
   The substitution and elimination grid follows the standard sophomore-organic table the DAT tests. */
(function (B) {
  'use strict';
  if (!B) return;
  var K = B.kit, t = K.t, line = K.line, arrow = K.arrow, box = K.box, circ = K.circ, step = K.step, hi = K.hi, path = K.path;

  /* ---------- SN1 / SN2 / E1 / E2 ---------- */
  var CX = [262, 426, 590], RY = [176, 296, 416];
  function cell(col, row, s, o) { return t(CX[col], RY[row], s, o); }
  B.add({
    id: 'sn-e-decide', section: 'ochem', title: 'SN1, SN2, E1 or E2? The decision board',
    sub: 'Read the carbon, then the reagent. Nine boxes, four answers.',
    svg: K.svg(
      line([[180, 30], [180, 470]], { w: 4 }), line([[344, 30], [344, 470]], { w: 3 }), line([[508, 30], [508, 470]], { w: 3 }),
      line([[20, 104], [690, 104]], { w: 4 }), line([[20, 228], [690, 228]], { w: 3 }), line([[20, 348], [690, 348]], { w: 3 }),
      t(262, 78, '1°', { size: 46 }), t(426, 78, '2°', { size: 46 }), t(590, 78, '3°', { size: 46 }),
      t(98, 156, 'good Nu,', { size: 25 }), t(98, 184, 'weak base', { size: 25 }), t(98, 214, 'I^{-}  CN^{-}  RS^{-}', { size: 21, c: 'mute' }),
      t(98, 290, 'strong base', { size: 25 }), t(98, 322, 'OH^{-}  RO^{-}', { size: 21, c: 'mute' }),
      t(98, 400, 'weak Nu,', { size: 25 }), t(98, 428, 'weak base', { size: 25 }), t(98, 458, 'H_{2}O  ROH', { size: 21, c: 'mute' }),
      step(1, cell(0, 0, 'S_{N}2', { size: 40, c: 'blue' }), cell(1, 0, 'S_{N}2', { size: 40, c: 'blue' }), cell(0, 1, 'S_{N}2', { size: 40, c: 'blue' })),
      step(2, cell(1, 1, 'E2', { size: 42, c: 'rose' }), cell(2, 1, 'E2', { size: 42, c: 'rose' }), t(262, 334, 'bulky base: E2', { size: 21, c: 'rose' })),
      step(3, cell(2, 0, 'S_{N}1', { size: 40, c: 'purple' }), cell(1, 2, 'S_{N}1 + E1', { size: 30, c: 'purple' }), cell(2, 2, 'S_{N}1 + E1', { size: 30, c: 'purple' })),
      step(4, cell(0, 2, 'no rxn', { size: 30, c: 'mute' }), t(590, 216, 'never S_{N}2', { size: 21, c: 'goldInk' })),
      step(5, hi(60, 492, 600, 30, { c: 'gold', op: 0.3 }), t(360, 516, 'S_{N}2: inversion    S_{N}1: racemic    E2: anti', { size: 24, c: 'ink' }), t(360, 548, 'heat favors elimination', { size: 23, c: 'goldInk' }))
    ),
    predict: { q: 'A tertiary alkyl halide can never react by which mechanism?', choices: ['S_{N}1', 'S_{N}2', 'E2'], answer: 1, why: 'S_{N}2 needs a backside attack on the carbon. Three alkyl groups block the way.' },
    steps: [
      'S_{N}2 is one step: the nucleophile attacks from the back as the leaving group leaves. It needs room, so it wins on methyl and primary carbons, and on secondary with a good nucleophile that is a weak base.',
      'A strong base on a secondary or tertiary carbon pulls off a neighboring H instead: E2, also one step. A bulky base such as tert-butoxide gives E2 even on a primary carbon.',
      'A weak nucleophile waits for the leaving group to go first. That makes a carbocation, so it needs a secondary or (better) tertiary carbon. S_{N}1 and E1 share that cation and come as a mixture.',
      'Primary carbons do not form stable carbocations: with a weak nucleophile, nothing happens. Tertiary carbons never do S_{N}2.',
      'Tells for the answer choices: S_{N}2 inverts the stereocenter, S_{N}1 gives a racemic mix, E2 needs the H and leaving group anti-periplanar. Heat pushes toward elimination.'
    ],
    tryIt: [
      { q: '2-Bromopropane is treated with sodium ethoxide in ethanol. Major pathway?', choices: ['E2', 'S_{N}1', 'No reaction'], answer: 0, why: 'A secondary carbon with a strong base: E2 is the major pathway.' },
      { q: '1-Bromobutane is treated with NaCN in DMSO. Mechanism?', choices: ['E1', 'S_{N}1', 'S_{N}2'], answer: 2, why: 'Primary carbon, good nucleophile, polar aprotic solvent: all three point to S_{N}2.' },
      { q: 'tert-Butyl bromide is warmed in water. What forms?', choices: ['Only an S_{N}2 product', 'S_{N}1 and E1 products', 'Nothing'], answer: 1, why: 'Tertiary carbon and a weak nucleophile: the carbocation forms, then substitution and elimination both happen.' }
    ],
    path: { title: 'The S_{N}1 mechanism, step by step', steps: ['The leaving group leaves (slow step)', 'A planar carbocation forms', 'It rearranges if a more stable cation is one shift away', 'The nucleophile attacks either face', 'A proton is lost to give the neutral product'] },
    more: [{ label: 'Substitution and elimination hub', href: '/tools/ochem/?from=see#subelim' }]
  });

  /* ---------- EAS directors ---------- */
  var HEX = [[360, 206], [440, 252], [440, 344], [360, 390], [280, 344], [280, 252]];
  B.add({
    id: 'eas-directors', section: 'ochem', title: 'EAS directors: where the next group lands',
    flick: {
      title: 'Activate or deactivate the ring?', up: 'Activates', down: 'Deactivates',
      cards: [
        { q: 'An OH group on the ring', up: true, why: 'Its lone pair donates into the ring. Ortho, para director.' },
        { q: 'An NH_{2} group on the ring', up: true, why: 'Strong lone pair donor. Ortho, para director.' },
        { q: 'An OCH_{3} group on the ring', up: true, why: 'Oxygen lone pair donates by resonance. Ortho, para.' },
        { q: 'A CH_{3} group on the ring', up: true, why: 'Alkyl groups donate weakly. Ortho, para.' },
        { q: 'An NO_{2} group on the ring', up: false, why: 'Strong electron withdrawal. Meta director.' },
        { q: 'A CN group on the ring', up: false, why: 'Pulls electrons out by resonance. Meta director.' },
        { q: 'A COOH group on the ring', up: false, why: 'The carbonyl withdraws electrons. Meta director.' },
        { q: 'A CHO group on the ring', up: false, why: 'The carbonyl withdraws electrons. Meta director.' },
        { q: 'An SO_{3}H group on the ring', up: false, why: 'Strongly withdrawing. Meta director.' },
        { q: 'A Cl atom on the ring', up: false, why: 'Halogens deactivate, yet still direct ortho, para.' },
        { q: 'A Br atom on the ring', up: false, why: 'Halogens deactivate, yet still direct ortho, para.' },
        { q: 'A CF_{3} group on the ring', up: false, why: 'Strong inductive withdrawal. Meta director.' },
        { q: 'An NHCOCH_{3} group on the ring', up: true, why: 'The nitrogen lone pair still donates. Ortho, para.' }
      ]
    },
    sub: 'Donors send it ortho and para. Withdrawers send it meta.',
    svg: K.svg(
      line(HEX.concat([HEX[0]]), { w: 5.5 }), circ(360, 298, 52, { w: 4 }),
      line([[360, 206], [360, 150]], { w: 5.5 }), circ(360, 118, 32, { c: 'gold', w: 5, fill: 'gold', op: 0.35 }), t(360, 131, 'G', { size: 38 }),
      step(1, t(472, 250, 'ortho', { size: 27, a: 's' }), t(248, 250, 'ortho', { size: 27, a: 'e' }), t(472, 364, 'meta', { size: 27, a: 's' }), t(248, 364, 'meta', { size: 27, a: 'e' }), t(360, 432, 'para', { size: 27 })),
      step(2, circ(440, 252, 16, { c: 'blue', w: 5, fill: 'blue', op: 0.45 }), circ(280, 252, 16, { c: 'blue', w: 5, fill: 'blue', op: 0.45 }), circ(360, 390, 16, { c: 'blue', w: 5, fill: 'blue', op: 0.45 }),
        t(112, 60, 'DONORS', { size: 30, c: 'blue' }), t(112, 100, '−NH_{2}   −OH', { size: 26, c: 'blue' }), t(112, 136, '−OR   −R', { size: 26, c: 'blue' }), t(112, 176, 'faster: o / p', { size: 24, c: 'blue' })),
      step(3, circ(440, 344, 16, { c: 'rose', w: 5, fill: 'rose', op: 0.45 }), circ(280, 344, 16, { c: 'rose', w: 5, fill: 'rose', op: 0.45 }),
        t(600, 60, 'WITHDRAWERS', { size: 27, c: 'rose' }), t(600, 100, '−NO_{2}   −CN', { size: 26, c: 'rose' }), t(600, 136, '−SO_{3}H   C=O', { size: 26, c: 'rose' }), t(600, 176, 'slower: meta', { size: 24, c: 'rose' })),
      step(4, t(360, 488, 'halogens: slower, but still o / p', { size: 26, c: 'purple' })),
      step(5, hi(96, 512, 528, 30, { c: 'gold', op: 0.3 }), t(360, 536, 'lone pair on the atom touching the ring: o / p', { size: 23, c: 'ink' }))
    ),
    predict: { q: 'Toluene (a methyl group on benzene) is nitrated. Where does the nitro group mainly go?', choices: ['Meta', 'Ortho and para', 'It replaces the methyl group'], answer: 1, why: 'An alkyl group donates electron density. Donors direct ortho and para.' },
    steps: [
      'Count from the group already on the ring: next door is ortho, one further is meta, straight across is para.',
      'Electron donors (activators) such as −NH_{2}, −OH, −OR and alkyl groups make the ring react faster and stabilize attack at ortho and para.',
      'Electron withdrawers (deactivators) such as −NO_{2}, −CN, −SO_{3}H and carbonyl groups make the ring slower. Meta is the least-bad position.',
      'The one exception: halogens. They withdraw by induction, so the ring is slower, but their lone pairs still direct ortho and para.',
      'A quick test: if the atom attached to the ring has a lone pair, it directs ortho and para. If it has a positive or partial positive charge, it directs meta.'
    ],
    tryIt: [
      { q: 'Nitrobenzene is brominated with Br_{2} and FeBr_{3}. Where does Br go?', choices: ['Meta', 'Ortho and para', 'On the nitrogen'], answer: 0, why: '−NO_{2} is a strong withdrawer, so it is a meta director.' },
      { q: 'Which group deactivates the ring but still directs ortho and para?', choices: ['−NO_{2}', '−OH', '−Cl'], answer: 2, why: 'Halogens are the exception: deactivating by induction, ortho and para directing by resonance.' },
      { q: 'Which ring reacts fastest in electrophilic aromatic substitution?', choices: ['Nitrobenzene', 'Phenol', 'Benzene'], answer: 1, why: '−OH is a strong donor, so phenol is far more reactive than benzene. Nitrobenzene is the slowest.' }
    ],
    more: [{ label: 'Benzene reaction wheel', href: '/tools/ochem/?game=wheel&wheel=benzene&from=see' }]
  });

  /* ---------- Enolates: the alpha carbon ---------- */
  B.add({
    id: 'enolates', section: 'ochem', title: 'The alpha carbon wakes up',
    sub: 'An acidic hydrogen, an enolate, and a new carbon to carbon bond.',
    svg: K.svg(
      line([[60, 270], [140, 224], [220, 270], [300, 224]], { w: 5.5 }),
      line([[132, 224], [132, 140]], { w: 5.5 }), line([[148, 224], [148, 140]], { w: 5.5 }), t(140, 124, 'O', { size: 38 }),
      line([[220, 270], [220, 340]], { w: 5.5 }), t(220, 378, 'H', { size: 38 }),
      line([[440, 270], [520, 224], [594, 266]], { w: 5.5 }),
      line([[512, 224], [512, 140]], { w: 5.5 }), line([[528, 224], [528, 140]], { w: 5.5 }), t(520, 124, 'O', { size: 38 }), t(620, 290, 'H', { size: 34 }),
      step(1, circ(220, 270, 20, { c: 'gold', w: 5, fill: 'gold', op: 0.4 }), t(244, 314, 'α carbon', { size: 26, c: 'goldInk', a: 's' }), t(244, 372, 'pK_{a} about 20', { size: 25, c: 'rose', a: 's' })),
      step(2, t(96, 420, 'base', { size: 28, c: 'blue' }), arrow(132, 404, 198, 372, { c: 'blue', w: 4.5, bend: 10 }), t(40, 470, 'enolate: the − charge is', { size: 24, c: 'blue', a: 's' }), t(40, 500, 'shared by C and O', { size: 24, c: 'blue', a: 's' })),
      step(3, arrow(244, 262, 500, 232, { c: 'purple', w: 5, bend: -46 }), t(372, 180, 'new C−C bond', { size: 26, c: 'purple' }), t(520, 262, 'δ+', { size: 26, c: 'purple' })),
      step(4, t(696, 400, 'aldol:', { size: 27, c: 'green', a: 'e' }), t(696, 432, 'β-hydroxy carbonyl', { size: 25, c: 'green', a: 'e' }), t(696, 470, 'then heat: lose H_{2}O,', { size: 23, c: 'green', a: 'e' }), t(696, 498, 'get a C=C', { size: 23, c: 'green', a: 'e' })),
      step(5, hi(300, 522, 400, 30, { c: 'gold', op: 0.3 }), t(696, 546, 'Claisen (two esters): β-keto ester', { size: 24, c: 'ink', a: 'e' }))
    ),
    predict: { q: 'A base is added to a ketone. Which hydrogen does it remove?', choices: ['One on the carbon next to the C=O', 'One on the carbon farthest from the C=O', 'None: ketones have no acidic hydrogens'], answer: 0, why: 'The hydrogens on the alpha carbon are acidic because the anion left behind is stabilized by the carbonyl.' },
    steps: [
      'The carbon next to a carbonyl is the alpha carbon. Its hydrogens have a pK_{a} near 20, far more acidic than an ordinary C−H (about 50).',
      'A base removes an alpha hydrogen and leaves an enolate. Resonance spreads the negative charge between the alpha carbon and the oxygen, which is why it forms at all.',
      'The enolate\'s alpha carbon is a nucleophile. It attacks the partially positive carbonyl carbon of a second molecule and makes a new carbon to carbon bond.',
      'Aldehyde or ketone partner: an aldol reaction. The product is a β-hydroxy carbonyl. With heat it loses water to give an α,β-unsaturated carbonyl (aldol condensation).',
      'Ester partner: a Claisen condensation. The alkoxide leaves and the product is a β-keto ester.'
    ],
    tryIt: [
      { q: 'What is the product of an aldol addition?', choices: ['A β-keto ester', 'A β-hydroxy aldehyde or ketone', 'An acetal'], answer: 1, why: 'The enolate adds to a carbonyl, which becomes the OH two carbons away: β-hydroxy.' },
      { q: 'Two esters react with an alkoxide base (Claisen condensation). The product is:', choices: ['A β-keto ester', 'A β-hydroxy ketone', 'A diol'], answer: 0, why: 'The enolate attacks an ester and the alkoxide leaves, restoring the C=O: a β-keto ester.' },
      { q: 'Why is an alpha hydrogen acidic?', choices: ['The C−H bond is ionic', 'Carbon is more electronegative than oxygen', 'The conjugate base is resonance stabilized onto oxygen'], answer: 2, why: 'In the enolate the negative charge is shared with the electronegative oxygen.' }
    ],
    path: { title: 'The aldol condensation', steps: ['A base removes an alpha hydrogen', 'The enolate forms, stabilized by resonance', 'The alpha carbon attacks a second carbonyl carbon', 'The alkoxide is protonated: a β-hydroxy carbonyl', 'Heat removes water: an α,β-unsaturated carbonyl'] },
    more: [{ label: 'Aldehyde reaction wheel', href: '/tools/ochem/?game=wheel&wheel=aldehyde&from=see' }]
  });
})(typeof window !== 'undefined' ? window.AceBoard : (typeof require === 'function' ? require('../ace-board.js') : null));
