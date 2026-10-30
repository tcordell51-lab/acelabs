#!/usr/bin/env node
// scripts/explainers/build.mjs: build and gate the question explainers.
//
//   node scripts/explainers/build.mjs            build every batch, write the outputs
//   node scripts/explainers/build.mjs --check    run every gate and compare the outputs on
//                                                disk with what the build would write; write
//                                                nothing; exit 1 on any issue or stale file
//   add a batch id (pilot/pilot) to print only that batch's report
//
// A port of the pilot build (question-system/pilot-scripts/build-pilot.js) to
// the repo. Reads the authoring sources content/explainers-src/<group>/<batch>.js
// and the banks (read only; banks, keys and their own explanations are never
// edited here), runs the build gates of explainer-standard.md 7.1, and writes:
//
//   content/explainers/<section>/<sub>/<qid>.json   student sidecars (published)
//   content/explainers/index-<section>.json        qid and active aliases -> file, status, checksum
//   content/explainers/index.json                  the section index files and families.json
//   content/explainers/families.json               trap family names (the closed list)
//   content/videos/index.json                      video slot -> questions (ids kept as set)
//   docs/explainers/coach/<qid>.json               coach records: flags, review, routing, gate,
//                                                  alias status, served question copy (never published)
//   docs/explainers/passages/<id>.json             RC passages the coach records point to
//   docs/explainers/index.json                     coach index (batches, flags, status)
//   docs/explainers/gate-report.json               build gate results with sidecar checksums
//   docs/explainers/gap-list.json                  planned items without an explainer
//   tools/explain/vendor/                          build-made copies of repo drawing code
//
// Inputs it reads but never writes: docs/explainers/key-disputes.json,
// picture-disputes.json (an open dispute holds that item's explainer) and
// approvals.json (Thomas's approval stamps; a stamp counts only while its
// checksum matches the sidecar).
//
// Gates (a failure keeps that record out of content/ and exits 1): bank guard
// by key text, stem hash and choice texts; aliases (key, choices, premises);
// copy rules on every string, visual spec included; trap families from the
// closed list (PAT families equal the engine tag); recomputation of the
// pictures (trend values, titration marks on the charge-balance curve, Law of
// Cosines, Bayes trees, part over whole, Lewis ledgers, PAT answers and slip
// counts, RC quotes and proof lines); RDKit: every SMILES parses, CIP labels,
// stereo relations and the relation words in notes (scripts/explainers/rdkit-check.py,
// needs python3 with RDKit); stem-style hits need a flag; play-with targets
// exist and promise only what they hold, and any timer or score on a target is
// acknowledged; visual types have a renderer; size budgets; no coach data in
// published files, and /docs/* and /content/explainers-src/* stay
// force-redirected.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import os from 'node:os';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../..');
const ARGS = process.argv.slice(2);
const CHECK = ARGS.includes('--check');
const ONLY = ARGS.filter((a) => !a.startsWith('--'));

const SRC_DIR = 'content/explainers-src';
const OUT = 'content/explainers';
const DOCS = 'docs/explainers';
const VENDOR = 'tools/explain/vendor';
const VIDEOS = 'content/videos/index.json';
const PLAN = 'docs/release-2026-10-30/questions/batches.json';
const SECTIONS = ['bio', 'gc', 'ochem', 'qr', 'pat', 'rc'];
const SUBTOPIC_PREFIX = { bio: 'bio', gc: 'gc', ochem: 'oc', qr: 'qr', pat: 'pat', rc: 'rc' };
const COACH_KEYS = new Set(['flags', 'review', 'routing', 'gate', 'changes', 'served', 'preview', 'demoPick', 'heldBecause', 'reviewed', 'relationNote']);
const BUDGET = { spec: 4096, sidecar: 6144 };
// IR landmark windows (cm-1) a chem.spectrum band must sit in, by group: the ranges DAT texts
// teach (free O-H sharp near 3600; O-H held by an intramolecular H-bond, as in salicylaldehyde,
// broad and low; triple bonds near 2100 to 2260)
const IR_WINDOWS = { 'O-H free': [3580, 3650], 'O-H H-bonded': [3200, 3550], 'O-H chelated': [2800, 3250], 'O-H acid': [2500, 3300], 'N-H': [3300, 3500], 'C-H sp3': [2850, 3000], 'C-H sp2': [3000, 3100], 'C-H sp': [3260, 3330], 'C triple N': [2210, 2260], 'C triple C': [2100, 2260], 'triple bonds': [2100, 2260], 'C=O': [1650, 1780], 'C=C': [1600, 1680] };

const { FAMILIES } = require('./families.js');
const { copyIssues, words } = await import('./copy-rules.mjs');
const { CATALOG } = await import(pathToFileURL(path.join(ROOT, 'tools/explain/visuals/catalog.js')).href);
const COMPUTE = await import(pathToFileURL(path.join(ROOT, 'tools/explain/visuals/compute.js')).href);
const BIOC = await import(pathToFileURL(path.join(ROOT, 'tools/explain/visuals/compute-bio.js')).href);
const GCC = await import(pathToFileURL(path.join(ROOT, 'tools/explain/visuals/compute-gc.js')).href);
const QRC = await import(pathToFileURL(path.join(ROOT, 'tools/explain/visuals/compute-qr.js')).href);

/* ------------------------------------------------------------------ helpers */
const rd = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const exists = (rel) => fs.existsSync(path.join(ROOT, rel));
const sha = (s) => crypto.createHash('sha256').update(s).digest('hex').slice(0, 16);
const sha1 = (s) => crypto.createHash('sha1').update(s).digest('hex');
const clone = (o) => JSON.parse(JSON.stringify(o));
const json = (o) => JSON.stringify(o, null, 1) + '\n';
function win(rel) {
  const ctx = { window: {}, console: { log() {}, warn() {} } };
  ctx.self = ctx.window; ctx.globalThis = ctx; ctx.module = { exports: {} }; ctx.exports = ctx.module.exports;
  vm.createContext(ctx); vm.runInContext(rd(rel), ctx, { filename: rel }); return ctx;
}
function extractArray(src, marker) {      // const NAME = [ ... ];  bracket match, strings aware
  const i = src.indexOf(marker); if (i < 0) throw new Error('marker ' + marker);
  const j = src.indexOf('[', i); let depth = 0, q = null;
  for (let k = j; k < src.length; k++) {
    const c = src[k];
    if (q) { if (c === '\\') { k++; continue; } if (c === q) q = null; continue; }
    if (c === '"' || c === "'" || c === '`') { q = c; continue; }
    if (c === '/' && src[k + 1] === '/') { k = src.indexOf('\n', k); continue; }
    if (c === '[') depth++; else if (c === ']') { depth--; if (!depth) return vm.runInNewContext('(' + src.slice(j, k + 1) + ')'); }
  }
  throw new Error('unbalanced ' + marker);
}
const outputs = new Map();          // repo-relative path -> file text
const emit = (rel, v) => outputs.set(rel, typeof v === 'string' ? v : json(v));
const readJson = (rel, fallback) => { try { return JSON.parse(rd(rel)); } catch (e) { return fallback; } };

/* ------------------------------------------------------------ banks (read only) */
const repoFiles = {};
function note(rel) { repoFiles[rel] = sha(rd(rel)); }
const FM = win('tools/mock/data/full-mocks.js').window.ACE_FULL_MOCKS; note('tools/mock/data/full-mocks.js');
const MT = win('tools/minitests/bank.js').window.MINITEST_BANK; note('tools/minitests/bank.js');
const PM = win('shared/dat-mock-tests.js').window.DAT_MOCK_TESTS; note('shared/dat-mock-tests.js');
const RC = win('tools/rc/data/bank.js').window.ACE_RC_BANK; note('tools/rc/data/bank.js');
const QRF = win('shared/qr-formats-bank.js').window.QR_FORMATS_DATA; note('shared/qr-formats-bank.js');
const POOL = JSON.parse(rd('scripts/dat-mock-bank.json')); note('scripts/dat-mock-bank.json');
const GAMES = {};
for (const g of ['qr', 'bio', 'gchem']) { GAMES[g] = JSON.parse(rd('games/' + g + '.json')); note('games/' + g + '.json'); }
const QRE = extractArray(rd('tools/qr/index.html'), 'const BANK = ['); note('tools/qr/index.html');
const TRENDS = JSON.parse(rd('tools/gc/trends-data.json')); note('tools/gc/trends-data.json');
globalThis.self = undefined;
const PAT_FILES = ['pat-core.js', 'pat-solid.js', 'pat-keyholes.js', 'pat-keyholes-csg.js', 'pat-tfe.js', 'pat-tfe-csg.js', 'pat-angles.js', 'pat-holepunch.js', 'pat-cubes.js', 'pat-patternfold.js', 'pat-patternfold-poly.js', 'pat-test.js'];
PAT_FILES.forEach((f) => { require(path.join(ROOT, 'tools/pat/engine', f)); note('tools/pat/engine/' + f); });
const PAT = globalThis.PAT;
const PAT_TESTS = {};
const patTest = (id) => PAT_TESTS[id] || (PAT_TESTS[id] = PAT.test.build(id));
// an ES module with no imports; loaded from its text so node does not warn about the repo's missing "type": "module"
const SET2026 = (await import('data:text/javascript;base64,' + Buffer.from(rd('tools/ochem/tree/shared/set-2026.js')).toString('base64'))).SET2026; note('tools/ochem/tree/shared/set-2026.js');

/* ------------------------------------------------------- served item model */
// Every resolver returns { stem, choices: [text], key, why, extra } in served order.
function holesText(h) { return 'holes:' + h.map((p) => p[0] + ',' + p[1]).sort().join('|'); }
function patChoiceText(it, o) {
  if (it.type === 'holepunch') return holesText(o.holes);
  if (it.type === 'cubes') return o.count + ' cube' + (o.count > 1 ? 's' : '');
  return o.text;
}
function resolve(qid) {
  const [bank, ...rest] = qid.split(':');
  if (bank === 'fm') {
    const id = rest.join(':');
    for (const m of FM.mocks) for (const [sec, arr] of Object.entries(m.sections)) {
      const i = arr.findIndex((x) => x.id === id);
      if (i >= 0) { const it = arr[i]; return { stem: it.q, choices: it.opts.slice(), key: it.correct, why: it.why, extra: { mock: m.id, section: sec, n: i + 1, qs: it.qs || null, os: !!it.os } }; }
    }
    throw new Error('fm item not found ' + id);
  }
  if (bank === 'pool') {
    const id = rest.join(':');
    for (const [sec, arr] of Object.entries(POOL)) { const it = Array.isArray(arr) && arr.find((x) => x.id === id); if (it) return { stem: it.q, choices: it.opts.slice(), key: it.correct, why: it.why || null, extra: { section: sec, qs: it.q_smiles || null } }; }
    throw new Error('pool item not found ' + id);
  }
  if (bank === 'pm') {
    const [test, sec, n] = rest; const t = PM.find((x) => x.id === test); if (!t) throw new Error('pm test not found ' + test);
    const it = t.sections[sec] && t.sections[sec][+n - 1]; if (!it) throw new Error('pm item not found ' + qid);
    return { stem: it.q, choices: it.opts.slice(), key: it.correct, why: it.why || null, extra: { test, name: t.name, section: sec, n: +n, id: it.id } };
  }
  if (bank === 'games') {
    const [subj, id] = rest; const it = (GAMES[subj] || []).find((x) => x.id === id); if (!it) throw new Error('games item not found ' + qid);
    return { stem: it.q, choices: it.opts.slice(), key: it.correct, why: it.why || null, extra: { file: 'games/' + subj + '.json' } };
  }
  if (bank === 'qre') {
    const it = QRE.find((x) => x.id === rest[0]); if (!it) throw new Error('qre item not found ' + qid);
    return { stem: it.q, choices: it.opts.slice(), key: it.correct, why: it.why || null, extra: { skills: it.skills } };
  }
  if (bank === 'qrf') {
    const it = QRF.items.find((x) => x.id === rest[0]); if (!it) throw new Error('qrf item not found ' + qid);
    const opts = it.opts || QRF.choices[it.format];
    return { stem: it.stem, choices: opts.slice(), key: it.correct, why: it.why, extra: { format: it.format, figure: it.figure || null, move: it.move, diag: it.diag || null } };
  }
  if (bank === 'climb') {
    const m = /^t(\d+)$/.exec(rest[0]), n = /^q(\d+)$/.exec(rest[1] || '');
    if (!m || !n) throw new Error('climb qid shape is climb:t<test>:q<question>: ' + qid);
    const t = MT.tests[+m[1] - 1], it = t && t.questions[+n[1] - 1]; if (!it) throw new Error('climb item not found ' + qid);
    return { stem: it.stem, choices: it.choices.slice(), key: it.correct, why: it.explanation, extra: { test: t.n, tier: t.tier, figureSvg: it.figureSvg || null } };
  }
  if (bank === 'rc') {
    for (const P of Object.values(RC.passages)) {
      const it = P.questions.find((x) => x.id === rest[0]);
      if (it) return { stem: it.stem, choices: it.choices.slice(), key: it.key, why: it.why, extra: { passage: { id: P.id, title: P.title, paragraphs: P.paragraphs }, type: it.type, proof: it.proof, distractorNotes: it.distractorNotes } };
    }
    throw new Error('rc item not found ' + rest[0]);
  }
  if (bank === 'pat') {
    const [test, n] = rest; const it = patTest(test).items[+n - 1]; if (!it) throw new Error('pat item not found ' + qid);
    return { stem: it.prompt, choices: it.options.map((o) => patChoiceText(it, o)), key: it.answer, why: null, extra: { item: clone(it), test } };
  }
  throw new Error('unknown bank ' + bank);
}
const norm = (s) => String(s).replace(/\s+/g, ' ').trim();
const stemHash = (r) => sha1(norm(r.stem) + '\n' + r.choices.map(norm).sort().join('\n'));

/* -------------------------------------------------------------- copy rules */
// Step 1 opens with the move: an imperative verb from this list, or "Here is" (standard 2.3).
const OPEN_VERBS = /^(Here is|Read|Count|Start|Find|Name|Put|Work|Turn|Know|Protonate|Write|Look|Set|Undo|Draw|Rank|Add|Check|Trace|Spot|Flip|Split|Picture|Plug|List|Match|Locate|Chase|Join|Mark|Sort|Compare|Begin|Cross|Unfold|Open|Estimate|Convert|Balance|Identify|Assign|Follow|Ask|Use)\b/;
const sentences = (s) => String(s).split(/(?<=[.?])\s+(?=[A-Z0-9])/).filter(Boolean).length;
const contentWords = (s) => new Set(String(s).toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').split(/\s+/).filter((w) => w.length > 3).map((w) => w.slice(0, 5)));
// Stem-style heuristics (the DAT look). A hit requires a stem-style flag; the rewording is suggested, never applied.
function stemStyleHits(stem, section, nChoices) {
  const hits = [], w = words(stem);
  if (section !== 'pat' && section !== 'rc' && w < 8) hits.push('shorthand stem (' + w + ' words)');
  if (/\|/.test(stem) || /=\s*\?/.test(stem)) hits.push('notation shorthand (| or = ?)');
  if (/[A-Za-z]_[A-Za-z0-9]/.test(stem)) hits.push('raw underscore subscript');
  if (section !== 'pat' && /\b(?!EXCEPT\b|NOT\b|LEAST\b|MOST\b|CANNOT\b)[A-Z]{5,}\b/.test(stem.replace(/\b[A-Z][A-Z0-9]*[0-9][A-Z0-9]*\b/g, ''))) hits.push('capitalized emphasis word');
  if (/well-known|remember that|recall that|note that|exactly half/i.test(stem)) hits.push('hint or principle stated in the stem');
  if (section !== 'pat' && nChoices !== 5) hits.push(nChoices + ' choices (DAT items have 5)');
  return hits;
}
// play-with target scan: the page and its local scripts; timers, clocks and scores on it
const TARGET_MARKERS = [['timer', /startTimer|aim [0-9]+s|countdown|Time remaining/], ['clock', /elapsed/], ['pace bar', /paceFill|pace-bar|paceBar/], ['score headline', /of [0-9]+ correct|' correct'|% correct/], ['streak', /STREAK\b|streak(Count|Days|N)\b|class="streak/]];
function scanTarget(href) {
  const rel = href.replace(/[?#].*$/, '').replace(/\/$/, '/index.html');
  const full = path.join(ROOT, rel);
  if (!full.startsWith(ROOT + path.sep) || !fs.existsSync(full)) return { missing: true, rel };
  let src = fs.readFileSync(full, 'utf8');
  const dir = path.dirname(full);
  (src.match(/<script[^>]+src="([^"]+)"/g) || []).forEach((tag) => { const m = /src="([^"]+)"/.exec(tag)[1]; if (/^(https?:)?\/\//.test(m)) return; const clean = m.replace(/[?#].*$/, ''); const f = clean.startsWith('/') ? path.join(ROOT, clean) : path.resolve(dir, clean); if (f.startsWith(ROOT) && fs.existsSync(f)) src += '\n' + fs.readFileSync(f, 'utf8'); });
  const markers = TARGET_MARKERS.filter(([, re]) => re.test(src)).map(([n]) => n);
  return { rel, src, markers };
}

/* -------------------------------------------------------------- sources */
function listSources() {
  const out = [];
  const dir = path.join(ROOT, SRC_DIR);
  if (!fs.existsSync(dir)) return out;
  for (const g of fs.readdirSync(dir).sort()) {
    const gd = path.join(dir, g); if (!fs.statSync(gd).isDirectory()) continue;
    for (const f of fs.readdirSync(gd).sort()) if (f.endsWith('.js')) out.push(path.join(SRC_DIR, g, f));
  }
  return out;
}
const SOURCES = listSources().map((rel) => {
  const mod = require(path.join(ROOT, rel));
  const id = rel.slice(SRC_DIR.length + 1).replace(/\.js$/, '');
  const src = Array.isArray(mod) ? { entries: mod } : mod;
  if (!Array.isArray(src.entries)) throw new Error(rel + ': exports no entries array');
  const [group, batch] = id.split('/');
  if (src.group && src.group !== group) throw new Error(rel + ': group ' + src.group + ' does not match its folder ' + group);
  if (src.batch && src.batch !== batch) throw new Error(rel + ': batch ' + src.batch + ' does not match its file name ' + batch);
  return { rel, id, group, batch, title: src.title || id, entries: src.entries, changes: src.changes || {} };
});

/* -------------------------------------------- disputes and approval stamps */
const KEY_DISPUTES = readJson(DOCS + '/key-disputes.json', { schema: 'ace.key-disputes/1', open: [], resolved: [] });
const PICTURE_DISPUTES = readJson(DOCS + '/picture-disputes.json', { fullMocks: [] });
const APPROVALS = readJson(DOCS + '/approvals.json', { schema: 'ace.explainer-approvals/1', approvals: {} });
const openKeyDispute = (qid) => (KEY_DISPUTES.open || []).find((d) => d.qid === qid && d.status !== 'resolved');
const openPictureDispute = (qid) => [...(PICTURE_DISPUTES.fullMocks || []), ...(PICTURE_DISPUTES.other || [])].find((d) => d.qid === qid && d.status === 'open');

/* ------------------------------------------------------------ the entries */
const RD_JOBS = [];   // { R, job, then(result) }
const rdkit = (R, job, then) => RD_JOBS.push({ R, job, then });
const seen = new Map();
const RECORDS = [];
for (const S of SOURCES) for (const e of S.entries) RECORDS.push(buildEntry(S, e));

function buildEntry(S, e) {
  const R = { S, e, qid: e.qid, pid: e.pid || e.qid, issues: [], warns: [], checks: [], facts: {} };
  const { issues, warns, checks } = R;
  for (const k of ['qid', 'section', 'subtopic', 'difficulty', 'source', 'keyText', 'answer', 'steps', 'choices', 'lockIt', 'playWith', 'video', 'visual']) if (e[k] == null) issues.push('missing field ' + k);
  if (issues.length) return R;
  if (seen.has(e.qid)) issues.push('qid also written in ' + seen.get(e.qid)); else seen.set(e.qid, S.id);
  if (!SECTIONS.includes(e.section)) issues.push('section ' + e.section + ' is not one of ' + SECTIONS.join(', '));
  if (!String(e.subtopic).startsWith(SUBTOPIC_PREFIX[e.section] + '.')) issues.push('subtopic ' + e.subtopic + ' does not start with ' + SUBTOPIC_PREFIX[e.section] + '.');
  let served;
  try { served = resolve(e.qid); } catch (err) { issues.push('bank: ' + err.message); return R; }
  R.served = served;
  const keyServed = served.choices[served.key];

  // 1. the guard: key text, every choice, one note each
  if (keyServed !== e.keyText) issues.push('key text differs: bank "' + keyServed + '" vs source "' + e.keyText + '"');
  else checks.push('key text matches the bank (' + JSON.stringify(keyServed) + ', index ' + served.key + ')');
  const byText = {};
  e.choices.forEach((c) => { if (byText[c.text]) issues.push('duplicate choice note ' + c.text); byText[c.text] = c; });
  served.choices.forEach((t) => { if (!byText[t]) issues.push('served choice has no note: ' + t); });
  e.choices.forEach((c) => { if (!served.choices.includes(c.text)) issues.push('note for a choice the bank does not have: ' + c.text); });
  const missType = {};
  e.choices.forEach((c) => {
    if (!['key', 'trap', 'stated'].includes(c.role)) { issues.push('choice "' + c.text.slice(0, 30) + '" has role ' + c.role + ' (key, trap or stated)'); return; }
    if (c.role === 'key') { if (c.family) issues.push('key choice carries a family'); return; }
    const f = FAMILIES[c.family];
    if (!f) { issues.push('choice "' + c.text.slice(0, 30) + '" has no family from the closed list (' + c.family + ')'); return; }
    missType[c.text] = f.missType;
    if (c.role === 'stated' && c.family !== 'rc-stated') issues.push('stated choice must use family rc-stated');
    if (c.role !== 'stated' && c.family === 'rc-stated') issues.push('rc-stated is only for stated choices');
    if (e.section === 'pat') {
      const it = served.extra.item, idx = served.choices.indexOf(c.text), tag = it.options[idx] && it.options[idx].trap;
      if (tag && c.family !== 'pat:' + it.type + ':' + tag) issues.push('PAT family must equal the engine tag pat:' + it.type + ':' + tag + ' for "' + c.text.slice(0, 30) + '"');
    }
  });
  checks.push('trap families from the closed list: ' + e.choices.filter((c) => c.family).map((c) => c.family).join(', '));
  const keys = e.choices.filter((c) => c.role === 'key');
  if (keys.length !== 1 || keys[0].text !== e.keyText) issues.push('exactly one key note must match keyText');
  else checks.push('every served choice (' + served.choices.length + ') has a note; one key');

  // 2. premises and aliases
  (e.premises || []).forEach((p) => { if (!served.stem.includes(p)) issues.push('premise "' + p + '" not in the served stem'); });
  if ((e.premises || []).length) checks.push('premises in the served stem: ' + e.premises.join(', '));
  R.aliases = (e.servesAlso || []).map((a0) => {
    const al = Object.assign({}, a0);
    let r; try { r = resolve(al.qid); } catch (err) { issues.push('alias ' + al.qid + ': ' + err.message); al.status = 'held'; al.heldBecause = err.message; return al; }
    const missingPrem = (e.premises || []).filter((p) => !r.stem.includes(p));
    const k = r.choices[r.key];
    const miss = r.choices.filter((t) => !byText[t]);
    if (k !== e.keyText) issues.push('alias ' + al.qid + ' key "' + k + '" differs');
    if (miss.length) issues.push('alias ' + al.qid + ' choices without notes: ' + miss.join(', '));
    if (missingPrem.length) {
      al.status = 'held'; al.heldBecause = 'alias stem omits ' + missingPrem.join(', ');
      if (!(e.flags || []).some((f) => f.text.includes(al.qid))) issues.push('alias ' + al.qid + ' omits premises (' + missingPrem.join(', ') + ') and no flag names it');
      else checks.push('alias ' + al.qid + ' held: its stem omits ' + missingPrem.join(', '));
    } else if (k !== e.keyText || miss.length) { al.status = 'held'; al.heldBecause = k !== e.keyText ? 'alias key differs' : 'alias choices without notes'; }
    else al.status = al.reviewed ? 'active' : 'needs-approval';
    if (k === e.keyText && !miss.length) checks.push('alias ' + al.qid + ': key matches, all ' + r.choices.length + ' choices covered' + (al.reviewed ? '' : ' (stem differs; needs Thomas to approve the alias)'));
    al.guard = { keyText: k, stemHash: stemHash(r) };
    return al;
  });

  // 3. copy rules (bank-sourced answer.text and choices[].text are exempt: they must equal the bank)
  const ci = [];
  ci.push(...copyIssues('answer.line', e.answer.line, 25));
  if (!Array.isArray(e.steps) || e.steps.length < 1 || e.steps.length > 4) ci.push('steps: ' + (e.steps || []).length + ' (1 to 4)');
  e.steps.forEach((s, i) => ci.push(...copyIssues('step ' + (i + 1), s, 40)));
  e.choices.forEach((c) => {
    ci.push(...copyIssues('note "' + c.text.slice(0, 24) + '"', c.note, 35));
    if (!c.note) ci.push('choice "' + c.text.slice(0, 24) + '" has no note');
    if (c.trap) { ci.push(...copyIssues('trap label', c.trap)); if (words(c.trap) < 2 || words(c.trap) > 5) ci.push('trap label must be 2 to 5 words: ' + c.trap); }
    if (c.display) ci.push(...copyIssues('choice display', c.display));
    if (((served.extra && served.extra.os) || /^holes:/.test(c.text)) && !c.display) ci.push('structure or figure choice needs a display name: ' + c.text);
  });
  ci.push(...copyIssues('lockIt', e.lockIt, 20));
  ci.push(...copyIssues('hook', e.hook, 12));
  if (e.hook) { const lk = contentWords(e.lockIt), hk = [...contentWords(e.hook)]; const ov = hk.filter((w) => lk.has(w)).length / Math.max(1, hk.length); if (ov >= 0.6) warns.push('hook repeats Lock it in (' + Math.round(ov * 100) + ' percent shared words); keep it only if it adds a new handle'); }
  if (e.video.slot !== e.subtopic) ci.push('video.slot ' + e.video.slot + ' must equal the subtopic ' + e.subtopic);
  ci.push(...copyIssues('playWith.label', e.playWith.label));
  ci.push(...copyIssues('video.title', e.video.title));
  ci.push(...copyIssues('visual.alt', e.visual.alt, 60));
  if (e.visual.alt && sentences(e.visual.alt) > 3) ci.push('visual.alt: ' + sentences(e.visual.alt) + ' sentences (1 to 3)');
  ci.push(...copyIssues('visual.caption', e.visual.caption, 25));
  // every other string in the visual spec that reaches the student
  const SKIP = new Set(['quote', 'smi', 'choice', 'reuse', 'dataRef', 'verify', 'type', 'diagram', 'view', 'kind', 'property', 'at', 'ref', 'file', 'id', 'field', 'focus', 'alt', 'caption', 'formula', 'solveFor', 'figureRef', 'passage', 'centralAtom', 'atomA', 'atomB', 'electronGeometry', 'molecularGeometry', 'atom', 'cellType', 'unit', 'smallTextKnown', 'stepper']);
  (function walk(o, k) {
    if (typeof o === 'string') { if (!SKIP.has(k)) ci.push(...copyIssues('visual.' + k, o)); if ((k === 'tag' || k === 'from' || k === 'to') && /^[A-E]$/.test(o)) ci.push('visual.' + k + ' is a letter (' + o + '); spec tags use numbers, since letters belong to the served choices'); return; }
    if (Array.isArray(o)) { o.forEach((x) => walk(x, k)); return; }
    if (o && typeof o === 'object') for (const [kk, v] of Object.entries(o)) walk(v, kk);
  })(e.visual, 'visual');
  if (ci.length) issues.push(...ci); else checks.push('copy rules: ASCII, no dashes, no banned words, no letters, no competitor names, no timer or score words, budgets (explainer and visual text)');
  if (!OPEN_VERBS.test(e.steps[0] || '')) issues.push('step 1 does not open with a move (a verb from the list, or Here is): ' + String(e.steps[0]).slice(0, 40));
  else checks.push('step 1 opens with a move: "' + e.steps[0].split(/\s+/).slice(0, 2).join(' ') + '"');
  const sents = [e.answer.line, ...e.steps, e.lockIt].join(' ').split(/(?<=[.?])\s+/);
  const lens = sents.map(words);
  if (!lens.some((n) => n <= 6)) warns.push('voice: no short line (6 words or fewer)');
  checks.push('voice: ' + sents.length + ' sentences, mean ' + (lens.reduce((a, b) => a + b, 0) / lens.length).toFixed(1) + ' words, shortest ' + Math.min(...lens));

  // 4. stem style, flags, disputes
  const flags = e.flags || [];
  const sh = stemStyleHits(served.stem, e.section, served.choices.length);
  if (sh.length && !flags.some((f) => f.kind === 'stem-style')) issues.push('stem-style hits with no stem-style flag: ' + sh.join('; '));
  else if (sh.length) checks.push('stem-style hits, flagged for Thomas (not applied): ' + sh.join('; '));
  flags.forEach((f) => { if (!f || !f.kind || !f.text) issues.push('a flag needs kind and text'); });
  const kd = openKeyDispute(e.qid), pd = openPictureDispute(e.qid);
  if (flags.some((f) => f.kind === 'key-dispute') && !kd) issues.push('key-dispute flag with no open entry in ' + DOCS + '/key-disputes.json');
  if (kd) { R.held = 'key dispute open (' + DOCS + '/key-disputes.json): the explainer is held until Thomas rules'; if (!flags.some((f) => f.kind === 'key-dispute')) issues.push('open key dispute needs a key-dispute flag in the source'); }
  if (pd) { R.held = (R.held ? R.held + '; ' : '') + 'picture dispute open (' + DOCS + '/picture-disputes.json)'; if (!flags.some((f) => f.kind === 'picture-dispute')) issues.push('open picture dispute needs a picture-dispute flag in the source'); }

  // 5. play-with target
  const tg = scanTarget(e.playWith.href);
  if (tg.missing) issues.push('playWith target missing: ' + tg.rel);
  else {
    (e.playWith.expect || []).forEach((x) => { if (!tg.src.includes(x)) issues.push('playWith target ' + tg.rel + ' lacks "' + x + '" (the label promises it)'); });
    if (tg.markers.length && !flags.some((f) => /play-target|timer/.test(f.kind)) && !/clock|timer|timed/i.test(e.playWith.routing || '')) issues.push('playWith target ' + tg.rel + ' shows ' + tg.markers.join(', ') + ' and nothing says so');
    checks.push('playWith target ' + tg.rel + ' found' + ((e.playWith.expect || []).length ? ' with ' + e.playWith.expect.join(', ') : '') + (tg.markers.length ? '; markers acknowledged: ' + tg.markers.join(', ') : '; no timer or score markers'));
  }

  // 6. the visual: catalog, sizes, recomputation
  const vis = e.visual;
  if (!vis.alt || !vis.caption) issues.push('visual needs alt and caption');
  const panels = vis.type === 'stack' ? (vis.panels || []) : [vis];
  if (vis.type === 'stack' && (panels.length < 1 || panels.length > 2)) issues.push('stack holds ' + panels.length + ' panels (1 or 2)');
  const specBytes = Buffer.byteLength(JSON.stringify(vis));
  if (specBytes > BUDGET.spec) issues.push('visual spec is ' + specBytes + ' bytes (budget ' + BUDGET.spec + ')');
  R.facts = panels.map(() => ({}));
  panels.forEach((p, pi) => {
    const cat = CATALOG[p.type];
    if (!cat) { issues.push('visual type ' + p.type + ' is not in the catalog (tools/explain/visuals/catalog.js)'); return; }
    if (p.type === 'stack') { issues.push('a stack panel may not hold another stack'); return; }
    if (!cat.built) { issues.push('renderer-gap: no renderer for ' + p.type + ' yet'); return; }
    (cat.required || []).forEach((f) => { if (p[f] == null) issues.push(p.type + ' needs ' + f); });
    for (const [f, ok] of Object.entries(cat.variants || {})) if (p[f] != null && !ok.includes(p[f])) issues.push('renderer-gap: ' + p.type + ' has no ' + f + ' "' + p[f] + '" yet (built: ' + ok.join(', ') + ')');
    if (cat.trueToLife && !flags.some((f) => f.kind === 'true-to-life')) issues.push(p.type + ' is a true-to-life view: add a true-to-life flag so Thomas signs it off');
    if (p.smallTextKnown && !flags.some((f) => f.kind === 'renderer-gap')) issues.push('smallTextKnown needs a renderer-gap flag that names the fix');
    recompute(R, p, R.facts[pi]);
  });
  if (served.extra && served.extra.qs) rdkit(R, { smi: served.extra.qs }, (r) => { if (!r.ok) issues.push('RDKit cannot parse the stem SMILES ' + served.extra.qs); });
  if (served.extra && served.extra.os) served.choices.forEach((s) => rdkit(R, { smi: s }, (r) => { if (!r.ok) issues.push('RDKit cannot parse the choice SMILES ' + s); }));
  // structure choices: a relation field is checked by RDKit against the key, and a relation
  // word in a note must match the field (label-style stereo choices are checked under chem.molecule)
  if (served.extra && served.extra.os) e.choices.forEach((c) => {
    ['enantiomer', 'diastereomer'].filter((w) => new RegExp('\\b' + w).test(c.note) && !new RegExp('not (the |an? )?' + w).test(c.note)).forEach((w) => { if (w !== c.relation) issues.push('note for ' + c.text + ' says ' + w + ' but the relation field is ' + (c.relation || 'missing')); });
    if (c.relation) rdkit(R, { rel: [e.keyText, c.text] }, (r) => {
      if (!r.ok) issues.push('RDKit cannot compare ' + c.text + ' with the key');
      else if (r.relation !== c.relation) issues.push('RDKit: ' + c.text + ' is ' + r.relation + ' to the key, the relation field says ' + c.relation);
      else checks.push('RDKit stereo relation: ' + c.text + ' = ' + r.relation + ' of the key');
    });
  });
  return R;
}

function recompute(R, p, facts) {
  const { issues, checks, e, served } = R;
  const keyText = e.keyText;
  // the Gen Chem pictures (batch B003 on): the key and every trap route a note claims, chains, ICE tables,
  // gas states and mixtures, phase regions, crossovers, half-lives, cells, level ladders, ions, Lewis domains
  if (p.verify || ['chem.ledger', 'chem.gas', 'chem.cell', 'chem.orbital'].includes(p.type) || (p.type === 'chem.curve' && p.kind !== 'titration') || (p.type === 'chem.energy' && p.kind === 'levels') || (p.type === 'chem.lewis' && p.domains)) {
    const r = GCC.checkPanel(p, keyText, served.choices); issues.push(...r.issues); checks.push(...r.checks);
  }
  // the QR pictures (batch B005 on): the check block (the key and the route behind every trap note,
  // inputs found in the stem), every block the picture draws, and the arithmetic in the explainer's words
  if (['qr.work', 'qr.geometry'].includes(p.type) || (p.type === 'qr.partwhole' && QRC.PARTWHOLE_STYLES.includes(p.style))) {
    const r = QRC.checkPanel(p, keyText, served.choices, { stem: served.stem, texts: [e.answer.line, ...e.steps, ...e.choices.map((c) => c.note), e.lockIt, e.hook] });
    issues.push(...r.issues); checks.push(...r.checks);
  }
  if (p.type === 'chem.trend') {
    const vals = p.series.map((sym) => { const el = TRENDS.elements.find((x) => x.symbol === sym); if (!el || el[p.property] == null) { issues.push('trend: no ' + p.property + ' for ' + sym + ' in trends-data.json'); return { sym, v: null, z: null }; } return { sym, v: el[p.property], z: el.z }; });
    facts.values = vals;
    const v = Object.fromEntries(vals.map((x) => [x.sym, x.v]));
    (p.highlight || []).forEach((s) => { if (!(s in v)) issues.push('trend highlight ' + s + ' not in the series'); });
    (p.dips || []).forEach(([a, b]) => { if (!(v[b] < v[a])) issues.push('trend: no dip ' + a + ' to ' + b + ' in trends-data.json'); });
    if (p.rank) {
      const order = p.rank.map((s) => v[s]);
      if (!order.every((x, i) => i === 0 || x > order[i - 1])) issues.push('trend rank ' + p.rank.join(' < ') + ' is not increasing in trends-data.json');
      else checks.push('trends-data.json: ' + p.rank.map((s) => s + ' ' + v[s]).join(' < ') + (p.dips && p.dips.length ? '; dips ' + p.dips.map((d) => d.join(' to ')).join(', ') + ' present' : ''));
      if (/^[A-Z][a-z]?( < [A-Z][a-z]?)+$/.test(keyText) && keyText.split(' < ').join(',') !== p.rank.join(',')) issues.push('trend rank differs from the key ' + keyText);
    }
    const quoted = [...e.steps.join(' ').matchAll(/\b([A-Z][a-z]?) \((\d{2,5})\)/g)];
    quoted.forEach((m) => { if (m[1] in v && v[m[1]] !== +m[2]) issues.push('step quotes ' + m[1] + ' (' + m[2] + ') but trends-data.json has ' + v[m[1]]); });
    if (quoted.length) checks.push('step values match trends-data.json: ' + quoted.map((m) => m[1] + ' ' + m[2]).join(', '));
  }
  if (p.type === 'chem.curve') {
    if (p.kind !== 'titration') return;
    const marks = COMPUTE.titrationMarks(p);
    marks.forEach((m) => { if (m.choice != null && Math.abs(m.pH - parseFloat(m.choice)) > 0.015) issues.push('titration mark ' + m.at + ' computes ' + m.pH + ', choice ' + m.choice); if (m.choice != null && !served.choices.includes(m.choice)) issues.push('titration mark choice ' + m.choice + ' is not a served choice'); });
    const keyMarks = marks.filter((m) => m.key);
    if (keyMarks.length !== 1 || keyMarks[0].choice !== keyText) issues.push('titration: exactly one mark is the key, and it carries the key text');
    facts.marks = marks.map((m) => ({ vb: m.vb, pH: m.pH }));
    checks.push('titration computed by charge balance: ' + marks.map((m) => m.at + ' ' + m.pH.toFixed(2)).join(', ') + ' (equivalence at ' + COMPUTE.equivalenceMl(p) + ' mL)');
  }
  if (p.type === 'qr.figure') {
    const fig = served.extra && served.extra.figure;
    if (!fig) { issues.push('qr.figure: the served question has no figure'); return; }
    (p.highlight || []).forEach((h) => { if (!(fig.categories || []).includes(h)) issues.push('qr.figure highlight not a category: ' + h); });
  }
  if (p.type === 'qr.partwhole' && !QRC.PARTWHOLE_STYLES.includes(p.style)) {
    const miss = ['total', 'parts', 'rest'].filter((f) => p[f] == null);
    if (miss.length) { issues.push('qr.partwhole ' + (p.style || 'grid') + ' needs ' + miss.join(', ')); return; }
    const part = p.parts.reduce((a, b) => a + b.n, 0);
    if (part + p.rest.n !== p.total) issues.push('partwhole parts and rest do not add to the total');
    const fig = served.extra && served.extra.figure;
    if (fig && fig.series && fig.series.length === 1) {
      const vals = fig.series[0].values, cats = fig.categories, total = vals.reduce((a, b) => a + b, 0);
      if (total !== p.total) issues.push('partwhole total ' + p.total + ' vs chart ' + total);
      p.parts.forEach((pt) => { const i = cats.indexOf(pt.label); if (i < 0) issues.push('partwhole part ' + pt.label + ' is not a chart category'); else if (vals[i] !== pt.n) issues.push('partwhole part ' + pt.label + ' is ' + pt.n + ', the chart shows ' + vals[i]); });
    }
    if (/%$/.test(keyText)) {
      if (Math.round(100 * part / p.total) + '%' !== keyText) issues.push('part over whole gives ' + Math.round(100 * part / p.total) + '%, the key is ' + keyText);
      else checks.push('chart sums: ' + p.parts.map((x) => x.label).join(' + ') + ' = ' + part + ' of ' + p.total + ' = ' + keyText);
    }
  }
  if (p.type === 'qr.triangle') {
    const c = COMPUTE.lawOfCosines(p.a, p.b, p.angleDeg);
    facts.c = c;
    const root = (s) => { const m = /(?:root|√)\s*(\d+)/.exec(s); return m ? +m[1] : null; };
    const k = root(keyText);
    if (k != null) { if (Math.abs(c * c - k) > 1e-9) issues.push('Law of Cosines gives c squared = ' + (c * c).toFixed(4) + ', the key says root ' + k); else checks.push('Law of Cosines recomputed: c = ' + c.toFixed(4) + ' = root ' + k); }
    else if (Math.abs(c - parseFloat(keyText)) > 0.05) issues.push('Law of Cosines gives ' + c.toFixed(3) + ', the key is ' + keyText);
    (p.compare || []).forEach((cmp) => { const cc = COMPUTE.lawOfCosines(p.a, p.b, cmp.angleDeg), r = root(cmp.label); if (r != null && Math.abs(cc * cc - r) > 1e-9) issues.push('compare at ' + cmp.angleDeg + ' degrees gives c squared = ' + (cc * cc).toFixed(3) + ', its label says root ' + r); });
  }
  if (p.type === 'qr.tree') {
    const N = p.root.n, pct = (s) => parseFloat(s) / 100;
    let ok = true;
    p.branches.forEach((b) => { if (Math.abs(N * pct(b.rate) - b.n) > 1e-9) ok = false; b.children.forEach((c) => { if (Math.abs(b.n * pct(c.rate) - c.n) > 1e-9) ok = false; if (!Number.isInteger(c.n)) ok = false; }); });
    if (!ok) issues.push('tree counts do not follow the branch rates, or a count is not a whole person');
    const leaves = p.branches.flatMap((b) => b.children);
    const num = leaves.filter((c) => c.role === 'numerator'), den = leaves.filter((c) => c.role === 'numerator' || c.role === 'denominator');
    const nsum = num.reduce((a, c) => a + c.n, 0), dsum = den.reduce((a, c) => a + c.n, 0), val = nsum / dsum;
    const dec = (keyText.split('.')[1] || '').length;
    if (!/^\d*\.?\d+$/.test(keyText) || val.toFixed(dec) !== keyText) issues.push('tree result ' + val + ' vs key ' + keyText);
    else checks.push('Bayes recomputed from the branch rates on ' + N + ' people: ' + nsum + ' / ' + dsum + ' = ' + val.toFixed(4) + ', rounds to ' + keyText + '; every count a whole person');
    if (p.result && p.result.value != null && Math.abs(p.result.value - +keyText) > 1e-9) issues.push('tree result.value ' + p.result.value + ' differs from the key');
  }
  if (p.type === 'qr.numberline') {
    if (!(p.max > p.min) || !(p.step > 0)) issues.push('number line needs min < max and a positive step');
  }
  if (p.type === 'rc.evidence') {
    const P = served.extra && served.extra.passage;
    if (!P) { issues.push('rc.evidence: the served item has no passage'); return; }
    if (p.passage !== P.id) issues.push('rc.evidence passage ' + p.passage + ' is not the served passage ' + P.id);
    p.spans.forEach((s) => {
      const sent = P.paragraphs[s.p - 1] && P.paragraphs[s.p - 1][s.s - 1];
      if (!sent || !sent.includes(s.quote)) issues.push('rc quote not found in ' + s.p + '.' + s.s + ': ' + s.quote);
      if (s.choice && !served.choices.includes(s.choice)) issues.push('rc span choice not served: ' + s.choice);
    });
    const all = P.paragraphs.flat().join(' ');
    e.steps.forEach((st) => (st.match(/"([^"]+)"/g) || []).forEach((q) => { const t = q.slice(1, -1).replace(/[,.]$/, ''); if (!all.includes(t)) issues.push('step quote not in passage: ' + t); }));
    const keySpans = p.spans.filter((s) => s.role === 'key').map((s) => s.p + '.' + s.s);
    const proof = (served.extra.proof || []).map((x) => x.paragraph + '.' + x.sentence);
    if (!keySpans.length) issues.push('rc.evidence has no key span');
    else if (!keySpans.every((k) => proof.includes(k))) issues.push('key span not among the bank proof lines ' + proof);
    else checks.push('RC spans: every quote found verbatim; key spans match the bank proof lines (' + keySpans.join(', ') + ')');
  }
  if (p.type === 'chem.mechanism' && p.fig && !p.ref) {
    // an explainer's own mechanism (batch B004 on): the arrows are pushed for real by the
    // 2026 set's verifier; a structure key must be among the products, and the chain starts
    // from the stem molecule unless the spec says fromStem: false (a comparison molecule)
    if (p.fig.kind !== 'chain' || !Array.isArray(p.fig.steps) || !p.fig.steps.length) { issues.push('chem.mechanism: an inline fig is a chain with at least one step'); return; }
    facts.fig = clone(p.fig);
    const keySmi = served.extra && served.extra.os ? keyText : null;
    const start = p.fromStem === false ? null : (served.extra && served.extra.qs) || null;
    if (p.fromStem !== false && !start) issues.push('chem.mechanism: the stem has no structure; set fromStem: false and say in the caption what the chain shows');
    rdkit(R, { chain: { fig: p.fig, key: keySmi, start } }, (r) => {
      const c = r.chain;
      if (!c.ok) { issues.push('mechanism arrows (RDKit, scripts/ochem2026/verify.py): ' + c.problems.join('; ')); return; }
      if (keySmi && !c.keyInProduct) issues.push('mechanism product ' + c.product.join(' + ') + ' does not hold the key ' + keySmi);
      if (start && !c.startOk) issues.push('mechanism does not start from the stem molecule ' + start);
      if ((!keySmi || c.keyInProduct) && (!start || c.startOk)) checks.push('mechanism arrows pushed in RDKit (scripts/ochem2026/verify.py): ' + p.fig.steps.length + ' step' + (p.fig.steps.length > 1 ? 's' : '') + ', each gives the next' + (start ? ', from the stem molecule' : '') + '; product ' + c.product.join(' + ') + (keySmi ? ', which holds the key' : ''));
    });
    return;
  }
  if (p.type === 'chem.mechanism') {
    const it = SET2026.find((x) => x.id === (p.ref && p.ref.id));
    if (!it) { issues.push('2026 item missing ' + (p.ref && p.ref.id)); return; }
    facts.fig = clone(it.fig);
    const prod = it.fig.product && it.fig.product[0] && it.fig.product[0].smi;
    if (prod === keyText) checks.push('2026 set ' + p.ref.id + ' figure ends in the key product ' + prod + ' (arrows proven by scripts/ochem2026/verify.py)');
    else if (prod) rdkit(R, { same: [prod, keyText] }, (r) => { if (!r.same) issues.push('2026 figure product ' + prod + ' differs from the key ' + keyText); else checks.push('2026 set ' + p.ref.id + ' figure product is the key molecule (RDKit)'); });
    else issues.push('2026 figure ' + p.ref.id + ' has no product to check against the key');
  }
  if (p.type === 'chem.energy') {
    if (!Array.isArray(p.points) || p.points.length < 3) issues.push('energy diagram needs at least 3 points');
  }
  if (p.type === 'chem.reaction') {
    p.reactants.concat(p.products).forEach((m) => rdkit(R, { smi: m.smi, cip: m.cip || [] }, (r) => {
      if (!r.ok) { issues.push('RDKit cannot parse ' + m.smi); return; }
      if ((m.cip || []).length) { if (!r.cipOk) issues.push('CIP labels claimed on ' + m.smi + ' differ from RDKit: ' + JSON.stringify(r.cip)); else checks.push('RDKit CIP on ' + m.smi + ': ' + m.cip.map((c) => 'atom ' + c.atom + ' ' + c.config).join(', ')); }
      (m.marks || []).forEach((k) => { if (!(k.atom >= 0 && k.atom < r.heavy)) issues.push('mark on atom ' + k.atom + ' of ' + m.smi + ', which has ' + r.heavy + ' heavy atoms'); });
    }));
  }
  if (p.type === 'chem.molecule') {
    rdkit(R, { smi: p.smi, cip: (p.centers || []).map((c) => ({ atom: c.atom, config: c.config })), meso: p.meso == null ? null : p.meso }, (r) => {
      if (!r.ok) { issues.push('RDKit cannot parse ' + p.smi); return; }
      (p.marks || []).forEach((k) => { if (!(k.atom >= 0 && k.atom < r.heavy)) issues.push('mark on atom ' + k.atom + ' of ' + p.smi + ', which has ' + r.heavy + ' heavy atoms'); });
      if (p.mirror && !(p.mirror.length === 2 && p.mirror.every((a) => a >= 0 && a < r.heavy))) issues.push('mirror needs two heavy atoms of ' + p.smi);
      if (p.mirror && p.meso !== true) issues.push('a mirror-plane line is drawn only on a molecule the spec calls meso (RDKit checks it)');
      if (p.meso != null) { if (!r.mesoOk) issues.push('RDKit: ' + p.smi + (r.meso ? ' is meso' : ' is not meso') + ', the spec says meso ' + p.meso); else checks.push('RDKit: ' + p.smi + (r.meso ? ' is meso (stereocenters, and it is its own mirror image)' : ' is not meso')); }
      if ((p.centers || []).length) { if (!r.cipOk) issues.push('CIP labels in the spec differ from RDKit: ' + JSON.stringify(r.cip)); else checks.push('RDKit CIP on ' + p.smi + ': ' + JSON.stringify(r.cip)); }
    });
    if (e.choices.some((c) => c.relation)) {
      const centers = Object.fromEntries((p.centers || []).map((c) => [c.name, c.atom]));
      const choices = e.choices.map((c) => {
        const lab = {}; (c.text.match(/(\d)([RS])/g) || []).forEach((m) => { lab['C' + m[0]] = m[1]; });
        // the explainer's claim about meso (from its own note), checked against this choice's isomer
        const claimsMeso = /cannot be meso|not meso|is chiral/.test(c.note) ? false : (/\bis meso\b/.test(c.note) && !/not meso/.test(c.note) ? true : null);
        // relation words in the note must agree with the relation field
        ['enantiomer', 'diastereomer'].filter((w) => new RegExp('\\b' + w).test(c.note) && !new RegExp('not (the |an? )?' + w).test(c.note)).forEach((w) => { if (w !== c.relation) issues.push('note for ' + c.text + ' says ' + w + ' but the relation field is ' + c.relation); });
        return { text: c.text, labels: lab, relation: c.relation, claimsMeso };
      });
      rdkit(R, { stereo: { smi: p.smi, centers, choices } }, (r) => {
        const st = r.stereo;
        if (!st.ok) issues.push('stereo relations: ' + JSON.stringify(st.choices));
        else checks.push('RDKit stereo relations to the key: ' + st.choices.map((c) => c.text + ' = ' + c.relation + (c.isomerMeso ? ' (meso)' : '')).join('; ') + '; any meso isomer: ' + st.anyMeso);
      });
    }
  }
  if (p.type === 'chem.spectrum' && p.kind === 'ir') {
    // every band sits inside the textbook window for its group, and one trace is the key
    const [hi, lo] = p.range || [];
    if (!(hi > lo)) issues.push('IR range is [high, low] wavenumber, as the axis reads left to right');
    const traces = p.traces || [];
    if (traces.filter((tr) => tr.key).length !== 1) issues.push('chem.spectrum: exactly one trace is the key');
    const seen = [];
    traces.forEach((tr) => (tr.bands || []).forEach((b) => {
      const w = IR_WINDOWS[b.group];
      if (!w) { issues.push('IR band group "' + b.group + '" is not in the landmark table (' + Object.keys(IR_WINDOWS).join(', ') + ')'); return; }
      if (!(b.at >= w[0] && b.at <= w[1])) issues.push('IR band ' + b.group + ' drawn at ' + b.at + ', the landmark window is ' + w[0] + ' to ' + w[1]);
      if (!(b.at <= hi && b.at >= lo)) issues.push('IR band at ' + b.at + ' is off the axis');
      seen.push(b.group + ' ' + b.at);
    }));
    (p.zones || []).forEach((z) => { const w = IR_WINDOWS[z.group]; if (!w) issues.push('IR zone group "' + z.group + '" is not in the landmark table'); else if (z.from < w[0] - 60 || z.to > w[1] + 60) issues.push('IR zone ' + z.group + ' ' + z.from + ' to ' + z.to + ' strays from its window ' + w[0] + ' to ' + w[1]); });
    if (seen.length) checks.push('IR bands inside their landmark windows: ' + seen.join(', ') + (p.zones && p.zones.length ? '; zones ' + p.zones.map((z) => z.group).join(', ') : ''));
  }
  if (p.type === 'chem.lewis') {
    const m = p.molecule, lg = p.ledger;
    const bondE = m.bondPattern.reduce((a, b) => a + 2 * b.order, 0), lpE = Object.values(m.lonePairCounts).reduce((a, n) => a + 2 * n, 0);
    if (bondE + lpE !== m.totalValenceElectrons) issues.push('Lewis structure holds ' + (bondE + lpE) + ' electrons, the record says ' + m.totalValenceElectrons);
    const centralBonds = m.bondPattern.filter((b) => b.atomA === lg.atom || b.atomB === lg.atom).reduce((a, b) => a + b.order, 0);
    if (centralBonds !== lg.inBonds) issues.push('ledger says ' + lg.inBonds + ' electrons in bonds on ' + lg.atom + ', the structure has ' + centralBonds);
    if (lg.valence - lg.inBonds !== 2 * (m.lonePairCounts[lg.atom] || 0)) issues.push('ledger: ' + lg.valence + ' - ' + lg.inBonds + ' does not give ' + (m.lonePairCounts[lg.atom] || 0) + ' lone pairs');
    if (p.focus === 'central-lone-pairs' && /^\d+$/.test(keyText) && +keyText !== m.lonePairCounts[m.centralAtom]) issues.push('Lewis structure shows ' + m.lonePairCounts[m.centralAtom] + ' lone pairs on ' + m.centralAtom + ', the key is ' + keyText);
    if (p.layoutAngles && p.layoutAngles.length !== m.bondPattern.length) issues.push('layoutAngles needs one angle per bond');
    checks.push('Lewis ledger recomputed: ' + m.totalValenceElectrons + ' valence electrons; ' + lg.atom + ' ' + lg.valence + ' - ' + lg.inBonds + ' = ' + (lg.valence - lg.inBonds) + ' electrons = ' + (lg.valence - lg.inBonds) / 2 + ' lone pair' + ((lg.valence - lg.inBonds) / 2 === 1 ? '' : 's'));
  }
  if (p.type === 'bio.hardy-weinberg') {
    const q = Math.sqrt(p.q2);
    if (p.focus === 'q' && /^\d*\.\d+$/.test(keyText)) { if (Math.abs(q - +keyText) > 1e-9) issues.push('the square root of q squared ' + p.q2 + ' is ' + q + ', the key is ' + keyText); else checks.push('Hardy-Weinberg recomputed: q = root ' + p.q2 + ' = ' + keyText); }
  }
  if (p.type === 'bio.punnett') {
    let P;
    try { P = BIOC.punnettCross(p.cross); } catch (err) { issues.push('punnett: ' + err.message); return; }
    if (P.mode === 'xlinked') {
      const claim = p.claim || {};
      const all = (sex, st) => { const k = P.cells.flat().filter((c) => c.sex === sex); return k.length > 0 && k.every((c) => c.status === st); };
      if (!claim.sons || !claim.daughters) issues.push('x-linked Punnett needs claim {sons, daughters}');
      else if (!all('son', claim.sons) || !all('daughter', claim.daughters)) issues.push('Punnett square does not give every son ' + claim.sons + ' and every daughter ' + claim.daughters + ': ' + JSON.stringify(P.cells.flat()));
      else if (!new RegExp('sons ' + claim.sons, 'i').test(keyText) || !new RegExp('daughters ' + claim.daughters, 'i').test(keyText)) issues.push('the Punnett claim (sons ' + claim.sons + ', daughters ' + claim.daughters + ') is not what the key says: ' + keyText);
      else checks.push('Punnett recomputed: ' + p.cross.p1 + ' x ' + p.cross.p2 + ' gives ' + P.cells.flat().map((c) => c.geno + ' ' + c.status + ' ' + c.sex).join(', ') + '; matches the key');
    }
    if (P.mode === 'testcross') {
      if (/%$/.test(keyText) && P.recombinantPct + '%' !== keyText) issues.push('testcross recombinants add to ' + P.recombinantPct + '%, the key is ' + keyText);
      else checks.push('testcross recomputed from ' + p.cross.mapDistance + ' map units: recombinant classes ' + P.rows.filter((r) => r.kind === 'recombinant').map((r) => r.pct).join(' + ') + ' = ' + P.recombinantPct + '%, parental ' + P.parentalPct + '%');
    }
  }
  if (p.type === 'bio.diagram' && p.diagram === 'codon') {
    try {
      const a = BIOC.translateCodon(p.codon.from), b = BIOC.translateCodon(p.codon.to);
      const diff = [...p.codon.from].filter((x, i) => x !== p.codon.to[i]).length;
      const key = (p.outcomes || []).filter((o) => o.key);
      if (diff !== 1) issues.push('codon picture changes ' + diff + ' bases; a point mutation changes one');
      if (key.length !== 1 || key[0].name !== keyText) issues.push('codon outcomes: exactly one key row, named as the key (' + keyText + ')');
      const outcome = a === b ? 'Silent' : b === 'Stop' ? 'Nonsense' : 'Missense';
      if (key.length === 1 && key[0].name !== outcome) issues.push('the genetic code makes ' + p.codon.from + ' to ' + p.codon.to + ' a ' + outcome + ' change, the key row says ' + key[0].name);
      else checks.push('genetic code: ' + p.codon.from + ' (' + a + ') to ' + p.codon.to + ' (' + b + ') is ' + outcome.toLowerCase() + '; synonyms ' + BIOC.synonymsOf(p.codon.from).join(' '));
    } catch (err) { issues.push('codon: ' + err.message); }
  }
  if (p.type === 'bio.diagram' && p.ledger) {
    const L = BIOC.ledger(p.ledger);
    if (/^\d+(\.\d+)?$/.test(keyText) && L.total !== +keyText) issues.push('ledger totals ' + L.total + ', the key is ' + keyText);
    else checks.push('ledger recomputed: ' + L.items.map((it, i) => it.n + ' ' + p.ledger[i].carrier + ' x ' + it.rate + ' = ' + it.value).join(', ') + ', total ' + L.total);
    const said = [...e.steps.join(' ').matchAll(/(\d+) x (\d+(?:\.\d+)?) = (\d+(?:\.\d+)?)/g)];
    said.forEach((m) => { if (Math.abs(+m[1] * +m[2] - +m[3]) > 1e-9) issues.push('step arithmetic ' + m[0] + ' does not hold'); });
  }
  if (p.type === 'bio.diagram' && p.diagram === 'nephron-budget') {
    const b = BIOC.budget(p.segments), key = p.segments.filter((g) => g.key);
    if (b.rest < 0) issues.push('nephron budget shares add to ' + b.used + ', over 100');
    if (key.length !== 1 || !new RegExp('^~?' + key[0].share + '%$').test(keyText)) issues.push('nephron budget key segment share differs from the key ' + keyText);
    else checks.push('sodium budget: ' + p.segments.map((g) => g.label + ' ' + g.share).join(', ') + ', rest ' + b.rest + '; key segment ' + key[0].label + ' = ' + keyText);
  }
  if (p.type === 'bio.diagram' && p.diagram === 'ap-trace') {
    const counts = (p.traces || []).filter((tr) => tr.kind === 'train').map((tr) => tr.count);
    if (counts.length > 1 && !(p.traces.filter((tr) => tr.kind === 'train').every((tr, i, a) => i === 0 || (tr.strength > a[i - 1].strength) === (tr.count > a[i - 1].count)))) issues.push('spike trains: a stronger stimulus must fire more often');
    if ((p.traces || []).filter((tr) => tr.key).length !== 1) issues.push('ap-trace: exactly one trace is the key');
  }
  // bio.tree, bio.chart and the bio.diagram drawings of batch B002: every choice a picture names
  // is a served choice, the outlined place is the key, and counts drawn from data are recomputed
  if (p.type === 'bio.tree' || p.type === 'bio.chart' || (p.type === 'bio.diagram' && ['pathway', 'chromosomes', 'amniote-egg', 'junctions', 'thylakoid'].includes(p.diagram))) {
    const named = [];
    (function walk(o) { if (Array.isArray(o)) o.forEach(walk); else if (o && typeof o === 'object') { if (typeof o.choice === 'string') named.push(o); Object.values(o).forEach(walk); } })(p);
    named.forEach((o) => { if (!served.choices.includes(o.choice)) issues.push(p.type + ' names "' + o.choice + '", which is not a served choice'); });
    named.filter((o) => o.key).forEach((o) => { if (o.choice !== keyText) issues.push(p.type + ' outlines "' + o.choice + '" as the answer, but the key is "' + keyText + '"'); });
    if (named.length && !named.some((o) => o.choice === keyText)) issues.push(p.type + ' names ' + named.length + ' choices but not the key');
    else if (named.length) checks.push('picture names ' + new Set(named.map((o) => o.choice)).size + ' of ' + served.choices.length + ' choices, each a served choice; the outlined place is the key');
    if (p.diagram === 'chromosomes' && p.view === 'meiosis-counts') {
      const mi = 2 * p.n2, mii = p.n2, m = /^(\d+) at metaphase I and (\d+) at metaphase II$/.exec(keyText);
      if (!m || +m[1] !== mi || +m[2] !== mii) issues.push('meiosis counts from 2n = ' + p.n2 + ': ' + mi + ' chromatids at metaphase I and ' + mii + ' at metaphase II; the key reads "' + keyText + '"');
      else checks.push('meiosis recomputed from 2n = ' + p.n2 + ': copied once, ' + p.n2 + ' x 2 = ' + mi + ' chromatids at metaphase I; halved, ' + p.n2 / 2 + ' x 2 = ' + mii + ' at metaphase II; matches the key');
    }
    if (p.diagram === 'amniote-egg' || p.diagram === 'junctions') {
      const parts = p.diagram === 'amniote-egg' ? ['chorion', 'amnion', 'allantois', 'yolk-sac', 'albumen'] : ['tight-junction', 'desmosome', 'gap-junction', 'hemidesmosome'];
      if (!parts.includes(p.focus)) issues.push(p.diagram + ' focus ' + p.focus + ' is not one of its parts: ' + parts.join(', '));
      else if (!keyText.toLowerCase().includes(p.focus.replace(/-/g, ' '))) issues.push(p.diagram + ' outlines ' + p.focus + ', but the key is "' + keyText + '"');
      else checks.push(p.diagram + ' outlines ' + p.focus + ', the key');
    }
    if (p.diagram === 'thylakoid' && !['atp-synthase', 'leak'].includes(p.focus)) issues.push('thylakoid focus is atp-synthase or leak');
    if (p.diagram === 'thylakoid' && p.focus === 'leak' && !p.leak) issues.push('thylakoid focus leak needs leak: true');
  }
  if (p.type === 'bio.osmolarity') {
    const osm = Math.round(p.solute.molarity * p.solute.ions.length * 1000);
    checks.push('osmolarity recomputed: ' + p.solute.molarity + ' M x ' + p.solute.ions.length + ' particles = ' + osm + ' ' + p.units + ' outside, ' + p.inside + ' inside');
    if (/same|isotonic/i.test(keyText) && osm !== p.inside) issues.push('the key says no change, but outside ' + osm + ' differs from inside ' + p.inside);
  }
  if (p.type && p.type.startsWith('pat.')) {
    const it = served.extra && served.extra.item;
    if (!it) { issues.push(p.type + ': the served item is not a PAT item'); return; }
    if (p.item && (p.item.test !== served.extra.test || String(p.item.n) !== e.qid.split(':')[2])) issues.push(p.type + ' item ' + JSON.stringify(p.item) + ' is not the served item');
    if (p.type === 'pat.angles') {
      const sorted = it.figure.degs.map((d, i) => [d, i + 1]).sort((a, b) => a[0] - b[0]).map((x) => x[1]).join('-');
      if (sorted !== keyText) issues.push('angles recompute ' + sorted);
      else checks.push('PAT engine: degrees ' + it.figure.degs.join(', ') + ' sort to ' + sorted + '; arms ' + JSON.stringify(it.figure.arms));
    }
    if (p.type === 'pat.unfold') {
      const st = it.figure.steps; let holes = it.figure.punches.map((h) => h.slice());
      const chain = [holes.slice()];
      for (let s = st.length - 1; s >= 0; s--) {
        const f = st[s].fold; const flap = {}; st[s].flap.forEach((k) => { const q = k.split(','); flap[q[0] + ',' + q[1]] = (flap[q[0] + ',' + q[1]] || 0) + 1; });
        const add = [];
        holes.forEach((h) => { const m = PAT.holepunch._internal.reflectP(f, h); const c = Math.floor(m[0]) + ',' + Math.floor(m[1]); if (flap[c] === 4) add.push(m); });
        holes = holes.concat(add); chain.push(holes.slice());
      }
      facts.chain = chain;
      if (holesText(holes) !== keyText) issues.push('unfold recompute ' + holesText(holes));
      else checks.push('PAT unfold recomputed from the fold model: ' + chain.map((c) => c.length).join(' -> ') + ' holes, matches the key');
    }
    if (p.type === 'pat.cubes') {
      const set = {}; it.figure.cubes.forEach((c) => { set[c.join(',')] = 1; });
      const counts = it.figure.cubes.map((c) => [c.join(','), PAT.cubes.painted(set, c)]);
      facts.painted = Object.fromEntries(counts);
      const k = counts.filter((c) => c[1] === it.meta.k).map((c) => c[0]);
      facts.kCubes = k;
      if (k.length + ' cube' + (k.length > 1 ? 's' : '') !== keyText) issues.push('cube recompute ' + k.length);
      else checks.push('PAT painted() recomputed: cubes with exactly ' + it.meta.k + ' painted side' + (it.meta.k === 1 ? '' : 's') + ': ' + k.join(' '));
      // slip counts behind the trap notes. Viewer looks down (-1,-1,-1): visible sides +x (lower right), +y (lower left), +z (top);
      // hidden sides -x (upper left on screen) and -y (upper right on screen).
      const hasC = (a, b, c) => !!set[a + ',' + b + ',' + c];
      const count = (skip) => it.figure.cubes.filter((c) => { const [x, y, z] = c; let n = 0; const sides = { '+x': !hasC(x + 1, y, z), '-x': !hasC(x - 1, y, z), '+y': !hasC(x, y + 1, z), '-y': !hasC(x, y - 1, z), '+z': !hasC(x, y, z + 1) }; for (const [s2, open] of Object.entries(sides)) if (open && !skip.includes(s2)) n++; return n === it.meta.k; }).length;
      const slips = { 'skip-back': count(['-y']), 'skip-left': count(['-x']), 'visible-only': count(['-x', '-y']) };
      e.choices.forEach((c) => { if (!c.slip) return; const n = parseInt(c.text, 10); if (c.slip === 'none') { if (Object.values(slips).includes(n)) issues.push('a single slip does give ' + n + ' (' + Object.entries(slips).filter(([, v]) => v === n).map(([s]) => s).join(', ') + ')'); return; } if (!(c.slip in slips)) issues.push('unknown slip ' + c.slip); else if (slips[c.slip] !== n) issues.push('slip ' + c.slip + ' gives ' + slips[c.slip] + ', note claims ' + n); });
      checks.push('cube slips recomputed: skip upper-right (-y) sides ' + slips['skip-back'] + ', skip upper-left (-x) sides ' + slips['skip-left'] + ', visible sides only ' + slips['visible-only']);
    }
  }
}

/* ------------------------------------------------------------- RDKit pass */
function runRdkit(jobs) {
  if (!jobs.length) return [];
  const tmp = fs.mkdtempSync(path.join(process.env.EXPLAINERS_TMP || os.tmpdir(), 'explainers-rdkit-'));
  const inF = path.join(tmp, 'in.json'), outF = path.join(tmp, 'out.json');
  fs.writeFileSync(inF, JSON.stringify(jobs));
  try { execFileSync('python3', ['-I', path.join(HERE, 'rdkit-check.py'), inF, outF], { stdio: ['ignore', 'inherit', 'inherit'] }); }
  catch (err) { throw new Error('RDKit gate could not run (needs python3 with RDKit): ' + err.message); }
  const out = JSON.parse(fs.readFileSync(outF, 'utf8'));
  fs.rmSync(tmp, { recursive: true, force: true });
  return out;
}
const rdOut = runRdkit(RD_JOBS.map((j) => j.job));
RD_JOBS.forEach((j, i) => j.then(rdOut[i]));
RECORDS.forEach((R) => { const n = RD_JOBS.filter((j) => j.R === R && j.job.smi).length; if (n) R.checks.push('RDKit parsed all ' + n + ' SMILES'); });

/* --------------------------------------------------------- assemble outputs */
const safeName = (qid) => qid.replace(/:/g, '__');
const subDir = (subtopic) => String(subtopic).split('.').slice(1, 2)[0] || 'misc';
const FACT_KEYS = { 'chem.trend': ['values'], 'chem.curve': ['marks'], 'qr.triangle': ['c'], 'chem.mechanism': ['fig'], 'pat.unfold': ['chain'], 'pat.cubes': ['painted', 'kCubes'] };
function studentVisual(R) {
  const v = clone(R.e.visual);
  const panels = v.type === 'stack' ? v.panels : [v];
  panels.forEach((p, i) => {
    const f = R.facts[i] || {};
    for (const k of FACT_KEYS[p.type] || []) {
      if (f[k] == null) continue;
      if (k === 'marks') p.marks = p.marks.map((m, j) => Object.assign({}, m, f.marks[j]));
      else p[k] = f[k];
    }
  });
  return v;
}
function studentSidecar(R) {
  const e = R.e, s = R.served;
  const rec = {
    schema: 'ace.explainer/1',
    qid: e.qid,
    servesAlso: R.aliases.filter((a) => a.status === 'active').map((a) => ({ qid: a.qid })),
    bank: { file: e.source.bank, locator: e.source.locator, keyText: e.keyText, stemHash: stemHash(s), choiceTexts: s.choices },
    section: e.section, subtopic: e.subtopic, difficulty: e.difficulty,
    premises: e.premises || [],
    answer: { text: e.keyText, line: e.answer.line },
    steps: e.steps,
    choices: e.choices.map((c) => Object.assign({ text: c.text }, c.display ? { display: c.display } : {}, { role: c.role }, c.family ? { family: c.family, missType: FAMILIES[c.family] ? FAMILIES[c.family].missType : null } : {}, c.trap ? { trap: c.trap } : {}, c.relation ? { relation: c.relation } : {}, { note: c.note })),
    lockIt: e.lockIt, hook: e.hook || null,
    playWith: { label: e.playWith.label, href: e.playWith.href, state: e.playWith.state || null },
    video: { slot: e.video.slot, title: e.video.title || null, id: e.video.id || null, start: e.video.start == null ? null : e.video.start },
    visual: studentVisual(R)
  };
  if (e.canonical) rec.canonical = e.canonical;
  return rec;
}
function coachLeaks(obj, where) {
  const out = [];
  (function walk(o, p) { if (Array.isArray(o)) o.forEach((x, i) => walk(x, p + '[' + i + ']')); else if (o && typeof o === 'object') for (const [k, v] of Object.entries(o)) { if (COACH_KEYS.has(k)) out.push(where + ': ' + p + '.' + k); walk(v, p + '.' + k); } })(obj, '');
  return out;
}

const families = {}; for (const [id, f] of Object.entries(FAMILIES)) families[id] = { name: f.name, missType: f.missType };
const sectionIndex = Object.fromEntries(SECTIONS.map((s) => [s, {}]));
const coachIndex = { schema: 'ace.explainer-coach-index/1', batches: {}, items: {} };
const gateReport = { schema: 'ace.explainer-gates/1', standard: 'docs/release-2026-10-30/questions/explainer-standard.md (version 2)', repoFiles, summary: null, items: {} };
const leaks = [];
const passages = {};
const oldVideos = readJson(VIDEOS, { slots: {} });
const slots = {};
for (const S of SOURCES) coachIndex.batches[S.id] = { title: S.title, source: S.rel, qids: S.entries.map((e) => e.qid) };

for (const R of RECORDS) {
  const e = R.e, pass = R.issues.length === 0 && !!R.served;
  if (!R.served) { gateReport.items[R.qid || '(no qid)'] = { batch: R.S.id, pid: R.pid, pass: false, issues: R.issues, warnings: R.warns }; continue; }
  const file = path.posix.join(e.section, subDir(e.subtopic), safeName(e.qid) + '.json');
  const student = studentSidecar(R);
  const studentText = JSON.stringify(student) + '\n';   // compact: the player fetches it; reviewers read the source
  const checksum = sha(studentText);
  const bytes = Buffer.byteLength(studentText);
  if (bytes > BUDGET.sidecar) R.issues.push('student sidecar is ' + bytes + ' bytes (budget ' + BUDGET.sidecar + ')');
  const leak = coachLeaks(student, file); if (leak.length) { R.issues.push('coach data in the student sidecar: ' + leak.join('; ')); leaks.push(...leak); }
  const ok = R.issues.length === 0;
  const ap = (APPROVALS.approvals || {})[e.qid];
  let status = 'draft';
  if (R.held) status = 'held';
  else if (!ok) status = 'draft';
  else if (ap && ap.checksum === checksum) status = 'approved';
  else if (ap && ap.guard && (ap.guard.keyText !== e.keyText || ap.guard.stemHash !== student.bank.stemHash)) status = 'stale';
  const review = { status, by: status === 'approved' ? ap.by : null, at: status === 'approved' ? ap.at : null, batch: R.S.id, checksum, approvedChecksum: ap ? ap.checksum : null };
  if (ap && status === 'draft' && ok) review.note = 'edited after approval on ' + ap.at + '; needs a new approval';
  const publish = ok && !R.held;
  if (publish) {
    emit(OUT + '/' + file, studentText);
    sectionIndex[e.section][e.qid] = { file, status, checksum };
    R.aliases.filter((a) => a.status === 'active').forEach((a) => { sectionIndex[e.section][a.qid] = { aliasOf: e.qid, file }; });
    const sl = slots[e.video.slot] || (slots[e.video.slot] = { title: e.video.title || null, questions: [] });
    sl.questions.push(e.qid);
  }
  // the coach record (never published)
  const s = R.served, x = s.extra || {};
  const servedCopy = { stem: s.stem, choices: s.choices, keyIndex: s.key, bankWhy: s.why || null, extra: {} };
  for (const k of ['mock', 'section', 'n', 'qs', 'os', 'figure', 'format', 'move', 'type', 'proof', 'test', 'name', 'id', 'tier', 'figureSvg', 'file']) if (x[k] != null && x[k] !== false) servedCopy.extra[k] = x[k];
  if (x.passage) { servedCopy.extra.passage = { id: x.passage.id, title: x.passage.title, file: 'passages/' + x.passage.id + '.json' }; passages[x.passage.id] = { schema: 'ace.rc-passage-copy/1', note: 'Copy of the served passage from tools/rc/data/bank.js for the coach preview. Generated; never edit.', id: x.passage.id, title: x.passage.title, paragraphs: x.passage.paragraphs }; }
  if (x.distractorNotes) servedCopy.extra.distractorNotes = x.distractorNotes;
  if (x.item) servedCopy.extra.patItem = x.item;
  const gate = { pass: ok, issues: R.issues, warnings: R.warns, checks: R.checks };
  const coach = {
    schema: 'ace.explainer-coach/1', qid: e.qid, pid: R.pid, batch: R.S.id, source: R.S.rel,
    servedAs: e.source.servedAs, sidecar: publish ? OUT + '/' + file : null, checksum,
    servesAlso: R.aliases.map((a) => Object.assign({}, a)),
    flags: e.flags || [], review, held: R.held || null,
    routing: e.playWith.routing || null, playWithExpect: e.playWith.expect || [],
    gate, changes: R.S.changes[R.pid] || [],
    preview: { pick: e.demoPick || null },
    served: servedCopy,
    student
  };
  emit(DOCS + '/coach/' + safeName(e.qid) + '.json', coach);
  const vt = e.visual.type === 'stack' ? e.visual.panels.map((p) => p.type).join(' + ') : e.visual.type;
  coachIndex.items[e.qid] = { file: 'coach/' + safeName(e.qid) + '.json', batch: R.S.id, pid: R.pid, section: e.section, subtopic: e.subtopic, visual: vt, servedAs: e.source.servedAs, stem: s.stem.length > 140 ? s.stem.slice(0, 137) + '...' : s.stem, pass: ok, status, published: publish, flags: (e.flags || []).map((f) => f.kind), heldAliases: R.aliases.filter((a) => a.status !== 'active').map((a) => a.qid + ' (' + a.status + (a.heldBecause ? ': ' + a.heldBecause : '') + ')') };
  gateReport.items[e.qid] = { batch: R.S.id, pid: R.pid, checksum, pass: ok, status, issues: R.issues, warnings: R.warns, checks: R.checks.length };
}
for (const [id, p] of Object.entries(passages)) emit(DOCS + '/passages/' + id + '.json', p);

// published indexes
const sectionFiles = {};
for (const s of SECTIONS) { sectionFiles[s] = 'index-' + s + '.json'; emit(OUT + '/index-' + s + '.json', { schema: 'ace.explainer-index/1', section: s, items: sectionIndex[s] }); }
emit(OUT + '/index.json', { schema: 'ace.explainer-sections/1', note: 'The player fetches a section index, looks up the served qid (or an alias), fetches the sidecar and runs the guard (key text, stem hash, choice texts). Only status approved is shown; anything else falls back to the bank explanation.', families: 'families.json', sections: sectionFiles });
emit(OUT + '/families.json', { schema: 'ace.families/1', note: 'The closed list of trap families (scripts/explainers/families.js). Generated; never edit.', families });
// video slots: questions from the published sidecars; ids, durations and offsets kept as recorded
const vOut = { schema: 'ace.videos/1', note: 'Video slot (the subtopic id) -> the subtopic video and the questions it serves. questions is generated by scripts/explainers/build.mjs; id, duration and start are set when Thomas records.', slots: {} };
for (const k of Object.keys(slots).sort()) { const old = (oldVideos.slots || {})[k] || {}; vOut.slots[k] = { id: old.id || null, title: old.title || slots[k].title, duration: old.duration || null, start: old.start || {}, questions: slots[k].questions }; }
emit(VIDEOS, vOut);
emit(DOCS + '/index.json', coachIndex);

// gap list: planned items (production plan) with no explainer yet
(function gapList() {
  const old = readJson(DOCS + '/gap-list.json', {});
  const plan = readJson(PLAN, null);
  const out = { schema: 'ace.gap-list/1', note: 'Served items without a published explainer. fromPlayer is filled from the qids the player logs when it falls back to the bank explanation (production-plan.md, section 3.1); groups is generated by scripts/explainers/build.mjs from the batch plan; released lists the groups whose every item must have an approved sidecar or a gap entry (empty until Thomas releases a group).', released: old.released || [], fromPlayer: old.fromPlayer || [], held: [], groups: {} };
  out.held = RECORDS.filter((R) => R.held).map((R) => ({ qid: R.qid, why: R.held }));
  if (plan) {
    const written = new Set(RECORDS.filter((R) => R.served).map((R) => R.qid));
    const published = new Set(Object.values(sectionIndex).flatMap((ix) => Object.keys(ix)));
    let firstOpen = null;   // the next group to write: its gaps are listed item by item
    for (const g of plan.groups) {
      const bs = plan.batches.filter((b) => b.group === g.id);
      const qids = [...new Set(bs.flatMap((b) => b.qids || []))];
      const entry = { title: g.title, planned: qids.length, templateBatches: bs.filter((b) => b.kind === 'template').length, written: qids.filter((q) => written.has(q)).length, published: qids.filter((q) => published.has(q)).length };
      if (!firstOpen && entry.published < entry.planned) firstOpen = g.id;
      if (firstOpen === g.id || (out.released || []).includes(g.id)) entry.gaps = Object.fromEntries(bs.filter((b) => (b.qids || []).length).map((b) => [b.id, (b.qids || []).filter((q) => !published.has(q))]).filter(([, v]) => v.length));
      out.groups[g.id] = entry;
    }
  }
  emit(DOCS + '/gap-list.json', out);
})();

/* --------------------------------------------------- vendor copies of repo code */
(function vendor() {
  const head = (src, what) => '// COPY of ' + src + (what ? ' ' + what : '') + ', made by scripts/explainers/build.mjs. Never edit; re-run the build.\n';
  const LIGHT = { '#ece6d7': '#1d1d1b', '#e0705a': '#b8321f', '#5b8def': '#1f57b5', '#9ad39a': '#2b7a4b', '#3fb257': '#1d7a36', '#c47a4a': '#8f4316', '#a06bd6': '#6b3aa8', '#f0a05a': '#a55a12', '#e2c34b': '#8a6d00', '#d8a0a0': '#9a5a5a', '#b0b0b0': '#6b6b6b' };
  let d = rd('tools/ochem/tree/draw.js'); note('tools/ochem/tree/draw.js');
  for (const [a, b] of Object.entries(LIGHT)) d = d.split(a).join(b);
  const patch = (s, a, b, what) => { if (!s.includes(a)) throw new Error('draw.js patch did nothing: ' + what); return s.replace(a, b); };
  // proposed for the repo (production-plan.md, section 2): report each bond's wedge, each stereocenter and
  // which vertices are drawn (the drawer keeps hidden H vertices at stereocenters when explicit H is off),
  // so stereo cards and the render gate can read the configuration off the drawing
  d = patch(d, 'out.bonds = g.edges.map(e => ({ a: e.sourceId, b: e.targetId, order:', 'out.bonds = g.edges.map(e => ({ a: e.sourceId, b: e.targetId, wedge: e.wedge || \'\', order:', 'bond wedges');
  d = patch(d, 'out.atoms = g.vertices.map(v => ({ i: v.id,', 'out.atoms = g.vertices.map(v => ({ i: v.id, stereo: !!v.value.isStereoCenter, drawn: v.value.isDrawn !== false,', 'stereocenters');
  d = patch(d, '  const vb = (node.getAttribute(\'viewBox\') || \'0 0 1 1\').split(/\\s+/).map(Number);\n  out.vb = vb;', '  if (typeof window !== \'undefined\' && window.AceExplainDrawn && out.atoms.length) window.AceExplainDrawn.push({ smi: smiles, from: \'drawSmilesGeom\', atoms: out.atoms, bonds: out.bonds });\n  const vb = (node.getAttribute(\'viewBox\') || \'0 0 1 1\').split(/\\s+/).map(Number);\n  out.vb = vb;', 'drawing record');
  emit(VENDOR + '/ochem/draw.js', head('tools/ochem/tree/draw.js', 'with a light theme, bond wedges, stereocenters and a drawing record') + d);
  emit(VENDOR + '/ochem/mechdraw.js', head('tools/ochem/tree/mechdraw.js') + rd('tools/ochem/tree/mechdraw.js')); note('tools/ochem/tree/mechdraw.js');
  const ls = rd('tools/gc/lewis-sandbox.html'); note('tools/gc/lewis-sandbox.html');
  const fnSrc = (name) => { const i = ls.indexOf('function ' + name + '('); if (i < 0) throw new Error('lewis fn ' + name); let dd = 0; const j = ls.indexOf('{', i); for (let k = j; k < ls.length; k++) { if (ls[k] === '{') dd++; else if (ls[k] === '}') { dd--; if (!dd) return ls.slice(i, k + 1); } } throw new Error('unbalanced lewis fn ' + name); };
  const fns = ['renderBond', 'layoutPositions', 'anglesFor', 'lonePairOffsets', 'pickLPSlots', 'angleDelta', 'atomElement'].map(fnSrc);
  emit(VENDOR + '/gc/lewis-layout.js', head('the layout and drawing functions in tools/gc/lewis-sandbox.html') + '(function(){\n' + fns.join('\n\n') + '\nwindow.LewisLayout = { renderBond: renderBond, layoutPositions: layoutPositions, lonePairOffsets: lonePairOffsets, atomElement: atomElement };\n})();\n');
})();

/* ------------------------------------------------------------- publish gate */
const publishIssues = [];
for (const [rel, text] of outputs) {
  if (!rel.startsWith(OUT + '/') && rel !== VIDEOS) continue;
  if (/dispute/i.test(rel)) publishIssues.push('dispute file under a published path: ' + rel);
  const leak = coachLeaks(JSON.parse(text), rel);
  if (leak.length) publishIssues.push(...leak.map((l) => 'coach data in a published file: ' + l));
}
(function redirects() {
  const toml = rd('netlify.toml'), red = rd('_redirects');
  for (const from of ['/docs/*', '/content/explainers-src/*']) {
    const re = new RegExp('\\[\\[redirects\\]\\](?:\\s*#[^\\n]*)*\\s*from\\s*=\\s*"' + from.replace(/[*/]/g, (c) => '\\' + c) + '"[^\\[]*?force\\s*=\\s*true');
    if (!re.test(toml)) publishIssues.push('netlify.toml does not force-redirect ' + from);
    if (!new RegExp('^' + from.replace(/[*/]/g, (c) => '\\' + c) + '\\s+\\S+\\s+30[12]!\\s*$', 'm').test(red)) publishIssues.push('_redirects does not force-redirect ' + from);
  }
})();
const passed = RECORDS.filter((R) => R.served && R.issues.length === 0).length;
gateReport.summary = { entries: RECORDS.length, passed, failed: RECORDS.length - passed, held: RECORDS.filter((R) => R.held).length, published: Object.values(sectionIndex).reduce((a, ix) => a + Object.values(ix).filter((x) => !x.aliasOf).length, 0), aliasesActive: Object.values(sectionIndex).reduce((a, ix) => a + Object.values(ix).filter((x) => x.aliasOf).length, 0), warnings: RECORDS.reduce((a, R) => a + R.warns.length, 0), keyDisputesOpen: (KEY_DISPUTES.open || []).filter((d) => d.status !== 'resolved').length, publishIssues };
emit(DOCS + '/gate-report.json', gateReport);

/* ----------------------------------------------------------- write or check */
const GENERATED_DIRS = [OUT, DOCS + '/coach', DOCS + '/passages', VENDOR];
function listGenerated() {
  const out = [];
  for (const d of GENERATED_DIRS) { const full = path.join(ROOT, d); if (!fs.existsSync(full)) continue; (function walk(dir) { for (const f of fs.readdirSync(dir)) { const p = path.join(dir, f); if (fs.statSync(p).isDirectory()) walk(p); else out.push(path.relative(ROOT, p).split(path.sep).join('/')); } })(full); }
  return out;
}
const stale = [];
if (CHECK) {
  for (const [rel, text] of outputs) { if (!exists(rel)) stale.push('missing ' + rel); else if (rd(rel) !== text) stale.push('out of date ' + rel); }
  for (const rel of listGenerated()) if (!outputs.has(rel)) stale.push('not produced by the build ' + rel);
} else {
  for (const rel of listGenerated()) if (!outputs.has(rel)) fs.rmSync(path.join(ROOT, rel));
  for (const [rel, text] of outputs) { const full = path.join(ROOT, rel); fs.mkdirSync(path.dirname(full), { recursive: true }); if (!fs.existsSync(full) || fs.readFileSync(full, 'utf8') !== text) fs.writeFileSync(full, text); }
  for (const [rel, init] of [[DOCS + '/key-disputes.json', { schema: 'ace.key-disputes/1', note: 'Suspected bad answer keys, for Thomas. One entry per item: qid, servedAs, servedKey, suspectedKey, reasoning, raisedBy, status (open or resolved). An open entry holds that item\'s explainer; only Thomas edits a bank key, in its own commit.', open: [], resolved: [] }], [DOCS + '/approvals.json', { schema: 'ace.explainer-approvals/1', note: 'Thomas\'s approval stamps: qid -> {by, at, checksum, guard: {keyText, stemHash}}. A stamp counts only while its checksum equals the sidecar checksum; any later edit returns the record to draft.', approvals: {} }]]) {
    if (!exists(rel)) fs.writeFileSync(path.join(ROOT, rel), json(init));
  }
}

/* ------------------------------------------------------------------ report */
const show = (R) => !ONLY.length || ONLY.includes(R.S.id);
let bad = 0;
for (const R of RECORDS) {
  const ok = R.served && R.issues.length === 0; if (!ok) bad++;
  if (!show(R)) continue;
  console.log((ok ? (R.held ? 'HELD ' : 'PASS ') : 'FAIL ') + R.S.id + ' ' + R.pid + ' ' + R.qid + (R.warns.length ? '  (' + R.warns.length + ' warning' + (R.warns.length > 1 ? 's' : '') + ')' : ''));
  R.issues.forEach((x) => console.log('   ISSUE ' + x));
  R.warns.forEach((x) => console.log('   warn  ' + x));
  if (R.held) console.log('   held  ' + R.held);
}
publishIssues.forEach((x) => console.log('PUBLISH ' + x));
stale.forEach((x) => console.log('STALE ' + x));
const s = gateReport.summary;
console.log('explainers: ' + s.entries + ' entries in ' + SOURCES.length + ' batch' + (SOURCES.length === 1 ? '' : 'es') + ', ' + s.passed + ' pass the build gates, ' + s.published + ' published sidecars, ' + s.aliasesActive + ' active aliases, ' + s.held + ' held, ' + s.warnings + ' warnings' + (CHECK ? ', ' + stale.length + ' stale outputs' : ', ' + outputs.size + ' outputs written'));
if (bad || publishIssues.length || stale.length) process.exitCode = 1;
