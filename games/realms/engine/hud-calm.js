/* Calm HUD (window.AtlasHudCalm), forked from the Living Atlas. Plain ASCII.
 *
 * Brief (10/22): too much was on screen at once on a phone; make the game calm, seamless and easy to play. The
 * map is the hero. Every feature stays, regrouped and folded away:
 *
 *   Top bar     one slim row: the MNEMON mark, Next step (the one primary action, N), the due badge, Menu.
 *   Menu        a sheet (bottom sheet on a phone, side sheet on a wide screen), closed on load, opened only by a
 *               tap. Sections Play, Study, You, Settings (and More for any button a later script adds). Escape,
 *               the browser Back gesture, the scrim and Close all shut it. Picking an item closes it first, so
 *               only one panel is ever open. Badges and save state sit at its top on a
 *               phone; a wide screen keeps them in the top bar.
 *   Map         the zone card folds to a one-line chip after 3 seconds (tap to open it again; the weather line
 *               lives in the open card). The north compass merges
 *               into one corner button that opens on tap. The trainer and partner card is a small avatar chip.
 *               The minimap is off on a phone until you switch it on (corner button or Settings); a wide screen
 *               keeps the existing minimap setting. The controls hint shows for the first few moves and in the
 *               tutorial, and again from Settings. A smaller d-pad and A button sit in the two thumb zones. Run is
 *               a Settings toggle or a long press on the middle of the d-pad.
 *   Flow        first-run popups come one at a time (trainer maker, then the companion chooser, then the story
 *               choice), toasts share one lane under the zone chip.
 *
 * How: the original buttons are MOVED, never cloned, so every handler, label refresh and keyboard shortcut
 * (T, N, B, M and the rest) keeps working. The world menu (nav.world-navigation) moves into the sheet whole, so
 * scripts that insert their buttons beside a sibling still find it; CSS order sorts the buttons into sections.
 * Adds no zones and touches no save; its own preferences live in localStorage ace_dat_realms_mnemon_v1_hud_calm_v1 (per device).
 * Loaded after every other script (index.html). API: open(), close(), isOpen(), apply(), prefs(), setPref(k, v).
 */
(function(root){
  'use strict';
  const D=root.document;
  if(!D||!D.body||root.AtlasHudCalm)return;
  if(!D.body.classList.contains('world-app'))return;
  const KEY='ace_dat_realms_mnemon_v1_hud_calm_v1';
  const PHONE=root.matchMedia?root.matchMedia('(max-width: 760px)'):{matches:false,addEventListener(){}};
  const $=id=>D.getElementById(id);
  const HINT_MOVES=12;

  // Perf (10/23): read once and kept in memory (the minimap check runs every frame on a phone); another tab's change
  // clears the copy.
  let PREFS=null;
  function prefs(){if(PREFS)return PREFS;try{const p=JSON.parse(root.localStorage.getItem(KEY)||'{}');PREFS=p&&typeof p==='object'?p:{};}catch(e){PREFS={};}return PREFS;}
  function setPref(k,v){const p=prefs();p[k]=v;try{root.localStorage.setItem(KEY,JSON.stringify(p));}catch(e){}return p;}
  try{root.addEventListener('storage',e=>{if(!e||e.key===KEY||e.key===null)PREFS=null;});}catch(e){}

  // Section order. Ids not listed land in More. Ids starting hc are this file's own rows.
  const GROUPS=[
    ['play','Play',['travelButton','atlasMapButton','questButton','bagButton']],
    ['study','Study',['canonButton','journalButton','topicButton','reviewGroveButton']],
    ['you','You',['teamButton','howToPlayButton']],
    ['settings','Settings',['soundButton','hcRun','hcMini','hcHint','settingsButton']]
  ];
  const ORDER={};GROUPS.forEach((g,gi)=>g[2].forEach((id,i)=>{ORDER[id]=(gi+1)*100+i+1;}));

  let sheet=null,panel=null,statusSlot=null,menuBtn=null,cluster=null,corner=null,pop=null,lane=null;
  let openState=false,afterClose=null,closeTimer=0,collapseTimer=0,lastPlace='',moves=0,applying=false;

  // ---------- helpers ----------
  function el(tag,cls,html){const e=D.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e;}
  // Perf (10/23): classList.add and textContent= write the DOM even when nothing changes, and every write wakes the
  // body-wide MutationObservers of five other modules. apply() now only writes what actually differs.
  function addC(e,c){if(e&&!e.classList.contains(c))e.classList.add(c);}
  function course(){return root.AtlasApp?.course||'BIO';}
  function api(){return root.AtlasApp||{};}
  function anyDialogOpen(){return [...D.querySelectorAll('dialog[open]')].some(d=>d.getClientRects().length);}

  // ---------- the menu sheet ----------
  function buildSheet(){
    if(sheet&&sheet.isConnected)return;
    sheet=el('div','hc-sheet');sheet.id='hcSheet';sheet.hidden=true;
    sheet.setAttribute('role','dialog');sheet.setAttribute('aria-modal','true');sheet.setAttribute('aria-labelledby','hcSheetTitle');
    sheet.innerHTML='<div class="hc-scrim" data-hc-close></div><div class="hc-panel"><div class="hc-grab" aria-hidden="true"></div>'+
      '<div class="hc-head"><h2 id="hcSheetTitle">Menu</h2><button type="button" class="hc-x" data-hc-close>Close</button></div>'+
      '<div class="hc-status-slot"></div></div>';
    D.body.appendChild(sheet);
    panel=sheet.querySelector('.hc-panel');statusSlot=sheet.querySelector('.hc-status-slot');
    sheet.addEventListener('click',e=>{if(e.target.closest('[data-hc-close]')){e.preventDefault();close();}});
    // Picking a menu item: close the sheet first (and give back its history entry), then run the item, so the
    // panel it opens is the only layer and Back closes that panel next.
    panel.addEventListener('click',e=>{
      const b=e.target.closest('button');if(!b||!openState||b.closest('.hc-head'))return;
      if(b.hasAttribute('data-hc-stay')||b.closest('[data-hc-stay]'))return;
      if(b._hcReplay){b._hcReplay=false;return;}
      e.preventDefault();e.stopImmediatePropagation();
      close(()=>{b._hcReplay=true;b.click();});
    },true);
  }

  function addOwnRows(nav){
    const row=(id,label,fn,stay)=>{let b=$(id);if(!b){b=el('button','hc-row');b.id=id;b.type='button';b.addEventListener('click',fn);if(stay)b.setAttribute('data-hc-stay','');nav.appendChild(b);}if(label&&b.textContent!==label)b.textContent=label;return b;};
    row('hcRun','',()=>{const r=D.querySelector('.aw-run');if(r)r.click();setTimeout(paintRows,0);},true);
    row('hcMini','',()=>{if(PHONE.matches)setPref('miniPhone',!prefs().miniPhone);else{const R=root.AtlasRegion;if(R&&R.setMinimap)R.setMinimap(!R.minimapOn());}paintRows();},true);
    row('hcHint','',()=>{setPref('hint',hintOn()?'off':'on');paintHint();paintRows();},true);
  }
  function paintRows(){
    const set=(id,t,on)=>{const b=$(id);if(!b)return;if(b.textContent!==t)b.textContent=t;if(on!=null)b.setAttribute('aria-pressed',on?'true':'false');};
    const r=D.querySelector('.aw-run');if(r){const on=r.getAttribute('aria-pressed')==='true'||/on/i.test(r.textContent);set('hcRun','Run: '+(on?'on':'off'),on);}else{const b=$('hcRun');if(b)b.hidden=true;}
    set('hcMini','Minimap: '+(miniOn()?'on':'off'),miniOn());
    set('hcHint','Controls hint: '+(hintOn()?'on':'off'),hintOn());
  }

  function placeMenu(){
    buildSheet();
    const nav=D.querySelector('nav.world-navigation');
    if(nav&&nav.parentNode!==panel)panel.appendChild(nav);
    if(nav){
      addC(nav,'hc-nav');
      // Sound and Settings join the Settings section; Next step becomes the top-bar primary.
      for(const id of ['soundButton','settingsButton']){const b=$(id);if(b&&b.parentNode!==nav)nav.appendChild(b);}
      addOwnRows(nav);
      // Section headings, then every button sorted by CSS order.
      GROUPS.forEach((g,gi)=>{let h=nav.querySelector('.hc-sec[data-g="'+g[0]+'"]');if(!h){h=el('div','hc-sec');h.dataset.g=g[0];h.textContent=g[1];h.setAttribute('role','heading');h.setAttribute('aria-level','3');nav.appendChild(h);}h.style.order=String((gi+1)*100);});
      let more=nav.querySelector('.hc-sec[data-g="more"]');if(!more){more=el('div','hc-sec');more.dataset.g='more';more.textContent='More';more.setAttribute('role','heading');more.setAttribute('aria-level','3');nav.appendChild(more);}more.style.order='900';
      let extra=0;
      [...nav.children].forEach(b=>{if(b.classList.contains('hc-sec'))return;const o=ORDER[b.id];if(o)b.style.order=String(o);else{b.style.order='901';if(!b.hidden&&b.getClientRects)extra++;}});
      if(more.hidden!==!extra)more.hidden=!extra;
    }
    // Top bar: brand mark, Next step, due badge, Menu.
    const actions=D.querySelector('.gamebar-actions');
    if(actions){
      const next=$('nextStepButton');if(next&&next.parentNode!==actions){actions.insertBefore(next,actions.firstChild);next.classList.add('hc-primary');next.style.order='';}
      const due=$('reviewButton');if(due&&next&&due.previousElementSibling!==next&&due.parentNode===actions)actions.insertBefore(due,next.nextSibling);
      if(!menuBtn||!menuBtn.isConnected){menuBtn=$('hcMenuButton')||el('button','hc-menu-btn');menuBtn.id='hcMenuButton';menuBtn.type='button';menuBtn.textContent='Menu';menuBtn.setAttribute('aria-haspopup','dialog');menuBtn.setAttribute('aria-controls','hcSheet');menuBtn.setAttribute('aria-expanded','false');menuBtn.onclick=()=>openState?close():open();}
      if(menuBtn.parentNode!==actions||actions.lastElementChild!==menuBtn)actions.appendChild(menuBtn);
    }
    // Status (badges, save): in the sheet on a phone, in the top bar on a wide screen.
    const status=D.querySelector('.gamebar-status');const bar=D.querySelector('.gamebar');
    if(status&&bar){
      if(PHONE.matches){if(status.parentNode!==statusSlot)statusSlot.appendChild(status);}
      else if(status.parentNode!==bar){bar.insertBefore(status,actions||null);}
    }
  }

  function open(){
    placeMenu();if(openState)return;
    // One layer at a time: the menu never opens over a panel, and a panel opening closes the menu.
    if(anyDialogOpen())return;
    openState=true;paintRows();sheet.hidden=false;
    requestAnimationFrame(()=>sheet.classList.add('is-open'));
    D.body.classList.add('hc-menu-open');menuBtn&&menuBtn.setAttribute('aria-expanded','true');
    // Reuse a stale menu entry instead of stacking another on top of it.
    {const hs=root.history.state||{};if(!hs.hcMenu)try{root.history.pushState(Object.assign({},hs,{hcMenu:1}),'');}catch(e){}}
    const first=panel.querySelector('.hc-x');setTimeout(()=>{try{first&&first.focus({preventScroll:true});}catch(e){}},30);
  }
  function hide(){
    if(!openState)return;openState=false;sheet.classList.remove('is-open');sheet.hidden=true;
    D.body.classList.remove('hc-menu-open');if(menuBtn){menuBtn.setAttribute('aria-expanded','false');}
  }
  function close(after){
    if(!openState){if(after)after();return;}
    const st=root.history.state;
    if(st&&st.hcMenu){
      afterClose=after||null;hide();
      try{root.history.back();}catch(e){}
      clearTimeout(closeTimer);closeTimer=setTimeout(()=>{const f=afterClose;afterClose=null;if(f)f();},450);
    }else{hide();if(after)after();else if(menuBtn)try{menuBtn.focus({preventScroll:true});}catch(e){}}
  }
  root.addEventListener('popstate',()=>{
    const st=root.history.state;
    // Landed on a stale menu entry (the menu is shut and nothing is open): step over it so Back is never dead.
    if(!openState&&st&&st.hcMenu&&!anyDialogOpen()){try{root.history.back();}catch(e){}return;}
    if(openState&&!(st&&st.hcMenu)){hide();if(menuBtn)try{menuBtn.focus({preventScroll:true});}catch(e){}}
    if(afterClose&&!(st&&st.hcMenu)){clearTimeout(closeTimer);const f=afterClose;afterClose=null;setTimeout(f,0);}
  });
  D.addEventListener('keydown',e=>{if(e.key==='Escape'&&openState){e.preventDefault();e.stopPropagation();close();}},true);

  // ---------- map overlays ----------
  function placeName(){const n=D.querySelector('.aw-place-name');return n?n.textContent.trim():'';}
  function chipText(){
    const name=placeName().replace(/\s*\|\s*/g,' - ');
    const nx=D.querySelector('.aw-next');let next=nx&&!nx.hidden?nx.textContent.trim():'';
    next=next.replace(/^Next:\s*(Beat|Talk to|Visit|Find|Walk to|Restore)\s+/i,'Next: ');
    return next?name+'  -  '+next:name;
  }
  function paintChip(){
    const place=D.querySelector('.aw-place');if(!place)return;
    let chip=place.querySelector('.hc-chip');if(!chip){chip=el('span','hc-chip');chip.setAttribute('aria-hidden','true');place.insertBefore(chip,place.firstChild);}
    const t=chipText();if(chip.textContent!==t)chip.textContent=t;
    const name=placeName();
    if(name&&name!==lastPlace){lastPlace=name;expandCard(3000);}
  }
  function expandCard(ms){
    const hud=D.querySelector('.aw-hud');if(!hud)return;hud.classList.remove('hc-collapsed');
    clearTimeout(collapseTimer);const fold=()=>{if(anyDialogOpen()){collapseTimer=setTimeout(fold,1000);return;}hud.classList.add('hc-collapsed');};collapseTimer=setTimeout(fold,ms||3000);
    const place=hud.querySelector('.aw-place');if(place)place.setAttribute('aria-expanded','true');
  }
  // The toast lane sits just under the zone card, open or folded, so a notice never covers it.
  function laneTop(){const hud=D.querySelector('.aw-hud');if(!hud)return;const r=hud.getBoundingClientRect();let bottom=r.top;for(const c of hud.children){const cr=c.getBoundingClientRect();if(cr.height&&cr.bottom>bottom)bottom=cr.bottom;}
    const cl=$('hcCluster');if(cl){const cr=cl.getBoundingClientRect();if(cr.height&&cr.bottom>bottom)bottom=cr.bottom;}
    const top=Math.round(Math.max(bottom,r.top)+8);D.body.style.setProperty('--hc-toast-top',top+'px');
    // The story-scene line is a popover (top layer, left in place); the lane starts under it while it shows.
    const cs=D.querySelector('.cs-toast');let lt=top;if(cs&&cs.getClientRects().length){const cr=cs.getBoundingClientRect();if(cr.height)lt=Math.round(cr.bottom+8);}
    D.body.style.setProperty('--hc-lane-top',lt+'px');}
  function wireCard(){
    const hud=D.querySelector('.aw-hud');const place=hud&&hud.querySelector('.aw-place');if(!place||place._hc)return;place._hc=true;
    place.setAttribute('role','button');place.setAttribute('tabindex','0');place.setAttribute('aria-label','Where you are. Tap for details.');
    const toggle=()=>{if(hud.classList.contains('hc-collapsed'))expandCard(6000);else{clearTimeout(collapseTimer);hud.classList.add('hc-collapsed');}};
    place.addEventListener('click',e=>{e.stopPropagation();toggle();});
    place.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();toggle();}});
    new MutationObserver(paintChip).observe(place,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['hidden']});
    if(root.ResizeObserver){const ro=new ResizeObserver(laneTop);ro.observe(hud);ro.observe(place);}
    paintChip();laneTop();
  }

  function miniOn(){if(PHONE.matches)return !!prefs().miniPhone;const R=root.AtlasRegion;return R&&R.minimapOn?!!R.minimapOn():true;}
  // The minimap is drawn on the canvas by AtlasRegion.drawHUD from its own setting. On a phone, unless switched on
  // here, it is drawn without the minimap (the next-objective arrow stays). The stored setting is never changed.
  function wrapMinimap(){
    const R=root.AtlasRegion;if(!R||!R.drawHUD||R.drawHUD._hc)return;
    const orig=R.drawHUD,SP=root.Storage&&root.Storage.prototype;
    const wrapped=function(ctx,f){
      if(!PHONE.matches||prefs().miniPhone||!SP)return orig.apply(this,arguments);
      // Perf (10/23): AtlasRegion.setMinimapForce hides it for this one draw without swapping Storage.prototype.getItem
      // every frame (that swap invalidated every getItem call site in the game 60 times a second).
      if(typeof R.setMinimapForce==='function'){R.setMinimapForce(false);try{return orig.apply(this,arguments);}finally{R.setMinimapForce(null);}}
      const get=SP.getItem;SP.getItem=function(k){return k==='ace_dat_realms_mnemon_v1_minimap_v1'?'0':get.call(this,k);};
      try{return orig.apply(this,arguments);}finally{SP.getItem=get;}
    };
    wrapped._hc=true;R.drawHUD=wrapped;
  }

  function buildCluster(host){
    if(cluster&&cluster.isConnected&&cluster.parentNode===host)return;
    cluster=$('hcCluster')||el('div','hc-cluster');cluster.id='hcCluster';host.appendChild(cluster);
    if(!corner){
      corner=el('div','hc-corner');
      corner.innerHTML='<button type="button" class="hc-corner-btn" aria-expanded="false" aria-controls="hcCornerPop" aria-label="Compass"><span class="hc-n">N</span><span class="hc-arrow" aria-hidden="true"></span><span class="hc-dot" aria-hidden="true"></span></button>'+
        '<div class="hc-corner-pop" id="hcCornerPop" hidden><div class="hc-pop-head"><b>Compass</b><span>North is up. The gold arrow points to your next step.</span></div><div class="hc-pop-slot"></div>'+
        '<button type="button" class="hc-pop-mini" data-hc-stay></button></div>';
      pop=corner.querySelector('.hc-corner-pop');
      const btn=corner.querySelector('.hc-corner-btn');
      btn.addEventListener('click',e=>{e.stopPropagation();setPop(pop.hidden);});
      corner.querySelector('.hc-pop-mini').addEventListener('click',e=>{e.stopPropagation();const b=$('hcMini');if(b)b.click();else{setPref('miniPhone',!prefs().miniPhone);}paintPop();});
      D.addEventListener('pointerdown',e=>{if(pop&&!pop.hidden&&!corner.contains(e.target)){setPop(false);if(e.target&&e.target.id==='adventureCanvas'){e.preventDefault();e.stopPropagation();}}},true);
      D.addEventListener('keydown',e=>{if(e.key==='Escape'&&pop&&!pop.hidden){setPop(false);}});
    }
    if(corner.parentNode!==cluster)cluster.appendChild(corner);
  }
  function setPop(on){if(!pop)return;pop.hidden=!on;corner.classList.toggle('is-open',!!on);corner.querySelector('.hc-corner-btn').setAttribute('aria-expanded',on?'true':'false');if(on)paintPop();}
  function paintPop(){if(!pop)return;const b=pop.querySelector('.hc-pop-mini');b.textContent='Minimap: '+(miniOn()?'on':'off');}
  function placeOverlays(){
    const host=$('overworldHost');if(!host)return;addC(host,'hc-host');
    buildCluster(host);
    const comp=$('companionButton');if(comp&&comp.parentNode!==cluster)cluster.insertBefore(comp,corner);
    if(comp)addC(comp,'hc-avatar');
    const slot=pop.querySelector('.hc-pop-slot');
    const rc=host.querySelector('.rc-compass')||D.querySelector('.rc-compass');if(rc&&rc.parentNode!==slot)slot.appendChild(rc);
    const raid=D.querySelector('section.mr-banner');if(raid&&raid.parentNode!==slot)slot.appendChild(raid);
    corner.classList.toggle('has-raid',!!(raid&&!raid.hidden));
    const hud=host.querySelector('.aw-hud');
    const comm=$('commissionButton');if(hud&&comm&&comm.parentNode!==hud)hud.appendChild(comm);
    wireCard();
    // Long press on the middle of the d-pad toggles Run.
    const mid=host.querySelector('.aw-pad-center');
    if(mid&&!mid._hc){mid._hc=true;mid.setAttribute('title','Hold to switch Run on or off');let t=0;
      mid.addEventListener('pointerdown',e=>{e.preventDefault();clearTimeout(t);t=setTimeout(()=>{const r=host.querySelector('.aw-run');if(r){r.click();mid.classList.add('hc-pulse');setTimeout(()=>mid.classList.remove('hc-pulse'),400);}},450);});
      for(const ev of ['pointerup','pointerleave','pointercancel'])mid.addEventListener(ev,()=>clearTimeout(t));}
    paintHint();
  }

  // ---------- hint line ----------
  function hintOn(){const p=prefs();if(p.hint==='on')return true;if(p.hint==='off')return false;if(/tutorial/i.test(placeName()))return true;return (+p.moves||0)<HINT_MOVES;}
  function paintHint(){D.body.classList.toggle('hc-hint-off',!hintOn());}
  function countMove(){
    const p=prefs();if(p.hint||((+p.moves||0)>=HINT_MOVES))return;
    moves++;if(moves%3===0||moves>=HINT_MOVES){setPref('moves',(+p.moves||0)+3);paintHint();}
  }
  root.addEventListener('keydown',e=>{if(/^(Arrow(Up|Down|Left|Right)|[wasdWASD])$/.test(e.key)&&!(e.target&&e.target.closest&&e.target.closest('input,textarea,select,dialog,[contenteditable]')))countMove();});
  D.addEventListener('pointerdown',e=>{if(e.target&&e.target.closest&&(e.target.closest('.aw-dpad button')||e.target.id==='adventureCanvas'))countMove();},true);

  // ---------- toast lane and first-run order ----------
  function placeLane(){
    if(!lane||!lane.isConnected){lane=$('hcLane')||el('div','hc-lane');lane.id='hcLane';lane.setAttribute('aria-live','polite');D.body.appendChild(lane);}
    for(const t of [$('worldNotice'),$('frPrompt')]){if(t&&t.parentNode!==lane)lane.appendChild(t);}
    lane.classList.toggle('has-ask',!!D.querySelector('.cs-toast'));
    const fr=$('frPrompt'),wn=$('worldNotice');if(fr&&wn&&fr.previousElementSibling!==wn&&wn.parentNode===lane)lane.insertBefore(wn,fr);
  }
  function sequenceDialogs(){
    const open=[...D.querySelectorAll('dialog[open]')];
    const maker=open.find(d=>d.classList.contains('tc-dialog'));
    for(const d of open){d.classList.toggle('hc-deferred',!!maker&&d!==maker&&!d.contains(maker));}
    D.querySelectorAll('dialog.hc-deferred:not([open])').forEach(d=>d.classList.remove('hc-deferred'));
    const modal=open.some(d=>!d.classList.contains('hc-deferred'));
    D.body.classList.toggle('hc-modal',modal);
    if(modal&&openState)hide();
    if(modal&&pop&&!pop.hidden)setPop(false);
  }
  function notice(t){try{api().notice&&api().notice(t);}catch(e){}}

  // ---------- apply ----------
  function apply(){
    if(applying)return;applying=true;
    try{addC(D.body,'hc-calm');placeMenu();placeOverlays();placeLane();laneTop();sequenceDialogs();wrapMinimap();addC(D.body,'hc-ready');}
    catch(e){try{console.warn('hud-calm',e);}catch(_){}}
    finally{applying=false;}
  }
  let raf=0;const soon=()=>{if(raf)return;raf=requestAnimationFrame(()=>{raf=0;apply();});};
  new MutationObserver(soon).observe(D.body,{childList:true});
  // Dialog open/close and late-added HUD pieces (subtree, but only structural changes).
  // Perf (10/23): both observers are scoped by their callbacks. A dialog's open always counts; hidden counts only on the
  // menu's buttons and the raid banner (the commission button's hidden flips on every step); in the map host only an
  // element added or removed at the host or its direct children counts (not the nearby-object text that changes as you walk).
  const elems=l=>{for(const n of l)if(n.nodeType===1)return true;return false;};
  new MutationObserver(recs=>{for(const r of recs){if(r.attributeName==='open'||(r.target&&r.target.closest&&r.target.closest('nav.world-navigation,section.mr-banner'))){soon();return;}}}).observe(D.body,{subtree:true,attributes:true,attributeFilter:['open','hidden']});
  const hostObs=()=>{const h=$('overworldHost');if(h&&!h._hcObs){h._hcObs=true;new MutationObserver(recs=>{for(const r of recs){if((r.target===h||r.target.parentNode===h)&&(elems(r.addedNodes)||elems(r.removedNodes))){soon();return;}}}).observe(h,{childList:true,subtree:true});}};
  const navObs=()=>{const n=D.querySelector('nav.world-navigation');if(n&&!n._hcObs){n._hcObs=true;new MutationObserver(soon).observe(n,{childList:true});}};
  if(PHONE.addEventListener)PHONE.addEventListener('change',()=>{apply();paintRows();});
  function boot(){apply();hostObs();navObs();let n=0;const t=setInterval(()=>{apply();hostObs();navObs();if(++n>20)clearInterval(t);},500);}
  if(D.readyState==='loading')D.addEventListener('DOMContentLoaded',boot);else boot();

  root.AtlasHudCalm={version:1,open,close,isOpen:()=>openState,apply,prefs,setPref,expandCard,_chipText:chipText};
})(typeof window!=='undefined'?window:globalThis);
