# "Your Weak 3" — Output Spec

After the diagnostic finishes, the student sees a single, decisive panel: the three skills they should attack first, ranked, with one click to open each module. This replaces the current single-button "Recommended start" tile.

---

## 1. Where it lives

Inside the existing `<div class="diag-results" id="diagResults">` (line 1784), above the heatmap, replacing the current "Recommended start" subcard at line 1795 (`<div id="diagRec">`).

```
[ confidence check tile ]  [ time-pressure tile ]   <-- existing two tiles, unchanged

== "Here's where to start" header ==

[ Weak #1 card  ]  [ Weak #2 card  ]  [ Weak #3 card  ]    <-- new
   skill name        skill name         skill name
   "you missed 2/2"  "shaky 1/2"        "shaky · low conf"
   [ Open module → ] [ Open module → ]  [ Open module → ]

== existing heatmap (full 41 nodes, untested rendered as "not yet probed") ==
```

## 2. Selection algorithm

```
function selectWeak3(results, SKILLS):
    # results: array of {skill, diff, correct, conf, t}
    skillScores = {}

    for r in results:
        s = skillScores.setdefault(r.skill, {right:0, total:0, conf:[], maxDiff:0, lastT:0})
        s.total++
        if r.correct: s.right++
        if r.conf is not None: s.conf.append(r.conf)
        s.maxDiff = max(s.maxDiff, r.diff)
        s.lastT = max(s.lastT, r.t)

    candidates = []
    for skillId, s in skillScores:
        if s.total == 0: continue

        accuracy = s.right / s.total
        avgConf = mean(s.conf) if s.conf else 3
        confPenalty = 0
        for r in results where r.skill == skillId:
            if r.conf >= 4 and not r.correct: confPenalty += 0.15  # overconfident-wrong is loud
        difficultyBoost = 1.0 if s.maxDiff == 1 else 0.85 if s.maxDiff == 2 else 0.70
        # missing easy -> very weak; missing hard -> still weak but expected

        weakness = (1 - accuracy) + confPenalty
        weakness *= (2 - difficultyBoost)   # easy fails weighted higher

        candidates.append({
            skill: SKILL_BY_ID[skillId],
            weakness,
            accuracy,
            avgConf,
            sample: s.total,
            evidence: humanReason(accuracy, avgConf, s.right, s.total)
        })

    # Tier-spread rule: prefer 1 weak from each tier when possible,
    # but never push a skill above a more-broken one for cosmetic spread.
    candidates.sort(key = -weakness, secondary = -sample, tertiary = tierOrder)

    # Dedupe: if two weakest share a prereq chain, drop the descendant
    # (master the floor first; the descendant follows).
    pruned = pruneDescendants(candidates, SKILLS.prereqMap)

    return pruned[:3]
```

Helpers:

```
humanReason(acc, conf, right, total):
    if total == 1 and not right and conf >= 4:
        return "you were sure and missed it"
    if total == 1 and not right:
        return "missed it cold"
    if acc <= 0.3:
        return f"missed {total - right} of {total}"
    if conf <= 2 and acc >= 0.5:
        return "got it but felt shaky"
    return f"{right}/{total} · floor still soft"

pruneDescendants(candidates, prereqMap):
    # If candidate B's prereq chain transitively includes candidate A's skill,
    # B inherits A's weakness — drop B in favor of unique skills.
    keep = []
    seenIds = set()
    for c in candidates:
        ancestry = transitivePrereqs(c.skill.id, prereqMap)
        if any(a in seenIds for a in ancestry): continue
        keep.append(c); seenIds.add(c.skill.id)
    return keep
```

## 3. Empty / sparse cases

- **Diagnostic skipped.** `results = []`. Show three default starter modules: `frac-add`, `pct-of`, `lin-eq`. Label the panel "Three honest places to start" instead of "Your weak 3."
- **Fewer than 3 weak skills surfaced** (e.g. student got everything right). Show "Floor's solid — here are 3 patterns to start sharpening" and pick the three earliest tier-2 modules whose prereqs are all green: ranked by tier, then by `x,y` position in SKILLS.
- **Only 1 or 2 questions answered before bailout.** Same as skipped — the sample is too small.

## 4. Card markup (drop-in HTML)

```html
<div class="weak3-grid">
  <a class="weak3 rank-1" href="#frac-add" data-skill="frac-add" onclick="WEAK3.open(event,'frac-add')">
    <div class="rank-badge">01</div>
    <div class="nm">Fractions: Add/Subtract</div>
    <div class="evidence">missed 2 of 2 · felt sure</div>
    <div class="cta">Open module</div>
  </a>
  <a class="weak3 rank-2" href="#pct-chg" data-skill="pct-chg" onclick="WEAK3.open(event,'pct-chg')">
    <div class="rank-badge">02</div>
    <div class="nm">Percent Increase/Decrease</div>
    <div class="evidence">1/2 · floor still soft</div>
    <div class="cta">Open module</div>
  </a>
  <a class="weak3 rank-3" href="#p-flip" data-skill="p-flip" onclick="WEAK3.open(event,'p-flip')">
    <div class="rank-badge">03</div>
    <div class="nm">Probability — At Least (Flip)</div>
    <div class="evidence">missed it cold</div>
    <div class="cta">Open module</div>
  </a>
</div>
```

`WEAK3.open(event, skillId)` should:
1. Persist the click as a "router decision" (`ST.push('weak3-clicks', {skill, t})`) so we can audit whether the routing actually drives traffic.
2. Call `goSec(skillId)` to scroll to the module.
3. Record an entry in `ST.get('mastery')` as `'partial'` if the skill has no mastery state yet, so the tree starts coloring as "in flight" the moment they engage.

## 5. Persistence shape

Extend the existing `qr-rem-v2:diagnostic` blob:

```json
{
  "takenAt": 1715000000000,
  "results": [ ... per-question rows, unchanged ... ],
  "weak3": [
    {"skill": "frac-add",  "weakness": 1.40, "accuracy": 0.0, "evidence": "missed 2 of 2 · felt sure"},
    {"skill": "pct-chg",   "weakness": 0.85, "accuracy": 0.5, "evidence": "1/2 · floor still soft"},
    {"skill": "p-flip",    "weakness": 1.20, "accuracy": 0.0, "evidence": "missed it cold"}
  ],
  "version": 2
}
```

## 6. Tree integration

When weak3 is set, the tree renderer adds a 4th node state — `'flagged'` — drawn with a soft red ring. Three nodes glow gently after the diagnostic, so the student sees the same recommendation in two places.

```js
function getStatus(skill){
    const m = getMastery();
    const diag = ST.get('diagnostic', {});
    const flagged = (diag.weak3 || []).some(w => w.skill === skill.id);
    if (m[skill.id] === 'mastered') return 'mastered';
    if (m[skill.id] === 'partial')  return 'partial';
    if (flagged && isUnlocked(skill)) return 'flagged';
    if (isUnlocked(skill)) return 'unlocked';
    return 'locked';
}
```

The flagged ring fades the moment the student reaches `'partial'` on that skill (i.e., they engaged with at least one stage). It does not return automatically — it's a one-time "go here first" signal, not a permanent label.

## 7. Acceptance criteria

- After a 9-question diagnostic with mixed results, the panel shows exactly 3 cards.
- Each card has a clickable surface that scrolls to the matching module section.
- A student who skipped the diagnostic still sees three cards (the safe-default trio).
- A student who aced everything sees three "next-up" pattern cards instead of weak ones.
- Two of the three cards never share a prereq chain (no parent-child pairs).
- The selection includes at least one tier > 0 skill if the student answered any tier > 0 question — the current code can never recommend a tier 1 or 2 skill.
- `ST.get('diagnostic').weak3` is populated and the tree renders the three flagged rings.
- No copy in any visible card mentions money, packages, or payment language. The current `pct-chg` and `pct-seq` diagnostic items use `$` framing — when they surface as the evidence line, rewrite to "marked up 20%" without the dollar sign.
