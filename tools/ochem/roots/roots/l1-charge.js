// The Roots of Organic · Level 1 · Root 2: The electron ledger (formal charge and lone pairs)
// ES module, no imports.

export const meta = {
  id: 'l1-charge',
  level: 1,
  order: 2,
  needs3D: false,
  title: 'The electron ledger',
  concept: 'Formal charge and lone pairs',
  tagline: 'Count what the atom brought, count what it is holding, the difference is the charge.',
  story: 'Formal charge is bookkeeping, nothing more. Every atom shows up with a fixed number of valence electrons: oxygen brings six, nitrogen five, carbon four. Then you look at what it is actually holding in the drawing. A lone pair is two electrons that belong to the atom outright, so count two for each. A bond is shared, so the atom only gets to count one electron per bond. Add those up, subtract from what it brought, and that difference is the formal charge. Oxygen with two bonds and two lone pairs is holding six, brought six, neutral. Give it a third bond and it is holding only five, so it is plus one. Rule of thumb: count what the atom brought, count what it is holding, the difference is the charge.',
  moveName: 'Brought minus holding',
  move: [
    'Write what the atom brought: oxygen 6, nitrogen 5, carbon 4.',
    'Count what it is holding: two for every lone pair, one for every bond.',
    'Brought minus holding is the formal charge.',
    'Sanity check the octet: lone pairs plus bonds should add to four, unless you are looking at a carbocation.'
  ],
  trap: 'Careful: a lone pair counts as two electrons toward the atom, but a bond counts as only one, because the atom is sharing it.',
  holdsUp: ['Resonance', 'Acidity', 'Nucleophile versus electrophile', 'Carbocations'],
  drill: 'Booster OChem: The Fundamentals'
};

// ---------------------------------------------------------------- chemistry
const SERIF = 'Georgia, "Times New Roman", serif';
const MONO = 'ui-monospace, "SF Mono", Menlo, monospace';
const ATOMS = {
  O: { name: 'Oxygen', valence: 6, states: [[1, 3], [2, 2], [3, 1]] },
  N: { name: 'Nitrogen', valence: 5, states: [[2, 2], [3, 1], [4, 0]] },
  C: { name: 'Carbon', valence: 4, states: [[3, 0], [3, 1], [4, 0]] }
};
const NAMES = {
  'O1,3': 'an alkoxide (a deprotonated alcohol)', 'O2,2': 'a plain alcohol or ether oxygen', 'O3,1': 'an oxonium ion (a protonated alcohol or ether)',
  'N2,2': 'an amide anion (a deprotonated amine)', 'N3,1': 'a plain amine nitrogen', 'N4,0': 'an ammonium ion',
  'C3,0': 'a carbocation', 'C3,1': 'a carbanion', 'C4,0': 'a plain carbon'
};
function charge(sym, b, lp){ return ATOMS[sym].valence - (2 * lp + b); }
function allowed(sym, b, lp){ return ATOMS[sym].states.some(([x, y]) => x === b && y === lp); }
// One press of a control. Returns { b, lp, note } or null when the move is not available.
function step(sym, b, lp, what){
  const tryS = (nb, nl, note) => allowed(sym, nb, nl) ? { b: nb, lp: nl, note } : null;
  if (what === '+bond') return tryS(b + 1, lp, '') || tryS(b + 1, lp - 1, 'The octet was full, so a lone pair became the new bond.');
  if (what === '-bond') return tryS(b - 1, lp, '') || tryS(b - 1, lp + 1, 'The bond broke and both electrons stayed on the atom as a lone pair.');
  if (what === '+lp') return tryS(b, lp + 1, '') || tryS(b - 1, lp + 1, 'The octet was full, so a bond gave up its electrons to make the lone pair.');
  if (what === '-lp') return tryS(b, lp - 1, '') || tryS(b + 1, lp - 1, 'The lone pair became a bond.');
  return null;
}

// ---------------------------------------------------------------- rng (node-safe)
function makeRng(seed){
  let s = seed | 0;
  return function(){ s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}

function genItem(rng){
  const syms = Object.keys(ATOMS);
  const sym = syms[Math.floor(rng() * syms.length)];
  const [b, lp] = ATOMS[sym].states[Math.floor(rng() * ATOMS[sym].states.length)];
  const q = charge(sym, b, lp);
  const choices = [-1, 0, 1, 2].map(v => ({ text: v > 0 ? '+' + v : String(v), value: v, ok: v === q }));
  return { sym, b, lp, q, choices };
}

// ---------------------------------------------------------------- drawing
const DEG = Math.PI / 180;
function vec(deg){ return [Math.cos(deg * DEG), Math.sin(deg * DEG)]; }
// slots around the atom: bonds first, lone pairs fill the rest
function slotAngles(total){ return total === 3 ? [150, 30, 270] : total === 2 ? [180, 0] : total === 1 ? [180] : [180, 0, 270, 90]; }

// Draws the atom with its bonds and lone pairs into a <g> centered at (cx, cy). Returns handles for recoloring.
function drawAtom(api, g, cx, cy, sym, b, lp, opts){
  const C = api.colors, svg = api.svg;
  while (g.firstChild) g.removeChild(g.firstChild);
  const q = charge(sym, b, lp);
  // in the try the atom stays grey: the color would give the answer away
  const tone = (opts && opts.neutralTone) ? C.grey : q > 0 ? C.coral : q < 0 ? C.blue : C.grey;
  const angles = slotAngles(b + lp);
  const R = 30, bondLen = 92, rR = 17;
  const gB = svg('g', { stroke: C.ink, 'stroke-width': 2.6, 'stroke-linecap': 'round' });
  const gR = svg('g');
  const gLP = svg('g', { fill: C.blue });
  for (let i = 0; i < b; i++){
    const [ux, uy] = vec(angles[i]);
    gB.append(svg('line', { x1: (cx + ux * (R + 2)).toFixed(1), y1: (cy + uy * (R + 2)).toFixed(1), x2: (cx + ux * (bondLen - rR - 2)).toFixed(1), y2: (cy + uy * (bondLen - rR - 2)).toFixed(1) }));
    const rx = cx + ux * bondLen, ry = cy + uy * bondLen;
    gR.append(svg('circle', { cx: rx.toFixed(1), cy: ry.toFixed(1), r: rR, fill: C.panel, stroke: C.grey, 'stroke-width': 1.5 }));
    gR.append(svg('text', { x: rx.toFixed(1), y: (ry + 1).toFixed(1), fill: C.ink2, 'font-family': SERIF, 'font-size': 16, 'text-anchor': 'middle', 'dominant-baseline': 'central', text: 'R' }));
  }
  for (let i = 0; i < lp; i++){
    const a = angles[b + i]; const [ux, uy] = vec(a); const [px, py] = vec(a + 90);
    const d = R + 13;
    for (const s of [-1, 1]) gLP.append(svg('circle', { cx: (cx + ux * d + px * 6 * s).toFixed(1), cy: (cy + uy * d + py * 6 * s).toFixed(1), r: 3.6 }));
  }
  const atom = svg('circle', { cx, cy, r: R, fill: tone, 'fill-opacity': 0.22, stroke: tone, 'stroke-width': 2.5, style: { transition: api.reduced ? 'none' : 'fill .3s ease, stroke .3s ease' } });
  const letter = svg('text', { x: cx, y: cy + 1, fill: C.ink, 'font-family': SERIF, 'font-size': 32, 'text-anchor': 'middle', 'dominant-baseline': 'central', text: sym });
  g.append(gB, gR, gLP, atom, letter);
  if (q !== 0 && !(opts && opts.badge === false)){
    const bx = cx + R * 0.95, by = cy - R * 0.95;
    g.append(svg('circle', { cx: bx, cy: by, r: 11, fill: C.panel, stroke: tone, 'stroke-width': 2 }));
    g.append(svg('text', { x: bx, y: by + 1, fill: tone, 'font-family': MONO, 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', 'dominant-baseline': 'central', text: Math.abs(q) > 1 ? Math.abs(q) + (q > 0 ? '+' : '-') : (q > 0 ? '+' : '-') }));
  }
  if (opts && opts.star){
    g.append(svg('text', { x: cx - R * 1.05, y: cy - R * 0.95, fill: C.gold, 'font-family': SERIF, 'font-size': 30, 'text-anchor': 'middle', 'dominant-baseline': 'central', text: '*' }));
  }
  return { tone, q };
}

// ---------------------------------------------------------------- mount
export function mount(slots, api){
  const C = api.colors, el = api.el, svg = api.svg;

  // ---- VISUAL: the ledger instrument
  let sym = 'O', b = 2, lp = 2;
  const W = 520, H = 236;
  const root = svg('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': 'an atom with its bonds and lone pairs, and its electron ledger', style: { width: '100%', maxHeight: '320px', display: 'block' } });
  const gAtom = svg('g');
  root.append(gAtom);
  // ledger on the right, inside the SVG so it reads as one instrument
  const lx = 262, rx = W - 18, ly = 46;
  const gL = svg('g');
  root.append(gL);
  const row = (y, label) => {
    const t = svg('text', { x: lx, y, fill: C.ink2, 'font-family': SERIF, 'font-size': 15, text: label });
    const v = svg('text', { x: rx, y, fill: C.ink, 'font-family': MONO, 'font-size': 15, 'text-anchor': 'end', text: '' });
    gL.append(t, v); return v;
  };
  gL.append(svg('text', { x: lx, y: ly - 24, fill: C.ink3, 'font-family': MONO, 'font-size': 11, 'letter-spacing': 2, text: 'THE LEDGER' }));
  const vBrought = row(ly, 'Brought');
  const vPairs = row(ly + 30, 'Lone pairs, two each');
  const vBonds = row(ly + 60, 'Bonds, one each');
  gL.append(svg('line', { x1: lx, y1: ly + 76, x2: rx, y2: ly + 76, stroke: C.line, 'stroke-width': 1 }));
  const tCharge = svg('text', { x: lx, y: ly + 106, fill: C.ink, 'font-family': SERIF, 'font-size': 18, text: 'Formal charge' });
  const vCharge = svg('text', { x: rx, y: ly + 108, fill: C.ink, 'font-family': SERIF, 'font-size': 34, 'font-weight': 700, 'text-anchor': 'end', text: '' });
  const vMath = svg('text', { x: lx, y: ly + 130, fill: C.ink3, 'font-family': MONO, 'font-size': 12, text: '' });
  const vOctet = svg('text', { x: lx, y: ly + 156, fill: C.green, 'font-family': SERIF, 'font-size': 14, text: '' });
  gL.append(tCharge, vCharge, vMath, vOctet);

  const stage = el('div', {});
  stage.append(root);
  const caption = el('div', { style: { fontFamily: SERIF, fontSize: '16px', color: C.ink, marginTop: '6px' } });
  const note = el('div', { style: { fontFamily: SERIF, fontSize: '15px', color: C.goldhi, minHeight: '1.5em', marginTop: '4px' } });
  // controls
  const atomChips = {};
  const chipRow = el('div', { class: 'controls' });
  for (const s of Object.keys(ATOMS)){
    const chip = el('button', { class: 'chip', type: 'button', 'aria-pressed': String(s === sym), text: ATOMS[s].name + ' brings ' + ATOMS[s].valence, onclick(){ sym = s; [b, lp] = ATOMS[s].states[1]; setNote(''); render(); } });
    atomChips[s] = chip; chipRow.append(chip);
  }
  const stepBtn = (label, what) => el('button', { class: 'secondary', type: 'button', text: label, 'aria-label': (label === '+' ? 'add a ' : 'remove a ') + (what.endsWith('bond') ? 'bond' : 'lone pair'), style: { minWidth: '44px', padding: '8px 12px', fontFamily: MONO, fontSize: '18px', lineHeight: 1 }, onclick(){ const r = step(sym, b, lp, what); if (!r) return; b = r.b; lp = r.lp; setNote(r.note); render(); } });
  const bMinus = stepBtn('-', '-bond'), bPlus = stepBtn('+', '+bond'), lMinus = stepBtn('-', '-lp'), lPlus = stepBtn('+', '+lp');
  const bCount = el('span', { style: { fontFamily: MONO, fontSize: '16px', color: C.goldhi, minWidth: '1.2em', textAlign: 'center' } });
  const lCount = el('span', { style: { fontFamily: MONO, fontSize: '16px', color: C.goldhi, minWidth: '1.2em', textAlign: 'center' } });
  const grp = (label, minus, count, plus) => el('span', { style: { display: 'inline-flex', alignItems: 'center', gap: '8px', fontFamily: SERIF, fontSize: '15px', color: C.ink2, marginRight: '18px' } }, label, minus, count, plus);
  const stepRow = el('div', { class: 'controls' }, grp('Bonds', bMinus, bCount, bPlus), grp('Lone pairs', lMinus, lCount, lPlus));
  slots.visual.append(stage, caption, note, chipRow, stepRow);

  function setNote(t){ note.textContent = t; }
  function flash(node){ if (api.reduced) return; node.setAttribute('fill', C.goldhi); setTimeout(() => node.setAttribute('fill', C.ink), 450); }
  function render(){
    const { q, tone } = drawAtom(api, gAtom, 122, 118, sym, b, lp, {});
    for (const s of Object.keys(atomChips)) atomChips[s].setAttribute('aria-pressed', String(s === sym));
    const V = ATOMS[sym].valence;
    const prev = { br: vBrought.textContent, p: vPairs.textContent, bo: vBonds.textContent, q: vCharge.textContent };
    vBrought.textContent = String(V);
    vPairs.textContent = `${lp} x 2 = ${2 * lp}`;
    vBonds.textContent = `${b} x 1 = ${b}`;
    vCharge.textContent = q > 0 ? '+' + q : String(q);
    vCharge.setAttribute('fill', tone === C.grey ? C.ink : tone);
    vMath.textContent = `${V} - (${2 * lp} + ${b}) = ${V - (2 * lp + b)}`;
    const total = 2 * (b + lp);
    vOctet.textContent = total === 8 ? 'Around the atom: 8 electrons, a full octet.' : `Around the atom: ${total} electrons, a sextet. Electron poor.`;
    vOctet.setAttribute('fill', total === 8 ? C.green : C.amber);
    caption.textContent = `${ATOMS[sym].name} with ${b} bond${b === 1 ? '' : 's'} and ${lp === 0 ? 'no lone pairs' : lp + ' lone pair' + (lp === 1 ? '' : 's')}: ${NAMES[sym + b + ',' + lp]}.`;
    bCount.textContent = String(b); lCount.textContent = String(lp);
    bMinus.disabled = !step(sym, b, lp, '-bond'); bPlus.disabled = !step(sym, b, lp, '+bond');
    lMinus.disabled = !step(sym, b, lp, '-lp'); lPlus.disabled = !step(sym, b, lp, '+lp');
    if (prev.br !== vBrought.textContent) flash(vBrought);
    if (prev.p !== vPairs.textContent) flash(vPairs);
    if (prev.bo !== vBonds.textContent) flash(vBonds);
  }
  render();

  // ---- YOU TRY
  runTry(slots.try, api, () => {
    const it = genItem(api.rng);
    const s = svg('svg', { viewBox: "0 0 520 236", role: "img", "aria-label": "an atom with bonds and lone pairs", style: { width: '100%', maxHeight: '300px', display: 'block' } });
    const g = svg('g'); s.append(g);
    drawAtom(api, g, 260, 116, it.sym, it.b, it.lp, { star: true, badge: false, neutralTone: true });
    s.append(svg('text', { x: 260, y: 228, fill: C.ink3, 'font-family': SERIF, 'font-size': 14, 'text-anchor': 'middle', text: `${ATOMS[it.sym].name} with ${it.b} bond${it.b === 1 ? '' : 's'} to R groups and ${it.lp === 0 ? 'no lone pairs' : it.lp + ' lone pair' + (it.lp === 1 ? '' : 's') + ' (the dots)'}.` }));
    const V = ATOMS[it.sym].valence;
    return { prompt: 'What is the formal charge on the starred atom?', node: s, mode: 'choices', choices: it.choices,
      coach: `Name the ledger. ${ATOMS[it.sym].name} brought ${V}. Count what it is holding: two for each lone pair, one for each bond, then take that away from ${V}.` };
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
  // independent expectation table (the nine real configurations)
  const expect = { 'O1,3': -1, 'O2,2': 0, 'O3,1': 1, 'N3,1': 0, 'N4,0': 1, 'N2,2': -1, 'C4,0': 0, 'C3,1': -1, 'C3,0': 1 };
  const rng = makeRng(20260903);
  let tried = 0; const seen = new Set();
  for (let k = 0; k < 240; k++){
    const it = genItem(rng);
    const key = it.sym + it.b + ',' + it.lp;
    if (!(key in expect)) return { ok: false, tried, notes: 'generated a configuration outside the table: ' + key };
    if (it.q !== expect[key]) return { ok: false, tried, notes: `charge mismatch for ${key}: ${it.q}` };
    const oks = it.choices.filter(c => c.ok);
    if (oks.length !== 1 || oks[0].value !== it.q) return { ok: false, tried, notes: 'correct choice not unique' };
    if (2 * (it.b + it.lp) > 8) return { ok: false, tried, notes: 'octet exceeded' };
    if (!NAMES[key]) return { ok: false, tried, notes: 'no name for ' + key };
    seen.add(key); tried++;
  }
  if (seen.size !== 9) return { ok: false, tried, notes: 'not every configuration was generated: ' + seen.size };
  // every control press from every state lands on an allowed state, and every state is reachable
  for (const sym of Object.keys(ATOMS)){
    for (const [b, lp] of ATOMS[sym].states){
      for (const what of ['+bond', '-bond', '+lp', '-lp']){
        const r = step(sym, b, lp, what);
        if (r && !allowed(sym, r.b, r.lp)) return { ok: false, tried, notes: 'control left the allowed states' };
        if (r && Math.abs(charge(sym, r.b, r.lp) - charge(sym, b, lp)) > 2) return { ok: false, tried, notes: 'charge jumped' };
      }
      const moves = ['+bond', '-bond', '+lp', '-lp'].filter(w => step(sym, b, lp, w));
      if (!moves.length) return { ok: false, tried, notes: 'dead state ' + sym + b + ',' + lp };
    }
  }
  const a = genItem(makeRng(3)), c = genItem(makeRng(3));
  if (a.sym !== c.sym || a.b !== c.b || a.lp !== c.lp) return { ok: false, tried, notes: 'same seed gave a different item' };
  return { ok: true, tried, notes: 'all nine configurations seen; 3 atoms x 4 controls checked' };
}
