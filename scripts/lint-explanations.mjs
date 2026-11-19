#!/usr/bin/env node
// lint-explanations.mjs : flags explanations that break docs/EXPLANATION-STANDARD.md.
//
//   node scripts/lint-explanations.mjs                 report every source, exit 0
//   node scripts/lint-explanations.mjs --strict        exit 1 if STANDARD-SHAPE content fails
//                                                      (data-explain blocks and walkthrough modules);
//                                                      legacy content is reported, never fails
//   node scripts/lint-explanations.mjs --json FILE     also write every finding as JSON
//   node scripts/lint-explanations.mjs --private DIR   also lint the private banks in DIR/ace-bank-*/
//                                                      (counts only; no question text is printed)
//   node scripts/lint-explanations.mjs --list N        print the first N failing items per source
//
// The rules (one place: shared/ace-walkthrough.js validate(), used here and by the panel):
//   answer, trick, check: one line (80 characters: one desktop row, two phone rows)
//   steps: 3 to 5, about 12 words each (fail over 14), one bold term at most
//   trap: one per wrong choice, two lines at most (160 characters), two sentences at most
//   sources: present (collapsed on screen, no length rule)
//   no paragraph over 2 lines anywhere; no em dash; no emoji or glyph icons
//   a trick is Thomas's recorded line with its source, or marked draft
// Legacy content (bank `why` paragraphs, old rule boxes) is mapped onto the same parts: the first
// sentence of `why` is the answer, `steps`, `traps`, `trick` are used when the item has them.
// Dependency-free.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const W = require(path.join(ROOT, 'shared/ace-walkthrough.js'));
const args = process.argv.slice(2);
const opt = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
const STRICT = args.includes('--strict'), JSON_OUT = opt('--json'), PRIVATE = opt('--private'), LIST = Number(opt('--list') || 0);
const MAXP = W.LIMITS.lineChars * 2;

const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', deg: '°', minus: '−', times: '×', ldquo: '“', rdquo: '”', lsquo: '‘', rsquo: '’', mdash: '—', ndash: '–', rarr: '→', larr: '←', middot: '·', hellip: '…' };
const decode = (s) => String(s).replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16))).replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d)).replace(/&([a-z]+);/gi, (m, n) => ENT[n.toLowerCase()] ?? m);
const text = (html) => decode(String(html).replace(/<sup>/gi, '^{').replace(/<\/sup>/gi, '}').replace(/<sub>/gi, '_{').replace(/<\/sub>/gi, '}').replace(/<b>|<strong>/gi, '**').replace(/<\/b>|<\/strong>/gi, '**').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();

/* buckets, so the report reads as "how many items fail for which reason" */
function bucket(p) {
  if (/em dash/.test(p)) return 'em dash';
  if (/glyph/.test(p)) return 'emoji or glyph icon';
  if (/^paragraph/.test(p)) return 'paragraph over 2 lines';
  if (/^missing answer/.test(p)) return 'missing answer line';
  if (/^answer:/.test(p)) return 'answer over 1 line';
  if (/^missing trick|^trick: needs/.test(p)) return /needs/.test(p) ? 'trick without a source or draft label' : 'missing trick';
  if (/^trick:/.test(p)) return 'trick over 1 line';
  if (/^steps: 0/.test(p)) return 'missing steps';
  if (/^steps:/.test(p)) return 'steps not 3 to 5';
  if (/words/.test(p)) return 'step over 12 words';
  if (/bold/.test(p)) return 'more than one bold term in a step';
  if (/^step \d+:/.test(p)) return 'step over 1 line';
  if (/^missing traps/.test(p)) return 'missing per-choice traps';
  if (/^trap /.test(p)) return 'trap over 2 lines';
  if (/^missing check/.test(p)) return 'missing check yourself';
  if (/^check/.test(p)) return 'check over 1 line';
  if (/^missing sources/.test(p)) return 'missing sources';
  return p;
}
const findings = [];
const sources = new Map();   // name -> { kind, items, fail, buckets }
function report(src, kind, id, problems) {
  const s = sources.get(src) || { kind, items: 0, fail: 0, buckets: {}, failing: [] };
  s.items += 1;
  const b = [...new Set(problems.map(bucket))];
  if (b.length) { s.fail += 1; b.forEach((k) => { s.buckets[k] = (s.buckets[k] || 0) + 1; }); if (s.failing.length < 200) s.failing.push({ id, problems: b }); }
  sources.set(src, s);
  findings.push({ source: src, kind, id, problems: b });
}
/* a free paragraph: the 2-line rule plus the glyph rules */
function para(name, t) {
  const out = [], p = W.plain(t);
  if (p.length > MAXP || W.sentences(t) > 2) out.push(`paragraph: ${name} is ${p.length} chars, ${W.sentences(t)} sentences`);
  if (/—/.test(t)) out.push(name + ': em dash');
  return out;
}

/* ---- 1. the public banks in data/*.json (legacy shape) ---- */
function firstSentence(s) { const m = W.plain(s).match(/^.*?[.!?](?=\s|$)/); return m ? m[0] : W.plain(s); }
function legacyItem(it) {
  const why = it.why || '';
  const ex = { answer: why ? firstSentence(why) : '', trick: it.trick ? (typeof it.trick === 'string' ? { text: it.trick, draft: true } : it.trick) : null,
    steps: it.steps || [], traps: {}, check: it.check || null, sources: it.sources || [] };
  (it.traps || []).forEach((t, i) => { if (i !== it.answer) ex.traps[i] = t; });
  if (it.traps && !Object.values(ex.traps).some(Boolean)) ex.traps = {};
  return W.validate(ex).concat(para('why', why));
}
for (const f of fs.readdirSync(path.join(ROOT, 'data')).filter((f) => f.endsWith('.json')).sort()) {
  let d; try { d = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', f), 'utf8')); } catch { continue; }
  const items = Array.isArray(d) ? d : d.items;
  if (!Array.isArray(items) || !items.some((x) => x && x.why)) continue;
  for (const it of items) report('data/' + f, 'legacy', it.id, legacyItem(it));
}

/* ---- 2. served HTML: standard blocks (data-explain) and old rule boxes ---- */
const SKIP_REL = /^(node_modules|\.git|docs|research|specs|scripts|test-screenshots|\.netlify|netlify|\.claude|dist-astro|astro-proto|bank-private)(\/|$)|^tests\//;
const SKIP_SEG = /(^|\/)(research|verification|proposals)(\/|$)/;
function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name), rel = path.relative(ROOT, p).split(path.sep).join('/');
    if (SKIP_REL.test(rel) || SKIP_SEG.test(rel)) continue;
    if (e.isDirectory()) walk(p, out); else if (/\.html?$/.test(e.name)) out.push(rel);
  }
  return out;
}
/* the element that opens at index i, with its matching close (same tag name, nesting counted) */
function elementAt(src, i) {
  const tag = /^<([a-z0-9]+)/i.exec(src.slice(i))[1].toLowerCase();
  const re = new RegExp(`<(/?)${tag}\\b[^>]*>`, 'gi'); re.lastIndex = i; let depth = 0, m;
  while ((m = re.exec(src))) { depth += m[1] ? -1 : 1; if (depth === 0) return src.slice(i, re.lastIndex); }
  return src.slice(i);
}
const cls = (block, c) => { const re = new RegExp(`<([a-z0-9]+)[^>]*class="[^"]*\\b${c}\\b[^"]*"[^>]*>`, 'i'); const m = re.exec(block); return m ? elementAt(block, m.index) : null; };
const strip = (h) => h ? text(h.replace(/<span class="ax-k">[\s\S]*?<\/span>/gi, '').replace(/<summary>[\s\S]*?<\/summary>/gi, '')) : '';
const SECTION_HEAD = /<h[1-4][^>]*>([^<]*\b(?:rule|why|explanation|the trap|trick|how to get there)\b[^<]*)<\/h[1-4]>/i;
for (const rel of walk(ROOT)) {
  const src = fs.readFileSync(path.join(ROOT, rel), 'utf8').replace(/<!--[\s\S]*?-->/g, '').replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '');
  let m; const reX = /<[a-z0-9]+\b[^>]*\bdata-explain="([^"]*)"[^>]*>/gi;
  while ((m = reX.exec(src))) {
    if (!/^[a-z0-9][a-z0-9-]*$/i.test(m[1])) {   // an older tool keeps its explanation text in the attribute itself
      const t = text(decode(m[1]));
      report(rel + ' (data-explain text)', 'legacy', t.slice(0, 48), ['missing answer line (not in the standard shape)'].concat(para('explanation', t)));
      continue;
    }
    const block = elementAt(src, m.index);
    const steps = []; const ol = cls(block, 'ax-steps');
    if (ol) { let li; const reL = /<li\b[^>]*>([\s\S]*?)<\/li>/gi; while ((li = reL.exec(ol))) { steps.push({ text: text(li[1]), frame: (/data-frame="(\d+)"/.exec(li[0]) || [])[1] }); } }
    const trickEl = cls(block, 'ax-trick'), check = cls(block, 'ax-check'), q = check ? cls(check, 'ax-q') : null, a = check ? cls(check, 'ax-a') : null;
    const ex = { answer: strip(cls(block, 'ax-answer')), trick: trickEl ? { text: strip(trickEl).replace(/^[\u201C"]|[\u201D"]$/g, ''), src: (/data-said="([^"]+)"/.exec(trickEl) || [])[1], draft: /data-draft/.test(trickEl) } : null,
      steps, traps: {}, check: q ? { q: strip(q), a: strip(a) } : null, sources: /class="[^"]*\bax-sources\b/.test(block) ? ['present'] : [] };
    const trap = strip(cls(block, 'ax-trap')); if (trap) ex.traps.any = trap;
    const probs = W.validate(ex);
    steps.forEach((s, i) => { if (!s.frame) probs.push(`step ${i + 1}: no board frame (data-frame)`); });
    report(rel + '#' + m[1], 'standard', m[1], probs);
  }
  // old rule boxes: a section whose heading says rule / why / trap / trick, not yet in the standard shape
  const reS = /<section\b[^>]*>/gi;
  while ((m = reS.exec(src))) {
    if (/data-explain/.test(m[0])) continue;
    const block = elementAt(src, m.index), h = SECTION_HEAD.exec(block);
    if (!h || /library|catalog/i.test(h[1]) || /<section\b/i.test(block.slice(m[0].length))) continue;
    const paras = []; let p; const reP = /<p\b[^>]*>([\s\S]*?)<\/p>/gi; while ((p = reP.exec(block))) paras.push(text(p[1]));
    const probs = ['missing answer line (not in the standard shape)'];
    paras.forEach((t, i) => probs.push(...para('paragraph ' + (i + 1), t)));
    if (W.GLYPHS.test(paras.join(' ').replace(/\u2014/g, ''))) probs.push('glyph or emoji');
    report(rel, 'legacy', text(h[1]).slice(0, 60), probs);
  }
}

/* ---- 3. walkthrough modules (every generated explanation, all cases) ---- */
function mod(rel) { const p = path.join(ROOT, rel); return fs.existsSync(p) ? require(p) : null; }
const GW = mod('gc/galvanic/galvanic-walk.js');
if (GW) {
  for (const a of GW.HALF) for (const b of GW.HALF) {
    const c = GW.cell(a.id, b.id); if (!c) continue;
    report('gc/galvanic/galvanic-walk.js', 'standard', 'direction ' + a.id + '|' + b.id, W.validate(GW.explain(c)));
    const it = GW.checkItem(c, 0);
    report('gc/galvanic/galvanic-walk.js', 'standard', 'check ' + a.id + '|' + b.id, W.validate(GW.explainCheck(c, it)));
  }
  for (const [x, y] of GW.pairs(0.1)) for (const t of GW.TYPES) {
    const v = GW.variant(t, x, y, 1);
    const traps = {}; v.traps.forEach((t2, i) => { traps[i] = t2; });
    report('gc/galvanic/galvanic-walk.js', 'standard', v.id, W.validate({ answer: v.why, trick: GW.TRICK, steps: v.steps, traps, check: { q: v.stem.slice(-60) }, sources: GW.SOURCES }).filter((p) => !/^check/.test(p)));
  }
}
const GQ = mod('gc/guacamole/guac-walk.js');
if (GQ) {
  for (const it of GQ.ITEMS) it.ch.forEach((c, i) => { if (!c.ok) report('gc/guacamole/guac-walk.js', 'standard', it.id + ' pick ' + i, W.validate(GQ.explain(it.id, i).explain)); });
  for (const fam of Object.keys(GQ.FAMILIES)) {
    const [A, B] = GQ.grid(fam);
    for (let a = 0; a < A; a++) for (let b = 0; b < B; b++) {
      const v = GQ.variant(fam, a, b); if (!v) continue;
      const traps = {}; v.traps.forEach((t, i) => { traps[i] = t; });
      report('gc/guacamole/guac-walk.js', 'standard', v.id, W.validate({ answer: v.why, trick: GQ.TRICK, steps: v.steps, traps, check: { q: 'x' }, sources: GQ.SOURCES }));
    }
  }
}

/* ---- 4. optional: the private banks (counts only) ---- */
if (PRIVATE) {
  for (const b of ['bio', 'gchem', 'ochem', 'qr', 'rc']) {
    const dir = path.join(PRIVATE, 'ace-bank-' + b, 'items'); if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.jsonl')).sort()) {
      for (const line of fs.readFileSync(path.join(dir, f), 'utf8').split('\n')) {
        if (!line.trim()) continue; let it; try { it = JSON.parse(line); } catch { continue; }
        const ex = it.explanation || {}, L = 'ABCDE';
        const key = typeof it.answer === 'number' ? L[it.answer] : it.answer;
        const traps = {}; Object.keys(ex.wrong || {}).forEach((k) => { if (k !== key) traps[k] = ex.wrong[k]; });
        const why = ex.correct || '';
        const probs = W.validate({ answer: why ? firstSentence(why) : '', trick: it.trick ? { text: it.trick, draft: true } : null, steps: [], traps, check: null, sources: [] })
          .concat(para('explanation', why)).concat(ex.fastest ? para('fastest', ex.fastest) : []);
        report('private ace-bank-' + b, 'private', it.id, probs);
      }
    }
  }
}

/* ---- report ---- */
let strictFail = 0, total = 0, failing = 0;
console.log('lint-explanations: docs/EXPLANATION-STANDARD.md\n');
for (const [name, s] of sources) {
  total += s.items; failing += s.fail; if (s.kind === 'standard') strictFail += s.fail;
  console.log(`${name}  [${s.kind}]  ${s.items} items, ${s.fail} fail (${s.items ? Math.round(100 * s.fail / s.items) : 0}%)`);
  Object.entries(s.buckets).sort((a, b) => b[1] - a[1]).forEach(([k, n]) => console.log(`    ${String(n).padStart(5)}  ${k}`));
  if (LIST && s.kind !== 'private') s.failing.slice(0, LIST).forEach((f) => console.log(`      ${f.id}: ${f.problems.join('; ')}`));
}
console.log(`\nAll sources: ${total} items, ${failing} fail. Standard-shape content failing: ${strictFail}.`);
if (JSON_OUT) fs.writeFileSync(JSON_OUT, JSON.stringify({ when: new Date().toISOString(), summary: Object.fromEntries([...sources].map(([k, v]) => [k, { kind: v.kind, items: v.items, fail: v.fail, buckets: v.buckets }])), findings: findings.filter((f) => f.kind !== 'private' && f.problems.length) }, null, 1));
if (STRICT && strictFail) { console.error(`lint-explanations: ${strictFail} standard-shape explanation(s) break the standard`); process.exit(1); }
