// The Ace Labs gate. Runs in front of every page, script and data file.
//
// With ACE_LABS_SIGN_IN unset (the default) the first line hands the request straight on:
// the site behaves exactly as it did before this file existed.
//
// With ACE_LABS_SIGN_IN=on:
//   - free pages and files are served to everyone
//   - a locked page sends a signed-out visitor to /sign-in/ and back
//   - a locked question bank or test file answers 401 without a verified session, so the
//     file is no longer a public static file: it only leaves the server after the check
//   - every page gets the small session script (handoff, progress sync, sign out)
// The decision itself is netlify/lib/ace-gate-core.mjs (tested in tests/signin/).
import { decide, injectSessionScript } from '../lib/ace-gate-core.mjs';
import { signInEnabled } from '../lib/ace-token.mjs';

function readEnv() {
  const get = (k) => {
    try { if (typeof Netlify !== 'undefined' && Netlify.env) return Netlify.env.get(k); } catch { /* fall through */ }
    try { if (typeof Deno !== 'undefined') return Deno.env.get(k); } catch { /* fall through */ }
    return undefined;
  };
  return { ACE_LABS_SIGN_IN: get('ACE_LABS_SIGN_IN'), ACE_LABS_HANDOFF_SECRET: get('ACE_LABS_HANDOFF_SECRET') };
}

function withHeaders(res, set, remove = []) {
  const headers = new Headers(res.headers);
  for (const k of remove) headers.delete(k);
  for (const [k, v] of Object.entries(set)) headers.set(k, v);
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
}

export default async (request, context) => {
  const env = readEnv();
  if (!signInEnabled(env)) return;   // flag off: nothing changes

  let d;
  try {
    d = await decide(request, env);
  } catch {
    // The gate could not decide. Fail closed: no page and no bank goes out unchecked.
    return new Response('Ace Labs is briefly unavailable. Please try again.', { status: 503, headers: { 'Cache-Control': 'no-store', 'Content-Type': 'text/plain; charset=utf-8' } });
  }

  if (d.action === 'redirect') {
    return new Response(null, { status: 302, headers: { Location: d.location, 'Cache-Control': 'no-store' } });
  }
  if (d.action === 'deny') {
    return new Response(JSON.stringify(d.body), { status: d.status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
  }
  if (d.action === 'rewrite') {
    const res = await context.rewrite(d.to);
    return withHeaders(res, { 'Cache-Control': 'private, no-store', Vary: 'Cookie' }, ['etag', 'last-modified']);
  }
  if (!d.html && !d.private) return;   // free script or data, or nothing to do

  if (d.html) {
    // Ask the origin for the whole page (no 304), so the session script is always added.
    const headers = new Headers(request.headers);
    headers.delete('if-none-match'); headers.delete('if-modified-since');
    const res = await context.next(new Request(request, { headers }));
    const type = res.headers.get('content-type') || '';
    if (res.status !== 200 || type.indexOf('text/html') < 0) return res;
    const html = injectSessionScript(await res.text());
    const out = new Headers(res.headers);
    for (const k of ['etag', 'last-modified', 'content-length', 'content-encoding']) out.delete(k);
    out.set('Cache-Control', d.private ? 'private, no-store' : 'no-cache');
    out.set('Vary', 'Cookie');
    return new Response(html, { status: 200, headers: out });
  }

  // a locked script or data file, for its signed-in reader only
  const res = await context.next();
  return withHeaders(res, { 'Cache-Control': 'private, max-age=300', Vary: 'Cookie' });
};

export const config = {
  path: '/*',
  // Pictures, fonts, styles, audio and video are never gated, and the functions check
  // their own callers.
  excludedPath: [
    '/.netlify/*',
    '/*.css', '/*.png', '/*.jpg', '/*.jpeg', '/*.gif', '/*.webp', '/*.avif', '/*.svg', '/*.ico',
    '/*.woff', '/*.woff2', '/*.ttf', '/*.otf',
    '/*.mp3', '/*.m4a', '/*.wav', '/*.ogg', '/*.mp4', '/*.webm', '/*.vtt',
  ],
  // If the gate itself cannot start, serve the site as before rather than take it down.
  // See docs/ace-labs-sign-in.md in the portal repo ("Risks") before changing this to "fail".
  onError: 'bypass',
};
