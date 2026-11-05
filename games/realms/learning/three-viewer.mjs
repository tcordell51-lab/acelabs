// Demand-rendered, local-only inspection. No loader, network, animation loop or grading.
import * as T from './vendor/three-r187.mjs';
import {createCubeScene} from './three-cube-scene.mjs';
import {createOrthographicScene,setOrthographicRendering} from './three-orthographic-scene.mjs';
import {orthographicCaption} from './three-orthographic-model.mjs';

const v=p=>new T.Vector3(...p);
export function mountThreeInspector(host,spec,{onExpose=()=>true}={}){
 let disposed=false,failed=false,renderer=null,observer=null,model=null,current=spec.defaultView,cameraView=spec.defaultCameraView||'orbit';
 const initialYaw=spec.kind==='paper'?-.2:spec.kind==='cubes'?-.55:0,initialPitch=spec.kind==='orthographic'?0:spec.kind==='paper'?-.55:spec.kind==='cubes'?.38:.15;
 let yaw=initialYaw,pitch=initialPitch,zoom=1;
 const scene=new T.Scene(),group=new T.Group(),camera=new T.OrthographicCamera(-5,5,4,-4,.1,100);
 const materials=new Set(),geometries=new Set(),labels=[];
 scene.background=new T.Color('#17332f');scene.add(group);
 scene.add(new T.AmbientLight('#e4f4ed',2.4));
 const key=new T.DirectionalLight('#fff0cd',3.5);key.position.set(-3,6,8);scene.add(key);
 const rim=new T.DirectionalLight('#a9dce5',2);rim.position.set(4,-2,-3);scene.add(rim);
 camera.position.set(0,0,12);camera.lookAt(0,0,0);
 host.replaceChildren();host.className='exp-three';
 const title=document.createElement('h4');title.textContent=spec.title;host.append(title);
 const views=document.createElement('div');views.className='exp-three-tabs';views.setAttribute('role','group');views.setAttribute('aria-label','Revealed structures');host.append(views);
 const frame=document.createElement('div');frame.className='exp-three-frame';host.append(frame);
 const overlay=document.createElement('div');overlay.className='exp-three-labels';overlay.setAttribute('aria-hidden','true');frame.append(overlay);
 const controls=document.createElement('div');controls.className='exp-three-controls';controls.setAttribute('role','group');controls.setAttribute('aria-label','Model viewing controls');host.append(controls);
 const caption=document.createElement('p');caption.className='exp-three-caption';host.append(caption);
 const legend=document.createElement('p');legend.className='exp-three-legend';host.append(legend);
 const note=document.createElement('p');note.className='exp-three-note';host.append(note);
 const status=document.createElement('p');status.className='exp-three-status';status.setAttribute('role','status');host.append(status);
 function control(parent,text,action){const b=document.createElement('button');b.type='button';b.className='exp-tool';b.textContent=text;b.addEventListener('click',e=>{e.stopPropagation();try{if(!disposed&&!failed&&onExpose()!==false&&!disposed&&!failed)action();}catch{unavailable();}});parent.append(b);return b;}
 const cameraButtons=[];
 const viewButtons=spec.views.map(item=>({id:item.id,button:control(views,item.label,()=>{current=item.id;rebuild();})}));
 for(const item of spec.cameraViews||[])cameraButtons.push({id:item.id,button:control(controls,item.label,()=>{cameraView=item.id;yaw=item.yaw;pitch=item.pitch;zoom=1;draw();})});
 for(const [label,action] of [
  ['Turn left',()=>yaw-=Math.PI/8],['Turn right',()=>yaw+=Math.PI/8],
  ['Tilt up',()=>pitch=Math.min(1.25,pitch+.2)],['Tilt down',()=>pitch=Math.max(-1.25,pitch-.2)],
  ['Zoom in',()=>zoom=Math.min(spec.kind==='orthographic'?1.2:1.65,zoom+.15)],['Zoom out',()=>zoom=Math.max(.7,zoom-.15)],
  ['Reset view',()=>{yaw=initialYaw;pitch=initialPitch;zoom=1;}]
 ])control(controls,label,()=>{action();if(spec.kind==='orthographic'&&label!=='Zoom in'&&label!=='Zoom out'){cameraView=label==='Reset view'?'front':'orbit';}draw();});
 function material(color,extra={}){const m=new T.MeshStandardMaterial({color,roughness:.48,metalness:.08,...extra});materials.add(m);return m;}
 function mesh(geometry,mat,position=[0,0,0]){geometries.add(geometry);const m=new T.Mesh(geometry,mat);m.position.copy(v(position));group.add(m);return m;}
 function stick(a,b,radius,mat){const start=v(a),end=v(b),direction=end.clone().sub(start),length=direction.length();if(!length)return;
  const m=mesh(new T.CylinderGeometry(radius,radius,length,12),mat,start.clone().add(end).multiplyScalar(.5).toArray());m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),direction.normalize());return m;}
 function resetObjects(){for(const g of geometries)g.dispose();for(const m of materials)m.dispose();geometries.clear();materials.clear();group.clear();labels.length=0;overlay.replaceChildren();}
 function molecule(){
  const atoms=new Map(model.atoms.map(a=>[a.id,a])),bondMat=material('#cbd5ca'),pairMat=material('#ffda79'),arrowMat=material('#efb858');
  for(const b of model.bonds)stick(atoms.get(b.a).position,atoms.get(b.b).position,.075,bondMat);
  for(const a of model.atoms){mesh(new T.SphereGeometry(a.displayRadius,24,16),material(a.color),a.position);if(a.element!=='H'){
   const el=document.createElement('span');el.textContent=a.element+(a.charge<0?'⁻':a.charge>0?'⁺':'');overlay.append(el);labels.push({el,position:v(a.position)});
  }}
  for(const pair of model.electronPairs)for(const sign of [-1,1])mesh(new T.SphereGeometry(.045,10,8),pairMat,pair.position.map((n,i)=>n+sign*pair.symbolOffset[i]));
  for(const a of model.arrows){const points=a.points.map(v),curve=new T.CubicBezierCurve3(...points),target=atoms.get(a.to.atomId),center=v(target.position);
   // Keep the reviewed semantic target at the atom, but trim displayed geometry
   // to its surface so the arrowhead cannot disappear inside an opaque sphere.
   const beforeSurface=clearance=>{let t=1;while(t>0&&curve.getPoint(t).distanceTo(center)<target.displayRadius+clearance)t-=.002;return Math.max(0,t);};
   const t=beforeSurface(.23),ab=points[0].clone().lerp(points[1],t),bc=points[1].clone().lerp(points[2],t),de=ab.clone().lerp(bc,t);
   const trimmed=new T.CubicBezierCurve3(points[0],ab,de,curve.getPoint(t));mesh(new T.TubeGeometry(trimmed,32,.025,7,false),arrowMat);
   const tipT=beforeSurface(.055),tangent=curve.getTangent(tipT).normalize(),headCenter=curve.getPoint(tipT).addScaledVector(tangent,-.12);
   const tip=mesh(new T.ConeGeometry(.10,.24,12),arrowMat,headCenter.toArray());tip.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),tangent);
  }
  // Dashed line is an approach guide, never rendered as another covalent bond.
  for(const guide of model.guides){const [a,,b]=guide.points.map(v),delta=b.clone().sub(a);for(let i=0;i<24;i+=2)stick(a.clone().addScaledVector(delta,i/24).toArray(),a.clone().addScaledVector(delta,(i+.6)/24).toArray(),.012,pairMat);}
  caption.textContent=model.title+'. '+model.caption;
  legend.textContent='C: carbon · H: small ivory atoms · S: sulfur · Br: bromine. Sticks are covalent bonds; gold paired dots are lone pairs. '+(model.arrows.length?model.arrows.map(a=>a.label).join(' ')+' Both arrows belong to one concerted step. The dashed line marks backside approach.':'Sulfur is neutral; separate bromide has charge −1.');
  note.textContent='Idealized teaching geometry, with counterion and solvent omitted. Reactants and products are separate static structures, not a reaction animation. Atom sizes, distances and lone-pair positions are schematic. No mastery credit.';
 }
 function paper(){
  const [x0,y0,x1,y1]=model.bounds,shape=new T.Shape();shape.moveTo(x0-3,y0-3);shape.lineTo(x1-3,y0-3);shape.lineTo(x1-3,y1-3);shape.lineTo(x0-3,y1-3);shape.closePath();
  for(const hole of model.holes){const path=new T.Path();path.absarc(hole.x-3,hole.y-3,hole.r,0,2*Math.PI,true);shape.holes.push(path);}
  for(let i=0;i<model.layers;i++)mesh(new T.ExtrudeGeometry(shape,{depth:.045,bevelEnabled:false,curveSegments:24}),material(i%2?'#cbdac5':'#f5e8ba',{side:T.DoubleSide}),[0,0,i*.13]);
  caption.textContent=model.label;
  legend.textContent='Every circular opening passes through every remaining layer. The initial packet and the current revealed sheet are the only snapshots available.';
  note.textContent=model.note+' This view earns no mastery credit.';
 }
 function cubes(){
  const built=createCubeScene(model);for(const object of built.objects)group.add(object);for(const geometry of built.geometries)geometries.add(geometry);for(const material of built.materials)materials.add(material);
  const label=(text,position)=>{const el=document.createElement('span');el.textContent=text;overlay.append(el);labels.push({el,position:v(position)});};
  for(const column of model.columns)label(column.label,column.position);
  label('Marked '+model.selectedLabel,model.selectedPosition.map((n,i)=>n+(i===1?.78:0)));
  caption.textContent=model.title+'. '+model.caption;
  legend.textContent=model.legend;
  note.textContent=model.note+' Observed face count: '+model.paintedFaces+'. '+model.faces.map(face=>face.label).join('; ')+'.';
 }
 function orthographic(){
  const built=createOrthographicScene(model);for(const object of built.objects)group.add(object);for(const geometry of built.geometries)geometries.add(geometry);for(const material of built.materials)materials.add(material);
  caption.textContent=orthographicCaption(model,cameraView);legend.textContent=model.legend;note.textContent=model.note;
 }
 function unavailable(){if(disposed)return;failed=true;observer?.disconnect();status.textContent='3D inspection is unavailable on this device. The revealed diagram above and all learning controls remain available.';frame.hidden=true;controls.hidden=true;views.hidden=true;}
 function draw(){if(disposed||failed||!renderer)return;try{const width=Math.max(1,Math.min(1024,frame.clientWidth||320)),height=Math.max(220,Math.min(240,width*.66));frame.style.height=height+'px';
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));renderer.setSize(width,height,false);group.rotation.set(pitch,yaw,0);scene.updateMatrixWorld(true);
  const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];
  if(spec.kind==='orthographic')for(const x of [model.frameBounds.min[0],model.frameBounds.max[0]])for(const y of [model.frameBounds.min[1],model.frameBounds.max[1]])for(const z of [model.frameBounds.min[2],model.frameBounds.max[2]]){const p=group.localToWorld(new T.Vector3(x,y,z));[p.x,p.y,p.z].forEach((n,i)=>{min[i]=Math.min(min[i],n);max[i]=Math.max(max[i],n);});}
  else for(const object of group.children){object.geometry.computeBoundingBox();const box=object.geometry.boundingBox;for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z]){const p=object.localToWorld(new T.Vector3(x,y,z));[p.x,p.y,p.z].forEach((n,i)=>{min[i]=Math.min(min[i],n);max[i]=Math.max(max[i],n);});}}
  const center=min.map((n,i)=>(n+max[i])/2),aspect=width/height,half=Math.max((max[1]-min[1])/2,(max[0]-min[0])/2/aspect,1.7)*1.22;
  camera.position.set(center[0],center[1],center[2]+12);camera.lookAt(...center);camera.left=-half*aspect;camera.right=half*aspect;camera.top=half;camera.bottom=-half;camera.zoom=zoom;camera.updateProjectionMatrix();camera.updateMatrixWorld();if(spec.kind==='orthographic')setOrthographicRendering(group.children,cameraView);renderer.render(scene,camera);
  if(spec.kind==='orthographic'){caption.textContent=orthographicCaption(model,cameraView);cameraButtons.forEach(({id,button})=>button.setAttribute('aria-pressed',String(id===cameraView)));}
  for(const label of labels){const p=group.localToWorld(label.position.clone()).project(camera);label.el.style.left=((p.x+1)*width/2)+'px';label.el.style.top=((-p.y+1)*height/2)+'px';}
  }catch{unavailable();}
 }
 function rebuild(){if(disposed||failed)return;try{resetObjects();model=spec.model(current);if(!model){unavailable();return;}viewButtons.forEach(({id,button})=>button.setAttribute('aria-pressed',String(id===current)));if(spec.kind==='paper')paper();else if(spec.kind==='cubes')cubes();else if(spec.kind==='orthographic')orthographic();else molecule();draw();}catch{unavailable();}}
 try{
  renderer=new T.WebGLRenderer({antialias:true,alpha:false,powerPreference:'low-power'});renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
  renderer.domElement.setAttribute('aria-hidden','true');renderer.domElement.addEventListener('webglcontextlost',unavailable);frame.prepend(renderer.domElement);rebuild();
  if(!failed){if(typeof ResizeObserver!=='undefined'){observer=new ResizeObserver(draw);observer.observe(frame);}status.textContent='Use the buttons to inspect. Nothing moves until you choose an action.';}
 }catch{unavailable();}
 return {destroy(){if(disposed)return;disposed=true;observer?.disconnect();resetObjects();if(renderer){renderer.domElement.removeEventListener('webglcontextlost',unavailable);renderer.dispose();renderer.forceContextLoss();}host.replaceChildren();}};
}
