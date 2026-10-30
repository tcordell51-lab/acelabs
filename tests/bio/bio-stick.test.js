/* Unit tests for the Bio "Call it first" layer (tools/bio/bio-stick.js).
 *
 * bio-shared.js, bio-stick-data.js and bio-stick.js are evaluated as ONE
 * script, the way three classic <script> tags share the page's global
 * lexical scope in a browser (STATE and OPERON_STATE are top-level const
 * in bio-shared.js). Reduced motion is on, so frames resolve at once and
 * no timers run.
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
  if (opts.beforeBoot) dom.window.__beforeBoot = opts.beforeBoot;
  // Test-only handles: same eval, so these see the top-level const bindings.
  dom.window.eval(SRC + '\n;window.__STATE = STATE; window.__OPERON = OPERON_STATE;' +
    '\n;if (window.__beforeBoot) window.__beforeBoot(window);');
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

function predict(t, id, pick) {
  const p = t.panel(id);
  t.click(p.node.querySelector('.stick-opts .stick-opt[data-i="' + pick + '"]'));
  return p;
}
function check(t, id, pick) {
  const p = t.panel(id);
  t.click(p.node.querySelector('.stick-next'));
  t.click(p.node.querySelector('.stick-opt[data-i="' + pick + '"]'));
  return p;
}
const trapOf = (key) => (key === 0 ? 1 : 0);

test('mounts one panel per physiology entry, veils the visualizers, no errors', () => {
  const t = boot('bio-physiology.html');
  const ids = Object.keys(t.w.BioStick.panels).sort();
  assert.deepEqual(ids, ['action-potential', 'blood-types', 'bohr', 'bone-layers', 'cross-bridge', 'endocrine', 'nephron', 'ovarian-cycle', 'sarcomere']);
  assert.ok(t.w.document.querySelectorAll('.stick-veiled').length >= 9);
  ids.forEach((id) => assert.ok(t.panel(id).node.classList.contains('is-fresh'), id + ' starts fresh'));
  assert.deepEqual(t.errs, []);
});

test('a trap pick: frames captured clean, Needs review with the named trap, card due now', () => {
  const t = boot('bio-physiology.html');
  const e = t.panel('nephron').entry;
  const p = predict(t, 'nephron', trapOf(e.predict.key));
  assert.equal(p.frames.length, 2);
  p.frames.forEach((f) => {
    assert.ok(f.html.length > 100, 'frame has a picture');
    assert.ok(!/\sid="(?![^"]*--s)/.test(f.html), 'every id in a frame clone is renamed');
    assert.ok(!/\sdata-/.test(f.html), 'no data attributes in a frame clone');
  });
  const v = p.node.querySelector('.stick-verdict').textContent;
  assert.match(v, /Needs review/);
  assert.match(v, /The trap:/);
  assert.equal(t.w.document.querySelectorAll('.lab-module[data-module="nephron"] .stick-veiled').length, 0, 'veil lifts after the prediction');
  check(t, 'nephron', e.check.key);
  const st = t.state();
  const rec = st.stick.nephron;
  assert.equal(rec.pOk, false);
  assert.equal(rec.cOk, true);
  const card = st.aceCards.find((c) => c.id === rec.cardId);
  assert.ok(card, 'card saved');
  assert.equal(card.origin, 'Visualizer: Nephron');
  assert.equal(card.subject, 'physiology');
  assert.equal(card.state, 'new');
  assert.ok(card.nextDue <= Date.now(), 'a miss is due now');
  assert.ok(card.q.includes('ascending limb'), 'card asks the question that slipped');
  assert.ok(/See it move again/.test(card.explanation));
  assert.ok(t.store.get('acethedat_bio_engine_v1').includes('"stick"'), 'persisted through saveState');
});

test('a clean pass: Confirmed twice, the card is rated Good once and returns tomorrow', () => {
  const t = boot('bio-physiology.html');
  const e = t.panel('action-potential').entry;
  predict(t, 'action-potential', e.predict.key);
  assert.match(t.panel('action-potential').node.querySelector('.stick-verdict').textContent, /Confirmed/);
  check(t, 'action-potential', e.check.key);
  const st = t.state();
  const card = st.aceCards.find((c) => c.id === st.stick['action-potential'].cardId);
  assert.equal(card.reps, 1);
  assert.equal(card.state, 'review');
  const days = (card.nextDue - Date.now()) / 86400000;
  assert.ok(days > 0.9 && days < 1.1, 'due in about one day, got ' + days);
  assert.match(t.panel('action-potential').node.textContent, /comes back in a day/);
});

test('a retake writes no new card and does not rate the old one', () => {
  const t = boot('bio-physiology.html');
  const e = t.panel('cross-bridge').entry;
  predict(t, 'cross-bridge', e.predict.key);
  check(t, 'cross-bridge', e.check.key);
  const st = t.state();
  const before = st.aceCards.length;
  const card = st.aceCards.find((c) => c.id === st.stick['cross-bridge'].cardId);
  const reps = card.reps;
  const p = t.panel('cross-bridge');
  t.click(p.node.querySelector('.stick-done-btn'));
  t.click(p.node.querySelector('.stick-retake'));
  predict(t, 'cross-bridge', trapOf(e.predict.key));
  check(t, 'cross-bridge', trapOf(e.check.key));
  assert.equal(st.aceCards.length, before, 'no new card');
  assert.equal(card.reps, reps, 'old card not rated');
  assert.match(p.node.textContent, /Practice run/);
  assert.equal(st.stick['cross-bridge'].history.length, 2);
});

test('skip unveils and is remembered; Try it brings the prediction back', () => {
  const t = boot('bio-physiology.html');
  const p = t.panel('bohr');
  t.click(p.node.querySelector('.stick-skip'));
  assert.equal(t.state().stick.bohr.skipped, true);
  assert.equal(t.w.document.querySelectorAll('.lab-module[data-module="bohr"] .stick-veiled').length, 0);
  assert.ok(p.node.classList.contains('is-compact'));
  t.click(p.node.querySelector('.stick-try'));
  assert.ok(p.node.classList.contains('is-fresh'));
  assert.equal(t.state().stick.bohr.skipped, false);
});

test('done state survives a reload; a Restart that clears the deck brings the prediction back', () => {
  const first = boot('bio-physiology.html');
  const e = first.panel('endocrine').entry;
  predict(first, 'endocrine', e.predict.key);
  check(first, 'endocrine', e.check.key);
  const saved = first.store.get('acethedat_bio_engine_v1');
  const again = boot('bio-physiology.html', { seed: { acethedat_bio_engine_v1: saved } });
  assert.ok(again.panel('endocrine').node.classList.contains('is-done'));
  const wiped = JSON.parse(saved);
  wiped.aceCards = [];
  const restarted = boot('bio-physiology.html', { seed: { acethedat_bio_engine_v1: JSON.stringify(wiped) } });
  assert.ok(restarted.panel('endocrine').node.classList.contains('is-fresh'));
});

test('a deep link opens the lab tab and the panel', () => {
  const t = boot('bio-physiology.html', { hash: '#stick-repro-missing' });
  assert.equal(t.errs.length, 0, 'unknown hash is ignored');
  const u = boot('bio-physiology.html', { hash: '#stick-ovarian-cycle' });
  assert.ok(u.w.document.querySelector('.lab-module[data-module="repro"]').classList.contains('active'));
});

test('a bad entry is skipped without breaking the others', () => {
  const t = boot('bio-genetics.html', {
    beforeBoot: (w) => w.BIO_STICK_ENTRIES.push({ id: 'broken', hub: 'genetics', mount: '#nowhere', predict: {}, check: {} })
  });
  assert.deepEqual(Object.keys(t.w.BioStick.panels).sort(), ['hardy-weinberg', 'lac-operon']);
  assert.deepEqual(t.errs, []);
});

test('the operon frames drive the real lac operon to full speed', () => {
  const t = boot('bio-genetics.html');
  const e = t.panel('lac-operon').entry;
  predict(t, 'lac-operon', e.predict.key);
  const caps = t.panel('lac-operon').frames.map((f) => f.caption);
  assert.match(caps[0], /OFF/);
  assert.match(caps[caps.length - 1], /MAX/);
  const os = t.w.__OPERON;
  assert.equal(os.lactose, true);
  assert.equal(os.glucose, false);
});

test('every hub boots clean with the layer loaded', () => {
  ['bio-cell.html', 'bio-genetics.html', 'bio-physiology.html', 'bio-diversity.html', 'bio-devo.html', 'bio-evolution.html']
    .forEach((hub) => {
      const t = boot(hub);
      assert.deepEqual(t.errs, [], hub);
    });
});

test('the from-memory check re-veils the visualizer; Done lifts it', () => {
  const t = boot('bio-physiology.html');
  const e = t.panel('blood-types').entry;
  predict(t, 'blood-types', e.predict.key);
  const mod = '.lab-module[data-module="blood"] .stick-veiled';
  assert.equal(t.w.document.querySelectorAll(mod).length, 0, 'unveiled while watching');
  t.click(t.panel('blood-types').node.querySelector('.stick-next'));
  assert.ok(t.w.document.querySelectorAll(mod).length > 0, 'veiled for the closed-book check');
  t.click(t.panel('blood-types').node.querySelector('.stick-opt[data-i="' + e.check.key + '"]'));
  t.click(t.panel('blood-types').node.querySelector('.stick-done-btn'));
  assert.equal(t.w.document.querySelectorAll(mod).length, 0, 'Done lifts the veil');
});

test('Bone Layers: six stops from periosteum to medullary cavity, and its panel drives them', () => {
  const t = boot('bio-physiology.html');
  const d = t.w.document;
  const stage = d.getElementById('boneStage');
  assert.ok(stage, 'slider mounted');
  const names = [];
  for (let v = 0; v <= 5; v++) {
    stage.value = String(v);
    stage.dispatchEvent(new t.w.Event('input', { bubbles: true }));
    names.push(d.getElementById('boneStageName').textContent);
    assert.ok(d.getElementById('boneSvg').innerHTML.length > 2000, 'drawing rendered at stop ' + v);
  }
  assert.match(names[0], /Periosteum/);
  assert.match(names[2], /Osteon/);
  assert.match(names[3], /Endosteum/);
  assert.match(names[5], /Medullary cavity/);
  const e = t.panel('bone-layers').entry;
  const p = predict(t, 'bone-layers', e.predict.key);
  assert.match(p.frames[p.frames.length - 1].caption, /Endosteum/);
  assert.match(p.node.querySelector('.stick-verdict').textContent, /Confirmed/);
});

test('Bone Layers: a true-to-life bone and ground section, small enough for a card', () => {
  const t = boot('bio-physiology.html');
  const d = t.w.document;
  const stage = d.getElementById('boneStage');
  const svgAt = (v) => {
    stage.value = String(v);
    stage.dispatchEvent(new t.w.Event('input', { bubbles: true }));
    return d.getElementById('boneSvg').innerHTML;
  };
  const all = [0, 1, 2, 3, 4, 5].map(svgAt);
  all.forEach((h, v) => {
    assert.ok(/^[\x00-\x7f]*$/.test(h), 'plain ASCII at stop ' + v);
    assert.doesNotMatch(h, /\b(wrong|incorrect|fail|failed)\b/i);
    const ids = [...h.matchAll(/ id="([^"]+)"/g)].map((m) => m[1]);
    assert.equal(new Set(ids).size, ids.length, 'ids unique at stop ' + v);
    assert.ok(ids.every((id) => /^bl-/.test(id)), 'every id carries the bl- prefix');
  });
  // the stick frames (slider values 0, 1 and 3) stay well under the Ace Card limit
  [0, 1, 3].forEach((v) => assert.ok(all[v].length < 32000, 'stop ' + v + ' is ' + all[v].length + ' chars'));
  // the zoom is a ground section cut across the shaft: dark empty canals, no vessels drawn in them
  const z = all[2];
  assert.match(z, /cross-section of compact bone \(ground section\)/);
  assert.match(z, /cross-section here/);
  assert.match(z, /holds vessels/);
  assert.match(z, /and nerves in life/);
  assert.match(t.panel('bone-layers').entry.check.answer, /vessels and nerves/, 'label and check answer agree');
  assert.match(z, /outer circumferential lamellae/);
  assert.match(z, /periosteum removed/);
  assert.doesNotMatch(z, /fill="#b5463f"/, 'no red vessel inside a canal');
  // spongy bone fills the ends: its highlight traces the region (the only ellipse left is the cut plane)
  assert.equal((all[4].match(/<ellipse/g) || []).length, 1);
  assert.match(all[4], /mostly yellow marrow/);
  // the endosteum stage lines every strut: the strut paths are painted twice, at both ends
  const strutUses = (h) => (h.match(/<use href="#bl-t0"/g) || []).length;
  assert.equal(strutUses(all[3]), 4);
  assert.equal(strutUses(all[0]), 2);
});

test('Bone Layers: trabeculae fill the metaphysis core, and the cavity opens near the shaft', () => {
  const t = boot('bio-physiology.html');
  const d = t.w.document;
  const stage = d.getElementById('boneStage');
  const svgAt = (v) => {
    stage.value = String(v);
    stage.dispatchEvent(new t.w.Event('input', { bubbles: true }));
    return d.getElementById('boneSvg').innerHTML;
  };
  const h = svgAt(0);
  // every strut and tie of the upper-end lattice, as quadratics (a straight piece gets a midpoint control)
  const pieces = [];
  for (const m of h.matchAll(/id="bl-t\d" d="([^"]+)"/g)) {
    for (const seg of m[1].split('M').filter(Boolean)) {
      const n = seg.match(/-?[\d.]+/g).map(Number);
      pieces.push(/Q/.test(seg) ? n : [n[0], n[1], (n[0] + n[2]) / 2, (n[1] + n[3]) / 2, n[2], n[3]]);
    }
  }
  assert.ok(pieces.length > 150, 'lattice parsed');
  const crossings = (x) => {
    const out = [];
    pieces.forEach((q) => {
      let prev = null;
      for (let i = 0; i <= 24; i++) {
        const s = i / 24, u = 1 - s;
        const p = [u * u * q[0] + 2 * u * s * q[2] + s * s * q[4], u * u * q[1] + 2 * u * s * q[3] + s * s * q[5]];
        if (prev && (prev[0] - x) * (p[0] - x) <= 0 && prev[0] !== p[0]) out.push(prev[1] + (p[1] - prev[1]) * (x - prev[0]) / (p[0] - prev[0]));
        prev = p;
      }
    });
    return out;
  };
  // across the metaphysis (x 52-80), no strut-free run along the axis band (y 85-105) is wider than 7
  for (let x = 52; x <= 80; x += 1) {
    const ys = [85, 105, ...crossings(x).filter((y) => y > 85 && y < 105)].sort((a, b) => a - b);
    for (let i = 1; i < ys.length; i++) assert.ok(ys[i] - ys[i - 1] < 7, 'gap of ' + (ys[i] - ys[i - 1]).toFixed(1) + ' at x ' + x);
  }
  // the open cavity starts near x 100: no strut crosses the middle there
  [100, 105, 110].forEach((x) => assert.equal(crossings(x).filter((y) => y > 86 && y < 104).length, 0, 'open marrow at x ' + x));
  // the epiphyseal plates read as plates (dark edge, pale core); each leader ends on a plate with a dot
  // (the DOM serializes an empty element as <x ...></x>; E matches either form of its end)
  const E = '(?:/>|></\\w+>)';
  assert.match(h, new RegExp('stroke="#cbb88c" stroke-width="4"' + E + '<path d="M49\\.5,45\\.5[^"]*" fill="none" stroke="#fbf6e6"'));
  assert.match(h, /M105,161L49\.7,134\.7M255,161L309\.8,132\.2/);
  assert.match(h, new RegExp('<circle cx="49\\.7" cy="134\\.7" r="1\\.6"' + E + '<circle cx="309\\.8" cy="132\\.2" r="1\\.6"'));
  // the ends are simplified caps (no femoral head), so the femur is a comparison, not a claim
  assert.match(h, /upper end \(like adult femur\): red marrow/);
  assert.match(h, /lower end: mostly yellow marrow/);
  assert.match(d.getElementById('boneSvg').getAttribute('aria-label'), /^Long bone like an adult femur, cut lengthwise/);
  // the cavity and spongy outlines leave their open edge dashed, not walled off
  const med = svgAt(5), spongy = svgAt(4);
  assert.match(med, new RegExp('<path d="M111,80L249,80M111,110L249,110" stroke-width="3"' + E + '<path d="M249,80[^"]*" stroke-width="2" stroke-dasharray="2 2"'));
  assert.match(spongy, /stroke-width="2" stroke-dasharray="2 2"/);
});

test('Bone Layers: the lacunae leader ends on a lacuna, clear of any canal; lacunae look like spiders', () => {
  const t = boot('bio-physiology.html');
  const d = t.w.document;
  const stage = d.getElementById('boneStage');
  stage.value = '2';
  stage.dispatchEvent(new t.w.Event('input', { bubbles: true }));
  const svg = d.getElementById('boneSvg');
  const segs = (dd) => [...dd.matchAll(/M(-?[\d.]+),(-?[\d.]+)l(-?[\d.]+),(-?[\d.]+)/g)].map((m) => m.slice(1).map(Number));
  // lacunae of the osteon placed at (299, 343), in page units
  const use = [...svg.querySelectorAll('use')].find((u) => /translate\(299 343\)/.test(u.getAttribute('transform') || ''));
  assert.ok(use, 'osteon at 299,343 placed');
  const tf = use.getAttribute('transform');
  const rot = +/rotate\(([-\d.]+)\)/.exec(tf)[1] * Math.PI / 180;
  const sc = /scale\(([-\d.]+)(?: ([-\d.]+))?\)/.exec(tf);
  const sx = +sc[1], sy = +(sc[2] || sc[1]);
  const tpl = svg.querySelector(use.getAttribute('href')).querySelectorAll('path');
  const lacunae = segs(tpl[2].getAttribute('d')).map(([x, y, dx, dy]) => {
    const u = (x + dx / 2) * sx, v = (y + dy / 2) * sy;
    return [299 + u * Math.cos(rot) - v * Math.sin(rot), 343 + u * Math.sin(rot) + v * Math.cos(rot)];
  });
  // the "lacunae + canaliculi" leader is the last piece of the leader path
  const lead = [...svg.querySelectorAll('path')].find((p) => /^M70,224L/.test(p.getAttribute('d'))).getAttribute('d');
  const [ax, ay, bx, by] = lead.split('M').filter(Boolean).pop().split(/[L,]/).map(Number);
  const offLine = Math.abs((299 - ax) * (by - ay) - (343 - ay) * (bx - ax)) / Math.hypot(bx - ax, by - ay);
  assert.ok(offLine >= 10, 'leader line passes ' + offLine.toFixed(1) + ' from the canal center');
  const onLac = Math.min(...lacunae.map(([x, y]) => Math.hypot(x - bx, y - by)));
  assert.ok(onLac < 2.2, 'leader ends ' + onLac.toFixed(2) + ' from a lacuna center');
  assert.match(svg.innerHTML, /\(held osteocytes in life\)/);
  // each lacuna's five fan canaliculi cross at its center (six lines per lacuna, fan first)
  ['#bl-oA', '#bl-oB'].forEach((id) => {
    const ps = svg.querySelector(id).querySelectorAll('path');
    const lac = segs(ps[2].getAttribute('d')), can = segs(ps[1].getAttribute('d'));
    assert.equal(can.length, lac.length * 6);
    lac.forEach(([x, y, dx, dy], i) => {
      const c = [x + dx / 2, y + dy / 2];
      for (let k = 0; k < 5; k++) {
        const [px, py, qx, qy] = can[i * 6 + k];
        const off = Math.abs((c[0] - px) * qy - (c[1] - py) * qx) / Math.hypot(qx, qy);
        assert.ok(off < 0.5, id + ' lacuna ' + i + ' line ' + k + ' misses its center by ' + off.toFixed(2));
      }
    });
  });
  // the medullary cavity label sits clear of the cavity edge (y 110), under the stop-6 dot
  stage.value = '5';
  stage.dispatchEvent(new t.w.Event('input', { bubbles: true }));
  const med = svg.innerHTML;
  assert.match(med, /<text x="180" y="105\.5"[^>]*>medullary cavity<\/text>/);
  assert.match(med, /<circle cx="180" cy="90" r="3\.5"/);
});

test('true-to-life views: microscope red cells and plant cells, and the TEM band strip', () => {
  const cell = boot('bio-cell.html');
  const d = cell.w.document;
  const set = (v) => { const s = d.getElementById('tonSolute'); s.value = String(v); s.dispatchEvent(new cell.w.Event('input', { bubbles: true })); };
  set(50);
  assert.match(d.getElementById('tonCellSvg').innerHTML, /LIGHT MICROSCOPE/);
  assert.match(d.getElementById('tonCellSvg').innerHTML, /biconcave/);
  set(4);
  assert.match(d.getElementById('tonCellSvg').innerHTML, /ghosts/);
  set(95);
  assert.match(d.getElementById('tonCellSvg').innerHTML, /crenated/);
  d.querySelector('.ton-cell-btn[data-cell="plant"]').click();
  assert.match(d.getElementById('tonCellSvg').innerHTML, /Plasmolysis/);
  const phys = boot('bio-physiology.html');
  const pd = phys.w.document;
  assert.ok(pd.getElementById('sfTem'), 'TEM strip mounted under the sarcomere model');
  pd.querySelector('[data-sf="relaxed"]').click();
  assert.match(pd.getElementById('sfTem').innerHTML, /H zone/);
  pd.querySelector('[data-sf="contracted"]').click();
  assert.doesNotMatch(pd.getElementById('sfTem').innerHTML, /H zone/, 'H zone closes at full contraction');
  assert.match(pd.getElementById('sfTem').innerHTML, /A band/);
});

test('tonicity camera views: true scale, red cell shapes, Elodea, solute strip, and small frames', () => {
  const t = boot('bio-cell.html');
  const ton = (cellType, ext) => t.w.BioReal.tonicity({ cellType, externalSolute: ext, lysed: cellType === 'rbc' && ext < 12, plasmolyzed: cellType === 'plant' && ext > 80 });
  const exts = [0, 4, 10, 18, 25, 32, 45, 50, 55, 60, 75, 81, 92, 100];
  for (const c of ['rbc', 'plant']) {
    for (const e of exts) {
      const s = ton(c, e);
      assert.equal(s, ton(c, e), 'deterministic: ' + c + ' ' + e);
      assert.ok(s.length < 60000, c + ' ' + e + ' is ' + s.length + ' characters');
      assert.match(s, /^[\x20-\x7e]*$/, 'plain ASCII');
      assert.doesNotMatch(s, /NaN|undefined|\b(wrong|incorrect|fail|failed|spiky)\b/i);
      // a rectangular camera crop with the magnification in the caption, no round eyepiece field
      assert.match(s, /<clipPath id="rl-clip"><rect /);
      assert.match(s, c === 'rbc' ? />1000x oil, cropped</ : />400x, cropped</);
      // the caption wraps to at most two lines that fit the crop
      const lines = s.match(/<text [^>]*font-size="12"[^>]*>[^<]*</g) || [];
      assert.ok(lines.length >= 1 && lines.length <= 2, 'caption lines: ' + lines.length);
      // scale bars match the drawing: red cells 5.6 px per um (10 um = 56 px), Elodea 1.2 px per um (50 um = 60 px)
      const bar = s.match(/d="M([\d.]+),310H([\d.]+)"/);
      assert.equal(+bar[2] - +bar[1], c === 'rbc' ? 56 : 60);
      assert.match(s, c === 'rbc' ? />10 um</ : />50 um</);
    }
  }
  // the four stick frames stay well under the Ace Card limit
  for (const e of [50, 32, 18, 4]) assert.ok(ton('rbc', e).length < 32000, 'stick frame ' + e);
  const caption = (s) => (s.match(/<text [^>]*font-size="12"[^>]*>[^<]*</g) || []).map((x) => x.replace(/<[^>]*>|</g, '')).join(' ');
  const radius = (s) => +s.match(/id="rl-d"[^>]*?r="([\d.]+)"|<g id="rl-d"><circle r="([\d.]+)"/).slice(1).find(Boolean);
  const iso = ton('rbc', 50), cup = ton('rbc', 32), sphere = ton('rbc', 18), lysed = ton('rbc', 4), cren = ton('rbc', 92);
  // isotonic: round discs (7.5 um), two seen edge-on, one overlapping pair
  assert.equal(radius(iso), 21);
  assert.equal((iso.match(/href="#rl-e"/g) || []).length, 2);
  assert.equal((iso.match(/mix-blend-mode:multiply/g) || []).length, 1);
  // hypotonic: a slit-shaped pallor first, then spheres a little narrower than the disc
  assert.match(cup, /<ellipse rx="[\d.]+" ry="[\d.]+" fill="#f0d0c9"/);
  assert.match(caption(cup), /swell into cups/);
  assert.doesNotMatch(sphere, /fill="#f0d0c9"/);
  assert.ok(radius(sphere) < 21 && radius(sphere) > 18, 'sphere radius ' + radius(sphere));
  assert.match(caption(sphere), /more volume, a bit narrower/);
  // hemolysis: smooth ghosts about 6.7 um (0.9 of the disc), no torn outlines, an emptied inside box
  assert.equal(radius(lysed), 18.9);
  assert.doesNotMatch(lysed, /stroke-dasharray/);
  assert.match(caption(lysed), /\(ghosts\)/);
  assert.match(lysed, />contents released</);
  // hypertonic: 14 to 18 short projections per cell, no spikes in the words
  assert.match(cren, /id="rl-d14"/);
  assert.match(cren, /id="rl-d18"/);
  assert.match(caption(cren), /short blunt projections/);
  // solute inside the cell: more dots as the cell loses water, fewer as it gains water
  const inside = (s) => {
    const m = s.match(/<rect x="14" y="301"[^>]*\/><path d="([^"]*)"/);
    return m ? (m[1].match(/h0/g) || []).length : 0;
  };
  assert.ok(inside(cren) > inside(iso) && inside(iso) > inside(sphere), [inside(cren), inside(iso), inside(sphere)].join(' '));
  assert.equal(inside(lysed), 0);
  // Elodea: named in every caption, 56 chloroplasts per cell in every state, strands only in plasmolysis
  const count = (s) => ((s.match(/id="rl-cw" d="([^"]*)"/)[1] + s.match(/id="rl-cf" d="([^"]*)"/)[1]).match(/l/g) || []).length;
  const cells = (s) => [...s.matchAll(/<path d="([^"]*)" fill="#e8eddb"/g)].reduce((n, m) => n + (m[1].match(/M/g) || []).length, 0);   // one protoplast per cell
  for (const e of [20, 50, 75, 92]) {
    const s = ton('plant', e);
    assert.match(caption(s), /Elodea leaf cells/);
    assert.equal(count(s), 56 * cells(s), 'chloroplasts at ' + e);
    if (e < 70) assert.doesNotMatch(s, /stroke="#9db07a"/, 'no strands at ' + e);
  }
  assert.match(ton('plant', 92), /stroke="#9db07a"/);
  assert.match(caption(ton('plant', 92)), /^Plasmolysis/);
  assert.doesNotMatch(ton('plant', 50), /nucleus|onion/i);
});

test('tonicity: chloroplasts stay inside the membrane, strands only in named plasmolysis, boundary steps, blunt bumps', () => {
  const t = boot('bio-cell.html');
  const ton = (cellType, ext) => t.w.BioReal.tonicity({ cellType, externalSolute: ext, lysed: cellType === 'rbc' && ext < 12, plasmolyzed: cellType === 'plant' && ext > 80 });
  const caption = (s) => (s.match(/<text [^>]*font-size="12"[^>]*>[^<]*</g) || []).map((x) => x.replace(/<[^>]*>|</g, '')).join(' ');
  // protoplast outlines (M, L and Q commands), flattened to polygons
  const protoplasts = (s) => {
    const out = [];
    for (const m of s.matchAll(/<path d="([^"]*)" fill="#e8eddb"/g)) {
      for (const sp of m[1].split('M').filter(Boolean)) {
        const poly = [];
        let cur;
        for (const tk of ('M' + sp).match(/[MLQZ][^MLQZ]*/g)) {
          const n = tk.slice(1).trim().split(/[ ,]+/).filter(Boolean).map(Number);
          if (tk[0] === 'M' || tk[0] === 'L') { cur = [n[0], n[1]]; poly.push(cur); }
          else if (tk[0] === 'Q') {
            for (let k = 1; k <= 8; k++) { const u = k / 8, v = 1 - u; poly.push([v * v * cur[0] + 2 * v * u * n[0] + u * u * n[2], v * v * cur[1] + 2 * v * u * n[1] + u * u * n[3]]); }
            cur = [n[2], n[3]];
          }
        }
        const xs = poly.map((q) => q[0]), ys = poly.map((q) => q[1]);
        out.push({ poly, box: [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)] });
      }
    }
    return out;
  };
  const inside = (p, poly) => {
    let c = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const a = poly[i], b = poly[j];
      if ((a[1] > p[1]) !== (b[1] > p[1]) && p[0] < (b[0] - a[0]) * (p[1] - a[1]) / (b[1] - a[1]) + a[0]) c = !c;
    }
    return c;
  };
  const edgeDist = (p, poly) => {
    let d = Infinity;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const a = poly[j], b = poly[i], vx = b[0] - a[0], vy = b[1] - a[1];
      const u = Math.max(0, Math.min(1, ((p[0] - a[0]) * vx + (p[1] - a[1]) * vy) / (vx * vx + vy * vy || 1)));
      d = Math.min(d, Math.hypot(p[0] - a[0] - u * vx, p[1] - a[1] - u * vy));
    }
    return d;
  };
  // each chloroplast is a short round-capped stroke: its two end points (M/m moves, l lines)
  const ends = (s, id) => {
    const pts = [];
    let cur = [0, 0];
    for (const tk of s.match(new RegExp('id="' + id + '" d="([^"]*)"'))[1].match(/[MmLl][^MmLl]*/g)) {
      const [x, y] = tk.slice(1).split(',').map(Number);
      if (tk[0] === 'M') cur = [x, y];
      else if (tk[0] === 'm') cur = [cur[0] + x, cur[1] + y];
      else { pts.push(cur); cur = [cur[0] + x, cur[1] + y]; pts.push(cur); }
    }
    return pts;
  };
  for (const e of [0, 20, 45, 50, 55, 70, 80, 81, 85, 88, 92, 96, 100]) {
    const s = ton('plant', e), P = protoplasts(s);
    // the whole capsule (end point plus half the stroke width) lies inside a protoplast:
    // no chloroplast sits in the clear space between membrane and wall
    for (const [id, col] of [['rl-cf', '#4f8a3d'], ['rl-cw', '#346c2b']]) {
      const half = +s.match(new RegExp('href="#' + id + '" stroke="' + col + '" stroke-width="([\\d.]+)"'))[1] / 2;
      for (const p of ends(s, id)) {
        const ok = P.some((q) => p[0] >= q.box[0] && p[0] <= q.box[2] && p[1] >= q.box[1] && p[1] <= q.box[3] && inside(p, q.poly) && edgeDist(p, q.poly) >= half - 0.05);
        assert.ok(ok, id + ' at ' + p.map((v) => v.toFixed(1)).join(',') + ' crosses the membrane at ext ' + e);
      }
    }
  }
  for (let e = 0; e <= 100; e++) {
    const s = ton('plant', e);
    // Hechtian strands exist only once the membrane has pulled off the wall, so only where the caption names plasmolysis
    assert.equal(/stroke="#9db07a"/.test(s), /^Plasmolysis/.test(caption(s)), 'strands vs caption at ' + e);
    // the picture and the words agree at every step: turgid means no gaps at the wall
    if (/turgid/.test(caption(s))) assert.doesNotMatch(s, /stroke="#8f9c72"/, 'turgid cells show no gap at ' + e);
    // strip and scale labels are 11 or larger, the caption 12
    for (const m of s.matchAll(/font-size="([\d.]+)"/g)) assert.ok(+m[1] >= 11, 'font ' + m[1] + ' at ' + e);
  }
  // the first hypertonic step is not the isotonic picture: every membrane leaves the corners
  const gaps = (s) => { const m = s.match(/<path d="([^"]*)" fill="#e8eddb"[^>]*stroke="#8f9c72"/); return m ? (m[1].match(/M/g) || []).length : 0; };
  const flats = (s) => { const m = s.match(/<path d="([^"]*)" fill="#e8eddb"[^>]*stroke="#aab48e"/); return m ? (m[1].match(/M/g) || []).length : 0; };
  assert.equal(flats(ton('plant', 55)), 0);
  assert.ok(gaps(ton('plant', 50)) > 0 && flats(ton('plant', 50)) > 0, 'isotonic: corner gaps in some cells, not all');
  assert.match(caption(ton('plant', 45)), /turgid/);
  assert.match(caption(ton('plant', 80)), /starts to leave the corners/);
  assert.doesNotMatch(caption(ton('plant', 80)), /plasmoly/i);
  // red cells: the slit and the cup caption go together; the first crenated step says the cells start to shrink
  for (let e = 12; e <= 45; e++) {
    const s = ton('rbc', e);
    assert.equal(/<ellipse [^>]*fill="#f0d0c9"/.test(s), /swell into cups/.test(caption(s)), 'slit vs caption at ' + e);
  }
  assert.match(caption(ton('rbc', 55)), /start to shrink/);
  // crenation bumps are blunt: at least 16 outline points per bump
  const cren = ton('rbc', 92);
  for (const n of [14, 16, 18]) {
    const d = cren.match(new RegExp('<g id="rl-d' + n + '"><path d="([^"]*)"'))[1];
    assert.ok(d.split(' ').length / n >= 16, 'points per bump for ' + n);
  }
});

test('sarcomere to scale: thin shorter than thick, actin beside myosin, I band across the Z disc, TEM follows', () => {
  const t = boot('bio-physiology.html');
  const d = t.w.document;
  const num = (id, a) => parseFloat(d.getElementById(id).getAttribute(a));
  // heads: none in the bare zone around the M line (x 345 to 375); the M line is drawn
  const thk = d.getElementById('sf-thk');
  const headX = [...thk.querySelectorAll('path')].flatMap((p) => [...p.getAttribute('d').matchAll(/M(\d+(?:\.\d+)?),/g)].map((m) => +m[1]));
  assert.ok(headX.length >= 20, 'myosin heads drawn');
  assert.ok(headX.every((x) => x < 345 || x > 375), 'a head-free bare zone at the center');
  assert.ok([...thk.querySelectorAll('line')].some((l) => l.getAttribute('x1') === '360' && l.getAttribute('x2') === '360'), 'M line drawn');
  // actin runs beside the thick filament, above and below the rod, not through it
  const rod = d.getElementById('sf-myosin');
  const rodTop = num('sf-myosin', 'y'), rodBot = rodTop + num('sf-myosin', 'height');
  assert.ok(num('sf-actin-L', 'y1') < rodTop && num('sf-actin-Lb', 'y1') > rodBot, 'thin filaments flank the rod');
  assert.equal(rod.getAttribute('width'), '320', 'thick filament 1.6 um at 200 px per um');
  const want = { relaxed: [480, 80], contracting: [440, 40], contracted: [400, 0] };
  for (const [st, [zz, h]] of Object.entries(want)) {
    d.querySelector('[data-sf="' + st + '"]').click();
    const zL = num('sf-zL', 'x1'), zR = num('sf-zR', 'x1');
    assert.equal(zR - zL, zz, st + ': Z to Z');
    assert.equal(num('sf-actin-L', 'x2') - num('sf-actin-L', 'x1'), 200, st + ': thin filament keeps 1.0 um');
    assert.equal(num('sf-actin-R', 'x1') - num('sf-actin-R', 'x2'), 200, st + ': thin filament keeps 1.0 um');
    assert.equal(num('sf-actin-R', 'x2') - num('sf-actin-L', 'x2'), h, st + ': H zone');
    assert.equal(num('sf-Iband-L', 'x'), zL, st + ': I band label centered on its Z disc');
    const br = d.getElementById('sf-Ibr-L').getAttribute('d').match(/M(-?[\d.]+),\d+V\d+H(-?[\d.]+)/);
    assert.equal((+br[1] + +br[2]) / 2, zL, st + ': I band bracket spans the Z disc');
    assert.equal(d.getElementById('sf-Hzone').getAttribute('opacity'), h > 0 ? '1' : '0');
    assert.equal(d.getElementById('sf-Mlead').getAttribute('opacity'), h > 0 ? '0' : '1', st + ': M line leader once the H zone bracket hides');
    const tips = [...d.getElementById('sf-tips').getAttribute('d').matchAll(/M(-?[\d.]+),/g)].map((m) => +m[1]);
    assert.deepEqual(tips, [zL + 200, zL + 200, zR - 200, zR - 200], st + ': caps on the free ends of the thin filaments');
    const ro = d.getElementById('sfReadout').textContent;
    assert.match(ro, new RegExp('Z to Z ' + (zz / 200).toFixed(1) + ' um'));
    // the relaxed text sits under the stick veil, so only the later states say it
    if (st !== 'relaxed') assert.match(ro, /A band (holds|still) /);
    assert.doesNotMatch(ro, /[^\x00-\x7F]/, 'plain ASCII readout');
    // the TEM strip follows the model: triads at both A-I junctions,
    // a mitochondrion on each side of each Z disc, two myofibrils
    const tem = d.getElementById('sfTem');
    const at = (href) => [...tem.querySelectorAll('use')].filter((u) => u.getAttribute('href') === href).map((u) => +u.getAttribute('x'));
    assert.equal(at('#rl-tmf').length, 2, st + ': two myofibrils');
    assert.ok(at('#rl-ttri').includes(200) && at('#rl-ttri').includes(520), st + ': triads at the A-I junctions');
    // mitochondria in pairs at the Z disc, each one inside its half I band
    const iH = 200 - zL, mrx = 16, mo = 4 + mrx;
    assert.ok(at('#rl-tmito').includes(zL - mo) && at('#rl-tmito').includes(zL + mo), st + ': mitochondria in pairs at the Z disc');
    assert.equal(+tem.querySelector('#rl-tmito ellipse').getAttribute('rx'), mrx, st + ': mitochondrion keeps one size');
    assert.ok(mo + mrx <= iH - 4, st + ': mitochondrion stays clear of the A-I junction');
    // the M line is never paler than the overlap: once the thin filaments
    // reach it (full contraction) it takes the overlap gray, not #3d3d3d
    assert.equal(/fill="#3d3d3d"/.test(tem.innerHTML), h > 0, st + ': M line gray');
    const iText = [...tem.querySelectorAll('text')].find((x) => x.textContent === 'I band');
    assert.equal(+iText.getAttribute('x'), zL, st + ': TEM I band label centered on the Z disc');
    assert.match(tem.innerHTML, /Z disc in middle/);
    assert.match(tem.innerHTML, />triad</);
    assert.match(tem.innerHTML, />mitochondria</);
  }
  // the last stick frame (both pictures) fits on an Ace Card
  const p = predict(t, 'sarcomere', t.panel('sarcomere').entry.predict.key);
  const last = p.frames[p.frames.length - 1].html;
  assert.ok(last.length <= 32000, 'last frame ' + last.length + ' chars');
  assert.match(last, /TEM VIEW/);
});

test('cross-bridge cycle: each I band is centered on its Z disc, and the readout counts the whole I band', () => {
  const t = boot('bio-physiology.html');
  const d = t.w.document;
  const slide = (v) => { const s = d.getElementById('cbStage'); s.value = String(v); s.dispatchEvent(new t.w.Event('input', { bubbles: true })); };
  for (const [v, zL] of [[0, 160], [90, 190]]) {
    slide(v);
    const svg = d.getElementById('cbSvg');
    const zs = [...svg.querySelectorAll('line')].filter((l) => l.getAttribute('stroke-width') === '4').map((l) => +l.getAttribute('x1'));
    assert.deepEqual(zs, [zL, 800 - zL], v + ': Z discs');
    const labels = [...svg.querySelectorAll('text')].filter((x) => x.textContent === 'I band').map((x) => +x.getAttribute('x'));
    assert.deepEqual(labels, zs, v + ': one I band label on each Z disc');
    assert.doesNotMatch(svg.innerHTML, /I-band/, v + ': no half I band labels');
    const br = [...svg.querySelectorAll('line')].filter((l) => l.getAttribute('y1') === '236' && l.getAttribute('stroke') === '#5b6b62');
    assert.equal(br.length, 2, v + ': two I band brackets');
    br.forEach((l, i) => {
      assert.equal((+l.getAttribute('x1') + +l.getAttribute('x2')) / 2, zs[i], v + ': bracket centered on its Z disc');
      assert.equal(+l.getAttribute('x2') - +l.getAttribute('x1'), 2 * (240 - zL) - 6, v + ': bracket runs A band to A band');
    });
    assert.equal(d.getElementById('cbIBand').textContent, (2 * (240 - zL) / 200).toFixed(1) + ' um', v + ': whole I band in the readout');
  }
});
