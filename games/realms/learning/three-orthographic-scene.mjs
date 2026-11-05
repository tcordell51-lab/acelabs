// Production scene construction also used directly by geometry tests.
import * as T from './vendor/three-r187.mjs';
import {ORTHOGRAPHIC_VIEWS} from './three-orthographic-model.mjs';
export function applyOrthographicView(group,view){const preset=ORTHOGRAPHIC_VIEWS.find(v=>v.id===view);if(!preset)return false;group.rotation.set(preset.pitch,preset.yaw,0);group.updateMatrixWorld(true);return true;}
export function createOrthographicScene(model){
 const objects=[],geometries=new Set(),materials=new Set();
 // Emissive, unlit-looking uniform surfaces retain only occupied silhouettes.
 // MeshStandardMaterial is already in the pinned local bundle; no new dependency.
 const material=new T.MeshStandardMaterial({color:'#000000',emissive:'#c8d7e5',emissiveIntensity:1,roughness:1,metalness:0});material.toneMapped=false;materials.add(material);
 const geometry=new T.BoxGeometry(1,1,1);geometries.add(geometry);
 for(const cube of model.cubes){const mesh=new T.Mesh(geometry,material);mesh.position.set(...cube.position);mesh.userData={role:'orthographic-cube',voxel:[...cube.voxel],objectId:model.objectId};objects.push(mesh);}
 return {objects,geometries,materials};
}

export function setOrthographicRendering(objects,view){for(const mesh of objects){if(mesh.userData.role!=='orthographic-cube')continue;mesh.material.color.set(view==='orbit'?'#9faedb':'#000000');mesh.material.emissive.set(view==='orbit'?'#000000':'#c8d7e5');mesh.material.toneMapped=view==='orbit';}}
