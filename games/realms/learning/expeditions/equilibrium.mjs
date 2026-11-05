// Original, bounded instructional reactor. Supplied elementary rate laws are
// assumptions of this model, never inferred from an arbitrary overall equation.
import {button,esc,group,svg} from './shared.mjs';

const freeze=value=>{if(value&&typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}return value;};
const SOURCE={
 balance:'https://openstax.org/books/chemistry-2e/pages/13-1-chemical-equilibria',
 quotient:'https://openstax.org/books/chemistry-2e/pages/13-2-equilibrium-constants',
 disturbance:'https://openstax.org/books/chemistry-2e/pages/13-3-shifting-equilibria-le-chateliers-principle',
 elementary:'https://openstax.org/books/chemistry-2e/pages/12-6-reaction-mechanisms'
};
export const EQUILIBRIUM_CASES=freeze([
 {id:'charge',title:'Wake the balance engine',a:.9,b:.3,factor:1,change:'Load the vessel, predict, then seal it. You may change this first charge before running it.',reason:'balance'},
 {id:'equal-levels',title:'The equal-level trap',a:.6,b:.6,factor:1,change:'A fresh charge has equal concentrations. Does that alone mean equilibrium?',reason:'rates'},
 {id:'reverse',title:'A product-heavy charge',a:.15,b:1.05,factor:1,change:'The same reactor and temperature; only the starting mixture changes.',reason:'quotient'},
 {id:'withdrawal',title:'The missing product',a:.4,b:.8,afterB:.5,factor:1,change:'Start at equilibrium. Withdraw 0.30 mol of B, then close the 1.00 L vessel again at the original temperature and volume.',reason:'inventory'},
 {id:'catalyst',title:'A faster balance',a:.4,b:.8,factor:2,change:'Start at equilibrium. Install the specified catalyst without adding or removing A or B, changing temperature, or changing volume.',reason:'catalyst'}
]);
const SAMPLES=Object.freeze([0,2,8,null]); // null is the mathematical equilibrium limit, not a finite-time measurement.
const PREDICTIONS=Object.freeze(['forward','reverse','balanced','stopped','unsure']);
const REASONS={
 balance:[['rates','Equal forward and reverse rates'],['amounts','Equal concentrations of A and B'],['stopped','Both reactions have stopped']],
 rates:[['faster','A → B was initially faster because its supplied rate coefficient is larger'],['same','Equal concentrations always give equal opposing rates'],['change-k','K changed when I loaded equal amounts']],
 quotient:[['above','The starting B/A ratio was above K, so net B → A lowered it'],['below','Any positive Q means net A → B'],['all-b','All B must disappear before the reaction balances']],
 inventory:[['ratio','The equilibrium ratio returns; the removed inventory does not'],['amounts','Both original concentrations must return exactly'],['constant','K falls to match the depleted mixture']],
 catalyst:[['both','Both opposing rates increase; K and the equilibrium composition stay'],['forward','Only A → B becomes faster, so B accumulates'],['constant','The catalyst increases K']]
};
const CORRECT_REASON={balance:'rates',rates:'faster',quotient:'above',inventory:'ratio',catalyst:'both'};
const REASON_PROMPTS={balance:'Which observation defines dynamic equilibrium?',rates:'Why did equal starting concentrations still produce net change?',quotient:'Which comparison explains the initial reverse direction?',inventory:'What must return after some B is removed?',catalyst:'What changed when this catalyst was installed at equilibrium?'};
const number=x=>Number(x.toFixed(4)).toString();

/** Exact solution of d[A]/dt = -kf[A] + kr[B], with [A]+[B] conserved.
 * This is an ideal, well-mixed, closed, isothermal, fixed-volume A ⇌ B model.
 * rateFactor scales BOTH supplied first-order rate coefficients.
 */
export function reactorModel({a,b,time=0,rateFactor=1}){
 if(![a,b,rateFactor].every(Number.isFinite)||a<=0||b<=0||a>3||b>3||rateFactor<1||rateFactor>4||!(time===null||Number.isFinite(time)&&time>=0&&time<=1e6))throw new RangeError('Use positive finite teaching concentrations and a supported sample time.');
 const forwardCoefficient=.2*rateFactor,reverseCoefficient=.1*rateFactor,total=a+b;
 const targetA=total/3,targetB=total-targetA;
 const currentA=time===null?targetA:targetA+(a-targetA)*Math.exp(-(forwardCoefficient+reverseCoefficient)*time);
 const currentB=total-currentA;
 const forwardRate=forwardCoefficient*currentA,reverseRate=reverseCoefficient*currentB,quotient=currentB/currentA;
 const initialDifference=.2*a-.1*b;
 return {a:currentA,b:currentB,total,k:2,quotient,forwardCoefficient,reverseCoefficient,forwardRate,reverseRate,netRate:forwardRate-reverseRate,
  targetA,targetB,time,equilibriumLimit:time===null,initialDirection:Math.abs(initialDifference)<1e-12?'balanced':initialDifference>0?'forward':'reverse'};
}
const initial=()=>({version:1,caseIndex:0,phase:'predict',loadA:6,loadB:2,prediction:null,sampleIndex:0,replayFactor:1,reason:null,help:false});
const plain=x=>x&&typeof x==='object'&&!Array.isArray(x);
function normalize(raw){
 const s=initial();if(!plain(raw))return s;
 if(Number.isInteger(raw.caseIndex)&&raw.caseIndex>=0&&raw.caseIndex<EQUILIBRIUM_CASES.length)s.caseIndex=raw.caseIndex;
 s.help=raw.help===true;
 if(s.caseIndex===0){s.loadA=Number.isInteger(raw.loadA)&&raw.loadA>=1&&raw.loadA<=10?raw.loadA:6;s.loadB=Number.isInteger(raw.loadB)&&raw.loadB>=1&&raw.loadB<=10?raw.loadB:2;}
 if(PREDICTIONS.includes(raw.prediction))s.prediction=raw.prediction;
 if(s.prediction&&['observe','reason','explained','complete'].includes(raw.phase)){
  s.phase=raw.phase;s.sampleIndex=Number.isInteger(raw.sampleIndex)&&raw.sampleIndex>=0&&raw.sampleIndex<=3?raw.sampleIndex:0;
  if(s.caseIndex!==4&&raw.replayFactor===2)s.replayFactor=2;
  if(s.phase!=='observe')s.sampleIndex=3;
  const choices=REASONS[EQUILIBRIUM_CASES[s.caseIndex].reason];if(choices.some(([id])=>id===raw.reason))s.reason=raw.reason;
  if(['explained','complete'].includes(s.phase)&&!s.reason)s.phase='reason';
  if(s.phase==='complete'&&s.caseIndex!==EQUILIBRIUM_CASES.length-1)s.phase='explained';
 }
 return s;
}
function reduce(raw,action,value){
 const s=normalize(raw),c=EQUILIBRIUM_CASES[s.caseIndex];
 if(action==='restart')return initial();
 if(action==='retry')return {...initial(),caseIndex:s.caseIndex};
 if(action==='help')return {...s,help:!s.help};
 if(s.phase==='predict'){
  if(['load-a','load-b'].includes(action)&&s.caseIndex===0&&['plus','minus'].includes(value)){
   const key=action==='load-a'?'loadA':'loadB',next=Math.max(1,Math.min(10,s[key]+(value==='plus'?1:-1)));
   return next===s[key]?s:{...s,[key]:next,prediction:null};
  }
  if(action==='predict'&&PREDICTIONS.includes(value))return {...s,prediction:value};
  if(action==='commit'&&s.prediction)return {...s,phase:'observe'};
 }
 if(s.phase==='observe'){
  if(action==='sample'&&['0','1','2','3'].includes(value))return {...s,sampleIndex:Number(value)};
  if(action==='advance'&&s.sampleIndex<3)return {...s,sampleIndex:s.sampleIndex+1};
  if(action==='replay'&&s.caseIndex!==4&&['1','2'].includes(value))return {...s,replayFactor:Number(value),sampleIndex:0};
  if(action==='reason'&&s.sampleIndex===3)return {...s,phase:'reason'};
 }
 if(s.phase==='reason'){
  if(action==='choose-reason'&&REASONS[c.reason].some(([id])=>id===value))return {...s,reason:value};
  if(action==='commit-reason'&&s.reason)return {...s,phase:'explained'};
 }
 if(action==='next'&&s.phase==='explained')return s.caseIndex<EQUILIBRIUM_CASES.length-1?{...initial(),caseIndex:s.caseIndex+1}:{...s,phase:'complete'};
 return s;
}
function charge(s){const c=EQUILIBRIUM_CASES[s.caseIndex];return {a:s.caseIndex===0?s.loadA*.15:c.a,b:s.caseIndex===0?s.loadB*.15:c.afterB??c.b,rateFactor:c.factor*s.replayFactor};}
export function equilibriumObservation(raw){const s=normalize(raw);return reactorModel({...charge(s),time:SAMPLES[s.sampleIndex]});}
const text=(x,y,value,size=17,extra='')=>`<text x="${x}" y="${y}" font-size="${size}" fill="#203e38" ${extra}>${esc(value)}</text>`;
function arrow(x1,x2,y,width,color,attribute){const direction=x2>x1?1:-1,base=x2-direction*13;return `<path d="M${x1} ${y}H${base}" stroke="${color}" stroke-width="${Math.max(2,width)}" fill="none" data-rate="${attribute}"/><path d="M${x2} ${y}L${base} ${y-8}V${y+8}Z" fill="${color}"/>`;}
function scene(raw){
 const s=normalize(raw),c=EQUILIBRIUM_CASES[s.caseIndex],revealed=s.phase!=='predict';
 const before={a:s.caseIndex===0?s.loadA*.15:c.a,b:s.caseIndex===0?s.loadB*.15:c.b};
 const model=revealed?equilibriumObservation(s):reactorModel({...before,time:0});
 const width=410,total=model.total,aWidth=width*model.a/total,bWidth=width-aWidth;
 const header=revealed?(model.equilibriumLimit?'Equilibrium limit · not a finite-time sample':`Sample ${model.time} s after the closed run begins`):s.caseIndex===3||s.caseIndex===4?'Before the planned change':'Reactor charge · before sealing';
 const initial=reactorModel({...charge(s),time:0}),rateScale=Math.max(initial.forwardRate,initial.reverseRate,.05);
 let picture=`<rect width="640" height="400" rx="22" fill="#faf3de"/><rect x="20" y="18" width="600" height="365" rx="18" fill="none" stroke="#b69c6c" stroke-width="2"/>${text(320,48,'Chatelle’s balance engine',22,'text-anchor="middle"')}${text(320,77,header,15,'text-anchor="middle"')}${text(320,111,'A ⇌ B · one well-mixed 1.00 L vessel',19,'text-anchor="middle"')}<rect x="110" y="133" width="420" height="68" rx="11" fill="#203e38"/><rect x="115" y="138" width="${aWidth}" height="58" fill="#d99a54"/><rect x="${115+aWidth}" y="138" width="${bWidth}" height="58" fill="#4b9688"/>${text(115,229,`A: ${number(model.a)} M`,18)}${text(525,229,`B: ${number(model.b)} M`,18,'text-anchor="end"')}${text(320,256,`Total A + B: ${number(total)} M`,15,'text-anchor="middle"')}`;
 if(revealed){picture+=arrow(145,485,290,12*model.forwardRate/rateScale,'#a85a28','forward')+arrow(485,145,338,12*model.reverseRate/rateScale,'#317e76','reverse')+text(320,281,`A → B: ${number(model.forwardRate)} M/s`,16,'text-anchor="middle"')+text(320,367,`B → A: ${number(model.reverseRate)} M/s`,16,'text-anchor="middle"');}
 else picture+=text(320,302,'Choose a prediction before opening the rate meters.',16,'text-anchor="middle"')+text(320,341,'K = 2 at this fixed temperature · Q = [B]/[A]',17,'text-anchor="middle"');
 const label=`${header}. One well-mixed vessel has ${number(model.a)} M A and ${number(model.b)} M B.${revealed?` Forward rate ${number(model.forwardRate)} M/s; reverse rate ${number(model.reverseRate)} M/s.`:''}`;
 return svg(label,picture,'0 0 640 400')+`<p class="exp-caption">The colored inventory bar shows proportions of A and B in one mixture, not separate liquid layers. A and B are two interconverting forms; each conversion preserves one unit of material. Orange is A; teal is B. Use the numeric labels for exact readings.</p>`+(revealed?`<p class="exp-case-givens"><strong>Q now = [B]/[A] = ${number(model.b)} / ${number(model.a)} ≈ ${number(model.quotient)}.</strong> K remains 2. Readouts round to four decimal places; the internal model is not rounded.</p>`:'');
}
function predictionFeedback(s){
 const c=EQUILIBRIUM_CASES[s.caseIndex],m=reactorModel({...charge(s),time:0}),actual=m.initialDirection;
 const labels={forward:'net A → B',reverse:'net B → A',balanced:'no net change, with both reactions continuing',stopped:'both reactions stop',unsure:'not sure yet'};
 const start=s.prediction==='unsure'?'You chose to investigate before deciding.':`You predicted ${labels[s.prediction]}.`;
 const ratio=` The post-change starting Q is ${number(m.b)}/${number(m.a)} ≈ ${number(m.quotient)}; K is 2.`;
 const result=actual==='forward'?' Q is below K. Net A → B increases B/A toward the target.':actual==='reverse'?' Q is above K. Net B → A decreases B/A toward the target.':' Q equals K. The opposing rates match and remain nonzero; there is no net change.';
 const trap=s.prediction==='stopped'?' Equilibrium does not stop molecular conversion.':c.id==='equal-levels'?' Equal concentrations are not the same as equal rates: this model supplies a larger coefficient for A → B.':c.id==='withdrawal'?' Withdrawal changes the total inventory. Re-establishing the ratio cannot restore all removed material.':c.id==='catalyst'?' This specified catalyst doubles both supplied coefficients. It does not change their ratio or K.':'';
 return start+ratio+result+trap;
}
function explanation(s){
 const c=EQUILIBRIUM_CASES[s.caseIndex],m=reactorModel({...charge(s),time:null}),wrong=s.reason!==CORRECT_REASON[c.reason];
 const answer={
  balance:`At the limit, the two rates are both ${number(m.forwardRate)} M/s. A is ${number(m.a)} M and B is ${number(m.b)} M: unequal concentrations can maintain equal rates.`,
  rates:'Equal concentrations gave unequal initial rates because the supplied coefficients differ. Balance needs 0.20[A] = 0.10[B], which requires [B] = 2[A]. A balanced equation alone does not supply these rate laws.',
  quotient:'The starting ratio exceeded the equilibrium target. Reverse conversion lowered B and raised A until B/A approached 2; neither substance needed to vanish.',
  inventory:'Before withdrawal there was 1.20 M total; afterward there is 0.90 M total. The new equilibrium is 0.30 M A and 0.60 M B. Some B is replenished, but the original 0.80 M B is not restored.',
  catalyst:'Before the catalyst, both rates were 0.08 M/s. Afterward, both are 0.16 M/s. A stays 0.40 M, B stays 0.80 M, and K stays 2. Faster opposing reactions can balance at unchanged concentrations.'
 }[c.reason];
 return (wrong?'Revisit the evidence: ':'Your explanation matches this model: ')+answer;
}
function view(raw){
 const s=normalize(raw),c=EQUILIBRIUM_CASES[s.caseIndex],revealed=s.phase!=='predict',done=s.phase==='complete';
 const catalystTaught=s.caseIndex===4||s.phase==='observe'||s.replayFactor===2;
 let prompt='Predict the net reaction after the vessel is sealed.',coach='',controls='',primary={action:'commit',label:'Seal the reactor and test my prediction',disabled:!s.prediction};
 const definitions=`<p class="exp-case-givens"><strong>${esc(c.title)}.</strong> ${esc(c.change)}</p><p>A reversible reaction can run in both directions. <strong>Q</strong> is the mixture’s current B/A ratio; <strong>K = 2</strong> is the equilibrium ratio for this reaction at this temperature. “Net” compares the two opposing rates.</p>`;
 if(s.phase==='predict'){
  if(s.caseIndex===0)controls+=group('Load the unsealed reactor',button('Add 0.15 mol A','load-a','plus',{disabled:s.loadA===10})+button('Remove 0.15 mol A','load-a','minus',{disabled:s.loadA===1})+button('Add 0.15 mol B','load-b','plus',{disabled:s.loadB===10})+button('Remove 0.15 mol B','load-b','minus',{disabled:s.loadB===1}))+`<p class="exp-note">Prepare the charge at a final volume of 1.00 L. Changing it clears your prediction. Once sealed, A + B is conserved.</p>`;
  if(s.caseIndex===3)prompt='Predict the net reaction after the specified B withdrawal and resealing.';
  if(s.caseIndex===4)prompt='Predict what happens when the specified catalyst is installed at equilibrium.';
  controls+=group('Predict the net direction',[
   ['forward','Net A → B'],['reverse','Net B → A'],['balanced','No net change; both reactions continue'],['stopped','Both reactions stop'],['unsure','I’m not sure yet']
  ].map(([id,label])=>button(label,'predict',id,{selected:s.prediction===id})).join(''));
  if(s.help)coach='Use the mixture after the announced change. Divide B by A and compare the result with 2. Below the target, increasing B relative to A raises Q; above it, decreasing B relative to A lowers Q. Equal opposing rates do not require equal amounts.';
  if(s.caseIndex===3)primary.label='Withdraw B, reseal, and read the meters';if(s.caseIndex===4)primary.label='Install the catalyst and read both meters';
 }else if(s.phase==='observe'){
  prompt='Inspect the two opposing rates, then trace the same run toward equilibrium.';coach=predictionFeedback(s);
  controls+=group('Sample the closed run',SAMPLES.map((time,i)=>button(time===null?'Inspect equilibrium limit':`Inspect ${time} s`,'sample',String(i),{selected:s.sampleIndex===i})).join(''));
  if(s.caseIndex!==4)controls+=group('Compare identical starting charges',button('Replay original coefficients','replay','1',{selected:s.replayFactor===1})+button('Replay with the specified catalyst','replay','2',{selected:s.replayFactor===2}))+`<p class="exp-note">Replay restarts the same charge from time zero. The specified catalyst doubles both rate coefficients. At the same composition, both rates double; as a run proceeds, its composition also changes. This is not a mid-run change, and K stays fixed.</p>`;
  primary=s.sampleIndex<3?{action:'advance',label:s.sampleIndex===2?'Inspect the equilibrium limit':`Take the ${SAMPLES[s.sampleIndex+1]} s sample`}:{action:'reason',label:'Explain what the meters show'};
 }else if(s.phase==='reason'){
  prompt=REASON_PROMPTS[c.reason];coach=s.help?'Compare the exact rates, the B/A ratio and total inventory. “Equal rates,” “equal concentrations,” and “stopped reactions” are different claims.':'';
  controls+=group('Explain from the observed evidence',REASONS[c.reason].map(([id,label])=>button(label,'choose-reason',id,{selected:s.reason===id})).join(''));
  primary={action:'commit-reason',label:'Check my explanation',disabled:!s.reason};
 }else{
  prompt=done?'Five reactor investigations complete. Use a different question to check what transfers.':'Connect the result to your next reactor charge.';coach=explanation(s);
  primary=done?{action:'restart',label:'Investigate another charge'}:{action:'next',label:s.caseIndex===4?'Complete the balance-engine discovery':'Try the next reactor condition'};
 }
 controls=definitions+controls+group('Workbench tools',button(s.help?'Put the clue away':'Ask Chatelle for a clue','help','',{selected:s.help})+button('Restart this condition','retry')+button('Restart all five conditions','restart'));
 controls+=`<p class="exp-note">Model contract: an ideal, well-mixed, closed vessel at fixed temperature and volume after each announced intervention. A ⇌ B has supplied first-order rates 0.20[A] and 0.10[B] M/s; the rate coefficients have units s⁻¹.${catalystTaught?' The specified catalyst multiplies both coefficients by 2.':''} These are original illustrative assumptions, not rates inferred from every A ⇌ B equation. The equilibrium limit represents indefinite time. This activity awards no score or mastery.</p>`;
 return {activeObjectiveIds:catalystTaught?['gc-equilibrium','gc-catalyst']:['gc-equilibrium'],scene:scene(s),prompt,coach,controls,primary,progress:{current:done?5:s.caseIndex+1,total:5,label:`Reactor ${s.caseIndex+1}/5 · ${s.phase}`},complete:done};
}
const familiarFamilyIds=Object.freeze(['gc-dynamic-equilibrium','gc-quotient-direction','gc-equilibrium-removal','gc-catalyst-equilibrium','gc-catalyst-observation']);
export const EQUILIBRIUM_ACTIVITIES=Object.freeze([
 // Fresh numerical examples do not create fresh assessment families. These
 // aliases explicitly mark familiar skills, including the two later-pool cases.
 Object.freeze({id:'gc-equilibrium-lock',title:'Chatelle’s Balance Engine',world:'gc',objectiveIds:['gc-equilibrium','gc-catalyst'],version:1,sourceUrls:Object.values(SOURCE),familiarFamilyIds,instructionFamilies:['gc-discovery-original-first-order-reactor','gc-discovery-original-withdrawal-and-rate-replay',...familiarFamilyIds],initial,normalize,reduce,view})
]);
