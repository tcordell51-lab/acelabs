/* Import boundary for the isolated DAT game. Pure validation only: no storage, migrations, or network.
 * Backup acceptance confirms shape and current DAT identities; it is not authentication of a learner's work. */
(function(root){
  'use strict';
  const NAMESPACE='ace-dat-realms-mnemon-v1',PREFIX='ace_dat_realms_mnemon_v1_';
  const COURSES=['BIO','GCHEM','OCHEM','PAT','RC','QR'];
  const REQUIRED_KEYS=['world_v1','quest_v1','srs_v1','gym_v1'].map(x=>PREFIX+x);
  const KEYS=[...REQUIRED_KEYS,PREFIX+'discovery_v1',PREFIX+'concept_sessions_v1'];
  const obj=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
  const id=x=>typeof x==='string'&&x.length>0&&x.length<=240&&!['__proto__','prototype','constructor'].includes(x);
  const nat=x=>Number.isSafeInteger(x)&&x>=0&&x<=Number.MAX_SAFE_INTEGER;
  const iso=x=>typeof x==='string'&&x.length===24&&Number.isFinite(Date.parse(x))&&new Date(x).toISOString()===x;
  const fields=(x,allowed)=>obj(x)&&Object.keys(x).every(k=>allowed.includes(k));
  function safe(x,depth=0){
    if(depth>24)return false;
    if(x===null||typeof x==='boolean')return true;
    if(typeof x==='number')return Number.isFinite(x)&&x>=0&&x<=Number.MAX_SAFE_INTEGER;
    if(typeof x==='string')return x.length<=2000&&!/^D1\d\d(?:$|[-_])/i.test(x);
    if(Array.isArray(x))return x.length<=50000&&x.every(v=>safe(v,depth+1));
    return obj(x)&&Object.keys(x).length<=50000&&Object.entries(x).every(([k,v])=>id(k)&&safe(v,depth+1));
  }
  const every=(x,fn,max=50000)=>Array.isArray(x)&&x.length<=max&&x.every(fn);
  const map=(x,fn)=>obj(x)&&Object.entries(x).every(([k,v])=>id(k)&&fn(v,k));
  function bank(){return new Map([...(root.MNEMON_ITEMS||[]),...(root.AceDATContent?.items||[])].filter(x=>x&&id(x.id)&&COURSES.includes(x.course)&&x.verified===true&&x.reviewStatus==='internal-reviewed').map(x=>[x.id,x]));}
  function attempt(a,items,course){
    if(!fields(a,['id','s','ok','at','m','h','w','f','ix','attemptId','correct','assisted','practice','repeated','objectiveId','familyId','pool','confidence','selfRated','sourceId','sourceVersion']))return false;
    const item=items.get(a.id);if(!item||course&&item.course!==course||a.s!==+item.session||typeof a.ok!=='boolean'||!iso(a.at)||!id(a.m))return false;
    if(a.correct!==undefined&&a.correct!==a.ok)return false;
    if(a.attemptId!==undefined&&!id(a.attemptId))return false;
    for(const key of ['sourceId','sourceVersion'])if(a[key]!==undefined&&a[key]!==null&&!id(a[key]))return false;
    for(const k of ['assisted','practice','repeated','selfRated'])if(a[k]!==undefined&&typeof a[k]!=='boolean')return false;
    if(a.h!==undefined&&a.h!==1||a.f!==undefined&&a.f!==1)return false;
    if(a.objectiveId!==undefined&&a.objectiveId!==item.objectiveId||a.familyId!==undefined&&a.familyId!==item.familyId)return false;
    if(a.pool!==undefined&&a.pool!==item.pool)return false;
    return true;
  }
  const COUNT_KEYS=['count','stars','encounters','wins','losses','best','last','runs','correct','total','score','hits','misses','n','battles','bestStreak','lumenRun'];
  function counters(x){
    if(!obj(x)&&!Array.isArray(x))return true;
    const strict=['count','stars','encounters','wins','losses','best','score','hits','n','battles','bestStreak'];
    return Object.entries(x).every(([k,v])=>(!strict.includes(k)||nat(v))&&(!COUNT_KEYS.includes(k)||typeof v!=='number'||nat(v))&&counters(v));
  }
  const COURSE_FIELDS=['dex','attempts','misses','quests','critLog','streakLog','blitz','outbreak','medals','runway','special','perfectCatch','battles','water','lumen','lumenRun','region'];
  const QUEST_FIELDS=['namespace','version','coins','bag','pages','badges','attempts','dex','misses','seen','bestStreak','sound','battles','special','courses','spent','hp','trainers','fieldMoves',...COURSE_FIELDS];
  function itemMap(value,items,course,kind){return map(value,(entry,key)=>{const item=items.get(key);if(!item||course&&item.course!==course)return false;return kind==='count'?nat(entry):obj(entry)&&safe(entry);});}
  function recordPart(p,items,course){
    if(!obj(p))return false;
    if(p.attempts!==undefined&&!every(p.attempts,a=>attempt(a,items,course),6000))return false;
    if(p.misses!==undefined&&!itemMap(p.misses,items,course,'miss'))return false;
    if(p.seen!==undefined&&!itemMap(p.seen,items,course,'count'))return false;
    if(p.dex!==undefined){
      const sessions=new Set([...items.values()].filter(x=>!course||x.course===course).map(x=>String(x.session)));
      if(!map(p.dex,(entry,key)=>sessions.has(key)&&obj(entry)&&(entry.stars===undefined||nat(entry.stars)&&entry.stars<=3)))return false;
    }
    if(p.lumenRun!==undefined){
      const sessions=new Set([...items.values()].filter(x=>!course||x.course===course).map(x=>String(x.session)));
      if(!map(p.lumenRun,(entry,key)=>sessions.has(key)&&fields(entry,['n','at'])&&nat(entry.n)&&iso(entry.at)))return false;
    }
    if(p.battles!==undefined&&!nat(p.battles)||p.perfectCatch!==undefined&&typeof p.perfectCatch!=='boolean')return false;
    return true;
  }
  function validQuest(p){
    if(!fields(p,QUEST_FIELDS)||!safe(p)||!counters(p)||p.namespace!==NAMESPACE||p.version!==1)return false;
    const items=bank();if(!recordPart(p,items,null))return false;
    if(p.coins!==undefined&&!nat(p.coins)||p.bestStreak!==undefined&&!nat(p.bestStreak)||p.sound!==undefined&&typeof p.sound!=='boolean')return false;
    if(p.bag!==undefined&&(!fields(p.bag,['potion','greatCapsule','escapeRope','revive'])||!Object.values(p.bag).every(nat)))return false;
    if(p.courses!==undefined&&!map(p.courses,(c,key)=>COURSES.includes(key)&&fields(c,COURSE_FIELDS)&&recordPart(c,items,key)))return false;
    const species=new Set((root.AtlasBestiary?.species||[]).filter(x=>x&&(x.courseId==='CORE'||COURSES.includes(x.courseId)||COURSES.includes(x.line?.course))).map(x=>x.id));
    if(p.hp!==undefined&&!map(p.hp,(h,key)=>species.has(key)&&fields(h,['hp','max','at'])&&nat(h.hp)&&nat(h.max)&&h.hp<=h.max&&iso(h.at)))return false;
    return true;
  }
  function validGym(p){
    if(!fields(p,['namespace','version','runs','seen'])||!safe(p)||p.namespace!==NAMESPACE||p.version!==1)return false;
    const items=bank();
    if(p.seen!==undefined&&!itemMap(p.seen,items,null,'count'))return false;
    const exams=new Set(COURSES.map(c=>root.AtlasCourses?.get?.(c)?.examId).filter(id));
    return p.runs===undefined||every(p.runs,r=>fields(r,['examId','course','at','startedAt','finishedAt','correct','total','answers','duration','ms','score'])&&exams.has(r.examId)&&(r.course===undefined||COURSES.includes(r.course))&&nat(r.correct)&&nat(r.total)&&r.total>0&&r.correct<=r.total&&(r.at===undefined||iso(r.at))&&(r.answers===undefined||every(r.answers,a=>attempt(a,items,r.course),500)),10000);
  }
  function validateBundle(bundle){
    const errors=[];
    if(!fields(bundle,['game','exported',...KEYS])||bundle.game!==NAMESPACE||!iso(bundle.exported))return {valid:false,errors:['Unknown or malformed DAT backup format.']};
    for(const key of REQUIRED_KEYS)if(!Object.prototype.hasOwnProperty.call(bundle,key))errors.push('Missing backup slot: '+key);
    const [world,quest,srs,gym]=KEYS.map(key=>bundle[key]);
    if(world===null||!root.AtlasAdventureState?.valid?.(world))errors.push('World state does not match the current DAT registry.');
    if(quest!==null&&!validQuest(quest))errors.push('Quest state contains invalid fields or unknown DAT item identities.');
    if(srs!==null){
      if(!root.AtlasSRS?.valid?.(srs))errors.push('Review history is malformed.');
      else{const items=bank(),objectives=new Set([...items.values()].map(x=>x.objectiveId));if(Object.keys(srs.cards).some(key=>!items.has(key))||srs.events.some(e=>{const item=items.get(e.itemId);return !item||e.objectiveId!==null&&e.objectiveId!==item.objectiveId||e.familyId!==null&&e.familyId!==item.familyId;})||srs.exposures.some(e=>!objectives.has(e.objectiveId)))errors.push('Review history does not match the current DAT bank.');}
    }
    const discovery=bundle[PREFIX+'discovery_v1'];
    if(discovery!=null&&!root.AceDATDiscovery?.store?.valid?.(discovery))errors.push('Discovery progress does not match the current DAT activities.');
    const concepts=bundle[PREFIX+'concept_sessions_v1'];
    if(concepts!=null&&!root.AceDATDiscovery?.conceptStore?.valid?.(concepts))errors.push('Concept visits do not match the current DAT activities.');
    if(gym!==null&&!validGym(gym))errors.push('Gym history contains an unknown format or DAT identity.');
    return {valid:errors.length===0,errors};
  }
  root.AceDATSave=Object.freeze({NAMESPACE,KEYS:Object.freeze(KEYS),validQuest,validGym,validateBundle});
})(typeof window!=='undefined'?window:globalThis);
