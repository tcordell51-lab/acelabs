import {button, esc, group, svg} from './shared.mjs';

// Original, deterministic teaching scenes. No assessment bank, persistence,
// timing loop, generated randomness, or scored learning evidence lives here.
const freeze=x=>{if(x&&typeof x==='object'){Object.values(x).forEach(freeze);Object.freeze(x);}return x;};
const PASSIVE='https://openstax.org/books/biology-2e/pages/5-2-passive-transport';
const MEMBRANE='https://openstax.org/books/biology-2e/pages/5-1-components-and-structure';
const PREDICTIONS={dye:['right','left','balanced','blocked','unsure'],water:['swell','shrink','stable','blocked','unsure']};
const phases=['predict','observe','explain','done'];

export const DYE_CASES=freeze([
  {id:'sealed-harbor',left:14,right:2,open:false,title:'The sealed harbor gate',change:'Start with both paths sealed.'},
  {id:'reopened-harbor',left:14,right:2,open:true,title:'Repair the dye channel',change:'Same starting mixture. Only the dye channel opens.'},
  {id:'balanced-harbor',left:8,right:8,open:true,title:'A quiet-looking channel',change:'New equal starting concentrations; the dye channel stays open.'},
  {id:'reverse-harbor',left:2,right:14,open:true,title:'The far dock sends a signal',change:'Fresh reversed mixture; the same open channel and equal volumes.'}
]);
export const WATER_CASES=freeze([
  {id:'sealed-cell',inside:240,outside:120,open:false,title:'The sealed cell dock',change:'The model membrane blocks water and solute.'},
  {id:'water-restored',inside:240,outside:120,open:true,title:'Restore the water path',change:'Reset the same cell and bath. Only water permeability changes.'},
  {id:'matched-bath',inside:240,outside:240,open:true,title:'Choose a matching bath',change:'Reset the cell. Change only the bath concentration.'},
  {id:'concentrated-bath',inside:240,outside:360,open:true,title:'A different supply arrives',change:'Fresh case: the bath changes again; the water path remains open.'}
]);

function start(){return {caseIndex:0,phase:'predict',prediction:null,tick:0,help:false,replayed:false};}
function normalize(kind,state){
  const cases=kind==='dye'?DYE_CASES:WATER_CASES,s=start();
  if(!state||typeof state!=='object'||Array.isArray(state))return s;
  if(Number.isInteger(state.caseIndex)&&state.caseIndex>=0&&state.caseIndex<cases.length)s.caseIndex=state.caseIndex;
  if(PREDICTIONS[kind].includes(state.prediction))s.prediction=state.prediction;
  s.help=state.help===true;s.replayed=state.replayed===true;
  if(phases.includes(state.phase)&&state.phase!=='predict'&&s.prediction!==null){
    s.phase=state.phase;
    s.tick=Number.isInteger(state.tick)?Math.min(2,Math.max(1,state.tick)):1;
    if(['explain','done'].includes(s.phase)&&s.tick<2)s.phase='observe';
    if(s.phase==='done'&&s.caseIndex!==cases.length-1)s.phase='explain';
  }
  return s;
}
function reduce(kind,state,action,value){
  const s=normalize(kind,state),cases=kind==='dye'?DYE_CASES:WATER_CASES;
  if(action==='reset')return start();
  if(action==='help')return {...s,help:!s.help};
  if(action==='retry')return {...start(),caseIndex:s.caseIndex,replayed:true};
  if(action==='predict'&&s.phase==='predict'&&PREDICTIONS[kind].includes(value))s.prediction=value;
  if(action==='commit'&&s.phase==='predict'&&s.prediction!==null){s.phase='observe';s.tick=1;}
  if(action==='advance'&&s.phase==='observe')s.tick=Math.min(2,s.tick+1);
  if(action==='back'&&s.phase==='observe')s.tick=Math.max(1,s.tick-1);
  if(action==='explain'&&s.phase==='observe'&&s.tick===2)s.phase='explain';
  if(action==='next'&&s.phase==='explain'&&s.caseIndex<cases.length-1)return {...start(),caseIndex:s.caseIndex+1};
  if(action==='finish'&&s.phase==='explain'&&s.caseIndex===cases.length-1)s.phase='done';
  return s;
}

// These exchanges are a chosen bookkeeping illustration, not a stochastic
// simulation or measured rate. Both directions remain present when open.
export function dyeObservation(input){
  const s=normalize('dye',input),c=DYE_CASES[s.caseIndex],revealed=s.phase!=='predict';
  const expected=!c.open?'blocked':c.left===c.right?'balanced':c.left>c.right?'right':'left';
  const forward=!c.open?0:expected==='right'?3:expected==='left'?1:2;
  const backward=!c.open?0:expected==='left'?3:expected==='right'?1:2;
  const net=forward-backward,steps=revealed?s.tick:0;
  return {case:c,expected,revealed,forward:revealed?forward:0,backward:revealed?backward:0,
    waterCrossings:0,left:c.left-steps*net,right:c.right+steps*net,net:revealed?net:0};
}
export function waterObservation(input){
  const s=normalize('water',input),c=WATER_CASES[s.caseIndex],revealed=s.phase!=='predict';
  const expected=!c.open?'blocked':c.inside===c.outside?'stable':c.inside>c.outside?'swell':'shrink';
  return {case:c,expected,revealed,soluteCrossings:0,waterCrosses:revealed&&c.open,
    radius:100+(revealed?(expected==='swell'?1:expected==='shrink'?-1:0)*s.tick*8:0),
    // Qualitative, not a volume calculation or final equilibrium prediction.
    net:!revealed||!c.open||expected==='stable'?'none':expected==='swell'?'in':'out'};
}

const text=(x,y,t,size=16,anchor='middle')=>`<text x="${x}" y="${y}" text-anchor="${anchor}" font-size="${size}" fill="#233b36">${esc(t)}</text>`;
const palette={dye:'#bb731f',water:'#287ca3',wall:'#3d7564',paper:'#fff9e8'};
const dye=(x,y)=>`<circle cx="${x}" cy="${y}" r="6" fill="${palette.dye}" stroke="#5c411f" stroke-width="1.5"/>`;
const water=(x,y)=>`<path d="M${x} ${y-6}l6 6-6 6-6-6Z" fill="${palette.water}"/>`;
function track(x,y,frame,kind='dye'){
  const signs=[[-1,1],[1,-1],[-1,-1]][frame%3];
  const x0=x+signs[0]*9,y0=y+signs[1]*8;
  return `<g data-local-motion="${kind}" data-from-x="${x0}" data-to-x="${x}"><path d="M${x0} ${y0}l${-signs[0]*4} ${-signs[1]*7}L${x} ${y}" fill="none" stroke="${kind==='dye'?palette.dye:palette.water}" stroke-width="2" opacity=".55"/>${kind==='dye'?dye(x,y):water(x,y)}</g>`;
}
function packet(count,side,frame,kind='dye'){
  return Array.from({length:count},(_,i)=>{
    const x=(side==='left'?65:393)+(i%4)*45+((frame+i)%3-1)*5;
    const y=(kind==='water'?263:117)+Math.floor(i/4)*38+((i+frame)%2)*7;
    return track(x,y,frame+i,kind);
  }).join('');
}
function arrow(x1,y,x2,color,id,width=3){
  const dir=x2>x1?1:-1;
  return `<g data-crossing="${id}"><path d="M${x1} ${y}H${x2}" fill="none" stroke="${color}" stroke-width="${width}"/><path d="M${x2-dir*8} ${y-6}l${dir*8} 6 ${-dir*8} 6" fill="none" stroke="${color}" stroke-width="${width}"/></g>`;
}
function gate(x,y,open,label){
  return `<g><rect x="${x-20}" y="${y-27}" width="40" height="54" rx="8" fill="#d7e3bf" stroke="${palette.wall}" stroke-width="3"/><path d="M${x-15} ${y-19}V${y+19}M${x+15} ${y-19}V${y+19}" stroke="${palette.wall}" stroke-width="5"/>${open?`<rect x="${x-14}" y="${y-13}" width="28" height="26" fill="${palette.paper}"/>`:`<path d="M${x-13} ${y-13}L${x+13} ${y+13}M${x-13} ${y+13}L${x+13} ${y-13}" stroke="#823f35" stroke-width="6"/>`}<path d="M${x+20} ${y+20}h24l${open?12:0} -24" stroke="#615131" stroke-width="5" fill="none"/><circle cx="${x+44+(open?12:0)}" cy="${y-4}" r="7" fill="#d3a851"/>${text(x,y+51,label,14)}</g>`;
}
function dyeScene(s){
  const v=dyeObservation(s),c=v.case;
  const description=`Two equal-volume dye chambers. Starting amounts: ${c.left} left, ${c.right} right. Dye channel ${c.open?'open':'closed'}; water path closed.`;
  const outcome=v.revealed?` Displayed snapshot: ${v.left} dye markers left, ${v.right} right. ${c.open?'Crossing arrows show both directions.':'Neither dye nor water crosses.'}`:'';
  const body=`<rect width="640" height="390" rx="24" fill="#dbe8cc"/><path d="M12 351H628" stroke="#8f8965" stroke-width="18"/><rect x="25" y="68" width="590" height="255" rx="19" fill="${palette.paper}" stroke="${palette.wall}" stroke-width="4"/>
    ${text(157,38,'WEST DOCK',19)}${text(480,38,'EAST DOCK',19)}${text(157,93,`${v.revealed?'Now':'Start'}: ${v.left} dye markers`)}${text(480,93,`${v.revealed?'Now':'Start'}: ${v.right} dye markers`)}
    <rect x="311" y="70" width="18" height="251" fill="${palette.wall}"/>
    ${packet(v.left,'left',s.tick)}${packet(v.right,'right',s.tick)}${packet(4,'left',s.tick,'water')}${packet(4,'right',s.tick,'water')}
    ${gate(320,170,c.open,'Dye channel')}${gate(320,271,false,'Water sealed')}
    ${v.revealed&&c.open?arrow(250,162,390,palette.dye,'dye-right',v.forward)+arrow(390,181,250,palette.dye,'dye-left',v.backward):''}
    ${text(320,372,v.revealed?(c.open?`${v.forward} rightward − ${v.backward} leftward = ${v.net} net rightward per shown step`:'No crossings. The short trails stay inside each dock.'):'Gold circles: dye · blue diamonds: water',15)}`;
  return svg(description+outcome,body,'0 0 640 390')+`<p class="exp-caption">Equal fixed volumes; neutral dye in water; no bulk flow. Water cannot cross. Dots are a small teaching model, not measured concentrations or rates. Trails are snapshots of irregular thermal motion, not a force aimed at the other side.</p>`;
}
function cellParticles(tick){
  const coords=[[-48,-36],[-12,-49],[27,-39],[48,-8],[-44,10],[-10,-4],[19,18],[-25,44]];
  return coords.map(([x,y],i)=>track(245+x,188+y,tick+i)).join('')+
    [[-65,0],[0,-66],[15,54]].map(([x,y],i)=>track(245+x,188+y,tick+i,'water')).join('');
}
function waterScene(s){
  const v=waterObservation(s),c=v.case,r=v.radius,edge=245+r;
  const description=`Model animal cell in a bath. Initial nonpenetrating-solute concentrations: cell ${c.inside}, bath ${c.outside} milliosmoles per liter. Water path ${c.open?'open':'sealed'}; solute cannot cross.`;
  const outcome=v.revealed?` Initial response: ${v.expected==='blocked'?'no water or solute crosses':v.expected==='stable'?'water crosses both ways with no net volume change':v.expected==='swell'?'net water entry and swelling':'net water exit and shrinking'}.`:'';
  const body=`<rect width="640" height="415" rx="24" fill="#dbe8cc"/><rect x="22" y="65" width="596" height="285" rx="20" fill="#eff6ee" stroke="${palette.wall}" stroke-width="4"/>
    ${text(245,32,'CELL DOCK',19)}${text(513,32,'BATH',19)}
    ${s.tick?'<circle cx="245" cy="188" r="100" fill="none" stroke="#8b9d8a" stroke-width="2" stroke-dasharray="6 5"/>':''}
    <circle cx="245" cy="188" r="${r}" fill="#e2dba8" fill-opacity=".7" stroke="${palette.wall}" stroke-width="5"/>
    ${cellParticles(s.tick)}${packet(4,'right',s.tick,'water')}
    ${Array.from({length:c.outside/40},(_,i)=>track(470+(i%3)*43,109+Math.floor(i/3)*44,s.tick+i)).join('')}
    ${gate(edge,188,c.open,c.open?'Water path':'Sealed path')}
    ${v.waterCrosses?arrow(edge+63,178,edge-30,palette.water,'water-in',v.net==='in'?5:2)+arrow(edge-30,197,edge+63,palette.water,'water-out',v.net==='out'?5:2):''}
    ${text(245,323,`Initial cell: ${c.inside} mOsm/L`,15)}${text(513,323,`Bath: ${c.outside} mOsm/L`,15)}
    ${text(320,378,'Gold circles: solute that cannot cross · blue diamonds: water',14)}
    ${text(320,400,v.revealed?'Dashed outline: starting size · size change is schematic':'Predict the first change, before volume regulation.',14)}`;
  return svg(description+outcome,body,'0 0 640 415')+`<p class="exp-caption">An idealized animal cell, without a wall. All listed solutes remain nonpenetrating throughout this short initial observation. There is no initial pressure difference; temperature stays fixed, the bath is large, and active regulation is omitted. mOsm/L counts dissolved particles per liter. Particle symbols are not concentration counts. We predict direction, not a final size.</p>`;
}

const dyeWhy={
  blocked:'The sealed barrier allows no crossing at all. Random motion continues within each compartment; it does not open a forbidden route.',
  right:'Both crossing directions occur. More dye leaves the crowded west side than returns, so the difference is eastward. The selective channel supports passive movement; it does not supply ATP energy.',
  left:'Both crossing directions occur. The more crowded east side now supplies the larger flow, so the net direction reverses even though the same channel is open.',
  balanced:'Equal concentrations give equal crossing in each direction on average. No net movement means balanced exchange, not motionless particles.'
};
const waterWhy={
  blocked:'A concentration difference cannot move water across a water-impermeable barrier. Both kinds of particle stay on their own side in this sealed model.',
  swell:'Water crosses both ways, with net entry here. The bath has fewer nonpenetrating dissolved particles per liter: it is hypotonic relative to the cell. The cell initially swells.',
  shrink:'Water crosses both ways, with net exit here. The bath has more nonpenetrating dissolved particles per liter: it is hypertonic relative to the cell. The cell initially shrinks.',
  stable:'Water still crosses in both directions. The matched nonpenetrating-solute concentrations are isotonic in this model, so there is no initial net volume change.'
};
const labels={dye:[['right','Net dye: west → east'],['left','Net dye: east → west'],['balanced','Both ways, no net dye change'],['blocked','No dye crosses'],['unsure','I’m not sure yet']],water:[['swell','Water enters net; cell swells'],['shrink','Water leaves net; cell shrinks'],['stable','Water exchanges; size stays steady'],['blocked','No water crosses; size stays steady'],['unsure','I’m not sure yet']]};
function choiceButtons(kind,s){return group('Predict before testing',labels[kind].map(([v,t])=>button(t,'predict',v,{selected:s.prediction===v,disabled:s.phase!=='predict'}).replace('data-exp-action=',`${s.prediction===v?'':'aria-pressed="false" '}data-exp-action=`)).join(''));}
function view(kind,input){
  const s=normalize(kind,input),cases=kind==='dye'?DYE_CASES:WATER_CASES,c=cases[s.caseIndex],v=kind==='dye'?dyeObservation(s):waterObservation(s),why=(kind==='dye'?dyeWhy:waterWhy)[v.expected];
  let prompt=c.change+' '+(kind==='dye'?'Predict what dye can do across this membrane.':'Predict the first water movement and cell-size response.'),coach='',primary;
  let controls='';
  if(s.phase==='predict'){
    controls=choiceButtons(kind,s);primary={action:'commit',label:'Test my prediction',disabled:s.prediction===null};
    if(s.help)coach=kind==='dye'?'Check the gate first. Then compare how crowded the two equal volumes are. Net means one directional amount minus the other.':'Check which substance can cross. Then compare only the solutes that stay on their own side during this observation.';
  }else{
    const lead=s.prediction==='unsure'?'Observe what changes.':s.prediction===v.expected?'Your prediction matches this model.':'Compare your prediction with what moved.';
    coach=s.phase==='observe'?lead+' '+(kind==='dye'?(c.open?'Trace both crossing arrows and compare the dock totals.':'Watch the trails: neither water nor dye crosses the sealed wall.'):(c.open?'Compare the solid cell boundary with the dashed starting boundary.':'The closed water path leaves the cell size unchanged. No crossing is shown.')):why;
    if(s.phase==='observe'){
      prompt='Follow two snapshots; these steps are not a measured clock.';
      controls=group('Observation snapshots',button('Previous snapshot','back','',{disabled:s.tick===1}));
      primary=s.tick<2?{action:'advance',label:'Follow the next movement'}:{action:'explain',label:'Explain this repair'};
    }else if(s.phase==='explain'){
      prompt='Keep the observed rule. Now test a controlled change.';
      primary=s.caseIndex===cases.length-1?{action:'finish',label:'Complete the repair'}:{action:'next',label:s.caseIndex===0?(kind==='dye'?'Turn the dye gate handle':'Open only the water path'):s.caseIndex===1?(kind==='dye'?'Try equal starting concentrations':'Replace the bath with a match'):'Try the changed case'};
    }else{
      prompt='Repair complete. You can revisit the system or leave for a separate practice case.';
      coach=why+' This was guided discovery, not an independent assessment.';
      primary={action:'reset',label:'Explore the repair again'};
    }
  }
  controls+=group('Learning tools',button(s.help?'Hide the clue':'Ask Portia for a clue','help','',{selected:s.help})+button('Retry this case','retry')+button('Restart repair','reset'));
  if(s.phase!=='predict')coach=`You predicted: ${labels[kind].find(([value])=>value===s.prediction)[1]}. ${coach}`;
  if(s.replayed)coach=(coach?coach+' ':'')+'This is a replay of the same case.';
  const activeObjectiveIds=kind==='dye'?(s.caseIndex===0?['bio-transport']:['bio-diffusion','bio-transport']):(s.caseIndex===0?['bio-osmosis']:['bio-osmosis','bio-tonicity','bio-animal']);
  return {scene:`<div class="exp-biology-scene"><p class="exp-scene-label">${esc(c.title)}</p>${kind==='dye'?dyeScene(s):waterScene(s)}</div>`,prompt,coach,controls,primary,activeObjectiveIds,
    progress:{current:s.phase==='done'?cases.length:s.caseIndex+1,total:cases.length,label:`Case ${s.caseIndex+1} of ${cases.length} · ${s.phase==='predict'?'predict':s.phase==='observe'?'observe':s.phase==='explain'?'explain':'complete'}`},complete:s.phase==='done'};
}

export const BIOLOGY_ACTIVITIES=freeze([
  {id:'bio-selective-gate-repair',title:'Repair the Selective Gate',world:'bio',objectiveIds:['bio-diffusion','bio-transport'],version:1,sourceUrls:[PASSIVE,MEMBRANE],
    instructionFamilies:['discovery-bio-sealed-versus-open-neutral-dye','discovery-bio-balanced-bidirectional-dye','discovery-bio-reversed-dye-gradient'],
    initial:start,normalize:s=>normalize('dye',s),reduce:(s,a,v)=>reduce('dye',s,a,v),view:s=>view('dye',s)},
  {id:'bio-cell-dock-repair',title:'Rescue the Cell Dock',world:'bio',objectiveIds:['bio-osmosis','bio-tonicity','bio-animal'],version:1,sourceUrls:[PASSIVE,MEMBRANE],
    instructionFamilies:['discovery-bio-zero-water-permeability','discovery-bio-water-path-contrast','discovery-bio-nonpenetrating-bath-change'],
    initial:start,normalize:s=>normalize('water',s),reduce:(s,a,v)=>reduce('water',s,a,v),view:s=>view('water',s)}
]);
