// pat.js: PAT solution views on top of the PAT engine (tools/pat/engine,
// loaded by the page as classic scripts: window.PAT): pat.angles (truth panels + equal-arm fan), pat.unfold
// (the fold model opened one crease at a time), pat.cubes (see-through
// outline + floor maps). Also the question renderers for the preview.
// Ported from the pilot preview (question-system/preview/renderers/pat.js).
// itemData is the served PAT item (resolvePanel); chain, painted and kCubes
// were computed from it by the build, which checks them against the key.
import { register, C, t, r1, svgOpen, width, badge, h } from './core.js';

const P = () => { if (!window.PAT) throw new Error('PAT engine not loaded'); return window.PAT; };

export function patQuestion(item) {
  const E = P()[item.type];
  return { figure: E.renderFigure(item), option: (i) => E.renderOption(item, i), wideOptions: item.type === 'holepunch' };
}

/* ---------------- pat.angles ---------------- */
register('pat.angles', (s, box) => {
  const it = s.itemData, d = it.figure.degs, W = width(box);
  const order = d.map((v, i) => [v, i]).sort((a, b) => a[0] - b[0]);
  // 1. the angles as drawn, with their true sizes
  const truth = h('div', { class: 'pat-truth' });
  for (let i = 0; i < 4; i++) {
    const rank = order.findIndex((o) => o[1] === i) + 1;
    truth.append(h('figure', { class: 'pat-tpanel' }, h('div', { class: 'pat-paper', html: P().angles.panelSVG(it, i, 160) }), h('figcaption', {}, h('b', { text: 'Angle ' + (i + 1) }), ' ' + d[i] + ' deg', h('span', { class: 'rk', text: ' (' + ['1st', '2nd', '3rd', '4th'][rank - 1] + ')' }))));
  }
  box.append(truth);
  // 2. the fan: equal arms from one vertex, smallest to largest
  const wide = W >= 560, COL = ['#00704f', '#2f9c78', '#8c6a16', '#9b4500'];
  const R = wide ? Math.min(W - 190, 380) : W - 84, vx = 20;
  const top = R * Math.sin(Math.max(...d) * Math.PI / 180), vy = (wide ? 32 : 58) + top;
  let g = t(vx, 18, 'Same four angles, equal arms, one corner', { size: 13, weight: 700, fill: C.ink2 });
  g += `<line x1="${vx}" y1="${r1(vy)}" x2="${r1(vx + R)}" y2="${r1(vy)}" stroke="${C.ink}" stroke-width="2"/>`;
  const labX = vx + R + 18;
  let prevY = Infinity;
  order.forEach(([deg, i], k) => {
    const a = deg * Math.PI / 180, ex = vx + R * Math.cos(a), ey = vy - R * Math.sin(a);
    g += `<line x1="${vx}" y1="${r1(vy)}" x2="${r1(ex)}" y2="${r1(ey)}" stroke="${COL[k]}" stroke-width="2.2"/>`;
    if (!wide) {
      // phone: the angle's number at the end of its arm, so the fan reads without the colors
      const rr = R + (k % 2 ? 34 : 13), nx = vx + rr * Math.cos(a), ny = vy - rr * Math.sin(a) + 4.5;
      g += `<circle cx="${r1(nx)}" cy="${r1(ny - 4.5)}" r="10" fill="#fff" stroke="${COL[k]}" stroke-width="1.8"/>` + t(nx, ny, String(i + 1), { size: 12.5, weight: 700, anchor: 'middle', fill: COL[k] });
    }
    if (wide) {
      const lyy = Math.min(ey + 5, prevY - 21); prevY = lyy;
      g += `<line x1="${r1(ex)}" y1="${r1(ey)}" x2="${r1(labX - 4)}" y2="${r1(lyy - 4)}" stroke="${COL[k]}" stroke-width="1" stroke-dasharray="2 2"/>`;
      g += t(labX, lyy, (k + 1) + '. Angle ' + (i + 1) + ': ' + deg + ' deg', { size: 13, weight: 700, fill: COL[k] });
    }
  });
  const H = vy + 24;
  g += t(vx, H - 4, 'Order: ' + order.map((o) => o[1] + 1).join(', '), { size: 13.5, weight: 700, fill: C.key });
  box.append(h('div', { class: 'pat-fan', html: svgOpen(W, H + 4) + g + '</svg>' }));
  if (!wide) {
    const ol = h('ol', { class: 'pat-fan-key' });
    order.forEach(([deg, i], k) => ol.append(h('li', {}, h('i', { style: 'background:' + COL[k] }), 'Angle ' + (i + 1) + ': ' + deg + ' deg')));
    box.append(ol);
  }
});

/* ---------------- pat.unfold ---------------- */
function triVerts(i, j, tt) {
  const c = [i + 0.5, j + 0.5];
  if (tt === 'N') return [c, [i, j], [i + 1, j]];
  if (tt === 'E') return [c, [i + 1, j], [i + 1, j + 1]];
  if (tt === 'S') return [c, [i + 1, j + 1], [i, j + 1]];
  return [c, [i, j + 1], [i, j]];
}
function sheet(keys, holes, o) {
  const S = o.S, ox = 12, oy = 12, size = 4 * S + 24;
  let g = `<svg viewBox="0 0 ${size} ${size}" width="100%" style="max-width:${size}px;display:block;margin:0 auto" aria-hidden="true">`;
  // the full sheet's outline, faint, so you can see where paper will return
  g += `<rect x="${ox}" y="${oy}" width="${4 * S}" height="${4 * S}" fill="none" stroke="#d5dbd8" stroke-dasharray="3 3"/>`;
  for (let k = 1; k < 4; k++) g += `<line x1="${ox + k * S}" y1="${oy}" x2="${ox + k * S}" y2="${oy + 4 * S}" stroke="#eef1ef"/><line x1="${ox}" y1="${oy + k * S}" x2="${ox + 4 * S}" y2="${oy + k * S}" stroke="#eef1ef"/>`;
  const edges = {};
  keys.forEach((key) => {
    const p = key.split(','), v = triVerts(+p[0], +p[1], p[2]);
    g += `<polygon points="${v.map((q) => r1(ox + q[0] * S) + ',' + r1(oy + q[1] * S)).join(' ')}" fill="#fff" stroke="#fff" stroke-width="0.6"/>`;
    for (let e = 0; e < 3; e++) { const a = v[e], b = v[(e + 1) % 3]; const ek = [a.join(':'), b.join(':')].sort().join('|'); edges[ek] = (edges[ek] || 0) + 1; }
  });
  Object.keys(edges).forEach((ek) => { if (edges[ek] !== 1) return; const ab = ek.split('|').map((x) => x.split(':').map(Number)); g += `<line x1="${r1(ox + ab[0][0] * S)}" y1="${r1(oy + ab[0][1] * S)}" x2="${r1(ox + ab[1][0] * S)}" y2="${r1(oy + ab[1][1] * S)}" stroke="#111" stroke-width="2" stroke-linecap="round"/>`; });
  if (o.crease) {
    const f = o.crease;
    if (f.kind === 'v') g += `<line x1="${ox + f.c * S}" y1="${oy - 4}" x2="${ox + f.c * S}" y2="${oy + 4 * S + 4}" stroke="${C.blue}" stroke-width="2" stroke-dasharray="6 4"/>`;
    if (f.kind === 'h') g += `<line x1="${ox - 4}" y1="${oy + f.c * S}" x2="${ox + 4 * S + 4}" y2="${oy + f.c * S}" stroke="${C.blue}" stroke-width="2" stroke-dasharray="6 4"/>`;
  }
  const isNew = (p) => o.newHoles && o.newHoles.some((q) => q[0] === p[0] && q[1] === p[1]);
  holes.forEach((p) => { const nw = isNew(p); g += `<circle cx="${r1(ox + p[0] * S)}" cy="${r1(oy + p[1] * S)}" r="${S * 0.22}" fill="#111"/>`; if (nw) g += `<circle cx="${r1(ox + p[0] * S)}" cy="${r1(oy + p[1] * S)}" r="${S * 0.36}" fill="none" stroke="${C.key}" stroke-width="2.4"/>`; });
  return g + '</svg>';
}
register('pat.unfold', (s, box) => {
  const it = s.itemData, st = it.figure.steps, chain = s.chain, W = width(box);
  const S = W < 520 ? 22 : 30;
  const strip = h('div', { class: 'pat-unfold' });
  const n = st.length;
  // stage 0: folded and punched; stage k: folds n..n-k+1 opened
  const stages = [{ keys: st[n - 1].after, holes: chain[0], cap: 'Folded and punched: ' + chain[0].length + ' holes' }];
  for (let k = 1; k <= n; k++) {
    const f = st[n - k];
    const prev = chain[k - 1], cur = chain[k];
    const added = cur.filter((p) => !prev.some((q) => q[0] === p[0] && q[1] === p[1]));
    stages.push({ keys: f.before, holes: cur, crease: f.fold, newHoles: added, cap: 'Fold ' + (n - k + 1) + ' opened: ' + (added.length ? '+' + added.length + ' mirrored, ' : 'nothing new, ') + cur.length + ' holes' });
  }
  stages.forEach((sg, i) => {
    strip.append(h('figure', { class: 'pat-ustep' + (i === stages.length - 1 ? ' is-key' : '') }, h('div', { class: 'pat-paper', html: sheet(sg.keys, sg.holes, { S, crease: sg.crease, newHoles: sg.newHoles }) }), h('figcaption', { text: sg.cap })));
    if (i < stages.length - 1) strip.append(h('div', { class: 'pat-uarrow', 'aria-hidden': 'true' }));
  });
  box.append(strip);
});

/* ---------------- pat.cubes ---------------- */
// The question figure already sits above the explainer, so the picture does
// not copy it. Panel 1 lifts every floor above the answer cubes away and draws
// what is left with the engine's own figureSVG, the answer cubes outlined and
// numbered. Panel 2 is the floor maps. Every label is built from the item.
register('pat.cubes', (s, box) => {
  const it = s.itemData, cubes = it.figure.cubes, k = it.meta.k;
  const hl = {}; s.kCubes.forEach((c) => { hl[c] = 1; });
  const zTop = Math.max(...s.kCubes.map((c) => +c.split(',')[2]));
  const keep = cubes.filter((c) => c[2] <= zTop);
  let svgS = P().cubes.figureSVG({ cubes: keep }, { highlight: hl });
  const sc = 26, Pp = (x, y, z) => [(x - y) * 0.866 * sc, (x + y) * 0.5 * sc - z * sc];
  let over = '';
  const setKeep = {}; keep.forEach((c) => { setKeep[c.join(',')] = 1; });
  s.kCubes.forEach((key) => {
    const [x, y, z] = key.split(',').map(Number);
    // outline the top face (visible once the floors above are lifted) and number it
    const top = [[x, y, z + 1], [x + 1, y, z + 1], [x + 1, y + 1, z + 1], [x, y + 1, z + 1]].map((q) => Pp(...q));
    over += `<polygon points="${top.map((p) => r1(p[0]) + ',' + r1(p[1])).join(' ')}" fill="none" stroke="${C.key}" stroke-width="3"/>`;
    const cx = top.reduce((a2, p) => a2 + p[0], 0) / 4, cy = top.reduce((a2, p) => a2 + p[1], 0) / 4;
    over += `<text x="${r1(cx)}" y="${r1(cy + 5)}" font-size="14" font-weight="700" text-anchor="middle" fill="${C.key}" font-family="Arial" paint-order="stroke" stroke="#fff" stroke-width="3">${k}</text>`;
    // an arrow off each painted side that faces away from the viewer (-x: upper left, -y: upper right)
    const open = [];
    if (!setKeep[(x) + ',' + (y - 1) + ',' + z] && !cubes.some((c) => c[0] === x && c[1] === y - 1 && c[2] === z)) open.push('-y');
    if (!cubes.some((c) => c[0] === x - 1 && c[1] === y && c[2] === z)) open.push('-x');
    open.forEach((d) => {
      const m = d === '-y' ? Pp(x + 0.5, y, z + 0.5) : Pp(x, y + 0.5, z + 0.5), e = d === '-y' ? [m[0] + 24, m[1] - 14] : [m[0] - 24, m[1] - 14];
      over += `<line x1="${r1(m[0])}" y1="${r1(m[1])}" x2="${r1(e[0])}" y2="${r1(e[1])}" stroke="${C.key}" stroke-width="2.4"/><circle cx="${r1(e[0])}" cy="${r1(e[1])}" r="3.5" fill="${C.key}"/>`;
      over += `<text x="${r1(e[0] + (d === '-y' ? 6 : -6))}" y="${r1(e[1] - 6)}" font-size="12" font-weight="700" text-anchor="${d === '-y' ? 'start' : 'end'}" fill="${C.key}" font-family="Arial" paint-order="stroke" stroke="#fff" stroke-width="3">painted</text>`;
    });
  });
  svgS = svgS.replace('</svg>', over + '</svg>');
  // widen the viewBox a little so the side labels fit
  svgS = svgS.replace(/viewBox="([-\d.]+) ([-\d.]+) ([\d.]+) ([\d.]+)"/, (m0, a1, b1, c1, d1) => 'viewBox="' + (+a1 - 60).toFixed(1) + ' ' + (+b1 - 34).toFixed(1) + ' ' + (+c1 + 120).toFixed(1) + ' ' + (+d1 + 40).toFixed(1) + '"');
  const row = h('div', { class: 'pat-cubes-row' });
  const floorsLifted = Math.max(...cubes.map((c) => c[2])) - zTop;
  const capA = (floorsLifted ? 'Figure ' + it.figure.label + ', floor ' + (zTop + 1) + (zTop ? ' and below' : '') + ' only (the floors above lifted off). ' : 'Figure ' + it.figure.label + '. ') + 'Outlined: the cube' + (s.kCubes.length > 1 ? 's' : '') + ' with exactly ' + k + ' painted side' + (k > 1 ? 's' : '') + '.';
  row.append(h('figure', { class: 'pat-cfig' }, h('div', { class: 'pat-paper', html: svgS }), h('figcaption', { text: capA })));
  // floor maps, bottom floor first; the map's top edge is the drawing's upper-right side
  const xs = cubes.map((c) => c[0]), ys = cubes.map((c) => c[1]), zs = cubes.map((c) => c[2]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys), z1 = Math.max(...zs);
  const maps = h('div', { class: 'pat-maps' });
  maps.append(h('p', { class: 'pat-map-key', text: 'Maps: the top edge is the drawing\'s upper-right side (the back), the left edge its upper-left side.' }));
  for (let z = 0; z <= z1; z++) {
    const grid = h('div', { class: 'pat-map', style: 'grid-template-columns:repeat(' + (x1 - x0 + 1) + ',1fr)' });
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const key = x + ',' + y + ',' + z, has = key in s.painted;
      grid.append(h('span', { class: (has ? 'c' : 'e') + (hl[key] ? ' is-key' : ''), text: has ? String(s.painted[key]) : '' }));
    }
    maps.append(h('figure', { class: 'pat-mapfig' }, h('div', { class: 'pat-map-dir', text: 'back' }), grid, h('figcaption', { text: z === 0 ? 'Floor 1 (bottom)' : 'Floor ' + (z + 1) })));
  }
  row.append(maps);
  box.append(row);
  box.append(h('p', { class: 'vis-note', text: 'Each number is how many sides of that cube get paint. Cubes with exactly ' + k + ': ' + s.kCubes.length + ', outlined.' }));
});
