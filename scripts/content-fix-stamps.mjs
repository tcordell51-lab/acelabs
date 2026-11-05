#!/usr/bin/env node
// CONTENT-FIX stamps: verify (default) or re-hash (--write) content/approvals/stamps/CONTENT-FIX.json.
//
// A stamp counts only while its sha256 equals the file it covers (build spec rule 1.9).
//   node scripts/content-fix-stamps.mjs           verify every correction, override, loader and held item
//   node scripts/content-fix-stamps.mjs --write   re-hash corrections and loaders, rebuild override entries
//                                                 from content/explainers/why-overrides.json, then verify
// Exit 1 on any mismatch. Never touches the bank: it only reads tools/mock/data/full-mocks.js.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const STAMPS = 'content/approvals/stamps/CONTENT-FIX.json';
const OVERRIDES = 'content/explainers/why-overrides.json';
const DISPUTES = 'docs/explainers/key-disputes.json';
const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');
const read = (rel) => fs.readFileSync(path.join(ROOT, rel));
const readJson = (rel) => JSON.parse(read(rel).toString('utf8'));

function bankWhys(bankRel) {
  const ctx = { window: {} }; vm.createContext(ctx); vm.runInContext(read(bankRel).toString('utf8'), ctx);
  const out = {};
  for (const m of ctx.window.ACE_FULL_MOCKS.mocks) for (const arr of Object.values(m.sections)) {
    if (Array.isArray(arr)) for (const it of arr) out[it.id] = it.why;
  }
  return out;
}

// keep the stamp's own change note (some name the exact sentence removed), add the revision once
function changeOf(p, o) {
  const c = (p && p.change) || o.change;
  return o.revised && !c.includes(o.revised) ? c + '; ' + o.revised : c;
}

function write() {
  const st = readJson(STAMPS);
  const ov = readJson(OVERRIDES);
  const fileSha = sha(read(OVERRIDES));
  for (const c of st.corrections) for (const f of Object.keys(c.files)) c.files[f] = sha(read(f));
  for (const f of Object.keys(st.loader)) st.loader[f] = sha(read(f));
  st.bank.sha256 = sha(read(st.bank.file));
  const prev = Object.fromEntries([...(st.overrides || []), ...(st.held || [])].map((e) => [e.id, e]));
  const template = { stamp: st.stamp, pullable: false, note: 'Correction of a known error (stale option letters): listed with a comment box, no Pull.' };
  st.overrides = []; st.held = [];
  for (const [id, o] of Object.entries(ov.overrides)) {
    const base = { id, kind: 'override', ...template, ...(prev[id] ? { note: prev[id].note || template.note } : {}),
      served: o.served, file: OVERRIDES, fileSha256: fileSha, whySha256: sha(o.why), bankWhySha256: o.bankWhySha256,
      change: changeOf(prev[id], o) };
    if (o.held) { delete base.stamp; base.held = o.held; st.held.push(base); } else st.overrides.push(base);
  }
  st.written = new Date().toISOString().slice(0, 10);
  fs.writeFileSync(path.join(ROOT, STAMPS), JSON.stringify(st, null, 1) + '\n');
}

function verify() {
  const st = readJson(STAMPS);
  const ov = readJson(OVERRIDES);
  const kd = readJson(DISPUTES);
  const bad = [];
  let n = 0;
  const check = (what, want, got) => { n++; if (want !== got) bad.push(what + ': stamp ' + want + ' != file ' + got); };
  const bankSha = sha(read(st.bank.file));
  check('bank ' + st.bank.file, st.bank.sha256, bankSha);
  check('overrides doc bank sha', ov.bank.sha256, bankSha);
  for (const [f, h] of Object.entries(st.loader)) check('loader ' + f, h, sha(read(f)));
  for (const c of st.corrections) {
    if (c.stamp !== st.stamp) bad.push(c.id + ': stamp text');
    for (const [f, h] of Object.entries(c.files)) check(c.id + ' ' + f, h, sha(read(f)));
  }
  const whys = bankWhys(st.bank.file);
  const fileSha = sha(read(OVERRIDES));
  const listed = new Set();
  for (const e of st.overrides) {
    listed.add(e.id);
    const o = ov.overrides[e.id];
    if (!o) { bad.push(e.id + ': stamped but not in ' + OVERRIDES); continue; }
    if (o.held) bad.push(e.id + ': held in ' + OVERRIDES + ' but stamped');
    if (e.stamp !== st.stamp) bad.push(e.id + ': stamp text');
    check(e.id + ' file', e.fileSha256, fileSha);
    check(e.id + ' why', e.whySha256, sha(o.why));
    check(e.id + ' bank why', e.bankWhySha256, sha(whys[e.id.slice(3)] ?? ''));
  }
  const openIds = new Set((kd.open || []).filter((d) => d.status === 'open').map((d) => d.qid));
  for (const e of st.held || []) {
    listed.add(e.id);
    if (e.stamp) bad.push(e.id + ': held item carries a stamp');
    if (!ov.overrides[e.id] || !ov.overrides[e.id].held) bad.push(e.id + ': listed held but the override is not held');
    if (!openIds.has(e.id)) bad.push(e.id + ': held with no open key dispute');
  }
  for (const id of Object.keys(ov.overrides)) if (!listed.has(id)) bad.push(id + ': override with no stamp entry');
  for (const id of openIds) if (ov.overrides[id] && !ov.overrides[id].held) bad.push(id + ': open key dispute, override not held');
  if (bad.length) { console.error('content-fix-stamps: ' + bad.length + ' problem(s)\n  ' + bad.join('\n  ')); process.exit(1); }
  console.log('content-fix-stamps: OK (' + n + ' checksums; ' + st.corrections.length + ' corrections, ' + st.overrides.length + ' overrides stamped, ' + (st.held || []).length + ' held)');
}

if (process.argv.includes('--write')) write();
verify();
