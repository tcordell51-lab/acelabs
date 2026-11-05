import {PAT_ACTIVITIES} from './expeditions/pat.mjs';
import {ORGANIC_ACTIVITIES} from './expeditions/organic.mjs';
import {paperModel} from './three-paper-model.mjs';
import {createSN2Model} from './three-models.mjs';
import {ACTIVITIES} from './expeditions/registry.mjs';
import {cubeInspectionFor} from './three-cube-model.mjs';
import {orthographicInspectionFor} from './three-orthographic-model.mjs';

// The entire molecular explanation is withheld until all six decisions in this
// case are committed. A generic `committed:true` is never an unlock on its own.
export function inspectionFor(activityId,raw){
 if(activityId==='pat-view-relay-discovery')return orthographicInspectionFor(ACTIVITIES.find(a=>a.id===activityId),raw);
 if(activityId==='pat-cube-census-lab')return cubeInspectionFor(ACTIVITIES.find(a=>a.id===activityId),raw);
 if(['pat-mirror-ferry','pat-layer-lock'].includes(activityId)){
  const activity=PAT_ACTIVITIES.find(a=>a.id===activityId),state=activity.normalize(raw);
  const model=paperModel(activityId,state);if(!model)return null;
  return {kind:'paper',title:'Inspect your revealed paper',defaultView:'observed',views:[{id:'observed',label:'Current revealed sheet'},{id:'packet',label:'Initial punched packet'}],model:view=>paperModel(activityId,state,{snapshot:view})};
 }
 if(activityId!=='oc-reaction-builder')return null;
 const activity=ORGANIC_ACTIVITIES.find(a=>a.id===activityId),state=activity.normalize(raw);
 const complete=state.cursor===12&&state.commits.length===12;
 const caseIndex=complete?1:Math.floor(state.cursor/6);
 if(!complete&&!(state.cursor%6===5&&state.commits.length>state.cursor))return null;
 const caseId=caseIndex?'ethyl-bridge':'methyl-bridge';
 return {kind:'molecule',title:'Inspect the completed electron route',defaultView:'products',views:[{id:'reactants',label:'Reactants + electron arrows'},{id:'products',label:'Separate product structure'}],model:view=>createSN2Model({caseId,phase:view,committed:true})};
}
