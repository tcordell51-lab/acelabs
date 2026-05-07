# Brand Unification Spec — Ace Labs
**Date:** 2026-05-06  
**Scope:** 4 engines (Bio, GC, OChem, QR) + 10 test-week/companion pages  
**Status:** Spec only — no code edits

---

## Headline Finding

The product currently reads as five architecturally independent tools that happen to share a color palette. The deepest fracture is not visual — it is **structural and conceptual**. Three of the four engines still title themselves "Remediation System" (`tools/qr/index.html:6`, `tools/gc/index.html:6`, `tools/qr/index.html:1553`, `tools/gc/index.html:3299`) — a framing that positions the product as a catch-up service for struggling students, not the premium mastery system `ace-labs.html` claims it is on the home page. Bio alone calls itself a "Mastery System" (`tools/bio/index.html:188`). OChem calls itself "Reaction Maps" (`tools/ochem/index.html:8`). The home page calls all four a "DAT prep companion." Test-week pages call themselves nothing at all — no consistent brand identity surfaces to an anxious student opening `test-week.html` for the first time. Fixing the title/identity string across six files is a one-hour change with outsized perceptual impact. The deeper fix — reconciling the "remediation" positioning with the "mastery" and "reaction maps" positioning — requires a single canonical product name that the engines reinforce rather than contradict.

---

## Visual Unification Recommendations

### Token System

**Current state — three parallel systems in use:**

| Engine | Token source | Namespace | Token prefix |
|---|---|---|---|
| OChem | `shared/al-tokens.css` (imported) + inline `:root` | local aliases `--white`, `--bg`, `--red` | mixed |
| Bio | `bio-shared.css` (standalone local, mirrors al-tokens) | `--bg`, `--paper`, `--gold`, `--trap`, `--good` | `--al-*` aliases present |
| GC | Inline `:root` in `tools/gc/index.html:10–27` | `--bg`, `--paper`, `--gold`, etc. | no `--al-*` aliases |
| QR | Inline `:root` in `tools/qr/index.html:11–27` | identical to GC namespace | no `--al-*` aliases |
| Shell pages (ace-labs, test-week, etc.) | `shared/al-tokens.css` | `--al-*` | canonical |

**Key divergences to resolve:**

1. **`--red` still lives in OChem** (`tools/ochem/index.html:27`: `--red:#b91c1c`). This is a chemistry-domain semantic color (not correctness), so it is technically justified — but it also creates a tempting anti-pattern where `--red` bleeds into answer feedback contexts. OChem also retains `--C25B3F` orange-red for trap hints (`tools/ochem/index.html:1051`). Neither GC nor QR use this color; they use `--trap:#D55E00` (Wong-correct). Flag for review.

2. **`cheat-sheets.html:29`** defines `--trap:#C25B3F` — the old pre-Wong orange-red. This is the only test-week page still using the non-canonical trap color. The file inlines its entire token set (`cheat-sheets.html:11–44`) rather than importing `al-tokens.css`.

3. **`qr-pattern-system-v1.html:18`** defines `--trap:#C25B3F` (old red). This legacy file appears to be a sub-page of QR and predates the Wong palette migration. Same issue.

4. **GC and QR have no `--al-*` alias layer.** The `shared/al-tokens.css` comment at line 10 explicitly notes "QR + GC pending." Shell components that read `--al-confirmed` will not function inside GC/QR pages without the alias bridge.

5. **Dark mode**: GC and QR both implement `body[data-theme="dark"]` with local overrides (`tools/gc/index.html:28–36`, `tools/qr/index.html:28–48`). OChem uses `html[data-theme="dark"]`. Bio has no dark mode at all. Shell pages have no dark mode. This means the three dark-mode engines each toggle a different root selector, making any future shared stylesheet nearly impossible to apply uniformly.

**Recommendations:**

- **Canonize `--al-*` as the only namespace.** GC and QR should import `shared/al-tokens.css` and map their local names as aliases (same pattern `bio-shared.css` uses).
- **Deprecate** `--red` in OChem for any non-chemistry-domain use. If the color is purely structural (e.g., mechanism push arrows), document it as `--chem-radical` or `--chem-electron-push` and keep it out of answer-feedback selectors.
- **Migrate `cheat-sheets.html`** to import `shared/al-tokens.css` rather than duplicating the token block inline. This page is read-only reference content — inline tokens are a maintenance hazard.
- **Pick one dark mode root selector.** Recommend `html[data-theme="dark"]` (OChem's pattern) as it is the Web-standard approach and decoupled from `<body>` class juggling.

### Component Library: Shared Components to Extract

The following components exist in 3+ independent implementations and should be extracted to `shared/`:

| Component | Current locations | Recommendation |
|---|---|---|
| `stuck-modal` | `tools/bio/index.html:12–65` (`.bio-stuck-*`), `tools/gc/index.html:4559–4604` (`.modal-back#stuckModal`), `tools/ochem/index.html:322–396` (`.ochem-stuck-*`), `test-week.html:129–155` (`.tw-modal-*`) | Extract to `shared/al-stuck-modal.css` + `shared/al-stuck-modal.js` with a single class namespace (`.al-stuck-*`) and engine-specific copy injected at init time |
| `hero badge + pulse dot` | Identical markup/CSS in `tools/gc/index.html:152–164`, `tools/qr/index.html:152–166`, `tools/bio/bio-shared.css:99–101` | Extract to `shared/ace-labs-shell.css` as `.al-badge` (already partially done there) |
| Sidebar brand mark | `tools/gc/index.html:62–65`, `tools/qr/index.html:62–65`, `tools/bio/bio-shared.css:53–56`, `tools/ochem/index.html:101–105` — 4 near-identical implementations | Extract to a single `.al-sb-brand` component in `shared/ace-labs-shell.css` |
| `.sb-progress` / section bars | `tools/gc/index.html:66–70`, `tools/qr/index.html:66–70`, `tools/bio/bio-shared.css:57–61` — pixel-identical | Extract to shell CSS |
| `.sb-stuck-btn` / sidebar stuck trigger | `tools/gc/index.html:95–101`, `tools/qr/index.html:101–107` — identical | Extract to shell CSS |
| `mastery donut` | Only in OChem (`tools/ochem/index.html:1129–1134`). Bio uses flat progress bars. GC/QR use inline bar widgets. | Recommend OChem's SVG donut as the canonical mastery indicator; Bio/GC/QR should adopt it |

### Color Audit: Wong Palette Coverage

**In compliance (Wong `--al-confirmed` / `--al-needs-review`):**
- `tools/bio/bio-shared.css:12–16` — `--trap` / `--good` mapped to Wong values; `--al-confirmed` alias bridge present
- `tools/gc/index.html:18–21` — `--trap:#D55E00`, `--good:#009E73` (Wong-correct)
- `tools/qr/index.html:19–21` — same
- `diagnostic.html:33–40` — uses `--al-confirmed`, `--al-needs-review` directly (best practice)
- `onboarding.html` — uses `--al-good` for done states

**Not yet in compliance:**
- `cheat-sheets.html:29` — `--trap:#C25B3F` (old orange-red, not Wong `#D55E00`)
- `tools/qr/qr-pattern-system-v1.html:18` — `--trap:#C25B3F`
- `tools/ochem/index.html:1051` — `.tm-hint.trap::before{background:#C25B3F}` — legacy trap color in a hint badge context. Chemistry-domain context may justify it, but should be audited.
- `mocks-catalog.html:38–39` — `.bar .h{background:#c25b3f}` for "hard" tier in difficulty bars. This is not correctness feedback, but the color is still the old non-Wong red. Could migrate to `--al-trap` (`#D55E00`) for consistency.

---

## Copy + Voice Unification

### Tutor Attribution Matrix

| Engine | Canonical tutor | Current state |
|---|---|---|
| QR | Sarah | Correctly attributed throughout `tools/qr/`. `ace-labs.html:108` says "Sarah · tutor". TikToks branded "QR · Sarah". Consistent. |
| Bio | Riya | Correctly attributed in `tools/bio/bio-evolution.html:1155`, `bio-genetics.html:1181`, `bio-physiology.html:2342`, `bio-immune-cells.html:574`. Sidebar says "Bio Mastery System · v2" — no tutor name surfaced at the hub level in `tools/bio/index.html`. |
| GC | Tommy | `ace-labs.html:145` says "Tommy · tutor". Engine sidebar (`tools/gc/index.html:3395`) says "Gen Chem · Remediation · v1" — no tutor name. TikToks correctly branded "Tommy". |
| OChem | Tommy | `ace-labs.html:162` says "Tommy · tutor". Sidebar footer (`tools/ochem/index.html:2903–2905`) says only "Ace The DAT · OChem Reaction Maps". No tutor surface. |

**Gap:** Riya's name never appears in the Bio hub sidebar, and Tommy's name never surfaces inside the GC or OChem sidebars. A student who opens `tools/bio/index.html` directly (without going through `ace-labs.html`) sees no tutor attribution.

**Fix:** Add a one-liner tutor attribution to each engine's `sb-foot`: "Riya · Bio tutor", "Tommy · GC + OChem". This is a two-sentence HTML edit per engine.

### Voice Guide

**Phrases that ARE the voice:**
1. "find your floor" — QR hero (`tools/qr/index.html:1738`), calibrated to the anxious student
2. "Not a timer. No grade. No catching you off-guard." — QR/GC hero, anxiety-aware
3. "It's patterns. We'll find yours." — GC/QR hero, reframes the subject
4. "When your brain freezes, hit the red button" — direct, practical, non-shaming
5. "Stuck is normal." — GC stuck modal (`tools/gc/index.html:4562`)
6. "Your brain is processing — it's not broken." — GC stuck modal lede
7. "Tommy's lock" / "Riya's note" — personal attribution for mnemonics
8. "Thomasisms" — idiomatic, product-specific term for GC locks
9. "Mastered · cold three times in a row" — precise, trust-building mastery definition
10. "Honest question counts" — ace-labs.html badge; factual brand signal

**Phrases that are NOT the voice (still present):**
1. "Remediation System" — `tools/qr/index.html:6`, `tools/gc/index.html:6`. Positions the student as deficient. Contradicts "Mastery System."
2. "tutor/remediation tool" framing throughout GC/QR topbars: `tools/qr/index.html:1707` reads "QR Remediation", `tools/gc/index.html:3504` reads "Gen Chem Remediation"
3. `tools/qr/index.html:2200` — `wrong()` sound function named "wrong." Internal JS name, not student-facing, but sets a tone in the codebase.
4. Emoji use in GC topbar buttons: `tools/gc/index.html:3510–3515` — `✏ Edit Mode`, `🧠 Self-Explain`, `🔇 Sound`, `◐ Theme`. Inconsistent with the rest of the system (QR has no emoji in its topbar buttons; Bio has none).
5. `tools/gc/index.html:3415` — `<button>💬</button>` feedback pill. Emoji in a student-visible UI element.
6. "Going Again" — title of `for-retakers.html`. Acceptable internally but inconsistent with the formal naming style elsewhere.

### Terminology Canonical

One term per concept:

| Concept | Canonical term | Retire |
|---|---|---|
| Top-level product | **Ace Labs** | "AceLabs" (no space), "standalone v1" as a public label |
| Per-subject interactive learning environment | **Engine** | "Remediation System", "Tool", "Module" (at this level) |
| Subdivision within an engine | **Hub** | "Module" only refers to an individual skill or lesson; "Section" acceptable at the sidebar grouping level |
| Individual skill or lesson | **Module** | "node" (Bio uses "nodes" inconsistently) |
| Pre-exam compact pages (diagnostic, cheat-sheets, etc.) | **Test-week tools** | "companion pages", "prep tools" |
| Memory locks (GC/OChem) | **Locks** | "Thomasisms" (keep as tutor-attribution flavor on the card itself, not as the UI label) |
| Answer-feedback: correct | **Confirmed** | "right", "correct", "good" in UI-facing strings |
| Answer-feedback: incorrect | **Needs review** | "wrong", "incorrect", "failed" |

---

## Navigation Unification

### Top Nav: Current State

| Page | Nav items |
|---|---|
| `ace-labs.html` | Home · Prometric mocks · Mock catalog · Tools · This week · Test day (6 items) |
| `test-week.html` | Home · Test week · Prometric mocks · Test day (4 items) |
| `mocks-catalog.html` | Home · Prometric mocks (2 items) |
| `for-retakers.html` | Home · Cross-tool mock · Tools (3 items, and links to `unified-mock.html` which may not be fully live) |
| `prometric-mock.html` | Home · Mock catalog (2 items) |
| `test-day-readiness.html` | Home · Prometric mocks · Mock catalog · Test week · Test day (5 items) |
| `calendar.html` | Home · Test week · Mocks (3 items) |
| `diagnostic.html` | Dark teal topbar, no nav at all — only brand mark + timer |
| `onboarding.html` | Home only (1 item) |
| Engines (Bio, GC, QR, OChem) | No shell nav — sidebar-only, no back-to-home link in topbar |

**Problem:** A student inside `tools/gc/index.html` has no top-nav path back to `ace-labs.html`. The sidebar has a "Coach Dashboard" link but no "Home" link. The topbar shows breadcrumbs only. Engines are effectively dead-end tabs.

**Recommended canonical nav (5 items, consistent across all shell pages):**

```
Home | Engines | Mocks | Test week | Test day
```

- "Engines" links to `#tools` anchor on `ace-labs.html`
- Each page marks its own item active
- Engines' own topbars should add a discrete "← Ace Labs" back link to the topbar (not the sidebar) — just a text link, not a full nav bar, so the engine doesn't lose its compact chrome

**Diagnostic page exception:** `diagnostic.html` is intentionally chrome-free during a timed exam. Keep the dark teal topbar with brand mark + timer only. Add a "← Exit exam" link that appears only before the exam starts.

### Footer: Current State

| Location | Footer content |
|---|---|
| `ace-labs.html` | "Ace Labs · standalone v1 · Your study data stays in your browser · Synced to portal (in progress)" |
| `onboarding.html` | Same `al-foot` component |
| `bio-immune-cells.html` | Custom `<footer class="foot">` with "Ace Labs · Bio engine · Riya tutor track" + cross-links |
| GC/QR/OChem engines | Sidebar `sb-foot` only — version number, mode, build info. No page-level footer. |
| Companion pages (test-week, cheat-sheets, calendar, etc.) | Varies: `test-week.html` has no visible footer, `calendar.html` has a `.cal-foot` with progress info only |
| `cheat-sheets.html` | No footer at all |

**Recommended canonical footer (all non-engine pages):**

```
Left: AceTheDAT · Ace Labs
Center: Your study data stays in your browser. No accounts, no tracking.
Right: [Tutor portal] · [acethedat.com]
Tagline row: Built for DAT students who want to understand it, not just pass it.
```

Engine pages: retain the sidebar `sb-foot` for in-session metadata (version, mode, build). Add a minimal 1-line footer below the main content area: "Ace Labs · [engine name] · [tutor name] · Back to hub →"

### Cross-Link Pattern

- `bio-immune-cells.html:575` is the only engine page observed to cross-link to `cheat-sheets.html`. No other engine pages reference it.
- GC and QR engines have no cross-links to `cheat-sheets.html` anywhere in their main `index.html` files.
- Recommendation: Every engine's sidebar `sb-foot` should include: "Cheat sheets →" and "Test-week tools →" as static links.

### Breadcrumbs

Bio hub pages consistently populate `<div class="tb-where"><b id="crumbWhere">[Section]</b> · Bio Mastery System</div>`. GC's topbar uses a slightly different format: `<span class="crumb-arrow">▸</span> <b id="crumbWhere">Welcome</b> · Gen Chem Remediation`. QR uses `<b id="crumbWhere">Welcome</b> · QR Remediation`. OChem has no breadcrumb at all in its topbar — just the sidebar nav. Shell pages (test-week, etc.) have no breadcrumb. Standardize to: `[Engine name] · [Current section]` using a single `.al-breadcrumb` component.

---

## Interaction Patterns to Extract

### Stuck Modal

There are currently **four independent implementations**:

1. **Bio hub** (`tools/bio/index.html:12–65`): Class `bio-stuck-*`. Triggered by `.bio-stuck-trigger` in sidebar. Opens 3 options: quick recall cards, "read the node again," ask a question.
2. **GC engine** (`tools/gc/index.html:4559–4604`): Class `.modal.#stuckModal`. 4-path recovery picker: pattern / math / WHY / break. Includes a 60-second box-breathing flow. Triggered by `sb-stuck-btn` in sidebar.
3. **OChem engine** (`tools/ochem/index.html:322–396`): Class `ochem-stuck-*`. Simpler than GC — 3 options. Triggered by sidebar `ochem-stuck-trigger`.
4. **Test-week page** (`test-week.html:129–155`): Class `tw-modal-*`. Context-appropriate (test-week anxiety vs. studying anxiety).

**Recommendation:** The GC modal's 4-path + breathing flow is the most complete. Extract to `shared/al-stuck-modal.js` + `shared/al-stuck-modal.css`. Init signature: `AceLabsStuck.init({ engineName, paths[], breathingEnabled })`. Each engine injects engine-specific copy; the modal chrome, animation, and breathing flow are shared. Test-week keeps its own version — the persona is different (pre-test anxiety vs. mid-study confusion).

**Host canonical version in:** `shared/al-stuck-modal.js` (new file).

### Score Predictor Disclaimer

Four different copy variants:

1. **GC** (`tools/gc/index.html:15124`): "Predicted score ${predicted} · approx ${predictedPct}th percentile · beta calibration. Internal-mock-validated only — not equivalent to ADE official percentile data."
2. **QR** (`tools/qr/index.html:10068`): "Predicted score is a beta calibration based on internal mock data. Treat as diagnostic only."
3. **Bio mock** (`tools/bio/bio-mock.html:190`): "Score predictor maps to the 1-30 DAT bio scaled score using anchor calibration." — no uncertainty statement.
4. **OChem** (`tools/ochem/index.html:19437`): "Sigmoid scaled-score predictor (Wave 3.3)" — no disclaimer visible in the comment, disclaimer copy not retrieved but context implies different wording.

**Canonical disclaimer (single string, inject everywhere):**

> "Predicted score is calibrated against internal mock data — treat as diagnostic, not an official ADA estimate."

Bio mock page should add this disclaimer. All four should use the identical string pulled from a shared constant.

### Predict-Then-Reveal (OChem only)

OChem's mechanism player has a `predict-then-reveal` step (`tools/ochem/index.html:508–533`) where students pick from thumbnail options before the animated mechanism plays. This pattern is high-value for active recall across all four engines but exists only in OChem. Flagging for future work:

- GC: Apply to equilibrium shifts, Le Chatelier, and reaction mechanisms
- QR: Apply to word problems before showing setup
- Bio: Apply to pathway steps (e.g., glycolysis, action potential)

This is a Phase 2 interaction pattern, not a Phase 1 unification fix.

### Mastery Donut / Progress Bars

- **OChem:** SVG donut at `tools/ochem/index.html:14776–14785`. Renders overall mastery % with text center. Visually polished.
- **Bio:** Flat progress bars in sidebar (`tools/bio/index.html:77–83`). No donut. Dashboard cards with numeric counts.
- **GC/QR:** Sidebar bars (`tools/gc/index.html:66–70`). Dashboard section with per-skill mastery tracking. No donut.
- **Shell (`ace-labs.html`):** `.al-dash-bar` with fill div for overall mastery. Simple.

**Recommendation:** The OChem donut is the strongest visual. Extract to `shared/al-mastery-donut.js` as a Web Component or vanilla JS factory. Each engine's sidebar can render a small (60px) version per subject; the ace-labs.html dashboard can render a 100px version per engine. This is a Phase 2 component.

---

## Density / Weight Calibration

### Engine Density vs. DAT Weight

| Engine | Main file lines | DAT section weight | Assessment |
|---|---|---|---|
| OChem | 19,749 (`tools/ochem/index.html`) | ~30 Q out of 100 SNS = 30% | Well-built relative to weight. Some risk of student overwhelm on first visit — the hub grid + path steps + stats create high cognitive load at entry. |
| GC | 18,292 (`tools/gc/index.html`) | ~30 Q out of 100 SNS = 30% | Density-appropriate. The 4-path stuck modal and breathing flow show the most sophisticated anxiety-aware design of the four engines. |
| QR | 10,952 (`tools/qr/index.html`) | 40 Q standalone section = ~29% of total DAT score (approximate, after AA weighting) | Somewhat lighter than the two chem engines but appropriate — QR content is procedural and the 767-problem bank compensates. |
| Bio | 377 (`tools/bio/index.html`) | ~40 Q out of 100 SNS = 40% | **Dramatically under-represented in the hub file.** The hub is a 377-line dispatch page; the depth lives in 13+ sub-pages. This is architecturally sound but creates a first-impression disparity: a student who opens Bio gets a clean hub, while a student who opens OChem gets 19,000 lines of interactive content immediately. The perceived quality gap is real. |

**Bio specifically:** Bio is the highest DAT-weight section and the engine where Riya's voice is clearest, but it is the only engine without dark mode, without a shared token import (`bio-shared.css` is a local mirror rather than an import of `al-tokens.css`), and whose hub file is 40x shorter than OChem's. The sub-pages are strong (`bio-cell.html`, `bio-genetics.html`), but the hub landing does not communicate the engine's depth.

### Test-Week Page Calibration

| Page | Current tone | Calibration for anxious student |
|---|---|---|
| `test-week.html` | Calm, structured. 4 tiles + stuck button. Tokens from `al-tokens.css`. Good. | Well-calibrated. The "Stuck?" button in test-week context is appropriate. |
| `diagnostic.html` | Full-chrome exam mode, dark teal topbar, timer. No nav. | Appropriate — exam-mode focus. The dark teal top bar is slightly alarming for a pre-exam page vs. the warm cream of other pages, but this is intentional. |
| `cheat-sheets.html` | Dense reference. Collapsible cards. Print-friendly. | Slightly over-tuned for density. An anxious student 3 days out doesn't need every section open; a "Top 10 highest-yield" collapse-all-but-priority mode would reduce overwhelm. Also: uses old `--trap:#C25B3F` — wrong color for a calming resource. |
| `calendar.html` | Day-by-day planner. Clean. Good use of `--al-bio-color` / `--al-gc-color` accents. | Appropriate. Low density, task-oriented. |
| `for-retakers.html` | Structured advice blocks. Good typography. | Well-calibrated. Honest, not punishing. |
| `test-day-readiness.html` | Longest test-week page. Progress bar. Section cards. | Slightly over-long — the progress bar implies 10+ sections, which is a lot to scroll through the day before a test. Consider a "Quick brief" vs. "Full brief" toggle. |
| `onboarding.html` | 5-step wizard. Clean. | Under-linked — only has a "Home" nav item. A student arriving via direct URL has no path to test-week or engines without finishing the wizard. |

---

## Headline Brand Positioning

For every footer and applicable hero:

> **Ace Labs is a DAT prep system built around the way the exam actually tests — interactive engines for each section, calibrated mocks, and last-week review tools, all in one place.**

Shorter variant for footer (one line):

> **Ace Labs · Built for how the DAT actually tests.**

This line should appear in every `al-foot` footer, replacing the current "Ace Labs · standalone v1" which communicates build state to students who don't need to know it.

---

## Priority Fix List (Top 10, by Brand-Cohesion Impact)

1. **Rename "Remediation System" to "Engine" across QR and GC.** `tools/qr/index.html:6,1553,1707,10948` and `tools/gc/index.html:6,3299,3504,18288`. Four title tags + four internal strings. One-hour fix. Highest per-effort brand impact.

2. **Add `link rel="stylesheet" href="../../shared/al-tokens.css"` to GC and QR `index.html`.** Then add `--al-*` alias bridges matching `bio-shared.css:23–38`. This unblocks all future shared component work and closes the token drift between shell and engines.

3. **Migrate `cheat-sheets.html` to import `al-tokens.css`** and fix `--trap:#C25B3F` → `#D55E00`. Inline token block at `cheat-sheets.html:11–44` is a maintenance hazard in a frequently-used reference page.

4. **Extract the stuck modal to `shared/al-stuck-modal.js`.** GC's 4-path + breathing implementation is the canonical version. Bio, OChem, and test-week can be migrated over; each injects engine-specific copy at init. Eliminates 4 diverging codebases for the most anxiety-sensitive UI element.

5. **Add tutor attribution to engine sidebars.** Bio hub `sb-foot` should read "Riya · Bio tutor". GC `sb-foot` should read "Tommy · Gen Chem". OChem `sb-foot` should read "Tommy · OChem". Three one-line HTML edits.

6. **Standardize the top nav to 5 items across all shell pages.** Current state: 6 items on home, 4 on test-week, 2 on mocks-catalog, 3 on for-retakers. Pick the 5-item set and apply uniformly. Add "← Ace Labs" back-link in engine topbars.

7. **Add canonical score-predictor disclaimer string** to `tools/bio/bio-mock.html:190` and standardize copy in GC/QR/OChem to: "Predicted score is calibrated against internal mock data — treat as diagnostic, not an official ADA estimate."

8. **Replace `--trap:#C25B3F` with `--trap:#D55E00` (Wong) everywhere it appears.** Files: `cheat-sheets.html:29`, `tools/qr/qr-pattern-system-v1.html:18`, `mocks-catalog.html:38`, `tools/ochem/index.html:1051` (audit context first).

9. **Surface brand positioning line on every `al-foot` footer.** Replace "Ace Labs · standalone v1" with "Ace Labs · Built for how the DAT actually tests." Three-word change in `ace-labs.html:199` and identical footer copies in `onboarding.html:393` and any other shell pages that import the shell component.

10. **Standardize dark-mode selector to `html[data-theme="dark"]` across all engines.** GC/QR currently use `body[data-theme="dark"]` (`tools/gc/index.html:28`, `tools/qr/index.html:28`). OChem uses `html[data-theme="dark"]`. Aligning the selector is a prerequisite for any shared dark-mode stylesheet — a two-word change per file.

---

## Estimated Time to Ship

| Fix group | Effort | Notes |
|---|---|---|
| Fixes 1, 5, 7, 9 (title/copy strings) | 2–3 hours | Pure string replacements across ~15 files |
| Fix 2 (token import + alias bridge for GC + QR) | 3–4 hours | Test dark mode behavior after; may expose a few override conflicts |
| Fix 3 (cheat-sheets.html token migration) | 1 hour | Self-contained |
| Fix 6 (nav standardization) | 3–4 hours | 7 shell pages; test active-state logic per page |
| Fix 8 (Wong color sweep) | 1–2 hours | 4–5 files; visual QA needed |
| Fix 10 (dark-mode selector) | 1 hour | Two files; test GC/QR dark mode after |
| Fix 4 (stuck modal extraction) | 6–8 hours | Largest scope; JS refactor + CSS namespace; 4 callsites to migrate |

**Total for fixes 1–3, 5–10 (everything except stuck modal extraction):** ~15–18 hours across multiple sessions.  
**Full sweep including Fix 4:** ~22–26 hours.

Recommended sequencing: fixes 1, 5, 9 (copy/positioning) in one session; fix 2 + fix 10 (token infrastructure) in one session; fix 4 (stuck modal) as a dedicated session once the token layer is stable.
