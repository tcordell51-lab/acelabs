// compute-qr-plot.js: pure helpers behind the QR pictures of batch B006 on
// (qr.dataset, qr.plane, and the qr.tree kinds slots and mix). No DOM. Shared
// by the renderers in qr-plot.js (browser) and scripts/explainers/build.mjs
// (node), so every number a picture draws is the number the build checked.
//
// checkPlot(panel, keyText, choices, ctx) is the build gate for those panels:
// it runs compute-qr.js checkPanel (the check block: the key and the route
// behind every trap note, inputs found in the stem; the choices the picture
// names; the arithmetic in the explainer's words), with choices written in pi
// ("(25π/4) − 6") read as numbers, then recomputes what the picture draws:
// slot products and the groups-times-orders split, mixture amounts and the
// strength the mix lands on, variance, z scores, slope, distance, the unit
// circle point and an inscribed right triangle.
import * as Q from './compute-qr.js';
import { evalExpr, asciiNumberText } from './compute-gc.js';

const EPS = 1e-9;
const close = (a, b, tol = EPS) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(a), Math.abs(b));

/* ----------------------------------------------------------------- counting */
export const fact = (n) => (n <= 1 ? 1 : n * fact(n - 1));
// k ordered slots filled from a pool of n with no repeats
export function slots(n, k) {
  const factors = Array.from({ length: k }, (_, i) => n - i);
  const product = factors.reduce((a, b) => a * b, 1), orders = fact(k);
  return { factors, product, orders, groups: product / orders, repeat: Math.pow(n, k) };
}

/* ----------------------------------------------------------------- mixtures */
// pours: [{v, pct}] -> solute in each pour, the total, and the strength of the mix
export function mix(pours) {
  const solute = pours.map((p) => p.v * p.pct / 100);
  const v = pours.reduce((a, p) => a + p.v, 0), s = solute.reduce((a, b) => a + b, 0);
  return { solute, v, s, pct: 100 * s / v };
}

/* --------------------------------------------------------------- statistics */
export const mean = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;
export function variance(xs) { const m = mean(xs); return xs.reduce((a, x) => a + (x - m) * (x - m), 0) / xs.length; }
export const zscore = (x, mu, sd) => (x - mu) / sd;
// the normal density, for the drawn bell
export const bell = (z) => Math.exp(-z * z / 2);

/* ---------------------------------------------------------------- the plane */
export const slope = (p, q) => (q.y - p.y) / (q.x - p.x);
export const dist = (p, q) => Math.hypot(q.x - p.x, q.y - p.y);
const QUAD_SIGN = { 1: [1, 1], 2: [-1, 1], 3: [-1, -1], 4: [1, -1] };
// the point on the unit circle with this cosine, in this quadrant
export function unitPoint(cos, quadrant) {
  const sg = QUAD_SIGN[quadrant];
  if (!sg) throw new Error('quadrant ' + quadrant);
  if (Math.sign(cos) !== sg[0] && cos !== 0) throw new Error('cos ' + cos + ' has the other sign from quadrant ' + quadrant);
  return { x: cos, y: sg[1] * Math.sqrt(1 - cos * cos) };
}
// a right triangle with legs a and b inscribed so its hypotenuse is a diameter
export function inscribed(a, b) {
  const c = Math.hypot(a, b), r = c / 2;
  // the right-angle vertex on the circle: from the left end of the diameter, a along the leg
  const t = Math.atan2(b, a);   // angle at the left end, between the diameter and leg a
  const P = { x: -r + a * Math.cos(t), y: a * Math.sin(t) };
  return { c, r, circle: Math.PI * r * r, triangle: a * b / 2, region: Math.PI * r * r - a * b / 2, P, A: { x: -r, y: 0 }, B: { x: r, y: 0 } };
}

/* ------------------------------------------------------- choices written in pi */
// "(25π/4) − 6", "5π − 12" -> a number; null when the text holds no pi
export function piValue(text) {
  const t = asciiNumberText(String(text)).replace(/π/g, 'pi');
  if (!/pi/.test(t)) return null;
  const e = t.replace(/(\d|\))\s*pi/g, '$1*pi').replace(/\s+/g, ' ');
  try { return evalExpr(e, { pi: Math.PI }); } catch (err) { return null; }
}
const numText = (t) => { const v = piValue(t); return v == null ? t : v.toFixed(6); };
function mapChoices(o) {
  if (Array.isArray(o)) return o.map(mapChoices);
  if (o && typeof o === 'object') { const out = {}; for (const [k, v] of Object.entries(o)) out[k] = k === 'choice' && typeof v === 'string' ? numText(v) : mapChoices(v); return out; }
  return o;
}

/* ------------------------------------------------------------------ the gate */
export const PLOT_TYPES = ['qr.dataset', 'qr.plane'];
export const TREE_KINDS = ['slots', 'mix'];
export const DATASET_KINDS = ['dots', 'normal'];
export const PLANE_KINDS = ['distance', 'slope', 'unit-circle', 'inscribed'];
export const isPlot = (p) => PLOT_TYPES.includes(p.type) || (p.type === 'qr.tree' && TREE_KINDS.includes(p.kind));

const num = (s) => { const v = piValue(s); if (v != null) return v; const m = /[-+]?\d*\.?\d+/.exec(asciiNumberText(String(s)).replace(/,/g, '')); return m ? +m[0] : NaN; };
const fmt = (v) => +(+v).toPrecision(6);

export function checkPlot(p, keyText, choices, ctx = {}) {
  const issues = [], checks = [];
  // 1. the check block, named choices and the arithmetic in the text (compute-qr.js), pi read as numbers
  const r = Q.checkPanel(mapChoices(p), numText(keyText), choices.map(numText), ctx);
  const back = (msg) => choices.reduce((m, c) => (numText(c) === c ? m : m.split('"' + numText(c) + '"').join('"' + c + '" (' + numText(c) + ')')), msg);
  issues.push(...r.issues.map(back)); checks.push(...r.checks.map(back));
  // 2. what the picture draws
  try { drawn(p, keyText, choices, issues, checks); } catch (err) { issues.push(p.type + ' picture check: ' + err.message); }
  return { issues, checks };
}
const choiceIs = (o, choices, issues, what) => { if (o && o.choice != null && !choices.includes(o.choice)) issues.push(what + ' names "' + o.choice + '", which is not a served choice'); };

function drawn(p, keyText, choices, issues, checks) {
  const kv = num(keyText);
  if (p.type === 'qr.tree' && p.kind === 'slots') {
    const S = slots(p.pool, p.slots.length);
    if (p.result.choice !== keyText || !close(S.product, kv)) issues.push('slots: ' + S.factors.join(' x ') + ' = ' + S.product + ', the key is ' + keyText);
    else checks.push('slots recomputed: ' + S.factors.join(' x ') + ' = ' + S.product + ', the key');
    if (p.groups) {
      if (p.groups.n !== S.groups || (p.groups.orders && p.groups.orders !== S.orders)) issues.push('slots: ' + S.product + ' orders are ' + S.groups + ' groups of ' + S.orders + ' orders each, the picture says ' + p.groups.n + ' x ' + p.groups.orders);
      else checks.push('groups recomputed: C(' + p.pool + ', ' + p.slots.length + ') = ' + S.groups + ' groups x ' + S.orders + ' orders each = ' + S.product);
      if (p.groups.choice && !close(num(p.groups.choice), S.groups)) issues.push('slots groups ' + S.groups + ' is not the choice "' + p.groups.choice + '"');
    }
    if (p.repeat && p.repeat.choice && !close(num(p.repeat.choice), S.repeat)) issues.push('slots with repeats give ' + S.repeat + ', not "' + p.repeat.choice + '"');
    [p.result, p.groups, p.repeat].forEach((o) => choiceIs(o, choices, issues, 'slots'));
  }
  if (p.type === 'qr.tree' && p.kind === 'mix') {
    const M = mix(p.pours);
    if (p.total != null && !close(M.v, p.total.v)) issues.push('mix: the pours add to ' + M.v + ', the whole says ' + p.total.v);
    if (p.target != null && !close(M.pct, p.target)) issues.push('mix: the pours make ' + fmt(M.pct) + ' percent, the stem asks for ' + p.target);
    p.pours.forEach((pr, i) => { if (pr.solute != null && !close(pr.solute, M.solute[i])) issues.push('mix: ' + pr.v + ' at ' + pr.pct + ' percent holds ' + M.solute[i] + ', the box says ' + pr.solute); choiceIs(pr, choices, issues, 'mix pour'); if (pr.choice && !close(num(pr.choice), pr.v)) issues.push('mix pour ' + pr.v + ' is not the choice "' + pr.choice + '"'); if (pr.key && pr.choice !== keyText) issues.push('mix outlines the pour "' + pr.choice + '", but the key is ' + keyText); });
    if (p.result && p.result.key) { if (p.result.choice !== keyText || Math.abs(M.pct - kv) > 0.005 + EPS) issues.push('mix: ' + M.s + ' / ' + M.v + ' = ' + fmt(M.pct) + ' percent, the key is ' + keyText); }
    checks.push('mixture recomputed: ' + p.pours.map((pr, i) => pr.v + ' at ' + pr.pct + ' percent = ' + fmt(M.solute[i])).join(', ') + '; ' + fmt(M.s) + ' of ' + M.v + ' = ' + fmt(M.pct) + ' percent');
    const lo = Math.min(...p.pours.map((x) => x.pct)), hi = Math.max(...p.pours.map((x) => x.pct));
    if (!(M.pct > lo - EPS && M.pct < hi + EPS)) issues.push('mix lands outside its parts');
    if (p.lever) {
      if (!(p.lever.min <= lo && p.lever.max >= hi)) issues.push('mix lever ' + p.lever.min + ' to ' + p.lever.max + ' does not hold both strengths');
      (p.lever.marks || []).forEach((m) => { choiceIs(m, choices, issues, 'mix lever'); if (m.choice && !close(num(m.choice), m.at, 1e-3)) issues.push('lever mark at ' + m.at + ' is not the choice "' + m.choice + '"'); if (m.at < p.lever.min || m.at > p.lever.max) issues.push('lever mark ' + m.at + ' is off the line'); if (m.expr != null) { const v = evalExpr(String(m.expr)); if (Math.abs(v - m.at) > 0.005) issues.push('lever mark ' + m.label + ': ' + m.expr + ' = ' + fmt(v) + ', drawn at ' + m.at); } });
      if (p.lever.balance) { const d = p.pours.map((x) => Math.abs(x.pct - M.pct)); if (!close(p.pours[0].v * d[0], p.pours[1].v * d[1])) issues.push('lever does not balance: ' + p.pours[0].v + ' x ' + d[0] + ' vs ' + p.pours[1].v + ' x ' + d[1]); else checks.push('lever balances: ' + p.pours[0].v + ' x ' + fmt(d[0]) + ' = ' + p.pours[1].v + ' x ' + fmt(d[1])); }
    }
  }
  if (p.type === 'qr.dataset' && p.kind === 'dots') {
    p.rows.forEach((row, i) => {
      const v = variance(row.values), m = mean(row.values);
      if (row.mean != null && !close(row.mean, m)) issues.push('dot row ' + (i + 1) + ': mean ' + m + ', drawn ' + row.mean);
      if (row.variance != null && !close(row.variance, v)) issues.push('dot row ' + (i + 1) + ': variance ' + v + ', the label says ' + row.variance);
      row.values.forEach((x) => { if (x < p.min || x > p.max) issues.push('dot ' + x + ' is off the line'); });
      if (row.key && (row.choice !== keyText || !close(v, kv))) issues.push('dot row ' + (i + 1) + ' is outlined, its variance is ' + v + ', the key is ' + keyText);
      choiceIs(row, choices, issues, 'dot row');
      checks.push('dot row ' + (i + 1) + ' recomputed: ' + row.values.join(', ') + ', mean ' + fmt(m) + ', variance ' + fmt(v));
    });
  }
  if (p.type === 'qr.dataset' && p.kind === 'normal') {
    const z = zscore(p.value, p.mean, p.sd);
    if (Math.abs(z - kv) > 0.005 + EPS) issues.push('z = (' + p.value + ' - ' + p.mean + ') / ' + p.sd + ' = ' + fmt(z) + ', the key is ' + keyText);
    else checks.push('z score recomputed: (' + p.value + ' - ' + p.mean + ') / ' + p.sd + ' = ' + fmt(z) + ', the key');
    if (!(Math.abs(z) <= (p.span || 3))) issues.push('the value sits off the drawn curve');
    (p.marks || []).forEach((m) => { choiceIs(m, choices, issues, 'normal curve'); if (m.key && m.choice !== keyText) issues.push('normal curve outlines "' + m.choice + '", not the key'); });
  }
  if (p.type === 'qr.plane') {
    const [P1, P2] = p.points || [];
    if (p.kind === 'distance') {
      const d = dist(P1, P2), dx = Math.abs(P2.x - P1.x), dy = Math.abs(P2.y - P1.y);
      if (Math.abs(d - kv) > 0.005 + EPS) issues.push('distance ' + fmt(d) + ', the key is ' + keyText);
      else checks.push('distance recomputed: legs ' + dx + ' and ' + dy + ', root ' + (dx * dx + dy * dy) + ' = ' + fmt(d) + ', the key');
      if (p.walk && p.walk.choice && !close(num(p.walk.choice), dx + dy)) issues.push('grid walk ' + (dx + dy) + ' is not "' + p.walk.choice + '"');
    }
    if (p.kind === 'slope') {
      const m = slope(P1, P2);
      if (Math.abs(m - kv) > 0.005 + EPS) issues.push('slope ' + fmt(m) + ', the key is ' + keyText);
      else checks.push('slope recomputed: (' + P2.y + ' - (' + P1.y + ')) / (' + P2.x + ' - (' + P1.x + ')) = ' + (P2.y - P1.y) + ' / ' + (P2.x - P1.x) + ' = ' + fmt(m) + ', the key');
    }
    if (p.kind === 'unit-circle') {
      const U = unitPoint(p.cos, p.quadrant);
      if (Math.abs(U.y - kv) > 0.005 + EPS) issues.push('the unit circle point in quadrant ' + p.quadrant + ' has sine ' + fmt(U.y) + ', the key is ' + keyText);
      else checks.push('unit circle recomputed: cos ' + p.cos + ' in quadrant ' + p.quadrant + ' gives sin = ' + fmt(U.y) + ' (1 - ' + fmt(p.cos * p.cos) + ' = ' + fmt(1 - p.cos * p.cos) + '), the key');
      if (p.ghost) { const G = unitPoint(p.cos, p.ghost.quadrant); if (p.ghost.choice && !close(num(p.ghost.choice), G.y, 1e-3)) issues.push('ghost point in quadrant ' + p.ghost.quadrant + ' has sine ' + fmt(G.y) + ', not "' + p.ghost.choice + '"'); }
    }
    if (p.kind === 'inscribed') {
      const T = inscribed(p.legs[0], p.legs[1]);
      if (p.hyp != null && !close(p.hyp, T.c)) issues.push('legs ' + p.legs.join(' and ') + ' give hypotenuse ' + T.c + ', the picture says ' + p.hyp);
      const k = piValue(keyText);
      if (k == null || !close(k, T.region, 1e-9)) issues.push('circle ' + fmt(T.circle) + ' minus triangle ' + T.triangle + ' = ' + fmt(T.region) + ', the key reads ' + keyText);
      else checks.push('inscribed triangle recomputed: hypotenuse ' + T.c + ' is the diameter, r = ' + T.r + ', circle ' + fmt(T.circle) + ' minus triangle ' + T.triangle + ' = ' + fmt(T.region) + ', the key; the right-angle vertex sits on the circle');
      if (!close(Math.hypot(T.P.x, T.P.y), T.r)) issues.push('the right-angle vertex is off the circle');
    }
    (p.points || []).forEach((pt) => { if (p.x && (pt.x < p.x[0] || pt.x > p.x[1])) issues.push('point (' + pt.x + ', ' + pt.y + ') is off the grid'); if (p.y && (pt.y < p.y[0] || pt.y > p.y[1])) issues.push('point (' + pt.x + ', ' + pt.y + ') is off the grid'); });
    [p.result, p.walk, p.ghost].forEach((o) => choiceIs(o, choices, issues, p.type));
    if (p.result && p.result.key && p.result.choice !== keyText) issues.push(p.type + ' outlines "' + p.result.choice + '", but the key is ' + keyText);
  }
}
