/* The world save (window.AtlasAdventureState), forked lean from the Living Atlas save validator.
 * One key, ace_dat_realms_mnemon_v1_world_v1: the starter, the team and party, the player's place in the world, settings and
 * items. Battle progress, pages and badges live in the quest store (ace_dat_realms_mnemon_v1_quest_v1), never here.
 * A save that fails validation is never overwritten: the original stays in storage and the game starts fresh.
 * Only the six DAT subjects and the loaded DAT companion registry are accepted. No migration or legacy-key reads.
 * Plain ASCII. */
(function(root){
  'use strict';
  const KEY='ace_dat_realms_mnemon_v1_world_v1';
  const NAMESPACE='ace-dat-realms-mnemon-v1';
  const STARTERS=Object.freeze(['cytrus','atpup','twistle']);
  const COURSES=Object.freeze(['BIO','GCHEM','OCHEM','PAT','RC','QR']);
  const object=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
  const integer=(x,max=1000000000)=>Number.isSafeInteger(x)&&x>=0&&x<=max;
  const string=(x,max=500)=>typeof x==='string'&&x.length<=max;
  const identifier=x=>string(x,500)&&x.length>0&&!['__proto__','constructor','prototype'].includes(x);
  const timestamp=x=>string(x,24)&&x.length===24&&Number.isFinite(Date.parse(x))&&new Date(x).toISOString()===x;
  const unique=a=>new Set(a).size===a.length;
  const array=(x,test,max=50000)=>Array.isArray(x)&&x.length<=max&&x.every(test);
  const fields=(o,allowed)=>object(o)&&Object.keys(o).every(k=>allowed.includes(k));
  const safeTree=(v,depth=0)=>depth<=20&&(!v||typeof v!=='object'||Object.entries(v).every(([k,x])=>!['__proto__','constructor','prototype'].includes(k)&&safeTree(x,depth+1)));
  const fresh=()=>({namespace:NAMESPACE,version:3,revision:0,createdAt:new Date().toISOString(),starter:null,partner:null,party:[],creatures:[],world:null,focus:'ALL',rewards:[],items:{capsules:12,potions:5},xp:0,settings:{relaxed:true,reducedMotion:false},trainer:''});
  function validWorld(w){
    if(w===null)return true;
    if(!fields(w,['zoneId','kind','page','courseId','lectureId','examId','x','y','facing','discoveries','region'])||!identifier(w.zoneId)||!integer(w.page,10000))return false;
    if(w.kind!==undefined&&w.kind!=='course'||w.lectureId!=null||w.examId!=null)return false;
    if(!(w.courseId===''||COURSES.includes(w.courseId)))return false;
    if(!['x','y'].every(k=>Number.isFinite(w[k])&&w[k]>=0&&w[k]<=1000)||!['up','down','left','right'].includes(w.facing))return false;
    if(!array(w.discoveries,identifier,5000)||!unique(w.discoveries))return false;
    if(w.region!==undefined&&w.region!==null&&!identifier(w.region))return false;
    const regions=root.AtlasRegion;
    if(Array.isArray(regions?.ZONES)&&regions.ZONES.length){
      if(!regions.ZONES.includes(w.region)||w.zoneId!=='region:'+w.region||w.page!==regions.PAGE_BASE+regions.ZONES.indexOf(w.region))return false;
      const course=regions.courseOf?.(w.region);if(course&&w.courseId!==course)return false;
    }
    return true;
  }
  function valid(s){
    if(!fields(s,['namespace','version','revision','createdAt','starter','partner','party','creatures','world','focus','rewards','items','xp','settings','trainer'])||!safeTree(s)||s.namespace!==NAMESPACE||s.version!==3||!integer(s.revision)||!integer(s.xp)||!timestamp(s.createdAt))return false;
    const species=[...new Set((root.AtlasBestiary?.species||[]).filter(c=>c&&identifier(c.id)&&(c.courseId==='CORE'||COURSES.includes(c.courseId)||COURSES.includes(c.line?.course))).map(c=>c.id))];
    if(!array(s.creatures,c=>fields(c,['id','xp'])&&species.includes(c.id)&&integer(c.xp,10000000),species.length)||!unique(s.creatures.map(c=>c.id)))return false;
    if(!array(s.party,id=>s.creatures.some(c=>c.id===id),6)||!unique(s.party))return false;
    if(s.partner!==null&&!s.party.includes(s.partner))return false;
    if(s.starter!==null&&(!STARTERS.includes(s.starter)||!species.includes(s.starter)||!s.creatures.some(c=>c.id===s.starter)||s.partner===null||!s.party.length))return false;
    if(s.starter===null&&(s.partner!==null||s.party.length||s.creatures.length))return false;
    if(!(s.focus==='ALL'||COURSES.includes(s.focus)))return false;
    if(!fields(s.settings,['relaxed','reducedMotion'])||typeof s.settings.relaxed!=='boolean'||typeof s.settings.reducedMotion!=='boolean')return false;
    if(!fields(s.items,['capsules','potions'])||!['capsules','potions'].every(k=>integer(s.items[k],100000)))return false;
    if(!array(s.rewards,identifier)||!unique(s.rewards))return false;
    if(s.trainer!==undefined&&!string(s.trainer,24))return false;
    return validWorld(s.world);
  }
  function load(storage){
    try{const raw=storage.getItem(KEY);if(raw){const s=JSON.parse(raw);if(!valid(s))throw Error('The world save needs a compatible backup. The original has been kept.');return {state:s};}
      return {state:fresh()};
    }catch(e){return {state:fresh(),error:e.message,blocked:true};}
  }
  function save(storage,s){if(!valid(s))throw Error('World save validation failed.');storage.setItem(KEY,JSON.stringify(s));}
  const api={KEY,NAMESPACE,STARTERS,COURSES,fresh,valid,validWorld,load,save};root.AtlasAdventureState=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
