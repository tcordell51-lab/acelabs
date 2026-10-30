/* Unit tests for "Which one is this?" (tools/bio/bio-recognize.js) and the
 * seeded, bare tonicity fields it shows (BioReal.field / BioReal.tonicity
 * with seed, bare and ns, in tools/bio/bio-real.js).
 *
 * The page scripts are evaluated as ONE script, the way classic <script>
 * tags share the page's global lexical scope in a browser (same boot as
 * bio-stick.test.js, with bio-recognize.js added). Reduced motion is on,
 * so no timers run.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

const BIO = path.join(__dirname, '..', '..', 'tools', 'bio');
const SRC = ['bio-shared.js', 'bio-real.js', 'bio-bone.js', 'bio-stick-data.js', 'bio-stick.js', 'bio-recognize.js']
  .map((f) => fs.readFileSync(path.join(BIO, f), 'utf8')).join('\n;\n');
// the keys the Bio engine itself writes; nothing here may add another
const ENGINE_KEYS = ['acethedat_bio_engine_v1', 'acethedat_bio_progress', 'acethedat_bio_due_count', 'acethedat_bio_last_session'];

const OPEN = [];
test.afterEach(() => { while (OPEN.length) { try { OPEN.pop().close(); } catch (e) { /* already closed */ } } });

function boot(hub, opts = {}) {
  const html = fs.readFileSync(path.join(BIO, hub), 'utf8');
  const dom = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true, url: 'http://localhost/tools/bio/' + hub });
  const store = opts.store || new Map();
  const written = new Set();
  Object.defineProperty(dom.window, 'localStorage', {
    value: {
      getItem: (k) => (store.has(k) ? store.get(k) : null),
      setItem: (k, v) => { written.add(k); store.set(k, String(v)); },
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
    w, store, written, errs,
    d: w.document,
    state: () => w.__STATE,
    panel: () => w.BioRecognize.panel,
    click: (el) => el.dispatchEvent(new w.MouseEvent('click', { bubbles: true }))
  };
}

// a bare window with only the renderer, for the field tests
let REAL = null;
function real() {
  if (REAL) return REAL;
  const dom = new JSDOM('<!doctype html><body></body>', { runScripts: 'outside-only' });
  dom.window.eval(fs.readFileSync(path.join(BIO, 'bio-real.js'), 'utf8'));
  REAL = dom.window.BioReal;
  return REAL;
}
const STATE_OF = { animal: [['hypo', 14, 34], ['iso', 46, 54], ['hyper', 68, 100], ['burst', 0, 10]], plant: [['hypo', 0, 44], ['iso', 46, 54], ['hyper', 65, 100]] };
function field(cell, ext, seed, ns) {
  return real().field({ cellType: cell, externalSolute: ext, lysed: cell === 'animal' && ext < 12, plasmolyzed: cell === 'plant' && ext > 60, seed, bare: true, ns: ns || 'tq' });
}
// every (cell, state) pair, at seeded points across its range
function* fields(n) {
  for (const cell of ['animal', 'plant']) {
    for (const [state, lo, hi] of STATE_OF[cell]) {
      for (let k = 0; k < n; k++) {
        const ext = lo + ((k * 7) % (hi - lo + 1));
        yield { cell, state, ext, seed: 1000 + k * 7919, f: field(cell, ext, 1000 + k * 7919) };
      }
    }
  }
}

/* ---------- measurements on the markup ---------- */

// source without its comments (a comment may name what the code avoids)
const code = (f) => fs.readFileSync(path.join(BIO, f), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'])\/\/.*$/gm, '$1');
const luma = (h) => { const v = [1, 3, 5].map((i) => parseInt(h.substr(i, 2), 16)); return 0.299 * v[0] + 0.587 * v[1] + 0.114 * v[2]; };
function redLook(s) {
  const g = s.match(/<radialGradient id="tq-rbc">(.*?)<\/radialGradient>/);
  const stops = g ? [...g[1].matchAll(/stop-color="(#[0-9a-f]{6})"/g)].map((m) => m[1]) : [];
  // a crenated outline: the radius of its points swings by 5 percent or more, in 14 bumps
  // (runs of points above the middle radius, counted round the outline)
  let bumpy = 0, bumps = 0;
  const cren = s.match(/<g id="tq-d14"><path d="M([^"Z]*)Z"/);
  if (cren) {
    const r = cren[1].split(' ').map((p) => { const [x, y] = p.split(',').map(Number); return Math.hypot(x, y); });
    const lo = Math.min(...r), hi = Math.max(...r), mid = (lo + hi) / 2;
    bumpy = hi / lo;
    for (let i = 0; i < r.length; i++) if (r[i] > mid && r[(i + r.length - 1) % r.length] <= mid) bumps++;
  }
  return {
    pallor: stops.length === 6 ? luma(stops[0]) - luma(stops[5]) : null,
    slit: /<ellipse rx="[\d.]+" ry="[\d.]+" fill="#f0d0c9"/.test(s),
    ghosts: /id="tq-d" r="[\d.]+" fill="#f5ebe8" fill-opacity="0.12"/.test(s),
    bumpy, bumps
  };
}
// Elodea: each protoplast (drawing units) against the cell its center sits in
function plantLook(s) {
  const walls = s.match(/<path id="tq-w" d="([^"]*)"/)[1];
  const rows = [...walls.matchAll(/M([\d.-]+),([\d.-]+)H([\d.-]+)/g)].map((m) => +m[2]).sort((a, b) => a - b);
  const ends = [...walls.matchAll(/M([\d.-]+),([\d.-]+)L([\d.-]+),([\d.-]+)/g)].map((m) => m.slice(1).map(Number));
  const cells = [], corners = [];
  for (const m of s.matchAll(/<path d="([^"]*)" fill="#e8eddb"[^>]*stroke="(#[0-9a-f]{6})"/g)) {
    for (const sp of m[1].split('M').filter(Boolean)) {
      const poly = [], radii = [];
      let cur;
      for (const tk of ('M' + sp).match(/[MLQZ][^MLQZ]*/g)) {
        const n = tk.slice(1).trim().split(/[ ,]+/).filter(Boolean).map(Number);
        if (tk[0] === 'M' || tk[0] === 'L') { cur = [n[0], n[1]]; poly.push(cur); }
        else if (tk[0] === 'Q') {
          radii.push(Math.hypot(n[0] - cur[0], n[1] - cur[1]));
          for (let k = 1; k <= 8; k++) { const u = k / 8, v = 1 - u; poly.push([v * v * cur[0] + 2 * v * u * n[0] + u * u * n[2], v * v * cur[1] + 2 * v * u * n[1] + u * u * n[3]]); }
          cur = [n[2], n[3]];
        }
      }
      corners.push(Math.max(...radii));
      let a = 0;
      for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) a += (poly[j][0] + poly[i][0]) * (poly[j][1] - poly[i][1]);
      const cx = poly.reduce((t, p) => t + p[0], 0) / poly.length, cy = poly.reduce((t, p) => t + p[1], 0) / poly.length;
      const top = Math.max(...rows.filter((y) => y < cy)), bot = Math.min(...rows.filter((y) => y > cy));
      let wl = -Infinity, wr = Infinity;
      for (const [x1, y1, x2, y2] of ends) {
        if ((y1 - cy) * (y2 - cy) > 0) continue;
        const x = x1 + (cy - y1) * (x2 - x1) / (y2 - y1);
        if (x < cx && x > wl) wl = x;
        if (x > cx && x < wr) wr = x;
      }
      if (!isFinite(top) || !isFinite(bot) || !isFinite(wl) || !isFinite(wr)) continue;
      cells.push({ fill: Math.abs(a) / 2 / ((bot - top) * (wr - wl)), corner: Math.max(...radii), outline: m[2] });
    }
  }
  const fills = cells.map((c) => c.fill).sort((a, b) => a - b);
  return {
    n: cells.length,
    fills,
    full: fills.filter((f) => f >= 0.86).length / fills.length,
    // over every protoplast drawn, measured or not: the share with rounded corners
    rounded: corners.filter((r) => r >= 5).length / corners.length,
    strands: /stroke="#9db07a"/.test(s)
  };
}

/* ---------- the fields ---------- */

test('seeded fields: the same seed draws the same field, every seed a different one, and the default field is untouched', () => {
  const R = real();
  for (const cell of ['animal', 'plant']) {
    const seen = new Set();
    for (let s = 1; s <= 24; s++) {
      const a = field(cell, cell === 'animal' ? 80 : 50, s), b = field(cell, cell === 'animal' ? 80 : 50, s);
      assert.equal(a.svg, b.svg, cell + ' seed ' + s + ' is deterministic');
      assert.deepEqual(a.look, b.look);
      seen.add(a.svg);
    }
    assert.equal(seen.size, 24, cell + ': no two seeds draw the same field');
  }
  // without seed / bare / ns the picture is the sandbox's own: caption, strip, rl- ids, no turning
  const plain = R.tonicity({ cellType: 'plant', externalSolute: 92, plasmolyzed: true });
  assert.equal(plain, R.field({ cellType: 'plant', externalSolute: 92, plasmolyzed: true }).svg);
  assert.match(plain, />solute outside</);
  assert.match(plain, /id="rl-clip"/);
  assert.doesNotMatch(plain, /matrix\(/);
  assert.equal(R.field({ cellType: 'animal', externalSolute: 50 }).look, null);
  // the drawing code has no clock and no unseeded randomness (the panel reads the clock only to date a card or a set)
  for (const f of ['bio-real.js', 'bio-recognize.js']) assert.doesNotMatch(code(f), /Math\.random/, f);
  assert.doesNotMatch(code('bio-real.js'), /\bDate\b/);
  assert.equal((code('bio-recognize.js').match(/\bDate\b/g) || []).length, 2);
});

test('a bare field never names its state: no caption, no solute strip, no tonicity word', () => {
  for (const { cell, ext, f } of fields(6)) {
    assert.ok(f.caption.length > 20, 'a caption to reveal');
    assert.ok(!f.svg.includes(f.caption), cell + ' ' + ext + ': caption in the field');
    // no caption lines (font-size 12) and none of the strip's labels
    assert.doesNotMatch(f.svg, /font-size="12"/);
    assert.doesNotMatch(f.svg, /solute inside|solute outside|water in|water out|no net flow|contents released/);
    const words = [...f.svg.matchAll(/<text[^>]*>([^<]*)</g)].map((m) => m[1]);
    assert.deepEqual(words.filter((t) => !/^(LIGHT MICROSCOPE|400x, cropped|1000x oil, cropped|10 um|50 um)$/.test(t)), [], 'only the frame labels');
    assert.doesNotMatch(f.svg, /tonic|plasmoly|hemoly|crenat|turgid|lys/i);
    assert.equal(f.viewBox, '0 32 400 288');
  }
});

test('ns renames every id, and every reference points inside the same field', () => {
  for (const { cell, ext, f } of fields(3)) {
    const ids = [...f.svg.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
    assert.ok(ids.length >= 4);
    for (const id of ids) assert.match(id, /^tq-/, cell + ' ' + ext + ' id ' + id);
    assert.equal(new Set(ids).size, ids.length, 'ids unique');
    const refs = [...f.svg.matchAll(/(?:url\(#|href="#)([^)"]+)/g)].map((m) => m[1]);
    for (const r of refs) assert.ok(ids.includes(r), 'reference ' + r + ' resolves inside the field');
  }
});

test('every state is told apart by what it looks like: pallor, crenation, swelling and ghosts; corner gaps and plasmolysis', () => {
  for (const { cell, state, ext, seed, f } of fields(10)) {
    const at = cell + ' ' + state + ' ext ' + ext + ' seed ' + seed;
    if (cell === 'animal') {
      const L = redLook(f.svg);
      if (state === 'iso') {
        // a pale center, a smooth rim
        assert.ok(L.pallor > 60, at + ' pallor ' + L.pallor);
        assert.equal(L.bumpy, 0, at);
        assert.ok(!L.slit && !L.ghosts, at);
      } else if (state === 'hyper') {
        // crenated: 14 blunt bumps that swing the radius by 5 percent or more
        assert.ok(L.bumpy >= 1.05, at + ' bumps ' + L.bumpy.toFixed(3));
        assert.equal(L.bumps, 14, at);
        assert.ok(!L.ghosts && !L.slit, at);
      } else if (state === 'burst') {
        assert.ok(L.ghosts, at + ' ghosts');
        assert.equal(L.bumpy, 0, at);
      } else {
        // swollen: the pale center is gone (a slit at most) and the rim is smooth
        assert.ok(L.pallor !== null && L.pallor < 40, at + ' pallor ' + L.pallor);
        assert.equal(L.bumpy, 0, at);
        assert.ok(!L.ghosts, at);
        if (ext >= 26) assert.ok(L.slit, at + ' a cup shows its slit');
      }
    } else {
      const P = plantLook(f.svg);
      assert.ok(P.n >= 6, at + ' protoplasts measured: ' + P.n);
      // fill: a protoplast's area over its cell's, wall centerline to wall centerline
      if (state === 'hypo') {
        // turgid: every protoplast fills its cell (only the wall's own width is left), corners square
        assert.ok(P.fills[0] >= 0.88, at + ' least fill ' + P.fills[0].toFixed(3));
        assert.equal(P.rounded, 0, at);
        assert.ok(!P.strands, at);
      } else if (state === 'iso') {
        // the balance point: about half the cells in view have the membrane off the corners (rounded),
        // the rest still full; the gapped ones only at the corners; no strands
        assert.ok(P.rounded >= 0.35 && P.rounded <= 0.65, at + ' rounded share ' + P.rounded.toFixed(2));
        assert.ok(P.full > 0 && P.full < 1, at + ' full share ' + P.full.toFixed(2));
        assert.ok(P.fills[0] >= 0.7, at + ' least fill ' + P.fills[0].toFixed(3));
        assert.ok(!P.strands, at);
      } else {
        // plasmolysis: every protoplast pulled well off its walls, every corner rounded, Hechtian strands
        assert.ok(P.fills[P.fills.length - 1] <= 0.7, at + ' most fill ' + P.fills[P.fills.length - 1].toFixed(3));
        assert.equal(P.rounded, 1, at);
        assert.ok(P.strands, at);
      }
    }
  }
});

test('the look mark sits on a cell in view, nearly always wholly in view', () => {
  const FX = 14, FY = 54, FW = 372, FH = 228;
  let all = 0, whole = 0;
  for (const { cell, ext, f } of fields(12)) {
    assert.ok(f.look, cell + ' ' + ext + ' has a look target');
    assert.ok(f.look.x > FX && f.look.x < FX + FW && f.look.y > FY && f.look.y < FY + FH, cell + ' ' + ext + ' mark centered in the crop');
    const pts = f.look.pts || [[f.look.x - f.look.rx, f.look.y - f.look.ry], [f.look.x + f.look.rx, f.look.y + f.look.ry]];
    all++;
    if (pts.every(([x, y]) => x > FX - 6 && x < FX + FW + 6 && y > FY - 6 && y < FY + FH + 6)) whole++;
    else assert.equal(cell, 'plant', 'a red cell mark is always wholly in view');
  }
  assert.ok(whole / all > 0.85, 'wholly in view: ' + whole + ' of ' + all);
});

/* ---------- the set ---------- */

test('a set interleaves red cells and Elodea and all three states, eight fields that never repeat', () => {
  const t = boot('bio-cell.html');
  const B = t.w.BioRecognize;
  const seeds = new Set();
  for (let n = 0; n < 60; n++) {
    const seed = B.setSeed(n);
    seeds.add(seed);
    const items = B.makeSet(seed);
    assert.deepEqual(JSON.parse(JSON.stringify(items)), JSON.parse(JSON.stringify(B.makeSet(seed))), 'deterministic');
    assert.equal(items.length, 8);
    const kinds = items.map((i) => i.kind);
    assert.equal(kinds.filter((k) => k.startsWith('animal')).length, 4);
    for (const k of ['animal-hypo', 'animal-iso', 'animal-hyper', 'plant-hypo', 'plant-iso', 'plant-hyper']) assert.ok(kinds.includes(k), k + ' in set ' + n);
    const counts = ['hypo', 'iso', 'hyper'].map((s) => items.filter((i) => i.state === s).length).sort();
    assert.deepEqual(counts, [2, 3, 3]);
    for (let i = 1; i < 8; i++) {
      assert.notEqual(kinds[i], kinds[i - 1], 'same kind twice running in set ' + n);
      if (i >= 2) {
        assert.ok(!(items[i].cell === items[i - 1].cell && items[i - 1].cell === items[i - 2].cell), 'three of a cell type in set ' + n);
        assert.ok(!(items[i].state === items[i - 1].state && items[i - 1].state === items[i - 2].state), 'three of a state in set ' + n);
      }
    }
    for (const it of items) {
      const range = it.cell === 'animal'
        ? { hypo: it.lysed ? [0, 10] : [14, 34], iso: [46, 54], hyper: [68, 100] }[it.state]
        : { hypo: [0, 44], iso: [46, 54], hyper: [65, 100] }[it.state];
      assert.ok(it.ext >= range[0] && it.ext <= range[1], it.kind + ' at ' + it.ext);
      assert.equal(it.lysed, it.cell === 'animal' && it.ext < 12);
    }
    assert.equal(new Set(items.map((i) => i.seed)).size, 8, 'a seed per field');
  }
  assert.equal(seeds.size, 60, 'a new seed every set');
});

test('the words: two DAT-style stems per set, the kinds just missed first', () => {
  const t = boot('bio-cell.html');
  const B = t.w.BioRecognize;
  for (const w of B.words) {
    assert.match(w.q, /^[\x20-\x7e]+$/);
    assert.ok(w.q.length > 60 && w.why.length > 40, w.id);
    assert.match(w.kind, /^(animal|plant)-(hypo|iso|hyper)$/);
  }
  const ids = B.chooseWords(12345, ['plant-iso', 'animal-hyper']);
  assert.equal(ids.length, 2);
  const kinds = ids.map((id) => B.words.find((w) => w.id === id).kind);
  assert.deepEqual(Array.from(kinds).sort(), ['animal-hyper', 'plant-iso']);
  assert.deepEqual(Array.from(B.chooseWords(12345, ['plant-iso', 'animal-hyper'])), Array.from(B.chooseWords(12345, ['plant-iso', 'animal-hyper'])));
  // nothing missed: one red and one plant stem, in two different states
  for (let s = 1; s < 30; s++) {
    const k = Array.from(B.chooseWords(s, [])).map((id) => B.words.find((w) => w.id === id).kind.split('-'));
    assert.deepEqual(k.map((x) => x[0]).sort(), ['animal', 'plant']);
    assert.notEqual(k[0][1], k[1][1], 'two states in set ' + s);
  }
});

// answer the current step: the right state, or the next one round for a miss
function answer(t, miss) {
  const p = t.panel(), cur = t.state().recog.cur, at = cur.answers.length;
  const key = at < 8 ? p.items[at].state : t.w.BioRecognize.words.find((w) => w.id === cur.words[at - 8]).kind.split('-')[1];
  const s = ['hypo', 'iso', 'hyper'];
  const pickS = miss ? s[(s.indexOf(key) + 1) % 3] : key;
  t.click(t.d.querySelector('#recognize-tonicity .rq-opt[data-s="' + pickS + '"]'));
  return { key, pickS };
}

test('set flow: field, pick, Confirmed or Needs review with the cue and the caption; a reload resumes; the end names what to look at again', () => {
  const t = boot('bio-cell.html');
  const d = t.d;
  const root = d.querySelector('#recognize-tonicity .rq');
  assert.ok(root, 'the panel mounts after the Tonicity Lab');
  assert.equal(d.getElementById('tonicityBody').closest('.sandbox-wrap').nextElementSibling.id, 'recognize-tonicity');
  // a field, no caption shown, three real buttons, a live region
  let svg = root.querySelector('svg.rq-svg');
  assert.ok(svg && svg.getAttribute('role') === 'img');
  assert.doesNotMatch(svg.getAttribute('aria-label'), /tonic/i);
  assert.ok(root.querySelector('.rq-cap').hidden);
  const opts = root.querySelectorAll('button.rq-opt[type="button"]');
  assert.equal(opts.length, 3);
  assert.ok(root.querySelector('.rq-opts[role="group"][aria-labelledby="rq-q"]'));
  assert.equal(root.querySelector('.rq-fb').getAttribute('aria-live'), 'polite');
  assert.match(root.querySelector('.rq-pos').textContent, /^Field 1 of 8$/);
  // a clean pick
  const p = t.panel(), first = p.items[0];
  answer(t, false);
  assert.match(root.querySelector('.rq-fb').textContent, /^Confirmed/);
  assert.ok(!root.querySelector('.rq-cap').hidden);
  assert.match(root.querySelector('.rq-cap').textContent, /^Caption: /);
  assert.ok(root.querySelector('svg.rq-svg .rq-ring'), 'the look mark appears');
  assert.match(root.querySelector('svg.rq-svg').getAttribute('aria-label'), /Caption|:/);
  assert.ok(root.querySelector('.rq-opt.is-key').getAttribute('data-s') === first.state);
  // the buttons stay focusable but do nothing more
  t.click(root.querySelectorAll('.rq-opt')[0]);
  assert.equal(t.state().recog.cur.answers.length, 1);
  t.click(root.querySelector('.rq-next'));
  // a miss
  const second = p.items[1];
  const { pickS } = answer(t, true);
  const fb = root.querySelector('.rq-fb').textContent;
  assert.match(fb, /^Needs review/);
  assert.ok(fb.includes(second.state === 'hypo' ? 'Hypotonic' : second.state === 'iso' ? 'Isotonic' : 'Hypertonic'));
  assert.match(fb, /circled|outlined/);
  assert.match(fb, /Saved to your Ace Cards/);
  assert.notEqual(pickS, second.state);
  t.click(root.querySelector('.rq-next'));
  assert.match(root.querySelector('.rq-pos').textContent, /^Field 3 of 8$/);
  // reload mid-set: the same set, at the same field
  const seed = t.state().recog.cur.seed;
  const t2 = boot('bio-cell.html', { store: t.store });
  assert.equal(t2.state().recog.cur.seed, seed);
  assert.match(t2.d.querySelector('#recognize-tonicity .rq-pos').textContent, /^Field 3 of 8$/);
  // finish: misses on fields 5 and 7, then the words
  for (let i = 2; i < 8; i++) { answer(t2, i === 4 || i === 6); t2.click(t2.d.querySelector('#recognize-tonicity .rq-next')); }
  const r2 = t2.d.querySelector('#recognize-tonicity .rq');
  assert.match(r2.querySelector('.rq-pos').textContent, /^In words, 1 of 2$/);
  assert.ok(r2.classList.contains('is-words'));
  assert.equal(r2.querySelector('svg'), null, 'the words come without a picture');
  assert.match(r2.querySelector('.rq-opt').textContent, /Hypotonic to the cells/);
  answer(t2, true);
  assert.match(r2.querySelector('.rq-fb').textContent, /^Needs review/);
  t2.click(r2.querySelector('.rq-next'));
  answer(t2, false);
  t2.click(r2.querySelector('.rq-next'));
  // the end: what to look at again, by name; no count, no score
  const end = r2.textContent;
  assert.match(end, /Set done/);
  const rec = t2.state().recog;
  const look = rec.history[rec.history.length - 1].look;
  assert.ok(look.length >= 2);
  for (const k of look) assert.ok(end.includes(t2.w.BioRecognize.kindName[k] + ': look again.'), k);
  assert.doesNotMatch(end, /\d+\s*(of|\/)\s*\d+|%|score|streak|points/i);
  // another set: new seed, new fields
  t2.click(r2.querySelector('.rq-again'));
  assert.notEqual(t2.state().recog.cur.seed, seed);
  assert.equal(t2.state().recog.sets, 1);
  assert.match(r2.querySelector('.rq-pos').textContent, /^Field 1 of 8$/);
  assert.deepEqual(t.errs.concat(t2.errs), []);
});

test('a miss saves an Ace Card with that exact field on its front, under 20000 characters; one card per kind', () => {
  const t = boot('bio-cell.html');
  const B = t.w.BioRecognize;
  // every field of 30 sets fits on a card
  let most = 0;
  for (let n = 0; n < 30; n++) {
    for (const it of B.makeSet(B.setSeed(n))) {
      const c = B.card(it);
      most = Math.max(most, c.q.length);
      assert.ok(c.q.length < 20000, it.kind + ' card picture is ' + c.q.length + ' characters');
      assert.match(c.q, /^<span style="display:block">What solution are these cells in\?<\/span>/);
      const ids = [...c.q.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
      for (const id of ids) assert.ok(id.startsWith('rqc' + it.seed.toString(36) + '-'), 'card ids are its own: ' + id);
      assert.doesNotMatch(c.q, /rq-ring|circled|outlined/, 'no look mark on the card front');
      assert.doesNotMatch(c.explanation, /circled|outlined/, 'the card text does not point at a mark it lacks');
      assert.match(c.quickHit, /^<b>(Hypotonic|Isotonic|Hypertonic)\.<\/b> /);
    }
  }
  assert.ok(most > 10000, 'the plant fields are real pictures: ' + most);
  // play a set, missing the first two fields
  const p = t.panel(), first = p.items[0], second = p.items[1];
  answer(t, true);
  const st = t.state();
  const mine = () => st.aceCards.filter((c) => c.origin === 'Which one is this: Tonicity');
  assert.equal(mine().length, 1);
  const card = mine()[0];
  assert.equal(st.recog.cards[first.kind], card.id);
  assert.equal(card.subject, 'cell');
  assert.equal(card.nodeId, 'mtr');
  assert.ok(card.nextDue <= Date.now(), 'due now');
  assert.equal(card.q, B.card(first).q, 'the card shows that exact field');
  // the card renders in the deck with its picture, every reference inside the card
  const el = t.d.querySelector('.ace-card[data-id="' + card.id + '"]');
  assert.ok(el && el.querySelector('.ace-front-q svg'), 'card picture in the stack');
  const refs = [...el.innerHTML.matchAll(/(?:url\(#|href="#)([^)"]+)/g)].map((m) => m[1]);
  for (const r of refs) { const n = t.d.getElementById(r); assert.ok(n && el.contains(n), 'reference ' + r); }
  t.click(t.d.querySelector('#recognize-tonicity .rq-next'));
  answer(t, true);
  assert.equal(mine().length, first.kind === second.kind ? 1 : 2);
  // a later miss of a kind that has a card puts the new field on that card: no new card, one more lapse
  const kind = second.kind, before = mine().length, c2 = st.aceCards.find((c) => c.id === st.recog.cards[kind]);
  const lapses = c2.lapses;
  const later = B.makeSet(B.setSeed(7)).find((i) => i.kind === kind);
  t.click(t.d.querySelector('#recognize-tonicity .rq-next'));
  t.panel().items[2] = later;
  t.panel().renderPicture(2);
  t.click(t.d.querySelector('#recognize-tonicity .rq-opt[data-s="' + (later.state === 'hyper' ? 'hypo' : 'hyper') + '"]'));
  assert.equal(mine().length, before);
  assert.equal(c2.lapses, lapses + 1);
  assert.equal(c2.q, B.card(later).q);
  // a card closed or cleared away is not refreshed: the next miss makes a new one
  c2.closed = true;
  const fresh = B.makeSet(B.setSeed(9)).find((i) => i.kind === kind);
  t.click(t.d.querySelector('#recognize-tonicity .rq-next'));
  t.panel().items[3] = fresh;
  t.panel().renderPicture(3);
  t.click(t.d.querySelector('#recognize-tonicity .rq-opt[data-s="' + (fresh.state === 'hyper' ? 'hypo' : 'hyper') + '"]'));
  assert.notEqual(st.recog.cards[kind], c2.id);
  assert.deepEqual(t.errs, []);
});

test('nothing writes a new localStorage key: progress and history live in STATE.recog', () => {
  const t = boot('bio-cell.html');
  for (let i = 0; i < 10; i++) { answer(t, i % 3 === 0); t.click(t.d.querySelector('#recognize-tonicity .rq-next')); }
  t.click(t.d.querySelector('#recognize-tonicity .rq-again'));
  for (const k of t.written) assert.ok(ENGINE_KEYS.includes(k), 'new key ' + k);
  const saved = JSON.parse(t.store.get('acethedat_bio_engine_v1'));
  assert.equal(saved.recog.sets, 1);
  assert.equal(saved.recog.history.length, 1);
  assert.ok(saved.recog.history[0].look.length >= 1);
  assert.doesNotMatch(code('bio-recognize.js'), /localStorage|sessionStorage|indexedDB/);
});

test('student-facing text: plain ASCII, nothing judgmental, no timer, score or percentage; real buttons with 44 px targets', () => {
  const t = boot('bio-cell.html');
  const seen = [];
  const grab = () => seen.push(t.d.querySelector('#recognize-tonicity').textContent);
  for (let i = 0; i < 10; i++) {
    grab();
    answer(t, i % 2 === 0);
    grab();
    t.click(t.d.querySelector('#recognize-tonicity .rq-next'));
  }
  grab();
  const B = t.w.BioRecognize;
  for (let n = 0; n < 6; n++) for (const it of B.makeSet(B.setSeed(n))) { const c = B.card(it); seen.push(c.quickHit, c.explanation.replace(/<[^>]*>/g, ' '), c.why); }
  B.words.forEach((w) => seen.push(w.q, w.why));
  for (const s of seen) {
    assert.match(s, /^[\x20-\x7e\s]*$/, 'plain ASCII: ' + s.slice(0, 80));
    assert.doesNotMatch(s, /\b(wrong|incorrect|fail|failed|fails)\b/i);
    assert.doesNotMatch(s, /%|\bscore|\bstreak|\bpoints\b|\bXP\b|\btimer\b|seconds/i);
  }
  for (const f of ['bio-recognize.js', 'bio-recognize.css', 'bio-real.js']) assert.match(fs.readFileSync(path.join(BIO, f), 'utf8'), /^[\x00-\x7e]*$/, f + ' is ASCII');
  const css = fs.readFileSync(path.join(BIO, 'bio-recognize.css'), 'utf8');
  assert.match(css, /\.rq-opt\{[^}]*min-height:56px/);
  assert.match(css, /\.rq-btn\{[^}]*min-height:44px/);
  assert.match(css, /\.rq\.is-words \.rq-opt\{[^}]*min-height:48px/);
  // the hub loads the panel's stylesheet and script, the script after the renderer
  const html = fs.readFileSync(path.join(BIO, 'bio-cell.html'), 'utf8');
  assert.ok(html.includes('<link rel="stylesheet" href="/tools/bio/bio-recognize.css">'));
  assert.ok(html.indexOf('bio-recognize.js') > html.indexOf('bio-real.js'));
  assert.deepEqual(t.errs, []);
});
