// bio-chart.js: bio.chart, small biology charts whose curves are computed
// from the spec's parameters, so every mark sits on the true curve.
// New (production-plan.md section 4: "port initKinetics, initPopGrowth,
// initSurvivorship"); those hub widgets are DOM-bound, so these are pure
// render(spec) functions in the explainer style (12 px text or larger).
//
// kind 'selection'   distributions before and after selection, one small
//                    chart per mode: { before: {mean, sd}, panels: [{ title,
//                    note, after: [{mean, sd, w}], key?, choice?, meanLabel? }],
//                    x, y }
// kind 'levels'      trophic levels before and after a change, as paired
//                    bars with the direction in words: { levels: [{ label,
//                    sub?, before, after, change }], keyLabel, choice? }
// kind 'saturation'  transport rate against concentration: a carrier curve
//                    (rate = vmax * S / (km + S)) beside simple diffusion
//                    (rate = k * S): { carrier: {vmax, km}, diffusion: {k},
//                    xmax, x, y, labels: {carrier, diffusion, ceiling} }
import { register, C, t, r1, svgOpen, width, badge, wrap, textW, uid } from './core.js';

const halo = (svgText, color = '#fff') => svgText.replace('<text ', `<text paint-order="stroke" stroke="${color}" stroke-width="4" stroke-linejoin="round" `);
const gauss = (x, m, sd) => Math.exp(-0.5 * ((x - m) / sd) ** 2) / sd;
const mix = (x, parts) => parts.reduce((a, p) => a + (p.w == null ? 1 : p.w) * gauss(x, p.mean, p.sd), 0);

/* ------------------------------------------------------------ selection */
function selection(s, W) {
  const wide = W >= 560, gap = 10;
  const n = s.panels.length;
  // phone: the key panel full width, the others side by side under it
  const keyI = Math.max(0, s.panels.findIndex((p) => p.key));
  const order = [keyI, ...s.panels.map((p, i) => i).filter((i) => i !== keyI)];
  const boxes = [];
  if (wide) {
    const w = (W - 8 - gap * (n - 1)) / n;
    const hh = s.panels.some((p) => p.meanLabel) ? 210 : 196;
    s.panels.forEach((p, i) => boxes[i] = { x: 4 + i * (w + gap), y: 4, w, h: hh });
  } else {
    const kh = s.panels[keyI].meanLabel ? 210 : 196;
    boxes[keyI] = { x: 4, y: 4, w: W - 8, h: kh };
    const rest = order.slice(1), w = (W - 8 - gap * (rest.length - 1)) / rest.length;
    rest.forEach((i, k) => boxes[i] = { x: 4 + k * (w + gap), y: 4 + kh + gap, w, h: 176 });
  }
  let out = '';
  const xs = [-3.2, 3.2];
  s.panels.forEach((p, i) => {
    const b = boxes[i], key = !!p.key;
    out += `<rect x="${r1(b.x)}" y="${r1(b.y)}" width="${r1(b.w)}" height="${r1(b.h)}" rx="9" fill="${key ? C.keyBg : '#f7f9f8'}" stroke="${key ? C.key : '#c9d3cd'}" stroke-width="${key ? 2.2 : 1.2}"/>`;
    // title line, then the note (wrapped)
    const tagW = key ? textW('answer', 12) + 22 : 0;
    out += t(b.x + 10, b.y + 20, p.title, { size: 14, weight: 700, fill: key ? C.key : C.ink });
    if (key) out += badge(b.x + b.w - 8, b.y + 20, 'answer', { anchor: 'end' });
    const noteLines = wrap(p.note, b.w - 20, 12.5);
    noteLines.forEach((ln, k) => { out += t(b.x + 10, b.y + 38 + k * 15, ln, { size: 12.5, fill: C.ink2 }); });
    void tagW;
    // the plot
    const px = b.x + 10, pw = b.w - 20, top = b.y + 44 + noteLines.length * 15, base = b.y + b.h - (p.meanLabel ? 44 : 30);
    const ph = base - top;
    const N = 80, before = [], after = [];
    let ymax = 0;
    for (let k = 0; k <= N; k++) {
      const x = xs[0] + (xs[1] - xs[0]) * k / N;
      const yb = gauss(x, s.before.mean, s.before.sd), ya = mix(x, p.after);
      before.push([x, yb]); after.push([x, ya]); ymax = Math.max(ymax, yb, ya);
    }
    const X = (x) => px + (x - xs[0]) / (xs[1] - xs[0]) * pw, Y = (v) => base - v / ymax * ph;
    const pathOf = (pts) => pts.map((q, k) => (k ? 'L' : 'M') + r1(X(q[0])) + ',' + r1(Y(q[1]))).join(' ');
    out += `<path d="${pathOf(after)} L${r1(X(xs[1]))},${r1(base)} L${r1(X(xs[0]))},${r1(base)} Z" fill="${key ? '#bfe6d4' : '#f1dccb'}" opacity="0.75"/>`;
    out += `<path d="${pathOf(before)}" fill="none" stroke="#6b7a73" stroke-width="1.6" stroke-dasharray="5 4"/>`;
    out += `<path d="${pathOf(after)}" fill="none" stroke="${key ? C.key : C.trap}" stroke-width="2.4"/>`;
    out += `<path d="M${r1(px)},${r1(base)} H${r1(px + pw)}" stroke="${C.ink2}" stroke-width="1.4"/>`;
    // the mean before selection, marked on the axis
    if (p.meanLabel) {
      const mx = X(s.before.mean);
      out += `<path d="M${r1(mx)},${r1(base)} V${r1(top + 2)}" stroke="${C.ink2}" stroke-width="1" stroke-dasharray="2 3"/>`;
      out += t(mx, base + 15, p.meanLabel, { size: 12, anchor: 'middle', fill: C.ink2, weight: 700 });
      out += t(px + pw / 2, base + 30, s.x, { size: 12, anchor: 'middle', fill: C.mute });
    } else out += t(px + pw / 2, base + 15, s.x, { size: 12, anchor: 'middle', fill: C.mute });
  });
  const H = Math.max(...boxes.map((b) => b.y + b.h)) + 4;
  return { svg: out, H, swatches: [{ sw: '#6b7a73', dash: true, label: s.beforeLabel || 'dashed: before selection' }, { sw: C.key, label: s.afterLabel || 'solid: after selection' }] };
}

/* --------------------------------------------------------------- levels */
function levels(s, W) {
  const wide = W >= 560, pad = 6;
  const labelW = wide ? 200 : W - 2 * pad;
  const barX = wide ? pad + labelW + 12 : pad + 4;
  const tagW = wide ? 132 : 118;
  const barW = W - pad - barX - tagW - 18;
  const vmax = Math.max(...s.levels.flatMap((l) => [l.before, l.after]));
  let y = 6, out = '';
  const A = uid('lvA');
  out += `<defs><marker id="${A}" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="9" markerHeight="9" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${C.ink2}"/></marker></defs>`;
  // column heads over the bars and the change words
  out += t(barX, y + 12, 'before', { size: 12, fill: C.mute, weight: 700 });
  out += t(barX + 62, y + 12, 'after', { size: 12, fill: C.ink, weight: 700 });
  y += 20;
  const rowsY = [];
  const tagX = W - pad - tagW;
  s.levels.forEach((l, i) => {
    const subLines = l.sub ? wrap(l.sub, labelW - 4, 12) : [];
    const labH = 17 + subLines.length * 15;
    const rowTop = y;
    let by = y;
    out += t(pad, y + 14, l.label, { size: 13.5, weight: 700, fill: C.ink });
    subLines.forEach((ln, k) => { out += t(pad, y + 30 + k * 15, ln, { size: 12, fill: C.ink2 }); });
    if (!wide) by = y + labH + 4;
    // bars: before (thin, grey) over after (thick, colored)
    const wb = barW * l.before / vmax, wa = barW * l.after / vmax;
    const col = l.change === 'up' ? C.blue : l.change === 'down' ? C.trap : C.gold;
    if (l.before > 0) out += `<rect x="${r1(barX)}" y="${r1(by + 2)}" width="${r1(Math.max(2, wb))}" height="8" rx="2" fill="#b7c2bc"/>`;
    else out += `<rect x="${r1(barX)}" y="${r1(by + 2)}" width="26" height="8" rx="2" fill="none" stroke="#b7c2bc" stroke-dasharray="3 2"/>`;
    out += `<rect x="${r1(barX)}" y="${r1(by + 13)}" width="${r1(Math.max(2, wa))}" height="14" rx="3" fill="${col}"/>`;
    // the change, in words, with a drawn triangle (never color alone)
    const ty = by + 19;
    const tri = l.change === 'up' ? `M${r1(tagX + 6)},${r1(ty - 6)} l6,10 h-12 z` : l.change === 'down' ? `M${r1(tagX + 6)},${r1(ty + 6)} l6,-10 h-12 z` : `M${r1(tagX + 1)},${r1(ty - 5)} h10 v10 h-10 z`;
    out += `<path d="${tri}" fill="${col}"/>`;
    out += t(tagX + 18, ty + 4.5, l.word, { size: 13, weight: 700, fill: col === C.gold ? C.gold : col });
    const rowH = wide ? Math.max(labH, 32) : labH + 4 + 30;
    rowsY.push({ top: rowTop, bot: rowTop + rowH, barY: by });
    y += rowH + 10;
  });
  // the key: the column of changes, outlined, with a word badge
  if (s.keyLabel) {
    const top = rowsY[0].top - 2, bot = rowsY[rowsY.length - 1].bot + 2;
    out += `<rect x="${r1(tagX - 6)}" y="${r1(top - 2)}" width="${r1(tagW + 4)}" height="${r1(bot - top + 4)}" rx="8" fill="none" stroke="${C.key}" stroke-width="2.2"/>`;
    out += badge(tagX + tagW - 2, bot + 20, s.keyLabel, { anchor: 'end' });
    y = bot + 30;
  }
  return { svg: out, H: y + 4 };
}

/* ----------------------------------------------------------- saturation */
function saturation(s, W) {
  const pad = 8, left = pad + 26, right = W - pad - 6, top = 20, base = W >= 560 ? 250 : 236;
  const pw = right - left, ph = base - top;
  const vm = s.carrier.vmax, km = s.carrier.km, k = s.diffusion.k, xmax = s.xmax;
  const ymax = vm * 1.32;
  const X = (x) => left + x / xmax * pw, Y = (v) => base - Math.min(v, ymax) / ymax * ph;
  const N = 90, car = [], dif = [];
  for (let i = 0; i <= N; i++) { const x = xmax * i / N; car.push([x, vm * x / (km + x)]); dif.push([x, k * x]); }
  const path = (pts) => pts.filter((q) => q[1] <= ymax * 1.001).map((q, i) => (i ? 'L' : 'M') + r1(X(q[0])) + ',' + r1(Y(q[1]))).join(' ');
  let out = '';
  // axes
  out += `<path d="M${r1(left)},${r1(top - 6)} V${r1(base)} H${r1(right)}" fill="none" stroke="${C.ink2}" stroke-width="1.5"/>`;
  out += t(left + pw / 2, base + 18, s.x, { size: 12.5, anchor: 'middle', fill: C.ink2 });
  out += `<text x="${r1(pad + 12)}" y="${r1(top + ph / 2)}" font-size="12.5" fill="${C.ink2}" font-family="Arial, Helvetica, sans-serif" text-anchor="middle" transform="rotate(-90 ${r1(pad + 12)} ${r1(top + ph / 2)})">${s.y}</text>`;
  // the ceiling
  out += `<path d="M${r1(left)},${r1(Y(vm))} H${r1(right)}" stroke="${C.key}" stroke-width="1.4" stroke-dasharray="6 4"/>`;
  out += `<path d="${path(dif)}" fill="none" stroke="#6b7a73" stroke-width="2.2" stroke-dasharray="7 5"/>`;
  out += `<path d="${path(car)}" fill="none" stroke="${C.key}" stroke-width="3"/>`;
  // labels: the ceiling above its line at the right, diffusion beside its line, the carrier under the curve
  const L = s.labels || {};
  const cy = Y(vm) - 9;
  out += halo(t(right - 4, cy, L.ceiling || 'ceiling', { size: 12.5, anchor: 'end', weight: 700, fill: C.key }));
  out += badge(right - 4, cy - 20, 'answer', { anchor: 'end' });
  // simple diffusion: words under its line, past the middle
  const xd = Math.min(xmax * 0.66, ymax * 0.6 / k), yd = Y(k * xd);
  const dl = wrap(L.diffusion || 'simple diffusion', 130, 12.5 * 1.08);
  dl.forEach((ln, i) => { out += halo(t(X(xd) - 2, yd + 20 + i * 15, ln, { size: 12.5, anchor: 'end', fill: '#4f5d56', weight: 700 })); });
  // the carrier: words under its knee
  const xc = xmax * 0.15, ycv = Y(vm * xc / (km + xc));
  const cl = wrap(L.carrier || 'carrier', 150, 12.5 * 1.08);
  cl.forEach((ln, i) => { out += halo(t(X(xc) + 6, ycv + 24 + i * 15, ln, { size: 12.5, anchor: 'start', fill: C.key, weight: 700 })); });
  return { svg: out, H: base + 28 };
}

const KINDS = { selection, levels, saturation };
register('bio.chart', (s, box) => {
  const fn = KINDS[s.kind];
  if (!fn) throw new Error('no bio.chart kind ' + s.kind);
  const W = width(box), d = fn(s, W);
  box.innerHTML = svgOpen(W, d.H) + d.svg + '</svg>';
  if (d.swatches) {
    const ex = document.createElement('div');
    ex.className = 'vis-swatches';
    d.swatches.forEach((x) => {
      const sp = document.createElement('span'), i = document.createElement('i');
      i.style.background = x.dash ? 'repeating-linear-gradient(90deg,' + x.sw + ' 0 4px,transparent 4px 7px)' : x.sw;
      i.style.height = '3px'; i.style.width = '18px'; i.style.verticalAlign = '3px';
      sp.append(i, x.label); ex.append(sp);
    });
    box.append(ex);
  }
});
