// Exact integer geometry. A height map describes supported, gap-free vertical columns.
// This model does not assume that every downward-facing surface is unpainted.
import {esc,svg} from './shared.mjs';
export const CUBE_DIRECTIONS=Object.freeze([
  {id:'left',delta:[-1,0,0]},{id:'right',delta:[1,0,0]},
  {id:'back',delta:[0,-1,0]},{id:'front',delta:[0,1,0]},
  {id:'below',delta:[0,0,-1]},{id:'above',delta:[0,0,1]}
].map(x=>Object.freeze({...x,delta:Object.freeze(x.delta)})));
export const cubeKey=([x,y,z])=>`${x},${y},${z}`;
export function cubesFromHeights(heights){
  if(!Array.isArray(heights)||!heights.length||heights.length>5||!Array.isArray(heights[0])||!heights[0].length||heights[0].length>5||heights.some(row=>!Array.isArray(row)||row.length!==heights[0].length||row.some(h=>!Number.isInteger(h)||h<0||h>5)))throw new Error('Invalid supported cube height map');
  const cubes=[];heights.forEach((row,y)=>row.forEach((height,x)=>{for(let z=0;z<height;z++)cubes.push([x,y,z]);}));
  if(!cubes.length)throw new Error('An assembly needs at least one cube');
  return cubes;
}
export function cubeFaces(cubes,target){
  const occupied=new Set(cubes.map(cubeKey));if(!occupied.has(cubeKey(target)))throw new Error('Target cube missing');
  return CUBE_DIRECTIONS.map(({id,delta})=>{const neighbor=target.map((n,i)=>n+delta[i]),floor=id==='below'&&target[2]===0,contact=occupied.has(cubeKey(neighbor));return {id,neighbor,floor,contact,painted:!floor&&!contact};});
}
export const paintedFaceCount=(cubes,target)=>cubeFaces(cubes,target).filter(f=>f.painted).length;
export function cubeTally(cubes){const tally=[0,0,0,0,0,0,0];for(const cube of cubes)tally[paintedFaceCount(cubes,cube)]++;return tally;}
export function cubeInventory(heights){const cubes=cubesFromHeights(heights);return {cubes,total:cubes.length,tally:cubeTally(cubes),rows:cubes.map(cube=>({cube,key:cubeKey(cube),faces:paintedFaceCount(cubes,cube)}))};}
export function paintedSnapshot(cubes){return Object.fromEntries(cubes.map(c=>[cubeKey(c),cubeFaces(cubes,c).filter(f=>f.painted).map(f=>f.id)]));}
export const cubeLabel=([x,y,z])=>`${String.fromCharCode(65+y*5+x)}${z+1}`;
export const columnLabel=([x,y])=>`${String.fromCharCode(65+y*5+x)}`;
export function assemblySvg(heights,{target=null,label='Supported cube assembly',reveal=false,showPlan=true}={}){
  const cubes=cubesFromHeights(heights),w=heights[0].length,h=heights.length,max=Math.max(...heights.flat()),u=Math.min(40,180/(w+h)),v=u*.52,zstep=u*1.05,ox=205+(h-w)*u*.5,oy=95+max*zstep;
  const p=([x,y,z])=>[ox+(x-y)*u,oy+(x+y)*v-z*zstep];
  const polygon=(points,fill)=>`<polygon points="${points.map(q=>p(q).map(n=>n.toFixed(2)).join(',')).join(' ')}" fill="${fill}" stroke="#304b55" stroke-width="1.8" stroke-linejoin="round"/>`;
  let body='<rect width="700" height="390" rx="14" fill="#fbf7e9"/>';
  body+=polygon([[-.2,-.2,0],[w+.2,-.2,0],[w+.2,h+.2,0],[-.2,h+.2,0]],'#e5e8de');
  for(const [x,y,z] of [...cubes].sort((a,b)=>a[0]+a[1]-b[0]-b[1]||a[2]-b[2])){
    const selected=target&&cubeKey(target)===cubeKey([x,y,z]);
    body+=`<g data-cube="${x},${y},${z}">`;
    body+=polygon([[x+1,y,z],[x+1,y+1,z],[x+1,y+1,z+1],[x+1,y,z+1]],selected?'#ddb761':'#b8cfd4');
    body+=polygon([[x,y+1,z],[x+1,y+1,z],[x+1,y+1,z+1],[x,y+1,z+1]],selected?'#efcf7f':'#d7e4e6');
    body+=polygon([[x,y,z+1],[x+1,y,z+1],[x+1,y+1,z+1],[x,y+1,z+1]],selected?'#ffe6a3':'#f4faf8');
    if(z===heights[y][x]-1){const [tx,ty]=p([x+.5,y+.5,z+1]);body+=`<text x="${tx}" y="${ty+4}" text-anchor="middle" font-family="system-ui,sans-serif" font-size="13" font-weight="700" fill="#25444c">${columnLabel([x,y])}</text>`;}
    body+='</g>';
  }
  const letters=heights.flatMap((row,y)=>row.map((height,x)=>`${columnLabel([x,y])}: ${height}`));
  if(showPlan){body+='<text x="525" y="55" text-anchor="middle" font-family="system-ui,sans-serif" font-size="19" fill="#25444c">Column-height plan</text>';
    const cell=Math.min(48,172/w,190/h),left=525-w*cell/2,top=76;
    heights.forEach((row,y)=>row.forEach((height,x)=>{const sx=left+x*cell,sy=top+y*cell;body+=`<rect x="${sx}" y="${sy}" width="${cell}" height="${cell}" fill="${target&&target[0]===x&&target[1]===y?'#ffe6a3':height?'#e9eff0':'#f3efe2'}" stroke="#8c9ea0"/><text x="${sx+cell/2}" y="${sy+cell*.42}" text-anchor="middle" font-size="12" font-family="system-ui,sans-serif" fill="#47616a">${columnLabel([x,y])}</text><text x="${sx+cell/2}" y="${sy+cell*.8}" text-anchor="middle" font-size="18" font-weight="700" font-family="system-ui,sans-serif" fill="#25444c">${height}</text>`;}));
    body+='<text x="525" y="306" text-anchor="middle" font-size="14" font-family="system-ui,sans-serif" fill="#47616a">Numbers are column heights.</text>';
  }
  const caption=target?`Target cube (may be hidden): column ${columnLabel(target)}, level ${target[2]+1} from the floor`:'Each outlined block is one unit cube.';
  body+=`<text x="350" y="343" text-anchor="middle" font-family="system-ui,sans-serif" font-size="17" fill="#25444c">${esc(caption)}</text><text x="350" y="369" text-anchor="middle" font-family="system-ui,sans-serif" font-size="14" fill="#47616a">All columns start on the floor; no gaps or extra hidden columns.</text>`;
  let alt=`${label}. Column heights ${letters.join('; ')}. All columns have continuous support from the floor.`;
  if(target)alt+=` Target cube in column ${columnLabel(target)}, level ${target[2]+1} from the floor.`;
  if(reveal&&target)alt+=` Observed painted faces: ${paintedFaceCount(cubes,target)}.`;
  return svg(alt,body,'0 0 700 390');
}
