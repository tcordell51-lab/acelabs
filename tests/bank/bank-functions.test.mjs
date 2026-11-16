// The private-bank functions: who may review, what a student can see, and when a form unlocks.
// Runs on a small fixture bank (no private item is needed), with an in-memory decision store.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { signToken, sessionSecret, SESSION_TYP } from '../../netlify/lib/ace-token.mjs';
import { handleReview } from '../../netlify/functions/ace-bank-review.mjs';
import { handlePool } from '../../netlify/functions/ace-bank-pool.mjs';
import { handleForms } from '../../netlify/functions/ace-bank-forms.mjs';

const SECRET = 'test-handoff-secret-0123456789-abcdefghij';
const ON = { ACE_LABS_SIGN_IN: 'on', ACE_LABS_HANDOFF_SECRET: SECRET };
const OFF = {};
const KEY = 'review-key-0123456789-abcdefghijklmnop';
const now = () => Math.floor(Date.now() / 1000);
async function token(role, sub = 'S22') { return signToken({ v: 1, typ: SESSION_TYP, sub, role, view: null, ent: ['all'], src: 'portal', iat: now(), exp: now() + 3600 }, await sessionSecret(SECRET)); }
function req(p, { method = 'GET', headers = {}, body } = {}) { return new Request('https://acelabs.netlify.app/.netlify/functions/' + p, { method, headers, body: body == null ? undefined : JSON.stringify(body) }); }
function fakeStore() { const m = new Map(); return { m, async get(k) { return m.has(k) ? JSON.parse(m.get(k)) : null; }, async setJSON(k, v) { m.set(k, JSON.stringify(v)); } }; }

// fixture: two Biology items, one Gen Chem item, one OChem, one QR, and a form that uses them
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'acebank-'));
const mk = (id, section, extra = {}) => ({ id, bankId: id.split(':')[1], bank: 'ace-bank-' + section, section, topic: 't', topicName: 'T', skill: 's', skillName: 'S', canon: null, conf: 'meta', difficulty: 2,
  stem: 'Stem of ' + id, choices: ['a', 'b', 'c', 'd', 'e'], answer: 1, why: 'Because.', traps: ['x', null, 'x', 'x', 'x'], hash: 'h-' + id, ...extra });
const banks = { bio: [mk('bio:b1', 'bio'), mk('bio:b2', 'bio')], gchem: [mk('gc:g1', 'gchem')], ochem: [mk('oc:o1', 'ochem')], qr: [mk('qr:q1', 'qr')], rc: [] };
for (const [b, items] of Object.entries(banks)) fs.writeFileSync(path.join(dir, b + '.json'), JSON.stringify({ items }));
fs.writeFileSync(path.join(dir, 'rc-passages.json'), '{}');
const forms = { forms: [{ id: 'ACE_1', name: 'Full-Length Test 5', sections: { bio: ['bio:b1'], gc: ['gc:g1'], ochem: ['oc:o1'], qr: ['qr:q1'] }, rc: { section: 'rc-s11', fallback: true }, pat: { seed: 'F20261101' } }] };
const queue = { sections: { bio: { seed: ['bio:b1', 'bio:b2'], forms: [], bank: [] } } };
const opts = { dir, forms, queue };

test('review: off with no key configured, and closed to everyone but the master coach', async () => {
  assert.equal((await handleReview(req('ace-bank-review?section=bio'), { env: OFF, store: fakeStore(), opts })).status, 503);
  assert.equal((await handleReview(req('ace-bank-review?section=bio'), { env: ON, store: fakeStore(), opts })).status, 401);
  const student = await token('student');
  assert.equal((await handleReview(req('ace-bank-review?section=bio', { headers: { 'x-ace-session': student } }), { env: ON, store: fakeStore(), opts })).status, 403);
  const coach = await token('coach', 'sarah');
  assert.equal((await handleReview(req('ace-bank-review?section=bio', { headers: { 'x-ace-session': coach } }), { env: ON, store: fakeStore(), opts })).status, 403);
  // a short or wrong key never opens it
  assert.equal((await handleReview(req('ace-bank-review?section=bio', { headers: { 'x-ace-review-key': 'short' } }), { env: { ACE_BANK_REVIEW_KEY: 'short' }, store: fakeStore(), opts })).status, 503);
  assert.equal((await handleReview(req('ace-bank-review?section=bio', { headers: { 'x-ace-review-key': KEY + 'x' } }), { env: { ACE_BANK_REVIEW_KEY: KEY }, store: fakeStore(), opts })).status, 401);
});

test('review: the master coach sees the queue, one item in full, and saves decisions', async () => {
  const store = fakeStore(), master = await token('master', 'thomas'), h = { 'x-ace-session': master };
  let r = await handleReview(req('ace-bank-review?section=bio', { headers: h }), { env: ON, store, opts });
  assert.equal(r.status, 200); let j = await r.json();
  assert.deepEqual(j.items.map((x) => x.id), ['bio:b1', 'bio:b2']); assert.equal(j.seedSize, 2); assert.equal(j.counts.open, 2);
  assert.equal(j.forms[0].status, 'awaiting review'); assert.equal(j.forms[0].needed, 4);
  r = await handleReview(req('ace-bank-review?id=bio:b1', { headers: h }), { env: ON, store, opts }); j = await r.json();
  assert.equal(j.item.stem, 'Stem of bio:b1'); assert.equal(j.status, 'open');
  // a decision needs the header (a cookie alone may not write) and a Fix needs a note
  r = await handleReview(req('ace-bank-review', { method: 'POST', headers: { cookie: 'ace_session=' + master }, body: { id: 'bio:b1', decision: 'approve' } }), { env: ON, store, opts });
  assert.equal(r.status, 401);
  r = await handleReview(req('ace-bank-review', { method: 'POST', headers: h, body: { id: 'bio:b2', decision: 'fix' } }), { env: ON, store, opts });
  assert.equal(r.status, 400);
  r = await handleReview(req('ace-bank-review', { method: 'POST', headers: h, body: { id: 'bio:b2', decision: 'fix', note: 'Choice C is also defensible.' } }), { env: ON, store, opts });
  assert.equal(r.status, 200);
  r = await handleReview(req('ace-bank-review', { method: 'POST', headers: h, body: { id: 'bio:b1', decision: 'approve' } }), { env: ON, store, opts });
  assert.equal(r.status, 200);
  const d = await store.get('decisions');
  assert.equal(d['bio:b1'].d, 'approve'); assert.equal(d['bio:b1'].h, 'h-bio:b1'); assert.equal(d['bio:b2'].note, 'Choice C is also defensible.');
  assert.equal([...store.m.keys()].filter((k) => k.startsWith('log/')).length, 2, 'every tap is logged');
});

test('review: the key stands in while the sign-in switch is off', async () => {
  const r = await handleReview(req('ace-bank-review?section=bio', { headers: { 'x-ace-review-key': KEY } }), { env: { ACE_BANK_REVIEW_KEY: KEY }, store: fakeStore(), opts });
  assert.equal(r.status, 200);
});

test('pool: empty while the switch is off, approved items only once on, and an edit after approval drops out', async () => {
  const store = fakeStore();
  await store.setJSON('decisions', { 'bio:b1': { d: 'approve', h: 'h-bio:b1' }, 'bio:b2': { d: 'fix', h: 'h-bio:b2', note: 'x' }, 'gc:g1': { d: 'approve', h: 'old-hash' } });
  let j = await (await handlePool(req('ace-bank-pool'), { env: OFF, store, opts })).json();
  assert.deepEqual(j.items, []); assert.equal(j.reason, 'sign_in_off');
  assert.equal((await handlePool(req('ace-bank-pool'), { env: ON, store, opts })).status, 401);
  j = await (await handlePool(req('ace-bank-pool', { headers: { cookie: 'ace_session=' + await token('student') } }), { env: ON, store, opts })).json();
  assert.deepEqual(j.items.map((x) => x.id), ['bio:b1']);
  assert.equal(j.items[0].hash, undefined, 'internal fields stay on the server');
});

test('forms: hidden from students until every item is approved; Thomas can preview', async () => {
  const store = fakeStore(), student = { cookie: 'ace_session=' + await token('student') }, master = { 'x-ace-session': await token('master', 'thomas') };
  let j = await (await handleForms(req('ace-bank-forms'), { env: OFF, store, opts })).json();
  assert.deepEqual(j.forms, []);
  j = await (await handleForms(req('ace-bank-forms', { headers: student }), { env: ON, store, opts })).json();
  assert.deepEqual(j.forms, []);
  assert.equal((await handleForms(req('ace-bank-forms?form=ACE_1', { headers: student }), { env: ON, store, opts })).status, 403);
  j = await (await handleForms(req('ace-bank-forms', { headers: master }), { env: ON, store, opts })).json();
  assert.equal(j.forms[0].status, 'awaiting review');
  j = await (await handleForms(req('ace-bank-forms?form=ACE_1', { headers: master }), { env: ON, store, opts })).json();
  assert.equal(j.preview, true); assert.equal(j.mock.sections.bio[0].q, 'Stem of bio:b1'); assert.equal(j.mock.rc.section, 'rc-s11');
  await store.setJSON('decisions', Object.fromEntries(['bio:b1', 'gc:g1', 'oc:o1', 'qr:q1'].map((id) => [id, { d: 'approve', h: 'h-' + id }])));
  j = await (await handleForms(req('ace-bank-forms', { headers: student }), { env: ON, store, opts })).json();
  assert.deepEqual(j.forms.map((f) => [f.id, f.status]), [['ACE_1', 'ready']]);
  const mk = await (await handleForms(req('ace-bank-forms?form=ACE_1', { headers: student }), { env: ON, store, opts })).json();
  assert.equal(mk.preview, false); assert.equal(mk.mock.sections.qr.length, 1); assert.equal(mk.mock.pat.seed, 'F20261101');
});
