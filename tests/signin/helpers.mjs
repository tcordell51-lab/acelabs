// Shared fixtures for the sign-in tests.
import crypto from 'node:crypto';
import { signToken, sessionSecret, SESSION_TYP, HANDOFF_TYP } from '../../netlify/lib/ace-token.mjs';

export const SECRET = 'test-handoff-secret-0123456789-abcdefghij';
export const HOST = 'acelabs.netlify.app';
export const ON = { ACE_LABS_SIGN_IN: 'on', ACE_LABS_HANDOFF_SECRET: SECRET, AIRTABLE_PAT: 'pat-test' };
export const NOW = 1794000000;   // fixed clock, seconds

const b64u = (b) => Buffer.from(b).toString('base64').replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');

/** A handoff token minted the way the portal mints it: node:crypto, not Web Crypto. */
export function portalHandoff(claims = {}, secret = SECRET) {
  const payload = { v: 1, typ: HANDOFF_TYP, iss: 'acethedat-portal', aud: HOST, sub: 'S22', role: 'student', view: null, jti: crypto.randomUUID(), iat: NOW, exp: NOW + 120, ...claims };
  const body = b64u(JSON.stringify(payload));
  return `${body}.${b64u(crypto.createHmac('sha256', secret).update(body).digest())}`;
}

export async function sessionToken(claims = {}, secret = SECRET) {
  return signToken({ v: 1, typ: SESSION_TYP, sub: 'S22', role: 'student', view: null, ent: ['all'], src: 'portal', iat: NOW, exp: NOW + 3600, ...claims }, await sessionSecret(secret));
}

export function req(path, { method = 'GET', headers = {}, body } = {}) {
  return new Request(`https://${HOST}${path}`, { method, headers, body: body == null ? undefined : (typeof body === 'string' ? body : JSON.stringify(body)) });
}

/** An in-memory stand-in for the Airtable Tool State table. */
export function fakeAirtable(seed = []) {
  const rows = seed.map((f, i) => ({ id: `recSEED${String(i).padStart(10, '0')}`, fields: { ...f } }));
  const calls = [];
  let n = 0;
  const fetchImpl = async (url, init = {}) => {
    const u = new URL(url); const method = init.method || 'GET';
    calls.push({ method, url: String(url), body: init.body ? JSON.parse(init.body) : null });
    if (method === 'GET') {
      const f = u.searchParams.get('filterByFormula') || '';
      const m = /\{Student Portal ID\}='([^']*)'/.exec(f);
      const hit = rows.filter((r) => (!m || r.fields['Student Portal ID'] === m[1]) && String(r.fields['Tool Name'] || '').startsWith('acelabs.'));
      return new Response(JSON.stringify({ records: hit }), { status: 200 });
    }
    const body = JSON.parse(init.body);
    if (method === 'POST') for (const r of body.records) rows.push({ id: `recNEW${String(n++).padStart(11, '0')}`, fields: { ...r.fields } });
    if (method === 'PATCH') for (const r of body.records) { const cur = rows.find((x) => x.id === r.id); if (cur) Object.assign(cur.fields, r.fields); }
    return new Response(JSON.stringify({ records: [] }), { status: 200 });
  };
  return { rows, calls, fetchImpl };
}
