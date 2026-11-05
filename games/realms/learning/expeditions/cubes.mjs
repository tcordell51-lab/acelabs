// Supported instruction only: these cases do not enter the assessment bank.
import {button,esc,group} from './shared.mjs';
import {cubesFromHeights,cubeFaces,cubeInventory,paintedFaceCount,cubeKey,columnLabel,assemblySvg} from './cube-model.mjs';
const freeze=o=>{if(o&&typeof o==='object'){Object.values(o).forEach(freeze);Object.freeze(o);}return o;};
export const CUBE_CENSUS_CASES=freeze([
  {name:'The first survey',heights:[[2,1],[1,1]],note:'Follow one vertical column from the floor upward, then move to the next column.'},
  {name:'The stepped vault',heights:[[3,2],[1,1]],note:'The taller column includes support cubes that can have fewer painted faces.'},
  {name:'An empty corner',heights:[[2,2,1],[1,0,1]],note:'A zero in the plan means there is no cube column there. Count only the declared columns.'}
]);
export const CUBE_INSTRUCTION_FAMILIES=freeze(['pat-cube-local-neighbor-contacts','pat-cube-static-class-tally','discovery-pat-cube-systematic-sweep']);
const initial=()=>({caseIndex:0,cursor:0,phase:'predict',choice:null,records:[],help:false,unsure:false});
const integer=(x,lo,hi,fallback)=>Number.isInteger(x)&&x>=lo&&x<=hi?x:fallback;
export function normalizeCensus(raw){
  const r=raw&&typeof raw==='object'?raw:{},caseIndex=integer(r.caseIndex,0,CUBE_CENSUS_CASES.length-1,0),inv=cubeInventory(CUBE_CENSUS_CASES[caseIndex].heights),cursor=integer(r.cursor,0,inv.total,0);
  // A persisted cursor cannot skip an observation: each record is a first prediction.
  const records=Array.isArray(r.records)?r.records.slice(0,cursor).filter(x=>x===null||Number.isInteger(x)&&x>=0&&x<=5):[];
  const safeCursor=records.length,choice=integer(r.choice,0,5,null),unsure=r.unsure===true,observed=r.phase==='observed'&&(choice!==null||unsure)&&safeCursor<inv.total;
  return {caseIndex,cursor:safeCursor,phase:observed?'observed':'predict',choice,records,help:r.help===true,unsure};
}
export function reduceCensus(raw,action,payload){
  const s=normalizeCensus(raw),inv=cubeInventory(CUBE_CENSUS_CASES[s.caseIndex].heights),done=s.cursor===inv.total;
  if(action==='restart')return initial();
  if(action==='reset')return {...initial(),caseIndex:s.caseIndex};
  if(action==='help')return {...s,help:!s.help};
  const n=typeof payload==='number'?payload:/^[0-5]$/.test(String(payload))?Number(payload):-1;
  if(action==='pick'&&s.phase==='predict'&&!done&&n>=0&&n<=5)return {...s,choice:n,unsure:false};
  if((action==='observe'&&s.choice!==null||action==='unsure')&&s.phase==='predict'&&!done)return {...s,phase:'observed',unsure:action==='unsure'};
  if(action==='record'&&s.phase==='observed'&&!done)return {...s,cursor:s.cursor+1,phase:'predict',records:[...s.records,s.unsure?null:s.choice],choice:null,unsure:false};
  if(action==='next-case'&&done&&s.caseIndex<CUBE_CENSUS_CASES.length-1)return {...initial(),caseIndex:s.caseIndex+1};
  return s;
}
export function censusView(raw){
  const s=normalizeCensus(raw),c=CUBE_CENSUS_CASES[s.caseIndex],inv=cubeInventory(c.heights),done=s.cursor===inv.total,observed=!done&&s.phase==='observed',target=done?null:inv.cubes[s.cursor],complete=done&&s.caseIndex===CUBE_CENSUS_CASES.length-1;
  const tally=[0,0,0,0,0,0];inv.rows.slice(0,s.cursor).forEach(r=>tally[r.faces]++);
  const evidence=observed?`<div class="exp-cube-evidence"><p><strong>Your first prediction:</strong> ${s.unsure?'Show me':s.choice+' painted faces'}. <strong>Observed:</strong> ${paintedFaceCount(inv.cubes,target)} painted faces.</p><ul>${cubeFaces(inv.cubes,target).map(f=>`<li>${esc(f.id)}: ${f.floor?'touches the floor → unpainted':f.contact?'touches another cube → unpainted':'exposed when painted → painted'}</li>`).join('')}</ul></div>`:'';
  const tallyHtml=`<table style="width:100%;border-collapse:collapse;text-align:center"><caption>Recorded survey: ${s.cursor} of ${inv.total} cubes inspected</caption><thead><tr>${[0,1,2,3,4,5].map(n=>`<th scope="col">${n} faces</th>`).join('')}</tr></thead><tbody><tr>${tally.map(n=>`<td>${n}</td>`).join('')}</tr></tbody></table>`;
  const prior=s.records.length?`<details><summary>Earlier predictions and observations</summary><ol>${s.records.map((n,i)=>`<li>Column ${columnLabel(inv.cubes[i])}, level ${inv.cubes[i][2]+1}: predicted ${n===null?'unsure':n}; observed ${inv.rows[i].faces}.</li>`).join('')}</ol></details>`:'';
  let coach=done?`The tally contains ${tally.reduce((a,b)=>a+b,0)} cubes, matching the ${inv.total} cubes in the height plan. This checks that none were omitted or counted twice; it does not by itself prove every face classification is correct.`:observed?`${s.choice===paintedFaceCount(inv.cubes,target)&&!s.unsure?'Your prediction matches. ':'Keep your first prediction visible while comparing. '}Each face is either a cube contact, a floor contact, or exposed. Check all six directions before adding this cube to the tally.`:s.help?'Start with six faces. Cover each face touching a neighboring cube. Also cover a downward face touching the floor. Paint every remaining exposed face.':'Cubora: “Team Entropy mixed up the survey. We can rebuild it one cube at a time.”';
  if(complete)coach+=' This guided survey is practice; independent checks remain separate.';
  return {activeObjectiveIds:done?['pat-cube-inventory']:['pat-cube-painted-faces','pat-cube-inventory'],scene:`<p><strong>${esc(c.name)}</strong> · ${esc(c.note)}</p>${assemblySvg(c.heights,{target,label:c.name,reveal:observed})}<p>Cubes are cemented together first. All exposed surfaces are painted except the bottom touching the floor. This height plan is an introductory teaching aid.</p>${evidence}${tallyHtml}${prior}`,prompt:done?'Check the completed inventory.':observed?'Inspect the six faces, then record this cube.':`Predict painted faces on column ${columnLabel(target)}, level ${target[2]+1} from the floor.`,coach,
    controls:(!observed&&!done?group('Predict painted faces',[0,1,2,3,4,5].map(n=>button(String(n),'pick',n,{selected:s.choice===n})).join('')+button('Show this cube','unsure')):'')+group('Survey tools',button(s.help?'Hide the nudge':'Give me a nudge','help')+button('Restart this survey','reset')),
    primary:done?(complete?{action:'restart',label:'Survey again'}:{action:'next-case',label:'Explore the next assembly'}):observed?{action:'record',label:'Record and inspect the next cube'}:{action:'observe',label:'Inspect all six faces',disabled:s.choice===null},progress:{current:s.cursor*2+(observed?1:0),total:inv.total*2,label:`Assembly ${s.caseIndex+1} of ${CUBE_CENSUS_CASES.length} · ${s.cursor}/${inv.total} cubes recorded`},complete};
}
export const CUBE_CENSUS_ACTIVITY=freeze({id:'pat-cube-census-lab',title:'Cubora’s Cube Census',world:'pat',objectiveIds:['pat-cube-painted-faces','pat-cube-inventory'],version:1,sourceUrls:['https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/perceptual_ability_test_section_instructions.pdf'],instructionFamilies:CUBE_INSTRUCTION_FAMILIES,familiarFamilyIds:['pat-cube-local-neighbor-contacts','pat-cube-static-class-tally'],inspectionCases:CUBE_CENSUS_CASES,initial,normalize:normalizeCensus,reduce:reduceCensus,view:censusView});
