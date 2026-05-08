# Diagnostic + Skill Tree + Routing Audit

Master file: `/Users/thomascordell/Documents/Codex/2026-05-05/files-mentioned-by-the-user-acedat/AceDAT-AceLabs-codex-work/tools/qr/index.html` (10,427 lines, **read-only audit, no edits made**).

Scope: `<section id="diagnostic">` (line 1730), `<section id="tree">` (line 1808), the 41 module placeholders (lines 1837-1877), the SKILLS array (line 2280), `DIAG_BANK` + `DIAG` controller (lines 8970-9197), `renderTree()` (line 8842), and the mastery store (lines 2139-2345).

---

## 1. Headline numbers (and why they don't match)

The product copy and the code disagree in three places:

| Surface | Claim | Truth |
|---|---|---|
| Hero stats (line 1722) | "**40 Skills**" | SKILLS array has **44 entries** |
| Skill-tree section header (line 1820) | "**40 nodes**" | Tree renders **44 nodes** |
| Diagnostic intro (line 1735) | "**Twenty questions, fifteen minutes**" | DIAG_BANK has **12 questions**, cap is **18**, queue probes **9 skills** |
| Section placeholders (lines 1837-1877) | one per module | **41 placeholders** |
| `MODULES` content map (line 3666) | one entry per module | **41 entries** |

So the codebase actually has **three populations**:

- **44 skills** in the data layer (SKILLS array — drives the tree, the heatmap, locks)
- **41 modules** with content (MODULES) and DOM scroll-targets (data-skill sections)
- **9 skills** the diagnostic ever asks about

Three skills are in the tree but have **no module section and no MODULES entry**:

| Skill ID | Tier | Name | Status |
|---|---|---|---|
| `pat-seq` | 2 | Sequential Percent (pattern) | Orphan — clickable but routes to "coming soon" modal |
| `pace-90` | 3 | 90s/Q Pacing | Orphan |
| `pace-60` | 3 | 60s/Q (DAT pace) | Orphan |

`onNodeClick()` (line 8891) handles this gracefully via `LOCKMOD.openComingSoon()` (line 8923), but the user is shown a node that exists only as a label.

---

## 2. Diagnostic question -> skill mapping table

Source: `DIAG_BANK` constant, lines 8970-8983. Every question carries a single `skill:` string. There is no `data-skill` HTML attribute on the rendered options because the bank is data-only.

| Q ID | Skill ID | Diff | Question stem | Maps to module? | Notes |
|---|---|---|---|---|---|
| d1 | `frac-add` | 1 | 1/4 + 1/2 = ? | Yes (`frac-add`) | Clean |
| d2 | `frac-add` | 2 | 2/3 + 3/4 = ? | Yes (`frac-add`) | Clean |
| d3 | `frac-dec` | 1 | 5/8 = ? | Yes (`frac-dec`) | Clean |
| d4 | `pct-of` | 1 | 15% of 80 = ? | Yes (`pct-of`) | Clean |
| d5 | `pct-chg` | 2 | $50 marked up 20% | Yes (`pct-chg`) | "$" copy violates no-payment-language preference |
| d6 | `pct-chg` | 2 | jar 80 -> 100 % increase | Yes (`pct-chg`) | Clean |
| d7 | `pct-seq` | 3 | $100 → +20% → −20% | Yes (`pct-seq`) | "$" copy violates no-payment-language preference |
| d8 | `lin-eq` | 1 | 3x + 7 = 22 | Yes (`lin-eq`) | Clean |
| d9 | `lin-eq` | 2 | 2(x − 3) = x + 4 | Yes (`lin-eq`) | Could double as `distrib` (distribution shows up first) — single-skill tag hides that |
| d10 | `word-decode` | 2 | "Sam has 3 more apples than twice Mia" | Yes (`word-decode`) | Could also probe `lin-eq` translation |
| d11 | `p-flip` | 3 | P(at least one 6 in 3 rolls) | Yes (`p-flip`) | Clean — sole tier-2 question |
| d12 | `count-pc` | 3 | Committee of 3 from 10 | Yes (`count-pc`) | Clean — sole tier-2 question |

**Coverage gaps (32 of 41 modules never probed):**

`frac-mul`, `dec-arith`, `estim`, `mental`, `distrib`, `pemdas`, `neg-ineq`, `binomials`, `ratios`, `rate-time`, `work-rate`, `mixture`, `interest`, `coord`, `units`, `p-andor`, `p-cond`, `discr`, `harm`, `zscore`, `tri-inv`, `vol-sa`, `ds`, `exps`, `absval`, `geo-2d`, `sets`, `desc-stats`, `untimed`, `skip-ret`, `guess`, `logs`.

The probe queue (line 9000) is hardcoded to 9 skill IDs — there is no path through the code that surfaces a question for any of the other 32.

**Adaptive behavior (lines 9108-9120):**
- Right answer at diff < 3 -> stay on skill, increase diff
- Right answer at diff 3 -> next skill, reset to diff 1
- Wrong answer -> immediately abandon skill, jump to next
- Skill exhausted (no matching question) -> next skill

Practical worst case: 9 skills × 3 difficulties = 27 questions max if student is perfect, but the bank only has 12 questions and the cap is 18, so the diagnostic always **terminates between 9 and 12 questions**. The "20 questions" promise is unreachable.

---

## 3. Tree reachability audit

`renderTree()` (line 8842) iterates `SKILLS` and renders every entry. So:

- **44 / 44 skills are visible in the tree.** No tree-side orphans.
- **3 of those 44 nodes route to nothing real** (`pat-seq`, `pace-90`, `pace-60`). Clicking them triggers `LOCKMOD.openComingSoon()` which shows a "module isn't fully built yet" modal listing other live modules. Functionally these are dead nodes wearing fake names.
- **41 / 44 nodes have a working module** (MODULES entry + section placeholder + lazy renderer at line 5259).
- **0 modules are orphaned** (no module exists without a tree node).

Lock logic (line 2333): `isUnlocked` returns true only when **every** prereq has status `'mastered'`. So tier 3 nodes stay locked until all their tier 2 prereqs are mastered (`untimed` requires `p-flip` AND `p-andor` AND `count-pc` all mastered). That cascade includes the orphan tier-3 nodes — they never become reachable in the data sense even when their prereqs clear, because they have no module body to "open."

---

## 4. Routing logic (diagnostic -> module)

The "routing" today is one line of code (line 9155-9161):

```js
let weakest = null, weakestScore = 1.1;
SKILLS.filter(s => s.tier === 0).forEach(s => {
  const sk = skills[s.id];
  if (sk){ const sc = sk.right / sk.total; if (sc < weakestScore){ weakestScore = sc; weakest = s; } }
});
if (!weakest) weakest = SKILLS.find(s => s.id === 'frac-add');
```

In English: **"Among the tier-0 skills you happened to be asked about, pick the one with the lowest accuracy. If you weren't asked about any tier-0 skill, send everyone to `frac-add`."**

Critical issues with this rule:

1. **Single recommendation only.** The student sees ONE button (the "Recommended start"). Tier 1 and Tier 2 skills are completely ignored even when the student bombed `p-flip` — the tier-2 weakness is invisible to routing.
2. **Volume is ignored.** Adaptive sampling means a student who got `frac-add` wrong once (1/1 = 0%) and got `pct-chg` wrong twice (0/2 = 0%) ranks them tied. The code's `<` comparison breaks ties by source order, not by sample size.
3. **Confidence data is collected but not used in routing.** The `conf` field on each result feeds only the calibration text block. Overconfident-and-wrong is a strong signal of a fragile skill — we throw it away.
4. **Skipped diagnostic falls back to nothing** (`results = []`, fingers crossed for `frac-add`).
5. **Heatmap drops untested skills silently** (line 9173-9175). The student has no idea 32 modules were never sampled.
6. **No persistence beyond the single recommendation.** `ST.set('diagnostic', {results, takenAt})` is written (line 9186) but never re-read by the tree renderer or by the skill modules. The diagnostic informs ONE button click and then evaporates.

**Rating:** the rule does not identify weak skills. It identifies "the easiest tier-0 question you happened to miss." A real diagnostic would (a) probe every prereq cluster, (b) weight by difficulty + confidence + recency, (c) surface a ranked list, and (d) feed mastery-decay into the tree.

---

## 5. Mastery state schema

Storage layer: `ST` (line 2139) wraps `localStorage` under namespace `qr-rem-v2:`.

Keys observed:

| Key | Shape | Set by | Read by |
|---|---|---|---|
| `qr-rem-v2:mastery` | `{ [skillId]: 'partial' \| 'mastered' }` | `markStageDone` (5344), `markMastered` (8579) | `getMastery` (2332), tree, sidebar, locks |
| `qr-rem-v2:stages:<skillId>` | `{cur:int, done:[int]}` | `markStageDone` (5338) | per-module renderer |
| `qr-rem-v2:diagnostic` | `{results:[…], takenAt:ts}` | `DIAG.finish` (9186) | (nothing reads this back) |
| `qr-rem-v2:sr` | `{ [problemId]: {ef, interval, due, reps, lastQ} }` | `SR.schedule` (2213) | `SR.due` / `SR.getDuePool` (2236) |
| `qr-rem-v2:lastSession` | epoch ms | line 2157 | sidebar timestamp |
| `qr-rem-v2:stuck-events` | `[{t}]` | STUCK.open | (telemetry only) |
| `qr-rem-v2:theme`, `qr-rem-v2:soundOn` | scalar | UI toggles | UI |

Threshold rules:

- **Partial:** any one stage of a 6-stage flow completed (`state.done.length >= 1` in practice).
- **Mastered:** 5 stages completed (`state.done.length >= 5`, line 5344) OR an explicit `markMastered()` call from the mastery checkpoint (line 8575: needs `n >= 3` correct on the mastery problem track).
- **Decay:** none. Once mastered, always mastered. There is no re-test, no half-life, no "due for review" for the skill itself.

The `SR` (SM-2-lite spaced repetition) layer at line 2209 schedules **individual problems**, not skills. Its due-pool feeds nothing in the current UI loop — a search for `getDuePool` shows it's defined but never called by a render path.

---

## 6. Top-level severity verdict

- The diagnostic's promise ("identify your weak skills, route you to the right module") is **substantially false**. It samples 22% of the skill tree (9 of 41 modules), never returns a ranked weakness list, and ignores 100% of the tier-1 and tier-2 surface area when picking a recommendation.
- The tree is **structurally sound** but has **3 phantom nodes** (`pat-seq`, `pace-90`, `pace-60`) that show up as labels and route to a "coming soon" modal.
- The mastery system is **append-only**. Nothing decays, nothing reappears. A skill mastered in week 1 is still "mastered" on test day three months later, regardless of practice gaps.
- The spaced-repetition engine **exists but is disconnected** from any visible UI. Free win once it's surfaced.

See `WEAK_3_SPEC.md` and `ROUTING_PROPOSAL.md` for the proposed fixes.
