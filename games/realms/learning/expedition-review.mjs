/* Read-only return planning. No answers, schedules, rewards or queues are saved here. */
import {EXPANSION_MODELS} from './expansion-models.mjs';
export const REVIEW_COURSES=Object.freeze(['BIO','GCHEM','OCHEM','PAT','RC','QR']);
const id=x=>typeof x==='string'&&x.length>0&&!['__proto__','prototype','constructor'].includes(x);
const cap=x=>Math.min(5,Math.max(1,Number.isSafeInteger(x)?x:3));
const currentTime=root=>typeof root.Date?.now==='function'?root.Date.now():Date.now();
const meta=i=>({itemId:i.id,course:i.course,session:i.session,objectiveId:i.objectiveId,familyId:i.familyId,sourceId:i.sourceId,sourceVersion:i.sourceVersion});
export function instructionFamilyIds(root){
  const families=new Set(),add=x=>{const value=typeof x==='string'?x:x?.familyId;if(id(value))families.add(value);};
  for(const guide of Object.values(root.AceDATContent?.teachingByObjective||{}))add(guide?.workedExample?.familyId);
  for(const activity of [...EXPANSION_MODELS,...(Array.isArray(root.AceDATDiscovery?.activities)?root.AceDATDiscovery.activities:[])])for(const family of activity.instructionFamilies||[])add(family);
  return families;
}
export function reviewedBank(root){
  const map=new Map(),duplicates=new Set();
  for(const item of root.AceDATContent?.items||[]){if(!item||!id(item.id)||!id(item.objectiveId)||!id(item.familyId)||!id(item.sourceId)||!id(item.sourceVersion)||!REVIEW_COURSES.includes(item.course)||!Number.isSafeInteger(item.session)||item.session<0||item.verified!==true||item.reviewStatus!=='internal-reviewed'||!['practice','check','later'].includes(item.pool))continue;if(map.has(item.id))duplicates.add(item.id);map.set(item.id,item);}
  for(const key of duplicates)map.delete(key);return map;
}
export function validatedEvidence(root=globalThis){
  const empty=reason=>({ok:false,reason,events:[],instruction:[],presentations:[],counts:{responses:0,independentCorrect:0,recalledLater:0,assisted:0}});
  try{
    const srs=root.AtlasSRS;if(!srs?.state||!srs?.valid||!srs?.summary)return empty('evidenceUnavailable');
    const state=srs.state();if(srs.summary().storageError)return empty('storageError');if(!srs.valid(state))return empty('invalidEvidence');
    const bank=reviewedBank(root),now=currentTime(root),families=instructionFamilyIds(root);
    const events=state.events.filter(e=>e.at<=now).map(e=>{
      const item=bank.get(e.itemId),canonical=!!item&&e.objectiveId===item.objectiveId&&e.familyId===item.familyId&&e.pool===item.pool;
      const legacy=item?.pool==='check'&&e.sourceId==null&&e.sourceVersion==null&&root.AceDATContent?.legacyEvidenceItemIds?.includes(item.id);
      const currentVersion=canonical&&((e.sourceId===item.sourceId&&e.sourceVersion===item.sourceVersion)||legacy);
      const earlier=x=>Number.isSafeInteger(x.seq)&&Number.isSafeInteger(e.seq)?x.seq<e.seq:x.kind==='feedback'?x.at<e.at:x.at<=e.at;
      const exactHelp=state.exposures.some(x=>x.itemId===e.itemId&&earlier(x)&&!(x.attemptId===e.id&&e.presentationId===e.id&&x.kind===(item?.pool==='check'?'check-presentation':'return-presentation')));
      const independentCurrent=!!(currentVersion&&e.independentEligible&&e.correct===true&&!e.assisted&&!e.practice&&!e.repeated&&!exactHelp&&['check','later'].includes(item.pool));
      const delayedCurrent=!!(independentCurrent&&e.delayedRecall&&item.pool==='later'&&!families.has(item.familyId));
      return {...e,confidence:e.confidence??null,canonical,currentVersion:!!currentVersion,independentCurrent,delayedCurrent};
    });
    const objectiveIds=new Set([...bank.values()].map(i=>i.objectiveId)),exposures=state.exposures.filter(e=>e.at<=now&&objectiveIds.has(e.objectiveId)).map(e=>({...e}));
    const presented=e=>['check-presentation','return-presentation'].includes(e.kind);
    return {ok:true,reason:null,events,instruction:exposures.filter(e=>!presented(e)),presentations:exposures.filter(presented),counts:{responses:events.length,independentCorrect:events.filter(e=>e.independentCurrent).length,recalledLater:events.filter(e=>e.delayedCurrent).length,assisted:events.filter(e=>e.assisted).length}};
  }catch{return empty('evidenceUnavailable');}
}
const order=(a,b)=>Number(b.lowConfidenceCorrect)-Number(a.lowConfidenceCorrect)||a.dueAt-b.dueAt||REVIEW_COURSES.indexOf(a.course)-REVIEW_COURSES.indexOf(b.course)||a.itemId.localeCompare(b.itemId,'en');
function mix(rows,limit){const out=[],left=rows.slice().sort(order);while(left.length&&out.length<limit){const courses=new Set();for(let i=0;i<left.length&&out.length<limit;){if(courses.has(left[i].course)){i++;continue;}const [row]=left.splice(i,1);out.push(row);courses.add(row.course);}}return out;}
export function createExpeditionReview(root=globalThis){
  function practiceCandidates(options={}){
    const evidence=validatedEvidence(root);if(!evidence.ok)return [];
    const state=root.AtlasSRS.state(),bank=reviewedBank(root),now=currentTime(root),latest=new Map();
    for(const e of evidence.events)latest.set(e.itemId,e);
    const low=e=>!!(e?.currentVersion&&e.correct===true&&['unsure','guess','shaky'].includes(e.confidence));
    const due=card=>!!card&&Number.isFinite(card.due)&&card.due<=now&&card.last<=now;
    const allowed=item=>(!options.course||item.course===options.course)&&(options.session===undefined||item.session===options.session);
    const practices=[...bank.values()].filter(i=>i.pool==='practice'&&allowed(i)),candidates=new Map();
    for(const item of practices){const card=state.cards[item.id];if(!due(card))continue;const event=latest.get(item.id);candidates.set(item.id,{...meta(item),kind:'practice',pool:'practice',practice:true,eligible:false,dueAt:card.due,lowConfidenceCorrect:low(event),reason:low(event)?'uncertainCorrect':'duePractice',triggerItemId:item.id,triggerEventId:event?.id||null});}
    // A due uncertain check/later answer can prompt an ordinary practice sibling.
    // Reserved questions themselves never enter the practice queue.
    for(const item of bank.values()){
      const card=state.cards[item.id],event=latest.get(item.id);if(item.pool==='practice'||!allowed(item)||!due(card)||!low(event))continue;
      if(evidence.events.some(e=>e.currentVersion&&e.pool==='practice'&&e.objectiveId===item.objectiveId&&e.at>=card.due))continue;
      const candidatesFor=practices.filter(p=>p.objectiveId===item.objectiveId&&(!state.cards[p.id]||due(state.cards[p.id]))).sort((a,b)=>Number(!!state.cards[b.id])-Number(!!state.cards[a.id])||a.id.localeCompare(b.id,'en'));
      const practice=candidatesFor[0];if(!practice)continue;
      const previous=candidates.get(practice.id),entry={...meta(practice),kind:'practice',pool:'practice',practice:true,eligible:false,dueAt:card.due,lowConfidenceCorrect:true,reason:'uncertainRelated',triggerItemId:item.id,triggerEventId:event.id};
      if(!previous||order(entry,previous)<0)candidates.set(practice.id,entry);
    }
    return [...candidates.values()].sort(order);
  }
  const duePractice=(options={})=>mix(practiceCandidates(options),cap(options.limit));
  function plan(options={}){
    const evidence=validatedEvidence(root);if(!evidence.ok)return {ok:false,reason:evidence.reason,status:'unavailable',stops:[],duePractice:[],freshLater:[],counts:{duePractice:0,freshLater:0},note:'Your learning history could not be read. Your saved work is kept.'};
    const families=instructionFamilyIds(root),bank=reviewedBank(root),limit=cap(options.limit),practice=practiceCandidates(options);
    const later=(root.AceDATReturnReview?.selectNext?.({...options,limit:5})||[]).filter(x=>bank.get(x.itemId)?.pool==='later'&&!families.has(x.familyId)).map(x=>({...x,kind:'later',pool:'later',practice:false,reason:'freshLater',lowConfidenceCorrect:false,dueAt:x.eligibleAt}));
    const stops=[],objectives=new Set();
    const add=x=>{if(x&&!objectives.has(x.objectiveId)&&stops.length<limit){stops.push(x);objectives.add(x.objectiveId);}};
    // Preserve an eligible fresh case before related practice could reset its gap.
    const laterObjectives=new Set(later.map(x=>x.objectiveId));
    add(later[0]);for(const row of mix(practice.filter(x=>!laterObjectives.has(x.objectiveId)),limit))add(row);for(const row of later.slice(1))add(row);
    return {ok:true,reason:null,status:stops.length?'ready':'quiet',stops,duePractice:mix(practice,limit),freshLater:later,counts:{duePractice:practice.length,freshLater:later.length},note:stops.length?'A short return journey. Practice and fresh later checks stay separate; each stop is checked again when it opens.':'Nothing is due here now. Explore another expedition or choose ordinary practice; no new recall is claimed.'};
  }
  return Object.freeze({plan,duePractice,validatedEvidence:()=>validatedEvidence(root)});
}
const api=createExpeditionReview(typeof window==='undefined'?globalThis:window);
if(typeof window!=='undefined')window.AceDATExpeditionReview=api;
export default api;
