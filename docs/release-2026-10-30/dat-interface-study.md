# The real DAT testing interface, and how Ace Labs' mocks compare

Internal research note for Thomas. Not student-facing copy: it cites third-party
prep sites by URL, so do not paste it into the repo as-is (the competitor-name
gate would trip on the links).

Written 2026-10-30. Pages checked: `prometric-mock.html` and `tools/mock/full.html`
(+ `full.js`, `full.css`). Both were run in Chromium (Playwright) at
http://127.0.0.1:4000/ at 1366x768 and 390x844. Screenshots are in
`/tmp/claude-0/-home-user/d13d0ec6-4383-5048-8c7c-ddae9950f2ae/scratchpad/question-system/work/shots/`.
Bank statistics came from loading `shared/dat-mock-tests.js`,
`tools/mock/data/full-mocks.js` and `tools/rc/data/bank.js` in a node vm.

---

## 0. How sure is each claim, and what I could not reach

The sandbox could not open www.ada.org, www.prometric.com, seattleu.edu,
studentdoctor.net, scribd.com or any other site directly. Every direct fetch
failed with a DNS or proxy refusal. So I never saw the ADA Candidate Guide
PDF, the ADA tutorial, the Prometric test driver or any screenshot. All
public-source claims below come from web-search result excerpts of those
pages. Each claim carries a tag:

| Tag | Meaning |
|---|---|
| [ADA] | Wording from an ADA document (Candidate Guide, Sample Test Items), seen as a search excerpt |
| [Prometric] | A Prometric tutorial: an old DAT tutorial copy, or the same driver on another exam |
| [Prep] | A test-prep company's public guide |
| [Forum] | A test-taker's account on a public forum, usually dated and anecdotal |
| [Unverified] | No source I could reach says it. Treat as a question, not a fact |

To settle the open items, someone needs to walk the free online DAT tutorial
on the ADA DAT page. A secondary source says it opens with a DENTPIN as the
keycode. Section 7 has a checklist for that walk.

Fonts and colors: no public source I could reach describes the real DAT
screen's fonts, colors, button shapes or sizes. Nothing in this note claims
them. The CSS comments in `prometric-mock.html` say it mirrors "the official ADA
Prometric demo" (deep teal bars, italic small-caps buttons), and that its
calculator and periodic table match images in the ADA 2026 Candidate Guide
(pages 9 and 5). I could not check either claim.

---

## 1. Test day structure (the real DAT)

| Segment | Items | Time | Notes |
|---|---|---|---|
| Optional tutorial | - | up to 15 min | Before the test. Skipping it shortens the day [ADA, Prep] |
| Survey of the Natural Sciences | 100 (Bio 1-40, GC 41-70, OC 71-100) | 90 min | One section and one clock. The three subjects are always in this order [ADA, Prep] |
| Perceptual Ability Test (PAT) | 90 (six subtests of 15) | 60 min | One section and one clock [ADA, Prep] |
| Optional scheduled break | - | up to 30 min | After PAT, before RC. "If a candidate chooses to take this scheduled break, the testing session will resume automatically after 30 minutes have elapsed." [ADA] |
| Reading Comprehension | 50 (3 passages, about 16-17 each) | 60 min | [ADA, Prep] |
| Quantitative Reasoning | 40 | 45 min | Calculator available in this section only [ADA] |
| Optional post-test survey | - | up to 15 min | [ADA, Prep] |

- Total: 280 scored items, 4 h 15 min of testing, about 5 h 15 min with every optional part [ADA, Prep].
- Unscheduled breaks: any break outside the scheduled one counts as unscheduled. The clock keeps running, and you cannot reach your belongings [ADA, Prep].
- Once a section ends you cannot go back to it [Prometric, Forum].
- Scoring: since March 1, 2025, scores are on a 200-600 scale in 10-point steps. Test centers no longer print an unofficial score report; official scores arrive in about 3-4 weeks [Prep, ADEA FAQ]. Content and format stayed the same.
- OChem content: the ADA posted new Organic Chemistry specifications, expected from April 2026 [ADA page via search excerpt]. Both mocks already claim to follow it.
- Noteboard: two laminated sheets (four writing surfaces) and fine-point wet-erase markers. You can ask for fresh ones during the test, and you keep them through every section, PAT included [Prep, Forum]. During the 2020-21 pandemic some centers handed out paper and pencils instead [Prep, Forum].
- Older material shows different numbers: a 15-minute break, a 30-minute tutorial, a 4 h 30 min total. That describes an earlier format. Ignore it [Forum, old Scribd copies].

## 2. Screen layout and navigation (the real DAT)

What public material supports:

- **Time display, upper right.** A "Time remaining" countdown for the current section [Prometric: DAT tutorial copy; the USPTO tutorial on prometric.com: "Notice the 'Time remaining' box in the upper right corner ... A similar display will appear during the actual exam"]. A prep company also mentions "a countdown timer in the corner of the screen" [Prep].
- **Question position, upper left.** The old DAT tutorial describes "a box in the upper left that shows your position in the question series" [Prometric]. The exact wording ("Question 12 of 100" or "12 of 100") is [Unverified]. "Question x of y" is the common Prometric form.
- **Title bar text.** Whether it shows "Dental Admission Test", the section name or both is [Unverified].
- **Buttons at the bottom of the screen** [Prometric: "Buttons appear at the bottom of the screen. To move backwards click the Previous button. To move forwards click the Next button."]:
  - **Previous** and **Next** move one question back or forward.
  - **Mark**: "If you are unsure of your answer, you can mark the question to review if time permits. To mark a question click the Mark button." [Prometric]
  - **Review** opens the Review screen. Forum accounts disagree: one says Review is reachable from any question [Forum], another that it appears only after the last question [Forum]. Clicking Next on the last question always leads to the Review screen [Forum, Prometric].
  - **Exhibit** opens the periodic table in the Survey of the Natural Sciences [ADA Sample Test Items: "will be available as an Exhibit button on the actual DAT"].
  - **Calculator**: "a basic calculator will be available as a pop-up image for the Quantitative Reasoning Test only" [ADA Sample Test Items]. Where its button sits is [Unverified].
  - **End**: ending happens from the Review screen. On the same driver for other exams, "End Review" or "End Section" ends the review and the section, with a yes/no confirmation [Prometric: USPTO, PTC tutorials]. Whether the DAT also puts an End button on every question screen is [Unverified].
- **Keyboard shortcuts** (Alt + the underlined letter) are [Unverified] for the DAT. A Prometric document for another exam says "certain short-cut keys will be disabled".
- **Navigation inside a section is free.** Previous works across subtest boundaries in the PAT, the Review screen jumps anywhere, and you can change any answer until the section ends [Forum, Prometric].
- **Unanswered items are scored as not correct.** There is no penalty for a guess, so leave nothing blank [Prometric: "Any questions that are incomplete will be marked as incorrect"].

### The Review screen

- It lists every question number in the section with its status: marked, answered ("complete"), or skipped/incomplete [Prometric DAT tutorial copy; Forum: "will display each question and whether you answered it, left it incomplete, or marked it"].
- Buttons: **Review Marked** and **Review Incomplete** [Forum, Prometric], usually with **Review All** [Prep: "review all questions, unanswered questions, or marked questions"]. Review Incomplete "moves you to the first incomplete question" [Prometric]. In that mode Next steps to the next marked or incomplete item, not the next number [Forum].
- You can also click a single question number to go to it [Forum: some say yes, one says no]. Treat this as [Unverified].
- The exact labels vary by source ("Incomplete", "Unanswered", "Skipped"). Settle them in the tutorial walk.

### Answer choices

- One best answer per item, in lettered choices, chosen by clicking the choice or its round (radio-style) button [Prometric].
- Number of choices: "five possible answer options for each question (with the exception of certain PAT question types with only four)" [Prep, an older study guide]. For the PAT, the item types settle it:
  - Keyholes (apertures): 5 openings, A-E [Prep]
  - Top-front-end (view recognition): "two views will be given, with four alternatives" [Prep quoting the ADA instructions]
  - Angle ranking: 4 orderings [Prep]
  - Hole punching (paper folding): 5 [Prep]
  - Cube counting: 5 (A = 1 cube ... E = 5 cubes) [Prep]
  - Pattern folding (3D form development): 4 [Prep]
- The current natural-science and QR choice count is [Unverified]. All sources say five, but none is recent and official.

### Tools

- **Highlight:** several sources say the real exam has a highlighter. You select text, then click a highlight button [Forum: "click-and-drag over text brings up the highlight button"; Prep: highlighting works on the real exam but cannot be tried in the tutorial]. Older forum posts (around 2017) say highlighting first worked only on the passage. Whether it works in every section or only in RC, and whether highlights persist from question to question, is [Unverified].
- **Strikethrough / cross-out:** newer forum accounts say right-clicking a choice toggles a strike-through [Forum]. Older accounts (around 2012) say the screen had no cross-out and students used the noteboard [Forum]. The tutorial reportedly mentions highlighting and crossing out without demonstrating them [Forum]. Treat right-click cross-out as likely but [Unverified].
- **Periodic table (Exhibit):** the 2026 Candidate Guide prints the exact image and says it is "available to candidates as they complete the General Chemistry section" [ADA]. The ADA does not say whether it stays available on Biology and OChem items in the same section [Prep]. Whether the image includes a constants line (Avogadro, R, F, h, c) is [Unverified].
- **No other reference material** exists in the sciences: no reagent table, no formula sheet, no equation sheet [Prep].
- **Calculator (QR only):** a basic pop-up calculator. The ADA guide shows an image of it [ADA]. The code comments in `prometric-mock.html` describe that image as a classic Windows-7-style "calc.exe" with a View/Edit/Help menu, MC MR MS M+ M-, Backspace CE C +/- sqrt, % and 1/x [Unverified, in-repo claim]. Prep sources list add, subtract, multiply, divide, square root, percent and reciprocal [Prep]. One says "you can't input to the calculator by typing", so every key must be clicked [Prep]. It does no scientific or graphing work [Prep].
- **Scrolling:** long content scrolls with a scroll bar. Arrows move a little at a time, and clicking the track moves a screen [Prometric].

## 3. Section by section (the real DAT)

**Survey of the Natural Sciences.** One 100-item block on one 90-minute clock: Bio 1-40, GC 41-70, OC 71-100. Exhibit gives the periodic table, at least during GC. No calculator. Whether each item carries a "Biology" or "General Chemistry" label is [Unverified]. No public description mentions one.

**Perceptual Ability Test.** One 90-item block on one 60-minute clock, six 15-item subtests in a fixed order: keyholes, top-front-end, angle ranking, hole punching, cube counting, pattern folding [ADA, Prep]. No calculator, no exhibit. Previous crosses subtest boundaries [Forum]. Whether each subtest opens with its own directions screen, and whether that screen is timed, is [Unverified]. In cube counting, one figure serves several consecutive items. The official instructions describe counting cubes with one, two, three, four or five painted sides; this is from memory of the published directions, so treat it as [Unverified].

**Reading Comprehension.** Three science passages, 50 items, 60 minutes, about 20 minutes per passage [ADA, Prep]. The passage and the current question are on screen together, and the passage scrolls [Forum, Prometric]. One account says the passage's scroll position resets when you move to the next question [Forum]. Another says the question area took about 3/4 of the screen [Forum]. Side by side versus top and bottom, numbered paragraphs, and a passage title are all [Unverified]. Highlighting is available on the real exam [Prep, Forum]. There is no text search.

**Quantitative Reasoning.** 40 items, 45 minutes, pop-up calculator [ADA]. Prep sources describe mostly word problems in algebra, data analysis, probability and statistics, geometry and trigonometry, and applied math [Prep].

**Tutorial, break, survey.** The tutorial (up to 15 min) teaches the buttons and lets you try each feature before scored questions [Prometric]. The break is optional, up to 30 minutes, after PAT, and the session resumes on its own when 30 minutes pass [ADA]. The survey (up to 15 min) comes at the end [ADA]. Outside test day, students can use the online DAT tutorial from the ADA DAT page [Prep], Prometric's paid "Test Drive" (a 30-minute run-through at a center) [Prep], and the ADA's official online practice test (sold by module; reviewers say it reports only a count correct and has little exam-like review) [Prep].

---

## 4. Side-by-side: real DAT vs Ace Labs

Status key: **Match** = same as the real test, **Partial** = close but different, **Gap** = the real test has it and we do not, **Extra** = we show it and the real test does not, **n/a** = section not in that mock.

| Element | Real DAT | prometric-mock.html | tools/mock/full.html |
|---|---|---|---|
| Sections covered | SNS, PAT, break, RC, QR | SNS + QR only; break placed between them | All four in test-day order, break after PAT: **Match** |
| Item counts and times | 100/90, 90/60, 50/60, 40/45 | SNS and QR correct | All correct: **Match** |
| Optional tutorial | Up to 15 min, before section 1 | None: **Gap** | None (a text intro per section): **Gap** |
| Break | Optional 30 min, auto-resumes | 30 min, auto-starts QR, but in the wrong place: **Partial** | 30 min, then an RC intro that waits for a click: **Partial** |
| Post-test survey | Optional 15 min | None (fine to omit) | None (fine to omit) |
| Time display | "Time remaining", upper right | "Time remaining: 1:30:00", upper right; pulses under 5 min: **Match + Extra pulse** | "Time remaining", upper right; turns yellow under 5 min: **Match** |
| Question position | Upper left | "Question 1 of 100", upper left: **Match** | "Question 1 of 100" + section name, upper left: **Match** |
| Header center | [Unverified] | "AceTheDAT.com / Practice Test 1": **Extra** | "AceTheDAT.com / Full-Length Test 1": **Extra** |
| Exit (X) and settings (gear) | Not described | X (exits, losing progress) and a gear that does nothing: **Extra** | None |
| Subject chips (Bio 1-40 ...) | Not described | Chips + "Survey of Natural Sciences -- Biology" heading: **Extra** | Chips + "Survey of the Natural Sciences: Biology" heading; PAT and RC chips too: **Extra** |
| Topic and difficulty per item | None | "ITEM 1 - ORGANELLES - DIFF 2" on every item: **Extra (cue leak)** | None: **Match** |
| Instruction line under choices | Not described | "Click on the `Next` button to continue." with literal backticks: **Extra** | None |
| Bottom buttons | Previous, Next, Mark, Review, Exhibit (sciences), Calculator (QR) | PREVIOUS NEXT MARK EXHIBIT REVIEW END in footer; Calculator in a separate toolbar row: **Partial** | PREVIOUS NEXT MARK REVIEW EXHIBIT/CALCULATOR END SECTION: **Match (End placement unverified)** |
| Next on the last item | Goes to Review | Label changes to "Review": **Partial** | Label changes to "Review": **Partial** |
| Alt-key shortcuts | [Unverified] | Letters underlined, but no key handler: **Gap (looks broken)** | Alt+N/P/M/R/X/C work |
| Mark appearance | [Unverified] | Button turns red "Marked" | Button turns red "Marked"; Exhibit and Calculator use the same red when open: **Extra (confusing)** |
| Review screen | List with status; Review All / Review Marked / Review Incomplete stepping; End | Tile grid + counts; buttons "Continue Section" and "End Section". No Review Marked or Review Incomplete stepping: **Gap** | Grid grouped by subject, passage or subtest + counts; "First open question", "First marked question" (jump to one item only; Next then goes in plain order): **Partial** |
| Answer style | Letters with radio-style buttons; 5 choices except TFE, angles and pattern folding (4) | Radio + "A." in boxed rows; 5 choices: **Match** | Same in SNS, RC, QR; PAT 5/4/4/5/5/4 by subtest: **Match** |
| Highlight | Yes (select, then a Highlight button) | None: **Gap** | None (the RC player in `tools/rc/rc.js` has one): **Gap** |
| Strikethrough | Likely (right-click) | Right-click does nothing: **Gap** | Right-click does nothing (rc.js has cross-out): **Gap** |
| Periodic table | Exhibit; ADA says during GC | Only on GC items 41-70; disabled on Bio: **Partial** | All 100 SNS items: **Partial, safe side** |
| Periodic table data | The ADA guide image | Own table + constants line; element 104 shown as "Rt" (should be "Rf"); Fr mass "215.00" (normally (223)); Po/At "210.00": **Gap (data)** | Own table (IUPAC-style values) + constants line; values differ from prometric-mock: **Unverified vs ADA image** |
| Other references | None | **OChem items open "Common Reagents -- Quick Reference"** (oxidations, reductions, Markovnikov rules, EAS directors): **Extra (help the real test does not give)** | None: **Match** |
| Calculator | Basic pop-up, QR only, mouse only | Windows-7-style window with View/Edit/Help menu, memory, back, CE, C, +/-, sqrt, %, 1/x; mouse only; draggable: **Match per in-repo claim** | Same keys with text labels (Back, sqrt, +/-), no menu bar; draggable; opens over the answer column at 1366 px: **Partial** |
| PAT | 6 x 15, fixed order, one clock | n/a: **Gap** | Matches order, counts and option counts. Prompts are short (see 5.F). Cube prompt asks about "exactly zero" painted sides: **verify** |
| RC layout | Passage + question together, passage scrolls | n/a: **Gap** | Split: passage left (about 54%), question right; numbered paragraphs; passage title; scroll position kept per passage; phone uses Passage/Question tabs: **Partial (orientation unverified)** |
| Section end | From Review with a confirmation; no return | "End" in footer + confirm dialog; End Section on review: **Match** | End section in footer and on review, with a confirm that names the open count: **Match** |
| Leaving mid-test | n/a | Copy says closing ends the section (lines 325 and 581), but the code saves and resumes with the clock paused: **copy is inaccurate** | Saves and resumes with the clock paused; copy says so: **OK** |
| Fonts | [Unverified] | DM Sans web font: **Unverified** | Arial/Helvetica system font |

---

## 5. Every gap, in priority order

Severity: **F1** fidelity, changes how the test feels or what it trains; **F2**
fidelity, cosmetic; **HR** house-rule issue on these pages; **C** content issue
found in passing. "PM" = `prometric-mock.html`, "FM" = `tools/mock/full.js` / `full.css` / `full.html`.

### A. Tools the real test has and we lack

1. **F1. No highlighter in either mock.** The real DAT lets you select text and highlight it, at least in RC. Fix: port the highlighter from `tools/rc/rc.js` (lines 391, 519 onward: select text, then press Highlight; tap a highlight to remove it) into the shared player, for RC passages first and then stems. Confirm in the tutorial walk whether science and QR stems allow highlighting.
2. **F1. No answer cross-out in either mock.** Fix: right-click on a choice toggles a strike-through, with a visible button as an alternative for touch screens. `tools/rc/rc.js` lines 423-448 and 682-693 already do this with a button and Alt+click. Keep it purely visual: a struck choice stays selectable, and striking never reveals anything.
3. **F1. Review screen cannot step through marked or incomplete items.** The real Review screen offers Review Marked / Review Incomplete (and Review All), and Next then walks only that subset. PM has only "Continue Section". FM's "First open question" and "First marked question" (full.js 393-394) jump to one item, after which Next goes back to plain order. Fix: add a review mode (`all` | `marked` | `incomplete`) that Next and Previous respect until the student returns to the Review screen. Rename the buttons Review All, Review Marked, Review Incomplete (confirm the labels in the tutorial walk).
4. **F1. No tutorial step.** The real day opens with an optional tutorial, up to 15 minutes. Fix: an untimed "Tutorial" screen before section 1 that lets the student try Next, Previous, Mark, Review, Exhibit, Calculator, Highlight and Cross-out on two sample items, with a Skip button. Since this is practice, no clock (house rule).
5. **F1. PM has no PAT and no RC, and puts the break between SNS and QR.** FM already covers the whole day. Fix: treat FM as the single DAT-style player and retire PM's runtime, or re-point PM's three tests at FM's runner as SNS + QR "section mocks". Keep one player.

### B. Things we show that the real test does not

6. **F1. PM gives an OChem "Common Reagents -- Quick Reference" under Exhibit** (PM lines 845, 868 onward). The real DAT gives a periodic table and nothing else. Students who lean on it in practice lose it on test day. Fix: remove it from the timed mock (it could live in study mode).
7. **F1. PM shows topic and difficulty on every item** ("ITEM 1 - ORGANELLES - DIFF 2", PM line 745). The real screen shows none, and the topic tag gives away the concept being tested. Fix: drop `pm-qmeta` in timed mode and show topics only in the post-test review.
8. **F2. Subject chips and per-item subject headings** (PM line 707 and 719; FM lines 260-266 and the `pm-subject` heading). Nothing public says the real screen labels Bio, GChem or OChem, PAT subtests or passages. Fix: hide them in "exam look" mode. Section 1-of-4 and passage titles can stay on the between-section intro screens.
9. **F2. "Click on the `Next` button to continue."** under every PM item (line 767), with literal backticks. Fix: remove.
10. **F2. Header brand block "AceTheDAT.com / Practice Test N"** in both, plus PM's X and gear (lines 727, 736; the gear does nothing). Fix: center the section name (for example "Survey of the Natural Sciences") once the tutorial walk confirms what the real title bar shows. Move exit into the Review screen or a quiet menu so it cannot be hit by accident.
11. **F2. Pressed-state color.** FM paints Exhibit and Calculator red when open (`.pm-btn[aria-pressed="true"]`, full.css line 102), the same red as Marked. Fix: give "Marked" its own state and use a neutral pressed look for open tools.

### C. Mechanics that are close but not exact

12. **F2. PM's underlined letters do nothing** (no keydown handler). FM's Alt+N/P/M/R/X/C work. Fix: share FM's handler, or remove the underlines. Whether the real DAT supports Alt keys is unverified, so keep them as a harmless convenience.
13. **F2. Periodic table scope differs between the mocks.** PM: GC items only (Bio disabled). FM: all 100 SNS items. The ADA wording covers GC. Fix: pick one rule for the shared player. Recommendation: available throughout SNS, since the button belongs to the section toolbar and it gives no real advantage on Bio items. Confirm in the tutorial walk.
14. **F2. Periodic table data.** PM lists element 104 as "Rt" and Fr as 215.00 (lines 1308-1309), and the two mocks use different mass values (for example Ti 47.90 in PM, 47.87 in FM). Fix: transcribe the ADA 2026 guide's table cell by cell, including whether it has a constants line, and use that one table everywhere. This is reference data, not an answer key, but check that no GC item's key depends on a mass that changes.
15. **F2. Next on the last item becomes "Review"** in both. On the real test, Next on the last item takes you to Review. The label change is harmless but not exact. Fix: keep "Next" and route to Review.
16. **F2. Break hand-off.** The real session resumes automatically after 30 minutes. FM ends the break onto an RC intro screen that waits indefinitely for "Begin section". Whether the real test has a timed directions screen there is unverified. Fix: after a break that runs out, start RC directly, or cap the intro screen once the tutorial walk shows what the real one does.
17. **F2. Calculator placement and look.** PM puts Calculator in a separate toolbar row above the question; FM puts it in the footer. FM's window uses text labels (Back, sqrt, +/-) and has no menu bar, and it opens over the right half of the answer column at 1366 px. Fix: one calculator component matching the ADA guide image (PM's version is the closer one), opening where it does not cover the choices, still draggable, mouse only.
18. **F2. RC layout is unverified.** FM's side-by-side split with numbered paragraphs and a title is a reasonable reading of "passage and question together", but orientation, paragraph numbers and title display all need the tutorial walk. One test-taker says the passage scroll resets on every new question; FM keeps the scroll per passage, which is kinder than what that account describes.
19. **F2. End button on every question screen** (both). Real ending happens from Review with a confirmation; an End on every screen is unverified. FM's confirm text is good ("You have N open questions. A guess can only help..."). Keep it.
20. **F2. Timer warning styles.** PM pulses the timer under 5 minutes (`animation:pmPulse 1s infinite`, line 61). FM turns it yellow. Nothing public shows a real warning style. Fix: drop the pulse (anxiety-aware rule); a steady color change at most.

### D. Copy accuracy on these pages

21. **F2/HR. PM says progress is lost when you leave** ("Closing the tab or refreshing ... ends the section", lines 325 and 581; "It does not pause", line 320), but the code saves and resumes with the clock paused. Fix: say what happens: your place is saved and the clock pauses.
22. **F2. FM's landing says "Same counts, same clocks, same tools the testing center gives you"** (full.html line 22) but has no highlighter or cross-out yet. Fix the tools first, or soften the line.

### E. House-rule items on these two pages

23. **HR. Em dashes in PM student copy** (37 in the file; visible ones include "Survey of Natural Sciences -- Biology", the Review helper, "Skip break -- start QR now", "Common Reagents -- Quick Reference", the instructions list and the report CTA). FM is clean ASCII.
24. **HR. Non-ASCII glyphs in PM** (the X and gear icons, the calculator's arrow, square-root and plus-minus symbols, the maximize box, arrows and middle dots in the reagent sheet and labels). FM uses text labels.
25. **HR. "Test bank failed to load."** (PM line 522) uses "failed". Fix: "The tests did not load. Refresh the page."
26. **HR. Reports show percentages graded by color.** PM's report colors accuracy red, amber or green by threshold and labels misses in red; FM shows "% correct" per section with meters. Check both against the scores-as-grades rule. Raw counts ("31 of 40") with neutral color fit the rules better.

### F. Content found in passing (matters for "every question looks like the DAT and has a detailed explainer and a visual")

27. **C. PM's QR items have almost no explanations.** Only 6, 3 and 5 of the 40 QR items in Practice Tests 1-3 carry a `why`. They are also drill-style ("5/8 = ?", Test 1 QR item 1), not DAT-style word problems. FM's QR items are word problems with a `why` on 159 of 160, but those explanations are short (median 50-78 characters per test).
28. **C. Visuals.** PM: only 2-3 OChem items per test have an SVG and 8-13 a SMILES drawing. No Bio, GC or QR item has a figure. FM: OChem items render SMILES (28-29 per test). No Bio, GC or QR figures. PAT and RC have their own visuals (figures; proof lines).
29. **C. PAT review has no written explainer.** In FM's report a PAT miss shows the figure, your pick and the right option, but no worded walk-through. The PAT engine has explanation text for cube counting (`tools/pat/test.html` line 517); the other five subtests need one.
30. **C. Cube-counting prompt** "how many cubes have exactly zero of their exposed sides painted?" Check it against the published ADA cube-counting directions. If the real test only asks about one to five painted sides, zero-side items teach a format students will not see. This is a format question, not an answer-key change.
31. **C. Answer-key bias rules are already enforced.** Both banks spread keys evenly (8 per letter in 40-item sections, 6 per letter in 30-item ones). FM states "key never the longest" and "every item blind re-solved". I found no reason to suspect any key, and none was changed.

---

## 6. Recommendation for the single DAT-style player

- **Base it on `tools/mock/full.js`.** It already runs all four sections in order with the right counts, clocks, PAT option counts, the RC split, Arial, working Alt keys, grouped review, pause-safe resume, and the "a guess can only help" end confirmation.
- **Add from `tools/rc/rc.js`:** the highlighter and the cross-out, as player-level tools.
- **Add:** an optional untimed Tutorial step; Review Marked / Review Incomplete / Review All stepping; one calculator component (PM's layout) and one periodic table transcribed from the ADA guide; an "exam look" switch that hides subject chips and headings.
- **Remove from the timed path:** PM's reagent sheet, topic/difficulty meta, the backtick hint line, the X and gear in the header, and the pulsing timer.
- **Untimed practice with the same look** (house rule: practice stays untimed): run the same player with the clock hidden and a "Check" step after each item for explainer-plus-visual feedback. Sets, minitests and diagnostics then train on the test-day screen without a countdown. Only full timed mocks show "Time remaining".
- **Video tie-in:** an exam-look tutorial makes a natural first video ("what the DAT screen looks like and how to use Mark, Review, Exhibit, Calculator, Highlight and Cross-out"). Record it from the Ace Labs player, not from Prometric's or the ADA's material.

## 7. Checklist for walking the official tutorial (to close the [Unverified] items)

Write the answers in words; do not copy screenshots of ADA or Prometric material.

1. Title bar: what text, where (section name? "Dental Admission Test"?).
2. Question position: exact wording and position ("Question 12 of 100"?).
3. Timer: label text, position, and any change near the end (color, popup, a hide option).
4. Every button: label, position (top or bottom, left to right order), underlined letters, whether Alt shortcuts work.
5. Is there an End button on question screens, or only on Review? What does the confirmation say?
6. Review screen: list or grid; status words (Marked, Incomplete, Unanswered, Complete, Skipped); buttons (Review All, Review Marked, Review Incomplete, End Review, End Section); can you click a single number?
7. Highlight: how to apply and remove, which sections allow it, whether highlights persist across questions and after Review.
8. Strikethrough: right-click or a button, toggle behavior, which sections.
9. Exhibit: button label and position, window style, available on Bio and OChem items or GC only, whether it includes a constants line.
10. Calculator: button label and position, exact keys and layout, keyboard entry yes or no, memory indicator.
11. RC: passage left or right or top, numbered paragraphs yes or no, passage title shown, does the scroll reset per question.
12. PAT: directions screen per subtest (timed or not); answer layout for each subtest; cube-counting question wording.
13. Answer choices: radio buttons or bubbles, letter style (A. or (A) or A)), click on the text or only on the button.
14. Fonts and colors: describe them in words (serif or sans, background color, bar colors).
15. Break screen: what it shows, and whether the next section starts by itself after 30 minutes.

---

## Sources

Official or primary (seen only as search excerpts; direct fetch was blocked):
- ADA, Dental Admission Test (DAT) 2026 Candidate Guide: https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/dat_candidate_guide.pdf
- ADA DAT page: https://www.ada.org/DAT
- ADA DAT examinee guide (older): https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/dat_examinee_guide.pdf
- ADA DAT user's manual: https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/dat_users_manual.pdf
- ADA DAT Sample Test Items (hosted copies): https://datprep.com/wp-content/uploads/2022/04/ADA.org_-DAT-Sample-Test-Items.pdf and https://www.wheaton.edu/media/migrated-images-amp-files/media/files/academics/departments/special-programs/pre-health/2016-2017/dat_test_sampleitems.pdf
- ADEA, ADA DAT scoring and reporting FAQ: https://www.adea.org/godental/Apply/admissions-process/ada-dat-faq
- Prometric ADA page (not reachable): https://www.prometric.com/ada

Prometric tutorials (same test driver, other exams, or an old DAT copy):
- DAT tutorial copy: https://www.scribd.com/document/50832928/dat-tutorial
- USPTO tutorial on prometric.com: https://www.prometric.com/files/USPTO/htmldemo/tutpg1.htm and https://www.prometric.com/files/htmldemos/uspto/tutpg13.htm
- Prometric exam software tutorial (PTC): https://ptcny.com/pdf/prometricsoftwaretutorial.pdf
- SOA Prometric candidate notes: https://www.soa.org/globalassets/assets/files/edu/prometric-exp-written-exams.pdf

Forum accounts (anecdotal, various years):
- https://forums.studentdoctor.net/threads/buttons-on-dat-for-review.1215788/
- https://forums.studentdoctor.net/threads/dat-format.1152823
- https://forums.studentdoctor.net/threads/back-button.1272320
- https://forums.studentdoctor.net/threads/pat-section.898400
- https://forums.studentdoctor.net/threads/crossing-out-answers-on-real-dat.834489/
- https://forums.studentdoctor.net/threads/few-last-minute-questions-dat-in-24-hours.1215690/
- https://forums.studentdoctor.net/threads/prometric-dat-screen-layout.834497
- https://forums.studentdoctor.net/threads/rc-layout.1061838/
- https://forums.studentdoctor.net/threads/an-alternative-reading-comprehension-strategy-for-dat.1025576/
- https://forums.studentdoctor.net/threads/periodic-table.927476
- https://forums.studentdoctor.net/threads/periodic-table-and-calulator-on-the-dat.928429/
- https://forums.studentdoctor.net/tags/highlight/
- https://th-forums.studentdoctor.net/threads/reading-comprehension-note-taking-vs-highlighting.1274039
- https://forums.studentdoctor.net/threads/scratch-paper.1462570/

Prep-company and reference pages:
- https://www.kaptest.com/study/dat/whats-tested-on-the-dat-quantitative-reasoning-2/
- https://www.kaptest.com/study/dat/whats-tested-on-the-dat-reading-comprehension/
- https://www.kaptest.com/study/dat/whats-tested-dat-perceptual-ability-pat
- https://www.kaptest.com/study/dat/dat-scoring-change/
- https://boosterprep.com/dat/study-guide/what-to-expect-on-the-day-of-the-dat
- https://boosterprep.com/dat/study-guide/the-official-ada-dat-practice-tests
- https://boosterprep.com/dat/study-guide/2026-dat-scoring-change
- https://bootcamp.com/blog/what-kind-of-scrap-paper-do-i-get-on-the-dat
- https://bootcamp.com/blog/my-review-of-the-official-ada-dat-practice-test-is-it-worth-it
- https://testpreppal.com/dat/articles/dat-periodic-table
- https://testpreppal.com/dat/tools/free-reading-comprehension-practice
- https://datprep.com/the-dat-exam/
- https://dat-prep.com/dat-notepad-noteboard-booklet.php
- https://test-ninjas.com/dat-format
- https://medicalaid.org/blog/how-long-is-the-dat/
- https://en.wikipedia.org/wiki/Dental_Admission_Test

Could not reach from this sandbox (DNS or proxy refusal): www.ada.org,
www.prometric.com, seattleu.edu, forums.studentdoctor.net, www.scribd.com,
southeastern.edu, medicalaid.org. WebFetch and curl both failed, so every
page above is known only through search-result excerpts.
