# Ace Labs · Coach Guide

This is the master coach guide for the Ace Labs DAT prep system. Use it as the entry point for any coach in any subject.

## What Ace Labs is

Ace Labs is the unified DAT prep system from AceTheDAT. Four standalone tools (Quantitative Reasoning, Biology, Gen Chem, Organic Chem) under one shell, with a cross-tool dashboard, a unified Survey-of-Natural-Sciences mock (Phase 2), and (eventually) integration with the AceTheDAT student portal for weekly-plan delivery.

Each tool has its own coach (Sarah for QR, Riya for Bio, Tommy for GC and OChem), its own pedagogy, and its own student-facing engine. Ace Labs is the meta-shell that ties them together.

## The four subject engines

| Subject | Coach | Tool location | Modules | Status |
|---|---|---|---|---|
| **Quantitative Reasoning** | Sarah | `tools/qr/index.html` | 41 | Coach guides ✅ |
| **Biology** | Riya | `tools/bio/index.html` | 6 hubs | Coach guides ⏳ |
| **Gen Chem** | Tommy | `tools/gc/index.html` | 37 | Coach guides ⏳ |
| **Organic Chem** | Tommy | `tools/ochem/index.html` | 10 reaction maps | Coach guides ⏳ |

**Coach guides for QR are complete and live in `~/Documents/Claude/Projects/AceDAT-QR-Remediation/`:**
- [COACH_GUIDE_README.md](../AceDAT-QR-Remediation/COACH_GUIDE_README.md) — plan picker
- [COACH_GUIDE_1MO.md](../AceDAT-QR-Remediation/COACH_GUIDE_1MO.md) — 4 sessions / 5 hours
- [COACH_GUIDE_2MO.md](../AceDAT-QR-Remediation/COACH_GUIDE_2MO.md) — 8 sessions / 10 hours
- [COACH_GUIDE_3MO.md](../AceDAT-QR-Remediation/COACH_GUIDE_3MO.md) — 12 sessions / 15 hours
- [COACH_PREP_CHECKLISTS.md](../AceDAT-QR-Remediation/COACH_PREP_CHECKLISTS.md) — 24 pre-session checklists
- [RECOMMENDED_STACK.md](../AceDAT-QR-Remediation/RECOMMENDED_STACK.md) — QR-specific stacking guidance

**Coach guides for Bio, GC, OChem are not yet written.** When a coach takes on a non-QR student, they should:
1. Use the QR coach guides as the structural template (they encode the broader pedagogy)
2. Substitute their subject's modules and traps for QR's
3. Adapt the 4/8/12-session plans to their subject's content density
4. Document their per-subject decisions back into a `COACH_GUIDE_README.md` in their respective source project so the next coach inherits them

## Cross-subject coaching principles

These apply regardless of subject:

### 1. Anxiety scaffolding before content

The Ace Labs design assumes test anxiety is the actual ceiling for many students — the content is solvable, the panic is what burns the score. Every tool has a "stuck" button that gives students a triage choice (quick wins from mastered skills, 60-second breath, or skip-and-return). Use it. Reference it explicitly when students freeze in session.

### 2. Pattern + trap framing

DAT questions across all four sciences are mostly pattern recognition with named traps. The coach's job is to teach students to *recognize the trap on the first read*, not to derive the answer from first principles. Every module in every Ace Labs tool has a `lock` (the rule) and a `trap` (the wrong answer the DAT will offer). Lead with these.

### 3. The 6-stage scaffold

Every module in every tool follows the same structure:

```
pattern → worked example(s) → faded scaffold → independent practice → mastery check → reflect
```

A 75-minute session typically covers 1 full mastery loop (40 minutes) + 1 compressed exposure (15 minutes) + opening/closing (20 minutes total). For dense subjects (Bio, OChem) you may compress further; for foundation rebuilding (QR Tier 0) you may expand.

### 4. No timer until 80% accuracy untimed

Across all subjects: students should not encounter timed practice until they're scoring 80% accuracy in untimed mode. Time pressure on unmastered material builds bad habits and amplifies anxiety. Each tool has an `untimed` mastery checkpoint module — use it as the gate.

### 5. Confidence rating > accuracy rating

A student with 80% accuracy and 5/5 confidence is more ready than a student with 90% accuracy and 2/5 confidence. The tool tracks both. When the two diverge, trust the confidence rating — the student knows which knowledge is fragile.

### 6. End on a win, never on a freeze

If a session is going sideways, bail to a green-skill problem for the last 5 minutes. The student leaves remembering the win, not the freeze. This shapes their willingness to come back and do homework — which is the actual lever in any plan.

### 7. The tool does the homework loop. The coach does the live modeling and the diagnosis.

Don't try to be the tool. The daily drill, the bank, and the Sarah-mode TikToks (or their equivalents in other subjects) are designed to carry between-session weight. The coach's job in a 75-minute session is to model the pattern live, catch frozen moments, and choose what comes next — not to drill problems silently.

## Multi-subject coaching: how to sequence

A student preparing for the full DAT typically engages 2–3 of the four subjects with a coach. Recommended sequencing:

| Student profile | First subject | Second subject | Third subject |
|---|---|---|---|
| Math floor (QR < 18) | **QR** (rebuild) | Bio (volume sport) | OChem or GC |
| Strong math, weak science | Bio | GC | OChem |
| Weak verbal/reading | QR + Bio in parallel | GC | OChem |
| All-around floor | QR (priority) | Bio (parallel start month 2) | GC + OChem in final month |

**Why QR usually goes first:** the foundation rebuild has to happen before timed practice can build speed. Math gaps don't close passively. Bio, by contrast, is largely a memorization-volume sport that students can self-drive on while QR coaching is in progress.

**Why OChem usually goes last:** the reaction maps are recognition-heavy and don't decay as fast as fact-heavy subjects. Cramming OChem in the final month tends to work; cramming QR doesn't.

## Cross-subject load management

A student doing all four subjects should not be in coach sessions for all four simultaneously. Realistic weekly load:

- 1 coaching session per active subject (75 min)
- 30–45 min/day self-study per active subject
- Rotate "active" subjects so 2–3 are in coach mode at any given week, with 1–2 in self-study-only mode
- Mock weekend per month minimum (full-section timed mocks)

If a student tries to keep all four in coach mode every week, they'll burn out by week 6. Sequence them.

## When to recommend NO coaching for a subject

If a student is:
- Already at the 90th percentile in a subject on practice scores
- Self-driving consistently (homework + drills happen without prompts)
- Inside their target range and stable across mocks

…they don't need a coach for that subject. Recommend self-study + mocks. Save the coach budget for the subjects that actually need it.

## See also

- [ACELABS_RECOMMENDED_STACK.md](./ACELABS_RECOMMENDED_STACK.md) — full DAT prep stack guidance
- [ACELABS_STUDENT_FAQ.md](./ACELABS_STUDENT_FAQ.md) — student-facing FAQ
- [README.md](./README.md) — engineering / project layout
