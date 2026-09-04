// The Tree of Organic, Level 6, module 1: Two moves, right order.
// Two-step synthesis built only from chains that genuinely exist in the verified table.
// No imports (contract).
//
// Every chain here is found by matching one reaction's prod to another reaction's sub in
// api.reactions.REACTIONS, so nothing is invented. selfTest re-checks the link on every
// generated item, and it also checks that no distractor pair reaches the same target.

export const meta = {
  id: 't6-two-step',
  level: 6,
  order: 1,
  needs3D: false,
  title: 'Two moves, right order',
  concept: 'Two-step synthesis',
  tagline: 'The trunk, chained. Step one decides what step two can even see.',
  story: 'A two-step is not a new topic, it is the trunk chained. You already know what every reagent does to one functional group; now you do it twice and carry the answer forward. The only new thing is order, and order matters because step one decides what step two is allowed to see. PCC on 1-propanol gives an aldehyde, and a Grignard on that aldehyde gives a secondary alcohol; run those two backward and the Grignard has an alcohol to eat instead of a carbonyl to attack, and you get nothing. Benzene will not take an amine directly, so you nitrate and then reduce. Rule of thumb: draw the intermediate. If you can draw what sits between the two arrows, you have already answered the question.',
  moveName: 'Draw the intermediate, then check that step two can see it',
  move: [
    'Run step one alone and draw the product. That is the intermediate.',
    'Look at the intermediate and name its functional group out loud.',
    'Ask whether step two has anything to grab on that group. If it does not, the order is backward.',
    'Run step two on the intermediate to get the target.',
    'Sanity check the reversed order: if step two on the starting material does nothing or eats the wrong group, that is your evidence the order is fixed.'
  ],
  trap: 'Careful: a Grignard is destroyed by any acidic proton, so it can never follow a step that leaves an OH, an NH or a COOH standing. Make the carbonyl first, or protect. The reversed pair is always one of the four choices.',
  holdsUp: ['Alcohol to aldehyde to anything', 'Benzene to aniline', 'Acid to acid chloride to ester or amide', 'Alkene to alcohol to carbonyl', 'Every retrosynthesis question'],
  drill: 'Booster OChem: Synthesis'
};

// Every structure drawn here comes from shared/reactions.js.
export const SMILES = [];

/* ------------------------------------------------------------------ */
/* A tiny SMILES graph, node-safe, only to name what a structure is.    */
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
    if (c === '['){ const j = s.indexOf(']', i); const body = s.slice(i + 1, j); const m = body.match(/^\d*([A-Z][a-z]?|[a-z]{1,2})/); const sym = m ? m[1] : 'C'; const ch = body.match(/([+-])(\d*)$/); const charge = ch ? (ch[1] === '-' ? -1 : 1) * (ch[2] ? +ch[2] : 1) : 0; add(sym[0].toUpperCase() + sym.slice(1), /^[a-z]/.test(sym), charge); i = j + 1; continue; }
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
export function classify(smi){
  const g = parseSmiles(smi);
  const arom = g.atoms.some(a => a.arom);
  for (let i = 0; i < g.atoms.length; i++){
    if (g.atoms[i].el !== 'C' || g.atoms[i].arom) continue;
    const nb = neighbors(g, i);
    const dblO = nb.find(x => x.order === 2 && g.atoms[x.j].el === 'O');
    if (!dblO) continue;
    const others = nb.filter(x => x !== dblO);
    if (others.some(x => g.atoms[x.j].el === 'Cl')) return 'acid chloride';
    if (others.some(x => g.atoms[x.j].el === 'N')) return 'amide';
    const o = others.find(x => g.atoms[x.j].el === 'O' && x.order === 1);
    if (o){
      const on = neighbors(g, o.j).filter(x => x.j !== i);
      if (!on.length) return g.atoms[o.j].charge < 0 ? 'carboxylate' : 'carboxylic acid';
      const ocn = neighbors(g, on[0].j);
      return ocn.some(x => x.order === 2 && g.atoms[x.j].el === 'O') ? 'anhydride' : 'ester';
    }
    return others.filter(x => g.atoms[x.j].el === 'C').length >= 2 ? 'ketone' : 'aldehyde';
  }
  if (g.bonds.some(b => b.order === 3 && ((g.atoms[b.a].el === 'C' && g.atoms[b.b].el === 'N') || (g.atoms[b.b].el === 'C' && g.atoms[b.a].el === 'N')))) return 'nitrile';
  if (g.bonds.some(b => b.order === 3)) return 'alkyne';
  if (g.bonds.some(b => b.order === 2 && g.atoms[b.a].el === 'C' && g.atoms[b.b].el === 'N')) return 'imine';
  // epoxide: a three-membered ring holding one oxygen
  for (let i = 0; i < g.atoms.length; i++){
    if (g.atoms[i].el !== 'O') continue;
    const nb = neighbors(g, i);
    if (nb.length === 2 && neighbors(g, nb[0].j).some(x => x.j === nb[1].j)) return 'epoxide';
  }
  for (let i = 0; i < g.atoms.length; i++){
    if (g.atoms[i].el !== 'O') continue;
    const nb = neighbors(g, i);
    if (nb.length !== 1 || nb[0].order !== 1) continue;
    const c = nb[0].j; if (g.atoms[c].el !== 'C') continue;
    const carbons = neighbors(g, c).filter(x => g.atoms[x.j].el === 'C').length;
    return (carbons <= 1 ? 'primary' : carbons === 2 ? 'secondary' : 'tertiary') + ' alcohol';
  }
  for (let i = 0; i < g.atoms.length; i++){
    const el = g.atoms[i].el;
    if (el !== 'Br' && el !== 'Cl' && el !== 'I') continue;
    const nb = neighbors(g, i); if (!nb.length) continue;
    const c = nb[0].j; if (g.atoms[c].el !== 'C') continue;
    if (g.atoms[c].arom) return 'aryl halide';
    const carbons = neighbors(g, c).filter(x => g.atoms[x.j].el === 'C').length;
    return (carbons <= 1 ? 'primary' : carbons === 2 ? 'secondary' : 'tertiary') + ' alkyl halide';
  }
  const ni = g.atoms.findIndex(a => a.el === 'N');
  if (ni >= 0 && g.atoms.some(a => a.el === 'O' && neighbors(g, g.atoms.indexOf(a)).length >= 0) && /\[N\+\]/.test(smi) && /\[O-\]/.test(smi)) return 'nitro compound';
  if (ni >= 0){ const cn = neighbors(g, ni).filter(x => g.atoms[x.j].el === 'C').length; return (cn <= 1 ? 'primary' : cn === 2 ? 'secondary' : 'tertiary') + ' amine'; }
  if (g.atoms.some(a => a.el === 'S')) return 'sulfonate ester';
  if (g.atoms.filter(a => a.el === 'O').length){ const oi = g.atoms.findIndex(a => a.el === 'O'); if (neighbors(g, oi).length === 2) return 'ether'; }
  if (g.bonds.some(b => b.order === 2 && g.atoms[b.a].el === 'C' && g.atoms[b.b].el === 'C' && !g.atoms[b.a].arom)) return 'alkene';
  if (arom) return 'aromatic ring';
  return 'alkane';
}
function smilesSane(smi){
  if (typeof smi !== 'string' || !smi) return false;
  let d = 0; for (const ch of smi){ if (ch === '(') d++; if (ch === ')') d--; if (d < 0) return false; }
  if (d) return false;
  const ring = {}; for (const m of smi.replace(/\[[^\]]*\]/g, 'X').match(/\d/g) || []) ring[m] = (ring[m] || 0) + 1;
  return Object.values(ring).every(n => n % 2 === 0);
}
function mulberry(seed){ let s = seed | 0; return function(){ s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function article(t){ return (/^[aeiou]/i.test(t) ? 'an ' : 'a ') + t; }
function shuffled(rng, a){ const b = a.slice(); for (let i = b.length - 1; i > 0; i--){ const j = Math.floor(rng() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; }
function pickN(rng, arr, n, not){ const pool = arr.filter(x => !not.includes(x)); const out = []; while (out.length < n && pool.length){ const i = Math.floor(rng() * pool.length); out.push(pool.splice(i, 1)[0]); } return out; }

/* ------------------------------------------------------------------ */
/* The chain index, built once per reaction table.                      */
/* ------------------------------------------------------------------ */
export function label(r){ return [r.reagent, r.cond].filter(Boolean).join(', '); }
function pairLabel(a, b){ return label(a) + '   then   ' + label(b); }
const _cache = new WeakMap();
export function index(R){
  if (_cache.has(R.REACTIONS)) return _cache.get(R.REACTIONS);
  const live = R.REACTIONS.filter(r => r.prod !== r.sub);
  const bySub = new Map();
  for (const r of live){ if (!bySub.has(r.sub)) bySub.set(r.sub, []); bySub.get(r.sub).push(r); }
  const startSet = new Set(Object.values(R.SUBSTRATES).map(s => s.smi));
  const nameOfSmi = smi => { const s = Object.values(R.SUBSTRATES).find(x => x.smi === smi); return s ? s.name : 'the ' + classify(smi); };
  const chains = [];
  for (const a of live){
    if (!startSet.has(a.sub)) continue;
    for (const b of bySub.get(a.prod) || []){
      if (b.prod === a.sub || b.prod === a.prod) continue;
      chains.push({ a, b, start: a.sub, mid: a.prod, target: b.prod, l1: label(a), l2: label(b) });
    }
  }
  // does running l1 then l2 on `start` reach `target` at all?
  const reaches = (start, l1, l2, target) => {
    for (const f of bySub.get(start) || []) if (label(f) === l1)
      for (const g of bySub.get(f.prod) || []) if (label(g) === l2 && g.prod === target) return true;
    return false;
  };
  // chains fit to ask about ORDER: the two labels differ and the reversed order does not also work
  const ordered = chains.filter(c => c.l1 !== c.l2 && !reaches(c.start, c.l2, c.l1, c.target));
  const out = { live, bySub, startSet, chains, ordered, reaches, nameOfSmi, starts: [...bySub.keys()].filter(s => startSet.has(s)).sort() };
  _cache.set(R.REACTIONS, out);
  return out;
}

/* ------------------------------------------------------------------ */
/* Item generators. Answers are computed from the chain index.          */
/* ------------------------------------------------------------------ */
const KINDS = ['pair', 'mid', 'first'];
function genItem(api, kind){
  const R = api.reactions, X = index(R), rng = api.rng;
  kind = kind || KINDS[Math.floor(rng() * KINDS.length)];
  if (kind === 'pair'){
    const c = X.ordered[Math.floor(rng() * X.ordered.length)];
    const right = pairLabel(c.a, c.b);
    const cands = [];
    const push = (x, y, why) => {
      const t = pairLabel(x, y);
      if (t === right || cands.some(z => z.text === t)) return;
      if (X.reaches(c.start, label(x), label(y), c.target)) return;   // never offer a second route that also works
      cands.push({ text: t, why });
    };
    push(c.b, c.a, 'reversed');
    for (const s of shuffled(rng, R.siblings(c.a))) push(s, c.b, 'wrong first step');
    for (const s of shuffled(rng, R.siblings(c.b))) push(c.a, s, 'second step off');
    for (const s of shuffled(rng, R.byFamily(c.a.family))) if (s.sub === c.start) push(s, c.b, 'wrong first step');
    for (const s of shuffled(rng, R.byFamily(c.b.family))) if (s.sub === c.mid) push(c.a, s, 'second step off');
    const d = cands.slice(0, 3);
    while (d.length < 3){ const s = X.live[Math.floor(rng() * X.live.length)]; const t = pairLabel(c.a, s); if (t !== right && !d.some(z => z.text === t) && !X.reaches(c.start, c.l1, label(s), c.target)) d.push({ text: t, why: 'second step off' }); }
    const choices = shuffled(rng, [{ text: right, why: 'right' }].concat(d));
    return { kind, chain: c, view: 'pair', stem: 'Take ' + X.nameOfSmi(c.start) + ' to ' + X.nameOfSmi(c.target) + '. Which ordered pair of reagents does it?', choices: choices.map(x => ({ text: x.text, smiles: null })), correct: choices.findIndex(x => x.why === 'right'), coach: 'Draw the intermediate first. ' + label(c.a) + ' takes ' + X.nameOfSmi(c.start) + ' to ' + X.nameOfSmi(c.mid) + ', and then ' + label(c.b) + ' takes that to ' + X.nameOfSmi(c.target) + '. Run those two the other way around and step one leaves nothing for step two to grab.', roots: ['l1-groups', 'l2-arrows'] };
  }
  if (kind === 'mid'){
    const c = X.chains[Math.floor(rng() * X.chains.length)];
    const ans = c.mid;
    const pool = [];
    for (const s of R.siblings(c.a)) pool.push(s.prod);
    for (const s of X.bySub.get(c.start) || []) pool.push(s.prod);
    for (const s of X.bySub.get(c.mid) || []) pool.push(s.prod);
    pool.push(c.start, c.target);
    const uniq = []; for (const s of pool) if (s !== ans && !uniq.includes(s) && smilesSane(s)) uniq.push(s);
    let d = pickN(rng, uniq, 3, []);
    while (d.length < 3){ const s = X.live[Math.floor(rng() * X.live.length)].prod; if (s !== ans && !d.includes(s)) d.push(s); }
    const choices = shuffled(rng, [ans].concat(d));
    return { kind, chain: c, view: 'mid', drawn: true, stem: X.nameOfSmi(c.start) + ' is treated with ' + label(c.a) + ', then with ' + label(c.b) + '. What is the intermediate after step one?', choices: choices.map(s => ({ text: 'the ' + classify(s), smiles: s })), correct: choices.indexOf(ans), coach: 'Step two is a distraction until you have drawn step one. ' + label(c.a) + ' on ' + X.nameOfSmi(c.start) + ' is ' + c.a.name.toLowerCase() + ': ' + c.a.thomas, roots: c.a.roots.length ? c.a.roots : ['l1-groups'] };
  }
  // first: which reagent goes FIRST
  const c = X.ordered[Math.floor(rng() * X.ordered.length)];
  const opts = [];
  const alsoWorks = t => X.chains.some(z => z.start === c.start && z.target === c.target && z.l1 === t);
  const add = (t, ok) => { if (!opts.some(o => o.text === t) && (ok || !alsoWorks(t))) opts.push({ text: t, ok }); };
  add(label(c.a), true);
  add(label(c.b), false);
  for (const s of shuffled(rng, R.siblings(c.a))) add(label(s), false);
  for (const s of shuffled(rng, R.siblings(c.b))) add(label(s), false);
  let guard = 0;
  while (opts.length < 4 && guard++ < 400) add(label(X.live[Math.floor(rng() * X.live.length)]), false);
  const four = [opts[0]].concat(opts.slice(1, 4));
  const choices = shuffled(rng, four);
  return { kind: 'first', chain: c, view: 'pair', stem: 'You need ' + X.nameOfSmi(c.start) + ' to become ' + X.nameOfSmi(c.target) + ' in two steps. Which reagent goes FIRST?', choices: choices.map(x => ({ text: x.text, smiles: null })), correct: choices.findIndex(x => x.ok), coach: 'Ask what the second reagent would even find on the starting material. ' + label(c.a) + ' goes first, because it makes ' + X.nameOfSmi(c.mid) + ', and that is the only thing ' + label(c.b) + ' can act on here.', roots: ['l1-groups', 'l2-arrows'] };
}

export function makeItem(api){
  const it = genItem(api);
  return { stem: it.stem, sub: it.chain.start, reagent: it.kind === 'mid' ? label(it.chain.a) : null, prod: it.kind === 'mid' ? null : it.chain.target, choices: it.choices, correct: it.correct, coach: it.coach, home: meta.id, roots: it.roots };
}

export function selfTest(deps){
  let tried = 0;
  try {
    const R = deps.reactions, X = index(R);
    if (X.chains.length < 60) throw new Error('only ' + X.chains.length + ' chains found in the table');
    if (X.ordered.length < 30) throw new Error('only ' + X.ordered.length + ' order-safe chains found');
    // every chain really links, and every endpoint is a real table structure
    for (const c of X.chains){
      if (c.a.prod !== c.b.sub) throw new Error('chain does not link: ' + c.a.id + ' then ' + c.b.id);
      if (c.start !== c.a.sub || c.mid !== c.a.prod || c.target !== c.b.prod) throw new Error('chain fields disagree with the table: ' + c.a.id);
      if (!X.startSet.has(c.start)) throw new Error(c.a.id + ': the start is not a listed substrate');
      if (c.start === c.target) throw new Error(c.a.id + ': a chain must go somewhere');
      for (const s of [c.start, c.mid, c.target]) if (!smilesSane(s)) throw new Error('bad SMILES ' + s);
      if (!classify(c.mid)) throw new Error('cannot name the intermediate of ' + c.a.id);
    }
    for (const c of X.ordered){ if (X.reaches(c.start, c.l2, c.l1, c.target)) throw new Error(c.a.id + ': the reversed order also works, so it is not an order question'); }
    // known chains the DAT actually asks
    const want = [['alkene_hydroboration', 'alc1_pcc'], ['eas_no2', 'nitro_reduction'], ['acid_socl2', 'acyl_ester'], ['acid_socl2', 'acyl_amide'], ['nitro_reduction', 'sandmeyer_br']];
    for (const [x, y] of want) if (!X.chains.some(c => c.a.id === x && c.b.id === y)) throw new Error('expected chain missing: ' + x + ' then ' + y);
    const rng = mulberry(61);
    const api = { rng, pick: a => a[Math.floor(rng() * a.length)], shuffle: a => shuffled(rng, a), reactions: R, bank: deps.bank };
    const kinds = {};
    for (let n = 0; n < 400; n++){
      const it = makeItem(api); tried++;
      if (!it.choices || it.choices.length !== 4) throw new Error('four choices required');
      const keys = it.choices.map(c => (c.smiles || '') + '|' + (c.text || ''));
      if (new Set(keys).size !== 4) throw new Error('choices not distinct: ' + keys.join(' / '));
      if (!(it.correct >= 0 && it.correct < 4)) throw new Error('bad correct index');
      for (const c of it.choices) if (c.smiles && !smilesSane(c.smiles)) throw new Error('bad SMILES ' + c.smiles);
      if (it.sub && !smilesSane(it.sub)) throw new Error('bad sub SMILES');
      if (it.prod && !smilesSane(it.prod)) throw new Error('bad prod SMILES');
      if (!it.coach || !it.stem) throw new Error('coach or stem empty');
      if (it.home !== meta.id) throw new Error('home');
      if (!Array.isArray(it.roots) || !it.roots.length) throw new Error('roots');
    }
    for (const k of KINDS){
      for (let n = 0; n < 220; n++){
        const it = genItem(api, k); kinds[k] = (kinds[k] || 0) + 1;
        const c = it.chain;
        if (c.a.prod !== c.b.sub) throw new Error(k + ': generated a chain that does not link');
        if (k === 'mid' && it.choices[it.correct].smiles !== c.mid) throw new Error('mid item marked the wrong choice');
        if (k === 'pair'){
          if (it.choices[it.correct].text !== pairLabel(c.a, c.b)) throw new Error('pair item marked the wrong choice');
          for (let j = 0; j < 4; j++){
            if (j === it.correct) continue;
            const m = /^(.*)   then   (.*)$/.exec(it.choices[j].text);
            if (m && X.reaches(c.start, m[1], m[2], c.target)) throw new Error('a distractor pair also reaches the target');
          }
        }
        if (k === 'first'){
          if (it.choices[it.correct].text !== label(c.a)) throw new Error('first item marked the wrong choice');
          for (let j = 0; j < 4; j++){ if (j === it.correct) continue; if (X.chains.some(z => z.start === c.start && z.target === c.target && z.l1 === it.choices[j].text)) throw new Error('a distractor first reagent also opens a real route'); }
        }
      }
    }
    const a = makeItem({ rng: mulberry(9), pick: x => x[0], shuffle: x => x, reactions: R, bank: deps.bank });
    const b = makeItem({ rng: mulberry(9), pick: x => x[0], shuffle: x => x, reactions: R, bank: deps.bank });
    if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error('not reproducible');
    return { ok: true, tried, notes: X.chains.length + ' real chains (' + X.ordered.length + ' order-safe), ' + Object.keys(kinds).length + ' item kinds' };
  } catch (e){ return { ok: false, tried, notes: e.message }; }
}

/* ================================================================== */
/* Browser side                                                         */
/* ================================================================== */
function molSize(smi){
  const n = (smi.replace(/\[[^\]]*\]/g, 'X').match(/Cl|Br|[BCNOSPFIX]|[cnos]/g) || []).length;
  const ring = /\d/.test(smi.replace(/\[[^\]]*\]/g, ''));
  return { width: Math.max(130, Math.min(280, 84 + 15 * n)), height: Math.max(96, Math.min(180, (ring ? 100 : 72) + 8 * n)) };
}
function drawMol(api, target, smi, label2, max){
  const wrap = api.el('div', { style: { maxWidth: max || '220px', margin: '0 auto' } });
  api.drawSmiles(wrap, smi, Object.assign(molSize(smi), { label: label2 || 'structure' }));
  target.append(wrap);
  return wrap;
}
function reveal(api, node, delay){
  if (api.reduced){ node.style.opacity = '1'; node.style.transform = 'none'; return; }
  node.style.opacity = '0'; node.style.transform = 'translateX(-10px)';
  node.style.transition = 'opacity .45s ease ' + (delay || 0) + 'ms, transform .45s ease ' + (delay || 0) + 'ms';
  requestAnimationFrame(() => requestAnimationFrame(() => { node.style.opacity = '1'; node.style.transform = 'none'; }));
}

/* VISUAL: the chain builder. Pick a start, pick a reagent, the product becomes the new start. */
function mountBuilder(slots, api){
  const { el } = api, C = api.colors, R = api.reactions, X = index(R);
  const featured = ['C=CC', 'CCCO', 'c1ccccc1', 'CC(=O)O', 'CCCBr', 'CCC#C', 'CC(C)O', 'CCC=O', 'COC(C)=O', 'Nc1ccccc1'].filter(s => X.bySub.has(s));
  let steps = [];              // [{ r }] applied in order
  let start = featured[0];
  const wrap = el('div', {});
  const chainEl = el('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' } });
  const pickEl = el('div', { style: { marginTop: '14px' } });
  const readout = el('p', { style: { margin: '10px 0 0', color: C.ink2, fontSize: '15px', maxWidth: '72ch', minHeight: '3em' } });
  const startRow = el('div', { class: 'controls', role: 'group', 'aria-label': 'Pick a starting material' });
  const startBtns = featured.map(s => el('button', { class: 'chip', type: 'button', 'aria-pressed': s === start ? 'true' : 'false', text: X.nameOfSmi(s), onClick: () => { start = s; steps = []; sync(); draw(); } }));
  startRow.append(...startBtns);
  function sync(){ startBtns.forEach((b, i) => b.setAttribute('aria-pressed', featured[i] === start ? 'true' : 'false')); }
  const undoBtn = el('button', { class: 'secondary', type: 'button', text: 'Undo step', onClick: () => { steps.pop(); draw(); } });
  const clearBtn = el('button', { class: 'secondary', type: 'button', text: 'Start over', onClick: () => { steps = []; draw(); } });
  wrap.append(el('div', { class: 'eyebrow', text: 'Build a chain. Pick a start, pick a reagent, and the product becomes your new starting material.' }), startRow, chainEl, pickEl, el('div', { class: 'controls' }, undoBtn, clearBtn), readout);
  slots.visual.append(wrap);

  function current(){ return steps.length ? steps[steps.length - 1].prod : start; }
  function box(smi, caption, tone){
    const gold = tone === 'now';
    const b = el('div', { style: { flex: '0 0 auto', border: '1px solid ' + (gold ? C.gold : C.line), background: gold ? 'rgba(201,168,76,.08)' : 'rgba(255,255,255,.02)', borderRadius: '12px', padding: '8px', textAlign: 'center', maxWidth: '230px' } });
    drawMol(api, b, smi, caption, '200px');
    b.append(el('div', { style: { fontFamily: 'Georgia, serif', fontSize: '13.5px', color: gold ? C.goldhi : C.ink2, marginTop: '2px' }, text: caption }));
    return b;
  }
  function arrowEl(r){
    return el('div', { style: { flex: '0 0 122px', textAlign: 'center', fontFamily: 'ui-monospace, Menlo, monospace', fontSize: '11.5px', color: C.ink3 } },
      el('div', { style: { color: C.ink } , text: r.reagent }),
      el('div', { style: { height: '2px', background: C.gold, margin: '4px 0', position: 'relative' } }, el('span', { style: { position: 'absolute', right: '-1px', top: '-5px', borderTop: '6px solid transparent', borderBottom: '6px solid transparent', borderLeft: '9px solid ' + C.gold } })),
      el('div', { text: r.cond || '' }));
  }
  function draw(){
    chainEl.replaceChildren();
    chainEl.append(box(start, X.nameOfSmi(start), steps.length ? 'past' : 'now'));
    steps.forEach((r, i) => {
      const a = arrowEl(r), b = box(r.prod, X.nameOfSmi(r.prod), i === steps.length - 1 ? 'now' : 'past');
      chainEl.append(a, b);
      if (i === steps.length - 1){ reveal(api, a, 0); reveal(api, b, 180); }
    });
    pickEl.replaceChildren();
    const cur = current(), next = (X.bySub.get(cur) || []).filter(r => r.prod !== cur);
    if (steps.length >= 3){
      pickEl.append(el('p', { style: { margin: '0', color: C.ink2, fontSize: '15px' }, text: 'Three steps is plenty. Undo a step or start over to try a different route.' }));
    } else if (!next.length){
      pickEl.append(el('p', { style: { margin: '0', color: C.amber, fontSize: '15px' }, text: 'Nothing in the verified table goes on from here, so this is a dead end for now. Undo the last step and try a different reagent.' }));
    } else {
      pickEl.append(el('div', { class: 'eyebrow', style: { marginBottom: '6px' }, text: 'Reagents that act on ' + X.nameOfSmi(cur) }));
      const row = el('div', { class: 'controls', style: { marginTop: '0' } });
      for (const r of next) row.append(el('button', { class: 'chip', type: 'button', title: r.name, text: [r.reagent, r.cond].filter(Boolean).join(', '), onClick: () => { steps.push(r); draw(); } }));
      pickEl.append(row);
    }
    if (!steps.length) readout.textContent = 'You are holding ' + X.nameOfSmi(start) + ', which is ' + article(classify(start)) + '. Pick a reagent and watch what it becomes. Then look at the new list of reagents: it changed, because step one changed what step two can even see.';
    else {
      const last = steps[steps.length - 1];
      const path = [X.nameOfSmi(start)].concat(steps.map(r => X.nameOfSmi(r.prod))).join(' to ');
      readout.textContent = path + '. Last move: ' + last.name.toLowerCase() + '. ' + last.thomas;
    }
    undoBtn.disabled = !steps.length; clearBtn.disabled = !steps.length;
  }
  sync(); draw();
  return { draw };
}

/* A short panel of routes the DAT keeps asking for, straight out of the table. */
function mountRoutes(container, api, builder){
  const { el } = api, C = api.colors, R = api.reactions, X = index(R);
  const WANT = [
    { a: 'alkene_hydroboration', b: 'alc1_pcc', note: 'Anti-Markovnikov first, then the gentle oxidant. Jones instead of PCC would run right past the aldehyde to the acid.' },
    { a: 'eas_no2', b: 'nitro_reduction', note: 'A ring will not take NH2 directly, so you hang a nitro group on it and reduce that. This is the front half of every aniline route.' },
    { a: 'nitro_reduction', b: 'sandmeyer_br', note: 'And once you have the aniline, diazotize it and a copper salt puts almost anything on the ring, including groups no direct reaction will install.' },
    { a: 'acid_socl2', b: 'acyl_ester', note: 'Up the ladder once with SOCl2, then down it wherever you like. This beats Fischer because it is not an equilibrium.' },
    { a: 'acid_socl2', b: 'acyl_amide', note: 'Same activation, different nucleophile. Notice you cannot go acid straight to amide without heat, and you can never go amide back to ester at all.' },
    { a: 'alkene_hbr_peroxide', b: 'hal1_nacn', note: 'Peroxide puts the bromine on the open end so the SN2 has a primary carbon to attack. Markovnikov first and the SN2 would be fighting a secondary center.' }
  ].map(w => ({ w, c: X.chains.find(c => c.a.id === w.a && c.b.id === w.b) })).filter(x => x.c);
  const holder = el('div', { style: { marginTop: '18px', paddingTop: '14px', borderTop: '1px solid ' + C.line } });
  holder.append(el('div', { class: 'eyebrow', style: { marginBottom: '8px' }, text: 'Routes the test keeps asking for' }));
  const list = el('div', { style: { display: 'flex', flexDirection: 'column', gap: '6px' } });
  let openAt = -1;
  function draw(){
    list.replaceChildren();
    WANT.forEach((x, i) => {
      const c = x.c, open = openAt === i;
      const b = el('button', { type: 'button', 'aria-pressed': open ? 'true' : 'false', style: { display: 'block', width: '100%', textAlign: 'left', minHeight: '46px', padding: '9px 12px', borderRadius: '10px', border: '1px solid ' + (open ? C.gold : C.line), background: open ? 'rgba(201,168,76,.1)' : 'rgba(255,255,255,.02)', color: C.ink2 }, onClick: () => { openAt = open ? -1 : i; draw(); } });
      b.append(el('div', { style: { fontFamily: 'Georgia, serif', fontSize: '15.5px', color: open ? C.goldhi : C.ink } }, X.nameOfSmi(c.start) + ' to ' + X.nameOfSmi(c.mid) + ' to ' + X.nameOfSmi(c.target)));
      const kv = (k, v) => el('div', { style: { display: 'flex', gap: '8px', fontFamily: 'ui-monospace, Menlo, monospace', fontSize: '12px', marginTop: '2px' } }, el('span', { style: { color: C.ink3, flex: '0 0 42px', letterSpacing: '.08em' }, text: k }), el('span', { style: { color: C.gold }, text: v }));
      b.append(kv('FIRST', label(c.a)), kv('THEN', label(c.b)));
      if (open) b.append(el('div', { style: { fontSize: '14.5px', color: C.ink2, marginTop: '6px', maxWidth: '68ch' }, text: x.w.note }));
      list.append(b);
    });
  }
  draw();
  holder.append(list, el('p', { style: { margin: '9px 0 0', fontSize: '14px', color: C.ink3 }, text: 'Tap a route to hear why the order is fixed. Every one of these is two entries of the verified table with the first product matched to the second substrate.' }));
  container.append(holder);
}

/* You try. */
function mountTry(slots, api){
  const { el } = api, C = api.colors, R = api.reactions, X = index(R);
  const bank = (api.bank && api.bank.items) ? api.bank.items('multistep-synthesis') : [];
  let item = null, firstTry = true, done = false, turn = 0;
  const box = el('div', { class: 'item' }); slots.try.append(box);
  function commit(ok, coachText){
    if (done) return;
    if (ok){ done = true; api.report(firstTry); api.clearCoach(); box.append(el('div', { class: 'verdict good', text: 'You can read it.' }), el('div', { class: 'controls' }, el('button', { class: 'primary', type: 'button', text: 'Another one', onClick: next }))); }
    else { if (firstTry) api.report(false); firstTry = false; if (!box.querySelector('.verdict')) box.append(el('div', { class: 'verdict notyet', text: 'Not yet.' })); api.coach(coachText); }
  }
  function optionGrid(choices, correct, coachText, drawn){
    const grid = el('div', { class: 'opts' }), btns = [];
    choices.forEach((c, i) => {
      const b = el('button', { class: 'opt', type: 'button', 'aria-label': c.text || ('choice ' + (i + 1)) });
      b.append(el('span', { class: 'k', text: 'ABCD'[i] }));
      if (drawn && c.smiles){ const holder = el('div', {}); if (c.text) holder.append(el('div', { style: { fontSize: '13px', color: C.ink2, marginBottom: '2px' }, text: c.text })); drawMol(api, holder, c.smiles, c.text, '180px'); b.append(holder); }
      else b.append(el('span', { text: c.text }));
      b.addEventListener('click', () => { if (done) return; btns.forEach(x => x.classList.remove('picked')); b.classList.add('picked'); if (i === correct){ b.classList.add('ok'); btns.forEach(x => { x.disabled = true; }); commit(true); } else commit(false, coachText); });
      btns.push(b); grid.append(b);
    });
    box.append(grid);
  }
  function cell(smi, caption, gold){
    const b = el('div', { style: { border: '1px solid ' + (gold ? C.gold : C.line), background: 'rgba(255,255,255,.02)', borderRadius: '10px', padding: '8px', textAlign: 'center', flex: '0 1 210px' } });
    drawMol(api, b, smi, caption, '190px');
    b.append(el('div', { style: { fontFamily: 'Georgia, serif', fontSize: '13.5px', color: C.ink2, marginTop: '2px' }, text: caption }));
    return b;
  }
  function qcell(label2){ return el('div', { style: { border: '1px dashed ' + C.gold, borderRadius: '10px', minHeight: '112px', flex: '0 1 210px', display: 'grid', placeItems: 'center', color: C.goldhi } }, el('div', {}, el('div', { style: { fontSize: '32px', textAlign: 'center', fontFamily: 'Georgia, serif' }, text: '?' }), el('div', { style: { fontSize: '11.5px', fontFamily: 'ui-monospace, Menlo, monospace', letterSpacing: '.08em', textAlign: 'center' }, text: label2 }))); }
  function mini(t){ return el('div', { style: { flex: '0 0 104px', textAlign: 'center', fontFamily: 'ui-monospace, Menlo, monospace', fontSize: '11px', color: C.ink3 } }, el('div', { style: { color: C.ink2 }, text: t }), el('div', { style: { height: '2px', background: C.line, margin: '4px 0' } })); }
  function renderGenerated(it){
    box.append(el('p', { class: 'prompt', text: it.stem }));
    const c = it.chain;
    const row = el('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', justifyContent: 'center', marginBottom: '4px' } });
    if (it.view === 'mid') row.append(cell(c.start, X.nameOfSmi(c.start), false), mini(label(c.a)), qcell('step one'), mini(label(c.b)), cell(c.target, X.nameOfSmi(c.target), false));
    else row.append(cell(c.start, X.nameOfSmi(c.start), false), mini('two steps'), cell(c.target, X.nameOfSmi(c.target), true));
    box.append(row);
    optionGrid(it.choices, it.correct, it.coach, !!it.drawn);
  }
  function renderBank(b){
    box.append(el('p', { class: 'prompt', text: b.q }));
    if (b.q_smiles){ const holder = el('div', { style: { margin: '0 auto 6px', maxWidth: '340px' } }); api.drawSmiles(holder, b.q_smiles, { width: 300, height: 190, label: 'the structure in the question' }); box.append(holder); }
    box.append(el('p', { class: 'eyebrow', style: { margin: '6px 0 0' }, text: 'From the verified bank, DAT phrasing' }));
    const structural = !!b.opts_are_structures;
    const opts = b.opts.map(o => structural ? { text: '', smiles: o } : { text: String(o), smiles: null });
    let correct = b.correct, list = opts.slice();
    while (list.length > 4){ const i = list.findIndex((x, k) => k !== correct); list.splice(i, 1); if (i < correct) correct--; }
    optionGrid(list, correct, String(b.why || '').split(/(?<=\.)\s+/).slice(0, 2).join(' '), structural);
  }
  function next(){
    box.replaceChildren(); api.clearCoach(); firstTry = true; done = false; turn++;
    if (bank.length && turn % 3 === 0){ item = api.pick(bank); renderBank(item); }
    else { item = genItem(api); renderGenerated(item); }
  }
  next();
}

export function mount(slots, api){
  const builder = mountBuilder(slots, api);
  mountRoutes(slots.visual, api, builder);
  mountTry(slots, api);
}
