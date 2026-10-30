#!/usr/bin/env node
// gate-copy.mjs : the house rules for every word a student reads.
//
//   node scripts/gate-copy.mjs                          strict over the whole site: exit 1 on any hit
//   node scripts/gate-copy.mjs --baseline [FILE]        ratchet: exit 1 only when a file has more hits of
//                                                       a rule than FILE allows (default scripts/copy-baseline.json)
//   node scripts/gate-copy.mjs --write-baseline [FILE]  snapshot today's counts, exit 0
//   node scripts/gate-copy.mjs --strict FILE...         only these files, no allowance (a batch's touched files)
//   node scripts/gate-copy.mjs --since REF              strict on every served file changed since REF
//                                                       (git diff REF...HEAD, plus uncommitted and new files)
//   options: --rules dash,word   only these rules     --verbose   every site, not the first three per file
//            --summary           totals per rule      --root DIR  another checkout
//
// Rules (spec section 8, build plan B1):
//   dash      em and en dashes (and the other dash glyphs)
//   middot    the middle dot and bullets used as separators (use " / " or a comma)
//   emoji     emoji and pictographs, check marks included (draw an SVG instead)
//   non-ascii any other character outside plain ASCII (arrows, Greek, curly quotes, the minus sign...)
//   word      wrong, wrongly, incorrect, incorrectly, fail, fails, failed, failing
//             (say Confirmed / Needs review, or name the trap)
//   streak    streaks
//   points    points or XP as a reward ("+10 points", "earn points", "XP")
//   score     leaderboards, best / high / top scores, personal bests, records
//   badge     badges
//   countdown "N days left", "days to go", "days until your test", "N min left"
//   confidence a confidence rating ("How sure are you?", "confidence level"): calls are one tap, and
//             nothing asks for confidence before the verdict
//   payment   payment, pricing, checkout, subscription, billing, invoice, refund, coupon, paywall,
//             credit card, buy now, upgrade now, per month
//
// What is read (scripts/lib/served.mjs): every served .html/.svg/.js/.mjs/.css/.json except
// vendor bundles and pages a forced redirect sends away. Visible text, the attributes a reader
// sees or hears, script string literals (console and Error messages, selector and storage-key
// arguments skipped), CSS content strings and JSON values. Entities (&mdash;) and escapes
// (—) count as the glyph they draw. For the word rules a script string that is one
// lower-case token ('wrong', 'is-failed') or a CSS declaration is code, not copy.
// A line that carries the marker copy-gate-ok is skipped (for code the lexer cannot tell
// from copy; never for words a student reads).
// Dependency-free, about 3 s.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { servedFiles, readingSegments, lineIndex, READ_EXT } from './lib/served.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));

/* ---------- rules ---------- */
const isPlain = (c) => c === 9 || c === 10 || c === 13 || (c >= 0x20 && c <= 0x7e) || c === 0xa0 || c === 0xad || c === 0xfeff || c === 0x200b;
export function charRule(c) {
  if ((c >= 0x2010 && c <= 0x2015) || c === 0x2e3a || c === 0x2e3b || c === 0xfe58 || c === 0xfe63) return c === 0x2010 || c === 0x2011 ? 'non-ascii' : 'dash';
  if (c === 0xb7 || c === 0x2022 || c === 0x2027 || c === 0x22c5 || c === 0x2219 || c === 0x30fb) return 'middot';
  if ((c >= 0x1f000 && c <= 0x1faff) || (c >= 0x2600 && c <= 0x27bf) || (c >= 0x2b00 && c <= 0x2bff) || (c >= 0x231a && c <= 0x23ff) || c === 0xfe0f || c === 0x200d || c === 0x2b50) return 'emoji';
  return 'non-ascii';
}
export const WORD_RULES = [
  ['word', /\b(?:wrong(?:ly)?|incorrect(?:ly)?|fail(?:s|ed|ing)?)\b/gi],
  ['streak', /\b(?<!primitive\s)streaks?\b/gi],
  ['points', /\+\s?\d+\s*(?:pts?|points?)\b|\b\d+\s*pts\b|\b(?:earn(?:ed|s|ing)?|scored?|scoring|win|wins|bonus|gain(?:ed|s)?|collect(?:ed|s)?)\s+(?:\d+\s+|some\s+|more\s+|extra\s+|bonus\s+)?points?\b|\bpoints?\s+(?:earned|scored|to\s+spend)\b|\b\d+\s*XP\b|\bXP\s+(?:points?|bar|level|earned|total|boost)\b|\b(?:earn|gain|get)(?:ed|s)?\s+XP\b/gi],
  ['score', /\bleader\s?boards?\b|\b(?:best|high|top)[\s-]scores?\b|\bpersonal\s+(?:best|record)s?\b/gi],
  ['badge', /\b(?:earn|earned|earns|earning|unlock|unlocked|unlocks|collect|collected|win|won|new)\s+(?:a\s+|the\s+|your\s+|\d+\s+|new\s+)?badges?\b|\bbadges?\s+(?:earned|unlocked|collected|won)\b|\bbadge\s+(?:count|wall|collection)\b/gi],
  ['countdown', /\b(?:days?|weeks?)\s+(?:left|to\s+go|remaining)\b|\bdays?\s+until\s+(?:your|the)\s+(?:test|exam|dat)\b|\b\d+\s*(?:min|mins)\s+left\b/gi],
  ['confidence', /\bconfiden(?:ce|t)\s+(?:rating|level|scale|check|slider)s?\b|\bhow\s+(?:confident|sure)\s+(?:are|were)\s+you\b|\brate\s+(?:your|how)\s+(?:confiden|sure)\w*/gi],
  ['payment', /\b(?:pricing|subscriptions?|subscribe\s+(?:now|today|to\s+(?:unlock|get|access))|billing|invoices?|refunds?|paywall|credit\s+card|buy\s+now|upgrade\s+(?:now|to\s+(?:pro|premium|full))|free\s+trial|coupon\s+code|promo\s+codes?|payment\s+(?:plan|method|details|page|link|info)|(?:make|complete)\s+(?:a|your)\s+payment|(?:proceed|go)\s+to\s+checkout|checkout\s+(?:page|link)|premium\s+(?:plan|access|tier|members?(?:hip)?))\b|\$\d+(?:\.\d\d)?\s*\/\s*(?:mo|month|yr|year)\b/gi],
];
export const RULES = ['dash', 'middot', 'emoji', 'non-ascii', ...WORD_RULES.map((r) => r[0])];

// a script string the lexer cannot place: one lower-case token or a CSS declaration is code
const TOKEN = /^\s*[a-z_$.#\[\-][\w$.\-:#\[\]=\/@*>+~()'",]*\s*$/;
const CLASS_LIST = /^\s*[a-z][\w-]*(?:\s+[a-z][\w-]*)+\s*$/;  // 'diag-section-badge badge-' (a hyphenated class list)
const CSS_DECL = /(^|[;{]\s*)[a-z-]+\s*:\s*[^;]+;/;
const isCodeString = (seg) => (seg.kind === 'js' || seg.kind === 'json') && (seg.code || TOKEN.test(seg.text) || (CLASS_LIST.test(seg.text) && /[a-z][-_]|-\s|-$/.test(seg.text)) || (!seg.markup && CSS_DECL.test(seg.text)));

export function scan(rel, src, { rules = RULES } = {}) {
  const want = new Set(rules); const hits = [];
  const okLines = new Set(); if (src.includes('copy-gate-ok')) src.split('\n').forEach((l, i) => { if (l.includes('copy-gate-ok')) okLines.add(i + 1); });
  const line = lineIndex(src);
  const ctx = (text, i, len) => text.slice(Math.max(0, i - 36), i + len + 36).replace(/\s+/g, ' ').trim();
  const add = (rule, seg, i, len, what) => { const at = seg.offset + i; const ln = line(at); if (okLines.has(ln)) return; hits.push({ rule, line: ln, what, context: ctx(seg.text, i, len) }); };
  for (const seg of readingSegments(rel, src)) {
    const t = seg.text;
    for (let i = 0; i < t.length; i++) {
      const c = t.codePointAt(i); if (c > 0xffff) i++;
      if (isPlain(c)) continue;
      const r = charRule(c); if (want.has(r)) add(r, seg, i, 1, 'U+' + c.toString(16).toUpperCase().padStart(4, '0'));
    }
    if (isCodeString(seg)) continue;
    for (const [rule, re] of WORD_RULES) {
      if (!want.has(rule)) continue;
      re.lastIndex = 0; let m;
      while ((m = re.exec(t))) add(rule, seg, m.index, m[0].length, m[0].replace(/\s+/g, ' '));
    }
  }
  return hits;
}

/* ---------- cli ---------- */
function main(argv) {
  const args = argv.slice(2);
  const val = (k, dflt) => { const i = args.indexOf(k); if (i < 0) return undefined; const v = args[i + 1]; return v && !v.startsWith('--') ? v : dflt; };
  const ROOT = path.resolve(val('--root') || path.join(HERE, '..'));
  const DEFAULT_BASE = path.join(ROOT, 'scripts/copy-baseline.json');
  const BASELINE = args.includes('--baseline') ? path.resolve(val('--baseline', DEFAULT_BASE)) : null;
  const WRITE = args.includes('--write-baseline') ? path.resolve(val('--write-baseline', DEFAULT_BASE)) : null;
  const rules = val('--rules') ? val('--rules').split(',').map((s) => s.trim()) : RULES;
  for (const r of rules) if (!RULES.includes(r)) { console.error(`gate-copy: unknown rule ${r} (rules: ${RULES.join(', ')})`); process.exit(2); }
  const VERBOSE = args.includes('--verbose'), SUMMARY = args.includes('--summary');

  const served = servedFiles(ROOT);
  let files = served, mode = 'strict, whole site';
  const flagVals = new Set([val('--baseline'), val('--write-baseline'), val('--root'), val('--rules'), val('--since')].filter(Boolean));
  if (args.includes('--strict')) {
    const listed = args.slice(args.indexOf('--strict') + 1).filter((a) => !a.startsWith('--') && !flagVals.has(a));
    if (listed.length) {
      const set = new Set(served); files = [];
      for (const f of listed) {
        const rel = path.relative(ROOT, path.resolve(f)).split(path.sep).join('/');
        if (set.has(rel)) files.push(rel); else console.log(`  (not a served reading file, skipped: ${rel})`);
      }
      mode = `strict, ${files.length} file(s)`;
    }
  } else if (args.includes('--since')) {
    const ref = val('--since');
    const git = (...a) => execFileSync('git', a, { cwd: ROOT, encoding: 'utf8' }).split('\n').filter(Boolean);
    const changed = new Set([...git('diff', '--name-only', `${ref}...HEAD`), ...git('diff', '--name-only', 'HEAD'), ...git('ls-files', '--others', '--exclude-standard')]);
    files = served.filter((f) => changed.has(f)); mode = `strict, ${files.length} file(s) changed since ${ref}`;
  } else if (BASELINE && !WRITE) mode = 'ratchet against ' + path.relative(ROOT, BASELINE);

  const counts = {}, sites = {}, totals = Object.fromEntries(rules.map((r) => [r, 0]));
  for (const rel of files) {
    if (!READ_EXT.has(path.extname(rel).toLowerCase())) continue;
    const hits = scan(rel, fs.readFileSync(path.join(ROOT, rel), 'utf8'), { rules });
    if (!hits.length) continue;
    counts[rel] = {}; sites[rel] = hits;
    for (const h of hits) { counts[rel][h.rule] = (counts[rel][h.rule] || 0) + 1; totals[h.rule]++; }
  }
  const nHits = Object.values(totals).reduce((a, b) => a + b, 0);
  const summary = () => console.log('  per rule: ' + rules.map((r) => `${r} ${totals[r]}`).join(', '));

  if (WRITE) {
    const sorted = Object.fromEntries(Object.keys(counts).sort().map((f) => [f, Object.fromEntries(Object.keys(counts[f]).sort().map((r) => [r, counts[f][r]]))]));
    fs.mkdirSync(path.dirname(WRITE), { recursive: true }); fs.writeFileSync(WRITE, JSON.stringify(sorted, null, 1) + '\n');
    console.log(`gate-copy: baseline written to ${path.relative(ROOT, WRITE)} (${Object.keys(counts).length} files, ${nHits} hits in ${files.length} files read)`);
    summary(); return 0;
  }
  const base = BASELINE && !args.includes('--strict') && !args.includes('--since') ? JSON.parse(fs.readFileSync(BASELINE, 'utf8')) : {};
  const over = [];
  for (const f of Object.keys(counts)) {
    const rs = Object.keys(counts[f]).filter((r) => counts[f][r] > ((base[f] || {})[r] || 0));
    if (rs.length) over.push({ f, rs, n: rs.reduce((a, r) => a + counts[f][r] - ((base[f] || {})[r] || 0), 0) });
  }
  over.sort((a, b) => b.n - a.n);
  let below = 0; for (const f of Object.keys(base)) for (const r of Object.keys(base[f])) if (rules.includes(r) && ((counts[f] || {})[r] || 0) < base[f][r]) { below++; break; }
  if (SUMMARY) summary();
  if (over.length) {
    console.error(`gate-copy: ${over.length} file(s) break the copy rules (${mode}; ${files.length} files read)`);
    for (const { f, rs } of over) {
      console.error(`  ${f}  ` + rs.map((r) => `${r} ${counts[f][r]}${BASELINE && !args.includes('--strict') ? ` (baseline ${(base[f] || {})[r] || 0})` : ''}`).join(', '));
      const list = sites[f].filter((h) => rs.includes(h.rule));
      for (const h of VERBOSE ? list : list.slice(0, 3)) console.error(`      ${f}:${h.line}  ${h.rule}  ${h.what}  ...${h.context}...`);
      if (!VERBOSE && list.length > 3) console.error(`      (${list.length - 3} more; --verbose lists every site)`);
    }
    return 1;
  }
  console.log(`gate-copy: OK (${mode}; ${files.length} files read, ` + (Object.keys(base).length ? `${nHits} hits, none above baseline)` : 'no hits)'));
  if (below && BASELINE) console.log(`  ${below} file(s) now sit below their baseline; npm run copy:baseline locks the gain in`);
  return 0;
}
const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) process.exit(main(process.argv));
