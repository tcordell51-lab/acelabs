// compute.js: the numbers behind the explainer pictures, as pure functions.
// Imported by the renderers (browser) and by scripts/explainers/build.mjs
// (node), so the build checks exactly the curve and the marks the student
// sees. No DOM.

// Weak acid HA (molarity, volumeMl, Ka) titrated with a strong base
// (molarity): pH after vb mL of base, from the exact charge balance
// [H+] + [Na+] = [OH-] + [A-], solved by bisection on pH.
export function titrationPH(analyte, titrant, vb) {
  const Kw = 1e-14, Va = analyte.volumeMl, V = Va + vb;
  const CA = analyte.molarity * Va / V, Na = titrant.molarity * vb / V;
  let lo = 0, hi = 14;
  for (let i = 0; i < 200; i++) {
    const pH = (lo + hi) / 2, H = Math.pow(10, -pH);
    const f = H + Na - Kw / H - CA * analyte.Ka / (analyte.Ka + H);   // f falls as pH rises
    if (f > 0) lo = pH; else hi = pH;
  }
  return (lo + hi) / 2;
}
export function equivalenceMl(spec) {
  return spec.analyte.molarity * spec.analyte.volumeMl / spec.titrant.molarity;
}
// The volume at each named landmark.
export function landmarkMl(spec, at) {
  const veq = equivalenceMl(spec);
  const map = { start: 0, 'half-equivalence': veq / 2, equivalence: veq };
  if (!(at in map)) throw new Error('unknown titration landmark ' + at);
  return map[at];
}
// Marks with their volume and pH filled in (pH to 2 decimals, as a choice reads).
export function titrationMarks(spec) {
  return spec.marks.map((m) => {
    const vb = landmarkMl(spec, m.at);
    return Object.assign({}, m, { vb, pH: +titrationPH(spec.analyte, spec.titrant, vb).toFixed(2) });
  });
}
// The curve the picture draws: every 0.25 mL from 0 to xMaxMl.
export function titrationCurve(spec) {
  const out = [];
  for (let x = 0; x <= spec.xMaxMl + 1e-9; x += 0.25) out.push([+x.toFixed(2), +titrationPH(spec.analyte, spec.titrant, x).toFixed(3)]);
  return out;
}

// Third side from two sides and the angle between them.
export function lawOfCosines(a, b, angleDeg) {
  return Math.sqrt(a * a + b * b - 2 * a * b * Math.cos(angleDeg * Math.PI / 180));
}
