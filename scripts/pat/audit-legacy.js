/*
  audit-legacy.js : run the ORIGINAL Studio generators (pulled verbatim from
  tools/pat/*.html) through the independent verifiers, 50 fixed seeds per type.
  Usage: node scripts/pat/audit-legacy.js [--json out.json]
*/
'use strict';
const L = require('./legacy.js');
const V = require('./verify.js');
const ENG = require('../../tests/pat/helpers.js').loadEngine();

const N = 50;
const SEEDS = Array.from({ length: N }, (_, i) => 1000 + i * 37);
const report = {};
function rec(type, seed, issues, extra) {
  const r = report[type] || (report[type] = { items: 0, bad: 0, issueCounts: {}, examples: [], notes: {} });
  r.items++;
  if (issues.length) {
    r.bad++;
    issues.forEach((s) => { const k = s.replace(/\d+/g, '#'); r.issueCounts[k] = (r.issueCounts[k] || 0) + 1; });
    if (r.examples.length < 6) r.examples.push({ seed, issues, extra });
  }
}

/* ---------- angles ---------- */
const gapsSeen = [];
for (const s of SEEDS) {
  const q = L.anglesGen(s, 5, false);
  const res = V.verifyAngles(q.degs, q.opts, q.opts.indexOf(q.correct));
  gapsSeen.push(res.minGap);
  const issues = res.issues.slice();
  if (q.opts.length !== 4) issues.push('option count ' + q.opts.length + ' (real DAT: 4)');
  rec('angles', s, issues);
}
report.angles.notes.minGapDefault = Math.min.apply(null, gapsSeen) + ' to ' + Math.max.apply(null, gapsSeen) + ' degrees (every gap equal)';

/* ---------- TFE ---------- */
let tfeViewMismatch = 0;
for (const s of SEEDS) {
  const g = L.tfeGen(s, 2);
  const dims = [g.NX, g.NY, g.NZ];
  const occ = (x, y, z) => !!g.V[x][y][z];
  const issues = [];
  // 1. the generator's views vs independent edge-based views
  for (const [name, segs] of [['top', g.item.top], ['front', g.item.front], ['end', g.item.end]]) {
    if (V.segKey(segs) !== V.segKey(V.viewByEdges(occ, dims, name))) { issues.push(name + ' view differs from independent hidden-line computation'); tfeViewMismatch++; }
  }
  // 2. ambiguity: which END views are consistent with the given TOP + FRONT?
  const given = { top: V.segKey(g.item.top), front: V.segKey(g.item.front) };
  const res = V.tfeValidMissingKeys(dims, given, 'end', V.viewByEdges, 3e6);
  const keyOk = res.keys.has(V.segKey(g.item.end));
  if (!keyOk) issues.push('keyed end view not reproduced by any consistent object');
  const okIdx = g.item.opts.findIndex((o) => o.ok);
  g.item.opts.forEach((o, i) => {
    if (o.ok) return;
    if (res.keys.has(V.segKey(o.segs))) issues.push('distractor (' + o.tax + ') is ALSO a valid end view');
  });
  if (res.aborted) issues.push('solver aborted');
  if (new Set(g.item.opts.map((o) => V.segKey(o.segs))).size !== g.item.opts.length) issues.push('duplicate options');
  rec('tfe', s, issues, { dims, okIdx, validEndViews: res.keys.size });
}

/* ---------- hole punching ---------- */
for (const s of SEEDS) {
  const h = L.holepunchGen(s, 2);
  const P = h.P;
  // legacy fold {axis:'v'|'h', c, side:'hi'|'lo'} : 'hi' = the piece above c moves
  const folds = P.folds.map((f) => ({ kind: f.axis === 'v' ? 'v' : 'h', c: f.c, moveSide: f.side === 'hi' ? 1 : -1 }));
  const truth = V.holepunchForward(folds, P.punches);
  const issues = [];
  if (V.holeKey(truth) !== V.holeKey(P.answer)) issues.push('keyed hole pattern differs from forward simulation');
  const keys = h.distractors.map(V.holeKey);
  if (keys.includes(V.holeKey(truth))) issues.push('a distractor equals the answer');
  if (new Set(keys).size !== keys.length) issues.push('duplicate distractors');
  const nOpts = h.distractors.length + 1;
  if (nOpts !== 5) issues.push('option count ' + nOpts + ' (real DAT: 5)');
  rec('holepunch', s, issues, { folds: P.folds.length });
}
report.holepunch.notes.foldKinds = 'vertical and horizontal only; no diagonal folds';

/* ---------- cubes ---------- */
for (const s of SEEDS) {
  const c = L.cubesGen(s, 2);
  const issues = [];
  const counts = V.cubePaintedCounts(c.cubes);
  const hist = {}; counts.forEach((n) => { hist[n] = (hist[n] || 0) + 1; });
  if ((hist[c.question.n] || 0) !== c.question.answer) issues.push('keyed count differs from independent count');
  const fig = V.verifyCubeFigure(c.cubes, 0.2, [1, 1, 1]);
  issues.push.apply(issues, fig.issues);
  rec('cubes', s, issues, { total: c.total });
}

/* ---------- pattern folding ---------- */
for (const s of SEEDS) {
  const p = L.patternfoldGen(s, 2);
  const issues = [];
  const marks = p.pats.map((k) => p.PATTERNS[k].polys);
  const faces = V.foldNetByRolling(p.net, marks);
  if (!faces) { rec('patternfold', s, ['net does not fold to a cube']); continue; }
  const valid = V.validCubeDrawings(faces);
  const FACES = { top: [0.5, 0.5, 1], front: [0.5, 1, 0.5], right: [1, 0.5, 0.5] };
  const legacyDrawing = (r) => {
    const polys = [];
    ['top', 'front', 'right'].forEach((fn) => {
      const x = r[fn]; if (!x || !x.pat) return;
      const C = FACES[fn];
      p.PATTERNS[x.pat].polys.forEach((poly) => {
        polys.push(poly.map(([a0, b0]) => {
          let a = a0, b = b0;
          if (x.rot) { const t = a; a = b; b = 1 - t; }
          if (x.mirror) a = 1 - a;
          const q = [C[0] + (a - 0.5) * x.u[0] + (b - 0.5) * x.v[0], C[1] + (a - 0.5) * x.u[1] + (b - 0.5) * x.v[1], C[2] + (a - 0.5) * x.u[2] + (b - 0.5) * x.v[2]];
          return [(q[0] - q[1]) * 0.866, (q[0] + q[1]) * 0.5 - q[2]];
        }));
      });
    });
    return V.drawingSig(polys);
  };
  const okIdx = p.opts.findIndex((o) => o.ok);
  const validIdx = p.opts.map((o, i) => (valid.has(legacyDrawing(o.r)) ? i : -1)).filter((i) => i >= 0);
  if (!validIdx.includes(okIdx)) issues.push('keyed cube is NOT a valid fold of the net (drawn as its mirror image or wrong)');
  validIdx.filter((i) => i !== okIdx).forEach((i) => issues.push('distractor (' + p.opts[i].why.split(' - ')[0] + ') is ALSO a valid fold'));
  rec('patternfold', s, issues, { netIdx: p.netIdx, validIdx, okIdx });
}
report.patternfold.notes.nets = 'only 4 of the 11 cube nets; cube shapes only';

/* ---------- keyholes ---------- */
const diffs = ['medium', 'hard'];
let ki = 0;
for (const s of SEEDS) {
  const diff = diffs[ki++ % 2];
  const it = L.keyholesGen(s, diff);
  if (!it) { rec('keyholes', s, ['generator returned no item']); continue; }
  const N = it.N, d = it.solid.d;
  const occ = (x, y, z) => (x < 0 || y < 0 || z < 0 || x >= N || y >= N || z >= N) ? false : !!d[(x * N + y) * N + z];
  const res = V.verifyKeyholes(occ, N, it.options.map((o) => o.grid), it.answerIndex, { scaleNormalized: true, checkHidden: false });
  const ev = ENG.keyholes.outlineEvidence({ N, d: Uint8Array.from(d) });
  const issues = res.issues.slice();
  if (ev[it.answerAxis] > 0) issues.push('keyed outline has ' + ev[it.answerAxis] + ' outline cells the drawing does not show');
  rec('keyholes', s, issues, { difficulty: diff, evidence: ev, keyAxis: it.answerAxis });
}

const out = process.argv.indexOf('--json');
if (out > 0) require('fs').writeFileSync(process.argv[out + 1], JSON.stringify(report, null, 2));
for (const [t, r] of Object.entries(report)) {
  console.log('\n== ' + t + ': ' + r.bad + '/' + r.items + ' items with problems');
  for (const [k, n] of Object.entries(r.issueCounts)) console.log('   ' + n + 'x ' + k);
  for (const [k, v] of Object.entries(r.notes)) console.log('   note ' + k + ': ' + v);
  r.examples.slice(0, 2).forEach((e) => console.log('   e.g. seed ' + e.seed + ': ' + e.issues.join('; ')));
}
