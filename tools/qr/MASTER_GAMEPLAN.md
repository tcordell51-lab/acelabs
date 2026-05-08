# QR Tool Master Gameplan — Evidence-Grounded Build Plan

**Date:** 2026-05-08
**Source of truth:** 10-agent web research synthesis at `tools/qr/research/`
**Target outcome:** A 600-tier DAT QR study tool that beats Bootcamp/Booster on the wedges they can't claim.

## Strategic positioning

AceLabs cannot win on raw question count (Booster has 11.2k, Bootcamp has 11k). The wedge is **timing intelligence + tutor-in-the-loop + mastery rigor**, validated by:

- W3 (competitors): "I run out of time with 7-10 questions left" is the universal student complaint; **no platform trains the skip decision**.
- W8 (tutor patterns): AceLabs has Sarah; competitors don't. Khanmigo's per-student summary is the most underrated tutor-loop feature.
- W6 (psychometrics): the current 22-Q identity Q-matrix is the **mathematically least-informative shape** for diagnosis — easiest fix with highest leverage.

## Priority-ranked build list

### P0 — ship first (highest evidence × leverage)

**Build 1 — Q-matrix rebuild + weighted scoring**
- Re-author 22 diagnostic items so each loads on 2-3 skills (cross-loaded matrix). DAT exam item structure naturally cross-loads (a ratios-in-geometry word problem implicates ratios, geometry, AND word-problem modeling), so this matches the construct.
- Replace single-correct/incorrect tally with weighted-skill-error: each skill receives evidence from ~3 items; harder misses count more; Laplace-smoothed mastery probability per skill.
- Replace fixed Weak 3 with confidence-gap-bounded weak set (1-6 skills depending on signal).
- **Evidence:** W6 (CDM theory, DINA-light), W7 (formative loop d=0.90 dominates threshold).
- **Effort:** 4-6 hours authoring + ~30 LOC.
- **Compounds with:** every other build downstream needs accurate weak-skill routing.

**Build 2 — Sarah summary view + item-anchored notes**
- Per-student summary panel: AI-generated 6-line digest (items struggled this week, items mastered, recurring misconception themes, last attempt, last Sarah note).
- Replace module-level Sarah notes with item-anchored notes (note attached to QR question N, surfaces inline when student re-encounters that question).
- **Evidence:** W8 (Khanmigo Summarize Student Chat History; Newsela/Eureka anchored notes).
- **Effort:** ~1 day.
- **Why critical:** Sarah-mode is the moat Bootcamp/Booster cannot copy. Without summary, Sarah doesn't scale.

**Build 3 — Per-checkpoint pacing benchmarks + Friday mini-mock**
- Extend Agent 8's pacing simulator with: pace-target line for 22+ scorer at every Q-number; user actual pace vs target; gap with recommendation.
- New "Two-Pass Drill" preset that *forces* skipping 5 hardest-marked questions in pass 1.
- New Friday mini-mock: 22-question, 22-minute interleaved mixed-skill section drawn from skills the student practiced this week.
- **Evidence:** W3 (timing is universal complaint), W9 (LSAT/MCAT consensus on per-checkpoint benchmarks), W2 (interleaving d = 0.83-1.21).
- **Effort:** ~2 days. Leverages existing pacing-sim engine.
- **Why critical:** directly attacks the wedge no competitor owns.

### P1 — ship soon

**Build 4 — Pattern Library (Chunks Engine)**
- ~30 high-yield DAT QR chunks: 0.125 = 1/8, √2 ≈ 1.414, 30-60-90 ratios, % ↔ fraction conversions, 11s rule, near-base squaring, perfect squares to 25, GCF/LCM tricks, work-rate combine formula, distance triangle, etc.
- Each chunk = one card with recognition prompt ("see this expression / pick the chunk") and generation prompt ("compute this without calculator").
- Spaced repetition (1d → 3d → 7d → 14d → 30d).
- **Evidence:** W9 (Ericsson chunking, Beilock choking-defense, Magoosh design).
- **Effort:** ~3 days authoring + UI.
- **Compounds with:** speed mode in Build 6.

**Build 5 — Productive Failure entry on conceptually rich modules**
- For modules tagged "conceptually rich" (combined work, mixture, non-obvious geometry, Bayes/conditional prob), front-load a single hard problem before instruction.
- 5-min cap, no hints, no penalty for wrong; then reveal worked solution + walkthrough.
- For drill modules (mental math, simple percents), keep instruction-first.
- **Evidence:** W7 (Sinha & Kapur 2021 d = 0.36-0.58, stronger for older learners).
- **Effort:** ~1 day to author the wrapper + tag 8-10 modules.

**Build 6 — Calculator Tax mode**
- Don't lock the calculator (W9: trains wrong policy, hard test has the calculator).
- Log every calculator open per question.
- Surface "calculator opens per question" in post-session debrief.
- Optional "Calculator Tax" mode that adds +10s to timer per open (mimics real-test mouse latency).
- **Evidence:** W1 (DAT calc is mouse-only, intentionally slow), W9 (calculator avoidance is top-scorer habit).
- **Effort:** ~half day.

### P2 — ship later

**Build 7 — Mobile bounded sessions** — 5/10/20 min presets, hard-stop celebration, state persistence resume-mid-problem, phone vs iPad UX divergence. *Effort: ~3 days. Evidence: W10 (microlearning meta SMD = 0.74).*

**Build 8 — 90-second onboarding diagnostic** — test date → confidence rating → 5-Q diagnostic → personalized result with named weak topic + first 5-min targeted session CTA. *Effort: ~2 days. Evidence: W10 (60-sec aha moment is strongest mobile retention lever).*

**Build 9 — Quality-floored streak with Streak Freeze** — replace any future streak system with: streak day requires 5+ problems at appropriate difficulty with ≥60% accuracy. One Streak Freeze/week earned by completing tutored review. *Effort: ~2 days. Evidence: W4 (SAT-streak +19% anxiety), W10 (Duolingo 3.6× retention).*

### P3 — future

**Build 10 — Newsela-style item annotation conversation** — student annotates question, Sarah replies in thread.
**Build 11 — Sarah voice memo at session start** — 30-sec audio that plays when student opens next session.
**Build 12 — Calibrated real-DAT score predictor** — replace inflated practice scores with confidence interval trained on past student outcomes.

## Hard constraints

- **No emojis or decorative unicode glyphs** anywhere.
- **No loss-aversion mechanics** (hearts, streak-loss, leaderboards).
- **Anxiety-aware:** errors are quiet, no red flash, three-option triage when stuck.
- **Mobile-first** is later (P2) but every new widget ships mobile-friendly from day one.
- **Builds must compose:** wrap shared functions (renderModule, etc.) — never replace them.

## Wave-1 execution plan

Six parallel worktree-isolated agents, each owning one P0 or P1 build:

| Agent | Build | Scope | Estimated |
|---|---|---|---|
| QR-A | Q-matrix rebuild + weighted scoring | Build 1 | ~30 min |
| QR-B | Sarah summary + item-anchored notes | Build 2 | ~30 min |
| QR-C | Per-checkpoint pacing + Friday mini-mock | Build 3 | ~30 min |
| QR-D | Pattern Library | Build 4 | ~30 min |
| QR-E | Productive Failure entry | Build 5 | ~30 min |
| QR-F | Calculator Tax mode | Build 6 | ~30 min |

Each agent commits to its own branch in an isolated worktree; merged sequentially into main after completion.

## Wave-2 (P2 builds) — defer to next session unless time allows

Mobile bounded sessions, onboarding diagnostic, quality-floored streak. These are larger-scope and deserve a dedicated session.

## Success metrics for Wave 1

- Q-matrix change: any individual student diagnostic re-run produces stable Weak set (vs 1-shot noise).
- Sarah summary: Sarah can open a student panel and act on it without scrolling raw logs.
- Pacing benchmarks: at Q10 of pacing sim, the user sees a specific "+/-N seconds vs target" indicator.
- Pattern Library: ~30 chunks accessible from a new menu item, spaced-retrieval scheduling working.
- Productive Failure: at least 5 modules have a PF front-load step before the regular Concept stage.
- Calculator Tax: post-session debrief shows opens-per-question; tax mode toggleable in pacing sim.

## What this is not

This is not a rewrite. Every build composes additively on top of the existing 11k-line tool. The wave-1 agents will commit isolated changes that merge cleanly into main.

## After Wave 1

- Run beta with Sarah and 2-3 students.
- Collect 1-week feedback.
- Decide P2 sequencing based on real student data.
- Author a Wave-2 gameplan from observed gaps.
