// The Tree of Organic, Level 4, module 5: The hungry carbon.
// Aldehydes and ketones: every reagent is a nucleophile landing on the carbonyl carbon. No imports (contract).

export const meta = {
  id: 't4-carbonyl',
  level: 4,
  order: 5,
  needs3D: false,
  title: 'The hungry carbon',
  concept: 'Aldehydes and ketones',
  tagline: 'The oxygen is the bully, so the carbon is the target. Every reagent is a nucleophile landing there.',
  story: 'Look at a carbonyl and visualize it more than you memorize it: the oxygen is the electron bully, it hogs the electrons, and that leaves the carbon hungry. So every reagent in this chapter is a nucleophile, and every one of them lands on that same carbon. Hydride is the simplest: NaBH4 is weak, aldehydes and ketones only, and LiAlH4 does everything NaBH4 does and more. Grignard is the green yard: R attacks the carbonyl carbon, and MgBr is never in the product. Aldehyde gives a secondary alcohol, ketone gives tertiary. Cyanide adds a carbon and an OH on the same spot. Amines are a casting call: primary says I-mine and takes C=N, secondary has no N-H to give up so the double bond slides next door to an enamine, tertiary gets nothing. Two alcohols make an acetal, the phone case only aqueous acid takes off. Wittig turns C=O into C=C exactly there. And the executioners, Clemmensen in acid and Wolff-Kishner in base, erase the carbonyl to CH2. Rule of thumb: find the hungry carbon, then ask what the reagent brings.',
  moveName: 'Find the hungry carbon, then ask what the reagent brings',
  move: [
    'Circle the carbonyl carbon. The oxygen bullies the electrons away from it, so that carbon is where everything lands.',
    'Name the nucleophile the reagent brings: hydride, a carbon (Grignard, cyanide, Wittig), a nitrogen (amine), or an oxygen (alcohol).',
    'Attach it to the carbonyl carbon and turn C=O into C-O minus, then protonate on workup. That is the default product.',
    'Check the exceptions: amines and alcohols lose water afterward (imine, enamine, acetal); Wittig swaps O for C; Clemmensen and Wolff-Kishner erase the oxygen entirely.'
  ],
  trap: 'Careful: A primary amine gives an imine, a secondary amine gives an enamine, a tertiary amine gives nothing, and an acetal comes off with aqueous acid only, never with base.',
  holdsUp: ['Every carbonyl product', 'Alcohol class after Grignard', 'Protecting groups', 'Reductive amination', 'Wittig placement'],
  drill: 'Booster OChem: Ketones & Aldehydes'
};

// Every SMILES this module draws that is not in shared/reactions.js.
export const SMILES = ['CN', 'CNC', 'CN(C)C', 'CCCNC'];

/* ------------------------------------------------------------------ */
/* Tiny SMILES graph, node-safe. Enough to count carbons and to find   */
/* the class of an alcohol. Answers are computed from the table with   */
/* it, never typed in by hand.                                          */
/* ------------------------------------------------------------------ */
function parseSmiles(s){
  const atoms = [], bonds = [], rings = {}, stack = [];
  let prev = null, order = 0, i = 0;
  function add(el, arom){ const id = atoms.length; atoms.push({ el, arom }); if (prev != null) bonds.push({ a: prev, b: id, order: order || (arom && atoms[prev].arom ? 1.5 : 1) }); order = 0; prev = id; }
  while (i < s.length){
    const c = s[i];
    if (c === '('){ stack.push(prev); i++; continue; }
    if (c === ')'){ prev = stack.pop(); i++; continue; }
    if (c === '='){ order = 2; i++; continue; }
    if (c === '#'){ order = 3; i++; continue; }
    if (c === '-' || c === '/' || c === '\\' || c === ':'){ i++; continue; }
    if (c === '.'){ prev = null; i++; continue; }
    if (c === '['){ const j = s.indexOf(']', i); const m = s.slice(i + 1, j).match(/^\d*([A-Z][a-z]?|[a-z]{1,2})/); const sym = m ? m[1] : 'C'; add(sym.length === 2 && /[a-z]/.test(sym[0]) ? sym.toUpperCase() : sym[0].toUpperCase() + sym.slice(1), /^[a-z]/.test(sym)); i = j + 1; continue; }
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
function countC(smi){ return parseSmiles(smi).atoms.filter(a => a.el === 'C').length; }
function hasCarbonyl(smi){ const g = parseSmiles(smi); return g.bonds.some(b => b.order === 2 && ((g.atoms[b.a].el === 'C' && g.atoms[b.b].el === 'O') || (g.atoms[b.b].el === 'C' && g.atoms[b.a].el === 'O'))); }
// 'primary' | 'secondary' | 'tertiary' for an OH on a carbon, else null. Carboxylic acid OH does not count.
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
function smilesSane(s){
  if (typeof s !== 'string' || !s) return false;
  const t = s.replace(/\[[^\]]*\]/g, 'X');
  let d = 0; for (const c of t){ if (c === '(') d++; else if (c === ')'){ d--; if (d < 0) return false; } }
  if (d) return false;
  const cnt = {}; for (const c of t.replace(/%\d\d/g, '')) if (/\d/.test(c)) cnt[c] = (cnt[c] || 0) + 1;
  return Object.values(cnt).every(n => n % 2 === 0);
}

/* ------------------------------------------------------------------ */
/* Module data: what the badges say about each verified reaction.       */
/* ------------------------------------------------------------------ */
const TABS = [
  { key: 'aldehyde', name: 'propanal', who: 'an aldehyde' },
  { key: 'ketone', name: '2-butanone', who: 'a ketone' }
];
// medium: what the conditions are; rev: does aqueous acid or water send it back
const FACTS = {
  ald_nabh4: { medium: 'protic solvent, no acid needed', rev: false, becomes: 'C-OH' },
  ald_lah: { medium: 'dry, then water', rev: false, becomes: 'C-OH' },
  ald_grignard: { medium: 'dry, then acid workup', rev: false, becomes: 'C-OH' },
  ald_hcn: { medium: 'a little cyanide, weakly acidic', rev: true, becomes: 'C-OH' },
  ald_imine: { medium: 'mild acid, pH 4 to 5', rev: true, becomes: 'C=N' },
  ald_enamine: { medium: 'mild acid, pH 4 to 5', rev: true, becomes: 'C=C next to N' },
  ald_acetal: { medium: 'acid catalyst, dry', rev: true, becomes: 'C(OR)2' },
  ald_wittig: { medium: 'aprotic, no acid or base', rev: false, becomes: 'C=C' },
  ald_clemmensen: { medium: 'strong acid', rev: false, becomes: 'CH2' },
  ald_wolff: { medium: 'strong base, heat', rev: false, becomes: 'CH2' },
  ald_jones: { medium: 'acid, oxidizing', rev: false, becomes: 'COOH' },
  ket_nabh4: { medium: 'protic solvent, no acid needed', rev: false, becomes: 'C-OH' },
  ket_grignard: { medium: 'dry, then acid workup', rev: false, becomes: 'C-OH' },
  ket_ketal: { medium: 'acid catalyst, dry', rev: true, becomes: 'C(OR)2' },
  ket_imine: { medium: 'mild acid, pH 4 to 5', rev: true, becomes: 'C=N' },
  ket_wittig: { medium: 'aprotic, no acid or base', rev: false, becomes: 'C=C' },
  ket_hcn: { medium: 'a little cyanide, weakly acidic', rev: true, becomes: 'C-OH' },
  ket_red_amination: { medium: 'mild acid plus a mild hydride', rev: false, becomes: 'C-N' }
};
const AMINES = [
  { name: 'methylamine', formula: 'CH3NH2', smi: 'CN', cls: 'primary', line: 'A primary amine says I, mine: the nitrogen takes the double bond, C=N. That is an imine.' },
  { name: 'dimethylamine', formula: '(CH3)2NH', smi: 'CNC', cls: 'secondary', line: 'A secondary amine has no N-H left after water leaves, so the double bond slides next door: ene plus amine, an enamine.' },
  { name: 'trimethylamine', formula: '(CH3)3N', smi: 'CN(C)C', cls: 'tertiary', line: 'A tertiary amine has no N-H at all. It can add and fall right back off, and nothing sticks.' }
];
// outcomes by substrate class; imine, enamine and reductive amination products come from the table
function outcomes(R){
  return {
    aldehyde: { imine: R.find('ald_imine').prod, enamine: R.find('ald_enamine').prod, amine: 'CCCNC', name: 'propanal', sub: R.find('ald_imine').sub, cls: ['primary', 'secondary', 'tertiary'] },
    ketone: { imine: R.find('ket_imine').prod, amine: R.find('ket_red_amination').prod, ketal: R.find('ket_ketal').prod, name: '2-butanone', sub: R.find('ket_imine').sub, cls: ['primary', 'tertiary'] }
  };
}
function label(r){ return [r.reagent, r.cond].filter(Boolean).join(', '); }
function subName(R, r){ return R.SUBSTRATES[r.subClass].name; }

/* ------------------------------------------------------------------ */
/* Generators. Distractors come from siblings (same substrate,          */
/* different product) and then the family, never from thin air.         */
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
function cap(s){ return s.charAt(0).toUpperCase() + s.slice(1); }
function finish(api, stem, correctChoice, otherChoices, extra){
  const choices = api.shuffle([correctChoice, ...otherChoices]);
  return Object.assign({ stem: cap(stem), sub: null, reagent: null, prod: null, choices, correct: choices.indexOf(correctChoice), home: meta.id, roots: ['l2-bully', 'l2-arrows'], source: 'generated' }, extra);
}
function genProduct(api){
  const R = api.reactions, pool = R.byFamily('carbonyl');
  const r = api.pick(pool);
  const others =productDistractors(api, r, pool).map(x => ({ text: '', smiles: x.prod }));
  return finish(api, subName(R, r) + ' is treated with ' + label(r) + '. What is the major organic product?', { text: '', smiles: r.prod }, others, { sub: r.sub, reagent: label(r), coach: r.thomas, roots: r.roots, view: 'rxn', kind: 'product' });
}
function genReagent(api){
  const R = api.reactions, pool = R.byFamily('carbonyl');
  const r = api.pick(pool);
  const others =reagentDistractors(api, r, pool).map(x => ({ text: label(x), smiles: null }));
  return finish(api, 'Which reagent set takes ' + subName(R, r) + ' to this product?', { text: label(r), smiles: null }, others, { sub: r.sub, prod: r.prod, coach: r.thomas, roots: r.roots, view: 'rxn', kind: 'reagent' });
}
const CLASSES = ['primary', 'secondary', 'tertiary'];
function genAlcoholClass(api){
  const R = api.reactions;
  const pool = ['ald_nabh4', 'ald_lah', 'ald_grignard', 'ket_nabh4', 'ket_grignard'].map(id => R.find(id));
  const r = api.pick(pool);
  const cls = alcoholClass(r.prod);
  const texts = { primary: 'a primary alcohol', secondary: 'a secondary alcohol', tertiary: 'a tertiary alcohol' };
  const correct = { text: texts[cls], smiles: null };
  const others =CLASSES.filter(c => c !== cls).map(c => ({ text: texts[c], smiles: null })).concat([{ text: 'no alcohol, the carbonyl survives', smiles: null }]);
  const grignard = /MgBr/.test(r.reagent);
  const coach = grignard ? 'Green yard: R lands on the carbonyl carbon, then count that carbon\'s carbon neighbors. Aldehyde plus Grignard is secondary; ketone plus Grignard is tertiary.'
    : 'Hydride only adds an H, so count the carbons already on the carbonyl carbon: an aldehyde has one, so primary; a ketone has two, so secondary.';
  return finish(api, subName(R, r) + ' meets ' + label(r) + '. What class of alcohol comes out?', correct, others, { sub: r.sub, reagent: label(r), coach, roots: r.roots, view: 'rxn', kind: 'class' });
}
function genAmine(api){
  const R = api.reactions, O = outcomes(R);
  const key = api.pick(['aldehyde', 'aldehyde', 'ketone']);
  const o = O[key];
  const cls = api.pick(o.cls);
  const am = AMINES.find(a => a.cls === cls);
  const none = { text: 'no reaction', smiles: null };
  let all, correct;
  if (key === 'aldehyde'){
    all = [{ text: 'the imine, C=N', smiles: o.imine }, { text: 'the enamine, C=C next to N', smiles: o.enamine }, { text: 'the amine (only with NaBH3CN)', smiles: o.amine }, none];
  } else {
    all = [{ text: 'the imine, C=N', smiles: o.imine }, { text: 'the amine (only with NaBH3CN)', smiles: o.amine }, { text: 'the ketal (that needs methanol)', smiles: o.ketal }, none];
  }
  correct = am.cls === 'primary' ? all[0] : am.cls === 'secondary' ? all[1] : none;
  const stem = o.name + ' meets ' + am.name + ' (' + am.formula + ') with a trace of acid. What forms?';
  return finish(api, stem, correct, all.filter(c => c !== correct), { sub: o.sub, reagent: am.formula + ', H+ (pH 4 to 5)', coach: am.line, roots: ['l2-arrows', 'l1-charge'], view: 'rxn', kind: 'amine' });
}
function genItem(api){
  const x = api.rng();
  if (x < 0.35) return genProduct(api);
  if (x < 0.6) return genReagent(api);
  if (x < 0.8) return genAlcoholClass(api);
  return genAmine(api);
}
// A bank item trimmed to the Summit's four choices (drop one distractor, keep the answer).
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
    // the facts table covers exactly the family, and the class checker agrees with the chemistry
    for (const r of R.byFamily('carbonyl')) if (!FACTS[r.id]) throw new Error('no facts for ' + r.id);
    if (alcoholClass(R.find('ald_grignard').prod) !== 'secondary') throw new Error('aldehyde plus Grignard should be secondary');
    if (alcoholClass(R.find('ket_grignard').prod) !== 'tertiary') throw new Error('ketone plus Grignard should be tertiary');
    if (alcoholClass(R.find('ald_nabh4').prod) !== 'primary') throw new Error('aldehyde plus hydride should be primary');
    if (countC(R.find('ald_hcn').prod) !== countC(R.find('ald_hcn').sub) + 1) throw new Error('cyanohydrin should add one carbon');
    if (hasCarbonyl(R.find('ald_wittig').prod)) throw new Error('Wittig product should have no carbonyl');
    for (const s of SMILES) if (!smilesSane(s)) throw new Error('bad SMILES ' + s);
    const api = tinyApi(deps, 41);
    const kinds = {};
    for (let i = 0; i < 400; i++){
      const it = makeItem(api); tried++;
      if (!it || it.home !== meta.id) throw new Error('home');
      if (!Array.isArray(it.roots) || !it.roots.length) throw new Error('roots');
      if (!it.coach) throw new Error('coach');
      if (!it.stem) throw new Error('stem');
      if (it.choices.length !== 4) throw new Error('need 4 choices, got ' + it.choices.length + ' in ' + it.kind);
      const keys = it.choices.map(c => (c.smiles || '') + '|' + (c.text || ''));
      if (new Set(keys).size !== 4) throw new Error('choices not distinct: ' + keys.join(' / '));
      if (!(it.correct >= 0 && it.correct < 4)) throw new Error('correct index');
      for (const s of [it.sub, it.prod].concat(it.choices.map(c => c.smiles))) if (s != null && !smilesSane(s)) throw new Error('unbalanced SMILES ' + s);
      kinds[it.kind] = (kinds[it.kind] || 0) + 1;
    }
    const a = makeItem(tinyApi(deps, 7)), b = makeItem(tinyApi(deps, 7));
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
// viewBox sized to the molecule so a small molecule is drawn large, then CSS scales it to the slot
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
  const fam = R.byFamily('carbonyl');

  /* ---------- VISUAL: two tabs, a chip per reaction, the row animates ---------- */
  let tab = TABS[0], picked = fam.find(x => x.subClass === TABS[0].key) || null, casting = true;
  const head = el('div', { class: 'controls', role: 'tablist', 'aria-label': 'Pick the substrate' });
  const tabBtns = TABS.map(t => el('button', { type: 'button', class: 'chip', role: 'tab', 'aria-pressed': t === tab ? 'true' : 'false', text: t.name + ' (' + t.who + ')', onClick: () => { tab = t; picked = null; tabBtns.forEach(b => b.setAttribute('aria-pressed', b.dataset.key === t.key ? 'true' : 'false')); renderChips(); renderRow(); }, dataset: { key: t.key } }));
  head.append(el('span', { class: 'eyebrow', text: 'Substrate' }), ...tabBtns);
  const chips = el('div', { class: 'controls', role: 'group', 'aria-label': 'Pick a reagent' });
  const stage = el('div', { style: { marginTop: '14px' } });
  const badges = el('div', { class: 'controls', style: { gap: '6px' } });
  const caption = el('p', { style: { margin: '10px 0 0', color: C.ink2, fontSize: '15px', minHeight: '3em' } });
  const castBtn = el('button', { type: 'button', class: 'chip', 'aria-pressed': 'true', text: 'Hide the amine casting call', onClick: () => { casting = !casting; castBtn.setAttribute('aria-pressed', casting ? 'true' : 'false'); castBtn.textContent = casting ? 'Hide the amine casting call' : 'Show the amine casting call'; renderCasting(); } });
  const castPanel = el('div', { style: { marginTop: '14px' } });

  function renderChips(){
    chips.replaceChildren(el('span', { class: 'eyebrow', text: 'Reagent' }));
    for (const r of fam.filter(x => x.subClass === tab.key)){
      chips.append(el('button', { type: 'button', class: 'chip', 'aria-pressed': picked === r ? 'true' : 'false', text: r.reagent, title: r.name, onClick: () => { picked = r; chips.querySelectorAll('.chip').forEach(b => b.setAttribute('aria-pressed', b.textContent === r.reagent ? 'true' : 'false')); renderRow(); } }));
    }
  }
  function renderRow(){
    stage.replaceChildren(); badges.replaceChildren();
    const sub = R.SUBSTRATES[tab.key];
    const row = el('div', { class: 'rxn' });
    row.append(molBox(api, sub.smi, sub.name + ' (the C=O carbon is the hungry one)'));
    if (!picked){
      row.append(arrowEl(api, '?', ''), el('div', { class: 'box q', text: '?' }));
      stage.append(row);
      caption.textContent = 'Pick a reagent. The product box fills in, and the badges tell you what the reagent brought to the hungry carbon.';
      return;
    }
    const r = picked, f = FACTS[r.id];
    const arrow = arrowEl(api, r.reagent, r.cond);
    const prod = molBox(api, r.prod, r.name);
    row.append(arrow, prod);
    stage.append(row);
    reveal(api, arrow, 0); reveal(api, prod, 250);
    const dC = countC(r.prod) - countC(r.sub);
    const cls = alcoholClass(r.prod);
    const items = [
      badge(api, dC > 0 ? 'adds ' + dC + ' carbon' + (dC > 1 ? 's' : '') : dC < 0 ? 'loses ' + (-dC) + ' carbon' : 'same carbon count', dC > 0 ? C.gold : C.grey),
      badge(api, cls ? 'new ' + cls + ' alcohol' : hasCarbonyl(r.prod) ? 'carbonyl survives' : 'C=O becomes ' + f.becomes, cls ? C.gold : hasCarbonyl(r.prod) ? C.coral : C.blue),
      badge(api, f.rev ? 'reversible: water or H3O+ sends it back' : 'one way', f.rev ? C.amber : C.green),
      badge(api, f.medium, C.ink2)
    ];
    items.forEach((b, i) => { badges.append(b); reveal(api, b, 450 + i * 120); });
    caption.textContent = r.thomas + ' ' + r.trap;
  }
  function renderCasting(){
    castPanel.replaceChildren();
    if (!casting) return;
    const O = outcomes(R).aldehyde;
    const grid = el('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' } });
    AMINES.forEach((am, i) => {
      const col = el('div', { style: { background: 'rgba(255,255,255,.02)', border: '1px solid ' + (am.cls === 'tertiary' ? C.line : C.gold), borderRadius: '12px', padding: '10px' } });
      col.append(el('div', { class: 'eyebrow', text: am.cls + ' amine' }));
      drawMol(api, col, am.smi, am.name, '120px');
      col.append(el('div', { style: { textAlign: 'center', fontFamily: 'Georgia, serif', fontSize: '14px', color: C.ink2 }, text: am.name + ' + propanal' }));
      const outSmi = am.cls === 'primary' ? O.imine : am.cls === 'secondary' ? O.enamine : O.sub;
      drawMol(api, col, outSmi, am.cls === 'primary' ? 'the imine' : am.cls === 'secondary' ? 'the enamine' : 'propanal, unchanged', '200px');
      col.append(el('div', { style: { textAlign: 'center', fontFamily: 'Georgia, serif', fontSize: '17px', color: am.cls === 'tertiary' ? C.ink3 : C.goldhi }, text: am.cls === 'primary' ? 'imine (C=N)' : am.cls === 'secondary' ? 'enamine (C=C-N)' : 'no reaction' }));
      col.append(el('p', { style: { fontSize: '14px', color: C.ink2, margin: '6px 0 0' }, text: am.line }));
      grid.append(col); reveal(api, col, i * 220);
    });
    castPanel.append(el('p', { style: { margin: '0 0 8px', color: C.ink2, fontSize: '15px' }, text: 'The casting call, on propanal with mild acid. Count the N-H bonds on the amine: two gives an imine, one gives an enamine, none gives nothing.' }), grid);
  }
  slots.visual.append(head, chips, stage, badges, caption, el('div', { class: 'controls' }, castBtn), castPanel);
  renderChips(); renderRow(); renderCasting();

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
