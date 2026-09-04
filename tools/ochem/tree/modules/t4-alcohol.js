// The Tree of Organic, Level 4, Module 4: The switchboard.
// Alcohols, ethers and epoxides: count the bonds to oxygen, then pick the
// reagent that moves the count or swaps the OH. No imports (contract).

export const meta = {
  id: 't4-alcohol',
  level: 4,
  order: 4,
  needs3D: false,
  title: 'The switchboard',
  concept: 'Alcohols, ethers and epoxides',
  tagline: 'Count the bonds to oxygen, then pick the reagent that moves the count.',
  story: 'Alcohol chemistry is a switchboard, and the trick that runs it is counting bonds to oxygen. A primary alcohol has one, an aldehyde has two, an acid has three. PCC is the gentle one: it adds one bond and stops at the aldehyde. Chromium Jones is the strong one: two bonds, all the way to the acid, and they hide the H2SO4 to trick you. A secondary alcohol stops at the ketone, and a tertiary alcohol will not oxidize, because there is no H on that carbon to take. Going down, NaBH4 brings a carbonyl back to the alcohol, and LiAlH4 does that and more. The other switches swap the OH: SOCl2 and PBr3 by SN2, HBr on a tertiary by SN1, acid and heat by E1, TsCl with retention, NaH then a primary halide for an ether. Rule of thumb: count the bonds to oxygen, then ask what the reagent can move.',
  moveName: 'Count the bonds to oxygen',
  move: [
    'Count bonds to oxygen on the carbon that carries the OH: alcohol one, aldehyde or ketone two, acid three.',
    'Going up: PCC adds one and stops; Jones (CrO3, H2SO4) adds two. A secondary alcohol tops out at the ketone; a tertiary alcohol has no H to lose and does not oxidize.',
    'Going down: NaBH4 takes an aldehyde or ketone to the alcohol; LiAlH4 also takes acids and esters down.',
    'Swapping the OH: SOCl2 and PBr3 go SN2 with inversion, HBr on a tertiary alcohol goes SN1, H2SO4 and heat dehydrate by E1 to the Zaitsev alkene, TsCl keeps the stereocenter and installs a leaving group.',
    'Epoxides: acid opens at the more substituted carbon, base or a Grignard opens at the less substituted carbon, always from the back.'
  ],
  trap: 'Careful: PCC stops at the aldehyde but CrO3 with H2SO4 (Jones) takes a primary alcohol all the way to the carboxylic acid, and the hidden H2SO4 is the tell.',
  holdsUp: ['Carbonyl chemistry', 'Grignard planning', 'Multi-step synthesis', 'Protecting groups', 'IR: the O-H and C=O stretches'],
  drill: 'Booster OChem: Alcohols, Ethers, & Epoxides'
};

// Every structure here is already in shared/reactions.js (the ladder molecules are all table substrates or products).
export const SMILES = [];

const HOME = 't4-alcohol';
const DEFAULT_ROOTS = ['l1-groups', 'l2-arrows'];

// ---------- the ladder (pure, node-safe) ----------
// Bonds to oxygen on the most oxidized carbon of a small, ester-free product. Checked against a hand table in selfTest.
export function oxRung(smi){
  if (/C\(=O\)O|OC\(=O\)/.test(smi)) return 3;
  if (/=O/.test(smi)) return 2;
  if (/O/.test(smi)) return 1;
  return 0;
}
export const LADDER_IDS = ['alc1_pcc', 'alc1_jones', 'alc2_pcc', 'alc2_jones', 'alc3_jones', 'ald_nabh4', 'ald_lah', 'acid_lah', 'ald_jones', 'ald_clemmensen', 'ald_wolff', 'ket_nabh4'];
const LADDER = {
  primary: { name: '1-propanol', rungs: { 0: 'CCC', 1: 'CCCO', 2: 'CCC=O', 3: 'CCC(=O)O' }, names: { 0: 'propane', 1: '1-propanol', 2: 'propanal', 3: 'propanoic acid' },
    docks: [{ id: 'alc1_pcc', label: 'PCC', from: 1, to: 2 }, { id: 'alc1_jones', label: 'Jones: CrO3, H2SO4', from: 1, to: 3 }, { id: 'ald_nabh4', label: 'NaBH4', from: 2, to: 1 }, { id: 'acid_lah', label: 'LiAlH4', from: 3, to: 1 }, { id: 'ald_clemmensen', label: 'Clemmensen: Zn(Hg), HCl', from: 2, to: 0 }] },
  secondary: { name: '2-propanol', rungs: { 1: 'CC(C)O', 2: 'CC(C)=O' }, names: { 1: '2-propanol', 2: 'acetone' }, missing: { 3: 'no rung 3: the ketone carbon has no H left to take', 0: 'rung 0 needs an executioner (Clemmensen or Wolff-Kishner)' },
    docks: [{ id: 'alc2_pcc', label: 'PCC', from: 1, to: 2 }, { id: 'alc2_jones', label: 'Jones: CrO3, H2SO4', from: 1, to: 2 }, { id: 'ket_nabh4', label: 'NaBH4', from: 2, to: 1 }] },
  tertiary: { name: 'tert-butanol', rungs: { 1: 'CC(C)(C)O' }, names: { 1: 'tert-butanol' }, missing: { 3: 'no rung 3', 2: 'no rung 2: the carbon holding the OH has no H, so nothing oxidizes', 0: 'no rung 0 by oxidation or reduction' },
    docks: [{ id: 'alc3_jones', label: 'Jones: CrO3, H2SO4', from: 1, to: 1 }] }
};
const SWITCH = [
  { id: 'alc1_socl2', label: 'SOCl2' }, { id: 'alc1_pbr3', label: 'PBr3' }, { id: 'alc3_hbr', label: 'HBr on tertiary' }, { id: 'alc1_tscl', label: 'TsCl' },
  { id: 'alc3_dehydration', label: 'H2SO4, heat' }, { id: 'alc1_williamson', label: 'NaH, then R-Br' }, { id: 'alc1_fischer', label: 'RCOOH, H+' },
  { id: 'epoxide_acid', label: 'epoxide + H3O+' }, { id: 'epoxide_base', label: 'epoxide + NaOCH3' }, { id: 'epoxide_grignard', label: 'epoxide + CH3MgBr' }
];
const RUNG_CHOICES = [
  { key: 0, text: 'Zero bonds to oxygen: an alkane carbon' },
  { key: 1, text: 'One bond to oxygen: an alcohol' },
  { key: 2, text: 'Two bonds to oxygen: an aldehyde or ketone' },
  { key: 3, text: 'Three bonds to oxygen: a carboxylic acid' }
];
const SITE_CHOICES = [
  { key: 'more', text: 'The more substituted carbon: the protonated epoxide has cation character there' },
  { key: 'less', text: 'The less substituted carbon: a plain SN2 at the open end' },
  { key: 'both', text: 'Both carbons equally' },
  { key: 'oxygen', text: 'The oxygen' }
];
export function siteOf(r){ const g = r.regio || ''; if (/more substituted/i.test(g)) return 'more'; if (/less substituted/i.test(g)) return 'less'; return null; }

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
function subName(api, r){ const s = api.reactions.SUBSTRATES[r.subClass]; return s ? s.name : 'the substrate'; }
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
  const moves = api.reactions.byFamily('alcohols').concat(api.reactions.byFamily('ethers'));
  const ladder = LADDER_IDS.map(id => api.reactions.find(id)).filter(Boolean);
  const epox = api.reactions.byFamily('ethers').filter(r => siteOf(r));
  return { moves, ladder, epox };
}
export function genProduct(api, r, pool){
  const ds = productDistractors(api, r, pool); if (!ds) return null;
  const choices = api.shuffle([{ smiles: r.prod, text: '', ok: true }].concat(ds.map(x => ({ smiles: x.prod, text: '', why: 'That is what ' + label(x) + ' gives (' + x.name.toLowerCase() + '). ' + r.thomas }))));
  const stem = r.prod === r.sub ? 'Major product? (no reaction is a legitimate answer)' : 'Major product?';
  return finish(api, r, 'product', stem, r.sub, label(r), null, choices, r.thomas);
}
export function genReagent(api, r, pool){
  const ds = reagentDistractors(api, r, pool); if (!ds) return null;
  const choices = api.shuffle([{ text: label(r), ok: true }].concat(ds.map(x => ({ text: label(x), why: label(x) + ' gives a different product: ' + x.name.toLowerCase() + '. ' + r.thomas }))));
  const stem = r.prod === r.sub ? 'Which of these leaves ' + subName(api, r) + ' untouched?' : 'Which reagent turns ' + subName(api, r) + ' into this product?';
  return finish(api, r, 'reagent', stem, r.sub, null, r.prod, choices, r.thomas);
}
export function genRung(api, r){
  const key = oxRung(r.prod);
  const choices = api.shuffle(RUNG_CHOICES.map(c => ({ text: c.text, ok: c.key === key, why: 'Count the bonds to oxygen on the product carbon. ' + r.thomas })));
  return finish(api, r, 'rung', subName(api, r) + ' with this reagent: how many bonds to oxygen does the product carbon end up with?', r.sub, label(r), null, choices, r.thomas);
}
export function genOpenCond(api, r, epox){
  const others = epox.filter(x => x.id !== r.id);
  const choices = api.shuffle([{ text: label(r), ok: true }].concat(others.map(x => ({ text: label(x), why: label(x) + ' opens it differently: ' + x.regio + '. ' + r.thomas })), [{ text: 'PCC, CH2Cl2', why: 'PCC is an oxidant, and an epoxide has nothing to oxidize; it does not open the ring. ' + r.thomas }]));
  return finish(api, r, 'openCond', 'Which conditions opened this epoxide to give this product?', r.sub, null, r.prod, choices, r.thomas);
}
export function genOpenSite(api, r){
  const key = siteOf(r); if (!key) return null;
  const choices = api.shuffle(SITE_CHOICES.map(c => ({ text: c.text, ok: c.key === key, why: 'Acid or base decides the carbon: ' + r.regio + '. ' + r.trap })));
  return finish(api, r, 'openSite', 'Propylene oxide with this reagent: which carbon does the nucleophile attack?', r.sub, label(r), null, choices, r.trap);
}
export function gen(api){
  const P = pools(api);
  for (let tries = 0; tries < 40; tries++){
    const u = api.rng();
    let it = null;
    if (u < 0.32) it = genProduct(api, api.pick(P.moves), P.moves);
    else if (u < 0.56) it = genReagent(api, api.pick(P.moves), P.moves);
    else if (u < 0.78) it = genRung(api, api.pick(P.ladder));
    else if (u < 0.89) it = genOpenCond(api, api.pick(P.epox), P.epox);
    else it = genOpenSite(api, api.pick(P.epox));
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
  const api = tinyApi(deps, 17);
  const F = deps.reactions.find;
  // the rung reader agrees with a hand table for every ladder product
  const rungs = { alc1_pcc: 2, alc1_jones: 3, alc2_pcc: 2, alc2_jones: 2, alc3_jones: 1, ald_nabh4: 1, ald_lah: 1, acid_lah: 1, ald_jones: 3, ald_clemmensen: 0, ald_wolff: 0, ket_nabh4: 1 };
  for (const id of LADDER_IDS){ const r = F(id); if (!r){ fail('missing ladder reaction ' + id); continue; } if (oxRung(r.prod) !== rungs[id]) fail(id + ' product reads rung ' + oxRung(r.prod) + ', expected ' + rungs[id]); if (oxRung(r.sub) === oxRung(r.prod) && id !== 'alc3_jones') fail(id + ' does not move the count'); }
  for (const k in LADDER) for (const d of LADDER[k].docks){ const r = F(d.id); if (!r) fail('missing dock reaction ' + d.id); else if (oxRung(r.prod) !== d.to) fail('dock ' + d.id + ' reaches rung ' + oxRung(r.prod) + ', docked at ' + d.to); }
  for (const k in LADDER) for (const n in LADDER[k].rungs){ const s = LADDER[k].rungs[n]; if (!smilesOk(s)) fail('bad ladder SMILES ' + s); if (oxRung(s) !== +n) fail('ladder rung ' + n + ' holds a rung ' + oxRung(s) + ' molecule'); }
  for (const s of SWITCH) if (!F(s.id)) fail('missing switch reaction ' + s.id);
  const P = pools(api);
  if (P.moves.length < 14 || P.ladder.length < 10 || P.epox.length !== 3) fail('pools too thin');
  if (siteOf(F('epoxide_acid')) !== 'more' || siteOf(F('epoxide_base')) !== 'less' || siteOf(F('epoxide_grignard')) !== 'less') fail('epoxide site reader disagrees with the table');
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
    const r = F(it.rid);
    if (it.kind === 'product' && it.choices[it.correct].smiles !== r.prod) fail('product answer mismatch ' + it.rid);
    if (it.kind === 'reagent' && it.choices[it.correct].text !== label(r)) fail('reagent answer mismatch ' + it.rid);
    if (it.kind === 'rung' && it.choices[it.correct].text !== RUNG_CHOICES[oxRung(r.prod)].text) fail('rung answer mismatch ' + it.rid);
    if (it.kind === 'openCond' && it.choices[it.correct].text !== label(r)) fail('opening conditions mismatch ' + it.rid);
    if (it.kind === 'openSite' && it.choices[it.correct].text !== SITE_CHOICES.find(c => c.key === siteOf(r)).text) fail('opening site mismatch ' + it.rid);
  }
  if (Object.keys(kinds).length < 5) fail('not every kind appeared: ' + JSON.stringify(kinds));
  const a = makeItem(tinyApi(deps, 8)), b = makeItem(tinyApi(deps, 8));
  if (JSON.stringify(a) !== JSON.stringify(b)) fail('not reproducible');
  return { ok: notes.length === 0, tried, notes: notes.join('; ') || ('kinds ' + Object.entries(kinds).map(([k, v]) => k + ' ' + v).join(', ')) };
}

// ---------- DOM helpers ----------
const CSS = `
.t4o-tabs{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}
.t4o-tab{min-height:40px;padding:6px 14px;border-radius:10px;border:1px solid var(--line);background:var(--card);color:var(--ink2);font-family:var(--serif);font-size:16px}
.t4o-tab[aria-selected="true"]{border-color:var(--gold);color:var(--goldhi);background:rgba(201,168,76,.12)}
.t4o-board{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px;align-items:center}
.t4o-chip{min-height:38px;padding:4px 12px;border-radius:999px;border:1px solid var(--line);background:var(--card);color:var(--ink2);font-family:var(--mono);font-size:12px}
.t4o-chip[aria-pressed="true"]{border-color:var(--gold);color:var(--ink);background:rgba(201,168,76,.14)}
.t4o-chip:hover{border-color:var(--gold)}
.t4o-ladder{display:grid;grid-template-columns:70px 200px 34px 1fr;grid-auto-rows:minmax(104px,auto);gap:0 10px;align-items:center;margin:8px 0 14px}
.t4o-rung{font-family:var(--mono);font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--ink3);line-height:1.3}
.t4o-rung b{display:block;font-family:var(--serif);font-size:26px;color:var(--ink);letter-spacing:0;text-transform:none}
.t4o-molcell{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;border-bottom:1px solid var(--line);padding:6px 0;min-height:104px}
.t4o-molcell .mol{width:auto;max-width:100%;max-height:82px}
.t4o-molcell.on{background:rgba(201,168,76,.07);border-radius:10px;border-bottom-color:transparent}
.t4o-molcell .nm{font-size:12px;color:var(--ink3)}
.t4o-missing{font-size:12px;color:var(--ink3);font-style:italic;text-align:center;padding:8px;opacity:.7}
.t4o-rail{position:relative;height:100%;min-height:104px}
.t4o-rail::before{content:'';position:absolute;left:50%;top:0;bottom:0;width:2px;background:var(--line);transform:translateX(-50%)}
.t4o-band{position:relative;align-self:stretch;justify-self:center;width:8px;border-radius:6px;opacity:0;transition:opacity .35s}
.t4o-band.in{opacity:1}
.t4o-band::after{content:'';position:absolute;left:50%;transform:translateX(-50%);border:8px solid transparent}
.t4o-band.up::after{top:-10px;border-bottom:12px solid var(--gold)}
.t4o-band.down::after{bottom:-10px;border-top:12px solid var(--blue)}
.t4o-band.flat{width:14px;border-radius:50%;align-self:center;height:14px}
.t4o-docks{display:flex;gap:6px;flex-wrap:wrap;align-items:center;padding:4px 0}
.t4o-dock{min-height:38px;padding:4px 12px;border-radius:999px;border:1px solid var(--line);background:var(--card);color:var(--ink2);font-family:var(--mono);font-size:12px}
.t4o-dock[aria-pressed="true"]{border-color:var(--gold);color:var(--ink);background:rgba(201,168,76,.14)}
.t4o-dock:hover{border-color:var(--gold)}
.t4o-dock.down{border-style:dashed}
.t4o-stage .box{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:150px;gap:4px}
.t4o-stage .box .mol{width:auto;max-width:100%;max-height:150px;display:block}
.t4o-stage .arrow .line{transition:width .45s ease-out}
.t4o-fade{opacity:0;transform:translateY(6px);transition:opacity .5s ease-out,transform .5s ease-out}
.t4o-fade.in{opacity:1;transform:none}
.t4o-badges{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
.t4o-badge{font-family:var(--mono);font-size:11px;letter-spacing:.06em;text-transform:uppercase;padding:5px 10px;border-radius:999px;border:1px solid;opacity:0;transition:opacity .4s}
.t4o-badge.in{opacity:1}
.t4o-cap{font-family:var(--serif);font-size:17px;color:var(--goldhi);margin:12px 0 0;min-height:1.4em}
.t4o-note{font-size:13px;color:var(--ink3);margin:2px 0 0;text-align:center}
.t4o-opts .opt .mol{width:auto;max-width:100%;max-height:110px;margin:0 auto}
.t4o-single{display:flex;justify-content:center}
.t4o-single .mol{width:auto;max-width:100%;max-height:150px}
@media (max-width:760px){.t4o-ladder{grid-template-columns:52px 1fr 24px 1fr}.t4o-rung b{font-size:20px}}
`;
function injectStyle(api, id, css){ if (document.getElementById(id)) return; document.head.append(api.el('style', { id, text: css })); }
function sizeMol(node, k){
  const vb = (node.getAttribute('viewBox') || '').split(/[\s,]+/).map(Number);
  if (vb.length === 4 && vb[2] > 0){ node.style.width = Math.round(vb[2] * k) + 'px'; node.style.height = 'auto'; }
  return node;
}
function mol(api, target, smiles, k, labelText){ return sizeMol(api.drawSmiles(target, smiles, { width: 240, height: 160, label: labelText || 'a molecule' }), k || 1.7); }

export function mount(slots, api){
  const { el } = api, C = api.colors;
  injectStyle(api, 't4o-style', CSS);
  const F = api.reactions.find;
  const D = api.reduced ? 0 : 1;
  const timers = [];
  const later = (fn, ms) => { if (!D){ fn(); return; } timers.push(setTimeout(fn, ms)); };
  const clearTimers = () => { while (timers.length) clearTimeout(timers.pop()); };

  // ---------- VISUAL ----------
  const tabs = el('div', { class: 't4o-tabs', role: 'tablist', 'aria-label': 'Alcohol boards' });
  const stage = el('div', { class: 't4o-stage' });
  const TABS = [['ladder', 'The bonds-to-oxygen ladder'], ['switch', 'The switchboard']];
  let tab = 'ladder', degree = 'primary', dock = 'alc1_jones', sw = 'alc1_socl2';
  const tabBtns = TABS.map(([id, name]) => el('button', { type: 'button', class: 't4o-tab', role: 'tab', 'aria-selected': 'false', text: name, onClick: () => { tab = id; build(); } }));
  tabs.append(...tabBtns);
  function badge(text, color){ return el('span', { class: 't4o-badge', text, style: { color, borderColor: color } }); }
  function rxnRow(r, subLabel){
    const row = el('div', { class: 'rxn' });
    const sb = el('div', { class: 'box' }); mol(api, sb, r.sub, 2.4, subLabel || subName(api, r)); sb.append(el('span', { class: 't4o-note', text: subLabel || subName(api, r) }));
    const line = el('div', { class: 'line', style: { width: D ? '0%' : '100%' } });
    const arrow = el('div', { class: 'arrow' }, el('span', { class: 'reagent', text: r.reagent }), line, r.cond ? el('span', { text: r.cond }) : null);
    const pb = el('div', { class: 'box q', text: '?' });
    row.append(sb, arrow, pb);
    const reveal = () => {
      const nb = el('div', { class: 'box t4o-fade' });
      mol(api, nb, r.prod, 2.4, 'product');
      if (r.prodNote) nb.append(el('span', { class: 't4o-note', text: r.prodNote }));
      pb.replaceWith(nb);
      requestAnimationFrame(() => nb.classList.add('in'));
    };
    requestAnimationFrame(() => { line.style.width = '100%'; });
    later(reveal, 420);
    return row;
  }
  function badgesFor(list){
    const wrap = el('div', { class: 't4o-badges' }, ...list.filter(x => x[0]).map(x => badge(x[0], x[1])));
    later(() => wrap.querySelectorAll('.t4o-badge').forEach((b, i) => later(() => b.classList.add('in'), i * 140)), 520);
    return wrap;
  }
  function buildLadder(){
    const L = LADDER[degree];
    if (!L.docks.some(d => d.id === dock)) dock = L.docks[0].id;
    const cur = L.docks.find(d => d.id === dock), r = F(cur.id);
    const degRow = el('div', { class: 't4o-board', role: 'group', 'aria-label': 'Pick the alcohol' });
    degRow.append(el('span', { class: 'eyebrow', text: 'alcohol' }));
    for (const k of ['primary', 'secondary', 'tertiary']) degRow.append(el('button', { type: 'button', class: 't4o-chip', 'aria-pressed': k === degree ? 'true' : 'false', text: k + ': ' + LADDER[k].name, onClick: () => { degree = k; build(); } }));
    const grid = el('div', { class: 't4o-ladder', role: 'img', 'aria-label': 'A ladder of bonds to oxygen from zero to three' });
    const rowOf = n => 4 - n;
    for (let n = 3; n >= 0; n--){
      const row = rowOf(n);
      grid.append(el('div', { class: 't4o-rung', style: { gridRow: row, gridColumn: 1 } }, el('b', { text: String(n) }), n === 1 ? 'bond to O' : 'bonds to O'));
      const cell = el('div', { class: 't4o-molcell' + (n === cur.to || n === cur.from ? ' on' : ''), style: { gridRow: row, gridColumn: 2 } });
      if (L.rungs[n]){ mol(api, cell, L.rungs[n], 1.6, L.names[n]); cell.append(el('span', { class: 'nm', text: L.names[n] })); }
      else cell.append(el('span', { class: 't4o-missing', text: (L.missing && L.missing[n]) || 'no rung' }));
      grid.append(cell);
      grid.append(el('div', { class: 't4o-rail', style: { gridRow: row, gridColumn: 3 } }));
      const docks = el('div', { class: 't4o-docks', style: { gridRow: row, gridColumn: 4 } });
      for (const d of L.docks.filter(x => x.to === n)){
        const b = el('button', { type: 'button', class: 't4o-dock' + (d.to < d.from ? ' down' : ''), 'aria-pressed': d.id === dock ? 'true' : 'false', text: d.label + (d.to === d.from ? ': no reaction' : d.to > d.from ? ' (up ' + (d.to - d.from) + ')' : ' (down ' + (d.from - d.to) + ')'), onClick: () => { dock = d.id; build(); }, onMouseenter: () => { if (dock !== d.id){ dock = d.id; build(); } } });
        docks.append(b);
      }
      if (!docks.children.length) docks.append(el('span', { class: 't4o-note', style: { textAlign: 'left' }, text: n === 1 && degree !== 'primary' ? 'start here' : '' }));
      grid.append(docks);
    }
    // the band: from the starting rung to the rung the reagent reaches
    const up = cur.to > cur.from, flat = cur.to === cur.from;
    const top = rowOf(Math.max(cur.from, cur.to)), bot = rowOf(Math.min(cur.from, cur.to));
    const band = el('div', { class: 't4o-band ' + (flat ? 'flat' : up ? 'up' : 'down'), style: { gridRow: top + ' / ' + (bot + 1), gridColumn: 3, background: flat ? C.grey : up ? 'linear-gradient(180deg,' + C.goldhi + ',' + C.gold + ')' : 'linear-gradient(180deg,' + C.blue + ',' + C.blue + ')' } });
    grid.append(band);
    later(() => band.classList.add('in'), 60);
    const subLabel = r.subClass === 'acid' ? 'acetic acid (the table example: same rung, shorter chain)' : r.subClass === 'ketone' ? '2-butanone (the table example: same rung)' : subName(api, r);
    const bandText = flat ? 'stays at rung ' + cur.from + ': no reaction' : (up ? 'up ' : 'down ') + Math.abs(cur.to - cur.from) + (Math.abs(cur.to - cur.from) === 1 ? ' bond, ' : ' bonds, ') + 'rung ' + cur.from + ' to rung ' + cur.to;
    stage.append(el('span', { class: 'eyebrow', text: 'hover or tap a reagent; it docks at the highest rung it reaches' }), degRow, grid,
      rxnRow(r, subLabel), badgesFor([[bandText, flat ? C.grey : up ? C.gold : C.blue], [r.mech, C.grey], [r.stereo, C.green]]), el('p', { class: 't4o-cap', text: r.thomas }));
  }
  function buildSwitch(){
    const board = el('div', { class: 't4o-board', role: 'group', 'aria-label': 'Pick a move' });
    for (const s of SWITCH) board.append(el('button', { type: 'button', class: 't4o-chip', 'aria-pressed': s.id === sw ? 'true' : 'false', text: s.label, onClick: () => { sw = s.id; build(); } }));
    const r = F(sw);
    const stereoColor = /inversion/i.test(r.stereo || '') ? C.coral : /retention/i.test(r.stereo || '') ? C.green : C.grey;
    stage.append(el('span', { class: 'eyebrow', text: 'the other switches: swap the OH, drop it, or open a ring' }), board, rxnRow(r),
      badgesFor([[r.mech, C.gold], [r.regio || '', C.blue], [r.stereo || '', stereoColor]]), el('p', { class: 't4o-cap', text: r.thomas }), el('p', { class: 't4o-note', style: { textAlign: 'left' }, text: r.trap }));
  }
  function build(){
    clearTimers();
    stage.replaceChildren();
    tabBtns.forEach((b, i) => b.setAttribute('aria-selected', TABS[i][0] === tab ? 'true' : 'false'));
    if (tab === 'ladder') buildLadder(); else buildSwitch();
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
      const one = el('div', { class: 't4o-single box' }); mol(api, one, it.sub, 2.1, 'the molecule'); head.append(one);
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
    const box = el('div', { class: 'opts t4o-opts' });
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
