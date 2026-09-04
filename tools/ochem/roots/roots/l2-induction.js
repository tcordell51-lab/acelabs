// The Roots of Organic, Level 2, Root 3: The vacuum through the wire.
// Inductive effect: pull through sigma bonds that dies with distance. No imports (contract).

export const meta = {
  id: 'l2-induction',
  level: 2,
  order: 3,
  needs3D: false,
  title: 'The vacuum through the wire',
  concept: 'Inductive effect',
  tagline: 'Closer, more, and more electronegative. That is the whole ranking.',
  story: 'An electronegative atom does not only bully its own neighbor. It keeps pulling density through the sigma bonds, like a vacuum sucking through a hose, and that pull is called induction. Two things about it. It fades fast with distance: one bond away is a real tug, two bonds away is much weaker, four bonds away is almost nothing. And more pullers pull harder, so two chlorines beat one. Why do we care? A vacuum next to a negative charge is a relief: it thins the charge out, the conjugate base gets comfortable, and the acid is stronger. The same vacuum next to a positive charge is a disaster, it makes a poor carbon poorer. Rule of thumb: closer, more, and more electronegative all mean a stronger pull.',
  moveName: 'Closer, more, more electronegative',
  move: [
    'Find the electronegative atom (the vacuum) and the charge it is near.',
    'Count the bonds between them. One bond is a strong pull, two is weak, four is almost nothing.',
    'Count the pullers. Two halogens on the same carbon pull harder than one.',
    'Compare the pullers: F beats Cl beats Br beats I.',
    'A pull next to a negative charge stabilizes it, so the acid is stronger. Next to a positive charge, it hurts.'
  ],
  trap: 'Careful: induction is not resonance. It runs through sigma bonds and dies with distance, so a chlorine four carbons away barely counts.',
  holdsUp: ['Acidity rankings', 'Carbocation stability', 'Carbonyl reactivity'],
  drill: 'Booster OChem: Acids and Bases'
};


// The three rules as numbers. Only the ORDER matters (closer wins, more wins, F beats Cl beats Br beats I),
// and every you-try item changes exactly one of the three, so the answer never depends on the magnitudes.
const PULL = { F: 1.0, Cl: 0.8, Br: 0.7, I: 0.55 };
const DECAY = { 2: 1.0, 3: 0.4, 4: 0.16, 5: 0.06 };
const HALO = ['F', 'Cl', 'Br', 'I'];
const HALO_NAME = { F: 'fluoro', Cl: 'chloro', Br: 'bromo', I: 'iodo' };
const POS_NAME = { 2: 'alpha', 3: 'beta', 4: 'gamma', 5: 'delta' };
const MULT = { 1: '', 2: 'di', 3: 'tri' };
export function maxCount(pos){ return pos === 5 ? 3 : 2; }   // a chain CH2 only has two hydrogens to swap
export function score(a){ return a.count * PULL[a.x] * DECAY[a.pos]; }
export function acidName(a){
  const locs = Array.from({ length: a.count }, () => a.pos).join(',');
  return locs + '-' + MULT[a.count] + HALO_NAME[a.x] + 'pentanoic acid';
}
export function meterWords(sc){
  if (sc <= 0) return 'plain pentanoic acid, no vacuum';
  if (sc < 0.15) return 'a whisper of pull';
  if (sc < 0.5) return 'a real tug, a stronger acid';
  if (sc < 1.2) return 'a strong pull, a clearly stronger acid';
  return 'a very strong pull, a much stronger acid';
}

// ---------- item generator (pure, node-safe) ----------
export function gen(rng){
  const pick = arr => arr[Math.floor(rng() * arr.length)];
  const kind = pick(['distance', 'count', 'identity']);
  let A, B, answer, rule;
  if (kind === 'distance'){
    const x = pick(HALO);
    let p1 = pick([2, 3, 4, 5]), p2 = pick([2, 3, 4, 5]);
    while (p2 === p1) p2 = pick([2, 3, 4, 5]);
    A = { x, pos: p1, count: 1 }; B = { x, pos: p2, count: 1 };
    answer = p1 < p2 ? 0 : 1;
    rule = 'Distance decided it. The vacuum dies with distance, so the ' + HALO_NAME[x] + ' on the ' + POS_NAME[Math.min(p1, p2)] + ' carbon pulls on the charge much harder than one on the ' + POS_NAME[Math.max(p1, p2)] + ' carbon.';
  } else if (kind === 'count'){
    const x = pick(HALO), pos = pick([2, 3]);
    const swap = rng() < 0.5;
    A = { x, pos, count: swap ? 2 : 1 }; B = { x, pos, count: swap ? 1 : 2 };
    answer = A.count > B.count ? 0 : 1;
    rule = 'Count decided it. Same halogen, same carbon, but two pullers pull harder than one.';
  } else {
    const pos = pick([2, 3]);
    let x1 = pick(HALO), x2 = pick(HALO);
    while (x2 === x1) x2 = pick(HALO);
    A = { x: x1, pos, count: 1 }; B = { x: x2, pos, count: 1 };
    answer = PULL[x1] > PULL[x2] ? 0 : 1;
    const w = answer === 0 ? x1 : x2, l = answer === 0 ? x2 : x1;
    rule = 'Identity decided it. Same spot, same count, but ' + w + ' is more electronegative than ' + l + ', so it is the stronger vacuum.';
  }
  return { kind, acids: [A, B], answer, rule };
}

function mulberry(seed){ let s = seed | 0; return function(){ s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

export function selfTest(){
  const rng = mulberry(3);
  let tried = 0; const kinds = { distance: 0, count: 0, identity: 0 };
  for (let i = 0; i < 450; i++){
    const it = gen(rng); tried++; kinds[it.kind]++;
    const [A, B] = it.acids;
    const diffs = ['x', 'pos', 'count'].filter(k => A[k] !== B[k]);
    if (diffs.length !== 1) return { ok: false, tried, notes: 'item changes ' + diffs.length + ' variables' };
    if (A.count > maxCount(A.pos) || B.count > maxCount(B.pos)) return { ok: false, tried, notes: 'too many halogens on a chain carbon' };
    // the rule answer and the score answer must agree, and the score must separate them
    const sa = score(A), sb = score(B);
    if (sa === sb) return { ok: false, tried, notes: 'tie' };
    if ((sa > sb ? 0 : 1) !== it.answer) return { ok: false, tried, notes: 'rule and score disagree' };
    // the three rules directly
    if (it.kind === 'distance' && it.acids[it.answer].pos !== Math.min(A.pos, B.pos)) return { ok: false, tried, notes: 'closer did not win' };
    if (it.kind === 'count' && it.acids[it.answer].count !== Math.max(A.count, B.count)) return { ok: false, tried, notes: 'more did not win' };
    if (it.kind === 'identity' && HALO.indexOf(it.acids[it.answer].x) !== Math.min(HALO.indexOf(A.x), HALO.indexOf(B.x))) return { ok: false, tried, notes: 'more electronegative did not win' };
  }
  // monotonic in each rule across the whole domain
  for (const x of HALO){
    for (let p = 2; p < 5; p++) if (score({ x, pos: p, count: 1 }) <= score({ x, pos: p + 1, count: 1 })) return { ok: false, tried, notes: 'decay not monotonic' };
    for (let p = 2; p <= 5; p++) for (let c = 1; c < maxCount(p); c++) if (score({ x, pos: p, count: c }) >= score({ x, pos: p, count: c + 1 })) return { ok: false, tried, notes: 'count not monotonic' };
  }
  for (let k = 0; k < HALO.length - 1; k++) if (PULL[HALO[k]] <= PULL[HALO[k + 1]]) return { ok: false, tried, notes: 'halogen order' };
  if (acidName({ x: 'Cl', pos: 2, count: 2 }) !== '2,2-dichloropentanoic acid') return { ok: false, tried, notes: 'naming' };
  const a = gen(mulberry(8)), b = gen(mulberry(8));
  if (JSON.stringify(a) !== JSON.stringify(b)) return { ok: false, tried, notes: 'not reproducible' };
  return { ok: true, tried, notes: kinds.distance + ' distance, ' + kinds.count + ' count, ' + kinds.identity + ' identity' };
}

// ---------- drawing ----------
function hex2rgb(h){ const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(h.trim()); return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : [124, 118, 106]; }
function mix(a, b, t){ const A = hex2rgb(a), B = hex2rgb(b); return 'rgb(' + A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(',') + ')'; }
function labelText(api, x, y, label, fill, size){
  const t = api.svg('text', { x, y: y + size * 0.36, 'text-anchor': 'middle', 'font-family': 'Georgia, serif', 'font-size': String(size), fill });
  for (const r of label.match(/[A-Za-z]+|\d+/g) || []){
    if (/\d/.test(r)) t.append(api.svg('tspan', { dy: String(size * 0.28), 'font-size': String(size * 0.7), text: r }), api.svg('tspan', { dy: String(-size * 0.28), text: '' }));
    else t.append(api.svg('tspan', { text: r }));
  }
  return t;
}

// Skeletal pentanoic chain. C1 is the carboxyl carbon; the halogen sits on carbon `pos` (2 to 5).
// base: true draws the carboxylate (minus on O), false draws the acid (OH).
function drawChain(api, opts){
  const { svg } = api, C = api.colors;
  const S = opts.scale || 1, ox = opts.ox || 0, oy = opts.oy || 0;
  const P = (x, y) => ({ x: ox + x * S, y: oy + y * S });
  const pts = { 5: P(60, 130), 4: P(140, 80), 3: P(220, 130), 2: P(300, 80), 1: P(380, 130) };
  const O1 = P(436, 92), O2 = P(436, 168);
  const g = svg('g', {});
  const w = 3 * S;
  const { x, pos, count } = opts;
  const halo = opts.halo == null ? (count > 0) : opts.halo;
  // chain bonds, colored by distance from the vacuum toward the carboxyl end
  const heat = i => [1, 0.55, 0.3, 0.12, 0.05][Math.min(4, Math.abs(i))];
  const line = (a, b, t, extra) => svg('line', Object.assign({ x1: a.x, y1: a.y, x2: b.x, y2: b.y, stroke: halo ? mix(C.grey, C.coral, t) : C.grey, 'stroke-width': String(w), 'stroke-linecap': 'round' }, extra || {}));
  for (let k = 5; k > 1; k--){
    // bond between C_k and C_{k-1}; steps from the halogen carbon toward C1
    const steps = k <= pos ? pos - k : k - pos - 1;
    const toward = k <= pos;
    g.append(line(pts[k], pts[k - 1], toward ? heat(steps) : heat(steps + 1) * 0.6));
  }
  // carboxyl
  const rO = 12 * S;
  const dir = (a, b) => { const dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy); return { x: dx / L, y: dy / L }; };
  const d1 = dir(pts[1], O1), d2 = dir(pts[1], O2);
  const tCO = halo ? heat(pos - 1) : 0;
  const e1 = { x: O1.x - d1.x * rO, y: O1.y - d1.y * rO }, e2 = { x: O2.x - d2.x * rO, y: O2.y - d2.y * rO };
  for (const s of [-1, 1]) g.append(svg('line', { x1: pts[1].x - d1.y * 3.6 * S * s, y1: pts[1].y + d1.x * 3.6 * S * s, x2: e1.x - d1.y * 3.6 * S * s, y2: e1.y + d1.x * 3.6 * S * s, stroke: mix(C.grey, C.coral, tCO), 'stroke-width': String(w), 'stroke-linecap': 'round' }));
  g.append(svg('line', { x1: pts[1].x, y1: pts[1].y, x2: e2.x, y2: e2.y, stroke: mix(C.grey, C.coral, tCO), 'stroke-width': String(w), 'stroke-linecap': 'round' }));
  g.append(labelText(api, O1.x, O1.y, 'O', C.ink, 20 * S));
  if (opts.base){
    g.append(labelText(api, O2.x, O2.y, 'O', C.blue, 20 * S));
    const cx = O2.x + 20 * S, cy = O2.y + 4 * S, R = 7 * S;
    g.append(svg('circle', { cx, cy, r: R, fill: 'none', stroke: C.blue, 'stroke-width': String(1.6 * S) }));
    g.append(svg('line', { x1: cx - R * 0.55, y1: cy, x2: cx + R * 0.55, y2: cy, stroke: C.blue, 'stroke-width': String(1.8 * S), 'stroke-linecap': 'round' }));
  } else g.append(labelText(api, O2.x + 8 * S, O2.y, 'OH', C.ink, 20 * S));
  // halogens on carbon `pos`
  if (halo && count > 0){
    const upper = pos === 2 || pos === 4;
    const dirs = pos === 5 ? [[180], [180, 265], [180, 240, 300]][count - 1] : upper ? [[90], [62, 118]][count - 1] : [[270], [242, 298]][count - 1];
    const c = pts[pos];
    for (const deg of dirs){
      const t = deg * Math.PI / 180, L = 46 * S;
      const hx = c.x + Math.cos(t) * L, hy = c.y - Math.sin(t) * L;
      const rr = (x.length > 1 ? 14 : 11) * S;
      g.append(svg('line', { x1: c.x, y1: c.y, x2: hx - Math.cos(t) * rr, y2: hy + Math.sin(t) * rr, stroke: mix(C.grey, C.coral, 1), 'stroke-width': String(w), 'stroke-linecap': 'round' }));
      g.append(labelText(api, hx, hy, x, C.blue, 20 * S));
    }
  }
  // carbon numbers under the chain
  if (opts.numbers){
    // one baseline row of numbers under the chain; a lower carbon wearing a halogen gets its number above instead
    const baseY = pts[1].y + 26 * S;
    for (let k = 1; k <= 5; k++){
      const p = pts[k];
      const lower = k === 1 || k === 3 || k === 5;
      const lift = lower && halo && k === pos;
      g.append(svg('text', { x: p.x, y: lift ? p.y - 30 * S : baseY, 'text-anchor': 'middle', 'font-family': 'ui-monospace, Menlo, monospace', 'font-size': String(11 * S), fill: k === pos && halo ? C.goldhi : C.ink3, text: k === 1 ? '1' : k + ' ' + POS_NAME[k] }));
    }
  }
  return { g, pts };
}

export function mount(slots, api){
  const { el, svg } = api, C = api.colors;

  // ---------- VISUAL ----------
  const state = { x: 'Cl', pos: 2, count: 1 };
  const W = 800, H = 360;
  const stage = el('div', {});
  const caption = el('p', { style: { margin: '10px 0 0', color: C.ink2, fontSize: '15px', minHeight: '2.4em' }, text: '' });
  let meterFill = null, meterText = null, meterMax = 2.0;

  function render(note){
    stage.replaceChildren();
    const root = svg('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': acidName(state).replace(' acid', 'ate') + ' with the pull colored along the chain' });
    const ch = drawChain(api, { x: state.x, pos: state.pos, count: state.count, base: true, numbers: true, scale: 1.25, ox: 90, oy: 8 });
    root.append(ch.g);
    // meter
    const mx = 90, my = 292, mw = 620;
    root.append(svg('text', { x: mx, y: my - 10, 'font-family': 'ui-monospace, Menlo, monospace', 'font-size': '12', fill: C.ink3, text: 'ACID STRENGTH (QUALITATIVE)' }));
    root.append(svg('rect', { x: mx, y: my, width: mw, height: 16, rx: 8, fill: C.card, stroke: C.line }));
    const sc = score(state);
    meterFill = svg('rect', { x: mx, y: my, width: String(Math.max(6, mw * Math.min(1, sc / meterMax))), height: 16, rx: 8, fill: C.gold });
    root.append(meterFill);
    meterText = svg('text', { x: mx, y: my + 40, 'font-family': 'Georgia, serif', 'font-size': '17', fill: C.goldhi, text: meterWords(sc) });
    root.append(meterText);
    root.append(svg('text', { x: W - 90, y: my + 40, 'text-anchor': 'end', 'font-family': 'Georgia, serif', 'font-size': '15', fill: C.ink2, text: acidName(state).replace('pentanoic acid', 'pentanoate') }));
    stage.append(root);
    caption.textContent = note || ('Vacuum on carbon ' + state.pos + ' (' + POS_NAME[state.pos] + '), ' + state.count + ' ' + state.x + '. The coral fades along the chain: that is the pull dying with distance. A stronger pull on the blue minus means a more comfortable base and a stronger acid.');
    countChips.forEach((c, i) => { c.disabled = (i + 1) > maxCount(state.pos); c.setAttribute('aria-pressed', state.count === i + 1 ? 'true' : 'false'); });
  }
  const slider = el('input', { type: 'range', min: '2', max: '5', step: '1', value: String(state.pos), 'aria-label': 'Carbon the halogen sits on' });
  const sliderLabel = el('span', { text: 'carbon 2 (alpha)' });
  slider.addEventListener('input', () => {
    state.pos = +slider.value;
    sliderLabel.textContent = 'carbon ' + state.pos + ' (' + POS_NAME[state.pos] + ')';
    let note = null;
    if (state.count > maxCount(state.pos)){ state.count = maxCount(state.pos); note = 'A chain carbon only has two hydrogens to swap, so the count dropped to two. Only the end carbon can hold three.'; }
    render(note);
  });
  const haloChips = HALO.map(x => el('button', { class: 'chip', type: 'button', 'aria-pressed': x === state.x ? 'true' : 'false', text: x, onClick: () => { state.x = x; haloChips.forEach(c => c.setAttribute('aria-pressed', c.textContent === x ? 'true' : 'false')); render(); } }));
  const countChips = [1, 2, 3].map(n => el('button', { class: 'chip', type: 'button', text: n + (n === 1 ? ' halogen' : ' halogens'), onClick: () => { if (n > maxCount(state.pos)) return; state.count = n; render(); } }));
  slots.visual.append(stage,
    el('div', { class: 'controls' }, el('label', { class: 'slider' }, 'DRAG THE VACUUM', slider, sliderLabel)),
    el('div', { class: 'controls', role: 'group', 'aria-label': 'Which halogen' }, el('span', { class: 'eyebrow', text: 'halogen' }), ...haloChips, el('span', { class: 'eyebrow', style: { marginLeft: '10px' }, text: 'how many' }), ...countChips),
    caption);
  render();

  // ---------- YOU TRY ----------
  let item = null, firstTry = true, done = false;
  const tryBox = el('div', { class: 'item' });
  slots.try.append(tryBox);
  function acidCard(a){
    const s = svg('svg', { viewBox: '0 0 520 220', width: '100%', style: { display: 'block', maxHeight: '150px' }, 'aria-hidden': 'true' });
    s.append(drawChain(api, { x: a.x, pos: a.pos, count: a.count, base: false, numbers: false, scale: 1, ox: 20, oy: 30 }).g);
    return el('span', { style: { display: 'block' } }, s, el('span', { style: { display: 'block', textAlign: 'center', fontFamily: 'Georgia, serif', fontSize: '14px', color: C.ink2 }, text: acidName(a) }));
  }
  function next(){
    tryBox.replaceChildren(); api.clearCoach();
    item = gen(api.rng); firstTry = true; done = false;
    tryBox.append(el('p', { class: 'prompt', text: 'Which acid is stronger? Only one thing differs between them.' }));
    const box = el('div', { class: 'opts' });
    const btns = item.acids.map((a, i) => {
      const btn = el('button', { class: 'opt', type: 'button', 'aria-label': acidName(a) }, el('span', { class: 'k', text: 'AB'[i] }), acidCard(a));
      btn.addEventListener('click', () => {
        if (done) return;
        btns.forEach(x => x.classList.remove('picked')); btn.classList.add('picked');
        if (i === item.answer){ btn.classList.add('ok'); btns.forEach(x => { x.disabled = true; }); done = true; api.report(firstTry); api.clearCoach(); tryBox.append(el('div', { class: 'verdict good', text: 'You can read it.' }), el('div', { class: 'controls' }, el('button', { class: 'primary', type: 'button', text: 'Another one', onClick: next }))); }
        else { if (firstTry) api.report(false); firstTry = false; if (!tryBox.querySelector('.verdict')) tryBox.append(el('div', { class: 'verdict notyet', text: 'Not yet.' })); api.coach(item.rule); }
      });
      return btn;
    });
    box.append(...btns);
    tryBox.append(box);
  }
  next();
}
