// Actual Three mesh construction shared by the viewer and constructor tests.
import * as T from './vendor/three-r187.mjs';
export function createCubeScene(model){
  const objects=[],geometries=new Set(),materials=new Set(),ghost=model.view==='contacts';
  const mat=(color,extra={})=>{const value=new T.MeshStandardMaterial({color,roughness:.8,metalness:0,...extra});materials.add(value);return value;};
  const mesh=(geometry,material,position,role,cubeKey)=>{geometries.add(geometry);const value=new T.Mesh(geometry,material);value.position.set(...position);value.userData={role,cubeKey};objects.push(value);return value;};
  const neutral=mat('#b5c8c3',ghost?{transparent:true,opacity:.13,depthWrite:false}:{}),floor=mat('#50685e');
  const outline=mat('#243e38'),ghostOutline=ghost?mat('#66867e',{transparent:true,opacity:.38,depthWrite:false}):outline;
  mesh(new T.BoxGeometry(...model.floor.size),floor,model.floor.position,'floor');
  // BoxGeometry's six groups are +x,-x,+y,-y,+z,-z. Logical y maps to -z.
  const order=['right','left','above','below','back','front'];
  const selected=order.map(direction=>mat(model.faces.find(face=>face.direction===direction).color));
  for(const cube of model.cubes){
    mesh(new T.BoxGeometry(...cube.size),cube.selected?selected:neutral,cube.position,'cube',cube.key);
    // Neutral outlines show unit boundaries without classifying other cubes.
    for(let axis=0;axis<3;axis++)for(const a of [-.5,.5])for(const b of [-.5,.5]){
      const other=[0,1,2].filter(i=>i!==axis),center=[...cube.position];center[other[0]]+=a;center[other[1]]+=b;
      const edge=mesh(new T.CylinderGeometry(.008,.008,1,6),cube.selected?outline:ghostOutline,center,'edge',cube.key);
      const normal=new T.Vector3(...[0,1,2].map(i=>i===axis?1:0));edge.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),normal);
    }
  }
  return {objects,geometries,materials};
}
