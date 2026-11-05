import {BIOLOGY_ACTIVITIES} from './biology.mjs';
import {BIOLOGY_SYSTEMS_ACTIVITIES} from './biology-systems.mjs';
import {EQUILIBRIUM_ACTIVITIES} from './equilibrium.mjs';
import {MOLE_CONVERSION_ACTIVITY} from './mole-conversion.mjs';
import {CHEMISTRY_ACTIVITIES} from './chemistry.mjs';
import {ORGANIC_ACTIVITIES} from './organic.mjs';
import {PAT_ACTIVITIES} from './pat.mjs';
import {READING_ACTIVITIES} from './reading.mjs';
import {QUANTITATIVE_ACTIVITIES} from './quantitative.mjs';
import CELL_DIVISION_ACTIVITY from './cell-division.mjs';
import {GASES_ACTIVITY} from './gases.mjs';
import {STEREOCHEMISTRY_ACTIVITY} from './stereochemistry.mjs';
import {CUBE_CENSUS_ACTIVITY} from './cubes.mjs';
import {PROBABILITY_ACTIVITIES} from './probability.mjs';
import {RESEARCH_READING_ACTIVITIES} from './research-reading.mjs';
import {continuationChapters} from '../../data/continuation-release.mjs';
import {refinementChapters} from '../../data/refinement-release.mjs';
import {ATOMIC_ACTIVITY} from './atomic.mjs';
import {ORTHOGRAPHIC_ACTIVITY} from './orthographic.mjs';
import {campaignChapters} from '../../data/campaign-release.mjs';
import ENERGY_ACTIVITY from './energy.mjs';
import PATHWAYS_ACTIVITY from './pathways.mjs';
import DATA_OBSERVATORY_ACTIVITY from './data-observatory.mjs';

// A draft source or a matching world name is never sufficient to expose a new
// activity. Its exact chapter must have passed the separate review compiler.
export function reviewedActivities(chapters,candidates){
 return candidates.flatMap(([chapterId,activities])=>{
  const c=chapters.find(c=>c.id===chapterId&&c.reviewStatus==='internal-reviewed'&&c.verified===true&&c.progressEligible===true&&c.runtimeIntegrated===true);
  if(!c)return [];
  return activities.filter(a=>a.world===c.world&&a.objectiveIds.length>0&&a.objectiveIds.every(id=>c.objectiveIds.includes(id)));
 });
}
export const CONTINUATION_CANDIDATES=Object.freeze([
 ['bio-division-conservatory',[CELL_DIVISION_ACTIVITY]],
 ['gc-gas-observatory',[GASES_ACTIVITY]],
 ['oc-stereochemistry-gallery',[STEREOCHEMISTRY_ACTIVITY]],
 ['pat-cube-census',[CUBE_CENSUS_ACTIVITY]],
 ['qr-chance-arcade',PROBABILITY_ACTIVITIES],
 ['rc-research-dispatch',RESEARCH_READING_ACTIVITIES]
].map(([id,activities])=>Object.freeze([id,Object.freeze([...activities])])));
export const CONTINUATION_ACTIVITIES=Object.freeze(reviewedActivities(continuationChapters,CONTINUATION_CANDIDATES));
export const REFINEMENT_CANDIDATES=Object.freeze([
 ['gc-atomic-crucible',Object.freeze([ATOMIC_ACTIVITY])],
 ['pat-view-relay',Object.freeze([ORTHOGRAPHIC_ACTIVITY])]
].map(Object.freeze));
export const REFINEMENT_ACTIVITIES=Object.freeze(reviewedActivities(refinementChapters,REFINEMENT_CANDIDATES));
export const CAMPAIGN_CANDIDATES=Object.freeze([
 ['bio-energy-canopy',Object.freeze([ENERGY_ACTIVITY])],
 ['oc-reaction-crossroads',Object.freeze([PATHWAYS_ACTIVITY])],
 ['qr-data-observatory',Object.freeze([DATA_OBSERVATORY_ACTIVITY])]
].map(Object.freeze));
export const CAMPAIGN_ACTIVITIES=Object.freeze(reviewedActivities(campaignChapters,CAMPAIGN_CANDIDATES));
export const ACTIVITIES=Object.freeze([...BIOLOGY_ACTIVITIES,...BIOLOGY_SYSTEMS_ACTIVITIES,MOLE_CONVERSION_ACTIVITY,...CHEMISTRY_ACTIVITIES,...EQUILIBRIUM_ACTIVITIES,...ORGANIC_ACTIVITIES,...PAT_ACTIVITIES,...READING_ACTIVITIES,...QUANTITATIVE_ACTIVITIES,...CONTINUATION_ACTIVITIES,...REFINEMENT_ACTIVITIES,...CAMPAIGN_ACTIVITIES]);
export const activityForObjective=id=>id==='gc-equilibrium'?EQUILIBRIUM_ACTIVITIES[0]:ACTIVITIES.find(a=>a.objectiveIds.includes(id));
