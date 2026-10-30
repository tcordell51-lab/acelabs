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
  // Elodea: named in every caption, 44 chloroplasts per cell in every state, strands only in plasmolysis
  const count = (s) => ((s.match(/id="rl-cw" d="([^"]*)"/)[1] + s.match(/id="rl-cf" d="([^"]*)"/)[1]).match(/l/g) || []).length;
  const cells = (s) => (s.match(/<path d="([^"]*)" fill="#eef1e4"/)[1].match(/M/g) || []).length;   // one protoplast per cell
  for (const e of [20, 50, 75, 92]) {
    const s = ton('plant', e);
    assert.match(caption(s), /Elodea leaf cells/);
    assert.equal(count(s), 44 * cells(s), 'chloroplasts at ' + e);
    if (e < 70) assert.doesNotMatch(s, /stroke="#9db07a"/, 'no strands at ' + e);
  }
  assert.match(ton('plant', 92), /stroke="#9db07a"/);
  assert.match(caption(ton('plant', 92)), /^Plasmolysis/);
  assert.doesNotMatch(ton('plant', 50), /nucleus|onion/i);
});
