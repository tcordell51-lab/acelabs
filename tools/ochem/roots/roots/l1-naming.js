// The Roots of Organic · Level 1 · Root 6: Count your carbons, name the chain (IUPAC basics)
// ES module, no imports.

export const meta = {
  id: 'l1-naming',
  level: 1,
  order: 6,
  needs3D: false,
  title: 'Count your carbons, name the chain',
  concept: 'IUPAC naming basics',
  tagline: 'Longest chain, lowest numbers, alphabetical prefixes.',
  story: 'A name is a set of directions for drawing the molecule, so it has to be unambiguous. Start by finding the longest continuous chain of carbons, and count them: one is meth, two eth, three prop, four but, five pent, six hex, seven hept, eight oct. That count is the base name. Then number the chain from the end that gives the first substituent the lowest number. Anything hanging off the chain is a prefix (methyl, ethyl, chloro, bromo, fluoro), listed alphabetically, each with its number. The suffix tells you the main functional group: ane for a plain chain, ene for a double bond, yne for a triple, ol for an alcohol, al for an aldehyde, one for a ketone, oic acid for a carboxylic acid. Rule of thumb: longest chain, lowest numbers, alphabetical prefixes.',
  moveName: 'Longest chain, lowest numbers, alphabetical prefixes',
  move: [
    'Find the longest continuous carbon chain. It may turn a corner. Count it: that is the base name.',
    'Number from the end that gives the first point of difference the lowest number. A double bond or an OH gets numbered first.',
    'Name each branch as a prefix with its number, then put the prefixes in alphabetical order.',
    'Finish with the suffix: ane, ene, ol, and so on.'
  ],
  trap: 'Careful: the longest chain may turn a corner. The straight line the drawing hands you is not always the chain, so trace every path before you count.',
  holdsUp: ['Every question that names a product', 'Reagent recognition', 'Reading the answer choices', 'Spectroscopy structure problems'],
  drill: 'Booster OChem: IUPAC Nomenclature'
};

// ---------------------------------------------------------------- helpers
const L = 46;
const DEG = Math.PI / 180;
const SERIF = 'Georgia, "Times New Roman", serif';
const MONO = 'ui-monospace, "SF Mono", Menlo, monospace';
const BASE = ['', 'meth', 'eth', 'prop', 'but', 'pent', 'hex', 'hept', 'oct'];
const ALKYL = ['', 'methyl', 'ethyl', 'propyl'];
const HALO = { chloro: 'Cl', bromo: 'Br', fluoro: 'F' };
function vec(deg){ return [Math.cos(deg * DEG), Math.sin(deg * DEG)]; }
function makeRng(seed){
  let s = seed | 0;
  return function(){ s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
function ri(rng, a, b){ return a + Math.floor(rng() * (b - a + 1)); }
function pickR(rng, arr){ return arr[Math.floor(rng() * arr.length)]; }
function shuffleR(rng, arr){ const b = arr.slice(); for (let i = b.length - 1; i > 0; i--){ const j = Math.floor(rng() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; }

// ---------------------------------------------------------------- naming from a spec
// spec: { n, kind: 'ane'|'ene'|'ol', ol: position (kind ol), subs: [{ name, pos }] }
// The double bond of an alkene is always C1=C2 in canonical numbering. Positions are 1-based along the chain.
function locantsFor(spec, dir){
  const map = p => dir === 1 ? p : spec.n + 1 - p;
  const principal = spec.kind === 'ene' ? (dir === 1 ? 1 : spec.n - 1) : spec.kind === 'ol' ? map(spec.ol) : 0;
  const subs = spec.subs.map(s => map(s.pos)).sort((a, b) => a - b);
  return { principal, subs };
}
function cmpLoc(a, b){
  if (a.principal !== b.principal) return a.principal - b.principal;
  for (let i = 0; i < Math.min(a.subs.length, b.subs.length); i++) if (a.subs[i] !== b.subs[i]) return a.subs[i] - b.subs[i];
  return 0;
}
// which direction numbers the chain: 1, -1, or 0 for a tie
function bestDir(spec){ const c = cmpLoc(locantsFor(spec, 1), locantsFor(spec, -1)); return c < 0 ? 1 : c > 0 ? -1 : 0; }
function prefixes(spec, dir, opts){
  const map = p => dir === 1 ? p : spec.n + 1 - p;
  const groups = {};
  for (const s of spec.subs) (groups[s.name] || (groups[s.name] = [])).push(map(s.pos));
  let names = Object.keys(groups).sort();
  if (opts && opts.swapOrder && names.length === 2) names = [names[1], names[0]];
  return names.map(nm => groups[nm].sort((a, b) => a - b).join(',') + '-' + (groups[nm].length === 2 ? 'di' : '') + nm).join('-');
}
function assemble(spec, dir, opts){
  opts = opts || {};
  const map = p => dir === 1 ? p : spec.n + 1 - p;
  const n = opts.n || spec.n;
  const base = BASE[n];
  let kind = opts.kind || spec.kind;
  let tail;
  if (kind === 'ane') tail = base + 'ane';
  else if (kind === 'ene') tail = base + '-' + (dir === 1 ? 1 : spec.n - 1) + '-ene';
  else if (kind === 'ol') tail = base + 'an-' + map(spec.ol) + '-ol';
  else if (kind === 'one') tail = base + 'an-' + map(spec.ol) + '-one';
  else if (kind === 'eneNoLocant') tail = base + 'ene';
  const pre = prefixes(spec, dir, opts);
  return pre ? pre + tail : tail;
}
function correctName(spec){ const d = bestDir(spec); return d === 0 ? null : assemble(spec, d); }

// ---------------------------------------------------------------- generator
function genSpec(rng){
  for (let attempt = 0; attempt < 500; attempt++){
    const n = ri(rng, 4, 7);
    const kind = pickR(rng, ['ane', 'ane', 'ene', 'ol']);
    const spec = { n, kind, ol: 0, subs: [] };
    const used = new Set();
    if (kind === 'ol'){ spec.ol = ri(rng, 1, n); used.add(spec.ol); }
    const nSub = rng() < 0.55 ? 2 : 1;
    let ok = true;
    for (let s = 0; s < nSub; s++){
      const name = pickR(rng, ['methyl', 'methyl', 'methyl', 'ethyl', 'chloro', 'bromo', 'fluoro']);
      let cands = [];
      if (name === 'methyl'){ for (let p = 2; p <= n - 1; p++) cands.push(p); }
      else if (name === 'ethyl'){ if (n === 7) cands.push(4); }            // the only place an ethyl leaves the drawn chain strictly longest
      else { for (let p = 1; p <= n; p++) cands.push(p); }
      if (kind === 'ene') cands = cands.filter(p => name === 'methyl' ? p >= 2 : p >= 3);   // nothing on C1; only a methyl on C2
      cands = cands.filter(p => !used.has(p));
      if (!cands.length){ ok = false; break; }
      const pos = pickR(rng, cands); used.add(pos); spec.subs.push({ name, pos });
    }
    if (!ok) continue;
    if (spec.subs.some(s => s.name === 'ethyl') && spec.subs.length < 2) continue;   // 4-ethylheptane alone is symmetric
    if (bestDir(spec) === 0) continue;                                              // no ties, ever
    // a halogen on a terminal carbon next to a methyl-bearing carbon makes a second chain of equal length
    // that only the "more substituents" rule can settle; keep that out of a Level 1 root
    const methylAt = q => spec.subs.some(s => s.name === 'methyl' && s.pos === q);
    const haloAt = q => spec.subs.some(s => HALO[s.name] && s.pos === q);
    if ((haloAt(1) && methylAt(2)) || (haloAt(n) && methylAt(n - 1))) continue;
    spec.subs.sort((a, b) => a.pos - b.pos);
    return spec;
  }
  return null;
}

// ---------------------------------------------------------------- the molecular graph
// carbons: [{ label: 'C', nbrs: [{ to, order }], pend: null | 'OH' | 'Cl' | 'Br' | 'F', chainPos: 1..n or 0 }]
function buildGraph(spec){
  const C = [];
  const addC = (chainPos) => { C.push({ nbrs: [], pend: null, chainPos }); return C.length - 1; };
  const bond = (a, b, order) => { C[a].nbrs.push({ to: b, order }); C[b].nbrs.push({ to: a, order }); };
  const chain = [];
  for (let p = 1; p <= spec.n; p++) chain.push(addC(p));
  for (let p = 1; p < spec.n; p++) bond(chain[p - 1], chain[p], spec.kind === 'ene' && p === 1 ? 2 : 1);
  if (spec.kind === 'ol') C[chain[spec.ol - 1]].pend = 'OH';
  const branches = [];   // { at: chain index, carbons: [idx...] }
  for (const s of spec.subs){
    const at = chain[s.pos - 1];
    if (HALO[s.name]) C[at].pend = HALO[s.name];
    else { const len = s.name === 'methyl' ? 1 : 2; const ids = []; let prev = at; for (let k = 0; k < len; k++){ const c = addC(0); bond(prev, c, 1); ids.push(c); prev = c; } branches.push({ at, carbons: ids }); }
  }
  return { C, chain, branches };
}

// Independent recount: name the molecule from the graph alone (longest chain, principal group, lowest locants).
function nameFromGraph(G, kind){
  const C = G.C, n = C.length;
  const leaves = C.map((c, i) => c.nbrs.length === 1 ? i : -1).filter(i => i >= 0);
  const pathBetween = (a, b) => {
    const prev = new Array(n).fill(-1); const seen = new Array(n).fill(false); const q = [a]; seen[a] = true;
    while (q.length){ const u = q.shift(); if (u === b) break; for (const e of c_nbrs(u)){ if (!seen[e.to]){ seen[e.to] = true; prev[e.to] = u; q.push(e.to); } } }
    const path = []; for (let v = b; v !== -1; v = prev[v]) path.push(v); return path.reverse();
  };
  const c_nbrs = u => C[u].nbrs;
  const orderOf = (a, b) => C[a].nbrs.find(e => e.to === b).order;
  // the principal chain must carry the principal group; only then take the longest
  const carries = path => {
    if (kind === 'ol') return path.some(v => C[v].pend === 'OH');
    if (kind === 'ene'){ for (let i = 0; i + 1 < path.length; i++) if (orderOf(path[i], path[i + 1]) === 2) return true; return false; }
    return true;
  };
  let best = 0; const paths = [];
  for (let i = 0; i < leaves.length; i++) for (let j = i + 1; j < leaves.length; j++){ const p = pathBetween(leaves[i], leaves[j]); if (!carries(p)) continue; if (p.length > best){ best = p.length; paths.length = 0; } if (p.length === best) paths.push(p); }
  const nameFor = path => {
    const m = path.length; const inPath = new Set(path);
    // principal features
    const dbl = []; for (let i = 0; i + 1 < m; i++) if (orderOf(path[i], path[i + 1]) === 2) dbl.push(i);
    const ohs = path.map((v, i) => C[v].pend === 'OH' ? i : -1).filter(i => i >= 0);
    if (kind === 'ene' && dbl.length !== 1) return null;
    if (kind === 'ol' && ohs.length !== 1) return null;
    if (kind === 'ane' && (dbl.length || ohs.length)) return null;
    // substituents
    const subs = [];
    for (let i = 0; i < m; i++){
      const v = path[i];
      if (C[v].pend && C[v].pend !== 'OH') subs.push({ i, name: Object.keys(HALO).find(k => HALO[k] === C[v].pend) });
      for (const e of C[v].nbrs){
        if (inPath.has(e.to)) continue;
        // walk the branch: must be a plain linear chain without pendants
        let len = 0, prev = v, cur = e.to, okb = true;
        while (true){ len++; if (C[cur].pend) okb = false; const nxt = C[cur].nbrs.filter(x => x.to !== prev); if (nxt.length > 1) okb = false; if (!nxt.length) break; prev = cur; cur = nxt[0].to; if (len > 3) { okb = false; break; } }
        if (!okb || !ALKYL[len]) return null;
        subs.push({ i, name: ALKYL[len] });
      }
    }
    const spec = { n: m, kind, ol: kind === 'ol' ? ohs[0] + 1 : 0, subs: subs.map(s => ({ name: s.name, pos: s.i + 1 })) };
    if (kind === 'ene'){ if (dbl[0] === 0) { /* canonical direction */ } else if (dbl[0] === m - 2){ spec.subs = spec.subs.map(s => ({ name: s.name, pos: m + 1 - s.pos })); } else return null; }
    const d = bestDir(spec); if (d === 0) return 'TIE';
    return assemble(spec, d);
  };
  const names = new Set(paths.map(nameFor));
  if (names.size !== 1) return null;
  return [...names][0];
}

// ---------------------------------------------------------------- drawing plan: pick the spine
// The spine is the path drawn as the horizontal zigzag. Straight: the main chain. Corner: the chain re-rooted
// through a methyl or ethyl branch, leaving a plain arm of 2 or 3 carbons hanging off, so the drawn line is
// not the longest chain. plan: { spine: [carbon idx], corner: bool, naive: name or null }
function planDrawing(spec, G, rng){
  const { C, chain, branches } = G;
  const options = [];
  for (const br of branches){
    const p = C[br.at].chainPos, len = br.carbons.length;
    if (p < 3 || p > spec.n - 2) continue;                        // alt chain must be strictly shorter
    const left = p - 1, right = spec.n - p;
    const sides = left > right ? ['right'] : right > left ? ['left'] : ['left', 'right'];   // leftover = shorter arm
    for (const leftover of sides){
      const armPos = leftover === 'left' ? Array.from({ length: left }, (_, i) => p - 1 - i) : Array.from({ length: right }, (_, i) => p + 1 + i);
      const plain = armPos.every(q => !C[chain[q - 1]].pend && !branches.some(b => b.at === chain[q - 1]) && !(spec.kind === 'ene' && (q === 1 || q === 2)));
      if (!plain) continue;
      const longPos = leftover === 'left' ? Array.from({ length: right }, (_, i) => p + 1 + i) : Array.from({ length: left }, (_, i) => p - 1 - i);
      const spine = [...br.carbons.slice().reverse(), br.at, ...longPos.map(q => chain[q - 1])];
      if (spine.length >= spec.n) continue;
      options.push({ spine, corner: true, arm: armPos.map(q => chain[q - 1]), branchLen: len });
    }
  }
  if (options.length && rng() < 0.6) return pickR(rng, options);
  return { spine: chain.slice(), corner: false };
}
// The name a student writes when they take the drawn spine as the chain (only for corner drawings).
function naiveName(spec, G, plan){
  if (!plan.corner) return null;
  const { C } = G;
  const m = plan.spine.length;
  const pos = idx => plan.spine.indexOf(idx) + 1;
  const subs = [{ name: ALKYL[plan.arm.length], pos: pos(plan.arm[0] === undefined ? 0 : plan.spine[plan.branchLen]) }];
  // the arm hangs off the old branch carbon, which sits at spine position branchLen + 1
  subs[0].pos = plan.branchLen + 1;
  let kind = spec.kind, ol = 0;
  for (const s of spec.subs){
    const at = G.chain[s.pos - 1];
    if (!plan.spine.includes(at)) continue;                       // the branch we rerooted through is now chain
    if (HALO[s.name]) subs.push({ name: s.name, pos: pos(at) });
  }
  if (kind === 'ol'){ const at = G.chain[spec.ol - 1]; if (!plan.spine.includes(at)) return null; ol = pos(at); }
  if (kind === 'ene'){
    const a = pos(G.chain[0]), b = pos(G.chain[1]);
    if (!a || !b) return null;
    if (Math.min(a, b) === 1){ /* canonical */ } else if (Math.max(a, b) === m){ /* reversed */ } else return null;
  }
  const ns = { n: m, kind, ol, subs };
  if (kind === 'ene' && pos(G.chain[0]) !== 1){ ns.subs = ns.subs.map(s => ({ name: s.name, pos: m + 1 - s.pos })); if (ol) ns.ol = m + 1 - ol; }
  let d = bestDir(ns); if (d === 0) d = 1;
  return assemble(ns, d);
}

// ---------------------------------------------------------------- distractors
function distractors(spec, G, plan, correct){
  const d = bestDir(spec);
  const out = [];
  const push = (name, why) => { if (name && name !== correct && !out.some(o => o.name === name)) out.push({ name, why }); };
  push(assemble(spec, -d), 'end');
  push(naiveName(spec, G, plan), 'chain');
  if (!plan.corner){
    // route through a methyl branch that gives a strictly shorter chain: the classic 2-ethylpentane miss
    for (const br of G.branches){
      const p = G.C[br.at].chainPos; if (p < 3 || p > spec.n - 2) continue;
      const fake = planDrawing(spec, G, () => 0);   // deterministic: first option
      if (fake.corner) push(naiveName(spec, G, fake), 'chain');
    }
  }
  const names = new Set(spec.subs.map(s => s.name));
  if (names.size === 2) push(assemble(spec, d, { swapOrder: true }), 'order');
  push(assemble(spec, d, { kind: spec.kind === 'ane' ? 'eneNoLocant' : spec.kind === 'ene' ? 'ane' : 'one' }), 'suffix');
  push(assemble(spec, d, { n: spec.n + 1 }), 'count');
  push(assemble(spec, d, { n: spec.n - 1 }), 'count');
  return out.slice(0, 3);
}

// ---------------------------------------------------------------- layout (tree: spine + branches)
function layout(spec, G, plan){
  const { C } = G;
  const pos = new Array(C.length).fill(null);
  const spine = plan.spine, m = spine.length;
  const dx = L * Math.cos(30 * DEG), dy = L * Math.sin(30 * DEG);
  spine.forEach((idx, i) => { pos[idx] = { x: i * dx, y: (i % 2) * dy }; });
  const onSpine = new Set(spine);
  const freeDir = i => (i % 2 === 0 ? 270 : 90);
  const cont = i => i === m - 1 ? (((m - 1) % 2 === 0) ? 30 : -30) : 150;
  const pend = [];   // { at, x, y, label }
  const placed = () => pos.filter(Boolean);
  spine.forEach((idx, i) => {
    const c = C[idx];
    // pendant label
    if (c.pend){
      const terminal = i === 0 || i === m - 1;
      const d = terminal && c.nbrs.filter(e => !onSpine.has(e.to)).length === 0 ? vec(cont(i)) : vec(freeDir(i));
      pend.push({ at: idx, x: pos[idx].x + d[0] * L, y: pos[idx].y + d[1] * L, label: c.pend });
    }
    // branches: walk off-spine neighbors as a linear chain
    for (const e of c.nbrs){
      if (onSpine.has(e.to)) continue;
      let dir = freeDir(i); let prev = idx, cur = e.to, k = 0;
      let side = 0;
      while (cur != null){
        let d;
        if (k === 0) d = dir;
        else {
          if (k === 1){
            // choose the turn that keeps the branch farthest from everything already placed
            const cands = [dir + 60, dir - 60].map(a => { const v = vec(a); const x = pos[prev].x + v[0] * L, y = pos[prev].y + v[1] * L; const dmin = Math.min(...placed().map(p => Math.hypot(p.x - x, p.y - y))); return { a, dmin }; });
            cands.sort((p, q) => q.dmin - p.dmin); side = cands[0].a - dir; d = cands[0].a;
          } else d = (k % 2 === 1) ? dir + side : dir;
        }
        const v = vec(d);
        pos[cur] = { x: pos[prev].x + v[0] * L, y: pos[prev].y + v[1] * L };
        if (C[cur].pend){ const pv = vec(d); pend.push({ at: cur, x: pos[cur].x + pv[0] * L, y: pos[cur].y + pv[1] * L, label: C[cur].pend }); }
        const nxt = C[cur].nbrs.filter(x => x.to !== prev);
        prev = cur; cur = nxt.length ? nxt[0].to : null; k++;
      }
    }
  });
  return { pos, pend };
}

function labelRadius(label){ return label.length === 2 ? 13 : label === 'F' ? 8 : 10; }

// ---------------------------------------------------------------- drawing
// opts: { ends: bool (tappable chain ends), onEnd(which: 1|-1) }
function drawMol(api, spec, G, plan, opts){
  const C = api.colors, svg = api.svg;
  opts = opts || {};
  const lay = layout(spec, G, plan);
  const P = lay.pos;
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  const addP = (x, y, r) => { x0 = Math.min(x0, x - r); y0 = Math.min(y0, y - r); x1 = Math.max(x1, x + r); y1 = Math.max(y1, y + r); };
  P.forEach(p => addP(p.x, p.y, 20)); lay.pend.forEach(p => addP(p.x, p.y, 20));
  const pad = 12, bw = x1 - x0 + 2 * pad, bh = y1 - y0 + 2 * pad;
  const w = Math.max(bw, 520), h = Math.max(bh, 160);
  const ox = x0 - pad - (w - bw) / 2, oy = y0 - pad - (h - bh) / 2;
  const root = svg('svg', { viewBox: `${ox.toFixed(1)} ${oy.toFixed(1)} ${w.toFixed(1)} ${h.toFixed(1)}`, role: 'img', 'aria-label': 'a branched molecule to name', style: { width: '100%', maxHeight: '340px', display: 'block' } });
  const gBonds = svg('g', { fill: 'none', stroke: C.ink, 'stroke-width': 2.6, 'stroke-linecap': 'round' }), gText = svg('g'), gNum = svg('g'), gHit = svg('g');
  root.append(gBonds, gText, gNum, gHit);
  const tr = api.reduced ? 'none' : 'stroke .25s ease, opacity .25s ease';
  const line = (a, b, attrs) => { const l = svg('line', Object.assign({ x1: a.x.toFixed(1), y1: a.y.toFixed(1), x2: b.x.toFixed(1), y2: b.y.toFixed(1) }, attrs || {})); l.style.transition = tr; return l; };
  const chainSet = new Set(G.chain);
  const chainLines = [];
  const done = new Set();
  G.C.forEach((c, i) => {
    for (const e of c.nbrs){
      const key = Math.min(i, e.to) + ':' + Math.max(i, e.to); if (done.has(key)) continue; done.add(key);
      const a = P[i], b = P[e.to];
      const l = line(a, b); gBonds.append(l);
      const onChain = chainSet.has(i) && chainSet.has(e.to);
      if (onChain) chainLines.push(l);
      if (e.order === 2){
        const vx = b.x - a.x, vy = b.y - a.y, len = Math.hypot(vx, vy); let nx = -vy / len, ny = vx / len;
        // second line toward the rest of the molecule
        const other = [i, e.to].flatMap(v => G.C[v].nbrs.map(x => x.to)).find(v => v !== i && v !== e.to);
        if (other != null){ const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2; if ((P[other].x - mx) * nx + (P[other].y - my) * ny < 0){ nx = -nx; ny = -ny; } }
        const off = 6.5, sh = 0.16;
        const l2 = line({ x: a.x + vx * sh + nx * off, y: a.y + vy * sh + ny * off }, { x: b.x - vx * sh + nx * off, y: b.y - vy * sh + ny * off }); gBonds.append(l2);
        if (onChain) chainLines.push(l2);
      }
    }
  });
  for (const p of lay.pend){
    const a = P[p.at]; const vx = p.x - a.x, vy = p.y - a.y, len = Math.hypot(vx, vy); const r = labelRadius(p.label);
    gBonds.append(line(a, { x: p.x - vx / len * r, y: p.y - vy / len * r }));
    gText.append(svg('text', { x: p.x.toFixed(1), y: p.y.toFixed(1), fill: C.ink, 'font-family': SERIF, 'font-size': 18, 'text-anchor': 'middle', 'dominant-baseline': 'central', text: p.label }));
  }
  // chain end targets
  const endEls = {};
  if (opts.ends){
    for (const [which, idx] of [[1, G.chain[0]], [-1, G.chain[spec.n - 1]]]){
      const p = P[idx];
      const g = svg('g', { role: 'button', tabindex: 0, 'aria-label': which === 1 ? 'number the chain from this end' : 'number the chain from the other end', style: { cursor: 'pointer', outline: 'none' } });
      const ring = svg('circle', { cx: p.x.toFixed(1), cy: p.y.toFixed(1), r: 13, fill: C.gold, 'fill-opacity': 0.08, stroke: C.gold, 'stroke-width': 1.6, 'stroke-dasharray': '3 3', 'stroke-opacity': 0.75, style: { transition: tr } });
      const hit = svg('circle', { cx: p.x.toFixed(1), cy: p.y.toFixed(1), r: 20, fill: 'transparent', style: { pointerEvents: 'all' } });
      g.append(ring, hit); gHit.append(g);
      const fire = () => opts.onEnd && opts.onEnd(which);
      g.addEventListener('click', fire);
      g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); fire(); } });
      g.addEventListener('mouseenter', () => ring.setAttribute('stroke-opacity', 1));
      g.addEventListener('mouseleave', () => ring.setAttribute('stroke-opacity', 0.75));
      endEls[which] = ring;
    }
  }
  return {
    svg: root,
    highlightChain(on){ for (const l of chainLines) l.setAttribute('stroke', on ? C.gold : C.ink); },
    number(fromDir, color){
      while (gNum.firstChild) gNum.removeChild(gNum.firstChild);
      if (!fromDir) return;
      G.chain.forEach((idx, i) => {
        const num = fromDir === 1 ? i + 1 : spec.n - i;
        const p = P[idx];
        // put the digit on the open side of the carbon
        const used = G.C[idx].nbrs.map(e => Math.atan2(P[e.to].y - p.y, P[e.to].x - p.x) / DEG);
        lay.pend.filter(q => q.at === idx).forEach(q => used.push(Math.atan2(q.y - p.y, q.x - p.x) / DEG));
        const norm = a => ((a % 360) + 360) % 360;
        const u = used.map(norm).sort((a, b) => a - b);
        let best = 0, bestGap = -1;
        for (let k = 0; k < u.length; k++){ const nxt = k + 1 < u.length ? u[k + 1] : u[0] + 360; const gap = nxt - u[k]; if (gap > bestGap){ bestGap = gap; best = u[k] + gap / 2; } }
        const v = vec(best);
        const dist = (i === 0 || i === spec.n - 1) ? 22 : 17;   // terminal digits clear the end rings
        const t = svg('text', { x: (p.x + v[0] * dist).toFixed(1), y: (p.y + v[1] * dist).toFixed(1), fill: color, 'font-family': MONO, 'font-size': 13, 'font-weight': 700, 'text-anchor': 'middle', 'dominant-baseline': 'central', text: String(num) });
        gNum.append(t);
      });
      for (const [which, ring] of Object.entries(endEls)) ring.setAttribute('stroke-dasharray', Number(which) === fromDir ? '0' : '3 3');
    }
  };
}

// ---------------------------------------------------------------- items
function genItem(rng){
  for (let t = 0; t < 50; t++){
    const spec = genSpec(rng); if (!spec) continue;
    const G = buildGraph(spec);
    const plan = planDrawing(spec, G, rng);
    const correct = correctName(spec);
    const misses = distractors(spec, G, plan, correct);
    if (misses.length < 3) continue;
    const choices = shuffleR(rng, [{ name: correct, ok: true, why: 'right' }, ...misses.map(w => ({ name: w.name, ok: false, why: w.why }))]);
    return { spec, G, plan, correct, choices };
  }
  return null;
}
const COACH = {
  end: 'Number from the end that gives the first point of difference the lowest number, and check both ends before you commit.',
  chain: 'The longest chain turns a corner here: trace every path through the branches and count the longest one, not the straight line.',
  order: 'Prefixes go in alphabetical order no matter what their numbers are.',
  suffix: 'The suffix names the main group: ane for a plain chain, ene for a double bond, ol for an alcohol.',
  count: 'Count your carbons along the longest chain, 1-2-3-4, and match the count to the base name.'
};

// ---------------------------------------------------------------- mount
export function mount(slots, api){
  const C = api.colors, el = api.el;

  // ---- VISUAL
  let spec = null, G = null, plan = null, drawn = null, from = 0, chainOn = false;
  const stage = el('div', {});
  const ledger = el('div', { style: { fontFamily: MONO, fontSize: '13px', color: C.ink2, marginTop: '10px', display: 'flex', gap: '18px', flexWrap: 'wrap', letterSpacing: '.02em' } });
  const nameLine = el('div', { style: { fontFamily: SERIF, fontSize: '17px', color: C.ink, minHeight: '1.6em', marginTop: '6px' } });
  const chipChain = el('button', { class: 'chip', type: 'button', 'aria-pressed': 'false', text: 'Show the longest chain', onclick(){ chainOn = !chainOn; chipChain.setAttribute('aria-pressed', String(chainOn)); drawn.highlightChain(chainOn); } });
  const btnNew = el('button', { class: 'secondary', type: 'button', text: 'New molecule', onclick: fresh });
  const hint = el('span', { style: { fontFamily: MONO, fontSize: '12px', color: C.ink3, marginLeft: 'auto' }, text: 'tap either end of the longest chain' });
  slots.visual.append(stage, ledger, nameLine, el('div', { class: 'controls' }, chipChain, btnNew, hint));

  const val = (t, color) => el('b', { text: t, style: { color, fontWeight: 600 } });
  function setLedger(){
    while (ledger.firstChild) ledger.removeChild(ledger.firstChild);
    while (nameLine.firstChild) nameLine.removeChild(nameLine.firstChild);
    const best = bestDir(spec);
    const fmt = loc => (spec.kind === 'ene' ? `double bond at ${loc.principal}` : spec.kind === 'ol' ? `OH at ${loc.principal}` : '') + (loc.subs.length ? (spec.kind === 'ane' ? '' : ', ') + 'branches at ' + loc.subs.join(', ') : '');
    if (!from){ ledger.append(el('span', { text: `Longest chain: ${spec.n} carbons (${BASE[spec.n]}). Tap an end to number it.` })); return; }
    const mine = locantsFor(spec, from), other = locantsFor(spec, -from);
    const win = from === best;
    ledger.append(el('span', {}, 'From this end: ', val(fmt(mine), win ? C.goldhi : C.ink2)));
    ledger.append(el('span', {}, 'From the other end: ', val(fmt(other), win ? C.ink2 : C.goldhi)));
    ledger.append(el('span', {}, 'Lower set: ', val(win ? 'this end' : 'the other end', C.goldhi)));
    nameLine.append(win ? 'Numbered from the lower end, the name is ' : 'The other end gives lower numbers. The name is ', val(correctName(spec), C.goldhi), '.');
  }
  function fresh(){
    let it = null; for (let t = 0; t < 50 && !it; t++) it = genItem(api.rng);
    spec = it.spec; G = it.G; plan = it.plan; from = 0;
    while (stage.firstChild) stage.removeChild(stage.firstChild);
    drawn = drawMol(api, spec, G, plan, { ends: true, onEnd(which){ from = which; drawn.number(which, which === bestDir(spec) ? C.goldhi : C.ink2); setLedger(); } });
    stage.append(drawn.svg);
    drawn.highlightChain(chainOn);
    setLedger();
  }
  fresh();

  // ---- YOU TRY
  runTry(slots.try, api, () => {
    const it = genItem(api.rng);
    const d = drawMol(api, it.spec, it.G, it.plan, {});
    return { prompt: 'Which is the correct name for this molecule?', node: d.svg, mode: 'choices',
      choices: it.choices.map(c => ({ text: c.name, ok: c.ok, coach: COACH[c.why] || COACH.end })),
      coach: 'Longest chain, lowest numbers, alphabetical prefixes.' };
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
    const opts = el('div', { class: 'opts' });
    const btns = []; let picked = -1;
    const check = el('button', { class: 'primary', type: 'button', text: 'Check', onclick(){
      if (picked < 0 || done) return;
      const c = item.choices[picked];
      if (c.ok){ btns[picked].classList.add('ok'); btns.forEach(x => { x.disabled = true; }); check.remove(); settle(true); }
      else { btns[picked].classList.remove('picked'); btns[picked].disabled = true; picked = -1; check.disabled = true; api.coach(c.coach || item.coach); settle(false); }
    } });
    check.disabled = true;
    item.choices.forEach((c, i) => {
      const bt = el('button', { class: 'opt', type: 'button', style: { fontFamily: SERIF, fontSize: '17px' }, onclick(){ if (done) return; picked = i; btns.forEach((x, j) => x.classList.toggle('picked', j === i)); check.disabled = false; } },
        el('span', { class: 'k', text: 'ABCD'[i] }), el('span', { text: c.text }));
      btns.push(bt); opts.append(bt);
    });
    box.append(opts, verdict, actions);
    actions.append(check);
    host.append(box);
    if (host.dataset.started) btns[0].focus();
    host.dataset.started = '1';
  }
  show();
}

// ---------------------------------------------------------------- selfTest (node-safe)
export function selfTest(){
  const rng = makeRng(20260903);
  let tried = 0, corners = 0, ethyls = 0; const kinds = new Set(); const whys = new Set();
  for (let k = 0; k < 260; k++){
    const it = genItem(rng);
    if (!it) return { ok: false, tried, notes: 'no item generated' };
    const { spec, G, plan, correct, choices } = it;
    if (!correct) return { ok: false, tried, notes: 'tie slipped through' };
    // four distinct names, exactly one correct
    if (new Set(choices.map(c => c.name)).size !== 4) return { ok: false, tried, notes: 'names not distinct: ' + choices.map(c => c.name).join(' | ') };
    if (choices.filter(c => c.ok).length !== 1) return { ok: false, tried, notes: 'correct not unique' };
    // the independent recount from the graph agrees
    const recount = nameFromGraph(G, spec.kind);
    if (recount !== correct) return { ok: false, tried, notes: `graph says ${recount}, spec says ${correct}` };
    // every distractor is not the graph name
    if (choices.some(c => !c.ok && c.name === recount)) return { ok: false, tried, notes: 'a distractor is actually right' };
    // chemistry: every carbon at most four bonds; one thing per chain carbon
    for (const c of G.C){ const v = c.nbrs.reduce((s, e) => s + e.order, 0) + (c.pend ? 1 : 0); if (v > 4) return { ok: false, tried, notes: 'carbon over four' }; }
    // the drawn spine is a real path and, for corners, strictly shorter than the chain
    for (let i = 0; i + 1 < plan.spine.length; i++) if (!G.C[plan.spine[i]].nbrs.some(e => e.to === plan.spine[i + 1])) return { ok: false, tried, notes: 'spine not a path' };
    if (plan.corner && plan.spine.length >= spec.n) return { ok: false, tried, notes: 'corner spine not shorter' };
    if (!plan.corner && plan.spine.length !== spec.n) return { ok: false, tried, notes: 'straight spine length off' };
    // layout places every carbon, nothing on top of anything
    const lay = layout(spec, G, plan);
    if (lay.pos.some(p => !p)) return { ok: false, tried, notes: 'carbon not placed' };
    const pts = [...lay.pos, ...lay.pend];
    for (let a = 0; a < pts.length; a++) for (let b = a + 1; b < pts.length; b++) if (Math.hypot(pts[a].x - pts[b].x, pts[a].y - pts[b].y) < L * 0.6) return { ok: false, tried, notes: 'atoms drawn on top of each other in ' + correct };
    if (plan.corner) corners++;
    if (spec.subs.some(s => s.name === 'ethyl')) ethyls++;
    kinds.add(spec.kind); choices.forEach(c => whys.add(c.why));
    tried++;
  }
  const a = genItem(makeRng(9)), b = genItem(makeRng(9));
  if (a.correct !== b.correct) return { ok: false, tried, notes: 'same seed gave a different item' };
  if (kinds.size !== 3 || !corners) return { ok: false, tried, notes: 'domain too narrow' };
  return { ok: true, tried, notes: `graph recount agrees; ${corners} corner drawings, ${ethyls} ethyls; distractor kinds: ${[...whys].filter(w => w !== 'right').join(', ')}` };
}
