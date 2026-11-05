// Revealed teaching geometry only. No assessment bank, removal exercise or
// candidate-free feasibility problem is imported or generated here.
import {ORTHOGRAPHIC_CASES} from './expeditions/orthographic.mjs';
import {voxelsFromHeights,projectionInFrame} from './expeditions/orthographic-model.mjs';
const freeze=value=>{if(value&&typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}return value;};
const validChoice=(c,value)=>[...c.choices,'unsure'].includes(value);
export const ORTHOGRAPHIC_VIEWS=freeze([{id:'front',label:'Front',pitch:0,yaw:0},{id:'top',label:'Top',pitch:Math.PI/2,yaw:0},{id:'right',label:'Right end',pitch:0,yaw:-Math.PI/2},{id:'orbit',label:'Orbit inspection',pitch:.38,yaw:-.55}]);
export function orthographicModel(activity,raw,{objectId='target'}={}){
 if(activity?.id!=='pat-view-relay-discovery'||typeof activity.normalize!=='function'||!raw||typeof raw!=='object'||Array.isArray(raw)||!Number.isInteger(raw.caseIndex)||raw.caseIndex<0||raw.caseIndex>=ORTHOGRAPHIC_CASES.length||!['explain','complete'].includes(raw.phase))return null;
 const example=ORTHOGRAPHIC_CASES[raw.caseIndex];
 if(!validChoice(example,raw.choice)||!raw.first||typeof raw.first!=='object'||Array.isArray(raw.first)||!validChoice(example,raw.first[raw.caseIndex]))return null;
 if(raw.phase==='complete'&&(raw.caseIndex!==ORTHOGRAPHIC_CASES.length-1||!ORTHOGRAPHIC_CASES.every((c,i)=>validChoice(c,raw.first[i]))))return null;
 const state=activity.normalize(raw);
 if(state.caseIndex!==raw.caseIndex||state.phase!==raw.phase||!['target','candidate'].includes(objectId)||objectId==='candidate'&&!example.candidate)return null;
 const heights=objectId==='candidate'?example.candidate:example.heights,depth=heights.length,width=heights[0].length,height=3;
 const world=([x,y,z])=>[x+.5-width/2,z+.5-height/2,depth/2-y-.5];
 const projections=Object.fromEntries(['front','top','right'].map(view=>[view,projectionInFrame(heights,view,{height})]));
 return freeze({kind:'orthographic',caseIndex:state.caseIndex,objectId,title:(objectId==='candidate'?'Candidate':'Target')+' · viewing station '+(state.caseIndex+1),
  cubes:voxelsFromHeights(heights).map(voxel=>({voxel,position:world(voxel),size:[1,1,1]})),
  heights:heights.map(row=>[...row]),width,depth,height,projections,
  frameBounds:{min:[-width/2,-height/2,-depth/2],max:[width/2,height/2,depth/2]},
  caption:'Inspect the same '+(objectId==='candidate'?'candidate':'target')+' from the revealed teaching case. Viewpoint controls change only the camera relationship, never the solid.',
  legend:'Front keeps left-to-right width. Top has back at top. Right end has front at left and back at right. Named views use one uniform silhouette color. Orbit uses shading as a depth aid. No floor, seams or hidden-edge marks enter the silhouette.',
  note:'Supported unit columns on a common floor level; separate columns are allowed. This display has no added floor mesh. Fixed unit framing keeps empty regions meaningful. These are occupied silhouettes, not complete DAT hidden-edge drawings. No mastery credit.'});
}
export function orthographicCaption(model,view){
 const label=ORTHOGRAPHIC_VIEWS.find(v=>v.id===view)?.label||'Orbit inspection';
 return model.title+'. '+model.caption+' '+label+'. '+(view==='orbit'?'This oblique inspection is not a front/top/right answer view. Use a named view to restore exact alignment.':`Observed ${view} grid, top-to-bottom rows (1 occupied, 0 empty): ${JSON.stringify(model.projections[view])}.`);
}
export function orthographicInspectionFor(activity,raw){
 const target=orthographicModel(activity,raw);if(!target)return null;
 const snapshot=structuredClone(raw),hasCandidate=!!ORTHOGRAPHIC_CASES[target.caseIndex].candidate;
 return {kind:'orthographic',title:'Inspect the revealed view relay',defaultView:'target',views:[{id:'target',label:'Target solid'},...(hasCandidate?[{id:'candidate',label:'Candidate solid'}]:[])],cameraViews:ORTHOGRAPHIC_VIEWS,defaultCameraView:'front',model:objectId=>orthographicModel(activity,snapshot,{objectId})};
}
