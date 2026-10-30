// qr-plot.js: the QR pictures of batch B006 onward.
//
//   qr.tree kind slots    ordered slots filled from a shrinking pool (dots
//                         greyed as each slot takes one), the product, then
//                         the same count split as groups times orders
//   qr.tree kind mix      two pours split into how much of each is solute, the
//                         join, and a lever: the mix lands between the two
//                         strengths, closer to the bigger pour
//   qr.dataset kind dots  dot plots on one axis, the mean marked, each dot's
//                         distance from it
//   qr.dataset kind normal  a bell over the mean plus or minus three standard
//                         deviations, value and z labels on every tick, the
//                         asked value marked and its distance to the mean
//   qr.plane kinds        distance (the hidden right triangle), slope (run and
//                         rise arrows, each with its sign), unit-circle (the
//                         quadrant signs and the point), inscribed (a right
//                         triangle whose hypotenuse is a diameter, the region
//                         between shaded)
//
// Every number a picture draws is computed from the spec with the helpers the
// build gate runs (compute-qr-plot.js); every word comes from the spec. Drawn
// at the width shown, text at 12 px or larger, labels with a white halo where
// a line could cross them, the key's place outlined and named in words.
import { register, C, FONT, r1, svgOpen, width, esc, uid, wrap } from './core.js';
import { TREE_KINDS } from './qr.js';
import * as P from './compute-qr-plot.js';

/* ------------------------------------------------------------------ helpers */
const MARK = /([A-Za-z0-9\])])\^([+-]?[0-9A-Za-z.]*[0-9A-Za-z])/g;
function parts(str) {
  const out = []; let last = 0, m; const s = String(str == null ? '' : str);
  MARK.lastIndex = 0;
  while ((m = MARK.exec(s))) { out.push({ s: s.slice(last, m.index) + m[1] }); out.push({ s: m[2], sup: true }); last = m.index + m[0].length; }
  out.push({ s: s.slice(last) });
  return out.filter((p) => p.s);
}
function measure(str, size, bold) {
  let w = 0;
  for (const p of parts(str)) for (const ch of p.s) w += (/[A-Z0-9]/.test(ch) ? 0.62 : /[a-z]/.test(ch) ? 0.53 : ch === ' ' ? 0.28 : 0.4) * (p.sup ? 0.85 : 1);
  return w * size * (bold ? 1.08 : 1);
}
// SVG text with ^ typeset (superscripts never under 12 px); halo for labels a line may cross
function rt(x, y, str, o = {}) {
  const size = o.size || 13, small = Math.max(12, +(size * 0.82).toFixed(1));
  const a = [`x="${r1(x)}"`, `y="${r1(y)}"`, `font-size="${size}"`, `fill="${o.fill || C.ink}"`, `font-family="${FONT}"`];
  if (o.anchor) a.push(`text-anchor="${o.anchor}"`);
  if (o.weight) a.push(`font-weight="${o.weight}"`);
  if (o.italic) a.push('font-style="italic"');
  if (o.halo) a.push('paint-order="stroke" stroke="#fff" stroke-width="4" stroke-linejoin="round"');
  const inner = parts(str).map((p) => p.sup ? `<tspan font-size="${small}" baseline-shift="super">${esc(p.s)}</tspan>` : esc(p.s)).join('');
  return `<text ${a.join(' ')}>${inner}</text>`;
}
const ROLE = {
  key: { fill: C.keyBg, stroke: C.key, ink: C.key, w: 2.2 },
  trap: { fill: C.trapBg, stroke: C.trap, ink: '#6b3000', w: 1.3 },
  plain: { fill: '#f7f9f8', stroke: '#c9d3cd', ink: C.ink, w: 1.1 },
  info: { fill: C.blueBg, stroke: C.blue, ink: '#123a7a', w: 1.2 }
};
// one outlined label; y is the baseline
function tag(x, y, label, role = 'plain', o = {}) {
  const size = o.size || 12.5, R = ROLE[role] || ROLE.plain, w = measure(label, size, true) + 14;
  const top = y - size - 3, bottom = y + 6;
  const x0 = o.anchor === 'end' ? x - w : o.anchor === 'middle' ? x - w / 2 : x;
  return { w, x0, x1: x0 + w, top, bottom, svg: `<rect x="${r1(x0)}" y="${r1(top)}" width="${r1(w)}" height="${r1(bottom - top)}" rx="5" fill="${R.fill}" stroke="${R.stroke}" stroke-width="${R.w}"/>` + rt(x0 + w / 2, y, label, { size, weight: 700, anchor: 'middle', fill: R.ink }) };
}
// a boxed note that wraps to its width; returns {svg, h}
function note(x, y, w, text, role = 'plain', o = {}) {
  const size = o.size || 13, R = ROLE[role] || ROLE.plain, lines = wrap(text, w - 18, size), lh = size + 5;
  const h0 = lines.length * lh + 12;
  let svg = `<rect x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="${r1(h0)}" rx="7" fill="${R.fill}" stroke="${R.stroke}" stroke-width="${role === 'key' ? 2.4 : R.w}"${role === 'trap' ? ' stroke-dasharray="5 3"' : ''}/>`;
  lines.forEach((ln, i) => { svg += rt(x + 9, y + 6 + size + i * lh, ln, { size, weight: o.weight || (role === 'key' ? 700 : 400), fill: R.ink }); });
  return { svg, h: h0 };
}
// labels on one row under a line, stacked in levels (0 nearest the line) so no two
// overlap and no leader line (straight down from its anchor) crosses a nearer label.
// Converges by relaxation; a cycle stops at the pass cap instead of looping.
function levels(items, size, W, gap = 8) {
  const L = items.slice().sort((a, b) => a.x - b.x).map((it) => {
    const w = measure(it.text, size, true) + 14, x0 = Math.max(2, Math.min(W - 2 - w, it.x - w / 2));
    return { it, lv: 0, x0, x1: x0 + w, w };
  });
  const overlap = (a, b) => !(a.x0 > b.x1 + gap || a.x1 < b.x0 - gap);
  const covers = (a, b) => b.it.x > a.x0 - 3 && b.it.x < a.x1 + 3;   // b's leader passes through a's span
  const put = (a, x0) => { a.x0 = Math.max(2, Math.min(W - 2 - a.w, x0)); a.x1 = a.x0 + a.w; };
  for (let i = 0; i + 1 < L.length; i++) { const a = L[i], b = L[i + 1]; if (covers(a, b) && covers(b, a)) { put(a, a.it.x + 10 - a.w); put(b, b.it.x - 10); } }
  for (let pass = 0; pass < 40; pass++) {
    let moved = false;
    for (let i = 0; i < L.length; i++) for (let k = 0; k < L.length; k++) {
      if (i === k) continue;
      const a = L[i], b = L[k];
      if (k > i && a.lv === b.lv && overlap(a, b)) { b.lv++; moved = true; }
      if (covers(a, b) && b.lv >= a.lv && !covers(b, a)) { a.lv = b.lv + 1; moved = true; }
    }
    if (!moved) break;
  }
  return L;
}
function arrowDef(id, color) { return `<marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="9" markerHeight="9" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${color}"/></marker>`; }
const n2 = (v, dp = 2) => { const x = +(+v).toFixed(dp); return String(x); };
const roleOf = (o) => (o && o.key ? 'key' : o && o.trap ? 'trap' : o && o.info ? 'info' : 'plain');

/* ============================================================ qr.tree: slots */
TREE_KINDS.slots = (s, box) => {
  const W = width(box), k = s.slots.length, S = P.slots(s.pool, k);
  const xw = 18, colW = Math.min(150, Math.floor((W - 12 - (k - 1) * xw) / k)), totalW = k * colW + (k - 1) * xw, x0 = (W - totalW) / 2;
  const per = Math.ceil(s.pool / 2), dr = Math.min(6, (colW - 16) / (per * 2.7)), dx = dr * 2.7;
  let g = '', y = 6;
  if (s.title) { g += rt(W / 2, y + 13, s.title, { size: 13, weight: 700, anchor: 'middle', fill: C.ink2 }); y += 22; }
  const top = y, colH = 22 + 2 * dx + 8 + 40;
  s.slots.forEach((lab, i) => {
    const cx = x0 + i * (colW + xw);
    g += `<rect x="${r1(cx)}" y="${r1(top)}" width="${colW}" height="${r1(colH)}" rx="8" fill="#f7f9f8" stroke="#c9d3cd" stroke-width="1.1"/>`;
    g += rt(cx + colW / 2, top + 17, lab, { size: 13, weight: 700, anchor: 'middle', fill: C.ink2 });
    const gx = cx + (colW - (per - 1) * dx) / 2, gy = top + 28 + dr;
    for (let d = 0; d < s.pool; d++) {
      const r = Math.floor(d / per), c = d % per, taken = d < i;
      g += `<circle cx="${r1(gx + c * dx)}" cy="${r1(gy + r * dx)}" r="${r1(dr)}" fill="${taken ? '#dfe5e1' : C.mint}" stroke="${taken ? '#b9c4be' : C.green}" stroke-width="1"/>`;
    }
    const ny = gy + dx + dr + 22;
    g += rt(cx + colW / 2, ny, String(S.factors[i]), { size: 18, weight: 700, anchor: 'middle' });
    g += rt(cx + colW / 2, ny + 16, i === 0 ? (s.firstWord || 'choices') : (s.leftWord || 'left'), { size: 12.5, anchor: 'middle', fill: C.ink2 });
    if (i < k - 1) g += rt(cx + colW + xw / 2, top + colH / 2 + 6, 'x', { size: 17, weight: 700, anchor: 'middle', fill: C.ink2 });
  });
  y = top + colH + 12;
  const res = s.result.label || (S.factors.join(' x ') + ' = ' + S.product);
  const t1 = tag(W / 2, y + 18, res, 'key', { size: 14, anchor: 'middle' });
  g += t1.svg; y = t1.bottom + 10;
  const inner = Math.min(W - 12, 520), nx = (W - inner) / 2;
  [s.groups && { text: s.groups.label, role: 'trap' }, s.groups && s.groups.ordersLabel && { text: s.groups.ordersLabel, role: 'info' }, s.repeat && { text: s.repeat.label, role: 'trap' }].filter(Boolean).forEach((q) => {
    const nb = note(nx, y, inner, q.text, q.role, { size: 13 }); g += nb.svg; y += nb.h + 8;
  });
  box.innerHTML = svgOpen(W, y + 2) + g + '</svg>';
};

/* ============================================================== qr.tree: mix */
TREE_KINDS.mix = (s, box) => {
  const W = width(box), M = P.mix(s.pours), u = s.unit, dp = s.dp != null ? s.dp : 2;
  const colW = Math.min(200, Math.floor((W - 24) / 2)), cxs = [W / 4, 3 * W / 4].map((c, i) => (W < 420 ? (i ? W - 6 - colW / 2 : 6 + colW / 2) : c));
  const bh = 44, gap = 20;
  let g = '', y = 6;
  const boxAt = (cx, yy, l1, l2, role, w = colW) => {
    const R = ROLE[role] || ROLE.plain;
    return `<rect x="${r1(cx - w / 2)}" y="${r1(yy)}" width="${r1(w)}" height="${bh}" rx="8" fill="${R.fill}" stroke="${R.stroke}" stroke-width="${role === 'key' ? 2.4 : R.w}"/>` + rt(cx, yy + 18, l1, { size: 15, weight: 700, anchor: 'middle', fill: role === 'plain' ? C.ink : R.ink }) + rt(cx, yy + 35, l2, { size: 12.5, anchor: 'middle', fill: role === 'plain' ? C.ink2 : R.ink });
  };
  const link = (xa, ya, xb, yb) => `<line x1="${r1(xa)}" y1="${r1(ya)}" x2="${r1(xb)}" y2="${r1(yb)}" stroke="#9aa59f" stroke-width="1.6"/>`;
  // the whole, split into the two pours
  const rootW = Math.min(W - 12, 300);
  g += boxAt(W / 2, y, M.v + ' ' + u, s.wholeLabel, 'plain', rootW);
  const y1 = y + bh + gap;
  cxs.forEach((cx) => { g += link(W / 2, y + bh, cx, y1); });
  s.pours.forEach((pr, i) => { g += boxAt(cxs[i], y1, pr.v + ' ' + u, 'at ' + pr.pct + '%' + (pr.tag ? ': ' + pr.tag : ''), roleOf(pr)); });
  // how much of each pour is solute
  const y2 = y1 + bh + gap;
  s.pours.forEach((pr, i) => {
    g += link(cxs[i], y1 + bh, cxs[i], y2);
    g += rt(cxs[i] + 6, (y1 + bh + y2) / 2 + 4, 'x ' + pr.pct + '%', { size: 12, fill: C.ink2, italic: true, halo: true });
    g += boxAt(cxs[i], y2, n2(M.solute[i]) + ' ' + u, s.soluteLabel, 'plain');
  });
  // the join
  const y3 = y2 + bh + gap, jw = Math.min(W - 12, 360);
  cxs.forEach((cx) => { g += link(cx, y2 + bh, W / 2, y3); });
  const pct = +M.pct.toFixed(dp), about = Math.abs(pct - M.pct) > 1e-9 ? 'about ' : '';
  const jr = s.result && s.result.key ? 'key' : 'info';
  g += boxAt(W / 2, y3, n2(M.s) + ' ' + u + ' of ' + M.v + ' ' + u, '= ' + about + pct + '%' + (s.result && s.result.tag ? ': ' + s.result.tag : ''), jr, jw);
  y = y3 + bh + 16;
  // the lever: both strengths, the mix between them, closer to the bigger pour
  const L = s.lever;
  if (L) {
    if (L.title) { wrap(L.title, W - 16, 13).forEach((ln) => { g += rt(8, y + 14, ln, { size: 13, weight: 700, fill: C.ink2 }); y += 18; }); y += 6; }
    const lx0 = 22, lx1 = W - 22, X = (v) => lx0 + (lx1 - lx0) * (v - L.min) / (L.max - L.min);
    const vmax = Math.max(...s.pours.map((p) => p.v)), wy = y + 54, ay = wy + 12;
    s.pours.forEach((pr) => {
      const hh = 8 + 26 * pr.v / vmax, bw = 30, x = X(pr.pct);
      g += `<rect x="${r1(x - bw / 2)}" y="${r1(wy - hh)}" width="${bw}" height="${r1(hh)}" rx="3" fill="${C.mintBg}" stroke="${C.mint}" stroke-width="1.4"/>`;
      const lbl = pr.v + ' ' + u, lw = measure(lbl, 12.5, true);
      const lx = Math.max(4 + lw / 2, Math.min(W - 4 - lw / 2, x));
      g += rt(lx, wy - hh - 6, lbl, { size: 12.5, weight: 700, anchor: 'middle', fill: C.green });
    });
    g += `<line x1="${lx0}" y1="${r1(ay)}" x2="${lx1}" y2="${r1(ay)}" stroke="${C.ink}" stroke-width="2"/>`;
    // the fulcrum under the mix
    const mx = X(M.pct);
    g += `<path d="M${r1(mx)},${r1(ay + 2)} l-9,14 h18 z" fill="${s.result && s.result.key ? C.key : C.blue}"/>`;
    // ticks: the two strengths and any marks
    const below = [];
    s.pours.forEach((pr) => { g += `<line x1="${r1(X(pr.pct))}" y1="${r1(ay - 6)}" x2="${r1(X(pr.pct))}" y2="${r1(ay + 6)}" stroke="${C.ink}" stroke-width="1.6"/>`; below.push({ x: X(pr.pct), text: pr.pct + '%', role: 'plain' }); });
    below.push({ x: mx, text: (L.mixLabel ? L.mixLabel + ' ' : '') + about + pct + '%', role: s.result && s.result.key ? 'key' : 'info' });
    (L.marks || []).forEach((m) => { g += `<line x1="${r1(X(m.at))}" y1="${r1(ay - 14)}" x2="${r1(X(m.at))}" y2="${r1(ay + 6)}" stroke="${C.trap}" stroke-width="2" stroke-dasharray="3 2"/>`; below.push({ x: X(m.at), text: m.label, role: 'trap' }); });
    if (L.balance) {
      s.pours.forEach((pr) => { const a = X(pr.pct), d = Math.abs(pr.pct - M.pct); g += rt((a + mx) / 2, ay - 8, n2(d) + ' apart', { size: 12, anchor: 'middle', fill: C.ink2, halo: true }); });
    }
    const lv = levels(below, 12.5, W);
    let maxLv = 0;
    lv.forEach((pl) => {
      const ly = ay + 38 + pl.lv * 28; maxLv = Math.max(maxLv, pl.lv);
      const col = pl.it.role === 'key' ? C.key : pl.it.role === 'trap' ? C.trap : '#9aa59f';
      g += `<line x1="${r1(pl.it.x)}" y1="${r1(ay + 17)}" x2="${r1(pl.it.x)}" y2="${r1(ly - 16)}" stroke="${col}" stroke-width="1"/>`;
      g += tag(pl.x0, ly, pl.it.text, pl.it.role, { size: 12.5 }).svg;
    });
    y = ay + 38 + maxLv * 28 + 12;
    if (L.foot) { const nb = note(8, y, W - 16, L.foot, 'plain', { size: 12.5 }); g += nb.svg; y += nb.h + 6; }
  }
  box.innerHTML = svgOpen(W, y + 2) + g + '</svg>';
};

/* ================================================================ qr.dataset */
register('qr.dataset', (s, box) => {
  if (s.kind === 'dots') return dots(s, box);
  if (s.kind === 'normal') return normal(s, box);
  throw new Error('qr.dataset has no kind ' + s.kind);
});

function dots(s, box) {
  const W = width(box), lx0 = 18, lx1 = W - 18, X = (v) => lx0 + (lx1 - lx0) * (v - s.min) / (s.max - s.min);
  const dr = 7;
  let g = `<defs>${arrowDef(uid('qpa'), C.trap)}</defs>`, y = 4;
  const aid = /id="(qpa\d+)"/.exec(g)[1];
  s.rows.forEach((row) => {
    const m = P.mean(row.values), v = P.variance(row.values), role = roleOf(row);
    const counts = {}; row.values.forEach((x) => { counts[x] = (counts[x] || 0) + 1; });
    const stack = Math.max(...Object.values(counts));
    const rowTop = y;
    y += 8;
    g += rt(14, y + 13, row.label, { size: 13, weight: 700, fill: C.ink2 });
    y += 24;
    const ax = y + 16 + stack * (2 * dr + 2) + 22;   // axis line
    // the mean: a dashed line up from the axis, its label above
    const mx = X(m);
    g += `<line x1="${r1(mx)}" y1="${r1(y + 18)}" x2="${r1(mx)}" y2="${r1(ax)}" stroke="${C.blue}" stroke-width="1.6" stroke-dasharray="5 3"/>`;
    g += rt(mx, y + 12, 'mean ' + n2(m), { size: 12.5, weight: 700, anchor: 'middle', fill: C.blue, halo: true });
    // dots, stacked
    const seen = {};
    row.values.forEach((x) => { const k = seen[x] = (seen[x] || 0) + 1; g += `<circle cx="${r1(X(x))}" cy="${r1(ax - 4 - dr - (k - 1) * (2 * dr + 2))}" r="${dr}" fill="${row.ghost ? '#fff' : C.mint}" stroke="${row.ghost ? C.ink2 : C.green}" stroke-width="1.4"${row.ghost ? ' stroke-dasharray="3 2"' : ''}/>`; });
    // each dot's distance from the mean, at the axis
    const off = [...new Set(row.values)].filter((x) => Math.abs(x - m) > 1e-9);
    off.forEach((x) => { const yy = ax + 14; g += `<line x1="${r1(mx)}" y1="${r1(yy)}" x2="${r1(X(x) + (x > m ? -2 : 2))}" y2="${r1(yy)}" stroke="${C.trap}" stroke-width="1.6" marker-end="url(#${aid})"/>`; g += rt((mx + X(x)) / 2, yy + 17, (x > m ? '+' : '') + n2(x - m), { size: 12.5, weight: 700, anchor: 'middle', fill: '#6b3000', halo: true }); });
    // the axis
    g += `<line x1="${lx0}" y1="${r1(ax)}" x2="${lx1}" y2="${r1(ax)}" stroke="${C.ink}" stroke-width="1.6"/>`;
    for (let t = s.min; t <= s.max + 1e-9; t += s.step || 1) { g += `<line x1="${r1(X(t))}" y1="${r1(ax - 4)}" x2="${r1(X(t))}" y2="${r1(ax + 4)}" stroke="${C.ink2}" stroke-width="1"/>`; if (!off.length) g += rt(X(t), ax + 18, String(t), { size: 12, anchor: 'middle', fill: C.mute }); }
    y = ax + (off.length ? 40 : 28);
    if (!off.length && row.zeroLabel) { g += rt(W / 2, y + 12, row.zeroLabel, { size: 12.5, anchor: 'middle', fill: C.ink2 }); y += 20; }
    const tg = tag(W - 14, y + 18, row.tag || ('variance ' + n2(v)), role, { size: 13, anchor: 'end' });
    g += tg.svg; y = tg.bottom + 8;
    g += `<rect x="4" y="${r1(rowTop)}" width="${W - 8}" height="${r1(y - rowTop)}" rx="9" fill="none" stroke="${role === 'key' ? C.key : '#dbe3de'}" stroke-width="${role === 'key' ? 2.4 : 1}"${row.ghost ? ' stroke-dasharray="6 4"' : ''}/>`;
    y += 10;
  });
  if (s.unitLabel) { g += rt(W / 2, y + 6, s.unitLabel, { size: 12.5, anchor: 'middle', fill: C.mute }); y += 14; }
  box.innerHTML = svgOpen(W, y + 2) + g + '</svg>';
}

function normal(s, box) {
  const W = width(box), span = s.span || 3, lx0 = 16, lx1 = W - 16;
  const X = (v) => lx0 + (lx1 - lx0) * ((v - s.mean) / s.sd + span) / (2 * span);
  const top = 30, hgt = 110, base = top + hgt, Y = (z) => base - hgt * P.bell(z);
  const z = P.zscore(s.value, s.mean, s.sd), vx = X(s.value), mx = X(s.mean);
  let g = '';
  // shade the stretch from the value to the mean, under the bell
  const zs = Math.min(z, 0), ze = Math.max(z, 0);
  let sh = `M${r1(X(s.mean + zs * s.sd))},${base}`;
  for (let t = zs; t <= ze + 1e-9; t += (ze - zs) / 30) sh += ` L${r1(X(s.mean + t * s.sd))},${r1(Y(t))}`;
  sh += ` L${r1(X(s.mean + ze * s.sd))},${base} Z`;
  g += `<path d="${sh}" fill="${C.keyBg}" stroke="none"/>`;
  // the bell
  let pts = '';
  for (let t = -span; t <= span + 1e-9; t += span / 40) pts += r1(X(s.mean + t * s.sd)) + ',' + r1(Y(t)) + ' ';
  g += `<polyline points="${pts.trim()}" fill="none" stroke="${C.ink2}" stroke-width="2"/>`;
  g += `<line x1="${lx0}" y1="${base}" x2="${lx1}" y2="${base}" stroke="${C.ink}" stroke-width="1.6"/>`;
  // one tick per standard deviation: the value above the z
  for (let k = -span; k <= span; k++) {
    const x = X(s.mean + k * s.sd);
    g += `<line x1="${r1(x)}" y1="${base - 4}" x2="${r1(x)}" y2="${base + 4}" stroke="${C.ink2}" stroke-width="1"/>`;
    g += rt(x, base + 18, String(s.mean + k * s.sd), { size: 12, anchor: 'middle', fill: C.ink2 });
    g += rt(x, base + 34, k === 0 ? 'z 0' : (k > 0 ? '+' : '') + k, { size: 12, anchor: 'middle', fill: C.mute });
  }
  // the asked value
  g += `<line x1="${r1(vx)}" y1="${r1(top - 6)}" x2="${r1(vx)}" y2="${base}" stroke="${C.key}" stroke-width="2.6"/>`;
  g += `<line x1="${r1(mx)}" y1="${r1(top - 6)}" x2="${r1(mx)}" y2="${base}" stroke="${C.blue}" stroke-width="1.4" stroke-dasharray="5 3"/>`;
  const bx0 = Math.min(vx, mx), bx1 = Math.max(vx, mx), by = top + 26;
  g += `<path d="M${r1(bx0)},${by + 5} V${by} H${r1(bx1)} V${by + 5}" fill="none" stroke="${C.key}" stroke-width="1.8"/>`;
  const vlab = tag(vx, top - 10, s.valueLabel || (s.value + ' ' + s.unit), 'key', { size: 12.5, anchor: z < 0 ? 'end' : 'start' });
  const mlab = tag(mx, top - 10, 'mean ' + s.mean, 'info', { size: 12.5, anchor: z < 0 ? 'start' : 'end' });
  g += vlab.svg + mlab.svg;
  let y = base + 48;
  const gapLabel = s.gapLabel || (n2(Math.abs(s.value - s.mean)) + ' ' + s.unit + (z < 0 ? ' below' : ' above') + ' the mean');
  const nb1 = note(8, y, W - 16, gapLabel, 'plain', { size: 13 }); g += nb1.svg; y += nb1.h + 8;
  const zr = s.zLabel || ('z = ' + n2(z));
  const tz = tag(W / 2, y + 18, zr, 'key', { size: 14, anchor: 'middle' }); g += tz.svg; y = tz.bottom + 6;
  box.innerHTML = svgOpen(W, y + 2) + g + '</svg>';
}

/* ================================================================== qr.plane */
register('qr.plane', (s, box) => {
  const fn = PLANES[s.kind];
  if (!fn) throw new Error('qr.plane has no kind ' + s.kind);
  return fn(s, box);
});
// a grid fitted to the box: returns the mapping and the svg so far
function grid(s, W, maxH) {
  const [x0, x1] = s.x, [y0, y1] = s.y, padL = 30, padR = 12, padT = 12, padB = 26;
  const sc = Math.min((W - padL - padR) / (x1 - x0), (maxH - padT - padB) / (y1 - y0));
  const gw = sc * (x1 - x0), gh = sc * (y1 - y0), ox = padL + ((W - padL - padR) - gw) / 2;
  const X = (x) => ox + (x - x0) * sc, Y = (y) => padT + (y1 - y) * sc;
  let g = '';
  for (let x = Math.ceil(x0); x <= x1; x++) g += `<line x1="${r1(X(x))}" y1="${r1(Y(y1))}" x2="${r1(X(x))}" y2="${r1(Y(y0))}" stroke="#e3e9e5" stroke-width="0.8"/>`;
  for (let y = Math.ceil(y0); y <= y1; y++) g += `<line x1="${r1(X(x0))}" y1="${r1(Y(y))}" x2="${r1(X(x1))}" y2="${r1(Y(y))}" stroke="#e3e9e5" stroke-width="0.8"/>`;
  if (x0 <= 0 && x1 >= 0) g += `<line x1="${r1(X(0))}" y1="${r1(Y(y1))}" x2="${r1(X(0))}" y2="${r1(Y(y0))}" stroke="${C.ink2}" stroke-width="1.4"/>`;
  if (y0 <= 0 && y1 >= 0) g += `<line x1="${r1(X(x0))}" y1="${r1(Y(0))}" x2="${r1(X(x1))}" y2="${r1(Y(0))}" stroke="${C.ink2}" stroke-width="1.4"/>`;
  const every = s.every || 2;
  const ay = y0 <= 0 && y1 >= 0 ? Y(0) : Y(y0), axx = x0 <= 0 && x1 >= 0 ? X(0) : X(x0);
  for (let x = Math.ceil(x0 / every) * every; x <= x1; x += every) if (x !== 0) g += rt(X(x), Math.min(Y(y0) + 18, ay + 17), String(x), { size: 12, anchor: 'middle', fill: C.mute, halo: true });
  for (let y = Math.ceil(y0 / every) * every; y <= y1; y += every) if (y !== 0) g += rt(Math.max(X(x0) - 6, axx - 6), Y(y) + 4, String(y), { size: 12, anchor: 'end', fill: C.mute, halo: true });
  return { X, Y, g, H: padT + gh + padB, sc };
}
const dot = (x, y, role) => `<circle cx="${r1(x)}" cy="${r1(y)}" r="5.5" fill="${role === 'key' ? C.key : role === 'trap' ? '#fff' : C.ink}" stroke="${role === 'trap' ? C.trap : '#fff'}" stroke-width="${role === 'trap' ? 2 : 1.5}"${role === 'trap' ? ' stroke-dasharray="3 2"' : ''}/>`;
const ptLabel = (x, y, str, o = {}) => rt(x, y, str, Object.assign({ size: 13, weight: 700, halo: true }, o));

const PLANES = {};
PLANES.distance = (s, box) => {
  const W = width(box), G = grid(s, W, Math.min(320, W * 0.75)), [A, B] = s.points;
  const { X, Y } = G; let g = G.g;
  const corner = { x: B.x, y: A.y }, dx = Math.abs(B.x - A.x), dy = Math.abs(B.y - A.y);
  // the legs: the walk along the grid
  g += `<line x1="${r1(X(A.x))}" y1="${r1(Y(A.y))}" x2="${r1(X(corner.x))}" y2="${r1(Y(corner.y))}" stroke="${C.trap}" stroke-width="2" stroke-dasharray="6 4"/>`;
  g += `<line x1="${r1(X(corner.x))}" y1="${r1(Y(corner.y))}" x2="${r1(X(B.x))}" y2="${r1(Y(B.y))}" stroke="${C.trap}" stroke-width="2" stroke-dasharray="6 4"/>`;
  g += `<path d="M${r1(X(corner.x) - 10)},${r1(Y(corner.y))} v-10 h10" fill="none" stroke="${C.ink2}" stroke-width="1.2"/>`;
  // the straight line: the hypotenuse
  g += `<line x1="${r1(X(A.x))}" y1="${r1(Y(A.y))}" x2="${r1(X(B.x))}" y2="${r1(Y(B.y))}" stroke="${C.key}" stroke-width="3.5"/>`;
  g += dot(X(A.x), Y(A.y)) + dot(X(B.x), Y(B.y));
  g += ptLabel(X(A.x) - 8, Y(A.y) - 10, '(' + A.x + ', ' + A.y + ')', { anchor: 'end' });
  g += ptLabel(X(B.x) - 8, Y(B.y) - 4, '(' + B.x + ', ' + B.y + ')', { anchor: 'end' });
  g += ptLabel((X(A.x) + X(corner.x)) / 2, Y(A.y) + (A.y === 0 ? -9 : 18), 'across ' + dx, { anchor: 'middle', fill: '#6b3000' });
  g += ptLabel(X(corner.x) + 8, (Y(corner.y) + Y(B.y)) / 2 + 4, 'up ' + dy, { fill: '#6b3000' });
  let y = G.H + 4;
  const t1 = tag(8, y + 18, s.result.label, 'key', { size: 13.5 }); g += t1.svg; y = t1.bottom + 8;
  if (s.walk) { const nb = note(8, y, W - 16, s.walk.label, 'trap', { size: 13 }); g += nb.svg; y += nb.h + 4; }
  box.innerHTML = svgOpen(W, y + 2) + g + '</svg>';
};
PLANES.slope = (s, box) => {
  const W = width(box), G = grid(s, W, Math.min(340, W * 0.95)), [A, B] = s.points;
  const { X, Y } = G; let g = G.g;
  const id = uid('qpa'); g = `<defs>${arrowDef(id, C.trap)}</defs>` + g;
  const m = P.slope(A, B);
  // the line through both points, across the grid
  const xa = s.x[0], xb = s.x[1], ya = A.y + m * (xa - A.x), yb = A.y + m * (xb - A.x);
  g += `<line x1="${r1(X(xa))}" y1="${r1(Y(ya))}" x2="${r1(X(xb))}" y2="${r1(Y(yb))}" stroke="${C.key}" stroke-width="2.6"/>`;
  // run, then rise, each with its sign
  const c = { x: B.x, y: A.y };
  g += `<line x1="${r1(X(A.x))}" y1="${r1(Y(A.y))}" x2="${r1(X(c.x))}" y2="${r1(Y(c.y))}" stroke="${C.trap}" stroke-width="2.2" marker-end="url(#${id})"/>`;
  g += `<line x1="${r1(X(c.x))}" y1="${r1(Y(c.y))}" x2="${r1(X(B.x))}" y2="${r1(Y(B.y))}" stroke="${C.trap}" stroke-width="2.2" marker-end="url(#${id})"/>`;
  g += dot(X(A.x), Y(A.y)) + dot(X(B.x), Y(B.y));
  g += ptLabel(X(A.x) + 8, Y(A.y) + (m > 0 ? 19 : -9), '(' + A.x + ', ' + A.y + ')');
  g += ptLabel(X(B.x) + 8, Y(B.y) + 18, '(' + B.x + ', ' + B.y + ')');
  g += ptLabel((X(A.x) + X(c.x)) / 2, Y(A.y) - 9, 'run ' + (B.x - A.x), { anchor: 'middle', fill: '#6b3000' });
  g += ptLabel(X(c.x) - 8, (Y(c.y) + Y(B.y)) / 2 + 5, 'rise ' + (B.y - A.y), { anchor: 'end', fill: '#6b3000' });
  let y = G.H + 4;
  const t1 = tag(8, y + 18, s.result.label, 'key', { size: 13.5 }); g += t1.svg; y = t1.bottom + 8;
  if (s.foot) { const nb = note(8, y, W - 16, s.foot, 'plain', { size: 13 }); g += nb.svg; y += nb.h + 4; }
  box.innerHTML = svgOpen(W, y + 2) + g + '</svg>';
};
PLANES['unit-circle'] = (s, box) => {
  const W = width(box), side = Math.min(W - 8, 340), R = (side - 70) / 2, cx = W / 2, cy = 14 + R + 20;
  const U = P.unitPoint(s.cos, s.quadrant), X = (x) => cx + x * R, Y = (y) => cy - y * R;
  let g = '';
  g += `<line x1="${r1(cx - R - 22)}" y1="${r1(cy)}" x2="${r1(cx + R + 22)}" y2="${r1(cy)}" stroke="${C.ink2}" stroke-width="1.4"/>`;
  g += `<line x1="${r1(cx)}" y1="${r1(cy - R - 22)}" x2="${r1(cx)}" y2="${r1(cy + R + 22)}" stroke="${C.ink2}" stroke-width="1.4"/>`;
  g += `<circle cx="${r1(cx)}" cy="${r1(cy)}" r="${r1(R)}" fill="none" stroke="#9aa59f" stroke-width="1.6"/>`;
  // quadrant signs: the one in play outlined
  const Q = { 1: [1, -1], 2: [-1, -1], 3: [-1, 1], 4: [1, 1] }, names = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV' }, sig = { 1: ['+', '+'], 2: ['+', '-'], 3: ['-', '-'], 4: ['-', '+'] };
  [1, 2, 3, 4].forEach((q) => {
    const qx = cx + Q[q][0] * R * 0.64, qy = cy + Q[q][1] * R * 0.42;
    const on = q === s.quadrant, gh = s.ghost && q === s.ghost.quadrant;
    const l1 = names[q] + ': sin ' + sig[q][0], l2 = 'cos ' + sig[q][1];
    const w = Math.max(measure(l1, 12.5, true), measure(l2, 12.5, true)) + 12;
    const role = on ? 'key' : gh ? 'trap' : 'plain', Rr = ROLE[role];
    g += `<rect x="${r1(qx - w / 2)}" y="${r1(qy - 19)}" width="${r1(w)}" height="38" rx="6" fill="${Rr.fill}" stroke="${Rr.stroke}" stroke-width="${on ? 2.2 : 1}"/>`;
    g += rt(qx, qy - 3, l1, { size: 12.5, weight: 700, anchor: 'middle', fill: Rr.ink }) + rt(qx, qy + 13, l2, { size: 12.5, anchor: 'middle', fill: Rr.ink });
  });
  // the point, its cosine along the x axis and its sine straight down
  const px = X(U.x), py = Y(U.y);
  g += `<line x1="${r1(cx)}" y1="${r1(cy)}" x2="${r1(px)}" y2="${r1(py)}" stroke="${C.key}" stroke-width="2.4"/>`;
  g += `<line x1="${r1(cx)}" y1="${r1(cy)}" x2="${r1(px)}" y2="${r1(cy)}" stroke="${C.blue}" stroke-width="3"/>`;
  g += `<line x1="${r1(px)}" y1="${r1(cy)}" x2="${r1(px)}" y2="${r1(py)}" stroke="${C.key}" stroke-width="2" stroke-dasharray="5 3"/>`;
  if (s.ghost) { const Gp = P.unitPoint(s.cos, s.ghost.quadrant); g += `<line x1="${r1(px)}" y1="${r1(cy)}" x2="${r1(X(Gp.x))}" y2="${r1(Y(Gp.y))}" stroke="${C.trap}" stroke-width="1.6" stroke-dasharray="4 3"/>` + dot(X(Gp.x), Y(Gp.y), 'trap'); const gw = measure(s.ghost.label, 12.5, true); g += ptLabel(Math.max(4 + gw, X(Gp.x) - 10), Y(Gp.y) - 8, s.ghost.label, { anchor: 'end', fill: '#6b3000', size: 12.5 }); }
  g += dot(px, py, 'key');
  g += ptLabel(px - 10, py + 20, s.pointLabel || '(' + n2(U.x) + ', ' + n2(U.y) + ')', { anchor: 'end', fill: C.key });
  g += ptLabel((cx + px) / 2, cy - 8, 'cos ' + n2(U.x), { anchor: 'middle', fill: C.blue, size: 12.5 });
  g += ptLabel(px - 6, py + (U.y < 0 ? -18 : 26), 'sin ' + n2(U.y), { anchor: 'end', fill: C.key, size: 12.5 });
  let y = cy + R + 30;
  const t1 = tag(W / 2, y + 18, s.result.label, 'key', { size: 13.5, anchor: 'middle' }); g += t1.svg; y = t1.bottom + 8;
  if (s.foot) { const nb = note(8, y, W - 16, s.foot, 'plain', { size: 13 }); g += nb.svg; y += nb.h + 4; }
  box.innerHTML = svgOpen(W, y + 2) + g + '</svg>';
};
PLANES.inscribed = (s, box) => {
  const W = width(box), T = P.inscribed(s.legs[0], s.legs[1]);
  const R = Math.min(110, (W - 60) / 2), sc = R / T.r, cx = W / 2, cy = 16 + R + 6;
  const X = (x) => cx + x * sc, Y = (y) => cy - y * sc;
  const A = T.A, B = T.B, Pp = T.P;
  let g = '';
  // the region: inside the circle, outside the triangle (even-odd)
  const circ = `M${r1(cx - R)},${r1(cy)} a${r1(R)},${r1(R)} 0 1 0 ${r1(2 * R)},0 a${r1(R)},${r1(R)} 0 1 0 ${r1(-2 * R)},0 Z`;
  const tri = `M${r1(X(A.x))},${r1(Y(A.y))} L${r1(X(Pp.x))},${r1(Y(Pp.y))} L${r1(X(B.x))},${r1(Y(B.y))} Z`;
  g += `<path d="${circ} ${tri}" fill="${C.keyBg}" fill-rule="evenodd" stroke="none"/>`;
  g += `<circle cx="${r1(cx)}" cy="${r1(cy)}" r="${r1(R)}" fill="none" stroke="${C.key}" stroke-width="2.4"/>`;
  g += `<polygon points="${r1(X(A.x))},${r1(Y(A.y))} ${r1(X(Pp.x))},${r1(Y(Pp.y))} ${r1(X(B.x))},${r1(Y(B.y))}" fill="#fff" stroke="${C.ink}" stroke-width="2"/>`;
  // the right angle sits on the circle
  const ux = (A.x - Pp.x) / s.legs[0], uy = (A.y - Pp.y) / s.legs[0], vx = (B.x - Pp.x) / s.legs[1], vy = (B.y - Pp.y) / s.legs[1], q = 12 / sc;
  g += `<path d="M${r1(X(Pp.x + ux * q))},${r1(Y(Pp.y + uy * q))} L${r1(X(Pp.x + (ux + vx) * q))},${r1(Y(Pp.y + (uy + vy) * q))} L${r1(X(Pp.x + vx * q))},${r1(Y(Pp.y + vy * q))}" fill="none" stroke="${C.ink2}" stroke-width="1.2"/>`;
  g += `<circle cx="${r1(cx)}" cy="${r1(cy)}" r="3" fill="${C.ink}"/>`;
  // leg labels outside the triangle, the diameter and the radius below it
  const mid = (p, q2) => ({ x: (p.x + q2.x) / 2, y: (p.y + q2.y) / 2 });
  const out = (m, k) => { const d = Math.hypot(m.x, m.y) || 1; return { x: m.x + (m.x / d) * k, y: m.y + (m.y / d) * k }; };
  const la = out(mid(A, Pp), 0.42), lb = out(mid(B, Pp), 0.42);
  g += rt(X(la.x), Y(la.y) + 4, String(s.legs[0]), { size: 15, weight: 700, anchor: 'middle', halo: true });
  g += rt(X(lb.x), Y(lb.y) + 4, String(s.legs[1]), { size: 15, weight: 700, anchor: 'middle', halo: true });
  g += rt(cx, cy + 18, s.diameterLabel || ('diameter ' + T.c), { size: 12.5, weight: 700, anchor: 'middle', fill: C.ink2, halo: true });
  g += rt((cx + X(B.x)) / 2, cy - 7, 'r = ' + T.r, { size: 12.5, weight: 700, anchor: 'middle', fill: C.ink, halo: true });
  let y = cy + R + 14;
  (s.rows || []).forEach((row) => {
    const v = T[row.value];
    const text = row.label + (v != null && row.about !== false ? ', about ' + n2(v, 1) : '');
    const nb = note(8, y, W - 16, text, roleOf(row), { size: 13 }); g += nb.svg; y += nb.h + 6;
  });
  box.innerHTML = svgOpen(W, y + 2) + g + '</svg>';
};
