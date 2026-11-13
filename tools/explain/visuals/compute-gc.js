// compute-gc.js: pure helpers behind the Gen Chem pictures (batch B003 and
// later GC batches). No DOM. Shared by the renderers in chem-gc.js (browser)
// and scripts/explainers/build.mjs (node), so the numbers a picture draws are
// the numbers the build checked against the bank key.
//
// checkPanel(panel, keyText, choices) is the build's recomputation gate for
// the GC types: it evaluates the spec's `verify` block (the key and every trap
// route a note claims), the dimensional-analysis chain, the phase region, the
// crossover temperature, the half-life, ion electron counts, formula masses
// and sig-fig counts, and checks that every choice a picture names is a
// served choice and that the outlined place is the key.

export const R_ATM = 0.0821;          // L atm / (mol K), the value the bank stems give
export const LN2 = 0.693;

/* ------------------------------------------------ a small expression evaluator */
// Numbers (1.8e-5), names from vars, + - * / ^, parentheses, and the
// functions log (base 10), ln, sqrt, abs. Throws on anything else.
const FN = { log: Math.log10, log10: Math.log10, ln: Math.log, sqrt: Math.sqrt, abs: Math.abs };
export function evalExpr(expr, vars = {}) {
  const s = String(expr); let i = 0;
  const ws = () => { while (i < s.length && /\s/.test(s[i])) i++; };
  const peek = () => { ws(); return s[i]; };
  function primary() {
    const c = peek();
    if (c === '(') { i++; const v = sum(); if (peek() !== ')') throw new Error('missing ) in ' + s); i++; return v; }
    if (c === '-') { i++; return -power(); }
    if (c === '+') { i++; return power(); }
    const num = /^(\d+\.?\d*|\.\d+)(e[+-]?\d+)?/i.exec(s.slice(i));
    if (num) { i += num[0].length; return parseFloat(num[0]); }
    const id = /^[A-Za-z_][A-Za-z0-9_]*/.exec(s.slice(i));
    if (id) {
      i += id[0].length;
      if (peek() === '(') { const f = FN[id[0]]; if (!f) throw new Error('unknown function ' + id[0]); i++; const v = sum(); if (peek() !== ')') throw new Error('missing ) in ' + s); i++; return f(v); }
      if (!(id[0] in vars)) throw new Error('unknown name ' + id[0] + ' in ' + s);
      return +vars[id[0]];
    }
    throw new Error('cannot read "' + s.slice(i) + '" in ' + s);
  }
  function power() { const b = primary(); if (peek() === '^') { i++; return Math.pow(b, power()); } return b; }
  function product() { let v = power(); for (;;) { const c = peek(); if (c === '*') { i++; v *= power(); } else if (c === '/') { i++; v /= power(); } else return v; } }
  function sum() { let v = product(); for (;;) { const c = peek(); if (c === '+') { i++; v += product(); } else if (c === '-') { i++; v -= product(); } else return v; } }
  const v = sum(); ws();
  if (i < s.length) throw new Error('unread "' + s.slice(i) + '" in ' + s);
  if (!Number.isFinite(v)) throw new Error('not a finite number: ' + s);
  return v;
}

/* ------------------------------------------------- reading a number off a choice */
const SUP = { '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9', '⁻': '-', '⁺': '+' };
export function asciiNumberText(text) {
  let t = String(text).replace(/−/g, '-').replace(/×/g, 'x').replace(/,(?=\d{3})/g, '');
  t = t.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺]+/g, (m) => '^' + [...m].map((c) => SUP[c]).join(''));
  t = t.replace(/\^\(([+-]?\d+)\)/g, '^$1');
  return t;
}
// {value, tol} for the number a choice states, at the precision it states it;
// {pow: n} for a bare power of ten (10^17); null when there is no number.
export function choiceNumber(text) {
  let t = asciiNumberText(text);
  if (t.includes('=')) t = t.slice(t.lastIndexOf('=') + 1);
  t = t.trim();
  let m = /^([+-]?)10\^([+-]?\d+)\b/.exec(t);
  if (m) return { pow: +m[2], negative: m[1] === '-' };
  m = /([+-]?\d*\.?\d+)\s*x\s*10\^([+-]?\d+)/.exec(t);
  if (m) { const dec = (m[1].split('.')[1] || '').length, e = +m[2]; return { value: parseFloat(m[1]) * Math.pow(10, e), tol: 0.5 * Math.pow(10, e - dec) }; }
  m = /[+-]?\d*\.?\d+/.exec(t);
  if (m) {
    const dec = (m[0].split('.')[1] || '').length;
    // a whole number states its precision by its last nonzero digit: 24900 is good to the hundreds
    const zeros = m[0].includes('.') || /^[+-]?0+$/.test(m[0]) ? 0 : (/0+$/.exec(m[0]) || [''])[0].length;
    return { value: parseFloat(m[0]), tol: 0.5 * Math.pow(10, zeros - dec) };
  }
  return null;
}
// Does a computed value round to what the text states?
export function matches(value, text) {
  const n = choiceNumber(text);
  if (!n || !Number.isFinite(value)) return false;
  if (n.pow != null) return !n.negative && value > 0 && Math.abs(Math.log10(value) - n.pow) <= 0.5;
  return Math.abs(value - n.value) <= n.tol * (1 + 1e-9) + 1e-12 * Math.abs(n.value);
}

/* ------------------------------------------------------------ significant figures */
export function sigFigs(text) {
  const t = asciiNumberText(text).trim();
  const m = /^[+-]?(\d*)(\.(\d*))?/.exec(t);
  if (!m) return 0;
  const int = m[1] || '', frac = m[3] || '', hasPoint = !!m[2];
  const digits = (int + frac).replace(/^0+/, '');
  if (!digits) return hasPoint ? frac.length : 1;
  if (hasPoint) return digits.length;
  return digits.replace(/0+$/, '').length;     // "600" counts 1 (ambiguous trailing zeros)
}

/* -------------------------------------------------------------- formula masses */
const MASS = { H: 1, C: 12, N: 14, O: 16, F: 19, Na: 23, Mg: 24, S: 32, Cl: 35.5, K: 39, Ca: 40 };
const SUB = { '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4', '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9' };
export function formulaMass(formula) {
  const f = String(formula).replace(/[₀-₉]/g, (c) => SUB[c]);
  let total = 0, any = false;
  for (const m of f.matchAll(/([A-Z][a-z]?)(\d*)/g)) {
    if (!(m[1] in MASS)) throw new Error('no mass for ' + m[1] + ' in ' + formula);
    total += MASS[m[1]] * (m[2] ? +m[2] : 1); any = true;
  }
  if (!any) throw new Error('not a formula: ' + formula);
  return total;
}

/* ------------------------------------------------------------- the CO2 phase map */
// Boundary lines fitted through measured points (Clausius-Clapeyron form,
// ln P = a - b / T): sublimation through 194.7 K at 1 atm and the triple
// point; vaporization from the triple point to the critical point. The
// melting line rises steeply from the triple point.
export const CO2 = { triple: { T: 216.6, P: 5.11 }, critical: { T: 304.1, P: 73 }, sublimes1atm: 194.7 };
const lnP = (T0, P0, b, T) => Math.log(P0) + b * (1 / T0 - 1 / T);
const B_SUB = Math.log(CO2.triple.P / 1) / (1 / CO2.sublimes1atm - 1 / CO2.triple.T);
const B_VAP = Math.log(CO2.critical.P / CO2.triple.P) / (1 / CO2.triple.T - 1 / CO2.critical.T);
export function co2Boundary(kind, T) {
  if (kind === 'sublimation') return Math.exp(lnP(CO2.triple.T, CO2.triple.P, B_SUB, T));
  if (kind === 'vaporization') return Math.exp(lnP(CO2.triple.T, CO2.triple.P, B_VAP, T));
  if (kind === 'melting') return CO2.triple.P + (T - CO2.triple.T) * 60;   // atm per K, steep and leaning right (CO2 solid is denser)
  throw new Error('boundary ' + kind);
}
export function co2Phase(T, P) {
  if (T >= CO2.critical.T && P >= CO2.critical.P) return 'Supercritical fluid';
  if (T < CO2.triple.T) return P > co2Boundary('sublimation', T) ? 'Solid' : 'Gas';
  if (P > co2Boundary('melting', T)) return 'Solid';
  if (T < CO2.critical.T && P > co2Boundary('vaporization', T)) return 'Liquid';
  return 'Gas';
}

/* ------------------------------------------------------------------- kinetics */
export function firstOrder(A0, k, t) { return A0 * Math.exp(-k * t); }
export function halfLife(order, k, A0) {
  if (order === 0) return A0 / (2 * k);
  if (order === 1) return Math.LN2 / k;
  if (order === 2) return 1 / (k * A0);
  throw new Error('order ' + order);
}
// [A] at time t for order 0, 1 or 2 (zero order stops at 0)
export function concAt(order, k, A0, t) {
  if (order === 0) return Math.max(0, A0 - k * t);
  if (order === 1) return A0 * Math.exp(-k * t);
  if (order === 2) return 1 / (1 / A0 + k * t);
  throw new Error('order ' + order);
}

/* ---------------------------------------------------------------- the build gate */
const isObj = (o) => o && typeof o === 'object';
function named(p) { const out = []; (function walk(o) { if (Array.isArray(o)) o.forEach(walk); else if (isObj(o)) { if (typeof o.choice === 'string') out.push(o); Object.values(o).forEach(walk); } })(p); return out; }

export function checkPanel(p, keyText, choices) {
  const issues = [], checks = [];
  const served = new Set(choices);
  // 1. every choice the picture names is served; an outlined place is the key
  const nm = named(p);
  nm.forEach((o) => { if (!served.has(o.choice)) issues.push(p.type + ' names "' + o.choice + '", which is not a served choice'); });
  nm.filter((o) => o.key).forEach((o) => { if (o.choice !== keyText) issues.push(p.type + ' outlines "' + o.choice + '" as the answer, but the key is "' + keyText + '"'); });
  if (nm.length && !nm.some((o) => o.choice === keyText && o.key)) issues.push(p.type + ' names ' + nm.length + ' choices but does not outline the key');
  else if (nm.length) checks.push('picture names ' + new Set(nm.map((o) => o.choice)).size + ' of ' + choices.length + ' choices, each served; the outlined place is the key');

  // 2. the verify block: the key and each trap route the notes claim
  const v = p.verify;
  if (v) {
    const vars = Object.assign({}, v.vars || {});
    try {
      if (v.key != null) {
        const val = evalExpr(v.key, vars);
        if (v.keyIs != null) { if (String(v.keyIs) !== keyText) issues.push('verify.keyIs "' + v.keyIs + '" is not the key "' + keyText + '"'); }
        else if (!matches(val, keyText)) issues.push('verify: ' + v.key + ' = ' + +val.toPrecision(5) + ', which does not round to the key "' + keyText + '"');
        else checks.push('key recomputed: ' + v.key + ' = ' + +val.toPrecision(5) + ', rounds to "' + keyText + '"');
      }
      (v.routes || []).forEach((r) => {
        if (!served.has(r.choice)) { issues.push('verify route for "' + r.choice + '", which is not a served choice'); return; }
        if (r.choice === keyText) { issues.push('verify route given for the key'); return; }
        const val = evalExpr(r.expr, vars);
        if (!matches(val, r.choice)) issues.push('trap route ' + r.expr + ' = ' + +val.toPrecision(5) + ', which does not give "' + r.choice + '"');
        else checks.push('trap route recomputed: "' + r.choice + '" = ' + r.expr + ' = ' + +val.toPrecision(4));
      });
      (v.noRoute || []).forEach((c) => { if (!c || !served.has(c.choice)) issues.push('verify.noRoute needs {choice} with a served choice'); });
      if ((v.noRoute || []).length) checks.push('no single-slip route for ' + v.noRoute.map((c) => '"' + c.choice + '"').join(', ') + ' (the notes say so)');
    } catch (err) { issues.push('verify: ' + err.message); }
  }

  // 3. type-specific recomputation
  if (p.type === 'chem.ledger' && p.chain) {
    let prev = null, ok = true;
    p.chain.forEach((c, i) => {
      if (i === 0) { prev = c.value; return; }
      const want = c.op === '/' ? prev / c.by : c.op === 'x' ? prev * c.by : NaN;
      if (!(Math.abs(want - c.value) <= 0.006 * Math.abs(c.value))) { ok = false; issues.push('chain link ' + i + ': ' + prev + ' ' + c.op + ' ' + c.by + ' = ' + +want.toPrecision(4) + ', the box says ' + c.value); }
      prev = c.value;
    });
    const last = p.chain[p.chain.length - 1];
    if (last.key && !matches(last.value, keyText)) issues.push('chain ends at ' + last.value + ', which does not round to the key "' + keyText + '"');
    else if (ok) checks.push('chain recomputed link by link: ' + p.chain.map((c) => (c.op ? c.op + ' ' + c.by + ' = ' : '') + +(+c.value).toPrecision(4)).join(', '));
    (p.exits || []).forEach((x) => { if (x.value != null && !matches(x.value, x.choice)) issues.push('chain exit ' + x.value + ' does not give "' + x.choice + '"'); });
  }
  if (p.type === 'chem.ledger' && p.sigfigs) {
    p.sigfigs.filter((r) => !r.rule).forEach((r) => { const n = sigFigs(r.text); if (n !== r.sf) issues.push('sig figs of ' + r.text + ' count ' + n + ', the row says ' + r.sf); if (r.choice && r.choice !== r.text) issues.push('sig fig row ' + r.text + ' names the choice ' + r.choice); });
    const need = Math.min(...(p.sigfigs.filter((r) => r.input).map((r) => r.sf)));
    const key = p.sigfigs.find((r) => r.key);
    if (!key || sigFigs(keyText) !== need) issues.push('the key "' + keyText + '" does not carry the fewest input sig figs (' + need + ')');
    else checks.push('sig figs counted: inputs ' + p.sigfigs.filter((r) => r.input).map((r) => r.text + ' ' + r.sf).join(', ') + '; the key carries ' + need);
  }
  if (p.type === 'chem.ledger' && p.formulas) {
    const mm = p.formulas.molarMass;
    p.formulas.rows.forEach((r) => {
      try { const m = formulaMass(r.choice || r.formula); if (Math.abs(m - r.mass) > 0.01) issues.push('formula mass of ' + (r.choice || r.formula) + ' is ' + m + ', the row says ' + r.mass); } catch (err) { issues.push('formula: ' + err.message); }
    });
    const k = p.formulas.rows.find((r) => r.key);
    if (!k || k.choice !== keyText || Math.abs(formulaMass(keyText) - mm) > 0.01) issues.push('the key formula does not weigh the stem molar mass ' + mm);
    else checks.push('formula masses recomputed: ' + p.formulas.rows.map((r) => (r.formula || r.choice) + ' ' + r.mass).join(', ') + '; the key weighs ' + mm);
  }
  if (p.type === 'chem.ledger' && p.ice) {
    const cols = p.ice.cols.length;
    ['I', 'C', 'E'].forEach((k) => { if (!p.ice.rows[k] || p.ice.rows[k].length !== cols) issues.push('ICE row ' + k + ' needs ' + cols + ' cells'); });
  }
  if (p.type === 'chem.gas' && p.states) {
    const st = p.states;
    st.forEach((s, i) => { if (s.V != null && s.P != null && s.T != null && s.n != null) { const V = s.n * R_ATM * s.T / s.P; if (!(Math.abs(V - s.V) <= 0.006 * s.V)) issues.push('state ' + (i + 1) + ': nRT / P = ' + V.toFixed(2) + ' L, the drawing says ' + s.V); } });
    if (st.length === 2 && st[0].V != null && st[1].V != null && st[0].n == null) {
      const V2 = st[0].V * st[0].P / st[1].P * st[1].T / st[0].T;
      if (!(Math.abs(V2 - st[1].V) <= 0.006 * st[1].V)) issues.push('combined gas law gives ' + V2.toFixed(3) + ' L, the drawing says ' + st[1].V);
      else checks.push('combined gas law recomputed: ' + st[0].V + ' x ' + st[0].P + '/' + st[1].P + ' x ' + st[1].T + '/' + st[0].T + ' = ' + V2.toFixed(3) + ' L');
    }
  }
  if (p.type === 'chem.gas' && p.mixture) {
    const g = p.mixture.gases, tot = g.reduce((a, x) => a + x.P, 0);
    g.forEach((x) => { if (x.n != null && p.mixture.V && p.mixture.T) { const P = x.n * R_ATM * p.mixture.T / p.mixture.V; if (!(Math.abs(P - x.P) <= 0.006 * x.P)) issues.push(x.name + ': nRT / V = ' + P.toFixed(3) + ' atm, the drawing says ' + x.P); } });
    checks.push('mixture: ' + g.map((x) => x.name + ' ' + x.P + ' atm').join(' + ') + ' = ' + +tot.toFixed(3) + ' atm total; shares ' + g.map((x) => x.name + ' ' + (x.P / tot).toFixed(3)).join(', '));
  }
  if (p.type === 'chem.curve' && p.kind === 'phase') {
    const ph = co2Phase(p.point.T, p.point.P);
    if (ph !== keyText) issues.push('the CO2 phase map puts ' + p.point.T + ' K and ' + p.point.P + ' atm in the ' + ph + ' region, the key is ' + keyText);
    else checks.push('phase region recomputed from the boundary fits: ' + p.point.T + ' K, ' + p.point.P + ' atm is ' + ph + ' (liquid-gas line there at ' + co2Boundary('vaporization', p.point.T).toFixed(1) + ' atm; dry ice sublimes at ' + CO2.sublimes1atm + ' K at 1 atm)');
  }
  if (p.type === 'chem.curve' && p.kind === 'gibbs') {
    const Tc = p.dH * 1000 / p.dS;
    const side = p.dH < 0 && p.dS < 0 ? 'Below' : p.dH > 0 && p.dS > 0 ? 'Above' : null;
    if (!side || !new RegExp('^' + side + '\\b').test(keyText) || !matches(Tc, keyText)) issues.push('dG = 0 at ' + Tc + ' K; spontaneous ' + (side || 'at all or no T') + ', the key is "' + keyText + '"');
    else checks.push('crossover recomputed: T = dH / dS = ' + p.dH * 1000 + ' J / ' + p.dS + ' J/K = ' + Tc + ' K; spontaneous ' + side.toLowerCase() + ' it');
  }
  if (p.type === 'chem.curve' && p.kind === 'decay') {
    const t = halfLife(1, p.k, 1);
    if (!matches(t, keyText)) issues.push('first-order half-life ln 2 / k = ' + t.toFixed(3) + ', the key is ' + keyText);
    else checks.push('half-life recomputed: ln 2 / ' + p.k + ' = ' + t.toFixed(3) + ' ' + (p.unit || ''));
  }
  if (p.type === 'chem.curve' && p.kind === 'half-lives') {
    const consts = p.orders.filter((o) => { const A0 = 1, t1 = halfLife(o.order, o.k, A0), t2 = halfLife(o.order, o.k, A0 / 2); return Math.abs(t1 - t2) < 1e-9; });
    if (consts.length !== 1 || !consts[0].key || consts[0].choice !== keyText) issues.push('exactly one drawn order should have a constant half-life and be the key');
    else checks.push('half-lives recomputed: only order ' + consts[0].order + ' keeps the same half-life from [A]0 and [A]0/2');
  }
  if (p.type === 'chem.orbital' && p.ions) {
    const e = p.ions.map((x) => x.Z - x.charge);
    if (new Set(e).size !== 1 || e[0] !== p.electrons) issues.push('ion electron counts ' + e.join(', ') + ' are not all ' + p.electrons);
    p.ions.forEach((x) => { if (x.choice && !new RegExp('Z = ' + x.Z + '\\)').test(x.choice)) issues.push('ion row Z ' + x.Z + ' does not match "' + x.choice + '"'); });
    const k = p.ions.find((x) => x.key);
    if (!k || k.charge !== p.charge) issues.push('the key ion should carry the asked charge ' + p.charge);
    else checks.push('electrons recomputed as Z minus charge: ' + p.ions.map((x) => x.Z + ' - (' + x.charge + ') = ' + (x.Z - x.charge)).join(', ') + '; only the key carries ' + (p.charge > 0 ? '+' : '') + p.charge);
  }
  if (p.type === 'chem.energy' && p.kind === 'levels') {
    const by = Object.fromEntries(p.points.map((x) => [x.id, x.y]));
    (p.arrows || []).forEach((a) => { if (a.value != null && Math.abs(by[a.to] - by[a.from] - a.value) > 1e-9) issues.push('arrow ' + a.from + ' to ' + a.to + ' says ' + a.value + ', the levels give ' + (by[a.to] - by[a.from])); });
    const ka = (p.arrows || []).find((a) => a.key);
    if (!ka || !matches(by[ka.to] - by[ka.from], keyText)) issues.push('the outlined arrow does not give the key ' + keyText);
    else checks.push('level diagram recomputed: ' + (p.arrows || []).map((a) => a.from + ' to ' + a.to + ' ' + (by[a.to] - by[a.from])).join(', '));
  }
  if (p.type === 'chem.cell' && p.view === 'concentration') {
    const E = (0.0592 / p.n) * Math.log10(p.cathodeM / p.anodeM);
    if (!(p.cathodeM > p.anodeM)) issues.push('a concentration cell plates out on the concentrated side: the cathode must be the more concentrated side');
    if (!matches(E, keyText)) issues.push('Nernst gives ' + E.toFixed(4) + ' V, the key is ' + keyText);
    else checks.push('Nernst recomputed: (0.0592 / ' + p.n + ') log(' + p.cathodeM + ' / ' + p.anodeM + ') = ' + E.toFixed(4) + ' V; cathode on the ' + p.cathodeM + ' M side');
  }
  if (p.type === 'chem.cell' && p.view === 'e-to-k') {
    const logK = p.n * p.E / 0.0592;
    if (!matches(Math.pow(10, logK), keyText)) issues.push('log K = ' + logK.toFixed(3) + ', the key is ' + keyText);
    else checks.push('log K recomputed: ' + p.n + ' x ' + p.E + ' / 0.0592 = ' + logK.toFixed(2));
  }
  if (p.type === 'chem.lewis' && p.domains) {
    const m = p.molecule, c = m.centralAtom;
    const bonds = m.bondPattern.filter((b) => b.atomA === c || b.atomB === c).length, lp = m.lonePairCounts[c] || 0, n = bonds + lp;
    const HYB = { 2: 'sp', 3: 'sp^2', 4: 'sp^3', 5: 'sp^3d', 6: 'sp^3d^2', 7: 'sp^3d^3' };
    p.domains.ladder.forEach((x) => { const lab = String(x.label).replace(/[{}]/g, ''); if (HYB[x.n] && HYB[x.n] !== lab) issues.push('domain ladder: ' + x.n + ' domains is ' + HYB[x.n] + ', the chip says ' + x.label); });
    const k = p.domains.ladder.find((x) => x.key);
    if (!k || k.n !== n) issues.push('the outlined domain count should be ' + n + ' (' + bonds + ' bonds + ' + lp + ' lone pairs)');
    else checks.push('domains recomputed: ' + bonds + ' bonds + ' + lp + ' lone pairs = ' + n + ', ' + HYB[n]);
  }
  return { issues, checks };
}
