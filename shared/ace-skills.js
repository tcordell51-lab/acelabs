/* ace-skills.js : one skill tag for every question, the same in the bank build and in the browser.

   A topic ("Lewis structures") holds several skills ("count valence electrons", "spot an
   expanded octet"). Repair brings a miss back as a new version of the same SKILL first, then
   the same topic, then the same question (marked). The tag is read from the question text:

     skill = topic + '/' + concept     when a concept rule below matches the stem
     skill = topic + '/calc'           when most choices are numbers (a calculation)
     skill = topic + '/idea'           otherwise (a concept question)

   Nothing is invented: a rule only names what the stem already says. Rules are checked in
   order, first match wins, and a rule may be limited to some topics. Used by
   scripts/build-ace-banks.mjs (node) and by shared/ace-record.js / ace-test-review.js (browser).

     AceSkills.tag(item) -> { skill, skillName }   item = { section, topic, topicName, stem|q, choices|opts } */
(function (root) {
  'use strict';
  // [section, regex on the stem, concept id, plain name, optional topic list]
  var RULES = [
    // Gen Chem
    ['gchem', /formal charge/i, 'formal-charge', 'formal charge'],
    ['gchem', /resonance/i, 'resonance', 'resonance structures'],
    ['gchem', /more than (8|eight) electrons|expanded octet|exceed(s)? the octet/i, 'expanded-octet', 'expanded octets'],
    ['gchem', /valence electrons?/i, 'valence-count', 'counting valence electrons', ['lewis', 'bonding', 'atomic', 'periodic']],
    ['gchem', /hybridi[sz]/i, 'hybridization', 'hybridization'],
    ['gchem', /bond angle|geometry|shape/i, 'shape', 'molecular shape', ['vsepr', 'lewis', 'bonding', 'hybridization']],
    ['gchem', /effus|graham/i, 'effusion', "Graham's law"],
    ['gchem', /real gas|deviat|van der waals/i, 'real-gas', 'real gas behavior'],
    ['gchem', /partial pressure|mole fraction|dalton/i, 'partial-pressure', 'partial pressure'],
    ['gchem', /kinetic (molecular )?theory|average kinetic|rms speed|root-mean/i, 'kmt', 'kinetic molecular theory'],
    ['gchem', /P₁|V₁|T₁|heated|cooled|compress|expand/i, 'gas-change', 'gas law, before and after', ['gas-laws', 'gases']],
    ['gchem', /PV ?= ?nRT|ideal[- ]gas law/i, 'ideal-gas', 'ideal gas law', ['gas-laws', 'gases']],
    ['gchem', /limiting/i, 'limiting', 'limiting reagent'],
    ['gchem', /percent yield|theoretical yield/i, 'yield', 'percent yield'],
    ['gchem', /empirical|molecular formula|percent (by )?mass|mass percent/i, 'formula', 'formulas from mass data'],
    ['gchem', /molarity|dilut|M1V1|C1V1/i, 'molarity', 'molarity and dilution'],
    ['gchem', /boiling point elevation|freezing point|osmotic|colligative|van ?'?t hoff/i, 'colligative', 'colligative properties'],
    ['gchem', /hess/i, 'hess', "Hess's law"],
    ['gchem', /bond (dissociation )?energ|bond enthalp/i, 'bond-energy', 'bond energies'],
    ['gchem', /specific heat|q ?= ?mc|calorimet|coffee[- ]cup|bomb/i, 'calorimetry', 'calorimetry'],
    ['gchem', /spontane/i, 'spontaneity', 'spontaneity'],
    ['gchem', /half[- ]life/i, 'half-life', 'half-life'],
    ['gchem', /rate law|order (with respect|in)|initial rate/i, 'rate-law', 'rate laws'],
    ['gchem', /activation energy|catalyst|arrhenius/i, 'activation', 'activation energy'],
    ['gchem', /le ch[aâ]telier|shift/i, 'le-chatelier', "Le Chatelier's principle"],
    ['gchem', /ICE|initial.*change.*equilibrium/i, 'ice', 'ICE tables', ['eq-ice', 'equilibrium', 'ksp', 'strong-weak', 'buffers']],
    ['gchem', /\bKsp\b|solubility product|common[- ]ion/i, 'ksp', 'solubility product'],
    ['gchem', /henderson|buffer/i, 'buffer', 'buffers'],
    ['gchem', /equivalence point|titrat|half[- ]equivalence/i, 'titration', 'titration'],
    ['gchem', /\bpOH\b|\bpH\b/i, 'ph-calc', 'pH and pOH', ['ph-basics', 'strong-weak', 'acid-base']],
    ['gchem', /oxidation (state|number)/i, 'ox-state', 'oxidation states'],
    ['gchem', /nernst/i, 'nernst', 'the Nernst equation'],
    ['gchem', /anode|cathode|salt bridge|electrons? flow/i, 'cell-parts', 'anode, cathode and electron flow'],
    ['gchem', /E°cell|cell potential|standard reduction/i, 'cell-potential', 'cell potential'],
    ['gchem', /faraday|electroplat|coulomb/i, 'faraday', 'electrolysis and charge'],
    ['gchem', /alpha|beta|gamma|positron|electron capture|decay/i, 'decay', 'nuclear decay', ['nuclear']],
    ['gchem', /quantum number|\bml\b|\bms\b|orbital/i, 'quantum', 'quantum numbers and orbitals', ['quantum-numbers', 'atomic']],
    ['gchem', /electron configuration|\b1s2|aufbau|hund/i, 'configuration', 'electron configuration'],
    ['gchem', /ionization energy|electronegativ|atomic radius|electron affinity/i, 'trend', 'periodic trends'],
    ['gchem', /hydrogen bond|dipole|london|dispersion|intermolecular/i, 'imf', 'intermolecular forces'],
    ['gchem', /significant figure|sig fig/i, 'sig-figs', 'significant figures'],
    ['gchem', /triple point|critical point|phase diagram/i, 'phase-diagram', 'reading a phase diagram'],
    // Organic Chemistry
    ['ochem', /grignard|MgBr|MgCl|organolithium|\bLi\b.*alkyl/i, 'grignard', 'Grignard and organometallic addition'],
    ['ochem', /LiAlH4|NaBH4|hydride|DIBAL/i, 'hydride', 'hydride reduction'],
    ['ochem', /acetal|ketal|TsOH|ethylene glycol|diol.*protect|equivalents? of (m|)ethanol/i, 'acetal', 'acetals and protecting groups'],
    ['ochem', /aldol|enolate|claisen|LDA/i, 'enolate', 'enolates and aldol chemistry'],
    ['ochem', /wittig|ylide/i, 'wittig', 'the Wittig reaction'],
    ['ochem', /imine|enamine|hydrazone|oxime/i, 'imine', 'imines and enamines'],
    ['ochem', /PCC|chromic|jones|KMnO4|ozonol|\bO3\b|oxidi[sz]e[sd]? (a|an|the|to)\b/i, 'oxidation', 'oxidation reagents'],
    ['ochem', /\bSN2\b|backside|inversion/i, 'sn2', 'SN2'],
    ['ochem', /\bSN1\b|carbocation|rearrang/i, 'sn1', 'SN1 and carbocations'],
    ['ochem', /\bE2\b|zaitsev|hofmann|anti[- ]periplanar/i, 'e2', 'E2 elimination'],
    ['ochem', /\bE1\b/i, 'e1', 'E1 elimination'],
    ['ochem', /markovnikov|HBr|HCl|hydrohalogen/i, 'markovnikov', 'Markovnikov addition', ['alkene-add', 'alkyne']],
    ['ochem', /hydroboration|BH3|9-BBN/i, 'hydroboration', 'hydroboration'],
    ['ochem', /Br2|Cl2|halohydrin|bromonium/i, 'halogenation', 'halogen addition'],
    ['ochem', /hydrogenat|[Ll]indlar|H2\s*(\/|over|with|,)\s*(Pd|Pt|Ni)\b/, 'hydrogenation', 'hydrogenation'],
    ['ochem', /nitrat|sulfonat|friedel|acylat|alkylat|\bEAS\b|electrophilic aromatic|ortho|meta|para|FeBr3|FeCl3|AlCl3|brominat|chlorinat/i, 'eas', 'EAS reactions and directing effects', ['arom-eas']],
    ['ochem', /aromatic|h[uü]ckel|antiaromatic/i, 'aromaticity', 'aromaticity'],
    ['ochem', /\bR\b.*\bS\b|\(R\)|\(S\)|chiral|stereocenter|enantiomer|diastereomer|meso/i, 'stereo', 'stereochemistry'],
    ['ochem', /\bIR\b|infrared|cm-1|cm⁻¹/i, 'ir', 'IR peaks'],
    ['ochem', /NMR|ppm|singlet|doublet|triplet|splitting/i, 'nmr', 'NMR'],
    ['ochem', /pKa|more acidic|most acidic|conjugate base|acidity/i, 'acidity', 'ranking acidity'],
    ['ochem', /extraction|distill|recrystalli|chromatograph|TLC|Rf/i, 'lab', 'lab separations'],
    ['ochem', /ester|amide|acid chloride|anhydride|saponif|fischer/i, 'acyl', 'acyl substitution'],
    ['ochem', /arrow|nucleophile|electrophile|mechanism/i, 'arrows', 'arrows and mechanism steps'],
    // Biology
    ['bio', /hydrogen bond|cohesion|adhesion|specific heat|heat capacity|polar|freez|ice|boil|temperature/i, 'water-props', 'properties of water', ['water']],
    ['bio', /km|vmax|competitive|noncompetitive|allosteric|inhibitor/i, 'inhibition', 'enzyme inhibition and kinetics'],
    ['bio', /active site|activation energy|cofactor|coenzyme/i, 'enzyme-action', 'how enzymes work'],
    ['bio', /osmo|tonic|diffusion|channel|pump|Na\+?\/K\+|transport/i, 'transport', 'membrane transport'],
    ['bio', /ATP synthase|electron transport|proton gradient|chemiosmo|oxidative phosph/i, 'etc', 'electron transport and ATP synthase'],
    ['bio', /krebs|citric acid|acetyl-CoA|NADH|FADH/i, 'krebs', 'the Krebs cycle'],
    ['bio', /glycoly|pyruvate|ferment|lactate/i, 'glycolysis', 'glycolysis and fermentation'],
    ['bio', /calvin|light reaction|photosystem|chlorophyll|thylakoid|rubisco/i, 'photo', 'photosynthesis steps'],
    ['bio', /meiosis|crossing over|homologous|nondisjunction/i, 'meiosis', 'meiosis'],
    ['bio', /mitosis|metaphase|anaphase|prophase|telophase|cyclin|checkpoint/i, 'mitosis', 'mitosis and the cell cycle'],
    ['bio', /helicase|primase|polymerase|okazaki|leading strand|lagging/i, 'replication', 'DNA replication enzymes'],
    ['bio', /promoter|transcription factor|splic|intron|exon|mRNA processing|5' cap|poly-?A/i, 'transcription', 'transcription and processing'],
    ['bio', /codon|anticodon|ribosome|tRNA|translation/i, 'translation', 'translation'],
    ['bio', /operon|lac|trp|repressor|inducer/i, 'operon', 'operons'],
    ['bio', /mutation|frameshift|missense|nonsense|silent/i, 'mutation', 'mutation types'],
    ['bio', /punnett|dihybrid|monohybrid|linked|recombinat|pedigree|x-linked|epista/i, 'crosses', 'genetic crosses and pedigrees'],
    ['bio', /hardy|weinberg|allele frequency/i, 'hardy-weinberg', 'Hardy-Weinberg'],
    ['bio', /mitochondri|chloroplast|golgi|endoplasmic|lysosom|peroxisom|nucleolus/i, 'organelle-job', 'which organelle does what'],
    ['bio', /PCR|gel|electrophoresis|blot|restriction|CRISPR|plasmid/i, 'lab-tech', 'lab techniques'],
    ['bio', /receptor|second messenger|cAMP|G[- ]protein|kinase/i, 'signaling', 'signaling pathways'],
    // Quantitative Reasoning
    ['qr', /worker|painter|pipe|same pace|together|alone/i, 'work-rate', 'work rate'],
    ['qr', /ratio|:\d/i, 'ratio', 'ratios'],
    ['qr', /scale|map/i, 'scale', 'scale and proportion'],
    ['qr', /percent|%/i, 'percent', 'percents'],
    ['qr', /interest|compound/i, 'interest', 'interest'],
    ['qr', /mph|km\/h|speed|distance|travel/i, 'distance-rate', 'distance, rate and time'],
    ['qr', /mixture|solution|alloy|concentrat/i, 'mixture', 'mixtures'],
    ['qr', /probab|odds|chance|random/i, 'probability', 'probability'],
    ['qr', /arrange|permut|combination|choose|committee/i, 'counting', 'counting'],
    ['qr', /mean|median|mode|standard deviation|average/i, 'stats', 'averages and spread'],
    ['qr', /log|exponent|\^/i, 'exponents', 'exponents and logs'],
    ['qr', /triangle|circle|area|perimeter|volume|angle|radius/i, 'geometry', 'geometry'],
    ['qr', /slope|line|coordinate|intercept/i, 'coordinate', 'lines and coordinates'],
    ['qr', /fraction|\d\/\d/i, 'fraction', 'fractions']
  ];

  function stemOf(it) { return String(it.stem || it.q || it.question || ''); }
  function choicesOf(it) { return it.choices || it.opts || it.options || []; }
  function numeric(c) { return /^[\s$−\-+~≈]*\d[\d.,\s]*(%|[a-zA-Z/·²³⁻⁰¹°]{0,12}[\s\w/·²³⁻°.]*)?$/.test(String(c).trim()) && String(c).trim().length < 28; }
  function sectionOf(it) {
    var s = String(it.section || '').toLowerCase();
    return { gc: 'gchem', gchem: 'gchem', 'gen chem': 'gchem', ochem: 'ochem', oc: 'ochem', organic: 'ochem', bio: 'bio', biology: 'bio', qr: 'qr', pat: 'pat', rc: 'rc', reading: 'rc' }[s] || s;
  }

  function tag(it) {
    var sec = sectionOf(it), topic = String(it.topic || 'general'), stem = stemOf(it);
    if (sec === 'pat' || sec === 'rc') return { skill: topic, skillName: it.topicName || topic };
    // rules written for this topic first, then the section-wide rules
    for (var pass = 0; pass < 2; pass++) for (var i = 0; i < RULES.length; i++) {
      var r = RULES[i];
      if (r[0] !== sec) continue;
      if (pass === 0 ? !(r[4] && r[4].indexOf(topic) >= 0) : !!r[4]) continue;
      if (r[1].test(stem)) return { skill: (sec === 'qr' ? 'qr' : topic) + '/' + r[2], skillName: r[3] };
    }
    var ch = choicesOf(it), n = 0;
    for (var j = 0; j < ch.length; j++) if (numeric(ch[j])) n += 1;
    var calc = ch.length && n / ch.length >= 0.6;
    var name = it.topicName || topic.replace(/-/g, ' ');
    return calc ? { skill: topic + '/calc', skillName: name.toLowerCase() + ', calculation' } : { skill: topic + '/idea', skillName: name.toLowerCase() + ', concept' };
  }

  var api = { version: 1, tag: tag, rules: RULES.length, sectionOf: sectionOf };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.AceSkills = api;
})(typeof window !== 'undefined' ? window : null);
