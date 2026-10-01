// The Tree of Organic, Level 5: Draw the arrows.
// Curved arrows: predict the arrows, one of the item types the 2026 DAT organic spec names. The
// visual is drawn by mechdraw.js through the api; the you-try is the authored,
// RDKit-proven 2026 set for this module (scripts/ochem2026), served five
// choices at a time by api.mountSet. Generated from one template so the six
// 2026 modules behave the same. No imports (contract).

export const meta = { "id": "t5-arrows-reverse", "level": 5, "order": 3, "needs3D": false, "ownsSet": true, "title": "Draw the arrows", "concept": "Curved arrows: predict the arrows", "tagline": "Compare the before and the after. The arrows are the differences.", "story": "The other direction the 2026 test asks: here is the start, here is the product, which arrows got us there? Do not guess at arrows. Play spot the difference. Circle every bond that is new, every bond that is gone, and every charge that moved. Each new bond needs an arrow pointing into it. Each broken bond needs an arrow starting from it. Then make sure every tail starts where electrons actually are, on the rich atom, and every head lands on the poor one. Hand the student the pen: you are writing the sentence this time. Rule of thumb: count the changes, and that is how many arrows you need.", "moveName": "Spot the differences, then draw one arrow per change", "move": [ "List what changed: bonds made, bonds broken, charges moved.", "Every bond that formed gets an arrow whose head points at it, coming from a lone pair or a bond on the rich partner.", "Every bond that broke gets an arrow whose tail starts on it.", "Check direction: arrows run from electrons to the place that wants them, never out of a plus sign.", "Recount charges on your arrows. If they do not match the product, one arrow is backward." ], "trap": "Careful: the most common distractor is the right arrows drawn backward, starting at the electron-poor atom. Electrons flow from rich to poor, so an arrow never starts on a carbocation or a hydrogen.", "holdsUp": [ "Arrow-drawing questions", "Resonance", "E2 timing", "Ring openings", "Mechanism free response habits" ], "drill": "Booster OChem: Mechanisms" };

export const SMILES = [];
const HOME = 't5-arrows-reverse';
const ROOTS = [ "l2-arrows", "l2-resonance" ];
export const VISUAL = {"type":"stepper","chains":[{"name":"Resonance: the enolate","chip":"Enolate resonance","steps":[{"name":"push the lone pair toward the oxygen","species":[{"smi":"CC(=O)[CH2-]"}],"arrows":[{"from":{"lp":"0.3"},"to":{"bond":["0.3","0.1"]}},{"from":{"bond":["0.1","0.2"]},"to":{"atom":"0.2"}}],"say":"Drawing arrows backward from the answer: the minus moved from carbon to oxygen, so electrons left the carbon and landed on oxygen. Start where the electrons are, the carbon lone pair, make the new C to C pi bond, and push the old C to O pi bond onto oxygen. Resonance arrows never move an atom."}],"product":[{"smi":"CC([O-])=C"}]},{"name":"E2 in one step","chip":"E2","steps":[{"name":"three arrows at once","species":[{"smi":"CC[O-]"},{"smi":"[H]CC(C)(C)Br"}],"arrows":[{"from":{"lp":"0.2"},"to":{"bond":["0.2","1.0"]}},{"from":{"bond":["1.0","1.1"]},"to":{"bond":["1.1","1.2"]}},{"from":{"bond":["1.2","1.5"]},"to":{"atom":"1.5"}}],"say":"Compare the start and the finish: a C to H bond is gone, a C to Br bond is gone, and a new pi bond appeared between them. So the arrows write themselves. Base takes the hydrogen, the C to H bond becomes the pi bond, and the C to Br bond leaves on bromine."}],"product":[{"smi":"C=C(C)C"},{"smi":"CCO"},{"smi":"[Br-]"}]},{"name":"Opening an epoxide","chip":"Epoxide opening","steps":[{"name":"attack, and the ring springs open","species":[{"smi":"C[O-]"},{"smi":"C1CO1"}],"arrows":[{"from":{"lp":"0.1"},"to":{"bond":["0.1","1.0"]}},{"from":{"bond":["1.0","1.2"]},"to":{"atom":"1.2"}}],"say":"A new C to O bond to methoxide, a broken C to O bond in the ring, and a minus on the ring oxygen. Two arrows: the lone pair attacks a ring carbon, and that carbon kicks its bond to oxygen onto oxygen. The strain of the three-membered ring is the spring."}],"product":[{"smi":"COCC[O-]"}]}]};

/* ------------------------------------------------------------------ */
function setOf(api){ return (api && api.sets && api.sets[HOME]) || []; }
/** One authored 2026 item for the Summit, or null when the set is not built. */
export function makeItem(api){
  const set = setOf(api);
  if (!set.length) return null;
  const it = api.pick(set);
  return Object.assign({}, it, { home: HOME, roots: it.roots && it.roots.length ? it.roots : ROOTS, choices: it.choices.slice() });
}

/* ------------------------------------------------------------------ */
function mulberry(seed){ let a = seed | 0; return function(){ a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const REF = /^\d+\.\d+$/;
function checkMech(st, fail, where){
  if (!st.species || !st.species.length) fail(where + ' has no species');
  for (const ar of st.arrows || []){
    const refs = [].concat(ar.from.lp || [], ar.from.e || [], ar.from.bond || [], ar.to.atom || [], ar.to.bond || []);
    if (!refs.length || !refs.every(r => REF.test(r))) fail(where + ' has a malformed arrow');
    for (const r of refs){ const s = Number(r.split('.')[0]); if (!st.species[s]) fail(where + ' arrow points at species ' + s); }
  }
}
export function selfTest(deps){
  const notes = [], fail = m => notes.push(m);
  const V = VISUAL;
  if (V.type === 'stepper') V.chains.forEach(c => { if (!c.steps.length) fail(c.name + ' empty'); c.steps.forEach((st, i) => { checkMech(st, fail, c.name + ' step ' + (i + 1)); if (!st.say) fail(c.name + ' step ' + (i + 1) + ' has no caption'); }); });
  if (V.type === 'rcd') V.diagrams.forEach(d => { const P = d.fig.points; P.forEach((p, i) => { if (p.kind === 'ts' && !(p.y > P[i - 1].y && p.y > P[i + 1].y)) fail(d.id + ' peak ' + i + ' is not a peak'); }); if (!d.say) fail(d.id + ' no caption'); });
  if (V.type === 'conform'){ const P = V.fig.points; if (P.length !== V.fig.xTicks.length) fail('ticks and points differ'); const lo = Math.min(...P.map(p => p.y)); if (P[3].y !== lo) fail('anti must be the lowest'); }
  const set = (deps && deps.sets && deps.sets[HOME]) || [];
  let tried = 0;
  const api = { rng: mulberry(7), pick(a){ return a[Math.floor(this.rng() * a.length)]; }, sets: deps && deps.sets };
  for (let i = 0; i < (set.length ? 200 : 0); i++){
    const it = makeItem(api); tried++;
    if (!it || it.choices.length !== 5) { fail('item without five choices'); break; }
    if (!(it.correct >= 0 && it.correct < 5)) fail('bad key in ' + it.id);
    if (!it.coach || !it.stem) fail('empty coach or stem in ' + it.id);
    if (new Set(it.choices.map(c => (c.text || '') + (c.smiles || '') + JSON.stringify(c.fig || null))).size !== 5) fail('duplicate choices in ' + it.id);
  }
  return { ok: !notes.length, tried, notes: notes.length ? notes.slice(0, 4).join('; ') : set.length + ' authored items, visual data sound' };
}

/* ------------------------------------------------------------------ */
export function mount(slots, api){
  const { el } = api, V = VISUAL;
  if (V.type === 'stepper') api.mountStepper(slots.visual, V.chains);
  else if (V.type === 'rcd') mountRcd(slots.visual, api, V.diagrams);
  else if (V.type === 'conform') mountConform(slots.visual, api, V);
  api.mountSet(slots.try, setOf(api), { title: "Predict the arrows" });
}

function mountRcd(slot, api, diagrams){
  const { el } = api, C = api.colors;
  let cur = diagrams[0];
  const fig = el('div', { style: { border: '1px solid var(--line)', borderRadius: '12px', padding: '10px', background: 'rgba(255,255,255,.02)' } });
  const cap = el('div', { style: { marginTop: '10px', minHeight: '4.4em' } });
  const chips = el('div', { role: 'group', 'aria-label': 'pick a diagram', style: { display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '10px' } });
  slot.append(fig, cap, chips);
  function draw(){
    fig.textContent = ''; api.drawRcd(fig, cur.fig, { label: cur.title });
    cap.textContent = '';
    cap.append(el('div', { style: { fontFamily: 'Georgia, serif', color: C.goldhi, fontSize: '18px' }, text: cur.title }), el('p', { style: { margin: '4px 0 0', color: C.ink2, fontSize: '15px', maxWidth: '72ch', lineHeight: '1.55' }, text: cur.say }));
    chips.textContent = '';
    for (const d of diagrams) chips.append(el('button', { type: 'button', class: 'chip' + (d === cur ? ' on' : ''), 'aria-pressed': String(d === cur), text: d.chip, onclick: () => { cur = d; draw(); } }));
  }
  draw();
}

function mountConform(slot, api, V){
  const { el, svg } = api, C = api.colors;
  let at = 3;
  const fig = el('div', { style: { border: '1px solid var(--line)', borderRadius: '12px', padding: '10px', background: 'rgba(255,255,255,.02)' } });
  const cap = el('div', { style: { marginTop: '10px', minHeight: '4.4em' } });
  const chips = el('div', { role: 'group', 'aria-label': 'pick a dihedral angle', style: { display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '10px' } });
  slot.append(fig, cap, chips);
  function draw(){
    fig.textContent = '';
    const s = api.drawRcd(fig, V.fig, { label: 'rotation energy of butane' });
    // a marker riding on the curve at the chosen angle
    const pts = V.fig.points, ticks = V.fig.xTicks.length;
    const A = V.angles[at], i = A.deg / 60;
    const W = 640, L = 58, R = 30, T = 30, B = 52, H = 330;
    const ys = pts.map(p => p.y), lo = Math.min(...ys), hi = Math.max(...ys), pad = (hi - lo) * 0.14;
    const y0 = lo - pad, y1 = hi + pad * 1.4;
    const x = L + (W - L - R) * (i / (ticks - 1)), y = (H - B) - (pts[i].y - y0) / (y1 - y0) * (H - B - T);
    s.append(svg('circle', { cx: x, cy: y, r: 8, fill: 'none', stroke: C.goldhi, 'stroke-width': 2 }), svg('circle', { cx: x, cy: y, r: 3.5, fill: C.goldhi }));
    cap.textContent = '';
    cap.append(el('div', { style: { fontFamily: 'Georgia, serif', color: C.goldhi, fontSize: '18px' }, text: A.deg + ' degrees: ' + A.name + ', about ' + A.e + ' kJ/mol above anti' }), el('p', { style: { margin: '4px 0 0', color: C.ink2, fontSize: '15px', maxWidth: '72ch', lineHeight: '1.55' }, text: A.say }));
    chips.textContent = '';
    V.angles.forEach((a, k) => chips.append(el('button', { type: 'button', class: 'chip' + (k === at ? ' on' : ''), 'aria-pressed': String(k === at), text: a.deg + ' degrees, ' + a.name, onclick: () => { at = k; draw(); } })));
  }
  draw();
}
