import {conceptEntry} from './concept-entry.mjs';
export const CONCEPT_SESSION_KEY='ace_dat_realms_mnemon_v1_concept_sessions_v1';
const namespace='ace-dat-realms-mnemon-v1',plain=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
const fields=(value,allowed)=>plain(value)&&Object.keys(value).every(k=>allowed.includes(k));
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const clone=value=>JSON.parse(JSON.stringify(value));
const identity=(activityId,objectiveId)=>activityId+'|'+objectiveId;
// Forward commitment phases are navigation metadata, not answer metadata. A Back,
// reset, or case change must not reserve an uncommitted response as the first one.
const committedPhases=Object.freeze({choose:['predict'],build:['converted'],predict:['observe','observed','reveal','explain'],reason:['explained'],atoms:['explained']});
const position=s=>[s.caseIndex??0,s.variant??0,s.cursor??(Number.isInteger(s.stage)?s.stage:s.caseIndex===undefined?s.step??0:0)];
function responseKey(previous,next){
 const phase=previous.phase||previous.stage;
 const phaseCommit=committedPhases[phase]?.includes(next.phase||next.stage)&&same(position(previous),position(next));
 const construction=(next.commits?.length||0)>(previous.commits?.length||0);
 if(!phaseCommit&&!construction)return null;
 return [...position(previous),typeof phase==='string'?phase:'construction'].join(':');
}
function committedSnapshot(response){
 const parts=response.key.split(':'),phase=parts.pop();
 return same(parts,position(response.state).map(String))&&(phase==='construction'?(response.state.commits?.length||0)>0:committedPhases[phase]?.includes(response.state.phase||response.state.stage)===true);
}
export function createConceptSessionStore(activities,storage){
 const byId=new Map(activities.map(a=>[a.id,a])),maximum=activities.reduce((n,a)=>n+a.objectiveIds.length,0);
 const empty=()=>({namespace,version:1,sessions:[]});
 function valid(value){
  if(!fields(value,['namespace','version','sessions'])||value.namespace!==namespace||value.version!==1||!Array.isArray(value.sessions)||value.sessions.length>maximum)return false;
  const seen=new Set();
  return value.sessions.every(row=>{
   if(!fields(row,['activityId','objectiveId','activityVersion','entryVersion','state','completed','firstResponses']))return false;
   const activity=byId.get(row.activityId),key=identity(row.activityId,row.objectiveId),entry=activity&&conceptEntry(activity,row.objectiveId);
   if(!entry||seen.has(key)||row.activityVersion!==activity.version||row.entryVersion!==entry.version||typeof row.completed!=='boolean'||!plain(row.state)||!Array.isArray(row.firstResponses)||row.firstResponses.length>128)return false;
   seen.add(key);const responseIds=new Set();
   try{return same(activity.normalize(row.state),row.state)&&row.firstResponses.every(response=>{
    if(!fields(response,['key','state'])||typeof response.key!=='string'||!/^[0-9]+:[0-9]+:[0-9]+:[a-z-]+$/.test(response.key)||responseIds.has(response.key)||!plain(response.state))return false;
    responseIds.add(response.key);return same(activity.normalize(response.state),response.state)&&committedSnapshot(response);
   });}catch{return false;}
  });
 }
 function read(){try{const raw=storage.getItem(CONCEPT_SESSION_KEY);if(raw===null)return {ok:true,value:empty()};const value=JSON.parse(raw);return valid(value)?{ok:true,value}:{ok:false,value:null,reason:'invalid'};}catch{return {ok:false,value:null,reason:'storage'};}}
 function state(activityId,objectiveId){
  const result=read(),activity=byId.get(activityId),entry=activity&&conceptEntry(activity,objectiveId);
  if(!result.ok||!entry)return {ok:false,exists:false,state:null,completed:false};
  const row=result.value.sessions.find(r=>r.activityId===activityId&&r.objectiveId===objectiveId);
  return {ok:true,exists:!!row,state:clone(row?.state||entry.state),completed:row?.completed===true,firstResponses:clone(row?.firstResponses||[])};
 }
 function write(activityId,objectiveId,next,{completed=false,restart=false}={}){
  const result=read(),activity=byId.get(activityId),entry=activity&&conceptEntry(activity,objectiveId);
  if(!result.ok||!entry)return false;
  try{
   const previous=result.value.sessions.find(r=>r.activityId===activityId&&r.objectiveId===objectiveId),normalized=activity.normalize(next),firstResponses=clone(previous?.firstResponses||[]),key=responseKey(previous?.state||entry.state,normalized);
   if(key&&!firstResponses.some(r=>r.key===key))firstResponses.push({key,state:clone(normalized)});
   const row={activityId,objectiveId,activityVersion:activity.version,entryVersion:entry.version,state:normalized,completed:!restart&&previous?.completed===true||completed===true,firstResponses};
   const value={...result.value,sessions:[...result.value.sessions.filter(r=>r.activityId!==activityId||r.objectiveId!==objectiveId),row]};
   if(!valid(value))return false;
   const raw=JSON.stringify(value);storage.setItem(CONCEPT_SESSION_KEY,raw);return storage.getItem(CONCEPT_SESSION_KEY)===raw;
  }catch{return false;}
 }
 return Object.freeze({read,state,write,valid,key:CONCEPT_SESSION_KEY});
}
