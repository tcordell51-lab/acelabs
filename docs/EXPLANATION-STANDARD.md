# ACE DAT explanation standard

Draft for Thomas, 2026-11-19. Applies to every explanation a student reads: question explanations, lab feedback, rule boxes, walkthroughs.

**The goal:** a student who just missed sees why in under 10 seconds, on a phone, without reading a paragraph.

---

## 1. The shape (always these six parts, always this order)

| # | Part | Length | What it is |
|---|---|---|---|
| 1 | **The answer** | 1 line | The right answer as a plain statement. Not "B". |
| 2 | **The trick** | 1 line | Thomas's own recorded line, with its source. If no recorded line fits: label it **"Draft trick, Thomas to approve"**. Never invent a quote. |
| 3 | **Steps** | 3 to 5 lines | Numbered. One idea per line. About 12 words max. Numbers shown. Each step is one board frame. |
| 4 | **The trap** | 1 to 2 lines | Why the choice *they picked* is wrong. One trap line per wrong choice. |
| 5 | **Check yourself** | 1 line | One quick question, answer hidden behind a tap. |
| 6 | **Sources** | small | Collapsed by default. Textbook section, data table, Thomas's recording id. |

When a student misses, the panel **opens on part 4** (their trap), then the answer, the trick, and the board.

## 2. The rules

- **No paragraph over 2 lines.** Anywhere.
- **A line is 80 characters at most.** That is one row on desktop and two rows on a 390 px phone at 16 px.
- **A step is about 12 words.** The lint fails a step over 14.
- **Bold only the key term of each step.** One bold per step, at most.
- **No em dashes.** Use a colon, a comma, or a new line.
- **No emojis, no unicode glyph icons** (check marks, stars, arrows used as icons). Arrows inside an equation are fine.
- **Plain words.** "Higher one is reduced", not "the species exhibiting the greater reduction potential undergoes reduction".
- **Numbers shown.** Write the arithmetic: `0.337 − (−0.7618) = +1.099 V`.
- **Science is computed, not typed.** Every number in a step or on a board comes from code and is listed in a verify file.
- **Mobile first.** Body text 16 px or more, tap targets 44 px or more, no sideways scroll at 360 px.

## 3. Thomas's voice

- The trick slot takes **only his recorded words**, from the playbooks (`reports/teaching-system/*/playbook.md`, `reports/ochem-playbook-2026-11-17/style.md`) or the clever-tricks boards, with the Zoom id and time in Sources.
- Trim filler ("um", "right?") only. Do not reword inside the quote marks.
- Anything written for him is labeled **Draft trick, Thomas to approve** and shown without quote marks.
- His terms (Red Cat, An Ox, Catan, magic sauce, the pit) can appear in steps without quote marks; they are his vocabulary, not a quote.

## 4. The board (animated whiteboard)

- Every step has a board frame (`data-frame` on the step). Next draws that frame: strokes draw in, text writes left to right. Back jumps. Replay redraws.
- Marker look: cream board, Kalam and Permanent Marker, forest / gold / red / blue ink. Same palette as the whiteboards and clever-tricks boards.
  - **Gold** = what decides it. **Red** = the trap. **Blue** = the moving thing (electrons, the route in). **Green** = correct.
- The last frame on a miss draws **their road in red** (for example, the shortcut across the avocado that skips the pit).
- `prefers-reduced-motion`: every frame drawn at once, every step listed, nothing moves.
- A **voice slot** per walkthrough for Thomas's clip. Empty until he records it. No placeholder audio.

## 5. Markup

**In a page** (rule boxes, lab notes):

```html
<section class="ax" data-explain="gc-galvanic-rule">
  <p class="ax-answer"><span class="ax-k">The answer</span>...</p>
  <p class="ax-trick" data-said="Zoom 2026-04-28 #84183655423 ~0:14:46"><span class="ax-k">Thomas's trick</span>...</p>
  <ol class="ax-steps"><li data-frame="1">...</li> ... </ol>
  <p class="ax-trap"><span class="ax-k">The trap</span>...</p>
  <div class="ax-check"><span class="ax-k">Check yourself</span><span class="ax-q">...</span>
    <details class="ax-a"><summary>Show answer</summary><span>...</span></details></div>
  <details class="ax-sources"><summary>Sources</summary>...</details>
</section>
```

A draft trick uses `data-draft` instead of `data-said`.

**In code** (questions, walkthroughs): `{ answer, trick: { text, src } or { text, draft: true }, steps: [{ text, frame }], traps: { choice: text }, check: { q, a }, sources: [] }`. Marks: `**bold**`, `H_2O`, `10^{23}`, `Cu^{2+}`.

## 6. Before and after

### A. The galvanic rule box (`/gc/galvanic/`)

**Before** (one 5-sentence paragraph):

> The half-cell with the higher standard reduction potential is reduced: it is the cathode. The other is oxidized: it is the anode. Electrons leave the anode through the wire and arrive at the cathode, and E°cell = E°cathode minus E°anode, which is positive for a galvanic cell. In the salt bridge, anions drift toward the anode and cations toward the cathode, which keeps both beakers neutral.

**After:**

- **The answer:** Higher reduction potential is reduced: that electrode is the cathode.
- **Thomas's trick:** "Reduction is at the cathode, red cat. The oxidation occurs at the anode and ox."
- **Steps** (each one draws on the board):
  1. Compare the two **reduction potentials**.
  2. Higher one is **reduced**: cathode. The other is oxidized: anode.
  3. **Electrons** leave the anode and run the wire to the cathode.
  4. **Salt bridge**: anions drift to the anode, cations to the cathode.
  5. **E°cell** = E°cathode − E°anode, positive for a galvanic cell.
- **The trap:** Direction comes from the potentials, not left or right in the picture.
- **Check yourself:** Silver and zinc: which one is the anode? *(tap: Zinc. Lower potential, so it is oxidized.)*
- **Sources** (collapsed): OpenStax Chemistry 2e 17.2, 17.3; Appendix L; Zoom 2026-04-28 #84183655423 ~0:14:46.

Science check: higher E° is reduced (cathode); the other is oxidized (anode); electrons run anode to cathode through the wire; E°cell = E°cathode − E°anode > 0 for a galvanic cell; anions migrate toward the anode, cations toward the cathode.

### B. A bank question (`data/gchem.json`, `gc:GC_gv-e3`, Cu/Zn cell, key D +1.10 V)

**Before:**

> Cu^(2+)/Cu is the cathode (more positive); Zn^(2+)/Zn is the anode. E°_cell = +0.34 - (-0.76) = +1.10 V. Adding magnitudes (giving 0.42) is a common sign error.

(This one is also **wrong**: adding the magnitudes gives 1.10, the right answer. The 0.42 comes from adding the two potentials as written, 0.34 + (−0.76). Flagged for a fix.)

**After:**

- **The answer:** E°cell = +1.10 V.
- **Thomas's trick:** "Cat on. Catan. That helps you remember the order of operations" *(Zoom 2026-05-19 #85100490191 ~0:25:35)*
- **Steps:**
  1. More positive **E°** is the cathode: Cu, +0.34 V.
  2. The other is the **anode**: Zn, −0.76 V.
  3. **Catan**: E°cathode − E°anode.
  4. 0.34 − (−0.76) = **+1.10 V**. Positive: galvanic.
- **The trap** (one per wrong choice):
  - A, −1.10 V: Anode minus cathode. Catan puts the cathode first.
  - B, −0.42 V: You added the two potentials as written. Subtract the anode.
  - C, +0.42 V: You subtracted the sizes. Minus a negative is plus: 0.34 + 0.76.
  - E, +0.34 V: That is the cathode alone. Subtract the anode's potential.
- **Check yourself:** Ag⁺/Ag +0.80 V and Cu²⁺/Cu +0.34 V: E°cell? *(tap: +0.46 V. 0.80 − 0.34.)*
- **Sources:** OpenStax Chemistry 2e 17.3; Gen Chem playbook 9.4.

### C. A GuacaMOLE miss (ladder T1: molecules in 11.0 g CO₂, student picked 6.62 × 10²⁴)

**Before:** "Not quite. That answer comes from: skipped the pit: grams times Avogadro. Go back to Trap card, then try again."

**After** (the walkthrough panel):

- **The trap in your pick:** Your pick, 6.62 × 10²⁴, skipped the pit: grams times Avogadro. Go into the pit first: two arrows, never one.
- **The answer:** 11.0 g CO₂ is 1.51 × 10²³ molecules.
- **Thomas's trick:** "Moles are king. We always want to get to moles, it's so crucial" *(Zoom 2026-09-03 #85955264465 ~0:45:01)*
- **Steps:** 1. Start with what they give you: **11.0 g CO₂**. 2. **Into the pit**: 11.0 ÷ 44.0 = 0.250 mol. 3. **Out of the pit**: 0.250 × 6.022 × 10²³ = 1.51 × 10²³ molecules. 4. Your pick, **6.62 × 10²⁴**, took the red road (drawn as a red arc across the avocado, crossed out).
- Then **Try 3 more like this**: three new "skipped the pit" questions.

## 7. The lint

`node scripts/lint-explanations.mjs` (report) and `--strict` (in `npm run test:gates`: fails only when new standard-shape content breaks the rules). `--private DIR` adds the private banks (counts only, no text printed). `--json FILE` writes every finding.

Run 2026-11-19 on branch `feat/miss-walkthrough`:

| Source | Items | Fail | Paragraph over 2 lines | Answer over 1 line | Missing steps | Missing per-choice traps | Trap over 2 lines | Trick over 1 line | Em dash |
|---|---|---|---|---|---|---|---|---|---|
| data/bio.json | 157 | 157 | 157 | 108 | 157 | 157 | 0 | 0 | 0 |
| data/gchem.json | 517 | 517 | 437 | 198 | 517 | 517 | 0 | 0 | 0 |
| data/ochem.json | 387 | 387 | 373 | 310 | 387 | 387 | 0 | 0 | 0 |
| data/qr-climb.json | 90 | 90 | 90 | 13 | 90 | 90 | 0 | 0 | 0 |
| data/qr-dat.json | 21 | 21 | 21 | 4 | 21 | 21 | 0 | 0 | 0 |
| tools/ochem mechanism notes | 53 | 53 | 52 | n/a | n/a | n/a | 0 | 0 | 6 |
| private ace-bank-bio | 1,500 | 1,500 | 1,457 | 1,082 | 1,500 | 0 | 47 | 1,494 | 0 |
| private ace-bank-gchem | 991 | 991 | 810 | 394 | 991 | 0 | 101 | 384 | 0 |
| private ace-bank-ochem | 985 | 985 | 960 | 560 | 985 | 0 | 144 | 520 | 0 |
| private ace-bank-qr | 400 | 400 | 367 | 78 | 400 | 0 | 76 | 92 | 0 |
| private ace-bank-rc | 280 | 280 | 264 | 0 | 280 | 16 | 62 | 139 | 0 |
| **New: galvanic rule box** | 1 | **0** | | | | | | | |
| **New: galvanic walkthroughs and follow-ups** | 249 | **0** | | | | | | | |
| **New: GuacaMOLE walkthroughs and follow-ups** | 195 | **0** | | | | | | | |

Every legacy item fails, mostly for shape (no steps, no check, no sources). The real readability problem is the **paragraph** column: 4,936 of 5,328 bank explanations (93%, public and private) are paragraphs over 2 lines. The private banks already have per-choice traps (good), but their tricks are unattributed and usually over one line.

## 8. How to bring old content up to the standard

1. Answer line first: the first sentence of the old `why`, cut to 80 characters.
2. Turn the arithmetic into 3 to 5 steps. Drop every sentence that is not a step.
3. Use the bank's per-choice `wrong` text as the traps, cut to 2 lines.
4. Trick: only from the playbooks with a source, else "Draft trick, Thomas to approve".
5. Re-run the lint; then the verify script for the numbers.
