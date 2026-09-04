// Built by dat-game-forge/tools/build-bank.mjs. Do not hand-edit.
// Source: AceTheDAT-content-library/ochem-bank/*.bank
// Every structure here parsed through RDKit and every answer was checked
// against the other choices and the starting material at build time.
window.ACE_BANK = [
 {
  "id": "ace-0001",
  "q": "Four cations are drawn. Which one holds its positive charge most comfortably?",
  "q_smiles": null,
  "opts_are_structures": true,
  "opts": [
   "[CH3+]",
   "CCC[CH2+]",
   "C[CH2+]",
   "C[C+](C)C",
   "C[CH+]C"
  ],
  "correct": 3,
  "why": "The empty p orbital is a hole, and every neighboring carbon leans its C-H bonds into that hole to help fill it. Three neighbors leaning in beats two, two beats one, one beats none.",
  "trap": "Counting the carbons in the whole molecule instead of the carbons touching the charge makes the long chain look like the answer.",
  "module": "l2-carbocation",
  "roots": [
   "l1-charge"
  ],
  "level": 2,
  "group": null,
  "difficulty": 2,
  "source": "ace",
  "keep": true,
  "scope_ok": true,
  "smiles_valid": true
 },
 {
  "id": "ace-0002",
  "q": "3-methyl-1-butene is treated with HBr. Which product comes out of the flask in the largest amount?",
  "q_smiles": "C=CC(C)C",
  "opts_are_structures": true,
  "opts": [
   "CC(Br)C(C)C",
   "CCC(C)(C)O",
   "BrCCC(C)C",
   "CCC(C)(C)Br",
   "CC=C(C)C"
  ],
  "correct": 3,
  "why": "The proton lands on the end carbon and leaves a secondary cation sitting right next to a tertiary carbon. A hydrogen slides over with its pair, the charge moves to the better spot, and the bromide finds it there. The skeleton you started with is not the skeleton you finish with.",
  "trap": "The Markovnikov answer without the shift is the one that looks right after one step, which is why it is drawn second.",
  "module": "l2-carbocation",
  "roots": [
   "l1-charge"
  ],
  "level": 2,
  "group": null,
  "difficulty": 3,
  "source": "ace",
  "keep": true,
  "scope_ok": true,
  "smiles_valid": true
 },
 {
  "id": "ace-0003",
  "q": "A secondary cation becomes a tertiary cation partway through an addition. What actually moved?",
  "q_smiles": null,
  "opts_are_structures": false,
  "opts": [
   "Nothing moved, the charge spread out on its own",
   "A methyl group carrying none of its electrons",
   "A bromide ion arriving from the solvent",
   "A hydrogen carrying both of its bonding electrons",
   "A hydrogen carrying none of its electrons"
  ],
  "correct": 3,
  "why": "The group that migrates carries its pair with it, so the carbon it left is the one that ends up positive. That is the whole reason the charge lands one carbon over and lands somewhere better.",
  "trap": "A hydrogen leaving without its electrons is a proton, and a proton leaving would not move the charge anywhere useful.",
  "module": "l2-carbocation",
  "roots": [
   "l1-charge"
  ],
  "level": 2,
  "group": null,
  "difficulty": 2,
  "source": "ace",
  "keep": true,
  "scope_ok": true,
  "smiles_valid": true
 },
 {
  "id": "ace-0004",
  "q": "Which cation is held up by resonance rather than by its neighbors?",
  "q_smiles": null,
  "opts_are_structures": true,
  "opts": [
   "C=C[CH2+]",
   "C[CH+]C",
   "C[C+](C)C",
   "[CH3+]",
   "CC[CH2+]"
  ],
  "correct": 0,
  "why": "This cation sits right next to a double bond, so the pair in that bond slides over and two carbons share the charge at once. The others have nothing to share with, only neighbors leaning in.",
  "trap": "The tertiary cation gets picked because it is the most stable one on the page. It is stable, and it is stable for a different reason than the question asks about.",
  "module": "l2-carbocation",
  "roots": [
   "l1-charge"
  ],
  "level": 2,
  "group": null,
  "difficulty": 2,
  "source": "ace",
  "keep": true,
  "scope_ok": true,
  "smiles_valid": true
 },
 {
  "id": "ace-0005",
  "q": "A tertiary cation and a primary cation could both form from the same starting material. Which one does the reaction actually run through?",
  "q_smiles": null,
  "opts_are_structures": false,
  "opts": [
   "Both about equally, because the nucleophile does not care which it finds",
   "Neither, because the starting material stays as it is",
   "The primary one, because it is smaller and easier for the nucleophile to reach",
   "The tertiary one, because it forms faster and there are far more of them",
   "The primary one, because it is the first one that can form"
  ],
  "correct": 3,
  "why": "Making the cation is the slow step, and the more stable cation sits at the lower hill. A lower hill is a faster climb, so nearly all of the material goes down that path and the other one never gets a turn.",
  "trap": "The smaller cation being easier to reach sounds reasonable and has nothing to do with which one forms.",
  "module": "l2-carbocation",
  "roots": [
   "l1-charge"
  ],
  "level": 2,
  "group": null,
  "difficulty": 2,
  "source": "ace",
  "keep": true,
  "scope_ok": true,
  "smiles_valid": true
 },
 {
  "id": "ace-0006",
  "q": "Propene is treated with HBr and no peroxides are present. What is the major product?",
  "q_smiles": "C=CC",
  "opts_are_structures": true,
  "opts": [
   "CC(C)O",
   "C=C(C)Br",
   "CC(C)Br",
   "CC(Br)CBr",
   "CCCBr"
  ],
  "correct": 2,
  "why": "The proton adds first, and it adds to the carbon that leaves the better cation behind. That puts the charge in the middle, and bromide finds it there.",
  "trap": "The end-carbon answer is the peroxide answer. The peroxide line is the only thing separating these two questions.",
  "module": "t4-alkene",
  "roots": [
   "l2-carbocation",
   "l2-arrows"
  ],
  "level": 4,
  "group": null,
  "difficulty": 2,
  "source": "ace",
  "keep": true,
  "scope_ok": true,
  "smiles_valid": true
 },
 {
  "id": "ace-0007",
  "q": "Propene is treated with HBr with peroxides present. What is the major product?",
  "q_smiles": "C=CC",
  "opts_are_structures": true,
  "opts": [
   "CCCBr",
   "CCCO",
   "C=C(C)Br",
   "CC(C)Br",
   "CC(C)O"
  ],
  "correct": 0,
  "why": "With peroxides, a bromine radical arrives first instead of a proton, and it lands where it leaves the better radical. The better radical is the middle carbon, so the bromine ends up on the end.",
  "trap": "This question and the one before it look identical until the word peroxides, which is exactly why the test writes them as a pair.",
  "module": "t4-alkene",
  "roots": [
   "l2-carbocation",
   "l2-arrows"
  ],
  "level": 4,
  "group": null,
  "difficulty": 2,
  "source": "ace",
  "keep": true,
  "scope_ok": true,
  "smiles_valid": true
 },
 {
  "id": "ace-0008",
  "q": "1-butene is treated with BH3 in THF, then with hydrogen peroxide and hydroxide. What comes out?",
  "q_smiles": "C=CCC",
  "opts_are_structures": true,
  "opts": [
   "CCCC=O",
   "CCC(C)Br",
   "CCC(C)O",
   "OCC(C)C",
   "OCCCC"
  ],
  "correct": 4,
  "why": "Boron is the bulky piece, so it lands on the less crowded carbon, and the hydrogen goes to the other one. The second reagent swaps the oxygen into the boron's exact spot, holding everything where it already was.",
  "trap": "Running this like an ordinary acid addition puts the oxygen in the middle, which is the second choice down.",
  "module": "t4-alkene",
  "roots": [
   "l2-carbocation",
   "l2-arrows"
  ],
  "level": 4,
  "group": null,
  "difficulty": 2,
  "source": "ace",
  "keep": true,
  "scope_ok": true,
  "smiles_valid": true
 },
 {
  "id": "ace-0009",
  "q": "2-methyl-2-butene is treated with ozone, then with dimethyl sulfide. What is in the flask?",
  "q_smiles": "CC=C(C)C",
  "opts_are_structures": false,
  "opts": [
   "Acetone and acetaldehyde",
   "Butanone and formaldehyde",
   "2-methyl-2-butanol",
   "Acetone and acetic acid",
   "2-methylbutanal"
  ],
  "correct": 0,
  "why": "Ozone cuts the double bond in half and caps each half with an oxygen. The carbon carrying two methyls becomes a ketone, the carbon carrying a hydrogen becomes an aldehyde. Dimethyl sulfide is the reagent that stops it there.",
  "trap": "With hydrogen peroxide as the second reagent the aldehyde half keeps going to the acid, so the second reagent is half of this question.",
  "module": "t4-alkene",
  "roots": [
   "l2-carbocation",
   "l2-arrows"
  ],
  "level": 4,
  "group": null,
  "difficulty": 2,
  "source": "ace",
  "keep": true,
  "scope_ok": true,
  "smiles_valid": true
 },
 {
  "id": "ace-0010",
  "q": "Cyclopentene is treated with Br2 in dichloromethane. Where do the two bromines end up?",
  "q_smiles": "C1=CCCC1",
  "opts_are_structures": false,
  "opts": [
   "On opposite faces only if the flask is heated",
   "Both attached to the same carbon",
   "One bromine adds and the other stays in solution",
   "On the same face of the ring",
   "On opposite faces of the ring"
  ],
  "correct": 4,
  "why": "The first bromine closes into a three-membered bridge across one face of the ring, so the only face still open when the second bromine arrives is the other one. Anti addition is not a rule to memorize, it is what the bridge leaves room for.",
  "trap": "Picturing both bromines arriving together gives the same-face answer every time.",
  "module": "t4-alkene",
  "roots": [
   "l2-carbocation",
   "l2-arrows"
  ],
  "level": 4,
  "group": null,
  "difficulty": 3,
  "source": "ace",
  "keep": true,
  "scope_ok": true,
  "smiles_valid": true
 }
];
