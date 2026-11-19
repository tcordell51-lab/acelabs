// dump every walkthrough number source to JSON for verify.py (run: node scripts/walkthrough-dump.js REPO > dump.json)
const path = require('path'), R = process.argv[2];
const G = require(path.join(R, 'gc/galvanic/galvanic-walk.js')), Q = require(path.join(R, 'gc/guacamole/guac-walk.js'));
const texts = (b) => [].concat(b.base || [], ...(b.frames || [])).filter((o) => o.k === 'text').map((o) => o.t);
const out = { half: G.HALF.map((h) => ({ id: h.id, e: h.e })), cells: [], variants: [], guac: [], gvar: [] };
for (const a of G.HALF) for (const b of G.HALF) {
  const c = G.cell(a.id, b.id); if (!c) continue;
  const e = G.explain(c), it = G.checkItem(c, 2);
  out.cells.push({ L: a.id, R: b.id, steps: e.steps.map((s) => s.text), answer: e.answer, board: texts(G.board(c)), check: e.check, key: it.choices[it.answer] });
}
for (const [x, y] of G.pairs(0.1)) for (const t of G.TYPES) { const v = G.variant(t, x, y, 3); out.variants.push({ id: v.id, type: t, a: x, b: y, stem: v.stem, key: v.choices[v.answer], choices: v.choices }); }
for (const it of Q.ITEMS) it.ch.forEach((c, i) => { if (c.ok) return; const w = Q.explain(it.id, i); out.guac.push({ id: it.id, pick: i, stem: it.stem, choices: it.ch.map((x) => x.t), key: Q.keyIndex(it), steps: w.explain.steps.map((s) => s.text), answer: w.explain.answer, board: texts(w.board), check: w.explain.check }); });
for (const fam of Object.keys(Q.FAMILIES)) { const [A, B] = Q.grid(fam); for (let a = 0; a < A; a++) for (let b = 0; b < B; b++) { const v = Q.variant(fam, a, b); if (v) out.gvar.push({ fam, a, b, id: v.id, stem: v.stem, choices: v.choices, answer: v.answer, traps: v.traps }); } }
console.log(JSON.stringify(out));
