/* Mnemon navigation history (added 2026-10-08).
 * Every modal layer (panel, battle, drill, relearn, quiz, dialog) gets its own browser history
 * entry, so browser Back, the Android back button and the iPhone/iPad edge swipe close the
 * topmost layer first instead of leaving the game. A layer that refuses to close (a battle in
 * progress prevents 'cancel' and shows its own hint) keeps its entry, so nothing is lost.
 * At the bare world, Back asks once ("Back again to leave Mnemon") before leaving.
 * Refresh: the panel opened from the top bar is reopened after a reload in the same tab.
 * Additive only: it observes dialogs, it never changes how any of them open or close.
 * The slide lightbox (lightbox.js) manages its own history entry and is left alone.
 */
(function(root){
  'use strict';
  if(root.MnemonNav||!root.history||!root.document)return;
  const DOC=root.document,H=root.history;
  const OWN='dialog.lb,[data-own-history]';
  const RESTORE='ace_dat_realms_mnemon_v1_nav_restore_v1';
  let stack=[];          // open layers, oldest first, each with one history entry above 'root'
  let inflight=0;        // history.go() calls we made ourselves and whose popstate is still due
  let leaveArmed=0;      // time of the last "Back again to leave" hint
  let lastTopButton=null;

  const ss={get(k){try{return JSON.parse(root.sessionStorage.getItem(k)||'null');}catch(e){return null;}},
    set(k,v){try{root.sessionStorage.setItem(k,JSON.stringify(v));}catch(e){}},
    del(k){try{root.sessionStorage.removeItem(k);}catch(e){}}};
  const st=()=>{const s=H.state;return s&&typeof s==='object'?s:{};};
  // A layer entry never inherits the calm HUD's menu flag (hud-calm.js hcMenu), or Back lands on a stale menu entry.
  function push(tag){try{const s={...st()};delete s.hcMenu;H.pushState({...s,mnemonNav:tag},'');}catch(e){}}

  function openLayers(){return [...DOC.querySelectorAll('dialog[open]')].filter(d=>!d.matches(OWN));}

  // Bring the stack in line with what is open. New layers get an entry; layers closed by their own
  // buttons give theirs back (one history.go for all of them).
  function reconcile(){
    if(inflight)return;
    const cur=openLayers();
    const gone=stack.filter(d=>!cur.includes(d));
    if(gone.length){stack=stack.filter(d=>cur.includes(d));inflight++;try{H.go(-gone.length);}catch(e){inflight=0;}return;}
    // A new layer remembers the top-bar button only when that button was clicked just before it opened, so a sign or
    // trainer panel opened later never inherits an old button (10/23: a stale 'mapButton' reopened the semester world).
    for(const d of cur)if(!stack.includes(d)){stack.push(d);d._navBtn=lastTopButton&&Date.now()-lastTopAt<1500?lastTopButton:null;push('layer');}
    remember();
  }

  // Close the topmost layer the way Esc would, so each layer runs its own cleanup.
  function closeTop(){
    const d=stack[stack.length-1];if(!d)return false;
    if(!d.open||!d.isConnected){stack.pop();return true;}
    const ev=new Event('cancel',{cancelable:true});
    const allowed=d.dispatchEvent(ev);
    if(allowed&&d.open){try{d.close();}catch(e){}}
    // Some layers ignore 'cancel' and handle the Escape key themselves (a layer that asks before
    // leaving a timed run). Give them the same Escape a keyboard user would press.
    if(!allowed&&d.open&&d.isConnected){try{d.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',code:'Escape',bubbles:true,cancelable:true}));}catch(e){}}
    if(d.open&&d.isConnected){push('layer');return false;}   // refused (battle in progress): keep its entry
    stack.pop();return true;
  }

  function hint(msg){
    let el=DOC.getElementById('mnemonNavHint');
    if(!el){el=DOC.createElement('div');el.id='mnemonNavHint';el.className='mnemon-nav-hint';el.setAttribute('role','status');el.setAttribute('aria-live','polite');DOC.body.appendChild(el);}
    el.textContent=msg;el.classList.add('show');clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('show'),2600);
  }

  root.addEventListener('popstate',()=>{
    if(inflight){inflight--;if(!inflight)setTimeout(reconcile,0);return;}
    if(root.AtlasLightbox&&root.AtlasLightbox.isOpen&&root.AtlasLightbox.isOpen())return; // lightbox.js handles its own entry
    if(stack.length){closeTop();setTimeout(reconcile,0);return;}
    // At the bare world: the 'root' entry was just used up.
    if(st().mnemonNav==='base'){
      const now=Date.now();
      if(now-leaveArmed<3000){leaveArmed=0;try{H.back();}catch(e){}return;}
      leaveArmed=now;push('root');hint('Back again to leave Ace of Realms. Your progress is saved.');
    }
  });

  // Refresh restore: remember which top-bar button opened the current panel.
  // Written only when it changes (it ran on every DOM mutation). Only a panel the player opened from the top bar is
  // remembered; with nothing open at unload (a programmatic reload), nothing is reopened.
  let saved;
  function remember(){
    const top=stack[stack.length-1];
    const want=top&&top.id==='worldPanel'&&top._navBtn?top._navBtn:null;
    if(want===saved)return;saved=want;
    if(!want){ss.del(RESTORE);return;}
    ss.set(RESTORE,{btn:want,at:Date.now()});
  }
  let lastTopAt=0;
  DOC.addEventListener('click',e=>{
    const b=e.target&&e.target.closest&&e.target.closest('.world-navigation button[id],.gamebar button[id],#companionButton');
    if(b&&!b.closest('dialog')){lastTopButton=b.id;lastTopAt=Date.now();}
    else if(e.target&&e.target.closest&&e.target.closest('dialog'))return;
  },true);
  root.addEventListener('pagehide',()=>{try{if(!openLayers().length)root.sessionStorage.removeItem(RESTORE);}catch(e){}});

  function boot(){
    try{if(st().mnemonNav!=='root'){H.replaceState({...st(),mnemonNav:'base'},'');push('root');}}catch(e){}
    const r=ss.get(RESTORE);   // read before the first reconcile, which clears it when nothing is open yet
    // Perf (10/23): a layer opens, closes, arrives or leaves only through an open flip or an element added or removed.
    new MutationObserver(recs=>{if(recs.some(r=>r.type==='attributes'||[...r.addedNodes,...r.removedNodes].some(n=>n.nodeType===1)))reconcile();}).observe(DOC.body,{subtree:true,childList:true,attributes:true,attributeFilter:['open']});
    reconcile();
    if(r&&r.btn&&Date.now()-(+r.at||0)<6*3600e3){
      let tries=0;const t=setInterval(()=>{
        tries++;const b=DOC.getElementById(r.btn);
        const booted=DOC.getElementById('bootStatus')?DOC.getElementById('bootStatus').hidden:true;
        if(b&&booted&&!openLayers().length){clearInterval(t);lastTopButton=r.btn;try{b.click();}catch(e){}}
        else if(openLayers().length||tries>40)clearInterval(t);
      },250);
    }
  }
  if(DOC.readyState==='loading')DOC.addEventListener('DOMContentLoaded',boot);else boot();
  root.MnemonNav={back:()=>{try{H.back();}catch(e){}},depth:()=>stack.length,_closeTop:closeTop};
})(typeof window!=='undefined'?window:globalThis);
