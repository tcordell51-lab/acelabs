export const DISCOVERY_KEY='ace_dat_realms_mnemon_v1_discovery_v1';
const plain=x=>x&&typeof x==='object'&&!Array.isArray(x);
export function createDiscoveryStore(activities,storage){
 const byId=new Map(activities.map(a=>[a.id,a]));
 const empty=()=>({namespace:'ace-dat-realms-mnemon-v1',version:1,activities:{}});
 function valid(value){if(!plain(value)||value.namespace!=='ace-dat-realms-mnemon-v1'||value.version!==1||!plain(value.activities)||Object.keys(value).some(k=>!['namespace','version','activities'].includes(k)))return false;return Object.entries(value.activities).every(([id,row])=>{const a=byId.get(id);if(!a||!plain(row)||row.version!==a.version||!plain(row.state)||Object.keys(row).some(k=>!['version','state','completed'].includes(k))||typeof row.completed!=='boolean')return false;try{return JSON.stringify(a.normalize(row.state))===JSON.stringify(row.state);}catch{return false;}});}
 function read(){try{const raw=storage.getItem(DISCOVERY_KEY);if(raw===null)return {ok:true,value:empty()};const value=JSON.parse(raw);return valid(value)?{ok:true,value}:{ok:false,value:null,reason:'invalid'};}catch{return {ok:false,value:null,reason:'storage'};}}
 function state(id){const a=byId.get(id),saved=read();return {ok:saved.ok,state:a?.normalize(saved.value?.activities[id]?.state||a.initial()),completed:saved.value?.activities[id]?.completed===true};}
 function write(id,state){const a=byId.get(id),saved=read();if(!a||!saved.ok)return false;const normalized=a.normalize(state),value={...saved.value,activities:{...saved.value.activities,[id]:{version:a.version,state:normalized,completed:saved.value.activities[id]?.completed===true||!!a.view(normalized).complete}}};try{const raw=JSON.stringify(value);storage.setItem(DISCOVERY_KEY,raw);return storage.getItem(DISCOVERY_KEY)===raw;}catch{return false;}}
 return Object.freeze({read,state,write,valid,completed:id=>read().value?.activities[id]?.completed===true});
}
