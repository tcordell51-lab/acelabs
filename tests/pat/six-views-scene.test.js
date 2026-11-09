'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {loadEngine} = require('./helpers.js');

const loadModule = relative => import('data:text/javascript;base64,' +
  fs.readFileSync(path.join(__dirname, relative)).toString('base64'));
const sceneModule = loadModule('../../games/six-views/scene.js');
const threeModule = loadModule('../../shared/three.module.min.js');
const edgeKey = (a,b) => [a.join(','),b.join(',')].sort().join('|');

function verifyBoundary(voxelSurface,cubes,grid) {
  const d=voxelSurface(cubes,{grid}), occupied=new Set(cubes.map(c=>c.join(',')));
  const has=p=>occupied.has(p.join(','));
  let expectedArea=0;
  for(const c of cubes)for(let axis=0;axis<3;axis++)for(const sign of[-1,1]){
    const neighbour=c.slice();neighbour[axis]+=sign;if(!has(neighbour))expectedArea++;
  }
  let area=0;
  for(let i=0;i<d.positions.length;i+=9){
    const a=d.positions.slice(i,i+3);
    const b=d.positions.slice(i+3,i+6).map((n,j)=>n-a[j]);
    const c=d.positions.slice(i+6,i+9).map((n,j)=>n-a[j]);
    const cross=[b[1]*c[2]-b[2]*c[1],b[2]*c[0]-b[0]*c[2],b[0]*c[1]-b[1]*c[0]];
    const n=d.normals.slice(i,i+3);
    assert.ok(cross.reduce((s,v,j)=>s+v*n[j],0)>0,'face winding is outward');
    area+=Math.hypot(...cross)/2;
  }
  assert.equal(area,expectedArea,'merged faces retain the exact exposed area');

  // Independent edge rule: inspect four quadrants around every grid edge.
  // One/three occupied quadrants, or two diagonally opposite ones, form a crease.
  const expected=new Set();
  const min=[0,1,2].map(i=>Math.min(...cubes.map(c=>c[i])));
  const max=[0,1,2].map(i=>Math.max(...cubes.map(c=>c[i]))+1);
  for(let axis=0;axis<3;axis++){
    const u=(axis+1)%3,v=(axis+2)%3;
    for(let a=min[axis];a<max[axis];a++)for(let b=min[u];b<=max[u];b++)for(let c=min[v];c<=max[v];c++){
      const bits=[];
      for(const[du,dv]of[[-1,-1],[0,-1],[0,0],[-1,0]]){
        const p=[0,0,0];p[axis]=a;p[u]=b+du;p[v]=c+dv;bits.push(has(p));
      }
      const n=bits.filter(Boolean).length;
      const crease=n===1||n===3||(n===2&&bits[0]===bits[2]);
      if(grid?n>0&&n<4:crease){
        const p=[0,0,0];p[axis]=a;p[u]=b;p[v]=c;const q=p.slice();q[axis]++;
        expected.add(edgeKey(p,q));
      }
    }
  }
  const actual=new Set();
  for(let i=0;i<d.lines.length;i+=6)actual.add(edgeKey(d.lines.slice(i,i+3),d.lines.slice(i+3,i+6)));
  assert.deepEqual(actual,expected,'only intended creases or unit-grid edges are drawn');
}

// An event/DOM harness, not a WebGL mock of the geometry: real Three cameras,
// meshes, materials and projection math run below without a GPU.
class Target {
  constructor(){this.listeners=new Map();}
  addEventListener(name,fn){if(!this.listeners.has(name))this.listeners.set(name,new Set());this.listeners.get(name).add(fn);}
  removeEventListener(name,fn){this.listeners.get(name)?.delete(fn);}
  emit(name,event={}){
    event.type=name;event.target=event.target||this;
    event.preventDefault=event.preventDefault||(()=>{event.defaultPrevented=true;});
    for(const fn of this.listeners.get(name)||[])fn(event);
    return event;
  }
  listenerCount(){return [...this.listeners.values()].reduce((sum,s)=>sum+s.size,0);}
}
class Element extends Target {
  constructor(doc,tag='div'){
    super();this.ownerDocument=doc;this.tagName=tag.toUpperCase();this.children=[];
    this.dataset={};this.style={};this.attributes={};this.classes=new Set();this.captures=new Set();
    this.classList={toggle:(n,on)=>on?this.classes.add(n):this.classes.delete(n)};
  }
  appendChild(c){c.parentNode=this;this.children.push(c);return c;}
  insertBefore(c,b){c.parentNode=this;const i=this.children.indexOf(b);this.children.splice(i<0?0:i,0,c);return c;}
  remove(){if(this.parentNode){this.parentNode.children=this.parentNode.children.filter(c=>c!==this);this.parentNode=null;}}
  setAttribute(k,v){this.attributes[k]=String(v);}
  getAttribute(k){return this.attributes[k];}
  querySelectorAll(){return this.buttons||[];}
  closest(selector){
    if(selector==='[hidden]')return this.hidden?this:null;
    return /input|textarea|select/.test(selector)&&['INPUT','TEXTAREA','SELECT'].includes(this.tagName)?this:null;
  }
  getBoundingClientRect(){return this.rect||{width:960,height:600};}
  focus(){this.ownerDocument.activeElement=this;}
  setPointerCapture(id){this.captures.add(id);}
  hasPointerCapture(id){return this.captures.has(id);}
  releasePointerCapture(id){this.captures.delete(id);}
}
function harness(THREE,createReveal){
  const doc=new Target(),win=new Target(),frames=new Map();let serial=0,renderer;
  doc.visibilityState='visible';doc.defaultView=win;
  doc.createElement=tag=>new Element(doc,tag);
  win.devicePixelRatio=2;win.matchMedia=()=>({matches:true});
  win.requestAnimationFrame=fn=>{frames.set(++serial,fn);return serial;};
  win.cancelAnimationFrame=id=>frames.delete(id);
  const stage=new Element(doc);
  stage.buttons=['front','top','end','iso'].map(name=>{
    const button=new Element(doc,'button');button.dataset.station=name;return button;
  });
  class Renderer {
    constructor(){renderer=this;this.domElement=new Element(doc,'canvas');this.renders=0;}
    setPixelRatio(){} setClearColor(){} setSize(w,h){this.size=[w,h];}
    render(scene,camera){this.scene=scene;this.camera=camera;this.renders++;}
    dispose(){this.disposed=true;}
  }
  const api=createReveal({...THREE,WebGLRenderer:Renderer},stage);
  function flush(){const callbacks=[...frames.values()];frames.clear();callbacks.forEach(fn=>fn());}
  return {api,stage,doc,win,renderer,flush,frames};
}
function cubeItem(cubes=[[0,0,0],[1,0,0],[1,0,1],[2,0,0]]){
  return{subtest:'cubes',model:{cubes},highlight:[cubes[cubes.length-1]],n:3,answer:1};
}
function tfeItem(){
  return{subtest:'tfe',model:{NX:3,NY:2,NZ:2,V:[
    [[false,false],[false,false]],
    [[true,true],[false,false]],
    [[true,false],[true,false]]
  ]}};
}

test('Six Views scene: merged cube has six faces, no coplanar seams, and correct winding',async()=>{
  const {voxelSurface}=await sceneModule;
  const cubes=[];for(let x=0;x<2;x++)for(let y=0;y<2;y++)for(let z=0;z<2;z++)cubes.push([x,y,z]);
  assert.equal(voxelSurface(cubes).positions.length,6*2*3*3);
  assert.equal(voxelSurface(cubes).lines.length,24*6,'only the subdivided outer twelve edges remain');
  assert.ok(voxelSurface(cubes,{grid:true}).lines.length>voxelSurface(cubes).lines.length);
  verifyBoundary(voxelSurface,cubes,false);verifyBoundary(voxelSurface,cubes,true);
  verifyBoundary(voxelSurface,[[0,0,0],[1,0,0],[1,1,0],[1,1,1]],false);
});

test('Six Views scene: seeded solids preserve surface area and exact independent edge sets',async()=>{
  const {voxelSurface}=await sceneModule,PAT=loadEngine();
  for(let seed=1000;seed<1025;seed++){
    const item=PAT.tfe.generate(seed),V=item.figure.V,cubes=[];
    for(let x=0;x<V.length;x++)for(let y=0;y<V[x].length;y++)for(let z=0;z<V[x][y].length;z++)if(V[x][y][z])cubes.push([x,y,z]);
    verifyBoundary(voxelSurface,cubes,false);
  }
  for(let seed=1000;seed<1100;seed++)verifyBoundary(voxelSurface,PAT.cubes.generate(seed).figure.cubes,true);
});

test('Six Views scene: all orthographic stations fit narrow and wide stages and preserve TFE axes',async()=>{
  const {createReveal}=await sceneModule,THREE=await threeModule;
  const h=harness(THREE,createReveal);h.api.show(tfeItem());h.flush();
  assert.equal(h.stage.dataset.motion,'reduced');assert.equal(h.stage.dataset.view,'iso');
  assert.equal(h.stage.buttons.find(b=>b.dataset.station==='iso').getAttribute('aria-pressed'),'true');
  for(const[width,height]of[[360,640],[1280,720],[240,150],[720,240],[320,960]]){
    h.stage.rect={width,height};h.api.resize();
    for(const station of['front','end','top','iso']){
      h.api.station(station);h.flush();
      const camera=h.renderer.camera,object=h.renderer.scene.children.find(o=>o.isGroup);
      object.updateMatrixWorld(true);const box=new THREE.Box3().setFromObject(object);
      assert.equal(camera.isOrthographicCamera,true);
      for(const x of[box.min.x,box.max.x])for(const y of[box.min.y,box.max.y])for(const z of[box.min.z,box.max.z]){
        const p=new THREE.Vector3(x,y,z).project(camera);
        assert.ok([p.x,p.y,p.z].every(Number.isFinite));
        assert.ok(Math.abs(p.x)<1&&Math.abs(p.y)<1,station+' fits '+width+'x'+height);
      }
      const center=box.getCenter(new THREE.Vector3()),origin=center.clone().project(camera);
      const axisScreen=axis=>center.clone().add(axis).project(camera).sub(origin);
      const x=axisScreen(new THREE.Vector3(1,0,0)),y=axisScreen(new THREE.Vector3(0,1,0)),z=axisScreen(new THREE.Vector3(0,0,1));
      if(station==='front'){assert.ok(x.x>0&&z.y>0);assert.ok(Math.abs(y.x)<1e-9&&Math.abs(y.y)<1e-9);}
      if(station==='end'){assert.ok(y.x>0&&z.y>0);assert.ok(Math.abs(x.x)<1e-9&&Math.abs(x.y)<1e-9);}
      if(station==='top'){assert.ok(x.x>0&&y.y>0);assert.ok(Math.abs(z.x)<1e-9&&Math.abs(z.y)<1e-9);}
    }
  }
  h.api.dispose();assert.equal(h.api.ok,false);assert.equal(h.renderer.disposed,true);
});

test('Six Views scene: cube-only coordinate swap matches SVG and transforms highlights consistently',async()=>{
  const {createReveal}=await sceneModule,THREE=await threeModule;
  const h=harness(THREE,createReveal);h.api.show(cubeItem([[2,0,0]]));h.flush();
  let object=h.renderer.scene.children.find(o=>o.isGroup),surface=object.children[0];
  surface.geometry.computeBoundingBox();
  assert.deepEqual(surface.geometry.boundingBox.min.toArray(),[0,2,0]);
  assert.deepEqual(surface.geometry.boundingBox.max.toArray(),[1,3,1]);
  assert.deepEqual(object.children[2].position.toArray(),[0.5,2.5,0.5]);
  const origin=new THREE.Vector3(0,0,0).project(h.renderer.camera);
  const originalX=new THREE.Vector3(0,1,0).project(h.renderer.camera).sub(origin);
  const originalY=new THREE.Vector3(1,0,0).project(h.renderer.camera).sub(origin);
  assert.ok(originalX.x>0&&originalY.x<0,'original x is screen-right, original y screen-left');
  assert.ok(originalX.y<0&&originalY.y<0,'both positive footprint axes point down the page');
  h.api.show(tfeItem());h.flush();object=h.renderer.scene.children.find(o=>o.isGroup);
  object.children[0].geometry.computeBoundingBox();
  assert.deepEqual(object.children[0].geometry.boundingBox.min.toArray(),[1,0,0],'TFE coordinates are not swapped');
  h.api.dispose();
});

test('Six Views scene: guards fields, cancels interrupted drag, handles context loss, and disposes resources',async()=>{
  const {createReveal}=await sceneModule,THREE=await threeModule;
  const h=harness(THREE,createReveal);h.api.show(cubeItem());h.flush();
  const canvas=h.renderer.domElement,input=new Element(h.doc,'input');
  h.win.emit('keydown',{key:'1',target:input});assert.equal(h.stage.dataset.view,'iso');
  h.win.emit('keydown',{key:'1',target:canvas});h.flush();assert.equal(h.stage.dataset.view,'front');
  canvas.emit('pointerdown',{button:0,pointerId:7,clientX:30,clientY:30});
  h.win.emit('blur');canvas.emit('pointermove',{pointerId:7,clientX:80,clientY:40});h.flush();
  assert.equal(h.stage.dataset.view,'front','blur cancels drag');
  h.win.emit('keydown',{key:'ArrowLeft',target:canvas});h.flush();assert.equal(h.stage.dataset.view,'orbit');
  const renders=h.renderer.renders;h.stage.hidden=true;h.api.resize();h.flush();assert.equal(h.renderer.renders,renders);
  h.stage.hidden=false;h.api.resize();h.flush();
  canvas.emit('webglcontextlost');assert.equal(h.api.ok,false);
  assert.ok(h.stage.children.some(c=>c.className==='fallback'));
  canvas.emit('webglcontextrestored');h.flush();assert.equal(h.api.ok,true);
  assert.ok(!h.stage.children.some(c=>c.className==='fallback'));
  let disposed=0;h.renderer.scene.children.find(o=>o.isGroup).traverse(o=>{if(o.geometry)o.geometry.addEventListener('dispose',()=>disposed++);});
  h.api.show(tfeItem());h.flush();assert.ok(disposed>=4,'old meshes and shared highlight geometry disposed');
  h.api.dispose();h.api.dispose();
  assert.equal(h.win.listenerCount(),0);assert.equal(h.doc.listenerCount(),0);assert.equal(canvas.listenerCount(),0);
  assert.equal(h.frames.size,0);assert.equal(h.stage.children.length,0);
});

test('Six Views scene: WebGL construction failure leaves an accessible explanation',async()=>{
  const {createReveal}=await sceneModule;
  const doc=new Target();doc.defaultView=new Target();doc.createElement=tag=>new Element(doc,tag);
  const stage=new Element(doc);stage.buttons=['front','top','end'].map(()=>new Element(doc,'button'));
  const api=createReveal({WebGLRenderer:class{constructor(){throw new Error('WebGL disabled');}}},stage);
  assert.equal(api.ok,false);assert.equal(stage.children[0].getAttribute('role'),'status');
  assert.ok(stage.children[0].textContent.includes('explanation below'));
  assert.ok(stage.buttons.every(b=>b.disabled));api.show(cubeItem());api.resize();api.dispose();
});
