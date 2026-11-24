// The private AceTheDAT banks on the server side: the items, Thomas's review decisions, and who
// may see what. Used by netlify/functions/ace-bank-review.mjs, ace-bank-pool.mjs, ace-bank-forms.mjs.
//
// Items: bank-private/<bank>.json, built by scripts/bank/build-private.mjs and carried in the
// function bundle (netlify.toml included_files). The folder is git-ignored (this repo is public)
// and never served as a static file (a forced rule in _redirects).
//
// Decisions: Netlify Blobs, store "ace-bank-review" (the simplest safe route: no table to create,
// no key to set, and the store is private to this site).
//   key "decisions"          { [itemId]: { d: 'approve' | 'fix' | 'reject', note, at, by, h } }
//   key "log/<at>-<itemId>"  one entry per tap, never overwritten (the audit trail)
// h is the item's content hash at the moment of the decision. An approval only counts while the
// item still has that hash, so an item edited after approval drops out of the pool by itself.
//
// Access:
//   reviewer   Thomas only: a verified Ace Labs session with role 'master' (the portal's master
//              coach). While the sign-in switch is off there is no session, so a reviewer key can
//              stand in: env ACE_BANK_REVIEW_KEY (32+ characters), sent as X-Ace-Review-Key.
//              With neither, the review answers 503 not_configured.
//   students   only approved items, only with a verified session (sign-in on). With the switch off
//              the pool is empty, so nothing private is ever served to an anonymous visitor.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { sessionFromRequest, signInEnabled } from './ace-token.mjs';
import { exclusionSet, isExcluded } from './ace-exclusions.mjs';

export const STORE = 'ace-bank-review';
export const BANKS = { bio: 'bio', gchem: 'gchem', ochem: 'ochem', qr: 'qr', rc: 'rc' };
export const SECTION_OF_FORM = { bio: 'bio', gc: 'gchem', ochem: 'ochem', qr: 'qr', rc: 'rc' };
export const DECISIONS = ['approve', 'fix', 'reject'];

function roots() {
  const here = path.dirname(fileURLToPath(import.meta.url));
  return [process.env.ACE_BANK_ROOT, process.env.LAMBDA_TASK_ROOT, process.cwd(), path.resolve(here, '../..'), path.resolve(here, '..')].filter(Boolean);
}
export function findFile(rel) {
  for (const r of roots()) { const f = path.join(r, rel); if (fs.existsSync(f)) return f; }
  return null;
}
const cache = {};
/** Items of one bank ('bio' | 'gchem' | 'ochem' | 'qr' | 'rc'), or [] when the bundle has none. */
export function loadBank(bank, { dir } = {}) {
  const key = (dir || '') + '|' + bank;
  if (cache[key]) return cache[key];
  const f = dir ? path.join(dir, bank + '.json') : findFile(path.join('bank-private', bank + '.json'));
  const items = f && fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')).items || [] : [];
  return (cache[key] = items);
}
export function loadPassages({ dir } = {}) {
  const f = dir ? path.join(dir, 'rc-passages.json') : findFile('bank-private/rc-passages.json');
  return f && fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : {};
}
export function loadJson(rel) { const f = findFile(rel); return f ? JSON.parse(fs.readFileSync(f, 'utf8')) : null; }
export function bankOfId(id) { return { 'bio:': 'bio', 'gc:': 'gchem', 'oc:': 'ochem', 'qr:': 'qr', 'rc:': 'rc' }[String(id).slice(0, String(id).indexOf(':') + 1)] || null; }
/* ---- exclusions (scripts/bank/scope-exclusions.json, carried in the bundle) ----
   Out of DAT scope or defective: never served, approved or not. Fail closed: with the list
   missing, every caller below throws and the function answers 500, so nothing goes out unfiltered. */
let excludedCache = null;
export function excludedIds({ exclusions } = {}) {
  if (exclusions) return exclusionSet(exclusions);
  if (!excludedCache) excludedCache = exclusionSet(loadJson('scripts/bank/scope-exclusions.json'));
  return excludedCache;
}
export function deliverable(id, opts) { return !isExcluded(id, excludedIds(opts)); }
export function itemById(id, opts) { const b = bankOfId(id); if (!b) return null; return loadBank(b, opts).find((x) => x.id === id) || null; }

/* ---- decisions (Blobs) ---- */
export async function blobStore(env = {}) {
  const { getStore } = await import('@netlify/blobs');
  return getStore({ name: STORE, consistency: 'strong' });
}
export async function readDecisions(store) {
  const v = await store.get('decisions', { type: 'json' });
  return v && typeof v === 'object' ? v : {};
}
export async function writeDecision(store, id, entry) {
  const all = await readDecisions(store);
  all[id] = entry;
  await store.setJSON('decisions', all);
  await store.setJSON('log/' + entry.at + '-' + id, Object.assign({ id }, entry));
  return all;
}
/** Is this item approved, for the content it has now? */
export function approved(item, decisions) {
  const d = item && decisions[item.id];
  return !!(d && d.d === 'approve' && d.h === item.hash);
}
export function statusOf(item, decisions) {
  const d = decisions[item.id];
  if (!d) return 'open';
  if (d.d === 'approve' && d.h !== item.hash) return 'changed';   // edited after approval: review again
  return d.d;
}

/* ---- access ---- */
function same(a, b) {
  a = String(a || ''); b = String(b || '');
  if (!a || a.length !== b.length) return false;
  let x = 0; for (let i = 0; i < a.length; i++) x |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return x === 0;
}
/**
 * Who is asking: { reviewer: bool, student: bool, session, how } or { error, status }.
 * write: true requires the X-Ace-Session header (a cookie alone may not write).
 */
export async function caller(req, env, { write = false, now } = {}) {
  const key = env.ACE_BANK_REVIEW_KEY;
  const sent = req.headers.get('x-ace-review-key');
  if (sent && typeof key === 'string' && key.length >= 32 && same(sent, key)) return { reviewer: true, student: false, session: null, how: 'key' };
  if (signInEnabled(env)) {
    const session = await sessionFromRequest(req, env, { now, headerOnly: write });
    if (session) return { reviewer: session.role === 'master', coach: session.role !== 'student', student: session.role === 'student', session, how: 'session' };
    return { reviewer: false, student: false, session: null, how: 'none' };
  }
  return { reviewer: false, student: false, session: null, how: 'off' };
}
export function reviewConfigured(env) {
  return signInEnabled(env) || (typeof env.ACE_BANK_REVIEW_KEY === 'string' && env.ACE_BANK_REVIEW_KEY.length >= 32);
}

/* ---- what a student may see of an item ---- */
export function studentItem(it) {
  const o = { id: it.id, section: it.section, topic: it.topic, topicName: it.topicName, skill: it.skill, skillName: it.skillName, canon: it.canon, difficulty: it.difficulty,
    stem: it.stem, choices: it.choices, answer: it.answer, why: it.why, traps: it.traps, trick: it.trick || '', src: 'ace-bank' };
  if (it.img) { o.img = it.img; o.imgAlt = it.imgAlt || ''; }
  return o;
}
/* The full-length runner's item shape (tools/mock/full.js). */
export function formItem(it, sub) {
  const o = { id: it.id, sub, stop: it.topic, topic: it.topicName, d: it.difficulty, q: it.stem, opts: it.choices, correct: it.answer, why: it.why, traps: it.traps,
    skill: it.skill, skillName: it.skillName, canon: it.canon, src: 'ace-bank' };
  if (it.img) { o.img = it.img; o.imgAlt = it.imgAlt || ''; }
  return o;
}

/* ---- forms: status from the decisions, content when ready ---- */
export function formItems(form, opts) {
  const ids = [];
  for (const sec of ['bio', 'gc', 'ochem', 'qr']) if (form.sections[sec]) ids.push(...form.sections[sec]);
  if (form.rc && form.rc.passages) { const rc = loadBank('rc', opts); for (const pid of form.rc.passages) ids.push(...rc.filter((q) => q.passageId === pid).map((q) => q.id)); }
  return ids.filter((id) => deliverable(id, opts));
}
export function formStatus(form, decisions, opts) {
  const ids = formItems(form, opts);
  let ok = 0, fix = 0, reject = 0;
  for (const id of ids) { const it = itemById(id, opts); if (!it) continue; const s = statusOf(it, decisions); if (s === 'approve') ok++; else if (s === 'fix') fix++; else if (s === 'reject') reject++; }
  const complete = ['bio', 'gc', 'ochem', 'qr'].every((s) => form.sections[s]) && !!form.rc;
  // What a student sits: the reviewed items, the fallback Reading section when a form borrows one, and the 90 generated PAT figures.
  const questions = ids.length + (form.rc && !form.rc.passages ? Number(form.rc.questions) || 50 : 0) + (form.pat ? 90 : 0);
  return { id: form.id, name: form.name, status: complete && ids.length && ok === ids.length ? 'ready' : 'awaiting review', approved: ok, needed: ids.length, questions, fix, reject, rcFallback: !!(form.rc && form.rc.fallback) };
}
const RC_TYPE_NAMES = { detail: 'Detail', inference: 'Inference', mainidea: 'Main idea / purpose', function: 'Function of a paragraph', except: 'EXCEPT / NOT', tone: 'Tone / attitude', vocab: 'Vocabulary in context' };
export function formContent(form, opts) {
  const sub = { bio: 'Biology', gc: 'Gen Chem', ochem: 'OChem', qr: 'QR' };
  const mock = { id: form.id, name: form.name, src: 'ace-bank', sections: {}, pat: form.pat, rc: null };
  for (const sec of ['bio', 'gc', 'ochem', 'qr']) mock.sections[sec] = (form.sections[sec] || []).filter((id) => deliverable(id, opts)).map((id) => formItem(itemById(id, opts), sub[sec]));
  if (form.rc && form.rc.passages) {
    const rc = loadBank('rc', opts), P = loadPassages(opts);
    mock.rc = { types: RC_TYPE_NAMES, passages: form.rc.passages.map((pid) => ({ id: pid, title: P[pid].title, paragraphs: P[pid].paragraphs.map((p) => [p]),
      questions: rc.filter((q) => q.passageId === pid && deliverable(q.id, opts)).map((q) => ({ id: q.id, type: q.topic, stem: q.stem, choices: q.choices, key: q.answer, why: q.why, traps: q.traps })) })) };
  } else if (form.rc && form.rc.section) mock.rc = { section: form.rc.section };
  return mock;
}
