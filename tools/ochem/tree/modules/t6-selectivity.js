// The Tree of Organic, Level 6, Module 3: What the reagent touches and what it
// leaves alone. Chemoselectivity on molecules with two functional groups, and
// protecting groups. No imports (contract).

export const meta = {
  id: 't6-selectivity',
  level: 6,
  order: 3,
  needs3D: false,
  title: 'What it touches, what it leaves alone',
  concept: 'Selectivity and protecting groups',
  tagline: 'Two groups in one molecule. The question is which one the reagent can even see.',
  story: 'Put two functional groups in one molecule and every reagent becomes a question about aim. NaBH4 is weak, so it takes a ketone or an aldehyde and walks straight past an ester or an acid; LiAlH4 is strong and takes them all. PCC touches an alcohol and leaves an alkene alone. Lindlar reduces an alkyne and never touches a carbonyl. And a Grignard is not fussy at all, it is fragile: any acidic hydrogen in the molecule, an alcohol or an acid, kills it before it can attack anything. That is what protecting groups are for. Turn the ketone into an acetal, do your chemistry on the other end, then take the acetal off with aqueous acid. Rule of thumb: rank the groups by how badly they want the reagent, then check what would kill it first.',
  moveName: 'Rank the groups, then check what kills the reagent',
  move: [
    'Find every functional group in the molecule, not just the one the question is pointing at.',
    'Ask what the reagent can reach: NaBH4 is aldehyde and ketone only, LiAlH4 is everything, PCC is alcohols, Lindlar is alkynes, mCPBA is alkenes.',
    'Ask what would kill the reagent first. A Grignard or an acetylide dies on any O-H, N-H or acid proton in the molecule.',
    'If the reagent cannot see past the wrong group, protect it: a ketone becomes an acetal with two alcohols and acid, and only aqueous acid takes it back off.'
  ],
  trap: 'Careful: an acetal is invisible to base, to hydride and to a Grignard, which is exactly why it is a protecting group. The only thing that removes it is aqueous acid, so if a question protects a ketone and never adds acid at the end, the acetal is still there in the answer.',
  holdsUp: ['Multi-step synthesis', 'Reagent choice questions', 'Grignard planning', 'Reading a long reaction scheme'],
  drill: 'Booster OChem: Synthesis'
};

// Every SMILES drawn here (render-checked by the sheet test).
export const SMILES = [
  'CC(=O)CCC(=O)OC', 'CC(O)CCC(=O)OC', 'CC(O)CCCO',
  'C=CCCC(C)=O', 'C=CCCC(C)O', 'CC1(OC)OCCO1',
  'OCCCC(C)=O', 'OCCCC(C)O',
  'CC(=O)CCC(=O)O', 'CC(O)CCC(=O)O',
  'CC#CCC(C)=O', 'CC=CCC(C)=O',
  'CC(=O)CCO', 'CC(=O)CC=O',
  'OCC=C', 'O=CC=C',
  'CC1(OCCO1)CCC(=O)OC', 'CC1(OCCO1)CCC(C)(C)O'
];

const HOME = 't6-selectivity';
const ROOTS = ['l1-groups', 'l2-bully'];

/* ------------------------------------------------------------------ */
/* The reagents: what each one can reach                                */
/* ------------------------------------------------------------------ */
export const REAGENTS = {
  nabh4: { label: 'NaBH4, CH3OH', reaches: ['ketone', 'aldehyde'], why: 'NaBH4 is a weak hydride. It has enough push for an aldehyde or a ketone and none for an ester, an acid or an amide.' },
  lah: { label: '1. LiAlH4  2. H2O', reaches: ['ketone', 'aldehyde', 'ester', 'acid', 'amide', 'nitrile'], why: 'LiAlH4 is the strong hydride. It reduces every carbonyl on the list, so it cannot be selective on a molecule with two of them.' },
  pcc: { label: 'PCC, CH2Cl2', reaches: ['alcohol1', 'alcohol2'], why: 'PCC oxidizes an alcohol and has no interest in a carbon to carbon double bond.' },
  lindlar: { label: 'H2, Lindlar', reaches: ['alkyne'], why: 'Poisoned palladium adds one hydrogen across an alkyne and is too gentle to touch a carbonyl.' },
  h2pt: { label: 'H2, Pt (excess)', reaches: ['alkyne', 'alkene'], why: 'Platinum hydrogenates every carbon to carbon multiple bond it can reach, though it leaves an isolated carbonyl alone under these conditions.' },
  mcpba: { label: 'mCPBA', reaches: ['alkene'], why: 'A peroxyacid hands one oxygen to an alkene and does not touch a carbonyl.' }
};

// Groups, in the order a student should scan for them, with how each is drawn in words.
export const GROUP_NAMES = {
  ketone: 'the ketone', aldehyde: 'the aldehyde', ester: 'the ester', acid: 'the carboxylic acid',
  alcohol1: 'the primary alcohol', alcohol2: 'the secondary alcohol', alkene: 'the alkene', alkyne: 'the alkyne', acetal: 'the acetal'
};

/* ------------------------------------------------------------------ */
/* The cases: a bifunctional molecule, a reagent, and what happens      */
/* ------------------------------------------------------------------ */
export const CASES = [
  { id: 'ketoester_nabh4', sub: 'CC(=O)CCC(=O)OC', subName: 'a keto ester', groups: ['ketone', 'ester'], reagent: 'nabh4', hits: 'ketone', prod: 'CC(O)CCC(=O)OC',
    why: 'NaBH4 reduces the ketone to a secondary alcohol and cannot reach the ester at all. That is the classic pair: weak hydride, two carbonyls, only one of them moves.' },
  { id: 'ketoester_lah', sub: 'CC(=O)CCC(=O)OC', subName: 'a keto ester', groups: ['ketone', 'ester'], reagent: 'lah', hits: 'both', prod: 'CC(O)CCCO',
    why: 'LiAlH4 takes both carbonyls down, so the ketone becomes a secondary alcohol and the ester becomes a primary alcohol. Nothing is protected, so nothing survives.' },
  { id: 'enone_nabh4', sub: 'C=CCCC(C)=O', subName: 'an alkene with a ketone down the chain', groups: ['alkene', 'ketone'], reagent: 'nabh4', hits: 'ketone', prod: 'C=CCCC(C)O',
    why: 'A hydride reduces the carbonyl and leaves an isolated alkene alone. Hydride adds to a polar C to O bond; a plain C to C double bond has nothing for it to attack.' },
  { id: 'enone_mcpba', sub: 'C=CCCC(C)=O', subName: 'an alkene with a ketone down the chain', groups: ['alkene', 'ketone'], reagent: 'mcpba', hits: 'alkene', prod: null, prodNote: 'the epoxide, with the ketone untouched',
    why: 'mCPBA hands its oxygen to the electron rich alkene. The carbonyl is electron poor, so the peroxyacid has no reason to go there.' },
  { id: 'hydroxyketone_pcc', sub: 'OCCCC(C)=O', subName: 'a hydroxy ketone', groups: ['alcohol1', 'ketone'], reagent: 'pcc', hits: 'alcohol1', prod: 'CC(=O)CC=O',
    why: 'PCC oxidizes the primary alcohol up to an aldehyde and stops. The ketone is already oxidized as far as it goes, so it just sits there.' },
  { id: 'hydroxyketone_nabh4', sub: 'OCCCC(C)=O', subName: 'a hydroxy ketone', groups: ['alcohol1', 'ketone'], reagent: 'nabh4', hits: 'ketone', prod: 'OCCCC(C)O',
    why: 'The hydride reduces the ketone to a second alcohol. The alcohol that was already there is not a target for a reducing agent.' },
  { id: 'ketoacid_nabh4', sub: 'CC(=O)CCC(=O)O', subName: 'a keto acid', groups: ['ketone', 'acid'], reagent: 'nabh4', hits: 'ketone', prod: 'CC(O)CCC(=O)O',
    why: 'NaBH4 cannot reduce a carboxylic acid, so the ketone is the only target. The acid proton does quietly consume some of the hydride, which is why you use extra.' },
  { id: 'ynone_lindlar', sub: 'CC#CCC(C)=O', subName: 'an alkyne with a ketone', groups: ['alkyne', 'ketone'], reagent: 'lindlar', hits: 'alkyne', prod: 'CC=CCC(C)=O',
    why: "Lindlar's catalyst adds one hydrogen across the alkyne to give the cis alkene and leaves the ketone alone. It is the gentlest reduction on the list." }
];

/* ------------------------------------------------------------------ */
/* The protection route, told as four states                            */
/* ------------------------------------------------------------------ */
export const PROTECT = {
  target: 'Reduce the ester on a keto ester without touching the ketone.',
  states: [
    { smi: 'CC(=O)CCC(=O)OC', label: 'the keto ester', note: 'Two carbonyls. LiAlH4 would take both, and NaBH4 would take the wrong one. Neither reagent can aim.' },
    { smi: 'CC1(OCCO1)CCC(=O)OC', label: 'protect: HOCH2CH2OH, H+ (cat.)', note: 'The ketone becomes a cyclic acetal. It is more reactive than the ester, so it reacts first and the ester is untouched. The acetal has no carbonyl left, so hydride cannot see it.' },
    { smi: 'CC1(OCCO1)CCC(C)(C)O', label: '1. two CH3MgBr  2. H3O+', note: 'Now the ester is the only carbonyl in the molecule, so the Grignard hits it twice and gives a tertiary alcohol. The protected ketone watches.' },
    { smi: 'CC(=O)CCC(C)(C)O', label: 'deprotect: H3O+', note: 'Aqueous acid takes the acetal off and the ketone comes back. Aim achieved: one carbonyl changed, one unchanged.' }
  ]
};

/* ------------------------------------------------------------------ */
function mulberry(seed){ let a = seed | 0; return function(){ a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
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
function finish(o){ return Object.assign({ home: HOME, roots: ROOTS, sub: null, reagent: null, prod: null }, o); }

// Which group reacts?
export function genWhich(api){
  const c = api.pick(CASES);
  const opts = [];
  for (const g of c.groups) opts.push({ text: GROUP_NAMES[g], ok: c.hits === g });
  opts.push({ text: 'both of them', ok: c.hits === 'both' });
  opts.push({ text: 'neither, there is no reaction', ok: false });
  const sh = api.shuffle(opts);
  return finish({
    kind: 'which', sub: c.sub, reagent: REAGENTS[c.reagent].label,
    stem: 'This is ' + c.subName + '. Which group reacts?',
    choices: sh.map(x => ({ text: x.text, smiles: null })),
    correct: sh.findIndex(x => x.ok),
    coach: REAGENTS[c.reagent].why + ' ' + c.why
  });
}

// What is the product? Only for cases where every option can be drawn.
export function genProduct(api){
  const drawable = CASES.filter(c => c.prod);
  const c = api.pick(drawable);
  const others = drawable.filter(x => x.prod !== c.prod);
  const ds = api.shuffle(others).slice(0, 2).map(x => ({ smiles: x.prod, ok: false, why: 'That is what ' + REAGENTS[x.reagent].label + ' does to ' + x.subName + '.' }));
  const list = [{ smiles: c.prod, ok: true }].concat(ds, [{ smiles: c.sub, ok: false, why: 'That is the starting material unchanged, and this reagent does have a target here.' }]);
  const sh = api.shuffle(list);
  return finish({
    kind: 'product', sub: c.sub, reagent: REAGENTS[c.reagent].label,
    stem: 'Major product?',
    choices: sh.map(x => ({ text: '', smiles: x.smiles })),
    correct: sh.findIndex(x => x.ok),
    coach: REAGENTS[c.reagent].why + ' ' + c.why
  });
}

// Which reagent hits one group and leaves the other alone?
export function genReagent(api){
  const c = api.pick(CASES.filter(x => x.hits !== 'both'));
  const wrongOnes = Object.keys(REAGENTS).filter(k => {
    if (k === c.reagent) return false;
    const R = REAGENTS[k];
    // a distractor is honest if it would hit both groups or neither
    const hitsBoth = c.groups.every(g => R.reaches.indexOf(g) >= 0);
    const hitsNone = c.groups.every(g => R.reaches.indexOf(g) < 0);
    const hitsOther = R.reaches.indexOf(c.hits) < 0 && c.groups.some(g => R.reaches.indexOf(g) >= 0);
    return hitsBoth || hitsNone || hitsOther;
  });
  if (wrongOnes.length < 3) return genWhich(api);
  const ds = api.shuffle(wrongOnes).slice(0, 3);
  const sh = api.shuffle([{ text: REAGENTS[c.reagent].label, ok: true }].concat(ds.map(k => ({ text: REAGENTS[k].label, ok: false, k }))));
  return finish({
    kind: 'reagent', sub: c.sub,
    stem: 'On ' + c.subName + ', which reagent changes ' + GROUP_NAMES[c.hits] + ' and leaves the other group alone?',
    choices: sh.map(x => ({ text: x.text, smiles: null })),
    correct: sh.findIndex(x => x.ok),
    coach: REAGENTS[c.reagent].why + ' ' + c.why
  });
}

// Why protect?
export function genProtect(api){
  const which = api.pick(['why', 'remove', 'order']);
  if (which === 'remove'){
    const sh = api.shuffle([
      { text: 'Aqueous acid', ok: true },
      { text: 'Aqueous base, NaOH', ok: false },
      { text: 'LiAlH4, then water', ok: false },
      { text: 'It cannot be removed once it is on', ok: false }
    ]);
    return finish({
      kind: 'protect', sub: 'CC1(OCCO1)CCC(=O)OC', reagent: null,
      stem: 'A ketone has been protected as a cyclic acetal. What takes the protecting group back off?',
      choices: sh.map(x => ({ text: x.text, smiles: null })),
      correct: sh.findIndex(x => x.ok),
      coach: 'An acetal is made under acid with water leaving, so it comes off under acid with water coming back. Base does nothing to it, and neither does a hydride or a Grignard, which is the entire reason it works as a protecting group.'
    });
  }
  if (which === 'order'){
    const sh = api.shuffle([
      { text: 'Protect the ketone, run the Grignard, then take the acetal off with acid', ok: true },
      { text: 'Run the Grignard first, then protect the ketone', ok: false },
      { text: 'Protect the ester, run the Grignard, then take it off', ok: false },
      { text: 'Run the Grignard twice and skip the protection', ok: false }
    ]);
    return finish({
      kind: 'protect', sub: 'CC(=O)CCC(=O)OC',
      stem: 'You need to add two methyl groups to the ester of this keto ester and leave the ketone as a ketone. What is the order?',
      choices: sh.map(x => ({ text: x.text, smiles: null })),
      correct: sh.findIndex(x => x.ok),
      coach: 'A Grignard cannot tell the two carbonyls apart, and it would attack the ketone first because a ketone is more reactive than an ester. So take the ketone off the board first as an acetal, do the ester chemistry, then bring the ketone back with aqueous acid.'
    });
  }
  const sh = api.shuffle([
    { text: 'The Grignard would attack the ketone first, because a ketone is more reactive than an ester', ok: true },
    { text: 'The Grignard would be destroyed by the ester oxygen', ok: false },
    { text: 'The ketone would turn into an acid on its own', ok: false },
    { text: 'Nothing, the Grignard already only sees the ester', ok: false }
  ]);
  return finish({
    kind: 'protect', sub: 'CC(=O)CCC(=O)OC',
    stem: 'Why protect the ketone before running a Grignard on the ester of this molecule?',
    choices: sh.map(x => ({ text: x.text, smiles: null })),
    correct: sh.findIndex(x => x.ok),
    coach: 'Reactivity order decides who gets hit first, and a ketone outranks an ester. Protect the more reactive carbonyl and the reagent has only one place left to go.'
  });
}

// What kills a Grignard?
export function genKill(api){
  const sh = api.shuffle([
    { text: 'The O-H of the alcohol: it protonates the Grignard and destroys it', ok: true },
    { text: 'Nothing, the Grignard attacks the ketone normally', ok: false },
    { text: 'The alpha C-H next to the ketone: the Grignard takes that proton first', ok: false },
    { text: 'The Grignard reduces the alcohol to an alkane', ok: false }
  ]);
  return finish({
    kind: 'kill', sub: 'OCCCC(C)=O', reagent: '1. CH3MgBr  2. H3O+',
    stem: 'A Grignard is added to this hydroxy ketone. What happens first?',
    choices: sh.map(x => ({ text: x.text, smiles: null })),
    correct: sh.findIndex(x => x.ok),
    coach: 'That is not a reaction, that is acid-base chemistry. A Grignard carbon is a strong base, and the O-H is the most acidic proton in the molecule, so the Grignard grabs it and becomes an alkane before it ever reaches the carbonyl. An alpha C-H is far less acidic than an O-H, so the alcohol wins that race easily. Protect the alcohol or use two equivalents.'
  });
}

const GENS = [genWhich, genProduct, genReagent, genProtect, genKill];
export function gen(api){ return api.pick(GENS)(api); }
export function makeItem(api){ return gen(api); }

/* ------------------------------------------------------------------ */
export function selfTest(deps){
  const notes = [], fail = m => notes.push(m);
  const api = tinyApi(deps, 41);
  for (const s of SMILES) if (!smilesOk(s)) fail('bad SMILES: ' + s);
  for (const c of CASES){
    if (!smilesOk(c.sub)) fail('bad sub in ' + c.id);
    if (c.prod && !smilesOk(c.prod)) fail('bad prod in ' + c.id);
    if (SMILES.indexOf(c.sub) < 0) fail(c.id + ' sub missing from the SMILES list');
    if (c.prod && SMILES.indexOf(c.prod) < 0) fail(c.id + ' prod missing from the SMILES list');
    if (c.groups.length !== 2) fail(c.id + ' should have exactly two groups');
    const R = REAGENTS[c.reagent];
    if (!R) fail(c.id + ' names an unknown reagent');
    // the case's own claim must agree with the reagent's reach
    const reach = c.groups.filter(g => R.reaches.indexOf(g) >= 0);
    if (c.hits === 'both'){ if (reach.length !== 2) fail(c.id + ' claims both but the reagent reaches ' + reach.length); }
    else if (reach.length !== 1 || reach[0] !== c.hits) fail(c.id + ' claims ' + c.hits + ' but the reagent reaches ' + reach.join(','));
  }
  for (const st of PROTECT.states) if (!smilesOk(st.smi)) fail('bad protect state: ' + st.label);
  if (PROTECT.states.length !== 4) fail('the protection route should be four states');

  const kinds = {};
  let tried = 0;
  for (let i = 0; i < 400; i++){
    const it = makeItem(api); tried++;
    if (!it){ fail('generator gave up at ' + i); break; }
    kinds[it.kind] = (kinds[it.kind] || 0) + 1;
    if (it.home !== HOME) fail('home is ' + it.home);
    if (!it.roots || !it.roots.length) fail('roots empty');
    if (!it.coach) fail('coach empty');
    if (!it.stem) fail('stem empty');
    if (!it.choices || it.choices.length !== 4) fail('choice count ' + (it.choices || []).length);
    const keys = it.choices.map(c => (c.smiles || '') + '|' + (c.text || ''));
    if (new Set(keys).size !== keys.length) fail('duplicate choices: ' + it.stem);
    if (!(it.correct >= 0 && it.correct < it.choices.length)) fail('bad correct index');
    if (it.sub && !smilesOk(it.sub)) fail('bad sub SMILES');
    for (const c of it.choices) if (c.smiles && !smilesOk(c.smiles)) fail('bad choice SMILES: ' + c.smiles);
  }
  const a1 = tinyApi(deps, 3), a2 = tinyApi(deps, 3);
  if (JSON.stringify(makeItem(a1)) !== JSON.stringify(makeItem(a2))) fail('not deterministic');
  if (Object.keys(kinds).length < 5) fail('only ' + Object.keys(kinds).length + ' item kinds');
  return { ok: !notes.length, tried, notes: notes.length ? notes.slice(0, 4).join('; ') : CASES.length + ' cases, every hit agrees with the reagent reach, ' + Object.keys(kinds).length + ' item kinds' };
}

/* ------------------------------------------------------------------ */
/* The visual                                                           */
/* ------------------------------------------------------------------ */
const CSS = `
.t6s-panel{background:rgba(255,255,255,.02);border:1px solid var(--line);border-radius:12px;padding:14px;margin-bottom:14px}
.t6s-h{font-family:var(--mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink3);display:block;margin-bottom:8px}
.t6s-row{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0}
.t6s-note{font-size:15px;color:var(--ink2);line-height:1.55;margin-top:10px;min-height:2.6em}
.t6s-note b{display:block;font-family:var(--serif);font-weight:400;font-size:17px;color:var(--goldhi);margin-bottom:2px}
.t6s-tags{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}
.t6s-tag{font-family:var(--mono);font-size:11px;letter-spacing:.06em;padding:4px 10px;border-radius:999px;border:1px solid var(--line);color:var(--ink3)}
.t6s-tag.hit{border-color:var(--gold);color:var(--goldhi);background:rgba(201,168,76,.12)}
.t6s-tag.safe{border-color:rgba(87,180,135,.5);color:var(--good)}
.t6s-steps{display:flex;gap:10px;align-items:stretch;overflow-x:auto;padding-bottom:6px}
.t6s-step{flex:0 0 auto;width:200px;background:rgba(255,255,255,.02);border:1px solid var(--line);border-radius:10px;padding:8px}
.t6s-step.on{border-color:var(--gold);box-shadow:0 0 0 1px rgba(201,168,76,.3)}
.t6s-step .lab{font-family:var(--mono);font-size:10px;letter-spacing:.06em;color:var(--goldhi);min-height:2.4em;display:block;margin-bottom:4px}
`;
function injectStyle(id, css){ if (typeof document === 'undefined' || document.getElementById(id)) return; const s = document.createElement('style'); s.id = id; s.textContent = css; document.head.append(s); }

export function mount(slots, api){
  const { el } = api;
  injectStyle('t6s-style', CSS);

  /* ---- the aim board ---- */
  let cur = CASES[0];
  const board = el('div', { class: 't6s-panel' });
  board.append(el('span', { class: 't6s-h', text: 'Pick a molecule and a reagent. Watch what it can reach.' }));
  const rxn = el('div', { class: 'rxn' });
  const subBox = el('div', { class: 'box' }), prodBox = el('div', { class: 'box' });
  const arrow = el('div', { class: 'arrow' }, el('span', { class: 'reagent' }), el('div', { class: 'line' }));
  rxn.append(subBox, arrow, prodBox);
  const tags = el('div', { class: 't6s-tags' });
  const note = el('div', { class: 't6s-note' });
  const molRow = el('div', { class: 't6s-row' }), reagRow = el('div', { class: 't6s-row' });
  board.append(el('span', { class: 't6s-h', text: 'Molecule' }), molRow, el('span', { class: 't6s-h', text: 'Reagent' }), reagRow, rxn, tags, note);
  slots.visual.append(board);

  function draw(){
    subBox.textContent = ''; prodBox.textContent = '';
    api.drawSmiles(subBox, cur.sub, { width: 230, height: 140, label: cur.subName });
    arrow.querySelector('.reagent').textContent = REAGENTS[cur.reagent].label;
    if (cur.prod) api.drawSmiles(prodBox, cur.prod, { width: 230, height: 140, label: 'product' });
    else prodBox.append(el('div', { style: { padding: '30px 10px', color: 'var(--ink2)', fontSize: '14px', textAlign: 'center' }, text: cur.prodNote || 'the product' }));
    tags.textContent = '';
    for (const g of cur.groups){
      const hit = cur.hits === 'both' || cur.hits === g;
      tags.append(el('span', { class: 't6s-tag ' + (hit ? 'hit' : 'safe'), text: GROUP_NAMES[g] + (hit ? ': reacts' : ': untouched') }));
    }
    note.textContent = '';
    note.append(el('b', { text: cur.hits === 'both' ? 'Both carbonyls go.' : GROUP_NAMES[cur.hits].charAt(0).toUpperCase() + GROUP_NAMES[cur.hits].slice(1) + ' reacts. The other one is untouched.' }), REAGENTS[cur.reagent].why + ' ' + cur.why);
  }
  function rows(){
    molRow.textContent = ''; reagRow.textContent = '';
    const subs = [];
    for (const c of CASES) if (subs.indexOf(c.sub) < 0) subs.push(c.sub);
    for (const smi of subs){
      const c0 = CASES.find(c => c.sub === smi), on = cur.sub === smi;
      molRow.append(el('button', { type: 'button', class: 'chip' + (on ? ' on' : ''), 'aria-pressed': String(on), text: c0.subName, onclick: () => { cur = CASES.find(c => c.sub === smi); rows(); draw(); } }));
    }
    for (const c of CASES.filter(c => c.sub === cur.sub)){
      const on = c.id === cur.id;
      reagRow.append(el('button', { type: 'button', class: 'chip' + (on ? ' on' : ''), 'aria-pressed': String(on), text: REAGENTS[c.reagent].label, onclick: () => { cur = c; rows(); draw(); } }));
    }
  }
  rows(); draw();

  /* ---- the protection route ---- */
  let step = 0;
  const prot = el('div', { class: 't6s-panel' });
  prot.append(el('span', { class: 't6s-h', text: 'When no reagent can aim: protect, do the work, deprotect' }));
  prot.append(el('p', { style: { margin: '0 0 10px', color: 'var(--ink2)', fontSize: '15px' }, text: PROTECT.target }));
  const strip = el('div', { class: 't6s-steps' });
  const protNote = el('div', { class: 't6s-note' });
  const protBtns = el('div', { class: 't6s-row' });
  prot.append(strip, protBtns, protNote);
  slots.visual.append(prot);

  function drawProt(){
    strip.textContent = '';
    PROTECT.states.forEach((st, i) => {
      const card = el('div', { class: 't6s-step' + (i === step ? ' on' : '') });
      card.append(el('span', { class: 'lab', text: st.label }));
      const holder = el('div', {});
      if (i <= step) api.drawSmiles(holder, st.smi, { width: 180, height: 110, label: st.label });
      else holder.append(el('div', { style: { height: '110px', display: 'grid', placeItems: 'center', color: 'var(--ink3)', fontFamily: 'var(--serif)', fontSize: '30px' }, text: '?' }));
      card.append(holder);
      strip.append(card);
    });
    protNote.textContent = '';
    protNote.append(el('b', { text: 'Step ' + (step + 1) + ' of ' + PROTECT.states.length }), PROTECT.states[step].note);
    protBtns.textContent = '';
    protBtns.append(el('button', { type: 'button', class: 'secondary', text: 'Back', disabled: step === 0 ? '' : null, onclick: () => { step = Math.max(0, step - 1); drawProt(); } }));
    protBtns.append(el('button', { type: 'button', class: 'primary', text: step === PROTECT.states.length - 1 ? 'Start over' : 'Next step', onclick: () => { step = step === PROTECT.states.length - 1 ? 0 : step + 1; drawProt(); } }));
  }
  drawProt();

  /* ---- you try ---- */
  let item = null, picked = -1, done = false, first = true;
  const box = el('div', { class: 'item' });
  slots.try.append(box);
  function render(){
    box.textContent = '';
    box.append(el('p', { class: 'prompt', text: item.stem }));
    if (item.sub){
      const fig = el('div', { class: 'rxn', style: { marginBottom: '12px' } });
      const b = el('div', { class: 'box' }); api.drawSmiles(b, item.sub, { width: 220, height: 130 }); fig.append(b);
      if (item.reagent){ fig.append(el('div', { class: 'arrow' }, el('span', { class: 'reagent', text: item.reagent }), el('div', { class: 'line' })));
        fig.append(el('div', { class: 'box q', text: '?' })); }
      box.append(fig);
    }
    const opts = el('div', { class: 'opts' });
    item.choices.forEach((c, i) => {
      const o = el('button', { type: 'button', class: 'opt' + (picked === i ? ' picked' : '') + (done && i === item.correct ? ' ok' : ''), disabled: done ? '' : null, onclick: () => { picked = i; commit(); } }, el('span', { class: 'k', text: 'ABCD'[i] }));
      if (c.smiles){ const h = el('span', {}); api.drawSmiles(h, c.smiles, { width: 190, height: 115 }); o.append(h); }
      else o.append(el('span', { text: c.text }));
      opts.append(o);
    });
    box.append(opts);
    if (done){
      const ok = picked === item.correct;
      box.append(el('div', { class: 'verdict ' + (ok ? 'good' : 'notyet'), text: ok ? 'You can read it.' : 'Not yet.' }));
      box.append(el('button', { type: 'button', class: 'primary', text: 'Another one', onclick: next }));
    }
  }
  function commit(){
    const ok = picked === item.correct;
    if (first){ api.report(ok); first = false; }
    if (ok){ done = true; api.clearCoach(); } else api.coach(item.coach);
    render();
  }
  function next(){ item = gen(api); picked = -1; done = false; first = true; api.clearCoach(); render(); }
  next();
}
