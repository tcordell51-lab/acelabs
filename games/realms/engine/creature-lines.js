/* Creature lines: every route of a course pack has its own three-stage evolution line plus a rare variant,
 * each with one of the pack's types. Route creatures evolve through mastery (route stars: 2 stars middle form,
 * 3 stars final form). Sprites are generated from a seed so each species looks distinct; no image files.
 * The core style families below (fuel, membrane, bond...) are battle mechanics: a pack type names one, and its
 * trait, sprite palette and fighting style follow it. The base companions take the pack's first types.
 * Plain ASCII.
 */
(function(root){
  'use strict';
  const B=root.AtlasBestiary;if(!B)return;
  // Core lines: none. Every line comes from a course pack (registerCoursePack).
  const LINES=[];
  const idOf=n=>n.toLowerCase();
  const WATER=[];
  const TRAIT_BY_TYPE={fuel:'spark',membrane:'shelter',bond:'tempered',catalyst:'precision',signal:'insight',oxygen:'shelter',helix:'insight',gene:'precision',redox:'spark',lipid:'tempered',tool:'precision',solvent:'shelter'};
  const byId=new Map();
  // 1. Register species first.
  for(const [n,type,names,rare,blurb] of LINES){
    const base={id:idOf(names[0]),name:names[0],courseId:'CORE',base:null,color:null,description:blurb,evolution:names[2],trait:B.traits[TRAIT_BY_TYPE[type]],line:{session:n,type,stages:names,rare:false}};
    const rv={id:idOf(rare),name:rare,courseId:'CORE',base:null,color:null,description:'A rare variant seen around Route '+n+'. '+blurb,evolution:rare,trait:B.traits[TRAIT_BY_TYPE[type]],line:{session:n,type,stages:[rare,rare,rare],rare:true}};
    for(const sp of [base,rv]){if(!B.species.some(s=>s.id===sp.id)){B.species.push(sp);byId.set(sp.id,sp);}}
  }
  for(const [id,name,sessions,second,plan,color,habitats,blurb] of WATER){
    const sp={id,name,courseId:'CORE',base:null,color:null,description:'A bridge creature of Routes '+sessions.join(' and ')+'. '+blurb,evolution:name,trait:B.traits.shelter,
      line:{session:sessions[0],sessions,type:'solvent',second,plan,color,habitats,stages:[name,name,name],rare:true,water:true}};
    if(!B.species.some(s=>s.id===id)){B.species.push(sp);byId.set(id,sp);}
  }

  // 2. Legacy mechanic IDs remain stable. DAT matchup explanations are fictional
  // game rules; they never establish a scientific relationship between subjects.
  const TYPES={fuel:{name:'Fuel',color:'#e0833a'},membrane:{name:'Membrane',color:'#8f7fd1'},bond:{name:'Bond',color:'#5aa5a0'},catalyst:{name:'Catalyst',color:'#d2a531'},
    signal:{name:'Signal',color:'#e25d84'},oxygen:{name:'Oxygen',color:'#4f8fd8'},helix:{name:'Helix',color:'#4aa36a'},gene:{name:'Gene',color:'#a86b3c'},redox:{name:'Redox',color:'#c24a3a'},lipid:{name:'Lipid',color:'#b9a13b'},tool:{name:'Tool',color:'#5d7488'},solvent:{name:'Solvent',color:'#2f9fc4'},neutral:{name:'Neutral',color:'#8a948c'}};
  // Attacker acts on or controls the defender (the core chart, used only between core families).
  const STRONG=[
    ['oxygen','fuel','Oxidation burns fuel all the way to CO2.'],['oxygen','redox','Oxygen is the final electron acceptor that pulls the whole chain.'],['oxygen','lipid','Fat is only burned when oxygen keeps the chain running.'],
    ['catalyst','fuel','Enzymes break fuel down one step at a time.'],['catalyst','bond','Catalysts make and break covalent bonds.'],['catalyst','lipid','Lipases and the beta-oxidation enzymes take fats apart.'],
    ['signal','catalyst','Kinases and phosphatases switch enzymes on and off.'],['signal','fuel','Insulin and glucagon decide which fuel gets burned.'],['signal','lipid','Glucagon and epinephrine trigger fat mobilization from adipose tissue.'],
    ['gene','signal','Expression builds the receptors and kinases that signals need.'],['gene','catalyst','Transcription decides how much enzyme exists.'],['gene','redox','Mitochondrial enzymes are made from gene instructions.'],
    ['helix','gene','DNA holds every gene the cell can express.'],['helix','tool','PCR, qPCR and sequencing all depend on base pairing.'],
    ['membrane','signal','Receptors for polar messengers sit in the plasma membrane.'],['membrane','helix','The nuclear envelope keeps the DNA in its own compartment.'],['membrane','redox','The inner mitochondrial membrane holds the proton gradient.'],
    ['bond','helix','Hydrogen bonds between bases hold the helix together.'],['bond','oxygen','Salt bridges hold hemoglobin in the tense, low-affinity state.'],['bond','catalyst','Weak bonds hold the substrate in the active site.'],
    ['tool','gene','RT-qPCR and RNA-seq measure what a gene expresses.'],['tool','helix','Sequencing reads the helix base by base.'],['tool','catalyst','Assays read an enzyme\'s Km and Vmax.'],
    ['redox','fuel','The TCA cycle strips fuel carbons down to CO2.'],['redox','lipid','Each beta-oxidation turn hands NADH and FADH2 to the chain.'],
    ['lipid','membrane','Phospholipids build every membrane.'],['lipid','fuel','In a long fast, fat oxidation spares glucose.'],
    ['fuel','membrane','ATP from fuel powers the pumps in every membrane.'],
    ['solvent','bond','Water surrounds ions and weakens ionic interactions.'],['solvent','membrane','The hydrophobic effect is what assembles the bilayer.'],['solvent','catalyst','Water is a reactant in every hydrolysis an enzyme runs.'],
    ['membrane','solvent','Membranes decide where water and its solutes can go.'],['bond','solvent','Hydrogen bonds hold water molecules to one another.'],['fuel','signal','A fed state is itself the signal: glucose triggers insulin release.']];
  const WEAK=[['fuel','oxygen','Fuel cannot stop oxidation.'],['signal','helix','A signal cannot rewrite the DNA code.'],['helix','bond','The helix depends on its bonds.'],
    ['lipid','oxygen','Fat cannot burn without oxygen.'],['redox','membrane','The chain needs an intact inner membrane.'],['tool','bond','Every primer and probe needs base pairing to bind.'],['catalyst','signal','A kinase or phosphatase signal switches the enzyme.'],['solvent','lipid','Fats do not dissolve in water.']];
  // Final forms of a pack line may carry a second type (pack lines: [n, type, names, rare, blurb, second, why]).
  const SECOND={};
  const SECOND_WHY={};
  // Effectiveness is kept slight (10/07) so the "N correct answers to win" counts stay honest: a strong
  // matchup is x1.2, a weak one x0.85, and a dual-type result is clamped to x0.8 .. x1.25.
  const STRONG_X=1.2,WEAK_X=.85,EFF_MIN=.8,EFF_MAX=1.25;
  function withinEffect(atk,def){const s=STRONG.find(x=>x[0]===atk&&x[1]===def);if(s)return {mult:STRONG_X,why:s[2]};const w=WEAK.find(x=>x[0]===atk&&x[1]===def);if(w)return {mult:WEAK_X,why:w[2]};
    // Course-pack types are namespaced ("BIO:membrane"); a matchup no chart covers is neutral.
    if(atk.includes(':')||def.includes(':')){const ps=PACK_STRONG.find(x=>x[0]===atk&&x[1]===def);if(ps)return {mult:STRONG_X,why:ps[2]};const pw=PACK_WEAK.find(x=>x[0]===atk&&x[1]===def);if(pw)return {mult:WEAK_X,why:pw[2]};}
    if(atk===def)return {mult:WEAK_X,why:'Same type resists itself.'};return {mult:1};}
  // 2b. ONE effectiveness rule for every battle in every world (exam-quest, region specials, gyms,
  //     the League, legendaries, the overworld battle). Within one course a matchup uses that course's
  //     own chart (the core chart above, or the pack's). Across courses every type belongs to one of six
  //     affinities on a wheel: each affinity beats the next one round the wheel and is resisted by
  //     the one before it. Multipliers are the same 1.2x and 0.85x, and every result that is not 1x
  //     carries a reason, just like the in-course chart.
  const AFFINITIES={
    message:{name:'Evidence',color:'#9a6fc4',note:'The Reading Comprehension affinity on the fictional battle wheel.'},
    machine:{name:'Alchemy',color:'#d2a531',note:'The Organic Chemistry affinity on the fictional battle wheel.'},
    energy:{name:'Forge',color:'#e0833a',note:'The General Chemistry affinity on the fictional battle wheel.'},
    force:{name:'Reason',color:'#c0564a',note:'The Quantitative Reasoning affinity on the fictional battle wheel.'},
    framework:{name:'Sight',color:'#5aa5a0',note:'The Perceptual Ability affinity on the fictional battle wheel.'},
    boundary:{name:'Vital',color:'#4f8fd8',note:'The Biology affinity on the fictional battle wheel.'}};
  const WHEEL=['message','machine','energy','force','framework','boundary'];
  const battleRule=(attacker,defender,strong)=>'Game rule: '+(strong?attacker+' has an advantage against '+defender:defender+' resists '+attacker)+'. This fictional matchup is not a DAT science rule.';
  const typeName=t=>(PACK_TYPES[t]||TYPES[t])?.name||'Unknown type';
  const affinityName=a=>[...new Set(Object.values(PACK_TYPES).filter(t=>t.affinity===a).map(t=>t.name))].join(' / ')||AFFINITIES[a].name;
  // Core style families. Course-pack types declare their own affinity in the pack (types.<id>.affinity).
  const AFF_CORE={fuel:['energy','Glucose and the other fuels are burned for ATP.'],redox:['energy','The TCA cycle and the electron transport chain turn fuel into ATP.'],
    oxygen:['energy','Hemoglobin delivers the oxygen that burns every fuel.'],lipid:['energy','Fat is the densest stored fuel.'],
    catalyst:['machine','Enzymes are the cell\'s machines.'],tool:['machine','PCR, blots and sequencers are the lab\'s machines.'],
    signal:['message','Signals carry messages between and within cells.'],gene:['message','Genes are the instructions.'],helix:['message','DNA stores the code.'],
    bond:['framework','Covalent and weak bonds hold every structure in its shape.'],
    membrane:['boundary','The lipid bilayer is the cell\'s boundary.'],solvent:['boundary','Water and the hydrophobic effect decide what sits inside and outside a boundary.']};
  function courseOfType(t){if(!t||t==='neutral')return null;t=String(t);const i=t.indexOf(':');return i>0?t.slice(0,i):(TYPES[t]?'CORE':null);}
  function affinityOf(t){if(!t||t==='neutral')return null;if(AFF_CORE[t])return AFF_CORE[t][0];const p=PACK_TYPES[t];return p&&AFFINITIES[p.affinity]?p.affinity:null;}
  function affinityWhy(t){if(AFF_CORE[t])return 'Fictional battle affinity; not a scientific causal rule.';const p=PACK_TYPES[t];return (p&&p.affinityWhy)||'';}
  function crossEffect(atk,def){const a=affinityOf(atk),d=affinityOf(def);if(!a||!d)return {mult:1};const i=WHEEL.indexOf(a),n=WHEEL.length;
    if(WHEEL[(i+1)%n]===d)return {mult:STRONG_X,why:battleRule(typeName(atk),typeName(def),true),cross:true};
    if(WHEEL[(i+n-1)%n]===d)return {mult:WEAK_X,why:battleRule(typeName(atk),typeName(def),false),cross:true};
    return {mult:1,cross:true};}
  // One matchup, attacker type into one defender type.
  function effect(atk,def){if(!atk||!def||atk==='neutral'||def==='neutral')return {mult:1};
    const ca=courseOfType(atk),cd=courseOfType(def);if(ca&&cd&&ca!==cd)return crossEffect(atk,def);return withinEffect(atk,def);}
  // A final-form defender has two types; the multipliers stack, clamped to x0.8 .. x1.25.
  function secondOf(id,stage){const s=byId.get(id);if(s&&s.line.water)return s.line.second||null;if(!s||s.line.rare)return null;const st=stage==null?stageOf(id):+stage;if(st<2)return null;const fin=idOf(s.line.stages[2]);return (s.line.course?PACK_SECOND[fin]:SECOND[fin])||null;}
  // An ascended starter keeps its own types (no second type in this build).
  const ASCEND_SECOND={};
  function typesOf(id,stage,evolved){const t=[typeOf(id)];let t2=secondOf(id,stage);if(!t2&&ASCEND_SECOND[id]&&isAscended(id,evolved))t2=ASCEND_SECOND[id][0];if(t2&&t2!==t[0])t.push(t2);return t;}
  // The universal call. def is a creature id (its types come from B.typesOf, so legendaries and
  // ascended forms count), a type id, or an array of types. Dual types multiply; a strong and a weak
  // reason that cancel (1.2 x 0.85) count as a normal hit. Returns {mult, why:[reasons], reason}.
  const isType=t=>!!(t&&(TYPES[t]||PACK_TYPES[t]));
  function defTypes(def,stage,evolved){if(Array.isArray(def))return def.filter(Boolean);if(isType(def))return [def];return ((B.typesOf||typesOf).call(B,def,stage,evolved))||[];}
  function effectOn(atk,def,stage,evolved){const ts=[...new Set(defTypes(def,stage,evolved))];let mult=1;const why=[];for(const t of ts){const e=effect(atk,t);mult*=e.mult;if(e.why&&!why.includes(e.why))why.push(e.why);}
    mult=Math.round(Math.min(EFF_MAX,Math.max(EFF_MIN,mult))*100)/100;if(mult>.97&&mult<1.03)mult=1;return {mult,why,reason:why.join(' ')};}
  // A battle spec's foe types: declared types first, then a legendary's, then the creature it sends out.
  // Returns [] when the spec names none; exam-quest then reads them from the routes it deals.
  function specTypes(spec){if(!spec||typeof spec!=='object')return [];const ok=t=>t&&t!=='neutral'&&isType(t);
    let ts=Array.isArray(spec.types)?spec.types.filter(ok):ok(spec.type)?[spec.type]:[];
    if(!ts.length&&spec.legend&&root.AtlasLegends&&root.AtlasLegends.list){const L=root.AtlasLegends.list().find(x=>x.course===spec.legend);if(L)ts=(L.types||[]).filter(ok);}
    if(!ts.length&&spec.creature)ts=defTypes(spec.creature,spec.stage==null?0:spec.stage,!!spec.evolved).filter(ok);
    return [...new Set(ts)].slice(0,2);}
  // The line types of a list of sessions (first two distinct), for a sprite boss that fights with them.
  function typesForSessions(ns,course){const out=[];for(const n of ns||[]){const l=lineFor(n,course);if(l&&l.type&&l.type!=='neutral'&&!out.includes(l.type))out.push(l.type);if(out.length>=2)break;}return out;}
  // Every cross-course matchup with its reason, for the universal chart.
  function crossChart(){const strong=[],weak=[];for(let i=0;i<WHEEL.length;i++){const a=WHEEL[i],nx=WHEEL[(i+1)%WHEEL.length],pv=WHEEL[(i+WHEEL.length-1)%WHEEL.length];strong.push([a,nx,battleRule(affinityName(a),affinityName(nx),true)]);weak.push([a,pv,battleRule(affinityName(a),affinityName(pv),false)]);}return {strong,weak};}
  function allTypes(){const out=[];for(const t of Object.keys(TYPES))if(t!=='neutral')out.push(t);for(const t of Object.keys(PACK_TYPES))out.push(t);return out;}
  function secondWhy(id){const s=byId.get(id);if(!s)return '';const fin=idOf(s.line.stages[2]);return (s.line.course?PACK_SECOND_WHY[fin]:SECOND_WHY[fin])||'';}
  // Each DAT starter keeps its own subject's type regardless of pack registration order.
  const STARTER_TARGET={cytrus:{course:'BIO',type:'vital'},atpup:{course:'GCHEM',type:'forge'},twistle:{course:'PAT',type:'sight'}};
  const STARTER_TYPES={};
  function typeOf(id){const s=byId.get(id);return s?s.line.type:(STARTER_TYPES[id]||'neutral');}

  // 3. Stage from mastery (quest stars for that session). Other courses keep their stars
  //    under courses.<COURSE>.dex in the quest store.
  function stars(n,course){try{const q=JSON.parse(localStorage.getItem('ace_dat_realms_mnemon_v1_quest_v1')||'{}');const d=q.courses&&q.courses[course]&&q.courses[course].dex;return (d&&d[n]&&d[n].stars)||0;}catch(e){return 0;}}
  // ONE mapping from session stars to a line's stage: 2 stars middle form, 3 stars final form.
  const starStage=n=>(+n||0)>=3?2:(+n||0)>=2?1:0;
  function stageOf(id){const s=byId.get(id);if(!s||s.line.rare)return 0;return starStage(stars(s.line.session,s.line.course));}
  function formName(id,stage){const s=byId.get(id);if(!s)return null;return s.line.stages[Math.max(0,Math.min(2,stage==null?stageOf(id):stage))];}

  // 4. Seeded pixel sprites.
  function rng(seed){let h=2166136261;for(const c of seed)h=Math.imul(h^c.charCodeAt(0),16777619);return ()=>{h^=h<<13;h^=h>>>17;h^=h<<5;return ((h>>>0)%100000)/100000;};}
  const PAL={fuel:['#f2a65a','#ffd49a','#c0602a'],membrane:['#a99be3','#d8cff7','#6d5fb0'],bond:['#7cc6bf','#c3ebe6','#3f8984'],catalyst:['#e8c25a','#fbe7a6','#a88322'],
    signal:['#ee88a8','#fbd0dd','#b9416a'],oxygen:['#78aee8','#cfe2fa','#3b6fb3'],helix:['#78c48f','#c9ecd2','#3c8656'],gene:['#c89366','#efd4bb','#8a5a34'],redox:['#e0705f','#f7c9c0','#9c3326'],solvent:['#5cc3e0','#c9eef8','#23799a'],lipid:['#d9c35a','#f4e9b0','#8f7a22'],tool:['#8aa0b3','#d3dde6','#4c6275']};
  function shade(hex,f){const n=parseInt(hex.slice(1),16),r=n>>16,g=n>>8&255,b=n&255,m=v=>Math.max(0,Math.min(255,Math.round(v*f)));return '#'+[m(r),m(g),m(b)].map(v=>v.toString(16).padStart(2,'0')).join('');}
  const cache=new Map();
  const PLAN_BY_SESSION={1:'quad',2:'blob',3:'golem',4:'bug',5:'bird',6:'fish',7:'serpent',8:'quad',9:'biped',10:'golem',11:'bug',12:'biped',13:'quad',14:'serpent',15:'bird'};
  const LINE_COLOR={1:'#f2a65a',2:'#a99be3',3:'#7cc6bf',4:'#e8c25a',5:'#ee88a8',6:'#78aee8',7:'#78c48f',8:'#5fb8a8',9:'#c89366',10:'#b7a07a',11:'#d0785c',12:'#9fcf6a',13:'#e57f4a',14:'#eec052',15:'#d99a70'};
  const PLANS={fuel:['quad','biped','quad'],membrane:['blob','bug','blob'],bond:['golem','quad','golem'],catalyst:['bug','quad','bug'],signal:['bird','bug','bird'],oxygen:['fish','fish','fish'],helix:['serpent','serpent','quad'],gene:['biped','blob','biped']};
  function grid(id,stage){
    const key=id+':'+stage;if(cache.has(key))return cache.get(key);
    const sp=byId.get(id),type=sp.line.mechanic||sp.line.type,R=rng(id),N=32,g=Array.from({length:N},()=>Array(N).fill(0));
    const ORDER=['quad','biped','fish','bird','serpent','blob','bug','golem'],main=sp.line.plan||PLAN_BY_SESSION[sp.line.session]||(PLANS[type]||['quad'])[0],plan=sp.line.water?main:sp.line.rare?ORDER[(ORDER.indexOf(main)+3)%ORDER.length]:main;
    const V=rng(id+'shape'),mb=.86+V()*.3,mh=.86+V()*.3;
    const k=[.72,.86,1][stage],s=v=>v*k*mb;
    const put=(x,y,v,force)=>{x=Math.round(x);y=Math.round(y);if(x<0||y<0||x>=N||y>=N)return;if(force||!g[y][x]||v>=g[y][x]||v===1)g[y][x]=v;};
    const ell=(cx,cy,rx,ry,v)=>{for(let y=Math.floor(cy-ry-1);y<=cy+ry+1;y++)for(let x=Math.floor(cx-rx-1);x<=cx+rx+1;x++){const dx=(x-cx)/rx,dy=(y-cy)/ry;if(dx*dx+dy*dy<=1)put(x,y,v,true);}};
    const rect=(x0,y0,w,h,v)=>{for(let y=y0;y<y0+h;y++)for(let x=x0;x<x0+w;x++)put(x,y,v,true);};
    const tri=(ax,ay,bx,by,cx,cy,v)=>{const minx=Math.floor(Math.min(ax,bx,cx)),maxx=Math.ceil(Math.max(ax,bx,cx)),miny=Math.floor(Math.min(ay,by,cy)),maxy=Math.ceil(Math.max(ay,by,cy));const ar=(x1,y1,x2,y2,x3,y3)=>(x1*(y2-y3)+x2*(y3-y1)+x3*(y1-y2));const A=Math.abs(ar(ax,ay,bx,by,cx,cy));for(let y=miny;y<=maxy;y++)for(let x=minx;x<=maxx;x++){const a1=Math.abs(ar(x,y,bx,by,cx,cy)),a2=Math.abs(ar(ax,ay,x,y,cx,cy)),a3=Math.abs(ar(ax,ay,bx,by,x,y));if(a1+a2+a3<=A+.5)put(x,y,v,true);}};
    const eye=(x,y,big)=>{rect(x,y,2,2+(big?1:0),7);put(x+1,y+1,6,true);if(big)put(x+1,y+2,6,true);};
    const cx=16,base=26;
    if(plan==='quad'){const bw=s(9),bh=s(5.5),by=base-s(8);ell(cx+2,by,bw,bh,1);ell(cx+2,by+bh*.45,bw*.7,bh*.45,2);const hx=cx+2-bw-s(1),hy=by-s(4.5);ell(hx,hy,s(4.5),s(4),1);
      for(const lx of [cx+2-bw*.6,cx+2-bw*.1,cx+2+bw*.35,cx+2+bw*.75])rect(Math.round(lx),Math.round(by+bh*.6),2,Math.round(s(4)),3);
      tri(hx-s(2),hy-s(3),hx,hy-s(3.5),hx-s(1),hy-s(6.5)-stage,3);tri(hx+s(1),hy-s(3),hx+s(3),hy-s(2.5),hx+s(2.5),hy-s(6)-stage,3);
      const tx=cx+2+bw;tri(tx-1,by-1,tx+s(4),by-s(5)-stage,tx+1,by+1,type==='fuel'?4:1);if(type==='fuel')put(tx+s(4),by-s(6)-stage,5,true);
      eye(hx-s(3),hy-1,stage>0);put(hx-s(4.5),hy+1.5,3,true);if(stage>=2){tri(cx,by-bh,cx+s(4),by-bh-s(4),cx+s(6),by-bh,4);}}
    if(plan==='biped'){const by=base-s(8),bw=s(6),bh=s(7);ell(cx,by,bw,bh,1);ell(cx,by+s(1.5),bw*.62,bh*.6,2);const hy=by-bh-s(3);ell(cx,hy,s(5.5),s(5),1);
      rect(Math.round(cx-bw*.7),Math.round(by+bh-2),3,Math.round(s(3.5)),3);rect(Math.round(cx+bw*.7-2),Math.round(by+bh-2),3,Math.round(s(3.5)),3);
      ell(cx-bw-s(1),by-s(1),s(1.8),s(3),1);ell(cx+bw+s(1),by-s(1),s(1.8),s(3),1);
      if(type==='gene'){ell(cx-s(3),hy-s(6),s(2.5),s(1.5),4);ell(cx+s(3),hy-s(6),s(2.5),s(1.5),4);put(cx,hy-s(5),3,true);if(stage>=1){ell(cx,hy-s(8),s(2),s(2),5);}}
      else{tri(cx-s(5),hy-s(2),cx-s(2),hy-s(4),cx-s(5),hy-s(8)-stage,3);tri(cx+s(5),hy-s(2),cx+s(2),hy-s(4),cx+s(5),hy-s(8)-stage,3);}
      eye(cx-s(3.5),hy-1,stage>0);eye(cx+s(2),hy-1,stage>0);rect(Math.round(cx-1),Math.round(hy+s(2.5)),2,1,3);if(stage>=2){tri(cx-bw-s(1),by-s(4),cx-bw-s(6),by-s(9),cx-bw,by,4);tri(cx+bw+s(1),by-s(4),cx+bw+s(6),by-s(9),cx+bw,by,4);}}
    if(plan==='fish'){const by=base-s(9),bw=s(11),bh=s(6.5);ell(cx+1,by,bw,bh,1);ell(cx+1,by+bh*.4,bw*.75,bh*.45,2);
      tri(cx+bw-1,by,cx+bw+s(6),by-s(5)-stage,cx+bw+s(6),by+s(5)+stage,4);tri(cx-s(2),by-bh+1,cx+s(4),by-bh-s(4)-stage,cx+s(6),by-bh+1,3);tri(cx-s(1),by+bh-1,cx+s(3),by+bh+s(3),cx+s(5),by+bh-1,3);
      eye(cx-bw+s(3),by-s(2),true);rect(Math.round(cx-bw+1),Math.round(by+s(1.5)),2,1,3);for(let q=0;q<2+stage;q++)put(cx-s(2)+q*s(3),by-s(1),8,true);if(stage>=2){ell(cx+s(3),by-bh-s(5),s(1.5),s(1.5),5);}}
    if(plan==='bird'){const by=base-s(8),bw=s(7),bh=s(6);ell(cx+2,by,bw,bh,1);ell(cx+2,by+s(1.5),bw*.6,bh*.5,2);const hx=cx-s(3),hy=by-bh-s(1);ell(hx,hy,s(4.5),s(4.2),1);
      tri(hx-s(4),hy,hx-s(8),hy+s(1.5),hx-s(4),hy+s(2.5),4);ell(cx+s(3),by-s(1),bw*.7,bh*.55,3);tri(cx+bw,by-s(2),cx+bw+s(6),by-s(5)-stage,cx+bw+s(5),by+s(1),3);
      rect(Math.round(cx),Math.round(by+bh-1),1,Math.round(s(4)),3);rect(Math.round(cx+s(4)),Math.round(by+bh-1),1,Math.round(s(4)),3);
      for(let q=0;q<1+stage;q++)tri(hx-q*s(2),hy-s(3),hx+s(2)-q*s(2),hy-s(3.5),hx+s(1)-q*s(2),hy-s(7),type==='signal'?5:3);eye(hx-s(2.5),hy-s(1),stage>0);}
    if(plan==='serpent'){const segs=7+stage*2;for(let q=segs;q>=0;q--){const t=q/segs,x=cx-s(9)+t*s(20),y=base-s(8)+Math.sin(t*Math.PI*1.6)*s(4);ell(x,y,s(3.2)*(1-t*.35),s(3.2)*(1-t*.35),q%2?1:2);}
      const hx=cx-s(10),hy=base-s(10);ell(hx,hy,s(4.5),s(4),1);eye(hx-s(2),hy-s(1),true);rect(Math.round(hx-s(4)),Math.round(hy+s(1.5)),2,1,3);
      tri(hx,hy-s(3),hx+s(3),hy-s(3),hx+s(2),hy-s(6)-stage,4);if(stage>=1)tri(hx-s(2),hy-s(3),hx,hy-s(3),hx-s(2),hy-s(6),4);}
    if(plan==='blob'){const by=base-s(6),bw=s(9),bh=s(8);ell(cx,by,bw,bh,1);rect(Math.round(cx-bw),Math.round(by),Math.round(bw*2),Math.round(s(3)),1);ell(cx,by+s(2),bw*.6,bh*.35,2);
      for(let q=0;q<3;q++)ell(cx-bw*.6+q*bw*.6,by+s(3.5),s(1.4),s(1.6),1);eye(cx-s(4),by-s(3),true);eye(cx+s(2),by-s(3),true);rect(Math.round(cx-1),Math.round(by+s(0.5)),3,1,3);
      if(type==='membrane'){ell(cx-bw-s(2),by-s(4),s(2),s(2),5);ell(cx+bw+s(2),by-s(6),s(1.5),s(1.5),5);if(stage>=1){ell(cx,by-bh-s(2),s(3),s(1.5),4);}}
      if(stage>=2){tri(cx-bw,by-s(2),cx-bw-s(6),by-s(9),cx-bw+s(2),by-s(6),5);tri(cx+bw,by-s(2),cx+bw+s(6),by-s(9),cx+bw-s(2),by-s(6),5);}}
    if(plan==='bug'){const by=base-s(8);ell(cx+s(6),by,s(5.5),s(4.5),1);ell(cx,by,s(3.5),s(3.5),2);const hx=cx-s(6),hy=by-s(1);ell(hx,hy,s(4.2),s(4),1);
      for(let q=0;q<3;q++){const lx=cx-s(3)+q*s(4);tri(lx,by+s(2),lx-s(1),by+s(7),lx+1,by+s(7),3);}
      tri(hx-s(1),hy-s(3),hx-s(4),hy-s(9)-stage,hx-s(2),hy-s(3),3);tri(hx+s(1),hy-s(3),hx+s(2),hy-s(9)-stage,hx+s(2.5),hy-s(3),3);put(hx-s(4),hy-s(9)-stage,5,true);
      if(type==='catalyst'){tri(hx-s(4),hy+s(1),hx-s(9),hy-s(1),hx-s(8),hy+s(3),4);}if(stage>=1)ell(cx+s(5),by-s(5),s(5),s(2.5),5);if(stage>=2)ell(cx+s(8),by-s(6),s(4),s(2.2),5);eye(hx-s(2.5),hy-s(1),true);}
    if(plan==='golem'){const by=base-s(8),bw=s(7),bh=s(7);rect(Math.round(cx-bw),Math.round(by-bh),Math.round(bw*2),Math.round(bh*2),1);rect(Math.round(cx-bw*.5),Math.round(by-bh*.2),Math.round(bw),Math.round(bh*.9),2);
      const hy=by-bh-s(3.5);rect(Math.round(cx-s(4.5)),Math.round(hy-s(3)),Math.round(s(9)),Math.round(s(6)),1);rect(Math.round(cx-bw-s(3)),Math.round(by-bh+1),Math.round(s(3)),Math.round(s(8)),3);rect(Math.round(cx+bw),Math.round(by-bh+1),Math.round(s(3)),Math.round(s(8)),3);
      rect(Math.round(cx-bw+1),Math.round(by+bh),3,Math.round(s(3)),3);rect(Math.round(cx+bw-4),Math.round(by+bh),3,Math.round(s(3)),3);
      for(let q=0;q<2+stage;q++){const x=cx-s(4)+q*s(9)/(1+stage);tri(x,hy-s(3),x+s(1.5),hy-s(8)-stage,x+s(3),hy-s(3),4);}eye(cx-s(3),hy-s(1),false);eye(cx+s(1.5),hy-s(1),false);}
    // spots
    const spots=1+Math.floor(R()*3)+stage;for(let q=0;q<spots;q++){const x=Math.floor(8+R()*16),y=Math.floor(12+R()*12);if(g[y]&&g[y][x]===1)g[y][x]=8;}
    cache.set(key,{g,N});return {g,N};
  }
  function drawLine(ctx,id,x,y,scale,stage){
    const sp=byId.get(id),type=sp.line.type,p=PAL[type]||(sp.line.course&&sp.line.color?[sp.line.color,shade(sp.line.color,1.4),shade(sp.line.color,.62)]:PAL.bond),rare=sp.line.rare&&!sp.line.water,hue=rng(id+'hue')();
    const lc=sp.line.color||LINE_COLOR[sp.line.session]||p[0];const main=rare?shade(lc,.72):lc;
    const col={1:main,2:rare?'#fff4d6':shade(lc,1.35),3:shade(lc,stage>=2?.5:.58),4:rare?'#f3d27a':shade(p[0],1.3),5:rare?'#ffffff':p[1],6:'#1d3437',7:'#ffffff',8:shade(main,.8)};
    const {g,N}=grid(id,stage);
    ctx.save();ctx.translate(Math.round(x),Math.round(y));ctx.scale(scale,scale);ctx.imageSmoothingEnabled=false;
    ctx.fillStyle='#24484b22';ctx.fillRect(-10,11,20,2);
    const ox=-N/2,oy=-N/2-2;
    for(let j=0;j<N;j++)for(let i=0;i<N;i++){if(!g[j][i])continue;for(const [a,b] of [[1,0],[-1,0],[0,1],[0,-1]]){const v=g[j+b]&&g[j+b][i+a];if(!v){ctx.fillStyle='#24484b';ctx.fillRect(i+a+ox,j+b+oy,1,1);}}}
    for(let j=0;j<N;j++)for(let i=0;i<N;i++){const v=g[j][i];if(!v)continue;ctx.fillStyle=col[v];ctx.fillRect(i+ox,j+oy,1,1);}
    ctx.restore();
  }
  // 5. Course packs: another course's lines register the same way, namespaced by course so
  //    the core tables above stay exactly as they are. Type ids become "<COURSE>:<typeId>";
  //    the line's style mechanic (a core style family) picks its trait and sprite accents.
  const PACK_LEGEND={},PACK_TYPES={},PACK_STRONG=[],PACK_WEAK=[],PACK_SECOND={},PACK_SECOND_WHY={},PACK_LINES={},PACK_TYPESETS={},PACK_CHARTS={},PACK_SPECIALS={};
  const PLAN_ORDER=['quad','biped','fish','bird','serpent','blob','bug','golem'];
  function registerCoursePack(pack){
    if(!pack||!pack.course||pack.course==='CORE'||PACK_LINES[pack.course])return false;
    const C=pack.course,ns=id=>C+':'+id,tset={};
    for(const [id,t] of Object.entries(pack.types||{})){PACK_TYPES[ns(id)]={name:t.name,color:t.color,course:C,base:id,affinity:AFFINITIES[t.affinity]?t.affinity:null,affinityWhy:t.affinityWhy||''};tset[ns(id)]=PACK_TYPES[ns(id)];}
    PACK_TYPESETS[C]=tset;
    for(const [id,target] of Object.entries(STARTER_TARGET))if(target.course===C&&pack.types?.[target.type])STARTER_TYPES[id]=ns(target.type);
    const strong=((pack.chart||{}).strong||[]).map(([a,d,w])=>[ns(a),ns(d),w]),weak=((pack.chart||{}).weak||[]).map(([a,d,w])=>[ns(a),ns(d),w]);
    PACK_STRONG.push(...strong);PACK_WEAK.push(...weak);PACK_CHARTS[C]={strong,weak};
    let h=0;for(const ch of C)h=(h*31+ch.charCodeAt(0))>>>0;
    const lines=[];
    for(const [n,type,names,rare,blurb,second,why] of (pack.lines||[])){
      const t=type?ns(type):'neutral',mech=(type&&pack.styles&&pack.styles[type]&&pack.styles[type].mechanic)||'bond',color=(type&&pack.types[type]&&pack.types[type].color)||'#8a948c';
      const ids=names.map(idOf),rid=idOf(rare);
      // Creature ids must not collide with any existing species; a colliding line is skipped whole.
      if(ids[0]===rid||B.species.some(s=>s.id===ids[0]))continue;
      const plan=PLAN_ORDER[(n+h)%PLAN_ORDER.length],trait=B.traits[TRAIT_BY_TYPE[mech]]||B.traits.spark;
      const base={id:ids[0],name:names[0],courseId:C,base:null,color:null,description:blurb,evolution:names[2],trait,line:{course:C,session:n,type:t,mechanic:mech,stages:names.slice(),rare:false,plan,color}};
      B.species.push(base);byId.set(base.id,base);
      const rareOk=!B.species.some(s=>s.id===rid);
      if(rareOk){const rv={id:rid,name:rare,courseId:C,base:null,color:null,description:'A rare variant seen around Route '+n+'. '+blurb,evolution:rare,trait,line:{course:C,session:n,type:t,mechanic:mech,stages:[rare,rare,rare],rare:true,plan,color}};B.species.push(rv);byId.set(rid,rv);}
      if(second){PACK_SECOND[ids[2]]=ns(second);PACK_SECOND_WHY[ids[2]]=why||'';}
      lines.push([n,t,names.slice(),rareOk?rare:null,blurb]);
    }
    PACK_LINES[C]=lines;
    // Pack specials: bridge creatures that tie two routes together. First type is session A's line
    // type, second type is the one the pack names; they never evolve and keep one name.
    const specials=[];
    for(const [id,name,sessions,second,plan,color,habitats,blurb] of (pack.specials||[])){
      if(B.species.some(s=>s.id===id))continue;
      const la=(pack.lines||[]).find(l=>l[0]===sessions[0]),t1=la&&la[1]?la[1]:null,t=t1?ns(t1):'neutral',sec=second?ns(second):null;
      const mech=(t1&&pack.styles&&pack.styles[t1]&&pack.styles[t1].mechanic)||'bond';
      const sp={id,name,courseId:C,base:null,color:null,description:'A bridge creature of Routes '+sessions.join(' and ')+'. '+blurb,evolution:name,trait:B.traits[TRAIT_BY_TYPE[mech]]||B.traits.shelter,
        line:{course:C,session:sessions[0],sessions:sessions.slice(),type:t,second:sec&&sec!==t?sec:null,mechanic:mech,plan:plan||PLAN_ORDER[(sessions[0]+sessions[1]+h)%PLAN_ORDER.length],color:color||(t1&&pack.types[t1]&&pack.types[t1].color)||'#5cc3e0',habitats:(habitats||[]).slice(),stages:[name,name,name],rare:true,water:true,special:true}};
      B.species.push(sp);byId.set(id,sp);specials.push({id,name,sessions:sessions.slice(),second:sp.line.second,habitats:sp.line.habitats,blurb});
    }
    PACK_SPECIALS[C]=specials;
    // The region legendary (pack.legendary {id, name, type, blurb, color, plan}): one form, never evolves, a seeded sprite.
    const LG=pack.legendary;
    if(LG&&typeof LG==='object'&&LG.name){const lid=String(LG.id||LG.name).toLowerCase().replace(/[^a-z0-9]/g,'');
      if(lid&&!B.species.some(s=>s.id===lid)){const tids=Object.keys(pack.types||{}),t1=LG.type&&pack.types&&pack.types[LG.type]?LG.type:tids[0],mech=(t1&&pack.styles&&pack.styles[t1]&&pack.styles[t1].mechanic)||'helix';
        const nm=String(LG.name),sp={id:lid,name:nm,courseId:C,base:null,color:null,description:String(LG.blurb||'The keeper of every route.'),evolution:nm,legendary:true,trait:B.traits.insight,
          line:{course:C,session:0,type:t1?ns(t1):'neutral',mechanic:mech,plan:PLAN_ORDER.includes(LG.plan)?LG.plan:'serpent',color:/^#[0-9a-f]{3,8}$/i.test(String(LG.color||''))?LG.color:'#c9a84c',stages:[nm,nm,nm],rare:true,legendary:true}};
        B.species.push(sp);byId.set(lid,sp);PACK_LEGEND[C]=lid;}}
    return true;
  }
  const isCore=c=>!c||c==='CORE';
  function lineFor(n,course){const l=(isCore(course)?LINES:(PACK_LINES[course]||[])).find(x=>x[0]===+n);
    return l?{id:idOf(l[2][0]),rare:l.length>5?l[5]:(l[3]?idOf(l[3]):null),type:l[1],names:l[2],rareName:l[3]}:null;}

  // 6. Wrap the bestiary so everything that draws or names a creature understands lines.
  // Ascension: the ONE source for it (battles, the team panel, the follower and the field guide all ask here).
  // An evolved starter ascends once the trainer holds 4 chapter badges in a world (courses.<C>.region.badges).
  const ASCEND={cytrus:'Cytadel',atpup:'Protonarch',twistle:'Genosage'};
  let ascAt=0,ascN=0;
  function townBadges(){const t=Date.now();if(t-ascAt<1000)return ascN;ascAt=t;try{const q=JSON.parse(root.localStorage.getItem('ace_dat_realms_mnemon_v1_quest_v1')||'{}'),cs=q&&q.courses;let best=0;
      for(const c of Object.values(cs&&typeof cs==='object'?cs:{})){const b=c&&c.region&&c.region.badges;if(b&&typeof b==='object')best=Math.max(best,Object.keys(b).filter(k=>!/At$/.test(k)&&b[k]).length);}ascN=best;}catch(e){ascN=0;}return ascN;}
  const isAscended=(id,evolved)=>!!(evolved&&ASCEND[id]&&townBadges()>=4);
  const ascendedName=id=>ASCEND[id]||null;
  const origDraw=B.draw,origName=B.name;
  // The ascended form keeps the evolved sprite and gains a sunlit aura (the same art exam-quest used).
  function aura(ctx,x,y,scale){try{const r=15*scale,g=ctx.createRadialGradient(x,y+2*scale,scale,x,y+2*scale,r);g.addColorStop(0,'rgba(255,221,120,.8)');g.addColorStop(1,'rgba(255,221,120,0)');ctx.save();ctx.fillStyle=g;ctx.fillRect(x-r,y+2*scale-r,r*2,r*2);ctx.restore();}catch(e){}}
  B.draw=function(ctx,id,x,y,scale=3,evolved=false,stage){if(byId.has(id)){const st=stage==null||stage===''?stageOf(id):+stage;return drawLine(ctx,id,x,y,scale*.78,st);}if(isAscended(id,evolved))aura(ctx,x,y,scale);return origDraw.call(B,ctx,id,x,y,scale,evolved);};
  B.name=function(member){if(member&&byId.has(member.id))return formName(member.id);if(member&&isAscended(member.id,B.level(member.xp)>=6))return ASCEND[member.id];return origName.call(B,member);};
  // A display name for any form: evolved true for the evolved form; ascension applies on its own.
  B.displayName=function(id,evolved){if(byId.has(id))return formName(id);if(isAscended(id,evolved))return ASCEND[id];const f=B.find(id);return f?(evolved?f.evolution:f.name):id;};
  // A level-up evolution (Lv. 6) for one creature: {from, to} display names, or null when nothing
  // visibly changes. Line creatures (lessons, rares, water and pack specials) change form by stars,
  // never by level, and legendaries never evolve, so they always return null; any creature whose two
  // names come out equal returns null too. Callers play the cutscene and banner only on a non-null.
  function levelEvolution(id,lvBefore,lvAfter){if(!id||!(+lvBefore<6&&+lvAfter>=6))return null;if(byId.has(id))return null;if(B.neverEvolves&&B.neverEvolves(id))return null;
    const from=B.displayName(id,false),to=B.displayName(id,true);return from&&to&&from!==to?{from,to}:null;}
  // A star evolution of a session's line: {from, to} form names between two star counts, or null.
  function starEvolution(id,starsBefore,starsAfter){if(!byId.has(id))return null;const a=starStage(starsBefore),b=starStage(starsAfter);if(b<=a)return null;
    const from=B.formName(id,a),to=B.formName(id,b);return from&&to&&from!==to?{from,to,fromStage:a,toStage:b}:null;}
  Object.assign(B,{starStage,levelEvolution,starEvolution});
  Object.assign(B,{ASCEND,isAscended,ascendedName,townBadgeCount:townBadges,ASCEND_SECOND,AFFINITIES,WHEEL,affinityOf,affinityWhy,courseOfType,crossEffect,crossChart,specTypes,typesForSessions,allTypes});
  Object.assign(B,{lines:LINES,types:TYPES,typeOf,effect,stageOf,formName,isLine:id=>byId.has(id),
    lineFor,
    chart:{strong:STRONG,weak:WEAK},water:[],typesOf,effectOn,secondOf,secondWhy,SECOND,
    // Course-pack views. With no course each returns the core table above.
    registerCoursePack,typeInfo:t=>TYPES[t]||PACK_TYPES[t]||null,typesFor:c=>isCore(c)?TYPES:(PACK_TYPESETS[c]||{}),chartFor:c=>isCore(c)?{strong:STRONG,weak:WEAK}:(PACK_CHARTS[c]||{strong:[],weak:[]}),
    linesFor:c=>isCore(c)?LINES:(PACK_LINES[c]||[]),legendFor:c=>PACK_LEGEND[c]||null,neverEvolves:id=>!!(byId.get(id)&&byId.get(id).legendary),specialsFor:c=>isCore(c)?[]:(PACK_SPECIALS[c]||[]),secondFor:c=>isCore(c)?SECOND:PACK_SECOND,courseOf:id=>byId.get(id)?.line.course||(byId.has(id)?'CORE':null)});
})(typeof window!=='undefined'?window:globalThis);
