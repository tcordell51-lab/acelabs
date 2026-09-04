// The Roots of Organic · Level 1 · Root 4: Look, do not compute (sigma, pi, degrees of unsaturation)
// ES module, no imports.

export const meta = {
  id: 'l1-unsat',
  level: 1,
  order: 4,
  needs3D: false,
  title: 'Look, do not compute',
  concept: 'Sigma, pi and degrees of unsaturation',
  tagline: 'Each ring is one, each double bond is one, a triple bond is two.',
  story: 'Every line drawn between two atoms is a sigma bond, the strong head-on one. A double bond is that sigma plus a pi bond, the weaker one made from p orbitals overlapping side by side. A triple bond is one sigma and two pi. Degrees of unsaturation is just a count of how far a molecule is from being a floppy, fully saturated chain: each ring costs one, each double bond costs one, each triple bond costs two. When the drawing is in front of you, do not touch the formula. Look, count, done. The formula, with its carbons and hydrogens and halogens, is for the day the question hands you only a molecular formula and no picture. Rule of thumb: rings plus pi bonds. Look, do not compute.',
  moveName: 'Rings first, then pi bonds',
  move: [
    'Count the rings. Each one is one degree.',
    'Count the double bonds. Each one is one degree.',
    'Count the triple bonds. Each one is two degrees.',
    'Add them up. Only reach for the formula when there is no drawing.'
  ],
  trap: 'Careful: a benzene ring is four degrees, one for the ring and three for the double bonds, whether it is drawn with three lines or with a circle.',
  holdsUp: ['Spectroscopy triage', 'Aromaticity', 'Reading products', 'Molecular formulas'],
  drill: 'Booster OChem: The Fundamentals'
};

// ---------------------------------------------------------------- geometry helpers
const L = 46;
const DEG = Math.PI / 180;
const SERIF = 'Georgia, "Times New Roman", serif';
const MONO = 'ui-monospace, "SF Mono", Menlo, monospace';
function vec(deg){ return [Math.cos(deg * DEG), Math.sin(deg * DEG)]; }

function makeRng(seed){
  let s = seed | 0;
  return function(){ s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
function ri(rng, a, b){ return a + Math.floor(rng() * (b - a + 1)); }

// ---------------------------------------------------------------- generator
// spec: { chain: n carbons, rings: [{ at: 'start'|'end', size: 5|6, dbl: 0|1|3, edge }], dbl: [bond idx], triple: bond idx | -1 }
// Rings hang off the first or last chain carbon (that carbon is a ring vertex). Chain double bonds never
// touch a ring carbon or share a carbon with another multiple bond. Benzene counts as its three double bonds.
function genSpec(rng){
  const nR = ri(rng, 0, 2);
  const rings = [];
  let n;
  if (nR === 0) n = ri(rng, 4, 8);
  else if (nR === 1){ n = ri(rng, 1, 6); rings.push({ at: rng() < 0.5 ? 'start' : 'end' }); }
  else { n = ri(rng, 2, 5); rings.push({ at: 'start' }, { at: 'end' }); }
  let doubles = 0;
  for (const r of rings){
    r.size = rng() < 0.6 ? 6 : 5;
    const roll = rng();
    r.dbl = r.size === 6 && roll < 0.35 && doubles === 0 ? 3 : roll < 0.6 ? 1 : 0;
    if (r.dbl === 3 && doubles > 0) r.dbl = 1;
    r.edge = r.dbl === 1 ? ri(rng, 1, r.size - 2) : -1;
    doubles += r.dbl;
  }
  // chain bonds available for multiple bonds: neither end carbon may be a ring carbon
  const ringAtStart = rings.some(r => r.at === 'start'), ringAtEnd = rings.some(r => r.at === 'end');
  const free = [];
  for (let k = 0; k < n - 1; k++){ if (ringAtStart && k === 0) continue; if (ringAtEnd && k === n - 2) continue; free.push(k); }
  const taken = new Set();
  const blocked = k => taken.has(k) || taken.has(k - 1) || taken.has(k + 1);
  let triple = -1;
  if (free.length && rng() < 0.3){ triple = free[Math.floor(rng() * free.length)]; taken.add(triple); }
  const dbl = [];
  const wantD = Math.max(0, Math.min(3 - doubles, ri(rng, 0, 3)));
  for (let t = 0; t < wantD; t++){
    const cands = free.filter(k => !blocked(k));
    if (!cands.length) break;
    const k = cands[Math.floor(rng() * cands.length)]; dbl.push(k); taken.add(k);
  }
  dbl.sort((a, b) => a - b);
  return { chain: n, rings, dbl, triple };
}

// ---------------------------------------------------------------- build coordinates and graph
function build(spec){
  const n = spec.chain;
  const isTriple = k => k === spec.triple;
  const linear = k => isTriple(k) || isTriple(k - 1) || isTriple(k + 1);
  const ang = []; let prev = -30;
  for (let k = 0; k <= n - 1; k++){ const a = linear(k) ? prev : -prev; ang.push(a); prev = a; }
  const atoms = [{ x: 0, y: 0 }];
  for (let k = 0; k < n - 1; k++){ const [ux, uy] = vec(ang[k]); atoms.push({ x: atoms[k].x + ux * L, y: atoms[k].y + uy * L }); }
  const bonds = [];  // { a, b, order, kind: 'chain'|'ring', ring, ref }
  for (let k = 0; k < n - 1; k++) bonds.push({ a: k, b: k + 1, order: isTriple(k) ? 3 : spec.dbl.includes(k) ? 2 : 1, kind: 'chain', ref: k + 2 < n ? k + 2 : (k - 1 >= 0 ? k - 1 : -1) });
  const rings = [];
  for (const r of spec.rings){
    const ipso = r.at === 'start' ? 0 : n - 1;
    let dir;
    if (n === 1) dir = 0;
    else if (r.at === 'end') dir = ang[n - 1];
    else dir = (linear(0) ? ang[0] : -ang[0]) + 180;
    const m = r.size, Rr = L / (2 * Math.sin(Math.PI / m));
    const [ux, uy] = vec(dir);
    const cx = atoms[ipso].x + ux * Rr, cy = atoms[ipso].y + uy * Rr;
    const th0 = dir + 180;
    const idx = [ipso];
    for (let k = 1; k < m; k++){ const [vx, vy] = vec(th0 + 360 * k / m); atoms.push({ x: cx + vx * Rr, y: cy + vy * Rr }); idx.push(atoms.length - 1); }
    const ringBonds = [];
    for (let k = 0; k < m; k++){
      const order = r.dbl === 3 ? (k % 2 === 0 ? 2 : 1) : (r.dbl === 1 && k === r.edge ? 2 : 1);
      const bd = { a: idx[k], b: idx[(k + 1) % m], order, kind: 'ring', ring: rings.length, center: [cx, cy] };
      bonds.push(bd); ringBonds.push(bd);
    }
    rings.push({ idx, cx, cy, size: m, bonds: ringBonds, benzene: r.dbl === 3 });
  }
  const nDouble = bonds.filter(b => b.order === 2).length, nTriple = bonds.filter(b => b.order === 3).length;
  return { atoms, bonds, rings, nDouble, nTriple, pi: nDouble + 2 * nTriple, dou: rings.length + nDouble + 2 * nTriple };
}

// Independent check: hydrocarbon formula. Every atom is carbon; H = 4 - (sum of bond orders).
function formulaDoU(mol){
  const val = mol.atoms.map(() => 0);
  for (const b of mol.bonds){ val[b.a] += b.order; val[b.b] += b.order; }
  if (val.some(v => v > 4 || v < 1)) return NaN;
  const C = mol.atoms.length, H = val.reduce((s, v) => s + (4 - v), 0);
  return (2 * C + 2 - H) / 2;
}

function bbox(mol){
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const a of mol.atoms){ x0 = Math.min(x0, a.x); y0 = Math.min(y0, a.y); x1 = Math.max(x1, a.x); y1 = Math.max(y1, a.y); }
  const p = L * 0.7;
  return { x: x0 - p, y: y0 - p, w: x1 - x0 + 2 * p, h: y1 - y0 + 2 * p };
}

// ---------------------------------------------------------------- drawing
// opts: { onBondHover(bond|null) }; returned paint(ringsOn, piOn) lights rings green and pi bonds amber
function drawMol(api, mol, opts){
  const C = api.colors, svg = api.svg;
  opts = opts || {};
  const bb = bbox(mol);
  const w = Math.max(bb.w, 520), h = Math.max(bb.h, 150);
  const ox = bb.x - (w - bb.w) / 2, oy = bb.y - (h - bb.h) / 2;
  const root = svg('svg', { viewBox: `${ox.toFixed(1)} ${oy.toFixed(1)} ${w.toFixed(1)} ${h.toFixed(1)}`, role: 'img', 'aria-label': 'a skeletal structure', style: { width: '100%', maxHeight: '340px', display: 'block' } });
  const gFill = svg('g'), gGlow = svg('g'), gBonds = svg('g', { fill: 'none', stroke: C.ink, 'stroke-width': 2.6, 'stroke-linecap': 'round' }), gTags = svg('g'), gHit = svg('g');
  root.append(gFill, gGlow, gBonds, gTags, gHit);
  const A = mol.atoms;
  const line = (x1, y1, x2, y2, attrs) => svg('line', Object.assign({ x1: x1.toFixed(1), y1: y1.toFixed(1), x2: x2.toFixed(1), y2: y2.toFixed(1) }, attrs || {}));
  const tr = api.reduced ? 'none' : 'opacity .25s ease, stroke .25s ease';
  // ring fills
  const ringFills = mol.rings.map((r, i) => {
    const pts = r.idx.map(k => `${A[k].x.toFixed(1)},${A[k].y.toFixed(1)}`).join(' ');
    const poly = svg('polygon', { points: pts, fill: C.green, 'fill-opacity': 0.22, stroke: 'none', style: { opacity: 0, transition: tr } });
    const tag = svg('text', { x: r.cx.toFixed(1), y: r.cy.toFixed(1), fill: C.green, 'font-family': MONO, 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', 'dominant-baseline': 'central', text: String(i + 1), style: { opacity: 0, transition: tr } });
    gFill.append(poly); gTags.append(tag);
    return { poly, tag, bonds: r.bonds };
  });
  // bonds
  const piEls = [];   // { lines: [], tag, order }
  const bondEls = [];
  let piCount = 0;
  for (const b of mol.bonds){
    const p = A[b.a], q = A[b.b];
    const vx = q.x - p.x, vy = q.y - p.y, len = Math.hypot(vx, vy);
    let nx = -vy / len, ny = vx / len;
    const lines = [line(p.x, p.y, q.x, q.y)];
    if (b.order === 2){
      let refX, refY;
      if (b.kind === 'ring'){ refX = b.center[0]; refY = b.center[1]; }
      else if (b.ref >= 0){ refX = A[b.ref].x; refY = A[b.ref].y; }
      if (refX != null){ const mx = (p.x + q.x) / 2, my = (p.y + q.y) / 2; if ((refX - mx) * nx + (refY - my) * ny < 0){ nx = -nx; ny = -ny; } }
      const off = 6.5, sh = 0.16;
      lines.push(line(p.x + vx * sh + nx * off, p.y + vy * sh + ny * off, q.x - vx * sh + nx * off, q.y - vy * sh + ny * off));
    } else if (b.order === 3){
      const off = 6.2, sh = 0.05;
      for (const s of [-1, 1]) lines.push(line(p.x + vx * sh + nx * off * s, p.y + vy * sh + ny * off * s, q.x - vx * sh + nx * off * s, q.y - vy * sh + ny * off * s));
    }
    for (const l of lines){ l.style.transition = tr; gBonds.append(l); }
    const rec = { bond: b, lines, tag: null, glow: null };
    if (b.order > 1){
      piCount += b.order - 1;
      const glow = line(p.x, p.y, q.x, q.y, { stroke: C.amber, 'stroke-width': 12, 'stroke-opacity': 0.28, 'stroke-linecap': 'round', style: { opacity: 0, transition: tr } });
      gGlow.append(glow); rec.glow = glow;
      // the pi count tag sits on the side away from the second line
      const side = b.order === 2 ? -1 : 1;
      const tx = (p.x + q.x) / 2 + nx * 17 * side, ty = (p.y + q.y) / 2 + ny * 17 * side;
      const tag = svg('text', { x: tx.toFixed(1), y: ty.toFixed(1), fill: C.amber, 'font-family': MONO, 'font-size': 13, 'font-weight': 700, 'text-anchor': 'middle', 'dominant-baseline': 'central', text: b.order === 3 ? '2' : '1', style: { opacity: 0, transition: tr } });
      gTags.append(tag); rec.tag = tag;
      piEls.push(rec);
    }
    bondEls.push(rec);
    if (opts.onBondHover){
      const hit = line(p.x, p.y, q.x, q.y, { stroke: 'transparent', 'stroke-width': 18, 'stroke-linecap': 'round', style: { pointerEvents: 'stroke', cursor: 'help' } });
      hit.addEventListener('mouseenter', () => opts.onBondHover(b));
      hit.addEventListener('mouseleave', () => opts.onBondHover(null));
      hit.addEventListener('click', () => opts.onBondHover(b));
      gHit.append(hit);
    }
  }
  return {
    svg: root,
    // one painter for both chips so the colors never fight: pi wins over ring, ring wins over ink
    paint(ringsOn, piOn){
      for (const r of ringFills){ r.poly.style.opacity = ringsOn ? 1 : 0; r.tag.style.opacity = ringsOn ? 1 : 0; }
      for (const rec of bondEls){
        const b = rec.bond;
        const color = (piOn && b.order > 1) ? C.amber : (ringsOn && b.kind === 'ring') ? C.green : C.ink;
        for (const l of rec.lines) l.setAttribute('stroke', color);
        if (rec.glow) rec.glow.style.opacity = piOn ? 1 : 0;
        if (rec.tag) rec.tag.style.opacity = piOn ? 1 : 0;
      }
    },
    piCount
  };
}

// ---------------------------------------------------------------- you-try items (pure)
function choicesAround(rng, v){
  const cands = [v - 2, v - 1, v + 1, v + 2, v + 3].filter(x => x >= 0);
  const picks = [];
  while (picks.length < 3 && cands.length) picks.push(cands.splice(Math.floor(rng() * cands.length), 1)[0]);
  const all = [v, ...picks];
  for (let i = all.length - 1; i > 0; i--){ const j = Math.floor(rng() * (i + 1)); [all[i], all[j]] = [all[j], all[i]]; }
  return all.map(x => ({ text: String(x), ok: x === v }));
}
function genItem(rng, kind){
  const spec = genSpec(rng), mol = build(spec);
  if (kind === 'pi' && mol.pi === 0) kind = 'dou';       // do not ask for pi bonds when there are none to see
  const v = kind === 'pi' ? mol.pi : mol.dou;
  return { kind, spec, mol, answer: v, choices: choicesAround(rng, v) };
}

// ---------------------------------------------------------------- mount
export function mount(slots, api){
  const C = api.colors, el = api.el;

  // ---- VISUAL
  let mol = null, drawn = null, ringsOn = false, piOn = false;
  const stage = el('div', {});
  const gold = t => el('b', { text: t, style: { color: C.goldhi, fontWeight: 600 } });
  const ledger = el('div', { style: { fontFamily: MONO, fontSize: '13px', color: C.ink2, marginTop: '10px', letterSpacing: '.02em', display: 'flex', gap: '18px', flexWrap: 'wrap' } });
  const capt = el('div', { style: { fontFamily: SERIF, fontSize: '15px', color: C.ink2, minHeight: '1.5em', marginTop: '6px' } });
  const chipR = el('button', { class: 'chip', type: 'button', 'aria-pressed': 'false', text: 'Light the rings', onclick(){ ringsOn = !ringsOn; chipR.setAttribute('aria-pressed', String(ringsOn)); drawn.paint(ringsOn, piOn); ledgerize(); } });
  const chipP = el('button', { class: 'chip', type: 'button', 'aria-pressed': 'false', text: 'Light the pi bonds', onclick(){ piOn = !piOn; chipP.setAttribute('aria-pressed', String(piOn)); drawn.paint(ringsOn, piOn); ledgerize(); } });
  const btnNew = el('button', { class: 'secondary', type: 'button', text: 'New molecule', onclick: fresh });
  const hint = el('span', { style: { fontFamily: MONO, fontSize: '12px', color: C.ink3, marginLeft: 'auto' }, text: 'hover any bond for sigma and pi' });
  slots.visual.append(stage, ledger, capt, el('div', { class: 'controls' }, chipR, chipP, btnNew, hint));

  function cell(label, value, color){ return el('span', {}, label + ' ', el('b', { text: value, style: { color, fontWeight: 600 } })); }
  function ledgerize(){
    while (ledger.firstChild) ledger.removeChild(ledger.firstChild);
    const nR = mol.rings.length;
    ledger.append(cell('Rings', ringsOn ? String(nR) : '?', C.green));
    ledger.append(cell('Pi bonds', piOn ? `${mol.pi}` + (mol.nTriple ? ` (${mol.nDouble} double, ${mol.nTriple} triple)` : '') : '?', C.amber));
    ledger.append(cell('Degrees of unsaturation', ringsOn && piOn ? `${nR} + ${mol.pi} = ${mol.dou}` : '?', C.goldhi));
    ledger.append(cell('Sigma bonds drawn', String(mol.bonds.length), C.ink));
  }
  function describe(b){
    if (!b){ capt.textContent = mol.rings.some(r => r.benzene) ? 'That benzene ring alone is four: one ring plus three double bonds.' : 'Every line is one sigma bond. Double and triple bonds add the pi.'; return; }
    capt.textContent = b.order === 1 ? 'Single bond: one sigma. No degrees.' : b.order === 2 ? 'Double bond: one sigma and one pi. One degree.' : 'Triple bond: one sigma and two pi. Two degrees.';
  }
  function fresh(){
    mol = build(genSpec(api.rng));
    while (stage.firstChild) stage.removeChild(stage.firstChild);
    drawn = drawMol(api, mol, { onBondHover: describe });
    stage.append(drawn.svg);
    drawn.paint(ringsOn, piOn);
    ledgerize(); describe(null);
  }
  fresh();

  // ---- YOU TRY
  let flip = 0;
  runTry(slots.try, api, () => {
    const kind = (flip++ % 3 === 2) ? 'pi' : 'dou';
    const it = genItem(api.rng, kind);
    const d = drawMol(api, it.mol, {});
    const benz = it.mol.rings.some(r => r.benzene);
    const coach = it.kind === 'pi'
      ? (benz ? 'The benzene ring holds three pi bonds all by itself, one per double bond. Then add the rest.' : 'A double bond is one pi, a triple bond is two pi. Count them straight off the drawing.')
      : (benz ? 'That benzene ring is four by itself: one for the ring, three for its double bonds. Then add the rest.' : 'Each ring is one, each double bond is one, a triple bond is two. Look, do not compute.');
    return { prompt: it.kind === 'pi' ? 'How many pi bonds are in this molecule?' : 'How many degrees of unsaturation does this molecule have?', node: d.svg, mode: 'choices', choices: it.choices, coach };
  });
}

// ---------------------------------------------------------------- the you-try harness
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
    const opts = el('div', { class: 'opts' });
    const btns = []; let picked = -1;
    const check = el('button', { class: 'primary', type: 'button', text: 'Check', onclick(){
      if (picked < 0 || done) return;
      const ok = item.choices[picked].ok;
      if (ok){ btns[picked].classList.add('ok'); btns.forEach(x => { x.disabled = true; }); check.remove(); settle(true); }
      else { btns[picked].classList.remove('picked'); btns[picked].disabled = true; picked = -1; check.disabled = true; api.coach(item.coach); settle(false); }
    } });
    check.disabled = true;
    item.choices.forEach((c, i) => {
      const bt = el('button', { class: 'opt', type: 'button', onclick(){ if (done) return; picked = i; btns.forEach((x, j) => x.classList.toggle('picked', j === i)); check.disabled = false; } },
        el('span', { class: 'k', text: 'ABCD'[i] }), el('span', { text: c.text }));
      btns.push(bt); opts.append(bt);
    });
    box.append(opts, verdict, actions);
    actions.append(check);
    host.append(box);
    if (host.dataset.started) btns[0].focus();
    host.dataset.started = '1';
  }
  show();
}

// ---------------------------------------------------------------- selfTest (node-safe)
export function selfTest(){
  const rng = makeRng(20260903);
  let tried = 0, benzenes = 0, triples = 0, maxDou = 0;
  for (let k = 0; k < 300; k++){
    const it = genItem(rng, k % 3 === 2 ? 'pi' : 'dou');
    const mol = it.mol;
    // the answer is unique among the choices and equals the looked-up count
    const oks = it.choices.filter(c => c.ok);
    if (oks.length !== 1 || Number(oks[0].text) !== it.answer) return { ok: false, tried, notes: 'answer not unique' };
    if (new Set(it.choices.map(c => c.text)).size !== 4) return { ok: false, tried, notes: 'duplicate choices' };
    if (it.choices.some(c => Number(c.text) < 0)) return { ok: false, tried, notes: 'negative choice' };
    // look-count equals the formula count (independent path through valences)
    const f = formulaDoU(mol);
    if (!(f === mol.dou)) return { ok: false, tried, notes: `formula ${f} disagrees with count ${mol.dou}` };
    if (it.kind === 'pi' && it.answer !== mol.nDouble + 2 * mol.nTriple) return { ok: false, tried, notes: 'pi count off' };
    // no carbon over four bonds, no multiple bonds sharing a carbon, ring carbons keep single chain bonds
    const val = mol.atoms.map(() => 0), multi = mol.atoms.map(() => 0);
    for (const b of mol.bonds){ val[b.a] += b.order; val[b.b] += b.order; if (b.order > 1){ multi[b.a]++; multi[b.b]++; } }
    if (val.some(v => v > 4)) return { ok: false, tried, notes: 'carbon over four bonds' };
    if (multi.some(m => m > 1) && !mol.rings.some(r => r.benzene)) return { ok: false, tried, notes: 'allene or enyne generated' };
    for (const r of mol.rings){ if (r.benzene){ for (const i of r.idx) if (multi[i] !== 1) return { ok: false, tried, notes: 'benzene carbon not exactly one double bond' }; } }
    if (mol.rings.some(r => r.benzene)) benzenes++;
    if (mol.nTriple) triples++;
    maxDou = Math.max(maxDou, mol.dou);
    tried++;
  }
  const a = genItem(makeRng(11), 'dou'), b = genItem(makeRng(11), 'dou');
  if (JSON.stringify(a.spec) !== JSON.stringify(b.spec)) return { ok: false, tried, notes: 'same seed gave a different item' };
  if (!benzenes || !triples) return { ok: false, tried, notes: 'domain too narrow' };
  return { ok: true, tried, notes: `formula check passed; ${benzenes} benzenes, ${triples} triples, max ${maxDou} degrees` };
}
