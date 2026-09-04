// The Roots of Organic, Level 2, Root 2: The couch.
// Resonance: a charge spread over more atoms is a couch lifted by more helpers. No imports (contract).

export const meta = {
  id: 'l2-resonance',
  level: 2,
  order: 2,
  needs3D: false,
  title: 'The couch',
  concept: 'Resonance',
  tagline: 'More helpers lifting the couch, more stable. That is the whole idea.',
  story: 'Picture a charge as a couch that has to be carried. One atom carrying it alone is miserable. Resonance is when the charge can spread over more atoms, and every atom that shares it is another helper lifting the couch. More helpers means more stable. There are rules for what can move, and this is a rule, not a vibe: only pi electrons and lone pairs move, never a sigma bond, and never an atom. A second-row atom never goes past eight electrons. When two drawings are both legal, the major one has full octets, the fewest charges, and any negative charge sitting on the most electronegative atom. Rule of thumb: count the atoms sharing the charge. That count is your stability.',
  moveName: 'Push only what can move, then count the helpers',
  move: [
    'Find the pi bond or lone pair next to the charge. Those are the only electrons allowed to move.',
    'Push them one step: lone pair to a bond, or pi bond onto the neighbor atom. Never touch a sigma bond.',
    'Check every second-row atom still has eight or fewer electrons. Carbon never gets five bonds.',
    'Count the atoms that end up carrying the charge. More helpers, more stable.',
    'Picking the major contributor? Full octets first, then fewest charges, then negative on the most electronegative atom.'
  ],
  trap: 'Careful: resonance never moves an atom and never breaks a sigma bond, so if your arrow moved a hydrogen or snapped a single bond, that is not resonance, that is a different molecule.',
  holdsUp: ['Carbocation stability', 'Acidity', 'EAS directing', 'Aromaticity', 'Amide rigidity'],
  drill: 'Booster OChem: The Fundamentals'
};


// ---------- molecule library ----------
// atoms: id, x, y, label ('' for a bare skeletal carbon). Coordinates live in a 300 by 210 frame.
// contributors: bonds [[a, b, order]], charges {id: '+' | '-'}, lp {id: [angles]}, arrows (how to reach the NEXT contributor).
function ring(cx, cy, R){
  const a = [];
  for (let k = 0; k < 6; k++){ const t = (k * 60) * Math.PI / 180; a.push({ id: 'C' + (k + 1), x: +(cx + R * Math.cos(t)).toFixed(1), y: +(cy - R * Math.sin(t)).toFixed(1), label: '' }); }
  return a;
}
const RING = [['C1', 'C2'], ['C2', 'C3'], ['C3', 'C4'], ['C4', 'C5'], ['C5', 'C6'], ['C6', 'C1']];
function ringBonds(doubles){ return RING.map(([a, b]) => [a, b, doubles.some(d => (d[0] === a && d[1] === b) || (d[0] === b && d[1] === a)) ? 2 : 1]); }

export const SYSTEMS = {
  allyl: {
    id: 'allyl', name: 'Allyl cation', sign: '+', helpersNote: 'the two end carbons share the plus',
    atoms: [{ id: 'C1', x: 60, y: 125, label: 'H2C' }, { id: 'C2', x: 130, y: 85, label: 'CH' }, { id: 'C3', x: 200, y: 125, label: 'CH2' }],
    contributors: [
      { bonds: [['C1', 'C2', 2], ['C2', 'C3', 1]], charges: { C3: '+' }, lp: {}, arrows: [{ from: 'bond:C1-C2', to: 'bond:C2-C3', bend: -1 }] },
      { bonds: [['C1', 'C2', 1], ['C2', 'C3', 2]], charges: { C1: '+' }, lp: {}, arrows: [{ from: 'bond:C2-C3', to: 'bond:C1-C2', bend: 1 }] }
    ]
  },
  allylAnion: {
    id: 'allylAnion', name: 'Allyl anion', sign: '-', helpersNote: 'the two end carbons share the minus',
    atoms: [{ id: 'C1', x: 60, y: 125, label: 'H2C' }, { id: 'C2', x: 130, y: 85, label: 'CH' }, { id: 'C3', x: 200, y: 125, label: 'CH2' }],
    contributors: [
      { bonds: [['C1', 'C2', 2], ['C2', 'C3', 1]], charges: { C3: '-' }, lp: { C3: [-40] }, arrows: [{ from: 'lp:C3', to: 'bond:C2-C3', bend: 1 }, { from: 'bond:C1-C2', to: 'atom:C1', bend: -1 }] },
      { bonds: [['C1', 'C2', 1], ['C2', 'C3', 2]], charges: { C1: '-' }, lp: { C1: [220] }, arrows: [{ from: 'lp:C1', to: 'bond:C1-C2', bend: -1 }, { from: 'bond:C2-C3', to: 'atom:C3', bend: 1 }] }
    ]
  },
  pentadienyl: {
    id: 'pentadienyl', name: 'Pentadienyl cation', sign: '+', helpersNote: 'carbons 1, 3 and 5 share the plus',
    atoms: [{ id: 'C1', x: 30, y: 130, label: 'H2C' }, { id: 'C2', x: 85, y: 90, label: 'CH' }, { id: 'C3', x: 140, y: 130, label: 'CH' }, { id: 'C4', x: 195, y: 90, label: 'CH' }, { id: 'C5', x: 250, y: 130, label: 'CH2' }],
    contributors: [
      { bonds: [['C1', 'C2', 2], ['C2', 'C3', 1], ['C3', 'C4', 2], ['C4', 'C5', 1]], charges: { C5: '+' }, lp: {}, arrows: [{ from: 'bond:C3-C4', to: 'bond:C4-C5', bend: -1 }] },
      { bonds: [['C1', 'C2', 2], ['C2', 'C3', 1], ['C3', 'C4', 1], ['C4', 'C5', 2]], charges: { C3: '+' }, lp: {}, arrows: [{ from: 'bond:C1-C2', to: 'bond:C2-C3', bend: -1 }] },
      { bonds: [['C1', 'C2', 1], ['C2', 'C3', 2], ['C3', 'C4', 1], ['C4', 'C5', 2]], charges: { C1: '+' }, lp: {}, arrows: [{ from: 'bond:C4-C5', to: 'bond:C3-C4', bend: 1 }, { from: 'bond:C2-C3', to: 'bond:C1-C2', bend: 1 }] }
    ]
  },
  acetate: {
    id: 'acetate', name: 'Acetate (carboxylate)', sign: '-', helpersNote: 'both oxygens share the minus',
    atoms: [{ id: 'Me', x: 60, y: 120, label: 'H3C' }, { id: 'C', x: 130, y: 120, label: 'C' }, { id: 'O1', x: 188, y: 78, label: 'O' }, { id: 'O2', x: 188, y: 162, label: 'O' }],
    contributors: [
      { bonds: [['Me', 'C', 1], ['C', 'O1', 2], ['C', 'O2', 1]], charges: { O2: '-' }, lp: { O1: [40, 110], O2: [-30, 30, 100] }, arrows: [{ from: 'lp:O2', to: 'bond:C-O2', bend: 1 }, { from: 'bond:C-O1', to: 'atom:O1', bend: -1 }] },
      { bonds: [['Me', 'C', 1], ['C', 'O1', 1], ['C', 'O2', 2]], charges: { O1: '-' }, lp: { O1: [-100, -30, 30], O2: [-110, -40] }, arrows: [{ from: 'lp:O1', to: 'bond:C-O1', bend: -1 }, { from: 'bond:C-O2', to: 'atom:O2', bend: 1 }] }
    ]
  },
  enolate: {
    id: 'enolate', name: 'Enolate', sign: '-', helpersNote: 'the oxygen and the end carbon share the minus',
    atoms: [{ id: 'C1', x: 60, y: 125, label: 'H2C' }, { id: 'C2', x: 130, y: 125, label: 'CH' }, { id: 'O', x: 190, y: 80, label: 'O' }],
    contributors: [
      { bonds: [['C1', 'C2', 2], ['C2', 'O', 1]], charges: { O: '-' }, lp: { O: [-40, 30, 100] }, arrows: [{ from: 'lp:O', to: 'bond:C2-O', bend: 1 }, { from: 'bond:C1-C2', to: 'atom:C1', bend: 1 }] },
      { bonds: [['C1', 'C2', 1], ['C2', 'O', 2]], charges: { C1: '-' }, lp: { O: [-30, 50], C1: [150] }, arrows: [{ from: 'lp:C1', to: 'bond:C1-C2', bend: 1 }, { from: 'bond:C2-O', to: 'atom:O', bend: -1 }] }
    ]
  },
  benzyl: {
    id: 'benzyl', name: 'Benzyl cation', sign: '+', helpersNote: 'the CH2 plus ortho, para and ortho share the plus',
    atoms: ring(110, 112, 48).concat([{ id: 'C7', x: 215, y: 112, label: 'CH2' }]),
    ringCenter: [110, 112],
    contributors: [
      { bonds: ringBonds([['C1', 'C2'], ['C3', 'C4'], ['C5', 'C6']]).concat([['C1', 'C7', 1]]), charges: { C7: '+' }, lp: {}, arrows: [{ from: 'bond:C1-C2', to: 'bond:C1-C7', bend: -1 }] },
      { bonds: ringBonds([['C3', 'C4'], ['C5', 'C6']]).concat([['C1', 'C7', 2]]), charges: { C2: '+' }, lp: {}, arrows: [{ from: 'bond:C3-C4', to: 'bond:C2-C3', bend: -1 }] },
      { bonds: ringBonds([['C2', 'C3'], ['C5', 'C6']]).concat([['C1', 'C7', 2]]), charges: { C4: '+' }, lp: {}, arrows: [{ from: 'bond:C5-C6', to: 'bond:C4-C5', bend: -1 }] },
      { bonds: ringBonds([['C2', 'C3'], ['C4', 'C5']]).concat([['C1', 'C7', 2]]), charges: { C6: '+' }, lp: {}, arrows: [{ from: 'bond:C1-C7', to: 'bond:C6-C1', bend: -1 }] },
      { bonds: ringBonds([['C2', 'C3'], ['C4', 'C5'], ['C6', 'C1']]).concat([['C1', 'C7', 1]]), charges: { C7: '+' }, lp: {}, arrows: [{ from: 'bond:C2-C3', to: 'bond:C1-C2', bend: -1 }, { from: 'bond:C4-C5', to: 'bond:C3-C4', bend: -1 }, { from: 'bond:C6-C1', to: 'bond:C5-C6', bend: -1 }] }
    ]
  },
  phenoxide: {
    id: 'phenoxide', name: 'Phenoxide', sign: '-', helpersNote: 'the oxygen plus ortho, para and ortho share the minus',
    atoms: ring(110, 112, 48).concat([{ id: 'O', x: 212, y: 112, label: 'O' }]),
    ringCenter: [110, 112],
    contributors: [
      { bonds: ringBonds([['C1', 'C2'], ['C3', 'C4'], ['C5', 'C6']]).concat([['C1', 'O', 1]]), charges: { O: '-' }, lp: { O: [-50, 0, 50] }, arrows: [{ from: 'lp:O', to: 'bond:C1-O', bend: -1 }, { from: 'bond:C1-C2', to: 'atom:C2', bend: 1 }] },
      { bonds: ringBonds([['C3', 'C4'], ['C5', 'C6']]).concat([['C1', 'O', 2]]), charges: { C2: '-' }, lp: { O: [-50, 50], C2: [60] }, arrows: [{ from: 'lp:C2', to: 'bond:C2-C3', bend: 1 }, { from: 'bond:C3-C4', to: 'atom:C4', bend: 1 }] },
      { bonds: ringBonds([['C2', 'C3'], ['C5', 'C6']]).concat([['C1', 'O', 2]]), charges: { C4: '-' }, lp: { O: [-50, 50], C4: [180] }, arrows: [{ from: 'lp:C4', to: 'bond:C4-C5', bend: 1 }, { from: 'bond:C5-C6', to: 'atom:C6', bend: 1 }] },
      { bonds: ringBonds([['C2', 'C3'], ['C4', 'C5']]).concat([['C1', 'O', 2]]), charges: { C6: '-' }, lp: { O: [-50, 50], C6: [300] }, arrows: [{ from: 'lp:C6', to: 'bond:C6-C1', bend: 1 }, { from: 'bond:C1-O', to: 'atom:O', bend: -1 }] }
    ]
  },
  amide: {
    id: 'amide', name: 'Amide', sign: '-', helpersNote: 'the nitrogen lone pair is shared with the oxygen',
    helpersOverride: { n: 2, text: 'the nitrogen lone pair spreads over N and O, which gives the C-N bond partial double-bond character. That is why amides are flat and stiff.' },
    atoms: [{ id: 'Me', x: 60, y: 120, label: 'H3C' }, { id: 'C', x: 130, y: 120, label: 'C' }, { id: 'O', x: 188, y: 78, label: 'O' }, { id: 'N', x: 188, y: 162, label: 'NH2' }],
    contributors: [
      { bonds: [['Me', 'C', 1], ['C', 'O', 2], ['C', 'N', 1]], charges: {}, lp: { O: [40, 110], N: [-30] }, arrows: [{ from: 'lp:N', to: 'bond:C-N', bend: 1 }, { from: 'bond:C-O', to: 'atom:O', bend: -1 }] },
      { bonds: [['Me', 'C', 1], ['C', 'O', 1], ['C', 'N', 2]], charges: { O: '-', N: '+' }, lp: { O: [-100, -30, 40] }, arrows: [{ from: 'lp:O', to: 'bond:C-O', bend: -1 }, { from: 'bond:C-N', to: 'atom:N', bend: 1 }] }
    ]
  },
  nitro: {
    id: 'nitro', name: 'Nitro group', sign: '-', helpersNote: 'both oxygens share the minus (the nitrogen keeps its plus)',
    atoms: [{ id: 'Me', x: 60, y: 120, label: 'H3C' }, { id: 'N', x: 130, y: 120, label: 'N' }, { id: 'O1', x: 188, y: 78, label: 'O' }, { id: 'O2', x: 188, y: 162, label: 'O' }],
    contributors: [
      { bonds: [['Me', 'N', 1], ['N', 'O1', 2], ['N', 'O2', 1]], charges: { N: '+', O2: '-' }, lp: { O1: [40, 110], O2: [-30, 30, 100] }, arrows: [{ from: 'lp:O2', to: 'bond:N-O2', bend: 1 }, { from: 'bond:N-O1', to: 'atom:O1', bend: -1 }] },
      { bonds: [['Me', 'N', 1], ['N', 'O1', 1], ['N', 'O2', 2]], charges: { N: '+', O1: '-' }, lp: { O1: [-100, -30, 30], O2: [-110, -40] }, arrows: [{ from: 'lp:O1', to: 'bond:N-O1', bend: -1 }, { from: 'bond:N-O2', to: 'atom:O2', bend: 1 }] }
    ]
  },
  oxonium: {
    id: 'oxonium', name: 'Protonated ketone', sign: '+', helpersNote: 'the oxygen and the carbon share the plus',
    atoms: [{ id: 'Me1', x: 60, y: 88, label: 'H3C' }, { id: 'Me2', x: 60, y: 152, label: 'H3C' }, { id: 'C', x: 130, y: 120, label: 'C' }, { id: 'O', x: 195, y: 120, label: 'O' }, { id: 'H', x: 245, y: 86, label: 'H' }],
    contributors: [
      { bonds: [['Me1', 'C', 1], ['Me2', 'C', 1], ['C', 'O', 2], ['O', 'H', 1]], charges: { O: '+' }, lp: { O: [60] }, arrows: [{ from: 'bond:C-O', to: 'atom:O', bend: 1 }] },
      { bonds: [['Me1', 'C', 1], ['Me2', 'C', 1], ['C', 'O', 1], ['O', 'H', 1]], charges: { C: '+' }, lp: { O: [60, 120] }, arrows: [{ from: 'lp:O', to: 'bond:C-O', bend: 1 }] }
    ]
  }
};

// The five systems the visual walks through, in chip order.
const VISUAL = ['allyl', 'acetate', 'enolate', 'benzyl', 'amide'];
// Systems the counting prompt may draw (each has one mobile charge sign).
const COUNTABLE = ['allyl', 'allylAnion', 'pentadienyl', 'acetate', 'enolate', 'benzyl', 'phenoxide', 'nitro'];

// Count the helpers: distinct atoms that carry the mobile charge across all contributors. Computed, never typed in.
export function helpers(sys){
  const set = new Set();
  for (const c of sys.contributors) for (const [id, ch] of Object.entries(c.charges)) if (ch === sys.sign) set.add(id);
  return set;
}

// "Which is the major contributor?" A curated table: each entry pairs a legal major form with a form that breaks a rule
// (or a legal minor form), and names the rule that decides it. Both are drawn from the same data.
export const MAJOR = [
  { sys: 'allyl', rule: 'Carbon never gets five bonds.', good: 0,
    bad: { bonds: [['C1', 'C2', 2], ['C2', 'C3', 2]], charges: {}, lp: {} },
    why: 'The middle carbon would hold an H plus two double bonds. That is five bonds, and carbon stops at four.' },
  { sys: 'acetate', rule: 'Carbon never gets five bonds.', good: 0,
    bad: { bonds: [['Me', 'C', 1], ['C', 'O1', 2], ['C', 'O2', 2]], charges: {}, lp: { O1: [40, 110], O2: [-110, -40] } },
    why: 'That carbon would have a methyl plus two double bonds: five bonds. Push a pi bond onto an oxygen instead and the minus moves.' },
  { sys: 'nitro', rule: 'Second-row atoms never go past eight electrons.', good: 0,
    bad: { bonds: [['Me', 'N', 1], ['N', 'O1', 2], ['N', 'O2', 2]], charges: {}, lp: { O1: [40, 110], O2: [-110, -40] } },
    why: 'Nitrogen with a methyl and two double bonds is holding ten electrons. Second row, eight is the ceiling, so the real drawing keeps N plus and one O minus.' },
  { sys: 'enolate', rule: 'A negative charge sits on the most electronegative atom.', good: 0, badIndex: 1,
    why: 'Both drawings are legal. The minus is happier on oxygen than on carbon, so the oxygen form is major.' },
  { sys: 'amide', rule: 'Fewest charges wins when every atom has an octet.', good: 0, badIndex: 1,
    why: 'Both drawings are legal. The neutral one has no charges to carry, so it is major; the separated one is the minor helper that still stiffens the C-N bond.' },
  { sys: 'oxonium', rule: 'Full octets first. A plus on oxygen is fine when every atom has eight.', good: 0, badIndex: 1,
    why: 'In the C=O form every atom has an octet, oxygen included. The C+ form leaves carbon with only six, so the oxygen-plus drawing is major.' }
];

// ---------- item generator (pure, node-safe) ----------
export function gen(rng){
  if (rng() < 0.5){
    const sys = SYSTEMS[COUNTABLE[Math.floor(rng() * COUNTABLE.length)]];
    const n = helpers(sys).size;
    const contrib = Math.floor(rng() * sys.contributors.length);
    const choices = [1, 2, 3, 4];
    return { type: 'count', sysId: sys.id, contrib, choices, answer: choices.indexOf(n), n };
  }
  const m = MAJOR[Math.floor(rng() * MAJOR.length)];
  const sys = SYSTEMS[m.sys];
  const goodC = sys.contributors[m.good];
  const badC = m.badIndex != null ? sys.contributors[m.badIndex] : m.bad;
  const goodFirst = rng() < 0.5;
  return { type: 'major', sysId: m.sys, rule: m.rule, why: m.why, forms: goodFirst ? [goodC, badC] : [badC, goodC], answer: goodFirst ? 0 : 1 };
}

function mulberry(seed){ let s = seed | 0; return function(){ s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

// electron bookkeeping used by selfTest: bonds around an atom and whether any second-row atom is over-full
function bondCount(contrib, id){ return contrib.bonds.filter(b => b[0] === id || b[1] === id).reduce((n, b) => n + b[2], 0); }
const IMPLICIT_H = { H2C: 2, CH2: 2, CH: 1, H3C: 3, CH3: 3, NH2: 2, C: 0, O: 0, N: 0, H: 0, '': 0 };

export function selfTest(){
  const rng = mulberry(11);
  let tried = 0, counts = 0, majors = 0;
  // every system: each contributor conserves electrons with its neighbors (same atoms, bond orders only shift by pushes) and the arrow sources exist
  for (const sys of Object.values(SYSTEMS)){
    const ids = new Set(sys.atoms.map(a => a.id));
    const totalOrder = c => c.bonds.reduce((n, b) => n + b[2], 0);
    const charge = c => Object.values(c.charges).reduce((n, ch) => n + (ch === '+' ? 1 : -1), 0);
    const first = sys.contributors[0];
    for (const c of sys.contributors){
      for (const b of c.bonds) if (!ids.has(b[0]) || !ids.has(b[1])) return { ok: false, tried, notes: sys.id + ' bond to unknown atom' };
      if (charge(c) !== charge(first)) return { ok: false, tried, notes: sys.id + ' contributors differ in net charge' };
      if (c.bonds.length !== first.bonds.length) return { ok: false, tried, notes: sys.id + ' contributors differ in sigma framework' };
      // a resonance push moves one pi pair: total bond order shifts by at most one per lone-pair conversion
      if (Math.abs(totalOrder(c) - totalOrder(first)) > 1) return { ok: false, tried, notes: sys.id + ' moved more than one pair' };
      for (const ar of c.arrows){
        const [kind, ref] = ar.from.split(':');
        if (kind === 'lp' && !(c.lp[ref] && c.lp[ref].length)) return { ok: false, tried, notes: sys.id + ' arrow from a lone pair that is not drawn' };
        if (kind === 'bond' && !c.bonds.some(b => (b[0] + '-' + b[1]) === ref && b[2] >= 2)) return { ok: false, tried, notes: sys.id + ' arrow from a bond with no pi electrons: ' + ref };
      }
      // no carbon over four bonds in any legal contributor
      for (const a of sys.atoms){
        const n = bondCount(c, a.id) + (IMPLICIT_H[a.label] || 0);
        if ((a.label === '' || a.label[0] === 'C' || a.label.endsWith('C')) && n > 4) return { ok: false, tried, notes: sys.id + ' carbon ' + a.id + ' has ' + n + ' bonds' };
      }
    }
    if (helpers(sys).size < 1) return { ok: false, tried, notes: sys.id + ' has no helpers' };
  }
  // the major table: the bad form really breaks the rule it names, or is the legal minor form
  for (const m of MAJOR){
    const sys = SYSTEMS[m.sys];
    if (m.badIndex == null){
      const over = sys.atoms.some(a => bondCount(m.bad, a.id) + (IMPLICIT_H[a.label] || 0) > 4);
      if (!over) return { ok: false, tried, notes: m.sys + ' bad form does not break the octet' };
    } else if (m.badIndex === m.good) return { ok: false, tried, notes: m.sys + ' good and bad are the same form' };
  }
  for (let i = 0; i < 400; i++){
    const it = gen(rng); tried++;
    if (it.type === 'count'){
      counts++;
      if (it.answer < 0) return { ok: false, tried, notes: 'count outside the choices' };
      if (it.choices[it.answer] !== helpers(SYSTEMS[it.sysId]).size) return { ok: false, tried, notes: 'count answer mismatch' };
    } else {
      majors++;
      if (it.forms[0] === it.forms[1]) return { ok: false, tried, notes: 'major item with identical forms' };
      const m = MAJOR.find(x => x.sys === it.sysId);
      if (it.forms[it.answer] !== SYSTEMS[it.sysId].contributors[m.good]) return { ok: false, tried, notes: 'major answer is not the good form' };
    }
  }
  const a = gen(mulberry(5)), b = gen(mulberry(5));
  if (JSON.stringify(a) !== JSON.stringify(b)) return { ok: false, tried, notes: 'not reproducible' };
  return { ok: true, tried, notes: counts + ' count-the-helpers, ' + majors + ' major-contributor' };
}

// ---------- drawing ----------
let uid = 0;
function tween(api, ms, step, done){
  if (api.reduced || typeof requestAnimationFrame !== 'function'){ step(1); if (done) done(); return; }
  const t0 = performance.now();
  const f = now => { const p = Math.min(1, (now - t0) / ms); const e = 1 - Math.pow(1 - p, 3); step(e); if (p < 1) requestAnimationFrame(f); else if (done) done(); };
  requestAnimationFrame(f);
}
function labelRadius(label){ return label === '' ? 0 : label.length === 1 ? 13 : label.length === 2 ? 18 : 24; }
// "H3C" becomes H, subscript 3, C
function labelText(api, x, y, label, fill, size){
  const t = api.svg('text', { x, y: y + size * 0.36, 'text-anchor': 'middle', 'font-family': 'Georgia, serif', 'font-size': String(size), fill });
  const runs = label.match(/[A-Za-z]+|\d+/g) || [];
  for (const r of runs){
    if (/\d/.test(r)) t.append(api.svg('tspan', { dy: String(size * 0.28), 'font-size': String(size * 0.7), text: r }), api.svg('tspan', { dy: String(-size * 0.28), text: '' }));
    else t.append(api.svg('tspan', { text: r }));
  }
  return t;
}
function markerDefs(api, id, color){
  return api.svg('defs', {}, api.svg('marker', { id, viewBox: '0 0 10 10', refX: '8', refY: '5', markerWidth: '6', markerHeight: '6', orient: 'auto-start-reverse' }, api.svg('path', { d: 'M0 0 L10 5 L0 10 z', fill: color })));
}

// Draw one contributor of a system into a group. Returns handles for geometry lookups.
function drawMol(api, sys, contrib, opts){
  const { svg } = api, C = api.colors;
  const g = svg('g', {});
  const pos = {}; for (const a of sys.atoms) pos[a.id] = a;
  const glow = opts.glow || new Set();
  const size = opts.size || 20;
  const S = opts.scale || 1, ox = opts.ox || 0, oy = opts.oy || 0;
  const P = (x, y) => ({ x: ox + x * S, y: oy + y * S });
  // gold halos on the helpers
  for (const id of glow){ const a = pos[id]; const p = P(a.x, a.y); g.append(svg('circle', { cx: p.x, cy: p.y, r: 22 * S, fill: C.gold, opacity: '0.16' })); }
  // bonds
  const mids = {};
  for (const [ai, bi, order] of contrib.bonds){
    const a = pos[ai], b = pos[bi];
    const pa = P(a.x, a.y), pb = P(b.x, b.y);
    const dx = pb.x - pa.x, dy = pb.y - pa.y, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
    const ra = labelRadius(a.label) * S * (size / 20), rb = labelRadius(b.label) * S * (size / 20);
    const x1 = pa.x + ux * ra, y1 = pa.y + uy * ra, x2 = pb.x - ux * rb, y2 = pb.y - uy * rb;
    mids[ai + '-' + bi] = { x: (x1 + x2) / 2, y: (y1 + y2) / 2, nx: -uy, ny: ux };
    const w = 2.4 * S;
    if (order === 1) g.append(svg('line', { x1, y1, x2, y2, stroke: C.ink2, 'stroke-width': String(w), 'stroke-linecap': 'round' }));
    else {
      // ring double bonds sit inside the ring; open-chain ones straddle the line
      let off = 4.2 * S, side = 0;
      if (sys.ringCenter && a.label === '' && b.label === ''){
        const c = P(sys.ringCenter[0], sys.ringCenter[1]);
        const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
        side = ((c.x - mx) * -uy + (c.y - my) * ux) > 0 ? 1 : -1;
        g.append(svg('line', { x1, y1, x2, y2, stroke: C.ink2, 'stroke-width': String(w), 'stroke-linecap': 'round' }));
        const sh = 0.16;
        g.append(svg('line', { x1: x1 + (x2 - x1) * sh - uy * off * 1.7 * side, y1: y1 + (y2 - y1) * sh + ux * off * 1.7 * side, x2: x2 - (x2 - x1) * sh - uy * off * 1.7 * side, y2: y2 - (y2 - y1) * sh + ux * off * 1.7 * side, stroke: C.ink2, 'stroke-width': String(w), 'stroke-linecap': 'round' }));
      } else {
        for (const s of [-1, 1]) g.append(svg('line', { x1: x1 - uy * off * s, y1: y1 + ux * off * s, x2: x2 - uy * off * s, y2: y2 + ux * off * s, stroke: C.ink2, 'stroke-width': String(w), 'stroke-linecap': 'round' }));
      }
    }
  }
  // atoms, charges, lone pairs
  const lpPts = {};
  for (const a of sys.atoms){
    const p = P(a.x, a.y);
    const charged = contrib.charges[a.id];
    const fill = charged === '+' ? C.coral : charged === '-' ? C.blue : C.ink;
    if (a.label !== '') g.append(labelText(api, p.x, p.y, a.label, fill, size * S));
    else if (charged) g.append(svg('circle', { cx: p.x, cy: p.y, r: 3.2 * S, fill }));
    const r = labelRadius(a.label) * S * (size / 20);
    const lps = contrib.lp[a.id] || [];
    lps.forEach((deg, k) => {
      const t = deg * Math.PI / 180, d = r + 8 * S;
      const cx = p.x + Math.cos(t) * d, cy = p.y - Math.sin(t) * d;
      const px = -Math.sin(t) * 3.4 * S, py = -Math.cos(t) * 3.4 * S;
      g.append(svg('circle', { cx: cx + px, cy: cy + py, r: 2.2 * S, fill: C.blue }), svg('circle', { cx: cx - px, cy: cy - py, r: 2.2 * S, fill: C.blue }));
      if (k === 0) lpPts[a.id] = { x: cx, y: cy };
    });
    if (charged){
      // put the badge where nothing else is: away from every bond and every lone pair on this atom
      const taken = lps.slice();
      for (const [ai, bi] of contrib.bonds){ const o = ai === a.id ? pos[bi] : bi === a.id ? pos[ai] : null; if (o) taken.push(Math.atan2(-(o.y - a.y), o.x - a.x) * 180 / Math.PI); }
      const cands = [50, 130, -50, 230, 90, 0, 180, 270, 20, 160];
      const gapTo = deg => taken.reduce((m, t) => Math.min(m, Math.abs(((deg - t) % 360 + 540) % 360 - 180)), 999);
      let deg = cands[0], best = -1;
      for (const c of cands){ const gq = gapTo(c); if (gq > best){ best = gq; deg = c; } }
      if (sys.ringCenter && a.label === '') deg = Math.atan2(-(a.y - sys.ringCenter[1]), a.x - sys.ringCenter[0]) * 180 / Math.PI;
      const t = deg * Math.PI / 180, d = r + 13 * S;
      const cx = p.x + Math.cos(t) * d, cy = p.y - Math.sin(t) * d, R = 7 * S;
      const col = charged === '+' ? C.coral : C.blue;
      g.append(svg('circle', { cx, cy, r: R, fill: 'none', stroke: col, 'stroke-width': String(1.6 * S) }));
      g.append(svg('line', { x1: cx - R * 0.55, y1: cy, x2: cx + R * 0.55, y2: cy, stroke: col, 'stroke-width': String(1.8 * S), 'stroke-linecap': 'round' }));
      if (charged === '+') g.append(svg('line', { x1: cx, y1: cy - R * 0.55, x2: cx, y2: cy + R * 0.55, stroke: col, 'stroke-width': String(1.8 * S), 'stroke-linecap': 'round' }));
    }
  }
  const point = ref => {
    const [kind, key] = ref.split(':');
    if (kind === 'lp') return lpPts[key];
    if (kind === 'atom'){ const a = pos[key]; return P(a.x, a.y); }
    return mids[key] || mids[key.split('-').reverse().join('-')];
  };
  return { g, point, S };
}

// A curved arrow from source to destination. Gold. Returns the path so it can be animated.
function curvedArrow(api, from, to, bend, markerId, S){
  const dx = to.x - from.x, dy = to.y - from.y, L = Math.hypot(dx, dy) || 1;
  const nx = -dy / L, ny = dx / L;
  const shrink = 9 * S;
  const fx = from.x + dx / L * 4 * S, fy = from.y + dy / L * 4 * S;
  const tx = to.x - dx / L * shrink, ty = to.y - dy / L * shrink;
  const cx = (fx + tx) / 2 + nx * bend * Math.max(22 * S, L * 0.38), cy = (fy + ty) / 2 + ny * bend * Math.max(22 * S, L * 0.38);
  return api.svg('path', { d: 'M' + fx.toFixed(1) + ' ' + fy.toFixed(1) + ' Q' + cx.toFixed(1) + ' ' + cy.toFixed(1) + ' ' + tx.toFixed(1) + ' ' + ty.toFixed(1), fill: 'none', stroke: api.colors.goldhi, 'stroke-width': String(2.6 * S), 'stroke-linecap': 'round', 'marker-end': 'url(#' + markerId + ')' });
}

export function mount(slots, api){
  const { el, svg } = api, C = api.colors;

  // ---------- VISUAL ----------
  let sys = SYSTEMS[VISUAL[0]], idx = 0, busy = false;
  const W = 800, H = 300, S = 1.55;
  const stage = el('div', {});
  const counter = el('div', { style: { display: 'flex', gap: '14px', alignItems: 'baseline', flexWrap: 'wrap', marginTop: '6px' } });
  const counterNum = el('span', { style: { fontFamily: 'Georgia, serif', fontSize: '26px', color: C.goldhi } });
  const counterText = el('span', { style: { color: C.ink2, fontSize: '15px' } });
  counter.append(counterNum, counterText);
  const caption = el('p', { style: { margin: '6px 0 0', color: C.ink2, fontSize: '15px', minHeight: '2.4em' }, text: '' });

  function frame(){
    const id = 'res' + (++uid);
    const root = svg('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': sys.name + ', contributor ' + (idx + 1) + ' of ' + sys.contributors.length });
    root.append(markerDefs(api, id + 'head', C.goldhi));
    const xs = sys.atoms.map(a => a.x), ys = sys.atoms.map(a => a.y);
    const bx = (Math.min(...xs) + Math.max(...xs)) / 2, by = (Math.min(...ys) + Math.max(...ys)) / 2;
    const ox = W / 2 - bx * S, oy = H / 2 - by * S + 8;
    const m = drawMol(api, sys, sys.contributors[idx], { scale: S, ox, oy, glow: helpers(sys) });
    root.append(m.g);
    const arrows = svg('g', { opacity: '0' });
    for (const ar of sys.contributors[idx].arrows){ const p = curvedArrow(api, m.point(ar.from), m.point(ar.to), ar.bend, id + 'head', S); arrows.append(p); }
    root.append(arrows);
    root.append(svg('text', { x: 16, y: 26, 'font-family': 'ui-monospace, Menlo, monospace', 'font-size': '12', fill: C.ink3, text: 'CONTRIBUTOR ' + (idx + 1) + ' OF ' + sys.contributors.length }));
    root.append(svg('text', { x: W - 16, y: 26, 'text-anchor': 'end', 'font-family': 'Georgia, serif', 'font-size': '18', fill: C.ink2, text: sys.name }));
    return { root, arrows, mol: m.g };
  }
  let cur = null;
  function render(){
    stage.replaceChildren();
    cur = frame();
    stage.append(cur.root);
    const n = sys.helpersOverride ? sys.helpersOverride.n : helpers(sys).size;
    counterNum.textContent = 'helpers: ' + n;
    counterText.textContent = sys.helpersOverride ? sys.helpersOverride.text : n + (n === 1 ? ' atom carries' : ' atoms share') + ' the charge (' + sys.helpersNote + ').';
  }
  function push(){
    if (busy) return; busy = true;
    caption.textContent = 'Gold arrows: the electrons move, the atoms stay put. Lone pair to bond, pi bond to the neighbor.';
    const D = api.reduced ? 0 : 1;
    const paths = [...cur.arrows.querySelectorAll('path')];
    const lens = paths.map(p => { try { return p.getTotalLength(); } catch (e){ return 200; } });
    paths.forEach((p, i) => { p.style.transition = 'none'; p.setAttribute('stroke-dasharray', String(lens[i])); p.style.strokeDashoffset = String(lens[i]); });
    cur.arrows.setAttribute('opacity', '1');
    void cur.root.getBoundingClientRect();
    paths.forEach(p => { p.style.transition = 'stroke-dashoffset ' + (700 * D) + 'ms ease-out'; p.style.strokeDashoffset = '0'; });
    setTimeout(() => {
      cur.mol.style.transition = 'opacity ' + (260 * D) + 'ms'; cur.arrows.style.transition = 'opacity ' + (260 * D) + 'ms';
      cur.mol.style.opacity = '0'; cur.arrows.style.opacity = '0';
      setTimeout(() => {
        idx = (idx + 1) % sys.contributors.length;
        render();
        cur.mol.style.opacity = '0';
        void cur.root.getBoundingClientRect();
        cur.mol.style.transition = 'opacity ' + (260 * D) + 'ms';
        cur.mol.style.opacity = '1';
        setTimeout(() => { busy = false; caption.textContent = 'Contributor ' + (idx + 1) + '. Same atoms, same sigma bonds, the charge moved. Push again.'; }, 260 * D + 20);
      }, 260 * D + 20);
    }, (700 + 350) * D);
  }
  const chips = el('div', { class: 'controls', role: 'group', 'aria-label': 'Choose a system' });
  const chipEls = VISUAL.map(k => el('button', { class: 'chip', type: 'button', 'aria-pressed': k === sys.id ? 'true' : 'false', text: SYSTEMS[k].name, onClick: () => { if (busy) return; sys = SYSTEMS[k]; idx = 0; chipEls.forEach(c => c.setAttribute('aria-pressed', c.textContent === sys.name ? 'true' : 'false')); render(); caption.textContent = 'Press "Push" to move the electrons to the next contributor.'; } }));
  chips.append(...chipEls);
  const pushBtn = el('button', { class: 'primary', type: 'button', text: 'Push', onClick: push });
  slots.visual.append(stage, el('div', { class: 'controls' }, pushBtn), counter, caption, chips);
  render();
  caption.textContent = 'Press "Push" to move the electrons to the next contributor.';

  // ---------- YOU TRY ----------
  let item = null, firstTry = true, done = false;
  const tryBox = el('div', { class: 'item' });
  slots.try.append(tryBox);

  function molSvg(sysX, contrib, opts){
    const id = 'resi' + (++uid);
    const w = opts.w || 300, h = opts.h || 210;
    const s = svg('svg', { viewBox: '0 0 ' + w + ' ' + h, width: '100%', style: { display: 'block', maxHeight: (opts.maxH || 190) + 'px' }, 'aria-hidden': 'true' });
    const m = drawMol(api, sysX, contrib, { scale: opts.scale || 1, ox: opts.ox || 0, oy: opts.oy || 0 });
    s.append(m.g);
    return s;
  }
  function verdictGood(){
    tryBox.append(el('div', { class: 'verdict good', text: 'You can read it.' }));
    tryBox.append(el('div', { class: 'controls' }, el('button', { class: 'primary', type: 'button', text: 'Another one', onClick: next })));
  }
  function commit(ok, coachText){
    if (done) return;
    if (ok){ done = true; api.report(firstTry); api.clearCoach(); verdictGood(); }
    else { if (firstTry) api.report(false); firstTry = false; if (!tryBox.querySelector('.verdict')) tryBox.append(el('div', { class: 'verdict notyet', text: 'Not yet.' })); api.coach(coachText); }
  }
  function optButtons(labels, answer, onMiss, opts){
    const box = el('div', { class: 'opts' });
    const btns = labels.map((content, i) => {
      const btn = el('button', { class: 'opt', type: 'button', 'aria-label': (opts && opts.aria) ? opts.aria[i] : undefined }, el('span', { class: 'k', text: 'ABCD'[i] }), content);
      btn.addEventListener('click', () => {
        if (done) return;
        btns.forEach(x => x.classList.remove('picked')); btn.classList.add('picked');
        if (i === answer){ btn.classList.add('ok'); btns.forEach(x => { x.disabled = true; }); commit(true); }
        else commit(false, onMiss(i));
      });
      return btn;
    });
    box.append(...btns);
    return box;
  }

  function renderCount(it){
    const sysX = SYSTEMS[it.sysId];
    tryBox.append(el('p', { class: 'prompt', text: 'How many atoms share the charge in this system? Push it in your head first.' }));
    const wrap = el('div', { style: { maxWidth: '420px', margin: '0 auto 6px' } });
    wrap.append(molSvg(sysX, sysX.contributors[it.contrib], { maxH: 210 }));
    wrap.append(el('div', { style: { textAlign: 'center', fontFamily: 'Georgia, serif', color: C.ink2, fontSize: '15px' }, text: sysX.name }));
    tryBox.append(wrap);
    tryBox.append(optButtons(it.choices.map(n => el('span', { text: n + (n === 1 ? ' atom' : ' atoms') })), it.answer, () => {
      return 'Push every pi bond and lone pair one step at a time and mark each atom the charge lands on. Here it lands on ' + it.n + ' (' + sysX.helpersNote + ').';
    }));
  }
  function renderMajor(it){
    const sysX = SYSTEMS[it.sysId];
    tryBox.append(el('p', { class: 'prompt', text: 'Which drawing is the major contributor for ' + sysX.name.toLowerCase() + '?' }));
    const cards = it.forms.map(f => el('span', { style: { display: 'block' } }, molSvg(sysX, f, { maxH: 170 })));
    tryBox.append(optButtons(cards, it.answer, () => it.rule + ' ' + it.why, { aria: ['Drawing A', 'Drawing B'] }));
  }
  function next(){
    tryBox.replaceChildren(); api.clearCoach();
    item = gen(api.rng); firstTry = true; done = false;
    if (item.type === 'count') renderCount(item); else renderMajor(item);
  }
  next();
}
