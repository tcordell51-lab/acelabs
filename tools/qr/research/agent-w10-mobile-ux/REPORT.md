# Agent W10 — Mobile-First Study Tool UX + Session Design

Lane: session length, interaction patterns, onboarding, gesture vocabulary, daily-habit design.

## Anki

- Default 20 new cards/day is **too high** — community wisdom says 10. Each new card = ~7 follow-up reviews/month.
- Anki interleaves new + review by default → automatic interleaving across topics.
- **Mobile (AnkiDroid) caps at 30 cards per session** before "limit reached" prompt. Even motivated SRS users need bookends.
- Sustainable target: 30-90 min/day total, split across 2-4 sittings.

## Quizlet

- Learn mode (paywalled) is adaptive, weights weaker items.
- "One deck, many access modes" — same content as flashcard, timed quiz, match game.
- Weakness: no metacognition, no tutor explanation depth. Pure recall test, can grind without exposing why wrong.

## Duolingo

- **Lessons designed for 1-3 minutes.** Sub-30-second commitment to open the app.
- Streaks: 7-day-streak users 3.6x more likely to remain engaged. Streak Freeze reduced churn 21%. Loss aversion > reward seeking.
- **Hearts/lives map poorly to DAT.** Don't copy hearts. Copy the rhythm (short loops, immediate feedback) without the punishment.
- Famous failure mode: "streak for 600 days, not actually conversational." Streaks must be tied to **minimum quality bars** for high-stakes prep.

## Photomath

- **Camera-first input.** Point phone at problem → recognized → step-by-step. Phone IS scratch pad.
- Gesture vocabulary: single-finger, edge-driven swipes; pinch to resize; no complex multi-finger.
- **Step-by-step pacing**: each step is gated; users tap to reveal next. Translates directly to "show me how" tutored sessions.

## Headspace / Calm

- 5-20 min sessions; pitch is "10 min/day." Pattern: default 10, with 5-min "short" + 20-min "deep" presets.
- Reminder preference is highly polarized. **Opt-in, time-of-day customizable, intrinsic-trigger language** ("you said you wanted to be DAT-ready by August — 73 days left"), never "Come back!"
- Habit metrics visible but not dominant. Tone: calm, low-pressure, never-shaming.

## Micro-learning research

- Systematic reviews (2024-2025): **5-10 min sessions, 3-5x/week** is the evidence-based sweet spot.
- Microlearning vs traditional: **SMD ≈ 0.74** (medium-large effect).
- Retention improvements 25-60% across studies.
- Microlearning groups 87% more likely to be retained.
- Spacing: first review ≤24h, second 3-7d, then expanding intervals. **Optimal review interval ≈ 10% of time-until-test.**
- **Fragmented mobile attention (Oulasvirta):** mobile attention shifts every 4-8 sec in real-world conditions. Lab attention 16+ sec collapses on mobile. Mobile content must survive interruption.

## Touch UX for math

- **Phone-class:** single-finger only (multi-finger fails on small screen, thumbs occlude). Edge gestures work. Math equation editing requires native math keyboard.
- **iPad-class:** two-finger pinch/pan, Apple Pencil for scratch work, side-by-side problem + scratch.
- **Direct manipulation:** TouchCounts shows multi-finger arithmetic; for QR, draggable number-line, pinch-resize triangle, draggable percentage bar.

## Onboarding

- 72% of users believe onboarding should take ≤60 sec.
- Average mobile app loses 75% of users on day 1.
- **Aha moment within 60 sec is strongest known predictor of long-term retention.**
- Best pattern for QR: (1) test date in 1 tap (2) confidence rating in 1 tap (3) 5-question diagnostic mini-test (4) result screen with predicted score band + named weak topic + "start your first 5-min session" CTA. Total: 90-120 sec. **No account creation until after the diagnostic** if possible.

## 7 UX recommendations for the QR tool

1. **Default session = 10 min / 5 items, NOT open-ended drill.** Three presets 5/10/20, default 10, hard-stop celebration. Volume goal split across 2-3 sittings, not crammed.

2. **Streaks with quality floor + Streak Freeze, never hearts.** Streak day = 5+ problems at appropriate difficulty with ≥60% accuracy. One Streak Freeze/week, earned by completing a tutored review of a missed problem.

3. **Phone vs iPad UX must diverge.** Phone: single-finger thumb-zone, swipe between problems, tap-to-reveal solution steps, native QR math keyboard, no scratch canvas. iPad: side-by-side problem + scratch canvas, Apple Pencil first-class, two-finger pinch on figures. Detect device class on entry; don't just shrink desktop.

4. **90-second diagnostic onboarding, no account first.** Test date → confidence → 5-Q diagnostic → personalized result screen with predicted score band, named weak topic, and "start 5-min targeted session" CTA. Account creation deferred or SSO-only.

5. **Tap-to-reveal worked solutions, never wall-of-text.** Borrow from Photomath. Forces engagement, gives student chance to predict next step, works around fragmented mobile attention.

6. **Test-date-aware scheduler, intrinsic-trigger reminders.** Use test date for spacing intervals (~10% of test-delay rule) AND reminder copy. "73 days to your DAT — 4 problems from today's goal" not "Come back!" Opt-in, single time picker, off by default.

7. **Resume-mid-problem state persistence + scan-a-problem entry.** Auto-save on every state change. Photomath-style scan/paste entry path lets students capture a question encountered elsewhere (textbook, practice test) and have the tutor explain it.

## Sources

- Anki Manual: https://docs.ankiweb.net/deck-options.html
- LeanAnki Best Settings: https://leananki.com/best-settings/
- Duolingo Streak Psychology: https://www.justanotherpm.com/blog/the-psychology-behind-duolingos-streak-feature
- Duolingo Time Spent Learning Well: https://blog.duolingo.com/time-spent-learning-well/
- Microlearning meta 2025: https://publikasi.teknokrat.ac.id/index.php/jurnalmathema/article/view/517
- Microlearning ScienceDirect 2024: https://www.sciencedirect.com/science/article/pii/S2405844024174440
- Spaced Digital Education Health Pros JMIR 2024: https://www.jmir.org/2024/1/e57760
- Oulasvirta CHI 2005 fragmented attention: https://www.interruptions.net/literature/Oulasvirta-CHI05-p919-oulasvirta.pdf
- Photomath: https://apps.apple.com/us/app/photomath/id919087726
- Headspace UX Case Study: https://raw.studio/blog/how-headspace-designs-for-mindfulness/
- Mobile App Onboarding 101 (Appcues): https://www.appcues.com/blog/mobile-onboarding
- LukeW Touch Gesture Reference: https://www.lukew.com/ff/entry.asp?1071=

## Executive summary

The single highest-leverage mobile UX move for a daily-use DAT QR tool is to **convert the default experience from "open-ended desktop drill" into a bounded 10-minute mobile micro-session anchored by a 90-second test-date-aware onboarding diagnostic and a quality-floored streak.**

Bounded sessions match the evidence: microlearning meta-analyses converge on 5-10 min sessions, 3-5x weekly, with 0.74 SMD effect on retention; Anki's mobile UI hard-caps at 30 cards; Duolingo's lessons are 1-3 minutes. The 90-second diagnostic borrows the strongest known retention lever in mobile — first meaningful action — turning the install-to-aha gap into "your weak topic is named, your first 5-min targeted session is ready" before account creation.

The quality-floored streak captures Duolingo's 3.6x retention multiplier without inheriting the "streak without skill" failure mode, because each streak day requires real accuracy at appropriate difficulty.

Everything else (tap-to-reveal, phone-vs-iPad split, scan-a-problem ingest, intrinsic-trigger reminders, mid-problem state persistence) is supporting infrastructure. The bounded-session + diagnostic-onboarding + quality-streak triad is the mobile-first reframe AceLabs' current desktop-first stance is missing — the single move that compounds across every other improvement.
