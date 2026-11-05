// Pure, original instructional sample spaces. No assessment items or learner score access.
import {esc,button,group} from './shared.mjs';
const freeze=x=>{if(x&&typeof x==='object'){Object.values(x).forEach(freeze);Object.freeze(x);}return x;};
const gcd=(a,b)=>b?gcd(b,a%b):a;
const ratio=(n,d)=>{const g=gcd(n,d);return `${n/g}/${d/g}`;};
export function conditionalCounts(cells,givenIds,targetIds){
 if(!Array.isArray(cells)||!cells.length||new Set(cells.map(c=>c.id)).size!==cells.length||cells.some(c=>typeof c.id!=='string'||!Number.isSafeInteger(c.count)||c.count<0))throw new Error('Finite nonnegative integer cell counts and unique IDs required.');
 if(!Array.isArray(givenIds)||!Array.isArray(targetIds)||[...givenIds,...targetIds].some(id=>!cells.some(c=>c.id===id)))throw new Error('Unknown sample-space cell.');
 const eligible=cells.filter(c=>givenIds.includes(c.id)),denominator=eligible.reduce((s,c)=>s+c.count,0),numerator=eligible.filter(c=>targetIds.includes(c.id)).reduce((s,c)=>s+c.count,0);
 if(!denominator||!Number.isSafeInteger(denominator)||!Number.isSafeInteger(numerator))throw new Error('Condition must have a positive, safely countable population.');
 return freeze({numerator,denominator,fraction:ratio(numerator,denominator),eligibleIds:eligible.map(c=>c.id),targetIds:eligible.filter(c=>targetIds.includes(c.id)).map(c=>c.id)});
}
export function orderedSpace(symbols,slots){
 if(!Array.isArray(symbols)||!symbols.length||new Set(symbols).size!==symbols.length||symbols.some(s=>typeof s!=='string'||!s.length)||!Number.isInteger(slots)||slots<1||symbols.length**slots>256)throw new Error('Use unique symbols and a finite space of at most 256 outcomes.');
 let rows=[[]];for(let i=0;i<slots;i++)rows=rows.flatMap(r=>symbols.map(s=>[...r,s]));return rows;
}
export function complementCount(symbols,slots,target){
 if(!symbols.includes(target))throw new Error('Target is absent from sample space.');
 const outcomes=orderedSpace(symbols,slots),none=outcomes.filter(row=>!row.includes(target));
 return freeze({total:outcomes.length,none:none.length,wanted:outcomes.length-none.length,fraction:ratio(outcomes.length-none.length,outcomes.length),outcomes,excluded:none});
}
const cells=freeze([{id:'red-round',label:'Red, round',count:4},{id:'red-square',label:'Red, square',count:2},{id:'blue-round',label:'Blue, round',count:6},{id:'blue-square',label:'Blue, square',count:8}]);
const filtered=conditionalCounts(cells,['red-round','blue-round'],['red-round','red-square']);
const grid=complementCount(['A','B','C'],2,'A');
export const PROBABILITY_CASES=freeze([
 {id:'filtered-counters',objectiveId:'qr-probability-conditional',title:'Who is still eligible?',prompt:'A counter is selected uniformly. Given that it is round, predict the probability it is red. Mark every category still eligible after given round.',choices:['1/5','2/5','2/3','1/2'],answer:'2/5',evidence:['red-round','blue-round'],evidenceOptions:cells.map(c=>[c.id,`${c.label}: ${c.count}`]),familyId:'discovery-qr-filtered-counters',hint:'The word after given chooses the denominator. Mark all round counters, then find the red part inside that group.',explanation:`The round group contains ${filtered.denominator} counters. ${filtered.numerator} are red, so the probability is ${filtered.fraction}. Red given round differs from round given red, which would use all six red counters.`,thread:['Given round → keep the two round categories','4 red round + 6 blue round = 10 eligible','Wanted inside eligible: 4/10 = 2/5']},
 {id:'complement-grid',objectiveId:'qr-counting-complement',title:'Count the missing event',prompt:'Two independent fair spinners each show A, B or C. Predict the probability of at least one A. Mark all ordered outcomes with no A: the complement.',choices:['1/3','2/3','4/9','5/9'],answer:'5/9',evidence:grid.excluded.map(x=>x.join(',')),evidenceOptions:grid.outcomes.map(x=>[x.join(','),`(${x.join(', ')})`]),familyId:'discovery-qr-complement-grid',hint:'No A means both positions use B or C. Each ordered pair is equally likely; count those pairs once.',explanation:`There are ${grid.total} equally likely ordered outcomes. ${grid.none} contain no A. Subtracting leaves ${grid.wanted}, so the probability is ${grid.fraction}. Adding the two 1/3 chances would count (A, A) twice.`,thread:['All pairs: 3 × 3 = 9','No A: 2 × 2 = 4','At least one A: (9 − 4)/9 = 5/9']}
]);
const same=(a,b)=>a.length===b.length&&a.every(x=>b.includes(x));
const blank=(caseIndex=0,first={})=>({caseIndex,phase:'predict',choice:'',evidence:[],help:false,first});
function normalize(raw={}){
 raw=raw&&typeof raw==='object'?raw:{};
 const i=Number.isInteger(raw.caseIndex)?Math.max(0,Math.min(PROBABILITY_CASES.length-1,raw.caseIndex)):0,c=PROBABILITY_CASES[i];
 const first={};for(const [k,v]of Object.entries(raw.first&&typeof raw.first==='object'?raw.first:{})){const t=PROBABILITY_CASES[Number(k)];if(t&&v&&[...t.choices,'unsure'].includes(v.choice)&&Array.isArray(v.evidence))first[k]={choice:v.choice,evidence:[...new Set(v.evidence)].filter(x=>t.evidenceOptions.some(o=>o[0]===x))};}
 const s={...blank(i,first),choice:[...c.choices,'unsure'].includes(raw.choice)?raw.choice:'',evidence:[...new Set(Array.isArray(raw.evidence)?raw.evidence:[])].filter(x=>c.evidenceOptions.some(o=>o[0]===x)),help:raw.help===true};
 if(['reveal','complete'].includes(raw.phase)&&s.choice&&(s.choice==='unsure'||s.evidence.length)&&first[i])s.phase=raw.phase==='complete'&&i===PROBABILITY_CASES.length-1&&PROBABILITY_CASES.every((_,n)=>first[n])?'complete':'reveal';
 return s;
}
function reduce(raw,action,value){
 const s=normalize(raw),c=PROBABILITY_CASES[s.caseIndex];
 if(action==='probability-restart')return blank(0,s.first);
 if(action==='probability-retry'&&s.phase!=='predict')return blank(s.caseIndex,s.first);
 if(action==='probability-help'&&s.phase==='predict')return {...s,help:!s.help};
 if(action==='probability-choice'&&s.phase==='predict'&&[...c.choices,'unsure'].includes(value))return {...s,choice:value};
 if(action==='probability-cell'&&s.phase==='predict'&&c.evidenceOptions.some(x=>x[0]===value))return {...s,evidence:s.evidence.includes(value)?s.evidence.filter(x=>x!==value):[...s.evidence,value]};
 if(action==='probability-commit'&&s.phase==='predict'&&s.choice&&(s.choice==='unsure'||s.evidence.length))return {...s,phase:'reveal',help:false,first:{...s.first,[s.caseIndex]:s.first[s.caseIndex]||{choice:s.choice,evidence:[...s.evidence]}}};
 if(action==='probability-next'&&s.phase==='reveal')return s.caseIndex<PROBABILITY_CASES.length-1?blank(s.caseIndex+1,s.first):{...s,phase:'complete'};
 return s;
}
function view(raw){
 const s=normalize(raw),c=PROBABILITY_CASES[s.caseIndex],reveal=s.phase!=='predict',match=s.choice===c.answer&&same(s.evidence,c.evidence);
 if(s.phase==='complete')return {activeObjectiveIds:[c.objectiveId],scene:'<h3>Chance Arcade repaired</h3><p>You traced the eligible outcomes and the complement. These were guided examples; continue to a separate fresh check.</p>',prompt:'A counted outcome beats a guessed denominator.',coach:'Guided completion is not assessment credit.',controls:button('Revisit the arcade','probability-restart'),primary:{action:'done',label:'Done'},progress:{current:2,total:2,label:'2 of 2 cases explored'},complete:true};
 const data=s.caseIndex===0?`<table><caption>Twenty equally likely counters</caption><thead><tr><th scope="col">Category</th><th scope="col">Count</th></tr></thead><tbody>${cells.map(x=>`<tr><th scope="row">${esc(x.label)}</th><td>${x.count}</td></tr>`).join('')}</tbody></table>`:'<p>Each pair lists the first spinner, then the second. All nine pairs are equally likely.</p>';
 const marked=c.evidenceOptions.map(([id,label])=>button(label,'probability-cell',id,{selected:s.evidence.includes(id),disabled:reveal})).join('');
 const reasoning=reveal?`<ol>${c.thread.map(t=>`<li>${esc(t)}</li>`).join('')}</ol><p>${esc(c.explanation)}</p><p>First commitment: ${esc(s.first[s.caseIndex].choice)}. Revisiting this teaching case does not erase it.</p>`:'';
 return {activeObjectiveIds:[c.objectiveId],scene:`<section><h3>${esc(c.title)}</h3>${data}${group(s.caseIndex===0?'Mark the eligible categories':'Mark the complement outcomes',marked)}${reasoning}</section>`,prompt:c.prompt,coach:reveal?(match?'Your prediction and selected group agree.':'Compare both your prediction and the selected group with the reasoning.'):(s.help?c.hint:'Chancet: “Say who is eligible before you divide.”'),controls:reveal?button('Revisit this case','probability-retry'):group('Predict a probability',c.choices.map(x=>button(x,'probability-choice',x,{selected:s.choice===x})).join('')+button('I am not sure yet','probability-choice','unsure',{selected:s.choice==='unsure'})+button('Ask for a hint','probability-help')),primary:reveal?{action:'probability-next',label:s.caseIndex===0?'Explore the complement':'Finish this investigation'}:{action:'probability-commit',label:s.choice==='unsure'?'Walk through the sample space':'Commit and reveal',disabled:!s.choice||(s.choice!=='unsure'&&!s.evidence.length)},progress:{current:s.caseIndex+1,total:2,label:`${s.caseIndex+1} of 2 cases`},complete:false};
}
export const PROBABILITY_ACTIVITIES=freeze([{id:'probability-sample-space',title:'Chance Arcade Investigation',world:'qr',version:1,objectiveIds:['qr-probability-conditional','qr-counting-complement'],sourceUrls:['https://openstax.org/books/introductory-statistics-2e/pages/3-1-terminology'],instructionFamilies:[...PROBABILITY_CASES.map(c=>({objectiveId:c.objectiveId,familyId:c.familyId})),{objectiveId:'qr-probability-conditional',familyId:'qr-conditional-two-way-frequency'},{objectiveId:'qr-counting-complement',familyId:'qr-counting-independent-complement'}],initial:()=>blank(),normalize,reduce,view}]);
