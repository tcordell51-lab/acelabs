/* Isolated DAT adaptation of the Mnemon battle engine. Source layout and game controls retained.
 * XP, captures, stars, and damage are game rewards, not mastery or a DAT score prediction.
 * Reviewed practice and explicit checkpoints have separate pools. Coaching/model use records exposure.
 * Offline; local-only DAT storage. Free team rest is always available.
 */
(function(root){
  'use strict';
  // The player name: AtlasTrainer.personalize swaps the token "Trainer" in battle copy for the chosen name.
  const PZ=s=>{try{return root.AtlasTrainer?root.AtlasTrainer.personalize(s):s;}catch(e){return s;}};
  const KEY='ace_dat_realms_mnemon_v1_quest_v1',GYM='ace_dat_realms_mnemon_v1_gym_v1',HIDDEN='ace_dat_realms_mnemon_v1_practice_hidden_v1',MISS='ace_dat_realms_mnemon_v1_missbank_v1';
  const SPACING=20*60000,LETTERS='ABCDE';
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  // Reviewed models are coaching stations. Their predictions never answer a bank item.
  const IX=()=>root.AtlasInteractive&&typeof root.AtlasInteractive.mount==='function'?root.AtlasInteractive:null;
  const IXS=it=>{try{const spec=it&&IX()?.forItem?.(it.id);return spec&&spec.reviewed===true&&spec.mode==='learning-only'?spec:null;}catch(e){return null;}};
  const modelLabel=spec=>spec?.label||IX()?.TYPES?.[spec?.type]?.move||'Explore model';
  let attemptSequence=0;
  const attemptID=()=>root.crypto?.randomUUID?.()||('dat-attempt-'+Date.now().toString(36)+'-'+(++attemptSequence));
  function exposure(it,kind){if(it)root.AtlasSRS?.recordExposure?.(it.id,{objectiveId:it.objectiveId,familyId:it.familyId,sourceId:it.sourceId,sourceVersion:it.sourceVersion,kind,at:Date.now()});}
  function passageHTML(it){const p=it?.passage;if(!p)return '';return '<section class="eq-passage" aria-label="Reading passage" style="max-height:40vh;overflow:auto;border:1px solid currentColor;padding:12px;margin:12px 0"><h4>'+esc(p.title)+'</h4>'+p.paragraphs.map((t,i)=>'<p><b>'+(i+1)+'.</b> '+esc(t)+'</p>').join('')+'</section>';}
  function optionVisualHTML(it,o){return it.optionVisuals?.[o]?'<img src="'+esc(it.optionVisuals[o])+'" alt="'+esc(it.optionVisualAlts?.[o]||('Answer diagram '+LETTERS[o]))+'" style="display:block;max-width:100%;max-height:180px" loading="lazy">':'';}


  const readJSON=(k,f)=>{try{const v=JSON.parse(localStorage.getItem(k)||'null');return v==null?f:v;}catch(e){return f;}};
  const writeJSON=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}};
  function store(){const raw=readJSON(KEY,{}),s=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw:{},obj=v=>v&&typeof v==='object'&&!Array.isArray(v)?v:{};
    // Keep every field, including Chapter 1 coins, bag, pages and badges, so a save never drops them.
    const bag=obj(s.bag);return {...s,namespace:'ace-dat-realms-mnemon-v1',version:1,coins:Math.max(0,Math.floor(+s.coins||0)),bag:{...bag,potion:Math.max(0,Math.floor(+bag.potion||0)),greatCapsule:Math.max(0,Math.floor(+bag.greatCapsule||0)),escapeRope:Math.max(0,Math.floor(+bag.escapeRope||0)),revive:Math.max(0,Math.floor(+bag.revive||0))},pages:obj(s.pages),badges:obj(s.badges),attempts:Array.isArray(s.attempts)?s.attempts:[],dex:s.dex&&typeof s.dex==='object'?s.dex:{},misses:s.misses&&typeof s.misses==='object'?s.misses:{},seen:s.seen&&typeof s.seen==='object'?s.seen:{},bestStreak:+s.bestStreak||0,sound:s.sound!==false,battles:+s.battles||0,special:s.special&&typeof s.special==='object'?s.special:{}};}
  const saveRaw=s=>{if(s.attempts.length>6000)s.attempts=s.attempts.slice(-6000);writeJSON(KEY,s);};
  const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
  // Option order: the shared rule (option-order.js) shuffles per attempt and keeps true/false, panel labels,
  // numbered combinations and 'All of the above' style options in place.
  const dealPerm=x=>root.AtlasOptionOrder?root.AtlasOptionOrder.perm(x):(x.kind==='tf'?x.options.map((_,i)=>i):shuffle(x.options.map((_,i)=>i)));
  const today=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};
  const localDay=iso=>{const d=new Date(iso);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};
  const hhmm=t=>new Date(t).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'});


  // Original flat figures and reviewed recovery/chapter figures with a 16-digit content
  // hash are the only bank assets; extra directories and URL suffixes are rejected.
  function asset(p){p=String(p||'').trim();return /^data\/figures\/(?:[a-zA-Z0-9_-]+|(?:recovery|chapters)\/[a-z0-9]+(?:[.-][a-z0-9]+)*\.[a-f0-9]{16})\.svg$/.test(p)?p:'';}
  function normalizedItem(src){const p=src.passage;return {id:src.id,course:src.course,exam:src.exam||'',tier:'exam',session:src.session,kind:src.kind||'mcq',stem:src.stem,options:src.options.slice(),answer:src.answer,
    why:src.why.slice(),tell:src.tell||'',trap:src.trap||'',hint:src.hint||'',src:src.src||'',srcId:src.srcId||'',sourceId:typeof src.sourceId==='string'?src.sourceId:typeof src.srcId==='string'?src.srcId:null,sourceVersion:typeof src.sourceVersion==='string'?src.sourceVersion:null,
    fig:asset(src.fig),figureAlt:src.figureAlt||src.figAlt||'Question diagram',visual:asset(src.feedbackVisual||src.visual),visualCap:src.visualCap||'',
    optionVisuals:(Array.isArray(src.optionVisuals)?src.optionVisuals:[]).map(asset),optionVisualAlts:(Array.isArray(src.optionVisualAlts)?src.optionVisualAlts:[]).map(String),
    passage:p&&typeof p.title==='string'&&Array.isArray(p.paragraphs)&&p.paragraphs.every(t=>typeof t==='string')?{title:p.title,paragraphs:p.paragraphs.slice()}:null,passageId:src.passageId||'',
    verified:true,reviewStatus:src.reviewStatus,pool:src.pool,objectiveId:src.objectiveId,familyId:src.familyId};}
  function pool(course,pack){
    course=String(course||'').toUpperCase();const bank=Array.isArray(root.MNEMON_ITEMS)?root.MNEMON_ITEMS:[];
    const hidden=readJSON(HIDDEN,[]),sess=new Set(((pack&&pack.sessions)||[]).map(x=>+x.n)),out=[],seen=new Set();
    for(const src of bank){if(!root.AtlasCourses?.isReviewedItem?.(src)||src.course!==course||!sess.has(src.session)||seen.has(src.id)||(Array.isArray(hidden)&&hidden.includes(src.id)))continue;seen.add(src.id);out.push(normalizedItem(src));}
    return out;
  }
  // Reserved bodies are resolved only for an explicit eligible delayed-review request.
  function eligibleLaterItems(course,pack,requested){const R=root.AceDATReturnReview;if(!R?.listEligible||!R?.status||!R?.begin)return [];
    const eligible=new Set(R.listEligible({course}).map(x=>x.itemId)),wanted=new Set(requested),sessions=new Set(pack.sessions.map(x=>x.n)),seen=new Set(),objectives=new Set(),out=[];
    for(const src of root.AceDATContent?.items||[]){if(!wanted.has(src.id)||!eligible.has(src.id)||src.course!==course||!sessions.has(src.session)||!root.AtlasCourses.isReviewedItem(src,'later')||seen.has(src.id))continue;seen.add(src.id);out.push(normalizedItem(src));}
    const byId=new Map(out.map(x=>[x.id,x]));return requested.map(id=>byId.get(id)).filter(x=>{if(!x||objectives.has(x.objectiveId))return false;objectives.add(x.objectiveId);return true;}).slice(0,4);
  }
  const packOf=c=>{try{return root.AtlasCourses&&root.AtlasCourses.get?root.AtlasCourses.get(c):null;}catch(e){return null;}};
  const coursePool=c=>pool(c,packOf(c));

  // Sound: tiny WebAudio chiptune, works offline.
  let actx=null;
  // Sound panel (sound-panel.js, AtlasSound): effects can be switched off on their own; Calm plays them as soft sines.
  function tone(seq,on){const P=root.AtlasSound;if(!on||(P&&P.sfxOn&&!P.sfxOn()))return;const soft=!!(P&&P.calm&&P.calm()),lv=Math.max(.0002,(soft?.025:.07)*(P&&P.volume?P.volume():1));try{actx=actx||new (window.AudioContext||window.webkitAudioContext)();const t0=actx.currentTime+.01;
    seq.forEach(([f,d,at,type])=>{const o=actx.createOscillator(),g=actx.createGain();o.type=soft?'sine':type||'square';o.frequency.value=soft?Math.min(f,1047):f;g.gain.setValueAtTime(.0001,t0+at);g.gain.exponentialRampToValueAtTime(lv,t0+at+.01);g.gain.exponentialRampToValueAtTime(.0001,t0+at+d);o.connect(g).connect(actx.destination);o.start(t0+at);o.stop(t0+at+d+.02);});}catch(e){}}
  const SFX={
    hit:[[660,.08,0],[880,.12,.08]],
    crit:[[660,.07,0],[880,.07,.07],[1175,.16,.14]],
    miss:[[196,.18,0,'sawtooth'],[147,.22,.12,'sawtooth']],
    catch:[[523,.1,0],[659,.1,.1],[784,.1,.2],[1047,.28,.3]],
    fled:[[392,.12,0,'triangle'],[330,.12,.12,'triangle'],[262,.24,.24,'triangle']],
    star:[[784,.09,0],[988,.09,.09],[1319,.09,.18],[1568,.3,.27]],
    heal:[[523,.08,0,'triangle'],[784,.08,.08,'triangle'],[1047,.2,.16,'triangle']],
    appear:[[330,.06,0],[392,.06,.06],[494,.12,.12]]
  };


  // Pixel sprites for story characters and the legendary: rows of palette keys.
  const SPRITES={
    legend:{pal:{a:'#2c2350',b:'#6a4fd1',c:'#a88cff',d:'#f4d77a',e:'#fff6d8',f:'#58c7c2'},rows:[
      '..........dd..........','.........deed.........','....c...deeeed...c....','...cbc..dbbbbd..cbc...','..cbbbc.bbccbb.cbbbc..',
      '.cbbbbbcbcaacbcbbbbbc.','cbbbffbbbcaacbbbffbbbc','cbbffffbbbccbbbffffbbc','.cbbffbbbbbbbbbbffbbc.','..cbbbbbbeaaebbbbbbc..',
      '...cbbbbbaaaabbbbbc...','....cbbbbbaabbbbbc....','.....cbbbbbbbbbbc.....','......cbbffffbbc......','.......cbbffbbc.......',
      '........cbbbbc........','.........cbbc.........','..........cc..........']},
    entropy:{pal:{a:'#1f2426',b:'#3d4548',c:'#6b7478',d:'#c8403a',e:'#f2efe6',f:'#8a9296'},rows:[
      '......bbbb......','.....bccccb.....','....bccccccb....','....bceaaecb....','....bcaaaacb....','.....bccccb.....',
      '....bbdddddbb...','...bbbddddbbbb..','..bbcbbdddbbcbb.','..bb.bbbbbbb.bb.','.....bbbbbbb....','.....bb...bb....',
      '.....aa...aa....']},
    rowan:{pal:{a:'#2b3a36',b:'#d6ae55',c:'#f0d9b5',d:'#28645a',e:'#1c2b28',f:'#fff'},rows:[
      '.....bbbbb......','....bbbbbbb.....','...bbbbbbbbb....','...bccccccb.....','...ccfeccfec....','....cccccc......',
      '.....cccc.......','...dddddddd.....','..dddddddddd....','..cddddddddc....','...dddddddd.....','...ee....ee.....','...aa....aa.....']}
  };
  function drawSprite(ctx,key,cx,cy,scale){const sp=SPRITES[key];if(!sp)return;const w=sp.rows[0].length,h=sp.rows.length;ctx.save();ctx.imageSmoothingEnabled=false;
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){const k=sp.rows[y][x];if(k==='.')continue;ctx.fillStyle=sp.pal[k];ctx.fillRect(Math.round(cx+(x-w/2)*scale),Math.round(cy+(y-h/2)*scale),Math.ceil(scale),Math.ceil(scale));}ctx.restore();}

  // Special battles: the region, the legendary, grunts and the rival all use these.
  const HARD=['vignette','case','stem','mcq','figure'];
  function pickFor(sessions,perSession,prefer,all){const s=store(),gym=readJSON(GYM,{seen:{}}).seen||{},out=[];all=all||pool();
    for(const n of sessions){const rows=shuffle(all.filter(x=>x.session===n&&x.tier==='exam')).sort((a,b)=>(prefer&&(HARD.includes(a.kind)?0:1)-(HARD.includes(b.kind)?0:1))||((s.seen[a.id]||0)+(gym[a.id]||0))-((s.seen[b.id]||0)+(gym[b.id]||0)));out.push(...rows.slice(0,perSession).map(x=>x.id));}
    return out;}
  // Open misses of one course (a route when session is given), read from courses.<C>.misses.
  function openMissIds(session,course){course=String(course||'BIO').toUpperCase();const s=store(),c=(s.courses&&s.courses[course])||{},m=c.misses&&typeof c.misses==='object'?c.misses:{};
    const all=new Map(coursePool(course).filter(x=>x.pool==='practice').map(x=>[x.id,x])),out=[];
    for(const [id,v] of Object.entries(m))if(v&&!v.healed&&all.has(id)&&(!session||all.get(id).session===+session))out.push(id);
    return out;}
  // A sprite boss (a grunt) fights with the line types of the routes it deals.
  function sessionTypes(ns,course){const B=root.AtlasBestiary;return (B&&B.typesForSessions?B.typesForSessions(ns,course||'BIO'):[]);}

  // ---------- honest counts (10/07) ----------
  // Every correct answer is one hit on the foe: BASE x the type multiplier (x0.8 .. x1.25, creature-lines.js)
  // x a bonus factor clamped to 1 .. KMAX. Streaks, speed crits, fighting styles, charms, stances, move
  // power and the Sure wager all live inside that factor; Guard, Insight and Focus never drop below BASE.
  // Wrong answers never damage the foe. So the correct answers a foe needs are known before the battle:
  // HIT.range(hp, mult) -> {min, max, typ}. tools/living-atlas/test-battle-counts.cjs checks it.
  // Consumables (10/07): every use also adds to q.spent, a running ledger cloud-sync.js merges by max, so a
  // used item can no longer come back on the next sync (counts alone merged by max).
  const spend=(q,k,n)=>{if(!q||typeof q!=='object')return;q.spent=q.spent&&typeof q.spent==='object'&&!Array.isArray(q.spent)?q.spent:{};q.spent[k]=(+q.spent[k]||0)+(n||1);};
  const HIT={BASE:25,KMAX:1.25};
  HIT.lo=E=>Math.round(HIT.BASE*E);HIT.hi=E=>Math.round(HIT.BASE*E*HIT.KMAX);
  HIT.dmg=(E,k)=>Math.round(HIT.BASE*E*Math.min(HIT.KMAX,Math.max(1,+k||1)));
  HIT.range=(hp,E)=>{hp=Math.max(0,hp);const lo=HIT.lo(E),hi=HIT.hi(E),min=hp>0?Math.ceil(hp/hi):0,max=hp>0?Math.ceil(hp/lo):0,typ=Math.min(max,Math.max(min,hp<=0?0:hp<=lo?1:1+Math.ceil((hp-lo)/hi)));/* typical: the first hit plain, then a streak keeps the bonus up */return {min,max,typ,lo,hi};};
  HIT.words=(n,w)=>n+' '+w+(n===1?'':'s');
  HIT.span=r=>r.min===r.max?HIT.words(r.max,'correct answer'):'about '+HIT.words(r.typ,'correct answer')+' ('+r.min+' to '+r.max+' with game bonuses)';
  // Old intros carried a fixed "Land N hits before you lose 3 lives." The battle now states the real count.
  HIT.strip=t=>String(t||'').replace(/\s*(?:Land|Get) (?:\d+|[A-Za-z]+) hits?\b[^.]*\./g,'').replace(/\s*(?:\d+|[A-Z][a-z]+) hits? wins?\./g,'').replace(/\s*\d+ hits to win[^.]*\./g,'').replace(/\s*About \d+ correct answers[^.]*\./g,'').trim();
  function cname0(id,evolved){const B0=root.AtlasBestiary;if(B0?.isLine?.(id))return B0.formName(id,evolved?2:0);const f=B0?.find(id);return f?(evolved?f.evolution:f.name):id;}

  // Miss debrief (10/08): the end screen of every battle, Blitz and proof run lists the questions missed in
  // it. Styled here, once, so the look matches the end card without touching exam-quest.css.
  const DEBRIEF_CSS='.eq-debrief{text-align:left;margin-top:14px;border-top:1px solid rgba(0,0,0,.08);padding-top:12px}.eq-debrief h4{margin:2px 0 4px;font-size:17px}.eq-debrief .eq-db-item{background:#fff;border:1px solid rgba(0,0,0,.1);border-radius:12px;padding:10px 12px;margin:8px 0}.eq-debrief .eq-db-sess{margin:0 0 2px;font-size:12px;text-transform:uppercase;letter-spacing:.04em;opacity:.7}.eq-debrief h5{margin:0 0 8px;font-size:15px;line-height:1.4;font-weight:600}.eq-debrief .eq-db-key,.eq-debrief .eq-db-mine{display:flex;gap:8px;align-items:flex-start;margin:4px 0;font-size:14px;line-height:1.4}.eq-debrief .eq-db-key b,.eq-debrief .eq-db-mine b{flex:0 0 46px;border-radius:6px;padding:1px 6px;text-align:center;font-size:12px;color:#fff;background:var(--eq-good,#2f7a55)}.eq-debrief .eq-db-mine b{background:var(--eq-bad,#a4463f)}.eq-debrief .eq-fix{display:inline-block;margin-top:6px;font-weight:600}.eq-debrief .eq-fix-meta{display:block;font-size:12px;opacity:.7}.eq-debrief .gx-fig img{max-height:180px}.eq-debrief .gx-src{margin:6px 0 0}';
  function ensureDebriefCSS(){try{if(document.getElementById('eq-debrief-css'))return;const s=document.createElement('style');s.id='eq-debrief-css';s.textContent=DEBRIEF_CSS;document.head.appendChild(s);}catch(e){}}
  // A missed question is noted once per run, with the option index picked (-1 when Focus rated it as not recalled).
  function noteMiss(b,it,pick){if(!b||!it)return;b.missed=Array.isArray(b.missed)?b.missed:[];if(b.missed.some(m=>m.id===it.id))return;b.missed.push({id:it.id,pick:pick==null?-1:+pick});}



  function open(opts){
    opts=opts||{};
    const B=root.AtlasBestiary;
    // ---------- course context ----------
    // A course pack is required. An unknown course never falls back to another course.
    const AC=root.AtlasCourses,COURSE=AC&&AC.resolve?AC.resolve(opts.course||''):null,PACKED=true,PACK=COURSE?AC.get(COURSE):null;
    if(!PACK){try{root.AtlasApp&&root.AtlasApp.notice&&root.AtlasApp.notice('This DAT world has no reviewed course pack available yet.');}catch(e){}return null;}
    const SESSIONS=PACK.sessions.map(x=>({n:x.n,title:x.title,creature:(B&&B.lineFor&&B.lineFor(x.n,COURSE)?.id)||'cytrus'}));
    const GYM_EXAM=PACK.examId,K=SESSIONS.length;
    const DEX=()=>PACK.dex||{};
    const L={eyebrow:PACK.name+' | Routes '+SESSIONS[0].n+' to '+SESSIONS[K-1].n,title:PACK.name+' field log',ready:'Practice record',readySub:'recent responses on available introductory topics',gymCheck:'Game wins and XP do not establish DAT readiness.',gymName:PACK.gymName,gymN:PACK.gym.n,safari:'Catch all '+K,types:Object.keys((B&&B.typesFor&&B.typesFor(COURSE))||{}).length+' types'};
    let allItems=pool(COURSE,PACK),items=allItems.filter(x=>x.pool==='practice'),byId=new Map(allItems.map(x=>[x.id,x])),battle=null,center=null,destroyed=false,modelHandle=null;
    function destroyModel(){try{modelHandle?.destroy?.();}catch(e){}modelHandle=null;}
    const rowsOf=()=>items;
    // A course pack's specials, kept only when both routes can deal a battle.
    const SPX=((B&&B.specialsFor&&B.specialsFor(COURSE))||[]).filter(w=>w.sessions.every(n=>items.filter(q=>q.session===n).length>=4));
    const dialog=document.createElement('dialog');dialog.className='world-panel panel-wide exam-quest';document.body.appendChild(dialog);ensureDebriefCSS();
    // Back / Esc mid-battle: step back inside the battle, and ask before leaving; nav-history.js sends the same
    // cancel for browser Back and the phone edge swipe.
    let lastBack=0;dialog.addEventListener('cancel',e=>{e.preventDefault();if(battle&&battle.phase!=='end'){lastBack=Date.now();battleBack();return;}close();});
    document.addEventListener('keydown',onKey,true);
    dialog.showModal();

    // ---------- store view ----------
    // Each course keeps its own progress (dex, attempts, misses, quests, medals, blitz...) under courses.<COURSE>;
    // S() swaps those fields in and save() swaps them back, so the top-level store never mixes courses.
    const PER_COURSE=['dex','attempts','misses','quests','critLog','streakLog','blitz','outbreak','medals','runway','special','perfectCatch','battles','water','lumen','lumenRun'],SWAP='_courseSwap';
    const objOf=v=>v&&typeof v==='object'&&!Array.isArray(v)?v:{};
    function S(){const s=store();if(!PACKED)return s;const cs=objOf(s.courses);s.courses=cs;const c=cs[COURSE]=objOf(cs[COURSE]);
      c.dex=objOf(c.dex);c.misses=objOf(c.misses);c.special=objOf(c.special);c.water=objOf(c.water);c.attempts=Array.isArray(c.attempts)?c.attempts:[];c.battles=+c.battles||0;c.perfectCatch=!!c.perfectCatch;
      const held={};for(const k of PER_COURSE){held[k]=s[k];s[k]=c[k];}s[SWAP]=held;return s;}
    function save(s){if(PACKED&&s&&s[SWAP]){const held=s[SWAP];delete s[SWAP];const c={...objOf(objOf(s.courses)[COURSE])};for(const k of PER_COURSE){c[k]=s[k];s[k]=held[k];}if(c.attempts.length>6000)c.attempts=c.attempts.slice(-6000);s.courses={...objOf(s.courses),[COURSE]:c};}saveRaw(s);}
    const tinfo=t=>(B&&B.typeInfo?B.typeInfo(t):(B&&B.types?B.types[t]:null))||null;
    const worldMode=!!(opts.start&&(opts.start.wild||opts.start.special||opts.start.gym||opts.start.water||opts.start.returnReview));
    const P=()=>(opts.getPartner&&opts.getPartner())||{id:'cytrus',xp:0};
    const who0=cid=>((opts.getParty&&opts.getParty())||[]).find(m=>m&&m.id===cid)||P();
    const sfx=name=>tone(SFX[name],S().sound);
    function music(n){try{root.AtlasMusic?.play(n);}catch(e){}}
    function flash(){dialog.classList.remove('eq-flash');void dialog.offsetWidth;dialog.classList.add('eq-flash');setTimeout(()=>dialog.classList.remove('eq-flash'),700);}
    function revokeChecks(){for(const slot of battle?.queue||[])if(slot.checkPresented)root.AtlasSRS?.endCheck?.(slot.attemptId);}
    function close(){revokeChecks();destroyModel();destroyed=true;clearInterval(blitzTimer);music('route');document.removeEventListener('keydown',onKey,true);dialog.close();dialog.remove();opts.onClose?.();}
    function sprite(c){if(!c||!B)return;const ctx=c.getContext('2d');ctx.clearRect(0,0,c.width,c.height);/* the ascended aura is drawn by B.draw (creature-lines.js) */try{if(c.dataset.back==='1'){ctx.save();ctx.translate(c.width,0);ctx.scale(-1,1);}B.draw(ctx,c.dataset.creature,c.width/2,c.height/2+6,c.width/44,c.dataset.evolved==='1',c.dataset.stage);if(c.dataset.back==='1')ctx.restore();}catch(e){}if(c.dataset.shadow==='1'){ctx.globalCompositeOperation='source-atop';ctx.fillStyle='#2b3f3b';ctx.fillRect(0,0,c.width,c.height);ctx.globalCompositeOperation='source-over';}}
    const paint=()=>{dialog.querySelectorAll('canvas[data-creature]').forEach(sprite);dialog.querySelectorAll('canvas[data-sprite]').forEach(c=>{const ctx=c.getContext('2d');ctx.clearRect(0,0,c.width,c.height);const sp=SPRITES[c.dataset.sprite];if(sp)drawSprite(ctx,c.dataset.sprite,c.width/2,c.height/2,Math.min(c.width/sp.rows[0].length,c.height/sp.rows.length)*.9);if(c.dataset.shadow==='1'){ctx.globalCompositeOperation='source-atop';ctx.fillStyle='#3d3860';ctx.fillRect(0,0,c.width,c.height);ctx.globalCompositeOperation='source-over';}});};
    // Ascension lives in creature-lines.js (B.isAscended, B.ASCEND): one rule for battles, the overworld and the team.
    const ASCEND=(B&&B.ASCEND)||{cytrus:'Cytadel',atpup:'Protonarch',twistle:'Genosage'},ascended=(id,evolved)=>!!(B&&B.isAscended?B.isAscended(id,evolved):(evolved&&ASCEND[id]&&Object.keys(S().badges||{}).length>=5));
    const cname=(id,evolved)=>{if(ascended(id,evolved))return ASCEND[id];if(B?.isLine?.(id))return B.formName(id);const f=B?.find(id);return f?(evolved?f.evolution:f.name):id;};
    // Stars to line stage, and a line form at an explicit stage (never the live store, which can lag a save).
    const starStage=n=>B?.starStage?B.starStage(n):((+n||0)>=3?2:(+n||0)>=2?1:0);
    const formAt=(id,stage)=>B?.isLine?.(id)?B.formName(id,stage):cname(id,stage>=2);
    // A partner's level-up evolution (Lv. 6): {from,to} only when the display name really changes.
    const lvEvolution=(id,a,b)=>{if(B?.levelEvolution)return B.levelEvolution(id,a,b);if(!(a<6&&b>=6)||B?.isLine?.(id))return null;const f=cname(id,false),t=cname(id,true);return f!==t?{from:f,to:t}:null;};
    const typeTag=(id,stage)=>{const ts=B?.typesOf?B.typesOf(id,stage):[B?.typeOf?.(id)||'neutral'];return ts.map(t=>{const T=tinfo(t);return T?`<span class="type-tag" style="--tc:${T.color}">${esc(T.name)}</span>`:'';}).join(' ');};
    // ---------- type effectiveness: ONE rule (B.effectOn) for every battle, both directions ----------
    const tagsFor=ts=>(ts||[]).map(t=>{const T=tinfo(t);return T?`<span class="type-tag" style="--tc:${T.color}">${esc(T.name)}</span>`:'';}).join(' ');
    // The foe's types: a spec's declared types, a legendary's, the creature it sends out, else the line
    // types of the sessions it deals. Wild foes are their creature at the encounter stage (b.stage).
    function foeTypes(b){const sp=b&&b.special;let ts=sp&&B?.specTypes?B.specTypes(sp):[];
      if(!ts.length&&sp){const c={};for(const q of (b.queue||[])){const it=byId.get(q.id);if(it)c[it.session]=(c[it.session]||0)+1;}ts=B?.typesForSessions?B.typesForSessions(Object.keys(c).sort((a,z)=>c[z]-c[a]).map(Number),COURSE):[];}
      if(!ts.length&&b&&!sp&&b.x)ts=B?.typesOf?B.typesOf(b.x.creature,b.stage||0):[];
      return ts.length?ts:['neutral'];}
    const myTypes=me=>B?.typesOf?B.typesOf(me.id,undefined,me.lv>=6):[B?.typeOf?.(me.id)||'neutral'];
    const hitOn=(b,me)=>B?.effectOn?B.effectOn(B.typeOf(me.id)||'neutral',foeTypes(b)):{mult:1,why:[],reason:''};
    const hitBack=(b,me)=>B?.effectOn?B.effectOn(foeTypes(b)[0],me.id,undefined,me.lv>=6):{mult:1,why:[],reason:''};
    // The live count line (intro, every menu, every swap): what this foe still needs from the creature in front.
    function countLine(b){const sp=b.special,me=b.team&&b.team[b.active];if(!me)return '';
      if(sp&&sp.checkpoint){const done=b.hits+b.misses;return `${b.queue.length} checkpoint questions, ${sp.requiredCorrect} correct to pass.`+(done?` So far ${b.hits} correct of ${done}.`:'');}
      const E=hitOn(b,me).mult,r=HIT.range(b.foeHP,E),who=cname(me.id,me.lv>=6),fresh=b.foeHP>=b.foeMax;
      const eff=E>1?`${who} is a strong match here (x${E})`:E<1?`${who} is a weak match here (x${E})`:`${who} hits normally here`;
      if(!sp){const bag=S().bag||{},rc=HIT.range(b.foeHP-b.foeMax*.4,E);
        return `${fresh?'To catch it':'Still needed to catch it'}: ${HIT.span(r)}. ${eff}.${bag.greatCapsule>0?(rc.max>0?` A Great Capsule works after ${rc.min===rc.max?rc.max:rc.min+' to '+rc.max} more.`:' A Great Capsule works now.'):''} A wrong answer costs a turn and HP, never progress.`;}
      if(sp?.assessment==='later')return `${Math.max(0,b.queue.length-b.i)} fresh return case${b.queue.length-b.i===1?'':'s'} left. Take your time; party HP is protected. Help changes this response to supported practice.`;
      const left=Math.max(0,b.queue.length-b.i);
      let t=`${fresh?'To win':'Still needed'}: ${HIT.span(r)}, with ${HIT.words(left,'question')} left. ${eff}. A wrong answer uses up a question and costs HP; it never adds to the count.`;
      if(r.min>left)t+=` That is more than the questions left: swap to a creature that hits harder here.`;else if(r.max>left)t+=` With ${HIT.words(left,'question')} left you need some bonus hits, or a creature that hits harder here.`;
      return t;}
    const effSay=ef=>ef.mult>1?"Strong match! "+(ef.reason?ef.reason+' ':''):ef.mult<1?"Weak match. "+(ef.reason?ef.reason+' ':''):'';
    const stars=n=>'<span class="eq-stars" aria-label="'+n+' of 3 stars">'+[1,2,3].map(i=>`<i class="${i<=n?'on':''}"></i>`).join('')+'</span>';
    // Battle FX (battle-fx.js): juice, confidence wager, Lumen forms, evolution cutscene.
    const FX=root.AtlasBattleFX?root.AtlasBattleFX.attach(dialog,{battle:()=>battle,center:()=>center,S,save,tinfo,B,cname,course:COURSE,byId:()=>byId,sessionCreature:n=>SESSIONS.find(x=>x.n===+n)?.creature||null}):null;

    // ---------- derived stats ----------
    function stats(){
      const s=S(),t=today(),todays=s.attempts.filter(a=>localDay(a.at)===t);
      const caught=SESSIONS.filter(x=>(s.dex[x.n]?.stars||0)>=1).length,starSum=SESSIONS.reduce((n,x)=>n+(s.dex[x.n]?.stars||0),0);
      let streak=0,best=s.bestStreak;for(const a of s.attempts){streak=a.ok?streak+1:0;best=Math.max(best,streak);}
      const gym=readJSON(GYM,{runs:[]}),gymRuns=(gym.runs||[]).filter(r=>r.examId===GYM_EXAM);
      return {correctAll:s.attempts.filter(a=>a.ok).length,healed:Object.values(s.misses).filter(m=>m&&m.healed).length,s,todays,correctToday:todays.filter(a=>a.ok).length,caught,starSum,best,gymRuns,gymToday:gymRuns.filter(r=>localDay(r.finishedAt)===t)};
    }
    // The session where points are being lost right now: lowest first-try accuracy over the last 10
    // answers, nudged down by open misses; untested sessions count as shaky.
    function weakest(){const s=S(),om={};for(const m of openMisses()){const it=byId.get(m.id);if(it)om[it.session]=(om[it.session]||0)+1;}
      return SESSIONS.filter(x=>AC.sessionAvailability(COURSE,x.n).available).map(x=>{const r=s.attempts.filter(a=>a.s===x.n&&a.m!=='center'&&!a.h&&!a.f).slice(-10),acc=r.length?r.filter(a=>a.ok).length/r.length:.45;return {n:x.n,title:x.title,acc,count:r.length,right:r.filter(a=>a.ok).length,miss:om[x.n]||0,score:acc-.02*(om[x.n]||0)};}).sort((a,b)=>a.score-b.score)[0];}
    // Pick a water Mnemon for this stretch of water, favoring ones not caught yet.
    function startWater(region){const Wl=SPX;if(!Wl.length)return home();const got=S().water||{};const here=Wl.filter(w=>!region||(w.habitats||[]).includes(region));const pool=(here.length?here:Wl);
      const fresh=pool.filter(w=>!got[w.id]),pick=(fresh.length&&Math.random()<.8?fresh:pool)[Math.floor(Math.random()*(fresh.length&&Math.random()<.8?fresh:pool).length)]||pool[0];
      const spec=packSpecial(pick.id);if(!spec)return home();center=null;return startSpecial(spec);}
    function waterRow(s){const Wl=SPX;if(!Wl.length)return '';const got=s.water||{},n=Wl.filter(w=>got[w.id]).length;
      const head=esc(PACK.specialsName),btn='Find one',note=esc(PACK.specialsNote||'Bridge creatures. Each battle alternates questions from two sessions of this course, the way the exam mixes them.'),hidden='Battle it to catch it';
      return `<div class="eq-row eq-water-head"><h4>${head} <small>${n}/${Wl.length} caught</small></h4><button class="secondary eq-inline" data-act="water">${btn}</button></div><p class="eq-note">${note}</p>
      <div class="eq-dex eq-water">${Wl.map(w=>{const c=got[w.id];return `<button class="eq-mon${c?' caught':''}" data-act="water" data-w="${w.id}"><canvas data-creature="${w.id}" data-shadow="${c?0:1}" width="72" height="64" aria-hidden="true"></canvas><span class="eq-sn">S${w.sessions[0]} + S${w.sessions[1]}</span><strong>${c?esc(w.name):'???'}</strong><small>${c?esc(w.blurb):hidden}</small>${c?typeTag(w.id):''}</button>`;}).join('')}</div>`;}
    // A course pack's special: a bridge battle dealt from the course's two named routes.
    function packSpecial(id){const W=SPX.find(w=>w.id===id);if(!W)return null;const [a,c]=W.sessions,xa=SESSIONS.find(y=>y.n===a),xc=SESSIONS.find(y=>y.n===c);
      const ia=pickFor([a],4,false,items),ic=pickFor([c],4,false,items),out=[];for(let k=0;k<4;k++){if(ia[k])out.push(ia[k]);if(ic[k])out.push(ic[k]);}if(out.length<4)return null;
      const caught=!!(S().water||{})[id],kind=PACK.specialsName;
      return {id:'water-'+id+'-'+Date.now(),kind:'water',water:id,name:(caught?'':'Wild ')+W.name,sub:`${kind}: bridges Route ${a} and Route ${c}`,creature:id,stage:0,
        intro:`A wild ${W.name} appears! ${W.blurb} Its questions alternate between Route ${a} (${xa?xa.title:''}) and Route ${c} (${xc?xc.title:''}). Land 6 hits before you lose 3 lives to catch it.`,
        items:out,hp:6,lives:3,xp:20,win:`You caught ${W.name}! It bridges Route ${a} and Route ${c}, and it joined your team.`,lose:`${W.name} slipped away. Find it again from the ${kind} row.`};}
    // Practice summaries exclude self-ratings and unknown chapters. They are not readiness estimates.
    function readiness(){const s=S();const rows=SESSIONS.map(x=>{const r=s.attempts.filter(a=>a.s===x.n&&!a.f&&!a.h&&a.m!=='center').slice(-10);return {n:x.n,title:x.title,c:r.length,acc:r.length?r.filter(a=>a.ok).length/r.length:null};});const known=rows.filter(r=>r.c);return {score:known.length?Math.round(known.reduce((t,r)=>t+r.acc,0)/known.length*100):null,rows,low:rows.slice().sort((a,b)=>(a.acc??-1)-(b.acc??-1)).slice(0,3),untested:rows.filter(r=>!r.c).length};}
    function readinessPanel(){const R=readiness();return `<section class="eq-panel eq-ready"><div class="eq-row"><h3>${esc(L.ready)}</h3><small>${esc(L.readySub)}</small></div><div class="eq-ready-row"><div class="eq-ready-score"><b>${R.score==null?'None yet':R.score+'%'}</b><small>${R.score==null?'No responses yet':'Recent practice accuracy'}</small></div></div><p class="eq-note">${R.low.map(r=>`<b>Route ${r.n}</b> ${esc(r.title)} (${r.c?Math.round(r.acc*100)+'%':'unknown'})`).join(', ')}. Unanswered chapters stay unknown. ${esc(L.gymCheck)}</p><div class="gx-actions"><button class="primary" data-act="hunt">Choose practice</button></div></section>`;}
    // Daily quests: three a day, chosen from the date, rewards in coins; all three earn a Revive.
    const QUESTS={heal:{t:'Heal 10 misses at the Recall Center',n:10},crit:{t:'Land 3 critical hits',n:3},weak:{t:'Answer 8 right from your weakest session',n:8},water:{t:'Catch one of the '+PACK.specialsName,n:1},streak:{t:'Get 8 right in a row in one battle',n:8},grove:{t:'Clear today\'s review cards',n:1},boss:{t:'Beat a trainer, grunt, warden or rival',n:1}};
    // The boss quest stays out: trainers and wardens live in the world.
    const QIDS=Object.keys(QUESTS).filter(i=>!PACKED||((i!=='water'||SPX.length>0)&&i!=='boss'));
    function dailyQuests(){const s=S(),t=today();let q=s.quests;if(!q||q.date!==t){const ids=QIDS;let h=0;for(const ch of t)h=(h*31+ch.charCodeAt(0))>>>0;
        const first=openMisses().length?'heal':'grove',rest=ids.filter(i=>i!==first);const pick=[first];while(pick.length<3){h=(h*1103515245+12345)>>>0;const i=rest[h%rest.length];if(!pick.includes(i))pick.push(i);}
        q={date:t,list:pick,weak:weakest()?.n||1,claimed:{}};s.quests=q;save(s);}return q;}
    function questProgress(id,q){const s=S(),t=today(),todays=s.attempts.filter(a=>localDay(a.at)===t);
      if(id==='heal')return todays.filter(a=>a.m==='center'&&a.ok).length;
      if(id==='crit')return s.critLog&&s.critLog.date===t?s.critLog.n:0;
      if(id==='weak')return todays.filter(a=>a.s===q.weak&&a.ok).length;
      if(id==='water')return Object.values(s.water||{}).some(w=>w.last&&localDay(w.last)===t)?1:0;
      if(id==='streak')return s.streakLog&&s.streakLog.date===t?s.streakLog.best:0;
      if(id==='grove')return root.AtlasSRS?.summary().daily.cleared?1:0;
      if(id==='boss')return Object.values(s.special||{}).some(r=>(r.wonAt&&localDay(r.wonAt)===t)||(r.last&&localDay(r.last)===t&&r.wins))?1:0;return 0;}
    function questsPanel(){const q=dailyQuests(),rows=q.list.map(id=>{const Q=QUESTS[id],p=Math.min(Q.n,questProgress(id,q)),done=p>=Q.n,claimed=!!q.claimed[id];
        return `<li class="${claimed?'claimed':done?'done':''}"><div><strong>${esc(id==='weak'?Q.t.replace('your weakest session','Route '+q.weak):Q.t)}</strong><small>${p}/${Q.n} | 15 coins</small></div>${claimed?'<span class="eq-q-tag">Claimed</span>':done?`<button class="primary" data-act="quest-claim" data-q="${id}">Claim</button>`:''}</li>`;}).join('');
      const all=q.list.every(id=>q.claimed[id]);
      return `<section class="eq-panel eq-quests"><div class="eq-row"><h3>Daily quests</h3><small>${all?'All done: +1 Revive':'Finish all three for a Revive'}</small></div><ul>${rows}</ul></section>`;}
    function hunt(){const w=weakest();if(!w)return;startWild(w.n,`Hunt: Route ${w.n} is where you are losing the most points right now (${w.count?w.right+' of your last '+w.count:'barely practiced'}${w.miss?', '+w.miss+' open misses':''}).`);}
    function openMisses(){
      const s=S(),out=new Map();
      for(const [id,m] of Object.entries(s.misses))if(!m.healed&&byId.get(id)?.pool==='practice')out.set(id,{id,from:'quest',at:m.at});
      const gym=readJSON(GYM,{runs:[]}),runs=(gym.runs||[]).filter(r=>r.examId===GYM_EXAM);
      for(const r of runs)for(const x of (r.results||[]))if(!x.correct&&byId.get(x.id)?.pool==='practice'){const healed=s.misses[x.id]?.healed&&Date.parse(s.misses[x.id].healedAt||0)>Date.parse(r.finishedAt);if(!healed)out.set(x.id,{id:x.id,from:'gym',at:r.finishedAt});}
      return [...out.values()];
    }


    // ---------- miss debrief ----------
    // The end screen of every battle lists the questions missed in it: the key and its reason, your pick and its trap.
    function debriefHTML(b){const rows=((b&&b.missed)||[]).map(m=>({...m,it:byId.get(m.id)})).filter(m=>m.it&&Array.isArray(m.it.options));if(!rows.length)return '';
      return `<section class="eq-debrief"><p class="eyebrow">Miss debrief</p><h4>${rows.length} ${rows.length===1?'question':'questions'} to fix</h4><p class="eq-note">Practice misses can be revisited at the Recall Center. Checkpoint feedback stays attached to this attempt; repeat exposure is not fresh evidence.</p>${rows.map(({it,pick})=>{const k=it.answer,W=Array.isArray(it.why)?it.why:[],mine=pick>=0&&pick!==k&&it.options[pick]!=null?it.options[pick]:null;
        return `<article class="eq-db-item"><p class="eq-db-sess">Route ${it.session}</p><h5>${esc(it.stem)}</h5><div class="eq-db-key"><b>Key</b><span>${esc(it.options[k])}${it.tell?`<small class="eq-why">${esc(it.tell)}</small>`:W[k]?`<small class="eq-why">${esc(W[k])}</small>`:''}</span></div>${mine!=null?`<div class="eq-db-mine"><b>Yours</b><span>${esc(mine)}${W[pick]?`<small class="eq-why">${esc(W[pick])}</small>`:''}</span></div>`:''}${it.trap?`<p class="gx-trap"><b>Trap:</b> ${esc(it.trap)}</p>`:''}</article>`;}).join('')}</section>`;}

    // ---------- the answer card: after every answer, right or wrong ----------
    // Top to bottom on one phone screen: the item's visual (tap to zoom), Answer and Tell, your pick and its named
    // trap, the why for each choice (folded), the route's field notes (folded, More), One more like this, and a slim
    // sticky Continue bar. post-question.js builds the lead; this keeps a plain fallback.
    function visualHTML(it){const v=it&&(it.visual||it.fig);if(!v)return '';const P=root.AtlasPostQuestion;if(P&&P.figureHTML)return P.figureHTML(v,it.visualCap||'');return '<figure class="mq-visual"><img src="'+esc(v)+'" data-zoom alt="'+esc(it.visualCap||'Visual for this question')+'" decoding="async" onerror="this.closest(\'figure\').remove()">'+(it.visualCap?'<figcaption>'+esc(it.visualCap)+'</figcaption>':'')+'</figure>';}
    function answerCard(it,slot,o){
      const PQ=root.AtlasPostQuestion,pickO=o.pick!=null&&o.pick>=0&&slot.perm[o.pick]!=null?slot.perm[o.pick]:-1,dexE=DEX()[it.session]||{};
      let lead='';try{if(PQ&&PQ.cardHTML)lead=PQ.cardHTML(it,{pickedIndex:pickO,correct:!!o.ok,confidence:o.unsure?'guess':null,perm:slot.perm,facts:dexE.facts||[],traps:dexE.traps||[],moreQueued:!!o.more});}catch(e){lead='';}
      if(!lead)lead=visualHTML(it)+'<p class="mq-answer"><b>Answer: '+esc(it.options[it.answer])+'.</b>'+(it.tell?' <span class="mq-tell"><b>Tell:</b> '+esc(it.tell)+'</span>':'')+'</p>'+(pickO>=0&&!o.ok?'<p class="mq-pick">Your pick: <b>'+esc(it.options[pickO])+'</b>.'+(it.trap?' <span class="mq-trap"><b>Trap:</b> '+esc(it.trap)+'</span>':'')+'</p>':'')+'<button type="button" class="mq-onemore" data-act="one-more">One more like this</button>';
      if(battle?.special?.checkpoint)lead=lead.replace(/<button\b[^>]*data-act=["']one-more["'][^>]*>[\s\S]*?<\/button>/g,'');
      return '<article class="gx-q eq-q pk-q mq-wrap"><div class="eq-fb mq '+(o.ok?'ok':'no')+(!o.ok&&!o.unsure?' mq-sure-miss':'')+'"><p class="mq-msg">'+esc(o.msg||'')+'</p>'+passageHTML(it)+lead+'</div><div class="mq-bar"><button class="primary" data-act="continue">Continue <kbd>Enter</kbd></button></div></article>';
    }
    // One more like this: a sibling from the same route goes next in this battle (post-question.js siblingsOf, else
    // the least seen question of the route that is not already in the queue).
    function oneMore(){const b=battle;if(!b||b.moreQueued||b.special?.checkpoint)return;const slot=b.queue[b.i],it=slot&&byId.get(slot.id);if(!it)return;
      const used=new Set(b.queue.map(q=>q.id)),PQ=root.AtlasPostQuestion,s=S();let sib=null;
      try{sib=PQ&&PQ.siblingsOf?(PQ.siblingsOf(it,{pool:items,exclude:used,n:1})[0]||null):null;}catch(e){sib=null;}
      if(!sib)sib=items.filter(x=>x.session===it.session&&!used.has(x.id)).sort((a,z)=>(s.seen[a.id]||0)-(s.seen[z.id]||0))[0]||null;
      const btn=dialog.querySelector('[data-act=one-more]');
      if(!sib||byId.get(sib.id)?.pool!=='practice'){if(btn){btn.disabled=true;btn.textContent='No other question like this on the route yet';}return;}
      b.queue.splice(b.i+1,0,{id:sib.id,review:false,perm:dealPerm(byId.get(sib.id)),more:true});b.moreQueued=true;
      if(btn){btn.disabled=true;btn.textContent='Queued: one more like this comes next';}}
    // One local namespaced event per answer; no connected tutor or network adapter.
    function emit(it,ok,o){try{const b=battle,sp=b&&b.special;
      root.dispatchEvent?.(new CustomEvent('ace-dat-realms:answer',{detail:{attemptId:o.attemptId||null,course:COURSE,pool:it.pool,objectiveId:it.objectiveId,familyId:it.familyId,sourceId:it.sourceId,sourceVersion:it.sourceVersion,practice:o.practice!==false,repeated:!!o.repeated,selfRated:!!o.selfRated,itemId:String(it.id),route:+it.session,correct:!!ok,assisted:!!o.assisted,confidence:o.confidence==null?null:o.confidence,ms:Math.max(0,+o.ms||0),
        creature:String(o.battle==='center'?'':sp?(sp.creature||sp.sprite||''):((b&&b.x&&b.x.creature)||'')),battle:String(o.battle||(sp?sp.kind:'wild')),zone:String(opts.zone||'')}}));}catch(e){}}


    // ---------- home: the field log ----------
    function home(){
      revokeChecks();grove=null;
      if(blitz){clearInterval(blitzTimer);blitz=null;}
      battle=null;center=null;music('town');checkMedals();const st=stats(),s=st.s,p=P(),lvl=B?B.level(p.xp):1,misses=openMisses();
      const next=SESSIONS.map(x=>({x,d:s.dex[x.n]||{}})).sort((a,b)=>(a.d.stars||0)-(b.d.stars||0)||Date.parse(a.d.last||0)-Date.parse(b.d.last||0))[0];
      const acc=st.todays.length?Math.round(st.correctToday/st.todays.length*100):null;
      dialog.innerHTML=`<div class="world-panel-header"><div><p class="eyebrow">${esc(L.eyebrow)}</p><h2>${esc(L.title)}</h2></div><div class="eq-head-actions"><button class="eq-chip" data-act="sound" aria-pressed="${s.sound}">Sound ${s.sound?'on':'off'}</button><button class="eq-chip" data-act="close">Close</button></div></div>
      <section class="eq-card">
        <canvas data-creature="${esc(p.id)}" data-evolved="${lvl>=6?1:0}" width="96" height="86" aria-hidden="true"></canvas>
        <div class="eq-card-main"><p class="eyebrow">Trainer card | ${esc((root.AtlasTrainer&&root.AtlasTrainer.name&&root.AtlasTrainer.name())||'Trainer')}</p><h3>${esc(cname(p.id,lvl>=6))} <small>Lv. ${lvl}</small></h3>
          <div class="eq-xp"><i style="width:${Math.min(100,Math.round(((p.xp||0)-5*Math.pow(lvl-1,2))/(5*Math.pow(lvl,2)-5*Math.pow(lvl-1,2))*100))}%"></i></div>
          <p class="eq-card-sub">${B?.isLine?.(p.id)?'Evolves through route stars':lvl<6?'Evolves at Lv. 6':'Evolved'} | ${st.caught}/${K} caught | ${st.starSum}/${K*3} stars</p></div>
        <dl class="eq-kpis"><div><dt>Today</dt><dd>${st.correctToday}<small>/${st.todays.length}</small></dd></div><div><dt>Accuracy</dt><dd>${acc==null?'-':acc+'%'}</dd></div><div><dt>Best streak</dt><dd>${st.best}</dd></div></dl>
      </section>
      ${readinessPanel()}
      <div class="eq-grid2">
        <div class="eq-side eq-side-wide">${questsPanel()}
          ${(()=>{const ts=teamState(),hurt=ts.fainted+ts.hurt,status=hurt?`<p class="eq-teamhp">${ts.fainted?`<b>${ts.fainted} fainted</b>`:''}${ts.fainted&&ts.hurt?' | ':''}${ts.hurt?`${ts.hurt} hurt`:''}. Every missed question you answer right heals the team; three right heals everyone.</p>`:'';
        return `<section class="eq-panel eq-center"><h3>Recall Center</h3>${status}<button class="primary" data-act="rest">Rest to full strength for free</button><p>${misses.length?`${misses.length} missed question${misses.length===1?' is':'s are'} waiting. Review them when you choose, or rest now for free.`:hurt?'No misses to recall. Rest here and your team recovers fully.':'Your team is at full strength. Misses from battles land here.'}</p>${misses.length?`<button class="primary" data-act="center">Heal your team (${Math.min(10,misses.length)} at a time)</button>`:hurt?'<button class="primary" data-act="rest">Rest to full strength</button>':'<button class="secondary" disabled>Heal your team</button>'}</section>`;})()}
          ${grovePanel()}
          <section class="eq-panel eq-blitz"><h3>Blitz: optional arcade</h3><p>60 seconds of active answer time; feedback pauses the clock. Practice only, with game points and a combo multiplier. ${s.blitz?.best?`Best ${s.blitz.best}.`:'Set your first score.'}</p><button class="primary" data-act="blitz">Play Blitz</button></section>
        </div>
      </div>
      ${report(st)}
      <div class="eq-grid2">${radar(st)}${medalsPanel(st)}</div>
      ${typeChart()}
      <section class="eq-panel"><div class="eq-row"><h3>${esc(L.safari)}</h3><span class="eq-hunt-row"><button class="primary eq-inline" data-act="hunt">Hunt weak spots</button><button class="secondary eq-inline" data-act="wild" data-s="${next.x.n}">Surprise me</button></span></div>
        <p class="eq-note">Wear its HP down with correct answers to catch it; if your whole team faints, it gets away. Stars need a cleaner catch at least 20 minutes after the last one, so mixing routes pays off.</p>
        <div class="eq-dex">${SESSIONS.map(x=>{const d=s.dex[x.n]||{},n=d.stars||0,few=!AC.sessionAvailability(COURSE,x.n).available,wait=n&&n<3&&Date.now()-Date.parse(d.starAt||0)<SPACING;return `<button class="eq-mon${n?' caught':''}${few?' fog':''}" data-act="${few?'':'dex'}" data-s="${x.n}" ${few?'disabled':''}><canvas data-creature="${x.creature}" data-evolved="${n>=3?1:0}" data-shadow="${n?0:1}" width="72" height="64" aria-hidden="true"></canvas>${d.rare?'<em class="eq-shiny-tag">Rare</em>':''}<span class="eq-sn">R${x.n}</span><strong>${few?'Not yet charted':n?esc(cname(x.creature,n>=3)):'???'}</strong><small>${esc(x.title)}</small>${stars(n)}${d.shiny?'<em class="eq-shiny-tag">Gleaming</em>':''}${wait?`<em>next star after ${hhmm(Date.parse(d.starAt)+SPACING)}</em>`:''}</button>`;}).join('')}</div>
        ${waterRow(s)}</section>`;
      paint();
    }

    function dexView(n){
      battle=null;center=null;const x=SESSIONS.find(y=>y.n===+n);if(!x)return home();const d=S().dex[x.n]||{},st=d.stars||0,e=DEX()[x.n];
      const acc=(()=>{const r=S().attempts.filter(a=>a.s===x.n).slice(-20);return r.length?Math.round(r.filter(a=>a.ok).length/r.length*100)+'% of your last '+r.length:'No answers yet';})();
      dialog.innerHTML=`<div class="world-panel-header"><div><p class="eyebrow">Field guide | Route ${x.n}${e?.lecturer?' | '+esc(e.lecturer):''}</p><h2>${st?esc(cname(x.creature,st>=3)):'Unknown Mnemon'}</h2></div><button class="eq-chip" data-act="home">Back</button></div>
      <section class="eq-dexhead"><canvas data-creature="${x.creature}" data-evolved="${st>=3?1:0}" data-shadow="${st?0:1}" width="120" height="104" aria-hidden="true"></canvas><div><h3>${esc(x.title)} ${typeTag(x.creature)}</h3>${stars(st)}<p class="eq-note">Practice responses: ${acc}. Game rewards do not establish mastery.</p><div class="gx-actions"><button class="primary" data-act="wild" data-s="${x.n}">Battle on Route ${x.n}</button></div></div></section>
      ${B?.isLine?.(x.creature)?(()=>{const lf=B.lineFor(x.n,COURSE);if(!lf)return '';
        // An Exam 2 line evolves with its page (exam2-route-creatures.js): the warden beaten, then 8 of the last 10 right.
        const stage=x.e2?(st?Math.max(0,+(B.stageOf?B.stageOf(lf.id):0)||0):-1):st>=3?2:st>=2?1:st?0:-1,how=x.e2?['Catch it','Page warden beaten','Warden and 8 of 10 right']:['Catch it','2 stars','3 stars'];
        return `<section class="eq-panel eq-forms"><h4>Evolution line</h4><div class="eq-formrow">${lf.names.map((nm,k)=>`<div class="eq-form${k<=stage?'':' locked'}"><canvas data-creature="${lf.id}" data-stage="${k}" data-shadow="${k<=stage?0:1}" width="84" height="74" aria-hidden="true"></canvas><b>${k<=stage?esc(nm):'???'}</b><small>${how[k]||''}</small></div>`).join('<i class="eq-arrow-r"></i>')}${lf.rare?`<div class="eq-form rare${d.rare?'':' locked'}"><canvas data-creature="${lf.rare}" data-stage="0" data-shadow="${d.rare?0:1}" width="84" height="74" aria-hidden="true"></canvas><b>${d.rare?esc(lf.rareName||cname(lf.rare)):'Rare variant'}</b><small>${d.rare?'Caught':'Sometimes appears on this route'}</small></div>`:''}</div><p class="eq-note">${x.e2?'Exam 2 creatures evolve with their page: beat the page warden, then get 8 of your last 10 answers on this session right.':'Lesson creatures evolve through game stars: stars on this session, not experience.'}</p></section>`;})():''}
      ${!e?`<section class="eq-panel"><p>The entry for this page is still being written.</p></section>`:`
      <section class="eq-panel eq-dexentry"><p class="eq-core">${esc(e.core||'')}</p>
        <h4>Field notes</h4><ol class="eq-facts">${(e.facts||[]).map(f=>`<li>${esc(f.t)}<small>${esc(f.src||'')}</small></li>`).join('')}</ol>
        ${(e.traps||[]).length?`<h4>Traps</h4><ul class="eq-traps">${e.traps.map(f=>`<li>${esc(f.t)}<small>${esc(f.src||'')}</small></li>`).join('')}</ul>`:''}
        ${e.stressed?`<blockquote class="eq-stressed">${esc(e.stressed)}</blockquote>`:''}
      </section>`}`;
      paint();dialog.scrollTop=0;
    }
    // Medals, sized to the course's route count.
    const MEDALS=[
      ['first','First field guide entry','Register your first creature',st=>st.caught>=1],['five','Page turner','Catch 5 creatures',st=>st.caught>=5],['ten','Collector','Catch 10 creatures',st=>st.caught>=10],['all','Complete field guide','Catch all '+K,st=>st.caught>=K],
      ['stars1','Rising star','Earn '+K+' stars',st=>st.starSum>=K],['stars2','Constellation','Earn '+2*K+' stars',st=>st.starSum>=2*K],['stars3','Full sky','Earn all '+3*K+' stars',st=>st.starSum>=3*K],
      ['streak10','On fire','10 correct in a row',st=>st.best>=10],['streak25','Unstoppable','25 correct in a row',st=>st.best>=25],['century','Century','100 correct answers',st=>st.correctAll>=100],['marathon','Marathon','300 answers in one day',st=>st.todays.length>=300],
      ['healer','Healer','Heal 25 misses',st=>st.healed>=25],['shiny','Gleam hunter','Catch a gleaming creature',st=>Object.values(st.s.dex).some(d=>d&&d.shiny)],['perfect','Flawless','Catch a creature with no misses',st=>!!st.s.perfectCatch],
      ['blitz150','Blitz ace','Score 150 in Blitz',st=>(st.s.blitz?.best||0)>=150]];

    function checkMedals(){const st=stats(),have=new Set(st.s.medals||[]),newly=MEDALS.filter(m=>!have.has(m[0])&&m[3](st));if(newly.length){const s=S();s.medals=[...have,...newly.map(m=>m[0])];save(s);try{root.AtlasMusic?.jingle('victory');}catch(e){}}return newly;}
    function medalLine(){const n=checkMedals();return n.length?`<p class="eq-medal-new">Medal earned: ${n.map(m=>`<b>${esc(m[1])}</b>`).join(', ')}</p>`:'';}
    function medalsPanel(st){const have=new Set(st.s.medals||[]);return `<section class="eq-panel"><div class="eq-row"><h3>Medals</h3><small>${have.size}/${MEDALS.length}</small></div><div class="eq-medals">${MEDALS.map(m=>`<span class="eq-medal${have.has(m[0])?' on':''}" title="${esc(m[2])}"><i></i><b>${esc(m[1])}</b><small>${esc(m[2])}</small></span>`).join('')}</div></section>`;}
    function radar(st){
      const vals=SESSIONS.map(x=>{const r=st.s.attempts.filter(a=>a.s===x.n&&a.m!=='center'&&!a.h&&!a.f).slice(-10);return {n:x.n,v:r.length?r.filter(a=>a.ok).length/r.length:null,c:r.length};});
      const R=110,cx=140,cy=135,pt=(i,f)=>{const a=-Math.PI/2+i*2*Math.PI/K;return [cx+Math.cos(a)*R*f,cy+Math.sin(a)*R*f];};
      const ring=f=>SESSIONS.map((_,i)=>pt(i,f).map(v=>v.toFixed(1)).join(',')).join(' ');
      const poly=vals.map((v,i)=>pt(i,v.v==null?0:Math.max(.04,v.v)).map(n=>n.toFixed(1)).join(',')).join(' ');
      const tested=vals.filter(v=>v.v!=null);
      return `<section class="eq-panel eq-radar"><div class="eq-row"><h3>Practice by route</h3><small>unassisted responses, last 10 per route</small></div>
        <svg viewBox="0 0 280 270" role="img" aria-label="Recent practice by route: ${vals.map(v=>'S'+v.n+' '+(v.v==null?'untested':Math.round(v.v*100)+'%')).join(', ')}">
          ${[.25,.5,.75,1].map(f=>`<polygon points="${ring(f)}" class="rd-ring${f===.8?' goal':''}"/>`).join('')}
          ${SESSIONS.map((_,i)=>{const [x,y]=pt(i,1);return `<line x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" class="rd-axis"/>`;}).join('')}
          <polygon points="${poly}" class="rd-area"/>
          ${vals.map((v,i)=>{const [x,y]=pt(i,1.13);return `<text x="${x.toFixed(1)}" y="${(y+4).toFixed(1)}" class="rd-label${v.v==null?' none':v.v>=.8?' good':v.v<.5?' low':''}">S${v.n}</text>`;}).join('')}
        </svg><p class="eq-note">${tested.length?`${tested.length} of ${K} routes have response history. Unknown routes are not a zero score. This is not a DAT readiness estimate.`:'No response evidence yet. Game rewards are separate from learning evidence.'}</p></section>`;
    }
    function evolveScene(id,from,to){const p={id:id||battle?.team?.[battle.active]?.id||P().id};if(FX)return FX.evolveHTML(p.id,from,to);return `<div class="eq-evolve" aria-label="Evolution"><canvas data-creature="${esc(p.id)}" data-evolved="0" class="evo-a" width="140" height="124"></canvas><canvas data-creature="${esc(p.id)}" data-evolved="1" class="evo-b" width="140" height="124"></canvas></div>`;}

    // ---------- Blitz ----------
    let blitz=null,blitzTimer=null;
    function startBlitz(){if(!items.length){root.AtlasApp?.notice?.('No reviewed practice items are available yet.');return home();}battle=null;center=null;const st=stats();
      const weak=new Map(SESSIONS.map(x=>{const r=st.s.attempts.filter(a=>a.s===x.n).slice(-10);return [x.n,r.length?1-r.filter(a=>a.ok).length/r.length:.5];}));
      const s=S(),bag=shuffle(items.filter(x=>x.tier==='exam')).sort((a,b)=>((s.seen[a.id]||0)-(weak.get(a.session)||0)*3)-((s.seen[b.id]||0)-(weak.get(b.session)||0)*3));
      blitz={bag,idx:0,score:0,combo:0,correct:0,total:0,end:Date.now()+60000,phase:'play',flash:null};music('battle');flash();nextBlitz();
      clearInterval(blitzTimer);blitzTimer=setInterval(()=>{if(!blitz||destroyed){clearInterval(blitzTimer);return;}if(blitz.flash)return;const left=Math.max(0,Math.ceil((blitz.end-Date.now())/1000));const el=dialog.querySelector('[data-blitz-clock]');if(el)el.textContent=left+'s';if(left<=0){clearInterval(blitzTimer);endBlitz();}},250);}
    function nextBlitz(){const b=blitz;const x=b.bag[b.idx++%b.bag.length];b.cur={id:x.id,perm:dealPerm(x)};b.flash=null;renderBlitz();}
    function renderBlitz(){const b=blitz;if(b.phase==='done')return;const it=byId.get(b.cur.id),left=Math.max(0,Math.ceil((b.end-Date.now())/1000));
      dialog.innerHTML=`<div class="bz-bar"><span class="bz-clock" data-blitz-clock>${left}s</span><span class="bz-score">${b.score}</span><span class="bz-combo">x${Math.min(5,b.combo+1)}</span><button class="eq-chip" data-act="home">Quit</button></div>
      <article class="gx-q eq-q bz-q ${b.flash?'bz-'+b.flash:''}"><p class="eyebrow">Route ${it.session}${it.kind==='tf'?' | True or false':it.kind==='stem'?' | Completes the statement':''}</p>${passageHTML(it)}<h3>${esc(it.stem)}</h3>${it.fig?`<figure class="gx-fig q-fig"><img src="${esc(it.fig)}" data-zoom alt="${esc(it.figureAlt||'Question diagram')}" loading="lazy" onerror="this.closest('figure').remove()"><figcaption>Tap to enlarge</figcaption></figure>`:''}<div class="gx-options">${b.cur.perm.map((o,i)=>{let cls='gx-opt';if(b.flash){if(o===it.answer)cls+=' eq-key';else if(i===b.pick)cls+=' eq-mine';else cls+=' eq-dim';}return `<button class="${cls}" data-bz="${i}"><b>${LETTERS[i]}</b><span>${optionVisualHTML(it,o)}${esc(it.options[o])}${b.flash?`<small class="eq-why">${esc(it.why[o])}</small>`:''}</span></button>`;}).join('')}</div>${b.flash?`<p>${esc(it.tell)}</p><button class="primary" data-act="blitz-next">Continue</button>`:''}</article>`;}
    function blitzAnswer(i){const b=blitz;if(!b||b.phase!=='play'||b.flash)return;const it=byId.get(b.cur.id);if(!Number.isInteger(i)||i<0||i>=b.cur.perm.length)return;const ok=b.cur.perm[i]===it.answer,s=S();b.pick=i;b.total++;
      const meta={attemptId:attemptID(),correct:ok,assisted:false,practice:true,repeated:s.attempts.some(a=>a.id===it.id),objectiveId:it.objectiveId,familyId:it.familyId,sourceId:it.sourceId,sourceVersion:it.sourceVersion,pool:it.pool};s.attempts.push({id:it.id,s:it.session,ok,at:new Date().toISOString(),m:'blitz',...meta});s.seen[it.id]=(s.seen[it.id]||0)+1;root.AtlasSRS?.grade(it.id,ok?2:0,{session:it.session,...meta});exposure(it,'feedback');emit(it,ok,{...meta,battle:'blitz'});
      if(ok){b.correct++;b.score+=10*Math.min(5,b.combo+1);b.combo++;s.coins=(s.coins||0)+1;sfx(b.combo>=3?'crit':'hit');}else{b.combo=0;s.misses[it.id]={at:new Date().toISOString(),healed:false,count:((s.misses[it.id]||{}).count||0)+1};missBank(it,b.cur.perm[i]);noteMiss(b,it,b.cur.perm[i]);sfx('miss');}
      save(s);b.flash=ok?'ok':'no';b.pausedAt=Date.now();renderBlitz();}
    function endBlitz(){const b=blitz;if(!b||b.phase==='done')return;b.phase='done';const s=S();const prev=s.blitz?.best||0;s.blitz={best:Math.max(prev,b.score),runs:(s.blitz?.runs||0)+1,last:b.score};save(s);
      try{opts.onXP?.('blitz:'+Date.now(),Math.round(b.correct*2));}catch(e){}sfx(b.score>prev?'star':'catch');
      dialog.innerHTML=`<div class="eq-end win"><p class="eyebrow">Blitz | 60 seconds</p><h3>${b.score} points${b.score>prev&&prev?' | new best!':''}</h3><p>${b.correct} of ${b.total} correct${b.total?` (${Math.round(b.correct/b.total*100)}%)`:''}. Best ${Math.max(prev,b.score)}. Misses went to the Recall Center with their full explanations.</p>${medalLine()}<div class="gx-actions"><button class="primary" data-act="blitz">Play again <kbd>Enter</kbd></button><button class="secondary" data-act="center">Heal the misses</button><button class="secondary" data-act="home">Quest home</button></div>${debriefHTML(b)}</div>`;}
    // Gyms live in the world (bio/region-bio.js); gauntlet stays null here.
    let gauntlet=null;
    function typeChart(){if(!B?.chart)return '';const T=PACKED?(B.typesFor?B.typesFor(COURSE):{}):B.types,chart=PACKED?(B.chartFor?B.chartFor(COURSE):{strong:[],weak:[]}):B.chart,lines=PACKED?(B.linesFor?B.linesFor(COURSE):[]):B.lines,SEC=PACKED?(B.secondFor?B.secondFor(COURSE):null):B.SECOND;
      const tag=t=>{const x=T[t]||tinfo(t);return x?`<span class="type-tag" style="--tc:${x.color}">${esc(x.name)}</span>`:'';},styleOfType=t=>root.AtlasMoves.styleForType?root.AtlasMoves.styleForType(t):root.AtlasMoves.STYLES[t];
      return `<details class="eq-panel eq-typechart"><summary><h3>Type Codex</h3><small>${esc(L.types)}, their fighting styles, and why each matchup works</small></summary>
        <p class="eq-note">Your moves carry your creature's type. A strong match does 1.2x, a weak match 0.85x. Final forms have two types, so the multipliers stack, kept between 0.8x and 1.25x so the count of correct answers a battle needs stays honest. The foe's attacks follow the same chart against your creature.</p>
        <div class="eq-types">${Object.keys(T).filter(t=>t!=='neutral').map(t=>`<div>${tag(t)}<small>${SESSIONS.filter(x=>B.typeOf(x.creature)===t).map(x=>'S'+x.n).join(', ')}</small></div>`).join('')}</div>
        <h4>Strong matches</h4><ul class="eq-matchups">${chart.strong.map(([a,d,w])=>`<li>${tag(a)} beats ${tag(d)} <small>${esc(w)}</small></li>`).join('')}</ul>
        <h4>Weak matches</h4><ul class="eq-matchups">${chart.weak.map(([a,d,w])=>`<li>${tag(a)} into ${tag(d)} <small>${esc(w)}</small></li>`).join('')}<li>Any type into itself <small>Same type resists itself.</small></li></ul>
        ${root.AtlasMoves?`<h4>Fighting styles</h4><ul class="eq-matchups">${Object.keys(T).filter(t=>t!=='neutral'&&styleOfType(t)).map(t=>{const y=styleOfType(t);return `<li>${tag(t)} <b>${esc(y.name)}</b> <small>${esc(y.say)} ${esc(y.fact)}</small></li>`;}).join('')}</ul>`:''}
        ${SEC?`<h4>Final forms: dual types</h4><ul class="eq-matchups">${lines.map(l=>{const f=l[2][2],id=f.toLowerCase(),t2=SEC[id];return t2?`<li><b>${esc(f)}</b> ${tag(l[1])} ${tag(t2)} <small>S${l[0]}. ${esc(B.secondWhy(l[2][0].toLowerCase()))}</small></li>`:'';}).join('')}</ul>`:''}
        ${root.AtlasMoves?`<h4>Move formats</h4><ul class="eq-matchups">${Object.entries(root.AtlasMoves.FORMAT).map(([k,f])=>`<li><b>${esc(f.name)}</b> <small>${esc(f.note)}. Power ${f.power}${f.pp<99?', '+f.pp+' uses per battle':''}. ${k==='quick'||k==='standard'?'Every form knows it.':k==='signature'?'Final forms only.':'Unlocks at the middle form.'}</small></li>`).join('')}<li><b>Critical hit</b> <small>A correct answer from a type move, on every third consecutive correct response, is a bonus hit. Take as much reading time as you need. All bonuses together cap at +25 percent per hit.</small></li></ul>`:''}</details>`;}
    // ---------- Review Grove: pure spaced-repetition sessions ----------
    let grove=null;
    function dexCards(limit){return [];} // Legacy notes remain saved, but cannot become unverified questions.
    // Field-note cards use "dex:<COURSE>:<route>:<i>".
    const DEXCARD='dex:'+COURSE+':',DEXRE=new RegExp('^dex:'+COURSE+':\\d+:\\d+$');
    function startGrove(){battle=null;center=null;if(blitz){clearInterval(blitzTimer);blitz=null;}const R=root.AtlasSRS;if(!R)return home();music('town');
      const due=R.dueList(null,id=>!!groveCard({id}));const st=R.state();const newDex=dexCards(st.settings.newDex-st.daily.newDex);
      const q=due.map(id=>({id})).concat(newDex.map(c=>({id:c.id,fresh:true,card:c})));
      grove={q,i:0,done:0,revealed:false,crystals:0};renderGrove();}
    function groveCard(slot){
      if(!slot||/^dex:/.test(slot.id))return null;
      const it=byId.get(slot.id);if(!it||it.pool!=='practice')return null;
      return {item:it,kind:'q',ref:it.ref,session:it.session,front:it.stem,back:it.options[it.answer],why:it.why[it.answer]||'',src:it.src,title:(SESSIONS.find(x=>x.n===it.session)||{}).title};
    }
    function renderGrove(){const g=grove;const R=root.AtlasSRS;
      while(g.i<g.q.length&&!groveCard(g.q[g.i]))g.i++;
      if(g.i>=g.q.length){const sm=R.summary();dialog.innerHTML=`<div class="world-panel-header"><div><p class="eyebrow">Review Grove</p><h2>${g.done?'Reviews done':'Nothing due right now'}</h2></div><button class="eq-chip" data-act="home">Back</button></div><p>${g.done?`${g.done} card${g.done===1?'':'s'} reviewed, +${g.crystals} Memory Crystal${g.crystals===1?'':'s'}.`:'No reviewed practice cards are due in this world.'} ${sm.total} cards in your deck: ${sm.mature} mature, ${sm.young} young, ${sm.learning} learning.</p>${medalLine()}<div class="gx-actions"><button class="primary" data-act="home">Quest home <kbd>Enter</kbd></button></div>`;return;}
      const slot=g.q[g.i],c=groveCard(slot);
      dialog.innerHTML=`<div class="world-panel-header"><div><p class="eyebrow">Review Grove | ${g.i+1} of ${g.q.length} | Route ${c.session}: ${esc(c.title||'')}${slot.fresh?' | new field note':''}</p><h2>${c.kind==='dex'?'Finish the field note':'Recall the answer'}</h2></div><button class="eq-chip" data-act="home">Stop</button></div>
        <div class="srs-card">${passageHTML(c.item)}<p class="srs-front">${esc(c.front)}</p>${c.item?.fig?`<figure class="gx-fig"><img src="${esc(c.item.fig)}" alt="${esc(c.item.figureAlt)}"></figure>`:''}${g.revealed?`<div class="srs-back"><p class="eyebrow">Answer</p><p class="srs-answer">${c.item?optionVisualHTML(c.item,c.item.answer):''}${esc(c.back)}</p>${c.why?`<small>${esc(c.why)}</small>`:''}<p class="gx-src">${esc(srcLine(c.src))}</p></div><div class="srs-grades">${['Again','Hard','Good','Easy'].map((t,k)=>`<button class="srs-grade g${k}" data-ggrade="${k}"><kbd>${k+1}</kbd><strong>${t}</strong><small>${R.preview(slot.id,k)}</small></button>`).join('')}</div>`:`<button class="primary" data-act="grove-reveal">Show the answer <kbd>Space</kbd></button>`}</div>`;}
    function groveGrade(k){if(!Number.isInteger(k)||k<0||k>3)return;const g=grove;if(!g||!g.revealed)return;const slot=g.q[g.i],c=groveCard(slot);const R=root.AtlasSRS;if(!c){g.i++;g.revealed=false;renderGrove();return;}if(slot.fresh)R.noteNewDex();const r=R.grade(slot.id,k,{session:c.session,kind:c.kind,practice:true,assisted:true,objectiveId:byId.get(slot.id)?.objectiveId,familyId:byId.get(slot.id)?.familyId,pool:'practice'});
      if(c.kind==='q'){const s=S();s.attempts.push({id:slot.id,s:c.session,ok:k>=1,at:new Date().toISOString(),m:'grove',selfRated:true,practice:true,assisted:true,h:1,f:1,objectiveId:byId.get(slot.id)?.objectiveId,familyId:byId.get(slot.id)?.familyId,pool:'practice'});save(s);}
      if(r&&r.wasDue&&k>=2){g.crystals++;try{opts.onXP?.('grove:'+slot.id+':'+Date.now(),2);}catch(e){}}
      if(k===0){g.q.push({id:slot.id});}
      sfx(k>=2?'hit':k===1?'heal':'miss');if(r&&r.clearedNow){startOutbreak();}
      g.done++;g.i++;g.revealed=false;renderGrove();}
    function grovePanel(){const R=root.AtlasSRS;if(!R)return '';const sm=R.summary(),eligibleDue=R.dueList(null,id=>!!groveCard({id})).length,returnReady=new Set((root.AceDATReturnReview?.listEligible?.({course:COURSE})||[]).map(x=>x.objectiveId)).size,s=S(),ob=s.outbreak&&s.outbreak.until>Date.now()?s.outbreak:null;
      return `<section class="eq-panel eq-grove"><div class="eq-row"><h3>Review Grove</h3><small>${sm.crystals} Memory Crystals</small></div>
        <p class="srs-due"><b>${eligibleDue}</b> reviewed practice cards due${sm.overflow?` | <span class="srs-over">${sm.overflow} over today's budget, gathering as Team Entropy pressure</span>`:''}</p>
        <p class="eq-note">About 1 in 3 battle questions is a due card. The Grove is a pure Anki session when you want one. Today: ${sm.daily.reviews}/${sm.settings.budget} reviews${sm.daily.cleared?' | cleared':''}.</p>
        ${ob?`<p class="srs-outbreak">Outbreak: Route ${ob.session} creatures are everywhere, with triple shiny chance, until ${hhmm(ob.until)}.</p>`:''}
        <button class="primary" data-act="grove" ${eligibleDue?'':'disabled'}>Review due practice</button><p class="eq-note">Return Grove: ${returnReady} concept${returnReady===1?'':'s'} ready for a fresh delayed case. New cases use your earlier check and exposure records; adventure rewards stay separate.</p><button class="secondary" data-act="return-review">Visit the Return Grove</button>
        <div class="srs-budget">Daily budget ${[20,40,80,150].map(v=>`<button class="eq-chip${sm.settings.budget===v?' on':''}" data-act="grove-budget" data-v="${v}">${v}</button>`).join('')}</div></section>`;}
    function report(st){
      const a=st.todays.filter(x=>x.m!=='center');if(a.length<20)return '';
      const n=Math.min(40,Math.floor(a.length/2)),first=a.slice(0,n),last=a.slice(-n),pct=r=>Math.round(r.filter(x=>x.ok).length/r.length*100);
      const by=SESSIONS.map(x=>{const r=a.filter(y=>y.s===x.n);return {x,n:r.length,p:r.length?pct(r):null};}).filter(y=>y.n>=4).sort((p,q)=>q.p-p.p);
      const healed=st.todays.filter(x=>x.m==='center'&&x.ok).length,up=pct(last)-pct(first);
      return `<section class="eq-panel eq-report"><div class="eq-row"><h3>Today's report</h3><small>${a.length} battle answers${healed?` | ${healed} misses healed`:''}</small></div>
        <div class="eq-trend"><div><span>First ${n} answers</span><b>${pct(first)}%</b></div><div class="eq-arrow" aria-hidden="true"></div><div><span>Latest ${n} answers</span><b>${pct(last)}%</b></div><p>${up>0?`Up ${up} points since takeoff.`:up===0?'Holding steady. Newer sessions are in the mix now, so steady is good.':'Harder sessions are in the mix now. Heal the misses and check again.'}</p></div>
        ${by.length>=2?`<p class="eq-note">Strongest: ${by.slice(0,2).map(y=>'S'+y.x.n+' '+esc(y.x.title)+' ('+y.p+'%)').join(', ')}. Most room to grow: ${by.slice(-2).reverse().map(y=>'S'+y.x.n+' '+esc(y.x.title)+' ('+y.p+'%)').join(', ')}.</p>`:''}</section>`;
    }

    // ---------- battle ----------
    // only (optional): a Set of ids a world route deals from (a split route's side of the session).
    function deal(session,extra,hard,only){
      const s=S(),gym=readJSON(GYM,{seen:{}}),gs=gym.seen||{};
      let rows=rowsOf(session).filter(x=>x.session===+session);if(only)rows=rows.filter(x=>only.has(x.id));const allowed=new Set(rows.map(x=>x.id));
      const missed=rows.filter(x=>s.misses[x.id]&&!s.misses[x.id].healed);
      const fresh=shuffle(rows).sort((a,b)=>(hard?(HARD.includes(a.kind)&&a.tier==='exam'?0:1)-(HARD.includes(b.kind)&&b.tier==='exam'?0:1):0)||((s.seen[a.id]||0)+(gs[a.id]||0))-((s.seen[b.id]||0)+(gs[b.id]||0))||(a.tier==='exam'?-1:1)-(b.tier==='exam'?-1:1));
      const out=[],SR=root.AtlasSRS;
      // 10/23: AtlasSRS.order deals the encounter: new questions first, a due review (a miss after its 10 minutes, a
      // card on its day) about 1 encounter in 4, never one answered in the last 5. A miss no longer jumps the line.
      if(SR&&typeof SR.order==='function'){for(const id of SR.order(rows.map(x=>x.id),{n:7+(extra||0),prefer:hard?id=>{const x=byId.get(id);return x&&HARD.includes(x.kind)&&x.tier==='exam'?1:0;}:null})){const x=byId.get(id);if(x&&allowed.has(id)&&!out.some(y=>y.id===id))out.push(SR.isReview(id)?{...x,_review:true}:x);}}
      else{if(missed.length)out.push(shuffle(missed)[0]);
      const dueIds=(root.AtlasSRS?.blendFor(session,Math.round((7+(extra||0))*((root.AtlasSRS?.summary().settings.blend)||.34)),id=>allowed.has(id))||[]).filter(id=>!out.some(x=>x.id===id));for(const id of dueIds){const x=byId.get(id);if(x&&allowed.has(id)&&x.session===session&&(!only||!only.size||only.has(x.id)))out.push({...x,_review:true});}
      for(const x of fresh){if(out.length>=7+(extra||0))break;if(!out.some(o=>o.id===x.id))out.push(x);}}
      if(!out.length&&rows.length){const familiar=fresh[0];out.push({...familiar,_repeat:true});}
      if(IX()){const cards=(()=>{try{return root.AtlasSRS?.state?.().cards||{};}catch(e){return {};}})(),lastAt=id=>{let t=0;for(const a of s.attempts)if(a.id===id){const v=Date.parse(a.at);if(v>t)t=v;}return t;},
        bound=rows.filter(x=>IXS(x)&&((cards[x.id]&&+cards[x.id].due<=Date.now())||Date.now()-lastAt(x.id)>=2*864e5));if(bound.length&&!out.some(x=>IXS(x))){const pb=shuffle(bound)[0],free=out.map((x,j)=>j).filter(j=>!out[j]._review&&!(s.misses[out[j].id]&&!s.misses[out[j].id].healed)),k=free.length?free[Math.floor(Math.random()*free.length)]:null;if(k!=null)out[k]=pb;else out.push(pb);}}
      {const rev=out.filter(x=>x._review),rest=out.filter(x=>!x._review),mix=[];while(rev.length||rest.length){if(rest.length)mix.push(rest.shift());if(rest.length)mix.push(rest.shift());if(rev.length)mix.push(rev.shift());}out.length=0;out.push(...mix);}
      return out.map(x=>({id:x.id,review:!!x._review,repeatPractice:!!x._repeat,perm:dealPerm(x)}));
    }
    // ---------- classic battle ----------
    const STANCES=[{id:'watch',w:40,say:'is watching you closely.',tip:'A normal turn. Your attack moves hit in full.'},{id:'heavy',w:25,say:'is winding up a heavy attack!',tip:'A miss hurts 1.5x. Guard blunts it.'},{id:'braced',w:20,say:'braced itself.',tip:'Attack bonuses are blunted this turn. Insight ignores the brace.'},{id:'off',w:15,say:'is off balance!',tip:'Your attack moves get a bonus.'}];
    function rollStance(){let r=Math.random()*100;for(const x of STANCES){if((r-=x.w)<0)return x;}return STANCES[0];}
    // HP carries between battles. Fainted Mnemons stay down until healed at the Recall Center,
    // revived, or ten minutes pass away from battle.
    const REST=10*60000;
    function savedHP(id,max){const e=(S().hp||{})[id];if(!e||Date.now()-Date.parse(e.at||0)>=REST)return max;return Math.max(0,Math.min(max,Math.round(e.hp)));}
    function teamFor(){const list=(opts.getParty?.()||[P()]).filter(Boolean).slice(0,6);return (list.length?list:[P()]).map(m=>{const lv=B?B.level(m.xp):1,max=90+Math.min(40,lv*4);const tr=B?.find(m.id)?.trait||{};return {id:m.id,xp:m.xp,lv,max,hp:savedHP(m.id,max),trait:tr};});}
    function keepHP(s,team){s.hp=s.hp||{};const now=new Date().toISOString();for(const t of team||[]){if(t.hp>=t.max)delete s.hp[t.id];else s.hp[t.id]={hp:Math.max(0,t.hp),max:t.max,at:now};}}
    function teamState(){const t=teamFor();return {team:t,fainted:t.filter(x=>x.hp<=0).length,hurt:t.filter(x=>x.hp>0&&x.hp<x.max).length,all:t.every(x=>x.hp<=0)};}
    function healTeam(s,frac){s.hp=s.hp||{};for(const [id,e] of Object.entries(s.hp)){const max=e.max||120;const hp=Math.min(max,Math.max(0,e.hp)+Math.ceil(max*frac));if(hp>=max)delete s.hp[id];else s.hp[id]={...e,hp,max};}}
    function blackout(){battle=null;center=null;music('town');const ts=teamState(),misses=openMisses().length;const back=Object.values(S().hp||{}).reduce((a,e)=>Math.max(a,Date.parse(e.at||0)+REST),0);
      dialog.innerHTML=`<div class="world-panel-header"><div><p class="eyebrow">Recall Center</p><h2>Your team is out cold</h2></div><button class="eq-chip" data-act="home">Quest home</button></div>
      <section class="eq-panel"><p>All ${ts.team.length} of your Mnemons fainted. ${misses?'Rest now for free, or choose missed-question practice.':'You have no open misses to recall, so they can rest here to full strength.'}</p><p class="eq-note">Or step away from battle: they recover on their own at ${hhmm(back)}.</p>
      <div class="gx-actions"><button class="primary" data-act="rest">Rest to full strength for free</button>${misses?'<button class="secondary" data-act="center">Optional missed-question practice</button>':'<button class="primary" data-act="rest">Rest to full strength</button>'}</div></section>`;}
    function newBattle(base){const team=base.team||teamFor();const b={...base,team,active:Math.max(0,team.findIndex(t=>t.hp>0)),streak:0,hits:0,misses:0,missed:[],phase:'intro',startedAt:Date.now(),stance:rollStance(),insightLeft:2+(team[0].trait.id==='insight'?1:0),log:[],pp:{},atp:0,h:0,chain:0,corrects:0,proofUsed:false,silenceUsed:false,silenced:false,foeMax:base.foeMax,foeHP:base.foeMax};b.prevFoe=b.foeHP;b.prevMe=team[b.active].hp;b.insightLeft=2+(team[b.active].trait.id==='insight'?1:0);return b;}
    // A world wild battle may name the ids of its route (opts.start.only); a rematch of the same session keeps them.
    const WILD_ONLY=opts.start&&Array.isArray(opts.start.only)?{n:+opts.start.wild,set:new Set(opts.start.only)}:null;
    function startWild(n,label,only){if(only&&! (only instanceof Set))only=new Set(Array.isArray(only)?only:[]);if(!only&&WILD_ONLY&&WILD_ONLY.n===+n)only=WILD_ONLY.set;
      if(teamState().all)return blackout();
      grove=null;if(blitz){clearInterval(blitzTimer);blitz=null;}
      const x=SESSIONS.find(y=>y.n===+n);if(!x)return;const ob=S().outbreak,obOn=ob&&ob.until>Date.now()&&ob.session===x.n;const shiny=Math.random()<(obOn?0.15:0.05);const lf=B?.lineFor?.(x.n,COURSE);const rare=!shiny&&!x.e2&&lf&&lf.rare&&Math.random()<(root.AtlasSky?.rareChance?root.AtlasSky.rareChance(COURSE,x.n):0.08);const queue=deal(x.n,0,shiny||rare,only);if(!queue.length){root.AtlasApp?.notice?.('No reviewed practice is available for this chapter yet.');return home();}
      const d=S().dex[x.n]||{};
      // The encounter stage: the form this session's line has reached when the battle starts. The foe's
      // name, sprite and types all use it, so a later star never renames the creature mid-battle.
      // An Exam 2 wild is met at its first form, as the route's wild table rolls it.
      const stage=rare?0:starStage(d.stars||0);
      battle=newBattle({x:rare?{...x,creature:lf.rare}:x,queue,i:0,foeMax:Math.min(shiny||rare?150:125,queue.length*HIT.lo(.8)),power:34,stars:d.stars||0,stage,label:label||'',shiny,rare,only:only||null});
      sfx('appear');music('battle');flash();renderBattle();
    }
    function returnUnavailable(message){battle=null;center=null;destroyModel();dialog.innerHTML=`<div class="world-panel-header"><div><p class="eyebrow">Return Grove | ${esc(PACK.name)}</p><h2>No fresh return case is ready</h2></div><button class="eq-chip" data-act="close">Back to the world</button></div><section class="eq-panel"><p>${esc(message||'A fresh return case needs an earlier independent success on its objective, a new question family, and at least 20 hours since relevant instruction or responses.')}</p><p>Nothing is lost. Your earlier results, creatures and route progress stay yours. You can study or explore another realm while this case waits.</p><div class="gx-actions"><button class="primary" data-act="home">Open practice and field notes</button><button class="secondary" data-act="close">Keep exploring</button></div></section>`;}
    function startReturn(){const rows=root.AceDATReturnReview?.listEligible?.({course:COURSE})||[];if(!rows.length)return returnUnavailable();return startSpecial({id:'return-'+COURSE+'-'+Date.now(),kind:'return-review',assessment:'later',name:PACK.name+' Return Keeper',sub:'Return Grove | fresh cases from an earlier visit',items:rows.map(x=>x.itemId)});}
    function startSpecial(spec){
      if(!spec||typeof spec!=='object')return home();
      revokeChecks();const delayed=spec.assessment==='later',assessment=delayed||spec.assessment==='check',allowedPool=delayed?'later':assessment?'check':'practice';
      if(!delayed&&!(spec&&spec.team)&&teamState().all)return blackout();
      const requested=[...new Set((Array.isArray(spec.items)?spec.items:Array.isArray(spec.pool)?spec.pool:[]).filter(id=>typeof id==='string'))];
      const reserved=delayed?eligibleLaterItems(COURSE,PACK,requested):[];for(const it of reserved)byId.set(it.id,it);
      const eligible=delayed?new Set(reserved.map(x=>x.id)):null;
      const queue=requested.filter(id=>byId.get(id)?.pool===allowedPool&&(!delayed||eligible.has(id))).map(id=>{const x=byId.get(id);return {id,perm:dealPerm(x),review:!delayed&&!!root.AtlasSRS?.isReview?.(id),returnReview:delayed};});
      if(!queue.length){if(delayed)return returnUnavailable();root.AtlasApp?.notice?.('No reviewed '+allowedPool+' items are available for this encounter.');return home();}
      spec={...spec,assessment:delayed?'later':assessment?'check':null};
      const hits=delayed?queue.length:Math.min(spec.hp||queue.length,queue.length);
      if(delayed){spec={...spec,kind:'return-review',checkpoint:true,requiredCorrect:hits,creature:spec.creature||B?.lineFor?.(byId.get(queue[0].id).session,COURSE)?.id||'cytrus',name:spec.name||PACK.name+' Return Keeper',sub:spec.sub||'Return Grove',intro:`Return to ${PACK.world||PACK.name}: ${queue.length} fresh cases from earlier learning. Take your time. Help is always available; using it changes the evidence to supported practice. Your party HP and route progress are protected.`};}
      else if(assessment||/(^|-)warden$/.test(spec.kind||'')){spec={...spec,checkpoint:true,requiredCorrect:hits,intro:`${spec.name}: ${queue.length} checkpoint questions, ${hits} correct to pass. Every question is asked; damage bonuses never shorten it.`};}else spec={...spec,intro:HIT.strip(spec.intro)};
      const team=delayed||spec.kind==='expedition-check'?teamFor().map(t=>({...t,hp:t.max})):spec.team;
      battle=newBattle({x:{n:0,title:spec.sub,creature:spec.creature||(delayed?B?.lineFor?.(byId.get(queue[0].id).session,COURSE)?.id:null)||'cytrus'},special:spec,queue,i:0,foeMax:hits*25,power:spec.power||Math.ceil(100/Math.max(1,spec.lives||3)),team});
      battle.returnResponses=[];battle.checkResponses=[];sfx('appear');music(spec.kind==='legendary'?'legendary':'battle');flash();renderBattle();
    }
    // A checkpoint stem or its help must be durably presented before it can be shown.
    function prepareCheckCase(b){if(b.special?.assessment!=='check'||!['question','interactive'].includes(b.phase))return true;const slot=b.queue[b.i];if(slot?.checkPresented)return true;
      const it=slot&&byId.get(slot.id);if(!it)return false;slot.attemptId=slot.attemptId||attemptID();const begun=root.AtlasSRS?.beginCheck?.(it.id,slot.attemptId);
      if(!begun?.ok){b.phase='check-blocked';b.checkError='This question could not be recorded as viewed, so its text and help have not opened. Your previous saved history is kept. Retry saving or return to the adventure and export a backup from Settings.';renderBattle();return false;}
      slot.checkPresented=true;slot.checkFresh=begun.fresh===true;slot.repeatPractice=!slot.checkFresh;return true;
    }
    function retryCheck(){const b=battle;if(!b||b.phase!=='check-blocked')return;b.phase='question';b.move=b.move||'strike';b.moveName=b.moveName||'Strike';renderBattle();}
    // Only the case actually opened consumes novelty. Unopened queue entries remain reserved.
    function prepareReturnCase(b){if(b.special?.assessment!=='later'||!['question','interactive'].includes(b.phase))return true;const slot=b.queue[b.i];if(slot?.presented)return true;
      const R=root.AceDATReturnReview,it=slot&&byId.get(slot.id);if(!it)return false;
      const status=R?.status?.(it.id);slot.attemptId=slot.attemptId||attemptID();const begun=status?.eligible?R?.begin?.(it.id,slot.attemptId):null;
      if(!begun?.ok){b.queue.splice(b.i,1);b.skipped=(b.skipped||0)+1;b.special.requiredCorrect=b.queue.length;root.AtlasApp?.notice?.(root.AceDATReturnReview?.reasonLabels?.[begun?.reason||status?.reason]||'This case is no longer a fresh return check. It stays out of the current visit.');if(b.i>=b.queue.length){finishReturn();return false;}b.phase='moves';renderBattle();return false;}
      slot.presented=true;return true;
    }
    function finishReturn(){const b=battle;if(!b||b.phase==='end')return;const s=S(),responses=b.returnResponses||[],correct=responses.filter(x=>x.correct).length,delayed=responses.filter(x=>x.delayedRecall).length,help=responses.filter(x=>x.assisted||x.practice).length,unsaved=responses.filter(x=>!x.saved).length,xp=responses.length*2;s.battles=(s.battles||0)+1;save(s);
      if(xp)try{opts.onXP?.('return:'+b.special.id+':'+b.startedAt,xp,b.team[b.active]?.id);}catch(e){}
      try{opts.onSpecial?.({id:b.special.id,kind:'return-review',assessment:'later',completed:true,won:false,hits:correct,misses:responses.length-correct});}catch(e){}
      b.phase='end';b.endHTML=`<div class="eq-end win"><p class="eyebrow">Return Grove | ${esc(PACK.name)}</p><h3>Your return visit is complete</h3><p>${responses.length} fresh case${responses.length===1?'':'s'} answered · ${correct} correct · ${delayed} eligible delayed recall${delayed===1?'':'s'} · ${help} supported or practice response${help===1?'':'s'}.</p><p>${xp?`+${xp} adventure XP for taking the return visit. `:''}Adventure rewards and this learning evidence are separate. A few sampled cases do not certify the whole topic or predict a DAT score.</p>${unsaved?`<p role="alert">${unsaved} response${unsaved===1?' could':'s could'} not be saved to your learning record. No delayed-recall credit is claimed for those responses.</p>`:''}${b.skipped?`<p>${b.skipped} unopened case${b.skipped===1?' was':'s were'} kept out because fresh-review eligibility changed.</p>`:''}<p>Your party and route progress are safe. Keep the reasoning from the cases you missed; another realm may have a fresh return ready.</p><div class="gx-actions"><button class="primary" data-act="close">Back to the realms</button><button class="secondary" data-act="return-review">Check this grove again</button><button class="secondary" data-act="home">Practice and field notes</button></div>${debriefHTML(b)}</div>`;renderBattle();
    }
    // The item a slot names, or null (the battle ends) when the bank no longer holds it.
    function answerItem(b,slot){const it=slot&&byId.get(slot.id);if(!it){battle=null;home();return null;}return it;}
    function nextStarRule(b){const d=S().dex[b.x.n]||{},n=d.stars||0;if(n>=3)return {text:'All three stars earned. Battles still train your team.',ready:false};
      const wait=n?Date.parse(d.starAt||0)+SPACING-Date.now():0,need=n===0?'Catch it':n===1?'Catch it with at most 1 miss':'Catch it with no misses';
      return {text:`Star ${n+1}: ${need}${wait>0?`, after ${hhmm(Date.now()+wait)}`:''}.`,ready:wait<=0,need:n===0?Infinity:n===1?1:0};}
    function foeName(b){if(b.special)return b.special.name;const nm=b.rare?cname(b.x.creature):formAt(b.x.creature,b.stage||0);return (b.shiny?'Gleaming ':b.rare?'Rare ':'Wild ')+nm;}
    // Swap the upcoming question for one in the chosen move's format (wild battles only).
    function pullFor(format,b){if(b.special||!root.AtlasMoves)return;const M=root.AtlasMoves,cur=b.queue[b.i],it=byId.get(cur.id);if(format!=='signature'&&M.fits(format,it))return;
      const s=S(),rows=rowsOf(b.x.n);let cand=rows.filter(x=>x.session===b.x.n&&(!b.only||b.only.has(x.id))&&M.fits(format,x)&&!b.queue.some(q=>q.id===x.id));
      if(format==='signature'){const miss=rows.filter(x=>x.session===b.x.n&&(!b.only||b.only.has(x.id))&&s.misses[x.id]&&!s.misses[x.id].healed&&!b.queue.slice(0,b.i).some(q=>q.id===x.id));if(miss.length)cand=miss;}
      if(!cand.length)return;cand.sort((a,c)=>(s.seen[a.id]||0)-(s.seen[c.id]||0));const low=cand.filter(x=>(s.seen[x.id]||0)===(s.seen[cand[0].id]||0)),x=low[Math.floor(Math.random()*low.length)];
      b.queue.splice(b.i,1,{id:x.id,review:false,perm:dealPerm(x)});if(x.id!==cur.id&&!b.queue.slice(b.i+1).some(q=>q.id===cur.id))b.queue.push(cur);}
    function fxHTML(fx){return `<div class="pk-fx fx-${esc(fx.type)}${fx.big?' big':''}${fx.crit?' crit':''}${fx.sig?' sig':''}" aria-hidden="true">${'<i></i>'.repeat(8)}</div>`;}
    function styleMeter(b,t){if(t==='fuel')return ` <em class="pk-meter">Charge ${b.atp}/4</em>`;if(t==='redox')return ` <em class="pk-meter">Protons ${b.h}/4</em>`;if(t==='signal'&&b.chain>0)return ` <em class="pk-meter">Cascade x${(1+Math.min(.8,.2*b.chain)).toFixed(1)} next</em>`;if(t==='oxygen'&&b.chain>0)return ` <em class="pk-meter">Chain ${b.chain}</em>`;if(t==='gene')return ` <em class="pk-meter">${b.silenced?'Silencing ready':b.silenceUsed?'Silencing used':'Correct '+Math.min(3,b.corrects)+'/3'}</em>`;if(t==='helix')return ` <em class="pk-meter">${b.proofUsed?'Proofreading used':'Proofreading ready'}</em>`;return '';}
    // The source line in plain words: note file names never show.
    function srcLine(s){return String(s||'').replace(/\S*\.(?:md|txt|json|pdf|pptx?)\b/gi,'notes').trim();}
    function renderBattle(){
      if(destroyed||!battle)return;if(!prepareCheckCase(battle)||!prepareReturnCase(battle))return;const active=battle.phase==='review'?byId.get(battle.lastQ?.id):byId.get(battle.queue[battle.i]?.id);if(['question','feedback','focus','interactive','review'].includes(battle.phase)&&!active){battle=null;home();return;}
      const b=battle,x=b.x,d=S().dex[x.n]||{},caughtBefore=(d.stars||0)>=1,sp=b.special,me=b.team[b.active],anim=b.anim||'';
      const foeSprite=sp?(sp.sprite?`<canvas data-sprite="${sp.sprite}" width="132" height="116" aria-hidden="true"></canvas>`:`<canvas data-creature="${esc(sp.creature)}" data-evolved="${sp.evolved?1:0}"${sp.stage!=null?` data-stage="${sp.stage}"`:''} width="132" height="116" aria-hidden="true"></canvas>`):`<canvas data-creature="${x.creature}" data-stage="${b.stage||0}" data-evolved="0" data-shadow="0" width="132" height="116" aria-hidden="true"></canvas>`;
      const pct=(v,m)=>Math.max(0,Math.round(v/m*100)),col=v=>v>50?'hp-hi':v>20?'hp-mid':'hp-lo';
      const foePct=pct(b.foeHP,b.foeMax),mePct=pct(me.hp,me.max);
      const arena=`<div class="pk-arena ${anim} ${['question','feedback','interactive','moves','bag','team'].includes(b.phase)?'compact':''}">
        <div class="pk-foe-box"><strong>${esc(foeName(b))} ${tagsFor(foeTypes(b))}</strong><span>${sp?esc(sp.sub):'Route '+x.n+' | '+esc(x.title)}</span>${(()=>{if(sp?.assessment==='later')return `<small class="pk-togo">Return visit: ${(b.returnResponses||[]).length} of ${b.queue.length} cases answered</small>`;if(sp&&sp.checkpoint)return `<small class="pk-togo">Checkpoint: ${b.hits} of ${sp.requiredCorrect} correct | ${Math.max(0,b.queue.length-b.hits-b.misses)} left</small>`;const r=HIT.range(b.foeHP,hitOn(b,me).mult);return r.max>0?`<small class="pk-togo">${r.min===r.max?r.max:r.min+' to '+r.max} correct to go</small>`:'';})()}<div class="pk-hp"><em>HP</em><div class="pk-bar"><i class="${col(foePct)}" data-to="${foePct}" style="width:${pct(b.prevFoe,b.foeMax)}%"></i></div></div></div>
        <div class="pk-foe${b.shiny?' shiny':''}"><div class="pk-plat"></div>${foeSprite}${b.fx&&b.fx.on==='foe'?fxHTML(b.fx):''}${b.dmgFoe?`<b class="pk-dmg${b.fx&&b.fx.crit?' crit':''}">-${b.dmgFoe}</b>`:''}${b.catching?'<div class="pk-capsule"></div>':''}</div>
        <div class="pk-me"><div class="pk-plat"></div><canvas data-creature="${esc(me.id)}" data-evolved="${me.lv>=6?1:0}" data-back="1" width="120" height="106" aria-hidden="true"></canvas>${b.fx&&b.fx.on==='me'?fxHTML(b.fx):''}${b.dmgMe?`<b class="pk-dmg">-${b.dmgMe}</b>`:''}</div>
        <div class="pk-me-box"><strong>${esc(cname(me.id,me.lv>=6))} <small>Lv. ${me.lv}</small> ${tagsFor(myTypes(me))}</strong><div class="pk-hp"><em>HP</em><div class="pk-bar"><i class="${col(mePct)}" data-to="${mePct}" style="width:${pct(b.prevMe,me.max)}%"></i></div></div><span class="pk-num">${Math.max(0,me.hp)} / ${me.max}</span>${b.team.length>1?`<span class="pk-balls">${b.team.map(t=>`<i class="${t.hp>0?'':'out'}"></i>`).join('')}</span>`:''}${b.streak>=2?`<span class="eq-combo">Streak ${b.streak}</span>`:''}</div>
      </div>`;
      let body='';const who=esc(cname(me.id,me.lv>=6)),foe=esc(foeName(b));
      const box=(msg,cmds)=>`<div class="pk-box"><div class="pk-msg">${msg}</div>${cmds?`<div class="pk-cmds">${cmds}</div>`:''}</div>`;
      if(b.phase==='check-blocked'){body=box(`<p role="alert"><strong>${esc(b.checkError)}</strong></p>`,`<button type="button" class="pk-cmd primary" data-act="check-retry">Retry saving</button><button type="button" class="pk-cmd" data-act="close">Back to the adventure</button>`);}
      else if(b.phase==='intro'){const r=sp?null:nextStarRule(b);body=box(`<p><strong>${sp?esc(sp.intro):b.label?esc(b.label)+' A Route '+x.n+' creature: '+esc(x.title)+'.':foe+(b.shiny?' steps out! Its questions are harder and it is worth double XP. Route ':b.rare?' steps out! It only lives near this route, and its questions are harder. Route ':' steps out of the grass. Route ')+x.n+': '+esc(x.title)+'.'}</strong></p>${r?`<p class="pk-sub">${esc(r.text)}</p>`:''}<p class="pk-sub pk-count">${esc(countLine(b))}</p><p class="pk-sub">Trainer: "Go, ${who}!"</p>`,`<button class="pk-cmd primary" data-act="menu">Continue <kbd>Enter</kbd></button>`);}
      else if(b.phase==='menu'){body=box(`<p><strong>Your move, ${who}.</strong></p><p class="pk-sub">${foe} ${esc(b.stance.say)} <em>${esc(b.stance.tip)}</em></p><p class="pk-sub pk-count">${esc(countLine(b))}</p>`,`<button class="pk-cmd fight" data-act="moves"><kbd>1</kbd>Fight</button><button class="pk-cmd" data-act="bag"><kbd>2</kbd>Bag</button><button class="pk-cmd" data-act="team" ${b.team.length>1?'':'disabled'}><kbd>3</kbd>Team</button><button class="pk-cmd" data-act="run"><kbd>4</kbd>Run</button>`);}
      else if(b.phase==='moves'){const it=byId.get(b.queue[b.i].id),tf=it.kind==='tf',tr=me.trait||{},M=root.AtlasMoves;
        const at=B?.typeOf?.(me.id)||'neutral',ef=hitOn(b,me),back=hitBack(b,me),ft=foeTypes(b)[0],st=M?M.styleOf(me.id):null;
        const sig=M?M.movesFor(me):[];
        const hE=ef.mult,tactics=[['guard','Guard',`Hedge: correct deals ${HIT.lo(hE)}, no bonuses${tr.id==='shelter'?', and heals 12':tr.id==='tempered'?', and heals 8':''}. Wrong: you take a third of the hit.`],['insight','Insight',tf?'Not usable on true or false.':`Removes two wrong choices. Correct: ${HIT.lo(hE)} damage, no bonuses. ${b.insightLeft} left.`],...(b.special?.checkpoint?[]:[['focus','Focus',`Recall first, then rate yourself. Hard: ${HIT.lo(hE)}, Good: ${HIT.dmg(hE,1.1)}, Easy: ${HIT.dmg(hE,1.2)}. Feeds your review schedule.`]]),...(IXS(it)?[['model',modelLabel(IXS(it)),`Explore a reviewed model, then return to this unanswered question. Coaching only: no damage or graded credit; marks this response as assisted.`]]:[])];
        const moveBtn=(m,k)=>{const left=m.pp>=99?null:Math.max(0,m.pp-(b.pp[m.id]||0));return `<button class="pk-move sig fmt-${m.format} tc-${m.type}" data-move="${esc(m.id)}" ${left===0?'disabled':''}><kbd>${k+1}</kbd><strong>${esc(m.name)} <span class="type-tag" style="--tc:${tinfo(m.type)?.color||'#888'}">${esc(tinfo(m.type)?.name||'')}</span></strong><small><b>${esc(m.format==='signature'?'Signature':M.FORMAT[m.format].name)}</b> | ${esc(M.FORMAT[m.format].note)} | Power ${m.power}${left==null?'':` | ${left}/${m.pp} left`}</small><small class="mv-fact">${esc(m.fact)}</small></button>`;};
        body=box(`<p><strong>Choose a move.</strong> <span class="pk-sub">${tinfo(at)?.name||''} moves${ef.mult>1?` are <b>a strong match</b> here (x${ef.mult})`:ef.mult<1?' are <b>a weak match</b> here':' hit normally here'}.${ef.reason?' '+esc(ef.reason):''}${back.mult!==1?` Its ${esc(tinfo(ft)?.name||'')} attacks are ${back.mult>1?`<b>a strong match</b> against you (x${back.mult})`:`<b>a weak match</b> against you (x${back.mult})`}. ${esc(back.reason)}`:''}</span>${st&&st.type!=='neutral'?`<span class="pk-style"><b>${esc(st.name)}:</b> ${esc(st.say)}${styleMeter(b,st.type)}</span>`:''}</p>`,
          (sig.length?sig.map(moveBtn).join(''):`<button class="pk-move" data-move="strike"><kbd>1</kbd><strong>Strike</strong><small>Correct: ${HIT.lo(ef.mult)} to ${HIT.hi(ef.mult)} damage. Wrong: full counter.</small></button>`)+tactics.map(([id,n,t],k)=>`<button class="pk-move tactic" data-move="${id}" ${id==='insight'&&(tf||b.insightLeft<=0)?'disabled':''}><kbd>${(sig.length||1)+k+1}</kbd><strong>${n}</strong><small>${t}</small></button>`).join('')+`<button class="pk-cmd back" data-act="menu">Back</button>`);}
      else if(b.phase==='bag'){const bag=S().bag,canCap=!sp&&b.foeHP<=b.foeMax*.4;
        body=box(`<p><strong>Bag</strong></p><p class="pk-sub">Great Capsules only work once ${foe} is at 40% HP or less.</p>`,`${(()=>{const down=b.team.filter(t=>t.hp<=0).length;return `<button class="pk-move" data-item="revive" ${bag.revive>0&&down?'':'disabled'}><strong>Revive</strong><small>${down?'Wake a fainted teammate at half HP.':'Nobody has fainted.'} ${bag.revive||0} left.</small></button>`;})()}<button class="pk-move" data-item="potion" ${bag.potion>0&&me.hp<me.max?'':'disabled'}><strong>Potion</strong><small>Restore 50 HP to ${who}. ${bag.potion} left.</small></button><button class="pk-move" data-item="capsule" ${bag.greatCapsule>0&&canCap?'':'disabled'}><strong>Great Capsule</strong><small>${sp?'Cannot catch this opponent.':canCap?'Catch it now.':'Weaken it first.'} ${bag.greatCapsule} left.</small></button><button class="pk-cmd back" data-act="menu">Back</button>`);}
      else if(b.phase==='team'){body=box(`<p><strong>${b.forced?'Choose your next creature.':'Switch creature'}</strong></p>`,b.team.map((t,k)=>`<button class="pk-move" data-swap="${k}" ${t.hp<=0||k===b.active?'disabled':''}><strong>${esc(cname(t.id,t.lv>=6))} Lv. ${t.lv}</strong><small>${t.hp<=0?'Fainted':t.hp+' / '+t.max+' HP'} | ${esc(t.trait.role||'')}</small></button>`).join('')+(b.forced?'':`<button class="pk-cmd back" data-act="menu">Back</button>`));}
      else if(b.phase==='question'){
        const slot=b.queue[b.i],it=byId.get(slot.id),hide=b.hidden||[];
        // The visual never shows on the question screen; a figure item shows its figure (the item is about it).
        const qfig=it.fig||'';
        body=`<article class="gx-q eq-q pk-q"><p class="eyebrow">${who} used ${esc(b.moveName)}!${slot.review?' | <span class="srs-chip">Review card</span>':''}${slot.repeatPractice?' | Familiar practice':''}</p>${b.proofMsg?`<p class="pk-proof">${esc(b.proofMsg)}</p>`:''}${passageHTML(it)}<h3>${esc(it.stem)}</h3>${qfig?`<figure class="gx-fig q-fig"><img src="${esc(qfig)}" data-zoom alt="${esc(it.figureAlt||'Question diagram')}" loading="lazy" onerror="this.closest('figure').remove()"><figcaption>Tap to enlarge</figcaption></figure>`:''}<div class="gx-options">${slot.perm.map((o,i)=>{if(hide.includes(o))return '';return `<button class="gx-opt" data-pick="${i}"><b>${LETTERS[i]}</b><span>${optionVisualHTML(it,o)}${esc(it.options[o])}</span></button>`;}).join('')}</div>
          <div class="mq-unsure-row"><button type="button" class="secondary" data-act="dont-know">I don’t know yet · show the reasoning</button>${IXS(it)?'<button type="button" class="secondary" data-act="model">Build this concept</button>':''}<button type="button" class="mq-unsure" data-act="unsure" aria-pressed="${b.unsure?'true':'false'}">Unsure</button><small>Tap before you answer if this is a guess. <kbd>U</kbd></small></div></article>`;
      }
      else if(b.phase==='feedback'){
        const slot=b.queue[b.i],it=byId.get(slot.id);
        body=answerCard(it,slot,{ok:b.lastOk,pick:b.pick,msg:b.msg,unsure:!!b.unsure,more:b.moreQueued,blocked:b.repairBlocked});
      }
      else if(b.phase==='interactive'){const slot=b.queue[b.i],it=byId.get(slot.id);
        body=`<article class="gx-q eq-q pk-q"><p class="eyebrow">${who} used ${esc(b.moveName)}! | hands-on${slot.review?' | <span class="srs-chip">Review card</span>':''}${slot.repeatPractice?' | Familiar practice':''}</p><div class="eq-ix" data-eq-ix></div></article>`;}
      else if(b.phase==='focus'){const slot=b.queue[b.i],it=byId.get(slot.id);
        body=`<article class="gx-q eq-q pk-q"><p class="eyebrow">${who} used Focus! | recall first${slot.review?' | <span class="srs-chip">Review card</span>':''}${slot.repeatPractice?' | Familiar practice':''}</p>${passageHTML(it)}<h3>${esc(it.stem)}</h3>${it.fig?`<figure class="gx-fig q-fig"><img src="${esc(it.fig)}" data-zoom alt="${esc(it.figureAlt||'Question diagram')}" loading="lazy" onerror="this.closest('figure').remove()"><figcaption>Tap to enlarge</figcaption></figure>`:''}${b.revealed?`<div class="srs-back"><p class="eyebrow">Answer</p><p class="srs-answer">${esc(it.options[it.answer])}</p>${it.why[it.answer]?`<small>${esc(it.why[it.answer])}</small>`:''}</div><p class="pk-sub">How well did you recall it?</p><div class="srs-grades">${['Again','Hard','Good','Easy'].map((g,k)=>`<button class="srs-grade g${k}" data-fgrade="${k}"><kbd>${k+1}</kbd><strong>${g}</strong><small>${root.AtlasSRS?root.AtlasSRS.preview(it.id,k):''}</small></button>`).join('')}</div>`:`<p class="pk-sub">Answer it in your head first. No choices yet.</p><button class="primary" data-act="focus-reveal">Show the answer <kbd>Space</kbd></button>`}</article>`;}
      else if(b.phase==='say'){body=box(`<p><strong>${esc(b.msg)}</strong></p>`,`<button class="pk-cmd primary" data-act="${b.next||'menu'}">Continue <kbd>Enter</kbd></button>`);}
      else if(b.phase==='review'&&b.lastQ&&byId.get(b.lastQ.id)){const q=b.lastQ,it=byId.get(q.id);
        body=`<article class="gx-q eq-q pk-q pk-review"><p class="eyebrow">Previous question | review only, it is not scored again</p>${passageHTML(it)}<h3>${esc(it.stem)}</h3>${it.fig?`<figure class="gx-fig q-fig"><img src="${esc(it.fig)}" data-zoom alt="${esc(it.figureAlt||'Question diagram')}" loading="lazy" onerror="this.closest('figure').remove()"><figcaption>Tap to enlarge</figcaption></figure>`:''}<div class="gx-options">${q.perm.map((o,i)=>`<div class="gx-opt ${o===it.answer?'eq-key':i===q.pick?'eq-mine':'eq-dim'}"><b>${LETTERS[i]}</b><span>${optionVisualHTML(it,o)}${esc(it.options[o])}${o===it.answer?' <em>(key)</em>':i===q.pick?' <em>(your pick)</em>':''}${it.why[o]&&(o===it.answer||i===q.pick)?`<small class="eq-why">${esc(it.why[o])}</small>`:''}</span></div>`).join('')}</div><p class="eq-note">${q.ok?'You had this one right.':q.focus&&q.pick<0?'You rated this one as not recalled.':'You missed this one.'}</p>${it.src?`<p class="gx-src">${esc(srcLine(it.src))}</p>`:''}<div class="gx-actions"><button class="primary" data-act="review-done">Back to the battle <kbd>Enter</kbd></button></div></article>`;}
      else if(b.phase==='end')body=b.endHTML;
      if(b.confirmLeave&&b.phase!=='end')body=box(`<p><strong>Leave this battle?</strong></p><p class="pk-sub">${sp?'It ends with no result; steps you already beat stay beaten.':foe+' gets away.'} Your answers, misses and HP so far are kept.</p>`,`<button class="pk-cmd primary" data-act="stay-battle">Stay <kbd>Enter</kbd></button><button class="pk-cmd" data-act="leave-battle">Leave battle</button>`);
      const navBar=b.phase==='end'?'':`<div class="pk-nav"><button type="button" class="pk-navbtn" data-act="battle-back" aria-label="Back">Back</button>${b.lastQ&&!b.confirmLeave&&['menu','intro','moves','bag','team','say'].includes(b.phase)?'<button type="button" class="pk-navbtn" data-act="prev-q">Previous question</button>':''}</div>`;
      destroyModel();dialog.innerHTML=PZ(navBar+arena+body);
      paint();
      if(b.phase==='interactive'){const slot=b.queue[b.i],it=slot&&byId.get(slot.id),sp=IXS(it),host=dialog.querySelector('[data-eq-ix]');
        if(sp&&host){const back=()=>{if(battle!==b||b.phase!=='interactive')return;const backTo=b.modelReturn||{phase:'question',move:'strike',sig:null,moveName:'Strike'};Object.assign(b,backTo);if(b.phase==='question'&&!['strike','guard','insight','sig'].includes(b.move)){b.move='strike';b.sig=null;b.moveName='Strike';}b.qAt=Date.now();renderBattle();dialog.querySelector(b.phase==='feedback'?'[data-act=continue]':'[data-pick]')?.focus();};modelHandle=IX().mount(host,sp,{onReturn:back,onClose:back});}}
      dialog.querySelectorAll('.pk-bar i[data-to]').forEach(el=>setTimeout(()=>{el.style.width=el.dataset.to+'%';},40));
      b.prevFoe=b.foeHP;b.prevMe=me.hp;b.dmgFoe=0;b.dmgMe=0;b.anim='';b.fx=null;
      if(['question','intro','end','menu','check-blocked'].includes(b.phase))dialog.scrollTop=0;if(b.phase==='check-blocked')dialog.querySelector('[data-act=check-retry]')?.focus();
      if(b.phase==='feedback'){const cb=dialog.querySelector('[data-act=continue]');try{cb?.focus({preventScroll:true});}catch(e){cb?.focus();}
        // Bring the result line and the slide under it to the top of the dialog, so the slide is on screen above the
        // sticky Continue bar on a phone (the options with their why text stay one scroll up).
        // The slide, the lead and the relearn card fill in after this paint, so the first pass can be capped by a short
        // page; it pins again as they land, until the player scrolls or touches the panel.
        const fbx=dialog.querySelector('.eq-fb');if(fbx){const pad=[...dialog.querySelectorAll('.pk-nav,.pk-arena')].reduce((h,el)=>h+(/sticky|fixed/.test(getComputedStyle(el).position)?el.offsetHeight:0),0)+8;let user=false;
          const pin=()=>{if(user||battle!==b||b.phase!=='feedback'||!dialog.contains(fbx))return;const top=fbx.getBoundingClientRect().top-dialog.getBoundingClientRect().top+dialog.scrollTop-pad;if(Math.abs(top-dialog.scrollTop)>4)dialog.scrollTop=Math.max(0,top);};
          const mark=()=>{user=true;};['touchstart','wheel','keydown','mousedown'].forEach(ev=>dialog.addEventListener(ev,mark,{once:true,passive:true}));
          pin();[60,250,700,1500,2600].forEach(ms=>setTimeout(pin,ms));}}
    }
    function admitBeforeHelp(b){if(!['check','later'].includes(b.special?.assessment))return true;const phase=b.phase;b.phase='question';if(!prepareCheckCase(b)||!prepareReturnCase(b))return false;b.phase=phase;return true;}
    function openModel(){const b=battle;if(!b||!['moves','question','feedback'].includes(b.phase))return;const slot=b.queue[b.i],it=byId.get(slot.id),spec=IXS(it);if(!spec)return;const from=b.phase==='feedback'?'feedback':'question';if(from!=='feedback'&&!admitBeforeHelp(b))return;const fromMoves=b.phase==='moves';b.modelReturn={phase:from,move:fromMoves?'strike':b.move,sig:fromMoves?null:b.sig,moveName:fromMoves?'Strike':b.moveName};if(fromMoves)b.hidden=[];if(from!=='feedback')slot.assisted=true;exposure(it,from==='feedback'?'feedback-guide':'model');b.phase='interactive';renderBattle();}
    function chooseMove(m){
      const b=battle;if(!b||b.phase!=='moves')return;const it=byId.get(b.queue[b.i].id);b.unsure=false;b.moreQueued=false;
      if(m==='focus'&&b.special?.checkpoint)return;
      b.ix=null;
      if(m==='focus'){b.hidden=[];b.move='focus';b.moveName='Focus';b.phase='focus';b.revealed=false;return renderBattle();}
      if(m==='model')return openModel();
      if(m.includes(':')&&root.AtlasMoves){const mv=root.AtlasMoves.movesFor(b.team[b.active]).find(x=>x.id===m);if(!mv)return;if(mv.pp<99&&(b.pp[mv.id]||0)>=mv.pp)return;b.pp[mv.id]=(b.pp[mv.id]||0)+1;
        pullFor(mv.format,b);
        // The shown move always matches the question actually dealt (see AtlasMoves.alignMove).
        let use=mv;if(root.AtlasMoves.alignMove){const cur=byId.get(b.queue[b.i].id),mr=S().misses[cur?.id];use=root.AtlasMoves.alignMove(mv,cur,!!(mr&&!mr.healed),root.AtlasMoves.movesFor(b.team[b.active]));if(use!==mv&&mv.pp<99)b.pp[mv.id]=Math.max(0,(b.pp[mv.id]||1)-1);}
        b.hidden=[];b.move='sig';b.sig=use;b.moveName=use.name;b.phase='question';b.qAt=Date.now();return renderBattle();}
      if(m==='insight'){if(it.kind==='tf'||b.insightLeft<=0)return;if(!admitBeforeHelp(b))return;b.queue[b.i].assisted=true;exposure(it,'hint');b.insightLeft--;const wrong=shuffle(it.options.map((_,i)=>i).filter(i=>i!==it.answer));b.hidden=wrong.slice(0,2);}else b.hidden=[];
      b.move=m;b.sig=null;b.moveName=m==='strike'?'Strike':m==='guard'?'Guard':'Insight';b.phase='question';b.qAt=Date.now();renderBattle();
    }
    function worldRepairRequired(){return false;}
    function requireWorldRepair(){}
    function answer(i,flags={}){
      const b=battle;if(destroyed||!b||b.phase!=='question')return;const slot=b.queue[b.i],it=answerItem(b,slot),blank=i===-1&&flags.blank===true;if(!it||(!blank&&(!Number.isInteger(i)||i<0||i>=slot.perm.length||(b.hidden||[]).includes(slot.perm[i]))))return;if(!prepareCheckCase(b)||!prepareReturnCase(b))return;if(blank)b.unsure=true;
      const ok=slot.perm[i]===it.answer,s=S(),me=b.team[b.active],tr=me.trait||{};b.pick=i;b.lastOk=ok;b.lastQ={id:it.id,perm:slot.perm.slice(),pick:i,ok};const prevSess=b.lastSess;b.lastSess=it.session;b.lastSess0=prevSess;
      const masst=null;b.wager=b.unsure?'guess':null;b.lastWager=b.wager;
      const ixr=null,cr=null,pickO=blank?-1:slot.perm[i];if(pickO<0){b.pick=-1;b.lastQ.pick=-1;}
      const checkStatus=b.special?.assessment==='check'&&slot.checkPresented?root.AtlasSRS?.checkStatus?.(it.id,{attemptId:slot.attemptId}):null;
      const laterEligible=b.special?.assessment==='later'&&slot.presented&&root.AceDATReturnReview?.status?.(it.id,{attemptId:slot.attemptId})?.eligible;
      const meta={attemptId:slot.answerAttempted?attemptID():slot.attemptId||attemptID(),correct:ok,assisted:!!(blank||slot.assisted||slot.proofed||b.move==='insight'||checkStatus?.assisted),practice:blank||!!slot.answerAttempted||!(it.pool==='check'&&b.special?.assessment==='check'&&checkStatus?.eligible===true||it.pool==='later'&&laterEligible),confidence:blank?'unsure':b.unsure?'guess':null,repeated:s.attempts.some(a=>a.id===it.id),objectiveId:it.objectiveId,familyId:it.familyId,sourceId:it.sourceId,sourceVersion:it.sourceVersion,pool:it.pool};slot.evidence=meta;slot.answerAttempted=true;
      s.attempts.push({id:it.id,s:it.session,ok,at:new Date().toISOString(),m:b.special?b.special.kind:'wild',...meta,...(meta.assisted?{h:1}:{}),...(b.wager?{w:b.wager}:{})});try{opts.onAnswer?.(it.id,ok,COURSE,meta.assisted,meta);}catch(e){}emit(it,ok,{...meta,ms:Date.now()-(b.qAt||Date.now())});s.seen[it.id]=(s.seen[it.id]||0)+1;
      const who=cname(me.id,me.lv>=6),foe=foeName(b);
      if(ok){b.hits++;b.streak++;b.bestRun=Math.max(b.bestRun||0,b.streak);s.coins=(s.coins||0)+1;if(!(cr&&cr.noHeal)&&((s.misses[it.id]&&!s.misses[it.id].healed)||b.special?.heals)){s.misses[it.id]={...(s.misses[it.id]||{}),healed:true,healedAt:new Date().toISOString()};}
        const st=root.AtlasMoves?root.AtlasMoves.styleOf(me.id).type:'neutral',fmt=b.sig?b.sig.format:null,notes=[];
        let dmg=b.move==='sig'?b.sig.power+(tr.id==='spark'?8:0):b.move==='model'?25+(ixr&&ixr.perfect?6:0)+(tr.id==='spark'?8:0):b.move==='strike'?25+(tr.id==='spark'?8:0):b.move==='guard'?12:15+(tr.id==='precision'?10:tr.id==='tempered'?6:0);
        if(b.move==='sig'||b.move==='strike'){if(b.stance.id==='off')dmg+=10;else if(b.stance.id==='braced'&&st!=='tool')dmg-=10;}
        if(ixr)notes.push(ixr.perfect?'Hands-on, perfect model: +6.':'Hands-on: the question is right; '+(ixr.total-ixr.right)+' other part'+(ixr.total-ixr.right===1?'':'s')+' of the model off.');
        const home=!b.special&&me.id===b.x.creature;if(home)dmg+=8;
        const atk=B?.typeOf?.(me.id),ef=hitOn(b,me);{const cm=1;if(cm>1){dmg=Math.round(dmg*cm);notes.push('Held charm: +20%.');}}
        b.chain++;b.corrects++;let combo=false;
        if(st==='fuel'&&fmt&&fmt!=='quick'&&fmt!=='standard'&&b.atp>=2){b.atp-=2;dmg=Math.round(dmg*1.4);notes.push('Spent 2 momentum charges for +40% game damage.');}
        if(st==='catalyst'&&b.streak>=2){dmg=Math.round(dmg*(1.3+.15*(b.streak-2)));combo=true;}
        else if(st==='signal'){const amp=Math.min(.8,.2*(b.chain-1));if(amp>0){dmg=Math.round(dmg*(1+amp));notes.push(`Cascade x${(1+amp).toFixed(1)}.`);}}
        else if(st==='oxygen'){const f=b.chain===1?.75:b.chain===2?1:1.35;dmg=Math.round(dmg*f);if(b.chain>=3)notes.push('Cooperativity: fully relaxed state.');if(me.hp<me.max*.4){dmg=Math.round(dmg*1.25);notes.push('Bohr effect: +25% at low HP.');}}
        else if((b.move==='sig'||b.move==='strike')&&b.streak>=2){dmg=Math.round(dmg*1.3);combo=true;}
        if(st==='tool'&&fmt==='figure'){dmg=Math.round(dmg*1.25);notes.push('Assay: figure moves +25%.');}
        if(st==='redox'){b.h++;if(b.h>=4){b.h=0;dmg+=25;notes.push('ATP synthase fired: +25.');}}
        if(st==='solvent'&&b.lastSess0&&it.session!==b.lastSess0){dmg=Math.round(dmg*1.25);notes.push('Mixing current: switched sessions, +25%.');}
        if(st==='fuel')b.atp=Math.min(4,b.atp+1);
        const fast=(b.move==='sig'||b.move==='strike')&&!slot.proofed&&b.streak>0&&b.streak%3===0;
        if(fast)dmg=Math.round(dmg*1.5);const crit=fast;if(crit){const t=today();s.critLog=s.critLog&&s.critLog.date===t?{date:t,n:s.critLog.n+1}:{date:t,n:1};}{const t=today(),bst=b.streak;s.streakLog=s.streakLog&&s.streakLog.date===t?{date:t,best:Math.max(s.streakLog.best,bst)}:{date:t,best:bst};}
        // Honest counts: the raw bonuses above become one factor, clamped to 1 .. HIT.KMAX (see HIT).
        {const light=b.move==='guard'||b.move==='insight',k=light?1:dmg/HIT.BASE;if(!light&&k>HIT.KMAX+.001)notes.push('Bonuses cap at +'+Math.round((HIT.KMAX-1)*100)+'% per hit.');dmg=b.special?.checkpoint?HIT.BASE:HIT.dmg(ef.mult,k);b.hitCap=b.special?.checkpoint?HIT.BASE:HIT.hi(ef.mult);}
        let heal=0;if(b.move==='guard'){heal=tr.id==='shelter'?12:tr.id==='tempered'?8:0;}if(st==='lipid')heal+=6;if(heal)me.hp=Math.min(me.max,me.hp+heal);
        if(st==='gene'&&b.corrects>=3&&!b.silenceUsed&&!b.silenced){b.silenced=true;notes.push('Silencing ready: the next counterattack will be silenced.');}
        b.foeHP=Math.max(0,b.foeHP-dmg);b.dmgFoe=dmg;b.anim='hit-foe';b.fx={on:'foe',type:atk||'neutral',big:fmt==='signature'||fmt==='clinical'||fmt==='figure',crit,sig:fmt==='signature'};
        b.msg=`${who} used ${b.moveName}! ${crit?`A critical hit! Three consecutive correct responses. `:''}${combo?`Combo x${b.streak}! `:''}${effSay(ef)}${dmg} damage.${home?' Home turf bonus: this is its own session.':''}${heal?` ${who} recovered ${heal} HP.`:''}${notes.length?' '+notes.join(' '):''}`;sfx(crit?'crit':'hit');}
      else{b.misses++;b.streak=0;s.misses[it.id]={...(s.misses[it.id]||{}),at:new Date().toISOString(),healed:false,count:((s.misses[it.id]||{}).count||0)+1,...(!b.unsure&&b.move!=='insight'?{sure:true}:{})};missBank(it,pickO,ixr&&pickO<0?'(hands-on: '+ixr.summary+')':null);noteMiss(b,it,pickO);requireWorldRepair(b,it,pickO);
        const fatk=foeTypes(b)[0],fef=hitBack(b,me);
        const st=root.AtlasMoves?root.AtlasMoves.styleOf(me.id).type:'neutral';b.chain=0;
        if(b.special?.assessment!=='later'&&!blank&&st==='helix'&&!worldRepairRequired(it,b)&&!ixr&&!b.proofUsed&&it.kind!=='tf'){b.proofUsed=true;slot.proofed=true;b.hidden=[...(b.hidden||[]),slot.perm[i]];srsAfter(it,0,slot);save(s);b.proofMsg='Proofreading caught that one. The wrong choice is struck out: answer again, no counterattack.';return renderBattle();}
        let dmg=Math.round(b.power*(b.stance.id==='heavy'?1.5:1)*fef.mult);if(b.move==='guard')dmg=Math.round(dmg/3);
        const mnotes=[];if(st==='membrane'){dmg=Math.round(dmg*.75);mnotes.push('Selective barrier: 25% blocked.');}if(st==='bond'&&dmg>me.max*.35){dmg=Math.round(me.max*.35);mnotes.push('Buffer: the hit was capped.');}
        if(b.silenced){b.silenced=false;b.silenceUsed=true;dmg=0;mnotes.push('Silenced: the counterattack never landed.');}
        if(b.special?.assessment==='later')dmg=0;me.hp=Math.max(0,me.hp-dmg);b.dmgMe=dmg;b.anim='hit-me';b.fx={on:'me',type:fatk||'neutral',big:b.stance.id==='heavy'};
        b.msg=`That one missed. ${foe} ${b.stance.id==='heavy'?'unleashed its heavy attack':'hit back'}${fef.mult>1?". It's a strong match":fef.mult<1?". It's a weak match":''}${b.move==='guard'?', but Guard softened it':''}: ${dmg} damage.${fef.reason?' '+fef.reason:''}${mnotes.length?' '+mnotes.join(' '):''}${me.hp<=0?` ${who} fainted!`:''}`;sfx('miss');}
      if(FX)FX.settle(b,s,it,ok,me,who);if(b.special?.assessment==='later'&&!ok)b.msg='A useful return check. Read the reasoning, then continue; your party HP and route progress are protected.';
      if(!(cr&&cr.noSrs))srsAfter(it,ok?(b.move==='insight'||masst||b.lastWager==='guess'||(cr&&cr.guess)?1:2):0,slot);
      b.ixCredit=cr;
      b.proofMsg='';save(s);b.phase='feedback';renderBattle();
    }
    function srsAfter(it,g,slot){const meta=slot.evidence||{practice:true,assisted:true,objectiveId:it.objectiveId,familyId:it.familyId,sourceId:it.sourceId,sourceVersion:it.sourceVersion,pool:it.pool};const r=root.AtlasSRS?.grade(it.id,g,{session:it.session,...meta});exposure(it,'feedback');const b=battle;if(b?.special?.assessment==='later'){const saved=r?.saved===true;b.returnResponses.push({id:it.id,correct:meta.correct===true,assisted:meta.assisted===true,practice:meta.practice!==false,saved,delayedRecall:saved&&r?.event?.delayedRecall===true});if(!saved)b.msg=(b.msg||'')+' This response could not be saved to your learning record; it is not counted as delayed recall.';}if(b?.special?.assessment==='check'){const saved=r?.saved===true;b.checkResponses.push({id:it.id,saved,independentEligible:saved&&r?.event?.independentEligible===true});if(!saved)b.msg=(b.msg||'')+' This response could not be saved to your learning record; it is not counted as independent checkpoint evidence.';}if(!r)return;
      if(r.wasDue&&g>=2&&b){b.msg=(b.msg||'')+' Review card cleared: +1 Memory Crystal.';try{opts.onXP?.('crystal:'+it.id+':'+Date.now(),2,b.team?.[b.active]?.id);}catch(e){}}
      if(r.clearedNow)startOutbreak();}
    function startOutbreak(){const s=S(),acc=SESSIONS.map(x=>{const r=s.attempts.filter(a=>a.s===x.n).slice(-10);return {n:x.n,p:r.length?r.filter(a=>a.ok).length/r.length:.5};}).sort((a,b)=>a.p-b.p)[0];
      s.outbreak={session:acc.n,until:Date.now()+30*60000};save(s);if(battle)battle.msg=(battle.msg||'')+` All reviews cleared for today! An Outbreak of Route ${acc.n} creatures started: 30 minutes, triple shiny chance.`;sfx('star');}
    function focusGrade(g){if(!Number.isInteger(g)||g<0||g>3)return;const b=battle;if(!b||b.phase!=='focus'||!b.revealed)return;const slot=b.queue[b.i],it=answerItem(b,slot);if(!it)return;const s=S(),me=b.team[b.active],who=cname(me.id,me.lv>=6),foe=foeName(b);
      const ok=g>=1;b.lastOk=ok;b.pick=ok?slot.perm.indexOf(it.answer):-1;b.lastQ={id:it.id,perm:slot.perm.slice(),pick:b.pick,ok,focus:true};
      const meta={attemptId:attemptID(),correct:ok,assisted:true,practice:true,repeated:s.attempts.some(a=>a.id===it.id),selfRated:true,objectiveId:it.objectiveId,familyId:it.familyId,sourceId:it.sourceId,sourceVersion:it.sourceVersion,pool:it.pool};slot.evidence=meta;
      s.attempts.push({id:it.id,s:it.session,ok,at:new Date().toISOString(),m:'focus',f:1,h:1,...meta});try{opts.onAnswer?.(it.id,ok,COURSE,true,meta);}catch(e){}emit(it,ok,{...meta,confidence:g>=2?'sure':g===1?'shaky':'sure',ms:Date.now()-(b.qAt||Date.now())});s.seen[it.id]=(s.seen[it.id]||0)+1;
      if(ok){b.hits++;b.streak++;s.coins=(s.coins||0)+1;if(s.misses[it.id]&&!s.misses[it.id].healed)s.misses[it.id]={...s.misses[it.id],healed:true,healedAt:new Date().toISOString()};
        const atk=B?.typeOf?.(me.id),ef=hitOn(b,me);
        let dmg=HIT.dmg(ef.mult,[0,1,1.1,1.2][g]*(1));b.hitCap=HIT.hi(ef.mult);b.fx={on:'foe',type:atk||'neutral',big:g>=2};b.chain++;b.corrects++;if(root.AtlasMoves?.styleOf(me.id).type==='gene'&&b.corrects>=3&&!b.silenceUsed&&!b.silenced)b.silenced=true;b.foeHP=Math.max(0,b.foeHP-dmg);b.dmgFoe=dmg;b.anim='hit-foe';
        b.msg=`${who} focused and recalled it${g===3?' easily':g===1?', with effort':''}! ${effSay(ef)}${dmg} damage.`;sfx(g>=2?'crit':'hit');}
      else{b.misses++;b.streak=0;s.misses[it.id]={at:new Date().toISOString(),healed:false,count:((s.misses[it.id]||{}).count||0)+1};missBank(it,-1);noteMiss(b,it,-1);requireWorldRepair(b,it,-1);
        const fatk=foeTypes(b)[0],fef=hitBack(b,me);
        const st=root.AtlasMoves?root.AtlasMoves.styleOf(me.id).type:'neutral';b.chain=0;
        let dmg=Math.round(b.power*(b.stance.id==='heavy'?1.5:1)*fef.mult);const mnotes=[];
        if(st==='membrane'){dmg=Math.round(dmg*.75);mnotes.push('Selective barrier: 25% blocked.');}if(st==='bond'&&dmg>me.max*.35){dmg=Math.round(me.max*.35);mnotes.push('Buffer: the hit was capped.');}
        if(b.silenced){b.silenced=false;b.silenceUsed=true;dmg=0;mnotes.push('Silenced: the counterattack never landed.');}
        if(b.special?.assessment==='later')dmg=0;me.hp=Math.max(0,me.hp-dmg);b.dmgMe=dmg;b.anim='hit-me';b.fx={on:'me',type:fatk||'neutral',big:b.stance.id==='heavy'};
        b.msg=`Honest call: not recalled. ${foe} hit back for ${dmg}.${fef.mult>1?" Strong match! "+fef.reason:fef.mult<1?" Weak match. "+fef.reason:''}${mnotes.length?' '+mnotes.join(' '):''}${me.hp<=0?` ${who} fainted!`:''} It comes back in 10 minutes.`;sfx('miss');}
      if(FX)FX.tally(b,ok);srsAfter(it,g,slot);save(s);b.phase='feedback';renderBattle();}
    function cont(){
      const b=battle;if(!b||b.phase!=='feedback')return;
      if(b.repairBlocked){b.msg=b.repairBlocked;return renderBattle();}
      if(b.special?.checkpoint){
        if(b.i+1>=b.queue.length)return b.special.assessment==='later'?finishReturn():finish(b.hits>=b.special.requiredCorrect);
        // Keep the encounter open until every checkpoint question has been answered.
        b.foeHP=Math.max(1,b.foeHP);if(b.team.every(t=>t.hp<=0)){for(const t of b.team)t.hp=t.max;b.msg='Your team rests freely. Continue this checkpoint without restarting.';}
      }else if(b.foeHP<=0&&!(b.queue[b.i+1]&&b.queue[b.i+1].more))return catchOrWin();
      const me=b.team[b.active];
      if(me.hp<=0){const alive=b.team.findIndex(t=>t.hp>0);if(alive<0)return finish(false);b.i++;if(!ensureQueue())return finish(b.special?false:b.hits>=4);b.forced=true;b.phase='team';return renderBattle();}
      b.i++;if(!ensureQueue())return finish(b.special?false:b.hits>=4);
      // 10/23: back to the move list after each answer (Escape or Back still opens Fight, Bag, Team, Run): 3 taps a question.
      b.stance=rollStance();b.phase=b.forced?'menu':'moves';renderBattle();
    }
    function ensureQueue(){const b=battle;if(b.i<b.queue.length)return true;if(b.special)return false;b.queue.push(...deal(b.x.n,b.queue.length,false,b.only).filter(q=>!b.queue.some(z=>z.id===q.id)));return b.i<b.queue.length;}
    function catchOrWin(){const b=battle;if(b.special)return finish(true);b.catching=true;b.phase='say';b.msg=foeName(b)+' is worn out. Trainer threw a capsule...';b.next='caught';renderBattle();sfx('appear');setTimeout(()=>{if(battle===b&&b.phase==='say')sfx('hit');},450);setTimeout(()=>{if(battle===b&&b.phase==='say')sfx('hit');},900);}
    function useItem(k){const b=battle;if(!b||b.phase!=='bag')return;const s=S(),me=b.team[b.active];
      if(k==='potion'&&s.bag.potion>0&&me.hp<me.max){s.bag.potion--;spend(s,'bag.potion');save(s);const h=Math.min(50,me.max-me.hp);me.hp+=h;b.msg=`Trainer used a Potion.${cname(me.id,me.lv>=6)} recovered ${h} HP.`;b.next='menu';b.phase='say';sfx('heal');return renderBattle();}
      if(k==='revive'&&s.bag.revive>0){const t=b.team.find(x=>x.hp<=0);if(t){s.bag.revive--;spend(s,'bag.revive');save(s);t.hp=Math.ceil(t.max/2);b.msg=`Trainer used a Revive.${cname(t.id,t.lv>=6)} is back at half HP.`;b.next='menu';b.phase='say';sfx('heal');return renderBattle();}}
      if(k==='capsule'&&!b.special&&s.bag.greatCapsule>0&&b.foeHP<=b.foeMax*.4){s.bag.greatCapsule--;spend(s,'bag.greatCapsule');save(s);b.catching=true;b.msg='Trainer threw a Great Capsule...';b.next='caught';b.phase='say';sfx('appear');return renderBattle();}
    }
    function swap(k){const b=battle;if(!b||b.phase!=='team')return;const t=b.team[k];if(!t||t.hp<=0||k===b.active)return;b.active=k;b.prevMe=t.hp;const was=b.forced;b.forced=false;b.msg=`Go, ${cname(t.id,t.lv>=6)}! ${countLine(b)}`;b.next='menu';b.phase='say';if(was)b.stance=rollStance();sfx('appear');renderBattle();}
    function finish(caught){
      if(battle?.special?.assessment==='later')return finishReturn();
      if(battle&&battle.special)return finishSpecial(caught);
      const b=battle,s=S(),x=b.x,d=s.dex[x.n]||{stars:0,encounters:0},now=new Date().toISOString();
      d.encounters=(d.encounters||0)+1;d.last=now;s.battles=(s.battles||0)+1;
      let starMsg='',newStar=false;const starsBefore=d.stars||0;
      // The session's own line evolves on a star, even when the catch was its rare variant.
      const lineId=B?.lineFor?.(x.n,COURSE)?.id||x.creature;
      if(caught&&b.shiny)d.shiny=true;if(caught&&b.rare)d.rare=true;if(caught&&b.misses===0)s.perfectCatch=true;
      if(caught){const r=nextStarRule(b);if(r.ready&&(d.stars||0)<3&&b.misses<=r.need){d.stars=(d.stars||0)+1;d.starAt=now;newStar=true;if(d.stars===1)d.caughtAt=now;}
        const se=newStar&&B?.starEvolution?B.starEvolution(lineId,starsBefore,d.stars):null,it=b.rare?`Your Route ${x.n} line`:'It';
        starMsg=newStar?(d.stars===1?'Caught! Registered in your field guide.':se?`${d.stars===3?'Third':'Second'} star! ${it} evolved into ${se.to}.`:`Star ${d.stars} earned.`):(d.stars>=3?'Already three stars. Great practice.':r.ready?`Caught, but star ${(d.stars||0)+1} needs ${r.need===0?'zero misses':'at most one miss'}.`:`Caught again. Star ${(d.stars||0)+1} unlocks after ${hhmm(Date.parse(d.starAt)+SPACING)}; mix in other sessions first.`);}
      s.dex[x.n]=d;keepHP(s,b.team);save(s);
      const xpBonus=FX?FX.comboXP(b):0,xp=((b.hits*2+(caught?6:0)+(newStar?10:0))*(b.shiny?2:1)+xpBonus);
      const cid=b.team?.[b.active]?.id||P().id;const lvBefore=B?B.level(who0(cid).xp):1;b.xpInfo={id:cid,from:+who0(cid).xp||0,gain:xp,bonus:xpBonus};try{opts.onXP?.('quest:'+x.n+':'+b.startedAt,xp,cid);}catch(e){}const lvAfter=B?B.level(who0(cid).xp):1;{const meNow=b.team&&b.team[b.active];if(meNow&&lvAfter>(+meNow.lv||0))meNow.lv=lvAfter;}
      if(caught){try{opts.onCatch?.(x.creature);}catch(e){}}
      try{opts.onSpecial?.({id:'wild-'+x.n+'-'+b.startedAt,kind:'wild',won:!!caught,caught:!!caught,hits:b.hits,misses:b.misses,creature:x.creature,route:x.n,wild:true});}catch(e){}
      const lvEvo=lvEvolution(cid,lvBefore,lvAfter),evolved=!!lvEvo,levelMsg=evolved?`What? ${lvEvo.from} is evolving! It became ${lvEvo.to}!`:lvAfter>lvBefore?`${cname(cid,lvAfter>=6)} grew to Lv. ${lvAfter}!`:'';
      sfx(evolved?'star':caught?(newStar?'star':'catch'):'fled');try{root.AtlasMusic?.jingle(evolved?'evolve':caught?'catch':'lose');}catch(e){}
      b.phase='end';b.caught=caught;
      const rows=b.queue.slice(0,b.i+1);
      b.endHTML=`<div class="eq-end ${caught?'win':'lose'}"><p class="eyebrow">${b.hits} correct | ${b.misses} ${b.misses===1?'miss':'misses'} | +${xp} XP | +${b.hits} coin${b.hits===1?'':'s'}${b.bestRun>=3?' | best streak '+b.bestRun:''}</p><h3>${caught?(newStar&&d.stars===1?`Caught! ${esc(formAt(x.creature,0))} joins your field guide.`:`${esc(formAt(x.creature,b.stage||0))} is caught!`):`${esc(foeName(b))} slipped away.`}</h3>${(()=>{const se=newStar&&B?.starEvolution?B.starEvolution(lineId,starsBefore,d.stars):null;return FX&&se?evolveScene(lineId,se.fromStage,se.toStage):'';})()}${evolved?evolveScene():''}${levelMsg?`<p class="eq-level${evolved?' evolved':''}">${esc(levelMsg)}</p>`:''}${b.shiny&&caught?'<p class="eq-level">Gleaming catch! It shines in your field guide.</p>':''}${b.rare&&caught?`<p class="eq-level">Rare catch! ${esc(cname(x.creature))} joins your collection.</p>`:''}${medalLine()}<p>${caught?esc(starMsg):'It will be back. Every miss is waiting at the Recall Center, where answering it right heals your team.'}</p>${stars(d.stars||0)}
        <div class="gx-actions">${worldMode?'<button class="primary" data-act="close">Keep exploring <kbd>Enter</kbd></button>':''}${`<button class="secondary" data-act="hunt">Hunt weak spots</button><button class="${worldMode?'secondary':'primary'}" data-act="wild" data-s="${nextSession(x.n)}">Next battle: Route ${nextSession(x.n)}${worldMode?'':' <kbd>Enter</kbd>'}</button>`}<button class="secondary" data-act="wild" data-s="${x.n}">Battle Route ${x.n} again</button>${newStar&&d.stars===1?`<button class="secondary" data-act="dex" data-s="${x.n}">Read the new field guide entry</button>`:''}<button class="secondary" data-act="home">Quest home</button></div>${debriefHTML(b)}</div>`;
      renderBattle();
    }
    function finishSpecial(won){
      if(!battle||battle.phase==='end')return;
      const b=battle,sp=b.special,s=S(),now=new Date().toISOString(),unsaved=(b.checkResponses||[]).filter(x=>!x.saved).length;revokeChecks();s.special=s.special||{};
      const needsRoute=sp.kind==='realms-warden'||!!sp.page,routeRef=sp.routeId||root.AceDATRealms?.find(r=>r.course===COURSE)?.routes.find(r=>r.session===sp.page)?.id;
      const routeGate=needsRoute?root.AceDATMastery?.routeStatus?.(routeRef):null,worldGate=sp.badge?root.AceDATMastery?.worldStatus?.(COURSE):null;
      const expeditionEvidence=sp.kind!=='expedition-check'||b.checkResponses.length===b.queue.length&&b.checkResponses.every(x=>x.saved&&x.independentEligible);
      const progressionWon=!!won&&expeditionEvidence&&(!needsRoute||routeGate?.restoreAllowed===true)&&(!sp.badge||worldGate?.badgeAllowed===true);
      const pendingMessage=!expeditionEvidence?'This was supported or repeated practice. Your response is saved without independent-check credit.':sp.badge&&!worldGate?.badgeAllowed?'World completion and its badge remain unavailable while curriculum and evidence requirements are incomplete.':routeGate?.status==='checksExhausted'?'The available checks have been used. Practice remains open; additional reviewed checks are needed to provide new independent evidence.':'The route checkpoint still needs saved independent correct responses for every listed objective. Hints, repeated answers and practice remain useful learning.';
      const key=sp.kind==='legendary'?'legendary':sp.kind;const rec=s.special[key]||{wins:0,tries:0};rec.tries++;if(progressionWon){rec.wins++;rec.wonAt=rec.wonAt||now;}rec.last=now;rec.best=Math.max(rec.best||0,b.hits);
      // The legendary keeps its record in the world (bio/region-bio.js); the quest store keeps the try count.
      const LG=null,legendElsewhere=false;if(!legendElsewhere&&!/-film$/.test(sp.kind||''))s.special[key]=rec;
      if(progressionWon&&sp.page){const pg=s.pages[sp.page]||{};s.pages[sp.page]={...pg,warden:true,wardenAt:pg.wardenAt||now};}
      if(progressionWon&&sp.badge){s.badges[sp.badge]=s.badges[sp.badge]||{at:now};}
      if(sp.kind!=='expedition-check')keepHP(s,b.team);
      if(won&&sp.water){s.water=s.water||{};const w=s.water[sp.water]||{count:0,caughtAt:now};w.count++;w.last=now;s.water[sp.water]=w;try{opts.onCatch?.(sp.water);}catch(e){}}
      save(s);
      if(legendElsewhere){try{LG.record(sp.legend,won,b.hits);}catch(e){}}
      const LS=LG?(()=>{try{return LG.status(sp.legend);}catch(e){return null;}})():null;
      const legendHTML=!LS?'':LS.caught?`<p class="eq-level">${esc(LS.name)} already travels with you.</p>`:LS.catchable?`<p class="eq-level">${esc(LS.name)} has seen enough. It will join a trainer this ready.</p>`:`<p class="eq-legend-missing">${esc(LS.name)} cannot be caught yet. ${esc(LS.missing.join(' '))}</p>`;
      const xpBonus=FX?FX.comboXP(b):0,xp=(won?(sp.xp||10):b.hits*2)+xpBonus;const cid=b.team?.[b.active]?.id||P().id;const lvBefore=B?B.level(who0(cid).xp):1;b.xpInfo={id:cid,from:+who0(cid).xp||0,gain:xp,bonus:xpBonus};try{opts.onXP?.('special:'+sp.id+':'+b.startedAt,xp,cid);}catch(e){}const lvAfter=B?B.level(who0(cid).xp):1;{const meNow=b.team&&b.team[b.active];if(meNow&&lvAfter>(+meNow.lv||0))meNow.lv=lvAfter;}
      const lvEvo=lvEvolution(cid,lvBefore,lvAfter),evolved=!!lvEvo,levelMsg=evolved?`What? ${lvEvo.from} is evolving! It became ${lvEvo.to}!`:lvAfter>lvBefore?`${cname(cid,lvAfter>=6)} grew to Lv. ${lvAfter}!`:'';
      sfx(won?'star':'fled');try{root.AtlasMusic?.jingle(won?'victory':'lose');}catch(e){}try{opts.onSpecial?.({id:sp.id,kind:sp.kind,won:progressionWon,practiceWon:!!won,checkpointEvidence:routeGate?.status||null,hits:b.hits,misses:b.misses});}catch(e){}
      // A gauntlet step (spec.chain, a chapter gym or the Board): after a win the next step is offered right here.
      b.chainNext=null;if(progressionWon&&typeof sp.chain==='function'){try{b.chainNext=sp.chain()||null;}catch(e){b.chainNext=null;}}
      b.phase='end';
      b.endHTML=`<div class="eq-end ${won?'win':'lose'} eq-end-${sp.kind}"><p class="eyebrow">${b.hits} correct | ${b.misses} ${b.misses===1?'miss':'misses'} | +${xp} XP | +${b.hits} coin${b.hits===1?'':'s'}${b.bestRun>=3?' | best streak '+b.bestRun:''}</p><h3>${sp.kind==='expedition-check'?'Your field check is recorded.':won&&!progressionWon?'Practice complete; checkpoint still open.':won?(sp.kind==='legendary'?`${esc(sp.name)} is beaten!`:sp.water?`${esc(sp.name.replace(/^Wild /,''))} was caught!`:`You beat ${esc(sp.name)}!`):(sp.kind==='legendary'?`${esc(sp.name)} withdrew.`:sp.kind==='sp-restore'?`Most of the page came back. One more run finishes it.`:`${esc(sp.name)} got away.`)}</h3>${evolved?evolveScene():''}${levelMsg?`<p class="eq-level${evolved?' evolved':''}">${esc(levelMsg)}</p>`:''}${medalLine()}<p>${esc(won&&!progressionWon?pendingMessage:won?sp.win:sp.lose)}</p>${unsaved?`<p role="alert">${unsaved} response${unsaved===1?' could':'s could'} not be saved. Those responses provide no independent checkpoint evidence.</p>`:''}${legendHTML}${b.chainNext?`<section class="eq-next"><p class="eyebrow">Gym gauntlet</p><h4>Next: ${esc(b.chainNext.name)}</h4>${b.chainNext.sub?`<p class="eq-note">${esc(b.chainNext.sub)}</p>`:''}<p class="eq-note">Your team's HP carries over. Steps you have beaten stay beaten.</p><div class="gx-actions"><button class="primary" data-act="chain-next">Next: ${esc(b.chainNext.name)} <kbd>Enter</kbd></button><button class="secondary" data-act="${worldMode?'close':'home'}">Leave the gym for now</button></div></section>`:''}
        <div class="gx-actions"${b.chainNext?' hidden':''}>${LS&&LS.catchable?`<button class="primary" data-act="legend-catch" data-c="${esc(sp.legend)}">Catch ${esc(LS.name)}</button>`:''}${worldMode?`<button class="${LS&&LS.catchable?'secondary':'primary'}" data-act="close">Keep exploring <kbd>Enter</kbd></button>`:`<button class="${LS&&LS.catchable?'secondary':'primary'}" data-act="home">Quest home <kbd>Enter</kbd></button>`}${!won&&sp.kind==='legendary'?(sp.legend?`<button class="secondary" data-act="legend-again" data-c="${esc(sp.legend)}">Try again</button>`:'<button class="secondary" data-act="legendary">Try again</button>'):''}${worldMode?'<button class="secondary" data-act="home">Quest home</button>':''}</div>${debriefHTML(b)}</div>`;
      renderBattle();
    }
    // One step back inside a battle; the last step is a "Leave this battle?" confirm. Returns false at the end screen.
    function battleBack(){const b=battle;if(!b||b.phase==='end')return false;
      if(b.confirmLeave){b.confirmLeave=false;renderBattle();return true;}
      const rli=dialog.querySelector('.rli-host');if(b.phase==='feedback'&&rli&&rli._rliState&&rli._rliState.collapsed&&rli.querySelector('section.rli')){rli._rliState.collapsed();return true;}
      if(b.phase==='review'){b.phase=b.reviewFrom||'menu';renderBattle();return true;}
      if((b.phase==='moves'||b.phase==='bag'||b.phase==='team')&&!b.forced){b.phase='menu';renderBattle();return true;}
      b.confirmLeave=true;renderBattle();return true;}
    function leaveBattle(){const b=battle;if(!b)return;revokeChecks();b.confirmLeave=false;{const s=S();keepHP(s,b.team);save(s);}battle=null;return worldMode?close():home();}
    function chainGo(){const b=battle,nx=b&&b.chainNext;if(!nx)return;b.chainNext=null;if(nx.spec){center=null;return startSpecial(nx.spec);}if(typeof nx.open==='function'){if(worldMode)close();else home();setTimeout(()=>{try{nx.open();}catch(e){}},60);return;}
      // 10/23: a bare spec is started too, and anything else falls back to leaving, so the gauntlet button never strands the player.
      if(Array.isArray(nx.items)){center=null;return startSpecial(nx);}if(worldMode)close();else home();}
    function nextSession(n){const s=S();const cand=SESSIONS.filter(x=>x.n!==n&&AC.sessionAvailability(COURSE,x.n).available).map(x=>({x,st:s.dex[x.n]?.stars||0,wait:(s.dex[x.n]?.stars||0)>0&&Date.now()-Date.parse(s.dex[x.n]?.starAt||0)<SPACING}));
      const uncaught=cand.filter(c=>c.st===0).sort((a,b)=>a.x.n-b.x.n)[0];if(uncaught)return uncaught.x.n;const ready=cand.filter(c=>!c.wait&&c.st<3).sort((a,b)=>a.st-b.st||a.x.n-b.x.n)[0];return (ready||cand.sort((a,b)=>a.st-b.st)[0])?.x.n||n;}
    function missBank(it,picked,pickText){const bank=readJSON(MISS,{});if(!bank||typeof bank!=='object'||Array.isArray(bank))return;const day=new Date().toISOString().slice(0,10);
      const id=it.id,row=bank[id]||{id,course:COURSE,objectiveId:it.objectiveId,familyId:it.familyId,mode:'mnemon',group:'Route '+it.session,count:0,status:'open',first:day};
      row.count=(row.count||0)+1;row.last=day;row.status='open';row.pickedIndex=Number.isInteger(picked)?picked:-1;bank[id]=row;writeJSON(MISS,bank);}

    // ---------- Recall Center ----------
    function startCenter(){if(blitz){clearInterval(blitzTimer);blitz=null;}music('town');const list=(FX?FX.prioritize(shuffle(openMisses()),S()):shuffle(openMisses())).slice(0,10);if(!list.length)return home();center={queue:list.map(m=>{const it=byId.get(m.id);return {id:m.id,from:m.from,perm:dealPerm(it)};}),healed:0,total:list.length,phase:'question',tries:0};renderCenter();}
    function renderCenter(){
      const c=center;if(!c.queue.length){sfx('star');dialog.innerHTML=`<div class="world-panel-header"><div><p class="eyebrow">Recall Center</p><h2>Your team is healed</h2></div></div><p>${c.healed} missed question${c.healed===1?'':'s'} answered right${c.tries>c.healed?`, after ${c.tries-c.healed} more tr${c.tries-c.healed===1?'y':'ies'}`:''}. They will come back in future battles to make sure they stuck.</p>${medalLine()}<div class="gx-actions">${openMisses().length?'<button class="primary" data-act="center">Heal the next group</button>':''}<button class="secondary" data-act="home">Quest home</button></div>`;return;}
      const slot=c.queue[0],it=byId.get(slot.id),fb=c.phase==='feedback';if(!fb&&!c.qAt)c.qAt=Date.now();
      dialog.innerHTML=`<div class="world-panel-header"><div><p class="eyebrow">Recall Center | Route ${it.session}</p><h2>Healing ${c.healed+1} of ${c.total}</h2></div><button class="eq-chip" data-act="home">Leave</button></div>
      <div class="eq-heal"><div class="eq-hpbar"><i style="width:${c.healed/c.total*100}%"></i></div></div>
      <article class="gx-q eq-q">${passageHTML(it)}<h3>${esc(it.stem)}</h3>${it.fig?`<figure class="gx-fig q-fig"><img src="${esc(it.fig)}" data-zoom alt="${esc(it.figureAlt||'Question diagram')}" loading="lazy" onerror="this.closest('figure').remove()"><figcaption>Tap to enlarge</figcaption></figure>`:''}<div class="gx-options">${slot.perm.map((o,i)=>{let cls='gx-opt';if(fb){if(o===it.answer)cls+=' eq-key';else if(i===c.pick)cls+=' eq-mine';else cls+=' eq-dim';}return `<button class="${cls}" data-pick="${i}"><b>${LETTERS[i]}</b><span>${optionVisualHTML(it,o)}${esc(it.options[o])}${fb&&it.why[o]&&(o===it.answer||i===c.pick)?`<small class="eq-why">${esc(it.why[o])}</small>`:''}</span></button>`;}).join('')}</div>
      ${fb?`<div class="eq-fb ${c.lastOk?'ok':'no'}"><strong>${c.lastOk?'Healed.':'Not yet. It goes to the back of the line; read the reasons, it will come around again.'}</strong>${visualHTML(it)}${it.tell?`<p class="mq-answer"><b>Answer: ${esc(it.options[it.answer])}.</b> <span class="mq-tell"><b>Tell:</b> ${esc(it.tell)}</span></p>`:''}${it.trap?`<p class="gx-trap"><b>Trap to watch:</b> ${esc(it.trap)}</p>`:''}<p class="gx-src">${esc(srcLine(it.src))}</p><button class="primary" data-act="continue">Continue <kbd>Enter</kbd></button></div>`:''}</article>`;
      if(fb)dialog.querySelector('[data-act=continue]')?.focus();
    }
    function centerAnswer(i){const c=center;if(c.phase!=='question')return;const slot=c.queue[0],it=byId.get(slot.id);if(!Number.isInteger(i)||i<0||i>=slot.perm.length)return;const ok=slot.perm[i]===it.answer,s=S();c.pick=i;c.lastOk=ok;c.tries++;
      const meta={attemptId:attemptID(),correct:ok,assisted:true,practice:true,repeated:true,objectiveId:it.objectiveId,familyId:it.familyId,sourceId:it.sourceId,sourceVersion:it.sourceVersion,pool:it.pool};s.attempts.push({id:it.id,s:it.session,ok,at:new Date().toISOString(),m:'center',h:1,...meta});try{opts.onAnswer?.(it.id,ok,COURSE,true,meta);}catch(e){}emit(it,ok,{...meta,confidence:null,ms:Date.now()-(c.qAt||Date.now()),battle:'center'});root.AtlasSRS?.grade(it.id,ok?1:0,{session:it.session,...meta});exposure(it,'feedback');
      if(ok){s.misses[it.id]={...(s.misses[it.id]||{}),healed:true,healedAt:new Date().toISOString()};c.healed++;sfx('heal');healTeam(s,.4);if(c.healed>=3)s.hp={};}else{s.misses[it.id]={...(s.misses[it.id]||{}),at:new Date().toISOString(),healed:false,count:((s.misses[it.id]||{}).count||0)+1};sfx('miss');}
      save(s);c.phase='feedback';renderCenter();}
    function centerCont(){const c=center;if(c.phase!=='feedback')return;const slot=c.queue.shift();if(!c.lastOk){const again=byId.get(slot.id);c.queue.push({...slot,perm:again?dealPerm(again):slot.perm});}c.phase='question';c.qAt=0;if(c.lastOk)try{opts.onXP?.('center:'+slot.id+':'+Date.now(),3);}catch(e){}renderCenter();}


    // ---------- events ----------
    dialog.addEventListener('click',e=>{
      const t=e.target.closest('button');if(!t||!dialog.contains(t))return;
      if(t.dataset.pick!=null){if(center)return centerAnswer(+t.dataset.pick);return answer(+t.dataset.pick);}
      if(t.dataset.bz!=null)return blitzAnswer(+t.dataset.bz);
      if(t.dataset.move)return chooseMove(t.dataset.move);
      if(t.dataset.fgrade!=null)return focusGrade(+t.dataset.fgrade);
      if(t.dataset.ggrade!=null)return groveGrade(+t.dataset.ggrade);
      if(t.dataset.item)return useItem(t.dataset.item);
      if(t.dataset.swap!=null)return swap(+t.dataset.swap);
      const a=t.dataset.act;
      if(a==='close')return close();
      if(a==='course'){const c=t.dataset.c;if(!c||c===COURSE)return;try{AC?.remember?.(c);}catch(e){}close();if(opts.onSwitch)return opts.onSwitch(c);return open({...opts,course:c,start:undefined});}
      if(a==='home'){allItems=pool(COURSE,PACK);items=allItems.filter(x=>x.pool==='practice');byId=new Map(allItems.map(x=>[x.id,x]));return home();}
      if(a==='sound'){const s=S();s.sound=!s.sound;save(s);try{root.AtlasMusic?.setEnabled(s.sound);}catch(e){}if(s.sound)sfx('hit');return home();}
      if(a==='wild'){center=null;return startWild(t.dataset.s);}
      if(a==='hunt'){center=null;return hunt();}
      if(a==='quest-claim'){const s=S(),q=s.quests,id=t.dataset.q;if(q&&QUESTS[id]&&!q.claimed[id]&&questProgress(id,q)>=QUESTS[id].n){q.claimed[id]=true;s.coins=(s.coins||0)+15;if(q.list.every(x=>q.claimed[x])){s.bag=s.bag||{};s.bag.revive=(s.bag.revive||0)+1;}save(s);sfx('star');}return home();}
      if(a==='rest'){const s=S();s.hp={};save(s);sfx('heal');return home();}
      if(a==='water'){if(!SPX.length)return home();center=null;const spec=t.dataset.w?packSpecial(t.dataset.w):null;return spec?startSpecial(spec):startWater();}
      if(a==='dex'){return dexView(t.dataset.s);}
      if(a==='menu'&&battle){battle.phase='menu';return renderBattle();}
      if(a==='moves'&&battle){battle.phase='moves';return renderBattle();}
      if(a==='bag'&&battle){battle.phase='bag';return renderBattle();}
      if(a==='team'&&battle){battle.phase='team';return renderBattle();}
      if(a==='run'&&battle){if(battle.special&&battle.special.assessment!=='later'&&battle.special.kind!=='grunt'&&battle.special.kind!=='legendary'){battle.msg='There is no running from this battle!';battle.next='menu';battle.phase='say';return renderBattle();}{const s=S();keepHP(s,battle.team);save(s);}return worldMode?close():home();}
      if(a==='caught'&&battle){battle.catching=false;return finish(true);}
      if(a==='continue'){if(center)return centerCont();return cont();}
      if(a==='center'){battle=null;return startCenter();}
      if(a==='blitz'){return startBlitz();}
      if(a==='blitz-next'&&blitz?.flash){blitz.end+=Date.now()-blitz.pausedAt;return nextBlitz();}
      if(a==='focus-reveal'&&battle){exposure(byId.get(battle.queue[battle.i]?.id),'answer-reveal');battle.revealed=true;return renderBattle();}
      if(a==='grove'){return startGrove();}
      if(a==='return-review')return startReturn();
      if(a==='check-retry')return retryCheck();
      if(a==='grove-reveal'&&grove){exposure(byId.get(grove.q[grove.i]?.id),'answer-reveal');grove.revealed=true;return renderGrove();}
      if(a==='grove-budget'){const v=+t.dataset.v;root.AtlasSRS?.setSettings({budget:v});return home();}
      if(a==='chain-next'){return chainGo();}
      if(a==='battle-back'){if(!battleBack())return worldMode?close():home();return;}
      if(a==='prev-q'&&battle&&battle.lastQ){exposure(byId.get(battle.lastQ.id),'feedback-review');battle.reviewFrom=battle.phase;battle.phase='review';return renderBattle();}
      if(a==='review-done'&&battle){battle.phase=battle.reviewFrom||'menu';return renderBattle();}
      if(a==='stay-battle'&&battle){battle.confirmLeave=false;return renderBattle();}
      if(a==='leave-battle'){return leaveBattle();}
      if(a==='gym-ace'&&battle&&battle.pendingSpec){const sp=battle.pendingSpec;return startSpecial(sp);}
      if(a==='unsure'&&battle&&battle.phase==='question'){battle.unsure=!battle.unsure;t.setAttribute('aria-pressed',battle.unsure?'true':'false');return;}
      if(a==='model'&&battle)return openModel();
      if(a==='dont-know'&&battle?.phase==='question')return answer(-1,{blank:true});
      if(a==='one-more'&&battle&&battle.phase==='feedback'){oneMore();return;}
    });
    function onKey(e){
      if(destroyed||!dialog.open||e.metaKey||e.ctrlKey||e.altKey)return;if(document.getElementById('worldPanel')?.open||e.target?.closest?.('input, textarea, select, [contenteditable="true"]'))return;if(document.querySelector('dialog.rl-dialog[open],dialog.lb[open]'))return;const k=e.key.toLowerCase();
      // A live model (hands-on move or proof) handles its own Enter and Space.
      if(battle?.phase==='interactive')return;
      if((k==='enter'||k===' ')&&e.target&&e.target.closest&&e.target.closest('.ix [data-part],.ix [data-pin],.ix-hot,.ix-chip,.ix-slot,.ix-pinrow button,.ix-bar button'))return;
      if(grove&&!battle&&!center&&!blitz){const n='1234'.indexOf(k);if(!grove.revealed&&(k===' '||k==='enter')&&dialog.querySelector('[data-act=grove-reveal]')){e.preventDefault();e.stopPropagation();exposure(byId.get(grove.q[grove.i]?.id),'answer-reveal');grove.revealed=true;return renderGrove();}if(grove.revealed&&n>=0){e.preventDefault();e.stopPropagation();return groveGrade(n);}if(k==='enter'&&!dialog.querySelector('.srs-card')){e.preventDefault();e.stopPropagation();grove=null;return home();}return;}
      if(blitz){if(blitz.flash&&(k==='enter'||k===' ')){e.preventDefault();e.stopPropagation();blitz.end+=Date.now()-blitz.pausedAt;return nextBlitz();}const n='abcde'.indexOf(k)>=0?'abcde'.indexOf(k):'12345'.indexOf(k);if(blitz.phase==='play'&&n>=0){e.preventDefault();e.stopPropagation();return blitzAnswer(n);}if(blitz.phase==='done'&&k==='enter'){e.preventDefault();e.stopPropagation();return startBlitz();}return;}
      if(k==='escape'&&Date.now()-lastBack<400){e.preventDefault();e.stopPropagation();return;}
      if(battle&&!center&&(battle.confirmLeave||battle.phase==='review')&&(k==='enter'||k===' ')){e.preventDefault();e.stopPropagation();if(battle.confirmLeave)battle.confirmLeave=false;else battle.phase=battle.reviewFrom||'menu';return renderBattle();}
      if(battle&&!center&&battle.confirmLeave)return;
      const phase=center?center.phase:battle?battle.phase:null;if(!phase)return;
      if(phase==='question'&&k==='u'&&battle&&!center){e.preventDefault();e.stopPropagation();battle.unsure=!battle.unsure;const ub=dialog.querySelector('[data-act=unsure]');if(ub)ub.setAttribute('aria-pressed',battle.unsure?'true':'false');return;}
      if(phase==='question'){const n='abcde'.indexOf(k)>=0?'abcde'.indexOf(k):'12345'.indexOf(k);if(n>=0){e.preventDefault();e.stopPropagation();return center?centerAnswer(n):answer(n);}}
      if((phase==='feedback')&&(k==='enter'||k===' ')){e.preventDefault();e.stopPropagation();return center?centerCont():cont();}
      if(phase==='end'&&k==='enter'&&battle&&battle.chainNext){e.preventDefault();e.stopPropagation();return chainGo();}
      if(phase==='end'&&k==='enter'&&worldMode){e.preventDefault();e.stopPropagation();return close();}
      if(phase==='end'&&k==='enter'&&battle&&battle.special){e.preventDefault();e.stopPropagation();return home();}
      if(phase==='end'&&k==='enter'){e.preventDefault();e.stopPropagation();const nb=dialog.querySelector('.eq-end [data-act=wild]');if(nb){center=null;return startWild(nb.dataset.s);}}
      if(!center&&battle){const num='1234'.indexOf(k);
        if((phase==='intro'||phase==='say')&&(k==='enter'||k===' ')){e.preventDefault();e.stopPropagation();const nx=phase==='say'?(battle.next||'menu'):'menu';if(nx==='caught'){battle.catching=false;return finish(true);}if(nx==='gym-ace'&&battle.pendingSpec){return startSpecial(battle.pendingSpec);}battle.phase=nx;return renderBattle();}
        if(phase==='menu'&&num>=0){e.preventDefault();e.stopPropagation();const acts=['moves','bag','team','run'];const btn=dialog.querySelector(`[data-act=${acts[num]}]`);if(btn&&!btn.disabled)btn.click();return;}
        if(phase==='focus'){if(!battle.revealed&&(k===' '||k==='enter')){e.preventDefault();e.stopPropagation();exposure(byId.get(battle.queue[battle.i]?.id),'answer-reveal');battle.revealed=true;return renderBattle();}if(battle.revealed&&num>=0){e.preventDefault();e.stopPropagation();return focusGrade(num);}}
        if(phase==='moves'&&'1234567'.indexOf(k)>=0){e.preventDefault();e.stopPropagation();const btn=dialog.querySelectorAll('[data-move]')['1234567'.indexOf(k)];if(btn&&!btn.disabled)btn.click();return;}
        if((phase==='moves'||phase==='bag'||phase==='team')&&k==='escape'&&!battle.forced){e.preventDefault();e.stopPropagation();battle.phase='menu';return renderBattle();}}
    }
    // World-driven starts: wild, special (trainers, wardens, gyms, the Board, the legendary), specials and the Recall Center.
    if(opts.returnReview||opts.start?.returnReview)startReturn();
    else if(opts.grove||(opts.start&&opts.start.grove))startGrove();
    else if(opts.start&&opts.start.water)startWater(opts.start.water.region);
    else if(opts.start==='center'||(opts.start&&opts.start.center))startCenter();
    else if(opts.start&&opts.start.special)startSpecial(opts.start.special);
    else if(worldMode&&opts.start.wild)startWild(opts.start.wild,opts.start.label);
    else home();
    // _t: a handle for headless checks; the page never uses it.
    return {close,course:COURSE,refresh:()=>{if(!battle&&!center)home();},_t:{battle:()=>battle,dialog,openModel,oneMore,startGrove,grove:()=>grove,startCenter,center:()=>center,centerAnswer,startReturn,retryCheck,startSpecial,startWild,chooseMove,answer,focusGrade,cont,swap,countLine,hitOn,finish,useItem,S}};
  }
  root.AtlasQuest={open,HIT,modelForItem:IXS,passageHTML,optionVisualHTML,_pool:pool,coursePool,drawSprite,openMissIds,SPRITES,asset};
})(typeof window!=='undefined'?window:globalThis);
