// CONTENT-FIX: display overrides for full-length mock explanations
// (content/explainers/why-overrides.json). The review screen shows the override,
// the bank file is untouched, and a bank edit falls back to the bank's own text.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const { JSDOM } = require('jsdom');

const ROOT = path.resolve(__dirname, '..', '..');
const BANK = path.join(ROOT, 'tools/mock/data/full-mocks.js');
const DOC_PATH = path.join(ROOT, 'content/explainers/why-overrides.json');
const doc = JSON.parse(fs.readFileSync(DOC_PATH, 'utf8'));
const bankSrc = fs.readFileSync(BANK, 'utf8');
const sha = (s) => crypto.createHash('sha256').update(s).digest('hex');
const api = require(path.join(ROOT, 'tools/mock/why-overrides.js'));

function bankItems() {
  const ctx = { window: {} }; vm.createContext(ctx); vm.runInContext(bankSrc, ctx);
  const out = {};
  for (const m of ctx.window.ACE_FULL_MOCKS.mocks) for (const [sec, arr] of Object.entries(m.sections)) {
    if (!Array.isArray(arr)) continue;
    arr.forEach((it, i) => { (out[it.id] = out[it.id] || []).push({ it, mock: m.id, sec, n: i + 1 }); });
  }
  return out;
}
// an option letter or index pointer inside an explanation (stereo descriptors such as (E)- are fine)
const LETTER = /\b(?:options?|choices?|keyed option|opt)\s*\(?[A-E0-9]\b|\bcorrect\s*=\s*\d|\bindex \d\b|(?:^|\s)\([A-E]\)(?![-\w])|(?:^|[.;,] )[A-E] (?:is|n-|tert|ethyl|iso)\b|\bpath-[A-E]\b/i;

test('the bank file is unchanged except by approved, recorded edits: its sha256 matches the pin, and undoing each edit restores the hash before it', () => {
  assert.equal(sha(bankSrc), doc.bank.sha256);
  assert.equal(doc.bank.file, 'tools/mock/data/full-mocks.js');
  const kd = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/explainers/key-disputes.json'), 'utf8'));
  const edits = doc.bank.approvedEdits || [];
  let src = bankSrc;
  for (const e of edits.slice().reverse()) {
    assert.equal(sha(src), e.sha256After, e.qid + ' hash after the edit');
    assert.ok(/^Thomas, \d{4}-\d{2}-\d{2}/.test(e.approvedBy) && e.reason.length > 40, e.qid + ' is approved by Thomas, with the reason');
    assert.deepEqual(Object.keys(e).sort(), ['approvedBy', 'commit', 'field', 'from', 'qid', 'reason', 'sha256After', 'sha256Before', 'to']);
    const after = JSON.stringify(e.field) + ':' + JSON.stringify(e.to);
    assert.equal(src.split(after).length, 2, e.qid + ' the edited value appears once');
    src = src.replace(after, JSON.stringify(e.field) + ':' + JSON.stringify(e.from));
    assert.equal(sha(src), e.sha256Before, e.qid + ': undoing the one recorded field restores the earlier bank exactly');
    const r = (kd.resolved || []).find((x) => x.qid === e.qid);
    assert.ok(r && r.status === 'resolved' && /^Thomas/.test(r.resolution), e.qid + ' has a resolved key dispute ruled by Thomas');
  }
  // the hash every CONTENT-FIX override was first written against (content-fix to content-fix-3)
  assert.equal(sha(src), '5eceeb82674e52cb8ca2621381a2477a5e4be539673acb5625942d5cd03d669e');
});

test('72 overrides (31 OChem and 1 Bio with stale letters, OC-3, 14 found after the SA-C review, and 25 found by the residue scan), each matching its bank text', () => {
  const items = bankItems();
  const ids = Object.keys(doc.overrides);
  assert.equal(ids.length, 72);
  assert.equal(doc.count, 72);
  assert.equal(doc.stamp, 'auto-approved 2026-10-30, pending Thomas review');
  assert.equal(ids.filter((k) => k.startsWith('fm:organic:')).length, 71);
  for (const k of ids) {
    const o = doc.overrides[k];
    const hit = items[k.slice(3)];
    assert.ok(hit, k + ' is in the bank');
    const bankWhy = hit[0].it.why;
    assert.equal(o.bankWhyFnv1a, api.fnv(bankWhy), k + ' bank text still matches');
    assert.equal(o.bankWhySha256, sha(bankWhy), k + ' bank sha');
    assert.notEqual(o.why, bankWhy, k + ' changes something');
    assert.ok(!LETTER.test(o.why), k + ' cites no option letter: ' + (o.why.match(LETTER) || [''])[0]);
    assert.ok(/^[\x20-\x7e]*$/.test(o.why), k + ' is plain ASCII');
    assert.ok(!/\b(?:wrong|incorrect|failed)\b/i.test(o.why), k + ' has no verdict words');
    assert.ok(!/\bkeyed\b|\bsingle correct answer\b|\ball valid, unique\b/i.test(o.why), k + ' carries no internal review note');
  }
  assert.ok(!/Keyed correct=0 is right/.test(doc.overrides['fm:organic:oc-1juifa8'].why));
});

test('the override applies only while the bank text matches; anything else falls back to the bank', () => {
  api.load(doc);
  const items = bankItems();
  const id = 'organic:oc-dbrfsk';
  const bankWhy = items[id][0].it.why;
  assert.equal(api.why(id, bankWhy), doc.overrides['fm:' + id].why);
  assert.equal(api.why(id, bankWhy + ' edited'), bankWhy + ' edited');
  assert.equal(api.why('organic:not-there', 'bank text'), 'bank text');
  api.load(null);
  assert.equal(api.why(id, bankWhy), bankWhy);
});

test('an override held by an open key dispute is not shown; the dispute is recorded with both answers', () => {
  const kd = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/explainers/key-disputes.json'), 'utf8'));
  const items = bankItems();
  const open = (kd.open || []).filter((e) => e.status === 'open');
  for (const e of open) {
    assert.ok(e.qid.startsWith('fm:'), e.qid + ' uses the fm: qid');
    const hit = items[e.qid.slice(3)];
    assert.ok(hit, e.qid + ' is in the bank');
    assert.equal(hit[0].it.correct, e.servedKey, e.qid + ' servedKey is the bank key');
    assert.notEqual(e.suspectedKey, e.servedKey);
    assert.equal(hit[0].it.opts[e.servedKey], e.servedKeyText);
    assert.equal(hit[0].it.opts[e.suspectedKey], e.suspectedKeyText);
    assert.ok(e.reasoning && e.reasoning.length > 40);
    const o = doc.overrides[e.qid];
    if (o) assert.ok(o.held, e.qid + ' override is held while the dispute is open');
  }
  // oc-1jzd8nw: Thomas fixed the drawing (Nov 5); the dispute is resolved, the bank figure matches
  // the corrected structure, and its override shows again
  assert.ok(!open.some((e) => e.qid === 'fm:organic:oc-1jzd8nw'));
  const fixed = (kd.resolved || []).find((e) => e.qid === 'fm:organic:oc-1jzd8nw');
  assert.ok(fixed && fixed.status === 'resolved');
  assert.equal(items['organic:oc-1jzd8nw'][0].it.qs, fixed.correctedSmiles);
  assert.equal(items['organic:oc-1jzd8nw'][0].it.correct, fixed.servedKey);
  assert.ok(!doc.overrides['fm:organic:oc-1jzd8nw'].held);
  api.load(doc);
  const b1 = items['organic:oc-1jzd8nw'][0].it.why;
  assert.equal(api.why('organic:oc-1jzd8nw', b1), doc.overrides['fm:organic:oc-1jzd8nw'].why);
  for (const [k, o] of Object.entries(doc.overrides)) {
    if (!o.held) continue;
    const bankWhy = items[k.slice(3)][0].it.why;
    assert.equal(api.why(k.slice(3), bankWhy), bankWhy, k + ' held: the bank text shows');
    assert.ok(open.some((e) => e.qid === k), k + ' is held only for an open dispute');
  }
});

test('the full-length review screen renders the override, not the bank text', async () => {
  const html = fs.readFileSync(path.join(ROOT, 'tools/mock/full.html'), 'utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
  const dom = new JSDOM(html, { url: 'http://localhost/tools/mock/full.html', runScripts: 'outside-only', pretendToBeVisual: true });
  const w = dom.window;
  let fetched = null;
  w.fetch = (u) => { fetched = u; return Promise.resolve({ ok: true, json: () => Promise.resolve(JSON.parse(JSON.stringify(doc))) }); };
  // a finished FULL_1 attempt with every question left open, so every item is in the review
  const att = { id: 'fm-test', mockId: 'FULL_1', ts: 1, answers: { sons: new Array(100).fill(null), pat: new Array(90).fill(null), rc: new Array(50).fill(null), qr: new Array(40).fill(null) }, spent: {}, elapsed: { sons: 0, pat: 0, rc: 0, qr: 0, brk: 0 }, done: { sons: {}, pat: {}, rc: {}, qr: {} }, record: { testId: 'FULL_1', testName: 'Full-Length Test 1', ts: 1, totalCorrect: 0, totalQs: 280, sections: {}, subjects: {}, breakSec: 0 } };
  w.localStorage.setItem('acelabs.fullmock.v1.attempts', JSON.stringify([att]));
  w.eval(bankSrc);
  w.eval(fs.readFileSync(path.join(ROOT, 'tools/mock/why-overrides.js'), 'utf8'));
  w.eval(fs.readFileSync(path.join(ROOT, 'tools/mock/full.js'), 'utf8'));
  await w.ACE_WHY_OVERRIDES.ready;
  assert.equal(fetched, '/content/explainers/why-overrides.json');
  const open = w.document.querySelector('[data-att="fm-test"]');
  assert.ok(open, 'the saved report is listed');
  open.dispatchEvent(new w.MouseEvent('click', { bubbles: true, cancelable: true }));
  await new Promise((r) => setTimeout(r, 50));
  const det = w.document.querySelector('details[data-sec="sons"]');
  assert.ok(det, 'the Natural Sciences review is there');
  det.open = true; det.dispatchEvent(new w.Event('toggle'));
  const text = w.document.getElementById('report').textContent;
  const items = bankItems();
  const id = 'organic:oc-dbrfsk';
  assert.ok(text.includes(doc.overrides['fm:' + id].why), 'the override text is on the review screen');
  assert.ok(!text.includes(items[id][0].it.why), 'the bank text with the stale letter is not');
  assert.ok(!text.includes('(option A)'));
  // an item without an override still shows the bank explanation
  const plain = items['bio:BIO_g011'][0].it.why;
  assert.ok(text.includes(plain));
  assert.equal(sha(fs.readFileSync(BANK, 'utf8')), doc.bank.sha256, 'rendering did not touch the bank file');
  dom.window.close();
});
