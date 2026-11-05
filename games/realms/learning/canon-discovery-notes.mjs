import {CANON_DISCOVERY_LINKS} from '../data/reviewed/canon-discovery-links.mjs';
import {esc} from './expeditions/shared.mjs';
// The Q/K card uses A+B⇌2C, so it is deliberately not attached to the new
// A⇌B reactor. These additions were reviewed against their actual model limits.
const additionalActivities={
 'canon-discovery-cargo':['bio-payload-routing'],
 'canon-discovery-enzyme-rate':['bio-enzyme-assay-bench'],
 'canon-discovery-enzyme-inhibition':['bio-enzyme-assay-bench']
};
export function canonNotesFor(activity,view){
 const active=view.activeObjectiveIds||activity.objectiveIds;
 return CANON_DISCOVERY_LINKS.filter(card=>card.reviewStatus==='internal-reviewed-selected-explanation'&&card.progressGradingEligible===false&&
  [...card.activityIds,...(additionalActivities[card.id]||[])].includes(activity.id)&&card.objectiveIds.some(id=>active.includes(id)));
}
export function recordCanonNotes(cards,recordExposure,itemId=null,questionObjectiveId=null){
 try{
 if(!cards.length)return false;
 if(itemId){if(!questionObjectiveId||recordExposure(itemId,{objectiveId:questionObjectiveId,kind:'canon-question-help'})?.saved!==true)return false;}
 for(const card of cards)for(const objectiveId of card.objectiveIds){
  const result=recordExposure(`instruction:${card.id}`,{objectiveId,kind:'canon-concept-note',sourceId:card.source.id,sourceVersion:`${card.source.version}:sha256-${card.source.sourceSha256}:card-${card.adaptationVersion}`});
  if(result?.saved!==true)return false;
 }
 return cards.length>0;}catch{return false;}
}
export function canonNotesHTML(cards){return `<aside class="exp-canon-note" aria-label="Canon concept notes">${cards.map(card=>`<section><h4>${esc(card.title)}</h4><p>${esc(card.afterCommit.explanation)}</p><p><strong>Watch for:</strong> ${esc(card.afterCommit.misconception)}</p><p><strong>Model conditions:</strong> ${esc(card.assumptions.join(' '))}</p><p>${esc(card.afterCommit.nextAction)}</p><p class="exp-note">Adapted from your Canon field notes. ${card.sourceUrls.map((url,i)=>`<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${i===0?'Concept source':'Additional source'}</a>`).join(' · ')}</p></section>`).join('')}</aside>`;}
