// The Tree of Organic, Level 4, module 7: The alpha carbon wakes up.
// Enolates: aldol, Claisen, Michael, alkylation, alpha halogenation, decarboxylation. No imports (contract).

export const meta = {
  id: 't4-alpha',
  level: 4,
  order: 7,
  needs3D: false,
  title: 'The alpha carbon wakes up',
  concept: 'Enolates and the alpha carbon',
  tagline: 'Base takes the proton next door, and the carbonyl grows a carbon nucleophile.',
  story: 'Every carbonyl has a second personality: the carbon next door. That alpha carbon holds a proton that is acidic for one reason, when it leaves, the minus spreads onto the oxygen. Judge the base, not the acid. So a base takes it, the alpha carbon wakes up as an enolate, and you own a carbon nucleophile. Aldol: it attacks another carbonyl. Cold stops at the beta-hydroxy carbonyl; heat kicks out water and leaves the conjugated enone. Claisen is the ester version and gives a beta-keto ester, every time. Michael goes 1,4, to the beta carbon of an enone, not the carbonyl. LDA makes the enolate all at once, then a primary halide by SN2. In acid the enol grabs one bromine and stops. A carboxyl beta to a carbonyl falls off as CO2 with heat. Rule of thumb: find the alpha carbon, wake it up, ask what it attacks.',
  moveName: 'Find the alpha carbon, wake it up, ask what it attacks',
  move: [
    'Find the alpha carbon: one carbon over from the C=O. A carbon sitting between two carbonyls is the alpha carbon that wins.',
    'Wake it up: the base takes the alpha proton and the enolate forms, minus shared between that carbon and the oxygen. Draw it as the carbanion, because that end is what attacks.',
    'Ask what it attacks: a carbonyl carbon (aldol and Claisen, 1,2), the beta carbon of an enone (Michael, 1,4), or a primary halide (SN2).',
    'Finish the story: Claisen kicks out the alkoxide, an aldol with heat loses water, a beta-keto acid loses CO2.'
  ],
  trap: 'Careful: A stabilized enolate meeting an enone goes 1,4 to the beta carbon, and a cold aldol keeps its OH; only heat dehydrates it to the enone.',
  holdsUp: ['Aldol and Claisen products', 'Michael and Robinson', 'Acetoacetic and malonic ester endings', 'Alpha alkylation with LDA', 'Alpha halogenation and haloform'],
  drill: 'Booster OChem: Enolate Reactions'
};

// Every SMILES this module draws that is not in shared/reactions.js: the intermediates and the partners.
export const SMILES = ['[CH2-]C=O', '[CH2-]C(=O)OCC', 'CC(=O)[CH2-]', 'CC(=O)[CH-]C(C)=O', 'CC(O)=C', 'C=CC(C)=O', 'CI', 'BrBr'];

/* ------------------------------------------------------------------ */
/* Tiny SMILES graph, node-safe                                        */
/* ------------------------------------------------------------------ */
function parseSmiles(s){
  const atoms = [], bonds = [], rings = {}, stack = [];
  let prev = null, order = 0, i = 0;
  function add(el, arom, charge){ const id = atoms.length; atoms.push({ el, arom, charge: charge || 0 }); if (prev != null) bonds.push({ a: prev, b: id, order: order || (arom && atoms[prev].arom ? 1.5 : 1) }); order = 0; prev = id; }
  while (i < s.length){
    const c = s[i];
    if (c === '('){ stack.push(prev); i++; continue; }
    if (c === ')'){ prev = stack.pop(); i++; continue; }
    if (c === '='){ order = 2; i++; continue; }
    if (c === '#'){ order = 3; i++; continue; }
    if (c === '-' || c === '/' || c === '\\' || c === ':'){ i++; continue; }
    if (c === '.'){ prev = null; i++; continue; }
    if (c === '['){ const j = s.indexOf(']', i); const body = s.slice(i + 1, j); const m = body.match(/^\d*([A-Z][a-z]?|[a-z]{1,2})/); const sym = m ? m[1] : 'C'; const ch = body.match(/([+-])(\d*)$/); const charge = ch ? (ch[1] === '-' ? -1 : 1) * (ch[2] ? +ch[2] : 1) : 0; add(sym.length === 2 && /[a-z]/.test(sym[0]) ? sym.toUpperCase() : sym[0].toUpperCase() + sym.slice(1), /^[a-z]/.test(sym), charge); i = j + 1; continue; }
    if (/\d/.test(c) || c === '%'){ let n; if (c === '%'){ n = s.slice(i + 1, i + 3); i += 3; } else { n = c; i++; } if (rings[n] != null){ bonds.push({ a: rings[n], b: prev, order: order || (atoms[prev].arom && atoms[rings[n]].arom ? 1.5 : 1) }); order = 0; delete rings[n]; } else rings[n] = prev; continue; }
    const two = s.slice(i, i + 2);
    if (two === 'Cl' || two === 'Br'){ add(two, false); i += 2; continue; }
    if (/[BCNOPSFI]/.test(c)){ add(c, false); i++; continue; }
    if (/[bcnops]/.test(c)){ add(c.toUpperCase(), true); i++; continue; }
    i++;
  }
  return { atoms, bonds };
}
function neighbors(g, i){ const out = []; for (const b of g.bonds){ if (b.a === i) out.push({ j: b.b, order: b.order }); else if (b.b === i) out.push({ j: b.a, order: b.order }); } return out; }
function isCarbonylC(g, i){ return g.atoms[i].el === 'C' && neighbors(g, i).some(x => x.order === 2 && g.atoms[x.j].el === 'O'); }
// how many carbonyl carbons sit next to the charged carbon of an enolate (0 means the drawing is not an enolate)
function enolateStabilizers(smi){
  const g = parseSmiles(smi);
  const c = g.atoms.findIndex(a => a.el === 'C' && a.charge < 0);
  if (c < 0) return 0;
  return neighbors(g, c).filter(x => isCarbonylC(g, x.j)).length;
}
function countC(smi){ return parseSmiles(smi).atoms.filter(a => a.el === 'C').length; }
function smilesSane(s){
  if (typeof s !== 'string' || !s) return false;
  const t = s.replace(/\[[^\]]*\]/g, 'X');
  let d = 0; for (const c of t){ if (c === '(') d++; else if (c === ')'){ d--; if (d < 0) return false; } }
  if (d) return false;
  const cnt = {}; for (const c of t.replace(/%\d\d/g, '')) if (/\d/.test(c)) cnt[c] = (cnt[c] || 0) + 1;
  return Object.values(cnt).every(n => n % 2 === 0);
}

/* ------------------------------------------------------------------ */
/* Module data: how each verified reaction plays in two steps.          */
/* ------------------------------------------------------------------ */
function stepsFor(R){
  const S = R.SUBSTRATES;
  return {
    aldol: { wake: 'NaOH', wakeCond: 'cold', inter: '[CH2-]C=O', interName: 'the enolate, minus on the alpha carbon', partner: S.acetaldehyde.smi, partnerName: 'a second acetaldehyde', attack: 'attacks the C=O', site: '1,2', bond: 'new C-C bond', ending: 'protonate the alkoxide: a beta-hydroxy aldehyde' },
    aldol_condensation: { wake: 'NaOH', wakeCond: 'heat', inter: '[CH2-]C=O', interName: 'the enolate, minus on the alpha carbon', partner: S.acetaldehyde.smi, partnerName: 'a second acetaldehyde', attack: 'attacks the C=O, then heat', site: '1,2', bond: 'new C-C bond', ending: 'heat removes water: the conjugated enone' },
    claisen: { wake: 'NaOEt', wakeCond: 'EtOH', inter: '[CH2-]C(=O)OCC', interName: 'the ester enolate', partner: S.ethyl_acetate.smi, partnerName: 'a second ethyl acetate', attack: 'attacks the C=O', site: '1,2', bond: 'new C-C bond', ending: 'ethoxide leaves: a beta-keto ester' },
    michael: { wake: 'NaOEt', wakeCond: '', inter: 'CC(=O)[CH-]C(C)=O', interName: 'the stabilized enolate, between two carbonyls', partner: 'C=CC(C)=O', partnerName: 'methyl vinyl ketone', attack: 'attacks the beta carbon', site: '1,4', bond: 'new C-C bond at the beta carbon', ending: 'protonate at the alpha carbon: a 1,5-dicarbonyl' },
    enolate_alkylation: { wake: 'LDA', wakeCond: 'THF, -78 C', inter: 'CC(=O)[CH2-]', interName: 'the enolate, made all at once', partner: 'CI', partnerName: 'methyl iodide', attack: 'SN2 on the halide', site: 'SN2', bond: 'new C-C bond', ending: 'iodide leaves: one more carbon on the alpha side' },
    alpha_halogenation: { wake: 'H+', wakeCond: 'CH3COOH', inter: 'CC(O)=C', interName: 'the enol, nucleophile at the alpha carbon', partner: 'BrBr', partnerName: 'Br2', attack: 'attacks Br2', site: 'Br', bond: 'new C-Br bond', ending: 'one bromine and it stops' },
    decarboxylation: { wake: 'heat', wakeCond: 'CO2 leaves', inter: 'CC(O)=C', interName: 'the enol, after CO2 leaves', partner: null, partnerName: 'tautomerize', attack: 'moves a proton', site: 'H', bond: 'no new C-C bond', ending: 'the enol tautomerizes to the ketone' }
  };
}
const SUBS = ['acetaldehyde', 'ethyl_acetate', 'acetone', 'diketone', 'betaketoacid'];
// which carbon gives up the proton (the hand-checked labels; the enolate drawings above must agree, and selfTest checks that)
const WHICH = {
  acetaldehyde: { correct: 'the CH3 carbon, alpha to the C=O', others: ['the aldehyde carbon, the one holding the H', 'the oxygen', 'none: acetaldehyde has no alpha hydrogen'], inter: '[CH2-]C=O' },
  ethyl_acetate: { correct: 'the CH3 next to the C=O', others: ['the OCH2 carbon of the ethyl group', 'the carbonyl carbon', 'the far CH3 of the ethyl group'], inter: '[CH2-]C(=O)OCC' },
  acetone: { correct: 'either methyl carbon, both are alpha', others: ['the carbonyl carbon', 'the oxygen', 'none: acetone has no acidic proton'], inter: 'CC(=O)[CH2-]' },
  diketone: { correct: 'the CH2 between the two carbonyls', others: ['one of the end methyl carbons', 'a carbonyl carbon', 'the oxygen'], inter: 'CC(=O)[CH-]C(C)=O' }
};
const SITES = [
  { k: '1,2', text: '1,2: the carbonyl carbon' },
  { k: '1,4', text: '1,4: the beta carbon of the enone' },
  { k: 'H', text: 'it takes a proton instead' },
  { k: 'O', text: 'the oxygen' }
];
function label(r){ return [r.reagent, r.cond].filter(Boolean).join(', '); }
function subName(R, r){ return R.SUBSTRATES[r.subClass].name; }
function cap(s){ return s.charAt(0).toUpperCase() + s.slice(1); }

/* ------------------------------------------------------------------ */
/* Generators                                                           */
/* ------------------------------------------------------------------ */
function productDistractors(api, r, pool){
  const seen = new Set([r.prod]), out = [];
  const add = x => { if (!seen.has(x.prod)){ seen.add(x.prod); out.push(x); } };
  api.shuffle(api.reactions.siblings(r)).forEach(add);
  if (out.length < 3){
    const rest = api.shuffle(pool.filter(x => x.id !== r.id && x.prod !== r.prod));
    const close = x => -Math.abs(countC(x.prod) - countC(r.prod)) + (x.reagent === r.reagent ? 1 : 0);
    rest.sort((a, b) => close(b) - close(a));
    rest.forEach(add);
  }
  return out.slice(0, 3);
}
function reagentDistractors(api, r, pool){
  const seen = new Set([label(r)]), out = [];
  const add = x => { const L = label(x); if (x.prod !== r.prod && !seen.has(L)){ seen.add(L); out.push(x); } };
  api.shuffle(api.reactions.siblings(r)).forEach(add);
  if (out.length < 3) api.shuffle(pool.filter(x => x.id !== r.id)).forEach(add);
  return out.slice(0, 3);
}
function finish(api, stem, correctChoice, otherChoices, extra){
  const choices = api.shuffle([correctChoice, ...otherChoices]);
  return Object.assign({ stem: cap(stem), sub: null, reagent: null, prod: null, choices, correct: choices.indexOf(correctChoice), home: meta.id, roots: ['l2-acidity', 'l2-arrows'], source: 'generated' }, extra);
}
function genProduct(api){
  const R = api.reactions, pool = R.byFamily('alpha');
  const r = api.pick(pool);
  const others = productDistractors(api, r, pool).map(x => ({ text: '', smiles: x.prod }));
  return finish(api, subName(R, r) + ' is treated with ' + label(r) + '. What is the major organic product?', { text: '', smiles: r.prod }, others, { sub: r.sub, reagent: label(r), coach: r.thomas, roots: r.roots, view: 'rxn', kind: 'product' });
}
function genReagent(api){
  const R = api.reactions, pool = R.byFamily('alpha');
  const r = api.pick(pool);
  const others = reagentDistractors(api, r, pool).map(x => ({ text: label(x), smiles: null }));
  return finish(api, 'Which reagent set takes ' + subName(R, r) + ' to this product?', { text: label(r), smiles: null }, others, { sub: r.sub, prod: r.prod, coach: r.thomas, roots: r.roots, view: 'rxn', kind: 'reagent' });
}
function genSite(api){
  const R = api.reactions, ST = stepsFor(R);
  const id = api.pick(['aldol', 'claisen', 'michael', 'michael']);
  const r = R.find(id), st = ST[id];
  const correct = SITES.find(s => s.k === st.site);
  const choices = SITES.map(s => ({ text: s.text, smiles: null }));
  const c = choices[SITES.indexOf(correct)];
  const coach = st.site === '1,4' ? 'A soft, stabilized enolate goes for the far end of the enone: 1,4, the beta carbon, because the minus that lands there is spread onto the carbonyl oxygen.'
    : 'A plain carbonyl has one hungry spot, the carbonyl carbon, so the enolate adds 1,2 right there.';
  return finish(api, 'The enolate of ' + subName(R, r) + ' meets ' + st.partnerName + '. Where does its alpha carbon attack?', c, choices.filter(x => x !== c), { sub: st.inter, reagent: st.partnerName, coach, roots: r.roots, view: 'mol', kind: 'site' });
}
function genWhich(api){
  const R = api.reactions;
  const key = api.pick(Object.keys(WHICH));
  const w = WHICH[key], sub = R.SUBSTRATES[key];
  const correct = { text: w.correct, smiles: null };
  const others = w.others.map(t => ({ text: t, smiles: null }));
  const coach = key === 'diketone' ? 'Between two carbonyls the minus spreads onto two oxygens, so that CH2 is the most acidic spot by far.'
    : key === 'ethyl_acetate' ? 'Alpha means one carbon over from the C=O on the carbon side. The ethyl group hangs off the oxygen, so its carbons are not alpha.'
    : 'Alpha means one carbon over from the C=O. That C-H is acidic because the enolate spreads the minus onto the oxygen.';
  return finish(api, 'Base arrives at ' + sub.name + '. Which carbon gives up a proton and becomes the nucleophile?', correct, others, { sub: sub.smi, coach, roots: ['l2-acidity', 'l2-resonance'], view: 'mol', kind: 'which' });
}
function genItem(api){
  const x = api.rng();
  if (x < 0.35) return genProduct(api);
  if (x < 0.55) return genReagent(api);
  if (x < 0.78) return genSite(api);
  return genWhich(api);
}
function trimBank(api, it){
  const item = api.bank.toItem(it);
  while (item.choices.length > 4){
    const idx = api.pick(item.choices.map((c, i) => i).filter(i => i !== item.correct));
    item.choices.splice(idx, 1);
    if (idx < item.correct) item.correct--;
  }
  return item;
}
export function makeItem(api){
  const bank = api.bank && api.bank.items ? api.bank.items(meta.id) : [];
  if (bank.length && api.rng() < 0.4) return trimBank(api, api.pick(bank));
  return genItem(api);
}

function mulberry(seed){ let s = seed | 0; return function(){ s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function tinyApi(deps, seed){
  const rng = mulberry(seed);
  return { rng, seed(){}, pick(a){ return a[Math.floor(rng() * a.length)]; }, shuffle(a){ const b = a.slice(); for (let i = b.length - 1; i > 0; i--){ const j = Math.floor(rng() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; }, reactions: deps.reactions, bank: deps.bank };
}
export function selfTest(deps){
  let tried = 0;
  try {
    const R = deps.reactions, ST = stepsFor(R);
    for (const r of R.byFamily('alpha')) if (!ST[r.id]) throw new Error('no steps for ' + r.id);
    // every enolate drawing puts the minus on a carbon next to a carbonyl; the doubly activated one sits between two
    for (const [key, w] of Object.entries(WHICH)){
      const n = enolateStabilizers(w.inter);
      if (n < 1) throw new Error(key + ': the drawn enolate is not alpha to a carbonyl');
      if (key === 'diketone' && n !== 2) throw new Error('acetylacetone enolate should sit between two carbonyls');
      if (countC(w.inter) !== countC(R.SUBSTRATES[key].smi)) throw new Error(key + ': enolate carbon count');
    }
    for (const id of ['aldol', 'claisen', 'michael', 'enolate_alkylation']) if (enolateStabilizers(ST[id].inter) < 1) throw new Error(id + ' intermediate is not an enolate');
    if (countC(R.find('aldol').prod) !== 2 * countC(R.find('aldol').sub)) throw new Error('aldol should double the carbons');
    if (countC(R.find('decarboxylation').prod) !== countC(R.find('decarboxylation').sub) - 1) throw new Error('decarboxylation should lose one carbon');
    for (const s of SMILES) if (!smilesSane(s)) throw new Error('bad SMILES ' + s);
    const api = tinyApi(deps, 47);
    const kinds = {};
    for (let i = 0; i < 400; i++){
      const it = makeItem(api); tried++;
      if (!it || it.home !== meta.id) throw new Error('home');
      if (!Array.isArray(it.roots) || !it.roots.length) throw new Error('roots');
      if (!it.coach || !it.stem) throw new Error('coach or stem');
      if (it.choices.length !== 4) throw new Error('need 4 choices in ' + it.kind);
      const keys = it.choices.map(c => (c.smiles || '') + '|' + (c.text || ''));
      if (new Set(keys).size !== 4) throw new Error('choices not distinct: ' + keys.join(' / '));
      if (!(it.correct >= 0 && it.correct < 4)) throw new Error('correct index');
      for (const s of [it.sub, it.prod].concat(it.choices.map(c => c.smiles))) if (s != null && !smilesSane(s)) throw new Error('unbalanced SMILES ' + s);
      kinds[it.kind] = (kinds[it.kind] || 0) + 1;
    }
    const a = makeItem(tinyApi(deps, 11)), b = makeItem(tinyApi(deps, 11));
    if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error('not reproducible');
    return { ok: true, tried, notes: Object.entries(kinds).map(([k, v]) => k + ' ' + v).join(', ') };
  } catch (e){ return { ok: false, tried, notes: e.message }; }
}

/* ------------------------------------------------------------------ */
/* Mount                                                                */
/* ------------------------------------------------------------------ */
function reveal(api, node, delay){
  if (api.reduced){ node.style.opacity = '1'; node.style.transform = 'none'; return; }
  node.style.opacity = '0'; node.style.transform = 'translateX(-12px)';
  node.style.transition = 'opacity .5s ease ' + (delay || 0) + 'ms, transform .5s ease ' + (delay || 0) + 'ms';
  requestAnimationFrame(() => requestAnimationFrame(() => { node.style.opacity = '1'; node.style.transform = 'none'; }));
}
function molSize(smi){
  const n = parseSmiles(smi).atoms.length, ring = /\d/.test(smi.replace(/\[[^\]]*\]/g, ''));
  const w = Math.max(120, Math.min(300, 70 + 18 * n)), h = Math.max(84, Math.min(170, (ring ? 90 : 62) + 9 * n));
  return { width: w, height: h };
}
function drawMol(api, target, smi, label, max){
  const wrap = api.el('div', { style: { maxWidth: max || '240px', margin: '0 auto' } });
  api.drawSmiles(wrap, smi, Object.assign(molSize(smi), { label: label || ('structure ' + smi) }));
  target.append(wrap);
  return wrap;
}
// the drawer does not print a charge on a carbon, so a box that holds an anion gets a mark in its corner
function chargeMark(api, box, sign, color){
  box.style.position = 'relative';
  box.append(api.el('span', { 'aria-hidden': 'true', style: { position: 'absolute', top: '8px', right: '8px', width: '22px', height: '22px', borderRadius: '50%', border: '2px solid ' + color, color, display: 'grid', placeItems: 'center', fontFamily: 'ui-monospace, Menlo, monospace', fontSize: '15px', lineHeight: '1', fontWeight: '700' }, text: sign }));
}
function molBox(api, smi, caption, o){
  const { el } = api, C = api.colors;
  const box = el('div', { class: 'box' });
  drawMol(api, box, smi, caption, (o && o.max) || '240px');
  if (caption) box.append(el('div', { style: { textAlign: 'center', fontFamily: 'Georgia, serif', fontSize: '14px', color: C.ink2, marginTop: '2px' }, text: caption }));
  if (/\[[^\]]*-\]/.test(smi)) chargeMark(api, box, '-', C.blue);
  return box;
}
function arrowEl(api, top, bottom){
  const { el } = api;
  return el('div', { class: 'arrow' }, el('span', { class: 'reagent', text: top || '' }), el('div', { class: 'line' }), el('span', { text: bottom || '' }));
}
function badge(api, text, color){
  const { el } = api;
  return el('span', { style: { display: 'inline-block', padding: '4px 10px', borderRadius: '999px', border: '1px solid ' + color, color, fontFamily: 'ui-monospace, Menlo, monospace', fontSize: '12px', letterSpacing: '.04em', background: 'rgba(255,255,255,.02)' }, text });
}

export function mount(slots, api){
  const { el } = api, C = api.colors, R = api.reactions;
  const fam = R.byFamily('alpha'), ST = stepsFor(R);

  /* ---------- VISUAL: substrate, reaction, then the move plays in two steps ---------- */
  let subKey = SUBS[0], picked = R.find('aldol'), heat = false, timers = [];
  const subChips = el('div', { class: 'controls', role: 'group', 'aria-label': 'Pick the substrate' });
  const rxChips = el('div', { class: 'controls', role: 'group', 'aria-label': 'Pick the reaction' });
  const stage = el('div', { style: { marginTop: '12px', display: 'grid', gap: '10px' } });
  const badges = el('div', { class: 'controls', style: { gap: '6px' } });
  const caption = el('p', { style: { margin: '10px 0 0', color: C.ink2, fontSize: '15px', minHeight: '3em' } });
  const playBtn = el('button', { type: 'button', class: 'primary', text: 'Play the move', onClick: () => play() });
  function clearTimers(){ timers.forEach(clearTimeout); timers = []; }
  function later(fn, ms){ if (api.reduced){ fn(); return; } timers.push(setTimeout(fn, ms)); }

  function renderSubs(){
    subChips.replaceChildren(el('span', { class: 'eyebrow', text: 'Substrate' }));
    for (const k of SUBS) subChips.append(el('button', { type: 'button', class: 'chip', 'aria-pressed': k === subKey ? 'true' : 'false', text: R.SUBSTRATES[k].name, onClick: () => { subKey = k; picked = fam.find(r => r.subClass === k && !(k === 'acetaldehyde' && r.id === 'aldol_condensation')) || null; heat = false; renderSubs(); renderRx(); play(); } }));
  }
  function renderRx(){
    rxChips.replaceChildren(el('span', { class: 'eyebrow', text: 'Reaction' }));
    const list = fam.filter(r => r.subClass === subKey && r.id !== 'aldol_condensation');
    for (const r of list) rxChips.append(el('button', { type: 'button', class: 'chip', 'aria-pressed': picked && (picked === r || (r.id === 'aldol' && picked.id === 'aldol_condensation')) ? 'true' : 'false', text: r.reagent, title: r.name, onClick: () => { picked = r; heat = false; renderRx(); play(); } }));
    if (subKey === 'acetaldehyde'){
      rxChips.append(el('span', { class: 'eyebrow', style: { marginLeft: '8px' }, text: 'then' }));
      for (const h of [false, true]) rxChips.append(el('button', { type: 'button', class: 'chip', 'aria-pressed': heat === h ? 'true' : 'false', text: h ? 'heat' : 'cold', onClick: () => { heat = h; picked = R.find(h ? 'aldol_condensation' : 'aldol'); renderRx(); play(); } }));
    }
  }
  function play(){
    clearTimers(); stage.replaceChildren(); badges.replaceChildren();
    const sub = R.SUBSTRATES[subKey];
    if (!picked){ stage.append(el('div', { class: 'rxn' }, molBox(api, sub.smi, sub.name), arrowEl(api, '?', ''), el('div', { class: 'box q', text: '?' }))); caption.textContent = 'Pick a reaction.'; return; }
    const r = picked, st = ST[r.id];
    // step 1: wake it up
    const row1 = el('div', { class: 'rxn' });
    const inter = molBox(api, st.inter, st.interName);
    const a1 = arrowEl(api, st.wake, st.wakeCond);
    row1.append(molBox(api, sub.smi, sub.name + ', the alpha carbon is next to the C=O'), a1, inter);
    stage.append(row1);
    reveal(api, a1, 100); reveal(api, inter, 400);
    // step 2: attack
    const row2 = el('div', { class: 'rxn' });
    const left = molBox(api, st.inter, 'the same nucleophile');
    const a2 = arrowEl(api, st.partnerName, st.attack);
    const prod = molBox(api, r.prod, r.name);
    row2.append(left, a2, prod);
    if (st.partner){
      const p = el('div', { style: { textAlign: 'center', fontSize: '12px', color: C.ink3, fontFamily: 'ui-monospace, Menlo, monospace', letterSpacing: '.08em', textTransform: 'uppercase' }, text: 'partner' });
      const pw = el('div', { class: 'box', style: { maxWidth: '200px', margin: '0 auto' } });
      drawMol(api, pw, st.partner, st.partnerName, '170px');
      pw.append(el('div', { style: { textAlign: 'center', fontFamily: 'Georgia, serif', fontSize: '13px', color: C.ink2 }, text: st.partnerName }));
      const partnerWrap = el('div', {}, p, pw);
      stage.append(partnerWrap); reveal(api, partnerWrap, 900);
    }
    stage.append(row2);
    row2.style.opacity = '0';
    later(() => { row2.style.transition = api.reduced ? '' : 'opacity .4s ease'; row2.style.opacity = '1'; reveal(api, a2, 0); reveal(api, prod, 300); }, 1300);
    const list = [
      badge(api, 'alpha carbon ' + st.attack + (st.site === '1,2' || st.site === '1,4' ? ' (' + st.site + ')' : ''), st.site === '1,4' ? C.coral : C.gold),
      badge(api, st.bond, C.blue),
      badge(api, st.ending, C.green)
    ];
    if (r.id === 'aldol') list.push(badge(api, 'cold: the OH stays', C.amber));
    if (r.id === 'aldol_condensation') list.push(badge(api, 'heat: water leaves, C=C conjugated to C=O', C.amber));
    later(() => list.forEach((b, i) => { badges.append(b); reveal(api, b, i * 120); }), 1900);
    caption.textContent = r.thomas + ' ' + r.trap;
  }
  slots.visual.append(subChips, rxChips, el('div', { class: 'controls' }, playBtn), stage, badges, caption);
  renderSubs(); renderRx(); play();

  /* ---------- YOU TRY: generated items alternate with bank items ---------- */
  const bank = api.bank && api.bank.items ? api.bank.items(meta.id) : [];
  let n = 0, item = null, firstTry = true, done = false;
  const tryBox = el('div', { class: 'item' });
  slots.try.append(tryBox);
  function choiceNode(ch){
    if (ch.smiles){
      const w = el('span', { style: { display: 'block' } });
      drawMol(api, w, ch.smiles, ch.text || 'structure ' + ch.smiles, '200px');
      if (ch.text) w.append(el('span', { style: { display: 'block', textAlign: 'center', fontSize: '14px', color: C.ink2 }, text: ch.text }));
      return w;
    }
    return el('span', { text: ch.text });
  }
  function shortWhy(t){
    const parts = String(t || '').split(/(?<=\.)\s+/);
    let out = '';
    for (const p of parts){ if (/RDKit|\bopt\d|keyed|SMILES/i.test(p)) break; out += (out ? ' ' : '') + p; if (out.length > 180) break; }
    return out || String(t || '');
  }
  function render(){
    tryBox.replaceChildren();
    tryBox.append(el('p', { class: 'prompt', text: item.stem }));
    if (item.source === 'bank'){
      if (item.sub){ const b = el('div', { class: 'box', style: { maxWidth: '420px', margin: '0 auto' } }); drawMol(api, b, item.sub, 'the structure in the question', item.sub.includes('.') ? '400px' : '280px'); tryBox.append(b); }
      tryBox.append(el('p', { class: 'eyebrow', style: { margin: '10px 0 0' }, text: 'From the verified bank, DAT phrasing' }));
    } else if (item.view === 'mol' && item.sub){
      const b = molBox(api, item.sub, item.kind === 'site' ? 'the enolate' : null, { max: '260px' });
      b.style.maxWidth = '360px'; b.style.margin = '0 auto';
      tryBox.append(b);
    } else if (item.sub){
      const row = el('div', { class: 'rxn' });
      row.append(molBox(api, item.sub, null, { max: '220px' }));
      row.append(arrowEl(api, item.kind === 'reagent' ? '?' : item.reagent, ''));
      row.append(item.prod ? molBox(api, item.prod, null, { max: '220px' }) : el('div', { class: 'box q', text: '?' }));
      tryBox.append(row);
    }
    const opts = el('div', { class: 'opts' });
    const btns = item.choices.map((ch, i) => {
      const b = el('button', { type: 'button', class: 'opt', 'aria-label': ch.text || ('structure ' + ch.smiles) }, el('span', { class: 'k', text: 'ABCDE'[i] }), choiceNode(ch));
      b.addEventListener('click', () => {
        if (done) return;
        btns.forEach(x => x.classList.remove('picked')); b.classList.add('picked');
        if (i === item.correct){
          b.classList.add('ok'); btns.forEach(x => { x.disabled = true; }); done = true; api.report(firstTry); api.clearCoach();
          tryBox.append(el('div', { class: 'verdict good', text: 'You can read it.' }), el('div', { class: 'controls' }, el('button', { type: 'button', class: 'primary', text: 'Another one', onClick: next })));
        } else {
          if (firstTry) api.report(false); firstTry = false;
          if (!tryBox.querySelector('.verdict')) tryBox.append(el('div', { class: 'verdict notyet', text: 'Not yet.' }));
          api.coach(item.source === 'bank' ? shortWhy(item.coach) : item.coach);
        }
      });
      return b;
    });
    opts.append(...btns); tryBox.append(opts);
  }
  function next(){
    api.clearCoach(); firstTry = true; done = false;
    const useBank = bank.length && n % 2 === 1;
    item = useBank ? api.bank.toItem(api.pick(bank)) : genItem(api);
    n++; render();
  }
  next();
}
