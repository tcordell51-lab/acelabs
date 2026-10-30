// core.js: the visual-spec registry for explainer pictures.
// Ported from the pilot preview (question-system/preview/renderers/core.js).
// These modules move to shared/visuals/ later in one patch; until then they
// live here so nothing in shared/ changes.
//
// render(spec, host, ctx) draws one spec (or a two-panel stack) into a host at
// the width the host actually has, so phone text stays 12 px or larger, wraps
// it in one figure with role="img" and the spec's alt text, and adds the
// caption. A renderer is (spec, box, ctx) => void | Promise.
//
// A sidecar's visual holds the authored spec plus small facts the build
// computed and checked (trend values, titration marks, a mechanism figure,
// PAT unfold steps and paint counts). Anything that belongs to the served
// question (the chart spec, the RC passage, the PAT item) is filled in here by
// resolve() from ctx.item, so the picture always matches the question on
// screen.
import { titrationCurve, titrationMarks, lawOfCosines } from './compute.js';

export const C = {
  ink: '#16211c', ink2: '#3b4a43', mute: '#5c6a63', line: '#cfd8d3', faint: '#eef2ef',
  key: '#00704f', keyBg: '#ddf3ea', keyLine: '#00704f',
  trap: '#9b4500', trapBg: '#fbece0',
  gold: '#8c6a16', goldBg: '#f6ecd2',
  mint: '#2bb38a', mintBg: '#e3f7ef',
  green: '#1B3A2D', blue: '#1f57b5', blueBg: '#e6eefb', paper: '#ffffff'
};
export const FONT = 'Arial, Helvetica, sans-serif';

const REG = {};
export function register(type, fn) { REG[type] = fn; }
export function has(type) { return !!REG[type]; }
export function types() { return Object.keys(REG).sort(); }

// Every structure drawn on the page (question card or explainer) is recorded
// here with its atom positions and wedges, so the render gate can ask RDKit
// what each picture depicts (scripts/explainers/render-check.mjs).
export const DRAWN = [];
if (typeof window !== 'undefined') window.AceExplainDrawn = DRAWN;

export function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
export function h(tag, attrs, ...kids) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') n.className = v; else if (k === 'text') n.textContent = v; else if (k === 'html') n.innerHTML = v;
    else if (k.startsWith('on') && typeof v === 'function') n.addEventListener(k.slice(2), v);
    else n.setAttribute(k, v === true ? '' : v);
  }
  for (const c of kids.flat()) if (c != null) n.append(c.nodeType ? c : document.createTextNode(String(c)));
  return n;
}
// Text helpers for string-built SVG. Sizes are in viewBox units, and every
// renderer draws with a viewBox about as wide as the box, so units are pixels.
export function t(x, y, s, o = {}) {
  const a = [`x="${r1(x)}"`, `y="${r1(y)}"`, `font-size="${o.size || 13}"`, `fill="${o.fill || C.ink}"`, `font-family="${FONT}"`];
  if (o.anchor) a.push(`text-anchor="${o.anchor}"`);
  if (o.weight) a.push(`font-weight="${o.weight}"`);
  if (o.italic) a.push('font-style="italic"');
  return `<text ${a.join(' ')}>${esc(s)}</text>`;
}
export const r1 = (v) => Math.round(v * 10) / 10;
export function width(box) { return Math.max(300, Math.min(720, Math.floor(box.clientWidth || 600))); }
export function svgOpen(W, H, extra = '') { return `<svg viewBox="0 0 ${r1(W)} ${r1(H)}" width="100%" style="max-width:${Math.ceil(W)}px;display:block;margin:0 auto" aria-hidden="true" focusable="false" ${extra}>`; }
// wrap text to a width (rough Arial metrics)
export function wrap(s, maxW, size = 13) {
  const cw = size * 0.53, words = String(s).split(/\s+/), lines = []; let cur = '';
  for (const w of words) { const nx = cur ? cur + ' ' + w : w; if (nx.length * cw > maxW && cur) { lines.push(cur); cur = w; } else cur = nx; }
  if (cur) lines.push(cur); return lines;
}
export function textW(s, size = 13) { return String(s).length * size * 0.53; }
export function arrowDefs(id, color) {
  return `<defs><marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${color}"/></marker></defs>`;
}
let _uid = 0; export const uid = (p = 'v') => p + (++_uid);

// A badge drawn in SVG: outlined box with a label, used to mark the key place
// in a picture (outline plus words, never color alone).
export function badge(x, y, label, o = {}) {
  const size = o.size || 12, w = textW(label, size) + 14, hgt = size + 9;
  const fill = o.fill || C.keyBg, stroke = o.stroke || C.key, ink = o.ink || C.key;
  const x0 = o.anchor === 'end' ? x - w : o.anchor === 'middle' ? x - w / 2 : x;
  return `<rect x="${r1(x0)}" y="${r1(y - hgt + 4)}" width="${r1(w)}" height="${r1(hgt)}" rx="4" fill="${fill}" stroke="${stroke}" stroke-width="1.4"/>` + t(x0 + w / 2, y, label, { size, fill: ink, anchor: 'middle', weight: 700 });
}

// Fill a panel's question-bound fields from the served item. Throws when the
// item lacks what the panel needs, so a mismatch shows as a picture error
// (and fails the render gate) instead of a silent wrong picture.
export function resolvePanel(p, item) {
  const q = JSON.parse(JSON.stringify(p));
  const it = item || {};
  if (q.type === 'qr.figure') {
    if (!it.figure) throw new Error('qr.figure needs the question figure');
    q.spec = it.figure;
  }
  if (q.type === 'rc.evidence') {
    const P = it.passage;
    if (!P || !P.paragraphs) throw new Error('rc.evidence needs the passage');
    q.text = {};
    q.spans.forEach((s) => {
      const sent = P.paragraphs[s.p - 1] && P.paragraphs[s.p - 1][s.s - 1];
      if (!sent || !sent.includes(s.quote)) throw new Error('quote not in paragraph ' + s.p + ', sentence ' + s.s);
      q.text[s.p + '.' + s.s] = sent;
    });
  }
  if (q.type.startsWith('pat.')) {
    if (!it.patItem) throw new Error(q.type + ' needs the PAT item');
    q.itemData = it.patItem;
  }
  if (q.type === 'chem.curve' && q.kind === 'titration') {
    q.marks = titrationMarks(q);
    q.curve = titrationCurve(q);
  }
  if (q.type === 'qr.triangle' && q.c == null) q.c = lawOfCosines(q.a, q.b, q.angleDeg);
  return q;
}

export async function render(spec, host, ctx = {}) {
  const fig = h('figure', { class: 'vis', role: 'img', 'aria-label': spec.alt || '' });
  host.append(fig);
  const body = h('div', { class: 'vis-body' });
  fig.append(body);
  try {
    const panels = spec.type === 'stack' ? spec.panels : [spec];
    for (const p of panels) {
      const box = h('div', { class: 'vis-panel vis-' + p.type.replace(/\./g, '-') });
      body.append(box);
      await draw(resolvePanel(p, ctx.item), box, ctx);
    }
  } catch (e) {
    console.error('visual', spec.type, e);
    body.append(h('p', { class: 'vis-err', text: 'This picture did not draw (' + spec.type + '). ' + e.message }));
  }
  if (spec.caption) fig.append(h('figcaption', { text: spec.caption }));
  return fig;
}
async function draw(spec, box, ctx) {
  const fn = REG[spec.type];
  if (!fn) throw new Error('no renderer for ' + spec.type);
  await fn(spec, box, ctx);
}
