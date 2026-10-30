# Mirrored stereo pictures: fixed 2026-10-30

The question-system audit found that SmilesDrawer, with the settings the full
mocks, the Prometric-style practice tests and Game Central used (explicit
hydrogens on), drew 50 of 275 bank stereocenters as their mirror image (45
molecules). In two full-mock items (FULL_2 OChem 1, FULL_4 OChem 9) a student
who reasons correctly from the pictures was marked as a miss.

Fix: the three pages that draw molecules (tools/mock/full.js,
prometric-mock.html, games/play.html) now draw with explicitHydrogens: false,
the setting the OChem Tree already used. Re-running the audit with each page's
exact drawing settings: 0 mirrored centers in the full mocks and practice
tests; 5 centers in 3 molecules remain, all in the OChem 1000 bank (Game
Central):

- odb-1160 choices 0 and 3 (3,4-dimethylcyclobutene): both stereocenters flip
  together, so cis stays cis and trans stays trans; the question tests cis
  versus trans, so it stays answerable as drawn.
- odb-553 choice 3 (an O-methylated ester): a distractor that differs from the
  key in its structure, not only its configuration.

No answer key changed. Full list: picture-disputes.json.
