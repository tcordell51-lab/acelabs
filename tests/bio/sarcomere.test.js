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
  // #0f0f0f in the #292929 overlap: a contrast ratio of about 1.3
  const t = boot('bio-physiology.html');
  const d = t.w.document;
  for (const st of Object.keys(STATES)) {
    t.click(d.querySelector('[data-sf="' + st + '"]'));
    const tem = d.getElementById('sfTem');
    const runs = temRuns(tem);
    if (st === 'contracted') {
      const dark = runs.filter((r) => r.c === '#0f0f0f');
      assert.deepEqual(dark.map((r) => [r.x0, r.x1]), [[356, 364]], 'an 8 px M line centered on 360');
      assert.equal(grayAt(runs, 354), '#292929', 'overlap gray beside it');
      assert.equal(grayAt(runs, 364), '#292929', 'overlap gray beside it');
      assert.ok(tem.querySelector('#rl-tMlead'), 'dashed leader from the M line label');
      assert.equal(tem.querySelector('#rl-tMlead').getAttribute('d'), 'M360,24V44');
    } else {
      assert.equal(grayAt(runs, 359), '#3d3d3d', st + ': M line darker than the H zone');
      assert.ok(!runs.some((r) => r.c === '#0f0f0f'), st + ': no overlap M line yet');
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
  const ro = d.getElementById('sfReadout').textContent;
  assert.match(ro, /A band still 1\.6 um/);
  assert.ok(p.frames.every((f) => f.html.length <= 32000), 'every frame fits on a card');
  // the last frame's readout stays under the veil in the check (which
  // filament gets shorter?): it leads with what changed, and the rigor aside
  // (a different state from full contraction) is gone
  assert.match(ro, /^Fully contracted\. Z to Z 2\.0 um\. I band down to 0\.4 um\..*H zone is gone\. A band still 1\.6 um\.$/);
  assert.doesNotMatch(ro, /rigor|ATP|let go/i);
});

test('cross-bridge stick: the veiled scrubber does not say what happens without ATP', () => {
  const t = boot('bio-physiology.html');
  const d = t.w.document;
  assert.ok(t.panel('cross-bridge').node.classList.contains('is-fresh'));
  const body = d.getElementById('crossBridgeBody');
  assert.ok(body.classList.contains('stick-veiled'));
  // it opens on Stage 3, which says nothing about what releases the head
  assert.equal(d.getElementById('cbStage').value, '50');
  assert.match(d.getElementById('cbStageName').textContent, /^Stage 3: Cross-bridge forms$/);
  assert.match(d.getElementById('cbExplain').textContent, /^Stage 3: /);
  assert.doesNotMatch(body.textContent, /rigor|stuck|locked|no ATP|without (a new )?ATP|runs out/i);
  assert.doesNotMatch(body.textContent, /lets? go|let go|releases?|detach/i);
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
  const svg = () => d.getElementById('cbSvg');
  // the near edge of the upper thin filament, read from the drawing
  function actinEdge() {
    const thin = [...svg().querySelectorAll('path')].find((p) => p.getAttribute('stroke') === '#c19a3e' && !p.closest('g[opacity]'));
    const ys = [...thin.getAttribute('d').matchAll(/M-?[\d.]+,(-?[\d.]+)/g)].map((m) => +m[1]);
    return Math.min(...ys) + 3.5;
  }
  // each head: an S2 tether (stroke 1.5) from the thick filament surface to
  // the lever start, a lever (stroke 3.5) to the center of the motor domain,
  // and the motor domain ellipse, drawn along the lever
  function heads() {
    const el = svg();
    const line = (p) => p.getAttribute('d').match(/M(-?[\d.]+),(-?[\d.]+)L(-?[\d.]+),(-?[\d.]+)/).slice(1).map(Number);
    const tethers = [...el.querySelectorAll('path')].filter((p) => p.getAttribute('stroke') === '#8a3520' && p.getAttribute('stroke-width') === '1.5').map(line);
    const levers = [...el.querySelectorAll('path')].filter((p) => p.getAttribute('stroke') === '#8a3520' && p.getAttribute('stroke-width') === '3.5').map(line);
    const ells = [...el.querySelectorAll('ellipse')];
    assert.equal(tethers.length, 8, 'eight heads: two per row in each half');
    assert.equal(levers.length, 8);
    assert.equal(ells.length, 8);
    return tethers.map(([bx, by, lx, ly], i) => {
      const e = ells[i], rx = +e.getAttribute('rx'), cx = +e.getAttribute('cx'), cy = +e.getAttribute('cy');
      const rot = +e.getAttribute('transform').match(/rotate\((-?[\d.]+)/)[1] * Math.PI / 180;
      const tip = [cx + rx * Math.cos(rot), cy + rx * Math.sin(rot)];
      const [l0x, l0y, l1x, l1y] = levers[i];
      const tM = bx < 400 ? 1 : -1;
      const ang = Math.atan2(Math.abs(tip[1] - ly), (tip[0] - lx) * tM) * 180 / Math.PI;   // from the filament axis, toward the M line
      return {
        bx, by, lx, ly, tip, ang, up: cy < by, fill: e.getAttribute('fill'),
        tether: Math.hypot(lx - bx, ly - by), unit: Math.hypot(tip[0] - lx, tip[1] - ly),
        leverJoins: Math.hypot(l0x - lx, l0y - ly) < 0.11 && Math.hypot(l1x - cx, l1y - cy) < 0.11,
        leverAlong: Math.abs(Math.atan2(l1y - l0y, l1x - l0x) - rot) < 0.01
      };
    });
  }
  const zLeft = () => +svg().querySelector('line[stroke-width="4"]').getAttribute('x1');
  for (const v of [0, 19, 20, 39]) {
    slide(v);
    const edge = actinEdge();
    heads().filter((h) => h.up).forEach((h) => assert.ok(h.tip[1] - edge >= 8, v + ': detached head clear of actin, gap ' + (h.tip[1] - edge)));
  }
  for (const v of [40, 59, 60, 79, 80, 100]) {
    slide(v);
    const edge = actinEdge();
    heads().filter((h) => h.up).forEach((h) => assert.ok(h.tip[1] - edge <= 1 && h.tip[1] - edge >= -1, v + ': head on actin'));
  }
  // one rigid unit 30 long in every state: only the S2 tether changes length,
  // and the tether never starts inside the thick filament or runs back into it
  const tethers = {};
  for (let v = 0; v <= 100; v++) {
    slide(v);
    heads().forEach((h) => {
      assert.ok(Math.abs(h.unit - 30) < 0.15, v + ': lever and head 30 long, ' + h.unit);
      assert.ok(h.leverJoins && h.leverAlong, v + ': lever runs from the tether to the head, along the head');
      assert.ok(Math.abs(Math.abs(h.by - 154) - 8) < 1e-9, v + ': tether starts on the thick filament surface');
      assert.ok(Math.abs(h.ly - 154) >= 8 + 1.9, v + ': lever starts outside the thick filament');
    });
    tethers[v] = heads()[0].tether;
  }
  assert.ok(tethers[50] > 12 && tethers[50] < 14, 'Stage 3 tether about 13, ' + tethers[50]);
  assert.ok(tethers[90] > 22 && tethers[90] < 25, 'after the stroke tether about 24, ' + tethers[90]);
  slide(50);
  heads().forEach((h) => assert.ok(h.ang > 85 && h.ang < 100, 'bound and cocked: about 90 degrees, ' + h.ang));
  slide(30);
  heads().forEach((h) => assert.ok(h.ang > 85 && h.ang < 100, 'cocked, not bound: about 90 degrees, ' + h.ang));
  slide(10);
  heads().forEach((h) => assert.ok(h.ang > 42 && h.ang < 52, 'just let go: still at the post-stroke angle, ' + h.ang));
  slide(90);
  heads().forEach((h) => assert.ok(h.ang > 42 && h.ang < 52, 'after the stroke: about 45 degrees, ' + h.ang));
  // through the stroke the unit tilts steadily from 90 toward 45
  let last = 91;
  for (let v = 60; v <= 80; v++) {
    slide(v);
    const a = heads()[0].ang;
    assert.ok(a <= last + 1e-6, v + ': angle never swings back, ' + a);
    last = a;
  }
  // in the stroke the end of each bound head moves with its thin filament
  // (same offset from the Z disc, to drawing precision), and it sits on a
  // binding site (the sites are every 20 units from the Z disc)
  const off = [];
  for (const v of [50, 60, 66, 72, 79, 80, 95]) {
    slide(v);
    off.push(heads().filter((h) => h.bx < 400).map((h) => Math.round(h.tip[0] - zLeft())).join(','));
  }
  assert.equal(new Set(off).size, 1, 'head to Z disc offsets ' + off.join(' | '));
  off[0].split(',').map(Number).forEach((o) => assert.equal(o % 20, 0, 'head on a binding site, ' + o + ' from the Z disc'));
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
  // one real stroke is 5 to 10 nm, so one pass of the slider stands for many
  // cycles, and the readout and the subtitle say so
  assert.equal(d.getElementById('cbSarcDelta').textContent, 'shorter by 0.3 um (many cycles)');
  assert.match(d.getElementById('crossBridgeBody').textContent, /5 to 10 nm, so one pass of this slider stands for many cycles/);
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
