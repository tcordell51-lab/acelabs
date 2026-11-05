/* DAT-only worlds using the authorized Mnemon AtlasRegion.extend architecture.
 * Navigation is always open. Game restoration/rewards are distinct from the
 * answer ledger and never substitute for delayed learning evidence. */
(function(root){
  'use strict';
  const R=root.AtlasRegion,A=root.AceDATRealmArt,realms=root.AceDATRealms;
  if(!R||!A||!Array.isArray(realms))throw new Error('DAT realms require AtlasRegion, realm art and reviewed route descriptors.');
  const H=R.H,esc=H.esc,obj=H.plainObj,CROSS='realm-crossroads',GROVE='realm-return-grove',LESSONS_PER_PAGE=6;
  const COURSES=['BIO','GCHEM','OCHEM','PAT','RC','QR'];
  const baseRoutes=['bio-cell-harbor','bio-organelle-quarter','gc-impossible-engine','oc-electron-route','pat-folded-vault','rc-field-report','qr-waterworks'];
  const authored=route=>route&&route.available!==false&&!['planned','unavailable','draft'].includes(route.availability)&&!['planned','unreviewed','draft'].includes(route.reviewStatus)&&route.coverage!=='planned';
  const ordered=COURSES.map(c=>realms.find(r=>r.course===c)).filter(Boolean).map(realm=>({...realm,routes:(realm.routes||[]).filter(authored)}));
  if(ordered.length!==6)throw new Error('All six DAT realm descriptors are required.');
  const routes=new Map(),metaById=new Map(),towns=new Map();
  const townsNamed={BIO:'Cellhaven',GCHEM:'Caldera Works',OCHEM:'Violet Spires',PAT:'Foldstone',RC:'Tidebound Archive',QR:'Ratio Quay'};
  const names={BIO:['Scout Mira','Courier Pell','Warden Cyra'],GCHEM:['Tinker Cal','Keeper Equi','Warden Kelvin'],OCHEM:['Scribe Nu','Artisan Sera','Warden Cora'],PAT:['Surveyor Tess','Folder Ivo','Warden Prism'],RC:['Archivist Luma','Reader Wren','Warden Quill'],QR:['Canalkeeper Remy','Clockwright Ada','Warden Ratio']};
  const rescue={'bio-cell-harbor':'portia','bio-organelle-quarter':'parcelot','gc-impossible-engine':'chatelle','oc-electron-route':'stereon','pat-folded-vault':'cubit','rc-field-report':'skimmer','qr-waterworks':'ratior'};
  const landmark={bio:'realm-harbor-lock',quarter:'realm-quarter-tower',gc:'realm-forge',oc:'realm-electron-tower',pat:'realm-fold',rc:'realm-archive',qr:'realm-clock'};
  const stationNames={bio:'Membrane Observatory',quarter:'Cargo Routing Workshop',gc:'Equilibrium Foundry',oc:'Electron Workshop',pat:'Folding Pavilion',rc:'Passage Reading Room',qr:'Waterworks Planning Table'};
  const safeIds=v=>Array.isArray(v)?[...new Set(v.filter(x=>typeof x==='string'&&x.length))]:[];
  for(const realm of ordered){
    const town='realm-'+realm.worldId+'-town';towns.set(town,realm);
    for(const route of realm.routes||[]){if(routes.has(route.id))throw new Error('Duplicate DAT route: '+route.id);routes.set(route.id,{...route,course:realm.course,worldId:realm.worldId,town,realmTitle:realm.title,objectiveIds:safeIds(route.objectiveIds),practiceIds:safeIds(route.practiceIds),checkIds:safeIds(route.checkIds),laterIds:safeIds(route.laterIds)});}
  }
  function themeKey(route){return route?.chapterTheme&&landmark[route.chapterTheme]?route.chapterTheme:route?.id==='bio-organelle-quarter'?'quarter':route?.worldId||'camp';}
  function pathVariant(route){const n=route?.pathVariant;return Number.isInteger(n)&&n>=0?n%3:baseRoutes.includes(route?.id)?0:Math.max(0,(Number(route?.session)||1)-1)%3;}
  function stationName(route){return route.stationName||stationNames[themeKey(route)]||'Field Workshop';}
  function gameRegion(course,snapshot=false){const q=snapshot?H.snap():H.readQuest();return obj(obj(obj(q.courses)[course]).region);}
  function pageOf(route,snapshot=false){const saved=obj(obj(gameRegion(route.course,snapshot).pages)[route.session]);return {...saved,storyRestored:saved.warden===true,warden:saved.warden===true&&root.AceDATMastery?.routeStatus?.(route.id)?.restoreAllowed===true};}
  function trainerDone(course,id){return !!obj(obj(gameRegion(course).trainers)[id]).beaten;}
  function updateRegion(course,fn){return H.updateQuest(q=>{q.courses=obj(q.courses);const c=q.courses[course]=obj(q.courses[course]);const r=c.region=obj(c.region);r.pages=obj(r.pages);r.trainers=obj(r.trainers);r.flags=obj(r.flags);return fn(r,q);});}
  function registerMeta(id,data){metaById.set(id,data);return id;}
  function eventMeta(e={}){const stored=metaById.get(e.id);if(stored)return stored;const route=routes.get(e.region)||routes.get(e.routeId);if(route)return {course:route.course,route};const realm=towns.get(e.region);return {course:realm?.course||e.courseId||e.course||'BIO',realm};}
  const page=id=>H.PAGE_BASE+R.ZONES.indexOf(id);
  function custom(k,map,x,y,handler,id,data,block=true){registerMeta(id,data);return H.place(k,map,x,y,{action:'custom',handler,id,...data.visual},block);}
  function decor(k,map,x,y,sprite,biome,extra={}){H.decor(k,map,x,y,{sprite,biome,...extra});}
  function sign(k,map,x,y,title,text){return H.place(k,map,x,y,{action:'sign',sprite:'sign',label:title,title,text,optional:true});}
  function lane(k,map,x1,y1,x2,y2,width=3){k.fill(map,Math.min(x1,x2),Math.min(y1,y2),Math.abs(x2-x1)+width,Math.abs(y2-y1)+width,1);}
  function bridge(k,map,x,y,w,h){k.fill(map,x,y,w,h,1);for(let j=y;j<y+h;j++)for(let i=x;i<x+w;i++)H.overlay(map,i,j,'realm-bridge');}
  function portal(k,map,x,y,target,label,biome){k.portal(map,x,y,label,{kind:'region',region:target});H.decor(k,map,x,y,{sprite:'realm-gateway',biome,label},false);}
  function learningStand(k,map,x,y,route,index){const objective=route.objectiveIds[index];if(!objective)return;custom(k,map,x,y,'realms:learning',route.id+':learn:'+index,{course:route.course,route,objectiveId:objective,visual:{sprite:'realm-stand',biome:themeKey(route),label:objectiveName(objective),title:objectiveName(objective)+' | '+route.title,verb:'Explore',optional:true}});}
  function flowering(k,map,biome,salt){const p=A.themes[biome];for(let y=3;y<map.h-3;y+=4)for(let x=3;x<map.w-3;x+=5){if(map.tiles[y*map.w+x]!==0||map.blocks.has(k.tileKey(x,y)))continue;const n=(x*17+y*31+salt)%7;if(n===0)decor(k,map,x,y,biome==='gc'?'realm-crystal':biome==='qr'?'realm-gear':biome==='rc'?'realm-reed':'realm-bloom',biome,{color:p.accent});}}
  function localTrees(map,biome){if(biome==='bio'||biome==='camp')return;for(const o of map.objects)if(o.kind==='tree'){o.kind='decor';o.sprite='realm-tree';o.biome=biome;}}
  function crossing(k){
    const map=k.blank('region','region:'+CROSS,'BIO',page(CROSS),46,34);H.frame(k,map);
    k.fill(map,20,12,7,11,1);k.fill(map,8,8,31,3,1);k.fill(map,8,25,31,3,1);k.fill(map,22,4,3,27,1);k.fill(map,8,16,31,3,1);k.fill(map,8,9,3,19,1);k.fill(map,36,9,3,19,1);
    k.fill(map,15,14,4,9,2);k.fill(map,29,14,4,9,2);bridge(k,map,15,16,4,3);bridge(k,map,29,16,4,3);
    const gates=[[9,8],[23,5],[37,8],[9,25],[23,29],[37,25]];
    ordered.forEach((realm,i)=>{const [x,y]=gates[i];portal(k,map,x,y,'realm-'+realm.worldId+'-town',realm.title,realm.worldId);decor(k,map,x+(i%2?3:-3),y+1,'realm-banner',realm.worldId);});
    k.fill(map,37,16,6,3,1);portal(k,map,42,17,GROVE,'Return Grove','grove');
    decor(k,map,23,14,'fountain','camp');
    custom(k,map,25,20,'realms:atlas','crossroads:guide',{course:'BIO',visual:{sprite:'realm-trainer',biome:'camp',label:'Wayfinder Sage',name:'Wayfinder Sage',title:'The six DAT realms',verb:'Talk'}});
    registerMeta('crossroads:center',{course:'BIO'});k.addBuilding(map,4,12,7,4,'RECALL',{action:'custom',handler:'realms:center',id:'crossroads:center',title:'Recall Center',roof:'#7c9a76',trim:'#476954'});
    sign(k,map,33,20,'Future expeditions','More DAT chapters are planned. Open routes have full activities; the full DAT curriculum is not yet playable.');
    decor(k,map,13,5,'realm-parcel','camp');decor(k,map,32,29,'realm-parcel','camp');
    for(const [x,y] of [[19,12],[27,12],[19,23],[27,23]])decor(k,map,x,y,'lamp','camp');
    H.sprinkleTrees(k,map,17,71);map.spawn={x:23.5,y:19.5};return map;
  }
  function returnGrove(k){
    const map=k.blank('region','region:'+GROVE,'BIO',page(GROVE),44,34);H.frame(k,map);
    k.fill(map,14,12,16,12,2);k.fill(map,18,14,9,8,0);
    k.fill(map,6,8,32,3,1);k.fill(map,6,24,32,3,1);k.fill(map,6,9,3,17,1);k.fill(map,35,9,3,17,1);
    k.fill(map,21,7,3,24,1);k.fill(map,6,17,32,3,1);bridge(k,map,14,17,5,3);bridge(k,map,27,17,3,3);
    k.fill(map,18,14,9,8,1);k.fill(map,21,12,3,2,1);k.fill(map,21,22,3,2,1);
    portal(k,map,22,29,CROSS,'DAT Crossroads','camp');
    const sites=[[9,10],[22,8],[35,10],[9,24],[22,25],[35,24]];
    ordered.forEach((realm,i)=>{const [x,y]=sites[i];custom(k,map,x,y,'realms:return',GROVE+':'+realm.course,{course:realm.course,realm,role:'subject',visual:{sprite:'realm-return-stone',biome:realm.worldId,subject:realm.course,label:realm.name||realm.course,title:(realm.name||realm.course)+' | return landmark',verb:'Explore'}});});
    decor(k,map,24,14,'realm-return-tree','grove',{label:'The Remembering Tree'});
    custom(k,map,20,16,'realms:return',GROVE+':guide',{course:'BIO',role:'guide',visual:{sprite:'realm-trainer',biome:'grove',name:'Keeper Rowan',label:'Keeper Rowan',title:'Keeper Rowan | returning to earlier learning',verb:'Talk'}});
    custom(k,map,24,20,'realms:return',GROVE+':review',{course:'BIO',role:'review',visual:{sprite:'realm-stand',biome:'grove',label:'Return fieldbook',title:'Return fieldbook | cross-realm review',verb:'Review'}});
    custom(k,map,18,21,'realms:return',GROVE+':rest',{course:'BIO',role:'rest',visual:{sprite:'realm-rest-bench',biome:'grove',label:'Resting bench',title:'Rest the party for free',verb:'Rest'}});
    sign(k,map,26,28,'A place to return','Revisit earlier ideas after a gap. Help and fresh recall are recorded separately. Resting, traveling and visiting a landmark never count as a correct answer.');
    for(const [x,y] of [[12,13],[31,13],[12,22],[31,22]])decor(k,map,x,y,'realm-reed','grove');
    for(const [x,y] of [[17,10],[27,10],[16,26],[28,26]])decor(k,map,x,y,'lamp','grove');
    flowering(k,map,'grove',53);H.sprinkleTrees(k,map,17,107);localTrees(map,'grove');map.spawn={x:22.5,y:27.5};return map;
  }
  function town(k,realm){
    const id='realm-'+realm.worldId+'-town',biome=realm.worldId,p=A.themes[biome],map=k.blank('region','region:'+id,realm.course,page(id),40,32);
    H.frame(k,map);k.fill(map,2,15,36,3,1);k.fill(map,18,4,3,25,1);k.fill(map,12,13,16,8,1);k.fill(map,7,10,3,8,1);k.fill(map,29,10,3,8,1);k.fill(map,19,24,18,3,1);k.fill(map,34,16,3,11,1);
    k.fill(map,3,23,10,5,2);bridge(k,map,8,23,3,5);
    const center=id+':center';registerMeta(center,{course:realm.course});k.addBuilding(map,4,5,8,6,'RECALL',{action:'custom',handler:'realms:center',id:center,title:'Recall Center | free rest and review',roof:'#7da987',trim:'#436659'});
    const guide=id+':learning';registerMeta(guide,{course:realm.course,realm});k.addBuilding(map,26,5,8,5,'FIELD LAB',{action:'custom',handler:'realms:learning',id:guide,title:'Field Lab | choose a lesson',roof:p.roof,trim:p.trim});
    const routeList=realm.routes.map(r=>routes.get(r.id));portal(k,map,3,16,CROSS,'DAT Crossroads','camp');if(routeList[0])portal(k,map,37,16,routeList[0].id,routeList[0].title,themeKey(routeList[0]));
    if(routeList[1])portal(k,map,37,25,routeList[1].id,routeList[1].title,themeKey(routeList[1]));
    if(routeList.length>2)custom(k,map,32,24,'realms:atlas',id+':route-board',{course:realm.course,realm,visual:{sprite:'realm-plan',biome,label:'All chapters',title:'All chapters | choose a route',verb:'Travel'}});
    custom(k,map,16,13,'realms:atlas',id+':guide',{course:realm.course,realm,visual:{sprite:'realm-trainer',biome,label:'Town guide',name:'Town guide',title:townsNamed[realm.course],verb:'Talk'}});
    custom(k,map,14,24,'realms:planned',id+':planned',{course:realm.course,realm,visual:{sprite:'realm-plan',biome,label:'Future chapters',title:'Future chapters | planned',verb:'Explore',optional:true}});
    decor(k,map,25,23,landmark[biome],biome,{label:townsNamed[realm.course]});
    for(const [x,y] of [[12,12],[27,12],[12,20],[27,20]])decor(k,map,x,y,'lamp',biome);
    for(const [x,y] of [[5,20],[32,22]])decor(k,map,x,y,'realm-banner',biome);
    sign(k,map,22,11,'Welcome to '+townsNamed[realm.course],realm.title+'. Explore the field station, spar with trainers and face a route Warden. Travel and rest are always available. Team Entropy is a story antagonist; its name does not redefine scientific entropy.');
    flowering(k,map,biome,realm.course.length);H.sprinkleTrees(k,map,21,realm.course.length*13);localTrees(map,biome);map.spawn={x:19.5,y:18.5};return map;
  }
  function routeMap(k,route){
    const biome=themeKey(route),p=A.themes[biome],map=k.blank('region','region:'+route.id,route.course,page(route.id),48,34);
    H.frame(k,map);
    // The perimeter scenery varies by realm; central paths and bridges remain open.
    if(biome==='bio'){k.fill(map,3,26,40,5,2);k.fill(map,34,3,9,6,2);}
    if(biome==='quarter'){k.fill(map,21,2,3,30,2);k.fill(map,3,28,41,3,2);}
    if(biome==='gc'){k.fill(map,31,3,12,6,2);k.fill(map,5,26,10,5,2);for(let y=3;y<31;y++)H.overlay(map,44,y,'realm-pipe');}
    if(biome==='oc'){k.fill(map,4,27,39,4,2);k.fill(map,35,3,7,5,2);}
    if(biome==='pat'){k.fill(map,32,3,11,5,2);for(let y=22;y<30;y++)for(let x=4;x<12;x++)H.overlay(map,x,y,'realm-marble');}
    if(biome==='rc'){k.fill(map,3,27,41,4,2);k.fill(map,34,3,10,6,2);k.fill(map,3,3,7,4,2);}
    if(biome==='qr'){k.fill(map,20,2,3,30,2);k.fill(map,3,28,41,3,2);for(let y=4;y<12;y++)for(let x=34;x<43;x++)H.overlay(map,x,y,'realm-grid');}
    k.fill(map,2,16,44,3,1);k.fill(map,13,8,3,11,1);k.fill(map,32,8,3,12,1);k.fill(map,23,17,3,11,1);k.fill(map,7,11,8,3,1);k.fill(map,14,23,12,3,1);k.fill(map,24,25,17,3,1);k.fill(map,24,8,11,3,1);k.fill(map,38,18,3,10,1);
    const variant=pathVariant(route);if(variant===1){k.fill(map,14,9,12,3,1);k.fill(map,7,12,3,14,1);k.fill(map,7,24,18,3,1);}else if(variant===2){k.fill(map,14,8,21,3,1);k.fill(map,14,8,3,17,1);k.fill(map,15,23,25,3,1);}
    if(biome==='quarter'||biome==='qr'){bridge(k,map,20,16,4,3);bridge(k,map,20,23,4,3);k.fill(map,21,11,6,4,1);}
    k.fill(map,5,19,7,4,3);k.fill(map,17,5,8,3,3);k.fill(map,28,20,6,4,3);k.fill(map,36,10,7,4,3);
    map.session=route.session;map.wildAction='realms:wild';
    portal(k,map,3,17,route.town,townsNamed[route.course],biome);portal(k,map,44,17,CROSS,'DAT Crossroads','camp');
    const nn=names[route.course],trainers=[[12,15],[30,19]];
    trainers.forEach(([x,y],i)=>{const id=route.id+':trainer:'+i;custom(k,map,x,y,'realms:trainer',id,{course:route.course,route,index:i,visual:{sprite:'realm-trainer',biome,session:route.session,name:nn[i],label:nn[i],title:nn[i]+' | practice trainer',verb:trainerDone(route.course,id)?'Rematch':'Challenge',beaten:trainerDone(route.course,id),color:i?p.accent:p.roof}});});
    custom(k,map,24,13,'realms:station',route.id+':station',{course:route.course,route,visual:{sprite:'realm-station',biome,session:route.session,label:stationName(route),title:stationName(route),verb:'Explore',done:discoveryDone(route)}});
    custom(k,map,40,15,'realms:warden',route.id+':warden',{course:route.course,route,visual:{sprite:'realm-warden',biome,session:route.session,name:nn[2],label:nn[2],title:nn[2]+' | route checkpoint',verb:'Challenge',restored:!!pageOf(route).warden}});
    custom(k,map,35,23,'realms:grunt',route.id+':entropy',{course:route.course,route,visual:{sprite:'realm-entropy',biome,session:route.session,label:'Team Entropy scout',title:'Team Entropy | practice encounter',verb:'Confront',optional:true}});
    const stands=[[8,12],[15,24],[24,26],[33,10],[39,24],[25,8]];route.objectiveIds.forEach((_,i)=>{const pt=stands[i];if(pt)learningStand(k,map,pt[0],pt[1],route,i);});
    decor(k,map,28,14,A.chapterAccents?.[route.id]?.sprite||landmark[biome],biome,{label:route.title});
    if(biome==='quarter'){decor(k,map,9,7,'realm-quarter-tower',biome);decor(k,map,41,29,'realm-parcel',biome);decor(k,map,17,29,'realm-parcel',biome);}
    else if(biome==='gc'){decor(k,map,37,6,'realm-forge',biome);decor(k,map,9,28,'realm-crystal',biome);}
    else if(biome==='oc'){decor(k,map,9,7,'realm-electron-tower',biome);decor(k,map,40,29,'realm-crystal',biome);}
    else if(biome==='pat'){decor(k,map,8,7,'realm-fold',biome);decor(k,map,39,28,'realm-fold',biome);}
    else if(biome==='rc'){decor(k,map,9,8,'realm-archive',biome);decor(k,map,39,29,'realm-archive',biome);}
    else if(biome==='qr'){decor(k,map,8,7,'realm-clock',biome);decor(k,map,37,29,'realm-gear',biome);}
    else{decor(k,map,10,28,'realm-harbor-lock',biome);decor(k,map,40,6,'boat',biome);}
    sign(k,map,6,15,'A living route','The tall grass holds practice encounters. Trainers use practice questions; the Warden uses this route\'s separate checkpoint questions. Explore any lesson when you need help.');
    sign(k,map,42,20,'The road stays open','You can visit another realm or return to the Recall Center whenever you like. Route restoration is an adventure reward, not a full DAT readiness score.');
    for(const [x,y] of [[17,14],[37,15],[27,26]])decor(k,map,x,y,'lamp',biome);
    for(const [i,x,y] of [[0,10,24],[1,27,5],[2,42,23]])H.place(k,map,x,y,{action:'item',sprite:'item',id:route.id+':glint:'+i,coins:2,label:'A little supply glint',title:'A little supply glint',optional:true},false);
    flowering(k,map,biome,route.session*19);H.sprinkleTrees(k,map,23,route.session*31+route.course.length);localTrees(map,biome);map.spawn={x:16.5,y:17.5};
    const next=stepsFor(route).find(step=>!step.done()),target=next&&map.objects.find(o=>o.id===next.target);
    if(target)R.setObjective(route.id,Math.floor(target.x),Math.floor(target.y),next.targetLabel);else R.clearObjective(route.id);
    return map;
  }
  const on=(id,fn)=>{const el=root.document?.getElementById(id);if(el)el.onclick=fn;};
  const show=(api,title,html,wide=true)=>api.panel(title,html,wide);
  function travel(api,id){api.closePanel();api.travel(id);}
  function objectiveName(id){const list=root.AceDATContent?.objectives;const record=(Array.isArray(list)?list.find(o=>o.id===id):list?.[id])||root.AceDATObjectives?.[id];return record?.name||record?.title||id.replace(/^[^.\-]+[.\-]/,'').replaceAll('-',' ');}
  function lessonChooser(m,api,requestedPage=0,focusId){
    const list=m.route?[m.route]:[...routes.values()].filter(r=>r.course===m.course),lessons=list.flatMap(route=>route.objectiveIds.map(id=>({route,id}))),pages=Math.max(1,Math.ceil(lessons.length/LESSONS_PER_PAGE)),index=Math.min(pages-1,Math.max(0,Number.isInteger(requestedPage)?requestedPage:0)),start=index*LESSONS_PER_PAGE,visible=lessons.slice(start,start+LESSONS_PER_PAGE);
    let previous;const rows=visible.map(({route,id})=>{const heading=previous===route.id?'':`<h3>${esc(route.title)}</h3>`;previous=route.id;return heading+`<div class="backup-actions"><button class="secondary" style="min-height:44px" data-dat-objective="${esc(id)}">${esc(objectiveName(id))}</button></div>`;}).join('');
    show(api,m.route?m.route.title+' | field learning':'Field Lab',`<p class="panel-intro">Choose a guide, then try its visual station and examples. Every lesson in this chapter is available here, including those beyond the outdoor field stands.</p>${rows||'<p>No reviewed lessons are available here yet.</p>'}${pages>1?`<nav aria-label="Field lesson pages"><p role="status">Lessons ${start+1}–${start+visible.length} of ${lessons.length} · Page ${index+1} of ${pages}</p><div class="backup-actions"><button class="secondary" style="min-height:44px" id="realm-lessons-prev" aria-label="Previous lesson page" ${index===0?'disabled':''}>Previous</button><button class="secondary" style="min-height:44px" id="realm-lessons-next" aria-label="Next lesson page" ${index===pages-1?'disabled':''}>Next lessons</button></div></nav>`:''}`,false);
    root.document?.querySelectorAll('[data-dat-objective]').forEach(b=>{b.onclick=()=>root.AceDATLearning.open(b.dataset.datObjective,api);});
    on('realm-lessons-prev',()=>lessonChooser(m,api,index-1,'realm-lessons-next'));on('realm-lessons-next',()=>lessonChooser(m,api,index+1,'realm-lessons-prev'));
    if(focusId)root.document?.getElementById(focusId)?.focus?.();
  }
  function learning(e,api){const m=eventMeta(e);if(m.objectiveId){root.AceDATLearning.open(m.objectiveId,api);return;}lessonChooser(m,api);}
  function station(e,api){const {route}=eventMeta(e);const next=route?.objectiveIds.find(id=>root.AceDATDiscovery?.activityForObjective(id)&&!root.AceDATDiscovery.completedForObjective(id));if(next){root.AceDATLearning.open(next,api);return;}learning(e,api);}
  function campaign(api,route=null,course=null){
    if(typeof root.AceDATCampaignUI?.open!=='function')return false;
    root.AceDATCampaignUI.open(api,{course:route?.course||course,routeId:route?.id||null,onCheckpoint:id=>{const selected=routes.get(id);if(selected)battle({region:selected.id,id:selected.id+':warden'},api,'warden');}});return true;
  }
  function atlas(e,api,requestedWorld){
    const m=eventMeta(e),localWorld=m.realm?.worldId||m.route?.worldId,world=requestedWorld===undefined?(localWorld||'all'):requestedWorld,selected=ordered.find(realm=>realm.worldId===world),visible=selected?[selected]:ordered;
    show(api,selected?selected.title+' | chapters':'The six DAT realms',`<p class="panel-intro">${selected?'Choose any chapter in this world. Travel and return paths are open from the start.':'Six connected worlds. Every town, route and return path is open from the start.'}</p><div class="backup-actions">${selected?'<button type="button" class="secondary" data-dat-atlas-world="all">Show all six worlds</button>':ordered.map(realm=>`<button type="button" class="secondary" data-dat-atlas-world="${esc(realm.worldId)}">${esc(realm.title)} chapters</button>`).join('')}<button class="primary" data-dat-travel="${CROSS}">Return to DAT Crossroads</button><button class="secondary" data-dat-travel="${GROVE}">Return Grove | revisit earlier learning</button></div>${visible.map(realm=>`<h3>${esc(realm.title)}</h3><div class="backup-actions"><button class="secondary" data-dat-travel="realm-${esc(realm.worldId)}-town">${esc(townsNamed[realm.course])}</button>${realm.routes.map(raw=>{const r=routes.get(raw.id);return `<button class="secondary" data-dat-travel="${esc(r.id)}">${esc(r.title)}${pageOf(r).warden?' | checkpoint cleared':pageOf(r).storyRestored?' | story saved, check needed':''}</button>`;}).join('')}</div>`).join('')}<p class="panel-note">Each chapter covers its listed objectives. Further DAT curriculum areas are planned; they are not completed routes or a readiness claim.</p>`);
    root.document?.querySelectorAll('[data-dat-travel]').forEach(b=>{b.onclick=()=>travel(api,b.dataset.datTravel);});
    root.document?.querySelectorAll('[data-dat-atlas-world]').forEach(b=>{b.onclick=()=>atlas(e,api,b.dataset.datAtlasWorld);});
    const host=root.document?.getElementById('panelBody');
    if(host&&root.AceDATCampaignUI){const button=root.document.createElement('button');button.type='button';button.className='primary';button.style.minHeight='44px';button.id='realm-campaign';button.textContent='Learning progress & next steps';button.onclick=()=>campaign(api,null,selected?.course||null);host.prepend(button);}
  }
  function planned(e,api){const m=eventMeta(e);show(api,'Future chapters',`<p class="panel-intro">${esc(m.realm?.title||'This realm')} has more chapters ahead. The opening routes are playable; the rest of the curriculum is still being written and reviewed.</p><p>Nothing on this planning board counts as a completed lesson or assessed topic.</p><button class="secondary" id="realm-plans-back">Back to the world</button>`,false);on('realm-plans-back',api.closePanel);}
  function center(e,api){const m=eventMeta(e),course=m.course;show(api,'Recall Center',`<p class="panel-intro">Rest your party for free. Practice and scheduled recall stay separate from your adventure rewards.</p><div class="backup-actions"><button class="primary" id="realm-rest">Rest the party</button><button class="secondary" id="realm-review">Review due practice</button><button class="secondary" id="realm-guides">Open the field guides</button></div><p class="panel-note">A familiar answer is useful practice. A later fresh recall check gives different evidence about retention.</p>`,false);on('realm-rest',()=>{H.updateQuest(q=>{q.hp={};});api.notice('Your party is rested.');api.closePanel();api.header?.();});on('realm-review',()=>api.openReview(course));on('realm-guides',()=>learning({course},api));}
  function returnReview(api){if(typeof api.openReturnReview==='function')return api.openReturnReview();if(typeof root.AceDATReturnUI?.open==='function')return root.AceDATReturnUI.open(api);api.notice('Return review is not available yet. You can still rest, visit the field guides or return to any realm.');}
  function restParty(api){H.updateQuest(q=>{q.hp={};});api.notice('Your party is rested.');api.closePanel();api.header?.();}
  function groveAction(e,api){
    const m=eventMeta(e);if(m.role==='review'){returnReview(api);return;}
    const subject=m.role==='subject',label=m.realm?.name||m.course;
    show(api,subject?label+' | Return Grove':m.role==='rest'?'Resting bench':'Return Grove | Keeper Rowan',`<p class="panel-intro">${subject?`The ${esc(label)} landmark is one of six meeting here. Return to an earlier idea, try to recall it before opening help, and apply it to a fresh situation.`:m.role==='rest'?'Take a quiet break beneath the Remembering Tree. Rest restores game HP for free; it does not change your learning evidence.':'Earlier ideas deserve another visit. Return Grove brings learning from all six realms together, so a concept can return after you have explored somewhere else.'}</p><p>The return fieldbook selects eligible review from your saved learning history. Practice, help and later recall stay distinct. If nothing is eligible yet, the fieldbook will say so; you can explore or study without waiting here.</p><div class="backup-actions"><button class="primary" id="realm-return-review" style="min-height:44px">Open the return fieldbook</button><button class="secondary" id="realm-return-rest" style="min-height:44px">Rest the party</button>${subject?'<button class="secondary" id="realm-return-guides" style="min-height:44px">Visit this subject’s field guides</button>':''}<button class="secondary" id="realm-return-home" style="min-height:44px">Return to DAT Crossroads</button></div><p class="panel-note">Visiting a landmark, resting or collecting a game reward is never evidence of a correct answer. No battle or study requirement blocks travel.</p>`,false);
    on('realm-return-review',()=>returnReview(api));on('realm-return-rest',()=>restParty(api));on('realm-return-home',()=>travel(api,CROSS));if(subject)on('realm-return-guides',()=>learning({course:m.course},api));
  }
  function validPool(route,ids){const all=root.AtlasQuest?.coursePool?.(route.course);if(!Array.isArray(all))return [];const known=new Set(all.map(q=>q.id));return ids.filter(id=>known.has(id));}
  function restoreRoute(route,api){if(root.AceDATMastery?.routeStatus?.(route.id)?.restoreAllowed!==true)return false;const first=updateRegion(route.course,(r,q)=>{const old=obj(r.pages[route.session]);r.pages[route.session]={...old,warden:true,wardenAt:old.wardenAt||new Date().toISOString()};if(!old.warden)q.coins=Math.max(0,+q.coins||0)+12;return !old.warden;});const companion=route.creature||rescue[route.id];if(first&&companion)api.acquire?.(companion);api.setNotice?.(route.title+' restored.');api.refresh?.();return true;}
  function battle(e,api,kind){const m=eventMeta(e),route=m.route;if(!route){api.notice('Choose a route encounter first.');return;}let ids=route.practiceIds;
    if(kind==='warden'){
      const status=root.AceDATMastery?.routeStatus?.(route.id);
      if(status?.restoreAllowed===true){if(restoreRoute(route,api))api.notice(route.title+' restored. Your saved skill evidence is recognized.');return;}
      // Reserve one unused case for each unmet objective. Opening a checkpoint
      // must not spend every alternate or retest objectives already evidenced.
      ids=(status?.objectives||[]).filter(row=>!row.met&&route.objectiveIds.includes(row.objectiveId)).map(row=>(row.freshCheckIds||[]).find(id=>route.checkIds.includes(id))).filter(Boolean);
      if(!ids.length){if(!campaign(api,route))api.notice(status?.status==='checksExhausted'?'Your saved successes are kept. These objectives need additional fresh reviewed checks; known cases remain available as practice.':'Checkpoint evidence is unavailable. Your saved history is kept; field guides and practice remain open.');return;}
    }
    if(kind==='trainer'&&ids.length>4)ids=ids.filter((_,i)=>i%2===(m.index||0));
    if(kind==='grunt'){const misses=new Set(root.AtlasQuest?.openMissIds?.(route.session,route.course)||[]);const held=route.practiceIds.filter(id=>misses.has(id));ids=held.length?held:route.practiceIds.slice(0,3);}
    ids=validPool(route,ids);if(!ids.length){api.notice('This encounter is waiting for reviewed '+(kind==='warden'?'checkpoint':'practice')+' questions. The route and field guides remain open.');return;}
    const isCheck=kind==='warden',name=kind==='grunt'?'Team Entropy scout':names[route.course][isCheck?2:m.index||0],id=route.id+':'+kind+':'+(m.index||0)+':'+Date.now();
    const companion=route.creature||rescue[route.id];
    const spec={id,routeId:route.id,kind:'realms-'+kind,assessment:isCheck?'check':'practice',pool:ids.slice(),items:ids.slice(),name,sub:route.title+(isCheck?' | route checkpoint':' | practice encounter'),creature:companion,stage:isCheck?1:0,hp:Math.max(1,Math.min(isCheck?ids.length:3,ids.length)),lives:Math.max(3,ids.length),xp:isCheck?18:6,
      intro:isCheck?'Test this route with its separate checkpoint questions. The result covers these objectives, not the full DAT.':kind==='grunt'?'Team Entropy has scrambled the field notes. Recover the ideas through practice.':'A short practice duel. Use the field guides whenever you need to learn or review.',
      win:isCheck?route.title+' is restored. Your field notes still track practice and later recall separately.':'Good practice. The route is always here for another attempt.',lose:'Your companions and progress are safe. Rest, revisit a guide, and try again.'};
    if(kind==='grunt')spec.sprite='entropy';
    api.after(spec,result=>{if(!result?.won)return;
      if(isCheck){if(!restoreRoute(route,api)){api.setNotice?.('Your saved correct checks are kept. Revisit the remaining objectives, then try their next fresh case.');api.refresh?.();return;}}
      else if(kind==='trainer')updateRegion(route.course,(r,q)=>{const old=obj(r.trainers[e.id]);r.trainers[e.id]={...old,beaten:true,wins:Math.max(0,+old.wins||0)+1};if(!old.beaten)q.coins=Math.max(0,+q.coins||0)+3;});
      api.refresh?.();});
    if(kind==='grunt')updateRegion(route.course,r=>{const old=obj(r.pages[route.session]);r.pages[route.session]={...old,entropyVisited:true};});
    api.openQuest({course:route.course,special:spec,...(isCheck?{onReturn:()=>{if(root.AceDATMastery?.routeStatus?.(route.id)?.restoreAllowed!==true)campaign(api,route);}}:{})});
  }
  function wild(e,api){const m=eventMeta(e);if(!m.route||!validPool(m.route,m.route.practiceIds).length){api.notice('The tall grass is quiet while its practice content is reviewed.');return;}api.openQuest({course:m.route.course,wild:m.route.session});}
  const actions={'realms:atlas':atlas,'realms:learning':learning,'realms:station':station,'realms:center':center,'realms:return':groveAction,'realms:planned':planned,'realms:trainer':(e,api)=>battle(e,api,'trainer'),'realms:warden':(e,api)=>battle(e,api,'warden'),'realms:grunt':(e,api)=>battle(e,api,'grunt'),'realms:wild':wild};
  function travelPlaces(realm){const town='realm-'+realm.worldId+'-town';return [{zone:CROSS,name:'DAT Crossroads',sub:'All six worlds',group:'Travel',charted:true,reached:true},{zone:GROVE,name:'Return Grove',sub:'Rest and cross-realm recall',group:'Travel',charted:true,reached:true},{zone:town,name:townsNamed[realm.course],sub:realm.title+' | town',group:realm.title,charted:true,reached:true},...realm.routes.map(raw=>routes.get(raw.id)).filter(Boolean).map(r=>({zone:r.id,name:r.title,sub:'Route | '+r.objectiveIds.length+' learning objectives',group:realm.title,charted:true,reached:true,status:pageOf(r).warden?'Checkpoint cleared':pageOf(r).storyRestored?'Story saved · check needed':''}))];}
  function discoveryDone(route){return route.objectiveIds.length>0&&route.objectiveIds.every(id=>root.AceDATDiscovery?.activityForObjective(id)&&root.AceDATDiscovery.completedForObjective(id));}
  function stepsFor(r){const restored=()=>!!pageOf(r).warden,base={zone:r.id,routeId:r.id,session:r.session,routeRestored:restored};return [
    {...base,kind:'station',target:r.id+':station',targetLabel:stationName(r),label:'Explore '+r.title,why:'Learn at the visual station, or continue exploring.',done:()=>restored()||discoveryDone(r)},
    ...[0,1].map(i=>({...base,kind:'trainer',target:r.id+':trainer:'+i,targetLabel:names[r.course][i],label:'Practice with '+names[r.course][i],why:'A short practice duel. Field guides and free rest stay available.',done:()=>restored()||trainerDone(r.course,r.id+':trainer:'+i)})),
    {...base,kind:'entropy',target:r.id+':entropy',targetLabel:'Team Entropy scout',label:'Meet Team Entropy',why:'An optional story practice encounter. You can challenge the Warden directly.',optional:true,done:()=>restored()||!!pageOf(r).entropyVisited},
    {...base,kind:'warden',target:r.id+':warden',targetLabel:names[r.course][2],label:'Challenge '+names[r.course][2],why:'A separate route checkpoint. No trainer, station, catch or glint gate is required.',done:restored}
  ];}
  function pathFor(realm){return realm.routes.flatMap(raw=>stepsFor(routes.get(raw.id)));}
  function routeZone(route){return {info:{name:route.title,subtitle:route.realmTitle+' | chapter '+route.session,session:route.session,music:'route'},theme:{...A.themes[themeKey(route)],name:route.title,area:route.realmTitle},town:route.town,build:k=>routeMap(k,route)};}
  // Preserve the original fourteen indices, then append the grove and new chapters.
  // Descriptor order may grow without moving an existing opening map's save index.
  for(const realm of ordered){const town='realm-'+realm.worldId+'-town',zones={};
    if(realm.course==='BIO')zones[CROSS]={info:{name:'DAT Crossroads',subtitle:'Six realms, one adventure',music:'town'},theme:{...A.themes.camp,name:'DAT Crossroads',area:'DAT Crossroads'},town:CROSS,build:crossing};
    zones[town]={info:{name:townsNamed[realm.course],subtitle:realm.title+' | a place to rest and explore',music:'town'},theme:{...A.themes[realm.worldId],name:townsNamed[realm.course],area:realm.title},town,build:k=>townMap(k,realm)};
    for(const id of baseRoutes){const route=routes.get(id);if(route?.course===realm.course)zones[id]=routeZone(route);}
    R.extend({course:realm.course,zones,drawers:A.drawers,tiles:A.tiles,actions,chapters:[{n:1,town,name:realm.title,gym:town}],courseDef:{entry:realm.course==='BIO'?CROSS:town,surf:()=>false,wildOnly:null,places:()=>travelPlaces(realm),path:()=>pathFor(realm)}});
  }
  R.extend({course:'BIO',zones:{[GROVE]:{info:{name:'Return Grove',subtitle:'Earlier ideas, growing connections',music:'town'},theme:{...A.themes.grove,name:'Return Grove',area:'The six DAT realms'},town:CROSS,build:returnGrove}}});
  // These six released indices are already in saves. New BIO routes must not
  // move a GC/OC/PAT/RC/QR map by appearing earlier in the realm array.
  const releasedRoutes=['bio-enzyme-workshop','gc-mole-foundry','oc-conjugate-court','pat-angle-observatory','rc-evidence-archive','qr-percent-market'];
  for(const id of releasedRoutes){const route=routes.get(id);if(route)R.extend({course:route.course,zones:{[id]:routeZone(route)}});}
  const appended=[...routes.values()].filter(route=>!baseRoutes.includes(route.id)&&!releasedRoutes.includes(route.id)).sort((a,b)=>(a.registrationOrder??Infinity)-(b.registrationOrder??Infinity));
  for(const route of appended)R.extend({course:route.course,zones:{[route.id]:routeZone(route)}});
  function townMap(k,realm){return town(k,realm);}
  root.AceDATWorlds={routes,towns,metaById,crossroads:CROSS,returnGroveId:GROVE,routeMap,townMap,crossing,returnGrove,actions,travelPlaces,themeKey,pathVariant,objectiveName,lessonsPerPage:LESSONS_PER_PAGE};
})(typeof window!=='undefined'?window:globalThis);
