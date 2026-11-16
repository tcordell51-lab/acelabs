// Signed tokens for the Ace Labs sign-in. Web Crypto only, so the same file runs in
// Netlify Functions (Node 18+) and in the edge gate (Deno).
//
// Format: <base64url(JSON payload)>.<base64url(HMAC-SHA256(secret, first part))>
// This is the same format the portal's session tokens use (netlify/functions/_lib/auth.js),
// so the portal can mint a handoff token with node:crypto and this file can verify it.
//
// Two kinds of token, told apart by payload.typ AND by the signing key:
//   ace-labs-handoff  minted by the portal, signed with ACE_LABS_HANDOFF_SECRET, lives 2 minutes
//   ace-labs-session  minted here after a good handoff, signed with a key derived from the
//                     same secret, so a handoff token can never be replayed as a session
//
// A later non-portal entitlement (for example a signed, time-limited crash course pass) is
// one more entry in ISSUERS in ace-session-exchange.mjs with its own secret; nothing here changes.

const enc = new TextEncoder();
const dec = new TextDecoder();

export const HANDOFF_TYP = 'ace-labs-handoff';
export const SESSION_TYP = 'ace-labs-session';
export const SESSION_COOKIE = 'ace_session';
export const SESSION_HEADER = 'x-ace-session';

export function b64u(bytes) {
  let s = '';
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
}
export function unb64u(str) {
  const pad = str.length % 4 ? '='.repeat(4 - (str.length % 4)) : '';
  const bin = atob(str.replace(/-/g, '+').replace(/_/g, '/') + pad);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

// Node 18 has no global crypto; Node 20+, Deno and browsers do.
let subtleP = null;
function subtle() {
  if (!subtleP) subtleP = globalThis.crypto && globalThis.crypto.subtle ? Promise.resolve(globalThis.crypto.subtle) : import('node:crypto').then((m) => m.webcrypto.subtle);
  return subtleP;
}
async function key(secret) {
  return (await subtle()).importKey('raw', enc.encode(String(secret)), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

export class TokenError extends Error {
  constructor(reason) { super(reason); this.name = 'TokenError'; this.reason = reason; }
}

/** A secret must be set and at least 32 characters, or nothing is signed or accepted. */
export function usableSecret(secret) {
  return typeof secret === 'string' && secret.length >= 32;
}

export async function signToken(payload, secret) {
  if (!usableSecret(secret)) throw new TokenError('no_secret');
  const body = b64u(enc.encode(JSON.stringify(payload)));
  const sig = new Uint8Array(await (await subtle()).sign('HMAC', await key(secret), enc.encode(body)));
  return `${body}.${b64u(sig)}`;
}

/**
 * Verify signature, type, expiry and (when given) audience. Returns the payload or throws
 * TokenError. The signature is checked before the payload is parsed.
 */
export async function verifyToken(token, secret, { typ, aud, now = Math.floor(Date.now() / 1000) } = {}) {
  if (!usableSecret(secret)) throw new TokenError('no_secret');
  if (typeof token !== 'string' || token.length > 4096) throw new TokenError('malformed');
  const parts = token.split('.');
  if (parts.length !== 2 || !parts[0] || !parts[1]) throw new TokenError('malformed');
  let sig;
  try { sig = unb64u(parts[1]); } catch { throw new TokenError('malformed'); }
  const ok = await (await subtle()).verify('HMAC', await key(secret), sig, enc.encode(parts[0]));
  if (!ok) throw new TokenError('bad_signature');
  let payload;
  try { payload = JSON.parse(dec.decode(unb64u(parts[0]))); } catch { throw new TokenError('malformed'); }
  if (!payload || typeof payload !== 'object') throw new TokenError('malformed');
  if (typ && payload.typ !== typ) throw new TokenError('wrong_type');
  if (typeof payload.exp !== 'number' || payload.exp <= now) throw new TokenError('expired');
  if (typeof payload.iat === 'number' && payload.iat > now + 60) throw new TokenError('not_yet_valid');
  if (aud && payload.aud !== aud) throw new TokenError('wrong_audience');
  return payload;
}

/** The session signing key: derived, so the shared secret itself never signs a session. */
export async function sessionSecret(handoffSecret) {
  if (!usableSecret(handoffSecret)) throw new TokenError('no_secret');
  const sig = new Uint8Array(await (await subtle()).sign('HMAC', await key(handoffSecret), enc.encode('ace-labs-session-key-v1')));
  return b64u(sig);
}

export const STUDENT_ID = /^[A-Za-z0-9_-]{1,40}$/;

export function readCookie(header, name) {
  const parts = String(header || '').split(/;\s*/);
  for (const p of parts) {
    const i = p.indexOf('=');
    if (i > 0 && p.slice(0, i).trim() === name) return p.slice(i + 1).trim();
  }
  return '';
}

/** The feature flag. OFF unless ACE_LABS_SIGN_IN is exactly on / true / 1. */
export function signInEnabled(env) {
  const v = String((env && env.ACE_LABS_SIGN_IN) || '').trim().toLowerCase();
  return v === 'on' || v === 'true' || v === '1';
}

/**
 * The verified Ace Labs session for a request, or null. Reads the X-Ace-Session header
 * first (function calls from page scripts), then the ace_session cookie (page and bank
 * requests, which cannot carry a header).
 */
export async function sessionFromRequest(request, env, { now, cookieOnly = false, headerOnly = false } = {}) {
  const secret = env && env.ACE_LABS_HANDOFF_SECRET;
  if (!usableSecret(secret)) return null;
  const h = request.headers;
  const candidates = [];
  if (!cookieOnly) candidates.push(h.get(SESSION_HEADER) || '');
  if (!headerOnly) candidates.push(readCookie(h.get('cookie'), SESSION_COOKIE));
  const sk = await sessionSecret(secret);
  for (const t of candidates) {
    if (!t) continue;
    try {
      const p = await verifyToken(t, sk, { typ: SESSION_TYP, now });
      if (p && typeof p.sub === 'string' && p.sub) return p;
    } catch { /* try the next credential */ }
  }
  return null;
}

export const json = (status, body, headers = {}) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...headers },
});
