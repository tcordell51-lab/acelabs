#!/usr/bin/env node
// check-no-competitor-names.mjs
//
// House rule: no outside DAT prep company is named on any page a student sees.
// Inside the product, another company's bank is "your question bank".
//
// What is scanned (everything under the repo root that the static deploy serves):
//   .html / .htm / .svg  visible text and attribute values (URL attributes such as
//                        href and src are skipped), inline <script> string literals,
//                        and JSON script blocks.
//   .js / .mjs / .cjs    string literals and template text. Comments, regex literals,
//                        object keys and file-path or URL tokens are skipped.
//   .json                string values (keys skipped).
//
// What is not scanned is listed in ALLOW below, each with the reason. Run with
// --show-allowed to print the mentions that the allowlist is holding back.
//
// Usage:  node scripts/check-no-competitor-names.mjs [--show-allowed]
// Exit 1 on any student-visible mention.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SHOW_ALLOWED = process.argv.includes('--show-allowed');

// ---------------------------------------------------------------------------
// Names. Each pattern is careful about real biology and math words: vaccine
// "boosters" (plural) and "booster shot/dose" pass, Kaplan-Meier passes, and
// Bohr only fails as "Bohr Prep".
// ---------------------------------------------------------------------------
const TERMS = [
  { name: 'Booster', re: /\b(?:dat[\s-]?)?booster(?:prep)?\b(?!\s+(?:shot|dose|vaccin|immuni|injection))/gi },
  { name: 'Booster', re: /datbooster|boosterprep/gi },
  { name: 'Bootcamp', re: /\b(?:dat[\s-]?)?boot[\s-]?camps?\b|datbootcamp/gi },
  { name: 'Kaplan', re: /\bkaplan\b(?!-meier|\s+meier)/gi },
  { name: 'Princeton Review', re: /\bprinceton\s+review\b/gi },
  { name: 'ACEDAT.app', re: /\bacedat\.app\b/gi },
  { name: 'DAT Destroyer', re: /\b(?:dat\s+)?destroyer\b|\borgoman\b/gi },
  { name: 'Feralis', re: /\bferalis\b/gi },
  { name: 'PATCrusher', re: /\bpat\s?crusher\b/gi },
  { name: 'Bohr Prep', re: /\bbohr\s?prep\b/gi },
  { name: 'Shemmassian', re: /\bshemmassian\b/gi },
  { name: 'Erudition', re: /\berudition\b/gi },
  { name: "Chad's Prep", re: /\bchad'?s\s?prep\b/gi },
  { name: 'Crack DAT', re: /\bcrack\s?dat\b/gi },
  { name: 'DAT Qvault', re: /\bq\s?vault\b/gi },
  { name: 'DAT Achiever', re: /\bdat\s+achiever\b/gi },
  { name: 'Gold Standard', re: /\bgold\s+standard\s+(?:dat|prep)\b/gi },
  { name: 'Mometrix', re: /\bmometrix\b/gi },
  { name: 'Examkrackers', re: /\bexam\s?krackers\b/gi },
  { name: 'UWorld', re: /\buworld\b/gi },
  { name: 'Blueprint Prep', re: /\bblueprint\s+prep\b/gi },
  { name: 'Magoosh', re: /\bmagoosh\b/gi }
];

// ---------------------------------------------------------------------------
// Allowlist: internal-only paths. A student never sees these.
// ---------------------------------------------------------------------------
const ALLOW = [
  { test: (p) => p.endsWith('.md'), why: 'README, planning and contract markdown (not linked from any page)' },
  { test: (p) => /^(docs|research|specs)\//.test(p), why: 'internal docs, research and specs (/docs/* redirects to the home page)' },
  { test: (p) => /(^|\/)research\//.test(p), why: 'per-tool research notes' },
  { test: (p) => /(^|\/)verification\//.test(p), why: 'blind re-solve and rejection records; no page loads them' },
  { test: (p) => /\.test\.(m?js|cjs)$/.test(p), why: 'node test code' },
  { test: (p) => p === 'scripts/check-no-competitor-names.mjs', why: 'this checker (it has to spell the names)' },
  { test: (p) => p === 'tools/organic/audio/cues.json', why: 'narration word timings, never rendered as text; clips n1-s3 and n5-s6 are muted in tools/organic/index.html until re-recorded' },
  { test: (p) => p === 'booster-map.html', why: 'legacy unlinked page held for a keep-or-delete decision' }
];

// Per-file data keys that hold internal audit notes and are never rendered.
const INTERNAL_KEYS = {
  'games/ochem-bank-1000.js': new Set(['issue'])
};

const SKIP_DIRS = new Set(['.git', 'node_modules', '.netlify', '.claude', 'test-screenshots', 'dist-astro', 'astro-proto']);
const EXTS = new Set(['.html', '.htm', '.svg', '.js', '.mjs', '.cjs', '.json']);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function walk(dir, out) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(ent.name)) continue;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(full, out);
    else if (ent.isFile() && EXTS.has(path.extname(ent.name).toLowerCase())) out.push(full);
  }
  return out;
}

function lineOf(src, offset) {
  let n = 1;
  for (let i = 0; i < offset && i < src.length; i++) if (src.charCodeAt(i) === 10) n++;
  return n;
}

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', middot: '.', mdash: '-', ndash: '-', rsquo: "'", lsquo: "'", hellip: '...' };
function decodeEntities(s) {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
    if (e[0] === '#') {
      const code = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : m;
    }
    return ENTITIES[e.toLowerCase()] ?? m;
  });
}

// A match inside a lowercase slug or a path/URL token (booster-map.html,
// bio/bio-ap-bootcamp, #node-x) is an address, not words a student reads.
function isAddressToken(text, start, end) {
  let a = start, b = end;
  const stop = /[\s'"`<>(),;=]/;
  while (a > 0 && !stop.test(text[a - 1])) a--;
  while (b < text.length && !stop.test(text[b])) b++;
  const tok = text.slice(a, b);
  if (/^(https?:|\/|\.\.?\/|#)/i.test(tok)) return true;
  if (/\.(html?|m?js|json|css|png|jpe?g|svg|webp|mp3|m4a|pdf)(\b|$)/i.test(tok)) return true;
  if (/^[a-z0-9._~%#?&:\/-]+$/.test(tok) && /[-_\/]/.test(tok)) return true;
  return false;
}

function findTerms(text) {
  const hits = [];
  for (const t of TERMS) {
    t.re.lastIndex = 0;
    let m;
    while ((m = t.re.exec(text))) {
      if (isAddressToken(text, m.index, m.index + m[0].length)) continue;
      hits.push({ term: t.name, index: m.index, match: m[0] });
    }
  }
  return hits;
}

// ---------------------------------------------------------------------------
// JS lexer: yields string literal and template text with offsets, skipping
// comments and regex literals, and tags each string with the object key it is
// the value of (or marks it as a key itself).
// ---------------------------------------------------------------------------
const REGEX_AFTER_WORDS = new Set(['return', 'typeof', 'case', 'do', 'else', 'in', 'of', 'new', 'delete', 'void', 'throw', 'instanceof', 'yield', 'await']);

function lexJs(src, base = 0) {
  const out = [];
  const toks = []; // recent significant tokens: {type, value}
  const push = (type, value) => { toks.push({ type, value }); if (toks.length > 4) toks.shift(); };
  const prev = (k = 1) => toks[toks.length - k];

  function keyContext() {
    // ... { key : <string>  or  , key : <string>
    const p1 = prev(1), p2 = prev(2), p3 = prev(3);
    if (p1 && p1.type === 'punc' && p1.value === ':' && p2 && (p2.type === 'ident' || p2.type === 'str') && p3 && p3.type === 'punc' && (p3.value === '{' || p3.value === ',')) return p2.value;
    return null;
  }

  function regexAllowed() {
    const p = prev();
    if (!p) return true;
    if (p.type === 'punc') return !(p.value === ')' || p.value === ']');
    if (p.type === 'ident') return REGEX_AFTER_WORDS.has(p.value);
    return false;
  }

  let i = 0;
  const n = src.length;

  function readString(q) {
    const start = i;
    i++;
    let val = '';
    while (i < n && src[i] !== q) {
      if (src[i] === '\\') {
        const c = src[i + 1];
        if (c === 'n') val += '\n';
        else if (c === 't') val += '\t';
        else if (c === 'u' && /^[0-9a-fA-F]{4}$/.test(src.slice(i + 2, i + 6))) { val += String.fromCharCode(parseInt(src.slice(i + 2, i + 6), 16)); i += 4; }
        else if (c === '\n') { /* line continuation */ }
        else val += c;
        i += 2;
        continue;
      }
      if (src[i] === '\n') break; // unterminated, stop at line end
      val += src[i++];
    }
    i++;
    return { start, val };
  }

  function lexTemplate() {
    // i at opening backtick
    i++;
    let segStart = i, val = '';
    const flush = () => { if (val) out.push({ text: val, offset: base + segStart, key: null, isKey: false }); val = ''; };
    while (i < n && src[i] !== '`') {
      if (src[i] === '\\') { val += src[i + 1] || ''; i += 2; continue; }
      if (src[i] === '$' && src[i + 1] === '{') {
        flush();
        i += 2;
        lexUntilBrace();
        segStart = i;
        continue;
      }
      val += src[i++];
    }
    flush();
    i++;
  }

  function lexUntilBrace() {
    let depth = 0;
    while (i < n) {
      const c = src[i];
      if (c === '}' && depth === 0) { i++; return; }
      if (c === '{') depth++;
      if (c === '}') depth--;
      step();
    }
  }

  function step() {
    const c = src[i];
    if (c === '/' && src[i + 1] === '/') { while (i < n && src[i] !== '\n') i++; return; }
    if (c === '/' && src[i + 1] === '*') { const e = src.indexOf('*/', i + 2); i = e < 0 ? n : e + 2; return; }
    if (c === '"' || c === "'") {
      const key = keyContext();
      const s = readString(c);
      // Is this string itself an object key?  { 'name': ...
      let j = i; while (j < n && /\s/.test(src[j])) j++;
      const p = prev();
      const isKey = src[j] === ':' && p && p.type === 'punc' && (p.value === '{' || p.value === ',');
      out.push({ text: s.val, offset: base + s.start, key, isKey });
      push('str', s.val);
      return;
    }
    if (c === '`') { lexTemplate(); push('str', ''); return; }
    if (c === '/') {
      if (regexAllowed()) {
        i++;
        let inClass = false;
        while (i < n) {
          const d = src[i];
          if (d === '\\') { i += 2; continue; }
          if (d === '\n') break;
          if (inClass) { if (d === ']') inClass = false; }
          else if (d === '[') inClass = true;
          else if (d === '/') { i++; break; }
          i++;
        }
        while (i < n && /[a-z]/i.test(src[i])) i++;
        push('regex', '');
        return;
      }
      i++; push('punc', '/'); return;
    }
    if (/[A-Za-z_$]/.test(c)) {
      const s = i; while (i < n && /[\w$]/.test(src[i])) i++;
      push('ident', src.slice(s, i)); return;
    }
    if (/[0-9]/.test(c)) { while (i < n && /[\w.]/.test(src[i])) i++; push('num', ''); return; }
    if (/\s/.test(c)) { i++; return; }
    i++; push('punc', c);
  }

  while (i < n) step();
  return out;
}

// ---------------------------------------------------------------------------
// HTML scanner: text, attributes, inline scripts.
// ---------------------------------------------------------------------------
const URL_ATTRS = new Set(['href', 'src', 'srcset', 'action', 'formaction', 'poster', 'xlink:href', 'cite', 'data-src', 'data-href', 'background', 'manifest']);

function scanHtml(src, report) {
  // Blank out comments so offsets stay true.
  const blank = (s) => s.replace(/[^\n]/g, ' ');
  let html = src.replace(/<!--[\s\S]*?-->/g, blank);

  // Scripts and styles.
  html = html.replace(/<(script|style)\b([^>]*)>([\s\S]*?)<\/\1\s*>/gi, (whole, tag, attrs, body, off) => {
    const bodyOff = off + whole.indexOf('>') + 1;
    if (tag.toLowerCase() === 'script') {
      const type = (attrs.match(/\btype\s*=\s*["']?([^"'\s>]+)/i) || [])[1] || '';
      if (/json/i.test(type)) {
        for (const s of lexJs(body, bodyOff)) report(s.text, s.offset, 'json-script');
      } else if (!type || /javascript|module|babel/i.test(type)) {
        for (const s of lexJs(body, bodyOff)) {
          if (s.isKey) continue;
          report(s.text, s.offset, 'script');
        }
      } else {
        report(decodeEntities(body.replace(/<[^>]*>/g, ' ')), bodyOff, 'template');
      }
    }
    // Keep the open tag (for its attributes), blank the body.
    return whole.slice(0, whole.indexOf('>') + 1) + blank(body) + blank(whole.slice(whole.indexOf('>') + 1 + body.length));
  });

  // Tags and attributes.
  const tagRe = /<([a-zA-Z][\w:-]*)((?:\s+[^\s=>\/]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?)*)\s*\/?>/g;
  let m, last = 0;
  while ((m = tagRe.exec(html))) {
    // Text before this tag.
    const text = html.slice(last, m.index);
    if (text.trim()) report(decodeEntities(text), last, 'text');
    last = m.index + m[0].length;
    const attrs = m[2];
    const attrRe = /([^\s=>\/]+)(?:\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
    let a;
    const attrsOff = m.index + 1 + m[1].length;
    while ((a = attrRe.exec(attrs))) {
      const name = a[1].toLowerCase();
      const val = a[3] ?? a[4] ?? a[5];
      if (val == null || URL_ATTRS.has(name)) continue;
      const valOff = attrsOff + a.index + a[0].indexOf(val);
      if (name.startsWith('on')) {
        for (const s of lexJs(decodeEntities(val), valOff)) report(s.text, s.offset, 'attr:' + name);
      } else {
        report(decodeEntities(val), valOff, 'attr:' + name);
      }
    }
  }
  const tail = html.slice(last);
  if (tail.trim()) report(decodeEntities(tail), last, 'text');
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------
const files = walk(ROOT, []).sort();
const violations = [];
const allowed = [];

for (const full of files) {
  const rel = path.relative(ROOT, full).split(path.sep).join('/');
  const allow = ALLOW.find((a) => a.test(rel));
  const src = fs.readFileSync(full, 'utf8');
  // Fast path: no candidate word anywhere in the file.
  let any = false;
  for (const t of TERMS) { t.re.lastIndex = 0; if (t.re.test(src)) { any = true; break; } }
  if (!any) continue;

  const ext = path.extname(rel).toLowerCase();
  const internalKeys = INTERNAL_KEYS[rel];
  const found = [];
  const report = (text, offset, where, key) => {
    if (key && internalKeys && internalKeys.has(key)) return;
    for (const h of findTerms(text)) {
      const ctx = text.slice(Math.max(0, h.index - 50), h.index + h.match.length + 50).replace(/\s+/g, ' ').trim();
      found.push({ rel, line: lineOf(src, offset + h.index), term: h.term, where, ctx });
    }
  };

  if (ext === '.html' || ext === '.htm' || ext === '.svg') {
    scanHtml(src, (text, offset, where) => report(text, offset, where));
  } else if (ext === '.json') {
    let parsed, ok = true;
    try { parsed = JSON.parse(src); } catch { ok = false; }
    if (ok) {
      const visit = (v, key) => {
        if (typeof v === 'string') {
          if (key && internalKeys && internalKeys.has(key)) return;
          for (const h of findTerms(v)) {
            const idx = src.indexOf(JSON.stringify(v).slice(1, -1));
            const ctx = v.slice(Math.max(0, h.index - 50), h.index + h.match.length + 50).replace(/\s+/g, ' ').trim();
            found.push({ rel, line: idx >= 0 ? lineOf(src, idx) : 1, term: h.term, where: 'json:' + (key ?? '[]'), ctx });
          }
        } else if (Array.isArray(v)) v.forEach((x) => visit(x, key));
        else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) visit(x, k);
      };
      visit(parsed, null);
    } else {
      for (const s of lexJs(src)) if (!s.isKey) report(s.text, s.offset, 'json', s.key);
    }
  } else {
    for (const s of lexJs(src)) if (!s.isKey) report(s.text, s.offset, 'string', s.key);
  }

  if (!found.length) continue;
  if (allow) allowed.push(...found.map((f) => ({ ...f, why: allow.why })));
  else violations.push(...found);
}

if (SHOW_ALLOWED && allowed.length) {
  console.log(`Allowlisted (internal-only) mentions: ${allowed.length}`);
  const byFile = new Map();
  for (const a of allowed) byFile.set(a.rel, (byFile.get(a.rel) || { n: 0, why: a.why })), byFile.get(a.rel).n++;
  for (const [rel, { n, why }] of byFile) console.log(`  ${rel} (${n}): ${why}`);
  console.log('');
}

if (violations.length) {
  console.error(`check-no-competitor-names: ${violations.length} student-visible mention(s) of an outside prep company.\n`);
  for (const v of violations) console.error(`  ${v.rel}:${v.line}  [${v.term}] (${v.where})  ...${v.ctx}...`);
  console.error('\nRewrite in neutral words ("your question bank"), or, if the file is truly internal, add it to ALLOW with a reason.');
  process.exit(1);
}
console.log(`check-no-competitor-names: OK (${files.length} files scanned, no student-visible mentions).`);
