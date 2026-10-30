// COPY of the layout and drawing functions in tools/gc/lewis-sandbox.html, made by scripts/explainers/build.mjs. Never edit; re-run the build.
(function(){
function renderBond(a, z, order){
  const dx = z.x - a.x, dy = z.y - a.y;
  const len = Math.hypot(dx, dy);
  // Trim ends so bonds stop at atom edge
  const trim = 28;
  const ux = dx/len, uy = dy/len;
  const ax = a.x + ux*trim, ay = a.y + uy*trim;
  const zx = z.x - ux*trim, zy = z.y - uy*trim;
  // Perpendicular for double/triple offset
  const px = -uy, py = ux;
  let s = `<g class="bond-grp">`;
  if(order === 1){
    s += `<line class="bond-stroke" x1="${ax}" y1="${ay}" x2="${zx}" y2="${zy}"/>`;
  } else if(order === 2){
    const off = 4;
    s += `<line class="bond-stroke" x1="${ax+px*off}" y1="${ay+py*off}" x2="${zx+px*off}" y2="${zy+py*off}"/>`;
    s += `<line class="bond-stroke" x1="${ax-px*off}" y1="${ay-py*off}" x2="${zx-px*off}" y2="${zy-py*off}"/>`;
  } else {
    const off = 5.5;
    s += `<line class="bond-stroke" x1="${ax}" y1="${ay}" x2="${zx}" y2="${zy}"/>`;
    s += `<line class="bond-stroke" x1="${ax+px*off}" y1="${ay+py*off}" x2="${zx+px*off}" y2="${zy+py*off}"/>`;
    s += `<line class="bond-stroke" x1="${ax-px*off}" y1="${ay-py*off}" x2="${zx-px*off}" y2="${zy-py*off}"/>`;
  }
  s += `</g>`;
  return s;
}

function layoutPositions(m, cx, cy, r){
  const pos = {};
  pos[m.centralAtom] = { x:cx, y:cy, role:'central' };
  const terminals = m.bondPattern.map(b => b.atomA === m.centralAtom ? b.atomB : b.atomA);
  const geom = m.molecularGeometry;
  const eg = m.electronGeometry;
  const angles = anglesFor(geom, eg, terminals.length);
  for(let i=0;i<terminals.length;i++){
    const a = angles[i] * Math.PI/180;
    pos[terminals[i]] = { x: cx + Math.cos(a)*r, y: cy + Math.sin(a)*r, role:'terminal' };
  }
  return pos;
}

function anglesFor(geom, eg, n){
  switch(geom){
    case 'linear':
      return [180, 0];
    case 'bent':
      return [-130, -50];   // V opens upward
    case 'trigonal-planar':
      return [-90, 30, 150];
    case 'trigonal-pyramidal':
      // Project a tetrahedral 3-arm bottom view: one front + two back
      return [-90, 40, 140];
    case 'tetrahedral':
      // 2D projection: cross of 4 arms
      return [-110, -40, 50, 140];
    case 'trigonal-bipyramidal':
      // 5 arms: 2 axial vertical, 3 equatorial
      return [-90, 90, 0, 140, -140];
    case 'see-saw':
      // 4 arms: 2 axial vertical squeezed, 2 equatorial wide
      return [-100, 100, 0, 160];
    case 'T-shape':
      // 3 arms: 2 axial squeezed + 1 equatorial right
      return [-95, 95, 5];
    case 'square-planar':
      return [-90, 0, 90, 180];
    case 'octahedral':
      // 6 arms: 4 in plane + 2 axial; we offset axials slightly so they read
      return [-90, 90, 0, 180, -45, 135];
    case 'square-pyramidal':
      // 5 arms: 1 apex up + 4 in plane (drawn shorter to imply down-tilt)
      return [-90, -10, 80, 170, 260];
    case 'pentagonal-bipyramidal':
      // not used, but supported
      return [-90, 90, -36, 36, 108, 144, 216];
  }
  // fallback even spread
  const out = [];
  for(let i=0;i<n;i++) out.push(-90 + i*(360/n));
  return out;
}

function lonePairOffsets(atomName, m, positions, p, n, R){
  // Direction TO the central atom (or to a bonded neighbor for centrals)
  let bondedDirs = [];
  for(const b of m.bondPattern){
    if(b.atomA === atomName){
      const o = positions[b.atomB];
      bondedDirs.push(Math.atan2(o.y - p.y, o.x - p.x));
    } else if(b.atomB === atomName){
      const o = positions[b.atomA];
      bondedDirs.push(Math.atan2(o.y - p.y, o.x - p.x));
    }
  }
  // Choose lone-pair slot angles spread across the un-bonded hemispheres
  const slots = pickLPSlots(bondedDirs, n);
  const out = [];
  const ringR = R + 8;
  const dotGap = 6;
  for(const ang of slots){
    const cx = p.x + Math.cos(ang)*ringR;
    const cy = p.y + Math.sin(ang)*ringR;
    // Two dots perpendicular to the ring radius
    const px = -Math.sin(ang), py = Math.cos(ang);
    out.push({ x: cx + px*dotGap/2, y: cy + py*dotGap/2 });
    out.push({ x: cx - px*dotGap/2, y: cy - py*dotGap/2 });
  }
  return out;
}

function pickLPSlots(bondedDirs, n){
  // Build a candidate ring of 8 evenly spaced angles, then pick the n that
  // are furthest from any bonded direction.
  const candidates = [];
  for(let i=0;i<8;i++) candidates.push(-Math.PI + i*Math.PI/4);
  const score = a => {
    if(!bondedDirs.length) return 1;
    let min = Infinity;
    for(const b of bondedDirs){
      let d = Math.abs(angleDelta(a, b));
      if(d < min) min = d;
    }
    return min;
  };
  candidates.sort((a,b)=>score(b)-score(a));
  // Take top n, then re-sort to spread them
  const picked = candidates.slice(0, n);
  picked.sort((a,b)=>a-b);
  return picked;
}

function angleDelta(a, b){
  let d = a - b;
  while(d > Math.PI) d -= 2*Math.PI;
  while(d < -Math.PI) d += 2*Math.PI;
  return d;
}

function atomElement(name){
  // Strip trailing digit (H1 -> H, F3 -> F)
  return name.replace(/\d+$/, '');
}
window.LewisLayout = { renderBond: renderBond, layoutPositions: layoutPositions, lonePairOffsets: lonePairOffsets, atomElement: atomElement };
})();
