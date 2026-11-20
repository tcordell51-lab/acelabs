// Ace Labs email accounts and the pass. Server only (Netlify Functions, Node 18+).
//
// Off unless ACE_LABS_ACCOUNTS is on (and the gate, ACE_LABS_SIGN_IN, is on too). Nothing here
// runs on the live site until Thomas flips both. The Stripe webhook is the one exception: it
// records a paid pass whenever its signing secret is set, so a payment is never lost.
//
// Storage: Netlify Blobs, store "ace-labs-accounts" (server side only, never served):
//   acct/<sha256(email)>   the account JSON (below)
//   id/<account id>        sha256(email), so a Stripe event or a coach can find the account
//   magic/<sha256(token)>  a sign-in link: { email, next, exp }, single use, 15 minutes
//   rl/<kind>/<key>/<hr>   sign-in link request counts, per email and per IP, per hour
//
// Account JSON:
//   { v: 1, id: 'AL...', email, created, lastLogin, lastPlan, portalId,
//     pass: { until, grants: [{ cs, pi, days, at, amount, currency, livemode, refunded }] },
//     comp: { until, note, by, at } | null }
//
// Progress is NOT stored here. It goes to the portal's Airtable Tool State table through
// ace-progress, under the account id (or the Portal ID for a coaching student), exactly as
// for a portal sign-in. Coaches read it there.
//
// Who gets the pass without paying (the "comp" rule, all automatic at sign-in):
//   coach      email listed in ACE_LABS_COACH_EMAILS                         -> role master
//   coaching   Students row with this Email and Status in ACE_LABS_COMP_STATUSES (default Active)
//              -> the session uses that student's Portal ID, so it joins their portal progress
//   crash      Leads row with this Email, Enrolled, Source crash-course-*    -> ACE_LABS_CRASH_DAYS
//              (default 90) from the row's Created At
//   comp       set by hand by Thomas on /coach/accounts/
//   pass       paid through Stripe Checkout
import crypto from 'node:crypto';
import { signToken, sessionSecret, SESSION_TYP, SESSION_COOKIE, STUDENT_ID, usableSecret } from './ace-token.mjs';

export const STORE = 'ace-labs-accounts';
export const EMAIL = /^[A-Za-z0-9._%+-]{1,64}@[A-Za-z0-9.-]{1,180}\.[A-Za-z]{2,24}$/;
export const ACCOUNT_ID = /^AL[A-Z2-9]{10}$/;
export const MAGIC_MINUTES = 15;
export const DAY_MS = 86400000;
const LEADS_TABLE = 'tblUJOZlwLMJdCYU3';   // portal base Leads (same id the trick-sheet capture uses)
const AIRTABLE = 'https://api.airtable.com/v0';
const BASE = 'appDXSpdJuc3WvtYU';

export const sha = (s) => crypto.createHash('sha256').update(String(s)).digest('hex');
export const normEmail = (e) => String(e || '').trim().toLowerCase();
export function validEmail(e) { const n = normEmail(e); return n.length <= 254 && EMAIL.test(n) && !n.includes('..'); }
export function passDays(env) { return Math.max(1, Math.min(400, Math.round(Number(env && env.ACE_LABS_PASS_DAYS) || 90))); }

/* ------------------------------------------------------------------ key-value store */

/** A tiny store interface: get, set, del, list(prefix). Netlify Blobs in production. */
export async function defaultKv() {
  const { getStore } = await import('@netlify/blobs');
  const store = getStore(STORE);
  return {
    async get(k) { const v = await store.get(k); return v == null ? null : String(v); },
    async set(k, v) { await store.set(k, String(v)); },
    async del(k) { await store.delete(k); },
    async list(prefix) { const out = []; for await (const page of store.list({ prefix, paginate: true })) for (const b of page.blobs || []) out.push(b.key); return out; },
  };
}

/** In-memory store, for tests and the local end-to-end harness. */
export function memoryKv() {
  const m = new Map();
  return {
    map: m,
    async get(k) { return m.has(k) ? m.get(k) : null; },
    async set(k, v) { m.set(k, String(v)); },
    async del(k) { m.delete(k); },
    async list(prefix) { return [...m.keys()].filter((k) => k.startsWith(prefix)).sort(); },
  };
}

const getJson = async (kv, k) => { const v = await kv.get(k); if (v == null) return null; try { return JSON.parse(v); } catch { return null; } };

/* ------------------------------------------------------------------ accounts */

function newId() {
  const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';   // no I, O, 0, 1
  const b = crypto.randomBytes(10);
  let s = 'AL';
  for (let i = 0; i < 10; i++) s += A[b[i] % A.length];
  return s;
}

export async function accountByEmail(kv, email) { return getJson(kv, 'acct/' + sha(normEmail(email))); }
export async function accountById(kv, id) {
  if (!ACCOUNT_ID.test(String(id || ''))) return null;
  const h = await kv.get('id/' + id);
  return h ? getJson(kv, 'acct/' + h) : null;
}
export async function saveAccount(kv, acct) {
  await kv.set('acct/' + sha(acct.email), JSON.stringify(acct));
  await kv.set('id/' + acct.id, sha(acct.email));
  return acct;
}
export async function findOrCreate(kv, email, now = Date.now()) {
  const e = normEmail(email);
  if (!validEmail(e)) throw Object.assign(new Error('bad email'), { status: 400 });
  const cur = await accountByEmail(kv, e);
  if (cur) return cur;
  return saveAccount(kv, { v: 1, id: newId(), email: e, created: now, lastLogin: 0, lastPlan: 'free', portalId: null, pass: { until: 0, grants: [] }, comp: null });
}

/* ------------------------------------------------------------------ the pass */

/** Pass end (ms) from its grants: each paid grant adds its days, starting no earlier than it was paid. */
export function passUntil(grants) {
  let until = 0;
  for (const g of [...(grants || [])].filter((x) => !x.refunded).sort((a, b) => a.at - b.at)) until = Math.max(until, g.at) + g.days * DAY_MS;
  return until;
}

/** Record a paid Checkout session on the account. Idempotent on the session id. */
export async function grantPass(kv, acct, { cs, pi = '', days, at = Date.now(), amount = 0, currency = 'usd', livemode = false }) {
  acct.pass = acct.pass || { until: 0, grants: [] };
  if (acct.pass.grants.some((g) => g.cs === cs)) return { acct, added: false };
  acct.pass.grants.push({ cs, pi, days, at, amount, currency, livemode: !!livemode, refunded: false });
  acct.pass.until = passUntil(acct.pass.grants);
  await saveAccount(kv, acct);
  return { acct, added: true };
}

/** A full refund takes that grant's days back off. Returns the account, or null when no grant matched. */
export async function revokeByPaymentIntent(kv, pi) {
  for (const k of await kv.list('acct/')) {
    const acct = await getJson(kv, k);
    const g = acct && acct.pass && acct.pass.grants.find((x) => x.pi && x.pi === pi && !x.refunded);
    if (!g) continue;
    g.refunded = true;
    acct.pass.until = passUntil(acct.pass.grants);
    await saveAccount(kv, acct);
    return acct;
  }
  return null;
}

/* ------------------------------------------------------------------ who gets what */

const list = (v) => String(v || '').split(/[,\s]+/).map((x) => x.trim().toLowerCase()).filter(Boolean);
const escFormula = (s) => String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'");

/** The portal-side lookups, against the portal's Airtable base. Any failure answers "not found". */
export function airtableLookups(env, fetchImpl = fetch) {
  const base = env.ACE_LABS_AIRTABLE_BASE || BASE;
  async function rows(table, formula, fields) {
    if (!env.AIRTABLE_PAT) return [];
    const q = new URLSearchParams({ filterByFormula: formula, pageSize: '5' });
    for (const f of fields) q.append('fields[]', f);
    try {
      const res = await fetchImpl(`${AIRTABLE}/${base}/${encodeURIComponent(table)}?${q}`, { headers: { Authorization: `Bearer ${env.AIRTABLE_PAT}` } });
      if (!res.ok) return [];
      const j = await res.json();
      return (j.records || []).map((r) => r.fields || {});
    } catch { return []; }
  }
  return {
    async student(email) {
      const statuses = list(env.ACE_LABS_COMP_STATUSES || 'active');
      const e = escFormula(normEmail(email));
      const found = await rows('Students', `LOWER({Email})='${e}'`, ['Portal ID', 'Status', 'Email']);
      const hit = found.find((f) => normEmail(f.Email) === normEmail(email) && statuses.includes(String(f.Status || 'Active').toLowerCase()) && STUDENT_ID.test(String(f['Portal ID'] || '')));
      return hit ? { portalId: String(hit['Portal ID']) } : null;
    },
    async crash(email) {
      const e = escFormula(normEmail(email));
      const found = await rows(LEADS_TABLE, `AND(LOWER({Email})='${e}', {Enrolled}, LEFT({Source}, 13)='crash-course-')`, ['Email', 'Source', 'Enrolled', 'Created At']);
      const times = found.filter((f) => normEmail(f.Email) === normEmail(email) && f.Enrolled).map((f) => Date.parse(f['Created At'] || '')).filter(Number.isFinite);
      return times.length ? { since: Math.max(...times) } : null;
    },
  };
}

/**
 * What this account opens right now.
 * -> { plan: 'coach'|'coaching'|'comp'|'pass'|'crash'|'free', role, ent, until (ms or 0 = no end), sub, portalId }
 */
export async function resolveAccess(acct, env, { now = Date.now(), lookups } = {}) {
  const email = normEmail(acct.email);
  if (list(env.ACE_LABS_COACH_EMAILS).includes(email)) return { plan: 'coach', role: 'master', ent: ['all'], until: 0, sub: acct.id, portalId: null };
  const L = lookups || airtableLookups(env);
  const student = await L.student(email).catch(() => null);
  if (student) return { plan: 'coaching', role: 'student', ent: ['all'], until: 0, sub: student.portalId, portalId: student.portalId };

  const options = [];
  if (acct.comp && (acct.comp.until === 0 || acct.comp.until > now)) options.push({ plan: 'comp', until: acct.comp.until || 0 });
  const pu = passUntil(acct.pass && acct.pass.grants);
  if (pu > now) options.push({ plan: 'pass', until: pu });
  const crash = await L.crash(email).catch(() => null);
  if (crash) { const cu = crash.since + Math.max(1, Number(env.ACE_LABS_CRASH_DAYS) || 90) * DAY_MS; if (cu > now) options.push({ plan: 'crash', until: cu }); }
  if (options.length) {
    options.sort((a, b) => (a.until === 0 ? Infinity : a.until) - (b.until === 0 ? Infinity : b.until));
    const best = options[options.length - 1];
    return { plan: best.plan, role: 'student', ent: ['all'], until: best.until, sub: acct.id, portalId: null };
  }
  return { plan: 'free', role: 'student', ent: ['free-account'], until: 0, sub: acct.id, portalId: null };
}

/* ------------------------------------------------------------------ sessions */

export function accountCookie(token, maxAge) {
  // the same cookie the portal sign-in sets (ace-session-exchange.mjs)
  return `${SESSION_COOKIE}=${token}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=None; Partitioned`;
}

/** Sign an Ace Labs session for an account with the access just resolved. */
export async function mintAccountSession(acct, access, env, now = Math.floor(Date.now() / 1000)) {
  const secret = env.ACE_LABS_HANDOFF_SECRET;
  if (!usableSecret(secret)) throw Object.assign(new Error('not configured'), { status: 503 });
  const hours = Math.max(1, Math.min(72, Number(env.ACE_LABS_SESSION_HOURS) || 12));
  const exp = now + hours * 3600;
  const until = access.until ? Math.floor(access.until / 1000) : 0;
  const session = { v: 1, typ: SESSION_TYP, sub: access.sub, role: access.role, view: null, ent: access.ent, src: 'email', acct: acct.id, plan: access.plan, until, iat: now, exp };
  const token = await signToken(session, await sessionSecret(secret));
  return { token, exp, session, cookie: accountCookie(token, hours * 3600) };
}

/** The shape the browser stores (sign-in/ace-session.js), same as a portal sign-in. */
export function sessionBody(m) {
  const s = m.session;
  return { ok: true, token: m.token, exp: m.exp, sub: s.sub, role: s.role, view: null, plan: s.plan, until: s.until, src: 'email' };
}

/* ------------------------------------------------------------------ sign-in links */

export async function issueMagic(kv, email, next, now = Date.now()) {
  const token = crypto.randomBytes(32).toString('base64url');
  await kv.set('magic/' + sha(token), JSON.stringify({ email: normEmail(email), next: String(next || '/').slice(0, 600), exp: now + MAGIC_MINUTES * 60000 }));
  return token;
}

/** Use a sign-in link once. Returns { email, next } or null. */
export async function consumeMagic(kv, token, now = Date.now()) {
  if (typeof token !== 'string' || !/^[A-Za-z0-9_-]{40,60}$/.test(token)) return null;
  const k = 'magic/' + sha(token);
  const rec = await getJson(kv, k);
  if (!rec) return null;
  await kv.del(k);   // single use, even when it has expired
  if (!rec.exp || rec.exp <= now) return null;
  return { email: rec.email, next: rec.next };
}

/** Count one request; true while under the limit. */
export async function underLimit(kv, kind, key, max, now = Date.now()) {
  const k = `rl/${kind}/${sha(key).slice(0, 32)}/${Math.floor(now / 3600000)}`;
  const n = Number(await kv.get(k)) || 0;
  if (n >= max) return false;
  await kv.set(k, String(n + 1));
  return true;
}

/** The site address for links in emails: never taken from the request's Host header in production. */
export function siteUrl(env, req) {
  const set = String(env.ACE_LABS_SITE_URL || env.URL || '').replace(/\/+$/, '');
  if (/^https:\/\/[a-z0-9.-]+$/i.test(set)) return set;
  if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(set)) return set;
  const u = new URL(req.url);
  return /^(localhost|127\.0\.0\.1)$/.test(u.hostname) ? u.origin : 'https://acelabs.netlify.app';
}
