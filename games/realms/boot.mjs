// This copy loads only its own DAT content and game code. There is no network service.
const scripts = [
  'engine/option-order.js','engine/lightbox.js','engine/dat-services.js',
  'engine/world.js','engine/bestiary.js','engine/creature-lines.js','engine/battle-moves.js','engine/battle-fx.js',
  'engine/course-packs.js','engine/srs.js','engine/save-contract.js','engine/music.js','engine/adventure-state.js',
  'engine/adventure-world.js','engine/exam-quest.js','engine/post-question.js','engine/atlas-region.js',
  'engine/shop.js','worlds/realm-art.js','worlds/realms.js','engine/team-collection.js',
  'engine/adventure-app.js','engine/nav-history.js','engine/free-travel.js','engine/hud-calm.js','engine/play-guide.js'
];
const status=document.querySelector('#bootStatus');
function load(src){return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.async=false;s.onload=resolve;s.onerror=()=>reject(new Error(`Could not load ${src}`));document.head.append(s);});}
try{
await import('./data/curriculum-runtime.mjs');
  await import('./learning/discovery.mjs');
  await import('./learning/guide.mjs');
  await import('./learning/return-review.mjs');
  await import('./learning/return-ui.mjs');
  await import('./learning/mastery-gates.mjs');
  await import('./learning/campaign-ui.mjs');
  await (await import('./worlds/rendered-companions.mjs')).ready;
  await (await import('./worlds/rendered-environment.mjs')).ready;
  for(const src of scripts)await load(src);
  document.querySelector('.world-brand').addEventListener('click',event=>{event.preventDefault();window.AtlasApp?.travelZone('realm-crossroads');});
  window.AceDATOffline={ready:false};
  if('serviceWorker' in navigator){
    navigator.serviceWorker.register('./sw.js',{scope:'./',updateViaCache:'none'})
      .then(()=>navigator.serviceWorker.ready)
      .then(registration=>{
        const channel=new MessageChannel();
        const timeout=setTimeout(()=>channel.port1.close(),5000);
        channel.port1.onmessage=event=>{
          clearTimeout(timeout);channel.port1.close();
          if(event.data?.ready===true){
            window.AceDATOffline={ready:true,controlled:!!navigator.serviceWorker.controller,revision:event.data.revision||null};
            const label=document.querySelector('#offlineStatus');if(label)label.textContent=window.AceDATOffline.controlled?'Offline ready on this browser.':'Offline files saved. Reload once to enable offline play in this tab.';
          }
        };
        registration.active?.postMessage({type:'ACE_DAT_OFFLINE_STATUS'},[channel.port2]);
      }).catch(()=>{window.AceDATOffline={ready:false};});
  }
}catch(error){
  status.hidden=false;status.textContent='A game file could not be loaded. Your saved adventure has not been replaced. Reload to try again.';
  console.error(error);
}
