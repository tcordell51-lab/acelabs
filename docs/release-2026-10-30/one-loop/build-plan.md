# One Ace Labs: the build plan

How to build `spec.md` in the acelabs repo as ordered batches that run in
parallel git worktrees without touching the same files. Each batch lists the
files it owns (it is the only batch that edits them), what changes, how it is
accepted, and what it must not touch. Mockups to copy from:
`mock/assets/*` and `mock/*.html` in this folder.

## How the waves work

| Wave | Batches (parallel inside a wave) | Starts when |
|---|---|---|
| 0 | B1 Foundation | now |
| 1 | B2 Front door; B3 Question player; B4.1 Bio; B4.2 GChem; B4.3 OChem; B4.4 QR; B4.5 RC; B4.6 PAT and games; B4.8 Support pages; B5.1 Hide internal | B1 is merged |
| 2 | B4.7 Tests and mocks; B5.2 Legacy redirects | wave 1 is merged (B4.7 needs B3's player) |
| 3 | B5.3 Deletions; B6 Release sweep | wave 2 is merged |

Rules that keep worktrees conflict-free:

1. **Only B1 edits `shared/`.** The `/shared/*` folder is served with an
   immutable cache, and `scripts/gate-shared-versions.mjs` requires that a
   changed shared file ships under a new `?v=` on every page that includes it,
   in the same commit. A shared change therefore edits pages across every
   area, so it happens only in B1 (wave 0, alone). If a wave-1 batch needs a
   shared change, it files it for a short **B1.1 patch** that runs between
   waves, alone, and bumps every includer.
2. **Only B5 edits `netlify.toml` and `_redirects`**, except B1, which removes
   the Google Fonts hosts from the CSP in wave 0.
3. **Only B1 edits `package.json`.** It adds every script later batches need,
   with globs over test folders each batch owns (`tests/kit/`, `tests/loop/`,
   `tests/doors/`, `tests/player/`, `tests/areas/<area>/`). Later batches add
   test files only.
4. **Engine skins live in the engine's folder** (`tools/<engine>/...-skin.css`),
   never in `shared/`. `/tools/*` is served with a one-hour must-revalidate
   cache, so no `?v=` dance.
5. **Banks and answer keys are never edited** by any batch. Explainers live in
   sidecars (B3). Retold scene internals, `tools/bio/bio-real.js`,
   `tools/bio/bio-bone.js`, the PAT generators, the OChem Tree, Roots and
   Summit internals, the RC reading engine and the Casper console are left
   alone except where a batch below says otherwise.
6. **Every batch passes, before merge:** `npm test`; the copy gate on the
   files it touched, strict (no ratchet allowance); the 390 px overflow audit
   and the 44 px target audit on its pages; its screenshot set at 390 x 844
   and 1280 x 800 (light, dark, reduced motion where motion exists), compared
   by eye with the mockups; no console errors.
7. **Redirect order:** repoint in-site links first (in the batch that owns the
   linking file), add the forced 301 (B5), delete the file last (B5.3). Never
   delete in the same commit as a repoint. `gate-dead-links` treats a
   redirect as an existing target, so this order keeps it green throughout.

Shared names used below: **copy gate** = `scripts/gate-copy.mjs` (B1);
**page audit** = `scripts/audit-pages.mjs` (B1; Playwright: overflow at 390,
targets under 44 px in `main`, console errors, a reduced-motion snapshot);
**shots** = `scripts/shoot-pages.mjs <list>` (B1; 390 and 1280, light and
dark, into `test-screenshots/<batch>/`, which is redirected and not served).

---

## B1. Foundation (wave 0, alone)

Tokens, fonts, components, motion, the play-loop engine, the shell, the
planner, the gates. Nothing a student sees changes except the nav, fonts and
names; every page keeps working through the `--al-*` primitives.

**Files owned**

| File | Change |
|---|---|
| `shared/al-tokens.css` | Rewrite as tokens v2 from `mock/assets/tokens.css` minus the `@font-face` block: every existing name and value kept, nothing `--al-*` themed, new primitives, `--s-*`/`--b-*` roles, dark mode on `--s-*` only, motion and type tokens, reduced-motion block. Bump `?v=2` to `?v=3` on all 13 includers |
| `shared/al-fonts.css` (new) | The five `@font-face` rules pointing at versioned files |
| `shared/fonts/playfair-v1.woff2`, `playfair-italic-v1.woff2`, `dmsans-v1.woff2`, `dmsans-italic-v1.woff2`, `jetbrainsmono-v1.woff2` (new) | Latin subsets (from `mock/assets/fonts/`); version in the file name, since CSS font URLs are not checked by the `?v=` gate |
| `shared/al-kit.css` (new) | `mock/assets/kit.css` without the shell rules: buttons, chips, coach band, door header, switcher, tool card, bench, band, field, options, verdict, drive, knob, wipe, Ace Card, ladder, plan, panel, lanes, toast, Stuck sheet |
| `shared/al-kit.js` (new) | `AL` from `mock/assets/kit.js` without the shell: icons (Today is the sunrise), `band`, `follow` (with `to` and `prefer`), `fly` (to any target), `settle`, `toast`, `flip`, `uniq` (namespaces `rl-` and `dw-` ids; one helper for every multi-specimen view), `reduced`, `wait`, date helpers using the device date |
| `shared/al-loop.js`, `shared/al-loop.css` (new) | The shared Call it first engine (spec 3.4): `AceLoop.mount(host, entry, driver)` plus the pieces in `mock/assets/loop.js` (options, hold, reveal, collapse, verdict, card, keep, stuck). Drivers `steps`, `tween`, `custom`; stills for reduced motion; a miss writes its card at the verdict through the `play-cards` adapter; Stuck tuned per section |
| `shared/ace-shell.js`, `shared/ace-shell.css` | Shell v2: five doors (Canon removed), icons, ring and bead (desktop), gold tick (phone), Review dot read from `acelabs.v1.dueToday`, bottom tab bar only on pages with `html[data-ace-shell-pos="bottom"]`, top elsewhere; keeps every existing hide rule, `?student=` carry-over and the fixed-bar hold; the document-level `@font-face` swaps Hanken for Playfair and DM Sans (same versioned URLs). Bump `?v=1` to `?v=2` on all 132 includers |
| `shared/ace-progress.js` | Additive only: `todayPlan()` (spec 1.7), `registerMissAdapter('play-cards', ...)` reading the new `acelabs.v1.playCards` store, `addPlayCard(card)`, writes `acelabs.v1.dueToday` whenever `misses()` runs, a result adapter for `al:mockHistory` (full-length results reach Your results and Review). `today()`, `nextTest()`, `climbQueue()` and every existing key unchanged. Bump `?v=3` to `?v=4` on its 4 includers |
| `shared/ace-coach-lines.js` (new) | The coach line library: slots, about 40 lines (placeholders marked for Thomas to write), the source-line rules; no line presents itself as written that morning |
| `shared/ace-index.js`, `shared/ace-route.js` | Regenerated / edited for the name table: RC night 8 becomes "Trap Answers: How the Traps Are Built", Canon sheet "Thermodynamics: the sign of delta G", course and section names per spec 1.4. Bump `?v=` on their includers |
| `tools/rc-retold/index.html` | Only the night 8 title string (the source of the generated index) |
| `scripts/build-ace-index.mjs` | Name overrides for Canon titles with non-ASCII |
| `shared/ace-labs-shell.css`, `shared/al-motion.css` | Point their local values at tokens v2 roles; bump `?v=` on their includers |
| Every HTML page that loads Google Fonts (140) | Replace the Google Fonts `<link>`s with `/shared/al-fonts.css?v=1` and add a preload for `dmsans-v1.woff2` and `playfair-italic-v1.woff2` |
| `netlify.toml` (CSP line only) | Drop `https://fonts.googleapis.com` and `https://fonts.gstatic.com` from `style-src` and `font-src` |
| `package.json` | Scripts: `gate:copy`, `gate:clock`, `gate:contrast`, `test:kit` (`node --test tests/kit/*.test.js tests/loop/*.test.js tests/doors/*.test.js tests/player/*.test.js tests/areas/*/*.test.js`), `audit:pages`, `shots`; add `gate:copy -- --baseline`, `gate:clock`, `gate:contrast` to `test:gates` and `test:kit` to `test:unit` |
| `scripts/gate-copy.mjs`, `scripts/copy-baseline.json` (new) | Student-facing copy: non-ASCII (including the middle dot), em and en dashes, wrong / incorrect / failed, streak, points, XP, leaderboard, best score, badge, "N days left" or "days to go", payment words; ratchets against the baseline like `gate-house-glyphs --baseline`; `--strict <files>` for a batch's touched files |
| `scripts/gate-clock.mjs` (new) | No countdown text or timer code ("Time remaining", "left", `setInterval` clocks) outside `tools/mock/` timed paths and an allowlist for the existing timed tests |
| `scripts/gate-contrast.mjs` (new) | Computes every text pair in spec 2.3 from `shared/al-tokens.css` in both themes; fails under 4.5:1 |
| `scripts/audit-pages.mjs`, `scripts/shoot-pages.mjs` (new) | The page audit and shots described above (Playwright from devDependencies) |
| `tests/kit/*.test.js`, `tests/loop/*.test.js`, `tests/shell/ace-plan.test.js` (new) | jsdom: tokens parse and keep every v2 `--al-*` value; shell renders 5 doors, current door marked three ways, dot from the key, bottom only on opt-in, hidden on timed; `AL.uniq` makes ids unique; `AceLoop` one-tap lock, Skip as "Shown without a call", reveal tags, miss writes a card, reduced motion turns auto-play into Next frame; `todayPlan()` at most 4 steps, step 1 playable, re-plan on a play miss, test-week mode at 14 days, source line kinds |

**Acceptance**
- `npm test` passes, including the unchanged `tests/shell/ace-progress.test.js`
  and `gate-shared-versions`, `gate-dead-links`, `gate-localstorage-keys`.
- `gate:contrast` passes; `gate:copy` baseline written; `gate:clock` passes.
- Shots of every door page (current versions), three engines per section and
  `tools/mock/full.html` at 390 and 1280, light and dark: the nav shows five
  doors; nothing else moved; no page turned dark in dark mode unless it reads
  `--s-*` (none yet); `prometric-mock.html` looks the same in dark mode.
- Page audit on 30 pages: no new overflow; fonts load from `/shared/fonts/`
  only (no request to Google).

**Must not touch:** page layouts, engine scripts, banks, `tools/bio/bio-stick.js`
(B4.1), any redirect.

---

## B2. The front door (wave 1)

Today, Learn, Practice, Tests, Review, Settings and the six section pages,
rebuilt on the kit, from `mock/today.html`, `learn.html`, `practice.html`,
`tests.html`, `review.html`, `biology.html`.

**Files owned**

| File | Change |
|---|---|
| `ace-labs.html` | Today: coach band, step 1 live (Call it first through `AceLoop`, Tonicity first visit), plan from `AceProgress.todayPlan()` with FLIP re-plan, the way back, six sections, next test, footer with Settings; first run inside Today (three questions, plan builds itself); `data-ace-shell-pos="bottom"`. Inline script moves to `doors/today.js` |
| `ace-labs-classic.html` (new) | The current Today, kept for one release, reached by `/?classic=1` |
| `learn/index.html`, `practice/index.html`, `tests/index.html` (Tests door, including `#results` from `AceProgress.results()` in raw counts), `review/index.html` (fresh-question retrieval for cards that have one, Got it / Not yet fallback, ladder, filters, Common Traps) | Rebuilt on `al-kit.css`; stop loading `ace-pages.css` |
| `settings/index.html` (new) | Theme (Auto, Light, Dark into `html[data-theme]` and localStorage), test date, shakiest sections, daily minutes, Going again scores, Restart my cards (two-step confirm; replaces the Bio hub Restart) |
| `bio/index.html`, `gchem/index.html`, `ochem/index.html`, `pat/index.html`, `rc/index.html`, `qr/index.html` (new) | Section pages on the one template (spec 1.3), linking into engines; heroes: Which one is this? (Bio), Titration curves (GChem, links to B4.2's page until it ships), Chirality Bench, Hole Punching, Find the proof line, Mean or median? |
| `doors/*.js`, `doors/doors.css` (new) | Page scripts and the few page-level styles (no inline script blocks) |
| `learn/sheets/` (new), `scripts/build-sheets.mjs` (new) | Sheets shelf from `AceIndex.canon`; the script renders Canon sheets into `learn/sheets/<id>.html` when the Canon source is present on the build machine; until then a sheet link opens the portal page in the same tab |
| `tests/doors/*.test.js` (new) | jsdom: Today renders from fixtures (returning, first run, re-plan), no countdown or day counter, Review dot cleared after review, section pages list in DAT order |

**Acceptance**
- Shots at 390 and 1280: Today (returning, first visit, every loop state from
  `scripts/shoot.cjs` in this folder, re-plan, dark, reduced motion, Stuck),
  Learn, Practice (all, filtered), Tests, Review (before and after a card),
  Settings, six section pages; each compared with its mock.
- First phone screen of Today shows the coach line, the sharp before field,
  the question and all three calls above the tab bar.
- Page audit clean; copy gate strict on owned files; `npm test`.

**Must not touch:** `shared/*`, engines, `performance/index.html` (redirected
in B5.2), `onboarding.html` (B5.2), banks.

---

## B3. The DAT-style question player (wave 1)

One player for every question surface (spec 5), built from `tools/mock/full.js`
and `mock/question.html`, `mock/assets/exam.css`, `mock/assets/question.js`.

**Files owned**

| File | Change |
|---|---|
| `tools/mock/player.js`, `tools/mock/player.css` (new) | The reusable player: `AcePlayer.run({ items, mode: 'practice'|'timed', set, form, section, onResult })`; top bar, tools row (Highlight select-then-press with tap-to-remove, Cross out toggle and right-click, struck stays selectable), exam card without subject or topic lines, 48 px radio rows, footer in DAT order with Alt shortcuts, Mark in neutral gold, Review screen with Review All / Marked / Incomplete as stepping modes and End section with the "a guess can only help" confirm, Exhibit (one periodic table, ASCII constants line), Calculator (one component, QR only), RC split with phone tabs, PAT figures black on white; practice adds Check and Stuck; timed adds the clock (steady) |
| `tools/mock/explainer.js`, `tools/mock/explainer.css` (new) | The explainer in the standard's order; desktop panel from 1100 px with a 320 ms slide (cut under reduced motion), inline on phones with a scroll to it; a miss writes its Ace Card through `AceProgress.addPlayCard`; Keep it for Confirmed |
| `tools/mock/visuals/core.js`, `bio.js`, `chem.js`, `qr.js`, `pat.js`, `rc.js` (new) | Renderers ported from `question-system/preview/renderers/`, reading the host width (12 px text minimum at 358 px), the trap map (Where each choice comes from) and See each choice under the microscope, `AL.uniq` on every specimen |
| `content/explainers/index.json` and the 18 pilot records (new) | Sidecars per `explainer-standard.md` 5.2, from `question-system/pilot.json`; loader with the guard (key text, stem hash, choice texts) and fallback to the bank's `why` |
| `tools/mock/full.js`, `tools/mock/full.css`, `tools/mock/full.html` | Full-length DAT 1 to 4 run on `AcePlayer` in timed mode; landing copy fixed ("same tools" true now); results write `al:mockHistory` so Your results and Review see them; explainers open per item after a section |
| `practice/set.html`, `tools/mock/set.js` (new) | Question sets: choose section and topic, ten items, practice mode, only from banks that pass the explainer standard |
| `scripts/test-full-mock.mjs` | Extend for practice mode and review modes |
| `tests/player/*.test.js` (new) | Check unlocks after a pick; tags Answer / Your pick; no clock in practice; clock in timed; Review Marked steps only marked; strike keeps selectable; explainer guard falls back; no explainer text cites a letter; Alt shortcuts |

**Acceptance**
- `npm run test:fullmock` and `npm test` pass.
- Shots 390 and 1280: practice before and after Check (both mock items), each
  explainer block, trap map, see each choice, Highlight and Cross out, Stuck,
  timed, Review screen and End confirm, Exhibit, Calculator, an RC item (phone
  tabs), a PAT item; dark mode shows the screen unchanged (light).
- Copy gate strict on owned files; page audit clean (all tools 44 px).

**Must not touch:** `tools/mock/data/full-mocks.js` and every other bank or
key, `shared/*`, other test surfaces (B4.7 moves them).

---

## B4. One batch per area (wave 1, except B4.7 in wave 2)

Each engine adopts tokens v2 through a skin file that maps its local token
names onto `--s-*` / `--b-*` roles, removes its own dark-mode switch (mapped
to `html[data-theme]`), sets `data-ace-shell-pos` (`bottom` once its fixed
bottom UI is gone, otherwise `top`), turns `html data-ace-skin="2"` on
(removing it rolls the skin back), hides coach-only controls behind
`?coach=1`, applies the names in spec 1.4, and makes every Retold night open
with a call and close with Play this, Sheet and Prove it. Call it first sets
are data files that `AceLoop` mounts; each area adds a validator test under
`tests/areas/<area>/`.

### B4.1 Biology

**Files owned:** `tools/bio/index.html` (becomes Repair a miss), `bio-cell.html`,
`bio-genetics.html`, `bio-physiology.html`, `bio-diversity.html`,
`bio-devo.html`, `bio-evolution.html`, `bio-immune-cells.html`,
`bio-micrographs.html`, `bio-bonus.html`, `bio-repair-sheet.html`,
`bio-ap-bootcamp.html`, `bio-shared.css`, `bio-shared.js`, `bio-stick.js`,
`bio-stick.css`, `bio-stick-data.js`, `bio-registry.js`, new
`tools/bio/bio-skin.css`, new `tools/bio/bio-which.js` and
`tools/bio/bio-which-data.js`, `tools/bio-retold/index.html`,
`scripts/validate-bio-stick.mjs`, `scripts/validate-bio-registry.js`,
`tests/bio/*`, `tests/areas/bio/*`.

**Changes**
- `bio-stick.js` stays in place as a thin Bio adapter over `shared/al-loop.js`
  (the `BIO_STICK_ENTRIES` contract and the `addAceCard` path unchanged);
  entries gain `trapNames`; the validator learns the new field.
- Hubs renamed (Cell and Molecular ... Evolution and Ecology); sidebar into a
  drawer on phones; Coach mode, the floating C and Restart behind `?coach=1`
  (Restart moves to Settings); stale counters and "flagship coming" removed.
- Fixes: the Punnett ratio label (`.gen-ratio-row .lbl` uppercase turns Aa
  into AA); A and P tables fit 390 px; the Body Systems link to the sliding
  filament canvas removed.
- The sarcomere lens (from `mock/assets/lens.js`) as the Body Systems Real
  view; Which one is this? sets (tonicity built; sarcomere state, bone tissue,
  mitosis phases next) with 6 to 12 seeded variants per state; Micrographs
  rebuilt on the real renderers once Thomas signs off each view.
- Bio, Retold: opening calls, closing links, Teach mode behind `?coach=1`,
  "silent" labels where no narration exists.

**Acceptance:** `npm test` (`validate:bio`, `validate:bio-stick`, `test:bio`
including `bio-stick.test.js`), `npm run test:init`, `npm run test:browser`;
shots of the six hubs, Repair a miss, Immune cells, Micrographs, A and P
review at 390 and 1280 (light, dark), one Call it first per hub mid-play and
reduced motion, the lens, a Which one is this? set; page audit clean (no
sideways scroll on the A and P review).

**Must not touch:** `bio-real.js`, `bio-bone.js` (except a label-size fix
Thomas signs off), `bio-mock.html`, `bio-diagnostic.html` (B4.7),
`bio-calendar.html`, `bio-analytics.html`, `sliding-filament-tiktok.html` (B5).

### B4.2 General Chemistry

**Files owned:** `tools/gc/index.html`, `tools/gc/lewis-sandbox.html`,
`recognition-lab.html`, `traps.html`, `trends.html`, new
`tools/gc/titration.html`, `tools/gc/titration.js` (from
`mock/titration.html`), new `tools/gc/gc-skin.css`, new
`tools/gc/play/gc-play-data.js` (Titration curves, Q vs K, Le Chatelier),
`tools/gchem/index.html`, `tests/areas/gchem/*`.

**Changes:** GChem skill tree tokens alias only (no layout surgery on the
1.4 MB page), one setup step, the double modal and scroll jump fixed, Edit
Mode behind `?coach=1`, the Menu and Note fixed buttons kept with
`data-ace-shell-pos="top"`; Lewis Sandbox fits 390 px; Recognition Lab runs as
an untimed Which one is this? set with no streak or best score; Titration
curves ships as the GChem Call it first (values match the bank keys: 4.74);
GChem, Retold opening calls and links.

**Acceptance:** shots of the skill tree (setup, a module, Watch modal), Lewis,
Recognition Lab, Traps, Trends, Titration (every loop state, Compare) at 390
and 1280; the titration readouts checked against FULL_4 GChem item 9 and the
skill tree's indicator item; `npm test`; page audit.

**Must not touch:** `tools/gc/*.json` data, `tools/gc/tiktoks/*` (embeds stay;
B5 hides the library and studios), Push the piston (not in this release).

### B4.3 Organic Chemistry

**Files owned:** `tools/ochem/index.html` (Reaction Map, reference),
`tools/ochem/tree/tree.css`, `tools/ochem/roots/roots.css`,
`tools/ochem/decide/decide.css`, `tools/ochem/decide/index.html`,
`tools/ochem/tree/index.html` and `tools/ochem/roots/index.html` (head and
shell attributes only), new `tools/ochem/ochem-skin.css`, new
`tools/ochem/play/ochem-play-data.js` (SN1/SN2/E1/E2 from The Two Decisions,
Newman: call the most stable), `games/chirality/index.html` (call R or S
first), `tools/organic/index.html` (OChem, Retold), `tests/areas/ochem/*`.

**Changes:** tokens only for the Tree, Roots and Decide; the OChem local dark
mode mapped to `html[data-theme]`; the Reaction Map renamed and labelled as
reference; the "Classic course engine" chips removed (repoint for B5.2);
OChem, Retold opening calls and links.

**Acceptance:** shots of the Tree (a module mid-predict), Roots, Two
Decisions, Reaction Map, Chirality Bench at 390 and 1280; `npm test`; page
audit.

**Must not touch:** tree and roots modules, `draw.js`, `mechdraw.js`, banks,
`tools/ochem/summit/*` (B4.7), `tools/ochem/v2/*` (B5).

### B4.4 Quantitative Reasoning

**Files owned:** `tools/qr/index.html`, `tools/qr/qr-formats-module.js`,
`tools/qr/qr-pattern-system-v1.html` (Pattern Library),
`tools/qr/proposals/agent-02-foundation/*.html`,
`tools/qr/proposals/agent-03-patterns/*.html` and `_shell.css`,
`tools/qr/proposals/agent-04-prob-tree/probability-sandbox.html`,
`tools/qr/proposals/agent-05-stats/*.html`,
`tools/qr/proposals/agent-08-pacing/guess-ev.html`, `pacing-sim.html`, new
`tools/qr/qr-skin.css`, new `tools/qr/play/qr-play-data.js` (Mean or median?,
successive percents, the at-least-one flip), `tools/qr-retold/index.html`,
`tests/areas/qr/*`.

**Changes:** the tour modal, AGENT and Tier labels and every Watch button
removed (this repoints the broken topic canvas); the local dark mode mapped;
widgets retitled by skill (spec 1.4) and given the shell attribute; Mental
math and pacing drills untimed by default (pace as an opt-in inside Tests);
Stats Lab fits 390 px; QR, Retold opening calls and links. Widget paths do
not move in this release (a later move would change `shared/ace-index.js`).

**Acceptance:** shots of the skill tree (diagnostic, a module, the Test-Day
Simulation start), six widgets, Pattern Library at 390 and 1280; `npm test`
(`test:qr-formats`); page audit; `gate:clock` clean for drills.

**Must not touch:** `agent-06-geometry/*` (pending Thomas), `agent-07-decoder/*`,
`friday-mini-mock.html`, `agent-10-sarah/*`, `research/*`, `tiktoks/*` (B5),
`shared/qr-*.js` (B1 only).

### B4.5 Reading Comprehension

**Files owned:** `tools/rc/index.html`, `tools/rc/rc.css`, `tools/rc/rc.js`
(display only), new `tools/rc/rc-skin.css`, new `tools/rc/play/rc-play-data.js`
(Find the proof line), `tools/rc-retold/index.html` (except the night 8 title,
done in B1), `tests/areas/rc/*`.

**Changes:** RC passages skin; next-up and done marks; distractor labels shown
by family (Reversed, Outside the passage, Too strong ...) through a display
map, the bank untouched; Find the proof line as the RC Call it first; RC,
Retold opening calls and links.

**Acceptance:** `npm run validate:rc`, `npm run test:rc`, `npm test`; shots of
the passage list, a passage with highlight and cross-out, a review with proof
lines, at 390 and 1280; page audit.

**Must not touch:** `tools/rc/data/*`, `tools/rc/scripts/*`, `rc-store.js`
keys, `tools/rc/verification/*`.

### B4.6 PAT and games

**Files owned:** `tools/pat/index.html`, `keyholes.html`, `tfe.html`,
`angles.html`, `holepunch.html`, `cubes.html`, `patternfold.html`,
`playbook.html` (PAT at a glance), `test.html` (shell and tokens only),
`pat-cream.css`, `pat-test.css`, new `tools/pat/pat-skin.css`, new
`tools/pat/play/pat-holepunch-loop.js` (from `mock/assets/pat.js`, on the
engine's geometry), `tools/pat/engine/pat-test.js` (the six TRAP_NAMES strings
only, per explainer-standard 3.2), `tools/pat-retold/index.html`,
`games/index.html`, `games/play.html`, `games/six-views/index.html`,
`tools/casper/index.html` (nav placement only), `tests/pat/*`,
`tests/areas/pat/*`.

**Changes:** trainers renamed with method subtitles; the Keyholes strip and
the TFE dark theme fixed; seeds and CSV behind `?coach=1`; Hole Punching
ships the Call it first loop (fold, call grid, unfold, scrub, recall, card,
reduced-motion stills); "Angles-first order"; PAT, Retold night 7 painted-cube
rule corrected; Quick rounds untimed with no streak or best score;
`games/play.html` with no subject sends to `/games/`.

**Acceptance:** `npm run test:pat`, `npm run audit:pat`, `npm test`; shots of
the six trainers, Hole Punching every loop state and reduced motion, PAT test
start, Quick rounds, Six Views, Casper at 390 and 1280; page audit; the fold
checked on a real mid-range Android.

**Must not touch:** `tools/pat/engine/*` except the TRAP_NAMES strings,
`games/*.json`, `games/ochem-bank-1000.js`, the Casper console logic.

### B4.7 Tests and mocks (wave 2, after B3)

**Files owned:** `diagnostic.html`, `prometric-mock.html`,
`tools/minitests/index.html`, `tools/minitests/remediation-map.js`,
`tools/ochem/summit/index.html`, `summit.js`, `summit.css`,
`tools/bio/bio-mock.html`, `tools/bio/bio-diagnostic.html`, `test-week.html`,
`test-day-readiness.html`, `tests/areas/tests/*`.

**Changes:** each surface runs its questions on `AcePlayer`: the diagnostic
(untimed, opt-in clock, results as a map in raw counts, misses into cards);
Sciences + QR tests 1 to 3 (reagent sheet, item meta, backtick line, header X
and gear and the pulsing timer removed; copy says the place saves and the
clock pauses; em dashes and glyphs gone); the Climb (untimed by default, the
"Today" tab becomes Queue, rung 10 becomes Rung 10, the `/retold/` fallback
repointed, misses into cards, the internal 75 threshold for `nextRung` kept
and never shown); the Summit's questions; Bio check Short and Full;
Test-week mode and the Test-day briefing on the kit.

**Acceptance:** `npm test` (`test:bias`, `validate:mocks`, `test:fullmock`,
`tests/shell/ace-progress.test.js` with the Climb fixtures), a Climb run
through rung 1 with misses landing in Review; shots of every surface (start,
mid, review, results) at 390 and 1280; `gate:clock` passes with clocks only
in timed paths.

**Must not touch:** `tools/minitests/bank.js`, `source/*`,
`shared/dat-mock-tests.js`, every key, `tools/mock/*` (B3).

### B4.8 Support pages

**Files owned:** `404.html` (repoint `/retold/`), `scope.html`,
`for-retakers.html` (Going again), `cheat-sheets.html` (points to Learn >
Sheets until B5.2 redirects it), `tricks/sheets.html` (repoint the series
link), `tricks/shorts/index.html`, `tricks/shorts/short.html`,
`tricks/videos/index.html` and the 13 video pages (shell, tokens, "silent"
labels until narration exists), `tests/areas/support/*`.

**Acceptance:** shots at 390 and 1280; copy gate strict; page audit;
`gate-dead-links`.

**Must not touch:** `tricks/index.html` (marketing URL), `tricks/videos/js/*`,
`vendor/*`, the voiceover studios and series pages (B5).

---

## B5. Hide and redirect

### B5.1 Hide internal material (wave 1)

**Files owned:** `netlify.toml` (redirect blocks only), `_redirects`.

**Changes:** forced 301s for every internal row in spec 1.5 (QR docs,
proposals and research; RC docs and verification; GChem docs, research,
TikTok library, scripts and studio; OChem docs and dev harnesses; QR TikToks
including the broken topic canvas; trick studios and series canvas; the
sliding filament canvas; `/tests/<subfolder>/*`; `/tools/mock/verification/*`;
`/tools/minitests/source/*` and the assembler; `/scripts/*` placed after the
existing `ochem-bank-1000.js` rewrite; `/booster-map.html`;
`/test-screenshots/*`) and for the rough pages hidden until fixed
(`bio-calendar.html`, `bio-analytics.html`, `friday-mini-mock.html`,
`agent-07-decoder/*`, `guides/pat-grids.html` to the PDF). The GChem embed
canvases stay reachable for the Watch modal.

**Acceptance:** `npm test` (`gate-dead-links` counts the rules); a curl or
`netlify dev` check that each rule returns 301 and that `/tests/`,
`/scripts/ochem-bank-1000.js` and the GChem embeds still serve 200.

### B5.2 Legacy redirects (wave 2)

**Files owned:** `netlify.toml`, `_redirects`.

**Changes:** `/tools/ochem/v2/*` to `/tools/ochem/tree/`; the v2 EAS canvas to
`/tricks/videos/eas-directing.html`; `/tricks/series/` to `/tricks/shorts/`;
`/unified-mock.html` and `/unified-mock` to `/tests/`; `/retold/` to `/learn/`;
`/onboarding.html` to `/?first=1`; `/performance/` to `/tests/#results`;
`/cheat-sheets.html` to `/learn/#sheets`; existing mocks-catalog and calendar
rules kept.

**Acceptance:** `npm test`; every repoint from wave 1 merged first (grep shows
no in-site link to a redirected page except through the rule).

### B5.3 Deletions (wave 3)

**Files owned:** the files deleted: `mocks-catalog.html`, `unified-mock.html`,
`calendar.html`, `retold/index.html`, `tools/ochem/v2/*`,
`tricks/series/index.html`, `booster-map.html`, `onboarding.html`,
`shared/fonts/hanken-wght-normal.woff2` (no includer left), and after one
release `ace-labs-classic.html` and `performance/index.html`. Markdown docs,
studios and canvases stay in the repo behind their 301s.

**Acceptance:** `npm test` (dead links stay green through the redirects);
`gate-shared-versions` (no include of a deleted shared file).

---

## B6. Release sweep (wave 3)

**Files owned:** `scripts/copy-baseline.json` (tightened), the fix list it
produces (fixes go back to the owning batch's files as small follow-ups).

**Checks**
- Copy gate strict on every student page; contrast; clock; dead links.
- Shots of all served inventory entries at 390 and 1280 against the last
  release and the mockups; page audit on every page (overflow, 44 px targets,
  console errors, reduced-motion snapshot).
- On a real mid-range Android: Today's live scrub and wipe, the lens, the PAT
  fold, the titration pour, the card flight; LCP under 2.5 s, INP under
  200 ms, CLS under 0.05 on Today over 4G.
- The DAT tutorial walk (`dat-interface.md` section 7) answers recorded and
  any player label adjusted.

---

## Decisions Thomas makes before or during the build

Canon inside Learn; the font switch; untimed Climb, Recognition Lab and quick
rounds; the confidence rating; QR geometry and trigonometry; the coach line
library (B1 ships placeholders he replaces); Push the piston (not in this
release). See `spec.md` section 9.
