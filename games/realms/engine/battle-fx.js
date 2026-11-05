/* AtlasBattleFX: battle juice, the confidence wager, Lumen variants and the
 * evolution cutscene for every course's Mnemon battles.
 *
 * It never decides correctness and never touches explanations, answer cards or
 * the miss and heal loop. exam-quest.js calls a few small hooks (attach, settle,
 * tally, comboXP, prioritize, evolveHTML); everything visual is layered on top of
 * the DOM that exam-quest.js renders, read back after each render.
 *
 * Confidence (Mnemon): the Unsure toggle sets b.wager to 'guess'; the wager bar below is not shown.
 *   Right + Sure   bonus damage.
 *   Wrong + Sure   a harder counterattack, and the miss is flagged so the Recall
 *                  Center serves it first.
 *   Right + Guess  normal damage, but the review card is graded Hard so it comes
 *                  back soon instead of being treated as known.
 * Each wager is saved on the answer record (attempt.w), so it lives in the quest
 * store per course and merges across devices with the attempts.
 *
 * Lumen: answer 10 in a row on one session (no guesses, no Insight help) and that
 * session's Mnemon earns its Lumen form, saved per course under lumen[session].
 *
 * Streak meter: correct answers in a row this sitting raise an XP multiplier
 * (x1.25 at 3, x1.5 at 5, x1.75 at 7, x2 at 10). It changes XP only, never damage
 * or correctness. A miss resets it.
 *
 * prefers-reduced-motion turns every animation here off.
 */
(function(root){
  'use strict';
  const KEY='ace_dat_realms_mnemon_v1_quest_v1',LUMEN_RUN=10;
  const RM=()=>{try{return !!(root.matchMedia&&root.matchMedia('(prefers-reduced-motion: reduce)').matches);}catch(e){return false;}};
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const obj=v=>v&&typeof v==='object'&&!Array.isArray(v)?v:{};
  const WAGERS=[['sure','Sure','s'],['think','Think so','t'],['guess','Guess','g']];
  const COMBO={};// course -> correct answers in a row this sitting
  const comboMult=n=>n>=10?2:n>=7?1.75:n>=5?1.5:n>=3?1.25:1;
  const nextTier=n=>n<3?3:n<5?5:n<7?7:n<10?10:null;
  const kindLabel=it=>!it?'':it.kind==='tf'?'True or false':it.kind==='recall'?'Quick recall':it.kind==='vignette'||it.kind==='case'?'Vignette':it.fig?'Figure':it.kind==='stem'?'Complete the statement':it.kind==='multi'?'Which statements are true':'One best answer';
  // XP curve from bestiary.js: level L starts at 5*(L-1)^2.
  const lvOf=xp=>Math.min(30,1+Math.floor(Math.sqrt(Math.max(0,xp)/5)));
  const lvPct=xp=>{const L=lvOf(xp);if(L>=30)return 100;const a=5*Math.pow(L-1,2),b=5*Math.pow(L,2);return Math.max(0,Math.min(100,(xp-a)/(b-a)*100));};

  // Every Lumen creature across all courses (party sprites can come from any course).
  function lumenCreatures(){const out=new Set();try{const s=obj(JSON.parse(localStorage.getItem(KEY)||'null'));
    const add=l=>{for(const v of Object.values(obj(l)))if(v&&v.creature)out.add(v.creature);};add(s.lumen);for(const c of Object.values(obj(s.courses)))add(obj(c).lumen);}catch(e){}return out;}

  // Pixel-square particles in the type's color, one short-lived canvas per burst.
  function burst(arena,target,color,o){
    if(RM()||!arena||!target)return;const r=arena.getBoundingClientRect(),t=target.getBoundingClientRect();if(!r.width||!t.width)return;
    const cv=document.createElement('canvas');cv.className='bfx-cv';cv.setAttribute('aria-hidden','true');const dpr=Math.min(2,root.devicePixelRatio||1);
    cv.width=Math.round(r.width*dpr);cv.height=Math.round(r.height*dpr);arena.appendChild(cv);const ctx=cv.getContext('2d');ctx.scale(dpr,dpr);
    const cx=t.left-r.left+t.width/2,cy=t.top-r.top+t.height/2,P=[],n=o.n||16,DUR=o.dur||650;
    for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,sp=(1.4+Math.random()*3.4)*(o.speed||1);P.push({x:cx,y:cy,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-1.2,s:2+Math.random()*3*(o.size||1),c:i%4===0?'#ffffff':color});}
    const t0=performance.now();
    (function step(now){const e=Math.max(0,Math.min(1,(now-t0)/DUR));ctx.clearRect(0,0,r.width,r.height);
      if(o.ring){ctx.globalAlpha=Math.max(0,1-e);ctx.strokeStyle=color;ctx.lineWidth=4*(1-e)+1;ctx.beginPath();ctx.arc(cx,cy,10+e*(o.ring),0,Math.PI*2);ctx.stroke();}
      for(const p of P){p.x+=p.vx;p.y+=p.vy;p.vy+=.12;p.vx*=.97;ctx.globalAlpha=Math.max(0,1-e*e);ctx.fillStyle=p.c;ctx.fillRect(Math.round(p.x-p.s/2),Math.round(p.y-p.s/2),Math.ceil(p.s),Math.ceil(p.s));}
      if(e<1&&cv.isConnected)requestAnimationFrame(step);else cv.remove();})(t0);
  }
  function shake(el,amp,ms){if(RM()||!el||!el.animate||amp<=0)return;const k=[];for(let i=0;i<7;i++){const f=amp*(1-i/7),dx=(i%2?-1:1)*f*(.6+Math.random()*.4),dy=(Math.random()-.5)*f*.8;k.push({transform:`translate(${dx.toFixed(1)}px,${dy.toFixed(1)}px)`});}k.push({transform:'translate(0,0)'});try{el.animate(k,{duration:ms||360,easing:'ease-out'});}catch(e){}}

  function attach(dialog,api){
    const C=api.course||'BIO',M=()=>root.AtlasMoves;
    COMBO[C]=COMBO[C]||0;
    let lastBanner='',lastCombo=COMBO[C];
    dialog.classList.add('bfx-on');
    const tcolor=t=>(api.tinfo&&api.tinfo(t)&&api.tinfo(t).color)||'#d6ae55';

    // ---------- answer hooks (called by exam-quest.js before it renders feedback) ----------
    // settle: wager effects, streak meter, Lumen run. b and s are the live battle and store.
    function settle(b,s,it,ok,me,who){
      const w=b.wager||null;b.lastWager=w;b.wager=null;const notes=[];
      // Streak meter: XP multiplier only.
      if(ok){COMBO[C]++;const m=comboMult(COMBO[C]);b.comboXP=(b.comboXP||0)+2*(m-1);}else COMBO[C]=0;
      if(w==='sure'&&ok&&b.dmgFoe>0){/* capped at the hit ceiling so the count of correct answers stays honest (exam-quest HIT) */const extra=Math.max(0,Math.min(Math.max(4,Math.round(b.dmgFoe*.25)),(b.hitCap||Infinity)-b.dmgFoe));if(extra>0){b.foeHP=Math.max(0,b.foeHP-extra);b.dmgFoe+=extra;notes.push(`Called it: Sure and right, +${extra} bonus damage.`);}else notes.push('Called it: Sure and right. This hit was already at the bonus cap.');}
      else if(w==='sure'&&!ok){
        s.misses[it.id]={...(s.misses[it.id]||{}),sure:true,sureAt:new Date().toISOString()};
        let extra=0;if(b.dmgMe>0&&me.hp>0){extra=Math.min(me.hp,Math.max(6,Math.round(b.dmgMe*.5)));me.hp=Math.max(0,me.hp-extra);b.dmgMe+=extra;}
        notes.push(`You were Sure, so ${extra?`the counter hit ${extra} harder and `:''}this one moves to the front of the Recall Center.`);
        if(extra&&me.hp<=0&&!/fainted!/.test(b.msg||''))notes.push(`${who} fainted!`);}
      else if(w==='guess'&&ok)notes.push('A right guess still counts, and it comes back for review soon.');
      // Lumen: 10 in a row on one session, no guess and no Insight help.
      s.lumen=obj(s.lumen);s.lumenRun=obj(s.lumenRun);const n=it.session,run=obj(s.lumenRun[n]);let cnt=+run.n||0;
      if(!ok)cnt=0;else if(w!=='guess'&&b.move!=='insight')cnt++;
      s.lumenRun[n]={n:cnt,at:new Date().toISOString()};
      if(cnt>=LUMEN_RUN&&!s.lumen[n]){const cre=api.sessionCreature?api.sessionCreature(n):null;if(cre){s.lumen[n]={creature:cre,at:new Date().toISOString(),run:cnt};b.lumenNew={n,creature:cre};notes.push(`Ten in a row on Route ${n}: its Lumen form is unlocked!`);}}
      if(notes.length)b.msg=(b.msg||'')+' '+notes.join(' ');
    }
    // tally: Focus answers (recall first, no wager) still move the streak meter.
    function tally(b,ok){if(!b)return;if(ok){COMBO[C]++;b.comboXP=(b.comboXP||0)+2*(comboMult(COMBO[C])-1);}else COMBO[C]=0;}
    const comboXP=b=>Math.round((b&&b.comboXP)||0);
    // Recall Center order: misses you were Sure about come first.
    function prioritize(list,s){const m=obj(s&&s.misses);return list.map((x,i)=>({x,i,p:m[x.id]&&m[x.id].sure?0:1})).sort((a,b)=>a.p-b.p||a.i-b.i).map(o=>o.x);}

    // ---------- evolution cutscene ----------
    // Line creatures change form by stage (stars); older creatures by the evolved flag.
    // A line whose two forms share a name (rares, water and pack specials) never plays a cutscene.
    function evolveHTML(id,from,to){const B=api.B,line=!!(B&&B.isLine&&B.isLine(id));
      let a,c,names='';if(line){if(from==null||to==null||from===to)return '';a=`data-stage="${from}"`;c=`data-stage="${to}"`;const fa=B.formName(id,from),fb=B.formName(id,to);if(!fa||!fb||fa===fb)return '';names=`${fa} evolved into ${fb}!`;}else{a='data-evolved="0"';c='data-evolved="1"';}
      const can=(cls,attr)=>`<canvas class="${cls}" data-creature="${esc(id)}" ${attr} width="140" height="124" aria-hidden="true"></canvas>`;
      return `<div class="eq-evolve bfx-evo${RM()?' still':''}" role="img" aria-label="Evolution${names?': '+esc(names):''}">${can('bfx-e0',a)}${can('bfx-e0 bfx-sil',a)}${can('bfx-e1 bfx-sil',c)}${can('bfx-e1',c)}<i class="bfx-evo-flash"></i></div>${names?`<p class="eq-level evolved bfx-evo-cap">${esc(names)}</p>`:''}`;}

    // ---------- after every render ----------
    const mo=new MutationObserver(()=>{if(!dialog.isConnected){mo.disconnect();return;}try{decorate();}catch(e){}});
    mo.observe(dialog,{childList:true});
    function onKey(e){if(!dialog.isConnected){document.removeEventListener('keydown',onKey,true);return;}if(e.metaKey||e.ctrlKey||e.altKey)return;
      const b=api.battle();if(!b||b.phase!=='question')return;const k=String(e.key||'').toLowerCase(),w=WAGERS.find(x=>x[2]===k);if(!w)return;
      e.preventDefault();e.stopPropagation();setWager(b,w[0]);}
    // The wager bar and its S, T, G keys are off in Mnemon: confidence is the one-tap Unsure toggle (exam-quest.js),
    // which sets b.wager to 'guess' before settle() reads it.
    function setWager(b,w){b.wager=b.wager===w?null:w;dialog.querySelectorAll('.bfx-wager button[data-wager]').forEach(x=>{const on=x.dataset.wager===b.wager;x.classList.toggle('on',on);x.setAttribute('aria-pressed',on?'true':'false');});}

    function decorate(){
      const b=api.battle(),c=api.center&&api.center();
      if(b&&dialog.querySelector('.pk-arena'))battleFX(b);
      if(!b&&c&&dialog.querySelector('.eq-heal'))centerFX(c);
      if(!b&&!c&&dialog.querySelector('.eq-card'))homeFX();
      if(!b&&!c&&dialog.querySelector('.eq-dexhead'))dexFX();
    }

    function battleFX(b){
      const arena=dialog.querySelector('.pk-arena'),me=b.team&&b.team[b.active],lum=lumenCreatures();
      dialog.querySelectorAll('.pk-me canvas[data-creature]').forEach(cv=>{if(lum.has(cv.dataset.creature))cv.classList.add('bfx-lumen');});
      // Streak meter in the trainer box (replaces the plain streak chip).
      const box=dialog.querySelector('.pk-me-box'),n=COMBO[C],m=comboMult(n),nt=nextTier(n);
      if(box&&n>0){const lo=n>=10?10:n>=7?7:n>=5?5:n>=3?3:0,pct=nt?Math.round((n-lo)/(nt-lo)*100):100;
        box.insertAdjacentHTML('beforeend',`<span class="bfx-combo t${m>1?Math.round((m-1)*4):0}" title="Correct answers in a row raise your XP multiplier. It never changes damage or scoring."><b>Streak ${n}</b><em>XP x${m}</em><span class="bfx-combo-bar"><i style="width:${pct}%"></i></span></span>`);}
      if(n!==lastCombo){if(n>lastCombo&&m>comboMult(lastCombo)&&arena&&!RM())pop(arena,`Streak ${n}: XP x${m}`,'bfx-pop-combo');lastCombo=n;}
      // Move-name banner, once per question.
      if(b.phase==='question'&&arena){const key=b.i+'|'+b.moveName+'|'+(b.queue[b.i]&&b.queue[b.i].id);if(key!==lastBanner){lastBanner=key;const it=api.byId().get(b.queue[b.i].id);
        if(!RM()){const col=b.sig?tcolor(b.sig.type):'#2b4a44',ban=document.createElement('div');ban.className='bfx-banner';ban.setAttribute('aria-hidden','true');ban.style.setProperty('--tc',col);
          ban.innerHTML=`<b>${esc(b.moveName||'')}</b><small>${esc(kindLabel(it))}</small>`;arena.appendChild(ban);setTimeout(()=>ban.remove(),1500);}}}
      if(b.phase==='moves')moveNotes(b,me);
      // Damage: number size, shake, particles, crit flash, faint.
      const hitFoe=dialog.querySelector('.pk-foe .pk-dmg'),hitMe=dialog.querySelector('.pk-me .pk-dmg'),num=hitFoe||hitMe;
      if(num&&arena){const dmg=Math.abs(parseInt(num.textContent,10))||0,onFoe=!!hitFoe,fx=dialog.querySelector(onFoe?'.pk-foe .pk-fx':'.pk-me .pk-fx'),
        type=fx?((String(fx.className).match(/(?:^|\s)fx-(\S+)/)||[])[1]||'neutral'):'neutral',crit=!!(fx&&fx.classList.contains('crit'))||num.classList.contains('crit'),
        msg=String(b.msg||''),sup=/strong match/i.test(msg),weak=/weak match/i.test(msg),target=dialog.querySelector(onFoe?'.pk-foe canvas':'.pk-me canvas');
        num.classList.add('bfx-num');if(sup)num.classList.add('sup');if(weak)num.classList.add('weak');num.style.fontSize=Math.round((18+Math.min(18,dmg*.3))*(crit?1.3:1))+'px';
        if(crit&&!RM()){const fl=document.createElement('i');fl.className='bfx-critflash';arena.appendChild(fl);setTimeout(()=>fl.remove(),600);pop(arena,'Critical hit','bfx-pop-crit');}
        shake(arena,Math.min(12,(onFoe?1.5:3)+dmg/(onFoe?9:6))+(crit?4:0),crit?460:360);
        const col=tcolor(type);burst(arena,target,col,{n:Math.round(10+Math.min(26,dmg*.45))+(crit?10:0),speed:sup?1.35:weak?.7:1,size:sup||crit?1.4:1,ring:sup?70:crit?55:0,dur:sup?800:620});
        if(!onFoe&&me&&me.hp<=0&&target)target.classList.add('bfx-faint');
        if(onFoe&&b.foeHP<=0&&target)target.classList.add(b.special?'bfx-faint':'bfx-worn');}
      else if(me&&me.hp<=0){const t=dialog.querySelector('.pk-me canvas');if(t)t.classList.add('bfx-down');}
      if(b.phase==='end')endFX(b);
    }
    // Say up front when a move cannot get a question of its own format, and what it plays as,
    // using the same rules exam-quest.js applies (pullFor, then AtlasMoves.alignMove).
    function moveNotes(b,me){const Mv=M();if(!Mv||!Mv.alignMove||!me||!b.queue[b.i])return;const by=api.byId(),cur=by.get(b.queue[b.i].id);if(!cur)return;
      const misses=obj(api.S().misses),open=it=>!!(it&&misses[it.id]&&!misses[it.id].healed),list=Mv.movesFor(me);
      dialog.querySelectorAll('.pk-move[data-move]').forEach(el=>{const mv=list.find(x=>x.id===el.dataset.move);if(!mv||el.querySelector('.bfx-mvnote'))return;
        if(mv.format==='signature'?(open(cur)||Mv.fits('signature',cur)):Mv.fits(mv.format,cur))return;
        if(!b.special){const inQ=new Set(b.queue.map(q=>q.id)),past=new Set(b.queue.slice(0,b.i).map(q=>q.id));
          for(const x of by.values()){if(x.session!==b.x.n)continue;if(mv.format==='signature'&&open(x)&&!past.has(x.id))return;if(Mv.fits(mv.format,x)&&!inQ.has(x.id))return;}}
        const al=Mv.alignMove(mv,cur,open(cur),list);if(al===mv)return;
        el.insertAdjacentHTML('beforeend',`<small class="bfx-mvnote">${b.special?'This turn':`No ${esc(Mv.FORMAT[mv.format].name.toLowerCase())} question left here, so it`} plays as ${esc(al.name)} (${esc(Mv.FORMAT[al.format].name)}, power ${al.power})${mv.pp<99?' and keeps its uses':''}.</small>`);});}
    function pop(arena,text,cls){const p=document.createElement('div');p.className='bfx-pop '+cls;p.setAttribute('aria-hidden','true');p.textContent=text;arena.appendChild(p);setTimeout(()=>p.remove(),1300);}
    function wagerBar(b){const opts=dialog.querySelector('.pk-q .gx-options');if(!opts||dialog.querySelector('.bfx-wager'))return;
      const html=`<div class="bfx-wager" role="group" aria-label="How sure are you? Optional"><span class="bfx-wager-q">How sure? <small>Optional, pick before you answer</small></span>${WAGERS.map(([id,label,k])=>`<button type="button" data-wager="${id}" class="${b.wager===id?'on':''}" aria-pressed="${b.wager===id?'true':'false'}"><kbd>${k.toUpperCase()}</kbd>${label}</button>`).join('')}<small class="bfx-wager-help">Sure: right adds bonus damage (within the +25 percent per-hit cap), wrong hits harder and goes first in the Recall Center. Guess: a right guess still comes back for review.</small></div>`;
      opts.insertAdjacentHTML('beforebegin',html);
      dialog.querySelectorAll('.bfx-wager button[data-wager]').forEach(x=>x.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();const bb=api.battle();if(bb&&bb.phase==='question')setWager(bb,x.dataset.wager);}));}
    function endFX(b){const end=dialog.querySelector('.eq-end');if(!end||end.dataset.bfx)return;end.dataset.bfx='1';const x=b.xpInfo;
      if(x&&x.gain>0){const from=+x.from||0,to=from+x.gain,l0=lvOf(from),l1=lvOf(to),bonus=x.bonus||0;
        const row=document.createElement('div');row.className='bfx-xp';row.innerHTML=`<span class="bfx-xp-lv">Lv. ${l0}</span><span class="bfx-xp-bar"><i style="width:${lvPct(from)}%"></i></span><b>+${x.gain} XP${bonus?` <small>(streak +${bonus})</small>`:''}</b>`;
        const eb=end.querySelector('.eyebrow');if(eb)eb.after(row);else end.prepend(row);
        const bar=row.querySelector('i'),lv=row.querySelector('.bfx-xp-lv');
        if(RM()){bar.style.width=lvPct(to)+'%';lv.textContent='Lv. '+l1;}
        else if(l1>l0){setTimeout(()=>{bar.style.width='100%';},120);setTimeout(()=>{bar.style.transition='none';bar.style.width='0%';lv.textContent='Lv. '+l1;lv.classList.add('up');void bar.offsetWidth;bar.style.transition='';bar.style.width=lvPct(to)+'%';},950);}
        else setTimeout(()=>{bar.style.width=lvPct(to)+'%';},120);}
      if(b.lumenNew){const B=api.B,id=b.lumenNew.creature;const nm=B&&B.isLine&&B.isLine(id)?B.formName(id):(api.cname?api.cname(id):id);
        end.querySelector('h3')?.insertAdjacentHTML('afterend',`<div class="bfx-lumen-new"><canvas class="bfx-lumen" data-creature="${esc(id)}" width="96" height="86" aria-hidden="true"></canvas><p><b>Lumen form unlocked:</b> ${esc(nm)}, Route ${esc(b.lumenNew.n)}. Ten right in a row, no guesses. It shines in your field guide now.</p></div>`);
        const cv=end.querySelector('.bfx-lumen-new canvas');if(cv&&B){const ctx=cv.getContext('2d');try{B.draw(ctx,id,cv.width/2,cv.height/2+6,cv.width/44,false);}catch(e){}}}
      const evo=end.querySelector('.bfx-evo:not(.still)');if(evo&&!RM())setTimeout(()=>{if(evo.isConnected)burst(evo.parentElement,evo,'#ffd76a',{n:34,speed:1.2,size:1.3,ring:80,dur:900});},2550);}
    function centerFX(c){const slot=c.queue&&c.queue[0];if(!slot)return;const s=api.S(),m=obj(s.misses)[slot.id];if(!m||!m.sure)return;const eb=dialog.querySelector('.world-panel-header .eyebrow');if(eb&&!eb.querySelector('.bfx-pri'))eb.insertAdjacentHTML('beforeend',' <span class="bfx-pri">Priority: you were sure</span>');}
    function homeFX(){const s=api.S(),lum=obj(s.lumen),all=lumenCreatures();
      dialog.querySelectorAll('.eq-mon[data-s]').forEach(el=>{const n=el.dataset.s,L=lum[n];if(!L||!el.classList.contains('caught'))return;el.querySelector('canvas')?.classList.add('bfx-lumen');if(!el.querySelector('.bfx-lumen-tag'))el.insertAdjacentHTML('beforeend','<em class="bfx-lumen-tag">Lumen</em>');});
      const cardCv=dialog.querySelector('.eq-card canvas[data-creature]');if(cardCv&&all.has(cardCv.dataset.creature))cardCv.classList.add('bfx-lumen');
      const main=dialog.querySelector('.eq-card .eq-card-main');if(!main||main.querySelector('.bfx-calib'))return;
      const at=(s.attempts||[]).filter(a=>a&&a.w),cnt=w=>{const r=at.filter(a=>a.w===w);return [r.filter(a=>a.ok).length,r.length];};
      const [sr,st]=cnt('sure'),[tr,tt]=cnt('think'),[gr,gt]=cnt('guess');
      main.insertAdjacentHTML('beforeend',st+tt+gt?`<p class="bfx-calib"><b>Calibration:</b> ${st?`when you say Sure you are right <b>${sr} of ${st}</b> (${Math.round(sr/st*100)}%)`:'no Sure answers yet'}${tt?`; Think so ${tr} of ${tt}`:''}${gt?`; Guess ${gr} of ${gt}`:''}</p>`:`<p class="bfx-calib">Calibration: tag answers Sure, Think so or Guess in battle to see how often your Sure is right.</p>`);}
    function dexFX(){const btn=dialog.querySelector('.eq-dexhead [data-act=wild][data-s]');if(!btn)return;const n=btn.dataset.s,s=api.S(),L=obj(s.lumen)[n],caught=((obj(s.dex)[n]||{}).stars||0)>=1,run=+(obj(obj(s.lumenRun)[n]).n)||0;
      const head=dialog.querySelector('.eq-dexhead'),cv=head.querySelector('canvas');if(L&&caught&&cv)cv.classList.add('bfx-lumen');
      const host=head.querySelector('h3');if(!host||head.querySelector('.bfx-lumen-note'))return;
      host.insertAdjacentHTML('afterend',L?`<p class="bfx-lumen-note">${caught?'<em class="bfx-lumen-tag">Lumen</em> ':''}Lumen form earned ${esc(new Date(L.at).toLocaleDateString())} with ${LUMEN_RUN} right in a row.${caught?'':' Catch it to see the form.'}</p>`:`<p class="bfx-lumen-note">Lumen form: answer ${LUMEN_RUN} of this session's questions right in a row in battle, no guesses. Current run: ${Math.min(run,LUMEN_RUN)} of ${LUMEN_RUN}.</p>`);}

    return {settle,tally,comboXP,prioritize,evolveHTML,combo:()=>COMBO[C]};
  }
  root.AtlasBattleFX={attach,comboMult,lumenCreatures,LUMEN_RUN};
})(typeof window!=='undefined'?window:globalThis);
