/* Party changes preserve every owned record. This module performs no storage writes. */
(function(root){
  'use strict';
  const LIMIT=6;
  const registry=best=>[...new Map((Array.isArray(best?.species)?best.species:[]).filter(s=>s&&typeof s.id==='string'&&s.id).map(s=>[s.id,s])).values()];
  const fingerprint=state=>JSON.stringify([state.party,state.partner,(state.creatures||[]).map(m=>m.id)]);
  function problem(state,best){
    const ids=new Set(registry(best).map(s=>s.id));
    if(!state||!Array.isArray(state.creatures)||!Array.isArray(state.party))return 'The team record is unavailable.';
    const owned=state.creatures.map(m=>m?.id);
    if(owned.some(id=>!ids.has(id))||new Set(owned).size!==owned.length)return 'The collection contains an unregistered or duplicate companion.';
    if(state.party.length>LIMIT||new Set(state.party).size!==state.party.length||state.party.some(id=>!owned.includes(id)))return 'The party record is invalid. No changes were made.';
    if(state.partner!==null&&!state.party.includes(state.partner)||state.party.length&&!state.partner||owned.length&&!state.party.length)return 'The follower and party record do not agree. No changes were made.';
    return '';
  }
  function canAcquire(state,id,best,{legendary=false}={}){
    if(problem(state,best)||!state.starter)return false;
    const all=registry(best),entry=all.find(s=>s.id===id);
    return !!entry&&(!legendary||entry.legendary===true)&&!state.creatures.some(m=>m.id===id)&&state.creatures.length<all.length;
  }
  function plan(state,action,best){
    const error=problem(state,best);if(error)return {ok:false,status:'invalid',message:error};
    if(!action||!['add','follow','reserve'].includes(action.type)||!state.creatures.some(m=>m.id===action.id))return {ok:false,status:'invalid',message:'Choose an owned, registered companion.'};
    const party=state.party.slice(),inside=party.includes(action.id),partner=state.partner;
    const base={ok:true,status:'ready',action:{type:action.type,id:action.id},before:fingerprint(state),from:{party:party.slice(),partner}};
    if(action.type==='reserve'){
      if(!inside)return {...base,status:'noop',message:'This companion is already in Reserve.'};
      if(party.length===1)return {ok:false,status:'invalid',message:'Keep at least one companion in your party.'};
      const next=party.filter(id=>id!==action.id);
      return {...base,to:{party:next,partner:partner===action.id?next[0]:partner},removed:action.id};
    }
    if(inside)return action.type==='follow'&&partner!==action.id?{...base,to:{party,partner:action.id}}:{...base,status:'noop',message:action.type==='follow'?'This companion is already following you.':'This companion is already in the party.'};
    if(party.length===LIMIT){
      if(!action.replace)return {...base,status:'swap-required',choices:party};
      if(!party.includes(action.replace))return {ok:false,status:'invalid',message:'Choose the party member to move to Reserve.'};
      const next=party.map(id=>id===action.replace?action.id:id);
      return {...base,status:'confirm-swap',removed:action.replace,to:{party:next,partner:action.type==='follow'||partner===action.replace?action.id:partner}};
    }
    return {...base,to:{party:[...party,action.id],partner:action.type==='follow'?action.id:partner}};
  }
  function commit(state,proposal,best,{confirmed=false}={}){
    if(!proposal?.ok||!['ready','confirm-swap'].includes(proposal.status)||proposal.before!==fingerprint(state)||problem(state,best))return {ok:false,changed:false,state,message:'The team changed. Choose the action again.'};
    // Rebuild from the action; a forged target party cannot bypass validation or confirmation.
    const checked=plan(state,{...proposal.action,replace:proposal.removed},best);
    if(!checked.ok||!checked.to)return {ok:false,changed:false,state,message:checked.message};
    if(checked.status==='confirm-swap'&&!confirmed)return {ok:false,changed:false,state,message:'Confirm the named swap or cancel.'};
    const next={...state,party:checked.to.party,partner:checked.to.partner};
    return {ok:true,changed:true,state:next,receipt:{from:checked.from,after:fingerprint(next)}};
  }
  function undo(state,receipt,best){
    if(!receipt||receipt.after!==fingerprint(state)||problem(state,best))return {ok:false,changed:false,state,message:'The team changed. Choose companions again to reverse this change.'};
    const next={...state,party:receipt.from.party.slice(),partner:receipt.from.partner};
    if(problem(next,best))return {ok:false,changed:false,state};
    return {ok:true,changed:true,state:next};
  }
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function view(state,best,{mode='owned',search='',course='ALL'}={}){
    const all=registry(best),party=new Set(state.party||[]),owned=new Map((state.creatures||[]).map(m=>[m.id,m]));
    const rows=all.map(s=>{const m=owned.get(s.id),name=m&&best.name?best.name(m):s.name;return {species:s,member:m,id:s.id,name:name||s.name||s.id,owned:!!m,inParty:party.has(s.id),following:state.partner===s.id,course:(s.courseId||'Other').replace(/(D\d{3})E\d+$/,'$1')};});
    const term=String(search).trim().toLowerCase();
    const filtered=rows.filter(r=>(mode==='uncaught'?!r.owned:mode==='reserve'?r.owned&&!r.inParty:r.owned)&&(course==='ALL'||r.course===course)&&[r.name,r.species.name,r.id,r.species.evolution,r.species.description,r.course,r.species.trait?.name,r.species.trait?.role,r.species.trait?.description].join(' ').toLowerCase().includes(term));
    return {rows:filtered,slots:Array.from({length:LIMIT},(_,i)=>rows.find(r=>r.id===state.party?.[i])||null),courses:[...new Set(rows.map(r=>r.course))].sort(),total:all.length,owned:owned.size,reserve:rows.filter(r=>r.owned&&!r.inParty).length,uncaught:rows.filter(r=>!r.owned).length,error:problem(state,best)};
  }
  function mount(host,{getState,bestiary:best,courses=[],onChange=()=>{},onPortraits=()=>{},onDex,onNursery,onMoves,onRescue,onNotice=()=>{}}){
    let filters={mode:'owned',search:'',course:'ALL'},pending=null,receipt=null,message='',destroyed=false;
    const name=id=>{const m=getState().creatures.find(m=>m.id===id);return m?best.name(m):id;};
    const card=(r,slot)=>`<article class="tc-card ${r.owned?'':'tc-uncaught'}"><canvas data-creature="${esc(r.id)}" data-xp="${Number(r.member?.xp)||0}" aria-hidden="true"></canvas><div class="tc-card-body"><p class="tc-state">${slot?`Slot ${slot} | `:''}${esc(r.course)} | ${r.following?'Owned | Following | Party':r.inParty?'Owned | Party':r.owned?'Owned | Reserve':'Uncaught'}</p><h4>${esc(r.name)}</h4>${r.name!==r.species.name?`<p class="tc-base-name">${esc(r.species.name)} line</p>`:''}<p>${esc(r.species.description||'')}</p><p class="tc-ability"><strong>${esc(r.species.trait?.name||'Battle ability')}${r.species.trait?.role?' | '+esc(r.species.trait.role):''}</strong><br>${esc(r.species.trait?.description||'No battle ability listed for this companion.')}</p>${r.owned?`<p>Lv. ${esc(best.level?.(r.member.xp)||1)} | ${esc(r.member.xp)} adventure XP</p><div class="tc-actions"><button type="button" data-tc-action="follow" data-tc-id="${esc(r.id)}" ${r.following?'disabled':''}>${r.following?'Following':'Follow'}</button>${r.inParty?`<button type="button" data-tc-action="reserve" data-tc-id="${esc(r.id)}" ${getState().party.length===1?'disabled':''}>Move to Reserve</button>`:`<button type="button" data-tc-action="add" data-tc-id="${esc(r.id)}">Add to Party</button>`}</div>`:`<p>Uncaught companions join through DAT routes and story encounters. Open the field guide to explore the concepts behind their realms.</p>`}</div></article>`;
    function render(focus){
      if(destroyed)return;const state=getState(),vm=view(state,best,filters),courseName=id=>{const course=courses.find(c=>c.id===id);return course?.name||course?.title;};
      const swap=pending?`<section class="tc-swap" aria-labelledby="tcSwapTitle"><h3 id="tcSwapTitle" tabindex="-1">Party full | choose a swap</h3><p>${pending.action.type==='follow'?'Follow':'Add'} <strong>${esc(name(pending.action.id))}</strong>. Choose who moves to Reserve.</p><label for="tcReplacement">Party member to move to Reserve</label><select id="tcReplacement"><option value="">Choose a companion</option>${state.party.map(id=>`<option value="${esc(id)}" ${pending.removed===id?'selected':''}>${esc(name(id))}${state.partner===id?' | current follower':''}</option>`).join('')}</select><p id="tcSwapPreview" role="status">${pending.removed?`<strong>${esc(name(pending.removed))}</strong> will leave Party for Reserve. <strong>${esc(name(pending.action.id))}</strong> will take that slot${pending.to?.partner===pending.action.id?' and follow you':''}. Both remain owned with all XP and forms.`:'No changes yet. Choose a member to preview the exact swap.'}</p><div class="tc-actions"><button type="button" id="tcConfirm" ${pending.status==='confirm-swap'?'':'disabled'}>Confirm swap</button><button type="button" id="tcCancel">Cancel</button></div></section>`:'';
      host.innerHTML=`<div class="tc-root"><p class="tc-intro">Keep up to six companions in Party. Follow chooses who walks with you. Reserve holds every owned companion outside Party; moving or swapping keeps their XP and forms.</p><div class="tc-links">${onDex?`<button type="button" id="tcDex">Field guide | ${vm.owned}/${vm.total} owned</button>`:''}${onNursery?'<button type="button" id="tcNursery">Egg nursery</button>':''}${onMoves?'<button type="button" id="tcMoves">Field moves</button>':''}</div><details class="tc-help"><summary>How to play</summary><p>Choose a realm or explore a route, open its Canon lessons, and try study battles when you want practice. Befriend companions through route encounters and stories. Build Party here and choose Follow. Each ability below explains its battle effect. You can use your current course without finishing earlier routes.</p><p>Adventure XP and evolutions are game progress; they do not measure exam readiness.</p></details>${vm.error?`<p class="tc-error" role="alert">${esc(vm.error)}</p>`:''}<section aria-labelledby="tcPartyTitle"><h3 id="tcPartyTitle" tabindex="-1">Party | ${state.party.length}/6 slots</h3><p class="tc-note">Party changes can be reversed. Keep at least one companion in Party.</p><div class="tc-party">${vm.slots.map((r,i)=>r?card(r,i+1):`<div class="tc-empty">Slot ${i+1}<span>Empty | add an owned companion below</span></div>`).join('')}</div></section>${swap}<div class="tc-feedback" role="status">${esc(message)}${receipt?'<button type="button" id="tcUndo">Undo last party change</button>':''}</div><section aria-labelledby="tcCollectionTitle"><h3 id="tcCollectionTitle" tabindex="-1">Collection</h3><div class="tc-tabs" role="group" aria-label="Collection view">${[['owned',`Owned (${vm.owned})`],['reserve',`Reserve (${vm.reserve})`],['uncaught',`Uncaught (${vm.uncaught})`]].map(([mode,label])=>`<button type="button" data-tc-mode="${mode}" aria-pressed="${filters.mode===mode}">${label}</button>`).join('')}</div><div class="tc-filters"><label for="tcSearch">Search companions<input type="search" id="tcSearch" value="${esc(filters.search)}" placeholder="Name, ability, or course"></label><label for="tcCourse">Course<select id="tcCourse"><option value="ALL">All courses</option>${vm.courses.map(id=>`<option value="${esc(id)}" ${filters.course===id?'selected':''}>${esc(id+(courseName(id)?' | '+courseName(id):''))}</option>`).join('')}</select></label></div><p class="tc-note" role="status">${vm.rows.length} ${filters.mode==='uncaught'?'uncaught':filters.mode==='reserve'?'Reserve':'owned'} companions shown${filters.search?' for "'+esc(filters.search)+'"':''}.</p><div class="tc-collection">${vm.rows.map(r=>card(r)).join('')||'<p class="tc-empty-result">No companions match. Try another search, course, or collection view.</p>'}</div></section></div>`;
      host.querySelectorAll('[data-tc-rescue]').forEach(b=>b.onclick=()=>onRescue(b.dataset.tcRescue,b.dataset.tcCourse));
      host.querySelectorAll('[data-tc-action]').forEach(b=>b.onclick=()=>act({type:b.dataset.tcAction,id:b.dataset.tcId}));
      host.querySelectorAll('[data-tc-mode]').forEach(b=>b.onclick=()=>{filters.mode=b.dataset.tcMode;render(`[data-tc-mode="${filters.mode}"]`);});
      host.querySelector('#tcSearch').oninput=e=>{const start=e.target.selectionStart,end=e.target.selectionEnd;filters.search=e.target.value;render('#tcSearch');host.querySelector('#tcSearch').setSelectionRange(start,end);};
      host.querySelector('#tcCourse').onchange=e=>{filters.course=e.target.value;render('#tcCourse');};
      const bind=(id,fn)=>{const el=host.querySelector('#'+id);if(el)el.onclick=fn;};
      bind('tcDex',onDex);bind('tcNursery',onNursery);bind('tcMoves',onMoves);
      bind('tcCancel',()=>{pending=null;message='Swap cancelled. Party and Collection are unchanged.';render('#tcCollectionTitle');});
      bind('tcConfirm',()=>apply(commit(getState(),pending,best,{confirmed:true})));
      bind('tcUndo',()=>{const result=undo(getState(),receipt,best);if(result.ok){receipt=null;pending=null;onChange(result.state);message='Previous Party and follower restored.';render('#tcPartyTitle');}else{message=result.message;render();}});
      const replacement=host.querySelector('#tcReplacement');if(replacement)replacement.onchange=e=>{const proposed=plan(getState(),{...pending.action,replace:e.target.value},best);if(proposed.ok)pending=proposed;else message=proposed.message;render('#tcReplacement');};
      onPortraits(host);if(focus)host.querySelector(focus)?.focus();
    }
    function apply(result){if(!result.ok){message=result.message||'No team changes were made.';onNotice(message);render();return;}receipt=result.receipt;pending=null;onChange(result.state);message='Party updated. Every companion remains owned.';render('#tcPartyTitle');}
    function act(action){const proposed=plan(getState(),action,best);if(proposed.status==='swap-required'){pending=proposed;message='';render('#tcSwapTitle');return;}if(proposed.status==='noop'){message=proposed.message;render();return;}if(!proposed.ok){message=proposed.message;onNotice(message);render();return;}apply(commit(getState(),proposed,best));}
    render();return {destroy(){destroyed=true;},getView:()=>view(getState(),best,filters)};
  }
  const api={LIMIT,registry,problem,canAcquire,plan,commit,undo,view,mount};
  root.AtlasTeamCollection=api;if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
