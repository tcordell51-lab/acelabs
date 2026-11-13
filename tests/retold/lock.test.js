/* RET-G, the faded lock (OS-24): the next scene is drawn sharp on arrival, and
   only its commit waits for the scene before it. Every night stays listed. */
const test = require('node:test');
const assert = require('node:assert/strict');
const { COURSES, source, load } = require('./harness.cjs');

for (const [dir, c] of Object.entries(COURSES)) {
  test(`${dir}: the lock style is gone from the stylesheet`, () => {
    const css = source(dir).match(/<style>[\s\S]*?<\/style>/g).join('\n');
    assert.doesNotMatch(css, /\.scene\.locked\s*\{/, 'no rule styles a locked scene');
    assert.doesNotMatch(css, /grayscale\(/, 'nothing is drawn in grayscale');
  });

  test(`${dir}: night 1, a fresh student: the next scene is sharp, its commit waits`, async () => {
    const p = load(dir, '?night=1');
    try {
      await p.ready();
      const sc = p.scenes();
      assert.ok(sc.length >= 2, 'the night has scenes');
      const next = sc[1];
      assert.ok(next.classList.contains('locked'), 'scene 2 is still waiting on scene 1');
      const st = p.w.getComputedStyle(next);
      assert.notEqual(st.opacity, '0.35');
      assert.ok(st.opacity === '' || st.opacity === '1', 'drawn at full strength, got ' + st.opacity);
      assert.ok(!st.filter || st.filter === 'none', 'no filter, got ' + st.filter);
      assert.notEqual(st.pointerEvents, 'none', 'the scene itself is not frozen');
      assert.ok(next.querySelector('.scene-title').textContent.trim(), 'its title shows');
      assert.ok(next.querySelector('.say').textContent.trim().length > 40, 'its words show');
      /* the commit gate */
      assert.ok(sc[0].querySelectorAll('button.opt').length >= 2, 'scene 1 asks its question');
      for (let i = 1; i < sc.length; i++) assert.equal(sc[i].querySelectorAll('button.opt').length, 0, `scene ${i + 1} cannot be committed yet`);
      /* commit scene 1, continue: scene 2 opens its question, scene 3 still waits */
      sc[0].querySelector('button.opt').click();
      const cont = [...sc[0].querySelectorAll('button.reveal-btn')].find((b) => b.textContent === 'CONTINUE');
      assert.ok(cont, 'a continue button after the commit');
      cont.click();
      const after = p.scenes();
      assert.ok(after[1].querySelectorAll('button.opt').length >= 2, 'scene 2 can be committed now');
      if (after[2]) assert.equal(after[2].querySelectorAll('button.opt').length, 0, 'scene 3 still waits');
      assert.deepEqual(p.errors, []);
    } finally { p.close(); }
  });

  test(`${dir}: every night is listed, on the front door and under a night`, async () => {
    const all = Array.from({ length: c.nights }, (_, i) => i + 1);
    const home = load(dir, '');
    try {
      await home.ready();
      assert.deepEqual(home.listed('#homeList'), all);
    } finally { home.close(); }
    const night = load(dir, '?night=2');
    try {
      await night.ready();
      assert.deepEqual(night.listed('#syllList'), all);
      assert.deepEqual(night.errors, []);
    } finally { night.close(); }
  });
}
