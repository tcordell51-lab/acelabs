// scripts/lib/served.mjs : what the deploy serves, and the words a student reads in it.
//
// Shared by gate-copy.mjs and gate-clock.mjs. Dependency-free.
//
//   servedFiles(root)          every file the static deploy serves to a student: the same
//                              skip rules as the other gates (docs, research, specs, scripts,
//                              tests/<dir>/, verification), minus vendor bundles and minus
//                              pages a forced redirect sends away (they are never served).
//   readingSegments(rel, src)  the text a student can read in one file, as segments
//                              { text, offset, kind, code }: visible HTML text, the attributes
//                              a reader hears or sees (alt, title, aria-label, placeholder,
//                              aria-valuetext, button values, meta descriptions), string
//                              literals of scripts (comments, regex literals, console and
//                              Error messages, selector and storage-key arguments skipped),
//                              CSS content: strings, and JSON string values. Every segment
//                              keeps the length of its source, so offset + index is the
//                              source position (entities and escapes are decoded in place
//                              and padded with spaces).
//   jsStrings(src, base)       the script lexer on its own.
//   lineOf(src, index)         1-based line of a source offset.
import fs from 'node:fs';
import path from 'node:path';

export const SKIP_REL = /^(node_modules|\.git|docs|research|specs|scripts|test-screenshots|\.netlify|netlify|\.claude|dist-astro|astro-proto)(\/|$)|^tests\/[^/]+\//;
export const SKIP_SEG = /(^|\/)(research|verification)(\/|$)/;
export const VENDOR = /\.min\.(js|css)$|(^|\/)three\.module|(^|\/)vendor\//;
export const READ_EXT = new Set(['.html', '.htm', '.js', '.mjs', '.css', '.json', '.svg']);
const NOT_COPY_JSON = /^(package(-lock)?\.json|manifest\.json)$|(^|\/)audio\/cues\.json$/;

export const lineOf = (s, i) => { let n = 1; for (let k = 0; k < i && k < s.length; k++) if (s.charCodeAt(k) === 10) n++; return n; };
// many lookups in one file: index the line starts once, then binary search
export function lineIndex(s) {
  const starts = [0]; for (let k = 0; k < s.length; k++) if (s.charCodeAt(k) === 10) starts.push(k + 1);
  return (i) => { let lo = 0, hi = starts.length - 1; while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (starts[mid] <= i) lo = mid; else hi = mid - 1; } return lo + 1; };
}
export const blank = (m) => m.replace(/[^\n]/g, ' ');

/* ---------- redirects: a page a forced 3xx rule sends away is not served ---------- */
export function redirectRules(root) {
  const rules = [];
  const add = (from, to, status, force) => { if (!from) return; rules.push({ from, to, status: Number(status) || 301, force: !!force }); };
  const rf = path.join(root, '_redirects');
  if (fs.existsSync(rf)) for (const l of fs.readFileSync(rf, 'utf8').split('\n')) {
    const t = l.trim(); if (!t || t.startsWith('#')) continue;
    const [from, to, st = '301'] = t.split(/\s+/); add(from, to, st.replace('!', ''), st.endsWith('!'));
  }
  const tf = path.join(root, 'netlify.toml');
  if (fs.existsSync(tf)) {
    const toml = fs.readFileSync(tf, 'utf8');
    for (const blk of toml.split(/^\s*\[\[redirects\]\]\s*$/m).slice(1)) {
      const body = blk.split(/^\s*\[/m)[0];
      const g = (k) => (body.match(new RegExp('^\\s*' + k + '\\s*=\\s*"?([^"\\n]+)"?', 'm')) || [])[1];
      add(g('from'), g('to'), g('status'), /^\s*force\s*=\s*true/m.test(body));
    }
  }
  return rules;
}
export function matchRule(rules, urlPath, { forcedOnly = false } = {}) {
  for (const r of rules) {
    if (forcedOnly && !r.force) continue;
    if (r.from.endsWith('/*')) { const p = r.from.slice(0, -1); if (urlPath.startsWith(p) || urlPath === p.slice(0, -1)) return { ...r, splat: urlPath.slice(p.length) }; }
    else if (r.from === urlPath || r.from === urlPath.replace(/\/$/, '')) return { ...r, splat: '' };
  }
  return null;
}
export const urlOf = (rel) => '/' + rel.replace(/(^|\/)index\.html$/, '$1');
export function isRedirectedAway(rules, rel) {
  const r = matchRule(rules, '/' + rel, { forcedOnly: true }) || matchRule(rules, urlOf(rel), { forcedOnly: true });
  return !!(r && r.status >= 300 && r.status < 400);
}

export function servedFiles(root, { exts = READ_EXT, vendor = false } = {}) {
  const rules = redirectRules(root); const out = [];
  (function walk(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name); const rel = path.relative(root, p).split(path.sep).join('/');
      if (SKIP_REL.test(rel) || SKIP_SEG.test(rel)) continue;
      if (e.isDirectory()) { walk(p); continue; }
      if (exts && !exts.has(path.extname(rel).toLowerCase())) continue;
      if (!vendor && VENDOR.test(rel)) continue;
      if (NOT_COPY_JSON.test(rel)) continue;
      if (isRedirectedAway(rules, rel)) continue;
      out.push(rel);
    }
  })(root);
  return out.sort();
}

/* ---------- decoding in place (same length, padded with spaces) ---------- */
const NAMED = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', shy: '', ensp: ' ', emsp: ' ', thinsp: ' ',
  mdash: '—', ndash: '–', middot: '·', bull: '•', hellip: '…', sdot: '⋅',
  rarr: '→', larr: '←', harr: '↔', uarr: '↑', darr: '↓', rArr: '⇒', lArr: '⇐', hArr: '⇔', rlarr: '⇄', lrarr: '⇆', rightleftharpoons: '⇌',
  times: '×', divide: '÷', deg: '°', plusmn: '±', minus: '−', le: '≤', ge: '≥', ne: '≠', asymp: '≈', approx: '≈', infin: '∞', prop: '∝', radic: '√', sum: '∑', part: '∂',
  lsquo: '‘', rsquo: '’', ldquo: '“', rdquo: '”', laquo: '«', raquo: '»', prime: '′', Prime: '″',
  copy: '©', reg: '®', trade: '™', micro: 'µ', para: '¶', sect: '§', check: '✓', cross: '✗', star: '☆', starf: '★',
  frac12: '½', frac14: '¼', frac34: '¾', sup2: '²', sup3: '³', sup1: '¹', ordm: 'º', ordf: 'ª',
  alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ', epsilon: 'ε', theta: 'θ', lambda: 'λ', mu: 'μ', nu: 'ν', pi: 'π', rho: 'ρ', sigma: 'σ', tau: 'τ', phi: 'φ', chi: 'χ', psi: 'ψ', omega: 'ω',
  Gamma: 'Γ', Delta: 'Δ', Theta: 'Θ', Lambda: 'Λ', Pi: 'Π', Sigma: 'Σ', Phi: 'Φ', Psi: 'Ψ', Omega: 'Ω',
};
const pad = (ch, len) => (ch.length > len ? ch.slice(0, len) : ch + ' '.repeat(Math.max(0, len - ch.length)));
const cp = (n) => { try { return String.fromCodePoint(n); } catch { return '�'; } };
export function decodeEntities(s) {
  if (s.indexOf('&') < 0) return s;
  return s.replace(/&(#[0-9]{1,7}|#x[0-9a-f]{1,6}|[a-z][a-z0-9]{1,31});/gi, (m, e) => {
    let ch;
    if (e[0] === '#') ch = cp(e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10));
    else ch = Object.prototype.hasOwnProperty.call(NAMED, e) ? NAMED[e] : '�';  // any other named entity draws a non-ASCII glyph
    return pad(ch, m.length);
  });
}
export function decodeJsEscapes(s) {
  if (s.indexOf('\\') < 0) return s;
  return s.replace(/\\(u\{[0-9a-f]+\}|u[0-9a-f]{4}|x[0-9a-f]{2}|[\s\S])/gi, (m, e) => {
    if (e[0] === 'u' && e[1] === '{') return pad(cp(parseInt(e.slice(2, -1), 16)), m.length);
    if ((e[0] === 'u' || e[0] === 'x') && e.length > 1) return pad(cp(parseInt(e.slice(1), 16)), m.length);
    if (e === '\n' || e === '\r') return pad('', m.length);
    if (e === 'n' || e === 't' || e === 'r') return pad(' ', m.length);
    return pad(e, m.length);
  });
}
const decodeCssEscapes = (s) => s.replace(/\\([0-9a-f]{1,6})\s?/gi, (m, h) => pad(cp(parseInt(h, 16)), m.length));

/* ---------- the script lexer ---------- */
const RX_WORDS = new Set(['return', 'typeof', 'case', 'do', 'else', 'in', 'of', 'new', 'delete', 'void', 'throw', 'yield', 'await', 'instanceof']);
const DEV_CALL = /^(log|warn|error|info|debug|trace|assert|group|groupCollapsed|table|time|timeEnd|count)$/;
// first argument is code (a selector, class, attribute, event, storage key, module or URL), or a
// needle a script searches for, never shows: s.indexOf('\u2014'), s.split('\u00b7'), s.replace('\u2014', ': ')
// (join is not here: its separator is what the student reads)
const CODE_FIRST = new Set(['querySelector', 'querySelectorAll', 'getElementById', 'getElementsByClassName', 'getElementsByTagName', 'closest', 'matches',
  'add', 'remove', 'toggle', 'contains', 'replace', 'getItem', 'setItem', 'removeItem', 'addEventListener', 'removeEventListener', 'dispatchEvent',
  'CustomEvent', 'Event', 'getAttribute', 'setAttribute', 'removeAttribute', 'hasAttribute', 'toggleAttribute', 'createElement', 'createElementNS',
  'require', 'import', 'fetch', 'getPropertyValue', 'setProperty', 'removeProperty', 'matchMedia', 'registerMissAdapter', 'insertAdjacentHTML', 'Worker',
  'indexOf', 'lastIndexOf', 'includes', 'split', 'replaceAll', 'startsWith', 'endsWith', 'search', 'match', 'matchAll']);

export function jsStrings(src, base = 0) {
  const out = []; const n = src.length; let i = 0; let last = ''; const hist = [];
  const stack = []; // { k: '(' | '[' | '{' | '${', dev, code, tpl }
  const top = () => stack[stack.length - 1];
  const note = (t) => { last = t; hist.push(t); if (hist.length > 4) hist.shift(); };
  const flags = () => { const t = top(); return { dev: !!(t && t.dev), code: !!(t && t.code && t.first) }; };
  const readTpl = (from) => { let j = from; while (j < n) { const ch = src[j]; if (ch === '\\') { j += 2; continue; } if (ch === '`') return { end: j, open: false }; if (ch === '$' && src[j + 1] === '{') return { end: j, open: true }; j++; } return { end: n, open: false }; };
  const finishTpl = (tpl, end) => {
    let t = src.slice(tpl.start + 1, end);
    for (const [a, b] of tpl.holes) { const s = a - tpl.start - 1, e = Math.min(b - tpl.start, t.length); t = t.slice(0, s) + blank(t.slice(s, e)) + t.slice(e); }
    out.push({ text: decodeJsEscapes(t), offset: base + tpl.start + 1, dev: tpl.dev, code: tpl.code, tpl: true });
  };
  const stepTpl = (tpl, from) => {
    const r = readTpl(from);
    if (r.open) { tpl.holes.push([r.end, n]); stack.push({ k: '${', tpl, dev: tpl.dev }); return r.end + 2; }
    finishTpl(tpl, r.end); note('str'); return r.end + 1;
  };
  while (i < n) {
    const c = src[i];
    if (c === '/' && src[i + 1] === '/') { while (i < n && src[i] !== '\n') i++; continue; }
    if (c === '/' && src[i + 1] === '*') { const e = src.indexOf('*/', i + 2); i = e < 0 ? n : e + 2; continue; }
    if (c === '"' || c === "'") {
      const st = i; i++;
      while (i < n && src[i] !== c) { if (src[i] === '\\') { i += 2; continue; } if (src[i] === '\n') break; i++; }
      const f = flags();
      out.push({ text: decodeJsEscapes(src.slice(st + 1, i)), offset: base + st + 1, dev: f.dev, code: f.code });
      i++; note('str'); continue;
    }
    if (c === '`') { const f = flags(); i = stepTpl({ start: i, holes: [], dev: f.dev, code: f.code }, i + 1); continue; }
    if (c === '/') {
      if (!last || /^[(,=:\[!&|?{};+\-*%<>~^]$/.test(last) || RX_WORDS.has(last)) {
        i++; let cls = false;
        while (i < n) { const d = src[i]; if (d === '\\') { i += 2; continue; } if (d === '\n') break; if (cls) { if (d === ']') cls = false; } else if (d === '[') cls = true; else if (d === '/') { i++; break; } i++; }
        while (i < n && /[a-z]/i.test(src[i])) i++; note('rx'); continue;
      }
      i++; note('/'); continue;
    }
    if (/[A-Za-z_$]/.test(c)) { const s = i; while (i < n && /[\w$]/.test(src[i])) i++; note(src.slice(s, i)); continue; }
    if (/\s/.test(c)) { i++; continue; }
    if (c === '(' || c === '[' || c === '{') {
      const parent = top(); let dev = !!(parent && parent.dev), code = false;
      if (c === '(') {
        const h = hist.length; const a = hist[h - 1], b = hist[h - 2], d = hist[h - 3];
        if ((d === 'console' && b === '.' && DEV_CALL.test(a)) || /Error$/.test(a || '')) dev = true;
        else if (CODE_FIRST.has(a)) code = true;
      }
      stack.push({ k: c, dev, code, first: true }); note(c); i++; continue;
    }
    if (c === ')' || c === ']') { stack.pop(); note(c); i++; continue; }
    if (c === '}') {
      const t = top();
      if (t && t.k === '${') { stack.pop(); t.tpl.holes[t.tpl.holes.length - 1][1] = i + 1; i = stepTpl(t.tpl, i + 1); continue; }
      stack.pop(); note(c); i++; continue;
    }
    if (c === ',') { const t = top(); if (t) t.first = false; }
    note(c); i++;
  }
  return out;
}

/* ---------- markup ---------- */
const READ_ATTR = /(?<![\w-])(alt|title|aria-label|aria-description|aria-valuetext|placeholder|data-tooltip|data-tip)\s*=\s*("([^"]*)"|'([^']*)')/gi;
const META_COPY = /<meta\b[^>]*\b(?:name|property)\s*=\s*["'](?:description|og:title|og:description|twitter:title|twitter:description)["'][^>]*>/gi;
const BTN_VALUE = /<input\b[^>]*\btype\s*=\s*["']?(?:button|submit|reset)["']?[^>]*>/gi;
// the readable text of a markup string: tags blanked, the reading attributes kept, entities decoded
export function markupText(s) {
  const attrs = [];
  // pieces of concatenated markup: '" class="opt wrong">Text' and '<span class="tag '
  const lead = s.match(/^[^<>]*>/); if (lead && /=\s*["']|["']\s*>$/.test(lead[0])) s = blank(lead[0]) + s.slice(lead[0].length);
  const trail = s.match(/<[a-zA-Z][^<>]*$/); if (trail) s = s.slice(0, trail.index) + blank(trail[0]);
  if (!/<[a-zA-Z!\/]/.test(s)) return { text: decodeEntities(s), attrs };
  const tagRe = /<[a-zA-Z][^<>]*>/g; let t;
  while ((t = tagRe.exec(s))) {
    READ_ATTR.lastIndex = 0; let a;
    while ((a = READ_ATTR.exec(t[0]))) { const v = a[3] ?? a[4] ?? ''; const at = t.index + a.index + a[0].indexOf(v, a[1].length); if (v && !v.includes('${')) attrs.push({ text: decodeEntities(v), at }); }
  }
  const text = s.replace(/<!--[\s\S]*?-->/g, blank).replace(/<(style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, blank).replace(/<\/?[a-zA-Z!][^<>]*>/g, blank);
  return { text: decodeEntities(text), attrs };
}
const cssContent = (css, base) => {
  const out = []; const re = /content\s*:\s*(?:"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)')/g; let m;
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, blank);
  while ((m = re.exec(clean))) { const v = m[1] ?? m[2]; out.push({ text: decodeCssEscapes(v), offset: base + m.index + m[0].indexOf(v, 8), kind: 'css' }); }
  return out;
};

export function readingSegments(rel, src) {
  const ext = path.extname(rel).toLowerCase(); const segs = [];
  const fromJs = (code, base, kind = 'js') => {
    for (const s of jsStrings(code, base)) {
      if (s.dev) continue;
      const mk = markupText(s.text);
      segs.push({ text: mk.text, offset: s.offset, kind, code: s.code, markup: mk.text !== s.text });
      for (const a of mk.attrs) segs.push({ text: a.text, offset: s.offset + a.at, kind: 'attr' });
    }
  };
  if (ext === '.js' || ext === '.mjs') { fromJs(src, 0); return segs; }
  if (ext === '.css') return cssContent(src, 0);
  if (ext === '.json') {
    let v; try { v = JSON.parse(src); } catch { return segs; }
    for (const s of jsStrings(src, 0)) { // keys are strings too: keep values only (a string followed by ':' is a key)
      let k = s.offset + s.text.length + 1; while (k < src.length && /\s/.test(src[k])) k++;
      if (src[k] === ':') continue;
      const mk = markupText(decodeJsEscapes(s.text)); segs.push({ text: mk.text, offset: s.offset, kind: 'json' });
    }
    return segs;
  }
  // .html, .htm, .svg
  let html = src.replace(/<!--[\s\S]*?-->/g, blank);
  const scriptRe = /<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi; let sm;
  while ((sm = scriptRe.exec(html))) {
    const off = sm.index + sm[0].indexOf('>') + 1;
    if (/type\s*=\s*["']?text\/(?:template|x-template|html)/i.test(sm[1])) { const mk = markupText(sm[2]); segs.push({ text: mk.text, offset: off, kind: 'text' }); continue; }
    if (/type\s*=\s*["']?text\/plain/i.test(sm[1])) continue;
    fromJs(sm[2], off, /json/i.test(sm[1]) ? 'json' : 'js');
  }
  const styleRe = /<style\b[^>]*>([\s\S]*?)<\/style\s*>/gi; let st;
  while ((st = styleRe.exec(html))) segs.push(...cssContent(st[1], st.index + st[0].indexOf('>') + 1));
  html = html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, blank);
  const tagRe = /<[a-zA-Z][^<>]*>/g; let t;
  while ((t = tagRe.exec(html))) {
    READ_ATTR.lastIndex = 0; let a;
    while ((a = READ_ATTR.exec(t[0]))) { const v = a[3] ?? a[4] ?? ''; if (v) segs.push({ text: decodeEntities(v), offset: t.index + a.index + a[0].indexOf(v, a[1].length), kind: 'attr' }); }
  }
  for (const re of [META_COPY, BTN_VALUE]) {
    re.lastIndex = 0; let m;
    while ((m = re.exec(html))) { const v = m[0].match(re === META_COPY ? /\bcontent\s*=\s*("([^"]*)"|'([^']*)')/i : /\bvalue\s*=\s*("([^"]*)"|'([^']*)')/i); if (v) { const val = v[2] ?? v[3] ?? ''; segs.push({ text: decodeEntities(val), offset: m.index + m[0].indexOf(val, v.index), kind: 'attr' }); } }
  }
  segs.push({ text: decodeEntities(html.replace(/<\/?[a-zA-Z!?][^<>]*>/g, blank)), offset: 0, kind: 'text' });
  return segs;
}

/* ---------- code only: comments, strings, templates and regex literals blanked (same length) ---------- */
export function codeOnly(src) {
  const out = src.split(''); const n = src.length; let i = 0; let last = '';
  const wipe = (a, b) => { for (let k = a; k < b && k < n; k++) if (out[k] !== '\n') out[k] = ' '; };
  while (i < n) {
    const c = src[i];
    if (c === '/' && src[i + 1] === '/') { const s = i; while (i < n && src[i] !== '\n') i++; wipe(s, i); continue; }
    if (c === '/' && src[i + 1] === '*') { const e = src.indexOf('*/', i + 2); const end = e < 0 ? n : e + 2; wipe(i, end); i = end; continue; }
    if (c === '"' || c === "'" || c === '`') {
      const s = i; i++;
      while (i < n && src[i] !== c) { if (src[i] === '\\') { i += 2; continue; } if (c !== '`' && src[i] === '\n') break; i++; }
      wipe(s + 1, i); i++; last = 'str'; continue;
    }
    if (c === '/') {
      if (!last || /^[(,=:\[!&|?{};+\-*%<>~^]$/.test(last) || RX_WORDS.has(last)) {
        const s = i; i++; let cls = false;
        while (i < n) { const d = src[i]; if (d === '\\') { i += 2; continue; } if (d === '\n') break; if (cls) { if (d === ']') cls = false; } else if (d === '[') cls = true; else if (d === '/') { i++; break; } i++; }
        while (i < n && /[a-z]/i.test(src[i])) i++; wipe(s, i); last = 'rx'; continue;
      }
      i++; last = '/'; continue;
    }
    if (/[A-Za-z_$]/.test(c)) { const s = i; while (i < n && /[\w$]/.test(src[i])) i++; last = src.slice(s, i); continue; }
    if (/\s/.test(c)) { i++; continue; }
    last = c; i++;
  }
  return out.join('');
}
// the scripts of a served file as [{ code, offset }] (inline <script> bodies for HTML)
export function scriptsOf(rel, src) {
  const ext = path.extname(rel).toLowerCase();
  if (ext === '.js' || ext === '.mjs') return [{ code: src, offset: 0 }];
  if (ext !== '.html' && ext !== '.htm' && ext !== '.svg') return [];
  const html = src.replace(/<!--[\s\S]*?-->/g, blank); const out = [];
  const re = /<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi; let m;
  while ((m = re.exec(html))) { if (/type\s*=\s*["']?(?:application\/(?:ld\+)?json|text\/(?:template|x-template|html|plain))/i.test(m[1])) continue; out.push({ code: m[2], offset: m.index + m[0].indexOf('>') + 1 }); }
  return out;
}
