/* Travel and Next step (window.AtlasTravel), forked lean from the Living Atlas free travel. Plain ASCII.
 *
 * Travel (the Travel button or T) goes to any town, route or landmark of the world you have reached. Fogged
 * "not yet charted" routes are listed but cannot be picked, and places behind a field move stay behind it.
 * Next step (the top-bar button or N) walks the world's own path in order: the world file supplies it as
 * AtlasRegion.COURSE_DEFS.<C>.path(), a list of steps {kind, zone, label, why, done()}. For Biology that is each
 * charted route in order until its warden is beaten, then the chapter gym, chapter by chapter, then the Summit
 * Trail, The Board and the legendary. After landing, the quest marker (AtlasRegion.setObjective) points at the
 * exact next trainer, station, signpost, glint, grunt, warden or gym door.
 * Adds no zones and never touches the zone list, so no save page moves.
 */
(function(root){
  'use strict';
  const DOC=root.document&&root.document.createElement?root.document:null;
  const R=()=>root.AtlasRegion,A=()=>root.AtlasApp;
  const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const course=()=>{const a=A();return (a&&a.course)||'BIO';};
  const def=()=>{const Rg=R();return (Rg&&Rg.COURSE_DEFS&&Rg.COURSE_DEFS[course()])||{};};
  const known=m=>{try{return R().hasMove(m);}catch(e){return false;}};
  function here(){try{const w=A()&&A().world&&A().world();const i=w&&w.zoneInfo?w.zoneInfo():null;return i&&i.region?i.region:'';}catch(e){return '';}}

  // ---------- Travel ----------
  // The world file lists its places: def().places() -> [{zone, name, sub, group, charted, needs, needsName, reached, status}].
  function places(){try{return typeof def().places==='function'?def().places():[];}catch(e){return [];}}
  function html(){const cur=here(),rows=places(),groups=[...new Set(rows.map(r=>r.group))];
    const nx=nextStep();
    return `<div class="ft-root"><p class="panel-intro">All six realms are open. Travel between their towns and opening routes. Press T for Travel and N for the next step.</p>
      ${nx&&nx.zone?`<button type="button" class="ft-row ft-next-row" id="ftNextRow"><strong>Next step, in order</strong><small>${esc(nx.label)}</small><small>${esc(nx.progress)}</small></button>`:''}
      ${groups.map(g=>`<div class="ft-chapter"><h4>${esc(g)}</h4><div class="ft-grid">${rows.filter(r=>r.group===g).map(r=>{const off=!r.charted||!r.reached||(r.needs&&!known(r.needs)),isHere=r.zone===cur;
        return `<button type="button" class="ft-row ${off?'is-off':''} ${isHere?'is-here':''}" data-ftgo="${esc(r.zone)}" ${off||isHere?'disabled':''}><strong>${esc(r.name)}</strong>${r.sub?`<small>${esc(r.sub)}</small>`:''}<em>${esc(isHere?'You are here':!r.charted?'Not yet charted':!r.reached?'Not reached yet':r.needs&&!known(r.needs)?'Needs '+(r.needsName||r.needs):r.status||'')}</em></button>`;}).join('')}</div></div>`).join('')}</div>`;}
  function open(){const a=A();if(!R()||!a||typeof a.panel!=='function')return false;a.panel('Travel',html(),true);const body=DOC&&DOC.getElementById('panelBody');if(!body)return true;
    body.querySelectorAll('[data-ftgo]').forEach(b=>b.addEventListener('click',()=>{if(!b.disabled)go(b.dataset.ftgo);}));
    const nx=DOC.getElementById('ftNextRow');if(nx)nx.onclick=()=>goNext();return true;}
  function close(){try{A()&&A().closePanel&&A().closePanel();}catch(e){}}
  function go(z,pos){const Rg=R(),a=A();if(!Rg||!a||!Rg.ZONES.includes(z))return false;
    const p=places().find(x=>x.zone===z);if(p&&p.needs&&!known(p.needs)){a.notice&&a.notice(p.name+' needs '+(p.needsName||p.needs)+'.');return false;}
    const ok=typeof a.travelZone==='function'?a.travelZone(z,pos||null):false;
    if(ok&&a.notice)a.notice('You travel to '+((Rg.INFO[z]||{}).name||z)+'.');return ok;}

  // ---------- Next step ----------
  function nextStep(){let steps=[];try{steps=typeof def().path==='function'?def().path():[];}catch(e){steps=[];}
    const routes=[...new Map(steps.filter(s=>s.routeId||s.kind==='route').map(s=>[s.routeId||s.zone,s])).values()],done=routes.filter(s=>{try{return s.routeRestored?s.routeRestored():s.done();}catch(e){return false;}}).length,progress=done+' of '+routes.length+' routes restored';
    const local=steps.filter(s=>s.zone===here());const ordered=local.length?[...local,...steps.filter(s=>s.zone!==here())]:steps;
    for(const s of ordered.filter(s=>!s.optional&&s.kind!=='grunt')){let d=false;try{d=!!s.done();}catch(e){d=false;}if(!d)return {...s,progress,done,total:routes.length};}
    return {kind:'done',zone:null,label:'This realm’s opening routes are restored. Rematches stay open.',why:'Visit another realm, explore a Canon lesson, or return for due practice. More DAT chapters remain in development.',progress,done,total:routes.length};}
  // After landing: point at the exact target (the next trainer, station, signpost, glint, grunt, the warden or gym).
  function pointAt(step){const Rg=R(),a=A();let w=null;try{w=a&&a.world&&a.world();}catch(e){}if(!w||!w.zoneObjects||!Rg)return '';const zi=w.zoneInfo?w.zoneInfo():{};if(zi.region!==step.zone)return '';
    const objs=w.zoneObjects(),kind=o=>o.action==='custom'?String(o.handler||'').split(':').pop():o.action;let target=null,left='';
    if(step.target){const o=objs.find(x=>x.id===step.target||String(x.handler||'')===step.target);if(o)target={x:o.x,y:o.y,label:step.targetLabel||step.label};}
    else if(step.kind==='route'&&Rg.wardenChecklist){const ck=Rg.wardenChecklist(objs,{C:course(),n:step.session,zoneId:zi.id,seen:id=>{try{return w.isDiscovered(id);}catch(e){return false;}},known});
      const order=['trainer','puzzle','grunt','sign','item'];const todo=(ck.todo||[]).slice().sort((x,y)=>order.indexOf(x.kind)-order.indexOf(y.kind));
      const tr=todo.filter(x=>x.kind==='trainer').length,pz=todo.filter(x=>x.kind==='puzzle').length,parts=[];if(tr)parts.push(tr+' trainer'+(tr>1?'s':''));if(pz)parts.push('the station');if(todo.some(x=>x.kind==='grunt'))parts.push('the grunt');
      const sg=todo.filter(x=>x.kind==='sign').length,gl=todo.filter(x=>x.kind==='item').length;if(sg)parts.push(sg+' signpost'+(sg>1?'s':''));if(gl)parts.push(gl+' glint'+(gl>1?'s':''));
      if(todo.length)target={x:todo[0].x,y:todo[0].y,label:todo[0].label};else{const wd=objs.find(o=>kind(o)==='warden');if(wd)target={x:wd.x,y:wd.y,label:'Challenge the warden'};}
      left=(parts.length?parts.join(', ')+' and the warden left':'only the warden left')+'.';}
    else if(step.target){const o=objs.find(x=>x.id===step.target||String(x.handler||'')===step.target);if(o)target={x:o.x,y:o.y,label:step.targetLabel||step.label};}
    if(target&&Rg.setObjective)Rg.setObjective(step.zone,Math.floor(target.x),Math.floor(target.y),target.label);
    if(target&&w.walkToNearest)w.walkToNearest([target]);
    return left;}
  function goNext(){const step=nextStep(),a=A();if(!step)return false;if(!step.zone){if(a&&a.notice)a.notice(step.label+' '+step.why);return false;}
    // Native dialog close dispatches after close() returns. Start walking after
    // the app's close listener has resumed the world and cleared held input.
    const panel=DOC&&DOC.getElementById('worldPanel'),waiting=!!panel?.open;
    const proceed=()=>{const left=pointAt(step);if(a&&a.notice)a.notice('Next step: '+step.label+(left?' '+left[0].toUpperCase()+left.slice(1):'')+' '+step.progress+'.');if(typeof step.open==='function'){try{step.open();}catch(e){}}};
    if(waiting)panel.addEventListener('close',proceed,{once:true});
    const ok=here()===step.zone?(close(),true):go(step.zone);
    if(!ok){if(waiting)panel.removeEventListener('close',proceed);return false;}
    if(!waiting)proceed();return true;}

  function nextHTML(){const s=nextStep();
    return `<div class="ft-root ft-next"><p class="eyebrow">NEXT STEP | IN ORDER</p><p class="ft-next-line">${esc(s.label)}</p><p class="panel-note">${esc(s.why||'')} ${esc(s.progress)}.</p>
      <div class="backup-actions">${s.zone?'<button type="button" class="primary" id="ftNextGo">Go there</button>':''}<button type="button" class="secondary" id="ftOpenTravel">Travel anywhere instead</button></div>
      <p class="panel-note">Next step guides you through this realm’s lessons, trainers and chapter Warden. Travel is always available; visiting a lesson is story progress, not learning credit.</p></div>`;}
  function openNext(){const a=A();if(!R()||!a||typeof a.panel!=='function')return false;a.panel('Next step',nextHTML());const g=DOC.getElementById('ftNextGo');if(g){g.onclick=()=>goNext();try{g.focus();}catch(e){}}const ot=DOC.getElementById('ftOpenTravel');if(ot)ot.onclick=open;return true;}
  function refreshNextTitle(){const b=DOC&&DOC.getElementById('nextStepButton');if(!b)return;try{const s=nextStep();if(s)b.title=s.label+' '+s.progress+' (N)';}catch(e){}}

  // ---------- wiring: menu buttons and keys ----------
  function install(){if(!DOC||install.done)return;install.done=true;
    const addButtons=()=>{const nav=DOC.querySelector('.world-navigation');if(!nav)return;
      if(!DOC.getElementById('travelButton')){const b=DOC.createElement('button');b.id='travelButton';b.type='button';b.className='quest-nav';b.textContent='Travel';b.title='Travel to any place you have reached (T)';b.addEventListener('click',open);nav.insertBefore(b,nav.firstChild);}
      if(!DOC.getElementById('nextStepButton')){const n=DOC.createElement('button');n.id='nextStepButton';n.type='button';n.className='quest-nav ft-next-btn';n.textContent='Next step';n.title='Go to your next step, in order (N)';n.addEventListener('click',openNext);nav.insertBefore(n,nav.firstChild);n.addEventListener('mouseenter',refreshNextTitle);n.addEventListener('focus',refreshNextTitle);}};
    if(DOC.readyState==='loading')DOC.addEventListener('DOMContentLoaded',addButtons);else addButtons();
    root.addEventListener('keydown',e=>{const k=e.key;if(k!=='t'&&k!=='T'&&k!=='n'&&k!=='N')return;if(e.metaKey||e.ctrlKey||e.altKey||e.repeat)return;const t=e.target;
      if(t&&(t.isContentEditable||/INPUT|TEXTAREA|SELECT/.test(t.tagName||'')))return;if(DOC.querySelector('dialog[open]'))return;
      const host=DOC.getElementById('adventureCanvas');if(!host||host.getClientRects().length===0||DOC.body.classList.contains('mn-title-on'))return;
      if((k==='n'||k==='N')?openNext():open())e.preventDefault();});}
  install();
  root.AtlasTravel={version:3,open,close,go,nextStep,goNext,openNext,pointAt,places};
})(typeof window!=='undefined'?window:globalThis);
