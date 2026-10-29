#!/usr/bin/env node
// gate-placeholders.mjs : no unreplaced template tokens on a served page.
//
//   node gate-placeholders.mjs [repoRoot]        exit 1 on any hit, prints path:line
//
// Scans the visible text of every served .html (comments, <script> and <style>
// bodies removed) and every string value of served .json for
//   ALLCAPS_WITH_UNDERSCORES tokens (SPINE_SENTENCE, HERO_TITLE ...)
//   {{ mustache }} tokens, TKTK, PLACEHOLDER, Lorem ipsum, [TODO ...], [TBD ...]
//   the Bio card placeholders "(question)", "(answer)", "Review the explanation."
// Dependency-free, ~0.2 s.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(process.argv[2] || '.');
const SKIP_REL = /^(node_modules|\.git|docs|research|specs|scripts|test-screenshots|\.netlify|netlify|\.claude|dist-astro|astro-proto)(\/|$)|^tests\/[^/]+\//;
const SKIP_SEG = /(^|\/)(research|verification)(\/|$)/;
function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    const rel = path.relative(ROOT, p).split(path.sep).join('/');
    if (SKIP_REL.test(rel) || SKIP_SEG.test(rel)) continue;
    if (e.isDirectory()) walk(p, out); else out.push(rel);
  }
  return out;
}
const lineOf = (s, i) => s.slice(0, i).split('\n').length;
const blank = (m) => m.replace(/[^\n]/g, ' ');
// Visible text only, same length as the source so offsets map to lines.
function htmlText(src) {
  return src.replace(/<!--[\s\S]*?-->/g, blank)
    .replace(/<(script|style|pre|code)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, blank)
    .replace(/<[^>]+>/g, blank);
}
const TOKENS = [
  /\b[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)+\b/g,                 // SPINE_SENTENCE
  /\{\{\s*[\w.]+\s*\}\}/g,                              // {{title}}
  /\bTKTK\b|\bPLACEHOLDER\b|\[(?:TODO|TBD|FIXME)\b[^\]]*\]/g,     // case-sensitive: prose may say "placeholder"
  /\bLorem ipsum\b/gi,
  /\(question\)|\(answer\)|Review the explanation\./g,  // Bio card placeholders
];
const hits = [];
function scan(rel, text, src) {
  for (const re of TOKENS) {
    re.lastIndex = 0; let m;
    while ((m = re.exec(text))) {
      if (m[0].length < 6 && /^[A-Z_0-9]+$/.test(m[0])) continue; // short caps like "A_B"
      const ctx = text.slice(Math.max(0, m.index - 40), m.index + m[0].length + 40).replace(/\s+/g, ' ').trim();
      hits.push(`${rel}:${lineOf(src, m.index)}  ${m[0]}  ...${ctx}...`);
    }
  }
}
let n = 0;
for (const rel of walk(ROOT)) {
  const ext = path.extname(rel).toLowerCase();
  if (ext !== '.html' && ext !== '.htm' && ext !== '.json') continue;
  n++;
  const src = fs.readFileSync(path.join(ROOT, rel), 'utf8');
  if (ext === '.json') {
    let v; try { v = JSON.parse(src); } catch { continue; }
    const strings = [];
    (function visit(x) { if (typeof x === 'string') strings.push(x); else if (Array.isArray(x)) x.forEach(visit); else if (x && typeof x === 'object') Object.values(x).forEach(visit); })(v);
    for (const s of strings) for (const re of TOKENS) { re.lastIndex = 0; const m = re.exec(s); if (m && !(m[0].length < 6 && /^[A-Z_0-9]+$/.test(m[0]))) { const i = src.indexOf(s.slice(0, 40)); hits.push(`${rel}:${i >= 0 ? lineOf(src, i) : 1}  ${m[0]}  ...${s.slice(0, 80)}...`); } }
  } else scan(rel, htmlText(src), src);
}
if (hits.length) {
  console.error(`gate-placeholders: ${hits.length} unreplaced placeholder(s) on served pages (${n} files scanned)`);
  for (const h of hits) console.error('  ' + h);
  process.exit(1);
}
console.log(`gate-placeholders: OK (${n} files, no placeholder tokens)`);
