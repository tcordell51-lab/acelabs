/* ============================================================
   Mini-Test Remediation Map
   For every (section, topic) a miss can carry, this routes the student to
   the exact place to repair it: the Retold night that teaches it, the review
   engine that drills it, AND the 15-second Trick short that fixes it. The
   review + master-mistake list read this, so a wrong answer always has a fix.
   ============================================================ */
window.MINITEST_REMEDIATION = {
  bio: {
    name: 'Biology',
    learn: '/tools/bio-retold/',      // Retold course (learn it)
    review: '/tools/bio/',            // Bio Repair Lab (drill it)
    rail: '#57b487',
    topics: {
      'Biomolecules': 'Structure-function contract; the four macromolecules',
      'Cell structure & organelles': 'The cell as a city',
      'Membrane transport': 'The membrane and what crosses it',
      'Cellular respiration': 'The glucose story',
      'Photosynthesis': 'Catching the light',
      'Central dogma (DNA->RNA->protein)': 'The central dogma',
      'Mitosis & meiosis': 'Copying the code / why sex shuffles the deck',
      'Mendelian genetics': 'Mendelian genetics + Punnett squares',
      'Evolution & population genetics': 'Evolution: the engine of diversity',
      'Physiology (a body system)': 'Physiology: the control systems',
    },
  },
  gchem: {
    name: 'General Chemistry',
    learn: '/tools/gchem/',
    review: '/tools/gc/',
    rail: '#5b8fd6',
    topics: {
      'Moles & stoichiometry': 'Count the particles: the mole bridge',
      'Atomic structure & quantum numbers': 'Rooms for electrons',
      'Periodic trends': 'Every atom wants to be a noble gas',
      'Bonding, Lewis & VSEPR': 'Shapes from electron pairs',
      'Gas laws': 'Particles hammering the walls',
      'Thermochemistry': 'Follow the energy downhill',
      'Kinetics': 'How fast, not how far',
      'Equilibrium': 'Q points the way to K',
      'Acids, bases & pH': 'Counting loose protons',
      'Electrochemistry': 'Red Cat, An Ox',
    },
  },
  ochem: {
    name: 'Organic Chemistry',
    learn: '/tools/organic/',
    review: '/tools/ochem/',   // the engine (was the Retold course twice; fixed 2026-09-03)
    rail: '#9b7bd0',
    topics: {
      'IUPAC nomenclature': 'Reading and naming the skeleton',
      'Stereochemistry (R/S, chirality)': 'R/S in three moves',
      'SN1/SN2/E1/E2': 'The four questions that pick the mechanism',
      'Alkene addition reactions': 'The alkene reagent map',
      'Aromaticity & EAS': 'EAS directors: the group calls the shot',
      'Alcohols & carbonyls': 'Rich attacks poor at the carbonyl',
      'Acidity & pKa': 'Run CARDIO in order',
      'Resonance & stability': 'Spread the charge, drop the energy',
      'IR & H-NMR spectroscopy': 'IR two steps / H-NMR two steps',
      'Synthesis / roadmap': 'Chaining the reaction map',
    },
  },
  qr: {
    name: 'Quantitative Reasoning',
    learn: '/tools/qr-retold/',
    review: '/tools/qr/',
    rail: '#d98aa8',
    topics: {
      'Fractions & decimals': 'Turn the words into a number',
      'Algebra & equations': 'Set it up, the answer falls out',
      'Ratios & proportions': 'Scale one side, scale the other',
      'Percentages': 'Of, is, and change',
      'Exponents & roots': 'Powers and their inverses',
      'Geometry (area/volume)': 'Draw it, then measure it',
      'Trigonometry': 'SOH-CAH-TOA and the unit circle',
      'Probability': 'Count the wins over the total',
      'Statistics (mean/median/SD)': 'Center and spread',
      'Word problems (rate/work/mixture)': 'The setup is the hard part',
    },
  },
};

/* Trick shorts (the 15-second fixes). Maps a (section, topic) to a Trick Series
   short key -> /tricks/series/topic-tiktok.html?topic=<key>. Only OChem and some
   GChem topics have a short today (the Trick Series is Orgo/GChem); the rest lean
   on the Retold night + engine. GChem also routes to the Gen Chem tiktok player
   for topics the Trick Series doesn't cover. */
window.MINITEST_TRICKS = {
  seriesBase: '/tricks/series/topic-tiktok.html?topic=',   // + key
  gcBase: '/tools/gc/tiktoks/topic-tiktok.html?topic=',     // + key (Gen Chem set)
  series: {
    ochem: {
      'Stereochemistry (R/S, chirality)': 'rs-three-moves',
      'SN1/SN2/E1/E2': 'sn-e',
      'Alkene addition reactions': 'alkene-map',
      'Aromaticity & EAS': 'eas-directors',
      'Alcohols & carbonyls': 'rich-poor',
      'Acidity & pKa': 'acidity-cardio',
      'IR & H-NMR spectroscopy': 'hnmr',
      'Synthesis / roadmap': 'alkene-map',
      'Resonance & stability': 'rich-poor',
    },
    gchem: {
      'Periodic trends': 'periodic-trends',
      'Electrochemistry': 'electrochem',
      'Moles & stoichiometry': 'limiting-reagent',
      'Atomic structure & quantum numbers': 'gchem-atomic',
      'Bonding, Lewis & VSEPR': 'gchem-bonding',
      'Gas laws': 'gchem-gas',
      'Thermochemistry': 'gchem-thermo',
      'Kinetics': 'gchem-kinetics',
      'Equilibrium': 'gchem-equilibrium',
      'Acids, bases & pH': 'gchem-acids',
    },
    bio: {
      'Biomolecules': 'bio-biomolecules',
      'Cell structure & organelles': 'bio-organelles',
      'Membrane transport': 'bio-transport',
      'Cellular respiration': 'bio-respiration',
      'Photosynthesis': 'bio-photosynthesis',
      'Central dogma (DNA->RNA->protein)': 'bio-central-dogma',
      'Mitosis & meiosis': 'bio-cell-division',
      'Mendelian genetics': 'bio-mendel',
      'Evolution & population genetics': 'bio-evolution',
      'Physiology (a body system)': 'bio-physiology',
    },
    qr: {
      'Fractions & decimals': 'qr-fractions',
      'Algebra & equations': 'qr-algebra',
      'Ratios & proportions': 'qr-ratios',
      'Percentages': 'qr-percentages',
      'Exponents & roots': 'qr-exponents',
      'Geometry (area/volume)': 'qr-geometry',
      'Trigonometry': 'qr-trig',
      'Probability': 'qr-probability',
      'Statistics (mean/median/SD)': 'qr-statistics',
      'Word problems (rate/work/mixture)': 'qr-word-problems',
    },
  },
};


/* Black-background bespoke videos (~/acethedat-tiktok-studio, ported CSP-safe to /tricks/videos/).
   Where a topic has one, the review prefers it over the green templated short. */
window.MINITEST_BLACK = {
  base: "/tricks/videos/",
  map: {
    ochem: {
      "Aromaticity & EAS": "eas-directing",
      "Acidity & pKa": "acidity-ranking",
      "SN1/SN2/E1/E2": "sn1-vs-sn2",
      "Stereochemistry (R/S, chirality)": "rs-configuration",
      "IR & H-NMR spectroscopy": "nmr-two-steps",
      "Alkene addition reactions": "alkene-map",
      "Synthesis / roadmap": "ozonolysis",
    },
    gchem: {
      "Electrochemistry": "red-cat-an-ox",
      "Moles & stoichiometry": "limiting-reagent",
      "Periodic trends": "periodic-trends",
    },
  },
};
