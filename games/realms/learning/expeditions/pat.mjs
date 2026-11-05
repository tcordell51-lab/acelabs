// Original instructional PAT cases. No assessment-bank imports or scored evidence.
import {button, esc, svg, group} from './shared.mjs';

const SOURCE='https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/perceptual_ability_test_section_instructions.pdf';
const freeze=o=>{if(o&&typeof o==='object'){Object.values(o).forEach(freeze);Object.freeze(o);}return o;};
const SIZE=6, LABELS=['A','B','C','D'];
const integer=(v,low,high,fallback)=>Number.isInteger(v)&&v>=low&&v<=high?v:fallback;
const obj=v=>v&&typeof v==='object'&&!Array.isArray(v)?v:{};
const number=v=>Math.round(v*1e6)/1e6;
const setEqual=(a,b)=>a.length===b.length&&a.every(v=>b.includes(v));
const phase=v=>v==='observed'?'observed':'predict';
const cellKey=([x,y])=>y*SIZE+x;
const point=k=>[k%SIZE,Math.floor(k/SIZE)];
const mirror=([x,y],fold)=>fold==='right'?[SIZE-1-x,y]:[x,SIZE-1-y];
const foldName=fold=>fold==='right'?'left half → right':'bottom half → top';
const creaseName=fold=>fold==='right'?'vertical':'horizontal';

export const PAT_PAPER_CASES=freeze({
  one:[
    {name:'The ferry seal',folds:['right'],punch:[5,1],change:'Start with one left-to-right half-fold.'},
    {name:'A moved punch',folds:['right'],punch:[4,3],change:'The fold stays the same. Only the punch location changes.'},
    {name:'A different crease',folds:['up'],punch:[2,0],change:'Now the bottom half folds upward. Track the moving paper.'}
  ],
  two:[
    {name:'The layered lock',folds:['right','up'],punch:[4,1],change:'Two full half-folds. Open the most recent fold first.'},
    {name:'The corner seal',folds:['right','up'],punch:[5,2],change:'Keep both folds. Move only the punch and predict again.'},
    {name:'The reversed sequence',folds:['up','right'],punch:[3,0],change:'The fold order changes: bottom goes up before left goes right.'}
  ]
});

/** Original-grid cell coordinates after undoing zero, one, ... folds. */
export function paperStates(example){
  let holes=[cellKey(example.punch)];const states=[holes];
  for(const fold of [...example.folds].reverse()){
    holes=[...new Set([...holes,...holes.map(k=>cellKey(mirror(point(k),fold)))])].sort((a,b)=>a-b);
    states.push(holes);
  }
  return states;
}
function presentCell(k,folds){const[x,y]=point(k);return (!folds.includes('right')||x>=3)&&(!folds.includes('up')||y<3);}
function cellsFor(example,stage){const remaining=example.folds.slice(0,example.folds.length-stage-1);return Array.from({length:36},(_,k)=>k).filter(k=>presentCell(k,remaining));}
function marksOf(value,allowed){return Array.isArray(value)?[...new Set(value.filter(v=>Number.isInteger(v)&&allowed.includes(v)))].slice(0,36):[];}
const paperInitial=()=>({caseIndex:0,stage:0,phase:'predict',marks:[],history:[],focusCell:0,help:false,unsure:false});
function normalizePaper(value,cases){
  const raw=obj(value),caseIndex=integer(raw.caseIndex,0,cases.length-1,0),c=cases[caseIndex],stage=integer(raw.stage,0,c.folds.length-1,0),allowed=cellsFor(c,stage);
  const marks=marksOf(raw.marks,allowed),p=phase(raw.phase),unsure=raw.unsure===true;
  return {caseIndex,stage,phase:p==='observed'&&(marks.length||unsure)?p:'predict',marks,
    history:Array.isArray(raw.history)?raw.history.slice(-36).filter(Array.isArray).map(h=>marksOf(h,allowed)):[],
    focusCell:allowed.includes(raw.focusCell)?raw.focusCell:allowed[0],help:raw.help===true,unsure};
}
function reducePaper(value,action,payload,cases){
  const s=normalizePaper(value,cases),c=cases[s.caseIndex];
  if(action==='restart')return normalizePaper(paperInitial(),cases);
  if(action==='reset')return normalizePaper({...paperInitial(),caseIndex:s.caseIndex},cases);
  if(action==='help')return {...s,help:!s.help};
  const k=typeof payload==='number'?payload:/^\d+$/.test(String(payload))?Number(payload):-1,allowed=cellsFor(c,s.stage);
  if(action==='focus-cell'&&allowed.includes(k))return {...s,focusCell:k};
  if(action==='cell'&&s.phase==='predict'&&allowed.includes(k))return {...s,focusCell:k,history:[...s.history,s.marks].slice(-36),marks:s.marks.includes(k)?s.marks.filter(x=>x!==k):[...s.marks,k],unsure:false};
  if(action==='undo'&&s.phase==='predict'&&s.history.length)return {...s,marks:s.history.at(-1),history:s.history.slice(0,-1)};
  if(action==='clear'&&s.phase==='predict')return {...s,history:[...s.history,s.marks].slice(-36),marks:[],unsure:false};
  if((action==='unfold'&&s.marks.length||action==='unsure')&&s.phase==='predict')return {...s,phase:'observed',unsure:action==='unsure'};
  if(action==='next-layer'&&s.phase==='observed'&&s.stage<c.folds.length-1)return normalizePaper({...s,stage:s.stage+1,phase:'predict',marks:[],history:[],focusCell:0,unsure:false},cases);
  if(action==='next-case'&&s.phase==='observed'&&s.stage===c.folds.length-1&&s.caseIndex<cases.length-1)return normalizePaper({...paperInitial(),caseIndex:s.caseIndex+1},cases);
  return s;
}
const text=(x,y,content,size=16,extra='')=>`<text x="${x}" y="${y}" text-anchor="middle" font-size="${size}" fill="currentColor" ${extra}>${esc(content)}</text>`;
function paperPacket(example,stage,revealed){
  const states=paperStates(example),opened=stage+(revealed?1:0),folds=example.folds.slice(0,example.folds.length-opened),v=folds.includes('right'),h=folds.includes('up'),left=v?150:30,top=30,width=v?120:240,height=h?120:240;
  let body='<rect x="30" y="30" width="240" height="240" rx="4" fill="#e9e8dc" stroke="#7e8983" stroke-dasharray="6 5"/>';
  body+=`<rect x="${left}" y="${top}" width="${width}" height="${height}" fill="#fff9e5" stroke="#264d4b" stroke-width="3"/>`;
  for(let i=1;i<6;i++){const n=30+i*40;if(n>left&&n<left+width)body+=`<path d="M${n} ${top}v${height}" stroke="#d2d7c5"/>`;if(n<top+height)body+=`<path d="M${left} ${n}h${width}" stroke="#d2d7c5"/>`;}
  const next=example.folds[example.folds.length-opened-1];
  if(next==='right')body+='<path d="M150 24V276 M138 132H74 l12 -9 M74 132l12 9" fill="none" stroke="#ad7542" stroke-width="3" stroke-dasharray="5 3"/>';
  if(next==='up')body+='<path d="M24 150H276 M224 138v76 l-9 -12 M224 214l9 -12" fill="none" stroke="#ad7542" stroke-width="3" stroke-dasharray="5 3"/>';
  for(const k of states[opened]){const[x,y]=point(k);body+=`<circle cx="${50+x*40}" cy="${50+y*40}" r="10" fill="#254d62" stroke="#fff9e5" stroke-width="2"/>`;}
  body+=text(150,302,revealed?(folds.length?'One layer opened':'Fully opened sheet'):'Punched packet',18);
  const alt=`${revealed?'Observed paper':'Given folded paper'}. ${folds.length?folds.map(foldName).join('; '):'Flat original sheet'}. Visible holes: ${states[opened].map(k=>{const[x,y]=point(k);return `row ${y+1}, column ${x+1}`;}).join('; ')}. Dashed boundary is the original sheet.`;
  return svg(alt,body,'0 0 300 320');
}
function paperGrid(s,c){
  const allowed=cellsFor(c,s.stage),expected=paperStates(c)[s.stage+1],revealed=s.phase==='observed';
  let rows='';for(let y=0;y<6;y++){let cells='';for(let x=0;x<6;x++){
    const k=y*6+x,inside=allowed.includes(k),picked=s.marks.includes(k),actual=revealed&&expected.includes(k);
    const status=!inside?'No paper at this stage':revealed?(actual?(picked?'Matched hole':'Missed hole'):(picked?'Extra mark':'No hole')):(picked?'Predicted hole':'Unmarked');
    const ink=actual?(picked?'#24554e':'#895515'):picked&&revealed?'#814251':'#284d60',fill=actual?(picked?'#d3e6cf':'#f6dfac'):picked?'#dce5ec':inside?'#fffaf0':'#e8e7e1';
    const symbol=!inside?'':actual?(picked?'●':'⊕'):picked?(revealed?'×':'●'):'·';
    cells+=`<div role="gridcell" style="min-width:0"><button type="button" class="exp-pat-cell" data-exp-action="cell" data-value="${k}"${k===s.focusCell?' data-pat-focus="true"':''} tabindex="${k===s.focusCell?0:-1}" aria-label="Row ${y+1}, column ${x+1}: ${status}" aria-pressed="${picked}"${!inside?' disabled':''} style="width:100%;min-height:44px;aspect-ratio:1;border:2px ${inside?'solid':'dashed'} #a6b6a9;border-radius:6px;background:${fill};color:${ink};font-size:24px;line-height:1">${symbol}</button></div>`;
  }rows+=`<div role="row" style="display:contents">${cells}</div>`;}
  return `<div class="exp-pat-grid" role="grid" data-exp-grid="6" data-exp-columns="6" aria-label="${revealed?'Prediction compared with opened paper':'Mark predicted holes after the next unfolding'}" aria-readonly="${revealed}" aria-rowcount="6" aria-colcount="6" style="display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:3px;width:100%;max-width:348px">${rows}</div>`;
}
function paperView(value,cases){
  const s=normalizePaper(value,cases),c=cases[s.caseIndex],observed=s.phase==='observed',lastLayer=s.stage===c.folds.length-1,lastCase=s.caseIndex===cases.length-1,expected=paperStates(c)[s.stage+1];
  const matched=expected.filter(k=>s.marks.includes(k)).length,missed=expected.length-matched,extra=s.marks.filter(k=>!expected.includes(k)).length,fold=c.folds[c.folds.length-s.stage-1];
  const complete=observed&&lastLayer&&lastCase;
  const prompt=observed?(lastLayer?'Compare the opened seal with your marks.':'Compare this layer. The first fold is still closed.'):`Mark every hole you expect after opening the ${creaseName(fold)} crease${lastLayer?' onto the full sheet':'; keep the other fold closed'}.`;
  const explanation=fold==='right'?'Opening the vertical crease changes left/right positions; each hole stays in its row.':'Opening the horizontal crease changes top/bottom positions; each hole stays in its column.';
  const coach=observed?`${s.unsure?'Watch what the folded layers reveal. ':setEqual(s.marks,expected)?'Your marks match this opened layer. ':`${missed} missed hole${missed===1?'':'s'}; ${extra} extra mark${extra===1?'':'s'}. `}${explanation}${complete?' You compared three instructional seals. This is practice, not a checkpoint result.':''}`:s.help?'A crease is the line where the paper bends. Imagine opening only the most recent fold. A punch passes through every paper layer under it.':'Cubit: “Keep the paper facing the same way. Tap a mark again to remove it.”';
  const controls=group('Paper tools',button('Undo last mark','undo','',{disabled:observed||!s.history.length})+button('Clear my marks','clear','',{disabled:observed||!s.marks.length})+button(s.help?'Hide the nudge':'Give me a nudge','help')+(!observed?button('Show this layer','unsure'):'')+button('Start this seal again','reset'));
  let primary=observed?(lastLayer?(lastCase?{action:'restart',label:'Experiment again'}:{action:'next-case',label:'Try the next seal'}):{action:'next-layer',label:'Predict the final unfolding'}):{action:'unfold',label:'Unfold and compare',disabled:!s.marks.length};
  const scene=`<div class="exp-pat-workbench"><p class="exp-scene-caption"><strong>${esc(c.name)}</strong> · ${esc(c.change)}</p><ol class="exp-pat-folds">${c.folds.map((f,i)=>`<li>Fold ${i+1}: ${esc(foldName(f))}</li>`).join('')}<li>Punch through the folded layers.</li></ol><div style="display:flex;flex-wrap:wrap;align-items:start;justify-content:center;gap:18px"><div style="flex:1 1 240px;max-width:300px">${paperPacket(c,s.stage,observed)}</div><div style="flex:1 1 280px;max-width:348px"><p><strong>${observed?'Your prediction + observed holes':'Your prediction'}</strong></p>${paperGrid(s,c)}<p class="exp-caption">Rows run top to bottom; columns run left to right. Use arrow keys to move and Space or Enter to mark.</p></div></div>${observed?'<p class="exp-pat-legend"><strong>●</strong> Matched hole · <strong>⊕</strong> Missed hole · <strong>×</strong> Extra mark. Dashed cells have no paper at this stage.</p>':'<p class="exp-caption">Solid paper stays inside the dashed original square. The sheet never turns or twists.</p>'}</div>`;
  const steps=c.folds.length*2;
  return {scene,prompt,coach,controls,primary,progress:{current:s.caseIndex*steps+s.stage*2+(observed?2:1),total:cases.length*steps,label:`Seal ${s.caseIndex+1} of ${cases.length} · ${observed?'observed':'prediction'} ${s.stage+1}`},complete};
}

// Angles are newly authored instructional values, never imported assessment cases.
export const PAT_ANGLE_CASES=freeze({
  compare:[
    {name:'The first switch',degrees:[32,47],rotations:[12,182],lengths:[78,104],change:'Which gate has the smaller opening?'},
    {name:'Wider gates',degrees:[112,101],rotations:[218,48],lengths:[102,72],change:'Both gates are wider than a right angle. Compare their openings.'},
    {name:'A closer pair',degrees:[58,66],rotations:[275,140],lengths:[70,106],change:'Ignore the arm endpoints. Compare the opening near each vertex.'}
  ],
  rank:[
    {name:'Four signal gates',degrees:[24,71,42,98],rotations:[30,160,285,75],lengths:[102,77,88,72],change:'Place each gate once, from smallest opening to largest.'},
    {name:'The gates turn',degrees:[24,71,42,98],rotations:[245,15,135,305],lengths:[68,104,75,96],change:'The same four openings now face different directions with changed arm lengths. Does their order change?'},
    {name:'A wider switchyard',degrees:[136,108,119,84],rotations:[150,30,230,290],lengths:[78,105,70,93],change:'A new set of openings: rebuild the smallest-to-largest order.'}
  ]
});
const angleInitial=()=>({caseIndex:0,phase:'predict',order:[],choice:null,aligned:false,focusAngle:'A',rotations:[0,0,0,0],reflected:[false,false,false,false],scales:[1,1,1,1],help:false,unsure:false});
function normalizeAngles(value,cases,ranking){
  const raw=obj(value),caseIndex=integer(raw.caseIndex,0,cases.length-1,0),labels=LABELS.slice(0,cases[caseIndex].degrees.length),order=Array.isArray(raw.order)?[...new Set(raw.order.filter(x=>labels.includes(x)))]:[],choice=labels.includes(raw.choice)?raw.choice:null,unsure=raw.unsure===true;
  const observed=raw.phase==='observed'&&(unsure||(ranking?order.length===labels.length:choice!==null));
  return {caseIndex,phase:observed?'observed':'predict',order,choice,aligned:observed&&raw.aligned===true,focusAngle:labels.includes(raw.focusAngle)?raw.focusAngle:'A',
    rotations:LABELS.map((_,i)=>observed?integer(raw.rotations?.[i],0,11,0):0),reflected:LABELS.map((_,i)=>observed&&raw.reflected?.[i]===true),scales:LABELS.map((_,i)=>observed&&[.7,1].includes(raw.scales?.[i])?raw.scales[i]:1),help:raw.help===true,unsure};
}
function reduceAngles(value,action,payload,cases,ranking){
  const s=normalizeAngles(value,cases,ranking),labels=LABELS.slice(0,cases[s.caseIndex].degrees.length);
  if(action==='restart')return normalizeAngles(angleInitial(),cases,ranking);
  if(action==='reset')return normalizeAngles({...angleInitial(),caseIndex:s.caseIndex},cases,ranking);
  if(action==='help')return {...s,help:!s.help};
  if(action==='pick'&&s.phase==='predict'&&labels.includes(payload))return ranking?{...s,order:s.order.includes(payload)?s.order.filter(x=>x!==payload):[...s.order,payload],unsure:false}:{...s,choice:payload,unsure:false};
  if(action==='undo'&&s.phase==='predict')return ranking?{...s,order:s.order.slice(0,-1)}:{...s,choice:null};
  if((action==='compare'&&(ranking?s.order.length===labels.length:s.choice!==null)||action==='unsure')&&s.phase==='predict')return {...s,phase:'observed',unsure:action==='unsure'};
  if(action==='next-case'&&s.phase==='observed'&&s.caseIndex<cases.length-1)return normalizeAngles({...angleInitial(),caseIndex:s.caseIndex+1},cases,ranking);
  if(s.phase!=='observed')return s;
  if(action==='align')return {...s,aligned:!s.aligned};
  if(action==='focus-angle'&&labels.includes(payload))return {...s,focusAngle:payload};
  const i=labels.indexOf(s.focusAngle);
  if(action==='rotate')return {...s,rotations:s.rotations.map((v,k)=>k===i?(v+1)%12:v),aligned:false};
  if(action==='reflect')return {...s,reflected:s.reflected.map((v,k)=>k===i?!v:v),aligned:false};
  if(action==='length')return {...s,scales:s.scales.map((v,k)=>k===i?(v===1?.7:1):v)};
  return s;
}
/** SVG coordinates use one equal scale on both axes. Only rigid motion/reflection
 * and uniform ray-length changes are offered; no control changes the opening. */
export function angleRays(degrees,rotation,length,reflected=false){
  return [rotation,rotation+(reflected?-degrees:degrees)].map(d=>[number(length*Math.cos(d*Math.PI/180)),number(-length*Math.sin(d*Math.PI/180))]);
}
function angleScene(s,c,ranking){
  const revealed=s.phase==='observed',colors=['#305c70','#8a513b','#596c38','#795880'];
  const panels=c.degrees.map((degrees,i)=>{
    const ox=i%2*300,oy=Math.floor(i/2)*280,cx=ox+150,cy=oy+130,length=c.lengths[i]*s.scales[i],rotation=s.aligned?0:c.rotations[i]+s.rotations[i]*30;
    const rays=angleRays(degrees,rotation,length,s.aligned?false:s.reflected[i]);
    return `<g data-pat-angle="${LABELS[i]}"><rect x="${ox+8}" y="${oy+8}" width="284" height="264" rx="16" fill="#fff9e5" stroke="#c5c9b5"/>${rays.map(([x,y],j)=>`<line data-pat-ray="${j}" x1="${cx}" y1="${cy}" x2="${number(cx+x)}" y2="${number(cy+y)}" stroke="${colors[i]}" stroke-width="5" stroke-linecap="round"/>`).join('')}<circle cx="${cx}" cy="${cy}" r="4" fill="${colors[i]}"/>${text(cx,oy+260,revealed?`${LABELS[i]} · ${degrees}°`:LABELS[i],22)}</g>`;
  }).join('');
  return svg(`${ranking?'Four':'Two'} angle openings labelled ${LABELS.slice(0,c.degrees.length).join(', ')}. Equal horizontal and vertical scale. ${revealed?'Measurements are now shown; transformation tools preserve each opening.':'No measurements or alignment aids are shown before your prediction.'}`,panels,`0 0 600 ${ranking?560:280}`);
}
function angleView(value,cases,ranking){
  const s=normalizeAngles(value,cases,ranking),c=cases[s.caseIndex],labels=LABELS.slice(0,c.degrees.length),revealed=s.phase==='observed',expected=labels.slice().sort((a,b)=>c.degrees[labels.indexOf(a)]-c.degrees[labels.indexOf(b)]),correct=ranking?s.order.join('')===expected.join(''):s.choice===expected[0],complete=revealed&&s.caseIndex===cases.length-1;
  const selection=ranking?`<div class="exp-angle-order" aria-label="Your smallest-to-largest order"><strong>Your order:</strong> ${s.order.length?s.order.map((l,i)=>`<span class="exp-order-token">${i+1}. ${l}</span>`).join(' → '):'Choose the smallest opening first.'}</div>`:`<p><strong>Your prediction:</strong> ${s.choice?`Gate ${s.choice} is smaller.`:'Choose a gate below.'}</p>`;
  const tools=revealed?group('Investigate the openings',button(s.aligned?'Restore their directions':'Align their first rays','align','',{selected:s.aligned})+labels.map(l=>button(`Inspect ${l}`,'focus-angle',l,{selected:s.focusAngle===l})).join('')+button(`Turn ${s.focusAngle} 30°`,'rotate')+button(`Mirror ${s.focusAngle}`,'reflect')+button(`Change ${s.focusAngle} arm length`,'length')):group(ranking?'Build your order':'Choose the smaller opening',labels.map(l=>button(ranking?(s.order.includes(l)?`Remove ${l}`:`Place ${l} next`):`Gate ${l}`,'pick',l,{selected:ranking?s.order.includes(l):s.choice===l})).join('')+button('Undo my choice','undo','',{disabled:ranking?!s.order.length:!s.choice})+button('Show me the comparison','unsure'));
  const coach=revealed?`${s.unsure?'Compare the openings at their vertices. ':correct?'Your prediction matches. ':'Keep your prediction in view while you compare. '}${ranking?`The increasing order is ${expected.join(' → ')}.`:`${expected[0]} has the smaller opening.`} Turn, mirror or shorten the drawn arms: the opening stays unchanged.${complete?' Three instructional comparisons explored; no checkpoint credit is awarded.':''}`:s.help?'The vertex is where the two arms meet. Compare the opening there, not the gap between the distant endpoints.':ranking?'Apertuft: “Tap each gate in order. Tap a selected gate again to remove it.”':'Apertuft: “Which pair of arms makes the smaller opening?”';
  return {scene:`<div class="exp-angle-workbench"><p class="exp-scene-caption"><strong>${esc(c.name)}</strong> · ${esc(c.change)}</p>${angleScene(s,c,ranking)}${selection}${revealed?'<p class="exp-caption">Alignment and measurements are teaching aids. A fresh checkpoint keeps its original diagrams until you answer.</p>':''}</div>`,
    prompt:revealed?'Inspect what changes and what stays the same.':ranking?'Build the order from smallest opening to largest.':'Choose the smaller opening. You can investigate after committing.',coach,
    controls:tools+group('More tools',button(s.help?'Hide the nudge':'Give me a nudge','help')+button('Start this comparison again','reset')),
    primary:revealed?(complete?{action:'restart',label:'Experiment again'}:{action:'next-case',label:ranking?'Try the next set':'Try the next pair'}):{action:'compare',label:ranking?'Compare my order':'Test my prediction',disabled:ranking?s.order.length!==labels.length:!s.choice},
    progress:{current:s.caseIndex*2+(revealed?2:1),total:cases.length*2,label:`Comparison ${s.caseIndex+1} of ${cases.length} · ${revealed?'investigation':'prediction'}`},complete};
}
const paper=(id,title,objective,key)=>({id,title,world:'pat',objectiveIds:[objective],version:1,sourceUrls:[SOURCE],instructionFamilies:[`instruction:${id}:half-fold-construction`],initial:()=>normalizePaper(paperInitial(),PAT_PAPER_CASES[key]),normalize:s=>normalizePaper(s,PAT_PAPER_CASES[key]),reduce:(s,a,v)=>reducePaper(s,a,v,PAT_PAPER_CASES[key]),view:s=>paperView(s,PAT_PAPER_CASES[key])});
const angles=(id,title,objective,key,ranking)=>({id,title,world:'pat',objectiveIds:[objective],version:1,sourceUrls:[SOURCE],instructionFamilies:[`instruction:${id}:${ranking?'visual-ordering':'opening-comparison'}`],initial:angleInitial,normalize:s=>normalizeAngles(s,PAT_ANGLE_CASES[key],ranking),reduce:(s,a,v)=>reduceAngles(s,a,v,PAT_ANGLE_CASES[key],ranking),view:s=>angleView(s,PAT_ANGLE_CASES[key],ranking)});
export const PAT_ACTIVITIES=freeze([
  paper('pat-mirror-ferry','Mirror Ferry','pat.one-fold','one'),
  paper('pat-layer-lock','Foldsmith’s Layer Lock','pat.two-folds','two'),
  angles('pat-angle-switchyard','Angle Switchyard','pat-angle-opening','compare',false),
  angles('pat-angle-ordering','The Four-Gate Signal','pat-angle-order','rank',true)
]);
