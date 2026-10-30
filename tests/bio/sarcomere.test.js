/* Tests for the sarcomere views on the physiology hub: the to-scale sliding
 * filament model (#sfSvg, #sfReadout), the TEM strip under it (#sfTem,
 * BioReal.temStrip in bio-real.js) and the cross-bridge cycle scrubber
 * (#cbSvg, initCrossBridgeCycle in bio-shared.js).
 *
 * The jsdom boot helper is copied from bio-stick.test.js: the Bio scripts are
 * evaluated as one script, the way classic <script> tags share the page's
 * global lexical scope. Reduced motion is on, so stick frames resolve at once.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

const BIO = path.join(__dirname, '..', '..', 'tools', 'bio');
const SRC = ['bio-shared.js', 'bio-real.js', 'bio-bone.js', 'bio-stick-data.js', 'bio-stick.js']
  .map((f) => fs.readFileSync(path.join(BIO, f), 'utf8')).join('\n;\n');

const OPEN = [];
test.afterEach(() => { while (OPEN.length) { try { OPEN.pop().close(); } catch (e) { /* already closed */ } } });

function boot(hub, opts = {}) {
  const html = fs.readFileSync(path.join(BIO, hub), 'utf8');
  const dom = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true, url: 'http://localhost/tools/bio/' + hub + (opts.hash || '') });
  const store = new Map(opts.seed ? Object.entries(opts.seed) : []);
  Object.defineProperty(dom.window, 'localStorage', {
    value: {
      getItem: (k) => (store.has(k) ? store.get(k) : null),
      setItem: (k, v) => store.set(k, String(v)),
      removeItem: (k) => store.delete(k)
    },
    writable: false
  });
  dom.window.matchMedia = (q) => ({ matches: /reduce/.test(q), media: q, addListener() {}, removeListener() {} });
  dom.window.HTMLElement.prototype.scrollIntoView = function () {};
  const errs = [];
  dom.window.addEventListener('error', (e) => errs.push(e.message));
  dom.window.eval(SRC + '\n;window.__STATE = STATE;');
  dom.window.document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));
  const w = dom.window;
  OPEN.push(w);
  return {
    w, errs,
    panel: (id) => w.BioStick.panels[id],
    click: (el) => el.dispatchEvent(new w.MouseEvent('click', { bubbles: true }))
  };
}

function predict(t, id, pick) {
  const p = t.panel(id);
  t.click(p.node.querySelector('.stick-opts .stick-opt[data-i="' + pick + '"]'));
  return p;
}

const STATES = { relaxed: 120, contracting: 140, contracted: 160 };   // left Z disc x in #sfSvg
const NON_ASCII = /[^\x00-\x7F]/;
const HOUSE_WORDS = /\b(wrong|incorrect|fail|failed)\b|—/i;

// the band runs of one TEM myofibril row (#rl-tmf): [{ x0, x1, c }], sorted
function temRuns(tem) {
  const runs = [];
  tem.querySelectorAll('#rl-tmf > path[fill]').forEach((p) => {
    const c = p.getAttribute('fill');
    for (const m of p.getAttribute('d').matchAll(/M(-?[\d.]+),0h(-?[\d.]+)/g)) runs.push({ x0: +m[1], x1: +m[1] + +m[2], c });
  });
  return runs.sort((a, b) => a.x0 - b.x0);
}
const grayAt = (runs, x) => (runs.find((r) => r.x0 <= x && x < r.x1) || {}).c;

function sourceBlock(file, from, to) {
  const s = fs.readFileSync(path.join(BIO, file), 'utf8');
  const a = s.indexOf(from), b = s.indexOf(to, a + 1);
  assert.ok(a >= 0 && b > a, file + ': block ' + from);
  return s.slice(a, b);
}

test('TEM band edges sit under the filaments to the unit (each cell sampled at its center)', () => {
  const t = boot('bio-physiology.html');
  const d = t.w.document;
  for (const [st, zL] of Object.entries(STATES)) {
    t.click(d.querySelector('[data-sf="' + st + '"]'));
    const runs = temRuns(d.getElementById('sfTem'));
    const zR = 720 - zL, I = '#a5a5a5', OVER = '#292929';
    // A band = the thick filament, 200 to 520, in every state
    assert.equal(grayAt(runs, 199), I, st + ': I band just left of the A band');
    assert.equal(grayAt(runs, 200), OVER, st + ': A band starts at 200');
    assert.equal(grayAt(runs, 519), OVER, st + ': A band still at 519');
    assert.equal(grayAt(runs, 520), I, st + ': A band ends at 520');
    // the I band is centered on each Z disc (A band to A band)
    assert.equal(grayAt(runs, zR - (520 - zR)), OVER, st + ': next A band starts');
    assert.equal(grayAt(runs, 2 * zR - 520 - 1), I, st + ': I band ends at the next A band');
    if (st !== 'contracted') {
      // the overlap ends exactly at the thin filament tips, zL + 200 and zR - 200
      assert.equal(grayAt(runs, zL + 199), OVER, st + ': overlap up to the left tip');
      assert.notEqual(grayAt(runs, zL + 200), OVER, st + ': H zone from the left tip');
      assert.notEqual(grayAt(runs, zR - 201), OVER, st + ': H zone up to the right tip');
      assert.equal(grayAt(runs, zR - 200), OVER, st + ': overlap from the right tip');
    }
  }
  assert.deepEqual(t.errs, []);
});

test('TEM M line: dark in the H zone, and still a thin darker line at full contraction with a leader', () => {
  const t = boot('bio-physiology.html');
  const d = t.w.document;
  for (const st of Object.keys(STATES)) {
    t.click(d.querySelector('[data-sf="' + st + '"]'));
    const tem = d.getElementById('sfTem');
    const runs = temRuns(tem);
    if (st === 'contracted') {
      const dark = runs.filter((r) => r.c === '#1f1f1f');
      assert.deepEqual(dark.map((r) => [r.x0, r.x1]), [[356, 364]], 'an 8 px M line centered on 360');
      assert.equal(grayAt(runs, 354), '#292929', 'overlap gray beside it');
      assert.equal(grayAt(runs, 364), '#292929', 'overlap gray beside it');
      assert.ok(tem.querySelector('#rl-tMlead'), 'dashed leader from the M line label');
      assert.equal(tem.querySelector('#rl-tMlead').getAttribute('d'), 'M360,24V44');
    } else {
      assert.equal(grayAt(runs, 359), '#3d3d3d', st + ': M line darker than the H zone');
      assert.ok(!runs.some((r) => r.c === '#1f1f1f'), st + ': no overlap M line yet');
      assert.equal(tem.querySelector('#rl-tMlead'), null, st + ': no leader while the H zone shows');
    }
  }
});

test('TEM mitochondria keep one size in every state, inside the half I band', () => {
  const t = boot('bio-physiology.html');
  const d = t.w.document;
  for (const [st, zL] of Object.entries(STATES)) {
    t.click(d.querySelector('[data-sf="' + st + '"]'));
    const tem = d.getElementById('sfTem');
    const mito = tem.querySelector('#rl-tmito ellipse');
    assert.equal(mito.getAttribute('rx'), '16', st + ': half length 16 (0.16 um long)');
    const xs = [...tem.querySelectorAll('use')].filter((u) => u.getAttribute('href') === '#rl-tmito').map((u) => +u.getAttribute('x'));
    assert.ok(xs.includes(zL - 20) && xs.includes(zL + 20), st + ': a pair at the Z disc, centered 20 out');
    assert.ok(20 + 16 <= (200 - zL) - 4, st + ': clear of the A-I junction');
  }
  // the drawing is a pure function of the geometry
  const g = { zL: 140, zR: 580, actinTipL: 340, myosinW: 320 };
  assert.equal(t.w.BioReal.temStrip(g), t.w.BioReal.temStrip(g));
  assert.doesNotMatch(t.w.BioReal.temStrip.toString(), /Math\.random|Date/);
});

test('sarcomere stick: nothing under the veil names the band that holds', () => {
  const t = boot('bio-physiology.html');
  const d = t.w.document;
  const lab = d.querySelector('.lab-module[data-module="filament"]');
  assert.ok(t.panel('sarcomere').node.classList.contains('is-fresh'));
  const wrap = lab.querySelector('.rl-tem-wrap');
  assert.ok(wrap && wrap.closest('.stick-veiled'), 'the TEM and its caption are under the veil');
  const veiled = [...lab.querySelectorAll('.stick-veiled')].map((v) => v.textContent).join(' ');
  assert.match(veiled, /Relaxed\./, 'the readout is under the veil too');
  assert.doesNotMatch(veiled, /A band (holds|still|stays|keeps|does not|is constant)|A-band stays|constant|while the A band/i);
  // the caption still teaches what to look at
  const cap = wrap.querySelector('p').textContent;
  assert.match(cap, /which ones narrow, and which one holds\?/);
  // the starting markup matches the relaxed readout the code writes, in plain ASCII
  const html = fs.readFileSync(path.join(BIO, 'bio-physiology.html'), 'utf8');
  const start = html.match(/id="sfReadout">\s*([\s\S]*?)\s*<\/div>/)[1];
  assert.doesNotMatch(start, NON_ASCII);
  assert.equal(start, d.getElementById('sfReadout').innerHTML.trim(), 'starting #sfReadout = relaxed readout');
  // after the answer, the frames do say it
  const p = predict(t, 'sarcomere', t.panel('sarcomere').entry.predict.key);
  assert.match(d.getElementById('sfReadout').textContent, /A band still 1\.6 um/);
  assert.ok(p.frames.every((f) => f.html.length <= 32000), 'every frame fits on a card');
});

test('cross-bridge stick: the veiled scrubber does not say what happens without ATP', () => {
  const t = boot('bio-physiology.html');
  assert.ok(t.panel('cross-bridge').node.classList.contains('is-fresh'));
  const body = t.w.document.getElementById('crossBridgeBody');
  assert.ok(body.classList.contains('stick-veiled'));
  assert.doesNotMatch(body.textContent, /rigor|stuck|locked|no ATP|without (a new )?ATP|runs out/i);
  const p = predict(t, 'cross-bridge', 0);
  assert.equal(p.frames.length, 5);
  assert.equal(Array.from(p.frames, (f) => f.caption.slice(0, 7)).join('|'), 'Stage 1|Stage 2|Stage 3|Stage 4|Stage 5');
  p.frames.forEach((f) => assert.ok(f.html.length <= 32000, f.html.length + ' chars'));
  assert.match(p.frames[4].html, /A band/);
});

test('cross-bridge colors match the sliding filament model; the A band takes the myosin color', () => {
  const t = boot('bio-physiology.html');
  const d = t.w.document;
  const slide = (v) => { const s = d.getElementById('cbStage'); s.value = String(v); s.dispatchEvent(new t.w.Event('input', { bubbles: true })); };
  // the model's own colors
  assert.equal(d.getElementById('sf-myosin').getAttribute('fill'), '#c25b3f');
  assert.equal(d.getElementById('sf-actin-L').parentNode.getAttribute('stroke'), '#c19a3e');
  for (const v of [0, 30, 50, 70, 90]) {
    slide(v);
    const svg = d.getElementById('cbSvg');
    assert.doesNotMatch(svg.innerHTML, /#5cabe6/i, v + ': no blue left');
    const rods = [...svg.querySelectorAll('rect')].filter((r) => r.getAttribute('width') === '320' && r.getAttribute('x') === '240');
    assert.equal(rods.length, 1, v + ': one thick filament at 240');
    assert.equal(rods[0].getAttribute('fill'), '#c25b3f', v + ': myosin red-brown');
    const thin = [...svg.querySelectorAll('path')].filter((p) => p.getAttribute('stroke') === '#c19a3e' && !p.closest('g[opacity]'));
    assert.equal(thin.length, 1, v + ': this sarcomere\'s thin filaments');
    assert.equal((thin[0].getAttribute('d').match(/M/g) || []).length, 4, v + ': four thin filaments, gold');
    const aText = [...svg.querySelectorAll('text')].find((x) => x.textContent === 'A band');
    assert.equal(aText.getAttribute('fill'), '#a8462e', v + ': A band label in the myosin color');
    const aBr = [...svg.querySelectorAll('line')].filter((l) => l.getAttribute('stroke') === '#c25b3f');
    assert.deepEqual(aBr.map((l) => [+l.getAttribute('x1'), +l.getAttribute('x2')]), [[243, 557]], v + ': A band bracket under the thick filament');
  }
  const box = d.getElementById('cbABand').parentNode;
  assert.match(box.getAttribute('style'), /border:2px solid #c25b3f/);
  assert.doesNotMatch(d.getElementById('crossBridgeBody').innerHTML, /#5cabe6/i);
});

test('cross-bridge heads: clear of actin until they bind, 90 to 45 degrees in the stroke, riding with actin', () => {
  const t = boot('bio-physiology.html');
  const d = t.w.document;
  const slide = (v) => { const s = d.getElementById('cbStage'); s.value = String(v); s.dispatchEvent(new t.w.Event('input', { bubbles: true })); };
  const ACTIN_EDGE = 110 + 3.5;   // lower edge of the upper thin filament
  function heads() {
    const svg = d.getElementById('cbSvg');
    return [...svg.querySelectorAll('path')].filter((p) => p.getAttribute('stroke') === '#8a3520').map((p, i) => {
      const m = p.getAttribute('d').match(/M(-?[\d.]+),(-?[\d.]+)L(-?[\d.]+),(-?[\d.]+)/).slice(1).map(Number);
      const [bx, by, cx, cy] = m, len = Math.hypot(cx - bx, cy - by);
      const tip = [cx + 12 * (cx - bx) / len, cy + 12 * (cy - by) / len];
      const tM = bx < 400 ? 1 : -1;
      const ang = Math.atan2(Math.abs(cy - by), (cx - bx) * tM) * 180 / Math.PI;   // from the filament axis, toward the M line
      const fill = svg.querySelectorAll('ellipse')[i].getAttribute('fill');
      return { bx, by, cx, cy, tip, ang, up: cy < by, fill };
    });
  }
  const zLeft = () => +d.getElementById('cbSvg').querySelector('line[stroke-width="4"]').getAttribute('x1');
  for (const v of [0, 19, 20, 39]) {
    slide(v);
    heads().filter((h) => h.up).forEach((h) => assert.ok(h.tip[1] - ACTIN_EDGE >= 8, v + ': detached head clear of actin, gap ' + (h.tip[1] - ACTIN_EDGE)));
  }
  for (const v of [40, 59, 60, 79, 80, 100]) {
    slide(v);
    heads().filter((h) => h.up).forEach((h) => assert.ok(h.tip[1] - ACTIN_EDGE <= 1, v + ': head on actin'));
  }
  slide(50);
  heads().forEach((h) => assert.ok(h.ang > 85 && h.ang < 100, 'bound and cocked: about 90 degrees, ' + h.ang));
  slide(90);
  heads().forEach((h) => assert.ok(h.ang > 42 && h.ang < 52, 'after the stroke: about 45 degrees, ' + h.ang));
  // in the stroke the end of each bound head moves with its thin filament
  // (same offset from the Z disc, to drawing precision)
  const off = [];
  for (const v of [60, 66, 72, 79, 80, 95]) {
    slide(v);
    off.push(heads().filter((h) => h.bx < 400).map((h) => Math.round(h.tip[0] - zLeft())).join(','));
  }
  assert.equal(new Set(off).size, 1, 'head to Z disc offsets ' + off.join(' | '));
  // stage text, head color and drawing agree at every boundary
  const want = [[0, 1], [19, 1], [20, 2], [39, 2], [40, 3], [59, 3], [60, 4], [79, 4], [80, 5], [100, 5]];
  const colors = { 1: '#b3aca0', 2: '#8a5a8c', 3: '#3f8a55', 4: '#3f8a55', 5: '#1B3A2D' };
  for (const [v, k] of want) {
    slide(v);
    assert.match(d.getElementById('cbStageName').textContent, new RegExp('^Stage ' + k + ':'), v + ': stage name');
    assert.match(d.getElementById('cbExplain').textContent, new RegExp('^Stage ' + k + ':'), v + ': explainer');
    heads().forEach((h) => assert.equal(h.fill, colors[k], v + ': head color'));
  }
});

test('cross-bridge readouts in um, consistent with the drawing', () => {
  const t = boot('bio-physiology.html');
  const d = t.w.document;
  const slide = (v) => { const s = d.getElementById('cbStage'); s.value = String(v); s.dispatchEvent(new t.w.Event('input', { bubbles: true })); };
  const read = () => ['cbSarcLen', 'cbIBand', 'cbABand', 'cbHZone'].map((id) => d.getElementById(id).textContent);
  slide(0);
  assert.deepEqual(read(), ['2.4 um', '0.8 um', '1.6 um', '0.4 um']);
  assert.equal(d.getElementById('cbSarcDelta').textContent, 'rest length');
  slide(70);
  assert.deepEqual(read(), ['2.25 um', '0.65 um', '1.6 um', '0.25 um']);
  slide(90);
  assert.deepEqual(read(), ['2.1 um', '0.5 um', '1.6 um', '0.1 um']);
  assert.equal(d.getElementById('cbSarcDelta').textContent, 'shorter by 0.3 um');
  for (let v = 0; v <= 100; v++) {
    slide(v);
    const [s, i, a, h] = read().map(parseFloat);
    assert.ok(Math.abs(i + a - s) < 1e-9, v + ': I band + A band = Z to Z');
    assert.ok(Math.abs(s - 2 * 1.0 - h) < 1e-9, v + ': H zone = Z to Z minus two thin filaments');
    const zs = [...d.getElementById('cbSvg').querySelectorAll('line[stroke-width="4"]')].map((l) => +l.getAttribute('x1'));
    assert.ok(Math.abs((zs[1] - zs[0]) / 200 - s) < 1e-9, v + ': Z discs drawn at the stated length');
  }
  // the slider is a full-width, 44 px tall touch target
  assert.match(d.getElementById('cbStage').getAttribute('style'), /width:100%;height:44px/);
});

test('owned sarcomere sources: plain ASCII, house words, unique ids', () => {
  const blocks = {
    'bio-shared.js sliding filament': sourceBlock('bio-shared.js', '/* ---- SLIDING FILAMENT ---- */', '/* ---- ENDOCRINE MAP ---- */'),
    'bio-shared.js cross-bridge': sourceBlock('bio-shared.js', '/* ---- CROSS-BRIDGE CYCLE SCRUBBER ---- */', '/* ---- PROBABILITY TREE'),
    'bio-real.js sarcomere': sourceBlock('bio-real.js', '/* ---------- sarcomere', 'window.BioReal = window.BioReal'),
    'bio-physiology.html model': sourceBlock('bio-physiology.html', '<!-- ====== SLIDING FILAMENT ====== -->', '<!-- ====== ENDOCRINE MAP ====== -->'),
    'bio-physiology.html scrubber': sourceBlock('bio-physiology.html', '<div class="section-num">01 &middot; Cross-bridge scrubber</div>', '<div class="section-num">01 &middot; Retrieval</div>')
  };
  for (const [name, src] of Object.entries(blocks)) {
    const bad = src.split('\n').map((l, i) => [i + 1, l]).filter(([, l]) => NON_ASCII.test(l));
    assert.deepEqual(bad, [], name + ': non-ASCII lines');
    assert.doesNotMatch(src, HOUSE_WORDS, name + ': house words');
  }
  const t = boot('bio-physiology.html');
  const d = t.w.document;
  const scopes = [d.querySelector('.lab-module[data-module="filament"]'), d.getElementById('crossBridgeBody')];
  for (const v of [0, 70, 90]) {
    const s = d.getElementById('cbStage'); s.value = String(v); s.dispatchEvent(new t.w.Event('input', { bubbles: true }));
    assert.doesNotMatch(d.getElementById('crossBridgeBody').textContent, NON_ASCII, v + ': rendered scrubber text is ASCII');
    assert.doesNotMatch(d.getElementById('crossBridgeBody').textContent, HOUSE_WORDS);
  }
  for (const st of Object.keys(STATES)) {
    t.click(d.querySelector('[data-sf="' + st + '"]'));
    assert.doesNotMatch(scopes[0].textContent, NON_ASCII, st + ': rendered model text is ASCII');
    scopes.forEach((sc) => sc.querySelectorAll('[id]').forEach((el) => {
      assert.equal(d.querySelectorAll('[id="' + el.id + '"]').length, 1, st + ': id ' + el.id + ' is unique on the page');
    }));
  }
});
