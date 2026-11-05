/* This service worker belongs only to the DAT Ace of Realms copy in its scope.
 * No skipWaiting / clients.claim: an active adventure keeps its installed build.
 * A new build waits until the old controlled tabs close, then serves later loads.
 */
'use strict';
importScripts('./data/offline-assets.js');
const PREFIX='ace-dat-realms-mnemon-v1';
const manifest=self.ACE_DAT_OFFLINE_MANIFEST;
const scope=new URL(self.registration.scope);
if(manifest?.schema!==1||manifest.prefix!==PREFIX||!/^[a-f0-9]{64}$/.test(manifest.version)||!Array.isArray(manifest.assets)||!manifest.assets.length)throw new Error('Invalid DAT offline manifest');
const paths=new Set();
for(const a of manifest.assets){
  if(!a||typeof a.path!=='string'||!/^(?:index\.html|boot\.mjs|(?:engine|data|learning|worlds)\/[A-Za-z0-9_./-]+)$/.test(a.path)||a.path.includes('..')||a.path==='data/offline-assets.js'||!/^[a-f0-9]{64}$/.test(a.sha256)||paths.has(a.path))throw new Error('Invalid DAT offline asset');
  paths.add(a.path);
}
if(!paths.has('index.html')||!paths.has('boot.mjs'))throw new Error('Missing DAT entry point');
const assets=new Map(manifest.assets.map(a=>[new URL(a.path,scope).href,a]));
const markerURL=new URL('__ace_dat_offline_ready__',scope).href;
const catalogURL=new URL('__ace_dat_offline_versions__',scope).href;
const hex=buffer=>Array.from(new Uint8Array(buffer),b=>b.toString(16).padStart(2,'0')).join('');
const digest=bytes=>crypto.subtle.digest('SHA-256',bytes).then(hex);
const identity=digest(new TextEncoder().encode(scope.href)).then(scopeHash=>{
  const ownPrefix=PREFIX+'-'+scopeHash.slice(0,16)+'-';
  return {ownPrefix,name:ownPrefix+manifest.version,catalog:ownPrefix+'catalog'};
});

async function complete(cache){
  const marker=await cache.match(markerURL);
  if(!marker)return false;
  try{if((await marker.json()).version!==manifest.version)return false;}catch{return false;}
  for(const url of assets.keys())if(!await cache.match(url))return false;
  return true;
}
async function fetchVerified(url,asset){
  // Only manifest-listed same-origin URLs are ever requested. Never send credentials.
  if(!assets.has(url)||new URL(url).origin!==scope.origin)throw new Error('Outside DAT offline allowlist');
  const response=await fetch(new Request(url,{method:'GET',mode:'same-origin',credentials:'omit',redirect:'error',cache:'no-store'}));
  if(!response.ok||response.type==='opaque')throw new Error('Unavailable DAT asset: '+asset.path);
  const actual=await digest(await response.clone().arrayBuffer());
  if(actual!==asset.sha256)throw new Error('DAT asset changed after manifest generation: '+asset.path);
  return response;
}
async function install(){
  const {name}=await identity;
  const cache=await caches.open(name);
  if(await complete(cache))return;
  // A worker-code-only update can share the active asset revision. Repair
  // missing files in place without deleting the active build's surviving,
  // already verified bytes. A failed brand-new install can be discarded.
  let preserveExisting=false;
  for(const url of assets.keys())if(await cache.match(url)){preserveExisting=true;break;}
  try{
    const list=[...assets.entries()];let next=0;
    await Promise.all(Array.from({length:Math.min(6,list.length)},async()=>{
      while(next<list.length){const [url,asset]=list[next++];await cache.put(url,await fetchVerified(url,asset));}
    }));
    await cache.put(markerURL,new Response(JSON.stringify({version:manifest.version}),{headers:{'Content-Type':'application/json'}}));
  }catch(error){if(!preserveExisting)await caches.delete(name);throw error;}
}
self.addEventListener('install',event=>event.waitUntil(install()));

async function activate(){
  const {name,catalog,ownPrefix}=await identity;
  const cache=await caches.open(name);
  if(!await complete(cache))throw new Error('DAT offline installation is incomplete');
  // Maintain a ledger in this scope's own catalog. Never enumerate other apps'
  // cache names, and never delete a name merely because it looks unfamiliar.
  const ledger=await caches.open(catalog);let prior=[];
  try{const saved=await ledger.match(catalogURL);if(saved)prior=(await saved.json()).versions||[];}catch{}
  if(Array.isArray(prior))for(const old of prior){
    if(typeof old==='string'&&old!==name&&old.startsWith(ownPrefix)&&/^[a-f0-9]{64}$/.test(old.slice(ownPrefix.length)))await caches.delete(old);
  }
  await ledger.put(catalogURL,new Response(JSON.stringify({versions:[name]}),{headers:{'Content-Type':'application/json'}}));
}
self.addEventListener('activate',event=>event.waitUntil(activate()));

async function pinnedResponse(url){
  const {name}=await identity,cache=await caches.open(name),saved=await cache.match(url);
  if(saved)return saved;
  // Recover an evicted file only if the bytes still match this active version.
  // Never mix a new server build into a running old adventure.
  try{const response=await fetchVerified(url,assets.get(url));await cache.put(url,response.clone());return response;}
  catch{return new Response('This version is not available offline. Close the game tabs and reopen while online to update.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});}
}
self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET')return;
  const url=new URL(request.url);
  if(url.origin!==scope.origin)return;
  const entry=new URL('index.html',scope);
  if(request.mode==='navigate'&&(url.pathname===scope.pathname||url.pathname===entry.pathname)){
    event.respondWith(pinnedResponse(entry.href));return;
  }
  // Query parameters are not used by the app's static imports. Unknown requests,
  // including other applications and APIs, remain entirely outside this worker.
  if(url.search||url.hash||!assets.has(url.href))return;
  event.respondWith(pinnedResponse(url.href));
});
self.addEventListener('message',event=>{
  if(event.data?.type!=='ACE_DAT_OFFLINE_STATUS'||!event.ports?.[0])return;
  event.waitUntil((async()=>{
    const {name}=await identity;
    const ready=await complete(await caches.open(name));
    event.ports[0].postMessage({type:'ACE_DAT_OFFLINE_STATUS',ready,version:manifest.version,revision:manifest.version,assetCount:manifest.assets.length});
  })());
});
