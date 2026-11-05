// Generated from independently reviewed continuation chapters. Append-only; no authoring imports.
export const continuationChapters = [
  {
    "id": "bio-division-conservatory",
    "world": "bio",
    "title": "Cell Division Conservatory",
    "scope": {
      "included": [
        "G1, S, G2 and mitotic chromosome/DNA inventory with explicit boundaries",
        "Normal mitotic, meiosis-I and meiosis-II separation",
        "Ploidy independent of replication state",
        "Whole-homolog independent assortment under an explicit no-crossing-over model"
      ],
      "excluded": [
        "Molecular cell-cycle regulation and checkpoints",
        "Crossing-over mechanisms and recombination frequencies",
        "Human disease diagnosis and sex-chromosome exceptions",
        "Pedigree analysis and full Mendelian genetics"
      ],
      "transferOnly": [
        "Calibrated DNA signal inference",
        "Products of one explicitly specified segregation error",
        "Combining two parents’ supplied gamete spaces"
      ],
      "coverageClaim": "Partial Cell Division coverage; not full Biology or Cell Division completion."
    },
    "objectiveIds": [
      "bio-division-dna-count",
      "bio-division-separation",
      "bio-division-assortment"
    ],
    "metadata": {
      "course": "BIO",
      "session": 4,
      "creature": "chromelle",
      "stationName": "Chromosome Conservatory",
      "pathVariant": 1,
      "chapterTheme": "bio",
      "title": "Cell Division Conservatory",
      "creatureDescriptor": {
        "id": "chromelle",
        "name": "Chromelle",
        "type": "vital",
        "color": "#65aa84",
        "bodyPlan": "A hovering seed-pod torso with two mirrored ribbon arms joined by a visible clasp; four broad root feet and a long-and-short pair of leaf antennae. Its mirrored arms can separate while its labeled seed sets stay countable.",
        "concept": "Chromosome identity, replication and faithful separation",
        "evolutions": [
          "Chromelle",
          "Chromarbor",
          "Chromacrown"
        ],
        "rareName": "Chromelle of the Twin Canopy",
        "blurb": "Chromelle keeps the Conservatory’s seed archives in order. Trace each copied chromosome to help it defeat Team Entropy’s swapped labels."
      },
      "topicMappings": {
        "screenshotTopicIds": [
          "bootcamp-biology-5"
        ],
        "officialOnlyTopicIds": []
      },
      "instructionFamilyIds": [
        "bio-division-stage-inventory",
        "bio-division-replication-conservation",
        "bio-division-anaphase-boundary",
        "bio-division-separating-units",
        "bio-division-outcome-comparison",
        "bio-division-no-second-s",
        "bio-division-set-identity",
        "bio-division-many-meioses-assortment",
        "bio-division-one-meiosis-products"
      ]
    },
    "canon": {
      "id": "bio-mitosis-meiosis",
      "version": "0.2.1",
      "sourceRelativePath": "visuals/sheets/bio/bio-mitosis-meiosis.json",
      "sourceSha256": "2d330cce04f5aaddb5023af27b43e011dc31e67dd81a10178262acc4ded4d588",
      "sourceRepository": "ace-system",
      "exportSha256": "53c2a6951e84c369d1e075d6c64e4672ea60bd35f29d01865d940019d02a391e",
      "adaptationVersion": 1,
      "importsSourceAssessments": false,
      "formativeCanonChecksProgressEligible": false
    },
    "objectives": [
      {
        "id": "bio-division-dna-count",
        "world": "bio",
        "name": "Count chromosomes and DNA through the cell cycle",
        "lesson": "Track one explicitly bounded cell or future daughter group. A joined sister pair counts as one replicated chromosome; after sisters separate, each former chromatid counts as a chromosome. S phase copies DNA without adding a homologous set.",
        "sourceUrls": [
          "https://openstax.org/books/biology-2e/pages/10-1-cell-division",
          "https://openstax.org/books/biology-2e/pages/10-2-the-cell-cycle"
        ],
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "bio-division-separation",
        "world": "bio",
        "name": "Distinguish the units separated in each division",
        "lesson": "Mitosis and meiosis II separate sisters; meiosis I separates homologs while sisters remain joined. Follow the same starting inventory through one replication and the stated divisions.",
        "sourceUrls": [
          "https://openstax.org/books/biology-2e/pages/10-2-the-cell-cycle",
          "https://openstax.org/books/biology-2e/pages/11-1-the-process-of-meiosis"
        ],
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "bio-division-assortment",
        "world": "bio",
        "name": "Track chromosome sets and independent assortment",
        "lesson": "Ploidy counts complete homologous sets, not DNA strands or X shapes. In a specified diploid model without crossing over, independent orientation of n homolog pairs permits 2^n whole-homolog combinations across many meioses; one ordinary meiosis produces four products, not all possible combinations.",
        "sourceUrls": [
          "https://openstax.org/books/biology-2e/pages/10-1-cell-division",
          "https://openstax.org/books/biology-2e/pages/11-1-the-process-of-meiosis"
        ],
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      }
    ],
    "teachingByObjective": {
      "bio-division-dna-count": {
        "objectiveId": "bio-division-dna-count",
        "version": 1,
        "core": "Track one explicitly bounded cell or future daughter group. A joined sister pair counts as one replicated chromosome; after sisters separate, each former chromatid counts as a chromosome. S phase copies DNA without adding a homologous set.",
        "terms": [
          {
            "term": "Chromosome count",
            "meaning": "Count joined sister pairs as one chromosome until separation; count separated daughter chromosomes individually."
          },
          {
            "term": "DNA molecule",
            "meaning": "One double-stranded DNA molecule per chromatid."
          },
          {
            "term": "S phase",
            "meaning": "The DNA-copying part of interphase."
          },
          {
            "term": "Counting boundary",
            "meaning": "The whole undivided cell, one pole, or one completed daughter cell must be named."
          }
        ],
        "assumptions": [
          "Use a fictional eukaryotic diploid starting cell with the stated 2n; count nuclear chromosomes only.",
          "No chromosome loss, mutation, crossing over, or unequal division unless a question explicitly supplies an exception.",
          "Each chromatid contains one double-stranded DNA molecule. The centromere counting convention treats joined sisters as one replicated chromosome; it does not imply that centromeric DNA escapes S-phase replication.",
          "Schematic rods may be used to count DNA in interphase; actual interphase DNA is not condensed into these rods."
        ],
        "workedExample": {
          "prompt": "A fictional cell has 2n = 4. Compare G1, the end of S, and mitotic anaphase before cytokinesis.",
          "steps": [
            "G1: four unreplicated chromosomes contain four DNA molecules.",
            "End of S: four joined sister pairs remain four chromosomes and contain eight DNA molecules.",
            "Mitotic anaphase: separation gives eight chromosomes in the whole undivided cell, with four heading to each pole. DNA remains eight molecules in total.",
            "After cytokinesis, each daughter has four chromosomes and four DNA molecules. A transient whole-cell anaphase count is not a new heritable ploidy state."
          ],
          "answer": "G1 4/4; after S 4/8; whole anaphase cell 8/8; each daughter 4/4 (chromosomes/DNA molecules).",
          "familyId": "bio-division-stage-inventory",
          "role": "instruction-only"
        },
        "commonMistake": "An X is one replicated chromosome, not a homologous pair. S phase doubles DNA; it does not change 2n to 4n.",
        "nextAction": "Name the boundary before counting and trace each chromosome through the division.",
        "sourceUrls": [
          "https://openstax.org/books/biology-2e/pages/10-1-cell-division",
          "https://openstax.org/books/biology-2e/pages/10-2-the-cell-cycle"
        ],
        "canon": {
          "id": "bio-mitosis-meiosis",
          "version": "0.2.1",
          "sourceRelativePath": "visuals/sheets/bio/bio-mitosis-meiosis.json",
          "sourceSha256": "2d330cce04f5aaddb5023af27b43e011dc31e67dd81a10178262acc4ded4d588",
          "sourceRepository": "ace-system",
          "exportSha256": "53c2a6951e84c369d1e075d6c64e4672ea60bd35f29d01865d940019d02a391e",
          "adaptationVersion": 1,
          "importsSourceAssessments": false,
          "formativeCanonChecksProgressEligible": false,
          "reviewScope": "Count chromosomes and DNA through the cell cycle"
        },
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      "bio-division-separation": {
        "objectiveId": "bio-division-separation",
        "version": 1,
        "core": "Mitosis and meiosis II separate sisters; meiosis I separates homologs while sisters remain joined. Follow the same starting inventory through one replication and the stated divisions.",
        "terms": [
          {
            "term": "Homologs",
            "meaning": "Members of a chromosome pair with the same gene loci; they may carry different alleles."
          },
          {
            "term": "Sisters",
            "meaning": "The two DNA copies of one replicated chromosome."
          },
          {
            "term": "Meiosis I",
            "meaning": "Division that distributes homologs to opposite daughter groups."
          },
          {
            "term": "Meiosis II",
            "meaning": "Division that separates sisters without another S phase."
          }
        ],
        "assumptions": [
          "Use a fictional eukaryotic diploid starting cell with the stated 2n; count nuclear chromosomes only.",
          "No chromosome loss, mutation, crossing over, or unequal division unless a question explicitly supplies an exception.",
          "Each chromatid contains one double-stranded DNA molecule. The centromere counting convention treats joined sisters as one replicated chromosome; it does not imply that centromeric DNA escapes S-phase replication.",
          "The standard route starts with one diploid cell; mitosis ends with two cells and meiosis with four.",
          "This simplified activity omits crossing over so homolog-origin labels remain intact; real meiosis can exchange segments."
        ],
        "workedExample": {
          "prompt": "Chromelle labels one homolog L1 and the other L2, then copies both. Track these four DNA molecules through the two meiotic divisions.",
          "steps": [
            "At meiosis I, the joined L1 sister pair travels to one daughter and the joined L2 sister pair to the other.",
            "Each daughter has one homolog of this pair, still replicated.",
            "There is no intervening S phase. Meiosis II separates the two L1 sisters, and separately the two L2 sisters.",
            "Mitosis instead separates sisters of both homologs within one division, preserving the original chromosome-set number in each daughter."
          ],
          "answer": "Meiosis I separates L1 from L2; meiosis II separates each homolog’s sisters.",
          "familyId": "bio-division-separating-units",
          "role": "instruction-only"
        },
        "commonMistake": "Do not call a pair of sisters a homologous pair or add a second round of DNA replication between I and II.",
        "nextAction": "Name what is joined before division and what moves apart.",
        "sourceUrls": [
          "https://openstax.org/books/biology-2e/pages/10-2-the-cell-cycle",
          "https://openstax.org/books/biology-2e/pages/11-1-the-process-of-meiosis"
        ],
        "canon": {
          "id": "bio-mitosis-meiosis",
          "version": "0.2.1",
          "sourceRelativePath": "visuals/sheets/bio/bio-mitosis-meiosis.json",
          "sourceSha256": "2d330cce04f5aaddb5023af27b43e011dc31e67dd81a10178262acc4ded4d588",
          "sourceRepository": "ace-system",
          "exportSha256": "53c2a6951e84c369d1e075d6c64e4672ea60bd35f29d01865d940019d02a391e",
          "adaptationVersion": 1,
          "importsSourceAssessments": false,
          "formativeCanonChecksProgressEligible": false,
          "reviewScope": "Distinguish the units separated in each division"
        },
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      "bio-division-assortment": {
        "objectiveId": "bio-division-assortment",
        "version": 1,
        "core": "Ploidy counts complete homologous sets, not DNA strands or X shapes. In a specified diploid model without crossing over, independent orientation of n homolog pairs permits 2^n whole-homolog combinations across many meioses; one ordinary meiosis produces four products, not all possible combinations.",
        "terms": [
          {
            "term": "n",
            "meaning": "Number of different chromosomes in one complete set."
          },
          {
            "term": "Diploid",
            "meaning": "Two homologous sets."
          },
          {
            "term": "Haploid",
            "meaning": "One complete set, whether its chromosomes are replicated or unreplicated."
          },
          {
            "term": "Independent assortment",
            "meaning": "Each homolog pair can orient independently of other pairs at meiosis I."
          }
        ],
        "assumptions": [
          "Use a fictional eukaryotic diploid starting cell with the stated 2n; count nuclear chromosomes only.",
          "No chromosome loss, mutation, crossing over, or unequal division unless a question explicitly supplies an exception.",
          "Each chromatid contains one double-stranded DNA molecule. The centromere counting convention treats joined sisters as one replicated chromosome; it does not imply that centromeric DNA escapes S-phase replication.",
          "Track whole-homolog identity only; labels 1 and 2 identify the two homologs, not dominant and recessive alleles.",
          "Each pair has two equally likely orientations; pairs act independently. No crossing over or new mutation is modeled.",
          "All four products of one ordinary meiosis are followed, with no asymmetric product loss."
        ],
        "workedExample": {
          "prompt": "Two homolog pairs are L1/L2 and S1/S2. What can reach a chosen product across many meioses?",
          "steps": [
            "For the L pair, choose L1 or L2. Independently choose S1 or S2.",
            "The four possibilities are L1S1, L1S2, L2S1, and L2S2: 2 × 2 = 4.",
            "A single fixed orientation produces one combination and its complement. Without crossing over, sister separation duplicates each of those combinations, giving four cells but only two distinct label combinations.",
            "After meiosis I a daughter with L1 and S2 is haploid even though both chromosomes still have sister chromatids."
          ],
          "answer": "Four possible combinations across many meioses; two complementary combinations, each represented twice, within one meiosis in this model.",
          "familyId": "bio-division-many-meioses-assortment",
          "role": "instruction-only"
        },
        "commonMistake": "The exponent is n, the number of homolog pairs; 2^n is not the number of products made by one meiosis.",
        "nextAction": "List one member of each pair; keep the population of possible outcomes separate from the four actual products.",
        "sourceUrls": [
          "https://openstax.org/books/biology-2e/pages/10-1-cell-division",
          "https://openstax.org/books/biology-2e/pages/11-1-the-process-of-meiosis"
        ],
        "canon": {
          "id": "bio-mitosis-meiosis",
          "version": "0.2.1",
          "sourceRelativePath": "visuals/sheets/bio/bio-mitosis-meiosis.json",
          "sourceSha256": "2d330cce04f5aaddb5023af27b43e011dc31e67dd81a10178262acc4ded4d588",
          "sourceRepository": "ace-system",
          "exportSha256": "53c2a6951e84c369d1e075d6c64e4672ea60bd35f29d01865d940019d02a391e",
          "adaptationVersion": 1,
          "importsSourceAssessments": false,
          "formativeCanonChecksProgressEligible": false,
          "reviewScope": "Track chromosome sets and independent assortment"
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
        "id": "next-bio-division-dna-count-p1",
        "objectiveId": "bio-division-dna-count",
        "world": "bio",
        "pool": "practice",
        "familyId": "bio-division-stage-inventory",
        "familyRationale": "Count chromosomes and DNA at a named stage within one stated cell; changing 2n is the same family.",
        "prompt": "A diploid conservatory cell has 2n = 6. At the end of S phase, before any sisters separate, how many chromosomes and double-stranded DNA molecules are in this one cell?",
        "choices": [
          "6 chromosomes; 12 DNA molecules",
          "12 chromosomes; 12 DNA molecules",
          "6 chromosomes; 6 DNA molecules",
          "3 chromosomes; 6 DNA molecules"
        ],
        "answer": 0,
        "hint": "Count each joined sister pair once, but count both DNA copies.",
        "explanation": "Six replicated chromosomes contain two DNA molecules each: 6 chromosomes and 12 DNA molecules.",
        "feedback": [
          "Correct: S copied each chromosome without separating sisters.",
          "Twelve is the DNA count; joined sisters still count as six chromosomes.",
          "This is the G1 inventory, before DNA copying.",
          "Three chromosomes per cell would follow the homolog separation of meiosis I."
        ],
        "sourceUrls": [
          "https://openstax.org/books/biology-2e/pages/10-1-cell-division",
          "https://openstax.org/books/biology-2e/pages/10-2-the-cell-cycle"
        ],
        "canonId": "bio-mitosis-meiosis",
        "sourceId": "next-bio-division-dna-count-p1",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "next-bio-division-dna-count-p2",
        "objectiveId": "bio-division-dna-count",
        "world": "bio",
        "pool": "practice",
        "familyId": "bio-division-replication-conservation",
        "familyRationale": "Distinguish DNA copying from addition of chromosome sets; verbal or numeric variants remain one family.",
        "prompt": "A cell begins G1 with homologs A1, A2, B1 and B2. After S, every label has two joined sisters. Which statement describes the change?",
        "choices": [
          "The cell acquired four new homologs from another parent.",
          "It now has four complete homologous sets.",
          "DNA doubled, while its two homologous sets remained.",
          "Its chromosome number halved."
        ],
        "answer": 2,
        "hint": "Duplicating a homolog is different from acquiring another homologous set.",
        "explanation": "S phase makes sister copies of the existing four chromosomes. The same two homologous sets are still present.",
        "feedback": [
          "No new parental homolog is acquired during S.",
          "Counting copied DNA as new sets confuses replication with ploidy.",
          "Correct: two sets remain, with twice the DNA.",
          "S copies DNA; it does not separate homologs into daughters."
        ],
        "sourceUrls": [
          "https://openstax.org/books/biology-2e/pages/10-1-cell-division",
          "https://openstax.org/books/biology-2e/pages/10-2-the-cell-cycle"
        ],
        "canonId": "bio-mitosis-meiosis",
        "sourceId": "next-bio-division-dna-count-p2",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "next-bio-division-dna-count-p3",
        "objectiveId": "bio-division-dna-count",
        "world": "bio",
        "pool": "practice",
        "familyId": "bio-division-anaphase-boundary",
        "familyRationale": "Reconcile whole-cell and per-pole inventories during sister separation.",
        "prompt": "A cell with 2n = 4 has completed S. Its sister chromatids have now separated in mitotic anaphase, but cytokinesis has not begun. What is the chromosome count in the entire cell and at each future daughter pole?",
        "choices": [
          "4 total; 2 per pole",
          "8 total; 8 per pole",
          "4 total; 4 per pole",
          "8 total; 4 per pole"
        ],
        "answer": 3,
        "hint": "Count separated sisters individually, then distribute that total between two poles.",
        "explanation": "Each of eight separated DNA copies is now a chromosome: eight in the whole cell, four at each pole.",
        "feedback": [
          "This halves the mitotic daughter inventory as though homologs alone separated.",
          "The total eight is divided between the poles, not copied again at each pole.",
          "Four per pole implies eight across the two poles, not four total.",
          "Correct: specify the whole-cell versus per-pole boundary."
        ],
        "sourceUrls": [
          "https://openstax.org/books/biology-2e/pages/10-1-cell-division",
          "https://openstax.org/books/biology-2e/pages/10-2-the-cell-cycle"
        ],
        "canonId": "bio-mitosis-meiosis",
        "sourceId": "next-bio-division-dna-count-p3",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "next-bio-division-dna-count-c1",
        "objectiveId": "bio-division-dna-count",
        "world": "bio",
        "pool": "check",
        "familyId": "bio-division-stage-inventory",
        "familyRationale": "Count chromosomes and DNA at a named stage within one stated cell; changing 2n is the same family.",
        "prompt": "A species has 2n = 10. One cell is in mitotic metaphase after normal DNA replication. Which inventory is correct for this one cell?",
        "choices": [
          "10 chromosomes and 20 DNA molecules",
          "20 chromosomes and 20 DNA molecules",
          "5 chromosomes and 10 DNA molecules",
          "10 chromosomes and 10 DNA molecules"
        ],
        "answer": 0,
        "hint": "Determine whether sisters have separated yet.",
        "explanation": "At metaphase, ten chromosomes each contain two joined sister chromatids, so there are twenty DNA molecules.",
        "feedback": [
          "Correct: replicated sisters remain joined at metaphase.",
          "The count becomes twenty chromosomes only when sisters separate in anaphase.",
          "This is a post-meiosis-I per-cell inventory, not mitotic metaphase.",
          "Ten DNA molecules is the unreplicated inventory."
        ],
        "sourceUrls": [
          "https://openstax.org/books/biology-2e/pages/10-1-cell-division",
          "https://openstax.org/books/biology-2e/pages/10-2-the-cell-cycle"
        ],
        "canonId": "bio-mitosis-meiosis",
        "sourceId": "next-bio-division-dna-count-c1",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "next-bio-division-dna-count-c2",
        "objectiveId": "bio-division-dna-count",
        "world": "bio",
        "pool": "check",
        "familyId": "bio-division-replication-conservation",
        "familyRationale": "Distinguish DNA copying from addition of chromosome sets; verbal or numeric variants remain one family.",
        "prompt": "A student says, “S phase makes a diploid nucleus tetraploid because it doubles DNA.” Which observation directly corrects that reasoning?",
        "choices": [
          "The copied DNA disappears before G2.",
          "DNA replication creates only one homologous set.",
          "The same two homologous sets remain; each chromosome gains a sister copy.",
          "Sister chromatids have no centromeric DNA."
        ],
        "answer": 2,
        "hint": "Ploidy asks how many homologous sets are represented.",
        "explanation": "DNA amount and homologous-set number are different variables. Replication copies the existing chromosomes while the nucleus remains diploid.",
        "feedback": [
          "The copied DNA persists for later division.",
          "The original diploid nucleus retains two sets.",
          "Correct: replication state changes while set number does not.",
          "Centromeric DNA is replicated too; chromosome counting is a convention about joined versus separated sisters."
        ],
        "sourceUrls": [
          "https://openstax.org/books/biology-2e/pages/10-1-cell-division",
          "https://openstax.org/books/biology-2e/pages/10-2-the-cell-cycle"
        ],
        "canonId": "bio-mitosis-meiosis",
        "sourceId": "next-bio-division-dna-count-c2",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "next-bio-division-dna-count-c3",
        "objectiveId": "bio-division-dna-count",
        "world": "bio",
        "pool": "check",
        "familyId": "bio-division-anaphase-boundary",
        "familyRationale": "Reconcile whole-cell and per-pole inventories during sister separation.",
        "prompt": "For a species with 2n = 8, an observer reports 16 chromosomes in one undivided cell during normal mitotic anaphase. Which report for the two completed daughter cells is consistent?",
        "choices": [
          "Each daughter has 16 chromosomes because S phase doubled ploidy.",
          "Each daughter has 8 chromosomes after the two pole groups are partitioned.",
          "Each daughter has 4 chromosomes because every division halves ploidy.",
          "Each daughter has 8 chromosomes, each still with two joined sisters."
        ],
        "answer": 1,
        "hint": "The whole-cell anaphase count spans both future daughters.",
        "explanation": "The separated chromosome groups contain eight chromosomes each. After division, each daughter retains 2n = 8 with unreplicated chromosomes.",
        "feedback": [
          "Sixteen counted both pole groups together; it is not the per-daughter count.",
          "Correct: partitioning produces two cells with eight chromosomes each.",
          "Mitosis preserves the original ploidy in the standard model.",
          "Sisters already separated in anaphase, so each daughter chromosome contains one DNA molecule."
        ],
        "sourceUrls": [
          "https://openstax.org/books/biology-2e/pages/10-1-cell-division",
          "https://openstax.org/books/biology-2e/pages/10-2-the-cell-cycle"
        ],
        "canonId": "bio-mitosis-meiosis",
        "sourceId": "next-bio-division-dna-count-c3",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "next-bio-division-dna-count-l1",
        "objectiveId": "bio-division-dna-count",
        "world": "bio",
        "pool": "later",
        "familyId": "bio-division-dna-signal-inference",
        "familyRationale": "Reserved transfer: infer what a calibrated bulk DNA measurement can and cannot establish; no fluorescence measurement appears in instruction.",
        "prompt": "A detector gives a signal proportional to total nuclear DNA. In the same diploid cell line, isolated G1 nuclei read 30 units and G2 nuclei read 60 units. An unknown intact nucleus reads 45 units. Assume no DNA loss, division or abnormal ploidy. What is supported?",
        "choices": [
          "It has become triploid.",
          "It has finished S phase.",
          "It has copied some, but not all, of its G1 DNA complement.",
          "Its chromosome number must be 45."
        ],
        "answer": 2,
        "hint": "Use the calibration to interpret DNA amount; detector units are not chromosome counts.",
        "explanation": "Forty-five lies between the G1 and G2 references, consistent with ongoing S phase under the stated assumptions. The measurement does not convert signal units into chromosome count.",
        "feedback": [
          "Intermediate DNA amount during copying does not add a homologous set.",
          "The supplied completed-S/G2 reference is sixty, not forty-five.",
          "Correct: the reading is intermediate between unreplicated and fully replicated DNA.",
          "Signal is an arbitrary measure of DNA amount, not a chromosome tally."
        ],
        "sourceUrls": [
          "https://openstax.org/books/biology-2e/pages/10-1-cell-division",
          "https://openstax.org/books/biology-2e/pages/10-2-the-cell-cycle"
        ],
        "canonId": "bio-mitosis-meiosis",
        "sourceId": "next-bio-division-dna-count-l1",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "next-bio-division-dna-count-l2",
        "objectiveId": "bio-division-dna-count",
        "world": "bio",
        "pool": "later",
        "familyId": "bio-division-dna-signal-inference",
        "familyRationale": "Reserved transfer: infer what a calibrated bulk DNA measurement can and cannot establish; no fluorescence measurement appears in instruction.",
        "prompt": "A DNA detector reads 20 units for an intact G1 nucleus from a species with 2n = 4. An unknown intact nucleus reads 40 units. The candidate explanations are a diploid G2 nucleus or an unreplicated tetraploid G1 nucleus of that species; no other cases are considered. What can this DNA reading alone decide?",
        "choices": [
          "It proves the nucleus is diploid G2.",
          "It proves the nucleus is tetraploid G1.",
          "It proves the nucleus contains eight joined sister pairs.",
          "It cannot distinguish the two supplied explanations."
        ],
        "answer": 3,
        "hint": "Calculate total DNA in each proposed explanation before assigning ploidy.",
        "explanation": "Diploid G2 has copied two sets; tetraploid G1 has four unreplicated sets. Both contain twice the reference DNA, so this measurement alone cannot distinguish them.",
        "feedback": [
          "Diploid G2 fits, but the supplied tetraploid G1 alternative fits too.",
          "Tetraploid G1 fits, but the supplied diploid G2 alternative fits too.",
          "The signal does not reveal whether DNA copies are joined sisters or separate homologous sets.",
          "Correct: equal DNA amount can accompany different ploidy and replication states."
        ],
        "sourceUrls": [
          "https://openstax.org/books/biology-2e/pages/10-1-cell-division",
          "https://openstax.org/books/biology-2e/pages/10-2-the-cell-cycle"
        ],
        "canonId": "bio-mitosis-meiosis",
        "sourceId": "next-bio-division-dna-count-l2",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "next-bio-division-separation-p1",
        "objectiveId": "bio-division-separation",
        "world": "bio",
        "pool": "practice",
        "familyId": "bio-division-separating-units",
        "familyRationale": "Identify homolog versus sister separation from traced chromosome labels.",
        "prompt": "A replicated homolog pair is labeled A1/A1 for one joined sister pair and A2/A2 for the other. A division sends A1/A1 to one daughter and A2/A2 to the other, with sisters still joined. Which event occurred?",
        "choices": [
          "Sister separation in mitosis",
          "Homolog separation in meiosis I",
          "Sister separation in meiosis II",
          "DNA copying in S phase"
        ],
        "answer": 1,
        "hint": "Track whether matching copies or the two different homolog labels move apart.",
        "explanation": "A1 and A2 are homologs. Sending their joined sister pairs to different daughters is the defining separation of meiosis I.",
        "feedback": [
          "Mitosis separates A1 sisters and separately A2 sisters.",
          "Correct: different homologs separate while each sister pair remains joined.",
          "Meiosis II separates the sisters within each joined pair.",
          "Copying increases DNA; it does not distribute homologs into daughters."
        ],
        "sourceUrls": [
          "https://openstax.org/books/biology-2e/pages/10-2-the-cell-cycle",
          "https://openstax.org/books/biology-2e/pages/11-1-the-process-of-meiosis"
        ],
        "canonId": "bio-mitosis-meiosis",
        "sourceId": "next-bio-division-separation-p1",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "next-bio-division-separation-p2",
        "objectiveId": "bio-division-separation",
        "world": "bio",
        "pool": "practice",
        "familyId": "bio-division-outcome-comparison",
        "familyRationale": "Compare cell number, chromosome inventory and ploidy after the specified division route.",
        "prompt": "One diploid cell with 2n = 6 completes S phase. Compare ordinary mitosis with a complete ordinary meiosis, including cytokinesis. Which products are expected?",
        "choices": [
          "Mitosis: four cells with 3 chromosomes; meiosis: two with 6.",
          "Both routes: two cells with 6 chromosomes.",
          "Mitosis: two cells with 6 chromosomes; meiosis: four with 3.",
          "Both routes: four cells with 3 chromosomes."
        ],
        "answer": 2,
        "hint": "Count divisions and ask whether homologous sets separate from one another.",
        "explanation": "Mitosis preserves two sets in two daughters. Meiosis I reduces to one set and meiosis II separates sisters, producing four cells with n = 3.",
        "feedback": [
          "This exchanges the outcomes of the two routes.",
          "Meiosis includes a second division and reduces chromosome-set number.",
          "Correct: two diploid mitotic daughters versus four haploid meiotic products.",
          "Mitosis has one division and does not halve ploidy."
        ],
        "sourceUrls": [
          "https://openstax.org/books/biology-2e/pages/10-2-the-cell-cycle",
          "https://openstax.org/books/biology-2e/pages/11-1-the-process-of-meiosis"
        ],
        "canonId": "bio-mitosis-meiosis",
        "sourceId": "next-bio-division-separation-p2",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "next-bio-division-separation-p3",
        "objectiveId": "bio-division-separation",
        "world": "bio",
        "pool": "practice",
        "familyId": "bio-division-no-second-s",
        "familyRationale": "Conserve DNA through the interval between the two meiotic divisions.",
        "prompt": "After meiosis I, each of two cells has three chromosomes, each with two sisters. No DNA is copied before meiosis II. How many DNA molecules will each of the four final products contain?",
        "choices": [
          "3",
          "6",
          "12",
          "1.5"
        ],
        "answer": 0,
        "hint": "Partition the six existing DNA molecules in each meiosis-I daughter between its two products.",
        "explanation": "Each meiosis-I daughter contains six DNA molecules. Sister separation distributes three to each final product without another replication.",
        "feedback": [
          "Correct: one DNA molecule remains per chromosome in each n = 3 product.",
          "Six is the DNA count before the second division.",
          "Twelve adds a replication that the prompt excludes.",
          "Meiosis II separates sisters; it does not halve the number of chromosome types again."
        ],
        "sourceUrls": [
          "https://openstax.org/books/biology-2e/pages/10-2-the-cell-cycle",
          "https://openstax.org/books/biology-2e/pages/11-1-the-process-of-meiosis"
        ],
        "canonId": "bio-mitosis-meiosis",
        "sourceId": "next-bio-division-separation-p3",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "next-bio-division-separation-c1",
        "objectiveId": "bio-division-separation",
        "world": "bio",
        "pool": "check",
        "familyId": "bio-division-separating-units",
        "familyRationale": "Identify homolog versus sister separation from traced chromosome labels.",
        "prompt": "Which statement correctly compares normal anaphase of mitosis, anaphase I and anaphase II?",
        "choices": [
          "All three separate homologous chromosomes.",
          "Mitosis separates homologs; both meiotic divisions separate sisters.",
          "Mitosis and anaphase I separate sisters; anaphase II separates homologs.",
          "Mitosis and anaphase II separate sisters; anaphase I separates homologs."
        ],
        "answer": 3,
        "hint": "The reductional division separates members of homolog pairs.",
        "explanation": "Homologs separate in meiosis I. Sister chromatids become separate daughter chromosomes in mitosis and meiosis II.",
        "feedback": [
          "Homolog separation distinguishes meiosis I.",
          "Mitosis separates sisters; meiosis I separates homologs.",
          "Anaphase I and II are reversed in this statement.",
          "Correct: I separates homologs, while mitosis and II separate sisters."
        ],
        "sourceUrls": [
          "https://openstax.org/books/biology-2e/pages/10-2-the-cell-cycle",
          "https://openstax.org/books/biology-2e/pages/11-1-the-process-of-meiosis"
        ],
        "canonId": "bio-mitosis-meiosis",
        "sourceId": "next-bio-division-separation-c1",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "next-bio-division-separation-c2",
        "objectiveId": "bio-division-separation",
        "world": "bio",
        "pool": "check",
        "familyId": "bio-division-outcome-comparison",
        "familyRationale": "Compare cell number, chromosome inventory and ploidy after the specified division route.",
        "prompt": "A haploid eukaryotic cell has one complete set of five chromosomes. It copies its DNA and undergoes ordinary mitosis with cytokinesis. What results?",
        "choices": [
          "Two diploid cells with ten chromosomes each.",
          "Two haploid cells with five chromosomes each.",
          "Four haploid cells with five chromosomes each.",
          "Two cells with two or three chromosomes each."
        ],
        "answer": 1,
        "hint": "Mitosis can occur in haploid cells; follow each replicated chromosome into both daughters.",
        "explanation": "Each sister separation supplies one copy of all five chromosomes to each daughter. Mitosis preserves the starting haploid set number.",
        "feedback": [
          "Replication provides sister copies, not a second homologous set in each daughter.",
          "Correct: mitosis preserves this starting haploid state.",
          "Four products would require the two meiotic divisions rather than one mitosis.",
          "Normal mitosis does not split a complete set into incomplete halves."
        ],
        "sourceUrls": [
          "https://openstax.org/books/biology-2e/pages/10-2-the-cell-cycle",
          "https://openstax.org/books/biology-2e/pages/11-1-the-process-of-meiosis"
        ],
        "canonId": "bio-mitosis-meiosis",
        "sourceId": "next-bio-division-separation-c2",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "next-bio-division-separation-c3",
        "objectiveId": "bio-division-separation",
        "world": "bio",
        "pool": "check",
        "familyId": "bio-division-no-second-s",
        "familyRationale": "Conserve DNA through the interval between the two meiotic divisions.",
        "prompt": "In a standard diploid meiotic route, which sequence correctly places DNA replication relative to the divisions?",
        "choices": [
          "S phase → meiosis I → meiosis II, with no S phase between I and II",
          "Meiosis I → S phase → meiosis II",
          "S phase → meiosis I → S phase → meiosis II",
          "Meiosis I → meiosis II → the only S phase"
        ],
        "answer": 0,
        "hint": "The second meiotic division uses sister copies that were already made.",
        "explanation": "One replication precedes two divisions. The absence of a second S phase allows existing sister copies to be partitioned in meiosis II.",
        "feedback": [
          "Correct: one S phase precedes both divisions.",
          "The DNA must already be replicated before meiosis I in this route.",
          "A second S phase is absent from the standard meiotic sequence.",
          "This incorrectly places replication after the divisions it supplies."
        ],
        "sourceUrls": [
          "https://openstax.org/books/biology-2e/pages/10-2-the-cell-cycle",
          "https://openstax.org/books/biology-2e/pages/11-1-the-process-of-meiosis"
        ],
        "canonId": "bio-mitosis-meiosis",
        "sourceId": "next-bio-division-separation-c3",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "next-bio-division-separation-l1",
        "objectiveId": "bio-division-separation",
        "world": "bio",
        "pool": "later",
        "familyId": "bio-division-error-product-reconstruction",
        "familyRationale": "Reserved transfer: reconstruct all products after a fully specified separation error; normal division examples do not rehearse this intervention.",
        "prompt": "Follow all four products from one cell with 2n = 6. In meiosis I, both homologs of exactly one pair move to the same pole. Every other pair separates normally, and all sister pairs separate normally in meiosis II. How many chromosomes are in the four final products?",
        "choices": [
          "3, 3, 3, 3",
          "4, 3, 3, 2",
          "4, 4, 2, 2",
          "6, 6, 0, 0"
        ],
        "answer": 2,
        "hint": "First inventory the two meiosis-I daughters, then split each one’s sisters normally.",
        "explanation": "The first division gives one daughter both members of the affected pair and the other neither. Their chromosome counts are four and two; normal meiosis II duplicates those per-product counts: 4, 4, 2, 2.",
        "feedback": [
          "Both homologs went to one side, so the affected pair is not balanced.",
          "This pattern fits a single meiosis-II sister-separation error, not the stated first-division error.",
          "Correct: all four products differ from the normal n = 3 inventory.",
          "Only one pair missegregated; the two other pairs still distribute normally."
        ],
        "sourceUrls": [
          "https://openstax.org/books/biology-2e/pages/11-1-the-process-of-meiosis",
          "https://openstax.org/books/biology-2e/pages/13-2-chromosomal-basis-of-inherited-disorders"
        ],
        "canonId": "bio-mitosis-meiosis",
        "sourceId": "next-bio-division-separation-l1",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "next-bio-division-separation-l2",
        "objectiveId": "bio-division-separation",
        "world": "bio",
        "pool": "later",
        "familyId": "bio-division-error-product-reconstruction",
        "familyRationale": "Reserved transfer: reconstruct all products after a fully specified separation error; normal division examples do not rehearse this intervention.",
        "prompt": "A cell with 2n = 8 completes meiosis I normally. During meiosis II, the sisters of exactly one chromosome in only one of the two cells move together to one product. The other cell divides normally, and no other errors occur. Which final chromosome-count pattern follows?",
        "choices": [
          "5, 5, 3, 3",
          "5, 4, 4, 3",
          "4, 4, 4, 4",
          "8, 4, 4, 0"
        ],
        "answer": 1,
        "hint": "One meiosis-I daughter is unaffected; reconstruct the two products of each daughter separately.",
        "explanation": "The unaffected daughter yields two products with four chromosomes. The affected daughter gives one extra copy to one product and no copy of that chromosome to the other: five and three.",
        "feedback": [
          "This would require both meiosis-I daughters to carry the corresponding imbalance.",
          "Correct: two normal products and one product on each side of the normal n = 4 count.",
          "The specified failed sister separation changes two products.",
          "Only one chromosome is misdistributed; the other three still reach each affected product."
        ],
        "sourceUrls": [
          "https://openstax.org/books/biology-2e/pages/11-1-the-process-of-meiosis",
          "https://openstax.org/books/biology-2e/pages/13-2-chromosomal-basis-of-inherited-disorders"
        ],
        "canonId": "bio-mitosis-meiosis",
        "sourceId": "next-bio-division-separation-l2",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "next-bio-division-assortment-p1",
        "objectiveId": "bio-division-assortment",
        "world": "bio",
        "pool": "practice",
        "familyId": "bio-division-set-identity",
        "familyRationale": "Classify ploidy using represented homolog sets rather than the number of chromatids.",
        "prompt": "After meiosis I, a cell contains L1 and S2, each still made of two joined sisters. L and S are the two chromosome types in this species. What is its ploidy?",
        "choices": [
          "Diploid, because each chromosome has two sisters.",
          "Tetraploid, because four DNA molecules are present.",
          "Haploid, because it has one of each chromosome type.",
          "It has no ploidy until sisters separate."
        ],
        "answer": 2,
        "hint": "Count complete sets of chromosome types, not DNA copies.",
        "explanation": "L1 plus S2 supplies one complete set. Replication state does not make a second homologous set, so this cell is haploid.",
        "feedback": [
          "Sisters are duplicated copies of one homolog, not a homologous pair.",
          "Four DNA molecules do not necessarily mean four sets.",
          "Correct: one L and one S make one set.",
          "Ploidy remains meaningful while chromosomes are replicated."
        ],
        "sourceUrls": [
          "https://openstax.org/books/biology-2e/pages/10-1-cell-division",
          "https://openstax.org/books/biology-2e/pages/11-1-the-process-of-meiosis"
        ],
        "canonId": "bio-mitosis-meiosis",
        "sourceId": "next-bio-division-assortment-p1",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "next-bio-division-assortment-p2",
        "objectiveId": "bio-division-assortment",
        "world": "bio",
        "pool": "practice",
        "familyId": "bio-division-many-meioses-assortment",
        "familyRationale": "Enumerate whole-homolog possibilities across many meioses under the independent orientation model.",
        "prompt": "A diploid model organism has three homolog pairs. Each pair orients independently, both orientations are possible, and crossing over is excluded. Across many meioses, how many whole-homolog label combinations can a gamete have?",
        "choices": [
          "3",
          "6",
          "8",
          "64"
        ],
        "answer": 2,
        "hint": "There are two choices for each of three independent pairs.",
        "explanation": "The choice space is 2 × 2 × 2 = 8. The exponent is the haploid number n = 3.",
        "feedback": [
          "Three counts chromosome types, not combinations.",
          "Six is the diploid chromosome count; possibilities multiply across pairs.",
          "Correct: 2^3 whole-homolog combinations.",
          "Using six as the exponent counts each homolog as an independent pair."
        ],
        "sourceUrls": [
          "https://openstax.org/books/biology-2e/pages/10-1-cell-division",
          "https://openstax.org/books/biology-2e/pages/11-1-the-process-of-meiosis"
        ],
        "canonId": "bio-mitosis-meiosis",
        "sourceId": "next-bio-division-assortment-p2",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "next-bio-division-assortment-p3",
        "objectiveId": "bio-division-assortment",
        "world": "bio",
        "pool": "practice",
        "familyId": "bio-division-one-meiosis-products",
        "familyRationale": "Distinguish the four products of one fixed orientation from the whole possibility space.",
        "prompt": "In one meiosis with no crossing over, L1 and S2 go to one meiosis-I daughter; L2 and S1 go to the other. Both daughters complete meiosis II normally. What combinations occur among the four products?",
        "choices": [
          "L1S1, L1S2, L2S1 and L2S2, once each",
          "L1S2 twice and L2S1 twice",
          "L1L2 twice and S1S2 twice",
          "Only L1S2, four times"
        ],
        "answer": 1,
        "hint": "Sister separation makes two products from each fixed first-division combination.",
        "explanation": "Without crossing over, sisters carry the same homolog label. Each meiosis-I combination appears in two final products.",
        "feedback": [
          "All four combinations are possible across different orientations, not within this one fixed meiosis.",
          "Correct: two complementary combinations, each represented twice.",
          "Each normal product receives one L and one S, not both homologs of only one type.",
          "The opposite daughter carries the complementary L2S1 combination."
        ],
        "sourceUrls": [
          "https://openstax.org/books/biology-2e/pages/10-1-cell-division",
          "https://openstax.org/books/biology-2e/pages/11-1-the-process-of-meiosis"
        ],
        "canonId": "bio-mitosis-meiosis",
        "sourceId": "next-bio-division-assortment-p3",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "next-bio-division-assortment-c1",
        "objectiveId": "bio-division-assortment",
        "world": "bio",
        "pool": "check",
        "familyId": "bio-division-set-identity",
        "familyRationale": "Classify ploidy using represented homolog sets rather than the number of chromatids.",
        "prompt": "A species has three chromosome types: A, B and C. An intact nucleus has A1/A1, B2/B2 and C1/C1, where each slash joins sisters of one replicated chromosome. How many complete homologous sets are present?",
        "choices": [
          "One",
          "Two",
          "Three",
          "Six"
        ],
        "answer": 0,
        "hint": "Each slash represents copies of a single homolog, not two homologs.",
        "explanation": "The nucleus has one A, one B and one C homolog, each replicated. It therefore contains one complete set and is haploid.",
        "feedback": [
          "Correct: one member of each of the three types makes one set.",
          "The two DNA copies in each sister pair do not make two homologous sets.",
          "Three counts chromosome types within a set, not the number of sets.",
          "Six counts DNA molecules, not complete homologous sets."
        ],
        "sourceUrls": [
          "https://openstax.org/books/biology-2e/pages/10-1-cell-division",
          "https://openstax.org/books/biology-2e/pages/11-1-the-process-of-meiosis"
        ],
        "canonId": "bio-mitosis-meiosis",
        "sourceId": "next-bio-division-assortment-c1",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "next-bio-division-assortment-c2",
        "objectiveId": "bio-division-assortment",
        "world": "bio",
        "pool": "check",
        "familyId": "bio-division-many-meioses-assortment",
        "familyRationale": "Enumerate whole-homolog possibilities across many meioses under the independent orientation model.",
        "prompt": "For a diploid organism with 2n = 8, consider only independent assortment of whole homologs, with no crossing over. Across many meioses, how many distinct whole-homolog combinations are possible in a gamete?",
        "choices": [
          "8",
          "256",
          "4",
          "16"
        ],
        "answer": 3,
        "hint": "Convert 2n to the number of homolog pairs before using two choices per pair.",
        "explanation": "There are four homolog pairs, giving 2^4 = 16 possibilities.",
        "feedback": [
          "Eight is the diploid chromosome count, not the combination count.",
          "256 uses 2n = 8 as the exponent instead of n = 4.",
          "Four counts pairs, not their independent combinations.",
          "Correct: four independent two-way choices give sixteen possibilities."
        ],
        "sourceUrls": [
          "https://openstax.org/books/biology-2e/pages/10-1-cell-division",
          "https://openstax.org/books/biology-2e/pages/11-1-the-process-of-meiosis"
        ],
        "canonId": "bio-mitosis-meiosis",
        "sourceId": "next-bio-division-assortment-c2",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "next-bio-division-assortment-c3",
        "objectiveId": "bio-division-assortment",
        "world": "bio",
        "pool": "check",
        "familyId": "bio-division-one-meiosis-products",
        "familyRationale": "Distinguish the four products of one fixed orientation from the whole possibility space.",
        "prompt": "A learner claims that one meiosis in an organism with n = 3 must produce eight genetically different cells because 2^3 = 8. Under the stated model of no crossing over or mutation, what corrects the claim?",
        "choices": [
          "A single meiosis actually produces eight cells, but all identical.",
          "One meiosis produces four cells; 2^3 counts whole-homolog possibilities across many meioses.",
          "The formula should use 2n, so one meiosis produces 64 cells.",
          "A single meiosis produces only one cell, and its chromosomes choose eight orientations."
        ],
        "answer": 1,
        "hint": "Separate the number of actual products from the number of possible outcomes.",
        "explanation": "A standard meiosis has two divisions and four products. With no crossing over, one fixed orientation gives two complementary label combinations, each twice; eight possibilities require considering different meioses.",
        "feedback": [
          "Two divisions produce four cells in this model, not eight.",
          "Correct: the possibility space does not set the number of products from one cell.",
          "The exponent is n; neither expression counts products from one meiosis.",
          "The model follows all four products, not just one."
        ],
        "sourceUrls": [
          "https://openstax.org/books/biology-2e/pages/10-1-cell-division",
          "https://openstax.org/books/biology-2e/pages/11-1-the-process-of-meiosis"
        ],
        "canonId": "bio-mitosis-meiosis",
        "sourceId": "next-bio-division-assortment-c3",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "next-bio-division-assortment-l1",
        "objectiveId": "bio-division-assortment",
        "world": "bio",
        "pool": "later",
        "familyId": "bio-division-parent-product-space",
        "familyRationale": "Reserved transfer: combine two explicitly supplied parents’ gamete possibility spaces with independent union; no two-parent union task is taught.",
        "prompt": "Two diploid parents of the same n = 2 species each make four equally possible whole-homolog gamete types by independent assortment. Every homolog label is unique to its parent. A gamete from either parent can unite independently with any of the other parent’s four types. Ignore crossing over, mutation and viability differences. How many distinct pairs of gamete types can form a zygote?",
        "choices": [
          "4",
          "8",
          "16",
          "2"
        ],
        "answer": 2,
        "hint": "Build a table with one parent’s gamete types as rows and the other’s as columns.",
        "explanation": "Each of four row choices pairs with each of four column choices, giving 4 × 4 = 16 distinct parent-labeled combinations.",
        "feedback": [
          "Four counts one parent’s possibilities, before choosing the other parent’s contribution.",
          "Adding the two lists does not count pairs drawn from both lists.",
          "Correct: the independent gamete choices multiply.",
          "Two counts the contributing gametes per zygote, not possible combinations."
        ],
        "sourceUrls": [
          "https://openstax.org/books/biology-2e/pages/10-1-cell-division",
          "https://openstax.org/books/biology-2e/pages/11-1-the-process-of-meiosis"
        ],
        "canonId": "bio-mitosis-meiosis",
        "sourceId": "next-bio-division-assortment-l1",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "next-bio-division-assortment-l2",
        "objectiveId": "bio-division-assortment",
        "world": "bio",
        "pool": "later",
        "familyId": "bio-division-parent-product-space",
        "familyRationale": "Reserved transfer: combine two explicitly supplied parents’ gamete possibility spaces with independent union; no two-parent union task is taught.",
        "prompt": "Two n = 2 parents each have four equally likely gamete types from independent assortment without crossing over. An offspring receives one gamete from each parent independently. One specified gamete type from parent A must unite with either of two specified gamete types from parent B. What is the probability of this event?",
        "choices": [
          "1/2",
          "1/4",
          "1/8",
          "3/4"
        ],
        "answer": 2,
        "hint": "Use the fraction of allowed types from each parent and require both choices together.",
        "explanation": "The A condition has probability 1/4 and the B condition has probability 2/4. Independent union gives (1/4)(2/4) = 1/8.",
        "feedback": [
          "One-half considers only the B requirement.",
          "One-quarter considers only the A requirement.",
          "Correct: two of the sixteen equally likely paired combinations satisfy both conditions.",
          "Adding probabilities would describe a different event and would double-count overlap."
        ],
        "sourceUrls": [
          "https://openstax.org/books/biology-2e/pages/10-1-cell-division",
          "https://openstax.org/books/biology-2e/pages/11-1-the-process-of-meiosis"
        ],
        "canonId": "bio-mitosis-meiosis",
        "sourceId": "next-bio-division-assortment-l2",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      }
    ],
    "contentSha256": "2008fd2c7d198ff6274ee62045ee8fbde1cba85233253b6865e75e648211090e",
    "reviewStatus": "internal-reviewed",
    "verified": true,
    "progressEligible": true,
    "runtimeIntegrated": true,
    "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
  },
  {
    "id": "gc-gas-observatory",
    "world": "gc",
    "title": "The Ideal Gas Observatory",
    "scope": "Two introductory ideal-gas objectives: Kelvin state relationships and nonreacting mixture pressures. Kinetic-molecular speed distributions, effusion, real-gas corrections, gas collection over water and laboratory operations remain outside this chapter.",
    "objectiveIds": [
      "gc-gas-state-relations",
      "gc-gas-partial-pressure"
    ],
    "metadata": {
      "course": "GCHEM",
      "session": 3,
      "creature": "daltoni",
      "stationName": "Ideal Gas Observatory",
      "pathVariant": 1,
      "chapterTheme": "gc",
      "creatureDescriptor": {
        "id": "daltoni",
        "name": "Daltoni",
        "type": "forge",
        "color": "#e2a654",
        "bodyPlan": "piston-salamander",
        "concept": "Absolute-temperature state changes and component pressure accounting",
        "evolutions": [
          "Daltoni",
          "Kelvander",
          "Daltonaur"
        ],
        "rareName": "Aurora Daltonaur",
        "blurb": "A curious brass salamander carries a transparent model chamber. Its glowing gauges separate each gas contribution."
      },
      "topicMappings": {
        "screenshotTopicIds": [
          "bootcamp-general-chemistry-5"
        ],
        "officialOnlyTopicIds": []
      },
      "instructionFamilyIds": [
        "discovery-gc-gas-control-room",
        "gc-gas-kelvin-ratio",
        "gc-gas-combined-state",
        "gc-gas-fixed-amount-condition",
        "gc-gas-component-inventory",
        "gc-gas-fixed-volume-addition"
      ]
    },
    "canon": {
      "id": "gc-gas-laws-speed",
      "version": "0.2.1",
      "sourceRelativePath": "visuals/sheets/gchem/gc-gas-laws-speed.json",
      "sourceSha256": "878f430e3cda5579ea23b81ac826dda02dba88ab714f7126843bde6a73058672",
      "sourceRepository": "ace-system",
      "inspectedExportSha256": "53c2a6951e84c369d1e075d6c64e4672ea60bd35f29d01865d940019d02a391e",
      "adaptationVersion": 1,
      "importsSourceAssessments": false,
      "formativeCanonChecksProgressEligible": false
    },
    "objectives": [
      {
        "id": "gc-gas-state-relations",
        "world": "gc",
        "name": "Use absolute temperature and held variables to compare ideal-gas states",
        "lesson": "The ideal-gas relation is PV = nRT. Temperature must be absolute: T(K) = temperature in °C + 273.15. For an unchanged amount of gas, P1V1/T1 = P2V2/T2. Identify which quantities remain fixed before cancelling them. At fixed n and V, pressure follows Kelvin temperature; at fixed n and T, pressure varies inversely with volume. This is a model of equilibrium states, not a procedure for handling real gas apparatus.",
        "sourceUrls": [
          "https://openstax.org/books/chemistry-2e/pages/9-2-relating-pressure-volume-amount-and-temperature-the-ideal-gas-law"
        ],
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "gc-gas-partial-pressure",
        "world": "gc",
        "name": "Account for each component of an ideal-gas mixture",
        "lesson": "For nonreacting ideal gases sharing temperature T and volume V, a component contributes Pi = niRT/V. Total pressure is the sum of component pressures. Equivalently Pi = XiPtotal, where Xi = ni/ntotal is a mole fraction, not a mass fraction. Holding T and V fixed while adding another component leaves the original component pressure unchanged. Changing volume affects every component that remains in the container.",
        "sourceUrls": [
          "https://openstax.org/books/chemistry-2e/pages/9-2-relating-pressure-volume-amount-and-temperature-the-ideal-gas-law",
          "https://openstax.org/books/chemistry-2e/pages/9-3-stoichiometry-of-gaseous-substances-mixtures-and-reactions"
        ],
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      }
    ],
    "teachingByObjective": {
      "gc-gas-state-relations": {
        "objectiveId": "gc-gas-state-relations",
        "version": 1,
        "core": "The ideal-gas relation is PV = nRT. Temperature must be absolute: T(K) = temperature in °C + 273.15. For an unchanged amount of gas, P1V1/T1 = P2V2/T2. Identify which quantities remain fixed before cancelling them. At fixed n and V, pressure follows Kelvin temperature; at fixed n and T, pressure varies inversely with volume. This is a model of equilibrium states, not a procedure for handling real gas apparatus.",
        "terms": [
          {
            "term": "Absolute temperature",
            "meaning": "Temperature measured from absolute zero in kelvins."
          },
          {
            "term": "State variable",
            "meaning": "A quantity such as P, V, n or T describing the modeled equilibrium state."
          },
          {
            "term": "Held variable",
            "meaning": "A quantity explicitly kept unchanged between the compared states."
          }
        ],
        "assumptions": [
          "Ideal behavior at both endpoints; no phase change.",
          "Use 273.15 for Celsius conversion unless a question explicitly supplies another rounding convention.",
          "The combined-state equality requires unchanged n."
        ],
        "workedExample": {
          "prompt": "A sealed sample starts at 80 kPa, 6 L and 300 K. Its final volume is 3 L and final temperature is 450 K. Find final pressure.",
          "steps": [
            "The amount is unchanged. Write P2 = P1 × V1/V2 × T2/T1.",
            "The volume factor is 6/3 = 2; the Kelvin factor is 450/300 = 1.5.",
            "Multiply 80 kPa by both factors."
          ],
          "answer": "240 kPa.",
          "familyId": "gc-gas-combined-state",
          "role": "instruction-only"
        },
        "commonMistake": "Doubling a Celsius number does not double absolute temperature.",
        "nextAction": "Label the fixed quantities, convert temperatures, then check the direction before calculating.",
        "sourceUrls": [
          "https://openstax.org/books/chemistry-2e/pages/9-2-relating-pressure-volume-amount-and-temperature-the-ideal-gas-law"
        ],
        "canon": {
          "id": "gc-gas-laws-speed",
          "version": "0.2.1",
          "sourceRelativePath": "visuals/sheets/gchem/gc-gas-laws-speed.json",
          "sourceSha256": "878f430e3cda5579ea23b81ac826dda02dba88ab714f7126843bde6a73058672",
          "sourceRepository": "ace-system",
          "inspectedExportSha256": "53c2a6951e84c369d1e075d6c64e4672ea60bd35f29d01865d940019d02a391e",
          "adaptationVersion": 1,
          "importsSourceAssessments": false,
          "formativeCanonChecksProgressEligible": false,
          "reviewScope": "Ideal-state relationships only. Canon tags mention partial pressure but inspected teaching does not establish mixture instruction."
        },
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      "gc-gas-partial-pressure": {
        "objectiveId": "gc-gas-partial-pressure",
        "version": 1,
        "core": "For nonreacting ideal gases sharing temperature T and volume V, a component contributes Pi = niRT/V. Total pressure is the sum of component pressures. Equivalently Pi = XiPtotal, where Xi = ni/ntotal is a mole fraction, not a mass fraction. Holding T and V fixed while adding another component leaves the original component pressure unchanged. Changing volume affects every component that remains in the container.",
        "terms": [
          {
            "term": "Partial pressure",
            "meaning": "Pressure a component would exert alone at the mixture temperature and volume."
          },
          {
            "term": "Mole fraction",
            "meaning": "Component moles divided by total moles."
          },
          {
            "term": "Dalton addition",
            "meaning": "For this ideal nonreacting mixture, add component pressures to obtain the total."
          }
        ],
        "assumptions": [
          "All components share one temperature and the full container volume.",
          "No reaction, condensation or adsorption.",
          "Gas identity and molar mass do not appear in Pi = niRT/V once ni is known."
        ],
        "workedExample": {
          "prompt": "A model vessel holds 0.50 mol A and 1.50 mol B. Its total pressure is 240 kPa. Find each component pressure.",
          "steps": [
            "Total amount is 2.00 mol.",
            "A fraction is 0.50/2.00 = 0.25; B fraction is 0.75.",
            "Multiply each fraction by 240 kPa and check the sum."
          ],
          "answer": "PA = 60 kPa and PB = 180 kPa.",
          "familyId": "gc-gas-component-inventory",
          "role": "instruction-only"
        },
        "commonMistake": "A component occupies the whole mixture volume; do not assign it a private fraction of that volume.",
        "nextAction": "Write a separate row for each component: moles, fraction and partial pressure.",
        "sourceUrls": [
          "https://openstax.org/books/chemistry-2e/pages/9-2-relating-pressure-volume-amount-and-temperature-the-ideal-gas-law",
          "https://openstax.org/books/chemistry-2e/pages/9-3-stoichiometry-of-gaseous-substances-mixtures-and-reactions"
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
        "id": "continuation-gc-gas-state-relations-p1",
        "objectiveId": "gc-gas-state-relations",
        "world": "gc",
        "pool": "practice",
        "familyId": "gc-gas-kelvin-ratio",
        "familyRationale": "Apply the ideal-state relation with identified held variables; numerical changes are not a new task family.",
        "prompt": "An ideal gas at constant pressure and fixed amount occupies 3.0 L at 26.85 °C. What volume does it occupy at 126.85 °C? Use T(K) = °C + 273.15.",
        "choices": [
          "4.0 L",
          "14.2 L",
          "2.25 L",
          "3.0 L"
        ],
        "answer": 0,
        "hint": "Convert each endpoint separately before taking the ratio.",
        "explanation": "The endpoints are 300 K and 400 K. V2 = 3.0 × 400/300 = 4.0 L.",
        "feedback": [
          "Correct: volume follows absolute temperature at fixed n and P.",
          "This is approximately the Celsius ratio, which is not valid.",
          "This reverses the temperature ratio.",
          "The Kelvin temperature increases, so volume changes."
        ],
        "sourceUrls": [
          "https://openstax.org/books/chemistry-2e/pages/9-2-relating-pressure-volume-amount-and-temperature-the-ideal-gas-law"
        ],
        "canonId": "gc-gas-laws-speed",
        "sourceId": "continuation-gc-gas-state-relations-p1",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "continuation-gc-gas-state-relations-p2",
        "objectiveId": "gc-gas-state-relations",
        "world": "gc",
        "pool": "practice",
        "familyId": "gc-gas-combined-state",
        "familyRationale": "Apply the ideal-state relation with identified held variables; numerical changes are not a new task family.",
        "prompt": "A fixed amount of ideal gas at 90 kPa occupies 4.0 L. At the same temperature its volume becomes 2.0 L. What is its final pressure?",
        "choices": [
          "45 kPa",
          "90 kPa",
          "180 kPa",
          "360 kPa"
        ],
        "answer": 2,
        "hint": "At fixed n and T, the product PV stays constant.",
        "explanation": "P2 = 90 × 4/2 = 180 kPa.",
        "feedback": [
          "This makes pressure fall when volume falls.",
          "The volume change cannot be ignored.",
          "Correct: halving volume doubles pressure.",
          "The volume factor is two, not four."
        ],
        "sourceUrls": [
          "https://openstax.org/books/chemistry-2e/pages/9-2-relating-pressure-volume-amount-and-temperature-the-ideal-gas-law"
        ],
        "canonId": "gc-gas-laws-speed",
        "sourceId": "continuation-gc-gas-state-relations-p2",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "continuation-gc-gas-state-relations-p3",
        "objectiveId": "gc-gas-state-relations",
        "world": "gc",
        "pool": "practice",
        "familyId": "gc-gas-combined-state",
        "familyRationale": "Apply the ideal-state relation with identified held variables; numerical changes are not a new task family.",
        "prompt": "A sealed ideal gas starts at 160 kPa, 3.0 L and 300 K. Its final state is 4.5 L and 450 K. What is its final pressure?",
        "choices": [
          "80 kPa",
          "160 kPa",
          "240 kPa",
          "360 kPa"
        ],
        "answer": 1,
        "hint": "Apply both the volume factor and the temperature factor.",
        "explanation": "P2 = 160 × (3/4.5) × (450/300) = 160 kPa. The factors cancel.",
        "feedback": [
          "The opposing factors cancel; pressure does not halve.",
          "Correct: T and V increase by the same factor.",
          "This includes the temperature change but ignores volume.",
          "This multiplies by the volume ratio in the wrong direction."
        ],
        "sourceUrls": [
          "https://openstax.org/books/chemistry-2e/pages/9-2-relating-pressure-volume-amount-and-temperature-the-ideal-gas-law"
        ],
        "canonId": "gc-gas-laws-speed",
        "sourceId": "continuation-gc-gas-state-relations-p3",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "continuation-gc-gas-state-relations-c1",
        "objectiveId": "gc-gas-state-relations",
        "world": "gc",
        "pool": "check",
        "familyId": "gc-gas-kelvin-ratio",
        "familyRationale": "Apply the ideal-state relation with identified held variables; numerical changes are not a new task family.",
        "prompt": "A rigid sealed ideal-gas vessel has pressure 120 kPa at 450 K. At 300 K, what is the pressure?",
        "choices": [
          "180 kPa",
          "120 kPa",
          "60 kPa",
          "80 kPa"
        ],
        "answer": 3,
        "hint": "Rigid fixes V; sealed fixes n in this nonreacting model.",
        "explanation": "P2 = 120 × 300/450 = 80 kPa.",
        "feedback": [
          "This reverses the temperature ratio.",
          "The temperature has changed.",
          "The temperature falls to two-thirds, not one-half.",
          "Correct: pressure follows the Kelvin ratio."
        ],
        "sourceUrls": [
          "https://openstax.org/books/chemistry-2e/pages/9-2-relating-pressure-volume-amount-and-temperature-the-ideal-gas-law"
        ],
        "canonId": "gc-gas-laws-speed",
        "sourceId": "continuation-gc-gas-state-relations-c1",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "continuation-gc-gas-state-relations-c2",
        "objectiveId": "gc-gas-state-relations",
        "world": "gc",
        "pool": "check",
        "familyId": "gc-gas-combined-state",
        "familyRationale": "Apply the ideal-state relation with identified held variables; numerical changes are not a new task family.",
        "prompt": "A fixed amount of ideal gas starts at 100 kPa, 3.0 L and 250 K. At 200 kPa and 375 K, what volume does it occupy?",
        "choices": [
          "2.25 L",
          "4.50 L",
          "1.00 L",
          "9.00 L"
        ],
        "answer": 0,
        "hint": "Solve for V2 and include the pressure ratio in the direction P1/P2.",
        "explanation": "V2 = 3.0 × (100/200) × (375/250) = 2.25 L.",
        "feedback": [
          "Correct: higher pressure partly offsets heating.",
          "This ignores the doubled pressure.",
          "This inverts the temperature factor.",
          "This increases volume with pressure rather than inversely."
        ],
        "sourceUrls": [
          "https://openstax.org/books/chemistry-2e/pages/9-2-relating-pressure-volume-amount-and-temperature-the-ideal-gas-law"
        ],
        "canonId": "gc-gas-laws-speed",
        "sourceId": "continuation-gc-gas-state-relations-c2",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "continuation-gc-gas-state-relations-c3",
        "objectiveId": "gc-gas-state-relations",
        "world": "gc",
        "pool": "check",
        "familyId": "gc-gas-fixed-amount-condition",
        "familyRationale": "Recognize the fixed-amount precondition rather than blindly apply the combined-state equality.",
        "prompt": "Which statement is required to use P1V1/T1 = P2V2/T2 for a gas between two ideal states?",
        "choices": [
          "Its pressure must stay constant.",
          "Its volume must stay constant.",
          "Its amount in moles must stay constant.",
          "Its Celsius temperature must be positive."
        ],
        "answer": 2,
        "hint": "Compare each side with nR.",
        "explanation": "PV/T = nR. With the same R, equality of the two expressions requires equal n. P, V and T may all change.",
        "feedback": [
          "Pressure may change if the other quantities compensate.",
          "Volume may change.",
          "Correct: unchanged n makes PV/T constant.",
          "Kelvin temperature must be physically positive; Celsius can be negative."
        ],
        "sourceUrls": [
          "https://openstax.org/books/chemistry-2e/pages/9-2-relating-pressure-volume-amount-and-temperature-the-ideal-gas-law"
        ],
        "canonId": "gc-gas-laws-speed",
        "sourceId": "continuation-gc-gas-state-relations-c3",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "continuation-gc-gas-state-relations-l1",
        "objectiveId": "gc-gas-state-relations",
        "world": "gc",
        "pool": "later",
        "familyId": "gc-gas-amount-audit",
        "familyRationale": "Reserved transfer: infer whether amount is conserved from two measured PVT endpoints; no ordinary task solves for the inventory ratio.",
        "prompt": "An ideal-gas inventory begins at 100 kPa, 4 L and 300 K. Later it is at 75 kPa, 4 L and 450 K. The gas is the same species, but the container may have lost gas. What fraction of the original amount remains?",
        "choices": [
          "1.50",
          "0.75",
          "0.50",
          "0.25"
        ],
        "answer": 2,
        "hint": "At each endpoint, n is proportional to PV/T.",
        "explanation": "n2/n1 = (75 × 4/450)/(100 × 4/300) = 0.50. The higher temperature would mask part of the amount loss if pressure alone were compared.",
        "feedback": [
          "This uses the temperature ratio alone.",
          "This uses pressure alone and ignores the temperature rise.",
          "Correct: half the original moles remain.",
          "The pressure decrease is not itself the fractional loss of moles."
        ],
        "sourceUrls": [
          "https://openstax.org/books/chemistry-2e/pages/9-2-relating-pressure-volume-amount-and-temperature-the-ideal-gas-law"
        ],
        "canonId": "gc-gas-laws-speed",
        "sourceId": "continuation-gc-gas-state-relations-l1",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "continuation-gc-gas-state-relations-l2",
        "objectiveId": "gc-gas-state-relations",
        "world": "gc",
        "pool": "later",
        "familyId": "gc-gas-amount-audit",
        "familyRationale": "Same reserved endpoint-inventory audit family, not a second novelty credit.",
        "prompt": "A nonreacting ideal-gas sample starts at 80 kPa, 6 L and 300 K. Its later measurements are 120 kPa, 3 L and 300 K. Amount conservation is not guaranteed. How much of the original amount remains?",
        "choices": [
          "0.75",
          "1.50",
          "1.00",
          "0.50"
        ],
        "answer": 0,
        "hint": "Compare the two PV/T values rather than assume n stayed fixed.",
        "explanation": "At equal temperature, the mole ratio is (120 × 3)/(80 × 6) = 360/480 = 0.75.",
        "feedback": [
          "Correct: 75% of the original moles remain.",
          "This uses pressure alone and omits the smaller volume.",
          "Sealing or fixed amount was not stated, and the PV products differ.",
          "This uses volume alone."
        ],
        "sourceUrls": [
          "https://openstax.org/books/chemistry-2e/pages/9-2-relating-pressure-volume-amount-and-temperature-the-ideal-gas-law"
        ],
        "canonId": "gc-gas-laws-speed",
        "sourceId": "continuation-gc-gas-state-relations-l2",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "continuation-gc-gas-partial-pressure-p1",
        "objectiveId": "gc-gas-partial-pressure",
        "world": "gc",
        "pool": "practice",
        "familyId": "gc-gas-component-inventory",
        "familyRationale": "Account for a component with niRT/V or XiPtotal; composition and numeric variations remain this family.",
        "prompt": "A nonreacting ideal mixture contains 1.0 mol A and 3.0 mol B. Total pressure is 160 kPa. What is PA?",
        "choices": [
          "120 kPa",
          "40 kPa",
          "53.3 kPa",
          "160 kPa"
        ],
        "answer": 1,
        "hint": "The denominator of a mole fraction is total moles.",
        "explanation": "XA = 1/(1+3) = 1/4, so PA = 40 kPa.",
        "feedback": [
          "This is the contribution from B.",
          "Correct: A supplies one quarter of the moles and pressure.",
          "This divides by B moles instead of total moles.",
          "Total pressure includes B as well."
        ],
        "sourceUrls": [
          "https://openstax.org/books/chemistry-2e/pages/9-2-relating-pressure-volume-amount-and-temperature-the-ideal-gas-law",
          "https://openstax.org/books/chemistry-2e/pages/9-3-stoichiometry-of-gaseous-substances-mixtures-and-reactions"
        ],
        "sourceId": "continuation-gc-gas-partial-pressure-p1",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "continuation-gc-gas-partial-pressure-p2",
        "objectiveId": "gc-gas-partial-pressure",
        "world": "gc",
        "pool": "practice",
        "familyId": "gc-gas-component-inventory",
        "familyRationale": "Account for a component with niRT/V or XiPtotal; composition and numeric variations remain this family.",
        "prompt": "A model mixture contains 2 mol A and 1 mol B. The supplied RT/V is 50 kPa/mol. Which pair gives PA and total pressure?",
        "choices": [
          "50 kPa and 100 kPa",
          "100 kPa and 100 kPa",
          "150 kPa and 150 kPa",
          "100 kPa and 150 kPa"
        ],
        "answer": 3,
        "hint": "Apply the same RT/V to each component amount.",
        "explanation": "PA = 2 × 50 = 100 kPa; PB = 1 × 50 = 50 kPa; total = 150 kPa.",
        "feedback": [
          "A contains two moles, not one.",
          "This omits the pressure contribution of B.",
          "This assigns the total amount to A alone.",
          "Correct: the component contributions sum to the total."
        ],
        "sourceUrls": [
          "https://openstax.org/books/chemistry-2e/pages/9-2-relating-pressure-volume-amount-and-temperature-the-ideal-gas-law",
          "https://openstax.org/books/chemistry-2e/pages/9-3-stoichiometry-of-gaseous-substances-mixtures-and-reactions"
        ],
        "sourceId": "continuation-gc-gas-partial-pressure-p2",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "continuation-gc-gas-partial-pressure-p3",
        "objectiveId": "gc-gas-partial-pressure",
        "world": "gc",
        "pool": "practice",
        "familyId": "gc-gas-fixed-volume-addition",
        "familyRationale": "Adding an ideal inert component at fixed T and V changes total pressure but not an unchanged component inventory.",
        "prompt": "An ideal mixture has PA = 30 kPa and PB = 70 kPa. More B is added while temperature and container volume remain fixed; no A is added or removed. What happens to PA?",
        "choices": [
          "It increases.",
          "It decreases.",
          "It remains 30 kPa.",
          "It becomes zero."
        ],
        "answer": 2,
        "hint": "Write PA = nART/V and identify what changed in that expression.",
        "explanation": "nA, R, T and V are unchanged, so PA stays 30 kPa. Total pressure rises because PB rises.",
        "feedback": [
          "The increase in total pressure does not require PA to rise.",
          "B does not reserve space away from A in the ideal model.",
          "Correct: every quantity determining PA is unchanged.",
          "A remains in the vessel."
        ],
        "sourceUrls": [
          "https://openstax.org/books/chemistry-2e/pages/9-2-relating-pressure-volume-amount-and-temperature-the-ideal-gas-law",
          "https://openstax.org/books/chemistry-2e/pages/9-3-stoichiometry-of-gaseous-substances-mixtures-and-reactions"
        ],
        "sourceId": "continuation-gc-gas-partial-pressure-p3",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "continuation-gc-gas-partial-pressure-c1",
        "objectiveId": "gc-gas-partial-pressure",
        "world": "gc",
        "pool": "check",
        "familyId": "gc-gas-component-inventory",
        "familyRationale": "Account for a component with niRT/V or XiPtotal; composition and numeric variations remain this family.",
        "prompt": "An ideal mixture contains 8.0 g He (4.0 g/mol) and 28 g N2 (28 g/mol). Total pressure is 300 kPa. What is the He partial pressure?",
        "choices": [
          "66.7 kPa",
          "100 kPa",
          "200 kPa",
          "233 kPa"
        ],
        "answer": 2,
        "hint": "Convert each component mass to moles before forming a fraction.",
        "explanation": "He is 2.0 mol; N2 is 1.0 mol. XHe = 2/3, so PHe = 200 kPa.",
        "feedback": [
          "This uses mass fraction 8/36 instead of mole fraction.",
          "This is the N2 contribution.",
          "Correct: helium supplies two-thirds of the moles.",
          "This reverses the mass contribution and still uses the wrong fraction."
        ],
        "sourceUrls": [
          "https://openstax.org/books/chemistry-2e/pages/9-2-relating-pressure-volume-amount-and-temperature-the-ideal-gas-law",
          "https://openstax.org/books/chemistry-2e/pages/9-3-stoichiometry-of-gaseous-substances-mixtures-and-reactions"
        ],
        "sourceId": "continuation-gc-gas-partial-pressure-c1",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "continuation-gc-gas-partial-pressure-c2",
        "objectiveId": "gc-gas-partial-pressure",
        "world": "gc",
        "pool": "check",
        "familyId": "gc-gas-component-inventory",
        "familyRationale": "Account for a component with niRT/V or XiPtotal; composition and numeric variations remain this family.",
        "prompt": "A closed nonreacting ideal mixture has PA = 40 kPa and PB = 80 kPa. Temperature stays fixed while total volume doubles. What are the final PA and total pressure?",
        "choices": [
          "20 kPa and 60 kPa",
          "40 kPa and 120 kPa",
          "80 kPa and 240 kPa",
          "20 kPa and 120 kPa"
        ],
        "answer": 0,
        "hint": "Each component has unchanged n and T and twice the volume.",
        "explanation": "Both partial pressures halve: PA = 20 kPa and PB = 40 kPa. Total is 60 kPa.",
        "feedback": [
          "Correct: the whole mixture and each component obey the volume change.",
          "This ignores the volume change.",
          "This makes pressure grow with volume.",
          "The total must equal the new component sum."
        ],
        "sourceUrls": [
          "https://openstax.org/books/chemistry-2e/pages/9-2-relating-pressure-volume-amount-and-temperature-the-ideal-gas-law",
          "https://openstax.org/books/chemistry-2e/pages/9-3-stoichiometry-of-gaseous-substances-mixtures-and-reactions"
        ],
        "sourceId": "continuation-gc-gas-partial-pressure-c2",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "continuation-gc-gas-partial-pressure-c3",
        "objectiveId": "gc-gas-partial-pressure",
        "world": "gc",
        "pool": "check",
        "familyId": "gc-gas-component-inventory",
        "familyRationale": "Account for a component with niRT/V or XiPtotal; composition and numeric variations remain this family.",
        "prompt": "At fixed T and V, an ideal mixture changes from 1 mol A plus 2 mol B to 2 mol A plus 4 mol B. Which statement is correct?",
        "choices": [
          "XA doubles and total pressure is unchanged.",
          "XA is unchanged and total pressure doubles.",
          "XA halves and total pressure doubles.",
          "XA is unchanged and total pressure is unchanged."
        ],
        "answer": 1,
        "hint": "Compare the fraction A/total separately from the total number of moles.",
        "explanation": "XA remains 1/3 because both amounts double. Total pressure doubles because ntotal doubles at fixed T and V.",
        "feedback": [
          "Scaling both amounts does not change their fraction.",
          "Correct: fraction and absolute pressure carry different information.",
          "The A fraction stays 1/3.",
          "The fraction is unchanged, but total moles and total pressure double."
        ],
        "sourceUrls": [
          "https://openstax.org/books/chemistry-2e/pages/9-2-relating-pressure-volume-amount-and-temperature-the-ideal-gas-law",
          "https://openstax.org/books/chemistry-2e/pages/9-3-stoichiometry-of-gaseous-substances-mixtures-and-reactions"
        ],
        "sourceId": "continuation-gc-gas-partial-pressure-c3",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "continuation-gc-gas-partial-pressure-l1",
        "objectiveId": "gc-gas-partial-pressure",
        "world": "gc",
        "pool": "later",
        "familyId": "gc-gas-connected-vessels",
        "familyRationale": "Reserved transfer: conserve each component from a separate initial volume into a shared final volume at equal temperature.",
        "prompt": "Two rigid vessels initially contain pure nonreacting ideal gases at the same temperature: A at 80 kPa in 2 L, and B at 120 kPa in 3 L. They are connected with negligible connecting volume and allowed to mix at that same temperature. What are final PA and total pressure?",
        "choices": [
          "80 kPa and 200 kPa",
          "32 kPa and 104 kPa",
          "40 kPa and 100 kPa",
          "48 kPa and 96 kPa"
        ],
        "answer": 1,
        "hint": "Each component amount is conserved while its accessible volume becomes 5 L.",
        "explanation": "PA = 80 × 2/5 = 32 kPa; PB = 120 × 3/5 = 72 kPa. Their sum is 104 kPa.",
        "feedback": [
          "Each component now occupies more volume, so its initial pressure does not persist.",
          "Correct: conserve each initial P × V and use the final 5 L.",
          "An unweighted mean ignores unequal starting volumes.",
          "The initial volume of A is 2 L, not 3 L."
        ],
        "sourceUrls": [
          "https://openstax.org/books/chemistry-2e/pages/9-2-relating-pressure-volume-amount-and-temperature-the-ideal-gas-law",
          "https://openstax.org/books/chemistry-2e/pages/9-3-stoichiometry-of-gaseous-substances-mixtures-and-reactions"
        ],
        "sourceId": "continuation-gc-gas-partial-pressure-l1",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "continuation-gc-gas-partial-pressure-l2",
        "objectiveId": "gc-gas-partial-pressure",
        "world": "gc",
        "pool": "later",
        "familyId": "gc-gas-connected-vessels",
        "familyRationale": "Same reserved connected-vessel transfer family; changed numbers are not a new novelty claim.",
        "prompt": "Pure ideal A occupies 4 L at 90 kPa; pure ideal B occupies 2 L at 30 kPa. They are nonreacting and at the same temperature. After connecting the rigid vessels, with negligible connecting volume and unchanged temperature, what is the final mole fraction of A?",
        "choices": [
          "2/3",
          "3/4",
          "6/7",
          "1/2"
        ],
        "answer": 2,
        "hint": "At the shared initial temperature, compare each initial P × V to find the relative mole amounts.",
        "explanation": "nA:nB = (90 × 4):(30 × 2) = 360:60 = 6:1. Thus XA = 6/7. Final partial pressures are 60 kPa and 10 kPa.",
        "feedback": [
          "Initial volume fraction is not mole fraction when pressures differ.",
          "Initial pressure fraction omits the unequal volumes.",
          "Correct: moles track PV at the common temperature.",
          "The component mole amounts are unequal."
        ],
        "sourceUrls": [
          "https://openstax.org/books/chemistry-2e/pages/9-2-relating-pressure-volume-amount-and-temperature-the-ideal-gas-law",
          "https://openstax.org/books/chemistry-2e/pages/9-3-stoichiometry-of-gaseous-substances-mixtures-and-reactions"
        ],
        "sourceId": "continuation-gc-gas-partial-pressure-l2",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      }
    ],
    "contentSha256": "7b9c16c6693547ede68beb5ba1138b31277eee6c1c8c0f6aca760b1c4c4afa88",
    "reviewStatus": "internal-reviewed",
    "verified": true,
    "progressEligible": true,
    "runtimeIntegrated": true,
    "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
  },
  {
    "id": "oc-stereochemistry-gallery",
    "world": "oc",
    "title": "The Stereochemistry Gallery",
    "scope": "Two bounded objectives: connectivity versus stereoisomer relationships, and single-center CIP configuration with simple neighbors and isotope priorities. Fischer projections, E/Z, conformational analysis, ring and multiple-bond CIP, stereoisomer counting and full meso classification remain outside this chapter. Methyl or duplicate-ligand SN2 examples are not presented as stereocenters.",
    "objectiveIds": [
      "oc-isomer-relationships",
      "oc-cip-configuration"
    ],
    "metadata": {
      "course": "OCHEM",
      "session": 3,
      "creature": "chiralyn",
      "stationName": "Stereochemistry Gallery",
      "pathVariant": 2,
      "chapterTheme": "oc",
      "creatureDescriptor": {
        "id": "chiralyn",
        "name": "Chiralyn",
        "type": "alchemy",
        "color": "#b391d4",
        "bodyPlan": "prismatic-moth",
        "concept": "Connectivity, mirror configurations and depth-aware priority tracing",
        "evolutions": [
          "Chiralyn",
          "Prismelle",
          "Stereolume"
        ],
        "rareName": "Moonlit Stereolume",
        "blurb": "A curious moth folds four different crystal lanterns around a central jewel. Turning it changes the view, while its handedness remains."
      },
      "topicMappings": {
        "screenshotTopicIds": [
          "bootcamp-organic-chemistry-4"
        ],
        "officialOnlyTopicIds": []
      },
      "instructionFamilyIds": [
        "discovery-oc-stereochemistry-gallery",
        "oc-isomer-connectivity",
        "oc-isomer-fixed-configuration",
        "oc-cip-direct-atomic-priority",
        "oc-cip-neighbor-priority",
        "oc-cip-wedge-configuration"
      ]
    },
    "canon": {
      "id": "oc-stereochemistry",
      "version": "0.1.0",
      "sourceRelativePath": "visuals/sheets/ochem/oc-stereochemistry.json",
      "sourceSha256": "1333f9f16140bec45cc1c31eb90ded520d93acf37e03d2a0e374c8b5590bdcbe",
      "sourceRepository": "ace-system",
      "inspectedExportSha256": "53c2a6951e84c369d1e075d6c64e4672ea60bd35f29d01865d940019d02a391e",
      "adaptationVersion": 1,
      "importsSourceAssessments": false,
      "formativeCanonChecksProgressEligible": false
    },
    "objectives": [
      {
        "id": "oc-isomer-relationships",
        "world": "oc",
        "name": "Distinguish connectivity and stereoisomer relationships",
        "lesson": "First compare molecular formulas, then connectivity, then spatial arrangement. Constitutional isomers have the same formula but different bonds between atoms. Stereoisomers keep connectivity: enantiomers are nonidentical mirror images, while diastereomers are stereoisomers that are not mirror images. A rigid rotation alone preserves identity. With multiple stereocenters, check molecular symmetry; merely counting changed R/S labels without that check is unsafe.",
        "sourceUrls": [
          "https://openstax.org/books/organic-chemistry/pages/5-9-a-review-of-isomerism",
          "https://openstax.org/books/organic-chemistry/pages/5-5-sequence-rules-for-specifying-configuration"
        ],
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "oc-cip-configuration",
        "world": "oc",
        "name": "Rank ligands and assign R/S at one defined tetrahedral stereocenter",
        "lesson": "For the four ligands at a defined stereocenter, rank the directly attached atoms by atomic number. Break a tied first atom by comparing outward neighbor lists in descending atomic-number order at the first difference. Isotopes of the same element rank by mass number, heavier first. With priority 4 directed away, clockwise 1→2→3 is R and counterclockwise is S; when 4 points toward you, reverse the apparent result. R/S is independent of the measured sign of optical rotation.",
        "sourceUrls": [
          "https://openstax.org/books/organic-chemistry/pages/5-5-sequence-rules-for-specifying-configuration"
        ],
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      }
    ],
    "teachingByObjective": {
      "oc-isomer-relationships": {
        "objectiveId": "oc-isomer-relationships",
        "version": 1,
        "core": "First compare molecular formulas, then connectivity, then spatial arrangement. Constitutional isomers have the same formula but different bonds between atoms. Stereoisomers keep connectivity: enantiomers are nonidentical mirror images, while diastereomers are stereoisomers that are not mirror images. A rigid rotation alone preserves identity. With multiple stereocenters, check molecular symmetry; merely counting changed R/S labels without that check is unsafe.",
        "terms": [
          {
            "term": "Connectivity",
            "meaning": "Which atoms are bonded to which other atoms."
          },
          {
            "term": "Stereocenter",
            "meaning": "Here, a tetrahedral carbon attached to four different ligands."
          },
          {
            "term": "Enantiomers",
            "meaning": "Nonsuperimposable mirror-image molecules."
          },
          {
            "term": "Diastereomers",
            "meaning": "Stereoisomers that are not mirror images."
          },
          {
            "term": "Internal symmetry",
            "meaning": "A molecular symmetry that can make a mirror image identical even when stereocenters exist."
          }
        ],
        "assumptions": [
          "All stated R/S labels are supplied facts unless the task explicitly asks for assignment.",
          "Two-center examples use distinct centers of a molecule stated to lack internal symmetry.",
          "A flat condensed formula alone does not specify a stereocenter configuration."
        ],
        "workedExample": {
          "prompt": "Two samples are (2R,3R)- and (2S,3R)-2-bromo-3-chloropentane. Their connectivity is identical and there is no internal symmetry. Classify the pair.",
          "steps": [
            "C2 changes from R to S; C3 remains R.",
            "The unchanged connectivity rules out constitutional isomers.",
            "Only one of the two distinct centers differs, so these are not mirror configurations."
          ],
          "answer": "Diastereomers.",
          "familyId": "oc-isomer-fixed-configuration",
          "role": "instruction-only"
        },
        "commonMistake": "A changed page orientation is not a changed configuration; also, not every molecule with stereocenters is chiral.",
        "nextAction": "Compare formula and connectivity before comparing corresponding centers and symmetry.",
        "sourceUrls": [
          "https://openstax.org/books/organic-chemistry/pages/5-9-a-review-of-isomerism",
          "https://openstax.org/books/organic-chemistry/pages/5-5-sequence-rules-for-specifying-configuration"
        ],
        "canon": {
          "id": "oc-stereochemistry",
          "version": "0.1.0",
          "sourceRelativePath": "visuals/sheets/ochem/oc-stereochemistry.json",
          "sourceSha256": "1333f9f16140bec45cc1c31eb90ded520d93acf37e03d2a0e374c8b5590bdcbe",
          "sourceRepository": "ace-system",
          "inspectedExportSha256": "53c2a6951e84c369d1e075d6c64e4672ea60bd35f29d01865d940019d02a391e",
          "adaptationVersion": 1,
          "importsSourceAssessments": false,
          "formativeCanonChecksProgressEligible": false,
          "reviewScope": "Original bounded classification and single-center CIP instruction. No imported source assessment; Fischer, E/Z, rings and full symmetry analysis are deferred."
        },
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      "oc-cip-configuration": {
        "objectiveId": "oc-cip-configuration",
        "version": 1,
        "core": "For the four ligands at a defined stereocenter, rank the directly attached atoms by atomic number. Break a tied first atom by comparing outward neighbor lists in descending atomic-number order at the first difference. Isotopes of the same element rank by mass number, heavier first. With priority 4 directed away, clockwise 1→2→3 is R and counterclockwise is S; when 4 points toward you, reverse the apparent result. R/S is independent of the measured sign of optical rotation.",
        "terms": [
          {
            "term": "Atomic-number priority",
            "meaning": "A larger proton number outranks a smaller one at the first compared atom."
          },
          {
            "term": "First point of difference",
            "meaning": "Compare sorted neighbor lists outward only until the earliest unequal entry."
          },
          {
            "term": "Isotope priority",
            "meaning": "For the same element, a greater mass number receives higher priority."
          },
          {
            "term": "Solid wedge",
            "meaning": "The bond projects toward the observer."
          },
          {
            "term": "Hashed wedge",
            "meaning": "The bond projects away from the observer."
          }
        ],
        "assumptions": [
          "A single tetrahedral carbon with four distinct ligands is specified.",
          "Diagrams use plain bonds in the page and explicit wedge/dash depth.",
          "These tasks need direct-atom, simple carbon-neighbor or isotope comparison, not advanced ring or multiple-bond CIP algorithms."
        ],
        "workedExample": {
          "prompt": "A carbon has OH at upper left, CH2CH3 at upper right, CH3 at lower left on a solid wedge, and H at lower right on a hashed wedge. Assign R/S.",
          "steps": [
            "O outranks C and H, so OH is 1 and H is 4.",
            "Compare the carbon ligands: ethyl has (C,H,H), methyl has (H,H,H). Ethyl is 2 and methyl is 3.",
            "The page trace from upper left to upper right to lower left is clockwise.",
            "The lowest-priority H points away, so use that trace directly."
          ],
          "answer": "R.",
          "familyId": "oc-cip-wedge-configuration",
          "role": "instruction-only"
        },
        "commonMistake": "Do not rank a whole group by its total mass, or infer R/S from clockwise alone without checking priority 4.",
        "nextAction": "Rank all four ligands, identify depth of group 4, and then trace 1→2→3.",
        "sourceUrls": [
          "https://openstax.org/books/organic-chemistry/pages/5-5-sequence-rules-for-specifying-configuration"
        ],
        "canon": {
          "id": "oc-stereochemistry",
          "version": "0.1.0",
          "sourceRelativePath": "visuals/sheets/ochem/oc-stereochemistry.json",
          "sourceSha256": "1333f9f16140bec45cc1c31eb90ded520d93acf37e03d2a0e374c8b5590bdcbe",
          "sourceRepository": "ace-system",
          "inspectedExportSha256": "53c2a6951e84c369d1e075d6c64e4672ea60bd35f29d01865d940019d02a391e",
          "adaptationVersion": 1,
          "importsSourceAssessments": false,
          "formativeCanonChecksProgressEligible": false,
          "reviewScope": "Original bounded classification and single-center CIP instruction. No imported source assessment; Fischer, E/Z, rings and full symmetry analysis are deferred."
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
        "id": "continuation-oc-isomer-relationships-p1",
        "objectiveId": "oc-isomer-relationships",
        "world": "oc",
        "pool": "practice",
        "familyId": "oc-isomer-connectivity",
        "familyRationale": "Compare connectivity before attempting spatial classification.",
        "prompt": "Compare CH3CH2CH2OH and CH3CH(OH)CH3. Both have formula C3H8O. What is their relationship?",
        "choices": [
          "Constitutional isomers",
          "Enantiomers",
          "Diastereomers",
          "Identical molecules"
        ],
        "answer": 0,
        "hint": "Check which carbon is bonded to oxygen.",
        "explanation": "The OH group is bonded to an end carbon in one structure and the middle carbon in the other. Connectivity differs.",
        "feedback": [
          "Correct: the same formula has different connectivity.",
          "Mirror images preserve connectivity.",
          "Diastereomers also preserve connectivity.",
          "Moving the OH bond to another carbon changes the molecule."
        ],
        "sourceUrls": [
          "https://openstax.org/books/organic-chemistry/pages/5-9-a-review-of-isomerism",
          "https://openstax.org/books/organic-chemistry/pages/5-5-sequence-rules-for-specifying-configuration"
        ],
        "canonId": "oc-stereochemistry",
        "sourceId": "continuation-oc-isomer-relationships-p1",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "continuation-oc-isomer-relationships-p2",
        "objectiveId": "oc-isomer-relationships",
        "world": "oc",
        "pool": "practice",
        "familyId": "oc-isomer-fixed-configuration",
        "familyRationale": "Classify given configurations; new labels or molecules are not new task families.",
        "prompt": "A pair consists of (R)-2-butanol and (S)-2-butanol, each with exactly one stereocenter and the same connectivity. What is their relationship?",
        "choices": [
          "Constitutional isomers",
          "Enantiomers",
          "Diastereomers",
          "Identical molecules"
        ],
        "answer": 1,
        "hint": "A single tetrahedral stereocenter with four different ligands has two mirror configurations.",
        "explanation": "The sole stereocenter has opposite configuration. These two structures are nonidentical mirror images.",
        "feedback": [
          "The connectivity does not change.",
          "Correct: the configurations are an enantiomeric pair.",
          "For this one-center pair the alternatives are mirror images, not diastereomers.",
          "A rigid rotation cannot change R into S."
        ],
        "sourceUrls": [
          "https://openstax.org/books/organic-chemistry/pages/5-9-a-review-of-isomerism",
          "https://openstax.org/books/organic-chemistry/pages/5-5-sequence-rules-for-specifying-configuration"
        ],
        "canonId": "oc-stereochemistry",
        "sourceId": "continuation-oc-isomer-relationships-p2",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "continuation-oc-isomer-relationships-p3",
        "objectiveId": "oc-isomer-relationships",
        "world": "oc",
        "pool": "practice",
        "familyId": "oc-isomer-fixed-configuration",
        "familyRationale": "Classify provided labels at two distinct nonsymmetric centers.",
        "prompt": "Compare (2R,3R)- and (2R,3S)-2-bromo-3-chloropentane. Connectivity is the same and the molecule has no internal symmetry. What is their relationship?",
        "choices": [
          "Constitutional isomers",
          "Enantiomers",
          "Diastereomers",
          "Identical molecules"
        ],
        "answer": 2,
        "hint": "Compare both corresponding centers rather than only one.",
        "explanation": "C2 is the same; C3 differs. With these distinct centers, the pair is stereoisomeric but not mirror-related.",
        "feedback": [
          "Connectivity is explicitly unchanged.",
          "The mirror of (2R,3R) would invert both distinct centers.",
          "Correct: these are diastereomers.",
          "The configuration at C3 differs."
        ],
        "sourceUrls": [
          "https://openstax.org/books/organic-chemistry/pages/5-9-a-review-of-isomerism",
          "https://openstax.org/books/organic-chemistry/pages/5-5-sequence-rules-for-specifying-configuration"
        ],
        "canonId": "oc-stereochemistry",
        "sourceId": "continuation-oc-isomer-relationships-p3",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "continuation-oc-isomer-relationships-c1",
        "objectiveId": "oc-isomer-relationships",
        "world": "oc",
        "pool": "check",
        "familyId": "oc-isomer-fixed-configuration",
        "familyRationale": "A rigid viewing rotation preserves configuration; it is not novelty.",
        "prompt": "A model of a molecule with one stereocenter is rotated as a rigid object. No bonds are changed and no reflection is performed. Compared with the original model, the rotated model is:",
        "choices": [
          "Constitutional isomers",
          "Enantiomers",
          "Diastereomers",
          "Identical molecules"
        ],
        "answer": 3,
        "hint": "Separate a changed view from an exchanged ligand arrangement.",
        "explanation": "A rigid rotation preserves every atom-to-atom relationship and the configuration. The molecule remains identical.",
        "feedback": [
          "No connectivity changed.",
          "Rotation does not turn one enantiomer into the other.",
          "No configuration changed.",
          "Correct: only the viewing orientation differs."
        ],
        "sourceUrls": [
          "https://openstax.org/books/organic-chemistry/pages/5-9-a-review-of-isomerism",
          "https://openstax.org/books/organic-chemistry/pages/5-5-sequence-rules-for-specifying-configuration"
        ],
        "canonId": "oc-stereochemistry",
        "sourceId": "continuation-oc-isomer-relationships-c1",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "continuation-oc-isomer-relationships-c2",
        "objectiveId": "oc-isomer-relationships",
        "world": "oc",
        "pool": "check",
        "familyId": "oc-isomer-connectivity",
        "familyRationale": "Different functional connectivity is still the ordinary connectivity family.",
        "prompt": "CH3CH2CH2CH2OH and CH3CH2OCH2CH3 both have formula C4H10O. Which relationship follows directly from their written bonds?",
        "choices": [
          "Constitutional isomers",
          "Enantiomers",
          "Diastereomers",
          "Identical molecules"
        ],
        "answer": 0,
        "hint": "Compare the atoms bonded directly to oxygen.",
        "explanation": "O bonds to C and H in the alcohol, but to two C atoms in the ether. They are constitutional isomers.",
        "feedback": [
          "Correct: same formula, different connectivity.",
          "A mirror reflection cannot replace an O–H bond with an O–C bond.",
          "Diastereomers require the same connectivity.",
          "The oxygen bonding pattern differs."
        ],
        "sourceUrls": [
          "https://openstax.org/books/organic-chemistry/pages/5-9-a-review-of-isomerism",
          "https://openstax.org/books/organic-chemistry/pages/5-5-sequence-rules-for-specifying-configuration"
        ],
        "canonId": "oc-stereochemistry",
        "sourceId": "continuation-oc-isomer-relationships-c2",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "continuation-oc-isomer-relationships-c3",
        "objectiveId": "oc-isomer-relationships",
        "world": "oc",
        "pool": "check",
        "familyId": "oc-isomer-fixed-configuration",
        "familyRationale": "Classify all-center inversion for the explicitly nonsymmetric molecule; do not generalize past symmetry.",
        "prompt": "Compare (2R,3S)- and (2S,3R)-2-bromo-3-chloropentane. The molecule has two distinct stereocenters, no internal symmetry and unchanged connectivity. What is their relationship?",
        "choices": [
          "Constitutional isomers",
          "Enantiomers",
          "Diastereomers",
          "Identical molecules"
        ],
        "answer": 1,
        "hint": "A mirror operation reverses both corresponding stereocenters here.",
        "explanation": "Both centers are opposite. Because this molecule lacks internal symmetry, the mirror configurations are nonidentical: enantiomers.",
        "feedback": [
          "The bonds between atoms have not changed.",
          "Correct under the stated nonsymmetry condition.",
          "These two configurations are mirror-related.",
          "The explicit lack of internal symmetry excludes identity of this mirror pair."
        ],
        "sourceUrls": [
          "https://openstax.org/books/organic-chemistry/pages/5-9-a-review-of-isomerism",
          "https://openstax.org/books/organic-chemistry/pages/5-5-sequence-rules-for-specifying-configuration"
        ],
        "canonId": "oc-stereochemistry",
        "sourceId": "continuation-oc-isomer-relationships-c3",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "continuation-oc-isomer-relationships-l1",
        "objectiveId": "oc-isomer-relationships",
        "world": "oc",
        "pool": "later",
        "familyId": "oc-isomer-sequential-configuration-audit",
        "familyRationale": "Reserved transfer: propagate site-specific operations before classifying endpoints, instead of classifying already supplied final labels.",
        "prompt": "A configuration ledger begins with (2R,3R)-2-bromo-3-chloropentane. Operation 1 inverts C2 only; operation 2 inverts C3 only. These stipulated operations preserve connectivity and CIP priority order, and the molecule has no internal symmetry. Relative to the initial molecule, the final molecule is:",
        "choices": [
          "Constitutional isomers",
          "Enantiomers",
          "Diastereomers",
          "Identical molecules"
        ],
        "answer": 1,
        "hint": "Update each center independently through both ledger operations.",
        "explanation": "The labels progress (R,R) → (S,R) → (S,S). Both distinct centers are inverted overall, giving the nonidentical mirror image.",
        "feedback": [
          "Connectivity is preserved by both stipulated operations.",
          "Correct: both final centers are opposite to their initial labels.",
          "Stopping after operation 1 would give diastereomers; the second operation changes the endpoint.",
          "Two inversions at different centers do not cancel at either center."
        ],
        "sourceUrls": [
          "https://openstax.org/books/organic-chemistry/pages/5-9-a-review-of-isomerism",
          "https://openstax.org/books/organic-chemistry/pages/5-5-sequence-rules-for-specifying-configuration"
        ],
        "canonId": "oc-stereochemistry",
        "sourceId": "continuation-oc-isomer-relationships-l1",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "continuation-oc-isomer-relationships-l2",
        "objectiveId": "oc-isomer-relationships",
        "world": "oc",
        "pool": "later",
        "familyId": "oc-isomer-sequential-configuration-audit",
        "familyRationale": "Same reserved multi-operation endpoint audit; repeated operations must be tracked at the correct site.",
        "prompt": "A configuration ledger starts with (2R,3S)-2-bromo-3-chloropentane. It applies inversion at C2, then inversion at C3, then inversion at C2 again. Connectivity and CIP priorities are unchanged; the molecule has no internal symmetry. What is the relationship between initial and final molecules?",
        "choices": [
          "Constitutional isomers",
          "Enantiomers",
          "Diastereomers",
          "Identical molecules"
        ],
        "answer": 2,
        "hint": "Two inversions at the same center restore its starting configuration.",
        "explanation": "The sequence is (R,S) → (S,S) → (S,R) → (R,R). C2 returns to R and C3 changes to R. Only one of two distinct centers differs overall, so the pair is diastereomeric.",
        "feedback": [
          "None of the operations changes connectivity.",
          "The final C2 matches the initial C2, so this is not its mirror partner.",
          "Correct: only C3 differs overall.",
          "The two C2 inversions cancel, but the single C3 inversion remains."
        ],
        "sourceUrls": [
          "https://openstax.org/books/organic-chemistry/pages/5-9-a-review-of-isomerism",
          "https://openstax.org/books/organic-chemistry/pages/5-5-sequence-rules-for-specifying-configuration"
        ],
        "canonId": "oc-stereochemistry",
        "sourceId": "continuation-oc-isomer-relationships-l2",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "continuation-oc-cip-configuration-p1",
        "objectiveId": "oc-cip-configuration",
        "world": "oc",
        "pool": "practice",
        "familyId": "oc-cip-direct-atomic-priority",
        "familyRationale": "Rank directly attached different elements by atomic number.",
        "prompt": "A stereocenter is bonded directly to Br, Cl, F and H. Which is the correct priority order from highest to lowest?",
        "choices": [
          "Br > Cl > F > H",
          "Cl > Br > F > H",
          "H > F > Cl > Br",
          "F > Cl > Br > H"
        ],
        "answer": 0,
        "hint": "Compare proton numbers at the first attached atom.",
        "explanation": "The atomic numbers are Br 35, Cl 17, F 9 and H 1. The descending order determines priority.",
        "feedback": [
          "Correct: atomic number decreases in this order.",
          "Br has a greater atomic number than Cl.",
          "This reverses all priorities.",
          "Electronegativity is not the ranking rule."
        ],
        "sourceUrls": [
          "https://openstax.org/books/organic-chemistry/pages/5-5-sequence-rules-for-specifying-configuration"
        ],
        "canonId": "oc-stereochemistry",
        "sourceId": "continuation-oc-cip-configuration-p1",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "continuation-oc-cip-configuration-p2",
        "objectiveId": "oc-cip-configuration",
        "world": "oc",
        "pool": "practice",
        "familyId": "oc-cip-neighbor-priority",
        "familyRationale": "Break a carbon-versus-carbon tie by the first differing sorted neighbor list.",
        "prompt": "At a stereocenter bearing OH, CH2CH3, CH3 and H, which statement correctly resolves the priority tie between the two carbon ligands?",
        "choices": [
          "CH3 wins because it has three hydrogens.",
          "CH2CH3 wins because (C,H,H) outranks (H,H,H).",
          "The ligands must remain tied because both begin with C.",
          "Their priority depends on the drawn bond length."
        ],
        "answer": 1,
        "hint": "Ignore the shared parent stereocenter when listing outward neighbors.",
        "explanation": "The directly attached carbons tie. The ethyl carbon is attached outward to C,H,H; the methyl carbon to H,H,H. The first comparison is C versus H, so ethyl wins.",
        "feedback": [
          "Hydrogen count is not the criterion.",
          "Correct: the first differing neighbor is carbon versus hydrogen.",
          "A first-atom tie requires continuing outward.",
          "Drawing length does not change atomic identity."
        ],
        "sourceUrls": [
          "https://openstax.org/books/organic-chemistry/pages/5-5-sequence-rules-for-specifying-configuration"
        ],
        "canonId": "oc-stereochemistry",
        "sourceId": "continuation-oc-cip-configuration-p2",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "continuation-oc-cip-configuration-p3",
        "objectiveId": "oc-cip-configuration",
        "world": "oc",
        "pool": "practice",
        "familyId": "oc-cip-wedge-configuration",
        "familyRationale": "Assign a single configuration from an explicit schematic wedge/dash view.",
        "prompt": "At the illustrated carbon, Br is upper left on a plain bond; Cl is upper right on a plain bond; F is lower left on a solid wedge toward you; H is lower right on a hashed wedge away. What is its configuration?",
        "choices": [
          "S",
          "R",
          "Achiral because it contains H",
          "Cannot assign even with the stated depth"
        ],
        "answer": 1,
        "hint": "Rank the atoms, trace 1→2→3, and locate the lowest-priority group.",
        "explanation": "Br > Cl > F > H. The page trace upper left → upper right → lower left is clockwise. H is away, so the configuration is R.",
        "feedback": [
          "This would reverse a trace that should be read directly.",
          "Correct: clockwise with priority 4 away is R.",
          "Hydrogen can be one of four distinct ligands.",
          "All four ligand identities and their depth are given."
        ],
        "sourceUrls": [
          "https://openstax.org/books/organic-chemistry/pages/5-5-sequence-rules-for-specifying-configuration"
        ],
        "canonId": "oc-stereochemistry",
        "visualCap": "Plain bonds lie in the page. Solid wedge points toward you; hashed wedge points away. No priority numbers or answer labels are printed.",
        "fig": "data/figures/chapters/oc-stereo-halogen-practice.40006f474d5cb711.svg",
        "figureAlt": "Plain bonds lie in the page. Solid wedge points toward you; hashed wedge points away. No priority numbers or answer labels are printed.",
        "sourceId": "continuation-oc-cip-configuration-p3",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "continuation-oc-cip-configuration-c1",
        "objectiveId": "oc-cip-configuration",
        "world": "oc",
        "pool": "check",
        "familyId": "oc-cip-direct-atomic-priority",
        "familyRationale": "Directly attached element ranking remains the ordinary priority family.",
        "prompt": "A tetrahedral stereocenter has ligands SH, NH2, CH3 and H. Which attached atom receives highest CIP priority?",
        "choices": [
          "N in NH2",
          "C in CH3",
          "S in SH",
          "H"
        ],
        "answer": 2,
        "hint": "Compare the atoms immediately attached to the stereocenter.",
        "explanation": "The attached atoms have atomic numbers S 16, N 7, C 6 and H 1. S receives highest priority.",
        "feedback": [
          "Nitrogen is below sulfur in atomic number.",
          "Whole-group atom counts do not outrank directly attached sulfur.",
          "Correct: S has the largest attached-atom atomic number.",
          "H has the lowest atomic number here."
        ],
        "sourceUrls": [
          "https://openstax.org/books/organic-chemistry/pages/5-5-sequence-rules-for-specifying-configuration"
        ],
        "canonId": "oc-stereochemistry",
        "sourceId": "continuation-oc-cip-configuration-c1",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "continuation-oc-cip-configuration-c2",
        "objectiveId": "oc-cip-configuration",
        "world": "oc",
        "pool": "check",
        "familyId": "oc-cip-wedge-configuration",
        "familyRationale": "The same single-center assignment family now places the lowest priority toward the observer.",
        "prompt": "At the drawn carbon, OH is upper left on a plain bond, CH2CH3 upper right on a plain bond, H lower left on a solid wedge toward you, and CH3 lower right on a hashed wedge away. Assign R/S.",
        "choices": [
          "R",
          "S",
          "Achiral because two ligands begin with carbon",
          "R/S is the same as the sign of optical rotation"
        ],
        "answer": 1,
        "hint": "First resolve ethyl versus methyl, then account for the position of H.",
        "explanation": "OH > CH2CH3 > CH3 > H. The page trace upper left → upper right → lower right is clockwise, but H points toward you. Reverse the apparent result to obtain S.",
        "feedback": [
          "This ignores the toward-pointing lowest-priority group.",
          "Correct: the front-facing H reverses the clockwise trace.",
          "Ethyl and methyl differ at the next attached atoms.",
          "Optical-rotation sign cannot be inferred from R/S alone."
        ],
        "sourceUrls": [
          "https://openstax.org/books/organic-chemistry/pages/5-5-sequence-rules-for-specifying-configuration"
        ],
        "canonId": "oc-stereochemistry",
        "visualCap": "Plain bonds lie in the page. Solid wedge points toward you; hashed wedge points away. No priority numbers or answer labels are printed.",
        "fig": "data/figures/chapters/oc-stereo-alcohol-check.a4d7cbe015b46b3e.svg",
        "figureAlt": "Plain bonds lie in the page. Solid wedge points toward you; hashed wedge points away. No priority numbers or answer labels are printed.",
        "sourceId": "continuation-oc-cip-configuration-c2",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "continuation-oc-cip-configuration-c3",
        "objectiveId": "oc-cip-configuration",
        "world": "oc",
        "pool": "check",
        "familyId": "oc-cip-wedge-configuration",
        "familyRationale": "A reordered direct-atom assignment is the same configuration family, not transfer novelty.",
        "prompt": "At the drawn carbon, Br is upper left on a plain bond, I upper right on a plain bond, Cl lower left on a solid wedge toward you, and H lower right on a hashed wedge away. What is the configuration?",
        "choices": [
          "R",
          "Achiral because three ligands are halogens",
          "Cannot assign unless optical rotation is measured",
          "S"
        ],
        "answer": 3,
        "hint": "I outranks Br, and Br outranks Cl; H is lowest.",
        "explanation": "The priority trace is upper right (I) → upper left (Br) → lower left (Cl), which is counterclockwise. Priority 4 is away, so this is S.",
        "feedback": [
          "This reverses a counterclockwise trace with group 4 away.",
          "Different halogens are different ligands.",
          "The given geometry determines R/S without optical-rotation data.",
          "Correct: counterclockwise with priority 4 away is S."
        ],
        "sourceUrls": [
          "https://openstax.org/books/organic-chemistry/pages/5-5-sequence-rules-for-specifying-configuration"
        ],
        "canonId": "oc-stereochemistry",
        "visualCap": "Plain bonds lie in the page. Solid wedge points toward you; hashed wedge points away. No priority numbers or answer labels are printed.",
        "fig": "data/figures/chapters/oc-stereo-iodine-check.d0269bfeb00d8e3e.svg",
        "figureAlt": "Plain bonds lie in the page. Solid wedge points toward you; hashed wedge points away. No priority numbers or answer labels are printed.",
        "sourceId": "continuation-oc-cip-configuration-c3",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "continuation-oc-cip-configuration-l1",
        "objectiveId": "oc-cip-configuration",
        "world": "oc",
        "pool": "later",
        "familyId": "oc-cip-isotope-configuration",
        "familyRationale": "Reserved transfer: combine isotope mass-number ranking with depth-aware assignment; the rule is stated in the guide but no isotope configuration is worked or rehearsed.",
        "prompt": "The drawn carbon bears CH3 at upper left on a plain bond, tritium (³H) at upper right on a plain bond, deuterium (²H) at lower left on a solid wedge toward you, and protium (¹H) at lower right on a hashed wedge away. Assign its configuration.",
        "choices": [
          "Achiral because three ligands are hydrogen isotopes",
          "S",
          "R",
          "Cannot assign without actual isotope masses"
        ],
        "answer": 2,
        "hint": "Different isotopes can distinguish ligands. Compare atomic number first, then isotope mass number for the same element.",
        "explanation": "C in CH3 outranks all hydrogen isotopes. Among those isotopes, ³H > ²H > ¹H. The trace 1→2→3 is clockwise with ¹H away, giving R.",
        "feedback": [
          "The three isotopes have different mass numbers and CIP priorities.",
          "Priority 4 is away, so the clockwise trace is not reversed.",
          "Correct: all four ligands are distinct under isotope-aware priority.",
          "The mass-number ordering is enough for these isotopes."
        ],
        "sourceUrls": [
          "https://openstax.org/books/organic-chemistry/pages/5-5-sequence-rules-for-specifying-configuration"
        ],
        "canonId": "oc-stereochemistry",
        "visualCap": "Plain bonds lie in the page. Solid wedge points toward you; hashed wedge points away. No priority numbers or answer labels are printed.",
        "fig": "data/figures/chapters/oc-stereo-isotope-later-a.d9db491f70922a77.svg",
        "figureAlt": "Plain bonds lie in the page. Solid wedge points toward you; hashed wedge points away. No priority numbers or answer labels are printed.",
        "sourceId": "continuation-oc-cip-configuration-l1",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "continuation-oc-cip-configuration-l2",
        "objectiveId": "oc-cip-configuration",
        "world": "oc",
        "pool": "later",
        "familyId": "oc-cip-isotope-configuration",
        "familyRationale": "Same reserved isotope/depth transfer family, with the lowest isotope toward the observer.",
        "prompt": "At the illustrated carbon, Cl is upper left on a plain bond, OH upper right on a plain bond, protium (¹H) lower left on a solid wedge toward you, and deuterium (²H) lower right on a hashed wedge away. What is its configuration?",
        "choices": [
          "S",
          "R",
          "Achiral because ¹H and ²H are the same ligand",
          "The largest group by total mass must be priority 1"
        ],
        "answer": 0,
        "hint": "Cl and O differ in atomic number; compare the two hydrogen ligands by mass number.",
        "explanation": "The order is Cl > O of OH > ²H > ¹H. The page trace is clockwise, but lowest-priority ¹H points toward you. Reverse to S.",
        "feedback": [
          "Correct: isotope priority and the front-facing lowest group both matter.",
          "This neglects the orientation of ¹H.",
          "The isotope mass numbers distinguish these ligands.",
          "CIP compares attached atoms, with isotope mass used only for the same element."
        ],
        "sourceUrls": [
          "https://openstax.org/books/organic-chemistry/pages/5-5-sequence-rules-for-specifying-configuration"
        ],
        "canonId": "oc-stereochemistry",
        "visualCap": "Plain bonds lie in the page. Solid wedge points toward you; hashed wedge points away. No priority numbers or answer labels are printed.",
        "fig": "data/figures/chapters/oc-stereo-isotope-later-b.38c02a3c6f027f77.svg",
        "figureAlt": "Plain bonds lie in the page. Solid wedge points toward you; hashed wedge points away. No priority numbers or answer labels are printed.",
        "sourceId": "continuation-oc-cip-configuration-l2",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      }
    ],
    "contentSha256": "e5a800540cf5ef4f904fbebf4ccfc3cfee0331e8d78bf21bc2d46494e2413e98",
    "reviewStatus": "internal-reviewed",
    "verified": true,
    "progressEligible": true,
    "runtimeIntegrated": true,
    "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
  },
  {
    "id": "pat-cube-census",
    "world": "pat",
    "title": "The Cube Census",
    "scope": "Introductory supported-column cube counting with explicit height-plan aids: local painted-face classification and systematic whole-assembly tally. Later-only paint-history transfers are labeled extensions. Complex drawing-only reconstruction, timed PAT performance and full cube-counting readiness remain unestablished.",
    "objectiveIds": [
      "pat-cube-painted-faces",
      "pat-cube-inventory"
    ],
    "metadata": {
      "course": "PAT",
      "session": 3,
      "creature": "cubora",
      "stationName": "Cube Census Vault",
      "pathVariant": 2,
      "chapterTheme": "pat",
      "creatureDescriptor": {
        "id": "cubora",
        "name": "Cubora",
        "type": "sight",
        "color": "#b4a4db",
        "bodyPlan": "stacked-cube-owl",
        "concept": "Cube contacts, support inventory and exposed-face tallies",
        "evolutions": [
          "Cubora",
          "Cuboriel",
          "Cuboracle"
        ],
        "rareName": "Prismatic Cuboracle",
        "blurb": "A geometric owl sorts the vault’s missing blocks with six careful glances, one for every cube face."
      },
      "topicMappings": {
        "screenshotTopicIds": [],
        "officialOnlyTopicIds": [
          "pat-cube-counting"
        ]
      },
      "instructionFamilyIds": [
        "pat-cube-local-neighbor-contacts",
        "pat-cube-static-class-tally",
        "discovery-pat-cube-systematic-sweep"
      ]
    },
    "canon": {
      "id": "pat-cube-counting",
      "version": "0.2.1",
      "sourceRelativePath": "visuals/sheets/pat/pat-cube-counting.json",
      "sourceSha256": "eaa8b0e1989048ca7f0acd65b607ae627fe4474946e56e8536128a7d833567b0",
      "sourceRepository": "ace-system",
      "inspectedExportSha256": "53c2a6951e84c369d1e075d6c64e4672ea60bd35f29d01865d940019d02a391e",
      "adaptationVersion": 1,
      "importsSourceAssessments": false,
      "formativeCanonChecksProgressEligible": false
    },
    "objectives": [
      {
        "id": "pat-cube-painted-faces",
        "world": "pat",
        "name": "Classify a cube’s exposed and contacting faces",
        "lesson": "Imagine equal cubes cemented together before painting. A cube has six faces. A face touching another cube is unpainted; a face touching the supporting floor is also unpainted. Every remaining exposed face is painted. Check left, right, front, back, above and below. Count required support cubes even when the drawing hides them. In these introductory assemblies every vertical column starts at the floor and contains no gaps, so every raised cube has a support directly below it.",
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
        "id": "pat-cube-inventory",
        "world": "pat",
        "name": "Build and audit a full painted-face tally",
        "lesson": "Sweep one column from bottom to top, then move consistently through the remaining columns. Put each cube in exactly one tally category: zero, one, two, three, four or five painted faces for these supported assemblies. The sum of the categories must equal the total number of cubes. This total checks inventory completeness, but a cube placed in the wrong category can still leave the sum unchanged. An exposed-face question asks for the number of cubes in the requested category, not the number of painted faces on the whole assembly.",
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
      "pat-cube-painted-faces": {
        "objectiveId": "pat-cube-painted-faces",
        "version": 1,
        "core": "Imagine equal cubes cemented together before painting. A cube has six faces. A face touching another cube is unpainted; a face touching the supporting floor is also unpainted. Every remaining exposed face is painted. Check left, right, front, back, above and below. Count required support cubes even when the drawing hides them. In these introductory assemblies every vertical column starts at the floor and contains no gaps, so every raised cube has a support directly below it.",
        "terms": [
          {
            "term": "Contact face",
            "meaning": "A face covered by another cube or the supporting floor when painting occurs."
          },
          {
            "term": "Exposed face",
            "meaning": "A face open to the surrounding space when painting occurs."
          },
          {
            "term": "Required support",
            "meaning": "A cube needed to hold up a declared higher cube; it belongs in the inventory."
          }
        ],
        "assumptions": [
          "Equal unit cubes are assembled first, then all exposed surfaces are painted except the floor contact.",
          "Column heights are supplied as an introductory teaching aid; zero means an empty footprint.",
          "No gaps, overhangs or extra hidden columns. A level is counted upward from the floor, starting at one."
        ],
        "workedExample": {
          "prompt": "Two cubes stand side by side on the floor. How many painted faces does either cube have?",
          "steps": [
            "Each cube starts with six faces.",
            "One face touches the other cube; its bottom face touches the floor.",
            "The remaining four faces are exposed and painted."
          ],
          "answer": "Four painted faces on each cube.",
          "familyId": "pat-cube-local-neighbor-contacts",
          "role": "instruction-only"
        },
        "commonMistake": "Visible in the drawing is not the same as exposed to paint. An exposed back face can be painted even when the camera cannot see it.",
        "nextAction": "Identify the exact cube and check all six directions before counting.",
        "sourceUrls": [
          "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/perceptual_ability_test_section_instructions.pdf"
        ],
        "canon": {
          "id": "pat-cube-counting",
          "version": "0.2.1",
          "sourceRelativePath": "visuals/sheets/pat/pat-cube-counting.json",
          "sourceSha256": "eaa8b0e1989048ca7f0acd65b607ae627fe4474946e56e8536128a7d833567b0",
          "sourceRepository": "ace-system",
          "inspectedExportSha256": "53c2a6951e84c369d1e075d6c64e4672ea60bd35f29d01865d940019d02a391e",
          "adaptationVersion": 1,
          "importsSourceAssessments": false,
          "formativeCanonChecksProgressEligible": false,
          "reviewScope": "Bounded support-cube inventory and contact-face method; original figures. Full drawing-only PAT readiness not established."
        },
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      "pat-cube-inventory": {
        "objectiveId": "pat-cube-inventory",
        "version": 1,
        "core": "Sweep one column from bottom to top, then move consistently through the remaining columns. Put each cube in exactly one tally category: zero, one, two, three, four or five painted faces for these supported assemblies. The sum of the categories must equal the total number of cubes. This total checks inventory completeness, but a cube placed in the wrong category can still leave the sum unchanged. An exposed-face question asks for the number of cubes in the requested category, not the number of painted faces on the whole assembly.",
        "terms": [
          {
            "term": "Tally category",
            "meaning": "The group of cubes with the same number of painted faces."
          },
          {
            "term": "Inventory total",
            "meaning": "All unit cubes, including hidden supports, counted once each."
          },
          {
            "term": "Column sweep",
            "meaning": "Finish each vertical stack before moving to the next footprint."
          }
        ],
        "assumptions": [
          "Equal unit cubes are assembled first, then all exposed surfaces are painted except the floor contact.",
          "Column heights are supplied as an introductory teaching aid; zero means an empty footprint.",
          "No gaps, overhangs or extra hidden columns. A level is counted upward from the floor, starting at one."
        ],
        "workedExample": {
          "prompt": "Four cubes form a single-layer 2-by-2 square on the floor. Build its painted-face tally.",
          "steps": [
            "There are four columns of height one, hence four cubes.",
            "Each cube has two neighboring cubes and a floor contact: six minus three equals three painted faces.",
            "The three-face category contains four cubes; all other categories contain zero."
          ],
          "answer": "Four cubes have three painted faces. The tally sum is four.",
          "familyId": "pat-cube-static-class-tally",
          "role": "instruction-only"
        },
        "commonMistake": "A matching tally sum does not prove the classifications: moving a cube into the wrong category preserves the total.",
        "nextAction": "Sweep every column once, then compare the tally sum with the sum of the column heights.",
        "sourceUrls": [
          "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/perceptual_ability_test_section_instructions.pdf"
        ],
        "canon": {
          "id": "pat-cube-counting",
          "version": "0.2.1",
          "sourceRelativePath": "visuals/sheets/pat/pat-cube-counting.json",
          "sourceSha256": "eaa8b0e1989048ca7f0acd65b607ae627fe4474946e56e8536128a7d833567b0",
          "sourceRepository": "ace-system",
          "inspectedExportSha256": "53c2a6951e84c369d1e075d6c64e4672ea60bd35f29d01865d940019d02a391e",
          "adaptationVersion": 1,
          "importsSourceAssessments": false,
          "formativeCanonChecksProgressEligible": false,
          "reviewScope": "Bounded support-cube inventory and contact-face method; original figures. Full drawing-only PAT readiness not established."
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
        "id": "continuation-pat-cube-painted-faces-p1",
        "objectiveId": "pat-cube-painted-faces",
        "world": "pat",
        "pool": "practice",
        "familyId": "pat-cube-local-neighbor-contacts",
        "familyRationale": "Direct contact classification or systematic tally on a supported assembly. New numeric heights and rotations do not create a new task family.",
        "prompt": "The figure and column-height plan show the complete assembly before painting. Cubes are assembled first; all exposed surfaces are painted except the floor contact. How many faces are painted on the target cube in column A, level 2 from the floor?",
        "choices": [
          "1",
          "2",
          "3",
          "4",
          "5"
        ],
        "answer": 4,
        "hint": "Check all six directions, including the floor and cubes behind the visible faces.",
        "explanation": "The upper cube has one contact below and five exposed faces. Its underside touches a cube, not the floor; that contact is still unpainted.",
        "feedback": [
          "1 is too low. Distinguish the cube’s exposed faces from cube contacts and the floor contact.",
          "2 is too low. Distinguish the cube’s exposed faces from cube contacts and the floor contact.",
          "3 is too low. Distinguish the cube’s exposed faces from cube contacts and the floor contact.",
          "4 is too low. Distinguish the cube’s exposed faces from cube contacts and the floor contact.",
          "Correct. The upper cube has one contact below and five exposed faces. Its underside touches a cube, not the floor; that contact is still unpainted."
        ],
        "sourceUrls": [
          "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/perceptual_ability_test_section_instructions.pdf"
        ],
        "canonId": "pat-cube-counting",
        "visualCap": "Original supported assembly with a matching column-height plan. Target cube: column A, level 2 from the floor. Heights specify the givens, not the answer.",
        "fig": "data/figures/chapters/pat-cube-local-p1.5eb53f20da16ed92.svg",
        "figureAlt": "Original supported assembly with a matching column-height plan. Target cube: column A, level 2 from the floor. Heights specify the givens, not the answer.",
        "sourceId": "continuation-pat-cube-painted-faces-p1",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "continuation-pat-cube-painted-faces-p2",
        "objectiveId": "pat-cube-painted-faces",
        "world": "pat",
        "pool": "practice",
        "familyId": "pat-cube-local-neighbor-contacts",
        "familyRationale": "Direct contact classification or systematic tally on a supported assembly. New numeric heights and rotations do not create a new task family.",
        "prompt": "The figure and column-height plan show the complete assembly before painting. Cubes are assembled first; all exposed surfaces are painted except the floor contact. How many faces are painted on the target cube in column A, level 1 from the floor?",
        "choices": [
          "1",
          "2",
          "3",
          "4",
          "5"
        ],
        "answer": 2,
        "hint": "Check all six directions, including the floor and cubes behind the visible faces.",
        "explanation": "The target cube touches the floor, the cube above, and column B. Three faces remain exposed.",
        "feedback": [
          "1 is too low. Distinguish the cube’s exposed faces from cube contacts and the floor contact.",
          "2 is too low. Distinguish the cube’s exposed faces from cube contacts and the floor contact.",
          "Correct. The target cube touches the floor, the cube above, and column B. Three faces remain exposed.",
          "4 is too high. Distinguish the cube’s exposed faces from cube contacts and the floor contact.",
          "5 is too high. Distinguish the cube’s exposed faces from cube contacts and the floor contact."
        ],
        "sourceUrls": [
          "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/perceptual_ability_test_section_instructions.pdf"
        ],
        "canonId": "pat-cube-counting",
        "visualCap": "Original supported assembly with a matching column-height plan. Target cube: column A, level 1 from the floor. Heights specify the givens, not the answer.",
        "fig": "data/figures/chapters/pat-cube-local-p2.98a6a5d6068e6434.svg",
        "figureAlt": "Original supported assembly with a matching column-height plan. Target cube: column A, level 1 from the floor. Heights specify the givens, not the answer.",
        "sourceId": "continuation-pat-cube-painted-faces-p2",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "continuation-pat-cube-painted-faces-p3",
        "objectiveId": "pat-cube-painted-faces",
        "world": "pat",
        "pool": "practice",
        "familyId": "pat-cube-local-neighbor-contacts",
        "familyRationale": "Direct contact classification or systematic tally on a supported assembly. New numeric heights and rotations do not create a new task family.",
        "prompt": "The figure and column-height plan show the complete assembly before painting. Cubes are assembled first; all exposed surfaces are painted except the floor contact. How many faces are painted on the target cube in column A, level 1 from the floor?",
        "choices": [
          "1",
          "2",
          "3",
          "4",
          "5"
        ],
        "answer": 1,
        "hint": "Check all six directions, including the floor and cubes behind the visible faces.",
        "explanation": "The target cube touches the floor, the cube above, column B and column F. Four covered faces leave two painted faces.",
        "feedback": [
          "1 is too low. Distinguish the cube’s exposed faces from cube contacts and the floor contact.",
          "Correct. The target cube touches the floor, the cube above, column B and column F. Four covered faces leave two painted faces.",
          "3 is too high. Distinguish the cube’s exposed faces from cube contacts and the floor contact.",
          "4 is too high. Distinguish the cube’s exposed faces from cube contacts and the floor contact.",
          "5 is too high. Distinguish the cube’s exposed faces from cube contacts and the floor contact."
        ],
        "sourceUrls": [
          "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/perceptual_ability_test_section_instructions.pdf"
        ],
        "canonId": "pat-cube-counting",
        "visualCap": "Original supported assembly with a matching column-height plan. Target cube: column A, level 1 from the floor. Heights specify the givens, not the answer.",
        "fig": "data/figures/chapters/pat-cube-local-p3.fff5d7041588af6d.svg",
        "figureAlt": "Original supported assembly with a matching column-height plan. Target cube: column A, level 1 from the floor. Heights specify the givens, not the answer.",
        "sourceId": "continuation-pat-cube-painted-faces-p3",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "continuation-pat-cube-painted-faces-c1",
        "objectiveId": "pat-cube-painted-faces",
        "world": "pat",
        "pool": "check",
        "familyId": "pat-cube-local-neighbor-contacts",
        "familyRationale": "Direct contact classification or systematic tally on a supported assembly. New numeric heights and rotations do not create a new task family.",
        "prompt": "The figure and column-height plan show the complete assembly before painting. Cubes are assembled first; all exposed surfaces are painted except the floor contact. How many faces are painted on the target cube in column A, level 2 from the floor?",
        "choices": [
          "1",
          "2",
          "3",
          "4",
          "5"
        ],
        "answer": 3,
        "hint": "Check all six directions, including the floor and cubes behind the visible faces.",
        "explanation": "At column A level two, there is a cube below and a same-level neighbor in B. There is no cube above A. Two contact faces leave four painted faces.",
        "feedback": [
          "1 is too low. Distinguish the cube’s exposed faces from cube contacts and the floor contact.",
          "2 is too low. Distinguish the cube’s exposed faces from cube contacts and the floor contact.",
          "3 is too low. Distinguish the cube’s exposed faces from cube contacts and the floor contact.",
          "Correct. At column A level two, there is a cube below and a same-level neighbor in B. There is no cube above A. Two contact faces leave four painted faces.",
          "5 is too high. Distinguish the cube’s exposed faces from cube contacts and the floor contact."
        ],
        "sourceUrls": [
          "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/perceptual_ability_test_section_instructions.pdf"
        ],
        "canonId": "pat-cube-counting",
        "visualCap": "Original supported assembly with a matching column-height plan. Target cube: column A, level 2 from the floor. Heights specify the givens, not the answer.",
        "fig": "data/figures/chapters/pat-cube-local-c1.ddf0c27d0a9c5c2d.svg",
        "figureAlt": "Original supported assembly with a matching column-height plan. Target cube: column A, level 2 from the floor. Heights specify the givens, not the answer.",
        "sourceId": "continuation-pat-cube-painted-faces-c1",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "continuation-pat-cube-painted-faces-c2",
        "objectiveId": "pat-cube-painted-faces",
        "world": "pat",
        "pool": "check",
        "familyId": "pat-cube-local-neighbor-contacts",
        "familyRationale": "Direct contact classification or systematic tally on a supported assembly. New numeric heights and rotations do not create a new task family.",
        "prompt": "The figure and column-height plan show the complete assembly before painting. Cubes are assembled first; all exposed surfaces are painted except the floor contact. How many faces are painted on the target cube in column B, level 2 from the floor?",
        "choices": [
          "1",
          "2",
          "3",
          "4",
          "5"
        ],
        "answer": 3,
        "hint": "Check all six directions, including the floor and cubes behind the visible faces.",
        "explanation": "The middle cube in B touches cubes immediately above and below. The surrounding columns are only one cube tall, so all four side faces at level two are exposed.",
        "feedback": [
          "1 is too low. Distinguish the cube’s exposed faces from cube contacts and the floor contact.",
          "2 is too low. Distinguish the cube’s exposed faces from cube contacts and the floor contact.",
          "3 is too low. Distinguish the cube’s exposed faces from cube contacts and the floor contact.",
          "Correct. The middle cube in B touches cubes immediately above and below. The surrounding columns are only one cube tall, so all four side faces at level two are exposed.",
          "5 is too high. Distinguish the cube’s exposed faces from cube contacts and the floor contact."
        ],
        "sourceUrls": [
          "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/perceptual_ability_test_section_instructions.pdf"
        ],
        "canonId": "pat-cube-counting",
        "visualCap": "Original supported assembly with a matching column-height plan. Target cube: column B, level 2 from the floor. Heights specify the givens, not the answer.",
        "fig": "data/figures/chapters/pat-cube-local-c2.8514ed6f2a53c62e.svg",
        "figureAlt": "Original supported assembly with a matching column-height plan. Target cube: column B, level 2 from the floor. Heights specify the givens, not the answer.",
        "sourceId": "continuation-pat-cube-painted-faces-c2",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "continuation-pat-cube-painted-faces-c3",
        "objectiveId": "pat-cube-painted-faces",
        "world": "pat",
        "pool": "check",
        "familyId": "pat-cube-local-neighbor-contacts",
        "familyRationale": "Direct contact classification or systematic tally on a supported assembly. New numeric heights and rotations do not create a new task family.",
        "prompt": "The figure and column-height plan show the complete assembly before painting. Cubes are assembled first; all exposed surfaces are painted except the floor contact. How many faces are painted on the target cube in column B, level 2 from the floor?",
        "choices": [
          "1",
          "2",
          "3",
          "4",
          "5"
        ],
        "answer": 1,
        "hint": "Check all six directions, including the floor and cubes behind the visible faces.",
        "explanation": "Column B level two touches cubes above and below, A at level two, and G at level two. Its remaining two side faces are painted.",
        "feedback": [
          "1 is too low. Distinguish the cube’s exposed faces from cube contacts and the floor contact.",
          "Correct. Column B level two touches cubes above and below, A at level two, and G at level two. Its remaining two side faces are painted.",
          "3 is too high. Distinguish the cube’s exposed faces from cube contacts and the floor contact.",
          "4 is too high. Distinguish the cube’s exposed faces from cube contacts and the floor contact.",
          "5 is too high. Distinguish the cube’s exposed faces from cube contacts and the floor contact."
        ],
        "sourceUrls": [
          "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/perceptual_ability_test_section_instructions.pdf"
        ],
        "canonId": "pat-cube-counting",
        "visualCap": "Original supported assembly with a matching column-height plan. Target cube: column B, level 2 from the floor. Heights specify the givens, not the answer.",
        "fig": "data/figures/chapters/pat-cube-local-c3.0fb0773caf6cc027.svg",
        "figureAlt": "Original supported assembly with a matching column-height plan. Target cube: column B, level 2 from the floor. Heights specify the givens, not the answer.",
        "sourceId": "continuation-pat-cube-painted-faces-c3",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "continuation-pat-cube-painted-faces-l1",
        "objectiveId": "pat-cube-painted-faces",
        "world": "pat",
        "pool": "later",
        "familyId": "pat-cube-paint-history-local",
        "familyRationale": "Reserved transfer: distinguish a surface’s current exposure from whether it was painted before a neighboring column was removed. Ordinary cases paint only after final assembly.",
        "prompt": "Transfer extension — painting happens before removal. Paint the shown assembly, excluding the bottom on the floor, and let it dry. Remove both cubes in column B without transferring, scraping or adding paint. Cube A stays on the floor. How many of A’s faces have paint now?",
        "choices": [
          "1",
          "2",
          "3",
          "4",
          "5"
        ],
        "answer": 3,
        "hint": "Read when painting occurs. Exposure after that moment does not add paint.",
        "explanation": "When painted, cube A touched the floor and column B, leaving four painted faces. Removing B exposes one previously covered face but supplies no paint, so A still has four painted faces.",
        "feedback": [
          "1 is not the original painted-face count. Rearranging dry cubes adds no paint; newly uncovered surfaces stay bare.",
          "2 is not the original painted-face count. Rearranging dry cubes adds no paint; newly uncovered surfaces stay bare.",
          "3 is not the original painted-face count. Rearranging dry cubes adds no paint; newly uncovered surfaces stay bare.",
          "Correct. When painted, cube A touched the floor and column B, leaving four painted faces. Removing B exposes one previously covered face but supplies no paint, so A still has four painted faces.",
          "5 is not the original painted-face count. Rearranging dry cubes adds no paint; newly uncovered surfaces stay bare."
        ],
        "sourceUrls": [
          "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/perceptual_ability_test_section_instructions.pdf"
        ],
        "canonId": "pat-cube-counting",
        "visualCap": "Original supported assembly with a matching column-height plan. Target cube: column A, level 1 from the floor. Heights specify the givens, not the answer.",
        "fig": "data/figures/chapters/pat-cube-local-l1.7d43157b782652cb.svg",
        "figureAlt": "Original supported assembly with a matching column-height plan. Target cube: column A, level 1 from the floor. Heights specify the givens, not the answer.",
        "sourceId": "continuation-pat-cube-painted-faces-l1",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "continuation-pat-cube-painted-faces-l2",
        "objectiveId": "pat-cube-painted-faces",
        "world": "pat",
        "pool": "later",
        "familyId": "pat-cube-paint-history-local",
        "familyRationale": "Same reserved paint-history transfer family; another geometry is not an additional novelty claim.",
        "prompt": "Transfer extension — preserve the history of painting. Paint the shown assembly except the floor contact, let it dry, then separate every cube without adding, transferring or removing paint. Inspect the cube that was in column A, level one. How many of its faces have paint?",
        "choices": [
          "1",
          "2",
          "3",
          "4",
          "5"
        ],
        "answer": 1,
        "hint": "Read when painting occurs. Exposure after that moment does not add paint.",
        "explanation": "At the painting stage, A level one touched the floor, its upper cube, B and F. Only two faces received paint. Separating the dry cubes exposes bare faces but does not paint them.",
        "feedback": [
          "1 is not the original painted-face count. Rearranging dry cubes adds no paint; newly uncovered surfaces stay bare.",
          "Correct. At the painting stage, A level one touched the floor, its upper cube, B and F. Only two faces received paint. Separating the dry cubes exposes bare faces but does not paint them.",
          "3 is not the original painted-face count. Rearranging dry cubes adds no paint; newly uncovered surfaces stay bare.",
          "4 is not the original painted-face count. Rearranging dry cubes adds no paint; newly uncovered surfaces stay bare.",
          "5 is not the original painted-face count. Rearranging dry cubes adds no paint; newly uncovered surfaces stay bare."
        ],
        "sourceUrls": [
          "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/perceptual_ability_test_section_instructions.pdf"
        ],
        "canonId": "pat-cube-counting",
        "visualCap": "Original supported assembly with a matching column-height plan. Target cube: column A, level 1 from the floor. Heights specify the givens, not the answer.",
        "fig": "data/figures/chapters/pat-cube-local-l2.4561b077550d1f4c.svg",
        "figureAlt": "Original supported assembly with a matching column-height plan. Target cube: column A, level 1 from the floor. Heights specify the givens, not the answer.",
        "sourceId": "continuation-pat-cube-painted-faces-l2",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "continuation-pat-cube-inventory-p1",
        "objectiveId": "pat-cube-inventory",
        "world": "pat",
        "pool": "practice",
        "familyId": "pat-cube-static-class-tally",
        "familyRationale": "Direct contact classification or systematic tally on a supported assembly. New numeric heights and rotations do not create a new task family.",
        "prompt": "The figure and column-height plan show the complete assembly before painting. Cubes are assembled first; all exposed surfaces are painted except the floor contact. How many cubes have exactly 4 painted faces?",
        "choices": [
          "1",
          "2",
          "3",
          "4",
          "5"
        ],
        "answer": 1,
        "hint": "Finish each column bottom to top. Tally cubes, then read only the requested category.",
        "explanation": "The two upper cubes, A2 and B2, each have four painted faces. The ground cubes in A and B have two each; F and G have three each. Exactly two cubes enter the four-face category.",
        "feedback": [
          "1 is too low. Include every support cube once, then count only cubes with exactly 4 painted faces.",
          "Correct. The two upper cubes, A2 and B2, each have four painted faces. The ground cubes in A and B have two each; F and G have three each. Exactly two cubes enter the four-face category.",
          "3 is too high. Include every support cube once, then count only cubes with exactly 4 painted faces.",
          "4 is too high. Include every support cube once, then count only cubes with exactly 4 painted faces.",
          "5 is too high. Include every support cube once, then count only cubes with exactly 4 painted faces."
        ],
        "sourceUrls": [
          "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/perceptual_ability_test_section_instructions.pdf"
        ],
        "canonId": "pat-cube-counting",
        "visualCap": "Original supported assembly with a matching column-height plan. Heights specify the givens, not the answer.",
        "fig": "data/figures/chapters/pat-cube-tally-p1.0cca20c593995626.svg",
        "figureAlt": "Original supported assembly with a matching column-height plan. Heights specify the givens, not the answer.",
        "sourceId": "continuation-pat-cube-inventory-p1",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "continuation-pat-cube-inventory-p2",
        "objectiveId": "pat-cube-inventory",
        "world": "pat",
        "pool": "practice",
        "familyId": "pat-cube-static-class-tally",
        "familyRationale": "Direct contact classification or systematic tally on a supported assembly. New numeric heights and rotations do not create a new task family.",
        "prompt": "The figure and column-height plan show the complete assembly before painting. Cubes are assembled first; all exposed surfaces are painted except the floor contact. How many cubes have exactly 3 painted faces?",
        "choices": [
          "1",
          "2",
          "3",
          "4",
          "5"
        ],
        "answer": 2,
        "hint": "Finish each column bottom to top. Tally cubes, then read only the requested category.",
        "explanation": "Column A has counts 2, 3, 5 from bottom to top; B has 3; F has 2, 4; G has 3. The three-face category contains A2, B1 and G1: three cubes.",
        "feedback": [
          "1 is too low. Include every support cube once, then count only cubes with exactly 3 painted faces.",
          "2 is too low. Include every support cube once, then count only cubes with exactly 3 painted faces.",
          "Correct. Column A has counts 2, 3, 5 from bottom to top; B has 3; F has 2, 4; G has 3. The three-face category contains A2, B1 and G1: three cubes.",
          "4 is too high. Include every support cube once, then count only cubes with exactly 3 painted faces.",
          "5 is too high. Include every support cube once, then count only cubes with exactly 3 painted faces."
        ],
        "sourceUrls": [
          "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/perceptual_ability_test_section_instructions.pdf"
        ],
        "canonId": "pat-cube-counting",
        "visualCap": "Original supported assembly with a matching column-height plan. Heights specify the givens, not the answer.",
        "fig": "data/figures/chapters/pat-cube-tally-p2.9e037e79446a3a93.svg",
        "figureAlt": "Original supported assembly with a matching column-height plan. Heights specify the givens, not the answer.",
        "sourceId": "continuation-pat-cube-inventory-p2",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "continuation-pat-cube-inventory-p3",
        "objectiveId": "pat-cube-inventory",
        "world": "pat",
        "pool": "practice",
        "familyId": "pat-cube-static-class-tally",
        "familyRationale": "Direct contact classification or systematic tally on a supported assembly. New numeric heights and rotations do not create a new task family.",
        "prompt": "The figure and column-height plan show the complete assembly before painting. Cubes are assembled first; all exposed surfaces are painted except the floor contact. How many cubes have exactly 2 painted faces?",
        "choices": [
          "1",
          "2",
          "3",
          "4",
          "5"
        ],
        "answer": 0,
        "hint": "Finish each column bottom to top. Tally cubes, then read only the requested category.",
        "explanation": "From bottom to top, A has counts 3, 3, 5; B has 2, 4; C has 4. Only B1 has two painted faces. The six tally entries account for all six cubes.",
        "feedback": [
          "Correct. From bottom to top, A has counts 3, 3, 5; B has 2, 4; C has 4. Only B1 has two painted faces. The six tally entries account for all six cubes.",
          "2 is too high. Include every support cube once, then count only cubes with exactly 2 painted faces.",
          "3 is too high. Include every support cube once, then count only cubes with exactly 2 painted faces.",
          "4 is too high. Include every support cube once, then count only cubes with exactly 2 painted faces.",
          "5 is too high. Include every support cube once, then count only cubes with exactly 2 painted faces."
        ],
        "sourceUrls": [
          "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/perceptual_ability_test_section_instructions.pdf"
        ],
        "canonId": "pat-cube-counting",
        "visualCap": "Original supported assembly with a matching column-height plan. Heights specify the givens, not the answer.",
        "fig": "data/figures/chapters/pat-cube-tally-p3.2a408ed45e7aa4bd.svg",
        "figureAlt": "Original supported assembly with a matching column-height plan. Heights specify the givens, not the answer.",
        "sourceId": "continuation-pat-cube-inventory-p3",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "continuation-pat-cube-inventory-c1",
        "objectiveId": "pat-cube-inventory",
        "world": "pat",
        "pool": "check",
        "familyId": "pat-cube-static-class-tally",
        "familyRationale": "Direct contact classification or systematic tally on a supported assembly. New numeric heights and rotations do not create a new task family.",
        "prompt": "The figure and column-height plan show the complete assembly before painting. Cubes are assembled first; all exposed surfaces are painted except the floor contact. How many cubes have exactly 2 painted faces?",
        "choices": [
          "1",
          "2",
          "3",
          "4",
          "5"
        ],
        "answer": 3,
        "hint": "Finish each column bottom to top. Tally cubes, then read only the requested category.",
        "explanation": "The two-face cubes are A1, B1, C1 and G1. A2 and C2 each have five painted faces; F1 and H1 have three each. The categories contain all eight cubes.",
        "feedback": [
          "1 is too low. Include every support cube once, then count only cubes with exactly 2 painted faces.",
          "2 is too low. Include every support cube once, then count only cubes with exactly 2 painted faces.",
          "3 is too low. Include every support cube once, then count only cubes with exactly 2 painted faces.",
          "Correct. The two-face cubes are A1, B1, C1 and G1. A2 and C2 each have five painted faces; F1 and H1 have three each. The categories contain all eight cubes.",
          "5 is too high. Include every support cube once, then count only cubes with exactly 2 painted faces."
        ],
        "sourceUrls": [
          "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/perceptual_ability_test_section_instructions.pdf"
        ],
        "canonId": "pat-cube-counting",
        "visualCap": "Original supported assembly with a matching column-height plan. Heights specify the givens, not the answer.",
        "fig": "data/figures/chapters/pat-cube-tally-c1.18059841c6c1ff8e.svg",
        "figureAlt": "Original supported assembly with a matching column-height plan. Heights specify the givens, not the answer.",
        "sourceId": "continuation-pat-cube-inventory-c1",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "continuation-pat-cube-inventory-c2",
        "objectiveId": "pat-cube-inventory",
        "world": "pat",
        "pool": "check",
        "familyId": "pat-cube-static-class-tally",
        "familyRationale": "Direct contact classification or systematic tally on a supported assembly. New numeric heights and rotations do not create a new task family.",
        "prompt": "The figure and column-height plan show the complete assembly before painting. Cubes are assembled first; all exposed surfaces are painted except the floor contact. How many cubes have exactly 4 painted faces?",
        "choices": [
          "1",
          "2",
          "3",
          "4",
          "5"
        ],
        "answer": 2,
        "hint": "Finish each column bottom to top. Tally cubes, then read only the requested category.",
        "explanation": "A2, B2 and C1 each have four painted faces. The remaining counts are A1: 2, B1: 1, F1: 3 and G1: 3. Exactly three of the seven cubes have four painted faces.",
        "feedback": [
          "1 is too low. Include every support cube once, then count only cubes with exactly 4 painted faces.",
          "2 is too low. Include every support cube once, then count only cubes with exactly 4 painted faces.",
          "Correct. A2, B2 and C1 each have four painted faces. The remaining counts are A1: 2, B1: 1, F1: 3 and G1: 3. Exactly three of the seven cubes have four painted faces.",
          "4 is too high. Include every support cube once, then count only cubes with exactly 4 painted faces.",
          "5 is too high. Include every support cube once, then count only cubes with exactly 4 painted faces."
        ],
        "sourceUrls": [
          "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/perceptual_ability_test_section_instructions.pdf"
        ],
        "canonId": "pat-cube-counting",
        "visualCap": "Original supported assembly with a matching column-height plan. Heights specify the givens, not the answer.",
        "fig": "data/figures/chapters/pat-cube-tally-c2.4a721b8d7d50cb70.svg",
        "figureAlt": "Original supported assembly with a matching column-height plan. Heights specify the givens, not the answer.",
        "sourceId": "continuation-pat-cube-inventory-c2",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "continuation-pat-cube-inventory-c3",
        "objectiveId": "pat-cube-inventory",
        "world": "pat",
        "pool": "check",
        "familyId": "pat-cube-static-class-tally",
        "familyRationale": "Direct contact classification or systematic tally on a supported assembly. New numeric heights and rotations do not create a new task family.",
        "prompt": "The figure and column-height plan show the complete assembly before painting. Cubes are assembled first; all exposed surfaces are painted except the floor contact. How many cubes have exactly 3 painted faces?",
        "choices": [
          "1",
          "2",
          "3",
          "4",
          "5"
        ],
        "answer": 3,
        "hint": "Finish each column bottom to top. Tally cubes, then read only the requested category.",
        "explanation": "A2 and B2 each touch their upper and lower cubes and one same-level side neighbor, leaving three painted faces. F1 and G1 also each have three painted faces. A1 and B1 have two; A3 and B3 have four. The requested count is four.",
        "feedback": [
          "1 is too low. Include every support cube once, then count only cubes with exactly 3 painted faces.",
          "2 is too low. Include every support cube once, then count only cubes with exactly 3 painted faces.",
          "3 is too low. Include every support cube once, then count only cubes with exactly 3 painted faces.",
          "Correct. A2 and B2 each touch their upper and lower cubes and one same-level side neighbor, leaving three painted faces. F1 and G1 also each have three painted faces. A1 and B1 have two; A3 and B3 have four. The requested count is four.",
          "5 is too high. Include every support cube once, then count only cubes with exactly 3 painted faces."
        ],
        "sourceUrls": [
          "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/perceptual_ability_test_section_instructions.pdf"
        ],
        "canonId": "pat-cube-counting",
        "visualCap": "Original supported assembly with a matching column-height plan. Heights specify the givens, not the answer.",
        "fig": "data/figures/chapters/pat-cube-tally-c3.0c4b3ca3f12b7f7b.svg",
        "figureAlt": "Original supported assembly with a matching column-height plan. Heights specify the givens, not the answer.",
        "sourceId": "continuation-pat-cube-inventory-c3",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "continuation-pat-cube-inventory-l1",
        "objectiveId": "pat-cube-inventory",
        "world": "pat",
        "pool": "later",
        "familyId": "pat-cube-paint-history-inventory",
        "familyRationale": "Reserved transfer: preserve a painted-face inventory through reassembly, including painted faces that become covered. Ordinary tasks compute exposure in the final paint-after-assembly geometry.",
        "prompt": "Transfer extension — painting happens before rearrangement. Paint the shown row, excluding the floor contact, and let it dry. Rearrange the same four cubes into one vertical stack without adding, transferring or removing paint. Counting all painted faces, including any now covered by a neighbor, how many cubes have exactly four painted faces?",
        "choices": [
          "1",
          "2",
          "3",
          "4",
          "5"
        ],
        "answer": 1,
        "hint": "Read when painting occurs. Exposure after that moment does not add paint.",
        "explanation": "When the row is painted, its two end cubes each receive paint on four faces; its two middle cubes each receive paint on three. Stacking the dry cubes changes contacts but not the paint already on each cube. Two cubes still have four painted faces. Painting only after stacking would instead give three four-face cubes, but that is not the stated procedure.",
        "feedback": [
          "1 is not the original painted-face category count. Rearranging dry cubes adds no paint; newly uncovered surfaces stay bare.",
          "Correct. When the row is painted, its two end cubes each receive paint on four faces; its two middle cubes each receive paint on three. Stacking the dry cubes changes contacts but not the paint already on each cube. Two cubes still have four painted faces. Painting only after stacking would instead give three four-face cubes, but that is not the stated procedure.",
          "3 is not the original painted-face category count. Rearranging dry cubes adds no paint; newly uncovered surfaces stay bare.",
          "4 is not the original painted-face category count. Rearranging dry cubes adds no paint; newly uncovered surfaces stay bare.",
          "5 is not the original painted-face category count. Rearranging dry cubes adds no paint; newly uncovered surfaces stay bare."
        ],
        "sourceUrls": [
          "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/perceptual_ability_test_section_instructions.pdf"
        ],
        "canonId": "pat-cube-counting",
        "visualCap": "Original supported assembly with a matching column-height plan. Heights specify the givens, not the answer.",
        "fig": "data/figures/chapters/pat-cube-tally-l1.c92ac980b63fa788.svg",
        "figureAlt": "Original supported assembly with a matching column-height plan. Heights specify the givens, not the answer.",
        "sourceId": "continuation-pat-cube-inventory-l1",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "continuation-pat-cube-inventory-l2",
        "objectiveId": "pat-cube-inventory",
        "world": "pat",
        "pool": "later",
        "familyId": "pat-cube-paint-history-inventory",
        "familyRationale": "Same reserved paint-history inventory family. A changed assembly is an alternate, not a distinct novelty claim.",
        "prompt": "Transfer extension — preserve the original coating. Paint the shown assembly except the floor contact and let it dry. Rearrange its four cubes into a straight single-layer row without adding, transferring or removing paint. Count painted faces even if the new arrangement covers them. How many cubes have exactly four painted faces?",
        "choices": [
          "1",
          "2",
          "3",
          "4",
          "5"
        ],
        "answer": 0,
        "hint": "Read when painting occurs. Exposure after that moment does not add paint.",
        "explanation": "Before rearrangement, A1 and B1 each have three painted faces; A2 has five and G1 has four. Moving the dry cubes into a new row does not alter those paint counts. Only G1 has four painted faces. Painting only after forming a row would instead give two four-face end cubes, which is a different procedure.",
        "feedback": [
          "Correct. Before rearrangement, A1 and B1 each have three painted faces; A2 has five and G1 has four. Moving the dry cubes into a new row does not alter those paint counts. Only G1 has four painted faces. Painting only after forming a row would instead give two four-face end cubes, which is a different procedure.",
          "2 is not the original painted-face category count. Rearranging dry cubes adds no paint; newly uncovered surfaces stay bare.",
          "3 is not the original painted-face category count. Rearranging dry cubes adds no paint; newly uncovered surfaces stay bare.",
          "4 is not the original painted-face category count. Rearranging dry cubes adds no paint; newly uncovered surfaces stay bare.",
          "5 is not the original painted-face category count. Rearranging dry cubes adds no paint; newly uncovered surfaces stay bare."
        ],
        "sourceUrls": [
          "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/perceptual_ability_test_section_instructions.pdf"
        ],
        "canonId": "pat-cube-counting",
        "visualCap": "Original supported assembly with a matching column-height plan. Heights specify the givens, not the answer.",
        "fig": "data/figures/chapters/pat-cube-tally-l2.72fb639f50857b07.svg",
        "figureAlt": "Original supported assembly with a matching column-height plan. Heights specify the givens, not the answer.",
        "sourceId": "continuation-pat-cube-inventory-l2",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      }
    ],
    "contentSha256": "9e1c80317f5b65a9317e4eb7f44bc4ef45f7c082d12938e4c90a9ad46cce854f",
    "reviewStatus": "internal-reviewed",
    "verified": true,
    "progressEligible": true,
    "runtimeIntegrated": true,
    "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
  },
  {
    "id": "qr-chance-arcade",
    "world": "qr",
    "title": "Chance Arcade",
    "scope": "Conditional sample spaces, updated draws, finite counting and complements. Introductory scope; broader probability/statistics remain planned.",
    "objectiveIds": [
      "qr-probability-conditional",
      "qr-counting-complement"
    ],
    "metadata": {
      "course": "QR",
      "session": 3,
      "creature": "chancet",
      "stationName": "Chance Arcade Table",
      "pathVariant": 2,
      "chapterTheme": "qr",
      "creatureDescriptor": {
        "id": "chancet",
        "name": "Chancet",
        "type": "reason",
        "color": "#ddbc63",
        "bodyPlan": "small brass fox with paired counter-shaped ears and a segmented fan tail",
        "concept": "Sample spaces and counted outcomes",
        "evolutions": [
          "Chancet",
          "Chancera",
          "Chancetrail"
        ],
        "rareName": "Amber Chancet",
        "blurb": "A patient arcade keeper who counts who is still eligible."
      },
      "topicMappings": {
        "screenshotTopicIds": [
          "bootcamp-quantitative-reasoning-5"
        ],
        "officialOnlyTopicIds": []
      },
      "instructionFamilyIds": [
        "qr-conditional-two-way-frequency",
        "qr-counting-independent-complement",
        "discovery-qr-filtered-counters",
        "discovery-qr-complement-grid"
      ]
    },
    "canonSources": [
      {
        "id": "qr-conditional-probability",
        "version": "0.1.0",
        "sourceRelativePath": "visuals/sheets/qr/qr-conditional-probability.json",
        "sourceSha256": "810ca894acb66d25d2554581ab6764427ab9fcc20c89236796e8743539ba75fc",
        "sourceRepository": "canon-expansion/checkpoint-f",
        "adaptationVersion": 1,
        "importsSourceAssessments": false,
        "formativeCanonChecksProgressEligible": false,
        "reviewScope": "Instruction strategy only; original game examples and questions, pending independent review."
      },
      {
        "id": "qr-counting-slots",
        "version": "0.2.0",
        "sourceRelativePath": "visuals/sheets/qr/qr-counting-slots.json",
        "sourceSha256": "360b2dd7868a671809788207efdb3240e662bff73051bf6073a718ce9bea9c11",
        "sourceRepository": "canon-expansion/checkpoint-f",
        "adaptationVersion": 1,
        "importsSourceAssessments": false,
        "formativeCanonChecksProgressEligible": false,
        "reviewScope": "Instruction strategy only; original game examples and questions, pending independent review."
      },
      {
        "id": "qr-probability-and-or",
        "version": "0.2.0",
        "sourceRelativePath": "visuals/sheets/qr/qr-probability-and-or.json",
        "sourceSha256": "3661213e3d6be8bc2b428d25c2a6464bec3011c314ebad1606f053147c7860db",
        "sourceRepository": "canon-expansion/checkpoint-f",
        "adaptationVersion": 1,
        "importsSourceAssessments": false,
        "formativeCanonChecksProgressEligible": false,
        "reviewScope": "Instruction strategy only; original game examples and questions, pending independent review."
      }
    ],
    "objectives": [
      {
        "id": "qr-probability-conditional",
        "world": "qr",
        "name": "Restrict and update the probability sample space",
        "lesson": "A condition restricts the eligible outcomes. P(A given B) = P(A and B)/P(B) when P(B) is positive. Count equally likely elementary outcomes, not unequal-size categories. Reversing the condition changes the denominator. For a sequence, update what remains after each draw; replacement restores the original population. Multiply conditional step probabilities; independence is a condition to check, not a synonym for AND.",
        "sourceUrls": [
          "https://openstax.org/books/introductory-statistics-2e/pages/3-1-terminology",
          "https://openstax.org/books/college-algebra-2e/pages/9-5-counting-principles"
        ],
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "qr-counting-complement",
        "world": "qr",
        "name": "Count outcomes and use a complement",
        "lesson": "Define an outcome before counting. Multiply the number of choices for successive slots; reduce the choices when an object cannot repeat. A group ignores order, so divide ordered arrangements by their repeated orderings. The complement of at least one is none. For inclusive OR, add the two counts and subtract their overlap once. Listing a small sample space can verify a formula.",
        "sourceUrls": [
          "https://openstax.org/books/introductory-statistics-2e/pages/3-1-terminology",
          "https://openstax.org/books/college-algebra-2e/pages/9-5-counting-principles"
        ],
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      }
    ],
    "teachingByObjective": {
      "qr-probability-conditional": {
        "objectiveId": "qr-probability-conditional",
        "version": 1,
        "core": "A condition restricts the eligible outcomes. P(A given B) = P(A and B)/P(B) when P(B) is positive. Count equally likely elementary outcomes, not unequal-size categories. Reversing the condition changes the denominator. For a sequence, update what remains after each draw; replacement restores the original population. Multiply conditional step probabilities; independence is a condition to check, not a synonym for AND.",
        "terms": [
          {
            "term": "Condition",
            "meaning": "The information that restricts which outcomes remain possible."
          },
          {
            "term": "Intersection",
            "meaning": "Outcomes satisfying both events."
          },
          {
            "term": "Replacement",
            "meaning": "Returning a drawn object before the next draw."
          }
        ],
        "assumptions": [
          "All stated selections are uniform among the eligible elementary objects.",
          "The conditioning event has positive probability.",
          "Replacement and independence are stated explicitly when needed."
        ],
        "workedExample": {
          "prompt": "A tray has 12 brass and 8 glass tokens. Of the brass tokens, 3 are stamped; of the glass tokens, 5 are stamped. A uniformly selected token is stamped. What is the probability it is glass?",
          "steps": [
            "The given group is the 8 stamped tokens.",
            "Five of those 8 are glass.",
            "Divide 5 by 8; the full tray of 20 is not the conditional denominator."
          ],
          "answer": "5/8",
          "familyId": "qr-conditional-two-way-frequency",
          "role": "instruction-only"
        },
        "commonMistake": "Using all objects, or reversing the given condition, changes the question.",
        "nextAction": "Name the eligible group before counting the wanted part.",
        "sourceUrls": [
          "https://openstax.org/books/introductory-statistics-2e/pages/3-1-terminology"
        ],
        "canon": {
          "id": "qr-conditional-probability",
          "version": "0.1.0",
          "sourceRelativePath": "visuals/sheets/qr/qr-conditional-probability.json",
          "sourceSha256": "810ca894acb66d25d2554581ab6764427ab9fcc20c89236796e8743539ba75fc",
          "sourceRepository": "canon-expansion/checkpoint-f",
          "adaptationVersion": 1,
          "importsSourceAssessments": false,
          "formativeCanonChecksProgressEligible": false,
          "reviewScope": "Instruction strategy only; original game examples and questions, pending independent review."
        },
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      "qr-counting-complement": {
        "objectiveId": "qr-counting-complement",
        "version": 1,
        "core": "Define an outcome before counting. Multiply the number of choices for successive slots; reduce the choices when an object cannot repeat. A group ignores order, so divide ordered arrangements by their repeated orderings. The complement of at least one is none. For inclusive OR, add the two counts and subtract their overlap once. Listing a small sample space can verify a formula.",
        "terms": [
          {
            "term": "Outcome",
            "meaning": "One fully specified result of the process."
          },
          {
            "term": "Complement",
            "meaning": "All outcomes outside the event."
          },
          {
            "term": "Unordered group",
            "meaning": "A selection whose order does not create a new result."
          }
        ],
        "assumptions": [
          "Codes are ordered and may start with any listed symbol unless restricted.",
          "Independent trials are stated explicitly.",
          "Finite objects are distinct unless stated otherwise."
        ],
        "workedExample": {
          "prompt": "Two independent fair spinners each show A, B, C or D. How many ordered results contain at least one A?",
          "steps": [
            "There are 4 × 4 = 16 ordered outcomes.",
            "There are 3 × 3 = 9 outcomes with no A.",
            "Subtract: 16 − 9 = 7."
          ],
          "answer": "7 outcomes; probability 7/16.",
          "familyId": "qr-counting-independent-complement",
          "role": "instruction-only"
        },
        "commonMistake": "Adding the chances double-counts outcomes satisfying both events.",
        "nextAction": "Write the complement in words and count it in the same sample space.",
        "sourceUrls": [
          "https://openstax.org/books/introductory-statistics-2e/pages/3-1-terminology",
          "https://openstax.org/books/college-algebra-2e/pages/9-5-counting-principles"
        ],
        "canon": {
          "id": "qr-counting-slots",
          "version": "0.2.0",
          "sourceRelativePath": "visuals/sheets/qr/qr-counting-slots.json",
          "sourceSha256": "360b2dd7868a671809788207efdb3240e662bff73051bf6073a718ce9bea9c11",
          "sourceRepository": "canon-expansion/checkpoint-f",
          "adaptationVersion": 1,
          "importsSourceAssessments": false,
          "formativeCanonChecksProgressEligible": false,
          "reviewScope": "Instruction strategy only; original game examples and questions, pending independent review."
        },
        "canonSources": [
          {
            "id": "qr-counting-slots",
            "version": "0.2.0",
            "sourceRelativePath": "visuals/sheets/qr/qr-counting-slots.json",
            "sourceSha256": "360b2dd7868a671809788207efdb3240e662bff73051bf6073a718ce9bea9c11",
            "sourceRepository": "canon-expansion/checkpoint-f",
            "adaptationVersion": 1,
            "importsSourceAssessments": false,
            "formativeCanonChecksProgressEligible": false,
            "reviewScope": "Instruction strategy only; original game examples and questions, pending independent review."
          },
          {
            "id": "qr-probability-and-or",
            "version": "0.2.0",
            "sourceRelativePath": "visuals/sheets/qr/qr-probability-and-or.json",
            "sourceSha256": "3661213e3d6be8bc2b428d25c2a6464bec3011c314ebad1606f053147c7860db",
            "sourceRepository": "canon-expansion/checkpoint-f",
            "adaptationVersion": 1,
            "importsSourceAssessments": false,
            "formativeCanonChecksProgressEligible": false,
            "reviewScope": "Instruction strategy only; original game examples and questions, pending independent review."
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
        "id": "cont-qr-probability-conditional-p1",
        "objectiveId": "qr-probability-conditional",
        "world": "qr",
        "pool": "practice",
        "familyId": "qr-conditional-two-way-frequency",
        "familyRationale": "Condition on a directly counted category; same taught family, never novel.",
        "prompt": "A fictional tray contains 9 round and 6 square seals. Four round seals and one square seal are blue. A seal is selected uniformly. Given that it is blue, what is the probability it is round?",
        "choices": [
          "4/5",
          "4/9",
          "4/15",
          "9/15"
        ],
        "answer": 0,
        "hint": "Restrict the tray to blue seals.",
        "explanation": "There are 5 blue seals, of which 4 are round, so the probability is 4/5.",
        "feedback": [
          "The blue condition leaves five eligible seals.",
          "This reverses the condition and asks blue given round.",
          "This is the joint probability in the entire tray.",
          "This ignores the blue condition."
        ],
        "sourceUrls": [
          "https://openstax.org/books/introductory-statistics-2e/pages/3-1-terminology",
          "https://openstax.org/books/college-algebra-2e/pages/9-5-counting-principles"
        ],
        "sourceId": "cont-qr-probability-conditional-p1",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "cont-qr-probability-conditional-p2",
        "objectiveId": "qr-probability-conditional",
        "world": "qr",
        "pool": "practice",
        "familyId": "qr-conditional-removal",
        "familyRationale": "Update a population after a stated draw without replacement.",
        "prompt": "A pouch has 5 copper and 3 silver counters. One copper counter has been drawn and kept out. A second counter is chosen uniformly from the pouch. What is its probability of being copper?",
        "choices": [
          "5/8",
          "4/8",
          "4/7",
          "5/7"
        ],
        "answer": 2,
        "hint": "Update both the target count and total.",
        "explanation": "Four copper counters remain among seven counters: 4/7.",
        "feedback": [
          "This keeps the original population.",
          "The total also fell by one.",
          "Both the copper count and total have been updated.",
          "The copper count also fell by one."
        ],
        "sourceUrls": [
          "https://openstax.org/books/introductory-statistics-2e/pages/3-1-terminology",
          "https://openstax.org/books/college-algebra-2e/pages/9-5-counting-principles"
        ],
        "sourceId": "cont-qr-probability-conditional-p2",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "cont-qr-probability-conditional-p3",
        "objectiveId": "qr-probability-conditional",
        "world": "qr",
        "pool": "practice",
        "familyId": "qr-conditional-replacement",
        "familyRationale": "Recognize that a replaced object does not change the next uniform draw.",
        "prompt": "A pouch contains 2 green and 7 white counters. A green counter is drawn, returned, and thoroughly mixed before another uniform draw. What is the probability the second counter is green?",
        "choices": [
          "1/8",
          "2/8",
          "2/9",
          "1/9"
        ],
        "answer": 2,
        "hint": "Was the first counter returned?",
        "explanation": "Replacement restores 2 green counters among 9, so the next probability is 2/9.",
        "feedback": [
          "This treats the first counter as removed.",
          "Replacement restores the total to nine.",
          "The original composition is restored.",
          "There are two eligible green counters."
        ],
        "sourceUrls": [
          "https://openstax.org/books/introductory-statistics-2e/pages/3-1-terminology",
          "https://openstax.org/books/college-algebra-2e/pages/9-5-counting-principles"
        ],
        "sourceId": "cont-qr-probability-conditional-p3",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "cont-qr-probability-conditional-c1",
        "objectiveId": "qr-probability-conditional",
        "world": "qr",
        "pool": "check",
        "familyId": "qr-conditional-two-way-frequency",
        "familyRationale": "Direct table conditioning transfers context, not a new semantic family.",
        "prompt": "A collection contains 18 leaf cards and 12 stone cards. Six leaf cards and nine stone cards carry a star. One card is selected uniformly. Given that the card carries a star, what is the probability it is a stone card?",
        "choices": [
          "3/4",
          "3/5",
          "3/10",
          "2/5"
        ],
        "answer": 1,
        "hint": "Identify the star group.",
        "explanation": "The star group has 6 + 9 = 15 cards. Nine are stone cards: 9/15 = 3/5.",
        "feedback": [
          "This asks star given stone.",
          "Nine of the fifteen eligible cards are stone cards.",
          "This uses all thirty cards.",
          "This ignores the star condition."
        ],
        "sourceUrls": [
          "https://openstax.org/books/introductory-statistics-2e/pages/3-1-terminology",
          "https://openstax.org/books/college-algebra-2e/pages/9-5-counting-principles"
        ],
        "sourceId": "cont-qr-probability-conditional-c1",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "cont-qr-probability-conditional-c2",
        "objectiveId": "qr-probability-conditional",
        "world": "qr",
        "pool": "check",
        "familyId": "qr-conditional-sequential-joint",
        "familyRationale": "Combine conditional draws to obtain the joint probability; no replacement.",
        "prompt": "A box has 4 amber and 6 blue beads. Two beads are drawn uniformly without replacement. What is the probability both are amber?",
        "choices": [
          "4/25",
          "2/15",
          "4/15",
          "1/5"
        ],
        "answer": 1,
        "hint": "Write a probability for each draw.",
        "explanation": "The first probability is 4/10; given amber first, the second is 3/9. Their product is 12/90 = 2/15.",
        "feedback": [
          "This multiplies 4/10 by itself as if replacement occurred.",
          "This updates the second draw and multiplies conditional probabilities.",
          "This doubles the probability for two identical-color orderings.",
          "Two draws do not make the probability 2/10."
        ],
        "sourceUrls": [
          "https://openstax.org/books/introductory-statistics-2e/pages/3-1-terminology",
          "https://openstax.org/books/college-algebra-2e/pages/9-5-counting-principles"
        ],
        "sourceId": "cont-qr-probability-conditional-c2",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "cont-qr-probability-conditional-c3",
        "objectiveId": "qr-probability-conditional",
        "world": "qr",
        "pool": "check",
        "familyId": "qr-conditional-reversal",
        "familyRationale": "Compare two conditional directions with the same overlap.",
        "prompt": "Among 40 exhibit labels, 10 are red, 16 are large, and 8 are both red and large. A label is selected uniformly. Which statement is correct?",
        "choices": [
          "P(red given large) = 4/5; P(large given red) = 1/2",
          "Both conditional probabilities are 1/5",
          "P(red given large) = 1/2; P(large given red) = 4/5",
          "Both conditional probabilities are 1/2"
        ],
        "answer": 2,
        "hint": "Read the words after given.",
        "explanation": "Use 16 for given large and 10 for given red. The results are 8/16 = 1/2 and 8/10 = 4/5.",
        "feedback": [
          "The denominators are reversed.",
          "One fifth is the joint probability in all forty labels.",
          "The overlap is the same, but each given group has its own denominator.",
          "The red group has ten members, not sixteen."
        ],
        "sourceUrls": [
          "https://openstax.org/books/introductory-statistics-2e/pages/3-1-terminology",
          "https://openstax.org/books/college-algebra-2e/pages/9-5-counting-principles"
        ],
        "sourceId": "cont-qr-probability-conditional-c3",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "cont-qr-probability-conditional-l1",
        "objectiveId": "qr-probability-conditional",
        "world": "qr",
        "pool": "later",
        "familyId": "qr-conditional-sum-constrained-pairs",
        "familyRationale": "Reserved transfer: condition on a relation between two ordered outcomes, not a table or known removed object.",
        "prompt": "Two independent fair four-sided dice, each numbered 1 through 4, are rolled. Given that their sum is 5, what is the probability the first die shows a number greater than the second?",
        "choices": [
          "1/4",
          "3/8",
          "1/2",
          "3/4"
        ],
        "answer": 2,
        "hint": "List only pairs consistent with the given sum.",
        "explanation": "The eligible ordered pairs are (1,4), (2,3), (3,2), (4,1). Two of four satisfy first greater than second, so 1/2.",
        "feedback": [
          "There are two favorable eligible pairs.",
          "Only pairs summing to five remain eligible.",
          "Two of the four equally likely eligible pairs work.",
          "Only (3,2) and (4,1) work."
        ],
        "sourceUrls": [
          "https://openstax.org/books/introductory-statistics-2e/pages/3-1-terminology",
          "https://openstax.org/books/college-algebra-2e/pages/9-5-counting-principles"
        ],
        "sourceId": "cont-qr-probability-conditional-l1",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "cont-qr-probability-conditional-l2",
        "objectiveId": "qr-probability-conditional",
        "world": "qr",
        "pool": "later",
        "familyId": "qr-conditional-reverse-weighted-generation",
        "familyRationale": "Reserved transfer: reconstruct a selected-outcome denominator from unequal population groups and rates.",
        "prompt": "A factory has 300 Type A parts and 100 Type B parts. Exactly 10% of A parts and 30% of B parts have a marked edge. One part is selected uniformly from all 400 parts. Given that it has a marked edge, what is the probability it is Type B?",
        "choices": [
          "3/4",
          "1/2",
          "1/4",
          "3/10"
        ],
        "answer": 1,
        "hint": "Convert each rate into a count first.",
        "explanation": "Marked A: 30. Marked B: 30. Among 60 marked parts, 30 are B, giving 1/2.",
        "feedback": [
          "This compares rates without the unequal group sizes.",
          "The marked counts are equal after applying the rates to the group sizes.",
          "This is the unconditional Type B share.",
          "This is marked given Type B, the reversed question."
        ],
        "sourceUrls": [
          "https://openstax.org/books/introductory-statistics-2e/pages/3-1-terminology",
          "https://openstax.org/books/college-algebra-2e/pages/9-5-counting-principles"
        ],
        "sourceId": "cont-qr-probability-conditional-l2",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "cont-qr-counting-complement-p1",
        "objectiveId": "qr-counting-complement",
        "world": "qr",
        "pool": "practice",
        "familyId": "qr-counting-product-repetition",
        "familyRationale": "Independent ordered slots with replacement of choices.",
        "prompt": "An arcade badge has one symbol chosen from 3 symbols followed by one color chosen from 5 colors. Every symbol can accompany every color. How many different badges are possible?",
        "choices": [
          "8",
          "15",
          "25",
          "125"
        ],
        "answer": 1,
        "hint": "Count all colors for each symbol.",
        "explanation": "Each of three symbols has five color choices: 3 × 5 = 15.",
        "feedback": [
          "Adding counts alternatives, not combined choices.",
          "There are five combinations for each of three symbols.",
          "There are three symbol choices, not five.",
          "There are only two slots here."
        ],
        "sourceUrls": [
          "https://openstax.org/books/introductory-statistics-2e/pages/3-1-terminology",
          "https://openstax.org/books/college-algebra-2e/pages/9-5-counting-principles"
        ],
        "sourceId": "cont-qr-counting-complement-p1",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "cont-qr-counting-complement-p2",
        "objectiveId": "qr-counting-complement",
        "world": "qr",
        "pool": "practice",
        "familyId": "qr-counting-independent-complement",
        "familyRationale": "At least one across independent equal-size draws, the same family as instruction.",
        "prompt": "Two independent fair three-sided spinners each show A, B or C. What is the probability that at least one shows A?",
        "choices": [
          "1/3",
          "2/3",
          "4/9",
          "5/9"
        ],
        "answer": 3,
        "hint": "Count none, then subtract from all.",
        "explanation": "There are 9 ordered outcomes. Four contain no A, so five contain at least one A: 5/9.",
        "feedback": [
          "This is the chance of A on only one specified spinner.",
          "This double-counts AA.",
          "This is the probability of no A.",
          "Subtract the four no-A outcomes from nine."
        ],
        "sourceUrls": [
          "https://openstax.org/books/introductory-statistics-2e/pages/3-1-terminology",
          "https://openstax.org/books/college-algebra-2e/pages/9-5-counting-principles"
        ],
        "sourceId": "cont-qr-counting-complement-p2",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "cont-qr-counting-complement-p3",
        "objectiveId": "qr-counting-complement",
        "world": "qr",
        "pool": "practice",
        "familyId": "qr-counting-inclusive-union",
        "familyRationale": "Count overlapping sets without double-counting their intersection.",
        "prompt": "Of 24 numbered tiles, 8 have a moon, 10 have a star, and 3 have both. How many have a moon or a star, including tiles with both?",
        "choices": [
          "18",
          "21",
          "15",
          "5"
        ],
        "answer": 2,
        "hint": "Which tiles were counted twice?",
        "explanation": "Add 8 + 10, then subtract the three double-counted tiles: 15.",
        "feedback": [
          "The three shared tiles are counted twice.",
          "The overlap must be subtracted, not added.",
          "Each tile in the union is counted once.",
          "The difference between the groups is not the union."
        ],
        "sourceUrls": [
          "https://openstax.org/books/introductory-statistics-2e/pages/3-1-terminology",
          "https://openstax.org/books/college-algebra-2e/pages/9-5-counting-principles"
        ],
        "sourceId": "cont-qr-counting-complement-p3",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "cont-qr-counting-complement-c1",
        "objectiveId": "qr-counting-complement",
        "world": "qr",
        "pool": "check",
        "familyId": "qr-counting-unordered-selection",
        "familyRationale": "Divide ordered draws by duplicate group orderings.",
        "prompt": "A scout chooses 2 different tools from 6 distinct tools. Carrying order does not matter. How many different pairs can be chosen?",
        "choices": [
          "30",
          "12",
          "15",
          "36"
        ],
        "answer": 2,
        "hint": "Compare AB with BA: are they different pairs?",
        "explanation": "Ordered draws give 6 × 5 = 30. Each pair appears in two orders, so 30/2 = 15.",
        "feedback": [
          "This counts each unordered pair twice.",
          "Choosing two does not mean multiplying six by two.",
          "Dividing by the two orders counts each pair once.",
          "A tool cannot repeat, and order does not matter."
        ],
        "sourceUrls": [
          "https://openstax.org/books/introductory-statistics-2e/pages/3-1-terminology",
          "https://openstax.org/books/college-algebra-2e/pages/9-5-counting-principles"
        ],
        "sourceId": "cont-qr-counting-complement-c1",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "cont-qr-counting-complement-c2",
        "objectiveId": "qr-counting-complement",
        "world": "qr",
        "pool": "check",
        "familyId": "qr-counting-constrained-slot",
        "familyRationale": "Place a fixed restriction before multiplying remaining ordered choices.",
        "prompt": "A code uses 3 different symbols chosen from A, B, C, D and E. The first symbol must be A. Order matters and no symbol repeats. How many codes are possible?",
        "choices": [
          "20",
          "12",
          "16",
          "60"
        ],
        "answer": 1,
        "hint": "Fill the restricted position first.",
        "explanation": "The first position is fixed. Four symbols remain for the second and three for the third: 4 × 3 = 12.",
        "feedback": [
          "A cannot be chosen again.",
          "The fixed first position leaves four then three choices.",
          "This allows repetition in the last two positions.",
          "This counts codes without the first-position restriction."
        ],
        "sourceUrls": [
          "https://openstax.org/books/introductory-statistics-2e/pages/3-1-terminology",
          "https://openstax.org/books/college-algebra-2e/pages/9-5-counting-principles"
        ],
        "sourceId": "cont-qr-counting-complement-c2",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "cont-qr-counting-complement-c3",
        "objectiveId": "qr-counting-complement",
        "world": "qr",
        "pool": "check",
        "familyId": "qr-counting-independent-complement",
        "familyRationale": "Complement transfer, same ordinary family as teaching.",
        "prompt": "A fair coin is tossed independently three times. What is the probability of at least one head?",
        "choices": [
          "1/8",
          "3/8",
          "7/8",
          "1/2"
        ],
        "answer": 2,
        "hint": "Find the single no-head outcome.",
        "explanation": "Only TTT has no head, with probability 1/8. Its complement is 7/8.",
        "feedback": [
          "This is the probability of no head.",
          "This counts exactly one head, not at least one.",
          "All outcomes except TTT qualify.",
          "This is the probability of a head on one specified toss."
        ],
        "sourceUrls": [
          "https://openstax.org/books/introductory-statistics-2e/pages/3-1-terminology",
          "https://openstax.org/books/college-algebra-2e/pages/9-5-counting-principles"
        ],
        "sourceId": "cont-qr-counting-complement-c3",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "cont-qr-counting-complement-l1",
        "objectiveId": "qr-counting-complement",
        "world": "qr",
        "pool": "later",
        "familyId": "qr-counting-exact-frequency-position",
        "familyRationale": "Reserved transfer: choose the target position, then fill all non-target positions; exact count rather than at least one.",
        "prompt": "A three-symbol code uses A, B and C with repetition allowed. How many codes contain exactly one A?",
        "choices": [
          "6",
          "9",
          "12",
          "19"
        ],
        "answer": 2,
        "hint": "Choose where the single A goes.",
        "explanation": "Choose the position of A in 3 ways. Each other position has two choices, B or C: 3 × 2 × 2 = 12.",
        "feedback": [
          "Both remaining positions independently have two choices.",
          "This undercounts the four fillings for each A position.",
          "Choosing the A position and filling the other two gives twelve.",
          "Nineteen is the number with at least one A, including repeats of A."
        ],
        "sourceUrls": [
          "https://openstax.org/books/introductory-statistics-2e/pages/3-1-terminology",
          "https://openstax.org/books/college-algebra-2e/pages/9-5-counting-principles"
        ],
        "sourceId": "cont-qr-counting-complement-l1",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "cont-qr-counting-complement-l2",
        "objectiveId": "qr-counting-complement",
        "world": "qr",
        "pool": "later",
        "familyId": "qr-counting-two-excluded-classes",
        "familyRationale": "Reserved transfer: two missing-category exclusions overlap; inclusion-exclusion beyond the single none family.",
        "prompt": "A three-symbol code uses A, B and C with repetition allowed. How many codes contain at least one A and at least one B?",
        "choices": [
          "8",
          "11",
          "12",
          "19"
        ],
        "answer": 2,
        "hint": "Track the code removed by both exclusions.",
        "explanation": "There are 27 codes. Subtract 8 with no A and 8 with no B; add back CCC, removed twice. 27 − 8 − 8 + 1 = 12.",
        "feedback": [
          "This counts an excluded class rather than the required intersection.",
          "CCC was subtracted twice and must be restored once.",
          "The overlap correction gives twelve.",
          "Nineteen requires at least one of only a single specified symbol."
        ],
        "sourceUrls": [
          "https://openstax.org/books/introductory-statistics-2e/pages/3-1-terminology",
          "https://openstax.org/books/college-algebra-2e/pages/9-5-counting-principles"
        ],
        "sourceId": "cont-qr-counting-complement-l2",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      }
    ],
    "contentSha256": "4830578f7c0eeeabe0f25f677a5f4cefa44e0792ea047f4c250bc9c0a794d0b1",
    "reviewStatus": "internal-reviewed",
    "verified": true,
    "progressEligible": true,
    "runtimeIntegrated": true,
    "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
  },
  {
    "id": "rc-research-dispatch",
    "world": "rc",
    "title": "Research Dispatch",
    "scope": "Original short assessment reports and a sustained guided investigation: observation versus causality, qualifiers, measurement and scope. Not full-length DAT passage coverage.",
    "objectiveIds": [
      "rc-observation-causality",
      "rc-claim-limits"
    ],
    "metadata": {
      "course": "RC",
      "session": 3,
      "creature": "claimfin",
      "stationName": "Research Evidence Desk",
      "pathVariant": 2,
      "chapterTheme": "rc",
      "creatureDescriptor": {
        "id": "claimfin",
        "name": "Claimfin",
        "type": "evidence",
        "color": "#73c4b8",
        "bodyPlan": "small teal flying fish with layered page fins and a bright bookmark-shaped tail",
        "concept": "Evidence and bounded claims",
        "evolutions": [
          "Claimfin",
          "Claimray",
          "Claimtide"
        ],
        "rareName": "Pearl Claimfin",
        "blurb": "A calm archive swimmer who keeps every conclusion tied to its evidence."
      },
      "topicMappings": {
        "screenshotTopicIds": [],
        "officialOnlyTopicIds": [
          "rc-detail",
          "rc-evidence-integration",
          "rc-inference"
        ]
      },
      "instructionFamilyIds": [
        "rc-causal-co-varying-conditions",
        "rc-limits-tested-conditions",
        "discovery-rc-filter-trial-causality",
        "discovery-rc-filter-trial-scope"
      ]
    },
    "canonSources": [
      {
        "id": "rc-study-design-evidence",
        "version": "0.1.0",
        "sourceRelativePath": "visuals/sheets/rc/rc-study-design-evidence.json",
        "sourceSha256": "75cb5ce62bf52c0eb630ba766ba81a2f79f6b5845044fb6a85fe8214401440c5",
        "sourceRepository": "canon-expansion/checkpoint-f",
        "adaptationVersion": 1,
        "reviewScope": "Reading strategy only; all game passage text and questions are original and pending independent review.",
        "importsSourceAssessments": false,
        "formativeCanonChecksProgressEligible": false
      },
      {
        "id": "rc-sustained-analysis",
        "version": "0.1.0",
        "sourceRelativePath": "visuals/sheets/rc/rc-sustained-analysis.json",
        "sourceSha256": "bbd75a31a565a7f32d6cdb700e72e62df2352f1192a3758b7bdbe39f359a7dd4",
        "sourceRepository": "canon-expansion/checkpoint-f",
        "adaptationVersion": 1,
        "reviewScope": "Cross-paragraph evidence strategy only; no source passage, tasks or visualizer copied.",
        "importsSourceAssessments": false,
        "formativeCanonChecksProgressEligible": false
      }
    ],
    "objectives": [
      {
        "id": "rc-observation-causality",
        "world": "rc",
        "name": "Distinguish an observation from a causal explanation",
        "lesson": "Separate what was measured from why it happened. Locate how groups were formed and which conditions changed together. An observed difference can remain valid while a proposed explanation is unsupported. Assigned and matched comparisons can strengthen a causal interpretation, but the passage determines what was isolated and what remains uncertain. Do not require outside science knowledge to repair a missing premise.",
        "sourceUrls": [
          "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/dat_candidate_guide.pdf"
        ],
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "rc-claim-limits",
        "world": "rc",
        "name": "Keep research claims within their evidence",
        "lesson": "Keep the population, measurement, conditions and time period attached to the result. Connect separated sentences when a claim needs more than one premise. A limit narrows a conclusion; it does not erase the observation. Preserve qualifiers such as some, may and under these conditions. Check every part of a combined claim against the passage.",
        "sourceUrls": [
          "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/dat_candidate_guide.pdf"
        ],
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      }
    ],
    "teachingByObjective": {
      "rc-observation-causality": {
        "objectiveId": "rc-observation-causality",
        "version": 1,
        "core": "Separate what was measured from why it happened. Locate how groups were formed and which conditions changed together. An observed difference can remain valid while a proposed explanation is unsupported. Assigned and matched comparisons can strengthen a causal interpretation, but the passage determines what was isolated and what remains uncertain. Do not require outside science knowledge to repair a missing premise.",
        "terms": [
          {
            "term": "Observation",
            "meaning": "A result the report says was measured or recorded."
          },
          {
            "term": "Causal claim",
            "meaning": "A claim that changing one factor produced a change in another."
          },
          {
            "term": "Confounding",
            "meaning": "Factors vary together, preventing the comparison from isolating one explanation."
          }
        ],
        "assumptions": [
          "Use the passage as the evidence source.",
          "All game studies are fictional; their results are not claims about real materials.",
          "No outside topic knowledge is needed."
        ],
        "workedExample": {
          "prompt": "A report says baskets near a window dried sooner, but those baskets also received stronger airflow. Does the report isolate the window effect?",
          "steps": [
            "The drying difference is the observation.",
            "Location and airflow changed together.",
            "The comparison does not separate their effects; it also does not prove the window had no effect."
          ],
          "answer": "The difference was observed; the isolated cause is unresolved.",
          "familyId": "rc-causal-co-varying-conditions",
          "role": "instruction-only"
        },
        "commonMistake": "Treating an observed difference as proof of one cause, or treating a limit as proof of no effect.",
        "nextAction": "Pin one result sentence and one design sentence before judging the claim.",
        "sourceUrls": [
          "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/dat_candidate_guide.pdf"
        ],
        "canon": {
          "id": "rc-study-design-evidence",
          "version": "0.1.0",
          "sourceRelativePath": "visuals/sheets/rc/rc-study-design-evidence.json",
          "sourceSha256": "75cb5ce62bf52c0eb630ba766ba81a2f79f6b5845044fb6a85fe8214401440c5",
          "sourceRepository": "canon-expansion/checkpoint-f",
          "adaptationVersion": 1,
          "reviewScope": "Reading strategy only; all game passage text and questions are original and pending independent review.",
          "importsSourceAssessments": false,
          "formativeCanonChecksProgressEligible": false
        },
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      "rc-claim-limits": {
        "objectiveId": "rc-claim-limits",
        "version": 1,
        "core": "Keep the population, measurement, conditions and time period attached to the result. Connect separated sentences when a claim needs more than one premise. A limit narrows a conclusion; it does not erase the observation. Preserve qualifiers such as some, may and under these conditions. Check every part of a combined claim against the passage.",
        "terms": [
          {
            "term": "Scope",
            "meaning": "The tested population, setting, outcome and time period."
          },
          {
            "term": "Premise",
            "meaning": "A passage statement used to support a conclusion."
          },
          {
            "term": "Qualifier",
            "meaning": "A word or phrase limiting how strongly or widely a claim applies."
          }
        ],
        "assumptions": [
          "Each claim must be supported by the supplied report.",
          "A measured proxy is not automatically the unmeasured outcome it may represent.",
          "A proposed future test is not an established result."
        ],
        "workedExample": {
          "prompt": "A report compares two filters using clean water at room temperature for one hour. Filter M removes more dye. Which conclusion is supported?",
          "steps": [
            "Retain the tested fluid, temperature and duration.",
            "The measured outcome is dye removal.",
            "The report does not establish performance in every fluid or over longer use."
          ],
          "answer": "M removed more dye under the stated one-hour test conditions.",
          "familyId": "rc-limits-tested-conditions",
          "role": "instruction-only"
        },
        "commonMistake": "Removing a qualifier makes a broader statement than the evidence supports.",
        "nextAction": "Underline the part of the claim that the report did not test.",
        "sourceUrls": [
          "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/dat_candidate_guide.pdf"
        ],
        "canon": {
          "id": "rc-study-design-evidence",
          "version": "0.1.0",
          "sourceRelativePath": "visuals/sheets/rc/rc-study-design-evidence.json",
          "sourceSha256": "75cb5ce62bf52c0eb630ba766ba81a2f79f6b5845044fb6a85fe8214401440c5",
          "sourceRepository": "canon-expansion/checkpoint-f",
          "adaptationVersion": 1,
          "reviewScope": "Reading strategy only; all game passage text and questions are original and pending independent review.",
          "importsSourceAssessments": false,
          "formativeCanonChecksProgressEligible": false
        },
        "canonSources": [
          {
            "id": "rc-study-design-evidence",
            "version": "0.1.0",
            "sourceRelativePath": "visuals/sheets/rc/rc-study-design-evidence.json",
            "sourceSha256": "75cb5ce62bf52c0eb630ba766ba81a2f79f6b5845044fb6a85fe8214401440c5",
            "sourceRepository": "canon-expansion/checkpoint-f",
            "adaptationVersion": 1,
            "reviewScope": "Reading strategy only; all game passage text and questions are original and pending independent review.",
            "importsSourceAssessments": false,
            "formativeCanonChecksProgressEligible": false
          },
          {
            "id": "rc-sustained-analysis",
            "version": "0.1.0",
            "sourceRelativePath": "visuals/sheets/rc/rc-sustained-analysis.json",
            "sourceSha256": "bbd75a31a565a7f32d6cdb700e72e62df2352f1192a3758b7bdbe39f359a7dd4",
            "sourceRepository": "canon-expansion/checkpoint-f",
            "adaptationVersion": 1,
            "reviewScope": "Cross-paragraph evidence strategy only; no source passage, tasks or visualizer copied.",
            "importsSourceAssessments": false,
            "formativeCanonChecksProgressEligible": false
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
        "id": "cont-rc-observation-causality-p1",
        "objectiveId": "rc-observation-causality",
        "world": "rc",
        "pool": "practice",
        "familyId": "rc-causal-co-varying-conditions",
        "familyRationale": "The measured comparison is retained while two co-varying conditions prevent isolated attribution.",
        "prompt": "Which statement best distinguishes the result from its explanation?",
        "choices": [
          "More mass was lost beside the window, but this trial did not isolate the effect of light.",
          "Light alone caused the mass difference.",
          "The limit proves light had no effect on drying.",
          "The later airflow experiment already explains the first result."
        ],
        "answer": 0,
        "hint": "Pair the result in P1 with the design in P2.",
        "explanation": "P1 reports the difference; P2 identifies two changing conditions and a future, not completed, experiment.",
        "feedback": [
          "This preserves both the result and the design limitation.",
          "Light and air movement varied together.",
          "Failure to isolate an effect does not establish zero effect.",
          "The later experiment was only proposed."
        ],
        "sourceUrls": [
          "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/dat_candidate_guide.pdf"
        ],
        "passageId": "cont-rc-observation-causality-p1-passage",
        "passage": {
          "title": "Original fictional report: The drying gallery",
          "paragraphs": [
            "A museum laboratory compared the drying of twelve identical clay tiles. Six stood on a shelf beside an open window; six stood in a closed cabinet. Each began with the same mass of added water, and technicians weighed every tile after three hours. The window group lost more mass on average.",
            "The two locations differed in both light exposure and air movement. Neither was measured separately during the trial. The researchers described the result as a comparison of the two complete storage arrangements, and proposed a later experiment in which only airflow would vary."
          ]
        },
        "sourceId": "cont-rc-observation-causality-p1",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "cont-rc-observation-causality-p2",
        "objectiveId": "rc-observation-causality",
        "world": "rc",
        "pool": "practice",
        "familyId": "rc-causal-assigned-matched",
        "familyRationale": "Compare an assigned matched experiment with observation while avoiding universal proof.",
        "prompt": "Why does the report treat the laboratory comparison as stronger evidence about stand movement?",
        "choices": [
          "It proves movement has the same effect on every mixture.",
          "The laboratory omitted all comparison trays.",
          "Movement was assigned while the listed conditions were matched.",
          "The warehouse survey used no observations."
        ],
        "answer": 2,
        "hint": "Compare how the groups were formed.",
        "explanation": "P1 describes assignment and matched conditions; P2 contrasts this with changing warehouse conditions.",
        "feedback": [
          "The report expressly limits generalization.",
          "A stationary comparison group was included.",
          "The design separates movement from the listed warehouse differences.",
          "The warehouse survey did make observations."
        ],
        "sourceUrls": [
          "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/dat_candidate_guide.pdf"
        ],
        "passageId": "cont-rc-observation-causality-p2-passage",
        "passage": {
          "title": "Original fictional report: The rotating trays",
          "paragraphs": [
            "Investigators randomly assigned twenty trays of the same fictional crystal mixture to a rotating stand or a stationary stand. Both groups used the same room, starting amount, container and observation period. The rotating trays formed smaller crystals on average during that period.",
            "A previous warehouse survey had also found smaller crystals near rotating machinery, but temperature and mixture composition had varied across warehouses. The laboratory report says the assigned trial separates stand movement from those listed differences more effectively. It does not claim that every possible mixture will respond the same way."
          ]
        },
        "sourceId": "cont-rc-observation-causality-p2",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "cont-rc-observation-causality-p3",
        "objectiveId": "rc-observation-causality",
        "world": "rc",
        "pool": "practice",
        "familyId": "rc-causal-before-after-trend",
        "familyRationale": "An uncontrolled time comparison cannot separate a treatment from a simultaneous change.",
        "prompt": "What does using the same sound meter establish in the passage?",
        "choices": [
          "It removes the need to consider the changed pump setting.",
          "It supports measurement comparability but does not isolate the lining effect.",
          "It proves the lining caused no change.",
          "It means the planned common-setting comparison has already occurred."
        ],
        "answer": 1,
        "hint": "Separate a measurement control from a changed operating condition.",
        "explanation": "P2 explicitly separates consistent measurement from control of the pump-setting difference.",
        "feedback": [
          "Instrument consistency does not make operating conditions identical.",
          "The report grants comparable measurement while retaining the causal limit.",
          "The passage does not establish a zero lining effect.",
          "The common-setting comparison remains a plan."
        ],
        "sourceUrls": [
          "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/dat_candidate_guide.pdf"
        ],
        "passageId": "cont-rc-observation-causality-p3-passage",
        "passage": {
          "title": "Original fictional report: A quieter pump room",
          "paragraphs": [
            "Engineers recorded the average sound level in a pump room for one morning. The following morning they installed a lining on one wall and recorded a lower average level. They used the same sound meter in the same position on both mornings.",
            "The second morning also used a slower pump setting. The report notes that the instrument consistency helps compare the measurements, but the change in pump operation prevents attributing the entire difference to the lining. The engineers plan to compare lined and unlined conditions at a common setting."
          ]
        },
        "sourceId": "cont-rc-observation-causality-p3",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "cont-rc-observation-causality-c1",
        "objectiveId": "rc-observation-causality",
        "world": "rc",
        "pool": "check",
        "familyId": "rc-causal-co-varying-conditions",
        "familyRationale": "Fresh fictional report, same co-varying-conditions reasoning family as instruction.",
        "prompt": "Which conclusion is justified by this report?",
        "choices": [
          "Lower temperature alone caused the difference.",
          "Humidity must have caused the entire difference.",
          "The sampled north-locker batches germinated more often, while the isolated temperature effect remains unresolved.",
          "No germination difference was observed."
        ],
        "answer": 2,
        "hint": "Keep the result and ask which factor was isolated.",
        "explanation": "P1 supplies the observation; both paragraphs explain why a temperature-only causal interpretation is not established.",
        "feedback": [
          "Temperature and humidity differed together.",
          "The report also does not isolate humidity.",
          "The measured result and its causal limit are both preserved.",
          "P1 explicitly reports a germination difference."
        ],
        "sourceUrls": [
          "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/dat_candidate_guide.pdf"
        ],
        "passageId": "cont-rc-observation-causality-c1-passage",
        "passage": {
          "title": "Original fictional report: The seed lockers",
          "paragraphs": [
            "An archive compared germination records for seeds stored in two lockers. The north locker had both lower temperature and lower humidity than the south locker. Seeds from the north locker germinated more often in the archive’s follow-up test. The report gives the result for the sampled batches only.",
            "The archivists did not assign identical seed batches to independently controlled temperature and humidity conditions. They therefore proposed a new experiment with those conditions varied separately. The initial survey was presented as a reason to investigate storage conditions, not as a test isolating temperature."
          ]
        },
        "sourceId": "cont-rc-observation-causality-c1",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "cont-rc-observation-causality-c2",
        "objectiveId": "rc-observation-causality",
        "world": "rc",
        "pool": "check",
        "familyId": "rc-causal-assigned-matched",
        "familyRationale": "Assigned matched design supports a bounded causal interpretation, not automatic universal certainty.",
        "prompt": "Which feature most directly supports attributing the observed difference to cable choice within this experiment?",
        "choices": [
          "All possible outdoor conditions were tested.",
          "The report mentions a future comparison.",
          "Cable assignment varied while the listed conditions were kept fixed.",
          "The result contained a numerical average."
        ],
        "answer": 2,
        "hint": "Look for what varied and what stayed matched.",
        "explanation": "P1 and P2 identify the assigned cable difference and matched conditions as the relevant design feature.",
        "feedback": [
          "Outdoor conditions were not tested.",
          "Future work does not establish the current comparison.",
          "This is the comparison the report intentionally isolates.",
          "An average alone cannot identify a cause."
        ],
        "sourceUrls": [
          "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/dat_candidate_guide.pdf"
        ],
        "passageId": "cont-rc-observation-causality-c2-passage",
        "passage": {
          "title": "Original fictional report: The signal channels",
          "paragraphs": [
            "A team randomly assigned identical sensors to receive the same programmed signal through either Cable R or Cable S. Cable length, connector type, signal source and test duration were held fixed. In these tests, the Cable R group lost fewer signal packets on average.",
            "The authors describe the cable assignment as the intended difference between the groups. They limit their conclusion to the tested arrangement, because they did not vary cable length or test outdoor conditions. They propose those comparisons as future work rather than predictions already established."
          ]
        },
        "sourceId": "cont-rc-observation-causality-c2",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "cont-rc-observation-causality-c3",
        "objectiveId": "rc-observation-causality",
        "world": "rc",
        "pool": "check",
        "familyId": "rc-causal-before-after-trend",
        "familyRationale": "Time and intervention move together with a known concurrent schedule change.",
        "prompt": "Which statement most closely matches the analyst’s reasoning?",
        "choices": [
          "The smaller count proves the display alone prevented six alarms.",
          "The count fell, but changed operating time prevents isolating the display from these totals.",
          "Halving operating hours proves the display had no effect.",
          "The count difference is imaginary because the exposure times differ."
        ],
        "answer": 1,
        "hint": "Separate the recorded total from an isolated effect.",
        "explanation": "The report accepts the observed totals while identifying operating time as another changing factor.",
        "feedback": [
          "Two conditions changed, so the difference is not isolated.",
          "This retains the counts and the stated limitation.",
          "The data do not prove a zero display effect.",
          "Different exposure times limit interpretation, not the existence of the counts."
        ],
        "sourceUrls": [
          "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/dat_candidate_guide.pdf"
        ],
        "passageId": "cont-rc-observation-causality-c3-passage",
        "passage": {
          "title": "Original fictional report: The reservoir alarm",
          "paragraphs": [
            "A station logged ten overflow alarms in the month before a new warning display was installed and four alarms in the month after installation. The report describes the counts as the station’s observed monthly totals. It does not treat the months as randomized groups.",
            "During the second month, the station also reduced its operating hours by half. The analyst says the count difference could reflect the display, the shorter operation period, or both. The proposed follow-up would compare rates during equal operating hours under the two display conditions."
          ]
        },
        "sourceId": "cont-rc-observation-causality-c3",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "cont-rc-observation-causality-l1",
        "objectiveId": "rc-observation-causality",
        "world": "rc",
        "pool": "later",
        "familyId": "rc-causal-postassignment-attrition",
        "familyRationale": "Reserved transfer: assignment initially matched groups, but selective missing outcomes undermine the final comparison.",
        "prompt": "Why does the report remain cautious despite random assignment?",
        "choices": [
          "The surviving vials necessarily represent every assigned vial.",
          "Method A must have caused every crack.",
          "Selective missing outcomes may distort the survivor comparison.",
          "Random assignment occurred after the discarded vials were measured."
        ],
        "answer": 2,
        "hint": "Track who remained in the final comparison.",
        "explanation": "P2 identifies selection after assignment as the reason the survivor-only average may misrepresent the full assigned group.",
        "feedback": [
          "The discarded outcomes are unknown.",
          "The passage does not establish the cause of each crack.",
          "This follows the stated missing-outcome limitation.",
          "Assignment occurred before cracking."
        ],
        "sourceUrls": [
          "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/dat_candidate_guide.pdf"
        ],
        "passageId": "cont-rc-observation-causality-l1-passage",
        "passage": {
          "title": "Original fictional report: The missing vials",
          "paragraphs": [
            "Researchers randomly assigned forty identical vials to two cooling methods. Before the final measurements, six vials in Method A cracked and were discarded. No vials in Method B were discarded. The published table compares only the unbroken vials and reports greater average clarity in Method A.",
            "The authors do not know the final clarity of the discarded vials. They explain that a method which removes its poorest outcomes from the measured group can appear better among survivors. Random assignment occurred before the cracking; it did not recover the missing outcomes. The report calls for tracking breakage alongside clarity."
          ]
        },
        "sourceId": "cont-rc-observation-causality-l1",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "cont-rc-observation-causality-l2",
        "objectiveId": "rc-observation-causality",
        "world": "rc",
        "pool": "later",
        "familyId": "rc-causal-sequence-carryover",
        "familyRationale": "Reserved transfer: treatment order and lingering effects confound a within-object comparison.",
        "prompt": "What is the principal limitation of the comparison described?",
        "choices": [
          "Different sensor models were used in the two conditions.",
          "The stable readings prove Cleaner B alone caused the improvement.",
          "The second condition may include order and carryover effects from the first.",
          "Using the same sensors proves both cleaners are identical."
        ],
        "answer": 2,
        "hint": "Connect the fixed order with the coating’s duration.",
        "explanation": "Both paragraphs connect the fixed sequence with a coating that may persist into the second condition.",
        "feedback": [
          "The passage says the same sensors were used.",
          "The residual coating prevents that isolated attribution.",
          "This is the reported sequence/carryover concern.",
          "A repeated-device design does not establish identical effects."
        ],
        "sourceUrls": [
          "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/dat_candidate_guide.pdf"
        ],
        "passageId": "cont-rc-observation-causality-l2-passage",
        "passage": {
          "title": "Original fictional report: A sensor remembers",
          "paragraphs": [
            "Every sensor in a trial received Cleaner A on Monday and Cleaner B on Tuesday. Tuesday readings were more stable. The report states that each cleaner can leave a coating that persists for several days, so Tuesday’s sensor surface may include material left by Monday’s cleaner.",
            "Using the same sensors reduces differences between devices, but it does not separate the cleaner from order and residual coating. The authors propose a future trial that balances treatment order and verifies removal of the previous coating. They do not claim the second cleaner was ineffective."
          ]
        },
        "sourceId": "cont-rc-observation-causality-l2",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "cont-rc-claim-limits-p1",
        "objectiveId": "rc-claim-limits",
        "world": "rc",
        "pool": "practice",
        "familyId": "rc-limits-tested-conditions",
        "familyRationale": "Preserve tested environment and duration without erasing a comparison.",
        "prompt": "Which claim preserves the report’s scope?",
        "choices": [
          "L blocks more dust in every environment.",
          "L blocked more dust during the stated one-hour dry-air trial.",
          "The untested conditions mean neither screen blocked dust.",
          "L will never clog after cleaning."
        ],
        "answer": 1,
        "hint": "Keep the condition and duration attached.",
        "explanation": "The supported comparison retains the duration and environment specified in P1 and the limits in P2.",
        "feedback": [
          "The passage does not test every environment.",
          "This states the observed comparison within its conditions.",
          "A limited trial can still support its reported result.",
          "Neither long-term clogging nor cleaning was tested."
        ],
        "sourceUrls": [
          "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/dat_candidate_guide.pdf"
        ],
        "passageId": "cont-rc-claim-limits-p1-passage",
        "passage": {
          "title": "Original fictional report: One-hour screens",
          "paragraphs": [
            "In a laboratory trial, Screen L blocked more dust than Screen M during one hour of dry-air testing. The screens had equal area and received the same airflow. The report gives the finding for the tested dry dust and does not include humid conditions.",
            "After the hour ended, the team stopped measurement. It did not investigate clogging over a longer period or changes after cleaning. The authors present L as the better dust blocker during this trial, while leaving long-term and humid-air performance open for later study."
          ]
        },
        "sourceId": "cont-rc-claim-limits-p1",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "cont-rc-claim-limits-p2",
        "objectiveId": "rc-claim-limits",
        "world": "rc",
        "pool": "practice",
        "familyId": "rc-limits-proxy-outcome",
        "familyRationale": "A measured indicator is not a directly measured final performance outcome.",
        "prompt": "Which statement is supported?",
        "choices": [
          "Culture A necessarily contained more living cells.",
          "Each cell in Culture A necessarily contained more marker.",
          "Culture A had a stronger measured signal, but cell number was not determined by this result alone.",
          "No useful signal measurement was made."
        ],
        "answer": 2,
        "hint": "Name the actual measured quantity.",
        "explanation": "P1 establishes the signal difference; P2 supplies multiple possible contributors and requires a separate count.",
        "feedback": [
          "Light was measured, not living-cell number.",
          "The amount per cell was not separately measured.",
          "This preserves the measured outcome and the unresolved interpretation.",
          "The signal measurement remains a reported result."
        ],
        "sourceUrls": [
          "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/dat_candidate_guide.pdf"
        ],
        "passageId": "cont-rc-claim-limits-p2-passage",
        "passage": {
          "title": "Original fictional report: A brighter marker",
          "paragraphs": [
            "A laboratory tracked a fluorescent marker inside two fictional cell cultures. Culture A emitted a stronger average signal than Culture B after twenty minutes. The instrument measured emitted light; it did not directly measure the number of living cells.",
            "The report explains that signal strength may depend on both the number of marked cells and the amount of marker in each cell. Without a separate cell count, the researchers cannot decide which contributed to the difference. They recommend measuring cell numbers in the next trial."
          ]
        },
        "sourceId": "cont-rc-claim-limits-p2",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "cont-rc-claim-limits-p3",
        "objectiveId": "rc-claim-limits",
        "world": "rc",
        "pool": "practice",
        "familyId": "rc-limits-sampled-population",
        "familyRationale": "Do not generalize a result to an untested population.",
        "prompt": "What would exceed the evidence given?",
        "choices": [
          "The tested mature leaves lost less water with the coating.",
          "The finding motivates a wider follow-up sample.",
          "Other leaf varieties were not tested.",
          "Every newly emerging leaf of every variety would respond identically."
        ],
        "answer": 3,
        "hint": "Compare the claimed population with the sampled population.",
        "explanation": "The universal statement extends beyond the mature leaves of one tested variety.",
        "feedback": [
          "This is the result reported in P1.",
          "P2 expressly supports follow-up work.",
          "P2 states this limit.",
          "This transfers the result to untested leaf stages and varieties."
        ],
        "sourceUrls": [
          "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/dat_candidate_guide.pdf"
        ],
        "passageId": "cont-rc-claim-limits-p3-passage",
        "passage": {
          "title": "Original fictional report: Mature leaf surfaces",
          "paragraphs": [
            "Researchers tested a coating on mature leaves from a single fictional plant variety. Under the stated laboratory conditions, coated leaves lost less water than uncoated leaves during the afternoon measurement. All sampled leaves were fully expanded.",
            "The authors distinguish those samples from newly emerging leaves and from other varieties, which they did not test. They consider the result a reason to study a wider sample, not proof that every leaf type responds alike. The report includes no estimate for untested groups."
          ]
        },
        "sourceId": "cont-rc-claim-limits-p3",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "cont-rc-claim-limits-c1",
        "objectiveId": "rc-claim-limits",
        "world": "rc",
        "pool": "check",
        "familyId": "rc-limits-tested-conditions",
        "familyRationale": "New passage within the ordinary condition-duration family.",
        "prompt": "Which conclusion is supported?",
        "choices": [
          "P is superior under every possible temperature schedule.",
          "P retained shape more closely in the one tested cycle.",
          "Q necessarily fails after any cold exposure.",
          "Repeated cycling cannot change either seal."
        ],
        "answer": 1,
        "hint": "Retain the number and range of cycles.",
        "explanation": "The passage supports one comparison under one specified cycle, while repeated and hotter conditions are untested.",
        "feedback": [
          "The report expressly declines that universal ranking.",
          "This retains the tested cycle and measured outcome.",
          "A relative difference does not imply complete failure.",
          "Repeated cycles were not measured."
        ],
        "sourceUrls": [
          "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/dat_candidate_guide.pdf"
        ],
        "passageId": "cont-rc-claim-limits-c1-passage",
        "passage": {
          "title": "Original fictional report: A single cold cycle",
          "paragraphs": [
            "A materials team compared two fictional seals during one cycle from room temperature to a specified cold temperature and back. Seal P retained its shape more closely than Seal Q in that cycle. Both seals experienced the same apparatus and cycle duration.",
            "The report records no repeated cycles and no hotter temperature range. Its authors state that resistance to repeated cycling must be measured separately. They view the initial result as promising for the tested cycle without ranking the seals for all possible service conditions."
          ]
        },
        "sourceId": "cont-rc-claim-limits-c1",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "cont-rc-claim-limits-c2",
        "objectiveId": "rc-claim-limits",
        "world": "rc",
        "pool": "check",
        "familyId": "rc-limits-proxy-outcome",
        "familyRationale": "Measured surface index does not identify unmeasured total amount.",
        "prompt": "Which claim goes beyond the measurements?",
        "choices": [
          "C had the larger surface-color index.",
          "Internal composition was not established by this instrument.",
          "C necessarily contained more total mineral throughout its pellets.",
          "A further internal-composition measurement could address an unresolved issue."
        ],
        "answer": 2,
        "hint": "Check whether the conclusion names the measured outcome.",
        "explanation": "The report separates a surface signal from total content and gives two arrangements that can produce a dark surface.",
        "feedback": [
          "This is directly reported.",
          "This is the instrument limitation described.",
          "This replaces a surface measurement with an unmeasured total-content conclusion.",
          "The report proposes that follow-up."
        ],
        "sourceUrls": [
          "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/dat_candidate_guide.pdf"
        ],
        "passageId": "cont-rc-claim-limits-c2-passage",
        "passage": {
          "title": "Original fictional report: A surface index",
          "paragraphs": [
            "Investigators measured a surface-color index for two batches of fictional mineral pellets. Batch C had a larger index than Batch D. The report defines the index as a measure of color at the outer surface, not a measurement of mineral mass throughout each pellet.",
            "A darker surface could occur with a thin coating or with coloration throughout the pellet. The instrument used in this experiment cannot distinguish those arrangements. The authors recommend measuring internal composition before using the index to rank total mineral content."
          ]
        },
        "sourceId": "cont-rc-claim-limits-c2",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "cont-rc-claim-limits-c3",
        "objectiveId": "rc-claim-limits",
        "world": "rc",
        "pool": "check",
        "familyId": "rc-limits-sampled-population",
        "familyRationale": "Sample boundaries remain attached to a positive result.",
        "prompt": "Which interpretation best matches the authors’ conclusion?",
        "choices": [
          "The association was observed in the sampled setting and needs testing elsewhere.",
          "Every urban site will show the same pattern.",
          "The pattern must reverse in winter.",
          "The omitted settings make the sampled recordings nonexistent."
        ],
        "answer": 0,
        "hint": "Separate an open generalization from an unsupported prediction.",
        "explanation": "Both paragraphs support a bounded observed association and an open question about generalization.",
        "feedback": [
          "This retains the result and the boundary.",
          "Urban locations were not sampled.",
          "No winter prediction is established.",
          "Incomplete scope does not erase the recordings."
        ],
        "sourceUrls": [
          "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/dat_candidate_guide.pdf"
        ],
        "passageId": "cont-rc-claim-limits-c3-passage",
        "passage": {
          "title": "Original fictional report: The evening survey",
          "paragraphs": [
            "An acoustic survey sampled six woodland sites during calm evenings in one summer week. In those recordings, a particular call pattern appeared more often at the three sites near streams. The same recorder model and observation interval were used at each site.",
            "The study did not include windy evenings, winter conditions or urban locations. Its authors say the observed pattern justifies testing whether the association persists in other settings. They do not predict the call frequency for those unobserved settings."
          ]
        },
        "sourceId": "cont-rc-claim-limits-c3",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "cont-rc-claim-limits-l1",
        "objectiveId": "rc-claim-limits",
        "world": "rc",
        "pool": "later",
        "familyId": "rc-limits-aggregate-individual",
        "familyRationale": "Reserved transfer: a group average cannot establish every individual comparison; explicit distribution evidence is supplied.",
        "prompt": "Which statement is contradicted by the report?",
        "choices": [
          "U had the higher group average.",
          "The observed ranges include at least one U rod weaker than a V rod.",
          "A group average alone does not specify an individual rod’s load.",
          "Every tested U rod tolerated a larger load than every tested V rod."
        ],
        "answer": 3,
        "hint": "Use the particular crossing pair, not just the mean.",
        "explanation": "P1 explicitly supplies a U–V pair in the reverse order, which defeats the every-rod claim even though U has the higher mean.",
        "feedback": [
          "P1 directly states this.",
          "The weakest U and strongest V provide that pair.",
          "P2 states the individual-outcome limit.",
          "The crossing pair in P1 is a counterexample."
        ],
        "sourceUrls": [
          "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/dat_candidate_guide.pdf"
        ],
        "passageId": "cont-rc-claim-limits-l1-passage",
        "passage": {
          "title": "Original fictional report: The average conceals a crossing",
          "paragraphs": [
            "Two fabrication methods produced five test rods each. Method U had a higher average breaking load than Method V. The report then notes that the weakest U rod broke at a lower load than the strongest V rod. All loads were measured with the same apparatus.",
            "The authors distinguish ranking average performance from guaranteeing an outcome for every rod. A buyer selecting one rod would not know its exact load tolerance solely from the method’s average. The report makes no claim that every U rod outperformed every V rod."
          ]
        },
        "sourceId": "cont-rc-claim-limits-l1",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      },
      {
        "id": "cont-rc-claim-limits-l2",
        "objectiveId": "rc-claim-limits",
        "world": "rc",
        "pool": "later",
        "familyId": "rc-limits-joint-guarantee-from-separate-subsets",
        "familyRationale": "Reserved transfer: separate existence statements do not guarantee that one object has both properties.",
        "prompt": "Which conclusion follows from the summary alone?",
        "choices": [
          "Exactly one panel passed both tests.",
          "No panel passed both tests.",
          "Whether any panel passed both tests is unresolved.",
          "All ten panels passed both tests."
        ],
        "answer": 2,
        "hint": "Ask whether the two successes must belong to the same panel.",
        "explanation": "The two existence claims do not specify whether their successful panels overlap; P2 states that unresolved question.",
        "feedback": [
          "The overlap and its size are not given.",
          "Disjoint successes are possible, but not established.",
          "Either overlapping or separate successful panels fit the summary.",
          "Separate at-least-one statements do not imply all ten."
        ],
        "sourceUrls": [
          "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/dat_candidate_guide.pdf"
        ],
        "passageId": "cont-rc-claim-limits-l2-passage",
        "passage": {
          "title": "Original fictional report: Two successful tests",
          "paragraphs": [
            "A report tested ten prototype panels. At least one panel passed a heat test, and at least one panel passed an impact test. The summary does not identify which panels passed either test or give the overlap between the passing groups. It says no more about the individual test records.",
            "The authors need a panel passing both tests for their proposed application. They request the panel-level records before claiming that such a panel has been found. A success in each separate test is encouraging, but the summary alone leaves open whether the same panel succeeded in both."
          ]
        },
        "sourceId": "cont-rc-claim-limits-l2",
        "sourceVersion": "dat-continuation-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
      }
    ],
    "contentSha256": "4b7439e7361ee1c3553df8fb885dfc40cf22c50208e7fe2d351a00d1eb0882f3",
    "reviewStatus": "internal-reviewed",
    "verified": true,
    "progressEligible": true,
    "runtimeIntegrated": true,
    "reviewScope": "Independent internal source, answer-key, family and applicable figure review. No external specialist certification or DAT-readiness claim."
  }
];
