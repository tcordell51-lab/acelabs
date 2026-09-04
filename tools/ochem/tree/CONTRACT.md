# The Tree of Organic: module contract (tiers 4 to 7)

Same contract as the Roots page (read ../roots/CONTRACT.md first: export shape, api,
voice, color code, hard rules, testing), with three additions.

## 1. Structures are SMILES, drawn by the shell

Never hand-draw a molecule in a tier module. Give the api a SMILES string:

```js
const svg = api.drawSmiles(container, 'CC(=O)Cl', { width: 240, height: 160, label: 'acetyl chloride' });
```

It returns the inline <svg> (already appended). Reaction rows use the shell CSS:
`<div class="rxn"><div class="box">[substrate svg]</div><div class="arrow"><span class="reagent">PCC</span><div class="line"></div><span>CH2Cl2</span></div><div class="box">[product svg]</div></div>`.
A hidden product is `<div class="box q">?</div>`.

SMILES rules: write carbonyls as `CC(=O)Cl`, not `O=C(Cl)C` (the renderer condenses
the second form). Stereocenters with `@`/`@@`, alkenes with `/` and `\`. Every SMILES
you use must appear in `shared/reactions.js` (the verified table) or in your module's
own `SMILES` list at the top of the file so the sheet test can render all of them.

## 2. The verified reaction table

Modules stay import-free. The shell hands the table in: `api.reactions = { REACTIONS,
SUBSTRATES, FAMILIES, byFamily, siblings, find }` and `api.bank = { items(moduleId),
toItem(bankItem), GROUP_MAP }`. In node, `selfTest(deps)` receives the same two objects
as `deps.reactions` and `deps.bank` (bank items are empty in node), and `makeItem(api)`
gets them on the api. Never `import` in a module.

`shared/reactions.js` exports `REACTIONS`: every reaction the DAT can ask, each with
`id, family, tier, name, reagent, conditions, substrateClass, sub (SMILES), prod (SMILES),
regio, stereo, mechanism, steps[], thomas (his line), trap, roots[] (root ids), booster`.
Generators build items FROM this table: "major product", "which reagent", "which
mechanism", "which substrate", and distractors come from SIBLING reactions of the same
family (the PCC vs Jones kind of trap), never invented. If the table lacks something you
need, say so in your report instead of inventing a reaction.

## 3. makeItem for the Summit

Every module also exports:

```js
export function makeItem(api) -> {   // api.rng, api.pick, api.shuffle, api.reactions, api.bank available
  stem: 'plain text prompt',
  sub: 'SMILES' | null,            // drawn on the left when present
  reagent: 'text' | null,          // drawn on the arrow when present
  prod: 'SMILES' | null,           // drawn on the right when present (usually null: the product is the question)
  choices: [{ text: 'plain', smiles: 'SMILES' | null }],   // 4 choices, drawn if smiles
  correct: 0..3,
  coach: 'one sentence naming the fixable move',
  home: 't4-alkene',               // this module id
  roots: ['l2-carbocation']        // the roots this item stands on, best first
}
```

Deterministic on api.rng, answers computed from the table, distractors distinct.
selfTest(deps) must build a tiny api from deps (a seeded rng, pick, shuffle, deps.reactions, deps.bank) and generate at least 200 makeItem() results and assert: four distinct
choices, correct index valid, every SMILES parses (use the shell's SMILES sanity list
by string checks: balanced parentheses and ring digits), and coach is non-empty.

## 4. The verified bank

index.html also loads `../../../games/ochem-bank-1000.js` (window.OCHEM_DB, 1213 items,
RDKit-checked). `shared/bank-map.js` exports `GROUP_MAP`, `bankItems(moduleId)` and
`bankToItem(it)`. Use bank items as a second source of "you try" items (they carry
`q`, `q_smiles`, `opts` (SMILES when `opts_are_structures`), `correct`, `why`): alternate
generated items with bank items so the student meets real DAT phrasing. Never edit bank
text; render it with textContent. `siblings(r)` in reactions.js returns same-substrate
distractors; when it is empty, take distractors from `byFamily(r.family)` with a
different product.
