#!/usr/bin/env node
// fit-pages.mjs : puts the older student pages on the one Ace Labs skin and makes them fit a phone.
//
//   node scripts/design/fit-pages.mjs            rewrite the pages in place (safe to run again)
//   node scripts/design/fit-pages.mjs --check    exit 1 if a page is out of date
//
// For every page in PAGES it:
//   1. drops the Google Fonts links (ace-ui.css self-hosts DM Sans and Playfair Display),
//   2. sets <html data-cream="..."> and links /shared/ace-cream.css last in <head>
//      (ace-cream.css imports the tokens from ace-ui.css and maps the page's old names onto them),
//   3. writes one <style id="ace-fit"> block: for every rule in the page's own CSS whose text is
//      under the phone floor, the same selector at the floor inside @media (max-width:759px).
//      Body text 15px, labels 13px. Text drawn inside an svg is left alone.
// The six PAT trainers are not rewritten here; their floors go into a marked section of
// shared/ace-cream.css, scoped to the PAT family.
// Needs css-tree (already in node_modules through jsdom).
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const csstree = require('css-tree');

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const CHECK = process.argv.includes('--check');
const CREAM_V = fs.readFileSync(path.join(ROOT, 'shared/ace-cream.css'), 'utf8').match(/ace-cream\.css \(v(\d+)\)/)[1];

// page -> the families ace-cream.css styles it by (html[data-cream~="..."])
export const PAGES = {
  'games/index.html': 'games', 'games/play.html': 'games', 'games/chirality/index.html': 'games', 'games/six-views/index.html': 'games',
  'tricks/index.html': 'tricks', 'tricks/videos/index.html': 'tricks tricks-video', 'tricks/shorts/index.html': 'tricks tricks-video', 'tricks/series/index.html': 'tricks', 'tricks/sheets.html': 'tricks',
  'diagnostic.html': 'al diag', 'test-week.html': 'al testweek', 'cheat-sheets.html': 'sheets', 'guides/pat-grids.html': 'guide',
  'plan/index.html': 'plan',
  'tools/bio-retold/index.html': 'retold', 'tools/gchem/index.html': 'retold', 'tools/organic/index.html': 'retold',
  'tools/pat-retold/index.html': 'retold', 'tools/rc-retold/index.html': 'retold', 'tools/qr-retold/index.html': 'retold',
  'tools/bio/index.html': 'rail bio', 'tools/bio/bio-cell.html': 'rail bio', 'tools/bio/bio-genetics.html': 'rail bio', 'tools/bio/bio-physiology.html': 'rail bio',
  'tools/bio/bio-diversity.html': 'rail bio', 'tools/bio/bio-devo.html': 'rail bio', 'tools/bio/bio-evolution.html': 'rail bio',
  'tools/bio/bio-micrographs.html': 'rail bio', 'tools/bio/bio-bonus.html': 'rail bio', 'tools/bio/bio-repair-sheet.html': 'rail bio',
  'tools/bio/bio-osmosis.html': 'osmosis', 'tools/bio/bio-ap-bootcamp.html': 'sidebar apboot',
  'tools/gc/index.html': 'rail engine', 'tools/qr/index.html': 'rail engine', 'tools/ochem/index.html': 'sidebar ochem',
  'tools/pat/index.html': 'pat', 'tools/pat/playbook.html': 'pat', 'tools/pat/test.html': 'pattest'
};
// Not rewritten here: floors for these go into shared/ace-cream.css
const PAT_SHARED = ['tools/pat/holepunch.html', 'tools/pat/tfe.html', 'tools/pat/patternfold.html', 'tools/pat/keyholes.html', 'tools/pat/angles.html', 'tools/pat/cubes.html'];

// A label is a short tag, count, key or control caption. Sentences (notes, hints, footers, descriptions) are body text.
const LABEL_SEL = /(^|[.#\-_\s>])(kick|kicker|eyebrow|label|lbl|lab|tag|badge|chip|pill|meta|btn|button|tab|tabs|stat|num|count|unit|th|kbd|crumb|k|st|best|seed|step|tgt|n|key|code|mono|time|date|due|tier|lvl|level|rank|pct|score|timer|nav|link|live|mode|brand|mark|id|idx|ord)(\b|[-_])/i;
// the part of a selector that names the element being styled
const lastCompound = (sel) => sel.trim().split(/\s*[\s>+~]\s*/).pop() || sel;
function isLabel(sel, decls) {
  if (/text-transform\s*:\s*uppercase/.test(decls) || /letter-spacing\s*:\s*(\.0[4-9]|\.[1-9]|0\.0[4-9]|0\.[1-9]|[1-9])/.test(decls)) return true;
  if (/font-family\s*:[^;]*(mono|Mono)/.test(decls)) return true;
  if (/font-weight\s*:\s*(700|800|900|bold)/.test(decls) && !/\b(p|li|td|dd)\b\s*$/.test(sel)) return true;
  const last = lastCompound(sel);
  if (/^(p|li|td|dd|blockquote|figcaption)\b/i.test(last) && !/[.#]/.test(last)) return false;
  return LABEL_SEL.test(last);
}
const SVG_SEL = /(^|[\s>+~,(])(svg|text|tspan|g|path|circle|rect|line|foreignObject)([\s.#:>\[+~,)]|$)/;

function px(value) {
  // font-size value -> px number, or null when it is relative or computed
  const v = value.trim().replace(/\s*!important\s*$/, '');
  let m = v.match(/^([\d.]+)px$/); if (m) return parseFloat(m[1]);
  m = v.match(/^([\d.]+)rem$/); if (m) return parseFloat(m[1]) * 16;
  m = v.match(/^([\d.]+)pt$/); if (m) return parseFloat(m[1]) * 4 / 3;
  m = v.match(/^clamp\(\s*([\d.]+)(px|rem)/); if (m) return null;   // fluid: leave it
  return null;
}
function fontShorthandPx(value) {
  const m = value.match(/(?:^|\s)([\d.]+)(px|rem|pt)(?:\s*\/|\s|$)/); if (!m) return null;
  return m[2] === 'px' ? parseFloat(m[1]) : m[2] === 'rem' ? parseFloat(m[1]) * 16 : parseFloat(m[1]) * 4 / 3;
}

const PHONE = 390;
function appliesOnPhone(prelude) {
  if (!prelude) return true;
  if (/\bprint\b/.test(prelude)) return false;
  let ok = true;
  prelude.replace(/min-width\s*:\s*([\d.]+)px/g, (_, n) => { if (PHONE < parseFloat(n)) ok = false; });
  prelude.replace(/max-width\s*:\s*([\d.]+)px/g, (_, n) => { if (PHONE > parseFloat(n)) ok = false; });
  return ok;
}
// Every font-size the css sets, in order: Map selector -> { size, floor } for the rule that wins at 390px.
function sizesOnPhone(css, eff) {
  let ast;
  try { ast = csstree.parse(css, { parseValue: false, parseAtrulePrelude: false, onParseError() {} }); } catch { return; }
  csstree.walk(ast, {
    visit: 'Rule',
    enter(rule) {
      if (this.atrule && /^(keyframes|-webkit-keyframes|font-face|page)$/.test(this.atrule.name)) return;
      if (this.atrule && this.atrule.name === 'media' && !appliesOnPhone(this.atrule.prelude ? csstree.generate(this.atrule.prelude) : '')) return;
      const sel = csstree.generate(rule.prelude);
      const decls = csstree.generate(rule.block);
      let size = null;
      rule.block.children.forEach((d) => {
        if (d.type !== 'Declaration') return;
        const val = csstree.generate(d.value);
        if (d.property === 'font-size') { const p = px(val); size = p == null ? Infinity : p; }   // relative or fluid: leave the selector alone
        else if (d.property === 'font') { const p = fontShorthandPx(val); if (p != null) size = p; }
      });
      if (size == null) return;
      for (const one of sel.split(/,(?![^(]*\))/)) {
        const s = one.trim();
        if (!s || SVG_SEL.test(s)) continue;
        eff.set(s, { size, floor: isLabel(s, decls) ? 13 : 15 });
      }
    }
  });
}
function floorsFor(csses) {
  const eff = new Map();
  for (const css of csses) sizesOnPhone(css, eff);
  const out = [];
  for (const [s, e] of eff) if (e.size < e.floor - 0.05) out.push([s, e.floor]);
  return out;
}

function fitBlock(pairs) {
  // group selectors by floor; newest rule for a selector wins
  const by = { 13: [], 15: [] }; const last = new Map();
  for (const [s, f] of pairs) last.set(s, f);
  for (const [s, f] of last) by[f].push(s);
  const chunk = (list, f) => { const rows = []; for (let i = 0; i < list.length; i += 6) rows.push(list.slice(i, i + 6).join(',')); return rows.length ? rows.join(',\n') + '{font-size:' + f + 'px!important}' : ''; };
  const body = [chunk(by[15], 15), chunk(by[13], 13)].filter(Boolean).join('\n');
  return body ? '@media (max-width:759px){\n' + body + '\n}' : '';
}

function localCss(rel, html) {
  const out = [];
  const re = /<link\b[^>]*rel=["']stylesheet["'][^>]*>/gi; let m;
  while ((m = re.exec(html))) {
    const h = (m[0].match(/href=["']([^"'?#]+)/) || [])[1];
    if (!h || /^https?:|^\/\//.test(h) || /\/shared\//.test(h) || h.startsWith('shared/')) continue;
    const abs = h.startsWith('/') ? h.slice(1) : path.posix.normalize(path.posix.join(path.posix.dirname(rel), h));
    const p = path.join(ROOT, abs);
    if (fs.existsSync(p)) out.push(fs.readFileSync(p, 'utf8').replace(/@import[^;]+;/g, ''));
  }
  return out;
}
function styleBlocks(html) {
  const out = []; const re = /<style\b(?![^>]*id=["']ace-fit["'])[^>]*>([\s\S]*?)<\/style>/gi; let m;
  while ((m = re.exec(html))) out.push(m[1]);
  return out;
}
function pageFloors(rel, html) { return floorsFor(localCss(rel, html).concat(styleBlocks(html))); }

let stale = 0;
function write(rel, next, prev) {
  if (next === prev) return;
  if (CHECK) { console.error('out of date: ' + rel); stale++; return; }
  fs.writeFileSync(path.join(ROOT, rel), next); console.log('fit ' + rel);
}

for (const [rel, fam] of Object.entries(PAGES)) {
  const file = path.join(ROOT, rel); if (!fs.existsSync(file)) { console.error('missing ' + rel); continue; }
  const prev = fs.readFileSync(file, 'utf8'); let html = prev;
  // 1. Google Fonts out
  html = html.replace(/[ \t]*<link\b[^>]*(fonts\.googleapis\.com|fonts\.gstatic\.com)[^>]*>\s*\n?/gi, '');
  // 2. skin attribute + link (always last in head, after the fit block)
  html = html.replace(/<html\b([^>]*)>/i, (all, attrs) => '<html' + attrs.replace(/\s*data-cream=["'][^"']*["']/, '') + ' data-cream="' + fam + '">');
  html = html.replace(/[ \t]*<link\b[^>]*\/shared\/ace-cream\.css[^>]*>\s*\n?/gi, '');
  html = html.replace(/[ \t]*<style id="ace-fit">[\s\S]*?<\/style>\s*\n?/i, '');
  const block = fitBlock(pageFloors(rel, html));
  const inject = (block ? '<style id="ace-fit">\n/* phone text floors, written by scripts/design/fit-pages.mjs. Do not edit by hand. */\n' + block + '\n</style>\n' : '') +
    '<link rel="stylesheet" href="/shared/ace-cream.css?v=' + CREAM_V + '">\n';
  html = html.replace(/<\/head>/i, inject + '</head>');
  write(rel, html, prev);
}

// the six PAT trainers: their floors live in a marked section of shared/ace-cream.css, scoped to the PAT family
{
  // a selector is floored only when every trainer that uses it sets it under the floor
  const shared = fs.readFileSync(path.join(ROOT, 'tools/pat/pat-cream.css'), 'utf8').replace(/@import[^;]+;/g, '');
  const want = new Map(); const veto = new Set();
  for (const rel of PAT_SHARED) {
    const html = fs.readFileSync(path.join(ROOT, rel), 'utf8');
    const eff = new Map();
    for (const css of (/pat-cream\.css/.test(html) ? [shared] : []).concat(styleBlocks(html))) sizesOnPhone(css, eff);
    for (const [sel, e] of eff) { if (e.size < e.floor - 0.05) want.set(sel, Math.max(e.floor, want.get(sel) || 0)); else veto.add(sel); }
  }
  const pairs = [...want].filter(([sel]) => !veto.has(sel));
  const SCOPE = ':is(html[data-cream~="pat"],html[data-cream~="tfe"]) ';
  const scoped = pairs.map(([sel, f]) => [/^(html|:root)\b/.test(sel) ? sel : SCOPE + sel, f]);
  const rel = 'shared/ace-cream.css';
  const prev = fs.readFileSync(path.join(ROOT, rel), 'utf8');
  const A = '/* BEGIN pat-fit (written by scripts/design/fit-pages.mjs) */', B = '/* END pat-fit */';
  const next = prev.slice(0, prev.indexOf(A) + A.length) + '\n' + fitBlock(scoped) + '\n' + prev.slice(prev.indexOf(B));
  write(rel, next, prev);
}
if (CHECK) { if (stale) { console.error('fit-pages: ' + stale + ' page(s) out of date; run node scripts/design/fit-pages.mjs'); process.exit(1); } console.log('fit-pages: OK'); }
