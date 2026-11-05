// Original instruction-only chromosome inventory. No assessment bank is imported.
import {button,esc,group,svg} from './shared.mjs';
const freeze=value=>{if(value&&typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}return value;};
const SOURCE_URLS=Object.freeze([
 'https://openstax.org/books/biology-2e/pages/10-1-cell-division',
 'https://openstax.org/books/biology-2e/pages/10-2-the-cell-cycle',
 'https://openstax.org/books/biology-2e/pages/11-1-the-process-of-meiosis'
]);
const IDS=['bio-division-dna-count','bio-division-separation','bio-division-assortment'];
export const DIVISION_CASES=freeze([
 {id:'copy',title:'Copy the archive',pairs:2,stages:['g1','replicated'],objectives:[IDS[0]],prompt:'After S phase, what changes in this one cell?',predictions:[['same-chr','Same chromosome count; twice the DNA'],['double-chr','Twice the chromosomes and twice the DNA'],['half-chr','Half the chromosomes; same DNA'],['unsure','I’m not sure yet']],correct:'same-chr',reasonPrompt:'Why do four X-shaped diagrams still count as four chromosomes?',reasons:[['joined','Each joined sister pair is one replicated chromosome'],['uncopied','The centromeric DNA was not replicated'],['homolog','Each X is a pair of homologs']],correctReason:'joined',explanation:'The model starts with four chromosomes and four DNA molecules. S creates four joined sister pairs: four chromosomes, eight DNA molecules. Centromeric DNA is copied too. The count follows joined versus separated sisters, not the number of DNA copies at the centromere.'},
 {id:'mitosis',title:'Keep both daughter sets complete',pairs:2,stages:['replicated','mitotic-anaphase','mitotic-daughters'],objectives:[IDS[0],IDS[1]],prompt:'After this normal mitosis and cytokinesis, how many chromosomes will each daughter contain?',predictions:[['same-per-daughter','Four, the original diploid count'],['half-per-daughter','Two, half the original count'],['double-per-daughter','Eight, the post-copy DNA count'],['unsure','I’m not sure yet']],correct:'same-per-daughter',reasonPrompt:'How can the anaphase whole-cell count be eight but each completed daughter have four?',reasons:[['boundary','Eight separated chromosomes are partitioned into two groups of four'],['destroy','Half of the DNA is destroyed during cytokinesis'],['second-copy','Each daughter performs a second S phase during cytokinesis']],correctReason:'boundary',explanation:'Mitotic anaphase separates sisters, making eight chromosomes within the still-undivided cell. Four move to each pole. Cytokinesis partitions those existing groups, so each daughter receives four chromosomes and four DNA molecules. The transient whole-cell count does not establish a new tetraploid lineage.'},
 {id:'meiosis-one',title:'Separate homologs first',pairs:2,stages:['replicated','meiosis-one'],objectives:[...IDS],prompt:'Which units move apart in meiosis I?',predictions:[['homologs','Homologs separate; sisters stay joined'],['sisters','Sisters separate; homologs stay together'],['both','Both homologs and sisters separate at once'],['unsure','I’m not sure yet']],correct:'homologs',reasonPrompt:'Why is each resulting cell haploid while its chromosomes are still replicated?',reasons:[['one-set','Each cell has one homolog of each type, with its sister copy still joined'],['two-dna','Haploid means exactly two DNA molecules in every species'],['no-set','Ploidy cannot be named until meiosis II ends']],correctReason:'one-set',explanation:'A1 separates from A2 and B1 from B2. Each daughter receives one A and one B: one complete set, so it is haploid. Each of its two chromosomes still contains two sisters, giving four DNA molecules per daughter. Sister copies do not form another homologous set.'},
 {id:'meiosis-two',title:'Use the copies already made',pairs:2,stages:['meiosis-one','meiosis-two'],objectives:[...IDS],prompt:'What supplies the DNA for the second meiotic division?',predictions:[['existing-sisters','The existing sister copies separate; no new S phase'],['replicate-again','Each chromosome is copied again before separating'],['halve-types','Each product loses half its chromosome types'],['unsure','I’m not sure yet']],correct:'existing-sisters',reasonPrompt:'What does meiosis II change in each haploid daughter lineage?',reasons:[['sisters','Sisters separate; one complete set remains in each product'],['ploidy','Ploidy halves again, leaving half a set'],['homologs','The same homologs reunite before separating again']],correctReason:'sisters',explanation:'The two meiosis-I daughters already hold the sister copies made in the original S phase. Meiosis II separates those copies. Each of the four final products has one A and one B, each unreplicated: two chromosomes, two DNA molecules, and one complete set.'},
 {id:'one-orientation',title:'Follow one fixed orientation',pairs:2,stages:['replicated','meiosis-one','meiosis-two'],objectives:[...IDS],prompt:'Choose how each pair faces the left pole. Without crossing over, how many distinct homolog-label combinations will this one meiosis produce?',predictions:[['two-combinations','Two combinations, each in two products'],['four-combinations','Four different combinations, one per product'],['one-combination','One combination in all four products'],['unsure','I’m not sure yet']],correct:'two-combinations',reasonPrompt:'Why do two products share the same homolog labels in this model?',reasons:[['copies','They receive sisters from the same first-division daughter, without crossing over'],['forced','All homolog pairs must have the same orientation'],['new','Meiosis II invents two new homolog types']],correctReason:'copies',explanation:'One fixed orientation sends one combination to the left and the complementary combination to the right. Without crossing over or mutation, the sisters within each daughter have the same whole-homolog labels. Separating them makes two products of each combination. Real crossing over can make sister DNA sequences differ; it is explicitly excluded here.'},
 {id:'many-orientations',title:'Compare a species with three pairs',pairs:3,stages:['replicated','meiosis-one','meiosis-two'],objectives:[...IDS],prompt:'Now there are three independently orienting pairs. Across many meioses, how many whole-homolog combinations could reach a chosen product?',predictions:[['eight-combinations','Eight: two choices for each of three pairs'],['six-combinations','Six: one for each starting chromosome'],['four-combinations','Four: one for each product of a single meiosis'],['unsure','I’m not sure yet']],correct:'eight-combinations',reasonPrompt:'What does the eight-entry orientation survey count?',reasons:[['possible','Possible homolog combinations across different meioses'],['products','Eight products from this one starting cell'],['sets','Eight chromosome sets inside each product']],correctReason:'possible',explanation:'The three independent choices multiply: 2 × 2 × 2 = 8. The survey fixes a labeled left pole and enumerates its possible homolog combinations across separate meioses. Complementary orientations reverse left and right; they are distinct possible combinations at the chosen pole, not eight distinct unordered divisions. A single meiosis still produces four haploid cells, each with three chromosomes.'}
]);
const STAGE_LABELS={g1:'G1 · before DNA copying',replicated:'After S · joined sister pairs','mitotic-anaphase':'Mitotic anaphase · one cell, two poles','mitotic-daughters':'After mitosis and cytokinesis','meiosis-one':'After meiosis I and cytokinesis','meiosis-two':'After meiosis II and cytokinesis'};
const validPairs=x=>Number.isInteger(x)&&x>=1&&x<=3;
function validated(pairs,orientation){if(!validPairs(pairs)||!Number.isInteger(orientation)||orientation<0||orientation>=2**pairs)throw new RangeError('Use 1–3 homolog pairs and an orientation within its binary choice space.');}
const chromosome=(pair,homolog,replicated,copy=0)=>({pair,homolog,label:`${'ABC'[pair]}${homolog+1}`,replicated,dnaMolecules:replicated?2:1,copy});
/** Whole-homolog labels only: no crossing over, mutation, chromosome loss, or unequal product loss. */
export function assortmentProducts({pairs=2,orientation=0}={}){
 validated(pairs,orientation);
 const left=Array.from({length:pairs},(_,i)=>`${'ABC'[i]}${((orientation>>i)&1)+1}`);
 const right=Array.from({length:pairs},(_,i)=>`${'ABC'[i]}${2-((orientation>>i)&1)}`);
 return [left.slice(),left.slice(),right.slice(),right.slice()];
}
export function divisionInventory({pairs=2,stage='g1',orientation=0}={}){
 validated(pairs,orientation);if(!Object.hasOwn(STAGE_LABELS,stage))throw new RangeError('Unknown chromosome stage.');
 const all=replicated=>Array.from({length:pairs},(_,i)=>[chromosome(i,(orientation>>i)&1,replicated),chromosome(i,((orientation>>i)&1)^1,replicated)]).flat();
 const side=(right,replicated)=>Array.from({length:pairs},(_,i)=>chromosome(i,((orientation>>i)&1)^(right?1:0),replicated));
 const cell=(chromosomes,ploidy,poles=null)=>({chromosomes,chromosomeCount:chromosomes.length,dnaCount:chromosomes.reduce((s,c)=>s+c.dnaMolecules,0),ploidy,poles});
 let cells;
 if(stage==='g1'||stage==='replicated')cells=[cell(all(stage==='replicated'),2)];
 if(stage==='mitotic-anaphase'){
  const poles=[all(false),all(false).map(c=>({...c,copy:1}))];cells=[cell(poles.flat(),null,poles)];
 }
 if(stage==='mitotic-daughters')cells=[cell(all(false),2),cell(all(false).map(c=>({...c,copy:1})),2)];
 if(stage==='meiosis-one')cells=[cell(side(false,true),1),cell(side(true,true),1)];
 if(stage==='meiosis-two')cells=[cell(side(false,false),1),cell(side(false,false).map(c=>({...c,copy:1})),1),cell(side(true,false),1),cell(side(true,false).map(c=>({...c,copy:1})),1)];
 return {pairs,stage,orientation,cells,totalChromosomes:cells.reduce((n,c)=>n+c.chromosomeCount,0),totalDna:cells.reduce((n,c)=>n+c.dnaCount,0)};
}
const initial=()=>({version:1,caseIndex:0,phase:'predict',prediction:null,orientation:0,step:0,measured:false,surveyed:false,reason:null,help:false});
function normalize(raw){
 const s=initial();if(!raw||typeof raw!=='object'||Array.isArray(raw))return s;
 if(Number.isInteger(raw.caseIndex)&&raw.caseIndex>=0&&raw.caseIndex<DIVISION_CASES.length)s.caseIndex=raw.caseIndex;
 const c=DIVISION_CASES[s.caseIndex];s.help=raw.help===true;
 if(s.caseIndex>=4&&Number.isInteger(raw.orientation)&&raw.orientation>=0&&raw.orientation<2**c.pairs)s.orientation=raw.orientation;
 if(c.predictions.some(([id])=>id===raw.prediction))s.prediction=raw.prediction;
 if(s.prediction&&['observe','reason','explained','complete'].includes(raw.phase)){
  s.phase=raw.phase;s.step=Number.isInteger(raw.step)&&raw.step>=0&&raw.step<c.stages.length?raw.step:0;s.measured=raw.measured===true;
  s.surveyed=s.caseIndex===5&&raw.surveyed===true&&s.step===c.stages.length-1;
  if(s.phase!=='observe'){
   s.step=c.stages.length-1;s.measured=true;s.surveyed=s.caseIndex===5;
   if(c.reasons.some(([id])=>id===raw.reason))s.reason=raw.reason;
   if(['explained','complete'].includes(s.phase)&&!s.reason)s.phase='reason';
   if(s.phase==='complete'&&s.caseIndex!==DIVISION_CASES.length-1)s.phase='explained';
  }
 }
 return s;
}
function reduce(raw,action,value){
 const s=normalize(raw),c=DIVISION_CASES[s.caseIndex];
 if(action==='restart')return initial();
 if(action==='retry')return {...initial(),caseIndex:s.caseIndex};
 if(action==='help')return {...s,help:!s.help};
 if(s.phase==='predict'){
  if(action==='flip'&&s.caseIndex>=4&&/^[0-2]$/.test(String(value))&&Number(value)<c.pairs)return {...s,orientation:s.orientation^(1<<Number(value)),prediction:null};
  if(action==='predict'&&c.predictions.some(([id])=>id===value))return {...s,prediction:value};
  if(action==='commit'&&s.prediction)return {...s,phase:'observe'};
 }
 if(s.phase==='observe'){
  if(action==='measure')return {...s,measured:true};
  if(action==='advance'&&s.step<c.stages.length-1)return {...s,step:s.step+1,measured:false,surveyed:false};
  if(action==='survey'&&s.caseIndex===5&&s.step===c.stages.length-1&&s.measured)return {...s,surveyed:true};
  if(action==='reason'&&s.step===c.stages.length-1&&s.measured&&(s.caseIndex!==5||s.surveyed))return {...s,phase:'reason'};
 }
 if(s.phase==='reason'){
  if(action==='choose-reason'&&c.reasons.some(([id])=>id===value))return {...s,reason:value};
  if(action==='commit-reason'&&s.reason)return {...s,phase:'explained'};
 }
 if(action==='next'&&s.phase==='explained')return s.caseIndex===DIVISION_CASES.length-1?{...s,phase:'complete'}:{...initial(),caseIndex:s.caseIndex+1};
 return s;
}
const text=(x,y,t,size=16,extra='')=>`<text x="${x}" y="${y}" font-size="${size}" fill="#173c35" ${extra}>${esc(t)}</text>`;
function chromosomeSVG(c,x,y,small=false){
 const length=(c.pair===0?60:c.pair===1?42:50)*(small?.64:1),offset=c.replicated?6:0,color=c.homolog===0?'#ad572d':'#247a79';
 const line=(dx,sister)=>`<path data-dna="${c.label}-${c.copy}-${sister}" d="M${x+dx} ${y-length/2}L${x-dx} ${y+length/2}" stroke="${color}" stroke-width="7" stroke-linecap="round" fill="none"/>`;
 return `<g data-chromosome="${c.label}" data-replicated="${c.replicated}" aria-label="${c.label}: ${c.replicated?'two joined sisters, one chromosome':'one unreplicated chromosome'}">${c.replicated?line(-offset,0)+line(offset,1):line(0,0)}<rect data-count-unit="1" x="${x-8}" y="${y-3}" width="16" height="6" rx="3" fill="#263b37"/>${text(x,y+length/2+18,c.label,small?13:15,'text-anchor="middle"')}</g>`;
}
function scene(raw){
 const s=normalize(raw),c=DIVISION_CASES[s.caseIndex],stage=c.stages[s.phase==='predict'?0:s.step],m=divisionInventory({pairs:c.pairs,stage,orientation:s.orientation});
 const measured=s.phase!=='predict'&&s.measured,boxes=m.cells.length,small=boxes===4;
 let picture=`<rect width="640" height="490" rx="22" fill="#f2f5df"/>${text(320,31,c.title,23,'text-anchor="middle"')}${text(320,58,STAGE_LABELS[stage],17,'text-anchor="middle"')}${text(320,81,`Starting species: 2n = ${c.pairs*2}; A, B${c.pairs===3?', C':''} are different chromosome types`,14,'text-anchor="middle"')}`;
 m.cells.forEach((cell,index)=>{
  const x=boxes===1?20:20+(index%2)*310,y=small?101+Math.floor(index/2)*145:101,w=boxes===1?600:290,h=small?135:280;
  picture+=`<rect data-cell="${index}" x="${x}" y="${y}" width="${w}" height="${h}" rx="24" fill="#fffdf1" stroke="#699b7e" stroke-width="2"/>${text(x+w/2,y+23,boxes===1?'One undivided cell':`Cell ${index+1}`,15,'text-anchor="middle"')}`;
  if(cell.poles){
   picture+=`<path d="M320 140V310" stroke="#9aa99b" stroke-dasharray="5 6"/>`;
   cell.poles.forEach((list,pole)=>{const left=45+pole*305;picture+=text(left+122,161,pole?'Right pole group':'Left pole group',14,'text-anchor="middle"');list.forEach((chr,i)=>picture+=chromosomeSVG(chr,left+(i+.5)*245/list.length,229));});
  }else cell.chromosomes.forEach((chr,i)=>picture+=chromosomeSVG(chr,x+16+(i+.5)*(w-32)/cell.chromosomes.length,y+(small?65:130),small));
  if(measured){
   const line=`${cell.chromosomeCount} chromosomes · ${cell.dnaCount} DNA molecules`;
   picture+=text(x+w/2,y+h-(small?9:43),line,small?12:15,'text-anchor="middle"');
   if(!small)picture+=text(x+w/2,y+h-18,cell.ploidy===null?`${c.pairs*2} chromosomes at each pole; cytokinesis pending`:cell.ploidy===2?'Two homologous sets · diploid':'One homologous set · haploid',13,'text-anchor="middle"');
  }
 });
 picture+=text(320,414,'Orange / label 1 and teal / label 2 distinguish the two homologs.',14,'text-anchor="middle"')+text(320,438,'Each rod = one DNA molecule; joined pair = one replicated chromosome.',14,'text-anchor="middle"')+text(320,462,measured?`Across all drawn cells: ${m.totalChromosomes} chromosomes; ${m.totalDna} DNA molecules.`:'Count first, then open the inventory readout after committing your prediction.',13,'text-anchor="middle"');
 const inventory=measured?m.cells.map((cell,i)=>`Cell ${i+1}: ${cell.chromosomeCount} chromosomes and ${cell.dnaCount} DNA molecules.`).join(' '):'Inventory readout is closed.';
 let html=svg(`${c.title}. ${STAGE_LABELS[stage]}. ${boxes} cell${boxes===1?'':'s'} drawn. ${inventory}`,picture,'0 0 640 490');
 html+='<p class="exp-caption">This is a counting diagram, not a microscope image: chromosomes are drawn as compact rods even in G1 and after division. A dark clasp marks one chromosome counting unit, not a claim that centromeric DNA is unreplicated. Labels identify homologs; color is a redundant cue. Cell borders determine the counting boundary.</p>';
 if(s.surveyed){const rows=Array.from({length:2**c.pairs},(_,i)=>assortmentProducts({pairs:c.pairs,orientation:i})[0].join(' + '));html+=`<div class="exp-case-givens"><strong>Orientation survey · one chosen product across separate meioses</strong><ol>${rows.map(row=>`<li>${esc(row)}</li>`).join('')}</ol><p>${rows.length} possible combinations; each row is a different orientation of a fresh starting cell. This table is not eight products of one meiosis.</p></div>`;}
 return html;
}
function predictionText(s){const c=DIVISION_CASES[s.caseIndex];return c.predictions.find(([id])=>id===s.prediction)?.[1]||'';}
function view(raw){
 const s=normalize(raw),c=DIVISION_CASES[s.caseIndex],last=s.step===c.stages.length-1,done=s.phase==='complete';
 let prompt=c.prompt,coach='',controls='',primary={action:'commit',label:'Commit my prediction',disabled:!s.prediction};
 if(s.phase==='predict'){
  if(s.caseIndex>=4){controls+=group('Orient homolog pairs toward the left pole',Array.from({length:c.pairs},(_,i)=>button(`Flip pair ${'ABC'[i]} · ${'ABC'[i]}${((s.orientation>>i)&1)+1} currently faces left`,'flip',String(i))).join(''))+'<p>Changing a pair changes its displayed left-to-right order and clears the uncommitted prediction. Each pair can be oriented independently.</p>';}
  controls+=group('Predict before running the division',c.predictions.map(([id,label])=>button(label,'predict',id,{selected:s.prediction===id})).join(''));
  if(s.help)coach='Trace labels, not just shapes. Homologs share a chromosome type but have different 1/2 labels; sisters copy one label. State whether you are counting one cell or all cells.';
 }else if(s.phase==='observe'){
  prompt='Advance the stated process and inspect what actually moves. Open the readout to compare your count.';
  coach=`Your committed prediction: ${predictionText(s)}. ${last&&s.measured?(s.prediction===c.correct?'The final observation agrees with it. ':'Compare it with the final observation. ')+c.explanation:'Your prediction stays recorded while you inspect the evidence.'}`;
  controls+=group('Measure this stage',button('Count chromosomes and DNA molecules','measure','',{selected:s.measured}));
  if(!last)primary={action:'advance',label:`Run the next step: ${STAGE_LABELS[c.stages[s.step+1]]}`};
  else if(!s.measured)primary={action:'measure',label:'Read the final chromosome and DNA inventory'};
  else if(s.caseIndex===5&&!s.surveyed)primary={action:'survey',label:'Survey all independent pair orientations'};
  else primary={action:'reason',label:'Explain the observation'};
 }else if(s.phase==='reason'){
  prompt=c.reasonPrompt;coach=`Your original prediction remains: ${predictionText(s)}.`;
  controls+=group('Explain from the visible evidence',c.reasons.map(([id,label])=>button(label,'choose-reason',id,{selected:s.reason===id})).join(''));
  primary={action:'commit-reason',label:'Compare my explanation with the model',disabled:!s.reason};
 }else{
  prompt=done?'Chromelle’s six investigations are complete. A separate task will check what transfers.':'Carry the chromosome identities into a changed case.';
  coach=`${s.reason===c.correctReason?'Your explanation fits the evidence. ':'Revise the explanation using the evidence. '}${c.explanation} Your original prediction: ${predictionText(s)}.`;
  primary=done?{action:'restart',label:'Explore the chromosome archive again'}:{action:'next',label:s.caseIndex===5?'Finish the discovery':'Try the next chromosome case'};
 }
 controls=`<p class="exp-case-givens"><strong>${esc(c.title)}.</strong> Chromelle is restoring the Conservatory’s chromosome archive after Team Entropy mixed the labels. Follow the same DNA copies through each announced step.</p>`+controls;
 controls+=group('Workbench tools',button(s.help?'Put the clue away':'Ask Chromelle for a clue','help','',{selected:s.help})+button('Restart this case','retry')+button('Restart all cases','restart'));
 controls+='<p class="exp-note">Model contract: a fictional eukaryotic cell starts diploid; the displayed 2n states its chromosome count before replication. Each chromatid contains one double-stranded DNA molecule. DNA is copied once before a division route. Homolog pairs orient independently; normal separation and cytokinesis occur as announced. Crossing over, mutation, chromosome loss and asymmetric product loss are excluded, so whole-homolog labels remain intact. Diagrams omit spindle mechanics and stage timing. This activity is instruction only and awards no score or mastery.</p>';
 return {activeObjectiveIds:[...c.objectives],scene:scene(s),prompt,coach,controls,primary,progress:{current:done?6:s.caseIndex+1,total:6,label:`Archive ${s.caseIndex+1}/6 · ${s.phase}`},complete:done};
}
const familiarFamilyIds=Object.freeze(['bio-division-stage-inventory','bio-division-replication-conservation','bio-division-anaphase-boundary','bio-division-separating-units','bio-division-outcome-comparison','bio-division-no-second-s','bio-division-set-identity','bio-division-many-meioses-assortment','bio-division-one-meiosis-products']);
export default Object.freeze({id:'bio-cell-division-discovery',title:'Chromelle’s Chromosome Conservatory',world:'bio',objectiveIds:IDS,version:1,sourceUrls:SOURCE_URLS,familiarFamilyIds,instructionFamilies:[...familiarFamilyIds],initial,normalize,reduce,view});
