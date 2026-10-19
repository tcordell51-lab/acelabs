/* Numeric fixtures and model invariants for the Boyle's law pilot.
   Run: node --test review-pilots/boyle-2026-10-19/tests/model.test.js */
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const M = require('../boyle-model.js');

test('preset fixtures: V = 0.5, 1, 2, 4 L give P = 4, 2, 1, 0.5 atm', () => {
  const expected = { 0.5: 4, 1: 2, 2: 1, 4: 0.5 };
  for (const [V, P] of Object.entries(expected)) assert.strictEqual(M.pressureAt(Number(V)), P);
});

test('|PV - 2| < 1e-10 at every slider stop, before rounding', () => {
  const vals = M.sliderValues();
  assert.strictEqual(vals.length, 71);
  assert.strictEqual(vals[0], 0.5);
  assert.strictEqual(vals[vals.length - 1], 4);
  for (const V of vals) assert.ok(Math.abs(V * M.pressureAt(V) - 2) < 1e-10, 'V=' + V);
});

test('fixed amount n = 2/(0.082057 x 300) ~ 0.08124 mol', () => {
  assert.ok(Math.abs(M.N_MOL - 0.08124) < 1e-5);
  assert.ok(Math.abs(M.N_MOL * M.R * M.T - 2) < 1e-12);
});

test('rejects zero, negative, NaN, non-numeric and out-of-range volumes', () => {
  for (const bad of [0, -1, -0.5, NaN, Infinity, -Infinity, '', '  ', 'abc', '1..2', null, undefined, 0.45, 4.05, 10, '0', '-2']) {
    const r = M.validateVolume(bad);
    assert.strictEqual(r.ok, false, 'should reject ' + String(bad));
    assert.ok(M.VOLUME_ERRORS[r.reason], 'has message for ' + r.reason);
  }
});

test('accepts in-range values and snaps to the 0.05 L grid', () => {
  assert.deepStrictEqual(M.validateVolume('2'), { ok: true, value: 2, snapped: false });
  assert.deepStrictEqual(M.validateVolume(0.5), { ok: true, value: 0.5, snapped: false });
  assert.deepStrictEqual(M.validateVolume('4.00'), { ok: true, value: 4, snapped: false });
  const r = M.validateVolume('1.23');
  assert.strictEqual(r.value, 1.25); assert.strictEqual(r.snapped, true);
  assert.strictEqual(M.validateVolume(0.8).value, 0.8);
});

test('P-vs-V is hyperbolic (not linear); P-vs-1/V is linear through the origin', () => {
  const vs = M.sliderValues();
  const ps = vs.map(M.pressureAt);
  // Hyperbola: constant product, but slopes between neighbours vary.
  const slopes = vs.slice(1).map((v, i) => (ps[i + 1] - ps[i]) / (v - vs[i]));
  assert.ok(Math.abs(slopes[0] - slopes[slopes.length - 1]) > 1, 'P-vs-V slope is not constant');
  // Linear in 1/V: P / (1/V) is the same constant (2.00) everywhere.
  for (let i = 0; i < vs.length; i++) assert.ok(Math.abs(ps[i] / (1 / vs[i]) - 2) < 1e-10);
});

test('prediction feedback matches the brief', () => {
  assert.strictEqual(M.gradePrediction('2.00').correct, true);
  assert.strictEqual(M.gradePrediction('2.00').message, '2.00×1.00 preserves the initial PV product.');
  assert.strictEqual(M.gradePrediction('0.50').message, 'Pressure changes inversely: halving volume doubles pressure.');
  assert.strictEqual(M.gradePrediction('1.00').message, 'The gas amount is unchanged, but wall interactions change with confinement.');
  assert.strictEqual(M.gradePrediction(null).status, 'empty');
});

test('transfer: 2.50 atm, accepts 2.5 and +/-0.02, explains 0.40, shows working', () => {
  for (const ok of ['2.50', '2.5', '2.48', '2.52', ' 2.51 ']) assert.strictEqual(M.gradeTransfer(ok).correct, true, ok);
  for (const no of ['2.47', '2.53', '1.6', '5']) assert.strictEqual(M.gradeTransfer(no).correct, false, no);
  assert.strictEqual(M.gradeTransfer('0.40').status, 'direct');
  assert.strictEqual(M.gradeTransfer('0.4').status, 'direct');
  assert.match(M.gradeTransfer('0.4').message, /inverse/);
  assert.match(M.gradeTransfer('3').message, /amount of gas and the temperature stay fixed/);
  assert.strictEqual(M.gradeTransfer('').status, 'empty');
  assert.strictEqual(M.gradeTransfer('abc').status, 'empty');
  assert.match(M.gradeTransfer('2.5').working, /\(1\.00 atm × 2\.00 L\)\/0\.80 L = 2\.50 atm/);
  assert.ok(Math.abs((1.00 * 2.00) / 0.80 - 2.5) < 1e-12);
});

test('leak check: answer is no', () => {
  assert.strictEqual(M.gradeLeak('no').correct, true);
  assert.strictEqual(M.gradeLeak('yes').correct, false);
  assert.strictEqual(M.gradeLeak(undefined).status, 'empty');
});

test('storyboard: six segments, contiguous 0-55 s, boundaries as briefed', () => {
  assert.deepStrictEqual(M.BOUNDARIES, [0, 9, 18, 28, 38, 47, 55]);
  M.SEGMENTS.forEach((s, i) => { if (i) assert.strictEqual(s.start, M.SEGMENTS[i - 1].end); });
  assert.strictEqual(M.storyVolume(0), 2); assert.strictEqual(M.storyVolume(9), 2);
  assert.strictEqual(M.storyVolume(15), 1); assert.strictEqual(M.storyVolume(55), 1);
  for (let t = 0; t <= 55; t += 0.25) { const V = M.storyVolume(t); assert.ok(V >= 1 && V <= 2); }
});

test('captions: full coverage, exact narration, phrase-level length', () => {
  const C = M.CUES;
  assert.strictEqual(C[0].start, 0);
  assert.strictEqual(C[C.length - 1].end, 55);
  for (let i = 1; i < C.length; i++) assert.strictEqual(C[i].start, C[i - 1].end, 'no gap/overlap at cue ' + i);
  for (const c of C) {
    assert.ok(c.end - c.start >= 1.5, 'cue long enough to read: ' + c.text);
    assert.ok(c.text.length <= 84, 'fits two caption lines: ' + c.text);
  }
  M.SEGMENTS.forEach((s, i) => assert.strictEqual(C.filter((c) => c.segment === i).map((c) => c.text).join(' '), s.narration));
  for (let t = 0; t < 55; t += 0.1) assert.ok(M.cueAt(t), 'cue at ' + t.toFixed(1));
});

test('captions.vtt on disk matches the generated cues', () => {
  const vtt = fs.readFileSync(path.join(__dirname, '..', 'captions.vtt'), 'utf8');
  assert.strictEqual(vtt, M.toVTT());
});

test('particles: 24 dots, fixed radius, enclosed, speeds unchanged across compression', () => {
  const sim = M.createSim();
  const initialSpeeds = M.speeds(sim.particles()).map((s) => s.toFixed(9));
  const radii = new Set();
  for (let t = 0; t <= 55; t += 0.5) {
    sim.seek(t, (tt) => M.gasTopY(M.storyVolume(tt)));
    const top = M.gasTopY(M.storyVolume(t));
    const parts = sim.particles();
    assert.strictEqual(parts.length, 24);
    for (const p of parts) {
      radii.add(p.r);
      assert.ok(p.x - p.r >= M.GEOM.innerLeft - 1e-9 && p.x + p.r <= M.GEOM.innerRight + 1e-9, 'x enclosed at t=' + t);
      assert.ok(p.y - p.r >= top - 1e-6 && p.y + p.r <= M.GEOM.bottom + 1e-9, 'y enclosed at t=' + t);
    }
    assert.deepStrictEqual(M.speeds(parts).map((s) => s.toFixed(9)), initialSpeeds, 'speeds unchanged at t=' + t);
  }
  assert.deepStrictEqual([...radii], [M.GEOM.particleRadius]);
});

test('particles enclosed at every slider volume (explore mode)', () => {
  const sim = M.createSim();
  for (const V of M.sliderValues()) {
    sim.advance(0.1, M.gasTopY(V));
    const top = M.gasTopY(V);
    for (const p of sim.particles()) assert.ok(p.y - p.r >= top - 1e-6 && p.y + p.r <= M.GEOM.bottom + 1e-9, 'V=' + V);
  }
  // Straight jump to the extreme: 4 L -> 0.5 L in one step.
  sim.advance(0.1, M.gasTopY(4)); sim.advance(0.01, M.gasTopY(0.5));
  for (const p of sim.particles()) assert.ok(p.y - p.r >= M.gasTopY(0.5) - 1e-6);
});

test('deterministic: fixed seed gives identical frames regardless of seek order', () => {
  const a = M.createSim(), b = M.createSim();
  const top = (tt) => M.gasTopY(M.storyVolume(tt));
  a.seek(33.5, top);
  b.seek(50, top); b.seek(10, top); b.seek(33.5, top);
  assert.deepStrictEqual(a.particles(), b.particles());
  assert.deepStrictEqual(M.initialParticles(), M.initialParticles());
});

test('piston height tracks volume linearly; cylinder cross-section fixed', () => {
  const h = (V) => M.GEOM.bottom - M.gasTopY(V);
  assert.ok(Math.abs(h(2) - 2 * h(1)) < 1e-9);
  assert.ok(Math.abs(h(4) - 8 * h(0.5)) < 1e-9);
});

test('colour contrast of the pairings used is at least 4.5:1', () => {
  const C = M.COLORS;
  const pairs = [['text', 'canvas'], ['teal', 'canvas'], ['rust', 'canvas'], ['text', 'surface'], ['teal', 'surface'], ['rust', 'surface'],
    ['white', 'teal'], ['white', 'rust'], ['canvas', 'text'], ['text', 'white'], ['teal', 'white'], ['rust', 'white']];
  for (const [a, b] of pairs) assert.ok(M.contrast(C[a], C[b]) >= 4.5, a + ' on ' + b + ' = ' + M.contrast(C[a], C[b]).toFixed(2));
});
