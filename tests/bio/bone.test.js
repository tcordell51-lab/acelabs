/* Unit tests for the Bone Layers picture (tools/bio/bio-bone.js): the
 * ground-section zoom stays legible on every stop (the endosteum stop is
 * the saved Ace Card picture), the surface label reaches 4.5:1 and the
 * cut-plane label is never dimmed, the outer circumferential lamellae carry
 * lacunae about as densely as the rest of the section, and the frame gives
 * the picture the width on a phone.
 *
 * The jsdom boot helper is the one in bio-stick.test.js: the Bio scripts
 * are evaluated as ONE script, the way classic <script> tags share the
 * page's global lexical scope in a browser. Reduced motion is on, so the
 * stick frames resolve at once and no timers run.
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
    w, store, errs,
    panel: (id) => w.BioStick.panels[id],
    state: () => w.__STATE,
    click: (el) => el.dispatchEvent(new w.MouseEvent('click', { bubbles: true }))
  };
}

function bone() {
  const t = boot('bio-physiology.html');
  const d = t.w.document;
  const stage = d.getElementById('boneStage');
  const svgAt = (v) => {
    stage.value = String(v);
    stage.dispatchEvent(new t.w.Event('input', { bubbles: true }));
    return d.getElementById('boneSvg');
  };
  return { t, d, svgAt };
}

// WCAG contrast of two colors, each drawn at opacity `op` over the page background
const PAGE = '#fbf7ee';
const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const over = (h, op) => rgb(h).map((v, i) => v * op + rgb(PAGE)[i] * (1 - op));
const lum = (c) => {
  const s = c.map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
  return 0.2126 * s[0] + 0.7152 * s[1] + 0.0722 * s[2];
};
const contrast = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };

test('Bone Layers zoom: the ground section stays legible on every stop, the card stop included', () => {
  const { t, svgAt } = bone();
  const want = [0.8, 0.9, 1, 0.8, 0.8, 0.8];
  for (let v = 0; v <= 5; v++) {
    const svg = svgAt(v);
    const box = svg.querySelector('rect[x="14"][y="194"]');
    assert.ok(box, 'zoom box drawn at stop ' + v);
    const op = +box.parentNode.getAttribute('opacity');
    assert.equal(op, want[v], 'zoom opacity at stop ' + v);
    // the empty canals read near black on the matrix, and the ink labels stay readable
    // (the canal is the last circle of the osteon template)
    const dark = [...svg.querySelectorAll('#bl-oA circle')].pop().getAttribute('fill');
    assert.match(dark, /^#[0-9a-f]{6}$/i);
    const matrix = svg.querySelector('rect[x="15"][y="228"]').getAttribute('fill');
    assert.ok(contrast(over(dark, op), over(matrix, op)) >= 4.5, 'canal on matrix at stop ' + v);
    const ink = svg.querySelector('rect[x="14"][y="194"] ~ text').getAttribute('fill');
    assert.ok(contrast(over(ink, op), over(box.getAttribute('fill'), op)) >= 4.5, 'ink label at stop ' + v);
    // the surface label is secondary (lighter than the bold ink label beside it), yet reaches 4.5:1
    const surf = [...svg.querySelectorAll('text')].find((e) => e.textContent === 'surface (periosteum removed)');
    const surfC = contrast(over(surf.getAttribute('fill'), op), over(box.getAttribute('fill'), op));
    assert.ok(surfC >= 4.5, 'surface label at stop ' + v + ' is ' + surfC.toFixed(2) + ':1');
    assert.ok(surfC < contrast(over(ink, op), over(box.getAttribute('fill'), op)), 'surface label stays lighter than the ink label');
    // the cut-plane label is drawn at full strength on every stop, like the other gold labels;
    // only the cut-plane marker dims when the zoom is not active
    const cut = [...svg.querySelectorAll('text')].find((e) => e.textContent === 'cross-section here');
    assert.ok(!cut.hasAttribute('opacity'), 'cut label not dimmed at stop ' + v);
    assert.ok(!cut.parentNode.hasAttribute('opacity'), 'cut label group not dimmed at stop ' + v);
    assert.ok(contrast(rgb(cut.getAttribute('fill')), rgb(PAGE)) >= 4.2, 'cut label on the page at stop ' + v);
    const plane = svg.querySelector('path[d="M236,62V128"]').parentNode;
    assert.equal(+plane.getAttribute('opacity'), v === 1 || v === 2 ? 1 : 0.45, 'cut-plane marker opacity at stop ' + v);
  }
  assert.deepEqual(t.errs, []);
});

test('Bone Layers zoom: outer circumferential lamellae carry lacunae as densely as the interstitial bone', () => {
  const { svgAt } = bone();
  const svg = svgAt(2);
  const paths = [...svg.querySelectorAll('path')];
  const lacP = paths.find((p) => p.getAttribute('stroke-width') === '1.6');
  assert.ok(lacP, 'band lacunae drawn');
  const lac = [...lacP.getAttribute('d').matchAll(/M(-?[\d.]+),(-?[\d.]+)h3\.2/g)].map((m) => [+m[1] + 1.6, +m[2]]);
  assert.ok(lac.length >= 18 && lac.length <= 22, lac.length + ' lacunae in the band');
  // each sits between two lamellae (the lamellae lie at y = 232 + 3.5 j)
  lac.forEach(([x, y]) => {
    const k = (y - 233.8) / 3.5;
    assert.ok(Math.abs(k - Math.round(k)) < 0.03 && k > -0.01 && k < 4.01, 'lacuna at ' + x + ',' + y + ' between lamellae');
  });
  // spread along the whole band: no bare stretch longer than 24, except where the Volkmann canal crosses
  const xs = [15, ...lac.map((p) => p[0]).sort((a, b) => a - b), 345];
  for (let i = 1; i < xs.length; i++) {
    const across = xs[i - 1] < 130 && xs[i] > 130;
    assert.ok(xs[i] - xs[i - 1] <= (across ? 36 : 24), 'bare stretch ' + (xs[i] - xs[i - 1]).toFixed(1) + ' after x ' + xs[i - 1]);
  }
  // none hidden inside the Volkmann canal (stroke width 5)
  const volk = paths.find((p) => /^M128,229Q/.test(p.getAttribute('d'))).getAttribute('d').match(/-?[\d.]+/g).map(Number);
  lac.forEach(([x, y]) => {
    let best = 1e9;
    for (let i = 0; i <= 100; i++) {
      const s = i / 100, u = 1 - s;
      best = Math.min(best, Math.hypot(u * u * volk[0] + 2 * u * s * volk[2] + s * s * volk[4] - x, u * u * volk[1] + 2 * u * s * volk[3] + s * s * volk[5] - y));
    }
    assert.ok(best > 5, 'lacuna at ' + x + ',' + y + ' is ' + best.toFixed(1) + ' from the canal center line');
  });
  // four canaliculi cross each lacuna near its center (within the lacuna's half thickness)
  const can = [...lacP.previousElementSibling.getAttribute('d').matchAll(/M(-?[\d.]+),(-?[\d.]+)l(-?[\d.]+),(-?[\d.]+)/g)].map((m) => m.slice(1).map(Number));
  assert.equal(can.length, lac.length * 4);
  lac.forEach(([cx, cy], i) => {
    for (let k = 0; k < 4; k++) {
      const [px, py, qx, qy] = can[i * 4 + k];
      const off = Math.abs((cx - px) * qy - (cy - py) * qx) / Math.hypot(qx, qy);
      assert.ok(off < 0.8, 'lacuna ' + i + ' canaliculus ' + k + ' misses its center by ' + off.toFixed(2));
    }
  });
  // the "outer circumferential lamellae" leader ends on a lamella, clear of every lacuna
  const lead = paths.find((p) => /^M70,224L76,240/.test(p.getAttribute('d')));
  assert.ok(lead, 'lamellae leader drawn');
  const near = Math.min(...lac.map(([x, y]) => Math.hypot(x - 76, y - 240)));
  assert.ok(near >= 5, 'leader end is ' + near.toFixed(1) + ' from a lacuna');
});

test('Bone Layers: the frame keeps only 4px of side padding on a phone, 16px on wide screens', () => {
  const { d } = bone();
  const wrap = d.getElementById('boneSvg').parentNode;
  assert.equal(wrap.parentNode.id, 'boneLayersBody');
  // 4vw - 12px is at most 4px up to a 400 px viewport, and reaches 16px at 700 px
  assert.match(wrap.getAttribute('style'), /padding:16px clamp\(4px,4vw - 12px,16px\)/);
});

test('Bone Layers: every stop fits the card budget, and the drawing is deterministic', () => {
  const { t, svgAt } = bone();
  const first = [0, 1, 2, 3, 4, 5].map((v) => svgAt(v).innerHTML);
  first.forEach((h, v) => assert.ok(h.length < 32000, 'stop ' + v + ' is ' + h.length + ' chars'));
  [0, 1, 2, 3, 4, 5].forEach((v) => assert.equal(svgAt(v).innerHTML, first[v], 'stop ' + v + ' redraws the same'));
  // the stick frames (stops 0, 1 and 3) stay under the 40000 snapshot limit, and the card keeps the last one
  const e = t.panel('bone-layers').entry;
  const p = t.panel('bone-layers');
  t.click(p.node.querySelector('.stick-opts .stick-opt[data-i="' + e.predict.key + '"]'));
  assert.equal(p.frames.length, 3);
  p.frames.forEach((f, i) => assert.ok(f.html.length <= 40000, 'frame ' + i + ' is ' + f.html.length + ' chars'));
  t.click(p.node.querySelector('.stick-next'));
  t.click(p.node.querySelector('.stick-opt[data-i="' + e.check.key + '"]'));
  const rec = t.state().stick['bone-layers'];
  const card = t.state().aceCards.find((c) => c.id === rec.cardId);
  assert.ok(card, 'Ace Card saved');
  assert.match(card.explanation, /outer circumferential lamellae/, 'card keeps the picture');
  assert.match(card.explanation, /<g opacity="0\.8"><rect x="14" y="194"/, 'card picture shows the zoom at 0.8');
});
