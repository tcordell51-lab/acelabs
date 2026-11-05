import {button,esc,group,svg} from './shared.mjs';
const freeze=x=>{if(x&&typeof x==='object'){Object.values(x).forEach(freeze);Object.freeze(x);}return x;};
// Right-handed coordinates: +x right, +y up, +z toward the observer.
// Bond locations are schematic (not measured tetrahedral bond angles).
export const STEREO_SLOTS=freeze({left:[-1,.7,0],right:[1,.7,0],front:[-.65,-1,1],back:[.65,-1,-1]});
export const STEREO_CASES=freeze([
 {id:'connectivity',kind:'connectivity',title:'Trace the same formula',objective:'oc-isomer-relationships',expected:'constitutional',reason:'changed-connectivity'},
 {id:'mirror',kind:'pair',title:'Turn a mirror pair',objective:'oc-isomer-relationships',ligands:{left:'Br',right:'Cl',front:'F',back:'H'},priorities:{Br:1,Cl:2,F:3,H:4},reason:'mirror-nonsuperimposable'},
 {id:'two-centers',kind:'labels',title:'Compare two distinct centers',objective:'oc-isomer-relationships',reason:'some-not-all'},
 {id:'halogen',kind:'cip',title:'Rank directly attached atoms',objective:'oc-cip-configuration',ligands:{left:'Br',right:'Cl',front:'F',back:'H'},priorities:{Br:1,Cl:2,F:3,H:4},rankChoices:['Br > Cl > F > H','Cl > Br > F > H','H > F > Cl > Br'],rankAnswer:0,reason:'four-away'},
 {id:'carbon-tie',kind:'cip',title:'Break a carbon tie',objective:'oc-cip-configuration',ligands:{left:'OH',right:'CH₂CH₃',front:'H',back:'CH₃'},priorities:{OH:1,'CH₂CH₃':2,'CH₃':3,H:4},rankChoices:['OH > CH₃ > CH₂CH₃ > H','OH > CH₂CH₃ > CH₃ > H','CH₂CH₃ > OH > CH₃ > H'],rankAnswer:1,reason:'four-toward'}
]);
const sub=(a,b)=>a.map((v,i)=>v-b[i]);
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0);
export function stereoConfiguration(byPriority){
 if(!Array.isArray(byPriority)||byPriority.length!==4||byPriority.some(p=>!Array.isArray(p)||p.length!==3||p.some(v=>!Number.isFinite(v))))throw new TypeError('Four finite xyz vectors ordered by priority are required.');
 const [a,b,c,d]=byPriority,determinant=dot(sub(a,d),cross(sub(b,d),sub(c,d)));
 if(Math.abs(determinant)<1e-9)throw new RangeError('Degenerate configuration has no assigned handedness.');
 return {configuration:determinant<0?'R':'S',determinant};
}
export function rotateStereoVector([x,y,z],quarterTurns=0){const a=quarterTurns*Math.PI/2;return [x*Math.cos(a)-y*Math.sin(a),x*Math.sin(a)+y*Math.cos(a),z];}
export function stereoModel(index,{rotation=0,mirror=true,pairMode='some'}={}){
 const c=STEREO_CASES[index];if(!c)return null;
 if(c.kind==='connectivity')return {expected:'constitutional',formula:'C₂H₆O',leftNeighbors:['C','H'],rightNeighbors:['C','C']};
 if(c.kind==='labels')return {left:['R','R'],right:pairMode==='all'?['S','S']:['R','S'],expected:pairMode==='all'?'enantiomers':'diastereomers',reason:pairMode==='all'?'all-distinct-centers':'some-not-all'};
 const base=Object.entries(c.ligands).map(([slot,label])=>({slot,label,priority:c.priorities[label],vector:[...STEREO_SLOTS[slot]]}));
 const oriented=base.map(b=>({...b,vector:rotateStereoVector([c.kind==='pair'&&mirror?-b.vector[0]:b.vector[0],b.vector[1],b.vector[2]],rotation)}));
 const ordered=oriented.slice().sort((a,b)=>a.priority-b.priority).map(b=>b.vector),assignment=stereoConfiguration(ordered),original=stereoConfiguration(base.slice().sort((a,b)=>a.priority-b.priority).map(b=>b.vector));
 const [p1,p2,p3,p4]=ordered,area=(p2[0]-p1[0])*(p3[1]-p1[1])-(p2[1]-p1[1])*(p3[0]-p1[0]);
 return {bonds:oriented,base,configuration:assignment.configuration,determinant:assignment.determinant,expected:c.kind==='pair'?(assignment.configuration===original.configuration?'identical':'enantiomers'):assignment.configuration,sense:area<0?'clockwise':'counterclockwise',fourDirection:p4[2]>0?'toward':'away',reason:c.kind==='pair'?(mirror?'mirror-nonsuperimposable':'rigid-rotation'):c.reason};
}
export function renderStereoCenter(bonds,{x=320,y=190,scale=82,showPriorities=false,title=''}={}){
 let b=title?`<text x="${x}" y="55" text-anchor="middle" fill="#263c4a" font-size="16">${esc(title)}</text>`:'';
 for(const {label,priority,vector:[dx,dy,dz]} of bonds){
  const ex=x+dx*scale,ey=y-dy*scale,l=Math.hypot(dx,dy),nx=-dy/l,ny=-dx/l;
  if(dz>0)b+=`<polygon points="${x},${y} ${ex+nx*8},${ey+ny*8} ${ex-nx*8},${ey-ny*8}" fill="#344d65"/>`;
  else if(dz<0){for(let i=1;i<=7;i++){const t=i/8,cx=x+(ex-x)*t,cy=y+(ey-y)*t,w=8*t;b+=`<line x1="${cx+nx*w}" y1="${cy+ny*w}" x2="${cx-nx*w}" y2="${cy-ny*w}" stroke="#344d65" stroke-width="2"/>`;}}
  else b+=`<line x1="${x}" y1="${y}" x2="${ex}" y2="${ey}" stroke="#344d65" stroke-width="3"/>`;
  const lx=x+dx*(scale+29),ly=y-dy*(scale+29);
  b+=`<text x="${lx}" y="${ly+5}" text-anchor="middle" fill="#263c4a" font-size="${label.length>3?14:19}">${esc(label)}${showPriorities?` [${priority}]`:''}</text>`;
 }
 return b+`<circle cx="${x}" cy="${y}" r="13" fill="#ede1fa" stroke="#344d65"/><text x="${x}" y="${y+5}" text-anchor="middle" font-size="15" fill="#263c4a">C</text>`;
}
const relationships=['constitutional','enantiomers','diastereomers','identical','unsure'];
const reasonLabels={'changed-connectivity':'The oxygen has different bonded neighbors.','mirror-nonsuperimposable':'The same four distinct ligands form nonsuperimposable mirror configurations.','rigid-rotation':'Only the viewing orientation changed; connectivity and configuration stayed the same.','some-not-all':'One of the two distinct centers changed; the other stayed the same.','all-distinct-centers':'Both distinct centers changed, and this molecule has no internal symmetry.','four-away':'Priority 4 is away: use the visible 1 → 2 → 3 sense directly.','four-toward':'Priority 4 is toward: reverse the visible 1 → 2 → 3 sense.','ignore-depth':'The visible clockwise or counterclockwise trace alone is enough.',unsure:'I’m not sure yet'};
const initial=()=>({caseIndex:0,phase:'predict',prediction:'',rank:null,rotation:0,mirror:true,pairMode:'some',observed:false,reason:'',help:false});
function normalize(raw){
 const s=initial();if(!raw||typeof raw!=='object'||Array.isArray(raw))return s;
 if(Number.isInteger(raw.caseIndex)&&raw.caseIndex>=0&&raw.caseIndex<STEREO_CASES.length)s.caseIndex=raw.caseIndex;
 const c=STEREO_CASES[s.caseIndex],predictions=c.kind==='cip'?['R','S','unsure']:relationships;
 if(predictions.includes(raw.prediction))s.prediction=raw.prediction;
 if(Number.isInteger(raw.rank)&&raw.rank>=0&&raw.rank<(c.rankChoices?.length??0))s.rank=raw.rank;
 if(Number.isInteger(raw.rotation))s.rotation=((raw.rotation%4)+4)%4;
 s.mirror=raw.mirror!==false;s.pairMode=raw.pairMode==='all'?'all':'some';s.observed=raw.observed===true;s.help=raw.help===true;
 if(Object.hasOwn(reasonLabels,raw.reason))s.reason=raw.reason;
 if(s.prediction&&(c.kind!=='cip'||s.rank!==null)&&['predict','observe','reason','explained','done'].includes(raw.phase))s.phase=raw.phase;
 if(['reason','explained','done'].includes(s.phase)&&!s.observed)s.phase='observe';
 if(['explained','done'].includes(s.phase)&&!s.reason)s.phase='reason';
 if(s.phase==='done'&&s.caseIndex!==STEREO_CASES.length-1)s.phase='explained';
 if(s.phase==='predict'){s.observed=false;s.reason='';}
 return s;
}
function reduce(raw,action,value){
 const s=normalize(raw),c=STEREO_CASES[s.caseIndex];
 if(action==='reset')return initial();
 if(action==='help')return {...s,help:!s.help};
 if(action==='rotate'&&['pair','cip'].includes(c.kind)&&s.phase!=='done')return {...s,rotation:(s.rotation+1)%4};
 if(action==='set-pair'&&s.phase==='predict'&&c.kind==='pair'&&['mirror','rotation'].includes(value))return {...s,mirror:value==='mirror',prediction:''};
 if(action==='set-centers'&&s.phase==='predict'&&c.kind==='labels'&&['some','all'].includes(value))return {...s,pairMode:value,prediction:''};
 if(action==='rank'&&s.phase==='predict'&&c.kind==='cip'&&/^\d+$/.test(String(value))&&Number(value)<c.rankChoices.length)return {...s,rank:Number(value)};
 if(action==='predict'&&s.phase==='predict'&&(c.kind==='cip'?['R','S','unsure']:relationships).includes(value))return {...s,prediction:value};
 if(action==='commit-prediction'&&s.phase==='predict'&&s.prediction&&(c.kind!=='cip'||s.rank!==null))return {...s,phase:'observe'};
 if(action==='inspect'&&s.phase==='observe')return {...s,observed:true,phase:'reason'};
 if(action==='reason'&&s.phase==='reason'&&Object.hasOwn(reasonLabels,value))return {...s,reason:value};
 if(action==='explain'&&s.phase==='reason'&&s.reason)return {...s,phase:'explained'};
 if(action==='change-condition'&&s.phase==='explained'&&['pair','labels'].includes(c.kind))return {...initial(),caseIndex:s.caseIndex,mirror:!s.mirror,pairMode:s.pairMode==='some'?'all':'some'};
 if(action==='next'&&s.phase==='explained')return s.caseIndex===STEREO_CASES.length-1?{...s,phase:'done'}:{...initial(),caseIndex:s.caseIndex+1};
 return s;
}
const txt=(x,y,t,size=16)=>`<text x="${x}" y="${y}" text-anchor="middle" fill="#263c4a" font-size="${size}">${esc(t)}</text>`;
function scene(s){
 const c=STEREO_CASES[s.caseIndex],m=stereoModel(s.caseIndex,s),revealed=['explained','done'].includes(s.phase);
 let b='<rect width="640" height="450" rx="22" fill="#f7f0fb"/>';
 if(c.kind==='connectivity'){
  b+=txt(320,45,'Two labeled structures · both C₂H₆O',22)+txt(175,150,'CH₃-CH₂-O-H',21)+txt(470,150,'CH₃-O-CH₃',21);
  b+=txt(175,190,'Ethanol',17)+txt(470,190,'Dimethyl ether',17);
  if(s.observed)b+=`<rect x="35" y="235" width="260" height="70" rx="12" fill="#e6d7f3"/><rect x="345" y="235" width="260" height="70" rx="12" fill="#e6d7f3"/>${txt(165,262,'O neighbors: C and H',17)}${txt(475,262,'O neighbors: C and C',17)}${txt(320,344,'A rotation cannot change which atoms are bonded.',17)}`;
  else b+=txt(320,285,'Trace the bonds meeting oxygen before classifying the pair.',17);
 }else if(c.kind==='labels'){
  b+=txt(320,42,'Same molecule: 2-bromo-3-chloropentane',20)+txt(320,75,'CH₃-CH(Br)-CH(Cl)-CH₂-CH₃',18);
  b+=txt(170,160,'Reference: C2 R · C3 R',19)+txt(470,160,`Comparison: C2 ${m.right[0]} · C3 ${m.right[1]}`,19);
  b+=txt(320,225,'The labels here are given; they are not inferred from this flat formula.',14)+txt(320,258,'C2 and C3 are distinct. This molecule has no internal symmetry.',14);
  if(s.observed)b+=txt(320,322,s.pairMode==='all'?'Both labeled configurations differ.':'C2 stays R; only C3 differs.',20);
 }else if(c.kind==='pair'){
  b+=renderStereoCenter(m.base,{x:165,y:190,scale:66,title:'Reference'})+renderStereoCenter(m.bonds,{x:475,y:190,scale:66,title:s.mirror?'Reflected comparison':'Rotated comparison'});
  b+=txt(320,335,`Comparison viewing rotation: ${s.rotation*90}° about the screen normal`,15);
  if(s.observed)b+=txt(320,368,s.mirror?'Reflection reverses handedness; a rigid rotation preserves it.':'The same configuration remains after the viewing rotation.',15);
 }else{
  b+=renderStereoCenter(m.bonds,{x:320,y:200,scale:82,showPriorities:s.observed,title:c.title});
  b+=txt(320,350,s.observed?`1 → 2 → 3 reads ${m.sense}; priority 4 points ${m.fourDirection}.`:'Assign atomic priorities, then inspect where priority 4 points.',15);
  if(revealed)b+=txt(320,385,`Configuration: ${m.configuration}`,22);
 }
 b+=txt(320,423,'Solid wedge: toward you · hashed wedge: away · plain line: page plane',13);
 return svg(`${c.title}. ${c.kind==='cip'||c.kind==='pair'?'Schematic stereocenter with explicit solid and hashed bonds; positive depth points toward the observer.':'Labeled connectivity or configuration comparison.'}${revealed?` Explanation revealed: ${m.expected}.`:''}`,b,'0 0 640 450')+`<p class="exp-caption">${c.kind==='cip'||c.kind==='pair'?'Each illustrated central carbon has four different ligands. Bond locations are schematic, not measured bond angles. Screen-plane rotation changes the view only.':'Connectivity is shown by the written bonds. Hydrogen counts are included in the condensed groups.'} No R/S assignment is made for a methyl or another carbon with duplicate ligands.</p>`;
}
function explanation(c,m){
 if(c.kind==='connectivity')return 'The atoms have the same overall formula, but oxygen has different neighbors. This is a constitutional-isomer pair, so a mirror test is unnecessary.';
 if(c.kind==='pair')return m.expected==='identical'?'Only a rigid rotation was applied. It preserves the order of four distinct ligands in three dimensions, so the structures are identical.':'The comparison reverses handedness at the one stereocenter while retaining connectivity. No rigid rotation superimposes this mirror pair: they are enantiomers.';
 if(c.kind==='labels')return m.expected==='enantiomers'?'Both distinct stereocenters invert. For this explicitly nonsymmetric molecule the pair is nonidentical mirror images: enantiomers. Internal symmetry must be checked before generalizing to other molecules.':'Connectivity stays the same; C2 stays R and C3 changes. This is a nonmirror stereoisomer pair: diastereomers.';
 const rank=c.id==='halogen'?'The directly attached atomic numbers order Br, Cl, F, then H.':'OH wins by oxygen. The two carbon ligands tie at the first atom; compare (C,H,H) for ethyl with (H,H,H) for methyl. Ethyl wins at the first difference.';
 return `${rank} Here 1 → 2 → 3 is ${m.sense}. Priority 4 points ${m.fourDirection}, so ${m.fourDirection==='away'?'read that sense directly':'reverse the apparent result'}. The configuration is ${m.configuration}. A rigid rotation preserves it. R/S does not determine the sign of measured optical rotation.`;
}
function view(raw){
 const s=normalize(raw),c=STEREO_CASES[s.caseIndex],m=stereoModel(s.caseIndex,s),complete=s.phase==='done';
 let prompt=c.kind==='cip'?'Rank the ligands and predict the configuration.':'Inspect the structures and predict their relationship.',coach='',controls='',primary;
 if(s.phase==='predict'){
  if(c.kind==='pair')controls+=group('Comparison condition',button('Mirror comparison','set-pair','mirror',{selected:s.mirror})+button('Same molecule, rotated','set-pair','rotation',{selected:!s.mirror}));
  if(c.kind==='labels')controls+=group('Changed configurations',button('Change C3 only','set-centers','some',{selected:s.pairMode==='some'})+button('Change both distinct centers','set-centers','all',{selected:s.pairMode==='all'}));
  if(c.kind==='cip')controls+=group('Priority order, high to low',c.rankChoices.map((r,i)=>button(r,'rank',String(i),{selected:s.rank===i})).join(''));
  controls+=group('Prediction',(c.kind==='cip'?['R','S','unsure']:relationships).map(p=>button(p==='unsure'?'I’m not sure yet':p,'predict',p,{selected:s.prediction===p})).join(''));
  primary={action:'commit-prediction',label:'Save prediction and inspect',disabled:!s.prediction||(c.kind==='cip'&&s.rank===null)};
 }else if(s.phase==='observe'){
  prompt='Keep your prediction and inspect the structural evidence.';
  controls=`<p>Your committed prediction: <strong>${esc(s.prediction)}</strong>.</p>`;
  primary={action:'inspect',label:c.kind==='cip'?'Reveal atomic priorities and bond depth':c.kind==='connectivity'?'Trace oxygen’s bonded neighbors':'Compare the configurations'};
 }else if(s.phase==='reason'){
  prompt='Explain what the structural evidence changes.';
  const keys=c.kind==='cip'?['four-away','four-toward','ignore-depth','unsure']:c.kind==='connectivity'?['changed-connectivity','rigid-rotation','unsure']:c.kind==='pair'?['mirror-nonsuperimposable','rigid-rotation','unsure']:['some-not-all','all-distinct-centers','unsure'];
  controls=`<p>Your committed prediction: <strong>${esc(s.prediction)}</strong>.</p>`+group('Structural explanation',keys.map(k=>button(reasonLabels[k],'reason',k,{selected:s.reason===k})).join(''));
  primary={action:'explain',label:'Connect the structure to the conclusion',disabled:!s.reason};
 }else{
  prompt=complete?'The stereochemistry gallery is restored.':'Trace the evidence back to your prediction.';
  coach=(s.prediction==='unsure'?'Use the annotated structure to build the comparison. ':s.prediction===m.expected?'Your prediction agrees. ':'Compare your original prediction with the evidence. ')+explanation(c,m);
  controls=`<p>Your original prediction: <strong>${esc(s.prediction)}</strong>. Your explanation: ${esc(reasonLabels[s.reason])}</p>`;
  if(c.kind==='cip')controls+=`<p>Your chosen priority order: <strong>${esc(c.rankChoices[s.rank])}</strong>. ${s.rank===c.rankAnswer?'It agrees with the atomic comparison.':'Recheck it against the numbered ligands.'}</p>`;
  if(!complete&&['pair','labels'].includes(c.kind))controls+=button('Change the comparison and predict again','change-condition');
  if(complete)controls+='<p>This records guided instruction, not independent checkpoint mastery.</p>';
  primary=complete?{action:'reset',label:'Explore the gallery again'}:{action:'next',label:s.caseIndex<STEREO_CASES.length-1?'Inspect the next gallery case':'Complete this discovery'};
 }
 if(['pair','cip'].includes(c.kind))controls+=group('View only',button('Rotate view by 90°','rotate'));
 if(s.help&&!coach)coach=c.kind==='cip'?'Compare atomic numbers first, then the first differing neighbor list if necessary. Rank all four groups. Trace 1 → 2 → 3 and account for whether group 4 points toward or away.':'Compare formula, connectivity and spatial configuration in that order. A page rotation alone does not make a new molecule. For multiple centers, also check internal symmetry.';
 controls+=group('Gallery tools',button(s.help?'Close clue':'Ask the gallery keeper','help','',{selected:s.help})+button('Restart discovery','reset'));
 return {activeObjectiveIds:[c.objective],scene:scene(s),prompt,coach,controls,primary,progress:{current:s.caseIndex+1,total:STEREO_CASES.length,label:`Gallery case ${s.caseIndex+1} of ${STEREO_CASES.length} · ${s.phase}`},complete};
}
export const STEREOCHEMISTRY_ACTIVITY=Object.freeze({id:'oc-stereochemistry-gallery-lab',title:'The Stereochemistry Gallery',world:'oc',objectiveIds:['oc-isomer-relationships','oc-cip-configuration'],version:1,sourceUrls:['https://openstax.org/books/organic-chemistry/pages/5-5-sequence-rules-for-specifying-configuration','https://openstax.org/books/organic-chemistry/pages/5-9-a-review-of-isomerism'],familiarFamilyIds:['oc-isomer-connectivity','oc-isomer-fixed-configuration','oc-cip-direct-atomic-priority','oc-cip-neighbor-priority','oc-cip-wedge-configuration'],instructionFamilies:['discovery-oc-stereochemistry-gallery','oc-isomer-connectivity','oc-isomer-fixed-configuration','oc-cip-direct-atomic-priority','oc-cip-neighbor-priority','oc-cip-wedge-configuration'],initial,normalize,reduce,view});
export default STEREOCHEMISTRY_ACTIVITY;
