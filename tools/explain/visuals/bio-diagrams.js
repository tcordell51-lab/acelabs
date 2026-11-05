// bio-diagrams.js: more bio.diagram drawings, added to the DIAGRAMS map that
// bio.js exports (the mitochondrion lives there).
//
//   pathway       a flow of boxes and arrows on a grid, with optional membrane
//                 bands: cycles (nitrogen, Calvin), signaling routes, pumps and
//                 carriers, side-by-side "match the job" tables
//   chromosomes   chromosome pictures: meiosis counts (cells at each stage, the
//                 counts read off the drawing), the stages of mitosis, and a
//                 compare of chromosome changes
//   amniote-egg   the four extraembryonic membranes in a shelled egg
//   junctions     two animal cells joined by tight, anchoring and gap junctions
//
// Every drawing is laid out at the width it is shown (314 px on a 390 px
// phone, about 600 px on a desktop), with text at 12 px or larger; words that
// would crowd the drawing go to the numbered legend under it. The key's place
// is outlined and labeled in words, never marked by color alone.
import { C, t, r1, wrap, textW, uid, badge } from './core.js';
import { DIAGRAMS } from './bio.js';

const halo = (svgText, color = '#fff') => svgText.replace('<text ', `<text paint-order="stroke" stroke="${color}" stroke-width="4" stroke-linejoin="round" `);
const BOLDW = 1.08;   // bold text runs about 8 percent wider than wrap() assumes
const TONE = {
  box: { fill: '#f4f7f5', stroke: '#aab8b0', ink: C.ink },
  protein: { fill: '#ece4f7', stroke: '#6a4a97', ink: '#3b2a59' },
  start: { fill: C.goldBg, stroke: '#b59a55', ink: '#5a4510' },
  end: { fill: C.mintBg, stroke: '#4fae8e', ink: '#0d4d38' },
  blocked: { fill: '#fbece0', stroke: C.trap, ink: '#6b3000' },
  note: { fill: 'none', stroke: 'none', ink: C.ink2 }
};
const EDGE = {
  plain: { stroke: C.ink2, w: 1.8 },
  key: { stroke: C.key, w: 3 },
  proton: { stroke: C.blue, w: 2.2 },
  leak: { stroke: C.blue, w: 2.2, dash: '5 4' },
  blocked: { stroke: C.trap, w: 2, dash: '6 4' },
  muted: { stroke: '#8f9c95', w: 1.6, dash: '4 4' }
};
function arrowHead(id, color) {
  return `<marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="10" markerHeight="10" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${color}"/></marker>`;
}

/* =============================================================== pathway */
// spec: { cols, nodes: [{ id, label, sub?, col, row, span?, w?, kind?, key?,
//   tag?, change?: 'up'|'down', changeText?, choice? }], edges: [{ from, to,
//   n?, label?, style?, key?, at?, toAt?, offset?, curve?, labelAt?, choice? }],
//   bands?: [{ row, kind?: 'membrane' }], vband?: { col }, regions?: [{ row,
//   col, label, align? }], heads?: [{ col, span?, label }], legend?: [{ n,
//   label, key? }], swatches?: [{ sw, label }], gap?, gaps? }
function pathway(s, W) {
  const narrow = W < 560, pad = 6;
  const cols = s.cols || 3;
  const colW = (W - 2 * pad) / cols;
  const LS = narrow ? 13 : 13.5, SS = 12, LH = narrow ? 15.5 : 16.5, SH = 14.5;
  const nodes = {};
  // measure each node
  s.nodes.forEach((n) => {
    const span = n.span || 1, cw = colW * span;
    const bw = n.w ? cw * n.w : Math.min(cw - (narrow ? 10 : 18), (narrow ? 1000 : 220) * span);
    const inner = bw - (narrow ? 10 : 16);
    const kind = n.kind || 'box';
    const lab = wrap(n.label, inner, LS * BOLDW);
    const sub = n.sub ? wrap(n.sub, inner, SS) : [];
    const chg = n.change ? wrap(n.changeText || (n.change === 'up' ? 'rises' : 'falls'), inner - 16, 12.5 * BOLDW) : [];
    const h = Math.max(n.minH || 0, (kind === 'note' ? 4 : 9) + lab.length * LH + sub.length * SH + chg.length * 15 + (chg.length ? 4 : 0) + (kind === 'note' ? 2 : 7));
    nodes[n.id] = Object.assign({}, n, { span, cw, bw, lab, sub, chg, h, kind });
  });
  const rowsN = Math.max(...s.nodes.map((n) => n.row)) + 1;
  const bandRows = new Set((s.bands || []).map((b) => b.row));
  const rowH = Array.from({ length: rowsN }, (_, r) => Math.max(28, ...Object.values(nodes).filter((n) => n.row === r).map((n) => n.h)));
  const gapOf = (r) => (s.gaps && s.gaps[r] != null ? s.gaps[r] : (s.gap != null ? s.gap : 34));
  // column heads
  let y = 4, out = '';
  const defsId = uid('pw');
  let defs = '';
  const markers = {};
  const markerFor = (color) => { if (!markers[color]) { markers[color] = defsId + '-' + Object.keys(markers).length; defs += arrowHead(markers[color], color); } return markers[color]; };
  if (s.heads) {
    let hh = 0;
    s.heads.forEach((hd) => {
      const span = hd.span || 1, x0 = pad + hd.col * colW;
      const lines = wrap(hd.label, colW * span - 10, 12.5 * BOLDW);
      lines.forEach((ln, i) => { out += t(x0 + colW * span / 2, y + 13 + i * 15, ln, { size: 12.5, weight: 700, anchor: 'middle', fill: C.ink2 }); });
      hh = Math.max(hh, lines.length * 15);
    });
    y += hh + 8;
  }
  const rowTop = [];
  const badged = (r) => Object.values(nodes).some((n) => n.row === r && (n.key || n.tag) && n.tag !== false);
  for (let r = 0; r < rowsN; r++) {
    if (badged(r)) y = Math.max(y, (r ? y - gapOf(r - 1) : y) + (r ? Math.max(gapOf(r - 1), 26) : 20));
    rowTop[r] = y + (bandRows.has(r) ? 8 : 0); y = rowTop[r] + rowH[r] + (bandRows.has(r) ? 8 : 0) + (r < rowsN - 1 ? gapOf(r) : 0);
  }
  const H = y + 8;
  // place the boxes
  Object.values(nodes).forEach((n) => {
    n.x = pad + n.col * colW + (n.cw - n.bw) / 2;
    n.y = rowTop[n.row] + (rowH[n.row] - n.h) / 2;
    n.cx = n.x + n.bw / 2; n.cy = n.y + n.h / 2;
  });
  // membrane bands (behind everything)
  (s.bands || []).forEach((b) => {
    const y1 = rowTop[b.row] - 8, y2 = rowTop[b.row] + rowH[b.row] + 8;
    out += `<rect x="${pad / 2}" y="${r1(y1)}" width="${r1(W - pad)}" height="${r1(y2 - y1)}" fill="#f3ead2" stroke="none"/>`;
    for (let x = pad; x < W - pad; x += 9) out += `<circle cx="${r1(x)}" cy="${r1(y1 + 3)}" r="2.7" fill="#c9a84c"/><circle cx="${r1(x)}" cy="${r1(y2 - 3)}" r="2.7" fill="#c9a84c"/>`;
  });
  if (s.vband) {
    const x1 = pad + s.vband.col * colW + 4, x2 = x1 + colW - 8, y1 = rowTop[0] - 6, y2 = rowTop[rowsN - 1] + rowH[rowsN - 1] + 6;
    out += `<rect x="${r1(x1)}" y="${r1(y1)}" width="${r1(x2 - x1)}" height="${r1(y2 - y1)}" fill="#f3ead2" stroke="none"/>`;
    for (let yy = y1 + 4; yy < y2; yy += 9) out += `<circle cx="${r1(x1 + 3)}" cy="${r1(yy)}" r="2.7" fill="#c9a84c"/><circle cx="${r1(x2 - 3)}" cy="${r1(yy)}" r="2.7" fill="#c9a84c"/>`;
  }
  // region words (author places them in an empty cell)
  (s.regions || []).forEach((g) => {
    const x0 = pad + g.col * colW, cy = rowTop[g.row] + rowH[g.row] / 2;
    const lines = wrap(g.label, colW - 8, 12 * BOLDW);
    const ax = g.align === 'left' ? x0 + 4 : g.align === 'right' ? x0 + colW - 4 : x0 + colW / 2;
    lines.forEach((ln, i) => { out += t(ax, cy - (lines.length - 1) * 7 + 4 + i * 14, ln, { size: 12, weight: 700, fill: C.mute, anchor: g.align === 'left' ? 'start' : g.align === 'right' ? 'end' : 'middle' }); });
  });
  // edges
  const labels = [];
  const clip = (n, px, py) => {   // where the line from the box center to (px, py) leaves the box
    const dx = px - n.cx, dy = py - n.cy;
    if (!dx && !dy) return [n.cx, n.cy];
    const sx = dx ? (n.bw / 2 + 3) / Math.abs(dx) : Infinity, sy = dy ? (n.h / 2 + 3) / Math.abs(dy) : Infinity, k = Math.min(sx, sy);
    return [n.cx + dx * k, n.cy + dy * k];
  };
  (s.edges || []).forEach((e) => {
    const A = nodes[e.from], B = nodes[e.to];
    if (!A || !B) throw new Error('pathway edge ' + e.from + ' to ' + e.to + ': unknown node');
    const st = EDGE[e.style || (e.key ? 'key' : 'plain')];
    let x1, y1, x2, y2;
    const off = e.offset || 0;
    const ovL = Math.max(A.x, B.x), ovR = Math.min(A.x + A.bw, B.x + B.bw);
    const ovT = Math.max(A.y, B.y), ovB = Math.min(A.y + A.h, B.y + B.h);
    if (A.row !== B.row && ovR - ovL > 12) {            // stacked: a vertical arrow
      const fx = e.at != null ? A.x + A.bw * e.at : (ovL + ovR) / 2 + off;
      const tx = e.toAt != null ? B.x + B.bw * e.toAt : fx;
      const down = B.y > A.y;
      x1 = fx; y1 = down ? A.y + A.h + 2 : A.y - 2; x2 = tx; y2 = down ? B.y - 3 : B.y + B.h + 3;
    } else if (A.row === B.row || ovB - ovT > 8) {     // side by side: a horizontal arrow
      const fy = e.at != null ? A.y + A.h * e.at : (A.row === B.row ? (Math.max(A.y, B.y) + Math.min(A.y + A.h, B.y + B.h)) / 2 : (ovT + ovB) / 2) + off;
      const right = B.x > A.x;
      x1 = right ? A.x + A.bw + 2 : A.x - 2; y1 = fy; x2 = right ? B.x - 3 : B.x + B.bw + 3; y2 = e.toAt != null ? B.y + B.h * e.toAt : fy;
    } else {                                             // diagonal: center to center, clipped
      [x1, y1] = clip(A, B.cx, B.cy); [x2, y2] = clip(B, A.cx, A.cy);
    }
    let d = `M${r1(x1)},${r1(y1)} L${r1(x2)},${r1(y2)}`, mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
    const la = e.labelAt != null ? e.labelAt : 0.5;
    mx = x1 + (x2 - x1) * la; my = y1 + (y2 - y1) * la;
    if (e.curve) {
      const len = Math.hypot(x2 - x1, y2 - y1), nx = -(y2 - y1) / len, ny = (x2 - x1) / len;
      const cx = (x1 + x2) / 2 + nx * e.curve * len, cy = (y1 + y2) / 2 + ny * e.curve * len;
      d = `M${r1(x1)},${r1(y1)} Q${r1(cx)},${r1(cy)} ${r1(x2)},${r1(y2)}`;
      const u = la; mx = (1 - u) * (1 - u) * x1 + 2 * (1 - u) * u * cx + u * u * x2; my = (1 - u) * (1 - u) * y1 + 2 * (1 - u) * u * cy + u * u * y2;
    }
    out += `<path d="${d}" fill="none" stroke="${st.stroke}" stroke-width="${st.w}"${st.dash ? ` stroke-dasharray="${st.dash}"` : ''} marker-end="url(#${markerFor(st.stroke)})"/>`;
    if (e.style === 'blocked') {   // a cross on the blocked arrow
      const bx = x1 + (x2 - x1) * 0.3, by = y1 + (y2 - y1) * 0.3;
      out += `<path d="M${r1(bx - 6)},${r1(by - 6)} L${r1(bx + 6)},${r1(by + 6)} M${r1(bx + 6)},${r1(by - 6)} L${r1(bx - 6)},${r1(by + 6)}" stroke="${C.trap}" stroke-width="3" stroke-linecap="round"/>`;
    }
    if (e.n != null || e.label) {
      const len = Math.hypot(x2 - x1, y2 - y1);
      const need = e.n != null ? 30 : textW(e.label, 12.5 * BOLDW) + 14;
      let side = null;
      if (len < need && e.labelDy == null && e.labelDx == null) {
        if (Math.abs(x2 - x1) >= Math.abs(y2 - y1)) my -= e.n != null ? 17 : 12; else { mx += e.n != null ? 17 : 8; side = 'start'; }
      }
      labels.push({ e, x: mx, y: my, key: !!e.key, st, side });
    }
  });
  // boxes
  Object.values(nodes).forEach((n) => {
    const tone = n.key ? { fill: C.keyBg, stroke: C.key, ink: C.key } : TONE[n.kind] || TONE.box;
    if (n.kind !== 'note') out += `<rect x="${r1(n.x)}" y="${r1(n.y)}" width="${r1(n.bw)}" height="${r1(n.h)}" rx="${n.kind === 'protein' ? 12 : 8}" fill="${tone.fill}" stroke="${tone.stroke}" stroke-width="${n.key ? 2.6 : 1.3}"${n.kind === 'gap' ? ' stroke-dasharray="4 3"' : ''}/>`;
    const tx = n.cx;
    const content = (n.kind === 'note' ? 4 : 9) + n.lab.length * LH + n.sub.length * SH + n.chg.length * 15 + (n.chg.length ? 4 : 0) + (n.kind === 'note' ? 2 : 7);
    let yy = n.y + (n.kind === 'note' ? 4 : 9) + 11.5 + (n.minH && n.minH > content && !n.top ? 0 : 0);
    n.lab.forEach((ln) => { out += t(tx, yy, ln, { size: LS, weight: 700, anchor: 'middle', fill: n.kind === 'note' ? C.ink2 : tone.ink }); yy += LH; });
    n.sub.forEach((ln) => { out += t(tx, yy - 1, ln, { size: SS, anchor: 'middle', fill: n.kind === 'note' ? C.mute : C.ink2, italic: n.kind === 'note' }); yy += SH; });
    if (n.chg.length) {
      const col = n.change === 'up' ? C.blue : C.trap;
      const w0 = Math.max(...n.chg.map((ln) => textW(ln, 12.5 * BOLDW))) + 16, x0 = tx - w0 / 2;
      const ty = yy + 2;
      out += n.change === 'up' ? `<path d="M${r1(x0 + 5)},${r1(ty - 9)} l5,9 h-10 z" fill="${col}"/>` : `<path d="M${r1(x0 + 5)},${r1(ty)} l5,-9 h-10 z" fill="${col}"/>`;
      n.chg.forEach((ln, i) => { out += t(x0 + 15, ty + i * 15, ln, { size: 12.5, weight: 700, fill: col }); });
    }
    if ((n.key || n.tag) && n.tag !== false) {
      const word = n.tag || 'answer';
      out += badge(n.x + n.bw - 4, n.y + 1, word, n.key ? { anchor: 'end', size: 12 } : { anchor: 'end', size: 12, fill: '#fff', stroke: '#b9b2a2', ink: C.mute });
    }
  });
  // edge numbers and words, on top of everything
  labels.forEach(({ e, x, y: ly, key, st, side }) => {
    let x0 = x;
    if (e.n != null) {
      out += `<circle cx="${r1(x)}" cy="${r1(ly)}" r="11" fill="${key ? C.key : '#fff'}" stroke="${key ? C.key : st.stroke}" stroke-width="1.6"/>` + t(x, ly + 4.5, String(e.n), { size: 13, weight: 700, anchor: 'middle', fill: key ? '#fff' : C.ink });
      x0 = x + 15;
    }
    if (e.label) {
      const lines = wrap(e.label, e.labelW || 110, 12.5 * BOLDW);
      const anchor = e.n != null ? 'start' : (e.labelAnchor || side || 'middle');
      const lx = e.n != null ? x0 : x + (e.labelDx || 0);
      lines.forEach((ln, i) => { out += halo(t(lx, ly + 4.5 + (i - (lines.length - 1) / 2) * 14 + (e.labelDy || 0), ln, { size: 12.5, weight: 700, anchor, fill: key ? C.key : st.stroke === C.ink2 ? C.ink : st.stroke })); });
    }
  });
  const legend = (s.legend || []).map((m) => ({ n: m.n, label: m.label, key: !!m.key }));
  return { svg: '<defs>' + defs + '</defs>' + out, H, W, legend, extraLegend: s.swatches || null };
}

/* =========================================================== chromosomes */
const PAIR = [['#1f57b5', '#8fb0e6'], ['#b8321f', '#e7a497'], ['#1d7a36', '#93cfa3'], ['#8a6d00', '#e0c76a'], ['#6b3aa8', '#c3a6e6']];
// one chromosome drawn upright at (x, y = top): two sister chromatids side by side when copied
function chrom(x, y, len, color, copied, o = {}) {
  const w = o.w || 4.6, gapc = 1.2;
  const cen = y + len * (o.cen || 0.42);
  let g = '';
  const rod = (rx) => `<rect x="${r1(rx)}" y="${r1(y)}" width="${w}" height="${r1(len)}" rx="${r1(w / 2)}" fill="${color}"${o.outline ? ` stroke="${o.outline}" stroke-width="1.6"` : ''}/>`;
  if (copied) g += rod(x - w - gapc / 2) + rod(x + gapc / 2);
  else g += rod(x - w / 2);
  g += `<rect x="${r1(x - (copied ? w + 1 : w / 2 + 1))}" y="${r1(cen - 1.3)}" width="${r1(copied ? 2 * w + 2 : w + 2)}" height="2.6" fill="#fff" opacity="0.85"/>`;
  return g;
}
function cellOutline(cx, cy, rx, ry, key) {
  return `<ellipse cx="${r1(cx)}" cy="${r1(cy)}" rx="${r1(rx)}" ry="${r1(ry)}" fill="${key ? '#eef9f3' : '#f7f8fb'}" stroke="${key ? C.key : '#8e9aa6'}" stroke-width="${key ? 2.6 : 1.6}"/>`;
}
function spindle(cx, cy, rx, ry, targets) {   // fibers from each pole to the kinetochores
  let g = '';
  const pl = [cx - rx + 8, cy], pr = [cx + rx - 8, cy];
  targets.forEach(([x, y, side]) => { const p = side < 0 ? pl : pr; g += `<path d="M${r1(p[0])},${r1(p[1])} L${r1(x)},${r1(y)}" stroke="#7d8b84" stroke-width="0.9" fill="none"/>`; });
  g += `<circle cx="${r1(pl[0])}" cy="${r1(pl[1])}" r="3.4" fill="#5c6a63"/><circle cx="${r1(pr[0])}" cy="${r1(pr[1])}" r="3.4" fill="#5c6a63"/>`;
  return g;
}
// meiosis counts: start, metaphase I, metaphase II, with the counts taken from what is drawn
function meiosisCounts(s, W) {
  const n2 = s.n2, pairs = n2 / 2;
  const wide = W >= 520;
  const stages = [
    { id: 'start', title: s.titles && s.titles.start || 'Start: 2n = ' + n2, chromosomes: n2, chromatids: n2, copied: false, note: 'not yet copied' },
    { id: 'mi', title: 'Metaphase I', chromosomes: n2, chromatids: 2 * n2, copied: true, note: null },
    { id: 'mii', title: 'Metaphase II', chromosomes: pairs, chromatids: 2 * pairs, copied: true, note: null }
  ];
  const keyStages = new Set(s.keyStages || ['mi', 'mii']);
  let out = '';
  const cellW = wide ? (W - 40) / 3 : 132, cellH = 112;
  const len = Math.min(18, 70 / pairs);
  stages.forEach((st, i) => {
    const ROW = 148;
    const bx = wide ? 4 + i * ((W - 8) / 3) : 4, by = wide ? 6 : 6 + i * ROW;
    const cx = bx + (wide ? (W - 8) / 6 : cellW / 2 + 2), cy = by + cellH / 2;
    const rx = (wide ? Math.min(cellW, 170) : cellW) / 2 - 4, ry = cellH / 2 - 6;
    const key = keyStages.has(st.id);
    out += cellOutline(cx, cy, rx, ry, key);
    const tg = [];
    let g = '';
    if (st.id === 'start') {   // inside a nucleus, scattered, single rods
      out += `<ellipse cx="${r1(cx)}" cy="${r1(cy)}" rx="${r1(rx * 0.62)}" ry="${r1(ry * 0.66)}" fill="#fff" stroke="#b9c3cc" stroke-width="1.2"/>`;
      for (let p = 0; p < pairs; p++) for (let hmo = 0; hmo < 2; hmo++) {
        const k = p * 2 + hmo, ang = (k / n2) * 6.283 + 0.4;
        const x = cx + Math.cos(ang) * rx * 0.36, y = cy + Math.sin(ang) * ry * 0.34 - len / 2;
        g += chrom(x, y, len * (1 - p * 0.12), PAIR[p % 5][hmo], false);
      }
    } else if (st.id === 'mi') {   // homolog pairs side by side across the plate
      const step = (2 * ry - 16) / pairs;
      for (let p = 0; p < pairs; p++) {
        const yy = cy - ry + 10 + p * step + (step - len * (1 - p * 0.12)) / 2, l = len * (1 - p * 0.12);
        g += chrom(cx - 7, yy, l, PAIR[p % 5][0], true) + chrom(cx + 7, yy, l, PAIR[p % 5][1], true);
        tg.push([cx - 13, yy + l * 0.42, -1], [cx + 13, yy + l * 0.42, 1]);
      }
      out += `<path d="M${r1(cx)},${r1(cy - ry + 6)} V${r1(cy + ry - 6)}" stroke="#c6ced5" stroke-width="1" stroke-dasharray="3 3"/>`;
    } else {   // one of each pair, single file on the plate
      const step = (2 * ry - 16) / pairs;
      for (let p = 0; p < pairs; p++) {
        const l = len * (1 - p * 0.12), yy = cy - ry + 10 + p * step + (step - l) / 2;
        g += chrom(cx, yy, l, PAIR[p % 5][p % 2], true);
        tg.push([cx - 6, yy + l * 0.42, -1], [cx + 6, yy + l * 0.42, 1]);
      }
    }
    if (tg.length) out += spindle(cx, cy, rx, ry, tg);
    out += g;
    // the counts, read off what was drawn
    const lines = [st.title, st.chromosomes + ' chromosomes', st.copied ? st.chromatids + ' chromatids' : st.note];
    const tx = wide ? cx : bx + cellW + 14, ty = wide ? by + cellH + 18 : cy - 28;
    lines.forEach((ln, k) => { out += t(tx, ty + k * 17, ln, { size: k ? 13 : 13.5, weight: k === 2 && st.copied ? 700 : k ? 400 : 700, anchor: wide ? 'middle' : 'start', fill: k === 2 && key && st.copied ? C.key : C.ink }); });
    if (key && st.copied) {
      out += badge(wide ? cx : tx, ty + 2 * 17 + 23, 'answer', { anchor: wide ? 'middle' : 'start' });
    }
    // the step to the next cell: an arrow between cells (wide), a line of words under the row (phone)
    if (i < 2 && s.steps && s.steps[i]) {
      if (wide) { const ax = bx + (W - 8) / 3; out += `<path d="M${r1(ax - 14)},${r1(cy)} h22" stroke="${C.ink2}" stroke-width="2" marker-end="url(#mcA)"/>`; }
      else wrap('Next: ' + s.steps[i], W - 20, 12).slice(0, 1).forEach((ln) => { out += t(10, by + ROW - 14, ln, { size: 12, italic: true, fill: C.mute }); });
    }
  });
  const H = wide ? 6 + cellH + 18 + 3 * 17 + 26 : 6 + 3 * 148 - 22;
  const defs = `<defs><marker id="mcA" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="9" markerHeight="9" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="${C.ink2}"/></marker></defs>`;
  return { svg: defs + out, H, W };
}

// the stages of mitosis, one small cell each
function mitosisStages(s, W) {
  const wide = W >= 560;
  const list = s.stages;
  const per = wide ? list.length : 3;
  const cw = (W - 8) / per, chH = 92;
  let out = '';
  const rowsN = Math.ceil(list.length / per);
  const linesOf = (st) => [st.title, ...wrap(st.note, cw - 8, 12)];
  const rowHs = [];
  for (let r = 0; r < rowsN; r++) { const sl = list.slice(r * per, r * per + per); rowHs[r] = chH + 20 + Math.max(...sl.map((st) => linesOf(st).length)) * 15 + (sl.some((st) => st.key) ? 30 : 6); }
  const rowY = (r) => 6 + rowHs.slice(0, r).reduce((a, b) => a + b, 0);
  list.forEach((st, i) => {
    const r = Math.floor(i / per), c = i % per;
    const inRow = Math.min(per, list.length - r * per);
    const x0 = 4 + c * cw + (per - inRow) * cw / 2, y0 = rowY(r);
    const cx = x0 + cw / 2, cy = y0 + chH / 2, rx = Math.min(cw / 2 - 6, 62), ry = chH / 2 - 6;
    const key = !!st.key;
    let g = '';
    if (st.id === 'telophase') {
      // two daughter cells pinching apart
      g += `<path d="M${r1(cx)},${r1(cy - ry + 10)} C${r1(cx - rx * 1.25)},${r1(cy - ry - 6)} ${r1(cx - rx * 1.25)},${r1(cy + ry + 6)} ${r1(cx)},${r1(cy + ry - 10)} C${r1(cx + rx * 1.25)},${r1(cy + ry + 6)} ${r1(cx + rx * 1.25)},${r1(cy - ry - 6)} ${r1(cx)},${r1(cy - ry + 10)} Z" fill="${key ? '#eef9f3' : '#f7f8fb'}" stroke="${key ? C.key : '#8e9aa6'}" stroke-width="${key ? 2.6 : 1.6}"/>`;
      [-1, 1].forEach((sd) => {
        const nx = cx + sd * rx * 0.5;
        g += `<ellipse cx="${r1(nx)}" cy="${r1(cy)}" rx="${r1(rx * 0.28)}" ry="${r1(ry * 0.42)}" fill="#fff" stroke="#9aa6b1" stroke-width="1.2" stroke-dasharray="3 2"/>`;
        for (let k = 0; k < 4; k++) g += `<path d="M${r1(nx - 6 + k * 4)},${r1(cy - 8 + (k % 2) * 4)} q2,6 0,12" stroke="${PAIR[k][0]}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
      });
    } else {
      g += cellOutline(cx, cy, rx, ry, key);
      if (st.id === 'interphase') {
        g += `<ellipse cx="${r1(cx)}" cy="${r1(cy)}" rx="${r1(rx * 0.5)}" ry="${r1(ry * 0.6)}" fill="#fff" stroke="#9aa6b1" stroke-width="1.3"/>`;
        for (let k = 0; k < 7; k++) { const a = k * 0.9; g += `<path d="M${r1(cx + Math.cos(a) * rx * 0.2)},${r1(cy + Math.sin(a) * ry * 0.25)} q4,-5 8,0 t8,0" stroke="${PAIR[k % 4][1]}" stroke-width="1.4" fill="none"/>`; }
        g += `<circle cx="${r1(cx + rx * 0.12)}" cy="${r1(cy - ry * 0.1)}" r="4" fill="#9aa6b1"/>`;
      } else if (st.id === 'prophase') {
        g += `<ellipse cx="${r1(cx)}" cy="${r1(cy)}" rx="${r1(rx * 0.56)}" ry="${r1(ry * 0.66)}" fill="#fff" stroke="#9aa6b1" stroke-width="1.3" stroke-dasharray="4 3"/>`;
        [[-0.28, -0.3], [0.18, -0.34], [-0.2, 0.12], [0.24, 0.08]].forEach(([dx, dy], k) => { g += chrom(cx + dx * rx, cy + dy * ry, 15, PAIR[k][0], true); });
        g += `<circle cx="${r1(cx - rx + 10)}" cy="${r1(cy - ry * 0.5)}" r="3.2" fill="#5c6a63"/><circle cx="${r1(cx + rx - 10)}" cy="${r1(cy + ry * 0.5)}" r="3.2" fill="#5c6a63"/>`;
      } else if (st.id === 'metaphase') {
        const tg = [];
        let ch = '';
        for (let k = 0; k < 4; k++) { const yy = cy - ry + 9 + k * ((2 * ry - 18) / 4); ch += chrom(cx, yy, 13, PAIR[k][0], true); tg.push([cx - 6, yy + 5.5, -1], [cx + 6, yy + 5.5, 1]); }
        g += spindle(cx, cy, rx, ry, tg) + ch;
      } else if (st.id === 'anaphase') {
        const tg = [];
        let ch = '';
        for (let k = 0; k < 4; k++) {
          const yy = cy - ry + 12 + k * ((2 * ry - 24) / 4);
          [-1, 1].forEach((sd) => { const x = cx + sd * rx * 0.42; ch += `<path d="M${r1(x + sd * 6)},${r1(yy + 4)} l${-sd * 7},-4 m0,0 l0,0 M${r1(x + sd * 6)},${r1(yy + 4)} l${-sd * 7},4" stroke="${PAIR[k][0]}" stroke-width="3.2" stroke-linecap="round" fill="none"/>`; tg.push([x + sd * 6, yy + 4, sd]); });
        }
        g += spindle(cx, cy, rx, ry, tg) + ch;
      }
    }
    out += g;
    const lines = linesOf(st);
    lines.forEach((ln, k) => { out += t(cx, y0 + chH + 16 + k * 15, ln, { size: k ? 12 : 13.5, weight: k ? 400 : 700, anchor: 'middle', fill: key ? C.key : k ? C.ink2 : C.ink }); });
    if (key) out += badge(cx, y0 + chH + 16 + lines.length * 15 + 8, 'answer', { anchor: 'middle' });
  });
  const H = rowY(rowsN) + 4;
  return { svg: out, H, W };
}

// chromosome changes side by side: what each one does to the set
function changes(s, W) {
  const wide = W >= 560;
  const per = wide ? 3 : 2, cw = (W - 8) / per, drawH = 74;
  let out = '';
  const blocks = s.items.map((it) => ({ it, lines: wrap(it.note, cw - 18, 12) }));
  const rowsN = Math.ceil(blocks.length / per);
  const rowH = [];
  for (let r = 0; r < rowsN; r++) rowH[r] = drawH + 24 + Math.max(...blocks.slice(r * per, r * per + per).map((b) => b.lines.length)) * 14.5 + 14 + (blocks.slice(r * per, r * per + per).some((b) => b.it.key) ? 4 : 0);
  let y = 4;
  for (let r = 0; r < rowsN; r++) {
    blocks.slice(r * per, r * per + per).forEach((b, c) => {
      const it = b.it, x0 = 4 + c * cw, key = !!it.key;
      out += `<rect x="${r1(x0 + 2)}" y="${r1(y)}" width="${r1(cw - 6)}" height="${r1(rowH[r] - 8)}" rx="9" fill="${key ? C.keyBg : '#f7f9f8'}" stroke="${key ? C.key : '#c9d3cd'}" stroke-width="${key ? 2.4 : 1.2}"/>`;
      out += t(x0 + 10, y + 19, it.title, { size: 13.5, weight: 700, fill: key ? C.key : C.ink });
      if (key) out += badge(x0 + cw - 10, y + 19, 'answer', { anchor: 'end' });
      const cx = x0 + cw / 2, top = y + 30, L = 44;
      let g = '';
      const banded = (x, yy, len, color, bands, o = {}) => {   // an unreplicated chromosome with bands
        let q = `<rect x="${r1(x - 3.5)}" y="${r1(yy)}" width="7" height="${r1(len)}" rx="3.5" fill="${color}"${o.outline ? ` stroke="${o.outline}" stroke-width="2"` : ''}/>`;
        (bands || []).forEach(([f, col, hh]) => { q += `<rect x="${r1(x - 3.5)}" y="${r1(yy + f * len)}" width="7" height="${hh || 3}" fill="${col}"/>`; });
        return q;
      };
      const STD = [[0.2, '#ffffff', 3], [0.55, '#ffffff', 3], [0.8, '#ffffff', 3]];
      if (it.id === 'normal') { g += banded(cx - 8, top, L, '#1f57b5', STD) + banded(cx + 8, top, L, '#8fb0e6', STD); }
      if (it.id === 'trisomy') { g += banded(cx - 16, top, L, '#1f57b5', STD) + banded(cx, top, L, '#8fb0e6', STD) + banded(cx + 16, top, L, '#1f57b5', STD, { outline: C.key }); }
      if (it.id === 'triploidy') { [-1, 0, 1].forEach((k) => { g += banded(cx + k * 22 - 5, top + 4, 34, '#1f57b5', STD) + banded(cx + k * 22 + 5, top + 12, 26, '#b8321f', STD); }); }
      if (it.id === 'translocation') {
        g += `<rect x="${r1(cx - 15.5)}" y="${r1(top)}" width="7" height="${r1(L * 0.6)}" rx="3.5" fill="#1f57b5"/><rect x="${r1(cx - 15.5)}" y="${r1(top + L * 0.6)}" width="7" height="${r1(L * 0.4)}" rx="3.5" fill="#b8321f"/>`;
        g += `<rect x="${r1(cx + 8.5)}" y="${r1(top + 6)}" width="7" height="${r1(L * 0.5)}" rx="3.5" fill="#b8321f"/><rect x="${r1(cx + 8.5)}" y="${r1(top + 6 + L * 0.5)}" width="7" height="${r1(L * 0.32)}" rx="3.5" fill="#1f57b5"/>`;
      }
      if (it.id === 'inversion') {
        const cols = ['#1f57b5', '#1d7a36', '#8a6d00', '#b8321f'];
        [0, 1, 2, 3].forEach((k) => { g += `<rect x="${r1(cx - 15.5)}" y="${r1(top + k * L / 4)}" width="7" height="${r1(L / 4)}" fill="${cols[k]}"/>`; });
        [0, 2, 1, 3].forEach((kk, k) => { g += `<rect x="${r1(cx + 8.5)}" y="${r1(top + k * L / 4)}" width="7" height="${r1(L / 4)}" fill="${cols[kk]}"/>`; });
        g += `<path d="M${r1(cx + 20)},${r1(top + L / 4)} q8,${r1(L / 4)} 0,${r1(L / 2)}" stroke="${C.ink2}" stroke-width="1.4" fill="none"/>`;
      }
      if (it.id === 'point') { g += banded(cx - 8, top, L, '#1f57b5', STD) + banded(cx + 8, top, L, '#8fb0e6', [...STD, [0.4, C.trap, 2.5]]); }
      out += g;
      b.lines.forEach((ln, k) => { out += t(x0 + 10, y + drawH + 26 + k * 14.5, ln, { size: 12, fill: key ? '#0d4d38' : C.ink2 }); });
    });
    y += rowH[r] + 2;
  }
  return { svg: out, H: y + 2, W };
}
DIAGRAMS.chromosomes = (s, W) => {
  const view = { 'meiosis-counts': meiosisCounts, 'mitosis-stages': mitosisStages, changes }[s.view];
  if (!view) throw new Error('no chromosomes view ' + s.view);
  const d = view(s, W);
  return Object.assign({ legend: s.legend || [], extraLegend: s.swatches || null }, d);
};
DIAGRAMS.pathway = pathway;

/* ============================================================ amniote egg */
DIAGRAMS['amniote-egg'] = (s, W) => {
  const narrow = W < 560;
  const Wd = W, cx = Wd / 2, cy = narrow ? 128 : 136;
  const rx = Math.min(Wd / 2 - 10, 250), ry = narrow ? 112 : 122;
  let g = '';
  // shell, chorion just inside it, albumen
  g += `<ellipse cx="${r1(cx)}" cy="${r1(cy)}" rx="${r1(rx)}" ry="${r1(ry)}" fill="#fbf7ec" stroke="#b7a98a" stroke-width="5"/>`;
  g += `<ellipse cx="${r1(cx)}" cy="${r1(cy)}" rx="${r1(rx - 9)}" ry="${r1(ry - 9)}" fill="#fffdf6" stroke="#c0733b" stroke-width="2.4"/>`;
  // yolk and yolk sac (lower left), embryo in its amnion (upper middle), allantois (right)
  const yx = cx - rx * 0.28, yy = cy + ry * 0.28, yr = Math.min(rx * 0.36, ry * 0.5);
  g += `<circle cx="${r1(yx)}" cy="${r1(yy)}" r="${r1(yr)}" fill="#f2c94c" stroke="#b08a1f" stroke-width="1.6"/>`;
  g += `<circle cx="${r1(yx)}" cy="${r1(yy)}" r="${r1(yr + 5)}" fill="none" stroke="#8a6d00" stroke-width="1.8" stroke-dasharray="5 3"/>`;
  const ex = cx + rx * 0.02, ey = cy - ry * 0.42;
  g += `<ellipse cx="${r1(ex)}" cy="${r1(ey)}" rx="${r1(rx * 0.24)}" ry="${r1(ry * 0.3)}" fill="#e3f1fb" stroke="#1f57b5" stroke-width="2.2"/>`;
  // the embryo: a curled body with a head, joined to the yolk sac by a stalk
  g += `<path d="M${r1(ex + 14)},${r1(ey - 10)} C${r1(ex + 22)},${r1(ey + 14)} ${r1(ex - 8)},${r1(ey + 22)} ${r1(ex - 16)},${r1(ey + 6)}" fill="none" stroke="#d99a83" stroke-width="10" stroke-linecap="round"/>`;
  g += `<circle cx="${r1(ex + 8)}" cy="${r1(ey - 12)}" r="9" fill="#e7b19c" stroke="#a5604a" stroke-width="1.4"/>`;
  g += `<path d="M${r1(ex - 4)},${r1(ey + 16)} Q${r1(ex - 14)},${r1(yy - yr - 14)} ${r1(yx + yr * 0.3)},${r1(yy - yr + 2)}" stroke="#8a6d00" stroke-width="3" fill="none"/>`;
  // the allantois: a sac on a stalk from the embryo's gut, between amnion and chorion (the key)
  const ax = cx + rx * 0.5, ay = cy + ry * 0.05, ar = Math.min(rx * 0.26, ry * 0.36);
  g += `<path d="M${r1(ex + 10)},${r1(ey + 14)} Q${r1(ax - ar * 0.6)},${r1(ey + 30)} ${r1(ax - ar * 0.7)},${r1(ay - ar * 0.4)}" stroke="#00704f" stroke-width="3" fill="none"/>`;
  g += `<ellipse cx="${r1(ax)}" cy="${r1(ay)}" rx="${r1(ar)}" ry="${r1(ar * 0.82)}" fill="${C.keyBg}" stroke="${C.key}" stroke-width="3"/>`;
  for (let k = 0; k < 5; k++) g += `<circle cx="${r1(ax - ar * 0.4 + (k % 3) * ar * 0.38)}" cy="${r1(ay - ar * 0.2 + Math.floor(k / 3) * ar * 0.4)}" r="3" fill="#f5f0dc" stroke="#9a8f6a" stroke-width="1"/>`;
  // numbered markers (filled circles drawn over the outlines)
  const marks = [
    { n: 1, x: cx - rx * 0.62, y: cy - ry * 0.72, label: 'Chorion' },
    { n: 2, x: ex - rx * 0.24 - 12, y: ey - ry * 0.12, label: 'Amnion' },
    { n: 3, x: ax + ar * 0.2, y: ay + ar * 0.82 + 16, label: 'Allantois' },
    { n: 4, x: yx - yr * 0.72, y: yy + yr + 2, label: 'Yolk sac' },
    { n: 5, x: cx + rx * 0.64, y: cy - ry * 0.5, label: 'Albumen' }
  ];
  const legendText = s.legendText || {};
  marks.forEach((m) => { m.key = m.label.toLowerCase().replace(/\s+/g, '-') === s.focus; });
  marks.forEach((m) => { g += `<circle cx="${r1(m.x)}" cy="${r1(m.y)}" r="11" fill="${m.key ? C.key : '#fff'}" stroke="${m.key ? C.key : C.ink2}" stroke-width="1.6"/>` + t(m.x, m.y + 4.5, String(m.n), { size: 13, weight: 700, anchor: 'middle', fill: m.key ? '#fff' : C.ink }); });
  return { svg: g, H: cy + ry + 8, W: Wd, legend: marks.map((m) => ({ n: m.n, key: m.key, label: legendText[m.label] ? m.label + ': ' + legendText[m.label] : m.label })), extraLegend: s.swatches || null };
};

/* ============================================================== junctions */
DIAGRAMS.junctions = (s, W) => {
  const narrow = W < 560;
  const mid = W / 2, gapW = 12, top = 10, bot = narrow ? 300 : 300;
  const mL = mid - gapW / 2, mR = mid + gapW / 2;
  let g = '';
  // the two cells and the basement membrane under them
  g += `<rect x="6" y="${top}" width="${r1(mL - 6)}" height="${r1(bot - top)}" rx="10" fill="#f6efe6" stroke="#b39b84" stroke-width="2"/>`;
  g += `<rect x="${r1(mR)}" y="${top}" width="${r1(W - 6 - mR)}" height="${r1(bot - top)}" rx="10" fill="#f6efe6" stroke="#b39b84" stroke-width="2"/>`;
  g += `<rect x="4" y="${r1(bot + 4)}" width="${r1(W - 8)}" height="10" rx="3" fill="#d9cdb8"/>`;
  const zones = [
    { n: 1, y: top + 34, kind: 'tight', label: 'Tight junction' },
    { n: 2, y: top + 104, kind: 'desmosome', label: 'Desmosome' },
    { n: 3, y: top + 190, kind: 'gap', label: 'Gap junction' },
    { n: 4, y: bot - 6, kind: 'hemi', label: 'Hemidesmosome' }
  ];
  zones.forEach((z) => {
    if (z.kind === 'tight') {
      for (let k = 0; k < 3; k++) g += `<rect x="${r1(mL - 4)}" y="${r1(z.y - 10 + k * 9)}" width="${r1(gapW + 8)}" height="4" rx="2" fill="#6a4a97"/>`;
    }
    if (z.kind === 'desmosome') {
      g += `<rect x="${r1(mL - 9)}" y="${r1(z.y - 16)}" width="6" height="32" rx="2" fill="#5c4632"/><rect x="${r1(mR + 3)}" y="${r1(z.y - 16)}" width="6" height="32" rx="2" fill="#5c4632"/>`;
      for (let k = 0; k < 4; k++) g += `<path d="M${r1(mL - 3)},${r1(z.y - 12 + k * 8)} H${r1(mR + 3)}" stroke="#8c6a16" stroke-width="1.6"/>`;
      for (let k = 0; k < 4; k++) { g += `<path d="M${r1(mL - 9)},${r1(z.y - 12 + k * 8)} q-16,${r1(-8 + k * 5)} -34,${r1(-14 + k * 9)}" stroke="#a0806a" stroke-width="1.4" fill="none"/>`; g += `<path d="M${r1(mR + 9)},${r1(z.y - 12 + k * 8)} q16,${r1(-8 + k * 5)} 34,${r1(-14 + k * 9)}" stroke="#a0806a" stroke-width="1.4" fill="none"/>`; }
    }
    if (z.kind === 'gap') {
      for (let k = 0; k < 4; k++) {
        const yy = z.y - 30 + k * 18;
        g += `<rect x="${r1(mL - 8)}" y="${r1(yy - 6)}" width="${r1(gapW + 16)}" height="12" rx="3" fill="#cfe9df" stroke="${C.key}" stroke-width="1.4"/>`;
        g += `<path d="M${r1(mL - 22)},${r1(yy)} H${r1(mR + 20)}" stroke="${C.blue}" stroke-width="1.8" marker-end="url(#jA)"/>`;
      }
    }
    if (z.kind === 'hemi') {
      g += `<rect x="40" y="${r1(bot - 8)}" width="44" height="7" rx="2" fill="#5c4632"/>`;
      for (let k = 0; k < 3; k++) g += `<path d="M${r1(48 + k * 14)},${r1(bot - 8)} q-4,-20 6,-38" stroke="#a0806a" stroke-width="1.4" fill="none"/>`;
      for (let k = 0; k < 3; k++) g += `<path d="M${r1(50 + k * 14)},${r1(bot - 1)} V${r1(bot + 6)}" stroke="#8c6a16" stroke-width="1.6"/>`;
    }
  });
  zones.forEach((z) => { z.key = z.label.toLowerCase().replace(/\s+/g, '-') === s.focus; });
  const kz = zones.find((z) => z.key);
  if (kz) { const half = kz.kind === 'gap' ? 40 : kz.kind === 'hemi' ? 14 : 22; const kx = kz.kind === 'hemi' ? 34 : mL - 28, kw = kz.kind === 'hemi' ? 56 : gapW + 56; g += `<rect x="${r1(kx)}" y="${r1(kz.y - half)}" width="${r1(kw)}" height="${r1(2 * half)}" rx="8" fill="none" stroke="${C.key}" stroke-width="2.4"/>`; }
  // markers: beside each junction, in the cell on the right (the hemidesmosome's on the left)
  const marks = zones.map((z) => ({ n: z.n, key: z.key, label: z.label, x: z.kind === 'hemi' ? 104 : mR + 44, y: z.kind === 'hemi' ? bot - 22 : z.y }));
  marks.forEach((m) => { g += `<circle cx="${r1(m.x)}" cy="${r1(m.y)}" r="11" fill="${m.key ? C.key : '#fff'}" stroke="${m.key ? C.key : C.ink2}" stroke-width="1.6"/>` + t(m.x, m.y + 4.5, String(m.n), { size: 13, weight: 700, anchor: 'middle', fill: m.key ? '#fff' : C.ink }); });
  g += t(14, top + 18, s.leftLabel || 'Cell 1', { size: 12.5, weight: 700, fill: C.mute });
  g += t(W - 14, top + 18 + (narrow ? 0 : 0), s.rightLabel || 'Cell 2', { size: 12.5, weight: 700, fill: C.mute, anchor: 'end' });
  const defs = `<defs><marker id="jA" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="8" markerHeight="8" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="${C.blue}"/></marker></defs>`;
  const legendText = s.legendText || {};
  return { svg: defs + g, H: bot + 18, W, legend: marks.map((m) => ({ n: m.n, key: m.key, label: legendText[m.label] ? m.label + ': ' + legendText[m.label] : m.label })), extraLegend: s.swatches || null };
};

/* ============================================================== thylakoid */
// A slice of thylakoid membrane: stroma above, lumen below. Photosystem II,
// cytochrome b6f and photosystem I pass electrons (gold) from water to NADPH;
// H+ (blue) is pumped into the lumen and returns through ATP synthase, whose
// head makes ATP in the stroma. spec.leak opens a hole in the membrane: H+
// returns through it instead and ATP synthase sits idle. spec.focus is
// 'atp-synthase' or 'leak' (outlined, with a word badge).
DIAGRAMS.thylakoid = (s, W) => {
  const pad = 6, y1 = 128, y2 = 176, H = y2 + 100;
  const bw = Math.min(0.16 * W, 70);
  const X = { psii: 0.13 * W, b6f: 0.33 * W, psi: 0.53 * W, leak: 0.70 * W, syn: 0.86 * W };
  const A = uid('thA'), G = uid('thG');
  let g = `<defs>${arrowHead(A, C.blue)}${arrowHead(G, '#8a6d00')}</defs>`;
  // the membrane band, with a gap where the leak is
  g += `<rect x="${pad / 2}" y="${y1}" width="${r1(W - pad)}" height="${y2 - y1}" fill="#f3ead2"/>`;
  for (let x = pad; x < W - pad; x += 9) {
    if (s.leak && Math.abs(x - X.leak) < 11) continue;
    g += `<circle cx="${r1(x)}" cy="${y1 + 3}" r="2.7" fill="#c9a84c"/><circle cx="${r1(x)}" cy="${y2 - 3}" r="2.7" fill="#c9a84c"/>`;
  }
  if (s.leak) g += `<rect x="${r1(X.leak - 9)}" y="${y1}" width="18" height="${y2 - y1}" fill="#ffffff"/>`;
  // the electron chain: three complexes
  const box = (cx, label) => `<rect x="${r1(cx - bw / 2)}" y="${y1 - 8}" width="${r1(bw)}" height="${y2 - y1 + 16}" rx="10" fill="#ece4f7" stroke="#6a4a97" stroke-width="1.4"/>` + t(cx - bw / 2 + 6, y1 + 9, label, { size: 12.5, weight: 700, fill: '#3b2a59' });
  g += box(X.psii, 'PSII') + box(X.b6f, 'b6f') + box(X.psi, 'PSI');
  // electrons: water at PSII, through b6f and PSI, up to NADPH in the stroma
  const ey = y2 - 12;
  g += `<path d="M${r1(X.psii - 4)},${ey} H${r1(X.psi + 2)} Q${r1(X.psi + 14)},${ey} ${r1(X.psi + 14)},${ey - 14} V${r1(y1 - 34)}" fill="none" stroke="#8a6d00" stroke-width="2.6" marker-end="url(#${G})"/>`;
  g += t(X.psi + 14, 62, 'NADP+ to', { size: 12.5, weight: 700, anchor: 'middle', fill: '#6b5200' }) + t(X.psi + 14, 77, 'NADPH', { size: 12.5, weight: 700, anchor: 'middle', fill: '#6b5200' });
  g += t(X.psii, y2 + 28, 'H2O to O2', { size: 12.5, anchor: 'middle', fill: C.ink2, weight: 700 }) + t(X.psii, y2 + 43, '+ H+', { size: 12.5, anchor: 'middle', fill: C.blue, weight: 700 });
  // H+ pumped at b6f: stroma to lumen
  const px = X.b6f + bw / 2 - 9;
  g += t(px, 62, 'H+', { size: 13, weight: 700, anchor: 'middle', fill: C.blue });
  g += `<path d="M${r1(px)},68 V${r1(y2 + 30)}" fill="none" stroke="${C.blue}" stroke-width="2.4" marker-end="url(#${A})"/>`;
  g += t(px + 6, y2 + 54, 'H+ piles up here', { size: 12.5, weight: 700, anchor: 'middle', fill: C.blue });
  // ATP synthase: stalk across the membrane, head in the stroma
  const sx = X.syn, hy = y1 - 22, keySyn = s.focus === 'atp-synthase', keyLeak = s.focus === 'leak';
  if (keySyn) g += `<rect x="${r1(sx - 24)}" y="${r1(hy - 22)}" width="48" height="${r1(y2 + 12 - hy + 22)}" rx="12" fill="none" stroke="${C.key}" stroke-width="2.6"/>`;
  g += `<rect x="${r1(sx - 8)}" y="${y1 - 4}" width="16" height="${y2 - y1 + 12}" rx="4" fill="#c9a84c" stroke="#7a5f17" stroke-width="1.4"/>`;
  g += `<circle cx="${r1(sx)}" cy="${hy}" r="17" fill="#c9a84c" stroke="#7a5f17" stroke-width="1.6"/>`;
  g += t(sx, y2 + 28, 'ATP', { size: 12.5, weight: 700, anchor: 'middle', fill: C.ink }) + t(sx, y2 + 43, 'synthase', { size: 12.5, weight: 700, anchor: 'middle', fill: C.ink });
  if (s.leak) {
    // the turbine idles: a faint dashed path, and no ATP
    g += `<path d="M${r1(sx)},${y2 + 6} V${r1(hy + 18)}" fill="none" stroke="#9aa7a0" stroke-width="1.6" stroke-dasharray="3 3"/>`;
    g += t(sx, hy - 26, 'no ATP', { size: 12.5, weight: 700, anchor: 'middle', fill: C.trap });
    // the leak: H+ straight back to the stroma
    if (keyLeak) g += `<rect x="${r1(X.leak - 15)}" y="${y1 - 10}" width="30" height="${y2 - y1 + 20}" rx="8" fill="none" stroke="${C.key}" stroke-width="2.6"/>`;
    g += `<path d="M${r1(X.leak)},${y2 + 36} V${r1(y1 - 30)}" fill="none" stroke="${C.blue}" stroke-width="2.4" stroke-dasharray="6 4" marker-end="url(#${A})"/>`;
    g += t(X.leak, y1 - 36, 'leak', { size: 12.5, weight: 700, anchor: 'middle', fill: keyLeak ? C.key : C.blue });
    if (keyLeak) g += badge(X.leak, y2 + 72, 'answer', { anchor: 'middle' });
  } else {
    g += `<path d="M${r1(sx - 34)},${y2 + 20} Q${r1(sx)},${y2 + 20} ${r1(sx)},${y2 + 4} V${r1(hy - 19)}" fill="none" stroke="${C.blue}" stroke-width="2.4" marker-end="url(#${A})"/>`;
    g += t(Math.min(sx, W - pad - 30), hy - 50, 'ADP + Pi', { size: 12.5, weight: 700, anchor: 'middle', fill: C.key }) + t(Math.min(sx, W - pad - 30), hy - 35, 'to ATP', { size: 12.5, weight: 700, anchor: 'middle', fill: C.key });
    if (keySyn) g += badge(Math.min(sx, W - pad - 30), y2 + 68, 'answer', { anchor: 'middle' });
  }
  // region words
  g += t(pad + 4, 18, 'Stroma', { size: 12.5, weight: 700, fill: C.mute });
  g += t(pad + 4, H - 8, 'Lumen (inside the thylakoid)', { size: 12.5, weight: 700, fill: C.mute });
  return { svg: g, H, W, legend: [], extraLegend: s.swatches || [{ sw: '#8a6d00', label: 'gold path: electrons, water to NADPH' }, { sw: C.blue, label: 'blue arrows: H+' }] };
};
