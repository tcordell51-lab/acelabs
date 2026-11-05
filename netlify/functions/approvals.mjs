/* approvals : the review page's server (build spec REVIEW, OS-14).

   The owner and a second reviewer review every auto-approved item on /approvals/, comment on
   it, and Pull or Unpull it. Student pages read the pull list through
   shared/ace-pulls.js (a pull in any of its three lists wins, so pulls never
   fail open).

     GET  ?pulls=1                       public: { v: 1, pulls: [id, ...] } (ids only)
     GET                                 key: { role, scope, items, pulls, comments }
     POST { action: "pull", id }         key: pull one item
     POST { action: "unpull", id }       key: unpull it
     POST { action: "comment", id, text } key: add a comment (1 to 2000 characters)

   The key: 32 random bytes (base64url) sent as X-Review-Key. Only the SHA-256
   of each key is committed (content/approvals/key-hash.json); the hashes are
   compared in constant time. The full key acts on every item; the PAT key on the
   PAT items only. No env var.

   Ids: only the ids in content/approvals/review-index.json (built by
   scripts/build-review-index.mjs) can be pulled or commented on; a correction
   of a known factual error takes comments but no pull. Limits: a 4 KB body,
   2000-character comments, 50 comments per item, writes per key per minute and
   per day, requests and failed keys per address per minute.

   Storage: the Netlify Blobs store "approvals" (strong consistency):
     pull/<b64url id>                 { id, by, at }
     comment/<b64url id>/<at>-<rand>  { id, by, at, text }
     log/<at>-<rand>                  { action, id, by, at }
     rate/<role>/<minute|day>         a write count */
import crypto from 'node:crypto';
import INDEX from '../../content/approvals/review-index.json' with { type: 'json' };
import KEYS from '../../content/approvals/key-hash.json' with { type: 'json' };

export const ID_RE = /^[A-Za-z0-9][A-Za-z0-9:._\/-]{0,199}$/;
export const LIMITS = {
  bodyBytes: 4096,
  commentChars: 2000,
  commentsPerItem: 50,
  writesPerMinute: 30,
  writesPerDay: 600,
  requestsPerMinute: 120,
  badKeysPerMinute: 10,
};

const b64 = (s) => Buffer.from(s, 'utf8').toString('base64url');
const unb64 = (s) => { try { return Buffer.from(s, 'base64url').toString('utf8'); } catch { return null; } };
const rand = () => crypto.randomBytes(6).toString('hex');

function json(obj, status, extra) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
      'x-robots-tag': 'noindex',
      ...(extra || {}),
    },
  });
}

/* ---------- keys: constant-time over every committed hash ---------- */
export function keyTable(doc) {
  return (doc && Array.isArray(doc.keys) ? doc.keys : [])
    .filter((k) => k && /^[0-9a-f]{64}$/.test(k.sha256 || '') && typeof k.role === 'string')
    .map((k) => ({ role: k.role, scope: k.scope === 'all' ? 'all' : String(k.scope || ''), hash: Buffer.from(k.sha256, 'hex') }));
}
export function roleFor(key, table) {
  if (typeof key !== 'string' || key.length < 16 || key.length > 256) return null;
  const got = crypto.createHash('sha256').update(key, 'utf8').digest();
  let found = null;
  for (const k of table) { if (crypto.timingSafeEqual(got, k.hash) && !found) found = k; }
  return found ? { role: found.role, scope: found.scope } : null;
}

/* ---------- best-effort per-address limits (one function instance) ---------- */
function windowCounter() {
  const m = new Map();
  return function hit(key, max, now) {
    const minute = Math.floor(now / 60000);
    if (m.size > 5000) for (const [k, v] of m) if (v.minute !== minute) m.delete(k);
    const cur = m.get(key);
    if (!cur || cur.minute !== minute) { m.set(key, { minute, n: 1 }); return true; }
    cur.n++;
    return cur.n <= max;
  };
}

export function createHandler(opts) {
  const index = opts.index;
  const table = keyTable(opts.keys);
  const limits = { ...LIMITS, ...(opts.limits || {}) };
  const now = opts.now || (() => Date.now());
  const openStore = opts.store;
  const items = new Map(index.items.map((x) => [x.id, x]));
  const inScope = (who, it) => who.scope === 'all' || it.section === who.scope;
  const reqHit = windowCounter(), badHit = windowCounter();

  async function writeAllowed(store, role, t) {
    const d = new Date(t).toISOString();
    const keys = ['rate/' + role + '/' + d.slice(0, 16), 'rate/' + role + '/' + d.slice(0, 10)];
    const caps = [limits.writesPerMinute, limits.writesPerDay];
    const counts = await Promise.all(keys.map(async (k) => parseInt((await store.get(k)) || '0', 10) || 0));
    if (counts.some((n, i) => n >= caps[i])) return false;
    await Promise.all(keys.map((k, i) => store.set(k, String(counts[i] + 1))));
    return true;
  }
  async function pulledIds(store) {
    const { blobs } = await store.list({ prefix: 'pull/' });
    const out = [];
    for (const b of blobs || []) {
      const id = unb64(String(b.key).slice(5));
      if (id && ID_RE.test(id) && items.has(id) && items.get(id).pullable) out.push(id);
    }
    return [...new Set(out)].sort();
  }

  return async function handler(req, context) {
    const t = now();
    const url = new URL(req.url);
    const ip = (context && context.ip) || req.headers.get('x-nf-client-connection-ip') || 'unknown';
    if (!reqHit(ip, limits.requestsPerMinute, t)) return json({ error: 'Too many requests. Try again in a minute.' }, 429, { 'retry-after': '60' });
    if (req.method !== 'GET' && req.method !== 'POST') return json({ error: 'GET or POST only.' }, 405, { allow: 'GET, POST' });

    let store;
    const open = async () => { try { store = await openStore(); return true; } catch { return false; } };

    /* the public list: ids only, no key */
    if (req.method === 'GET' && url.searchParams.get('pulls') === '1') {
      if (!(await open())) return json({ error: 'Storage is not available.' }, 503);
      try { return json({ v: 1, pulls: await pulledIds(store) }, 200); } catch { return json({ error: 'Storage is not available.' }, 503); }
    }

    /* everything else needs a key */
    const who = roleFor(req.headers.get('x-review-key'), table);
    if (!who) {
      if (!badHit(ip, limits.badKeysPerMinute, t)) return json({ error: 'Too many tries. Try again in a minute.' }, 429, { 'retry-after': '60' });
      return json({ error: 'This needs the review key.' }, 401);
    }
    if (!(await open())) return json({ error: 'Storage is not available.' }, 503);

    if (req.method === 'GET') {
      try {
        const mine = index.items.filter((it) => inScope(who, it));
        const ids = new Set(mine.map((x) => x.id));
        const pulls = {};
        const { blobs: pb } = await store.list({ prefix: 'pull/' });
        for (const b of pb || []) {
          const id = unb64(String(b.key).slice(5));
          if (!id || !ids.has(id)) continue;
          const rec = await store.get(b.key, { type: 'json' });
          pulls[id] = { by: rec && rec.by || null, at: rec && rec.at || null };
        }
        const comments = {};
        const { blobs: cb } = await store.list({ prefix: 'comment/' });
        for (const b of cb || []) {
          const id = unb64(String(b.key).split('/')[1] || '');
          if (!id || !ids.has(id)) continue;
          const rec = await store.get(b.key, { type: 'json' });
          if (!rec || typeof rec.text !== 'string') continue;
          (comments[id] = comments[id] || []).push({ by: rec.by, at: rec.at, text: rec.text });
        }
        Object.values(comments).forEach((l) => l.sort((a, b) => String(a.at).localeCompare(String(b.at))));
        return json({ role: who.role, scope: who.scope, stamp: index.stamp, items: mine, pulls, comments }, 200);
      } catch { return json({ error: 'Storage is not available.' }, 503); }
    }

    /* POST: one action on one item */
    const ct = req.headers.get('content-type') || '';
    if (!/^application\/json\b/i.test(ct)) return json({ error: 'Send JSON.' }, 415);
    const declared = parseInt(req.headers.get('content-length') || '0', 10);
    if (declared > limits.bodyBytes) return json({ error: 'Too large.' }, 413);
    let raw;
    try { raw = await req.text(); } catch { return json({ error: 'Bad request.' }, 400); }
    if (Buffer.byteLength(raw, 'utf8') > limits.bodyBytes) return json({ error: 'Too large.' }, 413);
    let body;
    try { body = JSON.parse(raw); } catch { return json({ error: 'Bad request.' }, 400); }
    if (!body || typeof body !== 'object' || Array.isArray(body)) return json({ error: 'Bad request.' }, 400);
    const { action, id } = body;
    if (!['pull', 'unpull', 'comment'].includes(action)) return json({ error: 'Unknown action.' }, 400);
    if (typeof id !== 'string' || !ID_RE.test(id)) return json({ error: 'Bad id.' }, 400);
    const it = items.get(id);
    if (!it) return json({ error: 'No such item.' }, 404);
    if (!inScope(who, it)) return json({ error: 'Not in your list.' }, 403);
    let text = null;
    if (action === 'comment') {
      if (typeof body.text !== 'string') return json({ error: 'Write a comment first.' }, 400);
      text = body.text.replace(/\r\n?/g, '\n').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim();
      if (!text) return json({ error: 'Write a comment first.' }, 400);
      if (text.length > limits.commentChars) return json({ error: 'Keep it under ' + limits.commentChars + ' characters.' }, 413);
    } else if (!it.pullable) return json({ error: 'This is a correction of a known error; it takes comments, not a pull.' }, 409);

    try {
      const at = new Date(t).toISOString();
      const pk = 'pull/' + b64(id), cprefix = 'comment/' + b64(id) + '/';
      if (action === 'comment') {
        const { blobs } = await store.list({ prefix: cprefix });
        if ((blobs || []).length >= limits.commentsPerItem) return json({ error: 'This item has the most comments it can hold.' }, 429);
      }
      if (!(await writeAllowed(store, who.role, t))) return json({ error: 'Too many changes. Try again later.' }, 429, { 'retry-after': '60' });
      if (action === 'pull') await store.setJSON(pk, { id, by: who.role, at });
      else if (action === 'unpull') await store.delete(pk);
      else await store.setJSON(cprefix + at + '-' + rand(), { id, by: who.role, at, text });
      await store.setJSON('log/' + at + '-' + rand(), { action, id, by: who.role, at });
      return json({ ok: true, action, id, at, pulled: action === 'pull' ? true : action === 'unpull' ? false : undefined }, 200);
    } catch { return json({ error: 'Storage is not available.' }, 503); }
  };
}

let blobs = null;
async function blobsStore() {
  if (!blobs) blobs = await import('@netlify/blobs');
  try { return blobs.getStore({ name: 'approvals', consistency: 'strong' }); } catch { return blobs.getStore('approvals'); }
}
const handler = createHandler({ index: INDEX, keys: KEYS, store: blobsStore });
export default (req, context) => handler(req, context);
