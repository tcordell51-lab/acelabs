import {esc} from './visuals.mjs';
import {createCampaignProgress} from './campaign-progress.mjs';

const button=(label,kind,value='',extra='')=>`<button type="button" class="secondary" style="min-height:44px" data-campaign="${kind}" data-value="${esc(value)}" ${extra}>${esc(label)}</button>`;
// Scope notes come from locked chapter data written for the build team; students see them without the word "authored".
const plain=s=>String(s||'').replace(/\bauthored\s+/gi,'').replace(/^(.)/,c=>c.toUpperCase());
const countLine=c=>`${c.independentMet} of ${c.objectives} skills checked independently · ${c.delayedMet} recalled later`;
const returnLine=row=>row.returnReview.status==='tooSoon'&&Number.isSafeInteger(row.returnReview.nextEligibleAt)?`<p>Earliest later check: <time datetime="${new Date(row.returnReview.nextEligibleAt).toISOString()}">${esc(new Date(row.returnReview.nextEligibleAt).toLocaleString())}</time>, if there is no further relevant study or response.</p>`:'';
const labels={unavailable:'Evidence unavailable',checksExhausted:'Fresh checks exhausted',needsChecks:'Independent check needed',recalledLater:'Independent and later evidence saved',laterReady:'Fresh later check ready',waitingForReturn:'Independent answer saved',needsFreshReturn:'Independent answer saved'};

/** HTML only: displaying this plan neither exposes a question nor changes evidence. */
export function renderCampaign(report,{course=null,routeId=null}={}){
  if(!report?.ok)return `<section class="dat-learning"><p role="alert">Your learning evidence could not be read. Your saved adventure has not been replaced. Export a backup in Settings; field guides remain available from the Field Lab. No checkpoint is launched.</p></section>`;
  const world=report.worlds.find(w=>w.course===course),chapter=world?.chapters.find(c=>c.routeId===routeId),actions=[];
  const actionButton=(a,primary=false)=>{const index=actions.push(a)-1;return button(a.label,'action',String(index),primary?'aria-label="'+esc('Suggested next step: '+a.label)+'"':'');};
  let body=`<p class="panel-intro">${chapter?'Your saved successes stay credited. Each unfinished skill has its own next step.':world?'Choose a chapter to see its concepts and your next learning steps.':'Follow your learning through the six DAT worlds. These counts describe the chapters currently available.'}</p><div class="backup-actions">${world?button('All six worlds','world'):''}${chapter?button(world.title+' chapters','world',world.course):''}${button('Open the return fieldbook','returns',world?.course||'')}</div>`;
  if(chapter){
    body+=`<p>${esc(countLine(chapter.counts))}</p><p>${esc(plain(chapter.scopeNote))}</p>${chapter.checkpointMet?'<p role="status">Every listed skill has independent evidence. The Warden can recognize this chapter’s saved progress.</p>'+button('Meet the chapter Warden','warden',chapter.routeId):'<p>A chapter checkpoint samples the remaining skills with questions you have not seen yet. It keeps successful skills credited and does not repeat them.</p>'}`;
    body+=chapter.objectives.map(row=>`<section class="lesson-block"><p class="eyebrow">${esc(labels[row.status]||'Learning plan')}</p><h3>${esc(row.title)}</h3><p>${esc(row.note)}</p>${returnLine(row)}<div class="learning-actions">${row.nextAction?actionButton(row.nextAction,true):''}${row.actions.filter(a=>a!==row.nextAction).map(a=>actionButton(a)).join('')}</div></section>`).join('');
  }else if(world){
    body+=`<p>${esc(countLine(world.counts))}. ${world.counts.checkpointsMet} of ${world.counts.chapters} chapters have all their required skill checks.</p>`;
    body+=world.chapters.map(c=>`<section class="lesson-block"><h3>${esc(c.title)}</h3><p>${esc(countLine(c.counts))}</p>${c.nextAction?`<p>Suggested next step: ${esc(c.objectives.find(o=>o.objectiveId===c.nextObjectiveId)?.title||'Explore this chapter')}.</p>`:''}<div class="learning-actions">${button('View this chapter’s learning plan','chapter',c.routeId)}${button('Travel to '+c.title,'travel',c.routeId)}</div></section>`).join('');
    body+=`<p class="panel-note">${world.coverage.complete} of ${world.coverage.total} broad curriculum headings complete. Chapter progress does not complete an unfinished DAT world.</p>`;
  }else{
    body+=`<p>${esc(countLine(report.counts))}. ${report.counts.checkpointsMet} of ${report.counts.chapters} chapters have all their required skill checks.</p>`;
    body+=report.worlds.map(w=>`<section class="lesson-block"><h3>${esc(w.title)}</h3><p>${esc(countLine(w.counts))}</p><p>${w.counts.laterReady?`${w.counts.laterReady} skill${w.counts.laterReady===1?' has':'s have'} a fresh later check ready.`:'Explore a chapter, or revisit an earlier idea.'}</p>${button('Open '+w.title+' learning plan','world',w.course)}</section>`).join('');
  }
  body+=`<details class="lesson-block"><summary style="min-height:44px">Team Entropy · final campaign</summary><p>Final defeat and whole-world badges are not available yet. More DAT chapters and the final battle are still being built.</p><p>For now, restore the available chapters with independent answers, then revisit their skills in the return fieldbook. Your chapter evidence remains saved.</p><p>Scouts on each route remain available for practice. Waiting, travel, and repeated answers never grant a final victory.</p></details>`;
  return {html:`<section class="dat-learning">${body}</section>`,actions,title:chapter?chapter.title+' · learning plan':world?world.title+' · learning plan':'The six DAT realms · learning plan'};
}

export function createCampaignUI(root=globalThis){
  const progress=createCampaignProgress(root);
  function open(api,options={}){
    const report=progress.snapshot(),rendered=renderCampaign(report,options);
    if(typeof rendered==='string'){api.panel('Learning plan',rendered,true);return;}
    api.panel(rendered.title,rendered.html,true);
    const host=root.document?.querySelector('#panelBody');if(!host)return;
    host.querySelectorAll('[data-campaign]').forEach(control=>control.onclick=()=>{
      const {campaign:kind,value}=control.dataset;
      const current=progress.snapshot();
      if(!current.ok){open(api,options);return;}
      const findChapter=id=>current.worlds.flatMap(w=>w.chapters).find(c=>c.routeId===id);
      if(kind==='world'){const world=current.worlds.find(w=>w.course===value);return open(api,{...options,course:world?.course||null,routeId:null});}
      if(kind==='chapter'){const chapter=findChapter(value);if(chapter)return open(api,{...options,course:chapter.course,routeId:value});return;}
      if(kind==='travel'){if(findChapter(value)){api.closePanel?.();api.travel?.(value);}return;}
      if(kind==='warden'){
        const chapter=findChapter(value);if(!chapter)return;
        if(!chapter.checkpointMet){api.notice?.('The chapter evidence changed. Your plan has refreshed.');return open(api,options);}
        if(typeof options.onCheckpoint==='function'){api.closePanel?.();return options.onCheckpoint(chapter.routeId);}
        api.closePanel?.();api.travel?.(chapter.routeId);return;
      }
      if(kind==='returns'){const course=current.worlds.some(w=>w.course===value)?value:null;return root.AceDATReturnUI?.open?.(api,{course});}
      if(kind!=='action')return;
      const selected=rendered.actions[Number(value)];if(!selected)return;
      const chapter=findChapter(selected.routeId),objective=chapter?.objectives.find(o=>o.objectiveId===selected.objectiveId);
      const action=objective?.actions.find(a=>a.kind===selected.kind);
      if(!action){api.notice?.('Your next step changed. The learning plan has refreshed.');return open(api,options);}
      if(action.kind==='lesson')return root.AceDATLearning?.open?.(action.objectiveId,api);
      if(action.kind==='return'){
        if(action.pool==='later'&&action.itemIds?.length)return api.openQuest({course:action.course,special:{id:'campaign-return:'+action.itemIds[0],kind:'return-review',assessment:'later',items:[action.itemIds[0]],name:'Keeper Rowan',sub:objective.title},onReturn:()=>open(api,options)});
        return root.AceDATReturnUI?.open?.(api,{course:action.course});
      }
      if(action.kind==='checkpoint'){
        if(typeof options.onCheckpoint==='function')return options.onCheckpoint(action.routeId);
        api.notice?.('Visit this chapter’s Warden to try its unused checks.');api.closePanel?.();api.travel?.(action.routeId);return;
      }
      if(action.kind==='practice'&&action.itemIds?.length)return api.openQuest({course:action.course,special:{id:'campaign-practice:'+action.objectiveId,kind:'campaign-practice',assessment:'practice',items:action.itemIds.slice(0,3),name:'Field Practice',sub:objective.title,xp:4},onReturn:()=>open(api,options)});
    });
  }
  return Object.freeze({open});
}
if(typeof window!=='undefined')window.AceDATCampaignUI=createCampaignUI(window);
