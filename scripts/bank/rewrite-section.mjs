#!/usr/bin/env node
// rewrite-section.mjs : explanation-standard rewrites (new wording) for QR, OChem, Bio and RC,
// the same pipeline Gen Chem used (scripts/bank/rewrite-v2.mjs), one sidecar per bank.
//
//   node scripts/bank/rewrite-section.mjs dump  --section qr --public  --batch N [--size 40]
//   node scripts/bank/rewrite-section.mjs dump  --section qr --private DIR --batch N
//   node scripts/bank/rewrite-section.mjs merge --section qr --public
//   node scripts/bank/rewrite-section.mjs merge --section qr --private DIR
//   node scripts/bank/rewrite-section.mjs ids   --section qr --public            every id, in batch order
//
// Sections: qr (data/qr-climb.json + data/qr-dat.json), ochem (data/ochem.json), bio (data/bio.json),
// rc (tools/rc/data/passages). Private: DIR/ace-bank-<section>/items, sidecar and batches stay there.
//
// Authored batches, one JSON record per line, written by hand in new wording:
//   public:  scripts/bank/out/rewrite-<section>/batch-NN.jsonl
//   private: DIR/ace-bank-<section>/rewrite-v2/batch-NN.jsonl
//   { id, key, answer, trick, steps: [...], traps: { B: '...' }, check: { q, a }, calc?, flag? }
//   trick: 'electrons' | 'redcat' | 'moles'       Thomas's approved lines (2026-11-19), only where they fit
//        | 'd:<code>'                            a draft line from scripts/bank/draft-tricks.json
//        | 'draft: text'                         a one-off draft line
//        Drafts show as "Draft trick, Thomas to approve" and are listed in unapproved-lines.md.
//   calc: the item re-solved in code (Python, checked by scripts/bank/verify-section.py):
//        a number compared with the keyed choice (and with every other choice, to catch a
//        two-answer item), a True assertion, or a choice letter.
//   flag: a suspected key, stem or scope problem in the SOURCE item. Reported, never fixed here.
//
// merge refuses a record that changes the key, misses a wrong choice's trap, or fails the
// standard (shared/ace-walkthrough.js validate). Banks are never written.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const require = createRequire(import.meta.url);
const W = require(path.join(ROOT, 'shared/ace-walkthrough.js'));
const [cmd, ...args] = process.argv.slice(2);
const opt = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
const L = 'ABCDE', TODAY = '2026-11-20';
const SECTION = opt('--section'), PRIVATE = opt('--private'), SIZE = Number(opt('--size') || 40);
const NAMES = { qr: 'Quantitative Reasoning', ochem: 'Organic Chemistry', bio: 'Biology', rc: 'Reading Comprehension' };
if (!NAMES[SECTION]) { console.error('--section qr | ochem | bio | rc'); process.exit(2); }
const APPROVED = {
  electrons: { text: 'Electrons always flow from the anode to the cathode.', src: 'Zoom 2026-04-28 #84183655423 ~0:48:29', approved: '2026-11-19' },
  redcat: { text: 'Reduction is at the cathode, red cat. The oxidation occurs at the anode and ox.', src: 'Zoom 2026-04-28 #84183655423 ~0:14:46', approved: '2026-11-19' },
  moles: { text: "Moles are king. We always want to get to moles, it's so crucial", src: 'Zoom 2026-09-03 #85955264465 ~0:45:01', approved: '2026-11-19' }
};
const DRAFTS = JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts/bank/draft-tricks.json'), 'utf8'));

function jsonl(f) { return fs.readFileSync(f, 'utf8').split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l)); }
function load() {
  if (PRIVATE) {
    const b = path.join(PRIVATE, 'ace-bank-' + SECTION);
    let tags = {}; const tf = path.join(b, `ace-bank-${SECTION}.tags.json`);
    if (fs.existsSync(tf)) { const t = JSON.parse(fs.readFileSync(tf, 'utf8')); tags = t.tags || t; }
    const items = [];
    for (const f of fs.readdirSync(path.join(b, 'items')).filter((x) => x.endsWith('.jsonl') && !/passages/.test(x)).sort())
      for (const it of jsonl(path.join(b, 'items', f))) if (it.section === SECTION && it.stem) items.push(it);
    items.sort((a, z) => a.id.localeCompare(z.id, 'en', { numeric: true }));
    return { items: items.map((it) => ({ id: it.id, sub: (tags[it.id] || {}).subtopic || it.canon || it.skill_id || '', stem: it.stem, choices: it.choices, key: it.answer,
      why: (it.explanation || {}).correct || '', fast: (it.explanation || {}).fastest || '', wrong: (it.explanation || {}).wrong || {}, trick: it.trick || '',
      passage: it.passage_id || '', image: it.image ? (it.image.alt || 'image') : '', prov: it.provenance || 'original' })),
      dir: path.join(b, 'rewrite-v2'), sidecar: path.join(b, 'explanations-standard.json'), name: `ace-bank-${SECTION} (private)` };
  }
  let items = [];
  if (SECTION === 'rc') {
    const dir = path.join(ROOT, 'tools/rc/data/passages');
    for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.json')).sort()) {
      const p = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
      for (const q of p.questions) items.push({ id: q.id, sub: q.type, stem: q.stem, choices: q.choices, key: L[q.key], why: q.why || '', fast: '',
        wrong: Object.fromEntries((q.distractorNotes || []).map((t, i) => [L[i], t]).filter(([, t]) => t)), trick: '', passage: p.id,
        proof: (q.proof || []).map((x) => `P${x.paragraph}: ${x.quote}`).join(' | '), prov: 'Ace Labs RC bank' });
    }
  } else {
    const files = SECTION === 'qr' ? ['data/qr-climb.json', 'data/qr-dat.json'] : [`data/${SECTION}.json`];
    for (const f of files) for (const it of JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8')).items)
      items.push({ id: it.id, sub: it.canon || it.skill || '', stem: it.stem, choices: it.choices, key: L[it.answer], why: it.why, fast: '', wrong: {}, trick: it.trick || '', prov: 'Ace Labs public bank, ' + f });
  }
  return { items, dir: path.join(ROOT, `scripts/bank/out/rewrite-${SECTION}`), sidecar: path.join(ROOT, `scripts/bank/out/${SECTION}-explanations-standard.json`),
    name: SECTION === 'qr' ? 'data/qr-climb.json + data/qr-dat.json (public)' : SECTION === 'rc' ? 'tools/rc/data/passages (public)' : `data/${SECTION}.json (public)` };
}

const set = load();
if (cmd === 'ids') { set.items.forEach((it, i) => console.log(`${Math.floor(i / SIZE) + 1}\t${it.id}`)); process.exit(0); }
if (cmd === 'dump') {
  const n = Number(opt('--batch') || 1), part = set.items.slice((n - 1) * SIZE, n * SIZE);
  for (const it of part) {
    const lines = [`### ${it.id} [${it.sub}] key ${it.key}${it.passage ? ' | ' + it.passage : ''}${it.image ? ' | IMG: ' + it.image : ''}`, 'Q: ' + it.stem];
    it.choices.forEach((c, i) => lines.push(`${L[i]}${L[i] === it.key ? '*' : ' '} ${c}${it.wrong[L[i]] ? '  || ' + it.wrong[L[i]] : ''}`));
    lines.push('E: ' + it.why + (it.fast ? ' || F: ' + it.fast : '') + (it.proof ? ' || PROOF ' + it.proof : ''));
    console.log(lines.join('\n'));
  }
  console.error(`batch ${n}: ${part.length} items (${part[0] && part[0].id} to ${part.length && part[part.length - 1].id}) of ${set.items.length}`);
  process.exit(0);
}
if (cmd !== 'merge') { console.error('dump, merge or ids'); process.exit(2); }

const byId = Object.fromEntries(set.items.map((it) => [it.id, it]));
const done = {}, refused = [];
if (fs.existsSync(set.dir)) for (const f of fs.readdirSync(set.dir).filter((x) => /^batch-\d+\.jsonl$/.test(x)).sort()) {
  fs.readFileSync(path.join(set.dir, f), 'utf8').split('\n').forEach((line, ln) => {
    if (!line.trim()) return;
    let r; try { r = JSON.parse(line); } catch (e) { refused.push(`${f}:${ln + 1} bad JSON`); return; }
    const it = byId[r.id]; if (!it) { refused.push(`${r.id}: not in the bank`); return; }
    const why = [];
    if (r.key !== it.key) why.push(`key ${r.key} is not the bank key ${it.key}`);
    let trick, code = null;
    if (typeof r.trick === 'string' && r.trick.startsWith('draft:')) trick = { text: r.trick.slice(6).trim(), draft: true };
    else if (typeof r.trick === 'string' && r.trick.startsWith('d:')) {
      code = r.trick.slice(2); const t = (DRAFTS[SECTION] || {})[code];
      if (t) trick = { text: t, draft: true, code }; else why.push('unknown draft trick ' + code);
    } else if (APPROVED[r.trick]) trick = Object.assign({}, APPROVED[r.trick]);
    else why.push('unknown trick ' + r.trick);
    const traps = {};
    it.choices.forEach((_, i) => { if (L[i] !== it.key) { traps[L[i]] = r.traps && r.traps[L[i]]; if (!traps[L[i]]) why.push('no trap for ' + L[i]); } });
    const sources = [`ACE DAT ${NAMES[SECTION]} bank, ${it.id} (${it.prov}).`, `Explanation rewritten in new wording, ${TODAY}. Review pending.`];
    if (it.passage) sources.push(`Passage ${it.passage}${it.proof ? '; proof line ' + it.proof.split(':')[0] : ''}.`);
    if (trick && trick.src) sources.push(`Thomas's line: ${trick.src}, approved ${trick.approved}.`);
    const explain = { answer: r.answer, trick, steps: r.steps, traps, check: r.check, sources };
    why.push(...W.validate(explain));
    if (why.length) { refused.push(`${r.id}: ${why.join('; ')}`); return; }
    done[r.id] = { id: it.id, key: it.key, subtopic: it.sub, status: 'rewritten', method: 'new-wording', review: 'pending', reasons: [],
      trickKind: trick.approved ? 'approved' : 'draft', trickCode: code, calc: r.calc || null, flag: r.flag || null, explain };
  });
}
const EXCL = (JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts/bank/scope-exclusions.json'), 'utf8'))[SECTION]) || {};
for (const [id, why] of Object.entries(EXCL)) if (done[id]) Object.assign(done[id], { status: 'excluded', flag: why });
const records = set.items.map((it) => done[it.id] || { id: it.id, key: it.key, subtopic: it.sub, status: 'not-yet-rewritten', method: null, review: 'pending', explain: null });
const count = (f) => records.filter(f).length;
const summary = { bank: set.name, made: TODAY, items: records.length, rewritten: count((r) => r.status === 'rewritten'), excluded: count((r) => r.status === 'excluded'), notYet: count((r) => r.status === 'not-yet-rewritten'),
  trick: { approved: count((r) => r.trickKind === 'approved'), draft: count((r) => r.trickKind === 'draft') },
  calc: count((r) => r.calc), flagged: count((r) => r.flag), refused: refused.length };
fs.writeFileSync(set.sidecar, JSON.stringify({ format: 2, note: 'Explanation-standard rewrites in new wording (docs/EXPLANATION-STANDARD.md). Sidecar only: the bank is unchanged. Every record is review pending. status excluded (DAT scope rule): the item stays in the bank but must not be served to students; the reason is in flag.', summary, records }, null, 1) + '\n');
console.log(JSON.stringify(summary));
refused.forEach((x) => console.log('REFUSED ' + x));
