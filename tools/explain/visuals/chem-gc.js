// chem-gc.js: the Gen Chem pictures (batch B003 onward).
//
//   chem.ledger   a ledger of blocks, drawn in the order the spec lists them:
//                 tokens (gas moles counted on each side), shift (an
//                 equilibrium chain pushed by a removed species), ice (an ICE
//                 table), chain (a dimensional-analysis chain with the places a
//                 trap stops), beakers (a dilution), bars, rows (ledger lines),
//                 rules (a compare table), sigfigs (digits, significant ones
//                 filled), formulas (empirical units stacked against the molar
//                 mass), scale (a number line, linear or log, with the choices
//                 placed on it) and imf (two molecule pairs and the force
//                 between them)
//   chem.gas      cylinders with pistons (states before and after, or one state
//                 split into moles), or a mixture box with its pressure bar
//   chem.cell     a concentration cell (electrodes, salt bridge, electron flow,
//                 meter) or the E-standard to K ruler
//   chem.orbital  orbital boxes and an isoelectronic ion table
//   chem.curve    kinds gibbs, decay, half-lives, ph-scale, buffer and phase,
//                 added to the CURVE_KINDS map that chem.js exports (the
//                 titration kind stays in chem.js)
//   chem.energy   kind levels (an enthalpy ladder), added to ENERGY_KINDS
//
// Every number a picture draws is computed from the spec with the same
// helpers the build gate runs (compute-gc.js), and every word comes from the
// spec. Drawn at the width shown (about 314 px on a 390 px phone), text at 12
// px or larger, the key's place outlined and named in words as well as color.
import { register, C, FONT, r1, svgOpen, width, h, esc, uid } from './core.js';
import { CURVE_KINDS, ENERGY_KINDS, LEWIS_EXTRAS } from './chem.js';
import * as G from './compute-gc.js';

/* ------------------------------------------------------------------ helpers */
const BOLDW = 1.08;
// display markup, as the player typesets it: x^2, 10^-5, [A^-], K_a
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
  for (const p of parts(str)) for (const ch of p.s) w += (/[A-Z0-9]/.test(ch) ? 0.66 : /[a-z]/.test(ch) ? 0.53 : ch === ' ' ? 0.28 : 0.36) * (p.sup || p.sub ? 0.85 : 1);
  return w * size * (bold ? BOLDW : 1);
}
// SVG text with ^ and _ typeset; superscripts never under 12 px
function rt(x, y, str, o = {}) {
  const size = o.size || 13, small = Math.max(12, +(size * 0.82).toFixed(1));
  const a = [`x="${r1(x)}"`, `y="${r1(y)}"`, `font-size="${size}"`, `fill="${o.fill || C.ink}"`, `font-family="${FONT}"`];
  if (o.anchor) a.push(`text-anchor="${o.anchor}"`);
  if (o.weight) a.push(`font-weight="${o.weight}"`);
  if (o.halo !== false && o.halo !== undefined) a.push(`paint-order="stroke" stroke="${o.halo === true ? '#fff' : o.halo}" stroke-width="4" stroke-linejoin="round"`);
  const inner = parts(str).map((p) => p.sup ? `<tspan font-size="${small}" baseline-shift="super">${esc(p.s)}</tspan>` : p.sub ? `<tspan font-size="${small}" baseline-shift="sub">${esc(p.s)}</tspan>` : esc(p.s)).join('');
  return `<text ${a.join(' ')}>${inner}</text>`;
}
// wrap rich text to a width
function wrapRich(s, maxW, size, bold) {
  const words = String(s).split(/\s+/), lines = []; let cur = '';
  for (const w of words) { const nx = cur ? cur + ' ' + w : w; if (measure(nx, size, bold) > maxW && cur) { lines.push(cur); cur = w; } else cur = nx; }
  if (cur) lines.push(cur);
  return lines;
}
// a rounded, outlined label; y is the text baseline
const ROLE = {
  key: { fill: C.keyBg, stroke: C.key, ink: C.key, w: 2.2 },
  trap: { fill: C.trapBg, stroke: C.trap, ink: '#6b3000', w: 1.3 },
  plain: { fill: '#f7f9f8', stroke: '#c9d3cd', ink: C.ink, w: 1.1 },
  info: { fill: C.blueBg, stroke: C.blue, ink: C.blue, w: 1.2 }
};
// a subscript gets 6 px more room below the baseline, so its descender clears the border
function tagBox(y, label, size) {
  const sup = parts(label).some((p) => p.sup), sub = parts(label).some((p) => p.sub);
  return { top: y - size - 2 - (sup ? 5 : 0), bottom: y + 7 + (sub ? 6 : 0) };
}
function tag(x, y, label, role = 'plain', o = {}) {
  const size = o.size || 12.5, R = ROLE[role] || ROLE.plain, w = measure(label, size, true) + 14, bx = tagBox(y, label, size);
  const x0 = o.anchor === 'end' ? x - w : o.anchor === 'middle' ? x - w / 2 : x;
  return { w, x0, top: bx.top, bottom: bx.bottom, svg: `<rect x="${r1(x0)}" y="${r1(bx.top)}" width="${r1(w)}" height="${r1(bx.bottom - bx.top)}" rx="5" fill="${R.fill}" stroke="${R.stroke}" stroke-width="${R.w}"/>` + rt(x0 + w / 2, y + 0.5, label, { size, weight: 700, anchor: 'middle', fill: R.ink }) };
}
function marker(id, color, size = 9) {
  return `<marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="${size}" markerHeight="${size}" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${color}"/></marker>`;
}
// HTML with ^ and _ typeset, and <=> and -> drawn as small arrows
function eqIcon(kind) {
  const n = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  n.setAttribute('viewBox', '0 0 28 14'); n.setAttribute('width', '26'); n.setAttribute('height', '13'); n.setAttribute('aria-hidden', 'true'); n.setAttribute('class', 'gc-arr');
  n.innerHTML = kind === 'eq'
    ? '<path d="M3 5 H24 L19 1.5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M25 9 H4 L9 12.5" fill="none" stroke="currentColor" stroke-width="1.5"/>'
    : '<path d="M3 7 H23" stroke="currentColor" stroke-width="1.6"/><path d="M18 3 L24 7 L18 11" fill="none" stroke="currentColor" stroke-width="1.6"/>';
  return n;
}
function rich(str) {
  const frag = document.createDocumentFragment();
  String(str == null ? '' : str).split(/(<=>|->)/).forEach((seg) => {
    if (seg === '<=>') { frag.append(' ', eqIcon('eq'), ' '); return; }
    if (seg === '->') { frag.append(' ', eqIcon('to'), ' '); return; }
    for (const p of parts(seg)) frag.append(p.sup ? h('sup', { text: p.s }) : p.sub ? h('sub', { text: p.s }) : document.createTextNode(p.s));
  });
  return frag;
}
const hr = (tag0, attrs, str) => { const n = h(tag0, attrs); n.append(rich(str)); return n; };
// a seeded scatter, so a drawing is the same on every load
function scatter(n, x0, y0, w, hgt, seed = 7, minD = 11, avoid = null) {
  let s = seed; const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  const pts = [];
  for (let tries = 0; pts.length < n && tries < 4000; tries++) {
    const p = { x: x0 + 7 + rnd() * (w - 14), y: y0 + 7 + rnd() * (hgt - 14) };
    if ((!avoid || !avoid(p)) && pts.every((q) => Math.hypot(q.x - p.x, q.y - p.y) >= minD)) pts.push(p);
  }
  return pts;
}
const fmt = (v, d = 2) => (Math.abs(v) >= 100 || Number.isInteger(v) ? String(Math.round(v * 100) / 100) : v.toFixed(d));

let cssDone = false;
function css() {
  if (cssDone || typeof document === 'undefined') return; cssDone = true;
  const st = document.createElement('style');
  st.textContent = `
.vis sup, .vis sub { font-size: max(12px, .78em); }
.gc-h { font-size: 13px; font-weight: 700; color: var(--ink2, #3b4a43); margin: 2px 2px 6px; }
.gc-ledger .ledger-h { text-transform: none; letter-spacing: 0; font-size: 13px; color: var(--ink2, #3b4a43); }
.gc-block + .gc-block { margin-top: 10px; }
.gc-arr { display: inline-block; vertical-align: -1px; color: var(--ink2, #3b4a43); }
.gc-rxn { font-size: 15px; text-align: center; margin: 2px 0 8px; color: var(--ink, #16211c); }
.gc-ice-t { width: 100%; border-collapse: collapse; font-size: 14px; table-layout: auto; }
.gc-ice-t th, .gc-ice-t td { border: 1px solid #dbe3de; padding: 6px 4px; text-align: center; }
.gc-ice-t thead th { background: #f3f6f4; font-weight: 700; }
.gc-ice-t tbody th { text-align: left; font-weight: 700; color: var(--ink2, #3b4a43); padding-left: 6px; }
.gc-ice-t td.is-key { outline: 2.5px solid var(--ok, #00704f); outline-offset: -3px; background: var(--ok-bg, #e2f4ec); color: var(--ok, #00704f); font-weight: 700; }
.gc-ledger .ledger-r span { min-width: 0; }
.gc-ledger .ledger-r b { white-space: nowrap; }
.gc-ledger .ledger-r.is-trap { color: #6b3000; }
.gc-rules { border: 1px solid #dbe3de; border-radius: 8px; padding: 6px 8px; background: #fbfcfb; font-size: 14.5px; }
.gc-rule { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 2px 10px; padding: 6px 6px; border-bottom: 1px dashed #e3e8e5; align-items: baseline; }
.gc-rule:last-child { border-bottom: 0; }
.gc-rule-then { font-weight: 700; white-space: nowrap; }
.gc-rule-tag { grid-column: 1 / -1; font-style: normal; font-size: 13.5px; color: var(--ink2, #3b4a43); }
.gc-rule.is-key { border: 2px solid var(--ok, #00704f); border-radius: 6px; background: var(--ok-bg, #e2f4ec); margin: 4px 0; }
.gc-rule.is-key .gc-rule-then, .gc-rule.is-key .gc-rule-tag { color: var(--ok, #00704f); }
.gc-rule.is-trap .gc-rule-tag { color: #6b3000; }
.gc-chain { display: flex; flex-direction: column; align-items: stretch; gap: 0; }
.gc-node { display: flex; flex-wrap: wrap; align-items: baseline; gap: 4px 8px; border: 1.5px solid #c9d3cd; border-radius: 8px; padding: 7px 10px; background: #fff; font-size: 15px; }
.gc-node b { font-size: 16px; }
.gc-node.is-key { border: 2.5px solid var(--ok, #00704f); background: var(--ok-bg, #e2f4ec); color: var(--ok, #00704f); }
.gc-node-tag { margin-left: auto; font-style: normal; font-size: 12.5px; font-weight: 700; padding: 1px 7px; border: 1.5px solid var(--ok, #00704f); border-radius: 10px; background: #fff; }
.gc-link { display: flex; align-items: center; gap: 8px; padding: 3px 0 3px 22px; position: relative; font-size: 13.5px; color: var(--ink2, #3b4a43); min-height: 30px; }
.gc-link::before { content: ""; position: absolute; left: 12px; top: 0; bottom: 0; border-left: 2px solid #9aa59f; }
.gc-link::after { content: ""; position: absolute; left: 7px; bottom: 0; border: 6px solid transparent; border-top: 7px solid #9aa59f; border-bottom: 0; }
.gc-link-op { background: var(--blue-bg, #e6eefb); color: var(--blue, #1f57b5); border: 1px solid #b9cdef; border-radius: 12px; padding: 2px 9px; font-weight: 700; }
.gc-exit { margin: 4px 0 2px 26px; padding: 4px 9px; border: 1.3px dashed #9b4500; border-radius: 8px; background: #fbece0; color: #6b3000; font-size: 13.5px; }
.gc-sf { border: 1px solid #dbe3de; border-radius: 8px; padding: 6px 8px; background: #fbfcfb; }
.gc-sf-r { display: flex; align-items: center; gap: 10px; padding: 5px 4px; border-bottom: 1px dashed #e3e8e5; font-size: 14px; }
.gc-sf-r:last-child { border-bottom: 0; }
.gc-sf-num { display: inline-flex; gap: 2px; min-width: 104px; }
.gc-sf-num span { display: inline-grid; place-items: center; min-width: 17px; height: 26px; font-size: 16px; font-family: "JetBrains Mono", Consolas, monospace; }
.gc-sf-num span.d { border: 1.4px solid #9aa59f; border-radius: 4px; background: #fff; }
.gc-sf-num span.d.s { background: #dfe9f9; border-color: #1f57b5; color: #123a7a; font-weight: 700; }
.gc-sf-r b { white-space: nowrap; }
.gc-sf-r em { font-style: normal; color: var(--ink2, #3b4a43); font-size: 13.5px; margin-left: auto; text-align: right; }
.gc-sf-r.is-key { border: 2px solid var(--ok, #00704f); border-radius: 6px; background: var(--ok-bg, #e2f4ec); }
.gc-sf-r.is-key em, .gc-sf-r.is-key b { color: var(--ok, #00704f); font-weight: 700; }
.gc-sf-r.is-rule { font-weight: 700; color: var(--ink, #16211c); }
.gc-ions { width: 100%; border-collapse: collapse; font-size: 14px; }
.gc-ions th, .gc-ions td { border-bottom: 1px solid #e3e8e5; padding: 5px 4px; text-align: center; }
.gc-ions th { font-size: 12.5px; color: var(--mute, #5c6a63); font-weight: 700; }
.gc-ions td:first-child, .gc-ions th:first-child { text-align: left; padding-left: 8px; }
.gc-ions tr.is-key td { color: var(--ok, #00704f); font-weight: 700; background: var(--ok-bg, #e2f4ec); border-top: 2px solid var(--ok, #00704f); border-bottom: 2px solid var(--ok, #00704f); }
.gc-ions tr.is-key td:first-child { border-left: 2px solid var(--ok, #00704f); }
.gc-ions tr.is-key td:last-child { border-right: 2px solid var(--ok, #00704f); }
.gc-note { margin: 6px 4px 0; font-size: 13.5px; color: var(--ink2, #3b4a43); }
.gc-domains { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; font-size: 13.5px; }
.gc-domains span { border: 1.3px solid #c9d3cd; border-radius: 8px; padding: 3px 8px; background: #fff; }
.gc-domains span.is-key { border: 2.4px solid var(--ok, #00704f); background: var(--ok-bg, #e2f4ec); color: var(--ok, #00704f); font-weight: 700; }
.gc-domains b { margin-right: 4px; }
`;
  document.head.append(st);
}

/* ====================================================== chem.ledger blocks */
const BLOCKS = {};

// gas particles counted on each side of an equation
BLOCKS.tokens = (b, box, W) => {
  const pillH = 30, gap = 8, size = 14;
  const side = (arr) => arr.flatMap((m) => Array.from({ length: m.n }, () => m.f));
  const L = side(b.left), R = side(b.right);
  const rows = Math.max(L.length, R.length), top = 10, colH = rows * pillH + (rows - 1) * gap;
  const cxL = W * 0.24, cxR = W * 0.76, H = top + colH + 74;
  let g = '';
  const pill = (cx, y, f) => { const w = measure(f, size, true) + 22; return `<rect x="${r1(cx - w / 2)}" y="${r1(y)}" width="${r1(w)}" height="${pillH}" rx="${pillH / 2}" fill="${C.blueBg}" stroke="${C.blue}" stroke-width="1.4"/>` + rt(cx, y + 20, f, { size, weight: 700, anchor: 'middle', fill: '#123a7a' }); };
  const stack = (arr, cx) => { const h0 = arr.length * pillH + (arr.length - 1) * gap, y0 = top + (colH - h0) / 2; arr.forEach((f, i) => { g += pill(cx, y0 + i * (pillH + gap), f); }); };
  stack(L, cxL); stack(R, cxR);
  // equilibrium arrow: two half arrows
  const ay = top + colH / 2, a0 = W * 0.42, a1 = W * 0.58;
  g += `<path d="M${r1(a0)} ${r1(ay - 4)} H${r1(a1)} l-7 -5" fill="none" stroke="${C.ink2}" stroke-width="1.8"/><path d="M${r1(a1)} ${r1(ay + 4)} H${r1(a0)} l7 5" fill="none" stroke="${C.ink2}" stroke-width="1.8"/>`;
  const ly = top + colH + 22;
  g += rt(cxL, ly, b.leftLabel, { size: 13.5, anchor: 'middle', fill: C.ink2, weight: 700 }) + rt(cxR, ly, b.rightLabel, { size: 13.5, anchor: 'middle', fill: C.ink2, weight: 700 });
  if (b.note) g += tag(W / 2, ly + 34, b.note, 'info', { anchor: 'middle', size: 13.5 }).svg;
  const wrapEl = h('div', { class: 'gc-block' }); wrapEl.innerHTML = svgOpen(W, H) + g + '</svg>'; box.append(wrapEl);
};

// an equilibrium chain pushed by removing one species
BLOCKS.shift = (b, box, W) => {
  const n = b.species.length, gapA = 24, bw = (W - 4 - gapA * (n - 1)) / n, bh = 40, y0 = 52, size = W < 360 ? 12.5 : 13.5;
  const id = uid('gcs');
  let g = `<defs>${marker(id + 'k', C.key)}${marker(id + 'm', C.ink2)}${marker(id + 't', C.trap)}</defs>`;
  const bx = (i) => 2 + i * (bw + gapA);
  b.species.forEach((s, i) => {
    const removed = i === b.removed, key = i === b.keySpecies;
    g += `<rect x="${r1(bx(i))}" y="${y0}" width="${r1(bw)}" height="${bh}" rx="7" fill="${removed ? '#f1f4f2' : key ? C.keyBg : '#fff'}" stroke="${removed ? '#9aa59f' : key ? C.key : C.ink2}" stroke-width="${key ? 2.2 : 1.4}" ${removed ? 'stroke-dasharray="5 3"' : ''}/>`;
    g += rt(bx(i) + bw / 2, y0 + 25, s, { size, weight: 700, anchor: 'middle', fill: removed ? C.mute : key ? C.key : C.ink });
    if (i < n - 1) { const x0 = bx(i) + bw + 3, x1 = bx(i + 1) - 3, yy = y0 + bh / 2; g += `<path d="M${r1(x0)} ${yy - 3} H${r1(x1)} l-5 -4" fill="none" stroke="${C.ink2}" stroke-width="1.5"/><path d="M${r1(x1)} ${yy + 3} H${r1(x0)} l5 4" fill="none" stroke="${C.ink2}" stroke-width="1.5"/>`; }
  });
  // what was removed: an arrow out of the top of its box
  const rx = bx(b.removed) + bw / 2;
  g += `<line x1="${r1(rx)}" y1="${y0 - 3}" x2="${r1(rx)}" y2="24" stroke="${C.trap}" stroke-width="2" marker-end="url(#${id}t)"/>`;
  g += rt(rx + 8, 20, b.removedLabel, { size: 13, weight: 700, fill: C.trap, halo: true });
  // the shift arrow under the chain
  const sy = y0 + bh + 22;
  const from = b.direction === 'left' ? W - 8 : 8, to = b.direction === 'left' ? 8 : W - 8;
  g += `<line x1="${from}" y1="${sy}" x2="${to}" y2="${sy}" stroke="${C.ink2}" stroke-width="2.4" marker-end="url(#${id}m)"/>`;
  g += rt(W / 2, sy + 22, b.shiftLabel, { size: 13.5, weight: 700, anchor: 'middle', fill: C.ink });
  let y = sy + 34;
  (b.effects || []).forEach((ef) => {
    const tg = tag(W / 2, y + 16, ef.text, ef.key ? 'key' : 'plain', { anchor: 'middle', size: 13.5 }); g += tg.svg; y += 30;
  });
  const H = y + 6;
  const el = h('div', { class: 'gc-block' }); el.innerHTML = svgOpen(W, H) + g + '</svg>'; box.append(el);
};

BLOCKS.ice = (b, box) => {
  const el = h('div', { class: 'gc-block gc-ice' });
  if (b.title) el.append(hr('div', { class: 'gc-h' }, b.title));
  if (b.rxn) el.append(hr('div', { class: 'gc-rxn' }, b.rxn));
  const tbl = h('table', { class: 'gc-ice-t' });
  const head = h('tr', {}, h('th', { scope: 'col', text: '' }));
  b.cols.forEach((c) => head.append(hr('th', { scope: 'col' }, c)));
  tbl.append(h('thead', {}, head));
  const tb = h('tbody');
  [['I', 'Start'], ['C', 'Change'], ['E', 'Equilibrium']].forEach(([k, name]) => {
    const tr = h('tr', {}, h('th', { scope: 'row', text: (b.rowNames || {})[k] || name }));
    b.rows[k].forEach((cell, i) => tr.append(hr('td', { class: (b.keyCells || []).some(([r, c]) => r === k && c === i) ? 'is-key' : '' }, cell)));
    tb.append(tr);
  });
  tbl.append(tb); el.append(tbl); box.append(el);
};

BLOCKS.rows = (b, box) => {
  const L = h('div', { class: 'gc-block ledger gc-ledger' });
  if (b.title) L.append(hr('div', { class: 'ledger-h' }, b.title));
  b.rows.forEach((r) => { const row = h('div', { class: 'ledger-r' + (r.key ? ' is-key' : r.sum ? ' is-sum' : '') + (r.trap ? ' is-trap' : '') }); row.append(hr('span', {}, r.label)); if (r.value != null) row.append(hr('b', {}, r.value)); L.append(row); });
  if (b.foot) L.append(hr('div', { class: 'ledger-f' }, b.foot));
  box.append(L);
};

BLOCKS.rules = (b, box) => {
  const el = h('div', { class: 'gc-block gc-rules' });
  if (b.title) el.append(hr('div', { class: 'gc-h' }, b.title));
  b.rows.forEach((r) => {
    const row = h('div', { class: 'gc-rule' + (r.key ? ' is-key' : '') + (r.trap ? ' is-trap' : '') });
    row.append(hr('span', { class: 'gc-rule-when' }, r.when), hr('span', { class: 'gc-rule-then' }, r.then));
    if (r.tag) row.append(hr('em', { class: 'gc-rule-tag' }, r.tag));
    el.append(row);
  });
  box.append(el);
};

BLOCKS.chain = (chain, box, W, s) => {
  const el = h('div', { class: 'gc-block gc-chain' });
  chain.forEach((c, i) => {
    if (i > 0) { const ln = h('div', { class: 'gc-link' }); ln.append(hr('span', { class: 'gc-link-op' }, c.label)); el.append(ln); }
    const node = h('div', { class: 'gc-node' + (c.key ? ' is-key' : '') });
    node.append(hr('b', {}, c.display), hr('span', {}, c.unit || ''));
    if (c.key) node.append(h('em', { class: 'gc-node-tag', text: c.tag || 'asked for' }));
    el.append(node);
    (s.exits || []).filter((x) => x.at === i).forEach((x) => el.append(hr('div', { class: 'gc-exit' }, x.label)));
  });
  box.append(el);
};

BLOCKS.sigfigs = (rows, box) => {
  const el = h('div', { class: 'gc-block gc-sf' });
  rows.forEach((r) => {
    if (r.rule) { el.append(hr('div', { class: 'gc-sf-r is-rule' }, r.rule)); return; }
    const row = h('div', { class: 'gc-sf-r' + (r.key ? ' is-key' : '') });
    const num = h('span', { class: 'gc-sf-num', 'aria-hidden': 'true' });
    const t = String(r.text); let seenNonZero = false;
    const intPart = t.split('.')[0], hasPoint = t.includes('.');
    [...t].forEach((ch, i) => {
      if (ch === '.') { num.append(h('span', { text: '.' })); return; }
      if (ch !== '0') seenNonZero = true;
      const trailingIntZero = !hasPoint && ch === '0' && i < intPart.length && /^0*$/.test(intPart.slice(i));
      num.append(h('span', { class: 'd' + (seenNonZero && !trailingIntZero ? ' s' : ''), text: ch }));
    });
    row.append(num, h('b', { text: r.sf + ' sig fig' + (r.sf > 1 ? 's' : '') }));
    if (r.note) row.append(hr('em', {}, r.note));
    el.append(row);
  });
  box.append(el);
};

// two (or three) beakers: the same solute particles in more water
BLOCKS.beakers = (b, box, W) => {
  const n = b.items.length, bw = Math.min(104, (W - 50 * (n - 1) - 8) / n), maxMl = Math.max(...b.items.map((x) => x.mL)), innerH = 128, top = 26, base = top + innerH + 6;
  const id = uid('gcb');
  let g = `<defs>${marker(id, C.ink2)}<pattern id="${id}h" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="7" stroke="${C.key}" stroke-width="1.6" stroke-opacity=".45"/></pattern></defs>`;
  const span = n * bw + (n - 1) * 50, x0 = (W - span) / 2;
  b.items.forEach((it, i) => {
    const x = x0 + i * (bw + 50), hv = innerH * it.mL / maxMl, yTop = base - hv;
    g += `<rect x="${r1(x + 3)}" y="${r1(yTop)}" width="${r1(bw - 6)}" height="${r1(hv - 3)}" fill="#e6eefb"/>`;
    if (it.added) {
      const ha = innerH * it.added / maxMl;
      g += `<rect x="${r1(x + 3)}" y="${r1(yTop)}" width="${r1(bw - 6)}" height="${r1(ha)}" fill="url(#${id}h)" stroke="${it.key ? C.key : C.ink2}" stroke-width="${it.key ? 2.2 : 1.2}" stroke-dasharray="${it.key ? '' : '4 3'}"/>`;
    }
    // the added-water tag is placed first, and the particles keep clear of its box
    const at = it.added && it.addedLabel ? tag(x + bw / 2, yTop + innerH * it.added / maxMl / 2 + 6, it.addedLabel, it.key ? 'key' : 'plain', { anchor: 'middle', size: 12.5 }) : null;
    const clear = at ? (p) => p.y > at.top - 6 && p.y < at.bottom + 6 && p.x > at.x0 - 6 && p.x < at.x0 + at.w + 6 : null;
    scatter(b.dots, x + 3, yTop, bw - 6, hv - 3, 11 + i * 5, 12, clear).forEach((p) => { g += `<circle cx="${r1(p.x)}" cy="${r1(p.y)}" r="3.6" fill="${C.blue}"/>`; });
    g += `<path d="M${r1(x)} ${top - 6} V${base} H${r1(x + bw)} V${top - 6}" fill="none" stroke="${C.ink}" stroke-width="2"/>`;
    g += rt(x + bw / 2, base + 20, it.label, { size: 13.5, weight: 700, anchor: 'middle' });
    g += rt(x + bw / 2, base + 38, it.sub, { size: 13, anchor: 'middle', fill: C.ink2 });
    if (at) g += at.svg;
    if (i < n - 1) { const ay = top + innerH * 0.45; g += `<line x1="${r1(x + bw + 6)}" y1="${r1(ay)}" x2="${r1(x + bw + 44)}" y2="${r1(ay)}" stroke="${C.ink2}" stroke-width="2" marker-end="url(#${id})"/>`; }
  });
  if (b.dotsLabel) g += rt(W / 2, base + 60, b.dotsLabel, { size: 13, anchor: 'middle', fill: C.blue, weight: 700 });
  const H = base + (b.dotsLabel ? 68 : 46);
  const el = h('div', { class: 'gc-block' }); el.innerHTML = svgOpen(W, H) + g + '</svg>'; box.append(el);
};

// horizontal bars, label above each
BLOCKS.bars = (b, box, W) => {
  const L = 4, valW = 92, bw = W - L - valW - 6, rowH = 46;
  let y = 4, g = '';
  if (b.title) { g += rt(L, 16, b.title, { size: 13, weight: 700, fill: C.ink2 }); y = 24; }
  b.rows.forEach((r) => {
    const len = Math.max(3, bw * r.value / b.max), role = r.key ? 'key' : r.trap ? 'trap' : 'plain', R = ROLE[role];
    g += rt(L, y + 15, r.label, { size: 13.5, weight: r.key ? 700 : 400, fill: r.key ? C.key : C.ink });
    g += `<rect x="${L}" y="${r1(y + 22)}" width="${r1(len)}" height="16" rx="3" fill="${R.fill}" stroke="${R.stroke}" stroke-width="${R.w}"/>`;
    g += rt(L + len + 6, y + 35, r.display, { size: 13.5, weight: 700, fill: R.ink });
    y += rowH;
  });
  if (b.markAt != null) { const x = L + bw * b.markAt / b.max; let yy = b.title ? 24 : 4; b.rows.forEach(() => { g += `<line x1="${r1(x)}" y1="${r1(yy + 19)}" x2="${r1(x)}" y2="${r1(yy + 41)}" stroke="${C.ink2}" stroke-width="1.4" stroke-dasharray="4 3"/>`; yy += rowH; }); g += rt(x, y + 6, b.markLabel, { size: 12.5, anchor: 'middle', fill: C.ink2, weight: 700 }); y += 12; }
  const el = h('div', { class: 'gc-block' }); el.innerHTML = svgOpen(W, y + 4) + g + '</svg>'; box.append(el);
};

// empirical units stacked against the molar mass
BLOCKS.formulas = (f, box, W) => {
  const L = 4, labW = 92, valW = 54, unitMass = f.unitMass, maxN = Math.max(...f.rows.map((r) => r.n));
  const cw = Math.min(40, (W - L - labW - valW) / maxN), rowH = 34;
  let y = 6, g = '';
  if (f.title) { g += rt(L, 16, f.title, { size: 13, weight: 700, fill: C.ink2 }); y = 26; }
  const xs = L + labW, targetX = xs + cw * (f.molarMass / unitMass);
  f.rows.forEach((r) => {
    const role = r.key ? 'key' : 'plain', R = ROLE[role];
    if (r.key) g += `<rect x="${L - 2}" y="${r1(y - 2)}" width="${r1(W - L - 2)}" height="${rowH - 4}" rx="6" fill="${C.keyBg}" stroke="${C.key}" stroke-width="2.2"/>`;
    g += rt(L + 6, y + 20, r.formula, { size: 14, weight: 700, fill: r.key ? C.key : C.ink });
    for (let k = 0; k < r.n; k++) g += `<rect x="${r1(xs + k * cw + 1)}" y="${r1(y + 5)}" width="${r1(cw - 3)}" height="${rowH - 14}" rx="3" fill="${r.key ? '#fff' : '#eef2ef'}" stroke="${r.key ? C.key : '#9aa59f'}" stroke-width="1.2"/>`;
    g += rt(W - 12, y + 20, r.mass + ' g', { size: 13.5, weight: 700, anchor: 'end', fill: R.ink });
    y += rowH;
  });
  g += `<line x1="${r1(targetX)}" y1="${f.title ? 22 : 2}" x2="${r1(targetX)}" y2="${r1(y + 2)}" stroke="${C.key}" stroke-width="1.6" stroke-dasharray="5 3"/>`;
  g += rt(Math.min(targetX, W - 70), y + 18, f.targetLabel, { size: 12.5, anchor: 'middle', weight: 700, fill: C.key, halo: true });
  if (f.unitLabel) g += rt(L, y + 38, f.unitLabel, { size: 12.5, fill: C.ink2 });
  const el = h('div', { class: 'gc-block' }); el.innerHTML = svgOpen(W, y + (f.unitLabel ? 44 : 26)) + g + '</svg>'; box.append(el);
};

// labels on a line without collisions: greedy levels; stacked levels sit LV_H apart
const LV_H = 28;
function levels(items, size, minGap = 8) {
  const placed = [];
  items.slice().sort((a, b) => a.x - b.x).forEach((it) => {
    const w = measure(it.text, size, true) + (it.pad || 14), x0 = it.x - w / 2;
    let lv = 0;
    while (placed.some((p) => p.lv === lv && !(x0 > p.x1 + minGap || x0 + w < p.x0 - minGap))) lv++;
    placed.push({ it, lv, x0, x1: x0 + w, w });
  });
  return placed;
}
// a number line with the choices placed on it
function scaleSvg(b, W) {
  const L = 22, R = 22, pw = W - L - R, size = 12.5;
  const f = (v) => (b.log ? Math.log10(v) : v);
  const X = (v) => L + pw * (f(v) - f(b.min)) / (f(b.max) - f(b.min));
  const marks = (b.marks || []).map((m) => ({ m, x: X(m.v), text: m.label }));
  const lv = levels(marks, size);
  const nLv = Math.max(1, ...lv.map((p) => p.lv + 1)), lvH = LV_H, top = 8 + (b.title ? 18 : 0), axisY = top + nLv * lvH + 19;
  let g = '';
  if (b.title) g += rt(L - 18, 14, b.title, { size: 13, weight: 700, fill: C.ink2 });
  if (b.band) { const x0 = X(b.band.from), x1 = X(b.band.to); g += `<rect x="${r1(Math.min(x0, x1))}" y="${axisY - 6}" width="${r1(Math.abs(x1 - x0))}" height="12" fill="${b.band.key ? C.keyBg : C.trapBg}" stroke="${b.band.key ? C.key : C.trap}" stroke-width="1"/>`; }
  g += `<line x1="${L}" y1="${axisY}" x2="${W - R}" y2="${axisY}" stroke="${C.ink2}" stroke-width="1.6"/>`;
  (b.ticks || []).forEach((tk) => { const x = X(tk.v); g += `<line x1="${r1(x)}" y1="${axisY - 5}" x2="${r1(x)}" y2="${axisY + 5}" stroke="${C.ink2}" stroke-width="1.4"/>` + rt(x, axisY + 21, tk.label, { size: 12.5, anchor: 'middle', fill: C.mute }); });
  lv.forEach((p) => {
    const m = p.it.m, y = axisY - 19 - p.lv * lvH;
    g += `<line x1="${r1(p.it.x)}" y1="${r1(tagBox(y, p.it.text, size).bottom)}" x2="${r1(p.it.x)}" y2="${axisY - 5}" stroke="${m.key ? C.key : '#9aa59f'}" stroke-width="1.2"/>`;
    g += `<circle cx="${r1(p.it.x)}" cy="${axisY}" r="${m.key ? 6 : 4.5}" fill="${m.key ? C.key : m.ref ? C.blue : '#fff'}" stroke="${m.key ? C.key : m.ref ? C.blue : C.ink2}" stroke-width="1.6"/>`;
  });
  lv.forEach((p) => { const m = p.it.m, y = axisY - 19 - p.lv * lvH; g += tag(Math.max(L - 18, Math.min(W - 4 - p.w, p.x0)), y, p.it.text, m.key ? 'key' : m.ref ? 'info' : 'plain', { size }).svg; });
  let H = axisY + ((b.ticks || []).length ? 28 : 12);
  if (b.axisLabel) { g += rt(W / 2, H + 8, b.axisLabel, { size: 12.5, anchor: 'middle', fill: C.ink2 }); H += 16; }
  return { svg: g, H };
}
BLOCKS.scale = (b, box, W) => { const s = scaleSvg(b, W); const el = h('div', { class: 'gc-block' }); el.innerHTML = svgOpen(W, s.H) + s.svg + '</svg>'; box.append(el); };

// two molecule pairs and the force between them
BLOCKS.imf = (b, box, W) => {
  const wide = W >= 560, pw = wide ? (W - 12) / 2 : W, rowH = 104;
  let g = '';
  b.pairs.forEach((p, i) => {
    const ox = wide ? i * (pw + 12) : 0, oy = wide ? 0 : i * rowH, cy = oy + 52;
    const rH = 13, rX = p.big ? 19 : 16, s = Math.min(1, pw / 300), xH1 = ox + 28 * s + 10, xX1 = xH1 + 52 * s, xH2 = xX1 + 74 * s, xX2 = xH2 + 52 * s;
    if (p.key) g += `<rect x="${r1(ox + 1)}" y="${oy + 2}" width="${r1(pw - 2)}" height="${rowH - 8}" rx="8" fill="${C.keyBg}" stroke="${C.key}" stroke-width="2.2"/>`;
    else g += `<rect x="${r1(ox + 1)}" y="${oy + 2}" width="${r1(pw - 2)}" height="${rowH - 8}" rx="8" fill="#f7f9f8" stroke="#c9d3cd" stroke-width="1.1"/>`;
    g += rt(ox + 10, oy + 20, p.title, { size: 13.5, weight: 700, fill: p.key ? C.key : C.ink });
    const atom = (x, el, r) => `<circle cx="${r1(x)}" cy="${cy}" r="${r}" fill="#fff" stroke="${C.ink}" stroke-width="1.5"/>` + rt(x, cy + 5, el, { size: 13.5, weight: 700, anchor: 'middle' });
    g += `<line x1="${r1(xH1 + rH)}" y1="${cy}" x2="${r1(xX1 - rX)}" y2="${cy}" stroke="${C.ink}" stroke-width="2.2"/><line x1="${r1(xH2 + rH)}" y1="${cy}" x2="${r1(xX2 - rX)}" y2="${cy}" stroke="${C.ink}" stroke-width="2.2"/>`;
    g += `<line x1="${r1(xX1 + rX + 3)}" y1="${cy}" x2="${r1(xH2 - rH - 3)}" y2="${cy}" stroke="${p.hbond ? C.key : '#9aa59f'}" stroke-width="${p.hbond ? 2.6 : 1.4}" stroke-dasharray="${p.hbond ? '3 4' : '2 5'}"/>`;
    g += atom(xH1, 'H', rH) + atom(xX1, p.x, rX) + atom(xH2, 'H', rH) + atom(xX2, p.x, rX);
    const mid = (xX1 + xH2) / 2;
    g += rt(Math.min(Math.max(mid, ox + 60), ox + pw - 60), cy + 36, p.force, { size: 13, weight: 700, anchor: 'middle', fill: p.hbond ? C.key : C.ink2 });
    g += rt(ox + pw - 10, oy + 20, p.bp, { size: 13, anchor: 'end', fill: p.key ? C.key : C.ink2, weight: 700 });
  });
  const H = wide ? rowH : rowH * b.pairs.length;
  const el = h('div', { class: 'gc-block' }); el.innerHTML = svgOpen(W, H) + g + '</svg>'; box.append(el);
};

const LEDGER_ORDER_SKIP = new Set(['type', 'alt', 'caption', 'focus', 'reuse', 'dataRef', 'verify', 'exits', 'title', 'note']);
register('chem.ledger', (s, box) => {
  css();
  const W = width(box);
  if (s.title) box.append(hr('div', { class: 'gc-h' }, s.title));
  for (const k of Object.keys(s)) {
    if (LEDGER_ORDER_SKIP.has(k)) continue;
    const fn = BLOCKS[k];
    if (!fn) continue;
    fn(s[k], box, W, s);
  }
  if (s.note) box.append(hr('p', { class: 'gc-note' }, s.note));
});

/* ================================================================ chem.gas */
function cylinder(x, top, cw, maxH, V, maxV, o = {}) {
  const hv = maxH * V / maxV, yPiston = top + maxH - hv, bottom = top + maxH;
  let g = `<rect x="${r1(x)}" y="${r1(top - 8)}" width="${r1(cw)}" height="${r1(maxH + 8)}" fill="#fbfcfb" stroke="${C.ink}" stroke-width="1.8"/>`;
  g += `<rect x="${r1(x + 2)}" y="${r1(yPiston)}" width="${r1(cw - 4)}" height="${r1(hv - 1)}" fill="#e6eefb"/>`;
  if (o.parts) {
    const ph = hv / o.parts;
    for (let k = 0; k < o.parts; k++) {
      const y0 = yPiston + k * ph;
      if (k) g += `<line x1="${r1(x + 2)}" y1="${r1(y0)}" x2="${r1(x + cw - 2)}" y2="${r1(y0)}" stroke="${C.blue}" stroke-width="1.3" stroke-dasharray="4 3"/>`;
      const lw = measure(o.partLabel, 12.5, true) / 2 + 8, mid = y0 + ph / 2;
      scatter(o.dotsPer || 4, x + 2, y0, cw - 4, ph, 5 + k * 3, 10, (p) => Math.abs(p.y - mid) < 13 && Math.abs(p.x - (x + cw / 2)) < lw).forEach((p) => { g += `<circle cx="${r1(p.x)}" cy="${r1(p.y)}" r="3.3" fill="${C.blue}" fill-opacity=".55"/>`; });
      g += rt(x + cw / 2, y0 + ph / 2 + 5, o.partLabel, { size: 12.5, weight: 700, anchor: 'middle', fill: '#123a7a', halo: '#e6eefb' });
    }
  } else scatter(o.dots || 10, x + 2, yPiston, cw - 4, hv, o.seed || 3, 9).forEach((p) => { g += `<circle cx="${r1(p.x)}" cy="${r1(p.y)}" r="3.3" fill="${C.blue}"/>`; });
  g += `<rect x="${r1(x + 1)}" y="${r1(yPiston - 7)}" width="${r1(cw - 2)}" height="7" fill="${C.ink2}"/>`;
  g += `<line x1="${r1(x + cw / 2)}" y1="${r1(top - 22)}" x2="${r1(x + cw / 2)}" y2="${r1(yPiston - 7)}" stroke="${C.ink2}" stroke-width="3"/>`;
  return { g, bottom, yPiston };
}
register('chem.gas', (s, box) => {
  css();
  const W = width(box);
  let g = '', H = 0;
  const id = uid('gcg');
  if (s.states) {
    const st = s.states, maxV = Math.max(...st.map((x) => x.V)), single = st.length === 1;
    const cw = single ? Math.min(150, W * 0.44) : Math.min(84, W * 0.25), maxH = single ? 186 : 150, top = 44;
    g += `<defs>${marker(id, C.ink2)}</defs>`;
    const xs = single ? [10] : [8, W - 8 - cw];
    st.forEach((x, i) => {
      g += rt(xs[i] + cw / 2, 16, x.label, { size: 13.5, weight: 700, anchor: 'middle' });
      const cyl = cylinder(xs[i], top, cw, maxH, x.V, maxV, { parts: x.parts, partLabel: x.partLabel, dotsPer: 4, dots: 12, seed: 3 + i });
      g += cyl.g;
      if (single) {
        let y = top + 4;
        (x.lines || []).forEach((ln) => { g += rt(xs[i] + cw + 14, y + 12, ln, { size: 13.5, fill: C.ink }); y += 24; });
        g += tag(xs[i] + cw + 14, y + 26, x.Vlabel, 'key', { size: 14 }).svg;
        H = Math.max(H, cyl.bottom + 12);
      } else {
        let y = cyl.bottom + 20;
        (x.lines || []).forEach((ln) => { g += rt(xs[i] + cw / 2, y, ln, { size: 13, anchor: 'middle', fill: C.ink2 }); y += 18; });
        g += x.key ? tag(xs[i] + cw / 2, y + 8, x.Vlabel, 'key', { anchor: 'middle', size: 13.5 }).svg : rt(xs[i] + cw / 2, y + 8, x.Vlabel, { size: 13.5, weight: 700, anchor: 'middle' });
        H = Math.max(H, y + 18);
      }
    });
    if (!single && s.factors) {
      const mx0 = xs[0] + cw + 8, mx1 = xs[1] - 8, mid = (mx0 + mx1) / 2;
      let y = top + 8;
      s.factors.forEach((f) => {
        g += rt(mid, y + 12, f.cause, { size: 13, weight: 700, anchor: 'middle', fill: C.ink2 });
        g += `<line x1="${r1(mx0 + 4)}" y1="${r1(y + 22)}" x2="${r1(mx1 - 4)}" y2="${r1(y + 22)}" stroke="${C.ink2}" stroke-width="1.8" marker-end="url(#${id})"/>`;
        g += rt(mid, y + 40, f.effect, { size: 13, weight: 700, anchor: 'middle', fill: C.blue });
        y += 58;
      });
    }
  }
  if (s.mixture) {
    const m = s.mixture, bw = Math.min(170, W * 0.5), bh = 128, top = 8;
    const shapes = ['circle', 'diamond'], fills = [C.blue, '#b8321f'];
    g += `<rect x="4" y="${top}" width="${r1(bw)}" height="${bh}" rx="8" fill="#fbfcfb" stroke="${C.ink}" stroke-width="1.8"/>`;
    const counts = m.gases.map((x) => x.dots), total = counts.reduce((a, b) => a + b, 0);
    const pts = scatter(total, 4, top, bw, bh, 9, 13);
    let k = 0;
    m.gases.forEach((x, gi) => { for (let j = 0; j < x.dots; j++, k++) { const p = pts[k]; if (!p) continue; g += shapes[gi] === 'circle' ? `<circle cx="${r1(p.x)}" cy="${r1(p.y)}" r="4.6" fill="${fills[gi]}"/>` : `<path d="M${r1(p.x)} ${r1(p.y - 5.6)} L${r1(p.x + 5.6)} ${r1(p.y)} L${r1(p.x)} ${r1(p.y + 5.6)} L${r1(p.x - 5.6)} ${r1(p.y)} z" fill="${fills[gi]}"/>`; } });
    // legend beside the box
    let ly = top + 18;
    m.gases.forEach((x, gi) => {
      const lx = bw + 16;
      g += shapes[gi] === 'circle' ? `<circle cx="${lx + 5}" cy="${ly - 5}" r="5" fill="${fills[gi]}"/>` : `<path d="M${lx + 5} ${ly - 11} L${lx + 11} ${ly - 5} L${lx + 5} ${ly + 1} L${lx - 1} ${ly - 5} z" fill="${fills[gi]}"/>`;
      g += rt(lx + 16, ly, x.name, { size: 14, weight: 700 });
      g += rt(lx + 16, ly + 18, x.legend, { size: 13, fill: C.ink2 });
      ly += 46;
    });
    if (m.box) (m.box || []).forEach((ln, i) => { g += rt(bw + 16, ly + 4 + i * 18, ln, { size: 12.5, fill: C.mute }); });
    // pressure bar
    const by = top + bh + 34, L = 4, pw = W - 8, sum = m.gases.reduce((a, x) => a + x.P, 0);
    g += rt(L, by - 10, m.barLabel, { size: 13, weight: 700, fill: C.ink2 });
    let x0 = L;
    m.gases.forEach((x, gi) => {
      const w = pw * x.P / sum, key = x.key;
      g += `<rect x="${r1(x0)}" y="${by}" width="${r1(w)}" height="30" fill="${key ? C.keyBg : '#eef2ef'}" stroke="${key ? C.key : C.ink2}" stroke-width="${key ? 2.4 : 1.2}"/>`;
      g += rt(x0 + w / 2, by + 20, x.barText, { size: 13, weight: 700, anchor: 'middle', fill: key ? C.key : C.ink });
      x0 += w;
    });
    g += rt(W - 4, by + 50, m.totalLabel, { size: 13, anchor: 'end', fill: C.ink2, weight: 700 });
    if (m.keyLabel) g += tag(L, by + 78, m.keyLabel, 'key', { size: 13.5 }).svg;
    H = by + (m.keyLabel ? 88 : 60);
  }
  box.innerHTML = svgOpen(W, H) + g + '</svg>';
  if (s.rows) BLOCKS.rows(s.rows, box, W);
});

/* =============================================================== chem.cell */
register('chem.cell', (s, box) => {
  css();
  const W = width(box), id = uid('gcc');
  let g = `<defs>${marker(id, C.blue)}</defs>`, H;
  if (s.view === 'concentration') {
    const bw = Math.min(110, W * 0.32), bh = 96, top = 92, xs = [6, W - 6 - bw];
    const sides = [{ M: s.anodeM, role: 'anode' }, { M: s.cathodeM, role: 'cathode' }];
    // wire and meter
    const ex = (i) => xs[i] + bw / 2 + (i ? -bw * 0.18 : bw * 0.18), wy = 30;
    g += `<path d="M${r1(ex(0))} ${top + 10} V${wy} H${r1(ex(1))} V${top + 10}" fill="none" stroke="${C.ink}" stroke-width="1.8"/>`;
    const mw = 92, mx = W / 2 - mw / 2;
    g += `<rect x="${r1(mx)}" y="${wy - 15}" width="${mw}" height="30" rx="7" fill="${C.keyBg}" stroke="${C.key}" stroke-width="2.4"/>` + rt(W / 2, wy + 5, s.meter, { size: 14, weight: 700, anchor: 'middle', fill: C.key });
    // electrons: up out of the anode, along the wire, down into the cathode
    const ya = top + 4, yb = wy + 12;
    g += `<line x1="${r1(ex(0) - 10)}" y1="${ya}" x2="${r1(ex(0) - 10)}" y2="${yb}" stroke="${C.blue}" stroke-width="2" marker-end="url(#${id})"/>` + rt(ex(0) - 16, (ya + yb) / 2 + 5, 'e^-', { size: 13.5, weight: 700, anchor: 'end', fill: C.blue });
    g += `<line x1="${r1(ex(1) + 10)}" y1="${yb}" x2="${r1(ex(1) + 10)}" y2="${ya}" stroke="${C.blue}" stroke-width="2" marker-end="url(#${id})"/>` + rt(ex(1) + 16, (ya + yb) / 2 + 5, 'e^-', { size: 13.5, weight: 700, anchor: 'start', fill: C.blue });
    // salt bridge
    const sbx0 = xs[0] + bw * 0.78, sbx1 = xs[1] + bw * 0.22;
    g += `<path d="M${r1(sbx0)} ${top + 40} V${top - 6} H${r1(sbx1)} V${top + 40}" fill="none" stroke="#c9d3cd" stroke-width="10" stroke-linejoin="round"/>` + rt(W / 2, top - 14, s.bridge || 'salt bridge', { size: 12.5, anchor: 'middle', fill: C.mute, halo: true });
    sides.forEach((sd, i) => {
      const x = xs[i];
      const shade = sd.M >= 1 ? '#9fbbe8' : '#e3ecfa';
      g += `<rect x="${r1(x + 2)}" y="${top + 22}" width="${r1(bw - 4)}" height="${bh - 24}" fill="${shade}"/>`;
      g += `<path d="M${r1(x)} ${top} V${top + bh} H${r1(x + bw)} V${top}" fill="none" stroke="${C.ink}" stroke-width="2"/>`;
      g += `<rect x="${r1(ex(i) - 6)}" y="${top + 10}" width="12" height="${bh - 22}" fill="#b0714a" stroke="#6b3000" stroke-width="1.2"/>`;
      const lines = i ? s.cathodeLines : s.anodeLines;
      lines.forEach((ln, k) => { g += rt(x + bw / 2, top + bh + 20 + k * 21, ln, { size: k === 0 ? 13.5 : 12.5, weight: k < 2 ? 700 : 400, anchor: 'middle', fill: k === 1 ? (i ? C.key : C.ink2) : C.ink }); });
    });
    H = top + bh + 20 + Math.max(s.anodeLines.length, s.cathodeLines.length) * 21 + 4;
  } else if (s.view === 'e-to-k') {
    // two aligned rulers: E-standard (V) on top, K below (log K = n E / 0.0592)
    const L = 30, R = 30, pw = W - L - R, n = s.n, eMax = s.eMax;
    const X = (E) => L + pw * (E + eMax) / (2 * eMax);
    const kItems = s.marks.map((m) => ({ m, x: X(m.logK * 0.0592 / n), text: m.label }));
    const lv = levels(kItems, 12.5);
    const nLv = Math.max(1, ...lv.map((p) => p.lv + 1));
    const yE = 40, yK = yE + 64;
    g += rt(L - 22, 16, s.topLabel, { size: 13, weight: 700, fill: C.ink2 });
    g += `<line x1="${L}" y1="${yE}" x2="${W - R}" y2="${yE}" stroke="${C.ink2}" stroke-width="1.6"/>`;
    (s.eTicks || []).forEach((E) => { const x = X(E); g += `<line x1="${r1(x)}" y1="${yE - 5}" x2="${r1(x)}" y2="${yE + 5}" stroke="${C.ink2}" stroke-width="1.4"/>` + rt(x, yE - 10, (E > 0 ? '+' : '') + E.toFixed(2), { size: 12.5, anchor: 'middle', fill: C.mute }); });
    g += `<line x1="${L}" y1="${yK}" x2="${W - R}" y2="${yK}" stroke="${C.ink2}" stroke-width="1.6"/>`;
    (s.kTicks || []).forEach((lk) => { const x = X(lk * 0.0592 / n); g += `<line x1="${r1(x)}" y1="${yK - 5}" x2="${r1(x)}" y2="${yK + 5}" stroke="${C.ink2}" stroke-width="1.4"/>` + rt(x, yK - 10, lk === 0 ? 'K = 1' : '10^' + lk, { size: 12.5, anchor: 'middle', fill: C.mute, halo: true }); });
    // the given E, carried straight down
    const xg = X(s.E);
    g += `<circle cx="${r1(xg)}" cy="${yE}" r="6" fill="${C.blue}"/>` + `<line x1="${r1(xg)}" y1="${yE + 6}" x2="${r1(xg)}" y2="${yK - 6}" stroke="${C.blue}" stroke-width="1.6" stroke-dasharray="4 3"/>`;
    g += rt(xg, yE + 24, s.givenLabel, { size: 12.5, weight: 700, anchor: s.E > 0 ? 'end' : 'start', fill: C.blue, halo: true });
    lv.forEach((p) => {
      const m = p.it.m, y = yK + 30 + p.lv * LV_H;
      g += `<line x1="${r1(p.it.x)}" y1="${yK + 5}" x2="${r1(p.it.x)}" y2="${r1(tagBox(y, p.it.text, 12.5).top)}" stroke="${m.key ? C.key : '#9aa59f'}" stroke-width="1.2"/>`;
      g += `<circle cx="${r1(p.it.x)}" cy="${yK}" r="${m.key ? 6 : 4.5}" fill="${m.key ? C.key : '#fff'}" stroke="${m.key ? C.key : C.ink2}" stroke-width="1.6"/>`;
    });
    lv.forEach((p) => { const m = p.it.m, y = yK + 30 + p.lv * LV_H; g += tag(Math.max(2, Math.min(W - 2 - p.w, p.x0)), y, p.it.text, m.key ? 'key' : 'plain', { size: 12.5 }).svg; });
    H = yK + 30 + nLv * LV_H;
    if (s.bottomLabel) { g += rt(W / 2, H + 6, s.bottomLabel, { size: 13, anchor: 'middle', fill: C.ink2, weight: 700 }); H += 16; }
  }
  box.innerHTML = svgOpen(W, H) + g + '</svg>';
  if (s.rows) BLOCKS.rows(s.rows, box, W);
});

/* ============================================================ chem.orbital */
register('chem.orbital', (s, box) => {
  css();
  const W = width(box), bx = Math.min(28, (W - 8 - 6 * 12) / 9), gap = 3, gg = 12, top = s.title ? 30 : 8;
  const groups = s.config;
  const totalW = groups.reduce((a, gp) => a + gp.boxes * bx + (gp.boxes - 1) * gap, 0) + (groups.length - 1) * gg;
  let x = (W - totalW) / 2, g = '';
  if (s.title) g += rt(W / 2, 18, s.title, { size: 13.5, weight: 700, anchor: 'middle' });
  const arrow = (cx, y0, up) => { const yA = up ? y0 + bx - 5 : y0 + 5, yB = up ? y0 + 5 : y0 + bx - 5, hd = up ? 5 : -5; return `<path d="M${r1(cx)} ${r1(yA)} V${r1(yB)} M${r1(cx - 3.5)} ${r1(yB + hd)} L${r1(cx)} ${r1(yB)} L${r1(cx + 3.5)} ${r1(yB + hd)}" fill="none" stroke="${C.ink}" stroke-width="1.6"/>`; };
  groups.forEach((gp) => {
    let left = gp.e;
    const per = Array.from({ length: gp.boxes }, () => 0);
    for (let k = 0; k < gp.boxes && left > 0; k++) { per[k] = 1; left--; }
    for (let k = 0; k < gp.boxes && left > 0; k++) { per[k] = 2; left--; }
    per.forEach((ne, k) => {
      const bxX = x + k * (bx + gap);
      g += `<rect x="${r1(bxX)}" y="${top}" width="${r1(bx)}" height="${r1(bx)}" fill="#fff" stroke="${C.ink2}" stroke-width="1.3"/>`;
      if (ne >= 1) g += arrow(bxX + bx * 0.33, top, true);
      if (ne >= 2) g += arrow(bxX + bx * 0.67, top, false);
    });
    const gw = gp.boxes * bx + (gp.boxes - 1) * gap;
    g += rt(x + gw / 2, top + bx + 18, gp.sub, { size: 12.5, anchor: 'middle', fill: C.mute, weight: 700 });
    x += gw + gg;
  });
  const H = top + bx + 26;
  const el = h('div', { class: 'gc-block' }); el.innerHTML = svgOpen(W, H) + g + '</svg>'; box.append(el);
  if (s.ions) {
    const tbl = h('table', { class: 'gc-block gc-ions' });
    tbl.append(h('thead', {}, h('tr', {}, ...s.columns.map((c) => h('th', { scope: 'col', text: c })))));
    const tb = h('tbody');
    s.ions.forEach((ion) => {
      const tr = h('tr', { class: ion.key ? 'is-key' : '' });
      tr.append(hr('td', {}, ion.name), h('td', { text: String(ion.Z) }), h('td', { text: (ion.charge > 0 ? '+' : '') + ion.charge }), h('td', { text: String(ion.Z - ion.charge) }), hr('td', {}, ion.note || ''));
      tb.append(tr);
    });
    tbl.append(tb); box.append(tbl);
  }
});

/* ============================================================ chem.curve kinds */
function frame(W, H, o) {
  const { L, R, T, B } = o, pw = W - L - R, ph = H - T - B;
  const fx = (v) => (o.x.log ? Math.log10(v) : v), fy = (v) => (o.y.log ? Math.log10(v) : v);
  const X = (v) => L + pw * (fx(v) - fx(o.x.min)) / (fx(o.x.max) - fx(o.x.min));
  const Y = (v) => T + ph - ph * (fy(v) - fy(o.y.min)) / (fy(o.y.max) - fy(o.y.min));
  let g = '';
  (o.y.ticks || []).forEach((tk) => { const v = tk.v != null ? tk.v : tk, lab = tk.label != null ? tk.label : String(tk); g += `<line x1="${L}" x2="${W - R}" y1="${r1(Y(v))}" y2="${r1(Y(v))}" stroke="#e6ebe8"/>` + rt(L - 6, Y(v) + 4, lab, { size: 12.5, anchor: 'end', fill: C.mute }); });
  (o.x.ticks || []).forEach((tk) => { const v = tk.v != null ? tk.v : tk, lab = tk.label != null ? tk.label : String(tk); g += `<line x1="${r1(X(v))}" x2="${r1(X(v))}" y1="${T + ph}" y2="${T + ph + 5}" stroke="${C.ink2}"/>` + rt(X(v), T + ph + 19, lab, { size: 12.5, anchor: 'middle', fill: C.mute }); });
  g += `<line x1="${L}" x2="${W - R}" y1="${T + ph}" y2="${T + ph}" stroke="${C.ink2}" stroke-width="1.4"/><line x1="${L}" x2="${L}" y1="${T}" y2="${T + ph}" stroke="${C.ink2}" stroke-width="1.4"/>`;
  if (o.x.label) g += rt(L + pw / 2, H - 4, o.x.label, { size: 12.5, anchor: 'middle', fill: C.ink2 });
  if (o.y.label) g += rt(13, T + ph / 2, o.y.label, { size: 12.5, anchor: 'middle', fill: C.ink2 }).replace('<text ', `<text transform="rotate(-90 13 ${r1(T + ph / 2)})" `);
  return { g, X, Y, pw, ph };
}
const poly = (pts) => pts.map((p) => r1(p[0]) + ',' + r1(p[1])).join(' ');

// dG against T: the line crosses zero at dH / dS
CURVE_KINDS.gibbs = (s, box) => {
  const W = width(box), H = 290;
  const Tmax = s.Tmax, dG = (T) => s.dH - T * s.dS / 1000, Tc = s.dH * 1000 / s.dS;
  const ys = [dG(0), dG(Tmax)], ymin = Math.min(...ys, 0) - 20, ymax = Math.max(...ys, 0) + 30;
  const F = frame(W, H, { L: 46, R: 14, T: 12, B: 72, x: { min: 0, max: Tmax, ticks: s.xTicks, label: '' }, y: { min: ymin, max: ymax, ticks: s.yTicks, label: 'dG (kJ)' } });
  let g = F.g;
  const y0 = F.Y(0);
  g += `<polygon points="${poly([[F.X(0), y0], [F.X(0), F.Y(dG(0))], [F.X(Tc), y0]])}" fill="${C.keyBg}"/>`;
  g += `<polygon points="${poly([[F.X(Tc), y0], [F.X(Tmax), F.Y(dG(Tmax))], [F.X(Tmax), y0]])}" fill="${C.trapBg}"/>`;
  g += `<line x1="${F.X(0)}" x2="${F.X(Tmax)}" y1="${r1(y0)}" y2="${r1(y0)}" stroke="${C.ink2}" stroke-width="1.6"/>`;
  g += `<line x1="${r1(F.X(0))}" y1="${r1(F.Y(dG(0)))}" x2="${r1(F.X(Tmax))}" y2="${r1(F.Y(dG(Tmax)))}" stroke="${C.blue}" stroke-width="2.6"/>`;
  g += rt(F.X(Tc * 0.32), y0 + (F.Y(dG(0)) - y0) * 0.35 + 4, s.belowLabel, { size: 12.5, weight: 700, anchor: 'middle', fill: C.key, halo: C.keyBg });
  g += rt(F.X(Tmax) - 6, y0 - 7, s.aboveLabel, { size: 12.5, weight: 700, anchor: 'end', fill: C.trap, halo: C.trapBg });
  g += `<circle cx="${r1(F.X(Tc))}" cy="${r1(y0)}" r="6.5" fill="${C.key}" stroke="#fff" stroke-width="1.5"/>`;
  g += rt(F.X(Tc) - 9, y0 - 12, s.crossLabel, { size: 13, weight: 700, anchor: 'end', fill: C.key, halo: true });
  // the answer as a range on the T axis
  const by = F.Y(ymin) + 34;
  g += rt(F.X(0) - 8, F.Y(ymin) + 19, 'T (K)', { size: 12.5, anchor: 'end', fill: C.ink2 });
  g += `<rect x="${r1(F.X(0))}" y="${r1(by)}" width="${r1(F.X(Tc) - F.X(0))}" height="24" rx="5" fill="${C.keyBg}" stroke="${C.key}" stroke-width="2.2"/>` + rt((F.X(0) + F.X(Tc)) / 2, by + 17, s.rangeLabel, { size: 13, weight: 700, anchor: 'middle', fill: C.key });
  g += `<rect x="${r1(F.X(Tc))}" y="${r1(by)}" width="${r1(F.X(Tmax) - F.X(Tc))}" height="24" rx="5" fill="${C.trapBg}" stroke="${C.trap}" stroke-width="1.2" stroke-dasharray="4 3"/>` + rt((F.X(Tc) + F.X(Tmax)) / 2, by + 17, s.otherRangeLabel, { size: 12.5, anchor: 'middle', fill: '#6b3000', weight: 700 });
  box.innerHTML = svgOpen(W, H) + g + '</svg>';
};

// first-order decay: halves every half-life
CURVE_KINDS.decay = (s, box) => {
  const W = width(box), H = 262, tMax = s.tMax, th = Math.LN2 / s.k;
  const F = frame(W, H, { L: 40, R: 12, T: 14, B: 40, x: { min: 0, max: tMax, ticks: s.xTicks, label: s.xLabel }, y: { min: 0, max: 1.05, ticks: [{ v: 1, label: '1' }, { v: 0.5, label: '1/2' }, { v: 0.25, label: '1/4' }, { v: 0.125, label: '1/8' }, { v: 0, label: '0' }], label: s.yLabel } });
  let g = F.g;
  const pts = []; for (let i = 0; i <= 120; i++) { const t = tMax * i / 120; pts.push([F.X(t), F.Y(G.firstOrder(1, s.k, t))]); }
  for (let n = 1; n * th <= tMax + 1e-9; n++) {
    const t = n * th, y = F.Y(Math.pow(0.5, n));
    g += `<path d="M${r1(F.X(0))} ${r1(y)} H${r1(F.X(t))} V${r1(F.Y(0))}" fill="none" stroke="${n === 1 ? C.key : '#9aa59f'}" stroke-width="${n === 1 ? 1.8 : 1.1}" stroke-dasharray="4 3"/>`;
  }
  g += `<polyline points="${poly(pts)}" fill="none" stroke="${C.blue}" stroke-width="2.6"/>`;
  for (let n = 1; n * th <= tMax + 1e-9; n++) g += `<circle cx="${r1(F.X(n * th))}" cy="${r1(F.Y(Math.pow(0.5, n)))}" r="${n === 1 ? 6 : 4}" fill="${n === 1 ? C.key : '#fff'}" stroke="${n === 1 ? C.key : C.ink2}" stroke-width="1.6"/>`;
  // the ghost's dotted leader runs up to its tag at the top. When the key tag sits above the ghost
  // point, the leader first runs right along the ghost's height (the curve falls away below it), then
  // up past the key tag's right end, so it never passes behind the key tag. It is still drawn before
  // the key tag, whose filled backing would cover it.
  const kt = tag(F.X(th) + 10, F.Y(0.5) - 8, s.keyLabel, 'key', { size: 13 });
  let ghostTag = '';
  if (s.ghost) {
    const xg = F.X(s.ghost.t), yg = F.Y(G.firstOrder(1, s.k, s.ghost.t));
    g += `<circle cx="${r1(xg)}" cy="${r1(yg)}" r="4.5" fill="${C.trapBg}" stroke="${C.trap}" stroke-width="1.6"/>`;
    const tg = tag(W - 12, 34, s.ghost.label, 'trap', { anchor: 'end', size: 12.5 });
    const lead = `stroke="${C.trap}" stroke-width="1" stroke-dasharray="3 3"`;
    const under = xg > kt.x0 - 6 && xg < kt.x0 + kt.w + 6, xe = kt.x0 + kt.w + 12;
    if (under && xe < tg.x0 + tg.w - 12 && xe < W - 14) g += `<line x1="${r1(xg + 5)}" y1="${r1(yg)}" x2="${r1(xe)}" y2="${r1(yg)}" ${lead}/><line x1="${r1(xe)}" y1="${r1(yg)}" x2="${r1(xe)}" y2="${r1(tg.bottom)}" ${lead}/>`;
    else g += `<line x1="${r1(xg)}" y1="${r1(yg - 5)}" x2="${r1(Math.max(tg.x0 + 16, xg))}" y2="${r1(tg.bottom)}" ${lead}/>`;
    ghostTag = tg.svg;
  }
  g += kt.svg + ghostTag;
  if (s.stepLabel) g += rt(F.X(th * 2) + 6, F.Y(0.25) - 8, s.stepLabel, { size: 12.5, fill: C.ink2, halo: true });
  box.innerHTML = svgOpen(W, H) + g + '</svg>';
};

// successive half-lives for orders 0, 1 and 2
CURVE_KINDS['half-lives'] = (s, box) => {
  const W = width(box), rowH = 104, L = 14, R = 12, pw = W - L - R, tMax = s.tMax;
  let g = '', y0 = 4;
  s.orders.forEach((o) => {
    const X = (t) => L + pw * t / tMax, ph = 46, top = y0 + 24, Y = (c) => top + ph - ph * c;
    if (o.key) g += `<rect x="2" y="${y0}" width="${W - 4}" height="${rowH - 6}" rx="8" fill="${C.keyBg}" stroke="${C.key}" stroke-width="2.2"/>`;
    g += rt(L, y0 + 17, o.title, { size: 13.5, weight: 700, fill: o.key ? C.key : C.ink });
    const pts = []; for (let i = 0; i <= 100; i++) { const t = tMax * i / 100; pts.push([X(t), Y(G.concAt(o.order, o.k, 1, t))]); }
    g += `<line x1="${L}" x2="${W - R}" y1="${r1(Y(0))}" y2="${r1(Y(0))}" stroke="${C.ink2}" stroke-width="1.2"/>`;
    g += `<polyline points="${poly(pts)}" fill="none" stroke="${o.key ? C.key : C.blue}" stroke-width="2.2"/>`;
    // the halvings
    let t = 0, c = 1; const segs = [];
    for (let n = 0; n < 4; n++) { const dt = G.halfLife(o.order, o.k, c); if (t + dt > tMax + 1e-9) break; segs.push([t, t + dt, dt]); t += dt; c /= 2; }
    segs.forEach(([a, b2, dt], i) => {
      g += `<circle cx="${r1(X(b2))}" cy="${r1(Y(Math.pow(0.5, i + 1)))}" r="3.6" fill="#fff" stroke="${C.ink2}" stroke-width="1.4"/>`;
      g += `<line x1="${r1(X(b2))}" x2="${r1(X(b2))}" y1="${r1(Y(0) - 4)}" y2="${r1(Y(0) + 4)}" stroke="${C.ink2}" stroke-width="1.4"/>`;
      const wpx = X(b2) - X(a);
      if (wpx > 16) g += rt((X(a) + X(b2)) / 2, Y(0) + 18, String(+dt.toFixed(1)), { size: 12.5, anchor: 'middle', weight: 700, fill: o.key ? C.key : C.ink2 });
    });
    g += rt(W - R, y0 + 17, o.says, { size: 12.5, anchor: 'end', fill: o.key ? C.key : C.ink2, weight: o.key ? 700 : 400 });
    y0 += rowH;
  });
  if (s.foot) wrapRich(s.foot, W - L - 6, 12.5).forEach((ln) => { g += rt(L, y0 + 10, ln, { size: 12.5, fill: C.mute }); y0 += 16; });
  box.innerHTML = svgOpen(W, y0 + 2) + g + '</svg>';
};

// pH and pOH as two aligned rulers (pH + pOH = 14)
CURVE_KINDS['ph-scale'] = (s, box) => {
  const W = width(box), L = 24, R = 24, pw = W - L - R;
  const X = (pH) => L + pw * (pH - s.min) / (s.max - s.min);
  const yTop = 52;
  let g = rt(L - 18, 14, s.topTitle, { size: 13, weight: 700, fill: C.ink2 });
  g += `<line x1="${L}" x2="${W - R}" y1="${yTop}" y2="${yTop}" stroke="${C.ink2}" stroke-width="1.5"/>`;
  (s.topTicks || []).forEach((tk) => { const x = X(14 - tk.pOH); g += `<line x1="${r1(x)}" x2="${r1(x)}" y1="${yTop - 5}" y2="${yTop + 5}" stroke="${C.ink2}" stroke-width="1.3"/>` + rt(x, yTop - 10, tk.label, { size: 12.5, anchor: 'middle', fill: C.mute }) + (tk.sub ? rt(x, yTop + 19, tk.sub, { size: 12.5, anchor: 'middle', fill: C.mute, halo: true }) : ''); });
  // the given concentration, carried down to the pH ruler
  const yB = yTop + 84;
  if (s.given) {
    const x = X(14 - s.given.pOH);
    g += `<circle cx="${r1(x)}" cy="${yTop}" r="6" fill="${C.blue}"/>` + `<line x1="${r1(x)}" y1="${yTop + 6}" x2="${r1(x)}" y2="${yB - 7}" stroke="${C.blue}" stroke-width="1.6" stroke-dasharray="4 3"/>`;
    g += rt(x + (s.given.anchor === 'end' ? -8 : 8), yTop + 42, s.given.label, { size: 12.5, weight: 700, fill: C.blue, anchor: s.given.anchor || 'start', halo: true });
  }
  if (s.beyond != null) { const x0 = X(s.beyond); g += `<rect x="${r1(x0)}" y="${yB - 6}" width="${r1(X(s.max) - x0)}" height="12" fill="${C.trapBg}" stroke="${C.trap}" stroke-width="1" stroke-dasharray="3 2"/>`; }
  g += `<line x1="${L}" x2="${W - R}" y1="${yB}" y2="${yB}" stroke="${C.ink2}" stroke-width="1.6"/>`;
  (s.ticks || []).forEach((v) => { const x = X(v); g += `<line x1="${r1(x)}" x2="${r1(x)}" y1="${yB - 5}" y2="${yB + 5}" stroke="${C.ink2}" stroke-width="1.3"/>` + rt(x, yB - 10, String(v), { size: 12.5, anchor: 'middle', fill: C.mute, halo: true }); });
  g += rt(L - 18, yB - 26, s.bottomTitle, { size: 13, weight: 700, fill: C.ink2, halo: true });
  const items = s.marks.map((m) => ({ m, x: X(m.pH), text: m.label }));
  const lv = levels(items, 12.5);
  let maxY = yB;
  lv.forEach((p) => {
    const m = p.it.m, y = yB + 30 + p.lv * LV_H;
    g += `<line x1="${r1(p.it.x)}" y1="${yB + 5}" x2="${r1(p.it.x)}" y2="${r1(tagBox(y, p.it.text, 12.5).top)}" stroke="${m.key ? C.key : '#9aa59f'}" stroke-width="1.2"/>`;
    g += `<circle cx="${r1(p.it.x)}" cy="${yB}" r="${m.key ? 6 : 4.5}" fill="${m.key ? C.key : '#fff'}" stroke="${m.key ? C.key : C.ink2}" stroke-width="1.6"/>`;
    maxY = Math.max(maxY, tagBox(y, p.it.text, 12.5).bottom + 2);
  });
  lv.forEach((p) => { const m = p.it.m, y = yB + 30 + p.lv * LV_H; g += tag(Math.max(2, Math.min(W - 2 - p.w, p.x0)), y, p.it.text, m.key ? 'key' : 'plain', { size: 12.5 }).svg; });
  box.innerHTML = svgOpen(W, maxY + 6) + g + '</svg>';
};

// Henderson-Hasselbalch across the buffer: pH against the share of A-
CURVE_KINDS.buffer = (s, box) => {
  const W = width(box), H = 268;
  const F = frame(W, H, { L: 40, R: 12, T: 14, B: 44, x: { min: 0, max: 1, ticks: s.xTicks, label: s.xLabel }, y: { min: s.pKa - 1.5, max: s.pKa + 1.5, ticks: s.yTicks, label: 'pH' } });
  let g = F.g;
  const pts = []; for (let i = 3; i <= 97; i++) { const f = i / 100; pts.push([F.X(f), F.Y(s.pKa + Math.log10(f / (1 - f)))]); }
  g += `<polyline points="${poly(pts)}" fill="none" stroke="${C.blue}" stroke-width="2.6"/>`;
  s.marks.forEach((m) => {
    const pH = s.pKa + Math.log10(m.f / (1 - m.f)), x = F.X(m.f), y = F.Y(pH);
    g += `<circle cx="${r1(x)}" cy="${r1(y)}" r="${m.key ? 6.5 : 4.8}" fill="${m.key ? C.key : '#fff'}" stroke="${m.key ? C.key : C.ink2}" stroke-width="1.8"/>`;
    const tg = tag(x + (m.dx || 0), y + (m.dy || 0), m.label, m.key ? 'key' : m.ref ? 'info' : 'plain', { anchor: m.anchor || 'start', size: 12.5 });
    g += tg.svg;
  });
  box.innerHTML = svgOpen(W, H) + g + '</svg>';
};

// the CO2 phase diagram: log P against T, boundaries from compute-gc.js
CURVE_KINDS.phase = (s, box) => {
  const W = width(box), H = 312, Tmin = s.Tmin, Tmax = s.Tmax, Pmin = s.Pmin, Pmax = s.Pmax;
  const F = frame(W, H, { L: 46, R: 12, T: 12, B: 44, x: { min: Tmin, max: Tmax, ticks: s.xTicks, label: 'T (K)' }, y: { min: Pmin, max: Pmax, log: true, ticks: s.yTicks, label: 'P (atm, log scale)' } });
  let g = F.g;
  const tp = G.CO2.triple, cp = G.CO2.critical;
  const curve = (kind, t0, t1) => { const pts = []; for (let i = 0; i <= 60; i++) { const T = t0 + (t1 - t0) * i / 60, P = G.co2Boundary(kind, T); if (P >= Pmin && P <= Pmax) pts.push([F.X(T), F.Y(P)]); } return pts; };
  // shade the region that holds the point
  const sub = curve('sublimation', Tmin, tp.T), vap = curve('vaporization', tp.T, cp.T);
  const gasPoly = [[sub.length ? sub[0][0] : F.X(Tmin), F.Y(Pmin)], ...sub, ...vap, [F.X(cp.T), F.Y(cp.P)], [F.X(Tmax), F.Y(cp.P)], [F.X(Tmax), F.Y(Pmin)]];
  g += `<polygon points="${poly(gasPoly)}" fill="${C.keyBg}" fill-opacity=".7"/>`;
  g += `<line x1="${r1(F.X(cp.T))}" y1="${r1(F.Y(cp.P))}" x2="${r1(F.X(Tmax))}" y2="${r1(F.Y(cp.P))}" stroke="#9aa59f" stroke-width="1.2" stroke-dasharray="3 3"/><line x1="${r1(F.X(cp.T))}" y1="${r1(F.Y(cp.P))}" x2="${r1(F.X(cp.T))}" y2="${r1(F.Y(Pmax))}" stroke="#9aa59f" stroke-width="1.2" stroke-dasharray="3 3"/>`;
  const mt = []; for (let i = 0; i <= 30; i++) { const P = tp.P + (Pmax - tp.P) * i / 30, T = tp.T + (P - tp.P) / 60; mt.push([F.X(T), F.Y(P)]); }
  [sub, vap, mt].forEach((pts) => { g += `<polyline points="${poly(pts)}" fill="none" stroke="${C.ink}" stroke-width="2.2"/>`; });
  // 1 atm line
  g += `<line x1="${F.X(Tmin)}" x2="${F.X(Tmax)}" y1="${r1(F.Y(s.point.P))}" y2="${r1(F.Y(s.point.P))}" stroke="${C.blue}" stroke-width="1.3" stroke-dasharray="5 4"/>`;
  g += `<circle cx="${r1(F.X(tp.T))}" cy="${r1(F.Y(tp.P))}" r="4.5" fill="${C.ink}"/><circle cx="${r1(F.X(cp.T))}" cy="${r1(F.Y(cp.P))}" r="4.5" fill="${C.ink}"/>`;
  (s.labels || []).forEach((lb) => {
    const x = F.X(lb.T), y = F.Y(lb.P);
    if (lb.key) g += tag(x, y, lb.text, 'key', { anchor: lb.anchor || 'middle', size: 13 }).svg;
    else (lb.lines || [lb.text]).forEach((ln, i) => { g += rt(x, y + i * 15, ln, { size: lb.region ? 13.5 : 12.5, weight: lb.region ? 700 : 400, anchor: lb.anchor || 'middle', fill: lb.region ? C.ink : C.ink2, halo: true }); });
  });
  const px = F.X(s.point.T), py = F.Y(s.point.P);
  g += `<circle cx="${r1(px)}" cy="${r1(py)}" r="7" fill="${C.key}" stroke="#fff" stroke-width="1.6"/>`;
  if (s.pointLabel) { const tg = tag(px + (s.pointLabel.dx || 0), py + (s.pointLabel.dy || 0), s.pointLabel.text, 'key', { anchor: s.pointLabel.anchor || 'end', size: 13 }); g += tg.svg; }
  box.innerHTML = svgOpen(W, H) + g + '</svg>';
};

/* ================================================== chem.energy: level ladder */
ENERGY_KINDS.levels = (s, box) => {
  const W = width(box), H = s.height || 300, top = 34, bot = H - 30;
  const ys = s.points.map((p) => p.y), ymax = Math.max(...ys), ymin = Math.min(...ys);
  const Y = (v) => top + (bot - top) * (ymax - v) / (ymax - ymin || 1);
  const n = s.points.length, barW = Math.min(110, (W - 16) / n - 18), slot = (W - 8) / n;
  const id = uid('gce');
  let g = `<defs>${marker(id + 'k', C.key)}${marker(id + 'm', C.ink2)}</defs>`;
  const pos = {};
  s.points.forEach((p, i) => {
    const cx = 4 + slot * (i + 0.5), x0 = cx - barW / 2, y = Y(p.y);
    pos[p.id] = { x0, x1: x0 + barW, cx, y };
    g += `<line x1="${r1(x0)}" x2="${r1(x0 + barW)}" y1="${r1(y)}" y2="${r1(y)}" stroke="${C.ink}" stroke-width="3"/>`;
    const name = s.names[i];
    const lines = wrapRich(name, slot - 6, 13, true);
    lines.forEach((ln, k) => { g += rt(cx, y - 8 - (lines.length - 1 - k) * 15, ln, { size: 13, weight: 700, anchor: 'middle', halo: true }); });
    g += rt(cx, y + 18, p.valueLabel, { size: 12.5, anchor: 'middle', fill: C.ink2, halo: true });
  });
  (s.arrows || []).forEach((a) => {
    const A = pos[a.from], B = pos[a.to], x = 4 + (W - 8) * a.x;
    const col = a.key ? C.key : C.ink2;
    g += `<line x1="${r1(Math.min(A.x1, x))}" x2="${r1(Math.max(A.x0, x))}" y1="${r1(A.y)}" y2="${r1(A.y)}" stroke="#9aa59f" stroke-width="1" stroke-dasharray="3 3"/>`;
    g += `<line x1="${r1(Math.min(B.x1, x))}" x2="${r1(Math.max(B.x0, x))}" y1="${r1(B.y)}" y2="${r1(B.y)}" stroke="#9aa59f" stroke-width="1" stroke-dasharray="3 3"/>`;
    g += `<line x1="${r1(x)}" y1="${r1(A.y + (B.y > A.y ? 3 : -3))}" x2="${r1(x)}" y2="${r1(B.y + (B.y > A.y ? -2 : 2))}" stroke="${col}" stroke-width="${a.key ? 3 : 1.8}" marker-end="url(#${id}${a.key ? 'k' : 'm'})"/>`;
    const my = (A.y + B.y) / 2 + 5;
    if (a.key) g += tag(x + (a.anchor === 'end' ? -8 : 8), my, a.label, 'key', { anchor: a.anchor || 'start', size: 13 }).svg;
    else g += rt(x + (a.anchor === 'end' ? -7 : 7), my, a.label, { size: 12.5, weight: 700, anchor: a.anchor || 'start', fill: C.ink2, halo: true });
  });
  if (s.foot) g += rt(4, H - 6, s.foot, { size: 12.5, fill: C.mute });
  box.innerHTML = svgOpen(W, H) + g + '</svg>';
};

/* ===================================== chem.lewis add-on: the domain ladder */
// Under a Lewis structure: electron domains (bonds plus lone pairs) and the
// hybridization each count takes, the structure's own count outlined.
LEWIS_EXTRAS.push((s, box) => {
  if (!s.domains) return;
  css();
  const d = s.domains, el = h('div', { class: 'gc-block' });
  if (d.title) el.append(hr('div', { class: 'gc-h' }, d.title));
  const row = h('div', { class: 'gc-domains' });
  d.ladder.forEach((x) => { const sp = h('span', { class: x.key ? 'is-key' : '' }); sp.append(h('b', { text: String(x.n) }), rich(x.label)); row.append(sp); });
  el.append(row);
  if (d.note) el.append(hr('p', { class: 'gc-note' }, d.note));
  box.append(el);
});

export { BLOCKS, rich as gcRich };
