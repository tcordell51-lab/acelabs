# How the RC bank was verified (2026-09-30)

Every passage in `data/passages/` passed two gates before it entered the bank.

1. **Blind re-answer.** A second examiner, given only a key-stripped pack (the passage
   with [P# S#] sentence labels and the questions, no keys, no explanations; brief in
   `verification/EXAMINER.md`), answered every question from the passage alone, cited the
   sentence that settles it, tried to defend a second choice on every item, and fact-checked
   the passage. Raw outputs: `verification/blind/<id>.json`. Letters in those files are the
   order the examiner saw; ten passages had their choices reordered afterwards (see 3).
2. **Validator** (`scripts/validate-rc.mjs`): five distinct choices, key never the longest,
   every proof quote found verbatim in its sentence, type set, no em/en dashes or emoji,
   no rotating key pattern, no explanation that names a letter, section sizes.

## Results

| Set | Passages | Questions | Blind answer = key | Two-answer items |
|---|---|---|---|---|
| Migrated from the prep app (original AceTheDAT passages) | 19 | 304 | 304 / 304 | 0 (1 item needed outside knowledge; passage fixed) |
| New originals (`rc-o01` to `rc-o06`) | 6 | 102 | 102 / 102 | 0 |

Accuracy corrections the examiners caught (all applied): rc-p14 inclination compass
(flipping the horizontal component alone DOES reverse a bird), rc-p19 goat bypass result
(brain-only delivery raised the dose), rc-p15 carbon-14 goes to CO first, rc-p10 AM fungi
now grown axenically with myristate, rc-p05 IAVW dates, rc-o05 Eliava institute and the
Patterson antibiotic detail, rc-o04 "mainly sold as a racemate", rc-o03 alcohol
fractionation wording, rc-o01 La Paz arrival. rc-p02 now states the Roman mortar held no
steel (rc-p02-q09 otherwise needed outside knowledge).

3. **Key patterns.** The rc-o01 examiner noticed its keys rotated B-D-A-C-E. A check found
   ten passages with rotation patterns; `scripts/shuffle_choices.py` (seeded) reordered
   their choices, moving notes and proof-choice indexes with them. Shuffled originals
   were re-compared by choice text: still 17/17.

The prep app's own passages were left untouched in `~/code/acethedat-prep`; the fixes
above live only here.
