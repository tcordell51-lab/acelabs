// qr-work.js: the QR pictures of batch B005 onward.
//
//   qr.work       a worked strip of blocks, drawn in the order the spec lists
//                 them: lines (each line of the setup with the move that makes
//                 the next, and the exits a trap takes), numberline (ticks,
//                 jumps, points, rays and test points), parabolas (the cases
//                 b^2 - 4ac sorts, each drawn from its own a, b, c), columns
//                 (place-value subtraction with the points lined up), tree (the
//                 order of operations as two pieces that meet at the last
//                 sign), chips (factors of one base, counted) and rows (a
//                 ledger whose lines can name a choice)
//   qr.partwhole  styles groups (equal groups split into parts), bars (bars
//                 drawn to one scale, split into labeled pieces, with ghost
//                 marks for the traps) and fractions (fraction bars poured into
//                 tanks), added to the PARTWHOLE_STYLES map qr.js exports
//   qr.geometry   shape sphere: the flat circle, the skin and the inside, each
//                 with its formula and value
//
// Every number a picture draws is computed from the spec with the helpers the
// build gate runs (compute-qr.js), and every word comes from the spec. Drawn
// at the width shown (about 300 px on a 390 px phone), text at 12 px or
// larger, the key's place outlined and named in words as well as color.
import { register, C, FONT, r1, svgOpen, width, h, esc, uid } from './core.js';
import { PARTWHOLE_STYLES } from './qr.js';
import { evalExpr } from './compute-gc.js';
import * as Q from './compute-qr.js';

/* ------------------------------------------------------------------ helpers */
const BOLDW = 1.08;
const MARK = /([A-Za-z0-9\])])\^(\{[^}]+\}|[+-]?[0-9A-Za-z.]*[0-9A-Za-z+-])|([A-Za-z\])])_(\{[^}]+\}|[A-Za-z0-9]+)/g;
function parts(str) {
  const out = []; let last = 0, m; const s = String(str == null ? '' : str);
  MARK.lastIndex = 0;
  while ((m = MARK.exec(s))) {
    out.push({ s: s.slice(last, m.index) + (m[1] || m[3]) });
    out.push({ s: (m[2] || m[4]).replace(/^\{|\}$/g, ''), sup: !!m[2], sub: !m[2] });
    last = m.index + m[0].length;
  }
  out.push({ s: s.slice(last) });
  return out.filter((p) => p.s);
}
function measure(str, size, bold) {
  let w = 0;
  for (const p of parts(str)) for (const ch of p.s) w += (/[A-Z0-9]/.test(ch) ? 0.62 : /[a-z]/.test(ch) ? 0.53 : ch === ' ' ? 0.28 : 0.4) * (p.sup || p.sub ? 0.85 : 1);
  return w * size * (bold ? BOLDW : 1);
}
// SVG text with ^ typeset; superscripts never under 12 px
function rt(x, y, str, o = {}) {
  const size = o.size || 13, small = Math.max(12, +(size * 0.82).toFixed(1));
  const a = [`x="${r1(x)}"`, `y="${r1(y)}"`, `font-size="${size}"`, `fill="${o.fill || C.ink}"`, `font-family="${FONT}"`];
  if (o.anchor) a.push(`text-anchor="${o.anchor}"`);
  if (o.weight) a.push(`font-weight="${o.weight}"`);
  if (o.halo) a.push(`paint-order="stroke" stroke="${o.halo === true ? '#fff' : o.halo}" stroke-width="4" stroke-linejoin="round"`);
  const inner = parts(str).map((p) => p.sup ? `<tspan font-size="${small}" baseline-shift="super">${esc(p.s)}</tspan>` : p.sub ? `<tspan font-size="${small}" baseline-shift="sub">${esc(p.s)}</tspan>` : esc(p.s)).join('');
  return `<text ${a.join(' ')}>${inner}</text>`;
}
const ROLE = {
  key: { fill: C.keyBg, stroke: C.key, ink: C.key, w: 2.2 },
  trap: { fill: C.trapBg, stroke: C.trap, ink: '#6b3000', w: 1.3 },
  plain: { fill: '#f7f9f8', stroke: '#c9d3cd', ink: C.ink, w: 1.1 },
  info: { fill: C.blueBg, stroke: C.blue, ink: '#123a7a', w: 1.2 }
};
// a rounded, outlined label; y is the text baseline
function tag(x, y, label, role = 'plain', o = {}) {
  const size = o.size || 12.5, R = ROLE[role] || ROLE.plain, w = measure(label, size, true) + 14;
  const sup = parts(label).some((p) => p.sup);
  const top = y - size - 2 - (sup ? 4 : 0), bottom = y + 6;
  const x0 = o.anchor === 'end' ? x - w : o.anchor === 'middle' ? x - w / 2 : x;
  return { w, x0, x1: x0 + w, top, bottom, svg: `<rect x="${r1(x0)}" y="${r1(top)}" width="${r1(w)}" height="${r1(bottom - top)}" rx="5" fill="${R.fill}" stroke="${R.stroke}" stroke-width="${R.w}"/>` + rt(x0 + w / 2, y, label, { size, weight: 700, anchor: 'middle', fill: R.ink }) };
}
function wrapLines(s, maxW, size, bold) {
  const words = String(s).split(/\s+/), out = []; let cur = '';
  for (const w of words) { const nx = cur ? cur + ' ' + w : w; if (measure(nx, size, bold) > maxW && cur) { out.push(cur); cur = w; } else cur = nx; }
  if (cur) out.push(cur);
  return out;
}
function marker(id, color, size = 9) {
  return `<marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="${size}" markerHeight="${size}" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${color}"/></marker>`;
}
function rich(str) {
  const frag = document.createDocumentFragment();
  for (const p of parts(str)) frag.append(p.sup ? h('sup', { text: p.s }) : p.sub ? h('sub', { text: p.s }) : document.createTextNode(p.s));
  return frag;
}
// extra room above a line whose superscript would reach into the line before it
const supPad = (str) => (parts(str).some((p) => p.sup) ? 5 : 0);
const hr = (tag0, attrs, str) => { const n = h(tag0, attrs); n.append(rich(str)); return n; };
const num = (v) => (typeof v === 'number' ? v : evalExpr(String(v)));
// labels on a row without collisions: greedy levels, and a label never sits
// across the leader line of a label on a lower level
function levels(items, size, gap = 8) {
  const placed = [];
  const clamp = (it, w, x0) => { if (it.minX != null) x0 = Math.max(it.minX, x0); if (it.maxX != null) x0 = Math.min(it.maxX - w, x0); return x0; };
  items.slice().sort((a, b) => a.x - b.x).forEach((it) => {
    const w = it.w || measure(it.text, size, true) + 14;
    // a label centered under its mark, or ending just right of it, or starting just left of it
    const opts = [it.x - w / 2, it.x + 10 - w, it.x - 10].map((x0) => clamp(it, w, x0));
    const overlap = (l, x0) => placed.some((p) => p.lv === l && !(x0 > p.x1 + gap || x0 + w < p.x0 - gap));
    const leaders = (l, x0) => placed.some((p) => (p.lv < l && it.x > p.x0 - 3 && it.x < p.x1 + 3) || (p.lv > l && p.it.x > x0 - 3 && p.it.x < x0 + w + 3));
    // first choice: the lowest level where nothing overlaps and no leader line crosses a label;
    // if there is none, the lowest level with no overlap (always found)
    let lv = -1, x0 = opts[0];
    for (let l = 0; l < 8 && lv < 0; l++) for (const o of opts) if (lv < 0 && !overlap(l, o) && !leaders(l, o)) { lv = l; x0 = o; }
    if (lv < 0) { lv = 0; x0 = opts[0]; while (overlap(lv, x0)) lv++; }
    placed.push({ it, lv, x0, x1: x0 + w, w });
  });
  return placed;
}

let cssDone = false;
function css() {
  if (cssDone || typeof document === 'undefined') return; cssDone = true;
  const st = document.createElement('style');
  st.textContent = `
.vis sup, .vis sub { font-size: max(12px, .78em); }
.qw-block + .qw-block { margin-top: 12px; }
.qw-h { font-size: 13px; font-weight: 700; color: var(--ink2, #3b4a43); margin: 2px 2px 6px; }
.qw-lines { display: flex; flex-direction: column; align-items: stretch; }
.qw-node { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 10px; border: 1.5px solid #c9d3cd; border-radius: 8px; padding: 7px 12px; background: #fff; }
.qw-node .qw-ex { font-size: 17px; font-weight: 700; letter-spacing: .01em; color: var(--ink, #16211c); white-space: nowrap; }
.qw-node .qw-nt { font-size: 13px; color: var(--ink2, #3b4a43); }
.qw-node.is-key { border: 2.5px solid var(--ok, #00704f); background: var(--ok-bg, #e2f4ec); }
.qw-node.is-key .qw-ex { color: var(--ok, #00704f); }
.qw-tag { margin-left: auto; font-style: normal; font-size: 12.5px; font-weight: 700; padding: 1px 8px; border: 1.5px solid var(--ok, #00704f); border-radius: 10px; background: #fff; color: var(--ok, #00704f); white-space: nowrap; }
.qw-link { display: flex; align-items: center; gap: 8px; padding: 4px 0 4px 26px; position: relative; min-height: 32px; }
.qw-link::before { content: ""; position: absolute; left: 14px; top: 0; bottom: 6px; border-left: 2px solid #9aa59f; }
.qw-link::after { content: ""; position: absolute; left: 9px; bottom: 0; border: 6px solid transparent; border-top: 7px solid #9aa59f; border-bottom: 0; }
.qw-op { background: var(--blue-bg, #e6eefb); color: #123a7a; border: 1px solid #b9cdef; border-radius: 12px; padding: 2px 10px; font-size: 13.5px; font-weight: 700; }
.qw-exit { margin: 2px 0 4px 30px; padding: 4px 10px; border: 1.3px dashed #9b4500; border-radius: 8px; background: #fbece0; color: #6b3000; font-size: 13.5px; }
.qw-rows { border: 1px solid #dbe3de; border-radius: 8px; padding: 6px 10px; background: #fbfcfb; font-size: 14.5px; }
.qw-row { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; padding: 6px 4px; border-bottom: 1px dashed #e3e8e5; }
.qw-row:last-child { border-bottom: 0; }
.qw-row b { white-space: nowrap; }
.qw-row em { display: block; font-style: normal; font-size: 13px; color: var(--ink2, #3b4a43); }
.qw-row.is-key { border: 2px solid var(--ok, #00704f); border-radius: 6px; background: var(--ok-bg, #e2f4ec); color: var(--ok, #00704f); font-weight: 700; padding: 6px 8px; margin: 4px 0; }
.qw-row.is-key em { color: var(--ok, #00704f); font-weight: 400; }
.qw-row.is-trap { color: #6b3000; }
.qw-row.is-trap em { color: #6b3000; }
.qw-cols { display: grid; justify-content: center; gap: 0; font-size: 22px; font-family: "JetBrains Mono", Consolas, "Courier New", monospace; }
.qw-cols span { display: grid; place-items: center; min-width: 30px; height: 38px; }
.qw-cols .hd { font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: var(--mute, #5c6a63); height: 22px; font-weight: 700; }
.qw-cols .rule { grid-column: 1 / -2; height: 0; min-width: 0; border-top: 2px solid var(--ink, #16211c); margin: 2px 0 4px; }
.qw-cols .rule-pad { height: 0; min-width: 0; }
.qw-cols .pt { min-width: 14px; }
.qw-cols .sg { min-width: 26px; color: var(--ink2, #3b4a43); }
.qw-cols .mv { background: var(--blue-bg, #e6eefb); color: #123a7a; border-radius: 6px; font-weight: 700; box-shadow: inset 0 0 0 1.5px #1f57b5; }
.qw-cols .rl { border-top: 2px solid var(--ink, #16211c); }
.qw-cols .ky { color: var(--ok, #00704f); font-weight: 700; background: var(--ok-bg, #e2f4ec); }
.qw-cols .ky.l { border-left: 2.5px solid var(--ok, #00704f); border-radius: 6px 0 0 6px; }
.qw-cols .ky.r { border-right: 2.5px solid var(--ok, #00704f); border-radius: 0 6px 6px 0; }
.qw-cols .ky.b { box-shadow: inset 0 2.5px 0 var(--ok, #00704f), inset 0 -2.5px 0 var(--ok, #00704f); }
.qw-cols .gh { color: #6b3000; margin-top: 8px; border-top: 1.5px dashed #9b4500; border-bottom: 1.5px dashed #9b4500; background: #fdf5ee; }
.qw-cols .gh.l { border-left: 1.5px dashed #9b4500; border-radius: 6px 0 0 6px; }
.qw-cols .gh.r { border-right: 1.5px dashed #9b4500; border-radius: 0 6px 6px 0; }
.qw-cols .nt.g { margin-top: 8px; }
.qw-cols .nt { font-family: Arial, Helvetica, sans-serif; font-size: 13px; justify-items: start; padding-left: 8px; color: var(--ink2, #3b4a43); white-space: nowrap; }
.qw-cols .nt.k { color: var(--ok, #00704f); font-weight: 700; }
.qw-cols .nt.g { color: #6b3000; }
.qw-tree { display: grid; grid-template-columns: minmax(0, 1fr) 28px minmax(0, 1fr); align-items: center; row-gap: 0; text-align: center; }
.qw-tree .bx { border: 1.5px solid #c9d3cd; border-radius: 8px; padding: 6px 4px; background: #fff; font-size: 17px; font-weight: 700; }
.qw-tree .op { font-size: 18px; font-weight: 700; color: var(--ink2, #3b4a43); }
.qw-tree .dn { position: relative; height: 54px; display: grid; place-items: center; }
.qw-tree .dn::before { content: ""; position: absolute; left: 50%; top: 0; bottom: 0; border-left: 2px solid #9aa59f; }
.qw-tree .dn span { position: relative; background: var(--blue-bg, #e6eefb); color: #123a7a; border: 1px solid #b9cdef; border-radius: 12px; padding: 2px 8px; font-size: 13px; font-weight: 700; }
.qw-tree .meet { grid-column: 1 / -1; position: relative; height: 54px; display: grid; place-items: center; }
.qw-tree .meet::before { content: ""; position: absolute; left: 25%; right: 25%; top: 0; height: 14px; border: 2px solid #9aa59f; border-top: 0; border-radius: 0 0 8px 8px; }
.qw-tree .meet::after { content: ""; position: absolute; left: 50%; top: 14px; bottom: 0; border-left: 2px solid #9aa59f; }
.qw-tree .meet span { position: relative; z-index: 1; background: var(--blue-bg, #e6eefb); color: #123a7a; border: 1px solid #b9cdef; border-radius: 12px; padding: 2px 8px; font-size: 13px; font-weight: 700; margin-top: 12px; }
.qw-tree .res { grid-column: 1 / -1; justify-self: center; min-width: 46%; border: 2.5px solid var(--ok, #00704f); background: var(--ok-bg, #e2f4ec); color: var(--ok, #00704f); border-radius: 8px; padding: 6px 12px; font-size: 18px; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 10px; }
.qw-note { margin: 8px 4px 0; font-size: 13.5px; color: var(--ink2, #3b4a43); }
`;
  document.head.append(st);
}

/* ============================================================ qr.work blocks */
const BLOCKS = {};

// each line of the setup, the move that makes the next one, and where a trap exits
BLOCKS.lines = (b, box) => {
  const el = h('div', { class: 'qw-block qw-lines' });
  if (b.title) el.append(hr('div', { class: 'qw-h' }, b.title));
  b.rows.forEach((r, i) => {
    if (r.move) { const ln = h('div', { class: 'qw-link' }); ln.append(hr('span', { class: 'qw-op' }, r.move)); el.append(ln); }
    const node = h('div', { class: 'qw-node' + (r.key ? ' is-key' : '') });
    node.append(hr('span', { class: 'qw-ex' }, r.expr));
    if (r.note) node.append(hr('span', { class: 'qw-nt' }, r.note));
    if (r.tag) node.append(hr('em', { class: 'qw-tag' }, r.tag));
    el.append(node);
    (b.exits || []).filter((x) => x.at === i).forEach((x) => el.append(hr('div', { class: 'qw-exit' }, x.label)));
  });
  box.append(el);
};

// a ledger whose lines can name a choice
BLOCKS.rows = (b, box) => {
  const el = h('div', { class: 'qw-block qw-rows' });
  if (b.title) el.append(hr('div', { class: 'qw-h' }, b.title));
  b.rows.forEach((r) => {
    const row = h('div', { class: 'qw-row' + (r.key ? ' is-key' : r.trap ? ' is-trap' : '') });
    const left = hr('span', {}, r.label);
    if (r.note) left.append(hr('em', {}, r.note));
    row.append(left);
    if (r.value != null) row.append(hr('b', {}, String(r.value)));
    el.append(row);
  });
  box.append(el);
};

// place-value columns: the points lined up, the digits that move marked
BLOCKS.columns = (b, box) => {
  const el = h('div', { class: 'qw-block' });
  if (b.title) el.append(hr('div', { class: 'qw-h' }, b.title));
  const all = b.rows.concat([b.result], b.ghosts || []);
  const ip = Math.max(...all.map((r) => String(r.digits).split('.')[0].length)), dp = Math.max(...all.map((r) => (String(r.digits).split('.')[1] || '').length));
  const g = h('div', { class: 'qw-cols' });
  g.style.gridTemplateColumns = '26px ' + Array(ip).fill('40px').join(' ') + ' 14px ' + Array(dp).fill('44px').join(' ') + ' auto';
  const cell = (cls, text) => g.append(h('span', { class: cls, text }));
  cell('sg', ''); (b.places.int || []).slice(-ip).forEach((p) => cell('hd', p)); cell('hd pt', ''); (b.places.dec || []).slice(0, dp).forEach((p) => cell('hd', p)); cell('hd', '');
  const line = (r, kind) => {
    const d = Q.placeDigits(r.digits, ip, dp), cls = kind === 'key' ? 'ky' : kind === 'ghost' ? 'gh' : '';
    const first = kind === 'key' || kind === 'ghost', n = ip + dp + 1;
    let k = 0;
    const one = (ch, extra) => { const edge = kind === 'key' ? (k === 0 ? ' l' : k === n - 1 ? ' r' : '') + ' b' : kind === 'ghost' ? (k === 0 ? ' l' : k === n - 1 ? ' r' : '') : ''; cell([cls, extra, ch.trim() && r.move ? 'mv' : ''].filter(Boolean).join(' ') + edge, ch.trim()); k++; };
    if (kind === 'key') g.append(h('span', { class: 'rule' }), h('span', { class: 'rule-pad' }));
    cell('sg' + (kind === 'ghost' ? ' nt g' : ''), r.sign === '-' ? '-' : kind === 'key' ? '=' : '');
    d.int.forEach((ch) => one(ch));
    one('.', 'pt');
    d.dec.forEach((ch) => one(ch));
    cell('nt' + (kind === 'key' ? ' k' : kind === 'ghost' ? ' g' : ''), r.note || '');
  };
  b.rows.forEach((r) => line(r, 'row'));
  line(b.result, 'key');
  (b.ghosts || []).forEach((r) => line(r, 'ghost'));
  el.append(g);
  box.append(el);
};

// the order of operations: two pieces that meet at the last sign
BLOCKS.tree = (b, box) => {
  const el = h('div', { class: 'qw-block' });
  if (b.title) el.append(hr('div', { class: 'qw-h' }, b.title));
  const g = h('div', { class: 'qw-tree' });
  const [A, op, B] = b.pieces;
  g.append(hr('div', { class: 'bx' }, A.expr), hr('div', { class: 'op' }, op.op), hr('div', { class: 'bx' }, B.expr));
  const dn = (x) => { const d = h('div', { class: 'dn' }); d.append(hr('span', {}, x.how)); return d; };
  g.append(dn(A), h('div', {}), dn(B));
  g.append(hr('div', { class: 'bx' }, String(A.value)), hr('div', { class: 'op' }, op.op), hr('div', { class: 'bx' }, String(B.value)));
  const meet = h('div', { class: 'meet' }); meet.append(hr('span', {}, b.result.how)); g.append(meet);
  const res = h('div', { class: 'res' }); res.append(hr('span', {}, String(b.result.value))); if (b.result.tag) res.append(hr('em', { class: 'qw-tag' }, b.result.tag)); g.append(res);
  el.append(g);
  box.append(el);
};

// factors of one base, counted
BLOCKS.chips = (b, box, W) => {
  const n = b.groups.reduce((a, x) => a + x.n, 0), gap = 6, ggap = 18;
  const r = Math.min(16, (W - 24 - (n - b.groups.length) * gap - (b.groups.length - 1) * ggap) / (2 * n));
  const rowW = n * 2 * r + (n - b.groups.length) * gap + (b.groups.length - 1) * ggap, x0 = (W - rowW) / 2;
  const topTag = 34, cy = topTag + 22 + r;
  let g = '', x = x0;
  const spans = [];
  b.groups.forEach((gr, gi) => {
    const s0 = x;
    for (let i = 0; i < gr.n; i++) { g += `<circle cx="${r1(x + r)}" cy="${r1(cy)}" r="${r1(r)}" fill="${C.blueBg}" stroke="${C.blue}" stroke-width="1.6"/>` + rt(x + r, cy + 5, b.token, { size: 14, weight: 700, anchor: 'middle', fill: '#123a7a' }); x += 2 * r + (i < gr.n - 1 ? gap : 0); }
    spans.push([s0, x, gr]);
    if (gi < b.groups.length - 1) x += ggap;
  });
  // under each group: a bracket and its power
  spans.forEach(([s0, s1, gr]) => {
    const by = cy + r + 8;
    g += `<path d="M${r1(s0 + 2)},${r1(by)} v6 H${r1(s1 - 2)} v-6" fill="none" stroke="${C.ink2}" stroke-width="1.4"/>`;
    g += rt((s0 + s1) / 2, by + 26, gr.label, { size: 14, weight: 700, anchor: 'middle', fill: C.ink2 });
    if (gr.note) g += rt((s0 + s1) / 2, by + 44, gr.note, { size: 12.5, anchor: 'middle', fill: C.mute });
  });
  // over every chip: the count, the key
  g += `<path d="M${r1(x0 + 2)},${r1(cy - r - 4)} v-6 H${r1(x0 + rowW - 2)} v6" fill="none" stroke="${C.key}" stroke-width="2"/>`;
  g += tag(W / 2, topTag - 2, b.result.label, 'key', { size: 13.5, anchor: 'middle' }).svg;
  const H = cy + r + 8 + (b.groups.some((gr) => gr.note) ? 52 : 34);
  const el = h('div', { class: 'qw-block' });
  if (b.title) el.append(hr('div', { class: 'qw-h' }, b.title));
  el.insertAdjacentHTML('beforeend', svgOpen(W, H) + g + '</svg>');
  box.append(el);
};

// a number line: ticks, jumps (forward above, every leg its own arc), points, rays, test points
BLOCKS.numberline = (b, box, W) => {
  const size = 12.5, L = 22, R = 22, pw = W - L - R;
  const min = num(b.min), max = num(b.max);
  const X = (v) => L + pw * (num(v) - min) / (max - min);
  const id = uid('qwn'), mk = { key: id + 'k', plain: id + 'p', trap: id + 't' };
  // jumps: levels by overlap, so a leg that doubles back rides above the one it covers
  const jumps = (b.jumps || []).map((j) => ({ j, a: X(j.from), z: X(num(j.from) + num(j.by)) }));
  const jl = [];
  jumps.forEach((q) => { const lo = Math.min(q.a, q.z), hi = Math.max(q.a, q.z); let lv = 0; while (jl.some((p) => p.lv === lv && Math.min(p.hi, hi) - Math.max(p.lo, lo) > 2)) lv++; jl.push({ q, lv, lo, hi }); });
  const nJ = jl.length ? Math.max(...jl.map((p) => p.lv)) + 1 : 0;
  const rayH = (b.rays || []).length ? 30 : 0;
  const top = (b.title ? 22 : 6) + 6, arcH = 30, axisY = top + nJ * arcH + (nJ ? 26 : 0) + rayH + 10;
  let g = `<defs>${marker(mk.key, C.key)}${marker(mk.plain, C.ink2)}${marker(mk.trap, C.trap)}</defs>`;
  if (b.title) g += rt(4, 16, b.title, { size: 13, weight: 700, fill: C.ink2 });
  // axis and ticks
  g += `<line x1="${L - 10}" y1="${axisY}" x2="${W - R + 10}" y2="${axisY}" stroke="${C.ink2}" stroke-width="1.6"/>`;
  const step = num(b.step);
  for (let v = min, i = 0; v <= max + 1e-9 && i < 400; v = min + (++i) * step) g += `<line x1="${r1(X(v))}" y1="${axisY - 5}" x2="${r1(X(v))}" y2="${axisY + 5}" stroke="${C.ink2}" stroke-width="1.2"/>`;
  const labels = b.labels || [];
  // a point or test point names its own value in its tag, so no tick label sits on its leader
  const marked = (b.points || []).concat(b.tests || []).map((p) => num(p.x));
  labels.filter((lb) => !marked.some((m) => Math.abs(m - num(lb.v)) < 1e-9)).forEach((lb) => { g += rt(X(lb.v), axisY + 22, lb.label, { size: 12.5, anchor: 'middle', fill: C.mute, weight: lb.bold ? 700 : 400 }); });
  // rays: a thick band along the axis from the boundary
  (b.rays || []).forEach((ry) => {
    const x0 = X(ry.from), x1 = ry.dir > 0 ? W - R + 8 : L - 8, col = ry.key ? C.key : ry.trap ? C.trap : '#8c9a93';
    g += `<line x1="${r1(x0)}" y1="${axisY}" x2="${r1(x1)}" y2="${axisY}" stroke="${col}" stroke-width="6" stroke-linecap="butt" marker-end="url(#${ry.key ? mk.key : ry.trap ? mk.trap : mk.plain})" opacity="${ry.key ? 1 : 0.85}"/>`;
    g += `<circle cx="${r1(x0)}" cy="${axisY}" r="7" fill="${ry.open ? '#fff' : col}" stroke="${col}" stroke-width="2.4"/>`;
    const lx = ry.dir > 0 ? Math.min(W - 6, x0 + 12) : Math.max(6, x0 - 12);
    g += tag(lx, axisY - 16, ry.label, ry.key ? 'key' : ry.trap ? 'trap' : 'plain', { size, anchor: ry.dir > 0 ? 'start' : 'end' }).svg;
  });
  // jumps: every arc first, then the labels on top of their arcs, each moved off the ends of other arcs
  jl.forEach(({ q, lv }) => {
    const j = q.j, hgt = 22 + lv * arcH, my = axisY - 8 - hgt, col = j.key ? C.key : j.trap ? C.trap : C.blue;
    g += `<path d="M${r1(q.a)},${axisY - 7} C${r1(q.a)},${r1(my)} ${r1(q.z)},${r1(my)} ${r1(q.z)},${axisY - 7}" fill="none" stroke="${col}" stroke-width="2" marker-end="url(#${j.key ? mk.key : j.trap ? mk.trap : mk.plain})"/>`;
  });
  const ends = jl.flatMap(({ q, lv }) => [{ x: q.a, lv, q }, { x: q.z, lv, q }]);
  jl.forEach(({ q, lv }) => {
    const j = q.j, hgt = 22 + lv * arcH, tw = measure(j.label, size, true) + 14, apex = axisY - 7 - 0.75 * (hgt + 1);
    let tx = (q.a + q.z) / 2;
    ends.filter((e) => e.q !== q && e.lv > lv && Math.abs(e.x - tx) < tw / 2 + 4).forEach((e) => { tx = e.x < tx ? e.x + tw / 2 + 5 : e.x - tw / 2 - 5; });
    tx = Math.max(4 + tw / 2, Math.min(W - 4 - tw / 2, tx));
    g += tag(tx, apex + 5, j.label, j.key ? 'key' : j.trap ? 'trap' : 'info', { size, anchor: 'middle' }).svg;
  });
  // points and test points: circles on the axis, labels below the tick labels, in levels
  const pts = (b.points || []).map((p) => ({ x: X(p.x), text: p.label, p, kind: p.key ? 'key' : p.trap ? 'trap' : 'plain' }))
    .concat((b.tests || []).map((t) => ({ x: X(t.x), text: t.label, p: t, kind: t.holds ? 'key' : 'trap', test: true })));
  pts.forEach((q) => {
    const p = q.p, col = q.kind === 'key' ? C.key : q.kind === 'trap' ? C.trap : C.ink2;
    if (q.test) g += `<path d="M${r1(q.x)},${axisY - 7} l6,7 l-6,7 l-6,-7 z" fill="#fff" stroke="${col}" stroke-width="2"/>`;
    else g += `<circle cx="${r1(q.x)}" cy="${axisY}" r="${p.key ? 7 : 6}" fill="${p.open ? '#fff' : col}" stroke="${col}" stroke-width="2.2"/>`;
  });
  const lab = levels(pts.filter((q) => q.text).map((q) => Object.assign({}, q, { minX: 2, maxX: W - 2 })), size);
  let yMax = axisY + (labels.length ? 30 : 12);
  lab.forEach((pl) => {
    const y = axisY + (labels.length ? 52 : 34) + pl.lv * 28;
    g += `<line x1="${r1(pl.it.x)}" y1="${axisY + (pl.it.test ? 9 : 9)}" x2="${r1(pl.it.x)}" y2="${r1(y - 16)}" stroke="${pl.it.kind === 'key' ? C.key : pl.it.kind === 'trap' ? C.trap : '#9aa59f'}" stroke-width="1" stroke-dasharray="${labels.length ? '2 3' : ''}"/>`;
    const tg = tag(pl.x0, y, pl.it.text, pl.it.kind, { size });
    g += tg.svg;
    yMax = Math.max(yMax, tg.bottom + 6);
  });
  const el = h('div', { class: 'qw-block' });
  el.insertAdjacentHTML('beforeend', svgOpen(W, yMax) + g + '</svg>');
  box.append(el);
};

// the cases b^2 - 4ac sorts, each parabola drawn from its own a, b, c
BLOCKS.parabolas = (b, box, W) => {
  const n = b.cases.length, gap = 8;
  if ((W - (n - 1) * gap) / n < 150) return parabolaRows(b, box, W);
  const pw = (W - (n - 1) * gap) / n, plotH = 92, padT = 8;
  const yTop = b.yMax != null ? b.yMax : 6, yBot = b.yMin != null ? b.yMin : -4;
  const xs = b.cases.map((cs) => -cs.b / (2 * cs.a));
  const xMid = (Math.min(...xs) + Math.max(...xs)) / 2, half = b.xHalf || 3;
  const x0 = xMid - half, x1 = xMid + half;
  let g = '';
  const lines = (cs) => [cs.cond, cs.outcome, cs.sub].filter(Boolean);
  const textH = Math.max(...b.cases.map((cs) => lines(cs).reduce((a, str) => a + 17 + supPad(str), 0))) + 10;
  b.cases.forEach((cs, i) => {
    const ox = i * (pw + gap), key = !!cs.key;
    const X = (x) => ox + 6 + (pw - 12) * (x - x0) / (x1 - x0), Y = (y) => padT + plotH * (yTop - y) / (yTop - yBot);
    g += `<rect x="${r1(ox + 1)}" y="1" width="${r1(pw - 2)}" height="${r1(padT + plotH + textH + 6)}" rx="8" fill="${key ? C.keyBg : '#f7f9f8'}" stroke="${key ? C.key : '#c9d3cd'}" stroke-width="${key ? 2.4 : 1.1}"/>`;
    // x-axis
    g += `<line x1="${r1(ox + 6)}" y1="${r1(Y(0))}" x2="${r1(ox + pw - 6)}" y2="${r1(Y(0))}" stroke="#7d8a83" stroke-width="1.4"/>`;
    // the curve, only where it is inside the plot
    const yv = cs.c - cs.b * cs.b / (4 * cs.a), xv = -cs.b / (2 * cs.a);
    const span = yTop > yv ? Math.sqrt((yTop - yv) / cs.a) : 0;
    const pts = Q.parabolaPoints(cs.a, cs.b, cs.c, Math.max(x0, xv - span), Math.min(x1, xv + span), 40);
    g += `<polyline points="${pts.map(([x, y]) => r1(X(x)) + ',' + r1(Y(y))).join(' ')}" fill="none" stroke="${key ? C.key : C.blue}" stroke-width="2.6"/>`;
    Q.quadRoots(cs.a, cs.b, cs.c).forEach((rx) => { g += `<circle cx="${r1(X(rx))}" cy="${r1(Y(0))}" r="5" fill="${key ? C.key : C.blue}" stroke="#fff" stroke-width="1.5"/>`; });
    let ty = padT + plotH + 20;
    lines(cs).forEach((s, k) => { if (k) ty += supPad(s); g += rt(ox + pw / 2, ty, s, { size: k === 1 ? 13 : 12.5, weight: k === 1 ? 700 : 400, anchor: 'middle', fill: key ? C.key : k === 1 ? C.ink : C.ink2 }); ty += 17; });
  });
  const H = padT + plotH + textH + 9;
  const el = h('div', { class: 'qw-block' });
  if (b.title) el.append(hr('div', { class: 'qw-h' }, b.title));
  el.insertAdjacentHTML('beforeend', svgOpen(W, H) + g + '</svg>');
  box.append(el);
};

// on a phone: one case per row, the curve on the left and its words on the right
function parabolaRows(b, box, W) {
  const rowH = 96, gap = 8, plotW = Math.min(130, Math.round(W * 0.42)), padT = 8, plotH = rowH - 2 * padT;
  const yTop = b.yMax != null ? b.yMax : 6, yBot = b.yMin != null ? b.yMin : -4;
  const xs = b.cases.map((cs) => -cs.b / (2 * cs.a));
  const xMid = (Math.min(...xs) + Math.max(...xs)) / 2, half = b.xHalf || 3, x0 = xMid - half, x1 = xMid + half;
  let g = '';
  b.cases.forEach((cs, i) => {
    const oy = i * (rowH + gap), key = !!cs.key;
    const X = (x) => 8 + (plotW - 16) * (x - x0) / (x1 - x0), Y = (y) => oy + padT + plotH * (yTop - y) / (yTop - yBot);
    g += `<rect x="1" y="${r1(oy + 1)}" width="${r1(W - 2)}" height="${rowH - 2}" rx="8" fill="${key ? C.keyBg : '#f7f9f8'}" stroke="${key ? C.key : '#c9d3cd'}" stroke-width="${key ? 2.4 : 1.1}"/>`;
    g += `<line x1="8" y1="${r1(Y(0))}" x2="${r1(plotW - 8)}" y2="${r1(Y(0))}" stroke="#7d8a83" stroke-width="1.4"/>`;
    const yv = cs.c - cs.b * cs.b / (4 * cs.a), xv = -cs.b / (2 * cs.a), span = yTop > yv ? Math.sqrt((yTop - yv) / cs.a) : 0;
    const pts = Q.parabolaPoints(cs.a, cs.b, cs.c, Math.max(x0, xv - span), Math.min(x1, xv + span), 40);
    g += `<polyline points="${pts.map(([x, y]) => r1(X(x)) + ',' + r1(Y(y))).join(' ')}" fill="none" stroke="${key ? C.key : C.blue}" stroke-width="2.6"/>`;
    Q.quadRoots(cs.a, cs.b, cs.c).forEach((rx) => { g += `<circle cx="${r1(X(rx))}" cy="${r1(Y(0))}" r="5" fill="${key ? C.key : C.blue}" stroke="#fff" stroke-width="1.5"/>`; });
    const lines = [cs.cond, cs.outcome, cs.sub].filter(Boolean);
    const textSpan = (lines.length - 1) * 18 + lines.slice(1).reduce((a, str) => a + supPad(str), 0);
    let ty = oy + rowH / 2 - textSpan / 2 + 5;
    lines.forEach((str, k) => { if (k) ty += supPad(str); g += rt(plotW + 6, ty, str, { size: k === 1 ? 14 : 13, weight: k === 1 ? 700 : 400, fill: key ? C.key : k === 1 ? C.ink : C.ink2 }); ty += 18; });
  });
  const el = h('div', { class: 'qw-block' });
  if (b.title) el.append(hr('div', { class: 'qw-h' }, b.title));
  el.insertAdjacentHTML('beforeend', svgOpen(W, b.cases.length * (rowH + gap) - gap + 2) + g + '</svg>');
  box.append(el);
}

const ORDER_SKIP = new Set(['type', 'alt', 'caption', 'focus', 'reuse', 'dataRef', 'check', 'title', 'note']);
register('qr.work', (s, box) => {
  css();
  const W = width(box);
  if (s.title) box.append(hr('div', { class: 'qw-h' }, s.title));
  for (const k of Object.keys(s)) {
    if (ORDER_SKIP.has(k)) continue;
    const fn = BLOCKS[k];
    if (fn) fn(s[k], box, W, s);
  }
  if (s.note) box.append(hr('p', { class: 'qw-note' }, s.note));
});

/* ===================================================== qr.partwhole styles */
const KIND = {
  base: { fill: '#eef1ef', stroke: '#aab5af', ink: C.ink2, w: 1.2 },
  part: { fill: C.mintBg, stroke: C.mint, ink: C.ink, w: 1.4 },
  add: { fill: C.blueBg, stroke: C.blue, ink: '#123a7a', w: 1.6 },
  off: { fill: C.trapBg, stroke: C.trap, ink: '#6b3000', w: 1.4, hatch: true },
  key: { fill: C.keyBg, stroke: C.key, ink: C.key, w: 2.6 }
};
function hatchDef(id) { return `<pattern id="${id}" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="7" height="7" fill="${C.trapBg}"/><rect width="2.2" height="7" fill="#e7b48c"/></pattern>`; }

// equal groups, each split into the same parts; brackets under the columns total each part
PARTWHOLE_STYLES.groups = (s, box) => {
  const W = width(box), per = s.each.reduce((a, x) => a + x.n, 0);
  const lw = Math.max(...Array.from({ length: s.groups }, (_, i) => measure(s.groupName + ' ' + (i + 1), 13, true))) + 12;
  const rw = Math.max(...s.each.map((x) => measure(x.n + ' ' + x.label, 13, true))) + 10;
  const cell = Math.min(30, Math.floor((W - lw - rw - 16) / per) - 4), gap = 4;
  const gx = lw, gw = per * (cell + gap) - gap, top = 6, rowH = cell + 8;
  const hid = uid('qwh');
  let g = `<defs>${hatchDef(hid)}</defs>`;
  for (let r = 0; r < s.groups; r++) {
    const y = top + r * rowH;
    g += rt(4, y + cell / 2 + 5, s.groupName + ' ' + (r + 1), { size: 13, weight: 700, fill: C.ink2 });
    let c = 0;
    s.each.forEach((x) => { for (let i = 0; i < x.n; i++, c++) { const k = KIND[x.kind] || KIND.base; g += `<rect x="${r1(gx + c * (cell + gap))}" y="${r1(y)}" width="${cell}" height="${cell}" rx="3" fill="${k.hatch ? 'url(#' + hid + ')' : k.fill}" stroke="${k.stroke}" stroke-width="${x.kind === 'key' ? 2 : k.w}"/>`; } });
    const kp = s.each.find((x) => x.kind === 'key');
    if (kp) g += rt(gx + gw + 10, y + cell / 2 + 5, kp.n + ' ' + kp.label, { size: 13, weight: 700, fill: C.key });
  }
  // brackets under each part's columns, labels stacked so they never meet
  let y = top + s.groups * rowH + 4, c0 = 0, H = y;
  const cols = s.each.map((x) => { const a = gx + c0 * (cell + gap), z = gx + (c0 + x.n) * (cell + gap) - gap; c0 += x.n; return { x, a, z }; });
  cols.forEach((col, i) => {
    const col2 = (s.columns || []).find((cc) => s.each[cc.part] === col.x); if (!col2) return;
    const role = col2.key ? 'key' : col2.trap ? 'trap' : 'plain', stroke = role === 'key' ? C.key : role === 'trap' ? C.trap : C.ink2;
    const ly = y + 30 + i * 30;
    g += `<path d="M${r1(col.a + 1)},${r1(y)} v6 H${r1(col.z - 1)} v-6" fill="none" stroke="${stroke}" stroke-width="1.8"/>`;
    g += `<line x1="${r1((col.a + col.z) / 2)}" y1="${r1(y + 6)}" x2="${r1((col.a + col.z) / 2)}" y2="${r1(ly - 16)}" stroke="${stroke}" stroke-width="1"/>`;
    const tw = measure(col2.label, 13, true) + 14, tx = Math.max(2, Math.min(W - 2 - tw, (col.a + col.z) / 2 - tw / 2));
    const tg = tag(tx, ly, col2.label, role, { size: 13 });
    g += tg.svg; H = Math.max(H, tg.bottom + 4);
  });
  box.innerHTML = svgOpen(W, H + 2) + g + '</svg>';
};

// bars drawn to one scale, split into labeled pieces; ghost marks for the traps
PARTWHOLE_STYLES.bars = (s, box) => {
  const W = width(box), L = 8, R = 8, pw = W - L - R, size = 12.5, barH = 30;
  const max = Q.barsMax(s), X = (v) => L + pw * v / max;
  const hid = uid('qwh');
  let g = `<defs>${hatchDef(hid)}</defs>`, y = 4;
  s.rows.forEach((row, ri) => {
    if (row.title) wrapLines(row.title, pw, 13, true).forEach((ln) => { g += rt(L, y + 14, ln, { size: 13, weight: 700, fill: C.ink2 }); y += 18; });
    if (row.title) y += 4;
    // ghost tags (where a trap lands) get their own line above the bar, so the pieces keep the space below
    const ghosts = (s.ghosts || []).filter((gh) => (gh.row || 0) === ri);
    let ghostSvg = '';
    if (ghosts.length) {
      const lv = levels(ghosts.map((gh) => ({ x: X(gh.at), text: gh.label, kind: 'trap', minX: 2, maxX: W - 2 })), size);
      const nLv = Math.max(...lv.map((pl) => pl.lv)) + 1;
      lv.forEach((pl) => { const ty = y + 16 + (nLv - 1 - pl.lv) * 26; ghostSvg += tag(pl.x0, ty, pl.it.text, 'trap', { size }).svg; pl.it.top = ty + 6; });
      ghosts.forEach((gh, k) => { gh._tagBottom = lv.find((pl) => pl.it.text === gh.label).it.top; });
      y += nLv * 26 + 8;
    }
    const by = y;
    let x = 0;
    const below = [];
    row.pieces.forEach((pc) => {
      const k = KIND[pc.kind] || KIND.base, xa = X(x), xz = X(x + pc.n), w = xz - xa;
      if (pc.cells) {
        // cells sit on one grid from the start of the bar (every tenth, say), cut where a piece ends
        const a0 = x, a1 = x + pc.n, c = pc.cells;
        for (let kk = Math.floor(a0 / c + 1e-9); kk * c < a1 - 1e-9; kk++) {
          const ca = Math.max(a0, kk * c), cz = Math.min(a1, (kk + 1) * c), wx = X(cz) - X(ca);
          g += `<rect x="${r1(X(ca) + 0.8)}" y="${r1(by)}" width="${r1(Math.max(0.5, wx - 1.6))}" height="${barH}" rx="2" fill="${k.hatch ? 'url(#' + hid + ')' : k.fill}" stroke="${k.stroke}" stroke-width="${pc.kind === 'key' ? 1.8 : k.w}"/>`;
        }
        if (pc.kind === 'key') g += `<rect x="${r1(xa - 1)}" y="${r1(by - 3)}" width="${r1(w + 2)}" height="${barH + 6}" rx="4" fill="none" stroke="${C.key}" stroke-width="2.6"/>`;
      } else {
        g += `<rect x="${r1(xa)}" y="${r1(by)}" width="${r1(w)}" height="${barH}" rx="3" fill="${k.hatch ? 'url(#' + hid + ')' : k.fill}" stroke="${k.stroke}" stroke-width="${k.w}"/>`;
      }
      if (pc.label) {
        const tw = measure(pc.label, size, pc.kind === 'key');
        if (tw + 10 < w && !pc.cells) g += rt(xa + w / 2, by + barH / 2 + 4.5, pc.label, { size, weight: pc.kind === 'key' ? 700 : 400, anchor: 'middle', fill: k.ink });
        else below.push({ x: xa + w / 2, text: pc.label, kind: pc.kind === 'key' ? 'key' : pc.kind === 'off' ? 'trap' : pc.kind === 'add' ? 'info' : 'plain' });
      }
      x += pc.n;
    });
    // ghosts: a dashed mark where a trap lands, on this row's scale
    ghosts.forEach((gh) => {
      const gx = X(gh.at);
      g += `<line x1="${r1(gx)}" y1="${r1(gh._tagBottom)}" x2="${r1(gx)}" y2="${r1(by + barH + 6)}" stroke="${C.trap}" stroke-width="2" stroke-dasharray="4 3"/>`;
      if (gh.past) g += `<rect x="${r1(X(x))}" y="${r1(by + 4)}" width="${r1(Math.max(0, gx - X(x)))}" height="${barH - 8}" fill="none" stroke="${C.trap}" stroke-width="1.4" stroke-dasharray="5 3" rx="2"/>`;
    });
    g += ghostSvg;
    // a keyed total: the whole bar outlined, its label below with the others
    if (row.key) { g += `<rect x="${r1(L - 2)}" y="${r1(by - 4)}" width="${r1(X(x) - L + 4)}" height="${barH + 8}" rx="5" fill="none" stroke="${C.key}" stroke-width="2.6"/>`; if (row.keyLabel) below.push({ x: (L + X(x)) / 2, text: row.keyLabel, kind: 'key' }); }
    y = by + barH + 8;
    if (below.length) {
      const lv = levels(below.map((q) => Object.assign({}, q, { minX: 2, maxX: W - 2 })), size);
      let maxLv = 0;
      lv.forEach((pl) => {
        const ly = y + 22 + pl.lv * 28; maxLv = Math.max(maxLv, pl.lv);
        g += `<line x1="${r1(pl.it.x)}" y1="${r1(by + barH + 1)}" x2="${r1(pl.it.x)}" y2="${r1(ly - 16)}" stroke="${pl.it.kind === 'key' ? C.key : pl.it.kind === 'trap' ? C.trap : '#9aa59f'}" stroke-width="1"/>`;
        g += tag(pl.x0, ly, pl.it.text, pl.it.kind, { size }).svg;
      });
      y += 22 + maxLv * 28 + 10;
    }
    if (row.foot) { g += rt(L, y + 8, row.foot, { size: 12.5, fill: C.ink2 }); y += 18; }
    y += 10;
  });
  box.innerHTML = svgOpen(W, y) + g + '</svg>';
};

// fraction bars, renamed, then poured into tanks so the total shows past one whole
PARTWHOLE_STYLES.fractions = (s, box) => {
  const W = width(box), L = 6, gapT = 10, Tw = Math.floor((W - 2 * L - gapT) / 2), barH = 26, size = 12.5;
  const tones = [{ fill: C.blueBg, stroke: C.blue }, { fill: C.mintBg, stroke: C.mint }];
  let g = '', y = 4;
  s.rows.forEach((r, i) => {
    wrapLines(r.label, W - 2 * L, 13, true).forEach((ln) => { g += rt(L, y + 14, ln, { size: 13, weight: 700, fill: C.ink2 }); y += 18; }); y += 4;
    const cw = Tw / r.den;
    for (let k = 0; k < r.den; k++) g += `<rect x="${r1(L + k * cw + 0.8)}" y="${r1(y)}" width="${r1(cw - 1.6)}" height="${barH}" rx="2" fill="${k < r.num ? tones[i % 2].fill : '#fff'}" stroke="${k < r.num ? tones[i % 2].stroke : '#b9c4be'}" stroke-width="1.3"/>`;
    g += rt(L + Tw + 10, y + barH / 2 + 5, r.num + ' of ' + r.den, { size: 13, fill: C.ink2 });
    y += barH + 12;
  });
  // the pour: every row's share lands in order, tank after tank
  const t = s.total;
  wrapLines(t.label, W - 2 * L, 13, true).forEach((ln) => { g += rt(L, y + 14, ln, { size: 13, weight: 700, fill: C.key }); y += 18; }); y += 4;
  const tankY = y, total = s.rows.reduce((a, r) => a + r.num / r.den, 0), tanks = Math.max(2, Math.ceil(total - 1e-9));
  for (let k = 0; k < tanks; k++) g += `<rect x="${r1(L + k * (Tw + gapT))}" y="${r1(tankY)}" width="${Tw}" height="${barH + 8}" rx="4" fill="#fff" stroke="#9aa59f" stroke-width="1.3"/>`;
  let acc = 0;
  s.rows.forEach((r, i) => {
    let left = r.num / r.den;
    while (left > 1e-9) {
      const k = Math.floor(acc + 1e-9), room = k + 1 - acc, take = Math.min(room, left);
      const xa = L + k * (Tw + gapT) + (acc - k) * Tw, w = take * Tw;
      g += `<rect x="${r1(xa + 1)}" y="${r1(tankY + 4)}" width="${r1(Math.max(0, w - 2))}" height="${barH}" fill="${tones[i % 2].fill}" stroke="${tones[i % 2].stroke}" stroke-width="1.3"/>`;
      acc += take; left -= take;
    }
  });
  // the key: outline the filled stretch, tank by tank
  for (let k = 0; k < tanks && k < acc; k++) { const w = Math.min(1, acc - k) * Tw; g += `<rect x="${r1(L + k * (Tw + gapT) - 2)}" y="${r1(tankY - 2)}" width="${r1(w + 4)}" height="${barH + 12}" rx="5" fill="none" stroke="${C.key}" stroke-width="2.6"/>`; }
  y = tankY + barH + 14;
  (s.tankLabels || []).forEach((lb, k) => { g += rt(L + k * (Tw + gapT) + Tw / 2, y + 12, lb, { size: 12.5, anchor: 'middle', fill: C.ink2, weight: 700 }); });
  if ((s.tankLabels || []).length) y += 20;
  if (t.tag) { g += tag(L, y + 18, t.tag, 'key', { size: 13 }).svg; y += 28; }
  box.innerHTML = svgOpen(W, y + 4) + g + '</svg>';
};

/* ============================================================== qr.geometry */
register('qr.geometry', (s, box) => {
  if (s.shape !== 'sphere') throw new Error('qr.geometry has no shape ' + s.shape);
  css();
  const W = width(box), n = s.measures.length, gap = 8, pw = (W - (n - 1) * gap) / n;
  const R = Math.min(40, pw / 2 - 8), cyD = 14 + R + 6, M = Q.sphere(s.r);
  let g = `<defs><radialGradient id="${uid('qwg')}" cx="35%" cy="32%" r="75%"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#9fd8c2"/></radialGradient></defs>`;
  const gid = /id="(qwg\d+)"/.exec(g)[1];
  const textH = 4 * 17 + Math.max(...s.measures.map((m) => supPad(m.formula))) + 8;
  s.measures.forEach((m, i) => {
    const ox = i * (pw + gap), cx = ox + pw / 2, key = !!m.key, H0 = cyD + R + 12 + textH;
    g += `<rect x="${r1(ox + 1)}" y="1" width="${r1(pw - 2)}" height="${r1(H0)}" rx="8" fill="${key ? C.keyBg : '#f7f9f8'}" stroke="${key ? C.key : '#c9d3cd'}" stroke-width="${key ? 2.4 : 1.1}"/>`;
    if (m.kind === 'area') {
      g += `<circle cx="${r1(cx)}" cy="${r1(cyD)}" r="${r1(R)}" fill="${C.blueBg}" stroke="${C.blue}" stroke-width="2"/>`;
    } else if (m.kind === 'surface') {
      g += `<circle cx="${r1(cx)}" cy="${r1(cyD)}" r="${r1(R)}" fill="#fff" stroke="${C.trap}" stroke-width="4"/>`;
      g += `<path d="M${r1(cx - R)},${r1(cyD)} A${r1(R)},${r1(R * 0.3)} 0 0 0 ${r1(cx + R)},${r1(cyD)}" fill="none" stroke="#c98b5c" stroke-width="1"/>`;
    } else {
      g += `<circle cx="${r1(cx)}" cy="${r1(cyD)}" r="${r1(R)}" fill="url(#${gid})" stroke="${C.key}" stroke-width="2"/>`;
      g += `<path d="M${r1(cx - R)},${r1(cyD)} A${r1(R)},${r1(R * 0.3)} 0 0 0 ${r1(cx + R)},${r1(cyD)}" fill="none" stroke="#2f8a6a" stroke-width="1"/>`;
    }
    // the radius, labeled above the line with a halo
    g += `<line x1="${r1(cx)}" y1="${r1(cyD)}" x2="${r1(cx + R)}" y2="${r1(cyD)}" stroke="${C.ink}" stroke-width="1.8"/><circle cx="${r1(cx)}" cy="${r1(cyD)}" r="2.6" fill="${C.ink}"/>`;
    g += rt(cx + 3, cyD - 7, 'r = ' + s.r, { size: 12.5, weight: 700, halo: true });
    const val = M[m.kind].toFixed(2), unit = Q.SPHERE_UNITS[m.kind] + ' ' + s.unit;
    let ty = cyD + R + 28;
    [[m.label, 13, 700, key ? C.key : C.ink], [m.formula, 13, 400, key ? C.key : C.ink2], [val, 14, 700, key ? C.key : C.ink], [unit, 12.5, 400, key ? C.key : C.mute]].forEach(([str, sz, wt, fill], k) => { if (k) ty += supPad(str); g += rt(cx, ty, str, { size: sz, weight: wt, anchor: 'middle', fill }); ty += 17; });
  });
  const H = cyD + R + 12 + textH + 4;
  box.innerHTML = svgOpen(W, H) + g + '</svg>';
  if (s.note) box.append(hr('p', { class: 'qw-note' }, s.note));
});

export { BLOCKS as QR_BLOCKS };
