// The Roots of Organic · Level 1 · Root 5: Name the face (functional groups)
// ES module, no imports.

export const meta = {
  id: 'l1-groups',
  level: 1,
  order: 5,
  needs3D: false,
  title: 'Name the face',
  concept: 'Functional groups',
  tagline: 'The same fifteen faces show up on every page. Learn to greet them.',
  story: 'Organic looks like thousands of molecules, but the same handful of faces shows up on every page: alcohol, ether, amine, aldehyde, ketone, carboxylic acid, ester, amide, acid chloride, anhydride, nitrile, alkene, alkyne, alkyl halide and the benzene ring. A functional group is the part of a molecule that actually does chemistry; the carbon chain around it is mostly along for the ride. So reading a molecule is really just spotting faces. Here is the move: find the oxygen or nitrogen first, because that is where the action is, then ask what it is attached to. A carbonyl with an OH on it is an acid. A carbonyl with an oxygen going to another carbon is an ester. Rule of thumb: find the heteroatom, then ask what it is attached to.',
  moveName: 'Find the heteroatom, then ask what it is attached to',
  move: [
    'Scan for oxygen, nitrogen or a halogen. No heteroatom means alkene, alkyne or benzene ring.',
    'If there is a carbonyl (a carbon with a double bond to oxygen), look at what sits on that carbon: H, carbon, OH, an oxygen to carbon, nitrogen, Cl, or another carbonyl through an oxygen.',
    'No carbonyl: an OH is an alcohol, an oxygen between carbons is an ether, a nitrogen is an amine, a halogen is an alkyl halide.',
    'Say the name out loud. The suffix in the name and the reagent that touches it both come from the face.'
  ],
  trap: 'Careful: aldehyde versus ketone comes down to whether the carbonyl carbon has a hydrogen on it. At the end of a chain it does (aldehyde); in the middle with carbons on both sides it does not (ketone).',
  holdsUp: ['Nomenclature suffixes', 'Reagent recognition', 'Carbonyl reactivity ladder', 'Spectroscopy'],
  drill: 'Booster OChem: The Fundamentals'
};

// ---------------------------------------------------------------- helpers
const L = 46;
const DEG = Math.PI / 180;
const SERIF = 'Georgia, "Times New Roman", serif';
const MONO = 'ui-monospace, "SF Mono", Menlo, monospace';
function vec(deg){ return [Math.cos(deg * DEG), Math.sin(deg * DEG)]; }
function makeRng(seed){
  let s = seed | 0;
  return function(){ s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
function ri(rng, a, b){ return a + Math.floor(rng() * (b - a + 1)); }
function pickR(rng, arr){ return arr[Math.floor(rng() * arr.length)]; }
function shuffleR(rng, arr){ const b = arr.slice(); for (let i = b.length - 1; i > 0; i--){ const j = Math.floor(rng() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; }

// ---------------------------------------------------------------- the fifteen faces
// Each group expands into chain nodes. A node: { el: 'C'|'O'|'N', label, pend: [{ label, order, perp }], ring }.
// bonds[i] is the order between node i and i+1 inside the group. "end" groups sit at a chain end with the
// last node as the terminus (reversed for the start of the chain); "mid" groups sit between plain carbons.
const GROUPS = [
  { id: 'alcohol', name: 'alcohol', tell: 'an OH on a carbon that is not a carbonyl', end: true, mid: true,
    make(){ return { nodes: [{ el: 'C', pend: [{ label: 'OH', order: 1 }] }], bonds: [] }; } },
  { id: 'ether', name: 'ether', tell: 'an oxygen sitting between two carbons, no carbonyl in sight', end: false, mid: true,
    make(){ return { nodes: [{ el: 'O', label: 'O' }], bonds: [] }; } },
  { id: 'amine', name: 'amine', tell: 'a nitrogen on carbons with no carbonyl next to it', end: true, mid: true,
    make(end){ return { nodes: [{ el: 'N', label: end ? 'NH2' : 'NH' }], bonds: [] }; } },
  { id: 'aldehyde', name: 'aldehyde', tell: 'a carbonyl at the end of the chain, so the carbonyl carbon still has an H', end: true, mid: false,
    make(){ return { nodes: [{ el: 'C', pend: [{ label: 'O', order: 2, perp: true }, { label: 'H', order: 1 }] }], bonds: [] }; } },
  { id: 'ketone', name: 'ketone', tell: 'a carbonyl with a carbon on both sides', end: false, mid: true,
    make(){ return { nodes: [{ el: 'C', pend: [{ label: 'O', order: 2 }] }], bonds: [] }; } },
  { id: 'acid', name: 'carboxylic acid', tell: 'a carbonyl with an OH on it', end: true, mid: false,
    make(){ return { nodes: [{ el: 'C', pend: [{ label: 'O', order: 2, perp: true }, { label: 'OH', order: 1 }] }], bonds: [] }; } },
  { id: 'ester', name: 'ester', tell: 'a carbonyl with an oxygen on one side going to another carbon', end: false, mid: true,
    make(){ return { nodes: [{ el: 'C', pend: [{ label: 'O', order: 2 }] }, { el: 'O', label: 'O' }], bonds: [1] }; } },
  { id: 'amide', name: 'amide', tell: 'a carbonyl with a nitrogen on it', end: true, mid: true,
    make(end){ return end ? { nodes: [{ el: 'C', pend: [{ label: 'O', order: 2, perp: true }, { label: 'NH2', order: 1 }] }], bonds: [] } : { nodes: [{ el: 'C', pend: [{ label: 'O', order: 2 }] }, { el: 'N', label: 'NH' }], bonds: [1] }; } },
  { id: 'acidchloride', name: 'acid chloride', tell: 'a carbonyl with a Cl on it', end: true, mid: false,
    make(){ return { nodes: [{ el: 'C', pend: [{ label: 'O', order: 2, perp: true }, { label: 'Cl', order: 1 }] }], bonds: [] }; } },
  { id: 'anhydride', name: 'anhydride', tell: 'two carbonyls sharing one oxygen', end: false, mid: true,
    make(){ return { nodes: [{ el: 'C', pend: [{ label: 'O', order: 2 }] }, { el: 'O', label: 'O' }, { el: 'C', pend: [{ label: 'O', order: 2 }] }], bonds: [1, 1] }; } },
  { id: 'nitrile', name: 'nitrile', tell: 'a carbon triple bonded to a nitrogen, drawn in a straight line', end: true, mid: false,
    make(){ return { nodes: [{ el: 'C' }, { el: 'N', label: 'N' }], bonds: [3] }; } },
  { id: 'alkene', name: 'alkene', tell: 'a carbon-carbon double bond', end: true, mid: true,
    make(){ return { nodes: [{ el: 'C' }, { el: 'C' }], bonds: [2] }; } },
  { id: 'alkyne', name: 'alkyne', tell: 'a carbon-carbon triple bond, drawn straight', end: true, mid: true,
    make(){ return { nodes: [{ el: 'C' }, { el: 'C' }], bonds: [3] }; } },
  { id: 'halide', name: 'alkyl halide', tell: 'a halogen (F, Cl, Br or I) on a plain carbon with no carbonyl', end: true, mid: true,
    make(end, rng){ return { nodes: [{ el: 'C', pend: [{ label: pickR(rng, ['F', 'Cl', 'Br', 'I']), order: 1 }] }], bonds: [] }; } },
  { id: 'benzene', name: 'benzene ring', tell: 'the six-carbon ring with the circle inside', end: true, mid: false,
    make(){ return { nodes: [{ el: 'C', ring: true }], bonds: [] }; } }
];
const BY_ID = Object.fromEntries(GROUPS.map(g => [g.id, g]));
const CONFUSE = {
  alcohol: ['ether', 'acid', 'aldehyde'], ether: ['alcohol', 'ester', 'ketone'], amine: ['amide', 'nitrile', 'alcohol'],
  aldehyde: ['ketone', 'acid', 'alcohol'], ketone: ['aldehyde', 'ester', 'ether'], acid: ['ester', 'aldehyde', 'alcohol'],
  ester: ['acid', 'ether', 'ketone'], amide: ['amine', 'ester', 'acid'], acidchloride: ['halide', 'ester', 'ketone'],
  anhydride: ['ester', 'acid', 'ether'], nitrile: ['amine', 'alkyne', 'amide'], alkene: ['alkyne', 'halide', 'benzene'],
  alkyne: ['alkene', 'nitrile', 'benzene'], halide: ['acidchloride', 'alcohol', 'alkene'], benzene: ['alkene', 'alkyne', 'ketone']
};

// ---------------------------------------------------------------- generator
// A molecule is a chain of nodes: plain carbons (spacers) separating 2 or 3 distinct groups.
function genMol(rng){
  for (let attempt = 0; attempt < 200; attempt++){
    const k = rng() < 0.5 ? 2 : 3;
    const chosen = shuffleR(rng, GROUPS).slice(0, k);
    const ends = ['start', 'end'];
    const placed = [];
    let bad = false;
    for (const g of chosen){
      const options = []; if (g.mid) options.push('mid'); if (g.end && ends.length) options.push('end');
      if (!options.length){ bad = true; break; }
      const choice = pickR(rng, options);
      if (choice === 'end'){ const which = ends.splice(Math.floor(rng() * ends.length), 1)[0]; placed.push({ g, at: which }); }
      else placed.push({ g, at: 'mid' });
    }
    if (bad) continue;
    const startG = placed.find(p => p.at === 'start'), endG = placed.find(p => p.at === 'end');
    const mids = shuffleR(rng, placed.filter(p => p.at === 'mid'));
    const nodes = [], bonds = [];
    const add = (part, gid) => {
      for (let i = 0; i < part.nodes.length; i++){
        const nd = Object.assign({ pend: [], label: null, ring: false }, part.nodes[i]); nd.group = gid;
        if (nodes.length) bonds.push(part.bonds[i - 1] != null ? part.bonds[i - 1] : 1);
        nodes.push(nd);
      }
    };
    const spacer = () => { const c = k === 3 ? 1 : ri(rng, 1, 2); for (let i = 0; i < c; i++) add({ nodes: [{ el: 'C' }], bonds: [] }, null); };
    const rev = part => ({ nodes: part.nodes.slice().reverse(), bonds: part.bonds.slice().reverse() });
    if (startG) add(rev(startG.g.make(true, rng)), startG.g.id);
    for (const m of mids){ spacer(); let part = m.g.make(false, rng); if (part.bonds.length && rng() < 0.5) part = rev(part); add(part, m.g.id); }
    spacer();
    if (endG) add(endG.g.make(true, rng), endG.g.id);
    if (nodes.length > 12) continue;
    // fix the bond list when the first thing added was a group with internal bonds: add() handles it via part.bonds
    return { nodes, bonds, groups: placed.map(p => p.g.id) };
  }
  return null;
}

// ---------------------------------------------------------------- layout (pure, node-safe)
function layout(mol){
  const N = mol.nodes, B = mol.bonds, n = N.length;
  const isTriple = k => B[k] === 3;
  const linear = k => isTriple(k) || isTriple(k - 1) || isTriple(k + 1);
  const ang = []; let prev = -30;
  for (let k = 0; k <= n - 1; k++){ const a = linear(k) ? prev : -prev; ang.push(a); prev = a; }
  const pos = [{ x: 0, y: 0 }];
  for (let k = 0; k < n - 1; k++){ const [ux, uy] = vec(ang[k]); pos.push({ x: pos[k].x + ux * L, y: pos[k].y + uy * L }); }
  const contEnd = ang[n - 1];
  const contStart = (linear(0) ? ang[0] : -ang[0]) + 180;
  const unit = (a, b) => { const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy); return [dx / d, dy / d]; };
  const dirs = [];   // per node: { free: [x,y]|null, cont: [x,y]|null }
  for (let i = 0; i < n; i++){
    let free = null, cont = null;
    if (n === 1){ free = [0, -1]; cont = [1, 0]; }
    else if (i === 0 || i === n - 1){
      const u1 = i === 0 ? unit(pos[0], pos[1]) : unit(pos[n - 1], pos[n - 2]);
      cont = vec(i === 0 ? contStart : contEnd);
      const sx = u1[0] + cont[0], sy = u1[1] + cont[1], d = Math.hypot(sx, sy);
      free = d < 1e-6 ? [0, -1] : [-sx / d, -sy / d];
    } else {
      const u1 = unit(pos[i], pos[i - 1]), u2 = unit(pos[i], pos[i + 1]);
      const sx = u1[0] + u2[0], sy = u1[1] + u2[1], d = Math.hypot(sx, sy);
      free = d < 1e-6 ? null : [-sx / d, -sy / d];
    }
    dirs.push({ free, cont });
  }
  // pendants
  const pend = [];  // { from, x, y, label, order }
  for (let i = 0; i < n; i++){
    const nd = N[i]; const terminal = i === 0 || i === n - 1;
    for (const p of nd.pend){
      let d;
      if (terminal) d = p.perp ? dirs[i].free : dirs[i].cont; else d = dirs[i].free;
      if (!d) throw new Error('pendant on a linear atom');
      pend.push({ from: i, x: pos[i].x + d[0] * L, y: pos[i].y + d[1] * L, label: p.label, order: p.order, group: nd.group });
    }
  }
  // rings (benzene) on terminal nodes
  const rings = [];
  for (let i = 0; i < n; i++){
    if (!N[i].ring) continue;
    const d = dirs[i].cont; if (!d) throw new Error('ring on an interior atom');
    const cx = pos[i].x + d[0] * L, cy = pos[i].y + d[1] * L;
    const th0 = Math.atan2(-d[1], -d[0]) / DEG;
    const verts = [];
    for (let k = 0; k < 6; k++){ const [vx, vy] = vec(th0 + 60 * k); verts.push({ x: cx + vx * L, y: cy + vy * L }); }
    rings.push({ from: i, cx, cy, verts, group: N[i].group });
  }
  return { pos, pend, rings };
}

function labelRadius(label){ return label === 'NH2' ? 17 : label.length === 2 ? 13 : label === 'I' ? 6 : label === 'F' ? 8 : label === 'H' ? 8 : 10; }

// ---------------------------------------------------------------- drawing
// opts: { hits: bool, onHover(gid|null), onTap(gid) }
function drawMol(api, mol, opts){
  const C = api.colors, svg = api.svg;
  opts = opts || {};
  const lay = layout(mol);
  const N = mol.nodes, P = lay.pos;
  // bounding box
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  const addP = (x, y, r) => { x0 = Math.min(x0, x - r); y0 = Math.min(y0, y - r); x1 = Math.max(x1, x + r); y1 = Math.max(y1, y + r); };
  P.forEach(p => addP(p.x, p.y, 18)); lay.pend.forEach(p => addP(p.x, p.y, 20)); lay.rings.forEach(r => r.verts.forEach(v => addP(v.x, v.y, 14)));
  const pad = 14;
  const bw = x1 - x0 + 2 * pad, bh = y1 - y0 + 2 * pad;
  const w = Math.max(bw, 520), h = Math.max(bh, 160);
  const ox = x0 - pad - (w - bw) / 2, oy = y0 - pad - (h - bh) / 2;
  const root = svg('svg', { viewBox: `${ox.toFixed(1)} ${oy.toFixed(1)} ${w.toFixed(1)} ${h.toFixed(1)}`, role: 'img', 'aria-label': 'a molecule carrying several functional groups', style: { width: '100%', maxHeight: '340px', display: 'block' } });
  const gHit = svg('g'), gBonds = svg('g', { fill: 'none', stroke: C.ink, 'stroke-width': 2.6, 'stroke-linecap': 'round' }), gText = svg('g');
  root.append(gHit, gBonds, gText);
  const tr = api.reduced ? 'none' : 'stroke .2s ease, fill .2s ease';
  const parts = {};   // gid -> [{ el, attr }]
  const own = (gid, el, attr) => { if (gid == null) return; (parts[gid] || (parts[gid] = [])).push({ el, attr }); };
  const line = (x1, y1, x2, y2, attrs) => { const l = svg('line', Object.assign({ x1: x1.toFixed(1), y1: y1.toFixed(1), x2: x2.toFixed(1), y2: y2.toFixed(1) }, attrs || {})); l.style.transition = tr; return l; };
  const label = (x, y, text, size) => {
    const t = svg('text', { x: x.toFixed(1), y: y.toFixed(1), fill: C.ink, 'font-family': SERIF, 'font-size': size || 18, 'text-anchor': 'middle', 'dominant-baseline': 'central' });
    if (text === 'NH2'){ t.append('NH', svg('tspan', { dy: 6, 'font-size': 12, text: '2' })); } else t.textContent = text;
    t.style.transition = tr; return t;
  };
  // chain bonds
  for (let k = 0; k < N.length - 1; k++){
    const a = P[k], b = P[k + 1], order = mol.bonds[k];
    const ra = N[k].label ? labelRadius(N[k].label) : 0, rb = N[k + 1].label ? labelRadius(N[k + 1].label) : 0;
    const vx = b.x - a.x, vy = b.y - a.y, len = Math.hypot(vx, vy), ux = vx / len, uy = vy / len;
    const sx = a.x + ux * ra, sy = a.y + uy * ra, ex = b.x - ux * rb, ey = b.y - uy * rb;
    const gid = N[k].group != null && N[k].group === N[k + 1].group ? N[k].group : null;
    let nx = -uy, ny = ux;
    const main = line(sx, sy, ex, ey); gBonds.append(main); own(gid, main, 'stroke');
    if (order === 2){
      const ref = k + 2 < N.length ? P[k + 2] : (k - 1 >= 0 ? P[k - 1] : null);
      if (ref){ const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2; if ((ref.x - mx) * nx + (ref.y - my) * ny < 0){ nx = -nx; ny = -ny; } }
      const off = 6.5, sh = (ex - sx) * 0.16, shy = (ey - sy) * 0.16;
      const l2 = line(sx + sh + nx * off, sy + shy + ny * off, ex - sh + nx * off, ey - shy + ny * off); gBonds.append(l2); own(gid, l2, 'stroke');
    } else if (order === 3){
      for (const s of [-1, 1]){ const l2 = line(sx + nx * 6.2 * s, sy + ny * 6.2 * s, ex + nx * 6.2 * s, ey + ny * 6.2 * s); gBonds.append(l2); own(gid, l2, 'stroke'); }
    }
  }
  // in-chain labels
  N.forEach((nd, i) => { if (nd.label){ const t = label(P[i].x, P[i].y, nd.label); gText.append(t); own(nd.group, t, 'fill'); } });
  // pendants
  for (const p of lay.pend){
    const a = P[p.from];
    const vx = p.x - a.x, vy = p.y - a.y, len = Math.hypot(vx, vy), ux = vx / len, uy = vy / len;
    const r = labelRadius(p.label);
    const ex = p.x - ux * r, ey = p.y - uy * r;
    if (p.order === 2){
      const nx = -uy, ny = ux;
      for (const s of [-1, 1]){ const l = line(a.x + nx * 5.5 * s, a.y + ny * 5.5 * s, ex + nx * 5.5 * s, ey + ny * 5.5 * s); gBonds.append(l); own(p.group, l, 'stroke'); }
    } else { const l = line(a.x, a.y, ex, ey); gBonds.append(l); own(p.group, l, 'stroke'); }
    const t = label(p.x, p.y, p.label); gText.append(t); own(p.group, t, 'fill');
  }
  // rings
  for (const r of lay.rings){
    for (let k = 0; k < 6; k++){ const a = r.verts[k], b = r.verts[(k + 1) % 6]; const l = line(a.x, a.y, b.x, b.y); gBonds.append(l); own(r.group, l, 'stroke'); }
    const c = svg('circle', { cx: r.cx.toFixed(1), cy: r.cy.toFixed(1), r: (L * 0.58).toFixed(1), fill: 'none', stroke: C.ink, 'stroke-width': 2 }); c.style.transition = tr; gBonds.append(c); own(r.group, c, 'stroke');
  }
  // group regions (hit targets)
  const regions = {};
  const hitEls = {};
  for (const gid of mol.groups){
    const pts = [];
    N.forEach((nd, i) => { if (nd.group === gid) pts.push(P[i]); });
    lay.pend.forEach(p => { if (p.group === gid) pts.push(p); });
    lay.rings.forEach(r => { if (r.group === gid) r.verts.forEach(v => pts.push(v)); });
    const rx0 = Math.min(...pts.map(p => p.x)) - L * 0.42, ry0 = Math.min(...pts.map(p => p.y)) - L * 0.42;
    const rx1 = Math.max(...pts.map(p => p.x)) + L * 0.42, ry1 = Math.max(...pts.map(p => p.y)) + L * 0.42;
    regions[gid] = { x: rx0, y: ry0, w: rx1 - rx0, h: ry1 - ry0 };
  }
  if (opts.hits){
    mol.groups.forEach((gid, idx) => {
      const rg = regions[gid];
      const g = svg('g', { role: 'button', tabindex: 0, 'aria-label': `region ${idx + 1} of the molecule`, style: { cursor: 'pointer', outline: 'none' } });
      const rect = svg('rect', { x: rg.x.toFixed(1), y: rg.y.toFixed(1), width: rg.w.toFixed(1), height: rg.h.toFixed(1), rx: 12, fill: C.gold, 'fill-opacity': 0.0, stroke: C.gold, 'stroke-opacity': 0, 'stroke-width': 1.5, 'stroke-dasharray': '4 4', style: { pointerEvents: 'all', transition: api.reduced ? 'none' : 'fill-opacity .15s ease, stroke-opacity .15s ease' } });
      g.append(rect); gHit.append(g);
      hitEls[gid] = rect;
      const fire = () => opts.onTap && opts.onTap(gid);
      g.addEventListener('click', fire);
      g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); fire(); } });
      const over = () => { rect.setAttribute('stroke-opacity', 0.7); rect.setAttribute('fill-opacity', 0.06); opts.onHover && opts.onHover(gid); };
      const out = () => { if (!rect.dataset.lock){ rect.setAttribute('stroke-opacity', 0); rect.setAttribute('fill-opacity', 0); } opts.onHover && opts.onHover(null); };
      g.addEventListener('mouseenter', over); g.addEventListener('mouseleave', out);
      g.addEventListener('focus', over); g.addEventListener('blur', out);
    });
  }
  return {
    svg: root,
    light(gid, color){ const list = parts[gid] || []; for (const { el, attr } of list) el.setAttribute(attr, color || C.ink); },
    frame(gid, color, lock){ const r = hitEls[gid]; if (!r) return; if (color){ r.setAttribute('stroke', color); r.setAttribute('fill', color); r.setAttribute('stroke-opacity', 0.9); r.setAttribute('fill-opacity', 0.08); if (lock) r.dataset.lock = '1'; } else { delete r.dataset.lock; r.setAttribute('stroke', C.gold); r.setAttribute('fill', C.gold); r.setAttribute('stroke-opacity', 0); r.setAttribute('fill-opacity', 0); } }
  };
}

// ---------------------------------------------------------------- independent classifier (for selfTest and honesty)
function classify(mol, gid){
  const N = mol.nodes, B = mol.bonds;
  const idx = N.map((nd, i) => nd.group === gid ? i : -1).filter(i => i >= 0);
  if (idx.some(i => N[i].ring)) return 'benzene';
  for (const i of idx){ if (i + 1 < N.length && idx.includes(i + 1)){ const o = B[i]; const els = [N[i].el, N[i + 1].el].sort().join(''); if (o === 3 && els === 'CN') return 'nitrile'; if (o === 3 && els === 'CC') return 'alkyne'; if (o === 2 && els === 'CC') return 'alkene'; } }
  const carbonyls = idx.filter(i => N[i].pend.some(p => p.label === 'O' && p.order === 2));
  if (carbonyls.length === 2) return 'anhydride';
  if (carbonyls.length === 1){
    const i = carbonyls[0]; const pend = N[i].pend.map(p => p.label);
    if (pend.includes('OH')) return 'acid';
    if (pend.includes('Cl')) return 'acidchloride';
    if (pend.includes('NH2')) return 'amide';
    if (pend.includes('H')) return 'aldehyde';
    const nb = [i - 1, i + 1].filter(j => j >= 0 && j < N.length && idx.includes(j)).map(j => N[j].el);
    if (nb.includes('N')) return 'amide';
    if (nb.includes('O')) return 'ester';
    return 'ketone';
  }
  const one = idx[0];
  if (N[one].el === 'O') return 'ether';
  if (N[one].el === 'N') return 'amine';
  const pend = N[one].pend.map(p => p.label);
  if (pend.includes('OH')) return 'alcohol';
  if (pend.some(l => ['F', 'Cl', 'Br', 'I'].includes(l))) return 'halide';
  return null;
}

// ---------------------------------------------------------------- items (pure)
function genItem(rng, kind){
  const mol = genMol(rng);
  const target = pickR(rng, mol.groups);
  if (kind === 'tap') return { kind, mol, target };
  const others = CONFUSE[target].filter(id => id !== target);
  const pool = shuffleR(rng, GROUPS.map(g => g.id).filter(id => id !== target && !others.includes(id)));
  const distract = others.concat(pool).slice(0, 3);
  const ids = shuffleR(rng, [target, ...distract]);
  return { kind, mol, target, choices: ids.map(id => ({ id, text: BY_ID[id].name, ok: id === target })) };
}

// ---------------------------------------------------------------- mount
export function mount(slots, api){
  const C = api.colors, el = api.el;

  // ---- VISUAL
  let mol = null, drawn = null, lit = null;
  const stage = el('div', {});
  const capt = el('div', { style: { fontFamily: SERIF, fontSize: '16px', color: C.ink, minHeight: '1.6em', marginTop: '10px' } });
  const chips = {};
  const chipRow = el('div', { class: 'controls', style: { gap: '6px' } });
  for (const g of GROUPS){
    const chip = el('button', { class: 'chip', type: 'button', 'aria-pressed': 'false', text: g.name, style: { minHeight: '36px', padding: '4px 11px', fontSize: '13px' }, onclick(){
      if (!mol.groups.includes(g.id)){ setLit(null); caption(null, `No ${g.name} on this one. It would look like ${g.tell}.`); return; }
      setLit(lit === g.id ? null : g.id);
    } });
    chips[g.id] = chip; chipRow.append(chip);
  }
  const btnNew = el('button', { class: 'secondary', type: 'button', text: 'New molecule', onclick: fresh });
  const hint = el('span', { style: { fontFamily: MONO, fontSize: '12px', color: C.ink3, marginLeft: 'auto' }, text: 'hover or tap a region, or a name below' });
  slots.visual.append(stage, capt, chipRow, el('div', { class: 'controls' }, btnNew, hint));

  function caption(gid, text){
    while (capt.firstChild) capt.removeChild(capt.firstChild);
    if (text){ capt.append(text); return; }
    if (!gid){ capt.append(`This one carries ${mol.groups.length} faces. Find the oxygen or nitrogen first, then ask what it is attached to.`); return; }
    const g = BY_ID[gid];
    capt.append(el('b', { text: g.name[0].toUpperCase() + g.name.slice(1), style: { color: C.goldhi, fontWeight: 600 } }), ': ' + g.tell + '.');
  }
  function paint(){
    for (const gid of mol.groups){ drawn.light(gid, gid === lit ? C.gold : null); drawn.frame(gid, gid === lit ? C.gold : null, gid === lit); }
    for (const g of GROUPS){ chips[g.id].setAttribute('aria-pressed', String(g.id === lit)); chips[g.id].style.opacity = mol.groups.includes(g.id) ? '1' : '.5'; }
  }
  function setLit(gid){ lit = gid; paint(); caption(gid); }
  function fresh(){
    mol = genMol(api.rng); lit = null;
    while (stage.firstChild) stage.removeChild(stage.firstChild);
    drawn = drawMol(api, mol, { hits: true,
      onHover(gid){ if (gid){ drawn.light(gid, C.gold); caption(gid); } else { paint(); caption(lit); } },
      onTap(gid){ setLit(lit === gid ? null : gid); } });
    stage.append(drawn.svg);
    setLit(mol.groups[0]);
  }
  fresh();

  // ---- YOU TRY
  let flip = 0;
  runTry(slots.try, api, () => {
    const kind = (flip++ % 2 === 0) ? 'tap' : 'which';
    const it = genItem(api.rng, kind);
    if (kind === 'which'){
      const d = drawMol(api, it.mol, { hits: false });
      d.light(it.target, C.gold);
      const g = BY_ID[it.target];
      const hetero = !['alkene', 'alkyne', 'benzene'].includes(it.target);
      return { prompt: 'Which group is lit in gold?', node: d.svg, mode: 'choices', choices: it.choices,
        coach: hetero ? 'Find the oxygen or nitrogen in the gold part and ask what it is attached to: carbonyl or no carbonyl, then what sits on it.' : 'No oxygen or nitrogen in the gold part, so it is one of the carbon-only faces: count the lines between the carbons, or look for the ring.' };
    }
    const targets = {};
    const d = drawMol(api, it.mol, { hits: true, onTap(gid){ targets[gid] && targets[gid].fire(); } });
    const tg = BY_ID[it.target];
    const list = it.mol.groups.map(gid => {
      const g = BY_ID[gid];
      const t = { ok: gid === it.target, fire: null,
        mark(ok){ d.light(gid, ok ? C.gold : C.coral); d.frame(gid, ok ? C.gold : C.coral, true); },
        coach: `That one is the ${g.name} (${g.tell}); the ${tg.name} is ${tg.tell}.` };
      targets[gid] = t; return t;
    });
    return { prompt: `Tap the ${tg.name}.`, node: d.svg, mode: 'tap', targets: list, coach: `The ${tg.name} is ${tg.tell}.` };
  });
}

// ---------------------------------------------------------------- the you-try harness
function runTry(host, api, nextItem){
  const el = api.el;
  function show(){
    while (host.firstChild) host.removeChild(host.firstChild);
    api.clearCoach();
    const item = nextItem();
    const box = el('div', { class: 'item' });
    box.append(el('p', { class: 'prompt', text: item.prompt }));
    if (item.node) box.append(item.node);
    const verdict = el('div', { class: 'verdict', style: { minHeight: '1.4em' } });
    const actions = el('div', { class: 'controls' });
    const another = el('button', { class: 'primary', type: 'button', text: 'Another one', onclick: show });
    let reported = false, done = false, missed = false;
    const settle = ok => {
      if (!reported){ reported = true; api.report(ok); }
      if (ok){ done = true; verdict.className = 'verdict good'; verdict.textContent = missed ? 'There it is.' : 'You can read it.'; actions.append(another); another.focus(); }
      else { missed = true; verdict.className = 'verdict notyet'; verdict.textContent = 'Not yet.'; }
    };
    if (item.mode === 'choices'){
      const opts = el('div', { class: 'opts' });
      const btns = []; let picked = -1;
      const check = el('button', { class: 'primary', type: 'button', text: 'Check', onclick(){
        if (picked < 0 || done) return;
        const ok = item.choices[picked].ok;
        if (ok){ btns[picked].classList.add('ok'); btns.forEach(x => { x.disabled = true; }); check.remove(); settle(true); }
        else { btns[picked].classList.remove('picked'); btns[picked].disabled = true; picked = -1; check.disabled = true; api.coach(item.coach); settle(false); }
      } });
      check.disabled = true;
      item.choices.forEach((c, i) => {
        const bt = el('button', { class: 'opt', type: 'button', onclick(){ if (done) return; picked = i; btns.forEach((x, j) => x.classList.toggle('picked', j === i)); check.disabled = false; } },
          el('span', { class: 'k', text: 'ABCD'[i] }), el('span', { text: c.text }));
        btns.push(bt); opts.append(bt);
      });
      box.append(opts, verdict, actions);
      actions.append(check);
      host.append(box);
      if (host.dataset.started) btns[0].focus();
    } else {
      item.targets.forEach(t => { t.fire = () => { if (done) return; t.mark(t.ok); if (t.ok) settle(true); else { api.coach(t.coach || item.coach); settle(false); } }; });
      box.append(verdict, actions);
      host.append(box);
    }
    host.dataset.started = '1';
  }
  show();
}

// ---------------------------------------------------------------- selfTest (node-safe)
export function selfTest(){
  const rng = makeRng(20260903);
  let tried = 0; const seen = new Set(); let maxNodes = 0;
  for (let k = 0; k < 300; k++){
    const kind = k % 2 === 0 ? 'tap' : 'which';
    const it = genItem(rng, kind);
    if (!it || !it.mol) return { ok: false, tried, notes: 'generator returned nothing' };
    const mol = it.mol, N = mol.nodes, B = mol.bonds;
    if (B.length !== N.length - 1) return { ok: false, tried, notes: 'bond list length' };
    // groups distinct, target occurs once, and separated by at least one plain carbon
    if (new Set(mol.groups).size !== mol.groups.length) return { ok: false, tried, notes: 'duplicate group' };
    if (mol.groups.filter(g => g === it.target).length !== 1) return { ok: false, tried, notes: 'target not unique' };
    for (let i = 0; i + 1 < N.length; i++) if (N[i].group != null && N[i + 1].group != null && N[i].group !== N[i + 1].group) return { ok: false, tried, notes: 'two groups touching' };
    // valence: carbon at most 4 explicit, chain O exactly 2, NH 2, NH2 1, nitrile N 3
    for (let i = 0; i < N.length; i++){
      let v = 0; if (i > 0) v += B[i - 1]; if (i < N.length - 1) v += B[i]; for (const p of N[i].pend) v += p.order; if (N[i].ring) v += 2;
      const nd = N[i];
      if (nd.el === 'C' && v > 4) return { ok: false, tried, notes: 'carbon over four' };
      if (nd.el === 'C' && nd.ring && v !== 3) return { ok: false, tried, notes: 'ring carbon valence' };
      if (nd.label === 'O' && v !== 2) return { ok: false, tried, notes: 'chain oxygen valence ' + v };
      if (nd.label === 'NH' && v !== 2) return { ok: false, tried, notes: 'NH valence' };
      if (nd.label === 'NH2' && v !== 1) return { ok: false, tried, notes: 'NH2 valence' };
      if (nd.label === 'N' && v !== 3) return { ok: false, tried, notes: 'nitrile N valence' };
      if (nd.el !== 'C' && nd.pend.length) return { ok: false, tried, notes: 'pendant on a heteroatom' };
    }
    // the independent classifier agrees with every group's label
    for (const gid of mol.groups){ const c = classify(mol, gid); if (c !== gid) return { ok: false, tried, notes: `classifier says ${c} for ${gid}` }; seen.add(gid); }
    // layout succeeds (no pendant on a linear atom, ring only at an end)
    const lay = layout(mol);
    if (lay.pos.length !== N.length) return { ok: false, tried, notes: 'layout' };
    if (lay.pend.some(p => !isFinite(p.x) || !isFinite(p.y))) return { ok: false, tried, notes: 'bad pendant position' };
    // nothing drawn on top of anything else: all atom and label positions distinct
    const pts = [...lay.pos, ...lay.pend, ...lay.rings.flatMap(r => r.verts.slice(1))];   // vertex 0 of a ring is the ipso carbon itself
    for (let a = 0; a < pts.length; a++) for (let b = a + 1; b < pts.length; b++) if (Math.hypot(pts[a].x - pts[b].x, pts[a].y - pts[b].y) < L * 0.5) return { ok: false, tried, notes: 'two atoms drawn on top of each other' };
    if (kind === 'which'){
      const oks = it.choices.filter(c => c.ok);
      if (oks.length !== 1 || oks[0].id !== it.target) return { ok: false, tried, notes: 'choice answer not unique' };
      if (new Set(it.choices.map(c => c.id)).size !== 4) return { ok: false, tried, notes: 'duplicate choices' };
    }
    maxNodes = Math.max(maxNodes, N.length);
    tried++;
  }
  if (seen.size !== GROUPS.length) return { ok: false, tried, notes: 'not every face was generated: ' + [...seen].join(',') };
  const a = genItem(makeRng(5), 'which'), b = genItem(makeRng(5), 'which');
  if (JSON.stringify(a.mol.groups) !== JSON.stringify(b.mol.groups)) return { ok: false, tried, notes: 'same seed gave a different item' };
  return { ok: true, tried, notes: `all 15 faces seen, classifier agrees, max ${maxNodes} chain atoms` };
}
