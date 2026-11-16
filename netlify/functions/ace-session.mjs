// GET    /.netlify/functions/ace-session   -> { enabled, signedIn, cookie, sub, role, view, exp, portal }
// DELETE /.netlify/functions/ace-session   -> signs out (clears the cookie)
//
// "enabled" is the feature flag (ACE_LABS_SIGN_IN). While it is off this is the only
// thing the answer says, and no page asks unless a visitor opens /sign-in/ by hand.
import { json, signInEnabled, sessionFromRequest, SESSION_COOKIE } from '../lib/ace-token.mjs';

export const DEFAULT_PORTAL = 'https://acethedat-portal.netlify.app';

export async function handleSession(req, { env = process.env, now } = {}) {
  const portal = /^https:\/\/[a-z0-9.-]+$/i.test(String(env.ACE_LABS_PORTAL_ORIGIN || '')) ? env.ACE_LABS_PORTAL_ORIGIN : DEFAULT_PORTAL;
  if (!signInEnabled(env)) return json(200, { enabled: false });
  if (req.method === 'DELETE') {
    return json(200, { enabled: true, signedIn: false }, { 'Set-Cookie': `${SESSION_COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=None; Partitioned` });
  }
  if (req.method !== 'GET') return json(405, { error: 'GET or DELETE' });
  const byHeader = await sessionFromRequest(req, env, { now, headerOnly: true });
  const byCookie = await sessionFromRequest(req, env, { now, cookieOnly: true });
  const s = byHeader || byCookie;
  if (!s) return json(200, { enabled: true, signedIn: false, cookie: false, portal });
  // cookie: whether page and bank requests will pass the gate from this browser context
  return json(200, { enabled: true, signedIn: true, cookie: !!byCookie && byCookie.sub === s.sub, sub: s.sub, role: s.role, view: s.view || null, exp: s.exp, portal });
}

export default async (req) => {
  try { return await handleSession(req); } catch { return json(500, { error: 'server' }); }
};
