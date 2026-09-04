// The Roots of Organic, level 3, root 6: Z is the zame side.
//
// E and Z from a small CIP table where every pairwise order is decided by the
// first atom's atomic number or an unambiguous second sphere (CH2OH beats
// CH2CH3 beats CH3). The verdict is computed from the same data that draws the
// alkene, so it cannot be wrong.

export const meta = {
  id: 'l3-ez',
  level: 3,
  order: 6,
  needs3D: false,
  title: 'Z is the zame side',
  concept: 'E and Z',
  tagline: 'Do the numbers on each end. Winners on the same side means Z.',
  story: 'Draw a line down the middle of the double bond. Now look at one carbon at a time. On each carbon, rank its two groups by atomic number, first point of difference wins, exactly like R and S. That gives you a winner on the left carbon and a winner on the right carbon. If the two winners are on the same side of the double bond, top and top or bottom and bottom, it is Z, the zame side. Opposite sides, it is E. Cis and trans only work when each carbon has one H; E and Z always work, so make E and Z the habit. And watch the size trap: the biggest group is not always the winner. Chlorine beats an ethyl even though the ethyl is bigger. Rule of thumb: do the numbers on each end, winners on the same side means Z.',
  moveName: 'Do the numbers on each end, then compare sides',
  move: [
    'Draw a line down the middle of the double bond and treat each carbon on its own.',
    'On each carbon, rank the two groups: higher atomic number on the first atom wins; a tie goes to whoever holds the heavier set.',
    'Winners on the same side of the double bond: Z, the zame side. Opposite sides: E.',
    'Two identical groups on one carbon? There is no E or Z at all.'
  ],
  trap: 'Careful: The biggest group is not always the highest priority; Cl beats an ethyl even though the ethyl is bigger, because priority is atomic number, not size.',
  holdsUp: ['Alkene nomenclature', 'Product stereochemistry of additions', 'Naming E2 products', 'Reading cis and trans honestly'],
  drill: 'Booster OChem: Conformations and Stereochemistry'
};

/* ------------------------------------------------------------------ */
/* The CIP table for alkene ends                                        */
/* ------------------------------------------------------------------ */
const GROUPS = [
  { key: 'Br',    label: 'Br',     rank: 1, atom: 'bromine',  z: 35, size: 1 },
  { key: 'Cl',    label: 'Cl',     rank: 2, atom: 'chlorine', z: 17, size: 1 },
  { key: 'F',     label: 'F',      rank: 3, atom: 'fluorine', z: 9,  size: 1 },
  { key: 'OH',    label: 'OH',     rank: 4, atom: 'oxygen',   z: 8,  size: 2 },
  { key: 'CH2OH', label: 'CH2OH',  rank: 5, atom: 'carbon',   z: 6,  size: 5, holds: 'an oxygen' },
  { key: 'Et',    label: 'CH2CH3', rank: 6, atom: 'carbon',   z: 6,  size: 8, holds: 'a carbon and two hydrogens' },
  { key: 'Me',    label: 'CH3',    rank: 7, atom: 'carbon',   z: 6,  size: 4, holds: 'only hydrogens' },
  { key: 'H',     label: 'H',      rank: 8, atom: 'hydrogen', z: 1,  size: 1 }
];
const byKey = k => GROUPS.find(g => g.key === k);
// Plain-words reason the winner outranks THIS loser: first atom by atomic
// number, or, when both start with carbon, what each carbon is holding.
function whyBeats(w, l){
  if (w.atom !== l.atom){
    let s = w.atom + ' (atomic number ' + w.z + ') outranks ' + l.atom + ' (' + l.z + ')';
    if (l.size > w.size) s += '; the loser is the bigger group, but priority is atomic number, not size';
    return s;
  }
  return 'both start with carbon, so look at what each carbon holds: ' + w.label + ' holds ' + w.holds + ', ' + l.label + ' holds ' + l.holds;
}
function mulberry32(a){ return function(){ a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

// An alkene: left carbon holds [upper, lower], right carbon holds [upper, lower].
// Returns { verdict: 'E' | 'Z' | 'none', winL: 0|1|null, winR: 0|1|null, tieSide: 'left'|'right'|null }
function classify(alk){
  const L = alk.left.map(byKey), R = alk.right.map(byKey);
  if (L[0].rank === L[1].rank) return { verdict: 'none', winL: null, winR: null, tieSide: 'left' };
  if (R[0].rank === R[1].rank) return { verdict: 'none', winL: null, winR: null, tieSide: 'right' };
  const winL = L[0].rank < L[1].rank ? 0 : 1, winR = R[0].rank < R[1].rank ? 0 : 1;
  return { verdict: winL === winR ? 'Z' : 'E', winL, winR, tieSide: null };
}
function swapPair(alk, side){ const a = { left: alk.left.slice(), right: alk.right.slice() }; a[side].reverse(); return a; }
function makeAlkene(rng, allowTie){
  const ri = n => Math.floor(rng() * n);
  const tie = allowTie && ri(5) === 0;
  const pickTwo = () => { const a = GROUPS[ri(GROUPS.length)]; let b = GROUPS[ri(GROUPS.length)]; while (b === a) b = GROUPS[ri(GROUPS.length)]; return [a.key, b.key]; };
  const left = pickTwo(), right = pickTwo();
  if (tie){ const side = ri(2) ? left : right; side[1] = side[0]; }
  return { left, right };
}
function makeItem(rng){ const alk = makeAlkene(rng, true); const c = classify(alk); return { alk, answer: c.verdict, c }; }

/* ------------------------------------------------------------------ */
/* Coaching                                                             */
/* ------------------------------------------------------------------ */
function endLine(alk, side, c){
  const pair = alk[side].map(byKey), w = side === 'left' ? c.winL : c.winR, win = pair[w], lose = pair[1 - w];
  return win.label + ' beats ' + lose.label + ' (' + whyBeats(win, lose) + ')';
}
function whyMiss(it, choice){
  const { alk, c } = it;
  if (it.answer === 'none') return 'Look at the ' + c.tieSide + ' carbon: both groups are ' + byKey(alk[c.tieSide][0]).label + '. Swap them and nothing changes, so there is no E or Z here.';
  if (choice === 'none') return 'Each carbon here holds two different groups, so E or Z applies. Rank each end separately, then compare sides.';
  const sides = it.answer === 'Z' ? 'the same side' : 'opposite sides';
  return 'Rank each end separately. Left: ' + endLine(alk, 'left', c) + '. Right: ' + endLine(alk, 'right', c) + '. The winners are on ' + sides + ': ' + it.answer + '.';
}

/* ------------------------------------------------------------------ */
/* Labels                                                               */
/* ------------------------------------------------------------------ */
function runs(label){ return String(label).split(/(\d+)/).filter(Boolean).map(r => ({ t: r, sub: /^\d+$/.test(r) })); }
function svgLabel(api, label, x, y, anchor, size, fill, attrs){
  const t = api.svg('text', Object.assign({ x, y, 'text-anchor': anchor, 'font-family': 'Georgia, serif', 'font-weight': 600, 'font-size': size, fill }, attrs || {}));
  let up = 0;
  for (const r of runs(label)){ if (r.sub){ t.append(api.svg('tspan', { dy: size * 0.28, 'font-size': size * 0.66 }, r.t)); up = -size * 0.28; } else { t.append(api.svg('tspan', up ? { dy: up } : {}, r.t)); up = 0; } }
  return t;
}
function htmlLabel(api, label){ const s = api.el('span', {}); for (const r of runs(label)) s.append(r.sub ? api.el('sub', { text: r.t }) : r.t); return s; }

/* ------------------------------------------------------------------ */
/* The alkene drawing                                                   */
/* ------------------------------------------------------------------ */
// Geometry: C1 at (270,180), C2 at (450,180); groups at 120 degrees.
const C1 = [270, 180], C2 = [450, 180], ARM = 96;
const DIRS = { left: [[-0.5, -0.866], [-0.5, 0.866]], right: [[0.5, -0.866], [0.5, 0.866]] };
function groupPos(side, i){ const C = side === 'left' ? C1 : C2, d = DIRS[side][i]; return { x: C[0] + d[0] * ARM, y: C[1] + d[1] * ARM, d }; }
// opts: { numbered, onTap(side, i), lit }
function drawAlkene(api, alk, opts){
  opts = opts || {};
  const ink = api.colors.ink, ink2 = api.colors.ink2, gold = api.colors.gold, goldhi = api.colors.goldhi, ink3 = api.colors.ink3;
  const c = classify(alk);
  const s = api.svg('svg', { viewBox: '0 0 720 360', role: 'img', 'aria-label': 'A carbon-carbon double bond with two groups on each carbon' });
  // the middle line
  if (opts.numbered){
    s.append(api.svg('line', { x1: 360, y1: 40, x2: 360, y2: 320, stroke: gold, 'stroke-width': 1.5, 'stroke-dasharray': '6 6', opacity: 0.9 }));
    s.append(api.svg('text', { x: 360, y: 28, 'text-anchor': 'middle', 'font-family': 'ui-monospace, Menlo, monospace', 'font-size': 11, 'letter-spacing': 2, fill: gold }, 'THE LINE'));
  }
  // the double bond
  s.append(api.svg('line', { x1: C1[0], y1: C1[1] - 5, x2: C2[0], y2: C2[1] - 5, stroke: ink, 'stroke-width': 3, 'stroke-linecap': 'round' }));
  s.append(api.svg('line', { x1: C1[0], y1: C1[1] + 5, x2: C2[0], y2: C2[1] + 5, stroke: ink, 'stroke-width': 3, 'stroke-linecap': 'round' }));
  for (const side of ['left', 'right']){
    const C = side === 'left' ? C1 : C2;
    for (let i = 0; i < 2; i++){
      const p = groupPos(side, i), grp = byKey(alk[side][i]);
      const isWin = opts.numbered && c.verdict !== 'none' && (side === 'left' ? c.winL : c.winR) === i;
      const isTie = opts.numbered && c.tieSide === side;
      s.append(api.svg('line', { x1: C[0], y1: C[1], x2: (C[0] + p.d[0] * (ARM - 26)).toFixed(1), y2: (C[1] + p.d[1] * (ARM - 26)).toFixed(1), stroke: ink2, 'stroke-width': 2.6, 'stroke-linecap': 'round' }));
      const anchor = side === 'left' ? 'end' : 'start';
      const g = api.svg('g', { class: 'l3z-grp' + (opts.onTap ? ' l3z-tap' : ''), role: opts.onTap ? 'button' : null, tabindex: opts.onTap ? 0 : null, 'aria-label': opts.onTap ? 'Swap ' + grp.label + ' with its partner on the ' + side + ' carbon' : null });
      // hit target, then a halo for the winner
      g.append(api.svg('rect', { x: (side === 'left' ? p.x - 84 : p.x - 4), y: p.y - 26, width: 88, height: 52, rx: 12, fill: 'rgba(255,255,255,0)', stroke: isTie ? api.colors.amber : (isWin ? goldhi : 'rgba(255,255,255,0)'), 'stroke-width': isWin || isTie ? 1.5 : 1 }));
      g.append(svgLabel(api, grp.label, side === 'left' ? p.x - 4 : p.x + 4, p.y + 7, anchor, 22, isWin ? goldhi : ink));
      if (isWin){
        const bx = side === 'left' ? p.x - 90 : p.x + 90;
        g.append(api.svg('circle', { cx: bx, cy: p.y, r: 12, fill: gold, stroke: '#3a2c08', 'stroke-width': 1 }));
        g.append(api.svg('text', { x: bx, y: p.y + 4.5, 'text-anchor': 'middle', 'font-family': 'ui-monospace, Menlo, monospace', 'font-weight': 700, 'font-size': 13, fill: '#1a160c' }, '1'));
      }
      if (opts.onTap){ const fire = () => opts.onTap(side, i); g.addEventListener('click', fire); g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); fire(); } }); }
      s.append(g);
    }
  }
  // the verdict
  if (opts.numbered){
    const big = c.verdict === 'none' ? 'no E or Z' : c.verdict;
    s.append(api.svg('text', { x: 360, y: 350, 'text-anchor': 'middle', 'font-family': 'Georgia, serif', 'font-size': c.verdict === 'none' ? 22 : 34, fill: goldhi, class: 'l3z-flash' }, big));
  } else if (opts.hint){
    s.append(api.svg('text', { x: 360, y: 350, 'text-anchor': 'middle', 'font-family': 'ui-monospace, Menlo, monospace', 'font-size': 11, 'letter-spacing': 2, fill: ink3 }, 'TAP A GROUP TO SWAP IT WITH ITS PARTNER'));
  }
  return s;
}

/* ------------------------------------------------------------------ */
/* Styles                                                               */
/* ------------------------------------------------------------------ */
const CSS = `
.l3z-wrap{background:radial-gradient(60% 80% at 50% 45%,rgba(201,168,76,.06),transparent 70%);border-radius:10px}
.l3z-wrap svg{width:100%;height:auto;max-height:420px}
.l3z-tap{cursor:pointer}
.l3z-tap:hover rect,.l3z-tap:focus-visible rect{stroke:var(--gold);fill:rgba(201,168,76,.08)}
.l3z-tap:focus-visible{outline:none}
.l3z-cap{color:var(--ink2);font-size:15px;margin:10px 0 0;min-height:1.5em}
.l3z-cap b{color:var(--goldhi);font-weight:600}
.l3z-fig{margin:0 0 6px;background:radial-gradient(60% 80% at 50% 45%,rgba(201,168,76,.05),transparent 70%)}
.l3z-fig svg{width:100%;height:auto;max-height:300px}
@keyframes l3zFlash{0%{opacity:0;transform:scale(1.6)}60%{opacity:1;transform:scale(1.1)}100%{opacity:1;transform:scale(1)}}
.l3z-flash{animation:l3zFlash .7s ease-out both;transform-box:fill-box;transform-origin:center}
`;

/* ------------------------------------------------------------------ */
/* mount                                                                */
/* ------------------------------------------------------------------ */
export function mount(slots, api){
  slots.visual.append(api.el('style', { text: CSS }));
  const wrap = api.el('div', { class: 'l3z-wrap' });
  const controls = api.el('div', { class: 'controls' });
  const caption = api.el('p', { class: 'l3z-cap' });
  slots.visual.append(wrap, controls, caption);
  const V = { alk: makeAlkene(api.rng, false), numbered: false };
  function setCaption(parts){ caption.replaceChildren(...parts.map(p => typeof p === 'string' ? p : (p.lab != null ? api.el('b', {}, htmlLabel(api, p.lab)) : api.el('b', { text: p.b })))); }
  function explain(){
    const c = classify(V.alk);
    if (c.verdict === 'none'){ const same = byKey(V.alk[c.tieSide][0]).label; setCaption(['The ', { b: c.tieSide }, ' carbon holds two ', { lab: same }, ' groups. Swap them and nothing changes, so there is ', { b: 'no E or Z' }, ' for this alkene. Tap a group to change it.']); return; }
    const L = V.alk.left.map(byKey), R = V.alk.right.map(byKey);
    const wl = L[c.winL], ll = L[1 - c.winL], wr = R[c.winR], lr = R[1 - c.winR];
    setCaption(['Left carbon: ', { lab: wl.label }, ' beats ', { lab: ll.label }, ', ', whyBeats(wl, ll), '. Right carbon: ', { lab: wr.label }, ' beats ', { lab: lr.label }, ', ', whyBeats(wr, lr), '. The winners are on ', { b: c.verdict === 'Z' ? 'the same side' : 'opposite sides' }, ': ', { b: c.verdict }, c.verdict === 'Z' ? ', the zame side.' : '.']);
  }
  function draw(){
    wrap.replaceChildren(drawAlkene(api, V.alk, { numbered: V.numbered, hint: true, onTap: (side, i) => { V.alk = swapPair(V.alk, side); draw(); if (V.numbered) explain(); else tapCaption(side); } }));
    void 0;
  }
  function tapCaption(side){ setCaption(['Swapped the two groups on the ', { b: side }, ' carbon. Press Do the numbers to see the verdict recompute.']); }
  const chipNum = api.el('button', { type: 'button', class: 'chip', 'aria-pressed': 'false', onclick: () => { V.numbered = true; chipNum.setAttribute('aria-pressed', 'true'); draw(); explain(); } }, 'Do the numbers');
  const chipL = api.el('button', { type: 'button', class: 'chip', onclick: () => { V.alk = swapPair(V.alk, 'left'); draw(); if (V.numbered) explain(); else tapCaption('left'); } }, 'Swap the left pair');
  const chipR = api.el('button', { type: 'button', class: 'chip', onclick: () => { V.alk = swapPair(V.alk, 'right'); draw(); if (V.numbered) explain(); else tapCaption('right'); } }, 'Swap the right pair');
  const chipNew = api.el('button', { type: 'button', class: 'chip', onclick: () => { V.alk = makeAlkene(api.rng, false); V.numbered = false; chipNum.setAttribute('aria-pressed', 'false'); draw(); intro(); } }, 'New alkene');
  controls.append(chipNum, chipL, chipR, chipNew);
  function intro(){ setCaption(['Two groups on each carbon. Tap any group to swap it with its partner across the same carbon, then press Do the numbers: the winners get badged and the line goes down the middle.']); }
  draw(); intro();

  /* ---------------- you try ---------------- */
  const host = slots.try;
  let cur = null;
  function next(){ cur = { it: makeItem(api.rng), done: false, misses: 0 }; render(); }
  function render(){
    api.clearCoach(); host.replaceChildren();
    const it = cur.it, box = api.el('div', { class: 'item' });
    box.append(api.el('p', { class: 'prompt', text: 'E or Z?' }));
    box.append(api.el('div', { class: 'l3z-fig' }, drawAlkene(api, it.alk, {})));
    const opts = [{ key: 'E', node: 'E, winners on opposite sides', ok: it.answer === 'E' }, { key: 'Z', node: 'Z, winners on the same side', ok: it.answer === 'Z' }, { key: 'none', node: 'No E or Z, the two groups on one carbon are the same', ok: it.answer === 'none' }];
    const grid = api.el('div', { class: 'opts' }), verdict = api.el('div', { class: 'verdict' }), after = api.el('div', { class: 'controls' });
    opts.forEach((o, i) => { const b = api.el('button', { type: 'button', class: 'opt', onclick: () => choose(b, o) }, api.el('span', { class: 'k', text: 'ABC'[i] }), api.el('span', { text: o.node })); grid.append(b); });
    function choose(btn, o){
      if (cur.done) return; btn.classList.add('picked');
      if (o.ok){
        cur.done = true; btn.classList.add('ok'); for (const b of grid.querySelectorAll('button')) b.disabled = true;
        verdict.className = 'verdict good'; verdict.textContent = 'You can read it.';
        if (cur.misses === 0) api.report(true); api.clearCoach();
        after.append(api.el('button', { type: 'button', class: 'primary', onclick: next }, 'Another one'),
          api.el('button', { type: 'button', class: 'secondary', onclick: () => { V.alk = { left: it.alk.left.slice(), right: it.alk.right.slice() }; V.numbered = true; chipNum.setAttribute('aria-pressed', 'true'); draw(); explain(); slots.visual.scrollIntoView({ block: 'nearest', behavior: api.reduced ? 'auto' : 'smooth' }); } }, 'Show the numbers above'));
      } else {
        cur.misses++; if (cur.misses === 1) api.report(false);
        btn.disabled = true; verdict.className = 'verdict notyet'; verdict.textContent = 'Not yet.'; api.coach(whyMiss(it, o.key));
      }
    }
    box.append(grid, verdict, after); host.append(box);
  }
  next();
}

/* ------------------------------------------------------------------ */
/* selfTest: node-safe                                                  */
/* ------------------------------------------------------------------ */
export function selfTest(){
  const notes = []; const fail = m => notes.push(m);
  // the table is a strict total order with the textbook wins in it
  const r = k => byKey(k).rank;
  if (new Set(GROUPS.map(g => g.rank)).size !== GROUPS.length) fail('ranks must be distinct');
  if (!(r('Cl') < r('Et'))) fail('Cl must beat ethyl');
  if (!(r('Et') < r('Me'))) fail('CH2CH3 must beat CH3');
  if (!(r('CH2OH') < r('Et'))) fail('CH2OH must beat CH2CH3');
  if (!(r('OH') < r('CH2OH'))) fail('OH must beat CH2OH');
  if (!(r('F') < r('OH'))) fail('F must beat OH');
  if (!(r('Br') < r('Cl'))) fail('Br must beat Cl');
  if (!(r('Me') < r('H'))) fail('CH3 must beat H');
  // the atom's worked item: 2-chloro-2-butene with Cl and the far methyl on the same side is Z
  if (classify({ left: ['Cl', 'Me'], right: ['Me', 'H'] }).verdict !== 'Z') fail('2-chloro-2-butene drawn same side must be Z');
  if (classify({ left: ['Cl', 'Me'], right: ['H', 'Me'] }).verdict !== 'E') fail('2-chloro-2-butene drawn opposite must be E');
  // the trap: Cl above, ethyl below on one carbon; Cl still wins
  const trap = classify({ left: ['Et', 'Cl'], right: ['Me', 'H'] }); if (trap.winL !== 1) fail('Cl must outrank ethyl regardless of size');
  // whole domain: every ordered pair of pairs
  let tried = 0, counts = { E: 0, Z: 0, none: 0 };
  const keys = GROUPS.map(g => g.key);
  for (const a of keys) for (const b of keys) for (const c of keys) for (const d of keys){
    const alk = { left: [a, b], right: [c, d] }, v = classify(alk); tried++; counts[v.verdict]++;
    const tie = a === b || c === d;
    if (tie !== (v.verdict === 'none')) fail('tie handling ' + [a, b, c, d]);
    if (tie) continue;
    if (classify(swapPair(alk, 'left')).verdict === v.verdict) fail('swapping one pair must flip ' + [a, b, c, d]);
    if (classify(swapPair(alk, 'right')).verdict === v.verdict) fail('swapping one pair must flip ' + [a, b, c, d]);
    if (classify(swapPair(swapPair(alk, 'left'), 'right')).verdict !== v.verdict) fail('swapping both pairs must keep ' + [a, b, c, d]);
    if (classify({ left: alk.right, right: alk.left }).verdict !== v.verdict) fail('reading from the other end must keep ' + [a, b, c, d]);
  }
  // generated items: unique answer, reproducible, all three answers occur
  const seen = { E: 0, Z: 0, none: 0 };
  for (let seed = 1; seed <= 240; seed++){
    const it = makeItem(mulberry32(seed)); tried++; seen[it.answer]++;
    if (['E', 'Z', 'none'].filter(k => k === it.answer).length !== 1) fail('seed ' + seed + ': answer');
    if (it.answer !== classify(it.alk).verdict) fail('seed ' + seed + ': answer must come from the drawing');
    if (JSON.stringify(makeItem(mulberry32(seed))) !== JSON.stringify(it)) fail('seed ' + seed + ': not reproducible');
  }
  if (!seen.E || !seen.Z || !seen.none) fail('all three answers must occur: ' + JSON.stringify(seen));
  return { ok: notes.length === 0, tried, notes: notes.join('; ') || ('domain E ' + counts.E + ', Z ' + counts.Z + ', none ' + counts.none + '; generated E ' + seen.E + ', Z ' + seen.Z + ', none ' + seen.none) };
}
