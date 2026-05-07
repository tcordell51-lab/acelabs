// Author 8 ADA-spec arrow-prediction OChem questions with bespoke SVGs.
// These match the format described in the official ADA OChem 2026 spec:
// "Candidates are asked to predict products based on starting materials
//  and curved arrows. Additionally, candidates are asked to predict
//  curved arrow(s) based on starting materials and products."
//
// Each question has:
//   q_svg — inline SVG showing starting material with arrows (or product)
//   opts_svg[] — inline SVG for each multiple-choice option (or null for text)

const fs = require('fs');
const bank = require('/tmp/dat-mock-bank.json');

// SVG helpers — keep all glyphs at a consistent size + style
const STYLE = `<style>
  .bond { stroke: #1a1d20; stroke-width: 1.5; fill: none; }
  .dbond { stroke: #1a1d20; stroke-width: 1.5; fill: none; }
  .atom { font-family: Arial, sans-serif; font-size: 14px; fill: #1a1d20; text-anchor: middle; }
  .lp   { fill: #1a1d20; }
  .chg  { font-family: Arial, sans-serif; font-size: 11px; fill: #1a1d20; }
  .arrow { stroke: #cf3b3b; stroke-width: 1.8; fill: none; }
  .arrowhead { fill: #cf3b3b; }
  .lbl { font-family: Arial, sans-serif; font-size: 11px; fill: #6a737a; }
</style>`;

const ARROWHEAD_DEF = `<defs>
  <marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" class="arrowhead"/>
  </marker>
  <marker id="ah-half" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
    <path d="M 0 0 L 10 5" class="arrowhead" stroke="#cf3b3b" stroke-width="1.5" fill="none"/>
  </marker>
</defs>`;

function svg(content, w=320, h=160){
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${STYLE}${ARROWHEAD_DEF}${content}</svg>`;
}

const questions = [];

// ----- Q1: SN2 mechanism — predict product -----
questions.push({
  id: 'OC_arr001',
  section: 'OCHEM',
  topic: 'mech-arrows',
  difficulty: 2,
  q: 'Given starting materials and curved arrows shown, predict the SN2 product.',
  q_svg: svg(`
    <!-- HO- attacking CH3-Br -->
    <text x="35" y="80" class="atom">HO</text>
    <text x="55" y="74" class="chg">⊖</text>
    <!-- arrow from HO- to C -->
    <path class="arrow" d="M 60 86 Q 85 110 110 86" marker-end="url(#ah)"/>
    <!-- methyl bromide -->
    <text x="120" y="80" class="atom">C</text>
    <line class="bond" x1="120" y1="68" x2="120" y2="50"/>
    <text x="120" y="46" class="atom">H</text>
    <line class="bond" x1="112" y1="86" x2="100" y2="100"/>
    <text x="95" y="113" class="atom">H</text>
    <line class="bond" x1="128" y1="86" x2="140" y2="100"/>
    <text x="145" y="113" class="atom">H</text>
    <!-- C-Br bond breaking -->
    <line class="bond" x1="132" y1="80" x2="160" y2="80"/>
    <!-- arrow from C-Br to Br -->
    <path class="arrow" d="M 150 70 Q 175 50 195 60" marker-end="url(#ah)"/>
    <text x="170" y="80" class="atom">Br</text>
    <text x="270" y="84" class="atom">→ ?</text>
    <text x="180" y="140" class="lbl">Single SN2 step · backside attack</text>
  `),
  opts: ['CH3OH + Br−', 'CH3Br (no reaction)', 'CH3OBr', 'CH4 + HOBr'],
  opts_smiles: ['CO', 'CBr', 'COBr', 'C'],
  correct: 0,
  why: 'HO− attacks the carbon backside, displacing Br−. Product: methanol + bromide.',
  _ada_category: 'Mechanisms'
});

// ----- Q2: E2 — predict alkene product -----
questions.push({
  id: 'OC_arr002',
  section: 'OCHEM',
  topic: 'mech-arrows',
  difficulty: 2,
  q: '2-Bromobutane + KOEt (concentrated, hot). Arrows show concerted E2. What is the major Zaitsev product?',
  q_svg: svg(`
    <!-- 2-bromobutane skeletal -->
    <line class="bond" x1="40" y1="100" x2="80" y2="80"/>
    <line class="bond" x1="80" y1="80" x2="120" y2="100"/>
    <line class="bond" x1="120" y1="100" x2="160" y2="80"/>
    <text x="120" y="120" class="atom">Br</text>
    <line class="bond" x1="120" y1="105" x2="120" y2="115"/>
    <!-- base -->
    <text x="220" y="60" class="atom">EtO</text>
    <text x="246" y="54" class="chg">⊖</text>
    <!-- arrow from EtO to H on adjacent C -->
    <path class="arrow" d="M 225 70 Q 180 60 110 76" marker-end="url(#ah)"/>
    <!-- arrow from C-H to C-C bond (forming pi) -->
    <path class="arrow" d="M 105 90 Q 100 95 95 90" marker-end="url(#ah)"/>
    <!-- arrow from C-Br to Br -->
    <path class="arrow" d="M 130 100 Q 145 115 130 125" marker-end="url(#ah)"/>
    <text x="40" y="140" class="lbl">E2: anti-periplanar, single concerted step</text>
  `, 360, 160),
  opts: ['1-butene (Hofmann)', 'cis-2-butene', '2-butene (Zaitsev, mainly trans)', 'butane'],
  opts_smiles: ['CCC=C', 'C/C=C\\C', 'C/C=C/C', 'CCCC'],
  correct: 2,
  why: 'Strong base + concentrated conditions favor E2 with Zaitsev orientation. Anti-periplanar geometry favors trans.',
  _ada_category: 'Mechanisms'
});

// ----- Q3: Resonance — predict structure -----
questions.push({
  id: 'OC_arr003',
  section: 'OCHEM',
  topic: 'mech-arrows',
  difficulty: 2,
  q: 'The carbonate ion has the Lewis structure shown with curved arrows indicating resonance. What is the correct major contributor?',
  q_svg: svg(`
    <!-- carbonate central C with three O's -->
    <text x="160" y="84" class="atom">C</text>
    <line class="bond" x1="160" y1="92" x2="160" y2="120"/>
    <text x="160" y="135" class="atom">O</text>
    <text x="172" y="132" class="chg">⊖</text>
    <line class="dbond" x1="153" y1="76" x2="125" y2="55"/>
    <line class="dbond" x1="148" y1="80" x2="120" y2="60"/>
    <text x="115" y="50" class="atom">O</text>
    <line class="bond" x1="167" y1="76" x2="195" y2="55"/>
    <text x="200" y="50" class="atom">O</text>
    <text x="212" y="48" class="chg">⊖</text>
    <!-- arrow from C=O pi to O making it lone pair -->
    <path class="arrow" d="M 145 60 Q 130 30 115 35" marker-end="url(#ah)"/>
    <!-- arrow from O- lone pair to form new pi to C -->
    <path class="arrow" d="M 200 60 Q 185 35 170 60" marker-end="url(#ah)"/>
    <text x="50" y="140" class="lbl">Three equivalent resonance structures · charge delocalized over 3 O's</text>
  `, 360, 160),
  opts: ['One C=O, two C-O⊖ — three equivalent resonance forms', 'Three C=O double bonds', 'One C=O, one C-O⊖, one C-OH', 'C with three single bonds and triple negative charge'],
  opts_smiles: ['[O-]C(=O)[O-]', null, null, null],
  correct: 0,
  why: 'Carbonate has three equivalent resonance structures with one C=O and two C-O⊖ each; arrows show electron-pair movement between equivalent contributors.',
  _ada_category: 'Mechanisms'
});

// ----- Q4: Markovnikov addition — predict product -----
questions.push({
  id: 'OC_arr004',
  section: 'OCHEM',
  topic: 'mech-arrows',
  difficulty: 2,
  q: 'Propene + HBr. Arrows show electrophilic addition forming the more stable carbocation. Predict the major product.',
  q_svg: svg(`
    <!-- propene CH3-CH=CH2 -->
    <line class="bond" x1="40" y1="90" x2="80" y2="70"/>
    <line class="bond" x1="80" y1="70" x2="120" y2="90"/>
    <line class="bond" x1="84" y1="74" x2="116" y2="92"/>
    <line class="bond" x1="120" y1="90" x2="160" y2="70"/>
    <!-- HBr -->
    <text x="220" y="74" class="atom">H</text>
    <line class="bond" x1="232" y1="70" x2="252" y2="70"/>
    <text x="266" y="74" class="atom">Br</text>
    <!-- arrow from C=C pi to H -->
    <path class="arrow" d="M 100 60 Q 160 40 220 60" marker-end="url(#ah)"/>
    <!-- arrow from H-Br to Br -->
    <path class="arrow" d="M 244 80 Q 270 100 280 84" marker-end="url(#ah)"/>
    <text x="40" y="140" class="lbl">Markovnikov: H adds to CH2 (more H's), Br to internal C</text>
  `, 360, 160),
  opts: ['1-bromopropane (anti-Markovnikov)', '2-bromopropane (Markovnikov)', '1,2-dibromopropane', 'Propanol'],
  opts_smiles: ['CCCBr', 'CC(Br)C', 'BrCC(Br)C', 'CCCO'],
  correct: 1,
  why: 'Electrophilic addition: π electrons attack H, forming the more stable secondary carbocation. Br− then attacks the 2° carbon → 2-bromopropane.',
  _ada_category: 'Mechanisms'
});

// ----- Q5: Predict the arrows (reverse direction) -----
questions.push({
  id: 'OC_arr005',
  section: 'OCHEM',
  topic: 'mech-arrows',
  difficulty: 3,
  q: 'tert-butyl chloride converts to tert-butanol in aqueous solution (SN1). Given the starting material and product below, which curved-arrow set correctly describes the rate-determining step?',
  q_svg: svg(`
    <!-- t-BuCl on left -->
    <text x="60" y="80" class="atom">C</text>
    <text x="60" y="50" class="atom">CH3</text>
    <line class="bond" x1="60" y1="68" x2="60" y2="55"/>
    <text x="30" y="100" class="atom">CH3</text>
    <line class="bond" x1="55" y1="86" x2="40" y2="95"/>
    <text x="90" y="100" class="atom">CH3</text>
    <line class="bond" x1="65" y1="86" x2="80" y2="95"/>
    <line class="bond" x1="68" y1="80" x2="100" y2="80"/>
    <text x="115" y="84" class="atom">Cl</text>
    <text x="160" y="84" class="atom">→</text>
    <!-- t-BuOH on right -->
    <text x="220" y="80" class="atom">C</text>
    <text x="220" y="50" class="atom">CH3</text>
    <line class="bond" x1="220" y1="68" x2="220" y2="55"/>
    <text x="190" y="100" class="atom">CH3</text>
    <line class="bond" x1="215" y1="86" x2="200" y2="95"/>
    <text x="250" y="100" class="atom">CH3</text>
    <line class="bond" x1="225" y1="86" x2="240" y2="95"/>
    <line class="bond" x1="228" y1="80" x2="260" y2="80"/>
    <text x="275" y="84" class="atom">OH</text>
    <text x="40" y="140" class="lbl">Slow step is C-Cl ionization (RDS); fast water attack follows</text>
  `, 360, 160),
  opts: [
    'One arrow from C–Cl bond to Cl, generating t-Bu+ and Cl−',
    'One arrow from H2O lone pair to C with simultaneous C–Cl breakage (concerted)',
    'Two arrows: one from H2O to C, one from C–Cl to Cl, both at the same time',
    'No arrows needed — proton transfer only'
  ],
  correct: 0,
  why: 'SN1 RDS = unimolecular ionization. The single arrow from C-Cl bond to Cl produces a tertiary carbocation. Water attack is the fast second step.',
  _ada_category: 'Mechanisms'
});

// ----- Q6: Proton transfer arrows -----
questions.push({
  id: 'OC_arr006',
  section: 'OCHEM',
  topic: 'mech-arrows',
  difficulty: 1,
  q: 'Acetic acid + sodium hydroxide. Identify the curved arrows for the proton-transfer step.',
  q_svg: svg(`
    <!-- acetic acid -->
    <line class="bond" x1="40" y1="90" x2="80" y2="80"/>
    <text x="80" y="84" class="atom">C</text>
    <line class="dbond" x1="86" y1="74" x2="100" y2="55"/>
    <line class="dbond" x1="91" y1="74" x2="105" y2="55"/>
    <text x="115" y="55" class="atom">O</text>
    <line class="bond" x1="86" y1="86" x2="105" y2="100"/>
    <text x="115" y="105" class="atom">O</text>
    <text x="135" y="105" class="atom">H</text>
    <line class="bond" x1="125" y1="100" x2="135" y2="100"/>
    <!-- HO- -->
    <text x="200" y="105" class="atom">HO</text>
    <text x="222" y="100" class="chg">⊖</text>
    <!-- arrow from O- to H of OH -->
    <path class="arrow" d="M 210 95 Q 175 75 145 95" marker-end="url(#ah)"/>
    <!-- arrow from O-H to O of carboxyl -->
    <path class="arrow" d="M 130 110 Q 120 125 117 113" marker-end="url(#ah)"/>
    <text x="40" y="140" class="lbl">Brønsted acid-base: 2 arrows · base grabs H, electrons return to O</text>
  `, 360, 160),
  opts: [
    'Arrow from HO− lone pair to acidic H, arrow from O–H bond to carboxyl O',
    'Arrow from acidic H to HO− (electrons move with the H)',
    'No arrows needed (electrostatic only)',
    'Single arrow from O–H to HO−'
  ],
  correct: 0,
  why: 'Standard Brønsted: base lone pair takes H, the O–H bonding electrons go back to O− to balance.',
  _ada_category: 'Mechanisms'
});

// ----- Q7: SN1 — predict product (carbocation rearrangement risk) -----
questions.push({
  id: 'OC_arr007',
  section: 'OCHEM',
  topic: 'mech-arrows',
  difficulty: 3,
  q: '3-methyl-2-butanol + HBr (excess). Arrows show carbocation formation and subsequent hydride shift. Predict the major product.',
  q_svg: svg(`
    <!-- 3-methyl-2-butanol -->
    <line class="bond" x1="30" y1="100" x2="65" y2="80"/>
    <line class="bond" x1="65" y1="80" x2="100" y2="100"/>
    <text x="65" y="65" class="atom">OH</text>
    <line class="bond" x1="65" y1="73" x2="65" y2="65"/>
    <line class="bond" x1="100" y1="100" x2="135" y2="80"/>
    <line class="bond" x1="135" y1="80" x2="170" y2="100"/>
    <text x="135" y="65" class="atom">CH3</text>
    <line class="bond" x1="135" y1="73" x2="135" y2="65"/>
    <text x="190" y="84" class="atom">→</text>
    <text x="220" y="84" class="atom">[+H, -H2O, ~H]</text>
    <text x="40" y="140" class="lbl">Secondary carbocation rearranges via 1,2-hydride shift to tertiary</text>
  `, 360, 160),
  opts: [
    '2-bromo-3-methylbutane (no rearrangement)',
    '2-bromo-2-methylbutane (after hydride shift to 3° cation)',
    '3-bromo-3-methylbutane',
    '1-bromo-3-methylbutane'
  ],
  opts_smiles: ['CC(Br)C(C)C', 'CC(Br)(C)CC', null, null],
  correct: 1,
  why: 'Initial 2° carbocation undergoes 1,2-hydride shift to form a more stable 3° cation. Br− attacks → 2-bromo-2-methylbutane.',
  _ada_category: 'Mechanisms'
});

// ----- Q8: EAS arrows (combined mechanism) -----
questions.push({
  id: 'OC_arr008',
  section: 'OCHEM',
  topic: 'mech-arrows',
  difficulty: 3,
  q: 'Benzene + Br2 / FeBr3. The mechanism shows electrophile generation followed by aromatic π-attack. Which set of arrows correctly describes BOTH steps?',
  q_svg: svg(`
    <!-- benzene -->
    <circle cx="80" cy="80" r="22" fill="none" stroke="#1a1d20" stroke-width="1.5"/>
    <polygon points="80,58 100,68 100,92 80,102 60,92 60,68" fill="none" stroke="#1a1d20" stroke-width="1.5"/>
    <!-- Br-Br --- FeBr3 -->
    <text x="160" y="80" class="atom">Br</text>
    <line class="bond" x1="172" y1="80" x2="195" y2="80"/>
    <text x="208" y="80" class="atom">Br</text>
    <text x="246" y="80" class="atom">FeBr3</text>
    <!-- arrow from Br-Br to FeBr3 -->
    <path class="arrow" d="M 200 70 Q 220 50 250 70" marker-end="url(#ah)"/>
    <!-- arrow from benzene pi to Br+ -->
    <path class="arrow" d="M 90 60 Q 130 30 165 65" marker-end="url(#ah)"/>
    <text x="40" y="140" class="lbl">Step 1: Br2 + FeBr3 → Br+ · Step 2: arene π attacks Br+ (loses aromaticity)</text>
  `, 360, 160),
  opts: [
    '2 arrows: Br–Br to FeBr3 generating Br+, then arene π to Br+ forming sigma complex',
    '1 arrow: arene π attacks Br2 directly',
    '3 arrows: arene π to Br, Br–Br to FeBr3, FeBr3 to Br',
    'No arrows — radical mechanism'
  ],
  correct: 0,
  why: 'EAS = combined mechanism. Step 1 generates Br+ via Lewis-acid activation. Step 2 arene π attacks the electrophile, breaking aromaticity at the sigma-complex.',
  _ada_category: 'Mechanisms'
});

// Augment ochem bank
bank.ochem.push(...questions);
console.log('Authored', questions.length, 'arrow-prediction questions.');
console.log('OChem bank now:', bank.ochem.length, 'problems');

fs.writeFileSync('/tmp/dat-mock-bank.json', JSON.stringify(bank));
console.log('Bank rewritten.');
