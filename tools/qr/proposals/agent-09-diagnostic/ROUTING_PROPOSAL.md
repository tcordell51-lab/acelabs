# Routing Proposal — diagnostic -> module + spaced review

This document supersedes the routing rule at `index.html` line 9155 ("pick the lowest-accuracy tier-0 skill that happened to be tested"). It also adds a spaced-review queue so that mastered skills don't sit in green forever.

The proposal has three parts:
- **A.** A revised diagnostic-to-skill mapping where every question carries an explicit `data-skill` reference.
- **B.** A weakness-ranking + routing rule that surfaces three skills, not one.
- **C.** A spaced-review queue with mastery decay.

---

## A. Explicit data-skill on every question

### A.1 Why the current model is brittle

Today the mapping lives only in JS data (`{id:'d1', skill:'frac-add', ...}`). The DOM that the student interacts with has no idea which skill it belongs to, so:

- We can't write a CSS hook for "color this question by skill cluster."
- Analytics scripts can't read the skill from the rendered DOM.
- Adding multi-skill questions (the natural shape of a real diagnostic — `d9` is `lin-eq` AND `distrib`) requires schema changes.

### A.2 Proposed schema (expand DIAG_BANK)

```js
const DIAG_BANK = [
  {
    id: 'd1',
    skills: ['frac-add'],            // primary (was: skill:)
    secondarySkills: [],              // optional cluster — partial credit on miss
    diff: 1,
    cluster: 'fractions-floor',       // for grouping in heatmap
    q: '1/4 + 1/2 = ?',
    opts: ['2/6','3/4','1/8','5/4'], correct: 1,
    why: 'Common denominator 4. 1/4 + 2/4 = 3/4.',
    diag: { 0:'Added denominators directly...', /* ... */ }
  },
  {
    id: 'd9',
    skills: ['lin-eq'],
    secondarySkills: ['distrib'],     // distribution error -> we now log a partial weak signal on distrib
    diff: 2,
    cluster: 'algebra-floor',
    q: 'Solve: 2(x − 3) = x + 4.',
    /* ... */
    secondaryAttribution: { 1:'distrib' }  // wrong-answer index 1 means distribution slipped
  },
  // ...
];
```

### A.3 Render with data-skill

In `DIAG.render` (line 9044), add `data-skill` to the question container:

```js
document.getElementById('diagQ').dataset.skill = (Q.skills || [Q.skill]).join(' ');
document.getElementById('diagQ').dataset.cluster = Q.cluster || '';
```

This is purely additive — no existing behavior changes — but downstream features (heatmap by cluster, "show me other fractions questions", DOM-driven analytics) become possible.

### A.4 Bank expansion targets

To honor the "twenty questions" promise, the bank needs to grow from 12 to **22 questions covering 18+ skills**, distributed:

| Tier | Skills probed | Questions |
|---|---|---|
| 0 | frac-add, frac-mul, frac-dec, pct-of, pct-chg, pct-seq, dec-arith, lin-eq, distrib, neg-ineq, pemdas | 12 |
| 1 | word-decode, ratios, rate-time, coord, units | 5 |
| 2 | p-flip, p-andor, count-pc, zscore | 4 |
| (mid-tier ratchet) | one cross-cutting question | 1 |

Difficulty distribution: 8 easy (diff 1), 10 medium (diff 2), 4 hard (diff 3). Easy questions are the **floor probe** — missing them is the loudest weakness signal.

The probe queue (line 9000) becomes data-driven:

```js
this.skillsToProbe = SKILLS
  .filter(s => DIAG_BANK.some(q => q.skills.includes(s.id)))
  .map(s => s.id);
```

---

## B. Routing rule — weakness ranking with three winners

### B.1 Pseudocode

```
function routeFromDiagnostic(results, SKILLS):

    # 1. Aggregate per-skill (primary + secondary attribution)
    perSkill = {}
    for r in results:
        primarySkills = r.skills if 'skills' in r else [r.skill]
        for sid in primarySkills:
            bucket = perSkill.setdefault(sid, blankBucket())
            bucket.total++
            if r.correct: bucket.right++
            bucket.confSamples.append(r.conf)
            bucket.maxDiff = max(bucket.maxDiff, r.diff)
            bucket.lastSeen = max(bucket.lastSeen, r.t)

        # secondary attribution: e.g. d9 wrong-index-1 -> 'distrib' weakness signal
        if not r.correct and 'secondaryAttribution' in r.question:
            sid2 = r.question.secondaryAttribution.get(r.j)
            if sid2:
                b2 = perSkill.setdefault(sid2, blankBucket())
                b2.partialMisses++   # weighted lower than full miss

    # 2. Score weakness for each skill
    ranked = []
    for sid, b in perSkill:
        if b.total == 0 and b.partialMisses == 0: continue

        accuracy   = b.right / b.total if b.total else 1.0
        confSignal = sum(0.15 for c in b.confSamples_with_correctness if c.conf >= 4 and not c.correct)
        diffWeight = {1: 1.30, 2: 1.00, 3: 0.75}[b.maxDiff]
        # missing easy weighs more, missing hard is partial credit

        weakness = (1 - accuracy) * diffWeight + confSignal + 0.4 * b.partialMisses

        ranked.append({
            skill: SKILL_BY_ID[sid],
            weakness, accuracy,
            avgConf: mean(b.confSamples) if b.confSamples else 3,
            sample: b.total,
        })

    ranked.sort(by = -weakness, then -sample)

    # 3. Prereq-prune: master the floor before the descendant
    ranked = pruneDescendants(ranked)

    # 4. Take 3, persist, return
    weak3 = ranked[:3]
    ST.patch('diagnostic', d => ({ ...d, weak3, version: 2 }))
    return weak3


function pruneDescendants(ranked):
    keep = []
    for c in ranked:
        ancestry = transitivePrereqs(c.skill.id)  # walk SKILLS.prereqs recursively
        if any(k.skill.id in ancestry for k in keep): continue
        keep.append(c)
    return keep
```

### B.2 Why this beats the current rule

| Failure of current rule | How the new rule handles it |
|---|---|
| Only tier-0 considered | All tiers eligible; `ranked` includes every skill the student touched |
| Single recommendation | Returns top 3, prereq-pruned |
| Confidence ignored | `confSignal` adds 0.15 weight per overconfident-wrong |
| Sample size ignored | Tie-break is `-sample` (more evidence wins ties) |
| Ignores difficulty | `diffWeight` makes missing easy questions count more |
| No secondary signals | `secondaryAttribution` lets one question signal two skills |
| Recommends prereq + descendant together | `pruneDescendants` collapses the chain |
| Skipped diagnostic = `frac-add` everyone | Caller falls back to `weak3 = [frac-add, pct-of, lin-eq]` default trio |

### B.3 Where to wire it in

Replace lines 9155-9161 with a call to `routeFromDiagnostic(this.results, SKILLS)`, then render the result through the `WEAK_3_SPEC.md` panel. Keep the heatmap below it; replace its silent-skip behavior (line 9173-9175) with an explicit "not yet probed" tile so all 41 modules show.

### B.4 Auditability

Every routing decision should write a row to a new `qr-rem-v2:routes` log:

```json
[
  {"t": 1715000000000, "kind": "diag-weak3", "weak3":["frac-add","pct-chg","p-flip"], "fallback": false},
  {"t": 1715000200000, "kind": "weak3-click", "skill": "frac-add"},
  {"t": 1715600000000, "kind": "review-due", "skills":["frac-add","pct-of"]}
]
```

This gives us a transcript of "what did we recommend, what did the student click" — which the current build silently lacks.

---

## C. Spaced review queue + mastery decay

### C.1 The gap

`SR` (line 2209) implements SM-2-lite **at the problem level**. It has no UI surface today. The skill mastery state has no decay at all.

### C.2 New schema: per-skill mastery with decay

Replace the value-string at `qr-rem-v2:mastery` with a richer shape (migrate-on-read):

```js
// before:  { 'frac-add': 'mastered' }
// after:
{
  'frac-add': {
    state: 'mastered',          // 'partial' | 'mastered' | 'flagged'
    masteredAt: 1714900000000,
    lastTouched: 1714960000000, // any practice / mastery-check counts as touch
    interval: 7,                // days until next review
    ef: 2.5,                    // ease factor (SM-2)
    reviewsCompleted: 0,
    dueAt: 1715564800000        // masteredAt + interval days
  }
}
```

Migration helper:

```js
function readMastery() {
  const raw = ST.get('mastery', {});
  const out = {};
  for (const [k, v] of Object.entries(raw)) {
    if (typeof v === 'string') {
      out[k] = { state: v, masteredAt: Date.now(), lastTouched: Date.now(),
                 interval: 3, ef: 2.5, reviewsCompleted: 0,
                 dueAt: Date.now() + 3 * 86400000 };
    } else { out[k] = v; }
  }
  return out;
}
```

### C.3 Decay rule (Thomas Method spirit, not punishing)

Mastered skills do not regress in tier (the lock graph still treats them as `'mastered'`), but they enter a **review bucket** when `dueAt < now`. The first review is at +3 days, then +7, then +14, then +30, then quarterly.

```
function reviewIntervalDays(reviewsCompleted, ef):
    base = [3, 7, 14, 30, 90, 90][min(reviewsCompleted, 5)]
    return round(base * (ef / 2.5))   # ef adjusts for student's track record

function onReviewCompleted(skillId, performance /* 'crisp' | 'shaky' | 'broken' */):
    m = readMastery()[skillId]
    if performance == 'crisp':
        m.ef = min(2.8, m.ef + 0.05)
        m.reviewsCompleted++
    elif performance == 'shaky':
        m.ef = max(1.6, m.ef - 0.10)
        # don't advance reviewsCompleted -- next interval same as last
    elif performance == 'broken':
        m.state = 'partial'              # lose the gold ring
        m.reviewsCompleted = 0
        m.ef = max(1.6, m.ef - 0.20)

    m.lastTouched = Date.now()
    m.interval = reviewIntervalDays(m.reviewsCompleted, m.ef)
    m.dueAt = Date.now() + m.interval * 86400000
    writeMastery(m)
```

### C.4 The "Due review" surface

A new tile on the dashboard (and a sidebar group above the tree) lists skills whose `dueAt < now`:

```
DUE FOR REVIEW · 3
[ Fractions: Add/Subtract  · last seen 8d ago     · Review now → ]
[ Percent of a Number      · last seen 11d ago    · Review now → ]
[ At Least (Flip)          · last seen 4d ago     · Review now → ]
```

Click -> opens a 3-question rapid-fire pulled from that skill's `masteryProblems` array (already exists in MODULES). After the 3, the student rates the experience as crisp / shaky / broken, which feeds `onReviewCompleted`.

The tree renders due-skills with a subtle pulse — gold dot at top-right (status `'partial'`) replaced by a clock dot when state is mastered AND `dueAt < now`. No tier downgrade happens unless the review fails as `'broken'`.

### C.5 Hooking review into the diagnostic flow

When the diagnostic finishes, also surface "X mastered skills are due for review" as a 4th card next to the Weak 3 (only when X > 0). This stitches diagnostic + review into a single "what to do next" panel.

### C.6 Interaction with existing SR layer

`SR` (line 2209) already runs at the problem level for individual practice attempts. The new skill-level decay sits on top — a skill is "due" when its `dueAt < now`, independent of which problems are due. When the student opens a review session, we union:

1. The 3 fresh `masteryProblems` for the skill
2. Any `BANK[…]` problems for that skill currently in `SR.due()` (the spaced-rep layer's own due pool)

so the review uses both fresh-eyes problems and revisits of items they specifically struggled with.

### C.7 Acceptance criteria

- Reading old (string-shaped) mastery values does not crash; they migrate on first read.
- A skill mastered today is flagged due 3 days from now.
- Failing a review (broken) downgrades to `'partial'` and unschedules dependents (they need to be re-mastered too — deliberate friction).
- A "Due review" group renders on the dashboard with one entry per due skill, ordered by `dueAt` ascending.
- The tree shows a clock dot (not a gold partial dot) on due-but-still-mastered skills.
- No review can be scheduled on an orphan skill (`pat-seq`, `pace-90`, `pace-60`) — until those have modules, they're invisible to the queue.
