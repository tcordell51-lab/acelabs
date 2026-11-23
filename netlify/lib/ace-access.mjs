// What is open and what needs a sign-in. One list, read by the edge gate and by the tests.
//
// Thomas's decision (2026-11-16): "Free taste, rest locked". A few labs and one
// diagnostic stay open to bring in leads; everything else needs a sign-in.
//
// The rule is default deny: a page, script or data file that is not named free here is
// locked. Pictures, fonts, styles, audio and video never reach the gate (see the
// excludedPath list in netlify/edge-functions/ace-gate.js).

/** Free pages. Paths are normalized: no trailing slash, no .html, no /index. */
export const FREE_PAGES = Object.freeze([
  // the front door and the hubs (a signed-out visitor can see what exists)
  '/', '/ace-labs', '/learn', '/labs', '/tests', '/practice',
  '/scope', '/onboarding', '/for-retakers', '/404', '/sign-in',
  // the free labs: one per science section and one for QR
  '/gc/galvanic',        // Gen Chem: build a galvanic cell
  '/games/chirality',    // OChem: R and S chirality
  '/oc/chirality',       //   (short address, redirects to /games/chirality/)
  '/bio/see',            // Biology: labelled plates
  '/qr/worked',          // QR: worked examples
  // the one free diagnostic (signed-out visitors get the fixed free form, see FREE_FORMS)
  '/diagnostic',
  // where the free diagnostic ends: its question-by-question review (reads this browser's record only)
  '/review',
  // accounts and the pass (2026-11-20). Each page shows a neutral note while ACE_LABS_ACCOUNTS is off.
  '/pass', '/account',
]);

/**
 * Extra pages a FREE ACCOUNT opens (signed in by email, no pass), only while ACE_LABS_ACCOUNTS
 * is on. The four section hubs run on the small sample banks in SAMPLE_FORMS, and Repair and
 * Progress run the whole miss loop on whatever the student has answered. Exact page keys, not
 * prefixes, so /gc/vsepr and the other labs under a hub stay locked.
 */
export const FREE_ACCOUNT_PAGES = Object.freeze(['/gc', '/bio', '/oc', '/qr/drill', '/repair', '/progress']);

/**
 * Banks a free account (and a signed-out visitor who reaches them) gets as a small sample.
 * Built by scripts/build-free-samples.mjs. Holders of the pass get the full file.
 */
export const SAMPLE_FORMS = Object.freeze({
  '/data/bio.json': '/data/free/sample-bio.json',
  '/data/gchem.json': '/data/free/sample-gchem.json',
  '/data/ochem.json': '/data/free/sample-ochem.json',
  '/data/qr-climb.json': '/data/free/sample-qr-climb.json',
  '/data/qr-dat.json': '/data/free/sample-qr-dat.json',
});

/** Pages under this prefix are for coaches only (role master or coach), pass or not. */
export const COACH_PREFIX = '/coach/';

/** Scripts and data a free page needs. Prefix match. */
// The free labs' own folders are free too (the Galvanic lab loads galvanic-walk.js next to it).
export const FREE_FILE_PREFIXES = Object.freeze(['/shared/', '/sign-in/', '/gc/galvanic/', '/games/chirality/', '/bio/see/', '/qr/worked/']);

/** Free single files. */
// /data/topics.json is topic ids and names only (no questions): Labs and the review read it.
// The sample banks are ten questions a section; they are free files so the rewrite can always reach them.
export const FREE_FILES = Object.freeze(['/robots.txt', '/favicon.ico', '/data/free/diagnostic-bank.json', '/data/topics.json', '/gc/galvanic/galvanic-walk.js',
  '/data/free/sample-bio.json', '/data/free/sample-gchem.json', '/data/free/sample-ochem.json', '/data/free/sample-qr-climb.json', '/data/free/sample-qr-dat.json']);

/** Question banks that live under a free prefix but are locked. */
export const LOCKED_FILES = Object.freeze([
  '/shared/dat-mock-tests.js',      // the timed full mock forms
  '/shared/ochem-bank.js',          // OChem bank
  '/shared/qr-formats-bank.js',     // QR formats bank
  '/shared/qr-formats-bank.json',
]);

/**
 * Files a signed-out visitor gets in a smaller free form. The free diagnostic reads the
 * whole mock bank; signed out it is served a fixed 60 question form instead
 * (built by scripts/build-free-diagnostic.mjs).
 */
export const FREE_FORMS = Object.freeze({
  '/scripts/dat-mock-bank.json': '/data/free/diagnostic-bank.json',
});

/**
 * Entitlement scopes. A portal sign-in carries 'all'. A later pass (crash course buyers)
 * can carry a narrower scope: add it here as scope -> list of path prefixes it opens,
 * and mint the pass with ent: ['<scope>']. Nothing else has to change.
 */
export const SCOPES = Object.freeze({
  // example, not issued yet:  'crash-qr': ['/qr/', '/tools/qr/', '/data/qr-climb.json'],
});

const MEDIA = /\.(css|png|jpe?g|gif|webp|avif|svg|ico|woff2?|ttf|otf|mp3|m4a|wav|ogg|mp4|webm|vtt)$/i;

export function normalize(pathname) {
  let p = String(pathname || '/');
  try { p = decodeURIComponent(p); } catch { /* keep the raw path */ }
  p = p.replace(/\/{2,}/g, '/');
  // resolve . and .. so /shared/../tools/x cannot pass as /shared/
  const out = [];
  for (const seg of p.split('/')) {
    if (seg === '..') out.pop(); else if (seg !== '.' && seg !== '') out.push(seg);
  }
  const trailing = /\/$/.test(p);
  p = '/' + out.join('/') + (trailing && out.length ? '/' : '');
  return p;
}

export function pageKey(pathname) {
  let p = normalize(pathname).replace(/\/index(\.html?)?$/i, '/').replace(/\.html?$/i, '');
  if (p.length > 1) p = p.replace(/\/+$/, '');
  return p || '/';
}

export function isPagePath(pathname) {
  const p = normalize(pathname);
  if (/\/$/.test(p) || /\.html?$/i.test(p)) return true;
  const last = p.split('/').pop();
  return !/\.[A-Za-z0-9]{1,6}$/.test(last);
}

/** 'media' | 'free' | 'locked' */
export function classify(pathname) {
  const p = normalize(pathname);
  const lower = p.toLowerCase();
  if (MEDIA.test(lower)) return 'media';
  if (LOCKED_FILES.includes(lower)) return 'locked';
  if (Object.prototype.hasOwnProperty.call(FREE_FORMS, lower)) return 'locked';
  if (FREE_FILES.includes(lower)) return 'free';
  if (isPagePath(p)) return FREE_PAGES.includes(pageKey(lower)) ? 'free' : 'locked';
  if (FREE_FILE_PREFIXES.some((pre) => lower.startsWith(pre))) return 'free';
  return 'locked';
}

/**
 * The entitlements a session carries right now. A pass or a comp ends at session.until
 * (seconds); after that the same session is a free account until it is refreshed.
 */
export function effectiveEnt(session, now = Math.floor(Date.now() / 1000)) {
  if (!session) return [];
  const ent = Array.isArray(session.ent) ? session.ent : [];
  if (typeof session.until === 'number' && session.until > 0 && now >= session.until) return session.src === 'email' ? ['free-account'] : [];
  return ent;
}

/** Does this session open this locked path? */
export function entitled(session, pathname, now) {
  if (!session) return false;
  const ent = effectiveEnt(session, now);
  if (ent.includes('all')) return true;
  const p = normalize(pathname).toLowerCase();
  return ent.some((scope) => (SCOPES[scope] || []).some((pre) => p.startsWith(pre)));
}

/** A same-site path to come back to after sign-in, or '/' when it is not one. */
export function safeNext(next) {
  const n = String(next || '');
  if (!n.startsWith('/') || n.startsWith('//') || n.includes('\\') || /[\u0000-\u001f]/.test(n)) return '/';
  if (pageKey(n.split(/[?#]/)[0]) === '/sign-in') return '/';
  return n.slice(0, 600);
}
