import {campaignChapters} from './campaign-release.mjs';
import {buildCampaignRegistry} from './campaign-registry.mjs';

export const curriculum=buildCampaignRegistry(campaignChapters);
export const {AceDATContent,AceDATRealms,AtlasCoursePacks,MNEMON_ITEMS,creatures,items,objectives,missions,teachingByObjective,curriculumCoverage,screenshotTopics,officialOnlyTopics,itemsForMode}=curriculum;
if(typeof window!=='undefined')Object.assign(window,{AceDATContent,AceDATRealms,AtlasCoursePacks,MNEMON_ITEMS,AceDATCreatures:creatures});
