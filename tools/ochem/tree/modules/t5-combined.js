// The Tree of Organic, Level 5, Branch 7: Two moves in a row.
// Combined mechanisms, and the handoff that sits between them. No imports (contract).
//
// The stage here is not an arrow-pushing stage: at this level the arrows inside each half are
// already yours, so the visual is the chain itself. Start, move one, the handoff drawn in gold,
// move two, product, revealed a move at a time. Every start and product is checked against the
// verified reaction table in selfTest.

export const meta = {
  id: 't5-combined',
  level: 5,
  order: 7,
  needs3D: false,
  title: 'Two moves in a row',
  concept: 'Combined mechanisms',
  tagline: 'The whole question is the handoff: the thing that exists between the two moves.',
  story: 'The 2026 specification names combined mechanisms as their own subtopic, which is the test finally admitting what it has always asked. Two moves in a row, and the whole question is the handoff, the thing that exists between them. Alkyne hydration makes an enol and the enol tautomerizes. An aldol makes a beta-hydroxy carbonyl and heat pulls water out of it. A Grignard on an ester runs a substitution down to a ketone and then adds to it again. Imine formation makes a C=N and hydride knocks it down to an amine. If you can name the middle picture, a two-step is one move you already own. And the middle picture is almost never the answer, which is exactly why they draw it. Rule of thumb: name the handoff, then finish it.',
  moveName: 'Split the reagents, name the handoff, then finish it',
  move: [
    'Split the reagents into move one and move two. A numbered list is the giveaway, and so is the word then.',
    'Run move one by itself and draw what comes out. That drawing is the handoff.',
    'Name it: an enol, a beta-hydroxy carbonyl, an imine, a ketone, a diazonium salt, an N-alkyl phthalimide.',
    'Run move two on the handoff. That is your answer.',
    'Now find the handoff among the choices, because it is there, and cross it off.'
  ],
  trap: 'Careful: the handoff is in the answer choices on purpose. An enol, an imine before the hydride, a beta-hydroxy aldehyde before the heat, the ketone in the middle of a double Grignard: every one of them is a real species, every one of them gets drawn, and not one of them is where the reaction stops.',
  holdsUp: ['Alkyne hydration', 'Aldol condensation', 'Reductive amination', 'A Grignard on an ester', 'Gabriel and Sandmeyer'],
  drill: 'Booster OChem: Ketones & Aldehydes'
};

// Every SMILES this module draws.
export const SMILES = [
  'CCC#C', 'CCC(O)=C', 'CCC(C)=O',
  'CC=O', 'CC(O)CC=O', 'C/C=C/C=O',
  'CCOC(C)=O', 'CC(=O)C=C([O-])OCC', 'CC(=O)CC(=O)OCC',
  'COC(C)=O', 'CC(C)=O', 'CC(C)(C)O',
  'CCC(C)=NC', 'CCC(C)NC',
  'CCCBr', 'CCCN1C(=O)c2ccccc2C1=O', 'CCCN',
  'Nc1ccccc1', 'N#[N+]c1ccccc1', 'Brc1ccccc1',
  'CCCO', 'CCC=O', 'CCC(C)O', 'CC(O)CC(C)=O', 'CCC(C)(C)O'
];
const NAMES = {
  'CCC#C': '1-butyne', 'CCC(O)=C': 'the enol', 'CCC(C)=O': '2-butanone',
  'CC=O': 'acetaldehyde', 'CC(O)CC=O': 'the beta-hydroxy aldehyde', 'C/C=C/C=O': 'the conjugated enal',
  'CCOC(C)=O': 'ethyl acetate', 'CC(=O)C=C([O-])OCC': 'the stabilized enolate', 'CC(=O)CC(=O)OCC': 'the beta-keto ester',
  'COC(C)=O': 'methyl acetate', 'CC(C)=O': 'acetone, a ketone', 'CC(C)(C)O': 'tert-butanol',
  'CCC(C)=NC': 'the imine', 'CCC(C)NC': 'the secondary amine',
  'CCCBr': '1-bromopropane', 'CCCN1C(=O)c2ccccc2C1=O': 'the N-alkyl phthalimide', 'CCCN': 'propylamine',
  'Nc1ccccc1': 'aniline', 'N#[N+]c1ccccc1': 'the diazonium salt', 'Brc1ccccc1': 'bromobenzene',
  'CCCO': '1-propanol', 'CCC=O': 'propanal', 'CCC(C)O': '2-butanol', 'CC(O)CC(C)=O': 'a beta-hydroxy ketone', 'CCC(C)(C)O': '2-methyl-2-butanol'
};
const nameOf = smi => NAMES[smi] || smi;

/* ------------------------------------------------------------------ */
/* The seven chains. `checks` names the verified table entries whose    */
/* sub and prod must agree with this chain's start and product.         */
/* ------------------------------------------------------------------ */
const COMBOS = [
  {
    id: 'alkyne', chip: 'Alkyne hydration', start: 'CCC#C', mid: 'CCC(O)=C', prod: 'CCC(C)=O',
    r1: 'H2O, H2SO4', c1: 'HgSO4', r2: 'tautomerize', c2: 'no new reagent',
    m1: 'electrophilic addition', m2: 'keto-enol tautomerization',
    handoff: 'an enol: an OH sitting right on a double bond',
    checks: { start: 'alkyne_hg_h2o', prod: 'alkyne_hg_h2o' },
    say: 'Water adds Markovnikov, so the OH lands on the inner carbon and you are holding an enol. An enol is never where it stops: the proton hops from oxygen to carbon, the pi bond slides over onto the oxygen, and you have a ketone. The enol is the classic drawn-but-not-the-answer choice.'
  },
  {
    id: 'aldol', chip: 'Aldol, then dehydrate', start: 'CC=O', mid: 'CC(O)CC=O', prod: 'C/C=C/C=O',
    r1: 'NaOH', c1: 'H2O, cold', r2: 'heat', c2: 'water leaves',
    m1: 'enolate addition', m2: 'E1cB dehydration',
    handoff: 'a beta-hydroxy carbonyl: an OH two carbons from the C=O',
    checks: { start: 'aldol', prod: 'aldol_condensation' },
    say: 'Cold, you stop at the aldol addition product: an OH on the beta carbon. Heat it and the alpha proton comes off, the enolate pushes out the OH, and you get a double bond in conjugation with the carbonyl. Cold means addition, heat means condensation. That one word in the question is the whole difference.'
  },
  {
    id: 'claisen', chip: 'Claisen, then workup', start: 'CCOC(C)=O', mid: 'CC(=O)C=C([O-])OCC', prod: 'CC(=O)CC(=O)OCC',
    r1: 'NaOEt', c1: 'EtOH', r2: 'mild acid', c2: 'the workup',
    m1: 'enolate acyl substitution', m2: 'acid workup, a proton transfer',
    handoff: 'the doubly stabilized enolate, which is why the reaction goes at all',
    checks: { start: 'claisen', prod: 'claisen' },
    say: 'Two esters, one enolate, one acyl substitution, and you get a beta-keto ester. But the base takes that product apart again immediately, because the proton between two carbonyls has a pKa near 11. That deprotonation is the thermodynamic sink that drags the whole reaction forward, and it is why you always see a separate acid workup step written after a Claisen.'
  },
  {
    id: 'grignard', chip: 'Grignard on an ester', start: 'COC(C)=O', mid: 'CC(C)=O', prod: 'CC(C)(C)O',
    r1: 'CH3MgBr', c1: 'one equivalent', r2: 'CH3MgBr', c2: 'then H3O+',
    m1: 'nucleophilic acyl substitution', m2: 'nucleophilic addition',
    handoff: 'a ketone, and it is hungrier than the ester you started with',
    checks: { start: 'ester_grignard', prod: 'ester_grignard' },
    say: 'The first equivalent runs a substitution: attack, tetrahedral intermediate, methoxide leaves, and out comes a ketone. That ketone has no oxygen next door donating into it, so it is a better electrophile than the ester was, and the second equivalent is gone instantly. Substitution then addition. Two identical new groups on that carbon is the fingerprint.'
  },
  {
    id: 'reductive', chip: 'Reductive amination', start: 'CCC(C)=O', mid: 'CCC(C)=NC', prod: 'CCC(C)NC',
    r1: 'CH3NH2', c1: 'H+, pH 4 to 5', r2: 'NaBH3CN', c2: 'the mild hydride',
    m1: 'addition then dehydration to an imine', m2: 'hydride reduction',
    handoff: 'an imine, a C=N',
    checks: { start: 'ket_imine', prod: 'ket_red_amination' },
    say: 'The amine attacks, water leaves, and you have a C=N. Then a hydride knocks the C=N down to a C-N and you have an amine. The reason NaBH3CN is specified is that it is mild enough to leave the ketone alone while it eats the imine, so both halves can run in the same flask. The imine is drawn in every answer set and it is the trap.'
  },
  {
    id: 'gabriel', chip: 'Gabriel synthesis', start: 'CCCBr', mid: 'CCCN1C(=O)c2ccccc2C1=O', prod: 'CCCN',
    r1: 'potassium phthalimide', c1: 'SN2', r2: 'NH2NH2', c2: 'hydrazinolysis',
    m1: 'SN2', m2: 'hydrazinolysis, an acyl substitution twice',
    handoff: 'the N-alkyl phthalimide: nitrogen with nowhere left to go',
    checks: { start: 'hal1_gabriel', prod: 'hal1_gabriel' },
    say: 'The problem with making an amine by SN2 is that the amine you make is a better nucleophile than the one you started with, so it alkylates again and again. Gabriel solves it: the phthalimide nitrogen attacks once and then it is boxed in by two carbonyls with no lone pair to spare. Hydrazine pulls the box apart at the end and hands you a clean primary amine.'
  },
  {
    id: 'sandmeyer', chip: 'Diazotization, then Sandmeyer', start: 'Nc1ccccc1', mid: 'N#[N+]c1ccccc1', prod: 'Brc1ccccc1',
    r1: 'NaNO2, HCl', c1: '0 C', r2: 'CuBr', c2: 'the Sandmeyer step',
    m1: 'diazotization', m2: 'copper-mediated substitution',
    handoff: 'the diazonium salt: N2 is the best leaving group in organic chemistry',
    checks: { start: 'sandmeyer_br', prod: 'sandmeyer_br' },
    say: 'Cold nitrous acid turns the amine into a diazonium salt, which is a benzene ring holding onto nitrogen gas. Nothing leaves better than N2, so a copper salt can swap it for almost anything: CuBr for Br, CuCl for Cl, CuCN for CN, H3PO2 to take it clean off. This is how you install groups a ring will not accept directly.'
  }
];

/* ------------------------------------------------------------------ */
/* Node-safe helpers                                                    */
/* ------------------------------------------------------------------ */
function mulberry(seed){ let s = seed | 0; return function(){ s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function smilesSane(smi){
  if (typeof smi !== 'string' || !smi) return false;
  let d = 0; for (const ch of smi){ if (ch === '(') d++; if (ch === ')') d--; if (d < 0) return false; }
  if (d) return false;
  const ring = {}; for (const m of smi.replace(/\[[^\]]*\]/g, 'X').match(/\d/g) || []) ring[m] = (ring[m] || 0) + 1;
  return Object.values(ring).every(n => n % 2 === 0);
}
function heavy(smi){ const s = smi.replace(/\[([A-Z][a-z]?|[a-z])[^\]]*\]/g, (m, g) => g); return (s.match(/Cl|Br|[BCNOSPFI]|[cnos]/g) || []).length; }
function pickN(rng, arr, n, not){ const pool = arr.filter(x => !not.includes(x)); const out = []; while (out.length < n && pool.length){ const i = Math.floor(rng() * pool.length); out.push(pool.splice(i, 1)[0]); } return out; }
function shuffled(rng, a){ const b = a.slice(); for (let i = b.length - 1; i > 0; i--){ const j = Math.floor(rng() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; }
function sig(smi){ const s2 = smi.replace(/\[([A-Z][a-z]?|[a-z])[^\]]*\]/g, (m, g) => g); const set = new Set((s2.match(/Cl|Br|[NOSPFI]|[nos]/g) || []).map(x => x.toUpperCase())); return [...set].sort().join(''); }
function cap(t){ return t.charAt(0).toUpperCase() + t.slice(1); }
function pairText(c){ return c.m1 + ', then ' + c.m2; }
function reagentText(c){ return [c.r1, c.c1].filter(Boolean).join(', ') + ' then ' + [c.r2, c.c2].filter(Boolean).join(', '); }
const OTHER_SMILES = ['CCCO', 'CCC=O', 'CCC(C)O', 'CC(O)CC(C)=O', 'CCC(C)(C)O'];

/* ------------------------------------------------------------------ */
/* Item generators (pure).                                              */
/* ------------------------------------------------------------------ */
const KINDS = ['mid', 'pair', 'prod'];
function genItem(rng, kind){
  kind = kind || KINDS[Math.floor(rng() * KINDS.length)];
  const c = COMBOS[Math.floor(rng() * COMBOS.length)];
  if (kind === 'mid'){
    const ans = c.mid, h = heavy(ans);
    const pool = [];
    for (const x of COMBOS) if (x !== c) pool.push(x.mid, x.prod, x.start);
    for (const s of OTHER_SMILES) pool.push(s);
    pool.push(c.prod, c.start);
    const uniq = []; for (const s of pool) if (s !== ans && !uniq.includes(s)) uniq.push(s);
    const g = sig(ans);
    const near = uniq.filter(s => sig(s) === g && Math.abs(heavy(s) - h) <= 3);
    let d = pickN(rng, near, 3, []);
    if (d.length < 3) d = d.concat(pickN(rng, uniq.filter(s => Math.abs(heavy(s) - h) <= 3 && !d.includes(s)), 3 - d.length, d));
    if (d.length < 3) d = d.concat(pickN(rng, uniq, 3 - d.length, d));
    const choices = shuffled(rng, [ans].concat(d));
    return { kind, drawn: true, combo: c, at: 1, stem: 'Here is the whole sequence: ' + nameOf(c.start) + ', then ' + reagentText(c) + '. What is the intermediate between the two moves?', choices: choices.map(s => ({ text: nameOf(s), smiles: s })), correct: choices.indexOf(ans), coach: 'Run move one on its own and stop. ' + c.r1 + ' does ' + c.m1 + ', which gives you ' + c.handoff + '. That is ' + nameOf(ans) + '. Then ' + c.r2 + ' finishes it.', roots: ['l2-arrows', 'l1-groups'] };
  }
  if (kind === 'pair'){
    const ans = pairText(c);
    const pool = [];
    for (const x of COMBOS) if (x !== c) pool.push(pairText(x));
    for (const x of COMBOS) if (x !== c) pool.push(c.m1 + ', then ' + x.m2);
    for (const x of COMBOS) if (x !== c) pool.push(x.m1 + ', then ' + c.m2);
    const uniq = []; for (const t of pool) if (t !== ans && !uniq.includes(t)) uniq.push(t);
    const d = pickN(rng, uniq, 3, []);
    const choices = shuffled(rng, [ans].concat(d));
    return { kind, combo: c, at: 2, showAll: true, stem: cap(nameOf(c.start)) + ' is treated with ' + reagentText(c) + '. Which pair of mechanisms is that, in order?', choices: choices.map(t => ({ text: t, smiles: null })), correct: choices.indexOf(ans), coach: 'Move one is ' + c.m1 + ', and it hands you ' + c.handoff + '. Move two is ' + c.m2 + '. Name the handoff and the pair names itself.', roots: ['l2-arrows', 'l1-groups'] };
  }
  // prod: the handoff is always one of the distractors on purpose
  const ans = c.prod, h = heavy(ans);
  const pool = [c.mid, c.start];
  for (const x of COMBOS) if (x !== c) pool.push(x.prod, x.mid);
  for (const s of OTHER_SMILES) pool.push(s);
  const uniq = []; for (const s of pool) if (s !== ans && !uniq.includes(s)) uniq.push(s);
  const rest = uniq.filter(s => s !== c.mid), g = sig(ans);
  const near = rest.filter(s => sig(s) === g && Math.abs(heavy(s) - h) <= 3);
  let d = [c.mid].concat(pickN(rng, near, 2, []));
  if (d.length < 3) d = d.concat(pickN(rng, rest.filter(s => Math.abs(heavy(s) - h) <= 3 && !d.includes(s)), 3 - d.length, d));
  if (d.length < 3) d = d.concat(pickN(rng, rest, 3 - d.length, d));
  const choices = shuffled(rng, [ans].concat(d.slice(0, 3)));
  return { kind: 'prod', drawn: true, combo: c, at: 0, stem: cap(nameOf(c.start)) + ' is treated with ' + reagentText(c) + '. What is the final product?', choices: choices.map(s => ({ text: nameOf(s), smiles: s })), correct: choices.indexOf(ans), coach: 'Two moves, so go twice. ' + c.r1 + ' gives ' + c.handoff + ', which is ' + nameOf(c.mid) + '. That is sitting in the choices and it is not the answer. Then ' + c.r2 + ' takes it to ' + nameOf(ans) + '.', roots: ['l2-arrows', 'l1-groups'] };
}

export function makeItem(api){
  const it = genItem(api.rng);
  return { stem: it.stem, sub: it.combo.start, reagent: reagentText(it.combo), prod: null, choices: it.choices, correct: it.correct, coach: it.coach, home: meta.id, roots: it.roots };
}

export function selfTest(deps){
  let tried = 0;
  try {
    const R = deps && deps.reactions;
    const rng = mulberry(29);
    const api = { rng, pick: a => a[Math.floor(rng() * a.length)], shuffle: a => shuffled(rng, a), reactions: R, bank: deps && deps.bank };
    const seenMid = new Set();
    for (const c of COMBOS){
      for (const s of [c.start, c.mid, c.prod]){
        if (!SMILES.includes(s)) throw new Error(c.id + ': ' + s + ' missing from SMILES');
        if (!NAMES[s]) throw new Error(c.id + ': ' + s + ' has no name');
        if (!smilesSane(s)) throw new Error(c.id + ': ' + s + ' has unmatched parentheses or ring digits');
      }
      if (c.start === c.mid || c.mid === c.prod || c.start === c.prod) throw new Error(c.id + ': the three states must differ');
      if (seenMid.has(c.mid)) throw new Error(c.id + ': two chains share a handoff');
      seenMid.add(c.mid);
      if (!c.m1 || !c.m2 || !c.handoff || !c.say) throw new Error(c.id + ': incomplete');
      if (!c.r1 || !c.r2) throw new Error(c.id + ': both moves need a reagent');
      // the endpoints have to agree with the verified table
      if (R && c.checks){
        const a = R.find(c.checks.start), b = R.find(c.checks.prod);
        if (!a) throw new Error(c.id + ': no table entry ' + c.checks.start);
        if (!b) throw new Error(c.id + ': no table entry ' + c.checks.prod);
        if (a.sub !== c.start) throw new Error(c.id + ': start does not match ' + c.checks.start + ' (' + a.sub + ')');
        if (b.prod !== c.prod) throw new Error(c.id + ': product does not match ' + c.checks.prod + ' (' + b.prod + ')');
      }
    }
    for (const s of SMILES) if (!smilesSane(s) || !NAMES[s]) throw new Error('bad or unnamed SMILES ' + s);
    const kinds = {};
    for (let n = 0; n < 320; n++){
      const it = makeItem(api); tried++;
      if (!it.choices || it.choices.length !== 4) throw new Error('four choices required');
      const keys = it.choices.map(c => (c.smiles || '') + '|' + (c.text || ''));
      if (new Set(keys).size !== 4) throw new Error('choices not distinct: ' + keys.join(' / '));
      if (!(it.correct >= 0 && it.correct < 4)) throw new Error('bad correct index');
      for (const c of it.choices) if (c.smiles && !smilesSane(c.smiles)) throw new Error('bad SMILES ' + c.smiles);
      if (it.sub && !smilesSane(it.sub)) throw new Error('bad sub SMILES');
      if (!it.coach || !it.stem) throw new Error('coach or stem empty');
      if (it.home !== meta.id) throw new Error('home');
      if (!Array.isArray(it.roots) || !it.roots.length) throw new Error('roots');
    }
    for (const k of KINDS){ const it = genItem(mulberry(17), k); if (!it || it.correct < 0) throw new Error(k + ' failed'); kinds[k] = 1; }
    // every generated answer is the chain's own state, and the handoff is always a product distractor
    for (let n = 0; n < 200; n++){
      const it = genItem(rng, 'mid');
      if (it.choices[it.correct].smiles !== it.combo.mid) throw new Error('a handoff item marked the wrong choice');
    }
    for (let n = 0; n < 200; n++){
      const it = genItem(rng, 'prod');
      if (it.choices[it.correct].smiles !== it.combo.prod) throw new Error('a product item marked the wrong choice');
      if (!it.choices.some(c => c.smiles === it.combo.mid)) throw new Error('the handoff must sit in the product choices');
    }
    for (let n = 0; n < 200; n++){
      const it = genItem(rng, 'pair');
      if (it.choices[it.correct].text !== pairText(it.combo)) throw new Error('a pair item marked the wrong choice');
    }
    const a = genItem(mulberry(9)), b = genItem(mulberry(9));
    if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error('not reproducible');
    return { ok: true, tried, notes: COMBOS.length + ' chains, endpoints checked against the table, ' + KINDS.length + ' item kinds' };
  } catch (e){ return { ok: false, tried, notes: e.message }; }
}

/* ================================================================== */
/* Browser side                                                         */
/* ================================================================== */
function molSize(smi){
  const n = (smi.replace(/\[[^\]]*\]/g, 'X').match(/Cl|Br|[BCNOSPFIX]|[cnos]/g) || []).length;
  const ring = /\d/.test(smi.replace(/\[[^\]]*\]/g, ''));
  return { width: Math.max(130, Math.min(280, 80 + 16 * n)), height: Math.max(96, Math.min(180, (ring ? 100 : 70) + 8 * n)) };
}
function drawMol(api, target, smi, label, max){
  const wrap = api.el('div', { style: { maxWidth: max || '230px', margin: '0 auto' } });
  api.drawSmiles(wrap, smi, Object.assign(molSize(smi), { label: label || nameOf(smi) }));
  target.append(wrap);
  return wrap;
}
function reveal(api, node, delay){
  if (api.reduced){ node.style.opacity = '1'; node.style.transform = 'none'; return; }
  node.style.opacity = '0'; node.style.transform = 'translateY(8px)';
  node.style.transition = 'opacity .45s ease ' + (delay || 0) + 'ms, transform .45s ease ' + (delay || 0) + 'ms';
  requestAnimationFrame(() => requestAnimationFrame(() => { node.style.opacity = '1'; node.style.transform = 'none'; }));
}

/* The chain stage: start, move one, the handoff in gold, move two, product. */
function mountStage(slots, api){
  const { el } = api, C = api.colors;
  let combo = COMBOS[0], at = 0, playing = false, timers = [];
  const wrap = el('div', {});
  const cap = el('div', { style: { marginTop: '12px', minHeight: '5.4em' } });
  const capHead = el('div', { style: { fontFamily: 'Georgia, serif', color: C.goldhi, fontSize: '18px' } });
  const capBody = el('p', { style: { margin: '4px 0 0', color: C.ink2, fontSize: '15px', maxWidth: '72ch' } });
  cap.append(capHead, capBody);
  const nextBtn = el('button', { class: 'primary', type: 'button', text: 'Next move', onClick: () => { stopPlay(); go(); } });
  const playBtn = el('button', { class: 'secondary', type: 'button', text: 'Play', onClick: play });
  const resetBtn = el('button', { class: 'secondary', type: 'button', text: 'Reset', onClick: () => { stopPlay(); at = 0; draw(); } });
  const chips = el('div', { class: 'controls', role: 'group', 'aria-label': 'Pick a two-move sequence' });
  const chipEls = COMBOS.map(c => el('button', { class: 'chip', type: 'button', 'aria-pressed': c === combo ? 'true' : 'false', text: c.chip, onClick: () => { stopPlay(); combo = c; at = 0; sync(); draw(); } }));
  chips.append(...chipEls);
  function sync(){ chipEls.forEach((b, i) => b.setAttribute('aria-pressed', COMBOS[i] === combo ? 'true' : 'false')); }
  slots.visual.append(wrap, el('div', { class: 'controls' }, nextBtn, playBtn, resetBtn), cap, chips);

  function box(smi, caption, kind){
    const gold = kind === 'handoff';
    const b = el('div', { style: { flex: '1 1 190px', minWidth: '150px', maxWidth: '270px', border: '1px solid ' + (gold ? C.gold : C.line), background: gold ? 'rgba(201,168,76,.08)' : 'rgba(255,255,255,.02)', borderRadius: '12px', padding: '10px 8px 8px', textAlign: 'center' } });
    if (gold) b.append(el('div', { style: { fontFamily: 'ui-monospace, Menlo, monospace', fontSize: '10px', letterSpacing: '.14em', color: C.gold, marginBottom: '2px' }, text: 'THE HANDOFF' }));
    drawMol(api, b, smi, caption, '230px');
    b.append(el('div', { style: { fontFamily: 'Georgia, serif', fontSize: '15px', color: gold ? C.goldhi : C.ink2, marginTop: '2px' }, text: caption }));
    return b;
  }
  function arrow(top, bottom, live){
    return el('div', { style: { flex: '0 0 118px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', color: live ? C.goldhi : C.ink3, fontFamily: 'ui-monospace, Menlo, monospace', fontSize: '11.5px', textAlign: 'center' } },
      el('span', { style: { color: live ? C.ink : C.ink3 }, text: top }),
      el('div', { style: { width: '100%', height: '2px', background: live ? C.gold : C.line, position: 'relative' } }, el('span', { style: { position: 'absolute', right: '-1px', top: '-5px', borderTop: '6px solid transparent', borderBottom: '6px solid transparent', borderLeft: '9px solid ' + (live ? C.gold : C.line) } })),
      el('span', { text: bottom }));
  }
  function ghost(){ return el('div', { style: { flex: '1 1 190px', minWidth: '150px', maxWidth: '270px', border: '1px dashed ' + C.line, borderRadius: '12px', minHeight: '150px', display: 'grid', placeItems: 'center', fontFamily: 'Georgia, serif', fontSize: '38px', color: C.ink3 }, text: '?' }); }
  function draw(){
    wrap.replaceChildren();
    const row = el('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', justifyContent: 'center' } });
    row.append(box(combo.start, nameOf(combo.start), 'start'));
    row.append(arrow(combo.r1, combo.c1, at >= 1));
    if (at >= 1){ const b = box(combo.mid, nameOf(combo.mid), 'handoff'); row.append(b); reveal(api, b, 0); } else row.append(ghost());
    row.append(arrow(combo.r2, combo.c2, at >= 2));
    if (at >= 2){ const b = box(combo.prod, nameOf(combo.prod), 'prod'); row.append(b); reveal(api, b, 0); } else row.append(ghost());
    wrap.append(row);
    const tag = el('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '10px' } });
    const pill = (t, col) => el('span', { style: { border: '1px solid ' + col, color: col, borderRadius: '999px', padding: '4px 12px', fontFamily: 'ui-monospace, Menlo, monospace', fontSize: '12px', letterSpacing: '.04em' }, text: t });
    tag.append(pill('move one: ' + combo.m1, at >= 1 ? C.gold : C.ink3), pill('move two: ' + combo.m2, at >= 2 ? C.gold : C.ink3));
    wrap.append(tag);
    nextBtn.disabled = at >= 2; nextBtn.textContent = at >= 2 ? 'Done' : at === 0 ? 'Run move one' : 'Run move two';
    if (at === 0){ capHead.textContent = 'Two moves in a row: ' + combo.m1 + ', then ' + combo.m2 + '.'; capBody.textContent = 'Run move one and stop. What comes out of it is the handoff, and the handoff is what the question is really about.'; }
    else if (at === 1){ capHead.textContent = 'The handoff: ' + combo.handoff + '.'; capBody.textContent = combo.say; }
    else { capHead.textContent = 'Done: ' + nameOf(combo.prod) + '.'; capBody.textContent = combo.say + ' Look back at the middle box. That is the choice they put next to the right answer.'; }
  }
  function go(){ if (at < 2){ at++; draw(); } }
  function play(){ if (playing){ stopPlay(); return; } if (at >= 2){ at = 0; draw(); } playing = true; playBtn.textContent = 'Pause'; const tick = () => { if (!playing) return; if (at >= 2){ stopPlay(); return; } go(); timers.push(setTimeout(tick, api.reduced ? 0 : 1900)); }; timers.push(setTimeout(tick, api.reduced ? 0 : 350)); }
  function stopPlay(){ playing = false; playBtn.textContent = 'Play'; timers.forEach(clearTimeout); timers = []; }
  draw();
  return { show(id){ const c = COMBOS.find(x => x.id === id); if (!c) return; stopPlay(); combo = c; at = 2; sync(); draw(); } };
}

/* The handoff table: all seven at a glance, tap one to run it. */
function mountTable(container, api, stage){
  const { el } = api, C = api.colors;
  const holder = el('div', { style: { marginTop: '18px', paddingTop: '14px', borderTop: '1px solid ' + C.line } });
  holder.append(el('div', { class: 'eyebrow', style: { marginBottom: '8px' }, text: 'Every handoff the DAT asks for' }));
  const table = el('div', { style: { overflowX: 'auto' } });
  const grid = el('div', { style: { display: 'grid', gridTemplateColumns: 'minmax(150px,1.1fr) minmax(150px,1.2fr) minmax(150px,1.1fr)', gap: '1px', minWidth: '520px', background: C.line, border: '1px solid ' + C.line, borderRadius: '10px', overflow: 'hidden' } });
  const head = t => el('div', { style: { background: C.panel, padding: '7px 10px', fontFamily: 'ui-monospace, Menlo, monospace', fontSize: '10.5px', letterSpacing: '.12em', textTransform: 'uppercase', color: C.ink3 }, text: t });
  grid.append(head('move one'), head('the handoff'), head('move two'));
  for (const c of COMBOS){
    const cell = (node, gold) => el('div', { style: { background: 'var(--card)', padding: '9px 10px', color: gold ? C.goldhi : C.ink2, fontSize: '14px' } }, node);
    const b = el('button', { type: 'button', title: 'Run ' + c.chip, style: { display: 'block', width: '100%', textAlign: 'left', background: 'none', border: '0', padding: '0', color: 'inherit', fontSize: '14px', minHeight: '30px' }, onClick: () => { stage.show(c.id); holder.scrollIntoView({ block: 'nearest', behavior: api.reduced ? 'auto' : 'smooth' }); } }, c.m1);
    grid.append(cell(b), cell(el('span', { text: nameOf(c.mid) }), true), cell(el('span', { text: c.m2 })));
  }
  table.append(grid);
  holder.append(table, el('p', { style: { margin: '9px 0 0', fontSize: '14px', color: C.ink2, maxWidth: '72ch' }, text: 'Tap a row to run it on the stage. Read the middle column out loud: enol, beta-hydroxy carbonyl, stabilized enolate, ketone, imine, phthalimide, diazonium. Seven words, and they cover every combined mechanism the test names.' }));
  container.append(holder);
}

/* You try: generated items, drawn choices where the answer is a structure. */
function mountTry(slots, api){
  const { el } = api, C = api.colors;
  let item = null, firstTry = true, done = false;
  const box = el('div', { class: 'item' }); slots.try.append(box);
  function commit(ok, coachText){
    if (done) return;
    if (ok){ done = true; api.report(firstTry); api.clearCoach(); box.append(el('div', { class: 'verdict good', text: 'You can read it.' }), el('div', { class: 'controls' }, el('button', { class: 'primary', type: 'button', text: 'Another one', onClick: next }))); }
    else { if (firstTry) api.report(false); firstTry = false; if (!box.querySelector('.verdict')) box.append(el('div', { class: 'verdict notyet', text: 'Not yet.' })); api.coach(coachText); }
  }
  function render(it){
    box.append(el('p', { class: 'prompt', text: it.stem }));
    const row = el('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', justifyContent: 'center', marginBottom: '4px' } });
    const cell = (smi, caption, gold) => {
      const b = el('div', { style: { border: '1px solid ' + (gold ? C.gold : C.line), background: 'rgba(255,255,255,.02)', borderRadius: '10px', padding: '8px', textAlign: 'center', flex: '0 1 210px' } });
      drawMol(api, b, smi, caption, '190px');
      b.append(el('div', { style: { fontFamily: 'Georgia, serif', fontSize: '13.5px', color: C.ink2, marginTop: '2px' }, text: caption }));
      return b;
    };
    const q = (label) => el('div', { style: { border: '1px dashed ' + C.gold, borderRadius: '10px', minHeight: '110px', flex: '0 1 210px', display: 'grid', placeItems: 'center', color: C.goldhi, fontFamily: 'Georgia, serif' } }, el('div', {}, el('div', { style: { fontSize: '32px', textAlign: 'center' }, text: '?' }), el('div', { style: { fontSize: '12px', fontFamily: 'ui-monospace, Menlo, monospace', letterSpacing: '.08em', textAlign: 'center' }, text: label })));
    const arrowMini = t => el('div', { style: { flex: '0 0 96px', textAlign: 'center', fontFamily: 'ui-monospace, Menlo, monospace', fontSize: '11px', color: C.ink3 } }, el('div', { style: { color: C.ink2 }, text: t }), el('div', { style: { height: '2px', background: C.line, margin: '4px 0' } }));
    const c = it.combo;
    row.append(cell(c.start, nameOf(c.start), false), arrowMini(c.r1));
    if (it.kind === 'mid') row.append(q('the handoff'), arrowMini(c.r2), cell(c.prod, nameOf(c.prod), false));
    else if (it.kind === 'prod') row.append(cell(c.mid, 'the handoff', true), arrowMini(c.r2), q('the product'));
    else row.append(cell(c.mid, 'the handoff', true), arrowMini(c.r2), cell(c.prod, nameOf(c.prod), false));
    box.append(row);
    const grid = el('div', { class: 'opts' }), btns = [];
    it.choices.forEach((ch, i) => {
      const b = el('button', { class: 'opt', type: 'button', 'aria-label': ch.text || ('choice ' + (i + 1)) });
      b.append(el('span', { class: 'k', text: 'ABCD'[i] }));
      if (it.drawn && ch.smiles){ const holder = el('div', {}); if (ch.text) holder.append(el('div', { style: { fontSize: '13px', color: C.ink2, marginBottom: '2px' }, text: ch.text })); drawMol(api, holder, ch.smiles, ch.text, '180px'); b.append(holder); }
      else b.append(el('span', { text: ch.text }));
      b.addEventListener('click', () => { if (done) return; btns.forEach(x => x.classList.remove('picked')); b.classList.add('picked'); if (i === it.correct){ b.classList.add('ok'); btns.forEach(x => { x.disabled = true; }); commit(true); } else commit(false, ch.smiles === c.mid ? 'That is the handoff, the species between the two moves. It is real, it is drawn, and it is not where the reaction stops. ' + it.coach : it.coach); });
      btns.push(b); grid.append(b);
    });
    box.append(grid);
  }
  function next(){ box.replaceChildren(); api.clearCoach(); firstTry = true; done = false; item = genItem(api.rng); render(item); }
  next();
}

export function mount(slots, api){
  const stage = mountStage(slots, api);
  mountTable(slots.visual, api, stage);
  mountTry(slots, api);
}
