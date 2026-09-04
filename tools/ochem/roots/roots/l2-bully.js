// The Roots of Organic, Level 2, Root 1: The electron bully.
// Electronegativity, dipoles, partial charges. No imports (contract).

export const meta = {
  id: 'l2-bully',
  level: 2,
  order: 1,
  needs3D: false,
  title: 'The electron bully',
  concept: 'Electronegativity and partial charge',
  tagline: 'Find the bully, then look at its neighbor. The neighbor is the target.',
  story: 'That oxygen is hogging those electrons. It is like, screw you, carbon, I am way better at this, I am going to hog those electrons. That is electronegativity: how hard an atom pulls on a pair it is sharing, and it climbs toward the upper right of the periodic table. When two different atoms share a bond, the better puller drags the pair toward itself and comes out a little negative, which leaves its partner a little positive. That partial positive carbon is exactly where a nucleophile attacks. I want you to visualize it more than memorize it. Rule of thumb: find the bully, then look at its neighbor. The neighbor is the target.',
  moveName: 'Find the bully, then look at its neighbor',
  move: [
    'Find the most electronegative atom in the bond. Upper right of the table pulls hardest: F, then O, then Cl and N.',
    'That atom is hogging the pair, so it gets the partial negative (blue).',
    'Its neighbor is left partial positive (coral). That neighbor is the target a nucleophile attacks.',
    'Same atom on both ends? No bully, no pull, nonpolar bond.'
  ],
  trap: 'Careful: Grignard and organolithium reagents flip it, because Mg and Li pull weaker than carbon, so that carbon becomes the electron-rich nucleophile.',
  holdsUp: ['Nucleophile versus electrophile', 'Carbonyl chemistry', 'SN2 targets', 'Acidity by induction'],
  drill: 'Booster OChem: The Fundamentals'
};


// Pauling electronegativity, the table the whole root runs on.
const EN = { F: 4.0, O: 3.4, Cl: 3.2, N: 3.0, Br: 3.0, C: 2.6, H: 2.2, Mg: 1.3, Li: 1.0 };
const LADDER = ['Li', 'Mg', 'H', 'C', 'N', 'Br', 'Cl', 'O', 'F'];
const MIN_PULL = 0.4;   // below this gap we call the bond nonpolar for DAT purposes

// The bonds the visual can show.
const SHOW = [
  { id: 'C=O', a: 'C', b: 'O', order: 2 },
  { id: 'C-Cl', a: 'C', b: 'Cl', order: 1 },
  { id: 'C-N', a: 'C', b: 'N', order: 1 },
  { id: 'C-Mg', a: 'C', b: 'Mg', order: 1 },
  { id: 'O-H', a: 'O', b: 'H', order: 1 },
  { id: 'C-C', a: 'C', b: 'C', order: 1 }
];

// Bond pairs for "which atom is partially positive" (gap at least MIN_PULL, organic-relevant).
const PAIRS_A = [
  ['C', 'O', 1], ['C', 'O', 2], ['C', 'N', 1], ['C', 'Cl', 1], ['C', 'Br', 1], ['C', 'F', 1],
  ['O', 'H', 1], ['N', 'H', 1], ['C', 'Mg', 1], ['C', 'Li', 1], ['H', 'F', 1], ['H', 'Cl', 1], ['H', 'Br', 1]
];
// Bonds for "which bond is more polar".
const BONDS_B = [
  ['C', 'H'], ['C', 'C'], ['C', 'N'], ['C', 'O'], ['C', 'F'], ['C', 'Cl'], ['C', 'Br'], ['C', 'Mg'], ['C', 'Li'],
  ['O', 'H'], ['N', 'H'], ['H', 'F'], ['H', 'Cl'], ['H', 'Br']
];
const MIN_GAP_B = 0.3;

function gap(a, b){ return Math.round(Math.abs(EN[a] - EN[b]) * 10) / 10; }
function bondName(a, b, order){ return a + (order === 2 ? '=' : '-') + b; }

// What the pull does: who is rich, who is poor, and the sentence that explains it.
export function readBond(a, b){
  const g = Math.round((EN[b] - EN[a]) * 10) / 10;
  if (Math.abs(g) < MIN_PULL) return { pull: false, rich: null, poor: null, note: 'Same pull on both ends. No bully, no dipole: this bond is nonpolar.' };
  const rich = g > 0 ? b : a, poor = g > 0 ? a : b;
  let note = rich + ' (' + EN[rich].toFixed(1) + ') pulls harder than ' + poor + ' (' + EN[poor].toFixed(1) + '). ' + rich + ' hogs the pair and goes partial negative; ' + poor + ' is left partial positive.';
  if (rich === 'C' && (poor === 'Mg' || poor === 'Li')) note = 'The flip. ' + poor + ' (' + EN[poor].toFixed(1) + ') is a weaker puller than carbon (2.6), so the carbon is the rich end here. A ' + (poor === 'Mg' ? 'Grignard' : 'organolithium') + ' carbon is a nucleophile: it attacks.';
  else if (poor === 'C') note += ' That carbon is the target a nucleophile attacks.';
  else if (poor === 'H') note += ' That hydrogen is the one an acid gives away.';
  return { pull: true, rich, poor, note };
}

// ---------- item generator (pure, node-safe) ----------
export function gen(rng){
  const r = rng();
  if (r < 0.6){
    const p = PAIRS_A[Math.floor(rng() * PAIRS_A.length)];
    const flip = rng() < 0.5;
    const left = flip ? p[1] : p[0], right = flip ? p[0] : p[1];
    const read = readBond(left, right);
    return { type: 'atom', left, right, order: p[2], answer: read.poor === left ? 0 : 1, read };
  }
  let x, y, tries = 0;
  do {
    x = BONDS_B[Math.floor(rng() * BONDS_B.length)];
    y = BONDS_B[Math.floor(rng() * BONDS_B.length)];
    tries++;
  } while ((x === y || Math.abs(gap(x[0], x[1]) - gap(y[0], y[1])) < MIN_GAP_B) && tries < 200);
  const gx = gap(x[0], x[1]), gy = gap(y[0], y[1]);
  return { type: 'bond', bonds: [x, y], gaps: [gx, gy], answer: gx > gy ? 0 : 1 };
}

function mulberry(seed){ let s = seed | 0; return function(){ s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

export function selfTest(){
  const rng = mulberry(7);
  let tried = 0, atoms = 0, bonds = 0;
  for (let i = 0; i < 400; i++){
    const it = gen(rng);
    tried++;
    if (it.type === 'atom'){
      atoms++;
      if (!it.read.pull) return { ok: false, tried, notes: 'atom item with no pull: ' + it.left + it.right };
      if (gap(it.left, it.right) < MIN_PULL) return { ok: false, tried, notes: 'atom item below MIN_PULL' };
      const poor = EN[it.left] < EN[it.right] ? 0 : 1;
      if (poor !== it.answer) return { ok: false, tried, notes: 'answer is not the lower-EN atom' };
      if (it.answer !== 0 && it.answer !== 1) return { ok: false, tried, notes: 'answer out of range' };
    } else {
      bonds++;
      const [x, y] = it.bonds;
      if (x === y) return { ok: false, tried, notes: 'same bond twice' };
      if (Math.abs(it.gaps[0] - it.gaps[1]) < MIN_GAP_B) return { ok: false, tried, notes: 'bond gap too close to call' };
      const bigger = it.gaps[0] > it.gaps[1] ? 0 : 1;
      if (bigger !== it.answer) return { ok: false, tried, notes: 'bond answer mismatch' };
    }
  }
  // determinism: same seed, same items
  const a = gen(mulberry(99)), b = gen(mulberry(99));
  if (JSON.stringify(a) !== JSON.stringify(b)) return { ok: false, tried, notes: 'not reproducible' };
  // the flip is real: C-Mg and C-Li make carbon the rich end
  if (readBond('C', 'Mg').rich !== 'C' || readBond('C', 'Li').rich !== 'C') return { ok: false, tried, notes: 'Grignard flip missing' };
  if (readBond('C', 'C').pull) return { ok: false, tried, notes: 'C-C should not pull' };
  return { ok: true, tried, notes: atoms + ' tap-the-atom, ' + bonds + ' which-is-more-polar' };
}

// ---------- drawing ----------
let uid = 0;
function tween(api, ms, step, done){
  if (api.reduced || typeof requestAnimationFrame !== 'function'){ step(1); if (done) done(); return; }
  const t0 = performance.now();
  const f = now => { const p = Math.min(1, (now - t0) / ms); const e = 1 - Math.pow(1 - p, 3); step(e); if (p < 1) requestAnimationFrame(f); else if (done) done(); };
  requestAnimationFrame(f);
}
function mat(x, y){ return 'matrix(1 0 0 1 ' + x + ' ' + y + ')'; }

// One bond drawn large: two atoms, the bond, the cloud, the labels. Returns handles.
function drawBond(api, opts){
  const { svg } = api, C = api.colors;
  const W = opts.width || 800, H = opts.height || 290, cy = opts.cy || 130;
  const ax = W / 2 - 150, bx = W / 2 + 150, R = 36;
  const id = 'bully' + (++uid);
  const root = svg('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': opts.aria || 'A bond with its electron cloud' });
  const defs = svg('defs', {},
    svg('filter', { id: id + 'blur', x: '-50%', y: '-50%', width: '200%', height: '200%' }, svg('feGaussianBlur', { stdDeviation: '14' })),
    svg('marker', { id: id + 'head', viewBox: '0 0 10 10', refX: '8', refY: '5', markerWidth: '7', markerHeight: '7', orient: 'auto' }, svg('path', { d: 'M0 0 L10 5 L0 10 z', fill: C.goldhi })));
  root.append(defs);
  // cloud (under everything)
  const cloud = svg('ellipse', { cx: W / 2, cy, rx: 150, ry: 62, fill: C.blue, opacity: '0.42', filter: 'url(#' + id + 'blur)' });
  root.append(cloud);
  // bond lines
  const bond = svg('g', { stroke: C.ink2, 'stroke-width': '5', 'stroke-linecap': 'round' });
  const x1 = ax + R + 6, x2 = bx - R - 6;
  if (opts.order === 2){ bond.append(svg('line', { x1, y1: cy - 8, x2, y2: cy - 8 }), svg('line', { x1, y1: cy + 8, x2, y2: cy + 8 })); }
  else bond.append(svg('line', { x1, y1: cy, x2, y2: cy }));
  root.append(bond);
  // atoms
  const atom = (x, sym) => {
    const g = svg('g', {});
    g.append(svg('circle', { cx: x, cy, r: R, fill: C.panel, stroke: C.grey, 'stroke-width': '2' }));
    g.append(svg('text', { x, y: cy + 12, 'text-anchor': 'middle', 'font-family': 'Georgia, serif', 'font-size': '34', fill: C.ink, text: sym }));
    g.append(svg('text', { x, y: cy + R + 26, 'text-anchor': 'middle', 'font-family': 'ui-monospace, Menlo, monospace', 'font-size': '14', fill: C.ink3, text: EN[sym].toFixed(1) }));
    return g;
  };
  const gA = atom(ax, opts.a), gB = atom(bx, opts.b);
  root.append(gA, gB);
  // delta labels (hidden until pull)
  const dA = svg('text', { x: ax, y: cy - R - 18, 'text-anchor': 'middle', 'font-family': 'Georgia, serif', 'font-size': '30', opacity: '0', text: '' });
  const dB = svg('text', { x: bx, y: cy - R - 18, 'text-anchor': 'middle', 'font-family': 'Georgia, serif', 'font-size': '30', opacity: '0', text: '' });
  root.append(dA, dB);
  // dipole arrow (hidden until pull): crossed tail at the poor end, head at the rich end
  const dip = svg('g', { opacity: '0', stroke: C.goldhi, 'stroke-width': '3', 'stroke-linecap': 'round', fill: 'none' });
  const dipLine = svg('line', { x1: ax, y1: cy + R + 46, x2: bx, y2: cy + R + 46, 'marker-end': 'url(#' + id + 'head)' });
  const dipCross = svg('line', { x1: ax + 12, y1: cy + R + 36, x2: ax + 12, y2: cy + R + 56 });
  dip.append(dipLine, dipCross);
  root.append(dip);
  const dipLabel = svg('text', { x: W / 2, y: cy + R + 74, 'text-anchor': 'middle', 'font-family': 'ui-monospace, Menlo, monospace', 'font-size': '12', fill: C.ink3, opacity: '0', text: 'dipole: tail on the poor end, head on the rich end' });
  root.append(dipLabel);
  return { root, cloud, gA, gB, dA, dB, dip, dipLine, dipCross, dipLabel, ax, bx, cy, R, W };
}

export function mount(slots, api){
  const { el, svg } = api, C = api.colors;
  // the dev harness has no icon; this stops the browser asking the server for one

  // ---------- VISUAL ----------
  let cur = SHOW[0], pulled = false, handles = null;
  const stage = el('div', {});
  const caption = el('p', { style: { margin: '10px 0 0', color: C.ink2, fontSize: '15px', minHeight: '2.6em' }, text: '' });
  const ladderWrap = el('div', { style: { marginTop: '16px' } });

  function drawLadder(a, b){
    ladderWrap.replaceChildren();
    const W = 800, H = 70, n = LADDER.length, bw = 78, x0 = (W - n * bw) / 2;
    const s = svg('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': 'Electronegativity ladder, weak pullers on the left, strong pullers on the right' });
    s.append(svg('text', { x: x0, y: 14, 'font-family': 'ui-monospace, Menlo, monospace', 'font-size': '11', fill: C.ink3, text: 'PULL CLIMBS TO THE RIGHT' }));
    LADDER.forEach((sym, i) => {
      const inPlay = sym === a || sym === b;
      const x = x0 + i * bw;
      s.append(svg('rect', { x: x + 3, y: 22, width: bw - 6, height: 40, rx: 8, fill: inPlay ? 'rgba(201,168,76,.16)' : C.panel, stroke: inPlay ? C.gold : C.line, 'stroke-width': inPlay ? '2' : '1' }));
      s.append(svg('text', { x: x + bw / 2 - 12, y: 48, 'text-anchor': 'middle', 'font-family': 'Georgia, serif', 'font-size': '19', fill: inPlay ? C.goldhi : C.ink2, text: sym }));
      s.append(svg('text', { x: x + bw / 2 + 16, y: 48, 'text-anchor': 'middle', 'font-family': 'ui-monospace, Menlo, monospace', 'font-size': '12', fill: inPlay ? C.ink : C.ink3, text: EN[sym].toFixed(1) }));
    });
    ladderWrap.append(s);
  }

  function render(){
    stage.replaceChildren();
    handles = drawBond(api, { a: cur.a, b: cur.b, order: cur.order, aria: 'The ' + cur.id + ' bond' });
    stage.append(handles.root);
    drawLadder(cur.a, cur.b);
    pulled = false;
    caption.textContent = 'Press "Let it pull" and watch where the shared pair goes.';
    pullBtn.disabled = false;
  }

  function pull(){
    if (pulled) return;
    pulled = true; pullBtn.disabled = true;
    const read = readBond(cur.a, cur.b);
    const h = handles;
    if (!read.pull){
      caption.textContent = read.note;
      tween(api, 500, p => { h.cloud.setAttribute('rx', String(150 + 10 * Math.sin(p * Math.PI))); });
      return;
    }
    const richIsA = read.rich === cur.a;
    const targetX = richIsA ? h.ax + 34 : h.bx - 34;
    const startX = h.W / 2;
    const richCircle = (richIsA ? h.gA : h.gB).querySelector('circle');
    const poorCircle = (richIsA ? h.gB : h.gA).querySelector('circle');
    const richD = richIsA ? h.dA : h.dB, poorD = richIsA ? h.dB : h.dA;
    richD.textContent = 'δ-'; richD.setAttribute('fill', C.blue);
    poorD.textContent = 'δ+'; poorD.setAttribute('fill', C.coral);
    // dipole: tail on the poor end, head on the rich end
    const poorX = richIsA ? h.bx : h.ax, richX = richIsA ? h.ax : h.bx;
    h.dipLine.setAttribute('x1', String(poorX)); h.dipLine.setAttribute('x2', String(richX));
    h.dipCross.setAttribute('x1', String(poorX + (richIsA ? -12 : 12))); h.dipCross.setAttribute('x2', String(poorX + (richIsA ? -12 : 12)));
    tween(api, 900, p => {
      h.cloud.setAttribute('cx', String(startX + (targetX - startX) * p));
      h.cloud.setAttribute('rx', String(150 - 40 * p));
      h.cloud.setAttribute('ry', String(62 + 10 * p));
      h.cloud.setAttribute('opacity', String(0.42 + 0.2 * p));
      const tail = Math.max(0, (p - 0.5) * 2);
      richD.setAttribute('opacity', String(tail)); poorD.setAttribute('opacity', String(tail));
      richCircle.setAttribute('stroke', C.blue); poorCircle.setAttribute('stroke', C.coral);
      richCircle.setAttribute('stroke-width', String(2 + 2 * tail)); poorCircle.setAttribute('stroke-width', String(2 + 2 * tail));
      h.dip.setAttribute('opacity', String(tail)); h.dipLabel.setAttribute('opacity', String(tail));
    }, () => { caption.textContent = read.note; });
  }

  const chips = el('div', { class: 'controls', role: 'group', 'aria-label': 'Choose a bond' });
  const chipEls = SHOW.map(b => el('button', { class: 'chip', type: 'button', 'aria-pressed': b === cur ? 'true' : 'false', text: b.id, onClick: () => { cur = b; chipEls.forEach(c => c.setAttribute('aria-pressed', c.textContent === b.id ? 'true' : 'false')); render(); } }));
  chips.append(...chipEls);
  const pullBtn = el('button', { class: 'primary', type: 'button', text: 'Let it pull', onClick: pull });
  const resetBtn = el('button', { class: 'secondary', type: 'button', text: 'Reset', onClick: render });
  const actions = el('div', { class: 'controls' }, pullBtn, resetBtn);
  slots.visual.append(stage, actions, caption, chips, ladderWrap);
  render();

  // ---------- YOU TRY ----------
  let item = null, firstTry = true, done = false;
  const tryBox = el('div', { class: 'item' });
  slots.try.append(tryBox);

  function bondIcon(a, b, order){
    const s = svg('svg', { viewBox: '0 0 120 44', width: '150', height: '55', 'aria-hidden': 'true', style: { display: 'block' } });
    s.append(svg('text', { x: 22, y: 30, 'text-anchor': 'middle', 'font-family': 'Georgia, serif', 'font-size': '24', fill: C.ink, text: a }));
    s.append(svg('text', { x: 98, y: 30, 'text-anchor': 'middle', 'font-family': 'Georgia, serif', 'font-size': '24', fill: C.ink, text: b }));
    if (order === 2){ s.append(svg('line', { x1: 44, y1: 18, x2: 76, y2: 18, stroke: C.ink2, 'stroke-width': '3' }), svg('line', { x1: 44, y1: 28, x2: 76, y2: 28, stroke: C.ink2, 'stroke-width': '3' })); }
    else s.append(svg('line', { x1: 44, y1: 23, x2: 76, y2: 23, stroke: C.ink2, 'stroke-width': '3' }));
    return s;
  }

  function verdictGood(){
    tryBox.append(el('div', { class: 'verdict good', text: 'You can read it.' }));
    tryBox.append(el('div', { class: 'controls' }, el('button', { class: 'primary', type: 'button', text: 'Another one', onClick: next })));
  }
  function verdictNotYet(text){
    let v = tryBox.querySelector('.verdict');
    if (!v){ v = el('div', { class: 'verdict notyet', text: 'Not yet.' }); tryBox.append(v); }
    api.coach(text);
  }
  function commit(ok, coachText){
    if (done) return;
    if (ok){ done = true; api.report(firstTry); api.clearCoach(); verdictGood(); }
    else { if (firstTry) api.report(false); firstTry = false; verdictNotYet(coachText); }
  }

  function renderAtomItem(it){
    tryBox.append(el('p', { class: 'prompt', text: 'Which atom is partially positive? Tap it.' }));
    const h = drawBond(api, { a: it.left, b: it.right, order: it.order, width: 700, height: 215, cy: 115, aria: 'The ' + bondName(it.left, it.right, it.order) + ' bond. Two atoms you can tap.' });
    h.cloud.setAttribute('opacity', '0.18');
    h.dipLabel.textContent = 'tap an atom';
    h.dipLabel.setAttribute('opacity', '1'); h.dipLabel.setAttribute('y', String(h.cy + h.R + 44));
    const wrap = el('div', { style: { maxWidth: '560px', margin: '0 auto' } });
    const targets = [h.gA, h.gB];
    targets.forEach((g, i) => {
      const sym = i === 0 ? it.left : it.right;
      g.setAttribute('role', 'button'); g.setAttribute('tabindex', '0'); g.setAttribute('aria-label', sym + ' atom');
      g.style.cursor = 'pointer';
      const hit = svg('circle', { cx: i === 0 ? h.ax : h.bx, cy: h.cy, r: 56, fill: 'transparent' });
      const ring = svg('circle', { cx: i === 0 ? h.ax : h.bx, cy: h.cy, r: h.R + 8, fill: 'none', stroke: C.gold, 'stroke-width': '1.5', 'stroke-dasharray': '4 5', opacity: '0.7' });
      g.prepend(hit, ring);
      const choose = () => {
        if (done) return;
        const ok = i === it.answer;
        const circ = g.querySelector('circle:nth-of-type(2)');
        if (ok){
          circ.setAttribute('stroke', C.coral); circ.setAttribute('stroke-width', '4');
          (i === 0 ? h.dA : h.dB).textContent = 'δ+'; (i === 0 ? h.dA : h.dB).setAttribute('fill', C.coral); (i === 0 ? h.dA : h.dB).setAttribute('opacity', '1');
          const o = 1 - i; const od = o === 0 ? h.dA : h.dB; od.textContent = 'δ-'; od.setAttribute('fill', C.blue); od.setAttribute('opacity', '1');
          targets[o].querySelector('circle:nth-of-type(2)').setAttribute('stroke', C.blue);
          targets.forEach(t => { t.setAttribute('tabindex', '-1'); t.style.cursor = 'default'; t.querySelector('circle:nth-of-type(1) + circle').setAttribute('opacity', '0'); });
          h.dipLabel.setAttribute('opacity', '0');
          commit(true);
        } else {
          circ.setAttribute('stroke', C.goldhi);
          const poor = it.answer === 0 ? it.left : it.right, rich = poor === it.left ? it.right : it.left;
          const flip = (rich === 'C' && (poor === 'Mg' || poor === 'Li'));
          commit(false, flip
            ? 'The flip: ' + poor + ' (' + EN[poor].toFixed(1) + ') pulls weaker than carbon (2.6), so the carbon is the rich one and ' + poor + ' comes up short.'
            : 'Find the bully, then look at its neighbor. ' + rich + ' (' + EN[rich].toFixed(1) + ') beats ' + poor + ' (' + EN[poor].toFixed(1) + '), so ' + poor + ' is the one left short.');
        }
      };
      g.addEventListener('click', choose);
      g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); choose(); } });
    });
    wrap.append(h.root);
    tryBox.append(wrap);
  }

  function renderBondItem(it){
    tryBox.append(el('p', { class: 'prompt', text: 'Which bond is more polar?' }));
    const opts = el('div', { class: 'opts' });
    const btns = it.bonds.map((b, i) => {
      const btn = el('button', { class: 'opt', type: 'button', 'aria-label': bondName(b[0], b[1], 1) }, el('span', { class: 'k', text: 'AB'[i] }), el('span', { style: { display: 'flex', alignItems: 'center' } }, bondIcon(b[0], b[1], 1)));
      btn.addEventListener('click', () => {
        if (done) return;
        btns.forEach(x => x.classList.remove('picked'));
        btn.classList.add('picked');
        const ok = i === it.answer;
        if (ok){ btn.classList.add('ok'); btns.forEach(x => { x.disabled = true; }); commit(true); }
        else {
          const w = it.bonds[it.answer], l = it.bonds[1 - it.answer];
          commit(false, 'Bigger gap, bigger pull. ' + bondName(w[0], w[1], 1) + ' is a ' + it.gaps[it.answer].toFixed(1) + ' gap; ' + bondName(l[0], l[1], 1) + ' is only ' + it.gaps[1 - it.answer].toFixed(1) + '.');
        }
      });
      return btn;
    });
    opts.append(...btns);
    tryBox.append(opts);
  }

  function next(){
    tryBox.replaceChildren();
    api.clearCoach();
    item = gen(api.rng); firstTry = true; done = false;
    if (item.type === 'atom') renderAtomItem(item); else renderBondItem(item);
  }
  next();
}
