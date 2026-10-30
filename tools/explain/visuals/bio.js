// bio.js: bio.hardy-weinberg (pure port of the Genetics hub visualizer state),
// bio.osmolarity (new tally), bio.real (BioReal true-to-life views, reused),
// bio.diagram (new schematic library; mitochondrion for the pilot).
// Ported from the pilot preview (question-system/preview/renderers/bio.js).
import { register, C, t, r1, svgOpen, width, badge, arrowDefs, uid, h, wrap } from './core.js';

/* ---------------- bio.hardy-weinberg ---------------- */
register('bio.hardy-weinberg', (s, box) => {
  const W = width(box), q = Math.sqrt(s.q2), p = 1 - q;
  const wide = W >= 560;
  const cell = wide ? 17 : Math.min(19, Math.floor((W - 40) / 10) - 2), gap = 2, gridW = 10 * (cell + gap) - gap;
  const gx = wide ? 16 : (W - gridW) / 2, gy = 34;
  let out = '';
  out += t(gx, 20, s.gridTitle || '100 alleles from the gene pool', { size: 13, weight: 700, fill: C.ink2 });
  const nRec = Math.round(q * 100);
  for (let i = 0; i < 100; i++) {
    const r = Math.floor(i / 10), c = i % 10, x = gx + c * (cell + gap), y = gy + r * (cell + gap);
    const rec = i >= 100 - nRec;
    out += `<rect x="${r1(x)}" y="${r1(y)}" width="${cell}" height="${cell}" rx="2" fill="${rec ? C.key : '#e4ebe7'}" stroke="${rec ? C.green : '#c9d3cd'}" stroke-width="${rec ? 2 : 1}"/>`;
    if (rec) out += t(x + cell / 2, y + cell / 2 + 4.5, 'a', { size: 12, fill: '#fff', anchor: 'middle', weight: 700 });
  }
  const gyEnd = gy + 10 * (cell + gap);
  out += t(gx, gyEnd + 16, '1 recessive allele (a) in 100: q = ' + q.toFixed(2), { size: 13, fill: C.key, weight: 700 });
  // the ladder
  const lx = wide ? gx + gridW + 46 : 16, ly = wide ? 30 : gyEnd + 44, lw = wide ? W - lx - 16 : W - 32;
  const rung = (y, big, sub, kind, tag) => {
    const fill = kind === 'key' ? C.keyBg : kind === 'trap' ? '#f4f1ea' : '#f4f6f5';
    const stroke = kind === 'key' ? C.key : '#c9cfc9';
    let g = `<rect x="${r1(lx)}" y="${r1(y)}" width="${r1(lw)}" height="52" rx="8" fill="${fill}" stroke="${stroke}" stroke-width="${kind === 'key' ? 2.4 : 1.2}"${kind === 'muted' ? ' stroke-dasharray="4 3"' : ''}/>`;
    g += t(lx + 12, y + 22, big, { size: 16, weight: 700, fill: kind === 'muted' ? C.mute : C.ink });
    g += t(lx + 12, y + 41, sub, { size: 12.5, fill: C.ink2 });
    if (tag) g += badge(lx + lw - 10, y + 22, tag, kind === 'key' ? { anchor: 'end' } : { anchor: 'end', fill: '#fff', stroke: '#b9b2a2', ink: C.mute });
    return g;
  };
  const step = (y, label) => `<line x1="${r1(lx + 26)}" y1="${r1(y)}" x2="${r1(lx + 26)}" y2="${r1(y + 22)}" stroke="${C.ink2}" stroke-width="1.6" marker-end="url(#hwA)"/>` + t(lx + 38, y + 15, label, { size: 12.5, fill: C.ink2, italic: true });
  out += rung(ly, 'q squared = ' + s.q2, '1 affected person (aa) in 10,000', 'trap', 'the stem');
  out += step(ly + 54, 'take the square root');
  out += rung(ly + 80, 'q = ' + q.toFixed(2), '1 recessive allele in 100', 'key', 'Answer');
  out += step(ly + 134, 'p = 1 - q');
  out += rung(ly + 160, 'p = ' + p.toFixed(2), 'one step past the question', 'muted', null);
  const H = Math.max(gyEnd + 30, ly + 160 + 60);
  box.innerHTML = svgOpen(W, H) + arrowDefs('hwA', C.ink2) + out + '</svg>';
});

/* ---------------- bio.osmolarity ---------------- */
register('bio.osmolarity', (s, box) => {
  const W = width(box), wide = W >= 520;
  const m = s.solute.molarity, n = s.solute.ions.length, osm = Math.round(m * n * 1000);
  let out = '', H;
  const boxR = (x, y, w, hgt, title, lines, kind) => {
    const stroke = kind === 'key' ? C.key : '#b9c4be';
    let g = `<rect x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="${r1(hgt)}" rx="10" fill="${kind === 'key' ? C.keyBg : '#f7f9f8'}" stroke="${stroke}" stroke-width="${kind === 'key' ? 2 : 1.2}"/>`;
    g += t(x + w / 2, y + 22, title, { size: 13, weight: 700, anchor: 'middle', fill: C.ink2 });
    lines.forEach((l, i) => { g += t(x + w / 2, y + 46 + i * 20, l.s, { size: l.size || 14, anchor: 'middle', weight: l.b ? 700 : 400, fill: l.fill || C.ink }); });
    return g;
  };
  // particle dots: one formula unit = two ions
  const dots = (x, y, w) => {
    let g = '';
    for (let i = 0; i < 6; i++) {
      const cx = x + 18 + (i % 3) * ((w - 36) / 2), cy = y + Math.floor(i / 3) * 18;
      g += `<circle cx="${r1(cx - 6)}" cy="${r1(cy)}" r="5" fill="#c9a84c"/><circle cx="${r1(cx + 6)}" cy="${r1(cy)}" r="5" fill="#6f8f80"/>`;
    }
    return g;
  };
  if (wide) {
    const w = (W - 32 - 40) / 2;
    out += boxR(16, 8, w, 150, 'Outside the cell', [{ s: m + ' M NaCl' }, { s: 'x ' + n + ' ions each (Na+ and Cl-)', size: 12.5, fill: C.ink2 }, { s: '= ' + osm + ' mOsm', b: true, size: 16 }], 'plain');
    out += dots(16, 122, w);
    out += t(16 + w + 20, 86, '=', { size: 30, anchor: 'middle', weight: 700, fill: C.key });
    out += boxR(16 + w + 40, 8, w, 150, 'Inside the cell', [{ s: s.inside + ' mOsm' }, { s: 'given in the stem', size: 12.5, fill: C.ink2 }, { s: '= ' + s.inside + ' mOsm', b: true, size: 16 }], 'plain');
    out += badge(W / 2, 190, 'Isotonic: no net water flow', { anchor: 'middle', size: 13 });
    H = 204;
  } else {
    const w = W - 32;
    out += boxR(16, 8, w, 132, 'Outside the cell', [{ s: m + ' M NaCl x ' + n + ' ions' }, { s: 'Na+ and Cl- each count', size: 12.5, fill: C.ink2 }, { s: '= ' + osm + ' mOsm', b: true, size: 16 }], 'plain');
    out += t(W / 2, 166, '=', { size: 26, anchor: 'middle', weight: 700, fill: C.key });
    out += boxR(16, 178, w, 92, 'Inside the cell', [{ s: s.inside + ' mOsm, given in the stem' }], 'plain');
    out += badge(W / 2, 300, 'Isotonic: no net water flow', { anchor: 'middle', size: 13 });
    H = 314;
  }
  box.innerHTML = svgOpen(W, H) + out + '</svg>';
});

/* ---------------- bio.real (true-to-life, reused) ---------------- */
register('bio.real', (s, box) => {
  if (!window.BioReal || typeof window.BioReal[s.view] !== 'function') throw new Error('BioReal.' + s.view + ' not loaded');
  const inner = window.BioReal[s.view](s.params);
  if (s.smallTextKnown) box.dataset.smallKnown = s.smallTextKnown;   // flagged exception to the 12 px rule (fix lives in tools/bio/bio-real.js)
  box.innerHTML = '<svg viewBox="0 0 400 320" width="100%" style="max-width:440px;display:block;margin:0 auto;border-radius:8px" aria-hidden="true" focusable="false">' + inner + '</svg>';
});

/* ---------------- bio.diagram ---------------- */
const DIAGRAMS = {
  mitochondrion(s, W) {
    const narrow = W < 560;
    const Wd = narrow ? Math.max(W, 330) : W;
    const cx = Wd / 2, cy = 138, rx = Math.min(Wd / 2 - 24, 300), ry = narrow ? 100 : 104;
    const irx = rx - 22, iry = ry - 21;
    const A = uid('mA');
    // a small arrowhead in user units, so it never covers the complex labels
    let g = `<defs><marker id="${A}" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="9" markerHeight="9" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${C.blue}"/></marker></defs>`;
    g += `<rect x="4" y="6" width="${r1(Wd - 8)}" height="266" rx="14" fill="#f3f6f9" stroke="#dde3ea"/>`;
    g += `<ellipse cx="${r1(cx)}" cy="${cy}" rx="${r1(rx)}" ry="${ry}" fill="#e9eef7" stroke="#6f7f95" stroke-width="3"/>`;
    g += `<ellipse cx="${r1(cx)}" cy="${cy}" rx="${r1(irx)}" ry="${iry}" fill="#f6ecd2" stroke="${C.key}" stroke-width="4.5"/>`;
    const nC = narrow ? 4 : 6, w2 = 9;
    const fx = (i) => cx - irx * 0.66 + (i * 1.32 * irx) / (nC - 1);
    const edgeY = (x, top) => cy + (top ? -1 : 1) * iry * Math.sqrt(Math.max(0, 1 - Math.pow((x - cx) / irx, 2)));
    const fingers = [];
    for (let i = 0; i < nC; i++) {
      const x = fx(i), top = i % 2 === 0, yEdge = edgeY(x, top), depth = iry * 1.15, y2 = yEdge + (top ? depth : -depth);
      fingers.push({ x, top, yEdge, y2 });
      g += `<path d="M${r1(x - w2)},${r1(yEdge + (top ? -6 : 6))} L${r1(x - w2)},${r1(y2)} Q${r1(x)},${r1(y2 + (top ? 14 : -14))} ${r1(x + w2)},${r1(y2)} L${r1(x + w2)},${r1(yEdge + (top ? -6 : 6))} Z" fill="#e9eef7"/>`;
      g += `<path d="M${r1(x - w2)},${r1(yEdge)} L${r1(x - w2)},${r1(y2)} Q${r1(x)},${r1(y2 + (top ? 14 : -14))} ${r1(x + w2)},${r1(y2)} L${r1(x + w2)},${r1(yEdge)}" fill="none" stroke="${C.key}" stroke-width="4.5"/>`;
    }
    // complexes I to IV on the wall of finger 1 (matrix side to the left of the wall, crista lumen inside the finger).
    // I, III and IV pump H+ from the matrix into the lumen; II pumps none.
    const f1 = fingers[1], wall = f1.x - w2, top1 = Math.min(f1.yEdge, f1.y2) + 6, bot1 = Math.max(f1.yEdge, f1.y2) - 6;
    const cw = 18, chh = 13, gapc = Math.max(5, (bot1 - top1 - 4 * chh) / 3);
    const cx0 = wall - cw / 2;
    const cyK = (k) => top1 + k * (chh + gapc);
    ['I', 'II', 'III', 'IV'].forEach((nm, k) => {
      const pump = nm !== 'II';
      g += `<rect x="${r1(cx0)}" y="${r1(cyK(k))}" width="${cw}" height="${chh}" rx="3" fill="${pump ? '#7a4fb0' : '#d9cfe9'}" stroke="#4c2f73" stroke-width="1"/>`;
      g += t(cx0 + cw / 2, cyK(k) + 10.6, nm, { size: 12.6, weight: 700, anchor: 'middle', fill: pump ? '#fff' : '#3b2a59' });
    });
    // the pump arrow: from the matrix, between complexes II and III, into the crista lumen
    const yP = cyK(2) - gapc / 2;
    g += `<path d="M${r1(wall - 34)},${r1(yP - 16)} Q${r1(wall - 14)},${r1(yP)} ${r1(f1.x + 7)},${r1(yP)}" fill="none" stroke="${C.blue}" stroke-width="2" marker-end="url(#${A})"/>`;
    g += t(wall - 36, yP - 20, 'H+', { size: 13, weight: 700, fill: C.blue, anchor: 'end' }).replace('<text ', '<text paint-order="stroke" stroke="#f6ecd2" stroke-width="4" stroke-linejoin="round" ');
    // ATP synthase on finger 2: the stalk crosses the membrane, the head sits in the matrix; H+ returns through it
    const f2 = fingers[2], ya = (f2.yEdge + f2.y2) / 2, wallX = f2.x - w2;
    g += `<rect x="${r1(wallX - 3)}" y="${r1(ya - 4)}" width="9" height="8" fill="#c9a84c" stroke="#7a5f17" stroke-width="1.2"/>`;
    g += `<circle cx="${r1(wallX - 14)}" cy="${r1(ya)}" r="9" fill="#c9a84c" stroke="#7a5f17" stroke-width="1.4"/>`;
    g += `<path d="M${r1(f2.x + 3)},${r1(ya - 14)} Q${r1(f2.x)},${r1(ya)} ${r1(wallX + 4)},${r1(ya)} L${r1(wallX - 14)},${r1(ya)} Q${r1(wallX - 30)},${r1(ya)} ${r1(wallX - 36)},${r1(ya + 16)}" fill="none" stroke="${C.blue}" stroke-width="2" marker-end="url(#${A})"/>`;
    // numbered markers for the five places in the choices
    const mid = (fx(2) + fx(3)) / 2;
    const marks = [
      { n: 1, x: 22, y: 26, label: 'Cytosol' },
      { n: 2, x: cx + rx * 0.62, y: cy - ry * 0.79, label: 'Outer membrane' },
      { n: 3, x: cx - (rx + irx) / 2, y: cy, label: 'Intermembrane space' },
      { n: 4, x: cx + irx * 0.62, y: cy + iry * 0.79, label: 'Inner membrane and its folds', key: true },
      { n: 5, x: mid, y: cy + (narrow ? 0 : 6), label: 'Matrix' }
    ];
    marks.forEach((m) => {
      g += `<circle cx="${r1(m.x)}" cy="${r1(m.y)}" r="11" fill="${m.key ? C.key : '#fff'}" stroke="${m.key ? C.key : C.ink2}" stroke-width="1.6"/>` + t(m.x, m.y + 4.5, String(m.n), { size: 13, weight: 700, anchor: 'middle', fill: m.key ? '#fff' : C.ink });
    });
    return { svg: g, H: 276, W: Wd, legend: marks, extraLegend: [{ sw: '#7a4fb0', label: 'Complexes I, III, IV pump H+' }, { sw: '#b9a8d3', label: 'Complex II pumps none' }, { sw: '#c9a84c', label: 'ATP synthase' }, { sw: C.blue, label: 'H+ out through the pumps, back through ATP synthase' }] };
  }
};
register('bio.diagram', (s, box) => {
  const W = width(box), d = DIAGRAMS[s.diagram](s, W);
  box.innerHTML = svgOpen(d.W, d.H) + d.svg + '</svg>';
  const ul = h('ol', { class: 'vis-legend' });
  d.legend.forEach((m) => ul.append(h('li', { class: m.key ? 'is-key' : '' }, h('span', { class: 'n', text: String(m.n) }), h('span', { text: m.label + (m.key ? '  (answer)' : '') }))));
  box.append(ul);
  if (d.extraLegend) {
    const ex = h('div', { class: 'vis-swatches' });
    d.extraLegend.forEach((x) => ex.append(h('span', {}, h('i', { style: 'background:' + x.sw }), x.label)));
    box.append(ex);
  }
});
