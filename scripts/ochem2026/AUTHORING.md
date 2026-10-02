# Authoring the 2026 organic set

One file per batch in `src/`, `export default [ item, ... ]`. Gate: `node scripts/ochem2026/build.mjs --check`
(from the repo root). It must print PASS. Look at `src/00-sample.mjs` first.

## Item shape

```js
{
  id: 'af-07',                 // unique, prefix by type: af ar fh ch rcd cf lab cn ms eq cs al sy
  type: 'arrows-forward',      // see TYPES in build.mjs; it sets home, area and the type name
  roots: ['l2-arrows'],        // from the 18 root ids (l1-skeletal ... l3-ez)
  difficulty: 1 | 2 | 3,       // aim for about a third each; DAT difficulty, not trivia
  stem: 'Full DAT-style sentence(s).',
  fig: { ... } | absent,       // the drawn figure, see below
  sub, reagent, prod,          // optional classic reaction row (SMILES, text, SMILES)
  choices: [ five of { text?, smiles?, fig? } ],
  correct: 0..4,               // any slot; the build re-spreads keys across A to E
  verify: { ... },             // machine-checkable claims, see below
  coach: 'ONE sentence naming the fixable move (shown on a miss).',
  why: '2 to 4 sentences: why the key is right and why the strongest distractor is not.'
}
```

## Hard rules (the gate enforces most of them)
- Exactly five choices, all distinct. The key is never the longest choice (when every choice has text,
  the key text must be strictly shorter than the longest distractor). Distractors are the real student slips.
- No letter citations anywhere ("choice B", "(C)"). The build moves keys.
- No em or en dashes, no ellipsis character, no arrows or Greek glyphs (write "heat of reaction", not delta H),
  no unicode minus. Plain ASCII hyphen. Say "partially positive / partially negative", never delta.
- No payment, pace, or score-prediction words. A miss is "Not yet", never "wrong".
- Thomas's voice: plain words, one physical picture, name the move. "Rich attacks poor."
  "Attack, kick it off, attach." CARDIO (Charge, Atom, Resonance, Dipole induction, Orbital), never CARBO.
- Original items only. Never reproduce Booster, Bootcamp, Chad, Kaplan or ADA sample items.
- If you are not certain an item is right, leave it out. Fewer, airtight items beat more items.

## Figures

### Mechanism (`fig.kind: 'mech'`)
```js
fig: {
  kind: 'mech',
  species: [{ smi: '[OH-]' }, { smi: 'CCBr', lp: [2] }],   // drawn left to right with "+" between
  arrows: [
    { from: { lp: '0.0' }, to: { bond: ['0.0', '1.1'] } },        // lone pair on O makes a new O-C bond
    { from: { bond: ['1.1', '1.2'] }, to: { atom: '1.2' } }        // C-Br bond electrons go onto Br
  ],
  product: [{ smi: 'CCO' }, { smi: '[Br-]' }],   // optional: drawn after a reaction arrow
  hideProduct: true                               // optional: a "?" box in the product's place
}
```
- Atom refs are `'s.a'`: species s, atom a, both 0-based, atoms counted in SMILES order INCLUDING explicit `[H]`.
- Sources: `{lp:'s.a'}` lone pair, `{bond:['s.a','s.b']}` a bond's electrons, `{e:'s.a'}` a single (radical) electron.
- Targets: `{atom:'s.a'}` electrons become a lone pair (or single electron) on that atom; `{bond:['s.a','s.b']}`
  electrons become (part of) a bond between those atoms, new or existing.
- `fish: true` makes a fishhook (one electron). Fishhooks must pair up so no half bond remains.
- Write any H that moves as an explicit `[H]` atom. Write rings in Kekule form (C1=CC=CC=C1), never lowercase
  aromatic SMILES, inside mech figures. Charges in brackets: `[O-]`, `[OH3+]`, `[CH2+]`, radicals as `[CH2]`, `[Br]`.
- `rad: [atomIdx]` must list exactly the radical atoms of that species (RDKit checks it). `lp` is cosmetic
  (lone pairs that arrows start from are drawn automatically).
- The verifier pushes the arrows for real. Charges and radicals are recomputed from electron counts, the result
  must sanitize, and no B, C, N, O, F may exceed an octet. `product` must list EVERY fragment.

Type rules the verifier applies:
- `arrows-forward`, `fishhook-forward`: stem fig has species + arrows (+ hideProduct). Each choice has `smiles`
  (all fragments joined with '.') and short `text`. The key must equal exactly what the arrows give; no
  distractor may.
- `arrows-reverse`, `fishhook-reverse`: stem fig has species + product, no arrows. Every choice is
  `{ fig: { kind: 'mech', species: <same species>, arrows: [...] } }` (text optional and short). The keyed arrow set
  must make the product; every other set must not (an illegal set, for example a five-bond carbon or arrows
  drawn backward from the plus charge, is a fine distractor and the verifier accepts it as not making the product).

### Combined mechanism (`fig.kind: 'chain'`)
```js
fig: { kind: 'chain', steps: [ { name: 'protonate the carbonyl', species: [...], arrows: [...], drops?: ['[Br-]'] },
                               { name: '...', species: [...], adds?: ['O'] , arrows: [...] } ],
       product: [...], hide?: 1 }
```
Each step's arrows applied to its species must give the next step's species exactly, after removing that
step's `drops` and adding the next step's `adds`; the last step must give `product`. `hide: k` blanks step k.
Ask about it with choices that are structures plus `verify: { stateAfter: k }` (the key's fragments must appear
in the state after k steps, 0 = the starting species), or with text choices about which step / which move.

### Reaction coordinate diagram (`fig.kind: 'rcd'`)
```js
fig: { kind: 'rcd', points: [{ kind: 'start', y: 0, tag: '1', show?: true }, { kind: 'ts', y: 90, tag: '2' },
       { kind: 'int', y: 40 }, { kind: 'ts', y: 60 }, { kind: 'end', y: -20 }],
       marks: [{ from: 0, to: 1, label: 'w' }, { from: 2, to: 3, label: 'x' }, { from: 0, to: 4, label: 'y', dx: 24 }],
       alt?: { points: [...same kinds], label: 'with catalyst' },
       yLabel?: 'Free energy', xLabel?: 'Reaction progress', names?: { 0: 'reactants' } }
```
Conformation plots use `xTicks: ['0','60','120','180','240','300','360']`, `xLabel: 'Dihedral angle, degrees'`,
kinds `ts` for maxima and `min` for minima. `show: true` prints the energy value on the axis (use for
calculation items; values in kJ/mol). Peaks must be above both neighbours, valleys below.
`verify.rcd` makes the build recompute the answer: `'steps'`, `'intermediates'`, `'rds'` (key text holds the
step number), `'rdsMark'` (key text is the label of the mark from the valley before the slowest peak up to it),
`'heat'` (key text says exothermic or endothermic), `'mark'` with `from`/`to`, `'lowestTs'`, `'value'` with
`kind: 'dh' | 'rdsEa' | 'ea'` (+ `from`, `to`) where the key's first number must equal the computed value.

## Other verify claims (verify.py)
- `{ c13: 'SMILES' }` key text's first number is the count of distinct carbons; `{ h1: 'SMILES' }` distinct H
  environments (topological; avoid molecules with diastereotopic protons for 1H counts).
- `{ c13Each: n }` / `{ h1Each: n }`: structure choices, only the key has n signals.
- `{ formula: [['SMILES', 'C6H12O'], ...] }`, `{ formulaEach: 'C5H10O' }` every choice is an isomer of that formula.
- `{ dou: 'C6H10O' }` key's first number is the degrees of unsaturation.
- `{ eq: { leftAcid: 'SMILES', rightAcid: 'SMILES', favors: 'left' | 'right' } }` checked against the reference
  pKa table in verify.py (gap must be 2 units or more). leftAcid is the acid on the reactant side, rightAcid the
  conjugate acid on the product side. If your acid is not in the table, add nothing: pick another acid.
- `{ distinct: true }` no two structure choices are the same molecule.
Any SMILES anywhere must parse. Items with no machine claim still need every structure to parse and must
survive the skeptical review, so keep them squarely in DAT-standard chemistry.

Chain convention: list a step's `adds` species LAST in that step's `species`, so the stepper can show
exactly what the previous step made.
