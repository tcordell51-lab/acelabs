// The Tree of Organic, Level 4, Module 1: Two questions, not one.
// Alkene additions: which carbon (the address) and which face (the parking)
// are separate questions, and the reagent answers both. No imports (contract).

export const meta = {
  id: 't4-alkene',
  level: 4,
  order: 1,
  needs3D: false,
  title: 'Two questions, not one',
  concept: 'Alkene additions',
  tagline: 'Which carbon, and which face. The reagent answers both.',
  story: 'Every alkene question is really two questions, and students lose points by treating them as one. First, which carbon? That is the address: Markovnikov means the new group goes to the more substituted carbon, the rich get richer. Second, which face? That is how you park: syn means both new pieces land on the same side, anti means opposite sides. Proof that they are independent: hydroboration is anti-Markovnikov and syn at the same time. Weird address, same-side parking. The reagent answers both questions for you, so name the reagent first. One more thing. A rearrangement can only happen when a free carbocation forms, so HBr and acid water are on the table, and the bridged and concerted reagents are not. Rule of thumb: address, then face, then ask whether a cation ever existed.',
  moveName: 'Ask the address, then ask the face',
  move: [
    'Name the reagent out loud. This is face recognition, not derivation.',
    'Which carbon? Markovnikov puts the new group on the more substituted carbon. Peroxide HBr and hydroboration go anti-Markovnikov.',
    'Which face? Syn is same side (hydroboration, H2, OsO4, mCPBA). Anti is opposite sides (Br2, halohydrin, oxymercuration).',
    'Did a free carbocation form? Only then look for a better neighbor and a rearrangement.'
  ],
  trap: 'Careful: anti-Markovnikov is about which carbon and anti-addition is about which face, so hydroboration can be anti-Markovnikov AND syn at the same time; the two words answer different questions.',
  holdsUp: ['Alkyne additions', 'Alcohol synthesis', 'Meso versus racemic products', 'Rearrangements', 'Multi-step synthesis'],
  drill: 'Booster OChem: Alkene Addition Reactions'
};

// SMILES used here that are not in shared/reactions.js (render-checked by the sheet test).
// The mirror of the table's OsO4 diol makes the racemic pair; the two cations are the hydride-shift states.
export const SMILES = ['C[C@H](O)[C@H](C)O', 'C[CH+]C(C)C', 'CC[C+](C)C'];

const HOME = 't4-alkene';
const DEFAULT_ROOTS = ['l2-carbocation', 'l2-arrows'];

// ---------- reading the table (pure, node-safe) ----------
// The three badges are COMPUTED from the table fields, so the visual and the items cannot disagree.
export function addressOf(r){
  if (/cleavage/i.test(r.mech || '')) return 'cut';
  const g = r.regio || '';
  if (/anti-Markovnikov/i.test(g)) return 'anti-Markovnikov';
  if (/Markovnikov|more substituted/i.test(g)) return 'Markovnikov';
  return 'none';
}
export function faceOf(r){
  if (/cleavage/i.test(r.mech || '')) return 'cut';
  const s = r.stereo || '';
  if (/\bsyn\b/i.test(s)) return 'syn';
  if (/\banti\b/i.test(s)) return 'anti';
  return 'none';
}
export function cationOf(r){
  const m = r.mech || '';
  if (/carbocation/i.test(m)) return 'free';
  if (/bridged/i.test(m)) return 'bridged';
  if (/radical/i.test(m)) return 'radical';
  if (/concerted|catalytic/i.test(m)) return 'concerted';
  return 'other';
}
const ADDRESS_TEXT = { Markovnikov: 'Markovnikov: the more substituted carbon', 'anti-Markovnikov': 'anti-Markovnikov: the less substituted carbon', none: 'no address question', cut: 'no address: the bond is cut' };
const FACE_TEXT = { syn: 'syn: same face', anti: 'anti: opposite faces', none: 'no face preference', cut: 'no face: the bond is cut' };
const CATION_TEXT = { free: 'free carbocation: rearrangement possible', bridged: 'bridged ion: no rearrangement', radical: 'radical: no rearrangement', concerted: 'concerted: no rearrangement', other: 'no carbocation' };
const CATION_CHOICES = [
  { key: 'free', text: 'Yes. A free carbocation forms, so a better neighbor can pull a rearrangement.' },
  { key: 'bridged', text: 'No. A bridged ion forms, so there is never a free cation and no rearrangement.' },
  { key: 'concerted', text: 'No. Both new bonds form together on one face, so nothing is free to move.' },
  { key: 'radical', text: 'No. It goes through a radical, not a cation.' }
];
const TWO_CHOICES = [
  { a: 'Markovnikov', f: 'syn', text: 'Markovnikov address, syn (same face)' },
  { a: 'Markovnikov', f: 'anti', text: 'Markovnikov address, anti (opposite faces)' },
  { a: 'Markovnikov', f: 'none', text: 'Markovnikov address, no face preference' },
  { a: 'anti-Markovnikov', f: 'syn', text: 'anti-Markovnikov address, syn (same face)' },
  { a: 'anti-Markovnikov', f: 'anti', text: 'anti-Markovnikov address, anti (opposite faces)' },
  { a: 'anti-Markovnikov', f: 'none', text: 'anti-Markovnikov address, no face preference' }
];

// ---------- shared helpers (duplicated per module: modules cannot import) ----------
function mulberry(seed){ let s = seed | 0; return function(){ s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
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
function label(r){
  if (!r.cond) return r.reagent;
  if (/^or /.test(r.cond)) return r.reagent + ' (' + r.cond + ')';
  return r.reagent + (/^\d\./.test(r.reagent) ? '; ' : ', ') + r.cond;
}
function subName(api, r){ const s = api.reactions.SUBSTRATES[r.subClass]; return s ? s.name : 'the alkene'; }
function roots(r){ return r.roots && r.roots.length ? r.roots : DEFAULT_ROOTS; }
// Distractor products: siblings first (same substrate, different product), then the family, never the same SMILES twice.
function productDistractors(api, r, pool){
  const seen = new Set([r.prod]), out = [];
  const sib = api.shuffle(api.reactions.siblings(r).filter(x => pool.some(p => p.id === x.id)));
  const fam = api.shuffle(pool.filter(x => x.id !== r.id && x.subClass !== r.subClass && x.prod !== r.prod));
  for (const list of [sib, fam]) for (const x of list){ if (out.length >= 3) break; if (seen.has(x.prod)) continue; seen.add(x.prod); out.push(x); }
  return out.length === 3 ? out : null;
}
// Distractor reagents: siblings first, then family reactions with a different reagent AND a different product.
function reagentDistractors(api, r, pool){
  const seen = new Set([label(r)]), out = [];
  const sib = api.shuffle(api.reactions.siblings(r).filter(x => pool.some(p => p.id === x.id)));
  const fam = api.shuffle(pool.filter(x => x.id !== r.id && x.subClass !== r.subClass && x.prod !== r.prod && x.reagent !== r.reagent));
  for (const list of [sib, fam]) for (const x of list){ if (out.length >= 3) break; const L = label(x); if (seen.has(L)) continue; seen.add(L); out.push(x); }
  return out.length === 3 ? out : null;
}
function finish(api, r, kind, stem, sub, reagent, prod, choices, coach){
  const correct = choices.findIndex(c => c.ok);
  return { kind, rid: r.id, stem, sub, reagent, prod, choices: choices.map(c => ({ text: c.text, smiles: c.smiles || null, why: c.why || null })), correct, coach, home: HOME, roots: roots(r) };
}

// ---------- generators (pure, node-safe) ----------
const isCleavage = r => /cleavage/i.test(r.mech || '');
export function pools(api){
  const all = api.reactions.byFamily('alkenes');
  return {
    all,
    // the un-rearranged sibling of the hydride-shift case is not in the table, so that one is a reagent or cation item, never a drawn-product item
    product: all.filter(r => !isCleavage(r) && r.id !== 'alkene_rearr_hbr'),
    cation: all.filter(r => !isCleavage(r) && cationOf(r) !== 'other'),
    two: all.filter(r => r.subClass === 'alkene_terminal' && addressOf(r) !== 'none' && addressOf(r) !== 'cut')
  };
}
export function genProduct(api, r, pool){
  const ds = productDistractors(api, r, pool); if (!ds) return null;
  const choices = api.shuffle([{ smiles: r.prod, text: '', ok: true }].concat(ds.map(x => ({ smiles: x.prod, text: '', why: 'That is what ' + label(x) + ' gives (' + x.name.toLowerCase() + '). ' + r.thomas }))));
  return finish(api, r, 'product', 'Major product?', r.sub, label(r), null, choices, r.thomas);
}
export function genReagent(api, r, pool){
  const ds = reagentDistractors(api, r, pool); if (!ds) return null;
  const choices = api.shuffle([{ text: label(r), ok: true }].concat(ds.map(x => ({ text: label(x), why: label(x) + ' gives a different product: ' + x.name.toLowerCase() + '. ' + r.thomas }))));
  const note = r.prodNote && /^plus /.test(r.prodNote) ? ' (' + r.prodNote + ')' : '';
  return finish(api, r, 'reagent', 'Which reagent turns ' + subName(api, r) + ' into this product' + note + '?', r.sub, null, r.prod, choices, r.thomas);
}
export function genCation(api, r){
  const key = cationOf(r);
  const choices = api.shuffle(CATION_CHOICES.map(c => ({ text: c.text, ok: c.key === key, why: 'Look at the intermediate: ' + r.mech + '. ' + r.trap })));
  return finish(api, r, 'cation', 'Does this addition go through a free carbocation?', r.sub, label(r), null, choices, r.trap);
}
export function genTwo(api, r){
  const a = addressOf(r), f = faceOf(r);
  const right = TWO_CHOICES.find(c => c.a === a && c.f === f); if (!right) return null;
  const others = api.shuffle(TWO_CHOICES.filter(c => c !== right)).slice(0, 3);
  const choices = api.shuffle([{ text: right.text, ok: true }].concat(others.map(c => ({ text: c.text, why: 'Two questions. Address: ' + ADDRESS_TEXT[a] + '. Face: ' + FACE_TEXT[f] + '. ' + r.thomas }))));
  return finish(api, r, 'two', 'Which carbon, and which face?', r.sub, label(r), null, choices, r.thomas);
}
export function gen(api){
  const P = pools(api);
  for (let tries = 0; tries < 40; tries++){
    const u = api.rng();
    let it = null;
    if (u < 0.35) it = genProduct(api, api.pick(P.product), P.all);
    else if (u < 0.6) it = genReagent(api, api.pick(P.all), P.all);
    else if (u < 0.8) it = genCation(api, api.pick(P.cation));
    else it = genTwo(api, api.pick(P.two));
    if (it) return it;
  }
  return null;
}
export function makeItem(api){
  const bank = api.bank && api.bank.items ? api.bank.items(HOME) : [];
  if (bank.length && api.rng() < 0.5) return api.bank.toItem(api.pick(bank));
  return gen(api);
}

// ---------- selfTest ----------
export function selfTest(deps){
  const notes = [], fail = m => { notes.push(m); };
  const api = tinyApi(deps, 7);
  for (const s of SMILES) if (!smilesOk(s)) fail('bad SMILES in list: ' + s);
  // the badge readers agree with what the table says in words
  const F = deps.reactions.find;
  const expect = { alkene_hbr: ['Markovnikov', 'none', 'free'], alkene_hbr_peroxide: ['anti-Markovnikov', 'none', 'radical'], alkene_h3o: ['Markovnikov', 'none', 'free'], alkene_oxymerc: ['Markovnikov', 'anti', 'bridged'], alkene_hydroboration: ['anti-Markovnikov', 'syn', 'concerted'], alkene_h2: ['none', 'syn', 'concerted'], alkene_br2: ['none', 'anti', 'bridged'], alkene_halohydrin: ['Markovnikov', 'anti', 'bridged'], alkene_mcpba: ['none', 'syn', 'concerted'], alkene_oso4: ['none', 'syn', 'concerted'], alkene_o3_zn: ['cut', 'cut', 'other'], alkene_int_br2: ['none', 'anti', 'bridged'], alkene_int_oso4: ['none', 'syn', 'concerted'], alkene_rearr_hbr: ['none', 'none', 'free'] };
  for (const id in expect){
    const r = F(id); if (!r){ fail('missing reaction ' + id); continue; }
    const got = [addressOf(r), faceOf(r), cationOf(r)];
    if (got.join() !== expect[id].join()) fail(id + ' reads ' + got.join('/') + ', expected ' + expect[id].join('/'));
  }
  const P = pools(api);
  if (P.product.length < 8 || P.cation.length < 8 || P.two.length < 5) fail('pools too thin');
  let tried = 0; const kinds = {};
  for (let i = 0; i < 400; i++){
    const it = makeItem(api); tried++;
    if (!it){ fail('generator gave up at ' + i); break; }
    kinds[it.kind] = (kinds[it.kind] || 0) + 1;
    if (it.home !== HOME) fail('home is ' + it.home);
    if (!it.roots || !it.roots.length) fail('roots empty for ' + it.rid);
    if (!it.coach) fail('coach empty for ' + it.rid);
    if (!it.stem) fail('stem empty');
    if (it.choices.length !== 4) fail('choices ' + it.choices.length + ' for ' + it.rid);
    if (!(it.correct >= 0 && it.correct < it.choices.length)) fail('correct index bad for ' + it.rid);
    const keys = it.choices.map(c => c.text + '|' + (c.smiles || ''));
    if (new Set(keys).size !== keys.length) fail('duplicate choices for ' + it.rid + ' ' + it.kind);
    for (const s of [it.sub, it.prod].concat(it.choices.map(c => c.smiles))) if (s != null && !smilesOk(s)) fail('bad SMILES ' + s);
    if (it.kind === 'product'){ const r = F(it.rid); if (it.choices[it.correct].smiles !== r.prod) fail('product answer mismatch ' + it.rid); if (it.choices.some((c, k) => k !== it.correct && c.smiles === r.prod)) fail('distractor equals product ' + it.rid); }
    if (it.kind === 'reagent'){ const r = F(it.rid); if (it.choices[it.correct].text !== label(r)) fail('reagent answer mismatch ' + it.rid); }
    if (it.kind === 'cation'){ const r = F(it.rid); const c = CATION_CHOICES.find(x => x.key === cationOf(r)); if (it.choices[it.correct].text !== c.text) fail('cation answer mismatch ' + it.rid); }
    if (it.kind === 'two'){ const r = F(it.rid); const c = TWO_CHOICES.find(x => x.a === addressOf(r) && x.f === faceOf(r)); if (it.choices[it.correct].text !== c.text) fail('two-question answer mismatch ' + it.rid); }
  }
  if (Object.keys(kinds).length < 4) fail('not every kind appeared: ' + JSON.stringify(kinds));
  const a = makeItem(tinyApi(deps, 99)), b = makeItem(tinyApi(deps, 99));
  if (JSON.stringify(a) !== JSON.stringify(b)) fail('not reproducible');
  return { ok: notes.length === 0, tried, notes: notes.join('; ') || ('kinds ' + Object.entries(kinds).map(([k, v]) => k + ' ' + v).join(', ')) };
}

// ---------- DOM helpers ----------
const CSS = `
.t4a-tabs{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}
.t4a-tab{min-height:40px;padding:6px 14px;border-radius:10px;border:1px solid var(--line);background:var(--card);color:var(--ink2);font-family:var(--serif);font-size:16px}
.t4a-tab[aria-selected="true"]{border-color:var(--gold);color:var(--goldhi);background:rgba(201,168,76,.12)}
.t4a-board{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px}
.t4a-chip{min-height:38px;padding:4px 12px;border-radius:999px;border:1px solid var(--line);background:var(--card);color:var(--ink2);font-family:var(--mono);font-size:12px}
.t4a-chip[aria-pressed="true"]{border-color:var(--gold);color:var(--ink);background:rgba(201,168,76,.14)}
.t4a-chip:hover{border-color:var(--gold)}
.t4a-stage .rxn{margin-top:4px}
.t4a-stage .box{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:150px;gap:4px}
.t4a-stage .box .mol{width:auto;max-width:100%;max-height:150px;display:block}
.t4a-stage .arrow .line{transition:width .45s ease-out}
.t4a-fade{opacity:0;transform:translateY(6px);transition:opacity .5s ease-out,transform .5s ease-out}
.t4a-fade.in{opacity:1;transform:none}
.t4a-badges{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
.t4a-badge{font-family:var(--mono);font-size:11px;letter-spacing:.06em;text-transform:uppercase;padding:5px 10px;border-radius:999px;border:1px solid;opacity:0;transition:opacity .4s}
.t4a-badge.in{opacity:1}
.t4a-cap{font-family:var(--serif);font-size:17px;color:var(--goldhi);margin:12px 0 0;min-height:1.4em}
.t4a-note{font-size:13px;color:var(--ink3);margin:2px 0 0;text-align:center}
.t4a-pair{display:flex;gap:8px;align-items:center;justify-content:center;flex-wrap:wrap}
.t4a-pair .mol{max-width:46%}
.t4a-strip{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:6px}
.t4a-state{background:rgba(255,255,255,.02);border:1px solid var(--line);border-radius:10px;padding:8px;display:flex;flex-direction:column;align-items:center;gap:6px;opacity:.45;transition:opacity .3s,border-color .3s}
.t4a-state.on{opacity:1;border-color:var(--gold);box-shadow:0 0 0 2px rgba(201,168,76,.18)}
.t4a-state .mol{width:auto;max-width:100%;max-height:120px}
.t4a-state b{font-family:var(--mono);font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--ink3)}
.t4a-state.on b{color:var(--goldhi)}
.t4a-opts .opt{grid-template-columns:34px 1fr}
.t4a-opts .opt .mol{width:auto;max-width:100%;max-height:110px;margin:0 auto}
.t4a-single{display:flex;justify-content:center}
.t4a-single .mol{width:auto;max-width:100%;max-height:150px}
@media (max-width:640px){.t4a-strip{grid-template-columns:1fr 1fr}.t4a-pair .mol{max-width:100%}}
`;
function injectStyle(api, id, css){ if (document.getElementById(id)) return; document.head.append(api.el('style', { id, text: css })); }
// Give every drawing the same bond length regardless of molecule size: SmilesDrawer sets a tight viewBox, so scale by its width.
function sizeMol(node, k){
  const vb = (node.getAttribute('viewBox') || '').split(/[\s,]+/).map(Number);
  if (vb.length === 4 && vb[2] > 0){ node.style.width = Math.round(vb[2] * k) + 'px'; node.style.height = 'auto'; }
  return node;
}
function mol(api, target, smiles, k, labelText){ return sizeMol(api.drawSmiles(target, smiles, { width: 240, height: 160, label: labelText || 'a molecule' }), k || 1.7); }
// Overlay a charge badge on a renderer-drawn structure. The renderer hides charges on carbon, so we find the
// carbon by its bond count from the <line> elements and put a coral plus next to it, away from its neighbors.
function chargeBadge(api, node, sign, pick){
  const lines = [...node.querySelectorAll('line')].map(l => ({ x1: +l.getAttribute('x1'), y1: +l.getAttribute('y1'), x2: +l.getAttribute('x2'), y2: +l.getAttribute('y2') })).filter(l => Number.isFinite(l.x1 + l.y1 + l.x2 + l.y2));
  const verts = [];
  const at = (x, y) => { for (const v of verts) if (Math.hypot(v.x - x, v.y - y) < 6) return v; const v = { x, y, nb: [] }; verts.push(v); return v; };
  for (const l of lines){ const a = at(l.x1, l.y1), b = at(l.x2, l.y2); if (a !== b){ a.nb.push(b); b.nb.push(a); } }
  for (const v of verts){ v.lines = v.nb.length; v.deg = new Set(v.nb).size; }
  const v = verts.find(pick); if (!v) return null;
  let dx = 0, dy = 0; for (const n of new Set(v.nb)){ const L = Math.hypot(n.x - v.x, n.y - v.y) || 1; dx += (n.x - v.x) / L; dy += (n.y - v.y) / L; }
  let ux = -dx, uy = -dy; const L = Math.hypot(ux, uy); if (L < 0.2){ ux = 0; uy = -1; } else { ux /= L; uy /= L; }
  const cx = v.x + ux * 9, cy = v.y + uy * 9, R = 4;
  const C = api.colors;
  const g = api.svg('g', { 'aria-label': sign === '+' ? 'positive charge' : 'negative charge' });
  g.append(api.svg('circle', { cx, cy, r: R, fill: C.panel, stroke: C.coral, 'stroke-width': '1.1' }));
  g.append(api.svg('line', { x1: cx - R * 0.55, y1: cy, x2: cx + R * 0.55, y2: cy, stroke: C.coral, 'stroke-width': '1.2', 'stroke-linecap': 'round' }));
  if (sign === '+') g.append(api.svg('line', { x1: cx, y1: cy - R * 0.55, x2: cx, y2: cy + R * 0.55, stroke: C.coral, 'stroke-width': '1.2', 'stroke-linecap': 'round' }));
  node.append(g);
  return g;
}

export function mount(slots, api){
  const { el } = api, C = api.colors;
  injectStyle(api, 't4a-style', CSS);
  const F = api.reactions.find;
  const terminal = api.reactions.byFamily('alkenes').filter(r => r.subClass === 'alkene_terminal');
  const CHIP = { alkene_hbr: 'HBr', alkene_hbr_peroxide: 'HBr, ROOR', alkene_h3o: 'H3O+', alkene_oxymerc: 'Hg(OAc)2, then NaBH4', alkene_hydroboration: 'BH3, then H2O2', alkene_h2: 'H2, Pt', alkene_br2: 'Br2', alkene_halohydrin: 'Br2, H2O', alkene_mcpba: 'mCPBA', alkene_oso4: 'OsO4', alkene_o3_zn: 'O3, then Zn', alkene_o3_h2o2: 'O3, then H2O2', alkene_kmno4_hot: 'KMnO4, hot' };
  const D = api.reduced ? 0 : 1;

  // ---------- VISUAL ----------
  const tabs = el('div', { class: 't4a-tabs', role: 'tablist', 'aria-label': 'Alkene boards' });
  const stage = el('div', { class: 't4a-stage' });
  const TABS = [['propene', 'Propene: the reagent board'], ['internal', 'trans-2-Butene: meso or racemic'], ['shift', 'The hydride shift']];
  let tab = 'propene', picked = 'alkene_hydroboration', intPick = 'alkene_int_br2', step = 1;
  const tabBtns = TABS.map(([id, name]) => el('button', { type: 'button', class: 't4a-tab', role: 'tab', 'aria-selected': 'false', text: name, onClick: () => { tab = id; build(); } }));
  tabs.append(...tabBtns);

  function badge(text, color){ return el('span', { class: 't4a-badge', text, style: { color, borderColor: color } }); }
  function rxnRow(r, prods, note){
    const row = el('div', { class: 'rxn' });
    const sb = el('div', { class: 'box' }); mol(api, sb, r.sub, 2.4, subName(api, r)); sb.append(el('span', { class: 't4a-note', text: subName(api, r) }));
    const line = el('div', { class: 'line', style: { width: D ? '0%' : '100%' } });
    const arrow = el('div', { class: 'arrow' }, el('span', { class: 'reagent', text: r.reagent }), line, r.cond ? el('span', { text: r.cond }) : null);
    const pb = el('div', { class: 'box q', text: '?' });
    row.append(sb, arrow, pb);
    const reveal = () => {
      const nb = el('div', { class: 'box t4a-fade' });
      if (prods.length === 1) mol(api, nb, prods[0], 2.4, 'product');
      else { const pair = el('div', { class: 't4a-pair' }); prods.forEach(p => mol(api, pair, p, 2.0, 'product')); nb.append(pair); }
      if (note) nb.append(el('span', { class: 't4a-note', text: note }));
      pb.replaceWith(nb);
      requestAnimationFrame(() => nb.classList.add('in'));
    };
    requestAnimationFrame(() => { line.style.width = '100%'; });
    if (D) setTimeout(reveal, 420); else reveal();
    return row;
  }
  function badgesFor(r){
    const a = addressOf(r), f = faceOf(r), c = cationOf(r);
    const wrap = el('div', { class: 't4a-badges' },
      badge(ADDRESS_TEXT[a], a === 'Markovnikov' ? C.gold : a === 'anti-Markovnikov' ? C.blue : C.grey),
      badge(FACE_TEXT[f], f === 'syn' ? C.green : f === 'anti' ? C.coral : C.grey),
      badge(c === 'free' ? 'rearrangement possible' : 'no rearrangement', c === 'free' ? C.amber : C.green));
    setTimeout(() => wrap.querySelectorAll('.t4a-badge').forEach((b, i) => setTimeout(() => b.classList.add('in'), i * 140 * D)), 520 * D);
    return wrap;
  }
  function buildPropene(){
    const board = el('div', { class: 't4a-board', role: 'group', 'aria-label': 'Pick a reagent for propene' });
    for (const r of terminal) board.append(el('button', { type: 'button', class: 't4a-chip', 'aria-pressed': r.id === picked ? 'true' : 'false', text: CHIP[r.id] || label(r), onClick: () => { picked = r.id; build(); } }));
    const r = F(picked);
    stage.append(el('span', { class: 'eyebrow', text: 'tap a reagent; the row answers both questions' }), board, rxnRow(r, [r.prod], r.prodNote || ''), badgesFor(r), el('p', { class: 't4a-cap', text: r.thomas }));
  }
  function buildInternal(){
    const rows = [['alkene_int_br2', 'Br2 (anti)'], ['alkene_int_oso4', 'OsO4 (syn)']];
    const board = el('div', { class: 't4a-board', role: 'group', 'aria-label': 'Pick a reagent for trans-2-butene' });
    for (const [id, name] of rows) board.append(el('button', { type: 'button', class: 't4a-chip', 'aria-pressed': id === intPick ? 'true' : 'false', text: name, onClick: () => { intPick = id; build(); } }));
    const r = F(intPick);
    const meso = intPick === 'alkene_int_br2';
    const prods = meso ? [r.prod] : [r.prod, 'C[C@H](O)[C@H](C)O'];
    stage.append(el('span', { class: 'eyebrow', text: 'same alkene, two faces, two different answers' }), board,
      rxnRow(r, prods, meso ? 'one compound: meso' : 'two compounds: the racemic pair'),
      (() => { const w = el('div', { class: 't4a-badges' }, badge('trans alkene', C.grey), badge(FACE_TEXT[faceOf(r)], meso ? C.coral : C.green), badge(meso ? 'meso: a mirror plane inside' : 'racemic: mirror images, both made', C.gold)); setTimeout(() => w.querySelectorAll('.t4a-badge').forEach((b, i) => setTimeout(() => b.classList.add('in'), i * 140 * D)), 520 * D); return w; })(),
      el('p', { class: 't4a-cap', text: r.thomas }),
      el('p', { class: 't4a-note', style: { textAlign: 'left', marginTop: '6px' }, text: 'Trans plus anti gives meso; trans plus syn gives the pair. Flip the alkene to cis and both answers swap. The face and the alkene geometry together decide it.' }));
  }
  function buildShift(){
    const r = F('alkene_rearr_hbr');
    const states = [
      { smi: r.sub, title: 'Start', text: '3-methyl-1-butene. The double bond is at the end, and the carbon next to it is tertiary.' },
      { smi: 'C[CH+]C(C)C', title: 'Step 1: protonate', text: r.steps[0], plus: v => v.deg === 2 },
      { smi: 'CC[C+](C)C', title: 'Step 2: hydride shift', text: r.steps[1], plus: v => v.deg === 3 },
      { smi: r.prod, title: 'Step 3: capture', text: r.steps[2] }
    ];
    const strip = el('div', { class: 't4a-strip' });
    const cap = el('p', { class: 't4a-cap' });
    const nodes = states.map((s, i) => {
      const box = el('div', { class: 't4a-state' + (i === step ? ' on' : ''), role: 'button', tabindex: '0', 'aria-label': s.title, onClick: () => { step = i; paint(); }, onKeydown: e => { if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); step = i; paint(); } } });
      box.append(el('b', { text: s.title }));
      const m = mol(api, box, s.smi, 1.9, s.title);
      if (s.plus) chargeBadge(api, m, '+', s.plus);
      return box;
    });
    strip.append(...nodes);
    function paint(){ nodes.forEach((n, i) => n.classList.toggle('on', i === step)); cap.textContent = states[step].text; }
    paint();
    const ctrl = el('div', { class: 'controls' },
      el('button', { type: 'button', class: 'secondary', text: 'Back', onClick: () => { step = Math.max(0, step - 1); paint(); } }),
      el('button', { type: 'button', class: 'primary', text: 'Next step', onClick: () => { step = Math.min(3, step + 1); paint(); } }),
      el('span', { class: 'eyebrow', text: 'or tap a state' }));
    stage.append(el('span', { class: 'eyebrow', text: 'HBr on 3-methyl-1-butene: the plus moves before the bromide arrives' }), strip, cap, ctrl,
      el('p', { class: 't4a-note', style: { textAlign: 'left', marginTop: '8px' }, text: r.thomas + ' ' + r.trap }));
  }
  function build(){
    stage.replaceChildren();
    tabBtns.forEach((b, i) => b.setAttribute('aria-selected', TABS[i][0] === tab ? 'true' : 'false'));
    if (tab === 'propene') buildPropene(); else if (tab === 'internal') buildInternal(); else buildShift();
  }
  slots.visual.append(tabs, stage);
  build();

  // ---------- YOU TRY ----------
  const bank = api.bank.items(HOME);
  let item = null, firstTry = true, done = false, n = 0;
  const tryBox = el('div', { class: 'item' });
  slots.try.append(tryBox);
  function fromBank(){ return api.bank.toItem(api.pick(bank)); }
  function drawItemHead(it){
    const head = el('div', {});
    if (it.sub && (it.reagent || it.prod)){
      const row = el('div', { class: 'rxn' });
      const sb = el('div', { class: 'box' }); mol(api, sb, it.sub, 2.1, 'starting material');
      const arrow = el('div', { class: 'arrow' }, el('span', { class: 'reagent', text: it.reagent || '?' }), el('div', { class: 'line' }));
      const pb = it.prod ? el('div', { class: 'box' }) : el('div', { class: 'box q', text: '?' });
      if (it.prod) mol(api, pb, it.prod, 2.1, 'product');
      row.append(sb, arrow, pb); head.append(row);
    } else if (it.sub){
      const one = el('div', { class: 't4a-single box' }); mol(api, one, it.sub, 2.1, 'the molecule'); head.append(one);
    }
    return head;
  }
  function next(){
    tryBox.replaceChildren(); api.clearCoach();
    const useBank = bank.length && (n % 2 === 1);
    n++;
    item = useBank ? fromBank() : gen(api);
    if (!item){ tryBox.append(el('p', { class: 'prompt', text: 'The generator could not build an item; tap Another one.' }), el('button', { class: 'primary', type: 'button', text: 'Another one', onClick: next })); return; }
    firstTry = true; done = false;
    tryBox.append(el('p', { class: 'prompt', text: item.stem }), drawItemHead(item));
    const box = el('div', { class: 'opts t4a-opts' });
    const btns = item.choices.map((c, i) => {
      const body = el('span', { style: { display: 'block' } });
      if (c.smiles) mol(api, body, c.smiles, 1.5, 'choice ' + 'ABCDE'[i]); else body.append(el('span', { text: c.text }));
      const btn = el('button', { class: 'opt', type: 'button', 'aria-label': c.text || ('structure ' + 'ABCDE'[i]) }, el('span', { class: 'k', text: 'ABCDE'[i] }), body);
      btn.addEventListener('click', () => {
        if (done) return;
        btns.forEach(x => x.classList.remove('picked')); btn.classList.add('picked');
        if (i === item.correct){
          btn.classList.add('ok'); btns.forEach(x => { x.disabled = true; });
          done = true; api.report(firstTry); api.clearCoach();
          tryBox.append(el('div', { class: 'verdict good', text: 'You can read it.' }), el('div', { class: 'controls' }, el('button', { class: 'primary', type: 'button', text: 'Another one', onClick: next })));
        } else {
          if (firstTry) api.report(false); firstTry = false;
          if (!tryBox.querySelector('.verdict')) tryBox.append(el('div', { class: 'verdict notyet', text: 'Not yet.' }));
          api.coach(c.why || item.coach);
        }
      });
      return btn;
    });
    box.append(...btns);
    tryBox.append(box);
  }
  next();
}
