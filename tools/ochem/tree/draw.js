// draw.js - SMILES to inline SVG through the vendored SmilesDrawer (window.SmilesDrawer).
// Used by the tree shell and the summit. Dark theme matched to the pages.
// SMILES -> inline SVG through the vendored SmilesDrawer (loaded by index.html
// as a classic script). Dark theme matched to the page. Returns the <svg>.
let _drawer = null;
// A molecule with only two or three heavy atoms draws both ends as text
// labels, and at the normal bond length the labels sit on top of the bond and
// hide it (methylamine looked like two loose fragments). Stretch the bond for
// those so the line is visible between the labels.
function heavyAtoms(smiles){
  let n = 0;
  for (let i = 0; i < smiles.length; i++){
    const c = smiles[i];
    if (c === '[') { const j = smiles.indexOf(']', i); n++; i = j < 0 ? i : j; continue; }
    if (/[A-Z]/.test(c)){ if (c === 'C' && smiles[i + 1] === 'l'){ n++; i++; continue; } if (c === 'B' && smiles[i + 1] === 'r'){ n++; i++; continue; } n++; }
    else if (/[a-z]/.test(c) && 'cnops'.indexOf(c) >= 0 && !/[A-Z]/.test(smiles[i - 1] || '')) n++;
  }
  return n;
}
// A carbanion or carbocation on a terminal carbon is invisible when terminal
// carbons are drawn as bare line ends: the enolate looked exactly like the
// aldehyde it came from. Label the terminal carbons whenever the molecule
// carries a charged carbon, so the charge is on the atom where it belongs.
function hasChargedCarbon(smiles){ return /\[C[H0-9]*[+-]\]/.test(smiles); }
function drawer(w, h, bondLength, terminal){
  if (!window.SmilesDrawer) return null;
  if (!_drawer || _drawer._w !== w || _drawer._h !== h || _drawer._bl !== bondLength || _drawer._tc !== terminal){
    _drawer = new window.SmilesDrawer.SvgDrawer({ width: w, height: h, bondThickness: 1.5, bondLength: bondLength, shortBondLength: 0.8, fontSizeLarge: 9.5, fontSizeSmall: 8, padding: 6, compactDrawing: false, terminalCarbons: terminal, explicitHydrogens: false,
      themes: { dark: { C: '#ece6d7', O: '#e0705a', N: '#5b8def', F: '#9ad39a', CL: '#3fb257', BR: '#c47a4a', I: '#a06bd6', P: '#f0a05a', S: '#e2c34b', B: '#d8a0a0', SI: '#b0b0b0', H: '#ece6d7', BACKGROUND: 'transparent' } } });
    _drawer._w = w; _drawer._h = h; _drawer._bl = bondLength; _drawer._tc = terminal;
  }
  return _drawer;
}
// A two-atom molecule keeps its bond, but the drawer masks the label areas and
// on a molecule this small the two masks cover the whole line, so methylamine
// looked like two loose fragments. The drawer leaves the bond's endpoints on a
// linearGradient, so read those and lay an unmasked line between the labels.
function bondTwoLabels(node){
  const g = node.querySelector('linearGradient[id*="-line-"]');
  if (!g) return;
  const x1 = parseFloat(g.getAttribute('x1')), y1 = parseFloat(g.getAttribute('y1'));
  const x2 = parseFloat(g.getAttribute('x2')), y2 = parseFloat(g.getAttribute('y2'));
  if (![x1, y1, x2, y2].every(v => isFinite(v))) return;
  const t = 0.32;                                  // clear the label at each end
  const ax = x1 + (x2 - x1) * t, ay = y1 + (y2 - y1) * t;
  const bx = x2 - (x2 - x1) * t, by = y2 - (y2 - y1) * t;
  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line.setAttribute('x1', ax); line.setAttribute('y1', ay); line.setAttribute('x2', bx); line.setAttribute('y2', by);
  line.setAttribute('stroke', '#ece6d7'); line.setAttribute('stroke-width', '1.5'); line.setAttribute('stroke-linecap', 'round');
  node.append(line);                               // outside the mask group
}

// A charged carbon in the middle of a chain gets no label at all: the drawer
// only writes text for heteroatoms and chain ends, so the tert-butyl cation
// drew as plain neopentane and the whole question turned on nothing. Chemists
// draw that charge as a sign sitting at the vertex, so put one there, on the
// side of the atom with the most room. Terminal charged carbons already come
// out as H2C+ and are left alone.
const SVGNS = 'http://www.w3.org/2000/svg';
function stampCharges(node, d){
  const g = d.preprocessor && d.preprocessor.graph;
  if (!g || !g.vertices) return;
  const labeled = [...node.querySelectorAll('mask circle')]
    .map(c => [parseFloat(c.getAttribute('cx')), parseFloat(c.getAttribute('cy'))]);
  for (const v of g.vertices){
    const q = (v.value.bracket && v.value.bracket.charge) || v.value.charge || 0;
    if (!q) continue;
    const x = v.position.x, y = v.position.y;
    if (!isFinite(x) || !isFinite(y)) continue;
    if (labeled.some(([cx, cy]) => Math.hypot(cx - x, cy - y) < 1.5)) continue;
    // Put the sign in the widest gap between this atom's bonds. Averaging the
    // bond directions and going opposite works for a chain but collapses on a
    // symmetric junction like the tert-butyl cation, where it landed the plus
    // on top of a bond.
    const ang = [];
    for (const id of (v.neighbours || [])){
      const n = g.vertices[id]; if (!n || !n.position) continue;
      ang.push(Math.atan2(n.position.y - y, n.position.x - x));
    }
    let dir = -Math.PI / 3;                       // up and to the right by default
    if (ang.length === 1) dir = ang[0] + Math.PI;
    else if (ang.length > 1){
      ang.sort((a, b) => a - b);
      let best = -1;
      for (let i = 0; i < ang.length; i++){
        const a = ang[i], b = i + 1 < ang.length ? ang[i + 1] : ang[0] + 2 * Math.PI;
        if (b - a > best){ best = b - a; dir = a + (b - a) / 2; }
      }
    }
    const ox = Math.cos(dir), oy = Math.sin(dir);
    const t = document.createElementNS(SVGNS, 'text');
    t.setAttribute('x', x + ox * 7.5); t.setAttribute('y', y + oy * 7.5 + 3);
    t.setAttribute('text-anchor', 'middle');
    t.setAttribute('fill', '#ece6d7');
    t.setAttribute('style', 'font: 9pt Arial, Helvetica, sans-serif');
    t.textContent = q > 0 ? '+' : '-';
    node.append(t);
  }
}

// The fitted viewBox stops at the letters, so a subscript's tail and a stamped
// charge sit right on the edge and the first thing a small render loses is the
// 3 in CH3. Give the box a little air.
function breathe(node){
  const vb = (node.getAttribute('viewBox') || '').split(/\s+/).map(Number);
  if (vb.length !== 4 || !vb.every(v => isFinite(v)) || !vb[2] || !vb[3]) return;
  const p = Math.max(vb[2], vb[3]) * 0.07;
  node.setAttribute('viewBox', `${vb[0] - p} ${vb[1] - p} ${vb[2] + 2 * p} ${vb[3] + 2 * p}`);
}

export function drawSmiles(target, smiles, o = {}){
  const w = o.width || 240, h = o.height || 160;
  const node = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  node.setAttribute('viewBox', `0 0 ${w} ${h}`); node.setAttribute('width', w); node.setAttribute('height', h); node.setAttribute('role', 'img'); node.setAttribute('aria-label', o.label || 'a molecule');
  node.classList.add('mol');
  if (target) target.append(node);
  const bl = o.bondLength || (heavyAtoms(smiles) <= 3 ? 42 : 22);
  node.dataset.bond = String(bl);            // so a caller can size several drawings to one scale
  const d = drawer(w, h, bl, o.terminalCarbons != null ? o.terminalCarbons : hasChargedCarbon(smiles));
  if (!d){ const t = document.createElementNS('http://www.w3.org/2000/svg', 'title'); t.textContent = 'structure'; node.append(t); return node; }
  try { window.SmilesDrawer.parse(smiles, tree => { d.draw(tree, node, 'dark'); stampCharges(node, d); if (heavyAtoms(smiles) === 2) bondTwoLabels(node); breathe(node); }, err => { console.error('smiles', smiles, err); }); }
  catch (e){ console.error('smiles', smiles, e); }
  node.removeAttribute('width'); node.removeAttribute('height');
  return node;
}

