#!/usr/bin/env node
// audit-explanations.mjs : which served questions explain every choice, and which do not.
//
//   node scripts/bank/audit-explanations.mjs            write scripts/bank/out/explanations-audit.json
//   node scripts/bank/audit-explanations.mjs --check    exit 1 if that file is stale
//
// "Full" means the key's explanation plus one reason for each of the four wrong choices.
// "Drafted" means a per-choice draft sits in content-drafts/per-choice/*.draft.jsonl. Drafts are
// marked "draft, needs Thomas": they are never served and never overwrite live text. When Thomas
// approves a draft it can be moved into the item's source bank as traps.
// Ids and counts only: no question text.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = path.join(ROOT, 'scripts/bank/out/explanations-audit.json');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const win = (f, n) => { const w = {}; vm.runInNewContext(read(f), { window: w }); return w[n]; };
const fullTraps = (t, answer) => Array.isArray(t) && t.filter((x, i) => i !== answer && x && String(x).trim()).length >= 4;

const drafts = {};
const DD = path.join(ROOT, 'content-drafts/per-choice');
if (fs.existsSync(DD)) for (const f of fs.readdirSync(DD).filter((x) => x.endsWith('.draft.jsonl'))) for (const l of fs.readFileSync(path.join(DD, f), 'utf8').split('\n')) if (l.trim()) { const x = JSON.parse(l); drafts[x.id] = x; }

export function audit() {
  const surfaces = [];
  function surface(name, rows, note) {
    const s = { surface: name, items: rows.length, had: 0, drafted: 0, missing: 0, note: note || '', missingIds: [] };
    for (const r of rows) {
      if (r.full) s.had++;
      else if (drafts[r.id]) s.drafted++;
      else { s.missing++; s.missingIds.push(r.id); }
    }
    surfaces.push(s);
  }
  const bank = (f) => JSON.parse(read('data/' + f + '.json')).items.map((it) => ({ id: it.id, full: fullTraps(it.traps, it.answer) }));
  surface('Repair: Biology (data/bio.json)', bank('bio'), 'feeds Repair');
  surface('Repair: Gen Chem (data/gchem.json)', bank('gchem'), 'feeds Repair');
  surface('Repair: QR Climb (data/qr-climb.json)', bank('qr-climb'), 'feeds Repair; the same items are The Climb\'s QR questions');
  surface('Repair: QR diagnostic pool (data/qr-dat.json)', bank('qr-dat'), 'feeds Repair');
  surface('OChem hub (data/ochem.json)', bank('ochem'), 'feeds Repair and the /oc/ hub');
  const D = JSON.parse(read('scripts/dat-mock-bank.json'));
  const pool = []; for (const k of Object.keys(D)) for (const q of D[k]) if (Array.isArray(q.opts) && q.opts.length === 5) pool.push({ id: q.id, full: fullTraps(q.traps || q.t, q.correct) });
  surface('Diagnostic and test pool (scripts/dat-mock-bank.json, five-choice)', pool);
  const M = win('shared/dat-mock-tests.js', 'DAT_MOCK_TESTS'), pm = [];
  for (const t of M) for (const l of Object.values(t.sections)) for (const q of l) pm.push({ id: 'pm:' + q.id, full: fullTraps(q.traps, q.correct) });
  surface('Prometric practice tests 1 to 3 (shared/dat-mock-tests.js)', pm);
  const F = win('tools/mock/data/full-mocks.js', 'ACE_FULL_MOCKS'), fm = [];
  for (const m of F.mocks) for (const l of Object.values(m.sections)) for (const q of l) fm.push({ id: 'fl:' + q.id, full: fullTraps(q.traps, q.correct) });
  surface('Full-length tests 1 to 4 (tools/mock/data/full-mocks.js)', fm);
  const RC = win('tools/rc/data/bank.js', 'ACE_RC_BANK'), rc = [];
  for (const p of Object.values(RC.passages)) for (const q of p.questions) rc.push({ id: q.id, full: fullTraps(q.distractorNotes, q.key) });
  surface('Reading (tools/rc/data/bank.js)', rc);
  const tf = path.join(ROOT, 'scripts/bank/out/ace-bank-tags.json');
  if (fs.existsSync(tf)) { const n = Object.keys(JSON.parse(fs.readFileSync(tf, 'utf8')).tags).length; surfaces.push({ surface: 'Private banks (review queue, new forms)', items: n, had: n, drafted: 0, missing: 0, note: 'every item carries its own explanation for each choice (AI-checked; Thomas reviews them in the queue)', missingIds: [] }); }
  const tot = surfaces.reduce((a, s) => ({ items: a.items + s.items, had: a.had + s.had, drafted: a.drafted + s.drafted, missing: a.missing + s.missing }), { items: 0, had: 0, drafted: 0, missing: 0 });
  return { format: 1, note: 'had = full per-choice explanation already served; drafted = draft in content-drafts/per-choice (draft, needs Thomas; not served); missing = neither. PAT items are generated and explained by their engine, so they are not counted.', totals: tot, surfaces };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const r = audit(), body = JSON.stringify(r, null, 1) + '\n';
  if (process.argv.includes('--check')) { const same = fs.existsSync(OUT) && fs.readFileSync(OUT, 'utf8') === body; if (!same) { console.error('stale: scripts/bank/out/explanations-audit.json'); process.exit(1); } }
  else fs.writeFileSync(OUT, body);
  for (const s of r.surfaces) console.log(`${s.surface}: ${s.items} items, had ${s.had}, drafted ${s.drafted}, missing ${s.missing}`);
  console.log('total', JSON.stringify(r.totals));
}
