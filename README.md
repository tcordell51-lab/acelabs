# Ace Labs · DAT prep companion

The DAT prep companion from AceTheDAT. Four standalone interactive engines (Biology, Gen Chem, Organic Chem, Quantitative Reasoning), a Prometric-style cross-section mock runner, a localStorage-only cross-tool dashboard, and a test-week support layer (cheat sheets, calendar, test-day mechanics, scope/evidence). No accounts, no tracking, no servers — student data lives in the browser.

## Quick start

```
open ace-labs.html
```

Or via a local server (faster cache invalidation when iterating):

```
npx serve . -l 4000
# then open http://localhost:4000/ace-labs.html
```

## What ships today

| Surface | What it is |
|---|---|
| `ace-labs.html` | The hub. Cross-tool dashboard (cards due, last session, mastery, recent practice), four engine tiles, GenChem companion tiles, plan section, footer with scope link. |
| `tools/bio/` | **Biology Repair Lab v3** · 6 hubs (Cell, Genetics, Physiology, Diversity, Devo, Evolution), 57-node registry, 24-Q Pulse check, 40-Q Weakness scan, Repair sheet, 60-day plan, analytics. Includes the new fertilization staged walkthrough and 8-card micrograph ID practice. |
| `tools/gc/` | **Gen Chem Remediation** · 37 skill modules across 4 tiers, 25-Q adaptive diagnostic with pre-confidence rating, DAT-weighted mock sim (60 sec/Q), 600+ drill items, weekly-plan exporter. Four companion tools: Periodic Trends, Common Traps, Recognition Lab, Lewis Sandbox. |
| `tools/ochem/` | **OChem Reaction Maps (v1, canonical)** · 18-hub map across Foundations / Functional Groups / Advanced, 14 mechanism step-throughs (3 with predict-the-step active learning), exam-sim with stratified topic-weighted sampling, mech-library, reagents, mass-spec hub, IR/NMR trainer, flash deck. |
| `tools/qr/` | **Quantitative Reasoning** · 45 skill modules, 22-Q cross-loaded diagnostic, 30-chunk Pattern Library with SM-2 spaced retrieval, Productive Failure problems, Friday Mini-Mock (22Q/22min interleaved), pacing simulator with Two-Pass Drill, Sarah-mode summary digest, 10 embedded drill widgets. |
| `prometric-mock.html` | **3 fixed practice tests** · 140 Q each (40 Bio + 30 GC + 30 OChem + 40 QR) covering Sciences (100Q / 90min) and QR (40Q / 45min) with real Prometric mechanics (nav panel, mark-for-review, periodic table, calculator). PAT and RC are out of scope. No scaled-score prediction — only raw counts, per-section accuracy, time-on-task, missed-question walkthrough. |
| `mocks-catalog.html` | Catalog framing of the 3 Prometric tests (diagnostic / standard / final sim). |
| `cheat-sheets.html` | "Everything you need, one page" reference sheets per section, with deep-links into the engines. |
| `test-day-readiness.html`, `test-week.html`, `onboarding.html`, `calendar.html`, `for-retakers.html` | The test-week support layer. |
| `scope.html` | Public scope-and-evidence page (covered sections, bank counts, mock limits, ADA non-affiliation, content-report CTA). |

## Layout

```
AceDAT-AceLabs/
├── ace-labs.html              # Home / hub
├── prometric-mock.html        # 3-test Prometric runner
├── mocks-catalog.html         # Test catalog
├── cheat-sheets.html          # Section cheat sheets
├── test-day-readiness.html    # Test-day mechanics briefing
├── test-week.html             # Crunch-mode hub
├── onboarding.html            # First-time setup
├── calendar.html              # Test-week calendar
├── for-retakers.html          # Retaker path page
├── scope.html                 # Scope & evidence
├── unified-mock.html          # Legacy OChem-only prototype (301-redirected to Prometric runner)
├── shared/
│   ├── al-tokens.css          # Design tokens v2: --al-* (never themed), --s-* paper roles (light/dark), --b-* bench, mint brand accent, type, motion
│   ├── al-fonts.css           # Self-hosted @font-face: Sora (display), DM Sans (body), JetBrains Mono (labels); every page loads it (no font host, the CSP allows none)
│   ├── al-fonts-legacy.css    # Old family names answered from the same files: Playfair Display and Newsreader to Sora (italic to DM Sans italic), Hanken Grotesk to its own file
│   ├── fonts/                 # Versioned latin woff2 files (name-vN.woff2) + OFL license texts
│   ├── brand/                 # ACEDAT logo: lockup, reversed lockup, AD mark, reversed mark, app icon
│   ├── al-motion.css          # Reduced-motion stylesheet
│   ├── ace-labs-shell.css     # Home brand vars + dashboard styles
│   ├── ace-shell.js/.css      # Shell v2: the one Ace Labs nav (five doors, ACE DAT lockup, Review dot), on every student page
│   ├── ace-progress.js        # Cross-tool progress: miss adapters, Review ladder, today(), todayPlan(), play cards
│   ├── ace-coach-lines.js     # The coach line library: ~40 drafts in Thomas's voice, approved:false until he signs off
│   ├── ace-index.js, ace-route.js  # Generated name index (build-ace-index.mjs) and the concept router
│   ├── scope.js               # Canonical ACE_SCOPE data registry
│   ├── dat-mock-tests.js      # Prometric runner bank
│   ├── ochem-bank.js          # OChem bank for legacy unified-mock
│   └── smiles-drawer.min.js   # SMILES rendering (vendored)
├── tools/
│   ├── bio/                   # Bio Repair Lab v3
│   ├── gc/                    # Gen Chem engine
│   ├── ochem/                 # OChem v1 Reaction Maps (canonical, augment in place)
│   └── qr/                    # QR engine
├── scripts/
│   ├── validate-bio-registry.js
│   ├── validate-scope.js      # Run via `npm run validate:scope`
│   ├── audit-bio.js           # Playwright headless audit for Bio pages
│   └── ...                    # Test helpers + content-authoring scripts
├── docs/                      # Internal audit series (not deployed)
│   ├── acelabs-audit-2026-05-27.html        # Build-state audit
│   ├── acelabs-pedagogy-2026-05-27.html     # Content / teaching review
│   ├── acelabs-applied-2026-05-27.html      # Change receipt
│   ├── acelabs-scorecard-2026-05-27.html    # Rating matrix
│   ├── acelabs-roadmap-2026-05-28.html      # Improvement roadmap
│   ├── thomas-voice-codex.md                # Voice reference for coach-card authoring
│   └── zoom-mined/                          # Curated session transcripts
├── research/                  # Reading Comprehension research docs (planning, not yet shipped)
├── netlify.toml, _redirects   # Deploy config
└── README.md
```

## Cross-tool localStorage aggregation

`shared/ace-progress.js` reads each engine's namespace through one miss adapter per tool and rolls it up to the home (today(), todayPlan()), Review and Performance pages. It never writes back into engine state; its own keys are `ace.v1.*`, `acelabs.v1.playCards` (Call it first cards from every section but Bio), `acelabs.v1.settings` (daily minutes, shakiest sections) and `acelabs.v1.dueToday` (the cache the shell's Review dot reads; written whenever misses() runs).

| Engine | localStorage prefix | What's read |
|---|---|---|
| QR | `qr-rem-v2:` | per-skill mastery, last session, SR-due |
| GC | `gc-rem-v1:` | same shape |
| Bio | `acethedat_bio_engine_v1` | Ace Cards array (SR-due derived) |
| OChem | `atDAT_progress_v1` | per-hub progress |

If an engine hasn't been opened yet, the dashboard shows fallback module counts (45 QR / 37 GC / 57 Bio nodes / 18 OChem hubs). The cross-tool mock writes `al:lastMock` for the home dashboard's recent-practice tile. The shell does NOT compute any predicted DAT score — by design.

## Design principles

- **No score predictors.** Practice metrics are fine; scaled-score projections are banned across every surface. See `scope.html` for the public framing.
- **No emojis or decorative unicode glyphs** (✓ / ✗ / ⚠ / ★) — text labels + the gold/red/green palette carry the meaning.
- **No payment language in student-visible content** ($, paid, balance, package, installment, etc.).
- **No localStorage-only student input.** Any student-written content that's not already a Thomas-visible note must persist to Airtable.
- **OChem v1 is canonical.** Augment in place; no parallel v2/v3.

## Ship gates

```
npm test        # under 30 s: house rules, bank integrity, shell unit tests, the Bio init smoke
npm run test:all   # the above plus the PAT engine suite (about 6 min) and the Bio browser smoke (needs `npm run serve` on :4000)
```

`npm test` runs in tiers so one failure does not hide the rest of its tier's output:

- `test:gates`: no competitor names; no unreplaced placeholder tokens; every local link and path literal resolves (honouring the redirects); every `/shared/` include carries a `?v=` that is newer than the file's last change (the cache is immutable for a year); every literal localStorage read has a writer; no new em dashes or glyphs beyond `scripts/glyph-baseline.json` (re-baseline with `npm run glyphs:baseline` only after removing some).
- `test:banks`: answer-position bias, the Climb bank matches its source, the Bio registry, the scope registry, count claims on the home and hubs against the banks, the RC bank, the full-length composition.
- `test:unit`: the QR formats and shell unit tests.

## Validate the scope

```
npm run validate:scope
```

Fails if any user-facing page contains a stale phrase (e.g. "5 fixed tests" or "predicted DAT score" outside a negated context), if mock counts drift from `ACE_SCOPE.MOCKS`, or if pages are missing the scope-strip / disclaimer hooks. Source of truth: `shared/scope.js`.

## Deploy

Deploys to acelabs.netlify.app via the Netlify CLI (manual, not git-triggered):

```
netlify deploy --prod
```

Internal docs under `docs/` are NOT served by the deploy (publish dir intentionally includes the root, but Netlify won't serve a directory-only path without an index.html; the docs are reachable only by typing the URL explicitly).

## Cross-engine internal status (2026-05-28)

| Engine | Overall | Highest dimension | Weakest dimension |
|---|---|---|---|
| Biology | 7.7 | Visual / Interactive (9) | Voice authenticity (6.5) |
| Gen Chem | 8.0 | Pedagogical design (9) | Authoring completeness (6.5) |
| OChem | 8.4 | Visual / Interactive (9.5) | Coverage (7.5) |
| QR | 8.1 | Active learning depth (9) | Calculator Tax / authoring (6–7) |
| Cross-engine surfaces | 8.1 | Hub + Prometric runner (8.5+) | Design tokens (7.2) |

Full ratings + the roadmap to 9+ across the board live in `docs/acelabs-scorecard-2026-05-27.html` and `docs/acelabs-roadmap-2026-05-28.html`.
