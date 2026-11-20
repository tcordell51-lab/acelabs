// POST /.netlify/functions/ace-magic-request   Body: { email, next }
//
// Step one of the email sign-in. Emails a one-time sign-in link (15 minutes) to the address.
// Always answers { ok: true } for a well-formed address, whether or not an account exists, so the
// answer never tells anyone who has an account. Limits: 5 links per address and 30 per IP an hour.
//
// The link carries the token in the address fragment (/sign-in/#m=...), which browsers never send
// to a server and mail scanners that "click" links cannot use: the page posts it to ace-magic-verify.
//
// Env: ACE_LABS_SIGN_IN + ACE_LABS_ACCOUNTS (both on), RESEND_API_KEY, ACE_LABS_SITE_URL or URL.
import { json, accountsEnabled } from '../lib/ace-token.mjs';
import { safeNext } from '../lib/ace-access.mjs';
import { defaultKv, issueMagic, underLimit, validEmail, normEmail, siteUrl, MAGIC_MINUTES } from '../lib/ace-accounts.mjs';
import { signInEmail, resendMailer } from '../lib/ace-mail.mjs';

export function sameOrigin(req) {
  const o = req.headers.get('origin');
  if (!o) return true;   // same-origin fetches from older browsers, and server-to-server tests
  try { return new URL(o).host === new URL(req.url).host; } catch { return false; }
}

export async function handleMagicRequest(req, { env = process.env, kv, mailer, now = Date.now() } = {}) {
  if (req.method !== 'POST') return json(405, { ok: false, error: 'POST only' });
  if (!accountsEnabled(env)) return json(404, { ok: false, error: 'accounts_off' });
  if (!sameOrigin(req)) return json(403, { ok: false, error: 'origin' });
  let body; try { body = JSON.parse((await req.text()).slice(0, 4096) || '{}'); } catch { return json(400, { ok: false, error: 'bad_json' }); }
  const email = normEmail(body.email);
  if (!validEmail(email)) return json(400, { ok: false, error: 'bad_email' });
  const store = kv || await defaultKv();
  const ip = req.headers.get('x-nf-client-connection-ip') || req.headers.get('x-forwarded-for') || 'unknown';
  if (!(await underLimit(store, 'ip', ip, 30, now)) || !(await underLimit(store, 'email', email, 5, now))) return json(429, { ok: false, error: 'too_many' });

  const token = await issueMagic(store, email, safeNext(body.next || '/'), now);
  const link = `${siteUrl(env, req)}/sign-in/#m=${token}`;
  const send = mailer || resendMailer(env);
  const sent = await send({ to: email, ...signInEmail({ link, minutes: MAGIC_MINUTES }) }).catch(() => false);
  if (!sent) return json(503, { ok: false, error: 'email_not_sent' });
  return json(200, { ok: true });
}

export default async (req) => {
  try { return await handleMagicRequest(req); } catch { return json(500, { ok: false, error: 'server' }); }
};
