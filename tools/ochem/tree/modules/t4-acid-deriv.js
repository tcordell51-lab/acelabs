// The Tree of Organic, Level 4, module 6: Only down the ladder.
// Carboxylic acid derivatives ranked by reactivity; hydrides that stop halfway. No imports (contract).

export const meta = {
  id: 't4-acid-deriv',
  level: 4,
  order: 6,
  needs3D: false,
  title: 'Only down the ladder',
  concept: 'Acids and their derivatives',
  tagline: 'Acid chloride on top, amide on the bottom. Down is free, up needs activation.',
  story: 'Line the family up on a ladder by how badly the carbonyl carbon is hurting. Acid chloride sits on top, the diva of the family, so reactive that plain water takes it apart. Then the anhydride, then the ester and the acid sharing a rung, then the amide at the bottom, where the nitrogen donates into the carbonyl and locks it down. The rule: you can always go down the ladder. A nucleophile attacks, kicks out the better leaving group, attaches. You cannot go up without activation, and SOCl2 is the activator that turns an acid into the diva. Hydrolysis in acid is reversible; saponification in base is not, because the carboxylate cannot go back. Hydrides: LiAlH4 takes an ester to two alcohols, an amide to an amine with the nitrogen kept, a nitrile to a primary amine. DIBAL cold stops at the aldehyde, Gilman stops at the ketone, a Grignard hits twice. Rule of thumb: better leaving group, higher rung, easier to attack.',
  moveName: 'Place both molecules on the ladder, then check the direction',
  move: [
    'Name the rung of the starting material: acid chloride, anhydride, ester or acid, amide.',
    'Name what the nucleophile would leave behind. Going down the ladder, the leaving group is better than the nucleophile, so the move is attack, kick it off, attach.',
    'Going up? Stop. You need activation first: SOCl2 turns the acid into the acid chloride, then everything below is reachable.',
    'Hydrides and Grignards are the exception that leave the ladder: LiAlH4 goes all the way, DIBAL cold and the bulky hydride stop at the aldehyde, Gilman stops at the ketone, a Grignard hits twice.'
  ],
  trap: 'Careful: LiAlH4 turns an amide into an amine, not an alcohol. The nitrogen stays and the oxygen is the one that leaves.',
  holdsUp: ['Every acyl substitution', 'Saponification versus hydrolysis', 'Which hydride stops where', 'Amine synthesis from amides and nitriles', 'Multi-step synthesis through the acid chloride'],
  drill: 'Booster OChem: Carboxylic Acid Derivatives'
};

// Every SMILES this module draws that is not in shared/reactions.js.
export const SMILES = ['CC(=O)OC(C)=O'];

/* ------------------------------------------------------------------ */
/* Tiny SMILES graph, node-safe: enough to say which rung a molecule    */
/* sits on. Answers are computed from the table with it.                */
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
function alcoholClass(smi){
  const g = parseSmiles(smi);
  for (let i = 0; i < g.atoms.length; i++){
    if (g.atoms[i].el !== 'O') continue;
    const nb = neighbors(g, i);
    if (nb.length !== 1 || nb[0].order !== 1) continue;
    const c = nb[0].j; if (g.atoms[c].el !== 'C') continue;
    const cn = neighbors(g, c);
    if (cn.some(x => x.order === 2 && g.atoms[x.j].el === 'O')) continue;
    const carbons = cn.filter(x => g.atoms[x.j].el === 'C').length;
    return carbons <= 1 ? 'primary' : carbons === 2 ? 'secondary' : 'tertiary';
  }
  return null;
}
// Which rung (or which off-ladder class) a molecule is.
export function classify(smi){
  const g = parseSmiles(smi);
  for (let i = 0; i < g.atoms.length; i++){
    if (g.atoms[i].el !== 'C') continue;
    const nb = neighbors(g, i);
    const dblO = nb.find(x => x.order === 2 && g.atoms[x.j].el === 'O');
    if (!dblO) continue;
    const others = nb.filter(x => x !== dblO);
    if (others.some(x => g.atoms[x.j].el === 'Cl')) return 'acid chloride';
    if (others.some(x => g.atoms[x.j].el === 'N')) return 'amide';
    const o = others.find(x => g.atoms[x.j].el === 'O' && x.order === 1);
    if (o){
      const on = neighbors(g, o.j).filter(x => x.j !== i);
      if (!on.length) return g.atoms[o.j].charge < 0 ? 'carboxylate' : 'acid';
      const ocn = neighbors(g, on[0].j);
      return ocn.some(x => x.order === 2 && g.atoms[x.j].el === 'O') ? 'anhydride' : 'ester';
    }
    return others.filter(x => g.atoms[x.j].el === 'C').length >= 2 ? 'ketone' : 'aldehyde';
  }
  if (g.bonds.some(b => b.order === 3 && ((g.atoms[b.a].el === 'C' && g.atoms[b.b].el === 'N') || (g.atoms[b.b].el === 'C' && g.atoms[b.a].el === 'N')))) return 'nitrile';
  const ac = alcoholClass(smi); if (ac) return ac + ' alcohol';
  const ni = g.atoms.findIndex(a => a.el === 'N');
  if (ni >= 0){ const cn = neighbors(g, ni).length; return (cn <= 1 ? 'primary' : cn === 2 ? 'secondary' : 'tertiary') + ' amine'; }
  return 'other';
}
const RANK = { 'acid chloride': 1, anhydride: 2, ester: 3, acid: 3, carboxylate: 3, amide: 4 };
function smilesSane(s){
  if (typeof s !== 'string' || !s) return false;
  const t = s.replace(/\[[^\]]*\]/g, 'X');
  let d = 0; for (const c of t){ if (c === '(') d++; else if (c === ')'){ d--; if (d < 0) return false; } }
  if (d) return false;
  const cnt = {}; for (const c of t.replace(/%\d\d/g, '')) if (/\d/.test(c)) cnt[c] = (cnt[c] || 0) + 1;
  return Object.values(cnt).every(n => n % 2 === 0);
}

/* ------------------------------------------------------------------ */
/* Module data                                                          */
/* ------------------------------------------------------------------ */
function ladder(R){
  return [
    { key: 'acid_chloride', cls: 'acid chloride', name: 'acetyl chloride', smi: R.SUBSTRATES.acid_chloride.smi, rank: 1, tag: 'the diva: chloride is the best leaving group' },
    { key: 'anhydride', cls: 'anhydride', name: 'acetic anhydride', smi: 'CC(=O)OC(C)=O', rank: 2, tag: 'a carboxylate leaves, still very good' },
    { key: 'ester', cls: 'ester', name: 'methyl acetate', smi: R.SUBSTRATES.ester.smi, rank: 3, tag: 'alkoxide leaves; shares a rung with the acid' },
    { key: 'acid', cls: 'acid', name: 'acetic acid', smi: R.SUBSTRATES.acid.smi, rank: 3, tag: 'hydroxide leaves; shares a rung with the ester' },
    { key: 'amide', cls: 'amide', name: 'acetamide', smi: R.SUBSTRATES.amide.smi, rank: 4, tag: 'nitrogen donates into the carbonyl and locks it' }
  ];
}
const COUSIN = { key: 'nitrile', cls: 'nitrile', name: 'propanenitrile', tag: 'the cousin: same oxidation level as an acid' };
const HYDRIDES = [
  { name: 'NaBH4', match: /^NaBH4/, note: 'weak: aldehydes and ketones only' },
  { name: 'LiAlH4', match: /LiAlH4/, note: 'strong: goes all the way' },
  { name: 'DIBAL-H, cold', match: /DIBAL/, note: 'one equivalent at -78 C stops at the aldehyde' },
  { name: 'LiAlH(OtBu)3, cold', match: /OtBu/, note: 'bulky: adds once' }
];
const HYDRIDE_ROWS = ['acid_chloride', 'ester', 'acid', 'amide', 'nitrile'];
function label(r){ return [r.reagent, r.cond].filter(Boolean).join(', '); }
function subName(R, r){ return R.SUBSTRATES[r.subClass].name; }
function cap(s){ return s.charAt(0).toUpperCase() + s.slice(1); }
// direction of a verified reaction on the ladder
function direction(r){
  const a = RANK[classify(r.sub)], b = RANK[classify(r.prod)];
  if (a == null || b == null) return 'off';
  return b > a ? 'down' : b < a ? 'up' : 'same';
}

/* ------------------------------------------------------------------ */
/* Generators                                                           */
/* ------------------------------------------------------------------ */
function productDistractors(api, r, pool){
  const seen = new Set([r.prod]), out = [];
  const add = x => { if (!seen.has(x.prod)){ seen.add(x.prod); out.push(x); } };
  api.shuffle(api.reactions.siblings(r)).forEach(add);
  if (out.length < 3){
    const rest = api.shuffle(pool.filter(x => x.id !== r.id && x.prod !== r.prod));
    rest.sort((a, b) => (b.reagent === r.reagent ? 2 : 0) - (a.reagent === r.reagent ? 2 : 0));
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
  return Object.assign({ stem: cap(stem), sub: null, reagent: null, prod: null, choices, correct: choices.indexOf(correctChoice), home: meta.id, roots: ['l2-bully', 'l2-arrows'], source: 'generated' }, extra);
}
function genProduct(api){
  const R = api.reactions, pool = R.byFamily('acids');
  const r = api.pick(pool);
  const others = productDistractors(api, r, pool).map(x => ({ text: '', smiles: x.prod }));
  return finish(api, subName(R, r) + ' is treated with ' + label(r) + '. What is the major organic product?', { text: '', smiles: r.prod }, others, { sub: r.sub, reagent: label(r), coach: r.thomas, roots: r.roots, view: 'rxn', kind: 'product' });
}
function genReagent(api){
  const R = api.reactions, pool = R.byFamily('acids');
  const r = api.pick(pool);
  const others = reagentDistractors(api, r, pool).map(x => ({ text: label(x), smiles: null }));
  return finish(api, 'Which reagent set takes ' + subName(R, r) + ' to this product?', { text: label(r), smiles: null }, others, { sub: r.sub, prod: r.prod, coach: r.thomas, roots: r.roots, view: 'rxn', kind: 'reagent' });
}
function genRank(api){
  const L = ladder(api.reactions);
  const shared = api.pick(['ester', 'acid']);
  const four = L.filter(x => x.key !== (shared === 'ester' ? 'acid' : 'ester'));
  const most = api.rng() < 0.5;
  const target = four.reduce((m, x) => (most ? x.rank < m.rank : x.rank > m.rank) ? x : m, four[0]);
  const correct = { text: target.name, smiles: target.smi };
  const others = four.filter(x => x !== target).map(x => ({ text: x.name, smiles: x.smi }));
  const coach = most ? 'Best leaving group wins: chloride first, then a carboxylate (anhydride), then alkoxide or hydroxide, and the amide last because its nitrogen donates into the carbonyl.'
    : 'The amide is the bottom rung: nitrogen pushes its lone pair into the carbonyl, so that carbon is the least hungry of the family.';
  return finish(api, 'Which of these is the ' + (most ? 'most' : 'least') + ' reactive toward a nucleophile?', correct, others, { coach, roots: ['l2-resonance', 'l2-bully'], view: 'none', kind: 'rank' });
}
function genLah(api){
  const R = api.reactions, pool = R.byFamily('acids');
  const lah = pool.filter(r => /LiAlH4/.test(r.reagent));
  const r = api.pick(lah);
  const others = productDistractors(api, r, pool).map(x => ({ text: '', smiles: x.prod }));
  return finish(api, subName(R, r) + ' plus LiAlH4, then water. What comes out?', { text: '', smiles: r.prod }, others, { sub: r.sub, reagent: label(r), coach: r.thomas, roots: r.roots, view: 'rxn', kind: 'lah' });
}
function genItem(api){
  const x = api.rng();
  if (x < 0.35) return genProduct(api);
  if (x < 0.6) return genReagent(api);
  if (x < 0.8) return genRank(api);
  return genLah(api);
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
    const R = deps.reactions;
    // the classifier agrees with the ladder and with the table
    for (const rung of ladder(R)) if (classify(rung.smi) !== rung.cls) throw new Error(rung.name + ' classified as ' + classify(rung.smi));
    if (classify(R.SUBSTRATES.nitrile.smi) !== 'nitrile') throw new Error('nitrile');
    if (direction(R.find('acid_socl2')) !== 'up') throw new Error('SOCl2 should climb');
    if (direction(R.find('acyl_ester')) !== 'down') throw new Error('acid chloride to ester should descend');
    if (direction(R.find('acid_fischer')) !== 'same') throw new Error('acid to ester should be the same rung');
    if (classify(R.find('amide_lah').prod) !== 'primary amine') throw new Error('amide plus LiAlH4 should be a primary amine');
    if (classify(R.find('ester_dibal').prod) !== 'aldehyde') throw new Error('DIBAL should stop at the aldehyde');
    if (classify(R.find('acyl_gilman').prod) !== 'ketone') throw new Error('Gilman should stop at the ketone');
    if (classify(R.find('ester_grignard').prod) !== 'tertiary alcohol') throw new Error('two Grignards should give a tertiary alcohol');
    if (classify(R.find('ester_saponification').prod) !== 'carboxylate') throw new Error('saponification gives the carboxylate');
    for (const s of SMILES) if (!smilesSane(s)) throw new Error('bad SMILES ' + s);
    const api = tinyApi(deps, 43);
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
      if (it.kind === 'rank'){
        const ranks = it.choices.map(c => RANK[classify(c.smiles)]);
        if (new Set(ranks).size !== 4) throw new Error('rank item has a tie');
      }
      kinds[it.kind] = (kinds[it.kind] || 0) + 1;
    }
    const a = makeItem(tinyApi(deps, 9)), b = makeItem(tinyApi(deps, 9));
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
function molBox(api, smi, caption, o){
  const { el } = api, C = api.colors;
  const box = el('div', { class: 'box' });
  drawMol(api, box, smi, caption, (o && o.max) || '240px');
  if (caption) box.append(el('div', { style: { textAlign: 'center', fontFamily: 'Georgia, serif', fontSize: '14px', color: C.ink2, marginTop: '2px' }, text: caption }));
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
  const fam = R.byFamily('acids');
  const L = ladder(R);
  const rungs = L.concat([Object.assign({ smi: R.SUBSTRATES.nitrile.smi, rank: null }, COUSIN)]);

  /* ---------- VISUAL: the ladder, a reagent per rung, the hydride grid ---------- */
  let rung = L[0], picked = fam.find(r => r.subClass === 'acid_chloride') || null;
  const wrap = el('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'flex-start' } });
  const ladderEl = el('div', { role: 'group', 'aria-label': 'The reactivity ladder', style: { flex: '0 0 250px', maxWidth: '100%' } });
  const right = el('div', { style: { flex: '1 1 440px', minWidth: '0' } });
  const chips = el('div', { class: 'controls', style: { marginTop: '0' } });
  const stage = el('div', { style: { marginTop: '12px' } });
  const badges = el('div', { class: 'controls', style: { gap: '6px' } });
  const caption = el('p', { style: { margin: '10px 0 0', color: C.ink2, fontSize: '15px', minHeight: '3em' } });
  const rungBtns = [];

  function renderLadder(){
    ladderEl.replaceChildren(el('div', { class: 'eyebrow', style: { marginBottom: '6px' }, text: 'Most reactive on top' }));
    rungs.forEach((x, i) => {
      const on = x === rung;
      const b = el('button', { type: 'button', 'aria-pressed': on ? 'true' : 'false', title: x.tag, style: { display: 'grid', gridTemplateColumns: '96px 1fr', gap: '8px', alignItems: 'center', width: '100%', textAlign: 'left', minHeight: '58px', padding: '6px 10px', borderRadius: '12px', border: '1px solid ' + (on ? C.gold : C.line), background: on ? 'rgba(201,168,76,.12)' : 'rgba(255,255,255,.02)', color: on ? C.ink : C.ink2, marginTop: i === 5 ? '14px' : '0' }, onClick: () => { rung = x; picked = fam.find(r => r.subClass === x.key) || null; renderLadder(); renderChips(); renderRow(); } });
      const m = el('span', { style: { display: 'block' } });
      api.drawSmiles(m, x.smi, Object.assign(molSize(x.smi), { label: x.name }));
      b.append(m, el('span', {}, el('span', { style: { display: 'block', fontFamily: 'Georgia, serif', fontSize: '15px', color: on ? C.goldhi : C.ink }, text: x.name }), el('span', { style: { display: 'block', fontSize: '12px', color: C.ink3 }, text: x.rank == null ? 'the cousin' : 'rung ' + x.rank })));
      ladderEl.append(b); rungBtns.push(b);
      if (i < 4) ladderEl.append(el('div', { style: { height: '14px', borderLeft: '2px solid ' + C.line, marginLeft: '50px', position: 'relative' } }, el('span', { style: { position: 'absolute', left: '8px', top: '-3px', fontFamily: 'ui-monospace, Menlo, monospace', fontSize: '10px', letterSpacing: '.1em', textTransform: 'uppercase', color: C.ink3 }, text: i === 2 ? 'same rung' : 'down is free' })));
      if (i === 4) ladderEl.append(el('div', { style: { marginTop: '8px', fontSize: '12px', color: C.amber, fontFamily: 'ui-monospace, Menlo, monospace', letterSpacing: '.04em' }, text: 'Up needs activation: SOCl2 lifts the acid to the top rung.' }));
    });
  }
  function renderChips(){
    chips.replaceChildren(el('span', { class: 'eyebrow', text: 'Reagent on ' + rung.name }));
    const list = fam.filter(r => r.subClass === rung.key);
    if (!list.length){ chips.append(el('span', { style: { fontSize: '14px', color: C.ink2 }, text: 'The verified table has no anhydride reactions yet. It behaves one rung under the acid chloride: any nucleophile takes it down, and a carboxylate leaves.' })); return; }
    for (const r of list) chips.append(el('button', { type: 'button', class: 'chip', 'aria-pressed': picked === r ? 'true' : 'false', text: r.reagent, title: r.name, onClick: () => { picked = r; renderChips(); renderRow(); } }));
  }
  function renderRow(){
    stage.replaceChildren(); badges.replaceChildren();
    const row = el('div', { class: 'rxn' });
    row.append(molBox(api, rung.smi, rung.name));
    if (!picked){
      row.append(arrowEl(api, '?', ''), el('div', { class: 'box q', text: '?' }));
      stage.append(row); caption.textContent = rung.tag + '.';
      return;
    }
    const r = picked;
    const arrow = arrowEl(api, r.reagent, r.cond), prod = molBox(api, r.prod, r.name);
    row.append(arrow, prod); stage.append(row);
    reveal(api, arrow, 0); reveal(api, prod, 250);
    const dir = direction(r), pc = classify(r.prod);
    const dirBadge = dir === 'down' ? badge(api, 'down the ladder: ' + classify(r.sub) + ' to ' + pc, C.green)
      : dir === 'up' ? badge(api, 'climbs the ladder: ' + classify(r.sub) + ' to ' + pc + ', needs ' + label(r), C.amber)
      : dir === 'same' ? badge(api, 'same rung: ' + classify(r.sub) + ' to ' + pc + ', reversible', C.amber)
      : badge(api, 'leaves the ladder: ' + pc, C.blue);
    const list = [dirBadge, badge(api, r.mech, C.ink2)];
    if (/LiAlH4|DIBAL|OtBu|NaBH4/.test(r.reagent)) list.push(badge(api, /DIBAL|OtBu/.test(r.reagent) ? 'stops halfway' : 'goes all the way', /DIBAL|OtBu/.test(r.reagent) ? C.gold : C.coral));
    if (/MgBr/.test(r.reagent)) list.push(badge(api, 'hits twice', C.coral));
    if (/CuLi/.test(r.reagent)) list.push(badge(api, 'stops at the ketone', C.gold));
    list.forEach((b, i) => { badges.append(b); reveal(api, b, 450 + i * 120); });
    caption.textContent = r.thomas + ' ' + r.trap;
  }

  // the hydride grid: rows are derivatives, columns are hydrides, cells come from the table
  const grid = el('div', { style: { marginTop: '16px', overflowX: 'auto' } });
  function renderGrid(){
    grid.replaceChildren(el('div', { class: 'eyebrow', style: { marginBottom: '6px' }, text: 'Which hydride stops where' }));
    const table = el('table', { style: { borderCollapse: 'collapse', width: '100%', minWidth: '520px', fontSize: '13px' } });
    const thead = el('tr', {}, el('th', { style: { textAlign: 'left', padding: '6px 8px', color: C.ink3, fontWeight: '400', fontFamily: 'ui-monospace, Menlo, monospace', fontSize: '11px', letterSpacing: '.1em', textTransform: 'uppercase' }, text: 'substrate' }));
    for (const h of HYDRIDES) thead.append(el('th', { style: { textAlign: 'left', padding: '6px 8px', color: C.goldhi, fontWeight: '400', fontFamily: 'ui-monospace, Menlo, monospace', fontSize: '12px' }, title: h.note, text: h.name }));
    table.append(thead);
    for (const key of HYDRIDE_ROWS){
      const x = rungs.find(z => z.key === key);
      const tr = el('tr', { style: { borderTop: '1px solid ' + C.line } });
      tr.append(el('td', { style: { padding: '8px', fontFamily: 'Georgia, serif', fontSize: '14px', color: C.ink } }, x.name));
      for (const h of HYDRIDES){
        const r = fam.find(z => z.subClass === key && h.match.test(z.reagent));
        const td = el('td', { style: { padding: '6px 8px' } });
        if (r){
          td.append(el('button', { type: 'button', class: 'chip', style: { minHeight: '34px', padding: '4px 10px', fontSize: '13px', color: C.ink, borderColor: /DIBAL|OtBu/.test(h.name) ? C.gold : C.line }, text: classify(r.prod), title: r.name, onClick: () => { rung = x; picked = r; renderLadder(); renderChips(); renderRow(); stage.scrollIntoView({ block: 'nearest', behavior: api.reduced ? 'auto' : 'smooth' }); } }));
        } else if (h.name === 'NaBH4') td.append(el('span', { style: { color: C.ink3 }, text: 'leaves it alone' }));
        else td.append(el('span', { style: { color: C.ink3 }, text: 'not asked' }));
        tr.append(td);
      }
      table.append(tr);
    }
    grid.append(table, el('p', { style: { margin: '8px 0 0', fontSize: '14px', color: C.ink2 }, text: 'Tap a cell to run it. NaBH4 is weak, aldehydes and ketones only. LiAlH4 goes all the way. DIBAL-H cold and the bulky LiAlH(OtBu)3 add once and stop at the aldehyde.' }));
  }
  right.append(chips, stage, badges, caption);
  wrap.append(ladderEl, right);
  slots.visual.append(wrap, grid);
  renderLadder(); renderChips(); renderRow(); renderGrid();

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
