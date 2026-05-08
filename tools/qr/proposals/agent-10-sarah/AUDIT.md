# Agent 10 audit — Sarah-mode operational state

Scope: read-only review of `tools/qr/index.html` (10,427 lines, master HTML). No edits to the master.

## 1. Sarah-mode dashboard (current state)

**What exists today**
- `#btnSarah` lives in `.topbar` (line 1708). It toggles a global `SARAH` controller (lines 9901-9946) that primarily drives a scrubber bar `#sarahBar` (lines 2121-2131) — Sarah-mode today is a **module-walk player**, not a per-student panel.
- `SARAH.modules` is a hardcoded array of 36 module IDs (line 9903). It has Back/Play/Forward/Isolate/Exit controls. It scrolls to the section, can launch the first worked example, can isolate the current card.
- A separate "Sarah's Dashboard" section exists at `#sarah-dash` (lines 2007-2038), reachable from the sidebar (line 1621). `renderSarahDash()` at line 9820 builds:
  - A roster card for the *current device's* student plus a placeholder "+ Add student (next pass)" card.
  - An auto-generated session plan based on mastery state (3 branches: zero mastered, has partials, all-clear).
  - Recent activity (last 10 attempts) and a stuck-event count.
- The dashboard is **not gated by Sarah-mode**. Students can navigate to `#sarah-dash` from the sidebar today.
- Code comments admit the gap: "Capture in next pass: per-student profiles, assignment system, session-notes attached to each student, pre-session check-in prompt."

**Gaps for the spec**
- No multi-student picker — single live student per device.
- No "weakest 3 skills" surfaced as a focused widget. Mastery state is folded into the plan generator only.
- "Last attempt date" not shown explicitly per skill.
- No tutor note thread (per-student diary). Notes today live only inside the feedback log.
- Sarah-mode toggle does not switch the dashboard rendering; the dashboard renders the same regardless of `SARAH.on`.

## 2. Per-module Sarah notes (current state)

**What exists today**
- `SARAH_EDIT` mode (lines 10018-10132) lets Sarah click any element tagged `[data-editable]` and rewrite it in place. Edits persist in `localStorage` under `sarah-edits` and `sarah-edits-orig`. `tagEditables(skillId)` (line 10137) tags lock lines, traps, patterns, trick names/moves/whys, and worked-step whys.
- An "Export & Send to Tommy" button on the edit-mode banner (line 1640) ships those edits.
- This is **content rewriting**, not annotation. There is no surface for "leave a note that students see at the top of this module."

**Gaps for the spec**
- No per-module note primitive. No `sarahNotes_v1` (or similar) localStorage key. No render hook that injects a tutor note banner above the module.
- Edits are invisible to students — they look like regular content. A tutor note should be visually distinct ("Sarah says: …") and skippable.

## 3. Stuck button (current state)

**What exists today**
- `#stuckBtn` is the red "I need a sec" pill at the bottom of the sidebar (line 1623). Click handler at line 9282.
- `STUCK.open()` (line 9202) records `{t:Date.now()}` to `stuck-events` localStorage and shows `#stuckModal` (lines 2085-2118) with three options:
  1. **Three quick wins** — pulls 3 random problems from skills the student has already mastered to rebuild flow.
  2. **60-second breath** — 4-cycle 4·4·4·4 box breathing animation.
  3. **Move on for now** — closes the modal.
- The stuck *event* is recorded for Sarah's dashboard (a count under "Stuck-button log") but the **module context and the recent attempt are not captured**.

**Gaps for the spec**
- No link from a stuck event to a flagged Ace Card. No `aceCards_v1` (or analogous) write today.
- The current attempt that triggered the freeze is not captured — Sarah cannot later see *what problem* froze the student, only that they hit the button N times.

## 4. Feedback flow (current state)

**What exists today**
- `#fbPill` (line 1645, **contains an emoji glyph that violates Thomas's no-emoji rule** — flag for cleanup).
- `#fbModal` (lines 1648-1675) collects: tag (wording, example, trap, missing, bug, idea), free text, page context (the crumb).
- `FEEDBACK` controller (lines 10153-10223) writes to `feedback-log` in localStorage as `{t, tag, text, ctx}`.
- `FEEDBACK.exportLog()` (line 10199) **already exports to markdown** — generates a date-stamped `.md` file, copies to clipboard, and triggers a download.
- Export button is **not hidden** — it sits in the modal openly labelled "Export & email log".

**Gaps for the spec**
- The export already produces markdown, so feature 4 is largely there. The spec asks for a **hidden admin gesture** instead of an open button — that is the only missing piece. (Plus the emoji.)

## Summary table

| Feature | Storage key today | Render surface today | Operational? |
|---|---|---|---|
| Sarah dashboard | `attempts`, `stuck-events`, `mastery` | `#sarah-dash` section | Partial — single student, no weak-skills widget, no notes thread |
| Per-module notes | none | none (only content rewriting via `sarah-edits`) | Not built |
| Stuck → Ace Card | `stuck-events` (timestamp only) | `#stuckModal` | Triage flow exists; no Ace Card capture |
| Feedback export | `feedback-log` | `#fbModal` + visible export button | Working; needs hidden-gesture UX |
