// The Tree of Organic, Level 4, Module 2: Twice over, plus the acidic H.
// Alkynes: two additions unless the reagent quits early, hydration through an
// enol, and the terminal sp hydrogen as an acid. No imports (contract).

export const meta = {
  id: 't4-alkyne',
  level: 4,
  order: 2,
  needs3D: false,
  title: 'Twice over, plus the acidic H',
  concept: 'Alkyne reactions',
  tagline: 'Two pi bonds means two additions, unless the reagent quits early.',
  story: 'An alkyne is an alkene with a spare pi bond, so most reagents can add twice, and the question is always: does it stop? Lindlar, L for lazy, adds one H2 and quits at the cis alkene. Sodium in ammonia is the trans maker. Platinum does not stop: two pi bonds, two H2, alkane. Water goes on once and then something sneaky happens. You get an enol, an OH sitting on a double bond, and the enol tautomerizes to the carbonyl. Mercury water puts the OH Markovnikov, so a terminal alkyne makes a methyl ketone every time; boron takes the open end and gives the aldehyde. The enol is never the answer. Last thing: the terminal sp hydrogen is acidic enough for NaNH2, and that acetylide is a carbon nucleophile you alkylate with a primary halide. Rule of thumb: ask if it stops, then ask where the oxygen sits.',
  moveName: 'Ask if it stops, then ask where the oxygen sits',
  move: [
    'Count the equivalents. One HBr stops at the vinyl bromide; two put both bromines on the same carbon, geminal.',
    'Hydrogenation: Lindlar stops at cis, Na/NH3 stops at trans, Pt does not stop.',
    'Hydration: mercury water gives the methyl ketone, boron gives the aldehyde. Both pass through an enol that tautomerizes, so never leave the enol as the answer.',
    'Terminal alkyne plus NaNH2 is acid-base, not addition. The acetylide then attacks a primary halide by SN2 to build the chain.'
  ],
  trap: 'Careful: a terminal alkyne has no cis or trans to make, so Lindlar and Na/NH3 give the same terminal alkene there; the cis versus trans question only exists for an internal alkyne.',
  holdsUp: ['Alkene additions, twice', 'Keto-enol tautomerization', 'Acetylide chain building', 'E and Z geometry', 'Multi-step synthesis'],
  drill: 'Booster OChem: Alkyne Reactions'
};

// SMILES used here that are not in shared/reactions.js (render-checked by the sheet test).
// The two enols: Markovnikov hydration of 1-butyne gives the ketone enol, hydroboration gives the aldehyde enol.
export const SMILES = ['CCC(O)=C', 'CCC=CO'];
const ENOL = { alkyne_hg_h2o: 'CCC(O)=C', alkyne_hydroboration: 'CCC=CO' };

const HOME = 't4-alkyne';
const DEFAULT_ROOTS = ['l2-carbocation', 'l3-ez'];

// ---------- reading the table (pure, node-safe) ----------
const isAlkene = s => /=/.test(s) && !/=O/.test(s) && !/#/.test(s);
export function geomOf(r){
  if (/cleavage/i.test(r.mech || '')) return 'cut';
  if (!isAlkene(r.prod)) return /^C+$/.test(r.prod) ? 'alkane' : 'none';
  if (r.subClass === 'alkyne_terminal') return 'terminal';
  if (/\bcis\b/i.test(r.stereo || '')) return 'cis';
  if (/\btrans\b/i.test(r.stereo || '')) return 'trans';
  return 'none';
}
export function carbonylOf(r){
  const p = r.prod || '';
  if (/C\(=O\)O/.test(p)) return 'acid';
  if (/=O/.test(p)) return /ketone/i.test(r.regio || '') ? 'ketone' : /aldehyde/i.test(r.regio || '') ? 'aldehyde' : 'carbonyl';
  return 'none';
}
export function timesOf(r){
  if (/cleavage/i.test(r.mech || '')) return 'cut';
  if (/acid-base/i.test(r.mech || '')) return 'acidbase';
  if (/excess|2 equiv/i.test(r.reagent || '')) return 'twice';
  return 'once';
}
const GEOM_TEXT = { cis: 'cis alkene (Z)', trans: 'trans alkene (E)', terminal: 'terminal alkene: no cis or trans', alkane: 'alkane: no alkene left', none: 'no alkene made', cut: 'no alkene: the bond is cut' };
const CARBONYL_TEXT = { ketone: 'methyl ketone (Markovnikov OH)', aldehyde: 'aldehyde (anti-Markovnikov OH)', acid: 'carboxylic acid', carbonyl: 'carbonyl', none: 'no carbonyl' };
const TIMES_TEXT = { once: 'adds once: 1 equivalent', twice: 'adds twice: 2 equivalents', acidbase: 'no addition: acid-base', cut: 'cut in two' };
const TIMES_CHOICES = [
  { key: 'once', text: 'Once. It stops after one equivalent, at the alkene or the vinyl halide.' },
  { key: 'twice', text: 'Twice. Both pi bonds are used up.' },
  { key: 'acidbase', text: 'It does not add. It takes the acidic terminal H (acid-base), and the acetylide is what reacts next.' },
  { key: 'cut', text: 'It does not add. It cuts the triple bond in two.' }
];
const GEOM_CHOICES = [
  { key: 'cis', text: 'cis (Z) alkene' },
  { key: 'trans', text: 'trans (E) alkene' },
  { key: 'alkane', text: 'No alkene: it goes all the way to the alkane' },
  { key: 'terminal', text: 'No cis or trans: the alkyne is terminal, so the alkene is terminal too' }
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
function subName(api, r){ const s = api.reactions.SUBSTRATES[r.subClass]; return s ? s.name : 'the alkyne'; }
function roots(r){ return r.roots && r.roots.length ? r.roots : DEFAULT_ROOTS; }
function productDistractors(api, r, pool){
  const seen = new Set([r.prod]), out = [];
  const sib = api.shuffle(api.reactions.siblings(r).filter(x => pool.some(p => p.id === x.id)));
  const fam = api.shuffle(pool.filter(x => x.id !== r.id && x.subClass !== r.subClass && x.prod !== r.prod));
  for (const list of [sib, fam]) for (const x of list){ if (out.length >= 3) break; if (seen.has(x.prod)) continue; seen.add(x.prod); out.push(x); }
  return out.length === 3 ? out : null;
}
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
export function pools(api){
  const all = api.reactions.byFamily('alkynes');
  // the acetylide carries a charge the renderer does not draw, so it is never a drawn choice
  const drawn = all.filter(r => !/\[C-\]/.test(r.prod));
  return {
    all, drawn,
    geom: all.filter(r => /catalytic|radical anion/i.test(r.mech || ''))
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
  const note = r.prodNote && /^(plus|two)/.test(r.prodNote) ? ' (' + r.prodNote + ')' : '';
  return finish(api, r, 'reagent', 'Which reagent turns ' + subName(api, r) + ' into this product' + note + '?', r.sub, null, r.prod, choices, r.thomas);
}
export function genTimes(api, r){
  const key = timesOf(r);
  const choices = api.shuffle(TIMES_CHOICES.map(c => ({ text: c.text, ok: c.key === key, why: 'Ask if it stops. ' + r.thomas + ' ' + r.trap })));
  return finish(api, r, 'times', 'How many times does this reagent add to ' + subName(api, r) + '?', r.sub, label(r), null, choices, r.thomas);
}
export function genGeom(api, r){
  const key = geomOf(r);
  const right = GEOM_CHOICES.find(c => c.key === key); if (!right) return null;
  const choices = api.shuffle(GEOM_CHOICES.map(c => ({ text: c.text, ok: c.key === key, why: r.thomas + ' ' + r.trap })));
  return finish(api, r, 'geom', 'What comes out of ' + subName(api, r) + ' with this reagent?', r.sub, label(r), null, choices, r.thomas);
}
export function gen(api){
  const P = pools(api);
  for (let tries = 0; tries < 40; tries++){
    const u = api.rng();
    let it = null;
    if (u < 0.35) it = genProduct(api, api.pick(P.drawn), P.drawn);
    else if (u < 0.6) it = genReagent(api, api.pick(P.drawn), P.drawn);
    else if (u < 0.8) it = genTimes(api, api.pick(P.all));
    else it = genGeom(api, api.pick(P.geom));
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
  const api = tinyApi(deps, 11);
  for (const s of SMILES) if (!smilesOk(s)) fail('bad SMILES in list: ' + s);
  const F = deps.reactions.find;
  const expect = { alkyne_lindlar: ['terminal', 'none', 'once'], alkyne_na_nh3: ['terminal', 'none', 'once'], alkyne_h2_pt: ['alkane', 'none', 'twice'], alkyne_hg_h2o: ['none', 'ketone', 'once'], alkyne_hydroboration: ['none', 'aldehyde', 'once'], alkyne_hx_once: ['terminal', 'none', 'once'], alkyne_hx_twice: ['none', 'none', 'twice'], alkyne_nanh2: ['none', 'none', 'acidbase'], alkyne_alkylation: ['none', 'none', 'acidbase'], alkyne_int_lindlar: ['cis', 'none', 'once'], alkyne_int_na: ['trans', 'none', 'once'], alkyne_int_o3: ['cut', 'acid', 'cut'] };
  for (const id in expect){
    const r = F(id); if (!r){ fail('missing reaction ' + id); continue; }
    const got = [geomOf(r), carbonylOf(r), timesOf(r)];
    if (got.join() !== expect[id].join()) fail(id + ' reads ' + got.join('/') + ', expected ' + expect[id].join('/'));
  }
  for (const id in ENOL){ if (!F(id)) fail('enol reaction missing ' + id); if (!smilesOk(ENOL[id])) fail('bad enol ' + id); }
  const P = pools(api);
  if (P.drawn.length < 8 || P.geom.length < 5) fail('pools too thin');
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
    if (it.choices.some(c => c.smiles && /\[C-\]/.test(c.smiles))) fail('charged acetylide drawn as a choice');
    const r = F(it.rid);
    if (it.kind === 'product' && it.choices[it.correct].smiles !== r.prod) fail('product answer mismatch ' + it.rid);
    if (it.kind === 'reagent' && it.choices[it.correct].text !== label(r)) fail('reagent answer mismatch ' + it.rid);
    if (it.kind === 'times' && it.choices[it.correct].text !== TIMES_CHOICES.find(c => c.key === timesOf(r)).text) fail('times answer mismatch ' + it.rid);
    if (it.kind === 'geom' && it.choices[it.correct].text !== GEOM_CHOICES.find(c => c.key === geomOf(r)).text) fail('geometry answer mismatch ' + it.rid);
  }
  if (Object.keys(kinds).length < 4) fail('not every kind appeared: ' + JSON.stringify(kinds));
  const a = makeItem(tinyApi(deps, 5)), b = makeItem(tinyApi(deps, 5));
  if (JSON.stringify(a) !== JSON.stringify(b)) fail('not reproducible');
  return { ok: notes.length === 0, tried, notes: notes.join('; ') || ('kinds ' + Object.entries(kinds).map(([k, v]) => k + ' ' + v).join(', ')) };
}

// ---------- DOM helpers ----------
const CSS = `
.t4y-tabs{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}
.t4y-tab{min-height:40px;padding:6px 14px;border-radius:10px;border:1px solid var(--line);background:var(--card);color:var(--ink2);font-family:var(--serif);font-size:16px}
.t4y-tab[aria-selected="true"]{border-color:var(--gold);color:var(--goldhi);background:rgba(201,168,76,.12)}
.t4y-board{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px}
.t4y-chip{min-height:38px;padding:4px 12px;border-radius:999px;border:1px solid var(--line);background:var(--card);color:var(--ink2);font-family:var(--mono);font-size:12px}
.t4y-chip[aria-pressed="true"]{border-color:var(--gold);color:var(--ink);background:rgba(201,168,76,.14)}
.t4y-chip:hover{border-color:var(--gold)}
.t4y-stage .box{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:150px;gap:4px}
.t4y-stage .box .mol{width:auto;max-width:100%;max-height:150px;display:block}
.t4y-stage .arrow .line{transition:width .45s ease-out}
.t4y-fade{opacity:0;transform:translateY(6px);transition:opacity .5s ease-out,transform .5s ease-out}
.t4y-fade.in{opacity:1;transform:none}
.t4y-badges{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
.t4y-badge{font-family:var(--mono);font-size:11px;letter-spacing:.06em;text-transform:uppercase;padding:5px 10px;border-radius:999px;border:1px solid;opacity:0;transition:opacity .4s}
.t4y-badge.in{opacity:1}
.t4y-cap{font-family:var(--serif);font-size:17px;color:var(--goldhi);margin:12px 0 0;min-height:1.4em}
.t4y-note{font-size:13px;color:var(--ink3);margin:2px 0 0;text-align:center}
.t4y-enol{margin-top:14px;padding:12px;border:1px dashed var(--line);border-radius:12px}
.t4y-enol .eyebrow{display:block;margin-bottom:8px}
.t4y-taut{display:grid;grid-template-columns:1fr auto 1fr;gap:10px;align-items:center}
.t4y-taut .st{background:rgba(255,255,255,.02);border:1px solid var(--line);border-radius:10px;padding:8px;display:flex;flex-direction:column;align-items:center;gap:4px;opacity:.45;transition:opacity .5s,border-color .5s}
.t4y-taut .st.on{opacity:1;border-color:var(--gold);box-shadow:0 0 0 2px rgba(201,168,76,.18)}
.t4y-taut .st .mol{width:auto;max-width:100%;max-height:120px}
.t4y-taut .st b{font-family:var(--mono);font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--ink3)}
.t4y-taut .st.on b{color:var(--goldhi)}
.t4y-taut .mid{font-family:var(--mono);font-size:12px;color:var(--goldhi);text-align:center;min-width:110px}
.t4y-taut .mid .line{width:100%;height:2px;background:var(--gold);position:relative;margin:4px 0}
.t4y-taut .mid .line::after{content:'';position:absolute;right:-1px;top:-5px;border:6px solid transparent;border-left:9px solid var(--gold)}
.t4y-opts .opt .mol{width:auto;max-width:100%;max-height:110px;margin:0 auto}
.t4y-single{display:flex;justify-content:center}
.t4y-single .mol{width:auto;max-width:100%;max-height:150px}
@media (max-width:640px){.t4y-taut{grid-template-columns:1fr}.t4y-taut .mid{min-width:0}}
`;
function injectStyle(api, id, css){ if (document.getElementById(id)) return; document.head.append(api.el('style', { id, text: css })); }
function sizeMol(node, k){
  const vb = (node.getAttribute('viewBox') || '').split(/[\s,]+/).map(Number);
  if (vb.length === 4 && vb[2] > 0){ node.style.width = Math.round(vb[2] * k) + 'px'; node.style.height = 'auto'; }
  return node;
}
function mol(api, target, smiles, k, labelText){ return sizeMol(api.drawSmiles(target, smiles, { width: 240, height: 160, label: labelText || 'a molecule' }), k || 1.7); }
// Overlay a charge badge on a renderer-drawn structure (the renderer hides charges on carbon).
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
  g.append(api.svg('circle', { cx, cy, r: R, fill: C.panel, stroke: sign === '+' ? C.coral : C.blue, 'stroke-width': '1.1' }));
  g.append(api.svg('line', { x1: cx - R * 0.55, y1: cy, x2: cx + R * 0.55, y2: cy, stroke: sign === '+' ? C.coral : C.blue, 'stroke-width': '1.2', 'stroke-linecap': 'round' }));
  if (sign === '+') g.append(api.svg('line', { x1: cx, y1: cy - R * 0.55, x2: cx, y2: cy + R * 0.55, stroke: C.coral, 'stroke-width': '1.2', 'stroke-linecap': 'round' }));
  node.append(g);
  return g;
}

export function mount(slots, api){
  const { el } = api, C = api.colors;
  injectStyle(api, 't4y-style', CSS);
  const F = api.reactions.find;
  const all = api.reactions.byFamily('alkynes');
  const CHIP = { alkyne_lindlar: 'H2, Lindlar', alkyne_na_nh3: 'Na, NH3', alkyne_h2_pt: 'H2 excess, Pt', alkyne_hg_h2o: 'H2O, H2SO4, HgSO4', alkyne_hydroboration: 'BH3, then H2O2', alkyne_hx_once: 'HBr, 1 equiv', alkyne_hx_twice: 'HBr, 2 equiv', alkyne_nanh2: 'NaNH2', alkyne_alkylation: 'NaNH2, then CH3Br', alkyne_int_lindlar: 'H2, Lindlar', alkyne_int_na: 'Na, NH3', alkyne_int_o3: 'O3, then H2O' };
  const D = api.reduced ? 0 : 1;
  const timers = [];
  const later = (fn, ms) => { if (!D){ fn(); return; } timers.push(setTimeout(fn, ms)); };
  const clearTimers = () => { while (timers.length) clearTimeout(timers.pop()); };

  // ---------- VISUAL ----------
  const tabs = el('div', { class: 't4y-tabs', role: 'tablist', 'aria-label': 'Alkyne boards' });
  const stage = el('div', { class: 't4y-stage' });
  const TABS = [['alkyne_terminal', '1-Butyne: terminal'], ['alkyne_internal', '2-Butyne: internal']];
  let tab = 'alkyne_terminal';
  const pickedBy = { alkyne_terminal: 'alkyne_hg_h2o', alkyne_internal: 'alkyne_int_lindlar' };
  const tabBtns = TABS.map(([id, name]) => el('button', { type: 'button', class: 't4y-tab', role: 'tab', 'aria-selected': 'false', text: name, onClick: () => { tab = id; build(); } }));
  tabs.append(...tabBtns);

  function badge(text, color){ return el('span', { class: 't4y-badge', text, style: { color, borderColor: color } }); }
  function rxnRow(r){
    const row = el('div', { class: 'rxn' });
    const sb = el('div', { class: 'box' }); mol(api, sb, r.sub, 2.4, subName(api, r)); sb.append(el('span', { class: 't4y-note', text: subName(api, r) }));
    const line = el('div', { class: 'line', style: { width: D ? '0%' : '100%' } });
    const arrow = el('div', { class: 'arrow' }, el('span', { class: 'reagent', text: r.reagent }), line, r.cond ? el('span', { text: r.cond }) : null);
    const pb = el('div', { class: 'box q', text: '?' });
    row.append(sb, arrow, pb);
    const reveal = () => {
      const nb = el('div', { class: 'box t4y-fade' });
      const m = mol(api, nb, r.prod, 2.4, 'product');
      if (/\[C-\]/.test(r.prod)) chargeBadge(api, m, '-', v => v.deg === 1 && v.lines === 3);
      if (r.prodNote) nb.append(el('span', { class: 't4y-note', text: r.prodNote }));
      pb.replaceWith(nb);
      requestAnimationFrame(() => nb.classList.add('in'));
    };
    requestAnimationFrame(() => { line.style.width = '100%'; });
    later(reveal, 420);
    return row;
  }
  function badgesFor(r){
    const g = geomOf(r), c = carbonylOf(r), t = timesOf(r);
    const wrap = el('div', { class: 't4y-badges' },
      badge(TIMES_TEXT[t], t === 'twice' ? C.amber : t === 'once' ? C.green : t === 'acidbase' ? C.blue : C.grey),
      badge(GEOM_TEXT[g], g === 'cis' ? C.gold : g === 'trans' ? C.blue : C.grey),
      badge(CARBONYL_TEXT[c], c === 'ketone' ? C.coral : c === 'aldehyde' ? C.gold : C.grey));
    later(() => wrap.querySelectorAll('.t4y-badge').forEach((b, i) => later(() => b.classList.add('in'), i * 140)), 520);
    return wrap;
  }
  function enolPanel(r){
    const enol = ENOL[r.id];
    const wrap = el('div', { class: 't4y-enol' });
    wrap.append(el('span', { class: 'eyebrow', text: 'inside the arrow: the enol you never write as the answer' }));
    const s1 = el('div', { class: 'st on' }, el('b', { text: 'first: the enol' })); mol(api, s1, enol, 2.0, 'enol');
    s1.append(el('span', { class: 't4y-note', text: 'OH on a double bond' }));
    const mid = el('div', { class: 'mid' }, el('span', { text: 'tautomerize' }), el('div', { class: 'line' }), el('span', { text: 'H moves, C=O forms' }));
    const s2 = el('div', { class: 'st' }, el('b', { text: 'then: the ' + (carbonylOf(r) === 'ketone' ? 'ketone' : 'aldehyde') })); mol(api, s2, r.prod, 2.0, 'carbonyl');
    s2.append(el('span', { class: 't4y-note', text: 'the real answer' }));
    const strip = el('div', { class: 't4y-taut' }, s1, mid, s2);
    const play = () => { s1.classList.add('on'); s2.classList.remove('on'); later(() => { s1.classList.remove('on'); s2.classList.add('on'); }, 1400); };
    wrap.append(strip, el('div', { class: 'controls' }, el('button', { type: 'button', class: 'secondary', text: 'Replay the tautomerization', onClick: play }), el('span', { class: 'eyebrow', text: r.trap })));
    later(play, 900);
    return wrap;
  }
  function build(){
    clearTimers();
    stage.replaceChildren();
    tabBtns.forEach((b, i) => b.setAttribute('aria-selected', TABS[i][0] === tab ? 'true' : 'false'));
    const list = all.filter(r => r.subClass === tab);
    const picked = pickedBy[tab];
    const board = el('div', { class: 't4y-board', role: 'group', 'aria-label': 'Pick a reagent' });
    for (const r of list) board.append(el('button', { type: 'button', class: 't4y-chip', 'aria-pressed': r.id === picked ? 'true' : 'false', text: CHIP[r.id] || label(r), onClick: () => { pickedBy[tab] = r.id; build(); } }));
    const r = F(picked);
    stage.append(el('span', { class: 'eyebrow', text: tab === 'alkyne_terminal' ? 'tap a reagent; ask if it stops, then where the oxygen sits' : 'internal alkyne: now cis versus trans is a real question' }), board, rxnRow(r), badgesFor(r), el('p', { class: 't4y-cap', text: r.thomas }));
    if (ENOL[r.id]) stage.append(enolPanel(r));
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
      const one = el('div', { class: 't4y-single box' }); mol(api, one, it.sub, 2.1, 'the molecule'); head.append(one);
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
    const box = el('div', { class: 'opts t4y-opts' });
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
