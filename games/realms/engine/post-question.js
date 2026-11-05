/* AtlasPostQuestion: what the player sees after every answer, right or wrong. Forked lean from the Living Atlas
 * post-question flow and its relearn card (the kept parts of both live here).
 *
 * Kept: the bold "Answer: X. Tell: <clue>" lead, your pick with its named trap, the look-alike duel (a figure miss
 * whose pick names a confusable structure gets the two visuals side by side), the why for every choice in a closed
 * fold, the route's pack field notes and traps in a closed "More" fold, "One more like this", and record().
 * Dropped from the source: source-page resolvers and aliases, quotes and recorded clips, guided relearn, half sheets,
 * explainer and helper auto-loaders, and everything course specific.
 *
 * API (window.AtlasPostQuestion):
 *   cardHTML(item, {pickedIndex (original index, -1 none), correct, confidence ('sure'|'guess'), perm (display order),
 *     facts, traps (the route's pack dex rows), moreQueued}) -> HTML. The visual leads, tap to zoom (lightbox.js).
 *   tellOf(item), pickLine(item, idx), lookalike(item, idx), duelFor(item, idx, pool), siblingsOf(item, {pool,
 *     exclude, n}), normalize(item), record(item, result).
 * The visual never appears on a question screen; this card is only built after an answer. Plain ASCII.
 */
(function(root){
  'use strict';
  const QUEST='ace_dat_realms_mnemon_v1_quest_v1',MISS='ace_dat_realms_mnemon_v1_missbank_v1',L='ABCDE';
  const obj=v=>v&&typeof v==='object'&&!Array.isArray(v)?v:{};
  const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const CH=c=>String.fromCharCode(c);
  const RX={dash:new RegExp('['+CH(0x2014)+CH(0x2013)+']','g'),sq:new RegExp('['+CH(0x2018)+CH(0x2019)+']','g'),dq:new RegExp('['+CH(0x201c)+CH(0x201d)+']','g')};
  const ascii=s=>String(s==null?'':s).replace(/ {2,}/g,' ').trim();
  const readJSON=(k,f)=>{try{const v=JSON.parse(root.localStorage.getItem(k)||'null');return v==null?f:v;}catch(e){return f;}};
  const writeJSON=(k,v)=>{try{root.localStorage.setItem(k,JSON.stringify(v));}catch(e){}};

  // ---------- the bank and one item shape ----------
  let bankMap=null,bankN=-1;
  function bank(){const src=Array.isArray(root.MNEMON_ITEMS)?root.MNEMON_ITEMS:[];if(bankMap&&bankN===src.length)return bankMap;bankMap=new Map();for(const x of src)if(x&&x.id!=null&&!bankMap.has(x.id))bankMap.set(x.id,x);bankN=src.length;return bankMap;}
  function normalize(it,o){it=obj(it);o=o||{};const b=bank().get(it.id),src=b?{...b,...it}:{...it};
    for(const k of ['why','visual','visualCap','fig','src','trap','tell'])if((src[k]==null||src[k]==='')&&b&&b[k]!=null)src[k]=b[k];
    const options=Array.isArray(src.options)&&src.options.length?src.options:null;
    const ans=options&&src.answer!=null&&isFinite(+src.answer)?+src.answer:null;
    const answerText=ascii(options&&ans!=null?options[ans]:'');
    const asset=root.AtlasQuest&&root.AtlasQuest.asset?root.AtlasQuest.asset:(p=>p);
    return {...src,raw:it,course:String(o.course||src.course||'BIO').toUpperCase(),session:+(o.session!=null?o.session:src.session)||0,stem:ascii(src.stem||''),
      options,answerIdx:ans,answerText,why:Array.isArray(src.why)?src.why:[],visual:asset(src.visual||''),fig:asset(src.fig||'')};}

  // ---------- the tell: the one distinguishing clue ----------
  const sentences=t=>String(t||'').split(/(?<=[.!?])\s+(?=[A-Z0-9"'(])/).map(x=>x.trim()).filter(Boolean);
  const unparen=t=>{const o=t.lastIndexOf('('),c=t.lastIndexOf(')');return o>c&&o>40?t.slice(0,o).replace(/[\s,;:]+$/,'')+'.':t;};
  function clip0(t,max){for(const sep of [': ','; ',' because ',', ']){const i=t.lastIndexOf(sep,max);if(i>=40)return t.slice(0,i).replace(/[,;:]$/,'')+'.';}const j=t.lastIndexOf(' ',max);return t.slice(0,j>40?j:max).replace(/[,;:]$/,'')+'.';}
  function clip(t,max){t=ascii(t).replace(/\s+/g,' ').trim();if(t.length<=max)return t;return unparen(clip0(t,max));}
  const RULE=/\b(because|not|unlike|only|whereas|while|instead|rather than|than|vs|versus|the tell|look for|marks?|means)\b/i;
  // The bank's own tell wins; else the sentence of the keyed why that best names the distinguishing feature.
  function tellOf(item){const n=item&&item.answerText!=null&&item.raw?item:normalize(item);if(n.tell)return clip(n.tell,200);
    const t=ascii(n.answerIdx!=null&&n.why[n.answerIdx]?n.why[n.answerIdx]:'');if(!t)return '';
    const aw=new Set((String(n.answerText).toLowerCase().match(/[a-z]{4,}/g)||[]));
    const cand=sentences(t).map((y,i)=>{const w=(y.toLowerCase().match(/[a-z]{4,}/g)||[]);return {y,sc:w.filter(v=>aw.has(v)).length*1.5+(RULE.test(y)?2:0)+Math.min(2,w.length/8)-i*.6-(y.length<35?2:0)};});
    const best=cand.filter(c=>c.y.length>=25).sort((a,b)=>b.sc-a.sc)[0]||cand.sort((a,b)=>b.y.length-a.y.length)[0];
    return best?clip(best.y,200):'';}

  // ---------- look-alikes: confusable structures in one family ----------
  // Matching is on the head of the option text only, so the facts shown always come from the bank's own why text.
  const T=(g,k,re)=>({g,k,re});
  const TERMS={BIO:[
    T('Organelles','rough ER',/rough (er|endoplasmic)/i),T('Organelles','smooth ER',/smooth (er|endoplasmic)/i),T('Organelles','Golgi apparatus',/golgi/i),T('Organelles','lysosome',/lysosom/i),T('Organelles','peroxisome',/peroxisom/i),T('Organelles','mitochondrion',/mitochondri/i),T('Organelles','nucleolus',/nucleolus/i),T('Organelles','ribosome',/ribosom/i),
    T('Division phases','prophase',/^prophase/i),T('Division phases','metaphase',/^metaphase/i),T('Division phases','anaphase',/^anaphase/i),T('Division phases','telophase',/^telophase/i),T('Division phases','prophase I',/prophase i\b/i),T('Division phases','metaphase I',/metaphase i\b/i),T('Division phases','anaphase I',/anaphase i\b/i),
    T('Germ layers','ectoderm',/^ectoderm/i),T('Germ layers','mesoderm',/^mesoderm/i),T('Germ layers','endoderm',/^endoderm/i),
    T('Nephron','proximal tubule',/proximal (convoluted )?tubule/i),T('Nephron','loop of Henle',/loop of henle|ascending limb|descending limb/i),T('Nephron','distal tubule',/distal (convoluted )?tubule/i),T('Nephron','collecting duct',/collecting duct/i),
    T('Blood cells','neutrophil',/neutrophil/i),T('Blood cells','eosinophil',/eosinophil/i),T('Blood cells','basophil',/basophil/i),T('Blood cells','monocyte',/monocyte/i),T('Blood cells','lymphocyte',/lymphocyte|t cell|b cell/i),
    T('Plant tissues','xylem',/^xylem/i),T('Plant tissues','phloem',/^phloem/i)]};
  const headOf=t=>String(t||'').split(/[;:]|,\s(?:the|a|an|which|because|from|where|so)\b/i)[0];
  function termsOf(text,course){const list=TERMS[String(course||'').toUpperCase()]||[];const h=headOf(text).replace(/^(?:an?|the)\s+/i,''),out=[];for(const t of list){const m=t.re.exec(h);if(m&&m.index<=2)out.push(t);}if(new Set(out.map(t=>t.k)).size>1)return [];return out;}
  function lookalike(item,idx){const n=normalize(item);if(!n.options||idx==null||idx<0||idx===n.answerIdx)return null;
    const kt=termsOf(n.answerText,n.course),pt=termsOf(n.options[idx],n.course);
    for(const p of pt){if(kt.some(k=>k.k===p.k))continue;const k=kt.find(k=>k.g===p.g);if(k)return {group:p.g,pick:p,key:k};}return null;}
  const validItem=x=>x&&typeof x.stem==='string'&&Array.isArray(x.options)&&([4,5].includes(x.options.length)||(x.options.length===2&&x.kind==='tf'))&&+x.answer>=0&&+x.answer<x.options.length&&x.verified===true&&x.reviewStatus==='internal-reviewed';
  function poolOf(course,pool){const C=String(course||'').toUpperCase();return (Array.isArray(pool)&&pool.length?pool:(root.MNEMON_ITEMS||[])).filter(x=>x&&String(x.course||'').toUpperCase()===C&&validItem(x)&&x.pool==='practice');}
  // The other side of the duel: an item with a visual whose KEY is the structure you picked.
  function duelFor(item,idx,pool){const n=normalize(item),la=lookalike(n,idx);if(!la)return null;
    const cands=poolOf(n.course,pool).filter(x=>x.id!==n.id&&(x.visual||x.fig)&&termsOf(x.options[+x.answer],n.course).some(t=>t.k===la.pick.k));
    if(!cands.length)return null;cands.sort((a,b)=>((+b.session===n.session)-(+a.session===n.session))*4+(Math.random()-.5));
    return {item:cands[0],lookalike:la};}
  // Siblings: same route, a different stem, ranked by the same key structure, the same kind, and shared stem words.
  const wordsOf=t=>new Set((String(t||'').toLowerCase().match(/[a-z]{5,}/g)||[]));
  function siblingsOf(item,o){o=o||{};const n=normalize(item),skip=o.exclude instanceof Set?o.exclude:new Set(o.exclude||[]),kt=termsOf(n.answerText,n.course).map(t=>t.k),sw=wordsOf(n.stem+' '+n.answerText);
    const stemKey=String(n.stem).toLowerCase().slice(0,60);
    const c=poolOf(n.course,o.pool).filter(x=>x.id!==n.id&&+x.session===n.session&&!skip.has(x.id)&&String(x.stem).toLowerCase().slice(0,60)!==stemKey);
    const score=x=>{let s=0;const xt=termsOf(x.options[+x.answer],n.course).map(t=>t.k);if(kt.length&&xt.some(k=>kt.includes(k)))s+=5;if((x.kind||'mcq')===(n.kind||'mcq'))s+=1;let w=0;for(const t of wordsOf(x.stem+' '+x.options[+x.answer]))if(sw.has(t))w++;s+=Math.min(4,w*.7);return s+Math.random()*.5;};
    return c.map(x=>({x,s:score(x)})).sort((a,b)=>b.s-a.s).slice(0,o.n||3).map(r=>r.x);}

  // ---------- record: one writer for any screen outside a battle ----------
  function updateQ(fn){const R=root.AtlasRegion;if(R&&typeof R.updateQuest==='function')return R.updateQuest(fn);const q=obj(readJSON(QUEST,{}));const out=fn(q);writeJSON(QUEST,q);return out;}
  function record(item,r){r=r||{};const n=normalize(item,{course:r.course});if(!validItem(n.raw&&n.raw.options?n.raw:n))return null;const C=n.course,ok=!!r.ok,at=r.at||new Date().toISOString(),w=r.confidence||'sure';
    const a={id:n.id,s:n.session,ok,at,m:r.mode||'post-question',w};
    updateQ(q=>{q.courses=obj(q.courses);const T=q.courses[C]=obj(q.courses[C]);T.attempts=Array.isArray(T.attempts)?T.attempts:[];T.attempts.push(a);if(T.attempts.length>6000)T.attempts=T.attempts.slice(-6000);
      q.seen=obj(q.seen);q.seen[n.id]=(+q.seen[n.id]||0)+1;T.misses=obj(T.misses);const m=obj(T.misses[n.id]);
      if(ok){if(T.misses[n.id]&&!m.healed)T.misses[n.id]={...m,healed:true,healedAt:at};}else T.misses[n.id]={...m,at,healed:false,count:(+m.count||0)+1,...(w==='sure'?{sure:true}:{})};});
    try{const S=root.AtlasSRS;S&&S.grade&&S.grade(n.id,ok?(w==='guess'?1:2):0,{session:n.session});}catch(e){}
    if(!ok){const b=readJSON(MISS,{});if(b&&typeof b==='object'&&!Array.isArray(b)){const day=at.slice(0,10);const row=b[n.id]||{id:n.id,course:C,mode:'mnemon',group:'Route '+n.session,q:n.stem,answer:n.answerText,count:0,status:'open',first:day};
      row.count=(row.count||0)+1;row.last=day;row.status='open';row.picked=n.options&&r.picked!=null&&r.picked>=0?ascii(n.options[r.picked]):'(blank)';b[n.id]=row;writeJSON(MISS,b);}}
    return a;}

  // ---------- the card ----------
  function pickLine(item,idx){const n=normalize(item);if(!n.options||idx==null||idx<0||idx===n.answerIdx)return '';const la=lookalike(n,idx);
    const y=ascii(n.options[idx]),trap=ascii(n.trap||''),why=ascii(n.why[idx]||'');
    const named=trap?`<span class="mq-trap"><b>Trap:</b> ${esc(clip(trap,170))}</span>`:why?`<span class="mq-trap">${esc(clip(why,170))}</span>`:'';
    return `Your pick: <b>${esc(y)}</b>.${la?` It looks like the answer (both ${esc(la.group.toLowerCase())}: ${esc(la.pick.k)} vs ${esc(la.key.k)}).`:''} ${named}`;}
  function verdictOf(o){if(o.correct)return o.confidence==='guess'?'Correct and marked uncertain. Compare the reasoning before moving on.':'Right.';
    if(o.pickedIndex==null||o.pickedIndex<0)return 'Not recalled yet. Follow the model, then try another case.';
    return o.confidence==='sure'?'Confident and incorrect: review the reasoning, then try a fresh case.':'Not this time. Read the reasoning, then try again when it returns.';}
  // A phone-width Canon crop (content/visuals/crops/) shows at full card width, no taller than 40vh so the answer and
  // tell stay above the Continue bar; a taller one shows its top and says a tap opens it whole; a landscape drawing (SVG) sits on its own cream ground and says it can be zoomed.
  const figHTML=(src,cap,cls)=>{const k=/\/crops\//.test(src)?'mq-crop':/\.svg(\?|$)/i.test(src)?'mq-svg':'';
    return `<figure class="mq-visual${k?' '+k:''}${cls?' '+cls:''}"><img src="${esc(src)}" data-zoom alt="${esc(cap||'Visual for this question')}" decoding="async" onload="if(this.naturalHeight/this.naturalWidth*this.clientWidth>this.getBoundingClientRect().height+4)this.closest('figure').classList.add('mq-tall')" onerror="this.closest('figure').remove()"><span class="mq-zoomhint" aria-hidden="true"></span>${cap?`<figcaption>${esc(cap)}</figcaption>`:''}</figure>`;};
  function duelHTML(n,o){if(o.correct||o.pickedIndex==null||o.pickedIndex<0||!(n.visual||n.fig))return '';const d=duelFor(n,o.pickedIndex,o.pool);if(!d)return '';
    const other=normalize(d.item);return `<section class="mq-duel" aria-label="Look-alike pair"><p class="mq-duelhead">Spot the difference: <b>${esc(d.lookalike.key.k)}</b> vs <b>${esc(d.lookalike.pick.k)}</b> (your pick)</p><div class="mq-duelrow">${figHTML(other.visual||other.fig,'That: '+d.lookalike.pick.k,'mq-that')}</div>${tellOf(other)?`<p class="mq-duelnote"><b>${esc(d.lookalike.pick.k)}:</b> ${esc(tellOf(other))}</p>`:''}</section>`;}
  function cardHTML(item,o){o=o||{};const n=normalize(item);if(!n.options)return '';
    const perm=Array.isArray(o.perm)&&o.perm.length===n.options.length?o.perm:n.options.map((_,i)=>i),picked=o.pickedIndex,tell=tellOf(n);
    const workedVisual=root.AtlasQuest.asset(n.feedbackVisual||'')||root.AtlasQuest.asset(n.visual||''),answerVisual=root.AtlasQuest.asset(n.optionVisuals?.[n.answerIdx]||'');
    const vis=workedVisual||answerVisual||root.AtlasQuest.asset(n.fig||''),caption=workedVisual?(n.feedbackVisual?'Worked answer diagram for this question.':n.visualCap||''):answerVisual?'Correct answer diagram.':n.visualCap||'';
    const choiceButtons=perm.map((oi,di)=>`<button type="button" class="exp-tool" data-mq-choice="${oi}" aria-pressed="false">${L[di]}${oi===n.answerIdx?' · answer':oi===picked?' · your pick':''}</button>`).join('');
    const explanations=perm.map((oi,di)=>`<div data-mq-explanation="${oi}" hidden>${root.AtlasQuest.optionVisualHTML(n,oi)}<p><strong>${L[di]}. ${esc(ascii(n.options[oi]))}</strong></p><p>${esc(ascii(n.why[oi]||'Use the stated conditions and the worked reasoning above.'))}</p></div>`).join('');
    const reasoning=ascii(n.explanation||tell||n.why[n.answerIdx]||'');
    return `<section class="mq-feedback"><p class="mq-verdict">${esc(verdictOf({correct:!!o.correct,confidence:o.confidence,pickedIndex:picked}))}</p>`+
      (vis?figHTML(vis,caption):root.AtlasQuest.optionVisualHTML(n,n.answerIdx))+
      `<p class="mq-answer">${esc(n.answerText||'See the visual answer below')}</p>`+
      (reasoning?`<section class="mq-reasoning"><h4>Follow the reasoning</h4><p>${esc(reasoning)}</p></section>`:'')+
      (!o.correct&&picked!=null&&picked>=0?`<p class="mq-pick">${pickLine(n,picked)}</p>`:'')+
      `<section class="mq-choice-compare" aria-label="Compare answer choices"><h4>Inspect a choice</h4><div class="exp-tools" role="group" aria-label="Choice explanations">${choiceButtons}</div><div aria-live="polite">${explanations}</div></section>`+
      (root.AtlasInteractive?.forItem(n.id)?'<button type="button" class="exp-tool" data-act="model">Explore this concept at the field station</button>':'')+
      (n.pool==='check'||n.pool==='later'?'':`<button type="button" class="mq-onemore exp-tool" data-act="one-more" ${o.moreQueued?'disabled':''}>${o.moreQueued?'Queued: a different practice case comes next':'Try a different practice case'}</button>`)+`</section>`;}
  root.document?.addEventListener('click',event=>{const b=event.target.closest?.('[data-mq-choice]'),section=b?.closest('.mq-choice-compare');if(!section)return;section.querySelectorAll('[data-mq-choice]').forEach(el=>el.setAttribute('aria-pressed',String(el===b)));section.querySelectorAll('[data-mq-explanation]').forEach(el=>el.hidden=el.dataset.mqExplanation!==b.dataset.mqChoice);});

  root.AtlasPostQuestion={version:2,cardHTML,figureHTML:(src,cap)=>figHTML(src,cap,''),tellOf,pickLine,lookalike,duelFor,siblingsOf,termsOf,normalize,record,TERMS};
})(typeof window!=='undefined'?window:globalThis);
