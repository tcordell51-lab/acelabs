// Reviewed navigation metadata only: no answers, synthetic commits or assessment imports.
// Entries are rebuilt from an activity's initial state and checked by its own normalizer.
const cases = (field,count) => Object.freeze({field,count,version:1});
export const CONCEPT_ENTRY_ROUTES=Object.freeze({
 'bio-selective-gate-repair':cases('caseIndex',4),
 'bio-cell-dock-repair':cases('caseIndex',4),
 'bio-quarter-systems-repair':cases('caseIndex',8),
 'bio-payload-routing':cases('caseIndex',3),
 'bio-enzyme-assay-bench':cases('caseIndex',4),
 'gc-catalyst-forge':cases('caseIndex',2),
 'gc-equilibrium-lock':cases('caseIndex',5),
 'qr-strategy-detective':cases('caseIndex',6),
 'bio-cell-division-discovery':cases('caseIndex',6),
 'gc-gas-control-room':cases('caseIndex',5),
 'oc-stereochemistry-gallery-lab':cases('caseIndex',5),
 'pat-cube-census-lab':cases('caseIndex',3),
 'probability-sample-space':cases('caseIndex',2),
 'research-evidence-dispatch':cases('step',2),
 // Safe-entry review is separate from registry admission. These fields contain no answers.
 'gc-atomic-crucible-lab':cases('caseIndex',5),
 'pat-view-relay-discovery':cases('caseIndex',4),
 'bio-energy-canopy-lab':cases('caseIndex',9),
 'oc-reaction-crossroads-lab':cases('caseIndex',5),
 'qr-data-observatory-lab':cases('caseIndex',8)
});
const initialPhase=s=>!s.phase||['predict','choose','build'].includes(s.phase);
export const activeConcepts=(activity,state)=>activity.view(state).activeObjectiveIds||activity.objectiveIds;
export function conceptEntry(activity,objectiveId){
 if(!activity?.objectiveIds.includes(objectiveId))return null;
 const initial=activity.normalize(activity.initial()),route=CONCEPT_ENTRY_ROUTES[activity.id];
 const accepts=state=>initialPhase(state)&&!activity.view(state).complete&&activeConcepts(activity,state).includes(objectiveId);
 if(accepts(initial))return {state:initial,direct:true,version:1};
 if(route?.version===activity.version){
  for(let i=1;i<route.count;i++){
   const state=activity.normalize({...initial,[route.field]:i});
   if(state[route.field]===i&&accepts(state))return {state,direct:true,version:1};
  }
 }
 // Construction/history gates are respected. No guessed answers are inserted to
 // reach a later step; this path explicitly starts a separate full sequence.
 return {state:initial,direct:false,version:1};
}
export function needsConceptChoice(activity,state,objectiveId,focusedExists=false){
 return activity.objectiveIds.length>1&&(focusedExists||activity.view(state).complete||!activeConcepts(activity,state).includes(objectiveId));
}
export function reduceConceptVisit(activity,objectiveId,entry,previous,action,value){
 const next=activity.reduce(previous,action,value),route=CONCEPT_ENTRY_ROUTES[activity.id];
 // An authored restart may mean the whole investigation. In a direct concept
 // visit, restart its entry instead, retaining any history the reducer kept.
 // Current-case retries remain authored behavior, and prerequisite sequences
 // still start at their real beginning.
 if(entry.direct&&route?.version===activity.version&&/(?:^|-)(?:reset|restart)$/.test(action)&&!activeConcepts(activity,next).includes(objectiveId)){
  const anchored=activity.normalize({...next,[route.field]:entry.state[route.field]});
  if(activeConcepts(activity,anchored).includes(objectiveId))return anchored;
 }
 return next;
}
export function finishesFocusedConcept(activity,objectiveId,entry,previous,next){
 // Some activities normalize their final marker back to a revealed case when
 // earlier, intentionally skipped cases have no history. End only this visit;
 // never synthesize those records or mark the activity complete.
 return activity.view(next).complete||['done','complete'].includes(next.phase||next.stage)||entry.direct&&activeConcepts(activity,previous).includes(objectiveId)&&!activeConcepts(activity,next).includes(objectiveId);
}
