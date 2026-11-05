// Generated only after independent content, source-hash and PAT render reviews pass.
// Runtime data only: no authoring imports or proof metadata.
export const recoveryVersion = 1;
export const recoveryItems = [
  {
    "id": "next-qr.rates-recovery-a",
    "objectiveId": "qr.rates",
    "familyId": "qr.rates.combine",
    "familyRationale": "Alternate original checkpoint within the existing skill family. New quantities, orientation or context do not establish delayed-family novelty.",
    "world": "qr",
    "pool": "check",
    "prompt": "Two independent repair crews can each complete the same bridge repair alone in 8 hours and 24 hours. Their constant work rates add without interference. Starting together, how long do they need to finish one repair?",
    "choices": [
      "4 hours",
      "6 hours",
      "16 hours",
      "32 hours"
    ],
    "answer": 1,
    "hint": "Express each crew’s contribution in repairs per hour.",
    "explanation": "The combined rate is 1/8 + 1/24 = 1/6 repair per hour. One repair therefore takes 6 hours.",
    "feedback": [
      "Four hours would require a faster total rate than stated.",
      "Correct: the reciprocal of 1/6 repair per hour is 6 hours per repair.",
      "Averaging completion times does not add work rates.",
      "Adding the two completion times describes successive full repairs, not simultaneous work."
    ],
    "sourceUrls": [
      "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/dat_candidate_guide.pdf"
    ],
    "canonId": "qr-work-rates",
    "sourceId": "next-qr.rates-recovery-a",
    "sourceVersion": "dat-recovery-item-v1",
    "recoveryVersion": 1,
    "reviewStatus": "internal-reviewed",
    "verified": true,
    "progressEligible": true,
    "runtimeIntegrated": true,
    "authorship": "original-authored",
    "reviewScope": "Independently reviewed alternate checkpoints within existing task families. No new delayed-family novelty, full-subject mastery or score prediction is claimed."
  },
  {
    "id": "next-qr.rates-recovery-b",
    "objectiveId": "qr.rates",
    "familyId": "qr.rates.combine",
    "familyRationale": "Alternate original checkpoint within the existing skill family. New quantities, orientation or context do not establish delayed-family novelty.",
    "world": "qr",
    "pool": "check",
    "prompt": "Two pumps fill an empty reservoir independently in 10 minutes and 15 minutes. Both rates are constant, their flows add, and there is no outlet. How many minutes does filling one reservoir take when both pumps start together?",
    "choices": [
      "5 minutes",
      "12.5 minutes",
      "25 minutes",
      "6 minutes"
    ],
    "answer": 3,
    "hint": "Add reservoirs per minute, then invert the total rate.",
    "explanation": "1/10 + 1/15 = 1/6 reservoir per minute, so filling one reservoir takes 6 minutes.",
    "feedback": [
      "Half the faster time would require two pumps equally as fast as the faster pump.",
      "This averages separate completion times rather than adding rates.",
      "This adds separate completion times.",
      "Correct: together the pumps fill one-sixth of the reservoir each minute."
    ],
    "sourceUrls": [
      "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/dat_candidate_guide.pdf"
    ],
    "canonId": "qr-work-rates",
    "sourceId": "next-qr.rates-recovery-b",
    "sourceVersion": "dat-recovery-item-v1",
    "recoveryVersion": 1,
    "reviewStatus": "internal-reviewed",
    "verified": true,
    "progressEligible": true,
    "runtimeIntegrated": true,
    "authorship": "original-authored",
    "reviewScope": "Independently reviewed alternate checkpoints within existing task families. No new delayed-family novelty, full-subject mastery or score prediction is claimed."
  },
  {
    "id": "next-qr.algebra-recovery-a",
    "objectiveId": "qr.algebra",
    "familyId": "qr.algebra.linear",
    "familyRationale": "Alternate original checkpoint within the existing skill family. New quantities, orientation or context do not establish delayed-family novelty.",
    "world": "qr",
    "pool": "check",
    "prompt": "A field station buys six identical specimen trays. A one-time delivery fee is 7 credits, and the total is 49 credits. What is the price of one tray?",
    "choices": [
      "7 credits",
      "8 credits",
      "9 credits",
      "42 credits"
    ],
    "answer": 0,
    "hint": "Remove the fixed fee before dividing among the six trays.",
    "explanation": "If x is the tray price, 6x + 7 = 49. Thus 6x = 42 and x = 7 credits.",
    "feedback": [
      "Correct: 6 × 7 + 7 = 49 credits.",
      "Six trays at 8 credits plus the fee would cost 55 credits.",
      "Six trays at 9 credits plus the fee would cost 61 credits.",
      "42 credits pays for all six trays before delivery, not one tray."
    ],
    "sourceUrls": [
      "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/dat_candidate_guide.pdf"
    ],
    "sourceId": "next-qr.algebra-recovery-a",
    "sourceVersion": "dat-recovery-item-v1",
    "recoveryVersion": 1,
    "reviewStatus": "internal-reviewed",
    "verified": true,
    "progressEligible": true,
    "runtimeIntegrated": true,
    "authorship": "original-authored",
    "reviewScope": "Independently reviewed alternate checkpoints within existing task families. No new delayed-family novelty, full-subject mastery or score prediction is claimed."
  },
  {
    "id": "next-qr.algebra-recovery-b",
    "objectiveId": "qr.algebra",
    "familyId": "qr.algebra.linear",
    "familyRationale": "Alternate original checkpoint within the existing skill family. New quantities, orientation or context do not establish delayed-family novelty.",
    "world": "qr",
    "pool": "check",
    "prompt": "A courier makes five identical deliveries of x supply boxes each and one additional delivery of 4 boxes. The total delivered is 39 boxes. What is x?",
    "choices": [
      "5 boxes",
      "8.6 boxes",
      "7 boxes",
      "35 boxes"
    ],
    "answer": 2,
    "hint": "Translate the five equal deliveries and the additional boxes separately.",
    "explanation": "5x + 4 = 39, so 5x = 35 and x = 7 boxes.",
    "feedback": [
      "Five is the number of equal deliveries, not the boxes in each.",
      "Adding 4 to 39 before dividing reverses the required subtraction.",
      "Correct: five deliveries of 7 boxes plus 4 boxes total 39.",
      "35 boxes is the combined total of the five equal deliveries."
    ],
    "sourceUrls": [
      "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/dat_candidate_guide.pdf"
    ],
    "sourceId": "next-qr.algebra-recovery-b",
    "sourceVersion": "dat-recovery-item-v1",
    "recoveryVersion": 1,
    "reviewStatus": "internal-reviewed",
    "verified": true,
    "progressEligible": true,
    "runtimeIntegrated": true,
    "authorship": "original-authored",
    "reviewScope": "Independently reviewed alternate checkpoints within existing task families. No new delayed-family novelty, full-subject mastery or score prediction is claimed."
  },
  {
    "id": "next-qr.compare-recovery-a",
    "objectiveId": "qr.compare",
    "familyId": "qr.compare.fixed-negative-power",
    "familyRationale": "Alternate original checkpoint within the existing skill family. New quantities, orientation or context do not establish delayed-family novelty.",
    "world": "qr",
    "pool": "check",
    "prompt": "Let x = −3. Compare Quantity A: x squared and Quantity B: x.",
    "choices": [
      "Quantity A is greater.",
      "Quantity B is greater.",
      "The quantities are equal.",
      "The relationship cannot be determined."
    ],
    "answer": 0,
    "hint": "Evaluate the square as x multiplied by x.",
    "explanation": "Quantity A is (−3) × (−3) = 9. Quantity B is −3. Therefore A is greater.",
    "feedback": [
      "Correct: 9 is greater than −3.",
      "The product of two negative numbers is positive.",
      "Squaring −3 does not leave it unchanged.",
      "The value of x is fixed, so both quantities can be calculated."
    ],
    "sourceUrls": [
      "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/dat_candidate_guide.pdf"
    ],
    "sourceId": "next-qr.compare-recovery-a",
    "sourceVersion": "dat-recovery-item-v1",
    "recoveryVersion": 1,
    "reviewStatus": "internal-reviewed",
    "verified": true,
    "progressEligible": true,
    "runtimeIntegrated": true,
    "authorship": "original-authored",
    "reviewScope": "Independently reviewed alternate checkpoints within existing task families. No new delayed-family novelty, full-subject mastery or score prediction is claimed."
  },
  {
    "id": "next-qr.compare-recovery-b",
    "objectiveId": "qr.compare",
    "familyId": "qr.compare.fixed-negative-power",
    "familyRationale": "Alternate original checkpoint within the existing skill family. New quantities, orientation or context do not establish delayed-family novelty.",
    "world": "qr",
    "pool": "check",
    "prompt": "Let x = −4. Compare Quantity A: x and Quantity B: x squared.",
    "choices": [
      "Quantity A is greater.",
      "Quantity B is greater.",
      "The quantities are equal.",
      "The relationship cannot be determined."
    ],
    "answer": 1,
    "hint": "The quantity labels have changed; evaluate each before comparing.",
    "explanation": "A = −4 and B = (−4) × (−4) = 16. Quantity B is greater.",
    "feedback": [
      "A is negative while B is positive.",
      "Correct: 16 is greater than −4.",
      "The values −4 and 16 are unequal.",
      "The given x determines both values exactly."
    ],
    "sourceUrls": [
      "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/dat_candidate_guide.pdf"
    ],
    "sourceId": "next-qr.compare-recovery-b",
    "sourceVersion": "dat-recovery-item-v1",
    "recoveryVersion": 1,
    "reviewStatus": "internal-reviewed",
    "verified": true,
    "progressEligible": true,
    "runtimeIntegrated": true,
    "authorship": "original-authored",
    "reviewScope": "Independently reviewed alternate checkpoints within existing task families. No new delayed-family novelty, full-subject mastery or score prediction is claimed."
  },
  {
    "id": "next-qr.sufficiency-recovery-a",
    "objectiveId": "qr.sufficiency",
    "familyId": "qr.sufficiency.area",
    "familyRationale": "Alternate original checkpoint within the existing skill family. New quantities, orientation or context do not establish delayed-family novelty.",
    "world": "qr",
    "pool": "check",
    "prompt": "Can the area of a rectangle be determined? Statement I: its length is 11 cm. Statement II: its width is 6 cm. Each dimension is positive.",
    "choices": [
      "I alone is sufficient, but II alone is not.",
      "II alone is sufficient, but I alone is not.",
      "Together they are sufficient, but neither alone is sufficient.",
      "They are insufficient even together."
    ],
    "answer": 2,
    "hint": "Area requires the product of length and width; test each statement independently.",
    "explanation": "I permits many widths and areas. II permits many lengths and areas. Together they fix the area at 11 × 6 = 66 cm².",
    "feedback": [
      "Length alone leaves width undetermined.",
      "Width alone leaves length undetermined.",
      "Correct: only combining the two statements fixes both factors.",
      "Both dimensions are known together, so the area is fixed."
    ],
    "sourceUrls": [
      "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/dat_candidate_guide.pdf"
    ],
    "sourceId": "next-qr.sufficiency-recovery-a",
    "sourceVersion": "dat-recovery-item-v1",
    "recoveryVersion": 1,
    "reviewStatus": "internal-reviewed",
    "verified": true,
    "progressEligible": true,
    "runtimeIntegrated": true,
    "authorship": "original-authored",
    "reviewScope": "Independently reviewed alternate checkpoints within existing task families. No new delayed-family novelty, full-subject mastery or score prediction is claimed."
  },
  {
    "id": "next-qr.sufficiency-recovery-b",
    "objectiveId": "qr.sufficiency",
    "familyId": "qr.sufficiency.area",
    "familyRationale": "Alternate original checkpoint within the existing skill family. New quantities, orientation or context do not establish delayed-family novelty.",
    "world": "qr",
    "pool": "check",
    "prompt": "Can the area of a rectangle be determined? Statement I: its width is 9 cm. Statement II: its length is 4 cm. Each dimension is positive.",
    "choices": [
      "They are insufficient even together.",
      "I alone is sufficient, but II alone is not.",
      "II alone is sufficient, but I alone is not.",
      "Together they are sufficient, but neither alone is sufficient."
    ],
    "answer": 3,
    "hint": "Do not carry information from statement I into your test of statement II alone.",
    "explanation": "Width alone and length alone each leave the other dimension free. Together the area is 9 × 4 = 36 cm².",
    "feedback": [
      "Together both dimensions are known.",
      "Width alone cannot fix a rectangle’s area.",
      "Length alone cannot fix a rectangle’s area.",
      "Correct: the combined statements uniquely fix 36 cm²."
    ],
    "sourceUrls": [
      "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/dat_candidate_guide.pdf"
    ],
    "sourceId": "next-qr.sufficiency-recovery-b",
    "sourceVersion": "dat-recovery-item-v1",
    "recoveryVersion": 1,
    "reviewStatus": "internal-reviewed",
    "verified": true,
    "progressEligible": true,
    "runtimeIntegrated": true,
    "authorship": "original-authored",
    "reviewScope": "Independently reviewed alternate checkpoints within existing task families. No new delayed-family novelty, full-subject mastery or score prediction is claimed."
  },
  {
    "id": "next-qr-percent-base-recovery-a",
    "objectiveId": "qr-percent-base",
    "familyId": "qr-percent-reverse-baseline",
    "familyRationale": "Alternate original checkpoint within the existing skill family. New quantities, orientation or context do not establish delayed-family novelty.",
    "world": "qr",
    "pool": "check",
    "prompt": "After a 25% increase, a field archive contains 95 labeled samples. How many labeled samples did it contain before the increase?",
    "choices": [
      "71.25",
      "76",
      "118.75",
      "70"
    ],
    "answer": 1,
    "hint": "The final quantity is 1.25 times the original quantity.",
    "explanation": "The original count is 95/1.25 = 76 samples. Checking: 25% of 76 is 19, and 76 + 19 = 95.",
    "feedback": [
      "Subtracting 25% of the final amount uses the wrong baseline.",
      "Correct: 76 × 1.25 = 95.",
      "This applies an additional increase.",
      "The change is 25 percent, not 25 samples."
    ],
    "sourceUrls": [
      "https://openstax.org/books/prealgebra-2e/pages/6-2-solve-general-applications-of-percent"
    ],
    "canonId": "qr-percent-change",
    "sourceId": "next-qr-percent-base-recovery-a",
    "sourceVersion": "dat-recovery-item-v1",
    "recoveryVersion": 1,
    "reviewStatus": "internal-reviewed",
    "verified": true,
    "progressEligible": true,
    "runtimeIntegrated": true,
    "authorship": "original-authored",
    "reviewScope": "Independently reviewed alternate checkpoints within existing task families. No new delayed-family novelty, full-subject mastery or score prediction is claimed."
  },
  {
    "id": "next-qr-percent-base-recovery-b",
    "objectiveId": "qr-percent-base",
    "familyId": "qr-percent-original-denominator",
    "familyRationale": "Alternate original checkpoint within the existing skill family. New quantities, orientation or context do not establish delayed-family novelty.",
    "world": "qr",
    "pool": "check",
    "prompt": "A sample library’s inventory decreases from 240 to 198 entries. What is the percent decrease?",
    "choices": [
      "42%",
      "82.5%",
      "17.5%",
      "21.21%"
    ],
    "answer": 2,
    "hint": "Divide the number lost by the original inventory.",
    "explanation": "The loss is 240 − 198 = 42 entries. The percent decrease is 42/240 × 100% = 17.5%.",
    "feedback": [
      "42 is the number of entries lost, not its percentage of the original.",
      "82.5% is the fraction remaining.",
      "Correct: the 42-entry loss is 17.5% of 240.",
      "This uses the remaining inventory as the denominator."
    ],
    "sourceUrls": [
      "https://openstax.org/books/prealgebra-2e/pages/6-2-solve-general-applications-of-percent"
    ],
    "canonId": "qr-percent-change",
    "sourceId": "next-qr-percent-base-recovery-b",
    "sourceVersion": "dat-recovery-item-v1",
    "recoveryVersion": 1,
    "reviewStatus": "internal-reviewed",
    "verified": true,
    "progressEligible": true,
    "runtimeIntegrated": true,
    "authorship": "original-authored",
    "reviewScope": "Independently reviewed alternate checkpoints within existing task families. No new delayed-family novelty, full-subject mastery or score prediction is claimed."
  },
  {
    "id": "next-qr-percent-chain-recovery-a",
    "objectiveId": "qr-percent-chain",
    "familyId": "qr-percent-multiplier-chain",
    "familyRationale": "Alternate original checkpoint within the existing skill family. New quantities, orientation or context do not establish delayed-family novelty.",
    "world": "qr",
    "pool": "check",
    "prompt": "A fictional inventory rises by 25%, then falls by 12% of the amount then present. What is the net percentage change from the original inventory?",
    "choices": [
      "13% increase",
      "37% increase",
      "10% decrease",
      "10% increase"
    ],
    "answer": 3,
    "hint": "Apply 1.25 and then 0.88 to the same starting quantity.",
    "explanation": "1.25 × 0.88 = 1.10. The final inventory is 110% of the original, a 10% increase.",
    "feedback": [
      "Subtracting the printed rates ignores the second step’s changed base.",
      "Adding the percentage magnitudes ignores the decrease.",
      "The final multiplier is greater than one.",
      "Correct: a multiplier of 1.10 means a 10% increase."
    ],
    "sourceUrls": [
      "https://openstax.org/books/prealgebra-2e/pages/6-2-solve-general-applications-of-percent"
    ],
    "canonId": "qr-percent-change",
    "sourceId": "next-qr-percent-chain-recovery-a",
    "sourceVersion": "dat-recovery-item-v1",
    "recoveryVersion": 1,
    "reviewStatus": "internal-reviewed",
    "verified": true,
    "progressEligible": true,
    "runtimeIntegrated": true,
    "authorship": "original-authored",
    "reviewScope": "Independently reviewed alternate checkpoints within existing task families. No new delayed-family novelty, full-subject mastery or score prediction is claimed."
  },
  {
    "id": "next-qr-percent-chain-recovery-b",
    "objectiveId": "qr-percent-chain",
    "familyId": "qr-percent-recovery",
    "familyRationale": "Alternate original checkpoint within the existing skill family. New quantities, orientation or context do not establish delayed-family novelty.",
    "world": "qr",
    "pool": "check",
    "prompt": "An inventory loses 60% of its original count. What percentage increase from the remaining count is needed to restore the original count?",
    "choices": [
      "150%",
      "60%",
      "40%",
      "250%"
    ],
    "answer": 0,
    "hint": "For an original 100 counters, 40 remain. Compare the needed gain with 40.",
    "explanation": "The needed gain is 60 from a remaining base of 40. Thus 60/40 × 100% = 150%. A factor of 2.5 restores the original.",
    "feedback": [
      "Correct: 40 × 2.5 = 100, a 150% increase from 40.",
      "A 60% increase from 40 reaches only 64.",
      "40% is the original fraction remaining, not the needed increase.",
      "250% is the restored quantity as a percentage of the remaining quantity, not the increase alone."
    ],
    "sourceUrls": [
      "https://openstax.org/books/prealgebra-2e/pages/6-2-solve-general-applications-of-percent"
    ],
    "canonId": "qr-percent-change",
    "sourceId": "next-qr-percent-chain-recovery-b",
    "sourceVersion": "dat-recovery-item-v1",
    "recoveryVersion": 1,
    "reviewStatus": "internal-reviewed",
    "verified": true,
    "progressEligible": true,
    "runtimeIntegrated": true,
    "authorship": "original-authored",
    "reviewScope": "Independently reviewed alternate checkpoints within existing task families. No new delayed-family novelty, full-subject mastery or score prediction is claimed."
  },
  {
    "id": "next-pat.one-fold-recovery-a",
    "objectiveId": "pat.one-fold",
    "familyId": "pat.fold.vertical",
    "familyRationale": "Alternate original checkpoint within the existing skill family. New quantities, orientation or context do not establish delayed-family novelty.",
    "world": "pat",
    "pool": "check",
    "prompt": "The left half folds onto the right half. The diagrams show an 8-by-8 guide grid. A circular hole is punched through every layer at the marked point. Which pattern shows the fully opened sheet?",
    "choices": [
      "Pattern A",
      "Pattern B",
      "Pattern C",
      "Pattern D"
    ],
    "answer": 2,
    "hint": "Undo the last fold first. Reflect each layer across its actual crease.",
    "explanation": "The left half folds onto the right half. Opening the folded layers produces 2 holes, reflected across the vertical midline. The sheet is never turned or twisted.",
    "feedback": [
      "This shows only the marked punch and omits the other layers.",
      "This reflects across the unused crease.",
      "Correct: each unfolded hole preserves its perpendicular distance from the crease.",
      "The holes have been shifted. Unfolding reflects about a crease without sliding a hole."
    ],
    "sourceUrls": [
      "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/perceptual_ability_test_section_instructions.pdf"
    ],
    "figureAlt": "Original square, indicated fold sequence, and final folded packet with one marked punch. The unfolded answer is not shown.",
    "canonId": "pat-hole-punching",
    "fig": "data/figures/recovery/pat.one-fold-a-question.f3bbccd4421c551a.svg",
    "optionVisuals": [
      "data/figures/recovery/pat.one-fold-a-option-0.5665d9c4a956fda8.svg",
      "data/figures/recovery/pat.one-fold-a-option-1.a7c3507ed6d9e122.svg",
      "data/figures/recovery/pat.one-fold-a-option-2.ef01366a421cd8dc.svg",
      "data/figures/recovery/pat.one-fold-a-option-3.a44ea25e9bbd7673.svg"
    ],
    "sourceId": "next-pat.one-fold-recovery-a",
    "sourceVersion": "dat-recovery-item-v1",
    "recoveryVersion": 1,
    "reviewStatus": "internal-reviewed",
    "verified": true,
    "progressEligible": true,
    "runtimeIntegrated": true,
    "authorship": "original-authored",
    "reviewScope": "Independently reviewed alternate checkpoints within existing task families. No new delayed-family novelty, full-subject mastery or score prediction is claimed."
  },
  {
    "id": "next-pat.one-fold-recovery-b",
    "objectiveId": "pat.one-fold",
    "familyId": "pat.fold.horizontal",
    "familyRationale": "Alternate original checkpoint within the existing skill family. New quantities, orientation or context do not establish delayed-family novelty.",
    "world": "pat",
    "pool": "check",
    "prompt": "The bottom half folds onto the top half. The diagrams show an 8-by-8 guide grid. A circular hole is punched through every layer at the marked point. Which pattern shows the fully opened sheet?",
    "choices": [
      "Pattern A",
      "Pattern B",
      "Pattern C",
      "Pattern D"
    ],
    "answer": 0,
    "hint": "Undo the last fold first. Reflect each layer across its actual crease.",
    "explanation": "The bottom half folds onto the top half. Opening the folded layers produces 2 holes, reflected across the horizontal midline. The sheet is never turned or twisted.",
    "feedback": [
      "Correct: each unfolded hole preserves its perpendicular distance from the crease.",
      "This shows only the marked punch and omits the other layers.",
      "This reflects across the unused crease.",
      "The holes have been shifted. Unfolding reflects about a crease without sliding a hole."
    ],
    "sourceUrls": [
      "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/perceptual_ability_test_section_instructions.pdf"
    ],
    "figureAlt": "Original square, indicated fold sequence, and final folded packet with one marked punch. The unfolded answer is not shown.",
    "canonId": "pat-hole-punching",
    "fig": "data/figures/recovery/pat.one-fold-b-question.abfc1433f6f18c31.svg",
    "optionVisuals": [
      "data/figures/recovery/pat.one-fold-b-option-0.68ac8ad9238b9439.svg",
      "data/figures/recovery/pat.one-fold-b-option-1.51d89ce5dfa914f2.svg",
      "data/figures/recovery/pat.one-fold-b-option-2.93545adf9f123ddf.svg",
      "data/figures/recovery/pat.one-fold-b-option-3.ee827194b017d37a.svg"
    ],
    "sourceId": "next-pat.one-fold-recovery-b",
    "sourceVersion": "dat-recovery-item-v1",
    "recoveryVersion": 1,
    "reviewStatus": "internal-reviewed",
    "verified": true,
    "progressEligible": true,
    "runtimeIntegrated": true,
    "authorship": "original-authored",
    "reviewScope": "Independently reviewed alternate checkpoints within existing task families. No new delayed-family novelty, full-subject mastery or score prediction is claimed."
  },
  {
    "id": "next-pat.two-folds-recovery-a",
    "objectiveId": "pat.two-folds",
    "familyId": "pat.fold.both",
    "familyRationale": "Alternate original checkpoint within the existing skill family. New quantities, orientation or context do not establish delayed-family novelty.",
    "world": "pat",
    "pool": "check",
    "prompt": "First the left half folds onto the right half. Then the bottom half folds onto the top half. The diagrams show an 8-by-8 guide grid. A circular hole is punched through every layer at the marked point. Which pattern shows the fully opened sheet?",
    "choices": [
      "Pattern A",
      "Pattern B",
      "Pattern C",
      "Pattern D"
    ],
    "answer": 3,
    "hint": "Undo the last fold first. Reflect each layer across its actual crease.",
    "explanation": "First the left half folds onto the right half. Then the bottom half folds onto the top half. Opening the folded layers produces 4 holes, reflected across both midlines. The sheet is never turned or twisted.",
    "feedback": [
      "This shows only the marked punch and omits the other layers.",
      "This reverses only the vertical fold and omits the horizontal fold.",
      "The holes have been shifted. Unfolding reflects about a crease without sliding a hole.",
      "Correct: each unfolded hole preserves its perpendicular distance from the crease."
    ],
    "sourceUrls": [
      "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/perceptual_ability_test_section_instructions.pdf"
    ],
    "figureAlt": "Original square, indicated fold sequence, and final folded packet with one marked punch. The unfolded answer is not shown.",
    "canonId": "pat-hole-punching",
    "fig": "data/figures/recovery/pat.two-folds-a-question.9c45bfc445f4df28.svg",
    "optionVisuals": [
      "data/figures/recovery/pat.two-folds-a-option-0.5983484e23f707bb.svg",
      "data/figures/recovery/pat.two-folds-a-option-1.93545adf9f123ddf.svg",
      "data/figures/recovery/pat.two-folds-a-option-2.678369d5ff70a0eb.svg",
      "data/figures/recovery/pat.two-folds-a-option-3.7c7efe0acb623bed.svg"
    ],
    "sourceId": "next-pat.two-folds-recovery-a",
    "sourceVersion": "dat-recovery-item-v1",
    "recoveryVersion": 1,
    "reviewStatus": "internal-reviewed",
    "verified": true,
    "progressEligible": true,
    "runtimeIntegrated": true,
    "authorship": "original-authored",
    "reviewScope": "Independently reviewed alternate checkpoints within existing task families. No new delayed-family novelty, full-subject mastery or score prediction is claimed."
  },
  {
    "id": "next-pat.two-folds-recovery-b",
    "objectiveId": "pat.two-folds",
    "familyId": "pat.fold.both",
    "familyRationale": "Alternate original checkpoint within the existing skill family. New quantities, orientation or context do not establish delayed-family novelty.",
    "world": "pat",
    "pool": "check",
    "prompt": "First the left half folds onto the right half. Then the bottom half folds onto the top half. The diagrams show an 8-by-8 guide grid. A circular hole is punched through every layer at the marked point. Which pattern shows the fully opened sheet?",
    "choices": [
      "Pattern A",
      "Pattern B",
      "Pattern C",
      "Pattern D"
    ],
    "answer": 1,
    "hint": "Undo the last fold first. Reflect each layer across its actual crease.",
    "explanation": "First the left half folds onto the right half. Then the bottom half folds onto the top half. Opening the folded layers produces 4 holes, reflected across both midlines. The sheet is never turned or twisted.",
    "feedback": [
      "This shows only the marked punch and omits the other layers.",
      "Correct: each unfolded hole preserves its perpendicular distance from the crease.",
      "This reverses only the vertical fold and omits the horizontal fold.",
      "The holes have been shifted. Unfolding reflects about a crease without sliding a hole."
    ],
    "sourceUrls": [
      "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/perceptual_ability_test_section_instructions.pdf"
    ],
    "figureAlt": "Original square, indicated fold sequence, and final folded packet with one marked punch. The unfolded answer is not shown.",
    "canonId": "pat-hole-punching",
    "fig": "data/figures/recovery/pat.two-folds-b-question.d66720a342e66cdc.svg",
    "optionVisuals": [
      "data/figures/recovery/pat.two-folds-b-option-0.0d4a4d8fe49520ee.svg",
      "data/figures/recovery/pat.two-folds-b-option-1.ff41fe8105da512b.svg",
      "data/figures/recovery/pat.two-folds-b-option-2.5449e3e02bfdfbc0.svg",
      "data/figures/recovery/pat.two-folds-b-option-3.34905ebea89df3ab.svg"
    ],
    "sourceId": "next-pat.two-folds-recovery-b",
    "sourceVersion": "dat-recovery-item-v1",
    "recoveryVersion": 1,
    "reviewStatus": "internal-reviewed",
    "verified": true,
    "progressEligible": true,
    "runtimeIntegrated": true,
    "authorship": "original-authored",
    "reviewScope": "Independently reviewed alternate checkpoints within existing task families. No new delayed-family novelty, full-subject mastery or score prediction is claimed."
  },
  {
    "id": "next-pat-angle-opening-recovery-a",
    "objectiveId": "pat-angle-opening",
    "familyId": "pat-angle-pair-opening",
    "familyRationale": "Alternate original checkpoint within the existing skill family. New quantities, orientation or context do not establish delayed-family novelty.",
    "world": "pat",
    "pool": "check",
    "prompt": "Compare the two displayed minor angles. Which statement is correct?",
    "choices": [
      "Angle 1 is smaller.",
      "Angle 2 is smaller.",
      "The angles are equal.",
      "Arm lengths are needed to compare."
    ],
    "answer": 1,
    "hint": "Compare the openings at the vertices, not the gaps between endpoints.",
    "explanation": "Angle 2 has the smaller opening. Rotation and drawn arm length do not change the angle.",
    "feedback": [
      "The drawn openings do not support this comparison. Arm length and direction are not angle size.",
      "Correct: this matches the openings shown.",
      "The drawn openings do not support this comparison. Arm length and direction are not angle size.",
      "The drawn openings do not support this comparison. Arm length and direction are not angle size."
    ],
    "sourceUrls": [
      "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/perceptual_ability_test_section_instructions.pdf"
    ],
    "figureAlt": "Two minor-angle diagrams labeled 1 and 2, with no measurements.",
    "canonId": "pat-angle-ranking",
    "fig": "data/figures/recovery/pat-angle-opening-a-question.9b9c501d2dd25853.svg",
    "sourceId": "next-pat-angle-opening-recovery-a",
    "sourceVersion": "dat-recovery-item-v1",
    "recoveryVersion": 1,
    "reviewStatus": "internal-reviewed",
    "verified": true,
    "progressEligible": true,
    "runtimeIntegrated": true,
    "authorship": "original-authored",
    "reviewScope": "Independently reviewed alternate checkpoints within existing task families. No new delayed-family novelty, full-subject mastery or score prediction is claimed."
  },
  {
    "id": "next-pat-angle-opening-recovery-b",
    "objectiveId": "pat-angle-opening",
    "familyId": "pat-angle-pair-opening",
    "familyRationale": "Alternate original checkpoint within the existing skill family. New quantities, orientation or context do not establish delayed-family novelty.",
    "world": "pat",
    "pool": "check",
    "prompt": "Compare the two displayed minor angles. Which statement is correct?",
    "choices": [
      "Angle 1 is smaller.",
      "Angle 2 is smaller.",
      "The angles are equal.",
      "Arm lengths are needed to compare."
    ],
    "answer": 0,
    "hint": "Compare the openings at the vertices, not the gaps between endpoints.",
    "explanation": "Angle 1 has the smaller opening. Rotation and drawn arm length do not change the angle.",
    "feedback": [
      "Correct: this matches the openings shown.",
      "The drawn openings do not support this comparison. Arm length and direction are not angle size.",
      "The drawn openings do not support this comparison. Arm length and direction are not angle size.",
      "The drawn openings do not support this comparison. Arm length and direction are not angle size."
    ],
    "sourceUrls": [
      "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/perceptual_ability_test_section_instructions.pdf"
    ],
    "figureAlt": "Two minor-angle diagrams labeled 1 and 2, with no measurements.",
    "canonId": "pat-angle-ranking",
    "fig": "data/figures/recovery/pat-angle-opening-b-question.cd32ab3d50b45b62.svg",
    "sourceId": "next-pat-angle-opening-recovery-b",
    "sourceVersion": "dat-recovery-item-v1",
    "recoveryVersion": 1,
    "reviewStatus": "internal-reviewed",
    "verified": true,
    "progressEligible": true,
    "runtimeIntegrated": true,
    "authorship": "original-authored",
    "reviewScope": "Independently reviewed alternate checkpoints within existing task families. No new delayed-family novelty, full-subject mastery or score prediction is claimed."
  },
  {
    "id": "next-pat-angle-order-recovery-a",
    "objectiveId": "pat-angle-order",
    "familyId": "pat-angle-four-ordering",
    "familyRationale": "Alternate original checkpoint within the existing skill family. New quantities, orientation or context do not establish delayed-family novelty.",
    "world": "pat",
    "pool": "check",
    "prompt": "Rank the four displayed minor angles from smallest to largest.",
    "choices": [
      "3, 4, 1, 2",
      "1, 3, 4, 2",
      "3, 1, 4, 2",
      "2, 4, 1, 3"
    ],
    "answer": 2,
    "hint": "Compare the openings at the vertices, not the gaps between endpoints.",
    "explanation": "The increasing order is 3, 1, 4, 2. Compare the openings at their vertices, keeping each label once.",
    "feedback": [
      "At least one pair is reversed. Start with the smallest opening and check each adjacent pair.",
      "At least one pair is reversed. Start with the smallest opening and check each adjacent pair.",
      "Correct: this matches the openings shown.",
      "At least one pair is reversed. Start with the smallest opening and check each adjacent pair."
    ],
    "sourceUrls": [
      "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/perceptual_ability_test_section_instructions.pdf"
    ],
    "figureAlt": "Four minor-angle diagrams labeled 1 through 4, with no measurements.",
    "canonId": "pat-angle-ranking",
    "fig": "data/figures/recovery/pat-angle-order-a-question.7ebe2a1e08e8a7e2.svg",
    "sourceId": "next-pat-angle-order-recovery-a",
    "sourceVersion": "dat-recovery-item-v1",
    "recoveryVersion": 1,
    "reviewStatus": "internal-reviewed",
    "verified": true,
    "progressEligible": true,
    "runtimeIntegrated": true,
    "authorship": "original-authored",
    "reviewScope": "Independently reviewed alternate checkpoints within existing task families. No new delayed-family novelty, full-subject mastery or score prediction is claimed."
  },
  {
    "id": "next-pat-angle-order-recovery-b",
    "objectiveId": "pat-angle-order",
    "familyId": "pat-angle-four-ordering",
    "familyRationale": "Alternate original checkpoint within the existing skill family. New quantities, orientation or context do not establish delayed-family novelty.",
    "world": "pat",
    "pool": "check",
    "prompt": "Rank the four displayed minor angles from smallest to largest.",
    "choices": [
      "2, 1, 3, 4",
      "4, 1, 3, 2",
      "3, 2, 1, 4",
      "2, 3, 1, 4"
    ],
    "answer": 3,
    "hint": "Compare the openings at the vertices, not the gaps between endpoints.",
    "explanation": "The increasing order is 2, 3, 1, 4. Compare the openings at their vertices, keeping each label once.",
    "feedback": [
      "At least one pair is reversed. Start with the smallest opening and check each adjacent pair.",
      "At least one pair is reversed. Start with the smallest opening and check each adjacent pair.",
      "At least one pair is reversed. Start with the smallest opening and check each adjacent pair.",
      "Correct: this matches the openings shown."
    ],
    "sourceUrls": [
      "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/perceptual_ability_test_section_instructions.pdf"
    ],
    "figureAlt": "Four minor-angle diagrams labeled 1 through 4, with no measurements.",
    "canonId": "pat-angle-ranking",
    "fig": "data/figures/recovery/pat-angle-order-b-question.cc2a4e73b979587d.svg",
    "sourceId": "next-pat-angle-order-recovery-b",
    "sourceVersion": "dat-recovery-item-v1",
    "recoveryVersion": 1,
    "reviewStatus": "internal-reviewed",
    "verified": true,
    "progressEligible": true,
    "runtimeIntegrated": true,
    "authorship": "original-authored",
    "reviewScope": "Independently reviewed alternate checkpoints within existing task families. No new delayed-family novelty, full-subject mastery or score prediction is claimed."
  },
  {
    "id": "next-gc-barrier-recovery-a",
    "objectiveId": "gc-barrier",
    "familyId": "gc-profile-barrier",
    "familyRationale": "Alternate original checkpoint within an existing skill family. New quantities, structures or wording do not establish delayed-family novelty.",
    "world": "gc",
    "pool": "check",
    "prompt": "An original one-step potential-energy model places reactants at 12 kJ/mol, products at 44 kJ/mol, and the transition-state peak at 96 kJ/mol. What is the reverse activation energy?",
    "choices": [
      "32 kJ/mol",
      "52 kJ/mol",
      "84 kJ/mol",
      "96 kJ/mol"
    ],
    "answer": 1,
    "hint": "The reverse reaction starts from the product energy level.",
    "explanation": "The reverse barrier is the peak minus the product level: 96 − 44 = 52 kJ/mol. The 32 kJ/mol endpoint difference is not an activation barrier.",
    "feedback": [
      "32 kJ/mol is products minus reactants.",
      "Correct: the reverse path rises from 44 to 96 kJ/mol.",
      "84 kJ/mol is the forward barrier, measured from 12.",
      "The peak height must be measured relative to the reverse starting level."
    ],
    "sourceUrls": [
      "https://openstax.org/books/chemistry-2e/pages/12-7-catalysis",
      "https://openstax.org/books/chemistry-2e/pages/16-4-free-energy"
    ],
    "sourceId": "next-gc-barrier-recovery-a",
    "sourceVersion": "dat-recovery-item-v1",
    "recoveryVersion": 1,
    "reviewStatus": "internal-reviewed",
    "verified": true,
    "progressEligible": true,
    "runtimeIntegrated": true,
    "authorship": "original-authored",
    "reviewScope": "Independently reviewed alternate checkpoints within existing task families. No new delayed-family novelty, full-subject mastery or score prediction is claimed."
  },
  {
    "id": "next-gc-barrier-recovery-b",
    "objectiveId": "gc-barrier",
    "familyId": "gc-favorability-rate",
    "familyRationale": "Alternate original checkpoint within an existing skill family. New quantities, structures or wording do not establish delayed-family novelty.",
    "world": "gc",
    "pool": "check",
    "prompt": "At fixed temperature and pressure, a reaction has an actual reaction Gibbs energy change of −6 kJ/mol at its present composition. Its forward activation barrier is large. Which conclusion is justified?",
    "choices": [
      "Both forward and reverse reactions have stopped.",
      "The reaction must finish immediately.",
      "The forward direction is thermodynamically favored, but the rate may be slow.",
      "A negative Gibbs energy change makes the activation barrier zero."
    ],
    "answer": 2,
    "hint": "Thermodynamic direction and the height of a kinetic barrier answer different questions.",
    "explanation": "The negative actual reaction Gibbs energy change favors net forward change under the stated conditions. A large activation barrier can still make that change slow; this information does not specify a completion time.",
    "feedback": [
      "A negative actual reaction Gibbs energy change does not identify equilibrium or stopped motion.",
      "Favorable direction does not establish a rapid rate.",
      "Correct: favorability does not remove a kinetic barrier.",
      "The sign of the reaction Gibbs energy change does not determine the activation barrier."
    ],
    "sourceUrls": [
      "https://openstax.org/books/chemistry-2e/pages/12-7-catalysis",
      "https://openstax.org/books/chemistry-2e/pages/16-4-free-energy"
    ],
    "sourceId": "next-gc-barrier-recovery-b",
    "sourceVersion": "dat-recovery-item-v1",
    "recoveryVersion": 1,
    "reviewStatus": "internal-reviewed",
    "verified": true,
    "progressEligible": true,
    "runtimeIntegrated": true,
    "authorship": "original-authored",
    "reviewScope": "Independently reviewed alternate checkpoints within existing task families. No new delayed-family novelty, full-subject mastery or score prediction is claimed."
  },
  {
    "id": "next-gc-catalyst-recovery-a",
    "objectiveId": "gc-catalyst",
    "familyId": "gc-catalyst-profile",
    "familyRationale": "Alternate original checkpoint within an existing skill family. New quantities, structures or wording do not establish delayed-family novelty.",
    "world": "gc",
    "pool": "check",
    "prompt": "In a simplified one-peak model at the same temperature, reactants stay at 18 kJ/mol and products stay at 6 kJ/mol. A catalyst changes the peak from 88 to 58 kJ/mol. What are the catalyzed forward barrier and the product-minus-reactant energy difference?",
    "choices": [
      "58 kJ/mol; −12 kJ/mol",
      "40 kJ/mol; +12 kJ/mol",
      "70 kJ/mol; −12 kJ/mol",
      "40 kJ/mol; −12 kJ/mol"
    ],
    "answer": 3,
    "hint": "Use the catalyzed peak for the barrier and the unchanged endpoints for their difference.",
    "explanation": "The new forward barrier is 58 − 18 = 40 kJ/mol. The endpoint difference remains 6 − 18 = −12 kJ/mol. This one-peak drawing is a teaching model; catalyzed mechanisms need not have one step.",
    "feedback": [
      "58 kJ/mol is the peak level before subtracting the reactant level.",
      "The barrier is correct, but the endpoint subtraction has the wrong sign.",
      "70 kJ/mol is the original barrier, 88 − 18.",
      "Correct: the catalyst lowers the barrier without changing the endpoints."
    ],
    "sourceUrls": [
      "https://openstax.org/books/chemistry-2e/pages/12-7-catalysis",
      "https://openstax.org/books/chemistry-2e/pages/13-3-shifting-equilibria-le-chateliers-principle"
    ],
    "sourceId": "next-gc-catalyst-recovery-a",
    "sourceVersion": "dat-recovery-item-v1",
    "recoveryVersion": 1,
    "reviewStatus": "internal-reviewed",
    "verified": true,
    "progressEligible": true,
    "runtimeIntegrated": true,
    "authorship": "original-authored",
    "reviewScope": "Independently reviewed alternate checkpoints within existing task families. No new delayed-family novelty, full-subject mastery or score prediction is claimed."
  },
  {
    "id": "next-gc-catalyst-recovery-b",
    "objectiveId": "gc-catalyst",
    "familyId": "gc-catalyst-equilibrium",
    "familyRationale": "Alternate original checkpoint within an existing skill family. New quantities, structures or wording do not establish delayed-family novelty.",
    "world": "gc",
    "pool": "check",
    "prompt": "A closed A ⇌ B system is already at equilibrium. A catalyst is added without changing temperature or volume and without adding or removing A or B. Which change can occur from the catalytic effect alone?",
    "choices": [
      "Faster opposing reactions with no net change in the equilibrium composition.",
      "A larger K because only the forward rate increases.",
      "Equal concentrations of A and B, even if they were unequal.",
      "Complete disappearance of the less concentrated species."
    ],
    "answer": 0,
    "hint": "At equilibrium the two opposing rates balance; a catalyst does not select a different equilibrium ratio.",
    "explanation": "A catalyst can increase the opposing reaction rates while they remain balanced. At the same temperature it does not change K or the equilibrium composition for the stated system.",
    "feedback": [
      "Correct: dynamic molecular conversion can accelerate while net composition stays constant.",
      "A catalyst does not raise K at fixed temperature.",
      "Equilibrium requires equal opposing rates, not equal concentrations.",
      "Catalysis does not override the equilibrium composition."
    ],
    "sourceUrls": [
      "https://openstax.org/books/chemistry-2e/pages/12-7-catalysis",
      "https://openstax.org/books/chemistry-2e/pages/13-3-shifting-equilibria-le-chateliers-principle"
    ],
    "sourceId": "next-gc-catalyst-recovery-b",
    "sourceVersion": "dat-recovery-item-v1",
    "recoveryVersion": 1,
    "reviewStatus": "internal-reviewed",
    "verified": true,
    "progressEligible": true,
    "runtimeIntegrated": true,
    "authorship": "original-authored",
    "reviewScope": "Independently reviewed alternate checkpoints within existing task families. No new delayed-family novelty, full-subject mastery or score prediction is claimed."
  },
  {
    "id": "next-gc-equilibrium-recovery-a",
    "objectiveId": "gc-equilibrium",
    "familyId": "gc-dynamic-equilibrium",
    "familyRationale": "Alternate original checkpoint within an existing skill family. New quantities, structures or wording do not establish delayed-family novelty.",
    "world": "gc",
    "pool": "check",
    "prompt": "In a closed, well-mixed A ⇌ B vessel at fixed temperature and volume, [A] is 0.25 M and [B] is 0.75 M. The forward and reverse rates are each 0.06 M/s. What follows at that moment?",
    "choices": [
      "The reverse reaction must speed up until A and B are equal.",
      "Both molecular conversions have stopped.",
      "There is no net concentration change from this reaction, even though conversion continues.",
      "The forward rate must be three times the reverse rate."
    ],
    "answer": 2,
    "hint": "Subtract the opposing rates to determine the net change.",
    "explanation": "For this 1:1 reaction, equal opposing rates give a zero net rate. Both rates are nonzero, so conversion continues despite constant concentrations. Unequal concentrations are compatible with dynamic equilibrium.",
    "feedback": [
      "Equal concentrations are not required when the opposing rates already match.",
      "Each stated rate is 0.06 M/s, not zero.",
      "Correct: 0.06 − 0.06 = 0 M/s net change.",
      "The supplied rates are equal; concentrations alone do not override them."
    ],
    "sourceUrls": [
      "https://openstax.org/books/chemistry-2e/pages/13-1-chemical-equilibria",
      "https://openstax.org/books/chemistry-2e/pages/13-2-equilibrium-constants"
    ],
    "canonId": "gc-equilibrium-q-k",
    "sourceId": "next-gc-equilibrium-recovery-a",
    "sourceVersion": "dat-recovery-item-v1",
    "recoveryVersion": 1,
    "reviewStatus": "internal-reviewed",
    "verified": true,
    "progressEligible": true,
    "runtimeIntegrated": true,
    "authorship": "original-authored",
    "reviewScope": "Independently reviewed alternate checkpoints within existing task families. No new delayed-family novelty, full-subject mastery or score prediction is claimed."
  },
  {
    "id": "next-gc-equilibrium-recovery-b",
    "objectiveId": "gc-equilibrium",
    "familyId": "gc-quotient-direction",
    "familyRationale": "Alternate original checkpoint within an existing skill family. New quantities, structures or wording do not establish delayed-family novelty.",
    "world": "gc",
    "pool": "check",
    "prompt": "For an ideal A ⇌ B mixture at one fixed temperature, K = 5 and Q = [B]/[A]. Immediately after preparation, [A] = 0.30 M and [B] = 0.60 M. With temperature and volume then fixed, which net direction moves the mixture toward equilibrium?",
    "choices": [
      "Net B → A, because B is more concentrated.",
      "Net A → B, because Q = 2 is less than K.",
      "No net reaction, because both substances are present.",
      "No net reaction, because Q and K are both positive."
    ],
    "answer": 1,
    "hint": "Calculate the given quotient, then compare it with the equilibrium target.",
    "explanation": "Q = 0.60/0.30 = 2. Since 2 < 5, net forward conversion raises B and lowers A, increasing B/A toward K. Merely having more B than A does not establish the equilibrium direction.",
    "feedback": [
      "The relevant comparison is Q with K, not B with A alone.",
      "Correct: the current ratio is below the equilibrium target.",
      "Both species may be present far from equilibrium.",
      "Positive ratios need not be equal; Q = K is the equilibrium criterion."
    ],
    "sourceUrls": [
      "https://openstax.org/books/chemistry-2e/pages/13-1-chemical-equilibria",
      "https://openstax.org/books/chemistry-2e/pages/13-2-equilibrium-constants"
    ],
    "canonId": "gc-equilibrium-q-k",
    "sourceId": "next-gc-equilibrium-recovery-b",
    "sourceVersion": "dat-recovery-item-v1",
    "recoveryVersion": 1,
    "reviewStatus": "internal-reviewed",
    "verified": true,
    "progressEligible": true,
    "runtimeIntegrated": true,
    "authorship": "original-authored",
    "reviewScope": "Independently reviewed alternate checkpoints within existing task families. No new delayed-family novelty, full-subject mastery or score prediction is claimed."
  },
  {
    "id": "next-gc-mole-conversion-recovery-a",
    "objectiveId": "gc-mole-conversion",
    "familyId": "gc-mole-mass-conversion",
    "familyRationale": "Alternate original checkpoint within an existing skill family. New quantities, structures or wording do not establish delayed-family novelty.",
    "world": "gc",
    "pool": "check",
    "prompt": "A pure sample contains 17.6 g of CO₂. Use the supplied molar mass of 44.0 g/mol. How many moles of CO₂ molecules are present?",
    "choices": [
      "0.800 mol",
      "2.50 mol",
      "774.4 mol",
      "0.400 mol"
    ],
    "answer": 3,
    "hint": "Arrange the conversion so grams cancel and moles remain.",
    "explanation": "17.6 g × (1 mol / 44.0 g) = 0.400 mol CO₂. The oxygen subscript does not double the number of CO₂ molecules.",
    "feedback": [
      "0.800 mol would count oxygen atoms, not CO₂ molecules.",
      "This inverts the required mass-to-mole ratio.",
      "Multiplying by molar mass does not cancel grams correctly.",
      "Correct: mass divided by molar mass gives 0.400 mol of the stated entity."
    ],
    "sourceUrls": [
      "https://openstax.org/books/chemistry-2e/pages/3-1-formula-mass-and-the-mole-concept"
    ],
    "canonId": "gc-stoichiometry-mole",
    "sourceId": "next-gc-mole-conversion-recovery-a",
    "sourceVersion": "dat-recovery-item-v1",
    "recoveryVersion": 1,
    "reviewStatus": "internal-reviewed",
    "verified": true,
    "progressEligible": true,
    "runtimeIntegrated": true,
    "authorship": "original-authored",
    "reviewScope": "Independently reviewed alternate checkpoints within existing task families. No new delayed-family novelty, full-subject mastery or score prediction is claimed."
  },
  {
    "id": "next-gc-mole-conversion-recovery-b",
    "objectiveId": "gc-mole-conversion",
    "familyId": "gc-mole-entity-count",
    "familyRationale": "Alternate original checkpoint within an existing skill family. New quantities, structures or wording do not establish delayed-family novelty.",
    "world": "gc",
    "pool": "check",
    "prompt": "A pure ionic sample contains 0.35 mol of Ca(NO₃)₂ formula units. How many moles of oxygen atoms does it contain, counting oxygen atoms whether bonded or unbonded?",
    "choices": [
      "2.10 mol",
      "1.05 mol",
      "0.70 mol",
      "0.35 mol"
    ],
    "answer": 0,
    "hint": "The outside subscript multiplies every atom in the NO₃ group.",
    "explanation": "Each formula unit has two NO₃ groups, so it contains 2 × 3 = 6 oxygen atoms. Thus 0.35 mol formula units × 6 = 2.10 mol oxygen atoms.",
    "feedback": [
      "Correct: there are six oxygen atoms per formula unit.",
      "This counts only one NO₃ group.",
      "This uses the outside 2 but omits the three oxygen atoms inside each group.",
      "This counts formula units rather than the oxygen atoms within them."
    ],
    "sourceUrls": [
      "https://openstax.org/books/chemistry-2e/pages/3-1-formula-mass-and-the-mole-concept"
    ],
    "canonId": "gc-stoichiometry-mole",
    "sourceId": "next-gc-mole-conversion-recovery-b",
    "sourceVersion": "dat-recovery-item-v1",
    "recoveryVersion": 1,
    "reviewStatus": "internal-reviewed",
    "verified": true,
    "progressEligible": true,
    "runtimeIntegrated": true,
    "authorship": "original-authored",
    "reviewScope": "Independently reviewed alternate checkpoints within existing task families. No new delayed-family novelty, full-subject mastery or score prediction is claimed."
  },
  {
    "id": "next-gc-limiting-reagent-recovery-a",
    "objectiveId": "gc-limiting-reagent",
    "familyId": "gc-limiting-normalized-inventory",
    "familyRationale": "Alternate original checkpoint within an existing skill family. New quantities, structures or wording do not establish delayed-family novelty.",
    "world": "gc",
    "pool": "check",
    "prompt": "Use the balanced model 2 Al + 3 Cl₂ → 2 AlCl₃. A vessel initially contains 0.80 mol Al and 0.90 mol Cl₂. Assume complete reaction by this equation, with no side reactions. Which reactant limits the product?",
    "choices": [
      "Al, because 0.80 is the smaller raw mole amount.",
      "Both, because both appear in the same equation.",
      "Neither, because a product can form.",
      "Cl₂, because 0.90/3 is less than 0.80/2."
    ],
    "answer": 3,
    "hint": "Compare available moles divided by the corresponding balanced coefficient.",
    "explanation": "Al supports 0.80/2 = 0.40 mol of reaction extent. Cl₂ supports 0.90/3 = 0.30 mol. The smaller extent is supplied by Cl₂, so it is limiting.",
    "feedback": [
      "Raw mole amounts cannot be compared without their coefficients.",
      "Both would run out together only at the stoichiometric ratio.",
      "Product formation still has an upper limit set by a reactant.",
      "Correct: the chlorine supply supports fewer complete stoichiometric batches."
    ],
    "sourceUrls": [
      "https://openstax.org/books/chemistry-2e/pages/4-3-reaction-stoichiometry",
      "https://openstax.org/books/chemistry-2e/pages/4-4-reaction-yields"
    ],
    "canonId": "gc-stoichiometry-mole",
    "sourceId": "next-gc-limiting-reagent-recovery-a",
    "sourceVersion": "dat-recovery-item-v1",
    "recoveryVersion": 1,
    "reviewStatus": "internal-reviewed",
    "verified": true,
    "progressEligible": true,
    "runtimeIntegrated": true,
    "authorship": "original-authored",
    "reviewScope": "Independently reviewed alternate checkpoints within existing task families. No new delayed-family novelty, full-subject mastery or score prediction is claimed."
  },
  {
    "id": "next-gc-limiting-reagent-recovery-b",
    "objectiveId": "gc-limiting-reagent",
    "familyId": "gc-limiting-yield-leftover",
    "familyRationale": "Alternate original checkpoint within an existing skill family. New quantities, structures or wording do not establish delayed-family novelty.",
    "world": "gc",
    "pool": "check",
    "prompt": "For 2 CO + O₂ → 2 CO₂, a closed inventory begins with 1.10 mol CO and 0.40 mol O₂. Assume the stated reaction runs to completion with no side reactions or product loss. What are the theoretical CO₂ formed and the CO remaining?",
    "choices": [
      "1.10 mol CO₂; 0 mol CO",
      "0.80 mol CO₂; 0.30 mol CO",
      "0.40 mol CO₂; 0.70 mol CO",
      "1.50 mol CO₂; 0 mol CO"
    ],
    "answer": 1,
    "hint": "Use the oxygen supply with the 2:1 CO-to-O₂ ratio, then subtract consumed CO.",
    "explanation": "The extent is min(1.10/2, 0.40/1) = 0.40 mol. CO₂ formed is 2 × 0.40 = 0.80 mol. CO consumed is also 0.80 mol, leaving 1.10 − 0.80 = 0.30 mol CO.",
    "feedback": [
      "Converting all CO would require 0.55 mol O₂, more than available.",
      "Correct: oxygen is exhausted while 0.30 mol CO remains.",
      "This treats the CO₂-to-O₂ coefficient ratio as 1:1.",
      "Adding reactant mole amounts does not give product moles."
    ],
    "sourceUrls": [
      "https://openstax.org/books/chemistry-2e/pages/4-3-reaction-stoichiometry",
      "https://openstax.org/books/chemistry-2e/pages/4-4-reaction-yields"
    ],
    "canonId": "gc-stoichiometry-mole",
    "sourceId": "next-gc-limiting-reagent-recovery-b",
    "sourceVersion": "dat-recovery-item-v1",
    "recoveryVersion": 1,
    "reviewStatus": "internal-reviewed",
    "verified": true,
    "progressEligible": true,
    "runtimeIntegrated": true,
    "authorship": "original-authored",
    "reviewScope": "Independently reviewed alternate checkpoints within existing task families. No new delayed-family novelty, full-subject mastery or score prediction is claimed."
  },
  {
    "id": "next-oc-electrons-recovery-a",
    "objectiveId": "oc-electrons",
    "familyId": "oc-sn2-arrow-pairs",
    "familyRationale": "Alternate original checkpoint within an existing skill family. New quantities, structures or wording do not establish delayed-family novelty.",
    "world": "oc",
    "pool": "check",
    "prompt": "In the specified SN2 step, CH₃S⁻ attacks the carbon bonded to chlorine in CH₃CH₂Cl. Which pair of full curved arrows correctly tracks the electron pairs?",
    "choices": [
      "A sulfur lone pair → the carbon bearing Cl; the C–Cl bond pair → Cl.",
      "The carbon bearing Cl → sulfur; a Cl lone pair → the C–Cl bond.",
      "A sulfur lone pair → Cl; the C–Cl bond pair → carbon.",
      "A sulfur lone pair → carbon; the C–Cl bond remains unchanged."
    ],
    "answer": 0,
    "hint": "Each arrow starts where an electron pair already exists and ends where that pair goes.",
    "explanation": "The sulfur lone pair supplies the new S–C bond. Simultaneously, the C–Cl bond pair goes to chlorine as it departs. This preserves the carbon octet in the specified concerted substitution.",
    "feedback": [
      "Correct: these arrows show the donating pair and the departing bond pair.",
      "The first arrow lacks the donating pair as its origin, and the second reverses bond cleavage.",
      "The nucleophile must form the new bond to carbon in the specified substitution.",
      "Keeping all original carbon bonds while adding another would exceed carbon’s octet."
    ],
    "sourceUrls": [
      "https://openstax.org/books/organic-chemistry/pages/6-3-polar-reactions",
      "https://openstax.org/books/organic-chemistry/pages/11-2-the-sn2-reaction",
      "https://openstax.org/books/organic-chemistry/pages/19-4-nucleophilic-addition-reactions-of-aldehydes-and-ketones"
    ],
    "sourceId": "next-oc-electrons-recovery-a",
    "sourceVersion": "dat-recovery-item-v1",
    "recoveryVersion": 1,
    "reviewStatus": "internal-reviewed",
    "verified": true,
    "progressEligible": true,
    "runtimeIntegrated": true,
    "authorship": "original-authored",
    "reviewScope": "Independently reviewed alternate checkpoints within existing task families. No new delayed-family novelty, full-subject mastery or score prediction is claimed."
  },
  {
    "id": "next-oc-electrons-recovery-b",
    "objectiveId": "oc-electrons",
    "familyId": "oc-carbonyl-arrow-pairs",
    "familyRationale": "Alternate original checkpoint within an existing skill family. New quantities, structures or wording do not establish delayed-family novelty.",
    "world": "oc",
    "pool": "check",
    "prompt": "Consider only the specified first addition step of CN⁻ to the carbonyl carbon of propanal, CH₃CH₂CHO. The cyanide carbon donates the incoming pair. Where must the C=O π electron pair move as the new C–C bond forms?",
    "choices": [
      "To the cyanide nitrogen, breaking the C≡N bond.",
      "Nowhere; the carbonyl carbon keeps its C=O double bond and gains another bond.",
      "Onto the carbonyl oxygen, making the C–O bond single.",
      "Onto the neighboring CH₂ group, breaking its C–C bond."
    ],
    "answer": 2,
    "hint": "Account for the carbonyl carbon’s octet while it gains a new bond.",
    "explanation": "The C=O π pair moves onto oxygen as the cyanide carbon forms the new bond to the carbonyl carbon. The C–O sigma bond remains. The first-step product has an alkoxide oxygen; no protonation is included in this step.",
    "feedback": [
      "Cyanide supplies the incoming pair through carbon here; its triple bond is not the carbonyl π pair.",
      "Carbon would exceed its octet if its existing double bond stayed while another bond formed.",
      "Correct: oxygen receives the π pair and the carbonyl carbon retains an octet.",
      "The stated addition does not require cleavage of the carbon skeleton."
    ],
    "sourceUrls": [
      "https://openstax.org/books/organic-chemistry/pages/6-3-polar-reactions",
      "https://openstax.org/books/organic-chemistry/pages/11-2-the-sn2-reaction",
      "https://openstax.org/books/organic-chemistry/pages/19-4-nucleophilic-addition-reactions-of-aldehydes-and-ketones"
    ],
    "sourceId": "next-oc-electrons-recovery-b",
    "sourceVersion": "dat-recovery-item-v1",
    "recoveryVersion": 1,
    "reviewStatus": "internal-reviewed",
    "verified": true,
    "progressEligible": true,
    "runtimeIntegrated": true,
    "authorship": "original-authored",
    "reviewScope": "Independently reviewed alternate checkpoints within existing task families. No new delayed-family novelty, full-subject mastery or score prediction is claimed."
  },
  {
    "id": "next-oc-sn2-conditions-recovery-a",
    "objectiveId": "oc-sn2-conditions",
    "familyId": "oc-sn2-substrate-selection",
    "familyRationale": "Alternate original checkpoint within an existing skill family. New quantities, structures or wording do not establish delayed-family novelty.",
    "world": "oc",
    "pool": "check",
    "prompt": "An anionic nucleophile and the solvent are held the same. Considering substrate accessibility for ordinary backside SN2 displacement of Br, which saturated alkyl bromide is the best candidate among these choices?",
    "choices": [
      "2-bromo-2-methylpropane, (CH₃)₃CBr",
      "1-bromobutane, CH₃CH₂CH₂CH₂Br",
      "2-bromobutane, CH₃CHBrCH₂CH₃",
      "2-bromo-2-methylbutane, (CH₃)₂C(Br)CH₂CH₃"
    ],
    "answer": 1,
    "hint": "Classify the carbon directly bonded to Br and compare crowding around that carbon.",
    "explanation": "1-bromobutane has an unhindered primary reacting carbon. The secondary center is more crowded, and the two tertiary centers block ordinary SN2 approach. This comparison concerns substrate accessibility, not a guaranteed product yield under every condition.",
    "feedback": [
      "The carbon bearing Br is tertiary and strongly blocks the ordinary backside route.",
      "Correct: the listed primary center is the most accessible.",
      "This center is secondary and more crowded than the listed unbranched primary center.",
      "This carbon bearing Br is tertiary despite the different chain length."
    ],
    "sourceUrls": [
      "https://openstax.org/books/organic-chemistry/pages/11-3-characteristics-of-the-sn2-reaction"
    ],
    "canonId": "oc-substitution-elimination",
    "sourceId": "next-oc-sn2-conditions-recovery-a",
    "sourceVersion": "dat-recovery-item-v1",
    "recoveryVersion": 1,
    "reviewStatus": "internal-reviewed",
    "verified": true,
    "progressEligible": true,
    "runtimeIntegrated": true,
    "authorship": "original-authored",
    "reviewScope": "Independently reviewed alternate checkpoints within existing task families. No new delayed-family novelty, full-subject mastery or score prediction is claimed."
  },
  {
    "id": "next-oc-sn2-conditions-recovery-b",
    "objectiveId": "oc-sn2-conditions",
    "familyId": "oc-sn2-solvent-class",
    "familyRationale": "Alternate original checkpoint within an existing skill family. New quantities, structures or wording do not establish delayed-family novelty.",
    "world": "oc",
    "pool": "check",
    "prompt": "For a specified SN2 reaction of an unhindered primary alkyl halide with an anionic nucleophile, which listed solvent is polar aprotic? Assume the reactants are soluble and the other conditions are suitable.",
    "choices": [
      "Water, H₂O",
      "Methanol, CH₃OH",
      "Ethanol, CH₃CH₂OH",
      "Dimethyl sulfoxide, (CH₃)₂SO"
    ],
    "answer": 3,
    "hint": "A protic solvent has an O–H or N–H bond that can donate a hydrogen bond to the anion.",
    "explanation": "Dimethyl sulfoxide is polar aprotic and lacks an O–H or N–H hydrogen-bond donor. Water, methanol and ethanol are protic. This classification does not make solvent choice a cure for an unsuitable substrate.",
    "feedback": [
      "Water has O–H bonds and is protic.",
      "Methanol has an O–H group and is protic.",
      "Ethanol has an O–H group and is protic.",
      "Correct: dimethyl sulfoxide is the polar aprotic option."
    ],
    "sourceUrls": [
      "https://openstax.org/books/organic-chemistry/pages/11-3-characteristics-of-the-sn2-reaction"
    ],
    "canonId": "oc-substitution-elimination",
    "sourceId": "next-oc-sn2-conditions-recovery-b",
    "sourceVersion": "dat-recovery-item-v1",
    "recoveryVersion": 1,
    "reviewStatus": "internal-reviewed",
    "verified": true,
    "progressEligible": true,
    "runtimeIntegrated": true,
    "authorship": "original-authored",
    "reviewScope": "Independently reviewed alternate checkpoints within existing task families. No new delayed-family novelty, full-subject mastery or score prediction is claimed."
  },
  {
    "id": "next-oc-sn2-path-recovery-a",
    "objectiveId": "oc-sn2-path",
    "familyId": "oc-sn2-rate-law",
    "familyRationale": "Alternate original checkpoint within an existing skill family. New quantities, structures or wording do not establish delayed-family novelty.",
    "world": "oc",
    "pool": "check",
    "prompt": "A specified SN2 reaction obeys rate = k[substrate][nucleophile]. At unchanged temperature and solvent, a new trial uses 1.5 times the original substrate concentration and 0.40 times the original nucleophile concentration. What is its initial rate relative to the original?",
    "choices": [
      "0.60 times",
      "1.10 times",
      "1.90 times",
      "3.75 times"
    ],
    "answer": 0,
    "hint": "Multiply the concentration factors because both concentrations appear as first powers.",
    "explanation": "With k unchanged, new rate/original rate = 1.5 × 0.40 = 0.60. The new initial rate is 60% of the original, a 40% decrease.",
    "feedback": [
      "Correct: the two factors multiply to 0.60.",
      "Subtracting the factors does not follow the stated rate law.",
      "Adding the factors does not follow the stated rate law.",
      "Dividing the factors treats nucleophile concentration as an inverse dependence."
    ],
    "sourceUrls": [
      "https://openstax.org/books/organic-chemistry/pages/11-2-the-sn2-reaction",
      "https://openstax.org/books/organic-chemistry/pages/5-5-sequence-rules-for-specifying-configuration"
    ],
    "canonId": "oc-substitution-elimination",
    "sourceId": "next-oc-sn2-path-recovery-a",
    "sourceVersion": "dat-recovery-item-v1",
    "recoveryVersion": 1,
    "reviewStatus": "internal-reviewed",
    "verified": true,
    "progressEligible": true,
    "runtimeIntegrated": true,
    "authorship": "original-authored",
    "reviewScope": "Independently reviewed alternate checkpoints within existing task families. No new delayed-family novelty, full-subject mastery or score prediction is claimed."
  },
  {
    "id": "next-oc-sn2-path-recovery-b",
    "objectiveId": "oc-sn2-path",
    "familyId": "oc-sn2-concerted-inversion",
    "familyRationale": "Alternate original checkpoint within an existing skill family. New quantities, structures or wording do not establish delayed-family novelty.",
    "world": "oc",
    "pool": "check",
    "prompt": "A reaction at a tetrahedral stereogenic carbon is established to proceed by SN2. Which description of that substitution step is consistent with this mechanism?",
    "choices": [
      "The leaving group first departs to form a free carbocation, then the nucleophile attacks either face.",
      "The nucleophile and leaving group exchange positions without changing the spatial arrangement.",
      "Backside approach forms the new bond as the leaving bond breaks, producing geometric inversion without a carbocation intermediate.",
      "Backside approach always guarantees that the product’s R/S letter is opposite, without checking priorities."
    ],
    "answer": 2,
    "hint": "Separate the geometric event from the naming procedure for the product.",
    "explanation": "The SN2 event is concerted: new-bond formation and leaving-bond cleavage occur in one step. Backside approach inverts the geometry at the reacting center. A product R/S label still requires ranking the product substituents.",
    "feedback": [
      "A discrete carbocation is not part of the specified SN2 step.",
      "Backside SN2 at the stated center produces geometric inversion.",
      "Correct: this describes the concerted event and its spatial result.",
      "The R/S label depends on the product priorities; geometric inversion alone does not determine the letter."
    ],
    "sourceUrls": [
      "https://openstax.org/books/organic-chemistry/pages/11-2-the-sn2-reaction",
      "https://openstax.org/books/organic-chemistry/pages/5-5-sequence-rules-for-specifying-configuration"
    ],
    "canonId": "oc-substitution-elimination",
    "sourceId": "next-oc-sn2-path-recovery-b",
    "sourceVersion": "dat-recovery-item-v1",
    "recoveryVersion": 1,
    "reviewStatus": "internal-reviewed",
    "verified": true,
    "progressEligible": true,
    "runtimeIntegrated": true,
    "authorship": "original-authored",
    "reviewScope": "Independently reviewed alternate checkpoints within existing task families. No new delayed-family novelty, full-subject mastery or score prediction is claimed."
  },
  {
    "id": "next-oc-acid-conjugate-pairs-recovery-a",
    "objectiveId": "oc-acid-conjugate-pairs",
    "familyId": "oc-acid-proton-charge-bookkeeping",
    "familyRationale": "Alternate original checkpoint within an existing skill family. New quantities, structures or wording do not establish delayed-family novelty.",
    "world": "oc",
    "pool": "check",
    "prompt": "Remove exactly one N–H proton, H⁺, from ethylammonium, CH₃CH₂NH₃⁺, without changing the carbon skeleton. Which species is its conjugate base?",
    "choices": [
      "CH₃CH₂NH₃",
      "CH₃CH₂NH₂⁻",
      "CH₃CH₂NH₄²⁺",
      "CH₃CH₂NH₂"
    ],
    "answer": 3,
    "hint": "Remove one hydrogen nucleus and reduce the total charge by one.",
    "explanation": "Removing H⁺ converts NH₃⁺ to NH₂ and changes total charge from +1 to 0. The conjugate base is neutral ethylamine, CH₃CH₂NH₂.",
    "feedback": [
      "This keeps all three N-bound hydrogens instead of removing the specified proton.",
      "Starting at +1 and removing +1 gives 0, not −1.",
      "This adds hydrogen and positive charge rather than removing H⁺.",
      "Correct: one fewer H and one less positive charge gives neutral ethylamine."
    ],
    "sourceUrls": [
      "https://openstax.org/books/organic-chemistry/pages/2-8-acid-and-base-strength"
    ],
    "canonId": "oc-acidity-cardio",
    "sourceId": "next-oc-acid-conjugate-pairs-recovery-a",
    "sourceVersion": "dat-recovery-item-v1",
    "recoveryVersion": 1,
    "reviewStatus": "internal-reviewed",
    "verified": true,
    "progressEligible": true,
    "runtimeIntegrated": true,
    "authorship": "original-authored",
    "reviewScope": "Independently reviewed alternate checkpoints within existing task families. No new delayed-family novelty, full-subject mastery or score prediction is claimed."
  },
  {
    "id": "next-oc-acid-conjugate-pairs-recovery-b",
    "objectiveId": "oc-acid-conjugate-pairs",
    "familyId": "oc-acid-pka-relative-strength",
    "familyRationale": "Alternate original checkpoint within an existing skill family. New quantities, structures or wording do not establish delayed-family novelty.",
    "world": "oc",
    "pool": "check",
    "prompt": "Fictional acids HU, HV and HW have comparable pKa values of 3, 7 and 11 in the same solvent at the same temperature. Which listed conjugate base is strongest?",
    "choices": [
      "U⁻",
      "W⁻",
      "V⁻",
      "All three are equally basic because each has charge −1."
    ],
    "answer": 1,
    "hint": "The weaker acid has the stronger conjugate base under matched conditions.",
    "explanation": "HW has the largest pKa and is the weakest acid among these three. Its conjugate base W⁻ is therefore the strongest of the listed bases. Equal formal charge does not establish equal basicity.",
    "feedback": [
      "U⁻ belongs to the strongest acid and is the weakest conjugate base in this comparison.",
      "Correct: W⁻ is paired with the weakest acid, HW.",
      "V⁻ has intermediate strength here.",
      "The different comparable acid strengths imply different conjugate-base strengths."
    ],
    "sourceUrls": [
      "https://openstax.org/books/organic-chemistry/pages/2-8-acid-and-base-strength"
    ],
    "canonId": "oc-acidity-cardio",
    "sourceId": "next-oc-acid-conjugate-pairs-recovery-b",
    "sourceVersion": "dat-recovery-item-v1",
    "recoveryVersion": 1,
    "reviewStatus": "internal-reviewed",
    "verified": true,
    "progressEligible": true,
    "runtimeIntegrated": true,
    "authorship": "original-authored",
    "reviewScope": "Independently reviewed alternate checkpoints within existing task families. No new delayed-family novelty, full-subject mastery or score prediction is claimed."
  },
  {
    "id": "next-oc-acid-stabilization-recovery-a",
    "objectiveId": "oc-acid-stabilization",
    "familyId": "oc-acid-resonance-comparison",
    "familyRationale": "Alternate original checkpoint within an existing skill family. New quantities, structures or wording do not establish delayed-family novelty.",
    "world": "oc",
    "pool": "check",
    "prompt": "Two drawings of a propanoate ion, CH₃CH₂COO⁻, keep every atom and all atom connections in place. Between the drawings, the C=O double bond and the negative formal charge exchange the two oxygen positions. How should these drawings be interpreted?",
    "choices": [
      "As two distinct molecules that rapidly move oxygen atoms back and forth.",
      "As forms with different total charges because the charged oxygen changes.",
      "As resonance contributors to one ion, differing in electron placement.",
      "As an acid and its conjugate base because a proton moved."
    ],
    "answer": 2,
    "hint": "Check whether nuclei, connectivity, or only electron placement changed.",
    "explanation": "The atom positions and connectivity are unchanged, while the π bond and lone-pair/charge assignment differ. These are resonance contributors to one delocalized ion, not two molecules exchanging atoms. Both drawings have total charge −1.",
    "feedback": [
      "No oxygen nucleus moves, and contributors are not separate interconverting molecules.",
      "Moving the formal-charge assignment between oxygens does not change total charge.",
      "Correct: the drawings differ only in allowed electron placement.",
      "No proton is transferred in the described drawings."
    ],
    "sourceUrls": [
      "https://openstax.org/books/organic-chemistry/pages/2-5-rules-for-resonance-forms",
      "https://openstax.org/books/organic-chemistry/pages/20-4-substituent-effects-on-acidity"
    ],
    "canonId": "oc-acidity-cardio",
    "sourceId": "next-oc-acid-stabilization-recovery-a",
    "sourceVersion": "dat-recovery-item-v1",
    "recoveryVersion": 1,
    "reviewStatus": "internal-reviewed",
    "verified": true,
    "progressEligible": true,
    "runtimeIntegrated": true,
    "authorship": "original-authored",
    "reviewScope": "Independently reviewed alternate checkpoints within existing task families. No new delayed-family novelty, full-subject mastery or score prediction is claimed."
  },
  {
    "id": "next-oc-acid-stabilization-recovery-b",
    "objectiveId": "oc-acid-stabilization",
    "familyId": "oc-acid-inductive-distance",
    "familyRationale": "Alternate original checkpoint within an existing skill family. New quantities, structures or wording do not establish delayed-family novelty.",
    "world": "oc",
    "pool": "check",
    "prompt": "Compare 2-chloropentanoic acid, CH₃CH₂CH₂CH(Cl)COOH, with 5-chloropentanoic acid, ClCH₂CH₂CH₂CH₂COOH, in the same solvent and temperature. Considering the distance-dependent inductive contribution of the single chlorine, which statement is justified?",
    "choices": [
      "Chlorine has the stronger acidity-enhancing inductive contribution in the 2-chloro acid because it is closer through bonds to COOH.",
      "The 5-chloro acid must have the stronger contribution because chlorine is farther away.",
      "Their inductive contributions must be identical because each molecule contains one Cl.",
      "Chlorine can exert an inductive effect only if it is directly double-bonded to oxygen."
    ],
    "answer": 0,
    "hint": "Hold the substituent identity and carbon skeleton constant, then compare bond distance to the acidic group.",
    "explanation": "The chlorine is closer to the carboxyl group in the 2-chloro isomer. Its electron-withdrawing inductive influence is transmitted through sigma bonds and is stronger at the shorter distance. This is a controlled contribution comparison, not an absolute mnemonic ranking of unrelated acids.",
    "feedback": [
      "Correct: the closer chlorine gives the larger inductive contribution in this matched comparison.",
      "Inductive influence generally weakens with increasing bond distance.",
      "Substituent count alone ignores its position relative to the acidic group.",
      "Induction is transmitted through sigma bonds and does not require a Cl=O bond."
    ],
    "sourceUrls": [
      "https://openstax.org/books/organic-chemistry/pages/2-5-rules-for-resonance-forms",
      "https://openstax.org/books/organic-chemistry/pages/20-4-substituent-effects-on-acidity"
    ],
    "canonId": "oc-acidity-cardio",
    "sourceId": "next-oc-acid-stabilization-recovery-b",
    "sourceVersion": "dat-recovery-item-v1",
    "recoveryVersion": 1,
    "reviewStatus": "internal-reviewed",
    "verified": true,
    "progressEligible": true,
    "runtimeIntegrated": true,
    "authorship": "original-authored",
    "reviewScope": "Independently reviewed alternate checkpoints within existing task families. No new delayed-family novelty, full-subject mastery or score prediction is claimed."
  },
  {
    "id": "next-bio-diffusion-recovery-a",
    "objectiveId": "bio-diffusion",
    "familyId": "bio-diffusion-concentration-versus-amount",
    "familyRationale": "Alternate original checkpoint within the existing skill family. A changed context, source ID or numerical value does not establish delayed-family novelty.",
    "world": "bio",
    "pool": "check",
    "prompt": "Chamber L contains 2 mL of a neutral solute at 6 mM. Chamber R contains 10 mL of the same solute at 6 mM. The separating membrane passes the solute, and temperature and pressure match. Which initial net movement is expected?",
    "choices": [
      "L to R because R has more total solute.",
      "R to L because L has fewer total particles.",
      "No net transfer; the concentrations are equal.",
      "All solute stops moving in both chambers."
    ],
    "answer": 2,
    "hint": "Compare concentration, not the total number of particles in differently sized chambers.",
    "explanation": "Both sides have 6 millimoles per liter. There is no concentration-driven net transfer, although particles continue crossing in both directions.",
    "feedback": [
      "More total particles in a larger volume does not establish a concentration gradient.",
      "The smaller volume also contains proportionally less solute, so its concentration is not lower.",
      "Correct: equal concentrations give no initial net diffusion under the stated conditions.",
      "No net movement does not mean molecular motion stops."
    ],
    "sourceUrls": [
      "https://openstax.org/books/biology-2e/pages/5-2-passive-transport"
    ],
    "sourceId": "next-bio-diffusion-recovery-a",
    "sourceVersion": "dat-recovery-item-v1",
    "recoveryVersion": 1,
    "reviewStatus": "internal-reviewed",
    "verified": true,
    "progressEligible": true,
    "runtimeIntegrated": true,
    "authorship": "original-authored",
    "reviewScope": "Independently reviewed alternate checkpoints within existing task families. No new delayed-family novelty, full-subject mastery or score prediction is claimed."
  },
  {
    "id": "next-bio-diffusion-recovery-b",
    "objectiveId": "bio-diffusion",
    "familyId": "bio-diffusion-direction",
    "familyRationale": "Alternate original checkpoint within the existing skill family. A changed context, source ID or numerical value does not establish delayed-family novelty.",
    "world": "bio",
    "pool": "check",
    "prompt": "An open pore passes neutral solute X without coupling to any energy source. X is initially 9 mM outside a compartment and 3 mM inside. Temperature and pressure match. What is the initial net movement of X?",
    "choices": [
      "Outside to inside.",
      "Inside to outside.",
      "No net movement unless ATP is supplied.",
      "Equal net movement inward and outward despite unequal concentrations."
    ],
    "answer": 0,
    "hint": "Use the higher and lower concentrations of X itself.",
    "explanation": "The available passive path permits net movement from 9 mM to 3 mM, initially from outside to inside. ATP is not needed for this downhill passive movement.",
    "feedback": [
      "Correct: the outside concentration is higher.",
      "This would run uphill against the stated concentration difference.",
      "Passive diffusion does not require direct ATP coupling.",
      "Individual crossings can occur both ways, but their difference initially favors inward movement."
    ],
    "sourceUrls": [
      "https://openstax.org/books/biology-2e/pages/5-2-passive-transport"
    ],
    "sourceId": "next-bio-diffusion-recovery-b",
    "sourceVersion": "dat-recovery-item-v1",
    "recoveryVersion": 1,
    "reviewStatus": "internal-reviewed",
    "verified": true,
    "progressEligible": true,
    "runtimeIntegrated": true,
    "authorship": "original-authored",
    "reviewScope": "Independently reviewed alternate checkpoints within existing task families. No new delayed-family novelty, full-subject mastery or score prediction is claimed."
  },
  {
    "id": "next-bio-transport-recovery-a",
    "objectiveId": "bio-transport",
    "familyId": "bio-transport-protein-downhill",
    "familyRationale": "Alternate original checkpoint within the existing skill family. A changed context, source ID or numerical value does not establish delayed-family novelty.",
    "world": "bio",
    "pool": "check",
    "prompt": "A neutral solute enters a membrane compartment only when a specific carrier is present. Net movement is down its concentration gradient. There is no ATP coupling or coupled movement of another solute. Which description fits?",
    "choices": [
      "Primary active pumping.",
      "Secretion by membrane vesicles.",
      "Simple diffusion through the lipid alone.",
      "Facilitated diffusion."
    ],
    "answer": 3,
    "hint": "Separate the need for a protein from the direction and energy source of transport.",
    "explanation": "This is protein-mediated passive movement down the solute’s concentration gradient: facilitated diffusion. The carrier requirement rules out simple passage through lipid alone.",
    "feedback": [
      "No direct ATP coupling or uphill movement is stated.",
      "The description involves a carrier across the membrane, not vesicle fusion.",
      "The solute crosses only when the carrier is present.",
      "Correct: the protein assists passive downhill movement."
    ],
    "sourceUrls": [
      "https://openstax.org/books/biology-2e/pages/5-2-passive-transport"
    ],
    "sourceId": "next-bio-transport-recovery-a",
    "sourceVersion": "dat-recovery-item-v1",
    "recoveryVersion": 1,
    "reviewStatus": "internal-reviewed",
    "verified": true,
    "progressEligible": true,
    "runtimeIntegrated": true,
    "authorship": "original-authored",
    "reviewScope": "Independently reviewed alternate checkpoints within existing task families. No new delayed-family novelty, full-subject mastery or score prediction is claimed."
  },
  {
    "id": "next-bio-transport-recovery-b",
    "objectiveId": "bio-transport",
    "familyId": "bio-transport-equilibrium",
    "familyRationale": "Alternate original checkpoint within the existing skill family. A changed context, source ID or numerical value does not establish delayed-family novelty.",
    "world": "bio",
    "pool": "check",
    "prompt": "A reversible passive carrier connects two solutions with equal concentrations of the same uncharged solute. Temperature and pressure match, and no energy source is coupled. What should a long observation show on average?",
    "choices": [
      "The carrier moves only into the compartment until it fills.",
      "Solute crosses in both directions at equal average rates, giving no net transfer.",
      "The carrier continually raises one side’s concentration for free.",
      "Every carrier becomes permanently locked when concentrations match."
    ],
    "answer": 1,
    "hint": "Equilibrium concerns the difference between opposing flows, not whether particles can move.",
    "explanation": "Equal concentrations under the stated passive conditions support equal average opposing transport. There is no net accumulation, although individual transport events continue.",
    "feedback": [
      "A reversible passive carrier does not require permanently inward transport.",
      "Correct: opposing average traffic balances.",
      "Sustained uphill accumulation would require additional coupling not supplied here.",
      "Concentration equality does not imply permanent carrier locking."
    ],
    "sourceUrls": [
      "https://openstax.org/books/biology-2e/pages/5-2-passive-transport"
    ],
    "sourceId": "next-bio-transport-recovery-b",
    "sourceVersion": "dat-recovery-item-v1",
    "recoveryVersion": 1,
    "reviewStatus": "internal-reviewed",
    "verified": true,
    "progressEligible": true,
    "runtimeIntegrated": true,
    "authorship": "original-authored",
    "reviewScope": "Independently reviewed alternate checkpoints within existing task families. No new delayed-family novelty, full-subject mastery or score prediction is claimed."
  },
  {
    "id": "next-bio-osmosis-recovery-a",
    "objectiveId": "bio-osmosis",
    "familyId": "bio-osmosis-concentration-from-amount",
    "familyRationale": "Alternate original checkpoint within the existing skill family. A changed context, source ID or numerical value does not establish delayed-family novelty.",
    "world": "bio",
    "pool": "check",
    "prompt": "A flexible membrane bag contains 84 micromoles of a trapped, non-dissociating solute in 12 mL of solution. A large bath contains the same solute at 3 mM. Water crosses but solute does not; initial pressure is equal. Which initial net water movement is expected?",
    "choices": [
      "Outward because 12 is larger than 3.",
      "None because both sides contain the same chemical.",
      "Into the bag because its solute concentration is 7 mM.",
      "Outward because the bag has fewer milliliters than the bath."
    ],
    "answer": 2,
    "hint": "Convert the bag’s amount per volume into the bath’s concentration units.",
    "explanation": "84 micromoles / 12 mL = 7 micromoles/mL = 7 mM. With water permeable and pressure initially equal, water moves net from the 3 mM bath into the more concentrated bag.",
    "feedback": [
      "This compares a volume with a concentration, which are different quantities.",
      "The same solute can be present at different concentrations.",
      "Correct: the bag’s concentration is higher, so the initial net water movement is inward.",
      "Bath volume alone does not supply the osmotic direction."
    ],
    "sourceUrls": [
      "https://openstax.org/books/biology-2e/pages/5-2-passive-transport"
    ],
    "sourceId": "next-bio-osmosis-recovery-a",
    "sourceVersion": "dat-recovery-item-v1",
    "recoveryVersion": 1,
    "reviewStatus": "internal-reviewed",
    "verified": true,
    "progressEligible": true,
    "runtimeIntegrated": true,
    "authorship": "original-authored",
    "reviewScope": "Independently reviewed alternate checkpoints within existing task families. No new delayed-family novelty, full-subject mastery or score prediction is claimed."
  },
  {
    "id": "next-bio-osmosis-recovery-b",
    "objectiveId": "bio-osmosis",
    "familyId": "bio-osmosis-water-path",
    "familyRationale": "Alternate original checkpoint within the existing skill family. A changed context, source ID or numerical value does not establish delayed-family novelty.",
    "world": "bio",
    "pool": "check",
    "prompt": "Two chambers have unequal concentrations of a nonpenetrating solute and equal initial pressure and temperature. Their barrier is also completely impermeable to water during the observation. What follows?",
    "choices": [
      "No water crosses this barrier despite the concentration difference.",
      "Water must cross because a concentration difference alone opens a path.",
      "ATP automatically makes the barrier water-permeable.",
      "The nonpenetrating solute must cross instead of water."
    ],
    "answer": 0,
    "hint": "An osmotic tendency and an available water pathway are separate requirements.",
    "explanation": "The stated barrier does not permit water movement during this observation. A concentration difference does not override that permeability condition.",
    "feedback": [
      "Correct: the barrier blocks the relevant movement.",
      "A concentration difference cannot make the explicitly sealed pathway open.",
      "No ATP-dependent change in the barrier is described.",
      "The solute is explicitly nonpenetrating."
    ],
    "sourceUrls": [
      "https://openstax.org/books/biology-2e/pages/5-2-passive-transport"
    ],
    "sourceId": "next-bio-osmosis-recovery-b",
    "sourceVersion": "dat-recovery-item-v1",
    "recoveryVersion": 1,
    "reviewStatus": "internal-reviewed",
    "verified": true,
    "progressEligible": true,
    "runtimeIntegrated": true,
    "authorship": "original-authored",
    "reviewScope": "Independently reviewed alternate checkpoints within existing task families. No new delayed-family novelty, full-subject mastery or score prediction is claimed."
  },
  {
    "id": "next-bio-tonicity-recovery-a",
    "objectiveId": "bio-tonicity",
    "familyId": "bio-tonicity-nonpenetrating-compare",
    "familyRationale": "Alternate original checkpoint within the existing skill family. A changed context, source ID or numerical value does not establish delayed-family novelty.",
    "world": "bio",
    "pool": "check",
    "prompt": "Model: water crosses; N is nonpenetrating and P crosses until its concentration matches the large, fixed bath. The intact cell has no active volume regulation or meaningful pressure difference. Compare the final state after P equilibrates. The cell begins with 180 mOsm/L N and no P. Its bath contains 90 mOsm/L N plus 180 mOsm/L P. Which volume comparison is supported?",
    "choices": [
      "The cell is smaller solely because the bath total initially exceeds 180.",
      "The cell has no volume change because P is permeant.",
      "The cell becomes impermeable to water.",
      "The cell is larger than initially because the bath’s nonpenetrating concentration is lower."
    ],
    "answer": 3,
    "hint": "After P equilibrates, compare the nonpenetrating concentrations that determine the sustained volume response.",
    "explanation": "P eventually has matching concentrations across the membrane. The bath has less nonpenetrating N than the cell initially, so the stated model predicts net swelling to a larger final volume. The bath’s total osmolarity alone does not determine this final response.",
    "feedback": [
      "This treats all bath particles as permanently trapped outside and ignores P equilibration.",
      "Permeant P does not remove the unequal nonpenetrating-solute comparison.",
      "The model explicitly keeps water permeable.",
      "Correct: the bath is hypotonic relative to the initial trapped-solute concentration under these assumptions."
    ],
    "sourceUrls": [
      "https://openstax.org/books/biology-2e/pages/5-2-passive-transport"
    ],
    "sourceId": "next-bio-tonicity-recovery-a",
    "sourceVersion": "dat-recovery-item-v1",
    "recoveryVersion": 1,
    "reviewStatus": "internal-reviewed",
    "verified": true,
    "progressEligible": true,
    "runtimeIntegrated": true,
    "authorship": "original-authored",
    "reviewScope": "Independently reviewed alternate checkpoints within existing task families. No new delayed-family novelty, full-subject mastery or score prediction is claimed."
  },
  {
    "id": "next-bio-tonicity-recovery-b",
    "objectiveId": "bio-tonicity",
    "familyId": "bio-tonicity-solute-substitution",
    "familyRationale": "Alternate original checkpoint within the existing skill family. A changed context, source ID or numerical value does not establish delayed-family novelty.",
    "world": "bio",
    "pool": "check",
    "prompt": "Model: water crosses; N is nonpenetrating and P crosses until its concentration matches the large, fixed bath. The intact cell has no active volume regulation or meaningful pressure difference. Compare the final state after P equilibrates. Two identical cells begin with 300 mOsm/L N. Bath A contains 300 mOsm/L N plus 100 mOsm/L P. Bath B replaces 100 of A’s N with P, giving 200 mOsm/L N plus 200 mOsm/L P. Which statement is correct?",
    "choices": [
      "Both baths must have the same tonicity because each totals 400 mOsm/L.",
      "Bath A is isotonic and bath B is hypotonic relative to the initial cells.",
      "Bath B is hypertonic because it contains more P.",
      "Replacing N with P must stop all water exchange."
    ],
    "answer": 1,
    "hint": "Track which part of the unchanged total remains nonpenetrating.",
    "explanation": "Bath A’s N matches the initial cell N. Bath B has less N despite the same total osmolarity. After P equilibrates, A supports the original volume while B favors a larger volume.",
    "feedback": [
      "Equal total osmolarity does not establish equal tonicity when permeabilities differ.",
      "Correct: the relevant sustained comparison changes when N is replaced with permeant P.",
      "The additional P equilibrates and is not an extra persistent nonpenetrating contribution.",
      "Nothing in the replacement changes water permeability."
    ],
    "sourceUrls": [
      "https://openstax.org/books/biology-2e/pages/5-2-passive-transport"
    ],
    "sourceId": "next-bio-tonicity-recovery-b",
    "sourceVersion": "dat-recovery-item-v1",
    "recoveryVersion": 1,
    "reviewStatus": "internal-reviewed",
    "verified": true,
    "progressEligible": true,
    "runtimeIntegrated": true,
    "authorship": "original-authored",
    "reviewScope": "Independently reviewed alternate checkpoints within existing task families. No new delayed-family novelty, full-subject mastery or score prediction is claimed."
  },
  {
    "id": "next-bio-animal-recovery-a",
    "objectiveId": "bio-animal",
    "familyId": "bio-animal-reversible-rescue",
    "familyRationale": "Alternate original checkpoint within the existing skill family. A changed context, source ID or numerical value does not establish delayed-family novelty.",
    "world": "bio",
    "pool": "check",
    "prompt": "Model: water crosses, all stated solutes are nonpenetrating, the bath is large and fixed, and initial pressure is equal. The animal cell has no wall or active volume regulation. A cell initially at 300 mOsm/L shrinks in a 450 mOsm/L bath. It remains uninjured and retains all its trapped solute. Which replacement bath can restore the original volume?",
    "choices": [
      "600 mOsm/L.",
      "450 mOsm/L.",
      "300 mOsm/L.",
      "A bath that contains no water."
    ],
    "answer": 2,
    "hint": "The unchanged trapped-solute amount reaches its original concentration at its original volume.",
    "explanation": "Returning to a 300 mOsm/L bath permits water to return until the retained solute has its original concentration and volume in this ideal model. A more concentrated bath would not restore that volume.",
    "feedback": [
      "This is more concentrated and favors further water loss.",
      "Keeping the same concentrated bath does not remove the cause of shrinkage.",
      "Correct: the original effective concentration restores the original volume under the stated assumptions.",
      "Without water the cell cannot regain the lost water volume."
    ],
    "sourceUrls": [
      "https://openstax.org/books/biology-2e/pages/5-2-passive-transport"
    ],
    "sourceId": "next-bio-animal-recovery-a",
    "sourceVersion": "dat-recovery-item-v1",
    "recoveryVersion": 1,
    "reviewStatus": "internal-reviewed",
    "verified": true,
    "progressEligible": true,
    "runtimeIntegrated": true,
    "authorship": "original-authored",
    "reviewScope": "Independently reviewed alternate checkpoints within existing task families. No new delayed-family novelty, full-subject mastery or score prediction is claimed."
  },
  {
    "id": "next-bio-animal-recovery-b",
    "objectiveId": "bio-animal",
    "familyId": "bio-animal-swell",
    "familyRationale": "Alternate original checkpoint within the existing skill family. A changed context, source ID or numerical value does not establish delayed-family novelty.",
    "world": "bio",
    "pool": "check",
    "prompt": "Model: water crosses, all stated solutes are nonpenetrating, the bath is large and fixed, and initial pressure is equal. The animal cell has no wall or active volume regulation. An intact cell containing 300 mOsm/L trapped solute enters a 100 mOsm/L bath. Which initial response and possible risk fit the model?",
    "choices": [
      "Net water entry, with possible rupture if swelling becomes excessive.",
      "Net water exit, followed by collapse.",
      "Immediate creation of a protective cell wall.",
      "Permanent stability guaranteed by the plasma membrane."
    ],
    "answer": 0,
    "hint": "Compare the bath with the trapped-solute concentration and remember the absence of a wall.",
    "explanation": "The bath is hypotonic, so initial net water movement is inward. A wall-free cell can rupture if swelling exceeds the membrane’s tolerance; no particular rupture time is established.",
    "feedback": [
      "Correct: entry follows the stated osmotic difference, while rupture is a risk rather than a timed certainty.",
      "This reverses the initial osmotic direction.",
      "An animal cell does not make a wall as this immediate response.",
      "The plasma membrane alone does not guarantee protection from excessive osmotic swelling."
    ],
    "sourceUrls": [
      "https://openstax.org/books/biology-2e/pages/5-2-passive-transport"
    ],
    "sourceId": "next-bio-animal-recovery-b",
    "sourceVersion": "dat-recovery-item-v1",
    "recoveryVersion": 1,
    "reviewStatus": "internal-reviewed",
    "verified": true,
    "progressEligible": true,
    "runtimeIntegrated": true,
    "authorship": "original-authored",
    "reviewScope": "Independently reviewed alternate checkpoints within existing task families. No new delayed-family novelty, full-subject mastery or score prediction is claimed."
  },
  {
    "id": "next-bio-plant-recovery-a",
    "objectiveId": "bio-plant",
    "familyId": "bio-plant-pressure-equilibrium",
    "familyRationale": "Alternate original checkpoint within the existing skill family. A changed context, source ID or numerical value does not establish delayed-family novelty.",
    "world": "bio",
    "pool": "check",
    "prompt": "A plant cell with an intact wall and water-permeable membrane has reached water equilibrium with a dilute bath. Its internal nonpenetrating-solute concentration still exceeds the bath’s. Which explanation is consistent?",
    "choices": [
      "All water molecules have stopped moving.",
      "The wall has eliminated the internal solute.",
      "The membrane must have become impermeable to water.",
      "Higher internal pressure offsets the osmotic tendency toward water entry."
    ],
    "answer": 3,
    "hint": "Consider both solute effects and pressure when assessing water equilibrium.",
    "explanation": "Expansion against the wall can build pressure. That pressure can balance the solute-related tendency for water to enter, producing no net flow while water continues exchanging.",
    "feedback": [
      "Equilibrium does not stop molecular motion.",
      "The given internal solute remains present and more concentrated.",
      "The membrane is explicitly water-permeable.",
      "Correct: equal water potential can occur with unequal solute concentrations when pressure differs."
    ],
    "sourceUrls": [
      "https://openstax.org/books/biology-2e/pages/5-2-passive-transport",
      "https://openstax.org/books/biology-2e/pages/30-5-transport-of-water-and-solutes-in-plants"
    ],
    "sourceId": "next-bio-plant-recovery-a",
    "sourceVersion": "dat-recovery-item-v1",
    "recoveryVersion": 1,
    "reviewStatus": "internal-reviewed",
    "verified": true,
    "progressEligible": true,
    "runtimeIntegrated": true,
    "authorship": "original-authored",
    "reviewScope": "Independently reviewed alternate checkpoints within existing task families. No new delayed-family novelty, full-subject mastery or score prediction is claimed."
  },
  {
    "id": "next-bio-plant-recovery-b",
    "objectiveId": "bio-plant",
    "familyId": "bio-plant-turgor-support",
    "familyRationale": "Alternate original checkpoint within the existing skill family. A changed context, source ID or numerical value does not establish delayed-family novelty.",
    "world": "bio",
    "pool": "check",
    "prompt": "Water can pass through a plant cell wall and reach the plasma membrane. Why can an intact wall nevertheless reduce the danger of excessive expansion in a hypotonic bath?",
    "choices": [
      "It requires all water to move outward.",
      "It mechanically resists expansion as the cell presses against it.",
      "It consumes ATP to destroy the osmotic gradient.",
      "It requires inside and outside solute concentrations to match before water can move."
    ],
    "answer": 1,
    "hint": "Permeability and mechanical support are different properties.",
    "explanation": "The wall need not block water to provide protection. Its resistance to expansion permits pressure to build against further net entry.",
    "feedback": [
      "The wall does not impose an outward-only water path.",
      "Correct: mechanical support limits expansion and permits opposing pressure.",
      "This mechanism is mechanical, not ATP-driven destruction of a gradient.",
      "Water can move before concentrations match, and pressure can balance water movement while concentrations remain unequal."
    ],
    "sourceUrls": [
      "https://openstax.org/books/biology-2e/pages/5-2-passive-transport",
      "https://openstax.org/books/biology-2e/pages/30-5-transport-of-water-and-solutes-in-plants"
    ],
    "sourceId": "next-bio-plant-recovery-b",
    "sourceVersion": "dat-recovery-item-v1",
    "recoveryVersion": 1,
    "reviewStatus": "internal-reviewed",
    "verified": true,
    "progressEligible": true,
    "runtimeIntegrated": true,
    "authorship": "original-authored",
    "reviewScope": "Independently reviewed alternate checkpoints within existing task families. No new delayed-family novelty, full-subject mastery or score prediction is claimed."
  },
  {
    "id": "next-bio-cell-types-recovery-a",
    "objectiveId": "bio-cell-types",
    "familyId": "bio-quarter-cell-classification",
    "familyRationale": "Alternate original checkpoint within the existing skill family. A changed context, source ID or numerical value does not establish delayed-family novelty.",
    "world": "bio",
    "pool": "check",
    "prompt": "A representative cell has chromosomes inside a membrane-enclosed nucleus and a rough endoplasmic reticulum. What classification do those structures support?",
    "choices": [
      "Prokaryotic, because it contains DNA.",
      "Necessarily an animal cell, with no other possibility.",
      "Eukaryotic, without establishing animal versus plant from those observations alone.",
      "Noncellular, because internal membranes are present."
    ],
    "answer": 2,
    "hint": "A nucleus distinguishes cellular organization; DNA alone does not distinguish the two broad cell types.",
    "explanation": "A membrane-enclosed nucleus and ER support eukaryotic organization. These structures occur in multiple eukaryotic groups, so they do not by themselves identify an animal rather than a plant.",
    "feedback": [
      "Both prokaryotic and eukaryotic cells have DNA.",
      "Plants and other eukaryotes also have these structures.",
      "Correct: the internal organization supports eukaryotic classification but not that narrower identity.",
      "Internal membranes are ordinary features of eukaryotic cells."
    ],
    "sourceUrls": [
      "https://openstax.org/books/biology-2e/pages/4-2-prokaryotic-cells",
      "https://openstax.org/books/biology-2e/pages/4-3-eukaryotic-cells"
    ],
    "sourceId": "next-bio-cell-types-recovery-a",
    "sourceVersion": "dat-recovery-item-v1",
    "recoveryVersion": 1,
    "reviewStatus": "internal-reviewed",
    "verified": true,
    "progressEligible": true,
    "runtimeIntegrated": true,
    "authorship": "original-authored",
    "reviewScope": "Independently reviewed alternate checkpoints within existing task families. No new delayed-family novelty, full-subject mastery or score prediction is claimed."
  },
  {
    "id": "next-bio-cell-types-recovery-b",
    "objectiveId": "bio-cell-types",
    "familyId": "bio-quarter-cell-wall-inference",
    "familyRationale": "Alternate original checkpoint within the existing skill family. A changed context, source ID or numerical value does not establish delayed-family novelty.",
    "world": "bio",
    "pool": "check",
    "prompt": "A cell has a cell wall, a membrane-enclosed nucleus and a Golgi apparatus. A learner calls it prokaryotic solely because it has a wall. What is the best correction?",
    "choices": [
      "Some eukaryotic cells have walls; the nucleus and Golgi support eukaryotic organization.",
      "A wall and a nucleus cannot occur in the same living cell.",
      "The Golgi must be another name for the cell wall.",
      "Having a wall means the cell lacks a plasma membrane."
    ],
    "answer": 0,
    "hint": "A wall is not unique to prokaryotic cells. Consider the internal compartments too.",
    "explanation": "Cell walls occur in several eukaryotic groups as well as many prokaryotes. The observed nucleus and Golgi support eukaryotic organization.",
    "feedback": [
      "Correct: wall presence alone does not override the observed internal compartments.",
      "Plant and fungal cells provide familiar examples with both.",
      "The Golgi is an internal processing and sorting compartment, not a cell wall.",
      "A cell wall is outside, and distinct from, the plasma membrane."
    ],
    "sourceUrls": [
      "https://openstax.org/books/biology-2e/pages/4-2-prokaryotic-cells",
      "https://openstax.org/books/biology-2e/pages/4-3-eukaryotic-cells"
    ],
    "sourceId": "next-bio-cell-types-recovery-b",
    "sourceVersion": "dat-recovery-item-v1",
    "recoveryVersion": 1,
    "reviewStatus": "internal-reviewed",
    "verified": true,
    "progressEligible": true,
    "runtimeIntegrated": true,
    "authorship": "original-authored",
    "reviewScope": "Independently reviewed alternate checkpoints within existing task families. No new delayed-family novelty, full-subject mastery or score prediction is claimed."
  },
  {
    "id": "next-bio-nucleus-recovery-a",
    "objectiveId": "bio-nucleus",
    "familyId": "bio-quarter-nuclear-export",
    "familyRationale": "Alternate original checkpoint within the existing skill family. A changed context, source ID or numerical value does not establish delayed-family novelty.",
    "world": "bio",
    "pool": "check",
    "prompt": "A processed messenger RNA must leave a nondividing eukaryotic nucleus to reach cytosolic ribosomes. The nuclear envelope remains intact. Which structure provides its normal passage?",
    "choices": [
      "A lysosomal membrane transporter.",
      "A vesicle budding directly from the Golgi into the nucleus.",
      "An opening through the cell wall.",
      "A nuclear pore complex."
    ],
    "answer": 3,
    "hint": "Identify the boundary that the RNA must cross.",
    "explanation": "Nuclear pore complexes mediate transport through the nuclear envelope, including export of processed mRNA to the cytoplasm. The other structures do not provide that passage.",
    "feedback": [
      "A lysosomal transporter crosses a different organelle membrane.",
      "This is not the normal route for nuclear mRNA export.",
      "The cell wall is not the boundary between nucleoplasm and cytoplasm.",
      "Correct: a nuclear pore spans the intact nuclear envelope."
    ],
    "sourceUrls": [
      "https://openstax.org/books/biology-2e/pages/4-3-eukaryotic-cells"
    ],
    "sourceId": "next-bio-nucleus-recovery-a",
    "sourceVersion": "dat-recovery-item-v1",
    "recoveryVersion": 1,
    "reviewStatus": "internal-reviewed",
    "verified": true,
    "progressEligible": true,
    "runtimeIntegrated": true,
    "authorship": "original-authored",
    "reviewScope": "Independently reviewed alternate checkpoints within existing task families. No new delayed-family novelty, full-subject mastery or score prediction is claimed."
  },
  {
    "id": "next-bio-nucleus-recovery-b",
    "objectiveId": "bio-nucleus",
    "familyId": "bio-quarter-nucleolus-ribosome-production",
    "familyRationale": "Alternate original checkpoint within the existing skill family. A changed context, source ID or numerical value does not establish delayed-family novelty.",
    "world": "bio",
    "pool": "check",
    "prompt": "A selective defect impairs nucleolar rRNA processing and early ribosomal-subunit assembly. Existing ribosomes and other organelles remain functional during the short observation. Which output is most directly reduced?",
    "choices": [
      "Sorting of cargo already in the Golgi.",
      "Production of newly assembled ribosomal subunits.",
      "Hydrolysis by enzymes already inside lysosomes.",
      "Respiration by existing mitochondrial complexes."
    ],
    "answer": 1,
    "hint": "Choose the output produced by the affected site, not every process that eventually depends on proteins.",
    "explanation": "The nucleolus contributes to rRNA processing and ribosomal-subunit assembly. The immediate direct defect is fewer newly assembled subunits, not automatic loss of unrelated preexisting machinery.",
    "feedback": [
      "The stated defect does not directly stop the existing Golgi sorting system.",
      "Correct: new ribosomal-subunit production is the directly affected process.",
      "Existing lysosomal enzymes are explicitly not the selected target.",
      "Existing respiratory complexes are not directly disabled by the stated nucleolar defect."
    ],
    "sourceUrls": [
      "https://openstax.org/books/biology-2e/pages/4-3-eukaryotic-cells"
    ],
    "sourceId": "next-bio-nucleus-recovery-b",
    "sourceVersion": "dat-recovery-item-v1",
    "recoveryVersion": 1,
    "reviewStatus": "internal-reviewed",
    "verified": true,
    "progressEligible": true,
    "runtimeIntegrated": true,
    "authorship": "original-authored",
    "reviewScope": "Independently reviewed alternate checkpoints within existing task families. No new delayed-family novelty, full-subject mastery or score prediction is claimed."
  },
  {
    "id": "next-bio-cargo-recovery-a",
    "objectiveId": "bio-cargo",
    "familyId": "bio-quarter-er-golgi-traffic-block",
    "familyRationale": "Alternate original checkpoint within the existing skill family. A changed context, source ID or numerical value does not establish delayed-family novelty.",
    "world": "bio",
    "pool": "check",
    "prompt": "A newly made soluble protein enters the ER for conventional secretion. A short treatment prevents ER export vesicles from departing, while translation and ER entry continue and degradation is negligible. Where does new cargo accumulate immediately upstream of the block?",
    "choices": [
      "Outside the cell after secretion.",
      "In the nucleus where its protein chain was made.",
      "In the ER.",
      "Only in mature secretory vesicles after Golgi."
    ],
    "answer": 2,
    "hint": "Follow the route until the first transport step that cannot occur.",
    "explanation": "Cargo continues entering the ER but cannot leave in export vesicles. It therefore accumulates in the ER before reaching Golgi or later secretory compartments.",
    "feedback": [
      "Release requires passage through downstream steps that the block prevents for new cargo.",
      "The nucleus supplies the message; translation is not occurring inside it.",
      "Correct: continued entry with blocked exit produces ER accumulation in this short model.",
      "Those vesicles are downstream of ER export and Golgi processing."
    ],
    "sourceUrls": [
      "https://openstax.org/books/biology-2e/pages/4-4-the-endomembrane-system-and-proteins"
    ],
    "canonId": "bio-cell-organelles",
    "sourceId": "next-bio-cargo-recovery-a",
    "sourceVersion": "dat-recovery-item-v1",
    "recoveryVersion": 1,
    "reviewStatus": "internal-reviewed",
    "verified": true,
    "progressEligible": true,
    "runtimeIntegrated": true,
    "authorship": "original-authored",
    "reviewScope": "Independently reviewed alternate checkpoints within existing task families. No new delayed-family novelty, full-subject mastery or score prediction is claimed."
  },
  {
    "id": "next-bio-cargo-recovery-b",
    "objectiveId": "bio-cargo",
    "familyId": "bio-quarter-conventional-secretory-route",
    "familyRationale": "Alternate original checkpoint within the existing skill family. A changed context, source ID or numerical value does not establish delayed-family novelty.",
    "world": "bio",
    "pool": "check",
    "prompt": "An animal gland makes a soluble enzyme for release outside the cell through the conventional secretory pathway. Its targeting signal is functional. Which sequence correctly gives its early processing route?",
    "choices": [
      "Rough ER entry, then Golgi processing and sorting.",
      "Permanent cytosolic retention, with no ER entry.",
      "Protein synthesis inside the nucleus, then direct release through the cell surface.",
      "Golgi entry before translation, followed by the ER as the site of RNA transcription."
    ],
    "answer": 0,
    "hint": "Separate synthesis of the RNA message from trafficking of the growing protein.",
    "explanation": "The signal directs the growing secretory protein into rough ER. Vesicular traffic then carries cargo to Golgi for processing and sorting before later delivery and release.",
    "feedback": [
      "Correct: this is the stated conventional secretory route.",
      "Permanent cytosolic retention conflicts with the functional secretory targeting information.",
      "The protein is not translated inside the nucleus or released directly from it.",
      "Translation precedes Golgi processing; ER is not the site of nuclear RNA transcription."
    ],
    "sourceUrls": [
      "https://openstax.org/books/biology-2e/pages/4-4-the-endomembrane-system-and-proteins"
    ],
    "canonId": "bio-cell-organelles",
    "sourceId": "next-bio-cargo-recovery-b",
    "sourceVersion": "dat-recovery-item-v1",
    "recoveryVersion": 1,
    "reviewStatus": "internal-reviewed",
    "verified": true,
    "progressEligible": true,
    "runtimeIntegrated": true,
    "authorship": "original-authored",
    "reviewScope": "Independently reviewed alternate checkpoints within existing task families. No new delayed-family novelty, full-subject mastery or score prediction is claimed."
  },
  {
    "id": "next-bio-recycling-recovery-a",
    "objectiveId": "bio-recycling",
    "familyId": "bio-quarter-acidic-hydrolysis",
    "familyRationale": "Alternate original checkpoint within the existing skill family. A changed context, source ID or numerical value does not establish delayed-family novelty.",
    "world": "bio",
    "pool": "check",
    "prompt": "A delivered protein is normally broken down by lysosomal hydrolases that work best in an acidic lumen. A treatment makes that lumen less acidic and reduces those enzymes’ activity; delivery remains unchanged. What happens most directly to breakdown of the delivered protein?",
    "choices": [
      "It must increase because the lumen is less acidic.",
      "It must stay unchanged because the same amount was delivered.",
      "Peroxisomal catalase automatically takes over the same digestion.",
      "It decreases because the relevant hydrolytic activity is reduced."
    ],
    "answer": 3,
    "hint": "Normal delivery does not guarantee normal activity of the receiving enzymes.",
    "explanation": "The substrate reaches the compartment, but the specified hydrolases are less active under the new pH condition. Their breakdown of that substrate therefore decreases.",
    "feedback": [
      "The prompt specifies reduced activity for these acid-dependent enzymes.",
      "Delivery and enzymatic breakdown are separate steps.",
      "Catalase processes peroxide; it is not an automatic substitute for these hydrolases.",
      "Correct: reduced relevant enzyme activity lowers the stated breakdown process."
    ],
    "sourceUrls": [
      "https://openstax.org/books/biology-2e/pages/4-3-eukaryotic-cells",
      "https://openstax.org/books/biology-2e/pages/4-4-the-endomembrane-system-and-proteins"
    ],
    "sourceId": "next-bio-recycling-recovery-a",
    "sourceVersion": "dat-recovery-item-v1",
    "recoveryVersion": 1,
    "reviewStatus": "internal-reviewed",
    "verified": true,
    "progressEligible": true,
    "runtimeIntegrated": true,
    "authorship": "original-authored",
    "reviewScope": "Independently reviewed alternate checkpoints within existing task families. No new delayed-family novelty, full-subject mastery or score prediction is claimed."
  },
  {
    "id": "next-bio-recycling-recovery-b",
    "objectiveId": "bio-recycling",
    "familyId": "bio-quarter-peroxide-processing",
    "familyRationale": "Alternate original checkpoint within the existing skill family. A changed context, source ID or numerical value does not establish delayed-family novelty.",
    "world": "bio",
    "pool": "check",
    "prompt": "An isolated peroxisomal assay produces hydrogen peroxide at an unchanged rate. Catalase had been inactive. Researchers restore its peroxide-decomposition activity, with other removal pathways negligible. At the same peroxide concentration, what immediate change is expected?",
    "choices": [
      "Peroxide production must stop entirely.",
      "Peroxide removal increases, reducing the tendency for peroxide to accumulate.",
      "The membrane prevents any change in peroxide processing.",
      "Peroxide accumulates faster because restored catalase produces it in this assay."
    ],
    "answer": 1,
    "hint": "Keep the production rate fixed and change only the stated removal activity.",
    "explanation": "Restored catalase provides a peroxide-removal process. With production unchanged, the immediate accumulation tendency is reduced; the prompt does not require all peroxide to vanish instantly.",
    "feedback": [
      "Restoring removal does not imply that the unchanged production reactions stop.",
      "Correct: the added removal activity opposes accumulation.",
      "A membrane does not replace or prevent the stated enzymatic activity.",
      "The restored activity is peroxide decomposition; the separate peroxide-production rate is unchanged."
    ],
    "sourceUrls": [
      "https://openstax.org/books/biology-2e/pages/4-3-eukaryotic-cells",
      "https://openstax.org/books/biology-2e/pages/4-4-the-endomembrane-system-and-proteins"
    ],
    "sourceId": "next-bio-recycling-recovery-b",
    "sourceVersion": "dat-recovery-item-v1",
    "recoveryVersion": 1,
    "reviewStatus": "internal-reviewed",
    "verified": true,
    "progressEligible": true,
    "runtimeIntegrated": true,
    "authorship": "original-authored",
    "reviewScope": "Independently reviewed alternate checkpoints within existing task families. No new delayed-family novelty, full-subject mastery or score prediction is claimed."
  },
  {
    "id": "next-bio-energy-organelles-recovery-a",
    "objectiveId": "bio-energy-organelles",
    "familyId": "bio-quarter-dual-organelle-functions",
    "familyRationale": "Alternate original checkpoint within the existing skill family. A changed context, source ID or numerical value does not establish delayed-family novelty.",
    "world": "bio",
    "pool": "check",
    "prompt": "A typical photosynthetic leaf cell contains chloroplasts. A diagram omits mitochondria because its author believes they occur only in animals. Which revision is appropriate?",
    "choices": [
      "Remove the chloroplasts because the two organelles cannot coexist.",
      "Put every mitochondrion inside a chloroplast.",
      "Include mitochondria as distinct organelles that can coexist with chloroplasts.",
      "Rename chloroplasts as mitochondria because the two structures are identical."
    ],
    "answer": 2,
    "hint": "Photosynthesis does not make mitochondria exclusive to another group of organisms.",
    "explanation": "Typical photosynthetic plant cells can contain both chloroplasts and mitochondria. They are distinct organelles with different roles rather than mutually exclusive or identical structures.",
    "feedback": [
      "The two organelles can coexist in the stated cell.",
      "Mitochondria are distinct organelles, not compartments within chloroplasts.",
      "Correct: plant cells can carry out mitochondrial functions as well as photosynthesis.",
      "Their structures and functions are not identical."
    ],
    "sourceUrls": [
      "https://openstax.org/books/biology-2e/pages/4-3-eukaryotic-cells",
      "https://openstax.org/books/biology-2e/pages/8-3-using-light-energy-to-make-organic-molecules"
    ],
    "sourceId": "next-bio-energy-organelles-recovery-a",
    "sourceVersion": "dat-recovery-item-v1",
    "recoveryVersion": 1,
    "reviewStatus": "internal-reviewed",
    "verified": true,
    "progressEligible": true,
    "runtimeIntegrated": true,
    "authorship": "original-authored",
    "reviewScope": "Independently reviewed alternate checkpoints within existing task families. No new delayed-family novelty, full-subject mastery or score prediction is claimed."
  },
  {
    "id": "next-bio-energy-organelles-recovery-b",
    "objectiveId": "bio-energy-organelles",
    "familyId": "bio-quarter-chloroplast-carbon-fixation-location",
    "familyRationale": "Alternate original checkpoint within the existing skill family. A changed context, source ID or numerical value does not establish delayed-family novelty.",
    "world": "bio",
    "pool": "check",
    "prompt": "A chloroplast enzyme in the Calvin cycle incorporates supplied CO₂ into an organic molecule. Which chloroplast region contains this carbon-fixation machinery?",
    "choices": [
      "The stroma surrounding the thylakoids.",
      "The thylakoid lumen.",
      "The mitochondrial matrix.",
      "The interior of a lysosome."
    ],
    "answer": 0,
    "hint": "Distinguish the chloroplast’s surrounding fluid compartment from its thylakoid membranes and lumen.",
    "explanation": "Calvin-cycle carbon fixation occurs in the chloroplast stroma. It is distinct from light-reaction machinery associated with thylakoid membranes.",
    "feedback": [
      "Correct: the Calvin-cycle machinery is located in the stroma.",
      "The thylakoid lumen is a different compartment.",
      "The mitochondrial matrix belongs to a different organelle.",
      "The lysosome is not the compartment for chloroplast carbon fixation."
    ],
    "sourceUrls": [
      "https://openstax.org/books/biology-2e/pages/4-3-eukaryotic-cells",
      "https://openstax.org/books/biology-2e/pages/8-3-using-light-energy-to-make-organic-molecules"
    ],
    "sourceId": "next-bio-energy-organelles-recovery-b",
    "sourceVersion": "dat-recovery-item-v1",
    "recoveryVersion": 1,
    "reviewStatus": "internal-reviewed",
    "verified": true,
    "progressEligible": true,
    "runtimeIntegrated": true,
    "authorship": "original-authored",
    "reviewScope": "Independently reviewed alternate checkpoints within existing task families. No new delayed-family novelty, full-subject mastery or score prediction is claimed."
  },
  {
    "id": "next-bio-cytoskeleton-recovery-a",
    "objectiveId": "bio-cytoskeleton",
    "familyId": "bio-quarter-mitotic-spindle",
    "familyRationale": "Alternate original checkpoint within the existing skill family. A changed context, source ID or numerical value does not establish delayed-family novelty.",
    "world": "bio",
    "pool": "check",
    "prompt": "In a typical dividing animal cell, fibers of the mitotic spindle attach to chromosomes and contribute to their separation. What primarily forms these spindle fibers?",
    "choices": [
      "Keratin intermediate filaments.",
      "Actin filaments of the contractile ring.",
      "Extracellular collagen.",
      "Microtubules."
    ],
    "answer": 3,
    "hint": "The chromosome-separating spindle and the cell-pinching contractile ring use different principal filament systems.",
    "explanation": "The spindle is built primarily from microtubules. Actin has an important role in the animal-cell contractile ring, but it is not the principal spindle fiber.",
    "feedback": [
      "Keratin supports mechanical integrity in relevant cells rather than forming the mitotic spindle.",
      "The actin-based contractile ring is distinct from spindle fibers.",
      "Collagen is extracellular and does not form the intracellular spindle.",
      "Correct: microtubules form the main spindle fibers."
    ],
    "sourceUrls": [
      "https://openstax.org/books/biology-2e/pages/4-5-the-cytoskeleton",
      "https://pubmed.ncbi.nlm.nih.gov/32989303/"
    ],
    "sourceId": "next-bio-cytoskeleton-recovery-a",
    "sourceVersion": "dat-recovery-item-v1",
    "recoveryVersion": 1,
    "reviewStatus": "internal-reviewed",
    "verified": true,
    "progressEligible": true,
    "runtimeIntegrated": true,
    "authorship": "original-authored",
    "reviewScope": "Independently reviewed alternate checkpoints within existing task families. No new delayed-family novelty, full-subject mastery or score prediction is claimed."
  },
  {
    "id": "next-bio-cytoskeleton-recovery-b",
    "objectiveId": "bio-cytoskeleton",
    "familyId": "bio-quarter-cilia-qualified-structure",
    "familyRationale": "Alternate original checkpoint within the existing skill family. A changed context, source ID or numerical value does not establish delayed-family novelty.",
    "world": "bio",
    "pool": "check",
    "prompt": "A summary says all eukaryotic cilia must beat and must have an identical internal arrangement. Which replacement is more accurate?",
    "choices": [
      "Every cilium is built from the same actin bundle as a microvillus.",
      "Typical motile cilia use microtubules, while some other cilia have sensory functions and different arrangements.",
      "A cilium cannot contain microtubules unless it is actively beating.",
      "All sensory cilia must become motile after detecting a signal."
    ],
    "answer": 1,
    "hint": "Avoid making the familiar motile-cilium arrangement a rule for every cilium.",
    "explanation": "Microtubules support typical motile cilia, but cilia vary in structure and function. Some serve sensory roles rather than the same beating function.",
    "feedback": [
      "Microvilli and typical cilia do not share that actin-based structural description.",
      "Correct: this preserves the familiar motile structure without making it universal.",
      "Nonmotile cilia can also contain microtubules.",
      "The statement adds an unsupported requirement for sensory cilia."
    ],
    "sourceUrls": [
      "https://openstax.org/books/biology-2e/pages/4-5-the-cytoskeleton",
      "https://pubmed.ncbi.nlm.nih.gov/32989303/"
    ],
    "sourceId": "next-bio-cytoskeleton-recovery-b",
    "sourceVersion": "dat-recovery-item-v1",
    "recoveryVersion": 1,
    "reviewStatus": "internal-reviewed",
    "verified": true,
    "progressEligible": true,
    "runtimeIntegrated": true,
    "authorship": "original-authored",
    "reviewScope": "Independently reviewed alternate checkpoints within existing task families. No new delayed-family novelty, full-subject mastery or score prediction is claimed."
  },
  {
    "id": "next-bio-enzyme-rate-recovery-a",
    "objectiveId": "bio-enzyme-rate",
    "familyId": "bio-rate-halfmax-interpretation",
    "familyRationale": "Alternate original checkpoint within the existing skill family. A changed context, source ID or numerical value does not establish delayed-family novelty.",
    "world": "bio",
    "pool": "check",
    "prompt": "A single-substrate Michaelis–Menten enzyme has a limiting initial rate Vmax of 80 units/min. Initial rates are 20, 40 and 60 units/min at substrate concentrations of 2, 6 and 18 mM, respectively. What Km is supported?",
    "choices": [
      "2 mM.",
      "6 mM.",
      "18 mM.",
      "40 mM."
    ],
    "answer": 1,
    "hint": "Find one-half of this preparation’s limiting rate, then its substrate concentration.",
    "explanation": "Half of 80 units/min is 40 units/min. That rate occurs at 6 mM substrate, so Km is 6 mM under the stated model.",
    "feedback": [
      "At 2 mM the measured rate is one-quarter, not one-half, of Vmax.",
      "Correct: 6 mM gives the half-limiting rate.",
      "At 18 mM the rate is three-quarters of Vmax.",
      "40 is a rate in units/min here, not the substrate concentration."
    ],
    "sourceUrls": [
      "https://iubmb.qmul.ac.uk/kinetics/ek4t6.html"
    ],
    "canonId": "bio-enzyme-kinetics",
    "sourceId": "next-bio-enzyme-rate-recovery-a",
    "sourceVersion": "dat-recovery-item-v1",
    "recoveryVersion": 1,
    "reviewStatus": "internal-reviewed",
    "verified": true,
    "progressEligible": true,
    "runtimeIntegrated": true,
    "authorship": "original-authored",
    "reviewScope": "Independently reviewed alternate checkpoints within existing task families. No new delayed-family novelty, full-subject mastery or score prediction is claimed."
  },
  {
    "id": "next-bio-enzyme-rate-recovery-b",
    "objectiveId": "bio-enzyme-rate",
    "familyId": "bio-rate-saturation-reasoning",
    "familyRationale": "Alternate original checkpoint within the existing skill family. A changed context, source ID or numerical value does not establish delayed-family novelty.",
    "world": "bio",
    "pool": "check",
    "prompt": "At fixed active-enzyme amount, an initial-rate assay gives 45 units/min at 3 mM substrate, 60 at 6 mM and 67.5 at 9 mM. The enzyme follows a saturating Michaelis–Menten model. What does this pattern show?",
    "choices": [
      "Each additional 3 mM increases the rate by the same amount.",
      "The enzyme must have stopped reacting at 9 mM.",
      "The additional rate gain becomes smaller as substrate rises.",
      "The observed rates prove that substrate concentration equals enzyme concentration."
    ],
    "answer": 2,
    "hint": "Compare the gain from 3 to 6 mM with the gain from 6 to 9 mM.",
    "explanation": "The first 3 mM increase adds 15 units/min; the second adds only 7.5. This diminishing gain is consistent with approaching saturation at fixed active-enzyme amount.",
    "feedback": [
      "The gains are 15 and 7.5 units/min, which differ.",
      "A positive 67.5-unit initial rate is not a stopped reaction.",
      "Correct: the smaller second gain shows a flattening rate response.",
      "The pattern does not equate concentrations of different molecules."
    ],
    "sourceUrls": [
      "https://iubmb.qmul.ac.uk/kinetics/ek4t6.html"
    ],
    "canonId": "bio-enzyme-kinetics",
    "sourceId": "next-bio-enzyme-rate-recovery-b",
    "sourceVersion": "dat-recovery-item-v1",
    "recoveryVersion": 1,
    "reviewStatus": "internal-reviewed",
    "verified": true,
    "progressEligible": true,
    "runtimeIntegrated": true,
    "authorship": "original-authored",
    "reviewScope": "Independently reviewed alternate checkpoints within existing task families. No new delayed-family novelty, full-subject mastery or score prediction is claimed."
  },
  {
    "id": "next-bio-enzyme-inhibition-recovery-a",
    "objectiveId": "bio-enzyme-inhibition",
    "familyId": "bio-inhibition-own-halfmax",
    "familyRationale": "Alternate original checkpoint within the existing skill family. A changed context, source ID or numerical value does not establish delayed-family novelty.",
    "world": "bio",
    "pool": "check",
    "prompt": "For the same active-enzyme preparation, control Vmax is 80 units/min and Km is 5 mM. With reagent J, Vmax is 40 units/min and Km remains 5 mM. Within the stated reversible competitive/pure noncompetitive models, which description fits J?",
    "choices": [
      "Competitive, because every inhibitor raises Km.",
      "Competitive, because Vmax has decreased.",
      "An unchanged rate curve, because Km is unchanged.",
      "The pure noncompetitive pattern."
    ],
    "answer": 3,
    "hint": "Compare both the limiting rate and the substrate concentration at half of each curve’s own limit.",
    "explanation": "Lower Vmax with unchanged Km is the specified pure noncompetitive pattern. Unchanged Km does not mean unchanged rates or unchanged limiting capacity.",
    "feedback": [
      "Not every inhibition pattern raises Km.",
      "The simple competitive pattern preserves Vmax.",
      "A fall in Vmax changes the curve despite unchanged Km.",
      "Correct: the two parameter changes match pure noncompetitive inhibition."
    ],
    "sourceUrls": [
      "https://iubmb.qmul.ac.uk/kinetics/ek4t6.html"
    ],
    "canonId": "bio-enzyme-kinetics",
    "sourceId": "next-bio-enzyme-inhibition-recovery-a",
    "sourceVersion": "dat-recovery-item-v1",
    "recoveryVersion": 1,
    "reviewStatus": "internal-reviewed",
    "verified": true,
    "progressEligible": true,
    "runtimeIntegrated": true,
    "authorship": "original-authored",
    "reviewScope": "Independently reviewed alternate checkpoints within existing task families. No new delayed-family novelty, full-subject mastery or score prediction is claimed."
  },
  {
    "id": "next-bio-enzyme-inhibition-recovery-b",
    "objectiveId": "bio-enzyme-inhibition",
    "familyId": "bio-inhibition-single-point-insufficiency",
    "familyRationale": "Alternate original checkpoint within the existing skill family. A changed context, source ID or numerical value does not establish delayed-family novelty.",
    "world": "bio",
    "pool": "check",
    "prompt": "A reversible inhibitor binds outside an enzyme’s substrate-binding site. Its presence lowers one measured initial rate. Which additional kinetic pattern would support calling it pure noncompetitive in the simple model?",
    "choices": [
      "Vmax falls while Km stays unchanged.",
      "The inhibitor solution is visibly colored.",
      "The inhibitor has more atoms than the substrate.",
      "Only the fact that it binds outside the substrate site; no kinetic information is needed."
    ],
    "answer": 0,
    "hint": "Binding location and one low rate do not determine the whole rate-versus-substrate pattern.",
    "explanation": "The specified pure noncompetitive model lowers the limiting rate while retaining Km. Binding elsewhere alone does not distinguish it from other inhibitory behavior.",
    "feedback": [
      "Correct: this is the defining parameter pattern for the specified pure model.",
      "Color does not establish the kinetic pattern.",
      "Relative atom count does not establish Vmax or Km.",
      "Remote binding alone does not identify pure noncompetitive kinetics."
    ],
    "sourceUrls": [
      "https://iubmb.qmul.ac.uk/kinetics/ek4t6.html"
    ],
    "canonId": "bio-enzyme-kinetics",
    "sourceId": "next-bio-enzyme-inhibition-recovery-b",
    "sourceVersion": "dat-recovery-item-v1",
    "recoveryVersion": 1,
    "reviewStatus": "internal-reviewed",
    "verified": true,
    "progressEligible": true,
    "runtimeIntegrated": true,
    "authorship": "original-authored",
    "reviewScope": "Independently reviewed alternate checkpoints within existing task families. No new delayed-family novelty, full-subject mastery or score prediction is claimed."
  },
  {
    "id": "next-rc.purpose-recovery-a",
    "objectiveId": "rc.purpose",
    "familyId": "rc.traffic.purpose",
    "familyRationale": "Alternate original checkpoint within the existing skill family. A changed context, source ID or numerical value does not establish delayed-family novelty.",
    "world": "rc",
    "pool": "check",
    "prompt": "Which statement best expresses the passage’s main purpose?",
    "choices": [
      "To explain why every storage card should be discarded after photography.",
      "To distinguish improved readability of marks from an increase in the stored collection.",
      "To establish that one lighting arrangement is best for all cards.",
      "To show that card inventories are unnecessary once software is installed."
    ],
    "answer": 1,
    "hint": "Connect the measurement problem in the opening with the limited recommendation at the end.",
    "explanation": "The passage follows a count of readable marks, tests improved detection, and limits what that count means about the collection. It supports a useful tool without equating its output with object totals.",
    "feedback": [
      "The passage never recommends discarding the cards.",
      "Correct: the opening distinction, trial and final caution all support this purpose.",
      "The final paragraph explicitly leaves this universal claim unestablished.",
      "The report recommends retaining periodic inventories."
    ],
    "sourceUrls": [
      "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/dat_candidate_guide.pdf"
    ],
    "passageId": "recovery-rc-archive",
    "originalPassage": true,
    "canonId": "rc-passage-map",
    "passage": {
      "title": "Marks under a new light — original fictional report",
      "paragraphs": [
        "A museum photographed marks on storage cards to help staff search the collection. Software counted readable marks in each image. A card could carry several marks, and a faded mark could be present without being readable. The project leader therefore distinguished the software count from the number of cards or objects in storage.",
        "The team photographed the same twelve trays twice without adding, removing or rearranging cards. For the second photograph of six trays, a lamp was moved to reduce reflections. The other six trays were photographed again with the original lighting. A reviewer who did not know which lighting had been used compared matched images.",
        "The software counted more readable marks under the changed lighting. The reviewer identified specific marks that could be read in those images but were obscured by reflections in the earlier images. Counts from trays kept under the original lighting changed little. The trial supported improved readability; it did not show that the collection had grown.",
        "The report recommended recording lighting conditions and retaining periodic card inventories. It described the photographic system as a useful search aid, while warning against treating readable-mark totals as object totals. The small trial did not establish which lighting would work best for every kind of card."
      ]
    },
    "sourceId": "next-rc.purpose-recovery-a",
    "sourceVersion": "dat-recovery-item-v1",
    "recoveryVersion": 1,
    "reviewStatus": "internal-reviewed",
    "verified": true,
    "progressEligible": true,
    "runtimeIntegrated": true,
    "authorship": "original-authored",
    "reviewScope": "Independently reviewed alternate checkpoints within existing task families. No new delayed-family novelty, full-subject mastery or score prediction is claimed."
  },
  {
    "id": "next-rc.purpose-recovery-b",
    "objectiveId": "rc.purpose",
    "familyId": "rc.traffic.purpose",
    "familyRationale": "Alternate original checkpoint within the existing skill family. A changed context, source ID or numerical value does not establish delayed-family novelty.",
    "world": "rc",
    "pool": "check",
    "prompt": "What issue does the passage primarily examine?",
    "choices": [
      "Whether a greenhouse should stop allowing repeat visitors.",
      "Why stored recordings cannot be used to compare software.",
      "How every missed crossing can be recovered without further checking.",
      "How improved crossing detection differs from establishing the number of distinct visitors."
    ],
    "answer": 3,
    "hint": "Ask what distinction remains important even after the software improves.",
    "explanation": "The report evaluates improved detection while maintaining the distinction between crossing events and unique visitors. That distinction organizes the initial problem and final recommendation.",
    "feedback": [
      "Repeat visits explain a measurement limitation; the report proposes no ban.",
      "Both software versions are deliberately compared on the same recordings.",
      "Some dim crossings remain missed, and manual checks are retained.",
      "Correct: better event detection does not remove the separate visitor-count limitation."
    ],
    "sourceUrls": [
      "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/dat_candidate_guide.pdf"
    ],
    "passageId": "recovery-rc-entry",
    "originalPassage": true,
    "canonId": "rc-passage-map",
    "passage": {
      "title": "When a detector misses a crossing — original fictional report",
      "paragraphs": [
        "A greenhouse used an electronic detector to count crossings through an entrance. Managers hoped the total would describe visitor attendance. The report noted two separate limitations: the detector could miss crossings, and the same visitor could cross more than once. A crossing total was therefore not automatically a count of distinct visitors.",
        "Technicians replayed the same stored entrance recordings through two versions of the detection software. The second version recognized dimmer images. Because both versions analyzed the same recordings, the software comparison introduced no new visitors or crossings into the recorded scene. Reviewers also marked visible crossings manually in selected clips.",
        "The revised software reported more crossings. In several clips, manual reviewers confirmed crossings that the revised version detected but the original version had missed. Some dim crossings were still missed by both versions. The report did not determine whether every entrance or lighting condition would show the same improvement.",
        "The authors supported further use of the revised detector alongside manual checks. They recommended labeling its output as detected crossings and using separate information to estimate distinct visitors. Their recommendation preserved the tool’s usefulness without treating its remaining limitations as resolved."
      ]
    },
    "sourceId": "next-rc.purpose-recovery-b",
    "sourceVersion": "dat-recovery-item-v1",
    "recoveryVersion": 1,
    "reviewStatus": "internal-reviewed",
    "verified": true,
    "progressEligible": true,
    "runtimeIntegrated": true,
    "authorship": "original-authored",
    "reviewScope": "Independently reviewed alternate checkpoints within existing task families. No new delayed-family novelty, full-subject mastery or score prediction is claimed."
  },
  {
    "id": "next-rc.evidence-recovery-a",
    "objectiveId": "rc.evidence",
    "familyId": "rc.traffic.evidence",
    "familyRationale": "Alternate original checkpoint within the existing skill family. A changed context, source ID or numerical value does not establish delayed-family novelty.",
    "world": "rc",
    "pool": "check",
    "prompt": "Which reported observation most directly supports improved readability as the reason for the higher software count?",
    "choices": [
      "A reviewer could read particular marks under the new lighting that reflections had obscured in matched earlier images.",
      "The museum wanted staff to search its collection.",
      "The trial used twelve trays.",
      "Some cards carried more than one mark."
    ],
    "answer": 0,
    "hint": "Look for a direct comparison of the same visible marks under the two conditions.",
    "explanation": "The reviewer’s matched-image observation directly shows previously obscured marks becoming readable. The other statements describe the project or counting limitations without directly demonstrating improved readability.",
    "feedback": [
      "Correct: this identifies the same marks becoming readable under the changed lighting.",
      "A goal is not evidence that readability improved.",
      "The number of trays does not identify why the count changed.",
      "Multiple marks explain why marks and cards differ, not why these images yielded more readable marks."
    ],
    "sourceUrls": [
      "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/dat_candidate_guide.pdf"
    ],
    "passageId": "recovery-rc-archive",
    "originalPassage": true,
    "canonId": "rc-passage-map",
    "passage": {
      "title": "Marks under a new light — original fictional report",
      "paragraphs": [
        "A museum photographed marks on storage cards to help staff search the collection. Software counted readable marks in each image. A card could carry several marks, and a faded mark could be present without being readable. The project leader therefore distinguished the software count from the number of cards or objects in storage.",
        "The team photographed the same twelve trays twice without adding, removing or rearranging cards. For the second photograph of six trays, a lamp was moved to reduce reflections. The other six trays were photographed again with the original lighting. A reviewer who did not know which lighting had been used compared matched images.",
        "The software counted more readable marks under the changed lighting. The reviewer identified specific marks that could be read in those images but were obscured by reflections in the earlier images. Counts from trays kept under the original lighting changed little. The trial supported improved readability; it did not show that the collection had grown.",
        "The report recommended recording lighting conditions and retaining periodic card inventories. It described the photographic system as a useful search aid, while warning against treating readable-mark totals as object totals. The small trial did not establish which lighting would work best for every kind of card."
      ]
    },
    "sourceId": "next-rc.evidence-recovery-a",
    "sourceVersion": "dat-recovery-item-v1",
    "recoveryVersion": 1,
    "reviewStatus": "internal-reviewed",
    "verified": true,
    "progressEligible": true,
    "runtimeIntegrated": true,
    "authorship": "original-authored",
    "reviewScope": "Independently reviewed alternate checkpoints within existing task families. No new delayed-family novelty, full-subject mastery or score prediction is claimed."
  },
  {
    "id": "next-rc.evidence-recovery-b",
    "objectiveId": "rc.evidence",
    "familyId": "rc.traffic.evidence",
    "familyRationale": "Alternate original checkpoint within the existing skill family. A changed context, source ID or numerical value does not establish delayed-family novelty.",
    "world": "rc",
    "pool": "check",
    "prompt": "Which evidence most directly supports the claim that the revised software recovered some previously missed crossings?",
    "choices": [
      "The managers hoped to describe visitor attendance.",
      "The report recommends future manual checks.",
      "Manual reviewers confirmed crossings detected by the revised version but missed by the original version.",
      "A visitor might pass through the entrance more than once."
    ],
    "answer": 2,
    "hint": "Find the observation that compares the two versions against visible events.",
    "explanation": "Manual confirmation connects the additional detections with real crossings in the stored clips. Goals and recommendations do not provide that direct comparison.",
    "feedback": [
      "The managers’ goal does not test detector performance.",
      "The recommendation is a response to the results, not the direct confirming observation.",
      "Correct: the added detections correspond to crossings that reviewers independently saw.",
      "Repeat crossings matter for distinct-visitor counts but do not demonstrate recovered detections."
    ],
    "sourceUrls": [
      "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/dat_candidate_guide.pdf"
    ],
    "passageId": "recovery-rc-entry",
    "originalPassage": true,
    "canonId": "rc-passage-map",
    "passage": {
      "title": "When a detector misses a crossing — original fictional report",
      "paragraphs": [
        "A greenhouse used an electronic detector to count crossings through an entrance. Managers hoped the total would describe visitor attendance. The report noted two separate limitations: the detector could miss crossings, and the same visitor could cross more than once. A crossing total was therefore not automatically a count of distinct visitors.",
        "Technicians replayed the same stored entrance recordings through two versions of the detection software. The second version recognized dimmer images. Because both versions analyzed the same recordings, the software comparison introduced no new visitors or crossings into the recorded scene. Reviewers also marked visible crossings manually in selected clips.",
        "The revised software reported more crossings. In several clips, manual reviewers confirmed crossings that the revised version detected but the original version had missed. Some dim crossings were still missed by both versions. The report did not determine whether every entrance or lighting condition would show the same improvement.",
        "The authors supported further use of the revised detector alongside manual checks. They recommended labeling its output as detected crossings and using separate information to estimate distinct visitors. Their recommendation preserved the tool’s usefulness without treating its remaining limitations as resolved."
      ]
    },
    "sourceId": "next-rc.evidence-recovery-b",
    "sourceVersion": "dat-recovery-item-v1",
    "recoveryVersion": 1,
    "reviewStatus": "internal-reviewed",
    "verified": true,
    "progressEligible": true,
    "runtimeIntegrated": true,
    "authorship": "original-authored",
    "reviewScope": "Independently reviewed alternate checkpoints within existing task families. No new delayed-family novelty, full-subject mastery or score prediction is claimed."
  },
  {
    "id": "next-rc.inference-recovery-a",
    "objectiveId": "rc.inference",
    "familyId": "rc.traffic.limit",
    "familyRationale": "Alternate original checkpoint within the existing skill family. A changed context, source ID or numerical value does not establish delayed-family novelty.",
    "world": "rc",
    "pool": "check",
    "prompt": "Suppose every mark became perfectly readable. Why would the number of readable marks still not, by itself, determine the number of cards?",
    "choices": [
      "The passage says all cards carry exactly one mark.",
      "A card can carry more than one mark.",
      "The lamp would necessarily create new cards.",
      "Perfect readability would require removing the cards from storage."
    ],
    "answer": 1,
    "hint": "Separate detecting a mark from counting the object that carries it.",
    "explanation": "The passage states that one card can carry several marks. Perfectly detecting every mark would not supply a one-mark-to-one-card relationship.",
    "feedback": [
      "The passage states the opposite: a card can carry several marks.",
      "Correct: several marks may belong to the same card.",
      "No such effect is reported or required.",
      "The passage supplies no such requirement."
    ],
    "sourceUrls": [
      "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/dat_candidate_guide.pdf"
    ],
    "passageId": "recovery-rc-archive",
    "originalPassage": true,
    "passage": {
      "title": "Marks under a new light — original fictional report",
      "paragraphs": [
        "A museum photographed marks on storage cards to help staff search the collection. Software counted readable marks in each image. A card could carry several marks, and a faded mark could be present without being readable. The project leader therefore distinguished the software count from the number of cards or objects in storage.",
        "The team photographed the same twelve trays twice without adding, removing or rearranging cards. For the second photograph of six trays, a lamp was moved to reduce reflections. The other six trays were photographed again with the original lighting. A reviewer who did not know which lighting had been used compared matched images.",
        "The software counted more readable marks under the changed lighting. The reviewer identified specific marks that could be read in those images but were obscured by reflections in the earlier images. Counts from trays kept under the original lighting changed little. The trial supported improved readability; it did not show that the collection had grown.",
        "The report recommended recording lighting conditions and retaining periodic card inventories. It described the photographic system as a useful search aid, while warning against treating readable-mark totals as object totals. The small trial did not establish which lighting would work best for every kind of card."
      ]
    },
    "sourceId": "next-rc.inference-recovery-a",
    "sourceVersion": "dat-recovery-item-v1",
    "recoveryVersion": 1,
    "reviewStatus": "internal-reviewed",
    "verified": true,
    "progressEligible": true,
    "runtimeIntegrated": true,
    "authorship": "original-authored",
    "reviewScope": "Independently reviewed alternate checkpoints within existing task families. No new delayed-family novelty, full-subject mastery or score prediction is claimed."
  },
  {
    "id": "next-rc.inference-recovery-b",
    "objectiveId": "rc.inference",
    "familyId": "rc.traffic.limit",
    "familyRationale": "Alternate original checkpoint within the existing skill family. A changed context, source ID or numerical value does not establish delayed-family novelty.",
    "world": "rc",
    "pool": "check",
    "prompt": "If a future detector recognized every crossing in a recording, what limitation would still prevent that count alone from establishing distinct visitor attendance?",
    "choices": [
      "The same visitor may appear in more than one crossing.",
      "A perfect detector must report zero crossings.",
      "Every crossing would necessarily be made by a different visitor.",
      "Manual review would prove that the recordings contain no repeated visitors."
    ],
    "answer": 0,
    "hint": "A detector counts the event named in its output. Consider whether one person can generate several such events.",
    "explanation": "Perfect event detection would resolve missed crossings, but the passage separately allows repeat crossings by the same visitor. Unique attendance still requires additional information.",
    "feedback": [
      "Correct: complete crossing detection does not identify unique people.",
      "Perfect detection would not erase events.",
      "The passage explicitly allows a visitor to cross more than once.",
      "The report does not establish or propose that conclusion."
    ],
    "sourceUrls": [
      "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/dat_candidate_guide.pdf"
    ],
    "passageId": "recovery-rc-entry",
    "originalPassage": true,
    "passage": {
      "title": "When a detector misses a crossing — original fictional report",
      "paragraphs": [
        "A greenhouse used an electronic detector to count crossings through an entrance. Managers hoped the total would describe visitor attendance. The report noted two separate limitations: the detector could miss crossings, and the same visitor could cross more than once. A crossing total was therefore not automatically a count of distinct visitors.",
        "Technicians replayed the same stored entrance recordings through two versions of the detection software. The second version recognized dimmer images. Because both versions analyzed the same recordings, the software comparison introduced no new visitors or crossings into the recorded scene. Reviewers also marked visible crossings manually in selected clips.",
        "The revised software reported more crossings. In several clips, manual reviewers confirmed crossings that the revised version detected but the original version had missed. Some dim crossings were still missed by both versions. The report did not determine whether every entrance or lighting condition would show the same improvement.",
        "The authors supported further use of the revised detector alongside manual checks. They recommended labeling its output as detected crossings and using separate information to estimate distinct visitors. Their recommendation preserved the tool’s usefulness without treating its remaining limitations as resolved."
      ]
    },
    "sourceId": "next-rc.inference-recovery-b",
    "sourceVersion": "dat-recovery-item-v1",
    "recoveryVersion": 1,
    "reviewStatus": "internal-reviewed",
    "verified": true,
    "progressEligible": true,
    "runtimeIntegrated": true,
    "authorship": "original-authored",
    "reviewScope": "Independently reviewed alternate checkpoints within existing task families. No new delayed-family novelty, full-subject mastery or score prediction is claimed."
  },
  {
    "id": "next-rc.tone-recovery-a",
    "objectiveId": "rc.tone",
    "familyId": "rc.traffic.tone",
    "familyRationale": "Alternate original checkpoint within the existing skill family. A changed context, source ID or numerical value does not establish delayed-family novelty.",
    "world": "rc",
    "pool": "check",
    "prompt": "Which description best matches the author’s attitude toward the photographic system?",
    "choices": [
      "Unqualified confidence that its totals equal the collection size.",
      "Dismissal of the system because it has limitations.",
      "Support for its practical use with clear limits on what its counts mean.",
      "Indifference to whether the system’s output is interpreted accurately."
    ],
    "answer": 2,
    "hint": "Use the recommendation and its qualifications together.",
    "explanation": "The author keeps the system as a useful search aid while recommending lighting records and separate inventories. This is qualified support, not unconditional acceptance or rejection.",
    "feedback": [
      "The report expressly warns against equating the totals.",
      "The report retains the system as a useful aid.",
      "Correct: the recommendation combines usefulness with careful interpretation.",
      "The central caution concerns accurate interpretation."
    ],
    "sourceUrls": [
      "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/dat_candidate_guide.pdf"
    ],
    "passageId": "recovery-rc-archive",
    "originalPassage": true,
    "passage": {
      "title": "Marks under a new light — original fictional report",
      "paragraphs": [
        "A museum photographed marks on storage cards to help staff search the collection. Software counted readable marks in each image. A card could carry several marks, and a faded mark could be present without being readable. The project leader therefore distinguished the software count from the number of cards or objects in storage.",
        "The team photographed the same twelve trays twice without adding, removing or rearranging cards. For the second photograph of six trays, a lamp was moved to reduce reflections. The other six trays were photographed again with the original lighting. A reviewer who did not know which lighting had been used compared matched images.",
        "The software counted more readable marks under the changed lighting. The reviewer identified specific marks that could be read in those images but were obscured by reflections in the earlier images. Counts from trays kept under the original lighting changed little. The trial supported improved readability; it did not show that the collection had grown.",
        "The report recommended recording lighting conditions and retaining periodic card inventories. It described the photographic system as a useful search aid, while warning against treating readable-mark totals as object totals. The small trial did not establish which lighting would work best for every kind of card."
      ]
    },
    "sourceId": "next-rc.tone-recovery-a",
    "sourceVersion": "dat-recovery-item-v1",
    "recoveryVersion": 1,
    "reviewStatus": "internal-reviewed",
    "verified": true,
    "progressEligible": true,
    "runtimeIntegrated": true,
    "authorship": "original-authored",
    "reviewScope": "Independently reviewed alternate checkpoints within existing task families. No new delayed-family novelty, full-subject mastery or score prediction is claimed."
  },
  {
    "id": "next-rc.tone-recovery-b",
    "objectiveId": "rc.tone",
    "familyId": "rc.traffic.tone",
    "familyRationale": "Alternate original checkpoint within the existing skill family. A changed context, source ID or numerical value does not establish delayed-family novelty.",
    "world": "rc",
    "pool": "check",
    "prompt": "Which recommendation is most consistent with the author’s stance?",
    "choices": [
      "Treat all detected crossings as distinct visitors without further information.",
      "Keep using the revised detector with manual checks and accurate labeling of its output.",
      "Reject every electronic detector because some crossings are missed.",
      "Stop checking the detector once it outperforms the earlier version."
    ],
    "answer": 1,
    "hint": "Find the action the conclusion endorses and the limitation it keeps.",
    "explanation": "The author supports continued use alongside checks and explicitly labels the output as crossings. Improved performance is useful but does not erase remaining uncertainties.",
    "feedback": [
      "This removes the distinction the author insists on preserving.",
      "Correct: it combines the tool’s usefulness with the report’s stated safeguards.",
      "The author does not reject the tool.",
      "The conclusion explicitly retains manual checks."
    ],
    "sourceUrls": [
      "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/dat_candidate_guide.pdf"
    ],
    "passageId": "recovery-rc-entry",
    "originalPassage": true,
    "passage": {
      "title": "When a detector misses a crossing — original fictional report",
      "paragraphs": [
        "A greenhouse used an electronic detector to count crossings through an entrance. Managers hoped the total would describe visitor attendance. The report noted two separate limitations: the detector could miss crossings, and the same visitor could cross more than once. A crossing total was therefore not automatically a count of distinct visitors.",
        "Technicians replayed the same stored entrance recordings through two versions of the detection software. The second version recognized dimmer images. Because both versions analyzed the same recordings, the software comparison introduced no new visitors or crossings into the recorded scene. Reviewers also marked visible crossings manually in selected clips.",
        "The revised software reported more crossings. In several clips, manual reviewers confirmed crossings that the revised version detected but the original version had missed. Some dim crossings were still missed by both versions. The report did not determine whether every entrance or lighting condition would show the same improvement.",
        "The authors supported further use of the revised detector alongside manual checks. They recommended labeling its output as detected crossings and using separate information to estimate distinct visitors. Their recommendation preserved the tool’s usefulness without treating its remaining limitations as resolved."
      ]
    },
    "sourceId": "next-rc.tone-recovery-b",
    "sourceVersion": "dat-recovery-item-v1",
    "recoveryVersion": 1,
    "reviewStatus": "internal-reviewed",
    "verified": true,
    "progressEligible": true,
    "runtimeIntegrated": true,
    "authorship": "original-authored",
    "reviewScope": "Independently reviewed alternate checkpoints within existing task families. No new delayed-family novelty, full-subject mastery or score prediction is claimed."
  },
  {
    "id": "next-rc-passage-structure-recovery-a",
    "objectiveId": "rc-passage-structure",
    "familyId": "rc-whole-passage-map",
    "familyRationale": "Alternate original checkpoint within the existing skill family. A changed context, source ID or numerical value does not establish delayed-family novelty.",
    "world": "rc",
    "pool": "check",
    "prompt": "Which outline best represents the passage’s organization?",
    "choices": [
      "A completed solution → proof that reading errors disappeared → permanent adoption.",
      "A proposed change and constraint → a measured benefit and cost → a revised design to test.",
      "An unrelated history → a purchase-price comparison → rejection of all shutters.",
      "Two identical trial results → a claim that light has no effect → abandonment of displays."
    ],
    "answer": 1,
    "hint": "Identify what each paragraph contributes before combining their roles.",
    "explanation": "The first paragraph presents the proposed shutters and reading requirement. The second reports the fading benefit and reading cost. The third proposes a revised test that responds to both.",
    "feedback": [
      "The tested shutters caused more reading errors, and unchanged adoption is not recommended.",
      "Correct: this preserves the proposal, evidence tradeoff and evidence-based next step.",
      "No unrelated history or price comparison appears, and all shutters are not rejected.",
      "The trial results differ, and the display program is not abandoned."
    ],
    "sourceUrls": [
      "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/dat_candidate_guide.pdf"
    ],
    "passageId": "recovery-rc-shutters",
    "originalPassage": true,
    "canonId": "rc-passage-map",
    "passage": {
      "title": "A shutter that changes two outcomes — original fictional report",
      "paragraphs": [
        "An archive proposed closing slatted shutters during afternoon sunlight to reduce fading on displayed pages. Staff also needed visitors to read the pages without additional lamps.",
        "In the trial, pages behind closed shutters faded less than matched pages behind open shutters. However, visitors made more reading errors behind the closed shutters. The trial thus identified a benefit and a cost under the tested conditions.",
        "The report proposes testing a wider spacing between slats. It retains the aim of reducing sunlight while seeking enough light for reading; it does not recommend the tested closed shutters unchanged."
      ]
    },
    "sourceId": "next-rc-passage-structure-recovery-a",
    "sourceVersion": "dat-recovery-item-v1",
    "recoveryVersion": 1,
    "reviewStatus": "internal-reviewed",
    "verified": true,
    "progressEligible": true,
    "runtimeIntegrated": true,
    "authorship": "original-authored",
    "reviewScope": "Independently reviewed alternate checkpoints within existing task families. No new delayed-family novelty, full-subject mastery or score prediction is claimed."
  },
  {
    "id": "next-rc-passage-structure-recovery-b",
    "objectiveId": "rc-passage-structure",
    "familyId": "rc-role-local-function",
    "familyRationale": "Alternate original checkpoint within the existing skill family. A changed context, source ID or numerical value does not establish delayed-family novelty.",
    "world": "rc",
    "pool": "check",
    "prompt": "What role does paragraph 2 play in the passage?",
    "choices": [
      "It identifies the update risk that the checklist in paragraph 3 is designed to address.",
      "It proves that duplicate labels cannot help anyone locate supplies.",
      "It gives a separate cost calculation unrelated to the final proposal.",
      "It recommends discarding the lid label before the final proposal is developed."
    ],
    "answer": 0,
    "hint": "Connect the concern raised in paragraph 2 with the change introduced in paragraph 3.",
    "explanation": "Paragraph 2 explains how two labels can become inconsistent after a move. The final checklist directly addresses that risk by requiring both updates and a comparison.",
    "feedback": [
      "Correct: the stated concern explains why the final proposal adds the checklist.",
      "The concern does not erase the locating benefit described in paragraph 1.",
      "No cost calculation is supplied.",
      "The final proposal keeps both labels; paragraph 2 does not recommend discarding one."
    ],
    "sourceUrls": [
      "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/dat_candidate_guide.pdf"
    ],
    "passageId": "recovery-rc-labels",
    "originalPassage": true,
    "canonId": "rc-passage-map",
    "passage": {
      "title": "Keeping an extra label current — original fictional report",
      "paragraphs": [
        "A storeroom proposed placing a duplicate location label on each container’s lid so that staff could locate supplies without lifting containers from a crowded shelf.",
        "A supervisor noted that relocated supplies would require both the side label and the lid label to be changed. If only one were updated, the labels could direct staff to different locations.",
        "The revised proposal keeps both labels but adds a relocation checklist requiring staff to update and compare them before returning the container to the shelf."
      ]
    },
    "sourceId": "next-rc-passage-structure-recovery-b",
    "sourceVersion": "dat-recovery-item-v1",
    "recoveryVersion": 1,
    "reviewStatus": "internal-reviewed",
    "verified": true,
    "progressEligible": true,
    "runtimeIntegrated": true,
    "authorship": "original-authored",
    "reviewScope": "Independently reviewed alternate checkpoints within existing task families. No new delayed-family novelty, full-subject mastery or score prediction is claimed."
  },
  {
    "id": "next-rc-bounded-inference-recovery-a",
    "objectiveId": "rc-bounded-inference",
    "familyId": "rc-qualified-observation",
    "familyRationale": "Alternate original checkpoint within the existing skill family. A changed context, source ID or numerical value does not establish delayed-family novelty.",
    "world": "rc",
    "pool": "check",
    "prompt": "Which conclusion is best supported by the tested results?",
    "choices": [
      "The mat prevents every slip in both rooms.",
      "The mat cannot be useful in any room.",
      "The observed benefit differed between the two rooms under the tested conditions.",
      "The test established that Room South had no slips before the mat was installed."
    ],
    "answer": 2,
    "hint": "Keep the conclusion within the two reported comparisons.",
    "explanation": "A decrease was observed in Room North but not in Room South. The evidence supports a difference in the measured benefit, without proving universal success, universal failure or an unreported starting count.",
    "feedback": [
      "The passage reports neither complete prevention nor improvement in both rooms.",
      "Room North showed a measured benefit, so universal uselessness is not supported.",
      "Correct: this matches both reported observations and preserves their scope.",
      "No zero baseline is reported for Room South."
    ],
    "sourceUrls": [
      "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/dat_candidate_guide.pdf"
    ],
    "passageId": "recovery-rc-mats",
    "originalPassage": true,
    "canonId": "rc-passage-map",
    "passage": {
      "title": "Two rooms, one mat design — original fictional report",
      "paragraphs": [
        "A workshop tested the same floor-mat design in Room North and Room South. Under the measured conditions, slips were less frequent with the mat in Room North. The test found no decrease in slips in Room South.",
        "The report recommends examining the conditions in each room before extending use of the mat. It neither concludes that the mat prevents every slip nor that it has no value anywhere."
      ]
    },
    "sourceId": "next-rc-bounded-inference-recovery-a",
    "sourceVersion": "dat-recovery-item-v1",
    "recoveryVersion": 1,
    "reviewStatus": "internal-reviewed",
    "verified": true,
    "progressEligible": true,
    "runtimeIntegrated": true,
    "authorship": "original-authored",
    "reviewScope": "Independently reviewed alternate checkpoints within existing task families. No new delayed-family novelty, full-subject mastery or score prediction is claimed."
  },
  {
    "id": "next-rc-bounded-inference-recovery-b",
    "objectiveId": "rc-bounded-inference",
    "familyId": "rc-qualified-observation",
    "familyRationale": "Alternate original checkpoint within the existing skill family. A changed context, source ID or numerical value does not establish delayed-family novelty.",
    "world": "rc",
    "pool": "check",
    "prompt": "What reason does the passage give for recommending seal S when containers may enter either tested storage condition?",
    "choices": [
      "S is proven cheapest to purchase.",
      "R fails under every possible condition.",
      "S is proven effective under freezing and vibration.",
      "S retained contents in both tested conditions, while some R containers leaked in warm storage."
    ],
    "answer": 3,
    "hint": "Use the comparison that was actually tested and reported.",
    "explanation": "Seal S performed successfully in the two specified trials, whereas R had leakage in the warm trial. The recommendation is bounded by those tested conditions; it does not establish price or untested performance.",
    "feedback": [
      "The report gives no purchase-price comparison.",
      "R retained contents in the cool-storage trial.",
      "Those conditions are explicitly untested.",
      "Correct: this states the supporting evidence without extending its scope."
    ],
    "sourceUrls": [
      "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/dat_candidate_guide.pdf"
    ],
    "passageId": "recovery-rc-seals",
    "originalPassage": true,
    "canonId": "rc-passage-map",
    "passage": {
      "title": "Seals under two storage conditions — original fictional report",
      "paragraphs": [
        "Containers with seal R retained their contents in the cool-storage trial, but several leaked in warm storage. Containers with seal S retained their contents in both tested storage conditions.",
        "The report recommends seal S for containers that may face either tested condition. It provides no comparison of purchase price or performance under freezing, vibration or other untested conditions."
      ]
    },
    "sourceId": "next-rc-bounded-inference-recovery-b",
    "sourceVersion": "dat-recovery-item-v1",
    "recoveryVersion": 1,
    "reviewStatus": "internal-reviewed",
    "verified": true,
    "progressEligible": true,
    "runtimeIntegrated": true,
    "authorship": "original-authored",
    "reviewScope": "Independently reviewed alternate checkpoints within existing task families. No new delayed-family novelty, full-subject mastery or score prediction is claimed."
  }
];
