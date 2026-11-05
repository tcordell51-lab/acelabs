// Append reviewed return opportunities and precise Canon provenance to copies.
// This module never reads authoring files or changes a learner's evidence.
const clone=value=>JSON.parse(JSON.stringify(value));
const text=value=>typeof value==='string'&&value.trim().length>0;
const id=value=>text(value)&&value.length<=240&&!['__proto__','prototype','constructor'].includes(value)&&/^[a-z][a-z0-9]*(?:[.-][a-z0-9]+)*$/.test(value);
// Historic instruction exposure identities may be namespace-scoped. Authored
// item/family identities retain the stricter, colon-free corpus contract.
const instructionId=value=>typeof value==='string'&&value.length<=240&&value.split(':').every(id);
const hash=value=>/^[a-f0-9]{64}$/.test(value||'');
const reviewed=value=>value?.reviewStatus==='internal-reviewed'&&value.verified===true&&value.progressEligible===true&&value.runtimeIntegrated===true;
const urls=value=>Array.isArray(value)&&value.length>0&&value.every(u=>{try{const v=new URL(u);return typeof u==='string'&&v.protocol==='https:'&&!!v.hostname&&!v.username&&!v.password;}catch{return false;}});
const assert=(condition,message)=>{if(!condition)throw new Error(message);};
const freeze=value=>{if(value&&typeof value==='object'&&!Object.isFrozen(value)){Object.freeze(value);Object.values(value).forEach(freeze);}return value;};
export const RETURN_GAP_OBJECTIVES=Object.freeze(['gc-catalyst','bio-enzyme-rate','bio-enzyme-inhibition']);
export const REFINEMENT_CANON_FIELDS=Object.freeze(['id','version','sourceSha256','sourceRelativePath','sourceRepository']);
const relativeSource=value=>typeof value==='string'&&/^[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_.-]+)+\.json$/.test(value)&&!value.split('/').some(p=>p==='.'||p==='..');
function returnRoute(base,objective){
  const owners=base.AceDATRealms.flatMap(world=>world.routes.filter(route=>route.objectiveIds.includes(objective.id)).map(route=>({world,route})));
  assert(owners.length===1,'Return objective must have exactly one route: '+objective.id);
  const owner=owners[0];
  assert(owner.world.worldId===objective.world&&owner.world.course===objective.course&&owner.route.session===objective.session&&Array.isArray(owner.route.laterIds),'Return objective route ownership mismatch: '+objective.id);
  return owner;
}

export function validateRefinementSupplements(base,{returnItems=[],canonLinks=[]},{projection=false,instructionFamilies=[]}={}){
  const content=base.AceDATContent,existing=new Set([...content.items,...content.objectives,...content.missions,...base.AceDATRealms.flatMap(w=>w.routes)].map(q=>q.id)),families=new Set(content.items.filter(q=>q.pool!=='later').map(q=>q.familyId));
  Object.values(content.teachingByObjective).forEach(g=>families.add(g.workedExample?.familyId));
  assert(Array.isArray(instructionFamilies)&&instructionFamilies.every(f=>instructionId(typeof f==='string'?f:f?.familyId)),'Invalid instruction family inventory');
  instructionFamilies.forEach(f=>families.add(typeof f==='string'?f:f.familyId));
  const flags=(value,label)=>assert(projection?reviewed(value):value?.reviewStatus==='draft'&&value.verified===false&&value.progressEligible===false&&value.runtimeIntegrated===false,'Unreviewed or invalid flags: '+label);
  assert(Array.isArray(returnItems)&&Array.isArray(canonLinks),'Refinement supplements must be arrays');
  const oldLaterFamilies=new Set(content.items.filter(q=>q.pool==='later').map(q=>q.familyId));
  const newFamilies=new Map();
  for(const q of returnItems){
    flags(q,q.id);const objective=content.objectives.find(o=>o.id===q.objectiveId);
    assert(id(q.id)&&!existing.has(q.id),'Duplicate or invalid return identity: '+q.id);existing.add(q.id);
    assert(RETURN_GAP_OBJECTIVES.includes(q.objectiveId)&&objective?.world===q.world&&q.pool==='later','Foreign return objective or pool: '+q.id);
    returnRoute(base,objective);
    assert(id(q.familyId)&&!families.has(q.familyId)&&!oldLaterFamilies.has(q.familyId),'Return family is already taught, assessed or reserved: '+q.id);
    assert(!newFamilies.has(q.familyId)||newFamilies.get(q.familyId)===q.objectiveId,'Return family crosses objectives: '+q.familyId);newFamilies.set(q.familyId,q.objectiveId);
    assert(text(q.familyRationale)&&text(q.prompt)&&Array.isArray(q.choices)&&[4,5].includes(q.choices.length)&&q.choices.every(text)&&new Set(q.choices).size===q.choices.length&&Number.isInteger(q.answer)&&q.answer>=0&&q.answer<q.choices.length&&Array.isArray(q.feedback)&&q.feedback.length===q.choices.length&&q.feedback.every(text)&&text(q.explanation)&&text(q.hint)&&urls(q.sourceUrls),'Incomplete return item: '+q.id);
    assert(q.fig===undefined&&q.figureAsset===undefined&&q.passage===undefined,'Return supplement requires a separately reviewed renderer for figures/passages: '+q.id);
    if(projection)assert(q.sourceId===q.id&&q.sourceVersion==='dat-refinement-item-v1','Invalid return provenance: '+q.id);
  }
  const linked=new Set(),pins=new Map(content.canonSources.map(s=>[s.id,s.version+':'+s.sourceSha256]));
  for(const link of canonLinks){
    flags(link,link.objectiveId);const guide=content.teachingByObjective[link.objectiveId],source=link.canon;
    assert(guide&&!guide.canon&&!guide.canonSupport&&!linked.has(link.objectiveId),'Canon mapping must address an unlinked guide exactly once: '+link.objectiveId);linked.add(link.objectiveId);
    assert(['guide','facet'].includes(link.scope)&&text(link.support)&&Array.isArray(link.exclusions)&&link.exclusions.every(text),'Missing bounded Canon scope: '+link.objectiveId);
    assert(source&&id(source.id)&&text(source.version)&&hash(source.sourceSha256),'Unpinned Canon mapping: '+link.objectiveId);
    assert(hash(link.targetGuideSha256)&&Array.isArray(link.canonicalPointers)&&link.canonicalPointers.length>0&&link.canonicalPointers.every(p=>typeof p==='string'&&p.startsWith('/')&&!/~(?![01])/.test(p)),'Unpinned Canon target or pointers: '+link.objectiveId);
    assert(source.sourceRelativePath===undefined||relativeSource(source.sourceRelativePath),'Invalid relative Canon source path: '+source.id);
    assert(source.sourceRepository===undefined||typeof source.sourceRepository==='string'&&/^[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)*$/.test(source.sourceRepository),'Invalid Canon repository identity: '+source.id);
    const pin=source.version+':'+source.sourceSha256;assert(!pins.has(source.id)||pins.get(source.id)===pin,'Conflicting Canon source identity: '+source.id);pins.set(source.id,pin);
    if(!projection)assert(text(link.sourceFile)&&link.sourceFile.endsWith('.json'),'Missing Canon source file: '+link.objectiveId);
    else assert(link.sourceFile===undefined&&Object.keys(source).every(k=>REFINEMENT_CANON_FIELDS.includes(k)),'Local or unknown Canon source metadata must not ship');
  }
  return true;
}

export function applyRefinementSupplements(base,supplements={}){
  validateRefinementSupplements(base,supplements,{projection:true});
  const result=clone(base),content=result.AceDATContent,{returnItems=[],canonLinks=[]}=supplements;
  content.refinementReturnIds=[];content.refinementCanonLinks=clone(canonLinks);content.refinementCanonSources=[];
  for(const input of returnItems){
    const objective=content.objectives.find(o=>o.id===input.objectiveId),guide=content.teachingByObjective[input.objectiveId];
    const {world,route}=returnRoute(result,objective);
    const q={...clone(input),course:world.course,session:route.session,stem:input.prompt,options:[...input.choices],why:[...input.feedback],tell:input.explanation,trap:guide.commonMistake,src:input.sourceUrls.join(' | '),srcId:input.objectiveId,assessmentOnly:false,reservedLater:true};
    content.items.push(q);route.laterIds.push(q.id);content.refinementReturnIds.push(q.id);
  }
  for(const link of canonLinks){
    const guide=content.teachingByObjective[link.objectiveId],source=clone(link.canon);
    if(link.scope==='guide')guide.canon={...source,adaptationVersion:1};
    else guide.canonSupport=source;
    guide.canonAlignment={scope:link.scope,support:link.support,exclusions:[...link.exclusions]};
    let entry=content.refinementCanonSources.find(s=>s.id===source.id);
    if(!entry){entry={...source,objectiveIds:[],reviewStatus:'internal-reviewed',importsSourceRuntime:false,importsSourceAssessments:false,externalSMEReview:false};content.refinementCanonSources.push(entry);}
    entry.objectiveIds.push(link.objectiveId);
  }
  for(const source of content.refinementCanonSources)if(!content.canonSources.some(s=>s.id===source.id))content.canonSources.push(source);
  content.scope={...content.scope,totalItems:content.items.length,laterItems:content.items.filter(q=>q.pool==='later').length};
  // Keep all prior identities and course content; only held later rows append.
  for(const key of ['items','objectives','missions','creatures','teachingByObjective','curriculumCoverage','screenshotTopics','officialOnlyTopics'])result[key]=content[key];
  result.MNEMON_ITEMS=content.items.filter(q=>q.pool==='practice'||q.pool==='check');
  result.itemsForMode=(course,session,mode='practice')=>['practice','check'].includes(mode)?result.MNEMON_ITEMS.filter(q=>q.course===course&&q.session===session&&q.pool===mode):[];
  return freeze(result);
}
