#!/usr/bin/env node
// gate-dead-links.mjs : every local href/src on a served page, and every root-relative
// path literal in served JavaScript, points at a file that exists in the deploy.
//
//   node gate-dead-links.mjs [repoRoot]      exit 1 on a missing target, prints path:line url
//
// HTML: href, src, poster, action, formaction, data-src, data-href, srcset (comments removed).
// JS (.js/.mjs and inline <script>): string literals shaped like "/dir/file.ext" (comments
// and regex literals skipped). Redirects in _redirects and netlify.toml count as existing.
// External, mailto:, tel:, data:, javascript:, #fragment and template (${...}) values are skipped.
// Dependency-free, ~0.5 s.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(process.argv[2] || '.');
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

/* redirects: exact "from" and "prefix/*" */
const redirects = [];
const addFrom = (f) => { f = f.trim(); if (!f) return; redirects.push(f.endsWith('/*') ? { prefix: f.slice(0, -1) } : { exact: f }); };
if (fs.existsSync(path.join(ROOT, '_redirects'))) for (const l of fs.readFileSync(path.join(ROOT, '_redirects'), 'utf8').split('\n')) { const t = l.trim(); if (t && !t.startsWith('#')) addFrom(t.split(/\s+/)[0]); }
if (fs.existsSync(path.join(ROOT, 'netlify.toml'))) for (const m of fs.readFileSync(path.join(ROOT, 'netlify.toml'), 'utf8').matchAll(/^\s*from\s*=\s*"([^"]+)"/gm)) addFrom(m[1]);
const redirected = (u) => redirects.some((r) => r.exact ? r.exact === u || r.exact === u.replace(/\/$/, '') : u.startsWith(r.prefix));

function exists(u, fromRel) {
  u = u.split('#')[0].split('?')[0];
  if (!u) return true;
  if (u === '/' ) return true;
  if (redirected(u)) return true;
  let p = u.startsWith('/') ? path.join(ROOT, u) : path.join(ROOT, path.dirname(fromRel), u);
  if (!p.startsWith(ROOT)) return true;
  if (fs.existsSync(p)) { if (fs.statSync(p).isDirectory()) return fs.existsSync(path.join(p, 'index.html')) || u.endsWith('/') && fs.existsSync(path.join(p, 'index.html')); return true; }
  return false;
}
const SKIP_URL = /^(https?:|mailto:|tel:|data:|javascript:|blob:|#|\/\/|\/\.netlify\/|\/api\/)/i;

/* tiny JS lexer: string literals with offsets, comments and regex skipped */
const RX_WORDS = new Set(['return', 'typeof', 'case', 'do', 'else', 'in', 'of', 'new', 'delete', 'void', 'throw', 'yield', 'await']);
function jsStrings(src, base = 0) {
  const out = []; let i = 0; const n = src.length; let last = '';
  while (i < n) {
    const c = src[i];
    if (c === '/' && src[i + 1] === '/') { while (i < n && src[i] !== '\n') i++; continue; }
    if (c === '/' && src[i + 1] === '*') { const e = src.indexOf('*/', i + 2); i = e < 0 ? n : e + 2; continue; }
    if (c === '"' || c === "'" || c === '`') {
      const q = c, st = i; i++; let t = '';
      while (i < n && src[i] !== q) {
        if (src[i] === '\\') { t += src[i + 1] || ''; i += 2; continue; }
        if (q !== '`' && src[i] === '\n') break;
        if (q === '`' && src[i] === '$' && src[i + 1] === '{') { let d = 1; i += 2; while (i < n && d > 0) { if (src[i] === '{') d++; else if (src[i] === '}') d--; i++; } t += '${}'; continue; }
        t += src[i++];
      }
      i++; out.push({ text: t, offset: base + st }); last = 'str'; continue;
    }
    if (c === '/') {
      if (!last || /^[(,=:\[!&|?{};+\-*%<>~^]$/.test(last) || RX_WORDS.has(last)) {
        i++; let cls = false;
        while (i < n) { const d = src[i]; if (d === '\\') { i += 2; continue; } if (d === '\n') break; if (cls) { if (d === ']') cls = false; } else if (d === '[') cls = true; else if (d === '/') { i++; break; } i++; }
        while (i < n && /[a-z]/i.test(src[i])) i++; last = 'rx'; continue;
      }
      i++; last = '/'; continue;
    }
    if (/[A-Za-z_$]/.test(c)) { const s = i; while (i < n && /[\w$]/.test(src[i])) i++; last = src.slice(s, i); continue; }
    if (/\s/.test(c)) { i++; continue; }
    last = c; i++;
  }
  return out;
}
const PATH_LIT = /^\/(?:[\w.-]+\/)*[\w.-]+\.(?:html?|m?js|css|json|svg|png|jpe?g|webp|gif|mp3|m4a|wav|webm|mp4|pdf|ico|txt|woff2?)$/i;

const missing = [];
let checked = 0;
for (const rel of walk(ROOT)) {
  const ext = path.extname(rel).toLowerCase();
  if (!['.html', '.htm', '.js', '.mjs'].includes(ext)) continue;
  const src = fs.readFileSync(path.join(ROOT, rel), 'utf8');
  const seen = new Set();
  const report = (u, idx) => { const k = u; if (seen.has(k)) return; seen.add(k); missing.push(`${rel}:${lineOf(src, idx)}  ${u}`); };
  if (ext === '.js' || ext === '.mjs') {
    for (const s of jsStrings(src)) if (PATH_LIT.test(s.text)) { checked++; if (!exists(s.text, rel)) report(s.text, s.offset); }
    continue;
  }
  const html = src.replace(/<!--[\s\S]*?-->/g, blank);
  // inline scripts
  const scriptRe = /<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi; let sm;
  while ((sm = scriptRe.exec(html))) {
    if (/type\s*=\s*["']?(?:application\/(?:ld\+)?json|text\/(?:template|x-template|plain))/i.test(sm[1])) continue;
    const bodyOff = sm.index + sm[0].indexOf('>') + 1;
    for (const s of jsStrings(sm[2], bodyOff)) if (PATH_LIT.test(s.text)) { checked++; if (!exists(s.text, rel)) report(s.text, s.offset); }
  }
  // attributes (script and style bodies blanked so JS-built markup is not read as attributes)
  const markup = html.replace(/<(script|style)\b([^>]*)>([\s\S]*?)<\/\1\s*>/gi, (w, tag, attrs, body) => w.slice(0, w.indexOf('>') + 1) + blank(body) + blank(w.slice(w.indexOf('>') + 1 + body.length)));
  const attrRe = /(?<![\w-])(href|src|poster|action|formaction|data-src|data-href|srcset)\s*=\s*("([^"]*)"|'([^']*)')/gi; let m;
  while ((m = attrRe.exec(markup))) {
    const raw = (m[3] ?? m[4] ?? '').trim();
    const urls = m[1].toLowerCase() === 'srcset' ? raw.split(',').map((x) => x.trim().split(/\s+/)[0]) : [raw];
    for (const u of urls) {
      if (!u || SKIP_URL.test(u) || u.includes('${') || u.includes('{{')) continue;
      checked++;
      if (!exists(u, rel)) report(u, m.index);
    }
  }
}
if (missing.length) {
  console.error(`gate-dead-links: ${missing.length} link(s) point at files that do not exist (${checked} checked)`);
  for (const x of missing) console.error('  ' + x);
  process.exit(1);
}
console.log(`gate-dead-links: OK (${checked} local links and path literals resolve)`);
