import {button,esc,group,svg} from './shared.mjs';

const freeze=x=>{if(x&&typeof x==='object'){Object.values(x).forEach(freeze);Object.freeze(x);}return x;};
export const AVOGADRO=6.02214076e23;
export const MOLE_CASES=freeze([
 {id:'water-full',title:'Weigh the water shipment',formula:'H₂O',entity:'molecules',mass:18,molarMass:18,target:'H',atoms:['O','H','H'],change:'Begin with 18 g of pure water. Use the supplied 18 g/mol.'},
 {id:'water-half',title:'Divide the shipment',formula:'H₂O',entity:'molecules',mass:9,molarMass:18,target:'H',atoms:['O','H','H'],change:'Only the sample mass changes: 18 g → 9 g. Its formula and supplied molar mass stay fixed.'},
 {id:'carbon-dioxide',title:'Read the new formula',formula:'CO₂',entity:'molecules',mass:11,molarMass:44,target:'O',atoms:['O','C','O'],change:'A new pure substance: 11 g of CO₂, using 44 g/mol. Count oxygen atoms.'},
 {id:'hydroxide',title:'Open the parentheses',formula:'Ca(OH)₂',entity:'formula units',mass:18.5,molarMass:74,target:'O',atoms:['Ca','O','H','O','H'],change:'A pure ionic compound: 18.5 g of Ca(OH)₂, using 74 g/mol. The outside 2 repeats the whole OH group.'},
 {id:'argon-count',title:'Bring a counted sample to the scale',formula:'Ar',entity:'atoms',entityCount:1.50553519e23,molarMass:40,target:'Ar',atoms:['Ar'],change:'Start from 1.50553519 × 10²³ Ar atoms, equal to one-quarter of 6.02214076 × 10²³. Use 40 g/mol to recover mass.'}
]);
const factors=['divide-mass','multiply-mass','divide-count','multiply-count','unsure'];
const phases=['build','converted','atoms','explained','done'];
const f=n=>Number.isInteger(n)?String(n):String(Math.round(n*1e8)/1e8);
export function moleModel(index){
 const c=MOLE_CASES[index];if(!c)return null;
 const moles=c.mass===undefined?c.entityCount/AVOGADRO:c.mass/c.molarMass;
 const atomsPerEntity=c.atoms.filter(a=>a===c.target).length;
 return {moles,mass:moles*c.molarMass,entityCount:moles*AVOGADRO,atomsPerEntity,targetMoles:moles*atomsPerEntity,targetCount:moles*atomsPerEntity*AVOGADRO,expectedFactor:c.mass===undefined?'divide-count':'divide-mass'};
}
const initial=()=>({caseIndex:0,phase:'build',factor:'',selected:[],unsure:false,help:false});
function normalize(raw){
 const s=initial();if(!raw||typeof raw!=='object'||Array.isArray(raw))return s;
 if(Number.isInteger(raw.caseIndex)&&raw.caseIndex>=0&&raw.caseIndex<MOLE_CASES.length)s.caseIndex=raw.caseIndex;
 if(factors.includes(raw.factor))s.factor=raw.factor;
 s.help=raw.help===true;const c=MOLE_CASES[s.caseIndex];
 s.selected=Array.isArray(raw.selected)?[...new Set(raw.selected.filter(i=>Number.isInteger(i)&&i>=0&&i<c.atoms.length))].sort((a,b)=>a-b):[];
 s.unsure=raw.unsure===true;
 if(s.factor&&phases.includes(raw.phase))s.phase=raw.phase;
 if(['explained','done'].includes(s.phase)&&!s.selected.length&&!s.unsure)s.phase='atoms';
 if(s.phase==='done'&&s.caseIndex!==MOLE_CASES.length-1)s.phase='explained';
 if(s.phase==='build'){s.selected=[];s.unsure=false;}
 return s;
}
function reduce(raw,action,value){
 const s=normalize(raw);
 if(action==='reset')return initial();
 if(action==='help')return {...s,help:!s.help};
 if(action==='select-factor'&&s.phase==='build'&&factors.includes(value))return {...s,factor:value};
 if(action==='run-conversion'&&s.phase==='build'&&s.factor)return {...s,phase:'converted'};
 if(action==='inspect-entity'&&s.phase==='converted')return {...s,phase:'atoms'};
 if(action==='toggle'&&s.phase==='atoms'&&/^\d+$/.test(String(value))){const i=Number(value);if(i<MOLE_CASES[s.caseIndex].atoms.length)return {...s,selected:(s.selected.includes(i)?s.selected.filter(x=>x!==i):[...s.selected,i]).sort((a,b)=>a-b),unsure:false};}
 if(action==='unsure-atoms'&&s.phase==='atoms')return {...s,unsure:!s.unsure,selected:[]};
 if(action==='reveal-atoms'&&s.phase==='atoms'&&(s.selected.length||s.unsure))return {...s,phase:'explained'};
 if(action==='next'&&s.phase==='explained')return s.caseIndex<MOLE_CASES.length-1?{...initial(),caseIndex:s.caseIndex+1}:{...s,phase:'done'};
 return s;
}
const txt=(x,y,text,size=17)=>`<text x="${x}" y="${y}" text-anchor="middle" font-size="${size}" fill="#233e3a">${esc(text)}</text>`;
function factorText(c,factor){return ({'divide-mass':`× (1 mol / ${c.molarMass} g)`,'multiply-mass':`× (${c.molarMass} g / 1 mol)`,'divide-count':'× [1 mol / (6.02214076 × 10²³ entities)]','multiply-count':'× (6.02214076 × 10²³ entities / 1 mol)',unsure:'Choose a factor whose lower unit cancels the input.'})[factor]||'Place a conversion tile here';}
function scene(s){
 const c=MOLE_CASES[s.caseIndex],m=moleModel(s.caseIndex),converted=s.phase!=='build',atoms=['atoms','explained','done'].includes(s.phase),revealed=['explained','done'].includes(s.phase);
 const input=c.mass===undefined?'1.50553519 × 10²³ Ar atoms':`${f(c.mass)} g ${c.formula}`;
 let body=`<rect width="640" height="440" rx="22" fill="#fff8e7"/><path d="M75 160H565" stroke="#9aa78b" stroke-width="10"/>`;
 body+=`<rect x="25" y="65" width="170" height="110" rx="12" fill="#e6eed6" stroke="#557164"/>${txt(110,92,'Sample tray')}${txt(110,126,input,c.mass===undefined?11:20)}${txt(110,151,`${c.molarMass} g/mol supplied`,13)}`;
 body+=`<rect x="205" y="65" width="250" height="110" rx="12" fill="#f1deb5" stroke="#9c713d"/>${txt(330,92,converted?'Units cancel':'Your placed tile')}${txt(330,126,factorText(c,converted?m.expectedFactor:s.factor),s.factor.includes('count')||c.mass===undefined?11:15)}${txt(330,151,converted?`${f(m.moles)} mol of ${c.entity}`:'The tile changes units, not the sample.',14)}`;
 body+=`<rect x="465" y="65" width="150" height="110" rx="12" fill="#e6eed6" stroke="#557164"/>${txt(540,92,'Counted amount')}${txt(540,124,converted?`${f(m.moles)} mol`:'?',22)}${txt(540,151,c.entity,14)}`;
 if(converted){const packets=Math.round(m.moles/.25);for(let i=0;i<packets;i++)body+=`<rect x="${35+i*52}" y="202" width="42" height="44" rx="7" fill="#b1d8cb" stroke="#367867"/><circle cx="${56+i*52}" cy="224" r="7" fill="#367867"/>`;
 body+=txt(408,217,'Each packet = 0.25 mol of named entities',14)+txt(408,242,'A counting illustration, not literal particle scale',12);
 }
 if(atoms){
  body+=txt(320,282,c.entity==='formula units'?'One formula-unit composition: ionic ratio, not a molecule':'One representative '+(c.entity==='atoms'?'Ar atom':'molecule')+' · composition only',14);
  const colors={O:'#cf7e64',H:'#d7dfdf',C:'#83969c',Ca:'#b8a5d8',Ar:'#b8a5d8'};
  c.atoms.forEach((atom,i)=>{const x=320+(i-(c.atoms.length-1)/2)*77,chosen=revealed?atom===c.target:s.selected.includes(i);body+=`<circle cx="${x}" cy="336" r="27" fill="${colors[atom]}" stroke="${chosen?'#125b49':'#64796e'}" stroke-width="${chosen?5:1.5}"/>${txt(x,342,atom,19)}${txt(x,382,`Site ${i+1}`,13)}`;});
  if(c.formula==='Ca(OH)₂')body+=`<path d="M210 302v-9h140v9M365 302v-9h140v9" stroke="#6f5b8b" stroke-width="2" fill="none"/>`;
  body+=txt(320,420,revealed?`${m.atomsPerEntity} ${c.target} ${m.atomsPerEntity===1?'atom':'atoms'} per entity → ${f(m.targetMoles)} mol ${c.target} atoms`:`Mark every ${c.target} site in the representative entity.`,16);
 }else body+=txt(320,341,converted?'Next, distinguish entities from the atoms inside them.':'Predict a unit bridge before revealing the converted amount.',17);
 return svg(`${c.title}. Given ${input}; supplied molar mass ${c.molarMass} g/mol.${converted?` Converted amount ${f(m.moles)} mol ${c.entity}.`:''}${atoms?` Representative composition: ${c.atoms.join(', ')}. Target ${c.target}.`:''}`,body,'0 0 640 440')+`<p class="exp-caption">${esc(c.change)} All samples are pure. Supplied rounded molar masses govern this exercise. Nₐ = 6.02214076 × 10²³ mol⁻¹ exactly. No chemical reaction occurs.</p>`;
}
function view(raw){
 const s=normalize(raw),c=MOLE_CASES[s.caseIndex],m=moleModel(s.caseIndex),revealed=['explained','done'].includes(s.phase),complete=s.phase==='done';
 let prompt='Build a unit bridge from this sample to moles.',coach='',controls='',primary;
 const toolLabels=[['divide-mass',`Place 1 mol / ${c.molarMass} g`],['multiply-mass',`Place ${c.molarMass} g / 1 mol`],['divide-count','Place 1 mol / (6.02214076 × 10²³ entities)'],['multiply-count','Place (6.02214076 × 10²³ entities) / 1 mol'],['unsure','I’m not sure yet']];
 if(s.phase==='build'){
  controls=group('Unit tiles',toolLabels.map(([value,label])=>button(label,'select-factor',value,{selected:s.factor===value})).join(''));
  primary={action:'run-conversion',label:'Run the unit bridge',disabled:!s.factor};
  if(s.help)coach='Put the input unit below the fraction bar so it cancels. Grams use molar mass; an entity count uses Avogadro’s constant. They are different bridges.';
 }else if(s.phase==='converted'){
  prompt='Trace the unit cancellation, then inspect an entity.';
  coach=(s.factor==='unsure'?'Walk through the bridge. ':s.factor===m.expectedFactor?'Your tile fits. ':'Your chosen tile does not cancel the input into moles. ')+(c.mass===undefined?`Divide the atom count by 6.02214076 × 10²³ atoms per mole: ${f(m.moles)} mol Ar atoms. Multiply that amount by 40 g/mol to obtain ${f(m.mass)} g.`:`${f(c.mass)} g × (1 mol / ${c.molarMass} g) = ${f(m.moles)} mol ${c.entity}. Grams cancel. The entity count is ${f(m.moles)} mol × Nₐ, not grams × Nₐ.`);
  controls=`<p>Your committed tile: <strong>${esc(factorText(c,s.factor))}</strong></p>`;
  primary={action:'inspect-entity',label:'Inspect one representative entity'};
 }else if(s.phase==='atoms'){
  prompt=`Mark all ${c.target} sites, then scale from one entity to the whole sample.`;
  controls=group('Mark atom sites',c.atoms.map((atom,i)=>button(`Site ${i+1}: ${atom}`,'toggle',String(i),{selected:s.selected.includes(i)})).join('')+button('Show me the atom count','unsure-atoms','',{selected:s.unsure}));
  primary={action:'reveal-atoms',label:'Scale the marked atoms to the sample',disabled:!s.selected.length&&!s.unsure};
  if(s.help)coach=c.formula==='Ca(OH)₂'?'The outside 2 multiplies both O and H inside the parentheses. Ca has no written subscript, so there is one Ca per formula unit.':'Each formula subscript counts that atom within one entity. No written subscript means one; a subscript does not multiply the number of whole entities.';
 }else{
  const expected=c.atoms.map((a,i)=>a===c.target?i:-1).filter(i=>i>=0),matches=JSON.stringify(expected)===JSON.stringify(s.selected);
  prompt=complete?'The mass-and-count bridge is restored.':'Follow the named entity through the final calculation.';
  coach=(s.unsure?'Here is the count. ':matches?'Your marked sites agree. ':'Compare your marked sites with the highlighted target atoms. ')+`Each ${c.entity==='formula units'?'formula unit':c.entity==='atoms'?'Ar atom':'molecule'} contains ${m.atomsPerEntity} ${c.target} ${m.atomsPerEntity===1?'atom':'atoms'}. ${f(m.moles)} mol ${c.entity} × ${m.atomsPerEntity} = ${f(m.targetMoles)} mol ${c.target} atoms. Their number is ${f(m.targetMoles)} mol × Nₐ. The sample still has ${f(m.moles)} mol of whole entities.`+(c.entity==='formula units'?' A formula unit states the ionic ratio; it is not a discrete molecule.':'');
  controls=`<p>Your marked sites: ${esc(s.unsure?'Not sure':s.selected.map(i=>`${i+1}: ${c.atoms[i]}`).join(', '))}.</p>`;
  if(c.mass===undefined)controls+=`<p>Reverse bridge: ${f(m.moles)} mol × ${c.molarMass} g/mol = <strong>${f(m.mass)} g</strong>.</p>`;
  if(complete)controls+='<p>Next, the Reaction Supply Forge uses mole amounts to build complete reaction batches. This discovery records instruction, not checkpoint mastery.</p>';
  primary=complete?{action:'reset',label:'Explore the bridge again'}:{action:'next',label:s.caseIndex<MOLE_CASES.length-1?'Bring the next sample':'Complete this discovery'};
 }
 controls+=group('Bench tools',button(s.help?'Put clue away':'Ask the mole keeper','help','',{selected:s.help})+button('Restart discovery','reset'));
 return {activeObjectiveIds:['gc-mole-conversion'],scene:scene(s),prompt,coach,controls,primary,progress:{current:complete?MOLE_CASES.length:s.caseIndex+1,total:MOLE_CASES.length,label:`Sample ${s.caseIndex+1} of ${MOLE_CASES.length} · ${s.phase}`},complete};
}
export const MOLE_CONVERSION_ACTIVITY=Object.freeze({id:'gc-mass-count-bridge',title:'The Mass-and-Count Bridge',world:'gc',objectiveIds:['gc-mole-conversion'],version:1,sourceUrls:['https://openstax.org/books/chemistry-2e/pages/3-1-formula-mass-and-the-mole-concept'],familiarFamilyIds:['gc-mole-mass-conversion','gc-mole-entity-count'],instructionFamilies:['discovery-gc-original-mass-count-bridge','gc-mole-mass-conversion','gc-mole-entity-count'],initial,normalize,reduce,view});
export default MOLE_CONVERSION_ACTIVITY;
