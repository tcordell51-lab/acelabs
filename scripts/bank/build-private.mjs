#!/usr/bin/env node
// build-private.mjs : the private AceTheDAT banks (4,140 original items) into Ace Labs, safely.
//
//   node scripts/bank/build-private.mjs [--banks DIR] [--check]
//
// This repository is public. The private banks (ace-bank-bio, -gchem, -ochem, -qr, -rc) are
// private repositories, so NO question text is ever committed here. This script writes two kinds
// of output:
//
//   bank-private/ (git-ignored, never served: a forced rule in _redirects, and the functions read
//   it from their bundle via netlify.toml included_files)
//     <section>.json   every item in the Ace Labs item shape, explanation per choice, drawings inlined
//
//   committed, ids and tags only
//     scripts/bank/out/ace-bank-tags.json     id -> [canonical subtopic or null, parent topic, conf]
//     scripts/bank/forms.json                 the six new full-length forms (item ids)
//     scripts/bank/review-queue.json          Thomas's review order per section (the seeded 50 first)
//
// Every item is AI-checked only. Nothing here is called verified, and nothing reaches a student
// until Thomas approves it on the coach review page (netlify/functions/ace-bank-review.mjs).
// --check: rebuild in memory and exit 1 if a committed file is stale (skipped without the banks).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { composeForms } from './compose-ace-forms.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const Skills = createRequire(import.meta.url)(path.join(ROOT, 'shared/ace-skills.js'));
const TAX = JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts/bank/taxonomy.json'), 'utf8'));
const arg = (n, d) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : d; };
const CHECK = process.argv.includes('--check');
const BANK_NAMES = ['bio', 'gchem', 'ochem', 'qr', 'rc'];
const dirs = [arg('--banks', ''), process.env.ACE_BANK_DIR || '', path.join(os.homedir(), 'code'), os.homedir(), '/home/claude'].filter(Boolean);
export const BANKS = dirs.find((d) => BANK_NAMES.every((b) => fs.existsSync(path.join(d, 'ace-bank-' + b, 'items'))));
const OUT_PRIVATE = path.join(ROOT, 'bank-private');
const OUT_TAGS = path.join(ROOT, 'scripts/bank/out/ace-bank-tags.json');
const OUT_FORMS = path.join(ROOT, 'scripts/bank/forms.json');
const OUT_QUEUE = path.join(ROOT, 'scripts/bank/review-queue.json');
const L = 'ABCDE';
export const SEC = { bio: 'bio', gchem: 'gc', ochem: 'ochem', qr: 'qr', rc: 'rc' };   // bank -> form section key
const PREFIX = { bio: 'bio:', gchem: 'gc:', ochem: 'oc:', qr: 'qr:', rc: 'rc:' };
const SECTION = { bio: 'bio', gchem: 'gchem', ochem: 'ochem', qr: 'qr', rc: 'rc' };
const RC_TYPE = { 'rc-detail': 'detail', 'rc-main-idea': 'mainidea', 'rc-inference': 'inference', 'rc-function': 'function', 'rc-except': 'except', 'rc-tone': 'tone', 'rc-vocab': 'vocab' };

function jsonl(file) { return fs.readFileSync(file, 'utf8').split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l)); }
function loadBank(b) {
  const dir = path.join(BANKS, 'ace-bank-' + b, 'items');
  return fs.readdirSync(dir).filter((f) => f.endsWith('.jsonl')).sort().flatMap((f) => jsonl(path.join(dir, f)));
}
function svgData(b, rel) {
  if (!rel) return null;
  const f = path.join(BANKS, 'ace-bank-' + b, rel);
  if (!fs.existsSync(f)) return null;
  return 'data:image/svg+xml;base64,' + fs.readFileSync(f).toString('base64');
}
const topicName = (id) => (id && TAX.topics[id] ? TAX.topics[id].name : null);

/* One private item -> the Ace Labs item shape. explanation.wrong becomes traps[5] (null at the key). */
export function toItem(b, raw, passage) {
  const answer = L.indexOf(String(raw.answer || '').trim());
  const ex = raw.explanation || {};
  const why = [ex.correct, ex.fastest ? 'Fastest: ' + ex.fastest : ''].filter(Boolean).join(' ');
  const traps = (raw.choices || []).map((_, i) => (i === answer ? null : ((ex.wrong || {})[L[i]] || null)));
  const t = Skills.tag({ section: SECTION[b], topic: raw.skill_id, stem: raw.stem, why: ex.correct || '' });
  const it = {
    id: PREFIX[b] + raw.id, bankId: raw.id, bank: 'ace-bank-' + b, section: SECTION[b],
    topic: b === 'rc' ? (RC_TYPE[raw.skill_id] || raw.skill_id) : (t.topicId || raw.topic), topicName: b === 'rc' ? null : (topicName(t.topicId) || raw.topic),
    bankTopic: raw.topic, bankSkill: raw.skill_id, skill: t.skill, skillName: t.skillName, canon: t.canon, canonName: t.canonName, topicId: t.topicId, conf: t.conf,
    difficulty: raw.difficulty, stem: raw.stem, choices: raw.choices, answer, why, traps,
    trick: raw.trick || '', trapTags: raw.trap_tags || [], wrongTags: raw.wrong_tags || null, timeTarget: raw.time_target_sec || null,
    formEligible: raw.form_eligible !== false, version: raw.version || 1
  };
  if (raw.image && raw.image.path) { it.img = svgData(b, raw.image.path); it.imgAlt = raw.image.alt || ''; }
  // the content hash: an approval holds only while the item still reads exactly like this
  it.hash = crypto.createHash('sha256').update(JSON.stringify([it.stem, it.choices, it.answer, it.why, it.traps, it.img || '', raw.passage_id || ''])).digest('hex').slice(0, 16);
  if (b === 'rc') { it.passageId = raw.passage_id; if (ex.proof_line) it.proof = ex.proof_line; it.topicName = passage ? passage.title : raw.passage_id; }
  return it;
}

export function build() {
  if (!BANKS) return null;
  const out = {}, tags = {}, passages = {};
  for (const b of BANK_NAMES) {
    const raw = loadBank(b);
    if (b === 'rc') {
      for (const p of raw.filter((x) => x.passage_id && !x.stem)) passages[p.passage_id] = { id: p.passage_id, title: p.title, topic: p.topic, difficulty: p.difficulty, words: p.word_count, paragraphs: p.paragraphs, exclusion: p.exclusion_group || null };
      out.rc = raw.filter((x) => x.stem).map((x) => toItem(b, x, passages[x.passage_id]));
    } else out[b] = raw.map((x) => toItem(b, x));
    for (const it of out[b]) tags[it.id] = [it.canon, it.topicId, it.conf];
  }
  // forms
  const smap = JSON.parse(fs.readFileSync(path.join(BANKS, 'ace-bank-bio/skills/bio-skill-map.json'), 'utf8'));
  const bioTargets = {}; for (const s of smap.skills) bioTargets[s.ada_slug] = (bioTargets[s.ada_slug] || 0) + (s.target || 0);
  const pList = Object.values(passages).map((p) => ({ id: p.id, n: out.rc.filter((q) => q.passageId === p.id).length, topic: p.topic, difficulty: p.difficulty, exclusion: p.exclusion }));
  const { forms, report } = composeForms({ items: { bio: out.bio, gc: out.gchem, ochem: out.ochem, qr: out.qr }, passages: pList, bioTargets });
  // review queue: Form A's items first (approving them unlocks that form), then the rest of the
  // seeded 50 by high-yield subtopic, then every other form item in form order, then the bank.
  const queue = reviewQueue(out, forms, passages);
  return { out, tags, passages, forms, report, queue };
}

const hy = (it) => (it.topicId && TAX.topics[it.topicId] && TAX.topics[it.topicId].highYield ? 0 : 1);
const order = (it) => (TAX.topics[it.topicId] ? TAX.topics[it.topicId].order : 99);
export function reviewQueue(out, forms, passages) {
  const res = { seedPerSection: 50, sections: {} };
  for (const b of BANK_NAMES) {
    const sec = SEC[b], items = out[b], byId = Object.fromEntries(items.map((i) => [i.id, i]));
    const formIds = [];
    for (const f of forms) {
      if (sec === 'rc') { if (f.rc && f.rc.passages) for (const pid of f.rc.passages) formIds.push(...items.filter((q) => q.passageId === pid).map((q) => q.id)); }
      else if (f.sections[sec]) formIds.push(...f.sections[sec]);
    }
    const first = forms[0];
    const formA = sec === 'rc' ? (first.rc && first.rc.passages ? first.rc.passages.flatMap((pid) => items.filter((q) => q.passageId === pid).map((q) => q.id)) : []) : (first.sections[sec] || []);
    // inside the seed, highest-yield first: high-yield parent topic, then the registry order,
    // then the subtopic; RC keeps passage order (a passage is read once).
    const sortHY = (ids) => (sec === 'rc' ? ids.slice() : ids.slice().sort((a, b2) => { const x = byId[a], y = byId[b2]; return hy(x) - hy(y) || order(x) - order(y) || String(x.canon || x.topicId).localeCompare(String(y.canon || y.topicId)) || a.localeCompare(b2); }));
    const seed = sortHY(formA);
    if (seed.length < 50) {
      const extra = formIds.filter((id) => !seed.includes(id));
      // round robin over high-yield subtopics so the extra items cover new ground
      const bySub = {};
      for (const id of extra) { const k = byId[id].canon || byId[id].topicId || 'none'; (bySub[k] = bySub[k] || []).push(id); }
      const subs = Object.keys(bySub).sort((a, b2) => hy(byId[bySub[a][0]]) - hy(byId[bySub[b2][0]]) || order(byId[bySub[a][0]]) - order(byId[bySub[b2][0]]) || a.localeCompare(b2));
      if (sec === 'rc') { for (const id of extra) { if (seed.length >= 50) break; seed.push(id); } }
      else for (let round = 0; seed.length < 50 && round < 50; round++) for (const s of subs) { if (seed.length >= 50) break; if (bySub[s][round]) seed.push(bySub[s][round]); }
    }
    const rest = formIds.filter((id) => !seed.includes(id));
    const bank = items.filter((i) => !seed.includes(i.id) && !rest.includes(i.id) && (sec === 'rc' || (i.choices && i.choices.length === 5))).map((i) => i.id);
    res.sections[sec] = { seed, forms: rest, bank, formA: formA.length };
  }
  return res;
}

function writeOrCheck(file, body) {
  if (CHECK) { if (!fs.existsSync(file) || fs.readFileSync(file, 'utf8') !== body) { console.error('stale: ' + path.relative(ROOT, file) + ' (run node scripts/bank/build-private.mjs)'); return 1; } return 0; }
  fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, body); return 0;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const r = build();
  if (!r) { console.log('build-private: the private banks are not on this machine; nothing built' + (CHECK ? ' (check skipped)' : '')); process.exit(0); }
  let stale = 0;
  if (!CHECK) {
    fs.mkdirSync(OUT_PRIVATE, { recursive: true });
    for (const b of BANK_NAMES) fs.writeFileSync(path.join(OUT_PRIVATE, b + '.json'), JSON.stringify({ format: 1, bank: 'ace-bank-' + b, status: 'AI-checked only; not reviewed by Thomas', items: r.out[b] }));
    fs.writeFileSync(path.join(OUT_PRIVATE, 'rc-passages.json'), JSON.stringify(r.passages));
    fs.writeFileSync(path.join(OUT_PRIVATE, 'README.txt'), 'Built by scripts/bank/build-private.mjs from the private banks. Never commit this folder. Never served.\n');
  }
  const conf = { meta: 0, table: 0, low: 0 }; for (const v of Object.values(r.tags)) conf[v[2]]++;
  stale += writeOrCheck(OUT_TAGS, JSON.stringify({ format: 1, note: 'ids and canonical tags only (no question text): [subtopic or null, parent topic, conf]', count: Object.keys(r.tags).length, conf, tags: r.tags }) + '\n');
  stale += writeOrCheck(OUT_FORMS, JSON.stringify({ format: 1, note: 'Item ids only. Status stays "awaiting review" until Thomas approves every item of a form on the coach review page; the forms function works the status out live from his decisions.', time: { sons: 90, pat: 60, rc: 60, qr: 45 }, report: r.report, forms: r.forms }, null, 1) + '\n');
  stale += writeOrCheck(OUT_QUEUE, JSON.stringify({ format: 1, note: 'Item ids only. seed = the 50 per section shown first (the first form\'s items lead, then high-yield subtopics); forms = the other form items; bank = the rest.', ...r.queue }) + '\n');
  for (const b of BANK_NAMES) { const it = r.out[b]; const c = { meta: 0, table: 0, low: 0 }; it.forEach((x) => c[x.conf]++); console.log(`ace-bank-${b}: ${it.length} items; tags meta ${c.meta}, table ${c.table}, low ${c.low}`); }
  console.log('forms possible per section: ' + JSON.stringify(r.report.possible));
  r.report.notes.forEach((n) => console.log('  note: ' + n));
  if (stale) process.exit(1);
}
