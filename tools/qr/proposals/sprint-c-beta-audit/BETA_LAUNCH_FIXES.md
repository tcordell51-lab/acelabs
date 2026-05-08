# Sprint C — Beta launch readiness audit

Read-only audit of `/tools/qr/index.html` (10,427 lines). Categorized by severity. Findings are concrete; line numbers and suggested fixes are included for each item.

## Summary

| Severity | Count |
|---|---|
| P0 (blocks launch) | 6 |
| P1 (ship before launch) | 14 |
| P2 (polish) | 13 |
| **Total** | **33** |

---

## P0 — Blocks launch

### P0-1. `pace-90` and `pace-60` are referenced as prereqs but have no module
- File: `tools/qr/index.html`
- Lines: 2325-2328 (SKILLS), boot list 10406-10413, MODULES branch 4892-4945
- Description: `SKILLS` declares `pace-90` (line 2325) and `pace-60` (line 2326) but neither has a `MODULES` entry, no `<section>` placeholder (lines 1837-1877), and they are excluded from the boot `renderModule` array (lines 10406-10413). Their dependents `skip-ret` (prereq `pace-90`) and `guess` (prereq `pace-60`) therefore can NEVER pass `isUnlocked()` (line 2333) through normal play. The skill-tree (line 8842) renders them as a permanently-locked "Coming soon" branch and the lock-modal (line 8923 `openComingSoon`) tells the student to master a module that doesn't exist. The Pacing Ladder section (line 1936) is the apparent intended home but it is not wired up to mark `pace-90`/`pace-60` mastered.
- Suggested fix: Either remove `pace-90`/`pace-60` from `SKILLS` and rewire `skip-ret`/`guess` prereqs to `untimed` only, or wire the Pacing Ladder's per-tier completion (line 9470 `pace:score:` write) to also `markMastered('pace-90')`/`markMastered('pace-60')` when those tiers hit 80%.

### P0-2. `pat-seq` is an orphan SKILL with no module, no section, no boot entry
- File: `tools/qr/index.html`
- Lines: 2310 (SKILLS entry), 1837-1877 (no placeholder), 10406-10413 (not booted)
- Description: `pat-seq` (Sequential Percent — pattern) duplicates `pct-seq`'s problem space and exists only as a SKILL row. The skill tree draws a node for it that goes to the "coming soon" modal. It contributes to the `prog-tier2` denominator visually but never to the numerator.
- Suggested fix: Delete the `pat-seq` row from `SKILLS` (line 2310). `pct-seq` already covers the pattern.

### P0-3. Diagnostic intro promises 20 questions; engine maxes at 18 and bank only has 12
- File: `tools/qr/index.html`
- Lines: 1735 ("Twenty questions, fifteen minutes"), 1770 ("QUESTION 1 OF 20"), 8970-8983 (`DIAG_BANK` 12 entries), 8989 (`maxQuestions:18`), 9000 (`skillsToProbe` 9 skills)
- Description: A real student following the adaptive path tops out at ~9-12 questions before the engine exhausts the bank, then jumps to the results. The static "QUESTION 1 OF 20" + "Twenty questions" copy will read as broken or incomplete.
- Suggested fix: Either expand `DIAG_BANK` to 18-20 questions and revise `skillsToProbe` to 12+ skills, or update the static copy at line 1735 and line 1770 to match the real bank size (e.g. "Up to 12 questions, 10-15 minutes").

### P0-4. Diagnostic mid-flight has no exit affordance
- File: `tools/qr/index.html`
- Lines: 1768-1782 (`#diagBody`)
- Description: Once `DIAG.start()` runs, `#diagBody` shows only the question, options, confidence stars, and a "Next question" button (disabled until the student answers + rates). There is no "exit" / "back to home" / "stop diagnostic" affordance, no way to return to the intro, and no way to quit early without reloading. A student who panics during Q3 has to either guess-rate-guess-rate to escape or close the tab.
- Suggested fix: Add a `<button class="btn ghost sm" onclick="DIAG.restart()">Cancel diagnostic</button>` near the `Next question` button at line 1780, and either reset state or write partial results.

### P0-5. Edit Mode (tutor-only) is a permanent topbar button visible to every student
- File: `tools/qr/index.html`
- Lines: 1704 (`#btnEdit`), 10134 (toggle handler), 10018-10132 (`SARAH_EDIT`)
- Description: `Sarah's edit mode` lets anyone clicking `#btnEdit` rewrite content tagged `[data-editable]` (lock lines, traps, sarahTricks, worked-step whys). Edits persist to `localStorage`. A first-time student who pokes the button can mutate their own copy of the tool and either be confused by the new behavior or accidentally export their edits to Tommy. The export button label "Export & Send to Tommy" (line 1640) leaks an internal name to the student.
- Suggested fix: Gate `#btnEdit` behind Sarah-mode (only render when `SARAH.on === true`), or move it behind a query-string admin gesture (e.g. `?tutor=1`). Rename "Tommy" to "your tutor" or hide the button entirely from student builds.

### P0-6. Diagnostic question fd3 has correct=0 but the why-text says the correct answer is 0.43
- File: `tools/qr/index.html`
- Line: 2386
- Description: Problem `fd3` reads "Which is bigger: 3/7 or 0.43?", `opts:['3/7','0.43','equal','can't tell'], correct:0`. The why-string then reads `'3/7 ≈ 0.4286. Wait — 0.43 > 0.4286? Yes, 0.43 > 3/7. Correct answer: 0.43.'`. The data and the explanation contradict each other. A student who chooses 0.43 is told they are wrong and then immediately reads "Correct answer: 0.43" inside their wrong-feedback. The `fix:'corrected'` flag suggests this was patched but the patch is incomplete.
- Suggested fix: Change `correct:0` to `correct:1` on line 2386 and clean up the why text to drop the "Wait —" debug aside.

---

## P1 — Should ship before launch

### P1-1. `#fbPill` contains a `💬` emoji glyph (no-emoji rule violation)
- Line: 1645
- Glyph: `💬`
- Suggested fix: Replace the `<span>💬</span>` with an inline SVG (a simple speech-bubble path matches the brand) or with the text `Note`.

### P1-2. `⌬` decorative benzene/aperture glyph in skill-tree card mark
- Line: 1818 (`<div class="mark">⌬</div>`)
- Glyph: `⌬`
- Suggested fix: Replace with the existing teal Playfair "Q" mark used on other cards, or with a simple inline SVG node-graph icon.

### P1-3. `⌬` decorative glyph in onboarding step 1
- Line: 10238
- Glyph: `⌬`
- Suggested fix: Replace with the same SVG used in P1-2 so the onboarding overlay stays on-brand and emoji-free.

### P1-4. `↩` arrow glyph on the isolate-exit pill
- Line: 1634
- Glyph: `↩`
- Suggested fix: Replace with a small inline SVG arrow (the file already uses inline SVG arrows elsewhere in the topbar, e.g. line 2124 polyline arrows).

### P1-5. `✓` checkmark glyph in `qrCmExample` count-pc readout
- Line: 6103
- Glyph: `✓` (`same digits top & bottom (${r} each) ✓`)
- Suggested fix: Replace the trailing `✓` with the word "match" (e.g. `same digits top & bottom (${r} each) — match`).

### P1-6. Sidebar tier-0 progress label hardcoded "0/13" but SKILLS has 14 tier-0 entries
- Line: 1556 (`<b id="prog-tier0">0/13</b>`)
- Description: Tier 0 in `SKILLS` (lines 2282-2295) lists 14 modules. The denominator should be 14. A student at full mastery sees `14/13` or `13/13` depending on which path the JS takes to update.
- Suggested fix: Change the static `0/13` to compute from `SKILLS.filter(s=>s.tier===0).length` on first render, and update line 1556 default to `0/14`.

### P1-7. Sidebar tier-2 progress label hardcoded "0/14" but SKILLS has 17 tier-2 entries
- Line: 1558 (`<b id="prog-tier2">0/14</b>`)
- Description: Tier 2 (lines 2306-2322) has 17 entries (16 if `pat-seq` is removed per P0-2). Denominator drift identical to P1-6.
- Suggested fix: Set the denominator from data and update the static placeholder to `0/16` (after fixing P0-2).

### P1-8. Skill tree card claims "40 nodes" but SKILLS has 44
- Line: 1820 (`<h3>40 nodes · <em>floor to test-day</em></h3>`)
- Description: Stale copy. Even after removing `pat-seq` per P0-2, the count is still off.
- Suggested fix: Compute the count from `SKILLS.length` at render time, or update the literal to match the post-cleanup count (e.g. `41 nodes`).

### P1-9. Onboarding step 1 says "40 skills" — same drift
- Line: 10238 (`<div class="up muted" style="margin-top:8px">40 skills · floor to test-day</div>`)
- Suggested fix: Match the real count after the orphan cleanup.

### P1-10. Sarah-mode walk drops 4 modules (binomials, geo-2d, sets, desc-stats)
- Line: 9903 (`SARAH.modules` array, 37 ids)
- Description: When Sarah hits "Forward" through the tour, she silently skips four real modules. Either the omission is intentional (then the walk under-promises coverage) or accidental (then those modules look invisible during a tutor-driven session).
- Suggested fix: Add `'binomials','geo-2d','sets','desc-stats'` to `SARAH.modules`, or generate the array from `SKILLS` with `.filter(s => MODULES[s.id])`.

### P1-11. Section numbering collision: Drill labelled "PERFORMANCE · 04" matches Pacing
- Lines: 1939 (Pacing — `PERFORMANCE · 04`), 1989 (Drill — `PERFORMANCE · 04`)
- Description: Both sections use the same "PERFORMANCE · 04" header number. Test-Sim is `05`, so Drill should be `06`.
- Suggested fix: Edit line 1989 to read `PERFORMANCE · 06`.

### P1-12. `patterns-link` card claims "9 fully-animated patterns" but Tier 2 has 14+
- Line: 1892 (`<h3>9 fully-animated patterns</h3>`)
- Description: Stale count from an earlier build. With `pat-seq` removed, Tier 2 still has 16 patterns and 14 of them have bespoke `QR_RENDERERS` per Agent 01's scorecard.
- Suggested fix: Update to `<h3>14 fully-animated patterns</h3>` or compute it.

### P1-13. Title and topbar crumbs leak "Thomas Review Lab" — internal naming
- Lines: 6 (`<title>AceTheDAT QR · Thomas Review Lab</title>`), 1702 ("QR Review Lab" is fine but the crumb code default is fine), 2135 (script comment)
- Description: Browser tab and bookmark show "Thomas Review Lab" — internal naming for the tutor's workshop, not the student-facing brand.
- Suggested fix: Change the `<title>` at line 6 to `AceTheDAT — QR Review Lab` (keep "QR Review Lab" elsewhere). The script comment at line 2135 is fine.

### P1-14. No 375px-specific breakpoint; smallest is 480px
- Lines: 1229-1253 (520px), 1534-1541 (480px)
- Description: The Sarah-bar (line 2121) becomes a multi-line wrap at narrow widths, but `.tree-svg { min-width: 760px }` (line 1210) forces horizontal scroll on the skill-tree section even at iPhone-12 width — the legend below the SVG falls off-screen. The hero stats stay 2-col at 375px (line 1231) but `.btn.gold.sm` (line 1245) at 11px is borderline.
- Suggested fix: Add a `@media (max-width: 380px)` block that reduces `.tree-svg { min-width: 640px }` (or wraps it in a clearer "scroll →" nudge), and bumps `.btn.gold.sm` font-size to 12px to satisfy WCAG touch-target sizing.

---

## P2 — Polish

### P2-1. Sarah-Mode is the only way to reach "Sarah's Dashboard," but the dashboard is also a sidebar link with no gating
- Line: 1621 (`<a class="sb-link" data-go="sarah-dash">…tutor</a>`)
- Description: Per Agent 10 audit, `#sarah-dash` is reachable without `SARAH.on === true`. The `meta` says "tutor" but a curious student can open it.
- Suggested fix: Add a guard in the data-go handler (line ~8815) that, for `sarah-dash`, prompts `Sarah-Mode? [Enter passcode]` or hides the link unless Sarah-mode is on.

### P2-2. Stuck-button records only `{t}`, drops module + attempt context
- Line: 9212 (`ST.push('stuck-events', {t:Date.now()});`)
- Description: Per Agent 10's brief — the stuck event lacks the current module ID and the most recent attempt's problem ID. Sarah cannot reconstruct what froze the student.
- Suggested fix: Capture the current section ID via `document.querySelector('.sec.iso-sec, [data-current]')` or the last sidebar `.active` link, and the last `attempts` entry, and push them with the timestamp.

### P2-3. Per-module Sarah notes feature missing entirely
- File: across modules (no `sarahNotes_v1` localStorage key)
- Description: Per Agent 10. Tutors today can only rewrite content in place, not annotate.
- Suggested fix: Add `sarah-notes` localStorage namespace with `{moduleId: {text, t}}` and render a `Sarah says:` banner above any module that has a saved note. Hide for non-Sarah viewers? Up to product. (P2 because absence is documented, not a launch blocker.)

### P2-4. FEEDBACK export button visible to every student, not hidden behind admin gesture
- Lines: 1671 ("Export & email log"), 10199 (`exportLog`)
- Description: Per Agent 10 — students can export their own feedback log. Not harmful, but the button reads as for-tutor.
- Suggested fix: Hide behind a 3-tap-on-fbPill or `?admin=1` query.

### P2-5. Boot console.log says "Foundation modules live: 6 · Tree nodes: 40"
- Line: 10424
- Description: Stale boot banner. We have 14 tier-0 modules booting and ~41 tree nodes after cleanup. Not student-visible (devtools only) but reads as broken when Thomas opens devtools.
- Suggested fix: Drop hard-coded numbers; compute from `SKILLS.filter(s=>s.tier===0 && MODULES[s.id]).length` and `SKILLS.length`.

### P2-6. `stuck-events` stored with no rotation cap
- Line: 9212
- Description: Pushes one entry per stuck-button click forever. Over a year of use the array grows unbounded.
- Suggested fix: After `ST.push`, slice to last 500.

### P2-7. `attempts` array sliced to 2000 in two places, but other writers don't slice
- Lines: 9665, 9737 (slice to 2000); 8485, 8502 (no slice)
- Description: Inconsistent rotation. After ~2000 attempts a student's `attempts` write (line 8485, the main delegate) starts overwriting nothing, but `confidence` patches (line 8500) only walk the array.
- Suggested fix: Centralize in a single helper `addAttempt(rec)` that pushes + slices to 2000.

### P2-8. CSP missing entirely; no `<meta http-equiv="Content-Security-Policy">`
- Line: 3-9 (head)
- Description: The file loads anime.js from jsdelivr.net via http (line 9 is HTTPS) and Google Fonts CSS (line 8). No CSP locks down what other origins could be loaded if a future dependency creeps in. Not a launch blocker, but for a student-facing tool worth adding.
- Suggested fix: Add `<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:;">` (note `'unsafe-inline'` is required because of inline event handlers and inline styles — over time, replace those for tighter CSP).

### P2-9. No `<meta name="description">` for SEO / link-share previews
- Line: 4-9 (head)
- Suggested fix: Add `<meta name="description" content="AceTheDAT QR Review Lab — diagnose your QR floor, rebuild it skill by skill, then ladder into pace.">`.

### P2-10. Diagnostic Q1 confidence prompt label "How sure were you?" overwrites with "Before you see — how sure are you?" only after pick
- Lines: 1774 (static label), 9059-9063 (post-pick label change)
- Description: On first render the confidence box says "How sure were you?" — past tense, but the rate-after-pick UX is now pre-confidence. Hidden by `display:none` until pick, but reachable via accessibility tools.
- Suggested fix: Change the static label at line 1774 to "Before you see — how sure are you?" so the markup matches the JS behavior.

### P2-11. `console.warn` left in two SARAH-mode/isolate paths (no `console.log`s left in main flow)
- Lines: 9924 (`SARAH.iso: no section/card for`), 9993 (`isolate auto-exit (no iso card)`)
- Description: Operational warnings useful in dev, noise in production. The main `console.log` boot banner at lines 10423-10424 is also debug-only.
- Suggested fix: Wrap in a debug helper `if (window.QR_DEBUG) console.warn(...)` and gate `QR_DEBUG` on `?debug=1`.

### P2-12. "I need a sec" stuck-modal has no auto-focus on the primary action when opened
- Lines: 9203-9213 (`STUCK.open`)
- Description: A11y / panic-state UX gap. Student in panic hits the button, modal opens, but focus stays on the sidebar button. Screen-reader users get no announcement.
- Suggested fix: After `classList.add('show')`, call `document.querySelector('#stuckTriage button.gold')?.focus()` and add `role="dialog" aria-modal="true" aria-labelledby="stuckTitle"` on the `.modal-back`.

### P2-13. Sidebar foot "Sarah-mode" row says "off" by default, never wired to the value when SARAH.on is set externally
- Lines: 1629 (`<b id="sarahState">off</b>`), 9904 (`SARAH.toggle` flips it)
- Description: Only `SARAH.toggle` updates the foot label. If `SARAH.on` is set elsewhere (it isn't today, but if it were), the label drifts.
- Suggested fix: Wrap `SARAH.on` in a setter that updates the label, or call `updateSarahLabel()` from any state-mutation site.

---

## Methodology

- File read top-to-bottom; cross-referenced against Agent 01 SCORECARD and Agent 10 AUDIT under `proposals/`.
- Decorative-glyph search regex covered emoji blocks U+2600-27BF, U+1F300-1FAFF, plus targeted searches for ✓ ✗ ★ ☆ ● ◉ ◯ ✨ ↩ ⌬ ⚙ and similar.
- Skill-array vs section-placeholder reconciliation: `SKILLS` (line 2280) has 44 entries; `<section class="sec">` placeholders (lines 1837-1877) cover 41; the boot list (lines 10406-10413) renders 41; `MODULES` keys cover 41. Orphans are `pat-seq`, `pace-90`, `pace-60` — all P0.
- Diagnostic walked manually: intro → start → pick → rate → reveal → next, plus skip → results, plus restart. Mid-flight exit is the only missing exit.
- All 41 sidebar `data-go` targets resolve to a section that exists in the markup.
- No external links to `tools/bio/`, `tools/oc/`, or other AceLabs tools — only an internal link to `qr-pattern-system-v1.html` (line 1897, exists) and tiktok deep-links (line 5273, directory exists).
- No payment / billing / "package" language exposed to students. No hard-coded student names, no PII.
