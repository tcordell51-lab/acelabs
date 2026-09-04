// The Tree of Organic, Level 7, Module 6: Separate, purify, prove.
// Extraction by acid-base solubility, TLC by polarity, distillation by boiling
// point, plus the classic tests. No imports (contract).

export const meta = {
  id: 't7-lab',
  level: 7,
  order: 6,
  needs3D: false,
  title: 'Separate, purify, prove',
  concept: 'Lab theory and techniques',
  tagline: 'Every separation is one property doing the sorting. Name the property first.',
  story: 'Lab questions look like trivia and they are not. Each technique sorts on exactly one property, so name the property and the answer falls out. Distillation sorts by boiling point, and when two liquids boil close together you need a fractional column. Extraction sorts by charge: shake an organic layer with aqueous base and any acid in it becomes a salt and moves into the water; shake with aqueous acid and any amine becomes a salt and moves into the water; a neutral compound never moves. Recrystallization sorts by how solubility changes between hot and cold. Chromatography sorts by polarity: the plate is polar silica, so a polar spot sticks and crawls, a nonpolar spot rides the solvent up. Rule of thumb: name the property, then follow it.',
  moveName: 'Name the property, then follow it',
  move: [
    'Distillation: boiling point. Far apart is a simple distillation, close together needs a fractional column.',
    'Extraction: charge. Bicarbonate or hydroxide pulls an acid into the water layer as its salt; HCl pulls an amine into the water layer as its salt; neutrals stay in the organic layer.',
    'Which layer is on top is density, not polarity: ether and most hydrocarbons float on water, dichloromethane and chloroform sink.',
    'TLC: polarity. Silica is polar, so the polar spot sticks and has the lower Rf. Rf is the spot distance over the solvent distance, always between 0 and 1.'
  ],
  trap: 'Careful: bicarbonate is the selective one. It is basic enough to deprotonate a carboxylic acid but not a phenol, so a bicarbonate wash separates an acid from a phenol while hydroxide would pull both into the water.',
  holdsUp: ['Purifying any synthesis product', 'Reading a workup step in a mechanism', 'Separation questions on the real section', 'Choosing a solvent'],
  drill: 'Booster OChem: Spectroscopy & Lab Techniques'
};

// SMILES drawn here (render-checked by the sheet test).
export const SMILES = ['OC(=O)c1ccccc1', 'Cc1ccccc1', 'Nc1ccccc1', 'Oc1ccccc1', 'CCCCO', 'CCOCC', 'CC(=O)O', 'CCCCCCCC', 'ClCCl', 'CC(=O)C', 'CCCCCC(=O)O', 'COc1ccccc1'];

const HOME = 't7-lab';

/* ------------------------------------------------------------------ */
/* The compounds, and how each behaves in a wash                        */
/* ------------------------------------------------------------------ */
// kind: acid (carboxylic), phenol (weakly acidic), base (amine), neutral.
export const COMPOUNDS = [
  { id: 'benzoic', name: 'benzoic acid', smi: 'OC(=O)c1ccccc1', kind: 'acid', note: 'a carboxylic acid, pKa about 4.2' },
  { id: 'hexanoic', name: 'hexanoic acid', smi: 'CCCCCC(=O)O', kind: 'acid', note: 'a carboxylic acid, pKa about 4.9' },
  { id: 'phenol', name: 'phenol', smi: 'Oc1ccccc1', kind: 'phenol', note: 'weakly acidic, pKa about 10' },
  { id: 'aniline', name: 'aniline', smi: 'Nc1ccccc1', kind: 'base', note: 'an amine, basic' },
  { id: 'toluene', name: 'toluene', smi: 'Cc1ccccc1', kind: 'neutral', note: 'a hydrocarbon, neutral' },
  { id: 'anisole', name: 'anisole', smi: 'COc1ccccc1', kind: 'neutral', note: 'an ether, neutral' },
  { id: 'octane', name: 'octane', smi: 'CCCCCCCC', kind: 'neutral', note: 'a hydrocarbon, neutral' }
];

// Washes. `pulls` lists the kinds that move into the aqueous layer.
export const WASHES = [
  { id: 'nahco3', label: 'aqueous NaHCO3', pulls: ['acid'], why: 'Bicarbonate is basic enough to deprotonate a carboxylic acid but not a phenol, so only the carboxylic acid becomes a salt and moves into the water.' },
  { id: 'naoh', label: 'aqueous NaOH', pulls: ['acid', 'phenol'], why: 'Hydroxide is strong enough to deprotonate a phenol as well as a carboxylic acid, so both move into the water as salts.' },
  { id: 'hcl', label: 'aqueous HCl', pulls: ['base'], why: 'The amine takes a proton and becomes an ammonium salt, which is ionic, so it moves into the water. Acids and neutrals stay put.' },
  { id: 'water', label: 'water only', pulls: [], why: 'Nothing is charged, so nothing moves. Water alone separates nothing here.' },
  { id: 'brine', label: 'brine (saturated NaCl)', pulls: [], why: 'Brine pulls dissolved water out of the organic layer before you dry it. It changes no charges, so it separates nothing.' }
];

export function layerOf(compound, wash){ return wash.pulls.indexOf(compound.kind) >= 0 ? 'aqueous' : 'organic'; }

// Solvents, for the which-layer-is-on-top question. Density against water.
export const SOLVENTS = [
  { name: 'diethyl ether', smi: 'CCOCC', d: 0.71, top: true },
  { name: 'ethyl acetate', smi: null, d: 0.90, top: true },
  { name: 'hexane', smi: null, d: 0.66, top: true },
  { name: 'dichloromethane', smi: 'ClCCl', d: 1.33, top: false },
  { name: 'chloroform', smi: null, d: 1.49, top: false }
];

/* ------------------------------------------------------------------ */
/* TLC: polarity order, lower polarity means higher Rf                  */
/* ------------------------------------------------------------------ */
// pol: 0 least polar. Rf falls as polarity rises on silica.
export const SPOTS = [
  { name: 'octane', smi: 'CCCCCCCC', pol: 0, rf: 0.92, why: 'a pure hydrocarbon, nothing to grip the silica' },
  { name: 'toluene', smi: 'Cc1ccccc1', pol: 1, rf: 0.85, why: 'aromatic but still a hydrocarbon' },
  { name: 'anisole', smi: 'COc1ccccc1', pol: 2, rf: 0.72, why: 'an ether oxygen accepts a hydrogen bond, but cannot donate one' },
  { name: 'diethyl ether', smi: 'CCOCC', pol: 3, rf: 0.66, why: 'an ether, mildly polar' },
  { name: 'acetone', smi: 'CC(=O)C', pol: 4, rf: 0.48, why: 'a carbonyl, a real dipole, but no O-H' },
  { name: '1-butanol', smi: 'CCCCO', pol: 5, rf: 0.30, why: 'an O-H donates a hydrogen bond, so it grips the silica' },
  { name: 'phenol', smi: 'Oc1ccccc1', pol: 6, rf: 0.22, why: 'an aromatic O-H, a strong hydrogen bond donor' },
  { name: 'benzoic acid', smi: 'OC(=O)c1ccccc1', pol: 7, rf: 0.12, why: 'a carboxylic acid, the strongest gripper here' }
];

/* ------------------------------------------------------------------ */
/* Distillation                                                         */
/* ------------------------------------------------------------------ */
export const DISTIL = [
  { a: 'acetone', ba: 56, b: 'water', bb: 100, kind: 'simple', why: 'Forty-four degrees apart is a wide gap, so one pass through a simple still separates them.' },
  { a: 'benzene', ba: 80, b: 'toluene', bb: 111, kind: 'simple', why: 'Thirty-one degrees is still comfortable for a simple distillation.' },
  { a: 'methanol', ba: 65, b: 'ethanol', bb: 78, kind: 'fractional', why: 'Thirteen degrees is close, and each theoretical plate in a fractional column is another distillation, so the column does the work.' },
  { a: 'hexane', ba: 69, b: 'cyclohexane', bb: 81, kind: 'fractional', why: 'Twelve degrees apart, so a simple still would hand you a mixture. Use the column.' },
  { a: 'pentane', ba: 36, b: 'octane', bb: 126, kind: 'simple', why: 'Ninety degrees apart, about as easy as a separation gets.' },
  { a: 'propanol', ba: 97, b: 'butanol', bb: 118, kind: 'fractional', why: 'Twenty-one degrees with similar structures, so the column earns its keep.' }
];

/* ------------------------------------------------------------------ */
/* Item generation                                                      */
/* ------------------------------------------------------------------ */
function mulberry(seed){ let a = seed | 0; return function(){ a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function tinyApi(deps, seed){
  const rng = mulberry(seed);
  return { rng, seed(){}, pick: a => a[Math.floor(rng() * a.length)], shuffle(a){ const b = a.slice(); for (let i = b.length - 1; i > 0; i--){ const j = Math.floor(rng() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; }, reactions: deps.reactions, bank: deps.bank };
}
function smilesOk(s){
  if (typeof s !== 'string' || !s.length) return false;
  let depth = 0; const rings = {};
  for (let i = 0; i < s.length; i++){
    const c = s[i];
    if (c === '(') depth++;
    else if (c === ')'){ depth--; if (depth < 0) return false; }
    else if (c === '['){ const j = s.indexOf(']', i); if (j < 0) return false; i = j; }
    else if (c >= '0' && c <= '9') rings[c] = (rings[c] || 0) + 1;
  }
  if (depth !== 0) return false;
  for (const k in rings) if (rings[k] % 2) return false;
  return true;
}
const ROOTS = ['l2-bully', 'l1-groups'];
function finish(o){ return Object.assign({ home: HOME, roots: ROOTS, reagent: null, prod: null, sub: null }, o); }

// Which layer does this compound end up in after this wash?
export function genLayer(api){
  const wash = api.pick(WASHES.filter(w => w.pulls.length));
  const moving = COMPOUNDS.filter(c => wash.pulls.indexOf(c.kind) >= 0);
  const staying = COMPOUNDS.filter(c => wash.pulls.indexOf(c.kind) < 0);
  const c = api.pick(api.rng() < 0.5 && moving.length ? moving : staying);
  const inAq = layerOf(c, wash) === 'aqueous';
  const choices = api.shuffle([
    { text: 'The aqueous layer, as a salt', ok: inAq },
    { text: 'The organic layer, unchanged', ok: !inAq },
    { text: 'Split evenly between the two layers', ok: false },
    { text: 'It reacts and is destroyed by the wash', ok: false }
  ]);
  return finish({
    kind: 'layer', sub: c.smi,
    stem: 'An organic solution of ' + c.name + ' is shaken with ' + wash.label + '. Where does the ' + c.name + ' end up?',
    choices: choices.map(x => ({ text: x.text, smiles: null })),
    correct: choices.findIndex(x => x.ok),
    coach: (inAq ? c.name + ' moves into the water. ' : c.name + ' stays in the organic layer. ') + wash.why + ' It is ' + c.note + '.'
  });
}

// Which wash separates these two?
export function genWash(api){
  const pairs = [
    { a: 'benzoic', b: 'toluene', wash: 'nahco3', alt: ['naoh'] },
    { a: 'benzoic', b: 'phenol', wash: 'nahco3', alt: [] },
    { a: 'aniline', b: 'toluene', wash: 'hcl', alt: [] },
    { a: 'phenol', b: 'anisole', wash: 'naoh', alt: [] },
    { a: 'hexanoic', b: 'octane', wash: 'nahco3', alt: ['naoh'] }
  ];
  const p = api.pick(pairs);
  const A = COMPOUNDS.find(c => c.id === p.a), B = COMPOUNDS.find(c => c.id === p.b);
  const right = WASHES.find(w => w.id === p.wash);
  const others = WASHES.filter(w => w.id !== p.wash && p.alt.indexOf(w.id) < 0);
  const opts = api.shuffle([{ text: right.label, ok: true }].concat(others.slice(0, 3).map(w => ({ text: w.label, ok: false }))));
  return finish({
    kind: 'wash', sub: A.smi,
    stem: A.name + ' and ' + B.name + ' are dissolved together in ether. Which wash pulls only the ' + A.name + ' into the water layer?',
    choices: opts.map(x => ({ text: x.text, smiles: null })),
    correct: opts.findIndex(x => x.ok),
    coach: right.why + ' ' + B.name + ' is ' + B.note + ', so it is untouched and stays in the ether.'
  });
}

// Which spot ran higher?
export function genRf(api){
  const two = api.shuffle(SPOTS).slice(0, 2).sort((x, y) => x.pol - y.pol);
  const hi = two[0], lo = two[1];
  const first = api.rng() < 0.5 ? hi : lo;
  const second = first === hi ? lo : hi;
  const opts = api.shuffle([
    { text: first.name, ok: first === hi }, { text: second.name, ok: second === hi },
    { text: 'They run together, polarity does not affect Rf', ok: false },
    { text: 'Whichever is heavier runs higher', ok: false }
  ]);
  return finish({
    kind: 'rf', sub: hi.smi,
    stem: first.name + ' and ' + second.name + ' are spotted on the same silica plate. Which one has the higher Rf?',
    choices: opts.map(x => ({ text: x.text, smiles: null })),
    correct: opts.findIndex(x => x.ok),
    coach: 'Silica is polar, so the more polar compound sticks and crawls. ' + lo.name + ' is the more polar one (' + lo.why + '), so ' + hi.name + ' rides higher: Rf about ' + hi.rf.toFixed(2) + ' against ' + lo.rf.toFixed(2) + '.'
  });
}

// Simple or fractional?
export function genDistil(api){
  const d = api.pick(DISTIL);
  const gap = Math.abs(d.bb - d.ba);
  const opts = api.shuffle([
    { text: 'Simple distillation', ok: d.kind === 'simple' },
    { text: 'Fractional distillation', ok: d.kind === 'fractional' },
    { text: 'Recrystallization', ok: false },
    { text: 'Extraction with aqueous base', ok: false }
  ]);
  return finish({
    kind: 'distil',
    stem: 'You need to separate ' + d.a + ' (boiling point ' + d.ba + ' C) from ' + d.b + ' (boiling point ' + d.bb + ' C). Which technique?',
    choices: opts.map(x => ({ text: x.text, smiles: null })),
    correct: opts.findIndex(x => x.ok),
    coach: 'The gap is ' + gap + ' degrees. ' + d.why + ' Neither compound is ionic here, so a wash would not sort them, and both are liquids, so recrystallization is not the tool.'
  });
}

// Which layer is on top?
export function genDensity(api){
  const s = api.pick(SOLVENTS);
  const opts = api.shuffle([
    { text: 'The ' + s.name + ' layer is on top', ok: s.top },
    { text: 'The water layer is on top', ok: !s.top },
    { text: 'They do not separate into layers', ok: false },
    { text: 'It depends on which compound is dissolved in them', ok: false }
  ]);
  return finish({
    kind: 'density', sub: s.smi,
    stem: s.name.charAt(0).toUpperCase() + s.name.slice(1) + ' is shaken with water in a separatory funnel. Which layer sits on top?',
    choices: opts.map(x => ({ text: x.text, smiles: null })),
    correct: opts.findIndex(x => x.ok),
    coach: 'Density decides which layer floats, and nothing else does. ' + s.name.charAt(0).toUpperCase() + s.name.slice(1) + ' has a density of about ' + s.d + ', water is 1.00, so the ' + (s.top ? s.name + ' floats' : 'water floats and the ' + s.name + ' sinks') + '. Drain from the bottom either way, and know which one you are draining.'
  });
}

const GENS = [genLayer, genWash, genRf, genDistil, genDensity];
export function gen(api){ return api.pick(GENS)(api); }

export function makeItem(api){
  const bank = api.bank && api.bank.items ? api.bank.items(HOME) : [];
  if (bank.length && api.rng() < 0.4) return api.bank.toItem(api.pick(bank));
  return gen(api);
}

/* ------------------------------------------------------------------ */
export function selfTest(deps){
  const notes = [], fail = m => notes.push(m);
  const api = tinyApi(deps, 23);
  for (const s of SMILES) if (!smilesOk(s)) fail('bad SMILES: ' + s);
  for (const c of COMPOUNDS) if (!smilesOk(c.smi)) fail('bad compound SMILES: ' + c.id);
  for (const s of SPOTS) if (!smilesOk(s.smi)) fail('bad spot SMILES: ' + s.name);

  // the chemistry the module asserts, checked against the tables
  const bicarb = WASHES.find(w => w.id === 'nahco3'), naoh = WASHES.find(w => w.id === 'naoh'), hcl = WASHES.find(w => w.id === 'hcl');
  const acid = COMPOUNDS.find(c => c.id === 'benzoic'), phen = COMPOUNDS.find(c => c.id === 'phenol'), base = COMPOUNDS.find(c => c.id === 'aniline'), neut = COMPOUNDS.find(c => c.id === 'toluene');
  if (layerOf(acid, bicarb) !== 'aqueous') fail('bicarbonate should pull a carboxylic acid');
  if (layerOf(phen, bicarb) !== 'organic') fail('bicarbonate should leave a phenol behind');
  if (layerOf(phen, naoh) !== 'aqueous') fail('hydroxide should pull a phenol');
  if (layerOf(base, hcl) !== 'aqueous') fail('HCl should pull an amine');
  if (layerOf(neut, naoh) !== 'organic' || layerOf(neut, hcl) !== 'organic') fail('a neutral should never move');
  // Rf must fall as polarity rises, with no ties
  const sorted = SPOTS.slice().sort((a, b) => a.pol - b.pol);
  for (let i = 1; i < sorted.length; i++) if (!(sorted[i].rf < sorted[i - 1].rf)) fail('Rf not falling with polarity at ' + sorted[i].name);
  for (const s of SPOTS) if (!(s.rf > 0 && s.rf < 1)) fail('Rf out of range for ' + s.name);
  // distillation calls must match the gap
  for (const d of DISTIL){ const gap = Math.abs(d.bb - d.ba); if (gap < 25 && d.kind !== 'fractional') fail('close pair called simple: ' + d.a); if (gap >= 25 && d.kind !== 'simple') fail('wide pair called fractional: ' + d.a); }
  for (const s of SOLVENTS) if ((s.d < 1) !== s.top) fail('density and float disagree for ' + s.name);

  const kinds = {};
  let tried = 0;
  for (let i = 0; i < 400; i++){
    const it = makeItem(api); tried++;
    if (!it){ fail('generator gave up at ' + i); break; }
    kinds[it.kind || 'bank'] = (kinds[it.kind || 'bank'] || 0) + 1;
    if (it.home !== HOME) fail('home is ' + it.home);
    if (!it.roots || !it.roots.length) fail('roots empty');
    if (!it.coach) fail('coach empty');
    if (!it.stem) fail('stem empty');
    if (!it.choices || it.choices.length < 4 || it.choices.length > 5) fail('choice count ' + (it.choices || []).length);
    const keys = it.choices.map(c => (c.smiles || '') + '|' + (c.text || ''));
    if (new Set(keys).size !== keys.length) fail('duplicate choices: ' + it.stem);
    if (!(it.correct >= 0 && it.correct < it.choices.length)) fail('bad correct index');
    if (it.sub && !smilesOk(it.sub)) fail('bad sub SMILES: ' + it.sub);
    for (const c of it.choices) if (c.smiles && !smilesOk(c.smiles)) fail('bad choice SMILES: ' + c.smiles);
  }
  // determinism
  const a1 = tinyApi(deps, 5), a2 = tinyApi(deps, 5);
  if (JSON.stringify(makeItem(a1)) !== JSON.stringify(makeItem(a2))) fail('not deterministic');
  if (Object.keys(kinds).length < 5) fail('only ' + Object.keys(kinds).length + ' item kinds');
  return { ok: !notes.length, tried, notes: notes.length ? notes.slice(0, 4).join('; ') : Object.keys(kinds).length + ' item kinds; washes, Rf order and distillation gaps all check out' };
}

/* ------------------------------------------------------------------ */
/* The visual                                                           */
/* ------------------------------------------------------------------ */
const CSS = `
.t7l-wrap{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:18px}
.t7l-panel{background:rgba(255,255,255,.02);border:1px solid var(--line);border-radius:12px;padding:14px}
.t7l-h{font-family:var(--mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink3);display:block;margin-bottom:8px}
.t7l-funnel{display:block;width:100%;height:auto;max-width:300px;margin:0 auto}
.t7l-row{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0}
.t7l-note{font-size:14px;color:var(--ink2);margin-top:8px;line-height:1.5}
.t7l-note b{color:var(--goldhi);font-weight:400;font-family:var(--serif);font-size:16px}
.t7l-plate{display:block;width:100%;height:auto;max-width:340px;margin:0 auto}
.t7l-legend{font-family:var(--mono);font-size:10px;letter-spacing:.08em;color:var(--ink3);text-align:center;margin-top:6px}
@media (max-width:760px){.t7l-wrap{grid-template-columns:1fr}}
`;
function injectStyle(api, id, css){ if (typeof document === 'undefined' || document.getElementById(id)) return; const s = document.createElement('style'); s.id = id; s.textContent = css; document.head.append(s); }

export function mount(slots, api){
  const { el, svg } = api, C = api.colors;
  injectStyle(api, 't7l-style', CSS);

  const wrap = el('div', { class: 't7l-wrap' });
  const left = el('div', { class: 't7l-panel' }), right = el('div', { class: 't7l-panel' });
  wrap.append(left, right); slots.visual.append(wrap);

  /* ---- the separatory funnel ---- */
  let mix = ['benzoic', 'aniline', 'toluene'], washId = 'nahco3';
  left.append(el('span', { class: 't7l-h', text: 'The separatory funnel' }));
  const funnelHolder = el('div', {});
  const mixRow = el('div', { class: 't7l-row' }), washRow = el('div', { class: 't7l-row' });
  const note = el('div', { class: 't7l-note' });
  left.append(funnelHolder, el('span', { class: 't7l-h', text: 'In the funnel' }), mixRow, el('span', { class: 't7l-h', text: 'Shake with' }), washRow, note);

  function drawFunnel(){
    funnelHolder.textContent = '';
    const wash = WASHES.find(w => w.id === washId);
    const comps = mix.map(id => COMPOUNDS.find(c => c.id === id));
    const aq = comps.filter(c => layerOf(c, wash) === 'aqueous');
    const org = comps.filter(c => layerOf(c, wash) === 'organic');
    const W = 300, H = 240;
    const s = svg('svg', { viewBox: '0 0 ' + W + ' ' + H, class: 't7l-funnel', role: 'img', 'aria-label': 'a separatory funnel with an organic layer above an aqueous layer' });
    // glass
    s.append(svg('path', { d: 'M70 20 h160 v110 l-70 70 v40 h-20 v-40 l-70 -70 z', fill: 'rgba(255,255,255,0.03)', stroke: 'rgba(201,168,76,.45)', 'stroke-width': 1.8 }));
    // ether floats: organic on top
    s.append(svg('rect', { x: 72, y: 24, width: 156, height: 52, fill: 'rgba(201,168,76,0.10)' }));
    s.append(svg('rect', { x: 72, y: 76, width: 156, height: 52, fill: 'rgba(91,141,239,0.14)' }));
    s.append(svg('line', { x1: 72, y1: 76, x2: 228, y2: 76, stroke: C.line, 'stroke-width': 1 }));
    s.append(svg('text', { x: 80, y: 42, fill: C.gold, 'font-family': 'var(--mono)', 'font-size': 9, 'letter-spacing': '.1em', text: 'ORGANIC (ETHER), TOP' }));
    s.append(svg('text', { x: 80, y: 94, fill: '#5b8def', 'font-family': 'var(--mono)', 'font-size': 9, 'letter-spacing': '.1em', text: 'AQUEOUS, BOTTOM' }));
    org.forEach((c, i) => s.append(svg('text', { x: 80, y: 58 + i * 13, fill: C.ink, 'font-family': 'Georgia, serif', 'font-size': 12, text: c.name })));
    aq.forEach((c, i) => s.append(svg('text', { x: 80, y: 110 + i * 13, fill: C.ink, 'font-family': 'Georgia, serif', 'font-size': 12, text: c.name + ' (as its salt)' })));
    s.append(svg('text', { x: W / 2, y: 232, fill: C.ink3, 'font-family': 'var(--mono)', 'font-size': 9, 'text-anchor': 'middle', 'letter-spacing': '.08em', text: 'DRAIN THE BOTTOM LAYER FIRST' }));
    funnelHolder.append(s);
    note.textContent = '';
    note.append(el('b', { text: aq.length ? aq.map(c => c.name).join(' and ') + ' moved into the water.' : 'Nothing moved.' }), ' ' + wash.why);
  }
  function rebuildRows(){
    mixRow.textContent = ''; washRow.textContent = '';
    for (const c of COMPOUNDS){
      const on = mix.indexOf(c.id) >= 0;
      mixRow.append(el('button', { type: 'button', class: 'chip' + (on ? ' on' : ''), 'aria-pressed': String(on), text: c.name, onclick: () => { const i = mix.indexOf(c.id); if (i >= 0){ if (mix.length > 1) mix.splice(i, 1); } else if (mix.length < 4) mix.push(c.id); rebuildRows(); drawFunnel(); } }));
    }
    for (const w of WASHES){
      const on = w.id === washId;
      washRow.append(el('button', { type: 'button', class: 'chip' + (on ? ' on' : ''), 'aria-pressed': String(on), text: w.label, onclick: () => { washId = w.id; rebuildRows(); drawFunnel(); } }));
    }
  }
  rebuildRows(); drawFunnel();

  /* ---- the TLC plate ---- */
  let plate = ['octane', 'acetone', 'benzoic acid'];
  right.append(el('span', { class: 't7l-h', text: 'The TLC plate: polar sticks, nonpolar rides' }));
  const plateHolder = el('div', {});
  const spotRow = el('div', { class: 't7l-row' });
  const plateNote = el('div', { class: 't7l-note' });
  right.append(plateHolder, spotRow, plateNote);

  function drawPlate(){
    plateHolder.textContent = '';
    const W = 340, H = 250, base = 210, front = 40;
    const s = svg('svg', { viewBox: '0 0 ' + W + ' ' + H, class: 't7l-plate', role: 'img', 'aria-label': 'a thin layer chromatography plate with spots at different heights' });
    s.append(svg('rect', { x: 40, y: 20, width: 260, height: 210, rx: 4, fill: 'rgba(255,255,255,0.03)', stroke: C.line, 'stroke-width': 1.2 }));
    s.append(svg('line', { x1: 40, y1: base, x2: 300, y2: base, stroke: C.ink3, 'stroke-width': 1, 'stroke-dasharray': '4 3' }));
    s.append(svg('text', { x: 44, y: base + 14, fill: C.ink3, 'font-family': 'var(--mono)', 'font-size': 9, text: 'baseline' }));
    s.append(svg('line', { x1: 40, y1: front, x2: 300, y2: front, stroke: C.gold, 'stroke-width': 1, 'stroke-dasharray': '4 3' }));
    s.append(svg('text', { x: 44, y: front - 6, fill: C.gold, 'font-family': 'var(--mono)', 'font-size': 9, text: 'solvent front' }));
    const chosen = plate.map(n => SPOTS.find(x => x.name === n)).filter(Boolean);
    chosen.forEach((sp, i) => {
      const x = 80 + i * (200 / Math.max(1, chosen.length - 1 || 1));
      const y = base - sp.rf * (base - front);
      s.append(svg('circle', { cx: x, cy: base, r: 3, fill: C.ink3 }));
      s.append(svg('line', { x1: x, y1: base, x2: x, y2: y, stroke: C.line, 'stroke-width': 1, 'stroke-dasharray': '2 3' }));
      s.append(svg('ellipse', { cx: x, cy: y, rx: 11, ry: 7, fill: 'rgba(201,168,76,0.30)', stroke: C.gold, 'stroke-width': 1.2 }));
      // a spot near the solvent front would collide with that label, so drop its Rf under the spot
      const labelY = sp.rf > 0.8 ? y + 19 : y - 12;
      s.append(svg('text', { x: x, y: labelY, fill: C.goldhi, 'font-family': 'var(--mono)', 'font-size': 10, 'text-anchor': 'middle', text: 'Rf ' + sp.rf.toFixed(2) }));
      s.append(svg('text', { x: x, y: base + 26, fill: C.ink2, 'font-family': 'Georgia, serif', 'font-size': 11, 'text-anchor': 'middle', text: sp.name }));
    });
    plateHolder.append(s);
    plateHolder.append(el('div', { class: 't7l-legend', text: 'RF IS SPOT DISTANCE OVER SOLVENT DISTANCE' }));
    const most = chosen.slice().sort((a, b) => b.pol - a.pol)[0];
    plateNote.textContent = '';
    if (most) plateNote.append(el('b', { text: most.name + ' sits lowest.' }), ' ' + most.why.charAt(0).toUpperCase() + most.why.slice(1) + ', and silica is polar, so it grips hardest and moves least.');
  }
  function rebuildSpots(){
    spotRow.textContent = '';
    for (const sp of SPOTS){
      const on = plate.indexOf(sp.name) >= 0;
      spotRow.append(el('button', { type: 'button', class: 'chip' + (on ? ' on' : ''), 'aria-pressed': String(on), text: sp.name, onclick: () => { const i = plate.indexOf(sp.name); if (i >= 0){ if (plate.length > 1) plate.splice(i, 1); } else if (plate.length < 4) plate.push(sp.name); rebuildSpots(); drawPlate(); } }));
    }
  }
  rebuildSpots(); drawPlate();

  /* ---- you try ---- */
  let item = null, picked = -1, done = false;
  const box = el('div', { class: 'item' });
  slots.try.append(box);
  function render(){
    box.textContent = '';
    box.append(el('p', { class: 'prompt', text: item.stem }));
    if (item.sub){ const b = el('div', { class: 'box', style: { display: 'inline-block', marginBottom: '10px' } }); api.drawSmiles(b, item.sub, { width: 200, height: 120 }); box.append(b); }
    const opts = el('div', { class: 'opts' });
    item.choices.forEach((c, i) => {
      opts.append(el('button', { type: 'button', class: 'opt' + (picked === i ? ' picked' : '') + (done && i === item.correct ? ' ok' : ''), disabled: done ? '' : null, onclick: () => { picked = i; commit(); }, }, el('span', { class: 'k', text: 'ABCD'[i] }), el('span', { text: c.text })));
    });
    box.append(opts);
    if (done){
      const ok = picked === item.correct;
      box.append(el('div', { class: 'verdict ' + (ok ? 'good' : 'notyet'), text: ok ? 'You can read it.' : 'Not yet.' }));
      box.append(el('button', { type: 'button', class: 'primary', text: 'Another one', onclick: next }));
    }
  }
  let first = true;
  function commit(){
    const ok = picked === item.correct;
    if (first){ api.report(ok); first = false; }
    if (ok){ done = true; api.clearCoach(); } else api.coach(item.coach);
    render();
  }
  function next(){ item = gen(api); picked = -1; done = false; first = true; api.clearCoach(); render(); }
  next();
}
