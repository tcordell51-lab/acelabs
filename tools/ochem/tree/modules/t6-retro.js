// The Tree of Organic, Level 6, Module 2: Work backward one cut at a time.
// Retrosynthesis over the verified reaction table: what made this, and what
// made that. Every route shown is a real chain in the table. No imports.

export const meta = {
  id: 't6-retro',
  level: 6,
  order: 2,
  needs3D: false,
  title: 'Work backward one cut at a time',
  concept: 'Retrosynthesis',
  tagline: 'Do not ask how to build it. Ask what the last step was.',
  story: 'Forward synthesis is guessing. Backward synthesis is reading. Stand at the target and ask one question: what was the last step? Only a handful of reactions could have made that bond, so the list of candidates is short, and each one hands you a simpler molecule to stand on. Ask again. Keep cutting until what is left is something you were given. The cuts the DAT loves are the ones that make carbon to carbon bonds, because those are the ones you cannot get any other way: a Grignard behind every alcohol, a Wittig behind an alkene next to where a carbonyl used to be, an aldol or a Claisen behind anything with two carbonyls in a beta relationship, an acetylide behind a longer alkyne. Rule of thumb: name the last step, then stand on what it came from.',
  moveName: 'Name the last step, then stand on what it came from',
  move: [
    'Look at the target and find the bond that was probably made last: usually the one next to an oxygen, or a new carbon to carbon bond.',
    'Name the reactions that could put that bond there. On this test that is a short list, so say them out loud.',
    'Cut it. Write down the simpler molecule that reaction started from, and check that you could actually buy or make it.',
    'Repeat until you reach the starting material you were given, then read your cuts backward and that is the synthesis.'
  ],
  trap: 'Careful: a Grignard cannot be anywhere near an alcohol, an acid or an amine, so if your backward cut leaves a molecule with one of those in it, the forward route needs a protecting group or a different disconnection.',
  holdsUp: ['Multi-step synthesis questions', 'Reagent choice', 'Which starting material questions', 'Reading a long scheme'],
  drill: 'Booster OChem: Synthesis'
};

export const SMILES = [];
const HOME = 't6-retro';
const ROOTS = ['l1-groups', 'l2-arrows'];

// The disconnection names a student should be able to say out loud.
const CUTS = [
  { test: r => /grignard/i.test(r.name) || /MgBr/.test(r.reagent || ''), name: 'a Grignard disconnection', why: 'An alcohol with a carbon chain on it is almost always a Grignard plus a carbonyl. Cut the bond to the carbinol carbon.' },
  { test: r => /wittig/i.test(r.name), name: 'a Wittig disconnection', why: 'An alkene sitting exactly where a carbonyl would fit is a Wittig. Cut the double bond and put an oxygen back on one side.' },
  { test: r => /aldol/i.test(r.name), name: 'an aldol disconnection', why: 'A beta-hydroxy carbonyl, or the enone it dehydrates to, comes from two carbonyls. Cut the bond between the alpha and beta carbons.' },
  { test: r => /claisen/i.test(r.name), name: 'a Claisen disconnection', why: 'A beta-keto ester comes from two esters. Cut the bond between the two carbonyl halves.' },
  { test: r => /acetylide|alkylation/i.test(r.name), name: 'an acetylide alkylation', why: 'A longer internal alkyne comes from a shorter terminal one plus a primary halide. Cut the bond next to the triple bond.' },
  { test: r => /williamson/i.test(r.name), name: 'a Williamson disconnection', why: 'An ether comes from an alkoxide plus a primary halide. Cut either C to O bond, then pick the one where the halide side is primary.' },
  { test: r => /diels/i.test(r.name), name: 'a Diels-Alder disconnection', why: 'A cyclohexene comes from a diene plus a dienophile. Cut the two single bonds across the ring from the double bond.' },
  { test: r => /reduction|hydride|DIBAL|borohydride|LiAlH/i.test(r.name + ' ' + (r.reagent || '')), name: 'a reduction', why: 'An alcohol or an amine one oxidation level below a carbonyl came from that carbonyl.' },
  { test: r => /oxidation|PCC|Jones/i.test(r.name + ' ' + (r.reagent || '')), name: 'an oxidation', why: 'A carbonyl one level above an alcohol came from that alcohol.' },
  { test: () => true, name: 'a functional group change', why: 'The carbon skeleton did not change here, only what is hanging off it. Those cuts are cheap; save your thinking for the carbon to carbon bonds.' }
];
export function cutOf(r){ return CUTS.find(c => c.test(r)); }

/* ------------------------------------------------------------------ */
/* Walking the table backward                                           */
/* ------------------------------------------------------------------ */
export function label(r){ return r.reagent + (r.cond ? ' | ' + r.cond : ''); }
/** Every reaction in the table whose product is this SMILES. */
export function madeBy(R, smi){ return R.REACTIONS.filter(x => x.prod === smi); }
/** Is this a molecule the student is handed rather than one they build? */
export function isStart(R, smi){ for (const k in R.SUBSTRATES) if (R.SUBSTRATES[k].smi === smi) return true; return false; }
// Product names, so a molecule is called what it is rather than what made it.
const NAMES = {
  'CC(C)I': '2-iodopropane', 'CCCI': '1-iodopropane', 'CCCC#N': 'butanenitrile', 'CCCN': 'propylamine',
  'CC(C)Cl': '2-chloropropane', 'CCC(=O)O': 'propanoic acid', 'CCCCl': '1-chloropropane',
  'CCCOS(=O)(=O)c1ccc(C)cc1': 'propyl tosylate', 'CCCOCCC': 'dipropyl ether', 'CCCOC(C)=O': 'propyl acetate',
  'CC(O)CO': 'propane-1,2-diol', 'COCC(C)O': '1-methoxypropan-2-ol', 'CCC(C)O': 'butan-2-ol',
  'CC(O)CC=O': '3-hydroxybutanal, the aldol', 'C/C=C/C=O': 'but-2-enal, the condensation product',
  'CCO': 'ethanol', 'CNC(C)=O': 'N-methylacetamide', 'C=C(C)CC': '2-methylbut-1-ene',
  'CC(=O)CBr': 'bromoacetone', 'CCC(C)(C)O': '2-methylbutan-2-ol', 'CCC(C)(OC)OC': 'the dimethyl ketal',
  'CCC(C)=NC': 'the N-methyl ketimine', 'CCC(C)(O)C#N': 'the cyanohydrin', 'CCC(C)NC': 'N-methylbutan-2-amine',
  'CCCC': 'butane', 'CCC(C)Br': '2-bromobutane', 'C[C@@H](Br)[C@H](C)Br': 'meso-2,3-dibromobutane',
  'C[C@@H](O)[C@@H](C)O': 'butane-2,3-diol', 'CCC(O)C#N': 'the cyanohydrin of propanal',
  'CCC=NC': 'the N-methyl imine', 'CC=CN(C)C': 'the enamine', 'CCC(OC)OC': 'the dimethyl acetal',
  'CCC=C': 'but-1-ene', 'CCC': 'propane', 'CC(C)(C)Cl': 'tert-butyl chloride',
  'C=C(C)C': '2-methylpropene', 'COC(C)(C)C': 'tert-butyl methyl ether', 'CC(Br)CBr': '1,2-dibromopropane',
  'CC(O)CBr': 'the halohydrin', 'CC(=O)CC(=O)OCC': 'ethyl acetoacetate',
  '[O-][N+](=O)c1cccc([N+](=O)[O-])c1': '1,3-dinitrobenzene', 'Brc1ccccc1': 'bromobenzene',
  'Clc1ccc(Br)cc1': '4-bromochlorobenzene', 'OS(=O)(=O)c1ccccc1': 'benzenesulfonic acid',
  'CC(C)c1ccccc1': 'isopropylbenzene (cumene)', 'CC(=O)c1ccccc1': 'acetophenone'
};

export function nameOf(R, smi){
  for (const k in R.SUBSTRATES) if (R.SUBSTRATES[k].smi === smi) return R.SUBSTRATES[k].name;
  return NAMES[smi] || 'this molecule';
}

/**
 * Real two step routes: start (a SUBSTRATES entry) -> mid -> target, where both
 * legs are reactions in the table and the target is not itself a start.
 */
export function twoStepRoutes(R){
  const out = [];
  for (const first of R.REACTIONS){
    if (!isStart(R, first.sub)) continue;
    for (const second of R.REACTIONS){
      if (second.sub !== first.prod) continue;
      if (second.prod === first.sub) continue;              // straight back where it started
      if (second.prod === first.prod) continue;
      out.push({ start: first.sub, mid: first.prod, target: second.prod, r1: first, r2: second });
    }
  }
  return out;
}

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

// What was the last step?
export function genLast(api){
  const R = api.reactions;
  const routes = twoStepRoutes(R);
  const c = api.pick(routes);
  const right = label(c.r2);
  // honest distractors: reagents that act on the same intermediate but give something else
  const sibs = R.REACTIONS.filter(x => x.sub === c.mid && x.prod !== c.target);
  const others = R.REACTIONS.filter(x => x.prod !== c.target && x.sub !== c.mid);
  const pool = api.shuffle(sibs).concat(api.shuffle(others));
  const ds = [];
  for (const x of pool){ const t = label(x); if (t !== right && !ds.some(d => d.text === t)) ds.push({ text: t, smiles: null }); if (ds.length === 3) break; }
  if (ds.length < 3) return genStart(api);
  const sh = api.shuffle([{ text: right, ok: true }].concat(ds.map(d => ({ text: d.text, ok: false }))));
  return finish({
    kind: 'last', sub: c.mid, prod: c.target,
    stem: 'The molecule on the left was turned into the one on the right in one step. Which reagent did it?',
    choices: sh.map(x => ({ text: x.text, smiles: null })),
    correct: sh.findIndex(x => x.ok),
    coach: c.r2.name + ': ' + c.r2.thomas + ' Reading backward, that is ' + cutOf(c.r2).name + '.'
  });
}

// Which starting material reaches this target in two steps?
export function genStart(api){
  const R = api.reactions;
  const routes = twoStepRoutes(R);
  const c = api.pick(routes);
  const starts = [];
  for (const k in R.SUBSTRATES) if (R.SUBSTRATES[k].smi !== c.start && starts.indexOf(R.SUBSTRATES[k].smi) < 0) starts.push(R.SUBSTRATES[k].smi);
  // a distractor start must NOT itself reach the target in one or two steps
  const reaches = (smi) => {
    for (const a of R.REACTIONS){ if (a.sub !== smi) continue; if (a.prod === c.target) return true; for (const b of R.REACTIONS) if (b.sub === a.prod && b.prod === c.target) return true; }
    return false;
  };
  const ds = api.shuffle(starts).filter(s => !reaches(s)).slice(0, 3);
  if (ds.length < 3) return genLast(api);
  const sh = api.shuffle([{ smiles: c.start, ok: true }].concat(ds.map(s => ({ smiles: s, ok: false }))));
  return finish({
    kind: 'start', prod: c.target,
    stem: 'Which starting material reaches the target on the right in two steps?',
    choices: sh.map(x => ({ text: '', smiles: x.smiles })),
    correct: sh.findIndex(x => x.ok),
    coach: 'Work backward. The last step was ' + c.r2.name.toLowerCase() + ' (' + label(c.r2) + '), which came from ' + nameOf(R, c.mid) + '. That in turn came from ' + nameOf(R, c.start) + ' by ' + c.r1.name.toLowerCase() + ' (' + label(c.r1) + '). Two cuts and you are standing on the answer.'
  });
}

// Name the disconnection.
export function genCut(api){
  const R = api.reactions;
  const named = R.REACTIONS.filter(r => cutOf(r).name !== 'a functional group change');
  const r = api.pick(named);
  const right = cutOf(r).name;
  const pool = CUTS.filter(c => c.name !== right && c.name !== 'a functional group change');
  const ds = api.shuffle(pool).slice(0, 3);
  const sh = api.shuffle([{ text: right, ok: true }].concat(ds.map(c => ({ text: c.name, ok: false }))));
  return finish({
    kind: 'cut', sub: r.sub, prod: r.prod, reagent: label(r),
    stem: 'Reading this step backward, what is the disconnection called?',
    choices: sh.map(x => ({ text: x.text, smiles: null })),
    correct: sh.findIndex(x => x.ok),
    coach: cutOf(r).why + ' Forward, that is ' + r.name.toLowerCase() + '.'
  });
}

// What is the intermediate?
export function genMid(api){
  const R = api.reactions;
  const routes = twoStepRoutes(R);
  const c = api.pick(routes);
  const wrongMids = R.REACTIONS.filter(x => x.prod !== c.mid && x.prod !== c.target && x.prod !== c.start).map(x => x.prod);
  const uniq = [];
  for (const m of api.shuffle(wrongMids)) if (uniq.indexOf(m) < 0) uniq.push(m);
  const ds = uniq.slice(0, 3);
  if (ds.length < 3) return genLast(api);
  const sh = api.shuffle([{ smiles: c.mid, ok: true }].concat(ds.map(m => ({ smiles: m, ok: false }))));
  return finish({
    kind: 'mid', sub: c.start, prod: c.target, reagent: label(c.r1) + ', then ' + label(c.r2),
    stem: 'What is the intermediate, after step one and before step two?',
    choices: sh.map(x => ({ text: '', smiles: x.smiles })),
    correct: sh.findIndex(x => x.ok),
    coach: 'Step one is ' + c.r1.name.toLowerCase() + ', which gives ' + nameOf(R, c.mid) + '. Then step two, ' + c.r2.name.toLowerCase() + ', takes that to the target. ' + c.r1.thomas
  });
}

const GENS = [genLast, genStart, genCut, genMid];
export function gen(api){ return api.pick(GENS)(api); }
export function makeItem(api){
  const bank = api.bank && api.bank.items ? api.bank.items(HOME) : [];
  if (bank.length && api.rng() < 0.35) return api.bank.toItem(api.pick(bank));
  return gen(api);
}

/* ------------------------------------------------------------------ */
export function selfTest(deps){
  const notes = [], fail = m => notes.push(m);
  const api = tinyApi(deps, 53);
  const R = deps.reactions;
  const routes = twoStepRoutes(R);
  if (routes.length < 30) fail('only ' + routes.length + ' two step routes');
  // every route must genuinely link, and every leg must be a real table entry
  for (const c of routes){
    if (c.r1.prod !== c.mid || c.r2.sub !== c.mid) fail('route does not link: ' + c.r1.id + ' then ' + c.r2.id);
    if (!isStart(R, c.start)) fail('route does not begin at a substrate: ' + c.r1.id);
    if (!R.REACTIONS.some(x => x.id === c.r1.id) || !R.REACTIONS.some(x => x.id === c.r2.id)) fail('route uses a reaction not in the table');
    if (!smilesOk(c.start) || !smilesOk(c.mid) || !smilesOk(c.target)) fail('bad SMILES in route ' + c.r1.id);
  }
  // every reaction must get a disconnection name
  for (const r of R.REACTIONS) if (!cutOf(r)) fail('no cut name for ' + r.id);
  // every molecule a route can show must have a real name, not a fallback
  const seen = new Set();
  for (const c of routes){ seen.add(c.start); seen.add(c.mid); seen.add(c.target); }
  for (const smi of seen) if (nameOf(R, smi) === 'this molecule') fail('unnamed molecule: ' + smi);

  const kinds = {};
  let tried = 0;
  for (let i = 0; i < 400; i++){
    const it = makeItem(api); tried++;
    if (!it){ fail('generator gave up at ' + i); break; }
    kinds[it.kind || 'bank'] = (kinds[it.kind || 'bank'] || 0) + 1;
    if (it.home !== HOME) fail('home is ' + it.home);
    if (!it.roots || !it.roots.length) fail('roots empty');
    if (!it.coach) fail('coach empty');
    if (!it.stem) fail('stem empty');
    if (!it.choices || it.choices.length < 4 || it.choices.length > 5) fail('choice count ' + (it.choices || []).length);
    const keys = it.choices.map(c => (c.smiles || '') + '|' + (c.text || ''));
    if (new Set(keys).size !== keys.length) fail('duplicate choices: ' + it.stem);
    if (!(it.correct >= 0 && it.correct < it.choices.length)) fail('bad correct index');
    for (const c of it.choices) if (c.smiles && !smilesOk(c.smiles)) fail('bad choice SMILES: ' + c.smiles);
    if (it.sub && !smilesOk(it.sub)) fail('bad sub SMILES');
    if (it.prod && !smilesOk(it.prod)) fail('bad prod SMILES');
  }
  const a1 = tinyApi(deps, 7), a2 = tinyApi(deps, 7);
  if (JSON.stringify(makeItem(a1)) !== JSON.stringify(makeItem(a2))) fail('not deterministic');
  if (Object.keys(kinds).length < 4) fail('only ' + Object.keys(kinds).length + ' item kinds');
  return { ok: !notes.length, tried, notes: notes.length ? notes.slice(0, 4).join('; ') : routes.length + ' real two step routes, every leg in the table, ' + Object.keys(kinds).length + ' item kinds' };
}

/* ------------------------------------------------------------------ */
/* The visual: the retro tree                                           */
/* ------------------------------------------------------------------ */
const CSS = `
.t6r-panel{background:rgba(255,255,255,.02);border:1px solid var(--line);border-radius:12px;padding:14px}
.t6r-h{font-family:var(--mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink3);display:block;margin-bottom:8px}
.t6r-track{display:flex;gap:8px;align-items:stretch;overflow-x:auto;padding-bottom:8px;flex-direction:row-reverse;justify-content:flex-end}
.t6r-node{flex:0 0 auto;width:190px;background:rgba(255,255,255,.02);border:1px solid var(--line);border-radius:10px;padding:8px;position:relative}
.t6r-node.target{border-color:var(--gold)}
.t6r-node.start{border-color:rgba(87,180,135,.6)}
.t6r-node .nm{font-family:var(--mono);font-size:10px;letter-spacing:.06em;color:var(--ink3);display:block;margin-bottom:4px;min-height:2.2em}
.t6r-node .rg{font-family:var(--mono);font-size:10px;color:var(--goldhi);display:block;margin-top:4px;min-height:2.2em}
.t6r-row{display:flex;gap:6px;flex-wrap:wrap;margin:10px 0 0}
.t6r-note{font-size:15px;color:var(--ink2);line-height:1.55;margin-top:10px;min-height:3em}
.t6r-note b{display:block;font-family:var(--serif);font-weight:400;font-size:17px;color:var(--goldhi);margin-bottom:2px}
.t6r-badge{display:inline-block;font-family:var(--mono);font-size:10px;letter-spacing:.08em;padding:3px 9px;border-radius:999px;border:1px solid var(--gold);color:var(--goldhi);margin-top:6px}
`;
function injectStyle(id, css){ if (typeof document === 'undefined' || document.getElementById(id)) return; const s = document.createElement('style'); s.id = id; s.textContent = css; document.head.append(s); }

export function mount(slots, api){
  const { el } = api;
  injectStyle('t6r-style', CSS);
  const R = api.reactions;

  // targets worth cutting: products that at least one route reaches
  const routes = twoStepRoutes(R);
  const targets = [];
  for (const c of routes) if (targets.indexOf(c.target) < 0) targets.push(c.target);

  let target = targets[0];
  let chain = [];        // [{ smi, viaReaction }] from the target backward
  const panel = el('div', { class: 't6r-panel' });
  const track = el('div', { class: 't6r-track' });
  const opts = el('div', { class: 't6r-row' });
  const note = el('div', { class: 't6r-note' });
  const tRow = el('div', { class: 't6r-row' });
  panel.append(el('span', { class: 't6r-h', text: 'The target is on the right. Cut backward until you reach something you were handed.' }), track, opts, note, el('span', { class: 't6r-h', text: 'Another target' }), tRow);
  slots.visual.append(panel);

  function reset(t){ target = t; chain = [{ smi: t, via: null }]; draw(); }

  function draw(){
    track.textContent = '';
    chain.forEach((n, i) => {
      const node = el('div', { class: 't6r-node' + (i === 0 ? ' target' : '') + (isStart(R, n.smi) ? ' start' : '') });
      node.append(el('span', { class: 'nm', text: i === 0 ? 'TARGET: ' + nameOf(R, n.smi) : (isStart(R, n.smi) ? 'YOU ARE HANDED THIS: ' + nameOf(R, n.smi) : nameOf(R, n.smi)) }));
      const holder = el('div', {}); api.drawSmiles(holder, n.smi, { width: 170, height: 105, label: nameOf(R, n.smi) });
      node.append(holder);
      node.append(el('span', { class: 'rg', text: n.via ? label(n.via) : '' }));
      track.append(node);
    });
    const last = chain[chain.length - 1];
    opts.textContent = '';
    note.textContent = '';
    if (isStart(R, last.smi)){
      note.append(el('b', { text: 'Done. Read your cuts backward and that is the synthesis.' }));
      const fwd = chain.slice().reverse().filter(n => n.via).map(n => label(n.via)).join(', then ');
      note.append(nameOf(R, last.smi) + ', then ' + fwd + '.');
      opts.append(el('button', { type: 'button', class: 'secondary', text: 'Start over', onclick: () => reset(target) }));
      return;
    }
    const cands = madeBy(R, last.smi);
    if (!cands.length){
      note.append(el('b', { text: 'Nothing in the table makes this one.' }), 'That is a fine place to stop: it means this is where you would need a reaction outside the map, or a different cut higher up.');
      opts.append(el('button', { type: 'button', class: 'secondary', text: 'Start over', onclick: () => reset(target) }));
      return;
    }
    note.append(el('b', { text: 'What made ' + nameOf(R, last.smi) + '?' }), 'Each button is a real reaction from the map whose product is this molecule. Pick one and you will be standing on what it started from.');
    for (const r of cands){
      opts.append(el('button', { type: 'button', class: 'chip', text: label(r), onclick: () => {
        chain[chain.length - 1].via = r;
        chain.push({ smi: r.sub, via: null });
        draw();
        note.textContent = '';
        note.append(el('b', { text: cutOf(r).name.charAt(0).toUpperCase() + cutOf(r).name.slice(1) }), cutOf(r).why + ' Forward that is ' + r.name.toLowerCase() + '. ' + r.thomas);
        note.append(el('span', { class: 't6r-badge', text: 'NOW STANDING ON: ' + nameOf(R, r.sub).toUpperCase() }));
      } }));
    }
    if (chain.length > 1) opts.append(el('button', { type: 'button', class: 'secondary', text: 'Undo the last cut', onclick: () => { chain.pop(); chain[chain.length - 1].via = null; draw(); } }));
  }

  for (const t of targets.slice(0, 10)) tRow.append(el('button', { type: 'button', class: 'chip', text: nameOf(R, t), onclick: () => reset(t) }));
  reset(targets[0]);

  /* ---- you try ---- */
  let item = null, picked = -1, done = false, first = true;
  const box = el('div', { class: 'item' });
  slots.try.append(box);
  function render(){
    box.textContent = '';
    box.append(el('p', { class: 'prompt', text: item.stem }));
    if (item.sub || item.prod){
      const fig = el('div', { class: 'rxn', style: { marginBottom: '12px' } });
      if (item.sub){ const b = el('div', { class: 'box' }); api.drawSmiles(b, item.sub, { width: 210, height: 130 }); fig.append(b); }
      else fig.append(el('div', { class: 'box q', text: '?' }));
      fig.append(el('div', { class: 'arrow' }, el('span', { class: 'reagent', text: item.reagent || '' }), el('div', { class: 'line' })));
      if (item.prod){ const b = el('div', { class: 'box' }); api.drawSmiles(b, item.prod, { width: 210, height: 130 }); fig.append(b); }
      else fig.append(el('div', { class: 'box q', text: '?' }));
      box.append(fig);
    }
    const o = el('div', { class: 'opts' });
    item.choices.forEach((c, i) => {
      const b = el('button', { type: 'button', class: 'opt' + (picked === i ? ' picked' : '') + (done && i === item.correct ? ' ok' : ''), disabled: done ? '' : null, onclick: () => { picked = i; commit(); } }, el('span', { class: 'k', text: 'ABCDE'[i] }));
      if (c.smiles){ const h = el('span', {}); api.drawSmiles(h, c.smiles, { width: 190, height: 115 }); b.append(h); }
      else b.append(el('span', { text: c.text }));
      o.append(b);
    });
    box.append(o);
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
