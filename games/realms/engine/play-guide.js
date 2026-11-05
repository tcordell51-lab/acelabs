/* Mnemon play-guide UI adaptation. See docs/PLAY-GUIDE-PROVENANCE.md.
 * Original seven-beat spotlight/card, Skip/Back/Next and map checklist presentation retained.
 * DAT text and suggested route steps come only from this isolated game's own registries.
 * The checklist is navigation/story progress, never a Warden gate or mastery score.
 * No curriculum, saved state or service integration was copied from the original project.
 * Only this game's guide preference is written. */
(function(root){
  'use strict';
  const D=root.document;
  if(!D||!D.body||root.AtlasPlayGuide)return;
  if(!D.body.classList.contains('world-app'))return;
  const KEY='ace_dat_realms_mnemon_v1_play_guide_v1',WORLD='ace_dat_realms_mnemon_v1_world_v1';
  const PHONE=root.matchMedia?root.matchMedia('(max-width: 760px)'):{matches:false};
  const COARSE=root.matchMedia?root.matchMedia('(pointer: coarse)'):{matches:false};
  const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function prefs(){try{const p=JSON.parse(root.localStorage.getItem(KEY)||'{}');return p&&typeof p==='object'?p:{};}catch(e){return {};}}
  function setPref(k,v){const p=prefs();p[k]=v;try{root.localStorage.setItem(KEY,JSON.stringify(p));}catch(e){}}
  // A new save: no companion chosen yet when this script ran (the trainer maker and the companion chooser are still ahead).
  const FRESH=(()=>{try{const s=JSON.parse(root.localStorage.getItem(WORLD)||'null');return !s||!s.starter;}catch(e){return false;}})();
  const visible=el=>{if(!el||!el.isConnected)return false;const r=el.getBoundingClientRect();if(!r.width||!r.height)return false;const cs=root.getComputedStyle(el);return cs.display!=='none'&&cs.visibility!=='hidden'&&+cs.opacity!==0;};
  const first=(...sels)=>{for(const s of sels){const els=typeof s==='string'?D.querySelectorAll(s):[s];for(const el of els)if(visible(el))return el;}return null;};
  const R=()=>root.AtlasRegion;
  const world=()=>{try{const A=root.AtlasApp;return A&&A.world?A.world():null;}catch(e){return null;}};

  // ---------- the tour ----------
  const BEATS=[
    {t:'Move',target:()=>first('.aw-dpad','.aw-controls','canvas'),
     h:()=>COARSE.matches||PHONE.matches
       ?'Use the pad to walk, or tap a spot on the path and you walk there. The <b>A</b> button talks, reads signs and opens doors. Long-press the middle of the pad to run.'
       :'Walk with the <b>arrow keys</b> or <b>W A S D</b>, or click a spot on the path. <b>Space</b> or <b>Enter</b> talks, reads signs and opens doors. Hold <b>Shift</b> to switch between walking and running.'},
    {t:'Tall grass is a wild battle',target:null,
     h:()=>'On a route, tall grass can start a wild encounter. Choose <b>Fight</b>, then a move: a DAT practice question powers the attack. You can also use <b>Bag</b>, switch your <b>Team</b> or <b>Run</b>. Weaken a wild creature to catch it. Catching is an adventure choice, not a requirement for the Warden.'},
    {t:'Trainers ask questions too',target:()=>first('#nextStepButton','canvas'),
     h:()=>'Each opening route has two trainers for short practice battles. Walk beside one and press <b>A</b> or <b>Enter</b>. <b>Next step</b> at the top (or the N key) offers a suggested route and guides you to the next activity. You may explore another realm whenever you want.'},
    {t:'The field exercise',target:null,
     h:()=>'The route\'s <b>field station</b> opens its concept guides. Start with the definitions and worked example, then predict and explore an available model. These guides are here before, during and after practice. Visiting a station advances your suggested route; it does not prove that you know the topic.'},
    {t:'Meet Team Entropy',target:null,
     h:()=>'Team Entropy has scrambled the field notes. Its scout offers optional practice, including missed practice questions when available. You can get an explanation and try again without losing your companions. Team Entropy is a fictional team; scientific entropy is not a villain.'},
    {t:'The Warden ends each route',target:()=>first('#pgChip','#nextStepButton'),
     h:()=>'The <b>Warden</b> offers a separate checkpoint for the route\'s opening concepts. It is available whenever you want to try. The checklist under the place name is a suggested route, not a lock. Win to restore the route in the story. That reward does not certify a whole DAT topic or predict your score.'},
    {t:'Help is there when you want it',target:()=>first('#hcMenuButton','.world-navigation'),
     h:()=>'The <b>Recall Center</b> offers free rest and due practice. <b>Menu &gt; DAT Canon</b> opens the field lessons, and <b>Build this concept</b> offers help in a battle. The learning journal keeps supported practice separate from independent checks. Replay this tour through <b>Menu &gt; How to play</b> any time.'}
  ];
  let ov=null,ring=null,card=null,step=0,running=false,onKey=null,onMove=null,returnFocus=null;
  function build(){
    ov=D.createElement('div');ov.className='pg-tour';ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');ov.setAttribute('aria-labelledby','pgTitle');
    ov.innerHTML='<div class="pg-shade"></div><div class="pg-ring" aria-hidden="true"></div><section class="pg-card"><p class="pg-eyebrow" id="pgStep"></p><h2 id="pgTitle"></h2><p class="pg-body" id="pgBody"></p><div class="pg-dots" aria-hidden="true"></div><div class="pg-actions"><button type="button" class="pg-skip">Skip tour</button><span class="pg-grow"></span><button type="button" class="pg-back">Back</button><button type="button" class="pg-next">Next</button></div></section>';
    ring=ov.querySelector('.pg-ring');card=ov.querySelector('.pg-card');
    ov.querySelector('.pg-dots').innerHTML=BEATS.map(()=>'<i></i>').join('');
    ov.querySelector('.pg-skip').onclick=()=>stop(true);
    ov.querySelector('.pg-back').onclick=()=>go(step-1);
    ov.querySelector('.pg-next').onclick=()=>step>=BEATS.length-1?stop(true):go(step+1);
    ov.querySelector('.pg-shade').onclick=e=>{e.stopPropagation();};
    D.body.appendChild(ov);
  }
  function place(){if(!running||!ov)return;const b=BEATS[step],el=b.target&&b.target(),pad=8,vw=root.innerWidth,vh=root.innerHeight;
    let r=el?el.getBoundingClientRect():null;
    // A target bigger than most of the screen (the map) gets an inset ring so the card still has room.
    if(r&&r.width*r.height>vw*vh*.55){const ins=Math.min(vw,vh)*.12;r={left:Math.max(r.left,0)+ins,top:Math.max(r.top,0)+ins,width:Math.min(r.width,vw)-ins*2,height:Math.min(r.height,vh)*.45};}
    ov.classList.toggle('pg-no-ring',!r);
    if(r){ring.hidden=false;const x=Math.max(4,r.left-pad),y=Math.max(4,r.top-pad),w=Math.min(vw-8-x,r.width+pad*2),h=Math.min(vh-8-y,r.height+pad*2);Object.assign(ring.style,{left:x+'px',top:y+'px',width:w+'px',height:h+'px'});
      const mid=y+h/2;card.classList.toggle('pg-top',mid>vh*.5);card.classList.toggle('pg-bottom',mid<=vh*.5);}
    else{ring.hidden=true;card.classList.remove('pg-top');card.classList.add('pg-bottom');}}
  function go(i){step=Math.max(0,Math.min(BEATS.length-1,i));const b=BEATS[step];
    ov.querySelector('#pgStep').textContent='HOW TO PLAY | '+(step+1)+' OF '+BEATS.length;ov.querySelector('#pgTitle').textContent=b.t;ov.querySelector('#pgBody').innerHTML=b.h();
    ov.querySelectorAll('.pg-dots i').forEach((d,k)=>d.classList.toggle('on',k===step));
    ov.querySelector('.pg-back').disabled=step===0;const nx=ov.querySelector('.pg-next');nx.textContent=step===BEATS.length-1?'Start playing':'Next';
    place();try{nx.focus({preventScroll:true});}catch(e){}}
  function start(){if(running)return go(0);if(D.querySelector('dialog[open]'))return false;returnFocus=D.activeElement;running=true;try{root.AtlasHudCalm&&root.AtlasHudCalm.isOpen&&root.AtlasHudCalm.isOpen()&&root.AtlasHudCalm.close();}catch(e){}
    try{world()?.setPaused(true);}catch(e){}
    if(!ov||!ov.isConnected)build();ov.hidden=false;D.body.classList.add('pg-touring');
    onKey=e=>{if(!running||e.metaKey||e.ctrlKey||e.altKey)return;if(D.querySelector('dialog[open]')){stop(false);return;}const k=e.key;
      if(k==='Escape'){e.preventDefault();e.stopImmediatePropagation();stop(true);return;}
      if(k==='ArrowRight'||k==='Enter'){if(k==='Enter'&&e.target&&e.target.closest&&e.target.closest('.pg-skip,.pg-back'))return;e.preventDefault();e.stopImmediatePropagation();step>=BEATS.length-1?stop(true):go(step+1);return;}
      if(k==='ArrowLeft'){e.preventDefault();e.stopImmediatePropagation();go(step-1);return;}
      if(k==='Tab'){const buttons=[...ov.querySelectorAll('.pg-actions button')].filter(b=>!b.disabled),first=buttons[0],last=buttons[buttons.length-1];
        if(!ov.contains(D.activeElement)||e.shiftKey&&D.activeElement===first||!e.shiftKey&&D.activeElement===last){e.preventDefault();(e.shiftKey?last:first)?.focus();}e.stopImmediatePropagation();return;}
      // Movement and page shortcuts stay with the tour. Space still activates its buttons.
      if(k!==' '||!e.target?.closest?.('.pg-actions button'))e.preventDefault();e.stopImmediatePropagation();};
    root.addEventListener('keydown',onKey,true);onMove=()=>place();root.addEventListener('resize',onMove);
    go(0);return true;}
  function stop(seen){if(!running)return;running=false;if(ov)ov.hidden=true;D.body.classList.remove('pg-touring');if(onKey)root.removeEventListener('keydown',onKey,true);if(onMove)root.removeEventListener('resize',onMove);onKey=onMove=null;
    if(seen)setPref('seen',new Date().toISOString());try{if(!D.querySelector('dialog[open]')&&!root.AtlasHudCalm?.isOpen?.())world()?.setPaused(false);const c=returnFocus!==D.body&&returnFocus!==D.documentElement&&visible(returnFocus)?returnFocus:D.querySelector('canvas');c?.focus?.({preventScroll:true});}catch(e){}returnFocus=null;}
  // The map is clear: no dialog, no open panel, no menu, no story-scene question waiting.
  // A one-line question (the story-scenes toast, the Film Room offer) is waited on for about 12 seconds, then the tour
  // goes ahead; those lines stay put and can be answered after it.
  let askSince=0;
  function clear(){if(D.querySelector('dialog[open]'))return false;if(root.AtlasHudCalm&&root.AtlasHudCalm.isOpen&&root.AtlasHudCalm.isOpen())return false;
    if(first('.cs-stage','.cs-overlay','.cutscene'))return false;
    const ask=!!first('.cs-toast')||visible(D.getElementById('frPrompt'));if(ask){if(!askSince)askSince=Date.now();if(Date.now()-askSince<12000)return false;}else askSince=0;
    return !!first('#overworldHost canvas','canvas');}
  function autoStart(){if(prefs().seen)return;let n=0,ok=false;const t=setInterval(()=>{n++;if(prefs().seen){clearInterval(t);return;}
      // Ready: the companion is chosen (the setup popups are done) and nothing covers the map for two checks in a row.
      let ready=false;try{const s=JSON.parse(root.localStorage.getItem(WORLD)||'null');ready=!!(s&&s.starter);}catch(e){}
      if(ready&&clear()){if(ok){clearInterval(t);start();}else ok=true;}else ok=false;
      if(n>1800)clearInterval(t);},1000);}
  function nudge(){if(prefs().seen||prefs().nudged)return;setTimeout(()=>{if(prefs().seen||prefs().nudged)return;try{const A=root.AtlasApp;if(A&&A.notice){A.notice('New: a 1-minute tour of how to play. Menu > How to play.');setPref('nudged',new Date().toISOString());}}catch(e){}},9000);}

  // ---------- Menu > How to play ----------
  function menuButton(){const nav=D.querySelector('nav.world-navigation');if(!nav)return false;let b=D.getElementById('howToPlayButton');
    if(!b){b=D.createElement('button');b.type='button';b.id='howToPlayButton';b.textContent='How to play';nav.appendChild(b);}
    if(!b._datTourBound){b._datTourBound=true;b.title='A short tour of the controls and suggested route';b.onclick=()=>setTimeout(start,60);}return true;}

  // ---------- the route checklist chip ----------
  let chip=null,chipOpen=false,lastKey='';
  function checklist(){const Rg=R(),w=world();if(!Rg||!w||!w.zoneInfo||!w.zoneObjects)return null;const zi=w.zoneInfo()||{};if(zi.kind!=='region'||!zi.region)return null;
    const objs=w.zoneObjects(),kind=o=>o.action==='custom'?String(o.handler||'').split(':').pop():o.action,wd=objs.find(o=>o&&o.kind==='region'&&kind(o)==='warden'&&!o.optional);if(!wd)return null;
    const C=Rg.courseOf?Rg.courseOf(zi.region):root.AtlasApp?.course;
    const path=Rg.COURSE_DEFS?.[C]?.path?.()||[],steps=path.filter(s=>s.routeId===zi.region||s.zone===zi.region);if(!steps.length)return null;
    const complete=s=>{try{return !!s.done?.();}catch(e){return false;}};
    const items=steps.map(s=>({key:s.target||s.kind,label:s.label,done:complete(s),optional:!!s.optional}));
    const restored=!!wd.restored||steps.some(s=>s.kind==='warden'&&complete(s)),done=items.filter(i=>i.done).length;
    return {ck:{items,done,total:items.length,left:items.filter(i=>!i.done).map(i=>i.label),restored},name:wd.name||wd.label||'The Warden'};}
  function chipHTML(x){const ck=x.ck,head=ck.restored?'Route restored: story checkpoint complete':'Suggested route '+ck.done+'/'+ck.total+(ck.left.length?': '+ck.left[0]:'');
    const list=ck.items.map(i=>'<li class="'+(i.done?'on':'')+'"><b>'+(i.done?'Done':'Open')+'</b> '+esc(i.label)+(i.optional?' <small>(optional)</small>':'')+'</li>').join('');
    return '<button type="button" class="pg-chip-head" aria-expanded="'+(chipOpen?'true':'false')+'">'+esc(head)+'</button>'+(chipOpen?'<div class="pg-chip-body"><p>Suggested story steps. '+esc(x.name)+' is available whenever you want to try:</p><ul>'+list+'</ul><p class="pg-chip-note">No required catches, signposts, glints or repeated practice. Route restoration is a game reward, not a mastery score.</p></div>':'');}
  function paintChip(){let x=null;try{x=checklist();}catch(e){x=null;}const hud=D.querySelector('.aw-hud');
    if(!x||!hud){if(chip)chip.hidden=true;lastKey='';return;}
    if(!chip||!chip.isConnected){chip=D.getElementById('pgChip')||D.createElement('div');chip.id='pgChip';chip.className='pg-chip';chip.setAttribute('role','status');
      chip.addEventListener('click',e=>{if(!e.target.closest('.pg-chip-head'))return;e.stopPropagation();chipOpen=!chipOpen;lastKey='';paintChip();});}
    if(chip.parentNode!==hud)hud.appendChild(chip);
    const html=chipHTML(x);if(html!==lastKey){const hadFocus=chip.contains(D.activeElement);chip.innerHTML=html;lastKey=html;if(hadFocus)chip.querySelector('.pg-chip-head')?.focus({preventScroll:true});}chip.hidden=false;chip.classList.toggle('is-done',!!x.ck.restored);}

  function boot(){menuButton();if(FRESH)autoStart();else nudge();paintChip();setInterval(()=>{menuButton();paintChip();},1000);}
  if(D.readyState==='loading')D.addEventListener('DOMContentLoaded',boot);else boot();
  root.AtlasPlayGuide={version:1,start,stop:()=>stop(false),isOpen:()=>running,beats:BEATS.length,checklist,paintChip,fresh:FRESH};
})(typeof window!=='undefined'?window:globalThis);
