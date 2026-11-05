/* Reserved return questions are selected from evidence, never from game rewards.
 * This module stores no queue and grants no evidence. Every display and response
 * must pass the SRS boundary again. Runtime clocks are not configurable here. */
import {instructionFamilyIds,reviewedBank} from './expedition-review.mjs';
const COURSES=Object.freeze(['BIO','GCHEM','OCHEM','PAT','RC','QR']);
const id=value=>typeof value==='string'&&value.length>0&&!['__proto__','constructor','prototype'].includes(value);
const bounded=value=>Math.min(5,Math.max(1,Number.isSafeInteger(value)?value:3));
const compare=(a,b)=>(a.eligibleAt??Infinity)-(b.eligibleAt??Infinity)||COURSES.indexOf(a.course)-COURSES.indexOf(b.course)||a.session-b.session||a.itemId.localeCompare(b.itemId,'en');
const matches=(item,options)=>(!options.course||item.course===options.course)&&(options.session===undefined||item.session===options.session);
const metadata=item=>({itemId:item.id,course:item.course,session:item.session,objectiveId:item.objectiveId,familyId:item.familyId,sourceId:item.sourceId||item.srcId||null,sourceVersion:item.sourceVersion||null});
export const reasonLabels=Object.freeze({due:'Ready for a later check',tooSoon:'More time since this topic was last used',needsFirstCheck:'First answer a fresh check correctly without help',alreadySeen:'This case or family is familiar',familiarFamily:'This case family is familiar',tutorialFamily:'This task family is used in instruction',unknownHistory:'Some earlier evidence cannot establish novelty',unverifiedVersion:'The earlier item revision cannot be verified',unavailable:'This case is unavailable',unknownItem:'This is not a reviewed return case',storageError:'The review history could not be saved or read'});
export function createReturnReview(root=globalThis){
  const bank=()=>[...reviewedBank(root).values()];
  function status(itemId,options={}){const item=reviewedBank(root).get(itemId);if(item&&instructionFamilyIds(root).has(item.familyId))return {...metadata(item),eligible:false,status:'alreadySeen',reason:'tutorialFamily',reasons:['tutorialFamily'],eligibleAt:null};return root.AtlasSRS?.returnStatus?.(itemId,options)||{itemId,eligible:false,status:'unavailable',reason:'unavailable',reasons:['unavailable'],eligibleAt:null};}
  function rows(options={}){return bank().filter(x=>x.pool==='later'&&matches(x,options)).map(x=>status(x.id)).sort(compare);}
  function listEligible(options={}){return rows(options).filter(x=>x.eligible);}
  function selectNext(options={}){const selected=[],objectives=new Set();for(const item of listEligible(options)){if(objectives.has(item.objectiveId))continue;objectives.add(item.objectiveId);selected.push(item);if(selected.length>=bounded(options.limit))break;}return selected;}
  function summary(options={}){
    const all=rows(options),counts={total:all.length,due:0,tooSoon:0,needsFirstCheck:0,alreadySeen:0,unverifiedVersion:0,unknownHistory:0,unavailable:0};
    for(const item of all)counts[Object.prototype.hasOwnProperty.call(counts,item.status)?item.status:'unavailable']++;
    const perCourse=Object.fromEntries(COURSES.map(course=>[course,{total:0,due:0}]));
    for(const item of all){if(perCourse[item.course]){perCourse[item.course].total++;if(item.eligible)perCourse[item.course].due++;}}
    const times=all.filter(x=>x.status==='tooSoon').map(x=>x.eligibleAt);
    return {counts,perCourse,items:all,nextEligibleAt:times.length?Math.min(...times):null};
  }
  function practiceFallback(options={}){
    const srs=root.AtlasSRS;if(!srs||srs.summary().storageError)return [];
    const state=srs.state(),due=new Set(srs.dueList(state)),cards=state.cards||{};
    return bank().filter(x=>x.pool==='practice'&&matches(x,options)).map(item=>({...metadata(item),pool:'practice',assessment:'practice',practice:true,eligible:false,label:'Practice: does not count as a later check',due:due.has(item.id),last:cards[item.id]?.last||0}))
      .sort((a,b)=>Number(b.due)-Number(a.due)||a.last-b.last||COURSES.indexOf(a.course)-COURSES.indexOf(b.course)||a.session-b.session||a.itemId.localeCompare(b.itemId,'en')).slice(0,bounded(options.limit));
  }
  function plan(options={}){const items=selectNext(options),report=summary(options);if(items.length)return {kind:'later',items,counts:report.counts,note:'Fresh cases, at most one per objective. Eligibility is checked again when each question opens.'};const practice=practiceFallback(options);return {kind:practice.length?'practice':'empty',items:practice,counts:report.counts,note:practice.length?'No later case is eligible now. These are ordinary practice questions and cannot earn later-recall evidence.':'No reviewed question is available for this selection.'};}
  return Object.freeze({listEligible,listDue:listEligible,selectNext,status,isEligible:(itemId,options)=>status(itemId,options).eligible,begin:(itemId,attemptId)=>{const current=status(itemId,{attemptId});return current.eligible?(root.AtlasSRS?.beginReturn?.(itemId,attemptId)||{ok:false,reason:'unavailable'}):{ok:false,...current};},summary,practiceFallback,plan,reasonLabels});
}
const api=createReturnReview(typeof window==='undefined'?globalThis:window);
export const listEligible=options=>api.listEligible(options);
export const listDue=options=>api.listDue(options);
export const selectNext=options=>api.selectNext(options);
export const status=(itemId,options)=>api.status(itemId,options);
export const begin=(itemId,attemptId)=>api.begin(itemId,attemptId);
export const summary=options=>api.summary(options);
export const practiceFallback=options=>api.practiceFallback(options);
export const plan=options=>api.plan(options);
if(typeof window!=='undefined')window.AceDATReturnReview=api;
export default api;
