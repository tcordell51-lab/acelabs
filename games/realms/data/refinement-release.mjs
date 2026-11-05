// Generated after independent review. No authoring imports or local source paths.
export const refinementRelease = {
  "refinementChapters": [
    {
      "id": "gc-atomic-crucible",
      "world": "gc",
      "title": "The Atomic Crucible",
      "scope": "Two bounded foundations: atomic/isotope/ion inventories and qualitative neutral main-group periodic size/first-ionization reasoning. Orbital filling, quantum numbers, spectra, isotope abundances, exact effective-charge calculations, electron affinity, electronegativity, ionic-radius ranking, transition elements and full subshell exception explanations remain outside this chapter.",
      "objectiveIds": [
        "gc-atomic-inventory",
        "gc-atomic-periodic-reasoning"
      ],
      "metadata": {
        "course": "GCHEM",
        "session": 4,
        "creature": "isolume",
        "stationName": "Atomic Crucible",
        "pathVariant": 2,
        "chapterTheme": "gc",
        "creatureDescriptor": {
          "id": "isolume",
          "name": "Isolume",
          "type": "forge",
          "color": "#edb865",
          "bodyPlan": "shell-winged-firefly",
          "concept": "Atomic identity, isotope and ion accounting; bounded periodic reasoning",
          "evolutions": [
            "Isolume",
            "Orbelyte",
            "Nucleora"
          ],
          "rareName": "Celestial Nucleora",
          "blurb": "A warm amber firefly lights the Crucible’s inventory shelves. Its decorative layered wings guide your eye from a labeled nucleus to the outer electron cloud; they are not a literal atomic model."
        },
        "topicMappings": {
          "screenshotTopicIds": [
            "bootcamp-general-chemistry-2",
            "bootcamp-general-chemistry-4"
          ],
          "officialOnlyTopicIds": []
        },
        "instructionFamilyIds": [
          "discovery-gc-atomic-crucible",
          "gc-atomic-single-species-ledger",
          "gc-atomic-isotope-versus-ion",
          "gc-atomic-same-period-comparison",
          "gc-atomic-down-group-comparison",
          "gc-atomic-ionization-definition"
        ]
      },
      "canonSources": [
        {
          "id": "gc-isotopes-ions",
          "version": "0.1.0",
          "sourceRelativePath": "visuals/sheets/gchem/gc-isotopes-ions.json",
          "sourceSha256": "aefa4db0215223859ab6cfe356dd3df6e2632bc8da78b1e8b551f387572d512e",
          "sourceRepository": "ace-system",
          "inspectedExportSha256": "53c2a6951e84c369d1e075d6c64e4672ea60bd35f29d01865d940019d02a391e",
          "adaptationVersion": 1,
          "importsSourceAssessments": false,
          "formativeCanonChecksProgressEligible": false,
          "reviewScope": "Particle identity, mass-number and charge bookkeeping only. Average mass, isotope abundance and Canon assessments are not imported."
        },
        {
          "id": "gc-periodic-trends",
          "version": "0.2.1",
          "sourceRelativePath": "visuals/sheets/gchem/gc-periodic-trends.json",
          "sourceSha256": "171ef383a767f9627eb8a70ec7e03ce8d3e9c8124b975a31dc2bd3dc240a9fbf",
          "sourceRepository": "ace-system",
          "inspectedExportSha256": "53c2a6951e84c369d1e075d6c64e4672ea60bd35f29d01865d940019d02a391e",
          "adaptationVersion": 1,
          "importsSourceAssessments": false,
          "formativeCanonChecksProgressEligible": false,
          "reviewScope": "Qualitative neutral main-group radius and first-ionization comparisons. Corrected wording: screening is not exactly a core-electron subtraction, and trend arrows do not rank every adjacent IE pair. No numeric radius table, electron-affinity rule or source assessment is imported."
        }
      ],
      "objectives": [
        {
          "id": "gc-atomic-inventory",
          "world": "gc",
          "name": "Separate atomic identity, isotope and ion charge",
          "lesson": "Read three independent labels. Atomic number Z is the proton count p. Mass number A counts protons plus neutrons, so n = A − Z; it is not a measured atomic mass in u. Signed charge q, in elementary-charge units, is p − e, so e = Z − q. An ordinary gain or loss of electrons changes q without changing the nucleus. Isotopes share Z and differ in neutron count; two isotopes need not have the same charge. Keep a separate inventory for each species before combining a collection.",
          "sourceUrls": [
            "https://openstax.org/books/chemistry-2e/pages/2-3-atomic-structure-and-symbolism"
          ],
          "reviewStatus": "internal-reviewed",
          "verified": true,
          "progressEligible": true,
          "runtimeIntegrated": true,
          "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
        },
        {
          "id": "gc-atomic-periodic-reasoning",
          "world": "gc",
          "name": "Explain bounded periodic size and first-ionization comparisons",
          "lesson": "For the neutral ground-state main-group atoms used here, covalent radius generally decreases across a period as the effective attraction on valence electrons grows, and increases down a group as the occupied outer shell extends farther from the nucleus. Screening describes how other electrons reduce nuclear attraction; it is not exactly Z minus a count of core electrons. First ionization energy is the energy needed to remove one electron from an isolated gaseous neutral atom. It generally rises across a period and falls down a group, but subshell and pairing effects create exceptions. Use the stated comparisons or supplied evidence; an arrow alone does not rank every pair. Atomic radius has several definitions: this chapter uses qualitative covalent-radius comparisons and schematic drawings, not measured radii.",
          "sourceUrls": [
            "https://openstax.org/books/chemistry-2e/pages/6-5-periodic-variations-in-element-properties"
          ],
          "reviewStatus": "internal-reviewed",
          "verified": true,
          "progressEligible": true,
          "runtimeIntegrated": true,
          "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
        }
      ],
      "teachingByObjective": {
        "gc-atomic-inventory": {
          "objectiveId": "gc-atomic-inventory",
          "version": 1,
          "core": "Read three independent labels. Atomic number Z is the proton count p. Mass number A counts protons plus neutrons, so n = A − Z; it is not a measured atomic mass in u. Signed charge q, in elementary-charge units, is p − e, so e = Z − q. An ordinary gain or loss of electrons changes q without changing the nucleus. Isotopes share Z and differ in neutron count; two isotopes need not have the same charge. Keep a separate inventory for each species before combining a collection.",
          "terms": [
            {
              "term": "Proton",
              "meaning": "Nuclear particle with charge +1; its count fixes the element."
            },
            {
              "term": "Neutron",
              "meaning": "Uncharged nuclear particle; changes in its count distinguish isotopes of an element."
            },
            {
              "term": "Electron",
              "meaning": "Particle with charge −1 outside the nucleus."
            },
            {
              "term": "Signed charge q",
              "meaning": "Protons minus electrons; −1 means one more electron than protons."
            },
            {
              "term": "Isotope",
              "meaning": "A species with a specified proton and neutron inventory."
            }
          ],
          "assumptions": [
            "These are single atomic species, not molecules.",
            "Ordinary ionization changes electrons only; no nuclear process is taking place.",
            "Mass number is a particle count, not an isotope mass or an abundance-weighted average."
          ],
          "workedExample": {
            "prompt": "An isolated bromine-81 ion has Z = 35 and charge −1. Inventory its protons, neutrons and electrons.",
            "steps": [
              "Keep p = Z = 35.",
              "Subtract protons from mass number: n = 81 − 35 = 46.",
              "Use the signed charge: e = 35 − (−1) = 36. Check 35 − 36 = −1."
            ],
            "answer": "35 protons, 46 neutrons and 36 electrons.",
            "familyId": "gc-atomic-single-species-ledger",
            "role": "instruction-only"
          },
          "commonMistake": "A positive ion has fewer electrons, not more protons. Mass number includes protons as well as neutrons.",
          "nextAction": "Write p, n and e in separate rows, then verify both p + n = A and p − e = q.",
          "sourceUrls": [
            "https://openstax.org/books/chemistry-2e/pages/2-3-atomic-structure-and-symbolism"
          ],
          "canon": {
            "id": "gc-isotopes-ions",
            "version": "0.1.0",
            "sourceRelativePath": "visuals/sheets/gchem/gc-isotopes-ions.json",
            "sourceSha256": "aefa4db0215223859ab6cfe356dd3df6e2632bc8da78b1e8b551f387572d512e",
            "sourceRepository": "ace-system",
            "inspectedExportSha256": "53c2a6951e84c369d1e075d6c64e4672ea60bd35f29d01865d940019d02a391e",
            "adaptationVersion": 1,
            "importsSourceAssessments": false,
            "formativeCanonChecksProgressEligible": false,
            "reviewScope": "Particle identity, mass-number and charge bookkeeping only. Average mass, isotope abundance and Canon assessments are not imported."
          },
          "reviewStatus": "internal-reviewed",
          "verified": true,
          "progressEligible": true,
          "runtimeIntegrated": true,
          "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
        },
        "gc-atomic-periodic-reasoning": {
          "objectiveId": "gc-atomic-periodic-reasoning",
          "version": 1,
          "core": "For the neutral ground-state main-group atoms used here, covalent radius generally decreases across a period as the effective attraction on valence electrons grows, and increases down a group as the occupied outer shell extends farther from the nucleus. Screening describes how other electrons reduce nuclear attraction; it is not exactly Z minus a count of core electrons. First ionization energy is the energy needed to remove one electron from an isolated gaseous neutral atom. It generally rises across a period and falls down a group, but subshell and pairing effects create exceptions. Use the stated comparisons or supplied evidence; an arrow alone does not rank every pair. Atomic radius has several definitions: this chapter uses qualitative covalent-radius comparisons and schematic drawings, not measured radii.",
          "terms": [
            {
              "term": "Period",
              "meaning": "A row of the periodic table."
            },
            {
              "term": "Group",
              "meaning": "A column of the periodic table."
            },
            {
              "term": "Valence shell",
              "meaning": "The outer occupied electron shell of the main-group atom."
            },
            {
              "term": "Screening",
              "meaning": "Reduction of nuclear attraction experienced by an electron because other electrons are present."
            },
            {
              "term": "Covalent radius",
              "meaning": "One radius convention based on distances between bonded atoms."
            },
            {
              "term": "First ionization energy",
              "meaning": "Energy required for X(g) → X⁺(g) + e⁻, starting with an isolated gaseous neutral atom."
            }
          ],
          "assumptions": [
            "Only the named neutral ground-state main-group comparisons are asserted.",
            "Covalent radius and a schematic cloud outline are not a hard physical surface.",
            "First ionization energy is not electron affinity, electronegativity or removal from an already charged ion.",
            "Subshell and pairing exceptions mean that increasing Z does not guarantee an increase at every IE step."
          ],
          "workedExample": {
            "prompt": "Compare neutral Li and Na in group 1: which has the larger covalent radius and which takes more energy for the first electron removal?",
            "steps": [
              "Na has its outer electron in a shell with a higher principal number than Li.",
              "The down-group size trend puts Na above Li in covalent radius.",
              "For this group-1 pair, the more distant outer electron of Na is easier to remove."
            ],
            "answer": "Na has the larger radius; Li has the higher first ionization energy.",
            "familyId": "gc-atomic-down-group-comparison",
            "role": "instruction-only"
          },
          "commonMistake": "Do not make proton count a size rule, or turn a general IE trend into a universal law.",
          "nextAction": "First name the species and the property; then compare shell level and effective attraction within the stated scope.",
          "sourceUrls": [
            "https://openstax.org/books/chemistry-2e/pages/6-5-periodic-variations-in-element-properties"
          ],
          "canon": {
            "id": "gc-periodic-trends",
            "version": "0.2.1",
            "sourceRelativePath": "visuals/sheets/gchem/gc-periodic-trends.json",
            "sourceSha256": "171ef383a767f9627eb8a70ec7e03ce8d3e9c8124b975a31dc2bd3dc240a9fbf",
            "sourceRepository": "ace-system",
            "inspectedExportSha256": "53c2a6951e84c369d1e075d6c64e4672ea60bd35f29d01865d940019d02a391e",
            "adaptationVersion": 1,
            "importsSourceAssessments": false,
            "formativeCanonChecksProgressEligible": false,
            "reviewScope": "Qualitative neutral main-group radius and first-ionization comparisons. Corrected wording: screening is not exactly a core-electron subtraction, and trend arrows do not rank every adjacent IE pair. No numeric radius table, electron-affinity rule or source assessment is imported."
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
          "id": "refinement-gc-atomic-inventory-p1",
          "objectiveId": "gc-atomic-inventory",
          "world": "gc",
          "pool": "practice",
          "familyId": "gc-atomic-single-species-ledger",
          "familyRationale": "One-species bookkeeping from Z, A and signed charge. Changed elements, numbers or direction of solving do not create a new family.",
          "prompt": "A calcium-44 atomic ion is specified by Z = 20 and q = +2. Which inventory (protons, neutrons, electrons) satisfies both labels?",
          "choices": [
            "(20, 24, 18)",
            "(20, 44, 22)",
            "(18, 26, 20)",
            "(20, 24, 22)"
          ],
          "answer": 0,
          "hint": "Find neutrons from A − Z and use e = Z − q.",
          "explanation": "The nucleus contains 20 protons and 44 − 20 = 24 neutrons. Its +2 charge means 18 electrons.",
          "feedback": [
            "Correct: 20 + 24 = 44 and 20 − 18 = +2.",
            "Mass number is not the neutron count, and extra electrons would make a negative ion.",
            "The proton count must remain Z = 20.",
            "Twenty-two electrons would give q = −2."
          ],
          "sourceUrls": [
            "https://openstax.org/books/chemistry-2e/pages/2-3-atomic-structure-and-symbolism"
          ],
          "canonId": "gc-isotopes-ions",
          "sourceId": "refinement-gc-atomic-inventory-p1",
          "sourceVersion": "dat-continuation-item-v1",
          "reviewStatus": "internal-reviewed",
          "verified": true,
          "progressEligible": true,
          "runtimeIntegrated": true,
          "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
        },
        {
          "id": "refinement-gc-atomic-inventory-p2",
          "objectiveId": "gc-atomic-inventory",
          "world": "gc",
          "pool": "practice",
          "familyId": "gc-atomic-single-species-ledger",
          "familyRationale": "One-species bookkeeping from Z, A and signed charge. Changed elements, numbers or direction of solving do not create a new family.",
          "prompt": "An isolated oxygen-17 species has Z = 8 and nine electrons. What are its neutron count and signed charge?",
          "choices": [
            "9 neutrons, +1",
            "8 neutrons, −1",
            "9 neutrons, −1",
            "17 neutrons, 0"
          ],
          "answer": 2,
          "hint": "Mass number determines neutrons; subtract electrons from protons for charge.",
          "explanation": "Neutrons are 17 − 8 = 9. Charge is 8 − 9 = −1.",
          "feedback": [
            "The neutron count is right, but one extra electron makes the charge negative.",
            "Eight is the proton count; mass number requires nine neutrons.",
            "Correct: the mass and charge checks both hold.",
            "Seventeen includes the protons, and nine electrons do not balance eight protons."
          ],
          "sourceUrls": [
            "https://openstax.org/books/chemistry-2e/pages/2-3-atomic-structure-and-symbolism"
          ],
          "canonId": "gc-isotopes-ions",
          "sourceId": "refinement-gc-atomic-inventory-p2",
          "sourceVersion": "dat-continuation-item-v1",
          "reviewStatus": "internal-reviewed",
          "verified": true,
          "progressEligible": true,
          "runtimeIntegrated": true,
          "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
        },
        {
          "id": "refinement-gc-atomic-inventory-p3",
          "objectiveId": "gc-atomic-inventory",
          "world": "gc",
          "pool": "practice",
          "familyId": "gc-atomic-isotope-versus-ion",
          "familyRationale": "Distinguish isotope identity from charge by comparing nuclear and electron inventories; ordinary teaching explicitly includes this relationship.",
          "prompt": "Two isolated silicon species both have 14 protons and 10 electrons. One has 14 neutrons and the other 16. Which description is justified?",
          "choices": [
            "Different elements with the same charge",
            "Isotopes with the same +4 charge",
            "The same isotope with different charges",
            "Isotopes with charges +2 and +4"
          ],
          "answer": 1,
          "hint": "Element identity and isotope identity belong to the nucleus; check charge separately.",
          "explanation": "Both nuclei have Z = 14, but their neutron counts differ. Both have q = 14 − 10 = +4.",
          "feedback": [
            "Equal proton counts mean the same element.",
            "Correct: different neutron inventories identify two isotopes, while charge is unchanged.",
            "The neutron change makes them different isotopes.",
            "The neutron count does not change the charge."
          ],
          "sourceUrls": [
            "https://openstax.org/books/chemistry-2e/pages/2-3-atomic-structure-and-symbolism"
          ],
          "canonId": "gc-isotopes-ions",
          "sourceId": "refinement-gc-atomic-inventory-p3",
          "sourceVersion": "dat-continuation-item-v1",
          "reviewStatus": "internal-reviewed",
          "verified": true,
          "progressEligible": true,
          "runtimeIntegrated": true,
          "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
        },
        {
          "id": "refinement-gc-atomic-inventory-c1",
          "objectiveId": "gc-atomic-inventory",
          "world": "gc",
          "pool": "check",
          "familyId": "gc-atomic-single-species-ledger",
          "familyRationale": "One-species bookkeeping from Z, A and signed charge. Changed elements, numbers or direction of solving do not create a new family.",
          "prompt": "An isolated sulfur-33 atomic ion has 16 protons and charge −2. Which pair is its neutron count and electron count?",
          "choices": [
            "17 neutrons and 14 electrons",
            "33 neutrons and 18 electrons",
            "16 neutrons and 18 electrons",
            "17 neutrons and 18 electrons"
          ],
          "answer": 3,
          "hint": "Do not let the negative charge change the nuclear inventory.",
          "explanation": "The neutron count is 33 − 16 = 17. A −2 ion has two more electrons than protons: 18.",
          "feedback": [
            "Fourteen electrons would give +2.",
            "Thirty-three is the total nucleon count.",
            "Sixteen is the proton count, not 33 − 16.",
            "Correct: 16 + 17 = 33 and 16 − 18 = −2."
          ],
          "sourceUrls": [
            "https://openstax.org/books/chemistry-2e/pages/2-3-atomic-structure-and-symbolism"
          ],
          "canonId": "gc-isotopes-ions",
          "sourceId": "refinement-gc-atomic-inventory-c1",
          "sourceVersion": "dat-continuation-item-v1",
          "reviewStatus": "internal-reviewed",
          "verified": true,
          "progressEligible": true,
          "runtimeIntegrated": true,
          "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
        },
        {
          "id": "refinement-gc-atomic-inventory-c2",
          "objectiveId": "gc-atomic-inventory",
          "world": "gc",
          "pool": "check",
          "familyId": "gc-atomic-single-species-ledger",
          "familyRationale": "One-species bookkeeping from Z, A and signed charge. Changed elements, numbers or direction of solving do not create a new family.",
          "prompt": "A neutral argon-38 atom (Z = 18) loses one electron. No nuclear process occurs. Which inventory describes the resulting isolated species?",
          "choices": [
            "18 protons, 20 neutrons, 17 electrons",
            "17 protons, 21 neutrons, 18 electrons",
            "18 protons, 19 neutrons, 18 electrons",
            "18 protons, 20 neutrons, 19 electrons"
          ],
          "answer": 0,
          "hint": "An ordinary electron loss leaves the nucleus intact.",
          "explanation": "The nucleus retains 18 protons and 20 neutrons. Seventeen electrons remain, giving charge +1.",
          "feedback": [
            "Correct: only the electron count decreased.",
            "Losing an electron does not remove a proton or add a neutron.",
            "Neither nuclear count changes in this process.",
            "Nineteen electrons would represent an electron gain."
          ],
          "sourceUrls": [
            "https://openstax.org/books/chemistry-2e/pages/2-3-atomic-structure-and-symbolism"
          ],
          "canonId": "gc-isotopes-ions",
          "sourceId": "refinement-gc-atomic-inventory-c2",
          "sourceVersion": "dat-continuation-item-v1",
          "reviewStatus": "internal-reviewed",
          "verified": true,
          "progressEligible": true,
          "runtimeIntegrated": true,
          "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
        },
        {
          "id": "refinement-gc-atomic-inventory-c3",
          "objectiveId": "gc-atomic-inventory",
          "world": "gc",
          "pool": "check",
          "familyId": "gc-atomic-isotope-versus-ion",
          "familyRationale": "Distinguish isotope identity from charge by comparing nuclear and electron inventories; ordinary teaching explicitly includes this relationship.",
          "prompt": "Species R has (p, n, e) = (6, 7, 6). Species S has (6, 8, 7). Which statement follows from these inventories?",
          "choices": [
            "R and S are different elements because their mass numbers differ.",
            "R and S are the same isotope because their proton counts agree.",
            "R and S are isotopes; R is neutral and S has charge −1.",
            "R and S are isotopes; both are neutral."
          ],
          "answer": 2,
          "hint": "Use proton and neutron rows to classify isotopes, then calculate each charge.",
          "explanation": "The equal proton counts identify carbon. Their neutron counts differ, so they are different isotopes. The charges are 6 − 6 = 0 and 6 − 7 = −1.",
          "feedback": [
            "Element identity follows proton count, not mass number.",
            "An isotope requires a specified neutron count too.",
            "Correct: isotope relationship and charge are separate statements.",
            "S has one more electron than proton."
          ],
          "sourceUrls": [
            "https://openstax.org/books/chemistry-2e/pages/2-3-atomic-structure-and-symbolism"
          ],
          "canonId": "gc-isotopes-ions",
          "sourceId": "refinement-gc-atomic-inventory-c3",
          "sourceVersion": "dat-continuation-item-v1",
          "reviewStatus": "internal-reviewed",
          "verified": true,
          "progressEligible": true,
          "runtimeIntegrated": true,
          "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
        },
        {
          "id": "refinement-gc-atomic-inventory-l1",
          "objectiveId": "gc-atomic-inventory",
          "world": "gc",
          "pool": "later",
          "familyId": "gc-atomic-aggregate-inventory-audit",
          "familyRationale": "Reserved transfer: combine separately specified atomic species into one finite inventory, keeping total nuclear charge, electron count and net collection charge distinct. This is an aggregate ledger audit, not another single-species numerical variant. No bonding, stability or reaction mechanism is inferred.",
          "prompt": "A nonreacting collection contains two isolated X ions with Z = 12, A = 25 and q = +2 each, plus one isolated Y ion with Z = 8, A = 18 and q = −1. No electrons are shared between the species. Which totals are consistent for the collection?",
          "choices": [
            "32 protons, 36 neutrons, 29 electrons; net charge +3",
            "32 protons, 36 neutrons, 35 electrons; net charge +3",
            "32 protons, 68 neutrons, 29 electrons; net charge +3",
            "20 protons, 23 neutrons, 19 electrons; net charge +1"
          ],
          "answer": 0,
          "hint": "Make one row per species, multiply each row by how many are present, then check total p − total e.",
          "explanation": "Each X contributes (12,13,10), and Y contributes (8,10,9). The totals are (32,36,29), and 32 − 29 = +3, also equal to +2 +2 −1.",
          "feedback": [
            "Correct: both the particle totals and summed charges agree.",
            "Thirty-five electrons would give charge −3, not +3.",
            "Sixty-eight is the summed mass number, which includes the 32 protons.",
            "These totals count only one X instead of two."
          ],
          "sourceUrls": [
            "https://openstax.org/books/chemistry-2e/pages/2-3-atomic-structure-and-symbolism"
          ],
          "canonId": "gc-isotopes-ions",
          "sourceId": "refinement-gc-atomic-inventory-l1",
          "sourceVersion": "dat-continuation-item-v1",
          "reviewStatus": "internal-reviewed",
          "verified": true,
          "progressEligible": true,
          "runtimeIntegrated": true,
          "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
        },
        {
          "id": "refinement-gc-atomic-inventory-l2",
          "objectiveId": "gc-atomic-inventory",
          "world": "gc",
          "pool": "later",
          "familyId": "gc-atomic-aggregate-inventory-audit",
          "familyRationale": "Reserved transfer: combine separately specified atomic species into one finite inventory, keeping total nuclear charge, electron count and net collection charge distinct. This is an aggregate ledger audit, not another single-species numerical variant. No bonding, stability or reaction mechanism is inferred.",
          "prompt": "A nonreacting packet contains one isolated species with Z = 13, A = 27, q = +3 and two isolated species with Z = 9, A = 19, q = −1 each. A ledger claims that the packet has net charge +1. Which electron and neutron totals make that claim consistent?",
          "choices": [
            "32 electrons and 34 neutrons",
            "30 electrons and 65 neutrons",
            "31 electrons and 34 neutrons",
            "30 electrons and 34 neutrons"
          ],
          "answer": 3,
          "hint": "Count all three species and test whether total protons minus total electrons equals +1.",
          "explanation": "The species contribute (13,14,10) and twice (9,10,10). Totals are 31 protons, 34 neutrons and 30 electrons, giving charge +1.",
          "feedback": [
            "Thirty-two electrons would give net charge −1.",
            "Sixty-five is the summed mass number, not neutrons alone.",
            "Thirty-one electrons would make the packet neutral.",
            "Correct: 31 − 30 = +1 and 14 + 2 × 10 = 34 neutrons."
          ],
          "sourceUrls": [
            "https://openstax.org/books/chemistry-2e/pages/2-3-atomic-structure-and-symbolism"
          ],
          "canonId": "gc-isotopes-ions",
          "sourceId": "refinement-gc-atomic-inventory-l2",
          "sourceVersion": "dat-continuation-item-v1",
          "reviewStatus": "internal-reviewed",
          "verified": true,
          "progressEligible": true,
          "runtimeIntegrated": true,
          "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
        },
        {
          "id": "refinement-gc-atomic-periodic-reasoning-p1",
          "objectiveId": "gc-atomic-periodic-reasoning",
          "world": "gc",
          "pool": "practice",
          "familyId": "gc-atomic-same-period-comparison",
          "familyRationale": "Explain a named same-period neutral main-group comparison; changing element names is not new-family evidence.",
          "prompt": "Neutral Na and Cl are in period 3. Which explanation supports Cl having the smaller covalent radius?",
          "choices": [
            "Cl has fewer occupied principal shells than Na.",
            "Across this period, greater effective attraction draws the valence electrons inward.",
            "Each additional proton directly adds a larger layer to the atom.",
            "Cl has no electrons because it is a nonmetal."
          ],
          "answer": 1,
          "hint": "Both atoms have outer electrons in the same principal shell; compare attraction.",
          "explanation": "Both use the third principal shell for valence electrons. The general across-period increase in effective nuclear attraction supports a smaller covalent radius for Cl.",
          "feedback": [
            "They are in the same period; this is not a missing-shell explanation.",
            "Correct: increasing effective attraction is the relevant comparison.",
            "Protons attract electrons; their count is not an atomic size ruler.",
            "A neutral Cl atom has 17 electrons."
          ],
          "sourceUrls": [
            "https://openstax.org/books/chemistry-2e/pages/6-5-periodic-variations-in-element-properties"
          ],
          "canonId": "gc-periodic-trends",
          "sourceId": "refinement-gc-atomic-periodic-reasoning-p1",
          "sourceVersion": "dat-continuation-item-v1",
          "reviewStatus": "internal-reviewed",
          "verified": true,
          "progressEligible": true,
          "runtimeIntegrated": true,
          "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
        },
        {
          "id": "refinement-gc-atomic-periodic-reasoning-p2",
          "objectiveId": "gc-atomic-periodic-reasoning",
          "world": "gc",
          "pool": "practice",
          "familyId": "gc-atomic-down-group-comparison",
          "familyRationale": "Explain a named same-group comparison using the outer-shell level; size and first-ionization variants remain the same ordinary family.",
          "prompt": "Neutral Mg and Ca are in group 2, with Ca below Mg. Which statement correctly compares their covalent radii?",
          "choices": [
            "Mg is larger because it has fewer electrons.",
            "They must be equal because they share a group.",
            "Ca is larger; its outer occupied shell is at a higher principal level.",
            "Ca is smaller solely because it has more protons."
          ],
          "answer": 2,
          "hint": "A shared group does not mean a shared outer-shell level.",
          "explanation": "The down-group radius trend gives Ca the larger covalent radius. Its outer valence shell is more extended; proton count alone does not settle size.",
          "feedback": [
            "Electron number alone does not make the smaller atom larger.",
            "The outer-shell level changes down the group.",
            "Correct: the additional shell level explains this comparison.",
            "Ignoring the shell change reverses the observed trend."
          ],
          "sourceUrls": [
            "https://openstax.org/books/chemistry-2e/pages/6-5-periodic-variations-in-element-properties"
          ],
          "canonId": "gc-periodic-trends",
          "sourceId": "refinement-gc-atomic-periodic-reasoning-p2",
          "sourceVersion": "dat-continuation-item-v1",
          "reviewStatus": "internal-reviewed",
          "verified": true,
          "progressEligible": true,
          "runtimeIntegrated": true,
          "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
        },
        {
          "id": "refinement-gc-atomic-periodic-reasoning-p3",
          "objectiveId": "gc-atomic-periodic-reasoning",
          "world": "gc",
          "pool": "practice",
          "familyId": "gc-atomic-down-group-comparison",
          "familyRationale": "Explain a named same-group comparison using the outer-shell level; size and first-ionization variants remain the same ordinary family.",
          "prompt": "For isolated gaseous neutral Li and Na, which atom needs more energy for the first electron removal?",
          "choices": [
            "Li; Na’s valence electron occupies a more distant outer shell.",
            "Na; every extra proton must increase first ionization energy.",
            "Equal energy, because both are neutral.",
            "Neither requires energy, because both are metals."
          ],
          "answer": 0,
          "hint": "First ionization begins with a neutral gaseous atom, not with a bond or an already charged ion.",
          "explanation": "For this group-1 pair, Li has the higher first ionization energy. The outer electron of Na is more distant and more screened.",
          "feedback": [
            "Correct: the down-group shell change makes Na easier to ionize.",
            "Greater nuclear charge alone ignores screening and shell level.",
            "Neutrality does not make electron binding energies equal.",
            "Removing an electron from these ground-state atoms requires energy."
          ],
          "sourceUrls": [
            "https://openstax.org/books/chemistry-2e/pages/6-5-periodic-variations-in-element-properties"
          ],
          "canonId": "gc-periodic-trends",
          "sourceId": "refinement-gc-atomic-periodic-reasoning-p3",
          "sourceVersion": "dat-continuation-item-v1",
          "reviewStatus": "internal-reviewed",
          "verified": true,
          "progressEligible": true,
          "runtimeIntegrated": true,
          "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
        },
        {
          "id": "refinement-gc-atomic-periodic-reasoning-c1",
          "objectiveId": "gc-atomic-periodic-reasoning",
          "world": "gc",
          "pool": "check",
          "familyId": "gc-atomic-same-period-comparison",
          "familyRationale": "Explain a named same-period neutral main-group comparison; changing element names is not new-family evidence.",
          "prompt": "Neutral C and F are in period 2. A student says F must be larger because its nucleus contains more protons. Which correction is best?",
          "choices": [
            "F has a larger radius because its mass is higher.",
            "C and F have the same radius because their outer principal shell is the same.",
            "F has no electron screening.",
            "F has the smaller covalent radius; the across-period effective attraction is greater."
          ],
          "answer": 3,
          "hint": "More protons can pull an electron distribution inward rather than add an outer shell.",
          "explanation": "For this same-period pair, the covalent-radius trend decreases toward F. Screening is present, but the effective attraction grows across the period.",
          "feedback": [
            "Mass is not the governing size comparison here.",
            "Same shell level does not make the effective attractions equal.",
            "Other electrons still screen nuclear attraction.",
            "Correct: the proton-count argument had the effect backwards."
          ],
          "sourceUrls": [
            "https://openstax.org/books/chemistry-2e/pages/6-5-periodic-variations-in-element-properties"
          ],
          "canonId": "gc-periodic-trends",
          "sourceId": "refinement-gc-atomic-periodic-reasoning-c1",
          "sourceVersion": "dat-continuation-item-v1",
          "reviewStatus": "internal-reviewed",
          "verified": true,
          "progressEligible": true,
          "runtimeIntegrated": true,
          "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
        },
        {
          "id": "refinement-gc-atomic-periodic-reasoning-c2",
          "objectiveId": "gc-atomic-periodic-reasoning",
          "world": "gc",
          "pool": "check",
          "familyId": "gc-atomic-down-group-comparison",
          "familyRationale": "Explain a named same-group comparison using the outer-shell level; size and first-ionization variants remain the same ordinary family.",
          "prompt": "Compare isolated gaseous neutral Na and K, both in group 1. Which pairing is correct?",
          "choices": [
            "K has smaller radius and higher first ionization energy.",
            "K has larger radius and lower first ionization energy.",
            "K has larger radius and higher first ionization energy solely because Z is larger.",
            "The two atoms must have identical radii and first ionization energies."
          ],
          "answer": 1,
          "hint": "Down this group, the outer electron occupies a higher principal shell.",
          "explanation": "K has the larger covalent radius and the lower first ionization energy. Its more extended outer electron is easier to remove.",
          "feedback": [
            "Both comparisons are reversed.",
            "Correct: this combines the two down-group comparisons.",
            "The argument ignores the change in shell level and screening.",
            "Sharing a valence pattern does not make the properties identical."
          ],
          "sourceUrls": [
            "https://openstax.org/books/chemistry-2e/pages/6-5-periodic-variations-in-element-properties"
          ],
          "canonId": "gc-periodic-trends",
          "sourceId": "refinement-gc-atomic-periodic-reasoning-c2",
          "sourceVersion": "dat-continuation-item-v1",
          "reviewStatus": "internal-reviewed",
          "verified": true,
          "progressEligible": true,
          "runtimeIntegrated": true,
          "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
        },
        {
          "id": "refinement-gc-atomic-periodic-reasoning-c3",
          "objectiveId": "gc-atomic-periodic-reasoning",
          "world": "gc",
          "pool": "check",
          "familyId": "gc-atomic-ionization-definition",
          "familyRationale": "Interpret the first-ionization process and distinguish it from other electron-energy quantities; this definition is explicitly taught.",
          "prompt": "Which process defines the first ionization energy of atom X?",
          "choices": [
            "X(g) → X⁺(g) + e⁻, starting with a neutral gaseous atom",
            "X⁺(g) → X²⁺(g) + e⁻",
            "X(g) + e⁻ → X⁻(g)",
            "X(s) → X(g) without changing electron count"
          ],
          "answer": 0,
          "hint": "The word first describes removal from the neutral gaseous atom.",
          "explanation": "First ionization removes one electron from X(g). Removal from X⁺ is a second ionization, electron addition concerns electron affinity, and phase change alone is not ionization.",
          "feedback": [
            "Correct: species, phase and electron direction all match.",
            "This starts from a cation and defines a later ionization.",
            "This adds an electron rather than removing one.",
            "This describes a phase change with no ionization."
          ],
          "sourceUrls": [
            "https://openstax.org/books/chemistry-2e/pages/6-5-periodic-variations-in-element-properties"
          ],
          "canonId": "gc-periodic-trends",
          "sourceId": "refinement-gc-atomic-periodic-reasoning-c3",
          "sourceVersion": "dat-continuation-item-v1",
          "reviewStatus": "internal-reviewed",
          "verified": true,
          "progressEligible": true,
          "runtimeIntegrated": true,
          "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
        },
        {
          "id": "refinement-gc-atomic-periodic-reasoning-l1",
          "objectiveId": "gc-atomic-periodic-reasoning",
          "world": "gc",
          "pool": "later",
          "familyId": "gc-atomic-trend-claim-evidence-audit",
          "familyRationale": "Reserved transfer: evaluate whether a claimed universal rule follows from a supplied multi-element evidence table. The learner must retain a broad trend while using an explicit counterexample to reject an absolute claim. Ordinary cases compare named pairs; they do not perform a data-supported universal-claim audit.",
          "prompt": "A report lists first ionization energies in period-2 order: Be 900, B 801, C 1086 and N 1402 kJ/mol (rounded). Team Entropy concludes: “Moving right must increase first ionization energy at every step.” Which evaluation uses the report correctly?",
          "choices": [
            "The claim is established because N has the largest value.",
            "The claim is false because every step decreases.",
            "The Be → B decrease refutes “every step”; the data can still show a broad rising trend.",
            "The data cannot address first ionization because all four atoms are neutral."
          ],
          "answer": 2,
          "hint": "A universal claim is refuted by one contradictory adjacent comparison; that need not reverse the broad trend.",
          "explanation": "The listed Be → B change is a decrease from 900 to 801. Later increases do not repair the absolute “every step” claim. The general trend and a subshell exception can coexist; explaining that exception in orbital detail is outside this chapter.",
          "feedback": [
            "An endpoint maximum does not prove every intermediate step increased.",
            "B → C and C → N increase.",
            "Correct: this separates the general tendency from the absolute statement.",
            "First ionization is specifically defined for neutral gaseous atoms."
          ],
          "sourceUrls": [
            "https://openstax.org/books/chemistry-2e/pages/6-5-periodic-variations-in-element-properties",
            "https://physics.nist.gov/cgi-bin/Elements/elInfo.pl?context=text&element=4",
            "https://physics.nist.gov/cgi-bin/Elements/elInfo.pl?context=text&element=5",
            "https://physics.nist.gov/cgi-bin/Elements/elInfo.pl?context=text&element=6",
            "https://physics.nist.gov/cgi-bin/Elements/elInfo.pl?context=text&element=7"
          ],
          "canonId": "gc-periodic-trends",
          "sourceId": "refinement-gc-atomic-periodic-reasoning-l1",
          "sourceVersion": "dat-continuation-item-v1",
          "reviewStatus": "internal-reviewed",
          "verified": true,
          "progressEligible": true,
          "runtimeIntegrated": true,
          "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
        },
        {
          "id": "refinement-gc-atomic-periodic-reasoning-l2",
          "objectiveId": "gc-atomic-periodic-reasoning",
          "world": "gc",
          "pool": "later",
          "familyId": "gc-atomic-trend-claim-evidence-audit",
          "familyRationale": "Reserved transfer: evaluate whether a claimed universal rule follows from a supplied multi-element evidence table. The learner must retain a broad trend while using an explicit counterexample to reject an absolute claim. Ordinary cases compare named pairs; they do not perform a data-supported universal-claim audit.",
          "prompt": "A period-3 table reports first ionization energies: Si 787, P 1012, S 1000 and Cl 1251 kJ/mol (rounded). A curator deletes the S entry because “an element farther right cannot have a lower value.” Which response is justified by the table and the scope of the trend?",
          "choices": [
            "Delete P instead; every step must decrease.",
            "Keep S: P → S is a counterexample to the absolute rule, while the overall values can still broadly rise.",
            "Replace S by 1251 because it must equal Cl.",
            "The table proves all periodic properties increase at every step."
          ],
          "answer": 1,
          "hint": "A general trend does not authorize changing observations that show an exception.",
          "explanation": "P → S decreases from 1012 to 1000, while the other listed steps rise. The absolute rule is too strong; the table is consistent with a broadly increasing IE trend that has an exception.",
          "feedback": [
            "The table contains two increases, so an always-decreasing replacement is also wrong.",
            "Correct: preserve the evidence and qualify the generalization.",
            "Different atoms need not have equal first ionization energies.",
            "One property table cannot establish a universal rule for every property."
          ],
          "sourceUrls": [
            "https://openstax.org/books/chemistry-2e/pages/6-5-periodic-variations-in-element-properties",
            "https://physics.nist.gov/cgi-bin/Elements/elInfo.pl?context=text&element=14",
            "https://physics.nist.gov/cgi-bin/Elements/elInfo.pl?context=text&element=15",
            "https://physics.nist.gov/cgi-bin/Elements/elInfo.pl?context=text&element=16",
            "https://physics.nist.gov/cgi-bin/Elements/elInfo.pl?context=text&element=17"
          ],
          "canonId": "gc-periodic-trends",
          "sourceId": "refinement-gc-atomic-periodic-reasoning-l2",
          "sourceVersion": "dat-continuation-item-v1",
          "reviewStatus": "internal-reviewed",
          "verified": true,
          "progressEligible": true,
          "runtimeIntegrated": true,
          "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
        }
      ],
      "contentSha256": "48169de2473c31b9b0900ee4466f10e77512ea60cf9eb550ffc535a2ba577632",
      "reviewStatus": "internal-reviewed",
      "verified": true,
      "progressEligible": true,
      "runtimeIntegrated": true,
      "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
    },
    {
      "id": "pat-view-relay",
      "world": "pat",
      "title": "The View Relay",
      "scope": "Two prerequisite skills for view recognition: occupied silhouettes of supported unit-column solids and consistency of three supplied views. Height plans and large differences are instructional aids. Internal steps, hidden edges, curved surfaces, unrestricted solids and full missing-view PAT items remain outside this chapter.",
      "objectiveIds": [
        "pat-view-silhouettes",
        "pat-view-consistency"
      ],
      "metadata": {
        "course": "PAT",
        "session": 4,
        "creature": "vistrel",
        "stationName": "View Relay",
        "pathVariant": 2,
        "chapterTheme": "pat",
        "creatureDescriptor": {
          "id": "vistrel",
          "name": "Vistrel",
          "type": "sight",
          "color": "#9faedb",
          "bodyPlan": "A periwinkle fox-owl with two broad feather wings, two pointed ear tufts, two taloned feet and a three-feather tail; colored inset vanes suggest coordinated viewpoints without encoding answers.",
          "concept": "Coordinating front, top and right-end silhouettes of supported solids",
          "evolutions": [
            "Vistrel",
            "Prismavane",
            "Vistara"
          ],
          "rareName": "Aurora Vistara",
          "blurb": "Vistrel carries three viewing vanes. Help it expose Team Entropy’s mismatched projections by following the same object from every side."
        },
        "topicMappings": {
          "screenshotTopicIds": [],
          "officialOnlyTopicIds": [
            "pat-view-recognition"
          ]
        },
        "instructionFamilyIds": [
          "discovery-pat-view-relay",
          "pat-views-direct-projection",
          "pat-views-candidate-consistency"
        ]
      },
      "canon": {
        "id": "pat-top-front-end",
        "version": "0.2.1",
        "sourceRelativePath": "visuals/sheets/pat/pat-top-front-end.json",
        "sourceSha256": "2b14eb92064dda51620dab70ab87f569163b36f7b9f84ab08ecbbec120a39f74",
        "sourceRepository": "ace-system",
        "inspectedExportSha256": "53c2a6951e84c369d1e075d6c64e4672ea60bd35f29d01865d940019d02a391e",
        "adaptationVersion": 1,
        "importsSourceAssessments": false,
        "formativeCanonChecksProgressEligible": false
      },
      "objectives": [
        {
          "id": "pat-view-silhouettes",
          "world": "pat",
          "name": "Project supported solids into front, top and right silhouettes",
          "lesson": "An orthographic view looks along parallel lines, without perspective shrinkage. In this introduction, filled cells show whether any part of the solid lies along a viewing line. Front collapses front-to-back depth and keeps left-to-right width and height. Right end collapses width and keeps depth and height; front is at its left. Top looks down, keeping width and depth, with the back row at the top. Columns have no gaps. Read the stated orientation before comparing occupied regions. These silhouettes show only the outer occupied region, not internal steps or hidden edges.",
          "sourceUrls": [
            "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/perceptual_ability_test_section_instructions.pdf"
          ],
          "reviewStatus": "internal-reviewed",
          "verified": true,
          "progressEligible": true,
          "runtimeIntegrated": true,
          "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
        },
        {
          "id": "pat-view-consistency",
          "world": "pat",
          "name": "Require a candidate solid to agree with every supplied view",
          "lesson": "Use the same labeled orientation for all three projections. A proposed solid must reproduce every supplied occupied silhouette: front and top share width, front and right share height, and top and right share depth. Reject a candidate as soon as one supplied view disagrees, then verify all views of the survivor. A match in one view alone is insufficient because depth overlap can conceal different column heights. This lesson compares explicitly supplied candidates and silhouettes; it does not claim to solve the full hidden-edge version of view recognition.",
          "sourceUrls": [
            "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/perceptual_ability_test_section_instructions.pdf"
          ],
          "reviewStatus": "internal-reviewed",
          "verified": true,
          "progressEligible": true,
          "runtimeIntegrated": true,
          "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
        }
      ],
      "teachingByObjective": {
        "pat-view-silhouettes": {
          "objectiveId": "pat-view-silhouettes",
          "version": 1,
          "core": "An orthographic view looks along parallel lines, without perspective shrinkage. In this introduction, filled cells show whether any part of the solid lies along a viewing line. Front collapses front-to-back depth and keeps left-to-right width and height. Right end collapses width and keeps depth and height; front is at its left. Top looks down, keeping width and depth, with the back row at the top. Columns have no gaps. Read the stated orientation before comparing occupied regions. These silhouettes show only the outer occupied region, not internal steps or hidden edges.",
          "terms": [
            {
              "term": "Parallel projection",
              "meaning": "All sight lines point in the same direction; farther parts do not shrink."
            },
            {
              "term": "Silhouette",
              "meaning": "The region occupied by the projection; different depths can overlap."
            },
            {
              "term": "Right-end direction",
              "meaning": "In this defined view, front is left and back is right."
            }
          ],
          "assumptions": [
            "Supported unit columns on a shared floor; separate columns are allowed. Height-plan rows run front to back, and entries run left to right. Zero means no column.",
            "Front: left-to-right width; right end: front at left, back at right; top: back row at top. The object is not rotated between views.",
            "Filled regions represent occupied silhouettes only. Thin pale rectangular frames set scale; no internal or hidden object edges are represented. Height plans are an introductory aid."
          ],
          "workedExample": {
            "prompt": "A height plan has front row [1, 2] and back row [3, 0]. What are the front silhouette heights?",
            "steps": [
              "Front sight lines pass through both rows at each left-to-right position.",
              "At the left position a height-three back column extends above the height-one front column.",
              "The front outline heights are 3 and 2; do not add heights along depth."
            ],
            "answer": "Front heights: 3, 2.",
            "familyId": "pat-views-direct-projection",
            "role": "instruction-only"
          },
          "commonMistake": "Adding heights along depth invents a taller column; projection overlaps them.",
          "nextAction": "Name the viewing direction, align the shared dimensions, and trace occupied lines before choosing.",
          "sourceUrls": [
            "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/perceptual_ability_test_section_instructions.pdf"
          ],
          "canon": {
            "id": "pat-top-front-end",
            "version": "0.2.1",
            "sourceRelativePath": "visuals/sheets/pat/pat-top-front-end.json",
            "sourceSha256": "2b14eb92064dda51620dab70ab87f569163b36f7b9f84ab08ecbbec120a39f74",
            "sourceRepository": "ace-system",
            "inspectedExportSha256": "53c2a6951e84c369d1e075d6c64e4672ea60bd35f29d01865d940019d02a391e",
            "adaptationVersion": 1,
            "importsSourceAssessments": false,
            "formativeCanonChecksProgressEligible": false,
            "reviewScope": "Original silhouette-only prerequisite to full top-front-end view recognition. Shared dimensions and orientation; hidden-edge instruction is excluded."
          },
          "reviewStatus": "internal-reviewed",
          "verified": true,
          "progressEligible": true,
          "runtimeIntegrated": true,
          "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
        },
        "pat-view-consistency": {
          "objectiveId": "pat-view-consistency",
          "version": 1,
          "core": "Use the same labeled orientation for all three projections. A proposed solid must reproduce every supplied occupied silhouette: front and top share width, front and right share height, and top and right share depth. Reject a candidate as soon as one supplied view disagrees, then verify all views of the survivor. A match in one view alone is insufficient because depth overlap can conceal different column heights. This lesson compares explicitly supplied candidates and silhouettes; it does not claim to solve the full hidden-edge version of view recognition.",
          "terms": [
            {
              "term": "Shared width",
              "meaning": "Left-right width is common to front and top."
            },
            {
              "term": "Shared height",
              "meaning": "Vertical extent agrees between front and right end."
            },
            {
              "term": "Counterexample view",
              "meaning": "One disagreeing view is enough to eliminate a candidate."
            }
          ],
          "assumptions": [
            "Supported unit columns on a shared floor; separate columns are allowed. Height-plan rows run front to back, and entries run left to right. Zero means no column.",
            "Front: left-to-right width; right end: front at left, back at right; top: back row at top. The object is not rotated between views.",
            "Filled regions represent occupied silhouettes only. Thin pale rectangular frames set scale; no internal or hidden object edges are represented. Height plans are an introductory aid."
          ],
          "workedExample": {
            "prompt": "Target heights have front row [2, 1] and back row [0, 1]. Candidate X instead has front row [2, 0] and back row [0, 1]. Is a matching front outline enough?",
            "steps": [
              "Both front projections have column heights 2 and 1.",
              "The top footprints differ: X is missing the front-right occupied position.",
              "A single correct view does not repair a different incorrect view."
            ],
            "answer": "Reject X: its top silhouette disagrees.",
            "familyId": "pat-views-candidate-consistency",
            "role": "instruction-only"
          },
          "commonMistake": "Choosing the first shape that matches one view leaves other constraints unchecked.",
          "nextAction": "Name the viewing direction, align the shared dimensions, and trace occupied lines before choosing.",
          "sourceUrls": [
            "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/perceptual_ability_test_section_instructions.pdf"
          ],
          "canon": {
            "id": "pat-top-front-end",
            "version": "0.2.1",
            "sourceRelativePath": "visuals/sheets/pat/pat-top-front-end.json",
            "sourceSha256": "2b14eb92064dda51620dab70ab87f569163b36f7b9f84ab08ecbbec120a39f74",
            "sourceRepository": "ace-system",
            "inspectedExportSha256": "53c2a6951e84c369d1e075d6c64e4672ea60bd35f29d01865d940019d02a391e",
            "adaptationVersion": 1,
            "importsSourceAssessments": false,
            "formativeCanonChecksProgressEligible": false,
            "reviewScope": "Original silhouette-only prerequisite to full top-front-end view recognition. Shared dimensions and orientation; hidden-edge instruction is excluded."
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
          "id": "refinement-pat-view-silhouettes-p1",
          "objectiveId": "pat-view-silhouettes",
          "world": "pat",
          "pool": "practice",
          "familyId": "pat-views-direct-projection",
          "familyRationale": "Direct directional projection. Changed heights and view directions are variants of one family, not fresh conceptual families.",
          "prompt": "Which panel is the front occupied silhouette of the supplied solid? Frames share the same unit scale and orientation; no internal or hidden edges are drawn.",
          "choices": [
            "Panel A",
            "Panel B",
            "Panel C",
            "Panel D"
          ],
          "answer": 1,
          "hint": "Align the labeled axes and compare each occupied viewing line. The silhouette uses overlap, never a sum of depths.",
          "explanation": "For the supplied solid, look through front-to-back depth at each left-to-right position. The matching occupied grid is [[1,0],[1,1],[1,1]] (top-to-bottom rows, 1 occupied, 0 empty).",
          "feedback": [
            "Panel A fails the stated projection constraints. At displayed row 1, column 1, it omits a cell crossed by the solid.",
            "Correct. For the supplied solid, look through front-to-back depth at each left-to-right position. The matching occupied grid is [[1,0],[1,1],[1,1]] (top-to-bottom rows, 1 occupied, 0 empty).",
            "Panel C fails the stated projection constraints. At displayed row 2, column 2, it omits a cell crossed by the solid.",
            "Panel D fails the stated projection constraints. At displayed row 1, column 2, it fills a cell that should be empty."
          ],
          "sourceUrls": [
            "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/perceptual_ability_test_section_instructions.pdf"
          ],
          "canonId": "pat-top-front-end",
          "visualCap": "Complete original height plan, front-to-back: [[1,2],[3,0]]. front options A through D show occupied=1 and empty=0 in top-to-bottom rows: [[[0,0],[1,1],[1,1]],[[1,0],[1,1],[1,1]],[[1,0],[1,0],[1,1]],[[1,1],[1,1],[1,1]]].",
          "fig": "data/figures/chapters/pat-views-p1-project.09ee064dddb4d6c9.svg",
          "figureAlt": "Complete original height plan, front-to-back: [[1,2],[3,0]]. front options A through D show occupied=1 and empty=0 in top-to-bottom rows: [[[0,0],[1,1],[1,1]],[[1,0],[1,1],[1,1]],[[1,0],[1,0],[1,1]],[[1,1],[1,1],[1,1]]].",
          "sourceId": "refinement-pat-view-silhouettes-p1",
          "sourceVersion": "dat-continuation-item-v1",
          "reviewStatus": "internal-reviewed",
          "verified": true,
          "progressEligible": true,
          "runtimeIntegrated": true,
          "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
        },
        {
          "id": "refinement-pat-view-silhouettes-p2",
          "objectiveId": "pat-view-silhouettes",
          "world": "pat",
          "pool": "practice",
          "familyId": "pat-views-direct-projection",
          "familyRationale": "Direct directional projection. Changed heights and view directions are variants of one family, not fresh conceptual families.",
          "prompt": "Which panel is the right-end occupied silhouette of the supplied solid? Frames share the same unit scale and orientation; no internal or hidden edges are drawn.",
          "choices": [
            "Panel A",
            "Panel B",
            "Panel C",
            "Panel D"
          ],
          "answer": 3,
          "hint": "Align the labeled axes and compare each occupied viewing line. The silhouette uses overlap, never a sum of depths.",
          "explanation": "For the supplied solid, look across width at each front-to-back position. The matching occupied grid is [[1,0],[1,1],[1,1]] (top-to-bottom rows, 1 occupied, 0 empty).",
          "feedback": [
            "Panel A fails the stated projection constraints. At displayed row 1, column 1, it omits a cell crossed by the solid.",
            "Panel B fails the stated projection constraints. At displayed row 2, column 2, it omits a cell crossed by the solid.",
            "Panel C fails the stated projection constraints. At displayed row 1, column 2, it fills a cell that should be empty.",
            "Correct. For the supplied solid, look across width at each front-to-back position. The matching occupied grid is [[1,0],[1,1],[1,1]] (top-to-bottom rows, 1 occupied, 0 empty)."
          ],
          "sourceUrls": [
            "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/perceptual_ability_test_section_instructions.pdf"
          ],
          "canonId": "pat-top-front-end",
          "visualCap": "Complete original height plan, front-to-back: [[3,1],[1,2]]. right options A through D show occupied=1 and empty=0 in top-to-bottom rows: [[[0,0],[1,1],[1,1]],[[1,0],[1,0],[1,1]],[[1,1],[1,1],[1,1]],[[1,0],[1,1],[1,1]]].",
          "fig": "data/figures/chapters/pat-views-p2-project.a8d95a661cdb0998.svg",
          "figureAlt": "Complete original height plan, front-to-back: [[3,1],[1,2]]. right options A through D show occupied=1 and empty=0 in top-to-bottom rows: [[[0,0],[1,1],[1,1]],[[1,0],[1,0],[1,1]],[[1,1],[1,1],[1,1]],[[1,0],[1,1],[1,1]]].",
          "sourceId": "refinement-pat-view-silhouettes-p2",
          "sourceVersion": "dat-continuation-item-v1",
          "reviewStatus": "internal-reviewed",
          "verified": true,
          "progressEligible": true,
          "runtimeIntegrated": true,
          "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
        },
        {
          "id": "refinement-pat-view-silhouettes-p3",
          "objectiveId": "pat-view-silhouettes",
          "world": "pat",
          "pool": "practice",
          "familyId": "pat-views-direct-projection",
          "familyRationale": "Direct directional projection. Changed heights and view directions are variants of one family, not fresh conceptual families.",
          "prompt": "Which panel is the top occupied silhouette of the supplied solid? Frames share the same unit scale and orientation; no internal or hidden edges are drawn.",
          "choices": [
            "Panel A",
            "Panel B",
            "Panel C",
            "Panel D"
          ],
          "answer": 0,
          "hint": "Align the labeled axes and compare each occupied viewing line. The silhouette uses overlap, never a sum of depths.",
          "explanation": "For the supplied solid, look down onto each footprint position. The matching occupied grid is [[1,1],[1,0]] (top-to-bottom rows, 1 occupied, 0 empty).",
          "feedback": [
            "Correct. For the supplied solid, look down onto each footprint position. The matching occupied grid is [[1,1],[1,0]] (top-to-bottom rows, 1 occupied, 0 empty).",
            "Panel B fails the stated projection constraints. At displayed row 1, column 1, it omits a cell crossed by the solid.",
            "Panel C fails the stated projection constraints. At displayed row 1, column 2, it omits a cell crossed by the solid.",
            "Panel D fails the stated projection constraints. At displayed row 2, column 1, it omits a cell crossed by the solid."
          ],
          "sourceUrls": [
            "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/perceptual_ability_test_section_instructions.pdf"
          ],
          "canonId": "pat-top-front-end",
          "visualCap": "Complete original height plan, front-to-back: [[1,0],[2,1]]. top options A through D show occupied=1 and empty=0 in top-to-bottom rows: [[[1,1],[1,0]],[[0,1],[1,0]],[[1,0],[1,0]],[[1,1],[0,0]]].",
          "fig": "data/figures/chapters/pat-views-p3-project.c6ee2c32c64374a3.svg",
          "figureAlt": "Complete original height plan, front-to-back: [[1,0],[2,1]]. top options A through D show occupied=1 and empty=0 in top-to-bottom rows: [[[1,1],[1,0]],[[0,1],[1,0]],[[1,0],[1,0]],[[1,1],[0,0]]].",
          "sourceId": "refinement-pat-view-silhouettes-p3",
          "sourceVersion": "dat-continuation-item-v1",
          "reviewStatus": "internal-reviewed",
          "verified": true,
          "progressEligible": true,
          "runtimeIntegrated": true,
          "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
        },
        {
          "id": "refinement-pat-view-silhouettes-c1",
          "objectiveId": "pat-view-silhouettes",
          "world": "pat",
          "pool": "check",
          "familyId": "pat-views-direct-projection",
          "familyRationale": "Direct directional projection. Changed heights and view directions are variants of one family, not fresh conceptual families.",
          "prompt": "Which panel is the front occupied silhouette of the supplied solid? Frames share the same unit scale and orientation; no internal or hidden edges are drawn.",
          "choices": [
            "Panel A",
            "Panel B",
            "Panel C",
            "Panel D"
          ],
          "answer": 2,
          "hint": "Align the labeled axes and compare each occupied viewing line. The silhouette uses overlap, never a sum of depths.",
          "explanation": "For the supplied solid, look through front-to-back depth at each left-to-right position. The matching occupied grid is [[0,1],[1,1],[1,1]] (top-to-bottom rows, 1 occupied, 0 empty).",
          "feedback": [
            "Panel A fails the stated projection constraints. At displayed row 1, column 2, it omits a cell crossed by the solid.",
            "Panel B fails the stated projection constraints. At displayed row 2, column 1, it omits a cell crossed by the solid.",
            "Correct. For the supplied solid, look through front-to-back depth at each left-to-right position. The matching occupied grid is [[0,1],[1,1],[1,1]] (top-to-bottom rows, 1 occupied, 0 empty).",
            "Panel D fails the stated projection constraints. At displayed row 1, column 1, it fills a cell that should be empty."
          ],
          "sourceUrls": [
            "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/perceptual_ability_test_section_instructions.pdf"
          ],
          "canonId": "pat-top-front-end",
          "visualCap": "Complete original height plan, front-to-back: [[1,3],[2,0]]. front options A through D show occupied=1 and empty=0 in top-to-bottom rows: [[[0,0],[1,1],[1,1]],[[0,1],[0,1],[1,1]],[[0,1],[1,1],[1,1]],[[1,1],[1,1],[1,1]]].",
          "fig": "data/figures/chapters/pat-views-c1-project.d0a3bc9ea24f0bd5.svg",
          "figureAlt": "Complete original height plan, front-to-back: [[1,3],[2,0]]. front options A through D show occupied=1 and empty=0 in top-to-bottom rows: [[[0,0],[1,1],[1,1]],[[0,1],[0,1],[1,1]],[[0,1],[1,1],[1,1]],[[1,1],[1,1],[1,1]]].",
          "sourceId": "refinement-pat-view-silhouettes-c1",
          "sourceVersion": "dat-continuation-item-v1",
          "reviewStatus": "internal-reviewed",
          "verified": true,
          "progressEligible": true,
          "runtimeIntegrated": true,
          "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
        },
        {
          "id": "refinement-pat-view-silhouettes-c2",
          "objectiveId": "pat-view-silhouettes",
          "world": "pat",
          "pool": "check",
          "familyId": "pat-views-direct-projection",
          "familyRationale": "Direct directional projection. Changed heights and view directions are variants of one family, not fresh conceptual families.",
          "prompt": "Which panel is the right-end occupied silhouette of the supplied solid? Frames share the same unit scale and orientation; no internal or hidden edges are drawn.",
          "choices": [
            "Panel A",
            "Panel B",
            "Panel C",
            "Panel D"
          ],
          "answer": 0,
          "hint": "Align the labeled axes and compare each occupied viewing line. The silhouette uses overlap, never a sum of depths.",
          "explanation": "For the supplied solid, look across width at each front-to-back position. The matching occupied grid is [[0,1],[1,1],[1,1]] (top-to-bottom rows, 1 occupied, 0 empty).",
          "feedback": [
            "Correct. For the supplied solid, look across width at each front-to-back position. The matching occupied grid is [[0,1],[1,1],[1,1]] (top-to-bottom rows, 1 occupied, 0 empty).",
            "Panel B fails the stated projection constraints. At displayed row 1, column 2, it omits a cell crossed by the solid.",
            "Panel C fails the stated projection constraints. At displayed row 2, column 1, it omits a cell crossed by the solid.",
            "Panel D fails the stated projection constraints. At displayed row 1, column 1, it fills a cell that should be empty."
          ],
          "sourceUrls": [
            "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/perceptual_ability_test_section_instructions.pdf"
          ],
          "canonId": "pat-top-front-end",
          "visualCap": "Complete original height plan, front-to-back: [[1,2],[3,1]]. right options A through D show occupied=1 and empty=0 in top-to-bottom rows: [[[0,1],[1,1],[1,1]],[[0,0],[1,1],[1,1]],[[0,1],[0,1],[1,1]],[[1,1],[1,1],[1,1]]].",
          "fig": "data/figures/chapters/pat-views-c2-project.1264acef3851be7f.svg",
          "figureAlt": "Complete original height plan, front-to-back: [[1,2],[3,1]]. right options A through D show occupied=1 and empty=0 in top-to-bottom rows: [[[0,1],[1,1],[1,1]],[[0,0],[1,1],[1,1]],[[0,1],[0,1],[1,1]],[[1,1],[1,1],[1,1]]].",
          "sourceId": "refinement-pat-view-silhouettes-c2",
          "sourceVersion": "dat-continuation-item-v1",
          "reviewStatus": "internal-reviewed",
          "verified": true,
          "progressEligible": true,
          "runtimeIntegrated": true,
          "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
        },
        {
          "id": "refinement-pat-view-silhouettes-c3",
          "objectiveId": "pat-view-silhouettes",
          "world": "pat",
          "pool": "check",
          "familyId": "pat-views-direct-projection",
          "familyRationale": "Direct directional projection. Changed heights and view directions are variants of one family, not fresh conceptual families.",
          "prompt": "Which panel is the top occupied silhouette of the supplied solid? Frames share the same unit scale and orientation; no internal or hidden edges are drawn.",
          "choices": [
            "Panel A",
            "Panel B",
            "Panel C",
            "Panel D"
          ],
          "answer": 3,
          "hint": "Align the labeled axes and compare each occupied viewing line. The silhouette uses overlap, never a sum of depths.",
          "explanation": "For the supplied solid, look down onto each footprint position. The matching occupied grid is [[1,1],[0,1]] (top-to-bottom rows, 1 occupied, 0 empty).",
          "feedback": [
            "Panel A fails the stated projection constraints. At displayed row 1, column 1, it omits a cell crossed by the solid.",
            "Panel B fails the stated projection constraints. At displayed row 1, column 2, it omits a cell crossed by the solid.",
            "Panel C fails the stated projection constraints. At displayed row 2, column 2, it omits a cell crossed by the solid.",
            "Correct. For the supplied solid, look down onto each footprint position. The matching occupied grid is [[1,1],[0,1]] (top-to-bottom rows, 1 occupied, 0 empty)."
          ],
          "sourceUrls": [
            "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/perceptual_ability_test_section_instructions.pdf"
          ],
          "canonId": "pat-top-front-end",
          "visualCap": "Complete original height plan, front-to-back: [[0,2],[1,3]]. top options A through D show occupied=1 and empty=0 in top-to-bottom rows: [[[0,1],[0,1]],[[1,0],[0,1]],[[1,1],[0,0]],[[1,1],[0,1]]].",
          "fig": "data/figures/chapters/pat-views-c3-project.0614ac44a03a09b2.svg",
          "figureAlt": "Complete original height plan, front-to-back: [[0,2],[1,3]]. top options A through D show occupied=1 and empty=0 in top-to-bottom rows: [[[0,1],[0,1]],[[1,0],[0,1]],[[1,1],[0,0]],[[1,1],[0,1]]].",
          "sourceId": "refinement-pat-view-silhouettes-c3",
          "sourceVersion": "dat-continuation-item-v1",
          "reviewStatus": "internal-reviewed",
          "verified": true,
          "progressEligible": true,
          "runtimeIntegrated": true,
          "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
        },
        {
          "id": "refinement-pat-view-silhouettes-l1",
          "objectiveId": "pat-view-silhouettes",
          "world": "pat",
          "pool": "later",
          "familyId": "pat-views-removal-shadow",
          "familyRationale": "Reserved transfer: update the occupied sight lines after a specified entire column is removed. Remaining depth can preserve an outline. This operation is absent from ordinary teaching.",
          "prompt": "Remove the entire column at left-to-right position 1, front-to-back row 1, leaving all other columns fixed. Which panel is the front occupied silhouette of the resulting solid? Frames share the same unit scale and orientation; no internal or hidden edges are drawn.",
          "choices": [
            "Panel A",
            "Panel B",
            "Panel C",
            "Panel D"
          ],
          "answer": 2,
          "hint": "Align the labeled axes and compare each occupied viewing line. The silhouette uses overlap, never a sum of depths.",
          "explanation": "After the stated removal, look through front-to-back depth at each left-to-right position. The matching occupied grid is [[0,0],[1,0],[1,1]] (top-to-bottom rows, 1 occupied, 0 empty).",
          "feedback": [
            "Panel A fails the stated projection constraints. At displayed row 2, column 1, it omits a cell crossed by the solid.",
            "Panel B fails the stated projection constraints. At displayed row 3, column 2, it omits a cell crossed by the solid.",
            "Correct. After the stated removal, look through front-to-back depth at each left-to-right position. The matching occupied grid is [[0,0],[1,0],[1,1]] (top-to-bottom rows, 1 occupied, 0 empty).",
            "Panel D fails the stated projection constraints. At displayed row 2, column 2, it fills a cell that should be empty."
          ],
          "sourceUrls": [
            "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/perceptual_ability_test_section_instructions.pdf"
          ],
          "canonId": "pat-top-front-end",
          "visualCap": "Complete original height plan, front-to-back: [[3,1],[2,1]]. front options A through D show occupied=1 and empty=0 in top-to-bottom rows: [[[0,0],[0,0],[1,1]],[[0,0],[1,0],[1,0]],[[0,0],[1,0],[1,1]],[[0,0],[1,1],[1,1]]].",
          "fig": "data/figures/chapters/pat-views-l1-project.62a309c48da969a3.svg",
          "figureAlt": "Complete original height plan, front-to-back: [[3,1],[2,1]]. front options A through D show occupied=1 and empty=0 in top-to-bottom rows: [[[0,0],[0,0],[1,1]],[[0,0],[1,0],[1,0]],[[0,0],[1,0],[1,1]],[[0,0],[1,1],[1,1]]].",
          "sourceId": "refinement-pat-view-silhouettes-l1",
          "sourceVersion": "dat-continuation-item-v1",
          "reviewStatus": "internal-reviewed",
          "verified": true,
          "progressEligible": true,
          "runtimeIntegrated": true,
          "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
        },
        {
          "id": "refinement-pat-view-silhouettes-l2",
          "objectiveId": "pat-view-silhouettes",
          "world": "pat",
          "pool": "later",
          "familyId": "pat-views-removal-shadow",
          "familyRationale": "Reserved transfer: update the occupied sight lines after a specified entire column is removed. Remaining depth can preserve an outline. This operation is absent from ordinary teaching.",
          "prompt": "Remove the entire column at left-to-right position 2, front-to-back row 1, leaving all other columns fixed. Which panel is the right-end occupied silhouette of the resulting solid? Frames share the same unit scale and orientation; no internal or hidden edges are drawn.",
          "choices": [
            "Panel A",
            "Panel B",
            "Panel C",
            "Panel D"
          ],
          "answer": 1,
          "hint": "Align the labeled axes and compare each occupied viewing line. The silhouette uses overlap, never a sum of depths.",
          "explanation": "After the stated removal, look across width at each front-to-back position. The matching occupied grid is [[0,1],[1,1],[1,1]] (top-to-bottom rows, 1 occupied, 0 empty).",
          "feedback": [
            "Panel A fails the stated projection constraints. At displayed row 1, column 2, it omits a cell crossed by the solid.",
            "Correct. After the stated removal, look across width at each front-to-back position. The matching occupied grid is [[0,1],[1,1],[1,1]] (top-to-bottom rows, 1 occupied, 0 empty).",
            "Panel C fails the stated projection constraints. At displayed row 2, column 1, it omits a cell crossed by the solid.",
            "Panel D fails the stated projection constraints. At displayed row 1, column 1, it fills a cell that should be empty."
          ],
          "sourceUrls": [
            "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/perceptual_ability_test_section_instructions.pdf"
          ],
          "canonId": "pat-top-front-end",
          "visualCap": "Complete original height plan, front-to-back: [[2,1],[3,2]]. right options A through D show occupied=1 and empty=0 in top-to-bottom rows: [[[0,0],[1,1],[1,1]],[[0,1],[1,1],[1,1]],[[0,1],[0,1],[1,1]],[[1,1],[1,1],[1,1]]].",
          "fig": "data/figures/chapters/pat-views-l2-project.e519b064e3a49098.svg",
          "figureAlt": "Complete original height plan, front-to-back: [[2,1],[3,2]]. right options A through D show occupied=1 and empty=0 in top-to-bottom rows: [[[0,0],[1,1],[1,1]],[[0,1],[1,1],[1,1]],[[0,1],[0,1],[1,1]],[[1,1],[1,1],[1,1]]].",
          "sourceId": "refinement-pat-view-silhouettes-l2",
          "sourceVersion": "dat-continuation-item-v1",
          "reviewStatus": "internal-reviewed",
          "verified": true,
          "progressEligible": true,
          "runtimeIntegrated": true,
          "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
        },
        {
          "id": "refinement-pat-view-consistency-p1",
          "objectiveId": "pat-view-consistency",
          "world": "pat",
          "pool": "practice",
          "familyId": "pat-views-candidate-consistency",
          "familyRationale": "Compare explicitly supplied candidates against all three simultaneous views; matching one view is insufficient. Numeric and orientation variants remain this same family.",
          "prompt": "Which candidate produces all three supplied occupied silhouettes in the labeled orientation? Use the height plans to resolve any columns hidden in the perspective aids. Do not rotate a candidate.",
          "choices": [
            "Panel A",
            "Panel B",
            "Panel C",
            "Panel D"
          ],
          "answer": 1,
          "hint": "Align the labeled axes and compare each occupied viewing line. The silhouette uses overlap, never a sum of depths.",
          "explanation": "Only Panel B agrees with front, top and right together. Its front and top share width, front and right share height, and top and right share depth. The other candidates fail at least one supplied view.",
          "feedback": [
            "Panel A fails the stated projection constraints. Its top view disagrees.",
            "Correct. Only Panel B agrees with front, top and right together. Its front and top share width, front and right share height, and top and right share depth. The other candidates fail at least one supplied view.",
            "Panel C fails the stated projection constraints. Its front view disagrees.",
            "Panel D fails the stated projection constraints. Its top view disagrees."
          ],
          "sourceUrls": [
            "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/perceptual_ability_test_section_instructions.pdf"
          ],
          "canonId": "pat-top-front-end",
          "visualCap": "Supplied grids (top-to-bottom rows, 1 occupied): {\"front\":[[0,0],[1,0],[1,1]],\"top\":[[0,1],[1,1]],\"right\":[[0,0],[1,0],[1,1]]}. Candidate height plans front-to-back, A through D: [[[2,0],[0,1]],[[2,1],[0,1]],[[2,2],[0,1]],[[2,1],[1,1]]].",
          "fig": "data/figures/chapters/pat-views-p1-match.a8ff4b74e94cad5e.svg",
          "figureAlt": "Supplied grids (top-to-bottom rows, 1 occupied): {\"front\":[[0,0],[1,0],[1,1]],\"top\":[[0,1],[1,1]],\"right\":[[0,0],[1,0],[1,1]]}. Candidate height plans front-to-back, A through D: [[[2,0],[0,1]],[[2,1],[0,1]],[[2,2],[0,1]],[[2,1],[1,1]]].",
          "sourceId": "refinement-pat-view-consistency-p1",
          "sourceVersion": "dat-continuation-item-v1",
          "reviewStatus": "internal-reviewed",
          "verified": true,
          "progressEligible": true,
          "runtimeIntegrated": true,
          "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
        },
        {
          "id": "refinement-pat-view-consistency-p2",
          "objectiveId": "pat-view-consistency",
          "world": "pat",
          "pool": "practice",
          "familyId": "pat-views-candidate-consistency",
          "familyRationale": "Compare explicitly supplied candidates against all three simultaneous views; matching one view is insufficient. Numeric and orientation variants remain this same family.",
          "prompt": "Which candidate produces all three supplied occupied silhouettes in the labeled orientation? Use the height plans to resolve any columns hidden in the perspective aids. Do not rotate a candidate.",
          "choices": [
            "Panel A",
            "Panel B",
            "Panel C",
            "Panel D"
          ],
          "answer": 2,
          "hint": "Align the labeled axes and compare each occupied viewing line. The silhouette uses overlap, never a sum of depths.",
          "explanation": "Only Panel C agrees with front, top and right together. Its front and top share width, front and right share height, and top and right share depth. The other candidates fail at least one supplied view.",
          "feedback": [
            "Panel A fails the stated projection constraints. Its top view disagrees.",
            "Panel B fails the stated projection constraints. Its top view disagrees.",
            "Correct. Only Panel C agrees with front, top and right together. Its front and top share width, front and right share height, and top and right share depth. The other candidates fail at least one supplied view.",
            "Panel D fails the stated projection constraints. Its front view disagrees."
          ],
          "sourceUrls": [
            "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/perceptual_ability_test_section_instructions.pdf"
          ],
          "canonId": "pat-top-front-end",
          "visualCap": "Supplied grids (top-to-bottom rows, 1 occupied): {\"front\":[[0,1],[1,1],[1,1]],\"top\":[[1,1],[1,1]],\"right\":[[1,0],[1,1],[1,1]]}. Candidate height plans front-to-back, A through D: [[[1,3],[2,0]],[[0,3],[2,1]],[[1,3],[2,1]],[[3,3],[2,1]]].",
          "fig": "data/figures/chapters/pat-views-p2-match.d64e5622bf6d9b4e.svg",
          "figureAlt": "Supplied grids (top-to-bottom rows, 1 occupied): {\"front\":[[0,1],[1,1],[1,1]],\"top\":[[1,1],[1,1]],\"right\":[[1,0],[1,1],[1,1]]}. Candidate height plans front-to-back, A through D: [[[1,3],[2,0]],[[0,3],[2,1]],[[1,3],[2,1]],[[3,3],[2,1]]].",
          "sourceId": "refinement-pat-view-consistency-p2",
          "sourceVersion": "dat-continuation-item-v1",
          "reviewStatus": "internal-reviewed",
          "verified": true,
          "progressEligible": true,
          "runtimeIntegrated": true,
          "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
        },
        {
          "id": "refinement-pat-view-consistency-p3",
          "objectiveId": "pat-view-consistency",
          "world": "pat",
          "pool": "practice",
          "familyId": "pat-views-candidate-consistency",
          "familyRationale": "Compare explicitly supplied candidates against all three simultaneous views; matching one view is insufficient. Numeric and orientation variants remain this same family.",
          "prompt": "Which candidate produces all three supplied occupied silhouettes in the labeled orientation? Use the height plans to resolve any columns hidden in the perspective aids. Do not rotate a candidate.",
          "choices": [
            "Panel A",
            "Panel B",
            "Panel C",
            "Panel D"
          ],
          "answer": 0,
          "hint": "Align the labeled axes and compare each occupied viewing line. The silhouette uses overlap, never a sum of depths.",
          "explanation": "Only Panel A agrees with front, top and right together. Its front and top share width, front and right share height, and top and right share depth. The other candidates fail at least one supplied view.",
          "feedback": [
            "Correct. Only Panel A agrees with front, top and right together. Its front and top share width, front and right share height, and top and right share depth. The other candidates fail at least one supplied view.",
            "Panel B fails the stated projection constraints. Its top view disagrees.",
            "Panel C fails the stated projection constraints. Its top view disagrees.",
            "Panel D fails the stated projection constraints. Its right view disagrees."
          ],
          "sourceUrls": [
            "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/perceptual_ability_test_section_instructions.pdf"
          ],
          "canonId": "pat-top-front-end",
          "visualCap": "Supplied grids (top-to-bottom rows, 1 occupied): {\"front\":[[0,0],[0,1],[1,1]],\"top\":[[1,1],[0,1]],\"right\":[[0,0],[1,0],[1,1]]}. Candidate height plans front-to-back, A through D: [[[0,2],[1,1]],[[0,2],[1,0]],[[1,2],[1,1]],[[0,2],[1,2]]].",
          "fig": "data/figures/chapters/pat-views-p3-match.cc620041521e7b2f.svg",
          "figureAlt": "Supplied grids (top-to-bottom rows, 1 occupied): {\"front\":[[0,0],[0,1],[1,1]],\"top\":[[1,1],[0,1]],\"right\":[[0,0],[1,0],[1,1]]}. Candidate height plans front-to-back, A through D: [[[0,2],[1,1]],[[0,2],[1,0]],[[1,2],[1,1]],[[0,2],[1,2]]].",
          "sourceId": "refinement-pat-view-consistency-p3",
          "sourceVersion": "dat-continuation-item-v1",
          "reviewStatus": "internal-reviewed",
          "verified": true,
          "progressEligible": true,
          "runtimeIntegrated": true,
          "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
        },
        {
          "id": "refinement-pat-view-consistency-c1",
          "objectiveId": "pat-view-consistency",
          "world": "pat",
          "pool": "check",
          "familyId": "pat-views-candidate-consistency",
          "familyRationale": "Compare explicitly supplied candidates against all three simultaneous views; matching one view is insufficient. Numeric and orientation variants remain this same family.",
          "prompt": "Which candidate produces all three supplied occupied silhouettes in the labeled orientation? Use the height plans to resolve any columns hidden in the perspective aids. Do not rotate a candidate.",
          "choices": [
            "Panel A",
            "Panel B",
            "Panel C",
            "Panel D"
          ],
          "answer": 3,
          "hint": "Align the labeled axes and compare each occupied viewing line. The silhouette uses overlap, never a sum of depths.",
          "explanation": "Only Panel D agrees with front, top and right together. Its front and top share width, front and right share height, and top and right share depth. The other candidates fail at least one supplied view.",
          "feedback": [
            "Panel A fails the stated projection constraints. Its top view disagrees.",
            "Panel B fails the stated projection constraints. Its right view disagrees.",
            "Panel C fails the stated projection constraints. Its top view disagrees.",
            "Correct. Only Panel D agrees with front, top and right together. Its front and top share width, front and right share height, and top and right share depth. The other candidates fail at least one supplied view."
          ],
          "sourceUrls": [
            "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/perceptual_ability_test_section_instructions.pdf"
          ],
          "canonId": "pat-top-front-end",
          "visualCap": "Supplied grids (top-to-bottom rows, 1 occupied): {\"front\":[[1,0],[1,1],[1,1]],\"top\":[[1,0],[1,1]],\"right\":[[0,1],[1,1],[1,1]]}. Candidate height plans front-to-back, A through D: [[[0,2],[3,0]],[[3,2],[3,0]],[[1,2],[3,1]],[[1,2],[3,0]]].",
          "fig": "data/figures/chapters/pat-views-c1-match.4b82447abeebd160.svg",
          "figureAlt": "Supplied grids (top-to-bottom rows, 1 occupied): {\"front\":[[1,0],[1,1],[1,1]],\"top\":[[1,0],[1,1]],\"right\":[[0,1],[1,1],[1,1]]}. Candidate height plans front-to-back, A through D: [[[0,2],[3,0]],[[3,2],[3,0]],[[1,2],[3,1]],[[1,2],[3,0]]].",
          "sourceId": "refinement-pat-view-consistency-c1",
          "sourceVersion": "dat-continuation-item-v1",
          "reviewStatus": "internal-reviewed",
          "verified": true,
          "progressEligible": true,
          "runtimeIntegrated": true,
          "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
        },
        {
          "id": "refinement-pat-view-consistency-c2",
          "objectiveId": "pat-view-consistency",
          "world": "pat",
          "pool": "check",
          "familyId": "pat-views-candidate-consistency",
          "familyRationale": "Compare explicitly supplied candidates against all three simultaneous views; matching one view is insufficient. Numeric and orientation variants remain this same family.",
          "prompt": "Which candidate produces all three supplied occupied silhouettes in the labeled orientation? Use the height plans to resolve any columns hidden in the perspective aids. Do not rotate a candidate.",
          "choices": [
            "Panel A",
            "Panel B",
            "Panel C",
            "Panel D"
          ],
          "answer": 1,
          "hint": "Align the labeled axes and compare each occupied viewing line. The silhouette uses overlap, never a sum of depths.",
          "explanation": "Only Panel B agrees with front, top and right together. Its front and top share width, front and right share height, and top and right share depth. The other candidates fail at least one supplied view.",
          "feedback": [
            "Panel A fails the stated projection constraints. Its top view disagrees.",
            "Correct. Only Panel B agrees with front, top and right together. Its front and top share width, front and right share height, and top and right share depth. The other candidates fail at least one supplied view.",
            "Panel C fails the stated projection constraints. Its top view disagrees.",
            "Panel D fails the stated projection constraints. Its top view disagrees."
          ],
          "sourceUrls": [
            "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/perceptual_ability_test_section_instructions.pdf"
          ],
          "canonId": "pat-top-front-end",
          "visualCap": "Supplied grids (top-to-bottom rows, 1 occupied): {\"front\":[[0,1],[1,1],[1,1]],\"top\":[[1,1],[1,0]],\"right\":[[0,1],[1,1],[1,1]]}. Candidate height plans front-to-back, A through D: [[[2,0],[0,3]],[[2,0],[1,3]],[[2,1],[1,3]],[[2,2],[1,3]]].",
          "fig": "data/figures/chapters/pat-views-c2-match.dbbdc510e463b41f.svg",
          "figureAlt": "Supplied grids (top-to-bottom rows, 1 occupied): {\"front\":[[0,1],[1,1],[1,1]],\"top\":[[1,1],[1,0]],\"right\":[[0,1],[1,1],[1,1]]}. Candidate height plans front-to-back, A through D: [[[2,0],[0,3]],[[2,0],[1,3]],[[2,1],[1,3]],[[2,2],[1,3]]].",
          "sourceId": "refinement-pat-view-consistency-c2",
          "sourceVersion": "dat-continuation-item-v1",
          "reviewStatus": "internal-reviewed",
          "verified": true,
          "progressEligible": true,
          "runtimeIntegrated": true,
          "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
        },
        {
          "id": "refinement-pat-view-consistency-c3",
          "objectiveId": "pat-view-consistency",
          "world": "pat",
          "pool": "check",
          "familyId": "pat-views-candidate-consistency",
          "familyRationale": "Compare explicitly supplied candidates against all three simultaneous views; matching one view is insufficient. Numeric and orientation variants remain this same family.",
          "prompt": "Which candidate produces all three supplied occupied silhouettes in the labeled orientation? Use the height plans to resolve any columns hidden in the perspective aids. Do not rotate a candidate.",
          "choices": [
            "Panel A",
            "Panel B",
            "Panel C",
            "Panel D"
          ],
          "answer": 2,
          "hint": "Align the labeled axes and compare each occupied viewing line. The silhouette uses overlap, never a sum of depths.",
          "explanation": "Only Panel C agrees with front, top and right together. Its front and top share width, front and right share height, and top and right share depth. The other candidates fail at least one supplied view.",
          "feedback": [
            "Panel A fails the stated projection constraints. Its top view disagrees.",
            "Panel B fails the stated projection constraints. Its front view disagrees.",
            "Correct. Only Panel C agrees with front, top and right together. Its front and top share width, front and right share height, and top and right share depth. The other candidates fail at least one supplied view.",
            "Panel D fails the stated projection constraints. Its top view disagrees."
          ],
          "sourceUrls": [
            "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/perceptual_ability_test_section_instructions.pdf"
          ],
          "canonId": "pat-top-front-end",
          "visualCap": "Supplied grids (top-to-bottom rows, 1 occupied): {\"front\":[[1,0],[1,1],[1,1]],\"top\":[[0,1],[1,1]],\"right\":[[1,0],[1,1],[1,1]]}. Candidate height plans front-to-back, A through D: [[[3,0],[0,2]],[[3,3],[0,2]],[[3,1],[0,2]],[[3,1],[1,2]]].",
          "fig": "data/figures/chapters/pat-views-c3-match.c2c1046dc92630bf.svg",
          "figureAlt": "Supplied grids (top-to-bottom rows, 1 occupied): {\"front\":[[1,0],[1,1],[1,1]],\"top\":[[0,1],[1,1]],\"right\":[[1,0],[1,1],[1,1]]}. Candidate height plans front-to-back, A through D: [[[3,0],[0,2]],[[3,3],[0,2]],[[3,1],[0,2]],[[3,1],[1,2]]].",
          "sourceId": "refinement-pat-view-consistency-c3",
          "sourceVersion": "dat-continuation-item-v1",
          "reviewStatus": "internal-reviewed",
          "verified": true,
          "progressEligible": true,
          "runtimeIntegrated": true,
          "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
        },
        {
          "id": "refinement-pat-view-consistency-l1",
          "objectiveId": "pat-view-consistency",
          "world": "pat",
          "pool": "later",
          "familyId": "pat-views-report-feasibility",
          "familyRationale": "Reserved transfer: no candidate solid is supplied. Determine whether a three-view report can describe any supported-column solid by detecting contradictory shared constraints. This global existence task is absent from guided examples.",
          "prompt": "Team Entropy has sent four three-view reports. Which report could come from any nonempty solid of supported unit columns no taller than three units? The same front/top/right convention applies. Three reports contain incompatible requirements.",
          "choices": [
            "Panel A",
            "Panel B",
            "Panel C",
            "Panel D"
          ],
          "answer": 0,
          "hint": "Align the labeled axes and compare each occupied viewing line. The silhouette uses overlap, never a sum of depths.",
          "explanation": "Only Panel A has compatible requirements. A witness has front-to-back height rows [[2,2],[2,2]]. One wrong report requires an unmatched height; the other two require material where their top footprint is empty.",
          "feedback": [
            "Correct. Only Panel A has compatible requirements. A witness has front-to-back height rows [[2,2],[2,2]]. One wrong report requires an unmatched height; the other two require material where their top footprint is empty.",
            "Panel B fails the stated projection constraints. The front view requires height three, but the right-end view has no material at that height anywhere.",
            "Panel C fails the stated projection constraints. The top view has no occupied cell in the left column, but the front view requires one.",
            "Panel D fails the stated projection constraints. The top view has no front-row material, but the right-end view requires material at its front position."
          ],
          "sourceUrls": [
            "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/perceptual_ability_test_section_instructions.pdf"
          ],
          "canonId": "pat-top-front-end",
          "visualCap": "Reports A through D, each listing top-to-bottom occupied grids front, top, right: [{\"front\":[[0,0],[1,1],[1,1]],\"top\":[[1,1],[1,1]],\"right\":[[0,0],[1,1],[1,1]]},{\"front\":[[1,0],[1,1],[1,1]],\"top\":[[1,1],[1,1]],\"right\":[[0,0],[1,1],[1,1]]},{\"front\":[[0,0],[1,1],[1,1]],\"top\":[[0,1],[0,1]],\"right\":[[0,0],[1,1],[1,1]]},{\"front\":[[0,0],[1,1],[1,1]],\"top\":[[1,1],[0,0]],\"right\":[[0,0],[1,1],[1,1]]}].",
          "fig": "data/figures/chapters/pat-views-l1-match.f0c6c955d0a8fbad.svg",
          "figureAlt": "Reports A through D, each listing top-to-bottom occupied grids front, top, right: [{\"front\":[[0,0],[1,1],[1,1]],\"top\":[[1,1],[1,1]],\"right\":[[0,0],[1,1],[1,1]]},{\"front\":[[1,0],[1,1],[1,1]],\"top\":[[1,1],[1,1]],\"right\":[[0,0],[1,1],[1,1]]},{\"front\":[[0,0],[1,1],[1,1]],\"top\":[[0,1],[0,1]],\"right\":[[0,0],[1,1],[1,1]]},{\"front\":[[0,0],[1,1],[1,1]],\"top\":[[1,1],[0,0]],\"right\":[[0,0],[1,1],[1,1]]}].",
          "sourceId": "refinement-pat-view-consistency-l1",
          "sourceVersion": "dat-continuation-item-v1",
          "reviewStatus": "internal-reviewed",
          "verified": true,
          "progressEligible": true,
          "runtimeIntegrated": true,
          "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
        },
        {
          "id": "refinement-pat-view-consistency-l2",
          "objectiveId": "pat-view-consistency",
          "world": "pat",
          "pool": "later",
          "familyId": "pat-views-report-feasibility",
          "familyRationale": "Reserved transfer: no candidate solid is supplied. Determine whether a three-view report can describe any supported-column solid by detecting contradictory shared constraints. This global existence task is absent from guided examples.",
          "prompt": "Team Entropy has sent four three-view reports. Which report could come from any nonempty solid of supported unit columns no taller than three units? The same front/top/right convention applies. Three reports contain incompatible requirements.",
          "choices": [
            "Panel A",
            "Panel B",
            "Panel C",
            "Panel D"
          ],
          "answer": 3,
          "hint": "Align the labeled axes and compare each occupied viewing line. The silhouette uses overlap, never a sum of depths.",
          "explanation": "Only Panel D has compatible requirements. A witness has front-to-back height rows [[2,1],[1,1]]. One wrong report requires an unmatched height; the other two require material where their top footprint is empty.",
          "feedback": [
            "Panel A fails the stated projection constraints. The front view requires height three, but the right-end view has no material at that height anywhere.",
            "Panel B fails the stated projection constraints. The top view has no occupied cell in the left column, but the front view requires one.",
            "Panel C fails the stated projection constraints. The top view has no front-row material, but the right-end view requires material at its front position.",
            "Correct. Only Panel D has compatible requirements. A witness has front-to-back height rows [[2,1],[1,1]]. One wrong report requires an unmatched height; the other two require material where their top footprint is empty."
          ],
          "sourceUrls": [
            "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/perceptual_ability_test_section_instructions.pdf"
          ],
          "canonId": "pat-top-front-end",
          "visualCap": "Reports A through D, each listing top-to-bottom occupied grids front, top, right: [{\"front\":[[1,0],[1,0],[1,1]],\"top\":[[1,1],[1,1]],\"right\":[[0,0],[1,0],[1,1]]},{\"front\":[[0,0],[1,0],[1,1]],\"top\":[[0,1],[0,1]],\"right\":[[0,0],[1,0],[1,1]]},{\"front\":[[0,0],[1,0],[1,1]],\"top\":[[1,1],[0,0]],\"right\":[[0,0],[1,0],[1,1]]},{\"front\":[[0,0],[1,0],[1,1]],\"top\":[[1,1],[1,1]],\"right\":[[0,0],[1,0],[1,1]]}].",
          "fig": "data/figures/chapters/pat-views-l2-match.6a9a1ae9700082cd.svg",
          "figureAlt": "Reports A through D, each listing top-to-bottom occupied grids front, top, right: [{\"front\":[[1,0],[1,0],[1,1]],\"top\":[[1,1],[1,1]],\"right\":[[0,0],[1,0],[1,1]]},{\"front\":[[0,0],[1,0],[1,1]],\"top\":[[0,1],[0,1]],\"right\":[[0,0],[1,0],[1,1]]},{\"front\":[[0,0],[1,0],[1,1]],\"top\":[[1,1],[0,0]],\"right\":[[0,0],[1,0],[1,1]]},{\"front\":[[0,0],[1,0],[1,1]],\"top\":[[1,1],[1,1]],\"right\":[[0,0],[1,0],[1,1]]}].",
          "sourceId": "refinement-pat-view-consistency-l2",
          "sourceVersion": "dat-continuation-item-v1",
          "reviewStatus": "internal-reviewed",
          "verified": true,
          "progressEligible": true,
          "runtimeIntegrated": true,
          "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
        }
      ],
      "contentSha256": "4249536ff263180a463ec95254dd2f92ab8ba1a0ea046a9d38ae8660d8192020",
      "reviewStatus": "internal-reviewed",
      "verified": true,
      "progressEligible": true,
      "runtimeIntegrated": true,
      "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
    }
  ],
  "refinementReturnItems": [
    {
      "id": "refine-gc-catalyst-cycle-a",
      "objectiveId": "gc-catalyst",
      "world": "gc",
      "pool": "later",
      "familyId": "gc-catalyst-cycle-bookkeeping",
      "familyRationale": "Trace a catalyst through an explicit multi-step cycle and cancel restored species to determine its net role. Existing teaching defines regeneration, but its tasks use energy profiles or equilibrium/rate observations; no admitted task asks the learner to audit written catalytic steps. Both candidates belong to this one family.",
      "prompt": "Team Entropy has mislabeled an accelerated reaction pathway. In this fictional, complete two-step model, the starting mixture contains A, B and C, but no AC or AB: (1) A + C → AC; (2) AC + B → AB + C. The arrows show the only steps in one completed cycle. Which starting species is restored and can serve again as the catalyst?",
      "choices": [
        "A, because it enters the first step.",
        "AC, because it is made and then used.",
        "C, because it is used and then restored.",
        "AB, because it is the final product."
      ],
      "answer": 2,
      "hint": "Follow each starting species through the whole cycle, rather than stopping after the first step.",
      "explanation": "C participates in step 1 and returns in step 2. AC is formed along the path and then used; A and B are incorporated into AB. Cancelling AC and C from the summed steps leaves A + B → AB. The supplied accelerated pathway therefore regenerates C overall.",
      "feedback": [
        "A enters the pathway but is incorporated into AB rather than restored as A.",
        "AC is absent initially, formed in step 1 and consumed in step 2. It is an intermediate, not the restored starting catalyst in this model.",
        "Correct: C is present initially, participates and returns at the end of the cycle.",
        "AB is produced overall; it is not the restored starting species."
      ],
      "sourceUrls": [
        "https://goldbook.iupac.org/terms/view/C00876",
        "https://openstax.org/books/chemistry-2e/pages/12-7-catalysis"
      ],
      "sourceId": "refine-gc-catalyst-cycle-a",
      "sourceVersion": "dat-refinement-item-v1",
      "reviewStatus": "internal-reviewed",
      "verified": true,
      "progressEligible": true,
      "runtimeIntegrated": true,
      "reviewScope": "Independent internal source, answer-key and semantic family review; no external specialist or DAT-readiness certification."
    },
    {
      "id": "refine-gc-catalyst-cycle-b",
      "objectiveId": "gc-catalyst",
      "world": "gc",
      "pool": "later",
      "familyId": "gc-catalyst-cycle-bookkeeping",
      "familyRationale": "Trace a catalyst through an explicit multi-step cycle and cancel restored species to determine its net role. Existing teaching defines regeneration, but its tasks use energy profiles or equilibrium/rate observations; no admitted task asks the learner to audit written catalytic steps. Both candidates belong to this one family.",
      "prompt": "A fictional accelerated pathway starts with K, L and M and follows this complete cycle: (1) K + L → KL; (2) KL + M → KLM; (3) KLM → K + LM. There are no other steps. Team Entropy lists K as a reactant consumed overall. Which correction follows when the three steps are added and species appearing on both sides are cancelled?",
      "choices": [
        "The net reaction is L + M → LM; K is restored overall.",
        "The net reaction is K + L + M → LM; K is consumed overall.",
        "The net reaction is L + M → K + LM; K is created overall.",
        "The net reaction is K + L → KL; the later steps do not affect the net reaction."
      ],
      "answer": 0,
      "hint": "Count each appearance on the reactant and product sides across all three steps.",
      "explanation": "KL and KLM each appear once on each side of the summed steps and cancel. K also cancels: it enters step 1 and returns in step 3. L and M are consumed while LM is formed. Thus L + M → LM is the net reaction, and the specified cycle can use K again.",
      "feedback": [
        "Correct: the complete cycle restores K and converts L plus M to LM.",
        "This omits the K returned in step 3.",
        "This counts the returned K but omits the K used in step 1.",
        "This stops after the first step and leaves out the stated complete cycle."
      ],
      "sourceUrls": [
        "https://goldbook.iupac.org/terms/view/C00876",
        "https://openstax.org/books/chemistry-2e/pages/12-7-catalysis"
      ],
      "sourceId": "refine-gc-catalyst-cycle-b",
      "sourceVersion": "dat-refinement-item-v1",
      "reviewStatus": "internal-reviewed",
      "verified": true,
      "progressEligible": true,
      "runtimeIntegrated": true,
      "reviewScope": "Independent internal source, answer-key and semantic family review; no external specialist or DAT-readiness certification."
    },
    {
      "id": "refine-bio-rate-ranking-a",
      "objectiveId": "bio-enzyme-rate",
      "world": "bio",
      "pool": "later",
      "familyId": "bio-rate-preparation-rank-reversal",
      "familyRationale": "Choose between two distinct enzyme preparations in two substrate environments when higher limiting capacity trades off against higher Km. The target is a reversed ranking, not the already-taught reading of one half-maximum, isolated equation substitution, or changing the amount of the same enzyme. Both parameter sets are supplied; no affinity inference is required.",
      "prompt": "Two enzyme preparations act on the same substrate in separate fresh initial-rate assays and each obeys v = Vmax[S]/(Km + [S]). Preparation A has Vmax = 80 µM/min and Km = 2 mM; B has Vmax = 120 µM/min and Km = 6 mM. Their amounts, temperature and pH stay fixed, with no inhibitors or depletion. Which preparation is faster at [S] = 2 mM, and which is faster at [S] = 10 mM?",
      "choices": [
        "A at both concentrations.",
        "A at 2 mM; B at 10 mM.",
        "B at both concentrations.",
        "B at 2 mM; A at 10 mM."
      ],
      "answer": 1,
      "hint": "Compare both preparations at each substrate concentration; neither Vmax nor Km alone settles both comparisons.",
      "explanation": "At 2 mM, A gives 80 × 2/(2 + 2) = 40 µM/min while B gives 120 × 2/(6 + 2) = 30. At 10 mM, A gives 800/12, about 66.7, while B gives 1200/16 = 75. The ranking reverses: A is faster in the first environment and B in the second. This is rate reasoning, not a claim that Km is universally a binding-affinity constant.",
      "feedback": [
        "A wins at 2 mM, but its 66.7 µM/min at 10 mM is below B’s 75.",
        "Correct: use the whole model at each concentration; the higher-capacity preparation wins at 10 mM.",
        "B has the larger Vmax but is slower at 2 mM in the supplied model.",
        "This reverses both calculated comparisons."
      ],
      "sourceUrls": [
        "https://iubmb.qmul.ac.uk/kinetics/ek4t6.html"
      ],
      "sourceId": "refine-bio-rate-ranking-a",
      "sourceVersion": "dat-refinement-item-v1",
      "reviewStatus": "internal-reviewed",
      "verified": true,
      "progressEligible": true,
      "runtimeIntegrated": true,
      "reviewScope": "Independent internal source, answer-key and semantic family review; no external specialist or DAT-readiness certification."
    },
    {
      "id": "refine-bio-rate-ranking-b",
      "objectiveId": "bio-enzyme-rate",
      "world": "bio",
      "pool": "later",
      "familyId": "bio-rate-preparation-rank-reversal",
      "familyRationale": "Choose between two distinct enzyme preparations in two substrate environments when higher limiting capacity trades off against higher Km. The target is a reversed ranking, not the already-taught reading of one half-maximum, isolated equation substitution, or changing the amount of the same enzyme. Both parameter sets are supplied; no affinity inference is required.",
      "prompt": "Two fresh preparations obey the single-substrate model v = Vmax[S]/(Km + [S]) under the same fixed temperature and pH. P has Vmax = 60 µM/min and Km = 1 mM. Q has Vmax = 100 µM/min and Km = 5 mM. Each amount remains fixed and there is no inhibition or depletion. The lab needs the faster preparation first at 1 mM substrate, then at 9 mM substrate. Which choice meets those two requests?",
      "choices": [
        "Q for both requests because its Vmax is larger.",
        "P for both requests because its Km is smaller.",
        "Q at 1 mM, then P at 9 mM.",
        "P at 1 mM, then Q at 9 mM."
      ],
      "answer": 3,
      "hint": "Compute a rate for each preparation in each environment before ranking them.",
      "explanation": "At 1 mM, P gives 60/2 = 30 µM/min and Q gives 100/6, about 16.7. At 9 mM, P gives 540/10 = 54 while Q gives 900/14, about 64.3. P wins at the lower concentration; Q wins at the higher one. A larger limiting rate need not mean a larger rate at every finite substrate concentration.",
      "feedback": [
        "Q’s higher limiting rate does not overcome its lower rate at 1 mM.",
        "P is faster at 1 mM but slower at 9 mM; Km alone cannot decide both requests.",
        "The calculated comparisons run in the opposite order.",
        "Correct: P gives 30 versus about 16.7 at 1 mM; Q gives about 64.3 versus 54 at 9 mM."
      ],
      "sourceUrls": [
        "https://iubmb.qmul.ac.uk/kinetics/ek4t6.html"
      ],
      "sourceId": "refine-bio-rate-ranking-b",
      "sourceVersion": "dat-refinement-item-v1",
      "reviewStatus": "internal-reviewed",
      "verified": true,
      "progressEligible": true,
      "runtimeIntegrated": true,
      "reviewScope": "Independent internal source, answer-key and semantic family review; no external specialist or DAT-readiness certification."
    },
    {
      "id": "refine-bio-rate-dilution-a",
      "objectiveId": "bio-enzyme-rate",
      "world": "bio",
      "pool": "later",
      "familyId": "bio-rate-joint-dilution",
      "familyRationale": "Predict a concentration rate after a controlled dilution simultaneously changes enzyme concentration and substrate concentration. Existing amount-perturbation teaching holds substrate fixed; this task requires carrying both changes through the stated model. The two dilution factors are alternatives in one family, not separate novelty.",
      "prompt": "An initial-rate preparation obeys v = Vmax[S]/(Km + [S]), with Vmax = 90 µM/min, Km = 3 mM and [S] = 3 mM. To prepare a second fresh initial-rate assay, it is mixed with an equal volume of compatible substrate-free, enzyme-free buffer. This halves both active-enzyme concentration and substrate concentration; pH, temperature and enzyme properties remain unchanged. Vmax, expressed as a concentration rate, scales with active-enzyme concentration. What initial concentration rate does the model predict for that diluted assay?",
      "choices": [
        "45 µM/min.",
        "22.5 µM/min.",
        "15 µM/min.",
        "90 µM/min."
      ],
      "answer": 2,
      "hint": "Update both Vmax and [S]; Km does not scale with the added buffer volume.",
      "explanation": "The new Vmax is 45 µM/min and the new [S] is 1.5 mM, while Km remains 3 mM. The new rate is 45 × 1.5/(3 + 1.5) = 15 µM/min. The original rate was 45 µM/min, so this joint dilution reduces the concentration rate to one-third, not merely one-half. The question asks concentration formed per time, not total product amount per time in the larger volume.",
      "feedback": [
        "45 µM/min is the original rate, and also the new limiting rate; the diluted substrate does not reach that limit.",
        "22.5 µM/min accounts for halving enzyme concentration while incorrectly keeping substrate at 3 mM.",
        "Correct: both concentrations change, giving 15 µM/min with the unchanged Km.",
        "90 µM/min is the original limiting rate, not the diluted initial rate."
      ],
      "sourceUrls": [
        "https://iubmb.qmul.ac.uk/kinetics/ek4t6.html"
      ],
      "sourceId": "refine-bio-rate-dilution-a",
      "sourceVersion": "dat-refinement-item-v1",
      "reviewStatus": "internal-reviewed",
      "verified": true,
      "progressEligible": true,
      "runtimeIntegrated": true,
      "reviewScope": "Independent internal source, answer-key and semantic family review; no external specialist or DAT-readiness certification."
    },
    {
      "id": "refine-bio-rate-dilution-b",
      "objectiveId": "bio-enzyme-rate",
      "world": "bio",
      "pool": "later",
      "familyId": "bio-rate-joint-dilution",
      "familyRationale": "Predict a concentration rate after a controlled dilution simultaneously changes enzyme concentration and substrate concentration. Existing amount-perturbation teaching holds substrate fixed; this task requires carrying both changes through the stated model. The two dilution factors are alternatives in one family, not separate novelty.",
      "prompt": "A fresh preparation has Vmax = 120 µM/min, Km = 4 mM and substrate concentration 12 mM in the model v = Vmax[S]/(Km + [S]). A second fresh initial-rate assay is prepared by adding two volumes of compatible substrate-free, enzyme-free buffer to one volume of preparation. Both active-enzyme and substrate concentrations therefore become one-third of their original values; temperature, pH and enzyme properties stay fixed. Vmax in concentration units scales with active-enzyme concentration. What is the new initial concentration rate?",
      "choices": [
        "20 µM/min.",
        "30 µM/min.",
        "60 µM/min.",
        "90 µM/min."
      ],
      "answer": 0,
      "hint": "The final volume is three times the starting volume. Carry its effect into both enzyme capacity and substrate concentration.",
      "explanation": "Dilution makes Vmax = 40 µM/min and [S] = 4 mM. Km remains 4 mM, so v = 40 × 4/(4 + 4) = 20 µM/min. Dividing the original 90 µM/min by three would account for the enzyme dilution alone while missing the simultaneous substrate change.",
      "feedback": [
        "Correct: the new substrate concentration equals the unchanged Km, so the rate is half of the new 40 µM/min limit.",
        "30 µM/min ignores the simultaneous fall in substrate concentration.",
        "60 µM/min uses the original Vmax with the diluted substrate, ignoring enzyme dilution.",
        "90 µM/min is the original rate before either concentration changed."
      ],
      "sourceUrls": [
        "https://iubmb.qmul.ac.uk/kinetics/ek4t6.html"
      ],
      "sourceId": "refine-bio-rate-dilution-b",
      "sourceVersion": "dat-refinement-item-v1",
      "reviewStatus": "internal-reviewed",
      "verified": true,
      "progressEligible": true,
      "runtimeIntegrated": true,
      "reviewScope": "Independent internal source, answer-key and semantic family review; no external specialist or DAT-readiness certification."
    },
    {
      "id": "refine-bio-inhibition-normalized-a",
      "objectiveId": "bio-enzyme-inhibition",
      "world": "bio",
      "pool": "later",
      "familyId": "bio-inhibition-enzyme-normalized-inference",
      "familyRationale": "Separate a preparation-amount change from an inhibitor effect before classifying the kinetic pattern. Existing tasks compare equal active-enzyme amounts or ask which additional measurements to collect. Here the complete fitted parameters are given, but raw Vmax values are not directly comparable. The scaling rule is supplied so this does not test an untaught prerequisite.",
      "prompt": "Team Entropy compares unmatched enzyme amounts. Enzyme alone at concentration E has Vmax = 80 µM/min and Km = 4 mM. With reversible inhibitor I, a preparation containing 2E enzyme has fitted Vmax = 80 µM/min and apparent Km = 4 mM. The same enzyme properties, temperature and pH apply, with no damage. Free I is held fixed across its substrate series; the only allowed inhibitor models are competitive and pure noncompetitive. At fixed inhibitor conditions, Vmax scales with enzyme concentration while Km does not. After accounting for the enzyme amount, which interpretation fits?",
      "choices": [
        "Competitive inhibition, because the two reported Vmax values are equal.",
        "No inhibitor effect, because the two reported Vmax values are equal.",
        "Both models are impossible because the reported Km is unchanged.",
        "Pure noncompetitive inhibition: the capacity per unit enzyme has fallen by half."
      ],
      "answer": 3,
      "hint": "Find the limiting rate expected for 2E without inhibition before comparing it with the inhibited preparation.",
      "explanation": "Without inhibition, 2E would give Vmax = 160 µM/min. The observed 80 is half of that matched-enzyme expectation, while Km is unchanged. Equivalently, scaling the inhibited preparation back to E gives a 40 µM/min limit. This is the specified pure noncompetitive pattern. Equal raw limits concealed the inhibition because the enzyme concentrations differed.",
      "feedback": [
        "Competitive inhibition preserves the limit at the same enzyme amount; 2E would then retain the uninhibited 160 µM/min limit, not 80.",
        "The doubled enzyme amount should double the uninhibited limit. Its failure to do so is evidence of the stipulated inhibitor effect.",
        "An unchanged Km is compatible with the specified pure noncompetitive model.",
        "Correct: compare equal enzyme amounts; capacity is reduced while Km stays fixed."
      ],
      "sourceUrls": [
        "https://iubmb.qmul.ac.uk/kinetics/ek4t6.html"
      ],
      "sourceId": "refine-bio-inhibition-normalized-a",
      "sourceVersion": "dat-refinement-item-v1",
      "reviewStatus": "internal-reviewed",
      "verified": true,
      "progressEligible": true,
      "runtimeIntegrated": true,
      "reviewScope": "Independent internal source, answer-key and semantic family review; no external specialist or DAT-readiness certification."
    },
    {
      "id": "refine-bio-inhibition-normalized-b",
      "objectiveId": "bio-enzyme-inhibition",
      "world": "bio",
      "pool": "later",
      "familyId": "bio-inhibition-enzyme-normalized-inference",
      "familyRationale": "Separate a preparation-amount change from an inhibitor effect before classifying the kinetic pattern. Existing tasks compare equal active-enzyme amounts or ask which additional measurements to collect. Here the complete fitted parameters are given, but raw Vmax values are not directly comparable. The scaling rule is supplied so this does not test an untaught prerequisite.",
      "prompt": "Enzyme alone at concentration E has Vmax = 90 µM/min and Km = 3 mM. With reversible inhibitor J, a preparation containing 0.5E enzyme has fitted Vmax = 45 µM/min and apparent Km = 12 mM. The same enzyme properties, temperature and pH apply, with no damage. Free J is fixed across its substrate series, and only competitive or pure noncompetitive inhibition is allowed. At fixed inhibitor conditions, Vmax scales with enzyme concentration while Km does not. Which interpretation accounts for the unequal enzyme amounts?",
      "choices": [
        "Pure noncompetitive inhibition, because the reported Vmax has halved.",
        "Competitive inhibition: the smaller enzyme amount accounts for the lower reported Vmax, while apparent Km has increased.",
        "No inhibitor effect: halving enzyme concentration also multiplies Km by four.",
        "Pure noncompetitive inhibition: it must increase Km whenever enzyme concentration is lower."
      ],
      "answer": 1,
      "hint": "Compare 0.5E with the limiting rate that 0.5E would have without inhibitor.",
      "explanation": "An uninhibited 0.5E preparation would have Vmax = 45 µM/min and Km = 3 mM. J preserves that matched-enzyme limiting rate but raises apparent Km to 12 mM. The specified competitive model fits. Treating the raw 90-to-45 change as inhibitor-caused would mistake the enzyme-amount change for inhibition of the limiting rate.",
      "feedback": [
        "The lower raw Vmax is fully explained by halving the enzyme amount; the increased apparent Km is inconsistent with the specified pure noncompetitive pattern.",
        "Correct: after matching enzyme amounts, the limit is unchanged and apparent Km is higher.",
        "Changing enzyme amount alone does not change Km in this model.",
        "The explicitly pure noncompetitive model leaves Km unchanged; lowering enzyme amount does not change that rule."
      ],
      "sourceUrls": [
        "https://iubmb.qmul.ac.uk/kinetics/ek4t6.html"
      ],
      "sourceId": "refine-bio-inhibition-normalized-b",
      "sourceVersion": "dat-refinement-item-v1",
      "reviewStatus": "internal-reviewed",
      "verified": true,
      "progressEligible": true,
      "runtimeIntegrated": true,
      "reviewScope": "Independent internal source, answer-key and semantic family review; no external specialist or DAT-readiness certification."
    }
  ],
  "refinementCanonLinks": [
    {
      "objectiveId": "bio-diffusion",
      "scope": "facet",
      "support": "The Canon supplies the downhill concentration comparison and distinguishes a direct lipid path from a protein path. This supports the guide’s permitted-path and concentration-direction facet.",
      "exclusions": [
        "Thermal motion, continued two-way crossings and net-versus-individual motion are supplied by the game’s primary references, not explicitly developed by this Canon sheet.",
        "No ion/electrical-gradient claim is imported; this game example follows an uncharged solute."
      ],
      "targetGuideSha256": "6050ade4fd2a4877187a95a1f321bff15d6e89ce724c56e72231f3b3030a9012",
      "canonicalPointers": [
        "/key/0",
        "/key/1"
      ],
      "canon": {
        "id": "bio-membrane-transport",
        "version": "0.2.1",
        "sourceSha256": "11666ab830c65c0e37d6bc90b14613b0138e3aa8be9a16c2631c5557a2dcca9d",
        "sourceRelativePath": "visuals/sheets/bio/bio-membrane-transport.json",
        "sourceRepository": "canon-expansion/checkpoint-f"
      },
      "reviewStatus": "internal-reviewed",
      "verified": true,
      "progressEligible": true,
      "runtimeIntegrated": true,
      "reviewScope": "Independent internal source, answer-key and semantic family review; no external specialist or DAT-readiness certification."
    },
    {
      "objectiveId": "bio-transport",
      "scope": "guide",
      "support": "The Canon distinguishes direct and protein-mediated passive paths, a directly ATP-coupled pump, and gradient-coupled transport. The game’s existing guide uses those distinctions with an explicit energy-coupling definition.",
      "exclusions": [
        "The source title “Uphill costs ATP” is qualified: transport may be coupled indirectly to an existing electrochemical gradient, not necessarily direct ATP hydrolysis at the transporter.",
        "A protein path alone does not establish active transport. No pump stoichiometry or source quiz is imported."
      ],
      "targetGuideSha256": "5a286189d543ad4d7e2f6a3da37f1b68c86903ab80ab00fc43c261ff7f4eb119",
      "canonicalPointers": [
        "/key/0",
        "/key/1",
        "/key/2",
        "/key/3",
        "/traps/1",
        "/traps/2"
      ],
      "canon": {
        "id": "bio-membrane-transport",
        "version": "0.2.1",
        "sourceSha256": "11666ab830c65c0e37d6bc90b14613b0138e3aa8be9a16c2631c5557a2dcca9d",
        "sourceRelativePath": "visuals/sheets/bio/bio-membrane-transport.json",
        "sourceRepository": "canon-expansion/checkpoint-f"
      },
      "reviewStatus": "internal-reviewed",
      "verified": true,
      "progressEligible": true,
      "runtimeIntegrated": true,
      "reviewScope": "Independent internal source, answer-key and semantic family review; no external specialist or DAT-readiness certification."
    },
    {
      "objectiveId": "bio-osmosis",
      "scope": "facet",
      "support": "The Canon supplies the direction of water movement in a dilute or concentrated bath. The game narrows this comparison to water-permeable membranes, trapped solutes and equal initial pressure.",
      "exclusions": [
        "Pressure opposing osmotic flow and explicit membrane-permeability conditions remain primary-source extensions rather than claims that the Canon teaches them.",
        "The unqualified “water follows solute” wording and universal “0.9% solute inside” shorthand are not imported."
      ],
      "targetGuideSha256": "9a2855493881a2d3cf4b294c5a47bf67f1708c6f156e094d376063fb11c30ca6",
      "canonicalPointers": [
        "/key/4",
        "/traps/0",
        "/worked/steps/0",
        "/worked/steps/1"
      ],
      "canon": {
        "id": "bio-membrane-transport",
        "version": "0.2.1",
        "sourceSha256": "11666ab830c65c0e37d6bc90b14613b0138e3aa8be9a16c2631c5557a2dcca9d",
        "sourceRelativePath": "visuals/sheets/bio/bio-membrane-transport.json",
        "sourceRepository": "canon-expansion/checkpoint-f"
      },
      "reviewStatus": "internal-reviewed",
      "verified": true,
      "progressEligible": true,
      "runtimeIntegrated": true,
      "reviewScope": "Independent internal source, answer-key and semantic family review; no external specialist or DAT-readiness certification."
    },
    {
      "objectiveId": "bio-animal",
      "scope": "guide",
      "support": "The Canon connects a wall-free animal cell’s water entry to swelling and possible lysis, and a hypertonic bath to water loss. The guide preserves this bounded cell-volume reasoning.",
      "exclusions": [
        "Water must cross and the compared solutes must remain effectively nonpenetrating; this is not a claim about every real solution.",
        "Small swelling does not establish rupture, and no universal intracellular percentage or source numerical example is imported."
      ],
      "targetGuideSha256": "00eaea7d0a58b63e63d0aec69b3dc9304cd177a84c10c73b0cd78f8e4b3cdae5",
      "canonicalPointers": [
        "/key/4",
        "/worked/steps/1",
        "/worked/steps/2"
      ],
      "canon": {
        "id": "bio-membrane-transport",
        "version": "0.2.1",
        "sourceSha256": "11666ab830c65c0e37d6bc90b14613b0138e3aa8be9a16c2631c5557a2dcca9d",
        "sourceRelativePath": "visuals/sheets/bio/bio-membrane-transport.json",
        "sourceRepository": "canon-expansion/checkpoint-f"
      },
      "reviewStatus": "internal-reviewed",
      "verified": true,
      "progressEligible": true,
      "runtimeIntegrated": true,
      "reviewScope": "Independent internal source, answer-key and semantic family review; no external specialist or DAT-readiness certification."
    },
    {
      "objectiveId": "gc-barrier",
      "scope": "facet",
      "support": "The source energy-path model measures the forward or reverse climb from the appropriate starting energy to the peak. This supports the guide’s barrier-versus-endpoint-difference distinction.",
      "exclusions": [
        "The Canon model uses an enthalpy-style ΔH profile; it does not establish the game’s separate actual Gibbs-energy favorability statement.",
        "A reaction-coordinate axis is not elapsed time. No source diagram, numerical case or prediction bank is imported."
      ],
      "targetGuideSha256": "cac747f7590dc30a841b7634298f897a654df8d8ee01df3d44a96b5d022a0d8f",
      "canonicalPointers": [
        "/hero/idea",
        "/hero/verify/4",
        "/hero/verify/5"
      ],
      "canon": {
        "id": "gc-kinetics-rate-laws",
        "version": "0.2.1",
        "sourceSha256": "262bbbdb138378a3eaec3c0ca2cdaeacd80979d65582dd536b88ef3915950b62",
        "sourceRelativePath": "visuals/sheets/gchem/gc-kinetics-rate-laws.json",
        "sourceRepository": "canon-expansion/checkpoint-f"
      },
      "reviewStatus": "internal-reviewed",
      "verified": true,
      "progressEligible": true,
      "runtimeIntegrated": true,
      "reviewScope": "Independent internal source, answer-key and semantic family review; no external specialist or DAT-readiness certification."
    },
    {
      "objectiveId": "gc-catalyst",
      "scope": "facet",
      "support": "The source contrasts a lower-barrier pathway with unchanged reactant and product levels. This supports the guide’s alternative-path and unchanged-endpoint facet.",
      "exclusions": [
        "Catalyst regeneration through a cycle and the unchanged equilibrium constant at a fixed temperature remain supported by the game’s primary chemistry references, not explicitly taught by this source slice.",
        "The broader rate-law material and the source’s unqualified concentration/rate-constant claim are outside this link."
      ],
      "targetGuideSha256": "6b0aad1aeb37eee43e05d16f0b2d2b63648d36ed3dae7af059e37c2197b212f9",
      "canonicalPointers": [
        "/key/3",
        "/traps/1",
        "/hero/print_caption"
      ],
      "canon": {
        "id": "gc-kinetics-rate-laws",
        "version": "0.2.1",
        "sourceSha256": "262bbbdb138378a3eaec3c0ca2cdaeacd80979d65582dd536b88ef3915950b62",
        "sourceRelativePath": "visuals/sheets/gchem/gc-kinetics-rate-laws.json",
        "sourceRepository": "canon-expansion/checkpoint-f"
      },
      "reviewStatus": "internal-reviewed",
      "verified": true,
      "progressEligible": true,
      "runtimeIntegrated": true,
      "reviewScope": "Independent internal source, answer-key and semantic family review; no external specialist or DAT-readiness certification."
    },
    {
      "objectiveId": "oc-electrons",
      "scope": "facet",
      "support": "The Canon states that a full-headed curved arrow begins at an existing pair and tracks the pair to a new location, and warns that coupled arrows must be read together. This supports the general electron-bookkeeping facet.",
      "exclusions": [
        "This Canon’s displayed coupled-arrow example concerns resonance; the game’s substitution and carbonyl-addition applications use separately reviewed primary organic-chemistry support.",
        "Do not treat resonance contributors as time-separated mechanistic intermediates. No source structure, check or answer is imported."
      ],
      "targetGuideSha256": "54f4fbcc4598bba9cac388fba9e7c9c0d592355c144e2580b4f1e282836422fe",
      "canonicalPointers": [
        "/key/0",
        "/key/2",
        "/traps/0",
        "/traps/1"
      ],
      "canon": {
        "id": "oc-electron-flow",
        "version": "0.1.0",
        "sourceSha256": "3ae67f4c30377e0d194d35d1563785f8492ebd89a0b6ac32c545fc6aa554b448",
        "sourceRelativePath": "visuals/sheets/ochem/oc-electron-flow.json",
        "sourceRepository": "canon-expansion/checkpoint-f"
      },
      "reviewStatus": "internal-reviewed",
      "verified": true,
      "progressEligible": true,
      "runtimeIntegrated": true,
      "reviewScope": "Independent internal source, answer-key and semantic family review; no external specialist or DAT-readiness certification."
    },
    {
      "objectiveId": "qr.algebra",
      "scope": "facet",
      "support": "The Canon preserves equality by applying the same operation to both sides, collects terms and checks the solution in the original equation. This supports the equation-solving portion of the guide, after an equation has been constructed.",
      "exclusions": [
        "The selected Canon starts from an equation; it does not teach the guide’s central story-to-equation translation or variable-definition steps.",
        "The game keeps its original variable definitions, story quantities and checks; no source worked numbers or assessment is imported.",
        "The Canon’s additional inequality and zero-coefficient cases do not make the game’s introductory algebra objective complete for all algebra."
      ],
      "targetGuideSha256": "ed98b4942b41f207bc3d0d38d904080ebb3dff3cefe0f5f2bc235a9029a6e566",
      "canonicalPointers": [
        "/key/0",
        "/key/1",
        "/worked/steps/0",
        "/worked/steps/1",
        "/worked/steps/2"
      ],
      "canon": {
        "id": "qr-equations-inequalities",
        "version": "0.1.0",
        "sourceSha256": "0ff92aec58f7ed0f5b0f83bf56c8eed4d59776483e43a8f6e3020003c323671e",
        "sourceRelativePath": "visuals/sheets/qr/qr-equations-inequalities.json",
        "sourceRepository": "canon-expansion/checkpoint-f"
      },
      "reviewStatus": "internal-reviewed",
      "verified": true,
      "progressEligible": true,
      "runtimeIntegrated": true,
      "reviewScope": "Independent internal source, answer-key and semantic family review; no external specialist or DAT-readiness certification."
    },
    {
      "objectiveId": "qr.compare",
      "scope": "guide",
      "support": "The Canon tests allowed contrasting values, uses differing relationships to reject a fixed comparison, and requires a general reason for a conclusion asserted for all allowed values. This matches the guide’s comparison method.",
      "exclusions": [
        "Only values in the stated domain are valid; a memorized test-number list is not a proof of an unchanged relationship.",
        "The source’s answer-letter shortcut and worked quantities are not imported."
      ],
      "targetGuideSha256": "a65df45d570883a427aba026cf035d5b31a4c12e07acc1fa1f5d37c34ff2c772",
      "canonicalPointers": [
        "/key/1",
        "/key/2",
        "/key/3",
        "/key/4",
        "/traps/0",
        "/traps/1"
      ],
      "canon": {
        "id": "qr-quantitative-comparison",
        "version": "0.2.0",
        "sourceSha256": "24751295195b9920ade1cc967c45f00cc46698064047f16df70ed29f7d1a3ed2",
        "sourceRelativePath": "visuals/sheets/qr/qr-quantitative-comparison.json",
        "sourceRepository": "canon-expansion/checkpoint-f"
      },
      "reviewStatus": "internal-reviewed",
      "verified": true,
      "progressEligible": true,
      "runtimeIntegrated": true,
      "reviewScope": "Independent internal source, answer-key and semantic family review; no external specialist or DAT-readiness certification."
    },
    {
      "objectiveId": "qr.sufficiency",
      "scope": "guide",
      "support": "The Canon defines sufficiency relative to the requested value or yes/no answer, tests each statement from the original givens, and then intersects constraints when needed. This matches the guide’s reasoning target.",
      "exclusions": [
        "This is an original reasoning activity; the Canon explicitly leaves official exam-format status pending. This link does not declare a particular data-sufficiency format to be an official DAT category.",
        "No finite-domain example or source assessment is imported."
      ],
      "targetGuideSha256": "25e91b3f243aae93299b081663f4ecfe44a1f1254c84bbf9636deb2342633e0f",
      "canonicalPointers": [
        "/key/0",
        "/key/1",
        "/key/2",
        "/key/3",
        "/traps/0",
        "/traps/1",
        "/traps/2"
      ],
      "canon": {
        "id": "qr-data-sufficiency",
        "version": "0.1.0",
        "sourceSha256": "61467c3ecf5158c06f844d033eb7a1fc2686e230917edaf443567ea553115af6",
        "sourceRelativePath": "visuals/sheets/qr/qr-data-sufficiency.json",
        "sourceRepository": "canon-expansion/checkpoint-f"
      },
      "reviewStatus": "internal-reviewed",
      "verified": true,
      "progressEligible": true,
      "runtimeIntegrated": true,
      "reviewScope": "Independent internal source, answer-key and semantic family review; no external specialist or DAT-readiness certification."
    },
    {
      "objectiveId": "rc.inference",
      "scope": "guide",
      "support": "The Canon builds an inference from supplied premises while preserving quantifiers and causal limits; it separates a proposed better test from a guaranteed result. The guide applies that evidence boundary to original game passages.",
      "exclusions": [
        "No original Canon passage, pinned answer sentence, check or personal teaching quotation is copied into the game.",
        "The link is a reading method, not an endorsement of an outside-science assumption or a full-length RC completion claim."
      ],
      "targetGuideSha256": "abd90e520ba4044a79b788b60baee99a531ddb4672f241fcadb3bae601e83bcb",
      "canonicalPointers": [
        "/key/1",
        "/key/2",
        "/key/3",
        "/traps/0",
        "/traps/1",
        "/worked/steps/3"
      ],
      "canon": {
        "id": "rc-evidence-inference",
        "version": "0.1.0",
        "sourceSha256": "82a51d1f6d53bcedcbd1b41c39596656849b173bf088d702b31d852b6c055460",
        "sourceRelativePath": "visuals/sheets/rc/rc-evidence-inference.json",
        "sourceRepository": "canon-expansion/checkpoint-f"
      },
      "reviewStatus": "internal-reviewed",
      "verified": true,
      "progressEligible": true,
      "runtimeIntegrated": true,
      "reviewScope": "Independent internal source, answer-key and semantic family review; no external specialist or DAT-readiness certification."
    },
    {
      "objectiveId": "rc.tone",
      "scope": "guide",
      "support": "The Canon combines expressions of interest with stated caution rather than selecting one tone word in isolation. This directly supports the guide’s calibrated author-attitude interpretation.",
      "exclusions": [
        "The source’s specific promising/preliminary report is not imported. The game’s own passages supply the evidence for each tone judgment.",
        "This does not establish a fixed vocabulary lookup or full-length RC readiness."
      ],
      "targetGuideSha256": "3a186ee719e90a3c0b67c0ee59c157f1f5a9b978674e6f758aa25d43987a40d0",
      "canonicalPointers": [
        "/key/3",
        "/traps/2"
      ],
      "canon": {
        "id": "rc-evidence-inference",
        "version": "0.1.0",
        "sourceSha256": "82a51d1f6d53bcedcbd1b41c39596656849b173bf088d702b31d852b6c055460",
        "sourceRelativePath": "visuals/sheets/rc/rc-evidence-inference.json",
        "sourceRepository": "canon-expansion/checkpoint-f"
      },
      "reviewStatus": "internal-reviewed",
      "verified": true,
      "progressEligible": true,
      "runtimeIntegrated": true,
      "reviewScope": "Independent internal source, answer-key and semantic family review; no external specialist or DAT-readiness certification."
    },
    {
      "objectiveId": "bio-cell-types",
      "scope": "guide",
      "support": "The Canon contrasts a typical bacterium without a nuclear envelope or membrane-bound organelles with compartmentalized eukaryotic organization, while retaining bacterial ribosomes and a plasma membrane. This supports the guide’s cell-classification distinction.",
      "exclusions": [
        "The guide’s typical-cell language is retained; wall, shape and photosynthetic ability alone do not classify every cell.",
        "No claim that all bacterial chromosomes are circular, all bacteria have walls, or every eukaryotic cell retains a nucleus is imported."
      ],
      "targetGuideSha256": "e53ec0fb578e0cdd492898b12994a1ed69fc0f75a086cb179a2e3094f8d2f33c",
      "canonicalPointers": [
        "/key/3",
        "/traps/1",
        "/hero/idea"
      ],
      "canon": {
        "id": "bio-cell-organelles",
        "version": "0.1.0",
        "sourceSha256": "2f90108a1bf7474133bdc5a9d750e842dca97f1962db1aaf2d7370d3e48e2abd",
        "sourceRelativePath": "visuals/sheets/bio/bio-cell-organelles.json",
        "sourceRepository": "canon-expansion/checkpoint-f"
      },
      "reviewStatus": "internal-reviewed",
      "verified": true,
      "progressEligible": true,
      "runtimeIntegrated": true,
      "reviewScope": "Independent internal source, answer-key and semantic family review; no external specialist or DAT-readiness certification."
    },
    {
      "objectiveId": "bio-recycling",
      "scope": "facet",
      "support": "The Canon identifies lysosomal digestion separately from peroxisomal fatty-acid and peroxide chemistry. This supports the guide’s distinction between two cleanup compartments.",
      "exclusions": [
        "Acidic lysosomal conditions, hydrolysis, autophagic delivery and catalase mechanism are primary-source extensions in the game, not developed by this short Canon list.",
        "The source’s one-job shorthand is not treated as an exhaustive organelle definition."
      ],
      "targetGuideSha256": "3a9817c41b50b59178376bdf68c17d004464ccae3d66c7802e14d5382e40480b",
      "canonicalPointers": [
        "/key/2"
      ],
      "canon": {
        "id": "bio-cell-organelles",
        "version": "0.1.0",
        "sourceSha256": "2f90108a1bf7474133bdc5a9d750e842dca97f1962db1aaf2d7370d3e48e2abd",
        "sourceRelativePath": "visuals/sheets/bio/bio-cell-organelles.json",
        "sourceRepository": "canon-expansion/checkpoint-f"
      },
      "reviewStatus": "internal-reviewed",
      "verified": true,
      "progressEligible": true,
      "runtimeIntegrated": true,
      "reviewScope": "Independent internal source, answer-key and semantic family review; no external specialist or DAT-readiness certification."
    },
    {
      "objectiveId": "bio-energy-organelles",
      "scope": "facet",
      "support": "The Canon locates light reactions at thylakoid membranes and carbon fixation in the stroma, connecting these compartments through ATP and NADPH. This supports the chloroplast portion of the existing organelle guide.",
      "exclusions": [
        "The mitochondrial inner-membrane and plant-cell respiration statements remain separately supported by the guide’s primary references; this Canon identity alone does not cover them.",
        "Detailed Calvin-cycle stoichiometry, C4/CAM pathways and the source’s worked exercise are not imported."
      ],
      "targetGuideSha256": "3fa80b120973975969111a640259ec90cb14b97f3e5823cefb23d409e8f1dcc7",
      "canonicalPointers": [
        "/subtitle",
        "/key/0",
        "/key/2",
        "/key/3"
      ],
      "canon": {
        "id": "bio-photosynthesis",
        "version": "0.1.0",
        "sourceSha256": "a784a6c2793fd6c164e4c1e7a09f38851587fe013b6972c5b6e45ec763ccfeed",
        "sourceRelativePath": "visuals/sheets/bio/bio-photosynthesis.json",
        "sourceRepository": "canon-expansion/checkpoint-f"
      },
      "reviewStatus": "internal-reviewed",
      "verified": true,
      "progressEligible": true,
      "runtimeIntegrated": true,
      "reviewScope": "Independent internal source, answer-key and semantic family review; no external specialist or DAT-readiness certification."
    },
    {
      "objectiveId": "bio-cytoskeleton",
      "scope": "facet",
      "support": "The Canon distinguishes microtubule spindle/ciliary/vesicle-track roles from actin’s cytokinesis role. This supports the filament-identity and track portion of the guide.",
      "exclusions": [
        "Intermediate-filament mechanics and the experimental motor-versus-track distinction remain primary-source extensions in the game.",
        "No source prediction, motor example, source answer or claim that a filament has only one possible role is imported."
      ],
      "targetGuideSha256": "73b24bd3faecd12241e276241bef31a8e8671e2de266ca86eae3b562fecef3eb",
      "canonicalPointers": [
        "/traps/2",
        "/hero/idea"
      ],
      "canon": {
        "id": "bio-cell-organelles",
        "version": "0.1.0",
        "sourceSha256": "2f90108a1bf7474133bdc5a9d750e842dca97f1962db1aaf2d7370d3e48e2abd",
        "sourceRelativePath": "visuals/sheets/bio/bio-cell-organelles.json",
        "sourceRepository": "canon-expansion/checkpoint-f"
      },
      "reviewStatus": "internal-reviewed",
      "verified": true,
      "progressEligible": true,
      "runtimeIntegrated": true,
      "reviewScope": "Independent internal source, answer-key and semantic family review; no external specialist or DAT-readiness certification."
    }
  ]
};
export const {refinementChapters,refinementReturnItems,refinementCanonLinks}=refinementRelease;
