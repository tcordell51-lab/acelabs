/* Campaign navigation, not an achievement authority. This projection reads the
 * published curriculum and existing evidence gates; it never grades, opens a
 * question, changes a save, or grants a badge/Team Entropy victory. */
import {createMasteryGates} from './mastery-gates.mjs';
import {createReturnReview} from './return-review.mjs';
import {REVIEW_COURSES,reviewedBank,validatedEvidence} from './expedition-review.mjs';

const reviewed=x=>x?.reviewStatus==='internal-reviewed'&&x.verified!==false&&x.progressEligible!==false&&x.runtimeIntegrated!==false;
const title=x=>x?.name||x?.title||x?.id||'Unavailable skill';
const unique=xs=>[...new Set(xs)];
const after=(a,b)=>!b||((Number.isSafeInteger(a.seq)&&Number.isSafeInteger(b.seq))?a.seq>b.seq:a.at>b.at);
const latest=rows=>rows.reduce((last,row)=>!last||after(row,last)?row:last,null);
const counts=chapters=>({chapters:chapters.length,checkpointsMet:chapters.filter(x=>x.checkpointMet).length,objectives:chapters.reduce((n,x)=>n+x.objectives.length,0),independentMet:chapters.reduce((n,x)=>n+x.objectives.filter(o=>o.independentMet).length,0),delayedMet:chapters.reduce((n,x)=>n+x.objectives.filter(o=>o.delayedMet).length,0),laterReady:chapters.reduce((n,x)=>n+x.objectives.filter(o=>!o.delayedMet&&o.returnReview.status==='due').length,0),checksExhausted:chapters.reduce((n,x)=>n+x.objectives.filter(o=>o.status==='checksExhausted').length,0)});
const action=(kind,label,route,objectiveId,extra={})=>({kind,label,course:route.course,routeId:route.id,objectiveId,...extra});
const priority=o=>o.returnReview.status==='due'&&!o.delayedMet?0:o.remediationNeeded?1:!o.independentMet&&o.status!=='checksExhausted'&&o.status!=='unavailable'?2:o.status==='checksExhausted'?3:!o.delayedMet?4:5;
const nextObjective=rows=>rows.slice().sort((a,b)=>priority(a)-priority(b)).find(o=>o.nextAction)||null;

function returnReport(rows,delayedMet){
  const due=rows.filter(x=>x.eligible===true&&x.status==='due'),waiting=rows.filter(x=>x.status==='tooSoon'&&Number.isSafeInteger(x.eligibleAt));
  const status=delayedMet?'recorded':due.length?'due':waiting.length?'tooSoon':rows.some(x=>x.status==='needsFirstCheck')?'needsFirstCheck':rows.length?'blocked':'unavailable';
  return {status,dueCount:due.length,itemIds:due.map(x=>x.itemId),nextEligibleAt:status==='tooSoon'?Math.min(...waiting.map(x=>x.eligibleAt)):null,reasons:unique(rows.flatMap(x=>x.reasons||[x.reason]).filter(Boolean)),caseCount:rows.length};
}
function blockedReturnNote(report){
  const reasons=new Set(report.reasons);
  if(reasons.has('unknownHistory'))return 'The first independent answer is saved, but some earlier history cannot establish whether the remaining return cases are fresh. That history is kept; no later success is inferred.';
  if(reasons.has('unverifiedVersion'))return 'The first independent answer is saved, but an earlier item revision cannot be verified for later recall. Existing history is kept; no later success is inferred.';
  if(reasons.has('storageError')||reasons.has('unavailable')||reasons.has('unknownItem'))return 'The first independent answer is saved, but the remaining return cases or their history are unavailable. The guide remains open; no later success is inferred.';
  if(!report.caseCount)return 'The first independent answer is saved. No reviewed later case is published for this skill yet. Ordinary practice stays available; a reviewed fresh case is still needed for later evidence.';
  return 'The first independent answer is saved. Remaining return cases are familiar or used in instruction. Ordinary practice stays available; a new reviewed case family is needed for later evidence.';
}

export function createCampaignProgress(root=globalThis){
  const mastery=createMasteryGates(root),returns=createReturnReview(root);
  function snapshot(){
    const content=root.AceDATContent||{},realms=Array.isArray(root.AceDATRealms)?root.AceDATRealms:[],bank=reviewedBank(root),evidence=validatedEvidence(root);
    const objectives=new Map((Array.isArray(content.objectives)?content.objectives:[]).map(x=>[x.id,x]));
    const delayedIds=new Set(evidence.events.filter(x=>x.delayedCurrent).map(x=>x.id));
    const worlds=REVIEW_COURSES.map(course=>{
      const realm=realms.find(x=>x.course===course),gate=mastery.worldStatus(course),routeGates=new Map(gate.routes.map(x=>[x.routeId,x]));
      const chapters=(Array.isArray(realm?.routes)?realm.routes:[]).map(raw=>{
        const route={...raw,course},routeGate=routeGates.get(raw.id),available=evidence.ok&&!!routeGate&&routeGate.status!=='unavailable';
        const chapterObjectives=unique(Array.isArray(route.objectiveIds)?route.objectiveIds:[]).map(objectiveId=>{
          const definition=objectives.get(objectiveId),guide=content.teachingByObjective?.[objectiveId],record=routeGate?.objectives.find(x=>x.objectiveId===objectiveId);
          const independentMet=available&&record?.met===true,delayedMet=independentMet&&record.delayedEvidenceIds.some(key=>delayedIds.has(key));
          const canonical=(key,pool)=>{const item=bank.get(key);return item&&reviewed(item)&&item.pool===pool&&item.objectiveId===objectiveId&&item.course===course&&item.session===route.session;};
          const practiceIds=unique(route.practiceIds||[]).filter(key=>canonical(key,'practice'));
          const checkIds=available&&!independentMet?(record?.freshCheckIds||[]).filter(key=>canonical(key,'check')):[];
          const laterRows=available?unique(route.laterIds||[]).filter(key=>canonical(key,'later')).map(key=>returns.status(key)):[];
          const returnReview=returnReport(laterRows,delayedMet);
          const lessonExposure=latest(evidence.instruction.filter(x=>x.objectiveId===objectiveId&&['lesson','lesson-close','model','model-change'].includes(x.kind)));
          const response=latest(evidence.events.filter(x=>x.objectiveId===objectiveId&&x.currentVersion));
          const remediationNeeded=!!(available&&!independentMet&&response&&(response.correct===false||response.assisted)&&after(response,lessonExposure));
          const lesson=reviewed(guide)&&guide.objectiveId===objectiveId&&reviewed(definition)?action('lesson',remediationNeeded?'Review this skill after the missed or assisted answer':'Open this skill’s guide',route,objectiveId):null;
          const practice=practiceIds.length?action('practice','Practice this skill',route,objectiveId,{itemIds:practiceIds,pool:'practice',assessment:'practice'}):null;
          const checkpoint=checkIds.length?action('checkpoint','Try the chapter checkpoint',route,objectiveId,{itemIds:checkIds,pool:'check',assessment:'check'}):null;
          const later=returnReview.status==='due'?action('return','Try a fresh later check before opening help',route,objectiveId,{itemIds:returnReview.itemIds,pool:'later',assessment:'later'}):null;
          const timing=returnReview.status==='tooSoon'?action('return','Open this realm’s return fieldbook',route,objectiveId,{itemIds:[],eligibleAt:returnReview.nextEligibleAt}):null;
          const status=!available?'unavailable':!independentMet?(record?.status||'unavailable'):delayedMet?'recalledLater':returnReview.status==='due'?'laterReady':returnReview.status==='tooSoon'?'waitingForReturn':'needsFreshReturn';
          let note,nextAction;
          if(!available){note='Learning evidence is unavailable. The guide remains open; no completion is inferred.';nextAction=lesson;}
          else if(later){note='A fresh later case is eligible now. Try it before related help or practice, which changes the return timing.';nextAction=later;}
          else if(!independentMet&&record?.status==='checksExhausted'){note='No new check question remains for this skill. Review the guide and practice; a new reviewed case is needed. Replaying a known answer cannot clear the checkpoint.';nextAction=lesson||practice;}
          else if(!independentMet){note=remediationNeeded?'Revisit this exact skill, then try an unused case at the chapter checkpoint. Saved successes on other skills remain.':'This skill needs a saved independent correct answer. The guide and practice are available before the chapter checkpoint.';nextAction=(remediationNeeded||!lessonExposure?lesson:null)||checkpoint||lesson||practice;}
          else if(delayedMet){note='An independent correct answer and a qualifying later answer are saved for this skill. This does not establish full-subject mastery.';nextAction=practice||lesson;}
          else if(timing){note='The first independent answer is saved. The return fieldbook has the current timing; explore another skill meanwhile. Related study changes that timing.';nextAction=timing;}
          else {note=blockedReturnNote(returnReview);nextAction=practice||lesson;}
          const actions=[later,lesson,practice,checkpoint,timing].filter(Boolean);
          return {objectiveId,title:title(definition),independentMet,delayedMet,status,lessonSeen:!!lessonExposure,remediationNeeded,returnReview,actions,nextAction,note};
        });
        const next=nextObjective(chapterObjectives);
        const chapter={routeId:route.id,title:route.title||route.id,course,session:route.session,available,checkpointMet:available&&routeGate.restoreAllowed===true,status:routeGate?.status||'unavailable',objectives:chapterObjectives,nextObjectiveId:next?.objectiveId||null,nextAction:next?.nextAction||null,scopeNote:route.scopeNote||'These listed skills are one chapter, not a completed DAT subject.'};
        chapter.counts=counts([chapter]);return chapter;
      });
      const all=chapters.flatMap(x=>x.objectives),next=nextObjective(all);
      return {course,worldId:realm?.worldId||null,title:realm?.title||course,name:realm?.name||course,chapters,counts:counts(chapters),nextObjectiveId:next?.objectiveId||null,nextAction:next?.nextAction||null,coverage:{total:gate.coverage.total,complete:gate.coverage.complete,gaps:gate.coverage.gaps.map(x=>({...x}))},finalGate:{implemented:gate.implemented,eligible:gate.eligible,badgeAllowed:gate.badgeAllowed,defeatAllowed:gate.defeatAllowed,status:gate.status,reasons:[...gate.reasons],note:gate.note||'World completion evidence is unavailable.'}};
    });
    const summary=counts(worlds.flatMap(x=>x.chapters)),next=nextObjective(worlds.flatMap(w=>w.chapters.flatMap(c=>c.objectives)));
    return {ok:evidence.ok,reason:evidence.reason,readOnly:true,worlds,counts:summary,nextObjectiveId:next?.objectiveId||null,nextAction:next?.nextAction||null,authoredScope:{allPublishedCheckpointsMet:summary.chapters>0&&summary.checkpointsMet===summary.chapters,note:'Counts cover the listed chapters only. They do not complete all DAT topics or predict an exam score.'},teamEntropy:{status:'locked',defeatAllowed:false,badgeAllowed:false,reasons:unique(worlds.flatMap(w=>w.finalGate.reasons).concat('finalEncounterNotImplemented')),requirements:['Complete and review the finite curriculum scope for all six worlds.','Implement world completion adjudication for that scope.','Provide saved independent and later evidence for every required skill.','Implement and review the final Team Entropy encounter separately from practice.'],note:'Team Entropy scouts are practice encounters. Final defeat and whole-world badges remain unavailable while the curriculum and final adjudication are unfinished.'}};
  }
  return Object.freeze({snapshot});
}
const api=createCampaignProgress(typeof window==='undefined'?globalThis:window);
export const snapshot=()=>api.snapshot();
if(typeof window!=='undefined')window.AceDATCampaign=api;
export default api;
