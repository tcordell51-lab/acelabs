// scripts/explainers/families.js: the closed list of trap families
// (docs/release-2026-10-30/questions/explainer-standard.md, section 3).
// Moved here from the pilot scripts with the build. A new family is added only
// by an edit to section 3 of the standard and to this file, never in a record.
// Every non-key choice carries one family id. The family fixes the missType
// (Thomas's three kinds of miss: content, concept, misread) and is what the Ace
// Log counts. The coach's own words for the trap go in the optional display
// label (`trap`), never in place of the family.
// For generated items (PAT, OChem Tree) the family is the engine's own trap tag
// for that option, under a house-safe name, so the results screen and the
// explainer name the same miss the same way.
'use strict';

const F = {};
function add(id, name, missType, what, group) { F[id] = { id, name, missType, what, group }; }

/* shared, every section */
add('other-question', 'Right number, other question', 'misread', 'A true value for a quantity the stem did not ask for', 'shared');
add('one-step-short', 'One step short', 'concept', 'Stopped before the last step', 'shared');
add('one-step-too-far', 'One step too far', 'misread', 'Went past what was asked', 'shared');
add('flipped-condition', 'Flipped the condition', 'concept', 'Reversed given and asked: P(A given B) for P(B given A)', 'shared');
add('reversed', 'Reversed', 'concept', 'The science runs the other way: a direction, a ranking, a configuration or a cause turned around', 'shared');
add('read-backward', 'Read backward', 'misread', 'The stem or passage read in the opposite direction: decreasing for increasing, the role of a finding swapped', 'shared');
add('half-right', 'Half right', 'concept', 'One true part, one part that does not hold', 'shared');
add('close-second', 'Close second', 'concept', 'A real candidate that loses to a stronger one (secondary against benzylic)', 'shared');
add('neighbor-fact', 'Neighbor fact', 'content', 'True of a nearby structure, step, place or quantity, not this one', 'shared');
add('other-conditions', 'Other conditions', 'content', 'The outcome of a different reagent, setting or case', 'shared');
add('missed-exception', 'Smooth trend, missed exception', 'content', 'The general rule where the item tests the exception', 'shared');
add('other-unit', 'Counted the other unit', 'concept', 'Formula units for particles, electrons for pairs', 'shared');
add('unit-slip', 'Unit or decimal slip', 'misread', 'Power of ten, unit or decimal place', 'shared');
add('sign-slip', 'Sign slip', 'misread', 'A minus sign lost or added', 'shared');
add('operation-flip', 'Added instead of subtracted', 'concept', 'The operation flipped', 'shared');
add('assumed-equal', 'Assumed equal', 'concept', 'Treated outcomes or groups as equal in size or weight when they are not', 'shared');
add('looks-bigger', 'Looks bigger, is not', 'misread', 'A visual size cue misread: arm length, bar height, scale', 'shared');
add('miscount', 'Miscount', 'misread', 'A count or tally slipped, with no single rule behind it', 'shared');

/* reading comprehension (the about 190 bank labels fold into these) */
add('rc-outside', 'Outside the passage', 'misread', 'Not in the passage: outside knowledge or an unsupported claim', 'rc');
add('rc-contradicted', 'Contradicted', 'misread', 'The passage says the opposite', 'rc');
add('rc-other-paragraph', 'Different paragraph', 'misread', 'A real line from another part of the passage', 'rc');
add('rc-misplaced', 'Misplaced detail', 'misread', 'A real detail attached to the wrong person, cell, number or date in the choice', 'rc');
add('rc-too-strong', 'Too strong', 'misread', 'Too extreme or sweeping for the text', 'rc');
add('rc-too-weak', 'Too weak', 'misread', 'Too narrow or hedged for the text', 'rc');
add('rc-half-supported', 'Half supported', 'misread', 'One part the passage supports, one part it does not', 'rc');
add('rc-off-question', 'True but off-question', 'misread', 'Supported, but answers a different question', 'rc');
add('rc-tone', 'Tone mismatch', 'misread', 'The register or attitude does not fit', 'rc');
add('rc-timeline', 'Timeline mix-up', 'misread', 'The order of events or the era confused', 'rc');
add('rc-swapped-cause', 'Swapped cause', 'concept', 'The cause or mechanism the passage gives, replaced', 'rc');
add('rc-stated', 'True in the passage', 'n/a', 'EXCEPT items: a choice the passage does support', 'rc');

/* PAT: one house-safe name per engine tag (tools/pat/engine/pat-test.js TRAP_NAMES) */
const PAT = {
  keyholes: { FILL: ['Dropped feature', 'misread'], CARVE: ['Added notch', 'misread'], LIMB: ['Impossible combination', 'concept'], SCALE: ['Proportions off', 'misread'], ISLAND: ['Floating island', 'concept'], MIRROR: ['Near-mirror', 'misread'], FOREIGN: ['Different object', 'misread'], SIZE: ['Right shape, other size', 'misread'], CURVE: ['Curve and slant swapped', 'misread'] },
  tfe: { mirror: ['Front and back swapped', 'misread'], 'dash-as-solid': ['Hidden edge drawn solid', 'concept'], 'solid-as-dash': ['Visible edge drawn dashed', 'concept'], profile: ['A step out of place', 'misread'], feature: ['A feature changed', 'misread'], dropped: ['A feature left out', 'misread'] },
  angles: { swap: ['Swapped a close pair', 'misread'], double: ['Swapped two pairs', 'misread'], shift: ['One angle two spots off', 'misread'] },
  holepunch: { 'missed-unfold': ['Skipped one unfold', 'concept'], 'wrong-line': ['Mirrored across the other crease', 'concept'], flipped: ['Read the sheet flipped', 'misread'], shifted: ['One hole off by a cell', 'misread'], dropped: ['One hole missing', 'misread'] },
  cubes: { 'hidden-faces': ['Skipped hidden faces', 'concept'], bottom: ['Painted the bottom', 'concept'], 'hidden-cubes': ['Skipped hidden cubes', 'concept'] },
  patternfold: { mirror: ['Mirror image cube', 'misread'], rotation: ['A face turned', 'misread'], neighbor: ['Two faces traded places', 'misread'], opposite: ['Opposite faces side by side', 'concept'], shade: ['Shading on another face', 'misread'], hidden: ['A far-side face shown', 'concept'] }
};
for (const [type, tags] of Object.entries(PAT)) for (const [tag, [name, mt]] of Object.entries(tags)) add('pat:' + type + ':' + tag, name, mt, 'PAT ' + type + ' engine tag ' + tag, 'pat');

module.exports = { FAMILIES: F, PAT_ENGINE_LABELS: PAT };
