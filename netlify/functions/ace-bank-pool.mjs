// Approved private-bank items for practice and Repair.
//
//   GET -> { ok, items: [...] }   only items Thomas approved (and not edited since), in the
//                                  Ace Labs item shape. Reading questions stay out: Reading misses
//                                  repair by question type in the RC trainer.
//
// Needs a verified Ace Labs session (any role). With the sign-in switch off the pool is empty,
// so a private question never reaches an anonymous visitor and the pool is unchanged.
import { json, signInEnabled } from '../lib/ace-token.mjs';
import { approved, blobStore, caller, deliverable, loadBank, readDecisions, studentItem } from '../lib/ace-bank-store.mjs';

export async function handlePool(req, { env = process.env, store, opts } = {}) {
  if (req.method !== 'GET') return json(405, { ok: false, error: 'GET' });
  if (!signInEnabled(env)) return json(200, { ok: true, items: [], reason: 'sign_in_off' });
  const who = await caller(req, env);
  if (!who.session && !who.reviewer) return json(401, { ok: false, error: 'sign_in_required' });
  store = store || await blobStore(env);
  const decisions = await readDecisions(store);
  const items = [];
  for (const b of ['bio', 'gchem', 'ochem', 'qr']) for (const it of loadBank(b, opts)) if (approved(it, decisions) && deliverable(it.id, opts)) items.push(studentItem(it));
  return json(200, { ok: true, items }, { 'Cache-Control': 'private, no-store' });
}

export default async (req) => {
  try { return await handlePool(req); } catch (e) { return json(500, { ok: false, error: 'server' }); }
};
