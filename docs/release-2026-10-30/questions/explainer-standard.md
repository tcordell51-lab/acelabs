# The Ace Labs explainer and visual standard

Version 2, draft for Thomas (2026-10-30). Version 1 went to three subject
experts (Bio and OChem; GC and QR; PAT and RC), who re-solved all 18 pilot
questions blind and reviewed every explainer and picture. Every problem they
verified is fixed here and in pilot.json; section 12 maps each one to its fix.

Every DAT-style question in Ace Labs gets one explainer and one visual, written
in Thomas's coaching voice (question-system/voice-codex.md), stored beside the
bank, never inside it. Pilot: 18 questions in pilot.json, rendered in
preview/index.html. Production: production-plan.md.

What this standard decides:

1. What a student sees after answering (section 1), field by field (section 2).
2. The closed list of trap families, with house-safe wording (section 3).
3. The visual: a JSON spec per question, a catalog of types mapped to renderers
   in the repo, alt text, size and height budgets (section 4).
4. Storage: a student sidecar (published) and a coach record (never published)
   per question, keyed by a stable id; banks and keys are never rewritten
   (section 5).
5. Videos: one slot per subtopic (section 6).
6. Sign-off and the automatic gates that keep it to about 10 minutes a sitting
   (section 7). Key and picture disputes (section 8).

House rules that every field obeys: plain ASCII, no emojis or decorative
glyphs, no em dashes; never "wrong", "incorrect" or "failed" (use Confirmed /
Needs review); no timers in practice; no streaks, points, scores or percentages
as grades, and no confidence gate before feedback; no competitor names;
original content only; an answer key is never changed in passing.

Concepts over math (decisions doc, 2026-10-30): explainers teach the idea
first and the arithmetic second. Science explainers use one or two clean steps
a student can do without a calculator (the DAT gives one only in QR); QR
explainers name the concept behind the setup before computing.

---

## 1. What the student sees (phone first)

The question screen is the DAT-style screen from the interface study (Question
x of N upper left, buttons along the bottom, Exhibit in the sciences,
Calculator in QR). Practice is untimed, so the upper right says "Untimed
practice" where a timed test says "Time remaining". After the student picks a
choice and presses Check, the explainer opens under the question (phone) or
beside it (desktop, 1100 px and wider). Order, top to bottom:

| # | Block | What it holds | Budget |
|---|---|---|---|
| 1 | Status | "Confirmed" (the pick is the key) or "Needs review" (it is not), plus "You picked C." | one line |
| 2 | The answer | Letter and text of the key, then one line of why | 25 words |
| 3 | The picture | The visual and a caption that says where to look | section 4.3 |
| 4 | How to get there | 1 to 4 numbered steps, the reasoning a strong student uses | 40 words a step |
| 5 | The traps | Every other choice: letter, text, trap label (or family name), one or two sentences. The student's pick is listed first, marked "Your pick" | 35 words a note |
| 6 | Lock it in | The concept in one line | 20 words |
| 7 | Memory cue | Optional; only when it adds a handle Lock it in lacks | 12 words |
| 8 | Play with it | Link to the Ace Labs tool or visualizer state that shows it | one line |
| 9 | Watch | Optional subtopic video (hidden until a video id exists) | one line |
| 10 | Report | "Something off with this question?" opens the dispute form | one line |

Rules for the screen:

- The player assigns letters from the served order. Explainers and visual specs
  never cite a letter. Spec tags that must be marked use numbers ("line 1",
  "line 2"); letters on a picture only ever come from the served order.
- Each block adds something new. The caption says where to look in the picture,
  not the arithmetic again. The memory cue appears only when it adds a new
  handle. RC steps point to the highlighted proof line instead of quoting it a
  second time. A visual annotates the question's own figure (QR-1 outlines the
  Saturday and Sunday bars on the question chart after Check) instead of
  redrawing it.
- Phone, student view: the student's pick is shown in full; every other choice
  shows its trap label and the first sentence of its note, with one "Show every
  note in full" button. Coach and sign-off view: everything open, always.
- EXCEPT items: the heading reads "The other four"; when the pick is a choice
  the passage does support, the player adds one fixed line: "You found it in
  the passage, so on an EXCEPT question it is one to cross off."
- No scores, percentages or timers on the card. A full timed test shows the
  same explainers only in its review, after the test ends.
- Motion: none by default. A mechanism is a stepper the student moves through
  (Previous step / Next step); nothing plays by itself.
- The question side stays exam-pure: structure choices show structures only,
  PAT choices show the figure only. Names ("Br on the benzylic carbon") appear
  in the explainer, never on the question card.
- Display markup: sources stay plain ASCII, and the player typesets two marks
  at display time: `x^2`, `10^-5`, `[A^-]` (superscript) and `K_a` (subscript).
  This also typesets bank stems that already use `K_a`, without editing the bank.

---

## 2. The records (fields)

Each question has two records (section 5): a student sidecar (schema
`ace.explainer/1`, published) and a coach record (schema `ace.explainer-coach/1`,
never published). Bold fields are required.

### 2.1 Student sidecar

| Field | Type | Rule |
|---|---|---|
| **schema** | "ace.explainer/1" | |
| **qid** | string | Stable id, section 5.1 |
| servesAlso | [{qid}] | Only aliases whose status is active (section 5.4) |
| **bank** | {file, locator, keyText, stemHash, choiceTexts[]} | The guard. If the bank's key text, stem or choice set changes, the build marks the record stale and the player falls back to the bank's own `why` |
| **section** | bio, gc, ochem, qr, pat, rc | |
| **subtopic** | dotted id | Matches the lesson map, e.g. `bio.genetics.hardy-weinberg` |
| premises | [string] | Words the explainer relies on that must appear in every stem it serves (BIO-1: "recessive", "Hardy-Weinberg") |
| difficulty | {band 1-3, from} | Where the band came from |
| **answer** | {text, line} | text equals the key's choice text exactly; line is the one-line why |
| **steps** | [string], 1 to 4 | Step 1 opens with the move: an imperative verb from the list in 2.3, or "Here is" |
| **choices** | [{text, display?, role, family?, missType?, trap?, relation?, note}] | Keyed by exact choice text, never by letter or index. role: key, trap, or stated (EXCEPT items). family: required on every non-key choice, from the closed list in section 3; missType comes from the family. trap: optional display label in the coach's words, 2 to 5 words. display: required when the choice text is a SMILES string or a figure code (how the explainer names it). relation: for stereo choices, same / enantiomer / diastereomer, checked by RDKit |
| **lockIt** | string | The concept in one line, true on the next question of this kind |
| hook | string or null | Memory cue, only when it adds a new handle |
| **playWith** | {label, href, state} | label says only what the target does today |
| **video** | {slot, id, start} | slot equals the subtopic id; id and start null until Thomas records |
| **visual** | visual spec | Section 4 |

### 2.2 Coach record

| Field | Rule |
|---|---|
| qid, servedAs | As above |
| servesAlso | Every alias with relation, reviewed, status (active, needs-approval, held) and the reason when held |
| flags | [{kind, text}]: key-dispute, picture-dispute, stem-style, bank-copy, play-target, timer, tool-gap, renderer-gap, true-to-life, letter-cite, id-gap, note |
| review | {status, by, at, batch, checksum}: draft, approved, held, stale. checksum is taken at approval; any later edit returns the record to draft |
| routing | Whether the play-with link opens the exact state today, and what it shows (a clock, a score) if anything |
| gate | The build's checks, issues and warnings for this record |

### 2.3 Copy rules the build enforces (a failure blocks the batch)

- Plain ASCII, no em or en dashes, none of wrong / incorrect / failed (any
  case), no exclamation marks, no competitor names (list in the build script).
  Bank-sourced strings are exempt from the ASCII rule only, because they must
  equal the bank: `answer.text` and `choices[].text` (QR-2's key is
  "root 39" written with the radical sign in the bank).
- No choice letters: "option A", "choice B", "answer C", "fact A", "line B",
  "(D)"; and no single-letter A to E tags in a visual spec.
- Length budgets from section 1. Alt text 60 words at most, 1 to 3 sentences.
  Caption 25 words. Trap label 2 to 5 words.
- Every choice of the served item has a note; exactly one key note, matching
  `answer.text` and the bank's key text.
- Step 1 opens with one of: Here is, Read, Count, Start, Find, Name, Put, Work,
  Turn, Know, Protonate, Write, Look, Set, Undo, Draw, Rank, Add, Check, Trace,
  Spot, Flip, Split, Picture, Plug, List, Match, Locate, Chase, Join, Mark,
  Sort, Compare, Begin, Cross, Unfold, Open, Estimate, Convert, Balance,
  Identify, Assign, Follow, Ask, Use. The list grows only by an edit here.
- video.slot equals the subtopic.
- Text the renderers make up (axis titles, card lines, legends) is gated too,
  in the browser (section 7.1).

ASCII glossary (what to write instead of a glyph or a shorthand):

| Write | Not | Why |
|---|---|---|
| secondary, tertiary, primary | 2 deg, 3 degree | "deg" reads as an angle or a temperature, and screen readers say it that way |
| degrees, or deg only beside an angle | the degree sign | ASCII |
| root 39 | the radical sign | ASCII (bank text is exempt) |
| x (times), 1.8 x 10^-5 | the multiplication sign | ASCII, typeset at display |
| c^2, 10^-5, [A^-], K_a | Unicode super- and subscripts | typeset by the player |
| percent in prose; % only inside a number from the stem or a choice | % after a student's result | no percentages as grades |
| P(A given B) | P(A \| B) | readable aloud |

---

## 3. Trap families (the closed list)

Every non-key choice carries one family id from this list. The family fixes
the missType (Thomas's three kinds of miss: content, concept, misread) and is
what the Ace Log counts, so the same miss is counted the same way in every
section. The coach's own words go in the optional display label (`trap`),
shown first, with the family name beside it in a small tag. A new family is
added only by an edit to this section and to families.js, never in a record.

The list lives in code at question-system/pilot-scripts/families.js (to move
to the repo with the build script).

### 3.1 Shared families (all sections)

| id | Name | What the choice did | missType |
|---|---|---|---|
| other-question | Right number, other question | A true value for a quantity the stem did not ask for | misread |
| one-step-short | One step short | Stopped before the last step | concept |
| one-step-too-far | One step too far | Went past what was asked | misread |
| flipped-condition | Flipped the condition | Reversed given and asked: P(A given B) for P(B given A) | concept |
| reversed | Reversed | The science runs the other way: a direction, ranking, configuration or cause turned around | concept |
| read-backward | Read backward | The stem or passage read in the opposite direction: decreasing for increasing, the role of a finding swapped | misread |
| half-right | Half right | One true part, one part that does not hold | concept |
| close-second | Close second | A real candidate that loses to a stronger one (secondary against benzylic) | concept |
| neighbor-fact | Neighbor fact | True of a nearby structure, step, place or quantity, not this one | content |
| other-conditions | Other conditions | The outcome of a different reagent, setting or case | content |
| missed-exception | Smooth trend, missed exception | The general rule where the item tests the exception | content |
| other-unit | Counted the other unit | Formula units for particles, electrons for pairs | concept |
| unit-slip | Unit or decimal slip | Power of ten, unit or decimal place | misread |
| sign-slip | Sign slip | A minus sign lost or added | misread |
| operation-flip | Added instead of subtracted | The operation flipped | concept |
| assumed-equal | Assumed equal | Treated outcomes or groups as equal in size or weight when they are not | concept |
| looks-bigger | Looks bigger, is not | A visual size cue misread: arm length, bar height, scale | misread |
| miscount | Miscount | A count or tally slipped, with no single rule behind it | misread |

### 3.2 Reading comprehension families

The RC bank uses about 190 distractor labels, and 246 of its notes contain
"wrong". They fold into these families (a migration maps bank labels to
families in the generated sidecars; the RC bank itself is not edited):

| id | Name | Covers bank labels like | missType |
|---|---|---|---|
| read-backward (shared) | Read backward | Reversed, Reversed timing, Reverses the reason | misread |
| rc-outside | Outside the passage | Outside the passage, Not in the passage, Unsupported | misread |
| rc-contradicted | Contradicted | Contradicted, The passage says the opposite | misread |
| rc-other-paragraph | Different paragraph | Wrong paragraph, Wrong sentence, Wrong line | misread |
| rc-misplaced | Misplaced detail | Wrong detail, Wrong person, Wrong cell, Wrong number, Wrong date, and every other "Wrong (noun)" | misread |
| rc-too-strong | Too strong | Too strong, Too extreme, Too sweeping | misread |
| rc-too-weak | Too weak | Too weak, Too narrow | misread |
| rc-half-supported | Half supported | Half right, Mash-up | misread |
| rc-off-question | True but off-question | True but answers a different question, Irrelevant detail | misread |
| rc-tone | Tone mismatch | Wrong register, Too harsh, Too negative, Too positive | misread |
| rc-timeline | Timeline mix-up | Wrong timing, Wrong era, Anachronism, Wrong year | misread |
| rc-swapped-cause | Swapped cause | Wrong cause, Wrong mechanism, Reversed cause and effect | concept |
| rc-stated | True in the passage | (EXCEPT items) a choice the passage does support | n/a |

### 3.3 PAT families: one house-safe name per engine tag

For generated items the family is the engine's own tag for that option
(tools/pat/engine/pat-test.js TRAP_NAMES), so the results screen and the
explainer name a miss the same way. The build refuses a PAT record whose family
differs from the engine tag. Names that contained "wrong" or ran long are
replaced; the engine labels should change to match.

| Engine | Tag | Engine label now | Family name (use) | missType |
|---|---|---|---|---|
| keyholes | FILL / CARVE / LIMB | Dropped feature / Added notch / Impossible combination | same | misread / misread / concept |
| keyholes | SCALE | Wrong proportions | Proportions off | misread |
| keyholes | ISLAND / MIRROR / FOREIGN | Floating island / Near-mirror / Different object | same | concept / misread / misread |
| keyholes | SIZE | Right shape, wrong size | Right shape, other size | misread |
| keyholes | CURVE | Curve and slant swapped | same | misread |
| tfe | mirror | Front and back (or left and right) swapped | Front and back swapped | misread |
| tfe | dash-as-solid / solid-as-dash | Hidden edge drawn solid / Visible edge drawn dashed | same | concept |
| tfe | profile | A step in the wrong place | A step out of place | misread |
| tfe | feature / dropped | A feature changed (shape, size or place) / A feature left out | A feature changed / same | misread |
| angles | swap / double | Swapped a close pair / Swapped two pairs | same | misread |
| angles | shift | Misplaced one angle by two spots | One angle two spots off | misread |
| holepunch | missed-unfold | Skipped one unfold | same | concept |
| holepunch | wrong-line | Mirrored across the wrong line | Mirrored across the other crease | concept |
| holepunch | flipped / shifted / dropped | Read the sheet flipped / One hole off by a cell / One hole missing | same | misread |
| cubes | (none today) | | Proposed tags: hidden-faces "Skipped hidden faces", bottom "Painted the bottom", hidden-cubes "Skipped hidden cubes" (concept); a count with no single rule uses the shared miscount | concept |
| patternfold | mirror / neighbor | Mirror image cube / Two faces traded places | same | misread |
| patternfold | rotation | A face turned the wrong way | A face turned | misread |
| patternfold | opposite | Opposite faces shown side by side | Opposite faces side by side | concept |
| patternfold | shade | Shading on the wrong face | Shading on another face | misread |
| patternfold | hidden | A face from the far side shown | A far-side face shown | concept |

---

## 4. The visual

### 4.1 The rule

Every explainer gets one visual, described by a declarative JSON spec. A
renderer turns the spec into SVG (or, for true-to-life views and PAT, the
engine's own SVG). The spec carries the facts (values, SMILES, seeds, passage
spans), never pixels, so a key check can run on the spec and the picture stays
true to the item.

- At most two panels (`stack`). A panel may not hold sub-panels; a multi-step
  mechanism is one panel shown as a stepper on phones.
- Every word a renderer adds is built from the spec or the item, never a fixed
  claim. (Version 1's stereo card printed "in back" and "runs clockwise" on every
  center; PAT-3's renderer printed "1" and "hidden cube outlined" whatever the
  item.) Stereo cards are read off the drawing itself (4.4).
- The key's place is marked by an outline or a word label as well as color,
  never color alone. Lines in a fan or a legend carry numbers or names.
- Ranking and ordering items show the key's order in the picture (GC-2 puts rank
  numbers 1 to 5 under the elements).
- Labels never sit under a stroke: a label that has to cross a line gets a white
  halo (paint-order stroke), and comparison or ghost elements are drawn above
  fills, not under them.
- The alt text describes this drawing, in 1 to 3 sentences; the sign-off checks
  that it matches (section 7.2, check 4).

Common fields on every spec:

| Field | Rule |
|---|---|
| **type** | From the catalog in 4.2 |
| **alt** | 1 to 3 sentences, 60 words at most: what the picture shows and what it proves |
| **caption** | One line in Thomas's voice, 25 words at most, saying where to look |
| focus | What is highlighted (the key's place in the picture) |
| annotateQuestion | Optional: marks to add to the question's own figure after Check (QR-1: {highlight: [Sat, Sun]}) |
| reuse | The repo renderer it uses, or "new" |
| dataRef | Repo data it reads (trends-data.json, lewis-molecules.json, a 2026 figure) |

### 4.2 Catalog

| type | Required fields | Renderer (reuse first) | Pilot |
|---|---|---|---|
| `bio.real` | view, params | **Reuse** BioReal views (tools/bio/bio-real.js, bio-bone.js). Thomas signs off every true-to-life view | BIO-2 |
| `bio.diagram` | diagram, labels[], focus, extras[] | **New** schematic library (organelle cutaways, membrane, nephron, heart), numbered markers plus an HTML legend | BIO-3 |
| `bio.hardy-weinberg`, `bio.punnett`, `bio.pedigree` | q2 or p; cross; pedigree spec as in PEDIGREE_PUZZLES[].spec | **Port** of the bio-shared.js visualizers (they are DOM-bound; the live widget is the play-with target, the explainer uses a pure render(state) port) | BIO-1 |
| `bio.osmolarity` | solute, inside, units | **New** tally | BIO-2 |
| `chem.molecule` | smi, marks[] or centers[] | **Reuse** SmilesDrawer via a light-theme copy of tools/ochem/tree/draw.js; stereo cards derived from the drawing (4.4) | OC-3 |
| `chem.reaction` | reactants[], reagent, products[], marks[] | Same as chem.molecule | OC-1 |
| `chem.mechanism` | a 2026 item id or species + arrows; showProduct; stepper | **Reuse** drawFigure / drawChain in tools/ochem/tree/mechdraw.js (RDKit-proven arrows), product panel off when a choice card already shows it | OC-2 |
| `chem.energy` | points[], names | **Reuse** drawRcd in mechdraw.js, labels lifted to 12 px and set in the panel's sans font | OC-2 |
| `chem.lewis` | lewis-molecules.json record shape plus ledger, layoutAngles, spreadTerminalPairs | **Copy** of the Lewis sandbox layout functions | GC-1 |
| `chem.trend` | property, series[], highlight[], rank[], dips[] | **New** plot on tools/gc/trends-data.json | GC-2 |
| `chem.curve` | kind (titration, heating, phase, rate), parameters, marks[] | **New** plotter; curves computed from the parameters, so marks land on the true curve | GC-3 |
| `chem.ledger` | quantities and unit factors | **New** (stoichiometry, gas laws, dilutions: a dimensional-analysis chain) | later |
| `qr.figure` | qr-figures spec, highlight[] | **Reuse** shared/qr-figures.js plus highlightBars (add a `highlight` option to qr-figures.js) | QR-1 (question figure) |
| `qr.partwhole` | total, parts[], rest, style (grid or strip), bracket | **New** | QR-1 |
| `qr.triangle`, `qr.tree`, `qr.numberline`, `qr.work` | to-scale geometry; tree with counts and branch rates, numerator and denominator roles | **New**, about 60 to 120 lines each | QR-2, QR-3 |
| `pat.angles` | item ref, view | **Reuse** PAT engine panelSVG; equal-arm fan with numbered arms is new | PAT-1 |
| `pat.unfold` | item ref | **Reuse** holepunch geometry; the unfold strip is new | PAT-2 |
| `pat.cubes` | item ref, view (floor cutaway, layers) | **Reuse** figureSVG on the floors up to the answer cubes, painted(); floor maps with screen-direction cues are new | PAT-3 |
| `pat.keyhole`, `pat.tfe`, `pat.fold` | item ref | **Reuse** keyholes, tfe and patternfold truth views | later |
| `rc.evidence` | passage id, spans[{p, s, quote, role, choice or numeric tag}], link | **New**, styled like the highlighter in tools/rc/rc.js | RC-1, RC-2, RC-3 |
| `stack` | panels[2] | Two specs, one above the other | BIO-2, OC-2 |

PAT and the OChem Tree are procedural, so their explainers and visuals are
templates filled from the engine's own item data, not hand-written per item.
The pilot's three PAT entries are the models for those templates.

### 4.3 Size, height and accessibility budgets

- Drawn at the width it is shown: legible at 358 px (a 390 px phone less two
  16 px gutters). Text in the picture is 12 px or larger at that width. A known
  exception carries a flag and a `smallTextKnown` note in its spec (pilot: the
  BioReal red-cell labels, fix in tools/bio/bio-real.js).
- Height: each panel at most about 560 px tall on a 390 px phone, so the steps
  start within a screen of the picture. Mechanisms page as a stepper; PAT
  truth panels sit four across.
- Stored size: the spec stays under 4 KB; a cached pre-rendered SVG under 40 KB
  (60 KB for a true-to-life view). SMILES pictures are drawn in the browser.
- Every SVG gets role="img" and an aria-label from `alt`. Colors pass contrast
  on the white explainer panel. Arrowheads are sized in user units so they never
  cover a label.
- No animation by default; respects prefers-reduced-motion.

### 4.4 Stereochemistry pictures

- A stereocenter card is read off the drawing the student sees: which groups sit
  on a wedge or a dash, where H is, the 1 to 2 to 3 turn, and the flips. Two
  independent readings must agree with each other and with RDKit's label for
  the SMILES: the student method (get H onto the wedge or dash, swapping it with
  the group there when it lies flat; trace; flip once if H points at you and
  once per swap) and the signed volume of the drawn tetrahedron. A mismatch is a
  build error, never a silent card.
- Method taught to students: the swap. It works on any drawing. The shortcut "H
  flat: a dash elsewhere means flip, a wedge means read" fails on some correct
  drawings (calibration, section 10) and is not taught.
- SmilesDrawer 2.4.2 draws the mirror image of the SMILES at some stereocenters
  (50 of 275 centers in the banks with its default settings; section 8.2). Every
  stereo picture a student sees, in a stem, a choice or an explainer, passes the
  drawn-configuration gate before it ships.

---

## 5. Storage and lookup

### 5.1 Stable question ids

A qid is `<bank>:<id inside that bank>`, using the bank's own id where it has
one and a position where it does not:

| Bank | qid form | Example |
|---|---|---|
| Full-length mocks (tools/mock/data/full-mocks.js) | `fm:<item id>` | fm:bio:BIO_g011 |
| Mock pool and its copies (scripts/dat-mock-bank.json, games/*.json) | `pool:<id>` | pool:QR_pco1554 |
| Prometric forms (shared/dat-mock-tests.js), as served | `pm:<form>:<section>:<n>` (aliases of pool ids) | pm:MOCK_2:qr:20 |
| The Climb (tools/minitests/bank.js) | `climb:t<test>:q<question>` until the source JSON gets ids | climb:t9:q13 |
| QR formats (shared/qr-formats-bank.js) | `qrf:<id>` | qrf:di-023 |
| RC (tools/rc/data/bank.js) | `rc:<id>` | rc:rc-o15-q01 |
| PAT engine | `pat:<test seed>:<n>`, canonical `{gen, seed}` | pat:F20261001:37 |
| Engine banks inside pages (QR, GC, OChem) | `qre:<id>`, `gce:<id>`, `oce:<id>` | qre:pco1554 |
| OChem 1000 bank (games/ochem-bank-1000.js) | `odb:<index>` until it gets ids | odb:412 |
| OChem 2026 set | `o26:<id>` | o26:ch-07 |

### 5.2 Files

```
content/explainers/                       published (student)
  index.json                              qid and every ACTIVE alias -> file, status, checksum
  bio/genetics/fm__bio__BIO_g011.json     student sidecar: no flags, no review, no routing, no gate
  ...
content/videos/index.json                 slot -> {id, title, duration, questions}
docs/explainers/                          coach only; /docs/* is force-redirected on the live site
  coach/fm__bio__BIO_g011.json            flags, review, routing, alias status, gate results
  index.json                              qid -> coach file, flag kinds, held aliases
  key-disputes.json                       open key disputes
  picture-disputes.json                   pictures that contradict their key (section 8.2)
```

File names replace ":" with "__". The acelabs netlify.toml publishes the repo
root and force-redirects /docs/*, so coach data and disputes never reach a
student. The build refuses to write a published sidecar that holds `flags`,
`review`, `routing` or `gate`.

### 5.3 How the player finds an explainer

1. On load the player fetches `content/explainers/index.json` for the section
   (about 60 bytes per entry).
2. When the student presses Check, the player looks up the served item's qid
   (or the alias), fetches the sidecar, and runs the guard: key text, stem hash
   and choice texts must match what is on screen.
3. Guard passes and status is approved: show the explainer. Otherwise show the
   bank's own `why` exactly as today, and log the qid so the gap list grows
   from real use.
4. Letters come from the served order; choice notes are matched by text.
5. The video slot resolves through content/videos/index.json; an empty slot
   hides the Watch line.

### 5.4 Aliases

One explainer can serve exact copies and rewrites of the same problem
(servesAlso). An alias is active only when its key matches, every one of its
choice texts has a note, Thomas has approved the relation (reviewed), and every
premise in `premises` appears in its stem. Otherwise it is needs-approval or
held, stays out of the published index, and the coach record says why. Version
1 would have served BIO-1's explainer, which says "a recessive disorder", on
the pool stem "1 in 10,000 affected. Allele frequency q = ?", which never says
recessive; that alias is now held.

Banks, answer keys and the existing `why` fields are never edited by this
system.

---

## 6. Video slots

- One video per subtopic, 60 to 120 seconds, a voice-over screen recording of
  the same Ace Labs visual the explainer shows (decisions doc, "Videos";
  video-plan.md has the evidence and the first 20 scripts).
- `video.slot` equals the subtopic id; content/videos/index.json maps a slot to
  a video id, title, duration and optional start offsets, so one recording
  serves every question in the subtopic and a question can start the video at
  its moment (`start` in seconds).
- About 180 slots for the full bank, one per subtopic in the lesson map.

---

## 7. Sign-off and gates

A production batch is about 25 items from one bank and section, grouped by
subtopic (production-plan.md). Thomas signs a batch off in two sittings of
about 12 items, about 10 minutes each, matching the decisions doc's 10-minute
checklist. The build and an independent expert run first, so Thomas only judges
what neither can.

### 7.1 Automatic gates (the batch does not reach Thomas until all pass)

Build gates (node):

- Key text, stem hash and every choice text match the bank; every alias is
  checked for key, choices and premises.
- Copy rules (2.3) on every string, including every string in the visual spec;
  no letter tags in specs; budgets; step-1 verb; video.slot equals subtopic.
- Every non-key choice has a family from the closed list; PAT families equal
  the engine tag; RC stated choices use rc-stated.
- Recomputation: trend values from trends-data.json; titration marks on the
  charge-balance curve; Law of Cosines and Bayes counts (tree counts must follow
  the branch rates and be whole people); PAT answers from the engine; PAT cube
  slip counts behind each trap note; RC quotes verbatim and key spans among the
  bank's proof lines; every SMILES parses in RDKit; CIP labels; stereo relations
  (same, enantiomer, diastereomer, meso) of every stereo choice, and every
  relation word in a note matches.
- Stem-style hits (shorthand under 8 words, "| " or "= ?" notation, raw
  underscores, capitalized emphasis outside EXCEPT / NOT / LEAST, a hint or the
  principle stated in the stem, fewer or more than 5 choices outside PAT)
  require a stem-style flag. The rewording is suggested, never applied.
- Play-with targets: the file exists; every string in `playWith.expect` appears
  in the target page or its scripts (the label promises only what the target
  has); any timer, clock, pace bar, score headline or streak on the target is
  acknowledged in a flag or the routing note.
- Published sidecars hold no coach data.

Render gates (browser, 390 x 844 and 1280 x 800):

- No console errors, no visual errors, no sideways scroll.
- All explainer text as rendered, including renderer-made text, passes the copy
  rules (bank text excepted).
- Text in pictures is 12 px or larger (flagged exceptions only).
- No label collides with another label, or sits under a line, polyline or
  ellipse stroke unless it has a halo or a filled backing drawn over the stroke.
- Each panel at most about 600 px tall on the phone (target 560).
- Stereo cards: the drawn-configuration reading agrees with RDKit (4.4).

### 7.2 Thomas's checklist, per explainer (about 50 seconds each)

| Check | Look at | Pass when |
|---|---|---|
| 1. Key | The answer block, and the expert's re-solve | The key is right. If not, press Dispute, never edit |
| 2. First move | Step 1 | It is the move you would say first |
| 3. Traps | Labels and families | Each label is fair, says why the choice pulls, and sits in the right family |
| 4. Picture | Visual, caption and alt text | It shows the truth, marks the key's place, and the alt describes this drawing |
| 5. Voice | Read the answer line and Lock it in aloud | It sounds like you, and nothing in it is a grade or a timer |

The review page (preview/index.html with &coach=1 shows the model) puts these
five boxes next to each card with Approve, Hold and Dispute key, plus the
families, flags, gate results and the bank's own explanation. Approve stamps
`review` with a checksum; Hold takes a one-line note back to the writer.

---

## 8. Key disputes and picture disputes

### 8.1 Keys

- A writer or the expert who doubts a key adds a `key-dispute` flag and a line
  to docs/explainers/key-disputes.json: qid, served key text, the suspected key,
  the reasoning, status open.
- The explainer for a disputed item is held until Thomas rules. The bank key is
  changed only by Thomas, in the bank, in its own commit.
- The pilot and the three expert re-solves found no key they believe is off.

### 8.2 Pictures that contradict their key

- Same process, file docs/explainers/picture-disputes.json, flag kind
  `picture-dispute`. The key may be right while the served picture shows
  something else, most often a stereocenter drawn as its mirror image.
- Found while building the stereo gate (production-plan.md, section 7): with
  SmilesDrawer's default settings, 18 structure drawings across 6 full-mock
  OChem items, and 44 molecules on 22 items in games/ochem-bank-1000.js, show
  the opposite configuration from their SMILES. In FULL_2 OChem 1 and FULL_4 OChem 9 the
  keyed product is drawn as its mirror image while the stem is drawn right, so
  a student who reasons correctly from the pictures picks the retention picture
  and is marked as a miss. Keys unchanged; listed for Thomas.

---

## 9. Rollout

See production-plan.md: the single DAT-style player, the sidecar build, the
batch order (full mocks and diagnostics first), the expert verification
protocol and the npm test gates.

---

## 10. What the pilot taught (renderer rules)

From screenshots of all 18 previews at 390 x 844 and 1280 x 800, and from the
expert review:

- Draw at the box's real width; read the host width and lay out for it
  (side by side at 560 px and up, stacked below).
- Reused renderers need a size check. mechdraw.js drawRcd labels come out at
  8 px on a phone (the player lifts them to 12 px and sets them in sans);
  BioReal.tonicity() labels draw at about 9 px (fix in tools/bio/bio-real.js).
- SmilesDrawer's own viewBox can be the whole 400 x 300 canvas; fit the box to
  the drawn atoms, then the labels, and give all structure choices one scale.
- SmilesDrawer stereo: its wedges come from `edge.wedge` ("up" solid, "down"
  hashed, narrow end at the stereocenter). Calibrated against RDKit reading the
  same 2D drawing, the signed-volume reader matched on all 25 true R/S centers
  of a 20-molecule set, and the swap method matched the volume on all of them;
  the "H flat: the other bond decides" shortcut did not. SmilesDrawer itself drew
  6 of those 20 molecules as the mirror image of their SMILES.
- With explicit hydrogens on, SmilesDrawer adds H vertices, so a mark's atom
  index counts heavy atoms only. draw.js's geometry export needs one more field,
  the bond wedge (a one-line change, proposed for the repo).
- shared/qr-figures.js re-renders (hydrates) a chart after layout, so an
  annotation must be re-applied when the drawing is replaced.
- Comparison shapes (QR-2's 90 and 120 degree sides) go on top of fills, or the
  comparison disappears; labels that must cross a line get a white halo.
- The Lewis sandbox's pyramid puts one ligand straight up; a lone-pair question
  sets `layoutAngles` so the pair sits on top, and terminal-atom pairs are spread
  evenly away from the bond.
- A cube hidden behind others has the same isometric outline as an empty slot
  one floor up and one step forward; show the floors up to the answer cube on
  their own instead of an x-ray outline.
- Arrowheads in user units (about 9 px), so a marker never covers a label.

---

## 11. Files

- question-system/voice-codex.md: the voice reference (draft for docs/thomas-voice-codex.md).
- question-system/pilot.json: 18 records (student sidecar fields, coach fields,
  served question copy, gate results).
- question-system/pilot-scripts/pilot-src.js: the hand-written explainers (v3).
- question-system/pilot-scripts/families.js: the closed trap-family list.
- question-system/pilot-scripts/build-pilot.js: the build gates and outputs.
- question-system/pilot-scripts/shoot.js: screenshots plus the render gates
  (needs the preview served on 127.0.0.1:4317); writes preview/render-gate.json.
- question-system/pilot-scripts/stereo-cal.py, drawn-cip.py, geom-run.js and
  preview/tests/stereo-cal.html, geom.html: the stereo reader calibration.
- question-system/production-scripts/: the bank-wide stereo audit and the batch
  planner; question-system/picture-disputes.json and batches.json are their
  outputs, and preview/render-gate.json holds the last render-gate run (42 of 42
  screenshots pass).
- question-system/preview/: the DAT-style preview; ?q=BIO-1 for a question,
  &coach=1 for the sign-off panel, &state=fresh for an unanswered question.
- question-system/preview/sidecars/content/ (published layout) and
  preview/sidecars/docs/ (coach layout), generated.

---

## 12. What changed from version 1 (expert review)

| # | Verified problem | Where | Fix |
|---|---|---|---|
| 1 | Coach data (flags, review, disputes) in the published folder | Standard 5.2 | Student sidecar and coach record split; coach files under docs/ (force-redirected); build refuses leaks |
| 2 | Trap names coined freely (64 names, 11 shared); missType drift | Standard 3 | Closed family list with fixed missType; label optional; build gate; PAT family equals engine tag |
| 3 | Step-1 rule not enforced (OC-3, GC-3, QR-1, QR-2) | Build | Hard gate with a verb list; all 18 open with a move |
| 4 | Alt gate at 70 words, sentences not counted (PAT-2 passed at 61 words, 5 sentences) | Build | 60 words, 1 to 3 sentences |
| 5 | Letter check missed spec tags and "fact A" (RC-3) | Build | Extended regex; spec tags must be numbers |
| 6 | Renderer-made text not gated (OC-3 cards, PAT-3 label) | Renderers, shoot.js | Text derived from data; rendered-text gate in the browser |
| 7 | Stereo relation claims unchecked (OC-3 "this is the enantiomer") | Build, rdkit-check.py | RDKit relations per choice; note words must match |
| 8 | Alias premises unchecked (BIO-1 pool stem omits recessive) | Build, 5.4 | premises field; alias held |
| 9 | Play-with label promised what the target cannot do (QR-3); targets with timers called "Works today" | Build | `expect` strings checked in the target; timer and score markers must be acknowledged |
| 10 | Draw order and label collisions not checked (QR-2, GC-2) | shoot.js | Collision and stroke-crossing gate; halos; ghosts drawn on top |
| 11 | Phone depth and repetition | Standard 1, 4.3 | Each block adds something new; compact student traps; hooks dropped where they repeat; height cap; stepper |
| 12 | Stem style not systematic (GC-2 hint, GC-3 underscore and stated principle, QR-1 "the week") | Build, 7.1 | Stem-style heuristics require a flag; suggested rewording only |
| 13 | ASCII rule vs bank key text; ASCII math hard to read | Standard 2.3, 1 | Bank-sourced strings exempt; display markup; glossary |
| 14 | Ordering keys not visible in the picture (GC-2) | Standard 4.1 | Rank annotations |
| 15 | Video slots differed from subtopics (BIO-3, OC-1, GC-1, GC-3, PAT-3, RC) | Build | slot equals subtopic |
| 16 | Schema gaps: no label for figure choices; stated choices forced a missType | Standard 2.1, 3.2 | `display` field; rc-stated family with missType n/a |
| 17 | "2 deg", "3 degree" | Glossary | Words |
| 18 | Voice codex pointed to the wrong section for trap names | voice-codex.md | Pointer fixed |

Item-level fixes (all 18 entries) are listed in pilot.json under each entry's
`changes` field.
