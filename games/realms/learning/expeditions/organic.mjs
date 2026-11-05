import {esc, button, group, svg} from './shared.mjs';

// Original, bounded instructional drawings and cases. No assessment-bank import.
const U={sn2:'https://openstax.org/books/organic-chemistry/pages/11-2-the-sn2-reaction',conditions:'https://openstax.org/books/organic-chemistry/pages/11-3-characteristics-of-the-sn2-reaction',acid:'https://openstax.org/books/organic-chemistry/pages/2-10-organic-acids-and-organic-bases',resonance:'https://openstax.org/books/organic-chemistry/pages/2-5-rules-for-resonance-forms'};
const freeze=x=>{Object.values(x).forEach(v=>{if(v&&typeof v==='object')freeze(v);});return Object.freeze(x);};
export const ORGANIC_REACTION_CASES=freeze([
  {id:'methyl-bridge',name:'Bromomethane',branch:'H',product:'Dimethyl sulfide',substrate:{C:1,H:3,Br:1},thioether:{C:2,H:6,S:1}},
  {id:'ethyl-bridge',name:'Bromoethane',branch:'CH₃',product:'Ethyl methyl sulfide',substrate:{C:2,H:5,Br:1},thioether:{C:3,H:8,S:1}}
]);
export const ORGANIC_ACID_CASES=freeze([
  {id:'three-carbon-court',tail:'CH₃CH₂',acid:'Propanoic acid',baseName:'Propanoate',alcohol:'1-Propanol',acidFormula:{C:3,H:6,O:2},alcoholFormula:{C:3,H:8,O:1}},
  {id:'four-carbon-court',tail:'CH₃CH₂CH₂',acid:'Butanoic acid',baseName:'Butanoate',alcohol:'1-Butanol',acidFormula:{C:4,H:8,O:2},alcoholFormula:{C:4,H:10,O:1}}
]);
const reactionStages=[
  {keys:{reagent:['thiolate','thiol','water']},correct:{reagent:'thiolate'}},
  {keys:{substrate:['open','crowded','alcohol']},correct:{substrate:'open'}},
  {keys:{source:['sulfur','carbon','bromine'],target:['sulfur','carbon','bromine']},correct:{source:'sulfur',target:'carbon'}},
  {keys:{bond:['cbr','ch','sc'],destination:['bromine','carbon','sulfur']},correct:{bond:'cbr',destination:'bromine'}},
  {keys:{approach:['back','front']},correct:{approach:'back'}},
  {keys:{product:['neutral-halide','positive-halide','neutral-neutral']},correct:{product:'neutral-halide'}}
];
const acidStages=[
  {keys:{removed:['proton','atom','hydroxyl']},correct:{removed:'proton'}},
  {keys:{pair:['oxygen','hydrogen']},correct:{pair:'oxygen'}},
  {keys:{shift:['electrons','hydrogen','carbon']},correct:{shift:'electrons'}},
  {keys:{stronger:['carboxyl','alcohol','same']},correct:{stronger:'carboxyl'}}
];
const plain=x=>x&&typeof x==='object'&&!Array.isArray(x);
function picksFor(raw,stage){const out={};for(const [k,allowed] of Object.entries(stage.keys))if(plain(raw)&&allowed.includes(raw[k]))out[k]=raw[k];return out;}
const filled=(p,stage)=>Object.keys(stage.keys).every(k=>stage.keys[k].includes(p[k]));
const correct=(p,stage)=>Object.entries(stage.correct).every(([k,v])=>p[k]===v);
function empty(){return {version:1,cursor:0,commits:[],draft:{},help:false,form:0};}
function normalize(raw,stages){
  if(!plain(raw)||raw.version!==1)return empty();
  const max=stages.length*2,commits=[];
  for(const candidate of (Array.isArray(raw.commits)?raw.commits:[]).slice(0,max)){
    const stage=stages[commits.length%stages.length],p=picksFor(candidate?.picks,stage);
    if(!plain(candidate)||candidate.index!==commits.length||!filled(p,stage))break;
    commits.push({index:commits.length,picks:p,help:candidate.help===true});
  }
  const cursor=Number.isInteger(raw.cursor)&&[commits.length,Math.max(0,commits.length-1)].includes(raw.cursor)?raw.cursor:commits.length;
  return {version:1,cursor,commits,draft:cursor<commits.length?{...commits[cursor].picks}:cursor<max?picksFor(raw.draft,stages[cursor%stages.length]):{},help:raw.help===true,form:raw.form===1?1:0};
}
function reduce(raw,action,value,stages){
  const s=normalize(raw,stages),max=stages.length*2,revealed=s.cursor<s.commits.length;
  if(action==='reset')return empty();
  if(action==='undo'){
    if(revealed){s.commits.pop();s.help=false;s.form=0;return s;}
    const keys=Object.keys(s.draft);if(keys.length){delete s.draft[keys.at(-1)];return s;}
    if(s.cursor>0){const last=s.commits.pop();s.cursor--;s.draft={...last.picks};s.help=false;s.form=0;}return s;
  }
  if(s.cursor>=max)return s;
  const stage=stages[s.cursor%stages.length];
  if(action==='help'){s.help=true;return s;}
  if(action==='form'&&revealed&&stages===acidStages&&s.cursor%stages.length>=2){s.form=1-s.form;return s;}
  if(action==='next'&&revealed){s.cursor++;s.draft={};s.help=false;s.form=0;return s;}
  if(action==='commit'&&!revealed&&filled(s.draft,stage)){s.commits.push({index:s.cursor,picks:{...s.draft},help:s.help});return s;}
  if(!revealed&&Object.hasOwn(stage.keys,action)&&stage.keys[action].includes(value)){s.draft={...s.draft,[action]:value};s.form=0;}return s;
}
function context(raw,stages){const s=normalize(raw,stages);return {s,done:s.cursor===stages.length*2,caseIndex:Math.min(1,Math.floor(s.cursor/stages.length)),step:s.cursor%stages.length,revealed:s.cursor<s.commits.length};}
const text=(x,y,value,size=20,color='#233b36')=>`<text x="${x}" y="${y}" fill="${color}" font-size="${size}" font-family="system-ui,sans-serif" text-anchor="middle">${esc(value)}</text>`;
const line=(x1,y1,x2,y2,color='#3c6557',extra='')=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="3" ${extra}/>`;
const lp=(x,y)=>`<circle cx="${x-4}" cy="${y}" r="2.5" fill="#9e5817"/><circle cx="${x+4}" cy="${y}" r="2.5" fill="#9e5817"/>`;
const arrow=(d,id,color='#087b82')=>`<path d="${d}" fill="none" stroke="${color}" stroke-width="3" marker-end="url(#${id})"/>`;
const marker=id=>`<defs><marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill="#087b82"/></marker></defs>`;
function thio(x,y,{neutral=false,water=false}={}){
  if(water)return line(x-30,y-4,x-12,y-4)+line(x+12,y-4,x+30,y-4)+text(x-42,y+3,'H')+text(x,y+3,'O')+text(x+42,y+3,'H')+lp(x,y-24)+lp(x,y+20);
  return text(x-52,y+3,'CH₃')+line(x-28,y-4,x-12,y-4)+text(x,y+3,neutral?'S':'S⁻')+lp(x,y-25)+lp(x,y+20)+(neutral?line(x+14,y-4,x+34,y-4)+text(x+46,y+3,'H'):lp(x+27,y-4));
}
function substrate(x,y,c,kind='open'){
  const crowded=kind==='crowded',alcohol=kind==='alcohol',r=crowded?'CH₃':c.branch;
  return text(x,y+5,'C')+line(x+14,y,x+80,y)+text(x+102,y+5,alcohol?'O–H':'Br')+line(x-10,y-11,x-42,y-52)+text(x-53,y-63,r,18)+line(x-10,y+11,x-42,y+52)+text(x-53,y+75,crowded?'CH₃':'H',18)+line(x,y-16,x,y-66)+text(x,y-78,crowded?'CH₃':'H',18)+(alcohol?'':lp(x+103,y-24)+lp(x+103,y+24)+lp(x+128,y));
}
function card(label,action,value,picture,selected){return `<button type="button" class="exp-tool exp-molecule-card${selected?' is-selected':''}" data-exp-action="${esc(action)}" data-value="${esc(value)}" aria-pressed="${selected?'true':'false'}">${picture}<span>${esc(label)}</span></button>`;}
function choices(label,key,options,s){return group(label,options.map(([value,label])=>button(label,key,value,{selected:s.draft[key]===value,disabled:s.cursor<s.commits.length})).join(''));}
const standard=(s,revealed)=>group('Experiment controls',button('Show me a clue','help','',{disabled:s.help})+button(revealed?'Try this step again':'Undo a choice','undo')+button('Reset experiment','reset'));
const instructionNote='<p class="exp-note">Drawing key: a line is a bond (two shared electrons); paired dots are a lone pair. The substrate is the molecule being changed; the reagent supplies the attacking group. This teaching experiment awards no score or mastery credit.</p>';
function resultScene(c,index){const id=`oc-result-${index}`;return svg(`${c.product} and bromide ion. Sulfur has two bonds and two lone pairs; bromide has four lone pairs. Total charge remains minus one.`,marker(id)+text(320,34,'One substitution step: both bond changes occur together',17)+text(122,148,'CH₃')+line(148,142,184,142)+text(200,148,'S')+lp(200,118)+lp(200,168)+line(216,142,250,142)+text(283,148,index===0?'CH₃':'CH₂CH₃')+text(365,148,'+')+text(455,148,'Br⁻')+lp(455,118)+lp(455,174)+lp(428,142)+lp(482,142)+text(220,215,c.product,19)+text(455,215,'Bromide ion',18)+text(320,265,'Reactants −1 → products −1 · carbon keeps four bonds',17), '0 0 640 290');}
function reactionScene(c,ctx){
  const {s,step,revealed,caseIndex}=ctx,id=`oc-pair-${caseIndex}`;
  if(step===5&&revealed)return resultScene(c,caseIndex);
  const reagentKnown=step>0||revealed;
  const reagentDock=reagentKnown?thio(132,151)+text(132,205,'[S] sulfur',17):`<rect x="70" y="104" width="126" height="89" rx="12" fill="none" stroke="#3c6557" stroke-width="2" stroke-dasharray="6 5"/>`+text(132,159,'?',32)+text(132,219,'Reagent dock',17);
  let drawing=marker(id)+text(320,30,reagentKnown?`${c.name} + methanethiolate`:`${c.name} · choose a sulfur reagent`,20)+reagentDock+text(230,155,'+')+substrate(360,151,c)+text(360,257,'[C] carbon bonded to Br',17)+text(485,205,'[Br] bromine',17);
  const firstShown=step>2||(step===2&&revealed),secondShown=step>3||(step===3&&revealed);
  if(firstShown)drawing+=arrow('M 132 126 C 210 65, 305 80, 348 139',id)+text(245,66,'one electron pair',15);
  else if(step===2&&s.draft.source&&s.draft.target){const point={sulfur:[132,151],carbon:[360,151],bromine:[462,151]},a=point[s.draft.source],b=point[s.draft.target];drawing+=arrow(`M ${a[0]} ${a[1]-30} Q ${(a[0]+b[0])/2} 45 ${b[0]} ${b[1]-20}`,id)+text(320,61,'Your proposed first arrow',15);}
  if(secondShown)drawing+=arrow('M 410 151 Q 433 100 458 133',id);
  else if(step===3&&s.draft.bond&&s.draft.destination){const start={cbr:[410,151],ch:[360,110],sc:[98,147]}[s.draft.bond],end={bromine:[462,151],carbon:[360,151],sulfur:[132,151]}[s.draft.destination];drawing+=arrow(`M ${start[0]} ${start[1]} Q ${(start[0]+end[0])/2} 60 ${end[0]} ${end[1]-18}`,id)+text(320,61,'Your proposed second arrow',15);}
  if(step===4){drawing+=text(275,301,'Back side: opposite Br',16)+text(494,301,'Front side: Br side',16);if(revealed)drawing+=line(285,279,445,279,'#087b82')+text(365,276,'180° attack axis',15);}
  return svg(`${c.name} connectivity: reacting carbon bonds to bromine, ${caseIndex?'a methyl group and two hydrogens':'three hydrogens'}. ${reagentKnown?'Separate methanethiolate has a negatively charged sulfur with three lone pairs.':'The reagent dock is empty; choose a reagent below.'} ${firstShown?'First arrow: sulfur pair to carbon.':''} ${secondShown?'Second arrow: carbon–bromine pair to bromine.':''}`,drawing+text(320,335,'Connectivity sketch, not a 3D conformation; counterion omitted.',14),'0 0 640 360');
}
function reactionFeedback(step,p,c){
  if(step===0)return p.reagent==='thiolate'?'CH₃S⁻ already has the sulfur electron pair and charge needed here. One new C–S bond gives neutral sulfur.':p.reagent==='thiol'?'CH₃SH has a sulfur lone pair, but adding another bond first gives positively charged sulfur. A later proton-transfer step would be needed; this bench asks for the one-step anionic donor.':'Water would install oxygen, not the requested –SCH₃ group. Match the new bond to the reagent atom.';
  if(step===1)return p.substrate==='open'?`${c.name} supplies an accessible saturated carbon and a bromide leaving group. We now build that SN2 step.`:p.substrate==='crowded'?'The three carbon groups around this reacting carbon obstruct the SN2 approach. That rules out this SN2 route, not all possible reactions. Continue with the uncrowded bromide.':'Unactivated –OH is a poor leaving group here. This bench supplies no acid or activating reagent. Continue with the bromide; changing solvent alone would not turn –OH into Br.';
  if(step===2){if(p.source!=='sulfur')return p.source==='carbon'?'The carbon is the electron-pair acceptor in this substitution. Start the incoming arrow at a sulfur lone pair, then end it at the carbon bonded to Br.':'Bromine has lone pairs, but it is not the incoming reagent installing –SCH₃. The incoming pair starts on sulfur and ends on the carbon bonded to Br.';if(p.target!=='carbon')return p.target==='sulfur'?'Returning the pair to sulfur makes no new C–S bond. The receiving atom is the saturated carbon bonded to Br.':'Pointing at Br does not build the requested C–S bond. Sulfur donates to the carbon bearing Br.';return 'The sulfur lone pair becomes the new C–S bond. An arrow follows an electron pair, not the motion of an atom.';}
  if(step===3)return correct(p,reactionStages[3])?'The C–Br bond pair ends on Br, producing Br⁻. This bond breaks as the C–S bond forms; there is no five-bonded carbon intermediate.':`${p.bond!=='cbr'?'The bond being replaced is C–Br, not a C–H bond or the existing CH₃–S bond. ':''}${p.destination!=='bromine'?'Its pair must travel with the departing Br atom. ':''}Both arrows belong to the same concerted step; carbon keeps an octet.`;
  if(step===4)return p.approach==='back'?'The incoming donor approaches opposite the C–Br bond. SN2 inverts geometry at the reacting carbon, but neither of these cases is a stereocenter; no R/S assignment is made.':'The Br-side approach does not give the required backside SN2 path. Approach opposite the leaving group. These simple cases show direction, not an R/S-label exercise.';
  return p.product==='neutral-halide'?`${c.product} is neutral: sulfur now has two bonds and two lone pairs. Br leaves as Br⁻. Total charge stays −1.`:p.product==='positive-halide'?'Starting sulfur was −1, so forming its second bond makes it neutral, not +1. The C–Br pair leaves with Br⁻; the total charge remains −1.':'Neutral bromine would require losing an electron that this two-electron mechanism does not remove. Br takes the bond pair and becomes Br⁻; the thioether is neutral.';
}
const reactionHints=['Find the reagent that already bears −1 on sulfur. We want to attach its –SCH₃ group.','Compare access to the carbon bearing the leaving group; inspect Br versus unactivated O–H.','Trace one of sulfur’s visible electron pairs toward the atom that needs the new bond.','A departing halogen takes the electron pair from its bond to carbon.','Use the C–Br bond as an axis. Which side is opposite Br?','Count sulfur’s bonds and lone pairs before and after. Keep the total charge unchanged.'];
const reactionPrompts=['Choose the reagent that installs –SCH₃ in this single step, with no later deprotonation.','Choose a substrate for the shown SN2 route. Keep methanethiolate and suitable polar aprotic conditions fixed.','Build the incoming arrow: choose its electron source, then its destination.','Build the departing arrow: choose the bond pair, then where that pair ends.','Choose the side from which sulfur approaches the reacting carbon.','Predict the product charges before opening the reaction chamber.'];
function reactionView(raw){
  const ctx=context(raw,reactionStages),{s,done,caseIndex,step,revealed}=ctx,c=ORGANIC_REACTION_CASES[caseIndex];
  if(done)return {activeObjectiveIds:['oc-electrons','oc-sn2-conditions','oc-sn2-path'],scene:resultScene(c,1),prompt:'Two molecular cases explored. A separate fresh question can check what transfers.',coach:'Changing methyl to an unhindered primary substrate preserved the arrow rules. Crowding and leaving-group ability still constrain the route.',controls:group('Experiment controls',button('Revisit the last prediction','undo')+button('Restart builder','reset'))+instructionNote,primary:{action:'done',label:'Finish experiment'},progress:{current:12,total:12,label:'Two teaching cases explored'},complete:true};
  let controls='';
  if(!revealed&&step===0)controls=group('Reagent molecules',[
    ['thiolate','Methanethiolate · CH₃S⁻',thio(125,65)],['thiol','Methanethiol · CH₃SH',thio(125,65,{neutral:true})],['water','Water · H₂O',thio(125,65,{water:true})]
  ].map(([v,label,d])=>card(label,'reagent',v,svg(label,d,'0 0 250 115'),s.draft.reagent===v)).join(''));
  if(!revealed&&step===1)controls=group('Substrate molecules',[
    ['open',c.name],['crowded','2-Bromo-2-methylpropane'],['alcohol',caseIndex?'Ethanol':'Methanol']
  ].map(([v,label])=>card(label,'substrate',v,svg(label,substrate(120,105,c,v),'0 0 260 200'),s.draft.substrate===v)).join(''));
  if(step===2)controls=choices('First arrow tail','source',[['sulfur','Start at [S] lone pair'],['carbon','Start at [C]'],['bromine','Start at [Br] lone pair']],s)+choices('First arrow head','target',[['carbon','End at [C]'],['sulfur','End at [S]'],['bromine','End at [Br]']],s);
  if(step===3)controls=choices('Second arrow tail','bond',[['cbr','C–Br bond pair'],['ch','C–H bond pair'],['sc','CH₃–S bond pair']],s)+choices('Second arrow head','destination',[['bromine','Pair ends on [Br]'],['carbon','Pair ends on [C]'],['sulfur','Pair ends on [S]']],s);
  if(step===4)controls=choices('Approach direction','approach',[['back','Approach opposite Br'],['front','Approach from Br side']],s);
  if(step===5)controls=choices('Predicted product charges','product',[['neutral-halide','Neutral thioether + Br⁻'],['positive-halide','Positive thioether + Br⁻'],['neutral-neutral','Neutral thioether + neutral Br']],s);
  const feedback=revealed?reactionFeedback(step,s.draft,c):s.help?reactionHints[step]:'';
  const activeObjectiveIds=[['oc-electrons','oc-sn2-conditions'],['oc-sn2-conditions'],['oc-electrons'],['oc-electrons','oc-sn2-path'],['oc-sn2-path'],['oc-electrons','oc-sn2-path']][step];
  return {activeObjectiveIds,scene:reactionScene(c,ctx),prompt:reactionPrompts[step],coach:feedback,controls:`<p class="exp-note">Case ${caseIndex+1}/2 · ${caseIndex?'Only the substrate changes: one H becomes CH₃.':'Start with the least crowded carbon.'} Suitable polar aprotic medium; counterion omitted. This is the specified SN2 pathway, not a yield or rate prediction.</p>`+controls+standard(s,revealed)+instructionNote,primary:{action:revealed?'next':'commit',label:revealed?(step===5?(caseIndex?'Finish these cases':'Try the changed substrate'):'Build the next part'):'Test my move',disabled:!revealed&&!filled(s.draft,reactionStages[step])},progress:{current:s.cursor+(revealed?1:0),total:12,label:`Case ${caseIndex+1} · step ${step+1}/6`},complete:false};
}
function acidMolecule(x,y,c,{base=false,form=0,alcohol=false}={}){
  if(alcohol)return text(x-87,y+5,c.tail,17)+line(x-50,y,x-23,y)+text(x,y+5,'CH₂',18)+line(x+24,y,x+53,y)+text(x+71,y+5,base?'O⁻':'O',21)+(base?lp(x+71,y-24)+lp(x+71,y+24)+lp(x+98,y):line(x+85,y,x+105,y)+text(x+119,y+5,'H',19)+lp(x+71,y-24)+lp(x+71,y+24));
  let d=text(x-87,y+5,c.tail,17)+line(x-50,y,x-14,y)+text(x,y+5,'C')+text(x,y-67,base&&form===1?'O⁻':'O',21)+text(x+82,y+5,base&&form===0?'O⁻':'O',21);
  d+=line(x-4,y-17,x-4,y-50)+(base&&form===1?'':line(x+4,y-17,x+4,y-50));
  d+=line(x+14,y,x+62,y)+(base&&form===1?line(x+14,y-7,x+62,y-7):'');
  d+=lp(x-25,y-72)+lp(x+25,y-72)+(base&&form===1?lp(x,y-98):'');
  d+=lp(x+82,y-25)+lp(x+82,y+25)+(base&&form===0?lp(x+109,y):'');
  if(!base)d+=line(x+96,y,x+116,y)+text(x+132,y+5,'H',19);
  return d;
}
function acidScene(c,{s,step,revealed,caseIndex},done=false){
  const base=done||step>1||(step===1&&revealed),showForms=done||step>2||(step===2&&revealed),id=`oc-acid-${caseIndex}`;
  let d=marker(id)+text(320,28,base?'Compare the conjugate bases':'Compare the O–H acids',21)+acidMolecule(160,150,c,{base,form:showForms?s.form:0})+acidMolecule(465,150,c,{base,alcohol:true})+text(160,215,base?`${c.baseName} ion`:c.acid,18)+text(465,215,base?'Alkoxide ion':c.alcohol,18);
  if(step===1&&!revealed&&s.draft.pair)d+=arrow(s.draft.pair==='oxygen'?'M 270 150 Q 276 108 248 135':'M 270 150 Q 293 108 292 135',id)+text(175,257,'Your proposed O–H pair movement',15);
  if(base)d+=text(320,280,'Each neutral acid loses H⁺ → its base has charge −1.',16);
  if(showForms)d+=text(320,316,`Carboxylate contributor ${s.form+1}/2 · same atom positions`,16);
  return svg(`${base?'Conjugate bases':'Neutral acids'}: ${c.acid} and ${c.alcohol}. ${base?'The O–H hydrogen is removed; each oxygen-containing base has total charge minus one.':'Both have an O–H group; the carboxylic acid also has a carbonyl oxygen.'} ${showForms?'Carboxylate resonance contributors keep the nuclei fixed and redistribute electron pairs.':''}`,d,'0 0 640 350');
}
const acidPrompts=['Remove the O–H proton from each neutral acid. What leaves?','Keep track of the O–H bond: where does its electron pair remain?','Repair the second carboxylate drawing. What may change between resonance contributors?','Compare both conjugate bases. Which parent O–H acid is stronger in this matched comparison?'];
const acidHints=['A proton has charge +1 and no electron. Keep the oxygen framework.','Removing H⁺ is not removing a neutral H atom. The two bond electrons stay with oxygen.','Keep every nucleus in the same position. Change only the permitted electron placement.','Both bases carry −1 on oxygen-containing structures. Inspect whether electron density can spread across the carboxyl group.'];
function acidFeedback(step,p,c){
  if(step===0)return p.removed==='proton'?'Remove H⁺, not an electron or an oxygen atom. Each conjugate base contains one fewer H and has charge −1.':p.removed==='atom'?'A neutral H atom would take an electron and describe a different process. Acid–base deprotonation removes H⁺; the O–H pair remains in the base.':'Removing the entire O–H group changes the oxygen framework. A conjugate base here loses only H⁺.';
  if(step===1)return p.pair==='oxygen'?'The O–H pair stays on oxygen. This oxygen gains a lone pair and has formal charge −1; the other atom connections stay intact.':'If H took the O–H pair, it would not depart as H⁺. Keep the pair on oxygen to construct the requested conjugate base.';
  if(step===2)return p.shift==='electrons'?'Only electron placement changes. One oxygen lone pair forms a C–O π bond while the original π pair goes to the other oxygen. Each contributor keeps carbon at four bonds. The real ion is one resonance hybrid, not two structures switching in time.':'Moving a hydrogen or a carbon changes the structure. Resonance contributors keep nuclei and their connections fixed; only π and lone-pair electrons are redistributed.';
  return p.stronger==='carboxyl'?`${c.acid} is stronger than ${c.alcohol}: its carboxylate base delocalizes negative charge across two oxygens, unlike the localized alkoxide. This specific structural comparison does not make resonance an absolute rule for every acid.`:p.stronger==='same'?'Equal overall charge does not imply equal acidity. The carboxylate shares electron density across two oxygens, providing a stabilization difference absent from the alkoxide.':'The alcohol’s alkoxide lacks the carboxylate’s two-oxygen delocalization. In this matched O–H comparison, the carboxylic acid is stronger.';
}
function acidView(raw){
  const ctx=context(raw,acidStages),{s,done,caseIndex,step,revealed}=ctx,c=ORGANIC_ACID_CASES[caseIndex];
  if(done)return {activeObjectiveIds:['oc-acid-conjugate-pairs','oc-acid-stabilization'],scene:acidScene(c,ctx,true),prompt:'Two conjugate-base comparisons explored.',coach:'Removing H⁺ changes the charge by −1. Compare the resulting structures; do not rank acids from a mnemonic alone.',controls:group('Experiment controls',button('Revisit last comparison','undo')+button('Restart court','reset'))+instructionNote,primary:{action:'done',label:'Finish experiment'},progress:{current:8,total:8,label:'Two teaching comparisons explored'},complete:true};
  const definitions=[['Removed species','removed',[['proton','Remove H⁺ only'],['atom','Remove neutral H'],['hydroxyl','Remove O–H together']]],['O–H electron pair','pair',[['oxygen','Leave the pair on O'],['hydrogen','Send the pair with H']]],['Resonance operation','shift',[['electrons','Redistribute the electron pairs'],['hydrogen','Move a hydrogen nucleus'],['carbon','Move a carbon nucleus']]],['Stronger O–H acid','stronger',[['carboxyl',c.acid],['alcohol',c.alcohol],['same','Equal because both bases are −1']]]];
  const [label,key,options]=definitions[step];
  return {activeObjectiveIds:step<2?['oc-acid-conjugate-pairs']:['oc-acid-conjugate-pairs','oc-acid-stabilization'],scene:acidScene(c,ctx),prompt:acidPrompts[step],coach:revealed?acidFeedback(step,s.draft,c):s.help?acidHints[step]:'',controls:`<p class="exp-note">Case ${caseIndex+1}/2 · Same solvent and temperature. Only these O–H sites are compared. ${caseIndex?'One CH₂ group was added to each carbon chain.':''}</p>`+choices(label,key,options,s)+(revealed&&step>=2?group('Resonance drawings',button(`Show contributor ${s.form?1:2}`,'form')):'')+standard(s,revealed)+instructionNote,primary:{action:revealed?'next':'commit',label:revealed?(step===3?(caseIndex?'Finish these comparisons':'Try longer carbon chains'):'Inspect the next feature'):'Test my construction',disabled:!revealed&&!filled(s.draft,acidStages[step])},progress:{current:s.cursor+(revealed?1:0),total:8,label:`Case ${caseIndex+1} · step ${step+1}/4`},complete:false};
}
export const ORGANIC_ACTIVITIES=Object.freeze([
  Object.freeze({id:'oc-reaction-builder',title:'The Stolen Electron Route',world:'oc',objectiveIds:['oc-electrons','oc-sn2-conditions','oc-sn2-path'],version:1,sourceUrls:[U.sn2,U.conditions],instructionFamilies:['oc-discovery-thioether-arrow-construction','oc-discovery-sn2-access-and-leaving-group'],initial:empty,normalize:s=>normalize(s,reactionStages),reduce:(s,a,v)=>reduce(s,a,v,reactionStages),view:reactionView}),
  Object.freeze({id:'oc-conjugate-court',title:'Conjugate Court',world:'oc',objectiveIds:['oc-acid-conjugate-pairs','oc-acid-stabilization'],version:1,sourceUrls:[U.acid,U.resonance],instructionFamilies:['oc-discovery-oh-conjugate-construction','oc-discovery-carboxylate-alkoxide-comparison'],initial:empty,normalize:s=>normalize(s,acidStages),reduce:(s,a,v)=>reduce(s,a,v,acidStages),view:acidView})
]);
