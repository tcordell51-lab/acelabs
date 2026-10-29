#!/usr/bin/env node
// gate-count-claims.mjs : every number a hub page claims matches the bank it points at.
//
//   node gate-count-claims.mjs [repoRoot]      exit 1 on drift, prints path:line claim vs truth
//
// Checks
//   games/index.html   "<n> questions" on each gcard  ->  games/<subject>.json length
//                                                        (ochem: games/ochem-bank-1000.js, all or kept)
//   ace-labs.html      tile tags: "<n> nights"        ->  NIGHTS[n] entries in the linked tool
//                                 "<n> tests"         ->  shared/scope.js MOCKS.count
//                                 "<n> full-lengths"  ->  tools/mock/data/full-mocks.js mocks.length
//                      "<n> questions" on the Full-length tile -> a full mock's real item total
//   tests/index.html   "<n> questions" on the Full-length card  -> same
// Dependency-free, ~0.3 s.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';

const ROOT = path.resolve(process.argv[2] || '.');
const require = createRequire(path.join(ROOT, 'package.json'));
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const lineOf = (s, i) => s.slice(0, i).split('\n').length;
const num = (s) => parseInt(String(s).replace(/,/g, ''), 10);
function windowGlobal(rel, name) {
  const ctx = { window: {} }; ctx.self = ctx.window; vm.createContext(ctx);
  vm.runInContext(read(rel), ctx); return ctx.window[name];
}
const problems = [];
const bad = (rel, idx, src, msg) => problems.push(`${rel}:${lineOf(src, idx)}  ${msg}`);

/* ---- games hub ---- */
{
  const rel = 'games/index.html', src = read(rel);
  const re = /<a class="gcard" href="play\.html\?subject=(\w+)">([\s\S]*?)<\/a>/g; let m;
  while ((m = re.exec(src))) {
    const subj = m[1], q = m[2].match(/([\d,]+)\s+questions/);
    if (!q) continue;
    const claimed = num(q[1]); let truth, note = '';
    if (subj === 'ochem') {
      const s = read('games/ochem-bank-1000.js'); const arr = JSON.parse(s.slice(s.indexOf('['), s.lastIndexOf(']') + 1));
      const kept = arr.filter((x) => x.keep !== false && x.scope_ok !== false).length;
      truth = [arr.length, kept]; note = ` (bank ${arr.length} total, ${kept} kept)`;
    } else {
      const d = JSON.parse(read(`games/${subj}.json`)); const arr = Array.isArray(d) ? d : d.items || d.questions;
      truth = [arr.length];
    }
    if (!truth.includes(claimed)) bad(rel, m.index + m[0].indexOf(q[0]), src, `"${q[0]}" for ${subj} but games/${subj === 'ochem' ? 'ochem-bank-1000.js' : subj + '.json'} holds ${truth[0]}${note}`);
  }
}

/* ---- home tiles ---- */
const scope = require(path.join(ROOT, 'shared/scope.js'));
const mocks = windowGlobal('tools/mock/data/full-mocks.js', 'ACE_FULL_MOCKS');
function fullMockTotals() {
  // science sections + PAT 90 + RC section + QR, per mock
  let rcByIdQ = {};
  try {
    const secs = JSON.parse(read('tools/rc/data/sections.json'));
    const pq = {}; for (const f of fs.readdirSync(path.join(ROOT, 'tools/rc/data/passages'))) { const p = JSON.parse(read('tools/rc/data/passages/' + f)); pq[p.id] = p.questions.length; }
    for (const s of secs) rcByIdQ[s.id] = s.passages.reduce((a, id) => a + (pq[id] || 0), 0);
  } catch { /* no RC data */ }
  return mocks.mocks.map((k) => {
    const sci = Object.values(k.sections || {}).filter(Array.isArray).reduce((a, l) => a + l.length, 0);
    const rc = rcByIdQ[k.rc] || rcByIdQ[k.rcSection] || rcByIdQ[(k.sections || {}).rc] || 50;
    return sci + 90 + rc;
  });
}
function nightsIn(href) {
  const rel = href.replace(/^\//, '').replace(/\/$/, '') + '/index.html';
  if (!fs.existsSync(path.join(ROOT, rel))) return null;
  const s = read(rel); const ids = new Set((s.match(/\bNIGHTS\[(\d+)\]\s*=/g) || []).map((x) => x.match(/\d+/)[0]));
  if (ids.size) return ids.size;
  const c = s.match(/NIGHT_COUNT\s*=\s*(\d+)/); return c ? +c[1] : null;
}
for (const rel of ['ace-labs.html', 'tests/index.html']) {
  if (!fs.existsSync(path.join(ROOT, rel))) continue;
  const src = read(rel);
  const re = /<a class="tool"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>|<article class="card"[^>]*>([\s\S]*?)<\/article>/g; let m;
  while ((m = re.exec(src))) {
    const href = m[1] || ((m[3] || '').match(/href="([^"]+)"/) || [])[1] || '';
    const body = m[2] || m[3] || '';
    const at = (frag) => m.index + m[0].indexOf(frag);
    let t;
    if ((t = body.match(/([\d,]+)\s+nights\b/))) { const truth = nightsIn(href); if (truth != null && num(t[1]) !== truth) bad(rel, at(t[0]), src, `"${t[0]}" but ${href} defines ${truth} nights`); }
    if ((t = body.match(/([\d,]+)\s+tests\b/)) && /prometric|practice test/i.test(body + href)) { if (num(t[1]) !== scope.MOCKS.count) bad(rel, at(t[0]), src, `"${t[0]}" but shared/scope.js MOCKS.count is ${scope.MOCKS.count}`); }
    if ((t = body.match(/([\d,]+)\s+full-lengths?\b/))) { if (num(t[1]) !== mocks.mocks.length) bad(rel, at(t[0]), src, `"${t[0]}" but tools/mock/data/full-mocks.js has ${mocks.mocks.length} mocks (${mocks.mocks.map((k) => k.id).join(', ')})`); }
    if (/full-length/i.test(body) && (t = body.match(/([\d,]+)\s+questions\b/i))) { const totals = fullMockTotals(); if (!totals.includes(num(t[1]))) bad(rel, at(t[0]), src, `"${t[0]}" but the full mocks total ${[...new Set(totals)].join('/')}`); }
  }
}

if (problems.length) {
  console.error(`gate-count-claims: ${problems.length} count claim(s) drift from their banks`);
  for (const p of problems) console.error('  ' + p);
  process.exit(1);
}
console.log('gate-count-claims: OK (games hub, home tiles and tests hub agree with the banks)');
