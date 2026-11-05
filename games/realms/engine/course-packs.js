/* Course packs: the registry that lets the battle engine run any course.
 * A pack is data only: window.AtlasCoursePacks.<COURSE>={...}, one file per course (content/bio-pack.js),
 * loaded before this file. A pack that is missing is simply absent; a pack that fails validation is ignored
 * with one console warning. There is no built-in course and no fallback course: an unknown course resolves
 * to null. Course ids are short upper-case words (BIO now; GCHEM and OCHEM later).
 *
 * Pack fields beyond the core set that this loader understands (all optional):
 *   styles.<typeId>.mechanic   one of the twelve core style families (fuel, membrane, bond,
 *                              catalyst, signal, oxygen, helix, gene, redox, lipid, tool,
 *                              solvent). Battle math reuses that family's code. Missing:
 *                              assigned in order so every type still fights differently.
 *   gymName                    name of the full-length paper (default "<name> Gym")
 *   world                      region name shown in the field log header
 *   specials                   bridge creatures that tie two routes together:
 *                              [id, name, [routeA, routeB], second type, body plan, color, habitats, blurb]. Each
 *                              battle deals questions from both routes. A bad row is dropped on its own.
 *   specialsName               the field log row's name for them (default "Crossings")
 *   specialsNote               one line under that row
 *   legendary                  the region legendary (read by the world file)
 */
(function(root){
  'use strict';
  root.AtlasCoursePacks=root.AtlasCoursePacks&&typeof root.AtlasCoursePacks==='object'&&!Array.isArray(root.AtlasCoursePacks)?root.AtlasCoursePacks:{};
  const MECHANICS=['fuel','membrane','bond','catalyst','signal','oxygen','helix','gene','redox','lipid','tool','solvent'];
  const ORDER=['BIO','GCHEM','OCHEM','PAT','RC','QR'];
  const REMEMBER='ace_dat_realms_mnemon_v1_quest_course';
  const obj=v=>v&&typeof v==='object'&&!Array.isArray(v)?v:null;
  const str=(v,f)=>typeof v==='string'&&v.trim()?v.trim():(f||'');
  const cache=new Map(),warned=new Set(),registered=new Set();
  // The six cross-course affinities (creature-lines.js AFFINITIES). Every pack type names one.
  const AFFS=['message','machine','energy','force','framework','boundary'];

  function normalize(raw){
    const p=obj(raw);if(!p)return null;
    const course=String(p.course||'').toUpperCase();if(!ORDER.includes(course))return null;
    const sessions=(Array.isArray(p.sessions)?p.sessions:[]).map(s=>obj(s)&&+s.n>=1&&Number.isInteger(+s.n)&&str(s.title)?{n:+s.n,title:str(s.title),lecturer:str(s.lecturer),objectiveIds:(Array.isArray(s.objectiveIds)?s.objectiveIds:[]).filter(x=>typeof x==='string'),availability:str(s.availability,'planned')}:null).filter(Boolean).sort((a,b)=>a.n-b.n);
    if(!sessions.length)return null;
    const seenN=new Set();const uniq=sessions.filter(s=>seenN.has(s.n)?false:(seenN.add(s.n),true));
    const types={};for(const [id,t] of Object.entries(obj(p.types)||{})){const x=obj(t);if(!x||!/^[a-z][a-z0-9_-]{0,31}$/i.test(id))continue;types[id]={name:str(x.name,id),color:/^#[0-9a-f]{3,8}$/i.test(String(x.color||''))?x.color:'#8a948c',affinity:AFFS.includes(x.affinity)?x.affinity:null,affinityWhy:str(x.affinityWhy)};
      if(!types[id].affinity&&!warned.has(course+':aff:'+id)){warned.add(course+':aff:'+id);try{console.warn('[AtlasCourses] type '+id+' in '+course+' has no affinity, so its cross-course matchups are all neutral.');}catch(e){}}}
    const tids=Object.keys(types);
    const chart=obj(p.chart)||{};const pair=r=>Array.isArray(r)&&types[r[0]]&&types[r[1]]&&r[0]!==r[1]?[String(r[0]),String(r[1]),str(r[2])]:null;
    const strong=(Array.isArray(chart.strong)?chart.strong:[]).map(pair).filter(Boolean),weak=(Array.isArray(chart.weak)?chart.weak:[]).map(pair).filter(Boolean);
    const styles={};tids.forEach((id,i)=>{const y=obj((obj(p.styles)||{})[id])||{};const explicit=MECHANICS.includes(y.mechanic);const mechanic=explicit?y.mechanic:MECHANICS[i%MECHANICS.length];styles[id]={name:str(y.name,types[id].name+' style'),say:str(y.say),fact:str(y.fact),mechanic,explicit};});
    const moves={};for(const id of tids){const m=(obj(p.moves)||{})[id];const list=(Array.isArray(m)?m:[]).slice(0,4).map(x=>Array.isArray(x)&&str(x[0])?[str(x[0]),str(x[1])]:null);while(list.length<4)list.push(null);moves[id]=list;}
    const lines=[],lineN=new Set();
    for(const l of (Array.isArray(p.lines)?p.lines:[])){
      if(!Array.isArray(l))continue;const [n,type,names,rare,blurb,second,why]=l;
      const ok=uniq.some(s=>s.n===+n)&&Array.isArray(names)&&names.length===3&&names.every(x=>str(x))&&str(rare);
      if(!ok||lineN.has(+n))continue;lineN.add(+n);
      lines.push([+n,types[type]?String(type):null,names.map(x=>str(x)),str(rare),str(blurb),second&&types[second]&&second!==type?String(second):null,str(why)]);
    }
    lines.sort((a,b)=>a[0]-b[0]);
    const specials=normalizeSpecials(p,course,uniq,types,lines);
    const signature={};for(const [k,v] of Object.entries(obj(p.signature)||{}))if(Array.isArray(v)&&str(v[0])&&lineN.has(+k))signature[+k]=[str(v[0]),str(v[1])];
    const dex={};const row=x=>obj(x)&&str(x.t)?{t:str(x.t),src:str(x.src)}:null;
    for(const [k,v] of Object.entries(obj(p.dex)||{})){const e=obj(v);if(!e||!uniq.some(s=>s.n===+k))continue;dex[+k]={core:str(e.core),facts:(Array.isArray(e.facts)?e.facts:[]).map(row).filter(Boolean),traps:(Array.isArray(e.traps)?e.traps:[]).map(row).filter(Boolean),stressed:str(e.stressed),lecturer:uniq.find(s=>s.n===+k)?.lecturer||''};}
    const gym=obj(p.gym)||{};const n=Number.isInteger(gym.n)&&gym.n>=0?Math.min(200,gym.n):0,mins=Number.isFinite(gym.mins)&&gym.mins>=0?gym.mins:0;
    const examDate=/^\d{4}-\d{2}-\d{2}$/.test(String(p.examDate||''))?String(p.examDate):null;
    const name=str(p.name,course);
    return {course,name,reviewStatus:str(p.reviewStatus),scopeNote:str(p.scopeNote),world:str(p.world),examId:str(p.examId,course.toLowerCase()+(examDate?'-'+examDate:'')+'-exam'),examLabel:str(p.examLabel,course+' exam'),examDate,examWhen:str(p.examWhen,examDate||'date to be set'),
      gym:{n,mins},gymName:str(p.gymName,name+' Gym'),sessions:uniq,types,chart:{strong,weak},styles,moves,lines,signature,dex,
      specials,specialsName:str(p.specialsName,'Crossings'),specialsNote:str(p.specialsNote),legendary:legendOf(p,types),builtIn:false};
  }
  // The region legendary: {id, name, type (a pack type id), blurb, color, plan}; null when the pack names none.
  function legendOf(p,types){const L=obj(p.legendary);if(!L||!str(L.name))return null;return {id:str(L.id),name:str(L.name),type:types[L.type]?String(L.type):null,blurb:str(L.blurb||L.description||L.lore),color:str(L.color),plan:str(L.plan)};}
  // Creature ids a special may not take: every species already registered (the base bestiary,
  // base companions, other packs; not this pack's own registration) plus every name another pack's
  // lines or specials will register, plus this pack's own line names.
  const PLANS=['quad','biped','fish','bird','serpent','blob','bug','golem'];
  function takenIds(course,lines){const out=new Set(),low=x=>String(x||'').toLowerCase();
    for(const sp of ((root.AtlasBestiary&&root.AtlasBestiary.species)||[]))if(sp&&!(sp.line&&sp.line.course===course))out.add(low(sp.id));
    for(const [c,raw] of Object.entries(root.AtlasCoursePacks)){if(String(c).toUpperCase()===course||!obj(raw)||raw.builtIn)continue;
      for(const l of (Array.isArray(raw.lines)?raw.lines:[]))if(Array.isArray(l)){(Array.isArray(l[2])?l[2]:[]).forEach(x=>out.add(low(x)));out.add(low(l[3]));}
      for(const w of (Array.isArray(raw.specials)?raw.specials:[]))if(Array.isArray(w))out.add(low(w[0]));}
    for(const l of lines){l[2].forEach(x=>out.add(low(x)));out.add(low(l[3]));}
    out.delete('');return out;}
  function normalizeSpecials(p,course,uniq,types,lines){
    const out=[],seen=new Set(),taken=takenIds(course,lines);
    for(const w of (Array.isArray(p.specials)?p.specials:[])){
      if(!Array.isArray(w))continue;const [id,name,ss,second,plan,color,habitats,blurb]=w;const sid=String(id||'').toLowerCase();
      const ok=/^[a-z][a-z0-9]{1,31}$/.test(sid)&&!seen.has(sid)&&!taken.has(sid)&&str(name)&&Array.isArray(ss)&&ss.length===2&&+ss[0]!==+ss[1]&&ss.every(n=>uniq.some(s=>s.n===+n))&&types[second];
      if(!ok){if(!warned.has(course+':'+sid)){warned.add(course+':'+sid);try{console.warn('[AtlasCourses] special '+sid+' in '+course+' is not valid and was skipped.');}catch(e){}}continue;}
      seen.add(sid);
      out.push([sid,str(name),[+ss[0],+ss[1]],String(second),PLANS.includes(plan)?plan:null,/^#[0-9a-f]{3,8}$/i.test(String(color||''))?color:null,(Array.isArray(habitats)?habitats:[]).map(x=>str(x)).filter(Boolean),str(blurb)]);
    }
    return out;}
  // The normalized pack for a course, or null. A pack marked builtIn is returned as published.
  function get(course){
    course=String(course||'').toUpperCase();if(!ORDER.includes(course))return null;const raw=root.AtlasCoursePacks[course];if(!raw)return null;
    const hit=cache.get(course);if(hit&&hit.raw===raw)return hit.pack;
    const pack=normalize(raw);cache.set(course,{raw,pack});
    if(!pack&&!warned.has(course)){warned.add(course);try{console.warn('[AtlasCourses] pack '+course+' is not valid and was ignored.');}catch(e){}}
    return pack;
  }
  function courses(){return ORDER.filter(c=>!!get(c));}
  // Availability is evidence of a usable reviewed practice pool, never whole-topic completion.
  function isReviewedItem(q,mode='ordinary'){return !!(q&&typeof q.id==='string'&&q.id.trim()&&ORDER.includes(q.course)&&Number.isInteger(q.session)&&q.session>0&&q.verified===true&&q.reviewStatus==='internal-reviewed'&&(mode==='later'?q.pool==='later':['practice','check'].includes(q.pool))&&typeof q.objectiveId==='string'&&q.objectiveId&&typeof q.familyId==='string'&&q.familyId&&typeof q.stem==='string'&&q.stem.trim()&&Array.isArray(q.options)&&[4,5].includes(q.options.length)&&q.options.every(v=>typeof v==='string'&&v.trim())&&Number.isInteger(q.answer)&&q.answer>=0&&q.answer<q.options.length&&Array.isArray(q.why)&&q.why.length===q.options.length&&q.why.every(v=>typeof v==='string'&&v.trim()));}
  function reviewedRows(course){const p=get(course);if(!p)return [];const sessions=new Set(p.sessions.map(s=>s.n)),seen=new Set();return (Array.isArray(root.MNEMON_ITEMS)?root.MNEMON_ITEMS:[]).filter(q=>isReviewedItem(q)&&q.course===p.course&&sessions.has(q.session)&&!seen.has(q.id)&&(seen.add(q.id),true));}
  function questionCount(course){return reviewedRows(course).length;}
  function sessionAvailability(course,n){const p=get(course),session=p?.sessions.find(s=>s.n===+n),rows=reviewedRows(course).filter(q=>q.session===+n),practice=rows.filter(q=>q.pool==='practice').length,check=rows.filter(q=>q.pool==='check').length;return {course:String(course||'').toUpperCase(),session:+n,title:session?.title||'',practice,check,available:!!session&&practice>0,status:practice>0?'partial':'planned',note:practice>0?'Reviewed introductory practice available; this does not cover the whole topic.':'No reviewed practice is available for this chapter yet.'};}
  function available(){return courses().filter(c=>get(c).sessions.some(s=>sessionAvailability(c,s.n).available));}
  // A valid course id, or null. There is no fallback course.
  function resolve(course){const c=String(course||'').toUpperCase();return c&&get(c)?c:null;}
  function remember(course){try{const c=resolve(course);if(c)localStorage.setItem(REMEMBER,c);}catch(e){}}
  function remembered(){try{return resolve(localStorage.getItem(REMEMBER)||'');}catch(e){return null;}}
  // A pack by its exam id.
  function byExamId(id){if(!id)return null;const s=String(id);for(const c of courses()){const p=get(c);if(!p||p.builtIn)continue;if(p.examId===s||(p.examDate&&(p.course.toLowerCase()+'-'+p.examDate+'-exam')===s))return p;}return null;}
  // Register every valid pack's creatures, types and moves. Idempotent; built-in packs are skipped.
  function register(course){const p=get(course);if(!p||p.builtIn||registered.has(p.course))return false;registered.add(p.course);
    try{root.AtlasBestiary?.registerCoursePack?.(p);}catch(e){try{console.warn('[AtlasCourses] creatures for '+p.course+' failed to register.',e);}catch(_){}}
    try{root.AtlasMoves?.registerCoursePack?.(p);}catch(e){try{console.warn('[AtlasCourses] moves for '+p.course+' failed to register.',e);}catch(_){}}
    return true;}
  function registerAll(){for(const c of courses())register(c);}
  root.AtlasCourses={get,courses,available,resolve,remember,remembered,questionCount,byExamId,register,registerAll,MECHANICS,ORDER,isReviewedItem,reviewedRows,sessionAvailability,_normalize:normalize};
  registerAll();
})(typeof window!=='undefined'?window:globalThis);
