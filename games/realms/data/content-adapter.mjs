import { ITEMS, OBJECTIVES, MISSIONS, teachingByObjective as originalTeaching } from './reviewed/content.mjs';
import { screenshotTopics as originalScreenshotTopics, officialOnlyTopics as originalOfficialTopics, screenshotStatus } from './reviewed/coverage.mjs';
import { canonSources, integrateCanon } from './canon-lessons.mjs';
import { figureAssets } from './figure-assets.mjs';
import { expansionChapters } from './expansion-release.mjs';
import { recoveryItems } from './recovery-release.mjs';
import { buildExpansionCoverage } from './expansion/coverage-map.mjs';

export const COURSE_BY_WORLD = Object.freeze({bio:'BIO',gc:'GCHEM',oc:'OCHEM',pat:'PAT',rc:'RC',qr:'QR'});
const definition = [
  {course:'BIO',worldId:'bio',title:'The Living Wilds',name:'Biology',color:'#7fbd75',type:'vital',affinity:'boundary',routes:[
    {session:1,id:'bio-cell-harbor',title:'Cell Harbor',creature:'portia',objectiveIds:['bio-diffusion','bio-transport','bio-osmosis','bio-tonicity','bio-animal','bio-plant']},
    {session:2,id:'bio-organelle-quarter',title:'Organelle Quarter',creature:'parcelot',objectiveIds:['bio-cell-types','bio-nucleus','bio-cargo','bio-recycling','bio-energy-organelles','bio-cytoskeleton']}]},
  {course:'GCHEM',worldId:'gc',title:'The Ember Forges',name:'General Chemistry',color:'#e5a364',type:'forge',affinity:'energy',routes:[
    {session:1,id:'gc-impossible-engine',title:'The Impossible Engine',creature:'chatelle',objectiveIds:['gc-barrier','gc-catalyst','gc-equilibrium']}]},
  {course:'OCHEM',worldId:'oc',title:"The Alchemist's Tower",name:'Organic Chemistry',color:'#b99bdd',type:'alchemy',affinity:'machine',routes:[
    {session:1,id:'oc-electron-route',title:'The Stolen Electron Route',creature:'stereon',objectiveIds:['oc-electrons','oc-sn2-conditions','oc-sn2-path']}]},
  {course:'PAT',worldId:'pat',title:'The Shifting Labyrinth',name:'Perceptual Ability',color:'#9cb5e4',type:'sight',affinity:'framework',routes:[
    {session:1,id:'pat-folded-vault',title:'The Folded Vault',creature:'cubit',objectiveIds:['pat.one-fold','pat.two-folds']}]},
  {course:'RC',worldId:'rc',title:'The Sunken Library',name:'Reading Comprehension',color:'#7fc5c4',type:'evidence',affinity:'message',routes:[
    {session:1,id:'rc-field-report',title:'The Forged Field Report',creature:'skimmer',objectiveIds:['rc.purpose','rc.evidence','rc.inference','rc.tone']}]},
  {course:'QR',worldId:'qr',title:'Clockwork City',name:'Quantitative Reasoning',color:'#dfc478',type:'reason',affinity:'force',routes:[
    {session:1,id:'qr-waterworks',title:'Restart the Waterworks',creature:'ratior',objectiveIds:['qr.rates','qr.algebra','qr.compare','qr.sufficiency']}]}
];
const additions={
  bio:{session:3,creature:'enzymber',stationName:'Enzyme Curve Workshop'},
  gc:{session:2,creature:'molmite',stationName:'Reaction Inventory Bench'},
  oc:{session:2,creature:'protonyx',stationName:'Conjugate-Base Studio'},
  pat:{session:2,creature:'apertuft',stationName:'Angle Observatory'},
  rc:{session:2,creature:'foliora',stationName:'Evidence Mapping Desk'},
  qr:{session:2,creature:'percentip',stationName:'Percent Walkthrough Table'}
};
for(const chapter of expansionChapters){
  if(chapter.reviewStatus!=='internal-reviewed'||chapter.progressEligible!==true||chapter.runtimeIntegrated!==true)throw new Error('Unreviewed expansion cannot enter the game: '+chapter.id);
  definition.find(w=>w.worldId===chapter.world).routes.push({...additions[chapter.world],id:chapter.id,title:chapter.title,
    chapterTheme:chapter.world,pathVariant:chapter.world==='bio'?2:1,objectiveIds:chapter.objectiveIds,reviewStatus:'internal-reviewed',scopeNote:chapter.scope});
}
const routeFor = new Map(definition.flatMap(w => w.routes.flatMap(r => r.objectiveIds.map(id => [id,{...r,course:w.course,worldId:w.worldId}]))));
export const teachingByObjective = {...integrateCanon(originalTeaching),...Object.assign({},...expansionChapters.map(c=>c.teachingByObjective))};
export const objectives = [...OBJECTIVES,...expansionChapters.flatMap(c=>c.objectives)].map(o => ({...o,course:COURSE_BY_WORLD[o.world],session:routeFor.get(o.id).session,reviewStatus:'internal-reviewed',originalReviewStatus:o.reviewStatus}));
const originalItems = ITEMS.map(i => {
  if(i.reviewStatus !== 'internal-review') throw new Error(`Unreviewed item cannot enter adapter: ${i.id}`);
  const route = routeFor.get(i.objectiveId);
  if(!route || route.worldId !== i.world) throw new Error(`Missing DAT route for ${i.id}`);
  return {
    ...i, ...figureAssets[i.id], course:route.course,session:route.session,
    stem:i.prompt,options:[...i.choices],why:[...i.feedback],tell:i.explanation,
    trap:teachingByObjective[i.objectiveId].commonMistake,src:i.sourceUrls.join(' | '),srcId:i.objectiveId,
    verified:true,reviewStatus:'internal-reviewed',originalReviewStatus:i.reviewStatus,
    sourceId:i.id,sourceVersion:'dat-item-v1',
    reviewScope:'Existing authored DAT item; internal review only. No external SME certification.',
    assessmentOnly:i.pool==='check',reservedLater:i.pool==='later'
  };
});
for(const item of recoveryItems)if(item.reviewStatus!=='internal-reviewed'||item.verified!==true||item.progressEligible!==true||item.runtimeIntegrated!==true||item.pool!=='check')throw new Error('Unreviewed recovery cannot enter the game: '+item.id);
const newItems=[...expansionChapters.flatMap(c=>c.items),...recoveryItems].map(i=>{
  const route=routeFor.get(i.objectiveId);
  return {...i,course:route.course,session:route.session,stem:i.prompt,options:[...i.choices],why:[...i.feedback],tell:i.explanation,
    trap:teachingByObjective[i.objectiveId].commonMistake,src:i.sourceUrls.join(' | '),srcId:i.objectiveId,
    assessmentOnly:i.pool==='check',reservedLater:i.pool==='later'};
});
export const items=[...originalItems,...newItems];
const expansionMissions=expansionChapters.flatMap(c=>['practice','check'].map(pool=>({
  id:c.id+'-'+pool,world:c.world,title:c.title+(pool==='check'?' checkpoint':' practice'),
  kind:pool==='check'?'checkpoint':'lesson',objectiveIds:c.objectiveIds,itemIds:c.items.filter(i=>i.pool===pool).map(i=>i.id),requires:[]
})));
export const missions = [...MISSIONS,...expansionMissions].map(m => {
  const route=routeFor.get(m.objectiveIds[0]);
  return {...m,course:route.course,session:route.session,chapterId:route.id,
    assessment:m.kind==='checkpoint'?'check':'practice',reviewStatus:'internal-reviewed'};
});

export const AceDATRealms = definition.map(w => ({...w,routes:w.routes.map(r => {
  const matching=items.filter(i => i.course===w.course && i.session===r.session);
  const pool=p=>matching.filter(i=>i.pool===p).map(i=>i.id);
  const practiceIds=pool('practice'),checkIds=pool('check'),laterIds=pool('later');
  return {...r,availability:'available',available:true,coverage:'partial',practiceIds,checkIds,laterIds,
    missionIds:missions.filter(m=>m.course===w.course&&m.session===r.session).map(m=>m.id),
    checkSpec:{assessment:'check',pool:checkIds},
    scopeNote:r.scopeNote||'This authored opening chapter covers the listed objectives. It does not complete the full subject.'};
})}));
export const curriculumCoverage=buildExpansionCoverage({registry:{items,objectives,teachingByObjective},activeRoutes:AceDATRealms.flatMap(w=>w.routes)});
export const screenshotTopics=curriculumCoverage.screenshotTopics.map(t=>({...t,course:COURSE_BY_WORLD[t.world]}));
export const officialOnlyTopics=curriculumCoverage.officialOnlyTopics.map(t=>({...t,course:COURSE_BY_WORLD[t.world]}));

// Cosmetic species and growth are fiction, separate from learning evidence.
// The three requested DAT starter identities are preserved; rescue companions
// continue the original DAT chapter cast. Body plans guide original pixel art.
export const creatures = [
  {id:'cytrus',name:'Cytrus',starter:true,course:'BIO',type:'vital',bodyPlan:'round sprout quadruped with a leaf crown and small root feet',color:'#9bd781',concept:'Cell boundaries and living systems'},
  {id:'atpup',name:'ATpup',starter:true,course:'GCHEM',type:'forge',bodyPlan:'compact puppy with three rounded tail beads and amber ear tips',color:'#edb45f',concept:'Energy and chemical change'},
  {id:'twistle',name:'Twistle',starter:true,course:'PAT',type:'sight',bodyPlan:'folded ribbon bird with two angular wings and a curled paper tail',color:'#aabde7',concept:'Spatial reasoning and transformations'},
  {id:'portia',name:'Portia',course:'BIO',session:1,type:'vital',bodyPlan:'round amphibious gatekeeper with paired membrane fins and four small feet',color:'#94ce9a',concept:'Membrane movement',evolutions:['Portia','Portivale','Portigrove'],rareName:'Tide Portia',blurb:'A patient harbor keeper who checks which substances can cross.'},
  {id:'parcelot',name:'Parcelot',course:'BIO',session:2,type:'vital',bodyPlan:'small spotted courier cat with a rounded vesicle satchel and short tail',color:'#dbb182',concept:'Protein routing',evolutions:['Parcelot','Parcelynx','Parceluma'],rareName:'Moon Parcelot',blurb:'A careful courier who follows each package to its proper destination.'},
  {id:'chatelle',name:'Chatelle',course:'GCHEM',session:1,type:'forge',bodyPlan:'two-headed gecko with an hourglass torso and broad balancing tail',color:'#e9a872',concept:'Rate and equilibrium',evolutions:['Chatelle','Chatelier','Chatelume'],rareName:'Ember Chatelle',blurb:'A forge companion who distinguishes moving faster from ending elsewhere.'},
  {id:'stereon',name:'Stereon',course:'OCHEM',session:1,type:'alchemy',bodyPlan:'asymmetric four-limbed salamander with distinct leaf, bead and spiral limb tips',color:'#b89dd7',concept:'Structure and electron movement',evolutions:['Stereon','Stereva','Sterealis'],rareName:'Dusk Stereon',blurb:'A curious tower climber who notices the direction of every transformation.'},
  {id:'cubit',name:'Cubit',course:'PAT',session:1,type:'sight',bodyPlan:'small block-bodied beetle with hinged square wings and six pixel feet',color:'#a7bce3',concept:'Spatial prediction',evolutions:['Cubit','Cubifold','Cubivault'],rareName:'Glass Cubit',blurb:'A geometric guardian who imagines a fold before it opens.'},
  {id:'skimmer',name:'Skimmer',course:'RC',session:1,type:'evidence',bodyPlan:'long-tailed river bird with page-shaped wings and a narrow teal crest',color:'#7dc8ca',concept:'Passage evidence',evolutions:['Skimmer','Skimlark','Skimora'],rareName:'Pearl Skimmer',blurb:'A page collector who always returns to the evidence.'},
  {id:'ratior',name:'Ratior',course:'QR',session:1,type:'reason',bodyPlan:'round-eared clockwork mouse with a segmented counterweight tail',color:'#dcc274',concept:'Quantities and rates',evolutions:['Ratior','Ratiroo','Ratiograph'],rareName:'Brass Ratior',blurb:'A cheerful courier who checks the units before setting off.'}
];
const nextCreatures=[
  {id:'enzymber',name:'Enzymber',world:'bio',course:'BIO',session:3,type:'vital',bodyPlan:'rounded moss salamander with a curved catalyst crest and four short feet',color:'#81bf8d',concept:'Enzyme rate and specified inhibition models',evolutions:['Enzymber','Enzymoss','Enzymora'],rareName:'Fern Enzymber',blurb:'A workshop friend who compares a curve with its own plateau.'},
  {id:'molmite',name:'Molmite',world:'gc',course:'GCHEM',session:2,type:'forge',bodyPlan:'broad stone beetle with paired mineral counters and six short legs',color:'#e4ac73',concept:'Moles and reaction inventory',evolutions:['Molmite','Molmantle','Molmason'],rareName:'Copper Molmite',blurb:'A careful foundry keeper who counts what a reaction can actually use.'},
  {id:'protonyx',name:'Protonyx',world:'oc',course:'OCHEM',session:2,type:'alchemy',bodyPlan:'crescent-eared purple lynx with an asymmetric curved tail',color:'#b69ad6',concept:'Conjugate bases and comparative acidity',evolutions:['Protonyx','Protonara','Protonova'],rareName:'Violet Protonyx',blurb:'A curious studio companion who follows the proton and checks the remaining charge.'},
  {id:'apertuft',name:'Apertuft',world:'pat',course:'PAT',session:2,type:'sight',bodyPlan:'angular two-winged owl with an open chevron crest and small feet',color:'#a6bee4',concept:'Angle openings and spatial comparison',evolutions:['Apertuft','Apertalon','Aperastra'],rareName:'Silver Apertuft',blurb:'An observatory friend who notices openings even when the whole view turns.'},
  {id:'foliora',name:'Foliora',world:'rc',course:'RC',session:2,type:'evidence',bodyPlan:'long-tailed teal fox with folded page ears and a small bookmark crest',color:'#83c5bf',concept:'Passage structure and bounded inference',evolutions:['Foliora','Foliara','Folioracle'],rareName:'Pearl Foliora',blurb:'An archive companion who finds the sentence behind a claim.'},
  {id:'percentip',name:'Percentip',world:'qr',course:'QR',session:2,type:'reason',bodyPlan:'low golden segmented caterpillar with round antennae and three paired feet',color:'#d7bd6d',concept:'Percent baselines and changing quantities',evolutions:['Percentip','Percenroll','Percenova'],rareName:'Brass Percentip',blurb:'An exchange companion who marks the base before every change.'}
];
creatures.push(...nextCreatures.filter(c=>expansionChapters.some(ch=>ch.world===c.world)));
const creatureById=Object.fromEntries(creatures.map(c=>[c.id,c]));
export const AtlasCoursePacks = Object.fromEntries(AceDATRealms.map(w=>[w.course,{
  course:w.course,name:w.name,world:w.title,reviewStatus:'internal-reviewed',
  sessions:w.routes.map(r=>({n:r.session,title:r.title,objectiveIds:r.objectiveIds,availability:'available',coverage:'partial',creature:r.creature})),
  types:{[w.type]:{name:w.type[0].toUpperCase()+w.type.slice(1),color:w.color,affinity:w.affinity,affinityWhy:'Fictional game affinity; not a scientific causal rule.'}},
  lines:w.routes.map(r=>{const c=creatureById[r.creature];return [r.session,w.type,c.evolutions,c.rareName,c.blurb];}),
  dex:Object.fromEntries(w.routes.map(r=>[r.session,{
    core:r.objectiveIds.map(id=>teachingByObjective[id].core).join('\n\n'),
    facts:r.objectiveIds.map(id=>({t:teachingByObjective[id].nextAction,src:teachingByObjective[id].canon?.id||id})),
    traps:r.objectiveIds.map(id=>({t:teachingByObjective[id].commonMistake,src:teachingByObjective[id].canon?.id||id}))
  }])),
  gym:{n:w.routes.reduce((n,r)=>n+r.checkIds.length,0),mins:0},gymName:w.name+' chapter check',
  examLabel:'Authored chapter check',examWhen:'No exam-date or readiness prediction',
  scopeNote:'Introductory authored chapters. Game rewards do not certify subject mastery or DAT readiness.'
}]));

// The engine must select check items only through explicit assessment:'check'.
// This helper rejects unknown modes, supplied objects and later-pool requests.
export const MNEMON_ITEMS = items.filter(i=>i.pool==='practice'||i.pool==='check');
export function itemsForMode(course,session,mode='practice') {
  if(mode!=='practice'&&mode!=='check') return [];
  return MNEMON_ITEMS.filter(i=>i.course===course&&i.session===session&&i.pool===mode);
}
// This list is frozen to the unchanged first-release fresh checks. It supports
// source validation of legacy responses without modifying their saved metadata.
export const legacyEvidenceItemIds = Object.freeze(ITEMS.filter(i=>i.pool==='check').map(i=>i.id));
export const AceDATContent = {
  items,objectives,missions,teachingByObjective,screenshotTopics,officialOnlyTopics,
  screenshotStatus,canonSources:[...canonSources,...expansionChapters.filter(c=>!canonSources.some(s=>s.id===c.canon.id)).map(c=>({...c.canon,objectiveIds:c.objectiveIds,sourceRepository:'ace-system',reviewScope:c.scope,reviewStatus:'internal-reviewed',importsSourceRuntime:false,importsSourceAssessments:false,externalSMEReview:false}))],creatures,legacyEvidenceItemIds,curriculumCoverage,reviewStatus:'internal-reviewed',
  scope:{totalItems:items.length,practiceItems:items.filter(i=>i.pool==='practice').length,checkItems:items.filter(i=>i.pool==='check').length,laterItems:items.filter(i=>i.pool==='later').length,objectives:objectives.length,
    screenshotHeadings:screenshotTopics.length,partialScreenshotHeadings:screenshotTopics.filter(t=>t.status==='partial').length,plannedScreenshotHeadings:screenshotTopics.filter(t=>t.status==='planned').length,
    allSubjectsComplete:false,externalSMECertification:false},
  poolPolicy:{practice:'Practice items only.',check:'Explicit check mode only; no practice fallback.',later:'Quarantined from ordinary encounters; eligibility requires separate delayed-review evidence checks.'}
};

if(typeof window!=='undefined') Object.assign(window,{
  AceDATContent,MNEMON_ITEMS,AtlasCoursePacks,AceDATRealms,AceDATCreatures:creatures
});
