// GET    /.netlify/functions/ace-session   -> { enabled, signedIn, cookie, sub, role, view, exp, portal }
// DELETE /.netlify/functions/ace-session   -> signs out (clears the cookie)
//
// "enabled" is the feature flag (ACE_LABS_SIGN_IN). While it is off this is the only
// thing the answer says, and no page asks unless a visitor opens /sign-in/ by hand.
import { json, signInEnabled, accountsEnabled, sessionFromRequest, SESSION_COOKIE } from '../lib/ace-token.mjs';
import { effectiveEnt } from '../lib/ace-access.mjs';
import { passPriceLabel, passDays } from '../lib/ace-accounts.mjs';

/** What the pages need to know about accounts and the pass. Nothing at all while ACE_LABS_ACCOUNTS is off. */
export function accountsInfo(env) {
  if (!accountsEnabled(env)) return { accounts: false };
  return { accounts: true, pass: { price: passPriceLabel(env), days: passDays(env) } };
}

export const DEFAULT_PORTAL = 'https://acethedat-portal.netlify.app';

export async function handleSession(req, { env = process.env, now } = {}) {
  const portal = /^https:\/\/[a-z0-9.-]+$/i.test(String(env.ACE_LABS_PORTAL_ORIGIN || '')) ? env.ACE_LABS_PORTAL_ORIGIN : DEFAULT_PORTAL;
  if (!signInEnabled(env)) return json(200, { enabled: false });
  if (req.method === 'DELETE') {
    return json(200, { enabled: true, signedIn: false, ...accountsInfo(env) }, { 'Set-Cookie': `${SESSION_COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=None; Partitioned` });
  }
  if (req.method !== 'GET') return json(405, { error: 'GET or DELETE' });
  const byHeader = await sessionFromRequest(req, env, { now, headerOnly: true });
  const byCookie = await sessionFromRequest(req, env, { now, cookieOnly: true });
  const s = byHeader || byCookie;
  if (!s) return json(200, { enabled: true, signedIn: false, cookie: false, portal, ...accountsInfo(env) });
  // cookie: whether page and bank requests will pass the gate from this browser context
  const t = now == null ? Math.floor(Date.now() / 1000) : now;
  const full = effectiveEnt(s, t).includes('all');
  return json(200, { enabled: true, signedIn: true, cookie: !!byCookie && byCookie.sub === s.sub, sub: s.sub, role: s.role, view: s.view || null, exp: s.exp, portal,
    src: s.src || 'portal', plan: s.plan || (s.src === 'email' ? 'free' : 'portal'), full, ...accountsInfo(env) });
}

export default async (req) => {
  try { return await handleSession(req); } catch { return json(500, { error: 'server' }); }
};
