// The gate decision, kept apart from the Netlify edge runtime so it can be tested with
// node --test. The edge function (netlify/edge-functions/ace-gate.js) only carries it out.
//
//   decide(request, env) -> { action: 'pass' }                         flag off, or nothing to do
//                           { action: 'pass', html: true, session }    serve; add the session script to the page
//                           { action: 'pass', private: true, session } serve a locked file to its signed-in reader
//                           { action: 'rewrite', to }                  serve the free form of a file
//                           { action: 'redirect', location }           to the sign-in page, or to a cleaned address
//                           { action: 'deny', status, body }           locked data, no session
import { classify, entitled, isPagePath, safeNext, FREE_FORMS, normalize } from './ace-access.mjs';
import { sessionFromRequest, signInEnabled, STUDENT_ID } from './ace-token.mjs';

export const SESSION_SCRIPT = '/sign-in/ace-session.js?v=1';
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

  if (session && entitled(session, path)) return page ? { action: 'pass', html: true, private: true, session } : { action: 'pass', private: true, session };

  const lower = path.toLowerCase();
  if (Object.prototype.hasOwnProperty.call(FREE_FORMS, lower)) return { action: 'rewrite', to: FREE_FORMS[lower] };
  if (page) return { action: 'redirect', location: '/sign-in/?next=' + encodeURIComponent(safeNext(url.pathname + url.search)) };
  return { action: 'deny', status: 401, body: { error: 'sign_in_required' } };
}

/** Add the session script to a page, once. */
export function injectSessionScript(html) {
  if (html.indexOf('/sign-in/ace-session.js') >= 0) return html;
  const i = html.search(/<\/head\s*>/i);
  if (i >= 0) return html.slice(0, i) + SESSION_SCRIPT_TAG + html.slice(i);
  return html + SESSION_SCRIPT_TAG;
}
