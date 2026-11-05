// tests/review/no-student-data.test.js : the review page carries no student data and no business
// numbers (build spec REVIEW). Scans the review index, the key and snapshot files, the page's own
// files and every preview source (each explainer sidecar the index points at, the question each
// explainer preview reads from its bank, each Retold course page a preview frames) for:
//   - every first and last name on the roster (case-sensitive, whole words), read from
//     scratchpad/master-run/roster.json; the roster is never committed or copied into the repo,
//     and this part skips with a message when the file is not on this machine (set REVIEW_ROSTER
//     to point at another copy)
//   - email addresses, phone numbers, Airtable record ids (student ids), dollar amounts
// One structural exception, reported on every run: dollar amounts inside the question content of
// a QR explainer (its stem, choices and sidecar). They are bank word problems (interest, percent),
// not business numbers. Every other field of those items is still scanned for dollars.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '../..');
const ROSTER = process.env.REVIEW_ROSTER || '/tmp/claude-0/-home-user/c89d127b-3077-5064-be19-85d6e0c778e1/scratchpad/master-run/roster.json';
const INDEX_REL = 'content/approvals/review-index.json';
const INDEX = JSON.parse(fs.readFileSync(path.join(ROOT, INDEX_REL), 'utf8'));

const PATTERNS = {
  email: /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/g,
  phone: /(?<![\d.])(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}(?![\d.])/g,
  'student id': /(?<![A-Za-z0-9])rec[A-Za-z0-9]{14}(?![A-Za-z0-9])/g,
  dollar: /\$\s?\d[\d,]*(?:\.\d+)?/g,
};

function loadBanks() {
  const vm = require('node:vm');
  const win = (rel) => { const ctx = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(ROOT, rel), 'utf8'), ctx); return ctx.window; };
  return { fm: win('tools/mock/data/full-mocks.js').ACE_FULL_MOCKS, rc: win('tools/rc/data/bank.js').ACE_RC_BANK };
}
function bankQuestion(banks, b) {
  const loc = b.locator || {};
  if (b.file === 'tools/mock/data/full-mocks.js') {
    const m = banks.fm.mocks.find((x) => x.id === loc.mock);
    const it = m && (m.sections[loc.section] || []).find((x) => x.id === loc.id);
    return it && { stem: it.q, choices: it.opts };
  }
  if (b.file === 'tools/rc/data/bank.js') {
    const P = banks.rc.passages[loc.passage];
    const it = P && P.questions.find((x) => x.id === loc.id);
    return it && { stem: it.stem, choices: it.choices, title: P.title, paragraphs: P.paragraphs };
  }
  // PAT items are drawn shapes; their prompt and choice texts are in the sidecar (bank.choiceTexts)
  if (b.file === 'tools/pat/engine/pat-test.js') return { choices: b.choiceTexts };
  return null;
}
function sources() {
  const out = [];
  const add = (rel, text, opts = {}) => out.push({ rel, text, ...opts });
  // the index, item by item, so the QR question content can be told apart
  const { items, ...head } = INDEX;
  add(INDEX_REL + ' (head)', JSON.stringify(head));
  for (const it of items) {
    const qrQuestion = it.kind === 'explainer' && it.section === 'qr';
    const { preview, title, ...rest } = it;
    const { served, ...prevRest } = preview || {};
    add(INDEX_REL + ' ' + it.id, JSON.stringify(rest) + JSON.stringify(prevRest));
    add(INDEX_REL + ' ' + it.id + ' (question)', JSON.stringify(title) + JSON.stringify(served || null), { qrQuestion });
  }
  for (const rel of ['content/approvals/key-hash.json', 'content/approvals/pulls-snapshot.json', 'approvals/index.html', 'approvals/approvals.js', 'approvals/approvals.css', 'netlify/functions/approvals.mjs']) {
    add(rel, fs.readFileSync(path.join(ROOT, rel), 'utf8'));
  }
  // the question each explainer preview reads from its bank (stem, choices, and the RC passage)
  const banks = loadBanks();
  for (const it of items.filter((x) => x.kind === 'explainer')) {
    const sc = JSON.parse(fs.readFileSync(path.join(ROOT, it.preview.sidecar.replace(/^\//, '')), 'utf8'));
    const q = bankQuestion(banks, sc.bank || {});
    assert.ok(q, it.id + ': its question resolves from ' + (sc.bank && sc.bank.file));
    add(sc.bank.file + ' ' + it.id + ' (question)', JSON.stringify(q), { qrQuestion: it.section === 'qr' });
  }
  // each override preview: the override text and the bank explanation it replaces
  const ov = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/explainers/why-overrides.json'), 'utf8')).overrides || {};
  for (const it of items.filter((x) => x.preview && x.preview.type === 'override')) {
    const o = ov[it.preview.qid];
    assert.ok(o, it.id + ': its override exists');
    const id = it.preview.qid.split(':').slice(1).join(':');
    let bank = null;
    for (const m of banks.fm.mocks) for (const arr of Object.values(m.sections)) bank = bank || arr.find((y) => y.id === id) || null;
    add('content/explainers/why-overrides.json ' + it.id, JSON.stringify(o.why) + JSON.stringify(bank ? bank.why : null));
  }
  const seen = new Set();
  for (const it of items) {
    const p = it.preview || {};
    let rel = null, qrQuestion = false;
    if (p.sidecar) { rel = p.sidecar.replace(/^\//, ''); qrQuestion = it.kind === 'explainer' && it.section === 'qr'; }
    else if (p.type === 'page' && p.src) rel = p.src.split('?')[0].replace(/^\//, '').replace(/\/$/, '/index.html');
    if (!rel || seen.has(rel)) continue;
    seen.add(rel);
    add(rel, fs.readFileSync(path.join(ROOT, rel), 'utf8'), { qrQuestion });
  }
  return out;
}

test('no email, phone number, student id or dollar amount on the review page or its previews', () => {
  const hits = [], exempt = [];
  for (const s of sources()) {
    for (const [kind, re] of Object.entries(PATTERNS)) {
      const m = s.text.match(re);
      if (!m) continue;
      if (kind === 'dollar' && s.qrQuestion) { exempt.push(s.rel + ': ' + m.length); continue; }
      hits.push(s.rel + ': ' + kind + ' x' + m.length + ' (' + [...new Set(m)].slice(0, 3).join(', ') + ')');
    }
  }
  console.log('no-student-data: dollar amounts in QR question content (bank word problems, exempt by rule): ' + (exempt.length ? exempt.join('; ') : 'none'));
  assert.deepEqual(hits, [], hits.join('\n'));
});

test('no roster name on the review page or its previews (case-sensitive whole words)', (t) => {
  if (!fs.existsSync(ROSTER)) { t.skip('roster not on this machine (' + ROSTER + '): the name scan did not run'); return; }
  const roster = JSON.parse(fs.readFileSync(ROSTER, 'utf8'));
  const names = Array.isArray(roster) ? roster : roster.names;
  assert.ok(Array.isArray(names) && names.length > 0, 'roster has names');
  const tokens = [...new Set(names.flatMap((n) => String(n).split(/\s+/)).filter((x) => x.length >= 2))];
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const res = tokens.map((tok) => new RegExp('(?<![A-Za-z0-9])' + esc(tok) + '(?![A-Za-z0-9])', 'g'));
  const hits = [];
  let scanned = 0;
  for (const s of sources()) {
    scanned++;
    res.forEach((re, i) => { const m = s.text.match(re); if (m) hits.push(s.rel + ': roster name #' + (i + 1) + ' (' + tokens[i].length + ' letters) x' + m.length); });
  }
  console.log('no-student-data: ' + tokens.length + ' roster names over ' + scanned + ' sources, ' + hits.length + ' hit(s)');
  // the message names the source and the name's position on the roster, never the name itself
  assert.deepEqual(hits, [], hits.join('\n'));
});
