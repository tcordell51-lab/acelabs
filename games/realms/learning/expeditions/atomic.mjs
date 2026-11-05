import {button,esc,group,svg} from './shared.mjs';
const deepFreeze=x=>{if(x&&typeof x==='object'){Object.values(x).forEach(deepFreeze);Object.freeze(x);}return x;};
const INVENTORY='gc-atomic-inventory',PERIODIC='gc-atomic-periodic-reasoning';
export function atomicInventory(Z,A,q){
 if(![Z,A,q].every(Number.isSafeInteger)||Z<1||A<Z||Z-q<0)return null;
 return {p:Z,n:A-Z,e:Z-q,Z,A,q};
}
export const ATOMIC_CASES=deepFreeze([
 {id:'sulfur-ledger',objective:INVENTORY,title:'Restore three separate ledgers',kind:'inventory',Z:16,A:34,q:-2,symbol:'S',prompt:'Sulfur-34 has Z = 16 and charge −2. Predict the three particle counts.',options:[['16-18-18','16 protons · 18 neutrons · 18 electrons'],['16-34-18','16 protons · 34 neutrons · 18 electrons'],['16-18-14','16 protons · 18 neutrons · 14 electrons']],answer:'16-18-18',reason:'signed-ledger',explanation:'Z fixes 16 protons. A − Z gives 34 − 16 = 18 neutrons. A −2 charge requires two extra electrons: 18. Check the charge separately: 16 − 18 = −2.'},
 {id:'silicon-labels',objective:INVENTORY,title:'Sort the two isotope labels',kind:'isotopes',left:{Z:14,A:28,q:4},right:{Z:14,A:30,q:4},prompt:'These silicon species both have Z = 14 and charge +4. Their mass numbers are 28 and 30. What differs?',options:[['neutrons','Only the neutron count'],['protons','Only the proton count'],['electrons','Only the electron count']],answer:'neutrons',reason:'nucleus-identity',explanation:'Both species have 14 protons and 10 electrons, so they have the same element identity and +4 charge. Their neutron counts are 14 and 16. That difference makes them different isotopes.'},
 {id:'group-size',objective:PERIODIC,title:'Restore the shell ladder',kind:'radius',left:{symbol:'Mg',Z:12,shells:3},right:{symbol:'Ca',Z:20,shells:4},same:'group 2',prompt:'Neutral Mg and Ca belong to group 2. Predict which has the larger covalent radius.',options:[['left','Mg is larger'],['right','Ca is larger'],['same','Their radii must be identical']],answer:'right',reason:'higher-shell',explanation:'Ca is below Mg in group 2 and has valence electrons in the fourth principal shell rather than the third. For this pair, the more extended outer shell gives Ca the larger covalent radius. Counting protons alone misses that change.'},
 {id:'group-removal',objective:PERIODIC,title:'Compare the electron-release gates',kind:'ionization',left:{symbol:'Li',Z:3,shells:2},right:{symbol:'Na',Z:11,shells:3},same:'group 1',prompt:'For isolated gaseous neutral Li and Na, predict which needs more energy for the first electron removal.',options:[['left','Li needs more energy'],['right','Na needs more energy'],['same','Neutral atoms need equal energy']],answer:'left',reason:'outer-removal',explanation:'Li has the higher first ionization energy. In this group-1 comparison, Na’s valence electron occupies a higher, more extended principal shell and experiences greater screening. It is easier to remove. This is not a statement about a bond or removal from a cation.'},
 {id:'period-size',objective:PERIODIC,title:'Repair the across-period lens',kind:'radius',left:{symbol:'Na',Z:11,shells:3},right:{symbol:'Cl',Z:17,shells:3},same:'period 3',prompt:'Neutral Na and Cl both have outer electrons in principal shell 3. Predict which has the smaller covalent radius.',options:[['left','Na is smaller'],['right','Cl is smaller'],['same','Same shell means the same radius']],answer:'right',reason:'effective-attraction',explanation:'Cl has the smaller covalent radius. Across this period, increasing effective nuclear attraction draws the valence electron distribution inward. Other electrons still screen that attraction; Z minus core electrons is not an exact measurement of it.'}
]);
const reasons={
 'signed-ledger':'Use p = Z, n = A − Z and e = Z − q.',
 'nucleus-identity':'Same proton count, different neutron count: isotope identity changed.',
 'higher-shell':'Down this group, the outer principal shell is more extended.',
 'outer-removal':'Na’s more distant, more screened outer electron is easier to remove.',
 'effective-attraction':'Across this period, stronger effective attraction draws electrons inward.',
 'proton-size':'More protons always make an atom bigger.',
 'charge-nucleus':'An ordinary ion gains its charge by changing its nucleus.',
 'same-neutral':'Every neutral atom holds its electrons equally strongly.',
 unsure:'I’m not sure yet'
};
const choicesFor=c=>[...c.options,['unsure','I’m not sure yet']];
const reasonsFor=c=>[c.reason,c.kind==='inventory'||c.kind==='isotopes'?'charge-nucleus':c.kind==='ionization'?'same-neutral':'proton-size','unsure'];
const initial=()=>({caseIndex:0,phase:'predict',prediction:'',reason:'',help:false,records:[]});
const validPrediction=(i,p)=>choicesFor(ATOMIC_CASES[i]).some(([value])=>value===p);
const validReason=(i,r)=>reasonsFor(ATOMIC_CASES[i]).includes(r);
function normalize(raw){
 const s=initial();if(!raw||typeof raw!=='object'||Array.isArray(raw))return s;
 if(Number.isInteger(raw.caseIndex)&&raw.caseIndex>=0&&raw.caseIndex<ATOMIC_CASES.length)s.caseIndex=raw.caseIndex;
 const seen=new Set();for(const row of Array.isArray(raw.records)?raw.records:[]){
  if(!row||!Number.isInteger(row.caseIndex)||row.caseIndex<0||row.caseIndex>=ATOMIC_CASES.length||seen.has(row.caseIndex)||!validPrediction(row.caseIndex,row.prediction))continue;
  seen.add(row.caseIndex);const observed=row.observed===true,reason=observed&&validReason(row.caseIndex,row.reason)?row.reason:'';
  s.records.push({caseIndex:row.caseIndex,prediction:row.prediction,observed,reason,completed:!!reason&&row.completed===true});
 }
 s.records.sort((a,b)=>a.caseIndex-b.caseIndex);s.help=raw.help===true;
 const record=s.records.find(r=>r.caseIndex===s.caseIndex);
 if(record){s.prediction=record.prediction;s.reason=record.reason|| (record.observed&&validReason(s.caseIndex,raw.reason)?raw.reason:'');s.phase=record.completed?'explained':record.observed?'reason':'observe';}
 else if(validPrediction(s.caseIndex,raw.prediction))s.prediction=raw.prediction;
 if(raw.phase==='done'&&s.caseIndex===ATOMIC_CASES.length-1&&s.records.length===ATOMIC_CASES.length&&s.records.every(r=>r.completed))s.phase='done';
 return s;
}
const recordPatch=(s,patch)=>s.records.map(r=>r.caseIndex===s.caseIndex?{...r,...patch}:r);
function reduce(raw,action,value){
 const s=normalize(raw),c=ATOMIC_CASES[s.caseIndex];
 if(action==='help')return {...s,help:!s.help};
 if(action==='reset')return normalize({...s,caseIndex:0,phase:'predict',help:false,prediction:'',reason:''});
 if(action==='predict'&&s.phase==='predict'&&validPrediction(s.caseIndex,value))return {...s,prediction:value};
 if(action==='commit-prediction'&&s.phase==='predict'&&s.prediction)return normalize({...s,records:[...s.records,{caseIndex:s.caseIndex,prediction:s.prediction,observed:false,reason:'',completed:false}]});
 if(action==='observe'&&s.phase==='observe')return normalize({...s,records:recordPatch(s,{observed:true})});
 if(action==='choose-reason'&&s.phase==='reason'&&validReason(s.caseIndex,value))return {...s,reason:value};
 if(action==='explain'&&s.phase==='reason'&&s.reason)return normalize({...s,records:recordPatch(s,{reason:s.reason,completed:true})});
 if(action==='next'&&s.phase==='explained'){
  const missing=ATOMIC_CASES.findIndex((_,i)=>!s.records.some(r=>r.caseIndex===i&&r.completed));
  const nextIndex=s.caseIndex<ATOMIC_CASES.length-1?s.caseIndex+1:missing;
  return normalize(nextIndex===-1?{...s,phase:'done'}:{...s,caseIndex:nextIndex,phase:'predict',prediction:'',reason:'',help:false});
 }
 return s;
}
const text=(x,y,label,size=19,fill='#243d42')=>`<text x="${x}" y="${y}" text-anchor="middle" fill="${fill}" font-size="${size}">${esc(label)}</text>`;
function particles(x,y,count,kind){let body='';for(let i=0;i<count;i++){const cx=x+(i%6)*20,cy=y+Math.floor(i/6)*20;body+=kind==='n'?`<rect x="${cx-7}" y="${cy-7}" width="14" height="14" rx="3" fill="#abc7ba" stroke="#214b42"/>`:`<circle cx="${cx}" cy="${cy}" r="7" fill="${kind==='p'?'#f4b66d':'#a5cbd9'}" stroke="#254c55"/>`;body+=text(cx,cy+4,kind==='p'?'+':kind==='e'?'−':'0',10);}return body;}
function inventoryScene(c,observed){
 const m=atomicInventory(c.Z,c.A,c.q);let body=`<rect width="640" height="410" rx="24" fill="#fff5dc"/>${text(320,36,`${c.symbol}-${c.A} · Z = ${c.Z} · q = ${c.q<0?'−'+Math.abs(c.q):'+'+c.q}`,25)}`;
 for(const [i,[kind,label,value]]of [['p','Protons',m.p],['n','Neutrons',m.n],['e','Electrons',m.e]].entries()){
  const x=23+i*207;body+=`<rect x="${x}" y="70" width="180" height="250" rx="18" fill="${i===2?'#e8f4f5':'#f8e7c7'}" stroke="#7a7761"/>${text(x+90,103,label,22)}${observed?particles(x+40,143,value,kind)+text(x+90,284,String(value),31):text(x+90,212,'Readout covered',17)}`;
 }
 body+=text(320,354,'p = Z       n = A − Z       e = Z − q',23)+text(320,385,'Counting bins represent inventories, not particle positions or scale.',14);
 return svg(`Sulfur-34, Z 16, charge minus two. ${observed?'Observed inventory: 16 protons, 18 neutrons, 18 electrons.':'Particle readouts are covered until observation.'}`,body,'0 0 640 410');
}
function isotopeScene(c,observed){let body=`<rect width="640" height="410" rx="24" fill="#fff5dc"/>${text(320,35,'Same element? Same isotope? Same charge?',23)}`;
 for(const [i,species]of[c.left,c.right].entries()){const x=35+i*320,m=atomicInventory(species.Z,species.A,species.q);body+=`<rect x="${x}" y="65" width="250" height="268" rx="18" fill="#eef2de" stroke="#6f8b79"/>${text(x+125,101,`Si-${m.A} · charge +4`,24)}${text(x+125,133,'Z = 14',20)}${text(x+125,185,observed?`${m.p} protons`:'Proton readout covered',18)}${text(x+125,230,observed?`${m.n} neutrons`:'Neutron readout covered',18)}${text(x+125,275,observed?`${m.e} electrons`:'Electron readout covered',18)}`;}
 body+=text(320,366,'Isotope: compare the nucleus. Charge: compare protons and electrons.',15)+text(320,391,'These are separate specified species; no conversion process is shown.',14);
 return svg(`Silicon-28 and silicon-30, each Z 14 and charge plus four. ${observed?'Both: 14 protons and 10 electrons. Neutrons: 14 and 16 respectively.':'Inventory readouts are covered.'}`,body,'0 0 640 410');
}
function cloud(x,species,radius,cy=190){let body=`<circle cx="${x}" cy="${cy}" r="${radius}" fill="#dcebdd" stroke="#69917c" stroke-width="3" stroke-dasharray="7 5"/>`;
 // These concentric contours encode a shell-level label only; they are not paths or electron densities.
 for(let n=1;n<=species.shells;n++)body+=`<circle cx="${x}" cy="${cy}" r="${20+n*11}" fill="none" stroke="#8fa9a1" stroke-width="1.5" opacity=".65"/>`;
 return body+`<circle cx="${x}" cy="${cy}" r="20" fill="#f1b66b" stroke="#665641"/>`+text(x,cy+6,species.symbol,17)+text(x,71,`${species.symbol} · Z = ${species.Z}`,23)+text(x,104,`Outer shell n = ${species.shells}`,18);
}
function trendScene(c,observed){const period=c.id==='period-size',radiusLeft=c.kind==='radius'&&observed?(period?85:67):76,radiusRight=c.kind==='radius'&&observed?(period?58:91):76;
 let body=`<rect width="640" height="435" rx="24" fill="#eaf3ec"/>${text(320,34,`Neutral ground-state atoms · ${c.same}`,22)}`+cloud(160,c.left,radiusLeft,c.kind==='radius'?210:190)+cloud(480,c.right,radiusRight,c.kind==='radius'?210:190);
 if(c.kind==='ionization')body+=text(320,303,'X(g) → X⁺(g) + e⁻',24)+text(320,344,observed?'Li needs more first-ionization energy.':'Energy comparison covered',22);
 else body+=text(320,328,observed?(period?'Cl has the smaller covalent radius.':'Ca has the larger covalent radius.'):'Size comparison covered',22);
 body+=text(320,383,'Contours are teaching symbols, not orbits or measured atomic boundaries.',14)+text(320,409,'Drawing sizes are qualitative; they are not a scale of measured radii.',14);
 return svg(`${c.left.symbol} and ${c.right.symbol} in ${c.same}. Outer principal shells ${c.left.shells} and ${c.right.shells}. ${observed?c.kind==='ionization'?'Li requires greater first ionization energy.':period?'Cl has the smaller covalent radius.':'Ca has the larger covalent radius.':'The comparison is covered until observation.'}`,body,'0 0 640 435');
}
function view(raw){const s=normalize(raw),c=ATOMIC_CASES[s.caseIndex],record=s.records.find(r=>r.caseIndex===s.caseIndex),observed=record?.observed===true,complete=s.phase==='done';
 const scene=(c.kind==='inventory'?inventoryScene(c,observed):c.kind==='isotopes'?isotopeScene(c,observed):trendScene(c,observed))+`<p class="exp-caption">${esc(c.kind==='inventory'||c.kind==='isotopes'?'Z counts protons; A counts protons plus neutrons; signed q = protons − electrons. Ordinary electron loss or gain leaves the nucleus unchanged.':'Compare the named neutral atoms and property only. General first-ionization trends have subshell/pairing exceptions. This model does not calculate exact effective nuclear charge or compare ionic radii.')}</p>`;
 let prompt=c.prompt,controls='',coach='',primary={action:'commit-prediction',label:'Commit the prediction',disabled:!s.prediction};
 const predictionLabel=choicesFor(c).find(([value])=>value===s.prediction)?.[1]||'';
 if(s.phase==='predict')controls=group('Predict before opening the readout',choicesFor(c).map(([value,label])=>button(label,'predict',value,{selected:s.prediction===value})).join(''));
 else if(s.phase==='observe'){prompt='Your first prediction is recorded. Open the observation before choosing a reason.';controls=`<p>First prediction: <strong>${esc(predictionLabel)}</strong>.</p>`;primary={action:'observe',label:'Open the observation'};}
 else if(s.phase==='reason'){prompt='Compare the observation with your prediction, then choose an explanation.';controls=`<p>First prediction: <strong>${esc(predictionLabel)}</strong>.</p>`+group('Explain the observation',reasonsFor(c).map(value=>button(reasons[value],'choose-reason',value,{selected:s.reason===value})).join(''));primary={action:'explain',label:'Trace the reasoning',disabled:!s.reason};}
 else {prompt=complete?'The Crucible’s labels now carry their reasoning.':'Keep the observation and its explanation together.';coach=(s.prediction==='unsure'?'The observation gives you a comparison. ':s.prediction===c.answer?'Your prediction agrees. ':'The observation differs from your first prediction. ')+c.explanation+(s.reason!==c.reason?' Compare your explanation with this particle or shell reasoning.':'');controls=`<p>First prediction: <strong>${esc(predictionLabel)}</strong>. First explanation: ${esc(reasons[s.reason])}.</p>`;primary=complete?{action:'done',label:'Investigation complete'}:{action:'next',label:s.caseIndex<ATOMIC_CASES.length-1?'Go to the next station':s.records.filter(r=>r.completed).length<ATOMIC_CASES.length?'Visit the first unfinished station':'Complete the investigation'};}
 if(s.help&&!coach)coach=c.objective===INVENTORY?'Isolume: “Team Entropy merged the three ledgers. Separate the nucleus from the electron count, then check mass number and signed charge independently.”':'Isolume: “Team Entropy replaced reasons with arrows. Name the property, compare the outer shell, then consider effective attraction. The drawings are symbols, not measured sizes.”';
 controls+=group('Workbench tools',button(s.help?'Close the clue':'Ask Isolume for a clue','help','',{selected:s.help})+button('Review from the first station','reset'));
 if(s.records.length)controls+=`<details><summary>Recorded first responses</summary><ol>${s.records.map(r=>{const k=ATOMIC_CASES[r.caseIndex];return `<li>${esc(k.title)}: ${esc(choicesFor(k).find(([v])=>v===r.prediction)?.[1])}; ${r.completed?'explanation recorded':r.observed?'observation opened':'awaiting observation'}.</li>`;}).join('')}</ol></details>`;
 if(complete)controls+='<p>Five guided stations explored. This instruction awards no mastery or assessment credit. A fresh checkpoint asks a separate question.</p>';
 return {activeObjectiveIds:[c.objective],scene,prompt,controls,coach,primary,complete,progress:{current:s.caseIndex+1,total:ATOMIC_CASES.length,label:`Station ${s.caseIndex+1} of ${ATOMIC_CASES.length} · ${s.phase}`}};
}
export const ATOMIC_ACTIVITY=Object.freeze({id:'gc-atomic-crucible-lab',title:'Isolume’s Atomic Crucible',world:'gc',objectiveIds:[INVENTORY,PERIODIC],version:1,sourceUrls:['https://openstax.org/books/chemistry-2e/pages/2-3-atomic-structure-and-symbolism','https://openstax.org/books/chemistry-2e/pages/6-5-periodic-variations-in-element-properties'],familiarFamilyIds:['gc-atomic-single-species-ledger','gc-atomic-isotope-versus-ion','gc-atomic-same-period-comparison','gc-atomic-down-group-comparison','gc-atomic-ionization-definition'],instructionFamilies:['discovery-gc-atomic-crucible','gc-atomic-single-species-ledger','gc-atomic-isotope-versus-ion','gc-atomic-same-period-comparison','gc-atomic-down-group-comparison','gc-atomic-ionization-definition'],initial,normalize,reduce,view});
export default ATOMIC_ACTIVITY;
