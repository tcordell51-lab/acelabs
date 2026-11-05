// Generated after independent campaign review. Historical releases remain unchanged.
export const campaignChapters = [
  {
    "id": "bio-energy-canopy",
    "world": "bio",
    "title": "The Energy Canopy",
    "scope": "Three bounded facets of Cellular Energy and Photosynthesis: carbon/electron routes and lactate fermentation; mitochondrial chemiosmosis with conditional block/leak reasoning; light reactions versus carbon fixation with plant respiration. B3 and B4 remain partial. Detailed metabolic enzymes, universal ATP yields, carrier shuttles, exact pumping stoichiometry, alternate respiratory acceptors, pigments, cyclic photophosphorylation, detailed Calvin intermediates, C3/C4/CAM, photorespiration and metabolic regulation remain outside this chapter.",
    "objectiveIds": [
      "bio-energy-carbon-electrons",
      "bio-energy-chemiosmosis",
      "bio-energy-light-carbon"
    ],
    "metadata": {
      "course": "BIO",
      "session": 5,
      "creature": "lumivine",
      "stationName": "Energy Canopy",
      "pathVariant": 2,
      "chapterTheme": "bio",
      "creatureDescriptor": {
        "id": "lumivine",
        "name": "Lumivine",
        "type": "vital",
        "color": "#71d7a0",
        "bodyPlan": "moss-backed-gliding-salamander",
        "concept": "Separate carbon, electron and proton pathways to explain cellular energy",
        "evolutions": [
          "Lumivine",
          "Protonymph",
          "Canoptera"
        ],
        "rareName": "Aurora Canoptera",
        "blurb": "A moss-backed gliding salamander with leaf fins and lantern fronds restores the Canopy’s swapped pathway labels. Its fronds are decorative, not literal organelles or ATP molecules."
      },
      "topicMappings": {
        "screenshotTopicIds": [
          "bootcamp-biology-3",
          "bootcamp-biology-4"
        ],
        "officialOnlyTopicIds": []
      },
      "instructionFamilyIds": [
        "discovery-bio-energy-canopy",
        "bio-energy-carbon-route",
        "bio-energy-electron-destination",
        "bio-energy-fermentation-recycling",
        "bio-energy-gradient-direction",
        "bio-energy-block-versus-leak",
        "bio-energy-light-versus-carbon",
        "bio-energy-plant-respiration"
      ]
    },
    "canonSources": [
      {
        "id": "bio-cellular-respiration",
        "version": "0.2.1",
        "sourceRelativePath": "visuals/sheets/bio/bio-cellular-respiration.json",
        "sourceSha256": "df2b0d7f67748c0ce3856806293bc0d8f3142da56ba9c17b1aedac2e78f96315",
        "sourceRepository": "ace-system",
        "inspectedExportSha256": "3d42da035491489dc2bb09610235de8499e8117e4b694b05b314b4e93bf304f7",
        "adaptationVersion": 1,
        "importsSourceAssessments": false,
        "formativeCanonChecksProgressEligible": false,
        "reviewScope": "Carbon and electron routes, eukaryotic compartment locations, glycolysis and lactate fermentation. No universal ATP yield, source questions or source renderer."
      },
      {
        "id": "bio-etc-gradient",
        "version": "0.2.1",
        "sourceRelativePath": "visuals/sheets/bio/bio-etc-gradient.json",
        "sourceSha256": "81fe0aa6a9de2b9df005319b8c46a1124e810314c788e4dfd9dc52c52fa7ba98",
        "sourceRepository": "ace-system",
        "inspectedExportSha256": "3d42da035491489dc2bb09610235de8499e8117e4b694b05b314b4e93bf304f7",
        "adaptationVersion": 1,
        "importsSourceAssessments": false,
        "formativeCanonChecksProgressEligible": false,
        "reviewScope": "Qualitative proton pumping, ATP synthase and bounded block/leak reasoning. No proton-per-complex or ATP-per-carrier memorization; perturbation assumptions are explicit."
      },
      {
        "id": "bio-photosynthesis",
        "version": "0.1.0",
        "sourceRelativePath": "visuals/sheets/bio/bio-photosynthesis.json",
        "sourceSha256": "a784a6c2793fd6c164e4c1e7a09f38851587fe013b6972c5b6e45ec763ccfeed",
        "sourceRepository": "ace-system",
        "inspectedExportSha256": "3d42da035491489dc2bb09610235de8499e8117e4b694b05b314b4e93bf304f7",
        "adaptationVersion": 1,
        "importsSourceAssessments": false,
        "formativeCanonChecksProgressEligible": false,
        "reviewScope": "Separate light reactions and carbon fixation, water-derived oxygen and plant respiration. G3P clarified as net Calvin product; C3/C4/CAM and source checks excluded."
      }
    ],
    "objectives": [
      {
        "id": "bio-energy-carbon-electrons",
        "world": "bio",
        "name": "Trace carbon and electrons through respiration and fermentation",
        "lesson": "Keep matter and energy ledgers separate. Carbon atoms from glucose remain in carbon-containing products; electrons can move between molecules. Oxidation loses electrons and reduction gains them. NAD+ accepts electrons to become NADH; NADH can donate them and return to NAD+. In conventional eukaryotic glucose respiration, cytosolic glycolysis splits one six-carbon glucose into two three-carbon pyruvates, makes NADH, and nets two ATP by substrate-level phosphorylation: direct phosphate transfer to ADP. It does not release CO2 or directly consume O2. In the mitochondrial matrix, pyruvate oxidation and the citric acid cycle release CO2 and reduce carriers. The chain in the inner mitochondrial membrane transfers carrier electrons to O2, making water; O2 is the terminal electron acceptor, not the carbon source of CO2. Without adequate NAD+ recycling, glycolysis cannot continue. Lactate fermentation transfers NADH electrons to pyruvate, restoring NAD+; the conversion to lactate adds no ATP beyond glycolysis. It differs from anaerobic respiration that uses an ETC with a different terminal acceptor. Total respiratory ATP yield varies with conditions and coupling; no universal grand total is required here.",
        "sourceUrls": [
          "https://openstax.org/books/biology-2e/pages/7-1-energy-in-living-systems",
          "https://openstax.org/books/biology-2e/pages/7-2-glycolysis",
          "https://openstax.org/books/biology-2e/pages/7-3-oxidation-of-pyruvate-and-the-citric-acid-cycle",
          "https://openstax.org/books/biology-2e/pages/7-4-oxidative-phosphorylation",
          "https://openstax.org/books/biology-2e/pages/7-5-metabolism-without-oxygen"
        ],
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "bio-energy-chemiosmosis",
        "world": "bio",
        "name": "Explain chemiosmosis and distinguish a blocked route from a proton leak",
        "lesson": "The inner mitochondrial membrane separates the matrix from the intermembrane space. Electron transfer through the respiratory chain supplies energy to pump H+ from matrix to intermembrane space, storing energy in an electrochemical gradient: a concentration difference plus an electrical difference. In a respiring coupled mitochondrion, the intermembrane space has higher H+ concentration and lower pH relative to the matrix. H+ returning down that gradient through ATP synthase supports ATP formation from ADP and phosphate on the matrix side. Electrons, protons and ATP are different parts of this mechanism; the chain does not directly phosphorylate ADP. If electron transfer is blocked, pumping stops and the existing gradient can dissipate. If ATP synthase is blocked while the membrane remains tight, ATP production through it falls; initial pumping raises backpressure, which slows electron flow and O2 use. If a proton leak bypasses ATP synthase while the chain remains intact and fuel and O2 are available, coupling and the gradient fall. Electron flow and O2 use can continue or rise while ATP yield falls and more energy becomes heat. These are conditional qualitative predictions, not a claim that every damaged cell increases oxygen use.",
        "sourceUrls": [
          "https://openstax.org/books/biology-2e/pages/7-1-energy-in-living-systems",
          "https://openstax.org/books/biology-2e/pages/7-4-oxidative-phosphorylation"
        ],
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "bio-energy-light-carbon",
        "world": "bio",
        "name": "Separate light reactions, carbon fixation and plant respiration",
        "lesson": "A chloroplast contains thylakoid membranes surrounding a lumen and a fluid region called the stroma. During linear light-driven electron flow, water is oxidized at photosystem II: its oxygen atoms form released O2, and its electrons enter the photosynthetic chain. Light energizes electrons in photosystems II and I; the pathway supplies NADPH and a proton gradient. H+ accumulates in the thylakoid lumen and returns through ATP synthase to the stroma, where ATP is produced. The Calvin cycle in the stroma fixes CO2 into organic molecules and uses ATP for energy and NADPH for reducing electrons. Its net exported product is G3P, a three-carbon molecule that can help build carbohydrate; the cycle does not directly emit O2. Light-independent means no photon is absorbed in those carbon-fixation steps, not that they occur only at night or run forever without light-reaction products. If light stops and ATP/NADPH supplies are depleted, sustained Calvin-cycle output cannot continue; light also regulates several enzymes. Plant cells also carry out mitochondrial respiration. Photosynthesis and respiration have different roles and can operate simultaneously under suitable conditions.",
        "sourceUrls": [
          "https://openstax.org/books/biology-2e/pages/8-1-overview-of-photosynthesis",
          "https://openstax.org/books/biology-2e/pages/8-2-the-light-dependent-reactions-of-photosynthesis",
          "https://openstax.org/books/biology-2e/pages/8-3-using-light-energy-to-make-organic-molecules",
          "https://openstax.org/books/biology-2e/pages/7-4-oxidative-phosphorylation"
        ],
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      }
    ],
    "teachingByObjective": {
      "bio-energy-carbon-electrons": {
        "objectiveId": "bio-energy-carbon-electrons",
        "version": 1,
        "core": "Keep matter and energy ledgers separate. Carbon atoms from glucose remain in carbon-containing products; electrons can move between molecules. Oxidation loses electrons and reduction gains them. NAD+ accepts electrons to become NADH; NADH can donate them and return to NAD+. In conventional eukaryotic glucose respiration, cytosolic glycolysis splits one six-carbon glucose into two three-carbon pyruvates, makes NADH, and nets two ATP by substrate-level phosphorylation: direct phosphate transfer to ADP. It does not release CO2 or directly consume O2. In the mitochondrial matrix, pyruvate oxidation and the citric acid cycle release CO2 and reduce carriers. The chain in the inner mitochondrial membrane transfers carrier electrons to O2, making water; O2 is the terminal electron acceptor, not the carbon source of CO2. Without adequate NAD+ recycling, glycolysis cannot continue. Lactate fermentation transfers NADH electrons to pyruvate, restoring NAD+; the conversion to lactate adds no ATP beyond glycolysis. It differs from anaerobic respiration that uses an ETC with a different terminal acceptor. Total respiratory ATP yield varies with conditions and coupling; no universal grand total is required here.",
        "terms": [
          {
            "term": "Carbon ledger",
            "meaning": "Track carbon atoms in glucose, pyruvate, CO2 or lactate separately from electrons."
          },
          {
            "term": "Redox",
            "meaning": "Paired electron loss (oxidation) and gain (reduction)."
          },
          {
            "term": "NAD+ / NADH",
            "meaning": "Oxidized and reduced states of a recyclable electron carrier."
          },
          {
            "term": "Substrate-level phosphorylation",
            "meaning": "Direct enzymatic transfer of a phosphate from an organic substrate to ADP."
          },
          {
            "term": "Terminal electron acceptor",
            "meaning": "The molecule receiving electrons at the end of an electron-transfer pathway."
          },
          {
            "term": "Fermentation",
            "meaning": "Regeneration of oxidized carriers by reducing an organic acceptor, without an ETC."
          }
        ],
        "assumptions": [
          "Locations refer to a conventional eukaryotic cell, not a prokaryotic membrane.",
          "Complete oxidation is net carbon accounting, not a first-turn isotope map of the citric acid cycle.",
          "Lactate fermentation is the named example; no claim is made that every fermentation has identical products."
        ],
        "workedExample": {
          "prompt": "A cell converts one glucose into two pyruvates by glycolysis, then converts both to lactate when aerobic electron transfer is unavailable. What keeps glycolysis possible?",
          "steps": [
            "The six glucose carbons remain in two three-carbon molecules; fermentation does not release those carbons as CO2 in this lactate example.",
            "Glycolysis needs NAD+ to accept electrons and makes NADH.",
            "Reduction of pyruvate to lactate oxidizes NADH back to NAD+, replenishing that requirement.",
            "Glycolysis makes net two ATP; the lactate-producing step does not add ATP."
          ],
          "answer": "NAD+ recycling permits continued glycolysis; lactate formation is not a replacement oxygen-driven ETC.",
          "familyId": "bio-energy-fermentation-recycling",
          "role": "instruction-only"
        },
        "commonMistake": "Do not merge carbon loss, electron transfer and ATP production into one event. O2 is consumed at the aerobic chain end, not directly by glycolysis.",
        "nextAction": "Track carbon products first, then the NAD+/NADH cycle, then the mechanism that makes ATP.",
        "sourceUrls": [
          "https://openstax.org/books/biology-2e/pages/7-1-energy-in-living-systems",
          "https://openstax.org/books/biology-2e/pages/7-2-glycolysis",
          "https://openstax.org/books/biology-2e/pages/7-3-oxidation-of-pyruvate-and-the-citric-acid-cycle",
          "https://openstax.org/books/biology-2e/pages/7-4-oxidative-phosphorylation",
          "https://openstax.org/books/biology-2e/pages/7-5-metabolism-without-oxygen"
        ],
        "canon": {
          "id": "bio-cellular-respiration",
          "version": "0.2.1",
          "sourceRelativePath": "visuals/sheets/bio/bio-cellular-respiration.json",
          "sourceSha256": "df2b0d7f67748c0ce3856806293bc0d8f3142da56ba9c17b1aedac2e78f96315",
          "sourceRepository": "ace-system",
          "inspectedExportSha256": "3d42da035491489dc2bb09610235de8499e8117e4b694b05b314b4e93bf304f7",
          "adaptationVersion": 1,
          "importsSourceAssessments": false,
          "formativeCanonChecksProgressEligible": false,
          "reviewScope": "Carbon and electron routes, eukaryotic compartment locations, glycolysis and lactate fermentation. No universal ATP yield, source questions or source renderer."
        },
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      "bio-energy-chemiosmosis": {
        "objectiveId": "bio-energy-chemiosmosis",
        "version": 1,
        "core": "The inner mitochondrial membrane separates the matrix from the intermembrane space. Electron transfer through the respiratory chain supplies energy to pump H+ from matrix to intermembrane space, storing energy in an electrochemical gradient: a concentration difference plus an electrical difference. In a respiring coupled mitochondrion, the intermembrane space has higher H+ concentration and lower pH relative to the matrix. H+ returning down that gradient through ATP synthase supports ATP formation from ADP and phosphate on the matrix side. Electrons, protons and ATP are different parts of this mechanism; the chain does not directly phosphorylate ADP. If electron transfer is blocked, pumping stops and the existing gradient can dissipate. If ATP synthase is blocked while the membrane remains tight, ATP production through it falls; initial pumping raises backpressure, which slows electron flow and O2 use. If a proton leak bypasses ATP synthase while the chain remains intact and fuel and O2 are available, coupling and the gradient fall. Electron flow and O2 use can continue or rise while ATP yield falls and more energy becomes heat. These are conditional qualitative predictions, not a claim that every damaged cell increases oxygen use.",
        "terms": [
          {
            "term": "Matrix",
            "meaning": "Compartment inside the inner mitochondrial membrane."
          },
          {
            "term": "Intermembrane space",
            "meaning": "Space between outer and inner mitochondrial membranes."
          },
          {
            "term": "Electrochemical gradient",
            "meaning": "Combined concentration and electrical driving force on an ion."
          },
          {
            "term": "ATP synthase",
            "meaning": "Membrane enzyme that couples downhill H+ movement to ATP formation in this forward-running model."
          },
          {
            "term": "Uncoupling",
            "meaning": "H+ returns by a route that bypasses ATP synthase, reducing ATP made per electron transfer."
          }
        ],
        "assumptions": [
          "Fuel, oxygen, ADP and phosphate are available unless a prompt states otherwise.",
          "A tight membrane lacks a substantial added proton leak.",
          "Perturbations are considered after initial adjustment, before cell damage or exhaustion creates additional limits."
        ],
        "workedExample": {
          "prompt": "In a coupled mitochondrion, an intervention blocks ATP synthase but leaves the ETC and inner membrane initially intact. Why can O2 use slow even though no chain complex is directly blocked?",
          "steps": [
            "ATP synthase can no longer provide its normal H+ return route.",
            "Pumping can initially continue, increasing the opposing gradient.",
            "The growing gradient makes further pumping harder; electron transfer and O2 consumption slow."
          ],
          "answer": "ATP synthase blockade reduces ATP production and indirectly slows the chain through gradient backpressure.",
          "familyId": "bio-energy-block-versus-leak",
          "role": "instruction-only"
        },
        "commonMistake": "A proton leak and an ATP synthase block both reduce ATP output but have different effects on the gradient. A gradient stores energy; it does not create it.",
        "nextAction": "Identify the damaged route: electron transfer, ATP synthase, or a bypass leak; then trace pumping and H+ return.",
        "sourceUrls": [
          "https://openstax.org/books/biology-2e/pages/7-1-energy-in-living-systems",
          "https://openstax.org/books/biology-2e/pages/7-4-oxidative-phosphorylation"
        ],
        "canon": {
          "id": "bio-etc-gradient",
          "version": "0.2.1",
          "sourceRelativePath": "visuals/sheets/bio/bio-etc-gradient.json",
          "sourceSha256": "81fe0aa6a9de2b9df005319b8c46a1124e810314c788e4dfd9dc52c52fa7ba98",
          "sourceRepository": "ace-system",
          "inspectedExportSha256": "3d42da035491489dc2bb09610235de8499e8117e4b694b05b314b4e93bf304f7",
          "adaptationVersion": 1,
          "importsSourceAssessments": false,
          "formativeCanonChecksProgressEligible": false,
          "reviewScope": "Qualitative proton pumping, ATP synthase and bounded block/leak reasoning. No proton-per-complex or ATP-per-carrier memorization; perturbation assumptions are explicit."
        },
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      "bio-energy-light-carbon": {
        "objectiveId": "bio-energy-light-carbon",
        "version": 1,
        "core": "A chloroplast contains thylakoid membranes surrounding a lumen and a fluid region called the stroma. During linear light-driven electron flow, water is oxidized at photosystem II: its oxygen atoms form released O2, and its electrons enter the photosynthetic chain. Light energizes electrons in photosystems II and I; the pathway supplies NADPH and a proton gradient. H+ accumulates in the thylakoid lumen and returns through ATP synthase to the stroma, where ATP is produced. The Calvin cycle in the stroma fixes CO2 into organic molecules and uses ATP for energy and NADPH for reducing electrons. Its net exported product is G3P, a three-carbon molecule that can help build carbohydrate; the cycle does not directly emit O2. Light-independent means no photon is absorbed in those carbon-fixation steps, not that they occur only at night or run forever without light-reaction products. If light stops and ATP/NADPH supplies are depleted, sustained Calvin-cycle output cannot continue; light also regulates several enzymes. Plant cells also carry out mitochondrial respiration. Photosynthesis and respiration have different roles and can operate simultaneously under suitable conditions.",
        "terms": [
          {
            "term": "Thylakoid lumen",
            "meaning": "The space enclosed by a thylakoid membrane; H+ accumulates here during the light reactions."
          },
          {
            "term": "Stroma",
            "meaning": "Chloroplast fluid surrounding thylakoids; site of the Calvin cycle."
          },
          {
            "term": "NADPH",
            "meaning": "Reduced electron carrier supplying reducing electrons to carbon-building reactions."
          },
          {
            "term": "Carbon fixation",
            "meaning": "Incorporation of inorganic CO2 carbon into an organic molecule."
          },
          {
            "term": "G3P",
            "meaning": "Three-carbon net output of the Calvin cycle that can supply carbohydrate synthesis."
          }
        ],
        "assumptions": [
          "The light-reaction example uses oxygenic photosynthesis with linear electron flow.",
          "Light removal predictions concern sustained output after existing carriers are depleted, not an instantaneous universal switch.",
          "Photosynthesis and mitochondrial respiration can occur within the same plant cell; plants do not exchange mitochondria for chloroplasts."
        ],
        "workedExample": {
          "prompt": "A chloroplast has light, water, CO2 and functioning machinery. Which stage releases O2, and which stage incorporates CO2 carbon?",
          "steps": [
            "Water oxidation in the light reactions supplies the released O2.",
            "Light reactions also supply ATP and NADPH.",
            "In the stroma, the Calvin cycle uses CO2, ATP and NADPH to produce net G3P."
          ],
          "answer": "The light reactions release water-derived O2; the Calvin cycle incorporates CO2 carbon into organic products.",
          "familyId": "bio-energy-light-versus-carbon",
          "role": "instruction-only"
        },
        "commonMistake": "Do not assign O2 production to CO2 fixation, and do not interpret light-independent as nighttime-only. Plants respire too.",
        "nextAction": "Name the compartment, identify the matter source, and separate ATP/NADPH production from their use.",
        "sourceUrls": [
          "https://openstax.org/books/biology-2e/pages/8-1-overview-of-photosynthesis",
          "https://openstax.org/books/biology-2e/pages/8-2-the-light-dependent-reactions-of-photosynthesis",
          "https://openstax.org/books/biology-2e/pages/8-3-using-light-energy-to-make-organic-molecules",
          "https://openstax.org/books/biology-2e/pages/7-4-oxidative-phosphorylation"
        ],
        "canon": {
          "id": "bio-photosynthesis",
          "version": "0.1.0",
          "sourceRelativePath": "visuals/sheets/bio/bio-photosynthesis.json",
          "sourceSha256": "a784a6c2793fd6c164e4c1e7a09f38851587fe013b6972c5b6e45ec763ccfeed",
          "sourceRepository": "ace-system",
          "inspectedExportSha256": "3d42da035491489dc2bb09610235de8499e8117e4b694b05b314b4e93bf304f7",
          "adaptationVersion": 1,
          "importsSourceAssessments": false,
          "formativeCanonChecksProgressEligible": false,
          "reviewScope": "Separate light reactions and carbon fixation, water-derived oxygen and plant respiration. G3P clarified as net Calvin product; C3/C4/CAM and source checks excluded."
        },
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      }
    },
    "items": [
      {
        "id": "continuation-bio-energy-carbon-electrons-p1",
        "objectiveId": "bio-energy-carbon-electrons",
        "world": "bio",
        "pool": "practice",
        "familyId": "bio-energy-carbon-route",
        "familyRationale": "Ordinary pathway carbon and compartment accounting; a changed molecule count is not a new family.",
        "prompt": "A eukaryotic cell has just completed glycolysis of one glucose. Before any pyruvate oxidation, where are the six glucose carbons in this pathway?",
        "choices": [
          "In two three-carbon pyruvates in the cytosol",
          "In six CO2 molecules released by glycolysis",
          "In one six-carbon NADH molecule made from glucose",
          "In O2 molecules entering the mitochondrial matrix"
        ],
        "answer": 0,
        "hint": "Track carbon-containing products; carriers and oxygen have different roles.",
        "explanation": "Glycolysis divides one six-carbon glucose into two three-carbon pyruvates in the cytosol without releasing CO2.",
        "feedback": [
          "Correct: two times three preserves all six carbons.",
          "CO2 is released at later oxidative stages, not by glycolysis.",
          "NAD+ accepts electrons; it is not built by packaging the six glucose carbons.",
          "O2 contains no carbon atoms."
        ],
        "sourceUrls": [
          "https://openstax.org/books/biology-2e/pages/7-1-energy-in-living-systems",
          "https://openstax.org/books/biology-2e/pages/7-2-glycolysis",
          "https://openstax.org/books/biology-2e/pages/7-3-oxidation-of-pyruvate-and-the-citric-acid-cycle",
          "https://openstax.org/books/biology-2e/pages/7-4-oxidative-phosphorylation",
          "https://openstax.org/books/biology-2e/pages/7-5-metabolism-without-oxygen"
        ],
        "canonId": "bio-cellular-respiration",
        "sourceId": "continuation-bio-energy-carbon-electrons-p1",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "continuation-bio-energy-carbon-electrons-p2",
        "objectiveId": "bio-energy-carbon-electrons",
        "world": "bio",
        "pool": "practice",
        "familyId": "bio-energy-electron-destination",
        "familyRationale": "Ordinary distinction between carbon products and terminal electron transfer; alternative wording stays in the same family.",
        "prompt": "NADH delivers electrons to the aerobic respiratory chain. Which event describes their eventual destination?",
        "choices": [
          "CO2 accepts them and becomes glucose in the mitochondrion.",
          "ATP synthase packs the electrons into newly created protons.",
          "O2 accepts electrons and is reduced to water.",
          "The electrons disappear after the first chain complex."
        ],
        "answer": 2,
        "hint": "At the terminal step, an acceptor receives electrons; electrons do not disappear.",
        "explanation": "At the aerobic chain end, O2 is reduced and water forms. Carbon oxidation to CO2 and reduction of O2 are distinct parts of respiration.",
        "feedback": [
          "This confuses mitochondrial respiration with photosynthetic carbon fixation.",
          "ATP synthase uses H+ movement; it does not manufacture protons from electrons.",
          "Correct: O2 is the terminal electron acceptor.",
          "Electrons are transferred between chemical species, not destroyed."
        ],
        "sourceUrls": [
          "https://openstax.org/books/biology-2e/pages/7-1-energy-in-living-systems",
          "https://openstax.org/books/biology-2e/pages/7-2-glycolysis",
          "https://openstax.org/books/biology-2e/pages/7-3-oxidation-of-pyruvate-and-the-citric-acid-cycle",
          "https://openstax.org/books/biology-2e/pages/7-4-oxidative-phosphorylation",
          "https://openstax.org/books/biology-2e/pages/7-5-metabolism-without-oxygen"
        ],
        "canonId": "bio-cellular-respiration",
        "sourceId": "continuation-bio-energy-carbon-electrons-p2",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "continuation-bio-energy-carbon-electrons-p3",
        "objectiveId": "bio-energy-carbon-electrons",
        "world": "bio",
        "pool": "practice",
        "familyId": "bio-energy-fermentation-recycling",
        "familyRationale": "Ordinary explanation of NAD+ regeneration and glycolytic ATP in named lactate fermentation.",
        "prompt": "A glucose-fed cell uses lactate fermentation when aerobic electron transfer cannot keep up. What is the immediate role of the pyruvate-to-lactate step?",
        "choices": [
          "Release the six glucose carbons as CO2",
          "Regenerate NAD+ by accepting electrons from NADH",
          "Pump H+ through the mitochondrial ETC",
          "Make the two net ATP of glycolysis inside the lactate step"
        ],
        "answer": 1,
        "hint": "Ask which carrier form glycolysis must recover.",
        "explanation": "Pyruvate is reduced to lactate while NADH is oxidized to NAD+. The recycled NAD+ supports glycolysis; ATP is produced in glycolysis rather than by the lactate-forming step.",
        "feedback": [
          "Lactate retains three carbons per molecule.",
          "Correct: this replenishes the oxidized carrier needed by glycolysis.",
          "Lactate fermentation does not use the respiratory ETC.",
          "The two net ATP belong to glycolysis, not conversion of pyruvate to lactate."
        ],
        "sourceUrls": [
          "https://openstax.org/books/biology-2e/pages/7-1-energy-in-living-systems",
          "https://openstax.org/books/biology-2e/pages/7-2-glycolysis",
          "https://openstax.org/books/biology-2e/pages/7-3-oxidation-of-pyruvate-and-the-citric-acid-cycle",
          "https://openstax.org/books/biology-2e/pages/7-4-oxidative-phosphorylation",
          "https://openstax.org/books/biology-2e/pages/7-5-metabolism-without-oxygen"
        ],
        "canonId": "bio-cellular-respiration",
        "sourceId": "continuation-bio-energy-carbon-electrons-p3",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "continuation-bio-energy-carbon-electrons-c1",
        "objectiveId": "bio-energy-carbon-electrons",
        "world": "bio",
        "pool": "check",
        "familyId": "bio-energy-carbon-route",
        "familyRationale": "Ordinary pathway carbon and compartment accounting; a changed molecule count is not a new family.",
        "prompt": "Which location-and-product pairing fits conventional aerobic glucose breakdown in a eukaryotic cell?",
        "choices": [
          "Glycolysis in the matrix releases CO2.",
          "The citric acid cycle in the cytosol produces O2.",
          "The ETC in the stroma fixes CO2.",
          "Pyruvate oxidation in the matrix releases CO2."
        ],
        "answer": 3,
        "hint": "Separate cytosol, mitochondrial matrix and chloroplast stroma.",
        "explanation": "Pyruvate oxidation occurs in the mitochondrial matrix and releases CO2 while producing acetyl-CoA and NADH.",
        "feedback": [
          "Glycolysis is cytosolic and does not release CO2.",
          "The eukaryotic cycle is in the matrix and does not produce O2.",
          "The stroma is a chloroplast compartment; a respiratory ETC does not fix CO2.",
          "Correct: both compartment and carbon product fit."
        ],
        "sourceUrls": [
          "https://openstax.org/books/biology-2e/pages/7-1-energy-in-living-systems",
          "https://openstax.org/books/biology-2e/pages/7-2-glycolysis",
          "https://openstax.org/books/biology-2e/pages/7-3-oxidation-of-pyruvate-and-the-citric-acid-cycle",
          "https://openstax.org/books/biology-2e/pages/7-4-oxidative-phosphorylation",
          "https://openstax.org/books/biology-2e/pages/7-5-metabolism-without-oxygen"
        ],
        "canonId": "bio-cellular-respiration",
        "sourceId": "continuation-bio-energy-carbon-electrons-c1",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "continuation-bio-energy-carbon-electrons-c2",
        "objectiveId": "bio-energy-carbon-electrons",
        "world": "bio",
        "pool": "check",
        "familyId": "bio-energy-electron-destination",
        "familyRationale": "Ordinary distinction between carbon products and terminal electron transfer; alternative wording stays in the same family.",
        "prompt": "Team Entropy claims that the citric acid cycle directly consumes O2 because stopping aerobic electron transfer eventually slows the cycle. What is the best correction?",
        "choices": [
          "O2 receives electrons at the chain end; reduced carriers accumulating can indirectly limit upstream oxidation.",
          "The cycle directly converts O2 into CO2; the claim is correct.",
          "O2 is directly consumed by every reaction that makes ATP.",
          "The respiratory chain never affects the availability of oxidized carriers."
        ],
        "answer": 0,
        "hint": "An indirect dependency is not the same as direct use as a reactant.",
        "explanation": "The chain consumes O2 and reoxidizes reduced carriers. When reoxidation fails, the supply of oxidized carriers can constrain earlier oxidative steps without making O2 a direct reactant in those steps.",
        "feedback": [
          "Correct: this separates the direct reaction from the pathway dependency.",
          "CO2 carbon comes from carbon-containing substrates, not O2.",
          "Substrate-level phosphorylation does not directly require O2.",
          "Carrier recycling links the chain to upstream oxidative metabolism."
        ],
        "sourceUrls": [
          "https://openstax.org/books/biology-2e/pages/7-1-energy-in-living-systems",
          "https://openstax.org/books/biology-2e/pages/7-2-glycolysis",
          "https://openstax.org/books/biology-2e/pages/7-3-oxidation-of-pyruvate-and-the-citric-acid-cycle",
          "https://openstax.org/books/biology-2e/pages/7-4-oxidative-phosphorylation",
          "https://openstax.org/books/biology-2e/pages/7-5-metabolism-without-oxygen"
        ],
        "canonId": "bio-cellular-respiration",
        "sourceId": "continuation-bio-energy-carbon-electrons-c2",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "continuation-bio-energy-carbon-electrons-c3",
        "objectiveId": "bio-energy-carbon-electrons",
        "world": "bio",
        "pool": "check",
        "familyId": "bio-energy-fermentation-recycling",
        "familyRationale": "Ordinary explanation of NAD+ regeneration and glycolytic ATP in named lactate fermentation.",
        "prompt": "In the standard glycolysis-to-lactate pathway, which statement accounts for continued ATP production when the respiratory chain is unavailable?",
        "choices": [
          "Lactate fermentation replaces glycolysis and makes all its ATP.",
          "NADH can accumulate indefinitely without limiting glycolysis.",
          "NAD+ is recycled, allowing glycolytic substrate-level phosphorylation to continue.",
          "Lactate fermentation restores O2 as the terminal respiratory acceptor."
        ],
        "answer": 2,
        "hint": "Separate the ATP-forming reaction from the carrier-recycling reaction.",
        "explanation": "Fermentation restores NAD+; glycolysis uses that carrier and makes ATP by direct substrate-level phosphate transfer. Lactate production itself is not oxidative phosphorylation.",
        "feedback": [
          "Glycolysis still supplies the ATP-forming steps.",
          "A finite carrier pool cannot supply NAD+ indefinitely if all becomes NADH.",
          "Correct: recycling supports the ATP-producing pathway.",
          "The pyruvate-to-lactate step does not generate O2."
        ],
        "sourceUrls": [
          "https://openstax.org/books/biology-2e/pages/7-1-energy-in-living-systems",
          "https://openstax.org/books/biology-2e/pages/7-2-glycolysis",
          "https://openstax.org/books/biology-2e/pages/7-3-oxidation-of-pyruvate-and-the-citric-acid-cycle",
          "https://openstax.org/books/biology-2e/pages/7-4-oxidative-phosphorylation",
          "https://openstax.org/books/biology-2e/pages/7-5-metabolism-without-oxygen"
        ],
        "canonId": "bio-cellular-respiration",
        "sourceId": "continuation-bio-energy-carbon-electrons-c3",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "continuation-bio-energy-carbon-electrons-l1",
        "objectiveId": "bio-energy-carbon-electrons",
        "world": "bio",
        "pool": "later",
        "familyId": "bio-energy-cofactor-rescue-experiment",
        "familyRationale": "Reserved transfer: evaluate a selective, controlled NAD+ regeneration rescue experiment and distinguish causal support from the stronger claim that fermentation directly creates ATP. The hypothetical bypass and comparison groups are supplied only here, not in guided or worked tasks.",
        "prompt": "In an oxygen-free cell extract, glycolysis slows after NAD+ becomes depleted. A control receives an inactive enzyme. A second sample receives a hypothetical enzyme that transfers electrons from NADH to an added acceptor, regenerating NAD+ without making ATP. All other substrates remain available; both samples lack a working ETC. Glycolytic ATP production resumes only in the second sample. Which inference is supported?",
        "choices": [
          "The new enzyme must directly phosphorylate ADP.",
          "Restoring NAD+ can rescue glycolytic ATP production without restoring oxidative phosphorylation.",
          "The new acceptor must contain oxygen gas.",
          "The experiment shows NAD+ is unnecessary for glycolysis."
        ],
        "answer": 1,
        "hint": "Use the stated selective action of the enzyme and the inactive control.",
        "explanation": "The only specified new function is NAD+ regeneration. Its rescue of glycolytic ATP supports a carrier-recycling bottleneck; the experiment does not give the bypass enzyme an ATP-producing or respiratory role.",
        "feedback": [
          "Direct ATP production is explicitly excluded for this enzyme.",
          "Correct: restored carrier availability explains the rescue while the ETC remains absent.",
          "The supplied acceptor need not be O2; the setup is oxygen-free.",
          "Rescue by replenishing NAD+ supports its importance."
        ],
        "sourceUrls": [
          "https://openstax.org/books/biology-2e/pages/7-1-energy-in-living-systems",
          "https://openstax.org/books/biology-2e/pages/7-2-glycolysis",
          "https://openstax.org/books/biology-2e/pages/7-3-oxidation-of-pyruvate-and-the-citric-acid-cycle",
          "https://openstax.org/books/biology-2e/pages/7-4-oxidative-phosphorylation",
          "https://openstax.org/books/biology-2e/pages/7-5-metabolism-without-oxygen"
        ],
        "canonId": "bio-cellular-respiration",
        "sourceId": "continuation-bio-energy-carbon-electrons-l1",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "continuation-bio-energy-carbon-electrons-l2",
        "objectiveId": "bio-energy-carbon-electrons",
        "world": "bio",
        "pool": "later",
        "familyId": "bio-energy-cofactor-rescue-experiment",
        "familyRationale": "Reserved transfer: evaluate a selective, controlled NAD+ regeneration rescue experiment and distinguish causal support from the stronger claim that fermentation directly creates ATP. The hypothetical bypass and comparison groups are supplied only here, not in guided or worked tasks.",
        "prompt": "Two oxygen-free extracts contain the same glucose, glycolytic enzymes and finite NAD+/NADH pool. Both have lost the lactate-forming enzyme. Only sample R receives a hypothetical ATP-neutral bypass that oxidizes NADH to NAD+ using an abundant supplied organic acceptor. Sample S receives an inactive bypass. No other NAD+ recycling is available. What sustained result best tests the proposed carrier-recycling role?",
        "choices": [
          "Both must sustain equal glycolysis because the initial glucose is equal.",
          "Only S sustains glycolysis because NADH is the required oxidized carrier.",
          "R makes ATP only in the bypass; glycolysis remains stopped.",
          "R can sustain glycolytic ATP formation longer; S becomes limited as NAD+ is depleted."
        ],
        "answer": 3,
        "hint": "The critical difference is the ability to recycle a finite carrier pool.",
        "explanation": "R has a route to restore NAD+ without making ATP in the bypass. S lacks regeneration, so once oxidized carrier is depleted its glycolysis becomes limited despite glucose availability.",
        "feedback": [
          "Equal glucose does not remove the NAD+ bottleneck.",
          "NAD+ is the oxidized form required here; S lacks its recycling route.",
          "The bypass is specified to be ATP-neutral.",
          "Correct: this prediction distinguishes cofactor recycling from direct bypass ATP production."
        ],
        "sourceUrls": [
          "https://openstax.org/books/biology-2e/pages/7-1-energy-in-living-systems",
          "https://openstax.org/books/biology-2e/pages/7-2-glycolysis",
          "https://openstax.org/books/biology-2e/pages/7-3-oxidation-of-pyruvate-and-the-citric-acid-cycle",
          "https://openstax.org/books/biology-2e/pages/7-4-oxidative-phosphorylation",
          "https://openstax.org/books/biology-2e/pages/7-5-metabolism-without-oxygen"
        ],
        "canonId": "bio-cellular-respiration",
        "sourceId": "continuation-bio-energy-carbon-electrons-l2",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "continuation-bio-energy-chemiosmosis-p1",
        "objectiveId": "bio-energy-chemiosmosis",
        "world": "bio",
        "pool": "practice",
        "familyId": "bio-energy-gradient-direction",
        "familyRationale": "Ordinary identification of proton pumping and ATP synthase return routes in a mitochondrion.",
        "prompt": "In a coupled respiring mitochondrion, which route links electron-driven pumping to ATP synthesis?",
        "choices": [
          "Pump H+ into the matrix; send it through ATP synthase into the cytosol.",
          "Pump electrons into the intermembrane space; turn them directly into ATP.",
          "Pump H+ from matrix to intermembrane space; return H+ through ATP synthase to matrix.",
          "Move ATP through the membrane to create new H+ atoms."
        ],
        "answer": 2,
        "hint": "Name both compartments and keep electrons distinct from protons.",
        "explanation": "The chain supplies energy for outward H+ pumping. Downhill H+ return through ATP synthase supports ATP production on the matrix side.",
        "feedback": [
          "This reverses pumping and misplaces the return compartment.",
          "The transported particles in the gradient are H+, not stored electrons converted to ATP.",
          "Correct: uphill pumping and downhill return are separate routes.",
          "ATP movement does not create protons."
        ],
        "sourceUrls": [
          "https://openstax.org/books/biology-2e/pages/7-1-energy-in-living-systems",
          "https://openstax.org/books/biology-2e/pages/7-4-oxidative-phosphorylation"
        ],
        "canonId": "bio-etc-gradient",
        "sourceId": "continuation-bio-energy-chemiosmosis-p1",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "continuation-bio-energy-chemiosmosis-p2",
        "objectiveId": "bio-energy-chemiosmosis",
        "world": "bio",
        "pool": "practice",
        "familyId": "bio-energy-block-versus-leak",
        "familyRationale": "Ordinary forward prediction after a named block or leak under explicit respiratory assumptions.",
        "prompt": "An intact respiratory ETC has ample fuel and O2. A new H+ leak bypasses ATP synthase. After adjustment but before other limitations develop, which combination is expected?",
        "choices": [
          "Stronger gradient and more ATP per electron pair",
          "Weaker coupling and lower ATP yield even though electron transfer can continue",
          "ATP formation increases because every leaked H+ passes through ATP synthase",
          "Electron transfer must stop because the leak removes all O2"
        ],
        "answer": 1,
        "hint": "A bypass lets protons return without driving the ATP-forming machine.",
        "explanation": "Leakage dissipates the gradient and reduces ATP made per electron transfer. With intact chain and supplies, respiration can continue or increase rather than being obligatorily blocked.",
        "feedback": [
          "A leak dissipates rather than strengthens stored gradient energy.",
          "Correct: electron transfer and ATP formation can become uncoupled.",
          "The prompt specifies a route bypassing ATP synthase.",
          "A proton leak does not directly remove the oxygen supply."
        ],
        "sourceUrls": [
          "https://openstax.org/books/biology-2e/pages/7-1-energy-in-living-systems",
          "https://openstax.org/books/biology-2e/pages/7-4-oxidative-phosphorylation"
        ],
        "canonId": "bio-etc-gradient",
        "sourceId": "continuation-bio-energy-chemiosmosis-p2",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "continuation-bio-energy-chemiosmosis-p3",
        "objectiveId": "bio-energy-chemiosmosis",
        "world": "bio",
        "pool": "practice",
        "familyId": "bio-energy-gradient-direction",
        "familyRationale": "Ordinary identification of proton pumping and ATP synthase return routes in a mitochondrion.",
        "prompt": "A respiring mitochondrion has accumulated more H+ in its intermembrane space than in its matrix. Which comparison follows for the concentration component of the gradient?",
        "choices": [
          "Intermembrane space has lower pH than the matrix.",
          "Intermembrane space has higher pH than the matrix.",
          "Both compartments must have identical pH because a membrane lies between them.",
          "pH describes ATP concentration and cannot reflect H+."
        ],
        "answer": 0,
        "hint": "Higher H+ concentration means lower pH.",
        "explanation": "The intermembrane space has relatively higher H+ and therefore lower pH. The complete electrochemical driving force also includes electrical potential.",
        "feedback": [
          "Correct: pH and H+ concentration change in opposite directions.",
          "This reverses the relation between H+ concentration and pH.",
          "The separating membrane permits a difference to be maintained.",
          "pH reflects hydrogen-ion activity, not ATP concentration."
        ],
        "sourceUrls": [
          "https://openstax.org/books/biology-2e/pages/7-1-energy-in-living-systems",
          "https://openstax.org/books/biology-2e/pages/7-4-oxidative-phosphorylation"
        ],
        "canonId": "bio-etc-gradient",
        "sourceId": "continuation-bio-energy-chemiosmosis-p3",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "continuation-bio-energy-chemiosmosis-c1",
        "objectiveId": "bio-energy-chemiosmosis",
        "world": "bio",
        "pool": "check",
        "familyId": "bio-energy-block-versus-leak",
        "familyRationale": "Ordinary forward prediction after a named block or leak under explicit respiratory assumptions.",
        "prompt": "An ATP synthase inhibitor is added to a coupled mitochondrion. The inner membrane stays tight and the ETC is initially intact. Which explanation accounts for a subsequent fall in O2 use?",
        "choices": [
          "The inhibitor converts O2 into glucose.",
          "H+ instantly vanishes from both compartments.",
          "The synthase block is necessarily a direct block of every ETC complex.",
          "Restricted H+ return increases opposing gradient pressure, slowing further pumping and electron flow."
        ],
        "answer": 3,
        "hint": "Consider what happens to the pump when its usual return route is closed.",
        "explanation": "Initial pumping can build the gradient while ATP synthase cannot use it. That opposing force slows the respiratory chain and its O2 consumption.",
        "feedback": [
          "The intervention does not fix carbon or make glucose.",
          "A closed return route does not instantly eliminate the gradient.",
          "Indirect slowing does not require direct inhibition of all ETC components.",
          "Correct: this explains respiratory backpressure under the stated conditions."
        ],
        "sourceUrls": [
          "https://openstax.org/books/biology-2e/pages/7-1-energy-in-living-systems",
          "https://openstax.org/books/biology-2e/pages/7-4-oxidative-phosphorylation"
        ],
        "canonId": "bio-etc-gradient",
        "sourceId": "continuation-bio-energy-chemiosmosis-c1",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "continuation-bio-energy-chemiosmosis-c2",
        "objectiveId": "bio-energy-chemiosmosis",
        "world": "bio",
        "pool": "check",
        "familyId": "bio-energy-block-versus-leak",
        "familyRationale": "Ordinary forward prediction after a named block or leak under explicit respiratory assumptions.",
        "prompt": "A drug stops terminal electron transfer to O2 but does not directly inhibit ATP synthase. Existing H+ gradients are allowed to dissipate and no other gradient source is supplied. What follows?",
        "choices": [
          "ATP synthase keeps producing ATP indefinitely because its protein remains present.",
          "Continued oxidative ATP formation cannot be sustained once the gradient is lost.",
          "The ETC pumps faster because terminal transfer is impossible.",
          "ADP turns into ATP without any energy source after O2 transfer stops."
        ],
        "answer": 1,
        "hint": "An intact machine still requires its driving force.",
        "explanation": "Blocked terminal electron transfer prevents sustained electron-driven pumping. ATP synthase may use a pre-existing gradient briefly, but cannot sustain synthesis after that driving force dissipates.",
        "feedback": [
          "Protein presence alone does not supply energy.",
          "Correct: temporary use of stored gradient differs from sustained ATP production.",
          "A terminal block obstructs, rather than accelerates, continued flow.",
          "ATP formation requires an energy input."
        ],
        "sourceUrls": [
          "https://openstax.org/books/biology-2e/pages/7-1-energy-in-living-systems",
          "https://openstax.org/books/biology-2e/pages/7-4-oxidative-phosphorylation"
        ],
        "canonId": "bio-etc-gradient",
        "sourceId": "continuation-bio-energy-chemiosmosis-c2",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "continuation-bio-energy-chemiosmosis-c3",
        "objectiveId": "bio-energy-chemiosmosis",
        "world": "bio",
        "pool": "check",
        "familyId": "bio-energy-block-versus-leak",
        "familyRationale": "Ordinary forward prediction after a named block or leak under explicit respiratory assumptions.",
        "prompt": "Two otherwise matched respiring mitochondrial samples have ample substrates. Sample L gains a proton leak around ATP synthase; sample B has ATP synthase blocked with the membrane otherwise tight. After initial adjustment, which comparison best fits these interventions?",
        "choices": [
          "Both interventions must cause the same gradient and O2-use response.",
          "L stores a stronger gradient, whereas B necessarily loses all compartment separation.",
          "L dissipates gradient energy; B tends to build opposing gradient pressure that slows electron transfer.",
          "Only B loses ATP yield; leakage through L must increase ATP yield."
        ],
        "answer": 2,
        "hint": "Both can lower ATP output, but compare their proton-return routes.",
        "explanation": "L supplies a bypass that dissipates gradient energy. B closes the ATP-synthase route while maintaining a tight membrane, so pumping faces growing opposition.",
        "feedback": [
          "Similar ATP loss does not imply identical coupling or gradient effects.",
          "The leak dissipates energy; a synthase block does not remove the membrane.",
          "Correct: different H+ routes explain the differing responses.",
          "L loses coupling, so fewer ATP are made per electron transfer."
        ],
        "sourceUrls": [
          "https://openstax.org/books/biology-2e/pages/7-1-energy-in-living-systems",
          "https://openstax.org/books/biology-2e/pages/7-4-oxidative-phosphorylation"
        ],
        "canonId": "bio-etc-gradient",
        "sourceId": "continuation-bio-energy-chemiosmosis-c3",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "continuation-bio-energy-chemiosmosis-l1",
        "objectiveId": "bio-energy-chemiosmosis",
        "world": "bio",
        "pool": "later",
        "familyId": "bio-energy-artificial-gradient-sufficiency",
        "familyRationale": "Reserved transfer: reason about sufficiency of an experimentally imposed gradient in an artificial membrane with no ETC, using orientation and component controls. Ordinary teaching predicts changes within intact respiratory machinery; this asks which machinery is necessary for the bounded ATP-forming event.",
        "prompt": "An artificial membrane vesicle contains correctly oriented ATP synthase but no ETC. Experimenters impose an inward driving electrochemical H+ gradient, supply ADP and phosphate on the ATP-producing side, and then remove the external gradient-maintaining apparatus. Which result is consistent with chemiosmosis?",
        "choices": [
          "Some ATP can form as the imposed gradient dissipates, but synthesis cannot continue indefinitely without restoring the gradient.",
          "No ATP can ever form because the membrane lacks an ETC.",
          "ATP forms indefinitely because ATP synthase creates its own gradient without energy.",
          "Only electrons crossing ATP synthase can make ATP in this vesicle."
        ],
        "answer": 0,
        "hint": "Distinguish the source that built the gradient from the enzyme that can use it.",
        "explanation": "A pre-established gradient can temporarily drive correctly oriented ATP synthase without an ETC in the vesicle. Once that finite driving force dissipates, an ongoing energy source would be needed to sustain synthesis.",
        "feedback": [
          "Correct: the apparatus supplies stored energy temporarily, not perpetual ATP production.",
          "The ETC is one way to create the gradient; the prompt supplies another way.",
          "ATP synthase cannot provide unlimited energy from nothing.",
          "The stated driving particles are H+, not electrons."
        ],
        "sourceUrls": [
          "https://openstax.org/books/biology-2e/pages/7-1-energy-in-living-systems",
          "https://openstax.org/books/biology-2e/pages/7-4-oxidative-phosphorylation"
        ],
        "canonId": "bio-etc-gradient",
        "sourceId": "continuation-bio-energy-chemiosmosis-l1",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "continuation-bio-energy-chemiosmosis-l2",
        "objectiveId": "bio-energy-chemiosmosis",
        "world": "bio",
        "pool": "later",
        "familyId": "bio-energy-artificial-gradient-sufficiency",
        "familyRationale": "Reserved transfer: reason about sufficiency of an experimentally imposed gradient in an artificial membrane with no ETC, using orientation and component controls. Ordinary teaching predicts changes within intact respiratory machinery; this asks which machinery is necessary for the bounded ATP-forming event.",
        "prompt": "A vesicle experiment tests ATP formation without any ETC. All samples contain ADP and phosphate on the stated product side. A has intact ATP synthase and an imposed H+ gradient oriented to drive its ATP-forming direction. B has the same gradient but inactive synthase. C has intact synthase but equal electrical potential and H+ activity on both sides. Which comparison most directly supports gradient-driven ATP synthesis?",
        "choices": [
          "B alone forms ATP because a gradient replaces the enzyme.",
          "C forms unlimited ATP because concentration equality provides maximum drive.",
          "A and B must form equal ATP because only H+ amount matters.",
          "Transient ATP formation in A, with little or none in B and C."
        ],
        "answer": 3,
        "hint": "Use both controls: one removes the catalyst, the other removes the driving force.",
        "explanation": "A has both the specified driving force and functional synthase. B tests enzyme dependence; C tests electrochemical-gradient dependence. Neither control has both required elements in this setup.",
        "feedback": [
          "A stored gradient cannot replace the required ATP-forming machinery.",
          "Both components of the driving force are absent in C.",
          "The active enzyme distinguishes A from B.",
          "Correct: two selective controls support the proposed coupling mechanism."
        ],
        "sourceUrls": [
          "https://openstax.org/books/biology-2e/pages/7-1-energy-in-living-systems",
          "https://openstax.org/books/biology-2e/pages/7-4-oxidative-phosphorylation"
        ],
        "canonId": "bio-etc-gradient",
        "sourceId": "continuation-bio-energy-chemiosmosis-l2",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "continuation-bio-energy-light-carbon-p1",
        "objectiveId": "bio-energy-light-carbon",
        "world": "bio",
        "pool": "practice",
        "familyId": "bio-energy-light-versus-carbon",
        "familyRationale": "Ordinary assignment of light-reaction and Calvin-cycle inputs, outputs and locations.",
        "prompt": "A chloroplast releases O2 during oxygenic photosynthesis. Which input supplied the oxygen atoms in that released O2?",
        "choices": [
          "The carbon atoms of glucose",
          "The phosphate group of ATP",
          "Water oxidized during the light reactions",
          "CO2 fixed by the Calvin cycle"
        ],
        "answer": 2,
        "hint": "Separate the origin of released oxygen from the origin of carbohydrate carbon.",
        "explanation": "Water oxidation supplies the released O2. CO2 supplies carbon incorporated into organic molecules by carbon fixation.",
        "feedback": [
          "Carbon atoms do not become oxygen atoms in photosynthesis.",
          "ATP is an energy-transfer molecule, not the source of this O2.",
          "Correct: water is the oxygen source in the light reactions.",
          "CO2 fixation does not release the photosynthetic O2."
        ],
        "sourceUrls": [
          "https://openstax.org/books/biology-2e/pages/8-1-overview-of-photosynthesis",
          "https://openstax.org/books/biology-2e/pages/8-2-the-light-dependent-reactions-of-photosynthesis",
          "https://openstax.org/books/biology-2e/pages/8-3-using-light-energy-to-make-organic-molecules",
          "https://openstax.org/books/biology-2e/pages/7-4-oxidative-phosphorylation"
        ],
        "canonId": "bio-photosynthesis",
        "sourceId": "continuation-bio-energy-light-carbon-p1",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "continuation-bio-energy-light-carbon-p2",
        "objectiveId": "bio-energy-light-carbon",
        "world": "bio",
        "pool": "practice",
        "familyId": "bio-energy-light-versus-carbon",
        "familyRationale": "Ordinary assignment of light-reaction and Calvin-cycle inputs, outputs and locations.",
        "prompt": "Which pairing correctly separates the two major photosynthetic stages?",
        "choices": [
          "Light reactions on thylakoid membranes supply ATP/NADPH; the stromal Calvin cycle uses them to build net organic product from CO2.",
          "The Calvin cycle supplies O2 to light reactions, which fix CO2 in the cytosol.",
          "Light reactions make only CO2; the Calvin cycle splits water.",
          "Both stages directly absorb photons and release O2 from CO2."
        ],
        "answer": 0,
        "hint": "Identify where energy carriers are supplied and where they are spent.",
        "explanation": "The light reactions supply ATP and NADPH. The stromal Calvin cycle uses those resources and CO2 to produce net G3P for carbohydrate synthesis.",
        "feedback": [
          "Correct: compartment and direction of resource flow agree.",
          "This reverses oxygen production and carbon fixation and places them outside their chloroplast compartments.",
          "Light reactions oxidize water; carbon fixation uses CO2.",
          "The carbon-fixation steps do not directly absorb photons or release O2."
        ],
        "sourceUrls": [
          "https://openstax.org/books/biology-2e/pages/8-1-overview-of-photosynthesis",
          "https://openstax.org/books/biology-2e/pages/8-2-the-light-dependent-reactions-of-photosynthesis",
          "https://openstax.org/books/biology-2e/pages/8-3-using-light-energy-to-make-organic-molecules",
          "https://openstax.org/books/biology-2e/pages/7-4-oxidative-phosphorylation"
        ],
        "canonId": "bio-photosynthesis",
        "sourceId": "continuation-bio-energy-light-carbon-p2",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "continuation-bio-energy-light-carbon-p3",
        "objectiveId": "bio-energy-light-carbon",
        "world": "bio",
        "pool": "practice",
        "familyId": "bio-energy-light-versus-carbon",
        "familyRationale": "Ordinary assignment of light-reaction and Calvin-cycle inputs, outputs and locations.",
        "prompt": "The light reactions supply ATP and NADPH to the stroma. Which pairing describes their roles in the Calvin cycle?",
        "choices": [
          "ATP supplies the carbon atoms; NADPH becomes released O2.",
          "ATP supplies usable energy; NADPH supplies reducing electrons.",
          "ATP accepts CO2 directly; NADPH is the thylakoid membrane.",
          "ATP and NADPH both replace CO2 as the source of carbohydrate carbon."
        ],
        "answer": 1,
        "hint": "Separate the carbon source, the energy source and the electron donor.",
        "explanation": "ATP supplies energy for the cycle’s reactions, while NADPH supplies electrons that reduce carbon-containing intermediates. CO2 supplies the carbon incorporated into the net organic product.",
        "feedback": [
          "CO2 supplies the carbon; released photosynthetic O2 derives from water.",
          "Correct: ATP and NADPH support different requirements of carbon fixation.",
          "Carbon fixation is catalyzed by enzymes; NADPH is a carrier, not a membrane.",
          "Neither carrier replaces the need to incorporate carbon from CO2."
        ],
        "sourceUrls": [
          "https://openstax.org/books/biology-2e/pages/8-1-overview-of-photosynthesis",
          "https://openstax.org/books/biology-2e/pages/8-2-the-light-dependent-reactions-of-photosynthesis",
          "https://openstax.org/books/biology-2e/pages/8-3-using-light-energy-to-make-organic-molecules",
          "https://openstax.org/books/biology-2e/pages/7-4-oxidative-phosphorylation"
        ],
        "canonId": "bio-photosynthesis",
        "sourceId": "continuation-bio-energy-light-carbon-p3",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "continuation-bio-energy-light-carbon-c1",
        "objectiveId": "bio-energy-light-carbon",
        "world": "bio",
        "pool": "check",
        "familyId": "bio-energy-light-versus-carbon",
        "familyRationale": "Ordinary assignment of light-reaction and Calvin-cycle inputs, outputs and locations.",
        "prompt": "Which description correctly links the thylakoid proton gradient to chloroplast ATP production?",
        "choices": [
          "H+ accumulates in the stroma and exits to the cytosol through a mitochondrial enzyme.",
          "Electrons accumulate in the lumen and are converted into phosphate atoms.",
          "The Calvin cycle pumps all H+ into the mitochondrial matrix.",
          "H+ accumulates in the lumen and returns through ATP synthase to the stroma."
        ],
        "answer": 3,
        "hint": "Name the space enclosed by a thylakoid membrane.",
        "explanation": "During light reactions the lumen accumulates H+. Its return through ATP synthase to the stroma supplies energy for ATP formation.",
        "feedback": [
          "This confuses chloroplast and mitochondrial compartments and reverses the relevant route.",
          "Electrons are not converted into phosphate atoms.",
          "The Calvin cycle is not the mitochondrial proton pump.",
          "Correct: lumen-to-stroma return is the ATP-synthase direction here."
        ],
        "sourceUrls": [
          "https://openstax.org/books/biology-2e/pages/8-1-overview-of-photosynthesis",
          "https://openstax.org/books/biology-2e/pages/8-2-the-light-dependent-reactions-of-photosynthesis",
          "https://openstax.org/books/biology-2e/pages/8-3-using-light-energy-to-make-organic-molecules",
          "https://openstax.org/books/biology-2e/pages/7-4-oxidative-phosphorylation"
        ],
        "canonId": "bio-photosynthesis",
        "sourceId": "continuation-bio-energy-light-carbon-c1",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "continuation-bio-energy-light-carbon-c2",
        "objectiveId": "bio-energy-light-carbon",
        "world": "bio",
        "pool": "check",
        "familyId": "bio-energy-light-versus-carbon",
        "familyRationale": "Ordinary assignment of light-reaction and Calvin-cycle inputs, outputs and locations.",
        "prompt": "After a chloroplast is darkened, its usable ATP and NADPH supplies become depleted and no alternative supply is provided. What is the best interpretation of “light-independent” Calvin-cycle reactions?",
        "choices": [
          "They must accelerate in the dark regardless of carrier supply.",
          "They do not directly absorb photons, but sustained carbon reduction still depends on energy and reducing-power supplies.",
          "They release O2 from CO2 without any energy input.",
          "They are the same reactions as mitochondrial glucose oxidation."
        ],
        "answer": 1,
        "hint": "No direct photon requirement does not remove the ATP and NADPH requirements.",
        "explanation": "The term describes a lack of direct light absorption in those reactions. Carbon reduction requires ATP and NADPH, so sustained output cannot continue under the stated depletion conditions; enzyme regulation can also matter.",
        "feedback": [
          "Darkness does not remove the resource requirements.",
          "Correct: direct light dependence and indirect resource dependence are different.",
          "The cycle does not make photosynthetic O2 by splitting CO2.",
          "Carbon fixation and respiratory oxidation have different inputs and functions."
        ],
        "sourceUrls": [
          "https://openstax.org/books/biology-2e/pages/8-1-overview-of-photosynthesis",
          "https://openstax.org/books/biology-2e/pages/8-2-the-light-dependent-reactions-of-photosynthesis",
          "https://openstax.org/books/biology-2e/pages/8-3-using-light-energy-to-make-organic-molecules",
          "https://openstax.org/books/biology-2e/pages/7-4-oxidative-phosphorylation"
        ],
        "canonId": "bio-photosynthesis",
        "sourceId": "continuation-bio-energy-light-carbon-c2",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "continuation-bio-energy-light-carbon-c3",
        "objectiveId": "bio-energy-light-carbon",
        "world": "bio",
        "pool": "check",
        "familyId": "bio-energy-plant-respiration",
        "familyRationale": "Ordinary recognition that plant respiration and photosynthesis can operate simultaneously in daylight.",
        "prompt": "A leaf is photosynthesizing in daylight. Which statement about its mitochondria is justified?",
        "choices": [
          "Respiration must stop whenever a chloroplast receives light.",
          "Mitochondria change into thylakoids during daylight.",
          "Respiration can operate alongside photosynthesis when substrates and conditions permit.",
          "The Calvin cycle replaces every ATP-requiring process in the leaf."
        ],
        "answer": 2,
        "hint": "A photosynthetic cell can operate more than one metabolic pathway.",
        "explanation": "Plants can use mitochondrial respiration alongside photosynthesis in daylight. Photosynthesis supplies reduced carbon, while respiration can oxidize available fuel to support cellular ATP needs.",
        "feedback": [
          "Light does not universally switch off mitochondrial respiration.",
          "These are distinct organelles; daylight does not transform one into the other.",
          "Correct: simultaneous operation is compatible with plant metabolism.",
          "The Calvin cycle itself consumes ATP and does not replace cellular work."
        ],
        "sourceUrls": [
          "https://openstax.org/books/biology-2e/pages/8-1-overview-of-photosynthesis",
          "https://openstax.org/books/biology-2e/pages/8-2-the-light-dependent-reactions-of-photosynthesis",
          "https://openstax.org/books/biology-2e/pages/8-3-using-light-energy-to-make-organic-molecules",
          "https://openstax.org/books/biology-2e/pages/7-4-oxidative-phosphorylation"
        ],
        "canonId": "bio-photosynthesis",
        "sourceId": "continuation-bio-energy-light-carbon-c3",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "continuation-bio-energy-light-carbon-l1",
        "objectiveId": "bio-energy-light-carbon",
        "world": "bio",
        "pool": "later",
        "familyId": "bio-energy-simultaneous-gas-flux",
        "familyRationale": "Reserved transfer: reconcile simultaneous gross photosynthesis and respiration with a net gas measurement using supplied units and rates. Ordinary teaching assigns pathway roles; it never computes a shared chamber balance.",
        "prompt": "A sealed leaf chamber has only two O2-changing processes during a short interval. Gross photosynthesis releases 11 units of O2 per minute; mitochondrial respiration consumes 4 units per minute. Use net chamber O2 change = released − consumed. If the measured net increase is 7 units per minute, which interpretation is supported?",
        "choices": [
          "Respiration stopped, because chamber O2 increased.",
          "Photosynthesis released only 7 units and respiration consumed none.",
          "The data are impossible because plants cannot consume O2 in light.",
          "Both processes operated; their opposite fluxes produced the measured net increase."
        ],
        "answer": 3,
        "hint": "A net measurement combines opposing gross rates.",
        "explanation": "The chamber balance is 11 − 4 = 7. A positive net O2 change does not mean respiration is absent; photosynthetic release exceeded simultaneous respiratory consumption.",
        "feedback": [
          "A positive net change can conceal ongoing consumption.",
          "The supplied gross release is 11; subtracting respiration gives the measured 7.",
          "Plants can respire in daylight.",
          "Correct: both the arithmetic and simultaneous pathway roles fit."
        ],
        "sourceUrls": [
          "https://openstax.org/books/biology-2e/pages/8-1-overview-of-photosynthesis",
          "https://openstax.org/books/biology-2e/pages/8-2-the-light-dependent-reactions-of-photosynthesis",
          "https://openstax.org/books/biology-2e/pages/8-3-using-light-energy-to-make-organic-molecules",
          "https://openstax.org/books/biology-2e/pages/7-4-oxidative-phosphorylation"
        ],
        "canonId": "bio-photosynthesis",
        "sourceId": "continuation-bio-energy-light-carbon-l1",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "continuation-bio-energy-light-carbon-l2",
        "objectiveId": "bio-energy-light-carbon",
        "world": "bio",
        "pool": "later",
        "familyId": "bio-energy-simultaneous-gas-flux",
        "familyRationale": "Reserved transfer: reconcile simultaneous gross photosynthesis and respiration with a net gas measurement using supplied units and rates. Ordinary teaching assigns pathway roles; it never computes a shared chamber balance.",
        "prompt": "Only photosynthesis and respiration change CO2 in a leaf chamber over a short interval. Gross photosynthetic carbon fixation removes 8 units of CO2 per minute, while respiration releases 3 units per minute. Define net chamber CO2 change as released − removed; a negative value means a decrease. Which result and interpretation fit?",
        "choices": [
          "−5 units per minute; fixation exceeds, but does not eliminate, simultaneous respiratory CO2 release.",
          "+5 units per minute; fixation is a source of CO2.",
          "−11 units per minute; both processes remove CO2.",
          "0 units per minute; simultaneous processes must cancel exactly."
        ],
        "answer": 0,
        "hint": "Keep the sign of each pathway contribution before combining the rates.",
        "explanation": "Net change is 3 − 8 = −5 units per minute. CO2 decreases because removal exceeds release, even though respiration continues.",
        "feedback": [
          "Correct: the signed balance preserves both processes.",
          "This reverses the supplied source and sink roles.",
          "Respiration is specified to release, not remove, 3 units.",
          "Simultaneous rates cancel only when their magnitudes agree."
        ],
        "sourceUrls": [
          "https://openstax.org/books/biology-2e/pages/8-1-overview-of-photosynthesis",
          "https://openstax.org/books/biology-2e/pages/8-2-the-light-dependent-reactions-of-photosynthesis",
          "https://openstax.org/books/biology-2e/pages/8-3-using-light-energy-to-make-organic-molecules",
          "https://openstax.org/books/biology-2e/pages/7-4-oxidative-phosphorylation"
        ],
        "canonId": "bio-photosynthesis",
        "sourceId": "continuation-bio-energy-light-carbon-l2",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      }
    ],
    "contentSha256": "0b52c2e8189af686166c28feb993994739c3095921b0687e7ee9b260e3c93370",
    "reviewStatus": "internal-reviewed",
    "verified": true,
    "progressEligible": true,
    "runtimeIntegrated": true,
    "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
  },
  {
    "id": "oc-reaction-crossroads",
    "world": "oc",
    "title": "Reaction Crossroads",
    "scope": "Two bounded objectives connect alpha/beta bond accounting to combined product/kinetic evidence for ordinary SN1/SN2/E1/E2 models. Flexible open-chain E2 geometry is assumed accessible. No universal mechanism decision tree, product ratios, SN1 optical-purity guarantee, isotope-rate prediction, rearrangements, E1cB, alkene regioselectivity ranking, or chair/Newman/E-Z assignment. Atom-label transfer and masked-order experimental design are reserved for later.",
    "objectiveIds": [
      "oc-pathways-bond-fates",
      "oc-pathways-evidence"
    ],
    "metadata": {
      "course": "OCHEM",
      "session": 4,
      "creature": "fluxotl",
      "stationName": "Reaction Crossroads",
      "pathVariant": 2,
      "chapterTheme": "oc",
      "creatureDescriptor": {
        "id": "fluxotl",
        "name": "Fluxotl",
        "type": "alchemy",
        "color": "#a888d2",
        "bodyPlan": "fork-tailed-axolotl",
        "concept": "Bond changes, competing pathways and mechanistic evidence",
        "evolutions": [
          "Fluxotl",
          "Bifurcyn",
          "Pathalume"
        ],
        "rareName": "Aurora Pathalume",
        "blurb": "A violet axolotl carries two translucent tail fins through the Crossroads. It follows molecular evidence to keep Team Entropy from labeling every trail with the same mechanism."
      },
      "topicMappings": {
        "screenshotTopicIds": [
          "bootcamp-organic-chemistry-8"
        ],
        "officialOnlyTopicIds": []
      },
      "instructionFamilyIds": [
        "discovery-oc-reaction-crossroads",
        "oc-pathways-bond-change",
        "oc-pathways-beta-site",
        "oc-pathways-shared-ionization",
        "oc-pathways-joint-evidence",
        "oc-pathways-evidence-limits"
      ]
    },
    "canon": {
      "id": "oc-substitution-elimination",
      "version": "0.2.0",
      "sourceRelativePath": "visuals/sheets/ochem/oc-substitution-elimination.json",
      "sourceSha256": "47119ab14710704fcf8d9c96846cef7becd70f18f72b6c51119ed8370dbf0fc1",
      "sourceRepository": "ace-system",
      "inspectedExportSha256": "3d42da035491489dc2bb09610235de8499e8117e4b694b05b314b4e93bf304f7",
      "adaptationVersion": 1,
      "importsSourceAssessments": false,
      "formativeCanonChecksProgressEligible": false,
      "reviewScope": "Substitution/elimination distinction and bounded shared-versus-bimolecular mechanism evidence. Replace rigid reagent/solvent rules with explicit conditions and observations. No imported checks, exact yields, universal racemization, regiochemical rule, or conformational assignment."
    },
    "objectives": [
      {
        "id": "oc-pathways-bond-fates",
        "world": "oc",
        "name": "Trace substitution and beta-elimination bond changes",
        "lesson": "A substrate is the molecule being transformed. The leaving group departs with its bond electron pair; here it is Br or Cl on a saturated carbon. Call that carbon alpha (α); a directly attached carbon is beta (β). Substitution replaces the leaving group with a new atom or group at α. Beta elimination removes a β hydrogen and the leaving group and raises the α–β bond order from one to two. It needs a β C–H bond: an α hydrogen or a more distant hydrogen cannot replace it. A nucleophile donates an electron pair to carbon; a Brønsted base accepts a proton. One reagent can do either, so basicity and nucleophilicity are different comparisons. In the specified E2 route the bond changes occur together, normally through accessible anti-periplanar geometry. This chapter assumes that geometry is accessible for its flexible open chains; it does not infer stereochemistry from a flat formula. D is deuterium, an isotope of hydrogen that can occupy a hydrogen site. Chemical reactions redistribute atoms; a label remains with its atom unless that atom is removed from the product or exchanged. A label is not a carbon or a leaving group.",
        "sourceUrls": [
          "https://openstax.org/books/organic-chemistry/pages/11-8-the-e2-reaction-and-the-deuterium-isotope-effect",
          "https://openstax.org/books/organic-chemistry/pages/11-10-the-e1-and-e1cb-reactions",
          "https://openstax.org/books/organic-chemistry/pages/11-3-characteristics-of-the-sn2-reaction"
        ],
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "oc-pathways-evidence",
        "world": "oc",
        "name": "Combine product and rate evidence without overassigning pathways",
        "lesson": "First identify the measured product change, then ask what the kinetics support. In the elementary models used here, SN2 is concerted substitution with rate k[RX][Nu]; E2 is concerted beta elimination with rate k[RX][base]. SN1 and E1 share slow ionization of RX to a carbocation, with rate k[RX]; nucleophile capture gives substitution while beta-proton loss gives an alkene. Thus product class separates S from E, but product class alone does not decide 1 versus 2, and a rate law alone does not decide S versus E. At unchanged temperature and medium, varying one concentration independently tests its influence; changing solvent at the same time also changes the rate constant k. An ordinary tertiary saturated center excludes backside SN2 but can support SN1/E1 or E2 when the other requirements hold. Simple methyl/primary nonresonance-stabilized carbocations are unfavorable; steric crowding impedes SN2, including branching near the reacting center. A strong base favors E2 when a usable beta-H exists; a weakly basic good nucleophile can favor SN2 at an accessible carbon. Protic ionizing media can support carbocation routes. These are constraints and tendencies, not a four-box guarantee: pathways can compete, and neither temperature nor solvent alone supplies a product ratio.",
        "sourceUrls": [
          "https://openstax.org/books/organic-chemistry/pages/11-8-the-e2-reaction-and-the-deuterium-isotope-effect",
          "https://openstax.org/books/organic-chemistry/pages/11-10-the-e1-and-e1cb-reactions",
          "https://openstax.org/books/organic-chemistry/pages/11-4-the-sn1-reaction",
          "https://openstax.org/books/organic-chemistry/pages/11-3-characteristics-of-the-sn2-reaction",
          "https://openstax.org/books/organic-chemistry/pages/11-12-a-summary-of-reactivity-sn1-sn2-e1-e1cb-and-e2"
        ],
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      }
    ],
    "teachingByObjective": {
      "oc-pathways-bond-fates": {
        "objectiveId": "oc-pathways-bond-fates",
        "version": 1,
        "core": "A substrate is the molecule being transformed. The leaving group departs with its bond electron pair; here it is Br or Cl on a saturated carbon. Call that carbon alpha (α); a directly attached carbon is beta (β). Substitution replaces the leaving group with a new atom or group at α. Beta elimination removes a β hydrogen and the leaving group and raises the α–β bond order from one to two. It needs a β C–H bond: an α hydrogen or a more distant hydrogen cannot replace it. A nucleophile donates an electron pair to carbon; a Brønsted base accepts a proton. One reagent can do either, so basicity and nucleophilicity are different comparisons. In the specified E2 route the bond changes occur together, normally through accessible anti-periplanar geometry. This chapter assumes that geometry is accessible for its flexible open chains; it does not infer stereochemistry from a flat formula. D is deuterium, an isotope of hydrogen that can occupy a hydrogen site. Chemical reactions redistribute atoms; a label remains with its atom unless that atom is removed from the product or exchanged. A label is not a carbon or a leaving group.",
        "terms": [
          {
            "term": "Alpha carbon",
            "meaning": "The saturated carbon bonded to the leaving group."
          },
          {
            "term": "Beta carbon / beta hydrogen",
            "meaning": "A carbon directly bonded to alpha / a hydrogen on that beta carbon."
          },
          {
            "term": "Nucleophile versus base",
            "meaning": "The first describes electron-pair donation to an electrophilic atom; here a base instead accepts a proton. The roles can compete."
          },
          {
            "term": "Concerted",
            "meaning": "Bond changes occur in one mechanistic step, with no discrete intermediate between them."
          },
          {
            "term": "Deuterium (D)",
            "meaning": "Hydrogen isotope; it occupies a hydrogen site and is tracked as an atom."
          }
        ],
        "assumptions": [
          "Only ordinary saturated alkyl halides and the stated SN1/SN2/E1/E2 models are compared. No aryl/vinyl halides, allylic/benzylic exceptions, rearrangements, E1cB or multistep synthesis.",
          "Products and rate trends labeled as observations are supplied teaching evidence, not invented laboratory measurements or predictions of exact yields.",
          "For rate comparisons, hold temperature and solvent composition fixed unless a prompt explicitly describes a flawed comparison. Concentrations are varied independently.",
          "Open-chain E2 cases have an accessible anti arrangement. No E/Z, chair/Newman geometry or relative alkene abundance is inferred."
        ],
        "workedExample": {
          "prompt": "For the specified E2 conversion CH₃–CH₂Br → CH₂=CH₂, mark alpha and beta and list the net changes. A suitable strong base and an accessible anti arrangement are supplied.",
          "steps": [
            "The CH₂ bonded to Br is alpha; its neighboring CH₃ is beta.",
            "One beta C–H bond and the alpha C–Br bond are broken; the alpha–beta C–C bond becomes a double bond.",
            "The base accepts H, while Br leaves with its bond pair. This carbon skeleton loses H and Br, not a carbon."
          ],
          "answer": "Beta elimination: a beta hydrogen and bromide leave while a C=C bond forms. No incoming group replaces Br at alpha.",
          "familyId": "oc-pathways-bond-change",
          "role": "instruction-only"
        },
        "commonMistake": "Do not call every loss of halide substitution, or remove a hydrogen from an arbitrary carbon.",
        "nextAction": "Mark the reacting carbon and its neighbors; separate the observed bond change from the evidence about the rate-limiting event.",
        "sourceUrls": [
          "https://openstax.org/books/organic-chemistry/pages/11-8-the-e2-reaction-and-the-deuterium-isotope-effect",
          "https://openstax.org/books/organic-chemistry/pages/11-10-the-e1-and-e1cb-reactions",
          "https://openstax.org/books/organic-chemistry/pages/11-3-characteristics-of-the-sn2-reaction"
        ],
        "canon": {
          "id": "oc-substitution-elimination",
          "version": "0.2.0",
          "sourceRelativePath": "visuals/sheets/ochem/oc-substitution-elimination.json",
          "sourceSha256": "47119ab14710704fcf8d9c96846cef7becd70f18f72b6c51119ed8370dbf0fc1",
          "sourceRepository": "ace-system",
          "inspectedExportSha256": "3d42da035491489dc2bb09610235de8499e8117e4b694b05b314b4e93bf304f7",
          "adaptationVersion": 1,
          "importsSourceAssessments": false,
          "formativeCanonChecksProgressEligible": false,
          "reviewScope": "Substitution/elimination distinction and bounded shared-versus-bimolecular mechanism evidence. Replace rigid reagent/solvent rules with explicit conditions and observations. No imported checks, exact yields, universal racemization, regiochemical rule, or conformational assignment."
        },
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      "oc-pathways-evidence": {
        "objectiveId": "oc-pathways-evidence",
        "version": 1,
        "core": "First identify the measured product change, then ask what the kinetics support. In the elementary models used here, SN2 is concerted substitution with rate k[RX][Nu]; E2 is concerted beta elimination with rate k[RX][base]. SN1 and E1 share slow ionization of RX to a carbocation, with rate k[RX]; nucleophile capture gives substitution while beta-proton loss gives an alkene. Thus product class separates S from E, but product class alone does not decide 1 versus 2, and a rate law alone does not decide S versus E. At unchanged temperature and medium, varying one concentration independently tests its influence; changing solvent at the same time also changes the rate constant k. An ordinary tertiary saturated center excludes backside SN2 but can support SN1/E1 or E2 when the other requirements hold. Simple methyl/primary nonresonance-stabilized carbocations are unfavorable; steric crowding impedes SN2, including branching near the reacting center. A strong base favors E2 when a usable beta-H exists; a weakly basic good nucleophile can favor SN2 at an accessible carbon. Protic ionizing media can support carbocation routes. These are constraints and tendencies, not a four-box guarantee: pathways can compete, and neither temperature nor solvent alone supplies a product ratio.",
        "terms": [
          {
            "term": "Initial rate",
            "meaning": "The measured change per time near the start of a trial, before much substrate is consumed."
          },
          {
            "term": "Within a run versus between runs",
            "meaning": "A reagent can stay nearly constant during one run while the starting recipe is deliberately changed in another run. These are different meanings of constant."
          },
          {
            "term": "Rate constant k",
            "meaning": "A parameter that is fixed for a specified reaction model at a fixed temperature and medium."
          },
          {
            "term": "Carbocation",
            "meaning": "A carbon-centered cation; its formation can be the shared slow step before substitution or elimination."
          },
          {
            "term": "Product branching",
            "meaning": "Different fates after a common intermediate; the overall disappearance rate does not supply the fraction taking each branch."
          },
          {
            "term": "Steric hindrance",
            "meaning": "Crowding that obstructs approach, especially the backside displacement needed for SN2."
          }
        ],
        "assumptions": [
          "Only ordinary saturated alkyl halides and the stated SN1/SN2/E1/E2 models are compared. No aryl/vinyl halides, allylic/benzylic exceptions, rearrangements, E1cB or multistep synthesis.",
          "Products and rate trends labeled as observations are supplied teaching evidence, not invented laboratory measurements or predictions of exact yields.",
          "For rate comparisons, hold temperature and solvent composition fixed unless a prompt explicitly describes a flawed comparison. Concentrations are varied independently.",
          "Open-chain E2 cases have an accessible anti arrangement. No E/Z, chair/Newman geometry or relative alkene abundance is inferred."
        ],
        "workedExample": {
          "prompt": "A tertiary alkyl chloride is warmed in aqueous ethanol with no added strong base. A supplied mechanism has slow ionization, and both alcohol and alkene are detected. Does rate = k[RX] force the product to be alcohol?",
          "steps": [
            "The tertiary carbon obstructs ordinary SN2; the stated ionization creates a carbocation.",
            "Nucleophile capture followed by deprotonation can yield the alcohol through SN1. Beta-proton loss from that same intermediate can yield the alkene through E1.",
            "Both branches can follow the same slow ionization. Their shared overall rate law does not set their product fractions."
          ],
          "answer": "No. SN1 and E1 branches can coexist under the supplied conditions; product analysis is needed to describe the mixture.",
          "familyId": "oc-pathways-shared-ionization",
          "role": "instruction-only"
        },
        "commonMistake": "Do not read the N in SN1 or the number 1 from a first-order rate law without also examining the product and stated mechanism.",
        "nextAction": "Mark the reacting carbon and its neighbors; separate the observed bond change from the evidence about the rate-limiting event.",
        "sourceUrls": [
          "https://openstax.org/books/organic-chemistry/pages/11-8-the-e2-reaction-and-the-deuterium-isotope-effect",
          "https://openstax.org/books/organic-chemistry/pages/11-10-the-e1-and-e1cb-reactions",
          "https://openstax.org/books/organic-chemistry/pages/11-4-the-sn1-reaction",
          "https://openstax.org/books/organic-chemistry/pages/11-3-characteristics-of-the-sn2-reaction",
          "https://openstax.org/books/organic-chemistry/pages/11-12-a-summary-of-reactivity-sn1-sn2-e1-e1cb-and-e2"
        ],
        "canon": {
          "id": "oc-substitution-elimination",
          "version": "0.2.0",
          "sourceRelativePath": "visuals/sheets/ochem/oc-substitution-elimination.json",
          "sourceSha256": "47119ab14710704fcf8d9c96846cef7becd70f18f72b6c51119ed8370dbf0fc1",
          "sourceRepository": "ace-system",
          "inspectedExportSha256": "3d42da035491489dc2bb09610235de8499e8117e4b694b05b314b4e93bf304f7",
          "adaptationVersion": 1,
          "importsSourceAssessments": false,
          "formativeCanonChecksProgressEligible": false,
          "reviewScope": "Substitution/elimination distinction and bounded shared-versus-bimolecular mechanism evidence. Replace rigid reagent/solvent rules with explicit conditions and observations. No imported checks, exact yields, universal racemization, regiochemical rule, or conformational assignment."
        },
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      }
    },
    "items": [
      {
        "id": "refinement-oc-pathways-bond-fates-p1",
        "objectiveId": "oc-pathways-bond-fates",
        "world": "oc",
        "pool": "practice",
        "familyId": "oc-pathways-bond-change",
        "familyRationale": "Forward net-bond accounting for a specified substitution or beta-elimination event; changing a chain or leaving group is not a new task family.",
        "prompt": "In a specified E2 reaction, CH₃–CHBr–CH₃ gives propene. A strong base and accessible anti geometry are supplied. Which net bond change accounts for the alkene?",
        "choices": [
          "Break a neighboring C–H and C–Br; change that C–C single bond to a double bond.",
          "Replace Br with the base at the same carbon while keeping every C–H bond.",
          "Break a C–C bond and discard one carbon.",
          "Remove H and Br from the same carbon, leaving every C–C bond single."
        ],
        "answer": 0,
        "hint": "The double bond connects the carbon losing Br to the neighboring carbon losing H.",
        "explanation": "A beta hydrogen and Br are removed from adjacent carbons. Their connecting bond becomes a double bond in the specified concerted elimination.",
        "feedback": [
          "Correct: the carbon skeleton is retained and a C=C bond forms.",
          "That describes substitution, not the observed alkene-forming event.",
          "Propene retains all three substrate carbons.",
          "Beta elimination uses adjacent carbons and increases their bond order."
        ],
        "sourceUrls": [
          "https://openstax.org/books/organic-chemistry/pages/11-8-the-e2-reaction-and-the-deuterium-isotope-effect",
          "https://openstax.org/books/organic-chemistry/pages/11-10-the-e1-and-e1cb-reactions",
          "https://openstax.org/books/organic-chemistry/pages/11-3-characteristics-of-the-sn2-reaction"
        ],
        "canonId": "oc-substitution-elimination",
        "sourceId": "refinement-oc-pathways-bond-fates-p1",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "refinement-oc-pathways-bond-fates-p2",
        "objectiveId": "oc-pathways-bond-fates",
        "world": "oc",
        "pool": "practice",
        "familyId": "oc-pathways-beta-site",
        "familyRationale": "Locate a beta C–H prerequisite from explicit connectivity. Alpha or remote hydrogens do not satisfy it.",
        "prompt": "Number CH₃–CHBr–CH₂–CH₃ from left to right as C1–C4. For direct beta elimination of Br at C2, which carbons can supply a beta hydrogen? Consider possible constitutional alkenes only, not their proportions or E/Z forms.",
        "choices": [
          "C2 only",
          "C1 and C3",
          "C1 and C4",
          "Every carbon equally"
        ],
        "answer": 1,
        "hint": "Beta means one carbon–carbon bond away from the carbon bearing Br.",
        "explanation": "C2 is alpha. Both adjacent carbons C1 and C3 carry hydrogens; C4 is too remote. Removal from C1 or C3 can form C1=C2 or C2=C3 respectively.",
        "feedback": [
          "C2 hydrogens are alpha, not beta.",
          "Correct: both adjacent carbon sites satisfy the beta-H prerequisite.",
          "C4 is two C–C bonds from C2.",
          "The positions are fixed by connectivity, not by a count of all hydrogens."
        ],
        "sourceUrls": [
          "https://openstax.org/books/organic-chemistry/pages/11-8-the-e2-reaction-and-the-deuterium-isotope-effect",
          "https://openstax.org/books/organic-chemistry/pages/11-10-the-e1-and-e1cb-reactions",
          "https://openstax.org/books/organic-chemistry/pages/11-3-characteristics-of-the-sn2-reaction"
        ],
        "canonId": "oc-substitution-elimination",
        "sourceId": "refinement-oc-pathways-bond-fates-p2",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "refinement-oc-pathways-bond-fates-p3",
        "objectiveId": "oc-pathways-bond-fates",
        "world": "oc",
        "pool": "practice",
        "familyId": "oc-pathways-beta-site",
        "familyRationale": "Locate a beta C–H prerequisite from explicit connectivity. Alpha or remote hydrogens do not satisfy it.",
        "prompt": "For BrCH₂–C(CH₃)₃ (neopentyl bromide), a teammate proposes direct E2 using a hydrogen on one terminal CH₃. Which structural check defeats that proposal?",
        "choices": [
          "The molecule has no hydrogens anywhere.",
          "Bromide cannot ever be a leaving group.",
          "The only beta carbon has no hydrogen; terminal methyl hydrogens are farther away.",
          "Every primary substrate must form an alkene."
        ],
        "answer": 2,
        "hint": "Count bonds outward from the carbon directly bonded to Br.",
        "explanation": "The BrCH₂ carbon is alpha. Its only beta neighbor is the central carbon bonded to four carbons, so it has no C–H bond. The methyl groups are one carbon farther out. This excludes direct beta E2, not every conceivable reaction.",
        "feedback": [
          "The alpha and terminal methyl carbons do carry hydrogens.",
          "Bromide is the supplied leaving group; missing beta-H is the issue.",
          "Correct: a remote hydrogen does not meet the adjacent-site requirement.",
          "Primary classification alone does not supply a beta hydrogen."
        ],
        "sourceUrls": [
          "https://openstax.org/books/organic-chemistry/pages/11-8-the-e2-reaction-and-the-deuterium-isotope-effect",
          "https://openstax.org/books/organic-chemistry/pages/11-10-the-e1-and-e1cb-reactions",
          "https://openstax.org/books/organic-chemistry/pages/11-3-characteristics-of-the-sn2-reaction"
        ],
        "canonId": "oc-substitution-elimination",
        "sourceId": "refinement-oc-pathways-bond-fates-p3",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "refinement-oc-pathways-bond-fates-c1",
        "objectiveId": "oc-pathways-bond-fates",
        "world": "oc",
        "pool": "check",
        "familyId": "oc-pathways-bond-change",
        "familyRationale": "Forward net-bond accounting for a specified substitution or beta-elimination event; changing a chain or leaving group is not a new task family.",
        "prompt": "An isolated product changes CH₃CH₂CH₂Br into CH₃CH₂CH₂OH with the carbon skeleton intact. Which statement is warranted from this product connectivity alone?",
        "choices": [
          "E2 is established because Br disappeared.",
          "E1 is established because OH contains hydrogen.",
          "The substrate must have lost a beta hydrogen.",
          "Substitution occurred; the product alone does not distinguish SN1 from SN2."
        ],
        "answer": 3,
        "hint": "Ask whether the carbon lost Br to a replacement group or became part of an alkene.",
        "explanation": "OH replaces Br on the same carbon. That is substitution. Product class by itself is not a rate law; the ordinary primary substrate would require further conditions and evidence for a mechanistic assignment.",
        "feedback": [
          "Halide departure occurs in substitution too.",
          "An O–H bond in the product does not show beta elimination.",
          "No new C=C bond appears in the given product.",
          "Correct: the net change is substitution, with no kinetic claim."
        ],
        "sourceUrls": [
          "https://openstax.org/books/organic-chemistry/pages/11-8-the-e2-reaction-and-the-deuterium-isotope-effect",
          "https://openstax.org/books/organic-chemistry/pages/11-10-the-e1-and-e1cb-reactions",
          "https://openstax.org/books/organic-chemistry/pages/11-3-characteristics-of-the-sn2-reaction"
        ],
        "canonId": "oc-substitution-elimination",
        "sourceId": "refinement-oc-pathways-bond-fates-c1",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "refinement-oc-pathways-bond-fates-c2",
        "objectiveId": "oc-pathways-bond-fates",
        "world": "oc",
        "pool": "check",
        "familyId": "oc-pathways-beta-site",
        "familyRationale": "Locate a beta C–H prerequisite from explicit connectivity. Alpha or remote hydrogens do not satisfy it.",
        "prompt": "In CH₃–CH₂–C(Br)(CH₃)–CH₂–CH₃, mark the central Br-bearing carbon alpha. Which description correctly locates all beta carbons that bear hydrogens?",
        "choices": [
          "Only the two terminal CH₃ groups at the far ends.",
          "The two adjacent CH₂ groups and the CH₃ attached directly to alpha.",
          "The alpha carbon itself, because it bears Br.",
          "None, because alpha is tertiary."
        ],
        "answer": 1,
        "hint": "There are three C–C bonds directly leaving alpha; inspect the carbon at the end of each.",
        "explanation": "The central alpha carbon has three directly bonded carbon neighbors: two CH₂ groups and one CH₃ group. Each has at least one hydrogen. Tertiary substitution at alpha does not remove beta hydrogens.",
        "feedback": [
          "The far-end CH₃ groups are not directly attached to alpha.",
          "Correct: all three directly attached carbon sites bear beta hydrogens.",
          "Alpha is not beta and here has no hydrogen.",
          "Tertiary carbons can have beta neighbors bearing hydrogens."
        ],
        "sourceUrls": [
          "https://openstax.org/books/organic-chemistry/pages/11-8-the-e2-reaction-and-the-deuterium-isotope-effect",
          "https://openstax.org/books/organic-chemistry/pages/11-10-the-e1-and-e1cb-reactions",
          "https://openstax.org/books/organic-chemistry/pages/11-3-characteristics-of-the-sn2-reaction"
        ],
        "canonId": "oc-substitution-elimination",
        "sourceId": "refinement-oc-pathways-bond-fates-c2",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "refinement-oc-pathways-bond-fates-c3",
        "objectiveId": "oc-pathways-bond-fates",
        "world": "oc",
        "pool": "check",
        "familyId": "oc-pathways-bond-change",
        "familyRationale": "Forward net-bond accounting for a specified substitution or beta-elimination event; changing a chain or leaving group is not a new task family.",
        "prompt": "In a stated E2 step on CH₃–CHBr–CH₂–CH₃, ethoxide accepts a proton from C3 while Br leaves C2. Which organic product connectivity follows? Assume an accessible anti arrangement; do not assign E/Z or abundance.",
        "choices": [
          "CH₃–CH(OCH₂CH₃)–CH₂–CH₃",
          "CH₂=CH–CH₂–CH₃",
          "CH₃–CH=CH–CH₃",
          "CH₃–CH₂–CH₂–CH₃"
        ],
        "answer": 2,
        "hint": "The new double bond joins the carbon losing H to the carbon losing Br.",
        "explanation": "Removing H at C3 and Br at C2 raises the C2–C3 bond order, giving but-2-ene connectivity. The stated site determines connectivity; this is not a claim about which site usually wins.",
        "feedback": [
          "This installs ethoxide at carbon and describes substitution.",
          "That double bond would require hydrogen loss from C1.",
          "Correct: the specified C3 hydrogen loss creates C2=C3.",
          "Replacing Br by H is neither the stated E2 event nor its bond accounting."
        ],
        "sourceUrls": [
          "https://openstax.org/books/organic-chemistry/pages/11-8-the-e2-reaction-and-the-deuterium-isotope-effect",
          "https://openstax.org/books/organic-chemistry/pages/11-10-the-e1-and-e1cb-reactions",
          "https://openstax.org/books/organic-chemistry/pages/11-3-characteristics-of-the-sn2-reaction"
        ],
        "canonId": "oc-substitution-elimination",
        "sourceId": "refinement-oc-pathways-bond-fates-c3",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "refinement-oc-pathways-bond-fates-l1",
        "objectiveId": "oc-pathways-bond-fates",
        "world": "oc",
        "pool": "later",
        "familyId": "oc-pathways-isotopic-fate",
        "familyRationale": "Reserved transfer: recover an elimination site or product atom-label ledger from observed isotope retention. Reaction class is already given and all candidates concern alkenes, so classification alone cannot answer. The learner must conserve labels at their original carbon sites, distinguish loss from migration, and avoid inferring rates or branch fractions. No ordinary guide/activity/item tracks labels through a reaction.",
        "prompt": "Number the main chain CH₃–C(Br)(CH₂CH₃)–CD₂–CH₃ as C1–C4. The ethyl branch on C2 is C5–C6, starting at C5. After one direct beta-elimination event, an isolated alkene retains ONE of the original two D atoms. Assume no isotope exchange, rearrangement or later reaction, and accessible geometry. Which bond became the double bond?",
        "choices": [
          "C2=C3",
          "C1=C2",
          "C2=C5",
          "The retained-D evidence leaves all three listed alpha–beta bonds equally possible."
        ],
        "answer": 0,
        "hint": "Locate the original D atoms first. Which neighboring carbon can lose one of them while its bond to alpha becomes double?",
        "explanation": "Both original D atoms are on beta carbon C3. Losing one D from C3 leaves one D there and forms C2=C3. Elimination toward C1 or C5 removes an unlabeled H and retains both D atoms at C3. The observed isolated product therefore identifies the elimination site; it does not give a rate, yield, E/Z assignment or E1-versus-E2 verdict.",
        "feedback": [
          "Correct: the one-D inventory requires loss from C3, next to the Br-bearing C2.",
          "Elimination toward C1 removes an unlabeled H and would leave both C3 D atoms.",
          "C5 is CH₂, so elimination toward it removes H and leaves both D atoms on C3.",
          "The beta sites do not carry the same isotope inventory: only C3 can supply the lost D."
        ],
        "sourceUrls": [
          "https://openstax.org/books/organic-chemistry/pages/11-8-the-e2-reaction-and-the-deuterium-isotope-effect",
          "https://openstax.org/books/organic-chemistry/pages/11-10-the-e1-and-e1cb-reactions",
          "https://openstax.org/books/organic-chemistry/pages/11-3-characteristics-of-the-sn2-reaction"
        ],
        "canonId": "oc-substitution-elimination",
        "sourceId": "refinement-oc-pathways-bond-fates-l1",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "refinement-oc-pathways-bond-fates-l2",
        "objectiveId": "oc-pathways-bond-fates",
        "world": "oc",
        "pool": "later",
        "familyId": "oc-pathways-isotopic-fate",
        "familyRationale": "Reserved transfer: recover an elimination site or product atom-label ledger from observed isotope retention. Reaction class is already given and all candidates concern alkenes, so classification alone cannot answer. The learner must conserve labels at their original carbon sites, distinguish loss from migration, and avoid inferring rates or branch fractions. No ordinary guide/activity/item tracks labels through a reaction.",
        "prompt": "CH₃–CHBr–CD₂–CH₃ undergoes one direct beta-elimination event. Number the chain C1–C4 from left to right and keep those carbon identities in the product. The isolated alkene retains BOTH original D atoms. With no isotope exchange, rearrangement or later reaction, which product atom-label arrangement fits? Assume accessible geometry; no E/Z assignment is requested.",
        "choices": [
          "CH₃–CH=CD–CH₃",
          "CH₂=CH–CD₂–CH₃",
          "CH₂=CD–CHD–CH₃",
          "CHD=CH–CHD–CH₃"
        ],
        "answer": 1,
        "hint": "The product must conserve not only the total D count but also which original carbon carries each surviving D atom.",
        "explanation": "Retention of both D atoms means neither was removed from C3. Loss of an unlabeled H at C1 forms C1=C2 and leaves C3 as CD₂, giving CH₂=CH–CD₂–CH₃. The internal alkene alternative loses one D; the other terminal-alkene drawings move D to carbons that were originally unlabeled. No rate or product-fraction conclusion follows.",
        "feedback": [
          "This C2=C3 product requires loss of one C3 D, leaving only one D in the product.",
          "Correct: elimination toward C1 retains both labels at their original C3 site.",
          "Two D atoms remain, but one has moved from C3 to C2; that violates the no-exchange/no-rearrangement conditions.",
          "Two D atoms remain, but one has moved from C3 to C1; that is not the specified direct elimination."
        ],
        "sourceUrls": [
          "https://openstax.org/books/organic-chemistry/pages/11-8-the-e2-reaction-and-the-deuterium-isotope-effect",
          "https://openstax.org/books/organic-chemistry/pages/11-10-the-e1-and-e1cb-reactions",
          "https://openstax.org/books/organic-chemistry/pages/11-3-characteristics-of-the-sn2-reaction"
        ],
        "canonId": "oc-substitution-elimination",
        "sourceId": "refinement-oc-pathways-bond-fates-l2",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "refinement-oc-pathways-evidence-p1",
        "objectiveId": "oc-pathways-evidence",
        "world": "oc",
        "pool": "practice",
        "familyId": "oc-pathways-joint-evidence",
        "familyRationale": "Combine measured product class with independently supplied reagent-order evidence under controlled conditions. Unlike the old SN2 multiplier family, no numerical rate multiplier is the target.",
        "prompt": "Teaching evidence: (CH₃)₃CBr with ethoxide in fixed ethanol at fixed temperature gives 2-methylpropene. Independently doubling [RX] or [ethoxide] doubles its initial formation rate. Among the four elementary models, which best accounts for both observations?",
        "choices": [
          "SN1",
          "SN2",
          "E2",
          "E1"
        ],
        "answer": 2,
        "hint": "Combine an alkene product with dependence on both substrate and base.",
        "explanation": "The alkene is an elimination product, and both substrate and base enter the supported bimolecular event. E2 fits both. Ordinary SN2 is also obstructed at the tertiary center. This comparison does not claim a measured yield.",
        "feedback": [
          "SN1 describes substitution after ionization, not the supplied base-dependent alkene-forming event.",
          "SN2 gives substitution and is obstructed at this tertiary center.",
          "Correct: elimination plus base and substrate dependence supports E2.",
          "The elementary E1 model has slow ionization independent of base concentration."
        ],
        "sourceUrls": [
          "https://openstax.org/books/organic-chemistry/pages/11-8-the-e2-reaction-and-the-deuterium-isotope-effect",
          "https://openstax.org/books/organic-chemistry/pages/11-10-the-e1-and-e1cb-reactions",
          "https://openstax.org/books/organic-chemistry/pages/11-4-the-sn1-reaction",
          "https://openstax.org/books/organic-chemistry/pages/11-3-characteristics-of-the-sn2-reaction",
          "https://openstax.org/books/organic-chemistry/pages/11-12-a-summary-of-reactivity-sn1-sn2-e1-e1cb-and-e2"
        ],
        "canonId": "oc-substitution-elimination",
        "sourceId": "refinement-oc-pathways-evidence-p1",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "refinement-oc-pathways-evidence-p2",
        "objectiveId": "oc-pathways-evidence",
        "world": "oc",
        "pool": "practice",
        "familyId": "oc-pathways-shared-ionization",
        "familyRationale": "Interpret different product branches after one stated slow ionization. A shared disappearance rate cannot identify a unique product class.",
        "prompt": "A tertiary chloride is warmed in aqueous ethanol without added strong base. The supplied model has slow ionization, then either solvent capture or beta-proton loss. Alcohol and alkene are both detected. Team Entropy says a first-order disappearance rate permits only SN1. Which correction is justified?",
        "choices": [
          "First-order kinetics forces only alkene.",
          "Alcohol and alkene must be formed in equal amounts.",
          "SN2 must account for the alcohol because alcohol is a substitution product.",
          "SN1 and E1 can branch after the same slow ionization; the rate law does not give their ratio."
        ],
        "answer": 3,
        "hint": "A shared slow step can feed different faster product-forming steps.",
        "explanation": "Solvent capture can lead to alcohol by SN1; beta-proton loss can lead to alkene by E1. Both can follow the stated unimolecular ionization, so the overall disappearance law does not fix branching fractions.",
        "feedback": [
          "E1 is possible, but the alcohol is also detected.",
          "No equality of the branch rates is specified.",
          "Tertiary backside SN2 is obstructed; the given carbocation route explains the substitution.",
          "Correct: mechanism branches and overall disappearance kinetics answer different questions."
        ],
        "sourceUrls": [
          "https://openstax.org/books/organic-chemistry/pages/11-8-the-e2-reaction-and-the-deuterium-isotope-effect",
          "https://openstax.org/books/organic-chemistry/pages/11-10-the-e1-and-e1cb-reactions",
          "https://openstax.org/books/organic-chemistry/pages/11-4-the-sn1-reaction",
          "https://openstax.org/books/organic-chemistry/pages/11-3-characteristics-of-the-sn2-reaction",
          "https://openstax.org/books/organic-chemistry/pages/11-12-a-summary-of-reactivity-sn1-sn2-e1-e1cb-and-e2"
        ],
        "canonId": "oc-substitution-elimination",
        "sourceId": "refinement-oc-pathways-evidence-p2",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "refinement-oc-pathways-evidence-p3",
        "objectiveId": "oc-pathways-evidence",
        "world": "oc",
        "pool": "practice",
        "familyId": "oc-pathways-evidence-limits",
        "familyRationale": "Audit the information missing from a rate-only or product-only mechanism claim.",
        "prompt": "For a secondary alkyl bromide and a reagent able to act as either nucleophile or base, only rate = k[RX][reagent] is supplied. Temperature and medium are fixed; product identities are hidden. Which conclusion is justified within the SN1/SN2/E1/E2 elementary models?",
        "choices": [
          "The rate form is consistent with SN2 or E2; product evidence is still needed.",
          "The rate form establishes substitution only.",
          "The rate form establishes elimination only.",
          "The rate law says the reagent never participates in the slow event."
        ],
        "answer": 0,
        "hint": "S versus E describes the bond change, which this rate law does not display.",
        "explanation": "Both SN2 and E2 have substrate-and-reagent dependence in the elementary models. The rate law does not say whether the reagent bonds to carbon or removes a beta proton.",
        "feedback": [
          "Correct: the missing product evidence matters.",
          "E2 has the same concentration-order form.",
          "SN2 has the same concentration-order form.",
          "Reagent dependence is evidence for its participation in the bimolecular event."
        ],
        "sourceUrls": [
          "https://openstax.org/books/organic-chemistry/pages/11-8-the-e2-reaction-and-the-deuterium-isotope-effect",
          "https://openstax.org/books/organic-chemistry/pages/11-10-the-e1-and-e1cb-reactions",
          "https://openstax.org/books/organic-chemistry/pages/11-4-the-sn1-reaction",
          "https://openstax.org/books/organic-chemistry/pages/11-3-characteristics-of-the-sn2-reaction",
          "https://openstax.org/books/organic-chemistry/pages/11-12-a-summary-of-reactivity-sn1-sn2-e1-e1cb-and-e2"
        ],
        "canonId": "oc-substitution-elimination",
        "sourceId": "refinement-oc-pathways-evidence-p3",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "refinement-oc-pathways-evidence-c1",
        "objectiveId": "oc-pathways-evidence",
        "world": "oc",
        "pool": "check",
        "familyId": "oc-pathways-shared-ionization",
        "familyRationale": "Interpret different product branches after one stated slow ionization. A shared disappearance rate cannot identify a unique product class.",
        "prompt": "A stated pathway for a tertiary bromide in aqueous ethanol has slow C–Br ionization, followed by loss of a beta proton from the carbocation to give an alkene. Which name fits this particular product-forming branch?",
        "choices": [
          "SN1, because all first-order routes are substitutions.",
          "E2, because every alkene forms in one step.",
          "E1, because beta-proton loss follows the unimolecular ionization.",
          "SN2, because bromide leaves."
        ],
        "answer": 2,
        "hint": "Use both the timing and the net bond change.",
        "explanation": "An alkene formed by beta-proton loss after a carbocation intermediate is the E1 branch. The earlier C–Br cleavage and later C–H cleavage are separate steps, unlike E2.",
        "feedback": [
          "SN1 would involve capture to make a substitution product.",
          "The prompt explicitly separates ionization from proton loss.",
          "Correct: elimination after ionization is E1.",
          "SN2 is concerted substitution, not the stated two-stage elimination."
        ],
        "sourceUrls": [
          "https://openstax.org/books/organic-chemistry/pages/11-8-the-e2-reaction-and-the-deuterium-isotope-effect",
          "https://openstax.org/books/organic-chemistry/pages/11-10-the-e1-and-e1cb-reactions",
          "https://openstax.org/books/organic-chemistry/pages/11-4-the-sn1-reaction",
          "https://openstax.org/books/organic-chemistry/pages/11-3-characteristics-of-the-sn2-reaction",
          "https://openstax.org/books/organic-chemistry/pages/11-12-a-summary-of-reactivity-sn1-sn2-e1-e1cb-and-e2"
        ],
        "canonId": "oc-substitution-elimination",
        "sourceId": "refinement-oc-pathways-evidence-c1",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "refinement-oc-pathways-evidence-c2",
        "objectiveId": "oc-pathways-evidence",
        "world": "oc",
        "pool": "check",
        "familyId": "oc-pathways-joint-evidence",
        "familyRationale": "Combine measured product class with independently supplied reagent-order evidence under controlled conditions. Unlike the old SN2 multiplier family, no numerical rate multiplier is the target.",
        "prompt": "Teaching evidence: an unhindered primary propyl bromide and azide in DMSO produce CH₃CH₂CH₂N₃. At fixed temperature and solvent composition, varying either reactant independently gives first-order dependence on that reactant. Which model fits both the product and rate evidence?",
        "choices": [
          "SN2: substitution with a bimolecular rate dependence.",
          "E2: any reagent-dependent reaction is elimination.",
          "E1: every polar solvent requires a carbocation.",
          "SN1: the product name alone proves slow ionization."
        ],
        "answer": 0,
        "hint": "A C–N replacement product and dependence on both reactants must be explained together.",
        "explanation": "Azide replaces Br without forming an alkene, and both reactants affect the rate. The elementary SN2 model fits these combined observations on the accessible primary substrate; DMSO alone would not establish that conclusion.",
        "feedback": [
          "Correct: the product and kinetic evidence point to the same model.",
          "Elimination would produce an alkene, not the shown substitution product.",
          "Solvent polarity alone neither proves ionization nor explains the supplied rate dependence.",
          "The product alone cannot establish slow ionization; the stated reagent dependence argues against this simple SN1 model."
        ],
        "sourceUrls": [
          "https://openstax.org/books/organic-chemistry/pages/11-8-the-e2-reaction-and-the-deuterium-isotope-effect",
          "https://openstax.org/books/organic-chemistry/pages/11-10-the-e1-and-e1cb-reactions",
          "https://openstax.org/books/organic-chemistry/pages/11-4-the-sn1-reaction",
          "https://openstax.org/books/organic-chemistry/pages/11-3-characteristics-of-the-sn2-reaction",
          "https://openstax.org/books/organic-chemistry/pages/11-12-a-summary-of-reactivity-sn1-sn2-e1-e1cb-and-e2"
        ],
        "canonId": "oc-substitution-elimination",
        "sourceId": "refinement-oc-pathways-evidence-c2",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "refinement-oc-pathways-evidence-c3",
        "objectiveId": "oc-pathways-evidence",
        "world": "oc",
        "pool": "check",
        "familyId": "oc-pathways-evidence-limits",
        "familyRationale": "Audit the information missing from a rate-only or product-only mechanism claim.",
        "prompt": "Team Entropy doubles the base concentration and also changes ethanol to DMSO, then attributes a faster reaction entirely to the concentration increase. Which flaw matters for using this as evidence of a rate law?",
        "choices": [
          "All concentration studies must use a tertiary substrate.",
          "The base concentration and medium changed together, so k need not stay the same.",
          "A faster reaction must give more elimination product.",
          "Solvent never changes a reaction rate constant."
        ],
        "answer": 1,
        "hint": "A rate-law comparison isolates a concentration change from changes in the reaction environment.",
        "explanation": "Changing the medium can change the rate constant and even the balance of pathways. The combined change does not isolate the effect of base concentration. Repeat controlled comparisons with solvent composition and temperature fixed.",
        "feedback": [
          "Substrate class does not repair the confounded comparison.",
          "Correct: two changed variables prevent that attribution.",
          "Overall speed does not identify product branching.",
          "The medium can change the activation barrier and k."
        ],
        "sourceUrls": [
          "https://openstax.org/books/organic-chemistry/pages/11-8-the-e2-reaction-and-the-deuterium-isotope-effect",
          "https://openstax.org/books/organic-chemistry/pages/11-10-the-e1-and-e1cb-reactions",
          "https://openstax.org/books/organic-chemistry/pages/11-4-the-sn1-reaction",
          "https://openstax.org/books/organic-chemistry/pages/11-3-characteristics-of-the-sn2-reaction",
          "https://openstax.org/books/organic-chemistry/pages/11-12-a-summary-of-reactivity-sn1-sn2-e1-e1cb-and-e2"
        ],
        "canonId": "oc-substitution-elimination",
        "sourceId": "refinement-oc-pathways-evidence-c3",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "refinement-oc-pathways-evidence-l1",
        "objectiveId": "oc-pathways-evidence",
        "world": "oc",
        "pool": "later",
        "familyId": "oc-pathways-masked-order-design",
        "familyRationale": "Reserved transfer: expose a hidden concentration dependence when excess reagent stays effectively constant within each decay run. Compare or design multiple controlled runs to distinguish two rate models. Ordinary teaching gives independent concentration dependencies directly and never uses pseudo-first-order decay or observed decay constants.",
        "prompt": "Two candidate models for an alkene-forming reaction are A: v = k₁[RX] and B: v = k₂[RX][base]. Base is in such large excess that its concentration stays effectively constant during each run. At one fixed base concentration, [RX] decays like a first-order process. Which next experiment can distinguish these models under their stated assumptions?",
        "choices": [
          "Repeat the same run and declare A proven.",
          "Change base concentration and solvent together.",
          "Measure only whether an alkene is present.",
          "Repeat at a different base concentration with temperature and solvent fixed, and compare the observed first-order decay constants."
        ],
        "answer": 3,
        "hint": "For model B, a constant within one run can still take a different value in another run.",
        "explanation": "Under B, kobs = k₂[base]; under A, kobs = k₁. A single excess-base decay run can fit either form. Controlled runs at different base concentrations reveal whether kobs changes with base. This is model discrimination, not a ratio prediction.",
        "feedback": [
          "The same condition leaves the same ambiguity.",
          "Changing solvent also changes k and confounds the comparison.",
          "Both candidate models are specified as alkene-forming.",
          "Correct: it tests the hidden base factor while holding the rate constants comparable."
        ],
        "sourceUrls": [
          "https://openstax.org/books/organic-chemistry/pages/11-8-the-e2-reaction-and-the-deuterium-isotope-effect",
          "https://openstax.org/books/organic-chemistry/pages/11-10-the-e1-and-e1cb-reactions",
          "https://openstax.org/books/organic-chemistry/pages/11-4-the-sn1-reaction",
          "https://openstax.org/books/organic-chemistry/pages/11-3-characteristics-of-the-sn2-reaction",
          "https://openstax.org/books/organic-chemistry/pages/11-12-a-summary-of-reactivity-sn1-sn2-e1-e1cb-and-e2"
        ],
        "canonId": "oc-substitution-elimination",
        "sourceId": "refinement-oc-pathways-evidence-l1",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "refinement-oc-pathways-evidence-l2",
        "objectiveId": "oc-pathways-evidence",
        "world": "oc",
        "pool": "later",
        "familyId": "oc-pathways-masked-order-design",
        "familyRationale": "Reserved transfer: expose a hidden concentration dependence when excess reagent stays effectively constant within each decay run. Compare or design multiple controlled runs to distinguish two rate models. Ordinary teaching gives independent concentration dependencies directly and never uses pseudo-first-order decay or observed decay constants.",
        "prompt": "For an alkene-forming pathway, each run keeps base effectively constant through large excess and follows v = kobs[RX], where kobs is the observed first-order decay constant. At the same temperature and solvent, kobs for substrate decay is 0.010 s⁻¹ at [base] = 0.10 M and 0.020 s⁻¹ at 0.20 M. Compare only model A: v = k₁[RX], with k₁ independent of base, and model B: v = k₂[RX][base]. Which conclusion uses both runs?",
        "choices": [
          "Each run looks first order in substrate, so only model A can fit.",
          "Both runs require a substitution product.",
          "Model B fits the base-dependent kobs with k₂ = 0.10 M⁻¹ s⁻¹; the first-order appearance within a run did not exclude bimolecular E2.",
          "The data prove an equal E1/E2 mixture."
        ],
        "answer": 2,
        "hint": "For model B, divide each kobs by that run’s base concentration.",
        "explanation": "Both quotients equal 0.10 M⁻¹ s⁻¹. Model B therefore accounts for both runs with one k₂, whereas the specified base-independent k₁ cannot equal both observed constants. Under the bounded alkene-forming alternatives this supports E2 over simple E1; it does not quantify a mixture.",
        "feedback": [
          "Holding base nearly constant masks its factor within each run.",
          "An alkene-forming pathway is specified; rate order cannot turn it into substitution.",
          "Correct: the controlled between-run comparison uncovers the hidden dependence.",
          "No branching or fraction data are supplied."
        ],
        "sourceUrls": [
          "https://openstax.org/books/organic-chemistry/pages/11-8-the-e2-reaction-and-the-deuterium-isotope-effect",
          "https://openstax.org/books/organic-chemistry/pages/11-10-the-e1-and-e1cb-reactions",
          "https://openstax.org/books/organic-chemistry/pages/11-4-the-sn1-reaction",
          "https://openstax.org/books/organic-chemistry/pages/11-3-characteristics-of-the-sn2-reaction",
          "https://openstax.org/books/organic-chemistry/pages/11-12-a-summary-of-reactivity-sn1-sn2-e1-e1cb-and-e2"
        ],
        "canonId": "oc-substitution-elimination",
        "sourceId": "refinement-oc-pathways-evidence-l2",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      }
    ],
    "contentSha256": "c96c15a012be29e276e92ebec56adb73de3937b4222a5aa6ee4426cc4ae0e204",
    "reviewStatus": "internal-reviewed",
    "verified": true,
    "progressEligible": true,
    "runtimeIntegrated": true,
    "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
  },
  {
    "id": "qr-data-observatory",
    "world": "qr",
    "title": "The Data Observatory",
    "scope": "Two bounded data-analysis objectives: labeled counts and percentages, equal-width frequency displays, supplied common-scale box summaries, exact frequency and group-weighted centers, explicit population SD, uniform transformations and one-extreme corrections. Later checks reserve cross-report consistency and inverse aggregate constraints. Density histograms, interpolation within bins, normal probabilities, z-scores, sample-estimation SD, statistical significance, causal inference and full DAT statistics coverage remain outside this chapter.",
    "objectiveIds": [
      "qr-data-graph-interpretation",
      "qr-data-center-spread"
    ],
    "metadata": {
      "course": "QR",
      "session": 4,
      "creature": "tallyfin",
      "stationName": "Data Observatory",
      "pathVariant": 2,
      "chapterTheme": "qr",
      "creatureDescriptor": {
        "id": "tallyfin",
        "name": "Tallyfin",
        "type": "reason",
        "color": "#64b8bf",
        "bodyPlan": "A small teal manta-like sky ray with paired fan fins, four bead-like dorsal scales and a forked ribbon tail; markings are decorative and never encode an answer.",
        "concept": "Reading evidence with its denominator, frequency weights and spread",
        "evolutions": [
          "Tallyfin",
          "Quantara",
          "Asterafin"
        ],
        "rareName": "Polar Asterafin",
        "blurb": "Tallyfin keeps each observation in view. Restore the Observatory by finding exactly which scales and summaries Team Entropy has confused."
      },
      "topicMappings": {
        "screenshotTopicIds": [
          "bootcamp-quantitative-reasoning-6"
        ],
        "officialOnlyTopicIds": []
      },
      "instructionFamilyIds": [
        "discovery-qr-data-observatory",
        "qr-data-axis-read",
        "qr-data-denominator-read",
        "qr-data-box-comparison",
        "qr-data-frequency-center",
        "qr-data-pooled-mean",
        "qr-data-population-spread",
        "qr-data-uniform-transform",
        "qr-data-extreme-rank"
      ]
    },
    "canonSources": [
      {
        "id": "qr-reading-charts",
        "version": "0.1.0",
        "sourceRelativePath": "visuals/sheets/qr/qr-reading-charts.json",
        "sourceSha256": "0fccad018a96b93a8d9b1bd0f3b5bc64702bfbd7bf54c4dd5c7e6f225438ab3b",
        "sourceRepository": "ace-system",
        "inspectedExportSha256": "3d42da035491489dc2bb09610235de8499e8117e4b694b05b314b4e93bf304f7",
        "adaptationVersion": 1,
        "importsSourceAssessments": false,
        "formativeCanonChecksProgressEligible": false,
        "reviewScope": "Read chart labels, units and scales; distinguish a percentage from its underlying count. All observations and assessed tasks are newly authored."
      },
      {
        "id": "qr-mean-median-sd",
        "version": "0.1.0",
        "sourceRelativePath": "visuals/sheets/qr/qr-mean-median-sd.json",
        "sourceSha256": "9e86f7aad59769cc5e59299cb37b40b45e999a9d7f41eee8a14cee4f22969188",
        "sourceRepository": "ace-system",
        "inspectedExportSha256": "3d42da035491489dc2bb09610235de8499e8117e4b694b05b314b4e93bf304f7",
        "adaptationVersion": 1,
        "importsSourceAssessments": false,
        "formativeCanonChecksProgressEligible": false,
        "reviewScope": "Mean, ordered median and SD under uniform shifts/scalings only. Normal probabilities, empirical-rule bands, z-scores and Canon checks are not imported. Population SD is explicitly defined here."
      },
      {
        "id": "qr-distribution-comparisons",
        "version": "0.1.0",
        "sourceRelativePath": "visuals/sheets/qr/qr-distribution-comparisons.json",
        "sourceSha256": "9516dc10fdcbf7c51a7f130b1a2d9f4ebf7683a889c0bbe233e061f8015a420d",
        "sourceRepository": "ace-system",
        "inspectedExportSha256": "3d42da035491489dc2bb09610235de8499e8117e4b694b05b314b4e93bf304f7",
        "adaptationVersion": 1,
        "importsSourceAssessments": false,
        "formativeCanonChecksProgressEligible": false,
        "reviewScope": "Frequency weights, declared quartiles and min/max boxes, center versus spread and limits of summary-only inference. No source assessment, example data or source renderer is imported."
      }
    ],
    "objectives": [
      {
        "id": "qr-data-graph-interpretation",
        "world": "qr",
        "name": "Read graphical evidence with its scale and denominator",
        "lesson": "Read the title, variable, units, axis ticks and population before comparing marks. A count is a number of observations; a percentage is 100 × count ÷ the stated group total. Unequal groups can reverse the ranking of counts and percentages. A truncated vertical axis changes the visible bar lengths, not the labeled values. A percentage-point difference subtracts two percentages; percent change is (new − old) ÷ old × 100 when the old value is nonzero. For the frequency histograms in this chapter, bins have equal widths and height is a count; bin boundaries are lower-inclusive and upper-exclusive. A cumulative count below a boundary includes every earlier bin. Density histograms, whose areas rather than heights encode frequency, are outside this chapter. For a horizontal box plot, the line inside the box is the median and the box runs from Q1 to Q3; IQR = Q3 − Q1. The whiskers here show minimum and maximum. Read the same horizontal scale for both groups. A box summary alone does not determine the mean, SD, group size, exact observations or the cause of a difference.",
        "sourceUrls": [
          "https://openstax.org/books/introductory-statistics-2e/pages/2-2-histograms-frequency-polygons-and-time-series-graphs",
          "https://www.itl.nist.gov/div898/handbook/eda/section3/boxplot.htm",
          "https://openstax.org/books/introductory-statistics-2e/pages/2-3-measures-of-the-location-of-the-data"
        ],
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "qr-data-center-spread",
        "world": "qr",
        "name": "Weight observations and distinguish center from spread",
        "lesson": "A frequency tells how often a value occurs. Total count N = sum of frequencies; mean = sum(value × frequency) ÷ N. Pooled group means must be weighted by group sizes, not averaged equally unless sizes are equal. Sort all observations, including repetitions: the median is the middle value for odd N, or the average of the two middle values for even N. Range = maximum − minimum. For the complete finite populations here, variance is sum of squared deviations from the mean divided by N, and population SD is its nonnegative square root, in the original units. Sample SD instead divides by n − 1 and is not calculated here. Equal means need not imply equal spreads. Adding b to every observation shifts mean and median by b and leaves SD and range unchanged. Multiplying every observation by a multiplies the mean by a and the SD and range by |a|. A change to only one extreme observation is not a uniform shift: recompute the total and inspect middle ranks rather than moving every summary together.",
        "sourceUrls": [
          "https://openstax.org/books/introductory-statistics-2e/pages/2-5-measures-of-the-center-of-the-data",
          "https://openstax.org/books/introductory-statistics-2e/pages/2-7-measures-of-the-spread-of-the-data",
          "https://openstax.org/books/introductory-statistics-2e/pages/2-3-measures-of-the-location-of-the-data"
        ],
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      }
    ],
    "teachingByObjective": {
      "qr-data-graph-interpretation": {
        "objectiveId": "qr-data-graph-interpretation",
        "version": 1,
        "core": "Read the title, variable, units, axis ticks and population before comparing marks. A count is a number of observations; a percentage is 100 × count ÷ the stated group total. Unequal groups can reverse the ranking of counts and percentages. A truncated vertical axis changes the visible bar lengths, not the labeled values. A percentage-point difference subtracts two percentages; percent change is (new − old) ÷ old × 100 when the old value is nonzero. For the frequency histograms in this chapter, bins have equal widths and height is a count; bin boundaries are lower-inclusive and upper-exclusive. A cumulative count below a boundary includes every earlier bin. Density histograms, whose areas rather than heights encode frequency, are outside this chapter. For a horizontal box plot, the line inside the box is the median and the box runs from Q1 to Q3; IQR = Q3 − Q1. The whiskers here show minimum and maximum. Read the same horizontal scale for both groups. A box summary alone does not determine the mean, SD, group size, exact observations or the cause of a difference.",
        "terms": [
          {
            "term": "Frequency",
            "meaning": "Number of observations in a stated category or interval."
          },
          {
            "term": "Relative frequency",
            "meaning": "Frequency divided by that group’s total; multiply by 100 to express a percentage."
          },
          {
            "term": "Cumulative count",
            "meaning": "Number at or below the stated cutoff, or below it when the label says strictly below. Match the boundary convention."
          },
          {
            "term": "Median",
            "meaning": "Middle ranked observation, or mean of the two middle observations."
          },
          {
            "term": "Quartiles",
            "meaning": "Here: sort, omit the overall middle value if N is odd, then take the median of each remaining half."
          },
          {
            "term": "IQR",
            "meaning": "Q3 − Q1; the width of the box in the measured units."
          },
          {
            "term": "Min/max whiskers",
            "meaning": "Whiskers reach the smallest and largest observation. Other box-plot conventions can mark outliers separately."
          }
        ],
        "assumptions": [
          "All stated counts and percentages are exact; groups and bins are exhaustive where stated.",
          "Bins, when used, have equal widths and contain the lower endpoint but not the upper endpoint. Their vertical axis is count, not density.",
          "Box plots use supplied quartiles or the stated median-of-halves convention and a common value scale.",
          "These finite observed data do not establish a causal effect or a future population prediction."
        ],
        "workedExample": {
          "prompt": "The Observatory records a signal in 45% of 80 readings on Ridge A and 30% of 150 readings on Ridge B. Which ridge recorded more signals?",
          "steps": [
            "Identify the denominator of each percentage: A has 80 total readings; B has 150.",
            "Convert shares to counts: A has 0.45 × 80 = 36 signals; B has 0.30 × 150 = 45 signals.",
            "Compare the requested quantity, a count: 45 exceeds 36."
          ],
          "answer": "Ridge B recorded nine more signals even though its percentage was lower.",
          "familyId": "qr-data-denominator-read",
          "role": "instruction-only"
        },
        "commonMistake": "A taller percentage bar is not necessarily a larger count. Box width is IQR, not sample size or SD.",
        "nextAction": "Name the quantity and units, read the scale and denominator, and state only what those data support.",
        "sourceUrls": [
          "https://openstax.org/books/introductory-statistics-2e/pages/2-2-histograms-frequency-polygons-and-time-series-graphs",
          "https://www.itl.nist.gov/div898/handbook/eda/section3/boxplot.htm",
          "https://openstax.org/books/introductory-statistics-2e/pages/2-3-measures-of-the-location-of-the-data"
        ],
        "canon": {
          "id": "qr-reading-charts",
          "version": "0.1.0",
          "sourceRelativePath": "visuals/sheets/qr/qr-reading-charts.json",
          "sourceSha256": "0fccad018a96b93a8d9b1bd0f3b5bc64702bfbd7bf54c4dd5c7e6f225438ab3b",
          "sourceRepository": "ace-system",
          "inspectedExportSha256": "3d42da035491489dc2bb09610235de8499e8117e4b694b05b314b4e93bf304f7",
          "adaptationVersion": 1,
          "importsSourceAssessments": false,
          "formativeCanonChecksProgressEligible": false,
          "reviewScope": "Read chart labels, units and scales; distinguish a percentage from its underlying count. All observations and assessed tasks are newly authored."
        },
        "canonSources": [
          {
            "id": "qr-reading-charts",
            "version": "0.1.0",
            "sourceRelativePath": "visuals/sheets/qr/qr-reading-charts.json",
            "sourceSha256": "0fccad018a96b93a8d9b1bd0f3b5bc64702bfbd7bf54c4dd5c7e6f225438ab3b",
            "sourceRepository": "ace-system",
            "inspectedExportSha256": "3d42da035491489dc2bb09610235de8499e8117e4b694b05b314b4e93bf304f7",
            "adaptationVersion": 1,
            "importsSourceAssessments": false,
            "formativeCanonChecksProgressEligible": false,
            "reviewScope": "Read chart labels, units and scales; distinguish a percentage from its underlying count. All observations and assessed tasks are newly authored."
          },
          {
            "id": "qr-distribution-comparisons",
            "version": "0.1.0",
            "sourceRelativePath": "visuals/sheets/qr/qr-distribution-comparisons.json",
            "sourceSha256": "9516dc10fdcbf7c51a7f130b1a2d9f4ebf7683a889c0bbe233e061f8015a420d",
            "sourceRepository": "ace-system",
            "inspectedExportSha256": "3d42da035491489dc2bb09610235de8499e8117e4b694b05b314b4e93bf304f7",
            "adaptationVersion": 1,
            "importsSourceAssessments": false,
            "formativeCanonChecksProgressEligible": false,
            "reviewScope": "Frequency weights, declared quartiles and min/max boxes, center versus spread and limits of summary-only inference. No source assessment, example data or source renderer is imported."
          }
        ],
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      "qr-data-center-spread": {
        "objectiveId": "qr-data-center-spread",
        "version": 1,
        "core": "A frequency tells how often a value occurs. Total count N = sum of frequencies; mean = sum(value × frequency) ÷ N. Pooled group means must be weighted by group sizes, not averaged equally unless sizes are equal. Sort all observations, including repetitions: the median is the middle value for odd N, or the average of the two middle values for even N. Range = maximum − minimum. For the complete finite populations here, variance is sum of squared deviations from the mean divided by N, and population SD is its nonnegative square root, in the original units. Sample SD instead divides by n − 1 and is not calculated here. Equal means need not imply equal spreads. Adding b to every observation shifts mean and median by b and leaves SD and range unchanged. Multiplying every observation by a multiplies the mean by a and the SD and range by |a|. A change to only one extreme observation is not a uniform shift: recompute the total and inspect middle ranks rather than moving every summary together.",
        "terms": [
          {
            "term": "Weighted total",
            "meaning": "Multiply each value by its frequency, or each group mean by its group size, before adding."
          },
          {
            "term": "Median rank",
            "meaning": "For even N, use positions N/2 and N/2 + 1 in the sorted expanded data."
          },
          {
            "term": "Deviation",
            "meaning": "Observation minus the mean; positive and negative deviations would cancel if merely added."
          },
          {
            "term": "Population variance",
            "meaning": "Sum of all squared deviations divided by the full population count N; its units are squared."
          },
          {
            "term": "Population SD",
            "meaning": "Square root of population variance; nonnegative and in the original units."
          },
          {
            "term": "Uniform transformation",
            "meaning": "Apply exactly the same x → ax + b rule to every observation, not just to one value."
          }
        ],
        "assumptions": [
          "A frequency table lists exact values here, not interval midpoints.",
          "Every numeric SD task explicitly concerns the complete finite population, not an estimated sample SD.",
          "A larger extreme value does not automatically move the median or quartiles; inspect the sorted ranks.",
          "No normal distribution, 68–95–99.7 rule, z-score probability or causal inference is assumed."
        ],
        "workedExample": {
          "prompt": "Three readings are 4 units and one reading is 12 units. Find the mean and median.",
          "steps": [
            "Expand the observations: 4, 4, 4, 12. There are four readings, not two.",
            "Their weighted total is 3 × 4 + 1 × 12 = 24, so mean = 24 ÷ 4 = 6 units.",
            "The middle two observations are 4 and 4, so median = 4 units."
          ],
          "answer": "Mean 6 units; median 4 units. The single high value affects the total without changing the middle pair.",
          "familyId": "qr-data-frequency-center",
          "role": "instruction-only"
        },
        "commonMistake": "Averaging only distinct values gives every category the same weight. SD is not the mean, the range or an average of unsquared signed deviations.",
        "nextAction": "Count repeated observations, find the total and ordered middle, then ask whether the change moves all values together or changes their gaps.",
        "sourceUrls": [
          "https://openstax.org/books/introductory-statistics-2e/pages/2-5-measures-of-the-center-of-the-data",
          "https://openstax.org/books/introductory-statistics-2e/pages/2-7-measures-of-the-spread-of-the-data",
          "https://openstax.org/books/introductory-statistics-2e/pages/2-3-measures-of-the-location-of-the-data"
        ],
        "canon": {
          "id": "qr-mean-median-sd",
          "version": "0.1.0",
          "sourceRelativePath": "visuals/sheets/qr/qr-mean-median-sd.json",
          "sourceSha256": "9e86f7aad59769cc5e59299cb37b40b45e999a9d7f41eee8a14cee4f22969188",
          "sourceRepository": "ace-system",
          "inspectedExportSha256": "3d42da035491489dc2bb09610235de8499e8117e4b694b05b314b4e93bf304f7",
          "adaptationVersion": 1,
          "importsSourceAssessments": false,
          "formativeCanonChecksProgressEligible": false,
          "reviewScope": "Mean, ordered median and SD under uniform shifts/scalings only. Normal probabilities, empirical-rule bands, z-scores and Canon checks are not imported. Population SD is explicitly defined here."
        },
        "canonSources": [
          {
            "id": "qr-mean-median-sd",
            "version": "0.1.0",
            "sourceRelativePath": "visuals/sheets/qr/qr-mean-median-sd.json",
            "sourceSha256": "9e86f7aad59769cc5e59299cb37b40b45e999a9d7f41eee8a14cee4f22969188",
            "sourceRepository": "ace-system",
            "inspectedExportSha256": "3d42da035491489dc2bb09610235de8499e8117e4b694b05b314b4e93bf304f7",
            "adaptationVersion": 1,
            "importsSourceAssessments": false,
            "formativeCanonChecksProgressEligible": false,
            "reviewScope": "Mean, ordered median and SD under uniform shifts/scalings only. Normal probabilities, empirical-rule bands, z-scores and Canon checks are not imported. Population SD is explicitly defined here."
          },
          {
            "id": "qr-distribution-comparisons",
            "version": "0.1.0",
            "sourceRelativePath": "visuals/sheets/qr/qr-distribution-comparisons.json",
            "sourceSha256": "9516dc10fdcbf7c51a7f130b1a2d9f4ebf7683a889c0bbe233e061f8015a420d",
            "sourceRepository": "ace-system",
            "inspectedExportSha256": "3d42da035491489dc2bb09610235de8499e8117e4b694b05b314b4e93bf304f7",
            "adaptationVersion": 1,
            "importsSourceAssessments": false,
            "formativeCanonChecksProgressEligible": false,
            "reviewScope": "Frequency weights, declared quartiles and min/max boxes, center versus spread and limits of summary-only inference. No source assessment, example data or source renderer is imported."
          }
        ],
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      }
    },
    "items": [
      {
        "id": "continuation-qr-data-graph-interpretation-p1",
        "objectiveId": "qr-data-graph-interpretation",
        "world": "qr",
        "pool": "practice",
        "familyId": "qr-data-axis-read",
        "familyRationale": "Read labeled values and compare on the stated axis; changes of numbers or axis baseline remain one ordinary family.",
        "prompt": "A count chart has a vertical axis beginning at 40. The labeled bar tops are North = 48 readings and South = 56 readings. How many more readings does South have?",
        "choices": [
          "2 readings",
          "8 readings",
          "16 readings",
          "Twice as many readings"
        ],
        "answer": 1,
        "hint": "Subtract the labeled counts, not the lengths above the cropped baseline.",
        "explanation": "South has 56 − 48 = 8 more readings. Its visible bar is twice as tall above 40, but 56 is not twice 48.",
        "feedback": [
          "Two is the ratio of visible lengths, not a count difference.",
          "Correct: the labeled values differ by eight readings.",
          "Sixteen is South’s height above 40, not its excess over North.",
          "A truncated baseline does not make 56 twice 48."
        ],
        "sourceUrls": [
          "https://openstax.org/books/introductory-statistics-2e/pages/2-2-histograms-frequency-polygons-and-time-series-graphs",
          "https://www.itl.nist.gov/div898/handbook/eda/section3/boxplot.htm",
          "https://openstax.org/books/introductory-statistics-2e/pages/2-3-measures-of-the-location-of-the-data"
        ],
        "canonId": "qr-reading-charts",
        "visualCap": "Count chart, vertical axis 40 to 60 readings with ticks every 5; North 48, South 56. The displayed baseline is 40, not zero.",
        "fig": "data/figures/chapters/qr-data-axis-p1.8b4e99057cb32c35.svg",
        "figureAlt": "Count chart, vertical axis 40 to 60 readings with ticks every 5; North 48, South 56. The displayed baseline is 40, not zero.",
        "sourceId": "continuation-qr-data-graph-interpretation-p1",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "continuation-qr-data-graph-interpretation-p2",
        "objectiveId": "qr-data-graph-interpretation",
        "world": "qr",
        "pool": "practice",
        "familyId": "qr-data-denominator-read",
        "familyRationale": "Convert a within-group share to its count using that group’s denominator. Group names and sizes are ordinary variants.",
        "prompt": "A bar chart shows usable scans as a percentage of all scans: East 60% of 50 scans; West 40% of 100 scans. Which statement compares the usable counts correctly?",
        "choices": [
          "East has 20 more.",
          "East and West each have 50.",
          "West has 10 more.",
          "The counts cannot be determined."
        ],
        "answer": 2,
        "hint": "Multiply each percentage by its own group total.",
        "explanation": "East has 30 usable scans and West has 40, so West has 10 more.",
        "feedback": [
          "Twenty is the difference in percentage points, not counts.",
          "The denominators are total scans, not usable scans.",
          "Correct: 40 − 30 = 10 usable scans.",
          "Both percentages and both denominators are supplied."
        ],
        "sourceUrls": [
          "https://openstax.org/books/introductory-statistics-2e/pages/2-2-histograms-frequency-polygons-and-time-series-graphs",
          "https://www.itl.nist.gov/div898/handbook/eda/section3/boxplot.htm",
          "https://openstax.org/books/introductory-statistics-2e/pages/2-3-measures-of-the-location-of-the-data"
        ],
        "canonId": "qr-reading-charts",
        "visualCap": "Usable-scan percentages on a zero-to-100% axis: East 60%, total 50 scans; West 40%, total 100 scans.",
        "fig": "data/figures/chapters/qr-data-shares-p2.15d1830fe25937f9.svg",
        "figureAlt": "Usable-scan percentages on a zero-to-100% axis: East 60%, total 50 scans; West 40%, total 100 scans.",
        "sourceId": "continuation-qr-data-graph-interpretation-p2",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "continuation-qr-data-graph-interpretation-p3",
        "objectiveId": "qr-data-graph-interpretation",
        "world": "qr",
        "pool": "practice",
        "familyId": "qr-data-box-comparison",
        "familyRationale": "Compare supplied common-scale medians and IQRs while limiting inference to the summary.",
        "prompt": "Two min/max box plots share a scale in seconds. A: minimum 2, Q1 5, median 8, Q3 11, maximum 15. B: minimum 1, Q1 4, median 10, Q3 12, maximum 17. Which comparison is supported?",
        "choices": [
          "A has the higher mean.",
          "B has the higher median and larger IQR.",
          "B has twice as many observations.",
          "A has the higher median and larger IQR."
        ],
        "answer": 1,
        "hint": "The median is supplied. For IQR subtract Q1 from Q3 for each group.",
        "explanation": "B’s median is 10 versus 8 seconds. Its IQR is 12 − 4 = 8 seconds versus A’s 11 − 5 = 6 seconds. The box summaries do not give means or group counts.",
        "feedback": [
          "A mean cannot be recovered from these five-number summaries alone.",
          "Correct: both the median and IQR comparison follow directly.",
          "Box width on the value axis is not an observation count.",
          "Both stated comparisons are reversed."
        ],
        "sourceUrls": [
          "https://openstax.org/books/introductory-statistics-2e/pages/2-2-histograms-frequency-polygons-and-time-series-graphs",
          "https://www.itl.nist.gov/div898/handbook/eda/section3/boxplot.htm",
          "https://openstax.org/books/introductory-statistics-2e/pages/2-3-measures-of-the-location-of-the-data"
        ],
        "canonId": "qr-reading-charts",
        "visualCap": "Common scale in seconds from 0 to 20. Min, Q1, median, Q3, max: A = 2,5,8,11,15; B = 1,4,10,12,17. Whiskers show minima and maxima.",
        "fig": "data/figures/chapters/qr-data-boxes-p3.ee22823643fdcc8d.svg",
        "figureAlt": "Common scale in seconds from 0 to 20. Min, Q1, median, Q3, max: A = 2,5,8,11,15; B = 1,4,10,12,17. Whiskers show minima and maxima.",
        "sourceId": "continuation-qr-data-graph-interpretation-p3",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "continuation-qr-data-graph-interpretation-c1",
        "objectiveId": "qr-data-graph-interpretation",
        "world": "qr",
        "pool": "check",
        "familyId": "qr-data-axis-read",
        "familyRationale": "Read labeled values and compare on the stated axis; changes of numbers or axis baseline remain one ordinary family.",
        "prompt": "A sensor chart has labeled values Day 1 = 72 pulses and Day 2 = 81 pulses; its vertical axis begins at 60. What is the increase as a percentage of Day 1’s count?",
        "choices": [
          "9%",
          "75%",
          "12.5%",
          "112.5%"
        ],
        "answer": 2,
        "hint": "Compute the change in counts, then divide by the starting count rather than by the visible bar length.",
        "explanation": "The count rises by 9. Relative to Day 1 this is 9 ÷ 72 × 100 = 12.5%. The baseline 60 is not the starting count.",
        "feedback": [
          "Nine is the increase in pulses, not a percentage.",
          "Dividing 9 by the cropped bar length 12 uses the wrong baseline.",
          "Correct: the percentage increase uses the actual starting count 72.",
          "112.5% is the new count as a percentage of the old count, not the increase."
        ],
        "sourceUrls": [
          "https://openstax.org/books/introductory-statistics-2e/pages/2-2-histograms-frequency-polygons-and-time-series-graphs",
          "https://www.itl.nist.gov/div898/handbook/eda/section3/boxplot.htm",
          "https://openstax.org/books/introductory-statistics-2e/pages/2-3-measures-of-the-location-of-the-data"
        ],
        "canonId": "qr-reading-charts",
        "visualCap": "Pulses on a vertical axis beginning at 60 and ending at 90, ticks every 10: Day 1 = 72, Day 2 = 81.",
        "fig": "data/figures/chapters/qr-data-axis-c1.3800fc6d2f95ef7d.svg",
        "figureAlt": "Pulses on a vertical axis beginning at 60 and ending at 90, ticks every 10: Day 1 = 72, Day 2 = 81.",
        "sourceId": "continuation-qr-data-graph-interpretation-c1",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "continuation-qr-data-graph-interpretation-c2",
        "objectiveId": "qr-data-graph-interpretation",
        "world": "qr",
        "pool": "check",
        "familyId": "qr-data-denominator-read",
        "familyRationale": "Convert a within-group share to its count using that group’s denominator. Group names and sizes are ordinary variants.",
        "prompt": "Two complete survey groups report a positive result: Cove 35% of 200 observations; Peak 50% of 120 observations. Which statement is justified?",
        "choices": [
          "Peak has 15 more positive observations.",
          "The counts are equal.",
          "Peak has 10 more positive observations.",
          "Cove has 10 more positive observations."
        ],
        "answer": 3,
        "hint": "Percentages compare shares; multiply to compare numbers of observations.",
        "explanation": "Cove has 0.35 × 200 = 70 positives; Peak has 0.50 × 120 = 60. Cove has ten more.",
        "feedback": [
          "Fifteen is a percentage-point difference, not a count difference.",
          "The products are 70 and 60, not equal.",
          "The correct difference has the opposite direction.",
          "Correct: the larger denominator reverses the percentage ranking."
        ],
        "sourceUrls": [
          "https://openstax.org/books/introductory-statistics-2e/pages/2-2-histograms-frequency-polygons-and-time-series-graphs",
          "https://www.itl.nist.gov/div898/handbook/eda/section3/boxplot.htm",
          "https://openstax.org/books/introductory-statistics-2e/pages/2-3-measures-of-the-location-of-the-data"
        ],
        "canonId": "qr-reading-charts",
        "sourceId": "continuation-qr-data-graph-interpretation-c2",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "continuation-qr-data-graph-interpretation-c3",
        "objectiveId": "qr-data-graph-interpretation",
        "world": "qr",
        "pool": "check",
        "familyId": "qr-data-box-comparison",
        "familyRationale": "Compare supplied common-scale medians and IQRs while limiting inference to the summary.",
        "prompt": "Two groups have identical min/max box plots: minimum 3, Q1 6, median 9, Q3 13, maximum 20. Group sizes and individual observations are not supplied. What must be true?",
        "choices": [
          "They have equal medians and equal IQRs.",
          "They have identical means and SDs.",
          "They contain the same number of observations.",
          "The same process caused both distributions."
        ],
        "answer": 0,
        "hint": "Separate what the five displayed numbers fix from information the plot omits.",
        "explanation": "Both medians are 9 and both IQRs are 13 − 6 = 7. Equal box summaries do not fix means, SDs, sample sizes or causes.",
        "feedback": [
          "Correct: these two summaries are directly determined.",
          "The unreported interior values can differ while these five numbers agree.",
          "A box summary alone does not encode group size here.",
          "Descriptive summaries do not establish a cause."
        ],
        "sourceUrls": [
          "https://openstax.org/books/introductory-statistics-2e/pages/2-2-histograms-frequency-polygons-and-time-series-graphs",
          "https://www.itl.nist.gov/div898/handbook/eda/section3/boxplot.htm",
          "https://openstax.org/books/introductory-statistics-2e/pages/2-3-measures-of-the-location-of-the-data"
        ],
        "canonId": "qr-reading-charts",
        "sourceId": "continuation-qr-data-graph-interpretation-c3",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "continuation-qr-data-graph-interpretation-l1",
        "objectiveId": "qr-data-graph-interpretation",
        "world": "qr",
        "pool": "later",
        "familyId": "qr-data-cross-representation-audit",
        "familyRationale": "Reserved transfer: reconcile two different representations of the same exhaustive observations. Infer cumulative constraints from a complete frequency display, then audit a second report; ordinary tasks read one representation and do not perform this cross-report consistency decision.",
        "prompt": "All 30 observed transit times appear in the frequency histogram: [0,5) minutes has 8; [5,10) has 12; [10,15) has 10. An independent cumulative report lists the counts strictly below 5, 10 and 15 minutes, in that order. Which report could describe exactly these observations?",
        "choices": [
          "8, 12, 10",
          "8, 20, 30",
          "8, 18, 30",
          "0, 8, 20"
        ],
        "answer": 1,
        "hint": "The cumulative count at a boundary includes every bin ending at or before that boundary.",
        "explanation": "Below 5 there are 8. Below 10 there are 8 + 12 = 20. Below 15 there are all 30 observations. This checks consistency of two reports of the same data.",
        "feedback": [
          "These are separate bin counts, not cumulative counts.",
          "Correct: 8, then 8 + 12, then all 30.",
          "The middle total omits two of the first twenty observations.",
          "This shifts the cumulative totals to the wrong boundaries."
        ],
        "sourceUrls": [
          "https://openstax.org/books/introductory-statistics-2e/pages/2-2-histograms-frequency-polygons-and-time-series-graphs",
          "https://www.itl.nist.gov/div898/handbook/eda/section3/boxplot.htm",
          "https://openstax.org/books/introductory-statistics-2e/pages/2-3-measures-of-the-location-of-the-data"
        ],
        "canonId": "qr-reading-charts",
        "visualCap": "Frequency histogram of all 30 transit times. Count on vertical axis. Equal-width bins [0,5):8, [5,10):12, [10,15):10 minutes; lower endpoints included, upper excluded.",
        "fig": "data/figures/chapters/qr-data-audit-l1.ef24137fede164ef.svg",
        "figureAlt": "Frequency histogram of all 30 transit times. Count on vertical axis. Equal-width bins [0,5):8, [5,10):12, [10,15):10 minutes; lower endpoints included, upper excluded.",
        "sourceId": "continuation-qr-data-graph-interpretation-l1",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "continuation-qr-data-graph-interpretation-l2",
        "objectiveId": "qr-data-graph-interpretation",
        "world": "qr",
        "pool": "later",
        "familyId": "qr-data-cross-representation-audit",
        "familyRationale": "Reserved transfer: reconcile two different representations of the same exhaustive observations. Infer cumulative constraints from a complete frequency display, then audit a second report; ordinary tasks read one representation and do not perform this cross-report consistency decision.",
        "prompt": "All 40 measurements are shown in equal-width bins: [10,20) units has 6, [20,30) has 14, [30,40) has 20. A second report says: “strictly below 20: 6; strictly below 30: 14; strictly below 40: 40.” Which correction makes both displays agree?",
        "choices": [
          "Change below 20 to 20.",
          "Change below 40 to 20.",
          "Keep all three values.",
          "Change below 30 to 20."
        ],
        "answer": 3,
        "hint": "A separate bin count can equal a cumulative count only when no earlier observations need including.",
        "explanation": "Below 30 includes the first two bins, so it is 6 + 14 = 20. Below 20 is 6 and below 40 is 40 already.",
        "feedback": [
          "This incorrectly includes the next bin.",
          "Twenty is the last bin’s count, not the total below 40.",
          "The middle cumulative value omits the first six observations.",
          "Correct: only the middle cumulative value needs repair."
        ],
        "sourceUrls": [
          "https://openstax.org/books/introductory-statistics-2e/pages/2-2-histograms-frequency-polygons-and-time-series-graphs",
          "https://www.itl.nist.gov/div898/handbook/eda/section3/boxplot.htm",
          "https://openstax.org/books/introductory-statistics-2e/pages/2-3-measures-of-the-location-of-the-data"
        ],
        "canonId": "qr-reading-charts",
        "visualCap": "Frequency histogram of all 40 measurements. Equal-width bins [10,20):6, [20,30):14, [30,40):20 units. Heights are counts. Lower boundaries included; upper excluded.",
        "fig": "data/figures/chapters/qr-data-audit-l2.7cfcc7db853f412f.svg",
        "figureAlt": "Frequency histogram of all 40 measurements. Equal-width bins [10,20):6, [20,30):14, [30,40):20 units. Heights are counts. Lower boundaries included; upper excluded.",
        "sourceId": "continuation-qr-data-graph-interpretation-l2",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "continuation-qr-data-center-spread-p1",
        "objectiveId": "qr-data-center-spread",
        "world": "qr",
        "pool": "practice",
        "familyId": "qr-data-frequency-center",
        "familyRationale": "Use frequencies as repeated observations to calculate a forward mean or median.",
        "prompt": "An exact-value frequency table lists 2 units twice, 6 units once and 10 units once. What are the mean and median of all four observations?",
        "choices": [
          "Mean 6; median 6.",
          "Mean 5; median 4.",
          "Mean 5; median 6.",
          "Mean 4; median 5."
        ],
        "answer": 1,
        "hint": "Expand the table before choosing the two middle observations.",
        "explanation": "The values are 2, 2, 6, 10. Mean = 20 ÷ 4 = 5 units; median = (2 + 6) ÷ 2 = 4 units.",
        "feedback": [
          "This averages the three distinct labels and chooses their middle, losing repetitions.",
          "Correct: all four observations contribute.",
          "The mean is right, but the two middle values are 2 and 6.",
          "These swap the correctly calculated summaries."
        ],
        "sourceUrls": [
          "https://openstax.org/books/introductory-statistics-2e/pages/2-5-measures-of-the-center-of-the-data",
          "https://openstax.org/books/introductory-statistics-2e/pages/2-7-measures-of-the-spread-of-the-data",
          "https://openstax.org/books/introductory-statistics-2e/pages/2-3-measures-of-the-location-of-the-data"
        ],
        "canonId": "qr-mean-median-sd",
        "sourceId": "continuation-qr-data-center-spread-p1",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "continuation-qr-data-center-spread-p2",
        "objectiveId": "qr-data-center-spread",
        "world": "qr",
        "pool": "practice",
        "familyId": "qr-data-pooled-mean",
        "familyRationale": "Forward weighted combination of fully specified group sizes and means.",
        "prompt": "Three readings in batch A have mean 4 units; nine readings in batch B have mean 12 units. What is the mean of all 12 readings?",
        "choices": [
          "8 units",
          "9 units",
          "10 units",
          "16 units"
        ],
        "answer": 2,
        "hint": "Convert each group mean back to its total before combining groups.",
        "explanation": "The total is 3 × 4 + 9 × 12 = 120 units. Divide by 12 readings to obtain 10 units.",
        "feedback": [
          "Eight gives the small group and large group equal weight.",
          "Nine is a group size, not a weighted mean.",
          "Correct: 120 ÷ 12 = 10.",
          "Adding means is not pooling the observations."
        ],
        "sourceUrls": [
          "https://openstax.org/books/introductory-statistics-2e/pages/2-5-measures-of-the-center-of-the-data",
          "https://openstax.org/books/introductory-statistics-2e/pages/2-7-measures-of-the-spread-of-the-data",
          "https://openstax.org/books/introductory-statistics-2e/pages/2-3-measures-of-the-location-of-the-data"
        ],
        "canonId": "qr-mean-median-sd",
        "sourceId": "continuation-qr-data-center-spread-p2",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "continuation-qr-data-center-spread-p3",
        "objectiveId": "qr-data-center-spread",
        "world": "qr",
        "pool": "practice",
        "familyId": "qr-data-population-spread",
        "familyRationale": "Use squared deviations to compare or calculate explicit population SD.",
        "prompt": "Consider two complete populations: A = {4,4,8,8} units and B = {5,5,7,7} units. Both means are 6. Using population SD = square root of the average squared deviation, which statement is correct?",
        "choices": [
          "A has SD 4 and B has SD 1.",
          "Both have SD 0 because the signed deviations add to zero.",
          "Both have SD 2 because their means agree.",
          "A has SD 2 and B has SD 1."
        ],
        "answer": 3,
        "hint": "Square the deviations, average four squared values, then take the square root.",
        "explanation": "For A every squared deviation is 4, giving variance 4 and SD 2 units. For B every squared deviation is 1, giving variance 1 and SD 1 unit.",
        "feedback": [
          "Four is A’s variance, in squared units, not its SD.",
          "SD uses squared deviations, so opposite signs do not cancel.",
          "Equal centers do not force equal spreads.",
          "Correct: A is more dispersed around the same mean."
        ],
        "sourceUrls": [
          "https://openstax.org/books/introductory-statistics-2e/pages/2-5-measures-of-the-center-of-the-data",
          "https://openstax.org/books/introductory-statistics-2e/pages/2-7-measures-of-the-spread-of-the-data",
          "https://openstax.org/books/introductory-statistics-2e/pages/2-3-measures-of-the-location-of-the-data"
        ],
        "canonId": "qr-mean-median-sd",
        "sourceId": "continuation-qr-data-center-spread-p3",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "continuation-qr-data-center-spread-c1",
        "objectiveId": "qr-data-center-spread",
        "world": "qr",
        "pool": "check",
        "familyId": "qr-data-frequency-center",
        "familyRationale": "Use frequencies as repeated observations to calculate a forward mean or median.",
        "prompt": "An exact-value table lists 3 units with frequency 1, 7 units with frequency 3 and 11 units with frequency 2. What are the mean and median of its six observations?",
        "choices": [
          "Mean 23/3; median 7.",
          "Mean 7; median 7.",
          "Mean 23/3; median 9.",
          "Mean 46; median 7."
        ],
        "answer": 0,
        "hint": "Use all six readings. The median averages the third and fourth sorted values.",
        "explanation": "The sorted values are 3, 7, 7, 7, 11, 11. Their total is 46, mean 46/6 = 23/3 units, and both middle values are 7.",
        "feedback": [
          "Correct: weighted total 46 and middle pair 7,7.",
          "Seven averages distinct values equally and ignores the unequal frequencies.",
          "Nine averages 7 and 11, but those are not the third and fourth observations.",
          "Forty-six is the total, which still needs division by six."
        ],
        "sourceUrls": [
          "https://openstax.org/books/introductory-statistics-2e/pages/2-5-measures-of-the-center-of-the-data",
          "https://openstax.org/books/introductory-statistics-2e/pages/2-7-measures-of-the-spread-of-the-data",
          "https://openstax.org/books/introductory-statistics-2e/pages/2-3-measures-of-the-location-of-the-data"
        ],
        "canonId": "qr-mean-median-sd",
        "sourceId": "continuation-qr-data-center-spread-c1",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "continuation-qr-data-center-spread-c2",
        "objectiveId": "qr-data-center-spread",
        "world": "qr",
        "pool": "check",
        "familyId": "qr-data-uniform-transform",
        "familyRationale": "Apply a given uniform shift or scaling to center and spread; changing constants is not a new family.",
        "prompt": "Every value in a complete population is converted by y = 3x + 5. The original mean is 8 units and population SD is 2 units. What are the new mean and population SD?",
        "choices": [
          "Mean 29; SD 11.",
          "Mean 24; SD 6.",
          "Mean 29; SD 6.",
          "Mean 13; SD 2."
        ],
        "answer": 2,
        "hint": "Scaling changes deviations; adding the same offset to every value does not change them.",
        "explanation": "The new mean is 3 × 8 + 5 = 29. Each deviation from the new mean is three times its original deviation, so SD = 3 × 2 = 6.",
        "feedback": [
          "The +5 shifts all observations together and does not add five to their spread.",
          "The SD is right, but the mean must include the offset.",
          "Correct: the offset moves the center and the scale changes the spread.",
          "This applies only the offset and ignores the multiplication."
        ],
        "sourceUrls": [
          "https://openstax.org/books/introductory-statistics-2e/pages/2-5-measures-of-the-center-of-the-data",
          "https://openstax.org/books/introductory-statistics-2e/pages/2-7-measures-of-the-spread-of-the-data",
          "https://openstax.org/books/introductory-statistics-2e/pages/2-3-measures-of-the-location-of-the-data"
        ],
        "canonId": "qr-mean-median-sd",
        "sourceId": "continuation-qr-data-center-spread-c2",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "continuation-qr-data-center-spread-c3",
        "objectiveId": "qr-data-center-spread",
        "world": "qr",
        "pool": "check",
        "familyId": "qr-data-extreme-rank",
        "familyRationale": "Inspect how changing one stated extreme affects totals and middle ranks, instead of applying a uniform shift.",
        "prompt": "Five sorted readings are 2, 4, 4, 6, 9 units. Only the largest reading is corrected from 9 to 19. Which statement is correct?",
        "choices": [
          "The mean and median both increase by 10.",
          "The mean rises by 2, the median stays 4, and the range rises by 10.",
          "The mean stays 5 because only the largest value changed.",
          "The range stays 7 because the median did not move."
        ],
        "answer": 1,
        "hint": "One changed observation alters the total by 10, but there are still five observations.",
        "explanation": "The total increases from 25 to 35, so mean rises from 5 to 7. The middle (third) value stays 4. Range changes from 9 − 2 = 7 to 19 − 2 = 17.",
        "feedback": [
          "Ten is the total change, not the mean change; the middle rank stays fixed.",
          "Correct: distinguish total, middle rank and extremes.",
          "Mean uses every value, including the largest.",
          "The range uses the maximum and minimum, not the median."
        ],
        "sourceUrls": [
          "https://openstax.org/books/introductory-statistics-2e/pages/2-5-measures-of-the-center-of-the-data",
          "https://openstax.org/books/introductory-statistics-2e/pages/2-7-measures-of-the-spread-of-the-data",
          "https://openstax.org/books/introductory-statistics-2e/pages/2-3-measures-of-the-location-of-the-data"
        ],
        "canonId": "qr-mean-median-sd",
        "sourceId": "continuation-qr-data-center-spread-c3",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "continuation-qr-data-center-spread-l1",
        "objectiveId": "qr-data-center-spread",
        "world": "qr",
        "pool": "later",
        "familyId": "qr-data-reverse-aggregate",
        "familyRationale": "Reserved transfer: reconstruct an unreported component from a known aggregate and a conservation constraint. Forward means are taught, but recovering an unknown subgroup size or a replaced observation from totals is reserved for fresh transfer.",
        "prompt": "A record contains ten measurements with mean 13 units. One entry was mistakenly recorded as 25; replacing only that entry with the correct value makes the mean 11 units. What is the correct value of that entry?",
        "choices": [
          "5 units",
          "11 units",
          "23 units",
          "45 units"
        ],
        "answer": 0,
        "hint": "The change in a ten-value mean corresponds to ten times that change in the total.",
        "explanation": "The total falls from 10 × 13 = 130 to 10 × 11 = 110, a decrease of 20. The corrected entry is 25 − 20 = 5 units.",
        "feedback": [
          "Correct: replacing 25 by 5 removes the required 20 units.",
          "Eleven is the new overall mean, not necessarily one measurement.",
          "Subtracting only two changes the total by two, not twenty.",
          "Adding twenty would raise the mean instead of lowering it."
        ],
        "sourceUrls": [
          "https://openstax.org/books/introductory-statistics-2e/pages/2-5-measures-of-the-center-of-the-data",
          "https://openstax.org/books/introductory-statistics-2e/pages/2-7-measures-of-the-spread-of-the-data",
          "https://openstax.org/books/introductory-statistics-2e/pages/2-3-measures-of-the-location-of-the-data"
        ],
        "canonId": "qr-mean-median-sd",
        "sourceId": "continuation-qr-data-center-spread-l1",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "continuation-qr-data-center-spread-l2",
        "objectiveId": "qr-data-center-spread",
        "world": "qr",
        "pool": "later",
        "familyId": "qr-data-reverse-aggregate",
        "familyRationale": "Reserved transfer: reconstruct an unreported component from a known aggregate and a conservation constraint. Forward means are taught, but recovering an unknown subgroup size or a replaced observation from totals is reserved for fresh transfer.",
        "prompt": "Batch A contains 8 measurements with mean 5 units. Batch B has mean 11 units, but its number of measurements is missing. The pooled mean of A and B is exactly 9 units. How many measurements must Batch B contain?",
        "choices": [
          "4",
          "8",
          "12",
          "16"
        ],
        "answer": 3,
        "hint": "Balance the two totals against 9 times the combined number of measurements.",
        "explanation": "If B has n measurements, 8 × 5 + 11n = 9(8 + n). Thus 2n = 32 and n = 16. The larger group pulls the pooled mean closer to 11.",
        "feedback": [
          "Four would give a pooled mean of 7.",
          "Equal counts would give a mean of 8.",
          "Twelve gives 172/20 = 8.6, not 9.",
          "Correct: (40 + 176) ÷ 24 = 9."
        ],
        "sourceUrls": [
          "https://openstax.org/books/introductory-statistics-2e/pages/2-5-measures-of-the-center-of-the-data",
          "https://openstax.org/books/introductory-statistics-2e/pages/2-7-measures-of-the-spread-of-the-data",
          "https://openstax.org/books/introductory-statistics-2e/pages/2-3-measures-of-the-location-of-the-data"
        ],
        "canonId": "qr-mean-median-sd",
        "sourceId": "continuation-qr-data-center-spread-l2",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      }
    ],
    "contentSha256": "0a69afebfc92dac0a6ba4c5759e2400a98558ed3ea40253e4d933adddad9331d",
    "reviewStatus": "internal-reviewed",
    "verified": true,
    "progressEligible": true,
    "runtimeIntegrated": true,
    "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
  }
];
