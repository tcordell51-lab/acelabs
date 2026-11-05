// Runtime composition only. Authoring modules and review tools never enter this graph.
export const COURSE_BY_WORLD = Object.freeze({bio:'BIO',gc:'GCHEM',oc:'OCHEM',pat:'PAT',rc:'RC',qr:'QR'});
const TYPES = Object.freeze({bio:'vital',gc:'forge',oc:'alchemy',pat:'sight',rc:'evidence',qr:'reason'});
const text = value => typeof value === 'string' && value.trim().length > 0;
const sourceURLs = values => Array.isArray(values)&&values.length>0&&values.every(value=>{try{const url=new URL(value);return typeof value==='string'&&url.protocol==='https:'&&!!url.hostname&&!url.username&&!url.password;}catch{return false;}});
const id = value => typeof value === 'string' && value.length<=240 && !['__proto__','constructor','prototype'].includes(value) && /^[a-z][a-z0-9]*(?:[.-][a-z0-9]+)*$/.test(value);
// Must match engine/creature-lines.js idOf exactly (including spaces in rares).
const speciesId = name => String(name).toLowerCase();
const clone = value => JSON.parse(JSON.stringify(value));
const fail = message => { throw new Error(message); };
const reviewed = value => value?.reviewStatus === 'internal-reviewed' && value.verified === true && value.progressEligible === true && value.runtimeIntegrated === true;
function freeze(value) { if (value && typeof value === 'object' && !Object.isFrozen(value)) { Object.freeze(value); Object.values(value).forEach(freeze); } return value; }
function unique(values,label) { const seen = new Set(); for (const value of values) { if (!id(value) || seen.has(value)) fail('Invalid or duplicate '+label+': '+value); seen.add(value); } return seen; }
const same = (a,b) => JSON.stringify(a) === JSON.stringify(b);
export function chapterCanonReferences(chapter){
  const refs=[];
  const collect=(holder,objectiveIds)=>{if(holder.canon!==undefined)refs.push({source:holder.canon,objectiveIds});if(holder.canonSources!==undefined){if(!Array.isArray(holder.canonSources))fail('Invalid Canon source array: '+chapter.id);for(const source of holder.canonSources)refs.push({source,objectiveIds});}};
  collect(chapter,[]);for(const [objectiveId,guide] of Object.entries(chapter.teachingByObjective||{}))collect(guide,[objectiveId]);
  return refs;
}

/** Validate both source drafts and compiled projections without admitting either. */
export function validateChapterStructure(chapters,base,{projection=false}={}) {
  if (!Array.isArray(chapters)) fail('Chapter registry must be an array');
  const routes = base.AceDATRealms.flatMap(w=>w.routes);
  const allIds = unique([...base.AceDATContent.items.map(i=>i.id),...base.AceDATContent.objectives.map(o=>o.id),...routes.map(r=>r.id),...base.AceDATContent.missions.map(m=>m.id)],'baseline identity');
  const sessions = new Set(base.AceDATRealms.flatMap(w=>w.routes.map(r=>w.course+':'+r.session)));
  const creatureIds = new Set(base.AceDATContent.creatures.map(c=>c.id));
  const canonPins=new Map(base.AceDATContent.canonSources.map(source=>[source.id,source.version+':'+source.sourceSha256]));
  const names = new Set(base.AceDATContent.creatures.flatMap(c=>[c.name,...(c.evolutions||[]),c.rareName].filter(Boolean).map(speciesId)));
  const ordinary = new Set([...base.AceDATContent.items,...chapters.flatMap(c=>c.items||[])].filter(i=>i.pool!=='later').map(i=>i.familyId));
  const taught = new Set([...Object.values(base.AceDATContent.teachingByObjective),...chapters.flatMap(c=>Object.values(c.teachingByObjective||{}))].map(g=>g.workedExample?.familyId).filter(Boolean));
  for (const c of chapters) for (const family of c.metadata?.instructionFamilyIds||[]) taught.add(family);
  const reservedBaselineFamilies=new Set(base.AceDATContent.items.filter(q=>q.pool==='later').map(q=>q.familyId));
  // Do not rewrite legacy relationships; prevent newly admitted instruction from
  // spending a family that the unchanged baseline still reserves for later.
  for(const c of chapters)for(const family of [...(c.items||[]).filter(q=>q.pool!=='later').map(q=>q.familyId),...Object.values(c.teachingByObjective||{}).map(g=>g.workedExample?.familyId),...(c.metadata?.instructionFamilyIds||[])])if(reservedBaselineFamilies.has(family))fail('New instruction or ordinary item reuses reserved baseline later family: '+family);
  function take(value,kind) { if (!id(value)||allIds.has(value)) fail('Invalid or duplicate '+kind+': '+value); allIds.add(value); }
  function flags(value,label) {
    if (projection ? !reviewed(value) : value?.reviewStatus!=='draft'||value.verified!==false||value.progressEligible!==false||value.runtimeIntegrated!==false) fail((projection?'Unreviewed projection: ':'Authoring must remain quarantined: ')+label);
  }
  for (const c of chapters) {
    take(c.id,'chapter'); flags(c,c.id);
    for(const {source} of chapterCanonReferences(c)){
      if(!source||!id(source.id)||!text(source.version)||!/^[a-f0-9]{64}$/.test(source.sourceSha256||''))fail('Unpinned Canon source: '+c.id);
      const pin=source.version+':'+source.sourceSha256;if(canonPins.has(source.id)&&canonPins.get(source.id)!==pin)fail('Conflicting Canon source identity: '+source.id);canonPins.set(source.id,pin);
    }
    if (!COURSE_BY_WORLD[c.world]||!text(c.title)||!(text(c.scope)||text(c.scope?.coverageClaim))) fail('Invalid chapter scope: '+c.id);
    const m=c.metadata, companion=m?.creatureDescriptor, course=COURSE_BY_WORLD[c.world];
    if (!m || m.course!==course || !Number.isSafeInteger(m.session)||m.session<1||m.session>99||!text(m.stationName)||![0,1,2].includes(m.pathVariant)||m.chapterTheme!==c.world) fail('Invalid route ownership: '+c.id);
    const session=course+':'+m.session;
    if(sessions.has(session)) fail('Duplicate course session: '+session); sessions.add(session);
    if(!companion||!id(m.creature)||companion.id!==m.creature||creatureIds.has(m.creature)||companion.type!==TYPES[c.world]||!/^#[a-f0-9]{6}$/i.test(companion.color)||!['name','bodyPlan','concept','rareName','blurb'].every(k=>text(companion[k]))||!Array.isArray(companion.evolutions)||companion.evolutions.length!==3||!companion.evolutions.every(text)||speciesId(companion.evolutions[0])!==m.creature||speciesId(companion.name)!==m.creature) fail('Invalid companion ownership: '+c.id);
    for(const [key,value] of Object.entries({course,world:c.world,session:m.session})) if(companion[key]!==undefined&&companion[key]!==value) fail('Mismatched companion '+key+': '+c.id);
    const newNames=[...companion.evolutions,companion.rareName].map(speciesId);
    if(new Set(newNames).size!==4||newNames.some(n=>!n||names.has(n))) fail('Companion species collision: '+c.id);
    newNames.forEach(n=>names.add(n)); creatureIds.add(m.creature);
    if(!Array.isArray(m.instructionFamilyIds)||m.instructionFamilyIds.some(f=>!id(f))||new Set(m.instructionFamilyIds).size!==m.instructionFamilyIds.length) fail('Missing instruction family inventory: '+c.id);
    for(const key of ['screenshotTopicIds','officialOnlyTopicIds']) {
      const targets=m.topicMappings?.[key], known=key==='screenshotTopicIds'?base.AceDATContent.screenshotTopics:base.AceDATContent.officialOnlyTopics;
      if(!Array.isArray(targets)||new Set(targets).size!==targets.length||targets.some(t=>!known.some(row=>row.id===t&&row.world===c.world))) fail('Unknown or foreign topic mapping: '+c.id+'/'+key);
    }
    if(!Array.isArray(c.objectiveIds)||!c.objectiveIds.length||!Array.isArray(c.objectives)||!same(c.objectiveIds,c.objectives.map(o=>o.id))||!same([...Object.keys(c.teachingByObjective||{})].sort(),[...c.objectiveIds].sort())) fail('Objective/guide ownership mismatch: '+c.id);
    if(!Array.isArray(c.items)) fail('Missing chapter items: '+c.id);
    for(const o of c.objectives) {
      take(o.id,'objective');flags(o,o.id);
      if(o.id.length>228)fail('Objective identity too long for instruction exposure: '+o.id);
      const g=c.teachingByObjective[o.id]; flags(g,'guide '+o.id);
      if(o.world!==c.world||!text(o.name)||!text(o.lesson)||!sourceURLs(o.sourceUrls)||g.objectiveId!==o.id||!text(g.core)||!Array.isArray(g.terms)||!g.terms.length||!g.terms.every(term=>term&&!Array.isArray(term)&&text(term.term)&&text(term.meaning))||!Array.isArray(g.assumptions)||!g.assumptions.length||!g.assumptions.every(text)||!Array.isArray(g.workedExample?.steps)||!g.workedExample.steps.length||!g.workedExample.steps.every(text)||!text(g.workedExample.prompt)||!text(g.workedExample.answer)||!id(g.workedExample.familyId)||!text(g.commonMistake)||!text(g.nextAction)||!sourceURLs(g.sourceUrls)) fail('Incomplete objective teaching: '+o.id);
      for(const [pool,min] of [['practice',2],['check',3],['later',1]]) if(c.items.filter(i=>i.objectiveId===o.id&&i.pool===pool).length<min) fail('Insufficient '+pool+' items: '+o.id);
    }
    for(const q of c.items) {
      take(q.id,'item');flags(q,q.id);
      if(!c.objectiveIds.includes(q.objectiveId)||q.world!==c.world||!['practice','check','later'].includes(q.pool)||!id(q.familyId)||!text(q.familyRationale)||!text(q.prompt)||![4,5].includes(q.choices?.length)||!q.choices.every(text)||!Number.isInteger(q.answer)||q.answer<0||q.answer>=q.choices.length||q.feedback?.length!==q.choices.length||!q.feedback.every(text)||!text(q.explanation)||!sourceURLs(q.sourceUrls)) fail('Invalid item: '+q.id);
      if(q.pool==='later'&&(ordinary.has(q.familyId)||taught.has(q.familyId))) fail('Later family already taught/tested: '+q.id);
      if(projection&&(q.sourceId!==q.id||q.sourceVersion!=='dat-continuation-item-v1'||q.figureAsset!==undefined)) fail('Invalid projected provenance: '+q.id);
      if(projection&&q.fig&&!/^data\/figures\/chapters\/[a-z0-9]+(?:[.-][a-z0-9]+)*\.[a-f0-9]{16}\.svg$/.test(q.fig)) fail('Invalid projected figure path: '+q.id);
      if((q.fig||q.figureAsset)&&!text(q.visualCap)) fail('Missing figure accessibility text: '+q.id);
      if(q.passage&&(!text(q.passage.title)||!Array.isArray(q.passage.paragraphs)||!q.passage.paragraphs.length||!q.passage.paragraphs.every(text))) fail('Invalid passage: '+q.id);
    }
    for(const pool of ['practice','check'])take(c.id+'-'+pool,'mission');
  }
  return true;
}

/** Appends reviewed chapters to copies; the original 299-item adapter is never mutated. */
export function buildChapterRegistry(base,chapters=[]) {
  validateChapterStructure(chapters,base,{projection:true});
  const content=clone(base.AceDATContent), realms=clone(base.AceDATRealms), packs=clone(base.AtlasCoursePacks);
  const continuation=clone(chapters);
  for(const [index,c] of continuation.entries()) {
    const m=c.metadata,w=realms.find(w=>w.worldId===c.world),pack=packs[m.course];
    const companion={...m.creatureDescriptor,world:c.world,course:m.course,session:m.session};
    content.creatures.push(companion);
    content.objectives.push(...c.objectives.map(o=>({...o,course:m.course,session:m.session,originalReviewStatus:o.reviewStatus})));
    Object.assign(content.teachingByObjective,c.teachingByObjective);
    const chapterItems=c.items.map(q=>({...q,course:m.course,session:m.session,stem:q.prompt,options:[...q.choices],why:[...q.feedback],tell:q.explanation,trap:c.teachingByObjective[q.objectiveId].commonMistake,src:q.sourceUrls.join(' | '),srcId:q.objectiveId,assessmentOnly:q.pool==='check',reservedLater:q.pool==='later'}));
    content.items.push(...chapterItems);
    const pool=p=>chapterItems.filter(i=>i.pool===p).map(i=>i.id);
    const missions=['practice','check'].map(p=>({id:c.id+'-'+p,world:c.world,title:c.title+(p==='check'?' checkpoint':' practice'),kind:p==='check'?'checkpoint':'lesson',objectiveIds:c.objectiveIds,itemIds:pool(p),requires:[],course:m.course,session:m.session,chapterId:c.id,assessment:p,reviewStatus:'internal-reviewed'}));
    content.missions.push(...missions);
    const route={id:c.id,title:c.title,session:m.session,creature:m.creature,stationName:m.stationName,pathVariant:m.pathVariant,chapterTheme:m.chapterTheme,registrationOrder:index,objectiveIds:c.objectiveIds,reviewStatus:'internal-reviewed',availability:'available',available:true,coverage:'partial',practiceIds:pool('practice'),checkIds:pool('check'),laterIds:pool('later'),missionIds:missions.map(x=>x.id),checkSpec:{assessment:'check',pool:pool('check')},scopeNote:typeof c.scope==='string'?c.scope:c.scope.coverageClaim};
    w.routes.push(route);
    pack.sessions.push({n:m.session,title:c.title,objectiveIds:c.objectiveIds,availability:'available',coverage:'partial',creature:m.creature});
    pack.lines.push([m.session,w.type,companion.evolutions,companion.rareName,companion.blurb]);
    pack.dex[m.session]={core:c.objectiveIds.map(id=>c.teachingByObjective[id].core).join('\n\n'),facts:c.objectiveIds.map(id=>({t:c.teachingByObjective[id].nextAction,src:c.teachingByObjective[id].canon?.id||id})),traps:c.objectiveIds.map(id=>({t:c.teachingByObjective[id].commonMistake,src:c.teachingByObjective[id].canon?.id||id}))};
    pack.gym.n+=route.checkIds.length;
  }
  // Coverage is bounded to the reviewed objectives. A topic or world is never complete.
  const coverage=content.curriculumCoverage;
  coverage.continuationFacets=continuation.map(c=>({chapterId:c.id,world:c.world,scope:c.scope,objectiveIds:c.objectiveIds,evidenceItemIds:c.items.map(q=>q.id),topicMappings:c.metadata.topicMappings,status:'partial'}));
  for(const [field,mapping] of [['screenshotTopics','screenshotTopicIds'],['officialOnlyTopics','officialOnlyTopicIds']]) {
    for(const row of coverage[field]) {
      const attached=continuation.filter(c=>c.metadata.topicMappings[mapping].includes(row.id));
      if(!attached.length)continue;
      row.status='partial';row.instruction=true;row.practice=true;row.review=true;row.checkpoint=true;
      row.objectiveIds=[...new Set([...row.objectiveIds,...attached.flatMap(c=>c.objectiveIds)])];
      row.evidenceItemIds=[...new Set([...row.evidenceItemIds,...attached.flatMap(c=>c.items.map(q=>q.id))])];
      row.activeContinuationChapters=attached.map(c=>c.id);
      row.note='Reviewed continuation covers only the named chapter objectives; broader topic obligations remain open.';
    }
    content[field]=coverage[field].map(t=>({...t,course:COURSE_BY_WORLD[t.world]}));
  }
  coverage.counts={...coverage.counts,screenshots:{total:coverage.screenshotTopics.length,partial:coverage.screenshotTopics.filter(t=>t.status==='partial').length,planned:coverage.screenshotTopics.filter(t=>t.status==='planned').length,complete:0},officialOnly:{total:coverage.officialOnlyTopics.length,partial:coverage.officialOnlyTopics.filter(t=>t.status==='partial').length,planned:coverage.officialOnlyTopics.filter(t=>t.status==='planned').length,complete:0},activeContinuationObjectives:continuation.reduce((n,c)=>n+c.objectiveIds.length,0),activeContinuationChapters:continuation.length};
  // Exact Canon source identities are retained only when supplied and pinned by review.
  content.continuationCanonSources=[];
  for(const c of continuation)for(const {source,objectiveIds} of chapterCanonReferences(c)){
    let entry=content.continuationCanonSources.find(s=>s.id===source.id);
    if(!entry){entry={...source,objectiveIds:[],chapterIds:[],reviewScope:typeof c.scope==='string'?c.scope:c.scope.coverageClaim,reviewStatus:'internal-reviewed',importsSourceRuntime:false,importsSourceAssessments:false,externalSMEReview:false};content.continuationCanonSources.push(entry);}
    entry.objectiveIds=[...new Set([...(entry.objectiveIds||[]),...objectiveIds])];entry.chapterIds=[...new Set([...(entry.chapterIds||[]),c.id])];
  }
  // Reused exact baseline identities remain unchanged; continuation ownership is
  // retained above. New identities append after the original source prefix.
  for(const source of content.continuationCanonSources)if(!content.canonSources.some(s=>s.id===source.id))content.canonSources.push(source);
  content.scope={...content.scope,totalItems:content.items.length,practiceItems:content.items.filter(i=>i.pool==='practice').length,checkItems:content.items.filter(i=>i.pool==='check').length,laterItems:content.items.filter(i=>i.pool==='later').length,objectives:content.objectives.length,partialScreenshotHeadings:content.screenshotTopics.filter(t=>t.status==='partial').length,plannedScreenshotHeadings:content.screenshotTopics.filter(t=>t.status==='planned').length,allSubjectsComplete:false,externalSMECertification:false};
  content.continuationChapterIds=continuation.map(c=>c.id);
  const result={AceDATContent:content,AceDATRealms:realms,AtlasCoursePacks:packs,MNEMON_ITEMS:content.items.filter(q=>q.pool==='practice'||q.pool==='check'),creatures:content.creatures,items:content.items,objectives:content.objectives,missions:content.missions,teachingByObjective:content.teachingByObjective,curriculumCoverage:coverage,screenshotTopics:content.screenshotTopics,officialOnlyTopics:content.officialOnlyTopics};
  result.itemsForMode=(course,session,mode='practice')=>['practice','check'].includes(mode)?result.MNEMON_ITEMS.filter(q=>q.course===course&&q.session===session&&q.pool===mode):[];
  return freeze(result);
}
