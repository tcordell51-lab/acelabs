// The Tree of Organic, Level 5: Follow the arrows.
// Curved arrows: predict the product, one of the item types the 2026 DAT organic spec names. The
// visual is drawn by mechdraw.js through the api; the you-try is the authored,
// RDKit-proven 2026 set for this module (scripts/ochem2026), served five
// choices at a time by api.mountSet. Generated from one template so the six
// 2026 modules behave the same. No imports (contract).

export const meta = { "id": "t5-arrows-forward", "level": 5, "order": 2, "needs3D": false, "ownsSet": true, "title": "Follow the arrows", "concept": "Curved arrows: predict the product", "tagline": "The arrows are a sentence. Read it and the product writes itself.", "story": "On the 2026 test they hand you the arrows and ask what they make. That is a gift, because a curved arrow is a sentence with a subject and an object. The tail sits on electrons, a lone pair or a bond, and those are the rich thing. The head points where those two electrons go, toward the poor thing: a new bond, or onto an atom as a lone pair. Something electron rich attacks something electron poor, every single time. So you never memorize the product. You do exactly what each arrow says, one at a time, then recount the charges. Rule of thumb: tail on electrons, head where they land, and every arrow breaks one thing or makes one thing.", "moveName": "Do each arrow, then recount charges", "move": [ "Find the tail of the first arrow. It must start on a lone pair or a bond, never on an atom or a plus sign.", "Follow it to the head: a new bond forms there, or the pair lands on that atom as a lone pair.", "Do the next arrow the same way. A bond an arrow starts from loses those two electrons.", "Recount charges: the atom that gave away a lone pair gets more positive, the atom that caught a pair gets more negative.", "Check every carbon has four bonds. If an answer has a carbon with five, it is a trap." ], "trap": "Careful: the arrow shows electrons moving, not atoms. If you move a hydrogen or a methyl along the arrow instead of the electrons, you will pick the product with the charge on the wrong atom.", "holdsUp": [ "Every mechanism question", "Resonance structures", "Proton transfers", "Carbonyl additions", "SN2 and E2" ], "drill": "Booster OChem: Mechanisms" };

export const SMILES = [];
const HOME = 't5-arrows-forward';
const ROOTS = [ "l2-arrows", "l1-charge" ];
export const VISUAL = {"type":"stepper","chains":[{"name":"SN2: attack, kick it off","chip":"SN2","steps":[{"name":"one step","species":[{"smi":"[OH-]"},{"smi":"CCBr"}],"arrows":[{"from":{"lp":"0.0"},"to":{"bond":["0.0","1.1"]}},{"from":{"bond":["1.1","1.2"]},"to":{"atom":"1.2"}}],"say":"Two arrows, read like sentences. The lone pair on hydroxide, the rich one, attacks the carbon that bromine is making poor, and that becomes the new C to O bond. At the same moment the C to Br bond walks off onto bromine. Attack, kick it off, attach."}],"product":[{"smi":"CCO"},{"smi":"[Br-]"}]},{"name":"Acid opens the door: E1 from an alcohol","chip":"E1 from an alcohol","steps":[{"name":"proton transfer","species":[{"smi":"CC(C)(C)O"},{"smi":"[H][OH2+]"}],"arrows":[{"from":{"lp":"0.4"},"to":{"bond":["0.4","1.0"]}},{"from":{"bond":["1.0","1.1"]},"to":{"atom":"1.1"}}],"drops":["O"],"say":"The first arrow is usually a proton. The oxygen lone pair reaches for the hydrogen on hydronium, and the old O to H bond drops back onto the water. Now the OH is wearing a plus sign, and a plus sign means it wants to leave."},{"name":"the leaving group leaves","species":[{"smi":"CC(C)(C)[OH2+]"}],"arrows":[{"from":{"bond":["0.1","0.4"]},"to":{"atom":"0.4"}}],"say":"One arrow, from the C to O bond onto the oxygen. Water walks away as a neutral molecule, which is why acid turns a terrible leaving group into a great one. What is left is a flat tertiary carbocation, electron poor, the valley in the middle of the diagram."},{"name":"a base takes a beta hydrogen","species":[{"smi":"[H]C[C+](C)C"},{"smi":"O"}],"arrows":[{"from":{"lp":"1.0"},"to":{"bond":["1.0","0.0"]}},{"from":{"bond":["0.0","0.1"]},"to":{"bond":["0.1","0.2"]}}],"say":"Water grabs a hydrogen on the carbon next door, and the C to H bond swings over to become the new pi bond, filling the empty spot on the plus carbon. Three steps, one alkene."}],"product":[{"smi":"C=C(C)C"},{"smi":"[OH3+]"}]},{"name":"Cyanide adds to a ketone","chip":"Carbonyl addition","steps":[{"name":"attack the carbonyl carbon","species":[{"smi":"[C-]#N"},{"smi":"CC(C)=O"}],"arrows":[{"from":{"lp":"0.0"},"to":{"bond":["0.0","1.1"]}},{"from":{"bond":["1.1","1.3"]},"to":{"atom":"1.3"}}],"say":"The carbonyl oxygen is the electron bully, so the carbonyl carbon is partially positive. The cyanide lone pair attacks it, and the pi bond has nowhere to go but up onto oxygen."},{"name":"protonate the alkoxide","species":[{"smi":"CC(C)(C#N)[O-]"},{"smi":"[H]C#N"}],"adds":["C#N"],"arrows":[{"from":{"lp":"0.5"},"to":{"bond":["0.5","1.0"]}},{"from":{"bond":["1.0","1.1"]},"to":{"atom":"1.1"}}],"say":"The negative oxygen takes a proton from HCN, which hands back a fresh cyanide. That is why only a little base is needed: the catalyst comes back."}],"product":[{"smi":"CC(C)(C#N)O"},{"smi":"[C-]#N"}]}]};

/* ------------------------------------------------------------------ */
function setOf(api){ return (api && api.sets && api.sets[HOME]) || []; }
/** One authored 2026 item for the Summit, or null when the set is not built. */
export function makeItem(api){
  const set = setOf(api);
  if (!set.length) return null;
  const it = api.pick(set);
  return Object.assign({}, it, { source: 'ochem-2026', home: HOME, roots: it.roots && it.roots.length ? it.roots : ROOTS, choices: it.choices.slice() });
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
  api.mountSet(slots.try, setOf(api), { title: "Predict the product" });
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
