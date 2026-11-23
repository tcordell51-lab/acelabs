// The Ace Labs sign-in email. ACE DAT branded (the one approved layout, netlify/functions/_lib/
// email-brand.mjs), sent through Resend, the same sender the trick-sheet capture uses.
// It is a transactional email (the visitor asked for it), so it carries why they got it and the
// postal line, and no marketing.
//
// Env: RESEND_API_KEY, ACE_LABS_EMAIL_FROM (default "ACE DAT <team@acethedat.com>").
import { fillShell, p, button, esc, checkBrand, POSTAL } from '../functions/_lib/email-brand.mjs';

export function signInEmail({ link, minutes }) {
  const bodyHtml = [
    p('Here is your link to sign in to Ace Labs.'),
    button(link, 'Sign in to Ace Labs'),
    p(`The link works once and lasts ${minutes} minutes. If the button does not work, copy this address into your browser:`),
    p(`<span style="word-break:break-all;">${esc(link)}</span>`),
    p('If you did not ask for this, you can ignore this email. Nobody can sign in without the link.'),
  ].join('\n');
  const html = fillShell({
    preheader: 'Your Ace Labs sign-in link',
    greeting: 'Hi,',
    bodyHtml,
    signoff: 'See you in Ace Labs,',
    fineHtml: `${esc('You got this email because someone asked to sign in to Ace Labs with this address.')}<br>${esc(POSTAL)}`,
  });
  const text = [
    'Hi,', 'Here is your link to sign in to Ace Labs:', link,
    `The link works once and lasts ${minutes} minutes.`,
    'If you did not ask for this, you can ignore this email. Nobody can sign in without the link.',
    'See you in Ace Labs,', 'Thomas Cordell', 'Founder, ACE DAT. 510 AA, 99th percentile', 'acethedat.com', POSTAL,
  ].join('\n\n');
  return { subject: 'Your Ace Labs sign-in link', html, text };
}

export function brandProblems(html) { return checkBrand(html).filter((x) => !/unsubscribe/i.test(x)); }

/** Send through Resend. Returns true when Resend accepted it. */
export function resendMailer(env, fetchImpl = fetch) {
  return async ({ to, subject, html, text }) => {
    if (!env.RESEND_API_KEY) return false;
    const res = await fetchImpl('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: env.ACE_LABS_EMAIL_FROM || 'ACE DAT <team@acethedat.com>', to: [to], subject, html, text }),
    });
    return res.ok;
  };
}
