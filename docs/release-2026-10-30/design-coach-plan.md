# Ace Labs: the coach in your pocket

Design direction for releasing Ace Labs as one tool with one feel. Written 2026-10-30 for Thomas.

- Mockups (real HTML/CSS/JS, served from this folder): `mock/index.html`, `mock/today.html`, `mock/practice.html`, `mock/biology.html`, `mock/question.html` (add `?mode=timed` or `?state=ask`), `mock/pat-holepunch.html`
- Shared mock code that maps to production files: `mock/assets/tokens.css` (to `shared/al-tokens.css`), `mock/assets/kit.css` (to a new `shared/ace-kit.css`), `mock/assets/shell.js` (to `shared/ace-shell.js` plus a new `shared/ace-play.js`), self-hosted fonts in `mock/assets/fonts/`
- Real Ace Labs code reused unchanged in the mocks: `tools/bio/bio-real.js` (wet-mount red cells, Elodea, sarcomere TEM) and `tools/bio/bio-bone.js` (long bone and ground section)
- Screenshots: `shots/` (every mock at 390 x 844 and 1280 x 800, viewport and full page, plus play sequences, dark mode, timed mode and reduced motion)

All copy in the mocks is real Ace Labs content: the tonicity entry from `tools/bio/bio-stick-data.js`, item `written:bio-3-1rvt47w` from `tools/mock/data/full-mocks.js` (Full-length DAT 4) with its own explanation and per-choice trap notes, Retold night titles from `shared/ace-index.js`, tool names and counts from the inventory.

---

## 0. The idea on one page

**Today is a coach, not a dashboard.** When a student opens Ace Labs, a short line in Thomas's voice tells them what to do next and why ("Osmosis cost you three on the diagnostic. Call this one first."), and the first step is already on screen and playable: real red cells under a light microscope, waiting for the student's call. They tap a prediction, watch the cells swell and burst, drag the solute slider themselves, answer one more from memory, and an Ace Card carrying the picture they just saw flies into the Review door. The plan line advances. That whole loop takes under three minutes, and the student has not read a paragraph yet.

Every door is organized around that plan:

- **Practice** opens with the plan's picks, then six section front pages built the same way.
- **Tests** puts the plan's next test first.
- **Review** is where the cards land.
- **Learn** continues the night of the course that the plan points at.

Every hands-on step uses the same five-beat loop (**Call, Watch, Drive, Recall, Card**), so a student who learned it on red cells already knows how to play hole punching, Q vs K or successive percents.

**Three layers, never mixed.** This one rule makes 241 pages feel like one tool:

| Layer | Look | Job |
|---|---|---|
| The coach | Forest #1B3A2D, gold, Playfair italic | Tells you what to do and why. Plans, notes, explainers, "the move to keep". |
| The lab bench | Paper #f5f0e8 and #fffdf7, ink, DM Sans | Where you play: play panels, tool cards, cards, lists. |
| Test day | Blue bars, white card, Arial (fixed, never themed) | Every question, practice or timed, looks like the DAT. |

The student-facing shorthand is **anything gold is the coach; anything blue and white is test day.** On the question screen, the only gold control is Check, because the real DAT has no Check.

**What a student never sees** (ANXIETY_AWARE_DESIGN.md plus the release rules):

- No clock anywhere except inside a full timed mock. Today shows "about 29 min" estimates, never a countdown. The test date appears as a date ("Saturday, December 12"), never as "N days left".
- No streaks, points, XP, volume badges, leaderboards, percentages or scores used as grades. No confidence rating before feedback.
- Verdicts are only Confirmed or Needs review. None of the three banned words appears.
- Plain ASCII copy: no emoji, no em dashes, no typed separator glyphs. The separators in the mocks are drawn in CSS by `.sep`.
- No competitor names and no payment language on study surfaces.

---

## (a) Information architecture

### The doors: five, not six

The shell keeps **Today, Learn, Practice, Tests, Review** and moves **Canon** inside Learn. This is a strong reason, not a taste call:

1. Canon is the only door that leaves the app: it opens the portal in a new tab. A student on a phone taps a door and lands in a different site with a different nav. That breaks "one tool".
2. At 390 px, six doors force 12.5 px labels and about 65 px targets. Five doors give 78 px targets with an icon and an 11.5 px label, plus room for the Review due badge.
3. Canon is reference material, which is Learn's job. It stays one tap away from every place a student needs it: each section in Learn has a "Canon sheets" shelf, and every explainer, Review row and Call it first verdict links its sheet under "Go deeper".

On phones the five doors move to a **bottom tab bar** (thumb reach, always visible, and the place the Ace Card flies to). On desktop they stay a top bar. The shell hides itself during timed sections exactly as it does today (`acelabs.timed`). The question screen has its own test-day bars and never shows the shell.

### What sits behind each door, in order

**Today** (`/`, `ace-labs.html`)

1. **Coach band.** On the phone: the brand and the date, one coach line, an honest source line, and the plan line ("Step 1 of 4, about 29 min"). On desktop: the full plan rail and the newest note from the coach.
2. **Step 1, live.** A play panel that works before anything else is read.
3. **The rest of today.** Steps 2 to 4 as cards: cards back today, a practice set on the test-day screen, the next play step.
4. **Three facts:** tomorrow's test, this week's focus (three topics, picked from misses), and the DAT date.
5. **Footer:** where everything else lives.

Removed from Today:

- the five catalogue rooms (Learn, Practice, Repair, Prove, Play) and the jump chips with hard-coded counts;
- the "Mnemon, coming soon" tile;
- the readiness bars, which move to Review > Results as raw counts;
- "Talk to a coach" pointing enrolled students at the public contact page. Portal students get "Message your coach"; others get nothing.

The plan comes from `AceProgress.today()`, extended to v2 below, or from `AceProgress.plan()` when the portal handoff has a weekly plan.

**Learn** (`/learn/`). A section switcher in test-day order (Biology, General Chemistry, Organic Chemistry, Perceptual Ability, Reading Comprehension, Quantitative Reasoning), and per section:

1. **The Retold course.** A continue card that shows the next night, plus every night with a walked mark.
2. **Foundations,** where they exist: OChem Roots and The Two Decisions.
3. **Canon sheets** for that section, rendered from the portal source.
4. **Tricks** for GChem and OChem only: the 14 Chem Tricks, one card per trick with its short, full video and sheet side by side.

**Practice** (`/practice/`)

1. **Picked for you:** three cards from today's plan and this week's focus.
2. **By section:** six section cards in test-day order, each opening that section's front page.
3. **Learn by playing:** a shelf of the hands-on tools that exist today.
4. **Question sets on the test-day screen:** choose a section and a topic; ten questions, untimed.
5. **Beyond the DAT: Casper practice:** one quiet card.

**Section front pages** (one template, six pages; mock: `biology.html`). They have the same five lanes in the same order everywhere:

| Lane | Biology (mocked) | General Chemistry | Organic Chemistry | Perceptual Ability | Reading Comprehension | Quantitative Reasoning |
|---|---|---|---|---|---|---|
| 01 Play it | Which one is this? (red cells), 15 Call it first, 4 true-to-life views | Lewis and VSEPR Sandbox, Recognition Lab, Periodic Trends | Chirality Bench, Tree modules that predict then draw | Call it first for all six question types (hole punching first), Six Views | Call the paragraph (find the proof line before reading the choices) | Probability Sandbox, Stats Lab, fraction bars, balance scale, multiplier chain |
| 02 Learn it | Bio, Retold (14 nights), A&P Test-Week Review | GChem, Retold (14) | OChem, Retold (13), The Roots of Organic, The Two Decisions | PAT, Retold (10) | RC, Retold (10) | QR, Retold (14) |
| 03 Practice it | Six topic hubs | GChem skill tree | The Tree of Organic | PAT Studio: six trainers in test order | RC passages (45) | QR skill tree (44 skills), Pattern Library |
| 04 Prove it | Bio check (Short 25 or Full 40) | Sciences + QR tests | The Summit | PAT tests (15) | Reading sections (15 timed) | QR Test-Day Simulation (40) |
| 05 Refreshers | Bio Repair Sheet, Bonus Topics, Canon sheets | Common Traps, Canon sheets, Chem Tricks | Reaction Map (reference), Chem Tricks, Canon sheets | PAT at a glance (was the Playbook), Grids and T-charts (PDF) | Canon sheets | Canon sheets |

**Tests** (`/tests/`). Every card carries a status line ("Test 2 of 4 next", "Taken Oct 30"):

1. **Start here:** The diagnostic, honestly labelled "about 45 minutes".
2. **Every day:** The Climb.
3. **Full-length DAT 1 to 4,** the hero card.
4. **Section tests:** Sciences + QR tests 1 to 3, PAT tests, Reading sections, The Summit, Bio check, QR Test-Day Simulation.
5. **Test week:** Test-week mode and Test-day briefing.
6. **Your results:** a link into Review > Results.

**Review** (`/review/`). The Review badge counts only cards due today.

1. **Cards back today:** a flip-through stack on the 1, 3, 7 day ladder, which is the `LEITNER` constant in `ace-progress.js`.
2. **Every miss:** the existing list with Sheet, Learn and Drill links, plus "Play it" where a Call it first exists.
3. **Results:** today's Performance page, with every timed result shown as raw counts and a Full-length filter.
4. **Common Traps:** the GChem misconception reference.

### One name per thing

| Thing | Student-facing name (use everywhere) | Retire |
|---|---|---|
| Product | Ace Labs | AceLabs, AceTheDAT.com in headers |
| Doors | Today, Learn, Practice, Tests, Review | Canon as a door; Repair, Prove, Play as room names |
| Sections | Biology, General Chemistry, Organic Chemistry, Perceptual Ability, Reading Comprehension, Quantitative Reasoning (short: Bio, GChem, OChem, PAT, RC, QR) | GC, Gen Chem, Orgo, Organic, Reading, Physiology |
| The play loop | Call it first (beats: Call, Watch, Drive, Recall, Card) | Stick layer (internal name only) |
| Recognition sets | Which one is this? | Micrograph ID-style practice |
| Realistic renders | True-to-life view | Real mode, TEM tab |
| Spaced cards | Ace Cards; the deck lives in Review | Repair queue, nodes |
| Bio practice tools | Six topic hubs: Cell and Molecular, Genetics, Body Systems, Diversity of Life, Development, Evolution and Ecology | Cell Lab, Cell Atlas, Genetics Studio, Structure & Function, Body Systems Lab, Field Guide, Embryo Atlas, Selection Simulator, Bio Repair Lab |
| GChem and QR engines | GChem skill tree, QR skill tree | Gen Chem engine, Remediation System, QR engine |
| OChem ladder | The Roots of Organic, The Tree of Organic, The Summit | Classic course engine, Reaction Maps as an engine |
| Climb rung 10 | Rung 10 | The Summit (collides with the OChem test) |
| Climb's inner tab | Queue | Today (collides with the door) |
| Courses | Bio, Retold; GChem, Retold; OChem, Retold; PAT, Retold; RC, Retold; QR, Retold | the /retold/ hub |
| Timed forms | Full-length DAT 1 to 4; Sciences + QR test 1 to 3; Bio check (Short or Full) | Practice tests, Prometric mocks, Pulse check, Weakness scan |
| Question practice | Question set (on the test-day screen) | Drill set, block |
| After-question help | Coach explainer | Rationale, solution |
| PAT trainers | Keyholes, Top-Front-End, Angle Ranking, Hole Punching, Cube Counting, Pattern Folding (the method as subtitle) | Aperture Trainer, Stay 2D, Thomas order (rename to "Angles-first order") |
| QR widgets | Skill tools, named by skill (Successive percents, Fractions: add and subtract) | agent-0X paths, file-name titles |
| One-pagers | Canon sheets | Cheat Sheet Hub, trick library "All sections" |
| Casper | Beyond the DAT: Casper practice | Casper Practice Console as a DAT tool |
| Page titles | `<Name> \| Ace Labs` (ASCII bar) | middle dot and slash variants |

### What gets hidden or redirected (from the inventory statuses)

Totals: 85 ready, 76 rough, 71 internal, 8 legacy, 1 broken. Every rule below is a forced 301 in `netlify.toml`, the same pattern used today for `/docs`, `/specs` and `/research`.

**Internal (71): redirect, students never reach them.**

- All raw Markdown under `tools/` (27 QR and RC docs, `tools/gc/*.md`, `tools/ochem/**/*.md`), plus `tools/qr/research/`, `tools/rc/verification/` and `tools/rc/scripts/`.
- Every TikTok and voiceover studio: `tools/gc/tiktoks/` (index, scripts, voiceover studio), `tools/qr/tiktoks/` (library, studio, 10 canvases), `tricks/series/voiceover-studio.html`, `tricks/videos/voiceover-studio.html`, `tools/bio/sliding-filament-tiktok.html`.
- Dev harnesses: `tools/ochem/roots/dev.html`, `tools/ochem/tree/dev.html`, `tools/ochem/tree/smiles.html`.
- Test and QA files: `tests/{bio,pat,shell,ochem2026,qr-formats}/*` (only the subfolders, never `/tests/` itself; the OChem 2026 gallery prints answer keys), `tools/mock/verification/*`, `tools/minitests/source/*`, `tools/minitests/assemble-minitests.mjs`, `/scripts/*`, `tools/*/audio/*.mjs`.
- The Sarah proposal mocks (`tools/qr/proposals/agent-10-sarah/`, fake student data), `booster-map.html` (names a competitor) and `/test-screenshots/`.
- The root and `docs/` Markdown files are already redirected; keep them that way.

**Legacy (8): delete the files and keep the redirects.**

- `mocks-catalog.html` to `/tests/`; `unified-mock.html` to the Sciences + QR tests; `calendar.html` to Test-week mode.
- `/retold/` to `/learn/`, after repointing every Retold title link, the 404 page and the Climb fallback.
- `tricks/series/` to the Tricks gallery, after repointing the sheets link.
- `tools/ochem/v2/` and its EAS TikTok to The Tree of Organic. Remove the "Classic course engine" chips first.

**Broken (1).** `tools/qr/tiktoks/topic-tiktok.html`: remove the Watch button from every QR skill-tree module, then redirect the page.

**Rough, but hidden until fixed.**

- `tools/bio/bio-calendar.html`: its pacing folds into Today's plan.
- `tools/bio/bio-analytics.html`: folds into Review > Results.
- The Friday mini-mock: it says "placeholder-grade beta".
- The five agent-07 decoders: hidden until step 2 has tap-to-place.
- `/tricks/` for enrolled students: the email-capture page stays at a marketing URL.
- `/games/play.html` with no subject.
- `guides/pat-grids.html`: link the PDF instead.

**Rough, kept with their listed fixes.** The other rough pages stay reachable and are fixed engine by engine; see (f). Each fix is already itemized in INVENTORY.md.

### First-run path for a new student

1. **The first 10 seconds: play before any form.** Today opens with a short welcome line ("Welcome to Ace Labs. Before anything, call this one.") and the universal starter, Call it first: Tonicity, live on real red cells. There is no setup wall. Everyone has met osmosis, so it is the fairest first call.
2. **The first card.** The loop ends with an Ace Card flying into Review (signature moment 2). The badge does not count up, because the card is due tomorrow. Instead, a toast explains: "Card saved to Review. Back tomorrow, Saturday."
3. **Three questions so the plan is yours,** asked in the coach band, not on a separate page:
   - test date (a date picker);
   - shakiest sections (six chips, now including PAT and RC);
   - how much time on a normal day (30, 60 or 90 min).

   A retaker branch ("Going again") also asks for real section scores. This replaces `onboarding.html`.
4. **The plan builds itself in front of them** (signature moment 3). Today's remaining steps appear one by one:
   - Learn: Bio, Retold night 1 (or the first night of the shakiest section);
   - Call it first: Hole punching, a taste of PAT;
   - Tomorrow: The diagnostic, about 45 minutes, on the test-day screen.

   The existing rule that the first long test waits a day stays.
5. **Day 2 onward:** the plan is built from the diagnostic's misses, the Review ladder and the test date. Portal students also see the coach's weekly note.

### The living plan: `AceProgress.today()` v2

The planner keeps its contract (a finite list of tasks; local data first; the coach plan wins when present) and gains a few fields:

- `kind` gains `play` and `set` alongside `review`, `climb`, `learn` and `test`.
- Each task gains a `say` field (the coach line), a `source` field (`misses`, `ladder`, `coach`, `date`) and `minutes`.
- Every task names the card or result it produces.

Planning rules:

- **Step 1 is always playable in under 3 minutes:** the top miss that has a Call it first, else the first due card.
- **At most 4 steps,** sized to the student's daily minutes.
- **A Needs review on a play step re-plans:** that topic comes back tomorrow as a fresh question.
- **From 14 days out, test-week mode takes over:** lighter days, one timed section a day, no new nights.

**The coach voice is a template library Thomas writes once.** Examples: "{Topic} cost you {n} on the diagnostic. Call this one first." and "Two PAT sections a week until your first full-length."

**The source line is always honest:**

- an auto-built line says "From your diagnostic and your Dec 12 test date";
- a portal note is quoted and signed "Thomas, Sunday's weekly plan".

Ace Labs never presents a generated sentence as something Thomas personally wrote.

---

## (b) Visual system

### Tokens: evolve `al-tokens.css`, do not replace it

`mock/assets/tokens.css` is the proposed `shared/al-tokens.css`. It keeps every brand value and adds structure:

- **Ramps:** forest 950 to 100 (brand forest #1B3A2D at 700), gold 800 to 100 (brand #C9A84C at 500, with #7a6128 for small gold text on paper), paper 50 to 400 (#fffdf7 raised, #f5f0e8 page), ink 900, 700 and 500.
- **Feedback** stays Wong/Okabe-Ito. Green #009E73 and vermilion #D55E00 are for fills and rings. White text sits only on the deep fills (#007a59 and #b34e00), and text on paper uses the ink variants (#00694d and #9b4500).
- **Section identity colors.** These are swatches and rails only, always paired with the section's name and never used as feedback: Bio #3e8e5e, GChem #3b6fb6, OChem #7d5ba6, PAT #b7791f, RC #1f8a8a, QR #b4546e. Lighter variants apply in dark mode. They replace both the Tailwind-bright set in `ace-pages.css` and the muted set in `full.css`.
- **Semantic roles** that components use: `--surface`, `--surface-raised`, `--surface-sunken`, `--surface-coach`, `--on-coach*`, `--text`, `--text-2`, `--text-3`, `--line*`, `--primary`, `--accent*`, `--good*`, `--review*`, `--focus`, `--nav-bg`, `--shadow-1` to `--shadow-3`.
- **Two fixed palettes that never theme:**
  - the exam screen: bar #086894 and #054766, white card, ink #1a1d20, Arial;
  - the specimen: microscope surround #141714, PAT paper white on table #e9e5db.

  A microscope field or a PAT figure looks the same in light and dark mode, because the real thing does not change color.
- **Bridges:** the old `--al-*` names point at the new roles, so the four engines keep working while they migrate.

### One dark-mode approach

There is one mechanism: the OS preference (`prefers-color-scheme: dark`), overridable with `<html data-theme="light|dark">`, set from a Settings item (Auto, Light, Dark) and kept in `localStorage`. The overrides live in a single block of role values. Only roles change; components never ask which theme is on. The three engine-local dark modes (`body[data-theme]` in GC and QR, `html[data-theme]` in OChem) are deleted as each engine adopts the tokens. Bio, which never had one, gets it for free. Dark Today is captured in `shots/today-390x844-dark.png` and `shots/today-1280x800-dark.png`.

### Contrast, measured (WCAG ratio)

| Pair | Ratio |
|---|---|
| ink-900 on page paper | 14.97 |
| ink-500 (secondary text) on page paper | 5.57 |
| gold-700 small text on raised paper | 5.79 |
| Confirmed ink on paper / Needs review ink on paper | 6.60 / 6.36 |
| white on Confirmed fill / white on Needs review fill | 5.35 / 5.24 |
| paper on forest; gold-300 on forest; muted coach text (62%) on forest | 10.96; 7.62; 5.25 |
| white on exam bar | 6.14 |
| dark mode: muted text on raised; gold-300; Confirmed ink; Needs review ink | 5.96; 9.95; 7.58; 7.73 |
| feedback rings vs white (non-text, needs 3:1): green / vermilion | 3.42 / 3.87 |

### Type

Three families, self-hosted in `shared/fonts/` (latin subset, `font-display: swap`; preload DM Sans normal and Playfair italic only):

- **Playfair Display** for display and for the coach's voice. Coach lines are always Playfair italic 600, which is how a student learns to hear the coach.
- **DM Sans** for everything a student reads and taps.
- **JetBrains Mono** for labels and kickers, uppercase with +0.1em tracking, and never for sentences.
- **Arial** only inside the test-day screen.

The shell's current Georgia plus Hanken Grotesk (matched to the portal's Visual Canon) moves to Playfair plus DM Sans. If Thomas wants the portal to match, the portal follows the same tokens.

| Token | Size / line height | Use |
|---|---|---|
| `--fs-h1` | clamp(34px, 6vw, 54px) / 1.12, Playfair 700, `text-wrap: balance` | Door and section titles; one italic gold phrase allowed |
| `--fs-h2` | clamp(26px, 3.6vw, 34px) | Block heads |
| `--fs-h3` | 23px Playfair | Card titles inside the coach layer |
| `--fs-coach` | clamp(21px, 2.6vw, 26px) Playfair italic 600 | The coach line, "the move to keep", hooks ("Water chases solute.") |
| `--fs-title` | 19px DM Sans 680 | Tool card titles, step titles, play questions (18 to 21px) |
| `--fs-body` | 16px (16.5px desktop) / 1.55 | Everything else |
| `--fs-small` | 14px | Meta, captions |
| `--fs-label` | 11.5px JetBrains Mono 600, uppercase | Kickers: STEP 1, CALL IT FIRST, THE PICTURE |

### Space, shape, elevation

- **Spacing:** 4px base (4, 8, 12, 16, 24, 32, 48, 64). The page gutter is 16px on phones, 24px on tablets and 32px on desktop. The page max width is 1180px.
- **Radii:** 8 (small controls), 12 (options, rows), 18 (cards), 26 (play panels and coach cards), pill (buttons, chips).
- **Elevation:** three shadows. Play panels sit on `--shadow-2`; a card in flight uses `--shadow-3`.
- **Targets:** 44px minimum everywhere. In the mocks, options are 46 to 58px, PAT grid cells about 62px and tab-bar doors 78 x 64px.

### The component set (all in `mock/assets/kit.css`)

| Component | Anatomy | Where |
|---|---|---|
| **Nav** (`.ace-nav`) | Brand, five doors with 24px line icons, Review due badge. Phone: fixed bottom tab bar, gold top tick on the current door. Desktop: top bar, gold underline. | Every student page, rendered by `ace-shell.js` |
| **Coach band** (`.coach-band`, `.coach-line`, `.coach-sign`, `.coach-note`) | Forest surface with a faint notebook grid; Playfair italic coach line with a gold emphasis; honest source line; quoted coach note signed in mono | Top of Today, every door and section page |
| **Door header** (`.door-head`) | Crumbs, h1 with one italic gold phrase, one sentence, optional plan chip ("Today, step 4 of 4") | Doors, section pages, play pages |
| **Plan rail and plan line** (`.plan`, `.plan-line`) | Desktop: numbered nodes (now = gold fill, done = gold ring with a check), title, section swatch, minutes. Phone: four ticks plus "Step 1 of 4, about 29 min" | Today |
| **Play panel** (`.play`) | Head (kicker, section chip, minutes) / question / stage (specimen) / options / verdict / scrubber / actions / loop strip. Desktop: stage left, conversation right | Today, section pages, every Call it first |
| **Options** (`.opt`) | Letter disc plus text; pressed = forest; after the verdict, the key = green fill disc plus "The answer" tag, your pick = vermilion plus "Your call", the rest dimmed | Play panels, recognition sets |
| **Verdict** (`.verdict`, `.pill`) | Pill (Confirmed / Needs review / "Shown without a call"), the hook in Playfair italic, why, "Why B tempts you" with a vermilion rule | Every loop and explainer |
| **Scrubber** (`.scrub`) | Labeled range ("Now you drive: solute outside the cells"), named ticks at the ends and middle, live readout, and an honesty note where physics is one-way ("Each position is a fresh slide. Burst cells never re-form.") | Drive beat of every loop |
| **Loop strip** (`.loop`) | Call, Watch, Drive, Recall, Card, with the current beat in gold | Every Call it first |
| **Ace Card** (`.ace-card`) | Picture of the exact frame the student saw (specimen crop or PAT sheet), front (the question), back (the answer line), the 1, 3, 7 ladder with the next return in words ("Back tomorrow") | Made at the end of every loop; flies to Review |
| **Card stack** (`.stack`) | Three offset cards; tap to flip | Today step 2, Review |
| **Tool card** (`.tool`) | Optional thumbnail (drawn, never a placeholder), kicker, title, one sentence, mono meta, a "go" word. Rail variant for section identity | Doors, section lanes |
| **Section switcher** (`.sec-switch`) | Six pills with swatches, test-day order, horizontal scroll with snap on phones, current = raised paper | Section pages, Learn, question-set picker |
| **Lane** | Mono number (01 to 05), Playfair title, one sentence | Section front pages |
| **Question screen** | Exam top bar, tools strip, exam card, exam options, exam footer, coach explainer (see e) | `question.html` |
| **Toast** | Forest pill above the tab bar, `role=status` | Card saved, step done |

### Iconography without emoji

- The five door icons are drawn as 24px inline SVG line icons with a 1.8 stroke and round caps: Today is a plan list, Learn an open book, Practice a flask, Tests a clipboard and Review a card stack.
- Sections are identified by rounded color swatches plus their names, not by icons.
- Verdict pills draw a check stroke or an exclamation stroke in SVG.
- Thumbnails are small line drawings in the section color (a cell, a helix, an action-potential trace, a cladogram, cleavage stages, an S-curve; a flask; a hexagon ring; a folded square; paragraph lines; a rising chart).
- No glyph characters are used as icons, arrows or separators.

---

## (c) Motion and play

### The motion language

Motion is allowed only when it **explains** (the subject changes the way the science says it does) or **gives feedback** (where your action went). It must also respect `prefers-reduced-motion`.

| Token | Duration | Easing | Used for |
|---|---|---|---|
| `--t-tap` | 120ms | ease-out | Press feedback on buttons and options |
| `--t-ui` | 200ms | ease-out | A choice becomes pressed; verdict colors; a call ring snaps in |
| `--t-panel` | 320ms | ease-out | The explainer panel slides in; the plan rail reorders; the toast |
| `--t-explain` | 700 to 1000ms per frame | ease-process (cubic in-out) | One step of a process: a fold, an unfold, ions splitting |
| Watch beat | 2.5 to 3.5s total | ease-process | The full Watch, e.g. red cells from isotonic to burst in 3.4s |
| `--t-card` | 760ms | custom (.5, 0, .3, 1), with a small settle on the badge | The Ace Card's flight to Review |

What moves, and why:

| Moves | Why it is allowed |
|---|---|
| The specimen (cells swell, filaments slide, paper folds) | It is the lesson: the student sees the mechanism happen |
| The student's own objects (their call rings, their card) | Feedback: what they did and where it went |
| The plan rail (steps reorder; a node fills) | Feedback: the plan changed because of what they did, with a coach sentence saying why |
| Panels (explainer slide-in, toast) | Orientation: where new information appeared |

Never moves:

- ambient loops, confetti, parallax or count-up numbers;
- pulsing timers, including inside timed mocks (the timer may change color under 5 minutes and nothing else);
- auto-advancing carousels;
- anything celebrating volume.

**Every process animation is also a scrubber.** Watch plays once, then Drive hands the same process to the student's thumb. So no animation is ever the only way to see a state.

**Reduced motion:**

- tweens jump to their end state;
- process animations become still panels drawn the way the DAT draws them (`shots/pat-holepunch-390-reduced-motion.png`: Fold 1, Fold 2, Punch);
- the card skips its flight and keeps its toast;
- scrubbers still work, because dragging is direct manipulation, not motion.

### The interactive patterns students learn by playing

1. **Call it first** (predict, then reveal). This is the backbone loop, with five beats:
   - **Call:** one tap on a prediction before anything moves. Skip is always there ("Skip the call, just show me"), and a skipped call is shown as "Shown without a call", never as a miss.
   - **Watch:** the real thing runs, and the stage caption narrates each frame.
   - **Drive:** the student takes the scrubber.
   - **Recall:** one more question from memory, closed book, and the picture appears only after the answer.
   - **Card:** an Ace Card with the frame they saw.
   - No timer, no points, no confidence gate. Data shape: the existing `BIO_STICK_ENTRIES` schema (predict, frames, check, traps, why, hook, answer).
2. **Drag and manipulate.** The student moves the thing itself, not a form field: solute concentration, fraction bars, probability-tree branches, a triangle's vertices, a Lewis structure's electron pairs. Every drag has a tap alternative: tap a target, then tap where it goes. This is required, because the agent-07 decoders are hidden today for lacking it.
3. **Scrub a process.** A labeled timeline under any process (Krebs, the cross-bridge cycle, the unfold, a titration, rate-time distance, the menstrual cycle). Ends and midpoints are named, and the readout names the current state.
4. **Compare views.** Two pictures of one thing: schematic vs true-to-life, before vs after, and in every explainer "See each choice", which renders what each answer choice would look like if it were true (`shots/question-390-explainer-compare.png`: choice D drawn as the 150 mOsm slide it implies).
5. **Recognition sets ("Which one is this?").** Varied, uncaptioned, realistic fields; name the state; the caption appears after the answer, and a miss becomes a card. Captions are cropped out by the viewBox, so the picture never gives the answer away.
6. **Build it.** Assemble a structure in checked stages, as the Lewis Sandbox and the decoders already do, with tap-to-place.

### How each section gets them (real tools, first sets to build)

| Section | Call it first (first three to build) | Drag / scrub | Compare | Which one is this? |
|---|---|---|---|---|
| Biology | Live on 15 visualizers today; re-skin only | Tonicity solute, Krebs scrubber, sarcomere, bone layers | Schematic vs true-to-life on tonicity, sarcomere, bone | Red cell states (mocked); Elodea states; sarcomere bands at rest vs contracted (TEM); mitosis stages; organelles (replacing the 8 line-sketch micrographs); immune cells |
| General Chemistry | Q vs K direction; Le Chatelier shift; titration curve (call the equivalence pH before the titrant flows) | Lewis and VSEPR Sandbox; titration scrubber; gas-law pistons | Phase diagram vs heating curve | Recognition Lab already is one: reaction coordinates, titration curves, phase diagrams, VSEPR shapes |
| Organic Chemistry | Tree modules: call the product before the arrows push; SN1/SN2/E1/E2 from the Two Decisions; Newman (call the most stable) | Chirality Bench 3D turn; chair flips | Wedge-dash vs Fischer | Reagents by role; IR spectra (broad O-H vs sharp C=O); 1H NMR splitting |
| Perceptual Ability | All six types. Hole punching mocked; then cube counting (lift away layers) and pattern folding (fold the net around the anchor face) | Unfold scrubber; net folding; Six Views walk-around | Your call vs the unfolded sheet | Keyholes silhouettes; top-front-end views |
| Reading Comprehension | Call the paragraph: before reading choices, tap where the answer lives; the proof line lights | Highlighter; passage map | Two answer choices against the proof line | Question type: detail, inference, tone, main idea |
| Quantitative Reasoning | Successive percents (call 100 or 96); harmonic mean; at-least-one flip | Fraction bars, balance scale, probability tree, stats-lab dots | The trap setup vs the right setup (the 14 comparators) | Which formula: permutation or combination; AND or OR |

### One shared engine

`tools/bio/bio-stick.js` becomes `shared/ace-play.js`, with section content files beside each engine (`bio-stick-data.js` already is one).

- **Drivers:**
  - `steps`, the current DOM-driving mode for existing visualizers;
  - `tween`, a state function f(t), as with `BioReal.tonicity`, which renders a frame in about 0.1ms, so live scrubbing is cheap on a mid-range Android;
  - `custom`, as with the PAT fold.
- **Cards** go to one deck. Bio cards keep their adapter, and new sections write through `AceProgress` (a `play-cards` miss adapter), so Review, Today and the badge see every card.

---

## (d) Three signature moments (the first minute)

1. **Play before reading (0 to 10 seconds).** Today's first screen, on a phone, without scrolling, shows real red cells under a light microscope and three calls. Tap one, and pure water floods the slide: the discs cup, round up into spheres, then burst into ghosts, while the caption narrates and a badge says "Pure water going in". It is real morphology at 1000x with a 10 um scale bar, rendered by `bio-real.js`, not a cartoon. Screens: `today-390x844.png`, then `today-390-play-1-midmotion.png` and `today-1280-play-1-midmotion.png`.
2. **The card flies home (about 60 seconds).** The student answers one more from memory (Elodea plasmolysis appears only after the answer), then taps Save my card. The card, carrying a crop of the slide they just watched, lifts off and arcs into the Review door. The badge settles once, a toast says when it returns ("Back tomorrow, Saturday"), and the plan line's first tick turns gold. Screens: `today-390-play-5-card-flight.png`, `today-390-play-6-after.png`.
3. **The plan re-plans in front of you.** When a play step ends in Needs review, the plan rail reorders with a 320ms slide and one coach sentence ("Moved hole punching up: you slid the hole instead of mirroring it. One more tomorrow."). The step the student just struggled with does not vanish into a list; the coach visibly answers it. On first run, the same animation builds the plan step by step after the three setup questions. This is specified here and not built in the mocks.

Runner-up, on the question screen: **"See each choice under the microscope"**. A student who picked D taps "D: if it were 150" and sees the swollen cells that D implies, captioned "This solution is not 150". The trap is made visible.

---

## (e) The DAT-style question screen

It is built on the recommendation in `question-system/dat-interface.md`: one player, based on `tools/mock/full.js`, with practice and timed modes on the same screen. Mocked in `question.html`: `shots/question-*.png`.

### The test-day layer (both modes, never themed)

- **Top bar** (#086894):
  - left: "Question 7 of 10" and the set or section name;
  - center (desktop): the form name ("Practice set", "Full-length DAT 1");
  - right: "Time remaining 1:12:40" in timed mode, or an "Untimed practice" pill. The timer never pulses.
- **Tools strip:** Highlight, Cross out, Exhibit (periodic table, Sciences only; the Calculator replaces it in QR). Cross-out is visual only: a struck choice stays selectable.
- **Exam card:** Arial 15.5 to 16px stem, A to E radio rows (PAT keeps 5, 4, 4, 5, 5, 4 options by subtest), a 2px ink frame on desktop and a full-bleed card on phones. No topic, difficulty or subject chips while answering.
- **Footer:** Previous, Mark, Review, Exhibit and Next in the DAT's italic uppercase style, with Alt-letter shortcuts, and End section in timed mode only. Phones show Previous, Mark, Review and Next; Exhibit lives in the tools strip.
- **Review screen:** Review All, Review Marked and Review Incomplete, each a mode that Next and Previous respect, per the gap list in dat-interface.md.
- **RC:** the passage beside the question on desktop, Passage and Question tabs on phones.
- **PAT:** black-on-white figures as on test day.
- Removed for good: the OChem reagent sheet, the backtick hint line, the X and gear in the header, the pulsing timer.

### The coach layer: practice mode only

- **Check** is the one gold button in the footer. It does not exist on test day, which is the point.
- **After Check,** the exam card is marked in place: the key gets a green ring and "The answer", the pick gets a vermilion ring and "Your pick". The **coach explainer** then appears:
  - **phones:** directly below the question, under a gold rule, in the same scroll, so the stem stays one swipe away;
  - **desktop:** as a 400 to 470px panel on the right (a 320ms slide), with the question still visible on the left.
- **Timed mode** shows nothing from the coach layer until the section ends. Then the Review screen opens the same explainer per item.

### Explainer slots, in order (a frame for the explainer standard; the slot names can follow explainer-standard.md when it lands)

1. **Verdict:** a Confirmed or Needs review pill, then "The answer is A. You picked D." Never a score.
2. **One line** in Playfair: the whole answer in one sentence.
3. **The picture:** rendered, never a static image, and interactive where it teaches. It has a Replay, and Compare (see each choice) where the choices describe different states.
4. **Why:** the bank's explanation.
5. **Every choice:** one line per option, the key marked "The answer" and the student's pick marked "Your pick". These come from the bank's `traps` array. In the four full-length forms, all 560 Sciences and QR items carry a `why`, and 366 of them already carry one note per distractor.
6. **The move to keep:** one sentence on a forest card (for example, "Multiply molarity by the ions a salt releases before you compare anything.").
7. **Go deeper, if you want:** the Canon sheet, the Retold night and the Call it first for the topic.
8. **Card note:** "Ace Card made. This one comes back tomorrow, as a fresh question."

### The visual for every question, by section

| Section | The picture | Built from |
|---|---|---|
| Biology | True-to-life view plus a mechanism diagram (the mock: an ion-count picture where six NaCl units split into twelve ions, then the slide each choice implies) | `bio-real.js`, `bio-bone.js`, hub visualizers |
| General Chemistry | Particle, energy or curve diagram drawn from the item's numbers (ICE table bars, titration curve with the asked point, Q vs K arrow) | Recognition Lab renderers, new small SVG kit |
| Organic Chemistry | The structures, drawn with SmilesDrawer (fix the canvas-selector bug in `prometric-mock.html`), with the mechanism arrows or the decisive group circled | OChem bank SMILES, Tree modules |
| Perceptual Ability | The figure, with a replay of the fold, unfold or rotation that settles it | `tools/pat/engine` |
| Reading Comprehension | The passage with the proof line highlighted and the paragraph map | `tools/rc/rc.js` proof lines |
| Quantitative Reasoning | The number line, bar model, multiplier chain or probability tree the problem reduces to | QR skill-tool renderers |

**Data contract per item:** `{ q, opts, correct, why, traps[], one, move, visual: { kind, params }, links: { canon, night, play } }`. `one`, `move` and `visual` are new; the rest already exist in the full-length bank.

**Scale of the work:** the census counts 12,381 served records, about 1 in 6 with a detailed per-choice explainer and 1 in 4 with any visual. Order of fill:

1. full-length DAT 1 to 4 (194 items still need per-distractor notes);
2. the diagnostic;
3. question sets by topic;
4. the Climb.

---

## (f) Migration: 241 pages to one feel, with the least risk

Principles:

- **Tokens and the shell first, engine internals last or never.** The shell already renders in a shadow root, so it cannot break a page and no page can break it.
- **Each engine adopts the tokens through a small "skin" file** that maps its local names (`--paper`, `--white`, `--gold`) onto the v2 roles and hides coach-only controls. No engine's JavaScript is rewritten to change its look.
- **Every phase ships behind a check** that already exists or is cheap:
  - `npm test`;
  - a copy gate (plain ASCII, no em dashes, none of the three banned words, no competitor names, no payment words) run over student-facing files;
  - a 390px horizontal-overflow audit;
  - 390 and 1280 screenshots of every page the phase touched, compared to the last release.

| Phase | What ships | Pages reached | Risk control |
|---|---|---|---|
| 0. Foundations | Tokens v2 in `shared/al-tokens.css` (with `--al-*` bridges); self-hosted fonts; `shared/ace-kit.css`; shell v2 (five doors, Canon inside Learn, bottom tab bar on phones); the redirects in (a) | All 241: the nav and fonts; 80 pages leave the student tree | The tab bar honors `data-ace-shell-pos="top"` for any page with its own fixed bottom bar until that page is skinned; bridges keep old names working; redirects are reversible |
| 1. The doors | Today rebuilt on the kit (plan v2, first-run inside Today, so `onboarding.html` retires); Learn, Practice, Tests and Review on the kit; the six section front pages | 11 pages that every student sees first | Data APIs unchanged (`AceProgress`, `AceIndex`); old Today behind `?classic=1` for a release |
| 2. One question player | `full.js` becomes the player: practice mode with Check and the coach explainer, highlighter and cross-out from `rc.js`, Review modes, one calculator, one periodic table. Point the Sciences + QR tests, the diagnostic, the Bio check, the Climb and the Summit at it | 6 test surfaces plus every question set | Built and verified by the parallel question-system effort; items untouched; each form switched one at a time |
| 3. One play engine | `shared/ace-play.js` from `bio-stick.js`; Bio's 15 re-skinned; PAT six types; QR traps; then GChem, OChem, RC | Every play surface | Bio's engine already passes `tests/bio/bio-stick.test.js`; new sets ship as data files with the same validator |
| 4. Engine skins | One skin per engine, in order of student traffic and visible damage: Bio hubs (sidebar to drawer; hide Coach mode, Restart and the floating C; plain hub names), PAT Studio (one theme; hide seeds and CSV), QR skill tree (no tour modal, no AGENT tags, no Watch), GChem skill tree (one setup step, no scroll jump, hide Edit Mode), RC player (next-up and done marks), Retold courses (shell plus tokens; Teach mode behind `?coach=1`) | The remaining rough pages | One engine per release; screenshot diff per page; the fix lists already exist in INVENTORY.md |
| 5. Content fill | The explainer and visual standard across banks (see e), PAT Retold night 7 corrected, Retold narration or "silent" labels, trick video voiceover | Content, not chrome | Content passes the existing gates (blind re-solve, key bias rules) |

**Leave alone** (they already feel right, or the cost is all risk):

- **Engine internals:** the internals of The Roots, The Tree and The Summit (ready, consistent, already cross-linked); the RC player's reading engine; the full-length mock's test-day screens (only add tools); the PAT test engine.
- **Courses and reference:** the Retold course engines and their scenes (shell and tokens only); the Canon on the portal (it becomes Learn's sheet source, not a rebuild).
- **Casper practice:** the most finished console; only the shared nav and the "Beyond the DAT" placement change.
- **Production material:** the TikTok canvases and voiceover studios (hide them, do not fix them).

### Performance on a mid-range Android

- **Today loads no question bank.** Today's 1 MB-class banks stay behind their own doors.
- **One shared script** (`ace-play.js`) plus the section's data file per play panel. Vendored libraries only (three.js and anime.js stay where they already are; none is needed for the play loop).
- **Fonts:** five latin-subset WOFF2 files, two preloaded.
- **Specimen frames are SVG strings built in under 0.2ms.** The fold uses CSS transforms only (compositor-friendly).

### Accessibility checklist the kit enforces

- 4.5:1 text contrast (measured above) and 44px targets.
- A visible 3px focus ring (blue on paper, gold on forest).
- **Keyboard:** options are buttons, the PAT call grid is a group of toggle buttons with row and column labels, scrubbers are native range inputs (arrow keys), and the exam keeps its Alt shortcuts.
- **Screen readers:** each stage has an `aria-label` that updates with the state ("Light microscope, red blood cells. Hypotonic: water in, swelling."), verdicts sit in `aria-live` regions, the badge has a spoken count and toasts use `role=status`.
- Reduced motion as in (c).
- Color never carries meaning alone: every verdict has a word, and every section swatch has a name.

### Decisions for Thomas

1. **Canon as a door or inside Learn.** This spec recommends inside Learn, for the reasons in (a).
2. **Bottom tab bar on phones.** Recommended; per-page opt-out during migration.
3. **Fonts.** Move the shell from Georgia and Hanken Grotesk to Playfair Display and DM Sans, and have the portal's Visual Canon follow.
4. **QR geometry and trigonometry.** The QR skill tree says they are not on the current DAT, but QR, Retold teaches them. This decides whether the geometry skill tools appear on the QR front page.
5. **Coach voice library.** Thomas writes the template lines once (about 40), so every auto-built plan sounds like him without pretending he wrote it that morning.
