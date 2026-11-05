/* RET-G, Bio night 1 (B-16): the figures of "The ladder of scales" (scene 2)
   and "The payoff" (scene 7) are off; their words and questions stay; every
   other figure on the night is untouched; the change is stamped and the stamp
   still matches what the page serves. */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { load, nights } = require('./harness.cjs');
const { OUT, STAMP, compute } = require('./stamp.cjs');

const OFF = [2, 7];

test('the night keeps seven scenes; only scenes 2 and 7 lose their figure', () => {
  const N = nights('bio-retold')[1];
  assert.equal(N.scenes.length, 7);
  N.scenes.forEach((sc, i) => {
    assert.ok(sc.walk && sc.teach && sc.q && sc.q.stem && sc.q.opts.length >= 2, `scene ${i + 1} keeps its words and question`);
    if (OFF.includes(i + 1)) {
      assert.equal(sc.svg, undefined, `scene ${i + 1} has no figure`);
      assert.equal(sc.redraw, true);
    } else {
      assert.ok(sc.svg || sc.anim || sc.tap, `scene ${i + 1} keeps its figure`);
      assert.equal(sc.redraw, undefined);
    }
  });
  assert.match(N.scenes[1].t, /^The ladder of scales/);
  assert.match(N.scenes[6].t, /^The payoff/);
});

for (const query of ['?night=1', '?night=1&mode=teach']) {
  test(`drawn (${query}): the two scenes show the line, the other five their figures`, async () => {
    const p = load('bio-retold', query);
    try {
      await p.ready();
      const sc = p.scenes();
      assert.equal(sc.length, 7);
      sc.forEach((el, i) => {
        const red = el.querySelector('.redraw');
        if (OFF.includes(i + 1)) {
          assert.equal(red && red.textContent, 'Pictures for this part are being redrawn.');
          assert.equal(el.querySelectorAll('svg').length, 0);
          assert.equal(el.querySelectorAll('.reveal-btn').length, 0, 'nothing to reveal');
        } else {
          assert.equal(red, null);
          assert.ok(el.querySelectorAll('svg, canvas, .anim-stage').length >= 1, `scene ${i + 1} draws its figure`);
        }
      });
      if (query === '?night=1') assert.ok(sc[0].querySelectorAll('button.opt').length >= 2);
      else assert.ok(sc[1].querySelector('.teachline').textContent.length > 20, 'the coach line stays');
      assert.deepEqual(p.errors, []);
    } finally { p.close(); }
  });
}

test('walking the night: scene 2 and scene 7 are still committed like any other', async () => {
  const p = load('bio-retold', '?night=1');
  try {
    await p.ready();
    const N = p.w.NIGHTS[1];
    for (let i = 0; i < 7; i++) {
      const el = p.scenes()[i];
      const right = [...el.querySelectorAll('button.opt')].find((b) => +b.dataset.k === N.scenes[i].q.correct);
      assert.ok(right, `scene ${i + 1} asks its question`);
      right.click();
      [...el.querySelectorAll('button.reveal-btn')].find((b) => b.textContent === 'CONTINUE').click();
    }
    assert.equal(p.doc.getElementById('gate').style.display, 'block', 'the night is walked');
    assert.deepEqual(p.errors, []);
  } finally { p.close(); }
});

test('the stamp file names both removals, auto-approved and pending review, and still matches', async () => {
  const onDisk = JSON.parse(fs.readFileSync(OUT, 'utf8'));
  assert.equal(onDisk.batch, 'RET-G');
  assert.deepEqual(onDisk.items.map((x) => x.id), ['retold:bio:1:2', 'retold:bio:1:7']);
  for (const it of onDisk.items) {
    assert.equal(it.stamp, STAMP);
    assert.equal(it.stamp, 'auto-approved 2026-10-30, pending Thomas review');
    assert.match(it.checksum.all, /^[0-9a-f]{64}$/);
  }
  assert.deepEqual(onDisk, await compute(), 'a change to the scene, its drawing or the renderer voids the stamp: re-review, then node tests/retold/stamp.cjs --write');
});
