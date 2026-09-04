// The Roots of Organic: l1-geometry. Hybridization and geometry from electron domains.
// No imports. The shell passes THREE in api when meta.needs3D is true.

export const meta = {
  id: 'l1-geometry',
  level: 1,
  order: 3,
  needs3D: true,
  title: 'Peace sign, tripod, straight line',
  concept: 'Hybridization and geometry',
  tagline: 'Count the domains, not the bonds.',
  story: 'Every atom is shaped by how many things are crowding around it. So count the electron domains: each bond counts once, whether it is single, double or triple, and each lone pair counts once. Four domains is sp3, tetrahedral, 109.5 degrees, a tripod. Three domains is sp2, trigonal planar, 120 degrees, a peace sign, a Mercedes sign, 360 over 3. Two domains is sp, linear, 180 degrees, a straight line. That is the whole table, right? The mistake people make is counting bonds instead of domains, and a double bond is one domain, not two. Rule of thumb: count the domains, not the bonds.',
  moveName: 'Count the domains, not the bonds',
  move: [
    'Pick the atom and count what is around it. Each bond is one domain, single, double or triple.',
    'Add one domain for each lone pair, even though nobody drew it.',
    'Four domains is sp3 and 109.5 degrees. Three is sp2 and 120. Two is sp and 180.',
    'Say the shape out loud: tripod, peace sign, straight line.'
  ],
  trap: 'Careful: a lone pair is a domain. The oxygen in water makes only two bonds, but it is sp3 and bent, because its two lone pairs are sitting right there taking up room.',
  holdsUp: ['The shape of every molecule', 'Alkene planarity', 'Carbocations are flat (sp2)', 'Why SN1 racemizes', 's-character and acidity'],
  drill: 'Booster OChem: The Fundamentals'
};

/* ------------------------------------------------------------------ */
/* Pure geometry (node-safe). Every molecule is grown from a spec with  */
/* ideal angles, so the 3D model, the lobes, the arcs and the you-try  */
/* all read from one table.                                            */
/* ------------------------------------------------------------------ */
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const vlen = a => Math.hypot(a[0], a[1], a[2]);
const unit = a => { const l = vlen(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const angleDeg = (a, b) => Math.acos(Math.max(-1, Math.min(1, dot(unit(a), unit(b))))) * 180 / Math.PI;
const COS_T = -1 / 3, SIN_T = Math.sqrt(8) / 3, S3 = Math.sqrt(3) / 2;

export const HYB = {
  sp3: { n: 4, angle: 109.5, shape: 'tetrahedral', nick: 'tripod' },
  sp2: { n: 3, angle: 120, shape: 'trigonal planar', nick: 'peace sign' },
  sp: { n: 2, angle: 180, shape: 'linear', nick: 'straight line' }
};
const HYB_BY_N = { 4: 'sp3', 3: 'sp2', 2: 'sp' };

// the directions left around an atom once one bond (a, unit, pointing away from the atom) is fixed
function remaining(hyb, a, u, v, phase){
  if (hyb === 'sp') return [mul(a, -1)];
  if (hyb === 'sp2') return [0, 1].map(k => { const p = phase + k * Math.PI; return unit(add(mul(a, -0.5), mul(add(mul(u, Math.cos(p)), mul(v, Math.sin(p))), S3))); });
  return [0, 1, 2].map(k => { const p = phase + k * 2 * Math.PI / 3; return unit(add(mul(a, COS_T), mul(add(mul(u, Math.cos(p)), mul(v, Math.sin(p))), SIN_T))); });
}
function azimuth(d, axis, u, v){ const p = sub(d, mul(axis, dot(d, axis))); if (vlen(p) < 1e-6) return 0; return Math.atan2(dot(p, v), dot(p, u)); }

export function buildMolecule(spec){
  const atoms = [], bonds = [];
  function place(node, pos, back, u, v, refDir, parentIdx, order){
    const idx = atoms.length;
    const A = { el: node.el, tag: node.tag || null, hyb: node.hyb || null, lp: node.lp || 0, pos, domains: [], heavy: node.el !== 'H' };
    atoms.push(A);
    if (!node.hyb){ A.domains.push({ dir: back, kind: 'bond', order: 1, to: parentIdx }); return idx; }
    let dirs, uu, vv;
    if (!back){
      uu = [0, 1, 0]; vv = [0, 0, 1]; const d0 = [1, 0, 0];
      dirs = [d0].concat(remaining(node.hyb, d0, uu, vv, node.ph || 0));
    } else {
      let up = sub(u, mul(back, dot(u, back))); if (vlen(up) < 1e-6) up = sub(v, mul(back, dot(v, back)));
      uu = unit(up); vv = unit(cross(back, uu));
      const az = azimuth(refDir, back, uu, vv);
      const off = node.ph != null ? node.ph : (node.hyb === 'sp3' ? Math.PI / 3 : 0);
      dirs = remaining(node.hyb, back, uu, vv, az + off);
      A.domains.push({ dir: back, kind: 'bond', order, to: parentIdx });
    }
    const kids = node.kids || [];
    if (kids.length + (node.lp || 0) !== dirs.length) throw new Error('domain count mismatch at ' + (node.tag || node.el));
    kids.forEach((kid, k) => {
      const d = dirs[k], cpos = add(pos, mul(d, kid.len));
      const others = (back ? [back] : []).concat(dirs.filter((x, i) => i !== k));
      const cidx = place(kid, cpos, mul(d, -1), uu, vv, others[0], idx, kid.order || 1);
      bonds.push({ a: idx, b: cidx, order: kid.order || 1 });
      A.domains.push({ dir: d, kind: 'bond', order: kid.order || 1, to: cidx });
    });
    for (let k = kids.length; k < dirs.length; k++) A.domains.push({ dir: dirs[k], kind: 'lp' });
    return idx;
  }
  place(spec, [0, 0, 0], null, null, null, null, -1, 1);
  return { atoms, bonds };
}
export const hybOf = atom => HYB_BY_N[atom.domains.length] || null;

const H = (len = 1.09) => ({ el: 'H', len, order: 1 });
export const SPECS = {
  propene: { name: 'Propene', line: 'a double bond, then a methyl', focus: 'C2',
    root: { el: 'C', tag: 'C1', hyb: 'sp2', kids: [{ el: 'C', tag: 'C2', hyb: 'sp2', len: 1.34, order: 2, kids: [{ el: 'C', tag: 'C3', hyb: 'sp3', len: 1.5, order: 1, kids: [H(), H(), H()] }, H()] }, H(), H()] },
    flat: { C1: [0, 0.3], C2: [1, -0.3], C3: [2, 0.3] } },
  ethanol: { name: 'Ethanol', line: 'two carbons and an OH', focus: 'O',
    root: { el: 'C', tag: 'C1', hyb: 'sp3', kids: [{ el: 'C', tag: 'C2', hyb: 'sp3', len: 1.54, order: 1, kids: [{ el: 'O', tag: 'O', hyb: 'sp3', lp: 2, len: 1.43, order: 1, kids: [H(0.96)] }, H(), H()] }, H(), H(), H()] },
    flat: { C1: [0, 0.3], C2: [1, -0.3], O: [2, 0.3] } },
  acetone: { name: 'Acetone', line: 'a carbonyl with two methyls', focus: 'C2',
    root: { el: 'C', tag: 'C2', hyb: 'sp2', kids: [{ el: 'O', tag: 'O', hyb: 'sp2', lp: 2, len: 1.22, order: 2 }, { el: 'C', tag: 'C1', hyb: 'sp3', len: 1.51, order: 1, kids: [H(), H(), H()] }, { el: 'C', tag: 'C3', hyb: 'sp3', len: 1.51, order: 1, kids: [H(), H(), H()] }] },
    flat: { C2: [1, 0], O: [1, 1], C1: [0.1, -0.55], C3: [1.9, -0.55] } },
  propyne: { name: 'Propyne', line: 'a methyl on a triple bond', focus: 'C2',
    root: { el: 'C', tag: 'C2', hyb: 'sp', kids: [{ el: 'C', tag: 'C1', hyb: 'sp', len: 1.2, order: 3, kids: [H(1.06)] }, { el: 'C', tag: 'C3', hyb: 'sp3', len: 1.46, order: 1, kids: [H(), H(), H()] }] },
    flat: { C1: [0, 0], C2: [1.1, 0], C3: [2.2, 0] } },
  acetonitrile: { name: 'Acetonitrile', line: 'a methyl, then carbon triple-bonded to nitrogen', focus: 'N',
    root: { el: 'C', tag: 'C2', hyb: 'sp', kids: [{ el: 'N', tag: 'N', hyb: 'sp', lp: 1, len: 1.16, order: 3 }, { el: 'C', tag: 'C1', hyb: 'sp3', len: 1.46, order: 1, kids: [H(), H(), H()] }] },
    flat: { C1: [0, 0], C2: [1.1, 0], N: [2.2, 0] } },
  methylamine: { name: 'Methylamine', line: 'a methyl on an NH2', focus: 'N',
    root: { el: 'C', tag: 'C', hyb: 'sp3', kids: [{ el: 'N', tag: 'N', hyb: 'sp3', lp: 1, len: 1.47, order: 1, kids: [H(1.01), H(1.01)] }, H(), H(), H()] },
    flat: { C: [0, 0.3], N: [1, -0.3] } },
  formaldehyde: { name: 'Formaldehyde', line: 'one carbon, one carbonyl', focus: 'C',
    root: { el: 'C', tag: 'C', hyb: 'sp2', kids: [{ el: 'O', tag: 'O', hyb: 'sp2', lp: 2, len: 1.21, order: 2 }, H(1.11), H(1.11)] },
    flat: { C: [0, 0], O: [1.1, 0] } },
  dimethylether: { name: 'Dimethyl ether', line: 'an oxygen between two methyls', focus: 'O',
    root: { el: 'C', tag: 'C1', hyb: 'sp3', kids: [{ el: 'O', tag: 'O', hyb: 'sp3', lp: 2, len: 1.41, order: 1, kids: [{ el: 'C', tag: 'C2', hyb: 'sp3', len: 1.41, order: 1, kids: [H(), H(), H()] }] }, H(), H(), H()] },
    flat: { C1: [0, 0.3], O: [1, -0.3], C2: [2, 0.3] } },
  allene: { name: 'Allene', line: 'two double bonds sharing one carbon', focus: 'C2',
    root: { el: 'C', tag: 'C2', hyb: 'sp', kids: [{ el: 'C', tag: 'C1', hyb: 'sp2', len: 1.31, order: 2, kids: [H(), H()] }, { el: 'C', tag: 'C3', hyb: 'sp2', len: 1.31, order: 2, ph: Math.PI / 2, kids: [H(), H()] }] },
    flat: { C1: [0, 0], C2: [1.1, 0], C3: [2.2, 0] } }
};
export const ORDER = Object.keys(SPECS);
const MOLS = {};
for (const k of ORDER) MOLS[k] = buildMolecule(SPECS[k].root);
export const molecule = key => MOLS[key];

/* ---------- the flat drawing (what the test shows you) ---------- */
function placeH(existing, m, bent){
  const out = [];
  if (!existing.length){ for (let k = 0; k < m; k++) out.push(90 + k * 360 / m); return out; }
  if (existing.length === 1){
    const a = existing[0];
    if (m === 1) return [a + (bent ? 120 : 180)];
    for (let k = 1; k <= m; k++) out.push(a + 360 * k / (m + 1));
    return out;
  }
  const s = existing.map(x => ((x % 360) + 360) % 360).sort((p, q) => p - q);
  const gaps = s.map((a, i) => { const b = i + 1 < s.length ? s[i + 1] : s[0] + 360; return { a, size: b - a }; });
  const want = gaps.map(g => g.size / 360 * m), got = want.map(Math.floor);
  let left = m - got.reduce((p, q) => p + q, 0);
  const rem = want.map((w, i) => ({ i, r: w - got[i] })).sort((p, q) => q.r - p.r);
  for (const r of rem){ if (left <= 0) break; got[r.i]++; left--; }
  gaps.forEach((g, i) => { for (let k = 1; k <= got[i]; k++) out.push(g.a + g.size * k / (got[i] + 1)); });
  return out;
}
export function layout2D(key){
  const spec = SPECS[key], mol = MOLS[key];
  const nodes = [], edges = [], byAtom = new Map();
  mol.atoms.forEach((a, i) => { if (a.heavy){ const p = spec.flat[a.tag]; byAtom.set(i, nodes.length); nodes.push({ i, el: a.el, tag: a.tag, x: p[0], y: p[1], heavy: true }); } });
  for (const b of mol.bonds){ if (mol.atoms[b.a].heavy && mol.atoms[b.b].heavy) edges.push({ a: byAtom.get(b.a), b: byAtom.get(b.b), order: b.order }); }
  const heavyCount = nodes.length;
  for (let n = 0; n < heavyCount; n++){
    const node = nodes[n], atom = mol.atoms[node.i];
    const hs = atom.domains.filter(d => d.kind === 'bond' && mol.atoms[d.to].el === 'H');
    if (!hs.length) continue;
    const existing = edges.filter(e => e.a === n || e.b === n).map(e => { const o = nodes[e.a === n ? e.b : e.a]; return Math.atan2(o.y - node.y, o.x - node.x) * 180 / Math.PI; });
    const angles = placeH(existing, hs.length, atom.lp > 0);
    angles.forEach((ang, k) => { const r = ang * Math.PI / 180; nodes.push({ i: hs[k].to, el: 'H', x: node.x + 0.62 * Math.cos(r), y: node.y + 0.62 * Math.sin(r), heavy: false }); edges.push({ a: n, b: nodes.length - 1, order: 1 }); });
  }
  return { nodes, edges };
}

/* ---------- item generators (the answer is computed from the table) ---------- */
function shuffleWith(rng, arr){ const b = arr.slice(); for (let i = b.length - 1; i > 0; i--){ const j = Math.floor(rng() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; }
function candidatesA(){
  const out = [];
  for (const key of ORDER){
    const carbons = MOLS[key].atoms.filter(a => a.el === 'C');
    if (carbons.length < 2) continue;
    for (const hyb of ['sp3', 'sp2', 'sp']){ const q = carbons.filter(a => hybOf(a) === hyb); if (q.length === 1) out.push({ key, hyb, tag: q[0].tag }); }
  }
  return out;
}
const CANDS_A = candidatesA();
const CANDS_C = ORDER.filter(k => MOLS[k].atoms.some(a => a.el === 'O' || a.el === 'N'));
export function genItem(kind, rng){
  if (kind === 'A'){
    const c = CANDS_A[Math.floor(rng() * CANDS_A.length)];
    return { kind, key: c.key, hyb: c.hyb, answerTag: c.tag, prompt: 'Tap the ' + c.hyb + ' carbon in ' + SPECS[c.key].name.toLowerCase() + '.' };
  }
  if (kind === 'B'){
    const key = ORDER[Math.floor(rng() * ORDER.length)];
    const carbons = MOLS[key].atoms.filter(a => a.el === 'C');
    const a = carbons[Math.floor(rng() * carbons.length)];
    const answer = HYB[hybOf(a)].angle;
    return { kind, key, tag: a.tag, answer, options: shuffleWith(rng, [109.5, 120, 180, 90]), prompt: 'What is the bond angle at the marked carbon, about?' };
  }
  const key = CANDS_C[Math.floor(rng() * CANDS_C.length)];
  const a = MOLS[key].atoms.find(x => x.el === 'O' || x.el === 'N');
  return { kind: 'C', key, tag: a.tag, answer: hybOf(a), options: shuffleWith(rng, ['sp3', 'sp2', 'sp']), prompt: 'What is the hybridization of the marked ' + (a.el === 'O' ? 'oxygen' : 'nitrogen') + '?' };
}

export function selfTest(){
  const notes = [];
  try {
    for (const key of ORDER){
      const spec = SPECS[key], m = MOLS[key];
      for (const a of m.atoms){
        if (!a.heavy) continue;
        if (hybOf(a) !== a.hyb) throw new Error(key + ' ' + a.tag + ' domain count ' + a.domains.length + ' does not match ' + a.hyb);
        const want = HYB[a.hyb].angle;
        const ds = a.domains.map(d => d.dir);
        for (let i = 0; i < ds.length; i++){
          if (Math.abs(vlen(ds[i]) - 1) > 1e-9) throw new Error('non-unit direction');
          for (let j = i + 1; j < ds.length; j++){ const g = angleDeg(ds[i], ds[j]); const ideal = a.hyb === 'sp3' ? 109.4712 : want; if (Math.abs(g - ideal) > 0.01) throw new Error(key + ' ' + a.tag + ' angle ' + g.toFixed(3)); }
        }
      }
      for (const b of m.bonds){ const L = vlen(sub(m.atoms[b.a].pos, m.atoms[b.b].pos)); if (L < 0.9 || L > 1.6) throw new Error(key + ' bond length ' + L); }
      if (!spec.flat[m.atoms.find(a => a.tag === spec.focus).tag]) throw new Error('focus missing');
      const L = layout2D(key);
      for (let i = 0; i < L.nodes.length; i++) for (let j = i + 1; j < L.nodes.length; j++){ const d = Math.hypot(L.nodes[i].x - L.nodes[j].x, L.nodes[i].y - L.nodes[j].y); if (d < 0.42) throw new Error(key + ' flat overlap ' + d.toFixed(2)); }
      if (L.nodes.length !== m.atoms.length) throw new Error(key + ' flat atom count');
    }
    // planarity of propene (all six atoms of the C=C unit) and allene's perpendicular planes
    const pr = MOLS.propene, c1 = pr.atoms.find(a => a.tag === 'C1'), c2 = pr.atoms.find(a => a.tag === 'C2');
    const n = unit(cross(c1.domains[0].dir, c1.domains[1].dir));
    for (const a of pr.atoms){ const nb = a.domains.find(d => d.kind === 'bond' && [c1, c2].includes(pr.atoms[d.to])); if (a === c1 || a === c2 || (nb && a.el === 'H') || a.tag === 'C3'){ if (Math.abs(dot(sub(a.pos, c1.pos), n)) > 1e-6) throw new Error('propene not planar at ' + (a.tag || a.el)); } }
    const al = MOLS.allene, e1 = al.atoms.find(a => a.tag === 'C1'), e3 = al.atoms.find(a => a.tag === 'C3');
    const n1 = unit(cross(e1.domains[1].dir, e1.domains[2].dir)), n3 = unit(cross(e3.domains[1].dir, e3.domains[2].dir));
    if (Math.abs(dot(n1, n3)) > 1e-6) throw new Error('allene planes not perpendicular');
    if (CANDS_A.length < 5) throw new Error('too few tap items: ' + CANDS_A.length);
    // items
    let s = 7;
    const rng = () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
    let tried = 0;
    for (let i = 0; i < 210; i++){
      const kind = 'ABC'[i % 3], it = genItem(kind, rng); tried++;
      const m = MOLS[it.key];
      if (kind === 'A'){
        const q = m.atoms.filter(a => a.el === 'C' && hybOf(a) === it.hyb);
        if (q.length !== 1 || q[0].tag !== it.answerTag) throw new Error('A not unique');
        if (m.atoms.filter(a => a.el === 'C').length < 2) throw new Error('A trivial');
      } else {
        if (it.options.filter(o => o === it.answer).length !== 1) throw new Error(kind + ' answer not unique');
        const a = m.atoms.find(x => x.tag === it.tag);
        if (kind === 'B' && (a.el !== 'C' || HYB[hybOf(a)].angle !== it.answer)) throw new Error('B answer');
        if (kind === 'C' && (a.el === 'C' || hybOf(a) !== it.answer)) throw new Error('C answer');
      }
    }
    // determinism
    s = 99; const x1 = JSON.stringify(genItem('B', rng)); s = 99; const x2 = JSON.stringify(genItem('B', rng));
    if (x1 !== x2) throw new Error('not deterministic');
    notes.push(ORDER.length + ' molecules, ' + CANDS_A.length + ' tap items');
    return { ok: true, tried, notes: notes.join('; ') };
  } catch (e){ return { ok: false, tried: 0, notes: e.message }; }
}

/* ------------------------------------------------------------------ */
/* Rendering                                                           */
/* ------------------------------------------------------------------ */
const P = 'l1g';
const CSS = `
.${P}-stage{position:relative;width:100%;aspect-ratio:16/10;background:#0e0c08;border:1px solid var(--line);border-radius:12px;overflow:hidden;box-shadow:0 30px 60px -30px rgba(0,0,0,.8),inset 0 0 0 1px rgba(255,255,255,.02);cursor:grab;touch-action:none;user-select:none;-webkit-user-select:none}
.${P}-stage.drag{cursor:grabbing}
.${P}-stage.hot{cursor:pointer}
.${P}-fallback{position:absolute;inset:0;display:grid;place-items:center;color:var(--ink2);padding:24px;text-align:center}
.${P}-labels{position:absolute;inset:0;pointer-events:none}
.${P}-lab{position:absolute;left:0;top:0;font-family:var(--serif);font-weight:600;font-size:17px;line-height:1;color:#f4efe2;background:rgba(18,16,11,.8);padding:5px 9px 6px;border-radius:7px;white-space:nowrap;box-shadow:0 1px 6px rgba(0,0,0,.5);transition:opacity .25s}
.${P}-num{font-family:var(--mono);font-weight:600;font-size:12px;letter-spacing:.02em;padding:3px 7px 4px;color:var(--goldhi);background:rgba(18,16,11,.86);box-shadow:0 0 0 1px rgba(230,208,138,.35),0 1px 6px rgba(0,0,0,.5)}
.${P}-hud{position:absolute;left:12px;top:12px;pointer-events:none;background:rgba(20,18,12,.78);padding:7px 11px;border-radius:9px;max-width:62%}
.${P}-hud b{display:block;font-family:var(--serif);font-weight:400;font-size:18px;color:var(--goldhi);line-height:1.15}
.${P}-hud span{display:block;font-size:12px;color:var(--ink2);margin-top:2px}
.${P}-help{position:absolute;right:12px;top:12px;font-family:var(--mono);font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--ink3);background:rgba(20,18,12,.72);padding:6px 9px;border-radius:8px;pointer-events:none}
.${P}-cap{position:absolute;left:12px;right:12px;bottom:12px;display:flex;gap:8px;align-items:center;flex-wrap:wrap;pointer-events:none}
.${P}-cap b{font-family:var(--serif);font-weight:400;font-size:21px;color:#f4efe2;background:rgba(20,18,12,.84);padding:7px 13px;border-radius:9px;line-height:1.15}
.${P}-cap .nick{font-family:var(--mono);font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:#1a160c;background:linear-gradient(180deg,var(--goldhi),var(--gold));padding:8px 11px;border-radius:9px}
.${P}-cap .note{flex-basis:100%;font-size:13px;color:var(--ink2);background:rgba(20,18,12,.78);padding:5px 10px;border-radius:7px;align-self:flex-start;width:max-content;max-width:100%}
.${P}-legend{display:flex;gap:14px;flex-wrap:wrap;font-family:var(--mono);font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--ink3);margin-top:10px}
.${P}-legend i{display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:6px;vertical-align:-1px}
.${P}-flat{position:relative;max-width:440px;margin:0 auto}
.${P}-flat svg{width:100%;height:auto;display:block}
.${P}-hit{position:absolute;width:44px;height:44px;margin:-22px 0 0 -22px;border-radius:50%;border:1px solid transparent;background:transparent;padding:0;cursor:pointer}
.${P}-hit:hover,.${P}-hit:focus-visible{border-color:var(--gold);background:rgba(201,168,76,.12)}
.${P}-hit.picked{border-color:var(--goldhi);box-shadow:0 0 0 2px rgba(230,208,138,.35)}
.${P}-hit.ok{border-color:var(--good);box-shadow:0 0 0 2px rgba(87,180,135,.35);background:rgba(87,180,135,.12)}
.${P}-hit:disabled{cursor:default}
.${P}-hit:disabled:hover{border-color:transparent;background:transparent}
.${P}-hit.picked:disabled,.${P}-hit.ok:disabled{border-color:inherit}
.${P}-actions{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-top:10px}
`;
function injectCSS(){
  if (document.getElementById(P + '-css')) return; const s = document.createElement('style'); s.id = P + '-css'; s.textContent = CSS; document.head.appendChild(s);
}

const SCALE = 0.78;
const RADIUS = { C: 0.34, N: 0.33, O: 0.32, H: 0.2 };
const ELEMENT = { C: { color: 0x2b2926, rough: 0.32 }, H: { color: 0xf4f1e9, rough: 0.42 }, O: { color: 0xc42f1d, rough: 0.28 }, N: { color: 0x2c5ad4, rough: 0.28 } };
const easeInOut = k => k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;

function studioEnvironment(THREE, renderer){
  const pm = new THREE.PMREMGenerator(renderer);
  const room = new THREE.Scene();
  room.add(new THREE.Mesh(new THREE.BoxGeometry(24, 24, 24), new THREE.MeshStandardMaterial({ color: 0x16140f, side: THREE.BackSide, roughness: 1 })));
  const panel = (w, h, color, intensity, pos) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity), side: THREE.DoubleSide }));
    m.position.set(pos[0], pos[1], pos[2]); m.lookAt(0, 0, 0); room.add(m);
  };
  panel(7, 3.5, 0xfff0d2, 9, [0, 9, 3]);
  panel(3, 7, 0xd6e3ff, 3.5, [-10, 2, 4]);
  panel(4, 5, 0xffe2b0, 5, [8, 3, -8]);
  panel(12, 2, 0xffffff, 1.2, [0, -4, 10]);
  const tex = pm.fromScene(room, 0.04).texture;
  pm.dispose();
  return tex;
}

// A small studio stage: renderer, environment, lights, drag, tap, labels, visibility.
function makeStage(api){
  const THREE = api.THREE;
  const stage = api.el('div', { class: P + '-stage' });
  let renderer = null;
  try { renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' }); } catch (e){ renderer = null; }
  if (!renderer){ stage.append(api.el('div', { class: P + '-fallback', text: 'This model needs WebGL, which this browser has turned off. The move and the trap still stand.' })); return { stage, ok: false }; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x0e0c08, 1);
  const canvas = renderer.domElement; Object.assign(canvas.style, { position: 'absolute', inset: '0', width: '100%', height: '100%', display: 'block', borderRadius: '0' });
  canvas.setAttribute('aria-label', 'A three dimensional molecule you can turn and tap');
  stage.append(canvas);
  const labels = api.el('div', { class: P + '-labels' }); stage.append(labels);
  const scene = new THREE.Scene();
  const env = studioEnvironment(THREE, renderer);
  scene.environment = env; scene.background = env; scene.backgroundBlurriness = 1; scene.backgroundIntensity = 0.12;
  const camera = new THREE.PerspectiveCamera(34, 1.6, 0.1, 60);
  camera.position.set(0, 0.9, 7.4); camera.lookAt(0, 0, 0);
  const key = new THREE.DirectionalLight(0xfff1d8, 2.4); key.position.set(2.6, 4.2, 5.5); key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024); key.shadow.bias = -0.0004; key.shadow.normalBias = 0.02;
  Object.assign(key.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5, near: 1, far: 20 });
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xcfdcff, 0.55); fill.position.set(-4, 1, 3); scene.add(fill);
  scene.add(new THREE.HemisphereLight(0x9a917f, 0x14120e, 0.35));
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.ShadowMaterial({ opacity: 0.42 }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = -2.2; floor.receiveShadow = true; scene.add(floor);
  const sway = new THREE.Group(), spin = new THREE.Group(); sway.add(spin); scene.add(sway);

  const S = { stage, ok: true, THREE, renderer, scene, camera, spin, sway, floor, labels, tweens: [], labelNodes: [], visible: true, dragging: false, needs: true, swayAmp: 1, tapTargets: [], onTap: null, onDrag: null, hover: null, t0: performance.now() };
  S.resize = () => { const w = stage.clientWidth || 960, h = stage.clientHeight || Math.round(w / 1.6); renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); S.needs = true; };
  S.tween = (ms, fn, done) => { if (api.reduced || ms <= 0){ fn(1); done && done(); S.needs = true; return; } S.tweens.push({ t0: performance.now(), ms, fn, done }); };
  S.project = v => { const p = v.clone().project(camera); const w = stage.clientWidth, h = stage.clientHeight; return { x: (p.x + 1) / 2 * w, y: (1 - p.y) / 2 * h, z: p.z }; };
  S.addLabel = (el, at, opts = {}) => { labels.append(el); const n = { el, at, opts }; S.labelNodes.push(n); return n; };
  S.clearLabels = () => { for (const n of S.labelNodes) n.el.remove(); S.labelNodes = []; };
  S.placeLabels = () => {
    if (!S.labelNodes.length) return;
    const camDir = new THREE.Vector3(); camera.getWorldDirection(camDir);
    const center = new THREE.Vector3(); spin.getWorldPosition(center);
    const tmp = new THREE.Vector3();
    for (const n of S.labelNodes){
      n.at(tmp); const s = S.project(tmp);
      const depth = tmp.clone().sub(center).dot(camDir);
      const ox = (n.opts.dx || 0), oy = (n.opts.dy || 0);
      n.el.style.transform = 'translate(-50%,-50%) translate(' + (s.x + ox).toFixed(1) + 'px,' + (s.y + oy).toFixed(1) + 'px)';
      n.el.style.opacity = n.opts.fade === false ? '1' : (depth > 0.8 ? '0.55' : '1');
      n.el.style.zIndex = depth > 0 ? '1' : '3';
    }
  };
  // drag to turn, tap to pick
  let drag = null, moved = 0;
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  const pickAt = (e) => { const r = canvas.getBoundingClientRect(); ndc.set((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); ray.setFromCamera(ndc, camera); const hits = ray.intersectObjects(S.tapTargets, false); return hits.length ? hits[0].object : null; };
  canvas.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY }; moved = 0; S.dragging = true; stage.classList.add('drag'); try { canvas.setPointerCapture(e.pointerId); } catch (err) {} });
  const end = e => { if (drag && moved < 6 && S.onTap && e){ S.onTap(pickAt(e)); } drag = null; S.dragging = false; stage.classList.remove('drag'); };
  canvas.addEventListener('pointerup', end); canvas.addEventListener('pointercancel', () => end(null));
  canvas.addEventListener('pointermove', e => {
    if (drag){
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y; moved += Math.abs(dx) + Math.abs(dy);
      const qy = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), dx * 0.008), qx = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), dy * 0.008);
      spin.quaternion.premultiply(qy).premultiply(qx); drag = { x: e.clientX, y: e.clientY }; S.needs = true;
      if (moved >= 6 && S.onDrag) S.onDrag();
    } else if (S.tapTargets.length){ const h = pickAt(e); stage.classList.toggle('hot', !!h); }
  });
  canvas.addEventListener('pointerleave', () => stage.classList.remove('hot'));
  if (typeof ResizeObserver !== 'undefined'){ new ResizeObserver(() => S.resize()).observe(stage); } else window.addEventListener('resize', () => S.resize());
  if (typeof IntersectionObserver !== 'undefined'){ new IntersectionObserver(es => { for (const x of es){ S.visible = x.isIntersecting; if (S.visible) S.needs = true; } }, { threshold: 0 }).observe(stage); }
  const tick = () => {
    if (S.visible){
      const now = performance.now();
      for (const t of S.tweens.slice()){ const k = Math.min(1, (now - t.t0) / t.ms); t.fn(easeInOut(k)); if (k >= 1){ S.tweens.splice(S.tweens.indexOf(t), 1); t.done && t.done(); } S.needs = true; }
      if (!api.reduced && !S.dragging && S.swayAmp > 0){ const s = (now - S.t0) / 1000; sway.rotation.y = Math.sin(s * 0.5) * 0.07 * S.swayAmp; sway.rotation.x = Math.sin(s * 0.33) * 0.03 * S.swayAmp; S.needs = true; }
      if (S.needs){ renderer.render(scene, camera); S.placeLabels(); S.needs = false; }
    }
    requestAnimationFrame(tick);
  };
  S.resize(); requestAnimationFrame(tick);
  return S;
}

function setBond(THREE, mesh, a, b, radius){
  const d = b.clone().sub(a), L = d.length();
  mesh.position.copy(a).add(b).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
  mesh.scale.set(radius, Math.max(L, 0.001), radius);
}
const V3 = (THREE, a) => new THREE.Vector3(a[0], a[1], a[2]);

/* ---------- the flat drawing as SVG ---------- */
function drawFlat(api, key, opts = {}){
  const L = layout2D(key), PX = 62, pad = 0.55;
  let minX = 1e9, minY = 1e9, maxX = -1e9, maxY = -1e9;
  for (const n of L.nodes){ minX = Math.min(minX, n.x); maxX = Math.max(maxX, n.x); minY = Math.min(minY, n.y); maxY = Math.max(maxY, n.y); }
  const W = (maxX - minX + 2 * pad) * PX, Hh = (maxY - minY + 2 * pad) * PX;
  const X = x => (x - minX + pad) * PX, Y = y => (maxY - y + pad) * PX;
  const svg = api.svg('svg', { viewBox: '0 0 ' + W.toFixed(1) + ' ' + Hh.toFixed(1), role: 'img', 'aria-label': SPECS[key].name + ' drawn flat, the way the test draws it' });
  const c = api.colors;
  for (const e of L.edges){
    const A = L.nodes[e.a], B = L.nodes[e.b];
    const ax = X(A.x), ay = Y(A.y), bx = X(B.x), by = Y(B.y);
    const dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy), ux = dx / len, uy = dy / len, px = -uy, py = ux;
    const ra = (A.heavy ? 0.24 : 0.14) * PX, rb = (B.heavy ? 0.24 : 0.14) * PX;
    const offs = e.order === 3 ? [-0.09, 0, 0.09] : e.order === 2 ? [-0.06, 0.06] : [0];
    for (const o of offs){ const ox = px * o * PX, oy = py * o * PX; svg.append(api.svg('line', { x1: (ax + ux * ra + ox).toFixed(1), y1: (ay + uy * ra + oy).toFixed(1), x2: (bx - ux * rb + ox).toFixed(1), y2: (by - uy * rb + oy).toFixed(1), stroke: A.heavy && B.heavy ? c.ink : c.ink3, 'stroke-width': A.heavy && B.heavy ? 2.4 : 1.8, 'stroke-linecap': 'round' })); }
  }
  for (const n of L.nodes){
    const x = X(n.x), y = Y(n.y);
    if (n.heavy){
      const mark = opts.mark === n.tag, ok = opts.ok === n.tag, picked = opts.picked === n.tag;
      if (opts.tappable && !ok && !picked) svg.append(api.svg('circle', { cx: x, cy: y, r: 0.36 * PX, fill: 'none', stroke: c.line, 'stroke-width': 1.5, 'stroke-dasharray': '4 4' }));
      if (mark) svg.append(api.svg('circle', { cx: x, cy: y, r: 0.36 * PX, fill: 'rgba(201,168,76,.12)', stroke: c.gold, 'stroke-width': 2.5 }));
      if (ok) svg.append(api.svg('circle', { cx: x, cy: y, r: 0.36 * PX, fill: 'rgba(87,180,135,.14)', stroke: c.green, 'stroke-width': 2.5 }));
      else if (picked) svg.append(api.svg('circle', { cx: x, cy: y, r: 0.36 * PX, fill: 'rgba(230,208,138,.1)', stroke: c.goldhi, 'stroke-width': 2 }));
      svg.append(api.svg('text', { x, y: y + 1, 'text-anchor': 'middle', 'dominant-baseline': 'middle', fill: n.el === 'C' ? c.ink : n.el === 'O' ? c.coral : c.blue, style: { fontFamily: 'Georgia, serif', fontSize: '24px', fontWeight: '600' }, text: n.el }));
    } else svg.append(api.svg('text', { x, y: y + 1, 'text-anchor': 'middle', 'dominant-baseline': 'middle', fill: c.ink2, style: { fontFamily: 'Georgia, serif', fontSize: '16px' }, text: 'H' }));
  }
  const wrap = api.el('div', { class: P + '-flat', style: { aspectRatio: W.toFixed(1) + ' / ' + Hh.toFixed(1) } }, svg);
  return { wrap, svg, nodes: L.nodes, pct: n => ({ left: (X(n.x) / W * 100).toFixed(2) + '%', top: (Y(n.y) / Hh * 100).toFixed(2) + '%' }) };
}

export function mount(slots, api){
  const THREE = api.THREE;
  injectCSS();
  const c = api.colors;
  const S = makeStage(api);
  slots.visual.append(S.stage);
  if (!S.ok){ buildTry(); return; }

  const hud = api.el('div', { class: P + '-hud' }, api.el('b', { text: '' }), api.el('span', { text: '' }));
  const help = api.el('div', { class: P + '-help', text: 'Tap a carbon, oxygen or nitrogen · drag to turn' });
  const cap = api.el('div', { class: P + '-cap' });
  S.stage.append(hud, help, cap);

  const mol = new THREE.Group(); S.spin.add(mol);
  const body = new THREE.Group(), overlay = new THREE.Group(); mol.add(body); mol.add(overlay);
  const bondMat = new THREE.MeshStandardMaterial({ color: 0xb9a878, roughness: 0.32, metalness: 0.7, envMapIntensity: 1.0 });
  const unitCyl = new THREE.CylinderGeometry(1, 1, 1, 24, 1, true);
  const sphereGeo = {}; for (const el in RADIUS) sphereGeo[el] = new THREE.SphereGeometry(RADIUS[el], 48, 32);
  const lobeGeo = new THREE.SphereGeometry(1, 32, 24);
  const goldC = new THREE.Color(c.gold), blueC = new THREE.Color(c.blue), goldhiC = new THREE.Color(c.goldhi);
  const lobeMat = (color) => new THREE.MeshPhysicalMaterial({ color, emissive: color, emissiveIntensity: 0.45, roughness: 0.3, metalness: 0, clearcoat: 0.5, transparent: true, opacity: 0.5, depthWrite: false });
  const arcMat = new THREE.MeshBasicMaterial({ color: goldhiC, toneMapped: false, transparent: true, opacity: 0.95, depthTest: false });
  const glowMat = new THREE.MeshBasicMaterial({ color: goldhiC, toneMapped: false, transparent: true, opacity: 0.12, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending });

  let current = null, atomMeshes = [], picked = null, chips = [];
  const clear = g => { while (g.children.length){ const o = g.children.pop(); if (o.geometry && o.geometry !== unitCyl && o.geometry !== lobeGeo && !Object.values(sphereGeo).includes(o.geometry)) o.geometry.dispose(); if (o.material && o.material !== bondMat && o.material !== arcMat && o.material !== glowMat) o.material.dispose(); } };

  function planeNormal(atom, m){
    const bs = atom.domains.filter(d => d.kind === 'bond');
    if (bs.length >= 2){ const n = cross(bs[0].dir, bs[1].dir); if (vlen(n) > 1e-6) return unit(n); }
    return null;
  }
  function build(key){
    current = key; picked = null;
    clear(body); clear(overlay); S.clearLabels(); S.tapTargets = [];
    const m = MOLS[key];
    const heavy = m.atoms.filter(a => a.heavy);
    const cen = heavy.reduce((p, a) => add(p, a.pos), [0, 0, 0]).map(x => x / heavy.length);
    atomMeshes = m.atoms.map((a, i) => {
      const el = ELEMENT[a.el];
      const mesh = new THREE.Mesh(sphereGeo[a.el], new THREE.MeshPhysicalMaterial({ color: el.color, roughness: el.rough, metalness: 0, clearcoat: 0.7, clearcoatRoughness: 0.22, envMapIntensity: 1.1 }));
      mesh.castShadow = true; mesh.receiveShadow = true;
      mesh.position.copy(V3(THREE, sub(a.pos, cen)).multiplyScalar(SCALE));
      mesh.userData = { i, atom: a };
      body.add(mesh); if (a.heavy) S.tapTargets.push(mesh);
      return mesh;
    });
    for (const b of m.bonds){
      const A = m.atoms[b.a], B = m.atoms[b.b];
      const pa = atomMeshes[b.a].position, pb = atomMeshes[b.b].position;
      const toH = A.el === 'H' || B.el === 'H';
      const offs = b.order === 3 ? [-0.11, 0, 0.11] : b.order === 2 ? [-0.095, 0.095] : [0];
      let perp = null;
      if (b.order > 1){ const n = planeNormal(A, m) || planeNormal(B, m); const axis = unit(sub(B.pos, A.pos)); if (n){ let p = sub(n, mul(axis, dot(n, axis))); if (vlen(p) < 1e-6) p = cross(axis, Math.abs(axis[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0]); perp = V3(THREE, unit(p)); } else { const p = cross(axis, Math.abs(axis[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0]); perp = V3(THREE, unit(p)); } }
      for (const o of offs){
        const mesh = new THREE.Mesh(unitCyl, bondMat); mesh.castShadow = true; mesh.receiveShadow = true;
        const a2 = pa.clone(), b2 = pb.clone(); if (o && perp){ a2.add(perp.clone().multiplyScalar(o)); b2.add(perp.clone().multiplyScalar(o)); }
        setBond(THREE, mesh, a2, b2, b.order === 1 ? (toH ? 0.062 : 0.088) : b.order === 2 ? 0.055 : 0.048);
        body.add(mesh);
      }
    }
    let rad = 0; for (const mm of atomMeshes) rad = Math.max(rad, mm.position.length() + RADIUS[mm.userData.atom.el]);
    const dist = Math.max(5.2, (rad + 0.55) / Math.tan(S.camera.fov * Math.PI / 360) * 0.98);
    S.camera.position.set(0, 0.8, dist); S.camera.lookAt(0, -0.3, 0);
    S.floor.position.y = -(rad + 0.7);
    hud.firstChild.textContent = SPECS[key].name; hud.lastChild.textContent = SPECS[key].line;
    cap.replaceChildren(api.el('b', { text: 'Tap any carbon, oxygen or nitrogen to see its domains.' }));
    for (const ch of chips) ch.setAttribute('aria-pressed', String(ch.dataset.key === key));
    S.spin.quaternion.copy(new THREE.Quaternion().setFromEuler(new THREE.Euler(0.32, -0.55, 0)));
    S.needs = true;
  }

  // the best angle to read the shape from: peace sign face-on, tripod one leg forward, line across
  function bestView(atom){
    const ds = atom.domains.map(d => V3(THREE, d.dir));
    const q = new THREE.Quaternion();
    if (ds.length === 3){
      const n = new THREE.Vector3().crossVectors(ds[0], ds[1]).normalize();
      if (n.z < 0) n.negate();
      q.setFromUnitVectors(n, new THREE.Vector3(0, 0, 1));
      const d0 = ds[0].clone().applyQuaternion(q);
      const ang = Math.atan2(d0.y, d0.x), target = -Math.PI / 2;
      q.premultiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), target - ang));
      q.premultiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), 0.18));
      q.premultiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -0.14));
    } else if (ds.length === 2){
      q.setFromUnitVectors(ds[0], new THREE.Vector3(1, 0, 0));
      q.premultiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), 0.34));
      q.premultiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), 0.2));
    } else {
      q.setFromUnitVectors(ds[0], new THREE.Vector3(0, 1, 0));
      const d1 = ds[1].clone().applyQuaternion(q);
      const az = Math.atan2(d1.x, d1.z);
      q.premultiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -az));
      q.premultiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), 0.34));
      q.premultiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), 0.22));
    }
    return q;
  }
  function arcPoints(a, b, r, n){
    const th = Math.acos(Math.max(-1, Math.min(1, dot(a, b))));
    let p = sub(b, mul(a, dot(a, b)));
    if (vlen(p) < 1e-6) p = cross(a, Math.abs(a[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0]);
    p = unit(p);
    const pts = [], t0 = th * 0.14, t1 = th * 0.86;
    for (let i = 0; i <= n; i++){ const t = t0 + (t1 - t0) * i / n; pts.push(add(mul(a, Math.cos(t) * r), mul(p, Math.sin(t) * r))); }
    return { pts, mid: add(mul(a, Math.cos(th / 2)), mul(p, Math.sin(th / 2))) };
  }
  function showDomains(mesh){
    clear(overlay); S.clearLabels();
    picked = mesh;
    const atom = mesh.userData.atom, m = MOLS[current];
    const origin = mesh.position.clone();
    const bonds = atom.domains.filter(d => d.kind === 'bond').length, lps = atom.domains.filter(d => d.kind === 'lp').length;
    const hyb = hybOf(atom), info = HYB[hyb];
    // lobes
    for (const d of atom.domains){
      const dir = V3(THREE, d.dir);
      const lp = d.kind === 'lp';
      const L = lp ? 0.72 : 0.98, W = lp ? 0.3 : 0.24;
      const lobe = new THREE.Mesh(lobeGeo, lobeMat(lp ? blueC : goldC));
      lobe.scale.set(W, L / 2, W);
      lobe.position.copy(origin).add(dir.clone().multiplyScalar(0.12 + L / 2));
      lobe.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
      lobe.renderOrder = 10; overlay.add(lobe);
      lobe.scale.setScalar(0.001);
      S.tween(420, k => { lobe.scale.set(W * k, L / 2 * k, W * k); });
    }
    // the sp2 plane, so trigonal planar reads as a plane
    if (atom.domains.length === 3){
      const n = unit(cross(atom.domains[0].dir, atom.domains[1].dir));
      const disc = new THREE.Mesh(new THREE.CircleGeometry(1.05, 64), new THREE.MeshBasicMaterial({ color: goldC, transparent: true, opacity: 0.09, side: THREE.DoubleSide, depthWrite: false, toneMapped: false }));
      disc.position.copy(origin); disc.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), V3(THREE, n)); disc.renderOrder = 9; overlay.add(disc);
      const rim = new THREE.Mesh(new THREE.RingGeometry(1.03, 1.05, 64), new THREE.MeshBasicMaterial({ color: goldC, transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false, toneMapped: false }));
      rim.position.copy(origin); rim.quaternion.copy(disc.quaternion); rim.renderOrder = 9; overlay.add(rim);
    }
    // angle arcs between every pair of domains
    const ds = atom.domains.map(d => d.dir);
    const pairs = [];
    for (let i = 0; i < ds.length; i++) for (let j = i + 1; j < ds.length; j++) pairs.push([i, j]);
    const labelPairs = ds.length === 4 ? pairs.filter(p => p[0] === 0) : pairs;
    pairs.forEach((pr, k) => {
      const { pts, mid } = arcPoints(ds[pr[0]], ds[pr[1]], 0.62, 28);
      const curve = new THREE.CatmullRomCurve3(pts.map(p => origin.clone().add(V3(THREE, p))));
      const core = new THREE.Mesh(new THREE.TubeGeometry(curve, 40, 0.016, 8, false), arcMat);
      const glow = new THREE.Mesh(new THREE.TubeGeometry(curve, 40, 0.05, 8, false), glowMat);
      core.renderOrder = 21; glow.renderOrder = 20; overlay.add(glow); overlay.add(core);
      const count = core.geometry.index.count, per = 8 * 6;
      core.geometry.setDrawRange(0, 0); glow.geometry.setDrawRange(0, 0);
      S.tween(520 + k * 60, kk => { const n = Math.floor(kk * count / per) * per; core.geometry.setDrawRange(0, n); glow.geometry.setDrawRange(0, n); });
      if (labelPairs.includes(pr)){
        const lab = api.el('div', { class: P + '-lab ' + P + '-num', text: String(info.angle) });
        const at = origin.clone().add(V3(THREE, mid).multiplyScalar(0.88));
        S.addLabel(lab, out => { out.copy(at); mol.localToWorld(out); }, { fade: false });
      }
    });
    // atom tag
    const tag = api.el('div', { class: P + '-lab', text: atom.el + (atom.tag && atom.tag.length > 1 ? atom.tag.slice(1) : '') });
    S.addLabel(tag, out => { out.copy(origin); mol.localToWorld(out); }, { dy: -RADIUS[atom.el] * 40 - 20, fade: false });
    // caption
    const parts = ds.length + ' domains' + (lps ? ' (' + bonds + ' bond' + (bonds > 1 ? 's' : '') + ' + ' + lps + ' lone pair' + (lps > 1 ? 's' : '') + ')' : '') + ' · ' + hyb + ' · ' + info.angle + ' degrees';
    cap.replaceChildren(api.el('b', { text: parts }), api.el('span', { class: 'nick', text: info.nick }));
    if (lps) cap.append(api.el('span', { class: 'note', text: 'The blue lobes are lone pairs. They count, and they squeeze the bond angle a little under ' + info.angle + '.' }));
    else if (atom.domains.some(d => d.order > 1)) cap.append(api.el('span', { class: 'note', text: 'A double or triple bond is one domain: one gold lobe.' }));
    // turn to the reading angle
    const q0 = S.spin.quaternion.clone(), q1 = bestView(atom);
    S.tween(720, k => { S.spin.quaternion.slerpQuaternions(q0, q1, k); });
    S.needs = true;
  }
  S.onTap = mesh => {
    if (!mesh){ return; }
    if (mesh.userData.atom.el === 'H'){ cap.replaceChildren(api.el('b', { text: 'Hydrogen has one bond and no lone pairs, nothing to shape. Tap a carbon, oxygen or nitrogen.' })); S.needs = true; return; }
    showDomains(mesh);
  };

  // molecule chips
  const controls = api.el('div', { class: 'controls' });
  for (const key of ORDER){
    const ch = api.el('button', { type: 'button', class: 'chip', text: SPECS[key].name, dataset: { key }, 'aria-pressed': 'false', onClick: () => { build(key); const f = atomMeshes.find(mm => mm.userData.atom.tag === SPECS[key].focus); if (f) showDomains(f); } });
    chips.push(ch); controls.append(ch);
  }
  slots.visual.append(controls);
  slots.visual.append(api.el('div', { class: P + '-legend' },
    api.el('span', {}, api.el('i', { style: { background: c.gold } }), 'bond domain'),
    api.el('span', {}, api.el('i', { style: { background: c.blue } }), 'lone pair domain'),
    api.el('span', {}, api.el('i', { style: { background: '#2b2926', boxShadow: '0 0 0 1px #6b665c' } }), 'carbon'),
    api.el('span', {}, api.el('i', { style: { background: '#c42f1d' } }), 'oxygen'),
    api.el('span', {}, api.el('i', { style: { background: '#2c5ad4' } }), 'nitrogen'),
    api.el('span', {}, api.el('i', { style: { background: '#f4f1e9' } }), 'hydrogen')));
  build(ORDER[0]);
  const f0 = atomMeshes.find(mm => mm.userData.atom.tag === SPECS[ORDER[0]].focus); if (f0) showDomains(f0);

  buildTry();

  /* ---------------- you try ---------------- */
  function buildTry(){
    let n = 0;
    const host = slots.try;
    function next(){
      host.replaceChildren(); api.clearCoach();
      const kind = 'ABC'[n % 3]; n++;
      const item = genItem(kind, api.rng);
      const box = api.el('div', { class: 'item' });
      box.append(api.el('p', { class: 'prompt', text: item.prompt }));
      const verdict = api.el('div', { class: 'verdict' }), actions = api.el('div', { class: P + '-actions' });
      let reported = false, done = false;
      const finish = ok => {
        if (!reported){ api.report(ok); reported = true; }
        if (ok){ done = true; verdict.className = 'verdict good'; verdict.textContent = 'You can read it.'; actions.append(api.el('button', { type: 'button', class: 'primary', text: 'Another one', onClick: next })); }
        else { verdict.className = 'verdict notyet'; verdict.textContent = 'Not yet.'; }
      };
      const m = MOLS[item.key];
      if (kind === 'A'){
        let flat = drawFlat(api, item.key);
        const holder = api.el('div', {});
        const render = (state) => {
          flat = drawFlat(api, item.key, Object.assign({ tappable: true }, state)); holder.replaceChildren(flat.wrap);
          for (const node of flat.nodes){
            if (!node.heavy) continue;
            const pos = flat.pct(node);
            const b = api.el('button', { type: 'button', class: P + '-hit' + (state.ok === node.tag ? ' ok' : state.picked === node.tag ? ' picked' : ''), style: { left: pos.left, top: pos.top }, 'aria-label': (node.el === 'C' ? 'carbon' : node.el === 'O' ? 'oxygen' : 'nitrogen') + ' ' + node.tag.replace(/^[A-Z]/, ''), onClick: () => {
              if (done) return;
              const ok = node.tag === item.answerTag;
              render({ picked: node.tag, ok: ok ? node.tag : null });
              finish(ok);
              if (!ok){ const a = m.atoms[node.i]; api.coach('Count the domains, not the bonds. A double bond is one domain. That carbon has ' + a.domains.length + ' domains, so it is ' + hybOf(a) + '. Find the one with ' + HYB[item.hyb].n + '.'); }
            } });
            if (done) b.disabled = true;
            flat.wrap.append(b);
          }
        };
        render({});
        box.append(holder, verdict, actions);
      } else {
        const flat = drawFlat(api, item.key, { mark: item.tag });
        box.append(flat.wrap);
        const opts = api.el('div', { class: 'opts' });
        const buttons = item.options.map((o, i) => api.el('button', { type: 'button', class: 'opt' }, api.el('span', { class: 'k', text: 'ABCD'[i] }), api.el('span', { text: kind === 'B' ? String(o) + ' degrees' : String(o) })));
        buttons.forEach((b, i) => b.addEventListener('click', () => {
          if (done) return;
          b.classList.add('picked');
          const ok = item.options[i] === item.answer;
          if (ok){ b.classList.add('ok'); for (const x of buttons) x.disabled = true; } else b.disabled = true;
          finish(ok);
          if (!ok){
            const a = m.atoms.find(x => x.tag === item.tag);
            if (kind === 'B') api.coach('Count the domains at that carbon. Four is 109.5, the tripod. Three is 120, the peace sign. Two is 180, the straight line. This one has ' + a.domains.length + '.');
            else api.coach('A lone pair is a domain too, even though nobody drew it. This ' + (a.el === 'O' ? 'oxygen' : 'nitrogen') + ' has ' + a.domains.filter(d => d.kind === 'bond').length + ' bond' + (a.domains.filter(d => d.kind === 'bond').length > 1 ? 's' : '') + ' plus ' + a.lp + ' lone pair' + (a.lp > 1 ? 's' : '') + ', so count again.');
          }
        }));
        buttons.forEach(b => opts.append(b));
        box.append(opts, verdict, actions);
      }
      host.append(box);
    }
    next();
  }
}
