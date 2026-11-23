// The gate decision, kept apart from the Netlify edge runtime so it can be tested with
// node --test. The edge function (netlify/edge-functions/ace-gate.js) only carries it out.
//
//   decide(request, env) -> { action: 'pass' }                         flag off, or nothing to do
//                           { action: 'pass', html: true, session }    serve; add the session script to the page
//                           { action: 'pass', private: true, session } serve a locked file to its signed-in reader
//                           { action: 'rewrite', to }                  serve the free form of a file
//                           { action: 'redirect', location }           to the sign-in page, or to a cleaned address
//                           { action: 'deny', status, body }           locked data, no session (401), or a
//                                                                      free account without the pass (402)
//
// With ACE_LABS_ACCOUNTS on as well (email accounts and the pass):
//   - a signed-in free account opens FREE_ACCOUNT_PAGES and gets the SAMPLE_FORMS banks
//   - a signed-in visitor without the pass who opens a locked page goes to /pass/, not /sign-in/
// With it off, every answer is exactly what it was before accounts existed.
import { classify, entitled, effectiveEnt, isPagePath, pageKey, safeNext, FREE_FORMS, FREE_ACCOUNT_PAGES, SAMPLE_FORMS, COACH_PREFIX, normalize } from './ace-access.mjs';
import { sessionFromRequest, signInEnabled, accountsEnabled, STUDENT_ID } from './ace-token.mjs';

export const SESSION_SCRIPT = '/sign-in/ace-session.js?v=2';
export const SESSION_SCRIPT_TAG = `<script src="${SESSION_SCRIPT}" defer></script>`;

export async function decide(request, env, { now } = {}) {
  if (!signInEnabled(env)) return { action: 'pass' };
  const url = new URL(request.url);
  const path = normalize(url.pathname);
  if (path.startsWith('/.netlify/')) return { action: 'pass' };
  const method = request.method || 'GET';
  if (method !== 'GET' && method !== 'HEAD') return { action: 'pass' };   // form posts and the like: functions check their own callers

  const cls = classify(path);
  if (cls === 'media') return { action: 'pass' };
  // Pages and files travel with the cookie only: a header on a page request means nothing here.
  const session = await sessionFromRequest(request, env, { now, cookieOnly: true });
  const page = isPagePath(path);

  // ?student=<id> used to be trusted as the student's identity. It is now only ever the
  // id inside the verified session; anything else is taken off the address.
  if (page && url.searchParams.has('student')) {
    const asked = url.searchParams.get('student') || '';
    let allowed = '';
    if (session && session.role === 'student') allowed = session.sub;
    else if (session && session.view) allowed = session.view;
    if (!STUDENT_ID.test(allowed)) allowed = '';
    if (asked !== allowed) {
      if (allowed) url.searchParams.set('student', allowed); else url.searchParams.delete('student');
      return { action: 'redirect', location: url.pathname + url.search };
    }
  }

  if (cls === 'free') return page ? { action: 'pass', html: true, session } : { action: 'pass' };

  const lower = path.toLowerCase();
  const back = encodeURIComponent(safeNext(url.pathname + url.search));
  const accounts = accountsEnabled(env);
  const t = now == null ? Math.floor(Date.now() / 1000) : now;

  // coach pages: a coach or Thomas only, whatever else the session opens
  if (lower.startsWith(COACH_PREFIX)) {
    if (session && (session.role === 'master' || session.role === 'coach') && entitled(session, path, t)) return page ? { action: 'pass', html: true, private: true, session } : { action: 'pass', private: true, session };
    if (page) return { action: 'redirect', location: '/sign-in/?next=' + back };
    return { action: 'deny', status: session ? 403 : 401, body: { error: session ? 'coach_only' : 'sign_in_required' } };
  }

  if (session && entitled(session, path, t)) return page ? { action: 'pass', html: true, private: true, session } : { action: 'pass', private: true, session };

  // a free account: the section hubs and the miss loop, on the sample banks
  const freeAccount = accounts && session && effectiveEnt(session, t).includes('free-account');
  if (freeAccount && Object.prototype.hasOwnProperty.call(SAMPLE_FORMS, lower)) return { action: 'rewrite', to: SAMPLE_FORMS[lower] };
  if (freeAccount && page && FREE_ACCOUNT_PAGES.includes(pageKey(lower))) return { action: 'pass', html: true, private: true, session };

  if (Object.prototype.hasOwnProperty.call(FREE_FORMS, lower)) return { action: 'rewrite', to: FREE_FORMS[lower] };
  if (page) return { action: 'redirect', location: (accounts && session ? '/pass/?next=' : '/sign-in/?next=') + back };
  if (accounts && session) return { action: 'deny', status: 402, body: { error: 'pass_required' } };
  return { action: 'deny', status: 401, body: { error: 'sign_in_required' } };
}

/** Add the session script to a page, once. */
export function injectSessionScript(html) {
  if (html.indexOf('/sign-in/ace-session.js') >= 0) return html;
  const i = html.search(/<\/head\s*>/i);
  if (i >= 0) return html.slice(0, i) + SESSION_SCRIPT_TAG + html.slice(i);
  return html + SESSION_SCRIPT_TAG;
}
