/* Postcommit geometry only. The original 2D PAT activity owns the case, reveal
 * state and answer. A renderer may inspect these snapshots; it must not infer
 * intermediate bending, thickness or physics from them. No graded-bank imports. */
import {PAT_ACTIVITIES, PAT_PAPER_CASES, paperStates} from './expeditions/pat.mjs';

const SIZE=6;
const RADIUS=.25; // Matches the original diagram: a 10px hole in a 40px cell.
const CASES=Object.freeze({'pat-mirror-ferry':PAT_PAPER_CASES.one,'pat-layer-lock':PAT_PAPER_CASES.two});
const ACTIVITIES=new Map(PAT_ACTIVITIES.filter(activity=>Object.hasOwn(CASES,activity.id)).map(activity=>[activity.id,activity]));
const index=(value,length)=>Number.isInteger(value)&&value>=0&&value<length;
const freeze=value=>{if(value&&typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}return value;};

/**
 * paperModel(activityId, state, {snapshot:'observed'|'packet'})
 *
 * Returns null before the activity's explicit reveal, for unsupported activities,
 * or for invalid case/stage coordinates. `observed` is the result currently shown
 * by the 2D activity (stage + 1 folds opened). `packet` is the initial fully folded
 * punched packet, also available only after that reveal. Neither returns future
 * unfolding states. Coordinates use grid-cell units with (0,0) at bottom-left;
 * the 2D top-first row r therefore has Cartesian center y = 5.5 - r.
 *
 * Every listed hole passes through every one of `layers` overlapping sheets.
 * The renderer supplies visual paper thickness/spacing, not physical dimensions.
 */
export function paperModel(activityId,state,options={}){
  const activity=ACTIVITIES.get(activityId),cases=CASES[activityId];
  if(!activity||!state||typeof state!=='object'||Array.isArray(state)||state.phase!=='observed'||!index(state.caseIndex,cases.length))return null;
  const example=cases[state.caseIndex];
  if(!index(state.stage,example.folds.length))return null;
  const normalized=activity.normalize(state);
  if(normalized.phase!=='observed')return null;
  const snapshot=options?.snapshot??'observed';
  if(!['observed','packet'].includes(snapshot))return null;
  const openedCount=snapshot==='packet'?0:normalized.stage+1;
  const remainingFolds=example.folds.slice(0,example.folds.length-openedCount);
  const openedFolds=example.folds.slice(example.folds.length-openedCount).reverse();
  const holes=paperStates(example)[openedCount].map(cell=>({x:cell%SIZE+.5,y:SIZE-.5-Math.floor(cell/SIZE),r:RADIUS}));
  const layers=2**remainingFolds.length;
  return freeze({
    activityId,caseIndex:normalized.caseIndex,caseName:example.name,stage:normalized.stage,
    snapshot,inspectionOnly:true,masteryCredit:false,
    bounds:[remainingFolds.includes('right')?3:0,remainingFolds.includes('up')?3:0,SIZE,SIZE],
    originalBounds:[0,0,SIZE,SIZE],holes,layers,openedCount,
    foldSequence:example.folds.slice(),remainingFolds,openedFolds,
    coordinates:{units:'grid cells',origin:'bottom-left',xPositive:'right',yPositive:'up',rows:'The 2D grid numbers rows from top to bottom.',columns:'The 2D grid numbers columns from left to right.'},
    label:snapshot==='packet'?`${example.name}: initial punched packet, ${layers} overlapping layers.`:`${example.name}: ${openedCount} of ${example.folds.length} folds opened; ${layers===1?'fully opened sheet':layers+' overlapping layers remain'}.`,
    note:'Inspect the current revealed paper only. Thin separated layers are a display aid; this is not a folding animation or a physical paper simulation.',
    objectiveIds:activity.objectiveIds.slice(),sourceUrls:activity.sourceUrls.slice()
  });
}

export default paperModel;
