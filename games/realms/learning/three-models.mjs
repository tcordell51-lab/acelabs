// Original serializable chemistry geometry. This module does not import Three,
// a molecular asset, the question bank, or a simulation/energy-minimization engine.
// Renderer contract: show only after the current instructional commitment;
// rotate a static model, never interpolate these scenes into reaction dynamics.
const freeze=x=>{if(x&&typeof x==='object'){Object.values(x).forEach(freeze);Object.freeze(x);}return x;};
const add=(a,b)=>a.map((v,i)=>v+b[i]);
const sub=(a,b)=>a.map((v,i)=>v-b[i]);
const mul=(a,k)=>a.map(v=>v*k);
const dot=(a,b)=>a.reduce((n,v,i)=>n+v*b[i],0);
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const unit=a=>mul(a,1/Math.hypot(...a));
const midpoint=(a,b)=>mul(add(a,b),.5);
const TETRA=[[-1/3,Math.sqrt(8)/3,0],[-1/3,-Math.sqrt(2)/3,Math.sqrt(2/3)],[-1/3,-Math.sqrt(2)/3,-Math.sqrt(2/3)]];
const SOURCES=freeze([
  'https://openstax.org/books/organic-chemistry/pages/11-2-the-sn2-reaction',
  'https://openstax.org/books/organic-chemistry/pages/11-3-characteristics-of-the-sn2-reaction',
  'https://openstax.org/books/organic-chemistry/pages/1-6-sp3-hybrid-orbitals-and-the-structure-of-methane',
  'https://openstax.org/books/organic-chemistry/pages/1-7-sp3-hybrid-orbitals-and-the-structure-of-ethane'
]);

export const SN2_CASES=freeze([
  {id:'methyl-bridge',substrate:'Bromomethane',nucleophile:'Methanethiolate',product:'Dimethyl sulfide',substituent:'hydrogen',reactingCarbonStereocenter:false},
  {id:'ethyl-bridge',substrate:'Bromoethane',nucleophile:'Methanethiolate',product:'Ethyl methyl sulfide',substituent:'methyl',reactingCarbonStereocenter:false}
]);
const ELEMENTS=freeze({
  C:{name:'carbon',color:'#475569',displayRadius:.24},
  H:{name:'hydrogen',color:'#f5f5e9',displayRadius:.14},
  S:{name:'sulfur',color:'#d2a52b',displayRadius:.29},
  Br:{name:'bromine',color:'#a35435',displayRadius:.30}
});
const LEGEND=freeze([
  {symbol:'Atom ball',meaning:'One atom. The letter identifies its element; sizes and colors are display choices.'},
  {symbol:'Bond stick',meaning:'A single covalent bond: two electrons shared between these atoms.'},
  {symbol:'Paired dots',meaning:'A lone pair: two electrons assigned to one atom rather than a bond. Dot positions are diagram symbols, not measured electron locations.'},
  {symbol:'Curved arrow',meaning:'A proposed movement of one electron pair. It is not an atom trajectory or a covalent bond.'},
  {symbol:'Charge',meaning:'The signed number is the formal charge assigned to that atom in this Lewis structure.'},
  {symbol:'SN2',meaning:'A substitution in one concerted step: the incoming bond forms as the leaving bond breaks.'}
]);

// Given one existing carbon bond direction u, the other three point to the
// remaining vertices of a regular tetrahedron: every pair has dot = -1/3.
function otherTetrahedralDirections(u){
  const reference=Math.abs(u[2])<.8?[0,0,1]:[0,1,0];
  const a=unit(cross(u,reference)),b=cross(u,a);
  return [0,1,2].map(i=>{
    const t=i*2*Math.PI/3+Math.PI/3;
    return add(mul(u,-1/3),mul(add(mul(a,Math.cos(t)),mul(b,Math.sin(t))),Math.sqrt(8)/3));
  });
}

/**
 * createSN2Model({caseId,phase,committed:true}) -> JSON-only model.
 * Reactants and products are separate valid Lewis structures; no intermediate
 * phase is provided. The caller owns exposure/commitment persistence.
 * Undefined/false/non-boolean commitment returns null without exposing a scene.
 */
export function createSN2Model(options={}){
  if(!options||typeof options!=='object'||Array.isArray(options)||options.committed!==true)return null;
  const caseId=options.caseId??'methyl-bridge',phase=options.phase??'reactants';
  const spec=SN2_CASES.find(c=>c.id===caseId);
  if(!spec)throw new RangeError('Unknown reviewed SN2 teaching case.');
  if(!['reactants','products'].includes(phase))throw new RangeError('Use separate reactant or product scenes; no intermediate is modeled.');
  const product=phase==='products',atoms=[],bonds=[],electronPairs=[];
  const mainMolecule=product?'thioether':'alkyl-bromide',donorMolecule=product?'thioether':'methanethiolate';
  function atom(id,element,position,charge,moleculeId,role='atom'){
    const e=ELEMENTS[element];atoms.push({id,element,position:[...position],charge,moleculeId,role,label:e.name,...e});return position;
  }
  function bond(id,a,b){bonds.push({id,a,b,order:1,kind:'covalent'});}
  function lonePair(id,atomId,position){electronPairs.push({id,atomId,position:[...position],electrons:2,kind:'lone-pair',symbolOffset:[0,.065,0]});}
  function methyl(id,position,parentId,parentPosition,moleculeId){
    atom(id,'C',position,0,moleculeId);bond(`bond-${parentId}-${id}`,parentId,id);
    const u=unit(sub(parentPosition,position));
    otherTetrahedralDirections(u).forEach((d,i)=>{
      const hid=`${id}-h${i+1}`;atom(hid,'H',add(position,mul(d,1.03)),0,moleculeId);bond(`bond-${id}-${hid}`,id,hid);
    });
  }
  const cPos=atom('c-electrophile','C',[0,0,0],0,mainMolecule,'receiving-carbon');
  const sPos=atom('s-donor','S',product?[-1.8,0,0]:[-3.3,0,0],product?0:-1,donorMolecule,'incoming-sulfur');
  const brPos=atom('br-leaving','Br',product?[3.3,-.3,0]:[1.8,0,0],product?-1:0,product?'bromide':mainMolecule,'leaving-bromine');
  // Reflect the three retained directions to the opposite side of the center.
  // This is an idealized pair of endpoints, not a path or R/S demonstration.
  TETRA.forEach((direction,i)=>{
    const d=product?[-direction[0],direction[1],direction[2]]:direction;
    if(i===0&&spec.substituent==='methyl')methyl('c-substrate-methyl',add(cPos,mul(d,1.55)),'c-electrophile',cPos,mainMolecule);
    else{const id=`h-substrate-${i+1}`;atom(id,'H',add(cPos,mul(d,1.03)),0,mainMolecule);bond(`bond-c-electrophile-${id}`,'c-electrophile',id);}
  });
  methyl('c-donor-methyl',add(sPos,mul(TETRA[0],1.8)),'s-donor',sPos,donorMolecule);
  if(product)bond('bond-c-s','c-electrophile','s-donor');else bond('bond-c-br','c-electrophile','br-leaving');

  // The donor lone pair points toward carbon; its exact displayed center is
  // also the electron-arrow tail. The other sulfur pairs survive in products.
  if(!product)lonePair('s-pair-donor','s-donor',add(sPos,[.45,0,0]));
  lonePair('s-pair-b','s-donor',add(sPos,mul(TETRA[1],.45)));
  lonePair('s-pair-c','s-donor',add(sPos,mul(TETRA[2],.45)));
  TETRA.forEach((d,i)=>lonePair(`br-pair-${i+1}`,'br-leaving',add(brPos,mul([-d[0],d[1],d[2]],.48))));
  if(product)lonePair('br-pair-from-cbr','br-leaving',add(brPos,[-.48,0,0]));

  const arrows=product?[]:[
    {id:'arrow-s-pair-to-carbon',kind:'electron-pair',from:{pairId:'s-pair-donor'},to:{atomId:'c-electrophile'},
      points:[[...electronPairs.find(p=>p.id==='s-pair-donor').position],[-2.05,1.35,.55],[-.45,1.05,.4],[...cPos]],
      label:'Sulfur lone pair forms the new carbon–sulfur bond.',simultaneousGroup:'sn2-concerted'},
    {id:'arrow-cbr-pair-to-bromine',kind:'electron-pair',from:{bondId:'bond-c-br'},to:{atomId:'br-leaving'},
      points:[midpoint(cPos,brPos),[1.0,-1.1,.45],[1.8,-.85,.35],[...brPos]],
      label:'The carbon–bromine bond pair goes to bromine.',simultaneousGroup:'sn2-concerted'}
  ];
  const guides=product?[]:[{id:'backside-axis',kind:'approach-axis',points:[[...sPos],[...cPos],[...brPos]],
    fromAtomId:'s-donor',throughAtomId:'c-electrophile',oppositeAtomId:'br-leaving',angleDegrees:180,
    label:'Backside approach: sulfur is opposite bromine across carbon.',renderAs:'dashed-guide-not-bond'}];
  const labels=[
    {id:'carbon-label',atomId:'c-electrophile',position:[.1,-1.65,0],text:'Receiving carbon'},
    {id:'sulfur-label',atomId:'s-donor',position:add(sPos,[-.1,-1.2,0]),text:product?'Neutral sulfur':'Sulfur donor: −1'},
    {id:'bromine-label',atomId:'br-leaving',position:add(brPos,[.35,1.0,0]),text:product?'Bromide: −1':'Bromine leaving group'}
  ];
  return {
    schema:'ace-dat-three-model/1',id:`sn2-${caseId}-${phase}`,version:1,caseId,phase,
    title:product?`${spec.product} + bromide`:`${spec.substrate} + methanethiolate`,
    instructionOnly:true,visibility:'post-commit-only',objectiveIds:['oc-electrons','oc-sn2-conditions','oc-sn2-path'],
    atoms,bonds,electronPairs,arrows,guides,labels,legend:LEGEND.map(x=>({...x})),
    netCharge:-1,reactingCarbonStereocenter:false,
    bondChanges:{broken:'bond-c-br',formed:'bond-c-s',simultaneous:true},
    caption:product?'A separate product structure: neutral thioether and Br⁻.':'Both curved arrows describe the same concerted substitution step.',
    assumptions:[
      'The specified SN2 pathway uses an unhindered alkyl bromide, methanethiolate and suitable polar aprotic conditions; counterion and solvent are omitted.',
      'Positions are original idealized teaching geometry. Distances are qualitative display units, not measured bond lengths; sulfur angles and lone-pair symbols are schematic.',
      'Reactant and product views are separate static structures. Do not animate between them as a molecular trajectory or show the approach guide as a covalent bond.',
      'Neither reacting carbon is a stereocenter: methyl has three identical H groups, and the ethyl case has two. No R/S configuration or chirality change is assigned.',
      'This is instruction after commitment, not scored mastery, a rate calculation, or a prediction of experimental yield.'
    ],
    sourceUrls:[...SOURCES],review:{status:'internal-geometry-checked',externalSpecialistReview:false,renderReview:'pending'}
  };
}
