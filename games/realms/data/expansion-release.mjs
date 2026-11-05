// Generated from pinned independently reviewed DAT chapter drafts.
// Internal review only; source authoring modules are not runtime content.
export const expansionChapters = [
  {
    "id": "bio-enzyme-workshop",
    "world": "bio",
    "title": "The Enzyme Workshop",
    "objectiveIds": [
      "bio-enzyme-rate",
      "bio-enzyme-inhibition"
    ],
    "scope": "Two introductory enzyme-rate objectives; no whole-biochemistry completion or diagnostic claims.",
    "canon": {
      "id": "bio-enzyme-kinetics",
      "version": "0.2.1",
      "sourceRelativePath": "visuals/sheets/bio/bio-enzyme-kinetics.json",
      "sourceSha256": "d75fd5c08479e175ab9eb8f247375f46df13cc552f17bb64f787b89b87985ae9"
    },
    "objectives": [
      {
        "id": "bio-enzyme-rate",
        "world": "bio",
        "name": "Read a simple enzyme rate curve",
        "lesson": "For a single-substrate Michaelis-Menten model, initial rate v = Vmax[S]/(Km + [S]). [S] is substrate concentration. Vmax is the limiting rate at substrate saturation, and Km is the substrate concentration at half Vmax. Km is not universally a binding dissociation constant. At fixed enzyme properties, adding enzyme raises Vmax in proportion to active enzyme amount and leaves Km unchanged.",
        "sourceUrls": [
          "https://www.ncbi.nlm.nih.gov/books/NBK554481/",
          "https://iubmb.qmul.ac.uk/kinetics/ek4t6.html"
        ],
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key and task-family review. Not external subject-specialist certification or a learner efficacy study."
      },
      {
        "id": "bio-enzyme-inhibition",
        "world": "bio",
        "name": "Distinguish two specified reversible inhibition models",
        "lesson": "In the simple reversible competitive model, apparent Km rises while Vmax stays the same. In the pure noncompetitive model, Vmax falls while Km stays the same. Compare the entire rate-versus-substrate pattern: a lower rate at one concentration alone cannot distinguish them. Binding away from the active site alone does not establish pure noncompetitive behavior; mixed inhibition also exists.",
        "sourceUrls": [
          "https://www.ncbi.nlm.nih.gov/books/NBK554481/",
          "https://iubmb.qmul.ac.uk/kinetics/ek4t6.html"
        ],
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key and task-family review. Not external subject-specialist certification or a learner efficacy study."
      }
    ],
    "teachingByObjective": {
      "bio-enzyme-rate": {
        "objectiveId": "bio-enzyme-rate",
        "version": 1,
        "core": "For a single-substrate Michaelis-Menten model, initial rate v = Vmax[S]/(Km + [S]). [S] is substrate concentration. Vmax is the limiting rate at substrate saturation, and Km is the substrate concentration at half Vmax. Km is not universally a binding dissociation constant. At fixed enzyme properties, adding enzyme raises Vmax in proportion to active enzyme amount and leaves Km unchanged.",
        "terms": [
          {
            "term": "Substrate",
            "meaning": "The reactant whose conversion this enzyme catalyzes."
          },
          {
            "term": "Initial rate",
            "meaning": "Product formed per unit time near the start of the reaction."
          },
          {
            "term": "Saturation",
            "meaning": "Enough substrate that extra substrate makes progressively less difference to rate."
          },
          {
            "term": "Vmax",
            "meaning": "The limiting initial rate at fixed active enzyme amount."
          },
          {
            "term": "Km",
            "meaning": "Substrate concentration where this model reaches half Vmax."
          }
        ],
        "assumptions": [
          "Initial rates; one substrate; Michaelis-Menten behavior without cooperativity.",
          "Temperature, pH and other conditions stay fixed. No substrate depletion or enzyme damage during a rate measurement."
        ],
        "workedExample": {
          "prompt": "A model enzyme has Vmax = 90 units/min and Km = 6 mM. Predict the rate at 3 mM substrate.",
          "steps": [
            "Insert the substrate concentration, not enzyme concentration, into [S].",
            "Compute 90 × 3/(6 + 3) = 270/9.",
            "At half of Km, the rate is one-third of Vmax, not one-half."
          ],
          "answer": "30 units/min.",
          "familyId": "bio-enzyme-worked-direct-substitution",
          "role": "instruction-only"
        },
        "commonMistake": "A substrate concentration and a reaction rate have different units.",
        "nextAction": "Locate the ceiling, then compare [S] with the half-maximum concentration.",
        "sourceUrls": [
          "https://www.ncbi.nlm.nih.gov/books/NBK554481/",
          "https://iubmb.qmul.ac.uk/kinetics/ek4t6.html"
        ],
        "canon": {
          "id": "bio-enzyme-kinetics",
          "version": "0.2.1",
          "sourceRelativePath": "visuals/sheets/bio/bio-enzyme-kinetics.json",
          "sourceSha256": "d75fd5c08479e175ab9eb8f247375f46df13cc552f17bb64f787b89b87985ae9",
          "sourceRepository": "ace-system",
          "adaptationVersion": 1,
          "reviewScope": "Initial-rate saturation, half-maximal concentration and active-enzyme amount; no affinity shortcut or reciprocal-plot assessment.",
          "importsSourceAssessments": false,
          "formativeCanonChecksProgressEligible": false
        },
        "canonIntegration": "integrated-selected-scope",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key and task-family review. Not external subject-specialist certification or a learner efficacy study."
      },
      "bio-enzyme-inhibition": {
        "objectiveId": "bio-enzyme-inhibition",
        "version": 1,
        "core": "In the simple reversible competitive model, apparent Km rises while Vmax stays the same. In the pure noncompetitive model, Vmax falls while Km stays the same. Compare the entire rate-versus-substrate pattern: a lower rate at one concentration alone cannot distinguish them. Binding away from the active site alone does not establish pure noncompetitive behavior; mixed inhibition also exists.",
        "terms": [
          {
            "term": "Inhibitor",
            "meaning": "A substance that reduces the measured reaction rate under specified conditions."
          },
          {
            "term": "Apparent Km",
            "meaning": "The half-maximum substrate concentration measured under the inhibitor condition."
          },
          {
            "term": "Competitive model",
            "meaning": "Substrate and inhibitor compete for enzyme binding in this stated model."
          },
          {
            "term": "Pure noncompetitive model",
            "meaning": "A particular reversible model with reduced Vmax and unchanged Km."
          }
        ],
        "assumptions": [
          "Initial rates; one substrate; Michaelis-Menten behavior without cooperativity.",
          "Temperature, pH and other conditions stay fixed. No substrate depletion or enzyme damage during a rate measurement.",
          "Only the stated ideal models are compared; concentrations refer to separate initial-rate assays."
        ],
        "workedExample": {
          "prompt": "An enzyme alone approaches 40 units/min and reaches 20 units/min at 5 mM. With reagent R it approaches 20 units/min and reaches 10 units/min at 5 mM. Which stated model fits?",
          "steps": [
            "Read Vmax separately for each curve: 40 and 20.",
            "For each curve, find its own half-maximum: both occur at 5 mM.",
            "A lower Vmax with unchanged Km matches the pure noncompetitive model."
          ],
          "answer": "Pure noncompetitive behavior in the stated model.",
          "familyId": "bio-inhibition-worked-halving-curve",
          "role": "instruction-only"
        },
        "commonMistake": "Comparing both curves at half of the original Vmax uses the wrong reference for the inhibited curve.",
        "nextAction": "Compare each curve’s plateau and its own half-plateau concentration.",
        "sourceUrls": [
          "https://www.ncbi.nlm.nih.gov/books/NBK554481/",
          "https://iubmb.qmul.ac.uk/kinetics/ek4t6.html"
        ],
        "canon": {
          "id": "bio-enzyme-kinetics",
          "version": "0.2.1",
          "sourceRelativePath": "visuals/sheets/bio/bio-enzyme-kinetics.json",
          "sourceSha256": "d75fd5c08479e175ab9eb8f247375f46df13cc552f17bb64f787b89b87985ae9",
          "sourceRepository": "ace-system",
          "adaptationVersion": 1,
          "reviewScope": "Competitive and explicitly pure noncompetitive initial-rate models only; no claim that every allosteric inhibitor has this pattern.",
          "importsSourceAssessments": false,
          "formativeCanonChecksProgressEligible": false
        },
        "canonIntegration": "integrated-selected-scope",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key and task-family review. Not external subject-specialist certification or a learner efficacy study."
      }
    },
    "items": [
      {
        "id": "next-bio-enzyme-rate-p1",
        "objectiveId": "bio-enzyme-rate",
        "familyId": "bio-rate-halfmax-interpretation",
        "familyRationale": "Locate half of a supplied plateau; shared with the later check that infers Km from tabulated rates.",
        "world": "bio",
        "pool": "practice",
        "prompt": "A single-substrate enzyme curve approaches 64 units/min. It reaches 32 units/min at 7 mM substrate. What is Km?",
        "choices": [
          "7 mM",
          "32 units/min",
          "64 mM",
          "14 mM"
        ],
        "answer": 0,
        "hint": "Km has concentration units.",
        "explanation": "Half of 64 is 32, reached at 7 mM; therefore Km = 7 mM.",
        "feedback": [
          "Correct: 7 mM is the substrate concentration at half-maximum rate.",
          "32 is a rate, not a substrate concentration.",
          "64 is the numerical plateau rate with the wrong units.",
          "Doubling the half-maximum concentration does not define Km."
        ],
        "sourceUrls": [
          "https://www.ncbi.nlm.nih.gov/books/NBK554481/",
          "https://iubmb.qmul.ac.uk/kinetics/ek4t6.html"
        ],
        "canonId": "bio-enzyme-kinetics",
        "sourceId": "next-bio-enzyme-rate-p1",
        "sourceVersion": "dat-expansion-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key and task-family review. Not external subject-specialist certification or a learner efficacy study."
      },
      {
        "id": "next-bio-enzyme-rate-p2",
        "objectiveId": "bio-enzyme-rate",
        "familyId": "bio-rate-saturation-reasoning",
        "familyRationale": "Qualitative saturation reasoning rather than substituting a new number into an equation.",
        "world": "bio",
        "pool": "practice",
        "prompt": "The same amount of an enzyme is already nearly saturated with substrate. Which prediction fits the Michaelis-Menten model if substrate is doubled?",
        "choices": [
          "The rate must exactly double.",
          "The rate increases only slightly toward the same Vmax.",
          "Vmax doubles because substrate doubled.",
          "The rate becomes zero because every enzyme is occupied."
        ],
        "answer": 1,
        "hint": "Ask whether extra substrate creates more active enzyme.",
        "explanation": "Near saturation, active enzyme amount limits the rate. More substrate produces little additional increase.",
        "feedback": [
          "Exact doubling approximates a low-substrate regime, not saturation.",
          "Correct: the curve approaches its existing plateau.",
          "Vmax is fixed by active enzyme amount and properties here.",
          "An occupied active site can turn substrate into product; occupancy is not inactivity."
        ],
        "sourceUrls": [
          "https://www.ncbi.nlm.nih.gov/books/NBK554481/",
          "https://iubmb.qmul.ac.uk/kinetics/ek4t6.html"
        ],
        "canonId": "bio-enzyme-kinetics",
        "sourceId": "next-bio-enzyme-rate-p2",
        "sourceVersion": "dat-expansion-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key and task-family review. Not external subject-specialist certification or a learner efficacy study."
      },
      {
        "id": "next-bio-enzyme-rate-c1",
        "objectiveId": "bio-enzyme-rate",
        "familyId": "bio-rate-halfmax-interpretation",
        "familyRationale": "Same interpretive family as p1 despite a table presentation; not credited as novel transfer.",
        "world": "bio",
        "pool": "check",
        "prompt": "Initial rates at substrate concentrations 1, 4 and 12 mM are 12, 30 and 45 units/min. A separate saturation measurement gives Vmax = 60 units/min. Which Km is supported?",
        "choices": [
          "1 mM",
          "12 mM",
          "4 mM",
          "30 mM"
        ],
        "answer": 2,
        "hint": "Find half of the measured saturation rate.",
        "explanation": "Half of 60 is 30 units/min, occurring at 4 mM.",
        "feedback": [
          "At 1 mM the rate is 12, below half-maximum.",
          "At 12 mM the rate is 45, above half-maximum.",
          "Correct: the half-maximum rate occurs at 4 mM.",
          "30 is a rate from the table, not its substrate concentration."
        ],
        "sourceUrls": [
          "https://www.ncbi.nlm.nih.gov/books/NBK554481/",
          "https://iubmb.qmul.ac.uk/kinetics/ek4t6.html"
        ],
        "canonId": "bio-enzyme-kinetics",
        "sourceId": "next-bio-enzyme-rate-c1",
        "sourceVersion": "dat-expansion-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key and task-family review. Not external subject-specialist certification or a learner efficacy study."
      },
      {
        "id": "next-bio-enzyme-rate-c2",
        "objectiveId": "bio-enzyme-rate",
        "familyId": "bio-rate-saturation-reasoning",
        "familyRationale": "Same saturation concept as p2; enzyme amount and substrate are held apart.",
        "world": "bio",
        "pool": "check",
        "prompt": "A model curve flattens near its maximum. A learner says, “Every extra 1 mM of substrate must add the same amount of rate.” Which correction is justified?",
        "choices": [
          "Rate gains get smaller as saturation is approached.",
          "The curve must be a straight line at every concentration.",
          "Every extra substrate molecule destroys an enzyme.",
          "The plateau proves the reaction is at equilibrium."
        ],
        "answer": 0,
        "hint": "A flatter curve means a smaller change in rate for a given change in concentration.",
        "explanation": "The Michaelis-Menten curve has diminishing rate increases as substrate rises at fixed enzyme amount.",
        "feedback": [
          "Correct: approaching saturation reduces the marginal rate increase.",
          "A straight line misses the specified saturation behavior.",
          "Nothing states enzyme destruction.",
          "A saturated initial-rate assay is not evidence of chemical equilibrium."
        ],
        "sourceUrls": [
          "https://www.ncbi.nlm.nih.gov/books/NBK554481/",
          "https://iubmb.qmul.ac.uk/kinetics/ek4t6.html"
        ],
        "canonId": "bio-enzyme-kinetics",
        "sourceId": "next-bio-enzyme-rate-c2",
        "sourceVersion": "dat-expansion-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key and task-family review. Not external subject-specialist certification or a learner efficacy study."
      },
      {
        "id": "next-bio-enzyme-rate-l1",
        "objectiveId": "bio-enzyme-rate",
        "familyId": "bio-rate-enzyme-amount-perturbation",
        "familyRationale": "Novel comparison of two enzyme preparations at several substrate concentrations; not a numerical substitution version of the earlier curve-reading items.",
        "world": "bio",
        "pool": "later",
        "prompt": "An investigator doubles the concentration of active enzyme while keeping substrate concentration, volume and all enzyme properties fixed. In separate initial-rate assays at several substrate concentrations, which pattern should result?",
        "choices": [
          "Both Vmax and Km double.",
          "Vmax stays fixed and Km doubles.",
          "Vmax doubles and Km stays fixed.",
          "Both Vmax and Km are halved."
        ],
        "answer": 2,
        "hint": "Separate enzyme quantity from the substrate concentration giving half of that preparation’s plateau.",
        "explanation": "Doubling active enzyme doubles Vmax and the rate at each fixed [S] in this model, while Km remains an enzyme/substrate parameter under unchanged conditions.",
        "feedback": [
          "The enzyme increase does not double Km.",
          "Enzyme amount changes the capacity, not the half-maximum concentration.",
          "Correct: greater capacity, same Km.",
          "Neither stated parameter is halved by adding active enzyme."
        ],
        "sourceUrls": [
          "https://www.ncbi.nlm.nih.gov/books/NBK554481/",
          "https://iubmb.qmul.ac.uk/kinetics/ek4t6.html"
        ],
        "canonId": "bio-enzyme-kinetics",
        "sourceId": "next-bio-enzyme-rate-l1",
        "sourceVersion": "dat-expansion-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key and task-family review. Not external subject-specialist certification or a learner efficacy study."
      },
      {
        "id": "next-bio-enzyme-inhibition-p1",
        "objectiveId": "bio-enzyme-inhibition",
        "familyId": "bio-inhibition-own-halfmax",
        "familyRationale": "Read each condition’s own half-maximum concentration; a shared inference family for p1 and c1.",
        "world": "bio",
        "pool": "practice",
        "prompt": "Control enzyme: plateau 80 units/min; half-plateau at 2 mM. With I: plateau still 80; half-plateau at 8 mM. Which interpretation fits the two specified models?",
        "choices": [
          "Pure noncompetitive: lower Vmax.",
          "Competitive: higher apparent Km with unchanged Vmax.",
          "Competitive: both parameters decrease.",
          "No inhibition can change the curve this way."
        ],
        "answer": 1,
        "hint": "Compare the plateau first, then the half-plateau concentration.",
        "explanation": "Vmax is unchanged and apparent Km rises from 2 to 8 mM, matching the reversible competitive model.",
        "feedback": [
          "The measured plateau did not fall.",
          "Correct: this is the stated competitive signature.",
          "Neither parameter decreased.",
          "The competitive model predicts this pattern."
        ],
        "sourceUrls": [
          "https://www.ncbi.nlm.nih.gov/books/NBK554481/",
          "https://iubmb.qmul.ac.uk/kinetics/ek4t6.html"
        ],
        "canonId": "bio-enzyme-kinetics",
        "sourceId": "next-bio-enzyme-inhibition-p1",
        "sourceVersion": "dat-expansion-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key and task-family review. Not external subject-specialist certification or a learner efficacy study."
      },
      {
        "id": "next-bio-enzyme-inhibition-p2",
        "objectiveId": "bio-enzyme-inhibition",
        "familyId": "bio-inhibition-single-point-insufficiency",
        "familyRationale": "Evidence sufficiency at one substrate concentration rather than recognizing a named curve.",
        "world": "bio",
        "pool": "practice",
        "prompt": "At one fixed substrate concentration, reagent J halves the initial rate. No other measurements are provided. What can be concluded about competitive versus pure noncompetitive inhibition?",
        "choices": [
          "J must be competitive.",
          "J must be pure noncompetitive.",
          "Both models are ruled out.",
          "The single rate measurement does not distinguish them."
        ],
        "answer": 3,
        "hint": "Different curves can pass through the same measured point.",
        "explanation": "Either model can reduce rate at a chosen substrate concentration. Plateau and half-maximum behavior are needed to distinguish them.",
        "feedback": [
          "A lower rate alone does not establish an unchanged Vmax.",
          "A lower rate alone does not establish an unchanged Km.",
          "Both stated inhibition models can reduce a rate.",
          "Correct: the evidence does not separate these models."
        ],
        "sourceUrls": [
          "https://www.ncbi.nlm.nih.gov/books/NBK554481/",
          "https://iubmb.qmul.ac.uk/kinetics/ek4t6.html"
        ],
        "canonId": "bio-enzyme-kinetics",
        "sourceId": "next-bio-enzyme-inhibition-p2",
        "sourceVersion": "dat-expansion-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key and task-family review. Not external subject-specialist certification or a learner efficacy study."
      },
      {
        "id": "next-bio-enzyme-inhibition-c1",
        "objectiveId": "bio-enzyme-inhibition",
        "familyId": "bio-inhibition-own-halfmax",
        "familyRationale": "Same parameter-identification family as p1; changed format is not new transfer.",
        "world": "bio",
        "pool": "check",
        "prompt": "Without reagent K, Vmax = 54 units/min and Km = 3 mM. With K, Vmax = 27 units/min and Km = 3 mM. Under the stated reversible models, which statement is supported?",
        "choices": [
          "K shows the pure noncompetitive pattern.",
          "K shows the competitive pattern.",
          "K raises the half-maximum substrate concentration.",
          "Enough substrate restores the original 54-unit plateau in this model."
        ],
        "answer": 0,
        "hint": "Compare both parameters, not only the observed rate decrease.",
        "explanation": "The plateau decreases while Km remains 3 mM, the explicitly pure noncompetitive pattern.",
        "feedback": [
          "Correct under the stated model.",
          "Competitive inhibition would preserve Vmax.",
          "Km is explicitly unchanged.",
          "The inhibited model’s limiting rate is 27, not 54."
        ],
        "sourceUrls": [
          "https://www.ncbi.nlm.nih.gov/books/NBK554481/",
          "https://iubmb.qmul.ac.uk/kinetics/ek4t6.html"
        ],
        "canonId": "bio-enzyme-kinetics",
        "sourceId": "next-bio-enzyme-inhibition-c1",
        "sourceVersion": "dat-expansion-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key and task-family review. Not external subject-specialist certification or a learner efficacy study."
      },
      {
        "id": "next-bio-enzyme-inhibition-c2",
        "objectiveId": "bio-enzyme-inhibition",
        "familyId": "bio-inhibition-single-point-insufficiency",
        "familyRationale": "Evidence sufficiency is the same family as p2; binding location alone is also insufficient.",
        "world": "bio",
        "pool": "check",
        "prompt": "A molecule binds away from an enzyme’s substrate-binding site and reduces its activity. Which additional finding is needed before calling the behavior pure noncompetitive in this lesson’s kinetic model?",
        "choices": [
          "The molecule is colored.",
          "Its molecular mass exceeds the substrate’s.",
          "Vmax decreases while Km remains unchanged.",
          "The substrate contains carbon."
        ],
        "answer": 2,
        "hint": "A binding location does not specify both kinetic parameters.",
        "explanation": "Pure noncompetitive describes a particular kinetic pattern, not every inhibitor that binds elsewhere.",
        "feedback": [
          "Color does not establish kinetic parameters.",
          "Molecular mass does not establish this pattern.",
          "Correct: the required kinetic signature must be measured.",
          "The substrate’s carbon content is irrelevant to this distinction."
        ],
        "sourceUrls": [
          "https://www.ncbi.nlm.nih.gov/books/NBK554481/",
          "https://iubmb.qmul.ac.uk/kinetics/ek4t6.html"
        ],
        "canonId": "bio-enzyme-kinetics",
        "sourceId": "next-bio-enzyme-inhibition-c2",
        "sourceVersion": "dat-expansion-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key and task-family review. Not external subject-specialist certification or a learner efficacy study."
      },
      {
        "id": "next-bio-enzyme-inhibition-l1",
        "objectiveId": "bio-enzyme-inhibition",
        "familyId": "bio-inhibition-discriminating-experiment",
        "familyRationale": "Novel experimental design: select observations that distinguish two explanations rather than classify given values.",
        "world": "bio",
        "pool": "later",
        "prompt": "Two reagents give identical reduced rates at a low substrate concentration. One is competitive and the other is pure noncompetitive, under the stated models. Which follow-up most directly separates them?",
        "choices": [
          "Measure only that same low-substrate rate again.",
          "Measure rate across increasing substrate concentrations, including near saturation.",
          "Compare the colors of the reagent bottles.",
          "Double both reagents and assume equal effects identify their mechanisms."
        ],
        "answer": 1,
        "hint": "Choose measurements that reveal whether the limiting rate is preserved.",
        "explanation": "A full substrate series reveals whether each curve approaches the control Vmax or a lower plateau; low-substrate rates alone can coincide.",
        "feedback": [
          "Repeating one point improves precision but does not reveal both curve shapes.",
          "Correct: the high-substrate limit separates the two stated models.",
          "Bottle color supplies no kinetic evidence.",
          "Equal effects after changing inhibitor amount do not uniquely distinguish the models."
        ],
        "sourceUrls": [
          "https://www.ncbi.nlm.nih.gov/books/NBK554481/",
          "https://iubmb.qmul.ac.uk/kinetics/ek4t6.html"
        ],
        "canonId": "bio-enzyme-kinetics",
        "sourceId": "next-bio-enzyme-inhibition-l1",
        "sourceVersion": "dat-expansion-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key and task-family review. Not external subject-specialist certification or a learner efficacy study."
      }
    ],
    "contentSha256": "305acdda846a8708edcc8aff5501d073ab242156fd413871e9d6ff8165acfb9a",
    "reviewStatus": "internal-reviewed",
    "verified": true,
    "progressEligible": true,
    "runtimeIntegrated": true,
    "reviewScope": "Independent internal source, answer-key and task-family review. Not external subject-specialist certification or a learner efficacy study."
  },
  {
    "id": "gc-mole-foundry",
    "world": "gc",
    "title": "The Mole Foundry",
    "objectiveIds": [
      "gc-mole-conversion",
      "gc-limiting-reagent"
    ],
    "scope": "Two introductory mole and stoichiometry objectives; theoretical bookkeeping, not laboratory instructions.",
    "canon": {
      "id": "gc-stoichiometry-mole",
      "version": "0.2.1",
      "sourceRelativePath": "visuals/sheets/gchem/gc-stoichiometry-mole.json",
      "sourceSha256": "a13a7eb0d0fdcb9e5f0487971f09c5ecface1ce58c8541fc109b9297fa52e75f"
    },
    "objectives": [
      {
        "id": "gc-mole-conversion",
        "world": "gc",
        "name": "Convert mass, moles and counted entities",
        "lesson": "A mole is a counting unit: 1 mol contains exactly 6.02214076 × 10^23 specified entities. Moles = mass/molar mass. Name the entity: atoms for monatomic elements, molecules for molecular substances, and formula units for ionic compounds. A formula subscript gives the number of that atom per entity; parentheses multiply every enclosed subscript.",
        "sourceUrls": [
          "https://openstax.org/books/chemistry-2e/pages/3-1-formula-mass-and-the-mole-concept"
        ],
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key and task-family review. Not external subject-specialist certification or a learner efficacy study."
      },
      {
        "id": "gc-limiting-reagent",
        "world": "gc",
        "name": "Use balanced ratios to find the limiting reactant",
        "lesson": "Balanced coefficients compare moles, not grams. Divide each available reactant amount in moles by its coefficient; the smallest quotient limits the reaction. Multiply that quotient by a product coefficient for theoretical product moles. Subtract consumed reactants to find leftovers. For a later addition, start with those leftovers, not the original inventory.",
        "sourceUrls": [
          "https://openstax.org/books/chemistry-2e/pages/4-3-reaction-stoichiometry",
          "https://openstax.org/books/chemistry-2e/pages/4-4-reaction-yields"
        ],
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key and task-family review. Not external subject-specialist certification or a learner efficacy study."
      }
    ],
    "teachingByObjective": {
      "gc-mole-conversion": {
        "objectiveId": "gc-mole-conversion",
        "version": 1,
        "core": "A mole is a counting unit: 1 mol contains exactly 6.02214076 × 10^23 specified entities. Moles = mass/molar mass. Name the entity: atoms for monatomic elements, molecules for molecular substances, and formula units for ionic compounds. A formula subscript gives the number of that atom per entity; parentheses multiply every enclosed subscript.",
        "terms": [
          {
            "term": "Mole",
            "meaning": "A fixed number of specified entities, like a counting unit much larger than a dozen."
          },
          {
            "term": "Molar mass",
            "meaning": "Mass in grams of one mole; units g/mol."
          },
          {
            "term": "Formula unit",
            "meaning": "The simplest whole-number ionic ratio, not a discrete molecule."
          },
          {
            "term": "Subscript",
            "meaning": "The small number in a chemical formula that counts an atom within an entity."
          }
        ],
        "assumptions": [
          "Use the molar masses supplied in each question.",
          "Samples are pure unless a mixture is explicitly stated. Count atoms regardless of whether they are bonded."
        ],
        "workedExample": {
          "prompt": "A sample contains 9.2 g of molecular NO2. Use 46 g/mol. How many moles of oxygen atoms does it contain?",
          "steps": [
            "9.2/46 = 0.20 mol of NO2 molecules.",
            "Each NO2 molecule contains two O atoms.",
            "Multiply 0.20 by 2."
          ],
          "answer": "0.40 mol of O atoms.",
          "familyId": "gc-mole-worked-mass-to-atoms",
          "role": "instruction-only"
        },
        "commonMistake": "A subscript changes atom count, not the number of molecules.",
        "nextAction": "Write the entity beside every quantity; convert mass before using subscripts.",
        "sourceUrls": [
          "https://openstax.org/books/chemistry-2e/pages/3-1-formula-mass-and-the-mole-concept"
        ],
        "canon": {
          "id": "gc-stoichiometry-mole",
          "version": "0.2.1",
          "sourceRelativePath": "visuals/sheets/gchem/gc-stoichiometry-mole.json",
          "sourceSha256": "a13a7eb0d0fdcb9e5f0487971f09c5ecface1ce58c8541fc109b9297fa52e75f",
          "sourceRepository": "ace-system",
          "adaptationVersion": 1,
          "reviewScope": "Mass-to-mole conversion and counting atoms in formulas and mixtures.",
          "importsSourceAssessments": false,
          "formativeCanonChecksProgressEligible": false
        },
        "canonIntegration": "integrated-selected-scope",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key and task-family review. Not external subject-specialist certification or a learner efficacy study."
      },
      "gc-limiting-reagent": {
        "objectiveId": "gc-limiting-reagent",
        "version": 1,
        "core": "Balanced coefficients compare moles, not grams. Divide each available reactant amount in moles by its coefficient; the smallest quotient limits the reaction. Multiply that quotient by a product coefficient for theoretical product moles. Subtract consumed reactants to find leftovers. For a later addition, start with those leftovers, not the original inventory.",
        "terms": [
          {
            "term": "Coefficient",
            "meaning": "The number before a formula in a balanced equation; it scales the whole formula."
          },
          {
            "term": "Limiting reactant",
            "meaning": "The reactant exhausted first under the stated complete-reaction model."
          },
          {
            "term": "Theoretical yield",
            "meaning": "The maximum product amount from the available reactants in the stated model."
          },
          {
            "term": "Excess reactant",
            "meaning": "A reactant remaining after the limiting reactant is used."
          }
        ],
        "assumptions": [
          "Equations are balanced as written.",
          "The stated reaction runs to completion with no side reactions or product losses."
        ],
        "workedExample": {
          "prompt": "For 2 Na + Cl2 → 2 NaCl, an inventory has 0.80 mol Na and 0.30 mol Cl2. Find product and leftover reactant.",
          "steps": [
            "Divide available moles by coefficients: Na 0.80/2 = 0.40; Cl2 0.30/1 = 0.30.",
            "The smaller value, 0.30, limits reaction extent.",
            "NaCl formed = 2 × 0.30 = 0.60 mol. Na consumed = 0.60 mol.",
            "Na left = 0.80 − 0.60 = 0.20 mol; Cl2 left = 0."
          ],
          "answer": "0.60 mol NaCl and 0.20 mol Na remaining.",
          "familyId": "gc-limiting-worked-chloride",
          "role": "instruction-only"
        },
        "commonMistake": "The smaller raw mole amount is not always limiting; coefficients matter.",
        "nextAction": "Convert to moles, divide by coefficients, then account for leftovers.",
        "sourceUrls": [
          "https://openstax.org/books/chemistry-2e/pages/4-3-reaction-stoichiometry",
          "https://openstax.org/books/chemistry-2e/pages/4-4-reaction-yields"
        ],
        "canon": {
          "id": "gc-stoichiometry-mole",
          "version": "0.2.1",
          "sourceRelativePath": "visuals/sheets/gchem/gc-stoichiometry-mole.json",
          "sourceSha256": "a13a7eb0d0fdcb9e5f0487971f09c5ecface1ce58c8541fc109b9297fa52e75f",
          "sourceRepository": "ace-system",
          "adaptationVersion": 1,
          "reviewScope": "Balanced mole ratios, residual inventory and a sequential feed; no yield-percent or gas-condition shortcuts.",
          "importsSourceAssessments": false,
          "formativeCanonChecksProgressEligible": false
        },
        "canonIntegration": "integrated-selected-scope",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key and task-family review. Not external subject-specialist certification or a learner efficacy study."
      }
    },
    "items": [
      {
        "id": "next-gc-mole-conversion-p1",
        "objectiveId": "gc-mole-conversion",
        "familyId": "gc-mole-mass-conversion",
        "familyRationale": "Mass divided by molar mass; numeric changes remain this family.",
        "world": "gc",
        "pool": "practice",
        "prompt": "A pure sample contains 12 g of MgO. Use a molar mass of 40 g/mol. How many moles of MgO formula units are present?",
        "choices": [
          "0.30 mol",
          "3.3 mol",
          "480 mol",
          "12 mol"
        ],
        "answer": 0,
        "hint": "Arrange units so grams cancel.",
        "explanation": "12 g ÷ 40 g/mol = 0.30 mol.",
        "feedback": [
          "Correct: mass divided by molar mass.",
          "This reverses the division.",
          "Multiplication gives the wrong units and value.",
          "Grams and moles are different quantities."
        ],
        "sourceUrls": [
          "https://openstax.org/books/chemistry-2e/pages/3-1-formula-mass-and-the-mole-concept"
        ],
        "canonId": "gc-stoichiometry-mole",
        "sourceId": "next-gc-mole-conversion-p1",
        "sourceVersion": "dat-expansion-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key and task-family review. Not external subject-specialist certification or a learner efficacy study."
      },
      {
        "id": "next-gc-mole-conversion-p2",
        "objectiveId": "gc-mole-conversion",
        "familyId": "gc-mole-entity-count",
        "familyRationale": "Translate moles to named entities without confusing formula subscripts.",
        "world": "gc",
        "pool": "practice",
        "prompt": "Let NA denote Avogadro’s constant, with units mol^-1. A sample contains 0.25 mol of CO2 molecules. Which expression gives the number of CO2 molecules?",
        "choices": [
          "0.50 mol × NA",
          "0.25 mol × NA",
          "0.75 mol × NA",
          "1.00 mol × NA"
        ],
        "answer": 1,
        "hint": "The question counts molecules, not their constituent atoms.",
        "explanation": "Multiply 0.25 mol by NA in mol^-1; the mole units cancel to give the molecule count.",
        "feedback": [
          "The oxygen subscript does not double the molecule count.",
          "Correct: multiply moles of molecules by the constant in mol^-1.",
          "0.75 mol × NA would count all atoms in the sample.",
          "This expression counts molecules in one mole, not 0.25 mol."
        ],
        "sourceUrls": [
          "https://openstax.org/books/chemistry-2e/pages/3-1-formula-mass-and-the-mole-concept"
        ],
        "canonId": "gc-stoichiometry-mole",
        "sourceId": "next-gc-mole-conversion-p2",
        "sourceVersion": "dat-expansion-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key and task-family review. Not external subject-specialist certification or a learner efficacy study."
      },
      {
        "id": "next-gc-mole-conversion-c1",
        "objectiveId": "gc-mole-conversion",
        "familyId": "gc-mole-entity-count",
        "familyRationale": "Subscript bookkeeping belongs to the same entity-count family; not a novel delayed task.",
        "world": "gc",
        "pool": "check",
        "prompt": "How many moles of oxygen atoms are contained in 0.40 mol of Ca(NO3)2 formula units?",
        "choices": [
          "0.40 mol",
          "1.2 mol",
          "2.4 mol",
          "0.80 mol"
        ],
        "answer": 2,
        "hint": "Apply the outside 2 to all of NO3.",
        "explanation": "Each formula unit has 2 × 3 = 6 oxygen atoms. 0.40 × 6 = 2.4 mol O atoms.",
        "feedback": [
          "This counts formula units instead of O atoms.",
          "This omits the outside subscript 2.",
          "Correct: six O atoms per formula unit.",
          "This counts the two nitrate groups, not their six O atoms."
        ],
        "sourceUrls": [
          "https://openstax.org/books/chemistry-2e/pages/3-1-formula-mass-and-the-mole-concept"
        ],
        "canonId": "gc-stoichiometry-mole",
        "sourceId": "next-gc-mole-conversion-c1",
        "sourceVersion": "dat-expansion-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key and task-family review. Not external subject-specialist certification or a learner efficacy study."
      },
      {
        "id": "next-gc-mole-conversion-c2",
        "objectiveId": "gc-mole-conversion",
        "familyId": "gc-mole-mass-conversion",
        "familyRationale": "Compare two mass-to-mole conversions; same conversion family rather than new-family credit.",
        "world": "gc",
        "pool": "check",
        "prompt": "Sample A contains 10 g Ar (40 g/mol). Sample B contains 5.0 g Ne (20 g/mol). Which comparison is correct?",
        "choices": [
          "A contains twice as many atoms.",
          "B contains twice as many atoms.",
          "They have equal masses and equal atom counts.",
          "They have equal atom counts but different masses."
        ],
        "answer": 3,
        "hint": "Both gases are monatomic; compare their moles.",
        "explanation": "10/40 = 5/20 = 0.25 mol atoms. The masses remain 10 g and 5 g.",
        "feedback": [
          "A has twice the mass but also twice the molar mass.",
          "B’s lower molar mass is offset by its lower sample mass.",
          "Their given masses are unequal.",
          "Correct: equal moles of monatomic gas mean equal atom counts."
        ],
        "sourceUrls": [
          "https://openstax.org/books/chemistry-2e/pages/3-1-formula-mass-and-the-mole-concept"
        ],
        "canonId": "gc-stoichiometry-mole",
        "sourceId": "next-gc-mole-conversion-c2",
        "sourceVersion": "dat-expansion-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key and task-family review. Not external subject-specialist certification or a learner efficacy study."
      },
      {
        "id": "next-gc-mole-conversion-l1",
        "objectiveId": "gc-mole-conversion",
        "familyId": "gc-mole-mixture-atom-inventory",
        "familyRationale": "Novel aggregation across two different entity types; earlier items concern a single pure compound or compare separate samples.",
        "world": "gc",
        "pool": "later",
        "prompt": "A sealed inventory contains 0.20 mol He atoms and 0.10 mol CH4 molecules. Count all atoms, including atoms bonded within molecules. How many moles of atoms are present in total?",
        "choices": [
          "0.30 mol",
          "0.60 mol",
          "0.70 mol",
          "1.50 mol"
        ],
        "answer": 2,
        "hint": "Count atoms from each component separately, then add.",
        "explanation": "He contributes 0.20 mol atoms. Each CH4 molecule has five atoms, contributing 0.50 mol. Total = 0.70 mol atoms.",
        "feedback": [
          "This adds entities while ignoring atoms within CH4.",
          "This omits carbon from CH4.",
          "Correct: 0.20 + 0.10 × 5 = 0.70.",
          "This incorrectly applies five atoms per entity to the helium too."
        ],
        "sourceUrls": [
          "https://openstax.org/books/chemistry-2e/pages/3-1-formula-mass-and-the-mole-concept"
        ],
        "canonId": "gc-stoichiometry-mole",
        "sourceId": "next-gc-mole-conversion-l1",
        "sourceVersion": "dat-expansion-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key and task-family review. Not external subject-specialist certification or a learner efficacy study."
      },
      {
        "id": "next-gc-limiting-reagent-p1",
        "objectiveId": "gc-limiting-reagent",
        "familyId": "gc-limiting-normalized-inventory",
        "familyRationale": "Normalize available moles by balanced coefficients.",
        "world": "gc",
        "pool": "practice",
        "prompt": "For 2 CO + O2 → 2 CO2, there are 4.0 mol CO and 3.0 mol O2. Which reactant limits product formation?",
        "choices": [
          "CO, because 4.0/2 is smaller than 3.0/1.",
          "O2, because 3.0 is smaller than 4.0.",
          "Both, because all reactions exhaust every reactant.",
          "Neither, because oxygen always remains unlimited."
        ],
        "answer": 0,
        "hint": "Compare moles per stoichiometric coefficient.",
        "explanation": "The normalized amounts are 2.0 for CO and 3.0 for O2. CO is exhausted first.",
        "feedback": [
          "Correct: the smaller normalized amount identifies the limit.",
          "Raw mole counts ignore the 2:1 required ratio.",
          "Excess reactant can remain.",
          "O2 is supplied in a finite amount; its role does not make it unlimited."
        ],
        "sourceUrls": [
          "https://openstax.org/books/chemistry-2e/pages/4-3-reaction-stoichiometry",
          "https://openstax.org/books/chemistry-2e/pages/4-4-reaction-yields"
        ],
        "canonId": "gc-stoichiometry-mole",
        "sourceId": "next-gc-limiting-reagent-p1",
        "sourceVersion": "dat-expansion-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key and task-family review. Not external subject-specialist certification or a learner efficacy study."
      },
      {
        "id": "next-gc-limiting-reagent-p2",
        "objectiveId": "gc-limiting-reagent",
        "familyId": "gc-limiting-yield-leftover",
        "familyRationale": "Compute product and residual inventory after identifying the limit.",
        "world": "gc",
        "pool": "practice",
        "prompt": "For 2 Mg + O2 → 2 MgO, start with 3.0 mol Mg and 1.0 mol O2. What results in the complete-reaction model?",
        "choices": [
          "3.0 mol MgO, no Mg left.",
          "2.0 mol MgO, 1.0 mol Mg left.",
          "1.0 mol MgO, 2.0 mol Mg left.",
          "2.0 mol MgO, 1.0 mol O2 left."
        ],
        "answer": 1,
        "hint": "One mole O2 can consume two moles Mg.",
        "explanation": "O2 limits the reaction: 1.0 mol O2 consumes 2.0 mol Mg and forms 2.0 mol MgO. Mg remaining = 1.0 mol.",
        "feedback": [
          "There is insufficient O2 to consume all three moles Mg.",
          "Correct: the equation conserves both elements.",
          "This ignores the coefficient 2 for MgO and Mg.",
          "The limiting O2 is exhausted, not left over."
        ],
        "sourceUrls": [
          "https://openstax.org/books/chemistry-2e/pages/4-3-reaction-stoichiometry",
          "https://openstax.org/books/chemistry-2e/pages/4-4-reaction-yields"
        ],
        "canonId": "gc-stoichiometry-mole",
        "sourceId": "next-gc-limiting-reagent-p2",
        "sourceVersion": "dat-expansion-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key and task-family review. Not external subject-specialist certification or a learner efficacy study."
      },
      {
        "id": "next-gc-limiting-reagent-c1",
        "objectiveId": "gc-limiting-reagent",
        "familyId": "gc-limiting-normalized-inventory",
        "familyRationale": "Same normalized-inventory family, with an initial mass conversion.",
        "world": "gc",
        "pool": "check",
        "prompt": "For 4 Fe + 3 O2 → 2 Fe2O3, use 5.6 g Fe (56 g/mol) and 0.090 mol O2. Which reactant is limiting?",
        "choices": [
          "O2, since 0.090 is smaller than 0.10.",
          "Both are exactly stoichiometric.",
          "Fe, since 0.10/4 is smaller than 0.090/3.",
          "Fe, since its coefficient is larger, regardless of quantities."
        ],
        "answer": 2,
        "hint": "Convert iron to moles before comparing normalized quantities.",
        "explanation": "Fe amount is 0.10 mol. Fe/4 = 0.025; O2/3 = 0.030. Fe limits.",
        "feedback": [
          "The raw amounts cannot be compared without their coefficients.",
          "The normalized amounts differ.",
          "Correct: 0.025 is the smaller normalized inventory.",
          "A coefficient alone cannot identify the limiting reactant."
        ],
        "sourceUrls": [
          "https://openstax.org/books/chemistry-2e/pages/4-3-reaction-stoichiometry",
          "https://openstax.org/books/chemistry-2e/pages/4-4-reaction-yields"
        ],
        "canonId": "gc-stoichiometry-mole",
        "sourceId": "next-gc-limiting-reagent-c1",
        "sourceVersion": "dat-expansion-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key and task-family review. Not external subject-specialist certification or a learner efficacy study."
      },
      {
        "id": "next-gc-limiting-reagent-c2",
        "objectiveId": "gc-limiting-reagent",
        "familyId": "gc-limiting-yield-leftover",
        "familyRationale": "Same yield-and-leftover family as practice; new numbers are not novelty.",
        "world": "gc",
        "pool": "check",
        "prompt": "For 2 SO2 + O2 → 2 SO3, the inventory is 0.60 mol SO2 and 0.20 mol O2. Which product and leftover amounts follow?",
        "choices": [
          "0.60 mol SO3 and no SO2 left.",
          "0.20 mol SO3 and 0.40 mol SO2 left.",
          "0.40 mol SO3 and 0.20 mol O2 left.",
          "0.40 mol SO3 and 0.20 mol SO2 left."
        ],
        "answer": 3,
        "hint": "The limiting 0.20 mol O2 reacts with twice as many moles SO2.",
        "explanation": "0.20 mol O2 consumes 0.40 mol SO2 and yields 0.40 mol SO3; 0.20 mol SO2 remains.",
        "feedback": [
          "The O2 inventory cannot consume all SO2.",
          "The 2:1 product-to-O2 ratio was omitted.",
          "O2 is the exhausted reactant.",
          "Correct: both product and remaining SO2 follow the balanced ratio."
        ],
        "sourceUrls": [
          "https://openstax.org/books/chemistry-2e/pages/4-3-reaction-stoichiometry",
          "https://openstax.org/books/chemistry-2e/pages/4-4-reaction-yields"
        ],
        "canonId": "gc-stoichiometry-mole",
        "sourceId": "next-gc-limiting-reagent-c2",
        "sourceVersion": "dat-expansion-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key and task-family review. Not external subject-specialist certification or a learner efficacy study."
      },
      {
        "id": "next-gc-limiting-reagent-l1",
        "objectiveId": "gc-limiting-reagent",
        "familyId": "gc-limiting-sequential-feed",
        "familyRationale": "Novel two-stage inventory update: a previous reaction changes which reagent is available for the next step.",
        "world": "gc",
        "pool": "later",
        "prompt": "In a bookkeeping model, 2 X + Y → 2 Z runs to completion from 5.0 mol X and 2.0 mol Y. Then 1.0 mol more Y is added, with no additional X. How much additional Z can form after the addition?",
        "choices": [
          "1.0 mol",
          "2.0 mol",
          "4.0 mol",
          "6.0 mol"
        ],
        "answer": 0,
        "hint": "First find the X left after the first stage; only that X is available for the second.",
        "explanation": "Stage 1 consumes 4.0 mol X and leaves 1.0 mol X. In stage 2, that X consumes 0.50 mol Y and produces 1.0 mol additional Z.",
        "feedback": [
          "Correct: the remaining X now limits the second stage.",
          "This treats the newly added Y as limiting without checking leftover X.",
          "Four moles Z formed in stage 1, not additionally in stage 2.",
          "This counts product that cannot be made from the available X."
        ],
        "sourceUrls": [
          "https://openstax.org/books/chemistry-2e/pages/4-3-reaction-stoichiometry",
          "https://openstax.org/books/chemistry-2e/pages/4-4-reaction-yields"
        ],
        "canonId": "gc-stoichiometry-mole",
        "sourceId": "next-gc-limiting-reagent-l1",
        "sourceVersion": "dat-expansion-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key and task-family review. Not external subject-specialist certification or a learner efficacy study."
      }
    ],
    "contentSha256": "e796770430e2a83342bcade414720e36b56a2b9a8c0fbf853c01a966db310d5b",
    "reviewStatus": "internal-reviewed",
    "verified": true,
    "progressEligible": true,
    "runtimeIntegrated": true,
    "reviewScope": "Independent internal source, answer-key and task-family review. Not external subject-specialist certification or a learner efficacy study."
  },
  {
    "id": "oc-conjugate-court",
    "world": "oc",
    "title": "The Conjugate Court",
    "objectiveIds": [
      "oc-acid-conjugate-pairs",
      "oc-acid-stabilization"
    ],
    "scope": "Two introductory acid–base objectives; orbital factors are defined but no full quantitative solvent-dependent acidity ranking is claimed.",
    "canon": {
      "id": "oc-acidity-cardio",
      "version": "0.2.0",
      "sourceRelativePath": "visuals/sheets/ochem/oc-acidity-cardio.json",
      "sourceSha256": "e3011e256dae3fb5a1d5ef1d527a0520c5602e237aa68a1a1e765503c98469ab"
    },
    "objectives": [
      {
        "id": "oc-acid-conjugate-pairs",
        "world": "oc",
        "name": "Relate conjugate pairs, pKa and proton-transfer direction",
        "lesson": "Removing H+ from an acid leaves its conjugate base: the atom connectivity otherwise stays the same and total charge decreases by one. In the same solvent and conditions, lower pKa means stronger acid and a weaker conjugate base. For HA + B− ⇌ A− + HB, equilibrium favors the side with the weaker acid (higher pKa), using comparable pKa values.",
        "sourceUrls": [
          "https://openstax.org/books/organic-chemistry/pages/2-8-acid-and-base-strength"
        ],
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key and task-family review. Not external subject-specialist certification or a learner efficacy study."
      },
      {
        "id": "oc-acid-stabilization",
        "world": "oc",
        "name": "Use structural evidence without treating CARDIO as an absolute rule",
        "lesson": "Compare the conjugate bases. Charge, the atom bearing charge, resonance, inductive effects through bonds, and orbital character can affect relative stability and acidity. CARDIO is an inspection checklist, not an infallible ranking algorithm. Resonance redistributes electrons without moving atom nuclei. An electron-withdrawing substituent can stabilize a nearby negative charge by induction; its influence usually weakens with distance. When factors compete, use comparable measured pKa data rather than blindly applying a mnemonic.",
        "sourceUrls": [
          "https://openstax.org/books/organic-chemistry/pages/2-8-acid-and-base-strength",
          "https://openstax.org/books/organic-chemistry/pages/20-4-substituent-effects-on-acidity",
          "https://openstax.org/books/organic-chemistry/pages/17-2-properties-of-alcohols-and-phenols",
          "https://openstax.org/books/organic-chemistry/pages/9-7-alkyne-acidity-formation-of-acetylide-anions"
        ],
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key and task-family review. Not external subject-specialist certification or a learner efficacy study."
      }
    ],
    "teachingByObjective": {
      "oc-acid-conjugate-pairs": {
        "objectiveId": "oc-acid-conjugate-pairs",
        "version": 1,
        "core": "Removing H+ from an acid leaves its conjugate base: the atom connectivity otherwise stays the same and total charge decreases by one. In the same solvent and conditions, lower pKa means stronger acid and a weaker conjugate base. For HA + B− ⇌ A− + HB, equilibrium favors the side with the weaker acid (higher pKa), using comparable pKa values.",
        "terms": [
          {
            "term": "Proton, H+",
            "meaning": "A positively charged hydrogen nucleus transferred in a Brønsted acid–base reaction."
          },
          {
            "term": "Conjugate base",
            "meaning": "What remains after an acid donates one H+."
          },
          {
            "term": "pKa",
            "meaning": "A measure of acid strength; lower values mean stronger acids under comparable conditions."
          },
          {
            "term": "Equilibrium favors",
            "meaning": "The product-to-reactant ratio at equilibrium is biased toward that side; it does not mean every molecule reacts."
          }
        ],
        "assumptions": [
          "Compare acids in the same stated solvent and temperature; do not combine pKa tables from different conditions.",
          "Remove only the indicated proton; do not change the carbon skeleton."
        ],
        "workedExample": {
          "prompt": "For fictional acids HX (pKa 5) and HY (pKa 9), predict the favored side of HX + Y− ⇌ X− + HY.",
          "steps": [
            "Identify the acid on each side: HX and HY.",
            "HY has the larger pKa and is the weaker acid.",
            "Proton transfer favors the side containing HY and the weaker base X−."
          ],
          "answer": "The products are favored under the stated comparable conditions.",
          "familyId": "oc-acid-worked-equilibrium",
          "role": "instruction-only"
        },
        "commonMistake": "Stronger acid does not mean stronger conjugate base.",
        "nextAction": "Mark the proton, track charge, then compare the two acids’ pKa values.",
        "sourceUrls": [
          "https://openstax.org/books/organic-chemistry/pages/2-8-acid-and-base-strength"
        ],
        "canon": {
          "id": "oc-acidity-cardio",
          "version": "0.2.0",
          "sourceRelativePath": "visuals/sheets/ochem/oc-acidity-cardio.json",
          "sourceSha256": "e3011e256dae3fb5a1d5ef1d527a0520c5602e237aa68a1a1e765503c98469ab",
          "sourceRepository": "ace-system",
          "adaptationVersion": 1,
          "reviewScope": "Conjugate-pair bookkeeping, relative pKa and equilibrium direction; supplied illustrative pKa values are not a solvent-independent table.",
          "importsSourceAssessments": false,
          "formativeCanonChecksProgressEligible": false
        },
        "canonIntegration": "integrated-selected-scope",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key and task-family review. Not external subject-specialist certification or a learner efficacy study."
      },
      "oc-acid-stabilization": {
        "objectiveId": "oc-acid-stabilization",
        "version": 1,
        "core": "Compare the conjugate bases. Charge, the atom bearing charge, resonance, inductive effects through bonds, and orbital character can affect relative stability and acidity. CARDIO is an inspection checklist, not an infallible ranking algorithm. Resonance redistributes electrons without moving atom nuclei. An electron-withdrawing substituent can stabilize a nearby negative charge by induction; its influence usually weakens with distance. When factors compete, use comparable measured pKa data rather than blindly applying a mnemonic.",
        "terms": [
          {
            "term": "Resonance",
            "meaning": "Alternative electron arrangements for the same connected atoms; the actual species is a resonance hybrid."
          },
          {
            "term": "Induction",
            "meaning": "Electron-density shifts transmitted through sigma bonds."
          },
          {
            "term": "Electron-withdrawing group",
            "meaning": "A substituent that pulls electron density through the relevant mechanism."
          },
          {
            "term": "Orbital character",
            "meaning": "The type of orbital holding an electron pair; it can affect its energy."
          },
          {
            "term": "CARDIO",
            "meaning": "A memory prompt to inspect charge, atom, resonance, dipole/induction and orbital factors; overlapping labels are not independent scores."
          }
        ],
        "assumptions": [
          "Compare acids in the same stated solvent and temperature; do not combine pKa tables from different conditions.",
          "Remove only the indicated proton; do not change the carbon skeleton.",
          "Use matched comparisons; a named group or a count of drawings alone cannot decide every acidity order."
        ],
        "workedExample": {
          "prompt": "Two otherwise matched carboxylic acids place the same electron-withdrawing substituent either nearer to or farther from COOH. Predict the inductive contribution.",
          "steps": [
            "Remove the O–H proton to compare conjugate bases.",
            "The nearer substituent transmits a stronger electron-withdrawing influence through fewer bonds.",
            "That influence tends to stabilize the carboxylate relative to the acid and favor acidity; other factors are held matched."
          ],
          "answer": "The nearer substituent gives the larger acidity-enhancing inductive contribution.",
          "familyId": "oc-acid-worked-inductive-distance",
          "role": "instruction-only"
        },
        "commonMistake": "A resonance arrow moves electrons, not a hydrogen atom; a mnemonic is not measured evidence.",
        "nextAction": "Draw the conjugate bases and identify one controlled structural difference.",
        "sourceUrls": [
          "https://openstax.org/books/organic-chemistry/pages/2-8-acid-and-base-strength",
          "https://openstax.org/books/organic-chemistry/pages/20-4-substituent-effects-on-acidity",
          "https://openstax.org/books/organic-chemistry/pages/17-2-properties-of-alcohols-and-phenols",
          "https://openstax.org/books/organic-chemistry/pages/9-7-alkyne-acidity-formation-of-acetylide-anions"
        ],
        "canon": {
          "id": "oc-acidity-cardio",
          "version": "0.2.0",
          "sourceRelativePath": "visuals/sheets/ochem/oc-acidity-cardio.json",
          "sourceSha256": "e3011e256dae3fb5a1d5ef1d527a0520c5602e237aa68a1a1e765503c98469ab",
          "sourceRepository": "ace-system",
          "adaptationVersion": 1,
          "reviewScope": "Conjugate-base resonance and distance-dependent induction, with explicit limits on mnemonic precedence.",
          "importsSourceAssessments": false,
          "formativeCanonChecksProgressEligible": false
        },
        "canonIntegration": "integrated-selected-scope",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key and task-family review. Not external subject-specialist certification or a learner efficacy study."
      }
    },
    "items": [
      {
        "id": "next-oc-acid-conjugate-pairs-p1",
        "objectiveId": "oc-acid-conjugate-pairs",
        "familyId": "oc-acid-proton-charge-bookkeeping",
        "familyRationale": "Remove the indicated proton and track total charge.",
        "world": "oc",
        "pool": "practice",
        "prompt": "Methanol CH3OH loses its O–H proton as H+. What is the conjugate base?",
        "choices": [
          "CH3O−",
          "CH3OH2+",
          "CH2OH− formed by removing C–H",
          "CH3+ + OH−"
        ],
        "answer": 0,
        "hint": "Remove H+, not a neutral H atom, from the stated bond.",
        "explanation": "Removing the O–H proton leaves CH3O− with the original carbon–oxygen connection.",
        "feedback": [
          "Correct: the remaining O bears the negative charge.",
          "This adds a proton rather than removing one.",
          "The stem specifies the O–H proton, not a C–H proton.",
          "Conjugate-base formation here does not break the C–O bond."
        ],
        "sourceUrls": [
          "https://openstax.org/books/organic-chemistry/pages/2-8-acid-and-base-strength"
        ],
        "canonId": "oc-acidity-cardio",
        "sourceId": "next-oc-acid-conjugate-pairs-p1",
        "sourceVersion": "dat-expansion-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key and task-family review. Not external subject-specialist certification or a learner efficacy study."
      },
      {
        "id": "next-oc-acid-conjugate-pairs-p2",
        "objectiveId": "oc-acid-conjugate-pairs",
        "familyId": "oc-acid-pka-relative-strength",
        "familyRationale": "Use supplied comparable pKa values to identify relative acid/base strength.",
        "world": "oc",
        "pool": "practice",
        "prompt": "In one solvent, fictional acids HA and HB have pKa values 6 and 11, respectively. Which statement follows?",
        "choices": [
          "HB is stronger, and B− is weaker.",
          "HA is stronger, and A− is weaker than B−.",
          "HA and HB have equal strength because both contain H.",
          "HA is stronger, and A− is stronger than B−."
        ],
        "answer": 1,
        "hint": "Acid strength and conjugate-base strength run in opposite directions.",
        "explanation": "The lower pKa makes HA the stronger acid; its conjugate base A− is the weaker base.",
        "feedback": [
          "This reverses the pKa ordering.",
          "Correct: stronger acid, weaker conjugate base.",
          "The presence of H alone does not set acid strength.",
          "This gets acid strength right but reverses the conjugate-base relation."
        ],
        "sourceUrls": [
          "https://openstax.org/books/organic-chemistry/pages/2-8-acid-and-base-strength"
        ],
        "canonId": "oc-acidity-cardio",
        "sourceId": "next-oc-acid-conjugate-pairs-p2",
        "sourceVersion": "dat-expansion-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key and task-family review. Not external subject-specialist certification or a learner efficacy study."
      },
      {
        "id": "next-oc-acid-conjugate-pairs-c1",
        "objectiveId": "oc-acid-conjugate-pairs",
        "familyId": "oc-acid-proton-charge-bookkeeping",
        "familyRationale": "Same proton/charge bookkeeping with a positively charged acid.",
        "world": "oc",
        "pool": "check",
        "prompt": "The ion CH3NH3+ loses one N–H proton as H+. Which conjugate base remains?",
        "choices": [
          "CH3NH3−",
          "CH3NH2−",
          "CH3NH2",
          "CH3NH4^2+"
        ],
        "answer": 2,
        "hint": "Subtract one H+ from a species whose initial charge is +1.",
        "explanation": "Loss of one H+ reduces the total charge from +1 to 0 and gives CH3NH2.",
        "feedback": [
          "This changes charge without removing the stated proton.",
          "The starting +1 charge minus +1 gives zero, not −1.",
          "Correct: neutral methylamine is the conjugate base.",
          "This adds a proton and positive charge."
        ],
        "sourceUrls": [
          "https://openstax.org/books/organic-chemistry/pages/2-8-acid-and-base-strength"
        ],
        "canonId": "oc-acidity-cardio",
        "sourceId": "next-oc-acid-conjugate-pairs-c1",
        "sourceVersion": "dat-expansion-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key and task-family review. Not external subject-specialist certification or a learner efficacy study."
      },
      {
        "id": "next-oc-acid-conjugate-pairs-c2",
        "objectiveId": "oc-acid-conjugate-pairs",
        "familyId": "oc-acid-pka-relative-strength",
        "familyRationale": "Same pKa relation despite asking from the conjugate-base side.",
        "world": "oc",
        "pool": "check",
        "prompt": "Fictional acids HP, HQ and HR have pKa values 4, 8 and 12 in the same solvent. Which conjugate base is weakest?",
        "choices": [
          "R−",
          "Q−",
          "All are equal.",
          "P−"
        ],
        "answer": 3,
        "hint": "Find the strongest acid first.",
        "explanation": "HP has the lowest pKa and is the strongest acid, so P− is the weakest conjugate base.",
        "feedback": [
          "R− belongs to the weakest acid and is the strongest of these bases.",
          "Q− has intermediate base strength.",
          "The different comparable pKa values imply different strengths.",
          "Correct: P− is paired with the strongest acid."
        ],
        "sourceUrls": [
          "https://openstax.org/books/organic-chemistry/pages/2-8-acid-and-base-strength"
        ],
        "canonId": "oc-acidity-cardio",
        "sourceId": "next-oc-acid-conjugate-pairs-c2",
        "sourceVersion": "dat-expansion-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key and task-family review. Not external subject-specialist certification or a learner efficacy study."
      },
      {
        "id": "next-oc-acid-conjugate-pairs-l1",
        "objectiveId": "oc-acid-conjugate-pairs",
        "familyId": "oc-acid-selective-base-design",
        "familyRationale": "Novel constrained selection: one candidate must satisfy two opposite equilibrium-direction requirements rather than classify a single given transfer.",
        "world": "oc",
        "pool": "later",
        "prompt": "Fictional acids HJ and HK have pKa values 6 and 15 in one solvent. Choose a base B− whose proton transfer with HJ favors products but whose proton transfer with HK favors reactants. Which supplied pKa for its conjugate acid HB meets both requirements?",
        "choices": [
          "3",
          "10",
          "18",
          "6"
        ],
        "answer": 1,
        "hint": "Write the two requirements separately: HB must be weaker than HJ but stronger than HK.",
        "explanation": "A suitable HB has pKa between 6 and 15. With pKa 10, HJ + B− favors the weaker acid HB; HK + B− favors the weaker acid HK on the reactant side.",
        "feedback": [
          "At pKa 3, HB is stronger than HJ, so the first requirement fails.",
          "Correct: 6 < 10 < 15 satisfies both opposite equilibrium directions.",
          "At pKa 18, proton transfer from HK would also favor products.",
          "At pKa 6, the first comparison has equal pKa rather than the requested product-favored equilibrium."
        ],
        "sourceUrls": [
          "https://openstax.org/books/organic-chemistry/pages/2-8-acid-and-base-strength"
        ],
        "canonId": "oc-acidity-cardio",
        "sourceId": "next-oc-acid-conjugate-pairs-l1",
        "sourceVersion": "dat-expansion-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key and task-family review. Not external subject-specialist certification or a learner efficacy study."
      },
      {
        "id": "next-oc-acid-stabilization-p1",
        "objectiveId": "oc-acid-stabilization",
        "familyId": "oc-acid-resonance-comparison",
        "familyRationale": "Distinguish a conjugated phenoxide base from a nonconjugated alkoxide.",
        "world": "oc",
        "pool": "practice",
        "prompt": "Compare phenol (OH directly attached to a benzene ring) with cyclohexanol (OH attached to a saturated six-carbon ring), under comparable conditions. Which feature helps explain phenol’s greater acidity?",
        "choices": [
          "Its conjugate base loses its oxygen atom.",
          "Its conjugate base can delocalize electron density into the conjugated ring.",
          "Cyclohexanol has no O–H bond.",
          "The benzene ring makes phenol a positively charged acid."
        ],
        "answer": 1,
        "hint": "Compare the structures after removing the O–H proton.",
        "explanation": "Phenoxide has resonance delocalization involving the conjugated ring; the saturated cyclohexoxide ring does not provide the same conjugated pathway.",
        "feedback": [
          "The oxygen remains in the conjugate base.",
          "Correct: this is a relevant stabilization difference.",
          "Cyclohexanol is an alcohol and has the stated O–H bond.",
          "Both compared neutral acids are uncharged."
        ],
        "sourceUrls": [
          "https://openstax.org/books/organic-chemistry/pages/2-8-acid-and-base-strength",
          "https://openstax.org/books/organic-chemistry/pages/20-4-substituent-effects-on-acidity",
          "https://openstax.org/books/organic-chemistry/pages/17-2-properties-of-alcohols-and-phenols",
          "https://openstax.org/books/organic-chemistry/pages/9-7-alkyne-acidity-formation-of-acetylide-anions"
        ],
        "canonId": "oc-acidity-cardio",
        "sourceId": "next-oc-acid-stabilization-p1",
        "sourceVersion": "dat-expansion-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key and task-family review. Not external subject-specialist certification or a learner efficacy study."
      },
      {
        "id": "next-oc-acid-stabilization-p2",
        "objectiveId": "oc-acid-stabilization",
        "familyId": "oc-acid-inductive-distance",
        "familyRationale": "Compare the same electron-withdrawing substituent at different distances; no absolute mnemonic rank.",
        "world": "oc",
        "pool": "practice",
        "prompt": "Compare 2-chlorobutanoic acid, CH3CH2CH(Cl)COOH, with 4-chlorobutanoic acid, ClCH2CH2CH2COOH. Which has the stronger acidity-enhancing inductive effect from chlorine?",
        "choices": [
          "The 4-chloro acid, because the chain is longer.",
          "They must be identical because both contain one Cl.",
          "The 2-chloro acid, because Cl is closer through the bonds to COOH.",
          "Neither: induction requires a double bond between Cl and O."
        ],
        "answer": 2,
        "hint": "Count the bond separation from the substituent to the acidic group.",
        "explanation": "The same electron-withdrawing substituent exerts a stronger inductive effect when closer to the carboxyl group.",
        "feedback": [
          "Both have four-carbon chains; position is the relevant difference.",
          "The number of substituents alone ignores distance.",
          "Correct: the nearer chlorine has the stronger inductive influence.",
          "Induction is transmitted through sigma bonds; this double bond is unnecessary."
        ],
        "sourceUrls": [
          "https://openstax.org/books/organic-chemistry/pages/2-8-acid-and-base-strength",
          "https://openstax.org/books/organic-chemistry/pages/20-4-substituent-effects-on-acidity",
          "https://openstax.org/books/organic-chemistry/pages/17-2-properties-of-alcohols-and-phenols",
          "https://openstax.org/books/organic-chemistry/pages/9-7-alkyne-acidity-formation-of-acetylide-anions"
        ],
        "canonId": "oc-acidity-cardio",
        "sourceId": "next-oc-acid-stabilization-p2",
        "sourceVersion": "dat-expansion-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key and task-family review. Not external subject-specialist certification or a learner efficacy study."
      },
      {
        "id": "next-oc-acid-stabilization-c1",
        "objectiveId": "oc-acid-stabilization",
        "familyId": "oc-acid-resonance-comparison",
        "familyRationale": "Same resonance mechanism, now checking whether a proposed representation preserves atom positions.",
        "world": "oc",
        "pool": "check",
        "prompt": "A learner draws two proposed resonance contributors for a conjugate base, but moves a hydrogen atom from oxygen to carbon in the second drawing. What is the problem?",
        "choices": [
          "Resonance contributors may never move electrons.",
          "All charged structures lack resonance.",
          "Any two structures with the same molecular formula are resonance contributors.",
          "Moving an atom changes more than electron placement, so these are not resonance contributors."
        ],
        "answer": 3,
        "hint": "In resonance, which parts of the structure retain their positions?",
        "explanation": "Resonance contributors preserve atom connectivity and differ in electron placement. Moving a hydrogen between atoms describes a different structural change.",
        "feedback": [
          "Electron placement is what may change.",
          "Many ions are resonance-stabilized.",
          "A shared formula does not guarantee identical connectivity.",
          "Correct: the proposed change moves a nucleus, not just electrons."
        ],
        "sourceUrls": [
          "https://openstax.org/books/organic-chemistry/pages/2-8-acid-and-base-strength",
          "https://openstax.org/books/organic-chemistry/pages/20-4-substituent-effects-on-acidity",
          "https://openstax.org/books/organic-chemistry/pages/17-2-properties-of-alcohols-and-phenols",
          "https://openstax.org/books/organic-chemistry/pages/9-7-alkyne-acidity-formation-of-acetylide-anions"
        ],
        "canonId": "oc-acidity-cardio",
        "sourceId": "next-oc-acid-stabilization-c1",
        "sourceVersion": "dat-expansion-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key and task-family review. Not external subject-specialist certification or a learner efficacy study."
      },
      {
        "id": "next-oc-acid-stabilization-c2",
        "objectiveId": "oc-acid-stabilization",
        "familyId": "oc-acid-inductive-distance",
        "familyRationale": "Same controlled distance comparison; explicitly distinguishes induction from atom motion.",
        "world": "oc",
        "pool": "check",
        "prompt": "An electron-withdrawing group is moved farther from a carboxyl group along an otherwise matched saturated carbon chain. Which statement best describes the expected inductive contribution?",
        "choices": [
          "It generally becomes weaker with bond distance.",
          "It necessarily becomes stronger with every added bond.",
          "It moves the acidic H atom through the chain by resonance.",
          "It is determined only by the total number of carbon atoms."
        ],
        "answer": 0,
        "hint": "The effect is transmitted through bonds and attenuates with distance.",
        "explanation": "For the matched comparison, the acidity-enhancing inductive contribution decreases as the substituent is placed farther away.",
        "feedback": [
          "Correct: distance attenuates this effect.",
          "This reverses the usual distance dependence.",
          "Induction does not move H nuclei and is not that resonance claim.",
          "Location relative to the acidic group matters."
        ],
        "sourceUrls": [
          "https://openstax.org/books/organic-chemistry/pages/2-8-acid-and-base-strength",
          "https://openstax.org/books/organic-chemistry/pages/20-4-substituent-effects-on-acidity",
          "https://openstax.org/books/organic-chemistry/pages/17-2-properties-of-alcohols-and-phenols",
          "https://openstax.org/books/organic-chemistry/pages/9-7-alkyne-acidity-formation-of-acetylide-anions"
        ],
        "canonId": "oc-acidity-cardio",
        "sourceId": "next-oc-acid-stabilization-c2",
        "sourceVersion": "dat-expansion-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key and task-family review. Not external subject-specialist certification or a learner efficacy study."
      },
      {
        "id": "next-oc-acid-stabilization-l1",
        "objectiveId": "oc-acid-stabilization",
        "familyId": "oc-acid-controlled-comparison-design",
        "familyRationale": "Novel study design: choose a matched structural comparison that isolates inductive distance rather than rank a supplied pair or pKa list.",
        "world": "oc",
        "pool": "later",
        "prompt": "A learner wants to investigate how the distance of one chlorine substituent affects carboxylic-acid acidity. Which comparison best isolates that factor?",
        "choices": [
          "A chlorinated carboxylic acid in water versus an unchlorinated alcohol in another solvent.",
          "Two positional isomers with the same carbon skeleton, one Cl and one COOH, measured in the same solvent and temperature.",
          "An acid with one Cl versus a different acid with three Cl atoms and a longer chain, in different solvents.",
          "The same acid measured at two temperatures, with no structural change."
        ],
        "answer": 1,
        "hint": "A controlled comparison changes the position of the substituent while keeping other relevant conditions matched.",
        "explanation": "Matched positional isomers vary the Cl-to-COOH bond distance while preserving the skeleton, group counts and measurement conditions. That is the least confounded comparison offered.",
        "feedback": [
          "This changes acid class, substitution and solvent together.",
          "Correct: this controls the listed alternatives while varying substituent position.",
          "Several structural and solvent changes prevent isolating distance.",
          "This varies temperature rather than substituent distance."
        ],
        "sourceUrls": [
          "https://openstax.org/books/organic-chemistry/pages/2-8-acid-and-base-strength",
          "https://openstax.org/books/organic-chemistry/pages/20-4-substituent-effects-on-acidity",
          "https://openstax.org/books/organic-chemistry/pages/17-2-properties-of-alcohols-and-phenols",
          "https://openstax.org/books/organic-chemistry/pages/9-7-alkyne-acidity-formation-of-acetylide-anions"
        ],
        "canonId": "oc-acidity-cardio",
        "sourceId": "next-oc-acid-stabilization-l1",
        "sourceVersion": "dat-expansion-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key and task-family review. Not external subject-specialist certification or a learner efficacy study."
      }
    ],
    "contentSha256": "af695aec16171a6bdbfa9590ae9ed255d255f9cc6ce81ddf08c56156ef00f229",
    "reviewStatus": "internal-reviewed",
    "verified": true,
    "progressEligible": true,
    "runtimeIntegrated": true,
    "reviewScope": "Independent internal source, answer-key and task-family review. Not external subject-specialist certification or a learner efficacy study."
  },
  {
    "id": "pat-angle-observatory",
    "world": "pat",
    "title": "The Angle Observatory",
    "objectiveIds": [
      "pat-angle-opening",
      "pat-angle-order"
    ],
    "scope": "Introductory angle discrimination and ordering only; device rendering and these few authored items cannot certify PAT readiness.",
    "canon": {
      "id": "pat-angle-ranking",
      "version": "0.1.1",
      "sourceRelativePath": "visuals/sheets/pat/pat-angle-ranking.json",
      "sourceSha256": "bf50f34064e03bdc6734e97d9aa2372a3521b350dc53c1dc94da3c8e54308d6d"
    },
    "objectives": [
      {
        "id": "pat-angle-opening",
        "world": "pat",
        "name": "Compare angle openings across rotations and unequal arms",
        "lesson": "The minor angle is the smaller opening between two rays meeting at a vertex. Compare that opening, not the distance between the drawn endpoints or the lengths of the arms. Rotating, reflecting, or uniformly scaling the whole diagram does not change the angle. A reference angle can therefore match a differently oriented drawing.",
        "sourceUrls": [
          "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/perceptual_ability_test_section_instructions.pdf",
          "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/dat_candidate_guide.pdf"
        ],
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key and task-family review. Not external subject-specialist certification or a learner efficacy study."
      },
      {
        "id": "pat-angle-order",
        "world": "pat",
        "name": "Assemble a consistent smallest-to-largest angle order",
        "lesson": "An angle ranking lists the openings from smallest to largest. Establish reliable pairwise comparisons, then place every label once. If A is smaller than B and B is smaller than C, A must precede C. Check a proposed order against every known comparison; visual arm length and panel position are not ranking rules.",
        "sourceUrls": [
          "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/perceptual_ability_test_section_instructions.pdf",
          "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/dat_candidate_guide.pdf"
        ],
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key and task-family review. Not external subject-specialist certification or a learner efficacy study."
      }
    ],
    "teachingByObjective": {
      "pat-angle-opening": {
        "objectiveId": "pat-angle-opening",
        "version": 1,
        "core": "The minor angle is the smaller opening between two rays meeting at a vertex. Compare that opening, not the distance between the drawn endpoints or the lengths of the arms. Rotating, reflecting, or uniformly scaling the whole diagram does not change the angle. A reference angle can therefore match a differently oriented drawing.",
        "terms": [
          {
            "term": "Vertex",
            "meaning": "The point where the two arms meet."
          },
          {
            "term": "Ray",
            "meaning": "A direction beginning at the vertex; the drawn length is only a visible sample."
          },
          {
            "term": "Minor angle",
            "meaning": "The smaller opening between the two rays."
          },
          {
            "term": "Reflection",
            "meaning": "A mirror flip, which preserves angle size."
          }
        ],
        "assumptions": [
          "All diagrams show minor angles strictly between 0 and 180 degrees.",
          "Drawn segments indicate rays; their endpoints do not determine the angle size.",
          "Diagrams use equal horizontal and vertical scale; there are no ties except in the explicit matching question."
        ],
        "workedExample": {
          "prompt": "A 70-degree angle is rotated a quarter-turn and both drawn arms are doubled in length. What is its new angle size?",
          "steps": [
            "A rotation changes direction, not the opening between the arms.",
            "Changing the drawn lengths leaves each ray’s direction unchanged.",
            "The opening therefore remains the original size."
          ],
          "answer": "70 degrees.",
          "familyId": "pat-angle-worked-invariance",
          "role": "instruction-only"
        },
        "commonMistake": "A larger gap between distant endpoints can result from longer arms without a larger opening.",
        "nextAction": "Compare the directions close to each vertex and ignore arm endpoints.",
        "sourceUrls": [
          "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/perceptual_ability_test_section_instructions.pdf",
          "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/dat_candidate_guide.pdf"
        ],
        "canon": {
          "id": "pat-angle-ranking",
          "version": "0.1.1",
          "sourceRelativePath": "visuals/sheets/pat/pat-angle-ranking.json",
          "sourceSha256": "bf50f34064e03bdc6734e97d9aa2372a3521b350dc53c1dc94da3c8e54308d6d",
          "sourceRepository": "ace-system",
          "adaptationVersion": 1,
          "reviewScope": "Introductory opening comparison and rigid-transformation recognition; no timing or normed PAT-score claim.",
          "importsSourceAssessments": false,
          "formativeCanonChecksProgressEligible": false
        },
        "canonIntegration": "integrated-selected-scope",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key and task-family review. Not external subject-specialist certification or a learner efficacy study."
      },
      "pat-angle-order": {
        "objectiveId": "pat-angle-order",
        "version": 1,
        "core": "An angle ranking lists the openings from smallest to largest. Establish reliable pairwise comparisons, then place every label once. If A is smaller than B and B is smaller than C, A must precede C. Check a proposed order against every known comparison; visual arm length and panel position are not ranking rules.",
        "terms": [
          {
            "term": "Ascending order",
            "meaning": "Smallest first and largest last."
          },
          {
            "term": "Pairwise comparison",
            "meaning": "A comparison between two angles at a time."
          },
          {
            "term": "Constraint",
            "meaning": "A relation that any valid order must obey."
          }
        ],
        "assumptions": [
          "All diagrams show minor angles strictly between 0 and 180 degrees.",
          "Drawn segments indicate rays; their endpoints do not determine the angle size.",
          "Diagrams use equal horizontal and vertical scale; there are no ties except in the explicit matching question."
        ],
        "workedExample": {
          "prompt": "Suppose comparisons establish B < D, D < A, and A < C. Place these four labels from smallest to largest.",
          "steps": [
            "B must come before D.",
            "D must come before A.",
            "A must come before C.",
            "Link the relations into one chain without repeating a label."
          ],
          "answer": "B, D, A, C.",
          "familyId": "pat-angle-worked-constraint-chain",
          "role": "instruction-only"
        },
        "commonMistake": "Checking only the smallest and largest can leave the middle pair reversed.",
        "nextAction": "Test every adjacent pair in the proposed order.",
        "sourceUrls": [
          "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/perceptual_ability_test_section_instructions.pdf",
          "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/dat_candidate_guide.pdf"
        ],
        "canon": {
          "id": "pat-angle-ranking",
          "version": "0.1.1",
          "sourceRelativePath": "visuals/sheets/pat/pat-angle-ranking.json",
          "sourceSha256": "bf50f34064e03bdc6734e97d9aa2372a3521b350dc53c1dc94da3c8e54308d6d",
          "sourceRepository": "ace-system",
          "adaptationVersion": 1,
          "reviewScope": "Pairwise comparison and ordering constraints as introductory angle reasoning.",
          "importsSourceAssessments": false,
          "formativeCanonChecksProgressEligible": false
        },
        "canonIntegration": "integrated-selected-scope",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key and task-family review. Not external subject-specialist certification or a learner efficacy study."
      }
    },
    "items": [
      {
        "id": "next-pat-angle-opening-p1",
        "objectiveId": "pat-angle-opening",
        "familyId": "pat-angle-pair-opening",
        "familyRationale": "Same pairwise opening family; rotation and new dimensions are explicitly not novel families.",
        "world": "pat",
        "pool": "practice",
        "prompt": "Compare the two displayed minor angles. Which statement is correct?",
        "choices": [
          "Angle 1 has the smaller opening.",
          "Angle 2 has the smaller opening.",
          "Both openings are equal.",
          "The comparison is impossible because the drawn arms have different lengths."
        ],
        "answer": 0,
        "hint": "Focus on the opening where each pair of rays meets.",
        "explanation": "Angle 1 opens about 36.9 degrees; angle 2 opens about 53.1 degrees. Angle 1 is smaller even though arm lengths differ.",
        "feedback": [
          "Correct: this compares the actual opening at the vertex.",
          "This reverses the actual opening comparison.",
          "The two geometric openings differ.",
          "Unequal drawn lengths do not prevent comparison of ray directions."
        ],
        "sourceUrls": [
          "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/perceptual_ability_test_section_instructions.pdf",
          "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/dat_candidate_guide.pdf"
        ],
        "canonId": "pat-angle-ranking",
        "figure": {
          "type": "angle-ranking",
          "interior": "minor",
          "showDegrees": false,
          "angles": [
            {
              "label": "1",
              "rays": [
                [
                  4,
                  0
                ],
                [
                  4,
                  3
                ]
              ]
            },
            {
              "label": "2",
              "rays": [
                [
                  0,
                  2
                ],
                [
                  -4,
                  3
                ]
              ]
            }
          ]
        },
        "fig": "data/figures/next-pat-angle-opening-p1-question.svg",
        "visualCap": "Two separate angle diagrams labeled 1, 2. Two rays meet at each vertex.",
        "sourceId": "next-pat-angle-opening-p1",
        "sourceVersion": "dat-expansion-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key and task-family review. Not external subject-specialist certification or a learner efficacy study."
      },
      {
        "id": "next-pat-angle-opening-p2",
        "objectiveId": "pat-angle-opening",
        "familyId": "pat-angle-pair-opening",
        "familyRationale": "Same pairwise opening family; rotation and new dimensions are explicitly not novel families.",
        "world": "pat",
        "pool": "practice",
        "prompt": "Compare the two displayed minor angles. Which statement is correct?",
        "choices": [
          "Angle 1 has the smaller opening.",
          "Angle 2 has the smaller opening.",
          "Both openings are equal.",
          "The comparison is impossible because the drawn arms have different lengths."
        ],
        "answer": 0,
        "hint": "Focus on the opening where each pair of rays meets.",
        "explanation": "Angle 1 is a right angle, 90 degrees. Angle 2 is obtuse, 135 degrees. Angle 1 is smaller.",
        "feedback": [
          "Correct: this compares the actual opening at the vertex.",
          "This reverses the actual opening comparison.",
          "The two geometric openings differ.",
          "Unequal drawn lengths do not prevent comparison of ray directions."
        ],
        "sourceUrls": [
          "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/perceptual_ability_test_section_instructions.pdf",
          "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/dat_candidate_guide.pdf"
        ],
        "canonId": "pat-angle-ranking",
        "figure": {
          "type": "angle-ranking",
          "interior": "minor",
          "showDegrees": false,
          "angles": [
            {
              "label": "1",
              "rays": [
                [
                  0,
                  3
                ],
                [
                  -2,
                  0
                ]
              ]
            },
            {
              "label": "2",
              "rays": [
                [
                  3,
                  0
                ],
                [
                  -2,
                  2
                ]
              ]
            }
          ]
        },
        "fig": "data/figures/next-pat-angle-opening-p2-question.svg",
        "visualCap": "Two separate angle diagrams labeled 1, 2. Two rays meet at each vertex.",
        "sourceId": "next-pat-angle-opening-p2",
        "sourceVersion": "dat-expansion-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key and task-family review. Not external subject-specialist certification or a learner efficacy study."
      },
      {
        "id": "next-pat-angle-opening-c1",
        "objectiveId": "pat-angle-opening",
        "familyId": "pat-angle-pair-opening",
        "familyRationale": "Same pairwise opening family; rotation and new dimensions are explicitly not novel families.",
        "world": "pat",
        "pool": "check",
        "prompt": "Compare the two displayed minor angles. Which statement is correct?",
        "choices": [
          "Angle 1 has the smaller opening.",
          "Angle 2 has the smaller opening.",
          "Both openings are equal.",
          "The comparison is impossible because the drawn arms have different lengths."
        ],
        "answer": 1,
        "hint": "Focus on the opening where each pair of rays meets.",
        "explanation": "Angle 1 is 45 degrees; angle 2 is about 26.6 degrees. Angle 2 is smaller regardless of orientation.",
        "feedback": [
          "This reverses the actual opening comparison.",
          "Correct: this compares the actual opening at the vertex.",
          "The two geometric openings differ.",
          "Unequal drawn lengths do not prevent comparison of ray directions."
        ],
        "sourceUrls": [
          "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/perceptual_ability_test_section_instructions.pdf",
          "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/dat_candidate_guide.pdf"
        ],
        "canonId": "pat-angle-ranking",
        "figure": {
          "type": "angle-ranking",
          "interior": "minor",
          "showDegrees": false,
          "angles": [
            {
              "label": "1",
              "rays": [
                [
                  -4,
                  0
                ],
                [
                  -3,
                  -3
                ]
              ]
            },
            {
              "label": "2",
              "rays": [
                [
                  0,
                  -5
                ],
                [
                  2,
                  -4
                ]
              ]
            }
          ]
        },
        "fig": "data/figures/next-pat-angle-opening-c1-question.svg",
        "visualCap": "Two separate angle diagrams labeled 1, 2. Two rays meet at each vertex.",
        "sourceId": "next-pat-angle-opening-c1",
        "sourceVersion": "dat-expansion-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key and task-family review. Not external subject-specialist certification or a learner efficacy study."
      },
      {
        "id": "next-pat-angle-opening-c2",
        "objectiveId": "pat-angle-opening",
        "familyId": "pat-angle-pair-opening",
        "familyRationale": "Same pairwise opening family; rotation and new dimensions are explicitly not novel families.",
        "world": "pat",
        "pool": "check",
        "prompt": "Compare the two displayed minor angles. Which statement is correct?",
        "choices": [
          "Angle 1 has the smaller opening.",
          "Angle 2 has the smaller opening.",
          "Both openings are equal.",
          "The comparison is impossible because the drawn arms have different lengths."
        ],
        "answer": 1,
        "hint": "Focus on the opening where each pair of rays meets.",
        "explanation": "Angle 1 opens about 63.4 degrees and angle 2 opens 45 degrees. Angle 2 has the smaller opening.",
        "feedback": [
          "This reverses the actual opening comparison.",
          "Correct: this compares the actual opening at the vertex.",
          "The two geometric openings differ.",
          "Unequal drawn lengths do not prevent comparison of ray directions."
        ],
        "sourceUrls": [
          "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/perceptual_ability_test_section_instructions.pdf",
          "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/dat_candidate_guide.pdf"
        ],
        "canonId": "pat-angle-ranking",
        "figure": {
          "type": "angle-ranking",
          "interior": "minor",
          "showDegrees": false,
          "angles": [
            {
              "label": "1",
              "rays": [
                [
                  0,
                  2
                ],
                [
                  -4,
                  2
                ]
              ]
            },
            {
              "label": "2",
              "rays": [
                [
                  4,
                  0
                ],
                [
                  2,
                  2
                ]
              ]
            }
          ]
        },
        "fig": "data/figures/next-pat-angle-opening-c2-question.svg",
        "visualCap": "Two separate angle diagrams labeled 1, 2. Two rays meet at each vertex.",
        "sourceId": "next-pat-angle-opening-c2",
        "sourceVersion": "dat-expansion-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key and task-family review. Not external subject-specialist certification or a learner efficacy study."
      },
      {
        "id": "next-pat-angle-opening-l1",
        "objectiveId": "pat-angle-opening",
        "familyId": "pat-angle-reference-match",
        "familyRationale": "Novel equality matching to an external reference under changed orientation and arm lengths, rather than deciding which of two angles is smaller.",
        "world": "pat",
        "pool": "later",
        "prompt": "Reference R is shown above four candidate angles. Which candidate has the same minor-angle opening as R?",
        "choices": [
          "Candidate 1",
          "Candidate 2",
          "Candidate 3",
          "Candidate 4"
        ],
        "answer": 1,
        "hint": "A mirror flip or rotation preserves the opening, even when arm lengths differ.",
        "explanation": "R and candidate 2 both open about 53.1 degrees. Candidates 1, 3 and 4 open about 36.9, 90 and 63.4 degrees, respectively.",
        "feedback": [
          "Candidate 1 is narrower than R.",
          "Correct: candidate 2 preserves the reference opening under a changed orientation.",
          "Candidate 3 is a right angle, wider than R.",
          "Candidate 4 is wider than R."
        ],
        "sourceUrls": [
          "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/perceptual_ability_test_section_instructions.pdf",
          "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/dat_candidate_guide.pdf"
        ],
        "canonId": "pat-angle-ranking",
        "figure": {
          "type": "angle-ranking",
          "interior": "minor",
          "showDegrees": false,
          "angles": [
            {
              "label": "R",
              "rays": [
                [
                  3,
                  0
                ],
                [
                  1.8,
                  2.4
                ]
              ]
            },
            {
              "label": "1",
              "rays": [
                [
                  0,
                  4
                ],
                [
                  -3,
                  4
                ]
              ]
            },
            {
              "label": "2",
              "rays": [
                [
                  -2,
                  0
                ],
                [
                  -3,
                  -4
                ]
              ]
            },
            {
              "label": "3",
              "rays": [
                [
                  2,
                  0
                ],
                [
                  0,
                  3
                ]
              ]
            },
            {
              "label": "4",
              "rays": [
                [
                  0,
                  -4
                ],
                [
                  2,
                  -1
                ]
              ]
            }
          ]
        },
        "fig": "data/figures/next-pat-angle-opening-l1-question.svg",
        "visualCap": "Reference angle R above four candidate angle diagrams labeled 1, 2, 3, 4. Two rays meet at each vertex.",
        "sourceId": "next-pat-angle-opening-l1",
        "sourceVersion": "dat-expansion-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key and task-family review. Not external subject-specialist certification or a learner efficacy study."
      },
      {
        "id": "next-pat-angle-order-p1",
        "objectiveId": "pat-angle-order",
        "familyId": "pat-angle-four-ordering",
        "familyRationale": "Same four-angle visual-ordering family; changing numerical angles or orientations does not create novelty.",
        "world": "pat",
        "pool": "practice",
        "prompt": "Rank the four displayed minor angles from smallest to largest.",
        "choices": [
          "3, 1, 4, 2",
          "1, 3, 4, 2",
          "3, 4, 1, 2",
          "2, 4, 1, 3"
        ],
        "answer": 0,
        "hint": "Find a reliable comparison, then verify the two middle positions.",
        "explanation": "The openings are approximately 45, 90, 26.6 and 63.4 degrees for labels 1–4. Their ascending order is 3, 1, 4, 2.",
        "feedback": [
          "Correct: every adjacent angle increases in opening.",
          "This order reverses at least one pair of actual angle openings.",
          "This order reverses at least one pair of actual angle openings.",
          "This order reverses at least one pair of actual angle openings."
        ],
        "sourceUrls": [
          "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/perceptual_ability_test_section_instructions.pdf",
          "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/dat_candidate_guide.pdf"
        ],
        "canonId": "pat-angle-ranking",
        "figure": {
          "type": "angle-ranking",
          "interior": "minor",
          "showDegrees": false,
          "angles": [
            {
              "label": "1",
              "rays": [
                [
                  4,
                  0
                ],
                [
                  2,
                  2
                ]
              ]
            },
            {
              "label": "2",
              "rays": [
                [
                  0,
                  3
                ],
                [
                  -4,
                  0
                ]
              ]
            },
            {
              "label": "3",
              "rays": [
                [
                  3,
                  0
                ],
                [
                  4,
                  2
                ]
              ]
            },
            {
              "label": "4",
              "rays": [
                [
                  0,
                  -3
                ],
                [
                  4,
                  -2
                ]
              ]
            }
          ]
        },
        "fig": "data/figures/next-pat-angle-order-p1-question.svg",
        "visualCap": "Four separate angle diagrams labeled 1, 2, 3, 4. Two rays meet at each vertex.",
        "sourceId": "next-pat-angle-order-p1",
        "sourceVersion": "dat-expansion-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key and task-family review. Not external subject-specialist certification or a learner efficacy study."
      },
      {
        "id": "next-pat-angle-order-p2",
        "objectiveId": "pat-angle-order",
        "familyId": "pat-angle-four-ordering",
        "familyRationale": "Same four-angle visual-ordering family; changing numerical angles or orientations does not create novelty.",
        "world": "pat",
        "pool": "practice",
        "prompt": "Rank the four displayed minor angles from smallest to largest.",
        "choices": [
          "2, 3, 4, 1",
          "2, 4, 3, 1",
          "4, 2, 3, 1",
          "1, 3, 4, 2"
        ],
        "answer": 1,
        "hint": "Find a reliable comparison, then verify the two middle positions.",
        "explanation": "Labels 1–4 open 135, about 36.9, 90 and about 53.1 degrees. The correct ascending order is 2, 4, 3, 1.",
        "feedback": [
          "This order reverses at least one pair of actual angle openings.",
          "Correct: every adjacent angle increases in opening.",
          "This order reverses at least one pair of actual angle openings.",
          "This order reverses at least one pair of actual angle openings."
        ],
        "sourceUrls": [
          "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/perceptual_ability_test_section_instructions.pdf",
          "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/dat_candidate_guide.pdf"
        ],
        "canonId": "pat-angle-ranking",
        "figure": {
          "type": "angle-ranking",
          "interior": "minor",
          "showDegrees": false,
          "angles": [
            {
              "label": "1",
              "rays": [
                [
                  3,
                  0
                ],
                [
                  -2,
                  2
                ]
              ]
            },
            {
              "label": "2",
              "rays": [
                [
                  0,
                  -4
                ],
                [
                  3,
                  -4
                ]
              ]
            },
            {
              "label": "3",
              "rays": [
                [
                  4,
                  0
                ],
                [
                  0,
                  2
                ]
              ]
            },
            {
              "label": "4",
              "rays": [
                [
                  0,
                  4
                ],
                [
                  -4,
                  3
                ]
              ]
            }
          ]
        },
        "fig": "data/figures/next-pat-angle-order-p2-question.svg",
        "visualCap": "Four separate angle diagrams labeled 1, 2, 3, 4. Two rays meet at each vertex.",
        "sourceId": "next-pat-angle-order-p2",
        "sourceVersion": "dat-expansion-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key and task-family review. Not external subject-specialist certification or a learner efficacy study."
      },
      {
        "id": "next-pat-angle-order-c1",
        "objectiveId": "pat-angle-order",
        "familyId": "pat-angle-four-ordering",
        "familyRationale": "Same four-angle visual-ordering family; changing numerical angles or orientations does not create novelty.",
        "world": "pat",
        "pool": "check",
        "prompt": "Rank the four displayed minor angles from smallest to largest.",
        "choices": [
          "2, 1, 4, 3",
          "4, 2, 1, 3",
          "2, 4, 1, 3",
          "3, 1, 4, 2"
        ],
        "answer": 2,
        "hint": "Find a reliable comparison, then verify the two middle positions.",
        "explanation": "The openings are about 63.4, 26.6, 135 and 45 degrees. The ascending order is 2, 4, 1, 3.",
        "feedback": [
          "This order reverses at least one pair of actual angle openings.",
          "This order reverses at least one pair of actual angle openings.",
          "Correct: every adjacent angle increases in opening.",
          "This order reverses at least one pair of actual angle openings."
        ],
        "sourceUrls": [
          "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/perceptual_ability_test_section_instructions.pdf",
          "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/dat_candidate_guide.pdf"
        ],
        "canonId": "pat-angle-ranking",
        "figure": {
          "type": "angle-ranking",
          "interior": "minor",
          "showDegrees": false,
          "angles": [
            {
              "label": "1",
              "rays": [
                [
                  4,
                  0
                ],
                [
                  2,
                  4
                ]
              ]
            },
            {
              "label": "2",
              "rays": [
                [
                  0,
                  3
                ],
                [
                  -2,
                  4
                ]
              ]
            },
            {
              "label": "3",
              "rays": [
                [
                  0,
                  -3
                ],
                [
                  2,
                  2
                ]
              ]
            },
            {
              "label": "4",
              "rays": [
                [
                  3,
                  0
                ],
                [
                  2,
                  2
                ]
              ]
            }
          ]
        },
        "fig": "data/figures/next-pat-angle-order-c1-question.svg",
        "visualCap": "Four separate angle diagrams labeled 1, 2, 3, 4. Two rays meet at each vertex.",
        "sourceId": "next-pat-angle-order-c1",
        "sourceVersion": "dat-expansion-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key and task-family review. Not external subject-specialist certification or a learner efficacy study."
      },
      {
        "id": "next-pat-angle-order-c2",
        "objectiveId": "pat-angle-order",
        "familyId": "pat-angle-four-ordering",
        "familyRationale": "Same four-angle visual-ordering family; changing numerical angles or orientations does not create novelty.",
        "world": "pat",
        "pool": "check",
        "prompt": "Rank the four displayed minor angles from smallest to largest.",
        "choices": [
          "1, 3, 4, 2",
          "3, 1, 2, 4",
          "2, 4, 1, 3",
          "3, 1, 4, 2"
        ],
        "answer": 3,
        "hint": "Find a reliable comparison, then verify the two middle positions.",
        "explanation": "Labels 1–4 open about 53.1, 135, 36.9 and 90 degrees. Their ascending order is 3, 1, 4, 2.",
        "feedback": [
          "This order reverses at least one pair of actual angle openings.",
          "This order reverses at least one pair of actual angle openings.",
          "This order reverses at least one pair of actual angle openings.",
          "Correct: every adjacent angle increases in opening."
        ],
        "sourceUrls": [
          "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/perceptual_ability_test_section_instructions.pdf",
          "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/dat_candidate_guide.pdf"
        ],
        "canonId": "pat-angle-ranking",
        "figure": {
          "type": "angle-ranking",
          "interior": "minor",
          "showDegrees": false,
          "angles": [
            {
              "label": "1",
              "rays": [
                [
                  -4,
                  0
                ],
                [
                  -3,
                  -4
                ]
              ]
            },
            {
              "label": "2",
              "rays": [
                [
                  0,
                  3
                ],
                [
                  2,
                  -2
                ]
              ]
            },
            {
              "label": "3",
              "rays": [
                [
                  3,
                  0
                ],
                [
                  4,
                  3
                ]
              ]
            },
            {
              "label": "4",
              "rays": [
                [
                  0,
                  -3
                ],
                [
                  4,
                  0
                ]
              ]
            }
          ]
        },
        "fig": "data/figures/next-pat-angle-order-c2-question.svg",
        "visualCap": "Four separate angle diagrams labeled 1, 2, 3, 4. Two rays meet at each vertex.",
        "sourceId": "next-pat-angle-order-c2",
        "sourceVersion": "dat-expansion-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key and task-family review. Not external subject-specialist certification or a learner efficacy study."
      },
      {
        "id": "next-pat-angle-order-l1",
        "objectiveId": "pat-angle-order",
        "familyId": "pat-angle-next-comparison-design",
        "familyRationale": "Novel evidence selection from an incomplete order: identify the missing comparison, rather than concatenate the complete chain used in instruction.",
        "world": "pat",
        "pool": "later",
        "prompt": "An angle-ranking record establishes 1 < 2 < 3 and 1 < 4 < 3. Based only on those recorded comparisons, which one additional comparison resolves the remaining uncertainty in the full order? The drawings identify the angles; the question asks what the record still needs.",
        "choices": [
          "Compare 1 with 3.",
          "Compare 2 with 4.",
          "Compare 1 with 4.",
          "Compare 2 with 3."
        ],
        "answer": 1,
        "hint": "The smallest and largest are already fixed. Which pair can still change places?",
        "explanation": "The records allow both 1, 2, 4, 3 and 1, 4, 2, 3. Comparing 2 with 4 distinguishes those two possibilities.",
        "feedback": [
          "1 < 3 already follows from the recorded chains.",
          "Correct: only the relation between 2 and 4 is missing.",
          "1 < 4 is already recorded.",
          "2 < 3 is already recorded."
        ],
        "sourceUrls": [
          "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/perceptual_ability_test_section_instructions.pdf",
          "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/dat_candidate_guide.pdf"
        ],
        "canonId": "pat-angle-ranking",
        "figure": {
          "type": "angle-ranking",
          "interior": "minor",
          "showDegrees": false,
          "angles": [
            {
              "label": "1",
              "rays": [
                [
                  3,
                  0
                ],
                [
                  4,
                  2
                ]
              ]
            },
            {
              "label": "2",
              "rays": [
                [
                  0,
                  3
                ],
                [
                  -2,
                  2
                ]
              ]
            },
            {
              "label": "3",
              "rays": [
                [
                  4,
                  0
                ],
                [
                  0,
                  3
                ]
              ]
            },
            {
              "label": "4",
              "rays": [
                [
                  0,
                  -3
                ],
                [
                  4,
                  -2
                ]
              ]
            }
          ]
        },
        "fig": "data/figures/next-pat-angle-order-l1-question.svg",
        "visualCap": "Four separate angle diagrams labeled 1, 2, 3, 4. Two rays meet at each vertex.",
        "sourceId": "next-pat-angle-order-l1",
        "sourceVersion": "dat-expansion-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key and task-family review. Not external subject-specialist certification or a learner efficacy study."
      }
    ],
    "contentSha256": "b7b019c2a9b62f9d22f6efcedd2a0fb7eb892c0010ae73c654b882bc6f5bdbcf",
    "reviewStatus": "internal-reviewed",
    "verified": true,
    "progressEligible": true,
    "runtimeIntegrated": true,
    "reviewScope": "Independent internal source, answer-key and task-family review. Not external subject-specialist certification or a learner efficacy study."
  },
  {
    "id": "rc-evidence-archive",
    "world": "rc",
    "title": "The Evidence Archive",
    "objectiveIds": [
      "rc-passage-structure",
      "rc-bounded-inference"
    ],
    "scope": "Two introductory short-passage reasoning objectives; original fictional observations, not full-length DAT reading simulation or a reading-readiness claim.",
    "canon": {
      "id": "rc-passage-map",
      "version": "0.2.0",
      "sourceRelativePath": "visuals/sheets/rc/rc-passage-map.json",
      "sourceSha256": "74c7f73d36759c4e6b19626fa3dca2ae5f9c550806fa6da708b7dc9dd8405b17"
    },
    "objectives": [
      {
        "id": "rc-passage-structure",
        "world": "rc",
        "name": "Map paragraph roles and the links between them",
        "lesson": "A passage map records what each paragraph does: introduce a question, explain a method, report evidence, compare explanations, or qualify a conclusion. A paragraph can have several details but one main role in the argument. Follow references such as these results or this limitation back to their specific ideas. A useful linking sentence connects evidence already presented to the next response; it should not introduce an unsupported claim.",
        "sourceUrls": [
          "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/dat_candidate_guide.pdf"
        ],
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key and task-family review. Not external subject-specialist certification or a learner efficacy study."
      },
      {
        "id": "rc-bounded-inference",
        "world": "rc",
        "name": "Infer only what the passage supports",
        "lesson": "A supported inference combines stated evidence without expanding its scope or certainty. A finding from one setting does not establish always, every setting, or a unique cause. Keep the author’s qualifications: may, in this trial, and not yet tested matter. When two explanations fit the same observation, evidence that holds one factor steady while changing the other can help distinguish them; repeating the original observation alone may not.",
        "sourceUrls": [
          "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/dat_candidate_guide.pdf"
        ],
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key and task-family review. Not external subject-specialist certification or a learner efficacy study."
      }
    ],
    "teachingByObjective": {
      "rc-passage-structure": {
        "objectiveId": "rc-passage-structure",
        "version": 1,
        "core": "A passage map records what each paragraph does: introduce a question, explain a method, report evidence, compare explanations, or qualify a conclusion. A paragraph can have several details but one main role in the argument. Follow references such as these results or this limitation back to their specific ideas. A useful linking sentence connects evidence already presented to the next response; it should not introduce an unsupported claim.",
        "terms": [
          {
            "term": "Passage map",
            "meaning": "A short record of the job each paragraph performs."
          },
          {
            "term": "Evidence",
            "meaning": "An observation or detail offered to support a claim."
          },
          {
            "term": "Qualification",
            "meaning": "A limit on a claim’s scope or certainty."
          },
          {
            "term": "Reference",
            "meaning": "A word or phrase that points back to a specific earlier idea."
          }
        ],
        "assumptions": [
          "Every passage below is original fiction written for this chapter, not a report of real research.",
          "Answer from the passage; outside scientific knowledge is neither needed nor credited.",
          "Paragraph numbers start at 1. An unsupported claim need not be false in the world; it simply is not established here."
        ],
        "workedExample": {
          "prompt": "A fictional report first introduces two catalog scanners, next compares their legibility on old labels, and finally notes that only one collection was tested. What is its organization?",
          "steps": [
            "The first paragraph establishes the comparison.",
            "The next supplies the observed evidence.",
            "The final paragraph limits the reach of the evidence."
          ],
          "answer": "Comparison introduced → evidence reported → scope qualified.",
          "familyId": "rc-structure-worked-map",
          "role": "instruction-only"
        },
        "commonMistake": "A method detail is not automatically the passage’s overall purpose.",
        "nextAction": "Give each paragraph a short role label, then explain how the roles connect.",
        "sourceUrls": [
          "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/dat_candidate_guide.pdf"
        ],
        "canon": {
          "id": "rc-passage-map",
          "version": "0.2.0",
          "sourceRelativePath": "visuals/sheets/rc/rc-passage-map.json",
          "sourceSha256": "74c7f73d36759c4e6b19626fa3dca2ae5f9c550806fa6da708b7dc9dd8405b17",
          "sourceRepository": "ace-system",
          "adaptationVersion": 1,
          "reviewScope": "Paragraph roles, whole-passage organization and evidence-to-response links; short passages do not reproduce full DAT reading demands.",
          "importsSourceAssessments": false,
          "formativeCanonChecksProgressEligible": false
        },
        "canonIntegration": "integrated-selected-scope",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key and task-family review. Not external subject-specialist certification or a learner efficacy study."
      },
      "rc-bounded-inference": {
        "objectiveId": "rc-bounded-inference",
        "version": 1,
        "core": "A supported inference combines stated evidence without expanding its scope or certainty. A finding from one setting does not establish always, every setting, or a unique cause. Keep the author’s qualifications: may, in this trial, and not yet tested matter. When two explanations fit the same observation, evidence that holds one factor steady while changing the other can help distinguish them; repeating the original observation alone may not.",
        "terms": [
          {
            "term": "Inference",
            "meaning": "A conclusion supported by combining what the passage states."
          },
          {
            "term": "Scope",
            "meaning": "The people, objects or conditions to which a claim applies."
          },
          {
            "term": "Alternative explanation",
            "meaning": "Another account compatible with the same observation."
          },
          {
            "term": "Controlled comparison",
            "meaning": "A comparison designed to hold relevant factors steady while changing the factor of interest."
          }
        ],
        "assumptions": [
          "Every passage below is original fiction written for this chapter, not a report of real research.",
          "Answer from the passage; outside scientific knowledge is neither needed nor credited.",
          "Paragraph numbers start at 1. An unsupported claim need not be false in the world; it simply is not established here."
        ],
        "workedExample": {
          "prompt": "A fictional report says labels stayed readable longer in a shaded cabinet during one week; the cabinets also differed in humidity. What conclusion is justified?",
          "steps": [
            "Keep the observed association: readable labels lasted longer in the shaded cabinet.",
            "Notice that humidity differed too.",
            "Do not identify shade as the sole cause or generalize to all cabinets."
          ],
          "answer": "That cabinet performed better in the stated trial; the report does not isolate the cause.",
          "familyId": "rc-inference-worked-qualified-association",
          "role": "instruction-only"
        },
        "commonMistake": "A plausible cause is not necessarily the only cause established by the text.",
        "nextAction": "Find the exact evidence, preserve its limits, and check whether another explanation remains.",
        "sourceUrls": [
          "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/dat_candidate_guide.pdf"
        ],
        "canon": {
          "id": "rc-passage-map",
          "version": "0.2.0",
          "sourceRelativePath": "visuals/sheets/rc/rc-passage-map.json",
          "sourceSha256": "74c7f73d36759c4e6b19626fa3dca2ae5f9c550806fa6da708b7dc9dd8405b17",
          "sourceRepository": "ace-system",
          "adaptationVersion": 1,
          "reviewScope": "Qualified conclusions, alternatives and evidence selection; no outside-fact or causal-certainty shortcuts.",
          "importsSourceAssessments": false,
          "formativeCanonChecksProgressEligible": false
        },
        "canonIntegration": "integrated-selected-scope",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key and task-family review. Not external subject-specialist certification or a learner efficacy study."
      }
    },
    "items": [
      {
        "id": "next-rc-passage-structure-p1",
        "objectiveId": "rc-passage-structure",
        "familyId": "rc-role-local-function",
        "familyRationale": "Identify one paragraph’s role in a short argument.",
        "world": "rc",
        "pool": "practice",
        "prompt": "What is the main role of paragraph 3?",
        "choices": [
          "It limits the conclusion and recommends more testing.",
          "It reports that reflectors failed in every aisle.",
          "It explains how reflectors are manufactured.",
          "It replaces the trial findings with a claim about tag colors."
        ],
        "answer": 0,
        "hint": "Ask what paragraph 3 does to the claim supported by paragraph 2.",
        "explanation": "The final paragraph names untested conditions and recommends a broader trial, qualifying the scope of the result.",
        "feedback": [
          "Correct: it limits generalization and identifies a next step.",
          "No failure in every aisle is reported.",
          "Manufacturing is not discussed.",
          "Tag colors are not the subject of that paragraph."
        ],
        "sourceUrls": [
          "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/dat_candidate_guide.pdf"
        ],
        "canonId": "rc-passage-map",
        "passage": {
          "title": "Fictional report: the reflector trial",
          "paragraphs": [
            "Archive workers could not read some shelf tags from the aisle. They proposed small reflectors to direct more lamp light toward the tags.",
            "During a trial in one aisle, workers read more tags with the reflectors in place than without them. The same lamp and the same set of tags were used in both conditions.",
            "The team has not tested curved shelves or daylight conditions. It therefore recommends a larger trial before adopting the reflectors throughout the archive."
          ]
        },
        "passageId": "next-rc-s1",
        "sourceId": "next-rc-passage-structure-p1",
        "sourceVersion": "dat-expansion-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key and task-family review. Not external subject-specialist certification or a learner efficacy study."
      },
      {
        "id": "next-rc-passage-structure-p2",
        "objectiveId": "rc-passage-structure",
        "familyId": "rc-role-local-function",
        "familyRationale": "Same paragraph-role task with a fresh passage; context changes alone do not create a new family.",
        "world": "rc",
        "pool": "practice",
        "prompt": "What is the main role of paragraph 2?",
        "choices": [
          "It announces that decoration has been disproved.",
          "It describes a procedure for comparing the two explanations.",
          "It gives advice about making clay disks.",
          "It argues that location data are impossible to obtain."
        ],
        "answer": 1,
        "hint": "Separate the test procedure from the results reported later.",
        "explanation": "Paragraph 2 explains how investigators grouped disks and compared sequences with locations; paragraph 3 reports the mixed results.",
        "feedback": [
          "The passage retains both explanations.",
          "Correct: this paragraph describes the comparison method.",
          "The passage studies existing marks; it does not teach disk making.",
          "Investigators explicitly examine locations."
        ],
        "sourceUrls": [
          "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/dat_candidate_guide.pdf"
        ],
        "canonId": "rc-passage-map",
        "passage": {
          "title": "Fictional report: clay marker patterns",
          "paragraphs": [
            "Two teams gave different explanations for repeated marks on a set of clay disks. One proposed a counting system; the other proposed decorative patterns.",
            "To compare these accounts, the investigators grouped the disks by mark sequence and checked whether sequences recurred in the same storage locations. They recorded the procedure before examining the location results.",
            "Several sequences clustered by location, but others did not. The investigators kept both explanations under consideration rather than declaring the question settled."
          ]
        },
        "passageId": "next-rc-s2",
        "sourceId": "next-rc-passage-structure-p2",
        "sourceVersion": "dat-expansion-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key and task-family review. Not external subject-specialist certification or a learner efficacy study."
      },
      {
        "id": "next-rc-passage-structure-c1",
        "objectiveId": "rc-passage-structure",
        "familyId": "rc-whole-passage-map",
        "familyRationale": "Map the argument across all paragraphs; identical to the general skill modeled in instruction, not novel delayed evidence.",
        "world": "rc",
        "pool": "check",
        "prompt": "Which outline best matches this passage’s organization?",
        "choices": [
          "Conclusion accepted → irrelevant history → unrelated advice.",
          "Manufacturing instructions → cost table → adoption of the tested design.",
          "Proposed change and concern → comparison results → proposed revision.",
          "Two identical explanations → proof of both → rejection of further work."
        ],
        "answer": 2,
        "hint": "Give each paragraph a short role before comparing outlines.",
        "explanation": "The passage introduces covered bells and a concern, presents a benefit and a drawback, then proposes another shape.",
        "feedback": [
          "The report does not begin with an accepted final conclusion.",
          "It supplies neither manufacturing instructions nor a cost table and does not adopt the tested shape.",
          "Correct: the outline tracks all three paragraph roles.",
          "No two identical explanations or rejection of further work appears."
        ],
        "sourceUrls": [
          "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/dat_candidate_guide.pdf"
        ],
        "canonId": "rc-passage-map",
        "passage": {
          "title": "Fictional report: bell covers",
          "paragraphs": [
            "A workshop proposed adding covers to its signal bells to reduce dust accumulation. Workers worried that a cover might also make a signal harder to hear.",
            "The trial compared covered and uncovered bells at equal distances. Covered bells collected less dust, but listeners missed more of their signals.",
            "The report proposes testing a different cover shape. It does not recommend adopting the tested covers unchanged."
          ]
        },
        "passageId": "next-rc-s3",
        "sourceId": "next-rc-passage-structure-c1",
        "sourceVersion": "dat-expansion-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key and task-family review. Not external subject-specialist certification or a learner efficacy study."
      },
      {
        "id": "next-rc-passage-structure-c2",
        "objectiveId": "rc-passage-structure",
        "familyId": "rc-role-local-function",
        "familyRationale": "Identify how an objection relates to the recommendation; same local-function family.",
        "world": "rc",
        "pool": "check",
        "prompt": "How does paragraph 2 contribute to the final proposal?",
        "choices": [
          "It proves that duplicate maps have no possible benefit.",
          "It supplies a historical account unrelated to the proposal.",
          "It states that originals should always be discarded.",
          "It identifies an update risk that the final proposal addresses."
        ],
        "answer": 3,
        "hint": "Track which concern the revision log and paired check respond to.",
        "explanation": "The manager raises the risk of an outdated duplicate; the final proposal adds checks to address that risk while retaining duplicates.",
        "feedback": [
          "The proposal still retains duplicates and their stated benefit.",
          "The update concern directly motivates the added controls.",
          "Discarding originals is not proposed.",
          "Correct: the concern is answered by the revision process."
        ],
        "sourceUrls": [
          "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/dat_candidate_guide.pdf"
        ],
        "canonId": "rc-passage-map",
        "passage": {
          "title": "Fictional report: duplicate maps",
          "paragraphs": [
            "Making a second copy of each route map could prevent delays when the original was misplaced. A copying team proposed this change.",
            "The archive manager pointed out that every revised route would then require two maps to be updated. An out-of-date duplicate could mislead a traveler.",
            "The final proposal keeps duplicates but adds a revision log and a check that both copies were updated."
          ]
        },
        "passageId": "next-rc-s4",
        "sourceId": "next-rc-passage-structure-c2",
        "sourceVersion": "dat-expansion-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key and task-family review. Not external subject-specialist certification or a learner efficacy study."
      },
      {
        "id": "next-rc-passage-structure-l1",
        "objectiveId": "rc-passage-structure",
        "familyId": "rc-linking-sentence-placement",
        "familyRationale": "Novel construction task: place a bridging sentence between its supporting evidence and the response it motivates, rather than assign an existing paragraph a role.",
        "world": "rc",
        "pool": "later",
        "prompt": "Consider the sentence: “The tested designs therefore offered different benefits, but neither met both goals.” Between which two paragraphs would it best link the reported evidence to the planned response, keeping evidence before the sentence and the response after it?",
        "choices": [
          "Between paragraphs 1 and 2.",
          "Between paragraphs 2 and 3.",
          "After paragraph 3.",
          "Before paragraph 1."
        ],
        "answer": 1,
        "hint": "Find the actual test results first and the proposed response second.",
        "explanation": "Paragraph 2 provides the two benefits and failures. Paragraph 3 proposes a new trial to address their trade-off, so the bridging sentence belongs between them.",
        "feedback": [
          "The actual results have not yet been presented at this point.",
          "Correct: results precede the sentence and the response follows it.",
          "This places the response before the bridge, contrary to the requested evidence-to-response ordering.",
          "No goals or test results have been introduced yet."
        ],
        "sourceUrls": [
          "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/dat_candidate_guide.pdf"
        ],
        "canonId": "rc-passage-map",
        "passage": {
          "title": "Fictional report: readable seals",
          "paragraphs": [
            "A fictional ticket archive wants seals that protect labels during damp transport while allowing the labels to be read without opening the package. Both goals matter.",
            "Thin seals allowed reading through the seal, but the labels smeared during the trial. Thick seals kept the lettering intact but hid it from view.",
            "To address this trade-off, the next trial will test a medium thickness and separately record readability and protection."
          ]
        },
        "passageId": "next-rc-s5",
        "sourceId": "next-rc-passage-structure-l1",
        "sourceVersion": "dat-expansion-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key and task-family review. Not external subject-specialist certification or a learner efficacy study."
      },
      {
        "id": "next-rc-bounded-inference-p1",
        "objectiveId": "rc-bounded-inference",
        "familyId": "rc-qualified-observation",
        "familyRationale": "Preserve the measured outcome and tested setting.",
        "world": "rc",
        "pool": "practice",
        "prompt": "Which conclusion is supported?",
        "choices": [
          "The framed containers lost less water in the measured afternoon.",
          "Shade frames increase plant growth in every season.",
          "The trial proves that no uncovered container ever retains water.",
          "The frames must perform identically in all future weather."
        ],
        "answer": 0,
        "hint": "Keep the outcome and time window actually measured.",
        "explanation": "The passage reports less water loss under frames that afternoon. It did not measure growth or other seasons.",
        "feedback": [
          "Correct: this retains the passage’s measured outcome and scope.",
          "Plant growth and all seasons were not tested.",
          "The report gives a relative difference, not zero retention in every uncovered container.",
          "Future weather was not tested."
        ],
        "sourceUrls": [
          "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/dat_candidate_guide.pdf"
        ],
        "canonId": "rc-passage-map",
        "passage": {
          "title": "Fictional report: shade frames",
          "paragraphs": [
            "In one garden trial, volunteers placed shade frames over half of a set of identical containers. Those containers lost less water over the measured afternoon than uncovered containers.",
            "The team states that the result applies to that afternoon. It did not measure plant growth or repeat the trial during another season."
          ]
        },
        "passageId": "next-rc-i1",
        "sourceId": "next-rc-bounded-inference-p1",
        "sourceVersion": "dat-expansion-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key and task-family review. Not external subject-specialist certification or a learner efficacy study."
      },
      {
        "id": "next-rc-bounded-inference-p2",
        "objectiveId": "rc-bounded-inference",
        "familyId": "rc-alternative-explanations",
        "familyRationale": "Recognize that a comparison changing two factors does not isolate one cause.",
        "world": "rc",
        "pool": "practice",
        "prompt": "Which inference best respects the report?",
        "choices": [
          "Larger labels alone are proven to cause the improvement.",
          "The trial does not determine how much each change contributed.",
          "Shorter drawer distances had no possible effect.",
          "The new cabinet was slower than the old one."
        ],
        "answer": 1,
        "hint": "Two features changed together; neither was varied separately.",
        "explanation": "Faster sorting is reported, but the contribution of label size versus drawer distance remains unresolved.",
        "feedback": [
          "The two factors were not isolated.",
          "Correct: the report leaves their separate contributions open.",
          "The passage explicitly retains shorter distance as a possible explanation.",
          "This contradicts the observed faster sorting."
        ],
        "sourceUrls": [
          "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/dat_candidate_guide.pdf"
        ],
        "canonId": "rc-passage-map",
        "passage": {
          "title": "Fictional report: sorting drawers",
          "paragraphs": [
            "A team sorted tokens faster with a new drawer cabinet than with an old cabinet. The new cabinet had both larger labels and shorter distances between drawers.",
            "The report says either change, or both together, could explain the improvement. The trial did not vary the two changes separately."
          ]
        },
        "passageId": "next-rc-i2",
        "sourceId": "next-rc-bounded-inference-p2",
        "sourceVersion": "dat-expansion-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key and task-family review. Not external subject-specialist certification or a learner efficacy study."
      },
      {
        "id": "next-rc-bounded-inference-c1",
        "objectiveId": "rc-bounded-inference",
        "familyId": "rc-qualified-observation",
        "familyRationale": "Integrate contrasting settings without making a universal claim.",
        "world": "rc",
        "pool": "check",
        "prompt": "Which conclusion is best supported by the combined results?",
        "choices": [
          "The panel always improves identification in every room.",
          "The panel cannot improve identification anywhere.",
          "The measured benefit differed between the two tested rooms.",
          "Listeners identified every sound correctly in Room East."
        ],
        "answer": 2,
        "hint": "A result in one setting and no measured improvement in another support a bounded comparison.",
        "explanation": "Room East improved while Room West did not show improvement under the test conditions. The passage supports that difference, not either universal claim.",
        "feedback": [
          "Room West did not show improvement.",
          "Room East did show improvement.",
          "Correct: this preserves the two reported outcomes without extending them.",
          "More correct identifications does not mean all were correct."
        ],
        "sourceUrls": [
          "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/dat_candidate_guide.pdf"
        ],
        "canonId": "rc-passage-map",
        "passage": {
          "title": "Fictional report: acoustic panels",
          "paragraphs": [
            "In Room East, listeners identified more test sounds correctly after a panel was installed. In Room West, the same design produced no measured improvement under the test conditions.",
            "The authors recommend investigating room-specific conditions. They do not conclude that the panel improves identification in every room or that it is useless in every room."
          ]
        },
        "passageId": "next-rc-i3",
        "sourceId": "next-rc-bounded-inference-c1",
        "sourceVersion": "dat-expansion-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key and task-family review. Not external subject-specialist certification or a learner efficacy study."
      },
      {
        "id": "next-rc-bounded-inference-c2",
        "objectiveId": "rc-bounded-inference",
        "familyId": "rc-qualified-observation",
        "familyRationale": "Infer a recommendation from stated conditions while retaining unmeasured limits.",
        "world": "rc",
        "pool": "check",
        "prompt": "Why does the report recommend ink N for cards that may face either tested condition?",
        "choices": [
          "N is proven cheaper than M.",
          "M never remains legible in any environment.",
          "N is proven best under every possible storage condition.",
          "N remained legible in both tested conditions, while M had problems in damp storage."
        ],
        "answer": 3,
        "hint": "Use the observed performance, not an unmeasured cost or universal ranking.",
        "explanation": "N performed adequately in both stated trials; M blurred in the damp trial. The recommendation is restricted to those conditions.",
        "feedback": [
          "Cost was not compared.",
          "M remained legible in dry storage.",
          "Other conditions were not tested.",
          "Correct: this is the evidence supporting the limited recommendation."
        ],
        "sourceUrls": [
          "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/dat_candidate_guide.pdf"
        ],
        "canonId": "rc-passage-map",
        "passage": {
          "title": "Fictional report: ink and storage",
          "paragraphs": [
            "Cards made with ink M stayed legible in dry storage, but many became blurred in the damp-storage trial. Cards made with ink N stayed legible in both trials.",
            "The report recommends ink N when cards may encounter either of the two tested storage conditions. It does not compare cost or performance under other conditions."
          ]
        },
        "passageId": "next-rc-i4",
        "sourceId": "next-rc-bounded-inference-c2",
        "sourceVersion": "dat-expansion-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key and task-family review. Not external subject-specialist certification or a learner efficacy study."
      },
      {
        "id": "next-rc-bounded-inference-l1",
        "objectiveId": "rc-bounded-inference",
        "familyId": "rc-discriminating-followup-design",
        "familyRationale": "Novel forward evidence design: choose a follow-up that can separate two explanations rather than describe the limits of an existing observation.",
        "world": "rc",
        "pool": "later",
        "prompt": "Which follow-up would best help separate the color explanation from the location explanation?",
        "choices": [
          "Keep the colors fixed to their original locations and count more returns only there.",
          "Swap the blue and gray boxes between the two locations across matched periods while keeping openings and instructions the same.",
          "Ask one staff member which color is prettier.",
          "Change color, opening size, instructions and distance together for both boxes."
        ],
        "answer": 1,
        "hint": "Seek a comparison in which color no longer stays tied to the same location.",
        "explanation": "Swapping colors between locations across matched periods breaks the original color-location link while controlling the listed box features. The resulting pattern could favor a color effect, a location effect, both, or neither; it is not a guarantee of one answer.",
        "feedback": [
          "More observations with the same linked factors do not separate their contributions.",
          "Correct: this comparison helps distinguish the two stated explanations without changing all features at once.",
          "Aesthetic preference from one person does not compare return behavior under the two explanations.",
          "Changing many features together adds confounding rather than resolving it."
        ],
        "sourceUrls": [
          "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/dat_candidate_guide.pdf"
        ],
        "canonId": "rc-passage-map",
        "passage": {
          "title": "Fictional report: return boxes",
          "paragraphs": [
            "More borrowed tags were returned to a blue box than to a gray box during a pilot. The blue box was closer to the entrance. Both boxes had the same size opening and the same instructions.",
            "One explanation is that blue attracts more returns; another is that a shorter walk attracts more returns. The pilot leaves color and location linked, so it cannot separate these explanations."
          ]
        },
        "passageId": "next-rc-i5",
        "sourceId": "next-rc-bounded-inference-l1",
        "sourceVersion": "dat-expansion-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key and task-family review. Not external subject-specialist certification or a learner efficacy study."
      }
    ],
    "contentSha256": "3bfa43a3671d2f1febe268f53ca4d1d96e3eab13bb3c25cd0d7e5d74d6f11d13",
    "reviewStatus": "internal-reviewed",
    "verified": true,
    "progressEligible": true,
    "runtimeIntegrated": true,
    "reviewScope": "Independent internal source, answer-key and task-family review. Not external subject-specialist certification or a learner efficacy study."
  },
  {
    "id": "qr-percent-market",
    "world": "qr",
    "title": "The Percent Exchange",
    "objectiveIds": [
      "qr-percent-base",
      "qr-percent-chain"
    ],
    "scope": "Two introductory percent-reasoning objectives with fictional quantities; no timing, score, financial or readiness predictions.",
    "canon": {
      "id": "qr-percent-change",
      "version": "0.3.0",
      "sourceRelativePath": "visuals/sheets/qr/qr-percent-change.json",
      "sourceSha256": "9c71ba5ff21ea0d44a69da28b195b165c14ed02154c9df6975e9c7c7b12db1b8"
    },
    "objectives": [
      {
        "id": "qr-percent-base",
        "world": "qr",
        "name": "Choose the correct percent-change baseline",
        "lesson": "Percent change = (new − original)/original × 100%. A decrease may be reported as a positive magnitude with the word decrease. The original quantity is the denominator. To reverse a known percentage change, divide the final quantity by its multiplier. For combined groups, add their original quantities and their new quantities before calculating the overall change; an unweighted average is guaranteed to give the combined rate when the original group sizes are equal; otherwise use actual totals.",
        "sourceUrls": [
          "https://openstax.org/books/prealgebra-2e/pages/6-2-solve-general-applications-of-percent"
        ],
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key and task-family review. Not external subject-specialist certification or a learner efficacy study."
      },
      {
        "id": "qr-percent-chain",
        "world": "qr",
        "name": "Track successive percentage and fixed-amount changes",
        "lesson": "An increase of r% multiplies the current amount by 1 + r/100; a decrease multiplies it by 1 − r/100. Successive percentage multipliers multiply, so equal up/down percentages usually do not cancel. A recovery percentage uses the reduced amount as its base. A fixed-number addition is a different operation; changing its position relative to a percentage step can change the result.",
        "sourceUrls": [
          "https://openstax.org/books/prealgebra-2e/pages/6-2-solve-general-applications-of-percent"
        ],
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key and task-family review. Not external subject-specialist certification or a learner efficacy study."
      }
    ],
    "teachingByObjective": {
      "qr-percent-base": {
        "objectiveId": "qr-percent-base",
        "version": 1,
        "core": "Percent change = (new − original)/original × 100%. A decrease may be reported as a positive magnitude with the word decrease. The original quantity is the denominator. To reverse a known percentage change, divide the final quantity by its multiplier. For combined groups, add their original quantities and their new quantities before calculating the overall change; an unweighted average is guaranteed to give the combined rate when the original group sizes are equal; otherwise use actual totals.",
        "terms": [
          {
            "term": "Baseline",
            "meaning": "The original quantity used as the denominator."
          },
          {
            "term": "Percent",
            "meaning": "A quantity per hundred; 12% is 0.12."
          },
          {
            "term": "Multiplier",
            "meaning": "The factor converting an original amount to a new amount."
          },
          {
            "term": "Weighted total",
            "meaning": "A combined amount that retains the actual sizes of its component groups."
          }
        ],
        "assumptions": [
          "Quantities are nonnegative and the original baseline is positive.",
          "Use exact arithmetic for the stated whole-number values; no rounding is required unless requested.",
          "These are fictional inventory calculations, not forecasts or recommendations."
        ],
        "workedExample": {
          "prompt": "A fictional archive has 90 catalog entries, then 117. Find the percent increase.",
          "steps": [
            "The change is 117 − 90 = 27 entries.",
            "The original baseline is 90 entries, not 117.",
            "27/90 = 0.30; multiply by 100%."
          ],
          "answer": "30% increase.",
          "familyId": "qr-percent-worked-original-denominator",
          "role": "instruction-only"
        },
        "commonMistake": "Dividing by the new amount answers a different question.",
        "nextAction": "Name the original base before calculating a ratio.",
        "sourceUrls": [
          "https://openstax.org/books/prealgebra-2e/pages/6-2-solve-general-applications-of-percent"
        ],
        "canon": {
          "id": "qr-percent-change",
          "version": "0.3.0",
          "sourceRelativePath": "visuals/sheets/qr/qr-percent-change.json",
          "sourceSha256": "9c71ba5ff21ea0d44a69da28b195b165c14ed02154c9df6975e9c7c7b12db1b8",
          "sourceRepository": "ace-system",
          "adaptationVersion": 1,
          "reviewScope": "Original-denominator changes, reverse baseline and aggregation of unequal groups.",
          "importsSourceAssessments": false,
          "formativeCanonChecksProgressEligible": false
        },
        "canonIntegration": "integrated-selected-scope",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key and task-family review. Not external subject-specialist certification or a learner efficacy study."
      },
      "qr-percent-chain": {
        "objectiveId": "qr-percent-chain",
        "version": 1,
        "core": "An increase of r% multiplies the current amount by 1 + r/100; a decrease multiplies it by 1 − r/100. Successive percentage multipliers multiply, so equal up/down percentages usually do not cancel. A recovery percentage uses the reduced amount as its base. A fixed-number addition is a different operation; changing its position relative to a percentage step can change the result.",
        "terms": [
          {
            "term": "Successive",
            "meaning": "One step follows another and uses the amount then present."
          },
          {
            "term": "Net change",
            "meaning": "The overall difference between the final and original amounts."
          },
          {
            "term": "Recovery percentage",
            "meaning": "The increase from a reduced amount needed to reach a target."
          },
          {
            "term": "Fixed addition",
            "meaning": "Adding a specified number of units; it is not a percentage multiplier."
          }
        ],
        "assumptions": [
          "Quantities are nonnegative and the original baseline is positive.",
          "Use exact arithmetic for the stated whole-number values; no rounding is required unless requested.",
          "These are fictional inventory calculations, not forecasts or recommendations."
        ],
        "workedExample": {
          "prompt": "A fictional display count rises by 50%, then falls by 20%. What is the net change?",
          "steps": [
            "Represent the steps by multipliers 1.50 and 0.80.",
            "Multiply them: 1.50 × 0.80 = 1.20.",
            "The final count is 120% of the original."
          ],
          "answer": "20% net increase.",
          "familyId": "qr-percent-worked-multiplier-product",
          "role": "instruction-only"
        },
        "commonMistake": "Adding +50 and −20 would ignore the changed second-step base.",
        "nextAction": "Write each operation in order; distinguish multiplication from a fixed addition.",
        "sourceUrls": [
          "https://openstax.org/books/prealgebra-2e/pages/6-2-solve-general-applications-of-percent"
        ],
        "canon": {
          "id": "qr-percent-change",
          "version": "0.3.0",
          "sourceRelativePath": "visuals/sheets/qr/qr-percent-change.json",
          "sourceSha256": "9c71ba5ff21ea0d44a69da28b195b165c14ed02154c9df6975e9c7c7b12db1b8",
          "sourceRepository": "ace-system",
          "adaptationVersion": 1,
          "reviewScope": "Multiplicative changes, recovery baseline and mixed fixed/percentage operations.",
          "importsSourceAssessments": false,
          "formativeCanonChecksProgressEligible": false
        },
        "canonIntegration": "integrated-selected-scope",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key and task-family review. Not external subject-specialist certification or a learner efficacy study."
      }
    },
    "items": [
      {
        "id": "next-qr-percent-base-p1",
        "objectiveId": "qr-percent-base",
        "familyId": "qr-percent-original-denominator",
        "familyRationale": "Direct relative change from original and new quantities.",
        "world": "qr",
        "pool": "practice",
        "prompt": "A fictional exhibit’s label count rises from 150 to 180. What is the percent increase?",
        "choices": [
          "20%",
          "16 2/3%",
          "30%",
          "120%"
        ],
        "answer": 0,
        "hint": "Divide the change by the original count.",
        "explanation": "The increase is 30; 30/150 × 100% = 20%.",
        "feedback": [
          "Correct: the original 150 is the baseline.",
          "This divides by the new 180 rather than the original 150.",
          "30 is the added count, not its percentage of 150.",
          "120% describes the final count as a percentage of the original, not the increase."
        ],
        "sourceUrls": [
          "https://openstax.org/books/prealgebra-2e/pages/6-2-solve-general-applications-of-percent"
        ],
        "canonId": "qr-percent-change",
        "sourceId": "next-qr-percent-base-p1",
        "sourceVersion": "dat-expansion-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key and task-family review. Not external subject-specialist certification or a learner efficacy study."
      },
      {
        "id": "next-qr-percent-base-p2",
        "objectiveId": "qr-percent-base",
        "familyId": "qr-percent-original-denominator",
        "familyRationale": "Same relative-change family for a decrease; sign changes are not novelty.",
        "world": "qr",
        "pool": "practice",
        "prompt": "A sample tray’s inventory falls from 80 units to 68. What is the percent decrease?",
        "choices": [
          "12%",
          "15%",
          "17.65%",
          "85%"
        ],
        "answer": 1,
        "hint": "Use the lost amount over the original amount.",
        "explanation": "The loss is 12 units. 12/80 × 100% = 15%.",
        "feedback": [
          "12 is the number of units lost.",
          "Correct: a 12-unit loss from an 80-unit base is 15%.",
          "This uses the remaining 68 as the denominator.",
          "85% is the fraction remaining, not the fraction lost."
        ],
        "sourceUrls": [
          "https://openstax.org/books/prealgebra-2e/pages/6-2-solve-general-applications-of-percent"
        ],
        "canonId": "qr-percent-change",
        "sourceId": "next-qr-percent-base-p2",
        "sourceVersion": "dat-expansion-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key and task-family review. Not external subject-specialist certification or a learner efficacy study."
      },
      {
        "id": "next-qr-percent-base-c1",
        "objectiveId": "qr-percent-base",
        "familyId": "qr-percent-reverse-baseline",
        "familyRationale": "Undo a stated percentage multiplier; this is separate from direct change but not reserved as delayed novelty.",
        "world": "qr",
        "pool": "check",
        "prompt": "After a 20% increase, a fictional collection contains 72 tokens. How many tokens did it contain originally?",
        "choices": [
          "57.6",
          "86.4",
          "60",
          "52"
        ],
        "answer": 2,
        "hint": "The final quantity equals 1.20 times the original.",
        "explanation": "Original = 72/1.20 = 60.",
        "feedback": [
          "Subtracting 20% of the final amount uses the wrong baseline.",
          "Multiplying again applies a second increase.",
          "Correct: 60 × 1.20 = 72.",
          "A 20% increase is not a fixed addition of 20 tokens."
        ],
        "sourceUrls": [
          "https://openstax.org/books/prealgebra-2e/pages/6-2-solve-general-applications-of-percent"
        ],
        "canonId": "qr-percent-change",
        "sourceId": "next-qr-percent-base-c1",
        "sourceVersion": "dat-expansion-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key and task-family review. Not external subject-specialist certification or a learner efficacy study."
      },
      {
        "id": "next-qr-percent-base-c2",
        "objectiveId": "qr-percent-base",
        "familyId": "qr-percent-original-denominator",
        "familyRationale": "Two direct changes compared using their own bases; numerical comparisons remain this family.",
        "world": "qr",
        "pool": "check",
        "prompt": "Inventory A grows by 15 units from an original 60. Inventory B grows by 24 units from an original 160. Which has the larger percentage increase?",
        "choices": [
          "B, because 24 exceeds 15.",
          "Both, because each increases.",
          "B, because its original inventory is larger.",
          "A: 25% compared with B’s 15%."
        ],
        "answer": 3,
        "hint": "A larger absolute increase need not be a larger relative increase.",
        "explanation": "A: 15/60 = 25%. B: 24/160 = 15%. A has the larger percentage increase.",
        "feedback": [
          "Absolute gains must be divided by their own baselines.",
          "Positive changes can have different percentages.",
          "A larger denominator does not guarantee a larger relative gain.",
          "Correct: compare the two baseline-normalized gains."
        ],
        "sourceUrls": [
          "https://openstax.org/books/prealgebra-2e/pages/6-2-solve-general-applications-of-percent"
        ],
        "canonId": "qr-percent-change",
        "sourceId": "next-qr-percent-base-c2",
        "sourceVersion": "dat-expansion-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key and task-family review. Not external subject-specialist certification or a learner efficacy study."
      },
      {
        "id": "next-qr-percent-base-l1",
        "objectiveId": "qr-percent-base",
        "familyId": "qr-percent-weighted-aggregation",
        "familyRationale": "Novel composition across unequal groups; not another single-inventory numerical substitution.",
        "world": "qr",
        "pool": "later",
        "prompt": "Two sections of a fictional archive start with 80 and 120 entries. The first grows by 25%; the second grows by 10%. What is the percent increase in their combined entry count?",
        "choices": [
          "17.5%",
          "35%",
          "16%",
          "20%"
        ],
        "answer": 2,
        "hint": "Add actual old and new counts before finding the combined percentage.",
        "explanation": "The first gains 20 entries and the second gains 12. Combined gain = 32 from an original 200, so 32/200 = 16%.",
        "feedback": [
          "The unweighted average ignores unequal original group sizes.",
          "Adding the two percentages ignores both baselines.",
          "Correct: the combined count changes from 200 to 232.",
          "20 is the first group’s gain in entries, not the combined percentage."
        ],
        "sourceUrls": [
          "https://openstax.org/books/prealgebra-2e/pages/6-2-solve-general-applications-of-percent"
        ],
        "canonId": "qr-percent-change",
        "sourceId": "next-qr-percent-base-l1",
        "sourceVersion": "dat-expansion-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key and task-family review. Not external subject-specialist certification or a learner efficacy study."
      },
      {
        "id": "next-qr-percent-chain-p1",
        "objectiveId": "qr-percent-chain",
        "familyId": "qr-percent-multiplier-chain",
        "familyRationale": "Compose two percentage multipliers; new rates remain this family.",
        "world": "qr",
        "pool": "practice",
        "prompt": "A counter rises by 10% and then falls by 20%. What is its net percentage change?",
        "choices": [
          "10% decrease",
          "12% decrease",
          "12% increase",
          "30% decrease"
        ],
        "answer": 1,
        "hint": "Multiply 1.10 by 0.80.",
        "explanation": "1.10 × 0.80 = 0.88; the final value is 88% of the original, a 12% decrease.",
        "feedback": [
          "Subtracting the rates ignores the changing baseline.",
          "Correct: the product multiplier is 0.88.",
          "A multiplier below one represents a decrease.",
          "Adding the magnitudes ignores direction and changed base."
        ],
        "sourceUrls": [
          "https://openstax.org/books/prealgebra-2e/pages/6-2-solve-general-applications-of-percent"
        ],
        "canonId": "qr-percent-change",
        "sourceId": "next-qr-percent-chain-p1",
        "sourceVersion": "dat-expansion-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key and task-family review. Not external subject-specialist certification or a learner efficacy study."
      },
      {
        "id": "next-qr-percent-chain-p2",
        "objectiveId": "qr-percent-chain",
        "familyId": "qr-percent-multiplier-chain",
        "familyRationale": "Same multiplier composition with a different net direction.",
        "world": "qr",
        "pool": "practice",
        "prompt": "A fictional stock of counters increases by 40%, then decreases by 10%. What is the net change?",
        "choices": [
          "30% increase",
          "4% decrease",
          "26% increase",
          "50% increase"
        ],
        "answer": 2,
        "hint": "The second percentage acts on the already increased count.",
        "explanation": "1.40 × 0.90 = 1.26, so the net change is a 26% increase.",
        "feedback": [
          "This subtracts percentages as if their bases were equal.",
          "The product multiplier is above one, not below.",
          "Correct: the final quantity is 126% of the original.",
          "Adding magnitudes ignores the decrease."
        ],
        "sourceUrls": [
          "https://openstax.org/books/prealgebra-2e/pages/6-2-solve-general-applications-of-percent"
        ],
        "canonId": "qr-percent-change",
        "sourceId": "next-qr-percent-chain-p2",
        "sourceVersion": "dat-expansion-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key and task-family review. Not external subject-specialist certification or a learner efficacy study."
      },
      {
        "id": "next-qr-percent-chain-c1",
        "objectiveId": "qr-percent-chain",
        "familyId": "qr-percent-multiplier-chain",
        "familyRationale": "An equal-rate decrease/increase is still multiplier composition, not a new family.",
        "world": "qr",
        "pool": "check",
        "prompt": "An inventory decreases by 40%, then increases by 40%. Which statement is correct?",
        "choices": [
          "It returns exactly to its original count.",
          "It ends 16% above its original count.",
          "It ends 80% below its original count.",
          "It ends 16% below its original count."
        ],
        "answer": 3,
        "hint": "The increase is based on the reduced inventory.",
        "explanation": "0.60 × 1.40 = 0.84, which is 16% below the original.",
        "feedback": [
          "Equal percentages on different bases do not cancel.",
          "0.84 is below one.",
          "Adding the percentage magnitudes is not composition.",
          "Correct: 84% remains overall."
        ],
        "sourceUrls": [
          "https://openstax.org/books/prealgebra-2e/pages/6-2-solve-general-applications-of-percent"
        ],
        "canonId": "qr-percent-change",
        "sourceId": "next-qr-percent-chain-c1",
        "sourceVersion": "dat-expansion-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key and task-family review. Not external subject-specialist certification or a learner efficacy study."
      },
      {
        "id": "next-qr-percent-chain-c2",
        "objectiveId": "qr-percent-chain",
        "familyId": "qr-percent-recovery",
        "familyRationale": "Find an inverse multiplier to recover a stated loss.",
        "world": "qr",
        "pool": "check",
        "prompt": "An inventory loses 20% of its original count. What percentage increase from the reduced count restores the original count?",
        "choices": [
          "25%",
          "20%",
          "80%",
          "125%"
        ],
        "answer": 0,
        "hint": "Use an original count of 100 and a reduced count of 80.",
        "explanation": "The required gain is 20 from a base of 80: 20/80 = 25%. Equivalently, 0.80 × 1.25 = 1.",
        "feedback": [
          "Correct: the recovery multiplier is 1.25.",
          "A 20% increase from 80 reaches only 96.",
          "80% is the fraction remaining, not the needed gain.",
          "125% is the restored amount relative to the reduced base, not the increase alone."
        ],
        "sourceUrls": [
          "https://openstax.org/books/prealgebra-2e/pages/6-2-solve-general-applications-of-percent"
        ],
        "canonId": "qr-percent-change",
        "sourceId": "next-qr-percent-chain-c2",
        "sourceVersion": "dat-expansion-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key and task-family review. Not external subject-specialist certification or a learner efficacy study."
      },
      {
        "id": "next-qr-percent-chain-l1",
        "objectiveId": "qr-percent-chain",
        "familyId": "qr-percent-mixed-operation-order",
        "familyRationale": "Novel distinction between multiplicative and additive operations; changing their order is not merely another numerical percentage chain.",
        "world": "qr",
        "pool": "later",
        "prompt": "Begin with 100 counters. Plan A adds 20 counters, then increases the current count by 10%. Plan B increases the current count by 10%, then adds 20 counters. Which comparison is correct?",
        "choices": [
          "Both plans end at 130 because order never matters.",
          "Plan A ends 2 counters higher because the added 20 also receives the 10% increase.",
          "Plan B ends 2 counters higher because additions must come last.",
          "Plan A ends 20 counters higher."
        ],
        "answer": 1,
        "hint": "Evaluate each ordered sequence; a fixed addition is not a multiplier.",
        "explanation": "Plan A: (100 + 20) × 1.10 = 132. Plan B: 100 × 1.10 + 20 = 130. The two-counter difference is 10% of the added 20.",
        "feedback": [
          "Pure percentage multipliers can be reordered, but a fixed addition and a percentage multiplication generally cannot.",
          "Correct: the fixed addition receives the later percentage only in Plan A.",
          "Direct evaluation gives the opposite ordering.",
          "Both plans include the same fixed 20; the difference is its 10% increment."
        ],
        "sourceUrls": [
          "https://openstax.org/books/prealgebra-2e/pages/6-2-solve-general-applications-of-percent"
        ],
        "canonId": "qr-percent-change",
        "sourceId": "next-qr-percent-chain-l1",
        "sourceVersion": "dat-expansion-item-v1",
        "reviewStatus": "internal-reviewed",
        "verified": true,
        "progressEligible": true,
        "runtimeIntegrated": true,
        "reviewScope": "Independent internal source, answer-key and task-family review. Not external subject-specialist certification or a learner efficacy study."
      }
    ],
    "contentSha256": "33bc1044d843d2ed89d2bab1bfd777673a8cdc463eb5ed81e8bcf8a179617fa2",
    "reviewStatus": "internal-reviewed",
    "verified": true,
    "progressEligible": true,
    "runtimeIntegrated": true,
    "reviewScope": "Independent internal source, answer-key and task-family review. Not external subject-specialist certification or a learner efficacy study."
  }
];
