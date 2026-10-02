// The Tree of Organic, Level 5: The shape it actually sits in.
// Conformations and their energies, one of the item types the 2026 DAT organic spec names. The
// visual is drawn by mechdraw.js through the api; the you-try is the authored,
// RDKit-proven 2026 set for this module (scripts/ochem2026), served five
// choices at a time by api.mountSet. Generated from one template so the six
// 2026 modules behave the same. No imports (contract).

export const meta = { "id": "t5-conform", "level": 5, "order": 13, "needs3D": false, "ownsSet": true, "title": "The shape it actually sits in", "concept": "Conformations and their energies", "tagline": "Bonds spin. Groups want elbow room. The energy diagram shows the cost of crowding.", "story": "A single bond spins like an axle, so a molecule is always passing through shapes called conformations. Spin butane around its middle bond and plot the energy, and you get a wave. When the big groups line up on top of each other it is eclipsed, like a solar eclipse, and that is a peak. When they are staggered but next door it is gauche, two groups battling, a small bump. When they are opposite each other it is anti, maximum elbow room, the lowest point. Rings follow the same idea: in a chair, a big group wants to sit equatorial, out at the equator, not axial, sticking up like a sail. Rule of thumb: crowding costs energy, so the big groups go far apart.", "moveName": "Find the big groups, then give them elbow room", "move": [ "On a rotation diagram, peaks are eclipsed and valleys are staggered.", "The highest peak has the two biggest groups eclipsed; the lowest valley is anti.", "In a chair, put the biggest group equatorial. A tert-butyl group basically locks it there.", "A chair flip turns every axial group equatorial and back, but up stays up and down stays down.", "For E2 on a ring, the hydrogen and the leaving group must both be axial, trans to each other." ], "trap": "Careful: gauche is staggered, not eclipsed. It is a valley on the diagram, just a slightly higher valley than anti, so never pick gauche as the highest-energy conformation.", "holdsUp": [ "Newman projections", "Rotation energy diagrams", "Chair stability", "Cis and trans rings", "E2 on cyclohexanes" ], "drill": "Booster OChem: Conformations and Stereochemistry" };

export const SMILES = [];
const HOME = 't5-conform';
const ROOTS = [ "l3-newman", "l3-chair" ];
export const VISUAL = {"type":"conform","fig":{"kind":"rcd","yLabel":"Energy, kJ/mol","xLabel":"Dihedral angle, degrees","xTicks":["0","60","120","180","240","300","360"],"points":[{"kind":"ts","y":19},{"kind":"min","y":3.8},{"kind":"ts","y":16},{"kind":"min","y":0},{"kind":"ts","y":16},{"kind":"min","y":3.8},{"kind":"ts","y":19}]},"angles":[{"deg":0,"name":"fully eclipsed","e":"19","say":"Methyl sitting directly on top of methyl, like a solar eclipse. Two big groups battling for the same space: the highest point on the whole curve."},{"deg":60,"name":"gauche","e":"3.8","say":"The methyls are 60 degrees apart, staggered but next door. Just like on a subway, we do not want somebody sitting right next to us. A small bump, about 3.8 above anti."},{"deg":120,"name":"eclipsed, methyl on hydrogen","e":"16","say":"Each methyl eclipses a hydrogen. Eclipsed is always a peak, but a methyl on a hydrogen is not as bad as methyl on methyl."},{"deg":180,"name":"anti","e":"0","say":"The methyls as far apart as they can get, 180 degrees. Maximum elbow room, the lowest point, the conformation butane spends most of its time in."}]};

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
  api.mountSet(slots.try, setOf(api), { title: "Conformations" });
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
    // a marker riding on the curve at the chosen angle, placed by the drawn model
    const A = V.angles[at], i = A.deg / 60;
    const pt = s.mdModel.pts[i], x = pt.x, y = pt.y;
    s.append(svg('circle', { cx: x, cy: y, r: 8, fill: 'none', stroke: C.goldhi, 'stroke-width': 2 }), svg('circle', { cx: x, cy: y, r: 3.5, fill: C.goldhi }));
    cap.textContent = '';
    cap.append(el('div', { style: { fontFamily: 'Georgia, serif', color: C.goldhi, fontSize: '18px' }, text: A.deg + ' degrees: ' + A.name + (A.e === '0' ? ', the bottom of the curve' : ', about ' + A.e + ' kJ/mol above anti') }), el('p', { style: { margin: '4px 0 0', color: C.ink2, fontSize: '15px', maxWidth: '72ch', lineHeight: '1.55' }, text: A.say }));
    chips.textContent = '';
    V.angles.forEach((a, k) => chips.append(el('button', { type: 'button', class: 'chip' + (k === at ? ' on' : ''), 'aria-pressed': String(k === at), text: a.deg + ' degrees, ' + a.name, onclick: () => { at = k; draw(); } })));
  }
  draw();
}
