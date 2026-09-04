// The Tree of Organic, Level 5, Module 6: The hill and the landing.
// Reaction coordinate diagrams: transition states, intermediates, the rate
// determining step, catalysts, and kinetic against thermodynamic control.
// The ADA names reaction coordinate diagrams as their own subtopic for 2026.
// No imports (contract).

export const meta = {
  id: 't5-coordinate',
  level: 5,
  order: 6,
  needs3D: false,
  title: 'The hill and the landing',
  concept: 'Reaction coordinate diagrams',
  tagline: 'The hill is how fast. The landing is how far downhill. They are different questions.',
  story: 'A reaction coordinate diagram is a picture of one trip: energy going up the side, progress going across. Two things live in it and students mix them constantly. The hill is the activation energy, and it decides how fast. The landing is where the products sit against the reactants, and it decides whether the reaction gives off heat or takes it in. A peak is a transition state, which you can never isolate because it is falling apart in both directions. A valley between two peaks is an intermediate, which is a real molecule with a real lifetime, and a carbocation is the one you meet most. Count the peaks and you have counted the steps. Rule of thumb: hills are speed, landings are energy.',
  moveName: 'Count the peaks, then read the hill and the landing separately',
  move: [
    'Count the peaks. One peak is one step, two peaks is two steps, and the valley between them is the intermediate.',
    'The tallest hill, measured from the valley in front of it, is the rate determining step. That is the slow one, and it sets the rate.',
    'Read the landing: products below reactants gives off heat, products above takes heat in. That is separate from the hill.',
    'A catalyst lowers the hill and never moves the landing. If a diagram shows the products moving, it is not a catalyst.',
    'Two products from one starting material: the lower hill wins in the cold (kinetic), the lower landing wins with heat and time (thermodynamic).'
  ],
  trap: 'Careful: a transition state is a peak and an intermediate is a valley, and only the valley is a real molecule you could in principle put in a bottle. Calling the carbocation a transition state is the single most common slip on this topic.',
  holdsUp: ['SN1 against SN2 rates', 'Why rearrangements happen', 'Catalysis questions', 'Kinetic against thermodynamic products', 'Hammond arguments'],
  drill: 'Booster OChem: The Fundamentals'
};

export const SMILES = [];
const HOME = 't5-coordinate';
const ROOTS = ['l2-carbocation', 'l2-arrows'];

/* ------------------------------------------------------------------ */
/* The diagrams. Each is a list of levels along the trip.               */
/* kind: 'start' | 'ts' | 'int' | 'end'; y is relative energy.          */
/* ------------------------------------------------------------------ */
export const DIAGRAMS = [
  {
    id: 'sn2', name: 'SN2', steps: 1,
    points: [
      { kind: 'start', y: 30, label: 'reactants: the halide plus the nucleophile' },
      { kind: 'ts', y: 78, label: 'one transition state: the nucleophile and the leaving group both partly bonded' },
      { kind: 'end', y: 10, label: 'products: the new bond made, the halide gone' }
    ],
    note: 'One step, so one hill and nothing in the middle. Both bonds change at the same moment, which is why the center inverts.',
    rds: 'the only step there is'
  },
  {
    id: 'e2', name: 'E2', steps: 1,
    points: [
      { kind: 'start', y: 30, label: 'reactants: the halide plus the base' },
      { kind: 'ts', y: 82, label: 'one transition state: the base taking the beta hydrogen as the halide leaves' },
      { kind: 'end', y: 14, label: 'products: the alkene, the acid and the halide' }
    ],
    note: 'One step again. Everything happens together, which is why the hydrogen and the leaving group have to line up anti.',
    rds: 'the only step there is'
  },
  {
    id: 'sn1', name: 'SN1', steps: 2,
    points: [
      { kind: 'start', y: 30, label: 'reactants: the tertiary halide' },
      { kind: 'ts', y: 92, label: 'first transition state: the C to Br bond stretching' },
      { kind: 'int', y: 58, label: 'the carbocation: a real intermediate, flat and electron poor' },
      { kind: 'ts', y: 70, label: 'second transition state: water arriving at the flat carbon' },
      { kind: 'end', y: 12, label: 'products: the alcohol after a proton leaves' }
    ],
    note: 'Two peaks, one valley. The first hill is much taller, so making the carbocation is the slow step and the rate depends only on the substrate.',
    rds: 'step one, forming the carbocation'
  },
  {
    id: 'e1', name: 'E1', steps: 2,
    points: [
      { kind: 'start', y: 30, label: 'reactants: the tertiary halide, warm' },
      { kind: 'ts', y: 92, label: 'first transition state: the bond to the leaving group stretching' },
      { kind: 'int', y: 58, label: 'the same carbocation SN1 makes' },
      { kind: 'ts', y: 66, label: 'second transition state: a weak base taking a beta hydrogen' },
      { kind: 'end', y: 20, label: 'products: the alkene' }
    ],
    note: 'The same first hill as SN1, which is exactly why the two travel together and you always get a mixture.',
    rds: 'step one, forming the carbocation'
  },
  {
    id: 'rearr', name: 'Addition with a hydride shift', steps: 3,
    points: [
      { kind: 'start', y: 34, label: 'reactants: the alkene plus HBr' },
      { kind: 'ts', y: 88, label: 'protonation transition state' },
      { kind: 'int', y: 62, label: 'the secondary carbocation, the first one formed' },
      { kind: 'ts', y: 70, label: 'the shift transition state, a hydride sliding over' },
      { kind: 'int', y: 48, label: 'the tertiary carbocation, lower and happier' },
      { kind: 'ts', y: 58, label: 'bromide arriving' },
      { kind: 'end', y: 8, label: 'products: the rearranged bromide' }
    ],
    note: 'The middle valley drops when the hydride shifts. A cation will climb a small hill to reach a much lower valley, and that is the whole reason rearrangements happen.',
    rds: 'step one, protonation'
  }
];

export function tsPoints(d){ return d.points.filter(p => p.kind === 'ts'); }
export function intPoints(d){ return d.points.filter(p => p.kind === 'int'); }
/** The rate determining step is the biggest climb measured from the valley before it. */
export function rdsIndex(d){
  let best = -1, climb = -1, floor = d.points[0].y;
  d.points.forEach((p, i) => {
    if (p.kind === 'ts'){ const c = p.y - floor; if (c > climb){ climb = c; best = i; } }
    else floor = p.y;
  });
  return best;
}

/* ------------------------------------------------------------------ */
function mulberry(seed){ let a = seed | 0; return function(){ a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function tinyApi(deps, seed){
  const rng = mulberry(seed);
  return { rng, seed(){}, pick: a => a[Math.floor(rng() * a.length)], shuffle(a){ const b = a.slice(); for (let i = b.length - 1; i > 0; i--){ const j = Math.floor(rng() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; }, reactions: deps.reactions, bank: deps.bank };
}
function finish(o){ return Object.assign({ home: HOME, roots: ROOTS, sub: null, reagent: null, prod: null }, o); }

export function genSteps(api){
  const d = api.pick(DIAGRAMS);
  const n = d.steps;
  const opts = api.shuffle([1, 2, 3, 4].map(k => ({ text: k === 1 ? 'One step' : k + ' steps', ok: k === n })));
  return finish({
    kind: 'steps',
    stem: 'A reaction coordinate diagram for ' + d.name + ' shows ' + tsPoints(d).length + ' peak' + (tsPoints(d).length === 1 ? '' : 's') + ' and ' + intPoints(d).length + ' valley' + (intPoints(d).length === 1 ? '' : 's') + ' between the reactants and the products. How many steps is the mechanism?',
    choices: opts.map(x => ({ text: x.text, smiles: null })),
    correct: opts.findIndex(x => x.ok),
    coach: 'Count the peaks, not the valleys. Every peak is one step, so ' + tsPoints(d).length + ' peaks means ' + n + ' step' + (n === 1 ? '' : 's') + '. ' + d.note
  });
}

export function genNaming(api){
  const d = api.pick(DIAGRAMS.filter(x => x.steps > 1));
  const askTS = api.rng() < 0.5;
  const opts = api.shuffle([
    { text: 'A transition state, a peak you can never isolate', ok: askTS },
    { text: 'An intermediate, a real molecule sitting in a valley', ok: !askTS },
    { text: 'The activation energy of the whole reaction', ok: false },
    { text: 'The heat of reaction', ok: false }
  ]);
  return finish({
    kind: 'naming',
    stem: 'On the ' + d.name + ' diagram, what sits at ' + (askTS ? 'the top of a hill' : 'the bottom of the valley between the two hills') + '?',
    choices: opts.map(x => ({ text: x.text, smiles: null })),
    correct: opts.findIndex(x => x.ok),
    coach: askTS
      ? 'A peak is a transition state. It is falling apart toward both sides at once, so it has no lifetime and you can never put it in a bottle.'
      : 'A valley is an intermediate, and in ' + d.name + ' it is the carbocation. It is a real molecule with a real lifetime, which is exactly why it has time to rearrange or get attacked from either face.'
  });
}

export function genRds(api){
  const d = api.pick(DIAGRAMS.filter(x => x.steps > 1));
  const i = rdsIndex(d);
  const opts = api.shuffle([
    { text: 'The first hill: ' + d.rds, ok: i === 1 },
    { text: 'The last hill, the one nearest the products', ok: i !== 1 },
    { text: 'The valley, because the intermediate is the slow part', ok: false },
    { text: 'Both hills equally, because they are in the same reaction', ok: false }
  ]);
  return finish({
    kind: 'rds',
    stem: 'Which step is rate determining on the ' + d.name + ' diagram?',
    choices: opts.map(x => ({ text: x.text, smiles: null })),
    correct: opts.findIndex(x => x.ok),
    coach: 'The rate determining step is the tallest climb, measured from the valley in front of it, not the highest point on the page. For ' + d.name + ' that is ' + d.rds + '. ' + d.note
  });
}

export function genCatalyst(api){
  const opts = api.shuffle([
    { text: 'It lowers the hill and leaves the landing exactly where it was', ok: true },
    { text: 'It lowers both the hill and the landing', ok: false },
    { text: 'It lowers the landing and leaves the hill alone', ok: false },
    { text: 'It raises the landing so the products are easier to reach', ok: false }
  ]);
  return finish({
    kind: 'catalyst',
    stem: 'A catalyst is added. What changes on the reaction coordinate diagram?',
    choices: opts.map(x => ({ text: x.text, smiles: null })),
    correct: opts.findIndex(x => x.ok),
    coach: 'A catalyst opens a lower path over the same mountain. The reactants and the products are the same molecules with the same energies, so the landing cannot move. Only the hill comes down, so the reaction gets faster without becoming more favorable. That is also why a catalyst speeds the reverse reaction by exactly as much.'
  });
}

export function genControl(api){
  const cold = api.rng() < 0.5;
  const opts = api.shuffle([
    { text: 'The product over the lower hill, the kinetic product', ok: cold },
    { text: 'The product with the lower landing, the thermodynamic product', ok: !cold },
    { text: 'An even mixture of the two, always', ok: false },
    { text: 'Neither, the reaction stops', ok: false }
  ]);
  return finish({
    kind: 'control',
    stem: 'One starting material can give two products: A has the lower hill, B has the lower landing. Which one dominates ' + (cold ? 'at low temperature, run briefly' : 'at high temperature, given plenty of time') + '?',
    choices: opts.map(x => ({ text: x.text, smiles: null })),
    correct: opts.findIndex(x => x.ok),
    coach: cold
      ? 'Cold and quick means the molecules only have enough energy for the easiest hill, and nothing has time to come back. The faster product wins: kinetic control.'
      : 'Heat and time let the products go backward over their hills and try again, so the mixture settles into whichever product is most stable. The lower landing wins: thermodynamic control.'
  });
}

export function genExo(api){
  const exo = api.rng() < 0.5;
  const opts = api.shuffle([
    { text: 'Exothermic: it gives off heat', ok: exo },
    { text: 'Endothermic: it takes heat in', ok: !exo },
    { text: 'It depends on the height of the hill', ok: false },
    { text: 'It depends on how many steps there are', ok: false }
  ]);
  return finish({
    kind: 'exo',
    stem: 'On a diagram, the products sit ' + (exo ? 'below' : 'above') + ' the reactants. Is the reaction exothermic or endothermic?',
    choices: opts.map(x => ({ text: x.text, smiles: null })),
    correct: opts.findIndex(x => x.ok),
    coach: 'Read the landing and ignore the hill. Products ' + (exo ? 'below the reactants means energy came out, so it is exothermic' : 'above the reactants means energy went in, so it is endothermic') + '. A tall hill only means slow; it says nothing about which way the energy went.'
  });
}

const GENS = [genSteps, genNaming, genRds, genCatalyst, genControl, genExo];
export function gen(api){ return api.pick(GENS)(api); }
export function makeItem(api){ return gen(api); }

/* ------------------------------------------------------------------ */
export function selfTest(deps){
  const notes = [], fail = m => notes.push(m);
  const api = tinyApi(deps, 31);
  // the diagrams must be shaped like real diagrams
  for (const d of DIAGRAMS){
    if (d.points[0].kind !== 'start' || d.points[d.points.length - 1].kind !== 'end') fail(d.id + ' does not start and end properly');
    if (tsPoints(d).length !== d.steps) fail(d.id + ' claims ' + d.steps + ' steps but has ' + tsPoints(d).length + ' peaks');
    if (intPoints(d).length !== d.steps - 1) fail(d.id + ' should have ' + (d.steps - 1) + ' valleys');
    // every peak must be higher than the levels on both sides of it
    d.points.forEach((p, i) => {
      if (p.kind !== 'ts') return;
      if (!(p.y > d.points[i - 1].y && p.y > d.points[i + 1].y)) fail(d.id + ' peak at ' + i + ' is not above its neighbours');
    });
    if (rdsIndex(d) !== 1 && d.steps > 1 && /step one/.test(d.rds)) fail(d.id + ' names step one but the tallest climb is elsewhere');
  }
  // the two-step diagrams must have their first hill tallest, which is the SN1 story
  const sn1 = DIAGRAMS.find(d => d.id === 'sn1');
  if (rdsIndex(sn1) !== 1) fail('SN1 rate determining step should be the first');
  const rearr = DIAGRAMS.find(d => d.id === 'rearr');
  if (!(rearr.points[4].y < rearr.points[2].y)) fail('the rearranged cation should sit lower than the first one');

  const kinds = {};
  let tried = 0;
  for (let i = 0; i < 400; i++){
    const it = makeItem(api); tried++;
    if (!it){ fail('generator gave up at ' + i); break; }
    kinds[it.kind] = (kinds[it.kind] || 0) + 1;
    if (it.home !== HOME) fail('home is ' + it.home);
    if (!it.roots || !it.roots.length) fail('roots empty');
    if (!it.coach) fail('coach empty');
    if (!it.stem) fail('stem empty');
    if (!it.choices || it.choices.length !== 4) fail('choice count ' + (it.choices || []).length);
    const keys = it.choices.map(c => c.text);
    if (new Set(keys).size !== keys.length) fail('duplicate choices: ' + it.stem);
    if (!(it.correct >= 0 && it.correct < it.choices.length)) fail('bad correct index');
  }
  const a1 = tinyApi(deps, 9), a2 = tinyApi(deps, 9);
  if (JSON.stringify(makeItem(a1)) !== JSON.stringify(makeItem(a2))) fail('not deterministic');
  if (Object.keys(kinds).length < 6) fail('only ' + Object.keys(kinds).length + ' item kinds');
  return { ok: !notes.length, tried, notes: notes.length ? notes.slice(0, 4).join('; ') : DIAGRAMS.length + ' diagrams, peaks above their neighbours, ' + Object.keys(kinds).length + ' item kinds' };
}

/* ------------------------------------------------------------------ */
/* The visual: a diagram you build and read                             */
/* ------------------------------------------------------------------ */
const CSS = `
.t5c-stage{background:rgba(255,255,255,.02);border:1px solid var(--line);border-radius:12px;padding:14px}
.t5c-svg{display:block;width:100%;height:auto}
.t5c-row{display:flex;gap:6px;flex-wrap:wrap;margin:10px 0 0}
.t5c-cap{font-size:15px;color:var(--ink2);margin-top:10px;line-height:1.55;min-height:3em}
.t5c-cap b{color:var(--goldhi);font-family:var(--serif);font-weight:400;font-size:17px;display:block;margin-bottom:2px}
.t5c-hit{cursor:pointer}
.t5c-hit:hover circle{stroke:var(--goldhi)}
`;
function injectStyle(id, css){ if (typeof document === 'undefined' || document.getElementById(id)) return; const s = document.createElement('style'); s.id = id; s.textContent = css; document.head.append(s); }

export function mount(slots, api){
  const { el, svg } = api, C = api.colors;
  injectStyle('t5c-style', CSS);
  let cur = DIAGRAMS[2], catalyst = false, endo = false;

  const stage = el('div', { class: 't5c-stage' });
  const holder = el('div', {});
  const cap = el('div', { class: 't5c-cap' });
  const pickRow = el('div', { class: 't5c-row' }), togRow = el('div', { class: 't5c-row' });
  stage.append(holder, cap, pickRow, togRow);
  slots.visual.append(stage);

  const W = 720, H = 300, L = 60, R = 20, T = 24, B = 46;

  function levels(){
    // catalyst lowers every peak toward its neighbours; endothermic lifts the end
    return cur.points.map((p, i) => {
      let y = p.y;
      if (catalyst && p.kind === 'ts') y = p.y - 22;
      if (endo && p.kind === 'end') y = cur.points[0].y + 26;
      return Object.assign({}, p, { y });
    });
  }

  function draw(){
    holder.textContent = '';
    const pts = levels();
    const maxY = 110, x0 = L, x1 = W - R;
    const px = i => x0 + (x1 - x0) * (i / (pts.length - 1));
    const py = y => (H - B) - (y / maxY) * (H - B - T);
    const s = svg('svg', { viewBox: '0 0 ' + W + ' ' + H, class: 't5c-svg', role: 'img', 'aria-label': 'a reaction coordinate diagram for ' + cur.name });
    // axes
    s.append(svg('line', { x1: L - 12, y1: T - 6, x2: L - 12, y2: H - B, stroke: C.line, 'stroke-width': 1.2 }));
    s.append(svg('line', { x1: L - 12, y1: H - B, x2: W - 10, y2: H - B, stroke: C.line, 'stroke-width': 1.2 }));
    s.append(svg('text', { x: 14, y: (H - B + T) / 2, fill: C.ink3, 'font-family': 'var(--mono)', 'font-size': 10, 'letter-spacing': '.1em', transform: 'rotate(-90 14 ' + ((H - B + T) / 2) + ')', 'text-anchor': 'middle', text: 'ENERGY' }));
    s.append(svg('text', { x: (x0 + x1) / 2, y: H - 12, fill: C.ink3, 'font-family': 'var(--mono)', 'font-size': 10, 'letter-spacing': '.1em', 'text-anchor': 'middle', text: 'REACTION PROGRESS' }));
    // the curve: a smooth path through the levels
    let d = 'M ' + px(0) + ' ' + py(pts[0].y);
    for (let i = 1; i < pts.length; i++){
      const xa = px(i - 1), ya = py(pts[i - 1].y), xb = px(i), yb = py(pts[i].y), mx = (xa + xb) / 2;
      d += ' C ' + mx + ' ' + ya + ' ' + mx + ' ' + yb + ' ' + xb + ' ' + yb;
    }
    // an uncatalyzed ghost behind, when the catalyst is on
    if (catalyst){
      let g = 'M ' + px(0) + ' ' + py(cur.points[0].y);
      for (let i = 1; i < cur.points.length; i++){
        const yy = (endo && cur.points[i].kind === 'end') ? cur.points[0].y + 26 : cur.points[i].y;
        const yPrev = (endo && cur.points[i - 1].kind === 'end') ? cur.points[0].y + 26 : cur.points[i - 1].y;
        const xa = px(i - 1), ya = py(yPrev), xb = px(i), yb = py(yy), mx = (xa + xb) / 2;
        g += ' C ' + mx + ' ' + ya + ' ' + mx + ' ' + yb + ' ' + xb + ' ' + yb;
      }
      s.append(svg('path', { d: g, fill: 'none', stroke: C.ink3, 'stroke-width': 1.4, 'stroke-dasharray': '5 4', opacity: 0.7 }));
    }
    s.append(svg('path', { d: d, fill: 'none', stroke: C.gold, 'stroke-width': 2.4, 'stroke-linecap': 'round' }));
    // the rate determining climb, marked
    const ri = rdsIndex(cur);
    if (ri > 0){
      const floorY = pts[ri - 1].y, topY = pts[ri].y, x = px(ri);
      s.append(svg('line', { x1: x, y1: py(floorY), x2: x, y2: py(topY), stroke: C.goldhi, 'stroke-width': 1.2, 'stroke-dasharray': '3 3' }));
      s.append(svg('text', { x: x + 6, y: (py(floorY) + py(topY)) / 2, fill: C.goldhi, 'font-family': 'var(--mono)', 'font-size': 10, text: 'RATE DETERMINING' }));
    }
    // the landing
    s.append(svg('line', { x1: px(0), y1: py(pts[0].y), x2: x1, y2: py(pts[0].y), stroke: C.ink3, 'stroke-width': 1, 'stroke-dasharray': '2 5', opacity: .8 }));
    // the points, tappable
    pts.forEach((p, i) => {
      const g = svg('g', { class: 't5c-hit', tabindex: '0', role: 'button', 'aria-label': p.label });
      g.append(svg('circle', { cx: px(i), cy: py(p.y), r: 6, fill: p.kind === 'ts' ? 'rgba(226,169,59,.9)' : p.kind === 'int' ? 'rgba(91,141,239,.9)' : 'rgba(87,180,135,.9)', stroke: 'rgba(20,18,12,.8)', 'stroke-width': 1.5 }));
      const say = () => { cap.textContent = ''; cap.append(el('b', { text: p.kind === 'ts' ? 'A transition state: a peak, never isolated' : p.kind === 'int' ? 'An intermediate: a valley, a real molecule' : p.kind === 'start' ? 'The reactants' : 'The products' }), p.label + (p.kind === 'int' ? ' It has a lifetime, which is why it can rearrange or be attacked from either face.' : '')); };
      g.addEventListener('click', say); g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); say(); } });
      s.append(g);
    });
    holder.append(s);
    if (!cap.textContent) cap.append(el('b', { text: cur.name + ': ' + cur.steps + ' step' + (cur.steps === 1 ? '' : 's') }), cur.note);
  }

  function rows(){
    pickRow.textContent = ''; togRow.textContent = '';
    for (const d of DIAGRAMS){
      const on = d.id === cur.id;
      pickRow.append(el('button', { type: 'button', class: 'chip' + (on ? ' on' : ''), 'aria-pressed': String(on), text: d.name, onclick: () => { cur = d; cap.textContent = ''; rows(); draw(); } }));
    }
    togRow.append(el('button', { type: 'button', class: 'chip' + (catalyst ? ' on' : ''), 'aria-pressed': String(catalyst), text: 'Add a catalyst', onclick: () => { catalyst = !catalyst; cap.textContent = ''; if (catalyst){ cap.append(el('b', { text: 'The hills came down. The landing did not move.' }), 'A catalyst opens a lower path over the same mountain, so the reaction gets faster without becoming more favorable. The dashed line is the old path.'); } rows(); draw(); } }));
    togRow.append(el('button', { type: 'button', class: 'chip' + (endo ? ' on' : ''), 'aria-pressed': String(endo), text: 'Make it endothermic', onclick: () => { endo = !endo; cap.textContent = ''; if (endo) cap.append(el('b', { text: 'The landing moved above the start.' }), 'Products above reactants means energy went in. The hills are untouched, so the rate did not change: speed and energy are separate questions.'); rows(); draw(); } }));
    togRow.append(el('span', { class: 'muted', style: { fontSize: '13px', color: 'var(--ink3)', alignSelf: 'center' }, text: 'tap any point on the curve to name it' }));
  }
  rows(); draw();

  /* ---- you try ---- */
  let item = null, picked = -1, done = false, first = true;
  const box = el('div', { class: 'item' });
  slots.try.append(box);
  function render(){
    box.textContent = '';
    box.append(el('p', { class: 'prompt', text: item.stem }));
    const opts = el('div', { class: 'opts' });
    item.choices.forEach((c, i) => {
      opts.append(el('button', { type: 'button', class: 'opt' + (picked === i ? ' picked' : '') + (done && i === item.correct ? ' ok' : ''), disabled: done ? '' : null, onclick: () => { picked = i; commit(); } }, el('span', { class: 'k', text: 'ABCD'[i] }), el('span', { text: c.text })));
    });
    box.append(opts);
    if (done){
      const ok = picked === item.correct;
      box.append(el('div', { class: 'verdict ' + (ok ? 'good' : 'notyet'), text: ok ? 'You can read it.' : 'Not yet.' }));
      box.append(el('button', { type: 'button', class: 'primary', text: 'Another one', onclick: next }));
    }
  }
  function commit(){
    const ok = picked === item.correct;
    if (first){ api.report(ok); first = false; }
    if (ok){ done = true; api.clearCoach(); } else api.coach(item.coach);
    render();
  }
  function next(){ item = gen(api); picked = -1; done = false; first = true; api.clearCoach(); render(); }
  next();
}
