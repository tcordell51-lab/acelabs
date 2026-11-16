// POST /.netlify/functions/ace-session-exchange   Body: { token }
//
// Step two of the portal sign-in. The portal minted a two minute handoff token for the
// student who is signed in there. This function checks it on the server (signature with
// the shared secret, type, expiry, that it was minted for THIS site, and that it has not
// been used before) and answers with an Ace Labs session: a signed token for page scripts
// (X-Ace-Session) and the same token as an HttpOnly cookie for page and bank requests.
//
// The student id comes only from the verified token. Nothing in the URL or the body is
// trusted as an identity.
//
// Env: ACE_LABS_SIGN_IN (the flag), ACE_LABS_HANDOFF_SECRET (shared with the portal),
//      ACE_LABS_SESSION_HOURS (optional, default 12).
import { json, signInEnabled, usableSecret, verifyToken, signToken, sessionSecret, HANDOFF_TYP, SESSION_TYP, SESSION_COOKIE, STUDENT_ID, TokenError } from '../lib/ace-token.mjs';

// Who may hand a visitor to Ace Labs. A later pass (crash course buyers) is one more row:
// its own token type, its own secret, and the entitlement it grants.
const ISSUERS = {
  [HANDOFF_TYP]: { iss: 'acethedat-portal', secretEnv: 'ACE_LABS_HANDOFF_SECRET', ent: () => ['all'], src: 'portal' },
};

async function defaultJtiStore() {
  try {
    const { getStore } = await import('@netlify/blobs');
    const store = getStore('ace-labs-handoff');
    return {
      async used(jti) { return (await store.get(jti)) != null; },
      async mark(jti, exp) { await store.set(jti, String(exp)); },
    };
  } catch { return null; }   // local runs without the blob store: expiry alone limits replay
}

export function sessionCookie(token, maxAge) {
  // SameSite=None + Partitioned so the cookie also works when the portal frames Ace Labs.
  // It only ever authorizes GETs of pages and banks; every write needs the header token.
  return `${SESSION_COOKIE}=${token}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=None; Partitioned`;
}

export async function handleExchange(req, { env = process.env, now = Math.floor(Date.now() / 1000), jtiStore } = {}) {
  if (req.method !== 'POST') return json(405, { ok: false, error: 'POST only' });
  if (!signInEnabled(env)) return json(404, { ok: false, error: 'sign_in_off' });
  const secret = env.ACE_LABS_HANDOFF_SECRET;
  if (!usableSecret(secret)) return json(503, { ok: false, error: 'not_configured' });

  let body; try { body = JSON.parse((await req.text()).slice(0, 8192) || '{}'); } catch { return json(400, { ok: false, error: 'bad_json' }); }
  const issuer = ISSUERS[HANDOFF_TYP];
  let claim;
  try {
    claim = await verifyToken(String(body.token || ''), env[issuer.secretEnv], { typ: HANDOFF_TYP, aud: new URL(req.url).host, now });
  } catch (e) {
    return json(401, { ok: false, error: e instanceof TokenError ? e.reason : 'invalid' });
  }
  if (claim.iss !== issuer.iss) return json(401, { ok: false, error: 'wrong_issuer' });
  const role = String(claim.role || '');
  if (!['student', 'coach', 'master'].includes(role)) return json(401, { ok: false, error: 'wrong_role' });
  if (role === 'student' && !STUDENT_ID.test(String(claim.sub || ''))) return json(401, { ok: false, error: 'no_student' });
  if (!claim.sub || !claim.jti) return json(401, { ok: false, error: 'malformed' });
  const view = role !== 'student' && STUDENT_ID.test(String(claim.view || '')) ? String(claim.view) : null;

  const store = jtiStore === undefined ? await defaultJtiStore() : jtiStore;
  if (store) {
    try {
      if (await store.used(String(claim.jti))) return json(401, { ok: false, error: 'already_used' });
      await store.mark(String(claim.jti), claim.exp);
    } catch { /* the store is down: the two minute expiry still limits replay */ }
  }

  const hours = Math.max(1, Math.min(72, Number(env.ACE_LABS_SESSION_HOURS) || 12));
  const exp = now + hours * 3600;
  const session = { v: 1, typ: SESSION_TYP, sub: String(claim.sub), role, view, ent: issuer.ent(claim), src: issuer.src, iat: now, exp };
  const token = await signToken(session, await sessionSecret(secret));
  return json(200, { ok: true, token, exp, sub: session.sub, role, view }, { 'Set-Cookie': sessionCookie(token, hours * 3600) });
}

export default async (req) => {
  try { return await handleExchange(req); } catch { return json(500, { ok: false, error: 'server' }); }
};
