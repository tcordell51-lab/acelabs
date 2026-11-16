#!/usr/bin/env node
// scrub-house-glyphs.mjs : rewrite em dashes, en dashes, emoji, glyph icons and exclamation
// marks out of what a student reads (house rules, 2026-11-16).
//
//   node scripts/scrub-house-glyphs.mjs            dry run: counts per file and samples
//   node scripts/scrub-house-glyphs.mjs --write    rewrite the files
//
// Only student-visible text is touched:
//   .html  text between tags (not <script>, <style> or comments), the attributes title, alt,
//          aria-label, placeholder, content and data-title, string literals of inline scripts,
//          and JSON script blocks.
//   .js    string literals and template text (comments, regex literals and code untouched).
//   .json  string values.
// Skipped: the same internal folders gate-house-glyphs.mjs skips, plus vendor libraries.
//
// Rules
//   em dash   between words -> ": " when what comes before is a short label (5 words or fewer,
//             no comma), otherwise ", ". Between digits -> " to ". In <title> -> " · ".
//             Alone (a placeholder cell) -> "-". At the start or end of a run -> removed.
//   en dash   between words with spaces -> as the em dash. Anywhere next to a digit, a single
//             letter or a bracket (ranges, bonds, minus signs) -> "-". Alone -> "-".
//   emoji and icon glyphs (U+1F000-1FAFF, U+2600-27BF, U+2B00-2BFF, U+23E9-23FA, U+25B6, U+25C0,
//             U+FE0F) -> removed with one neighbouring space. Arrows and math symbols stay.
//   "!" ending a word -> "." (never !=, !important or code).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const WRITE = process.argv.includes('--write');
const ONLY = process.argv.filter((a) => !a.startsWith('--')).slice(2);
const SKIP_REL = /^(node_modules|\.git|docs|research|specs|scripts|test-screenshots|\.netlify|netlify|\.claude|dist-astro|astro-proto|design)(\/|$)|^tests\/[^/]+\//;
const SKIP_SEG = /(^|\/)(research|verification|source|audio)(\/|$)/;
const VENDOR = /(\.min\.js$|three\.module|smiles-drawer|anime\.min|rdkit|katex|chart\.umd)/i;

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name); const rel = path.relative(ROOT, p).split(path.sep).join('/');
    if (SKIP_REL.test(rel) || SKIP_SEG.test(rel)) continue;
    if (e.isDirectory()) walk(p, out); else if (/\.(html?|js|mjs|json)$/i.test(e.name) && !VENDOR.test(rel)) out.push(rel);
  }
  return out;
}

const EMOJI = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{23E9}-\u{23FA}▶◀]️?|️/gu;
const isMathTok = (t) => /\d/.test(t) || /^[A-Za-z]$/.test(t) || /[)\]}^]$/.test(t) || /^[(\[{]/.test(t) || /^[A-Z][a-z]?$/.test(t);

function fixText(s, ctx) {
  let n = 0;
  // entities and escapes that render as dashes count too (2026-11-16 QA found them on 12 pages)
  s = s.replace(/&mdash;|&#8212;|&#x2014;|\\u2014/gi, '\u2014').replace(/&ndash;|&#8211;|&#x2013;|\\u2013/gi, '\u2013');
  if (!/[–—!\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{23E9}-\u{23FA}▶◀️]/u.test(s)) return { s, n };
  // emoji and icon glyphs
  s = s.replace(new RegExp('[ \\u00a0]?(?:' + EMOJI.source + ')+[ \\u00a0]?', 'gu'), (m, off, all) => {
    n++;
    const before = all[off - 1], after = all[off + m.length];
    const lead = /^[  ]/.test(m), trail = /[  ]$/.test(m);
    if (lead && trail && before && after) return ' ';
    return '';
  });
  // dashes
  s = s.replace(/([  ]*)([–—])([  ]*)/g, (m, sp1, d, sp2, off, all) => {
    const before = all.slice(0, off), after = all.slice(off + m.length);
    let lt = (before.match(/(\S+)$/) || [, ''])[1], rt = (after.match(/^(\S+)/) || [, ''])[1];
    if (/>$/.test(lt)) lt = '';                // right after a tag
    if (/^</.test(rt)) rt = '';                // right before a tag
    n++;
    const chem = (t) => /[0-9\u2080-\u2089\u2070-\u209f)\]]$|^[(\[0-9]|[A-Z]/.test(t);
    if (!sp1 && !sp2 && lt && rt && chem(lt.slice(-3)) && chem(rt.slice(0, 3))) return '-';   // a bond: (CH3)2-CH-Cl
    if (!lt && !rt) return (sp1 && sp2) ? ' - ' : '-';
    if (d === '\u2013' && !sp2 && rt) return (sp1 ? ' ' : '') + '-';   // a bond or sign: "-NH2", "-3"
    if (!lt) return sp1 ? ', ' : '';          // dash after a tag or at a run start
    if (!rt) return sp2 ? (ctx === 'js' ? ': ' : ', ') : '';   // dash before a tag or ${...}
    if (d === '–') {
      if (isMathTok(lt) || isMathTok(rt) || (!sp1 && !sp2)) return (sp1 || sp2) ? ' - ' : '-';
    } else {
      if (/\d$/.test(lt) && /^\d/.test(rt)) return ' to ';
      if (ctx === 'title') return ' · ';
    }
    // a short label before the dash takes a colon; otherwise a comma
    const run = before.split(/[.?:;>\n"“(]|^/).pop();
    const words = run.trim().split(/\s+/).filter(Boolean);
    if (words.length && words.length <= 5 && !/,/.test(run) && !/^[a-z]/.test(words[0]) && !/[,:;]$/.test(lt)) return ': ';
    return /[,:;]$/.test(lt) ? ' ' : ', ';
  });
  // exclamation marks that end a word or a quote
  s = s.replace(/([A-Za-z]{2,})!+\)/g, (m, a) => { n++; return a + ')'; });
  // (never after a digit, a bracket or a lone letter, so factorials such as 6! and n! stay)
  s = s.replace(/([A-Za-z]{2,}|[A-Za-z]{2,}['"’”])!+(?=[\s"'’”<`)\]]|$)/g, (m, a) => { n++; return a + '.'; });
  s = s.replace(/ ,/g, ',').replace(/,,/g, ',').replace(/:\s*:/g, ':').replace(/\.\.(?!\.)/g, '.');
  return { s, n };
}

/* JS string literals (and template text) with offsets; comments and regex literals skipped. */
const RX_WORDS = new Set(['return', 'typeof', 'case', 'do', 'else', 'in', 'of', 'new', 'delete', 'void', 'throw', 'yield', 'await']);
function fixJs(src) {
  let out = '', i = 0, n = src.length, last = '', changed = 0, from = 0;
  const flush = (to) => { out += src.slice(from, to); from = to; };
  while (i < n) {
    const c = src[i];
    if (c === '/' && src[i + 1] === '/') { while (i < n && src[i] !== '\n') i++; continue; }
    if (c === '/' && src[i + 1] === '*') { const e = src.indexOf('*/', i + 2); i = e < 0 ? n : e + 2; continue; }
    if (c === '"' || c === "'" || c === '`') {
      const q = c, st = i; i++;
      const parts = []; let segStart = i;
      while (i < n && src[i] !== q) {
        if (src[i] === '\\') { i += 2; continue; }
        if (q !== '`' && src[i] === '\n') break;
        if (q === '`' && src[i] === '$' && src[i + 1] === '{') {
          parts.push([segStart, i]); let d = 1; i += 2;
          const exprStart = i;
          while (i < n && d > 0) { if (src[i] === '{') d++; else if (src[i] === '}') d--; if (d > 0) i++; else break; }
          parts.push(['expr', exprStart, i]); i++; segStart = i; continue;
        }
        i++;
      }
      parts.push([segStart, i]);
      flush(st + 1);
      for (const p of parts) {
        if (p[0] === 'expr') { out += '${' + fixJs(src.slice(p[1], p[2])).src + '}'; changed += 0; continue; }
        const txt = src.slice(p[0], p[1]);
        const r = fixText(txt, 'js'); changed += r.n; out += r.s;
      }
      from = i; i++; last = 'str'; continue;
    }
    if (c === '/') {
      if (!last || /^[(,=:\[!&|?{};+\-*%<>~^]$/.test(last) || RX_WORDS.has(last)) {
        i++; let cls = false;
        while (i < n) { const d = src[i]; if (d === '\\') { i += 2; continue; } if (d === '\n') break; if (cls) { if (d === ']') cls = false; } else if (d === '[') cls = true; else if (d === '/') { i++; break; } i++; }
        while (i < n && /[a-z]/i.test(src[i])) i++; last = 'rx'; continue;
      }
      i++; last = '/'; continue;
    }
    if (/\s/.test(c)) { i++; continue; }
    if (/[A-Za-z_$]/.test(c)) { const st = i; while (i < n && /[\w$]/.test(src[i])) i++; last = src.slice(st, i); continue; }
    if (/[0-9]/.test(c)) { while (i < n && /[\w.]/.test(src[i])) i++; last = '0'; continue; }
    last = c; i++;
  }
  flush(n);
  return { src: out, n: changed };
}

function fixJson(src) {
  let n = 0;
  const s = src.replace(/"((?:[^"\\]|\\.)*)"(\s*:)?/g, (m, body, colon) => {
    if (colon) return m;   // keys stay
    const r = fixText(body, 'json'); n += r.n; return '"' + r.s + '"';
  });
  return { src: s, n };
}

const ATTRS = /(\s(?:title|alt|aria-label|placeholder|content|data-title)\s*=\s*)("([^"]*)"|'([^']*)')/gi;
function fixHtml(src) {
  let n = 0, out = '', i = 0;
  const re = /<!--[\s\S]*?-->|<script\b([^>]*)>([\s\S]*?)<\/script>|<style\b[^>]*>[\s\S]*?<\/style>|<title>([\s\S]*?)<\/title>|<[^>]+>/gi;
  let m;
  while ((m = re.exec(src))) {
    const text = src.slice(i, m.index); const r = fixText(text, 'html'); n += r.n; out += r.s;
    const tag = m[0];
    if (tag.startsWith('<!--') || /^<style/i.test(tag)) out += tag;
    else if (/^<script/i.test(tag)) {
      const attrs = m[1] || '', body = m[2] || '';
      if (/\bsrc=/.test(attrs)) out += tag;
      else if (/application\/(ld\+)?json/i.test(attrs)) { const j = fixJson(body); n += j.n; out += tag.replace(body, () => j.src); }
      else if (/text\/(template|html|plain)|x-template/i.test(attrs)) { const r2 = fixText(body, 'html'); n += r2.n; out += tag.replace(body, () => r2.s); }
      else { const j = fixJs(body); n += j.n; out += tag.slice(0, tag.length - body.length - 9) + j.src + '</script>'; }
    } else if (/^<title>/i.test(tag)) {
      const r3 = fixText(m[3], 'title'); n += r3.n; out += '<title>' + r3.s + '</title>';
    } else {
      out += tag.replace(ATTRS, (a, pre, q, d1, d2) => { const v = d1 != null ? d1 : d2; const r4 = fixText(v, 'attr'); n += r4.n; const qq = d1 != null ? '"' : "'"; return pre + qq + r4.s + qq; });
    }
    i = m.index + tag.length;
  }
  const r = fixText(src.slice(i), 'html'); n += r.n; out += r.s;
  return { src: out, n };
}

const files = ONLY.length ? ONLY : walk(ROOT);
let total = 0, touched = 0;
const report = [];
for (const rel of files) {
  const p = path.join(ROOT, rel);
  const src = fs.readFileSync(p, 'utf8');
  const r = /\.html?$/i.test(rel) ? fixHtml(src) : /\.json$/i.test(rel) ? fixJson(src) : fixJs(src);
  if (r.n && r.src !== src) {
    total += r.n; touched++; report.push([r.n, rel]);
    if (/\.json$/i.test(rel)) { try { JSON.parse(r.src); } catch (e) { console.error('JSON broke, skipped:', rel, e.message); continue; } }
    if (WRITE) fs.writeFileSync(p, r.src);
  }
}
report.sort((a, b) => b[0] - a[0]).slice(0, 40).forEach(([k, f]) => console.log(String(k).padStart(6), f));
console.log(`${WRITE ? 'rewrote' : 'would rewrite'} ${total} glyphs in ${touched} files`);
