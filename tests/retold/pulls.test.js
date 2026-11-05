/* RET-G, pulls on the course pages (shared/ace-pulls.js, B1.2t ids):
   retold:<section>:<night> leaves both night lists, retold:<section>:<night>:<scene>
   loses its figure to one line, ?coach=1 shows everything, and the approvals
   function answering 404 (REVIEW not landed yet) changes nothing a student sees. */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { ROOT, COURSES, KEY, LIVE, PULLS_TAG, source, load, tick } = require('./harness.cjs');

const LINE = 'Pictures for this part are being redrawn.';
const range = (n) => Array.from({ length: n }, (_, i) => i + 1);
const stored = (ids, snap = []) => ({ v: 1, at: Date.now(), ids, snap });
const without = (all, ...out) => all.filter((n) => !out.includes(n));

test('the pull ids use the section keys of shared/ace-index.js, one per course page', () => {
  const idx = fs.readFileSync(path.join(ROOT, 'shared/ace-index.js'), 'utf8');
  const courses = JSON.parse(idx.slice(idx.indexOf('{'), idx.lastIndexOf('}') + 1)).courses;
  for (const [dir, c] of Object.entries(COURSES)) {
    assert.equal(courses[c.sec].url, '/tools/' + dir + '/', dir);
    assert.ok(source(dir).includes("var PULL_SEC='" + c.sec + "'"), dir + ' pulls under ' + c.sec);
    const tags = source(dir).match(/<script src="\/shared\/ace-pulls\.js\?v=\d+"><\/script>/g) || [];
    assert.deepEqual(tags, [PULLS_TAG], dir + ' loads ace-pulls once, at its current version');
    assert.ok(source(dir).indexOf(PULLS_TAG) < source(dir).indexOf('var PULL_SEC='), dir + ' loads it before the course script');
  }
});

for (const [dir, c] of Object.entries(COURSES)) {
  const all = range(c.nights);

  test(`${dir}: the approvals function answers 404 and nothing changes`, async () => {
    const p = load(dir, '?night=1');
    try {
      const st = await p.ready();
      assert.equal(st.live, 'failed');
      assert.ok(p.calls.includes(LIVE), 'the live list was asked for');
      assert.deepEqual(p.errors, [], 'no error');
      assert.ok(p.scenes().length >= 2, 'the night renders');
      assert.equal(p.doc.querySelectorAll('.redraw').length, p.w.NIGHTS[1].scenes.filter((s) => s.redraw).length, 'no figure is pulled');
      assert.deepEqual(p.listed('#syllList'), all);
    } finally { p.close(); }
  });

  test(`${dir}: a pulled night leaves both lists and the next-night links`, async () => {
    const sec = c.sec;
    const home = load(dir, '', { local: stored(['retold:' + sec + ':1']), snap: { pulls: ['retold:' + sec + ':3'] } });
    try {
      await home.ready();
      assert.deepEqual(home.listed('#homeList'), without(all, 1, 3), 'stored and snapshot pulls both apply');
      const go = home.doc.querySelector('.cont a.go');
      assert.ok(go, 'the continue card');
      assert.equal(go.getAttribute('href'), '?night=2', 'it opens the first night that is not pulled');
      assert.match(home.doc.querySelector('.cont .ct').textContent, /^Night 2: /);
      assert.deepEqual(home.errors, []);
    } finally { home.close(); }
    const night = load(dir, '?night=2', { local: stored(['retold:' + sec + ':1', 'retold:' + sec + ':3']) });
    try {
      await night.ready();
      assert.deepEqual(night.listed('#syllList'), without(all, 1, 3));
      const nav = [...night.doc.querySelectorAll('#nightNav a')].map((a) => a.textContent);
      assert.deepEqual(nav, ['ALL NIGHTS', 'NEXT: NIGHT 4'], 'back skips night 1 (none left) and next skips night 3');
    } finally { night.close(); }
  });

  test(`${dir}: a pulled night opened by its link shows a short note, not the night`, async () => {
    const p = load(dir, '?night=2', { local: stored(['retold:' + c.sec + ':2']) });
    try {
      await p.ready();
      assert.equal(p.scenes().length, 1);
      assert.match(p.doc.getElementById('scenes').textContent, /This night is being redrawn\./);
      assert.equal(p.doc.querySelectorAll('#scenes button.opt').length, 0);
      assert.deepEqual(p.errors, []);
    } finally { p.close(); }
  });

  test(`${dir}: a pulled scene keeps its words and question and loses its figure`, async () => {
    const p = load(dir, '?night=1', { snap: { pulls: ['retold:' + c.sec + ':1:1'] } });
    try {
      await p.ready();
      await tick(5);
      const s1 = p.scenes()[0];
      const red = s1.querySelector('.redraw');
      assert.ok(red, 'the line is there');
      assert.equal(red.textContent, LINE);
      assert.equal(s1.querySelectorAll('svg, canvas, .anim-stage, .molrow').length, 0, 'no figure');
      assert.ok(s1.querySelector('.say').textContent.trim().length > 40, 'the words stay');
      assert.ok(s1.querySelectorAll('button.opt').length >= 2, 'the question stays');
      const s2 = p.scenes()[1];
      assert.equal(!!s2.querySelector('.redraw'), !!p.w.NIGHTS[1].scenes[1].redraw, 'scene 2 is not pulled by a scene 1 pull');
      assert.deepEqual(p.errors, []);
    } finally { p.close(); }
  });

  test(`${dir}: the coach view (?coach=1) lists every night and draws every figure`, async () => {
    const pulls = stored(['retold:' + c.sec + ':1', 'retold:' + c.sec + ':2:1', 'retold:' + c.sec + ':4']);
    const home = load(dir, '?coach=1', { local: pulls });
    try {
      await home.ready();
      assert.deepEqual(home.listed('#homeList'), all);
    } finally { home.close(); }
    const night = load(dir, '?night=2&coach=1', { local: pulls });
    try {
      await night.ready();
      assert.deepEqual(night.listed('#syllList'), all);
      assert.equal(night.scenes()[0].querySelector('.redraw'), null, 'the pulled figure shows for the coach');
      /* the coach view follows the links */
      const a = night.doc.querySelector('#nightNav a[href*="night=3"]');
      a.dispatchEvent(new night.w.MouseEvent('click', { bubbles: true, cancelable: true }));
      assert.match(a.getAttribute('href'), /coach=1/);
    } finally { night.close(); }
  });

  test(`${dir}: a pull that lands while the page is open applies at once`, async () => {
    let open;
    const gate = new Promise((r) => { open = r; });
    const p = load(dir, '?night=1', { live: { pulls: ['retold:' + c.sec + ':5', 'retold:' + c.sec + ':1:2'] }, liveGate: gate });
    try {
      assert.deepEqual(p.listed('#syllList'), all, 'nothing known yet');
      open();
      await p.ready();
      await tick(5);
      assert.deepEqual(p.listed('#syllList'), without(all, 5));
      const red = p.scenes()[1].querySelector('.redraw');
      assert.ok(red && red.textContent === LINE, 'scene 2 lost its figure');
      assert.equal(JSON.parse(p.w.localStorage.getItem(KEY)).ids.includes('retold:' + c.sec + ':5'), true, 'kept for the next page');
      assert.deepEqual(p.errors, []);
    } finally { p.close(); }
  });

  test(`${dir}: with ace-pulls missing, the list it last stored still applies (never fails open)`, async () => {
    const p = load(dir, '?night=2', { noPulls: true, local: stored(['retold:' + c.sec + ':6'], ['retold:' + c.sec + ':2:1']) });
    try {
      assert.equal(p.w.AcePulls, undefined);
      assert.deepEqual(p.listed('#syllList'), without(all, 6));
      assert.equal(p.scenes()[0].querySelector('.redraw').textContent, LINE);
      assert.deepEqual(p.errors, []);
    } finally { p.close(); }
  });
}
