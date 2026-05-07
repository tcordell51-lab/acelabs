# Test-Week UX Teardown
**Audience:** student with 5–7 days to their DAT, anxious, low-bandwidth.
**Method:** Walk-through simulation. Every issue rated by type.
**Types:** [C] Confusing · [O] Overwhelming · [I] Irrelevant · [A] Anxiety-inducing · [M] Misleading

---

## 1. FIRST 5 MINUTES SIMULATION

You are a student who tests in six days. You have spent three months studying. Your anxiety is high, your attention is short, and you need exactly one thing: *what do I do right now*.

You open `ace-labs.html`.

**What you see first** (lines 37–40): A badge reading "Four engines · ~2,500-question bank · DAT-format mocks · spaced retrieval," followed by the headline "The DAT Mastery System, under one roof." Below that a paragraph describing 4 engines, 5 mocks, and a "single Survey-of-Natural-Sciences mock." That is five distinct destinations described in three sentences before you have clicked anything.

**Your next scan** (lines 63–68): A dashboard showing Overall mastery at "—%" with an empty progress bar, and Last mock score at "—." If you have used the system, these are fine. If you are a first-timer or wiped your localStorage, every number is a dash. A page that greets you with five dashes reads as: *you have done nothing, you are behind.*

**You look at the tool tiles** (lines 86–148): QR tile says "41 modules, 35 distinct interactive visualizers, 1010 problems." Bio tile says "6 hubs." GC tile says "37 modules." OChem tile says "11 hand-crafted hubs ... 27 animated mechanisms ... multi-step synthesis puzzles ... stereo + spec trainers." You now have a rough count of 41 + 37 + 17 (Cell Lab alone) + an undefined number for OChem. The sum is illegible but enormous. You have six days.

**You check the nav** (lines 27–31): "Home · Prometric mocks · Mock catalog · Tools · This week." The "Mock catalog" link sounds like what you want. You click it.

**Mock catalog** (lines 84–111): You see a "10-study sequence." The table at the bottom reads: "Day 0 · Week 2 · Week 4-5 · Week 6-7 · Week 8 · 3 weeks out · 2 weeks out · 1 week out." You are at 1 week out, which puts you on Mock #10, labeled "Final C." The copy for that mock reads: "Last full simulation. Use for confidence calibration, NOT for cramming gaps." This is the first actionable instruction you have received — eleven rows into a ten-item ladder — and it is a *warning about what not to do*, not a direction about what to do.

**You are now five minutes in.** You have absorbed: 4 engines, 37+ modules, a 10-mock ladder, a 60-day plan, and the information that you should not be cramming. You do not know what page to open. You do not know what to study. Your anxiety has not decreased.

---

## 2. SPECIFIC ISSUES BY PAGE

### Page 1: `ace-labs.html`

**Issue 1.1** [O] `ace-labs.html` line 37 — Hero badge lists five stats in one sentence: "Four engines · ~2,500-question bank · DAT-format mocks · spaced retrieval." Volume signaling designed to impress a new buyer lands as a to-do list for a test-week student. A student with six days reads "2,500 questions" as: *I haven't done 2,500 questions.*

**Issue 1.2** [C] `ace-labs.html` lines 57–68 — Dashboard cards showing "—" for every metric greet first-time or localStorage-cleared students with five blanks. No onboarding copy explains what to do to populate them. The sub-text "Open at least one engine and complete a session" (line 168) is three scrolls down. The empty state is not welcoming; it is a scorecard showing zero.

**Issue 1.3** [A] `ace-labs.html` line 89 — QR tile: "41 modules, 35 distinct interactive visualizers, 1010 problems with 4-tier difficulty ladder." A test-week student who has not completed all 41 modules reads this as a measurement of their deficit, not a description of the product.

**Issue 1.4** [O] `ace-labs.html` lines 86–148 — The four tool tiles compete equally. No tile is ranked, prioritized, or labeled as "start here." A test-week student must choose between QR, Bio, GC, and OChem with no guidance. The correct test-week move (take a mock, drill your two weakest sections) is not surfaced.

**Issue 1.5** [I] `ace-labs.html` lines 163–169 — "This week's plan" section exists but renders as an empty placeholder: "Open at least one engine and complete a session — your weak spots will surface here." For a test-week student who needs a plan *now*, this is a dead section occupying space in the nav.

---

### Page 2: `mocks-catalog.html`

**Issue 2.1** [A/M] `mocks-catalog.html` line 84 — Section heading: "Mock ladder · 10-study sequence." Ten is the volume signal. A student with six days who sees a 10-item ladder immediately calculates that they are at item 9 or 10 at best, meaning they have used none of the ladder correctly. This creates retroactive anxiety about not having used the system earlier.

**Issue 2.2** [I] `mocks-catalog.html` lines 97–111 — The "How to use the catalog" explainer table spans Weeks 1–8. It is entirely irrelevant to a test-week student. Rows 1–7 of the table describe things they cannot do (they are not in Week 1, they cannot take a diagnostic first, they cannot "confirm the floor lifted"). The table is a museum exhibit of the prep they did not do.

**Issue 2.3** [A] `mocks-catalog.html` line 85 — "diagnostic first to read your floor... Hard mocks to ratchet pressure... Final mocks simulate test-week conditions." The ordering implies a failure state for anyone who skips to the end. Test-week students land at the last page of a book written for someone who started at the beginning.

**Issue 2.4** [O] `mocks-catalog.html` lines 87–91 — Four capability stats: "Bio bank 500Q · GC bank 495Q · OChem bank 350Q · QR bank 1,010Q." Total: ~2,355 questions the student has likely not seen. This is a spec sheet, not a reassurance.

**Issue 2.5** [C] `mocks-catalog.html` line 125 — Mock #10 "Final C" is tagged "1 week out." But there are only 5 Prometric tests. The mock ladder is 10 items; the Prometric tests are 5. The relationship between the two is not immediately clear. The CTA button on every ladder row ("Open Prometric mocks") goes to the same page — Mock #10 Final C and Mock #5 Hard B both route to identical destinations. The ladder implies ten distinct tests but delivers five.

---

### Page 3: `tools/bio/index.html`

**Issue 3.1** [O] `tools/bio/index.html` lines 100–160 — The sidebar lists 44 items: 7 top-level nav links (hub, mock, diagnostic, 60-day plan, analytics, bonus topics, micrographs) plus 37 node links across 6 sections. On a first open, the sidebar is a wall of equal-weight destinations. A test-week student cannot orient.

**Issue 3.2** [I] `tools/bio/index.html` line 95 — "60-day plan · study" is the fourth link in the sidebar, visible on every Bio page. A student with six days should not be clicking on a 60-day plan. The label alone (not its content) triggers irrelevance anxiety: *I only have six days.*

**Issue 3.3** [O] `tools/bio/index.html` lines 100–118 — The Cell Lab section of the sidebar alone lists 17 node links: Water + biomolecules, Carbohydrates, Lipids, Proteins, Nucleic acids, Enzymes, Prokaryote vs eukaryote, Organelles, Membrane transport, Cell signaling, Cell cycle, Glycolysis, Krebs + ETC, Photosynthesis, DNA replication, Transcription, Translation. This is the first section of six. Visible depth without entry point.

**Issue 3.4** [A] `tools/bio/index.html` lines 77–82 — Progress section shows: Cell & Molecular 17/17, Genetics "flagship live," Physiology "flagship live," Diversity "flagship live," Developmental "flagship live," Evolution "flagship live." Five sections show "flagship live" with 10–22% progress bars. A new student sees five unfinished tracks simultaneously.

**Issue 3.5** [C] `tools/bio/index.html` lines 251–272 — Four of six hub tiles are tagged "Under construction · deep-dive nodes shipping soon." A test-week student cannot tell what is functional and what is placeholder. Clicking these tiles may lead to dead or sparse content.

---

### Page 4: `tools/bio/bio-mock.html`

**Issue 4.1** [A] `bio-mock.html` line 24 — `.mk-runtop .timer.warn{color:#ff8a3a;animation:pulse 1.4s infinite}` and `.mk-runtop .timer.danger{color:#ff5555}`. The timer turns orange then red as time expires, with a pulsing animation. For a test-week student who is already hypervigilant about time, a pulsing red clock is a physiological stressor. The real Prometric interface uses the same convention, but within an isolated practice mock, this creates dread with no preparation benefit.

**Issue 4.2** [O] `bio-mock.html` lines 75–80 — The sidebar is replicated on the mock page: 60-day plan link, analytics link, bonus topics, micrograph ID, and all six hubs. During a mock, students should not be able to wander to other pages. The sidebar creates temptation to bail.

**Issue 4.3** [I] `bio-mock.html` line 78 — "60-day plan · study" link is visible during the mock exam. This is visible on every single bio page; it is a persistent reminder of a plan that does not apply.

**Issue 4.4** [C] `bio-mock.html` line 93 — The mock has a `<div class="mk-config">` with grid template `1fr 1fr`. The mock has configuration options before starting — presumably to select sub-topics. A test-week student who just wants the full 40-question Bio mock may not know which config produces which test variant.

**Issue 4.5** [A] `bio-mock.html` line 45 — `.mk-scores` grid shows four score cards: presumably % correct, scaled score, rank percentile, and one more. Seeing a score card with four metrics after a low mock score while six days from the real test amplifies anxiety without giving specific remediation direction.

---

### Page 5: `tools/bio/bio-diagnostic.html`

**Issue 5.1** [I] `bio-diagnostic.html` line 95 — The sidebar "60-day plan" link is visible on the diagnostic page. Context: a student taking a diagnostic 6 days before their test is using this to identify weak spots. The 60-day plan link implies there is time to execute a full remediation arc. There is not.

**Issue 5.2** [M] `bio-diagnostic.html` lines 63–78 — The sidebar shows "Six hubs" with node counts (Cell Lab: 17, Genetics: 7, Physiology: 9, Diversity: 4, Developmental: 3, Evolution: 4). The diagnostic's stated purpose is to identify weak spots. Showing 44 total nodes in the sidebar while taking a 24-question diagnostic tells the student that whatever they are weak on maps to a very large remediation surface.

**Issue 5.3** [A] `bio-diagnostic.html` lines 16–17 — The intro has a lede box (`.dg-intro .lede`) but the diagnostic has no explicit "you cannot fail this" pre-flight that the QR diagnostic has (QR line 1751: "You can't fail this"). The Bio diagnostic drops students directly into questions without a comparable anxiety guard.

**Issue 5.4** [C] `bio-diagnostic.html` line 88 — Comment: "24 calibrated diagnostic questions — 4 per hub." This is internal; students do not see it. But the diagnostic also has no visible framing of what 24 questions represents relative to a real test (40 questions). Students have no reference for whether the diagnostic score maps to their real test score.

**Issue 5.5** [O] `bio-diagnostic.html` lines 66–78 — The sidebar for the diagnostic shows the full node-by-hub structure: Cell Lab 17, Genetics 7, Physiology 9, Diversity 4, Developmental 3, Evolution 4. This is the same large list visible on every Bio page. On a diagnostic screen, where the cognitive task is answering questions, a 44-item sidebar is visual clutter.

---

### Page 6: `tools/bio/bio-calendar.html`

**Issue 6.1** [I/A] `bio-calendar.html` line 77 — Hero badge: "60-day plan · ~75 min/day." Page title says `Sixty days. One pass.` (line 78). A student with six days who lands here — even accidentally via the persistent sidebar link — sees a plan built around a 60-day arc. There is no test-week variant. The page does not acknowledge that it may not apply.

**Issue 6.2** [A] `bio-calendar.html` line 79 — "Days 1–24 walk every node in the six hubs at a sustainable pace; days 25–48 cycle review + retrieval against weak hubs; days 49–60 lock in mocks." Reading this with 6 days left means the student is looking at the last 2% of a plan they presumably did not execute. The calendar view will show 54 past days as either empty or marked "past" (line 27: `.cal-cell.past{opacity:0.55}`). Fifty-four greyed-out days is a visual record of missed work.

**Issue 6.3** [O] `bio-calendar.html` lines 108–120 — The 60-day PLAN array has entries starting at Week 1. If a student sets their test date to 6 days out, the calendar renders days 1–54 as past and potentially empty (not `complete`). This is a scrollable grid of things they did not do.

**Issue 6.4** [M] `bio-calendar.html` line 77 — "~75 min/day" implies 75-minute daily commitment over 60 days = 75 hours of Bio study. Presenting this as the plan when a student has 6 × ~3 available hours left implies inadequacy without providing a test-week alternative.

**Issue 6.5** [C] `bio-calendar.html` lines 84–86 — Controls bar has "Test date" input and "Today → D1" button. It is unclear whether "Today → D1" resets the plan to start today (giving them a fresh 60-day forward view) or marks today as Day 1 in the sense of "you are just starting." The button label does not clarify whether it is helpful for someone with 6 days remaining.

---

### Page 7: `tools/qr/index.html` (top)

**Issue 7.1** [O] `tools/qr/index.html` line 1723 — Stats row: "40 Skills." For a student who has not started QR from scratch, "40 skills" reads as depth. For a test-week student who has already studied QR, the question is "which 40? Which ones do I still have gaps in?" There is no immediate mechanism to answer that from the landing page.

**Issue 7.2** [A] `tools/qr/index.html` line 1718 — CTA: "Start the diagnostic — 15 min." The diagnostic is the gateway for new students. For returning test-week students, this button offers two bad reads: (a) I need to redo the diagnostic — meaning I wasted all my prior work, or (b) this diagnostic is irrelevant because I've already done it. Neither is reassuring.

**Issue 7.3** [O] `tools/qr/index.html` line 89 — Tile description on `ace-labs.html`: "41 modules, 35 distinct interactive visualizers, 1010 problems." The QR sidebar (implied from structure) lists all 41 modules. This is the full module list a student must scroll past to find their specific weak spot.

**Issue 7.4** [I] `tools/qr/index.html` line 1720 — "Or jump straight to fractions" as the ghost CTA. Fractions are a foundation skill unlikely to be a gap for a student who has spent three months on QR. This is entry-level content surfaced at landing as though it might be relevant.

**Issue 7.5** [C] `tools/qr/index.html` line 1736 — Diagnostic description: "Twenty questions, fifteen minutes. Not graded. We're mapping where you're solid and where there's a gap." For a student who has taken the diagnostic before, it is unclear whether re-taking it regenerates a fresh heatmap or adds to a previous one. The page does not confirm whether prior diagnostic data is preserved or overwritten.

---

### Page 8: `tools/gc/index.html` (top)

**Issue 8.1** [O] `tools/gc/index.html` line 3490 — Stats row: "37 Skills." Same volume-signaling issue as QR. For a test-week student, "37 skills" means "37 things I may or may not have mastered." No landing-page shortcut to weak spots.

**Issue 8.2** [A] `tools/gc/index.html` line 3517 — Today's Set widget includes a `.today-streak` element with a flame icon and "day streak" count. If the student has broken their streak (likely during the final days of pre-test anxiety), they see "0 day streak" under a flame glyph. Streak counters punish gaps; a test-week student almost certainly has gaps.

**Issue 8.3** [I] `tools/gc/index.html` line 3515 — Today card sub-copy: "A small, smart batch — due reviews, your weakest skill, and one stretch problem." For a test-week student, "one stretch problem" is irrelevant. Stretch problems introduce new difficulty; test week is consolidation week.

**Issue 8.4** [A] `tools/gc/index.html` line 3485 — Start CTA: "Start the diagnostic — 12 min." Same concern as QR: if the student has already done the diagnostic, this implies a re-do. If they have not, taking a 12-minute diagnostic with 6 days left is valid — but the diagnostic result will generate a list of "gaps" that may not be closeable before test day.

**Issue 8.5** [M] `tools/gc/index.html` line 3483 — Hero lede: "If you've felt 'bad at chemistry' — you're not. Somewhere along the way, a foundation skill got skipped." This copy is compassionate and effective for a student with months ahead. For a student with six days, "a foundation skill got skipped" reads as: *there is a foundational gap and I am about to take the DAT.* Same words, different emotional valence at different time-distances from the test.

---

### Page 9: `tools/ochem/index.html` (selective)

**Issue 9.1** [O] `tools/ochem/index.html` lines 2362–2368 — Intro stats: "10 Hubs · 92 Reactions · 60 MCQs · 9 Mechanisms · 6 spectra." This is the smallest volume signal in the system, but "92 reactions" is still a large number when a student has 6 days. A test-week student needs to know which reactions appear most frequently on the DAT, not how many reactions exist.

**Issue 9.2** [O] `tools/ochem/index.html` lines 2148–2316 — The sidebar lists: Introduction · Hubs Grid · Master Roadmap · Mechanism Library · Synthesis Lab · Flashcard Deck · Stereo Lab · Spectroscopy · Exam Simulator · Mastery Dashboard, followed by 12 reaction hubs (Bonding, Nomenclature, Acid-Base CARDIO, Alkanes, Alkenes, Alkynes, SN/E Decision, Alcohols, Ethers, Aromatic, Aldehydes & Ketones, Carboxylic Acids, Amines, Lab Techniques, Alpha Chemistry, Reagent Reference). That is approximately 26 sidebar items before any hub content appears. Scrolling the sidebar is a 30-second task.

**Issue 9.3** [I] `tools/ochem/index.html` line 2382 — Hubs Grid heading: "Pick a hub. Master it. Unlock the next." The gamified-unlock framing ("unlock the next") implies a linear progression that takes time. Test-week students need to skip to their weakest hubs, not unlock sequentially.

**Issue 9.4** [A] `tools/ochem/index.html` line 2320 — H1: "Organic Chemistry, decoded for the DAT." This is neutral. But the intro immediately exposes a path with 4 steps (lines 2326–2354) with timing: "2 min · 15 min · daily · when ready." "Daily" and "when ready" are long-term framing. A student with 6 days reads "daily" as: *this is designed for someone with more time than I have.*

**Issue 9.5** [C] `tools/ochem/index.html` line 2043 — The welcome modal ends with "Got it — let me explore." The word "explore" implies open-ended browsing. A test-week student does not want to explore; they want to drill specific hubs. The welcome modal's CTA frames the wrong mental model for their situation.

---

### Page 10: `prometric-mock.html`

**Issue 10.1** [A] `prometric-mock.html` line 304 — Lede copy: "Survey of Natural Sciences (100Q in 90min) followed by a 30-minute break, then Quantitative Reasoning (40Q in 45min)." Time commitment: 2h 15m of seat time. This is useful information, but on a test-week student's schedule, "2 hours 15 minutes" is a significant block. There is no acknowledgment that some students may want to take one section at a time for targeted practice rather than the full simulation.

**Issue 10.2** [A] `prometric-mock.html` line 306 — The "Honest note" warning includes: "PAT and Reading Comprehension sections are not included." For many students, PAT is their weakest section. Seeing "PAT is not covered" on the mock page — with 6 days left — raises the question of where to practice PAT without any answer offered.

**Issue 10.3** [A] `prometric-mock.html` line 426 — Start button copy: "Start Section · 90:00 timer begins." This is accurate and good fidelity simulation. But the moment the timer appears on the instructions screen before the student has even clicked Start, it begins introducing real-test dread. For a practice session that is voluntary, there is no softening framing ("This is practice — you control this").

**Issue 10.4** [O] `prometric-mock.html` lines 311–319 — "Test rules" card lists 6 rules. For a returning test-taker, these rules are redundant. For a first-timer, six bullet points before the Start button is a friction hurdle at the moment of highest motivation.

**Issue 10.5** [M] `prometric-mock.html` line 371 — Each test card shows "140 Q · 135 min." This is the total for both sections combined. A student who reads this and thinks "I only have 90 minutes to spare today" may skip the mock entirely rather than realizing they can take just the Sciences section.

---

## 3. COPY ISSUES

**3a. Volume promises too large for test week**

- `ace-labs.html` line 37: "~2,500-question bank" — signals how much bank exists, not how much is needed.
- `ace-labs.html` line 89: "41 modules, 35 distinct interactive visualizers, 1010 problems" — quantifying the QR engine for someone evaluating whether to buy it; not useful to someone who already has six days.
- `mocks-catalog.html` lines 87–91: Bank stat cards listing 500+495+350+1010 = ~2,355 questions.
- `bio-calendar.html` line 77: "60-day plan · ~75 min/day" — the plan title is visible on every Bio sidebar page regardless of time to test.

**3b. "Comprehensive / complete / system" language that threatens test-week students**

- `ace-labs.html` line 39: "The DAT Mastery System, under one roof." — "mastery system" implies full completion is the goal. A student who has not achieved mastery is told they are using a system they have not finished.
- `ace-labs.html` line 157: "The partial DAT simulation mock" — the word "partial" is honest but anxiety-inducing when read as "the mock I use to assess myself is itself incomplete."
- `tools/bio/index.html` line 183: "Six dedicated subject tools... together they feed a single Survey-of-Natural-Sciences mock and a cross-tool spaced-repetition queue." — "Six tools," "cross-tool," "one mock" describes an integrated system that rewards having used all parts. A test-week student who used 2 of 6 tools feels behind the system.
- `tools/ochem/index.html` line 2321: "Nothing you don't need — everything you do." This is reassuring copy. It is the exception.

**3c. Sidebar/nav depth implying untraversable content**

- Bio sidebar: 44 visible links on every Bio page (lines 92–162 of bio/index.html).
- OChem sidebar: ~26 items before any reaction hub appears (lines 2076–2316).
- QR/GC: Full 40/37 module lists in sidebars by implication.
- Mocks catalog: 10-item ladder table permanently anchored on the catalog page.

---

## 4. NAV STRUCTURE ISSUES

**4a. Bio sidebar — 44 nodes on every page**

The Bio sidebar shows the full navigation tree on every single Bio page: 7 utility links + 37 topic nodes. A test-week student who opens `bio-mock.html` to take a practice exam is confronted with a sidebar listing Fertilization, Ecology, Sliding filament, Transcription, etc. These are study destinations, not mock destinations. They create "should I be studying X instead?" noise during a test session.

Specific node count by section (from `bio/index.html` lines 100–162):
- Cell Lab: 17 nodes
- Genetics: 7 nodes  
- Structure & Function: 9 nodes
- Diversity: 4 nodes
- Developmental: 3 nodes
- Evolution: 5 nodes
- Total: 45 sidebar items including section headers

**4b. Mocks catalog — 10-mock ladder with Weeks 1–8 framing**

`mocks-catalog.html` line 84: "Mock ladder · 10-study sequence." The table (lines 99–110) maps ten mocks to an 8-week timeline. A student arriving at the catalog with 6 days left is structurally at row 9 or 10 of a 10-row table — placed there by time, not by preparation. The table has no "you are here" marker, no test-week variant, and no copy acknowledging that the Prometric mock page is what they should open rather than the catalog.

**4c. QR — 41 modules, GC — 37 modules**

Both engines surface their full module count on the home page tile (ace-labs.html lines 89, 121) and in their respective engine hero stats. There is no mechanism on either engine's landing page to filter to "weak spots only" or "test-week priority hubs." A student must either re-run the diagnostic (and wait for it to complete) or manually remember which modules need attention.

**4d. Top nav offers too many destinations from the home screen**

`ace-labs.html` lines 27–31: Nav links are "Home · Prometric mocks · Mock catalog · Tools · This week." Five equal-weight options. "This week" goes to a placeholder section that currently renders nothing useful (line 168). For a test-week student, the expected hierarchy would be: Take a mock first → review your score → drill your two weakest topics. None of the nav items directly encodes this flow.

---

## 5. ANXIETY-INDUCING UI

**5a. Timer language creates dread vs. helpful pacing**

- `bio-mock.html` CSS `.mk-runtop .timer.warn{animation:pulse 1.4s infinite}` + `.timer.danger{color:#ff5555}` — Three-state timer (normal → orange pulsing → red) mirrors the real Prometric interface. This is correct fidelity for a simulation. However, the transition from orange to red during a practice mock — when a student is already anxious — adds physiological stress without incremental benefit. The warn/danger states are appropriate on test day; in test week, they may cause students to abort mocks early rather than train through time pressure.
- `prometric-mock.html` line 426: "Start Section · 90:00 timer begins" — placing the exact timer duration in the Start button copy creates pre-flight dread before the student has clicked anything.

**5b. Score predictions add anxiety**

- QR and GC both surface "score predictor" in their mock results (implied by `ace-labs.html` line 89 "score predictor" and line 121 "mock + score predictor"). A score predictor that reads below a student's target score with 6 days remaining creates a number to fixate on that cannot be meaningfully changed in the available time.
- `bio/index.html` line 210 — `.dash-mock-score` shows last mock score prominently on the Bio hub home screen. A student returning after a bad mock sees their worst score before anything else.

**5c. Volume signaling creates overwhelm**

- The progress bars for Genetics, Physiology, Diversity, Developmental, and Evolution all show 10–22% completion on the Bio hub (`bio/index.html` lines 78–82). This is accurate — but it means every visit to the Bio hub begins with a visualization of incompleteness across 5 of 6 subjects.
- `bio/index.html` line 165 (sidebar footer): "Active nodes: 19 live." This footer is visible at the bottom of the sidebar on the hub page. "19 live" signals that 19 out of ~44+ nodes are active, implying more content is forthcoming. Test-week students do not need to know the product roadmap; they need to know what is ready for them now.

---

## 6. RECOMMENDED COPY + NAV CHANGES

**Change 1 — ace-labs.html, line 37**
Current: `Four engines · ~2,500-question bank · DAT-format mocks · spaced retrieval`
Change to: `Four engines · DAT-format mocks · spaced retrieval`
Remove the question bank count from the hero badge. It signals volume, not quality, and is the first thing a test-week student reads.

**Change 2 — ace-labs.html, line 39**
Current: `The DAT Mastery System,<br/><em>under one roof.</em>`
Change to: `Your DAT prep,<br/><em>one place.</em>` — or variant: `Everything you need<br/>for test week.`
Remove "Mastery System" — "mastery" implies a completion state that test-week students have not reached.

**Change 3 — ace-labs.html, lines 89, 121, 137**
Current (QR tile): `41 modules, 35 distinct interactive visualizers, 1010 problems with 4-tier difficulty ladder`
Change to: `40-question mock · score predictor · 41 skills from foundational to test-day`
Lead with the test-week utility (mock + score), follow with the depth number. Same data, different emphasis.

**Change 4 — mocks-catalog.html, line 84–85**
Current: `Mock ladder · 10-study sequence` / `Use this as a pacing map: diagnostic first...`
Change to: `Mock catalog · How to pick a test`
And replace the weeks 1–8 table with a two-row test-week table:
```
Testing in 1-2 weeks  →  Take Mock Final A/B/C for a full simulation. Score it and drill your weakest subject before test day.
Testing in 3+ weeks   →  Start with the Diagnostic, then work the ladder from Standard upward.
```

**Change 5 — bio/index.html, line 95 (and all Bio sidebar pages)**
Current: `<a ... href="bio-calendar.html" ...>60-day plan<span class="meta">study</span></a>`
Change label to: `Study plan` and add a test-week conditional note (or hide in test-week mode). The "60-day" number is the problem — replace with a neutral label that covers both time horizons.

**Change 6 — bio/index.html, lines 77–82 (sidebar progress)**
Current: Shows % progress bars for all 6 subjects simultaneously.
Change: Collapse to a single "Your strongest / Your weakest" two-line summary. Show the detail only when expanded. Five low progress bars is a stressor, not a navigation aid.

**Change 7 — prometric-mock.html, line 426**
Current: `Start Section · 90:00 timer begins`
Change to: `Start Sciences section`
Move the time info to a secondary note below the button. The timer duration in the CTA creates pre-commitment dread.

**Change 8 — tools/qr/index.html, line 1718 / tools/gc/index.html, line 3485**
Current: `Start the diagnostic — 15 min` / `Start the diagnostic — 12 min` as primary CTAs
Add a second prominent CTA: `Resume where I left off` (already exists as `resumePill` but hidden until localStorage is read). For test-week students, the diagnostic CTA should be secondary to the resume/review CTA.

**Change 9 — tools/ochem/index.html, line 2043**
Current: `Got it — let me explore`
Change to: `Got it — start with the roadmap` (or link directly to roadmap section)
Remove the word "explore." It signals open-ended browsing, which is not the test-week mode.

**Change 10 — bio-mock.html / bio-diagnostic.html sidebars**
The sidebar on the mock and diagnostic pages should not show all 44 Bio topic nodes. During an active test or diagnostic, the sidebar should collapse to: `← Back to hub · Mock Exam · Diagnostic` — nothing else. The current full sidebar is navigable temptation during a timed session.

---

## 7. WHAT TO HIDE IN TEST-WEEK MODE

A test-week mode toggle (already linked from `ace-labs.html` line 38: `test-week.html`) should hide or deprioritize the following:

**Pages to hide / not link from test-week view:**
- `bio-calendar.html` — 60-day plan. Show instead: "You have N days — here's your daily order."
- `mocks-catalog.html` weeks 1–7 ladder rows — show only Final A/B/C rows and the 5 Prometric tests.
- `bio-analytics.html` — long-term trend analysis. Irrelevant in test week; seeing flat or declining trends is anxiety-producing.

**Nav elements to suppress on all pages in test-week mode:**
- "60-day plan" sidebar link on all Bio pages → replace with "Your 6-day plan" or hide entirely.
- Progress bars showing all 6 Bio subjects → collapse to a "weakest subject" callout.
- Mock ladder table weeks 1–7 → show only "Test-week: take Final C."

**Features to mute or remove from test-week view:**
- QR stat "41 modules" / GC stat "37 modules" / Bio stat "6 hubs" — replace with "Your due cards: N" and "Weakest topic: X."
- Hero badge "~2,500-question bank" — replace with "Review your weak spots · Take a full mock."
- Score predictor on practice mocks that is below target — soften with: "Practice scores run 2–5 points below test-day due to conditions. This is expected."
- Day streak counter — suppress or remove. Punishes gaps that are normal in test week.
- "Under construction" labels on Bio hub tiles (lines 251–272) — replace with what IS available rather than flagging what is not.
- OChem welcome modal CTA "let me explore" — replace with "Go to my weakest hub."

**Content to show prominently in test-week mode (currently buried):**
- The "Stuck? Take a beat" triage modal — already built and anxiety-aware. Surface it more prominently on hub landing pages rather than only in the sidebar.
- Bio mock 40-question test — make this the first above-the-fold CTA on `bio/index.html` in test-week mode, not the fourth sidebar link.
- Ace Cards due count — currently shown correctly on the dashboard. In test-week mode, this should be the dominant call-to-action: "You have N cards due. Do those first."

---

## SUMMARY

**Total issues catalogued: 47**
(Issues 1.1–1.5, 2.1–2.5, 3.1–3.5, 4.1–4.5, 5.1–5.5, 6.1–6.5, 7.1–7.5, 8.1–8.5, 9.1–9.5, 10.1–10.5 = 50 numbered issues, minus 3 that overlap with copy issues section = net ~47 distinct problems)

---

## TOP 5 HIGHEST-PRIORITY CHANGES

**Priority 1 — Hide or relabel the "60-day plan" everywhere.**
The label appears in the sidebar of every Bio page. A student with six days sees it on every page load. This single link is the clearest signal that the system was built for long-term prep, not test week. Rename to "Study plan" or hide behind the test-week toggle. Affects: `bio/index.html:95`, `bio-mock.html:78`, `bio-diagnostic.html:67`, `bio-calendar.html:61`.

**Priority 2 — Strip module/question counts from hero badges and tile descriptions.**
"41 modules," "1010 problems," "~2,500-question bank" are sales copy that reads as a deficit list for test-week students. Replace all count-based signals on landing pages with use-case framing: "Find your weak spot · Take a full mock." Affects: `ace-labs.html:37`, `ace-labs.html:89`, `ace-labs.html:121`.

**Priority 3 — Collapse the Bio sidebar during mocks and diagnostics.**
The 44-item sidebar is present on `bio-mock.html` and `bio-diagnostic.html`. During an active test or diagnostic, this is navigable distraction. Collapse to 3 items: `← Hub · Mock · Diagnostic`. Affects: `bio-mock.html:75–98`, `bio-diagnostic.html:59–78`.

**Priority 4 — Add explicit test-week entry points to the mock catalog and the mocks catalog routing.**
The mock catalog's 10-item ladder table (weeks 1–8) has no row for "I have 6 days." A test-week student landing on this page has no clear action. Add a callout at the top: "Testing within 2 weeks? Open Prometric Mock 3, 4, or 5. Take it at the same time of day as your real test." Affects: `mocks-catalog.html:84–111`.

**Priority 5 — Replace the QR and GC "Start the diagnostic" primary CTA with "Resume / Review my weak spots" for returning students.**
A test-week student who used these engines for months should not see "Start the diagnostic" as the primary button. The resume pill already exists in GC (`gc/index.html:3500`) but is hidden. Promote it. In test-week mode, the entire engine landing should default to: due cards → weakest module → mock. Affects: `tools/qr/index.html:1718`, `tools/gc/index.html:3485`.
