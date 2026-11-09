/* Accurate, on-demand 3D inspection for Six Views. No animation or remote assets. */

/**
 * Build the boundary of a union of unit voxels. Faces merge only across
 * coplanar cells with identical outward normals. TFE edges are genuine
 * creases; cube counting retains the unit grid on exposed surfaces.
 * Kept independent of Three.js so geometry can be checked in Node.
 */
export function voxelSurface(cubes, { grid = false } = {}) {
  const occupied = new Set(cubes.map(c => c.join(',')));
  const planes = new Map(), boundaries = new Map();
  const positions = [], normals = [], lines = [];
  const key = p => p.join(',');
  function addEdge(a, b, normal) {
    const ka = key(a), kb = key(b), id = ka < kb ? ka + '|' + kb : kb + '|' + ka;
    if (!boundaries.has(id)) boundaries.set(id, { a, b, normals: new Set() });
    boundaries.get(id).normals.add(normal);
  }
  for (const cell of cubes) for (let axis = 0; axis < 3; axis++) for (const sign of [-1, 1]) {
    const neighbour = cell.slice(); neighbour[axis] += sign;
    if (occupied.has(key(neighbour))) continue;
    const u = (axis + 1) % 3, v = (axis + 2) % 3;
    const at = cell[axis] + (sign > 0 ? 1 : 0);
    const id = axis + ':' + sign + ':' + at;
    if (!planes.has(id)) planes.set(id, { axis, sign, at, u, v, cells: new Set() });
    planes.get(id).cells.add(cell[u] + ',' + cell[v]);
    const points = [[0,0], [1,0], [1,1], [0,1]].map(([du,dv]) => {
      const p = cell.slice(); p[axis] = at; p[u] += du; p[v] += dv; return p;
    });
    for (let j = 0; j < 4; j++) addEdge(points[j], points[(j + 1) % 4], axis + ':' + sign);
  }
  for (const face of planes.values()) {
    const cells = face.cells;
    const starts = Array.from(cells, s => s.split(',').map(Number)).sort((a,b) => a[1]-b[1] || a[0]-b[0]);
    for (const [u0, v0] of starts) {
      if (!cells.has(u0 + ',' + v0)) continue;
      let width = 1, height = 1;
      while (cells.has((u0 + width) + ',' + v0)) width++;
      while (Array.from({length:width}, (_,i) => cells.has((u0+i) + ',' + (v0+height))).every(Boolean)) height++;
      for (let u = 0; u < width; u++) for (let v = 0; v < height; v++) cells.delete((u0+u) + ',' + (v0+v));
      const points = [[u0,v0], [u0+width,v0], [u0+width,v0+height], [u0,v0+height]].map(([u,v]) => {
        const p = [0,0,0]; p[face.axis] = face.at; p[face.u] = u; p[face.v] = v; return p;
      });
      const order = face.sign > 0 ? [0,1,2,0,2,3] : [0,2,1,0,3,2];
      const n = [0,0,0]; n[face.axis] = face.sign;
      for (const i of order) { positions.push(...points[i]); normals.push(...n); }
    }
  }
  for (const edge of boundaries.values()) {
    if (grid || edge.normals.size > 1) lines.push(...edge.a, ...edge.b);
  }
  return { positions, normals, lines };
}

/** Front = y-negative, End = x-positive, Top = z-positive. */
export function createReveal(THREE, stage) {
  const win = stage.ownerDocument.defaultView, doc = stage.ownerDocument;
  let renderer, disposed = false, lost = false, object = null, frame = 0;
  let currentItem = null, active = null, drag = null, width = 1, height = 1;
  let theta = Math.PI / 4, elevation = Math.atan(1 / Math.sqrt(2));
  let radius = 2, distance = 10;
  const cleanups = [], buttons = Array.from(stage.querySelectorAll('[data-station]'));
  const fallback = doc.createElement('div');
  fallback.className = 'fallback';
  fallback.setAttribute('role', 'status');
  const fallbackText = 'The interactive 3D view is unavailable. The correct projection or cube-count explanation below still works.';
  function showFallback(text) {
    fallback.textContent = text;
    if (!fallback.parentNode) stage.appendChild(fallback);
  }
  try {
    renderer = new THREE.WebGLRenderer({ antialias:true, alpha:false, powerPreference:'low-power' });
  } catch (_) {
    showFallback(fallbackText);
    buttons.forEach(b => { b.disabled = true; });
    return { ok:false, resize(){}, show(){}, station(){}, dispose(){ fallback.remove(); } };
  }
  renderer.setPixelRatio(Math.min(win.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x102e27, 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const canvas = renderer.domElement;
  canvas.tabIndex = 0;
  canvas.style.touchAction = 'pan-y';
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', 'Interactive solid. Drag horizontally to rotate. Use arrow keys to rotate, or 1 for Front, 2 for Top and 3 for End.');
  stage.insertBefore(canvas, stage.firstChild);
  // All changes are immediate, so reduced-motion needs no special animation.
  stage.dataset.motion = win.matchMedia && win.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'reduced' : 'static';
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-4, 4, 4, -4, 0.01, 100);
  const center = new THREE.Vector3();
  scene.add(new THREE.AmbientLight(0xffffff, 1.5));
  const sun = new THREE.DirectionalLight(0xfff2d6, 2.1); sun.position.set(5,-7,10); scene.add(sun);
  const fill = new THREE.DirectionalLight(0xc3e7d7, 1.1); fill.position.set(-5,5,6); scene.add(fill);

  function listen(target, name, fn, options) {
    target.addEventListener(name, fn, options);
    cleanups.push(() => target.removeEventListener(name, fn, options));
  }
  function isVisible() {
    return !disposed && !lost && !stage.closest('[hidden]') && doc.visibilityState !== 'hidden';
  }
  function render() {
    frame = 0;
    if (isVisible()) renderer.render(scene, camera);
  }
  function invalidate() {
    if (!disposed && !frame) frame = win.requestAnimationFrame(render);
  }
  function updateButtons() {
    buttons.forEach(b => {
      const selected = b.dataset.station === active;
      b.classList.toggle('on', selected);
      b.setAttribute('aria-pressed', String(selected));
    });
    stage.dataset.view = active || 'orbit';
  }
  function fit() {
    const aspect = Math.max(0.05, width / height);
    // A bounding sphere fits every rotation; leave room for the lower toolbar.
    const verticalPad = Math.min(66, height * 0.22);
    const horizontalPad = Math.min(24, width * 0.15);
    const usableH = Math.max(1, height - 2 * verticalPad);
    const usableW = Math.max(1, width - 2 * horizontalPad);
    const halfHeight = radius * Math.max(height / usableH, width / usableW / aspect);
    camera.left = -halfHeight * aspect; camera.right = halfHeight * aspect;
    camera.top = halfHeight; camera.bottom = -halfHeight;
    camera.near = 0.01; camera.far = distance + radius * 5 + 10;
    camera.updateProjectionMatrix();
  }
  function orbit() {
    camera.up.set(0,0,1);
    camera.position.set(
      center.x + distance * Math.cos(elevation) * Math.cos(theta),
      center.y + distance * Math.cos(elevation) * Math.sin(theta),
      center.z + distance * Math.sin(elevation)
    );
    camera.lookAt(center); camera.updateMatrixWorld();
    invalidate();
  }
  function station(name) {
    if (disposed || !['front','end','top','iso'].includes(name)) return;
    resetDrag();
    active = name;
    if (name === 'top') {
      theta = -Math.PI/2; elevation = Math.PI/2;
      camera.up.set(0,1,0);
      camera.position.set(center.x,center.y,center.z+distance);
      camera.lookAt(center); camera.updateMatrixWorld(); invalidate();
    } else {
      theta = name === 'front' ? -Math.PI/2 : name === 'end' ? 0 : Math.PI/4;
      elevation = name === 'iso' ? Math.atan(1/Math.sqrt(2)) : 0;
      orbit();
    }
    updateButtons();
  }
  function resize() {
    if (disposed) return;
    const rect = stage.getBoundingClientRect();
    width = Math.max(1, rect.width || stage.clientWidth || 640);
    height = Math.max(1, rect.height || stage.clientHeight || width/1.6);
    renderer.setSize(width, height, false); fit(); invalidate();
  }
  function disposeObject() {
    if (!object) return;
    scene.remove(object);
    const geometries = new Set(), materials = new Set();
    object.traverse(node => {
      if (node.geometry) geometries.add(node.geometry);
      if (node.material) (Array.isArray(node.material) ? node.material : [node.material]).forEach(m => materials.add(m));
    });
    geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose());
    object.clear(); object = null;
  }
  function show(item) {
    if (disposed) return;
    resetDrag(); currentItem = item;
    disposeObject();
    // The printed cube diagram uses a reflected screen convention. Swapping
    // its x/y axes preserves the solid and makes the isometric reveal match.
    // TFE coordinates must remain untouched for its named projections.
    const displayCell = c => item.subtest === 'cubes' ? [c[1],c[0],c[2]] : c.slice();
    const cubes = item.model.cubes ? item.model.cubes.map(displayCell) : [];
    if (!item.model.cubes) {
      const {V,NX,NY,NZ} = item.model;
      for (let x=0;x<NX;x++) for(let y=0;y<NY;y++) for(let z=0;z<NZ;z++) if(V[x][y][z]) cubes.push([x,y,z]);
    }
    if (!cubes.length) { showFallback('This solid could not be displayed. Use the explanation below.'); return; }
    if (!lost) fallback.remove();
    object = new THREE.Group();
    const data = voxelSurface(cubes, { grid:item.subtest === 'cubes' });
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(data.positions,3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(data.normals,3));
    const material = new THREE.MeshLambertMaterial({
      color:0xe6ddbd, polygonOffset:true, polygonOffsetFactor:1, polygonOffsetUnits:1
    });
    object.add(new THREE.Mesh(geometry,material));
    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute('position',new THREE.Float32BufferAttribute(data.lines,3));
    object.add(new THREE.LineSegments(lineGeometry,new THREE.LineBasicMaterial({color:0x304c3c})));
    if (item.subtest === 'cubes' && item.highlight && item.highlight.length) {
      const highlightGeometry = new THREE.BoxGeometry(1.012,1.012,1.012);
      const highlightMaterial = new THREE.MeshBasicMaterial({
        color:0xf4c95f, transparent:true, opacity:0.42, depthTest:false, depthWrite:false
      });
      const outlineGeometry = new THREE.EdgesGeometry(highlightGeometry);
      const outlineMaterial = new THREE.LineBasicMaterial({
        color:0xffda77, transparent:true, opacity:0.95, depthTest:false, depthWrite:false
      });
      for (const sourceCell of item.highlight) {
        const c = displayCell(sourceCell);
        const cube = new THREE.Mesh(highlightGeometry,highlightMaterial);
        cube.position.set(c[0]+0.5,c[1]+0.5,c[2]+0.5); cube.renderOrder=5; object.add(cube);
        const outline = new THREE.LineSegments(outlineGeometry,outlineMaterial);
        outline.position.copy(cube.position); outline.renderOrder=6; object.add(outline);
      }
    }
    scene.add(object);
    const bounds = new THREE.Box3().setFromObject(object);
    bounds.getCenter(center);
    radius = Math.max(0.5,bounds.getSize(new THREE.Vector3()).length()/2);
    distance = radius*4+5;
    canvas.setAttribute('aria-label', item.subtest === 'cubes'
      ? 'Interactive cube stack. Gold marks the '+item.answer+' cubes with '+item.n+' painted faces, including hidden cubes. Drag horizontally or use arrow keys to rotate. 1 Front, 2 Top, 3 End.'
      : 'Interactive solid with its true surface edges. Dashed hidden lines are shown in the separate projection. Drag horizontally or use arrow keys to rotate. 1 Front, 2 Top, 3 End.');
    resize(); station('iso');
  }
  function resetDrag() {
    if (drag && canvas.hasPointerCapture && canvas.hasPointerCapture(drag.id)) {
      try { canvas.releasePointerCapture(drag.id); } catch (_) {}
    }
    drag = null;
  }
  function rotate(dx,dy) {
    active = null;
    theta -= dx;
    elevation = Math.max(-Math.PI/2+0.025,Math.min(Math.PI/2-0.025,elevation+dy));
    updateButtons(); orbit();
  }
  listen(canvas,'pointerdown',e => {
    if (e.button !== 0 || !currentItem || lost) return;
    drag={id:e.pointerId,x:e.clientX,y:e.clientY};
    canvas.focus({preventScroll:true});
    try { canvas.setPointerCapture(e.pointerId); } catch (_) {}
  });
  listen(canvas,'pointermove',e => {
    if (!drag || drag.id !== e.pointerId) return;
    const dx=(e.clientX-drag.x)*0.008, dy=(e.clientY-drag.y)*0.008;
    drag.x=e.clientX; drag.y=e.clientY;
    rotate(dx,dy);
  });
  listen(canvas,'pointerup',resetDrag); listen(canvas,'pointercancel',resetDrag);
  listen(canvas,'lostpointercapture',() => { drag=null; });
  listen(win,'blur',resetDrag);
  listen(doc,'visibilitychange',() => { resetDrag(); invalidate(); });
  listen(win,'keydown',e => {
    if (!isVisible() || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
    const target=e.target;
    if (target && (target.isContentEditable || target.closest && target.closest('input,textarea,select,[contenteditable="true"]'))) return;
    const names={'1':'front','2':'top','3':'end'};
    if (names[e.key]) { e.preventDefault(); station(names[e.key]); return; }
    if (target !== canvas) return;
    const moves={ArrowLeft:[-0.13,0],ArrowRight:[0.13,0],ArrowUp:[0,0.13],ArrowDown:[0,-0.13]};
    if (moves[e.key]) { e.preventDefault(); rotate(...moves[e.key]); }
  });
  buttons.forEach(b => listen(b,'click',() => station(b.dataset.station)));
  listen(win,'resize',resize);
  if (win.ResizeObserver) {
    const observer=new win.ResizeObserver(resize); observer.observe(stage);
    cleanups.push(() => observer.disconnect());
  }
  listen(canvas,'webglcontextlost',e => {
    e.preventDefault(); lost=true; resetDrag();
    showFallback('The 3D view was interrupted. The projection or cube-count explanation still works.');
  });
  listen(canvas,'webglcontextrestored',() => {
    lost=false; fallback.remove(); resize(); invalidate();
  });
  function dispose() {
    if (disposed) return;
    resetDrag(); disposed=true;
    if (frame) win.cancelAnimationFrame(frame);
    cleanups.forEach(fn => fn()); disposeObject();
    renderer.dispose(); canvas.remove(); fallback.remove();
  }
  listen(win,'pagehide',e => { if (!e.persisted) dispose(); else resetDrag(); });
  listen(win,'pageshow',() => { if (!disposed) resize(); });
  resize(); station('iso');
  return { get ok(){return !disposed && !lost;}, resize, show, station, dispose };
}
