// The Tree of Organic, Level 5: Read the drawn diagram.
// Reaction coordinate diagrams, drawn, one of the item types the 2026 DAT organic spec names. The
// visual is drawn by mechdraw.js through the api; the you-try is the authored,
// RDKit-proven 2026 set for this module (scripts/ochem2026), served five
// choices at a time by api.mountSet. Generated from one template so the six
// 2026 modules behave the same. No imports (contract).

export const meta = { "id": "t5-rcd", "level": 5, "order": 10, "needs3D": false, "ownsSet": true, "title": "Read the drawn diagram", "concept": "Reaction coordinate diagrams, drawn", "tagline": "Peaks are moments, valleys are molecules. Measure every climb from the valley before it.", "story": "The 2026 test draws the diagram and puts letters on the distances. Your job is to read it like a hiking map. Going across is progress, going up is energy. Every peak is a transition state, a moment you can never bottle. Every valley between peaks is an intermediate, a real molecule. Count the peaks and you have counted the steps. The tallest climb, measured from the valley right in front of it, is the slow step. The height of the finish line against the start is the heat of reaction, and it has nothing to do with speed. Rule of thumb: hills are speed, landings are energy, and you measure a hill from where you are standing.", "moveName": "Count peaks, measure each climb from its own valley", "move": [ "Count the peaks: that is the number of steps. Valleys between them are intermediates.", "For each step, measure from the valley in front of it up to its peak. The biggest climb is rate-determining.", "Read the landing: products below the start is exothermic, above is endothermic.", "Reverse activation energy is measured from the products up to the same peak.", "A catalyst lowers the peaks only. The start and the landing never move." ], "trap": "Careful: the highest peak on the page is not automatically the slow step. A later peak can sit higher overall but be a small climb from a high valley. Always measure the climb, not the altitude.", "holdsUp": [ "Steps and intermediates", "Rate-determining step", "Heat of reaction", "Catalysts", "Kinetic against thermodynamic", "Hammond postulate" ], "drill": "Booster OChem: The Fundamentals" };

export const SMILES = [];
const HOME = 't5-rcd';
const ROOTS = [ "l2-carbocation", "l2-arrows" ];
export const VISUAL = {"type":"rcd","diagrams":[{"id":"sn2","chip":"SN2","title":"SN2: one hill","fig":{"kind":"rcd","points":[{"kind":"start","y":0,"tag":"1"},{"kind":"ts","y":90,"tag":"2"},{"kind":"end","y":-35,"tag":"3"}],"marks":[{"from":0,"to":1,"label":"w"},{"from":0,"to":2,"label":"y","dx":22}]},"say":"One peak means one step, so no intermediate anywhere. w is the activation energy: the climb from reactants to the only transition state. y is the heat of reaction, and products below reactants means exothermic."},{"id":"sn1","chip":"SN1","title":"SN1: two hills and a valley","fig":{"kind":"rcd","points":[{"kind":"start","y":0,"tag":"1"},{"kind":"ts","y":95,"tag":"2"},{"kind":"int","y":55,"tag":"3"},{"kind":"ts","y":68,"tag":"4"},{"kind":"end","y":-30,"tag":"5"}],"marks":[{"from":0,"to":1,"label":"w"},{"from":2,"to":3,"label":"x"},{"from":0,"to":4,"label":"y","dx":22}]},"say":"Two peaks, two steps, and point 3 in the valley is the carbocation, a real intermediate. The first climb w is far bigger than the second climb x, so step one is rate-determining. Read each climb from the valley in front of it."},{"id":"cat","chip":"Add a catalyst","title":"A catalyst lowers the hill","fig":{"kind":"rcd","points":[{"kind":"start","y":0},{"kind":"ts","y":90},{"kind":"end","y":-25}],"alt":{"points":[{"kind":"start","y":0},{"kind":"ts","y":50},{"kind":"end","y":-25}],"label":"with catalyst"},"marks":[{"from":0,"to":2,"label":"y","dx":22}]},"say":"The dashed path is the catalyzed one. The hill came down, so the reaction is faster in BOTH directions. The landing y did not move: a catalyst never changes the heat of reaction or the equilibrium."},{"id":"endo","chip":"Endothermic","title":"Uphill overall","fig":{"kind":"rcd","points":[{"kind":"start","y":0,"show":true},{"kind":"ts","y":80,"show":true},{"kind":"end","y":30,"show":true}]},"say":"Products sit 30 above reactants, so the reaction absorbs heat. The forward climb is 80. The reverse climb, from products back to the peak, is only 50: for an endothermic step the reverse hill is always the smaller one."},{"id":"kt","chip":"Kinetic against thermodynamic","title":"Two products, two paths","fig":{"kind":"rcd","points":[{"kind":"start","y":0},{"kind":"ts","y":60},{"kind":"end","y":-15}],"alt":{"points":[{"kind":"start","y":0},{"kind":"ts","y":80},{"kind":"end","y":-40}],"label":"path to product B"}},"say":"The gold path to A has the lower hill, so A forms faster: the kinetic product, favored cold and short. The dashed path to B climbs higher but lands lower, so B is more stable: the thermodynamic product, favored with heat and time."}]};

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
  api.mountSet(slots.try, setOf(api), { title: "Drawn diagrams" });
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
