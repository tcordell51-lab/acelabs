#!/usr/bin/env node
// gate-clock.mjs : no clock on a student outside a timed test.
//
//   node scripts/gate-clock.mjs             exit 1 when a served file outside the allowlist shows or runs a clock
//   node scripts/gate-clock.mjs --strict    PENDING entries fail too (the release sweep, B6)
//   node scripts/gate-clock.mjs --verbose   every site, and the allowlisted files' sites
//   node scripts/gate-clock.mjs --root DIR  another checkout
//
// The decisions (docs/ace-system-decisions.md, Questions): practice is untimed; full practice
// tests are timed like the real test; an OPTIONAL timer, off by default, is offered for section
// sets only in the Test phase. No other timers, and test dates are dates, never countdowns.
//
// Signals, per file:
//   clock-code  a setInterval at 1 s or faster, or a setTimeout / requestAnimationFrame loop that
//               reschedules itself, whose callback ticks a display of time (it reads the clock or a
//               seconds / remaining / elapsed counter, or counts down once a second, and writes the page)
//   clock-ui    an element whose id or class names a timer, countdown, clock or stopwatch
//               (clockwise and counterclockwise are not clocks)
//   clock-text  a countdown label in what a student reads: "Time remaining", "Time left",
//               "Time's up", "N seconds / minutes left", "N days left", "days to go",
//               "days until your test" (a short label; a pacing scenario in a lesson sentence is not a clock)
//
// A file with any signal must be on the allowlist below:
//   TIMED    a timed test, for good: the full-length practice tests and the timed paths of
//            tools/mock/, and the section sets that offer the optional Test-phase timer
//   PENDING  a timer the decisions remove; the owning batch makes it untimed and deletes the entry.
//            Passes today, fails under --strict.
// An entry whose file no longer shows a clock is reported as stale (remove it).
// Dependency-free, about 2 s.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { servedFiles, readingSegments, scriptsOf, codeOnly, lineIndex } from './lib/served.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));

/* ---------- the allowlist ---------- */
// { path (exact) or prefix (ends with /), why, owner (PENDING only) }
export const TIMED = [
  // full practice tests: timed like the real test, for good
  { path: 'tools/mock/', why: 'the full-length practice tests (timed like the real DAT), break clock included' },
  { path: 'prometric-mock.html', why: 'the full-length Prometric-style practice test' },
  // timed section sets: the clock stays only as the optional Test-phase timer, off by default (B4.7 checks each)
  { path: 'tools/pat/test.html', why: 'the full PAT section test (60 minutes, like the real section)' },
  { path: 'tools/minitests/index.html', why: 'timed section mini tests on the Tests door' },
  { path: 'tools/rc/rc.js', why: 'the RC passage test; the clock runs in its timed mode' },
  { path: 'tools/qr/qr-formats-module.js', why: 'QR format sets: the timed set mode' },
  { path: 'tools/ochem/summit/summit.js', why: 'The Summit: the timed mode (untimed is the default)' },
  { path: 'tools/casper/index.html', why: 'Casper practice: the real test times every response, and the practice mirrors it' },
];
export const PENDING = [
  { path: 'ace-labs.html', owner: 'B2', why: 'Today draws a picture of the exam bar with "Time remaining"; Today is rebuilt' },
  { path: 'diagnostic.html', owner: 'B2', why: 'the diagnostic runs a countdown; it becomes untimed in the first-run flow' },
  { path: 'games/play.html', owner: 'B4.6', why: 'quick rounds run a per-question countdown (decision 3: untimed)' },
  { path: 'tools/pat/angles.html', owner: 'B4.6', why: 'PAT drill stopwatch with a warn threshold' },
  { path: 'tools/pat/cubes.html', owner: 'B4.6', why: 'PAT drill stopwatch with a warn threshold' },
  { path: 'tools/pat/holepunch.html', owner: 'B4.6', why: 'PAT drill stopwatch with a warn threshold' },
  { path: 'tools/pat/keyholes.html', owner: 'B4.6', why: 'PAT drill stopwatch' },
  { path: 'tools/pat/patternfold.html', owner: 'B4.6', why: 'PAT drill stopwatch with a warn threshold' },
  { path: 'tools/pat/tfe.html', owner: 'B4.6', why: 'PAT drill timed mode' },
  { path: 'tools/pat/playbook.html', owner: 'B4.6', why: 'the PAT playbook shows a clock element' },
  { path: 'tools/gc/recognition-lab.html', owner: 'B4.2', why: 'Recognition Lab countdown bar (decision 3: untimed)' },
  { path: 'tools/gc/trends.html', owner: 'B4.2', why: 'periodic trends drill timer' },
  { path: 'tools/gc/index.html', owner: 'B4.2', why: 'GChem hub: pacing drill timer, the simulated section clock and the breathing pacer' },
  { path: 'tools/qr/index.html', owner: 'B4.4', why: 'QR hub: pacing drill timer, the simulated section clock and the mental-math timer' },
  { path: 'tools/ochem/index.html', owner: 'B4.3', why: 'OChem hub: the exam-mode clock (a timed set belongs on the Tests door)' },
  { path: 'tools/bio/bio-ap-bootcamp.html', owner: 'B4.1', why: 'the session timer on the Bio AP review page' },
  { path: 'tools/bio/bio-mock.html', owner: 'B4.1', why: 'the Bio mock prints the elapsed time on every question' },
  { path: 'tools/qr/proposals/', owner: 'B5.1', why: 'internal proposals (pacing sims, mental-math timer); hidden from students' },
];

/* ---------- signals ---------- */
const TIME_WORDS = /\b(?:Date\.now|performance\.now|getTime)\b|\b\w*(?:secs?|seconds?|minutes?|remain(?:ing)?|elapsed|timeLeft|secsLeft|clock|countdown|mmss|fmtTime|formatTime|stopwatch)\w*\b/i;
const WRITES = /\.(?:textContent|innerHTML|innerText|value)\s*=|\.style\.(?:width|transform)\s*=|\bsetAttribute\s*\(|\b(?!setTimeout\b|setInterval\b)(?:paint|update|render|show|draw|set)\w*(?:Timer|Clock|Time)\w*\s*\(/;
const MMSS = /(?:\/|%)\s*(?:60|600|3600|60000|60e3|1000)\b|\bpadStart\s*\(\s*2\b|\bfmt\w*\s*\(|\bformat\w*Time\w*\s*\(|\bmmss\s*\(|\btoFixed\s*\(\s*1\s*\)/;
const COUNTS_DOWN = /\b[\w$.]+\s*--|--\s*[\w$.]+|\b[\w$.]+\s*-=\s*1\b/;

function balanced(code, open) { // index of the bracket matching code[open]
  const o = code[open], c = { '(': ')', '{': '}', '[': ']' }[o]; let d = 0;
  for (let k = open; k < code.length; k++) { if (code[k] === o) d++; else if (code[k] === c) { d--; if (d === 0) return k; } }
  return code.length - 1;
}
function splitArgs(s) { const out = []; let d = 0, st = 0; for (let k = 0; k < s.length; k++) { const ch = s[k]; if ('([{'.includes(ch)) d++; else if (')]}'.includes(ch)) d--; else if (ch === ',' && d === 0) { out.push(s.slice(st, k)); st = k + 1; } } out.push(s.slice(st)); return out.map((x) => x.trim()); }
function bodyOf(code, name) {
  const short = name.split('.').pop().replace(/[^\w$]/g, ''); if (!short) return null;
  const re = new RegExp('function\\s+' + short + '\\s*\\(|(?:^|[^\\w$.])' + short + '\\s*[:=]\\s*(?:async\\s*)?(?:function\\b[^{]*|\\([^)]*\\)\\s*=>\\s*|[\\w$]+\\s*=>\\s*)(?=\\{)', 'g');
  const m = re.exec(code); if (!m) return null;
  const open = code.indexOf('{', m.index + m[0].length - (m[0].endsWith('{') ? 1 : 0)); if (open < 0) return null;
  return { start: open, end: balanced(code, open), text: code.slice(open, balanced(code, open) + 1) };
}
const ticks = (body, period) => WRITES.test(body) && (TIME_WORDS.test(body) || (period === 1000 && COUNTS_DOWN.test(body)));

export function clockCode(code) { // code: comments and strings already blanked
  const hits = [];
  const re = /\b(setInterval|setTimeout|requestAnimationFrame)\s*\(/g; let m;
  while ((m = re.exec(code))) {
    const open = m.index + m[0].length - 1, close = balanced(code, open);
    const args = splitArgs(code.slice(open + 1, close)); const fn = args[0] || '';
    const pm = (args[1] || '').match(/^\d+(?:\.\d+)?$/); const period = m[1] === 'requestAnimationFrame' ? 16 : pm ? Number(pm[0]) : null;
    if (period != null && period > 1000) continue;
    if (m[1] === 'setInterval') {
      const inline = /^(?:async\s*)?(?:function\b|\(?[\w$,\s]*\)?\s*=>)/.test(fn);
      const body = inline ? fn : (bodyOf(code, fn) || {}).text || '';
      if (ticks(body, period) || (!inline && /tick|timer|clock|countdown/i.test(fn) && TIME_WORDS.test(body))) hits.push({ at: m.index, what: 'setInterval(' + (inline ? 'function' : fn) + ', ' + (args[1] || '?') + ')' });
    } else if (/^[\w$.]+$/.test(fn)) { // a loop that reschedules itself
      const def = bodyOf(code, fn);
      if (def && m.index > def.start && m.index < def.end && (m[1] === 'requestAnimationFrame' || period >= 50)) {
        // a frame loop is a clock only when it prints a time (an animation reads the clock too)
        const strict = m[1] === 'requestAnimationFrame' ? /\.(?:textContent|innerText|innerHTML)\s*=/.test(def.text) && /\b(?:Date|performance)\.now\b/.test(def.text) && MMSS.test(def.text) : ticks(def.text, period);
        if (strict) hits.push({ at: m.index, what: m[1] + '(' + fn + (args[1] ? ', ' + args[1] : '') + ') loop' });
      }
    }
  }
  return hits;
}
const UI_ATTR = /(?<![\w-])(id|class)\s*=\s*(?:"([^"]*)"|'([^']*)')/gi;
export function clockUi(text) { // markup (an HTML file or a markup string)
  const hits = []; let m; UI_ATTR.lastIndex = 0;
  while ((m = UI_ATTR.exec(text))) {
    const v = (m[2] ?? m[3] ?? '').replace(/\$\{[^}]*\}/g, ' ').replace(/(?:counter|anti)?clockwise/gi, ' ');
    const w = v.match(/[\w-]*(?:timer|countdown|clock|stopwatch)[\w-]*/i);
    if (w) hits.push({ at: m.index, what: `${m[1]}="${w[0]}"` });
  }
  return hits;
}
const LABEL = /^(?:\w+\s)?time\s+(?:remaining|left)\b|\btime'?s\s+up\b|\b(?:\d+|one|two|three|five|ten|ninety|thirty|sixty)?\s*(?:seconds?|secs?|minutes?|mins?)\s+(?:left|remaining)\b|\b(?:days?|weeks?)\s+(?:left|to\s+go|remaining)\b|\bdays?\s+until\s+(?:your|the)\s+(?:test|exam|dat)\b/gi;
export function clockText(text) { // reading text: a countdown phrase in a short run (a label, not a sentence)
  const hits = []; const runRe = /\S+(?:[ \t]\S+)*/g; let r; // a run: words with single spaces (blanked tags leave wider gaps)
  while ((r = runRe.exec(text))) {
    const run = r[0]; if (run.length > 48) continue;
    LABEL.lastIndex = 0; if (LABEL.test(run)) hits.push({ at: r.index, what: run });
  }
  return hits;
}

export function scanClock(rel, src) {
  const line = lineIndex(src); const hits = [];
  for (const s of scriptsOf(rel, src)) for (const h of clockCode(codeOnly(s.code))) hits.push({ signal: 'clock-code', line: line(s.offset + h.at), what: h.what });
  const ext = path.extname(rel).toLowerCase();
  if (ext === '.html' || ext === '.htm' || ext === '.svg') for (const h of clockUi(src.replace(/<!--[\s\S]*?-->/g, (x) => x.replace(/[^\n]/g, ' ')))) hits.push({ signal: 'clock-ui', line: line(h.at), what: h.what });
  for (const seg of readingSegments(rel, src)) {
    if (seg.kind === 'js' && /<[a-z]/i.test(src.slice(seg.offset, seg.offset + seg.text.length))) for (const h of clockUi(src.slice(seg.offset, seg.offset + seg.text.length))) hits.push({ signal: 'clock-ui', line: line(seg.offset + h.at), what: h.what });
    for (const h of clockText(seg.text)) hits.push({ signal: 'clock-text', line: line(seg.offset + h.at), what: h.what });
  }
  const seen = new Set();
  return hits.filter((h) => { const k = h.signal + h.line + h.what; if (seen.has(k)) return false; seen.add(k); return true; });
}
export const allowed = (rel) => {
  const hit = (e) => (e.path.endsWith('/') ? rel.startsWith(e.path) : rel === e.path);
  const t = TIMED.find(hit); if (t) return { kind: 'TIMED', ...t };
  const p = PENDING.find(hit); if (p) return { kind: 'PENDING', ...p };
  return null;
};

/* ---------- cli ---------- */
function main(argv) {
  const args = argv.slice(2); const val = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : undefined; };
  const ROOT = path.resolve(val('--root') || path.join(HERE, '..'));
  const STRICT = args.includes('--strict'), VERBOSE = args.includes('--verbose');
  const files = servedFiles(ROOT, { exts: new Set(['.html', '.htm', '.js', '.mjs', '.svg']) });
  const bad = [], held = { TIMED: [], PENDING: [] }, used = new Set();
  for (const rel of files) {
    const hits = scanClock(rel, fs.readFileSync(path.join(ROOT, rel), 'utf8'));
    if (!hits.length) continue;
    const a = allowed(rel);
    if (a) { used.add(a.path); held[a.kind].push({ rel, hits, a }); if (a.kind === 'PENDING' && STRICT) bad.push({ rel, hits, a }); }
    else bad.push({ rel, hits });
  }
  const stale = [...TIMED, ...PENDING].filter((e) => !used.has(e.path));
  const show = (list, out) => { for (const { rel, hits, a } of list) { out(`  ${rel}${a ? `  [${a.kind}${a.owner ? ' ' + a.owner : ''}: ${a.why}]` : ''}`); for (const h of VERBOSE ? hits : hits.slice(0, 3)) out(`      ${rel}:${h.line}  ${h.signal}  ${h.what}`); if (!VERBOSE && hits.length > 3) out(`      (${hits.length - 3} more; --verbose lists every site)`); } };
  if (VERBOSE) { console.log('held by the allowlist:'); show([...held.TIMED, ...held.PENDING], console.log); }
  if (stale.length) for (const e of stale) console.log(`  stale allowlist entry (no clock found; remove it): ${e.path}`);
  if (bad.length) {
    console.error(`gate-clock: ${bad.length} file(s) show or run a clock outside a timed test${STRICT ? ' (strict: PENDING entries count)' : ''}`);
    show(bad, console.error);
    console.error('  A clock belongs only to a full practice test or the optional Test-phase timer on a section set (TIMED in this script).');
    return 1;
  }
  console.log(`gate-clock: OK (${files.length} files read; ${held.TIMED.length} timed test file(s) allowed, ${held.PENDING.length} pending removal by their batch)`);
  return 0;
}
const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) process.exit(main(process.argv));
