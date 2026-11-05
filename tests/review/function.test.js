// tests/review/function.test.js : netlify/functions/approvals.mjs (build spec REVIEW acceptance):
// no key 401, a wrong key 401, Sarah's key sees PAT items only, pull then unpull, the limits.
// The real keys are never in the repo; these tests mint their own and hand the handler their hashes.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const path = require('node:path');
const fs = require('node:fs');
const { pathToFileURL } = require('node:url');

const ROOT = path.resolve(__dirname, '../..');
const FN = pathToFileURL(path.join(ROOT, 'netlify/functions/approvals.mjs')).href;
const INDEX = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/approvals/review-index.json'), 'utf8'));
const sha = (k) => crypto.createHash('sha256').update(k, 'utf8').digest('hex');
const T_KEY = crypto.randomBytes(32).toString('base64url');
const S_KEY = crypto.randomBytes(32).toString('base64url');
const KEYS = { keys: [{ role: 'thomas', scope: 'all', sha256: sha(T_KEY) }, { role: 'sarah', scope: 'pat', sha256: sha(S_KEY) }] };

function memoryStore() {
  const m = new Map();
  return {
    m,
    async get(k, o) { if (!m.has(k)) return null; const v = m.get(k); return o && o.type === 'json' ? JSON.parse(v) : v; },
    async set(k, v) { m.set(k, String(v)); },
    async setJSON(k, v) { m.set(k, JSON.stringify(v)); },
    async delete(k) { m.delete(k); },
    async list({ prefix = '' } = {}) { return { blobs: [...m.keys()].filter((k) => k.startsWith(prefix)).sort().map((key) => ({ key, etag: '' })) }; },
  };
}
let mod;
async function setup(opts = {}) {
  mod = mod || await import(FN);
  const store = memoryStore();
  let t = opts.t || Date.UTC(2026, 10, 10, 12, 0, 0);
  const h = mod.createHandler({ index: opts.index || INDEX, keys: KEYS, store: () => store, now: () => t, limits: opts.limits });
  let n = 0;
  const call = (method, { key, query = '', body, headers = {}, ip } = {}) => {
    const hd = { ...headers };
    if (key != null) hd['x-review-key'] = key;
    if (body !== undefined && !hd['content-type']) hd['content-type'] = 'application/json';
    const req = new Request('https://study.example/.netlify/functions/approvals' + query, { method, headers: hd, body: body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body) });
    return h(req, { ip: ip || '10.0.0.' + (++n % 250) });
  };
  return { store, call, tick: (ms) => { t += ms; } };
}
const PAT = INDEX.items.find((x) => x.section === 'pat' && x.pullable);
const BIO = INDEX.items.find((x) => x.section === 'bio' && x.kind === 'explainer');
const NIGHT = INDEX.items.find((x) => x.id === 'retold:bio:1');

test('the index has PAT, Bio, the Bio night 1 item, and every id passes the client id rule', () => {
  assert.ok(PAT && BIO && NIGHT);
  for (const it of INDEX.items) assert.match(it.id, /^[A-Za-z0-9][A-Za-z0-9:._\/-]{0,199}$/, it.id);
});

test('no key: 401 on read and on write', async () => {
  const { call } = await setup();
  assert.equal((await call('GET')).status, 401);
  assert.equal((await call('POST', { body: { action: 'pull', id: BIO.id } })).status, 401);
});

test('a wrong key, an empty key, a key in the query and a hash as key: 401', async () => {
  const { call } = await setup();
  for (const key of [crypto.randomBytes(32).toString('base64url'), '', 'x', T_KEY + 'a', T_KEY.slice(0, -1), sha(T_KEY), 'a'.repeat(300)]) {
    assert.equal((await call('GET', { key })).status, 401, 'key ' + key.length);
  }
  assert.equal((await call('GET', { query: '?k=' + T_KEY })).status, 401);
  assert.equal((await call('GET', { query: '?pulls=1&k=' + T_KEY })).status, 200, 'the public list stays public');
});

test('the committed key file holds two SHA-256 hashes: thomas (all) and sarah (pat), no plaintext', () => {
  const doc = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/approvals/key-hash.json'), 'utf8'));
  assert.deepEqual(doc.keys.map((k) => [k.role, k.scope]), [['thomas', 'all'], ['sarah', 'pat']]);
  for (const k of doc.keys) { assert.match(k.sha256, /^[0-9a-f]{64}$/); assert.deepEqual(Object.keys(k).sort(), ['role', 'scope', 'sha256']); }
  assert.notEqual(doc.keys[0].sha256, doc.keys[1].sha256);
});

test("Thomas's key sees every item; Sarah's key sees PAT items only and cannot act on others", async () => {
  const { call } = await setup();
  const t = await (await call('GET', { key: T_KEY })).json();
  assert.equal(t.role, 'thomas');
  assert.equal(t.items.length, INDEX.items.length);
  const s = await (await call('GET', { key: S_KEY })).json();
  assert.equal(s.role, 'sarah');
  assert.ok(s.items.length > 0);
  assert.ok(s.items.every((x) => x.section === 'pat'), 'only pat');
  assert.equal(s.items.length, INDEX.items.filter((x) => x.section === 'pat').length);
  assert.equal((await call('POST', { key: S_KEY, body: { action: 'pull', id: BIO.id } })).status, 403);
  assert.equal((await call('POST', { key: S_KEY, body: { action: 'comment', id: BIO.id, text: 'hi' } })).status, 403);
  assert.equal((await call('POST', { key: S_KEY, body: { action: 'pull', id: PAT.id } })).status, 200);
  // Thomas's comment on a Bio item stays out of Sarah's view
  await call('POST', { key: T_KEY, body: { action: 'comment', id: BIO.id, text: 'Bio note' } });
  const s2 = await (await call('GET', { key: S_KEY })).json();
  assert.deepEqual(Object.keys(s2.comments), []);
  assert.deepEqual(Object.keys(s2.pulls), [PAT.id]);
});

test('pull then unpull: the public list shows ids only, and the client honours it', async () => {
  const { call } = await setup();
  const pub = async () => (await call('GET', { query: '?pulls=1' })).json();
  assert.deepEqual(await pub(), { v: 1, pulls: [] });
  for (const id of [BIO.id, NIGHT.id]) assert.equal((await call('POST', { key: T_KEY, body: { action: 'pull', id } })).status, 200);
  const p = await pub();
  assert.deepEqual(p, { v: 1, pulls: [BIO.id, NIGHT.id].sort() });
  assert.deepEqual(Object.keys(p).sort(), ['pulls', 'v'], 'ids only: no who, no when, no comments');
  const priv = await (await call('GET', { key: T_KEY })).json();
  assert.equal(priv.pulls[BIO.id].by, 'thomas');
  assert.equal((await call('POST', { key: T_KEY, body: { action: 'unpull', id: BIO.id } })).status, 200);
  assert.deepEqual((await pub()).pulls, [NIGHT.id]);
  assert.equal((await call('POST', { key: T_KEY, body: { action: 'unpull', id: BIO.id } })).status, 200, 'unpull is idempotent');
});

test('comments: stored with who and when, trimmed, control characters stripped', async () => {
  const { call } = await setup();
  const r = await call('POST', { key: T_KEY, body: { action: 'comment', id: NIGHT.id, text: '  Looks right.\u0007\r\nKeep it.  ' } });
  assert.equal(r.status, 200);
  const g = await (await call('GET', { key: T_KEY })).json();
  assert.equal(g.comments[NIGHT.id].length, 1);
  assert.equal(g.comments[NIGHT.id][0].text, 'Looks right.\nKeep it.');
  assert.equal(g.comments[NIGHT.id][0].by, 'thomas');
  assert.equal((await call('POST', { key: T_KEY, body: { action: 'comment', id: NIGHT.id, text: '   ' } })).status, 400);
});

test('ids are validated: bad shape 400, unknown 404, prefix pulls refused', async () => {
  const { call } = await setup();
  for (const id of ['', '../x', 'a b', '<script>', 'x'.repeat(201), 42, null, ':bio']) {
    assert.equal((await call('POST', { key: T_KEY, body: { action: 'pull', id } })).status, 400, String(id));
  }
  // a bare prefix would pull a whole section through the client's colon rule: never accepted
  for (const id of ['retold', 'retold:bio', 'explainer', 'explainer:fm', 'explainer:fm:bio', 'fm', 'pat', 'retold:bio:1:99']) {
    assert.equal((await call('POST', { key: T_KEY, body: { action: 'pull', id } })).status, 404, id);
  }
  assert.equal((await call('POST', { key: T_KEY, body: { action: 'delete', id: BIO.id } })).status, 400);
  assert.equal((await call('POST', { key: T_KEY, body: [BIO.id] })).status, 400);
  assert.equal((await call('POST', { key: T_KEY, body: 'not json' })).status, 400);
  assert.equal((await call('POST', { key: T_KEY, body: { action: 'pull', id: BIO.id }, headers: { 'content-type': 'text/plain' } })).status, 415);
  assert.equal((await call('PUT', { key: T_KEY })).status, 405);
  assert.equal((await call('DELETE', { key: T_KEY })).status, 405);
});

test('a stored pull for an id outside the index never reaches the public list', async () => {
  const { call, store } = await setup();
  await store.setJSON('pull/' + Buffer.from('fm').toString('base64url'), { id: 'fm' });
  await store.setJSON('pull/' + Buffer.from('a b').toString('base64url'), { id: 'a b' });
  await store.setJSON('pull/%%%', {});
  assert.deepEqual((await (await call('GET', { query: '?pulls=1' })).json()).pulls, []);
});

test('a correction takes comments but no pull', async () => {
  const idx = JSON.parse(JSON.stringify(INDEX));
  idx.items.push({ id: 'fix:bio:example', kind: 'correction', section: 'bio', title: 'x', pullable: false, stamp: idx.stamp, preview: { type: 'text' } });
  const { call } = await setup({ index: idx });
  assert.equal((await call('POST', { key: T_KEY, body: { action: 'pull', id: 'fix:bio:example' } })).status, 409);
  assert.equal((await call('POST', { key: T_KEY, body: { action: 'comment', id: 'fix:bio:example', text: 'ok' } })).status, 200);
});

test('limits: body size, comment length, comments per item, writes per minute and per day', async () => {
  const { call, tick } = await setup({ limits: { writesPerMinute: 5, writesPerDay: 8, commentsPerItem: 3 } });
  assert.equal((await call('POST', { key: T_KEY, body: { action: 'comment', id: BIO.id, text: 'x'.repeat(5000) } })).status, 413, 'body over 4 KB');
  assert.equal((await call('POST', { key: T_KEY, body: { action: 'comment', id: BIO.id, text: 'x'.repeat(2001) } })).status, 413, 'comment over 2000');
  assert.equal((await call('POST', { key: T_KEY, body: { action: 'comment', id: BIO.id, text: 'x'.repeat(2000) } })).status, 200);
  assert.equal((await call('POST', { key: T_KEY, body: { action: 'comment', id: BIO.id, text: 'two' } })).status, 200);
  assert.equal((await call('POST', { key: T_KEY, body: { action: 'comment', id: BIO.id, text: 'three' } })).status, 200);
  assert.equal((await call('POST', { key: T_KEY, body: { action: 'comment', id: BIO.id, text: 'four' } })).status, 429, 'comments per item (not charged)');
  assert.equal((await call('POST', { key: T_KEY, body: { action: 'pull', id: BIO.id } })).status, 200, 'write 4');
  assert.equal((await call('POST', { key: T_KEY, body: { action: 'unpull', id: BIO.id } })).status, 200, 'write 5');
  assert.equal((await call('POST', { key: T_KEY, body: { action: 'pull', id: BIO.id } })).status, 429, 'writes per minute');
  tick(61000);
  for (let i = 6; i <= 8; i++) assert.equal((await call('POST', { key: T_KEY, body: { action: i % 2 ? 'unpull' : 'pull', id: BIO.id } })).status, 200, 'write ' + i);
  assert.equal((await call('POST', { key: T_KEY, body: { action: 'pull', id: BIO.id } })).status, 429, 'writes per day');
  assert.equal((await call('POST', { key: S_KEY, body: { action: 'pull', id: PAT.id } })).status, 200, 'the cap is per key');
});

test('limits: requests and failed keys per address per minute', async () => {
  const { call, tick } = await setup({ limits: { requestsPerMinute: 6, badKeysPerMinute: 3 } });
  const ip = '192.0.2.7';
  for (let i = 0; i < 3; i++) assert.equal((await call('GET', { key: 'nope-nope-nope-nope', ip })).status, 401);
  assert.equal((await call('GET', { key: 'nope-nope-nope-nope', ip })).status, 429, 'failed keys');
  assert.equal((await call('GET', { key: T_KEY, ip })).status, 200, 'a right key still works');
  assert.equal((await call('GET', { query: '?pulls=1', ip })).status, 200, 'request 6');
  assert.equal((await call('GET', { query: '?pulls=1', ip })).status, 429, 'requests per minute');
  tick(60000);
  assert.equal((await call('GET', { query: '?pulls=1', ip })).status, 200);
});

test('storage down: the public list answers 503, which the client treats as a failure (never as an empty list)', async () => {
  mod = mod || await import(FN);
  const h = mod.createHandler({ index: INDEX, keys: KEYS, store: () => { throw new Error('down'); } });
  const r = await h(new Request('https://x/.netlify/functions/approvals?pulls=1'), { ip: '1.1.1.1' });
  assert.equal(r.status, 503);
  const r2 = await h(new Request('https://x/.netlify/functions/approvals'), { ip: '1.1.1.2' });
  assert.equal(r2.status, 401, 'auth is checked before storage');
});

test('the deployed handler (real key file): no key and a wrong key are 401 without touching storage', async () => {
  mod = mod || await import(FN);
  assert.equal((await mod.default(new Request('https://x/.netlify/functions/approvals'), { ip: '9.9.9.1' })).status, 401);
  assert.equal((await mod.default(new Request('https://x/.netlify/functions/approvals', { headers: { 'x-review-key': crypto.randomBytes(32).toString('base64url') } }), { ip: '9.9.9.2' })).status, 401);
});

test('the key check runs the same comparisons whatever the key (no early exit)', async () => {
  mod = mod || await import(FN);
  const table = mod.keyTable(KEYS);
  const orig = crypto.timingSafeEqual; let calls = 0;
  crypto.timingSafeEqual = (a, b) => { calls++; return orig(a, b); };
  try {
    for (const k of [T_KEY, S_KEY, crypto.randomBytes(32).toString('base64url')]) { calls = 0; mod.roleFor(k, table); assert.equal(calls, 2); }
  } finally { crypto.timingSafeEqual = orig; }
  assert.deepEqual(mod.roleFor(T_KEY, table), { role: 'thomas', scope: 'all' });
  assert.deepEqual(mod.roleFor(S_KEY, table), { role: 'sarah', scope: 'pat' });
});
