/* Mnemon app shell (window.AtlasApp), forked lean from the Living Atlas adventure app.
 * It owns the starter choice, the world save, the panels, and the glue
 * between the walking world (adventure-world.js), the world file's actions (AtlasRegion.ACTIONS) and the battle
 * engine (exam-quest.js). Everything course specific lives in the world file and the course pack.
 * Plain ASCII.
 */
(function(){
  'use strict';
  const $=id=>document.getElementById(id),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const B=window.AtlasBestiary,S=window.AtlasAdventureState,RG=()=>window.AtlasRegion;
  let COURSE=(window.MNEMON_COURSE||'BIO');
  const BOOT=$('bootStatus');
  if(!B||!S||!window.AtlasAdventure||!window.AtlasQuest||!RG()){if(BOOT)BOOT.textContent='Some game files did not finish loading. Reload this page to try again.';return;}
  const loaded=S.load(localStorage);let state=loaded.state,blocked=!!loaded.blocked,world=null,saveTimer=0,regionNotice='';
  const PZ=s=>{try{return window.AtlasTrainer?window.AtlasTrainer.personalize(s):s;}catch(e){return s;}};

  // ---------- small helpers ----------
  function notice(t){t=PZ(String(t||''));const n=$('worldNotice');if(!n)return;n.textContent=t;n.hidden=false;clearTimeout(notice.timer);notice.timer=setTimeout(()=>{n.hidden=true;},6500);}
  function save(immediate=false){clearTimeout(saveTimer);const write=()=>{if(blocked)return;try{state.revision++;S.save(localStorage,state);const sl=$('saveLabel');if(sl&&sl.textContent!=='Saved')sl.textContent='Saved';try{window.dispatchEvent(new CustomEvent('ace-dat-realms:saved'));}catch(_){}}catch(e){const sl=$('saveLabel');if(sl)sl.textContent='Export a backup';notice('Progress could not be saved. Open Settings to export a backup.');}};if(immediate)write();else saveTimer=setTimeout(write,400);}
  function member(id=state.partner){return state.creatures.find(x=>x.id===id)||{id:'cytrus',xp:0};}
  function portrait(canvas,id,xp=0){canvas.width=canvas.width||240;canvas.height=canvas.height||180;const ctx=canvas.getContext('2d');ctx.clearRect(0,0,canvas.width,canvas.height);B.draw(ctx,id,canvas.width/2,canvas.height/2+canvas.height*.08,Number(canvas.dataset.scale)||canvas.width/60,B.level(xp)>=6);}
  function portraits(root){(root||document).querySelectorAll('canvas[data-creature]').forEach(c=>portrait(c,c.dataset.creature,Number(c.dataset.xp)||0));}
  function regionOf(){const q=RG().readQuest(),c=(q.courses&&q.courses[COURSE])||{},r=c.region||{};return {coins:Math.max(0,Math.floor(+q.coins||0)),bag:q.bag||{},badges:r.badges||{},pages:r.pages||{}};}
  function badgeCount(){const b=regionOf().badges;return Object.keys(b).filter(k=>!/At$/.test(k)&&b[k]).length;}
  function header(){const m=member();const pn=$('partnerName'),pl=$('partnerLevel');if(pn)pn.textContent=state.partner?B.name(m):'Choose a partner';if(pl)pl.textContent=state.partner?'Lv. '+B.level(m.xp):'Your adventure begins';
    const pc=$('partnerPortrait');if(pc&&state.partner){pc.width=96;pc.height=72;portrait(pc,m.id,m.xp);}
    const bc=$('badgeCount');if(bc){const n=badgeCount();bc.textContent=n+' badge'+(n===1?'':'s');}
    const cc=$('coinCount');if(cc)cc.textContent=regionOf().coins+' coins';}
  function pause(){world?.setPaused(true);}
  function unpause(){if(!$('worldPanel').open&&!document.querySelector('dialog.exam-quest[open]')&&!document.querySelector('dialog.fx-exam[open]'))world?.setPaused(false);}
  function panel(title,html,wide=false){window.AtlasPlayGuide?.stop?.();window.AceDATLearning?.closeActive?.();const d=$('worldPanel');$('panelTitle').textContent=PZ(title);$('panelBody').innerHTML=PZ(html);d.classList.toggle('panel-wide',!!wide);pause();if(!d.open)d.showModal();portraits($('panelBody'));$('panelBody').scrollTop=0;}
  function closePanel(){const d=$('worldPanel');if(d.open)d.close();}
  function award(key,amount=4,creatureId=state.partner){if(state.rewards.includes(key))return false;state.rewards.push(key);if(state.rewards.length>4000)state.rewards.splice(0,state.rewards.length-4000);state.xp+=amount;const m=state.creatures.find(c=>c.id===creatureId)||state.creatures.find(c=>c.id===state.partner);if(m){const before=B.level(m.xp);m.xp+=amount;const evo=B.levelEvolution?B.levelEvolution(m.id,before,B.level(m.xp)):null;if(evo)notice(evo.from+' evolved into '+evo.to+'!');}save();header();return true;}
  function acquireCompanion(id){
    if(blocked)return false;
    const T=window.AtlasTeamCollection,allowed=T?T.canAcquire(state,id,B):!state.creatures.some(c=>c.id===id)&&B.species.some(x=>x.id===id);
    if(!allowed)return false;
    state.creatures.push({id,xp:0});if(state.party.length<6)state.party.push(id);save(true);notice(B.find(id).name+(state.party.includes(id)?' joined your team!':' went to your Reserve.'));return true;
  }

  // ---------- the battle engine ----------
  const regionAfter=new Map();function after(spec,fn){if(spec&&spec.id)regionAfter.set(spec.id,fn);}
  function questSpec(make){try{return make();}catch(e){return null;}}
  function zoneInfo(){try{return world?.zoneInfo?.()||{};}catch(e){return {};}}
  function openQuest(start){closePanel();if(!state.starter){chooseStarter();return;}pause();
    if(start&&typeof start==='object'&&window.AtlasCourses.resolve(start.course)){COURSE=start.course;if(window.AtlasApp)window.AtlasApp.course=COURSE;}
    const pass=start==='center'?'center':start&&typeof start==='object'?start:undefined;
    const h=window.AtlasQuest.open({course:COURSE,start:pass,zone:zoneInfo().region||'',getPartner:()=>member(),getParty:()=>[state.partner,...state.party.filter(id=>id!==state.partner)].filter(Boolean).map(id=>member(id)),
      onXP:(key,amount,cid)=>{if(amount>0)award(key,amount,cid&&state.creatures.some(c=>c.id===cid)?cid:state.partner);},onCatch:acquireCompanion,
      onSpecial:r=>{const fn=regionAfter.get(r.id);if(fn){regionAfter.delete(r.id);try{fn(r);}catch(_){}}},
      onClose:()=>{header();unpause();try{world.refresh();}catch(_){}if(regionNotice){notice(regionNotice);regionNotice='';}zoneMusic();paintDue();if(typeof start?.onReturn==='function')start.onReturn();}});
    if(!h)unpause();
  }

  // ---------- region interactions ----------
  function showSign(e){panel(e.title||'Signpost',`<p class="panel-intro sign-text">${esc(e.text||'')}</p><div class="backup-actions"><button class="primary" id="signDone">Keep exploring</button></div>`);const b=$('signDone');if(b)b.onclick=closePanel;}
  function travel(id){if(!world)return false;try{closePanel();}catch(_){}const ok=world.travelToRegion(id);header();save(true);zoneMusic();return ok;}
  function regionApi(){return {openQuest,notice,panel,closePanel,showSign,travel,questSpec,after,esc,refresh:()=>{try{world.refresh();}catch(_){}},zone:zoneInfo,state:()=>state,save:()=>save(true),header,portraits,acquire:acquireCompanion,openReview:course=>openQuest({course,grove:true}),openReturnReview:()=>window.AceDATReturnUI?.open(regionApi()),setNotice:t=>{regionNotice=t;}};}
  // A route's warden waits for the whole route (AtlasRegion.wardenChecklist).
  function wardenGate(e){const R=RG();if(!R?.wardenChecklist||!world?.zoneObjects)return true;
    const objs=world.zoneObjects(),zi=zoneInfo(),n=+(e.session||zi.session)||0;
    const ck=R.wardenChecklist(objs,{C:COURSE,n,zoneId:zi.id,seen:id=>world.isDiscovered(id),known:m=>R.hasMove(m)});
    if(ck.ready)return true;
    panel((e.name||'The warden')+' waits',`<p class="eyebrow">ROUTE ${n} | ROUTE CHECKLIST</p><p class="panel-intro">"Finish this route first. Then I will test you." To face the warden:</p><ul class="warden-check">${ck.items.map(x=>`<li class="${x.done?'done':'open'}"><strong>${x.done?'Done':'Open'}</strong> ${esc(x.label)}</li>`).join('')}</ul><div class="backup-actions">${(ck.todo||[]).length&&world?.walkToNearest?'<button class="primary" id="wardenWalk">Walk to the nearest open one</button>':''}<button class="secondary" id="wardenLater">Keep exploring</button></div><p class="panel-note">Signposts count once you read them; glints once you pick them up. The grunt appears only while this route holds open misses.</p>`);
    $('wardenLater').onclick=closePanel;const wb=$('wardenWalk');if(wb)wb.onclick=()=>{closePanel();setTimeout(()=>{let p=null;try{p=world.walkToNearest(ck.todo);}catch(_){p=null;}const hit=p&&ck.todo.find(x=>x.x===p.x&&x.y===p.y);notice(hit?'Walking to the nearest open one: '+hit.label+'.':'No open spot can be walked to from here.');},150);};
    return false;}
  function handleRegion(e){
    const n=+e.session||0;
    if(e.handler!=='realms:warden'&&(e.action==='warden'||(e.action==='custom'&&/:warden$/.test(e.handler||'')))&&!wardenGate(e))return;
    if(e.action==='custom'){const fn=RG()?.ACTIONS?.[e.handler];if(fn){try{fn(e,regionApi());}catch(err){try{console.warn(err);}catch(_){}notice('That spot could not open. Try again.');}}return;}
    if(e.action==='wild'){if(!n)return;let only=null;try{only=RG()?.COURSE_DEFS?.[COURSE]?.wildOnly?.(e.region,n);}catch(_){only=null;}openQuest({wild:n,course:COURSE,...(Array.isArray(only)&&only.length?{only}:{})});return;}
    if(e.action==='water'){openQuest({water:{region:e.region||''},course:COURSE});return;}
    if(e.action==='item'){const coins=Math.max(1,Math.floor(+e.coins||5));RG().updateQuest(q=>{q.coins=(Math.floor(+q.coins||0))+coins;});header();notice('You found '+coins+' coins!');return;}
    if(e.action==='sign')return showSign(e);
  }
  function interact(e){if(window.AtlasCourses.resolve(e.courseId)){COURSE=e.courseId;window.AtlasApp.course=COURSE;}if(e.kind==='region'){handleRegion(e);return;}if(e.kind==='npc'){showSign({title:e.name,text:e.text});return;}}

  // ---------- starter and trainer name ----------
  const STARTER_TEXT={cytrus:'Living type. Steady and sturdy: it keeps its inside calm and shrugs off the hits you take.',atpup:'Energy type. Bright and energetic: it brings a strong first move. Take the time you need to think.',twistle:'Spatial type. Curious and careful: it reads the pattern before it pounces.'};
  function chooseStarter(){
    panel('Your first companion',`<p class="panel-intro">Six DAT realms have creatures to catch, wardens to meet and places to restore. Choose a friend to walk beside you and battle with you.</p>
      <p class="name-row">Your trainer: <strong>Realm Explorer</strong></p>
      <div class="starter-choices">${S.STARTERS.map(id=>`<button type="button" data-starter="${id}"><canvas data-creature="${id}" data-scale="3" width="84" height="84" aria-hidden="true"></canvas><h3>${esc(B.find(id).name)}</h3><p>${esc(STARTER_TEXT[id]||B.find(id).description)}</p></button>`).join('')}</div>`,true);
    $('panelBody').querySelectorAll('[data-starter]').forEach(b=>b.onclick=()=>{const id=b.dataset.starter;const nm=String(($('trainerName')||{}).value||'').replace(/[^A-Za-z0-9 .'-]/g,'').trim().slice(0,16);
      if(blocked){notice('This save is protected. Export it in Settings to preserve it before importing a valid DAT backup.');return;}
      state.trainer='Realm Explorer';state.starter=id;state.partner=id;if(!state.creatures.some(c=>c.id===id))state.creatures.push({id,xp:0});if(!state.party.includes(id))state.party.unshift(id);
      save(true);world?.setPartner(id);closePanel();header();notice(B.find(id).name+' is your partner. Time to get in the lab.');
      try{window.dispatchEvent(new CustomEvent('ace-dat-realms:starter',{detail:{id}}));}catch(_){}});
  }

  // ---------- panels ----------
  function showTeam(){const T=window.AtlasTeamCollection;
    if(T?.mount){panel('Team','<div id="teamCollectionHost"></div>',true);T.mount($('teamCollectionHost'),{getState:()=>state,bestiary:B,courses:(window.AceDATRealms||[]).map(r=>({id:r.course,name:r.title})),onPortraits:portraits,onDex:()=>window.AceDATLearning?.library(regionApi()),onNotice:notice,onChange:next=>{state.party=next.party;state.partner=next.partner;world?.setPartner(state.partner);save();header();}});return;}
    panel('Team',`<div class="team-grid">${state.creatures.map(c=>`<div class="team-card"><canvas data-creature="${esc(c.id)}" data-xp="${c.xp}" width="140" height="110"></canvas><h3>${esc(B.name(c))}</h3><small>Lv. ${B.level(c.xp)}</small></div>`).join('')}</div>`,true);}
  function showBag(){const r=regionOf(),bag=r.bag,row=(k,n)=>`<li><strong>${esc(n)}</strong> <span>${Math.max(0,Math.floor(+bag[k]||0))}</span></li>`;
    const moves=window.AtlasFieldMoves?window.AtlasFieldMoves.list():[];
    panel('Bag',`<p class="panel-intro">Coins come from glints, trainers and wardens. They are adventure rewards, separate from your learning evidence.</p><ul class="bag-list"><li><strong>Coins</strong> <span>${r.coins}</span></li>${row('potion','Potions')}${row('revive','Revives')}${row('greatCapsule','Great Capsules')}</ul>${moves.length?`<h3 class="section-title">Field moves</h3><ul class="bag-list">${moves.map(m=>`<li class="${m.known?'on':''}"><strong>${esc(m.name)}</strong> <span>${m.known?'Known':'Not yet'}</span><small>${esc(m.note)}</small></li>`).join('')}</ul>`:''}`);}
  function showHelp(){panel('How to play',`<ul class="help-list"><li><b>Walk</b> with the arrow keys, W A S D, the pad, or tap a path. Press A, Space or Enter beside a person or a sign.</li><li><b>Tall grass</b> on a route hides wild creatures. Answer its questions right to wear it down and catch it. Mistakes prompt an explanation. Your collection and learning history stay yours.</li><li><b>Unsure?</b> Tap Unsure before you answer a guess. A right guess still comes back soon; a sure miss is the one to fix first.</li><li><b>After every answer</b> you see the visual, the answer and its tell, and the trap you fell for. Build this concept opens an offline guide and available model. In practice, One more like this queues a different practice case.</li><li><b>Each route</b> has two trainers, signposts, glints and a station to solve. Its warden samples the chapter skills; this is not a complete DAT subject check.</li><li><b>Each town</b> has a Recall Center and a Field Lab. All six realms are open to visit. Rest heals game HP; it never awards learning evidence.</li><li><b>Next step</b> always shows the next thing to do, in order. Due practice returns through Review Grove. The learning journal keeps help, fresh checks and later recall separate.</li></ul>`);}
  function exportSave(){save(true);const keys=['ace_dat_realms_mnemon_v1_world_v1','ace_dat_realms_mnemon_v1_quest_v1','ace_dat_realms_mnemon_v1_srs_v1','ace_dat_realms_mnemon_v1_gym_v1','ace_dat_realms_mnemon_v1_discovery_v1','ace_dat_realms_mnemon_v1_concept_sessions_v1'],out={exported:new Date().toISOString(),game:'ace-dat-realms-mnemon-v1'};for(const k of keys){try{out[k]=JSON.parse(localStorage.getItem(k)||'null');if(out[k]&&(/_quest_v1$|_gym_v1$/.test(k)))out[k]={...out[k],namespace:'ace-dat-realms-mnemon-v1',version:1};}catch(_){out[k]=null;}}
    const blob=new Blob([JSON.stringify(out)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='ace-of-realms-mnemon-save.json';document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},500);}
  function importFailure(message){panel('Backup not imported',`<p class="panel-intro" role="alert">${esc(message)}</p><div class="backup-actions"><button id="returnImportSettings" class="primary">Back to settings</button></div>`);$('returnImportSettings').onclick=showSettings;}
  function importSave(file){
    if(file.size>15000000){importFailure('This backup is too large. Your saved adventure was kept.');return;}
    const fr=new FileReader();
    fr.onerror=()=>importFailure('This backup file could not be read. Your saved adventure was kept.');
    fr.onload=()=>{try{
      const d=JSON.parse(fr.result),check=window.AceDATSave?.validateBundle?.(d);
      if(check?.valid!==true)throw Error('invalid');
      panel('Import this adventure?',`<p class="panel-intro">This will replace this DAT adventure on this browser. Export your current save first if you want to keep both.</p><div class="backup-actions"><button id="backupBeforeImport" class="secondary">Export current save</button><button id="useImport" class="primary">Use this DAT backup</button><button id="cancelImport" class="secondary">Cancel</button></div>`);
      $('backupBeforeImport').onclick=exportSave;$('cancelImport').onclick=closePanel;
      $('useImport').onclick=()=>{
        const keys=['ace_dat_realms_mnemon_v1_world_v1','ace_dat_realms_mnemon_v1_quest_v1','ace_dat_realms_mnemon_v1_srs_v1','ace_dat_realms_mnemon_v1_gym_v1','ace_dat_realms_mnemon_v1_discovery_v1','ace_dat_realms_mnemon_v1_concept_sessions_v1'];
        let previous;
        try{previous=Object.fromEntries(keys.map(k=>[k,localStorage.getItem(k)]));}
        catch(_){importFailure('Your current save could not be read. No backup data was written.');return;}
        const replacement=Object.fromEntries(keys.map(k=>[k,d[k]==null?null:JSON.stringify(d[k])])),wasBlocked=blocked;
        blocked=true;
        try{
          for(const k of keys)replacement[k]===null?localStorage.removeItem(k):localStorage.setItem(k,replacement[k]);
          if(keys.some(k=>localStorage.getItem(k)!==replacement[k]))throw Error('readback');
        }catch(_){
          for(const k of keys)try{previous[k]===null?localStorage.removeItem(k):localStorage.setItem(k,previous[k]);}catch(_){}
          let restored=false;try{restored=keys.every(k=>localStorage.getItem(k)===previous[k]);}catch(_){}
          blocked=restored?wasBlocked:true;
          importFailure(restored?'Import could not finish. Your previous save was restored.':'Import could not finish, and storage could not restore every previous save slot. Keep your backup file. Adventure saving is paused; try importing it again when storage is available.');return;
        }
        location.reload();
      };
    }catch(_){importFailure('That file is not a valid backup from this DAT adventure. Your save was kept.');}};
    fr.readAsText(file);
  }
  function showSettings(){const on=window.AtlasMusic?window.AtlasMusic.isEnabled():true;
    panel('Adventure settings',`<div class="settings-rows"><label><input type="checkbox" id="setReduced" ${state.settings.reducedMotion?'checked':''}> Reduce motion</label><label><input type="checkbox" id="setSound" ${on?'checked':''}> Sound and music</label></div><h3 class="section-title">Your DAT adventure</h3><p class="panel-note">Saved only on this device in this game's own space. No account or cloud sync is connected.</p><p class="panel-note" id="offlineStatus">${window.AceDATOffline?.ready?(window.AceDATOffline.controlled?'Offline ready on this browser.':'Offline files saved. Reload once to enable offline play in this tab.'):'Offline files are not ready yet. Keep this local server available while the first load finishes.'}</p><div class="backup-actions"><button class="secondary" id="setExport">Export a backup</button><button class="secondary" id="setImport">Import a backup</button></div><p class="panel-note">Adventure XP, badges and forms are game rewards. The learning journal records actual help, responses and time away. This opening build does not cover the whole DAT or predict a score.</p>`);
    $('setReduced').onchange=e=>{state.settings.reducedMotion=!!e.target.checked;world?.setReducedMotion(state.settings.reducedMotion);window.AceDATRenderedArt?.setReducedMotion(state.settings.reducedMotion);save();};
    $('setSound').onchange=e=>{try{window.AtlasMusic?.setEnabled(!!e.target.checked);}catch(_){}paintSound();};
    $('setExport').onclick=exportSave;$('setImport').onclick=()=>$('worldImportFile').click();}

  // ---------- music, review due ----------
  function zoneMusic(){try{window.AtlasMusic?.play(zoneInfo().music||'route');}catch(_){}}
  function paintDue(){const rb=$('reviewButton'),R=window.AtlasSRS;if(!rb||!R)return;let n=0;try{const ids=new Set(window.AtlasQuest.coursePool(COURSE).map(x=>x.id));n=R.dueList(null,id=>ids.has(id)).length;}catch(_){n=0;}rb.textContent=n+' due';rb.classList.toggle('has-due',n>0);rb.title=n?n+' review cards due. Tap to review.':'No review cards due right now.';}
  function paintSound(){const sb=$('soundButton');if(!sb)return;const on=window.AtlasMusic?window.AtlasMusic.isEnabled():true;sb.textContent='Sound '+(on?'on':'off');sb.setAttribute('aria-pressed',on?'true':'false');}

  // ---------- wiring ----------
  $('closeWorldPanel').onclick=closePanel;
  $('worldPanel').addEventListener('close',()=>{window.AceDATLearning?.closeActive?.();unpause();});
  $('worldImportFile').addEventListener('change',e=>{const f=e.target.files&&e.target.files[0];if(f)importSave(f);e.target.value='';});
  const on=(id,fn)=>{const el=$(id);if(el)el.onclick=fn;};
  on('questButton',()=>openQuest({course:COURSE}));
  on('teamButton',showTeam);on('bagButton',showBag);on('howToPlayButton',showHelp);on('settingsButton',showSettings);
  on('atlasMapButton',()=>{const fn=RG()?.ACTIONS?.['realms:atlas'];if(fn)fn({kind:'region',action:'custom',handler:'realms:atlas'},regionApi());});
  on('reviewButton',()=>openQuest({course:COURSE,grove:true}));on('reviewGroveButton',()=>window.AceDATReturnUI?.open(regionApi()));
  on('soundButton',()=>{try{window.AtlasMusic?.toggle();}catch(_){}paintSound();});
  on('companionButton',showTeam);
  on('canonButton',()=>window.AceDATLearning?.library(regionApi()));on('journalButton',()=>window.AceDATLearning?.journal(regionApi()));on('topicButton',()=>window.AceDATLearning?.coverage(regionApi()));
  window.addEventListener('ace-dat-realms:srs',paintDue);setInterval(paintDue,60000);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)save(true);});
  window.addEventListener('storage',e=>{if(e.key===S.KEY){blocked=true;notice('This world changed in another tab. Reload before continuing to save.');}});

  window.AtlasApp=Object.assign(window.AtlasApp||{},{panel,closePanel,notice,openQuest:start=>openQuest(start),world:()=>world,save:()=>save(true),exportSave,showSettings,showTeam,header,
    state:()=>state,course:COURSE,regionApi,
    travelZone:(id,pos)=>{const R=RG();if(!world||!R||!R.ZONES.includes(id))return false;if(!state.starter){chooseStarter();return false;}try{closePanel();}catch(_){}
      if(pos&&Number.isFinite(+pos.x)&&Number.isFinite(+pos.y))world.setState({kind:'course',courseId:COURSE,region:id,x:+pos.x,y:+pos.y,facing:pos.facing||'down'});else world.travelToRegion(id);
      header();save(true);zoneMusic();return true;}});

  // ---------- start: the world mounts behind the title screen ----------
  let lastZone=state.world?.zoneId||null;
  function startWorld(){
    if(world)return;
    window.AceDATRenderedArt?.setReducedMotion(state.settings.reducedMotion);
    world=window.AtlasAdventure.create($('adventureCanvas'),{course:COURSE,partner:state.partner||'cytrus',initialState:state.world,reducedMotion:state.settings.reducedMotion,
      drawCreature:(ctx,id,x,y,scale)=>B.draw(ctx,id,x,y,scale,B.level(member(id).xp)>=6),onInteract:interact,
      onStateChange:s=>{const entered=s.zoneId!==lastZone;lastZone=s.zoneId;state.world=s;if(window.AtlasCourses.resolve(s.courseId)){COURSE=s.courseId;if(window.AtlasApp)window.AtlasApp.course=COURSE;}if(entered){zoneMusic();try{window.dispatchEvent(new CustomEvent('ace-dat-realms:zone',{detail:{zone:s.region}}));}catch(_){}}save();}});
    if(BOOT)BOOT.hidden=true;header();paintDue();paintSound();
    if(loaded.error)notice(loaded.error);
    if(!state.starter)chooseStarter();
  }
  window.AtlasApp.startWorld=startWorld;
  window.AtlasApp.hasSave=()=>!!state.starter;
  window.AtlasApp.blockedSave=()=>blocked;
  // The title screen (index.html) calls startWorld; a direct start (no title screen) mounts at once.
  if(!$('titleScreen'))startWorld();
  try{window.dispatchEvent(new CustomEvent('ace-dat-realms:app-ready'));}catch(_){}
})();
