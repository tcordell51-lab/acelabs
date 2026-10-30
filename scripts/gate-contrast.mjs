#!/usr/bin/env node
// gate-contrast.mjs : every text pair in the design tokens reads at 4.5:1 or better.
//
//   node gate-contrast.mjs [repoRoot] [--verbose]   exit 1 on any pair under its floor
//
// Reads shared/al-tokens.css, resolves var() chains for three themes (light; dark from
// prefers-color-scheme; dark from html[data-theme="dark"]) and computes the WCAG 2.x
// contrast ratio of each pair below. Translucent washes are composited over the surface
// they sit on. Text pairs need 4.5:1; marks that carry meaning on their own (focus ring,
// a mint rule) need 3:1. Both dark blocks must define the same --s-* values, and the dark
// blocks may redefine only --s-* names (no --al-* name is ever themed).
// Dependency-free, well under 1 s.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const TEXT = 4.5, MARK = 3;

/* ---------- parsing ---------- */
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '');
function blocks(css) {
  // returns [{ selector, body, media }] for every rule, with one level of @media nesting
  const out = []; let i = 0;
  const readBlock = (from) => { let depth = 0; for (let j = from; j < css.length; j++) { if (css[j] === '{') depth++; else if (css[j] === '}') { depth--; if (depth === 0) return j; } } return css.length; };
  while (i < css.length) {
    const open = css.indexOf('{', i); if (open < 0) break;
    const head = css.slice(i, open).trim(); const close = readBlock(open);
    if (head.startsWith('@media')) {
      const inner = css.slice(open + 1, close); let k = 0;
      while (k < inner.length) {
        const o = inner.indexOf('{', k); if (o < 0) break;
        const c = inner.indexOf('}', o);
        out.push({ selector: inner.slice(k, o).trim(), body: inner.slice(o + 1, c), media: head.replace(/^@media\s*/, '') });
        k = c + 1;
      }
    } else out.push({ selector: head, body: css.slice(open + 1, close), media: null });
    i = close + 1;
  }
  return out;
}
function decls(body) {
  const m = new Map(); const re = /(--[\w-]+)\s*:\s*([^;]+?)\s*(?:;|$)/g; let x;
  while ((x = re.exec(body))) m.set(x[1], x[2].trim());
  return m;
}
export function parseTokens(cssText) {
  const css = stripComments(cssText); const bs = blocks(css);
  const isDarkMedia = (b) => b.media && /prefers-color-scheme:\s*dark/.test(b.media);
  const root = new Map(), darkMedia = new Map(), darkAttr = new Map();
  for (const b of bs) {
    if (b.selector === ':root' && !b.media) for (const [k, v] of decls(b.body)) root.set(k, v);
    else if (isDarkMedia(b) && b.selector === ':root:not([data-theme="light"])') for (const [k, v] of decls(b.body)) darkMedia.set(k, v);
    else if (b.selector === ':root[data-theme="dark"]' && !b.media) for (const [k, v] of decls(b.body)) darkAttr.set(k, v);
  }
  return { root, darkMedia, darkAttr, blocks: bs };
}
export function themes(parsed) {
  const { root, darkMedia, darkAttr } = parsed;
  return { light: new Map(root), dark: new Map([...root, ...darkMedia]), 'dark (data-theme)': new Map([...root, ...darkAttr]) };
}
export function resolve(map, value, seen = new Set()) {
  return value.replace(/var\(\s*(--[\w-]+)\s*(?:,\s*([^()]*(?:\([^()]*\))?[^()]*))?\)/g, (all, name, fb) => {
    if (seen.has(name)) throw new Error('var cycle at ' + name);
    if (map.has(name)) return resolve(map, map.get(name), new Set([...seen, name]));
    if (fb != null) return resolve(map, fb.trim(), seen);
    throw new Error('undefined ' + name);
  });
}

/* ---------- color ---------- */
export function parseColor(c) {
  c = c.trim();
  let m = c.match(/^#([0-9a-f]{3,8})$/i);
  if (m) { let h = m[1]; if (h.length <= 4) h = h.split('').map((x) => x + x).join(''); const n = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)); return { rgb: n, a: h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1 }; }
  m = c.match(/^rgba?\(([^)]+)\)$/i);
  if (m) { const p = m[1].split(/[\s,/]+/).filter(Boolean).map(Number); return { rgb: p.slice(0, 3), a: p.length > 3 ? p[3] : 1 }; }
  if (/^white$/i.test(c)) return { rgb: [255, 255, 255], a: 1 };
  if (/^black$/i.test(c)) return { rgb: [0, 0, 0], a: 1 };
  throw new Error('not a color: ' + c);
}
const over = (top, under) => top.rgb.map((v, i) => v * top.a + under[i] * (1 - top.a));
const lum = (rgb) => { const [r, g, b] = rgb.map((v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
export function ratio(fg, bg, under) {
  const B = parseColor(bg); const base = under ? parseColor(under).rgb : [255, 255, 255];
  const bgRgb = B.a < 1 ? over(B, base) : B.rgb;
  const F = parseColor(fg); const fgRgb = F.a < 1 ? over(F, bgRgb) : F.rgb;
  const a = lum(fgRgb), b = lum(bgRgb);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

/* ---------- the pairs (spec 2.3 plus the brand's mint) ---------- */
// [foreground, background, surface under a translucent background or null, floor]
const P = (fg, bg, under = null, min = TEXT) => ({ fg, bg, under, min });
export const PAPER_PAIRS = [
  ...['--s-surface', '--s-page', '--s-surface-2', '--s-sunk'].flatMap((bg) => [P('--s-ink', bg), P('--s-ink-2', bg), P('--s-mint-ink', bg)]),
  P('--s-ink-3', '--s-surface'), P('--s-ink-3', '--s-page'), P('--s-ink-3', '--s-surface-2'),
  P('--s-accent-ink', '--s-surface'), P('--s-accent-ink', '--s-page'), P('--s-accent-ink', '--s-surface-2'),
  P('--s-good-ink', '--s-surface'), P('--s-good-ink', '--s-good-wash', '--s-surface'),
  P('--s-trap-ink', '--s-surface'), P('--s-trap-ink', '--s-trap-wash', '--s-surface'),
  P('--s-mint-ink', '--s-mint-wash'), P('--s-ink', '--s-mint-wash'), P('--s-ink-2', '--s-mint-wash'), P('--s-ink-3', '--s-mint-wash'),
  P('--s-on-mint', '--s-mint'), P('--s-primary-ink', '--s-primary'),
  ...['bio', 'gchem', 'ochem', 'pat', 'rc', 'qr'].flatMap((s) => [P(`--s-sec-${s}`, '--s-surface'), P(`--s-sec-${s}`, '--s-page')]),
  P('--s-focus', '--s-surface', null, MARK), P('--s-focus', '--s-page', null, MARK),
  P('--s-mint-ink', '--s-page', null, MARK), P('--s-good', '--s-surface', null, MARK), P('--s-trap', '--s-surface', null, MARK),
];
export const BENCH_PAIRS = [
  ...['--b-bg', '--b-raised', '--b-raised-2'].flatMap((bg) => [P('--b-ink', bg), P('--b-ink-2', bg), P('--b-ink-3', bg), P('--b-gold-hi', bg), P('--b-mint-ink', bg)]),
  P('--b-gold', '--b-bg'), P('--b-good', '--b-bg'), P('--b-trap', '--b-bg'), P('--b-mint', '--b-bg'),
  P('--b-ink', '--b-mint-wash'), P('--b-mint-ink', '--b-mint-wash'), P('--b-on-mint', '--b-mint'),
  P('#16120A', '--b-gold'), P('--al-ink', '--b-gold-hi'),
  ...['bio', 'gchem', 'ochem', 'pat', 'rc', 'qr'].map((s) => P(`--al-sec-${s}-lite`, '--b-bg')),
];
export const EXAM_PAIRS = [
  P('#ffffff', '--al-exam'), P('#ffffff', '--al-exam-d'), P('--al-exam-ink', '#ffffff'), P('--al-exam-ink', '--al-exam-bg'), P('--al-exam-ink', '--al-exam-tool'),
];

export function check(cssText) {
  const parsed = parseTokens(cssText); const T = themes(parsed);
  const rows = [], problems = [];
  const val = (map, ref) => (ref.startsWith('--') ? resolve(map, `var(${ref})`) : ref);
  const run = (theme, map, pairs) => {
    for (const p of pairs) {
      let r;
      try { r = ratio(val(map, p.fg), val(map, p.bg), p.under ? val(map, p.under) : null); } catch (e) { problems.push(`${theme}: ${p.fg} on ${p.bg}: ${e.message}`); continue; }
      rows.push({ theme, ...p, r });
      if (r + 1e-9 < p.min) problems.push(`${theme}: ${p.fg} on ${p.bg}${p.under ? ' over ' + p.under : ''} is ${r.toFixed(2)}:1, needs ${p.min}:1`);
    }
  };
  for (const [name, map] of Object.entries(T)) run(name, map, PAPER_PAIRS);
  run('bench', T.light, BENCH_PAIRS); run('bench (dark)', T.dark, BENCH_PAIRS);
  run('exam', T.light, EXAM_PAIRS); run('exam (dark)', T.dark, EXAM_PAIRS);
  // the theming rules themselves
  for (const [label, m] of [['prefers-color-scheme dark', parsed.darkMedia], ['data-theme dark', parsed.darkAttr]]) {
    if (!m.size) problems.push(`${label}: block missing`);
    for (const k of m.keys()) if (!k.startsWith('--s-')) problems.push(`${label}: redefines ${k}; only --s-* is themed`);
  }
  const a = [...parsed.darkMedia].sort().join(';'), b = [...parsed.darkAttr].sort().join(';');
  if (a !== b) problems.push('the two dark blocks differ; keep them identical');
  return { rows, problems };
}

/* ---------- cli ---------- */
const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const args = process.argv.slice(2);
  const ROOT = path.resolve(args.find((x) => !x.startsWith('--')) || '.');
  const { rows, problems } = check(fs.readFileSync(path.join(ROOT, 'shared/al-tokens.css'), 'utf8'));
  if (args.includes('--verbose')) for (const r of rows) console.log(`  ${r.r.toFixed(2).padStart(6)}  ${r.theme.padEnd(18)} ${r.fg} on ${r.bg}${r.under ? ' over ' + r.under : ''}${r.min === MARK ? '  (mark, 3:1)' : ''}`);
  const low = rows.reduce((m, r) => (r.min === TEXT && r.r < m.r ? r : m), { r: Infinity });
  console.log(`  ${rows.length} pairs checked in light, dark and on the bench; lowest text pair ${low.r.toFixed(2)}:1 (${low.theme}: ${low.fg} on ${low.bg})`);
  if (problems.length) {
    console.error(`gate-contrast: ${problems.length} problem(s)`);
    for (const p of problems) console.error('  ' + p);
    process.exit(1);
  }
  console.log('gate-contrast: OK (every text pair at 4.5:1 or better in both themes)');
}
