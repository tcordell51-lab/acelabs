// The Tree of Organic, Level 5: The whole mechanism.
// Combined mechanisms, one of the item types the 2026 DAT organic spec names. The
// visual is drawn by mechdraw.js through the api; the you-try is the authored,
// RDKit-proven 2026 set for this module (scripts/ochem2026), served five
// choices at a time by api.mountSet. Generated from one template so the six
// 2026 modules behave the same. No imports (contract).

export const meta = { "id": "t5-mech-chain", "level": 5, "order": 12, "needs3D": false, "ownsSet": true, "title": "The whole mechanism", "concept": "Combined mechanisms", "tagline": "Big mechanisms are small moves in a row: proton on, attack, kick it off, proton off.", "story": "A combined mechanism looks scary because it is long, but it is only four or five moves you already own, chained together. In acid, the first arrow is almost always a proton going on, and the last is a proton coming off. In base, the first arrow is often the base pulling an alpha hydrogen to make an enolate. In between sits the real event: something rich attacks something poor, and maybe something gets kicked off. When the test asks for the intermediate after step two, do not jump to the product. Walk it one step at a time, like counting stairs. Rule of thumb: name each step before you draw it, and the arrows follow.", "moveName": "Name each step, then draw only that step", "move": [ "Ask acid or base. Acid: proton on first, proton off last. Base: deprotonate first.", "Name the main event: addition, substitution, elimination, or a shift.", "Draw one step at a time and write the intermediate before moving on.", "Check the charges add up at every intermediate, not just at the end.", "Match the step the question asks about. Most traps are the product or an intermediate one step early." ], "trap": "Careful: in acid, nothing ever carries a full negative charge, and in base, nothing carries a free plus on carbon. An intermediate that breaks that rule is a distractor.", "holdsUp": [ "Hydration and dehydration", "Acetals and esters", "Aldol and Claisen", "Rearrangements", "SN1 and E1" ], "drill": "Booster OChem: Mechanisms" };

export const SMILES = [];
const HOME = 't5-mech-chain';
const ROOTS = [ "l2-arrows", "l2-carbocation", "l2-acidity" ];
export const VISUAL = {"type":"stepper","chains":[{"name":"Acid-catalyzed hydration","chip":"Hydration","steps":[{"name":"protonate the alkene","species":[{"smi":"C=C(C)C"},{"smi":"[H][OH2+]"}],"arrows":[{"from":{"bond":["0.0","0.1"]},"to":{"bond":["0.0","1.0"]}},{"from":{"bond":["1.0","1.1"]},"to":{"atom":"1.1"}}],"say":"The pi bond is the rich thing here and the proton is poor. The pi electrons reach for the hydrogen on the end carbon, Markovnikov, so the plus lands on the carbon with the most neighbors."},{"name":"water attacks the cation","species":[{"smi":"C[C+](C)C"},{"smi":"O"}],"arrows":[{"from":{"lp":"1.0"},"to":{"bond":["1.0","0.1"]}}],"say":"A carbocation is an empty spot. Any lone pair in the flask fills it, and water is everywhere. One arrow, and the oxygen now carries the plus."},{"name":"lose the extra proton","species":[{"smi":"CC(C)(C)[OH+][H]"},{"smi":"O"}],"adds":["O"],"arrows":[{"from":{"lp":"1.0"},"to":{"bond":["1.0","0.5"]}},{"from":{"bond":["0.4","0.5"]},"to":{"atom":"0.4"}}],"say":"Another water takes the extra hydrogen and the acid comes back as hydronium. Proton on, add, proton off: the three moves of every acid-catalyzed mechanism."}],"product":[{"smi":"CC(C)(C)O"},{"smi":"[OH3+]"}]},{"name":"Aldol addition","chip":"Aldol addition","steps":[{"name":"make the enolate","species":[{"smi":"[OH-]"},{"smi":"[H]CC=O"}],"arrows":[{"from":{"lp":"0.0"},"to":{"bond":["0.0","1.0"]}},{"from":{"bond":["1.0","1.1"]},"to":{"bond":["1.1","1.2"]}},{"from":{"bond":["1.2","1.3"]},"to":{"atom":"1.3"}}],"drops":["O"],"say":"Hydroxide takes an alpha hydrogen, the one next to the carbonyl, because the leftover electrons can spread onto oxygen. That spreading is resonance, and resonance is why the alpha hydrogen is acidic at all."},{"name":"the enolate attacks a second carbonyl","species":[{"smi":"C=C[O-]"},{"smi":"CC=O"}],"adds":["CC=O"],"arrows":[{"from":{"lp":"0.2"},"to":{"bond":["0.2","0.1"]}},{"from":{"bond":["0.0","0.1"]},"to":{"bond":["0.0","1.1"]}},{"from":{"bond":["1.1","1.2"]},"to":{"atom":"1.2"}}],"say":"Now the enolate is the rich thing and another aldehyde carbonyl carbon is the poor thing. The alpha carbon attacks, a new C to C bond forms, and that is the whole point of alpha-carbonyl chemistry: building carbon skeletons."},{"name":"protonate the alkoxide","species":[{"smi":"CC([O-])CC=O"},{"smi":"[H]O"}],"adds":["O"],"arrows":[{"from":{"lp":"0.2"},"to":{"bond":["0.2","1.0"]}},{"from":{"bond":["1.0","1.1"]},"to":{"atom":"1.1"}}],"say":"Water hands the alkoxide a proton and hydroxide comes back. Catalytic base, a beta-hydroxy aldehyde. Heat it and it would lose water to the enone."}],"product":[{"smi":"CC(O)CC=O"},{"smi":"[OH-]"}]}]};

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
  api.mountSet(slots.try, setOf(api), { title: "Combined mechanisms" });
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
