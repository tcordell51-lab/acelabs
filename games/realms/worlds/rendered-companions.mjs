import manifest from './renders/companions/manifest.mjs';
import rescueManifest from './renders/rescue-companions/manifest.mjs';
import chapterManifest from './renders/chapter-companions/manifest.mjs';
import refinementManifest from './renders/refinement-companions/manifest.mjs';
import campaignManifest from './renders/campaign-companions/manifest.mjs';
import {drawStarterMotion,ready as motionReady,setReducedMotion} from './starter-motion.mjs';
const frames=new Map(),images=new Map();
const stageNumber=value=>Number.isFinite(Number(value))?Math.max(0,Math.min(2,Math.floor(Number(value)))):0;
// Preserve the original bestiary footprint and ground anchor. Transparent image
// padding never changes creature size; every canvas call restores drawing state.
export function frameRect(frame,x,y,scale=3){
 const [sx,sy,sw,sh]=frame.trimPx;
 const [ax,ay]=frame.footBaselinePx?frame.footBaselinePx.map((n,i)=>n-frame.trimPx[i]):frame.anchorInTrimPx;
 const s=(Number.isFinite(Number(scale))&&Number(scale)>0?Number(scale):3)*.78;
 const unit=32*frame.growthScale/Math.max(sw,sh);
 return {sx,sy,sw,sh,dx:x-ax*unit*s,dy:y+11*s-ay*unit*s,dw:sw*unit*s,dh:sh*unit*s};
}
function load(key){if(images.has(key))return images.get(key).ready;const frame=frames.get(key);if(!frame)return Promise.resolve(false);
 const image=new Image(),record={image,loaded:false,ready:null};images.set(key,record);
 record.ready=new Promise(resolve=>{image.onload=()=>{record.loaded=image.naturalWidth===frame.width&&image.naturalHeight===frame.height;resolve(record.loaded);};image.onerror=()=>resolve(false);image.src=new URL('../'+frame.file,import.meta.url).href;});return record.ready;
}
export function drawRenderedCompanion(ctx,id,x,y,scale=3,stage=0){if(drawStarterMotion(ctx,id,x,y,scale,stageNumber(stage)))return true;const key=id+':'+stageNumber(stage),frame=frames.get(key);if(!frame)return false;const record=images.get(key);if(!record?.loaded){load(key);return false;}
 const r=frameRect(frame,x,y,scale);ctx.save();try{ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.fillStyle='#24484b22';ctx.beginPath();ctx.ellipse(x,y+11*scale*.78,10*scale*.78,2.1*scale*.78,0,0,2*Math.PI);ctx.fill();ctx.drawImage(record.image,r.sx,r.sy,r.sw,r.sh,r.dx,r.dy,r.dw,r.dh);}finally{ctx.restore();}return true;
}
for(const [key,frame] of Object.entries(manifest.frames))if(/^(cytrus|atpup|twistle|enzymber|molmite|protonyx|apertuft|foliora|percentip):[012]$/.test(key)&&/^worlds\/renders\/companions\/[a-z]+-stage-[012]\.png$/.test(frame.file))frames.set(key,frame);
for(const [key,frame] of Object.entries(rescueManifest.frames))if(/^(portia|parcelot|chatelle|stereon|cubit|skimmer|ratior):[012]$/.test(key)&&/^worlds\/renders\/rescue-companions\/[a-z]+-stage-[012]\.png$/.test(frame.file))frames.set(key,frame);
for(const [key,frame] of Object.entries(chapterManifest.frames))if(/^(chromelle|daltoni|chiralyn|cubora|chancet|claimfin):[012]$/.test(key)&&/^worlds\/renders\/chapter-companions\/[a-z]+-stage-[012]\.png$/.test(frame.file))frames.set(key,frame);
for(const [key,frame] of Object.entries(refinementManifest.frames))if(/^(isolume|vistrel):[012]$/.test(key)&&frame.id===key.split(':')[0]&&frame.stage===Number(key.split(':')[1])&&frame.course===(frame.id==='isolume'?'GCHEM':'PAT')&&frame.session===4&&frame.file===`worlds/renders/refinement-companions/${frame.id}-stage-${frame.stage}.png`)frames.set(key,frame);
const campaignOrigins={lumivine:['BIO',5],fluxotl:['OCHEM',4],tallyfin:['QR',4]};
for(const [key,frame] of Object.entries(campaignManifest.frames))if(/^(lumivine|fluxotl|tallyfin):[012]$/.test(key)&&frame.id===key.split(':')[0]&&frame.stage===Number(key.split(':')[1])&&frame.course===campaignOrigins[frame.id][0]&&frame.session===campaignOrigins[frame.id][1]&&frame.file===`worlds/renders/campaign-companions/${frame.id}-stage-${frame.stage}.png`)frames.set(key,frame);
export const ready=typeof Image==='undefined'?Promise.resolve([]):Promise.all([...frames.keys()].map(load).concat(motionReady));
if(typeof window!=='undefined')window.AceDATRenderedArt={draw:drawRenderedCompanion,setReducedMotion};
