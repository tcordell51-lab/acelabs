// draw.js - SMILES to inline SVG through the vendored SmilesDrawer (window.SmilesDrawer).
// Used by the tree shell and the summit. Dark theme matched to the pages.
// SMILES -> inline SVG through the vendored SmilesDrawer (loaded by index.html
// as a classic script). Dark theme matched to the page. Returns the <svg>.
let _drawer = null;
function drawer(w, h){
  if (!window.SmilesDrawer) return null;
  if (!_drawer || _drawer._w !== w || _drawer._h !== h){
    _drawer = new window.SmilesDrawer.SvgDrawer({ width: w, height: h, bondThickness: 1.5, bondLength: 22, shortBondLength: 0.8, fontSizeLarge: 9, fontSizeSmall: 6.5, padding: 14, compactDrawing: false, terminalCarbons: false, explicitHydrogens: false,
      themes: { dark: { C: '#ece6d7', O: '#e0705a', N: '#5b8def', F: '#9ad39a', CL: '#3fb257', BR: '#c47a4a', I: '#a06bd6', P: '#f0a05a', S: '#e2c34b', B: '#d8a0a0', SI: '#b0b0b0', H: '#ece6d7', BACKGROUND: 'transparent' } } });
    _drawer._w = w; _drawer._h = h;
  }
  return _drawer;
}
export function drawSmiles(target, smiles, o = {}){
  const w = o.width || 240, h = o.height || 160;
  const node = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  node.setAttribute('viewBox', `0 0 ${w} ${h}`); node.setAttribute('width', w); node.setAttribute('height', h); node.setAttribute('role', 'img'); node.setAttribute('aria-label', o.label || 'a molecule');
  node.classList.add('mol');
  if (target) target.append(node);
  const d = drawer(w, h);
  if (!d){ const t = document.createElementNS('http://www.w3.org/2000/svg', 'title'); t.textContent = 'structure'; node.append(t); return node; }
  try { window.SmilesDrawer.parse(smiles, tree => d.draw(tree, node, 'dark'), err => { console.error('smiles', smiles, err); }); }
  catch (e){ console.error('smiles', smiles, e); }
  node.removeAttribute('width'); node.removeAttribute('height');
  return node;
}

