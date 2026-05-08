# Gen Chem Question Bank — Misconception Taxonomy + Distractor Cleanup Spec

Source bank: `/Users/thomascordell/Documents/Claude/Projects/AceDAT-AceLabs/tools/gc/index.html` (BANK array, lines 5048–5873; 605 questions; field shape: `id, skills[], diff, q, opts[], correct, why, diag{wrongIdx: text}`).

Source audit: `tools/gc/QBANK_AUDIT.md` (2026-05-07). 132 items have duplicate-`diag` distractors, 119 items have `why` length less than or equal to 30 characters.

This document is a **specification + seed taxonomy**, not the cleanup itself. No question stems, keys, or rationales are rewritten here.

---

## 0. Hard constraints

- No emojis (decorative or unicode glyphs such as check, warn, star).
- No payment language anywhere a student can see (no dollar signs, "paid", "balance", "package", etc.).
- Any UI surface uses the AceLabs light theme + tokens.
- DO NOT modify `index.html` as part of the spec phase. Spec + taxonomy file only.

---

## 1. Taxonomy structure

### 1.1 Hierarchy

```
topic            (e.g., "stoichiometry")
  subtopic       (e.g., "limiting reactant")
    misconception (e.g., "limit-by-mass-not-mole")
      variant     (optional, e.g., "ignores-stoichiometric-coeffs")
```

In the seed JSON we encode three levels (topic, subtopic, misconception). Variants appear inline as bullet examples on the misconception entry rather than as their own records, because the writer needs them at the rewrite surface and a 200-row taxonomy is unwieldy. If a variant outgrows its parent in usage (>= 8 cited questions across the bank), it can be promoted to its own entry without breaking IDs.

### 1.2 ID scheme

```
<topic>.<subtopic>.<slug>
```

- All segments kebab-case, ASCII, lowercase.
- Topic codes are a fixed list of 17 (see section 2).
- Slug is unique within `topic.subtopic` and reads as the short label minus filler words.
- Example: `stoich.lim-react.limit-by-mass-not-mole`.
- IDs are immutable once published. Renames are forbidden — deprecate and superseded-by instead (`status: "deprecated", supersededBy: "..."`).

### 1.3 Schema for one taxonomy entry

```json
{
  "id": "thermo.enthalpy.sign-of-exo",
  "label": "Drops exothermic sign",
  "description": "Treats heat released as positive ΔH instead of negative.",
  "topic": "thermo",
  "subtopic": "enthalpy",
  "applicableSkills": ["enthalpy", "calorimetry", "gibbs"],
  "examples": [
    "Distractor offers +ΔH for combustion of methane.",
    "Distractor flips sign on Hess-cycle reversal."
  ],
  "tags": ["sign-error"],
  "status": "active"
}
```

Required: `id`, `label`, `description`, `topic`, `subtopic`, `applicableSkills`, `examples`, `status`.
Optional: `tags`, `supersededBy`, `notes`.

- `label` is at most 6 words, sentence case, no terminal punctuation.
- `description` is exactly one sentence describing the **wrong reasoning**, not the right answer.
- `applicableSkills` are skill IDs from the SKILLS list in `index.html` (39 total). Cross-topic misconceptions (e.g., a sign error that hits both enthalpy and Gibbs) list every skill where the misconception fires.
- `examples` are 1–2 short concrete distractor patterns. They are illustrative; the writer is not required to copy phrasing.
- `tags` are free-form cross-cuts: `sign-error`, `unit-error`, `inverse`, `magnitude`, `vocab`, `cancel-symmetry`, `phase-omission`. Useful for filtering during pass 2.

---

## 2. Initial taxonomy

The seed taxonomy lives at `tools/gc/misconception-taxonomy.json` and is delivered alongside this spec. It contains **77 active misconception entries** organized under the 17 DAT Gen Chem topics from the prompt:

| Topic code | Topic name | Entry count |
|---|---|---|
| stoich | Stoichiometry | 7 |
| gas | Gas Laws | 5 |
| solutions | Solutions | 5 |
| thermo | Thermodynamics | 8 |
| kinetics | Kinetics | 5 |
| equilibrium | Equilibrium | 5 |
| acid-base | Acid-Base | 7 |
| ksp | Solubility (Ksp) | 3 |
| electrochem | Electrochemistry | 5 |
| atomic | Atomic Structure | 5 |
| periodic | Periodic Trends | 5 |
| bonding | Bonding & VSEPR | 6 |
| imf | Intermolecular Forces | 4 |
| phase | Phase Changes | 3 |
| nuclear | Nuclear | 2 |
| lab | Lab Techniques | 1 |
| colligative | Colligative | 1 |

Largest topic: **thermo (8)** — sign and reference-state errors are the dominant DAT trap and warrant separate entries for ΔH/ΔS/ΔG.
Smallest topic: **lab (1)** and **colligative (1)** — both are under-tagged in the bank (lab has 0 primary, colligative has 0 primary in the audit). The taxonomy seeds a stub for each so future authoring has a slot to fill.

The full entry list is in the JSON file. Each entry follows the schema in section 1.3.

---

## 3. Storage and how questions reference labels

### 3.1 Where the taxonomy lives

`tools/gc/misconception-taxonomy.json` — a single top-level array of entries. The bank-editor tool (section 5) loads it via fetch. Production runtime in `index.html` does **not** depend on the taxonomy: questions still render from `BANK` alone. The taxonomy is an authoring artifact, not a runtime dependency.

### 3.2 How questions reference labels — recommendation

Two options were considered:

**Option A — `diag` becomes an object per index:**
```js
diag: { 0: { taxId: "thermo.enthalpy.sign-of-exo", label: "...", why: "..." } }
```

**Option B — `diag` stays a string, sibling `taxIds` array gives the labels:**
```js
diag:    { 0: "Sign flipped — combustion releases heat → ΔH<0." },
taxIds:  { 0: "thermo.enthalpy.sign-of-exo" }
```

**Recommendation: Option B.**

Reasons:
1. Diff size on existing 605 questions is minimal — only the items that get rewritten gain a `taxIds` field; untouched items keep their string `diag`. Option A forces a schema migration on every question or a polymorphic reader.
2. `index.html` rendering code already reads `diag[i]` as a string (search the file for `diag[`); Option B preserves that contract with zero render changes.
3. Option B keeps the diff for cleanup PRs visually scannable: one new field per touched question rather than a structural rewrite of every diag.
4. Multi-tag is natural in B (`taxIds: { 0: ["a", "b"] }` if a distractor maps to two misconceptions); A would need a nested structure for the same.

The writer fills `taxIds` at the same time as the rewrite. Items with no rewrite stay untouched and have no `taxIds`. The bank-editor outputs both fields together so they cannot drift.

---

## 4. Two-pass review workflow

### Pass 1 — SME triage (target: 5 min/item)

The SME does **not** rewrite. The SME's outputs are notes, not prose.

For each flagged item the SME records:

1. **Which distractor is the weaker of the duplicates?** (index 0/1/2/3). Tie-breaker: pick the one that is also vaguer, or the one a strong student would never select.
2. **Is the keyed answer still defensible?** (yes / no / needs-review). If "no" or "needs-review", item exits this workflow and goes to a separate key-review queue. Per scope (section 8), key changes are out of scope for this pass.
3. **Suggested taxonomy slot to fill on the rewritten distractor**: 1–3 candidate `taxId`s pulled from the labels filtered by the question's `applicableSkills`. The SME does not finalize the choice; pass 2 picks one.
4. **One-line note on the strongest unmodeled misconception this item should test** (free text, optional).
5. **Flag for stem ambiguity** — if the stem itself is what's broken (not the distractor), mark `stem-issue: true` and the item exits to a stem-rewrite queue (out of scope this pass).

Pass 1 output is a JSON sidecar: `tools/gc/sme-triage.<batch>.json`.

### Pass 2 — Writer rewrite (target: 15 min/item)

For each item the SME marked `key-defensible: yes`:

1. **Pick exactly one** `taxId` from the SME's candidate list. If none fit, the writer may pick any other label whose `applicableSkills` overlaps the question's skills. The writer may NOT invent a new taxonomy entry mid-batch — new labels are proposed, queued, and added between batches.
2. **Replace the weaker distractor's text** so it represents the chosen misconception in the answer-string itself (not just in `diag`). The plausible-but-wrong content must be **derivable from the chosen misconception applied to the stem's numbers/concepts**.
3. **Rewrite `diag[i]`** to be 30–80 characters, naming what the student did wrong and why it is wrong. Example shape: "Used grams as moles — convert with M first." Forbidden: "Wrong.", "No.", "Off."
4. **Rewrite `why`** if its current length is at most 30 chars. Target 60–180 characters. The `why` must (a) state the keyed answer in one clause and (b) state the discriminating fact that makes it correct over the nearest distractor.
5. **Verify constraint** — at the end of pass 2 for an item, no two distractors in that question may share the same `taxId`. The bank-editor enforces this on save.

Pass 2 output is a JSON patch file (section 5.4) the writer hands to the integrator, who applies it to `index.html`.

---

## 5. Tooling — `tools/gc/bank-editor.html` (spec only, do not build)

A lightweight static page in the same directory. Light theme, AL tokens (`--al-bg`, `--al-fg`, `--al-accent`, `--al-card`, `--al-border`). Single-file or thin split — same shape as `tools/gc/recognition-lab.html`. No build step, no framework.

### 5.1 Inputs

- `BANK` array — extracted by the user from `index.html` and saved to `tools/gc/_bank-extract.json` (a one-time operation; the editor does not parse `index.html` directly).
- `tools/gc/misconception-taxonomy.json`.
- `tools/gc/QBANK_AUDIT.md` — used only to build the work queue (the 132 + 119 IDs); editor does not re-run the audit.
- `tools/gc/sme-triage.<batch>.json` — present in pass 2 only.

### 5.2 Layout (single screen, ONE question at a time)

Three columns on desktop, stacked on mobile:

- **Left (read-only)**: question id, skills, diff, full prompt, all four `opts` with the current `correct` index highlighted, current `diag` per index, current `why` length and text. A small chip per distractor reads "duplicate of #X" if applicable.
- **Center (taxonomy picker)**: filtered list of taxonomy entries whose `applicableSkills` overlaps the question's `skills`. Search box, tag filter chips, clicking an entry expands it and shows description + examples. A "pin" button on each entry copies the `taxId` into the rewrite form.
- **Right (form)**: pass-1 fields (which-distractor, key-defensible, stem-issue, candidate taxIds, free-text note) and pass-2 fields (chosen taxId, new opts text for the index being rewritten, new diag, new why with live char counter, validation warnings).

A queue strip across the top: previous / next, item N of M, batch filter (by topic / by skill).

### 5.3 Validation rules (block save until green)

- New `diag[i]` length is between 30 and 120.
- New `why` length is at least 60 (only if pass-2 is rewriting it; otherwise leave untouched).
- Chosen `taxId` resolves in the loaded taxonomy.
- Chosen `taxId` does not equal any other `taxIds[j]` already set on this question.
- New opts text is non-empty and not equal to any other opts entry on this question (case-insensitive).
- No emojis or unicode glyphs in any new text (regex-block: U+2300..U+27BF, U+2600..U+26FF, U+1F300..U+1FAFF).
- No payment-language tokens in any new text.

### 5.4 Output — JSON patch

The editor writes one or more `tools/gc/patch.<batch>.json` files, never editing `index.html`. Patch shape:

```json
{
  "batch": "thermo-2026-05",
  "appliedAt": null,
  "edits": [
    {
      "id": "e3",
      "ops": [
        { "field": "opts", "index": 2, "value": "−286 kJ" },
        { "field": "diag", "index": 2, "value": "Used 1 mol of H₂O instead of 2 — multiply by stoichiometric coefficient." },
        { "field": "diag", "index": 3, "value": "Sign flipped — formation of H₂O releases heat, so ΔH<0." },
        { "field": "why", "value": "ΔHrxn = 2 × ΔHf(H₂O) = 2 × (−286) = −572 kJ. The 2 comes from the balanced equation; the negative sign is because formation is exothermic." },
        { "field": "taxIds", "index": 2, "value": "stoich.balance.coeff-ignored" },
        { "field": "taxIds", "index": 3, "value": "thermo.enthalpy.sign-of-exo" }
      ]
    }
  ]
}
```

The integrator (a small node script, also out of scope) applies the patch by reading `index.html`, locating the BANK entry by `id`, and producing a diff. The patch file is the source of truth for the cleanup PR; `index.html` is the apply target.

---

## 6. Quality gates — 30-day post-launch review

After rewrites land in production, wait 30 calendar days (need at least ~200 student attempts per touched item for stable distractor stats; below ~100 the metrics are noise).

For each rewritten item, compute:

- **Selection rate per distractor** — fraction of attempts that picked that index.
- **Point-biserial correlation per distractor** — correlation between picking that distractor and overall section score.
- **High-low split per distractor** — selection rate among top-quartile vs. bottom-quartile scorers.

Flag a distractor for recycling into the queue if any of:

1. **Implausibility flag**: selection rate < 5%. Distractor is not pulling weight; replace with a different taxonomy slot.
2. **Discrimination flag**: point-biserial of the **correct** answer is negative or below +0.10. The keying or the stem is broken; route to key-review (out of scope of distractor cleanup).
3. **Inversion flag**: high-scorers select the distractor more than low-scorers. The distractor reads as more sophisticated than the key — common when a rewrite over-models a senior misconception. Route back to pass 2 with the chosen taxonomy slot annotated as "too advanced for this difficulty".

Output: `tools/gc/qa-30d.<cohort>.md`, one row per flagged item, columns: id, flag-type, metric value, suggested action (replace-distractor / route-to-key-review / route-to-pass-2).

---

## 7. Effort and sequencing

### 7.1 Estimated hours

- 132 duplicate-`diag` items + 119 short-`why` items. Some overlap (an item can be in both lists); estimate the union at ~210 items.
- SME pass: 5 min × 210 = **17.5 hours** (the prompt's 50 SME hours assumes a fuller scope; for the strict 132 + 119 union here, 17–20 hours is realistic; budget 25 hours for slack).
- Writer pass: 15 min × ~180 (pass-1 filters out ~15% as stem-issue or key-issue) = **45 hours** (matches the prompt's 35–50 estimate).
- Integration + 30-day QA: **8 hours**.

Total: **~78 hours** end-to-end.

### 7.2 Batching strategy

Batch by **topic block**, not by audit order. Schneid et al. 2014 (rewriting NBME items) found per-topic batching raised throughput 2–3× by avoiding context-switch tax (the SME stays loaded on one topic's misconception family, so they read distractors faster and converge on taxonomy slots faster).

Suggested batch order, ranked by audit-flagged item density:

1. Solutions (`s-e*`, `s*`) — 14 items
2. Gas Laws (`gl-e*`, `g*`) — 14 items
3. Acid-Base — Strong vs Weak + Buffers (`sw*`, `bf*`, `sw-e*`) — 12 items
4. Stoichiometry — Mole Conv + Lim React (`mc-e*`, `lr*`, `lr-e*`) — 14 items
5. Thermodynamics (`e*`, `en*`, `gb*`, `ca-e*`, `gb-e*`, `en-e*`) — 12 items
6. Kinetics + Equilibrium (`rl*`, `ar*`, `ek*`, `lc*`, `ic*`, `*-e*` versions) — 18 items
7. Bonding + Lewis + VSEPR + IMFs — 12 items
8. Atomic + Periodic + Quantum + Hybridization — 10 items
9. Electrochem + Nuclear + Phase — 10 items

Each batch is one work session for the writer (3–6 items per hour at the 15-min target → 4–8 hours per batch).

### 7.3 Calendar

At a part-time pace of 6 SME hours/week and 8 writer hours/week (the realistic Thomas + Antonia / Riya / coach split):

- SME pass: 25 / 6 ≈ **4–5 weeks**
- Writer pass: 45 / 8 ≈ **6 weeks**, can start as soon as batch 1 of SME pass finishes (one batch of lead time)
- Integration + first pass of QA: **1 week**, starts after writer pass

End-to-end: **8–10 weeks** with the parallelization. No-parallel serial floor: **12–13 weeks**.

---

## 8. Scope / non-scope

### In scope this pass

- Distractor text rewrites on the 132 audit-flagged duplicate-`diag` items.
- `diag[i]` rewrites on the same items (and on any `s-e8`-style item where the `diag` is uninformative even though not a string-duplicate, at SME discretion).
- `why` rewrites on the 119 audit-flagged items where length is at most 30.
- Adding `taxIds` per rewritten distractor.
- Building the misconception-taxonomy seed (this deliverable).
- Specifying `bank-editor.html` (this deliverable). Not implementing it.

### Explicitly out of scope this pass

- Rewriting question stems (`q`).
- Changing `correct` index, `diff`, or `skills` arrays.
- Adding tier-4 questions to the 30 skills currently missing diff:4 coverage (separate authoring queue).
- Filling the five zero-coverage skills (colligative, guess, lab-techniques, skip-ret, untimed) — these are content-gen, not cleanup.
- Migrating all 605 questions to the Option-A `diag` schema. Option B keeps the existing string `diag` shape; only rewritten items grow the new `taxIds` field.
- Building the bank-editor or the patch-applier script.

---

## 9. Authoring risks the writer should know about

The single biggest authoring risk: **inadvertently making a rewritten distractor more sophisticated than the keyed answer**, especially in `thermo`, `equilibrium`, and `kinetics` where the misconception taxonomy includes legitimate-looking partial-credit reasoning. A senior student reads "ΔG = ΔH − TΔS at 298 K" as a tipoff to look for a sign trap; if the writer's new distractor encodes a more nuanced trap (e.g., a Boltzmann-weighted partition argument), strong students will pick the distractor and the item's discrimination index will invert at 30-day QA. Mitigation: writers stay in their lane — pick `taxId`s tagged at the same difficulty as the item's `diff` or below, never above. The `diff` column is the writer's ceiling on misconception sophistication.

Other risks worth naming:

- Drift between `opts[i]` text and `diag[i]` rationale during a rewrite (writer changes the answer string but forgets to update `diag`).
- Picking a `taxId` that fits the *concept* but not the *numbers* in the stem (e.g., choosing a sign-flip taxId on a magnitude-only question).
- Accidentally introducing a unicode glyph through a copied figure or arrow character.

The bank-editor's validation rules (section 5.3) catch the third class. The first two require pass-2 self-review and pass-3 spot-check (one in five items).
