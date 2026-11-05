import { button, esc, group, svg } from './shared.mjs';

// Original instructional cases. These never enter the assessment bank or award mastery.
const freeze = value => { if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); } return value; };
export const QR_CASES = freeze([
  { id:'flow', title:'The leaking cistern', objectiveIds:['qr.rates'],
    values:[{inflow:18,drain:6,initial:24,target:120},{inflow:18,drain:10,initial:24,target:120}],
    change:'Only the drain changes: 6 → 10 L/h. Predict the new filling time.',
    moves:[['net','Subtract the drain rate from the inflow rate'],['sum','Add the two rates'],['time','Average the two filling times']], correctMove:'net',
    moveWhy:'The pipes work at the same time. Inflow adds water; the drain removes it. Subtract rates measured in the same units.',
    hint:'Track the change in water during one hour. Both pipes run at constant rates; account for the water already present.',
    results:[['4 h','8 h','16 h'],['8 h','12 h','24 h']] },
  { id:'base', title:'The lantern price', objectiveIds:['qr-percent-base'],
    values:[{original:75,current:90},{original:75,current:96}],
    change:'Only the new price changes: 90 → 96 coins. The original price stays 75.',
    moves:[['new','Divide the increase by the new price'],['base','Find the increase, then divide by the original price'],['difference','Use the coin increase as the percent']],correctMove:'base',
    moveWhy:'Percent increase compares the increase with the starting amount. The denominator is the original price.',
    hint:'Ask which amount represented 100% before the price changed. Coin difference and percent increase have different units.',
    results:[['15%','20%','25%'],['21%','25%','28%']] },
  { id:'chain', title:'Two market notices', objectiveIds:['qr-percent-chain'],
    values:[{start:160,up:50,down:25},{start:160,up:50,down:20}],
    change:'Only the second notice changes: a 25% discount becomes a 20% discount.',
    moves:[['subtract','Subtract the percentages, then apply once'],['old','Take both percentage changes from the initial amount'],['multiply','Apply each multiplier to the current amount']],correctMove:'multiply',
    moveWhy:'The second percentage uses the amount after the first change. Each multiplier acts on the current price.',
    hint:'First find the price after the rise. That price becomes the base for the discount.',
    results:[['160 coins','180 coins','200 coins'],['192 coins','208 coins','240 coins']] },
  { id:'equation', title:'The bridge lanterns', objectiveIds:['qr.algebra'],
    values:[{fee:8,each:3,total:35},{fee:8,each:3,total:44}],
    change:'Only the total cost changes: 35 → 44 coins. The fee and price per lantern stay fixed.',
    moves:[['divide','Divide the whole bill by the lantern price'],['equation','Define x as lanterns; write fee + price × x = total'],['add','Add the fee to the total before dividing']],correctMove:'equation',
    moveWhy:'The one-time delivery fee and the per-lantern cost are separate quantities. Define x before translating the bill.',
    hint:'The bill includes a one-time fee even before you count the lanterns. Undo that fixed contribution on both sides.',
    results:[['9 lanterns','11 lanterns','13 lanterns'],['10 lanterns','12 lanterns','14 lanterns']] },
  { id:'compare', title:'Two gate mechanisms', objectiveIds:['qr.compare'],
    values:[{low:2,high:8,offset:4},{low:5,high:8,offset:4}],
    change:'Only the lower bound changes: 2 < x < 8 becomes 5 < x < 8.',
    moves:[['sample','Try one allowed x and use it for every x'],['difference','Simplify A − B and use the whole allowed interval'],['double','Assume 2x is always larger than x + 4']],correctMove:'difference',
    moveWhy:'A valid comparison must hold for every allowed x. The sign of A − B tells which quantity is larger.',
    hint:'The two mechanisms are A = x + 4 and B = 2x. Look for where their order can switch; one sample cannot prove an entire interval.',
    results:[['A is always larger','B is always larger','The relationship varies'],['A is always larger','B is always larger','They are always equal']] },
  { id:'sufficiency', title:'The sealed inventory', objectiveIds:['qr.sufficiency'],
    values:[{sum:12,weighted:17,direct:null},{sum:12,weighted:17,direct:5}],
    change:'Only statement I changes: “x + y = 12” becomes “x = 5”. Statement II is unchanged.',
    moves:[['together','Combine both statements immediately'],['independent','Test each statement alone for a unique x'],['guess','Pick one pair that fits statement I']],correctMove:'independent',
    moveWhy:'First ask whether each statement alone forces one value of x. Combine them only if neither is sufficient alone.',
    hint:'x and y are nonnegative whole-number crate counts. Two allowed pairs with different x prove a statement insufficient.',
    results:[['I alone is sufficient','II alone is sufficient','Together only'],['I alone is sufficient','II alone is sufficient','Together only']] },
]);

const n = value => Number.isInteger(value) ? String(value) : String(Math.round(value * 10000) / 10000);
export function quantitativeModel(caseId, variant=0) {
  const c=QR_CASES.find(item=>item.id===caseId);
  if (!c || (variant!==0 && variant!==1)) return null;
  const v=c.values[variant];
  if (c.id==='flow') { const net=v.inflow-v.drain,needed=v.target-v.initial,hours=needed/net; return {net,needed,hours,answer:`${n(hours)} h`,steps:[`${v.inflow} − ${v.drain} = ${net} L/h net`,`Water still needed: ${v.target} − ${v.initial} = ${needed} L`,`${needed} L ÷ ${net} L/h = ${n(hours)} h`],trap:'Do not add a drain to the inflow. Dividing liters by liters per hour produces hours.'}; }
  if (c.id==='base') { const increase=v.current-v.original, percent=100*increase/v.original; return {increase,percent,answer:`${n(percent)}%`,steps:[`${v.current} − ${v.original} = ${increase} coins`,`${increase} ÷ ${v.original} = ${n(increase/v.original)}`,`${n(increase/v.original)} × 100% = ${n(percent)}%`],trap:'The same coin increase divided by the new price answers a different question.'}; }
  if (c.id==='chain') { const interim=v.start*(1+v.up/100),final=interim*(1-v.down/100); return {interim,final,answer:`${n(final)} coins`,steps:[`${v.start} × ${n(1+v.up/100)} = ${n(interim)} coins`,`${n(interim)} × ${n(1-v.down/100)} = ${n(final)} coins`,`${n((final-v.start)/v.start*100)}% above the initial price`],trap:'The discount acts on the raised price. Subtracting the printed percentages ignores the changing base.'}; }
  if (c.id==='equation') { const remaining=v.total-v.fee,x=remaining/v.each; return {remaining,x,answer:`${n(x)} lanterns`,steps:[`${v.fee} + ${v.each}x = ${v.total}`,`${v.each}x = ${v.total} − ${v.fee} = ${remaining}`,`x = ${remaining} ÷ ${v.each} = ${n(x)}`],trap:`Substitute back: ${v.fee} + ${v.each} × ${n(x)} = ${v.total} coins. The fee is charged once.`}; }
  if (c.id==='compare') { const varies=v.low<v.offset && v.high>v.offset; return {varies,answer:varies?'The relationship varies':'B is always larger',steps:['A − B = (x + 4) − 2x = 4 − x',varies?'x = 3: A > B; x = 4: A = B':'For every allowed x, x > 5 > 4',varies?'x = 4.5: A < B; order varies':'4 − x < 0, so A < B throughout'],trap:varies?'All three examples obey the stated interval. A single example cannot establish one relationship.':'Examples suggest a pattern; the inequality 4 − x < 0 proves it for the entire allowed interval.'}; }
  const x=v.weighted-v.sum;
  return {x,answer:v.direct===null?'Together only':'I alone is sufficient',steps:v.direct===null?['I alone: (x,y) = (0,12) or (5,7)','II alone: (x,y) = (0,17) or (5,7)',`Together: (2x + y) − (x + y) = ${v.weighted} − ${v.sum}; x = ${x}`]:['I alone directly fixes x = 5','II alone: (x,y) = (0,17) or (5,7)','I is sufficient; II is insufficient'],trap:'Enough information means one possible value of x. Finding one fitting pair is not a uniqueness proof.'};
}

const initial=()=>({caseIndex:0,variant:0,phase:'choose',move:'',result:'',step:0,help:false});
const int=(v,min,max,fallback)=>Number.isInteger(v)&&v>=min&&v<=max?v:fallback;
function normalize(raw) {
  const r=raw && typeof raw==='object' && !Array.isArray(raw)?raw:{};
  const s={caseIndex:int(r.caseIndex,0,QR_CASES.length-1,0),variant:r.variant===1?1:0,phase:['choose','predict','explain','complete'].includes(r.phase)?r.phase:'choose',move:'',result:'',step:int(r.step,0,2,0),help:r.help===true};
  const c=QR_CASES[s.caseIndex];
  s.move=[...c.moves.map(m=>m[0]),'unsure'].includes(r.move)?r.move:'';
  s.result=[...c.results[s.variant],'unsure'].includes(r.result)?r.result:'';
  if (s.phase!=='choose' && !s.move) s.phase='choose';
  if (['explain','complete'].includes(s.phase) && !s.result) s.phase='predict';
  if (s.phase==='complete' && !(s.caseIndex===QR_CASES.length-1 && s.variant===1 && s.step===2)) s.phase='explain';
  if (s.phase==='choose') {s.result='';s.step=0;}
  if (s.phase==='predict') s.step=0;
  return s;
}
function reduce(raw,action,value) {
  const s=normalize(raw),c=QR_CASES[s.caseIndex];
  if(action==='restart') return initial();
  if(action==='reset') return {...initial(),caseIndex:s.caseIndex,variant:s.variant};
  if(action==='help') return {...s,help:!s.help};
  if(action==='move' && s.phase==='choose' && [...c.moves.map(m=>m[0]),'unsure'].includes(value)) return {...s,move:value};
  if(action==='commit-move' && s.phase==='choose' && s.move) return {...s,phase:'predict',help:false};
  if(action==='result' && s.phase==='predict' && [...c.results[s.variant],'unsure'].includes(value)) return {...s,result:value};
  if(action==='commit-result' && s.phase==='predict' && s.result) return {...s,phase:'explain',step:0,help:false};
  if(action==='next' && s.phase==='explain' && s.step<2) return {...s,step:s.step+1};
  if(action==='back') {
    if(s.phase==='explain' && s.step>0) return {...s,step:s.step-1};
    if(s.phase==='explain') return {...s,phase:'predict',step:0};
    if(s.phase==='predict') return {...s,phase:'choose',result:''};
  }
  if(action==='change' && s.phase==='explain' && s.step===2 && s.variant===0) return {...initial(),caseIndex:s.caseIndex,variant:1};
  if(action==='next-case' && s.phase==='explain' && s.step===2 && s.variant===1) return s.caseIndex<QR_CASES.length-1?{...initial(),caseIndex:s.caseIndex+1}:{...s,phase:'complete'};
  return s;
}

const C={ink:'#193a30',muted:'#506453',paper:'#f5efd9',green:'#85b89a',gold:'#d7ab50',water:'#7fc3cf',red:'#a95743',line:'#a8b59a'};
const text=(x,y,label,size=23,anchor='start',color=C.ink)=>`<text x="${x}" y="${y}" font-size="${size}" text-anchor="${anchor}" fill="${color}">${esc(label)}</text>`;
const rect=(x,y,w,h,fill,extra='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5" fill="${fill}" ${extra}/>`;
const line=(x1,y1,x2,y2,color=C.ink,width=3)=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${width}"/>`;
const arrow=(x1,y,x2)=>line(x1,y,x2,y)+`<path d="M ${x2-8} ${y-6} L ${x2} ${y} L ${x2-8} ${y+6}" fill="none" stroke="${C.ink}" stroke-width="3"/>`;
function facts(c,v) {
  if(c.id==='flow') return `A cistern initially holds ${v.initial} L. It receives ${v.inflow} L/h while a drain removes ${v.drain} L/h. Both rates stay constant. How long until it holds ${v.target} L? The drain remains submerged, and the cistern has capacity for the target.`;
  if(c.id==='base') return `A lantern originally costs ${v.original} coins. Its new price is ${v.current} coins. What is the percent increase from the original price?`;
  if(c.id==='chain') return `A ${v.start}-coin price rises ${v.up}%, then the raised price is discounted ${v.down}%. What is the final price?`;
  if(c.id==='equation') return `A bill is ${v.total} coins: a one-time ${v.fee}-coin delivery fee plus ${v.each} coins per lantern. How many lanterns were delivered?`;
  if(c.id==='compare') return `For every real x with ${v.low} < x < ${v.high}, compare A = x + 4 with B = 2x. Which relationship must hold?`;
  return `Find x, the number of moss crates. y is the number of stone crates; both are nonnegative integers. Statement I: ${v.direct===null?`x + y = ${v.sum}`:`x = ${v.direct}`}. Statement II: 2x + y = ${v.weighted}. Which statements are sufficient to determine x uniquely?`;
}
function drawing(c,s,m) {
  const v=c.values[s.variant],shown=['explain','complete'].includes(s.phase)?s.step:-1;
  let body=rect(4,4,552,272,C.paper);
  if(c.id==='flow') {
    const water=shown>=2?v.target:shown>=1?v.initial+m.net:v.initial, h=150*water/v.target;
    body+=text(280,38,`${v.target} L cistern`,25,'middle')+rect(188,70,184,164,'#e7e9d5',`stroke="${C.ink}" stroke-width="3"`);
    body+=`<rect data-quantity="water" x="192" y="${230-h}" width="176" height="${h}" fill="${C.water}"/>`;
    body+=text(78,83,'Inflow',22,'middle')+text(78,112,`${v.inflow} L/h`,24,'middle')+arrow(55,143,185);
    body+=text(464,150,'Drain',22,'middle')+text(464,179,`${v.drain} L/h`,24,'middle')+arrow(375,205,505);
    body+=text(280,259,shown>=2?`${n(m.hours)} hours elapsed`:shown>=1?`After 1 h: ${water} L`:`Initially ${v.initial} L`,22,'middle');
  } else if(c.id==='base' || c.id==='chain') {
    const values=c.id==='base'?[v.original,v.current]:[v.start,shown>=0?m.interim:null,shown>=1?m.final:null];
    const max=c.id==='base'?120:280,labels=c.id==='base'?['Original','New']:['Initial',`After +${v.up}%`,`After −${v.down}%`];
    values.forEach((amount,i)=>{const y=61+i*70;
      body+=text(24,y,labels[i],22)+rect(170,y-24,350,32,'#e5e4d0');
      if(amount!==null) body+=rect(170,y-24,350*amount/max,32,i===0?C.green:i===1?C.gold:C.water,`data-quantity="bar-${i}"`)+text(175,y+31,`${n(amount)} coins`,21);
      else body+=text(345,y, 'Predict first',21,'middle',C.muted);
    });
    if(c.id==='base' && shown>=0) {
      body+=rect(170+350*v.original/max,107,350*m.increase/max,32,'none',`stroke="${C.red}" stroke-width="3" data-quantity="increase"`);
      body+=text(280,209,`Increase: ${m.increase} coins`,23,'middle');
      if(shown>=1) body+=text(280,239,shown===1?`Base: ${v.original} coins = 100%`:`Increase: ${n(m.percent)}% of the base`,23,'middle');
    }
    body+=text(280,266,c.id==='base'?'Same bar scale · coins':`First +${v.up}%, then −${v.down}%`,22,'middle');
  } else if(c.id==='equation') {
    body+=text(280,41,'One delivery · one bill',25,'middle');
    body+=rect(25,69,134,103,C.gold)+text(92,107,'Fee',22,'middle')+text(92,143,`${v.fee} coins`,23,'middle');
    body+=text(182,129,'+',30,'middle')+rect(205,69,150,103,C.green)+text(280,105,'x lanterns',22,'middle')+text(280,142,`${v.each} coins each`,22,'middle');
    body+=text(381,129,'=',30,'middle')+rect(408,69,126,103,C.water)+text(471,108,'Total',22,'middle')+text(471,144,`${v.total} coins`,23,'middle');
    if(shown>=1) {
      body+=line(43,80,140,161,C.red,4)+text(92,201,`−${v.fee}`,24,'middle',C.red)+text(471,201,`−${v.fee}`,24,'middle',C.red);
      body+=text(280,241,shown===1?`${v.each}x = ${m.remaining}; fee removed from both sides`:`Each group has 3 coins: ${m.remaining} ÷ 3 = ${m.x}`,22,'middle');
    } else body+=text(280,221,'x = number of lanterns',22,'middle');
  } else if(c.id==='compare') {
    body+=rect(30,28,230,67,C.green)+rect(300,28,230,67,C.gold)+text(145,71,'A = x + 4',27,'middle')+text(415,71,'B = 2x',27,'middle');
    const pos=x=>40+x*60;
    body+=text(280,137,`Allowed: ${v.low} < x < ${v.high}`,25,'middle')+line(pos(0),190,pos(8),190,C.line,4)+line(pos(v.low),190,pos(v.high),190,C.ink,8);
    for(let i=0;i<=8;i++) body+=line(pos(i),181,pos(i),199,C.muted,2)+text(pos(i),230,i,21,'middle');
    [v.low,v.high].forEach(x=>{body+=`<circle cx="${pos(x)}" cy="190" r="7" fill="${C.paper}" stroke="${C.ink}" stroke-width="3"/>`;});
    if(shown>=0) body+=line(pos(4),157,pos(4),208,C.red,3)+text(pos(4),259,'equal at 4',21,'middle');
  } else {
    body+=text(280,35,'Which clues force one x?',25,'middle')+rect(22,55,250,91,C.green)+rect(288,55,250,91,C.gold);
    body+=text(147,88,'Statement I',23,'middle')+text(147,125,v.direct===null?`x + y = ${v.sum}`:`x = ${v.direct}`,25,'middle');
    body+=text(413,88,'Statement II',23,'middle')+text(413,125,`2x + y = ${v.weighted}`,25,'middle');
    body+=text(280,181,'x: moss crates · y: stone crates',22,'middle');
    if(shown>=0) body+=text(147,220,v.direct===null?'x: 0 or 5':'x: only 5',23,'middle');
    if(shown>=1) body+=text(413,220,'x: 0 or 5',23,'middle');
    if(shown<0) body+=text(280,230,'Inspect the two clues',22,'middle',C.muted);
  }
  // Long algebra/logic lines live in normal HTML, so mobile never shrinks them to fit SVG.
  const caption=shown>=0?m.steps[shown]:'Choose a first move before revealing the calculation.';
  const label=facts(c,v)+(shown>=0?` Current calculation: ${caption}`:' No solution shown.');
  return `<figure class="exp-qr-figure">${svg(label,`<g font-family="system-ui, sans-serif">${body}</g>`,'0 0 560 280')}<figcaption class="exp-qr-calculation" aria-live="polite">${esc(caption)}</figcaption></figure>`;
}
function view(raw) {
  const s=normalize(raw),c=QR_CASES[s.caseIndex],m=quantitativeModel(c.id,s.variant),revealed=['explain','complete'].includes(s.phase);
  let prompt,coach='',primary,controls='';
  if(s.phase==='choose') {
    prompt=`${c.title}: choose a useful first move.`;
    controls=group('Choose a mathematical first move',c.moves.map(([id,label])=>button(label,'move',id,{selected:s.move===id})).join('')+button('I’m unsure','move','unsure',{selected:s.move==='unsure'}));
    primary={action:'commit-move',label:'Commit first move',disabled:!s.move};
  } else if(s.phase==='predict') {
    prompt='Predict the result before the calculation unfolds.';
    coach=(s.move===c.correctMove?'That setup fits. ':s.move==='unsure'?'Start here: ':'Try this setup instead: ')+c.moveWhy;
    controls=group('Predict the outcome',c.results[s.variant].map(answer=>button(answer,'result',answer,{selected:s.result===answer})).join('')+button('Show me how','result','unsure',{selected:s.result==='unsure'}));
    primary={action:'commit-result',label:s.result==='unsure'?'Begin guided calculation':'Commit prediction',disabled:!s.result};
  } else {
    prompt=s.phase==='complete'?'Six strategies explored. Fresh checkpoint questions stay separate.':`Follow the quantities, step ${s.step+1} of 3.`;
    coach=s.step===2?`${s.result===m.answer?'Your prediction agrees. ':s.result==='unsure'?'The worked result is ':`You predicted ${s.result}. The worked result is `}${s.result===m.answer?'':m.answer+'. '}${m.trap}`:'Watch how the highlighted quantities support the current calculation.';
    primary=s.phase==='complete'?{action:'restart',label:'Explore again'}:s.step<2?{action:'next',label:'Show next step'}:s.variant===0?{action:'change',label:'Change one condition'}:{action:'next-case',label:s.caseIndex===QR_CASES.length-1?'Finish exploration':'Open the next case'};
  }
  if(s.phase!=='complete') controls+=group('Exploration tools',(s.phase!=='choose'?button('Back one step','back'):'')+button(s.help?'Hide hint':'Need a hint?','help','',{selected:s.help})+button('Reset this case','reset'));
  if(s.help) coach+=(coach?' ':'')+c.hint;
  const index=s.caseIndex*2+s.variant;
  const caseText=s.variant===1?`<p class="exp-change-note">${esc(c.change)}</p>`:'';
  return {activeObjectiveIds:[...c.objectiveIds],scene:`${caseText}<p class="exp-case-givens">${esc(facts(c,c.values[s.variant]))}</p>${drawing(c,s,m)}`,prompt,coach,controls,primary,progress:{current:s.phase==='complete'?12:index+1,total:12,label:`Case ${s.caseIndex+1} of 6 · ${s.variant?'changed condition':'first condition'}${revealed?` · step ${s.step+1}/3`:''}`},complete:s.phase==='complete'};
}

export const QUANTITATIVE_ACTIVITIES = [{
  id:'qr-strategy-detective',title:'Strategy Detective',world:'qr',version:1,
  objectiveIds:['qr.rates','qr.algebra','qr.compare','qr.sufficiency','qr-percent-base','qr-percent-chain'],
  sourceUrls:['https://openstax.org/books/prealgebra-2e/pages/6-2-solve-general-applications-of-percent','https://openstax.org/books/elementary-algebra-2e/pages/2-1-solve-equations-using-the-subtraction-and-addition-properties-of-equality'],
  instructionFamilies:QR_CASES.map(c=>`discovery-qr-${c.id}-v1`),
  initial,normalize,reduce,view,
}];
