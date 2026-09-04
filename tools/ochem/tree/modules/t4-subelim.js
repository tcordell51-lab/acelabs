// The Tree of Organic, Level 4, Module 3: The four questions.
// Substitution versus elimination: cross out the metal, then carbon, reagent,
// solvent, heat, and the stereo check. No imports (contract).

export const meta = {
  id: 't4-subelim',
  level: 4,
  order: 3,
  needs3D: false,
  title: 'The four questions',
  concept: 'Substitution versus elimination',
  tagline: 'Cross out the metal, then let the substrate decide.',
  story: 'Every one of these starts the same way: draw the substrate, then cross out the metal. Na, K, Li, MgBr are spectators, so NaOEt is really ethoxide, the actor. Then ask four questions in order. One, which carbon holds the leaving group? Primary never runs SN1 and tertiary never runs SN2, so the carbon already cut the field in half. Two, what is the reagent? A strong small base on a secondary or tertiary carbon runs E2 and takes the Zaitsev, more substituted, alkene; a bulky base cannot reach the crowded spot and gives Hofmann; a weak nucleophile like water or an alcohol means SN1 and E1 traveling together. Three, the solvent: aprotic nudges SN2, protic babysits the nucleophile and helps the cation. Four, heat pushes elimination. Then the stereo check: SN2 inverts, SN1 racemizes. Rule of thumb: carbon, reagent, solvent, heat.',
  moveName: 'Carbon, reagent, solvent, heat',
  move: [
    'Cross out the metal. NaOEt is ethoxide, NaCN is cyanide, KOtBu is tert-butoxide.',
    'Which carbon? Primary never SN1, tertiary never SN2. Secondary means the reagent decides.',
    'Which reagent? Strong nucleophile and weak base means SN2. Strong small base means E2 Zaitsev on secondary or tertiary (SN2 on primary). Bulky base means E2 Hofmann. Weak nucleophile means SN1 with E1.',
    'Solvent and heat: aprotic nudges SN2, protic helps the cation, heat favors elimination.',
    'Stereo check: SN2 inverts the center, SN1 racemizes it, E2 erases it.'
  ],
  trap: 'Careful: the substrate decides before the reagent does; the same NaOEt that builds an ether on a primary halide runs E2 on a secondary or tertiary one, and with no beta hydrogen it can only substitute.',
  holdsUp: ['Williamson ether synthesis', 'Alcohol to halide swaps', 'Acetylide alkylation', 'Enolate alkylation', 'Product stereochemistry'],
  drill: 'Booster OChem: Substitution & Elimination'
};

// SMILES used here that are not in shared/reactions.js (render-checked by the sheet test).
// (R)-2-bromobutane to (S)-2-butanol is the bank's RDKit-checked SN2 pair; (R)-3-bromo-3-methylhexane is the
// atom's SN1 example, drawn to its flat cation and both alcohols. R/S assignments checked by CIP parity.
export const SMILES = ['CC[C@@H](C)Br', 'CC[C@H](C)O', 'CC[C@@H](C)O', 'CCC[C@](C)(Br)CC', 'CCC[C+](C)CC', 'CCC[C@](C)(O)CC', 'CCC[C@@](C)(O)CC'];
const STEREO = {
  sn2: { sub: 'CC[C@@H](C)Br', subName: '(R)-2-bromobutane', reagent: 'NaOH', cond: 'DMSO', prods: ['CC[C@H](C)O'], prodNames: ['(S)-2-butanol'] },
  sn1: { sub: 'CCC[C@](C)(Br)CC', subName: '(R)-3-bromo-3-methylhexane', reagent: 'H2O', cond: 'heat', cation: 'CCC[C+](C)CC', prods: ['CCC[C@](C)(O)CC', 'CCC[C@@](C)(O)CC'], prodNames: ['(R)', '(S)'] }
};

const HOME = 't4-subelim';
const DEFAULT_ROOTS = ['l2-carbocation', 'l2-arrows'];

// ---------- the decision path (pure, node-safe) ----------
export const SUBS = [
  { key: 'p1', deg: 1, subClass: 'halide_primary' },
  { key: 'p2', deg: 2, subClass: 'halide_secondary' },
  { key: 'p3', deg: 3, subClass: 'halide_tertiary' },
  { key: 'p3b', deg: 3, subClass: 'halide_tertiary_b', choice: true }   // two different alkenes possible: Zaitsev versus Hofmann is real here
];
export const REAGENTS = [
  { key: 'nai', label: 'NaI, acetone', actor: 'iodide', kind: 'nu', solvent: 'aprotic', heat: false },
  { key: 'nacn', label: 'NaCN, DMSO', actor: 'cyanide', kind: 'nu', solvent: 'aprotic', heat: false },
  { key: 'naoh', label: 'NaOH, water', actor: 'hydroxide', kind: 'base', solvent: 'protic', heat: false },
  { key: 'naoet', label: 'NaOEt, EtOH', actor: 'ethoxide', kind: 'base', solvent: 'protic', heat: false },
  { key: 'kotbu', label: 'KOtBu, tBuOH', actor: 'tert-butoxide', kind: 'bulky', solvent: 'protic', heat: false },
  { key: 'h2o', label: 'H2O, heat', actor: 'water', kind: 'weak', solvent: 'protic', heat: true },
  { key: 'meoh', label: 'CH3OH', actor: 'methanol', kind: 'weak', solvent: 'protic', heat: false }
];
// Pairings the verified table draws a product for.
export const MATCH = { 'p1|nai': 'hal1_nai', 'p1|nacn': 'hal1_nacn', 'p1|naoh': 'hal1_naoh', 'p2|nai': 'hal2_nai', 'p2|naoet': 'hal2_naoet', 'p3|h2o': 'hal3_h2o', 'p3|meoh': 'hal3_meoh', 'p3b|kotbu': 'hal3_tbuok', 'p3b|naoet': 'hal3_naoet' };
export function decide(sub, rg){
  const deg = sub.deg, choice = !!sub.choice;
  if (deg === 1){
    if (rg.kind === 'bulky') return { mech: 'E2', regio: '', note: 'A bulky base cannot get at the carbon but can reach a beta hydrogen, so even a primary halide eliminates. Only one alkene is possible here.' };
    if (rg.kind === 'weak') return { mech: 'SN2', regio: '', note: 'Primary never runs SN1, and a weak nucleophile is a poor SN2 partner, so this is slow SN2 at best.' };
    return { mech: 'SN2', regio: '', note: 'Primary carbon, open back side: attack, kick it off, attach.' };
  }
  if (deg === 2){
    if (rg.kind === 'nu') return { mech: 'SN2', regio: '', note: 'Good nucleophile, weak base, aprotic solvent: SN2 is allowed on a secondary carbon.' };
    if (rg.kind === 'base') return { mech: 'E2', regio: choice ? 'Zaitsev' : '', note: 'Strong small base on a secondary carbon: E2. It takes the more substituted alkene when there is a choice.' };
    if (rg.kind === 'bulky') return { mech: 'E2', regio: choice ? 'Hofmann' : '', note: 'Bulky base: E2 at the less crowded hydrogen.' };
    return { mech: 'SN1 + E1', regio: '', note: 'Weak nucleophile, protic solvent: the halide leaves on its own, and SN1 and E1 travel together.' };
  }
  if (rg.kind === 'base') return { mech: 'E2', regio: choice ? 'Zaitsev' : '', note: 'Tertiary never SN2. A small base slips into the crowded spot and takes the Zaitsev hydrogen.' };
  if (rg.kind === 'bulky') return { mech: 'E2', regio: choice ? 'Hofmann' : '', note: 'Tertiary never SN2. The bulky base is forced to the exposed hydrogen: Hofmann.' };
  if (rg.kind === 'nu') return { mech: 'SN1', regio: '', note: 'Tertiary never SN2. Iodide and cyanide are weak bases, so the halide leaves first and the nucleophile fills the cation.' };
  return rg.heat ? { mech: 'SN1 + E1', regio: '', note: 'Weak nucleophile, protic solvent, tertiary carbon, heat: SN1 and E1 together.' } : { mech: 'SN1', regio: '', note: 'Weak nucleophile, protic solvent, tertiary carbon: the halide leaves first and the solvent fills the cation.' };
}
export function mechKey(r){ const m = r.mech || ''; if (/^SN2/i.test(m)) return 'SN2'; if (/^SN1/i.test(m)) return 'SN1'; if (/^E2/i.test(m)) return 'E2'; if (/^E1/i.test(m)) return 'E1'; return null; }
export function stereoKey(r){ const k = mechKey(r); return k === 'SN2' ? 'inverted' : k === 'SN1' ? 'racemized' : (k === 'E2' || k === 'E1') ? 'gone' : null; }
const MECH_CHOICES = [
  { key: 'SN2', text: 'SN2: one step, backside attack as the leaving group leaves' },
  { key: 'SN1', text: 'SN1: the leaving group leaves first, then the nucleophile fills the flat cation' },
  { key: 'E2', text: 'E2: one step, the base takes a beta hydrogen as the leaving group leaves' },
  { key: 'E1', text: 'E1: the leaving group leaves first, then a beta proton is lost' }
];
const STEREO_CHOICES = [
  { key: 'inverted', text: 'Inverted: backside attack flips it, like an umbrella in the wind' },
  { key: 'racemized', text: 'Racemized: the flat cation is attacked from both faces' },
  { key: 'retained', text: 'Retained: the nucleophile takes exactly the spot the leaving group had' },
  { key: 'gone', text: 'Gone: that carbon is sp2 in the alkene now, so there is no center' }
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
  const halides = api.reactions.byFamily('subelim');
  // the E1 cases the DAT asks live on alcohols (acid and heat); they join the mechanism and stereo items so E1 is sometimes right
  const e1 = api.reactions.byFamily('alcohols').filter(r => mechKey(r) === 'E1');
  return { halides, mech: halides.filter(r => mechKey(r)).concat(e1) };
}
export function genMech(api, r){
  const key = mechKey(r);
  const choices = api.shuffle(MECH_CHOICES.map(c => ({ text: c.text, ok: c.key === key, why: 'Carbon, reagent, solvent, heat. ' + r.thomas })));
  return finish(api, r, 'mech', 'Which mechanism makes this product?', r.sub, label(r), r.prod, choices, r.thomas);
}
export function genProduct(api, r, pool){
  const ds = productDistractors(api, r, pool); if (!ds) return null;
  const choices = api.shuffle([{ smiles: r.prod, text: '', ok: true }].concat(ds.map(x => ({ smiles: x.prod, text: '', why: 'That is what ' + label(x) + ' gives (' + x.name.toLowerCase() + '). ' + r.thomas }))));
  return finish(api, r, 'product', 'Major product?', r.sub, label(r), null, choices, r.thomas);
}
export function genConditions(api, r, pool){
  const ds = reagentDistractors(api, r, pool); if (!ds) return null;
  const choices = api.shuffle([{ text: label(r), ok: true }].concat(ds.map(x => ({ text: label(x), why: label(x) + ' gives a different product: ' + x.name.toLowerCase() + '. ' + r.thomas }))));
  return finish(api, r, 'conditions', 'Which conditions turn ' + subName(api, r) + ' into this product?', r.sub, null, r.prod, choices, r.thomas);
}
export function genStereo(api, r){
  const key = stereoKey(r); if (!key) return null;
  const choices = api.shuffle(STEREO_CHOICES.map(c => ({ text: c.text, ok: c.key === key, why: 'The mechanism decides the stereo: ' + r.mech + '. ' + r.trap })));
  return finish(api, r, 'stereo', 'Suppose the carbon holding the leaving group is a stereocenter. After this reaction that center is:', r.sub, label(r), null, choices, r.trap);
}
export function gen(api){
  const P = pools(api);
  for (let tries = 0; tries < 40; tries++){
    const u = api.rng();
    let it = null;
    if (u < 0.3) it = genMech(api, api.pick(P.mech));
    else if (u < 0.55) it = genProduct(api, api.pick(P.halides), P.halides);
    else if (u < 0.8) it = genConditions(api, api.pick(P.halides), P.halides);
    else it = genStereo(api, api.pick(P.mech));
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
  const api = tinyApi(deps, 13);
  const F = deps.reactions.find;
  for (const s of SMILES) if (!smilesOk(s)) fail('bad SMILES in list: ' + s);
  // the decision path agrees with every pairing the verified table draws
  for (const key in MATCH){
    const [sk, rk] = key.split('|');
    const sub = SUBS.find(s => s.key === sk), rg = REAGENTS.find(x => x.key === rk), r = F(MATCH[key]);
    if (!sub || !rg || !r){ fail('bad MATCH entry ' + key); continue; }
    if (r.subClass !== sub.subClass) fail(key + ' substrate class mismatch');
    const v = decide(sub, rg);
    const tableMech = (r.mech || '').replace(' with ', ' + ');
    if (v.mech !== tableMech) fail(key + ' decides ' + v.mech + ' but the table says ' + r.mech);
    if (/Hofmann/i.test(r.regio || '') && v.regio !== 'Hofmann') fail(key + ' should be Hofmann');
    if (/Zaitsev/i.test(r.regio || '') && sub.choice && v.regio !== 'Zaitsev') fail(key + ' should be Zaitsev');
  }
  // every pairing produces a verdict from the four allowed answers
  for (const s of SUBS) for (const rg of REAGENTS){ const v = decide(s, rg); if (!['SN2', 'E2', 'SN1', 'SN1 + E1'].includes(v.mech) || !v.note) fail('bad verdict for ' + s.key + '|' + rg.key); }
  if (decide(SUBS[0], REAGENTS[5]).mech.startsWith('SN1')) fail('primary must never SN1');
  if (decide(SUBS[2], REAGENTS[0]).mech === 'SN2') fail('tertiary must never SN2');
  const P = pools(api);
  if (P.halides.length < 9 || P.mech.filter(r => mechKey(r) === 'E1').length < 1) fail('pools too thin');
  let tried = 0; const kinds = {}, mechs = {};
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
    if (it.kind === 'mech'){ const k = mechKey(r); mechs[k] = (mechs[k] || 0) + 1; if (it.choices[it.correct].text !== MECH_CHOICES.find(c => c.key === k).text) fail('mechanism answer mismatch ' + it.rid); }
    if (it.kind === 'product' && it.choices[it.correct].smiles !== r.prod) fail('product answer mismatch ' + it.rid);
    if (it.kind === 'conditions' && it.choices[it.correct].text !== label(r)) fail('conditions answer mismatch ' + it.rid);
    if (it.kind === 'stereo' && it.choices[it.correct].text !== STEREO_CHOICES.find(c => c.key === stereoKey(r)).text) fail('stereo answer mismatch ' + it.rid);
    if (it.kind === 'stereo' && it.choices[it.correct].text === STEREO_CHOICES[2].text) fail('retention must never be the answer here');
  }
  if (Object.keys(kinds).length < 4) fail('not every kind appeared: ' + JSON.stringify(kinds));
  if (Object.keys(mechs).length < 4) fail('not every mechanism was asked: ' + JSON.stringify(mechs));
  const a = makeItem(tinyApi(deps, 3)), b = makeItem(tinyApi(deps, 3));
  if (JSON.stringify(a) !== JSON.stringify(b)) fail('not reproducible');
  return { ok: notes.length === 0, tried, notes: notes.join('; ') || ('kinds ' + Object.entries(kinds).map(([k, v]) => k + ' ' + v).join(', ') + '; mechanisms asked ' + Object.keys(mechs).join(' ')) };
}

// ---------- DOM helpers ----------
const CSS = `
.t4s-row{display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-bottom:8px}
.t4s-row .eyebrow{margin-right:6px;min-width:76px}
.t4s-chip{min-height:38px;padding:4px 12px;border-radius:999px;border:1px solid var(--line);background:var(--card);color:var(--ink2);font-family:var(--mono);font-size:12px;position:relative}
.t4s-chip[aria-pressed="true"]{border-color:var(--gold);color:var(--ink);background:rgba(201,168,76,.14)}
.t4s-chip:hover{border-color:var(--gold)}
.t4s-chip.drawn::after{content:'';position:absolute;top:5px;right:6px;width:6px;height:6px;border-radius:50%;background:var(--gold)}
.t4s-qs{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:14px 0 12px}
.t4s-q{background:rgba(255,255,255,.02);border:1px solid var(--line);border-radius:10px;padding:10px 12px;min-height:118px;opacity:.4;transition:opacity .35s,border-color .35s,transform .35s;transform:translateY(4px)}
.t4s-q.on{opacity:1;border-color:var(--gold);transform:none}
.t4s-q b{display:block;font-family:var(--mono);font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--ink3);margin-bottom:4px}
.t4s-q.on b{color:var(--goldhi)}
.t4s-q p{margin:0;font-size:14px;color:var(--ink2);line-height:1.4}
.t4s-verdict{display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin:0 0 12px;opacity:0;transition:opacity .4s}
.t4s-verdict.in{opacity:1}
.t4s-pill{font-family:var(--serif);font-size:22px;padding:6px 18px;border-radius:999px;border:2px solid;background:var(--card)}
.t4s-verdict p{margin:0;font-size:15px;color:var(--ink2);max-width:60ch}
.t4s-stage .box{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:150px;gap:4px}
.t4s-stage .box .mol{width:auto;max-width:100%;max-height:150px;display:block}
.t4s-stage .arrow .line{transition:width .45s ease-out}
.t4s-fade{opacity:0;transform:translateY(6px);transition:opacity .5s ease-out,transform .5s ease-out}
.t4s-fade.in{opacity:1;transform:none}
.t4s-note{font-size:13px;color:var(--ink3);margin:2px 0 0;text-align:center}
.t4s-wait{font-family:var(--serif);font-size:16px;color:var(--ink3);text-align:center;padding:8px 14px;max-width:26ch}
.t4s-cap{font-family:var(--serif);font-size:17px;color:var(--goldhi);margin:12px 0 0;min-height:1.4em}
.t4s-stereo{margin-top:18px;padding:14px;border:1px dashed var(--line);border-radius:12px}
.t4s-stereo .rxn{grid-template-columns:1fr auto 1fr auto 1fr}
.t4s-stereo .rxn.two{grid-template-columns:1fr auto 1fr}
.t4s-pair{display:flex;gap:6px;align-items:center;justify-content:center;flex-wrap:wrap}
.t4s-pair .mol{max-width:46%}
.t4s-pair .half{display:flex;flex-direction:column;align-items:center;max-width:48%}
.t4s-pair .half .mol{max-width:100%}
.t4s-badges{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
.t4s-badge{font-family:var(--mono);font-size:11px;letter-spacing:.06em;text-transform:uppercase;padding:5px 10px;border-radius:999px;border:1px solid}
.t4s-opts .opt .mol{width:auto;max-width:100%;max-height:110px;margin:0 auto}
.t4s-single{display:flex;justify-content:center}
.t4s-single .mol{width:auto;max-width:100%;max-height:150px}
@media (max-width:760px){.t4s-qs{grid-template-columns:1fr 1fr}.t4s-stereo .rxn{grid-template-columns:1fr}.t4s-pair .mol{max-width:100%}}
`;
function injectStyle(api, id, css){ if (document.getElementById(id)) return; document.head.append(api.el('style', { id, text: css })); }
function sizeMol(node, k){
  const vb = (node.getAttribute('viewBox') || '').split(/[\s,]+/).map(Number);
  if (vb.length === 4 && vb[2] > 0){ node.style.width = Math.round(vb[2] * k) + 'px'; node.style.height = 'auto'; }
  return node;
}
function mol(api, target, smiles, k, labelText){ return sizeMol(api.drawSmiles(target, smiles, { width: 240, height: 160, label: labelText || 'a molecule' }), k || 1.7); }
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
  injectStyle(api, 't4s-style', CSS);
  const F = api.reactions.find, S = api.reactions.SUBSTRATES;
  const D = api.reduced ? 0 : 1;
  const timers = [];
  const later = (fn, ms) => { if (!D){ fn(); return; } timers.push(setTimeout(fn, ms)); };
  const clearTimers = () => { while (timers.length) clearTimeout(timers.pop()); };
  const MECH_COLOR = { SN2: C.blue, E2: C.gold, SN1: C.coral, 'SN1 + E1': C.amber };

  // ---------- VISUAL: the decision path ----------
  let subKey = 'p3b', rgKey = 'naoet';
  const stage = el('div', { class: 't4s-stage' });
  function chipRow(title, list, cur, onPick, drawnFn){
    const row = el('div', { class: 't4s-row', role: 'group', 'aria-label': title });
    row.append(el('span', { class: 'eyebrow', text: title }));
    for (const x of list) row.append(el('button', { type: 'button', class: 't4s-chip' + (drawnFn(x) ? ' drawn' : ''), 'aria-pressed': x.key === cur ? 'true' : 'false', text: x.label, title: drawnFn(x) ? 'the verified table draws this product' : '', onClick: () => onPick(x.key) }));
    return row;
  }
  function qCard(title){ return el('div', { class: 't4s-q' }, el('b', { text: title }), el('p', {})); }
  function badge(text, color){ return el('span', { class: 't4s-badge', text, style: { color, borderColor: color } }); }
  function rxnRow(sub, rg, r, v){
    const row = el('div', { class: 'rxn' });
    const sb = el('div', { class: 'box' }); mol(api, sb, S[sub.subClass].smi, 2.4, S[sub.subClass].name); sb.append(el('span', { class: 't4s-note', text: S[sub.subClass].name }));
    const line = el('div', { class: 'line', style: { width: D ? '0%' : '100%' } });
    const arrow = el('div', { class: 'arrow' }, el('span', { class: 'reagent', text: r ? r.reagent : rg.label.split(', ')[0] }), line, el('span', { text: r ? (r.cond || '') : (rg.label.split(', ')[1] || '') }));
    const pb = el('div', { class: 'box q', text: '?' });
    row.append(sb, arrow, pb);
    const reveal = () => {
      const nb = el('div', { class: 'box t4s-fade' });
      if (r){ mol(api, nb, r.prod, 2.4, 'product'); if (r.prodNote) nb.append(el('span', { class: 't4s-note', text: r.prodNote })); }
      else nb.append(el('span', { class: 't4s-wait', text: 'Verdict: ' + v.mech + (v.regio ? ' ' + v.regio : '') + '. The verified table has no drawn product for this pairing, so the answer here is the mechanism, not a structure.' }));
      pb.replaceWith(nb);
      requestAnimationFrame(() => nb.classList.add('in'));
    };
    requestAnimationFrame(() => { line.style.width = '100%'; });
    later(reveal, 420);
    return row;
  }
  function build(){
    clearTimers();
    stage.replaceChildren();
    const sub = SUBS.find(s => s.key === subKey), rg = REAGENTS.find(x => x.key === rgKey);
    const subList = SUBS.map(s => ({ key: s.key, label: S[s.subClass].name }));
    stage.append(el('span', { class: 'eyebrow', text: 'pick a substrate and a reagent; the four questions answer in order (gold dot = the table draws the product)' }));
    stage.append(chipRow('substrate', subList, subKey, k => { subKey = k; build(); }, x => REAGENTS.some(y => MATCH[x.key + '|' + y.key])));
    stage.append(chipRow('reagent', REAGENTS, rgKey, k => { rgKey = k; build(); }, x => !!MATCH[subKey + '|' + x.key]));
    const v = decide(sub, rg);
    const cards = [qCard('1. Which carbon?'), qCard('2. Which reagent?'), qCard('3. Which solvent?'), qCard('4. Heat?')];
    const degText = sub.deg === 1 ? 'Primary. SN2 is open; SN1 is off the table.' : sub.deg === 2 ? 'Secondary. Both are possible, so the reagent decides.' : 'Tertiary. SN2 is off the table; the cation is happy, so SN1, or E2 with a strong base.';
    const rgText = rg.kind === 'nu' ? 'Cross out the metal: ' + rg.actor + '. Strong nucleophile, weak base. Substitution, not elimination.' : rg.kind === 'base' ? 'Cross out the metal: ' + rg.actor + '. Strong, small base. E2 on secondary or tertiary, SN2 on primary.' : rg.kind === 'bulky' ? 'Cross out the metal: ' + rg.actor + '. Strong but bulky, so it reaches only the exposed hydrogen: Hofmann.' : rg.actor + ': weak nucleophile, weak base. It waits for a cation: SN1 and E1.';
    const solText = rg.solvent === 'aprotic' ? 'Aprotic (acetone, DMSO). The nucleophile is naked and fast. Nudges SN2.' : 'Protic (water, alcohol). Hydrogen bonds babysit the nucleophile and steady a cation. Helps SN1 and E1.';
    const heatText = rg.heat ? 'Heat. Entropy loves elimination, so E1 rides along.' : 'No heat. Nothing extra pushes elimination.';
    [degText, rgText, solText, heatText].forEach((t, i) => { cards[i].querySelector('p').textContent = t; });
    const qs = el('div', { class: 't4s-qs' }, ...cards);
    const verdict = el('div', { class: 't4s-verdict' }, el('span', { class: 't4s-pill', text: v.mech + (v.regio ? ' ' + v.regio : ''), style: { color: MECH_COLOR[v.mech], borderColor: MECH_COLOR[v.mech] } }), el('p', { text: v.note }));
    const r = MATCH[subKey + '|' + rgKey] ? F(MATCH[subKey + '|' + rgKey]) : null;
    const rowHolder = el('div', {});
    stage.append(qs, verdict, rowHolder);
    cards.forEach((c, i) => later(() => c.classList.add('on'), 150 + i * 260));
    later(() => verdict.classList.add('in'), 150 + 4 * 260);
    later(() => { rowHolder.append(rxnRow(sub, rg, r, v)); if (r) rowHolder.append(el('p', { class: 't4s-cap', text: r.thomas })); }, 150 + 4 * 260 + 200);
  }
  slots.visual.append(stage);
  build();

  // ---------- the stereo check ----------
  let stereoTab = 'sn2';
  const stereo = el('div', { class: 't4s-stereo' });
  function buildStereo(){
    stereo.replaceChildren();
    stereo.append(el('span', { class: 'eyebrow', text: 'the stereo check: what happens to a stereocenter' }));
    const ctrl = el('div', { class: 'controls', style: { marginTop: '8px', marginBottom: '10px' } },
      el('button', { type: 'button', class: 'chip', 'aria-pressed': stereoTab === 'sn2' ? 'true' : 'false', text: 'SN2: inversion', onClick: () => { stereoTab = 'sn2'; buildStereo(); } }),
      el('button', { type: 'button', class: 'chip', 'aria-pressed': stereoTab === 'sn1' ? 'true' : 'false', text: 'SN1: racemization', onClick: () => { stereoTab = 'sn1'; buildStereo(); } }));
    stereo.append(ctrl);
    const d = STEREO[stereoTab];
    if (stereoTab === 'sn2'){
      const row = el('div', { class: 'rxn two' });
      const sb = el('div', { class: 'box' }); mol(api, sb, d.sub, 2.2, d.subName); sb.append(el('span', { class: 't4s-note', text: d.subName }));
      const pb = el('div', { class: 'box' }); mol(api, pb, d.prods[0], 2.2, d.prodNames[0]); pb.append(el('span', { class: 't4s-note', text: d.prodNames[0] }));
      row.append(sb, el('div', { class: 'arrow' }, el('span', { class: 'reagent', text: d.reagent }), el('div', { class: 'line' }), el('span', { text: d.cond })), pb);
      stereo.append(row, el('div', { class: 't4s-badges' }, badge('SN2: backside attack', C.blue), badge('inverted: R became S', C.gold), badge('OH took the exact priority slot Br held', C.grey)),
        el('p', { class: 't4s-cap', text: 'Attack from the back flips the center like an umbrella in the wind. Find R or S on the start, then flip, and check that the priorities kept their order.' }));
    } else {
      const row = el('div', { class: 'rxn' });
      const sb = el('div', { class: 'box' }); mol(api, sb, d.sub, 1.9, d.subName); sb.append(el('span', { class: 't4s-note', text: d.subName }));
      const cb = el('div', { class: 'box' }); const cm = mol(api, cb, d.cation, 1.9, 'the flat cation'); chargeBadge(api, cm, '+', v => v.deg === 3); cb.append(el('span', { class: 't4s-note', text: 'flat tertiary cation' }));
      const pb = el('div', { class: 'box' }); const pair = el('div', { class: 't4s-pair' });
      d.prods.forEach((p, i) => { const h = el('div', { class: 'half' }); mol(api, h, p, 1.6, d.prodNames[i]); h.append(el('span', { class: 't4s-note', text: d.prodNames[i] })); pair.append(h); });
      pb.append(pair, el('span', { class: 't4s-note', text: '50 : 50, the racemic pair' }));
      row.append(sb, el('div', { class: 'arrow' }, el('span', { class: 'reagent', text: d.reagent }), el('div', { class: 'line' }), el('span', { text: d.cond })), cb, el('div', { class: 'arrow' }, el('span', { class: 'reagent', text: 'H2O' }), el('div', { class: 'line' }), el('span', { text: 'either face' })), pb);
      stereo.append(row, el('div', { class: 't4s-badges' }, badge('SN1: leave first, then attack', C.coral), badge('racemized: both faces open', C.gold), badge('tertiary, weak nucleophile, protic', C.grey)),
        el('p', { class: 't4s-cap', text: 'The cation is flat, sp2, a peace sign. Water can land on either face, so you get both letters, R and S, in equal amounts.' }));
    }
  }
  slots.visual.append(stereo);
  buildStereo();

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
      const one = el('div', { class: 't4s-single box' }); mol(api, one, it.sub, 2.1, 'the molecule'); head.append(one);
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
    const box = el('div', { class: 'opts t4s-opts' });
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
