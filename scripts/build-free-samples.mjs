// Builds the free-account sample banks: a few questions per section, picked across topics.
//   node scripts/build-free-samples.mjs          write data/free/sample-*.json
//   node scripts/build-free-samples.mjs --check  fail when a sample is out of date, or any
//                                                sample question has no walk-through
// Free accounts (email sign-in, no pass) get these in place of the full banks (see SAMPLE_FORMS in
// netlify/lib/ace-access.mjs). How many per section is Thomas's call: change PER_BANK.
//
// Thomas's decision (2026-11-23): 10 questions per section, and every free question shows its
// walk-through. The walk-through comes from the explanation sidecars (docs/EXPLANATION-STANDARD.md):
//   Gen Chem  scripts/bank/out/gchem-explanations-standard.json
//   QR        scripts/bank/out/qr-explanations-standard.json
//   Bio, OChem samples  scripts/free-sample-walks.json (written for the sample questions)
// It is attached to each sample item in the fields shared/ace-question.js already shows after
// Check answer: why (the answer line), steps, traps (the trap in the letter picked) and trick
// (only a line Thomas approved; draft lines are never shown as his).
// Items a sidecar marks excluded (outside the DAT outline) and items in DEFECTIVE are never sampled.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// QR is one section in two banks: 7 + 3 = 10.
export const PER_BANK = { 'bio.json': 10, 'gchem.json': 10, 'ochem.json': 10, 'qr-climb.json': 7, 'qr-dat.json': 3 };
export const WALK_FILES = ['scripts/bank/out/gchem-explanations-standard.json', 'scripts/bank/out/qr-explanations-standard.json', 'scripts/free-sample-walks.json'];
/** Items that must not be sampled, with the reason (fix the item in the bank, then take it off). */
export const DEFECTIVE = Object.freeze({
  // the NMR data (3H t, 3H s, 2H q: 8 H) fits 2-butanone, not C5H10O; no choice matches it
  'oc:OC_lf003': 'NMR data does not match the formula or the keyed answer',
});
const LETTERS = ['A', 'B', 'C', 'D', 'E'];

export function pick(items, n) {
  // one per topic in turn (topics in bank order, items by id), so the sample shows the range
  const byTopic = new Map();
  for (const it of items) { if (!byTopic.has(it.topic)) byTopic.set(it.topic, []); byTopic.get(it.topic).push(it); }
  for (const list of byTopic.values()) list.sort((a, b) => String(a.id).localeCompare(String(b.id)));
  const out = [], lists = [...byTopic.values()];
  for (let round = 0; out.length < n && lists.some((l) => l.length > round); round++) for (const l of lists) { if (out.length >= n) break; if (l[round]) out.push(l[round]); }
  return out;
}

/** Every walk-through record by item id (all sidecars). */
export function loadWalks(root = ROOT) {
  const walks = new Map();
  for (const f of WALK_FILES) {
    const p = path.join(root, f);
    if (!fs.existsSync(p)) continue;
    for (const r of JSON.parse(fs.readFileSync(p, 'utf8')).records || []) walks.set(r.id, r);
  }
  return walks;
}

// Text marks from the standard (**bold**, x_2, x^{2+}) shown as plain text: the question card
// writes text only. Sub and superscript digits and signs become their Unicode forms.
const SUP = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹', '+': '⁺', '-': '⁻', '−': '⁻', n: 'ⁿ', x: 'ˣ', y: 'ʸ' };
const SUB = { 0: '₀', 1: '₁', 2: '₂', 3: '₃', 4: '₄', 5: '₅', 6: '₆', 7: '₇', 8: '₈', 9: '₉', '+': '₊', '-': '₋', '−': '₋' };
function script(s, map, mark) { return [...s].every((c) => map[c]) ? [...s].map((c) => map[c]).join('') : mark + '(' + s + ')'; }
export function plainText(s) {
  return String(s == null ? '' : s)
    .replace(/\*\*/g, '')
    .replace(/\^\{([^}]*)\}/g, (_, x) => script(x, SUP, '^'))
    .replace(/\^([0-9A-Za-z+\-−])/g, (_, x) => script(x, SUP, '^'))
    .replace(/_\{([^}]*)\}/g, (_, x) => ([...x].every((c) => SUB[c]) ? script(x, SUB, '_') : x))
    .replace(/([A-Za-z)\]])_([0-9])/g, (_, a, x) => a + SUB[x]);
}

/** The sample item with its walk-through attached, or null when it has none it may show. */
export function withWalk(item, rec) {
  if (!rec || rec.status !== 'rewritten' || !rec.explain) return null;
  const ex = rec.explain;
  if (rec.key && rec.key !== LETTERS[item.answer]) return null;            // written for another key: never show
  const steps = (ex.steps || []).map((s) => plainText(typeof s === 'string' ? s : s.text));
  const traps = LETTERS.map((L, i) => (i === item.answer ? null : (ex.traps && ex.traps[L] ? plainText(ex.traps[L]) : null)));
  if (!ex.answer || steps.length < 3 || traps.some((t, i) => i !== item.answer && !t)) return null;
  const out = { ...item, why: plainText(ex.answer), steps, traps, walk: 'standard' };
  const t = ex.trick;
  if (t && t.approved && t.src && !t.draft && !t.pending) out.trick = plainText(t.text); else delete out.trick;
  return out;
}

export function build(root = ROOT) {
  const files = {}, problems = [];
  const walks = loadWalks(root);
  for (const [name, n] of Object.entries(PER_BANK)) {
    const bank = JSON.parse(fs.readFileSync(path.join(root, 'data', name), 'utf8'));
    const usable = bank.items.filter((it) => !DEFECTIVE[it.id] && !(walks.get(it.id) && walks.get(it.id).status === 'excluded'));
    const items = pick(usable, n).map((it) => { const w = withWalk(it, walks.get(it.id)); if (!w) problems.push(name + ' ' + it.id + ': no walk-through'); return w || it; });
    files['sample-' + name] = JSON.stringify({ ...bank, source: `free sample of ${name} (scripts/build-free-samples.mjs)`, count: items.length, sample: true, fullCount: bank.items.length, items }, null, 1) + '\n';
  }
  return { files, problems };
}

if (process.argv[1] && process.argv[1].endsWith('build-free-samples.mjs')) {
  const check = process.argv.includes('--check');
  const { files, problems } = build();
  let stale = 0;
  for (const [f, text] of Object.entries(files)) {
    const p = path.join(ROOT, 'data', 'free', f);
    if (check) { if (!fs.existsSync(p) || fs.readFileSync(p, 'utf8') !== text) { console.error('out of date: data/free/' + f); stale++; } }
    else fs.writeFileSync(p, text);
  }
  for (const pr of problems) console.error(pr);
  if (check && stale) console.error('run: node scripts/build-free-samples.mjs');
  if (stale || problems.length) process.exit(1);
  console.log(check ? 'free samples up to date, every question has its walk-through' : 'wrote free samples');
}
