/* boards/bio.js : Biology whiteboards (shared/ace-board.js draws them).
   ATP counts follow the rest of the site: about 30 to 32 ATP per glucose (older books: 36 to 38). */
(function (B) {
  'use strict';
  if (!B) return;
  var K = B.kit, t = K.t, line = K.line, arrow = K.arrow, box = K.box, circ = K.circ, step = K.step, hi = K.hi, path = K.path;

  /* ---------- Cellular respiration ---------- */
  B.add({
    id: 'respiration', section: 'bio', title: 'Cellular respiration: follow the glucose',
    sub: 'Four stages, two places, about 30 to 32 ATP.',
    svg: K.svg(
      box(270, 30, 432, 494, { r: 80, c: 'green', w: 5, fill: 'green', op: 0.05 }),
      path('M282 404 Q312 386 342 404 T402 404 T462 404 T522 404 T582 404 T690 404', { c: 'green', w: 5 }),
      box(300, 388, 38, 32, { r: 8, c: 'purple', fill: 'purple', op: 0.3 }), box(370, 388, 38, 32, { r: 8, c: 'purple', fill: 'purple', op: 0.3 }), box(440, 388, 38, 32, { r: 8, c: 'purple', fill: 'purple', op: 0.3 }),
      circ(620, 404, 24, { c: 'gold', w: 5, fill: 'gold', op: 0.35 }),
      line([[120, 52], [150, 70], [150, 104], [120, 122], [90, 104], [90, 70], [120, 52]], { c: 'blue', w: 4.5, fill: 'blue', op: 0.12 }),
      arrow(120, 170, 120, 300, { c: 'blue', w: 5 }),
      circ(98, 328, 15, { c: 'blue', fill: 'blue', op: 0.15 }), circ(144, 328, 15, { c: 'blue', fill: 'blue', op: 0.15 }),
      arrow(206, 362, 322, 160, { c: 'ink', w: 4, bend: 34 }),
      circ(500, 240, 66, { c: 'rose', w: 5 }), path('M556 196 L566 232 L534 222', { c: 'rose', w: 5 }),
      arrow(430, 150, 462, 184, { c: 'ink', w: 4 }),
      t(130, 546, 'cytosol', { size: 24, c: 'mute' }), t(486, 550, 'mitochondrion', { size: 24, c: 'mute' }),
      step(1, t(120, 156, 'glucose', { size: 26, c: 'blue' }), t(120, 374, '2 pyruvate', { size: 26, c: 'blue' }), t(136, 222, 'glycolysis', { size: 25, c: 'blue', a: 's' }), t(136, 252, '2 ATP', { size: 25, c: 'goldInk', a: 's' }), t(136, 280, '2 NADH', { size: 25, c: 'goldInk', a: 's' })),
      step(2, t(376, 104, '2 acetyl-CoA', { size: 26, c: 'ink' }), t(376, 134, '2 NADH, 2 CO_{2}', { size: 23, c: 'goldInk' })),
      step(3, t(500, 250, 'Krebs', { size: 30, c: 'rose' }), t(584, 214, '6 NADH', { size: 23, c: 'goldInk', a: 's' }), t(584, 246, '2 FADH_{2}', { size: 23, c: 'goldInk', a: 's' }), t(584, 278, '2 ATP', { size: 23, c: 'goldInk', a: 's' })),
      step(4, arrow(319, 424, 319, 470, { c: 'purple', w: 4, head: 11 }), arrow(389, 424, 389, 470, { c: 'purple', w: 4, head: 11 }), arrow(459, 424, 459, 470, { c: 'purple', w: 4, head: 11 }), t(389, 502, 'H^{+} pumped out', { size: 24, c: 'purple' }), t(410, 366, 'ETC:  O_{2} → H_{2}O', { size: 25, c: 'purple' })),
      step(5, arrow(620, 478, 620, 352, { c: 'gold', w: 6 }), t(620, 336, '~28 ATP', { size: 27, c: 'goldInk' }), hi(40, 462, 180, 32, { c: 'gold' }), t(130, 452, 'total: about', { size: 25, c: 'ink' }), t(130, 486, '30 to 32 ATP', { size: 28, c: 'ink' }))
    ),
    predict: { q: 'Which stage makes most of the ATP?', choices: ['Glycolysis', 'The Krebs cycle', 'The electron transport chain with ATP synthase'], answer: 2, why: 'Glycolysis and Krebs make 2 ATP each. Oxidative phosphorylation makes the rest, about 28.' },
    steps: [
      'Glycolysis, in the cytosol: one glucose is split into 2 pyruvate. Net 2 ATP and 2 NADH. No oxygen needed.',
      'Pyruvate oxidation, in the mitochondrial matrix: each pyruvate loses a CO_{2} and becomes acetyl-CoA. 2 NADH per glucose.',
      'Krebs cycle, in the matrix. Two turns per glucose give 6 NADH, 2 FADH_{2}, 2 ATP and 4 CO_{2}.',
      'Electron transport chain, on the inner membrane: NADH and FADH_{2} hand off electrons, H^{+} is pumped out, and O_{2} is the final electron acceptor, forming water.',
      'Chemiosmosis: H^{+} flows back through ATP synthase and makes about 28 ATP. Total: about 30 to 32 per glucose (older books say 36 to 38).'
    ],
    tryIt: [
      { q: 'Where does glycolysis happen?', choices: ['Cytosol', 'Mitochondrial matrix', 'Inner mitochondrial membrane'], answer: 0, why: 'Glycolysis is in the cytosol. Everything after it is in the mitochondrion.' },
      { q: 'What is the final electron acceptor of the electron transport chain?', choices: ['NAD^{+}', 'O_{2}', 'CO_{2}'], answer: 1, why: 'Oxygen takes the electrons at the end of the chain and is reduced to water.' },
      { q: 'Per glucose, how much ATP does the Krebs cycle make directly?', choices: ['About 28', '0', '2'], answer: 2, why: 'One ATP (as GTP) per turn, two turns per glucose. Its big output is NADH and FADH_{2} for the chain.' }
    ],
    path: { title: 'Cellular respiration', steps: ['Glucose enters glycolysis in the cytosol', 'Pyruvate moves into the mitochondrion', 'Pyruvate is oxidized to acetyl-CoA', 'The Krebs cycle loads NADH and FADH_{2}', 'The electron transport chain pumps H^{+}', 'ATP synthase makes most of the ATP'] },
    more: [{ label: 'Biology plates: label the mitochondrion', href: '/bio/see/' }]
  });

  /* ---------- Photosynthesis ---------- */
  var rays = [[30, 18], [100, 22], [110, 62]].map(function (p) { return line([[64 + (p[0] - 64) * 0.75, 50 + (p[1] - 50) * 0.75], [64 + (p[0] - 64) * 1.25, 50 + (p[1] - 50) * 1.25]], { c: 'gold', w: 4 }); }).join('');
  B.add({
    id: 'photosynthesis', section: 'bio', title: 'Photosynthesis: two linked factories',
    sub: 'Light reactions feed the Calvin cycle.',
    svg: K.svg(
      box(22, 96, 676, 420, { r: 150, c: 'green', w: 5, fill: 'green', op: 0.06 }),
      circ(64, 50, 20, { c: 'gold', w: 5, fill: 'gold', op: 0.5 }), rays,
      box(96, 196, 200, 40, { r: 20, c: 'green', w: 4.5, fill: 'green', op: 0.25 }), box(96, 244, 200, 40, { r: 20, c: 'green', w: 4.5, fill: 'green', op: 0.25 }), box(96, 292, 200, 40, { r: 20, c: 'green', w: 4.5, fill: 'green', op: 0.25 }),
      circ(530, 310, 76, { c: 'blue', w: 5 }), path('M594 262 L604 300 L570 290', { c: 'blue', w: 5 }),
      t(196, 272, 'thylakoids', { size: 22, c: 'ink' }), t(560, 160, 'stroma', { size: 24, c: 'mute' }),
      step(1, arrow(96, 78, 150, 186, { c: 'gold', w: 5 }), t(196, 176, 'light reactions', { size: 26, c: 'green' }), arrow(150, 458, 150, 344, { c: 'blue', w: 4 }), t(150, 494, 'H_{2}O', { size: 28, c: 'blue' }), arrow(236, 344, 262, 440, { c: 'rose', w: 4 }), t(268, 474, 'O_{2}', { size: 30, c: 'rose' })),
      step(2, arrow(304, 232, 448, 276, { c: 'gold', w: 5, bend: -14 }), t(380, 222, 'ATP + NADPH', { size: 25, c: 'goldInk' })),
      step(3, t(520, 306, 'Calvin', { size: 26, c: 'blue' }), t(520, 334, 'cycle', { size: 26, c: 'blue' }), arrow(640, 40, 580, 226, { c: 'ink', w: 4, bend: -12 }), t(672, 34, 'CO_{2}', { size: 30, c: 'ink', a: 'e' }), t(642, 262, 'RuBisCO', { size: 22, c: 'ink' })),
      step(4, arrow(530, 392, 530, 458, { c: 'purple', w: 5 }), t(530, 490, 'G3P → sugar', { size: 26, c: 'purple' })),
      step(5, arrow(448, 340, 304, 300, { c: 'mute', w: 4, bend: -14 }), t(376, 362, 'ADP + NADP^{+}', { size: 23, c: 'mute' }))
    ),
    predict: { q: 'The O_{2} a plant releases comes from which molecule?', choices: ['CO_{2}', 'H_{2}O', 'Glucose'], answer: 1, why: 'Photosystem II splits water for electrons. The oxygen left over is released.' },
    steps: [
      'Light reactions, in the thylakoid membranes: light energy pulls electrons from water. Water in, O_{2} out.',
      'Those electrons run photosystem II, then photosystem I. The result is ATP and NADPH, shipped to the stroma.',
      'Calvin cycle, in the stroma: RuBisCO fixes CO_{2} onto RuBP. No light needed directly, but it needs the ATP and NADPH.',
      'Three CO_{2} turn the cycle enough to export one G3P, the three-carbon sugar that builds glucose. Cost: 9 ATP and 6 NADPH.',
      'The spent carriers, ADP and NADP^{+}, go back to the thylakoids to be recharged. The two factories only work together.'
    ],
    tryIt: [
      { q: 'Where does the Calvin cycle run?', choices: ['Stroma', 'Thylakoid lumen', 'Cytosol'], answer: 0, why: 'Calvin cycle: stroma. Light reactions: thylakoid membranes.' },
      { q: 'What do the light reactions supply to the Calvin cycle?', choices: ['O_{2} and glucose', 'CO_{2} and water', 'ATP and NADPH'], answer: 2, why: 'ATP for energy and NADPH for reducing power. O_{2} is a by-product.' },
      { q: 'Which enzyme fixes CO_{2} in the Calvin cycle?', choices: ['ATP synthase', 'RuBisCO', 'Helicase'], answer: 1, why: 'RuBisCO attaches CO_{2} to the five-carbon RuBP.' }
    ],
    path: { title: 'Photosynthesis', steps: ['Light excites electrons in photosystem II', 'Water is split to replace them, releasing O_{2}', 'The electron chain pumps H^{+}, which drives ATP synthase', 'Photosystem I re-energizes the electrons and makes NADPH', 'The Calvin cycle uses ATP and NADPH to fix CO_{2} into G3P'] },
    more: [{ label: 'Biology plates: label the chloroplast', href: '/bio/see/' }]
  });

  /* ---------- Central dogma ---------- */
  var helixA = 'M70 226 Q100 186 130 226 T190 226 T250 226 T310 226', helixB = 'M70 226 Q100 266 130 226 T190 226 T250 226 T310 226';
  var beads = [[598, 262], [622, 232], [650, 208], [668, 176], [660, 142], [634, 122]];
  B.add({
    id: 'central-dogma', section: 'bio', title: 'The central dogma: DNA to RNA to protein',
    sub: 'Three processes and where each one happens.',
    svg: K.svg(
      circ(196, 282, 180, 222, { c: 'purple', w: 5, fill: 'purple', op: 0.05 }),
      path(helixA, { c: 'blue', w: 5 }), path(helixB, { c: 'rose', w: 5 }),
      circ(560, 316, 54, 36, { c: 'ink', w: 4.5, fill: 'gold', op: 0.3 }), circ(560, 366, 44, 22, { c: 'ink', w: 4.5, fill: 'gold', op: 0.2 }),
      t(196, 478, 'nucleus', { size: 24, c: 'mute' }), t(560, 528, 'cytoplasm', { size: 24, c: 'mute' }), t(560, 430, 'ribosome', { size: 24, c: 'mute' }),
      step(1, path('M148 176 Q196 120 244 176', { c: 'blue', w: 4.5 }), path('M232 150 L244 176 L216 172', { c: 'blue', w: 4.5 }), t(196, 122, 'replication', { size: 27, c: 'blue' })),
      step(2, arrow(190, 262, 190, 306, { c: 'green', w: 4.5 }), path('M96 344 Q120 322 144 344 T192 344 T240 344 T290 344', { c: 'green', w: 5 }), t(196, 392, 'transcription', { size: 27, c: 'green' })),
      step(3, t(196, 428, 'cap, tail, splice', { size: 24, c: 'green' }), arrow(300, 344, 470, 344, { c: 'green', w: 4.5, bend: -10 }), t(420, 322, 'mRNA', { size: 26, c: 'green' })),
      step(4, path('M470 344 Q500 336 520 344 T600 344 T660 344', { c: 'green', w: 5 }), t(600, 478, 'translation', { size: 27, c: 'rose' }), t(476, 296, 'AUG', { size: 24, c: 'rose' })),
      step(5, beads.map(function (p, i) { return circ(p[0], p[1], 13, { c: 'rose', w: 4, fill: i % 2 ? 'gold' : 'rose', op: 0.4 }); }).join(''), t(560, 104, 'protein', { size: 28, c: 'rose' }))
    ),
    predict: { q: 'In a eukaryotic cell, where is mRNA made?', choices: ['In the nucleus', 'On a ribosome', 'In the Golgi'], answer: 0, why: 'Transcription happens where the DNA is. The finished mRNA is then exported to the cytoplasm.' },
    steps: [
      'Replication: DNA copies itself in the nucleus during S phase. It is semiconservative: each new helix keeps one old strand.',
      'Transcription: RNA polymerase reads one DNA strand 3\' to 5\' and builds RNA 5\' to 3\'. U replaces T.',
      'Processing in eukaryotes: a 5\' cap, a poly-A tail, and splicing removes introns. The mature mRNA leaves through a nuclear pore.',
      'Translation: a ribosome reads the mRNA three bases at a time, starting at AUG. Each tRNA brings the matching amino acid.',
      'The amino acids are joined by peptide bonds into a polypeptide until a stop codon is reached. It then folds into a protein.'
    ],
    tryIt: [
      { q: 'A DNA template reads 3\'-TAC-5\'. What is the mRNA codon?', choices: ['5\'-ATG-3\'', '5\'-AUG-3\'', '5\'-UAC-3\''], answer: 1, why: 'Pair each base and swap T for U: T gives A, A gives U, C gives G. AUG, the start codon.' },
      { q: 'What is removed from pre-mRNA before it leaves the nucleus?', choices: ['Exons', 'The 5\' cap', 'Introns'], answer: 2, why: 'Introns are cut out. Exons are joined and expressed.' },
      { q: 'DNA replication is described as:', choices: ['Semiconservative', 'Conservative', 'Dispersive'], answer: 0, why: 'Each daughter helix has one parent strand and one new strand.' }
    ],
    path: { title: 'From gene to protein', steps: ['DNA unwinds at the gene', 'RNA polymerase builds pre-mRNA', 'Cap, tail and splicing', 'mRNA leaves through a nuclear pore', 'A ribosome binds and finds AUG', 'tRNAs add amino acids until a stop codon'] }
  });

  /* ---------- Nephron and its hormones ---------- */
  B.add({
    id: 'nephron', section: 'bio', title: 'The nephron and its hormones',
    sub: 'Filter, take back, concentrate. ADH and aldosterone tune the end.',
    svg: K.svg(
      line([[20, 264], [700, 264]], { c: 'mute', w: 2.5, dash: '3 12' }), t(690, 254, 'cortex', { size: 22, c: 'mute', a: 'e' }), t(690, 290, 'medulla', { size: 22, c: 'mute', a: 'e' }),
      circ(80, 150, 30, { c: 'rose', w: 5, fill: 'rose', op: 0.25 }), path('M62 150 Q72 132 82 150 T100 150', { c: 'rose', w: 3.5 }),
      path('M96 108 Q130 120 130 150 Q130 184 92 194', { c: 'ink', w: 5 }),
      path('M130 150 Q150 112 172 150 T214 150 T256 150 L280 150', { c: 'ink', w: 5.5 }),
      path('M280 150 L300 440 Q304 476 326 476 Q350 476 352 440 L362 170', { c: 'ink', w: 5.5 }),
      path('M362 170 Q384 132 406 170 T450 170 T494 170 L522 170', { c: 'ink', w: 5.5 }),
      box(522, 130, 46, 396, { r: 12, c: 'ink', w: 5, fill: 'gold', op: 0.18 }),
      arrow(545, 500, 545, 548, { c: 'gold', w: 5, head: 11 }), t(600, 548, 'urine', { size: 24, c: 'mute' }),
      step(1, t(80, 228, 'filtration', { size: 26, c: 'rose' }), arrow(20, 110, 54, 134, { c: 'rose', w: 4, head: 11 }), t(20, 96, 'blood in', { size: 23, c: 'rose', a: 's' })),
      step(2, arrow(196, 126, 196, 84, { c: 'blue', w: 4, head: 11 }), arrow(238, 126, 238, 84, { c: 'blue', w: 4, head: 11 }), t(250, 62, 'PCT: most comes back', { size: 24, c: 'blue' })),
      step(3, arrow(284, 330, 240, 330, { c: 'blue', w: 4, head: 11 }), t(232, 338, 'water out', { size: 24, c: 'blue', a: 'e' }), arrow(362, 330, 404, 330, { c: 'purple', w: 4, head: 11 }), t(412, 338, 'salt out', { size: 24, c: 'purple', a: 's' }), t(326, 520, 'loop of Henle', { size: 24, c: 'ink' })),
      step(4, t(540, 62, 'aldosterone:', { size: 25, c: 'green' }), t(540, 94, 'keep Na^{+}, lose K^{+}', { size: 24, c: 'green' }), arrow(450, 146, 450, 112, { c: 'green', w: 4, head: 11 })),
      step(5, arrow(520, 400, 474, 400, { c: 'teal', w: 5 }), arrow(520, 450, 474, 450, { c: 'teal', w: 5 }), t(580, 392, 'ADH:', { size: 30, c: 'teal', a: 's' }), t(580, 424, 'water', { size: 25, c: 'teal', a: 's' }), t(580, 452, 'back to', { size: 25, c: 'teal', a: 's' }), t(580, 480, 'blood', { size: 25, c: 'teal', a: 's' }))
    ),
    predict: { q: 'Which hormone makes the collecting duct more permeable to water?', choices: ['Aldosterone', 'Insulin', 'ADH'], answer: 2, why: 'ADH (vasopressin) adds water channels to the collecting duct, so water leaves the urine and returns to the blood.' },
    steps: [
      'Filtration: blood pressure pushes water, glucose, ions and urea out of the glomerulus into Bowman\'s capsule. Cells and proteins stay in the blood.',
      'Proximal convoluted tubule: most of the filtrate is reabsorbed here, including all of the glucose and amino acids in a healthy kidney.',
      'Loop of Henle: the descending limb lets water out, the ascending limb pumps salt out. Together they make the medulla salty.',
      'Distal tubule and collecting duct: aldosterone (from the adrenal cortex) makes them reabsorb Na^{+} and secrete K^{+}. Water follows the sodium.',
      'Collecting duct: ADH (from the posterior pituitary) opens water channels. More ADH, more water saved, more concentrated urine.'
    ],
    tryIt: [
      { q: 'Glucose in the filtrate is normally reabsorbed in the:', choices: ['Proximal convoluted tubule', 'Loop of Henle', 'Collecting duct'], answer: 0, why: 'The PCT takes back nearly all glucose and amino acids.' },
      { q: 'Aldosterone acts on the nephron to:', choices: ['Secrete Na^{+} and reabsorb K^{+}', 'Reabsorb Na^{+} and secrete K^{+}', 'Block water reabsorption'], answer: 1, why: 'Sodium is kept, potassium is lost, and water follows the sodium. Blood volume and pressure rise.' },
      { q: 'A dehydrated person has:', choices: ['Low ADH and dilute urine', 'No change in ADH', 'High ADH and concentrated urine'], answer: 2, why: 'High blood osmolarity triggers ADH release. Water is reabsorbed, so the urine is concentrated.' }
    ],
    path: { title: 'Filtrate through the nephron', steps: ['Glomerulus', 'Bowman\'s capsule', 'Proximal convoluted tubule', 'Loop of Henle', 'Distal convoluted tubule', 'Collecting duct'] },
    more: [{ label: 'Biology plates: label the nephron', href: '/bio/see/' }]
  });
})(typeof window !== 'undefined' ? window.AceBoard : (typeof require === 'function' ? require('../ace-board.js') : null));
