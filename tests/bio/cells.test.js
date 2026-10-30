/* Unit tests for the tonicity camera views (tools/bio/bio-real.js) and the
 * tonicity sandbox that drives them (initTonicity in bio-shared.js).
 *
 * The page scripts are evaluated as ONE script, the way classic <script>
 * tags share the page's global lexical scope in a browser (same boot as
 * bio-stick.test.js). Reduced motion is on, so no timers run.
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
  dom.window.eval(SRC);
  dom.window.document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));
  const w = dom.window;
  OPEN.push(w);
  return { w, errs, click: (el) => el.dispatchEvent(new w.MouseEvent('click', { bubbles: true })) };
}

// the sandbox as a student drives it: pick the cell, set the slider, read the picture and the cards
function sandbox() {
  const t = boot('bio-cell.html');
  const d = t.w.document;
  return {
    t,
    cell: (c) => t.click(d.querySelector('.ton-cell-btn[data-cell="' + c + '"]')),
    set: (v) => {
      const s = d.getElementById('tonSolute');
      s.value = String(v);
      s.dispatchEvent(new t.w.Event('input', { bubbles: true }));
      return {
        svg: d.getElementById('tonCellSvg').innerHTML,
        state: d.getElementById('tonStateName').textContent,
        flow: d.getElementById('tonWaterFlow').textContent,
        outcome: d.getElementById('tonOutcome').textContent
      };
    }
  };
}

// the camera crop (bio-real.js FX, FY, FW, FH)
const FX = 14, FY = 54, FW = 372, FH = 228;
const caption = (s) => (s.match(/<text [^>]*font-size="12"[^>]*>[^<]*</g) || []).map((x) => x.replace(/<[^>]*>|</g, '')).join(' ');
const strands = (s) => /stroke="#9db07a"/.test(s);

// protoplast outlines (M, L and Q commands), flattened to polygons
function protoplasts(s) {
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
}
function area(poly) {
  let a = 0;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) a += (poly[j][0] + poly[i][0]) * (poly[j][1] - poly[i][1]);
  return Math.abs(a) / 2;
}
function inside(p, poly) {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i], b = poly[j];
    if ((a[1] > p[1]) !== (b[1] > p[1]) && p[0] < (b[0] - a[0]) * (p[1] - a[1]) / (b[1] - a[1]) + a[0]) c = !c;
  }
  return c;
}
// chloroplast strokes of one path (M/m moves, l lines; relative numbers may drop the leading zero) as [a, b] pairs.
// Every point is on the 0.1 px grid, so each sum is rounded back to it (no floating point drift).
function strokes(s, id) {
  const out = [];
  const r = (v) => Math.round(v * 10) / 10;
  let cur = [0, 0];
  for (const tk of s.match(new RegExp('id="' + id + '" d="([^"]*)"'))[1].match(/[MmLl][^MmLl]*/g)) {
    const [x, y] = tk.slice(1).split(',').map(Number);
    if (tk[0] === 'M') cur = [x, y];
    else if (tk[0] === 'm') cur = [r(cur[0] + x), r(cur[1] + y)];
    else { const b = [r(cur[0] + x), r(cur[1] + y)]; out.push([cur, b]); cur = b; }
  }
  return out;
}
const hexLuma = (h) => { const v = [1, 3, 5].map((i) => parseInt(h.substr(i, 2), 16)); return 0.299 * v[0] + 0.587 * v[1] + 0.114 * v[2]; };

test('plant cells plasmolyze above 60: early plasmolysis to 70, then plasmolyzed; picture, caption and card agree', () => {
  const sb = sandbox();
  sb.cell('plant');
  for (let e = 0; e <= 100; e++) {
    const r = sb.set(e);
    const cap = caption(r.svg);
    if (e > 70) assert.match(r.outcome, /^PLASMOLYZED\. /, 'card at ' + e);
    else if (e > 60) assert.equal(r.outcome, 'EARLY PLASMOLYSIS. Water leaves; the membrane starts to pull off the wall. More solute pulls it further.', 'card at ' + e);
    // before plasmolysis the card describes what the picture shows: only the protoplast shrinks, the membrane leaves the corners
    else if (e >= 55) assert.equal(r.outcome, 'SHRINKING. The protoplast loses water; the membrane starts to leave the corners. A little more solute pulls it off the wall.', 'card at ' + e);
    else assert.doesNotMatch(r.outcome, /plasmoly/i, 'card at ' + e);
    // the picture names the same stage, and the strands appear exactly when the membrane has pulled off the wall
    assert.equal(/plasmolysis/i.test(cap), e > 60, 'caption at ' + e + ': ' + cap);
    assert.equal(/^Early plasmolysis \(Elodea leaf cells\)/.test(cap), e > 60 && e <= 70, 'early caption at ' + e);
    assert.equal(/^Plasmolysis \(Elodea leaf cells\)/.test(cap), e > 70, 'plasmolysis caption at ' + e);
    assert.equal(strands(r.svg), e > 60, 'strands at ' + e);
    // every word on the sandbox is plain ASCII, no glyph arrows, nothing judgmental
    for (const txt of [r.state, r.flow, r.outcome, cap]) {
      assert.match(txt, /^[\x20-\x7e]*$/, 'plain ASCII at ' + e + ': ' + txt);
      assert.doesNotMatch(txt, /\b(wrong|incorrect|fail|failed)\b/i);
    }
  }
  assert.deepEqual(sb.t.errs, []);
});

test('plasmolysis deepens in even steps; only the onset (60 to 61, where the strands appear) is a bigger step', () => {
  const sb = sandbox();
  sb.cell('plant');
  const frac = {};
  const iso = protoplasts(sb.set(50).svg).reduce((n, q) => n + area(q.poly), 0);
  for (let e = 55; e <= 100; e++) frac[e] = protoplasts(sb.set(e).svg).reduce((n, q) => n + area(q.poly), 0) / iso;
  for (let e = 56; e <= 100; e++) {
    const step = frac[e - 1] - frac[e];
    assert.ok(step >= 0, 'area grows back at ' + e + ': ' + step.toFixed(3));
    if (e !== 61) assert.ok(step < 0.03, 'area step at ' + e + ': ' + step.toFixed(3));
  }
  // the onset is a visible step (the picture changes with its name) but no more than about 3 normal steps
  const normal = (frac[61] - frac[71]) / 10, onset = frac[60] - frac[61];
  assert.ok(onset >= 2 * normal && onset <= 3.5 * normal, 'onset step ' + onset.toFixed(4) + ' vs normal ' + normal.toFixed(4));
  // and it goes a long way: at 100 the protoplasts hold about a third of their isotonic area
  assert.ok(frac[60] > 0.75 && frac[100] < 0.4, frac[60].toFixed(3) + ' ' + frac[100].toFixed(3));
});

// End gaps: at mid-height of each protoplast wholly in the crop, the distance from each end
// to the end wall's centerline, less half the wall (so 0 means pressed on the wall)
function endGaps(s) {
  const segs = [];
  for (const m of s.match(/id="rl-w" d="([^"]*)"/)[1].matchAll(/M([\d.-]+),([\d.-]+)L([\d.-]+),([\d.-]+)/g)) segs.push(m.slice(1).map(Number));
  const gaps = [];
  for (const { poly, box } of protoplasts(s)) {
    const y = (box[1] + box[3]) / 2, xs = [];
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const a = poly[i], b = poly[j];
      if ((a[1] > y) !== (b[1] > y)) xs.push(a[0] + (y - a[1]) * (b[0] - a[0]) / (b[1] - a[1]));
    }
    if (xs.length < 2) continue;
    const L = Math.min(...xs), R = Math.max(...xs);
    if (L < FX + 5 || R > FX + FW - 5 || y < FY || y > FY + FH) continue;
    let wl = -Infinity, wr = Infinity;
    for (const [x1, y1, x2, y2] of segs) {
      if ((y1 - y) * (y2 - y) > 0) continue;
      const x = x1 + (y - y1) * (x2 - x1) / (y2 - y1);
      if (x <= L + 0.5 && x > wl) wl = x;
      if (x >= R - 0.5 && x < wr) wr = x;
    }
    if (wl === -Infinity || wr === Infinity) continue;
    gaps.push(L - wl - 1.25, wr - R - 1.25);
  }
  gaps.sort((a, b) => a - b);
  return { median: gaps[Math.floor(gaps.length / 2)], max: gaps[gaps.length - 1], n: gaps.length };
}

test('before plasmolysis the membrane leaves only the corners; at 61 it pulls off the end walls', () => {
  const sb = sandbox();
  sb.cell('plant');
  let prev = 0;
  for (let e = 55; e <= 60; e++) {
    const g = endGaps(sb.set(e).svg);
    assert.ok(g.n >= 20, 'ends measured at ' + e + ': ' + g.n);
    // the ends stay within about 3.5 px (3 um) of the end walls, so the picture matches 'starts to leave the corners'
    assert.ok(g.median <= 3.55 && g.max < 4.5, 'end gap at ' + e + ': median ' + g.median + ', max ' + g.max);
    assert.ok(g.median >= prev, 'end gap shrinks back at ' + e);
    prev = g.median;
  }
  const at61 = endGaps(sb.set(61).svg);
  assert.ok(at61.median >= 1.3 * prev && at61.max >= 7, 'end gap at 61: median ' + at61.median + ', max ' + at61.max);
});

test('every picture fits on an Ace Card: under 30000 characters, chloroplasts the crop hides left out, 56 in every cell inside it', () => {
  const t = boot('bio-cell.html');
  const ton = (cellType, e) => t.w.BioReal.tonicity({ cellType, externalSolute: e, lysed: cellType === 'animal' && e < 12, plasmolyzed: cellType === 'plant' && e > 60 });
  for (const c of ['animal', 'plant']) {
    for (let e = 0; e <= 100; e++) {
      const s = ton(c, e);
      assert.ok(s.length < 30000, c + ' ' + e + ' is ' + s.length + ' characters');
      assert.equal(s, ton(c, e), 'deterministic');
    }
  }
  for (const e of [0, 20, 50, 58, 61, 66, 70, 81, 92, 100]) {
    const s = ton('plant', e), P = protoplasts(s);
    const all = [];
    for (const [id, half] of [['rl-cw', 2.3], ['rl-cf', 2.8]]) {
      for (const [a, b] of strokes(s, id)) {
        // no stroke lies wholly past one edge of the crop (more than half its width plus 1 px)
        const m = half + 1;
        const out = (a[0] < FX - m && b[0] < FX - m) || (a[0] > FX + FW + m && b[0] > FX + FW + m) ||
          (a[1] < FY - m && b[1] < FY - m) || (a[1] > FY + FH + m && b[1] > FY + FH + m);
        assert.ok(!out, id + ' stroke at ' + a.join(',') + ' is hidden by the crop at ' + e);
        all.push([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]);
      }
    }
    // a cell wholly inside the crop keeps all 56 chloroplasts (24 + 12 along the walls, 20 over the face)
    const whole = P.filter((q) => q.box[0] >= FX && q.box[2] <= FX + FW && q.box[1] >= FY && q.box[3] <= FY + FH);
    assert.ok(whole.length >= 8, 'cells wholly in view at ' + e + ': ' + whole.length);
    for (const q of whole) assert.equal(all.filter((p) => inside(p, q.poly)).length, 56, 'chloroplasts in a cell at ' + e);
  }
});

test('red cells: the slit is plainly visible wherever the cup caption shows, and its mouth shortens as the cell rounds up', () => {
  const sb = sandbox();
  sb.cell('animal');
  const rx = {};
  let shown = 0;
  for (let e = 12; e <= 54; e++) {
    const s = sb.set(e).svg;
    const m = s.match(/<ellipse rx="([\d.]+)" ry="[\d.]+" fill="#f0d0c9" opacity="([\d.]+)"/);
    const cup = /swell into cups; each pale center narrows to a slit/.test(caption(s));
    assert.equal(!!m, cup, 'slit vs caption at ' + e);
    if (m) { assert.ok(+m[2] >= 0.25, 'slit opacity ' + m[2] + ' at ' + e); rx[e] = +m[1]; shown++; }
  }
  assert.ok(shown >= 15, 'cup steps: ' + shown);
  assert.ok(rx[23] < rx[32] && rx[32] <= rx[38], 'mouth ' + [rx[23], rx[32], rx[38]].join(' '));
});

test('red cells: crenation starts from the disc (pallor fades, face bumps come after it), and the lysis strip reads cleanly', () => {
  const sb = sandbox();
  sb.cell('animal');
  const look = (s) => ({
    center: s.match(/<radialGradient id="rl-rbc"><stop offset="0%" stop-color="(#[0-9a-f]{6})"/)[1],
    face: +s.match(/stroke="#e07f84" stroke-opacity="([\d.]+)"/)[1]
  });
  const disc = sb.set(54).svg.match(/<radialGradient id="rl-rbc"><stop offset="0%" stop-color="(#[0-9a-f]{6})"/)[1];
  const first = look(sb.set(55).svg);
  // the first crenated step keeps nearly all of the pale center and no face bumps
  assert.ok(Math.abs(hexLuma(first.center) - hexLuma(disc)) < 12, first.center + ' vs ' + disc);
  assert.equal(first.face, 0);
  let prev = first;
  for (let e = 56; e <= 100; e++) {
    const cur = look(sb.set(e).svg);
    assert.ok(hexLuma(cur.center) <= hexLuma(prev.center) + 0.5, 'center darkens steadily at ' + e);
    assert.ok(cur.face >= prev.face, 'face bumps never fade back at ' + e);
    // face bumps only once the pallor is mostly gone, so they never sit as dark dots on a pale center
    if (cur.face > 0) assert.ok(hexLuma(cur.center) < hexLuma(disc) - 50, 'face bumps on a pale center at ' + e);
    prev = cur;
  }
  assert.equal(prev.center, '#d27a7c');
  assert.equal(prev.face, 0.45);
  // the two edge-on cells darken with the face-on ones, from the disc's color, never in one step
  const edgeFill = (e) => sb.set(e).svg.match(/<path id="rl-e" d="[^"]*" fill="(#[0-9a-f]{6})"/)[1];
  assert.equal(edgeFill(54), '#d3807f');
  assert.ok(Math.abs(hexLuma(edgeFill(55)) - hexLuma('#d3807f')) < 3, 'edge-on at 55: ' + edgeFill(55));
  for (let e = 56; e <= 100; e++) assert.ok(hexLuma(edgeFill(e)) <= hexLuma(edgeFill(e - 1)) + 0.5, 'edge-on darkens steadily at ' + e);
  assert.equal(edgeFill(100), '#c4686c');
  // hypotonic, burst or not: the flow label is the short 'water in', so it never runs into 'contents released'
  for (let e = 0; e <= 44; e++) {
    const s = sb.set(e).svg;
    assert.match(s, /font-weight="700" fill="#8cc7f2">water in</, 'flow label at ' + e);
    assert.doesNotMatch(s, /rushed/);
  }
  assert.match(sb.set(4).svg, />contents released</);
});

test('red cells edge-on: biconcave at isotonic, a bowl (convex base, cup, thick rims) as they cup, never losing volume', () => {
  const sb = sandbox();
  sb.cell('animal');
  // the edge-on profile is drawn once around the origin: 48 points, the upper surface first
  const prof = (s) => s.match(/id="rl-e" d="M([^"Z]*)Z"/)[1].split(' ').map((p) => p.split(',').map(Number));
  const iso = prof(sb.set(50).svg);
  assert.equal(iso.length, 48);
  const thick = (P, i) => P[48 - i][1] - P[i][1];      // lower minus upper at the same x
  // the volume of the solid of revolution (Pappus: the right half of the profile, closed along the axis)
  const volume = (P) => {
    const half = P.slice(36).concat(P.slice(0, 13));
    let m = 0;
    for (let i = 0; i < half.length; i++) {
      const a = half[i], b = half[(i + 1) % half.length];
      m += (a[0] + b[0]) * (a[0] * b[1] - b[0] * a[1]);
    }
    return 2 * Math.PI * Math.abs(m) / 6;
  };
  // isotonic: thin middle (about 1 um, 5.6 px), thick ring
  assert.ok(thick(iso, 12) < 6 && thick(iso, 6) > 2 * thick(iso, 12), 'biconcave ' + thick(iso, 12) + ' ' + thick(iso, 6));
  // a swelling cell takes on water: at every hypotonic step before lysis the edge-on cell holds at least the disc's volume
  for (let e = 12; e <= 45; e++) {
    const P = prof(sb.set(e).svg);
    assert.ok(volume(P) >= volume(iso), 'volume at ' + e + ': ' + volume(P).toFixed(0) + ' vs ' + volume(iso).toFixed(0));
    // wherever the cup caption shows, the rims are at least as thick as the disc's ring: a bowl, never a thin crescent
    if (/swell into cups/.test(caption(sb.set(e).svg))) {
      assert.ok(thick(P, 3) >= thick(iso, 3) && thick(P, 6) >= thick(iso, 6), 'rims at ' + e + ': ' + thick(P, 3) + ' ' + thick(P, 6));
    }
  }
  const cup = prof(sb.set(36).svg);
  assert.match(caption(sb.set(36).svg), /swell into cups/);
  // the lower surface is convex: its middle is its lowest point (largest y) and it rises toward the rims
  assert.ok(cup[36][1] > cup[42][1] && cup[42][1] > cup[45][1], 'convex base ' + [cup[36][1], cup[42][1], cup[45][1]].join(' '));
  // the upper surface dips in the middle: a cup, not a dome, plainly at the first cup steps
  assert.ok(cup[12][1] > cup[6][1], 'cup at 36: ' + cup[12][1] + ' vs ' + cup[6][1]);
  const early = prof(sb.set(39).svg);
  assert.ok(early[12][1] > early[6][1] + 2, 'cup at 39: ' + early[12][1] + ' vs ' + early[6][1]);
  // thick through the middle (no thin biconcave center left)
  assert.ok(thick(cup, 12) > 1.5 * thick(iso, 12), 'middle ' + thick(cup, 12));
});

test('red cells edge-on: the cup keeps a dented mouth in profile while it rounds up, then closes into a smooth sphere', () => {
  const sb = sandbox();
  sb.cell('animal');
  const prof = (s) => s.match(/id="rl-e" d="M([^"Z]*)Z"/)[1].split(' ').map((p) => p.split(',').map(Number));
  // how far the middle of the upper surface (point 12) sits below its highest point: 0 for a dome
  const dip = (P) => P[12][1] - Math.min(...P.slice(1, 24).map((p) => p[1]));
  let dented = 0, cups = 0;
  for (let e = 12; e <= 45; e++) {
    const s = sb.set(e).svg, cap = caption(s), d = dip(prof(s));
    if (/swell into cups/.test(cap)) {
      cups++;
      if (d >= 1) dented++;
      // past the first two cup steps (where the slit is fading in from the sphere side) the mouth is plain
      if (e >= 25) assert.ok(d >= 1, 'mouth in profile at ' + e + ': ' + d.toFixed(1));
    } else if (/round up into spheres/.test(cap)) {
      assert.ok(d < 0.5, 'sphere is smooth at ' + e + ': ' + d.toFixed(1));
    }
  }
  assert.ok(cups >= 15 && dented >= cups - 2, 'dented cup steps: ' + dented + ' of ' + cups);
  // the isotonic disc still shows its biconcave dimple, and the swelling cells end as smooth spheres
  assert.ok(dip(prof(sb.set(50).svg)) > 1, 'isotonic biconcave dip');
  assert.ok(dip(prof(sb.set(14).svg)) < 0.5, 'sphere just before lysis');
});

test('the DAT trap line gets the water gradient the right way round', () => {
  const sb = sandbox();
  const d = sb.t.w.document;
  const text = d.getElementById('tonicityBody').textContent.replace(/\s+/g, ' ');
  assert.match(text, /A cell in a hypertonic solution loses water \(the outside has more solute, so less free water; water moves out of the cell toward it\)\./);
  assert.doesNotMatch(text, /LESS water inside/i);
  assert.match(text, /^[\x20-\x7e]*$/, 'plain ASCII');
  assert.doesNotMatch(text, /\b(wrong|incorrect|fail|failed)\b/i);
});

test('layout: the picture is never squeezed beside its readouts; full card width on a phone; 44 px tap targets on any touch screen', () => {
  const css = fs.readFileSync(path.join(BIO, 'bio-shared.css'), 'utf8');
  // in a narrow card (tablets from 781 px, where the hub puts the lab in a narrow column) the readouts wrap
  // below the picture instead of shrinking it: side by side only while the picture keeps 340 px
  assert.match(css, /\n#tonicityBody \[style\*="grid-template-columns:1fr 280px"\]\{display:flex!important;flex-wrap:wrap\}/);
  assert.match(css, /\n#tonicityBody #tonCellSvg\{flex:1000 1 340px;min-width:0\}/);
  assert.match(css, /\n#tonicityBody \[style\*="grid-template-columns:1fr 280px"\] > div\{flex:1 1 280px;min-width:0\}/);
  const block = css.match(/@media \(max-width:480px\)\{\s*#tonicityBody\{[\s\S]*?\n\}/);
  assert.ok(block, 'a phone rule for the tonicity sandbox');
  assert.match(block[0], /#tonicityBody\{padding:0!important\}/);
  assert.match(block[0], /#tonicityBody > div\{padding:10px!important\}/);
  // the tap targets apply on a phone and on touch tablets too (pointer:coarse), not only at 480 px and below
  const tap = css.match(/@media \(max-width:480px\), \(pointer:coarse\)\{\s*#tonicityBody[\s\S]*?\n\}/);
  assert.ok(tap, 'a phone-or-touch rule for the tap targets');
  assert.match(tap[0], /#tonicityBody \.ton-cell-btn\{min-height:44px\}/);
  assert.match(tap[0], /#tonicityBody \.ton-preset\{min-height:44px\}/);
  assert.match(tap[0], /#tonicityBody #tonSolute\{height:44px\}/);
  // the rules match the sandbox the page builds
  const t = boot('bio-cell.html');
  const d = t.w.document;
  assert.equal(d.querySelector('#tonicityBody > div').contains(d.getElementById('tonCellSvg')), true);
  const row = d.querySelector('#tonicityBody [style*="grid-template-columns:1fr 280px"]');
  assert.ok(row && row.children[0] === d.getElementById('tonCellSvg') && row.children.length === 2, 'the picture and readout row');
  assert.equal(d.querySelectorAll('#tonicityBody .ton-cell-btn').length, 2);
  assert.equal(d.querySelectorAll('#tonicityBody .ton-preset').length, 3);
  assert.ok(d.querySelector('#tonicityBody div[style*="justify-content:space-between"]'), 'the slider label row');
});
