/* boards/bio2.js : Biology whiteboards, set two (shared/ace-board.js draws them). */
(function (B) {
  'use strict';
  if (!B) return;
  var K = B.kit, t = K.t, line = K.line, arrow = K.arrow, box = K.box, circ = K.circ, step = K.step, hi = K.hi, dot = K.dot, curve = K.curve, rect = K.rect;

  /* ---------- Membrane transport ---------- */
  function lipids() {
    var s = '';
    for (var x = 30; x <= 690; x += 30) {
      if ((x > 270 && x < 390) || (x > 495 && x < 625)) continue;
      s += circ(x, 236, 10, { w: 3, c: 'blue', fill: 'blue', op: 0.25 }) + line([[x - 4, 247], [x - 4, 276]], { w: 2.5, c: 'mute' }) + line([[x + 4, 247], [x + 4, 276]], { w: 2.5, c: 'mute' });
      s += circ(x, 324, 10, { w: 3, c: 'blue', fill: 'blue', op: 0.25 }) + line([[x - 4, 313], [x - 4, 284]], { w: 2.5, c: 'mute' }) + line([[x + 4, 313], [x + 4, 284]], { w: 2.5, c: 'mute' });
    }
    return s;
  }
  B.add({
    id: 'cell-membrane', section: 'bio', title: 'The membrane: who gets across, and how',
    sub: 'Small and nonpolar slips through. Everything else needs a door.',
    svg: K.svg(
      lipids(), box(284, 218, 38, 124, { c: 'purple', w: 4, fill: 'purple', op: 0.2 }), box(340, 218, 38, 124, { c: 'purple', w: 4, fill: 'purple', op: 0.2 }),
      box(508, 214, 104, 132, { c: 'goldInk', w: 4, fill: 'gold', op: 0.3 }), t(560, 290, 'pump', { size: 27, c: 'goldInk' }),
      t(34, 200, 'outside', { size: 26, c: 'mute', a: 's' }), t(34, 376, 'inside', { size: 26, c: 'mute', a: 's' }),
      step(1, t(360, 60, 'heads love water, tails hide', { size: 28, c: 'blue' })),
      step(2, arrow(180, 150, 180, 404, { c: 'green', w: 5 }), t(180, 130, 'O_{2}, CO_{2}', { size: 28, c: 'green' }), t(180, 440, 'simple diffusion', { size: 26, c: 'green' })),
      step(3, arrow(331, 150, 331, 404, { c: 'purple', w: 5 }), t(331, 130, 'ions, glucose', { size: 27, c: 'purple' }), t(331, 478, 'channel: no ATP', { size: 26, c: 'purple' })),
      step(4, arrow(532, 208, 532, 150, { c: 'rose', w: 5 }), arrow(590, 352, 590, 404, { c: 'rose', w: 5 }), t(560, 130, '3 Na^{+} out', { size: 27, c: 'rose' }), t(580, 440, '2 K^{+} in', { size: 27, c: 'rose' }), t(580, 478, 'costs ATP', { size: 27, c: 'goldInk' })),
      step(5, t(360, 530, 'water follows solute: osmosis', { size: 28, c: 'teal' }))
    ),
    predict: { q: 'Which of these crosses the lipid bilayer on its own, with no protein?', choices: ['Na^{+}', 'Glucose', 'O_{2}'], answer: 2, why: 'Oxygen is small and nonpolar, so it dissolves straight through the oily middle. Ions and glucose need a protein.' },
    steps: [
      'A phospholipid has a water-loving head and two oily tails. In water they line up as a bilayer: heads out, tails in.',
      'Simple diffusion: small nonpolar molecules such as O_{2} and CO_{2} pass straight through, from high concentration to low. No protein, no energy.',
      'Facilitated diffusion: ions and polar molecules such as glucose need a channel or carrier protein. It is still downhill, so it is still passive.',
      'Active transport moves things uphill and costs ATP. The sodium potassium pump sends 3 Na^{+} out and 2 K^{+} in per ATP.',
      'Osmosis is water moving toward the side with more solute. A cell in a hypertonic solution shrinks. In a hypotonic one it swells.'
    ],
    tryIt: [
      { q: 'A red blood cell is dropped into pure water. It will:', choices: ['Shrink', 'Swell and may burst', 'Stay the same'], answer: 1, why: 'Pure water is hypotonic to the cell. Water moves in, toward the higher solute, and the cell swells.' },
      { q: 'Glucose entering a cell through a carrier, down its gradient, is:', choices: ['Simple diffusion', 'Facilitated diffusion', 'Primary active transport'], answer: 1, why: 'A protein is needed but no energy is spent, because the movement is downhill.' },
      { q: 'The sodium potassium pump moves, per ATP:', choices: ['3 Na^{+} out, 2 K^{+} in', '2 Na^{+} out, 3 K^{+} in', '3 Na^{+} in, 2 K^{+} out'], answer: 0, why: 'Three sodium out, two potassium in. That keeps the inside of the cell negative and low in sodium.' }
    ],
    path: { title: 'One turn of the sodium potassium pump', steps: ['3 Na^{+} bind from inside the cell', 'ATP phosphorylates the pump', 'The pump changes shape and releases Na^{+} outside', '2 K^{+} bind from outside', 'The phosphate leaves and the pump flips back', 'K^{+} is released inside'] },
    more: [{ label: 'How a protein leaves the cell', href: '/see/?b=cell-export' }, { label: 'Osmosis lab', href: '/tools/bio/bio-osmosis.html' }]
  });

  /* ---------- Organelles: the export route ---------- */
  B.add({
    id: 'cell-export', section: 'bio', title: 'Organelles: how a protein leaves the cell',
    sub: 'Follow one protein from gene to outside.',
    svg: K.svg(
      circ(360, 280, 336, 252, { w: 5 }), circ(160, 280, 84, { w: 5, c: 'purple', fill: 'purple', op: 0.1 }),
      curve([[262, 200], [282, 240], [262, 280], [282, 320], [262, 360]], { w: 5, c: 'blue' }), curve([[296, 200], [316, 240], [296, 280], [316, 320], [296, 360]], { w: 5, c: 'blue' }),
      [[270, 216], [278, 258], [268, 300], [278, 342], [304, 216], [312, 258], [302, 300], [312, 342]].map(function (p) { return dot(p[0] - 14, p[1], 5, { c: 'ink' }); }).join(''),
      curve([[400, 220], [420, 280], [400, 340]], { w: 6, c: 'goldInk' }), curve([[424, 228], [442, 280], [424, 332]], { w: 6, c: 'goldInk' }), curve([[448, 236], [464, 280], [448, 324]], { w: 6, c: 'goldInk' }),
      circ(540, 262, 18, { w: 4, c: 'rose', fill: 'rose', op: 0.25 }),
      circ(290, 440, 26, { w: 4, c: 'green', fill: 'green', op: 0.2 }), circ(480, 426, 54, 26, { w: 4, c: 'orange' }), line([[436, 426], [452, 412], [468, 440], [484, 412], [500, 440], [516, 414], [526, 426]], { w: 3, c: 'orange' }),
      step(1, t(160, 290, 'DNA', { size: 30, c: 'purple' }), t(160, 172, 'nucleus', { size: 27, c: 'purple' })),
      step(2, arrow(214, 280, 246, 280, { w: 4 }), t(290, 172, 'rough ER', { size: 27, c: 'blue' })),
      step(3, arrow(326, 280, 390, 280, { w: 4 }), t(432, 172, 'Golgi', { size: 27, c: 'goldInk' })),
      step(4, arrow(470, 274, 516, 266, { w: 4 }), arrow(562, 256, 672, 226, { w: 4, c: 'rose' }), t(580, 196, 'vesicle', { size: 27, c: 'rose' })),
      step(5, t(290, 498, 'lysosome', { size: 26, c: 'green' }), t(456, 486, 'mitochondrion', { size: 26, c: 'orange' }))
    ),
    predict: { q: 'A cell that secretes a lot of protein (say, a pancreas cell making insulin) is packed with:', choices: ['Rough ER', 'Lysosomes', 'Smooth ER'], answer: 0, why: 'Secreted proteins are built on the ribosomes of the rough ER. Lots of export means lots of rough ER and Golgi.' },
    steps: [
      'Nucleus: the gene is transcribed into mRNA, which leaves through a nuclear pore.',
      'Rough ER: ribosomes on its surface translate the mRNA and thread the new protein inside, where it folds.',
      'Golgi: receives the protein in a vesicle, then modifies, sorts and packages it. Think of it as the shipping desk.',
      'A vesicle carries the finished protein to the cell membrane and fuses with it: exocytosis.',
      'Other stops to know: lysosomes digest with acid enzymes, mitochondria make ATP, smooth ER makes lipids and detoxifies, peroxisomes break down hydrogen peroxide.'
    ],
    tryIt: [
      { q: 'Which organelle makes most of the cell\'s ATP?', choices: ['Golgi', 'Mitochondrion', 'Lysosome'], answer: 1, why: 'The mitochondrion runs the Krebs cycle and the electron transport chain.' },
      { q: 'Liver cells that detoxify drugs are rich in:', choices: ['Smooth ER', 'Rough ER', 'Nucleoli'], answer: 0, why: 'Smooth ER has no ribosomes. It makes lipids and detoxifies.' },
      { q: 'Which is found in a prokaryote?', choices: ['Nucleus', 'Mitochondria', 'Ribosomes'], answer: 2, why: 'Prokaryotes have ribosomes (70S) but no membrane-bound organelles.' }
    ],
    path: { title: 'The secretory pathway', steps: ['Gene is transcribed in the nucleus', 'mRNA exits through a nuclear pore', 'Ribosome on the rough ER translates it', 'Protein folds inside the ER', 'Vesicle carries it to the Golgi', 'Golgi modifies, sorts and packages', 'Vesicle fuses with the membrane: exocytosis'] },
    more: [{ label: 'The membrane: who gets across', href: '/see/?b=cell-membrane' }, { label: 'Cell hub', href: '/tools/bio/bio-cell.html' }]
  });

  /* ---------- Genetics ---------- */
  function ped(x, y, female, filled) { var o = { w: 4, fill: filled ? 'rose' : null, op: 0.6, c: filled ? 'rose' : 'ink' }; if (!filled) delete o.fill; return female ? circ(x, y, 22, o) : rect(x - 22, y - 22, 44, 44, o); }
  B.add({
    id: 'genetics', section: 'bio', title: 'Crosses and pedigrees',
    sub: 'One allele from each parent. Then read the pattern.',
    svg: K.svg(
      t(220, 62, 'Aa × Aa', { size: 36 }), rect(110, 150, 220, 220, { w: 4.5 }), line([[220, 150], [220, 370]], { w: 3.5 }), line([[110, 260], [330, 260]], { w: 3.5 }),
      ped(470, 130, false), ped(630, 130, true), line([[492, 130], [608, 130]], { w: 3.5 }), line([[550, 130], [550, 200]], { w: 3.5 }), line([[450, 200], [650, 200]], { w: 3.5 }),
      line([[450, 200], [450, 228]], { w: 3.5 }), line([[550, 200], [550, 228]], { w: 3.5 }), line([[650, 200], [650, 228]], { w: 3.5 }),
      ped(450, 250, true), ped(550, 250, false, true), ped(650, 250, true),
      step(1, t(165, 132, 'A', { size: 36, c: 'blue' }), t(275, 132, 'a', { size: 36, c: 'blue' }), t(80, 218, 'A', { size: 36, c: 'purple' }), t(80, 328, 'a', { size: 36, c: 'purple' })),
      step(2, t(165, 220, 'AA', { size: 38 }), t(275, 220, 'Aa', { size: 38 }), t(165, 330, 'Aa', { size: 38 }), hi(244, 298, 64, 44, { c: 'gold' }), t(275, 330, 'aa', { size: 38, c: 'rose' })),
      step(3, t(220, 426, '1 AA : 2 Aa : 1 aa', { size: 29, c: 'green' }), t(220, 466, '3 dominant : 1 recessive', { size: 27, c: 'green' })),
      step(4, t(220, 526, 'two genes: 9 : 3 : 3 : 1', { size: 28, c: 'purple' })),
      step(5, t(550, 340, 'healthy parents,', { size: 27 }), t(550, 374, 'affected child:', { size: 27 }), hi(470, 392, 160, 40, { c: 'gold' }), t(550, 422, 'recessive', { size: 34, c: 'rose' }))
    ),
    predict: { q: 'Two carriers (Aa × Aa) have a child. What is the chance the child shows the recessive trait?', choices: ['1/2', '1/4', '3/4'], answer: 1, why: 'Only aa shows it. That is one box of the four in the Punnett square.' },
    steps: [
      'Each parent passes on one of their two alleles, each with a 1/2 chance. Write one parent\'s gametes across the top and the other\'s down the side.',
      'Fill each box with one allele from the top and one from the side: AA, Aa, Aa, aa.',
      'Read the ratios. Genotype 1 : 2 : 1. Phenotype 3 dominant to 1 recessive.',
      'For two unlinked genes, multiply the single-gene odds. A double heterozygote cross gives 9 : 3 : 3 : 1.',
      'Pedigrees: squares are males, circles are females, filled means affected. Two unaffected parents with an affected child means the trait is recessive. A trait in every generation suggests dominant. Mostly males, passed through carrier mothers, suggests X-linked recessive.'
    ],
    tryIt: [
      { q: 'A test cross (Aa × aa) gives what phenotype ratio?', choices: ['3 : 1', '1 : 1', 'All dominant'], answer: 1, why: 'Half the offspring are Aa (dominant) and half are aa (recessive).' },
      { q: 'A colorblind man (X-linked recessive) and a woman with no colorblind allele have a daughter. She is:', choices: ['Colorblind', 'A carrier', 'Neither'], answer: 1, why: 'She gets her father\'s only X, which carries the allele, and a normal X from her mother. One copy: carrier.' },
      { q: 'AaBb × AaBb. What fraction of offspring are aabb?', choices: ['1/4', '1/8', '1/16'], answer: 2, why: '1/4 chance of aa times 1/4 chance of bb is 1/16. That is the 1 in 9 : 3 : 3 : 1.' }
    ],
    path: { title: 'Solve a cross', steps: ['Write each parent\'s genotype', 'List the gametes each can make', 'Set up the Punnett square', 'Fill the boxes', 'Count genotypes', 'Convert to phenotypes and a ratio'] },
    more: [{ label: 'Hardy-Weinberg', href: '/see/?b=hardy-weinberg' }, { label: 'Genetics hub', href: '/tools/bio/bio-genetics.html' }]
  });

  /* ---------- Hardy-Weinberg ---------- */
  B.add({
    id: 'hardy-weinberg', section: 'bio', title: 'Hardy-Weinberg: one square',
    sub: 'Allele frequencies on the sides. Genotypes are the areas.',
    svg: K.svg(
      rect(190, 76, 340, 340, { w: 5 }), line([[428, 76], [428, 416]], { w: 3.5 }), line([[190, 314], [530, 314]], { w: 3.5 }),
      step(1, t(309, 56, 'p = 0.7', { size: 29, c: 'blue' }), t(479, 56, 'q = 0.3', { size: 27, c: 'rose' }), t(170, 204, 'p', { size: 32, c: 'blue', a: 'e' }), t(170, 376, 'q', { size: 32, c: 'rose', a: 'e' })),
      step(2, rect(190, 76, 238, 238, { c: 'blue', w: 2, fill: 'blue', op: 0.18 }), t(309, 184, 'p^{2}', { size: 40, c: 'blue' }), t(309, 232, '0.49 AA', { size: 29, c: 'blue' })),
      step(3, rect(428, 76, 102, 238, { c: 'purple', w: 2, fill: 'purple', op: 0.18 }), rect(190, 314, 238, 102, { c: 'purple', w: 2, fill: 'purple', op: 0.18 }), t(479, 204, 'pq', { size: 30, c: 'purple' }), t(309, 376, 'pq', { size: 30, c: 'purple' }),
        t(628, 184, '2pq =', { size: 29, c: 'purple' }), t(628, 222, '0.42 Aa', { size: 29, c: 'purple' })),
      step(4, rect(428, 314, 102, 102, { c: 'rose', w: 2, fill: 'rose', op: 0.25 }), t(479, 376, 'q^{2}', { size: 32, c: 'rose' }), t(628, 356, 'q^{2} = 0.09', { size: 28, c: 'rose' }), t(628, 392, 'aa', { size: 29, c: 'rose' })),
      step(5, t(360, 474, 'p^{2} + 2pq + q^{2} = 1', { size: 36 }), hi(126, 498, 468, 38, { c: 'gold' }), t(360, 526, 'start at q^{2}:  √0.09 = 0.3', { size: 29, c: 'green' }))
    ),
    predict: { q: 'In a population, 9% show a recessive trait. What is the frequency of the recessive allele?', choices: ['0.09', '0.3', '0.81'], answer: 1, why: 'The 9% are aa, which is q^{2}. Take the square root: q = 0.3.' },
    steps: [
      'Two alleles, A and a, with frequencies p and q. They are the only two, so p + q = 1.',
      'Random mating multiplies the sides. The chance of AA is p × p = p^{2}. Here 0.49.',
      'Heterozygotes can form two ways (A from mom or A from dad), so their share is 2pq. Here 0.42.',
      'The chance of aa is q^{2}. Here 0.09.',
      'The areas fill the square: p^{2} + 2pq + q^{2} = 1. On a question, start from the recessive phenotype, because it is the only one you can see directly: take its square root to get q.'
    ],
    tryIt: [
      { q: 'If q = 0.2, what fraction of the population are carriers (Aa)?', choices: ['0.04', '0.16', '0.32'], answer: 2, why: 'p = 0.8, so 2pq = 2 × 0.8 × 0.2 = 0.32.' },
      { q: '16% of a population shows the recessive phenotype. What is p?', choices: ['0.4', '0.6', '0.84'], answer: 1, why: 'q^{2} = 0.16, so q = 0.4 and p = 1 − 0.4 = 0.6.' },
      { q: 'Which breaks Hardy-Weinberg equilibrium?', choices: ['Random mating', 'A very large population', 'Natural selection'], answer: 2, why: 'Equilibrium needs no selection, no mutation, no migration, random mating and a large population. Selection changes allele frequencies.' }
    ],
    path: { title: 'Solve a Hardy-Weinberg question', steps: ['Find the recessive phenotype frequency: that is q^{2}', 'Take the square root to get q', 'Subtract from 1 to get p', 'Square p for homozygous dominant', 'Compute 2pq for carriers', 'Check that the three add to 1'] },
    more: [{ label: 'Crosses and pedigrees', href: '/see/?b=genetics' }]
  });

  /* ---------- Diversity of life ---------- */
  var RANKS = ['Domain', 'Kingdom', 'Phylum', 'Class', 'Order', 'Family', 'Genus', 'Species'];
  B.add({
    id: 'taxonomy', section: 'bio', title: 'The tree of life and the ranks',
    sub: 'Three domains, then narrower and narrower boxes.',
    svg: K.svg(
      line([[300, 530], [300, 450]], { w: 6 }), line([[300, 450], [110, 366]], { w: 5 }), line([[300, 450], [384, 408]], { w: 5 }), line([[384, 408], [290, 366]], { w: 5 }), line([[384, 408], [470, 366]], { w: 5 }),
      line([[470, 320], [360, 240]], { w: 4 }), line([[470, 320], [430, 170]], { w: 4 }), line([[470, 320], [520, 170]], { w: 4 }), line([[470, 320], [600, 240]], { w: 4 }),
      step(1, t(104, 350, 'Bacteria', { size: 28, c: 'blue' }), t(286, 350, 'Archaea', { size: 28, c: 'purple' }), t(476, 350, 'Eukarya', { size: 28, c: 'green' })),
      step(2, dot(384, 408, 10, { c: 'rose' }), t(566, 430, 'closer cousins', { size: 26, c: 'rose' }), arrow(474, 422, 402, 412, { c: 'rose', w: 3 })),
      step(3, t(340, 224, 'Protists', { size: 27, c: 'green' }), t(424, 154, 'Plants', { size: 27, c: 'green' }), t(530, 154, 'Fungi', { size: 27, c: 'green' }), t(626, 224, 'Animals', { size: 27, c: 'green' })),
      step(4, RANKS.map(function (r, i) { return t(34, 54 + i * 32, r, { size: 27, c: i < 6 ? 'ink' : 'goldInk', a: 's' }); }).join('')),
      step(5, hi(460, 474, 210, 40, { c: 'gold' }), t(566, 502, 'Homo sapiens', { size: 34 }), t(566, 540, 'Genus species', { size: 26, c: 'goldInk' }))
    ),
    predict: { q: 'Archaea look like bacteria under a microscope. Which group are they more closely related to?', choices: ['Bacteria', 'Eukarya', 'Viruses'], answer: 1, why: 'Archaea and eukaryotes share a more recent common ancestor. Their transcription and translation machinery is similar.' },
    steps: [
      'All cellular life falls into three domains: Bacteria, Archaea and Eukarya. The first two are prokaryotes: no nucleus.',
      'Archaea and Eukarya branch from a shared ancestor after Bacteria split off, so Archaea are closer to you than to E. coli.',
      'Eukarya holds four classic kingdoms: Protists, Plants, Fungi and Animals. Fungi are closer to animals than to plants.',
      'The ranks, wide to narrow: Domain, Kingdom, Phylum, Class, Order, Family, Genus, Species. "Dear King Philip Came Over For Good Soup."',
      'A scientific name is Genus then species, in italics, genus capitalized. Humans: Homo sapiens.'
    ],
    tryIt: [
      { q: 'Which rank is the most specific?', choices: ['Family', 'Genus', 'Order'], answer: 1, why: 'Of these three, genus is the narrowest. Only species is narrower.' },
      { q: 'Fungi have cell walls made mainly of:', choices: ['Cellulose', 'Chitin', 'Peptidoglycan'], answer: 1, why: 'Fungi use chitin. Plants use cellulose and bacteria use peptidoglycan.' },
      { q: 'Humans belong to which phylum?', choices: ['Chordata', 'Mammalia', 'Primates'], answer: 0, why: 'Chordata is the phylum. Mammalia is the class and Primates is the order.' }
    ],
    path: { title: 'The ranks, from wide to narrow', steps: ['Kingdom', 'Phylum', 'Class', 'Order', 'Family', 'Genus', 'Species'] },
    more: [{ label: 'Diversity hub', href: '/tools/bio/bio-diversity.html' }]
  });

  /* ---------- Developmental biology ---------- */
  var SX = [80, 220, 360, 500, 640];
  B.add({
    id: 'development', section: 'bio', title: 'From one cell to three layers',
    sub: 'Cleavage, blastula, gastrula, then organs.',
    svg: K.svg(
      SX.map(function (x) { return circ(x, 130, 54, { w: 5 }); }).join(''), [0, 1, 2, 3].map(function (i) { return arrow(SX[i] + 60, 130, SX[i + 1] - 60, 130, { w: 3.5, head: 10 }); }).join(''),
      line([[220, 78], [220, 182]], { w: 3.5 }), line([[168, 130], [272, 130]], { w: 3.5 }),
      [[340, 104], [380, 104], [322, 136], [360, 136], [398, 136], [340, 166], [380, 166]].map(function (p) { return circ(p[0], p[1], 17, { w: 3 }); }).join(''),
      circ(500, 130, 32, { w: 3.5, c: 'mute' }),
      K.path('M606 100 Q650 112 650 130 Q650 148 606 160', { w: 4, c: 'rose' }),
      step(1, t(80, 226, 'zygote', { size: 26, c: 'blue' }), t(220, 226, 'cleavage', { size: 26, c: 'blue' })),
      step(2, t(360, 226, 'morula', { size: 26, c: 'purple' }), t(500, 226, 'blastula', { size: 26, c: 'purple' })),
      step(3, t(640, 226, 'gastrula', { size: 26, c: 'rose' }), circ(150, 400, 112, { w: 5, c: 'blue', fill: 'blue', op: 0.12 }), circ(150, 400, 78, { w: 5, c: 'rose', fill: 'rose', op: 0.14 }), circ(150, 400, 42, { w: 5, c: 'goldInk', fill: 'gold', op: 0.3 })),
      step(4, t(300, 330, 'ecto: skin, nerves', { size: 27, c: 'blue', a: 's' }), t(300, 390, 'meso: muscle, bone, blood', { size: 27, c: 'rose', a: 's' }), t(300, 450, 'endo: gut lining, lungs', { size: 27, c: 'goldInk', a: 's' })),
      step(5, t(300, 520, 'neural tube: from ectoderm', { size: 27, c: 'purple', a: 's' }))
    ),
    predict: { q: 'The nervous system forms from which germ layer?', choices: ['Ectoderm', 'Mesoderm', 'Endoderm'], answer: 0, why: 'Ectoderm, the outer layer, makes both the skin and the nervous system.' },
    steps: [
      'Fertilization makes a zygote. Cleavage is rapid division with no growth: more and more cells, each smaller, same total size.',
      'A solid ball of cells is the morula. It hollows into the blastula, with a fluid-filled space called the blastocoel. In mammals this stage is the blastocyst, which implants.',
      'Gastrulation: cells fold inward to make three germ layers. Outside ectoderm, middle mesoderm, inside endoderm.',
      'Ectoderm: skin and nervous system. Mesoderm: muscle, bone, blood, heart, kidneys, gonads. Endoderm: the lining of the gut and lungs, plus liver and pancreas.',
      'Neurulation starts organ formation: the notochord (mesoderm) signals the ectoderm above it to fold into the neural tube, the future brain and spinal cord.'
    ],
    tryIt: [
      { q: 'The heart and skeletal muscle come from:', choices: ['Ectoderm', 'Mesoderm', 'Endoderm'], answer: 1, why: 'Mesoderm makes muscle, bone, blood, the heart, kidneys and gonads.' },
      { q: 'During cleavage, the embryo as a whole:', choices: ['Grows much larger', 'Stays about the same size', 'Forms three germ layers'], answer: 1, why: 'Cleavage divides the zygote into smaller and smaller cells without growth.' },
      { q: 'The lining of the digestive tract comes from:', choices: ['Ectoderm', 'Mesoderm', 'Endoderm'], answer: 2, why: 'Endoderm is the inner layer: the gut lining, the lung lining, the liver and pancreas.' }
    ],
    path: { title: 'Early development in order', steps: ['Fertilization', 'Cleavage', 'Morula', 'Blastula', 'Gastrulation', 'Neurulation', 'Organogenesis'] },
    more: [{ label: 'Development hub', href: '/tools/bio/bio-devo.html' }]
  });

  /* ---------- Endocrine axes ---------- */
  B.add({
    id: 'endocrine', section: 'bio', title: 'Hormone axes and negative feedback',
    sub: 'Brain, pituitary, gland. Then the product shuts it off.',
    svg: K.svg(
      box(210, 30, 300, 66, { w: 5, c: 'purple' }), t(360, 74, 'hypothalamus', { size: 30 }),
      box(210, 176, 300, 66, { w: 5, c: 'blue' }), t(360, 220, 'anterior pituitary', { size: 28 }),
      box(210, 322, 300, 66, { w: 5, c: 'green' }), t(360, 366, 'thyroid', { size: 30 }),
      box(210, 468, 300, 66, { w: 5 }), t(360, 512, 'body cells', { size: 30 }),
      arrow(360, 102, 360, 170, { w: 5 }), arrow(360, 248, 360, 316, { w: 5 }), arrow(360, 394, 360, 462, { w: 5 }),
      step(1, t(378, 146, 'TRH', { size: 30, c: 'purple', a: 's' })),
      step(2, t(378, 292, 'TSH', { size: 30, c: 'blue', a: 's' })),
      step(3, t(378, 438, 'T_{3}, T_{4}', { size: 30, c: 'green', a: 's' })),
      step(4, arrow(518, 356, 518, 214, { c: 'rose', w: 4, bend: 70 }), arrow(518, 346, 518, 66, { c: 'rose', w: 4, bend: 130 }), t(560, 262, '−', { size: 52, c: 'rose' }), t(606, 150, '−', { size: 52, c: 'rose' }), t(618, 452, 'too much T_{4}:', { size: 26, c: 'rose' }), t(618, 486, 'shut it off', { size: 26, c: 'rose' })),
      step(5, t(104, 200, 'posterior:', { size: 26, c: 'goldInk' }), t(104, 234, 'ADH, oxytocin', { size: 26, c: 'goldInk' }))
    ),
    predict: { q: 'Thyroid hormone in the blood climbs too high. What happens to TSH?', choices: ['It rises', 'It falls', 'No change'], answer: 1, why: 'Negative feedback: high thyroid hormone tells the hypothalamus and pituitary to release less TRH and TSH.' },
    steps: [
      'The hypothalamus starts the chain with a releasing hormone. In the thyroid axis that is TRH.',
      'The releasing hormone tells the anterior pituitary to secrete a tropic hormone into the blood: TSH.',
      'The tropic hormone tells the target gland to release the final hormone: T_{3} and T_{4}, which raise metabolic rate.',
      'Negative feedback: the final hormone inhibits both the pituitary and the hypothalamus, so the level holds steady.',
      'Same pattern, other axes: CRH, ACTH, cortisol (adrenal cortex) and GnRH, LH and FSH, sex hormones. The posterior pituitary is different: it only stores and releases ADH and oxytocin, which are made in the hypothalamus.'
    ],
    tryIt: [
      { q: 'ACTH acts on the:', choices: ['Thyroid', 'Adrenal cortex', 'Gonads'], answer: 1, why: 'ACTH (adrenocorticotropic hormone) tells the adrenal cortex to release cortisol.' },
      { q: 'Which hormone is released by the posterior pituitary?', choices: ['Growth hormone', 'Prolactin', 'ADH'], answer: 2, why: 'ADH and oxytocin are made in the hypothalamus and released from the posterior pituitary. The other two are anterior.' },
      { q: 'After a meal, blood glucose rises. The pancreas releases:', choices: ['Insulin', 'Glucagon', 'Cortisol'], answer: 0, why: 'Insulin lowers blood glucose by moving it into cells. Glucagon does the opposite between meals.' }
    ],
    path: { title: 'The thyroid axis', steps: ['Hypothalamus releases TRH', 'Anterior pituitary releases TSH', 'Thyroid releases T_{3} and T_{4}', 'Metabolic rate rises', 'T_{3} and T_{4} inhibit the pituitary and hypothalamus', 'TRH and TSH fall, and the level steadies'] },
    more: [{ label: 'Physiology hub', href: '/tools/bio/bio-physiology.html' }]
  });

  /* ---------- Muscle contraction ---------- */
  function zline(x) { return line([[x, 120], [x - 10, 150], [x + 10, 180], [x - 10, 210], [x + 10, 240], [x - 10, 270], [x + 10, 300], [x - 10, 330], [x, 360]], { w: 5 }); }
  B.add({
    id: 'muscle', section: 'bio', title: 'Sliding filaments: how a muscle shortens',
    sub: 'Nothing shrinks. The filaments slide.',
    svg: K.svg(
      zline(100), zline(620),
      [150, 210, 270, 330].map(function (y) { return line([[104, y], [300, y]], { w: 4, c: 'blue' }) + line([[616, y], [420, y]], { w: 4, c: 'blue' }); }).join(''),
      [180, 240, 300].map(function (y) {
        var s = line([[190, y], [530, y]], { w: 10, c: 'rose' });
        [210, 240, 270, 450, 480, 510].forEach(function (x) { s += line([[x, y - 5], [x + (x < 360 ? -9 : 9), y - 20]], { w: 3.5, c: 'rose' }) + line([[x, y + 5], [x + (x < 360 ? -9 : 9), y + 20]], { w: 3.5, c: 'rose' }); });
        return s;
      }).join(''),
      line([[360, 150], [360, 330]], { w: 3, c: 'mute', dash: '4 8' }),
      step(1, t(100, 100, 'Z', { size: 32 }), t(620, 100, 'Z', { size: 32 }), t(170, 406, 'thin: actin', { size: 27, c: 'blue' }), t(374, 406, 'thick: myosin', { size: 27, c: 'rose' })),
      step(2, hi(482, 380, 216, 36, { c: 'gold' }), t(590, 406, 'Ca^{2+} on troponin', { size: 26, c: 'goldInk' })),
      step(3, arrow(140, 76, 270, 76, { c: 'green', w: 6 }), arrow(580, 76, 450, 76, { c: 'green', w: 6 }), t(360, 86, 'pull in', { size: 28, c: 'green' })),
      step(4, t(360, 462, 'new ATP: the head lets go', { size: 27, c: 'purple' })),
      step(5, t(360, 520, 'A band stays. I band and H zone shrink.', { size: 26, c: 'teal' }))
    ),
    predict: { q: 'When a muscle contracts, what happens to the length of the thick and thin filaments themselves?', choices: ['Both shorten', 'Only the thin filaments shorten', 'Neither changes'], answer: 2, why: 'The filaments keep their length and slide past each other. The sarcomere shortens because the overlap grows.' },
    steps: [
      'One sarcomere runs from Z line to Z line. Thin actin filaments anchor at the Z lines. Thick myosin filaments sit in the middle.',
      'A nerve signal makes the sarcoplasmic reticulum release Ca^{2+}. It binds troponin, which moves tropomyosin off the binding sites on actin.',
      'Myosin heads grab actin and swing: the power stroke. The thin filaments are pulled toward the center.',
      'A fresh ATP binds the head so it can let go, then is split to re-cock it. Without ATP the heads stay locked on: rigor.',
      'As the Z lines come together, the I band and H zone get narrower. The A band is the length of the thick filament, so it stays the same.'
    ],
    tryIt: [
      { q: 'Calcium starts contraction by binding to:', choices: ['Myosin', 'Troponin', 'Actin'], answer: 1, why: 'Ca^{2+} binds troponin, which shifts tropomyosin and uncovers the binding sites on actin.' },
      { q: 'During contraction, the A band:', choices: ['Shortens', 'Lengthens', 'Stays the same'], answer: 2, why: 'The A band spans the thick filament, and the thick filament does not change length.' },
      { q: 'In the cross-bridge cycle, ATP binding causes the myosin head to:', choices: ['Detach from actin', 'Perform the power stroke', 'Bind calcium'], answer: 0, why: 'ATP binding releases the head from actin. Splitting that ATP then re-cocks the head.' }
    ],
    path: { title: 'From nerve signal to contraction', steps: ['Action potential reaches the neuromuscular junction', 'Acetylcholine depolarizes the muscle fiber', 'The signal travels down the T tubules', 'The sarcoplasmic reticulum releases Ca^{2+}', 'Ca^{2+} binds troponin and uncovers actin', 'Myosin heads bind and pull: power stroke', 'ATP binds and the heads release'] },
    more: [{ label: 'Physiology hub', href: '/tools/bio/bio-physiology.html' }]
  });

  /* ---------- Immune system ---------- */
  function ab(x, y) { return line([[x, y + 26], [x, y + 8]], { w: 4, c: 'goldInk' }) + line([[x, y + 8], [x - 11, y - 8]], { w: 4, c: 'goldInk' }) + line([[x, y + 8], [x + 11, y - 8]], { w: 4, c: 'goldInk' }); }
  B.add({
    id: 'immune', section: 'bio', title: 'The immune response, start to finish',
    sub: 'A fast general guard, then a slow precise army.',
    svg: K.svg(
      circ(64, 120, 24, { w: 4, c: 'rose', fill: 'rose', op: 0.3 }), [0, 60, 120, 180, 240, 300].map(function (a) { var r = a * Math.PI / 180; return line([[64 + 26 * Math.cos(r), 120 + 26 * Math.sin(r)], [64 + 38 * Math.cos(r), 120 + 38 * Math.sin(r)]], { w: 3.5, c: 'rose' }); }).join(''),
      arrow(108, 120, 160, 120, { w: 4 }), circ(230, 120, 64, 50, { w: 5, c: 'blue', fill: 'blue', op: 0.1 }),
      circ(400, 256, 44, { w: 5, c: 'purple', fill: 'purple', op: 0.1 }), circ(570, 160, 40, { w: 5, c: 'goldInk', fill: 'gold', op: 0.2 }), circ(570, 366, 40, { w: 5, c: 'green', fill: 'green', op: 0.1 }),
      circ(672, 470, 32, { w: 4, c: 'rose' }),
      step(1, t(190, 212, 'innate: fast, general', { size: 27, c: 'blue' }), dot(226, 124, 10, { c: 'rose' })),
      step(2, arrow(284, 156, 358, 228, { w: 4 }), t(400, 266, 'T_{H}', { size: 30, c: 'purple' }), t(400, 340, 'helper T (CD4)', { size: 26, c: 'purple' })),
      step(3, arrow(440, 232, 530, 180, { w: 4 }), t(570, 170, 'B', { size: 30, c: 'goldInk' }), ab(650, 60), ab(690, 110), ab(646, 122), t(500, 76, 'antibodies', { size: 27, c: 'goldInk' })),
      step(4, arrow(444, 276, 526, 344, { w: 4 }), t(570, 376, 'T_{C}', { size: 30, c: 'green' }), arrow(600, 396, 646, 444, { w: 4, c: 'green' }), line([[654, 452], [690, 488]], { w: 4, c: 'green' }), line([[690, 452], [654, 488]], { w: 4, c: 'green' }),
        t(474, 440, 'killer T (CD8)', { size: 26, c: 'green', a: 'e' }), t(474, 474, 'kills infected cells', { size: 26, c: 'green', a: 'e' })),
      step(5, hi(40, 500, 320, 36, { c: 'gold' }), t(200, 526, 'memory cells remember', { size: 27 }))
    ),
    predict: { q: 'Which cells make antibodies?', choices: ['Helper T cells', 'Plasma cells (from B cells)', 'Macrophages'], answer: 1, why: 'An activated B cell divides into plasma cells, and plasma cells are antibody factories.' },
    steps: [
      'Innate immunity is the first response: skin and mucus as barriers, then phagocytes such as macrophages and neutrophils that eat anything foreign. Fast, the same every time, no memory.',
      'A macrophage or dendritic cell shows pieces of the invader (antigen) on MHC class II. A helper T cell (CD4) that recognizes it switches on and releases cytokines.',
      'Humoral branch: helper T cells activate B cells. B cells become plasma cells and secrete antibodies, which tag and neutralize the invader in body fluids.',
      'Cell-mediated branch: cytotoxic T cells (CD8) find your own cells showing foreign antigen on MHC class I, such as virus-infected cells, and kill them.',
      'Some B and T cells become memory cells. On a second exposure the response is faster and stronger. That is how vaccines work.'
    ],
    tryIt: [
      { q: 'Cytotoxic T cells recognize antigen on:', choices: ['MHC class I', 'MHC class II', 'Free antibodies'], answer: 0, why: 'CD8 goes with MHC I, found on nearly every cell. CD4 goes with MHC II, found on antigen-presenting cells. (8 × 1 = 4 × 2.)' },
      { q: 'Which is part of innate immunity?', choices: ['Plasma cells', 'Neutrophils', 'Memory B cells'], answer: 1, why: 'Neutrophils are phagocytes that respond fast and without specificity. The other two are adaptive.' },
      { q: 'A vaccine protects mainly by producing:', choices: ['Memory cells', 'Inflammation', 'Passive antibodies'], answer: 0, why: 'A vaccine triggers a primary response so that memory cells are ready for the real pathogen.' }
    ],
    path: { title: 'The adaptive response', steps: ['Pathogen gets past the barriers', 'A macrophage engulfs it', 'Antigen is shown on MHC class II', 'A helper T cell recognizes it and activates', 'B cells become plasma cells and make antibodies', 'Cytotoxic T cells kill infected cells', 'Memory cells stay behind'] },
    more: [{ label: 'Physiology hub', href: '/tools/bio/bio-physiology.html' }]
  });

  /* ---------- Lab techniques: PCR and gels ---------- */
  B.add({
    id: 'biotech', section: 'bio', title: 'PCR and gel electrophoresis',
    sub: 'Copy the DNA. Then sort it by size.',
    svg: K.svg(
      line([[60, 80], [60, 410], [390, 410]], { w: 4.5 }), t(40, 250, 'temp', { size: 26, c: 'mute', rot: -90 }),
      line([[70, 130], [140, 130], [180, 340], [250, 340], [290, 250], [370, 250]], { w: 5.5, c: 'ink' }),
      rect(450, 76, 220, 370, { w: 5 }), [490, 560, 630].map(function (x) { return rect(x - 22, 92, 44, 12, { w: 3 }); }).join(''),
      [150, 205, 265, 330, 400].map(function (y) { return line([[470, y], [510, y]], { w: 6, c: 'mute' }); }).join(''),
      line([[540, 205], [580, 205]], { w: 7, c: 'purple' }), line([[610, 384], [650, 384]], { w: 7, c: 'purple' }),
      t(694, 112, '−', { size: 40 }), t(694, 446, '+', { size: 36 }),
      step(1, t(134, 108, '95° split', { size: 27, c: 'rose' })),
      step(2, t(214, 378, '55° primers', { size: 27, c: 'blue' })),
      step(3, t(326, 232, '72° copy', { size: 27, c: 'green' })),
      step(4, t(222, 468, 'each cycle doubles: 2^{n}', { size: 28, c: 'purple' })),
      step(5, arrow(428, 110, 428, 430, { c: 'blue', w: 5 }), t(560, 486, 'small runs far', { size: 27, c: 'blue' }), t(560, 524, 'DNA is −, runs to +', { size: 27 }))
    ),
    predict: { q: 'On a gel, which DNA fragment travels farthest from the well?', choices: ['The longest', 'The shortest', 'They all travel the same'], answer: 1, why: 'Short fragments slip through the gel mesh more easily, so they run farthest.' },
    steps: [
      'PCR step one, denature: heat to about 95 °C so the two strands separate.',
      'Step two, anneal: cool to about 55 °C so short primers stick to each end of the target.',
      'Step three, extend: at 72 °C a heat-stable polymerase (Taq) copies from each primer.',
      'Each cycle doubles the target. After n cycles there are about 2^{n} copies: 30 cycles is about a billion.',
      'Gel electrophoresis sorts DNA by size. DNA is negative (phosphate backbone) so it runs toward the positive end, and smaller pieces run farther. Compare with the ladder to read sizes.'
    ],
    tryIt: [
      { q: 'Starting with one DNA molecule, how many copies after 5 PCR cycles?', choices: ['10', '25', '32'], answer: 2, why: '2^{5} = 32.' },
      { q: 'Which technique detects a specific protein?', choices: ['Southern blot', 'Northern blot', 'Western blot'], answer: 2, why: 'Southern is DNA, Northern is RNA, Western is protein.' },
      { q: 'Restriction enzymes are used to:', choices: ['Cut DNA at specific sequences', 'Join DNA fragments', 'Copy RNA into DNA'], answer: 0, why: 'Restriction enzymes cut at specific, often palindromic, sites. Ligase joins fragments and reverse transcriptase makes DNA from RNA.' }
    ],
    path: { title: 'One PCR cycle, then the gel', steps: ['Heat to 95 °C: strands separate', 'Cool to about 55 °C: primers anneal', 'Warm to 72 °C: Taq extends', 'Repeat 25 to 35 cycles', 'Load the product in a gel well', 'Run toward the positive electrode', 'Read sizes against the ladder'] },
    more: [{ label: 'DNA to RNA to protein', href: '/see/?b=central-dogma' }]
  });
})(typeof window !== 'undefined' ? window.AceBoard : (typeof require === 'function' ? require('../ace-board.js') : null));
