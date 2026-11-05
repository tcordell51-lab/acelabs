// G1-LITE: explainers inside today's full-length review (tools/mock/explainer-lite.js,
// the review code of tools/mock/full.js). Build spec rules 1.5, 1.7, 1.9 and batch G1-LITE.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const vm = require('node:vm');
const { openPage, closeAll, ROOT, read, sleep } = require('./lite-harness.js');
test.after(closeAll);

const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');
const json = (rel) => JSON.parse(read(rel));
const APPROVALS = json('docs/explainers/approvals.json');
const BANK_SRC = read('tools/mock/data/full-mocks.js');
const OVERRIDES = json('content/explainers/why-overrides.json');
const FIXTURE = json('tests/player/lite-fixtures/classic-attempt.json');
// an option letter or index pointer inside an explanation (the CONTENT-FIX test's pattern, plus
// "answer B", "(B) is", "B is correct" and the like)
const LETTER = /\b(?:options?|choices?|keyed option|opt|answer)\s*\(?[A-E]\)?(?![\w'-])|\bcorrect\s*=\s*\d|\bindex \d\b|(?:^|\s)\([A-E]\)(?![-\w])|(?:^|[.;,] )[A-E] (?:is|n-|tert|ethyl|iso)\b|\b[A-E] is (?:the )?(?:correct|right|answer|key)\b|\bpath-[A-E]\b/;

const MOCK = (() => { const c = { window: {} }; vm.createContext(c); vm.runInContext(BANK_SRC, c); return c.window.ACE_FULL_MOCKS.mocks; })();
const FULL_1 = MOCK.find((m) => m.id === 'FULL_1');
const SONS = [...FULL_1.sections.bio, ...FULL_1.sections.gc, ...FULL_1.sections.ochem];
const sonsIndex = (id) => SONS.findIndex((x) => x.id === id);

// a finished FULL_1 attempt; every science question left open (so each is listed) unless set
function attempt(id, mockId = 'FULL_1', sons = null) {
  const a = { sons: sons || new Array(100).fill(null), pat: new Array(90).fill(null), rc: new Array(50).fill(null), qr: new Array(40).fill(null) };
  return { id, mockId, ts: 1, answers: a, spent: {}, elapsed: { sons: 0, pat: 0, rc: 0, qr: 0, brk: 0 }, done: { sons: {}, pat: {}, rc: {}, qr: {} }, record: { testId: mockId, testName: 'Full-Length Test', ts: 1, totalCorrect: 0, totalQs: 280, sections: {}, subjects: {}, breakSec: 0 } };
}
// open the Natural Sciences review of a FULL_1 attempt and return the card of one item
async function cardFor(itemId, opts = {}) {
  const page = await openPage(Object.assign({ attempts: [attempt('fm-t', opts.mockId || 'FULL_1', opts.sons)], configure: Object.assign({ fetchTimeoutMs: 300 }, opts.configure || {}) }, opts));
  await page.openSaved('fm-t');
  await page.openSection('sons');
  const cards = await page.decided('sons');
  const qid = 'fm:' + itemId;
  const card = cards.find((c) => c.getAttribute('data-lite-qid') === qid) || null;
  return { page, card, cards };
}
const bankWhy = (id) => SONS.find((x) => x.id === id).why;
const whyShown = (card) => { const w = card.querySelector('.why'); return w && !w.hidden ? w.textContent : null; };
const indexFile = (sec) => 'content/explainers/index-' + sec + '.json';
function withIndex(sec, qid, patch) {
  const ix = json(indexFile(sec));
  Object.assign(ix.items[qid], patch);
  return { [indexFile(sec)]: JSON.stringify(ix) };
}
function withApprovals(fn) {
  const ap = JSON.parse(JSON.stringify(APPROVALS));
  fn(ap.approvals);
  return { 'docs/explainers/approvals.json': JSON.stringify(ap) };
}
const BIO = 'bio:BIO_d036';               // Full-Length Test 1, Biology question 7, stamped
const BIO_Q = 'fm:' + BIO;
const BIO_FILE = 'content/explainers/' + json(indexFile('bio')).items[BIO_Q].file;
const HASH_ID = 'generated:gc-ph#14hbxw7'; // a stamped qid holding '#'

test('the pull id of an explainer: explainer:<qid> with every # turned into .', async () => {
  const page = await openPage({});
  const A = page.window.AceExplainerLite;
  assert.equal(A.pullId('fm:bio:BIO_d036'), 'explainer:fm:bio:BIO_d036');
  assert.equal(A.pullId('fm:generated:gc-ph#14hbxw7'), 'explainer:fm:generated:gc-ph.14hbxw7');
  assert.equal(A.pullId('pat:F20261001:37'), 'explainer:pat:F20261001:37');
  // every stamped qid maps to an id shared/ace-pulls.js accepts
  const ID = /^[A-Za-z0-9][A-Za-z0-9:._\/-]{0,199}$/;
  for (const q of Object.keys(APPROVALS.approvals)) assert.ok(ID.test(A.pullId(q)), q);
  page.close();
});

test('a stamped item renders its explainer: picture first, steps, trap cards, Lock it in', async () => {
  const { page, card, cards } = await cardFor(BIO);
  assert.equal(card.getAttribute('data-lite'), 'explainer');
  const box = card.querySelector('section.lite');
  assert.ok(box && !box.classList.contains('is-loading'));
  const kids = [...box.children].map((n) => n.className || n.tagName);
  assert.equal(kids[0], 'lite-vis', 'the picture comes first');
  assert.ok(box.querySelector('.lite-vis figure.vis'), 'the picture drew');
  const order = ['lite-vis', 'lite-steps', 'lite-traps', 'lite-lock'].map((c) => kids.indexOf(c));
  assert.deepEqual([...order].sort((a, b) => a - b), order, 'picture, steps, traps, Lock it in: ' + kids.join(' '));
  const sc = JSON.parse(read(BIO_FILE));
  assert.equal(box.querySelectorAll('.lite-steps li').length, sc.steps.length);
  assert.equal(box.querySelectorAll('.lite-trap').length, 4, 'one card for each choice but the key');
  assert.ok(box.querySelector('.lite-lock').textContent.includes(sc.lockIt));
  assert.ok(card.querySelector('.why').hidden, 'the bank explanation steps aside');
  assert.ok(card.querySelector('.links'), 'the study links stay');
  // the answer mark is unchanged
  assert.match(card.querySelector('.a').textContent, /Correct: E\. Ascomycota/);
  // every listed Full-Length Test 1 science item with a stamp renders
  assert.equal(cards.filter((c) => c.getAttribute('data-lite') === 'explainer').length, 100);
  page.close();
});

test('the stamps also read from REVIEW\'s public review index', async () => {
  const items = Object.entries(APPROVALS.approvals).map(([qid, a]) => ({ id: 'explainer:' + qid.replace(/#/g, '.'), qid, kind: 'explainer', stamp: a.stamp, checksum: { algo: 'sha256', sidecar: a.checksum, matches: true } }));
  const ri = { schema: 'ace.review-index/1', items };
  let r = await cardFor(BIO, { files: { 'content/approvals/review-index.json': JSON.stringify(ri), 'docs/explainers/approvals.json': null } });
  assert.equal(r.card.getAttribute('data-lite'), 'explainer');
  r.page.close();
  const bad = JSON.parse(JSON.stringify(ri)); bad.items.find((x) => x.qid === BIO_Q).checksum.sidecar = 'f'.repeat(64);
  r = await cardFor(BIO, { files: { 'content/approvals/review-index.json': JSON.stringify(bad) } });
  assert.equal(r.card.getAttribute('data-lite-fallback'), 'checksum', 'the review index wins over approvals.json, and a mismatch falls back');
  r.page.close();
  const blocked = JSON.parse(JSON.stringify(ri)); blocked.items.find((x) => x.qid === BIO_Q).checksum.matches = false;
  r = await cardFor(BIO, { files: { 'content/approvals/review-index.json': JSON.stringify(blocked) } });
  assert.equal(r.card.getAttribute('data-lite-fallback'), 'blocked');
  r.page.close();
});

const FALLBACKS = [
  ['checksum mismatch', 'checksum', () => ({ [BIO_FILE]: read(BIO_FILE).replace('Ascomycota.', 'Ascomycota .') })],
  ['draft', 'draft', () => withIndex('bio', BIO_Q, { status: 'draft' })],
  ['held', 'held', () => withIndex('bio', BIO_Q, { status: 'held' })],
  ['reviewer-blocked', 'blocked', () => withIndex('bio', BIO_Q, { status: 'blocked' })],
  ['unstamped', 'unstamped', () => withApprovals((a) => { delete a[BIO_Q]; })],
  ['stamp without its text', 'unstamped', () => withApprovals((a) => { delete a[BIO_Q].stamp; })],
  ['stamp with a short checksum', 'unstamped', () => withApprovals((a) => { a[BIO_Q].checksum = a[BIO_Q].checksum.slice(0, 16); })],
  ['renderer source changed', 'renderer-changed', () => withApprovals((a) => { a[BIO_Q].files['tools/explain/visuals/core.js'] = '0'.repeat(64); })],
  ['not in the index', 'unpublished', () => { const ix = json(indexFile('bio')); delete ix.items[BIO_Q]; return { [indexFile('bio')]: JSON.stringify(ix) }; }],
  ['no stamps reachable', 'unstamped', () => ({ 'docs/explainers/approvals.json': null })],
  ['guard: the sidecar is for another question', 'guard', () => ({})]
];
for (const [name, reason, files] of FALLBACKS) {
  test('falls back to the bank explanation: ' + name, async () => {
    let f = files();
    if (reason === 'guard') {
      // a sidecar for another question, stamped as if it were this one
      const other = read(BIO_FILE).replace('"keyText":"Ascomycota"', '"keyText":"Basidiomycota"');
      f = Object.assign({ [BIO_FILE]: other }, withApprovals((a) => { a[BIO_Q].checksum = sha(Buffer.from(other)); }), withIndex('bio', BIO_Q, { checksum: sha(Buffer.from(other)).slice(0, 16) }));
    }
    const { page, card } = await cardFor(BIO, { files: f });
    assert.equal(card.getAttribute('data-lite-fallback'), reason);
    assert.equal(card.querySelector('section.lite'), null, 'no explainer');
    assert.equal(whyShown(card), bankWhy(BIO), 'the bank explanation shows');
    page.close();
  });
}

test('the picture is part of the stamp: a picture that does not draw falls back', async () => {
  const { stubVisuals } = require('./lite-harness.js');
  const page = await openPage({ attempts: [attempt('fm-t')], configure: { fetchTimeoutMs: 300 } });
  page.window.AceExplainerLite.configure({ base: 'http://localhost/', pullsTimeoutMs: 400, fetchTimeoutMs: 300, loadVisuals: () => stubVisuals(page.window, { fail: true }) });
  await page.openSaved('fm-t'); await page.openSection('sons');
  const card = (await page.decided('sons')).find((c) => c.getAttribute('data-lite-qid') === BIO_Q);
  assert.equal(card.getAttribute('data-lite-fallback'), 'picture');
  assert.equal(whyShown(card), bankWhy(BIO));
  page.close();
});

test('pulled falls back: from the live list, from the snapshot, and a # qid by its mapped id', async () => {
  let r = await cardFor(BIO, { live: ['explainer:' + BIO_Q] });
  assert.equal(r.card.getAttribute('data-lite-fallback'), 'pulled');
  assert.equal(whyShown(r.card), bankWhy(BIO));
  r.page.close();
  r = await cardFor(BIO, { files: { 'content/approvals/pulls-snapshot.json': JSON.stringify({ v: 1, tag: 'r1', pulls: ['explainer:' + BIO_Q] }) } });
  assert.equal(r.card.getAttribute('data-lite-fallback'), 'pulled');
  r.page.close();
  r = await cardFor(HASH_ID, { live: ['explainer:fm:generated:gc-ph.14hbxw7'] });
  assert.equal(r.card.getAttribute('data-lite-qid'), 'fm:' + HASH_ID);
  assert.equal(r.card.getAttribute('data-lite-fallback'), 'pulled', 'a pulled # qid falls back');
  assert.equal(whyShown(r.card), bankWhy(HASH_ID));
  // the raw qid with '#' is no pull id (ace-pulls drops it), so it pulls nothing
  const other = r.cards.find((c) => c.getAttribute('data-lite-qid') === BIO_Q);
  assert.equal(other.getAttribute('data-lite'), 'explainer', 'other items still render');
  r.page.close();
  r = await cardFor(HASH_ID, {});
  assert.equal(r.card.getAttribute('data-lite'), 'explainer', 'unpulled, the # qid renders');
  r.page.close();
});

test('pulls never fail open: unreadable lists hide every explainer', async () => {
  // no shared/ace-pulls.js on the page and no snapshot
  let r = await cardFor(BIO, { pulls: false, files: { 'content/approvals/pulls-snapshot.json': null } });
  assert.ok(r.cards.every((c) => c.getAttribute('data-lite-fallback') === 'pulled'), 'every item falls back');
  r.page.close();
  // ace-pulls.js present, but snapshot, live list and storage all fail
  r = await cardFor(BIO, { files: { 'content/approvals/pulls-snapshot.json': null } });
  assert.ok(r.cards.every((c) => c.getAttribute('data-lite-fallback') === 'pulled'));
  r.page.close();
  // no ace-pulls.js, but the snapshot is there: it applies
  r = await cardFor(BIO, { pulls: false, files: { 'content/approvals/pulls-snapshot.json': JSON.stringify({ pulls: ['explainer:' + BIO_Q] }) } });
  assert.equal(r.card.getAttribute('data-lite-fallback'), 'pulled');
  assert.equal(r.cards.find((c) => c.getAttribute('data-lite-qid') !== BIO_Q).getAttribute('data-lite'), 'explainer');
  r.page.close();
});

test('a pull that lands after the explainer showed puts the bank explanation back', async () => {
  const { page, card } = await cardFor(BIO, {});
  assert.equal(card.getAttribute('data-lite'), 'explainer');
  page.window.sessionStorage.removeItem('acelabs.v1.pulls');
  page.window.fetch = ((orig) => async (u) => (String(u).includes('/.netlify/functions/approvals') ? { ok: true, json: async () => ({ pulls: ['explainer:' + BIO_Q] }) } : orig(u)))(page.window.fetch);
  await page.window.AcePulls.refresh();
  await sleep(20);
  assert.equal(card.getAttribute('data-lite-fallback'), 'pulled');
  assert.equal(card.querySelector('section.lite'), null);
  assert.equal(whyShown(card), bankWhy(BIO));
  page.close();
});

test('an open key dispute: Key under review instead of the answer mark, out of the raw count', async () => {
  // the student matched the bank key on this item, so before the dispute it counted as correct
  const sons = new Array(100).fill(null);
  const i = sonsIndex(BIO);
  sons[i] = SONS[i].correct;
  const base = await cardFor(BIO, { sons });
  const card0 = base.page.doc.querySelector('#report .sec-card').textContent;
  assert.match(card0, /^Natural Sciences1 \/ 100/);
  assert.equal(base.card, null, 'not listed while undisputed and correct');
  base.page.close();
  const { page, card } = await cardFor(BIO, { sons, configure: { disputes: [BIO_Q] } });
  const doc = page.doc;
  assert.match(doc.querySelector('#report .sec-card').textContent, /^Natural Sciences0 \/ 99/, 'left out of the section count');
  assert.match(doc.querySelector('#report .tbl tbody tr').textContent, /^Biology0 \/ 39/, 'and the subject count');
  // the headline adds up the shown counts (the PAT engine is not loaded here, so PAT counts 0 of 0)
  const shown = [...doc.querySelectorAll('#report .sec-card .v')].map((v) => v.textContent.split(' / ').map(Number));
  const sum = shown.reduce((a, [c, n]) => [a[0] + c, a[1] + n], [0, 0]);
  assert.equal(sum[1], 189, 'Natural Sciences 99 + RC 50 + QR 40');
  assert.match(doc.querySelector('.big-line').textContent, new RegExp('You answered ' + sum[0] + ' of ' + sum[1] + ' '));
  assert.match(doc.getElementById('report').textContent, /1 question has its answer key under review/);
  assert.ok(card, 'the disputed item is listed');
  assert.match(card.querySelector('.a').textContent, /Key under review/);
  assert.doesNotMatch(card.querySelector('.a').textContent, /Correct:/, 'no answer mark');
  assert.equal(card.getAttribute('data-lite-fallback'), 'dispute', 'its explainer is held');
  assert.equal(whyShown(card), bankWhy(BIO));
  // the saved record is untouched
  assert.equal(JSON.parse(page.window.localStorage.getItem('acelabs.fullmock.v1.attempts'))[0].record.totalQs, 280);
  page.close();
});

test('the embedded dispute list equals the open entries of docs/explainers/key-disputes.json', async () => {
  const kd = json('docs/explainers/key-disputes.json');
  const open = (kd.open || []).filter((d) => d.status !== 'resolved').map((d) => d.qid).sort();
  const page = await openPage({});
  assert.deepEqual([...page.window.AceExplainerLite.OPEN_KEY_DISPUTES].sort(), open);
  page.close();
});

test('the OChem display overrides still apply wherever the bank explanation shows', async () => {
  const ids = Object.keys(OVERRIDES.overrides).map((k) => k.slice(3)).filter((id) => sonsIndex(id) >= 0);
  assert.ok(ids.length >= 10, 'Full-Length Test 1 holds overridden items: ' + ids.length);
  // explainers pulled: every overridden item shows its override, never the stale bank text
  const live = ids.map((id) => 'explainer:fm:' + id.replace(/#/g, '.'));
  const { page, cards } = await cardFor(ids[0], { live });
  for (const id of ids) {
    const card = cards.find((c) => c.getAttribute('data-lite-qid') === 'fm:' + id);
    assert.equal(card.getAttribute('data-lite-fallback'), 'pulled', id);
    assert.equal(whyShown(card), OVERRIDES.overrides['fm:' + id].why, id + ' shows its override');
  }
  page.close();
  // not pulled: the stamped explainer shows, and the override is what stands behind it
  const r = await cardFor(ids[0], {});
  assert.equal(r.card.getAttribute('data-lite'), 'explainer');
  assert.equal(r.card.querySelector('.why').textContent, OVERRIDES.overrides['fm:' + ids[0]].why);
  r.page.close();
});

test('other forms keep the bank explanation (explainers are Full-Length Test 1 only)', async () => {
  const id = MOCK[1].sections.bio[0].id;
  const page = await openPage({ attempts: [attempt('fm-t', 'FULL_2')] });
  await page.openSaved('fm-t'); await page.openSection('sons'); await sleep(200);
  const cards = [...page.doc.querySelectorAll('.miss')];
  assert.ok(cards.length > 50);
  assert.ok(cards.every((c) => !c.hasAttribute('data-lite') && !c.hasAttribute('data-lite-qid')), 'no explainer on ' + id);
  page.close();
});

test('no explainer text cites an option letter', async () => {
  // every stamped sidecar, every field a student reads
  const files = [];
  const walk = (d) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else if (e.name.endsWith('.json') && !/^index|families|why-overrides/.test(e.name)) files.push(p); } };
  walk(path.join(ROOT, 'content/explainers'));
  let n = 0;
  for (const f of files) {
    const sc = JSON.parse(fs.readFileSync(f, 'utf8'));
    if (!APPROVALS.approvals[sc.qid]) continue;
    n++;
    const texts = [sc.answer && sc.answer.line, ...(sc.steps || []), sc.lockIt, sc.hook, ...(sc.choices || []).flatMap((c) => [c.note, c.trap, c.display])].filter(Boolean);
    for (const t of texts) assert.ok(!LETTER.test(t), sc.qid + ': ' + (t.match(LETTER) || [''])[0] + ' in "' + t + '"');
  }
  assert.ok(n >= 180, 'stamped sidecars read: ' + n);
  // and the rendered review: the explainer's words (the picture keeps the marks it was reviewed with)
  const sons = new Array(100).fill(null).map((_, i) => (SONS[i].correct + 1) % 5);   // a pick on every item
  const page = await openPage({ attempts: [attempt('fm-t', 'FULL_1', sons)], configure: { fetchTimeoutMs: 300 } });
  await page.openSaved('fm-t');
  for (const s of ['sons', 'rc', 'qr']) { await page.openSection(s); await page.decided(s); }
  const boxes = [...page.doc.querySelectorAll('section.lite')];
  assert.ok(boxes.length >= 180, 'explainers rendered: ' + boxes.length);
  for (const b of boxes) {
    const c = b.cloneNode(true);
    c.querySelectorAll('.lite-vis').forEach((x) => x.remove());
    const words = c.textContent;
    assert.ok(!LETTER.test(words), b.closest('.miss').getAttribute('data-lite-qid') + ': ' + (words.match(LETTER) || [''])[0]);
    assert.ok(!/(?:^|[^A-Za-z])[A-E]\.\s/.test([...c.querySelectorAll('.lite-trap-choice')].map((x) => x.textContent).join(' | ')), 'trap cards name choices by content');
  }
  // the pick leads the trap cards
  const first = boxes[0].querySelector('.lite-trap');
  assert.ok(first.classList.contains('is-pick') && /Your pick/.test(first.textContent));
  page.close();
});

test('a classic attempt saved before the release resumes and scores as before (seeded fixture)', { timeout: 120000 }, async () => {
  const F = FIXTURE, E = F.expected;
  assert.equal(F.made, 'fdf0e4e');
  const page = await openPage({ pat: true, attempts: F.attempts, active: F.active, configure: { fetchTimeoutMs: 300 } });
  const doc = page.doc;
  // the start screen offers the same resume and lists the saved report
  assert.ok(doc.getElementById('resumeBtn'), 'resume offered');
  assert.ok(doc.querySelector('[data-att="fm-classic1"]'), 'saved report listed');
  await page.openSaved('fm-classic1', 200);
  const view = () => ({
    cards: [...doc.querySelectorAll('#report .sec-card')].map((c) => c.textContent),
    subjects: [...doc.querySelector('#report .tbl').querySelectorAll('tbody tr')].map((r) => r.textContent),
    summaries: [...doc.querySelectorAll('details.sec summary')].map((s) => s.textContent),
    bigLine: doc.querySelector('.big-line').textContent
  });
  assert.deepEqual(view(), E.savedReport, 'the saved report scores exactly as before');
  // the in-flight attempt resumes where it stopped and ends with the same record
  doc.getElementById('toList').dispatchEvent(new page.window.MouseEvent('click', { bubbles: true, cancelable: true }));
  await sleep(50);
  doc.getElementById('resumeBtn').click();
  for (let i = 0; i < 600 && !doc.getElementById('pmTimer'); i++) await sleep(25);
  const st = page.window.__fullMock.state();
  assert.deepEqual({ at: st.at, sec: st.sec, idx: st.idx, n: page.window.__fullMock.items('qr').length, head: doc.getElementById('pm').textContent.slice(0, 40) }, E.resumed);
  assert.deepEqual(JSON.parse(JSON.stringify(st.answers)), F.active.answers, 'the saved answers come back unchanged');
  page.window.__fullMock.endSection();
  await sleep(100);
  const rec = JSON.parse(page.window.localStorage.getItem('acelabs.fullmock.v1.attempts'))[0].record;
  delete rec.ts;
  // QR time is the one wall-clock field (the clock ran while the PAT figures rebuilt)
  const want = JSON.parse(JSON.stringify(E.record));
  assert.ok(rec.sections.qr.timeSec >= F.active.elapsed.qr && rec.sections.qr.timeSec < F.active.elapsed.qr + 60);
  rec.sections.qr.timeSec = want.sections.qr.timeSec = 0;
  assert.deepEqual(rec, want, 'the record is the same');
  const after = view();
  const noTime = (c) => c.replace(/, \d+m \d+s of/, ', of');
  assert.deepEqual(after.cards.map(noTime), E.reportAfterFinish.cards.map(noTime));
  assert.deepEqual(after.subjects, E.reportAfterFinish.subjects);
  assert.equal(JSON.parse(page.window.localStorage.getItem('al:mockHistory')).length, E.historyLen);
  assert.equal(page.window.localStorage.getItem('acelabs.fullmock.v1.active'), null, 'the in-flight attempt is closed out');
  page.close();
});

test('no new localStorage key, and the frozen files are untouched', () => {
  const src = read('tools/mock/explainer-lite.js');
  assert.doesNotMatch(src, /localStorage|sessionStorage/, 'explainer-lite.js keeps nothing on the device');
  assert.equal(sha(BANK_SRC), OVERRIDES.bank.sha256, 'the bank file is unchanged');
});
