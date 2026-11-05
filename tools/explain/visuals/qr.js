// qr.js: qr.figure (shared/qr-figures.js, reused, plus a thin highlight
// wrapper), qr.partwhole, qr.triangle, qr.tree, qr.numberline (new).
// Ported from the pilot preview (question-system/preview/renderers/qr.js). The
// chart spec for qr.figure is the served question's own figure (resolvePanel).
import { register, C, t, r1, svgOpen, width, badge, arrowDefs, uid, h, textW } from './core.js';

/* ---------------- qr.figure ---------------- */
// QRFigures draws one <path fill="var(--qf-s1)"> per bar, in category order,
// for a one-series bar chart. The wrapper recolors bars by category. A
// `highlight` option inside qr-figures.js would replace this.
export function highlightBars(svg, spec, highlight) {
  if (!svg || !highlight || spec.type !== 'bar' || spec.series.length !== 1) return false;
  const bars = [...svg.querySelectorAll('path')].filter((p) => (p.getAttribute('fill') || '').includes('--qf-s1'));
  if (bars.length !== spec.categories.length) return false;
  bars.forEach((b, i) => {
    const on = highlight.includes(spec.categories[i]);
    b.setAttribute('fill', on ? C.key : '#c9d2cd');
    if (on) { b.setAttribute('stroke', C.green); b.setAttribute('stroke-width', '2.5'); }   // outline as well as color
  });
  return true;
}
register('qr.figure', (s, box) => {
  if (!window.QRFigures) throw new Error('qr-figures.js not loaded');
  const W = width(box);
  box.innerHTML = window.QRFigures.svg(s.spec, { width: Math.min(W, 640) });
  const svg = box.querySelector('svg'); if (!svg) return;
  svg.setAttribute('aria-hidden', 'true'); svg.style.maxWidth = '100%'; svg.style.height = 'auto'; svg.style.display = 'block'; svg.style.margin = '0 auto';
  highlightBars(svg, s.spec, s.highlight);
  box.classList.add('qrfig-host');
});

/* ---------------- qr.partwhole ---------------- */
// Styles beyond the pilot's grid and strip register here (qr-work.js adds
// groups, bars and fractions), the way chem.js takes curve kinds.
export const PARTWHOLE_STYLES = {};
register('qr.partwhole', (s, box) => {
  if (s.style && PARTWHOLE_STYLES[s.style]) return PARTWHOLE_STYLES[s.style](s, box);
  if (s.style === 'strip') return partStrip(s, box);
  const W = width(box), cols = 10, rows = Math.ceil(s.total / cols);
  const cell = Math.min(24, Math.floor((Math.min(W, 420) - 32) / cols) - 2), gap = 2;
  const gw = cols * (cell + gap) - gap, gx = W >= 560 ? 16 : (W - gw) / 2, gy = 34;
  const fills = [], tones = [C.key, '#2f9c78'];
  s.parts.forEach((p, k) => { for (let i = 0; i < p.n; i++) fills.push({ c: tones[k % 2], k }); });
  for (let i = 0; i < s.rest.n; i++) fills.push({ c: '#e4eae7', k: -1 });
  let g = t(gx, 20, 'One square = one ' + s.unit, { size: 13, weight: 700, fill: C.ink2 });
  fills.forEach((f, i) => {
    const r = Math.floor(i / cols), c = i % cols;
    g += `<rect x="${r1(gx + c * (cell + gap))}" y="${r1(gy + r * (cell + gap))}" width="${cell}" height="${cell}" rx="2" fill="${f.c}" stroke="${f.k >= 0 ? C.green : '#cfd8d3'}" stroke-width="${f.k >= 0 ? 1.2 : 1}"/>`;
  });
  const gyEnd = gy + rows * (cell + gap);
  const part = s.parts.reduce((a, b) => a + b.n, 0);
  let ly, lx;
  if (W >= 560) { lx = gx + gw + 28; ly = gy + 14; } else { lx = gx; ly = gyEnd + 24; }
  s.parts.forEach((p, k) => { g += `<rect x="${r1(lx)}" y="${r1(ly - 12)}" width="14" height="14" rx="2" fill="${tones[k % 2]}" stroke="${C.green}"/>` + t(lx + 22, ly, p.label + ': ' + p.n, { size: 14 }); ly += 24; });
  g += `<rect x="${r1(lx)}" y="${r1(ly - 12)}" width="14" height="14" rx="2" fill="#e4eae7" stroke="#cfd8d3"/>` + t(lx + 22, ly, s.rest.label + ': ' + s.rest.n, { size: 14, fill: C.ink2 }); ly += 34;
  g += badge(lx, ly, 'Weekend: ' + part + ' of ' + s.total + ' = ' + Math.round(100 * part / s.total) + '%', { size: 13.5 });
  const H = Math.max(gyEnd + 8, ly + 14);
  box.innerHTML = svgOpen(W, H) + g + '</svg>';
});

// One bar the length of the whole, split into labeled segments (text labels,
// not shade alone), with a bracket over the key parts.
function partStrip(s, box) {
  const W = width(box), x0 = 16, x1 = W - 16, bw = x1 - x0, y = 54, hgt = 30;
  const segs = [{ label: s.rest.label, n: s.rest.n, key: false }].concat(s.parts.map((p) => ({ label: p.label, n: p.n, key: !!p.key })));
  let g = t(x0, 18, 'The whole chart: ' + s.total + ' units of ' + s.unit, { size: 13, weight: 700, fill: C.ink2 });
  let x = x0; const placed = [];
  segs.forEach((sg) => {
    const w = bw * sg.n / s.total;
    g += `<rect x="${r1(x)}" y="${y}" width="${r1(w)}" height="${hgt}" fill="${sg.key ? C.keyBg : '#eef1ef'}" stroke="${sg.key ? C.key : '#aab5af'}" stroke-width="${sg.key ? 2.2 : 1.2}"/>`;
    const lab = sg.label + ' ' + sg.n;
    if (textW(lab, 12.5) < w - 8) g += t(x + w / 2, y + 19.5, lab, { size: 12.5, anchor: 'middle', weight: sg.key ? 700 : 400, fill: sg.key ? C.key : C.ink2 });
    else placed.push({ x: x + w / 2, lab, key: sg.key });
    x += w;
  });
  placed.forEach((p, i) => { g += t(p.x, y + hgt + 18 + i * 16, p.lab, { size: 12.5, anchor: 'middle', fill: p.key ? C.key : C.ink2, weight: p.key ? 700 : 400 }); });
  const kx0 = x0 + bw * s.rest.n / s.total, kx1 = x1, by = y - 8;
  g += `<path d="M${r1(kx0 + 1)},${by + 6} L${r1(kx0 + 1)},${by} L${r1(kx1 - 1)},${by} L${r1(kx1 - 1)},${by + 6}" fill="none" stroke="${C.key}" stroke-width="2"/>`;
  g += badge(Math.min((kx0 + kx1) / 2, W - 16 - textW(s.bracket, 13) / 2 - 8), by - 6, s.bracket, { size: 13, anchor: 'middle' });
  const H = y + hgt + 14 + placed.length * 16 + 4;
  box.innerHTML = svgOpen(W, Math.max(H, y + hgt + 10)) + g + '</svg>';
}

/* ---------------- qr.triangle (to scale) ---------------- */
register('qr.triangle', (s, box) => {
  const W = width(box), wide = W >= 560;
  // vertex C at the origin, side b along the x axis, side a at the angle
  const tri = (deg) => { const r = deg * Math.PI / 180; return { A: [s.a * Math.cos(r), -s.a * Math.sin(r)], B: [s.b, 0], C: [0, 0] }; };
  const main = tri(s.angleDeg), ghosts = (s.compare || []).map((c) => Object.assign(tri(c.angleDeg), { c }));
  const all = [main, ...ghosts].flatMap((q) => [q.A, q.B, q.C]);
  const minX = Math.min(...all.map((p) => p[0])), maxX = Math.max(...all.map((p) => p[0])), minY = Math.min(...all.map((p) => p[1]));
  const sc = Math.min(wide ? 30 : 26, (W - 60) / (maxX - minX));
  const ox = (W - (maxX - minX) * sc) / 2 - minX * sc, oy = 58 - minY * sc;
  const P = (p) => [r1(p[0] * sc + ox), r1(p[1] * sc + oy)];
  const lab = (x, y, str, o) => { const w = textW(str, o.size || 12); let anchor = o.anchor || 'start'; let xx = x; if (anchor === 'end' && xx - w < 4) { anchor = 'start'; xx = 4; } if (anchor === 'start' && xx + w > W - 4) { anchor = 'end'; xx = W - 4; } return t(xx, y, str, Object.assign({}, o, { anchor })); };
  let g = '';
  const a = P(main.A), b = P(main.B), c = P(main.C);
  // the main triangle first, lightly filled, so the dashed comparisons drawn after it stay visible end to end
  g += `<polygon points="${a[0]},${a[1]} ${b[0]},${b[1]} ${c[0]},${c[1]}" fill="rgba(0,112,79,.07)" stroke="${C.ink}" stroke-width="2.2"/>`;
  const used = [];
  ghosts.forEach((q, k) => {
    const ga = P(q.A), gb = P(q.B), gc = P(q.C);
    g += `<line x1="${gc[0]}" y1="${gc[1]}" x2="${ga[0]}" y2="${ga[1]}" stroke="#9aa59f" stroke-width="1.4" stroke-dasharray="4 4"/>`;
    g += `<line x1="${ga[0]}" y1="${ga[1]}" x2="${gb[0]}" y2="${gb[1]}" stroke="#6b7a72" stroke-width="2.2" stroke-dasharray="7 4"/>`;
    // label at the far end of the comparison arm, nudged clear of other labels and the other arms
    let lx = ga[0] + (ga[0] < gc[0] ? -8 : 8), ly = ga[1] - 8;
    const str = q.c.angleDeg + ' deg: ' + q.c.label;
    if (ga[0] < gc[0] + 20 && ga[0] > gc[0] - 20) { lx = ga[0] + 10; }
    let anchor = ga[0] < gc[0] - 20 ? 'end' : 'start';
    const wStr = textW(str, 12);
    if (anchor === 'end' && lx - wStr < 4) { anchor = 'start'; lx = 4; ly = ga[1] - 14; }   // no room to the left: sit above the vertex
    if (anchor === 'start' && lx + wStr > W - 4) { anchor = 'end'; lx = W - 4; ly = ga[1] - 14; }
    used.forEach((u) => { if (Math.abs(u.y - ly) < 16 && Math.abs(u.x - lx) < 140) ly = u.y - 18; });
    used.push({ x: lx, y: ly });
    g += t(lx, ly, str, { size: 12, anchor, fill: C.ink2 }).replace('<text ', '<text paint-order="stroke" stroke="#fff" stroke-width="4" stroke-linejoin="round" ');
  });
  g += `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${C.key}" stroke-width="4.5"/>`;
  const r = 28, rr = s.angleDeg * Math.PI / 180;
  g += `<path d="M${r1(c[0] + r)},${c[1]} A${r},${r} 0 0 0 ${r1(c[0] + r * Math.cos(rr))},${r1(c[1] - r * Math.sin(rr))}" fill="none" stroke="${C.ink2}" stroke-width="1.6"/>`;
  g += t(c[0] + r + 6, c[1] - 9, s.angleDeg + ' deg', { size: 13, weight: 700 });
  g += t((c[0] + b[0]) / 2, c[1] + 20, String(s.b), { size: 15, weight: 700, anchor: 'middle' });
  g += t((c[0] + a[0]) / 2 - 10, (c[1] + a[1]) / 2, String(s.a), { size: 15, weight: 700, anchor: 'end' });
  const c2 = Math.round(s.c * s.c), cl = 'c = root ' + c2 + ', about ' + s.c.toFixed(1);
  const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
  let y = c[1] + 34;
  if (mx + 12 + textW(cl, 13) + 16 < W) g += badge(mx + 12, my + 4, cl, { size: 13 });
  else { g += badge(16, y + 10, cl, { size: 13 }); y += 28; }
  const sum = s.a * s.a + s.b * s.b, cut = Math.round(2 * s.a * s.b * Math.cos(rr));
  const f1 = 'c squared = ' + s.a * s.a + ' + ' + s.b * s.b + ' - 2(' + s.a + ')(' + s.b + ')(cos ' + s.angleDeg + ')', f2 = '= ' + sum + ' - ' + cut + ' = ' + c2;
  if (textW(f1 + ' ' + f2, 13) < W - 24) { g += t(16, y + 14, f1 + ' ' + f2, { size: 13, fill: C.ink2 }); y += 22; }
  else { g += t(16, y + 14, f1, { size: 13, fill: C.ink2 }) + t(16, y + 32, f2, { size: 13, fill: C.ink2 }); y += 40; }
  box.innerHTML = svgOpen(W, y + 6) + g + '</svg>';
});

/* ---------------- qr.tree ---------------- */
// Counts in the boxes, rates on the branches. The numerator leaf is outlined
// solid, every leaf in the denominator dashed, and both carry a word label,
// so the key is never marked by color alone.
// Kinds beyond the pilot's Bayes tree register here (qr-plot.js adds slots
// and mix), the way PARTWHOLE_STYLES takes partwhole styles.
export const TREE_KINDS = {};
register('qr.tree', (s, box) => {
  if (s.kind && TREE_KINDS[s.kind]) return TREE_KINDS[s.kind](s, box);
  const W = width(box), wide = W >= 560;
  const fmt = (n) => Number(n).toLocaleString('en-US');
  const role = (c) => c.role === 'numerator' ? 'num' : c.role === 'denominator' ? 'den' : null;
  const tagOf = (c) => c.role === 'numerator' ? 'numerator' : c.role === 'denominator' ? 'in the denominator' : null;
  const boxR = (x, y, w, hh, label, n, c) => {
    const r = c ? role(c) : null;
    let g = `<rect x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="${hh}" rx="8" fill="${r ? C.keyBg : '#f6f8f7'}" stroke="${r ? C.key : '#c6cfca'}" stroke-width="${r ? 2.2 : 1.2}"${r === 'den' ? ' stroke-dasharray="6 3"' : ''}/>`;
    g += t(x + 10, y + 17, label, { size: 12.5, fill: C.ink2 }) + t(x + 10, y + 35, fmt(n), { size: 15, weight: 700 });
    if (c && tagOf(c)) g += t(x + w - 8, y + 35, tagOf(c), { size: 12, anchor: 'end', fill: C.key, weight: 700 });
    return g;
  };
  const line = (xa, ya, xb, yb) => `<line x1="${r1(xa)}" y1="${r1(ya)}" x2="${r1(xb)}" y2="${r1(yb)}" stroke="#9aa59f" stroke-width="1.6"/>`;
  const rate = (x, y, str, anchor) => t(x, y, str, { size: 12, fill: C.ink2, anchor: anchor || 'middle', italic: true }).replace('<text ', '<text paint-order="stroke" stroke="#fff" stroke-width="4" stroke-linejoin="round" ');
  let g = '', H;
  // put the two leaves the ratio uses (they carry a role) next to each other: the first branch lists its others first
  const B0 = s.branches[0], B1 = s.branches[1], used = (c) => (c.role ? 1 : 0);
  const k0 = B0.children.slice().sort((p, q) => used(p) - used(q));
  const k1 = B1.children.slice().sort((p, q) => used(q) - used(p));
  if (wide) {
    const gap = 56, avail = W - 32 - 2 * gap - 22, bw = Math.min(170, Math.round(avail * 0.29)), lw = Math.min(260, avail - 2 * bw), hh = 44;
    const x0 = 16, x1 = x0 + bw + gap, x2 = x1 + bw + gap;
    const ys = [12, 64, 124, 176], yb = [38, 150], yr = 94;
    g += line(x0 + bw, yr + hh / 2, x1, yb[0] + hh / 2) + line(x0 + bw, yr + hh / 2, x1, yb[1] + hh / 2);
    g += rate((x0 + bw + x1) / 2, (yr + yb[0]) / 2 + hh / 2 - 6, B0.rate) + rate((x0 + bw + x1) / 2, (yr + yb[1]) / 2 + hh / 2 + 14, B1.rate);
    const leaves = [[k0[0], ys[0], yb[0]], [k0[1], ys[1], yb[0]], [k1[0], ys[2], yb[1]], [k1[1], ys[3], yb[1]]];
    leaves.forEach(([c, y, ybr]) => { g += line(x1 + bw, ybr + hh / 2, x2, y + hh / 2); g += rate((x1 + bw + x2) / 2, (ybr + y) / 2 + hh / 2 + (y < ybr ? -5 : 13), c.rate); });
    g += boxR(x0, yr, bw, hh, s.root.label, s.root.n) + boxR(x1, yb[0], bw, hh, B0.label, B0.n) + boxR(x1, yb[1], bw, hh, B1.label, B1.n);
    leaves.forEach(([c, y]) => { g += boxR(x2, y, lw, hh, c.label + (c.mark ? ', ' + c.mark : ''), c.n, c); });
    // bracket over both positive leaves: the denominator
    const bx = x2 + lw + 10;
    if (bx + 16 < W) g += `<path d="M${r1(bx)},${ys[1] + 6} L${r1(bx + 8)},${ys[1] + 6} L${r1(bx + 8)},${ys[2] + hh - 6} L${r1(bx)},${ys[2] + hh - 6}" fill="none" stroke="${C.key}" stroke-width="2"/>`;
    H = ys[3] + hh + 18;
    g += badge(16, H + 4, s.result.text, { size: 13.5 });
    H += 16;
  } else {
    const pad = 16, w = W - 2 * pad; let yy = 8;
    const row = (x, label, n, c, rt) => { const ww = w - (x - pad); let s2 = ''; if (rt) { s2 += rate(x + 2, yy + 12, rt, 'start'); yy += 16; } s2 += boxR(x, yy, ww, 42, label, n, c); yy += 50; return s2; };
    g += row(pad, s.root.label, s.root.n);
    [[B0, k0], [B1, k1]].forEach(([b, kids]) => {
      const top = yy;
      g += row(pad + 18, b.label, b.n, null, b.rate);
      kids.forEach((c) => { g += row(pad + 40, c.label + (c.mark ? ', ' + c.mark : ''), c.n, c, c.rate); });
      g += `<line x1="${pad + 8}" y1="${top - 8}" x2="${pad + 8}" y2="${top + 36}" stroke="#9aa59f" stroke-width="1.6"/><line x1="${pad + 8}" y1="${top + 36}" x2="${pad + 18}" y2="${top + 36}" stroke="#9aa59f" stroke-width="1.6"/>`;
    });
    yy += 6;
    const k = s.result.text.indexOf(' = '), lines = [s.result.text.slice(0, k), s.result.text.slice(k + 1)];
    g += `<rect x="${pad}" y="${yy}" width="${w}" height="52" rx="6" fill="${C.keyBg}" stroke="${C.key}" stroke-width="1.6"/>`;
    g += t(pad + 10, yy + 21, lines[0], { size: 13.5, weight: 700, fill: C.key }) + t(pad + 10, yy + 41, lines[1], { size: 13.5, weight: 700, fill: C.key });
    H = yy + 58;
  }
  box.innerHTML = svgOpen(W, H) + g + '</svg>';
});

/* ---------------- qr.numberline ---------------- */
register('qr.numberline', (s, box) => {
  const W = width(box), L = 24, R = 24, y = 70;
  const X = (v) => L + ((v - s.min) / (s.max - s.min)) * (W - L - R);
  let g = `<line x1="${L}" x2="${W - R}" y1="${y}" y2="${y}" stroke="${C.ink}" stroke-width="2"/>`;
  for (let v = s.min; v <= s.max; v += s.step) { const big = v % (s.labelEvery || 5) === 0; g += `<line x1="${r1(X(v))}" x2="${r1(X(v))}" y1="${y - (big ? 7 : 4)}" y2="${y + (big ? 7 : 4)}" stroke="${C.ink2}"/>`; if (big) g += t(X(v), y + 24, String(v), { size: 12, anchor: 'middle', fill: C.mute }); }
  (s.points || []).forEach((p) => { g += `<circle cx="${r1(X(p.x))}" cy="${y}" r="7" fill="${p.key ? C.key : '#fff'}" stroke="${C.key}" stroke-width="2"/>`; });
  box.innerHTML = svgOpen(W, 110) + g + '</svg>';
});
