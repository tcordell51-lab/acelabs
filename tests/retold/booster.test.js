/* RET-G, the Booster lines (memo S7): the question-bank chapter names leave
   every line a student sees on Bio, GChem, OChem and QR, Retold: the night
   line ("in sync with your question bank: ..."), the continue card
   ("Question bank: ...") and the night lists ("QUESTION BANK: ..."). PAT and
   RC never named a bank chapter; their own focus labels stay. */
const test = require('node:test');
const assert = require('node:assert/strict');
const { COURSES, source, load } = require('./harness.cjs');

const BANK = ['bio-retold', 'gchem', 'organic', 'qr-retold'];

for (const dir of BANK) {
  test(`${dir}: no chapter name or "question bank:" line is shown`, async () => {
    const src = source(dir);
    assert.doesNotMatch(src, /in sync with your question bank/i);
    assert.doesNotMatch(src, /question bank: '\+/i, 'no line is built from the chapter name');
    assert.doesNotMatch(src, /\.booster\b/, 'the page never reads the chapter key');
    assert.doesNotMatch(src, /nx\.b\b/, 'the lists never read the chapter key');
    const home = load(dir, '');
    let names;
    try {
      await home.ready();
      names = Object.values(home.w.NIGHTS).filter(Boolean).map((n) => n.booster).filter(Boolean);
      assert.ok(names.length >= 10, 'the chapter key is still there for the search index');
      const cs = home.doc.querySelector('.cont .cs').textContent;
      assert.match(cs, /^\d+ scenes$/, 'the continue card counts scenes: ' + cs);
      for (const li of home.doc.querySelectorAll('#homeList li')) assert.doesNotMatch(li.textContent, /question bank/i);
    } finally { home.close(); }
    const night = load(dir, '?night=3');
    try {
      await night.ready();
      const line = night.doc.getElementById('nightLine').textContent;
      assert.match(line, /^Night 3 of 1[34]$/, line);
      for (const li of night.doc.querySelectorAll('#syllList li')) assert.doesNotMatch(li.textContent, /question bank/i);
      assert.equal(night.doc.querySelectorAll('.nsync').length, 0);
    } finally { night.close(); }
  });
}

for (const dir of Object.keys(COURSES).filter((d) => !BANK.includes(d))) {
  test(`${dir}: the focus labels stay`, async () => {
    const p = load(dir, '?night=2');
    try {
      await p.ready();
      assert.match(p.doc.getElementById('nightLine').textContent, /^Night 2 of 10 . \S/);
      assert.ok([...p.doc.querySelectorAll('#syllList .nsync')].every((s) => /^FOCUS: /.test(s.textContent)));
      assert.doesNotMatch(source(dir), /question bank: '\+/i);
    } finally { p.close(); }
  });
}
