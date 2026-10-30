# The Lab: one Ace Labs

Design direction for releasing Ace Labs as one tool with one feel. Written 2026-10-30.
Mockups: `design/the-lab/mock/` (open `index.html`). Screenshots: `design/the-lab/shots/`.

## The idea in one paragraph

Ace Labs becomes a lab. Each DAT section is a **bench** of **instruments** that students pick up and play with: a microscope stage with a solute knob, a burette that pours, a lens that turns a drawing into an electron micrograph. Every instrument follows one loop, **Call it first**: predict, watch the real thing move, get the verdict and the why, answer one more from memory, and keep an **Ace Card** that comes back on a 1, 3, 7 day ladder. The **true-to-life views** (the bio-real.js wet mounts and TEM, the long bone and ground section) are the showpiece: in this lab, the specimen is always the brightest thing on the screen. Chrome is a dark bench, reading surfaces are paper, specimens are lit. Brass marks anything you can turn. The look comes from the brand Ace Labs already has (deep teal, gold, paper, Playfair, DM Sans, JetBrains Mono). The design takes it further and keeps it.

Everything below obeys ANXIETY_AWARE_DESIGN.md and the house rules. No clock outside a full timed test. No streaks, points, badges for volume, leaderboards, scores or percentages as grades. Confirmed or Needs review, never the other words. Copy is plain ASCII, and motion only explains or gives feedback.

---

## (a) Information architecture

### Five doors, not six

| Door | Phone | Desktop | Holds |
|---|---|---|---|
| Today | dock, slot 1 | top bar | One instrument to play with, the plan for today, cards back today |
| Learn | dock, slot 2 | top bar | The six Retold courses, foundations, Sheets, Tricks |
| Practice | dock, slot 3 | top bar | Six section benches, question sets, Which one is this?, games |
| Tests | dock, slot 4 | top bar | Diagnostic, The Climb, full-length and section tests, Results, Test week |
| Review | dock, slot 5 | top bar | Your Ace Cards (every miss from everywhere, one list) |

**Why Canon stops being a door.** Canon is the one door that leaves Ace Labs. It opens the coaching portal in a new tab. That breaks "one tool, one feel" in the most visible place there is. It also costs room: six doors at 390 px give 12.5 px labels and narrow targets, while five give 78 px slots with icon and label. Canon's sheets are still one tap away in two places. In Learn they are the **Sheets** shelf, and the Canon stays the source. Every Ace Card in Review has a **Sheet** link. If Thomas wants Canon as a sixth door after all, the shell takes it back with one line, but this design recommends against it.

**Phone: doors in a bottom dock.** Most students study on a phone, so the doors sit in thumb reach: a 64 px dock with an icon and a label in each slot. On desktop they move to the top bar. The dock hides in **player mode**: question sets, timed tests and full-screen instruments that carry their own exam bars. This works the way `acelabs.timed` already hides the shell. The Review door shows a quiet gold dot when cards are due. It shows no number, so nothing reads like a backlog.

### Behind each door, in order

**Today** (`/`, ace-labs.html). It shows the plan, never a catalog.
1. **The stage**: one instrument with a Call it first, playable before reading anything. On a first visit it is Tonicity on red cells. Later it is an instrument behind a card that is due, or the next instrument in the weakest section.
2. **Today's plan**: AceProgress.today(), three or four steps, each with minutes. A first visit gets Set up, The diagnostic and Your first Retold night.
3. **Your Ace Cards**: cards back today, as a stack of pictures. Each card opens the instrument it came from.
4. **New on the bench**: three instrument tiles.
5. Footer: About Ace Labs, Settings, and "Ace Labs is not affiliated with the ADA or Prometric."

Cut from Today: the five catalog rooms (Learn, Practice, Repair, Prove, Play). They repeat the doors. Also cut the "Right answers so far" readiness bars, which move to Tests > Results, the "Mnemon, coming soon" tile, and the "DAT in N days" pill. That pill is a countdown. A date chip replaces it: **Test day Dec 10**.

**Learn** (`/learn/`). The spine is the six Retold courses in DAT order: Bio, Retold (14 nights), GChem, Retold (14), OChem, Retold (13), PAT, Retold (10), RC, Retold (10), QR, Retold (14). Under each course sit that section's foundations:
- OChem: The Roots of Organic, The Two Decisions.
- PAT: PAT at a glance, which was the Playbook.
- Bio: A&P Test-Week Review, once its tables fit a phone.

Then two shelves:
- **Sheets**: the Canon (source), the Bio Repair Sheet, Bonus Topics and the 14 trick sheets, with a section filter. This replaces Cheat sheets, the trick sheets gallery and the Canon door.
- **Tricks**: The 14 Chem Tricks, one card per trick with Short, Full video and Sheet.

Each Retold night ends with **Play this** (the matching instrument) and **Practice this** (a question set on that night's topic).

**Practice** (`/practice/`). In this order:
1. The **section switcher**: All sections, Biology, Gen Chem, Organic, PAT, Reading, QR.
2. **The six benches**: one tile per section in DAT order, each with a live specimen window.
3. **Question sets**: practice on the test-day screen.
4. **Which one is this?**: recognition sets across sections, with one playable inline.
5. **Games**: Quick rounds, Chirality Bench, Six Views.
6. A separate card, **Beyond the DAT: Casper practice**.

**Each bench** (the section front page) has the same four steps in the same order: **Learn it** (the Retold course), **Play it** (the instruments), **Practice it** (question sets), **Prove it** (that section's check or test). Then come the showpiece instrument, the instruments grouped by DAT topic, that section's Which one is this? sets, and Sheets.

| Bench | Built from | Play it | Prove it |
|---|---|---|---|
| Biology | /tools/bio/ (the Bio Repair Lab home, reworked) | Six hubs in DAT order: Cell and Molecular, Genetics, Body Systems, Diversity of Life, Development, Evolution and Ecology. Immune Cells nests under Body Systems, Micrographs under Cell and Molecular | Bio check: Short (25) or Full (40) |
| General Chemistry | /tools/gc/ front | Gen Chem skill tree; Titration Curves, Lewis and VSEPR Sandbox, Periodic Trends, Recognition Lab, Common Traps | Gen Chem check (the skill tree diagnostic), then the Gen Chem part of Sciences + QR tests |
| Organic Chemistry | new front over /tools/ochem/tree/ | The Tree of Organic (31 modules), Chirality Bench, Reaction Map (reference) | The Summit (30 questions) |
| Perceptual Ability | /tools/pat/ rebuilt | Six rows in test order. Each row has Learn it (Retold night), Train it (trainer), Speed it (Six Views where it exists) and Prove it (that part of the PAT test) | PAT tests |
| Reading Comprehension | /tools/rc/ front | Passages with proof-line review | Reading sections (timed) |
| Quantitative Reasoning | /tools/qr/ front | QR skill tree, then Skill tools grouped as Number sense, Word problems, Algebra traps, Probability and statistics, Test-day strategy | QR Test-Day Simulation (40) |

**Tests** (`/tests/`). Every item carries a status line ("Test 2 of 4 next", "Rung 3", "Taken Oct 30"):
1. **Start here**: the Diagnostic, honestly labeled as about 45 minutes across Bio, GChem, OChem and QR.
2. **Every day**: The Climb (10 rungs of 40, plus its queue).
3. **Full-length DAT 1 to 4**: the hero card.
4. **Section tests**: Sciences + QR test 1 to 3, PAT tests, Reading sections, QR Test-Day Simulation, The Summit, Bio check.
5. **Results**: Performance, renamed. It shows raw counts per section, never a percentage graded by color.
6. **Test week**: Test-week mode and the Test-day briefing.

**Review** (`/review/`). One list of Ace Cards: Due today, All, Learning, Holding. Section tabs appear when cards span sections. Each card shows its picture and its one-sentence answer, with three links: **Play** (the instrument), **Learn** (the Retold night) and **Sheet**. The two buttons are **Got it** and **Not yet**. The 1, 3, 7 day ladder stays as the existing LEITNER in shared/ace-progress.js.

### One name per thing

| Thing | Student-facing name | Retire |
|---|---|---|
| The product | Ace Labs | AceLabs, AceTheDAT Bio, Remediation System, Mastery System |
| Doors | Today, Learn, Practice, Tests, Review | Repair, Prove, Play, Rooms, Canon (as a door) |
| Sections (short) | Biology (Bio), General Chemistry (Gen Chem), Organic Chemistry (Organic), Perceptual Ability (PAT), Reading Comprehension (Reading), Quantitative Reasoning (QR) | GC, GChem engine, Orgo, RC in headings |
| A section's front page | Biology, Gen Chem, ... (we call the concept a bench; the page title is the section) | Bio Repair Lab, PAT Studio as a page name |
| Interactive visual | instrument | visualizer, node, widget, tool tab, flagship |
| The loop | Call it first | stick layer (internal name only) |
| Real-looking views | True to life (badge) | micrograph-style, realistic mode |
| Recognition drill | Which one is this? | Recognition sets, ID practice |
| Spaced card | Ace Card | miss, repair item, node card |
| The Bio subdivisions | the six hub names above | Cell Lab, Cell Atlas, Genetics Studio, Field Guide, Embryo Atlas, Selection Simulator, Structure and Function, Physiology |
| Gen Chem and QR drill engines | Gen Chem skill tree, QR skill tree | Gen Chem engine, QR engine, GC tool |
| OChem practice engine | The Tree of Organic | Classic course engine (v2), Reaction Maps (as an engine) |
| OChem lookup | Reaction Map (reference) | OChem Reaction Maps |
| PAT trainers | Keyholes, Top-Front-End, Angle Ranking, Hole Punching, Cube Counting, Pattern Folding (method as subtitle) | Aperture Trainer, Calibrated Angle Trainer, Stay 2D |
| Practice in exam look | Question sets | Prometric mocks, drills (for this) |
| Timed tests | Full-Length DAT 1 to 4; Sciences + QR test 1 to 3 | Practice tests, mock catalog, unified mock |
| Bio checks | Bio check: Short / Full | Bio Pulse Check, Bio Weakness Scan, bio-mock |
| OChem 30-question test | The Summit | (Climb rung 10 becomes "Rung 10") |
| The Climb's inner tab | Queue | Today (inside the Climb) |
| One-pagers | Sheets | Cheat sheets, Canon sheets, Repair sheet (as a category) |
| Shorts and videos | Tricks (The 14 Chem Tricks) | The trick library, All sections |
| Results of tests | Results | Performance, Analytics, Readiness |
| PAT order option | Angles-first order | Thomas order |
| Outcomes | Confirmed / Needs review; Got it / Not yet | right/wrong, Missed again |

### What gets hidden or redirected (by inventory status)

| Status | Count | Treatment |
|---|---|---|
| ready | 85 | Keep. Each moves under one door and takes the shell, tokens and naming. |
| rough | 76 | Keep and fix, or fold into a bench. The fixes to make before the showcase are listed under (f). |
| internal | 71 | Never reachable by students. Add forced 301s or 404s in netlify.toml for: every .md under tools/qr, tools/rc, tools/gc, tools/ochem and the root; tools/qr/research/, tools/qr/proposals/agent-10-sarah/ (fake student data), all */tiktoks/ libraries and the three voiceover studios; tools/ochem/roots/dev.html, tree/dev.html, tree/smiles.html; tests/ochem2026/gallery.html (prints answer keys), tests/qr-formats/figures.html, tests/**/*.test.js; tools/mock/verification/*, tools/minitests/source/*; booster-map.html (names a competitor); sliding-filament-tiktok.html; test-screenshots/; scripts/. |
| legacy | 8 | 301: /tools/ochem/v2/ to /tools/ochem/tree/; v2 EAS tiktok to the EAS Directing trick; /tricks/series/ (both entries) to /tricks/shorts/; /mocks-catalog.html and /unified-mock.html to /tests/; /calendar.html to /test-week.html; /retold/ to /learn/. Then delete the files. |
| broken | 1 | /tools/qr/tiktoks/topic-tiktok.html becomes internal. Remove every QR skill tree "Watch" button until a phone-fit explainer replaces it. |
| embedded only | about 10 | The 1080x1920 TikTok canvases stay as embeds (Gen Chem Watch modal, the Climb's fixes) and are never linked as pages. |

### First-run path for a new student

1. **Today, second 0.** The slide is already lit: red cells in a wet mount. The question is "An animal cell drops into pure water. What happens to it?" with three answers. One tap.
2. **Seconds 5 to 10.** The knob turns itself. The cells cup, round up and burst into ghosts, and a brass ruler ticks through four frames.
3. **Second 12.** Confirmed or Needs review, the why, and the hook "Water chases solute."
4. **Seconds 20 to 30.** "One more, from memory" asks about a plant cell in salt water. The slide is veiled, then the Elodea plasmolysis reveal.
5. **Second 35.** The first Ace Card prints, shows the before and after picture, and travels to the Review door. The door lights, and the knob is the student's to turn.
6. **Then the plan.** Set up (2 min: test date and shakiest sections, all six; "Going again?" branches into retake setup), then the Diagnostic (about 45 min), then the first Retold night for the shakiest section. The first full-length test waits a day, which the code already does.
7. **Day 2.** Today opens on the card that came back and the instrument it lives in.

---

## (b) Visual system

### Three surfaces, one rule each

- **The bench** (dark, always): the shell, door pages, section pages and instrument housings. It is the existing dark forest look, kept.
- **Paper** (follows the device): explainers, Ace Cards, sheets and question text. This is the existing cream paper look, kept.
- **The specimen** (never changes): micrographs, fields, curves and drawings inside a `lab-field`. A wet mount is bright in a dark room too. Specimens never invert.

**Brass is for anything you can turn**: knob thumbs, the lens ring, the primary button, the "next" step. **Wong colors are only for answer feedback** (Confirmed #009E73, Needs review #D55E00), always paired with a word and an icon shape. **Section colors are only label tape**: a 3 px edge, a small square, a mono label.

### Tokens (evolve shared/al-tokens.css into shared/lab-tokens.css)

The full set is in `mock/lab.css` section 1. The old names stay as aliases, so nothing breaks:

| Role | New token | Value | Was |
|---|---|---|---|
| Bench | --bench / --bench-2 / --bench-3 / --bench-4 | #0b1610 / #101d16 / #15251c / #1a2d22 | --bg-base, --bg-panel (ace-pages.css) |
| Text on bench | --on-bench / -2 / -3 | 94% / 72% / 56% of #f6f0e4 | --text-hi / -mid / -lo |
| Paper | --paper / --paper-2 / --paper-page | #fffdf7 / #f9f3e6 / #f5f0e8 | --al-paper / --al-paper-2 / --al-bg |
| Ink on paper | --on-paper / -2 / -3 | #0d2018 / #3a4a42 / #55635c | --al-ink / -2 / -mute (darkened to 5.6:1) |
| Brand teal | --teal-700 | #1B3A2D | --al-teal |
| Brass | --brass / --brass-hi / --brass-ink | #C9A84C / #E2C97A / #7a6230 | --al-gold / -m; gold text on paper darkened to 5.7:1 |
| Confirmed | --confirmed / --confirmed-ink / --confirmed-on-bench | #009E73 / #007a59 / #45d3a1 | --al-confirmed |
| Needs review | --review / --review-ink / --review-on-bench | #D55E00 / #b34f00 / #ff9d5c | --al-needs-review |
| Section tape | --sec-bio / gchem / ochem / pat / rc / qr | #7FB77E / #6FA8DC / #B79AD9 / #B4BCC8 / #5CC2B5 / #E58A8A | two clashing sets (al-tokens per-engine and ace-pages --sec-*) merged into one |
| Section ink on paper | --sec-*-ink | #3d7a46 / #2f6aa3 / #6b4f9e / #4f5866 / #1f7a70 / #a6474a | new, all 5:1 or better |
| Stage | --stage-bezel, --stage-rim, --field-light | #050a07, brass at 28%, #f6f1e6 | new |

Contrast was checked against WCAG: every text pair is 4.5:1 or better. Wong hues on paper are 3.4 to 3.8:1, so they are used only for borders and icons, never for small text. Text uses the -ink variants.

**One dark-mode approach.** Semantic tokens live on `:root`. Dark mode flips only the paper tokens, under `@media (prefers-color-scheme: dark)` scoped to `:root:not([data-theme="light"])` and again under `:root[data-theme="dark"]`, with a toggle in Settings. The bench is already dark, so it does not change. Specimens never change. The exam frame in timed tests is always light, like test day. Practice question sets follow the device. This replaces today's three incompatible switches (`body[data-theme]` in GC and QR, `html[data-theme]` in OChem, none in Bio).

### Type

Three families: Playfair Display, DM Sans and JetBrains Mono. Self-host them as woff2 in shared/fonts/. The latin subset is about 250 KB for all three with variable weights, and drops to about 170 KB without the italic DM Sans. Self-hosting retires the split between the shell (Georgia plus Hanken Grotesk) and the engines (Playfair plus DM Sans), and stops the Google Fonts round trip on mid-range Android.

| Step | Family | Phone / desktop | Use |
|---|---|---|---|
| Hero | Playfair 700 | 34 / 60 | Today line, door titles ("Pick up an *instrument.*", with italic brass emphasis) |
| H1 | Playfair 700 | 30 / 46 | Section and instrument titles |
| H2 | Playfair 700 | 23 / 30 | Blocks, the Call it first question |
| H3 | Playfair 700 | 20 | Tile and hub names |
| Body | DM Sans 400 / 600 | 16 / 17, line height 1.55 | Everything you read |
| Small | DM Sans 400 | 14 | Secondary lines (never below 13) |
| Label | JetBrains Mono 600, caps, 0.12 to 0.14em | 11.5 | Eyebrows, badges, stage captions |
| Readout | JetBrains Mono 600, tabular | 14 to 16 | Every number an instrument reports: "2.45 um", "pH 4.74", "12.50 mL" |
| Exam | Arial / Helvetica | 16.5 to 17.5 | The question frame only. It is deliberately plain, like the testing center |

### Space, shape, targets

The spacing scale is on a 4 pt base: 4, 8, 12, 16, 24, 32, 48, 64. The side gutter is 16 px on a phone and 32 px on desktop. Radii are 10 (controls), 16 (cards), 20 (stage) and pills. Every target is at least 44 px; answer rows are 50 to 54 px. Elevation on the bench comes from a 1 px top highlight plus a deep soft shadow, like machined parts. Paper uses one soft shadow.

### Components (all in mock/lab.css, named for shared/lab-components.css)

| Component | Anatomy | Where it shows |
|---|---|---|
| Shell (`lab-shell`, `lab-dock`) | Brand, five doors with icons, context chip (date, never a countdown); dock on phone; player mode hides both | Every page |
| Door header (`door-head`) | Mono eyebrow with icon, Playfair title with italic brass word, one-line lede, the **scale rule** (a brass ruler with major and minor ticks, the lab's one ornament) | Door pages |
| Section switcher (`switcher`) | Pill row with tape squares, scroll-snap on phone, sticky on desktop | Practice and every bench |
| Tool tile (`tile`) | Label tape on top, a specimen window with a live miniature, mono section label, Playfair name, one line, badges (Call it first, True to life, Which one is this?) | Practice, Today, benches |
| Stage (`lab-stage`, `lab-field`) | Dark bezel with brass rim; top line (instrument, magnification); the lit field with a scale bar burned in; caption under the field (the renderer's own reviewed caption); frame ruler; seg control; knob; readout tiles | Every instrument |
| Play panel (`play`, `call`, `verdict`) | Eyebrow (Call it first, Watch it happen, One more from memory, Now it is yours), Playfair question, three call buttons with letter keys, verdict card (icon, Confirmed/Needs review, Why it tempts, Why, the hook in italic), next action | Next to every stage |
| Controls | `knob` (brass thumb on an engraved track, with labeled tick stops), `seg` (view or specimen switch), quiet button, ghost button, brass button | Instruments |
| Ace Card (`acecard`) | Before and after picture (two frames, labeled), mono eyebrow, the one-sentence answer, ladder ticks (1, 3, 7) with "Back tomorrow" | Today tray, Review, explainer foot |
| Card stack and tray | Up to three cards offset; dashed empty tray that says what will land there | Today, bench pages |
| Steps list | Number disc, title, one line, minutes | Today plan |
| Question screen pieces | Exam top bar, exam tool row, stem box, choice rows, coach row (Check, Stuck?), exam bottom bar, explainer panel, picture frame with a play slider, trap list, keep line, links | Question sets, tests |
| Recognition set (`name-chips`) | Field, four name chips (name plus a mono hint), caption that becomes the verdict, Next field | Which one is this? |

### Iconography

One stroke family on a 24 grid: 1.75 px stroke, round caps and joins, inline SVG, `currentColor`. There is no emoji and there are no glyph icons in copy. The set:
- **Doors**: Today (sunrise over a bench line), Learn (open book), Practice (microscope), Tests (clipboard), Review (card stack).
- **Sections**: Bio (cell with nucleus), Gen Chem (Erlenmeyer flask), Organic (hexagon with double bonds), PAT (cube), Reading (page with lines), QR (axes with a curve).
- **Instruments**: knob, lens, drop, play.
- **Outcomes**: Confirmed (check in a circle), Needs review (circular arrow, "comes back").
- **Exam tools**: marker, strike, grid, table.
- **Stuck**: a branching path.

Icons never stand alone. Each one has a word next to it or an aria-label.

---

## (c) Motion and play

### The motion language: instrument motion

Things move like a precise instrument. They start fast and settle exactly, never bounce, never wiggle for attention, and never loop on their own.

| Token | Value | What moves and why |
|---|---|---|
| --dur-tick | 120 ms | Press, hover, toggle. Confirms the touch landed |
| --dur-step | 240 ms | A chip lights, a row checks, a ruler tick fills. Says what changed |
| --dur-reveal | 420 ms | A verdict lands, the explainer slides in, a card prints, the lens grows into the full micrograph. Shows where new information came from |
| --dur-frame | 900 ms per frame | The process the student is watching (the existing bio-stick FRAME_MS): cells swelling, actin sliding, the burette pouring. Runs at the science's pace, never faster |
| --dur-travel | 700 ms | A new Ace Card travels to the Review door. Shows where the miss went |
| --ease-instrument | cubic-bezier(.2,.7,.1,1) | Default: fast start, precise settle |
| --ease-detent | cubic-bezier(.3,1.35,.5,1) | A knob snapping into a named stop, 2 px of overshoot at most |
| --ease-glide | cubic-bezier(.45,0,.2,1) | Panels and travel |

Rules:
1. **Motion that teaches belongs to the specimen and can be scrubbed.** Every process that plays by itself also has a control that drives it by hand: the knob, the contraction slider, the NaOH volume.
2. **UI motion is short and never blocks input.** Nothing waits for an animation to finish before it accepts a tap.
3. **The camera follows the action.** When a process starts off screen, the stage scrolls into view first. When it ends, the verdict scrolls into view (`Lab.follow`). On a phone this makes sure the motion is actually seen.
4. **Nothing loops by itself.** Drops fall only while the stopcock is open. No idle pulsing, no attention shimmer, no progress spinner left running.
5. **Reduced motion keeps the frames and removes the tweens.** The same states appear in the same order, as discrete steps with their captions. The knob jumps to each stop, the card appears in the tray without travel, and the lens swaps instead of growing. Learning content is never removed, only its easing. The existing `al-motion.css` reset already collapses durations; the frame timer stays.
6. **Budget.** Only one live specimen animates per viewport at a time. Heavy SVG filters (the TEM's feTurbulence) re-render only when the state changes, never per animation frame on low-end devices. Specimen frames can be cached as data-URI images (CSP allows `img-src data:`).

### The play patterns (one kit for every section)

1. **Call it first** (predict, then reveal). Three options, one tap, and the stage is veiled or frozen until the call. The engine drives the real instrument through its frames, then shows the verdict with the why and the named trap for the option picked, then one more from memory with no picture, then an Ace Card. A Skip link is always there. This is bio-stick.js, generalized into shared/lab-play.js with step types `set`, `click` and `custom(fn)` per engine.
2. **Scrub a process.** A slider with labeled stops drives a process forward and back: the Krebs stage, the cardiac cycle, NaOH volume, the fold angle of a PAT net, the reading position in a passage.
3. **Drag and manipulate.** A direct handle on the specimen: the solute knob, the lens, a rotatable 3D model (Chirality Bench, Six Views), a bond you turn (Newman), a draggable data point (Stats Lab), the balance scale (Solving linear equations).
4. **Compare views.** Two ways of seeing the same thing, locked together:
   - the **lens** (a drawing with the micrograph under a draggable glass);
   - the **split** (before and after side by side, as on every Ace Card);
   - the **overlay** (weak acid against strong acid, the ghost of the relaxed sarcomere under the contracted one);
   - the **guides** (the gold A band lines in the explainer).
5. **Which one is this?** Recognition sets: a real-looking field with varied arrangement, magnification or orientation, and four names. A miss becomes an Ace Card with that field on it. These sets need seeded variants: the renderers are deterministic today, so each set ships with 6 to 12 seeds per state.
6. **Build it.** Assemble and check: Lewis and VSEPR Sandbox, Punnett solver, cladogram builder, pedigree, probability tree.

### How each section gets them

| Section | First instruments to convert (existing tools) | Patterns |
|---|---|---|
| Biology | Already 15 with Call it first (Tonicity, Cellular respiration, Endocrine glands, Nephron, Action potential, Cross-bridge cycle, Sarcomere bands, Hemoglobin curve, ABO blood types, Menstrual cycle, Bone layers, Lac operon, Hardy-Weinberg, Embryo stages, Homology). Next: the rest of the ~95, and Micrographs rebuilt as Which one is this? on real renderers | All six; true-to-life Compare views is the showpiece |
| General Chemistry | Titration Curves (mocked here), Periodic Trends heatmap, Lewis and VSEPR Sandbox, Recognition Lab as Which one is this? (titration profiles, phase diagrams, reaction coordinates), gas law piston | Call it first, Scrub, Compare (overlay), Build, Which one is this? |
| Organic Chemistry | Tree modules (predict the product, then the arrows move), Newman viewer (turn the bond, watch the energy), Chirality Bench (call R or S, then turn the model), IR and NMR peaks as Which one is this? | Call it first, Manipulate, Which one is this? |
| Perceptual Ability | Hole Punching (call the holes, then scrub the unfold), Pattern Folding (scrub the fold), Top-Front-End and Cube Counting via Six Views, Keyholes (turn the object through the aperture), Angle Ranking (trim the arms) | Call it first, Scrub, Manipulate. Every PAT item is already a recognition item |
| Reading Comprehension | The proof-line review: call the answer, then "Find the proof", tap the sentence; the passage lights the real proof line and dims the rest | Call it first, Compare (your line against the proof line) |
| Quantitative Reasoning | Estimation (call the ballpark before you compute), Probability Sandbox (build the tree, then watch the branches multiply), Stats Lab (drag a point and watch mean and median move), the balance scale for linear equations | Call it first, Manipulate, Build, Scrub |

---

## (d) Three signature moments (the first minute)

**1. The slide on Today.** This is `mock/today.html`. Before reading a word, a new student sees a lit wet mount of real-looking red cells with a 10 um scale bar burned in. One question asks what happens in pure water. One tap, and the knob turns itself: the discs cup, round into spheres, then burst into faint ghosts, at the pace of the science, captioned with the renderer's reviewed descriptions. Then come the verdict and the hook, a second call from memory (Elodea in salt water), and the reveal of plasmolysis. **The wow:** it is not a cartoon, it looks like the microscope they will use in dental school, and they predicted it before it moved. It obeys the rules: no clock, no score, Skip is always there, and Needs review is as calm as Confirmed.

**2. The lens.** This is `mock/bio.html`. On the Biology bench, a brass-ringed glass sits on a drawing of a sarcomere. Under the glass is the electron micrograph of the same spot, drawn to the same scale (200 px per um), so every filament sits over the band it makes. Drag the lens along the fiber. Tap Micrograph and the lens grows until the whole drawing has become the TEM. Contract the muscle and both views slide together while the readouts show "A band 1.60 um, holds". **The wow:** the drawing in the textbook and the image on the exam become one thing under the student's thumb.

**3. The card that flies, and the bench that pours.** Two short moments that carry the loop:
- **The card.** At the end of the first Call it first, an Ace Card prints out of the stage with a before and after picture of what the student just saw. It then travels into the Review door, which lights. **The wow:** a miss turns into something you can see, and you can see where it went.
- **The pour** (`mock/titration.html`). On the Gen Chem bench, the student calls the pH at half-equivalence, then watches drops fall from a real burette. The curve draws itself, pauses at "pH = pKa = 4.74", and the flask blushes pink at 8.72. Compare lays HCl's curve over it.

Both moments turn an abstract rule into something that physically happens.

---

## (e) The DAT-style question screen

`mock/question.html` (practice) and `mock/question.html?mode=timed` (timed). It is built to slot into the single player recommended in `question-system/dat-interface.md`: based on tools/mock/full.js, with the highlighter and cross-out from rc.js, Review All / Marked / Incomplete stepping, one calculator, one periodic table, and no topic or difficulty tags during a test. The explainer standard (`explainer-standard.md`) was not written yet when this was designed. The explainer below names its fields so that standard can fill them.

### The exam frame (both modes)

- **Top bar** (deep teal #1B3A2D, Arial): "Question 4 of 10" with the set name under it on the left; the test name in the center; on the right, **Leave set** in practice or **Time remaining 1:21:47** in timed tests only. The time never pulses; at most it changes to a steady color under 5 minutes.
- **Tool row**: Highlight (select text, then press) and Cross out (toggle, or right-click a choice). In practice, a quiet note at the right says "Practice: no clock. Check shows the explainer."
- **Stem box**: a 2 px ink border with the stem at 17.5 px Arial and five choices. Each choice is a radio plus a bold letter plus text, at least 48 px tall. PAT keeps 4 or 5 choices by subtest.
- **Bottom bar** (teal, in the DAT order the full mock uses): Previous, Next, Mark, Review, Exhibit (sciences) or Calculator (QR). Underlined letters stand for Alt shortcuts. Mark turns to "Marked" with its own state color, never the same as an open tool.
- **No Ace Labs color inside the frame.** No subject chips, no topic tags, no brand. The real test is plain, and so is this.

### Practice mode: what Ace Labs adds, and where

Only two things, both inside the stem box under the choices, so the exam bars stay exactly the test's:
- **Check** (brass): unlocks once a choice is picked.
- **Stuck?**: opens the three-option triage from ANXIETY_AWARE_DESIGN.md, tuned per section. Bio: Three quick recall cards / Step back to the hub overview / Move on for now. QR and Gen Chem: Three quick wins / 60-second breath / Move on. OChem: Three quick wins / Reagent reference / Move on.

### After Check: where the explainer and the visual go

- **Choice marks**: the answer row gets a green edge, a confirmed icon and "Answer". The student's row, if different, gets an orange edge, the again icon and "Your pick". Rows keep their letters, and nothing else in the frame moves.
- **The explainer panel**: paper, in Ace Labs type. On desktop it slides in from the right, and the exam frame takes the left column at full height, so the stem and the explanation sit side by side. On a phone it lands under the choices, and the camera scrolls to it. The bottom bar stays put.

The explainer's sections, in order (each one a field the explainer standard can fill):

1. **Verdict line**: Confirmed or Needs review, then the answer in one sentence: "You picked C. The answer is D, A-band. It is the length of the myosin, and myosin never shortens."
2. **The picture** (field: `visual`): a live miniature of the instrument, not a static clipart. Here it is the true-to-life TEM of the same sarcomere relaxed and fully contracted, with gold guides at the A band edges and "A BAND HOLDS". A **play slider** under it contracts the lower one. Below that is a caption saying what to look at. A link opens the full instrument.
3. **Why D** (field: `why`, from the bank).
4. **Why the others tempt** (field: `traps[]`, one per distractor, from the bank). The student's pick is flagged.
5. **Keep this** (field: `keep`, the one-line pattern). It comes from the instrument's hook ("A band stays (it is myosin). I and H shrink."), set in italic Playfair.
6. **Foot**: "An Ace Card is made. It comes back tomorrow, with this picture on it." Then three links: **Open the instrument**, the Retold night (field: `nights`), and **Sheet**.

**The visual standard: every instrument is also a picture factory.** The same renderer draws the live instrument, the explainer picture, the Ace Card picture and the recognition fields: BioReal.tonicity, BioReal.temStrip, the bone renderer, the titration solver, the OChem SMILES drawer, the PAT generators. A question's `visual` field names a renderer and its parameters, for example `{ kind: 'tem-pair', from: 2.45, to: 2.0 }` or `{ kind: 'wetmount', cell: 'animal', solute: 4 }`. This is how "every question has a visual" scales to the roughly 8,500 distinct items the census counted. Today about 1 record in 4 has any visual and about 1 in 6 has a detailed per-choice explainer, and the gap closes renderer by renderer. Where the DAT itself shows a real image (micrographs, spectra, PAT figures), the visual is true to life. Where the DAT shows a schematic, the visual is the schematic, with a "see the real thing" lens where one exists.

### Timed mode

Same frame, no Check, no Stuck, no explainer. The clock is upper right, and the shell and dock are hidden (`acelabs.timed`). A test is always light. Explainers open from Results after the section, using the same panel.

### Accessibility

Choices are a real radiogroup: arrow keys move, Space selects. Alt shortcuts mirror the test, and every target is at least 44 px. Verdicts are announced (`role="status"`). The picture has an aria-label that states the finding in words. Strike-through is visual only and never reveals anything.

---

## (f) Migration plan: 241 pages to one feel, least risk first

The principle: **change shared files, not pages.** The shell is already one script on every student page, tokens are already shared, and the Bio hubs already share one CSS and one JS. Each phase ships alone, is reversible, and passes the existing ship gates. Those gates check placeholders, dead links, cache versions, storage keys, the glyph ratchet, competitor names and count claims. Each phase also passes four new gates: every page fits 390 px with no sideways scroll; text contrast is 4.5:1 or better (checked from the tokens); a reduced-motion snapshot; and a grep for any clock outside timed paths. Top-30 page screenshots at 390 and 1280 must match the approved set.

| Phase | What changes | Reach | Risk |
|---|---|---|---|
| 0. Names and hiding | Titles, labels and door names from the naming table; the netlify.toml blocks and 301s; Today's swapped Bio labels; the "DAT in N days" pill becomes a date; coach-only toggles (Coach mode, Teach mode, Edit Mode, seeds, CSV export) move behind ?coach=1 | Copy only | Lowest |
| 1. Tokens v2 | shared/lab-tokens.css; al-tokens.css and ace-pages.css re-point their old names to it; bio-shared.css, the GC and QR inline roots and OChem's root alias to it; self-hosted fonts; the one dark-mode switch | Every page, through variables | Low: values barely move |
| 2. Shell v2 | Five doors, dock on phone, player mode, Review dot, Canon into Learn. One file. | All 241 pages at once | Medium. Mitigation: an opt-out attribute (`data-ace-shell="top"`); a sweep for fixed-bottom elements (the floating C button, Gen Chem Menu/Note, the OChem pill), which phase 0 already removes; the dock reserves its own padding |
| 3. Door pages and bench fronts | Today, Learn, Practice, Tests and Review rebuilt from the components; six new bench front pages that link into the existing engines | 11 pages, all new or shell pages | Low: engines untouched, and this is the biggest visible change |
| 4. The play kit | bio-stick.js becomes shared/lab-play.js (engine adapters), plus shared/lab-which.js (recognition sets with seeds) and the stage, verdict and card components. Bio first (already live), then Titration Curves, Periodic Trends, Lewis, Tree modules, PAT trainers, QR widgets, RC proof lines. Misses go through AceProgress.registerMissAdapter so every card lands in Review | Engine by engine | Medium per engine; each is its own release |
| 5. The question player | One player from tools/mock/full.js (practice mode with Check and the explainer panel; timed exam look). Diagnostic, Sciences + QR tests, The Climb, Bio check, The Summit and the QR simulation move onto it; full-length results get wired into ace-progress (al:mockHistory is unread today) | Every test surface | Medium: guard with the existing per-test result keys |
| 6. Engine skins | One engine at a time: alias tokens, swap its header for the door header and switcher, wrap visualizers in the stage, hide dev counters. Order: the Bio hubs (one CSS reaches six hubs), PAT trainers (one theme), Gen Chem skill tree, QR skill tree and drills (move to /tools/qr/drills/), the RC player, then the OChem Tree, which is already close | Per engine | Low to medium |

**Leave alone** (they take the shell and tokens, nothing else):
- the Retold courses' scene engines (ready, with their own narrative design);
- the bio-real.js and bio-bone.js renderers, which are reviewed for histology accuracy. The design wraps them and never restyles a specimen;
- the PAT test generators;
- the Casper console;
- The Climb's internals;
- Recognition Lab and Common Traps (ready);
- the trick videos, until narration exists;
- the 1080x1920 canvases, which stay embed-only.

**Fix before the showcase** (from the inventory):
- Biology: the Punnett "AA" label bug; stale "0 / 7 live" counters and "flagship coming"; the Restart button that wipes Ace Cards, sitting next to the cards.
- Tests: blank molecules in Sciences + QR tests (SmiDrawer selector); full-length results invisible to Performance and Review; diagnostic items that overlap the practice tests.
- PAT: Retold night 7's painted-cube rule.
- Gen Chem skill tree: the double modal and scroll jump on a phone.
- The A&P review's and the 60-day plan's sideways scroll.

---

## Risks and open questions

- **Content is the bottleneck, not code.** Call it first needs a predict, three traps, a why, a check and a hook per instrument. The question visuals need a renderer per topic. Plan authoring with the existing validators (validate-bio-stick.mjs) and the histology-review loop.
- **SVG id collisions.** Any page that shows several true-to-life frames (recognition grids, explainer pairs, card stacks, tile windows) must namespace ids. Without it, `<use href="#rl-d">` draws the first frame's cells everywhere. bio-stick.js sanitize() already does this for snapshots, and the mock's `Lab.ns()` does it for every new multi-frame view. Make one shared helper.
- **Phone performance.** The TEM filter and many live tiles can stutter on a mid-range Android. Keep one live specimen per viewport and use cached images for tiles and cards.
- **Dock conflicts.** Engines with their own fixed bottom UI need the phase 0 cleanup before phase 2.
- **The DAT frame is partly unverified.** Button order, End placement, highlight scope and the periodic table all need the tutorial walk in dat-interface.md section 7. The frame here follows the full mock, which is the closest verified copy.
- **Canon as a door** is a product call for Thomas. This design recommends Sheets in Learn.
- **Confidence ratings.** ANXIETY_AWARE_DESIGN.md asks for 1 to 5 after each problem, but the house rules forbid them before feedback. This design has none. If they return, they come only after the verdict, optional, and only tune scheduling.
- **Geometry and trig in QR** stays hidden until Thomas settles whether they are on the DAT.
- **Which one is this? needs variety.** It needs seeded variants of each renderer (cell layouts, magnifications, orientations) so that students learn the state, not the picture.

## Files

- `spec.md` (this file)
- `mock/index.html`, `today.html`, `practice.html`, `bio.html`, `question.html`, `titration.html`
- `mock/lab.css` (tokens and components), `mock/lab.js` (shell, icons, the play helpers: wetMount, pairPic, ns, travel, follow)
- `mock/vendor/bio-real.js` (the repo renderer, with the polish/cells and polish/sarcomere changes merged), `mock/fonts/` (self-hosted woff2)
- `shots/*-phone.png` (390x844) and `shots/*-desk.png` (1280x800), deviceScaleFactor 2
