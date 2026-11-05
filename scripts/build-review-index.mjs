#!/usr/bin/env node
// build-review-index.mjs : the list the review page (/approvals/) shows, and the pulls snapshot.
//
//   node scripts/build-review-index.mjs              write content/approvals/review-index.json
//   node scripts/build-review-index.mjs --check      exit 1 when the committed index is stale
//   node scripts/build-review-index.mjs --snapshot --tag study-r1 --from URL|FILE
//                                                    write content/approvals/pulls-snapshot.json from
//                                                    the live pull list (the public
//                                                    /.netlify/functions/approvals?pulls=1 answer, or a
//                                                    saved copy of it); never writes on a failed read
//
// Merges every stamped item (build spec rule 1.1 and 1.9):
//   docs/explainers/approvals.json          the explainers (owned by G1-FIN); only entries that carry
//                                           an auto-approve "stamp" (Thomas's own approvals are not
//                                           pending review)
//   content/approvals/stamps/<batch>.json   every other batch's stamped items, picked up by glob, so a
//                                           new batch file (CONTENT-FIX.json) needs no change here
//
// The index carries no question text: the page reads each question from its own bank (the file and
// locator in the sidecar) when a preview opens, the way the player does.
//
// Pull ids are what shared/ace-pulls.js matches (1 to 200 of A-Z a-z 0-9 : . _ / -, first one a
// letter or digit). Explainers pull by their qid; the 14 generated qids that carry "#" pull with "."
// in its place (pullIdOf below; the explainer player must ask AcePulls.isPulled(pullIdOf(qid))).
// Retold items keep their stamp ids (retold:<course>:<night>:<scene>); every night that holds a
// stamped scene also gets a night item retold:<course>:<night>, which takes the night out of the
// course list and Today when pulled. A correction of a known factual error is listed with a comment
// box and no Pull (a pull would bring the error back).
//
// Sections (who may act on an item): bio, gchem, ochem, qr, pat, rc, or "all". The PAT key acts on
// pat items only. No student data goes in: tests/review/no-student-data.test.js scans the output.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const OUT = 'content/approvals/review-index.json';
export const SNAPSHOT = 'content/approvals/pulls-snapshot.json';
export const STAMPS_DIR = 'content/approvals/stamps';
export const ID_RE = /^[A-Za-z0-9][A-Za-z0-9:._\/-]{0,199}$/;
export const SECTIONS = ['bio', 'gchem', 'ochem', 'qr', 'pat', 'rc'];
const EXPLAINER_SECTION = { bio: 'bio', gc: 'gchem', ochem: 'ochem', qr: 'qr', pat: 'pat', rc: 'rc' };
const SUBJECT = { bio: 'Biology', gchem: 'General Chemistry', ochem: 'Organic Chemistry', qr: 'Quantitative Reasoning', pat: 'Perceptual Ability', rc: 'Reading Comprehension', all: 'Across Study' };
export const RETOLD = {
  bio: { label: 'Bio', place: '/tools/bio-retold/' },
  gchem: { label: 'General Chemistry', place: '/tools/gchem/' },
  ochem: { label: 'Organic Chemistry', place: '/tools/organic/' },
  pat: { label: 'PAT', place: '/tools/pat-retold/' },
  qr: { label: 'QR', place: '/tools/qr-retold/' },
  rc: { label: 'Reading', place: '/tools/rc-retold/' },
};

export const pullIdOf = (qid) => String(qid).replace(/#/g, '.');
const readJson = (root, rel) => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
const sha256 = (buf) => crypto.createHash('sha256').update(buf).digest('hex');
// Titles stay plain ASCII (the copy rules allow the OS-61 notation only inside explainer files):
// superscript and subscript runs become ^{...} and _{...}, which the page typesets back.
const SUP = { '\u00b9': '1', '\u00b2': '2', '\u00b3': '3', '\u207a': '+', '\u207b': '-' };
for (let d = 0; d <= 9; d++) if (d < 1 || d > 3) SUP[String.fromCharCode(0x2070 + d)] = String(d);
const SUB = {};
for (let d = 0; d <= 9; d++) SUB[String.fromCharCode(0x2080 + d)] = String(d);
const SYM = { '\u00d7': 'x', '\u03c0': 'pi', '\u2212': '-', '\u2264': '<=', '\u2265': '>=', '\u00b0': ' deg' };
export function asciiNotation(text) {
  // subscripts always braced: C_{2}H_{4}, never C_2H_4 (which reads as a template token)
  const run = (map, mark) => (m) => { const t = [...m].map((c) => map[c]).join(''); return t.length === 1 && mark === '^' ? mark + t : mark + '{' + t + '}'; };
  return String(text)
    .replace(new RegExp('[' + Object.keys(SUP).join('') + ']+', 'g'), run(SUP, '^'))
    .replace(new RegExp('[' + Object.keys(SUB).join('') + ']+', 'g'), run(SUB, '_'))
    .replace(/[\u00d7\u03c0\u2212\u2264\u2265\u00b0]/g, (c) => SYM[c])
    .replace(/[^\x00-\x7f]/g, '?');
}
const clip = (s, n) => { s = String(s || '').replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n - 3).replace(/\s+\S*$/, '') + '...' : s; };

/* ---------- explainers ---------- */
function explainerItems(root, problems) {
  const file = 'docs/explainers/approvals.json';
  if (!fs.existsSync(path.join(root, file))) return { items: [], skipped: 0 };
  const approvals = readJson(root, file).approvals || {};
  const coachDoc = readJson(root, 'docs/explainers/index.json');
  const coachIndex = coachDoc.items || {};
  const batches = Object.fromEntries(Object.entries(coachDoc.batches || {}).map(([k, b]) => [k, b.title]));
  const top = readJson(root, 'content/explainers/index.json');
  const entries = {};
  for (const [sec, f] of Object.entries(top.sections || {})) {
    for (const [qid, e] of Object.entries(readJson(root, 'content/explainers/' + f).items || {})) entries[qid] = { ...e, sec };
  }
  const items = []; let skipped = 0;
  for (const qid of Object.keys(approvals).sort()) {
    const a = approvals[qid];
    if (!a || typeof a.stamp !== 'string') { skipped++; continue; }
    const entry = entries[qid], coach = coachIndex[qid];
    if (!entry) { problems.push(qid + ': stamped but not in any content/explainers section index'); continue; }
    const sidecarRel = 'content/explainers/' + entry.file;
    const sidecarText = fs.readFileSync(path.join(root, sidecarRel));
    const sidecar = JSON.parse(sidecarText);
    const matches = sha256(sidecarText) === a.checksum;
    if (!matches) problems.push(qid + ': stamp checksum does not match the sidecar (the stamp is void)');
    const section = EXPLAINER_SECTION[entry.sec] || EXPLAINER_SECTION[coach && coach.section] || 'all';
    const pid = coach && coach.pid ? coach.pid : qid;
    items.push({
      id: pullIdOf(qid),
      qid,
      kind: 'explainer',
      section,
      title: SUBJECT[section] + ' explainer ' + pid + ': ' + asciiNotation(clip(sidecar.answer && sidecar.answer.text, 110)),
      ...(coach && coach.batch && batches[coach.batch] ? { group: batches[coach.batch] } : {}),
      place: '/tools/mock/full.html',
      placeNote: 'Full-length test review',
      stamp: a.stamp,
      at: a.at || null,
      source: 'docs/explainers/approvals.json',
      pullable: true,
      checksum: { algo: 'sha256', sidecar: a.checksum, matches },
      preview: { type: 'explainer', sidecar: '/' + sidecarRel },
    });
  }
  return { items, skipped };
}
/* ---------- stamps files ---------- */
function sectionOf(item, qidSections) {
  if (item.section && (SECTIONS.includes(item.section) || item.section === 'all')) return item.section;
  const m = /^retold:([a-z]+):/.exec(item.id || '');
  if (m && RETOLD[m[1]]) return m[1];
  if (item.qid && qidSections[item.qid]) return qidSections[item.qid];
  return 'all';
}
const isCorrection = (it) => it.pullable === false || /correction/i.test(String(it.kind || ''));
function stampItems(root, problems, qidSections) {
  const dir = path.join(root, STAMPS_DIR);
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const f of fs.readdirSync(dir).filter((n) => n.endsWith('.json')).sort()) {
    const rel = STAMPS_DIR + '/' + f;
    let doc;
    try { doc = readJson(root, rel); } catch (e) { problems.push(rel + ': not JSON'); continue; }
    const batch = doc.batch || f.replace(/\.json$/, '');
    for (const it of Array.isArray(doc.items) ? doc.items : []) {
      if (!it || typeof it.id !== 'string' || typeof it.stamp !== 'string') { problems.push(rel + ': an item without id or stamp'); continue; }
      const id = pullIdOf(it.id);
      if (!ID_RE.test(id)) { problems.push(rel + ': id ' + JSON.stringify(it.id) + ' cannot be pulled (shared/ace-pulls.js would drop it)'); continue; }
      const section = sectionOf({ ...it, id }, qidSections);
      out.push({
        id,
        ...(it.qid ? { qid: it.qid } : {}),
        kind: String(it.kind || 'item'),
        section,
        title: asciiNotation(clip(it.title || id, 160)),
        place: typeof it.place === 'string' ? it.place : null,
        stamp: it.stamp,
        at: it.at || null,
        source: rel,
        batch,
        pullable: !isCorrection(it),
        ...(it.change ? { change: String(it.change) } : {}),
        ...(it.pull ? { pullNote: String(it.pull) } : {}),
        ...(it.decision ? { decision: String(it.decision) } : {}),
        ...(it.checksum ? { checksum: it.checksum } : {}),
        preview: previewFor(it, id),
      });
    }
  }
  return out;
}
function previewFor(it, id) {
  const m = /^retold:([a-z]+):(\d+)(?::(\d+))?$/.exec(id);
  if (m && RETOLD[m[1]]) return { type: 'page', src: RETOLD[m[1]].place + '?night=' + m[2] + '&coach=1', scene: m[3] ? Number(m[3]) : null };
  const p = { type: 'text' };
  if (it.before != null) p.before = String(it.before);
  if (it.after != null) p.after = String(it.after);
  if (typeof it.place === 'string' && it.place.startsWith('/')) p.src = it.place;
  return p;
}
// A night that holds a stamped scene gets its own item, so the whole night can be pulled.
function nightItems(items) {
  const nights = new Map();
  for (const it of items) {
    const m = /^retold:([a-z]+):(\d+):\d+$/.exec(it.id);
    if (!m || !RETOLD[m[1]]) continue;
    const id = 'retold:' + m[1] + ':' + m[2];
    if (!nights.has(id)) nights.set(id, { course: m[1], night: m[2], scenes: [], stamp: it.stamp, at: it.at, batch: it.batch, source: it.source });
    nights.get(id).scenes.push(it.id);
  }
  return [...nights].map(([id, n]) => ({
    id,
    kind: 'retold-night',
    section: n.course,
    title: RETOLD[n.course].label + ', Retold night ' + n.night + ' (the whole night)',
    place: RETOLD[n.course].place + '?night=' + n.night,
    stamp: n.stamp,
    at: n.at || null,
    source: n.source,
    batch: n.batch,
    pullable: true,
    change: 'This night carries stamped changes (' + n.scenes.join(', ') + '). Pulling the night takes it out of the course list and out of Today until it is unpulled.',
    covers: n.scenes,
    preview: { type: 'page', src: RETOLD[n.course].place + '?night=' + n.night + '&coach=1', scene: null },
  }));
}

/* ---------- the index ---------- */
export function buildIndex(root = ROOT) {
  const problems = [];
  const ex = explainerItems(root, problems);
  const qidSections = Object.fromEntries(ex.items.map((x) => [x.qid, x.section]));
  const st = stampItems(root, problems, qidSections);
  const all = [...ex.items, ...st];
  all.push(...nightItems(st).filter((n) => !all.some((x) => x.id === n.id)));
  const seen = new Set();
  for (const it of all) { if (seen.has(it.id)) problems.push('duplicate id ' + it.id); seen.add(it.id); }
  all.sort((a, b) => (a.section === b.section ? 0 : SECTIONS.indexOf(a.section) - SECTIONS.indexOf(b.section)) || a.kind.localeCompare(b.kind) || a.id.localeCompare(b.id, 'en', { numeric: true }));
  const counts = {};
  for (const it of all) counts[it.section] = (counts[it.section] || 0) + 1;
  const index = {
    schema: 'ace.review-index/1',
    note: 'Generated by scripts/build-review-index.mjs from docs/explainers/approvals.json and content/approvals/stamps/*.json; never edit by hand. Every auto-approved item, pending Thomas review. The review function (netlify/functions/approvals.mjs) accepts pulls and comments only for these ids.',
    stamp: 'auto-approved 2026-10-30, pending Thomas review',
    counts: { total: all.length, pullable: all.filter((x) => x.pullable).length, bySection: counts },
    items: all,
  };
  return { index, problems, skipped: ex.skipped };
}
export const serialize = (index) => JSON.stringify(index, null, 1) + '\n';

/* ---------- the snapshot ---------- */
export function snapshotFrom(list, index, tag, now = new Date()) {
  const raw = Array.isArray(list) ? list : list && Array.isArray(list.pulls) ? list.pulls : list && Array.isArray(list.ids) ? list.ids : null;
  if (!raw) throw new Error('the live list is not a list of pulls');
  const known = new Set(index.items.filter((x) => x.pullable).map((x) => x.id));
  const ids = [...new Set(raw.map((x) => (x && typeof x === 'object' ? x.id : x)).filter((x) => typeof x === 'string' && ID_RE.test(x) && known.has(x)))].sort();
  return { v: 1, tag: tag || null, written: now.toISOString(), pulls: ids };
}
async function readList(from) {
  if (/^https:\/\//.test(from)) {
    const r = await fetch(from, { headers: { accept: 'application/json' }, cache: 'no-store' });
    if (!r.ok) throw new Error('HTTP ' + r.status + ' from ' + from);
    return r.json();
  }
  return JSON.parse(fs.readFileSync(path.resolve(from), 'utf8'));
}

async function main() {
  const args = process.argv.slice(2);
  const opt = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null; };
  const { index, problems, skipped } = buildIndex(ROOT);
  if (problems.length) { console.error('build-review-index: ' + problems.length + ' problem(s):\n  ' + problems.join('\n  ')); return 1; }
  const text = serialize(index);
  if (args.includes('--snapshot')) {
    const from = opt('--from');
    if (!from) { console.error('build-review-index: --snapshot needs --from URL|FILE (the live pull list)'); return 2; }
    const snap = snapshotFrom(await readList(from), index, opt('--tag'));
    fs.writeFileSync(path.join(ROOT, SNAPSHOT), JSON.stringify(snap, null, 2) + '\n');
    console.log('build-review-index: ' + SNAPSHOT + ' written (' + snap.pulls.length + ' pulled, tag ' + snap.tag + ')');
    return 0;
  }
  const out = path.join(ROOT, OUT);
  if (args.includes('--check')) {
    const cur = fs.existsSync(out) ? fs.readFileSync(out, 'utf8') : '';
    if (cur !== text) { console.error('build-review-index: ' + OUT + ' is stale; run node scripts/build-review-index.mjs'); return 1; }
    console.log('build-review-index: ' + OUT + ' is current (' + index.counts.total + ' items)');
    return 0;
  }
  fs.writeFileSync(out, text);
  console.log('build-review-index: ' + OUT + ' written: ' + index.counts.total + ' items (' + index.counts.pullable + ' pullable) ' + JSON.stringify(index.counts.bySection) + (skipped ? '; ' + skipped + ' approvals without an auto-approve stamp left out' : ''));
  return 0;
}
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) main().then((c) => process.exit(c), (e) => { console.error('build-review-index: ' + e.message); process.exit(1); });
