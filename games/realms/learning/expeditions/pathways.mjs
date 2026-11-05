import {button,esc,group,svg} from './shared.mjs';
const freeze=x=>{if(x&&typeof x==='object'){Object.values(x).forEach(freeze);Object.freeze(x);}return x;};
export function betaHydrogenSites({edges,hydrogens,alpha}){
 if(!Array.isArray(edges)||!hydrogens||typeof hydrogens!=='object'||!Number.isInteger(alpha))throw new TypeError('An explicit carbon graph, hydrogen counts and alpha carbon are required.');
 const ids=Object.keys(hydrogens).map(Number),neighbors=new Map(ids.map(id=>[id,new Set()]));
 if(ids.some(id=>!Number.isInteger(id)||id<1||!Number.isInteger(hydrogens[id])||hydrogens[id]<0)||!neighbors.has(alpha))throw new TypeError('Invalid carbon or hydrogen inventory.');
 for(const edge of edges){if(!Array.isArray(edge)||edge.length!==2)throw new TypeError('A carbon bond needs two endpoints.');const[a,b]=edge;if(a===b||!neighbors.has(a)||!neighbors.has(b)||neighbors.get(a).has(b))throw new TypeError('Invalid or repeated carbon bond.');neighbors.get(a).add(b);neighbors.get(b).add(a);}
 for(const id of ids)if(neighbors.get(id).size+hydrogens[id]+(id===alpha?1:0)!==4)throw new RangeError('Each saturated carbon must have four bonds, including the alpha leaving group.');
 return [...neighbors.get(alpha)].filter(id=>hydrogens[id]>0).sort((a,b)=>a-b);
}
export function compatiblePathways({product='unknown',substrateOrder,reagentOrder}){
 if(!['unknown','substitution','elimination'].includes(product)||substrateOrder!==1||![0,1].includes(reagentOrder))return [];
 const mechanisms=reagentOrder===0?['SN1','E1']:['SN2','E2'];
 return mechanisms.filter(m=>product==='unknown'||(product==='substitution'?m.startsWith('SN'):m.startsWith('E')));
}
export const PATHWAY_CASES=freeze([
 {id:'bond-fates',objective:'oc-pathways-bond-fates',title:'Follow the disappearing bonds',kind:'bonds',prompt:'A specified strong-base route converts CH₃–CHBr–CH₃ to CH₂=CH–CH₃. Predict the net reaction class before tracing the bonds.',choices:[['elimination','Beta elimination'],['substitution','Substitution'],['fragmentation','Carbon-chain fragmentation']],expected:'elimination',reasons:[['adjacent','A beta C–H and the alpha C–Br break while their C–C becomes double.'],['replacement','An incoming group replaces Br with no new C=C.']],reason:'adjacent',clue:'Alpha is the carbon bearing Br. A beta carbon is directly attached to alpha. A base accepts a proton; a nucleophile attacks carbon. The roles can compete.',observation:'C2 loses Br; C1 loses H; C1–C2 changes from single to double. All three carbons remain.',explanation:'This is beta elimination. In the specified E2 event these changes happen together. The base accepts the beta proton instead of installing a group at alpha. The flat formula shows connectivity only; an accessible anti arrangement is supplied.',feedback:{substitution:'Substitution would install an incoming group at C2; the observed change instead makes C1=C2.',fragmentation:'Count the carbons before and after: all three remain, so no carbon fragment was lost.'}},
 {id:'beta-gate',objective:'oc-pathways-bond-fates',title:'Check the adjacent carbon',kind:'beta',prompt:'For BrCH₂–C(CH₃)₃, Team Entropy points to a terminal CH₃ hydrogen and proposes direct E2. Predict whether the required beta C–H is present.',choices:[['missing','No beta C–H is present'],['present','A terminal CH₃ supplies a beta C–H'],['alpha','The BrCH₂ hydrogens count as beta']],expected:'missing',reasons:[['adjacency','Only the central carbon neighbors alpha, and it has four C–C bonds.'],['anywhere','Any hydrogen anywhere can be removed in beta elimination.']],reason:'adjacency',clue:'Start at CH₂Br, then move exactly one C–C bond. Primary or tertiary describes the carbon carrying the leaving group, not every neighbor.',observation:'Alpha = CH₂Br. Its only beta neighbor is C bonded to alpha and three CH₃ groups: zero hydrogens.',explanation:'The central beta carbon already has four carbon bonds. Alpha hydrogens are on the wrong carbon; terminal methyl hydrogens are farther away. Direct beta E2 is unavailable. This does not say that no other chemistry can ever occur.',feedback:{present:'The terminal methyl groups are two carbon bonds from alpha, so their hydrogens are not beta.',alpha:'A hydrogen on the Br-bearing carbon is alpha; beta elimination requires a neighboring carbon’s hydrogen.'}},
 {id:'branching',objective:'oc-pathways-evidence',title:'One slow gate, two product trails',kind:'branches',prompt:'A tertiary chloride in warm aqueous ethanol undergoes the stated slow ionization. Both an alcohol and an alkene are detected. Predict which branches can share rate = k[RX].',choices:[['both','SN1 and E1 branches'],['sn1','Only SN1'],['e1','Only E1']],expected:'both',reasons:[['shared','Both products can follow the same slow carbocation-forming step.'],['one-product','A first-order disappearance rate requires a single product.']],reason:'shared',clue:'SN1 capture replaces the leaving group. E1 loses a beta proton after ionization. Water/alcohol can trap a carbocation without appearing in the stated slow-step law.',observation:'After the common ionization: solvent capture can lead to alcohol; beta-proton loss can lead to alkene. No branch fractions are supplied.',explanation:'The rate law describes the shared slow gate, not which fast exit is taken. SN1 and E1 can compete. Neither a first-order rate nor the word warm specifies a product ratio. Ordinary backside SN2 is obstructed at this tertiary center.',feedback:{sn1:'SN1 explains alcohol, but the detected alkene has an E1 route after the same ionization.',e1:'E1 explains alkene, but solvent capture can also give the detected alcohol through SN1.'}},
 {id:'joint-evidence',objective:'oc-pathways-evidence',title:'Open the rate evidence',kind:'rates',prompt:'A tertiary bromide with ethoxide in fixed ethanol forms an alkene. Predict E1 or E2 before opening the controlled rate comparison; “not sure” is useful when evidence is incomplete.',choices:[['E1','E1'],['E2','E2'],['SN2','SN2']],expected:'E2',reasons:[['both-reactants','Alkene formation and independent dependence on base and substrate support E2.'],['solvent-only','Ethanol alone proves the mechanism.']],reason:'both-reactants',clue:'SN2 and E2 each have a reagent factor in their elementary rate law. E1 and SN1 share slow ionization. Product identity and rate evidence must be combined.',observation:'Fixed temperature and solvent: doubling RX alone doubles initial alkene formation rate; doubling base alone also doubles it.',explanation:'The alkene identifies elimination; both concentration dependencies support the bimolecular E2 model. The tertiary center also obstructs ordinary SN2. Strong base favors E2 here, but the observed controlled rate evidence, not solvent name alone, makes this bounded comparison.',feedback:{E1:'The simple E1 slow-ionization model would not contain the independently varied base factor.',SN2:'The observed product is an alkene, and this tertiary center obstructs backside SN2.'}},
 {id:'missing-product',objective:'oc-pathways-evidence',title:'Refuse an unsupported label',kind:'unknown',prompt:'For a secondary alkyl halide, a reagent can act as nucleophile or base. Controlled kinetics give k[RX][reagent], but product identities are hidden. Predict how specific the label can be.',choices:[['pair','SN2 or E2 remain consistent'],['SN2','SN2 is established'],['E2','E2 is established']],expected:'pair',reasons:[['product-needed','Both models fit this rate form; the product tells substitution from elimination.'],['rate-is-product','The rate equation already shows every product bond.']],reason:'product-needed',clue:'A rate law describes concentration dependence. It does not draw the new C–Nu bond or the new C=C bond.',observation:'SN2: rate k[RX][Nu], substitution. E2: rate k[RX][base], elimination. The supplied rate form matches both.',explanation:'Keep both models pending product evidence. Even observing an alkene alone would not separate E1 from E2 without additional evidence. Controlled temperature and medium matter because changing them can change k and pathway competition.',feedback:{SN2:'E2 has the same substrate-and-reagent rate form; substitution was never observed.',E2:'SN2 has the same substrate-and-reagent rate form; an alkene was never observed.'}}
]);
const choicesFor=c=>[...c.choices,['unsure','I’m not sure yet']];
const reasonsFor=c=>[...c.reasons,['unsure','I’m not sure yet']];
const validPrediction=(i,x)=>choicesFor(PATHWAY_CASES[i]).some(([k])=>k===x);
const validReason=(i,x)=>reasonsFor(PATHWAY_CASES[i]).some(([k])=>k===x);
const initial=()=>({caseIndex:0,phase:'predict',prediction:'',reason:'',help:false,records:[]});
function normalize(raw){
 const s=initial();if(!raw||typeof raw!=='object'||Array.isArray(raw))return s;
 // Only a sequential prefix is accepted. A supplied caseIndex cannot jump over uncompleted cases.
 for(const row of Array.isArray(raw.records)?raw.records:[]){
  const i=s.records.length;if(i>=PATHWAY_CASES.length||!row||row.caseIndex!==i||!validPrediction(i,row.prediction))break;
  const observed=row.observed===true,reason=observed&&validReason(i,row.reason)?row.reason:'',completed=!!reason&&row.completed===true;
  s.records.push({caseIndex:i,prediction:row.prediction,observed,reason,completed});if(!completed)break;
 }
 const firstUnfinished=s.records.findIndex(r=>!r.completed),maxIndex=firstUnfinished>=0?firstUnfinished:Math.min(s.records.length,PATHWAY_CASES.length-1);
 s.caseIndex=Number.isInteger(raw.caseIndex)&&raw.caseIndex>=0?Math.min(raw.caseIndex,maxIndex):0;s.help=raw.help===true;
 const r=s.records[s.caseIndex];
 if(r){s.prediction=r.prediction;s.reason=r.reason||(r.observed&&validReason(s.caseIndex,raw.reason)?raw.reason:'');s.phase=r.completed?'explained':r.observed?'reason':'observe';}
 else if(validPrediction(s.caseIndex,raw.prediction))s.prediction=raw.prediction;
 if(raw.phase==='done'&&s.caseIndex===PATHWAY_CASES.length-1&&s.records.length===PATHWAY_CASES.length&&s.records.every(r=>r.completed))s.phase='done';
 return s;
}
const patchRecord=(s,patch)=>s.records.map(r=>r.caseIndex===s.caseIndex?{...r,...patch}:r);
function reduce(raw,action,value){
 const s=normalize(raw);
 if(action==='help')return {...s,help:!s.help};
 if(action==='reset')return normalize({...s,caseIndex:0,phase:'predict',prediction:'',reason:'',help:false});
 if(action==='predict'&&s.phase==='predict'&&validPrediction(s.caseIndex,value))return {...s,prediction:value};
 if(action==='commit-prediction'&&s.phase==='predict'&&s.prediction)return normalize({...s,records:[...s.records,{caseIndex:s.caseIndex,prediction:s.prediction,observed:false,reason:'',completed:false}]});
 if(action==='observe'&&s.phase==='observe')return normalize({...s,records:patchRecord(s,{observed:true})});
 if(action==='choose-reason'&&s.phase==='reason'&&validReason(s.caseIndex,value))return {...s,reason:value};
 if(action==='explain'&&s.phase==='reason'&&s.reason)return normalize({...s,records:patchRecord(s,{reason:s.reason,completed:true})});
 if(action==='next'&&s.phase==='explained')return normalize(s.caseIndex===PATHWAY_CASES.length-1?{...s,phase:'done'}:{...s,caseIndex:s.caseIndex+1,phase:'predict',prediction:'',reason:'',help:false});
 return s;
}
const text=(x,y,label,size=18)=>`<text x="${x}" y="${y}" text-anchor="middle" fill="#302c45" font-size="${size}">${esc(label)}</text>`;
const box=(x,y,w,h,fill='#ede4f6')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="16" fill="${fill}" stroke="#8e76ae"/>`;
function scene(c,observed){
 let b='<rect width="640" height="390" rx="22" fill="#f7f1fb"/>'+text(320,35,c.title,23);
 if(c.kind==='bonds'){
  b+=box(35,62,570,100)+text(200,98,'CH₃',25)+text(320,98,'CH(Br)',25)+text(440,98,'CH₃',25);
  b+='<path d="M230 90H266 M374 90H410" fill="none" stroke="#514467" stroke-width="3"/>';
  b+=text(200,136,'C1',16)+text(320,136,'C2',16)+text(440,136,'C3',16);
  b+=box(35,186,570,110)+text(320,228,'CH₂=CH-CH₃',26)+text(320,267,'Observed product: propene',17);
  if(observed)b+=text(320,331,'C1–H breaks · C2–Br breaks · C1–C2 becomes double',16);
  else b+=text(320,331,'Trace the three-carbon skeleton before revealing the bond ledger.',15);
 }else if(c.kind==='beta'){
  b+=text(320,92,'CH₃',24)+text(165,182,'Br-CH₂',24)+text(320,182,'C',25)+text(475,182,'CH₃',24)+text(320,278,'CH₃',24);
  b+='<path d="M230 174H296 M344 174H435 M320 148V107 M320 194V250" fill="none" stroke="#514467" stroke-width="3"/>';
  b+=text(165,218,'alpha',16)+text(320,312,'All drawn bonds are single; condensed groups include H counts.',14);
  if(observed)b+=text(320,349,'The central beta C has four C–C bonds and zero C–H bonds.',16);
  else b+=text(320,349,'Move exactly one carbon bond from alpha.',16);
 }else if(c.kind==='branches'){
  b+=box(170,62,300,67)+text(320,90,'RX → R⁺ + X⁻',24)+text(320,116,'Stated slow ionization',15);
  b+='<path d="M320 130V158L166 197 M320 158L474 197" fill="none" stroke="#6d5589" stroke-width="3"/>';
  b+=box(30,199,270,112)+box(340,199,270,112)+text(165,232,observed?'Solvent capture':'Alcohol detected',20)+text(475,232,observed?'Beta-proton loss':'Alkene detected',20);
  if(observed)b+=text(165,275,'SN1 branch',21)+text(475,275,'E1 branch',21);
  b+=text(320,351,'The shared disappearance law supplies no product fraction.',15);
 }else if(c.kind==='rates'){
  b+=text(320,78,'Tertiary bromide + ethoxide → alkene',20)+text(320,107,'Same temperature and solvent in every trial',16);
  const rows=observed?[['Reference','1× RX','1× base','1× rate'],['RX varied','2× RX','1× base','2× rate'],['Base varied','1× RX','2× base','2× rate']]:[['Controlled rate comparison','Covered until observation']];
  rows.forEach((r,i)=>{b+=box(35,136+i*53,570,44,i%2?'#e7edf4':'#eee5f6');if(observed)r.forEach((t,j)=>b+=text(110+j*143,165+i*53,t,16));else b+=text(320,165+i*53,r.join(' · '),15);});
  b+=text(320,342,'These supplied relative rates are a teaching model, not a yield report.',14);
 }else{
  b+=text(320,93,'Supplied rate: k[RX][reagent]',26)+text(320,132,'Secondary carbon · reagent can act as nucleophile or base',16);
  b+=box(45,169,550,110)+text(320,205,observed?'SN2: substitution · k[RX][Nu]':'Product identities are hidden',22);
  if(observed)b+=text(320,250,'E2: elimination · k[RX][base]',22);else b+=text(320,250,'No C–Nu or C=C product information is supplied.',17);
  b+=text(320,333,'A rate equation is not a product structure.',19);
 }
 b+=text(320,378,'Schematic evidence board · no molecular geometry or product ratio implied',12);
 const description=`${c.title}. ${c.prompt} ${observed?c.observation:'Observation details remain covered until the prediction is committed and the evidence is opened.'}`;
 return svg(description,b,'0 0 640 390')+`<p class="exp-caption">${esc(observed?c.observation:c.clue)}</p>`;
}
function view(raw){
 const s=normalize(raw),c=PATHWAY_CASES[s.caseIndex],r=s.records[s.caseIndex],observed=r?.observed===true,complete=s.phase==='done';let controls='',coach='',primary,prompt=c.prompt;
 const predictionLabel=choicesFor(c).find(([k])=>k===s.prediction)?.[1]||'';
 if(s.phase==='predict'){
  controls=group('Prediction',choicesFor(c).map(([k,label])=>button(label,'predict',k,{selected:s.prediction===k})).join(''));
  primary={action:'commit-prediction',label:'Commit prediction',disabled:!s.prediction};
 }else if(s.phase==='observe'){
  prompt='Keep your first prediction and open the evidence.';primary={action:'observe',label:'Observe the molecular evidence'};
 }else if(s.phase==='reason'){
  prompt='Connect the observation to a molecular explanation.';controls=group('Explanation',reasonsFor(c).map(([k,label])=>button(label,'choose-reason',k,{selected:s.reason===k})).join(''));
  primary={action:'explain',label:'Compare my explanation',disabled:!s.reason};
 }else{
  prompt=complete?'The Crossroads evidence boards are restored.':'Compare your prediction with the observed evidence.';
  const response=s.prediction==='unsure'?'You left room for more evidence. ':s.prediction===c.expected?'Your prediction fits the evidence. ':`${c.feedback[s.prediction]} `;
  const reasonFeedback=s.reason===c.reason?'Your explanation connects the relevant evidence. ':s.reason==='unsure'?'Build the explanation one bond change or rate dependency at a time. ':'Your chosen explanation misses a required distinction. ';
  coach=response+reasonFeedback+c.explanation;
  controls=`<p>Your original explanation: ${esc(reasonsFor(c).find(([k])=>k===s.reason)?.[1]||'')}</p>`;
  if(complete)controls+='<p>This completed guided instruction. It is not independent checkpoint mastery.</p>';
  primary=complete?{action:'reset',label:'Review the evidence boards'}:{action:'next',label:s.caseIndex===PATHWAY_CASES.length-1?'Finish this discovery':'Open the next evidence board'};
 }
 if(r)controls=`<p>First committed prediction: <strong>${esc(predictionLabel)}</strong>. It stays in the discovery record.</p>`+controls;
 if(s.help)coach=(coach?coach+' ':'')+c.clue;
 controls+=group('Crossroads tools',button(s.help?'Close clue':'Ask Fluxotl for a clue','help','',{selected:s.help})+button('Review from the first board','reset'));
 return {activeObjectiveIds:[c.objective],scene:scene(c,observed),prompt,coach,controls,primary,progress:{current:s.caseIndex+1,total:PATHWAY_CASES.length,label:`Evidence board ${s.caseIndex+1} of ${PATHWAY_CASES.length} · ${s.phase}`},complete};
}
export const PATHWAYS_ACTIVITY=Object.freeze({id:'oc-reaction-crossroads-lab',title:'Reaction Crossroads',world:'oc',objectiveIds:['oc-pathways-bond-fates','oc-pathways-evidence'],version:1,sourceUrls:['https://openstax.org/books/organic-chemistry/pages/11-8-the-e2-reaction-and-the-deuterium-isotope-effect','https://openstax.org/books/organic-chemistry/pages/11-10-the-e1-and-e1cb-reactions','https://openstax.org/books/organic-chemistry/pages/11-12-a-summary-of-reactivity-sn1-sn2-e1-e1cb-and-e2'],familiarFamilyIds:['oc-pathways-bond-change','oc-pathways-beta-site','oc-pathways-shared-ionization','oc-pathways-joint-evidence','oc-pathways-evidence-limits'],instructionFamilies:['discovery-oc-reaction-crossroads','oc-pathways-bond-change','oc-pathways-beta-site','oc-pathways-shared-ionization','oc-pathways-joint-evidence','oc-pathways-evidence-limits'],initial,normalize,reduce,view});
export default PATHWAYS_ACTIVITY;
