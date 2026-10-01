'use strict';
/* Loads the browser engine into Node exactly as the page loads it (same files). */
const path = require('path');
const ENGINE = path.join(__dirname, '..', '..', 'tools', 'pat', 'engine');
function loadEngine() {
  const PAT = require(path.join(ENGINE, 'pat-core.js'));
  ['keyholes', 'tfe', 'angles', 'holepunch', 'cubes', 'patternfold', 'test', 'store'].forEach((n) => require(path.join(ENGINE, 'pat-' + n + '.js')));
  return PAT;
}
const V = require(path.join(__dirname, '..', '..', 'scripts', 'pat', 'verify.js'));

/* Independent checks, one per type. Each returns a list of problems (empty = pass). */
function checkItem(PAT, it) {
  const p = [];
  const n = it.options.length;
  if (!(it.answer >= 0 && it.answer < n)) p.push('answer index out of range');
  if (it.type === 'angles') {
    const r = V.verifyAngles(it.figure.degs, it.options.map((o) => o.text), it.answer);
    p.push(...r.issues);
    if (n !== 4) p.push('angles must have 4 choices');
  } else if (it.type === 'tfe') {
    const f = it.figure, dims = f.dims;
    const occ = (x, y, z) => !!f.V[x][y][z];
    for (const name of Object.keys(f.given)) {
      if (V.segKey(f.given[name]) !== V.segKey(V.viewByEdges(occ, dims, name))) p.push('given ' + name + ' view wrong');
    }
    if (V.segKey(it.options[it.answer].segs) !== V.segKey(V.viewByEdges(occ, dims, f.missing))) p.push('keyed view is not the object\'s true view');
    const given = {}; Object.keys(f.given).forEach((k) => { given[k] = V.segKey(f.given[k]); });
    const sol = V.tfeValidMissingKeys(dims, given, f.missing, V.viewByEdges, 3e6);
    if (sol.aborted) p.push('verifier search aborted');
    it.options.forEach((o, i) => { if (i !== it.answer && sol.keys.has(V.segKey(o.segs))) p.push('distractor ' + i + ' (' + o.trap + ') is also a valid view'); });
    if (new Set(it.options.map((o) => V.segKey(o.segs))).size !== n) p.push('duplicate options');
    if (n !== 4) p.push('TFE must have 4 choices');
  } else if (it.type === 'holepunch') {
    const truth = V.holepunchForward(it.figure.steps.map((s) => s.fold), it.figure.punches);
    if (V.holeKey(truth) !== V.holeKey(it.options[it.answer].holes)) p.push('keyed holes differ from forward simulation');
    const keys = it.options.map((o) => V.holeKey(o.holes));
    if (new Set(keys).size !== n) p.push('duplicate options');
    if (n !== 5) p.push('hole punching must have 5 choices');
  } else if (it.type === 'cubes') {
    const counts = V.cubePaintedCounts(it.figure.cubes);
    const k = it.meta.k, ans = counts.filter((c) => c === k).length;
    if (it.options[it.answer].count !== ans) p.push('keyed count ' + it.options[it.answer].count + ' but independent count ' + ans);
    const fig = V.verifyCubeFigure(it.figure.cubes, 0.2, [1, 1, 1]);
    p.push(...fig.issues);
    if (n !== 5) p.push('cube counting must have 5 choices');
  } else if (it.type === 'patternfold') {
    const marks = it.figure.marks.map((m) => PAT.patternfold.MARKS[m].polys);
    const faces = V.foldNetByRolling(it.figure.net, marks);
    if (!faces) { p.push('net does not fold'); return p; }
    const valid = V.validCubeDrawings(faces);
    it.options.forEach((o, i) => {
      const ok = valid.has(V.drawingSig(o.polys));
      if (i === it.answer && !ok) p.push('keyed cube is not a fold of the net');
      if (i !== it.answer && ok) p.push('distractor ' + i + ' (' + o.trap + ') is also a valid fold');
    });
    if (n !== 4) p.push('pattern folding must have 4 choices');
  } else if (it.type === 'keyholes') {
    const N = it.figure.N, d = it.figure.d;
    const occ = (x, y, z) => (x < 0 || y < 0 || z < 0 || x >= N || y >= N || z >= N) ? false : !!d[(x * N + y) * N + z];
    const sils = V.silhouettesOf(occ, N);
    const truth = new Set(sils.map(V.canonG));
    it.options.forEach((o, i) => {
      const match = truth.has(V.canonG(o.grid)) && Math.abs((o.scale || 1) - 1) < 1e-9;
      if (i === it.answer && !match) p.push('keyed opening is not a true outline');
      if (i !== it.answer && match) p.push('distractor ' + i + ' (' + o.trap + ') is also a true outline');
      if (i !== it.answer && truth.has(V.canonG(o.grid)) && Math.abs(o.scale - 1) < 0.25) p.push('size trap too close to true size');
    });
    const keyCanon = V.canonG(it.options[it.answer].grid);
    if (V.canonG(sils[it.meta.keyAxis]) !== keyCanon) p.push('meta.keyAxis does not match the key');
    if (it.meta.evidence[it.meta.keyAxis] !== 0) p.push('key outline not fully visible in the drawing');
    const cans = it.options.map((o) => V.canonG(o.grid) + '@' + o.scale);
    if (new Set(cans).size !== n) p.push('duplicate options');
    if (n !== 5) p.push('keyholes must have 5 choices');
  }
  return p;
}

module.exports = { loadEngine, V, checkItem };
