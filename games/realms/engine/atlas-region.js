/* Region registry (window.AtlasRegion), forked lean from the Living Atlas.
 * A world file (bio/region-bio.js) registers its zones with extend({course, zones, puzzles, drawers, tiles,
 * actions, links, courseDef}); the overworld (adventure-world.js) builds a zone through build(kit, id) and draws
 * its objects through draw(). Zone order is part of the save format: a zone is saved as page PAGE_BASE + its
 * index in ZONES, and extend() only ever APPENDS zones.
 * Also here: the helpers handed to builders (H), the warden's route checklist, the quest objective marker,
 * minimap and edge arrow, and a generic sort-and-route puzzle runner (mountRounds) for world stations.
 * Progress never lives in the world save: it lives in the quest store (ace_dat_realms_mnemon_v1_quest_v1), each course
 * under courses.<COURSE>.region (pages, badges, fieldMoves, trainers, gym, board, flags).
 * Plain ASCII.
 */
(function(root){
  'use strict';
  const QUEST='ace_dat_realms_mnemon_v1_quest_v1';
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  // Zone order is part of the save format: a region zone is saved as page PAGE_BASE + its index. Append only.
  const ZONES=[],PAGE_BASE=100,ROUTES=[],TOWN={},CHAPTER={},INFO={},THEMES={};
  // A route fact from the course pack's field notes (dex.<n>.facts[i].t); '' when there is none.
  function fact(n,i,course){try{const P=root.AtlasCoursePacks&&root.AtlasCoursePacks[String(course||'BIO').toUpperCase()];const f=P&&P.dex&&P.dex[n]&&P.dex[n].facts&&P.dex[n].facts[i];return f&&typeof f.t==='string'?f.t:'';}catch(e){return '';}}

  function readQuest(){try{const v=JSON.parse(localStorage.getItem(QUEST)||'{}');return v&&typeof v==='object'&&!Array.isArray(v)?v:{};}catch(e){return {};}}
  // Read-modify-write that keeps every other quest field untouched.
  function updateQuest(fn){const s=readQuest();s.pages=s.pages&&typeof s.pages==='object'&&!Array.isArray(s.pages)?s.pages:{};s.bag=s.bag&&typeof s.bag==='object'&&!Array.isArray(s.bag)?s.bag:{};s.badges=s.badges&&typeof s.badges==='object'&&!Array.isArray(s.badges)?s.badges:{};s.coins=Math.max(0,Math.floor(+s.coins||0));for(const k of ['potion','greatCapsule','escapeRope'])s.bag[k]=Math.max(0,Math.floor(+s.bag[k]||0));const out=fn(s);try{localStorage.setItem(QUEST,JSON.stringify(s));}catch(e){}snapV=null;return out;}
  function page(n){const p=readQuest().pages?.[n];return p&&typeof p==='object'?p:{};}
  // Drawing runs every frame: read the quest store at most a few times a second there.
  // Perf (10/23): every 700 ms it re-reads the stored string but re-parses it only when it changed (a large save cost
  // a full parse twice a second while walking).
  let snapV=null,snapT=0,snapRaw=null;
  function snap(){const t=Date.now();if(!snapV||t-snapT>700){let raw=null;try{raw=localStorage.getItem(QUEST);}catch(e){}
      if(!snapV||raw!==snapRaw){snapRaw=raw;try{const v=JSON.parse(raw||'{}');snapV=v&&typeof v==='object'&&!Array.isArray(v)?v:{};}catch(e){snapV={};}}snapT=t;}return snapV;}
  function pageSnap(n){const p=snap().pages?.[n];return p&&typeof p==='object'?p:{};}
  function openMisses(n,course){try{return root.AtlasQuest?.openMissIds?.(n,course)?.length||0;}catch(e){return 0;}}
  const plainObj=v=>v&&typeof v==='object'&&!Array.isArray(v)?v:{};
  function trainerRecord(id){const t=plainObj(readQuest().trainers)[id];return t&&typeof t==='object'?t:null;}
  function trainerBeaten(id){return !!trainerRecord(id)?.beaten;}
  // Trainers remember you: marked only on a win, reported by the quest onSpecial callback.
  function markTrainer(id){const now=new Date().toISOString();return updateQuest(q=>{q.trainers=plainObj(q.trainers);const t=plainObj(q.trainers[id]);q.trainers[id]={...t,beaten:true,at:t.at||now,wins:Math.max(0,Math.floor(+t.wins||0))+1,last:now};return q.trainers[id];});}

  // ---------- maps ----------
  function place(k,map,x,y,props,block=true){const o={kind:'region',x:x+.5,y:y+.5,...props};map.objects.push(o);if(block)map.blocks.add(k.tileKey(x,y));return o;}
  function decor(k,map,x,y,props,block=true){map.objects.push({kind:'decor',x:x+.5,y:y+.5,...props});if(block)map.blocks.add(k.tileKey(x,y));}
  function frame(k,map){for(let y=0;y<map.h;y++)for(let x=0;x<map.w;x++)if(x<2||y<2||x>=map.w-2||y>=map.h-2)k.setTile(map,x,y,4);}
  function sprinkleTrees(k,map,every,salt){const keep=new Set();for(const o of map.objects)for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)keep.add(k.tileKey(Math.floor(o.x)+dx,Math.floor(o.y)+dy));for(const b of map.buildings)for(let dx=-1;dx<=b.w;dx++)keep.add(k.tileKey(b.x+dx,b.y+b.h));
    for(let y=2;y<map.h-2;y++)for(let x=2;x<map.w-2;x++){if(map.tiles[y*map.w+x]!==0||map.blocks.has(k.tileKey(x,y))||keep.has(k.tileKey(x,y)))continue;const h=Math.abs(((x*73856093)^(y*19349663)^(salt*83492791))|0)%997;if(h%every===0)k.tree(map,x,y);}}
  function walledBox(k,map,x,y,w,h,floor,gates){for(let j=y;j<y+h;j++)for(let i=x;i<x+w;i++)k.setTile(map,i,j,(i===x||j===y||i===x+w-1||j===y+h-1)?4:floor);for(const [gx,gy] of gates)k.setTile(map,gx,gy,1);}
  function overlay(map,x,y,type){map.overlay=map.overlay||new Map();const key=x+','+y,prev=map.overlay.get(key);map.overlay.set(key,prev&&prev!==type&&(prev==='h'||prev==='v'||prev==='x')&&(type==='h'||type==='v')?'x':type);}

  const BUILDERS={};
  function build(kit,id){const zid=BUILDERS[id]?id:ZONES[0],fn=BUILDERS[zid];if(!fn)throw new Error('No world zones are registered.');const map=fn(kit);
    for(const L of (LINKS[zid]||[])){try{if(!L.needs||hasMove(L.needs))kit.portal(map,L.x,L.y,L.label,L.target);}catch(e){}}
    for(const f of BUILD_HOOKS){try{f(map,zid,kit,H);}catch(e){}}
    map.regionId=zid;map.theme=THEMES[zid];map.name=INFO[zid].name;map.subtitle=INFO[zid].subtitle;map.music=INFO[zid].music;return map;}
  function zoneFromPage(pageNo){const i=Math.floor(Number(pageNo))-PAGE_BASE;return ZONES[i]||null;}

  // ---------- art: the shared sprites (a world adds its own through extend({drawers})) ----------
  function draw(ctx,o,x,y,h){
    const r=h.rect,near=h.near;
    switch(o.sprite){

      case 'sign':r(x-2,y-6,4,16,'#8a6a4a');r(x-13,y-20,26,16,'#c9a878');r(x-11,y-18,22,12,'#e8d3a6');r(x-8,y-15,16,2,'#8a6a4a');r(x-8,y-11,12,2,'#8a6a4a');if(near(o)<3.5)h.label(o.label,x,y-28);return true;
      case 'item':if(h.collected(o))return true;if(h.reduced||Math.sin(h.time/500+o.x)>.55){r(x-1,y-6,2,12,'#fff6c8');r(x-6,y-1,12,2,'#fff6c8');r(x-2,y-2,4,4,'#ffffff');}else r(x-1,y-1,3,3,'#fff1b0');return true;
      case 'trainer':h.person(x,y,o.color||'#8a8a8a','#4a3a30');if(near(o)<4.5)h.label(o.label,x,y-40,'#234c4e',true);return true;
      case 'warden':{h.person(x,y,o.restored?'#e8c766':'#5c5a6e','#2c2a3a');r(x-10,y-30,20,4,o.restored?'#f4d77a':'#8a86a0');r(x-2,y-34,4,4,o.restored?'#fff2b2':'#b0acc4');r(x+8,y-12,3,24,'#7a6a52');r(x+6,y-16,7,5,o.restored?'#f4d77a':'#9c98b4');if(near(o)<5.5)h.label(o.label+(o.restored?' | restored':''),x,y-44,'#3a3450',true,12);return true;}
      case 'entropy':if(root.AtlasQuest?.drawSprite){r(x-11,y+8,22,4,'rgba(20,20,20,.25)');root.AtlasQuest.drawSprite(ctx,'entropy',x,y-6,2.3);}else{h.person(x,y,'#3d4548','#1f2426');r(x-7,y-4,14,6,'#c8403a');}if(near(o)<5.5)h.label('Team Entropy',x,y-30,'#7a1f1a',true);return true;
      case 'stall':r(x-15,y-4,30,16,'#8a6a4a');r(x-13,y-2,26,8,'#e9d9b4');r(x-17,y-18,34,10,o.color||'#c96a4a');for(let i=0;i<4;i++)r(x-17+i*9,y-18,4,10,'#f7ecd2');r(x-17,y-9,34,3,'#7a4a36');r(x-10,y,5,4,'#e0a64a');r(x-3,y,5,4,'#9cc070');r(x+4,y,5,4,'#d97a6a');return true;
      case 'crate':r(x-10,y-8,20,17,'#9a7048');r(x-8,y-6,16,13,'#c79a62');r(x-8,y-1,16,2,'#9a7048');r(x-1,y-6,2,13,'#9a7048');return true;
      case 'lamp':r(x-2,y-22,4,32,'#4a5a5a');r(x-6,y-28,12,8,'#f4d784');r(x-7,y-30,14,3,'#4a5a5a');return true;
      case 'fountain':r(x-16,y-6,32,16,'#b8c4c0');r(x-13,y-4,26,10,'#6fb4c8');r(x-3,y-18,6,14,'#b8c4c0');r(x-1,y-24+(h.reduced?0:Math.sin(h.time/250)*2),2,6,'#bfe6f0');return true;
      case 'boat':r(x-20,y-2,40,10,'#8a5a3c');r(x-16,y-6,32,5,'#b8845a');r(x-1,y-30,2,26,'#6a4a2a');r(x+1,y-28,14,18,'#f3ead2');return true;
      case 'tag':h.label(o.text,x,y,'#1f4a50',false,10);return true;
      case 'arch':r(x-26,y-30,6,40,'#8f9a92');r(x+20,y-30,6,40,'#8f9a92');r(x-28,y-36,56,8,'#a2b1a9');r(x-20,y-28,40,4,'#f3ead2');return true;
      case 'buoy':{const b=h.reduced?0:Math.sin(h.time/420+o.x)*2;r(x-6,y-6+b,12,12,'#e0503a');r(x-6,y-2+b,12,4,'#f3ead2');r(x-1,y-16+b,2,10,'#3a3450');r(x-8,y+5+b,16,2,'#bfe6f0');return true;}
      case 'palm':r(x-2,y-24,5,34,'#8a6a4a');r(x-16,y-30,14,6,'#4f9a5a');r(x+2,y-30,14,6,'#4f9a5a');r(x-8,y-36,16,7,'#62b06a');r(x-12,y-26,6,4,'#3f7f4a');r(x+7,y-26,6,4,'#3f7f4a');return true;
      case 'grunt':if(root.AtlasQuest?.drawSprite){r(x-11,y+8,22,4,'rgba(20,20,20,.25)');root.AtlasQuest.drawSprite(ctx,'entropy',x,y-6,2.3);}else{h.person(x,y,'#3d4548','#1f2426');r(x-7,y-4,14,6,'#c8403a');}if(near(o)<5.5)h.label('Team Entropy',x,y-30,'#7a1f1a',true);return true;
    }
    if(DRAWERS[o.sprite])return DRAWERS[o.sprite](ctx,o,x,y,h,H)!==false;
    return false;
  }
  // Tile overlays (drawn by the world after the base tile): a chasm and its bridge, plus any world tiles.
  function drawTile(ctx,type,px,py,h){
    if(TILE_DRAWERS[type])return TILE_DRAWERS[type](ctx,type,px,py,h,H)!==false;
    const r=h.rect,T=32;
    if(type==='chasm'){r(px,py,T,T,'#2b303c');r(px,py,T,3,'#4a5262');r(px+((px/T)%3)*9,py+12,6,2,'#3a4150');r(px+20,py+24,5,2,'#3a4150');return true;}
    if(type==='bridge'){r(px,py,T,T,'#2b303c');r(px+2,py,3,T,'#7a5a3a');r(px+T-5,py,3,T,'#7a5a3a');for(let j=0;j<4;j++)r(px+3,py+j*8+1,T-6,6,j%2?'#b88a5a':'#c89a66');return true;}
    return false;
  }
  // The player crossing water with Osmose: a membrane bubble under the rider.
  function drawSurfer(ctx,x,y,h,drawRider){
    const r=h.rect,w=h.reduced?0:Math.sin(h.time/300)*2;
    r(x-22,y+8+w,44,14,'rgba(190,240,220,.55)');r(x-24,y+12+w,48,6,'rgba(120,200,180,.6)');r(x-18,y+6+w,36,3,'rgba(255,255,255,.55)');
    r(x-30,y+20,10,2,'#bfe6f0');r(x+20,y+20,10,2,'#bfe6f0');
    drawRider(x,y-14+w);
  }

  // ---------- station puzzles: sort and route rounds (no quiz framing) ----------
  // cfg: {eyebrow, title, intro, finishText, finishButton, back, note?, rounds:[{title, intro, check, opts, pick, pool:[{label, sub?, key, why, opts?}]}]}
  // Each round deals pick rows from its pool; every row needs the right chip; a wrong row shows its key and why.
  const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
  function dealRound(R){const rows=shuffle(R.pool||[]).slice(0,Math.max(1,Math.min(+R.pick||4,(R.pool||[]).length))).map(x=>({...x,opts:Array.isArray(x.opts)&&x.opts.length?x.opts.slice():(R.opts||[]).slice()}));return root.AtlasOptionOrder&&root.AtlasOptionOrder.mixRows?root.AtlasOptionOrder.mixRows(rows):rows;}
  function mountRounds(host,cfg,done,isDestroyed,onClose){
    let ri=0,rows=dealRound(cfg.rounds[0]),pick={},graded=null;
    const render=()=>{const R=cfg.rounds[ri],last=ri===cfg.rounds.length-1;host.innerHTML=`<p class="eyebrow">${esc(cfg.eyebrow||'')}${cfg.rounds.length>1?' | ROUND '+(ri+1)+' OF '+cfg.rounds.length:''}</p><h3 class="ch2-round">${esc(R.title||cfg.title||'')}</h3><p class="panel-intro">${esc(R.intro||cfg.intro||'')}</p><div class="ch1-rows">${rows.map((row,i)=>`<div class="ch1-row ${graded?(graded[i]?'ok':'no'):''}"><div><strong>${esc(row.label)}</strong>${row.sub?`<small>${esc(row.sub)}</small>`:''}</div><div class="ch1-chips">${row.opts.map((o,j)=>`<button type="button" data-row="${i}" data-opt="${j}" aria-pressed="${pick[i]===o}" ${graded?'disabled':''}>${esc(o)}</button>`).join('')}</div>${graded?`<p class="ch1-why">${graded[i]?'Right.':'Not quite: '+esc(row.key)+'.'} ${esc(row.why||'')}</p>`:''}</div>`).join('')}</div><div class="backup-actions">${graded?(graded.every(Boolean)?(last?`<button class="primary" data-go="finish">${esc(cfg.finishButton||'Finish')}</button>`:'<button class="primary" data-go="next">Next round</button>'):'<button class="primary" data-go="retry">Try this round again</button>'):`<button class="primary" data-go="check" ${Object.keys(pick).length===rows.length?'':'disabled'}>${esc(R.check||'Check')}</button>`}</div>${cfg.note?`<p class="panel-note">${esc(cfg.note)}</p>`:''}`;};
    host.addEventListener('click',e=>{const b=e.target.closest('button');if(!b||isDestroyed())return;if(b.dataset.row!=null){const i=+b.dataset.row;pick[i]=rows[i].opts[+b.dataset.opt];render();return;}const go=b.dataset.go;
      if(go==='check'){graded=rows.map((row,i)=>pick[i]===row.key);render();}
      else if(go==='retry'){rows=dealRound(cfg.rounds[ri]);pick={};graded=null;render();}
      else if(go==='next'){ri++;rows=dealRound(cfg.rounds[ri]);pick={};graded=null;render();}
      else if(go==='finish'){done();host.innerHTML=`<p class="panel-intro">${esc(cfg.finishText||'Solved.')}</p><button class="primary" data-go="close">${esc(cfg.back||'Back')}</button>`;}
      else if(go==='close')onClose?.();});
    render();
  }
  function mountPuzzle(host,id,opts={}){
    let destroyed=false;const done=()=>{if(!destroyed)opts.onSolved?.(id);};
    if(PUZZLE_MOUNTS[id]){const api=PUZZLE_MOUNTS[id](host,{...opts,done,id},H)||{};return {destroy(){destroyed=true;api.destroy?.();}};}
    host.innerHTML='<p class="panel-intro">This station is not set up yet.</p>';
    return {destroy(){destroyed=true;host.replaceChildren();}};
  }
  const PUZZLES={};

  // ---------- registry ----------
  // A world file calls AtlasRegion.extend(). Zone order is the save format: extend() only ever APPENDS zones,
  // and world files load in a fixed order, so a zone keeps its page number forever.
  const DRAWERS={},TILE_DRAWERS={},PUZZLE_MOUNTS={},ACTIONS={},LINKS={};
  const CHAPTERS={};
  // Field moves belong to the trainer's team, never to the creature in front (AtlasFieldMoves when loaded, else a
  // flag in the quest store).
  function hasMove(name){const M=root.AtlasFieldMoves;if(M&&M.known)return M.known(name);return plainObj(readQuest().fieldMoves)[name]===true;}
  function grantMove(name,from){const M=root.AtlasFieldMoves;if(M&&M.grant)return M.grant(name,from);return updateQuest(q=>{q.fieldMoves=plainObj(q.fieldMoves);if(q.fieldMoves[name]===true)return false;q.fieldMoves[name]=true;q.fieldMoves[name+'At']=new Date().toISOString();return true;});}
  // Hooks run on every zone build, after its links.
  const BUILD_HOOKS=[];
  function onBuild(fn){if(typeof fn==='function')BUILD_HOOKS.push(fn);}
  // Every zone belongs to the course that registered it. There is no default course.
  const ZONE_COURSE={},COURSE_DEFS={};
  const courseOf=id=>ZONE_COURSE[id]||null;
  function entryFor(course){const d=COURSE_DEFS[String(course||'').toUpperCase()];return d&&ZONES.includes(d.entry)?d.entry:null;}
  function surfFor(id){const c=courseOf(id),d=c&&COURSE_DEFS[c];try{return !!(d&&d.surf&&d.surf());}catch(e){return false;}}
  function extend(def){
    if(!def||typeof def!=='object')return;
    const course=String(def.course||'').toUpperCase();if(!course)return;
    for(const [id,z] of Object.entries(def.zones||{})){
      if(!ZONES.includes(id))ZONES.push(id);INFO[id]=z.info;THEMES[id]=z.theme;TOWN[id]=z.town||id;BUILDERS[id]=kit=>z.build(kit,H);ZONE_COURSE[id]=course;
      if(z.info&&z.info.session&&!ROUTES.includes(id))ROUTES.push(id);}
    COURSE_DEFS[course]={...(COURSE_DEFS[course]||{}),...(def.courseDef||{})};
    if(def.chapters)for(const c of def.chapters){CHAPTERS[course+':'+c.n]=c;CHAPTER[c.town]=c.n;}
    for(const [id,pz] of Object.entries(def.puzzles||{})){PUZZLES[id]={session:pz.session,page:pz.page,flag:pz.flag||'puzzle',title:pz.title};if(pz.mount)PUZZLE_MOUNTS[id]=pz.mount;}
    for(const L of (def.links||[])){(LINKS[L.zone]=LINKS[L.zone]||[]).push(L);}
    Object.assign(DRAWERS,def.drawers||{});Object.assign(TILE_DRAWERS,def.tiles||{});Object.assign(ACTIONS,def.actions||{});
  }
  // Helpers handed to world builders, drawers and puzzles.
  const H={place,decor,frame,sprinkleTrees,walledBox,overlay,fact,page,pageSnap,snap,readQuest,updateQuest,esc,plainObj,hasMove,grantMove,
    trainerBeaten,markTrainer,openMisses,mountRounds,shuffle,INFO,THEMES,TOWN,CHAPTERS,PAGE_BASE};

  // ---------- the warden's route checklist (10/07, every world) ----------
  // A route's warden waits until the route is done: every trainer beaten, every puzzle solved, every signpost
  // read, every glint found, and no Team Entropy grunt left holding this route's misses
  // (a grunt appears only while the route holds open misses).
  // objs: the zone's objects (the world's zoneObjects()); opts: {C, n, zoneId, seen(id), known(move)}.
  // Objects behind a field move the team does not know yet, optional ones and fog are not on the list.
  // Forward-only: a warden already beaten (its object says restored) is never locked again.
  function wardenChecklist(objs,opts){const obj=plainObj;opts=opts||{};const q=readQuest(),C=String(opts.C||'').toUpperCase(),n=+opts.n||0,seen=opts.seen||(()=>false),known=opts.known||(m=>hasMove(m));
    const kind=o=>o.action==='custom'?String(o.handler||'').split(':').pop():o.action;
    const reach=o=>!o.optional&&!(o.gate&&typeof o.gate==='string'&&!/^(league|badge)/.test(o.gate)&&!known(o.gate));
    const list=(objs||[]).filter(o=>o&&reach(o));const warden=list.find(o=>kind(o)==='warden');
    const pagesOf=c=>obj(obj(obj(obj(q.courses)[c]).region).pages);
    const items=[];
    for(const o of list.filter(o=>kind(o)==='trainer'))items.push({key:'trainer:'+(o.id||o.name),label:'Trainer: '+(o.name||o.label||'trainer'),done:!!o.beaten});
    for(const o of list.filter(o=>kind(o)==='puzzle')){const meta=PUZZLES[o.puzzle]||{},pg=obj(pagesOf(C)[meta.page!=null?meta.page:(meta.session||n)]);items.push({key:'puzzle:'+o.puzzle,label:'Puzzle: '+(meta.title||o.label||'route puzzle'),done:!!pg[meta.flag||'puzzle']});}
    const signs=list.filter(o=>kind(o)==='sign'),sRead=signs.filter(o=>seen('sign:'+opts.zoneId+':'+o.x+','+o.y)).length;
    if(signs.length)items.push({key:'signs',label:'Signposts read: '+sRead+' of '+signs.length,done:sRead===signs.length});
    const glints=list.filter(o=>kind(o)==='item'&&o.id),gFound=glints.filter(o=>seen(o.id)).length;
    if(glints.length)items.push({key:'glints',label:'Glints found: '+gFound+' of '+glints.length,done:gFound===glints.length});
    const grunt=list.find(o=>kind(o)==='grunt');items.push({key:'grunt',label:grunt?'Team Entropy grunt: still holding your misses from this page':'Team Entropy grunt: no misses held',done:!grunt});
    const restored=!!(warden&&warden.restored);
    // todo (10/18): the open things themselves, with their map spots, so the game can walk the player to the next one.
    const todo=[];const at=(o,label,kind2)=>todo.push({x:o.x,y:o.y,label,kind:kind2});
    for(const o of list.filter(o=>kind(o)==='trainer'&&!o.beaten))at(o,'Trainer: '+(o.name||o.label||'trainer'),'trainer');
    for(const o of list.filter(o=>kind(o)==='puzzle')){const meta=PUZZLES[o.puzzle]||{},pg=obj(pagesOf(C)[meta.page!=null?meta.page:(meta.session||n)]);if(!pg[meta.flag||'puzzle'])at(o,'Puzzle: '+(meta.title||o.label||'route puzzle'),'puzzle');}
    for(const o of signs)if(!seen('sign:'+opts.zoneId+':'+o.x+','+o.y))at(o,'Signpost','sign');
    for(const o of glints)if(!seen(o.id))at(o,'Glint','item');
    if(grunt)at(grunt,'Team Entropy grunt','grunt');
    return {C,n,items,todo,ready:restored||items.every(x=>x.done),restored};}
  // ---------- quest objective (10/21, every world) ----------
  // setObjective(zone, x, y, label): a world names the next thing to do in a zone (tile x, y). It is drawn as a
  // pulsing marker on the map, a gold dot on the minimap, an edge arrow on the HUD when off screen, and a
  // "Next: <label>" line under the place name. setObjective(zone, null) clears it. When a zone has no objective
  // set, the default is the next uncleared thing on screen: a trainer not yet beaten, a station not cleared, the
  // page warden, then the gym, then the path to the next zone of the same world. Objectives live in memory only.
  const OBJECTIVES={};let objectiveRev=0;
  function setObjective(zone,x,y,label){zone=String(zone||'');if(!zone)return false;if(x==null||!Number.isFinite(+x)||!Number.isFinite(+y)){delete OBJECTIVES[zone];}else OBJECTIVES[zone]={zone,x:+x,y:+y,label:String(label||'').slice(0,80)};objectiveRev++;return true;}
  function clearObjective(zone){return setObjective(zone,null);}
  function objectiveSet(zone){return OBJECTIVES[String(zone||'')]||null;}
  const OBJ_RANK=[[/:trainer$/,o=>!o.beaten,o=>'Beat '+(o.name||o.label||'the trainer')],[/:(station|puzzle)$/,o=>!o.done&&!o.cleared,o=>'Solve the '+(o.label||'station')],[/:warden$/,o=>!o.restored,o=>'Challenge '+(o.name||o.label||'the warden')],[/:grunt$/,o=>true,o=>'Take your misses back from the grunt'],[/:gym$/,o=>!o.done&&!/not yet charted/i.test(o.title||''),o=>'Take on '+(String(o.title||o.label||'the gym').split('|')[0].trim())]];
  function defaultObjective(map,player){if(!map||!Array.isArray(map.objects))return null;const px=player?player.x:map.spawn?.x||0,py=player?player.y:map.spawn?.y||0,d=o=>Math.hypot(o.x-px,o.y-py);
    for(const [rx,want,lab] of OBJ_RANK){const c=map.objects.filter(o=>o&&o.handler&&rx.test(o.handler)&&!o.optional&&!o.blocker&&(()=>{try{return want(o);}catch(e){return false;}})());if(c.length){const o=c.sort((a,b)=>d(a)-d(b))[0];return {zone:map.regionId,x:Math.floor(o.x),y:Math.floor(o.y),label:lab(o),auto:true};}}
    const here=ZONES.indexOf(map.regionId),course=courseOf(map.regionId);let best=null;
    for(const o of map.objects){if(!o||o.kind!=='portal'||!o.target||o.target.kind!=='region')continue;const i=ZONES.indexOf(o.target.region);if(i<=here||courseOf(o.target.region)!==course)continue;if(!best||i<best.i)best={i,o};}
    if(best){const nm=INFO[best.o.target.region]?.name||best.o.label||'the next area';return {zone:map.regionId,x:Math.floor(best.o.x),y:Math.floor(best.o.y),label:'Head to '+nm,auto:true};}
    return null;}
  let objCache={key:'',at:0,v:null};
  function objectiveFor(map,player){if(!map||!map.regionId)return null;const set=OBJECTIVES[map.regionId];if(set)return set;const t=Date.now(),key=map.regionId+'|'+objectiveRev+'|'+map.objects.length;if(objCache.key===key&&t-objCache.at<600)return objCache.v;objCache={key,at:t,v:defaultObjective(map,player)};return objCache.v;}
  // Drawing hooks, called by adventure-world.js. inWorld runs inside the camera transform (pixels = tile * T);
  // onScreen runs after it (CSS pixels). Both are no-ops outside region zones.
  function drawObjective(ctx,f){try{const o=objectiveFor(f.zone,f.player);if(!o||!f.zone||f.zone.kind!=='region')return;const T=f.T||32,pulse=f.reduced?0:Math.sin(f.time/260)*3,x=(o.x+.5)*T,y=(o.y+.5)*T;
      ctx.save();ctx.globalAlpha=.9;ctx.strokeStyle='#f3c74a';ctx.lineWidth=3;ctx.beginPath();ctx.arc(x,y,14+pulse,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#f3c74a';ctx.beginPath();ctx.moveTo(x,y-26-pulse);ctx.lineTo(x-7,y-38-pulse);ctx.lineTo(x+7,y-38-pulse);ctx.closePath();ctx.fill();ctx.restore();}catch(e){}}
  const MINI={key:'',img:null,force:null},MINI_ON=()=>{if(MINI.force!=null)return MINI.force;try{return localStorage.getItem('ace_dat_realms_mnemon_v1_minimap_v1')!=='0';}catch(e){return true;}};
  // setMinimapForce(true | false | null): a one-draw override for hud-calm.js (the phone hides the minimap without
  // touching the stored setting); null hands control back to the setting.
  function setMinimapForce(v){MINI.force=v==null?null:!!v;}
  function setMinimap(on){try{localStorage.setItem('ace_dat_realms_mnemon_v1_minimap_v1',on?'1':'0');}catch(e){}}
  function miniImage(map){const key=map.id+'|'+map.w+'x'+map.h+'|'+map.objects.length;if(MINI.key===key&&MINI.img)return MINI.img;const D=root.document;if(!D||!D.createElement)return null;const c=D.createElement('canvas'),s=2;c.width=map.w*s;c.height=map.h*s;const g=c.getContext&&c.getContext('2d');if(!g)return null;
    const col={0:'#5d9a74',1:'#e9dcb0',2:'#4f8fbf',3:'#8fb98a',4:'#2f3f3a'};for(let y=0;y<map.h;y++)for(let x=0;x<map.w;x++){const t=map.tiles[y*map.w+x];g.fillStyle=col[t]||'#6fa080';if(map.blocks&&map.blocks.has(x+','+y)&&t!==4)g.fillStyle='#46604f';g.fillRect(x*s,y*s,s,s);}
    for(const o of map.objects){if(o.kind==='portal'){g.fillStyle='#ffffff';g.fillRect(Math.floor(o.x)*s-1,Math.floor(o.y)*s-1,s+2,s+2);}}MINI.key=key;MINI.img=c;return c;}
  function drawHUD(ctx,f){try{const map=f.zone;if(!map||map.kind!=='region')return;const o=objectiveFor(map,f.player),T=f.T||32,W=f.width,Hh=f.height;
      if(MINI_ON()){const img=miniImage(map);if(img){const maxW=Math.min(150,W*.3),k=Math.min(maxW/img.width,110/img.height),w=img.width*k,h=img.height*k,x0=W-w-12,y0=76;ctx.save();ctx.globalAlpha=.88;ctx.fillStyle='#fff5d7';ctx.fillRect(x0-3,y0-3,w+6,h+6);ctx.imageSmoothingEnabled=false;ctx.drawImage(img,x0,y0,w,h);ctx.globalAlpha=1;
        const sx=w/map.w,sy=h/map.h;ctx.fillStyle='#ffffff';ctx.strokeStyle='#203030';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(x0+f.player.x*sx,y0+f.player.y*sy,3,0,Math.PI*2);ctx.fill();ctx.stroke();
        if(o){ctx.fillStyle='#f3c74a';ctx.beginPath();ctx.arc(x0+(o.x+.5)*sx,y0+(o.y+.5)*sy,3.5+(f.reduced?0:Math.sin(f.time/260)),0,Math.PI*2);ctx.fill();ctx.stroke();}ctx.restore();}}
      if(!o)return;const sc=f.scale||1;
      const X=W/2+((o.x+.5)*T-f.camera.x)*sc,Y=Hh/2+((o.y+.5)*T-f.camera.y)*sc,pad=34;if(X>pad&&X<W-pad&&Y>pad+60&&Y<Hh-pad-120)return;
      const ang=Math.atan2(Y-Hh/2,X-W/2),r=Math.min(W/2-pad,(Hh/2-pad-40)),ax=W/2+Math.cos(ang)*r,ay=Hh/2+Math.sin(ang)*r;ctx.save();ctx.translate(ax,ay);ctx.rotate(ang);ctx.fillStyle='#f3c74a';ctx.strokeStyle='#3a2a00';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(16,0);ctx.lineTo(-8,-11);ctx.lineTo(-3,0);ctx.lineTo(-8,11);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();}catch(e){}}
  function objectiveText(map,player){const o=objectiveFor(map,player);return o&&o.label?'Next: '+o.label:'';}
  root.AtlasRegion={setObjective,clearObjective,objectiveSet,objectiveFor,defaultObjective,drawObjective,drawHUD,objectiveText,setMinimap,setMinimapForce,minimapOn:MINI_ON,wardenChecklist,extend,onBuild,H,CHAPTERS,ACTIONS,hasMove,grantMove,ZONES,ROUTES,TOWN,CHAPTER,PAGE_BASE,INFO,THEMES,PUZZLES,build,zoneFromPage,draw,drawTile,drawSurfer,mountPuzzle,mountRounds,readQuest,updateQuest,page,openMisses,fact,
    courseOf,entryFor,surfFor,COURSE_DEFS,trainerBeaten,trainerRecord,markTrainer};
})(typeof window!=='undefined'?window:globalThis);
