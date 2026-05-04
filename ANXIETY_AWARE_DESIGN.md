# Ace Labs · Anxiety-Aware Design

The architectural spec for "anxiety-aware" interactions across all four Ace Labs tools (QR, Bio, GC, OChem). This is one of the three distinctive design moves that separate Ace Labs from generic DAT prep — alongside tutor-driven coaching and pattern-first pedagogy.

> **Universal architecture · subject-tuned options.** Don't copy-paste QR's stuck modal into Bio. The structure transfers; the specific buttons inside it should match the actual anxiety pattern of each subject.

## Why anxiety-aware

Most DAT prep products optimize for content delivery. Ace Labs optimizes for the moment a student freezes, gets overwhelmed, or considers quitting. That moment is what determines whether they finish the program — and whether they remember the content when they sit for the test.

The architecture below is an attempt to give students a way out of every freeze that isn't "I'm bad at this, I quit." Five universal pieces, with subject-specific tunings.

## The five universal pieces

### 1. The Stuck Triage Menu

Every tool has a clearly-labeled "stuck" affordance. When activated, it opens a triage menu with **three options**, never more:

- **A way back to flow** — quick wins from already-mastered material
- **A way to settle** — a low-cognitive-load action that lowers physiological arousal
- **A way to skip** — mark this and come back later

The student picks one. They never have to admit "I don't know this." They make a choice between three good options.

**Architectural rule:** the menu is the same shape in every tool. The buttons are tuned per subject. The breath modal in QR is the "way to settle" for math anxiety. The Bio "way to settle" is different (see below). Do NOT use breath universally — for some subjects it's a mismatch and reads as patronizing.

### 2. Confidence Ratings

Every problem ends with a 1-5 confidence rating, captured separately from accuracy. Used in two ways:

- **Per-problem signal** — confidence < 3 on a "correct" answer means the knowledge is fragile, schedule for review
- **Per-skill aggregate** — average confidence per module, surfaced on the dashboard

**Architectural rule:** confidence rating is universal across all four tools. Same 1-5 scale. Same captured-after-each-problem timing. Subject-agnostic.

### 3. No Timer Until Accuracy Floor

A pacing ladder gates timed practice behind an untimed accuracy floor (typically 80%). Students cannot enter timed mode for a skill until they've hit the floor untimed.

**Architectural rule:** universal pattern, but the floor percentage can vary by subject. QR is 80%. Bio retrieval cards might be 75%. The principle is the same: don't add time pressure to unmastered material.

### 4. Identity-Aware Hero Framing

Every tool's homepage / first-touch screen acknowledges the most common identity gap that brings students to that subject. Not generic "you got this" hype — specific reframing of a real fear.

| Tool | Identity gap | Reframe |
|---|---|---|
| QR | "I'm bad at math" | "You're not bad at math. A step got skipped." |
| Bio | "Too much to memorize" | "Memorizing volume is a skill, not a talent. Spaced retrieval does the work." |
| GC | "Chemistry doesn't make sense" | "Gen chem is patterns. The math underneath is short — recognize the pattern, the math falls out." |
| OChem | "I'm bad at organic" | "OChem is recognition. You're not bad at it — you haven't seen enough patterns yet." |

**Architectural rule:** every tool gets one. The text is subject-specific. Do NOT use a generic version.

### 5. End-on-a-Win Session Ritual

Encoded in coach docs, not the tool itself. Every coaching session closes with the student having just done something correctly. If a session is going sideways, bail to a green skill for the last 5 minutes. The student leaves remembering the win, not the freeze.

**Architectural rule:** universal coaching principle. Same in every coach guide.

## Per-subject triage menu tunings

The "way to settle" option is the most subject-sensitive piece. Get it right or the whole architecture reads wrong.

### QR (Sarah · math)

```
You've hit a wall. Pick one:

  ▸ Three quick wins                   ← from skills you've locked
  ▸ Take a 60-second breath break      ← box breathing 4-4-4-4
  ▸ Move on for now                    ← mark and come back
```

**Why breath fits:** math anxiety is largely physiological — racing heart, tunnel vision, frozen working memory. A 60-second nervous-system reset works. Validated in QR session transcripts.

**Why it's the default:** math is the most common pre-dental anxiety trigger. The breath option lands.

### Bio (Riya · biology)

```
Feeling lost? Pick one:

  ▸ Three quick recall cards           ← from hubs you've already mastered
  ▸ Step back to the hub overview      ← re-orient — see where you are
  ▸ Move on for now                    ← skip this card, come back later
```

**Why no breath:** Bio anxiety is rarely physiological freeze. It's "drowning in volume" or "where am I in this whole structure?" The relevant intervention is re-orientation, not nervous-system reset. A breath modal in Bio reads as patronizing wellness-fluff to students who are anxious because they have 800 pathways to memorize and 6 weeks left.

**The "step back to the hub overview" option** opens a high-level visual map of the current hub (Cell, Genetics, Physio, etc.) showing what they've covered, what's left, and where the current node sits. The act of re-orienting IS the calming move.

### GC (Tommy · gen chem)

```
You've hit a wall. Pick one:

  ▸ Three quick wins                   ← from skills you've locked
  ▸ Take a 60-second breath break      ← box breathing 4-4-4-4
  ▸ Move on for now                    ← mark and come back
```

**Why breath fits:** GC has substantial math overlap — acid/base, equilibrium, ICE tables, gas laws, thermo calculations. The same physiological anxiety pattern as QR appears here. Keep the breath option.

**Mostly a copy of QR.** Same architecture, same options.

### OChem (Tommy · organic chem)

```
Stuck on a mechanism? Pick one:

  ▸ Three quick wins                   ← from reaction families you've mastered
  ▸ Pull up the Reagent Reference      ← look it up — keep moving
  ▸ Move on for now                    ← mark and come back later
```

**Why no breath:** OChem freeze is "I don't recognize this product" or "what does this reagent do?" — not nervous-system spike. It's a recognition gap, and the calming move is to LOOK IT UP. Looking something up at low cognitive load IS the breath equivalent in OChem. Students who use the reagent reference 20 times when stuck eventually recall it cold.

**The "Reagent Reference" option** opens the existing reagent encyclopedia (already in the OChem v1 tool). Students stay in flow. They didn't admit they're stuck — they admitted they need a reference. Different framing, same calming effect.

## Implementation checklist per tool

When adding the architecture to a non-QR tool, the work breakdown:

- [ ] **Triage modal HTML** — three buttons, subject-tuned options
- [ ] **Triage state** — `STUCK_<SUBJECT>` object with show/hide/route methods
- [ ] **Trigger** — "I need a sec" or "Stuck?" link in the sidebar/topbar
- [ ] **Quick wins implementation** — pull 3 problems from mastered material in that tool's namespace
- [ ] **Subject-specific second option** — breath box (QR/GC) or hub overview (Bio) or reagent ref (OChem)
- [ ] **Skip/return path** — mark current item and close modal
- [ ] **Confidence rating** on every problem (if not already shipped)
- [ ] **Pacing ladder** with the 80%-or-equivalent floor (if timed practice is part of the loop)
- [ ] **Identity-aware hero** copy on the home page
- [ ] **Coach guide** updates: end-on-a-win ritual reference

QR has all of these. GC needs ~6 of them. Bio and OChem need most of them.

## What NOT to do

- **Don't copy-paste the QR stuck modal into Bio.** The breath option is wrong for Bio. It will be your most-mocked feature if students screenshot it on TikTok.
- **Don't make the stuck button a "wellness" button.** It's a triage menu. Triage is engineering, not therapy. The students respect engineering.
- **Don't show the triage menu unprompted.** Some tools show "looks like you've been on this for a while — need help?" Don't. Pre-meds especially hate being asked if they need help. Let them open it themselves.
- **Don't gate progress on confidence ratings.** Capture them, but never "you can't move on until you click 5 stars." That breaks trust.
- **Don't add the breath modal to OChem.** Reagent reference is the right move. Breath would feel out of place mid-mechanism.

## What this gives the brand

- **Cross-tool consistency.** The student opens any of the four tools and the same kind of help is one click away — but tuned for what they actually need.
- **A defensible moat.** DATBooster and Bootcamp don't have anything like this. Building this architecture across four engines is expensive and patient work; rebuilding it is more so.
- **A pricing story.** "All four tools share the same anxiety-aware design" justifies a multi-tool subscription over standalone products.
- **A marketing line.** "When you freeze, the tool gives you a way back to flow" — a real product claim, not a wellness pitch.

## See also

- [tools/qr/index.html](./tools/qr/index.html) — QR has the full architecture shipped
- [tools/qr/qr-remediation-system-v2.html](./tools/qr/index.html) lines around the `STUCK` object — reference implementation
- [ACELABS_COACH_GUIDE.md](./ACELABS_COACH_GUIDE.md) — cross-subject coaching principles including end-on-a-win
- [SARAH_COACHING_PATTERNS.md](../AceDAT-QR-Remediation/SARAH_COACHING_PATTERNS.md) — Sarah's actual moves that the QR anxiety-aware design encodes
