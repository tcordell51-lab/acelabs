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

## 2026-10-01: fifteen full sections

- **Twenty new originals** (`rc-o07` to `rc-o26`, 340 questions), each written to
  `verification/AUTHOR.md`, validated, then answered by a blind examiner from a key-stripped
  pack. Result: 340 / 340 blind answers equal the key. Two items were tightened before entry:
  rc-o22-q04 (stem now excludes type AB, the one literal second reading) and rc-o15's Nobel
  sentence (the posthumous rule stated precisely).
- **All 19 migrated passages trimmed** from about 1,700 words to 1,318 to 1,400 (the ADA
  length), keeping every paragraph and every proof line; proof sentence indices were relocated
  by quote text. Four (rc-p01, rc-p05, rc-p10, rc-p15) gained a 17th question, an application
  item. Every trimmed passage was re-answered blind: 308 / 308.
- **Accuracy corrections the examiners caught:** rc-p01 no longer credits the tun's radiation
  tolerance to the glass (hydrated tardigrades resist ionizing radiation about as well; q09 now
  asks about heat); rc-p19 no longer says one isoflurane enantiomer is "twice" as potent;
  rc-p04's integron cassette count softened; two pre-existing distractor notes that misdescribed
  their passage (rc-p18-q14, rc-p19-q06) rewritten.
- **The validator now holds every passage to 1,100 to 1,400 words.**
- **Sections:** 15, each two 17-question passages and one 16-question passage (50 questions).
  `rc-s1` to `rc-s3` are unchanged; `rc-s4` to `rc-s15` are new, one migrated 16-question
  passage plus two 17-question passages, mixed by field.

Totals: 45 passages, 750 questions, 15 sections. Raw examiner outputs: `verification/blind/`.
