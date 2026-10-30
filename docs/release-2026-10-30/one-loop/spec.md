# One Ace Labs: the final design

The one design for releasing Ace Labs to students as one tool with one feel.
Written 2026-10-30 for Thomas. It is the One Loop direction, which all three
judges ranked first (student 8.5, learning 8.5, build 8.0), with the best of
Coach Plan and The Lab grafted in and every judge must-fix resolved
(section 11 is the ledger).

- Mockups: `mock/` (open `mock/index.html`; serve the folder, e.g. port 4460).
- Screenshots: `shots/` (every page at 390 x 844 and 1280 x 800, full pages,
  play sequences, dark mode, reduced motion, timed mode).
- Harness: `scripts/shoot.cjs` (all shots), `scripts/peek.cjs` (one shot).
- Build plan: `build-plan.md` (ordered batches for parallel worktrees).

Everything in the mocks is real Ace Labs material: the Tonicity and sarcomere
Call it first entries (`tools/bio/bio-stick-data.js`), the true-to-life
renderers (`tools/bio/bio-real.js`, unchanged), the Climb Hardy-Weinberg item,
Full-length DAT 4 item `written:bio-3-1rvt47w`, the PAT engine's hole-punch
geometry, the GChem skill tree's acid-base content, the Retold night titles
and Canon sheet list from `shared/ace-index.js`, and the periodic table from
`tools/mock/full.js`.

---

## 0. The idea

Ace Labs already has the best learning loop in DAT prep: **Call it first**.
Predict before the picture moves, watch the real thing, drive it yourself,
answer one more from memory, and keep an **Ace Card** that comes back on a
1, 3, 7 day ladder. One Ace Labs makes that loop the whole product.

- Every idea goes **Predict, Play, Prove, Keep**. The band on every bench
  shows those four stages; every tool card shows which of them it runs.
- **Today** opens with a coach line in Thomas's voice (with an honest source
  line) and step 1 already live: real red cells under a microscope, three
  calls, no reading first.
- Every question looks like the DAT. The test-day screen is identical in
  practice and in timed tests; practice adds one gold **Check** button, and
  the explainer, with a picture that places every choice, opens beside it.
- Progress is ideas moving around a loop and cards climbing a ladder, never
  points, streaks, scores or countdowns. Misses become cards automatically
  and come back as fresh questions.

Three surfaces never mix, and students learn them in a day:

| Surface | Look | Job |
|---|---|---|
| Paper | `#f5f0e8` page, `#fffdf7` panels, DM Sans | Reading, lists, door pages |
| Bench | Deep forest `#0c1d15` with a lamp glow, gold controls | Anything that moves: Call it first, sets, the coach band, the nav |
| Test day | Blue bars `#086894`, white card, Arial | Every DAT-style question, practice or timed. Never themed |

Specimens (micrographs, PAT figures, Ace Card pictures) sit on all three and
never invert. The student shorthand: **anything gold is your coach or your
next move; anything blue and white is test day.**

---

## 1. Information architecture

### 1.1 Five doors

| Door | Path | Loop stage | Icon (24 px line) |
|---|---|---|---|
| Today | `/` (ace-labs.html) | the hub | a sunrise over a horizon line (never a clock) |
| Learn | `/learn/` | Predict: meet an idea; every night opens with a call | an open book |
| Practice | `/practice/` | Play: tools that move when you touch them | a knob with arrows both ways |
| Tests | `/tests/` | Prove: the test-day screen | a sheet with a check |
| Review | `/review/` | Keep: Ace Cards | a card stack |

Door labels are plain words. Stage words (Predict, Play, Prove, Keep) live
on the bench band and the tool-card pips, never in door names or headers.

**Canon stops being a door.** It is the only door that leaves the app (a new
tab on the portal), it is reference rather than a step, and six doors force
12.5 px labels at 390 px. The Canon becomes **Sheets**, a shelf inside Learn
(`/learn/#sheets`), and every Ace Card, explainer, Retold night and tool links
its sheet ("Sheet"). Fallback if Thomas wants it on top: a desktop-only
"Sheets" text link after Review, outside the ring, never on the phone bar.

**Where the doors sit.**

- Phone (under 760 px): a fixed **bottom tab bar**, 64 px plus the safe area,
  five equal slots (78 px at 390 px), 22 px icon over a 12 px label. It is in
  thumb reach and always visible, and it is where Ace Cards fly.
- Desktop: a 60 px top bar with the brand on the left and the doors on the
  right.
- The four stage doors (Learn to Review) sit inside a thin gold **ring**. The
  current door is marked three ways: `aria-current="page"`, gold label at
  weight 800, and (desktop) a 6 px gold **bead** under it that travels from
  the previous door in 420 ms, or (phone) a 28 x 3 px gold tick on the top
  edge. Under reduced motion the bead cuts.
- **Review dot**: an 8 px gold dot on the Review icon when cards are due.
  Never a number. The spoken label adds ", 3 cards back today".
- **Player mode**: question sets and timed tests hide the shell entirely; the
  exam bars are the only chrome (as `acelabs.timed` hides it today).
- **Pages with their own fixed bottom UI** set
  `<html data-ace-shell-pos="top">` and keep an in-flow top bar on phones.
  During migration the bottom bar is **opt-in**: the shell draws it only on
  pages that set `data-ace-shell-pos="bottom"` (the door pages, the section
  pages and each engine as its skin lands). When every engine is skinned the
  default flips to bottom.

### 1.2 What sits behind each door, in order

**Today** (`/`)

1. **Coach band** (forest): the date and a test-day date chip ("Test day Sat,
   Dec 12", never "N days"), one coach line in Playfair italic, an honest
   source line, and the plan line ("Step 1 of 4: Call it first" with four
   ticks). On desktop the newest portal note sits on the right, quoted and
   signed ("Thomas, Sunday's weekly plan").
2. **Step 1, live**: a Call it first bench, playable before anything is read.
   Chosen in this order: the topic of a card due today that has a Call it
   first entry; else the weakest section's next unseen call; first visit:
   Tonicity.
3. **Today's plan**: at most 4 steps on a rail, each naming its door, its
   section swatch and its minutes. Under it, a "Moved to tomorrow" note when
   the plan changed.
4. **The way back**: the ladder (Back today, Tomorrow, In 3 days, In 7 days,
   Kept, each with a quiet "N cards") and the cards due today.
5. **The six sections** in test-day order, each with its next step and its
   card count, linking to the section page.
6. **Your next test** (Full-length DAT 1 to 4 recommended in order), with a
   suggested date, never a countdown.
7. Footer: About Ace Labs, **Settings** (`/settings/`: theme Auto, Light or
   Dark; test date; shakiest sections; daily minutes; Going again scores;
   Restart my cards with a two-step confirm), and "Ace Labs is not
   affiliated with the ADA or Prometric."

Removed from Today: the five catalogue rooms and hard-coded jump chips, the
"DAT in N days" pill, the "Right answers so far" readiness bars (raw counts
move to Tests > Your results), the "Mnemon, coming soon" tile, any day
counter ("Day 9"), and the public "Talk to a coach" link for enrolled
students (portal students get "Message your coach").

**Learn** (`/learn/`)

1. **Continue**: the next night, on a small forest card, with its opening call
   quoted ("It opens with a call: squeeze the box...").
2. **Retold**: the six courses in test-day order (Bio, GChem, OChem, PAT, RC,
   QR), each with its next night and "N of 14 nights walked".
3. **Foundations**: The Roots of Organic, The Two Decisions, PAT at a glance.
4. **Sheets** (`#sheets`): Canon sheets by section (Biology 17, GChem 13,
   OChem 8, PAT/QR/RC 18), Bio Repair Sheet and Bonus Topics, A and P review,
   Grids and T-charts (PDF).
5. **The 14 Chem Tricks**: one row per trick with Short, Video and Sheet.

Every Retold night opens with a call (the same predict panel) and ends with
three links: Play this (the matching tool, at the matching state), Sheet, and
Prove it (a matching question set).

**Practice** (`/practice/`)

1. **Picked for you**: three cards from today's plan, each with a one-line
   reason in the coach's italic ("Osmosis showed up in your diagnostic.").
2. **Section switcher** (sticky): All sections, Bio, GChem, OChem, PAT, RC, QR.
3. **Call it first, in every section**: a shelf, filtered by the switcher.
4. **The six sections** in test-day order: each section's main tool on a
   bench strip, three tool cards, and a link to its section page.
5. **Question sets** on the test-day screen, untimed, ten questions, from
   banks that meet the explainer standard.
6. **Quick rounds**: untimed, no streaks, no best scores; Six Views, Chirality
   Bench.
7. **Beyond the DAT: Casper practice**, one quiet card.

**Tests** (`/tests/`). Every card carries a status line ("Taken Oct 24",
"Queue: 5 ideas due", "Test 2 of 3 next").

1. **Start here**: The diagnostic, "about 45 minutes ... a map of where to
   start, not a score", untimed.
2. **Every day**: The Climb (the Queue of fresh questions on your misses, then
   Rung 1 to Rung 10), untimed by default.
3. **Full-length DAT 1 to 4**: the hero card, on the white test-day look, with
   a suggested date for the next one.
4. **Section tests**: Sciences + QR tests 1 to 3, PAT tests, Reading sections,
   The Summit, Bio check (Short or Full), QR Test-Day Simulation.
5. **Test week**: Test-week mode (with its start date) and the Test-day
   briefing.
6. **Your results** (`#results`, was Performance): every test as raw counts
   per part ("Bio 14 of 20"), neutral color, plus "N cards made".

**Review** (`/review/`)

1. **Back today**: one card at a time on a bench. Each card comes back as a
   **fresh question on the same idea** (a new field, a new sheet, a new
   number), its own picture veiled until the answer. Confirmed moves it up a
   rung; Needs review brings it back tomorrow. The card flies to its rung.
2. **The ladder**, with quiet counts.
3. **Your cards**, filterable by section; each links around the loop (Play it,
   its night, its Sheet). Cards with no fresh question yet (a note the
   student wrote) fall back to Got it / Not yet.
4. **Reference**: Common Traps (GChem), Bio Repair Sheet.

### 1.3 Section pages: one template, six pages

New thin pages at `/bio/`, `/gchem/`, `/ochem/`, `/pat/`, `/rc/`, `/qr/`. They
only link into engines; the shell lights Practice. Same order everywhere:

1. Header: kicker ("Section 1 of 6 / questions 1 to 40 of the sciences"), the
   section name with its icon, one line, the identity reframe from
   ANXIETY_AWARE_DESIGN.md as a quote, and the section switcher.
2. **Hero bench**: the section's showpiece, playable.
3. **Around the loop**: four tiles (Learn, Practice, Tests, Review) scoped to
   the section; the next one outlined in gold.
4. Lanes, numbered: **01 Play it, 02 Learn it, 03 Practice it, 04 Prove it,
   05 Refreshers.**

| | Biology | General Chemistry | Organic Chemistry | Perceptual Ability | Reading Comprehension | Quantitative Reasoning |
|---|---|---|---|---|---|---|
| Hero | Which one is this? on red cells and Elodea | Titration curves (Call it first) | Chirality Bench (call R or S) | Hole Punching (Call it first) | Find the proof line | Mean or median? (Call it first) |
| 01 Play it | Sarcomere lens; 15 Call it first; Real views (wet-mount red cells, Elodea, sarcomere TEM, long bone) | Titration curves; Lewis and VSEPR Sandbox; Periodic Trends; Recognition Lab | Chirality Bench; Tree modules that predict then draw; Newman | Call it first for all six types, hole punching first; Six Views | Find the proof line; trap-family set | Mean or median?; Probability Sandbox; Stats Lab; fraction bars; balance scale; multiplier chain |
| 02 Learn it | Bio, Retold (14); A and P review | GChem, Retold (14) | OChem, Retold (13); The Roots of Organic; The Two Decisions | PAT, Retold (10); PAT at a glance | RC, Retold (10) | QR, Retold (14) |
| 03 Practice it | Six hubs; question sets; Repair a miss | GChem skill tree; question sets | The Tree of Organic; quick round | PAT trainers, test order | RC passages (45) | QR skill tree (44 skills); Pattern Library |
| 04 Prove it | Bio check: Short (25) or Full (40) | Sciences + QR tests | The Summit | PAT tests | Reading sections | QR Test-Day Simulation |
| 05 Refreshers | Bio Repair Sheet; Bonus Topics; Canon sheets: Biology | Common Traps; Canon sheets: GChem; Chem Tricks | Reaction Map (reference); Chem Tricks; Canon sheets: OChem | Grids and T-charts (PDF); Canon sheets: PAT | Canon sheets: RC | Canon sheets: QR |

`/tools/bio/` (the Bio Repair Lab home) stays as the "Repair a miss" tool
(log a miss, get the repair topic) and loses its home role. `/tools/pat/`
stays as the list of PAT trainers, linked from `/pat/`.

### 1.4 One name per thing

Student-facing names, used everywhere: page titles, the nav, cards, links,
explainers. Page titles are `<Name> | Ace Labs` with an ASCII bar.

| Thing | One name | Retire |
|---|---|---|
| Product | Ace Labs | AceLabs, AceTheDAT Labs, "AceTheDAT.com" in headers |
| Doors | Today, Learn, Practice, Tests, Review | Canon (as a door); Repair, Prove, Play as room names |
| Loop stages (band, pips) | Predict, Play, Prove, Keep | stage names in door headers ("the Play step") |
| The loop | Call it first; its prompts: "Now you drive", "One more, from memory" | stick layer (code only) |
| Saved ideas | Ace Cards | nodes, repair items |
| Ladder rungs | Back today, Tomorrow, In 3 days, In 7 days, Kept | Learning, Reviewing, Mastered |
| Feedback | Confirmed, Needs review; Shown without a call (a Skip) | right, correct, wrong, incorrect, failed, Missed again |
| Choice tags | Answer, Your call (benches), Your pick (question screen) | "Confirmed" on the key when the pick differs |
| Self-grade fallback | Got it, Not yet | |
| True-to-life pictures | Real view | true-to-life view, realistic mode, TEM tab |
| Drawing vs real | Drawing / Real wipe; the lens (Drawing, Lens, Micrograph) | |
| Recognition sets | Which one is this? | Micrograph ID-style practice, flip cards |
| Help when frozen | Stuck? | I need a sec |
| Sections | Biology, General Chemistry, Organic Chemistry, Perceptual Ability, Reading Comprehension, Quantitative Reasoning; short Bio, GChem, OChem, PAT, RC, QR | GC, Gen Chem, Organic, Orgo, Reading, Physiology |
| Section pages | Biology (`/bio/`) ... Quantitative Reasoning (`/qr/`) | Bio Repair Lab (as a home), PAT Studio (as a home) |
| Bio hubs | Cell and Molecular; Genetics; Body Systems; Diversity of Life; Development; Evolution and Ecology | Cell Lab, Cell Atlas, Genetics Studio, Structure & Function, Body Systems Lab, Field Guide, Embryo Atlas, Developmental Biology, Selection Simulator |
| Bio extras | Immune cells (inside Body Systems); Which one is this?: micrographs (inside Cell and Molecular, once rebuilt on real renderers) | Innate vs Adaptive Immunity page title; Micrograph ID-style practice |
| `/tools/bio/` | Repair a miss | Bio Repair Lab, Bio Mastery System |
| Bio checks | Bio check: Short (25); Bio check: Full (40) | Bio Pulse Check, Bio Weakness Scan |
| A&P review | A and P review | A&P 3-Hour Review Session |
| GChem engine | GChem skill tree | Gen Chem engine, GChem engine, Remediation System |
| GChem tools | Lewis and VSEPR Sandbox; Recognition Lab; Periodic Trends; Common Traps; Titration curves | Lewis Sandbox |
| OChem | The Roots of Organic; The Tree of Organic; The Two Decisions; The Summit; Reaction Map (reference); Chirality Bench | Classic course engine (v2), OChem Reaction Maps engine |
| PAT trainers | Keyholes; Top-Front-End; Angle Ranking; Hole Punching; Cube Counting; Pattern Folding (method as subtitle: The silhouette method, Solid means seen, Compare two at a time, Unfold backwards, The T-chart, The anchor face) | Aperture Trainer, Angle Discrimination Trainer, Calibrated Angle Trainer, Stay 2D |
| PAT reference | PAT at a glance; Grids and T-charts (PDF) | The Playbook; the grids HTML page |
| PAT order option | Angles-first order | Thomas order |
| QR engine | QR skill tree; its widgets are Skill tools named by skill | QR engine, Remediation System, agent-0X paths, Tier labels |
| QR skill tools | Decimal places; Estimation; Fractions: add and subtract; Fractions and decimals; Fractions: multiply and divide; Solving linear equations; Mental math; Percent change; Percent of a number; Successive percents; Rate and time; Ratios; Phrase to equation; setups side by side ("At least one", "AND or OR", "Permutations or combinations" ...); Probability Sandbox; Stats Lab; Mean or median? | frac-add, dec-arith, "Fraction <-> Decimal" style titles, "Rate x Time = Distance" glyph titles, Pattern Comparator |
| QR reference | Pattern Library | QR Pattern System v1 |
| RC | RC passages; Reading sections (timed) | Reading, Reading Comprehension engine |
| Courses | Bio, Retold; GChem, Retold; OChem, Retold; PAT, Retold; RC, Retold; QR, Retold; "night N" | the /retold/ hub, "videos" |
| RC night 8 | Trap Answers: How the Traps Are Built | "How Wrong Options Are Built" (banned word) |
| Canon sheet 30 | Thermodynamics: the sign of delta G | the Greek-letter title |
| One-pagers | Sheets; Canon sheets | Cheat Sheet Hub, cheat sheets, trick library "All sections" |
| Tricks | The 14 Chem Tricks (Short, Video, Sheet) | The trick library |
| Question practice | Question sets (on the test-day screen) | drill sets, blocks |
| Timed forms | Full-length DAT 1 to 4; Sciences + QR tests 1 to 3 | Practice tests, Prometric mocks, mock catalog, unified mock |
| Mini tests | The Climb; its Queue; Rung 1 to Rung 10 | The Summit (as rung 10); the Climb's "Today" tab |
| Results | Your results (under Tests) | Performance, Analytics, Readiness |
| Test week | Test-week mode; Test-day briefing | Test Week Calendar, Test-Day Readiness |
| Retakers | Going again | For retakers |
| Quick games | Quick rounds | Game Central |
| Casper | Beyond the DAT: Casper practice | Casper Practice Console (as a DAT tool) |

### 1.5 What is hidden or redirected (from the inventory)

The inventory counts 241 entries (85 ready, 76 rough, 71 internal, 8 legacy,
1 broken). Rules go in `netlify.toml` (mirrored in `_redirects`), forced, so a
file on disk cannot shadow them. Order matters: the existing
`/scripts/ochem-bank-1000.js` 200 rewrite stays above any `/scripts/*` rule.
Coaches who need a hidden studio run the repo locally (`npm run serve`),
where redirects do not apply.

**Sequence (keeps `gate-dead-links` green):** 1) repoint every in-site link to
a retiring page (in the batch that owns the linking file); 2) add the forced
301; 3) delete the file in a later commit. Never delete in the same commit as
the repoint.

**Internal (71): never reachable by students. 301 to the door shown.**

| From | To |
|---|---|
| `/tools/qr/MASTER_GAMEPLAN.md`, `/tools/qr/proposals/agent-0*/INTEGRATION.md`, `/tools/qr/proposals/agent-01-audit/*`, `/tools/qr/proposals/agent-09-diagnostic/*`, `/tools/qr/proposals/sprint-c-beta-audit/*`, `/tools/qr/proposals/agent-10-sarah/*` (fake student data), `/tools/qr/research/*` | `/practice/?sec=qr` |
| `/tools/rc/SCHEMA.md`, `/tools/rc/VERIFICATION.md`, `/tools/rc/verification/*`, `/tools/rc/scripts/*` | `/practice/?sec=rc` |
| `/tools/gc/*.md` (6 files), `/tools/gc/research/*`, `/tools/gc/tiktoks/` (index), `/tools/gc/tiktoks/scripts.html`, `/tools/gc/tiktoks/voiceover-studio.html` | `/gchem/` |
| `/tools/ochem/COACH_GUIDE_README.md`, `/tools/ochem/roots/CONTRACT.md`, `/tools/ochem/tree/CONTRACT.md`, `/tools/ochem/roots/dev.html`, `/tools/ochem/tree/dev.html`, `/tools/ochem/tree/smiles.html` | `/ochem/` |
| `/tools/qr/tiktoks/*` (library, studio, 10 canvases) | `/qr/` |
| `/tricks/series/voiceover-studio.html`, `/tricks/videos/voiceover-studio.html`, `/tricks/series/topic-tiktok.html` | `/learn/` |
| `/tools/bio/sliding-filament-tiktok.html` (repoint the Body Systems hub link first) | `/bio/` |
| `/tests/ochem2026/*` (prints answer keys), `/tests/qr-formats/*`, `/tests/pat/*`, `/tests/bio/*`, `/tests/shell/*` (subfolders only, never `/tests/` itself) | `/tests/` |
| `/tools/mock/verification/*`, `/tools/minitests/source/*`, `/tools/minitests/assemble-minitests.mjs` | `/tests/` |
| `/scripts/*` (after the existing ochem-bank rewrite) | `/` |
| `/booster-map.html` (names a competitor; delete) | `/` |
| `/test-screenshots/*` | `/` |
| Root and `docs/`, `specs/`, `research/` Markdown | `/` (already in place; keep) |

The GChem embed canvases (`buffers-hh`, `gibbs-quadrant`, `ksp-common-ion`,
`lewis-five-steps`, `q-vs-k`, `weak-acid-sqrt`, `topic-tiktok` under
`/tools/gc/tiktoks/`) stay embed-only: reachable inside the skill tree's
Watch modal, never linked as pages.

**Legacy (7 unique pages): redirect, then delete.**

| From | To | Repoint first |
|---|---|---|
| `/tools/ochem/v2/*` | `/tools/ochem/tree/` | the "Classic course engine" chips |
| `/tools/ochem/v2/tiktoks/eas-directors-tiktok.html` | `/tricks/videos/eas-directing.html` | |
| `/tricks/series/` | `/tricks/shorts/` | the link in `tricks/sheets.html` |
| `/mocks-catalog.html`, `/mocks-catalog` | `/tests/` (already) | |
| `/unified-mock.html`, `/unified-mock` | `/tests/` (was `/prometric-mock.html`) | |
| `/calendar.html`, `/calendar` | `/test-week.html` (already) | |
| `/retold/` | `/learn/` | every Retold title link, `404.html`, the Climb fallback |

**Broken (1).** `/tools/qr/tiktoks/topic-tiktok.html`: remove the Watch button
from every QR skill-tree module, then it falls under the `/tools/qr/tiktoks/*`
rule.

**Rough, hidden until fixed.**

| Page | Rule |
|---|---|
| `/tools/bio/bio-calendar.html` (60-day plan, 825 px wide) | 301 to `/` (its pacing is Today's plan) |
| `/tools/bio/bio-analytics.html` | 301 to `/tests/#results` |
| `/tools/qr/proposals/agent-08-pacing/friday-mini-mock.html` ("placeholder-grade beta") | 301 to `/tests/` |
| `/tools/qr/proposals/agent-07-decoder/*` (5 decoders, no tap-to-place) | 301 to `/qr/` until step 2 has tap-to-place |
| `/guides/pat-grids.html` | 301 to `/guides/pat-grids.pdf` |
| `/games/play.html` with no `subject` | the page sends itself to `/games/` (client side) |
| `/tricks/` (email capture) | stays at its marketing URL; no student page links it; Learn links `/tricks/shorts/`, `/tricks/videos/`, `/tricks/sheets.html` |
| `/onboarding.html` | 301 to `/?first=1` once the first run lives in Today |
| QR geometry canvases (`agent-06-geometry/*`) | stay unlinked until Thomas decides geometry and trig |

**Coach-only controls move behind `?coach=1`** (the portal appends it): Coach
mode toggles, Retold Teach mode, GChem Edit Mode, PAT seeds and CSV export,
"For Thomas + Sarah" copy, build counters ("0 / 7 live"), coverage matrices,
AGENT and Tier labels. Restart buttons that wipe Ace Cards move to a Settings
menu with a two-step confirm.

### 1.6 First run for a new student

1. **Second 0.** Today shows the coach band ("Before anything, call this
   one." / "Your first visit. Nothing to set up yet." / "Step 1 of 3: your
   first call") and the bench: sharp red cells at 1000x with a 10 um bar, and
   three calls. No sign-up wall, no welcome copy above the fold.
2. **About a minute.** Call, watch, drive, recall, card. If both calls were
   Confirmed the student may Keep it; a miss makes the card on its own.
3. **Three questions, in the coach band** (not a separate page): test date (a
   date input, stored and shown as a date), shakiest sections (six chips,
   PAT and RC included), minutes on a normal day (30, 60, 90), and a "Going
   again? Add your scores" branch.
4. **The plan builds itself** in front of them, one step every 320 ms: the
   first call (done), the first Retold night of the shakiest section, a Call
   it first taste of PAT, the GChem first night; under it, "Tomorrow,
   Saturday: the diagnostic, about 45 minutes, untimed."
5. **Day 2.** The diagnostic. Its misses become cards. The first long timed
   test still waits a day after it (the existing `today()` rule).
6. **Day 3 onward.** Today opens on the card they made on day 1, as a fresh
   question.

`onboarding.html` retires.

### 1.7 The plan behind Today

`AceProgress.today()` keeps its contract and its tests. A new additive
`AceProgress.todayPlan()` builds on it and returns:

```js
{
  say: 'One call on osmosis first, then your three cards.',   // from the coach line library
  source: { kind: 'auto', text: 'From your diagnostic and your Dec 12 test date.' },
  // or { kind: 'coach', text: '...', sign: "Thomas, Sunday's weekly plan" } quoted verbatim
  steps: [ { kind: 'play'|'review'|'learn'|'set'|'climb'|'test', door: 'practice', section: 'bio',
             title: 'Call it first: Tonicity', detail: '...', minutes: 2, href: '...', makesCard: true } ],
  tomorrow: [ { title, why } ],
  mode: 'normal'|'test-week'
}
```

Rules:

1. Step 1 is always playable in under 3 minutes (rule order in 1.2).
2. At most 4 steps, sized to the student's daily minutes.
3. A **Needs review** on a play step re-plans: one Retold scene for that
   subtopic slides in as step 2, the lowest-priority step moves to "Moved to
   tomorrow", the card is due tomorrow as a fresh question, and the coach
   band says why in one sentence ("Added one scene from night 3: you called
   the salty-water picture for pure water. The Climb moves to tomorrow."),
   with the source line "Changed just now, from your call."
4. From 14 days out, **test-week mode**: lighter days, one timed section a day,
   no new nights.
5. The first long timed test waits a day after the diagnostic.
6. When the portal has a weekly plan (`AceProgress.plan()`), the coach plan
   wins and its note is quoted and signed.

**The coach voice is a template library Thomas writes once**
(`shared/ace-coach-lines.js`, about 40 lines with slots, e.g. "{Topic} first,
then your {n} cards."). An auto-built line always carries an auto source
line; a portal note is quoted verbatim and signed. Ace Labs never presents a
generated sentence as something Thomas wrote that morning. No loss framing
("cost you three") in coach lines.

---

## 2. Visual system

### 2.1 Color rules

- **Gold** means the coach speaking or your next move: the coach line accent,
  the primary bench button, the knob thumb, the current plan step, the bead,
  Check on the question screen. **Gold never marks an outcome**; after a
  reveal, a call in gold becomes "Answer" (green) or "Your call" (vermilion).
- **Wong colors only after an answer**, always with a word and an icon:
  Confirmed (`#009E73` fill and ring, `#007a59` text) and Needs review
  (`#D55E00` fill and ring, `#9b4500` text on paper). On the bench the
  lighter `#3fd2a0` and `#ff8a3d` are used.
- **Section colors are identity, never feedback**: a swatch, a rail, an icon,
  always next to the section name.
- **The test-day screen is never themed**: blue bars, white card, Arial. The
  explainer beside it is paper, also light in every mode.

### 2.2 Tokens (proposed `shared/al-tokens.css?v=3`)

The full file is `mock/assets/tokens.css`. Rules: every name in today's
`al-tokens.css` keeps its exact value; no `--al-*` name is ever themed; all
new names are additive; components read only `--s-*` (paper) and `--b-*`
(bench); dark mode redefines only `--s-*`.

```css
:root{
  /* 0. existing names, exact values, never themed */
  --al-bg:#f5f0e8; --al-paper:#fffdf7; --al-paper-2:#f9f3e6; --al-paper-3:#f3ecdb;
  --al-ink:#0d2018; --al-ink-2:#3a4a42; --al-ink-mute:#5c6a63; --al-ink-soft:#9aa39e;
  --al-gold:#C9A84C; --al-gold-m:#E2C97A; --al-gold-d:#8C7235;
  --al-gold-bg:rgba(201,168,76,.10); --al-gold-glow:rgba(201,168,76,.35);
  --al-teal:#1B3A2D; --al-teal-2:#2A5240; --al-teal-3:#3A6B54;
  --al-good:#009E73; --al-good-d:#007a59; --al-trap:#D55E00; --al-trap-d:#9b4500;
  --al-line:rgba(13,32,24,.12); --al-line-2:rgba(13,32,24,.20);
  --al-qr-color:#C9A84C; --al-bio-color:#5FA874; --al-gc-color:#3A6B54; --al-ochem-color:#8C7235;
  --al-font-serif:'Playfair Display',Georgia,serif;
  --al-font-sans:'DM Sans',system-ui,-apple-system,sans-serif;
  --al-font-mono:'JetBrains Mono',ui-monospace,'SF Mono',Menlo,monospace;
  --al-shadow:0 1px 3px rgba(13,32,24,.06), 0 8px 24px rgba(13,32,24,.04);
  --al-shadow-md:0 2px 6px rgba(13,32,24,.08), 0 16px 40px rgba(13,32,24,.06);
  --al-shadow-lg:0 4px 14px rgba(13,32,24,.10), 0 24px 56px rgba(13,32,24,.08);
  --al-confirmed:#009E73; --al-confirmed-pale:rgba(0,158,115,.10);
  --al-needs-review:#D55E00; --al-needs-review-pale:rgba(213,94,0,.10);
  --al-almost:#E69F00; --al-almost-pale:rgba(230,159,0,.10);
  --al-new:#0072B2; --al-new-pale:rgba(0,114,178,.10);
  --motion-fast:150ms; --motion-base:250ms; --motion-slow:400ms; --motion-explainer:800ms;

  /* 1. new primitives (never themed) */
  --al-gold-ink:#7a6128;
  --al-bench-0:#07130d; --al-bench-1:#0c1d15; --al-bench-2:#122a1f; --al-bench-3:#1a3829;
  --al-sec-bio:#2F7D4F;   --al-sec-bio-lite:#6fcf97;
  --al-sec-gchem:#2F64A8; --al-sec-gchem-lite:#7fb2f0;
  --al-sec-ochem:#7A4BAE; --al-sec-ochem-lite:#c4a3f0;
  --al-sec-pat:#8A5D00;   --al-sec-pat-lite:#f0c060;
  --al-sec-rc:#1C7268;    --al-sec-rc-lite:#5fd3c4;
  --al-sec-qr:#B03A57;    --al-sec-qr-lite:#f39ab0;
  --al-exam:#086894; --al-exam-d:#054766; --al-exam-bg:#f0f3f5; --al-exam-ink:#1a1d20; --al-exam-line:#c5ccd1; --al-exam-tool:#f7f9fa;
  --al-spec-surround:#141714; --al-spec-paper:#ffffff; --al-spec-table:#e9e5db; --al-spec-ink:#111111;

  /* 2. semantic: paper (themed) */
  --s-page:var(--al-bg); --s-surface:var(--al-paper); --s-surface-2:var(--al-paper-2); --s-sunk:#ece4d3;
  --s-ink:var(--al-ink); --s-ink-2:var(--al-ink-2); --s-ink-3:var(--al-ink-mute);
  --s-line:rgba(13,32,24,.12); --s-line-2:rgba(13,32,24,.22);
  --s-accent:var(--al-gold); --s-accent-ink:var(--al-gold-ink);
  --s-primary:var(--al-teal); --s-primary-ink:#fffdf7;
  --s-good:var(--al-good); --s-good-ink:var(--al-good-d); --s-good-wash:rgba(0,158,115,.10);
  --s-trap:var(--al-trap); --s-trap-ink:var(--al-trap-d); --s-trap-wash:rgba(213,94,0,.09);
  --s-focus:#0072B2;
  --s-shadow:0 1px 2px rgba(13,32,24,.06),0 8px 24px rgba(13,32,24,.06);
  --s-shadow-lift:0 2px 6px rgba(13,32,24,.10),0 18px 40px rgba(13,32,24,.12);
  --s-sec-bio:var(--al-sec-bio); --s-sec-gchem:var(--al-sec-gchem); --s-sec-ochem:var(--al-sec-ochem);
  --s-sec-pat:var(--al-sec-pat); --s-sec-rc:var(--al-sec-rc); --s-sec-qr:var(--al-sec-qr);
  --sec:var(--s-ink-2); --sec-lite:var(--s-ink-2);

  /* 2b. semantic: the bench (same in both themes) */
  --b-bg:var(--al-bench-1); --b-raised:var(--al-bench-2); --b-raised-2:var(--al-bench-3);
  --b-ink:#f4ede0; --b-ink-2:#c9c3b4; --b-ink-3:#9fa89f;
  --b-line:rgba(244,237,224,.12); --b-line-2:rgba(201,168,76,.34);
  --b-gold:var(--al-gold); --b-gold-hi:var(--al-gold-m); --b-good:#3fd2a0; --b-trap:#ff8a3d;

  /* 3a. type */
  --f-display:"Playfair Display",Georgia,"Times New Roman",serif;
  --f-body:"DM Sans",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  --f-mono:"JetBrains Mono",ui-monospace,"SF Mono",Menlo,monospace;
  --f-exam:Arial,Helvetica,sans-serif;
  --t-hero:clamp(2.125rem,1.4rem + 3.6vw,3.5rem);
  --t-h1:clamp(1.75rem,1.3rem + 2.2vw,2.5rem);
  --t-h2:clamp(1.375rem,1.2rem + .9vw,1.75rem);
  --t-coach:clamp(1.1875rem,1.05rem + .7vw,1.5rem);
  --t-h3:1.125rem; --t-read:1.0625rem; --t-body:1rem; --t-small:.875rem; --t-label:.75rem;

  /* 3b. space and shape */
  --sp-1:4px; --sp-2:8px; --sp-3:12px; --sp-4:16px; --sp-5:24px; --sp-6:32px; --sp-7:48px; --sp-8:64px;
  --gutter:16px; --r-control:10px; --r-card:16px; --r-bench:22px; --r-pill:999px;
  --target:44px; --tabbar-h:64px; --maxw:1180px;

  /* 3c. motion */
  --m-tap:100ms; --m-state:180ms; --m-panel:320ms; --m-travel:420ms;
  --m-reveal:600ms; --m-card:620ms; --m-frame:900ms;
  --e-out:cubic-bezier(.2,.8,.2,1); --e-std:cubic-bezier(.4,0,.2,1);
  --e-process:cubic-bezier(.45,0,.25,1); --e-drop:cubic-bezier(.34,1.32,.64,1);
  color-scheme:light;
}
@media (min-width:760px){:root{--gutter:28px}}

/* dark: only the paper roles change */
@media (prefers-color-scheme: dark){
  :root:not([data-theme="light"]){
    --s-page:#08150f; --s-surface:#0f1f17; --s-surface-2:#13261c; --s-sunk:#0a1811;
    --s-ink:#ece6d7; --s-ink-2:#c9c3b4; --s-ink-3:#a7b0a8;
    --s-line:rgba(236,230,215,.12); --s-line-2:rgba(236,230,215,.22);
    --s-accent-ink:#E2C97A; --s-primary:#C9A84C; --s-primary-ink:#16120A;
    --s-good-ink:#3fd2a0; --s-trap-ink:#ff8a3d; --s-good-wash:rgba(63,210,160,.12); --s-trap-wash:rgba(255,138,61,.12);
    --s-focus:#7fb2f0;
    --s-shadow:0 1px 2px rgba(0,0,0,.4),0 8px 24px rgba(0,0,0,.3);
    --s-shadow-lift:0 2px 6px rgba(0,0,0,.5),0 18px 40px rgba(0,0,0,.45);
    --s-sec-bio:var(--al-sec-bio-lite); --s-sec-gchem:var(--al-sec-gchem-lite); --s-sec-ochem:var(--al-sec-ochem-lite);
    --s-sec-pat:var(--al-sec-pat-lite); --s-sec-rc:var(--al-sec-rc-lite); --s-sec-qr:var(--al-sec-qr-lite);
    color-scheme:dark;
  }
}
:root[data-theme="dark"]{ /* the same block, for the Settings choice */ }

[data-sec="bio"]{--sec:var(--s-sec-bio);--sec-lite:var(--al-sec-bio-lite)}
/* ... one line per section: gchem, ochem, pat, rc, qr */

@media (prefers-reduced-motion: reduce){
  :root{--m-tap:1ms;--m-state:1ms;--m-panel:1ms;--m-travel:1ms;--m-reveal:1ms;--m-card:1ms;--m-frame:1ms;
        --motion-fast:.01ms;--motion-base:.01ms;--motion-slow:.01ms;--motion-explainer:.01ms}
  *,*::before,*::after{animation-duration:.01ms !important;animation-iteration-count:1 !important;
                       transition-duration:.01ms !important;scroll-behavior:auto !important}
}
```

**One dark mode.** The OS preference, overridable from Settings (Auto, Light,
Dark) through `html[data-theme]`, kept in `localStorage` (a per-device
convenience). Only `--s-*` changes. The bench, specimens, Ace Cards, the exam
screen and its explainer do not invert. The three engine-local dark modes
(`body[data-theme]` in the GChem and QR skill trees, `html[data-theme]` in
OChem) are deleted as each engine adopts the tokens; until then an engine
page keeps its own scheme. Pages that only read `--al-*` never change in dark
mode, because no `--al-*` name is themed (this protects
`prometric-mock.html`, which pairs `--al-ink` with 22 hard-coded white
backgrounds).

### 2.3 Contrast (WCAG ratios, measured)

| Pair | Ratio |
|---|---|
| ink `#0d2018` on paper `#fffdf7` | 16.7 |
| ink-3 `#5c6a63` on paper / on page `#f5f0e8` | 5.58 / 5.01 |
| gold-ink `#7a6128` on paper / page | 5.79 / 5.19 |
| good-d `#007a59` on paper / on good wash | 5.26 / 4.74 |
| trap-d `#9b4500` on paper / on trap wash | 6.36 / 5.73 |
| section inks on paper (bio, gchem, ochem, pat, rc, qr) | 4.95, 5.88, 5.99, 5.66, 5.65, 5.75 |
| bench ink-2 `#c9c3b4` / ink-3 `#9fa89f` on `#0c1d15` | 9.94 / 7.13 |
| gold `#C9A84C` / gold-hi `#E2C97A` on the bench | 7.64 / 10.70 |
| bench good `#3fd2a0` / trap `#ff8a3d` on the bench | 9.10 / 7.45 |
| section lites on the bench | 7.93 to 10.33 |
| dark mode: ink-3 `#a7b0a8`, gold-hi, good, trap on `#0f1f17` | 7.67, 10.47, 8.90, 7.29 |
| white on the exam bar `#086894` | 6.14 |
| exam tool text `#4a5158` / link `#2b5f7a` on `#f7f9fa` | 7.62 / 6.58 |
| exam tags: answer `#005c43` on `#dff3ea`; your pick `#8a3d00` on `#fbe6d7` | 6.95 / 6.33 |
| ink on the gold button (`#16120A` on `#C9A84C`) | 8.17 |

Gold-ink on forest (2.1) is never used; small gold text on the bench is
`--b-gold-hi`. Feedback rings and borders pass 3:1 as non-text.

### 2.4 Type

Self-hosted latin subsets in `shared/fonts/`, versioned file names (the
folder is immutable-cached): Playfair Display upright and italic (38 KB
each), DM Sans upright (63 KB) and italic (76 KB, loaded only where used),
JetBrains Mono (31 KB). Preload two: DM Sans upright and Playfair italic.
`font-display: swap`. The shell's Georgia and Hanken Grotesk retire (a
decision for Thomas; the portal's Visual Canon can follow the same tokens).

| Role | Size / line height | Face |
|---|---|---|
| Hero (door titles) | clamp 34 to 56 / 1.04 | Playfair 700; one italic gold phrase allowed; `text-wrap: balance` |
| H1 (page titles) | clamp 28 to 40 / 1.1 | Playfair 700 |
| H2 (blocks, bench prompts) | clamp 22 to 28 / 1.18 (prompts 19 to 25 / 1.25) | Playfair 700 |
| Coach line, hooks, "lock it in" | clamp 19 to 24 / 1.3 | Playfair italic 600 |
| H3 / card titles | 18 / 1.3 (tool names 18 Playfair) | DM Sans 700 |
| Read (ledes, explainers) | 17 / 1.6 | DM Sans 400 |
| Body | 16 / 1.55 (16 minimum on phones) | DM Sans 400 |
| Small (meta, captions) | 14 / 1.45 | DM Sans 400 |
| Label (kickers, counts, tags) | 12 (10.5 to 11.5 for tags) / 1.2, caps, +0.1 em | JetBrains Mono 600 |
| Exam | 16 / 1.65 | Arial |

Numbers in Playfair use lining figures. Units and chemistry keep their case:
mono labels that hold units or symbols (pH, mL, um, [A-]) are not uppercased.

### 2.5 Space, shape, elevation, targets

4 px base (4, 8, 12, 16, 24, 32, 48, 64). Gutter 16 px on phones, 28 px from
760 px. Max width 1180 px. Radii 10 (controls), 16 (cards), 22 (benches and
the coach band), pill (buttons, chips). Paper cards use two-layer soft
shadows; benches one long low shadow. **Every target is at least 44 x 44 px**
(bench options 52 px, exam choices 48 px, question-screen tools 44 px, PAT
call cells about 59 px, tab-bar doors 78 x 64 px); decorative chips that are
not controls may be 32 px.

### 2.6 Icons

One SVG set (`AL.icon(name)`): 24 grid, 1.8 stroke, round caps and joins,
`currentColor`, `aria-hidden` with a word or `aria-label` beside every icon.
Doors: today (sunrise), learn (book), play (knob), prove (checked sheet), keep
(card stack). Stages reuse play/prove/keep plus predict (a dashed ring with a
dot). Sections: Bio (a cell), GChem (a flask), OChem (a ring), PAT (a cube),
RC (a page with one highlighted line), QR (a plotted line). Utility: sheet,
arrow, back, replay, next (step), good (circle check), review (a return arc,
never an X), skipcall, eye, drag, flag, grid, marker, strike, branch (Stuck),
lens, drop, calendar, close. No emoji, no glyph characters: arrows are SVG,
separators are " / " or a comma, subscripts are `<sub>`.

### 2.7 Components (markup and states)

All in `mock/assets/kit.css` (to become `shared/al-kit.css`) and
`mock/assets/exam.css` (to become `tools/mock/player.css` for the test-day
layer and `tools/mock/explainer.css` for the explainer).

**Shell** (`shared/ace-shell.js` v2, shadow root in production)
```html
<div id="ace-shell" class="shell"><div class="in">
  <a class="brand" href="/">...Ace <i>Labs</i></a>
  <nav aria-label="Ace Labs"><ul class="doors">
    <li><a class="door" data-id="today" href="/" aria-current="page"><span class="di">[icon]</span><span class="dl">Today</span></a></li>
    ... learn, practice, tests,
    <li><a class="door" data-id="review" href="/review/"><span class="di">[icon]<i class="due" aria-hidden="true"></i></span><span class="dl">Review</span><span class="sr">, 3 cards back today</span></a></li>
    <div class="ring"></div><div class="bead"></div>
  </ul></nav></div></div>
```
States: current (aria-current, gold, 800 weight, bead or tick), hover,
focus-visible (3 px ring), due dot shown or hidden. Keeps `?student=` on every
door, hides in frames, on `?embed`, during timed sections, on
`data-ace-shell="off"`, and in print (all existing behavior).

**Coach band** (`.coach`): `.top` (date, date chip), `.coach-line` (with one
`<em>` in gold-hi), `.coach-src` (source line, `<b>` for the facts), `.plan-line`
(ticks `.now`/`.done` and a label), `.said` (the re-plan sentence,
`aria-live`), `.coach-note` (quoted portal note with `.sign`). Phone: the date
shortens to "Fri, Oct 30" so the top line never wraps.

**Plan** (`ol.plan > li > a.step`): `.node` icon on the rail, `.st` (door
name with a section swatch), `.t`, `.d`, `.min`. States: `.now` (gold border,
gold node), `.done` (gold ring node with a check icon, strikethrough title),
`.added` (dashed gold border, "added just now"). Reorders run through
`AL.flip` (320 ms) and cut under reduced motion. `.tomorrow` holds what
moved.

**Bench** (`article.bench`): `.bench-top` (gold kicker with icon, a section
chip), `#band` (the loop band), `.bench-body` > `.bench-grid` with three
areas: `stage`, `flow`, `drive`. Desktop: stage left, flow right, drive under
the stage. Phone: stage, then flow (the verdict lands directly under the
slide), then drive.

**Loop band** (`AL.band(el)` returns `{ set(i) }`): four `.st` nodes on a line;
the line fills gold as the student advances; the current node is filled gold
with `aria-current="step"`; done nodes are gold rings.

**Field** (the specimen, `.field`): a 372:228 crop of the renderer's canvas
with a scale bar burned in; tags "Light microscope" and "1000x oil" (or
"400x"); `.layer.draw` for the wipe; `.veil` for closed-book recall (blurred,
"Closed book. Answer from memory, then the slide comes back.") never for the
first call. The renderer's caption moves to the HTML `.caption`
(`aria-live="polite"`), and the field's `aria-label` updates every frame.

**Options** (`.opts > button.opt`): `.let` letter disc, `.txt`, `.tag`.
States: default; hover; `aria-pressed="true"` while the picture plays (gold);
after the reveal `.key` (green, tag "Answer" or "Answer, your call"),
`.mine` (vermilion, tag "Your call"), `.dim` (others, 50% opacity); disabled.
After the verdict the call block collapses so the verdict sits under the
slide.

**Verdict** (`.verdict.good|.trap|.plain`): `.vh` icon and word (Confirmed,
Needs review, Shown without a call), "Your call: X." plus the trap line on a
miss, "The slide says: Y." (or "The curve says", "The micrograph says"),
`.trapname` ("Trap: Reversed", from the shared trap list), the why (on a
Confirmed or a skip; on a miss the trap line carries it), `.hook` in Playfair
italic. `role="status"`. Never shakes, never flashes.

**Drive** (`.drive`): `.dh` "Now you drive", one line of instruction, a
`.knob` (label with an `<output>` in words, `input[type=range].al` 44 px tall
with a 28 px thumb, named `.ticks`), and `.honest`, the honesty note for any
one-way process ("Each position is a fresh slide. Burst cells never
re-form."). The slider's `aria-valuetext` is words plus the state name.

**Wipe** (`.wipe-handle[role=slider]`): a 44 px wide handle with a 36 px gold
grip, drag or arrow keys; tags "Drawing" and "Real" at the top of the field
(the field's own tags hide while wiping). `aria-valuetext` says what each
side shows ("Left: the textbook drawing, one swelling cell, water arrows
going in. Right: the real field.").

**Ace Card** (`.acecard[data-sec]`): `.pic` (a two-panel before and after of
the exact slide, sheet or curve the student saw, each panel labeled),
`.ac-k` (Ace Card / section / subtopic, "New"), `.ac-t` (the idea in one
sentence), `.ac-h` (the hook), `.ac-when` (1, 3, 7 ticks and "Back tomorrow,
Saturday"). Paper in both themes.

**Ladder** (`.ladder > .rung`): `.stack` (fanned cards, `.empty` dashed),
`.lbl`, `.num` ("3 cards"); `.now` gold label; `.landed` gold top card after
a card arrives (one 260 ms settle, no glow, no bump). No totals, no green.

**Toast** (`#al-toast.toast`, `role=status`): forest pill, gold icon, one line
("Card saved to Review. Back tomorrow, Saturday."), above the tab bar on
phones, 4.2 s.

**Stuck sheet** (`.sheet-back > .sheet[role=dialog]`): a title tuned per
section, "No need to explain. Any of these is a good move.", three `.so`
buttons, and "Back to where I was". Focus moves to the first option and
returns to the opener; Escape closes. Never shown unprompted.

**Door header** (`.door-head`): crumbs (44 px links), gold mono kicker with
the door name, hero title with one italic gold phrase, lede.

**Section switcher** (`.switcher > .row > .seg`): 44 px pills in DAT order
with swatches; pressed or current = forest fill. Sticky on Practice, inline
on section pages. Scrolls sideways on phones; remembers the filter per
device.

**Tool card** (`a.tool`): `.thumb` (a real specimen or a small drawing on the
bench, never a placeholder), `.sec` (swatch and section or kind), `.name`,
`.what` (verb first), `.meta` (`.miniloop` four pips: which of call, play,
prove, keep the tool runs; and minutes).

**Lane** (`.lane > .lane-head`): mono number (01 to 05), Playfair title, one
line.

**Question-screen pieces** are in section 5.

---

## 3. Motion and play

### 3.1 The motion language

Motion is allowed only when it **explains** (the specimen changes the way the
science says) or **answers** (where your action went). It never decorates.

| Token | Duration | Easing | Used for |
|---|---|---|---|
| tap | 100 ms | std | press feedback (scale 0.97 to 0.985) |
| state | 180 ms | std | a control changes state; hover lift |
| panel | 320 ms | out | the explainer slides in; the plan reorders (FLIP); the toast |
| travel | 420 ms | out | the bead between doors; the band fill; camera follow |
| reveal | 600 ms | out | a verdict or next step arrives (10 px rise and fade) |
| card | 620 ms | process | an Ace Card flies to the Review door or its rung (arc, scale to the target, fade) |
| frame | 900 ms | linear progress | one frame of a process (bio-stick FRAME_MS); the frame bar fills |
| process tween | 700 to 1000 ms per step | process | a fold, an unfold, a contraction, a pour |

Easings: out `cubic-bezier(.2,.8,.2,1)`, std `(.4,0,.2,1)`, process
`(.45,0,.25,1)`, and drop `(.34,1.32,.64,1)`, the only overshoot, only when a
dragged handle is released. A Watch beat runs 2.7 to 3.6 s in total.

Rules:

1. One thing moves at a time. The verdict waits for the last frame; the card
   flight waits for the camera.
2. **The camera follows the action** (`AL.follow`): before a process runs,
   bring the stage into view; after it, keep the stage and the verdict in one
   view when they fit (else show the verdict); only scroll when something is
   not already visible above the tab bar; never move focus.
3. Nothing loops idle. Nothing celebrates: no confetti, counters that count
   up, glow pulses, shakes or buzzes. Needs review is as calm as Confirmed.
4. Only transform and opacity animate. SVG frame swaps are at most one per
   frame token; scrubbing redraws at most once per animation frame. One
   requestAnimationFrame loop per page; canvases capped at DPR 2.
5. **Reduced motion**: every transition cuts (the tokens collapse); auto-play
   becomes a **Next frame** button that keeps every frame and its caption;
   process tweens jump to each step; PAT folds become still panels drawn the
   way the DAT draws them (Fold 1, Fold 2, Punch; Folded, Unfold 1, Unfold 2);
   the card skips its flight and keeps its toast; the plan reorder cuts;
   dragging, scrubbing and the wipe still work (direct manipulation is not
   motion).
6. Every process animation is also a scrubber, so no animation is the only
   way to see a state.

### 3.2 The play patterns

| Pattern | What the student does | Rules |
|---|---|---|
| **Call it first** | Calls one of 2 to 4 predictions on a sharp "before" picture; the process plays frame by frame; the verdict names the trap | One tap; Skip always there and recorded as "Shown without a call"; no timer, points or confidence gate; every option has a trap line and a trap name |
| **Drive it** | Moves the cause and watches the effect (solute, contraction, the pour, a fold) | Every drag has a keyboard path (arrow keys on `role=slider` with words in `aria-valuetext`) and a tap path; 44 px handles; `touch-action: none` on the handle only; an honesty note on one-way processes |
| **Scrub a process** | Drags along a timeline with named stops (unfold, Krebs, cardiac cycle, a mechanism's arrows) | Named stops; the readout names the stop; works under reduced motion |
| **Compare views** | Drawing / Real wipe; the lens; before and after on every card; "See each choice" in explainers; Compare overlays (weak vs strong acid) | The wipe covers the field only; tags say which side is which |
| **Which one is this?** | Names the state of a varied realistic field; sees the tell | 6 to 12 seeded variants per state; captions and tell-tale strips are cropped until the answer; a miss becomes an Ace Card carrying that field; ends with "Six slides seen. N came with you as Ace Cards.", never a score |
| **Build it** | Assembles the answer (Lewis structures, equation skeletons, a net into a cube) | Tap to pick up and tap to place, as well as drag (required before the QR decoders return) |
| **Find it** | Finds the evidence (the RC proof line, the stereocenter, the edge in Six Views) | Highlight and cross-out behave as on the test-day screen |

### 3.3 Where each section uses them

| Section | Call it first: first three | Drive / scrub | Compare / Real view | Which one is this? | Build / Find |
|---|---|---|---|---|---|
| Bio | The 15 live (Tonicity, Cellular respiration, Endocrine glands, Nephron, Action potential, Cross-bridge cycle, Sarcomere bands, Hemoglobin curve, ABO blood types, Menstrual cycle, Bone layers, Lac operon, Hardy-Weinberg, Embryo stages, Homology), then one per hub tab | Solute knob; contraction slider; Krebs and AP scrubbers; cardiac cycle | Drawing / Real wipe on red cells and Elodea; the sarcomere lens; long bone to ground section | Tonicity states (built); sarcomere contraction state; bone tissue; mitosis phases; embryo stages | Pedigree builder; Punnett solver |
| GChem | Titration curves (half-equivalence, then equivalence); Q vs K direction; Le Chatelier shift | The pour and the volume slider; titrant scrub on the computed curve; temperature knob | Weak vs strong acid overlay; phase diagram vs heating curve | Recognition Lab as an untimed set (titration curves, phase diagrams, VSEPR shapes, reaction coordinates) | Lewis and VSEPR Sandbox |
| OChem | Tree modules: call the product before the arrows push; SN1, SN2, E1 or E2 (The Two Decisions); Newman: call the most stable | Mechanism scrub on mechdraw.js arrows; chair flip | Wedge-dash vs Fischer | IR peaks; 1H NMR splitting; reagents by role | Draw the product (Tree); find the stereocenter |
| PAT | Hole Punching (built); Cube Counting (lift away layers); Pattern Folding (fold the net around the anchor face) | Unfold scrubber; fold scrubber; Six Views walk-around; turn the keyhole object | Your call vs the unfolded sheet, cell by cell | Keyholes silhouettes; top-front-end views | T-chart cube counting; anchor-face folding |
| RC | Find the proof line: call where the answer lives, then the passage lights the sentence | Passage map | Two choices against the proof line | Trap families (Too strong, Outside the passage, Reversed ...) | Highlight and cross-out |
| QR | Mean or median? (drag the outlier); successive percents (call 100 or 96); the at-least-one flip | Probability Sandbox branches; rate-time scrub; fraction bars | The trap setup vs the right setup (the 14 comparators) | Which setup is this? (permutation or combination, AND or OR) | Equation skeletons with tap-to-place |

Push the piston (a new GChem tool from the One Loop mock) does **not** ship in
the first release: it needs a chemistry review of its small-number physics
and a build decision; its idle gas loop would also have to stop off screen
and under reduced motion.

### 3.4 The shared engine: `shared/al-loop.js`

`tools/bio/bio-stick.js` stays where it is, with its `BIO_STICK_ENTRIES`
contract and the `bio-shared.js addAceCard` path, as a thin Bio adapter over
the new shared engine (its validator `scripts/validate-bio-stick.mjs` and test
`tests/bio/bio-stick.test.js` keep passing unchanged). The shared engine owns
what the mocks' `assets/loop.js` shows:

```js
AceLoop.mount(host, entry, driver) // renders the bench: band, field, calls, verdict, drive, recall, card
entry = { id, section, subtopic, title,
  predict: { q, options[2..4], key, traps[], trapNames[], why, hook },
  check:   { q, options, key, traps[], trapNames[], why },      // the closed-book recall
  card:    { idea, hook, pic: 'pair' | 'single' },
  honesty: 'Each position is a fresh slide. Burst cells never re-form.',
  links:   { night, sheet, set } }
driver = { kind: 'steps' | 'tween' | 'custom',
  frames: [...], render(state) -> { svg, caption, aria },  // 'tween': a pure f(t); BioReal.tonicity draws a frame in well under 2 ms
  drive: { label, min, max, words(v) }, stills() }        // 'custom': the PAT fold
AceLoop.options / reveal / collapse / verdict / card / keep / stuck   // the pieces, as in the mock
```

Cards from every section land in one deck: Bio keeps its adapter; new
sections write through a `play-cards` adapter registered with
`AceProgress.registerMissAdapter`, so Review, Today and the dot see every
card. A miss writes its card at the verdict (the flight is only the picture
of where it went). New sets ship as data files beside their engines and pass
a per-section validator (copy rules, 2 to 4 options, a trap line and trap
name per non-key option, a check, a hook, still panels for reduced motion).

---

## 4. Signature moments

1. **Play before you read (0 to 15 s).** Today's first phone screen, without
   scrolling, shows the coach line, real red cells at 1000x with a 10 um bar,
   the question and all three calls above the tab bar. One tap and pure water
   floods the slide: the discs cup, round up and burst into ghosts over four
   900 ms frames while the HTML caption narrates each frame. Shots:
   `today-390x844`, `today-390-1-watch-mid-motion`, `today-1280-1-watch-mid-motion`.
2. **Drawing meets real, and the verdict sits under the slide (15 to 40 s).**
   The verdict names the trap ("Trap: Reversed") directly under the slide;
   then the student drives the solute and pulls the gold line across the
   field: the textbook drawing on one side, the real cells at the same
   moment on the other. Shots: `today-390-2-verdict-under-slide`,
   `today-390-3-drive-and-wipe`, `today-1280-2-verdict-and-drive`.
3. **The card flies home and the plan answers (40 to 70 s).** One more from
   memory (the slide veiled, then Elodea plasmolysis revealed), and the Ace
   Card prints with a before and after of the exact slide. It arcs into the
   Review tab, the dot appears once, a toast says "Back tomorrow, Saturday",
   and when the loop had a miss the plan re-plans in front of the student:
   one scene of night 3 slides in as step 2, the Climb moves to tomorrow, and
   the coach band says why in one sentence. Shots:
   `today-390-5-slide-back-and-card`, `today-390-6-card-flight`,
   `today-390-7-replanned`, `today-1280-4-replanned`; first run:
   `today-first-390-three-questions`, `today-first-1280-plan-built`.
4. **On the question screen: the picture places every choice.** Under the
   explainer's Hardy-Weinberg square, chips A to E light the exact piece each
   choice came from (0.16 the aa square, 0.40 a side, 0.36 AA, 0.24 one Aa
   rectangle, 0.48 both). Where the choices describe states, "See each choice
   under the microscope" renders the real slide each choice implies ("What
   150 outside would do... This solution is not 150."). Shots:
   `question-1280-trap-map-E`, `question-1280-see-each-choice`,
   `question-390-see-each-choice`.

Runners-up on the section pages: the sarcomere **lens** (the electron
micrograph under a brass glass on a to-scale drawing, both contracting
together; `biology-1280-lens-verdict`, `biology-1280-lens-micrograph`) and the
**titration pour** (drops, the curve pausing at pH = pKa = 4.74, the flask
turning pink near 8.7, the HCl overlay; `titration-1280-3-compare-and-card`).

---

## 5. The DAT-style question screen

One player for every question surface, built on `tools/mock/full.js` as
`question-system/dat-interface.md` recommends, with the explainer record and
order of `question-system/explainer-standard.md`. Mock: `mock/question.html`
(`?q=hw|nacl`, `?pick=D&checked=1`, `?mode=timed`, `?review=1`,
`?exhibit=1`, `?strike=C`).

### 5.1 The test-day layer (identical in practice and timed)

- **Top bar** `#086894`, white text: left "Question 4 of 10" with the set or
  form under it ("Bio practice set", "Full-length DAT 1"); center the section
  title ("Survey of the Natural Sciences", desktop only); right "Untimed
  practice" or, in timed tests only, "Time remaining" and the clock (tabular,
  steady; a color change under 5 minutes at most, never a pulse). This is the
  only clock in Ace Labs.
- **Tool row** `#f7f9fa`: **Highlight** (select words, then press; tap a
  highlight to remove it; a hint says "Select words in the question first."
  if nothing is selected) and **Cross out** (a toggle; while on, tapping a
  choice strikes it; right-click also strikes; a struck choice stays
  selectable). Both 44 px. Practice adds "Exit to Ace Labs" on the right.
- **Exam card**: Arial 16/1.65 stem; A to E radio rows 48 px tall (PAT keeps
  5, 4, 4, 5, 5, 4 options by subtest); 2 px ink frame on desktop, full bleed
  on phones. **No subject line, topic, difficulty or item tags** in either
  mode.
- **Footer** `#086894`: Previous, Next, Mark, Review, then Exhibit (sciences)
  or Calculator (QR), in the DAT's italic uppercase, Alt-letter underlines
  and working Alt shortcuts. On phones all five stay in one row (equal
  widths, 11.5 px). Mark turns a neutral gold "Marked", never the red used
  elsewhere; open tools use a neutral pressed look.
- **Review screen**: the question grid with Open, Answered and Marked
  (status by fill and a dot, plus the counts in words), **Review All, Review
  Marked, Review Incomplete** (each a mode Next and Previous respect), Return
  to question N, and in timed tests **End section** with the confirm "You have
  N open questions. A guess can only help... Once this section ends you
  cannot return to it."
- **Exhibit**: one draggable periodic table window (the full.js table; a
  constants line in plain ASCII), available throughout the sciences.
  **Calculator**: one draggable basic calculator in QR, opening where it does
  not cover the choices.
- **RC**: the passage beside the question on desktop, Passage and Question
  tabs on phones. **PAT**: black-on-white figures.
- Removed for good: the OChem reagent sheet, topic and difficulty meta, the
  backtick hint line, the header X and gear, the pulsing timer.

### 5.2 Practice mode (the coach layer)

- **Check** (gold, 48 px, inside the card under the choices) unlocks once a
  choice is picked. Beside it **Stuck?** (the section-tuned triage) and the
  line "There is no Check button on test day; here it opens the explainer."
  Check and Stuck are the only non-DAT controls on the screen.
- After Check the card is marked in place: the key gets a green edge and the
  tag "Answer" (or "Answer, your pick"); a different pick gets a vermilion
  edge and "Your pick". Words first, color second.
- **Where the explainer goes**: from 1100 px the test stays on the left and
  the explainer opens as a 420 px-plus paper panel on the right with a gold
  edge (320 ms slide; a cut under reduced motion), scrolling on its own. Under
  1100 px it opens under the question in the same scroll and the screen
  scrolls to it; the exam bars stay fixed above and below.
- **Player mode**: the Ace Labs nav is hidden; "Exit to Ace Labs" is the way
  out.

### 5.3 Timed mode

The same screen with the clock, no Check, no Stuck, no explainer, no Exit
(leaving saves the place and pauses the clock, and the copy says so). After
the section ends, the Review screen and Your results open the same explainer
per item. The question screen is light in every mode.

### 5.4 The explainer (explainer-standard.md order)

1. **Status**: Confirmed or Needs review, icon and word, then "You picked D,
   0.24." Never a score.
2. **The answer**: the key's letter (from the served order) and text, and one
   line of why (25 words at most).
3. **The picture**: rendered, never a static image, with a caption in
   Thomas's voice and, below it, **Where each choice comes from**: one chip
   per choice (the pick outlined vermilion, the key green) that lights the
   choice's place in the picture with fill plus label. Where choices describe
   states, **See each choice under the microscope** renders each choice's
   real view instead. Replay where the picture is a process.
4. **How to get there**: 1 to 4 numbered steps, step 1 opening with the move.
5. **The traps**: the student's pick first, marked "Your pick", then every
   other choice: letter, text, trap name (shared list), one or two sentences.
   Notes never cite a letter.
6. **Lock it in**: the idea in one line (Playfair). 7. **Memory cue** in
   italic gold under it.
8. **The card**: on Needs review, "Ace Card made. It comes back tomorrow,
   Saturday, with this picture, as a fresh question on the same idea." with
   Open Review (the card exists already); on Confirmed, "Keep it" as an
   option.
9. **Play with it**: Learn (the matching night), Play (the tool at the
   matching state), Sheet (the Canon page).
10. **Watch**: the subtopic video slot, hidden until a video id exists.
11. **Report**: "Something off with this question?" (the coach key-dispute
    form).

### 5.5 The visual for every question

Every instrument is also a picture factory: one renderer draws the live tool,
the explainer picture, the card picture and the recognition fields. A
question's `visual` names a renderer and its parameters, per the standard's
catalog:

| Section | Renderers |
|---|---|
| Bio | `bio.real` (BioReal.tonicity, temStrip, bio-bone views; Thomas signs off every true-to-life view), `bio.hardy-weinberg`, `bio.punnett`, `bio.pedigree`, `bio.diagram`; "see each choice" for state questions |
| GChem | `chem.curve` (titration, heating, phase, rate; computed, marks on the true curve, values that match the bank key), `chem.lewis`, `chem.trend` |
| OChem | `chem.molecule`, `chem.reaction`, `chem.mechanism` (mechdraw.js arrows), `chem.energy` |
| PAT | the engine's truth views: `pat.unfold`, `pat.cubes`, `pat.angles`, `pat.keyhole`, `pat.tfe`, `pat.fold` |
| RC | `rc.evidence`: the passage with the proof line lit and each trap's sentence marked |
| QR | `qr.figure`, `qr.partwhole`, `qr.numberline`, `qr.tree`, `qr.work` |

Budgets from the standard: text in pictures 12 px or larger at 358 px wide
(renderers read the host width; the mock lens and titration scale labels by
1.5 under 600 px); spec under 4 KB; cached SVG under 40 KB (60 KB for a real
view); `role="img"` and an `aria-label` from `alt`; no animation by default
and the last frame under reduced motion.

**Data contract**: sidecar records (`content/explainers/...`, schema
`ace.explainer/1`, keyed by stable qid, guarded by key text, stem hash and
choice texts; banks and keys are never edited). Explainer fields from the
standard (`answer`, `steps`, `choices[{text, role, trap, missType, note}]`,
`lockIt`, `hook`, `playWith`, `video`, `visual`, `review`). Fallback when no
approved record exists: the bank's own `why` and `traps`, exactly as today.

**Fill order and launch rule**: question sets launch only from banks that
meet the standard. Full-length DAT 1 to 4 first (194 of 560 Sciences and QR
items still need per-distractor notes), then the diagnostic, then question
sets by topic, then the Climb. Today about 1 in 6 of 12,381 served records
has a detailed explainer and about 1 in 4 any visual; the Bio and QR quick
rounds have 158 and 114 explanation gaps.

### 5.6 To verify against the official tutorial (dat-interface.md section 7)

Title bar text; exact Review screen labels; whether End sits on question
screens; highlight scope and persistence; strike-through method; Exhibit
scope and constants line; calculator layout and keyboard entry; RC
orientation and paragraph numbers; PAT directions screens. Until then the
player follows `tools/mock/full.js`, the closest verified copy.

---

## 6. Accessibility

- Text contrast 4.5:1 or better in both themes (2.3); non-text 3:1.
- Targets 44 px or larger (2.5); the PAT grid cells are toggle buttons named
  "Row 2, column 1" and say their outcome after the unfold ("a hole, you
  called it", "your call, no hole here", "a hole you did not call"); outcomes
  use shape as well as color (solid ring, dotted ring, dashed ring with a
  slash).
- Keyboard: every control is a button, link or native range; the wipe, lens
  and call grid take arrow keys or Tab and Space; the exam keeps Alt
  shortcuts; focus is a visible 3 px ring (blue on paper, light blue in
  dark).
- Screen readers: specimen SVGs are `role="img"` with an `aria-label` that
  changes every frame; captions and verdicts are `aria-live="polite"`;
  sliders carry words in `aria-valuetext`; the Review dot has a spoken count;
  toasts are `role=status`; the Stuck sheet is a modal dialog that returns
  focus.
- Color never carries meaning alone: every verdict has a word and an icon,
  every section swatch a name, every choice tag a word.
- Reduced motion as in 3.1, rule 5; screenshots
  `today-390-reduced-motion-next-frame`, `pat-390-reduced-motion-stills`.
- Phone first: every page at 390 px with no sideways scroll (checked for
  every mock in `scripts/shoot.cjs`); 16 px body minimum.

---

## 7. Performance budgets (mid-range Android, 4G)

| Budget | Limit | Mock today |
|---|---|---|
| Today, first view, CSS and JS (gzip) | 60 KB | 46 KB (tokens 3.5, kit.css 7.5, kit.js 5.9, loop 2.7, tonicity 3.0, today 7.1, bio-real 16.7) |
| Fonts on first view | 2 preloaded files, 110 KB; 180 KB at most with lazy faces | 101 KB (DM Sans, Playfair italic) |
| Question banks on Today | none | none |
| Images | SVG only on door pages; card and tile pictures cached as data URIs when they repeat | SVG only |
| Specimen frame render | under 2 ms (the tween driver scrubs live) | BioReal tonicity, measured in Chromium |
| Animation | transform and opacity only; one rAF loop per page; DPR 2 cap; one live specimen animating per viewport; heavy SVG filters (TEM grain) re-rendered only on a state change | met |
| LCP / INP / CLS | under 2.5 s / under 200 ms / under 0.05 | to measure on a device |
| Explainer sidecar | spec under 4 KB; index split by section (about 500 KB total for 8,500 entries) | per standard |

Verify the live scrub, the wipe, the lens and the card flight on a real
mid-range Android before release (the mocks were measured in desktop
Chromium at phone size).

---

## 8. How the hard rules are met

| Rule | How |
|---|---|
| No timers except full timed mocks | The only clock is "Time remaining" in timed tests. The Climb, Recognition Lab, quick rounds, mental math and pacing drills go untimed by default (a decision for Thomas, below). Test dates are dates; plans show minutes, never "N min left" |
| No streaks, points, XP, volume badges, leaderboards, scores or percentages as grades | Progress is cards on a ladder and steps on a plan. No day counter. Results are raw counts in neutral color. Sets end with "what came with you" |
| No confidence rating before feedback | Calls are one tap. ANXIETY_AWARE_DESIGN.md's 1 to 5 rating is dropped, or returns only after the verdict as optional (decision below) |
| Plain ASCII, no emoji or glyphs, no em dashes | Separators " / " and commas; SVG arrows; `<sub>`. The copy gate ratchets against a baseline (middle dots in existing titles are flagged) |
| Never wrong, incorrect or failed | Confirmed / Needs review; trap names from the shared list; RC night 8 retitled; PAT and RC labels renamed in sidecars |
| No competitor names, no payment language | booster-map removed; the tricks email page stays at its marketing URL |
| Motion explains, respects reduced motion | 3.1 |
| Accessible | 6 |
| Phone first, fast on mid-range Android | 7 |
| CSP same-origin scripts | All code local; fonts self-hosted; page scripts external files (the CSP can later drop `'unsafe-inline'`) |

---

## 9. Decisions for Thomas

1. Canon as Sheets inside Learn (recommended) or a desktop-only Sheets link.
2. Fonts: the shell moves from Georgia and Hanken Grotesk to Playfair
   Display and DM Sans; the portal's Visual Canon can follow.
3. The Climb, Recognition Lab and quick rounds untimed with no best scores
   (the Climb keeps its internal 75 threshold for `nextRung`, never shown).
4. The 1 to 5 confidence rating: drop it, or keep it optional after the
   verdict.
5. QR geometry and trigonometry: the QR skill tree says not on the DAT; QR,
   Retold teaches them. The QR section page needs one answer.
6. The coach line library: about 40 template lines in his words.
7. Push the piston: build after a chemistry review, or drop.

---

## 10. What the mocks prove, and what they do not

Built: Today (returning and first visit, the whole loop, re-plan, first-run
plan build), Practice, Learn, Tests, Review (fresh-question retrieval), the
Biology section page (Which one is this? and the lens), PAT Hole Punching,
GChem Titration curves, the question screen (two items, practice and timed,
Highlight, Cross out, Stuck, Review screen, Exhibit). Not built: the other
five section pages (same template), Settings, the Calculator window, the RC
split, real data (the mocks run on a fixed date, Friday, October 30, 2026).

---

## 11. Must-fix ledger (every judge must-fix, resolved)

| Must-fix | Resolution | Where |
|---|---|---|
| Highlight and Cross out missing on the question screen | Tool row in both modes; Highlight select-then-press, tap to remove; Cross out toggle and right-click, struck stays selectable | 5.1; `question-390-highlight-crossout` |
| Verdict below the knob and repeated question | The call block collapses; the verdict lands directly under the slide; drive comes after it; the camera keeps slide and verdict in one view | 2.7 Bench; `today-390-2-verdict-under-slide` |
| Blurred first slide | The before field is sharp with its caption; the veil is only for closed-book recall | 1.6, 2.7 Field; `today-390x844` |
| Today's card had no picture | Before and after panels of the exact slide (or sheet, or curve) | 2.7 Ace Card; `today-390-5-slide-back-and-card` |
| Camera follow at every step | `AL.follow` with ranges; never lands below a shortened question | 3.1 rule 2 |
| Gold wrong pick in Prove | Gold only while playing; after the reveal "Answer" green and "Your call" vermilion | 2.7 Options |
| Small targets, dev link | 44 px everywhere; demo switches live only in `mock/index.html` | 2.5 |
| "Day 9" counter | Removed; the date only | 1.2 |
| Subject line above the stem | Removed in both modes | 5.1 |
| Doors out of thumb reach | Bottom tab bar on phones, opt-in during migration, `data-ace-shell-pos=top` opt-out | 1.1 |
| Push the piston promised | Not in the first release; GChem leads with Titration curves | 3.3 |
| Mock index overflow at 390 | Fixed; every mock checked for overflow | `index-390x844` |
| Screen reader silence on the stage | HTML aria-live captions; per-frame `aria-label`; worded `aria-valuetext` on the wipe and sliders | 6 |
| Volume and celebration signals | No day counter; quiet "N cards" per rung; no green Kept; one settle, no bump or glow | 2.7 Ladder |
| Misses must become cards automatically | Written at the verdict on Today, PAT, titration, recognition, the explainer and the Climb; Keep it only for Confirmed | 3.4, 5.4 |
| Show the starting state before the call | The sharp before field with "Before:" caption | `today-390x844` |
| Jargon in door names | Plain door names; stages only on the band and pips | 1.1 |
| Which one is this? only tonicity | Seeded variants required (6 to 12 per state); sarcomere, bone and mitosis sets on reviewed renderers before calling it a feature | 3.2, 3.3 |
| Contrast pass, no letters in notes, 1100 px breakpoint | 2.3 table; notes letter-free; split at 1100 px verified at 390 and 1280 | 5.2 |
| Clock-like Today icon | A sunrise | 2.6 |
| Keep bio-stick.js in place | Thin Bio adapter over `shared/al-loop.js`; validator and tests unchanged | 3.4 |
| `?v=` gate | Every changed shared file bumps `?v=` on every includer in the same commit; fonts versioned in file names | build-plan B1 |
| Fonts double download | Remove the 140 Google Fonts links in the same batch that self-hosts | build-plan B1 |
| Never theme an `--al-*` name; keep `--al-trap-d #9b4500` | Section colors moved to new `--al-sec-*` primitives and themed `--s-sec-*` roles | 2.2 |
| Redirect sequencing | Repoint, then 301, then delete | 1.5 |
| Ratcheting copy gate | Baseline like `gate-house-glyphs --baseline` | build-plan B1 |
| Untimed Climb keeps `nextRung` | Internal 75 threshold kept and never shown; Climb tested after the change | 9.3; build-plan |
| In-flow nav hides the dot | The tab bar is fixed on phones; the card flies to it; reduced motion skips bead travel | 1.1 |
| Coach voice honesty | Template library plus an honest source line; portal notes quoted and signed | 1.7 |
| Launch sets only from banks that meet the standard | 5.5 | |
| Real-device check | 7 | |
