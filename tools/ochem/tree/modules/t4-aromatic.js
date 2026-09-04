// The Tree of Organic, Level 4, module 8: The ring that refuses.
// Electrophilic aromatic substitution, directing effects, side chains, and Huckel. No imports (contract).

export const meta = {
  id: 't4-aromatic',
  level: 4,
  order: 8,
  needs3D: false,
  title: 'The ring that refuses',
  concept: 'Aromatic rings and EAS',
  tagline: 'The ring attacks, then gives the proton back to stay aromatic. Substitution, never addition.',
  story: 'Benzene refuses to add. The ring attacks an electrophile, sure, but then it gives a proton back so it can be aromatic again: substitution, never addition. Five reagents knock on the door: Br2 with FeBr3, HNO3 with H2SO4, SO3 with H2SO4, and the two Friedel-Crafts. Alkylation runs through a carbocation, so it rearranges and over-alkylates; acylation does not. Then the party rules. LPOP plus R groups, lone pair oxygen and nitrogen plus alkyl, are the hype men: they activate and send the newcomer ortho and para. Withdrawers like nitro and a ring carbonyl drain the party: slower, and meta. Halogens are the oddball, ortho/para directors but deactivators. Say it three times. Nitrate then reduce puts on an NH2, and the diazonium turns that NH2 into almost anything. Rule of thumb: the ring attacks, then gives the proton back.',
  moveName: 'Read the group on the ring, then place the newcomer',
  move: [
    'See a ring plus an electrophile: the ring attacks, the arenium ion forms, a proton leaves. Substitution, and the ring stays aromatic.',
    'Read the group already on the ring: LPOP plus R directs ortho/para and activates; a withdrawer directs meta and deactivates; a halogen directs ortho/para but deactivates.',
    'Place the newcomer, para shown when both are allowed, and check the rate: a strongly deactivated ring says no to Friedel-Crafts.',
    'Side chains are a different door: NBS with light goes benzylic, and hot KMnO4 burns any side chain with a benzylic H down to COOH.'
  ],
  trap: 'Careful: Halogens direct ortho/para but deactivate the ring, and neither Friedel-Crafts reaction works on a strongly deactivated ring like nitrobenzene.',
  holdsUp: ['Every EAS product', 'Directing on a substituted ring', 'Friedel-Crafts limits', 'Aniline and diazonium routes', 'Huckel calls on any ring', 'Side-chain oxidation and bromination'],
  drill: 'Booster OChem: Aromaticity & Benzene Reactions'
};

// Every SMILES this module draws that is not in shared/reactions.js: the Huckel gallery.
export const SMILES = ['[CH-]1C=CC=C1', 'C1=CC=C1', 'C1=CC=CC=CC=C1', 'c1ccncc1', 'c1cc[nH]c1', '[CH+]1C=CC=CC=C1', 'C1=CC=CC1', '[CH+]1C=CC=C1', 'C1=CC=CCC1'];

/* ------------------------------------------------------------------ */
/* Tiny SMILES graph, node-safe: enough to read where two groups sit    */
/* on a benzene ring, so the directing map is checked against the       */
/* verified products instead of trusted.                                */
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
// 'ortho' | 'meta' | 'para' for a benzene ring carrying exactly two groups, else null
export function ringRelation(smi){
  const g = parseSmiles(smi);
  const ring = g.atoms.map((a, i) => a.arom ? i : -1).filter(i => i >= 0);
  if (ring.length !== 6) return null;
  const inRing = new Set(ring);
  const subs = ring.filter(i => neighbors(g, i).some(x => !inRing.has(x.j)));
  if (subs.length !== 2) return null;
  // walk the ring from subs[0] to subs[1]
  let steps = 0, cur = subs[0], from = -1;
  while (cur !== subs[1] && steps < 6){ const nxt = neighbors(g, cur).map(x => x.j).filter(j => inRing.has(j) && j !== from); from = cur; cur = nxt[0]; steps++; }
  const d = Math.min(steps, 6 - steps);
  return d === 1 ? 'ortho' : d === 2 ? 'meta' : d === 3 ? 'para' : null;
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
/* Module data                                                          */
/* ------------------------------------------------------------------ */
// the substituent classes; dir 'op' or 'm'; rate 'activated' or 'deactivated'
const RINGS = {
  benzene: { group: 'H', klass: 'no group yet', dir: 'none', rate: 'reference', why: 'All six positions are the same. The first group you put on decides where the second one goes.' },
  toluene: { group: 'CH3', klass: 'R group', dir: 'op', rate: 'activated', why: 'Alkyl is a mild hype man: pushes a little density in, ortho/para, a bit faster than benzene.' },
  anisole: { group: 'OCH3', klass: 'lone pair oxygen', dir: 'op', rate: 'activated', why: 'LPOP: the oxygen lone pair donates by resonance, so ortho and para are rich and the ring is fast.' },
  aniline: { group: 'NH2', klass: 'lone pair nitrogen', dir: 'op', rate: 'activated', why: 'LPOP: the nitrogen lone pair donates by resonance. Strongly activated, ortho/para.' },
  nitrobenzene: { group: 'NO2', klass: 'withdrawer', dir: 'm', rate: 'deactivated', why: 'Nitro drains the party: ortho and para go poor, so the newcomer is shoved to meta, and slowly.' },
  chlorobenzene: { group: 'Cl', klass: 'halogen, the oddball', dir: 'op', rate: 'deactivated', why: 'The lone pair still directs ortho/para by resonance, but electronegativity vacuums density out by induction, so the ring is deactivated.' }
};
// more rings for the activator-or-deactivator item, all drawn from products in the table
const EXTRA = [
  { name: 'acetophenone', smi: 'CC(=O)c1ccccc1', group: 'COCH3', klass: 'withdrawer', dir: 'm', rate: 'deactivated', why: 'A carbonyl on the ring pulls density out: meta, slower.' },
  { name: 'benzoic acid', smi: 'OC(=O)c1ccccc1', group: 'COOH', klass: 'withdrawer', dir: 'm', rate: 'deactivated', why: 'COOH is a withdrawer: meta director, deactivated.' },
  { name: 'benzenesulfonic acid', smi: 'OS(=O)(=O)c1ccccc1', group: 'SO3H', klass: 'withdrawer', dir: 'm', rate: 'deactivated', why: 'The sulfonic acid group withdraws: meta, deactivated, and it can be taken back off.' },
  { name: 'bromobenzene', smi: 'Brc1ccccc1', group: 'Br', klass: 'halogen, the oddball', dir: 'op', rate: 'deactivated', why: 'Same oddball story as chlorine: ortho/para by resonance, deactivated by induction.' },
  { name: 'isopropylbenzene', smi: 'CC(C)c1ccccc1', group: 'CH(CH3)2', klass: 'R group', dir: 'op', rate: 'activated', why: 'An alkyl group is a mild activator, ortho/para.' }
];
// the electrophiles that knock on the door, keyed to the benzene reactions in the table
const EAS = [
  { id: 'eas_br', group: 'Br', fc: false },
  { id: 'eas_no2', group: 'NO2', fc: false },
  { id: 'eas_so3', group: 'SO3H', fc: false },
  { id: 'eas_fc_acyl', group: 'acyl group', fc: true },
  { id: 'eas_fc_alkyl', group: 'alkyl group', fc: true }
];
// the Huckel gallery. Every ring is cyclic; planar and conj are the doors; pi is the count in the ring
export const AROM = [
  { name: 'benzene', smi: 'c1ccccc1', pi: 6, planar: true, conj: true, charge: 0, note: 'three C=C, six electrons, the n equals 1 number' },
  { name: 'cyclopentadienyl anion', smi: '[CH-]1C=CC=C1', pi: 6, planar: true, conj: true, charge: -1, note: 'two C=C give 4, the lone pair sits in a p orbital and adds 2' },
  { name: 'cyclobutadiene', smi: 'C1=CC=C1', pi: 4, planar: true, conj: true, charge: 0, note: 'planar and 4n: actively destabilized' },
  { name: 'cyclooctatetraene', smi: 'C1=CC=CC=CC=C1', pi: 8, planar: false, conj: true, charge: 0, note: 'eight electrons would be antiaromatic flat, so it folds into a tub like a Pringle and is simply non-aromatic' },
  { name: 'pyridine', smi: 'c1ccncc1', pi: 6, planar: true, conj: true, charge: 0, note: 'the N lone pair points outward and is not counted; six from the ring' },
  { name: 'pyrrole', smi: 'c1cc[nH]c1', pi: 6, planar: true, conj: true, charge: 0, note: 'two C=C give 4, the N lone pair sits in a p orbital and adds 2' },
  { name: 'tropylium cation', smi: '[CH+]1C=CC=CC=C1', pi: 6, planar: true, conj: true, charge: 1, note: 'the empty p orbital completes the circuit, six electrons, aromatic even when charged' },
  { name: 'cyclopentadiene', smi: 'C1=CC=CC1', pi: 4, planar: true, conj: false, charge: 0, note: 'one sp3 CH2 is a dead socket, so the circuit is broken' },
  { name: 'cyclopentadienyl cation', smi: '[CH+]1C=CC=C1', pi: 4, planar: true, conj: true, charge: 1, note: 'planar, conjugated, four electrons: antiaromatic' },
  { name: '1,3-cyclohexadiene', smi: 'C1=CC=CCC1', pi: 4, planar: false, conj: false, charge: 0, note: 'two sp3 carbons break the circuit: an ordinary diene' }
];
export function verdict(ring){ if (!ring.conj) return 'non-aromatic'; if (!ring.planar) return 'non-aromatic'; return ring.pi % 4 === 2 ? 'aromatic' : 'antiaromatic'; }
const DOORS = [
  { k: 'cyclic', q: 'Cyclic?', test: () => true },
  { k: 'conj', q: 'Fully conjugated? Every ring atom brings a p orbital.', test: r => r.conj },
  { k: 'planar', q: 'Planar?', test: r => r.planar },
  { k: 'huckel', q: 'Huckel count: 4n plus 2 pi electrons?', test: r => r.pi % 4 === 2 }
];
function label(r){ return [r.reagent, r.cond].filter(Boolean).join(', '); }
function subName(R, r){ return R.SUBSTRATES[r.subClass].name; }
function cap(s){ return s.charAt(0).toUpperCase() + s.slice(1); }
function allRings(R){
  return Object.keys(RINGS).filter(k => k !== 'benzene').map(k => Object.assign({ name: R.SUBSTRATES[k].name, smi: R.SUBSTRATES[k].smi, key: k }, RINGS[k])).concat(EXTRA);
}
// where the newcomer lands on a substituted ring with a given electrophile
function landing(ring, e){
  if (e.fc && ring.rate === 'deactivated' && ring.dir === 'm') return 'none';
  return ring.dir;
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
    rest.sort((a, b) => ((b.reagent === r.reagent ? 2 : 0) + (b.subClass === r.subClass ? 1 : 0)) - ((a.reagent === r.reagent ? 2 : 0) + (a.subClass === r.subClass ? 1 : 0)));
    rest.forEach(add);
  }
  return out.slice(0, 3);
}
function finish(api, stem, correctChoice, otherChoices, extra){
  const choices = api.shuffle([correctChoice, ...otherChoices]);
  return Object.assign({ stem: cap(stem), sub: null, reagent: null, prod: null, choices, correct: choices.indexOf(correctChoice), home: meta.id, roots: ['l2-resonance', 'l2-arrows'], source: 'generated' }, extra);
}
function genProduct(api){
  const R = api.reactions, pool = R.byFamily('aromatic');
  const subst = pool.filter(r => r.subClass !== 'benzene');
  const r = api.rng() < 0.7 ? api.pick(subst) : api.pick(pool);
  const others = productDistractors(api, r, pool).map(x => ({ text: '', smiles: x.prod }));
  return finish(api, subName(R, r) + ' is treated with ' + label(r) + '. What is the major organic product?', { text: '', smiles: r.prod }, others, { sub: r.sub, reagent: label(r), coach: r.thomas, roots: r.roots, view: 'rxn', kind: 'product' });
}
const WHERE = [
  { k: 'op', text: 'ortho and para (para shown as major)' },
  { k: 'm', text: 'meta' },
  { k: 'none', text: 'no reaction: the ring is too deactivated for this one' },
  { k: 'side', text: 'on the substituent, not the ring' }
];
function genWhere(api){
  const R = api.reactions;
  const key = api.pick(['toluene', 'anisole', 'nitrobenzene', 'chlorobenzene']);
  const ring = Object.assign({ name: R.SUBSTRATES[key].name, smi: R.SUBSTRATES[key].smi }, RINGS[key]);
  const e = api.pick(EAS), er = R.find(e.id);
  const land = landing(ring, e);
  const correct = WHERE.find(w => w.k === land);
  const choices = WHERE.map(w => ({ text: w.text, smiles: null }));
  const c = choices[WHERE.indexOf(correct)];
  const coach = land === 'none' ? 'Friedel-Crafts needs a ring with electrons to give. Nitrobenzene is drained, so the electrophile finds nothing to attack.' : ring.why;
  return finish(api, ring.name + ' meets ' + label(er) + '. Where does the new ' + e.group + ' go?', c, choices.filter(x => x !== c), { sub: ring.smi, reagent: label(er), coach, roots: ['l2-resonance', 'l2-induction'], view: 'rxn', kind: 'where' });
}
const RATE = [
  { k: 'op-activated', text: 'activator, ortho/para director' },
  { k: 'm-deactivated', text: 'deactivator, meta director' },
  { k: 'op-deactivated', text: 'deactivator, but still an ortho/para director' },
  { k: 'm-activated', text: 'activator, meta director' }
];
function genRate(api){
  const R = api.reactions;
  const ring = api.pick(allRings(R));
  const k = ring.dir + '-' + ring.rate;
  const correct = RATE.find(x => x.k === k);
  const choices = RATE.map(x => ({ text: x.text, smiles: null }));
  const c = choices[RATE.indexOf(correct)];
  return finish(api, 'The ' + ring.group + ' group on ' + ring.name + ' is what kind of group?', c, choices.filter(x => x !== c), { sub: ring.smi, coach: ring.why, roots: ['l2-resonance', 'l2-induction'], view: 'mol', kind: 'rate' });
}
const VERDICTS = ['aromatic', 'antiaromatic', 'non-aromatic'];
function genArom(api){
  if (api.rng() < 0.5){
    const ring = api.pick(AROM), v = verdict(ring);
    const correct = { text: v + ', ' + ring.pi + ' pi electrons', smiles: null };
    const cands = [];
    for (const w of VERDICTS) for (const p of [ring.pi - 2, ring.pi, ring.pi + 2]){ if (p <= 0) continue; const t = w + ', ' + p + ' pi electrons'; if (t !== correct.text) cands.push(t); }
    const others = api.shuffle(cands).slice(0, 3).map(t => ({ text: t, smiles: null }));
    const rule = v === 'aromatic' ? ' Cyclic, planar, fully conjugated, 4n plus 2: aromatic.' : v === 'antiaromatic' ? ' Planar and conjugated with 4n electrons is antiaromatic, worse than nothing.' : ' Fail any of cyclic, planar, or fully conjugated and it is simply non-aromatic.';
    return finish(api, 'Run the four doors on ' + ring.name + '. What is the call?', correct, others, { sub: ring.smi, coach: cap(ring.note) + '.' + rule, roots: ['l1-unsat', 'l2-resonance', 'l1-geometry'], view: 'mol', kind: 'arom' });
  }
  const target = api.pick(['aromatic', 'antiaromatic']);
  const yes = AROM.filter(r => verdict(r) === target), no = AROM.filter(r => verdict(r) !== target);
  const ring = api.pick(yes);
  const others = api.shuffle(no).slice(0, 3).map(r => ({ text: r.name, smiles: r.smi }));
  const coach = target === 'aromatic' ? cap(ring.note) + '. Count the pi electrons in the ring and check 4n plus 2, then make sure every ring atom brings a p orbital.'
    : cap(ring.note) + '. Antiaromatic needs all four doors open except the count: planar, conjugated, and 4n electrons.';
  return finish(api, 'Which of these is ' + target + '?', { text: ring.name, smiles: ring.smi }, others, { coach, roots: ['l1-unsat', 'l2-resonance', 'l1-geometry'], view: 'none', kind: 'arom' });
}
function genItem(api){
  const x = api.rng();
  if (x < 0.3) return genProduct(api);
  if (x < 0.55) return genWhere(api);
  if (x < 0.75) return genRate(api);
  return genArom(api);
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
    // the directing map agrees with every verified product on a substituted ring
    const checks = { eas_anisole_no2: 'anisole', eas_nitrobenzene_no2: 'nitrobenzene', eas_chlorobenzene_br: 'chlorobenzene', toluene_br: 'toluene' };
    for (const [id, key] of Object.entries(checks)){
      const rel = ringRelation(R.find(id).prod);
      const want = RINGS[key].dir === 'm' ? ['meta'] : ['ortho', 'para'];
      if (!want.includes(rel)) throw new Error(id + ': product is ' + rel + ' but the map says ' + RINGS[key].dir);
    }
    if (ringRelation(R.SUBSTRATES.toluene.smi) !== null) throw new Error('one group should give no relation');
    // the Huckel gallery: every SMILES sane, verdicts as taught
    for (const r of AROM) if (!smilesSane(r.smi)) throw new Error('bad SMILES ' + r.smi);
    const want = { benzene: 'aromatic', 'cyclopentadienyl anion': 'aromatic', cyclobutadiene: 'antiaromatic', cyclooctatetraene: 'non-aromatic', pyridine: 'aromatic', pyrrole: 'aromatic', 'tropylium cation': 'aromatic', cyclopentadiene: 'non-aromatic', 'cyclopentadienyl cation': 'antiaromatic', '1,3-cyclohexadiene': 'non-aromatic' };
    for (const r of AROM) if (verdict(r) !== want[r.name]) throw new Error(r.name + ' verdict ' + verdict(r));
    for (const s of SMILES) if (!smilesSane(s)) throw new Error('bad SMILES ' + s);
    for (const x of EXTRA) if (parseSmiles(x.smi).atoms.filter(a => a.arom).length !== 6) throw new Error(x.name + ' is not a benzene ring');
    const api = tinyApi(deps, 53);
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
    const a = makeItem(tinyApi(deps, 13)), b = makeItem(tinyApi(deps, 13));
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
function chargeMark(api, box, sign, color){
  box.style.position = 'relative';
  box.append(api.el('span', { 'aria-hidden': 'true', style: { position: 'absolute', top: '8px', right: '8px', width: '22px', height: '22px', borderRadius: '50%', border: '2px solid ' + color, color, display: 'grid', placeItems: 'center', fontFamily: 'ui-monospace, Menlo, monospace', fontSize: '15px', lineHeight: '1', fontWeight: '700' }, text: sign }));
}
function molBox(api, smi, caption, o){
  const { el } = api, C = api.colors;
  const box = el('div', { class: 'box' });
  drawMol(api, box, smi, caption, (o && o.max) || '240px');
  if (caption) box.append(el('div', { style: { textAlign: 'center', fontFamily: 'Georgia, serif', fontSize: '14px', color: C.ink2, marginTop: '2px' }, text: caption }));
  if (/\[C[H\d]*-\]/.test(smi)) chargeMark(api, box, '-', C.blue);
  if (/\[C[H\d]*\+\]/.test(smi)) chargeMark(api, box, '+', C.coral);
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
// the directing map: a schematic hexagon with the group on top and the six positions as lamps
function directingMap(api, ring){
  const { svg } = api, C = api.colors;
  const W = 260, H = 250, cx = 130, cy = 135, Rr = 68;
  const root = svg('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': 'Directing map for ' + ring.name + ': ' + (ring.dir === 'op' ? 'ortho and para lit' : ring.dir === 'm' ? 'meta lit' : 'all positions equal') });
  const pts = [];
  for (let k = 0; k < 6; k++){ const t = (-90 + 60 * k) * Math.PI / 180; pts.push({ x: cx + Rr * Math.cos(t), y: cy + Rr * Math.sin(t) }); }
  root.append(svg('polygon', { points: pts.map(p => p.x.toFixed(1) + ',' + p.y.toFixed(1)).join(' '), fill: 'none', stroke: C.ink2, 'stroke-width': '2' }));
  root.append(svg('circle', { cx, cy, r: Rr * 0.62, fill: 'none', stroke: C.ink3, 'stroke-width': '1.5' }));
  // the group on top
  root.append(svg('line', { x1: pts[0].x, y1: pts[0].y, x2: pts[0].x, y2: pts[0].y - 34, stroke: C.ink2, 'stroke-width': '2' }));
  root.append(svg('text', { x: pts[0].x, y: pts[0].y - 42, 'text-anchor': 'middle', 'font-family': 'Georgia, serif', 'font-size': '18', fill: ring.rate === 'activated' ? C.blue : ring.rate === 'deactivated' ? C.coral : C.ink, text: ring.group }));
  const names = ['', 'o', 'm', 'p', 'm', 'o'];
  const lit = k => ring.dir === 'op' ? (k === 1 || k === 5 || k === 3) : ring.dir === 'm' ? (k === 2 || k === 4) : k > 0;
  const lamps = [];
  for (let k = 1; k < 6; k++){
    const p = pts[k], on = lit(k), color = ring.dir === 'none' ? C.grey : C.gold;
    const g = svg('g', { opacity: on ? '0' : '1' });
    g.append(svg('circle', { cx: p.x, cy: p.y, r: on ? 13 : 9, fill: on ? color : C.panel, stroke: on ? color : C.line, 'stroke-width': '2', style: on ? { filter: 'drop-shadow(0 0 6px ' + color + ')' } : {} }));
    g.append(svg('text', { x: p.x, y: p.y + 5, 'text-anchor': 'middle', 'font-family': 'ui-monospace, Menlo, monospace', 'font-size': '13', 'font-weight': '700', fill: on ? '#1a160c' : C.ink3, text: names[k] }));
    root.append(g); if (on) lamps.push(g);
  }
  root.append(svg('text', { x: cx, y: H - 8, 'text-anchor': 'middle', 'font-family': 'ui-monospace, Menlo, monospace', 'font-size': '11', 'letter-spacing': '.12em', fill: C.ink3, text: ring.dir === 'op' ? 'ORTHO AND PARA LIT' : ring.dir === 'm' ? 'META LIT' : 'ALL SIX ARE THE SAME' }));
  lamps.forEach((g, i) => { if (api.reduced){ g.setAttribute('opacity', '1'); return; } g.style.transition = 'opacity .4s ease ' + (150 + i * 160) + 'ms'; requestAnimationFrame(() => requestAnimationFrame(() => { g.style.opacity = '1'; })); });
  return root;
}

export function mount(slots, api){
  const { el } = api, C = api.colors, R = api.reactions;
  const fam = R.byFamily('aromatic');
  const RING_KEYS = ['benzene', 'toluene', 'anisole', 'nitrobenzene', 'chlorobenzene', 'aniline'];

  /* ---------- VISUAL 1: the ring board ---------- */
  let ringKey = 'toluene', picked = R.find('toluene_br');
  const ringChips = el('div', { class: 'controls', role: 'group', 'aria-label': 'Pick the ring' });
  const rxChips = el('div', { class: 'controls', role: 'group', 'aria-label': 'Pick a reaction' });
  const board = el('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'flex-start', marginTop: '12px' } });
  const mapWrap = el('div', { style: { flex: '0 0 230px', maxWidth: '100%' } });
  const right = el('div', { style: { flex: '1 1 440px', minWidth: '0' } });
  const stage = el('div', {});
  const badges = el('div', { class: 'controls', style: { gap: '6px' } });
  const caption = el('p', { style: { margin: '10px 0 0', color: C.ink2, fontSize: '15px', minHeight: '3em' } });

  function renderRings(){
    ringChips.replaceChildren(el('span', { class: 'eyebrow', text: 'Ring' }));
    for (const k of RING_KEYS) ringChips.append(el('button', { type: 'button', class: 'chip', 'aria-pressed': k === ringKey ? 'true' : 'false', text: R.SUBSTRATES[k].name, onClick: () => { ringKey = k; picked = fam.find(r => r.subClass === k) || null; renderRings(); renderRx(); renderBoard(); } }));
  }
  function renderRx(){
    rxChips.replaceChildren(el('span', { class: 'eyebrow', text: 'Reaction' }));
    for (const r of fam.filter(x => x.subClass === ringKey)) rxChips.append(el('button', { type: 'button', class: 'chip', 'aria-pressed': picked === r ? 'true' : 'false', text: r.reagent, title: r.name, onClick: () => { picked = r; renderRx(); renderBoard(); } }));
  }
  function renderBoard(){
    const ring = Object.assign({ name: R.SUBSTRATES[ringKey].name, smi: R.SUBSTRATES[ringKey].smi }, RINGS[ringKey]);
    mapWrap.replaceChildren(el('div', { class: 'eyebrow', style: { marginBottom: '4px' }, text: 'Directing map' }), directingMap(api, ring));
    const rate = ring.rate === 'activated' ? badge(api, 'activated: faster than benzene', C.green) : ring.rate === 'deactivated' ? badge(api, 'deactivated: slower than benzene', C.coral) : badge(api, 'benzene: the reference rate', C.grey);
    mapWrap.append(el('div', { style: { textAlign: 'center', marginTop: '4px' } }, rate), el('p', { style: { fontSize: '13px', color: C.ink2, margin: '8px 0 0' }, text: ring.klass + '. ' + ring.why }));
    stage.replaceChildren(); badges.replaceChildren();
    const row = el('div', { class: 'rxn' });
    row.append(molBox(api, ring.smi, ring.name));
    if (!picked){ row.append(arrowEl(api, '?', ''), el('div', { class: 'box q', text: '?' })); stage.append(row); caption.textContent = 'Pick a reaction.'; return; }
    const r = picked, arrow = arrowEl(api, r.reagent, r.cond), prod = molBox(api, r.prod, r.name);
    row.append(arrow, prod); stage.append(row);
    reveal(api, arrow, 0); reveal(api, prod, 250);
    const rel = ringRelation(r.prod);
    const list = [badge(api, r.mech, C.ink2)];
    if (rel) list.push(badge(api, 'newcomer lands ' + rel + (rel === 'para' && ring.dir === 'op' ? ' (ortho is the minor twin)' : ''), C.gold));
    if (/radical/.test(r.mech)) list.push(badge(api, 'side chain, not the ring', C.blue));
    if (/oxidation/.test(r.mech)) list.push(badge(api, 'side chain burned to COOH, ring survives', C.blue));
    if (/diazonium/.test(r.mech)) list.push(badge(api, 'the universal adapter', C.amber));
    if (/reduction/.test(r.mech) && !/diazonium/.test(r.mech)) list.push(badge(api, 'meta director becomes ortho/para director', C.amber));
    list.forEach((b, i) => { badges.append(b); reveal(api, b, 450 + i * 120); });
    caption.textContent = r.thomas + ' ' + r.trap;
  }
  right.append(stage, badges, caption);
  board.append(mapWrap, right);
  slots.visual.append(ringChips, rxChips, board);
  renderRings(); renderRx(); renderBoard();

  /* ---------- VISUAL 2: the Huckel counter ---------- */
  let aromIdx = 3, aromTimers = [];
  const aromChips = el('div', { class: 'controls', role: 'group', 'aria-label': 'Pick a ring for the Huckel count', style: { marginTop: '18px' } });
  const aromCard = el('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'flex-start', marginTop: '10px' } });
  function renderAromChips(){
    aromChips.replaceChildren(el('span', { class: 'eyebrow', text: 'Huckel counter' }));
    AROM.forEach((r, i) => aromChips.append(el('button', { type: 'button', class: 'chip', 'aria-pressed': i === aromIdx ? 'true' : 'false', text: r.name, onClick: () => { aromIdx = i; renderAromChips(); renderArom(); } })));
  }
  function renderArom(){
    aromTimers.forEach(clearTimeout); aromTimers = [];
    aromCard.replaceChildren();
    const ring = AROM[aromIdx], v = verdict(ring);
    const left = molBox(api, ring.smi, ring.name, { max: '200px' });
    left.style.flex = '0 0 230px'; left.style.maxWidth = '100%';
    const doors = el('div', { style: { flex: '1 1 320px', minWidth: '0', display: 'grid', gap: '6px' } });
    const n = (ring.pi - 2) / 4;
    doors.append(el('div', { style: { fontFamily: 'ui-monospace, Menlo, monospace', fontSize: '13px', color: C.ink2 }, text: 'pi electrons in the ring: ' + ring.pi + (ring.pi % 4 === 2 ? ' = 4(' + n + ') + 2' : ' = 4(' + ring.pi / 4 + '), a 4n number') }));
    const rows = DOORS.map(d => {
      const row = el('div', { style: { display: 'grid', gridTemplateColumns: '110px 1fr', gap: '10px', alignItems: 'center', padding: '8px 10px', borderRadius: '10px', border: '1px solid ' + C.line, opacity: '0.4' } });
      const tag = el('span', { style: { fontFamily: 'ui-monospace, Menlo, monospace', fontSize: '12px', letterSpacing: '.08em', textTransform: 'uppercase', color: C.ink3 }, text: 'door: ' + d.k });
      row.append(tag, el('span', { style: { fontSize: '14px', color: C.ink }, text: d.q }));
      doors.append(row);
      return { row, tag, d };
    });
    const verdictEl = el('div', { style: { fontFamily: 'Georgia, serif', fontSize: '20px', marginTop: '4px', opacity: '0' } });
    doors.append(verdictEl, el('p', { style: { margin: '2px 0 0', fontSize: '14px', color: C.ink2 }, text: cap(ring.note) + '.' }));
    aromCard.append(left, doors);
    let stopped = false;
    rows.forEach((x, i) => {
      const run = () => {
        if (stopped) { x.row.style.opacity = '0.25'; x.tag.textContent = 'not needed'; return; }
        const pass = x.d.test(ring);
        x.row.style.opacity = '1';
        x.row.style.borderColor = pass ? C.green : C.coral;
        x.tag.textContent = pass ? 'open' : 'closed';
        x.tag.style.color = pass ? C.green : C.coral;
        if (!pass && x.d.k !== 'huckel') stopped = true;
        if (i === rows.length - 1 || stopped){
          verdictEl.textContent = v === 'aromatic' ? 'Aromatic: a huge stability discount.' : v === 'antiaromatic' ? 'Antiaromatic: planar with 4n, actively destabilized.' : 'Non-aromatic: an ordinary ring, no discount and no penalty.';
          verdictEl.style.color = v === 'aromatic' ? C.green : v === 'antiaromatic' ? C.coral : C.ink2;
          verdictEl.style.transition = api.reduced ? '' : 'opacity .4s ease'; verdictEl.style.opacity = '1';
        }
      };
      if (api.reduced) run(); else aromTimers.push(setTimeout(run, 250 + i * 380));
    });
  }
  slots.visual.append(aromChips, aromCard);
  renderAromChips(); renderArom();

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
      const b = molBox(api, item.sub, null, { max: '240px' });
      b.style.maxWidth = '360px'; b.style.margin = '0 auto';
      tryBox.append(b);
    } else if (item.sub){
      const row = el('div', { class: 'rxn' });
      row.append(molBox(api, item.sub, null, { max: '220px' }));
      row.append(arrowEl(api, item.reagent || '?', ''));
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
