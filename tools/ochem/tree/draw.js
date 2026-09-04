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
    _drawer = new window.SmilesDrawer.SvgDrawer({ width: w, height: h, bondThickness: 1.5, bondLength: bondLength, shortBondLength: 0.8, fontSizeLarge: 9, fontSizeSmall: 6.5, padding: 14, compactDrawing: false, terminalCarbons: terminal, explicitHydrogens: false,
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

export function drawSmiles(target, smiles, o = {}){
  const w = o.width || 240, h = o.height || 160;
  const node = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  node.setAttribute('viewBox', `0 0 ${w} ${h}`); node.setAttribute('width', w); node.setAttribute('height', h); node.setAttribute('role', 'img'); node.setAttribute('aria-label', o.label || 'a molecule');
  node.classList.add('mol');
  if (target) target.append(node);
  const d = drawer(w, h, o.bondLength || (heavyAtoms(smiles) <= 3 ? 42 : 22), o.terminalCarbons != null ? o.terminalCarbons : hasChargedCarbon(smiles));
  if (!d){ const t = document.createElementNS('http://www.w3.org/2000/svg', 'title'); t.textContent = 'structure'; node.append(t); return node; }
  try { window.SmilesDrawer.parse(smiles, tree => { d.draw(tree, node, 'dark'); if (heavyAtoms(smiles) === 2) bondTwoLabels(node); }, err => { console.error('smiles', smiles, err); }); }
  catch (e){ console.error('smiles', smiles, e); }
  node.removeAttribute('width'); node.removeAttribute('height');
  return node;
}

