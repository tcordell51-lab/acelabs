// A model of the one already-observed cube. No assessment items or later-task
// painting-history helpers enter this module.
import {cubesFromHeights,cubeFaces,cubeKey,cubeLabel,columnLabel} from './expeditions/cube-model.mjs';
const freeze=value=>{if(value&&typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}return value;};
const normals={left:[-1,0,0],right:[1,0,0],back:[0,0,1],front:[0,0,-1],below:[0,-1,0],above:[0,1,0]};
const colors={painted:'#e7be67','cube-contact':'#758d9b','floor-contact':'#82664e'};

export function cubeModel(activity,raw,{view='assembly'}={}){
  if(activity?.id!=='pat-cube-census-lab'||!Array.isArray(activity.inspectionCases)||typeof activity.normalize!=='function'||!raw||typeof raw!=='object'||Array.isArray(raw)||!['assembly','contacts'].includes(view))return null;
  if(!Number.isInteger(raw.caseIndex)||raw.caseIndex<0||raw.caseIndex>=activity.inspectionCases.length||!Number.isInteger(raw.cursor)||raw.cursor<0||!Array.isArray(raw.records)||raw.records.length!==raw.cursor||raw.records.some(x=>x!==null&&(!Number.isInteger(x)||x<0||x>5))||raw.phase!=='observed'||!(Number.isInteger(raw.choice)&&raw.choice>=0&&raw.choice<=5||raw.choice===null&&raw.unsure===true))return null;
  const state=activity.normalize(raw),example=activity.inspectionCases[state.caseIndex],cubes=cubesFromHeights(example.heights);
  if(state.phase!=='observed'||state.cursor!==raw.cursor||state.caseIndex!==raw.caseIndex||state.cursor>=cubes.length)return null;
  const target=cubes[state.cursor],width=example.heights[0].length,depth=example.heights.length;
  const worldPosition=([x,y,z])=>[x+.5-width/2,z+.5,depth/2-y-.5];
  const selectedPosition=worldPosition(target);
  const faces=cubeFaces(cubes,target).map(face=>{
    const kind=face.floor?'floor-contact':face.contact?'cube-contact':'painted';
    return {direction:face.id,normal:[...normals[face.id]],kind,color:colors[kind],label:face.id+': '+(face.floor?'floor contact; unpainted':face.contact?'cube contact; unpainted':'exposed surface; painted')};
  });
  return freeze({kind:'cubes',view,caseIndex:state.caseIndex,cursor:state.cursor,caseName:example.name,target:[...target],selectedLabel:cubeLabel(target),
    cubes:cubes.map(c=>({key:cubeKey(c),selected:cubeKey(c)===cubeKey(target),position:worldPosition(c),size:[1,1,1]})),
    columns:example.heights.flatMap((row,y)=>row.map((height,x)=>({label:columnLabel([x,y])+': '+height,height,position:[x+.5-width/2,height+.23,depth/2-y-.5]}))),
    selectedPosition,faces,paintedFaces:faces.filter(f=>f.kind==='painted').length,
    floor:{position:[0,-.04,0],size:[width+.6,.08,depth+.6]},
    title:'Column '+columnLabel(target)+', level '+(target[2]+1)+' · '+example.name,
    caption:view==='contacts'?'Neighboring cubes are translucent so you can see the marked cube’s contacts. Every cube stays in its exact position; translucency is only a viewing aid.':'Exact unit cubes follow the revealed height plan. Only the currently observed cube has classified faces; the other cubes show position and height only.',
    legend:'Gold: exposed painted surface. Slate: cube contact, unpainted. Brown: floor contact, unpainted.',
    note:'All columns are supported continuously from the floor. Classification belongs only to this already-observed cube. The next cube remains a prediction. No mastery credit.'});
}

export function cubeInspectionFor(activity,raw){
  if(!cubeModel(activity,raw))return null;
  const snapshot=structuredClone(raw);
  return {kind:'cubes',title:'Inspect your observed cube',defaultView:'assembly',views:[{id:'assembly',label:'Current assembly'},{id:'contacts',label:'See contacts'}],model:view=>cubeModel(activity,snapshot,{view})};
}
