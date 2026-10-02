# QR formats pool

Original Quantitative Reasoning items in the formats the current DAT spec names
(changed 2015 to 2016): Quantitative Comparison, Data Sufficiency, data analysis
and interpretation with rendered tables and graphs, and applied word problems.
Any Ace Labs test can draw from it. No item is copied from ADA, Booster or
Bootcamp material.

| Format | Code | Skill id (QR engine) | Items | Choices |
|---|---|---|---|---|
| Quantitative Comparison | `qc` | `qc-compare` | 60 | 4 fixed: A greater, B greater, equal, cannot be determined |
| Data Sufficiency | `ds` | `ds-format` | 60 | 5 fixed, standard order (1 alone, 2 alone, together, each alone, not sufficient) |
| Data Interpretation (figures) | `di` | `data-figs` | 60 | 5, every item has a rendered figure |
| Applied Word Problems | `aw` | `applied-wp` | 40 | 5 |

Every item has a one-line `move`, a full worked solution (`why`), and usually a
`diag` note for the most tempting wrong answer.

## Files

| File | What it is |
|---|---|
| `scripts/qr-formats/src/{qc,ds,di,aw}.js` | The authored items (edit these). |
| `scripts/qr-formats/lib/exact.js` | Exact rational arithmetic and the small expression language the checker uses. |
| `scripts/qr-formats/lib/check.js` | Schema, key recomputation, set gates (key spread, duplicates), banned words and glyphs. |
| `scripts/qr-formats/build.js` | Verifies everything, then writes the two generated files below. |
| `shared/qr-formats-bank.js` | GENERATED. Browser global `QR_FORMATS_DATA`, also `require()`-able. |
| `shared/qr-formats-bank.json` | GENERATED. Same data as JSON. |
| `shared/qr-formats.js` | Runtime: `QRFormats.draw`, `stemHTML`, `toEngineItem`, `toMockItem`. |
| `shared/qr-figures.js` | Figure renderer (tables, bar, line, pie) used by any item with a `figure`. |
| `tools/qr/qr-formats-module.js` | The four DAT-format modules in the QR engine (practice + timed). |

## Using the pool in another test

```html
<script src="/shared/qr-figures.js"></script>
<script src="/shared/qr-formats-bank.js"></script>
<script src="/shared/qr-formats.js"></script>
<script>
  // 12 items, interleaved qc / ds / di / aw, DAT-level difficulty, repeatable
  const set = QRFormats.draw({ n: 12, diff: [2, 3, 4], seed: 2026, exclude: alreadyUsedIds });
  set.forEach((it) => {
    container.insertAdjacentHTML('beforeend', QRFormats.stemHTML(it)); // figure + stem, figures self-size
    QRFormats.options(it);       // the option strings (fixed sets for qc and ds)
    it.correct;                  // index of the key in those options
    QRFormats.solutionHTML(it);  // "The move" + worked solution
  });
  // Shapes other tools already use:
  QRFormats.toEngineItem(it); // {id, skills, diff, q, opts, correct, why, diag} as in tools/qr BANK
  QRFormats.toMockItem(it);   // {id, section:'QR', q, choices, answer:'A'..'E', explanation}
</script>
```

`draw` options: `formats` (default all four), `n`, `diff` (array of 1 to 4),
`topics`, `exclude` (ids), `seed` (same seed, same set). It never puts two items
that share a figure in one draw.

Item record (generated): `id, format, skill, topic, diff, stem, colA/colB (qc),
s1/s2 (ds), figure (di, optional elsewhere), opts (null for qc/ds), correct,
move, why, diag {optionIndex: note}`. All text is plain; render through
`QRFormats.display()` (escapes HTML, raises `x^2` and `2^(n+1)` exponents).

Option order is final in the generated file: all-numeric option sets are
ascending (the way the DAT prints them); text options keep the authored order.
Do not shuffle QC or DS choices (their order is part of the format). Shuffling
DI/AW numeric options would break the ascending convention, so avoid it.

## Figures

```js
QRFigures.html(spec)            // <figure> string; hydrates to its container width on insert and resize
QRFigures.mount(el, spec)       // render now
QRFigures.svg(spec, { width })  // bare SVG at a pixel width (works in Node)
QRFigures.validate(spec)        // [] or problems
```

Specs: `table {columns, rows}`, `bar {categories, series[{name, values}], orientation?}`,
`line {x, series}`, `pie {slices[{label, value}], show:'percent'|'value'|'both'}`;
all take `title`, optional `yLabel`, `xLabel`, `unit`, `note`, `yMin`, `yMax`,
`yStep`, `valueLabels`. Every label comes from the data. Unlabeled values must sit
on a gridline or half step (the validator enforces it) so they can be read.
Colors are CSS custom properties that follow the host page tokens and switch
under `[data-theme="dark"]`; the categorical palette was validated for color
vision deficiency against both surfaces (multi-series lines and bars cap at 3
series, pies at 6 slices with direct labels and a legend). Science banks can use
the same renderer: add a `figure` field and render it with `QRFigures.html`.

## Adding or editing items

1. Edit `scripts/qr-formats/src/<format>.js` (schema at the top of `lib/check.js`).
2. Give every item a `check` the checker can recompute:
   - `{num: 'expr', round?: places}` for a numeric option (figure lookups:
     `cell('row','col')`, `col('col')`, `val('series','category')`,
     `seriessum('series')`, `slice('label')`, `pietotal()`),
   - `{pickMax|pickMin: {'option': 'expr'}}` for text options,
   - `{qc: {A, B, vars, given}}` (the checker enumerates the domain and
     finds every relationship that can occur),
   - `{ds: {vars, given, ask | askYes, s1, s2}}` (the checker tests whether each
     statement pins the asked value to exactly one answer).
   Domains: `'int:a..b'`, `'rat:a..b/q'` (multiples of 1/q), or an array. Choose a
   domain that includes the edge cases (negatives, zero, fractions).
3. `npm run build:qr-formats` (fails on any wrong key, schema problem, key
   letter imbalance, key that is the unique longest option, banned word or glyph,
   or off-spec topic word such as triangle or tangent).
4. `npm run test:qr-formats` and `npm run test:qr-figures`.

## In the QR engine (tools/qr)

- Four modules under "DAT Formats · current spec": a picture, the named moves,
  the trap, the fixed answer choices, then Practice (untimed, worked solution
  after each answer) and Timed set (10 questions at 67.5 seconds each, the real
  QR pace, review at the end). A timed set at 80 percent or better marks the
  module mastered.
- The pool is merged into `BANK`, so spaced review, weak-spot drills and the
  40-question Test-Day Simulation draw from it.
- Trigonometry, 2D geometry, triangle invariance, volume and surface area, and
  unit conversions are flagged `offspec` and moved to "Optional review · not on
  the current DAT". They stay readable but are excluded from the diagnostic, the
  simulation, the daily drill, the pacing ladder, the skill tree and progress
  counts. The Friday mini-mock's four geometry slots now hold QC items.
