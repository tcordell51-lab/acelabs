# Mirrored stereo pictures: fixed 2026-10-30

The question-system audit found that SmilesDrawer, with the settings the full
mocks, the Prometric-style practice tests and Game Central used (explicit
hydrogens on), drew 50 of 275 bank stereocenters as their mirror image (45
molecules). In two full-mock items (FULL_2 OChem 1, FULL_4 OChem 9) a student
who reasons correctly from the pictures was marked as a miss.

Fix: the three pages that draw molecules (tools/mock/full.js,
prometric-mock.html, games/play.html) now draw with explicitHydrogens: false,
the setting the OChem Tree already used. Re-running the audit with each page's
exact drawing settings: 0 mirrored centers in the full mocks; 5 centers in 3
molecules remain, all in the OChem 1000 bank (Game Central):

- odb-1160 choices 0 and 3 (3,4-dimethylcyclobutene): both stereocenters flip
  together, so cis stays cis and trans stays trans; the question tests cis
  versus trans, so it stays answerable as drawn.
- odb-553 choice 3 (an O-methylated ester): a distractor that differs from the
  key in its structure, not only its configuration.

No answer key changed. Full list: picture-disputes.json.

**Correction (B1.1, 2026-10-30).** This note first said "0 mirrored in the
practice tests". That was true only because the practice tests drew nothing:
`renderMoleculeCanvases` in prometric-mock.html passed the canvas element to
SmiDrawer 2.x, which finds its target with `document.querySelectorAll(target)`,
so every draw threw inside SmilesDrawer, was logged, and never reached the
page's text fallback. Every structure in Practice Tests 1 to 3 was a blank box.
The audit above read the SMILES with the page's settings, not the page itself.

## The practice tests, checked on the page (B1.1)

Fix: each canvas gets an id and is drawn through `'#' + id` (as
tools/mock/full.js and games/play.html do), explicitHydrogens stays false, a
drawing error now reaches the text fallback through SmiDrawer's errorCallback,
and the canvas height follows the drawing (it was squashed to 120 px tall in
the narrow phone column).

Check: `node scripts/verify-practice-molecules.mjs` (Playwright and python3
with RDKit; not part of npm test). It starts each practice test in
prometric-mock.html, renders every OChem item that draws a structure, and
reads every drawing back:

- **SmilesDrawer canvases (25 drawings, 21 items, 16 distinct SMILES).** The
  page's own SmiDrawer is wrapped so the positions and wedges each canvas was
  drawn from are recorded; RDKit rebuilds the molecule from those positions
  and wedges alone (the method of scripts/explainers/rdkit-check.py) and must
  get the SMILES back, stereo included. The canvas must also hold ink.
  **25 of 25 are painted and depict their SMILES.** None of the 25 SMILES
  specifies a configuration (no `@` in any practice-test SMILES), and no wedge
  is drawn on any of them, so there is nothing to mirror: the honest line for
  the practice tests is "0 stereo SMILES, 0 wedges, 0 mirrored".
- **Calibration (6 chiral SMILES, not from the bank).** Drawn by the same page
  code and settings, e.g. `C[C@H](Br)CC`, `OC(=O)[C@@H]1CCCN1`,
  `O[C@H]1CCCC[C@@H]1C`: all 6 read back as their SMILES with the right R/S,
  and all 6 mirrored drawings are caught as the other enantiomer. So the
  read-back does see stereo with these settings.
- **Hand-built curved-arrow figures (7, `q_svg`).** Read from their rendered
  labels, bond lines, ring polygons and charge marks and compared with the
  molecules each stem names. **5 of 7 match. 2 do not** (picture disputes for
  Thomas, keys unchanged, recorded in picture-disputes.json under
  practiceTestFigures):
  - **OC_arr007**, Practice Test 1, Sciences 95: the stem names
    3-methyl-2-butanol; the figure draws 4-methylpentan-2-ol (one carbon too
    many). The key (2-bromo-2-methylbutane) follows from the name; working from
    the figure gives a six-carbon bromide, and every choice has five carbons.
  - **OC_arr004**, Practice Test 3, Sciences 82: the stem names propene; the
    figure draws but-2-ene, which has no CH2 end for its own Markovnikov
    caption. The key (2-bromopropane) follows from the name.

Total: 32 drawings in the three practice tests (the "about 32" in the brief),
30 depict their molecule, 2 figures need a redraw. The banks
(shared/dat-mock-tests.js) and every key are untouched; a figure redraw is a
bank edit and waits for Thomas.

| Test | Sciences | Item | Drawing | SMILES | Depicts |
|---|---|---|---|---|---|
| 1 | 74 | OC_abo278 | stem | CC(=O)O | yes |
| 1 | 76 | OC_car157 | stem | CCO | yes |
| 1 | 81 | OC_car165 | stem | CC(=O)C | yes |
| 1 | 86 | OC_syn246 | stem | C=C | yes |
| 1 | 87 | OC_arr005 | stem | CC(C)(C)O | yes |
| 1 | 87 | OC_arr005 | figure | CC(C)(C)Cl . CC(C)(C)O | yes |
| 1 | 94 | OC_alk076 | stem | CC=C | yes |
| 1 | 95 | OC_arr007 | choices A to E | CC(Br)(C)CC, CC(Br)C(C)C, CC=C(C)C, BrCCC(C)C, BrCC(C)CC | yes (5) |
| 1 | 95 | OC_arr007 | figure | CC(O)C(C)C named | **no: draws CC(O)CC(C)C** |
| 1 | 97 | OC_alk078 | stem | C1=CCCCC1 | yes |
| 1 | 99 | OC_aro105 | stem | [O-][N+](=O)c1ccccc1 | yes |
| 1 | 100 | OC_alk065 | stem | CC=C | yes |
| 2 | 76 | OC_aro110 | stem | c1ccccc1 | yes |
| 2 | 79 | OC_ab003 | stem | OC1CCCCC1 | yes |
| 2 | 91 | OC_alk064 | stem | CC=C | yes |
| 2 | 95 | OC_arr008 | stem | c1ccccc1 | yes |
| 2 | 95 | OC_arr008 | figure | benzene . Br2 . FeBr3 | yes |
| 2 | 98 | OC_arr002 | figure | CCC(C)Br . ethoxide | yes |
| 3 | 71 | OC_alk071 | stem | CC=C | yes |
| 3 | 72 | OC_arr003 | figure | carbonate | yes |
| 3 | 76 | OC_aro116 | stem | c1ccccc1 | yes |
| 3 | 79 | OC_abo281 | stem | OC(=O)c1ccccc1 | yes |
| 3 | 82 | OC_arr004 | figure | CC=C . HBr named | **no: draws CC=CC** |
| 3 | 86 | OC_alk074 | stem | CC=C | yes |
| 3 | 87 | OC_mec027 | stem | CCO | yes |
| 3 | 91 | OC_alk075 | stem | CC=C | yes |
| 3 | 92 | OC_arr001 | figure | hydroxide . CH3Br | yes |
| 3 | 99 | OC_alk073 | stem | C1=CCCCC1 | yes |
