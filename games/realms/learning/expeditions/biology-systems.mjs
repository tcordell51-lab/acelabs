import {button, esc, group, svg} from './shared.mjs';

// Original instructional systems. No bank items, grading, storage or runtime I/O.
const freeze=x=>{if(x&&typeof x==='object'){Object.values(x).forEach(freeze);Object.freeze(x);}return x;};
const U={prok:'https://openstax.org/books/biology-2e/pages/4-2-prokaryotic-cells',cell:'https://openstax.org/books/biology-2e/pages/4-3-eukaryotic-cells',endo:'https://openstax.org/books/biology-2e/pages/4-4-the-endomembrane-system-and-proteins',targeting:'https://www.ncbi.nlm.nih.gov/books/NBK26841/',tracks:'https://openstax.org/books/biology-2e/pages/4-5-the-cytoskeleton',water:'https://openstax.org/books/biology-2e/pages/5-2-passive-transport',resp:'https://openstax.org/books/biology-2e/pages/7-4-oxidative-phosphorylation',light:'https://openstax.org/books/biology-2e/pages/8-2-the-light-dependent-reactions-of-photosynthesis',carbon:'https://openstax.org/books/biology-2e/pages/8-3-using-light-energy-to-make-organic-molecules',enzyme:'https://openstax.org/books/biology-2e/pages/6-5-enzymes',kinetics:'https://iubmb.qmul.ac.uk/kinetics/ek4t6.html'};
const choices=(...pairs)=>pairs;
const unsure=['unsure','Explore with me'];

export const COMPARTMENT_CASES=freeze([
 {id:'bacterial-archive',title:'Locate the bacterial archive',objectiveIds:['bio-cell-types'],mode:'scan',payload:'DNA scan',target:'nucleoid',options:choices(['nucleoid','Open DNA region'],['nucleus','Enclosed nucleus'],['wall','Outer cell wall']),prompt:'A representative bacterium has DNA, ribosomes, cytoplasm and a plasma membrane. Move the scan lens to the expected DNA region.',hint:'DNA holds hereditary instructions. A nucleus is an internal compartment enclosed by a membrane; a nucleoid is a region without that enclosure.',output:'DNA detected; no nuclear envelope',why:'The scan finds a nucleoid, an unenclosed DNA region. Ribosomes build proteins in both bacterial and eukaryotic cells. A cell wall is separate from the plasma membrane and does not by itself identify the cell type.'},
 {id:'leaf-archive',title:'Scan a leaf cell instead',objectiveIds:['bio-cell-types','bio-nucleus'],mode:'scan',payload:'Main DNA scan',target:'nucleus',options:choices(['nucleoid','Open DNA region'],['nucleus','Enclosed nucleus'],['wall','Outer cell wall']),prompt:'Change the specimen to a typical nucleated leaf cell. It also has a wall, DNA and ribosomes. Locate most of its DNA.',hint:'The wall surrounds the cell. The nuclear envelope encloses an internal DNA compartment.',output:'Most DNA inside the nucleus',why:'This leaf cell is eukaryotic: most DNA is enclosed in its nucleus. Mitochondria and chloroplasts also have DNA. Its wall does not make it bacterial. These representative cells do not model specialized cells that lose a nucleus.'},
 {id:'subunit-workshop',title:'Restart the ribosome workshop',objectiveIds:['bio-nucleus'],mode:'repair',payload:'Assembly repair',target:'nucleolus',options:choices(['nucleolus','Nucleolus'],['golgi','Golgi'],['lysosome','Lysosome']),prompt:'New ribosomal subunits are scarce. Restore the site that makes much ribosomal RNA and assembles early subunits.',hint:'RNA is a molecule used in messages and cellular machinery. A ribosomal subunit is one of the two major pieces of a protein-building ribosome.',output:'New early ribosomal subunits assembled',why:'The nucleolus is a region inside the nucleus that helps build ribosomal subunits. It does not translate proteins. After maturation and nuclear export, subunits join protein-building ribosomes; translation means reading an RNA message to build a protein.'},
 {id:'damaged-delivery',title:'Unload a damaged cell component',objectiveIds:['bio-recycling'],mode:'repair',payload:'Delivered cell debris',target:'lysosome',options:choices(['lysosome','Acidic lysosome'],['peroxisome','Peroxisome'],['golgi','Golgi']),prompt:'In this animal-cell model, autophagy has already delivered damaged material for breakdown. Restore the receiving compartment.',hint:'Autophagy delivers cellular material for recycling. Different compartments contain different working enzymes.',output:'Delivered material broken into smaller components',why:'Lysosomal enzymes digest material in an acidic interior. This scene begins after delivery; it does not move a free organelle directly through the membrane. Plant lytic vacuoles can provide related breakdown functions.'},
 {id:'peroxide-service',title:'Repair a different cleanup station',objectiveIds:['bio-recycling'],mode:'repair',payload:'Catalase repair',target:'peroxisome',options:choices(['lysosome','Acidic lysosome'],['peroxisome','Peroxisome'],['golgi','Golgi']),prompt:'Now the affected compartment carries out oxidative reactions and processes hydrogen peroxide with catalase. Restore that station.',hint:'Hydrogen peroxide is H₂O₂. Catalase is an enzyme that helps break it down; this is a different job from digestion of delivered debris.',output:'Catalase processes hydrogen peroxide',why:'Peroxisomes support oxidative chemistry and peroxide handling. A lysosome and a peroxisome are not interchangeable cleanup rooms. This schematic does not claim that catalase exists only in peroxisomes.'},
 {id:'respiratory-socket',title:'Reconnect respiratory machinery',objectiveIds:['bio-energy-organelles'],mode:'repair',payload:'Respiratory repair',target:'inner',options:choices(['inner','Mitochondrial inner membrane'],['matrix','Mitochondrial matrix'],['stroma','Chloroplast stroma']),prompt:'Reconnect the mitochondrial respiratory electron-transport machinery and ATP synthase at their membrane location.',hint:'ATP is a molecule cells use to couple energy supply to work. The matrix is the interior of a mitochondrion; its inner membrane is a distinct boundary.',output:'Machinery restored on the inner membrane',why:'Respiratory electron transport and ATP synthase occupy the mitochondrial inner membrane. This locates machinery, not a complete ATP-production simulation. Photosynthetic plant cells can use mitochondria too.'},
 {id:'light-socket',title:'Reconnect the light-reaction panel',objectiveIds:['bio-energy-organelles'],mode:'repair',payload:'Light-system repair',target:'thylakoid',options:choices(['thylakoid','Thylakoid membranes'],['stroma','Chloroplast stroma'],['matrix','Mitochondrial matrix']),prompt:'Change the repair job to the light reactions of a chloroplast. Attach the panel to its working membrane.',hint:'Thylakoids are internal membrane sacs in a chloroplast. Stroma is the fluid region around them.',output:'Light-reaction machinery at thylakoid membranes',why:'The chloroplast light reactions use thylakoid membranes. A chloroplast is not a replacement for a mitochondrion, and nonphotosynthetic plant cells need not contain chloroplasts.'},
 {id:'carbon-workshop',title:'Locate carbon fixation',objectiveIds:['bio-energy-organelles'],mode:'scan',payload:'Carbon-fixation scan',target:'stroma',options:choices(['thylakoid','Thylakoid membranes'],['stroma','Chloroplast stroma'],['matrix','Mitochondrial matrix']),prompt:'Keep the chloroplast. Move the scan lens to the Calvin-cycle carbon-fixation reactions, which incorporate carbon from CO₂ into organic molecules.',hint:'Separate a membrane process from reactions in the surrounding fluid compartment.',output:'Calvin-cycle reactions in the stroma',why:'The Calvin cycle occurs in chloroplast stroma and uses products supplied by the light reactions. “Light-independent” does not mean it requires darkness. The model locates reactions without teaching the full pathway.'}
]);

export const CARGO_CASES=freeze([
 {id:'secretory-parcel',title:'Dispatch the secretory parcel',objectiveIds:['bio-nucleus','bio-cargo'],prompt:'This soluble protein has a working ER-entry signal and is destined for conventional secretion. Predict its protein route after the RNA message leaves the nucleus.',target:'secretory',options:choices(['secretory','ER → Golgi → outside'],['cytosol','Free ribosome → cytosol']),signal:true,motor:true,
 why:'The RNA message leaves through a nuclear pore. Translation begins on a ribosome; the ER signal directs the growing chain into ER. Vesicles carry lumenal cargo through Golgi sorting and to the plasma membrane. Fusion releases the soluble protein outside: exocytosis. The protein never passes through the nucleus.'},
 {id:'cytosolic-parcel',title:'Change the protein address',objectiveIds:['bio-cargo'],prompt:'Use a fresh RNA message for a soluble cytosolic protein with no ER-entry signal and no other targeting signal. Keep the rest of the cell working.',target:'cytosol',options:choices(['secretory','ER → Golgi → outside'],['cytosol','Free ribosome → cytosol']),signal:false,motor:true,
 why:'The new protein remains in cytosol after translation on a free ribosome. Free and ER-associated ribosomes come from the same pool; they are not two permanently different kinds. A protein needs suitable targeting information to use the modeled ER-entry route.'},
 {id:'track-repair',title:'Restart the vesicle motor',objectiveIds:['bio-cargo','bio-cytoskeleton'],prompt:'A secretory vesicle is already loaded. The microtubule track and motor are intact, but this isolated motor assay has no usable ATP. Predict directed travel before restoring ATP.',target:'stalled',options:choices(['stalled','No motor-driven trip'],['moving','Track alone moves the parcel']),signal:true,motor:false,
 why:'Microtubules provide tracks; an ATP-powered motor provides this directed movement. Adding ATP restarts the isolated motor while keeping cargo and track fixed. Actin filaments also support shape and some movement; intermediate filaments provide mechanical support. This does not model all cell movement or ATP depletion of a whole cell.'}
]);

export const PLANT_CASES=freeze([
 {id:'wall-supported',title:'Support the greenhouse cell',objectiveIds:['bio-plant'],wall:true,bath:120,inside:240,target:'turgor',options:choices(['turgor','Entry builds opposing pressure'],['sealed','Wall prevents water crossing'],['shrink','Contents pull away']),prompt:'An initially flaccid plant cell has an intact wall. The dilute bath and water-permeable membrane are ready. Predict what the wall changes.',why:'Water enters net initially. Expansion against the wall builds turgor: internal pressure that opposes further entry. At water-potential balance, water still exchanges but has no net movement. The wall is support, not a watertight seal.'},
 {id:'wall-removed',title:'Remove only the support',objectiveIds:['bio-plant'],wall:false,bath:120,inside:240,target:'swell',options:choices(['swell','Contents expand with less restraint'],['sealed','No water crosses'],['shrink','Contents shrink']),prompt:'Reset the same initial cell contents and dilute bath. In this idealized comparison, remove only the wall and retain an intact plasma membrane.',why:'The wall-free plant protoplast can swell with less mechanical restraint. Large enough swelling can rupture it; these short snapshots do not predict a rupture time or final size. A cell without its wall is still derived from a plant.'},
 {id:'salted-bath',title:'Change the outside supply',objectiveIds:['bio-plant'],wall:true,bath:480,inside:240,target:'shrink',options:choices(['turgor','Pressure rises by water entry'],['sealed','Wall prevents water crossing'],['shrink','Contents pull away']),prompt:'Reset the initially flaccid intact-wall cell. Change only the bath to a higher concentration of nonpenetrating solute. Predict the response.',why:'Water exits net. The membrane and contents pull away from the supporting wall: plasmolysis. Wall size stays approximately fixed in this schematic and the initially flaccid cell does not gain turgor. The wall does not stop the membrane from losing water.'}
]);

export const ENZYME_CASES=freeze([
 {id:'substrate-dial',title:'Tune the substrate supply',objectiveIds:['bio-enzyme-rate'],vmax:72,km:3,target:'bend',options:choices(['bend','Rate gains get smaller'],['linear','Every addition gives the same gain']),prompt:'Keep active enzyme amount fixed. Predict the shape of initial rate as you raise substrate concentration.',why:'Each fresh assay measures the starting rate. v = Vmax[S]/(Km + [S]); here Vmax = 72 units/min and Km = 3 mM. Extra substrate gives diminishing gains toward the limiting rate. Km locates half Vmax; it is not universally a binding constant.'},
 {id:'enzyme-doubled',title:'Add more active enzyme',objectiveIds:['bio-enzyme-rate'],vmax:144,km:3,target:'capacity',options:choices(['capacity','Higher capacity; same half-rate concentration'],['km','Same capacity; higher half-rate concentration']),prompt:'Prepare fresh assays with twice the active enzyme. Keep volume, temperature, pH and enzyme properties fixed. Predict the curve compared with the original.',why:'Twice the active enzyme doubles Vmax to 144 units/min and doubles each initial rate at a fixed [S]. Km stays 3 mM. Enzyme amount changes capacity here, not the substrate concentration giving half of that preparation’s own limiting rate.'},
 {id:'competitive-supply',title:'Investigate reagent C',objectiveIds:['bio-enzyme-inhibition'],vmax:72,km:9,target:'competitive',options:choices(['competitive','Same limit; more substrate for half-rate'],['pure','Lower limit; same half-rate concentration']),prompt:'Return to the original enzyme amount and add a reversible competitor for substrate binding. Predict the ideal competitive pattern, then compare several concentrations.',why:'The stated competitive model has Vmax 72 units/min and apparent Km 9 mM. More substrate increasingly offsets inhibition, approaching the same limiting rate. No finite tested concentration is labeled exactly Vmax.'},
 {id:'pure-inhibitor',title:'Compare a different inhibitor',objectiveIds:['bio-enzyme-inhibition'],vmax:36,km:3,target:'pure',options:choices(['competitive','Same limit; more substrate for half-rate'],['pure','Lower limit; same half-rate concentration']),prompt:'Reset again and use a specified pure noncompetitive inhibitor. Predict the ideal pattern; do not classify it from one low reading.',why:'The pure noncompetitive model has Vmax 36 units/min with Km still 3 mM. This is a particular reversible model, not every inhibitor that binds elsewhere. A single rate cannot identify the pattern; compare the curves and each curve’s own half-limit.'}
]);

const CASES={compartment:COMPARTMENT_CASES,cargo:CARGO_CASES,plant:PLANT_CASES,enzyme:ENZYME_CASES};
const concentrations=[1,3,9,27,81];
const initial=()=>({version:1,caseIndex:0,phase:'predict',prediction:null,step:0,help:false,replayed:false,substrate:1,measured:[]});
const plain=x=>x&&typeof x==='object'&&!Array.isArray(x);
const maxStep=(kind,c)=>kind==='cargo'?(c.id==='track-repair'?3:c.signal?6:2):2;
function normalize(kind,raw){
 const s=initial(),cases=CASES[kind];if(!plain(raw)||raw.version!==1)return s;
 if(Number.isInteger(raw.caseIndex)&&raw.caseIndex>=0&&raw.caseIndex<cases.length)s.caseIndex=raw.caseIndex;
 const c=cases[s.caseIndex],allowed=[...c.options.map(([k])=>k),'unsure'];
 s.prediction=allowed.includes(raw.prediction)?raw.prediction:null;s.help=raw.help===true;s.replayed=raw.replayed===true;
 if(concentrations.includes(raw.substrate))s.substrate=raw.substrate;
 if(s.prediction!==null&&['observe','explain','done'].includes(raw.phase)){
  s.phase=raw.phase;s.step=Number.isInteger(raw.step)?Math.min(maxStep(kind,c),Math.max(0,raw.step)):0;
  if(kind==='enzyme'&&Array.isArray(raw.measured))s.measured=[...new Set(raw.measured.filter(v=>concentrations.includes(v)))].slice(0,5);
  const observed=kind==='enzyme'?s.measured.length>=3:s.step===maxStep(kind,c);
  if(!observed&&s.phase!=='observe')s.phase='observe';
  if(s.phase==='done'&&s.caseIndex!==cases.length-1)s.phase='explain';
 }
 return s;
}
function reduce(kind,raw,action,value){
 const s=normalize(kind,raw),c=CASES[kind][s.caseIndex];
 if(action==='reset')return initial();
 if(action==='retry')return {...initial(),caseIndex:s.caseIndex,replayed:true};
 if(action==='help')return {...s,help:!s.help};
 if(action==='predict'&&s.phase==='predict'&&[...c.options.map(([k])=>k),'unsure'].includes(value))s.prediction=value;
 if(action==='undo'&&s.phase==='predict')s.prediction=null;
 if(action==='commit'&&s.phase==='predict'&&s.prediction!==null)s.phase='observe';
 if(action==='advance'&&s.phase==='observe'&&kind!=='enzyme')s.step=Math.min(maxStep(kind,c),s.step+1);
 if(action==='substrate'&&s.phase==='observe'&&kind==='enzyme'&&concentrations.includes(Number(value)))s.substrate=Number(value);
 if(action==='measure'&&s.phase==='observe'&&kind==='enzyme'&&!s.measured.includes(s.substrate))s.measured=[...s.measured,s.substrate];
 if(action==='explain'&&s.phase==='observe'&&(kind==='enzyme'?s.measured.length>=3:s.step===maxStep(kind,c)))s.phase='explain';
 if(action==='next'&&s.phase==='explain'&&s.caseIndex<CASES[kind].length-1)return {...initial(),caseIndex:s.caseIndex+1};
 if(action==='finish'&&s.phase==='explain'&&s.caseIndex===CASES[kind].length-1)s.phase='done';
 return s;
}

export function compartmentObservation(raw){const s=normalize('compartment',raw),c=COMPARTMENT_CASES[s.caseIndex];return {revealed:s.phase!=='predict',mode:c.mode,target:s.phase==='predict'?null:s.step===0?s.prediction:c.target,output:s.step===2?c.output:null,guided:s.phase!=='predict'&&s.prediction!==c.target};}
export function cargoObservation(raw){
 const s=normalize('cargo',raw),c=CARGO_CASES[s.caseIndex],revealed=s.phase!=='predict';
 const route=c.id==='track-repair'?['stalled-vesicle','ATP-restored','motor-trip','membrane-fusion']:c.signal?['nuclear-RNA','RNA-export','ER-entry','ER-vesicle','Golgi','secretory-vesicle','outside']:['nuclear-RNA','RNA-export','cytosolic-protein'];
 return {revealed,location:route[revealed?s.step:0],route:revealed?route.slice(0,s.step+1):[],molecule:!c.motor?'protein-in-vesicle':s.step<2?'RNA-message':'protein',proteinThroughNucleus:false,erEntry:revealed&&c.signal&&c.motor&&s.step>=2,directedTravel:revealed&&c.id==='track-repair'&&s.step>=2,atpRestored:revealed&&c.id==='track-repair'&&s.step>=1};
}
export function plantObservation(raw){
 const s=normalize('plant',raw),c=PLANT_CASES[s.caseIndex],revealed=s.phase!=='predict'&&s.step>0;
 return {revealed,wall:c.wall,wallWidth:260,membraneWidth:!revealed?224:c.bath>c.inside?224-s.step*30:c.wall?250:224+s.step*30,
  soluteCrossings:0,waterExchange:revealed,net:!revealed?'hidden':c.bath>c.inside?'out':c.wall&&s.step===2?'balanced':'in',pressure:!revealed?'initial':c.bath>c.inside?'low':c.wall?s.step===2?'balances-osmosis':'rising':'little-wall-restraint'};
}
export function enzymeRate(substrate,vmax,km){
 if(![substrate,vmax,km].every(Number.isFinite)||substrate<0||vmax<0||km<=0)throw new RangeError('Nonnegative substrate/rate and positive Km required');
 return vmax*substrate/(km+substrate);
}
export function enzymeObservation(raw){const s=normalize('enzyme',raw),c=ENZYME_CASES[s.caseIndex];return {points:s.measured.map(substrate=>({substrate,control:enzymeRate(substrate,72,3),rate:enzymeRate(substrate,c.vmax,c.km)})),fullCurve:['explain','done'].includes(s.phase),vmax:['explain','done'].includes(s.phase)?c.vmax:null,km:['explain','done'].includes(s.phase)?c.km:null};}

const ink='#233b36',green='#3c7564',gold='#bd8730';
const text=(x,y,t,size=16)=>`<text x="${x}" y="${y}" fill="${ink}" font-size="${size}" text-anchor="middle">${esc(t)}</text>`;
const stationLabel=(x,label)=>{const words=label.split(' '),first=[],second=[];for(const word of words)(first.join(' ').length+word.length<22&&!second.length?first:second).push(word);return text(x,250,first.join(' '),13)+(second.length?text(x,267,second.join(' '),13):'');};
const line=(x1,y1,x2,y2,color=green,width=3)=>`<path d="M${x1} ${y1}L${x2} ${y2}" stroke="${color}" stroke-width="${width}" fill="none"/>`;
const dot=(x,y,color=gold,r=8)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${color}" stroke="${ink}" stroke-width="1.5"/>`;
const packet=(x,y,lumen=false)=>`<g data-cargo="protein">${lumen?`<circle cx="${x}" cy="${y}" r="23" fill="#f3dbaa" stroke="${green}" stroke-width="3"/>`:''}${[[-8,0],[0,-7],[8,0],[0,7]].map(([dx,dy])=>dot(x+dx,y+dy,'#c77744',5)).join('')}</g>`;
const arrow=(x1,y1,x2,y2,id)=>`<g data-flow="${id}">${line(x1,y1,x2,y2,'#267ca1')}<path d="M${x2-7} ${y2-5}L${x2} ${y2}L${x2-7} ${y2+5}" fill="none" stroke="#267ca1" stroke-width="3"/></g>`;
const sceneSvg=(label,body)=>svg(label,body,'0 0 640 390');
const frame=body=>`<rect width="640" height="390" rx="20" fill="#e2ebcf"/>${body}`;
function stationIcon(key,x,y){
 if(['nucleus','nucleoid','wall'].includes(key))return `<rect x="${x-62}" y="${y-50}" width="124" height="95" rx="34" fill="#f8edc9" stroke="${green}" stroke-width="${key==='wall'?9:3}"/>${key==='nucleus'?`<ellipse cx="${x}" cy="${y}" rx="35" ry="28" fill="#dad4ec" stroke="#66567e" stroke-width="3"/>`:''}<path d="M${x-24} ${y-7}q12 -16 24 0t24 0M${x-24} ${y+6}q12 16 24 0t24 0" stroke="#76558c" fill="none" stroke-width="3"/>${[[-40,22],[40,20],[-30,-32]].map(([dx,dy])=>dot(x+dx,y+dy,'#746e52',3)).join('')}`;
 if(['inner','matrix'].includes(key))return `<ellipse cx="${x}" cy="${y}" rx="65" ry="37" fill="#ead7b4" stroke="${green}" stroke-width="3"/><path d="M${x-55} ${y}q12 -29 20 0t20 0t20 0t20 0t20 0" stroke="${key==='inner'?gold:green}" stroke-width="4" fill="none"/>${key==='matrix'?dot(x,y+20,gold,6):''}`;
 if(['thylakoid','stroma'].includes(key))return `<ellipse cx="${x}" cy="${y}" rx="65" ry="40" fill="#c5dfb5" stroke="${green}" stroke-width="3"/>${[-20,20].map(dx=>[0,7,14].map(dy=>`<rect x="${x+dx-14}" y="${y-16+dy}" width="28" height="6" rx="3" fill="${key==='thylakoid'?gold:green}"/>`).join('')).join('')}${key==='stroma'?dot(x,y+22,gold,6):''}`;
 if(key==='golgi')return [0,12,24].map(dy=>`<path d="M${x-40} ${y-18+dy}Q${x} ${y+dy} ${x+40} ${y-18+dy}" stroke="${green}" stroke-width="7" fill="none"/>`).join('');
 return `<circle cx="${x}" cy="${y}" r="43" fill="${key==='nucleolus'?'#d8c9e7':key==='lysosome'?'#e8c2b1':'#b9d8de'}" stroke="${green}" stroke-width="3"/>${key==='nucleolus'?`<circle cx="${x}" cy="${y}" r="20" fill="#856495"/>`:[[-14,-8],[12,-10],[0,15]].map(([dx,dy])=>dot(x+dx,y+dy,key==='peroxisome'?'#31869a':gold,6)).join('')}`;
}
function compartmentScene(s){
 const c=COMPARTMENT_CASES[s.caseIndex],o=compartmentObservation(s);
 const stations=c.options.map(([key,label],i)=>{const x=115+i*205,active=o.target===key;return `<g data-station="${key}">${stationIcon(key,x,178)}${stationLabel(x,label)}${active?`<rect x="${x-76}" y="112" width="152" height="168" rx="15" fill="none" stroke="${s.step>0?green:gold}" stroke-width="4"/>`:''}</g>`;}).join('');
 const index=c.options.findIndex(([key])=>key===o.target),x=index<0?320:115+index*205;
 const lens=s.phase==='predict'?`<circle cx="320" cy="66" r="18" fill="#f8edc9" stroke="${green}" stroke-width="4"/>`:`<g data-probe="${c.mode}"><circle cx="${x}" cy="${s.step?178:75}" r="24" fill="none" stroke="#267ca1" stroke-width="5"/>${line(x+16,s.step?196:93,x+31,s.step?211:108,'#267ca1',6)}</g>`;
 return sceneSvg(`${c.title}. Three labeled stations. ${o.output||'Choose a station before opening the instrument readout.'}`,frame(text(320,30,c.mode==='scan'?'QUARTER SCAN LENS':'QUARTER REPAIR PROBE',18)+stations+lens+text(320,307,o.output||c.payload,17)+text(320,341,s.phase==='predict'?'Place the probe using the station buttons.':s.step===0?'Dispatch selected. Run the probe to inspect the working site.':s.step===1?'Probe at the working site. Run the output test.':'Readout complete; compare the repaired function.',14)))+`<p class="exp-caption">${c.mode==='scan'?'The moving lens inspects structures; it does not transport DNA.':'The probe marks a repair location; it is not a molecular transport mechanism.'} Shapes are schematic, not to scale.</p>`;
}
function cargoScene(s){
 const c=CARGO_CASES[s.caseIndex],o=cargoObservation(s),motor=c.id==='track-repair';
 const labels=motor?['Loaded vesicle','Track + motor','Plasma membrane']:['Nucleus','Rough ER','Golgi','Outside'];
 const nodes=motor?[[100,185],[315,185],[540,185]]:[[65,155],[230,155],[390,155],[575,155]];
 const fusion=o.location==='outside'||o.location==='membrane-fusion';
 let body=`<rect x="20" y="65" width="510" height="244" rx="25" fill="#fff8e1" stroke="${green}" stroke-width="4"/>${line(530,72,530,301,green,6)}`;
 if(fusion)body+=`<path data-fusion-opening="true" d="M530 159V211" stroke="#fff8e1" stroke-width="9"/><path d="M530 159C494 159 494 211 530 211" stroke="${green}" stroke-width="4" fill="none"/>`;
 if(motor){body+=line(100,227,490,227,green,8)+line(100,238,490,238,green,8)+text(305,266,'Microtubule track',15)+text(310,100,o.atpRestored?'ATP supplied to motor':'Usable ATP absent in this isolated assay',15);const x=s.step<2?120:s.step===2?350:555;body+=packet(x,185,s.step<3)+`<rect x="${Math.min(x,490)-10}" y="210" width="20" height="15" rx="4" fill="#755c83"/>`;
 }else{body+=`<ellipse cx="65" cy="155" rx="35" ry="62" fill="#ded3ec" stroke="#715c8b" stroke-width="3"/><path data-nuclear-pore="true" d="M99 169L94 190" stroke="#fff8e1" stroke-width="8"/>${line(94,169,104,172,'#715c8b',4)}${line(90,188,100,191,'#715c8b',4)}${text(65,140,'DNA',14)}${line(42,151,84,151,'#715c8b')}${stationIcon('golgi',390,155)}<path d="M182 110v94h95M199 110v77h78M216 110v60h61" fill="none" stroke="${green}" stroke-width="5"/>${dot(205,112,'#655575',6)}${dot(222,128,'#655575',6)}`;
  const where={'nuclear-RNA':[65,180],'RNA-export':[128,180],'ER-entry':[245,155],'ER-vesicle':[310,185],Golgi:[390,155],'secretory-vesicle':[470,185],outside:[575,185],'cytosolic-protein':[195,270]};const [x,y]=where[o.location];
  body+=o.molecule==='RNA-message'?`<g data-cargo="RNA-message"><path d="M${x-14} ${y}q7 -9 14 0t14 0" stroke="#825ba0" stroke-width="4" fill="none"/></g>`:packet(x,y,['ER-vesicle','secretory-vesicle'].includes(o.location));
  if(o.location==='cytosolic-protein')body+=dot(166,270,'#655575',9)+text(250,293,'Cytosol: cell fluid outside organelles',12);
 }
 body+=nodes.map(([x],i)=>text(x,335,labels[i],14)).join('');
 if(o.revealed)body+=text(320,367,o.location.replaceAll('-',' '),16);
 return sceneSvg(`${c.title}. ${o.revealed?`Observed checkpoint: ${o.location}.`:'RNA or loaded vesicle is at the starting checkpoint; no route result is shown.'}`,frame(body))+`<p class="exp-caption">${motor?'Manual snapshots of a single motor assay; not whole-cell ATP removal. The track does not generate energy.':'Purple strand: RNA message; orange chain: protein; outlined circle: membrane vesicle. Ribosomes build protein outside the nucleus. Interior cargo stays separated from cytosol during vesicle travel.'} Checkpoints are logical steps, not measured travel times.</p>`;
}
function plantScene(s){
 const c=PLANT_CASES[s.caseIndex],o=plantObservation(s),x=320-o.membraneWidth/2;
 let body=`<rect x="45" y="65" width="550" height="245" rx="18" fill="#cce4dc"/>${c.wall?'<rect x="190" y="85" width="260" height="205" rx="10" fill="none" stroke="#6c8c48" stroke-width="12"/>':''}<rect x="${x}" y="${95+(260-o.membraneWidth)/4}" width="${o.membraneWidth}" height="${180-(260-o.membraneWidth)/2}" rx="24" fill="#e9dcab" stroke="${green}" stroke-width="4"/><ellipse cx="320" cy="188" rx="${o.membraneWidth*.32}" ry="53" fill="#b8dce4" stroke="#477e8e" stroke-width="2"/>${text(320,193,'Vacuole',15)}${text(320,35,c.wall?'Wall present':'Wall removed; membrane intact',18)}${text(320,333,`Initial contents ${c.inside} · bath ${c.bath} mOsm/L`,15)}`;
 if(o.waterExchange){const inward=o.net==='in'?6:3,outward=o.net==='out'?6:3;body+=`<g data-flow="water-in" data-width="${inward}">${line(120,167,x+12,167,'#267ca1',inward)}<path d="M${x+4} 161l8 6-8 6" fill="none" stroke="#267ca1" stroke-width="3"/></g><g data-flow="water-out" data-width="${outward}">${line(x+12,211,120,211,'#267ca1',outward)}<path d="M128 205l-8 6 8 6" fill="none" stroke="#267ca1" stroke-width="3"/></g>`;}
 body+=text(320,365,o.revealed?`Water: ${o.net} · wall pressure: ${o.pressure.replaceAll('-',' ')}`:'Open the observation window after predicting.',14);
 return sceneSvg(`${c.title}. ${o.revealed?`Water ${o.net}; pressure ${o.pressure}.`:'Starting cell and bath; no response shown.'}`,frame(body))+`<p class="exp-caption">All solutes remain nonpenetrating; water can cross the membrane. Initially no pressure difference; a large bath stays fixed. Snapshots are schematic, not a volume calculation.${o.net==='balanced'?' The supported cell’s balanced arrows mean pressure balances the water-potential difference, not that solute concentrations must become equal.':''}</p>`;
}
function enzymeScene(s){
 const c=ENZYME_CASES[s.caseIndex],o=enzymeObservation(s),px=n=>330+n*3.2,py=n=>300-n*1.5;
 let body=`<rect x="35" y="88" width="160" height="210" rx="17" fill="#fff4d6" stroke="${green}" stroke-width="4"/><rect x="47" y="170" width="136" height="115" fill="#c5dfc8"/>${text(115,55,'FRESH ASSAY',18)}${text(115,124,`${s.substrate} mM substrate`,14)}${text(115,326,'Initial rate meter',15)}${dot(90,211,'#74628b',18)}${dot(142,236,'#74628b',18)}${[65,100,135,170].map(x=>dot(x,180,gold,5)).join('')}${line(330,300,605,300)}${line(330,300,330,50)}${text(470,341,'Substrate concentration (mM)',13)}${text(460,26,'Initial rate (units/min)',15)}`;
 for(const n of [0,27,54,81])body+=text(px(n),320,String(n),12);
 for(const n of [0,48,96,144])body+=text(310,py(n)+4,String(n),12);
 if(o.fullCurve){for(const [vmax,km,color] of [[72,3,'#718b9d'],[c.vmax,c.km,green]])body+=`<polyline data-rate-curve="${color}" points="${Array.from({length:82},(_,n)=>`${px(n)},${py(enzymeRate(n,vmax,km))}`).join(' ')}" fill="none" stroke="${color}" stroke-width="3"/>`;}
 for(const p of o.points)body+=dot(px(p.substrate),py(p.control),'#718b9d',4)+dot(px(p.substrate),py(p.rate),green,6);
 const last=o.points.at(-1);if(last)body+=text(115,360,`${last.rate.toFixed(1)} units/min`,16);
 body+=text(475,370,'Gray: original · green: current',13);
 const readings=o.points.length?`<table class="exp-assay-table"><caption>Independent fresh initial-rate assays</caption><thead><tr><th>[S] (mM)</th><th>Original (units/min)</th><th>Current (units/min)</th></tr></thead><tbody>${o.points.map(p=>`<tr><td>${p.substrate}</td><td>${p.control.toFixed(1)}</td><td>${p.rate.toFixed(1)}</td></tr>`).join('')}</tbody></table>`:'';
 return sceneSvg(`${c.title}. ${o.points.length} concentrations measured. ${o.fullCurve?'Model curves now visible.':'Only collected readings are shown.'}`,frame(body))+readings+`<p class="exp-caption">Substrate is the reactant; an enzyme helps convert it to product. mM means millimoles per liter. Each concentration uses a fresh initial-rate assay, not additions to a depleted tube. One-substrate Michaelis–Menten model; fixed pH and temperature, no cooperativity, depletion or damage. Enzyme icons identify the apparatus, not molecule counts.</p>`;
}

function view(kind,raw){
 const s=normalize(kind,raw),cases=CASES[kind],c=cases[s.caseIndex];let controls='',coach='',prompt=c.prompt,primary;
 const selected=c.options.find(([key])=>key===s.prediction)?.[1]||'Explore with me';
 if(s.phase==='predict'){
  controls=group(kind==='compartment'?'Place the scan or repair probe':'Make a prediction',[...c.options,unsure].map(([key,label])=>button(label,'predict',key,{selected:s.prediction===key})).join(''));
  controls+=button('Undo selection','undo','',{disabled:s.prediction===null});primary={action:'commit',label:kind==='compartment'?'Dispatch the probe':'Commit prediction',disabled:s.prediction===null};
  if(s.help)coach=c.hint||(kind==='cargo'?'Track RNA separately from protein. Check the address signal or the motor’s energy supply.':kind==='plant'?'The membrane selects what crosses; the wall resists expansion. Look for both structures.':'Compare several substrate concentrations at fixed conditions. Rate is product formed per time, not substrate concentration.');
 }else if(s.phase==='observe'){
  prompt=kind==='enzyme'?'Set the substrate dial, then measure a fresh assay. Collect at least three distinct concentrations.':kind==='cargo'?'Operate one checkpoint at a time; follow the payload and its boundary.':'Operate the instrument and compare the observed change.';
  coach=`You predicted: ${selected}. `;
  if(kind==='compartment')coach+=s.step===0?(s.prediction===c.target?'The selected probe is ready.':'The selected station does not complete this job. Apply the guided repair and inspect its output.'):'The probe now follows the reviewed working location.';
  else if(s.help)coach+='Keep the initial conditions in view; these observations are guided, not scored.';
  if(kind==='enzyme'){
   controls=group('Substrate dial',concentrations.map(n=>button(`${n} mM`,'substrate',n,{selected:s.substrate===n})).join(''));
   controls+=button('Measure this fresh assay','measure','',{disabled:s.measured.includes(s.substrate)});
   primary={action:'explain',label:'Compare and explain the curves',disabled:s.measured.length<3};
  }else primary=s.step===maxStep(kind,c)?{action:'explain',label:'Explain what changed'}:{action:'advance',label:kind==='cargo'?(c.id==='track-repair'&&s.step===0?'Supply ATP to the motor':'Operate next checkpoint'):kind==='compartment'?(s.step===0?'Run probe at working site':'Test the repaired output'):s.step===0?'Open first observation':'Follow the later response'};
 }else{
  coach=`You predicted: ${selected}. ${c.why}`;
  prompt=s.phase==='done'?'Guided repairs complete. Independent practice is separate.':'Use the observation to explain the repair, then change the case.';
  primary=s.phase==='done'?{action:'reset',label:'Explore again'}:s.caseIndex===cases.length-1?{action:'finish',label:'Complete this system'}:{action:'next',label:'Load the changed case'};
 }
 if(s.replayed)coach+=(coach?' ':'')+'Replay: this is the same instructional case.';
 controls+=group('Learning tools',button(s.help?'Hide clue':'Ask for a clue','help','',{selected:s.help})+button('Retry this case','retry')+button('Restart system','reset'));
 const draw={compartment:compartmentScene,cargo:cargoScene,plant:plantScene,enzyme:enzymeScene}[kind];
 return {scene:`<div class="exp-biology-systems"><p class="exp-scene-label">${esc(c.title)}</p>${draw(s)}</div>`,prompt,coach,controls,primary,activeObjectiveIds:[...c.objectiveIds],progress:{current:s.caseIndex+1,total:cases.length,label:`Case ${s.caseIndex+1} of ${cases.length} · ${s.phase}`},complete:s.phase==='done'};
}
const FAMILIAR_FAMILIES={compartment:[],cargo:['bio-quarter-motor-versus-track-experiment'],plant:['bio-plant-wall-removal'],enzyme:['bio-rate-enzyme-amount-perturbation','bio-inhibition-discriminating-experiment']};
function activity(kind,id,title,sourceUrls){const cases=CASES[kind],familiarFamilyIds=FAMILIAR_FAMILIES[kind];return {id,title,world:'bio',version:1,objectiveIds:[...new Set(cases.flatMap(c=>c.objectiveIds))],sourceUrls,familiarFamilyIds,instructionFamilies:[...cases.map(c=>`discovery-systems-${c.id}`),...familiarFamilyIds],initial,normalize:s=>normalize(kind,s),reduce:(s,a,v)=>reduce(kind,s,a,v),view:s=>view(kind,s)};}
export const BIOLOGY_SYSTEMS_ACTIVITIES=freeze([
 activity('compartment','bio-quarter-systems-repair','Repair the Organelle Quarter',[U.prok,U.cell,U.endo,U.resp,U.light,U.carbon]),
 activity('cargo','bio-payload-routing','Route the Living Parcel',[U.endo,U.cell,U.targeting,U.tracks]),
 activity('plant','bio-greenhouse-support','Restore the Greenhouse Support',[U.water]),
 activity('enzyme','bio-enzyme-assay-bench','Tune the Enzyme Assay Bench',[U.enzyme,U.kinetics])
]);
