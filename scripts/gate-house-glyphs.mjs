#!/usr/bin/env node
// gate-house-glyphs.mjs : no em dashes and no emoji in what a student reads.
//
//   node gate-house-glyphs.mjs [repoRoot]                       strict: exit 1 on any occurrence
//   node gate-house-glyphs.mjs [repoRoot] --baseline FILE       ratchet: exit 1 only when a file
//                                                               has MORE than its baseline count
//   node gate-house-glyphs.mjs [repoRoot] --write-baseline FILE snapshot current counts, exit 0
//   add --en to count en dashes as well (the RC validator already bans them)
//
// Scanned: visible text of served .html (comments, <script>, <style> removed), string
// literals of inline scripts, and string literals of served .js/.mjs (vendor *.min.js and
// three.module.min.js skipped). Prints path:line with the glyph in context.
// Dependency-free, ~0.6 s.
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const ROOT = path.resolve(args.find((a) => !a.startsWith('--') && !args[args.indexOf(a) - 1]?.startsWith('--baseline') && !args[args.indexOf(a) - 1]?.startsWith('--write')) || '.');
const opt = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
const BASELINE = opt('--baseline'), WRITE = opt('--write-baseline'), EN = args.includes('--en');
const SKIP_REL = /^(node_modules|\.git|docs|research|specs|scripts|test-screenshots|\.netlify|netlify|\.claude|dist-astro|astro-proto)(\/|$)|^tests\/[^/]+\//;
const SKIP_SEG = /(^|\/)(research|verification)(\/|$)/;
function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name); const rel = path.relative(ROOT, p).split(path.sep).join('/');
    if (SKIP_REL.test(rel) || SKIP_SEG.test(rel)) continue;
    if (e.isDirectory()) walk(p, out); else out.push(rel);
  }
  return out;
}
const lineOf = (s, i) => s.slice(0, i).split('\n').length;
const blank = (m) => m.replace(/[^\n]/g, ' ');
const GLYPH = new RegExp('[\\u2014' + (EN ? '\\u2013' : '') + '\\u{1F000}-\\u{1FAFF}\\u{2600}-\\u{27BF}\\u{2B00}-\\u{2BFF}]', 'gu');

/* strings with offsets; comments and regex skipped */
const RX_WORDS = new Set(['return', 'typeof', 'case', 'do', 'else', 'in', 'of', 'new', 'delete', 'void', 'throw', 'yield', 'await']);
function jsStrings(src, base = 0) {
  const out = []; let i = 0; const n = src.length; let last = '';
  while (i < n) {
    const c = src[i];
    if (c === '/' && src[i + 1] === '/') { while (i < n && src[i] !== '\n') i++; continue; }
    if (c === '/' && src[i + 1] === '*') { const e = src.indexOf('*/', i + 2); i = e < 0 ? n : e + 2; continue; }
    if (c === '"' || c === "'" || c === '`') {
      const q = c, st = i; i++;
      while (i < n && src[i] !== q) { if (src[i] === '\\') { i += 2; continue; } if (q !== '`' && src[i] === '\n') break; if (q === '`' && src[i] === '$' && src[i + 1] === '{') { let d = 1; i += 2; while (i < n && d > 0) { if (src[i] === '{') d++; else if (src[i] === '}') d--; i++; } continue; } i++; }
      i++; out.push({ text: src.slice(st + 1, i - 1), offset: base + st + 1 }); last = 'str'; continue;
    }
    if (c === '/') {
      if (!last || /^[(,=:\[!&|?{};+\-*%<>~^]$/.test(last) || RX_WORDS.has(last)) { i++; let cls = false; while (i < n) { const d = src[i]; if (d === '\\') { i += 2; continue; } if (d === '\n') break; if (cls) { if (d === ']') cls = false; } else if (d === '[') cls = true; else if (d === '/') { i++; break; } i++; } while (i < n && /[a-z]/i.test(src[i])) i++; last = 'rx'; continue; }
      i++; last = '/'; continue;
    }
    if (/[A-Za-z_$]/.test(c)) { const s = i; while (i < n && /[\w$]/.test(src[i])) i++; last = src.slice(s, i); continue; }
    if (/\s/.test(c)) { i++; continue; }
    last = c; i++;
  }
  return out;
}

const counts = {}; const sites = {};
function hit(rel, src, idx, text) {
  counts[rel] = (counts[rel] || 0) + 1;
  if (!sites[rel]) sites[rel] = [];
  if (sites[rel].length < 3) sites[rel].push(`${rel}:${lineOf(src, idx)}  ...${text.replace(/\s+/g, ' ').trim()}...`);
}
let files = 0;
for (const rel of walk(ROOT)) {
  const ext = path.extname(rel).toLowerCase();
  if (!['.html', '.htm', '.js', '.mjs'].includes(ext) || /\.min\.js$|three\.module/.test(rel)) continue;
  const src = fs.readFileSync(path.join(ROOT, rel), 'utf8');
  if (!GLYPH.test(src)) continue; GLYPH.lastIndex = 0;
  files++;
  const scanText = (text, base) => { GLYPH.lastIndex = 0; let m; while ((m = GLYPH.exec(text))) hit(rel, src, base + m.index, text.slice(Math.max(0, m.index - 30), m.index + 30)); };
  if (ext === '.js' || ext === '.mjs') { for (const s of jsStrings(src)) scanText(s.text, s.offset); continue; }
  const html = src.replace(/<!--[\s\S]*?-->/g, blank);
  const scriptRe = /<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi; let sm;
  while ((sm = scriptRe.exec(html))) { if (/json|template/i.test(sm[1])) continue; const off = sm.index + sm[0].indexOf('>') + 1; for (const s of jsStrings(sm[2], off)) scanText(s.text, s.offset); }
  const text = html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, blank).replace(/<[^>]+>/g, blank);
  scanText(text, 0);
}
const total = Object.values(counts).reduce((a, b) => a + b, 0);
if (WRITE) { fs.writeFileSync(WRITE, JSON.stringify(counts, null, 1) + '\n'); console.log(`gate-house-glyphs: baseline written to ${WRITE} (${Object.keys(counts).length} files, ${total} glyphs)`); process.exit(0); }
const base = BASELINE ? JSON.parse(fs.readFileSync(BASELINE, 'utf8')) : {};
const over = Object.keys(counts).filter((f) => counts[f] > (base[f] || 0)).sort((a, b) => counts[b] - counts[a]);
if (over.length) {
  console.error(`gate-house-glyphs: ${over.length} file(s) with em dashes or emoji in student-visible text${BASELINE ? ' above their baseline' : ''} (${total} total in ${Object.keys(counts).length} files)`);
  for (const f of over) { console.error(`  ${String(counts[f]).padStart(5)}${BASELINE ? ` (baseline ${base[f] || 0})` : ''}  ${f}`); for (const s of sites[f]) console.error('        ' + s); }
  process.exit(1);
}
console.log(`gate-house-glyphs: OK (${total} glyphs in ${Object.keys(counts).length} files, none above baseline)`);
