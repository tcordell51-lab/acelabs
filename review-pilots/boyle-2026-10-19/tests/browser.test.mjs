/* Browser checks for the Boyle's law pilot (Playwright + Chromium, local only).
   Run: node --test review-pilots/boyle-2026-10-19/tests/browser.test.mjs
   Screenshots land in exports/screens/. */
import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { serve, launch, PILOT } from './harness.mjs';

const SHOTS = path.join(PILOT, 'exports', 'screens');
fs.mkdirSync(SHOTS, { recursive: true });

let server, url, browser;
const errors = [];
test.before(async () => { ({ server, url } = await serve()); browser = await launch(); });
test.after(async () => { await browser.close(); server.close(); });

async function open(opts = {}) {
  const ctx = await browser.newContext({ viewport: opts.viewport || { width: 1440, height: 1000 }, reducedMotion: opts.reducedMotion || 'no-preference' });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(url + 'index.html' + (opts.query || ''));
  await page.waitForFunction(() => window.__boyleReady === true);
  return { ctx, page };
}
const text = (page, sel) => page.locator(sel).innerText();
const readouts = async (page) => ({ v: await text(page, '#volume-value'), p: await text(page, '#pressure-value'), pv: await text(page, '#pv-value'), gauge: await page.locator('#gauge-readout').textContent() });

const SHARED_IDS = ['module-title', 'objective', 'scene', 'caption-band', 'play-pause', 'replay', 'step-back', 'step-forward', 'timeline', 'prediction', 'feedback', 'transfer', 'reset', 'model-assumptions', 'transcript'];
const OBJECT_IDS = ['cylinder', 'piston-head', 'gas-region', 'heat-bath', 'pressure-value', 'volume-value', 'temperature-fixed', 'amount-fixed', 'pv-value', 'pv-curve', 'current-point']
  .concat(Array.from({ length: 24 }, (_, i) => 'particle-' + String(i).padStart(2, '0')));

test('all shared and object IDs exist exactly once', async () => {
  const { ctx, page } = await open();
  for (const id of SHARED_IDS.concat(OBJECT_IDS)) assert.strictEqual(await page.locator('[id="' + id + '"]').count(), 1, id);
  assert.strictEqual(await page.locator('#particles circle').count(), 24);
  await ctx.close();
});

test('absolute-pressure labelling is visible', async () => {
  const { ctx, page } = await open();
  assert.ok(await page.locator('.abs-tag').isVisible());
  assert.match(await page.locator('#gauge').textContent(), /Absolute pressure/);
  await ctx.close();
});

test('presets give P = 4, 2, 1, 0.5 atm', async () => {
  const { ctx, page } = await open();
  await page.click('#reveal-toggle');
  for (const [V, P] of [['0.5', '4.00'], ['1', '2.00'], ['2', '1.00'], ['4', '0.50']]) {
    await page.click('.preset[data-v="' + V + '"]');
    const r = await readouts(page);
    assert.strictEqual(r.p, P + ' atm'); assert.strictEqual(r.gauge, P + ' atm'); assert.strictEqual(r.pv, '2.00 L·atm');
  }
  await ctx.close();
});

test('keyboard slider and preset buttons produce identical results', async () => {
  const { ctx, page } = await open();
  await page.click('#reveal-toggle');
  await page.focus('#volume-slider');
  for (let i = 0; i < 20; i++) await page.keyboard.press('ArrowLeft'); // 2.00 -> 1.00 in 0.05 steps
  const viaKeys = await readouts(page);
  const snapKeys = await page.evaluate(() => window.__boyle.snapshot().state);
  await page.click('.preset[data-v="2"]');
  await page.click('.preset[data-v="1"]');
  const viaPreset = await readouts(page);
  const snapPreset = await page.evaluate(() => window.__boyle.snapshot().state);
  assert.deepStrictEqual(viaKeys, viaPreset);
  assert.deepStrictEqual(snapKeys, snapPreset);
  assert.strictEqual(viaKeys.v, '1.00 L');
  await page.focus('#volume-slider');
  await page.keyboard.press('Home'); assert.strictEqual(await text(page, '#volume-value'), '0.50 L');
  await page.keyboard.press('End'); assert.strictEqual(await text(page, '#volume-value'), '4.00 L');
  assert.strictEqual(await page.getAttribute('#volume-slider', 'aria-valuetext'), '4.00 liters');
  assert.strictEqual(await page.getAttribute('#volume-slider', 'min'), '0.5');
  assert.strictEqual(await page.getAttribute('#volume-slider', 'max'), '4');
  await ctx.close();
});

test('numeric input rejects zero, negative, NaN and out-of-range; accepts and snaps valid input', async () => {
  const { ctx, page } = await open();
  await page.click('.preset[data-v="2"]');
  for (const bad of ['0', '-1', 'abc', '4.5', '0.2', '']) {
    await page.fill('#volume-input', '');
    if (bad) await page.locator('#volume-input').pressSequentially(bad);
    await page.click('#volume-set');
    assert.strictEqual(await text(page, '#volume-value'), '2.00 L', 'unchanged after ' + bad);
    assert.strictEqual(await page.getAttribute('#volume-input', 'aria-invalid'), 'true', 'flagged ' + bad);
  }
  await page.fill('#volume-input', '1.23');
  await page.keyboard.press('Enter');
  assert.strictEqual(await text(page, '#volume-value'), '1.25 L');
  assert.match(await text(page, '#volume-error'), /Rounded/);
  await page.fill('#volume-input', '0.8');
  await page.click('#volume-set');
  await page.click('#reveal-toggle');
  assert.strictEqual(await text(page, '#pressure-value'), '2.50 atm');
  await ctx.close();
});

test('pressure starts hidden; reveal toggles gauge, value and graph point', async () => {
  const { ctx, page } = await open();
  await page.click('.preset[data-v="1"]');
  assert.strictEqual(await text(page, '#pressure-value'), 'hidden');
  assert.strictEqual(await page.locator('#current-point').isVisible(), false);
  assert.strictEqual(await page.locator('#gauge-needle').isVisible(), false);
  await page.click('#reveal-toggle');
  assert.strictEqual(await page.getAttribute('#reveal-toggle', 'aria-pressed'), 'true');
  assert.strictEqual(await text(page, '#pressure-value'), '2.00 atm');
  assert.ok(await page.locator('#current-point').isVisible());
  await ctx.close();
});

test('graph toggle: P-vs-V curve and linear P-vs-1/V with correct axis label', async () => {
  const { ctx, page } = await open();
  await page.click('.preset[data-v="2"]');
  const curved = await page.getAttribute('#pv-curve', 'd');
  assert.ok(curved.split('L').length > 300, 'P-vs-V is a sampled curve');
  await page.check('input[name="graph-mode"][value="P-vs-invV"]');
  const line = await page.getAttribute('#pv-curve', 'd');
  assert.strictEqual(line.split('L').length, 2, 'P-vs-1/V is one straight segment');
  assert.match(await page.locator('#graph-axes').textContent(), /1\/V \(L−1\)/);
  assert.strictEqual(await page.locator('#graph-title').textContent(), 'Pressure versus 1/V');
  await ctx.close();
});

test('dot count, radius and speeds unchanged across volumes in the page', async () => {
  const { ctx, page } = await open();
  const shots = [];
  for (const V of ['4', '0.5', '2']) {
    await page.click('.preset[data-v="' + V + '"]');
    await page.waitForTimeout(300);
    shots.push(await page.evaluate(() => window.__boyle.snapshot()));
  }
  const sig = (s) => s.particles.map((p) => p.r + ':' + p.speed.toFixed(9)).join('|');
  for (const s of shots) {
    assert.strictEqual(s.particles.length, 24);
    assert.strictEqual(sig(s), sig(shots[0]));
    for (const p of s.particles) assert.ok(p.y - p.r >= s.top - 1e-6, 'enclosed');
  }
  const radii = await page.$$eval('#particles circle', (cs) => [...new Set(cs.map((c) => c.getAttribute('r')))]);
  assert.deepStrictEqual(radii, ['9']);
  assert.strictEqual(await page.getAttribute('#speed-hist', 'data-hist'), await page.getAttribute('#speed-hist', 'data-hist'));
  await ctx.close();
});

test('prediction, transfer and leak feedback; replay keeps answers; reset clears them', async () => {
  const { ctx, page } = await open();
  await page.check('input[name="prediction"][value="0.50"]');
  await page.click('#prediction-check');
  assert.match(await text(page, '#feedback'), /halving volume doubles pressure/);
  await page.check('input[name="prediction"][value="2.00"]');
  await page.click('#prediction-check');
  assert.match(await text(page, '#feedback'), /preserves the initial PV product/);
  await page.fill('#transfer-input', '0.40'); await page.click('#transfer-check');
  assert.match(await text(page, '#transfer-feedback'), /inverse/);
  await page.fill('#transfer-input', '2.5'); await page.click('#transfer-check');
  assert.match(await text(page, '#transfer-feedback'), /Correct/);
  assert.match(await text(page, '#transfer-feedback'), /\(1\.00 atm × 2\.00 L\)\/0\.80 L = 2\.50 atm/);
  await page.check('input[name="leak"][value="no"]'); await page.click('#leak-submit');
  assert.match(await text(page, '#leak-feedback'), /Right/);
  await page.click('.preset[data-v="4"]');

  await page.click('#replay');
  assert.match(await text(page, '#feedback'), /preserves/);
  assert.match(await text(page, '#transfer-feedback'), /Correct/);
  assert.strictEqual(await page.locator('#play-pause').innerText(), 'Pause');

  await page.click('#reset');
  const s = await page.evaluate(() => window.__boyle.snapshot());
  assert.deepStrictEqual(s.state, { volumeL: 2, revealPressure: false, running: false, graphMode: 'P-vs-V', prediction: null });
  assert.strictEqual(s.t, 0); assert.strictEqual(s.mode, 'animatic');
  assert.strictEqual(await text(page, '#feedback'), '');
  assert.strictEqual(await text(page, '#transfer-feedback'), '');
  assert.strictEqual(await text(page, '#leak-feedback'), '');
  assert.strictEqual(await page.inputValue('#transfer-input'), '');
  assert.strictEqual(await page.locator('input[name="prediction"]:checked').count(), 0);
  assert.strictEqual(await page.inputValue('#volume-slider'), '2');
  await page.click('.preset[data-v="2"]');
  assert.strictEqual(await text(page, '#pressure-value'), 'hidden');
  await ctx.close();
});

test('playback controls are keyboard operable and step through storyboard boundaries', async () => {
  const { ctx, page } = await open();
  await page.focus('#step-forward');
  const seen = [];
  for (let i = 0; i < 6; i++) { await page.keyboard.press('Enter'); seen.push(await page.evaluate(() => window.__boyle.snapshot().t)); }
  assert.deepStrictEqual(seen, [9, 18, 28, 38, 47, 55]);
  await page.focus('#step-back');
  await page.keyboard.press('Enter');
  assert.strictEqual(await page.evaluate(() => window.__boyle.snapshot().t), 47);
  await page.focus('#play-pause'); await page.keyboard.press('Space');
  await page.waitForTimeout(400);
  const t1 = await page.evaluate(() => window.__boyle.snapshot().t);
  assert.ok(t1 > 47, 'playing advances time');
  await page.keyboard.press('Space');
  assert.strictEqual(await page.locator('#play-pause').innerText(), 'Play');
  // Tab order reaches every control (no drag-only or pointer-only action).
  await page.evaluate(() => document.activeElement.blur());
  const reached = new Set();
  for (let i = 0; i < 60; i++) { await page.keyboard.press('Tab'); reached.add(await page.evaluate(() => document.activeElement.id)); }
  for (const id of ['play-pause', 'replay', 'step-back', 'step-forward', 'timeline', 'volume-slider', 'volume-input', 'volume-set', 'reveal-toggle', 'contacts-toggle', 'prediction-check', 'transfer-input', 'transfer-check', 'leak-submit', 'reset']) {
    assert.ok(reached.has(id), 'tab reaches ' + id);
  }
  await ctx.close();
});

test('captions shown for every 0.5 s of the animatic match the cue track', async () => {
  const { ctx, page } = await open();
  const cues = await page.evaluate(() => window.BoyleModel.CUES);
  for (let t = 0; t < 55; t += 0.5) {
    await page.evaluate((tt) => window.__boyle.seek(tt), t);
    const shown = await page.locator('#caption-text').textContent();
    const cue = cues.find((c) => t >= c.start && t < c.end);
    assert.strictEqual(shown, cue.text, 't=' + t);
  }
  await ctx.close();
});

test('reduced motion: still stages, no particle motion', async () => {
  const { ctx, page } = await open({ reducedMotion: 'reduce' });
  await page.click('#step-forward');
  const a = await page.evaluate(() => window.__boyle.snapshot().particles);
  await page.waitForTimeout(500);
  const b = await page.evaluate(() => window.__boyle.snapshot().particles);
  assert.deepStrictEqual(a, b);
  assert.match(await text(page, '#mode-note'), /Reduced motion/);
  // Mid-transition time shows the settled step frame (V = 1.00 L), not an in-between.
  await page.evaluate(() => window.__boyle.seek(12));
  assert.strictEqual(await text(page, '#volume-value'), '1.00 L');
  await page.click('.preset[data-v="1"]');
  const c = await page.evaluate(() => window.__boyle.snapshot().particles);
  await page.waitForTimeout(500);
  assert.deepStrictEqual(c, await page.evaluate(() => window.__boyle.snapshot().particles));
  await ctx.close();
});

test('responsive: 1440 and 390 screenshots, no horizontal scroll, graph and caption do not overlap', async () => {
  for (const w of [1440, 390]) {
    const { ctx, page } = await open({ viewport: { width: w, height: w === 390 ? 844 : 1000 } });
    await page.evaluate(() => window.__boyle.seek(45));
    await page.screenshot({ path: path.join(SHOTS, 'animatic-' + w + '.png'), fullPage: true });
    await page.click('#reveal-toggle'); await page.click('.preset[data-v="1"]');
    await page.screenshot({ path: path.join(SHOTS, 'explore-' + w + '.png'), fullPage: true });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    assert.ok(overflow <= 0, 'no horizontal scroll at ' + w + ' (' + overflow + ')');
    const g = await page.locator('#graph').boundingBox(), c = await page.locator('#caption-band').boundingBox(), s = await page.locator('#scene').boundingBox();
    const overlap = (a, b) => a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
    assert.ok(!overlap(g, c), 'graph vs caption at ' + w);
    assert.ok(!overlap(s, c), 'scene vs caption at ' + w);
    if (w === 390) {
      assert.ok(s.y < c.y && c.y < g.y, 'mobile order: diagram, caption, numbers/graph');
      const ctrl = await page.locator('#explore').boundingBox();
      assert.ok(g.y < ctrl.y, 'controls after numbers');
      const small = await page.$$eval('button, input[type="text"], input[type="number"], label, legend, select', (els) => els.filter((e) => e.offsetParent && parseFloat(getComputedStyle(e).fontSize) < 16).map((e) => e.id || e.textContent.trim()));
      assert.deepStrictEqual(small, [], 'interactive text >= 16px');
    }
    await ctx.close();
  }
});

test('render mode: 1920x1080 frames are repeatable with the fixed seed', async () => {
  // Same seek sequence twice (what the exporter does): byte-identical frames.
  const runs = [];
  for (let run = 0; run < 2; run++) {
    const { ctx, page } = await open({ viewport: { width: 1920, height: 1080 }, query: '?render=1' });
    const h = {};
    for (const t of [0, 12, 23.4, 33.5, 40, 51]) {
      await page.evaluate((tt) => window.__boyle.seek(tt), t);
      h[t] = crypto.createHash('sha256').update(await page.screenshot()).digest('hex');
    }
    runs.push(h);
    await ctx.close();
  }
  assert.deepStrictEqual(runs[0], runs[1]);
});

test('render mode: frame content does not depend on seek order', async () => {
  // Reverse-order seeking yields the same scene state; Chromium may differ by a
  // few anti-aliased pixels after partial repaints, so compare pixels.
  const grab = async (seq) => {
    const { ctx, page } = await open({ viewport: { width: 1920, height: 1080 }, query: '?render=1' });
    for (const t of seq) await page.evaluate((tt) => window.__boyle.seek(tt), t);
    const png = (await page.screenshot()).toString('base64');
    const snap = await page.evaluate(() => window.__boyle.snapshot());
    await ctx.close();
    return { png, snap };
  };
  const a = await grab([40]), b = await grab([12, 51, 23.4, 40]);
  assert.deepStrictEqual(a.snap.particles, b.snap.particles);
  const { ctx, page } = await open();
  const diff = await page.evaluate(async ([x, y]) => {
    const load = (b64) => new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.src = 'data:image/png;base64,' + b64; });
    const [ia, ib] = await Promise.all([load(x), load(y)]);
    const px = (img) => { const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const g = c.getContext('2d'); g.drawImage(img, 0, 0); return g.getImageData(0, 0, c.width, c.height).data; };
    const da = px(ia), db = px(ib);
    let n = 0, max = 0;
    for (let i = 0; i < da.length; i += 4) { const d = Math.max(Math.abs(da[i] - db[i]), Math.abs(da[i + 1] - db[i + 1]), Math.abs(da[i + 2] - db[i + 2])); if (d) n++; if (d > max) max = d; }
    return { n, max, total: da.length / 4 };
  }, [a.png, b.png]);
  await ctx.close();
  assert.ok(diff.n / diff.total < 1e-4, 'differing pixels: ' + diff.n);
});

test('no console errors across the session', () => {
  assert.deepStrictEqual(errors, []);
});
