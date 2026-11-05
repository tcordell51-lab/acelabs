/* AtlasSRS: Anki-style spaced repetition woven into the game.
 * Every question you answer becomes a card with its own schedule (SM-2 style:
 * again / hard / good / easy). Battles blend due cards in at a capped share so
 * reviews are part of play, not a separate chore; a daily budget keeps the load
 * sane; the Review Grove offers a pure Anki session when you want one.
 * Schedule intervals and Memory Crystals are game practice history, not mastery evidence.
 * Only explicit checked responses can produce independent evidence; self ratings remain practice.
 * Store: ace_dat_realms_mnemon_v1_srs_v1. No legacy reads, migrations, or remote services.
 */
(function(root){
  'use strict';
  const KEY='ace_dat_realms_mnemon_v1_srs_v1',DAY=86400000,MIN=60000,LADDER=[1,3,7,21],GAP=5,SHOWN_MAX=60;
  const NAMESPACE='ace-dat-realms-mnemon-v1',RECALL_GAP=20*60*MIN,MAX_EVENTS=50000;
  const obj=v=>!!v&&typeof v==='object'&&!Array.isArray(v);
  const nat=v=>Number.isSafeInteger(v)&&v>=0;
  const finite=v=>typeof v==='number'&&Number.isFinite(v)&&v>=0;
  const ident=v=>typeof v==='string'&&v.length>0&&v.length<=240&&!['__proto__','constructor','prototype'].includes(v);
  const fields=(v,keys)=>obj(v)&&Object.keys(v).every(k=>keys.includes(k));
  const safe=(v,n=0)=>n<=20&&(!v||typeof v!=='object'||Object.entries(v).every(([k,x])=>!['__proto__','constructor','prototype'].includes(k)&&safe(x,n+1)));
  const today=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};
  const day=()=>({date:today(),reviews:0,correct:0,crystals:0,newDex:0,cleared:false});
  const fresh=()=>({namespace:NAMESPACE,version:1,cards:{},settings:{budget:40,blend:.34,newDex:5},daily:day(),crystals:0,shown:[],enc:{n:0,lastReview:-99},events:[],exposures:[]});
  const COURSES=['BIO','GCHEM','OCHEM','PAT','RC','QR'];
  const nullableId=v=>v===null||v===undefined||ident(v);
  const sequence=s=>s.events.concat(s.exposures).reduce((n,e)=>Math.max(n,e.seq||0),0)+1;
  const sourceMeta=item=>({sourceId:ident(item?.sourceId)?item.sourceId:ident(item?.srcId)?item.srcId:null,sourceVersion:ident(item?.sourceVersion)?item.sourceVersion:null});
  // Active presentations are deliberately not persisted as resumable authorizations.
  // A reload keeps their exposure record, but cannot manufacture a fresh attempt.
  const activeReturns=new Map(),activeChecks=new Map();
  function reviewedBank(){
    const items=new Map(),conflicts=new Set();
    for(const item of root.AceDATContent?.items||[]){
      if(!item||!ident(item.id)||!ident(item.objectiveId)||!ident(item.familyId)||!COURSES.includes(item.course)||!nat(item.session)||item.verified!==true||item.reviewStatus!=='internal-reviewed'||!['practice','check','later'].includes(item.pool))continue;
      const prior=items.get(item.id);if(prior)conflicts.add(item.id);
      items.set(item.id,item);
    }
    for(const id of conflicts)items.delete(id);return items;
  }
  const matches=(event,item)=>!!item&&(event.objectiveId===null||event.objectiveId===undefined||event.objectiveId===item.objectiveId)&&(event.familyId===null||event.familyId===undefined||event.familyId===item.familyId);
  const knownVersion=(event,item)=>!!item&&ident(item.sourceVersion)&&((event.sourceVersion===item.sourceVersion&&event.sourceId===item.sourceId)||((event.sourceVersion===null||event.sourceVersion===undefined)&&(event.sourceId===null||event.sourceId===undefined)&&Array.isArray(root.AceDATContent?.legacyEvidenceItemIds)&&root.AceDATContent.legacyEvidenceItemIds.includes(event.itemId)));
  const before=(record,event)=>nat(record.seq)&&nat(event.seq)?record.seq<event.seq:record.at<=event.at;
  function evaluateCheck(id,s,presentation=null){
    const item=reviewedBank().get(id),base={itemId:id,course:item?.course||null,session:item?.session??null,objectiveId:item?.objectiveId||null,familyId:item?.familyId||null,...sourceMeta(item)};
    if(!item||item.pool!=='check'||!ident(item.sourceId)||!ident(item.sourceVersion))return {...base,eligible:false,fresh:false,repeated:false,assisted:false,status:'unavailable',reason:'unknownItem'};
    if(presentation&&(presentation.sourceId!==item.sourceId||presentation.sourceVersion!==item.sourceVersion||presentation.objectiveId!==item.objectiveId||presentation.familyId!==item.familyId))return {...base,eligible:false,fresh:false,repeated:false,assisted:false,status:'unavailable',reason:'unverifiedVersion'};
    const exposures=s.exposures.filter(e=>e!==presentation);
    const repeated=!!s.cards[id]||s.events.some(e=>e.itemId===id)||exposures.some(e=>e.itemId===id&&(!presentation||before(e,presentation)||['check-presentation','return-presentation'].includes(e.kind)));
    // Earlier objective instruction is allowed. Instruction while this question
    // is open is current-attempt help, including a helper outside the battle UI.
    const assisted=!!presentation&&exposures.some(e=>e.objectiveId===item.objectiveId&&!['check-presentation','return-presentation'].includes(e.kind)&&before(presentation,e));
    return {...base,eligible:!repeated&&!assisted,fresh:!repeated,repeated,assisted,status:repeated||assisted?'practice':'fresh',reason:repeated?'alreadySeen':assisted?'currentHelp':null};
  }
  function checkStatus(id,options){
    const s=state(),attemptId=options?.attemptId,held=activeChecks.get(attemptId);
    const presentation=held?.itemId===id?s.exposures.find(e=>e.kind==='check-presentation'&&e.attemptId===attemptId&&e.seq===held.seq):null;
    const result=evaluateCheck(id,s,presentation);
    if(storageError)return {...result,eligible:false,status:'unavailable',reason:'storageError',error:storageError};
    if(attemptId!==undefined&&!presentation)return {...result,eligible:false,fresh:false,status:'unavailable',reason:'presentationUnavailable'};
    return result;
  }
  function beginCheck(id,attemptId){
    if(!ident(attemptId))return {ok:false,eligible:false,fresh:false,reason:'invalidAttempt'};
    const held=activeChecks.get(attemptId);
    if(held){if(held.itemId!==id)return {ok:false,eligible:false,fresh:false,reason:'attemptUsed'};const status=checkStatus(id,{attemptId});return {ok:status.status!=='unavailable',...status,attemptId};}
    const s=state(),at=Date.now(),status=evaluateCheck(id,s);
    if(storageError)return {ok:false,...status,eligible:false,fresh:false,reason:'storageError',error:storageError};
    if(status.status==='unavailable')return {ok:false,...status};
    if(s.events.some(e=>e.id===attemptId)||s.exposures.some(e=>e.attemptId===attemptId))return {ok:false,...status,eligible:false,fresh:false,reason:'attemptUsed'};
    if(s.exposures.length>=MAX_EVENTS)return {ok:false,...status,eligible:false,fresh:false,reason:'historyFull'};
    const event={itemId:id,objectiveId:status.objectiveId,familyId:status.familyId,kind:'check-presentation',at,seq:sequence(s),attemptId,...sourceMeta(reviewedBank().get(id))};
    s.exposures.push(event);const written=write(s);if(!written.ok)return {ok:false,...status,eligible:false,fresh:false,reason:'storageError',error:written.error};
    activeChecks.set(attemptId,{itemId:id,seq:event.seq});return {ok:true,...status,attemptId};
  }
  const endCheck=attemptId=>activeChecks.delete(attemptId);
  function evaluateReturn(id,s,now,presentation=null){
    const bank=reviewedBank(),item=bank.get(id),reasons=[];
    const base={itemId:id,course:item?.course||null,session:item?.session??null,objectiveId:item?.objectiveId||null,familyId:item?.familyId||null,...sourceMeta(item)};
    if(!item||item.pool!=='later')return {...base,eligible:false,status:'unavailable',reason:'unknownItem',reasons:['unknownItem'],eligibleAt:null,lastRelevantAt:null};
    if(!ident(item.sourceId)||!ident(item.sourceVersion))return {...base,eligible:false,status:'unverifiedVersion',reason:'unverifiedVersion',reasons:['unverifiedVersion'],eligibleAt:null,lastRelevantAt:null};
    const own=x=>!!presentation&&x===presentation;
    const events=s.events||[],exposures=(s.exposures||[]).filter(x=>!own(x));
    const peers=events.filter(e=>e.objectiveId===item.objectiveId||bank.get(e.itemId)?.objectiveId===item.objectiveId);
    if(peers.some(e=>!matches(e,bank.get(e.itemId))))reasons.push('unknownHistory');
    const independent=peers.filter(e=>matches(e,bank.get(e.itemId))&&e.correct===true&&e.independentEligible===true);
    const success=independent.some(e=>knownVersion(e,bank.get(e.itemId)));
    if(independent.length&&!success)reasons.push('unverifiedVersion');
    const seen=!!s.cards?.[id]||events.some(e=>e.itemId===id)||exposures.some(e=>e.itemId===id);
    const familiar=events.some(e=>bank.get(e.itemId)?.familyId===item.familyId)||exposures.some(e=>bank.get(e.itemId)?.familyId===item.familyId);
    if(seen)reasons.push('alreadySeen');else if(familiar)reasons.push('familiarFamily');
    if(!success)reasons.push('needsFirstCheck');
    const relevant=peers.concat(exposures.filter(e=>e.objectiveId===item.objectiveId||bank.get(e.itemId)?.objectiveId===item.objectiveId));
    const lastRelevantAt=relevant.reduce((last,e)=>Math.max(last,e.at),0),eligibleAt=success?lastRelevantAt+RECALL_GAP:null;
    if(success&&now<eligibleAt)reasons.push('tooSoon');
    const reason=reasons[0]||null,status=reason==='alreadySeen'||reason==='familiarFamily'?'alreadySeen':reason||'due';
    return {...base,eligible:reasons.length===0,status,reason,reasons,eligibleAt,lastRelevantAt};
  }
  function returnStatus(id,options){
    const s=state(),attemptId=options?.attemptId,held=activeReturns.get(attemptId);
    const presentation=held?.itemId===id?s.exposures.find(e=>e.kind==='return-presentation'&&e.attemptId===attemptId&&e.seq===held.seq):null;
    const result=evaluateReturn(id,s,Date.now(),presentation);
    if(storageError)return {...result,eligible:false,status:'unavailable',reason:'storageError',reasons:['storageError'],error:storageError};
    return result;
  }
  function beginReturn(id,attemptId){
    if(!ident(attemptId))return {ok:false,reason:'invalidAttempt'};
    const held=activeReturns.get(attemptId);
    if(held)return held.itemId===id?{ok:true,...returnStatus(id,{attemptId})}:{ok:false,reason:'attemptUsed'};
    const s=state(),at=Date.now(),status=evaluateReturn(id,s,at);
    if(storageError)return {ok:false,...status,eligible:false,reason:'storageError',error:storageError};
    if(!status.eligible)return {ok:false,...status};
    if(s.events.some(e=>e.id===attemptId)||s.exposures.some(e=>e.attemptId===attemptId))return {ok:false,...status,eligible:false,reason:'attemptUsed'};
    if(s.exposures.length>=MAX_EVENTS)return {ok:false,...status,eligible:false,reason:'historyFull'};
    const event={itemId:id,objectiveId:status.objectiveId,familyId:status.familyId,kind:'return-presentation',at,seq:sequence(s),attemptId,...sourceMeta(reviewedBank().get(id))};
    s.exposures.push(event);const written=write(s);if(!written.ok)return {ok:false,...status,eligible:false,reason:'storageError',error:written.error};
    activeReturns.set(attemptId,{itemId:id,seq:event.seq});return {ok:true,...status,attemptId};
  }
  function valid(s){
    if(!fields(s,['namespace','version','cards','settings','daily','crystals','shown','enc','events','exposures'])||!safe(s)||s.namespace!==NAMESPACE||s.version!==1||!obj(s.cards)||Object.keys(s.cards).length>50000)return false;
    if(!Object.entries(s.cards).every(([id,c])=>ident(id)&&fields(c,['ivl','ease','reps','lapses','due','created','last','kind','s','lad','lx'])&&finite(c.ivl)&&finite(c.ease)&&c.ease>=1&&nat(c.reps)&&nat(c.lapses)&&nat(c.due)&&nat(c.created)&&nat(c.last)&&ident(c.kind)&&(c.s===undefined||nat(c.s)||ident(c.s))&&(c.lad===undefined||nat(c.lad)&&c.lad<LADDER.length)&&(c.lx===undefined||Array.isArray(c.lx)&&c.lx.length<=12&&c.lx.every(nat))))return false;
    if(!fields(s.settings,['budget','blend','newDex'])||!nat(s.settings.budget)||s.settings.budget>500||!finite(s.settings.blend)||s.settings.blend>1||!nat(s.settings.newDex)||s.settings.newDex>100)return false;
    if(!fields(s.daily,['date','reviews','correct','crystals','newDex','cleared'])||!/^\d{4}-\d{2}-\d{2}$/.test(s.daily.date)||!['reviews','correct','crystals','newDex'].every(k=>nat(s.daily[k]))||typeof s.daily.cleared!=='boolean'||!nat(s.crystals))return false;
    if(!Array.isArray(s.shown)||s.shown.length>SHOWN_MAX||!s.shown.every(x=>fields(x,['id','at'])&&ident(x.id)&&nat(x.at)))return false;
    if(!fields(s.enc,['n','lastReview'])||!nat(s.enc.n)||!Number.isSafeInteger(s.enc.lastReview)||s.enc.lastReview< -99)return false;
    if(!Array.isArray(s.events)||s.events.length>MAX_EVENTS||!s.events.every(e=>fields(e,['id','itemId','at','grade','correct','assisted','practice','repeated','objectiveId','familyId','pool','independentEligible','delayedRecall','familiarFamily','confidence','seq','presentationId','sourceId','sourceVersion'])&&ident(e.id)&&ident(e.itemId)&&nat(e.at)&&(e.seq===undefined||nat(e.seq)&&e.seq>0)&&nullableId(e.presentationId)&&nullableId(e.sourceId)&&nullableId(e.sourceVersion)&&[0,1,2,3].includes(e.grade)&&(e.correct===null||typeof e.correct==='boolean')&&['assisted','practice','repeated','independentEligible','delayedRecall','familiarFamily'].every(k=>typeof e[k]==='boolean')&&(e.objectiveId===null||ident(e.objectiveId))&&(e.familyId===null||ident(e.familyId))&&['practice','check','later','self-rated'].includes(e.pool)&&[null,'unsure','steady','sure','guess','shaky'].includes(e.confidence)&&(!e.independentEligible||!e.assisted&&!e.practice&&!e.repeated&&e.correct!==null&&e.objectiveId!==null&&e.familyId!==null)&&(!e.delayedRecall||e.independentEligible&&e.correct===true&&!e.familiarFamily&&e.pool==='later')))return false;
    if(new Set(s.events.map(e=>e.id)).size!==s.events.length)return false;
    if(!Array.isArray(s.exposures)||s.exposures.length>MAX_EVENTS||!s.exposures.every(e=>fields(e,['itemId','objectiveId','familyId','kind','at','seq','attemptId','sourceId','sourceVersion'])&&ident(e.itemId)&&ident(e.objectiveId)&&ident(e.kind)&&nat(e.at)&&(e.seq===undefined||nat(e.seq)&&e.seq>0)&&nullableId(e.attemptId)&&nullableId(e.familyId)&&nullableId(e.sourceId)&&nullableId(e.sourceVersion)&&(!['return-presentation','check-presentation'].includes(e.kind)||ident(e.attemptId)&&ident(e.familyId)&&nat(e.seq)&&ident(e.sourceId)&&ident(e.sourceVersion)&&matches(e,reviewedBank().get(e.itemId))&&reviewedBank().get(e.itemId)?.pool===(e.kind==='check-presentation'?'check':'later'))))return false;
    const numbered=s.events.concat(s.exposures).filter(e=>e.seq!==undefined);if(new Set(numbered.map(e=>e.seq)).size!==numbered.length)return false;
    const presentations=s.exposures.filter(e=>['return-presentation','check-presentation'].includes(e.kind));if(new Set(presentations.map(e=>e.attemptId)).size!==presentations.length)return false;
    const seenItems=new Set(),seenFamilies=new Map();
    let lastAt=0;
    for(const e of s.events){
      if(e.at<lastAt||seenItems.has(e.itemId)&&!e.repeated)return false;
      const families=e.objectiveId!==null?(seenFamilies.get(e.objectiveId)||new Set()):new Set();
      if(e.familiarFamily!==(e.familyId!==null&&families.has(e.familyId)))return false;
      if(e.pool==='check'&&e.independentEligible){
        const item=reviewedBank().get(e.itemId),presentation=presentations.find(x=>x.kind==='check-presentation'&&x.attemptId===e.id&&x.itemId===e.itemId);
        if(item?.pool!=='check'||e.objectiveId!==item.objectiveId||e.familyId!==item.familyId)return false;
        if(!presentation){
          // Committed first-release checks predate presentation records. They
          // remain readable through the explicit unchanged-item whitelist only.
          if(e.presentationId!=null||!root.AceDATContent?.legacyEvidenceItemIds?.includes(e.itemId))return false;
        }else{
          if(e.presentationId!==e.id||!nat(e.seq)||presentation.seq>=e.seq||presentation.at>e.at||!knownVersion(e,item))return false;
          const previous={cards:{},events:s.events.filter(x=>x!==e&&before(x,e)),exposures:s.exposures.filter(x=>before(x,e))};
          if(!evaluateCheck(e.itemId,previous,presentation).eligible)return false;
        }
      }
      if(e.pool==='later'&&e.independentEligible){
        const presentation=presentations.find(x=>x.kind==='return-presentation'&&x.attemptId===e.id&&x.itemId===e.itemId);
        if(!presentation||e.presentationId!==e.id||!nat(e.seq)||presentation.seq>=e.seq||presentation.at>e.at||!matches(e,reviewedBank().get(e.itemId))||!knownVersion(e,reviewedBank().get(e.itemId)))return false;
        const previous={cards:{},events:s.events.filter(x=>x!==e&&before(x,e)),exposures:s.exposures.filter(x=>before(x,e))};
        if(!evaluateReturn(e.itemId,previous,e.at,presentation).eligible)return false;
      }
      lastAt=e.at;seenItems.add(e.itemId);if(e.familyId!==null)families.add(e.familyId);if(e.objectiveId!==null)seenFamilies.set(e.objectiveId,families);
    }
    return true;
  }
  let storageError=null;
  const read=()=>{try{const raw=root.localStorage.getItem(KEY);if(raw===null){storageError=null;return fresh();}const s=JSON.parse(raw);if(!valid(s))throw Error('This DAT review save is invalid. Its original bytes were kept.');storageError=null;return s;}catch(e){storageError=e.message;return fresh();}};
  const write=s=>{if(storageError)return {ok:false,error:storageError};if(!valid(s))return {ok:false,error:'DAT review save validation failed.'};try{root.localStorage.setItem(KEY,JSON.stringify(s));}catch(e){return {ok:false,error:e.message};}try{root.dispatchEvent(new CustomEvent('ace-dat-realms:srs'));}catch(e){}return {ok:true};};
  function state(){const s=read();if(s.daily.date!==today())s.daily=day();return s;}
  function evidenceEvent(s,id,g,o,now){
    const previous=s.events.filter(e=>e.itemId===id),objectiveId=ident(o.objectiveId)?o.objectiveId:null,familyId=ident(o.familyId)?o.familyId:null;
    const peers=objectiveId?s.events.filter(e=>e.objectiveId===objectiveId):[];
    const explicit=ident(o.attemptId)&&typeof o.correct==='boolean'&&o.assisted===false&&o.practice===false&&o.selfRated!==true&&['check','later'].includes(o.pool)&&objectiveId!==null&&familyId!==null;
    const item=reviewedBank().get(id),laterCase=o.pool==='later'||item?.pool==='later',checkCase=o.pool==='check'||item?.pool==='check';
    const held=(laterCase?activeReturns:activeChecks).get(o.attemptId),kind=laterCase?'return-presentation':'check-presentation';
    const presentation=held?.itemId===id?s.exposures.find(e=>e.kind===kind&&e.attemptId===o.attemptId&&e.seq===held.seq):null;
    const check=checkCase?evaluateCheck(id,s,presentation):null;
    const assisted=o.assisted===true||check?.assisted===true,repeated=o.repeated===true||previous.length>0||!!s.cards[id]||check?.repeated===true;
    const metadataAllowed=!!item&&o.objectiveId===item.objectiveId&&o.familyId===item.familyId&&o.pool===item.pool&&(o.sourceId===undefined||o.sourceId===item.sourceId)&&(o.sourceVersion===undefined||o.sourceVersion===item.sourceVersion);
    const presentationAllowed=metadataAllowed&&(laterCase?o.pool==='later'&&!!presentation&&evaluateReturn(id,s,now,presentation).eligible:checkCase&&o.pool==='check'&&!!presentation&&check.eligible);
    const practice=o.practice!==false||!explicit||!presentationAllowed||repeated||assisted,eligible=explicit&&!assisted&&!repeated&&presentationAllowed;
    const familiarFamily=familyId!==null&&peers.some(e=>e.familyId===familyId);
    return {id:ident(o.attemptId)?o.attemptId:`practice:${now}:${s.events.length+1}`,itemId:id,at:now,seq:sequence(s),grade:g,correct:typeof o.correct==='boolean'?o.correct:null,assisted,practice,repeated,objectiveId,familyId,pool:['practice','check','later'].includes(o.pool)?o.pool:'self-rated',independentEligible:eligible,delayedRecall:eligible&&o.correct===true&&o.pool==='later',familiarFamily,confidence:[null,'unsure','steady','sure','guess','shaky'].includes(o.confidence)?o.confidence:null,presentationId:presentation?o.attemptId:null,...sourceMeta(item)};
  }
  function recordExposure(itemId,o){
    o=o||{};if(!ident(itemId)||!ident(o.objectiveId)||!ident(o.kind)||['return-presentation','check-presentation'].includes(o.kind))return {saved:false,error:'Exposure needs an item, objective and teaching kind.'};
    const s=state(),at=Date.now();if(o.at!==undefined&&(!nat(o.at)||o.at>at)||s.exposures.length>=MAX_EVENTS)return {saved:false,error:'Invalid exposure time or full evidence history.'};
    // Caller timestamps never backdate instruction. The actual runtime clock is authoritative.
    const item=reviewedBank().get(itemId),metadata=sourceMeta(item);
    if(!item){metadata.sourceId=ident(o.sourceId)?o.sourceId:null;metadata.sourceVersion=ident(o.sourceVersion)?o.sourceVersion:null;}
    const event={itemId,objectiveId:o.objectiveId,kind:o.kind,at,seq:sequence(s),...metadata};s.exposures.push(event);const r=write(s);return {saved:r.ok,event:r.ok?event:null,error:r.error||null};
  }
  function evidenceSummary(s){s=s||state();return {responses:s.events.length,assisted:s.events.filter(e=>e.assisted).length,practice:s.events.filter(e=>e.practice).length,repeated:s.events.filter(e=>e.repeated).length,independentCorrect:s.events.filter(e=>e.independentEligible&&e.correct===true).length,recalledLater:s.events.filter(e=>e.delayedRecall).length};}
  // grade: 0 again, 1 hard, 2 good, 3 easy
  function grade(id,g,opts){
    if(!ident(id)||![0,1,2,3].includes(g))return null;opts=obj(opts)?opts:{};const s=state(),now=Date.now();
    const prior=ident(opts.attemptId)&&s.events.find(e=>e.id===opts.attemptId);if(prior)return {card:s.cards[prior.itemId],wasDue:false,clearedNow:false,event:prior,duplicate:true,saved:!storageError,error:storageError};
    if(s.events.length>=MAX_EVENTS)return {card:s.cards[id]||null,wasDue:false,clearedNow:false,event:null,saved:false,error:'Evidence history is full. Export it before continuing.'};
    const event=evidenceEvent(s,id,g,opts,now),c=s.cards[id]||{ivl:0,ease:2.5,reps:0,lapses:0,due:0,created:now};
    const wasDue=c.reps>0&&c.due<=now;let ivl=c.ivl,ease=c.ease;
    // A miss goes to the learning step (10 minutes) and onto the relearn ladder (10/23): each right answer after it
    // climbs 1, 3, 7, then 21 days; after 21 days the card grows by its ease again. A miss anywhere starts over.
    if(g===0){c.lapses++;c.lx=(Array.isArray(c.lx)?c.lx:[]).concat(now).slice(-12);ease=Math.max(1.3,ease-.2);ivl=0;c.due=now+10*MIN;c.lad=0;}
    else if(Number.isInteger(c.lad)&&c.lad>=0&&c.lad<LADDER.length){ivl=LADDER[c.lad];if(g>=2){c.lad++;if(c.lad>=LADDER.length)delete c.lad;}c.due=now+ivl*DAY;}
    else{if(g===1){ease=Math.max(1.3,ease-.15);ivl=c.reps?Math.max(1,ivl*1.2):1;}
      else if(g===2){ivl=c.reps===0?1:c.reps===1&&ivl<3?3:Math.max(ivl+1,Math.round(ivl*ease));}
      else{ease=ease+.15;ivl=c.reps===0?3:Math.max(ivl+2,Math.round(ivl*ease*1.3));}
      c.due=now+ivl*DAY;}
    c.ivl=Math.round(ivl*10)/10;c.ease=Math.round(ease*100)/100;c.reps++;c.last=now;c.kind=ident(opts.kind)?opts.kind:c.kind||'q';if(nat(opts.session)||ident(opts.session))c.s=opts.session;s.cards[id]=c;s.events.push(event);
    s.shown=(Array.isArray(s.shown)?s.shown:[]).concat({id,at:now}).slice(-SHOWN_MAX);
    if(wasDue){s.daily.reviews++;if(g>=2){s.daily.correct++;s.daily.crystals++;s.crystals++;}}
    let clearedNow=false;if(!s.daily.cleared&&wasDue&&dueCount(s)===0){s.daily.cleared=true;clearedNow=true;}
    const written=write(s);return {card:c,wasDue:written.ok&&wasDue,clearedNow:written.ok&&clearedNow,event:written.ok?event:null,duplicate:false,saved:written.ok,error:written.error||null};
  }
  function dueList(s,filter){s=s||state();const now=Date.now();return Object.entries(s.cards).filter(([id,c])=>c.due<=now&&(!filter||filter(id,c))).sort((a,b)=>a[1].due-b[1].due).map(([id])=>id);}
  function dueCount(s){return dueList(s).length;}
  function budgetLeft(s){s=s||state();return Math.max(0,s.settings.budget-s.daily.reviews);}
  // Pick up to n due ids for a session, respecting the daily budget.
  function blendFor(session,n,valid){const s=state();const room=Math.min(n,budgetLeft(s));if(room<=0)return [];return dueList(s,(id,c)=>(!session||c.s===session)&&(!valid||valid(id))).slice(0,room);}
  function summary(){const s=state(),due=dueCount(s);return {due,served:Math.min(due,budgetLeft(s)),overflow:Math.max(0,due-budgetLeft(s)),daily:s.daily,crystals:s.crystals,settings:s.settings,total:Object.keys(s.cards).length,
    mature:Object.values(s.cards).filter(c=>c.ivl>=21).length,young:Object.values(s.cards).filter(c=>c.ivl>0&&c.ivl<21).length,learning:Object.values(s.cards).filter(c=>c.ivl===0).length,evidence:evidenceSummary(s),storageError};}
  function setSettings(p){const s=state();if(!obj(p))return {ok:false,error:'Invalid settings.'};s.settings={...s.settings,...p};return write(s);}
  function noteNewDex(){const s=state();s.daily.newDex++;write(s);}
  function card(id){return state().cards[id]||null;}
  function preview(id,g){const c=card(id)||{ivl:0,ease:2.5,reps:0};if(g===0)return '10 min';let ivl=c.ivl,e=c.ease;
    if(Number.isInteger(c.lad)&&c.lad>=0&&c.lad<LADDER.length)ivl=LADDER[c.lad];else if(g===1)ivl=c.reps?Math.max(1,ivl*1.2):1;else if(g===2)ivl=c.reps===0?1:c.reps===1&&ivl<3?3:Math.max(ivl+1,Math.round(ivl*e));else ivl=c.reps===0?3:Math.max(ivl+2,Math.round(ivl*(e+.15)*1.3));
    ivl=Math.round(ivl);return ivl>=30?Math.round(ivl/30)+' mo':ivl+' d';}
  // ---------- route dealing (10/23) ----------
  // order(ids, {n, prefer, count}): the questions one encounter deals from a route's pool (ids), in play order.
  //   - New first: ids with no card yet, shuffled, so nothing repeats until every new question has been seen.
  //   - Reviews: one due card (the most overdue) joins about 1 encounter in 4, second in line, with the "Review card"
  //     tag (isReview). When the new ones run out, due cards fill the encounter first.
  //   - Spacing: a question answered in the last GAP answers (s.shown, written by grade) is never dealt, so at least
  //     5 other questions sit between two showings and nothing comes back to back.
  //   - Only when new and due both run short: the cards seen longest ago.
  // prefer(id) > 0 moves an id ahead inside the new ones (a hard trainer's exam-style kinds). count:false deals without
  // counting an encounter (the second session of a multi-session pick). Saved: s.enc {n, lastReview} beside s.shown.
  let lastReviews=new Set();
  function order(ids,o){o=o||{};const n=Math.max(1,Math.floor(+o.n||5)),s=state(),now=Date.now(),cards=s.cards;
    const pool=[...new Set((Array.isArray(ids)?ids:[]).filter(ident))];
    const shown=Array.isArray(s.shown)?s.shown:[],recent=new Set(shown.slice(-GAP).map(x=>x&&x.id));
    const mix=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
    let fresh=mix(pool.filter(id=>!cards[id]&&!recent.has(id)));
    if(typeof o.prefer==='function'){const p=id=>{try{return +o.prefer(id)||0;}catch(e){return 0;}};fresh=fresh.map((id,i)=>[id,i]).sort((a,b)=>p(b[0])-p(a[0])||a[1]-b[1]).map(x=>x[0]);}
    const due=pool.filter(id=>cards[id]&&cards[id].due<=now&&!recent.has(id)).sort((a,b)=>cards[a].due-cards[b].due);
    const enc=s.enc&&typeof s.enc==='object'?s.enc:{n:0,lastReview:-99};if(o.count!==false)enc.n=(+enc.n||0)+1;
    let reviews=[];const lastRev=Number.isFinite(+enc.lastReview)?+enc.lastReview:-99;if(due.length&&(enc.n-lastRev>=4||fresh.length<n)){reviews=fresh.length<n?due.slice(0,Math.max(1,n-fresh.length)):due.slice(0,1);enc.lastReview=enc.n;}
    const old=pool.filter(id=>cards[id]&&!recent.has(id)&&!(cards[id].due<=now)).sort((a,b)=>(cards[a].last||0)-(cards[b].last||0));
    const rest=[...fresh,...due.filter(id=>!reviews.includes(id)),...old].filter(id=>!reviews.includes(id)),out=rest.slice(0,Math.max(0,n-reviews.length));
    reviews.forEach((id,k)=>out.splice(Math.min(out.length,1+k*2),0,id));
    if(out.length<n)for(const id of pool)if(out.length<n&&!out.includes(id)&&!recent.has(id))out.push(id);
    // A pool too small for the gap: the least recently answered ones, never the very last answer.
    if(out.length<Math.min(3,pool.length)){const last=shown.length?shown[shown.length-1].id:null;for(const x of shown.slice(-GAP))if(x&&out.length<Math.min(3,pool.length)&&pool.includes(x.id)&&x.id!==last&&!out.includes(x.id))out.push(x.id);}
    s.enc=enc;write(s);lastReviews=new Set(reviews);return out.slice(0,n);}
  // True for an id the latest order() dealt as a due review (the battle shows the "Review card" tag).
  const isReview=id=>lastReviews.has(id);
  root.AtlasSRS={KEY,NAMESPACE,RECALL_GAP,checkStatus,beginCheck,endCheck,returnStatus,beginReturn,grade,recordExposure,evidenceSummary,valid,fresh,dueList,dueCount,blendFor,summary,setSettings,noteNewDex,card,preview,state,order,isReview,LADDER};
})(typeof window!=='undefined'?window:globalThis);
