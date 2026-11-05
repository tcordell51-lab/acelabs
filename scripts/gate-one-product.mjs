#!/usr/bin/env node
// gate-one-product.mjs : Thomas's "one product" rule 7 (docs/ace-system-decisions.md, One product).
//
// Every served student page shows one logo, one frame, one type and color system. The gate
// serves this checkout itself (scripts/lib/site.mjs: _redirects, the netlify.toml redirects and
// the site CSP), lists every served student page, and checks each one.
//
//   node scripts/gate-one-product.mjs                 browser run (static checks too), ratchet against
//                                                     scripts/one-product-baseline.json
//   node scripts/gate-one-product.mjs --static        the static subset only (no browser, about a second):
//                                                     what test:gates runs
//   node scripts/gate-one-product.mjs --strict        fail on any failing check (the release sweep)
//   node scripts/gate-one-product.mjs --baseline      write scripts/one-product-baseline.json from this run
//                                                     (with --static, only its static half is rewritten)
//   options: PAGE...              only these pages (paths, as the audit takes them); the ratchet still applies
//            --file FILE          another baseline file        --report FILE   the full JSON report
//            --jobs N             pages at a time (default 4)  --base URL      a running server instead
//            --sizes 390,1280     --themes light,dark          --quiet         no table: the summary and any new failure
//            --list               print the student pages and exit
//
// Which pages: every served .html (scripts/lib/served.mjs: no docs, specs, research, scripts,
// tests/<dir>/, test-screenshots, verification, vendor, nothing a forced redirect sends away),
// minus every path spec 1.5 hides or redirects (internal, legacy, broken, rough-hidden; parsed
// from docs/release-2026-10-30/one-loop/spec.md, plus the two it names in prose: the QR geometry
// canvases and the GChem embed canvases) and every inventory row marked internal
// (docs/release-2026-10-30/inventory.md). A page served through a 200 rewrite is listed at its
// public path (ace-labs.html is "/").
//
// Browser checks, each page at 390 x 844 and 1280 x 800, light and dark (a fresh load per run):
//   shell        shell v2 (#ace-shell) is mounted and showing; a timed exam screen that hides it
//                (html[data-ace-shell="off"], or acelabs.timed) passes and must show the mark itself
//   logo         the new ACE DAT logo shows: an image from /shared/brand/ visible in the shell (the
//                lockup on desktop, the mark on phones), or, with the shell hidden, the mark from
//                /shared/brand/ in the page's own top bar
//   other-logo   no other logo: no visible element outside the shell named logo, brand, wordmark,
//                lockup or masthead that does not draw a /shared/brand/ file, and no image, icon
//                link or CSS background from a logo-like file outside /shared/brand/ (the site
//                icons /favicon.ico and /apple-touch-icon.png are the AD mark and pass)
//   wordmark     no old wordmark: "AceTheDAT" (any spacing or case, ".com" or not) set as a heading
//                or a brand line (a short text inside a heading, header, nav, banner or brand box)
//   old-logo-ref no request for shared/ace-dat-lockup-reversed.svg or shared/ace-dat-mark-reversed.svg
//   fonts        every visible text renders in Sora, DM Sans or JetBrains Mono (the first family of
//                its computed font-family); excepted by list: drawn figures (svg, canvas, math) and
//                the DAT test-day screen (FONT_ALLOW below)
//   colors       the page background, every card (a box with its own fill and a radius or shadow),
//                h1 to h3 and every button (fill and text) sit inside the tokens v2 palette: every
//                color shared/al-tokens.css defines in either theme, plus the literal washes of the
//                kit (shared/al-kit.css), with each translucent one composited over every surface
//                color of the palette. Colors are composited over what is under them first.
//                Tolerance: CIE76 delta E of 6 or less (about two just-noticeable steps).
//   targets      every control in <main> (the whole body without a <main>) is at least 44 x 44 px;
//                a link inside a sentence is exempt (the page audit's rule)
//   header       the kit's door header (.door-head) or tool header (.tool-head) is on the page
//   overflow     nothing scrolls sideways
//   console      no console error and no uncaught exception
//
// Static checks (no browser; test:gates runs them in ratchet mode, under the same check names):
//   shell        the page includes /shared/ace-shell.js (or sets data-ace-shell="off")
//   logo         a page that sets data-ace-shell="off" names a /shared/brand/ mark
//   other-logo   no img, icon link or CSS url to a logo-like file outside /shared/brand/, and no
//                element whose class or id says logo, brand, wordmark, lockup or masthead
//   wordmark     no heading or brand-class element whose text is the old wordmark
//   old-logo-ref the page, its own scripts and its own stylesheets never name the two old copies
//   header       the page markup or one of its own scripts carries door-head or tool-head
//   fonts        no font-family declaration (inline style, <style>, its own stylesheets) whose first
//                family is outside the three, apart from the exam and figure allowlist
//
// The ratchet: the baseline lists, per page, the checks that fail today (a browser check fails on
// a page when it fails in any of its runs; the report names the runs). The default mode fails only
// when a page gains a failing check it did not have; a page missing from the baseline (a new page)
// must pass every check. --strict fails on any. Checks that now pass are listed so the baseline can
// be tightened.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { servedFiles, redirectRules, urlOf } from './lib/served.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const DEFAULT_BASELINE = path.join(ROOT, 'scripts', 'one-product-baseline.json');
export const BROWSER_CHECKS = ['shell', 'logo', 'other-logo', 'wordmark', 'old-logo-ref', 'fonts', 'colors', 'targets', 'header', 'overflow', 'console'];
export const STATIC_CHECKS = ['shell', 'logo', 'other-logo', 'wordmark', 'old-logo-ref', 'header', 'fonts'];
export const FAMILIES = ['sora', 'dm sans', 'jetbrains mono'];
export const OLD_COPIES = ['shared/ace-dat-lockup-reversed.svg', 'shared/ace-dat-mark-reversed.svg'];
export const SITE_ICONS = ['/favicon.ico', '/apple-touch-icon.png'];
export const WORDMARK = /ace\s*the\s*dat/i;
export const BRAND_CLASS = /(^|[\s_-])(logo|brand|wordmark|lockup|masthead)(?=$|[\s_-])/i;
export const LOGO_FILE = /(^|[\/_.-])(logo|lockup|wordmark|brand|monogram|favicon|apple-touch-icon|ace-?the-?dat|acedat|ace-dat)([\/_.-]|$)/i;
// text these selectors hold may use another face: drawn figures, and the DAT test-day screen
// (spec 5.1: the exam layer keeps Arial, in practice and timed)
export const FONT_ALLOW = [
  { sel: 'svg, canvas, math, .katex, mjx-container, .MathJax, [data-figure]', why: 'drawn figures and math' },
  { sel: '[data-exam], .exam-screen, #pmRun, .pm-run, .pm-svg, .pm-mol', why: 'the DAT test-day screen (Arial)' },
];
// static: selectors (in a stylesheet) whose font-family may name another face, same reasons
export const FONT_ALLOW_STATIC = /(^|[\s,>+~])(svg|canvas|math|text|tspan)\b|\.katex|\.MathJax|data-figure|data-exam|\.exam|#pmRun|\.pm-run|\.pm-svg|\.pm-mol|@font-face/i;
export const TOLERANCE = 6;

/* ---------- the page list ---------- */
export function hiddenPaths(root) {
  const out = []; const add = (p, why) => out.push({ p, why });
  const spec = path.join(root, 'docs/release-2026-10-30/one-loop/spec.md');
  if (fs.existsSync(spec)) {
    const s = fs.readFileSync(spec, 'utf8'); const a = s.indexOf('### 1.5'), b = s.indexOf('### 1.6', a);
    for (const line of (a >= 0 ? s.slice(a, b > a ? b : undefined) : '').split('\n')) {
      if (!line.startsWith('|') || /^\|\s*(From|Page|-{3})/.test(line)) continue;
      const cell = line.split('|')[1];
      if (/with no `subject`/.test(cell)) continue;              // games/play.html stays; only its no-subject state goes
      for (const m of cell.matchAll(/(never\s+)?`([^`\s]+)`/g)) {
        if (m[1]) continue;                                       // "(subfolders only, never `/tests/` itself)"
        let p = m[2]; if (!p.startsWith('/')) { if (/^agent-0/.test(p)) p = '/tools/qr/proposals/' + p; else continue; }
        add(p, 'spec 1.5');
      }
    }
  }
  add('/tools/qr/proposals/agent-06-geometry/*', 'spec 1.5 (QR geometry canvases stay unlinked)');
  add('/tools/gc/tiktoks/*', 'spec 1.5 (GChem embed canvases are embed-only)');
  add('/tools/explain/preview.html', 'internal: the explainer preview (R0 answers 404 in production)');
  const inv = path.join(root, 'docs/release-2026-10-30/inventory.md');
  if (fs.existsSync(inv)) for (const line of fs.readFileSync(inv, 'utf8').split('\n')) {
    const c = line.split('|').map((x) => x.trim()); if (c.length > 6 && c[1].startsWith('/') && c[4] === 'internal') add(c[1], 'inventory: internal');
  }
  return out;
}
const globRe = (p) => new RegExp('^' + p.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$');
export function isHidden(hidden, url, rel) {
  const cands = [url, '/' + rel, '/' + rel.replace(/(^|\/)index\.html$/, '$1')];
  return hidden.find((h) => cands.some((c) => (h.p.includes('*') ? globRe(h.p).test(c) || (h.p.endsWith('/*') && c === h.p.slice(0, -1)) : c === h.p || c === h.p.replace(/\/$/, '') || c + '/' === h.p)));
}
export function studentPages(root) {
  const hidden = hiddenPaths(root); const rules = redirectRules(root);
  const rewrite = new Map(rules.filter((r) => r.status === 200 && !r.from.includes('*')).map((r) => [r.to.replace(/^\//, ''), r.from]));
  return servedFiles(root, { exts: new Set(['.html']) })
    .map((rel) => ({ rel, url: rewrite.get(rel) || urlOf(rel) }))
    .filter((x) => !isHidden(hidden, x.url, x.rel))
    .sort((a, b) => a.url.localeCompare(b.url));
}

/* ---------- the palette ---------- */
const hex = (h) => { h = h.replace('#', ''); if (h.length === 3 || h.length === 4) h = h.split('').map((c) => c + c).join(''); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16), h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1]; };
export function colorsIn(css) {
  const out = []; const clean = css.replace(/\/\*[\s\S]*?\*\//g, '');
  for (const m of clean.matchAll(/#([0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})\b/gi)) out.push(hex(m[1]));
  for (const m of clean.matchAll(/rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:\s*[,/]\s*([\d.]+%?))?\s*\)/gi)) {
    const a = m[4] == null ? 1 : m[4].endsWith('%') ? parseFloat(m[4]) / 100 : parseFloat(m[4]); out.push([+m[1], +m[2], +m[3], a]);
  }
  return out;
}
export const over = (top, under) => { const a = top[3] == null ? 1 : top[3]; return [0, 1, 2].map((i) => top[i] * a + under[i] * (1 - a)).concat(1); };
// The palette: every opaque color tokens v2 (shared/al-tokens.css, both themes) and the kit
// (shared/al-kit.css) set, plus each translucent one (a wash, a line, a plate) composited over every
// ground the tokens name (page, surfaces, sunk, the bench, the exam screen, white), in both themes.
// Shadows, glows and filters are not colors a box is painted with, so they are left out.
const GROUND = /^--(s-(page|surface|surface-2|sunk)|al-(bg|paper|paper-2|paper-3|bench-[0-3]|exam-bg|exam-tool|spec-paper|spec-surround|spec-table|mint-tint|mint-deep)|b-(bg|raised|raised-2))$/;
const NOT_PAINT = /shadow|glow|filter/i;
function decls(css) { return [...css.replace(/\/\*[\s\S]*?\*\//g, ' ').matchAll(/([\w-]+)\s*:\s*([^;{}]+)/g)].map((m) => [m[1].trim(), m[2].trim()]); }
export function palette(root) {
  const read = (f) => { try { return fs.readFileSync(path.join(root, f), 'utf8'); } catch { return ''; } };
  const tok = decls(read('shared/al-tokens.css')), kit = decls(read('shared/al-kit.css'));
  const first = new Map(); for (const [k, v] of tok) if (k.startsWith('--') && !first.has(k)) first.set(k, v);
  const resolve = (v, n = 0) => (n > 8 ? v : v.replace(/var\(\s*(--[\w-]+)\s*(?:,[^)]*)?\)/g, (m, name) => (first.has(name) ? resolve(first.get(name), n + 1) : m)));
  const paints = [...tok, ...kit].filter(([k]) => !NOT_PAINT.test(k)).map(([k, v]) => [k, resolve(v)]);
  const solid = []; const seen = new Set();
  const push = (c) => { const r = c.slice(0, 3).map((x) => Math.round(x)); const key = r.join(','); if (!seen.has(key)) { seen.add(key); solid.push(r); } };
  for (const [, v] of paints) for (const c of colorsIn(v)) if (c[3] >= 0.999) push(c);
  push([255, 255, 255]);
  const grounds = []; for (const [k, v] of tok) if (GROUND.test(k)) for (const c of colorsIn(resolve(v))) if (c[3] >= 0.999) grounds.push(c);
  grounds.push([255, 255, 255, 1]);
  for (const [, v] of paints) for (const c of colorsIn(v)) if (c[3] < 0.999 && c[3] > 0) for (const g of grounds) push(over(c, g));
  return solid;
}
export function lab([r, g, b]) {
  const f = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  const R = f(r), G = f(g), B = f(b);
  const X = (R * 0.4124 + G * 0.3576 + B * 0.1805) / 0.95047, Y = R * 0.2126 + G * 0.7152 + B * 0.0722, Z = (R * 0.0193 + G * 0.1192 + B * 0.9505) / 1.08883;
  const t = (v) => (v > 0.008856 ? Math.cbrt(v) : 7.787 * v + 16 / 116);
  return [116 * t(Y) - 16, 500 * (t(X) - t(Y)), 200 * (t(Y) - t(Z))];
}
export function nearest(pal, c) { const L = lab(c); let best = Infinity; for (const p of pal) { const q = lab(p); const d = Math.hypot(L[0] - q[0], L[1] - q[1], L[2] - q[2]); if (d < best) best = d; } return best; }

/* ---------- static checks ---------- */
const blankComments = (s) => s.replace(/<!--[\s\S]*?-->/g, (m) => m.replace(/[^\n]/g, ' '));
function localIncludes(root, rel, html, re) {
  const out = []; let m;
  while ((m = re.exec(html))) {
    const u = m[1] || m[2]; if (!u || /^(https?:)?\/\//.test(u) || u.startsWith('data:')) continue;
    const abs = (u.startsWith('/') ? u.slice(1) : path.posix.normalize(path.posix.join(path.posix.dirname(rel), u))).split(/[?#]/)[0];
    if (/\.min\.(js|css)$|(^|\/)vendor\//.test(abs)) continue;
    const f = path.join(root, abs); if (fs.existsSync(f) && fs.statSync(f).isFile()) out.push(abs);
  }
  return out;
}
export function firstFamily(decl) {
  const v = decl.trim().replace(/!important\s*$/i, '').trim();
  if (/^(inherit|initial|unset|revert|var\()/i.test(v)) return null;
  const f = v.split(',')[0].trim().replace(/^['"]|['"]$/g, '');
  return f;
}
const okFamily = (f) => f == null || FAMILIES.includes(f.toLowerCase());
// the first family of a `font:` shorthand, or null when it reads a variable or inherits
function shorthandFamily(v) {
  v = v.trim().replace(/!important\s*$/i, '').trim();
  if (/^(inherit|initial|unset|revert)$/i.test(v) || /var\(/.test(v) && !/['"]/.test(v.replace(/var\([^)]*\)/g, ''))) return null;
  if (/^(caption|icon|menu|message-box|small-caption|status-bar)$/i.test(v)) return v;
  const m = v.match(/(?:^|\s)\d[\d.]*(?:px|r?em|%|pt|vw|vh|ex|ch)?(?:\s*\/\s*[\d.]+[a-z%]*)?\s+(.+)$/i);
  if (!m) return null;
  return firstFamily(m[1]);
}
export function cssFontIssues(css, { allowSel = FONT_ALLOW_STATIC } = {}) {
  const out = []; const clean = css.replace(/\/\*[\s\S]*?\*\//g, ' ');
  const re = /([^{}]*)\{([^{}]*)\}/g; let m;
  while ((m = re.exec(clean))) {
    const sel = m[1].trim(); if (allowSel.test(sel)) continue;
    for (const d of m[2].split(';')) {
      const i = d.indexOf(':'); if (i < 0) continue;
      const prop = d.slice(0, i).trim().toLowerCase(); const val = d.slice(i + 1);
      if (prop.startsWith('--')) continue;
      const f = prop === 'font-family' ? firstFamily(val) : prop === 'font' ? shorthandFamily(val) : undefined;
      if (f === undefined || okFamily(f)) continue;
      out.push({ sel: sel.slice(0, 60), family: f });
    }
  }
  return out;
}
const textOf = (h) => h.replace(/<[^>]+>/g, ' ').replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
export function staticCheck(root, rel, src, { read = (f) => fs.readFileSync(path.join(root, f), 'utf8') } = {}) {
  const html = blankComments(src); const fail = {}; const add = (k, d) => { (fail[k] = fail[k] || []).push(d); };
  const shellOff = /<html\b[^>]*\bdata-ace-shell\s*=\s*["']?off/i.test(html);
  const scripts = localIncludes(root, rel, html, /<script\b[^>]*\bsrc\s*=\s*["']([^"']+)["']/gi);
  const sheets = localIncludes(root, rel, html, /<link\b[^>]*\brel\s*=\s*["']?stylesheet["']?[^>]*\bhref\s*=\s*["']([^"']+)["']|<link\b[^>]*\bhref\s*=\s*["']([^"']+\.css[^"']*)["'][^>]*\brel\s*=\s*["']?stylesheet/gi);
  const own = (f) => !f.startsWith('shared/');
  const bodies = { js: scripts.filter(own).map((f) => [f, read(f)]), css: sheets.filter(own).map((f) => [f, read(f)]) };
  // shell / logo
  if (!shellOff && !scripts.includes('shared/ace-shell.js')) add('shell', 'no /shared/ace-shell.js');
  if (shellOff && !/\/shared\/brand\/ace-dat-mark[\w-]*\.svg/.test(html)) add('logo', 'the shell is off and the page names no /shared/brand/ mark');
  // other logo files and brand boxes
  // pictures only: src, srcset, xlink:href, poster, an icon <link>, a CSS url(); never a plain link's href
  const urlRe = /(?:\bsrc|\bsrcset|\bxlink:href|\bposter)\s*=\s*["']([^"']+)["']|url\(\s*["']?([^"')]+)["']?\s*\)|<link\b[^>]*\brel\s*=\s*["']?[^"'>]*icon[^"'>]*["']?[^>]*\bhref\s*=\s*["']([^"']+)["']|<link\b[^>]*\bhref\s*=\s*["']([^"']+)["'][^>]*\brel\s*=\s*["']?[^"'>]*icon/gi;
  const scanUrls = (text, where) => {
    let m; urlRe.lastIndex = 0;
    while ((m = urlRe.exec(text))) {
      const u = (m[1] || m[2] || m[3] || m[4] || '').trim().split(/\s+/)[0]; if (!u || u.startsWith('data:') || u.includes('${')) continue;
      const p = u.split(/[?#]/)[0]; const pathPart = p.replace(/^(https?:)?\/\/[^/]+/, ''); if (!LOGO_FILE.test(pathPart) || /\.(js|css|mjs|html?)$/i.test(pathPart)) continue;
      const abs = /^(https?:)?\/\//.test(p) ? p : p.startsWith('/') ? p : '/' + path.posix.normalize(path.posix.join(path.posix.dirname(where), p));
      if (abs.startsWith('/shared/brand/') || SITE_ICONS.includes(abs)) continue;
      add('other-logo', where + ' names ' + u);
    }
  };
  scanUrls(html, rel); for (const [f, t] of bodies.css) scanUrls(t, f);
  for (const m of html.matchAll(/<([a-z][\w-]*)\b[^>]*\b(?:class|id)\s*=\s*["']([^"']*)["'][^>]*>/gi)) {
    if (!BRAND_CLASS.test(m[2]) || /^(html|body|link|meta|script|style)$/i.test(m[1])) continue;
    const rest = html.slice(m.index + m[0].length, m.index + m[0].length + 400);
    if (/^img$/i.test(m[1]) && /\bsrc\s*=\s*["']\/shared\/brand\//i.test(m[0])) continue;   // the ACE DAT logo itself
    if (/^\s*<img\b[^>]*\/shared\/brand\//i.test(rest)) continue;
    add('other-logo', `<${m[1]} ${m[2].trim().slice(0, 40)}>`);
  }
  // the old wordmark in a heading or a brand box
  for (const m of html.matchAll(/<(h[1-6])\b[^>]*>([\s\S]*?)<\/\1>/gi)) if (WORDMARK.test(textOf(m[2]))) add('wordmark', `<${m[1]}> ${textOf(m[2]).slice(0, 50)}`);
  for (const m of html.matchAll(/<([a-z][\w-]*)\b[^>]*\bclass\s*=\s*["']([^"']*)["'][^>]*>([^<]{0,80}(?:<[^>]+>[^<]{0,40}){0,3})/gi)) {
    if (BRAND_CLASS.test(m[2]) && WORDMARK.test(textOf(m[3])) && textOf(m[3]).length <= 60) add('wordmark', `.${m[2].trim().split(/\s+/)[0]} ${textOf(m[3]).slice(0, 50)}`);
  }
  // the two old copies
  for (const [f, t] of [[rel, html], ...bodies.js, ...bodies.css]) for (const m of t.matchAll(/ace-dat-(lockup|mark)-reversed\.svg/g)) add('old-logo-ref', `${f} names shared/ace-dat-${m[1]}-reversed.svg`);
  // the kit header
  if (!/\b(door-head|tool-head)\b/.test(html) && !bodies.js.some(([, t]) => /\b(door-head|tool-head)\b/.test(t))) add('header', 'no door-head or tool-head in the page or its own scripts');
  // font-family declarations
  const inlineCss = [...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style\s*>/gi)].map((m) => m[1]).join('\n');
  const issues = [...cssFontIssues(inlineCss).map((x) => ({ ...x, where: rel })), ...bodies.css.flatMap(([f, t]) => cssFontIssues(t).map((x) => ({ ...x, where: f })))];
  for (const m of html.matchAll(/<([a-z][\w-]*)\b[^>]*\bstyle\s*=\s*"([^"]*font[^"]*)"/gi)) if (!/^(svg|text|tspan|canvas)$/i.test(m[1])) for (const x of cssFontIssues(`x{${m[2]}}`)) issues.push({ ...x, sel: `style="" on <${m[1]}>`, where: rel });
  for (const x of issues.slice(0, 8)) add('fonts', `${x.where}: ${x.sel} uses ${x.family}`);
  if (issues.length > 8) add('fonts', `(${issues.length - 8} more)`);
  return fail;
}

/* ---------- browser checks (this function runs in the page) ---------- */
export function inspect(opts) {
  const out = {}; const add = (k, d) => { const a = out[k] = out[k] || []; if (a.length < 6) a.push(d); else if (a.length === 6) a.push('(more)'); };
  const de = document.documentElement;
  const sel = (el) => { if (!el || !el.tagName) return '?'; if (el.id) return '#' + el.id; let s = el.tagName.toLowerCase(); const c = [...el.classList].slice(0, 2).join('.'); if (c) s += '.' + c; const p = el.parentElement; if (p && p !== document.body && p !== de) s = (p.id ? '#' + p.id : p.tagName.toLowerCase() + (p.classList[0] ? '.' + p.classList[0] : '')) + ' > ' + s; return s; };
  const visible = (el) => { if (!el || !el.getBoundingClientRect) return false; const st = getComputedStyle(el); if (st.visibility === 'hidden' || st.display === 'none' || Number(st.opacity) === 0) return false; const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false; for (let a = el; a; a = a.parentElement) { const s = getComputedStyle(a); if (s.display === 'none' || Number(s.opacity) === 0) return false; } return !el.closest('[hidden],[aria-hidden="true"][inert]'); };
  const host = document.getElementById('ace-shell');
  const inShell = (el) => !!(host && (el === host || host.contains(el)));
  const brandUrl = (u) => /\/shared\/brand\//.test(u || '');
  /* shell and logo */
  const shellOff = de.getAttribute('data-ace-shell') === 'off';
  const shellShown = !!(host && !host.hidden && host.getBoundingClientRect().height > 0 && getComputedStyle(host).display !== 'none');
  const examHidden = shellOff || !!(host && host.hidden);
  if (!shellShown && !examHidden) add('shell', host ? 'the shell is mounted but not showing' : 'no shell (#ace-shell)');
  if (shellShown) {
    const sr = host.shadowRoot || host;
    const imgs = [...sr.querySelectorAll('img')].filter((i) => brandUrl(i.getAttribute('src')));
    const shown = imgs.filter((i) => { const r = i.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false; for (let a = i; a && a !== sr; a = a.parentNode) { if (a.nodeType !== 1) continue; const s = getComputedStyle(a); if (s.display === 'none' || s.visibility === 'hidden' || Number(s.opacity) === 0) return false; } return true; });
    if (!shown.length) add('logo', imgs.length ? `the shell's ACE DAT logo is hidden at ${innerWidth} px` : 'the shell carries no /shared/brand/ image');
  } else if (examHidden) {
    const marks = [...document.querySelectorAll('img, image, use')].filter((i) => brandUrl(i.getAttribute('src') || i.getAttribute('href') || i.getAttribute('xlink:href')) && visible(i));
    if (!marks.length) add('logo', 'the shell is hidden and the page shows no /shared/brand/ mark');
  }
  /* other logos */
  const LOGO = new RegExp(opts.logoFile, 'i'), BRAND = new RegExp(opts.brandClass, 'i'), WORD = new RegExp(opts.wordmark, 'i');
  const urlBad = (u) => { if (!u || u.startsWith('data:')) return false; let p; try { p = new URL(u.trim().split(/\s+/)[0], location.href); } catch (e) { return false; } return LOGO.test(p.pathname) && !/\.(js|css|mjs|html?)$/i.test(p.pathname) && !(p.origin === location.origin && (brandUrl(p.pathname) || opts.siteIcons.includes(p.pathname))); };
  for (const el of document.querySelectorAll('img, source, image, use, link[rel~="icon"], link[rel="apple-touch-icon"]')) {
    if (inShell(el)) continue;
    const u = el.getAttribute('src') || el.getAttribute('srcset') || el.getAttribute('href') || el.getAttribute('xlink:href');
    if (urlBad(u) && (el.tagName === 'LINK' || visible(el.tagName === 'SOURCE' ? el.parentElement : el))) add('other-logo', `${sel(el)} draws ${u}`);
  }
  if (shellShown) for (const el of document.querySelectorAll('img, image, use')) {
    if (inShell(el) || !visible(el)) continue;
    const u = el.getAttribute('src') || el.getAttribute('href') || el.getAttribute('xlink:href') || '';
    if (/\/shared\/brand\/(ace-dat-(lockup|mark)|icon)/.test(u)) add('other-logo', `${sel(el)} draws the ACE DAT logo a second time (it shows once, in the shell)`);
  }
  const all = [...document.body.querySelectorAll('*')].filter((el) => !inShell(el));
  for (const el of all) {
    const bg = getComputedStyle(el).backgroundImage;
    if (bg && bg !== 'none') for (const m of bg.matchAll(/url\("?([^")]+)"?\)/g)) if (urlBad(m[1]) && visible(el)) add('other-logo', `${sel(el)} background ${m[1].split('/').pop()}`);
    const named = (el.getAttribute('class') || '') + ' ' + (el.id || '');
    if (BRAND.test(named) && visible(el)) {
      const drawsBrand = [el, ...el.querySelectorAll('img, image, use')].some((i) => /^(IMG|image|use)$/i.test(i.tagName) && brandUrl(i.getAttribute('src') || i.getAttribute('href')));
      const inBrand = el.parentElement && el.parentElement.closest && [...(function* () { for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) yield a; })()].some((a) => BRAND.test((a.getAttribute('class') || '') + ' ' + (a.id || '')));
      if (!drawsBrand && !inBrand) add('other-logo', `${sel(el)} "${(el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 40)}"`);
    }
  }
  /* the old wordmark as a heading or a brand line */
  for (const el of all) {
    if (/^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE)$/.test(el.tagName)) continue;
    const t = (el.textContent || '').trim().replace(/\s+/g, ' ');
    if (!t || t.length > 60 || !WORD.test(t.replace(/\s+/g, ''))) continue;
    if ([...el.children].some((c) => WORD.test((c.textContent || '').replace(/\s+/g, '')))) continue;   // report the innermost
    const heading = el.closest('h1,h2,h3,h4,h5,h6');
    let branded = false; for (let a = el, n = 0; a && a !== document.body && n < 5; a = a.parentElement, n++) if (BRAND.test((a.getAttribute('class') || '') + ' ' + (a.id || ''))) branded = true;
    const bar = el.closest('header, nav, [role="banner"], [role="navigation"]');
    if ((heading || branded || bar) && visible(el)) add('wordmark', `${sel(el)} "${t.slice(0, 40)}"`);
  }
  /* fonts */
  const allowSel = opts.fontAllow.join(', ');
  const bad = new Map();
  const famOf = (el) => (getComputedStyle(el).fontFamily.split(',')[0] || '').trim().replace(/^['"]|['"]$/g, '');
  const consider = (el) => {
    if (!el || inShell(el) || (allowSel && el.closest(allowSel)) || !visible(el)) return;
    const f = famOf(el); if (opts.families.includes(f.toLowerCase())) return;
    if (!bad.has(f)) bad.set(f, sel(el));
  };
  const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, { acceptNode: (n) => (n.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT) });
  const seenEl = new Set();
  for (let n = tw.nextNode(); n; n = tw.nextNode()) { const p = n.parentElement; if (!p || seenEl.has(p) || /^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE|TITLE)$/.test(p.tagName)) continue; seenEl.add(p); consider(p); }
  for (const el of document.querySelectorAll('input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"]):not([type="range"]):not([type="color"]), select, textarea')) consider(el);
  for (const [f, s] of bad) add('fonts', `${f || '(none)'} at ${s}`);
  /* colors */
  const parse = (c) => { const m = (c || '').match(/rgba?\(([^)]+)\)/); if (!m) return null; const v = m[1].split(/[\s,/]+/).filter(Boolean).map(Number); return [v[0], v[1], v[2], v.length > 3 ? v[3] : 1]; };
  const ov = (top, under) => { const a = top[3]; return [0, 1, 2].map((i) => top[i] * a + under[i] * (1 - a)).concat(1); };
  const canvas = /dark/.test(getComputedStyle(de).colorScheme || '') ? [18, 18, 18, 1] : [255, 255, 255, 1];
  const bgCache = new Map();
  const effBg = (el) => {
    if (!el || el === document) return canvas;
    if (bgCache.has(el)) return bgCache.get(el);
    const own = parse(getComputedStyle(el).backgroundColor) || [0, 0, 0, 0];
    const under = el === de ? canvas : effBg(el.parentElement || de);
    const r = own[3] >= 0.999 ? own : own[3] <= 0 ? under : ov(own, under);
    bgCache.set(el, r); return r;
  };
  const LAB = (c) => { const f = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; const R = f(c[0]), G = f(c[1]), B = f(c[2]); const X = (R * 0.4124 + G * 0.3576 + B * 0.1805) / 0.95047, Y = R * 0.2126 + G * 0.7152 + B * 0.0722, Z = (R * 0.0193 + G * 0.1192 + B * 0.9505) / 1.08883; const t = (v) => (v > 0.008856 ? Math.cbrt(v) : 7.787 * v + 16 / 116); return [116 * t(Y) - 16, 500 * (t(X) - t(Y)), 200 * (t(Y) - t(Z))]; };
  const palLab = opts.palette.map(LAB);
  const dist = (c) => { const L = LAB(c); let b = Infinity; for (const q of palLab) { const d = Math.hypot(L[0] - q[0], L[1] - q[1], L[2] - q[2]); if (d < b) b = d; } return b; };
  const hexOf = (c) => '#' + c.slice(0, 3).map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
  const offColors = new Map();
  const judge = (what, c, el) => { if (!c) return; const d = dist(c); if (d > opts.tolerance) { const k = what + ' ' + hexOf(c); if (!offColors.has(k)) offColors.set(k, `${what} ${hexOf(c)} at ${sel(el)} (delta E ${d.toFixed(1)})`); } };
  judge('page', effBg(document.body), document.body);
  const BTN = 'button, [role="button"], input[type="button"], input[type="submit"], input[type="reset"], a.btn, .btn';
  for (const el of all) {
    if (el.closest('svg, canvas') || el.closest(opts.figureSel)) continue;
    const st = getComputedStyle(el);
    const isBtn = el.matches(BTN), isHead = /^H[1-3]$/.test(el.tagName);
    if (!isBtn && !isHead) {
      const own = parse(st.backgroundColor); if (!own || own[3] < 0.02) continue;
      const r = parseFloat(st.borderTopLeftRadius) || 0; const sh = st.boxShadow && st.boxShadow !== 'none';
      if (r < 4 && !sh) continue;
      const box = el.getBoundingClientRect(); if (box.width < 120 || box.height < 40 || !visible(el)) continue;
      judge('card', effBg(el), el); continue;
    }
    if (!visible(el)) continue;
    const ink = parse(st.color); const ground = effBg(el);
    if (isBtn) { const own = parse(st.backgroundColor); if (own && own[3] >= 0.02) judge('button fill', ground, el); }
    if (ink) judge(isBtn ? 'button text' : 'heading', ink[3] < 1 ? ov(ink, ground) : ink, el);
  }
  for (const v of offColors.values()) add('colors', v);
  /* targets in main */
  const main = document.querySelector('main, [role="main"]') || document.body;
  const T = 'a[href],button,input:not([type="hidden"]),select,textarea,summary,[role="button"],[role="link"],[role="tab"],[role="checkbox"],[role="radio"],[role="switch"],[role="menuitem"],[role="option"],[tabindex]:not([tabindex="-1"])';
  let small = 0;
  for (const el of main.querySelectorAll(T)) {
    if (inShell(el) || !visible(el) || el.closest('[hidden],[aria-hidden="true"]')) continue;
    let r = el.getBoundingClientRect();
    if (el.tagName === 'A' && getComputedStyle(el).display === 'inline') { const p = el.parentElement; if (p && (p.textContent || '').trim().length > (el.textContent || '').trim().length + 12) continue; }
    if (el.tagName === 'INPUT' && /checkbox|radio/.test(el.type)) { const lab = el.closest('label'); if (lab) r = lab.getBoundingClientRect(); }
    if (Math.min(r.width, r.height) < 43.5) { small++; add('targets', `${sel(el)} ${Math.round(r.width)}x${Math.round(r.height)}`); }
  }
  /* header */
  if (![...document.querySelectorAll('.door-head, .tool-head')].some(visible)) add('header', 'no door header (.door-head) or tool header (.tool-head)');
  /* overflow */
  const sw = Math.max(de.scrollWidth, document.body ? document.body.scrollWidth : 0);
  if (sw > de.clientWidth + 1) add('overflow', `scrollWidth ${sw} at ${de.clientWidth}`);
  return out;
}

/* ---------- running it ---------- */
export function ratchet(baseline, results) {
  const gained = [], fixed = [];
  for (const [page, failing] of Object.entries(results)) {
    const before = new Set(baseline[page] || []);
    for (const k of failing) if (!before.has(k)) gained.push({ page, check: k, isNew: !(page in baseline) });
    for (const k of before) if (!failing.includes(k)) fixed.push({ page, check: k });
  }
  return { gained, fixed };
}
const runKey = (check, size, theme) => `${check}@${size}-${theme}`;

export async function browserRun(pages, { base, jobs = 4, sizes = [390, 1280], themes = ['light', 'dark'], pal, quiet = true, browser: given }) {
  const { launchChromium, settle } = await import('./lib/site.mjs');
  const browser = given || await launchChromium();
  const origin = new URL(base).origin;
  const opts = { palette: pal, tolerance: TOLERANCE, families: FAMILIES, fontAllow: FONT_ALLOW.map((x) => x.sel), figureSel: FONT_ALLOW[0].sel,
    logoFile: LOGO_FILE.source, brandClass: BRAND_CLASS.source, wordmark: WORDMARK.source, siteIcons: SITE_ICONS };
  const runs = []; for (const p of pages) for (const w of sizes) for (const t of themes) runs.push({ p, w, t });
  const out = new Map(pages.map((p) => [p.url, {}]));
  let next = 0, done = 0; const t0 = Date.now();
  await Promise.all(Array.from({ length: Math.min(jobs, runs.length) }, async () => {
    while (next < runs.length) {
      const { p, w, t } = runs[next++];
      const ctx = await browser.newContext({ viewport: { width: w, height: w < 700 ? 844 : 800 }, colorScheme: t, hasTouch: w < 700, deviceScaleFactor: 1 });
      await ctx.route('**/*', (route) => { const u = new URL(route.request().url()); return u.origin === origin || u.protocol === 'data:' || u.protocol === 'blob:' ? route.continue() : route.abort('blockedbyclient'); });
      const page = await ctx.newPage(); const errs = []; const oldRefs = [];
      page.on('pageerror', (e) => errs.push('uncaught: ' + String(e.message || e).split('\n')[0].slice(0, 160)));
      page.on('console', (m) => { if (m.type() !== 'error') return; const loc = m.location && m.location(); if (loc && loc.url && !loc.url.startsWith(origin) && /^https?:/.test(loc.url)) return; if (/ERR_BLOCKED_BY_CLIENT/.test(m.text())) return; errs.push(m.text().split('\n')[0].slice(0, 160)); });
      page.on('request', (r) => { const u = r.url(); if (OLD_COPIES.some((o) => u.split(/[?#]/)[0].endsWith('/' + o))) oldRefs.push(new URL(u).pathname); });
      let found = {};
      try {
        const resp = await page.goto(base + p.url, { waitUntil: 'load', timeout: 45000 });
        if (resp && resp.status() >= 400) errs.push(`HTTP ${resp.status()}`);
        await settle(page, 350);
        found = await page.evaluate(inspect, opts);
      } catch (e) { errs.push('could not load: ' + String(e.message).split('\n')[0].slice(0, 160)); }
      if (oldRefs.length) found['old-logo-ref'] = [...new Set(oldRefs)];
      if (errs.length) found.console = [...new Set(errs)].slice(0, 6);
      const rec = out.get(p.url); for (const [k, v] of Object.entries(found)) rec[runKey(k, w, t)] = v;
      await ctx.close();
      done++; if (!quiet && process.stderr.isTTY) process.stderr.write(`\r  ${done}/${runs.length} loads (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
    }
  }));
  if (!quiet && process.stderr.isTTY) process.stderr.write('\n');
  if (!given) await browser.close();
  return out;
}

async function main() {
  const args = process.argv.slice(2);
  const val = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : undefined; };
  const VALUED = new Set(['--file', '--report', '--jobs', '--base', '--sizes', '--themes']);
  const tokens = args.filter((a, i) => !a.startsWith('--') && !VALUED.has(args[i - 1]));
  const STATIC_ONLY = args.includes('--static'), STRICT = args.includes('--strict'), WRITE = args.includes('--baseline'), QUIET = args.includes('--quiet');
  const FILE = path.resolve(val('--file') || DEFAULT_BASELINE);
  let pages = studentPages(ROOT);
  if (args.includes('--list')) { for (const p of pages) console.log(p.url + (p.url !== urlOf(p.rel) ? '  (' + p.rel + ')' : '')); console.log(`${pages.length} student pages`); return 0; }
  if (tokens.length) { const want = new Set(tokens.map((t) => (t.startsWith('/') ? t : '/' + t.replace(/^\.\//, '')))); pages = pages.filter((p) => want.has(p.url) || want.has('/' + p.rel)); for (const w of want) if (!pages.some((p) => p.url === w || '/' + p.rel === w)) console.warn(`gate-one-product: ${w} is not a served student page (skipped)`); }
  const t0 = Date.now();
  // static
  const stat = {};
  for (const p of pages) { const f = staticCheck(ROOT, p.rel, fs.readFileSync(path.join(ROOT, p.rel), 'utf8')); stat[p.url] = f; }
  // browser
  let brow = null; const sizes = (val('--sizes') || '390,1280').split(',').map(Number); const themes = (val('--themes') || 'light,dark').split(',');
  if (!STATIC_ONLY) {
    const { startServer } = await import('./lib/site.mjs');
    const server = val('--base') ? null : await startServer(ROOT);
    const base = (val('--base') || server.url).replace(/\/$/, '');
    try { brow = await browserRun(pages, { base, jobs: Math.max(1, Number(val('--jobs')) || 4), sizes, themes, pal: palette(ROOT), quiet: QUIET }); }
    finally { if (server) await server.close(); }
  }
  // failing check lists
  const failS = Object.fromEntries(pages.map((p) => [p.url, Object.keys(stat[p.url]).sort()]));
  // a browser check fails on a page when it fails in any run (the report keeps which runs)
  const failB = brow ? Object.fromEntries(pages.map((p) => [p.url, [...new Set(Object.keys(brow.get(p.url)).map((k) => k.split('@')[0]))].sort()])) : null;
  // print: one line per page, one column per check
  const cols = STATIC_ONLY ? STATIC_CHECKS : BROWSER_CHECKS;
  const cell = (url, c) => {
    if (STATIC_ONLY) return failS[url].includes(c) ? 'FAIL' : 'ok';
    const runs = Object.keys(brow.get(url)).filter((k) => k.startsWith(c + '@')).map((k) => k.slice(c.length + 1));
    const s = failS[url].includes(c) ? 'S' : '';
    if (!runs.length) return s ? 'S' : 'ok';
    return (runs.length === sizes.length * themes.length ? 'FAIL' : runs.map((r) => r.replace('light', 'l').replace('dark', 'd')).join(',')) + (s ? '+S' : '');
  };
  const W = Math.min(56, Math.max(...pages.map((p) => p.url.length), 4));
  const lines = pages.map((p) => ({ url: p.url, cells: cols.map((c) => cell(p.url, c)) }));
  const anyFail = (l) => l.cells.some((c) => c !== 'ok');
  console.log(`gate-one-product: ${pages.length} student page(s), ${STATIC_ONLY ? 'static checks' : `${sizes.join(' and ')} px, ${themes.join(' and ')} (${pages.length * sizes.length * themes.length} loads)`} in ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  if (!QUIET) {
    console.log('  ' + 'page'.padEnd(W) + '  ' + cols.map((c) => c.padEnd(Math.max(c.length, 6))).join(' '));
    for (const l of lines) if (!QUIET || anyFail(l)) console.log('  ' + (l.url.length > W ? '...' + l.url.slice(-(W - 3)) : l.url).padEnd(W) + '  ' + l.cells.map((v, i) => v.padEnd(Math.max(cols[i].length, 6))).join(' '));
    if (!STATIC_ONLY) console.log('  (ok passes everywhere; FAIL fails in every run; 390-l,1280-d and so on name the runs that fail; S: the static check fails too)');
  }
  // report
  const report = { when: new Date().toISOString(), mode: STATIC_ONLY ? 'static' : 'browser', tolerance: TOLERANCE, pages: pages.map((p) => ({ page: p.url, file: p.rel, static: stat[p.url], browser: brow ? brow.get(p.url) : undefined })) };
  const reportFile = val('--report') || (STATIC_ONLY ? null : path.join(ROOT, 'test-screenshots', 'one-product', 'report.json'));
  if (reportFile) { fs.mkdirSync(path.dirname(reportFile), { recursive: true }); fs.writeFileSync(reportFile, JSON.stringify(report, null, 1) + '\n'); console.log(`  details: ${path.relative(ROOT, reportFile)}`); }
  // write the baseline
  if (WRITE) {
    const prev = fs.existsSync(FILE) ? JSON.parse(fs.readFileSync(FILE, 'utf8')) : {};
    const keep = (part, now) => { if (!now) return prev[part] || {}; if (!tokens.length) return now; return { ...(prev[part] || {}), ...now }; };
    const nonEmpty = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v.length));
    const doc = { schema: 'ace.one-product-baseline/1', written: new Date().toISOString().slice(0, 10),
      note: 'Per student page, the one-product checks that fail today (scripts/gate-one-product.mjs): static (the subset test:gates runs) and browser (a check that fails in any of the four runs, 390 and 1280, light and dark). The gate fails when a page gains a check that is not listed here; a page not listed must pass every check. Rewrite with npm run gate:one-product -- --baseline once a wave lands its fixes.',
      static: nonEmpty(keep('static', failS)), browser: nonEmpty(keep('browser', failB)) };
    fs.writeFileSync(FILE, JSON.stringify(doc, null, 1) + '\n');
    console.log(`gate-one-product: baseline written to ${path.relative(ROOT, FILE)} (${Object.keys(doc.static).length} page(s) with static failures, ${Object.keys(doc.browser).length} with browser failures)`);
    return 0;
  }
  // judge
  const failing = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v.length));
  if (STRICT) {
    const n = Object.keys(failing(failS)).length + (failB ? Object.keys(failing(failB)).length : 0);
    if (n) { console.error(`gate-one-product: strict: ${new Set([...Object.keys(failing(failS)), ...Object.keys(failB ? failing(failB) : {})]).size} page(s) fail a check`); return 1; }
    console.log('gate-one-product: OK (strict: every student page passes every check)'); return 0;
  }
  const base = fs.existsSync(FILE) ? JSON.parse(fs.readFileSync(FILE, 'utf8')) : { static: {}, browser: {} };
  const rs = ratchet(base.static || {}, failS); const rb = failB ? ratchet(base.browser || {}, failB) : { gained: [], fixed: [] };
  const gained = [...rs.gained.map((g) => ({ ...g, kind: 'static' })), ...rb.gained.map((g) => ({ ...g, kind: 'browser' }))];
  const fixed = rs.fixed.length + rb.fixed.length;
  if (fixed) console.log(`  ${fixed} check(s) in the baseline now pass; run with --baseline to lock them in`);
  if (gained.length) {
    console.error(`gate-one-product: ${gained.length} new failing check(s) (ratchet against ${path.relative(ROOT, FILE)}):`);
    for (const g of gained.slice(0, 40)) {
      const d = g.kind === 'static' ? (stat[g.page][g.check] || []) : Object.entries(brow.get(g.page)).filter(([k]) => k.split('@')[0] === g.check).flatMap(([k, v]) => v.map((x) => k.split('@')[1] + ': ' + x));
      console.error(`  ${g.page}  ${g.kind === 'static' ? 'static ' : ''}${g.check}${g.isNew ? ' (a page the baseline does not list: it must pass)' : ''}: ${d.slice(0, 3).join('; ')}`);
    }
    if (gained.length > 40) console.error(`  (${gained.length - 40} more)`);
    return 1;
  }
  console.log(`gate-one-product: OK (${STATIC_ONLY ? 'static, ' : ''}ratchet: no page gained a failing check)`);
  return 0;
}
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) main().then((c) => process.exit(c), (e) => { console.error('gate-one-product: ' + (e.stack || e)); process.exit(2); });
