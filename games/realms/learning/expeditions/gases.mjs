import {button,esc,group,svg} from './shared.mjs';
const freeze=x=>{if(x&&typeof x==='object'){Object.values(x).forEach(freeze);Object.freeze(x);}return x;};
const f=n=>String(Math.round(n*100)/100);
export const GAS_CASES=freeze([
 {id:'piston',objective:'gc-gas-state-relations',title:'Move the model piston',kind:'state',P1:120,V1:4,T1:300,control:'V2',options:[2,8],default:2,unit:'L',fixed:'Amount and temperature remain fixed.',reason:'inverse-volume'},
 {id:'absolute-heat',objective:'gc-gas-state-relations',title:'Change the thermostat scale',kind:'state',P1:120,V1:4,T1:300,control:'C2',options:[126.85,-73.15],default:126.85,unit:'°C',fixed:'Amount and volume remain fixed. Initial 26.85 °C = 300 K.',reason:'kelvin-temperature'},
 {id:'two-controls',objective:'gc-gas-state-relations',title:'Competing changes',kind:'state',P1:120,V1:4,T1:300,V2:8,control:'T2',options:[450,600,900],default:450,unit:'K',fixed:'Amount remains fixed. The final volume is twice the starting volume.',reason:'both-factors'},
 {id:'component-meter',objective:'gc-gas-partial-pressure',title:'Separate the gauge contributions',kind:'mixture',nA:1,nB1:1,control:'nB2',options:[2,3],default:2,unit:'mol B',fixed:'T and V remain fixed; RT/V = 50 kPa/mol. No reaction occurs.',reason:'fixed-component'},
 {id:'mixture-volume',objective:'gc-gas-partial-pressure',title:'Give the mixture more room',kind:'mixture',nA:1,nB1:2,control:'volumeFactor',options:[2,3],default:2,unit:'× starting volume',fixed:'Each amount and temperature remain fixed. Initially RT/V = 50 kPa/mol.',reason:'all-components'}
]);
export function gasModel(index,condition){
 const c=GAS_CASES[index];if(!c)return null;const v=c.options.includes(Number(condition))?Number(condition):c.default;
 if(c.kind==='state'){
  const V2=c.control==='V2'?v:c.V2??c.V1,T2=c.control==='C2'?v+273.15:c.control==='T2'?v:c.T1;
  const P2=c.P1*c.V1/V2*T2/c.T1;
  return {kind:'state',P1:c.P1,V1:c.V1,T1:c.T1,P2,V2,T2,volumeFactor:c.V1/V2,temperatureFactor:T2/c.T1,expected:Math.abs(P2-c.P1)<1e-8?'same':P2>c.P1?'higher':'lower'};
 }
 const nB2=c.control==='nB2'?v:c.nB1,volumeFactor=c.control==='volumeFactor'?v:1,k1=50,k2=k1/volumeFactor;
 const initial=[c.nA*k1,c.nB1*k1],final=[c.nA*k2,nB2*k2];
 return {kind:'mixture',nA:c.nA,nB1:c.nB1,nB2,initial,final,total1:initial[0]+initial[1],total2:final[0]+final[1],k1,k2,volumeFactor,expected:Math.abs(final[0]-initial[0])<1e-8?'same':final[0]>initial[0]?'higher':'lower'};
}
const predictions=['lower','same','higher','unsure'];
const reasons=['inverse-volume','kelvin-temperature','both-factors','fixed-component','all-components','total-controls-A','unsure'];
const reasonLabels={'inverse-volume':'At fixed n and T, pressure changes inversely with volume.','kelvin-temperature':'At fixed n and V, compare the absolute temperatures.','both-factors':'Use both T2/T1 and V1/V2.','fixed-component':'A keeps the same n, T and V even when B is added.','all-components':'A and B each experience the same volume increase.','total-controls-A':'Any change in total pressure forces every component pressure in the same direction.',unsure:'I’m not sure yet'};
const phases=['predict','observe','reason','explained','done'];
const initial=()=>({caseIndex:0,phase:'predict',condition:GAS_CASES[0].default,prediction:'',observed:false,reason:'',help:false});
function normalize(raw){
 const s=initial();if(!raw||typeof raw!=='object'||Array.isArray(raw))return s;
 if(Number.isInteger(raw.caseIndex)&&raw.caseIndex>=0&&raw.caseIndex<GAS_CASES.length)s.caseIndex=raw.caseIndex;
 const c=GAS_CASES[s.caseIndex];s.condition=c.options.includes(Number(raw.condition))?Number(raw.condition):c.default;
 if(predictions.includes(raw.prediction))s.prediction=raw.prediction;
 if(reasons.includes(raw.reason))s.reason=raw.reason;
 s.help=raw.help===true;s.observed=raw.observed===true;
 if(s.prediction&&phases.includes(raw.phase))s.phase=raw.phase;
 if(['reason','explained','done'].includes(s.phase)&&!s.observed)s.phase='observe';
 if(['explained','done'].includes(s.phase)&&!s.reason)s.phase='reason';
 if(s.phase==='done'&&s.caseIndex!==GAS_CASES.length-1)s.phase='explained';
 if(s.phase==='predict'){s.observed=false;s.reason='';}
 return s;
}
function reduce(raw,action,value){
 const s=normalize(raw),c=GAS_CASES[s.caseIndex];
 if(action==='reset')return initial();
 if(action==='help')return {...s,help:!s.help};
 if(action==='set-condition'&&s.phase==='predict'&&c.options.includes(Number(value)))return {...s,condition:Number(value),prediction:''};
 if(action==='predict'&&s.phase==='predict'&&predictions.includes(value))return {...s,prediction:value};
 if(action==='commit-prediction'&&s.phase==='predict'&&s.prediction)return {...s,phase:'observe'};
 if(action==='read-meter'&&s.phase==='observe')return {...s,observed:true,phase:'reason'};
 if(action==='choose-reason'&&s.phase==='reason'&&reasons.includes(value))return {...s,reason:value};
 if(action==='explain'&&s.phase==='reason'&&s.reason)return {...s,phase:'explained'};
 if(action==='change-condition'&&s.phase==='explained')return {...initial(),caseIndex:s.caseIndex,condition:c.options[(c.options.indexOf(s.condition)+1)%c.options.length]};
 if(action==='next'&&s.phase==='explained')return s.caseIndex===GAS_CASES.length-1?{...s,phase:'done'}:{...initial(),caseIndex:s.caseIndex+1,condition:GAS_CASES[s.caseIndex+1].default};
 return s;
}
const txt=(x,y,t,size=16)=>`<text x="${x}" y="${y}" text-anchor="middle" fill="#183b43" font-size="${size}">${esc(t)}</text>`;
function chamber(x,width,title,amountA,amountB,temperature){
 let b=`<rect x="${x}" y="100" width="${width}" height="164" rx="12" fill="#e4f3f4" stroke="#487c81" stroke-width="3"/>${txt(x+width/2,82,title,15)}`;
 const dots=[...Array(amountA).fill('A'),...Array(amountB).fill('B')],columns=Math.max(2,Math.floor((width-30)/32));
 dots.forEach((kind,i)=>{const cx=x+20+(i%columns)*Math.min(32,(width-40)/(columns-1)),cy=128+Math.floor(i/columns)*34;b+=`<circle cx="${cx}" cy="${cy}" r="11" fill="${kind==='A'?'#8dd4da':'#f3bc70'}" stroke="#254c55"/>${txt(cx,cy+4,kind,11)}`;});
 return b+txt(x+width/2,286,temperature,14);
}
function scene(s){
 const c=GAS_CASES[s.caseIndex],m=gasModel(s.caseIndex,s.condition),revealed=s.observed;
 let b=`<rect width="640" height="430" rx="22" fill="#f7f7ea"/>${txt(320,32,c.title,23)}`;
 if(m.kind==='state'){
  b+=chamber(150-15*m.V1,30*m.V1,'Initial equilibrium',8,0,`${f(m.T1)} K · ${f(m.V1)} L`)+chamber(490-15*m.V2,30*m.V2,'Chosen final equilibrium',8,0,`${f(m.T2)} K · ${f(m.V2)} L`);
  b+=txt(150,321,`P1 = ${f(m.P1)} kPa`,20)+txt(490,321,revealed?`P2 = ${f(m.P2)} kPa`:'Final gauge covered',20);
  b+=txt(320,365,revealed?`${f(m.P1)} × (${f(m.V1)}/${f(m.V2)}) × (${f(m.T2)}/${f(m.T1)}) = ${f(m.P2)} kPa`:'Read the chosen volume and Kelvin temperature before predicting.',15);
 }else{
  b+=chamber(40,220,'Initial mixture',2*m.nA,2*m.nB1,'Shared T and V')+chamber(380,220,'Chosen final mixture',2*m.nA,2*m.nB2,`Volume factor ${f(m.volumeFactor)}`);
  b+=txt(150,313,`PA ${f(m.initial[0])} · PB ${f(m.initial[1])}`,16)+txt(150,340,`Total ${f(m.total1)} kPa`,18);
  b+=txt(490,313,revealed?`PA ${f(m.final[0])} · PB ${f(m.final[1])}`:'Component gauges covered',revealed?16:14)+txt(490,340,revealed?`Total ${f(m.total2)} kPa`:'Total gauge covered',18);
  b+=txt(320,374,revealed?`Each component uses Pi = ni × ${f(m.k2)} kPa/mol.`:'Predict the pressure of A, then compare it with the total.',15);
 }
 b+=txt(320,409,'Dots are amount symbols; no molecular trajectory or real apparatus is simulated.',12);
 return svg(`${c.title}. ${c.fixed} Selected condition ${s.condition} ${c.unit}. ${revealed?m.kind==='state'?`Final pressure ${f(m.P2)} kPa.`:`Final A pressure ${f(m.final[0])} kPa; total ${f(m.total2)} kPa.`:'Final pressures are hidden until the meter is read.'}`,b,'0 0 640 430')+`<p class="exp-caption">${esc(c.fixed)} Ideal, nonreacting gases at equilibrium; no condensation. A and B share the entire volume. ${m.kind==='state'?'Equal-height chamber widths represent volume at a common scale. Eight markers represent the same fixed amount in both states.':'Each mixture dot represents 0.5 mol. Mixture chamber outlines are schematic, not a volume scale.'} No dot is a literal molecule.</p>`;
}
function explanation(c,m){
 if(m.kind==='state')return `The Kelvin factor is ${f(m.temperatureFactor)} and the inverse-volume factor is ${f(m.volumeFactor)}. P2 = ${f(m.P1)} × ${f(m.temperatureFactor)} × ${f(m.volumeFactor)} = ${f(m.P2)} kPa. ${c.control==='C2'?'Adding 273.15 converts each Celsius endpoint; a Celsius ratio would give the wrong comparison.':'The amount is fixed, so the two-state relation applies.'}`;
 return c.control==='nB2'?`PA stays ${f(m.final[0])} kPa because nA, T and V are unchanged. B rises to ${f(m.final[1])} kPa, so total pressure becomes ${f(m.total2)} kPa. A has a smaller mole fraction, but multiplying that fraction by the larger total gives the same PA.`:`Both component amounts stay fixed. Multiplying V by ${f(m.volumeFactor)} divides each partial pressure by that factor: PA = ${f(m.final[0])}, PB = ${f(m.final[1])} kPa. Their sum is ${f(m.total2)} kPa.`;
}
function view(raw){
 const s=normalize(raw),c=GAS_CASES[s.caseIndex],m=gasModel(s.caseIndex,s.condition),complete=s.phase==='done';
 let prompt=m.kind==='state'?'Choose a changed condition, then predict final pressure.':'Choose a changed condition, then predict the pressure of A.',coach='',controls='',primary;
 if(s.phase==='predict'){
  controls=group('Changed condition',c.options.map(v=>button(`${v} ${c.unit}`,'set-condition',String(v),{selected:s.condition===v})).join(''))+group('Pressure prediction',predictions.map(v=>button(v==='unsure'?'I’m not sure yet':v==='same'?'Same pressure':`${v[0].toUpperCase()+v.slice(1)} pressure`,'predict',v,{selected:s.prediction===v})).join(''));
  primary={action:'commit-prediction',label:'Commit prediction and approach gauge',disabled:!s.prediction};
 }else if(s.phase==='observe'){
  prompt='Your prediction is saved. Uncover the modeled gauge.';
  controls=`<p>Your prediction: <strong>${esc(s.prediction)}</strong>. The selected condition is locked for this observation.</p>`;
  primary={action:'read-meter',label:'Uncover component and total readings'};
 }else if(s.phase==='reason'){
  prompt='Compare the meter with your prediction, then explain the change.';
  const opts=m.kind==='state'?['inverse-volume','kelvin-temperature','both-factors','unsure']:['fixed-component','all-components','total-controls-A','unsure'];
  controls=`<p>Your committed prediction: <strong>${esc(s.prediction)}</strong>.</p>`+group('Explanation',opts.map(r=>button(reasonLabels[r],'choose-reason',r,{selected:s.reason===r})).join(''));
  primary={action:'explain',label:'Trace the controlling quantities',disabled:!s.reason};
 }else{
  prompt=complete?'The gas gauges are calibrated.':'Inspect the equation, then change a condition.';
  coach=(s.prediction==='unsure'?'The meter gives a concrete comparison. ':s.prediction===m.expected?'The reading agrees with your prediction. ':'The reading differs from your prediction. ')+explanation(c,m)+(s.reason!==c.reason&&s.reason!=='unsure'?' Compare your explanation with the held variables; more than one quantity may change.':'');
  controls=`<p>Your original prediction: <strong>${esc(s.prediction)}</strong>. Your explanation: ${esc(reasonLabels[s.reason])}</p>`;
  if(!complete)controls+=button('Try a different condition here','change-condition');
  else controls+='<p>This completes instruction only. Independent checkpoint and later review evidence are separate.</p>';
  primary=complete?{action:'reset',label:'Explore the observatory again'}:{action:'next',label:s.caseIndex<GAS_CASES.length-1?'Move to the next instrument':'Complete this discovery'};
 }
 if(s.help&&!coach)coach=m.kind==='state'?'Start from PV = nRT. Convert to Kelvin and mark which quantities are fixed. Compare the two temperature values separately from the two volumes.':'Track A separately: PA = nART/V. Then track B. Their pressures add, while both gases share the entire container.';
 controls+=group('Observatory tools',button(s.help?'Close clue':'Ask the gauge keeper','help','',{selected:s.help})+button('Restart discovery','reset'));
 return {activeObjectiveIds:[c.objective],scene:scene(s),prompt,coach,controls,primary,progress:{current:s.caseIndex+1,total:GAS_CASES.length,label:`Instrument ${s.caseIndex+1} of ${GAS_CASES.length} · ${s.phase}`},complete};
}
export const GASES_ACTIVITY=Object.freeze({id:'gc-gas-control-room',title:'The Gas Control Room',world:'gc',objectiveIds:['gc-gas-state-relations','gc-gas-partial-pressure'],version:1,sourceUrls:['https://openstax.org/books/chemistry-2e/pages/9-2-relating-pressure-volume-amount-and-temperature-the-ideal-gas-law','https://openstax.org/books/chemistry-2e/pages/9-3-stoichiometry-of-gaseous-substances-mixtures-and-reactions'],familiarFamilyIds:['gc-gas-kelvin-ratio','gc-gas-combined-state','gc-gas-fixed-amount-condition','gc-gas-component-inventory','gc-gas-fixed-volume-addition'],instructionFamilies:['discovery-gc-gas-control-room','gc-gas-kelvin-ratio','gc-gas-combined-state','gc-gas-fixed-amount-condition','gc-gas-component-inventory','gc-gas-fixed-volume-addition'],initial,normalize,reduce,view});
export default GASES_ACTIVITY;
