#!/usr/bin/env node
// rewrite-v2.mjs : Gen Chem explanations rewritten in NEW wording, batch by batch, into the sidecars.
//
//   node scripts/bank/rewrite-v2.mjs dump  --private DIR --batch N      print batch N (about 100 items) compactly
//   node scripts/bank/rewrite-v2.mjs dump  --public --batch N
//   node scripts/bank/rewrite-v2.mjs merge --private DIR                 fold every authored batch into the sidecar
//   node scripts/bank/rewrite-v2.mjs merge --public
//
// Authored batches (one JSON record per line, written by hand, never generated from the old sentences):
//   private: DIR/ace-bank-gchem/rewrite-v2/batch-NN.jsonl   (stays in the private bank folder)
//   public:  scripts/bank/out/rewrite-v2/batch-NN.jsonl
//   { id, key, answer, trick, steps: [...], traps: { B: '...' }, check: { q, a }, flag? }
//   trick: 'electrons' | 'redcat' | 'moles'  (Thomas's approved lines, only where they truly fit)
//        | 'qk' | 'chaos' | 'colli' | 'vp' | 'titr' | 'mcat' | 'zero'  (recorded, pending his approval)
//        | 'draft: text'  (written here, "Draft trick, Thomas to approve")
//   flag: a suspected key or explanation problem in the SOURCE item (reported, never fixed silently)
//
// merge refuses a record that: changes the key, misses a wrong choice's trap, fails the standard
// (shared/ace-walkthrough.js validate), or states a number that is neither in the item nor the
// result of an arithmetic claim that recomputes (checked in scripts/bank/verify-rewrites.py).
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const require = createRequire(import.meta.url);
const W = require(path.join(ROOT, 'shared/ace-walkthrough.js'));
const [cmd, ...args] = process.argv.slice(2);
const opt = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
const L = 'ABCDE', TODAY = '2026-11-19', SIZE = 100;
const LINES = {
  electrons: { text: 'Electrons always flow from the anode to the cathode.', src: 'Zoom 2026-04-28 #84183655423 ~0:48:29', approved: TODAY },
  redcat: { text: 'Reduction is at the cathode, red cat. The oxidation occurs at the anode and ox.', src: 'Zoom 2026-04-28 #84183655423 ~0:14:46', approved: TODAY },
  moles: { text: "Moles are king. We always want to get to moles, it's so crucial", src: 'Zoom 2026-09-03 #85955264465 ~0:45:01', approved: TODAY },
  qk: { text: 'Q versus K, right? Q less than K, shift right, Q greater than K, shift left.', src: 'Zoom 2026-05-12 #81751380276 ~0:42:08', pending: true },
  chaos: { text: 'we know that, as a rule, the universe wants to be random. It wants chaos', src: 'Zoom 2026-05-05 #87057078433 ~0:51:48', pending: true },
  colli: { text: "it's based upon the number of molecules", src: 'Zoom 2026-05-26 #89388063614 ~0:41:44', pending: true },
  vp: { text: 'Vapor pressure and boiling point have an inverse relationship.', src: 'Zoom 2026-06-29 #83198019799 ~0:15:48', pending: true },
  titr: { text: 'the first step, always, in a titration is to write out the balanced equation.', src: 'Zoom 2026-05-19 #85100490191 ~0:09:54', pending: true },
  mcat: { text: 'The way a lot of people like it is Q equals MCAT', src: 'Zoom 2026-06-17 #84628460505 ~0:40:03', pending: true },
  zero: { text: "if the rate doesn't change based on the concentration. 0th order.", src: 'Zoom 2026-07-31 #88197467164 ~1:31:03', pending: true }
};

function load(isPrivate) {
  if (isPrivate) {
    const b = path.join(opt('--private'), 'ace-bank-gchem'), tags = JSON.parse(fs.readFileSync(path.join(b, 'ace-bank-gchem.tags.json'), 'utf8')).tags;
    const calc = {}; for (const f of fs.readdirSync(path.join(b, 'checks')).filter((x) => /calc\.json$/.test(x))) Object.assign(calc, JSON.parse(fs.readFileSync(path.join(b, 'checks', f), 'utf8')));
    const items = [];
    for (const f of fs.readdirSync(path.join(b, 'items')).filter((x) => x.endsWith('.jsonl')).sort())
      for (const line of fs.readFileSync(path.join(b, 'items', f), 'utf8').split('\n')) if (line.trim()) { const it = JSON.parse(line); if (it.section === 'gchem') items.push(it); }
    items.sort((a, z) => a.id.localeCompare(z.id));
    return { items: items.map((it) => ({ id: it.id, sub: (tags[it.id] || {}).subtopic || '', stem: it.stem, choices: it.choices, key: it.answer, why: (it.explanation || {}).correct || '', fast: (it.explanation || {}).fastest || '', wrong: (it.explanation || {}).wrong || {}, trick: it.trick || '', calc: calc[it.id] ? calc[it.id].expr : '', prov: it.provenance || 'original' })),
      dir: path.join(b, 'rewrite-v2'), sidecar: path.join(b, 'explanations-standard.json'), name: 'ace-bank-gchem (private)' };
  }
  const d = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/gchem.json'), 'utf8'));
  return { items: d.items.map((it) => ({ id: it.id, sub: it.canon || it.skill || '', stem: it.stem, choices: it.choices, key: L[it.answer], why: it.why, fast: '', wrong: {}, trick: it.trick || '', calc: '', prov: 'Ace Labs public bank' })),
    dir: path.join(ROOT, 'scripts/bank/out/rewrite-v2'), sidecar: path.join(ROOT, 'scripts/bank/out/gchem-explanations-standard.json'), name: 'data/gchem.json (public)' };
}

const set = load(!!opt('--private'));
if (cmd === 'dump') {
  const n = Number(opt('--batch') || 1), part = set.items.slice((n - 1) * SIZE, n * SIZE);
  for (const it of part) {
    const lines = [`### ${it.id} [${it.sub}] key ${it.key}${it.calc ? ' | calc ' + it.calc : ''}`, 'Q: ' + it.stem];
    it.choices.forEach((c, i) => lines.push(`${L[i]}${L[i] === it.key ? '*' : ' '} ${c}${it.wrong[L[i]] ? '  || ' + it.wrong[L[i]] : ''}`));
    lines.push('E: ' + it.why + (it.fast ? ' || F: ' + it.fast : ''));
    console.log(lines.join('\n'));
  }
  console.error(`batch ${n}: ${part.length} items (${part[0] && part[0].id} to ${part.length && part[part.length - 1].id}) of ${set.items.length}`);
  process.exit(0);
}
if (cmd !== 'merge') { console.error('dump or merge'); process.exit(2); }

const byId = Object.fromEntries(set.items.map((it) => [it.id, it]));
const done = {}, refused = [];
if (fs.existsSync(set.dir)) for (const f of fs.readdirSync(set.dir).filter((x) => /^batch-\d+\.jsonl$/.test(x)).sort()) {
  fs.readFileSync(path.join(set.dir, f), 'utf8').split('\n').forEach((line, ln) => {
    if (!line.trim()) return;
    let r; try { r = JSON.parse(line); } catch (e) { refused.push(`${f}:${ln + 1} bad JSON`); return; }
    const it = byId[r.id]; if (!it) { refused.push(`${r.id}: not in the bank`); return; }
    const why = [];
    if (r.key !== it.key) why.push(`key ${r.key} is not the bank key ${it.key}`);
    let trick;
    if (typeof r.trick === 'string' && r.trick.startsWith('draft:')) trick = { text: r.trick.slice(6).trim(), draft: true };
    else if (LINES[r.trick]) trick = Object.assign({}, LINES[r.trick]);
    else why.push('unknown trick ' + r.trick);
    const traps = {};
    it.choices.forEach((_, i) => { if (L[i] !== it.key) { traps[L[i]] = r.traps && r.traps[L[i]]; if (!traps[L[i]]) why.push('no trap for ' + L[i]); } });
    const sources = [`ACE DAT Gen Chem bank, ${it.id} (${it.prov}).`, `Explanation rewritten in new wording, ${TODAY}. Review pending.`];
    if (trick && trick.src) sources.push(`Thomas's line: ${trick.src}, ${trick.approved ? 'approved ' + trick.approved : 'pending his approval'}.`);
    const explain = { answer: r.answer, trick, steps: r.steps, traps, check: r.check, sources };
    why.push(...W.validate(explain));
    if (why.length) { refused.push(`${r.id}: ${why.join('; ')}`); return; }
    done[r.id] = { id: it.id, key: it.key, subtopic: it.sub, status: 'rewritten', method: 'new-wording', review: 'pending', reasons: [],
      trickKind: trick.approved ? 'approved' : trick.pending ? 'pending' : 'draft', flag: r.flag || null, explain };
  });
}
// earlier records stay only as a fallback for items not yet rewritten in new wording
const old = fs.existsSync(set.sidecar) ? JSON.parse(fs.readFileSync(set.sidecar, 'utf8')).records : [];
const oldBy = Object.fromEntries(old.map((r) => [r.id, r]));
const records = set.items.map((it) => done[it.id] || Object.assign({}, oldBy[it.id] || { id: it.id, key: it.key, subtopic: it.sub, review: 'pending', explain: null },
  { status: 'not-yet-rewritten', method: (oldBy[it.id] && oldBy[it.id].explain) ? 'sentence-split-v1' : null, review: 'pending' }));
const count = (f) => records.filter(f).length;
const summary = { bank: set.name, made: TODAY, items: records.length, rewritten: count((r) => r.status === 'rewritten'), notYet: count((r) => r.status !== 'rewritten'),
  trick: { approved: count((r) => r.trickKind === 'approved' && r.status === 'rewritten'), pending: count((r) => r.trickKind === 'pending' && r.status === 'rewritten'), draft: count((r) => r.trickKind === 'draft' && r.status === 'rewritten') },
  flagged: count((r) => r.flag), refused: refused.length };
fs.writeFileSync(set.sidecar, JSON.stringify({ format: 2, note: 'Explanation-standard rewrites in new wording (docs/EXPLANATION-STANDARD.md). Sidecar only: the bank is unchanged. Every record is review pending. status not-yet-rewritten keeps the older sentence-split draft, if any, for reference only.', summary, records }, null, 1) + '\n');
console.log(JSON.stringify(summary));
refused.forEach((x) => console.log('REFUSED ' + x));
