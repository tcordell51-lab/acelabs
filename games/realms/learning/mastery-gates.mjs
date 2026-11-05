/* Route checkpoint evidence, distinct from participation rewards and full-subject
 * completion. Read only: no storage access, migrations, grades or game mutations.
 * The published route, reviewed registry and persisted SRS ledger are authoritative. */
const COURSES=Object.freeze(['BIO','GCHEM','OCHEM','PAT','RC','QR']);
const id=v=>typeof v==='string'&&v.trim().length>0&&v.length<=240&&!['__proto__','constructor','prototype'].includes(v);
const list=v=>Array.isArray(v)&&v.length>0&&v.every(id)&&new Set(v).size===v.length;
const reviewed=v=>v?.reviewStatus==='internal-reviewed'&&v.verified!==false&&v.progressEligible!==false&&v.runtimeIntegrated!==false;
const index=rows=>{const map=new Map();for(const row of rows){if(!id(row?.id)||map.has(row.id))throw Error('ambiguousRegistry');map.set(row.id,row);}return map;};
const before=(a,b)=>Number.isSafeInteger(a.seq)&&Number.isSafeInteger(b.seq)?a.seq<b.seq:a.kind==='feedback'?a.at<b.at:a.at<=b.at;
const empty=(routeId,reason)=>({routeId:id(routeId)?routeId:null,course:null,label:'Route checkpoint evidence',eligible:false,restoreAllowed:false,status:'unavailable',objectiveCount:0,metCount:0,objectives:[],missingObjectiveIds:[],exhaustedObjectiveIds:[],reasons:[reason]});

export function createMasteryGates(root=globalThis){
  function snapshot(){
    const srs=root.AtlasSRS,content=root.AceDATContent;
    if(!srs||typeof srs.state!=='function'||typeof srs.valid!=='function'||typeof srs.summary!=='function')throw Error('evidenceUnavailable');
    const state=srs.state(),summary=srs.summary();
    if(!summary||summary.storageError)throw Error('storageError');
    if(!srs.valid(state)||!Array.isArray(state.events)||!Array.isArray(state.exposures)||!state.cards)throw Error('invalidEvidence');
    if(!content||!Array.isArray(content.items)||!Array.isArray(content.objectives)||!content.teachingByObjective||!Array.isArray(root.AceDATRealms))throw Error('registryUnavailable');
    const items=index(content.items),objectives=index(content.objectives),routes=new Map();
    for(const realm of root.AceDATRealms){
      if(!COURSES.includes(realm?.course)||!id(realm.worldId)||!Array.isArray(realm.routes))throw Error('invalidRealmRegistry');
      for(const route of realm.routes){if(!id(route?.id)||routes.has(route.id))throw Error('ambiguousRoutes');routes.set(route.id,{...route,course:realm.course,worldId:realm.worldId});}
    }
    return {state,content,items,objectives,routes,now:Date.now()};
  }
  function versionMatches(event,item,content){
    if(!id(item.sourceId)||!id(item.sourceVersion))return false;
    if(event.sourceId===item.sourceId&&event.sourceVersion===item.sourceVersion)return true;
    // Only unchanged first-release checks have an explicit legacy exception.
    return item.pool==='check'&&event.sourceId==null&&event.sourceVersion==null&&Array.isArray(content.legacyEvidenceItemIds)&&content.legacyEvidenceItemIds.includes(item.id);
  }
  function canonicalItem(item,route,objectiveId,pool){
    return !!item&&reviewed(item)&&item.verified===true&&item.objectiveId===objectiveId&&item.course===route.course&&item.session===route.session&&item.pool===pool&&id(item.familyId)&&id(item.sourceId)&&id(item.sourceVersion);
  }
  function evidenceFor(item,ctx){
    return ctx.state.events.filter(event=>event.itemId===item.id&&id(event.id)&&Number.isSafeInteger(event.at)&&event.at>=0&&event.at<=ctx.now&&
      event.correct===true&&event.independentEligible===true&&event.assisted===false&&event.practice===false&&event.repeated===false&&event.selfRated!==true&&event.saved!==false&&
      event.objectiveId===item.objectiveId&&event.familyId===item.familyId&&event.pool===item.pool&&versionMatches(event,item,ctx.content)&&
      // Exact-question help seen before a later first-response record cannot be
      // erased by closing/reloading. Generic earlier instruction remains allowed.
      !ctx.state.exposures.some(x=>x.itemId===item.id&&!(x.attemptId===event.id&&event.presentationId===event.id&&x.kind===(item.pool==='check'?'check-presentation':'return-presentation'))&&before(x,event)));
  }
  function inspectRoute(routeId,ctx){
    const route=ctx.routes.get(routeId);
    if(!route)return empty(routeId,'unknownRoute');
    const fail=reason=>({...empty(routeId,reason),course:route.course});
    if(route.available!==true||route.availability!=='available'||route.coverage==='planned'||route.runtimeIntegrated===false||(route.reviewStatus!==undefined&&!reviewed(route))||!list(route.objectiveIds)||!Number.isSafeInteger(route.session)||route.session<0||!Array.isArray(route.checkIds)||!Array.isArray(route.laterIds))return fail('routeUnavailable');
    const records=[];
    for(const objectiveId of route.objectiveIds){
      const objective=ctx.objectives.get(objectiveId),guide=ctx.content.teachingByObjective[objectiveId];
      if(!reviewed(objective)||objective.course!==route.course||objective.world!==route.worldId||objective.session!==route.session||!reviewed(guide)||guide.objectiveId!==objectiveId)return fail('objectiveUnavailable');
      const checks=[...new Set(route.checkIds)].map(key=>ctx.items.get(key)).filter(item=>canonicalItem(item,route,objectiveId,'check'));
      const later=[...new Set(route.laterIds)].map(key=>ctx.items.get(key)).filter(item=>canonicalItem(item,route,objectiveId,'later'));
      const evidence=[...checks,...later].flatMap(item=>evidenceFor(item,ctx)),met=evidence.length>0;
      const seen=key=>Object.prototype.hasOwnProperty.call(ctx.state.cards,key)||ctx.state.events.some(e=>e.itemId===key)||ctx.state.exposures.some(e=>e.itemId===key);
      const freshCheckIds=checks.filter(item=>!seen(item.id)).map(item=>item.id);
      const status=met?'met':!checks.length?'unavailable':freshCheckIds.length?'needsChecks':'checksExhausted';
      records.push({objectiveId,met,status,evidenceIds:evidence.map(e=>e.id),delayedEvidenceIds:evidence.filter(e=>e.delayedRecall===true).map(e=>e.id),freshCheckIds,checkCount:checks.length});
    }
    const metCount=records.filter(x=>x.met).length,eligible=metCount===records.length;
    const missingObjectiveIds=records.filter(x=>!x.met).map(x=>x.objectiveId),exhaustedObjectiveIds=records.filter(x=>x.status==='checksExhausted').map(x=>x.objectiveId);
    const status=eligible?'ready':records.some(x=>x.status==='unavailable')?'unavailable':exhaustedObjectiveIds.length?'checksExhausted':'needsChecks';
    return {routeId,course:route.course,label:'Route checkpoint evidence',eligible,restoreAllowed:eligible,status,objectiveCount:records.length,metCount,objectives:records,missingObjectiveIds,exhaustedObjectiveIds,reasons:eligible?[]:[status],
      note:eligible?'Every listed route objective has a saved independent correct check. This is not full-subject mastery or a DAT readiness prediction.':status==='checksExhausted'?'Some objectives have no new check question left. Replaying a known case remains practice; new check questions are still to come.':'Each route objective needs a saved correct check without help while that question was open. Earlier lessons remain recorded.'};
  }
  function routeStatus(route){
    const routeId=typeof route==='string'?route:route?.id;
    if(!id(routeId))return empty(routeId,'unknownRoute');
    try{return inspectRoute(routeId,snapshot());}catch(error){return empty(routeId,error?.message||'evidenceUnavailable');}
  }
  function worldStatus(course){
    const base={course:COURSES.includes(course)?course:null,label:'World completion evidence',implemented:false,eligible:false,badgeAllowed:false,defeatAllowed:false,status:'unavailable',routes:[],coverage:{total:0,complete:0,gaps:[]},missingIndependentObjectiveIds:[],missingDelayedObjectiveIds:[],reasons:[]};
    if(!COURSES.includes(course))return {...base,reasons:['unknownCourse']};
    try{
      const ctx=snapshot(),realm=root.AceDATRealms.find(x=>x.course===course);
      if(!realm)return {...base,reasons:['unknownCourse']};
      const routes=[...ctx.routes.values()].filter(x=>x.course===course).map(x=>inspectRoute(x.id,ctx));
      const rows=[...(ctx.content.screenshotTopics||[]),...(ctx.content.officialOnlyTopics||[])].filter(x=>x.world===realm.worldId);
      const gaps=rows.filter(x=>x.status!=='complete').map(x=>({topicId:x.id,status:x.status||'unavailable'}));
      const objectives=routes.flatMap(x=>x.objectives),missingIndependentObjectiveIds=objectives.filter(x=>!x.met).map(x=>x.objectiveId),missingDelayedObjectiveIds=objectives.filter(x=>!x.delayedEvidenceIds.length).map(x=>x.objectiveId);
      const reasons=['worldCompletionNotImplemented'];
      if(!rows.length)reasons.push('coverageUnavailable');else if(gaps.length)reasons.push('curriculumIncomplete');
      if(!routes.length||routes.some(x=>x.status==='unavailable'))reasons.push('routeEvidenceUnavailable');
      if(missingIndependentObjectiveIds.length)reasons.push('needsIndependentChecks');
      if(missingDelayedObjectiveIds.length)reasons.push('needsDelayedRecall');
      return {...base,status:gaps.length?'curriculumIncomplete':'unavailable',routes,coverage:{total:rows.length,complete:rows.length-gaps.length,gaps},missingIndependentObjectiveIds,missingDelayedObjectiveIds,reasons,
        note:'Whole-world badges and Team Entropy defeat are unavailable. The current curriculum is partial, and full-world completion adjudication is not implemented. Route checkpoint evidence and participation rewards remain separate.'};
    }catch(error){return {...base,reasons:[error?.message||'evidenceUnavailable','worldCompletionNotImplemented']};}
  }
  return Object.freeze({routeStatus,worldStatus});
}
const api=createMasteryGates(typeof window==='undefined'?globalThis:window);
export const routeStatus=route=>api.routeStatus(route);
export const worldStatus=course=>api.worldStatus(course);
if(typeof window!=='undefined')window.AceDATMastery=api;
export default api;
