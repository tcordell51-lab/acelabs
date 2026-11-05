import manifest from './renders/environment/manifest.mjs';
import chapterLandmarks from './renders/chapter-landmarks/manifest.mjs';
import biomeTrees from './renders/biome-trees/manifest.mjs';
import townFixtures from './renders/town-fixtures/manifest.mjs';
export const ENVIRONMENT_RENDER_FRAMES=Object.freeze({...manifest.frames,...chapterLandmarks.frames,...biomeTrees.frames,...townFixtures.frames});
const records=new Map();
export function environmentFrame(object){
 const frame=ENVIRONMENT_RENDER_FRAMES[object.sprite+'-'+object.biome]||ENVIRONMENT_RENDER_FRAMES[object.sprite];
 return frame&&(!frame.supportedBiomes||frame.supportedBiomes.includes(object.biome))?frame:null;
}
export function environmentRect(frame,x,y){
 const [sx,sy,sw,sh]=frame.trimPx,[left,top,right,bottom]=frame.desiredLogicalBounds;
 const unit=Math.min((right-left)/sw,(bottom-top)/sh);
 return {sx,sy,sw,sh,dx:x+(left+right)/2-sw*unit/2,dy:y+frame.baselineLogicalY-sh*unit,dw:sw*unit,dh:sh*unit};
}
function load(id,frame){
 if(records.has(id))return records.get(id).ready;
 const image=new Image(),record={image,loaded:false,ready:null};records.set(id,record);
 record.ready=new Promise(resolve=>{image.onload=()=>{record.loaded=image.naturalWidth===frame.width&&image.naturalHeight===frame.height;resolve(record.loaded);};image.onerror=()=>resolve(false);image.src=new URL('../'+frame.file,import.meta.url).href;});return record.ready;
}
export function drawRenderedEnvironment(ctx,object,x,y,helpers){
 const frame=environmentFrame(object);if(!frame)return false;
 const record=records.get(frame.id);if(!record?.loaded){if(typeof Image!=='undefined')load(frame.id,frame);return false;}
 const r=environmentRect(frame,x,y);ctx.save();try{
  ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
  helpers.rect(Math.round(x-frame.shadowWidth/2),Math.round(y+8),frame.shadowWidth,5,'#24484b22');
  ctx.drawImage(record.image,r.sx,r.sy,r.sw,r.sh,r.dx,r.dy,r.dw,r.dh);
 }finally{ctx.restore();}
 if(frame.drawLabel!==false&&object.label&&helpers.near(object)<4.4)helpers.label(object.label,x,y-frame.labelOffsetY,'#24484b',true,11);
 return true;
}
export const ready=typeof Image==='undefined'?Promise.resolve([]):Promise.all(Object.entries(ENVIRONMENT_RENDER_FRAMES).map(([id,frame])=>load(id,frame)));
if(typeof window!=='undefined')window.AceDATRenderedEnvironment={draw:drawRenderedEnvironment};
