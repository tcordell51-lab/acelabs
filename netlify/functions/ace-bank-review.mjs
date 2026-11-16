// The coach review queue for the private banks (page: /coach/bank-review/, unlisted, not linked).
//
//   GET  ?section=bio                 the queue: ids in review order with their status, the counts,
//                                     and how far each new full-length form is from unlocking
//   GET  ?id=bio:bio-mtr-014          one item in full (stem, choices, key, the explanation for
//                                     every choice, skill tag, difficulty; RC adds the passage)
//   POST { id, decision, note }       decision: approve | fix | reject. A Fix needs a note.
//
// Thomas only (see netlify/lib/ace-bank-store.mjs for the access rules). Decisions are saved in
// Netlify Blobs (store ace-bank-review). Only approved items enter the student pool; nothing
// changes for students until he approves.
import { json } from '../lib/ace-token.mjs';
import { BANKS, DECISIONS, blobStore, caller, formStatus, itemById, loadBank, loadJson, loadPassages, readDecisions, reviewConfigured, statusOf, writeDecision } from '../lib/ace-bank-store.mjs';

const SECTION_BANK = { bio: 'bio', gc: 'gchem', gchem: 'gchem', ochem: 'ochem', qr: 'qr', rc: 'rc' };
const QUEUE_SECTION = { bio: 'bio', gchem: 'gc', ochem: 'ochem', qr: 'qr', rc: 'rc' };

export async function handleReview(req, { env = process.env, store, now = Date.now(), opts } = {}) {
  if (!reviewConfigured(env)) return json(503, { ok: false, error: 'not_configured' });
  const write = req.method === 'POST';
  const who = await caller(req, env, { write });
  if (!who.reviewer) return json(who.session ? 403 : 401, { ok: false, error: who.session ? 'reviewer_only' : 'sign_in_required' });
  store = store || await blobStore(env);
  const decisions = await readDecisions(store);
  const url = new URL(req.url);

  if (req.method === 'GET') {
    const id = url.searchParams.get('id');
    if (id) {
      const it = itemById(id, opts);
      if (!it) return json(404, { ok: false, error: 'no_item' });
      const out = { ok: true, item: it, status: statusOf(it, decisions), decision: decisions[id] || null };
      if (it.passageId) { const p = loadPassages(opts)[it.passageId]; if (p) out.passage = { id: p.id, title: p.title, paragraphs: p.paragraphs }; }
      return json(200, out);
    }
    const bank = SECTION_BANK[url.searchParams.get('section') || 'bio'];
    if (!bank) return json(400, { ok: false, error: 'bad_section' });
    const q = ((opts && opts.queue) || loadJson('scripts/bank/review-queue.json') || { sections: {} }).sections[QUEUE_SECTION[bank]] || { seed: [], forms: [], bank: [] };
    const byId = Object.fromEntries(loadBank(bank, opts).map((x) => [x.id, x]));
    const row = (id, part) => { const it = byId[id]; return it ? { id, part, status: statusOf(it, decisions), skill: it.canonName || it.skillName, conf: it.conf, difficulty: it.difficulty } : null; };
    const list = [].concat(q.seed.map((id) => row(id, 'seed')), q.forms.map((id) => row(id, 'forms')), q.bank.map((id) => row(id, 'bank'))).filter(Boolean);
    const counts = { open: 0, approve: 0, fix: 0, reject: 0, changed: 0 };
    list.forEach((r) => { counts[r.status] = (counts[r.status] || 0) + 1; });
    const seedDone = list.filter((r) => r.part === 'seed' && r.status !== 'open' && r.status !== 'changed').length;
    const forms = (((opts && opts.forms) || loadJson('scripts/bank/forms.json') || {}).forms || []).map((f) => formStatus(f, decisions, opts));
    return json(200, { ok: true, section: QUEUE_SECTION[bank], seedSize: q.seed.length, seedDone, counts, items: list, forms, how: who.how });
  }

  if (req.method === 'POST') {
    let body; try { body = JSON.parse((await req.text()) || '{}'); } catch { return json(400, { ok: false, error: 'bad_json' }); }
    const id = String(body.id || ''), d = String(body.decision || ''), note = String(body.note || '').replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, 2000);
    if (!DECISIONS.includes(d)) return json(400, { ok: false, error: 'bad_decision' });
    if (d === 'fix' && !note) return json(400, { ok: false, error: 'fix_needs_note' });
    const it = itemById(id, opts);
    if (!it || !BANKS[it.bank.replace('ace-bank-', '')]) return json(404, { ok: false, error: 'no_item' });
    const entry = { d, note, at: now, by: who.session ? who.session.sub : 'review-key', h: it.hash };
    await writeDecision(store, id, entry);
    return json(200, { ok: true, id, status: d, decision: entry });
  }
  return json(405, { ok: false, error: 'GET or POST' });
}

export default async (req) => {
  try { return await handleReview(req); } catch (e) { return json(500, { ok: false, error: 'server' }); }
};
