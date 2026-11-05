// A separate append layer preserves the already reviewed 443-item corpus.
// Runtime composition does not import authoring, review receipts, or Node tools.
import * as base from './content-adapter.mjs';
import {continuationChapters} from './continuation-release.mjs';
import {refinementChapters,refinementReturnItems,refinementCanonLinks} from './refinement-release.mjs';
import {buildChapterRegistry} from './chapter-registry.mjs';
import {applyRefinementSupplements} from './refinement-registry.mjs';

const clone=value=>JSON.parse(JSON.stringify(value));
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const assert=(ok,message)=>{if(!ok)throw new Error(message);};
const freeze=value=>{if(value&&typeof value==='object'&&!Object.isFrozen(value)){Object.freeze(value);Object.values(value).forEach(freeze);}return value;};

export const campaignBaseline=applyRefinementSupplements(
  buildChapterRegistry(base,[...continuationChapters,...refinementChapters]),
  {returnItems:refinementReturnItems,canonLinks:refinementCanonLinks}
);

/** Append after old returns and overlays, retaining old routes and save indices. */
export function buildCampaignRegistry(chapters=[]){
  if(!chapters.length)return campaignBaseline;
  const appended=buildChapterRegistry(campaignBaseline,chapters);
  const content=clone(appended.AceDATContent),realms=clone(appended.AceDATRealms);
  const previous=campaignBaseline.AceDATContent,coverage=content.curriculumCoverage;
  const previousIds=previous.continuationChapterIds;
  assert(previousIds.length===8,'Campaign baseline chapter order changed');
  for(const world of realms)for(const route of world.routes){
    const index=chapters.findIndex(c=>c.id===route.id);
    if(index>=0)route.registrationOrder=previousIds.length+index;
  }
  content.continuationChapterIds=[...previousIds,...content.continuationChapterIds];
  coverage.continuationFacets=[...clone(previous.curriculumCoverage.continuationFacets),...coverage.continuationFacets];
  coverage.counts.activeContinuationChapters=coverage.continuationFacets.length;
  coverage.counts.activeContinuationObjectives=coverage.continuationFacets.reduce((n,c)=>n+c.objectiveIds.length,0);
  for(const field of ['screenshotTopics','officialOnlyTopics']){
    for(const row of coverage[field]){
      const old=previous.curriculumCoverage[field].find(r=>r.id===row.id);
      if(old?.activeContinuationChapters)row.activeContinuationChapters=[...new Set([...old.activeContinuationChapters,...(row.activeContinuationChapters||[])])];
    }
    content[field]=coverage[field].map(row=>({...row,course:appended.AceDATContent[field].find(r=>r.id===row.id).course}));
  }
  const sources=clone(previous.continuationCanonSources);
  for(const source of content.continuationCanonSources){
    const old=sources.find(s=>s.id===source.id);
    if(old){
      old.objectiveIds=[...new Set([...old.objectiveIds,...source.objectiveIds])];
      old.chapterIds=[...new Set([...old.chapterIds,...source.chapterIds])];
    }else sources.push(source);
  }
  content.continuationCanonSources=sources;
  for(const key of ['items','objectives','missions','creatures','canonSources'])assert(same(content[key].slice(0,previous[key].length),previous[key]),'Campaign changed historical '+key);
  for(const [id,guide] of Object.entries(previous.teachingByObjective))assert(same(content.teachingByObjective[id],guide),'Campaign changed historical guide: '+id);
  for(const world of campaignBaseline.AceDATRealms)assert(same(realms.find(w=>w.worldId===world.worldId).routes.slice(0,world.routes.length),world.routes),'Campaign changed historical routes: '+world.worldId);
  const result={AceDATContent:content,AceDATRealms:realms,AtlasCoursePacks:appended.AtlasCoursePacks,MNEMON_ITEMS:content.items.filter(q=>q.pool==='practice'||q.pool==='check'),creatures:content.creatures,items:content.items,objectives:content.objectives,missions:content.missions,teachingByObjective:content.teachingByObjective,curriculumCoverage:coverage,screenshotTopics:content.screenshotTopics,officialOnlyTopics:content.officialOnlyTopics};
  result.itemsForMode=(course,session,mode='practice')=>['practice','check'].includes(mode)?result.MNEMON_ITEMS.filter(q=>q.course===course&&q.session===session&&q.pool===mode):[];
  return freeze(result);
}
