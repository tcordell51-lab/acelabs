// The Roots of Organic · Level 1 · Root 1: Count your carbons (reading skeletal structures)
// ES module, no imports. The shell renders story, move, trap and holds-up from meta;
// this file draws the visual and the you-try.

export const meta = {
  id: 'l1-skeletal',
  level: 1,
  order: 1,
  needs3D: false,
  title: 'Count your carbons',
  concept: 'Reading skeletal structures',
  tagline: 'Every corner is a carbon. The hydrogens are there, you just cannot see them.',
  story: 'Organic chemists got tired of writing every carbon and every hydrogen, so they stopped. A skeletal structure is a zigzag where every corner and every line end is a carbon, and the hydrogens are simply not drawn. They are still there. Carbon makes four bonds, always, so whatever you do not see drawn is hydrogen. Two lines leaving a corner means two hydrogens hiding there. One line at the end means three. Oxygen, nitrogen and the halogens do get written out, so when you see a letter, read it. Before you name anything, before you push a single arrow, count your carbons, 1-2-3-4, then fill each one to four. Rule of thumb: count your carbons, then fill to four.',
  moveName: 'Count your carbons, then fill to four',
  move: [
    'Find the longest zigzag and count its corners and ends: 1-2-3-4.',
    'Add the branches. Every line end is a carbon too.',
    'At each carbon, count the lines drawn. A double bond counts as two.',
    'Hydrogens on that carbon equal four minus that count.'
  ],
  trap: 'Careful: the carbons hiding at the line ends get skipped. A line end is a full carbon with three hydrogens on it, and a short branch is one more carbon, not a decoration.',
  holdsUp: ['Nomenclature', 'Degrees of unsaturation', 'NMR peak counting', 'Every mechanism'],
  drill: 'Booster OChem: The Fundamentals'
};

// ---------------------------------------------------------------- geometry
const L = 46;                                   // bond length, viewBox units
const DEG = Math.PI / 180;
const SERIF = 'Georgia, "Times New Roman", serif';
const MONO = 'ui-monospace, "SF Mono", Menlo, monospace';
function vec(deg){ return [Math.cos(deg * DEG), Math.sin(deg * DEG)]; }
function norm(a){ a = a % 360; return a < 0 ? a + 360 : a; }
function stepAngle(k){ return (((k % 2) + 2) % 2) === 0 ? 30 : -30; }   // zigzag: down-right, up-right, ...

// ---------------------------------------------------------------- rng (node-safe for selfTest)
function makeRng(seed){
  let s = seed | 0;
  return function(){ s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
function ri(rng, a, b){ return a + Math.floor(rng() * (b - a + 1)); }

// ---------------------------------------------------------------- generator
// A molecule: a zigzag chain of n carbons, 0 to 2 methyl branches on interior carbons,
// at most one double bond in the chain, at most one written-out group (OH or Br) on a
// chain carbon that has no branch and is not part of the double bond (no enols, no vinyl bromides).
function genMol(rng){
  const n = ri(rng, 4, 7);
  const nb = ri(rng, 0, 2);
  const pool = []; for (let i = 1; i <= n - 2; i++) pool.push(i);
  const branches = [];
  for (let k = 0; k < nb && pool.length; k++) branches.push(pool.splice(Math.floor(rng() * pool.length), 1)[0]);
  branches.sort((a, b) => a - b);
  const dbl = rng() < 0.5 ? ri(rng, 0, n - 2) : -1;
  let het = null;
  if (rng() < 0.55){
    const cands = [];
    for (let i = 0; i < n; i++){
      if (branches.includes(i)) continue;
      if (dbl >= 0 && (i === dbl || i === dbl + 1)) continue;
      cands.push(i);
    }
    if (cands.length) het = { pos: cands[Math.floor(rng() * cands.length)], label: rng() < 0.5 ? 'OH' : 'Br' };
  }
  return { n, branches, dbl, het };
}

// Build the atom list with coordinates, bonds and hydrogen counts. Pure data, node-safe.
function build(m){
  const atoms = [];    // { x, y, kind: 'chain'|'branch', idx, used: [angles], H, lines }
  const bonds = [];    // { a, b, order, ref } a/b index into atoms; ref = point on the side for the second line
  const dx = L * Math.cos(30 * DEG), dy = L * Math.sin(30 * DEG);
  for (let i = 0; i < m.n; i++) atoms.push({ x: i * dx, y: (i % 2) * dy, kind: 'chain', idx: i, used: [], lines: 0 });
  for (let i = 0; i < m.n - 1; i++){
    const order = i === m.dbl ? 2 : 1;
    bonds.push({ a: i, b: i + 1, order });
    atoms[i].used.push(norm(stepAngle(i))); atoms[i + 1].used.push(norm(stepAngle(i) + 180));
    atoms[i].lines += order; atoms[i + 1].lines += order;
  }
  for (const pos of m.branches){
    const dir = pos % 2 === 0 ? 270 : 90;
    const [ux, uy] = vec(dir);
    atoms.push({ x: atoms[pos].x + ux * L, y: atoms[pos].y + uy * L, kind: 'branch', idx: atoms.length, used: [norm(dir + 180)], lines: 1 });
    bonds.push({ a: pos, b: atoms.length - 1, order: 1 });
    atoms[pos].used.push(dir); atoms[pos].lines += 1;
  }
  let hetero = null;
  if (m.het){
    const p = m.het.pos;
    const interior = p > 0 && p < m.n - 1;
    const dir = interior ? (p % 2 === 0 ? 270 : 90) : (p === 0 ? 150 : stepAngle(m.n - 1));
    const [ux, uy] = vec(dir);
    hetero = { x: atoms[p].x + ux * L, y: atoms[p].y + uy * L, label: m.het.label, from: p };
    atoms[p].used.push(norm(dir)); atoms[p].lines += 1;
  }
  for (const a of atoms) a.H = 4 - a.lines;
  // second-line side for the double bond: toward the next bond's V (or the previous one at the end)
  for (const b of bonds){ if (b.order !== 2) continue; const refIdx = b.b + 1 < m.n ? b.b + 1 : b.a - 1; b.ref = refIdx >= 0 ? atoms[refIdx] : null; }
  return { atoms, bonds, hetero, n: m.n };
}

// Where do the hidden hydrogens go? Into the largest angular gap; ties broken toward the
// carbon's free side (up for a top corner, down for a bottom corner).
function hDirections(a){
  const used = a.used.slice().sort((p, q) => p - q);
  if (!used.length) return [];
  const nH = a.H; if (nH <= 0) return [];
  const gaps = used.map((s, i) => { const e = i + 1 < used.length ? used[i + 1] : used[0] + 360; return { start: s, size: e - s }; });
  const max = Math.max(...gaps.map(g => g.size));
  const free = a.kind === 'chain' ? (a.idx % 2 === 0 ? 270 : 90) : used[0] + 180;
  const [fx, fy] = vec(free);
  let best = null, bestDot = -Infinity;
  for (const g of gaps){ if (g.size < max - 1e-6) continue; const [bx, by] = vec(g.start + g.size / 2); const d = bx * fx + by * fy; if (d > bestDot){ bestDot = d; best = g; } }
  const out = [];
  for (let k = 1; k <= nH; k++) out.push(best.start + best.size * k / (nH + 1));
  return out;
}

function bbox(mol){
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  const add = (x, y, r) => { x0 = Math.min(x0, x - r); y0 = Math.min(y0, y - r); x1 = Math.max(x1, x + r); y1 = Math.max(y1, y + r); };
  for (const a of mol.atoms){ add(a.x, a.y, L * 0.95); }
  if (mol.hetero) add(mol.hetero.x, mol.hetero.y, 22);
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
}

// ---------------------------------------------------------------- drawing
// opts: { interactive: 'reveal' | 'tap' | 'none', onHover(atomIdx|null), onTap(atomIdx), reveal: Set }
function drawMol(api, mol, opts){
  const C = api.colors, svg = api.svg;
  const bb = bbox(mol);
  const w = Math.max(bb.w, 520), h = Math.max(bb.h, 150);      // fixed width: every drawing shares one scale
  const ox = bb.x - (w - bb.w) / 2, oy = bb.y - (h - bb.h) / 2;
  const root = svg('svg', { viewBox: `${ox.toFixed(1)} ${oy.toFixed(1)} ${w.toFixed(1)} ${h.toFixed(1)}`, role: 'img', 'aria-label': 'a skeletal structure', style: { width: '100%', maxHeight: '320px', display: 'block' } });
  const gBonds = svg('g', { fill: 'none', stroke: C.ink, 'stroke-width': 2.6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
  const gH = svg('g');
  const gHit = svg('g');
  root.append(gBonds, gH, gHit);
  const A = mol.atoms;
  const line = (x1, y1, x2, y2, attrs) => svg('line', Object.assign({ x1: x1.toFixed(1), y1: y1.toFixed(1), x2: x2.toFixed(1), y2: y2.toFixed(1) }, attrs || {}));
  for (const b of mol.bonds){
    const p = A[b.a], q = A[b.b];
    gBonds.append(line(p.x, p.y, q.x, q.y));
    if (b.order === 2){
      const vx = q.x - p.x, vy = q.y - p.y, len = Math.hypot(vx, vy);
      let nx = -vy / len, ny = vx / len;
      if (b.ref){ const mx = (p.x + q.x) / 2, my = (p.y + q.y) / 2; if ((b.ref.x - mx) * nx + (b.ref.y - my) * ny < 0){ nx = -nx; ny = -ny; } }
      const off = 6.5, sh = 0.16;
      gBonds.append(line(p.x + vx * sh + nx * off, p.y + vy * sh + ny * off, q.x - vx * sh + nx * off, q.y - vy * sh + ny * off));
    }
  }
  if (mol.hetero){
    const hz = mol.hetero, p = A[hz.from];
    const vx = hz.x - p.x, vy = hz.y - p.y, len = Math.hypot(vx, vy);
    const gap = hz.label.length > 1 ? 15 : 10;
    gBonds.append(line(p.x, p.y, hz.x - vx / len * gap, hz.y - vy / len * gap));
    root.append(svg('text', { x: hz.x.toFixed(1), y: hz.y.toFixed(1), fill: C.ink, 'font-family': SERIF, 'font-size': 18, 'text-anchor': 'middle', 'dominant-baseline': 'central', text: hz.label }));
  }
  // hidden hydrogens, one group per carbon
  const hGroups = A.map(a => {
    const g = svg('g', { style: { opacity: 0, transition: api.reduced ? 'none' : 'opacity .22s ease' } });
    for (const d of hDirections(a)){
      const [ux, uy] = vec(d);
      g.append(line(a.x + ux * 5, a.y + uy * 5, a.x + ux * L * 0.5, a.y + uy * L * 0.5, { stroke: C.goldhi, 'stroke-width': 1.6, 'stroke-linecap': 'round', opacity: 0.85 }));
      g.append(svg('text', { x: (a.x + ux * L * 0.68).toFixed(1), y: (a.y + uy * L * 0.68).toFixed(1), fill: C.goldhi, 'font-family': SERIF, 'font-size': 14, 'text-anchor': 'middle', 'dominant-baseline': 'central', text: 'H' }));
    }
    gH.append(g);
    return g;
  });
  // hit targets
  const rings = [];
  const mode = (opts && opts.interactive) || 'none';
  if (mode !== 'none'){
    A.forEach((a, i) => {
      const g = svg('g', { role: 'button', tabindex: 0, 'aria-label': a.kind === 'chain' ? `carbon ${a.idx + 1} of the chain` : 'branch carbon', style: { cursor: 'pointer', outline: 'none' } });
      const ring = svg('circle', { cx: a.x.toFixed(1), cy: a.y.toFixed(1), r: 9, fill: 'none', stroke: C.gold, 'stroke-width': 2, style: { opacity: 0, transition: api.reduced ? 'none' : 'opacity .15s ease' } });
      const hit = svg('circle', { cx: a.x.toFixed(1), cy: a.y.toFixed(1), r: 17, fill: 'transparent', stroke: 'none', style: { pointerEvents: 'all' } });
      g.append(ring, hit);
      const fire = () => opts.onTap && opts.onTap(i);
      g.addEventListener('click', fire);
      g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); fire(); } });
      g.addEventListener('mouseenter', () => { ring.style.opacity = 1; opts.onHover && opts.onHover(i); });
      g.addEventListener('mouseleave', () => { if (!ring.dataset.lock) ring.style.opacity = 0; opts.onHover && opts.onHover(null); });
      g.addEventListener('focus', () => { ring.style.opacity = 1; opts.onHover && opts.onHover(i); });
      g.addEventListener('blur', () => { if (!ring.dataset.lock) ring.style.opacity = 0; opts.onHover && opts.onHover(null); });
      gHit.append(g);
      rings.push(ring);
    });
  }
  return {
    svg: root,
    showH(i, on){ hGroups[i].style.opacity = on ? 1 : 0; },
    ring(i, color, lock){ const r = rings[i]; if (!r) return; r.setAttribute('stroke', color); r.style.opacity = 1; if (lock) r.dataset.lock = '1'; else delete r.dataset.lock; },
    ringOff(i){ const r = rings[i]; if (!r) return; delete r.dataset.lock; r.style.opacity = 0; r.setAttribute('stroke', C.gold); }
  };
}

// ---------------------------------------------------------------- the you-try items (pure)
function nearMisses(rng, c){
  const cands = [c - 2, c - 1, c + 1, c + 2, c + 3].filter(v => v >= 1);
  const out = [];
  while (out.length < 3 && cands.length) out.push(cands.splice(Math.floor(rng() * cands.length), 1)[0]);
  return out;
}
function carbonsWithTwoH(mol){ return mol.atoms.map((a, i) => a.H === 2 ? i : -1).filter(i => i >= 0); }

// kind 'count': how many carbons. kind 'tap': tap the carbon with exactly two hydrogens (unique by construction, via rejection).
function genItem(rng, kind){
  if (kind === 'count'){
    const m = genMol(rng), mol = build(m);
    const c = mol.atoms.length;
    const opts = [c, ...nearMisses(rng, c)];
    // shuffle
    for (let i = opts.length - 1; i > 0; i--){ const j = Math.floor(rng() * (i + 1)); [opts[i], opts[j]] = [opts[j], opts[i]]; }
    return { kind, m, mol, choices: opts.map(v => ({ text: String(v), ok: v === c })), answer: c };
  }
  let tries = 0;
  while (tries++ < 400){
    const m = genMol(rng), mol = build(m);
    const twos = carbonsWithTwoH(mol);
    if (twos.length === 1) return { kind, m, mol, target: twos[0], tries };
  }
  return null;
}

// ---------------------------------------------------------------- mount
export function mount(slots, api){
  const C = api.colors, el = api.el;

  // ---- VISUAL: hover or tap a carbon to see its hydrogens
  const vis = slots.visual;
  const ledgerStyle = { fontFamily: MONO, fontSize: '13px', color: C.ink2, marginTop: '10px', minHeight: '1.6em', letterSpacing: '.02em' };
  let mol = null, drawn = null, revealAll = false, locked = null;
  const stage = el('div', {});
  const ledger = el('div', { style: ledgerStyle });
  const formulaLine = el('div', { style: { fontFamily: SERIF, fontSize: '15px', color: C.ink2, marginTop: '4px' } });
  const chipAll = el('button', { class: 'chip', type: 'button', 'aria-pressed': 'false', text: 'Show every hydrogen', onclick(){ revealAll = !revealAll; chipAll.setAttribute('aria-pressed', String(revealAll)); paintReveal(); describe(locked); } });
  const btnNew = el('button', { class: 'secondary', type: 'button', text: 'New molecule', onclick(){ fresh(); } });
  const hint = el('span', { style: { fontFamily: MONO, fontSize: '12px', color: C.ink3, marginLeft: 'auto' }, text: 'hover or tap any carbon' });
  vis.append(stage, ledger, formulaLine, el('div', { class: 'controls' }, chipAll, btnNew, hint));

  function gold(t){ return el('b', { text: t, style: { color: C.goldhi, fontWeight: 600 } }); }
  function describe(i){
    while (ledger.firstChild) ledger.removeChild(ledger.firstChild);
    if (i == null){ ledger.append(revealAll ? 'Every hydrogen shown. Each carbon fills to four.' : 'Hover or tap a carbon: lines drawn, then fill to four.'); return; }
    const a = mol.atoms[i];
    const name = a.kind === 'chain' ? `Carbon ${a.idx + 1} of ${mol.n} on the chain` : 'Branch carbon';
    ledger.append(name, ' · lines drawn ', gold(String(a.lines)), ' · hydrogens 4 - ', String(a.lines), ' = ', gold(String(a.H)));
  }
  function paintReveal(){ mol.atoms.forEach((a, i) => drawn.showH(i, revealAll || i === locked)); }
  function fresh(){
    mol = build(genMol(api.rng));
    locked = mol.atoms.findIndex(a => a.kind === 'chain' && a.H === 2);
    if (locked < 0) locked = 0;
    while (stage.firstChild) stage.removeChild(stage.firstChild);
    drawn = drawMol(api, mol, {
      interactive: 'reveal',
      onHover(i){ if (i == null){ paintReveal(); describe(locked); } else { drawn.showH(i, true); describe(i); } },
      onTap(i){ if (locked === i){ drawn.ringOff(i); locked = null; } else { if (locked != null) drawn.ringOff(locked); locked = i; drawn.ring(i, C.gold, true); } paintReveal(); describe(locked); }
    });
    stage.append(drawn.svg);
    if (locked != null) drawn.ring(locked, C.gold, true);
    paintReveal(); describe(locked);
    const nC = mol.atoms.length, nH = mol.atoms.reduce((s, a) => s + a.H, 0) + (mol.hetero && mol.hetero.label === 'OH' ? 1 : 0);
    while (formulaLine.firstChild) formulaLine.removeChild(formulaLine.firstChild);
    const parts = [`This one: ${nC} carbons, ${nH} hydrogens`];
    if (mol.hetero) parts.push(mol.hetero.label === 'OH' ? 'one oxygen' : 'one bromine');
    formulaLine.append(parts.join(', ') + '. Every corner and every line end counted.');
  }
  fresh();

  // ---- YOU TRY
  let flip = 0;
  runTry(slots.try, api, () => {
    const kind = (flip++ % 2 === 0) ? 'count' : 'tap';
    const it = genItem(api.rng, kind);
    if (it.kind === 'count'){
      const d = drawMol(api, it.mol, { interactive: 'none' });
      return { prompt: 'How many carbons are in this molecule?', node: d.svg, mode: 'choices', choices: it.choices,
        coach: 'Every corner is a carbon. Count them 1-2-3-4 along the longest line, then the branches, and do not skip the line ends.' };
    }
    let d;
    const targets = [];
    d = drawMol(api, it.mol, { interactive: 'tap', onTap(i){ const t = targets[i]; t && t.fire(); } });
    it.mol.atoms.forEach((a, i) => targets.push({ ok: i === it.target, a, fire: null,
      mark(ok){ d.ring(i, ok ? C.gold : C.coral, true); d.showH(i, true); },
      coach: `That carbon has ${a.lines} line${a.lines === 1 ? '' : 's'} drawn, so it is holding ${a.H} hydrogen${a.H === 1 ? '' : 's'}. Find the corner with exactly two lines leaving it.` }));
    return { prompt: 'Tap the carbon that carries exactly two hydrogens.', node: d.svg, mode: 'tap', targets,
      coach: 'Count the lines leaving each carbon, then fill to four. Two lines drawn means two hydrogens hiding.' };
  });
}

// ---------------------------------------------------------------- the you-try harness
// item: { prompt, node, mode: 'choices'|'tap', choices: [{text, ok}], targets: [{ok, fire, mark, coach}], coach }
function runTry(host, api, nextItem){
  const el = api.el;
  function show(){
    while (host.firstChild) host.removeChild(host.firstChild);
    api.clearCoach();
    const item = nextItem();
    const box = el('div', { class: 'item' });
    box.append(el('p', { class: 'prompt', text: item.prompt }));
    if (item.node) box.append(item.node);
    const verdict = el('div', { class: 'verdict', style: { minHeight: '1.4em' } });
    const actions = el('div', { class: 'controls' });
    const another = el('button', { class: 'primary', type: 'button', text: 'Another one', onclick: show });
    let reported = false, done = false, missed = false;
    const settle = ok => {
      if (!reported){ reported = true; api.report(ok); }
      if (ok){ done = true; verdict.className = 'verdict good'; verdict.textContent = missed ? 'There it is.' : 'You can read it.'; actions.append(another); another.focus(); }
      else { missed = true; verdict.className = 'verdict notyet'; verdict.textContent = 'Not yet.'; }
    };
    if (item.mode === 'choices'){
      const opts = el('div', { class: 'opts' });
      const btns = []; let picked = -1;
      const check = el('button', { class: 'primary', type: 'button', text: 'Check', onclick(){
        if (picked < 0 || done) return;
        const ok = item.choices[picked].ok;
        if (ok){ btns[picked].classList.add('ok'); btns.forEach(b => { b.disabled = true; }); check.remove(); settle(true); }
        else { btns[picked].classList.remove('picked'); btns[picked].disabled = true; picked = -1; check.disabled = true; api.coach(item.coach); settle(false); }
      } });
      check.disabled = true;
      item.choices.forEach((c, i) => {
        const b = el('button', { class: 'opt', type: 'button', onclick(){ if (done) return; picked = i; btns.forEach((x, j) => x.classList.toggle('picked', j === i)); check.disabled = false; } },
          el('span', { class: 'k', text: 'ABCD'[i] }), el('span', { text: c.text }));
        btns.push(b); opts.append(b);
      });
      box.append(opts, verdict, actions);
      actions.append(check);
    } else {
      item.targets.forEach(t => { t.fire = () => {
        if (done) return;
        t.mark(t.ok);
        if (t.ok){ settle(true); } else { api.coach(t.coach || item.coach); settle(false); }
      }; });
      box.append(verdict, actions);
    }
    host.append(box);
    if (item.mode === 'choices') { const first = box.querySelector('.opt'); if (first && host.dataset.started) first.focus(); }
    host.dataset.started = '1';
  }
  show();
}

// ---------------------------------------------------------------- selfTest (node-safe)
export function selfTest(){
  const notes = [];
  let tried = 0, tapTries = 0;
  const rng = makeRng(20260903);
  for (let k = 0; k < 260; k++){
    const kind = k % 2 === 0 ? 'count' : 'tap';
    const it = genItem(rng, kind);
    if (!it) return { ok: false, tried, notes: 'tap item could not be generated' };
    const mol = it.mol;
    // chemistry invariants: every carbon has 0 to 3 hydrogens and 4 total bonds
    for (const a of mol.atoms){
      if (a.lines < 1 || a.lines > 4 || a.H < 0 || a.H > 3) return { ok: false, tried, notes: `carbon with ${a.lines} lines / ${a.H} H` };
      if (a.lines + a.H !== 4) return { ok: false, tried, notes: 'octet broken' };
    }
    if (it.m.het){ const p = it.m.het.pos; if (it.m.branches.includes(p)) return { ok: false, tried, notes: 'heteroatom on a branched carbon' }; if (it.m.dbl >= 0 && (p === it.m.dbl || p === it.m.dbl + 1)) return { ok: false, tried, notes: 'heteroatom on a double bond carbon' }; }
    if (mol.atoms.length !== it.m.n + it.m.branches.length) return { ok: false, tried, notes: 'carbon count mismatch' };
    if (kind === 'count'){
      const oks = it.choices.filter(c => c.ok);
      if (oks.length !== 1 || Number(oks[0].text) !== mol.atoms.length) return { ok: false, tried, notes: 'count answer not unique' };
      const set = new Set(it.choices.map(c => c.text)); if (set.size !== 4) return { ok: false, tried, notes: 'duplicate count choices' };
      if (it.choices.some(c => Number(c.text) < 1)) return { ok: false, tried, notes: 'non-positive count choice' };
    } else {
      const twos = carbonsWithTwoH(mol);
      if (twos.length !== 1 || twos[0] !== it.target) return { ok: false, tried, notes: 'two-H carbon not unique' };
      for (const a of mol.atoms) for (const d of hDirections(a)) if (!isFinite(d)) return { ok: false, tried, notes: 'bad H direction' };
      tapTries += it.tries;
    }
    tried++;
  }
  // determinism
  const a = genItem(makeRng(7), 'count'), b = genItem(makeRng(7), 'count');
  if (JSON.stringify(a.m) !== JSON.stringify(b.m)) return { ok: false, tried, notes: 'same seed gave a different item' };
  notes.push(`avg ${(tapTries / 130).toFixed(1)} draws per unique-CH2 item`);
  return { ok: true, tried, notes: notes.join('; ') };
}
