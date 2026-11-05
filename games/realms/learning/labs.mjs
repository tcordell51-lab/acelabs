import {defaultEquilibriumLab,updateEquilibriumLab,renderEquilibriumLab} from './equilibrium-lab.mjs';
import {defaultCargoLab,updateCargoLab,renderCargoLab} from './cargo-lab.mjs';
import {defaultPatLab,updatePatLab,renderPatLab} from './pat-lab.mjs';
import {EXPANSION_MODELS,modelForObjective,defaultExpansionModel,updateExpansionModel,renderExpansionModel} from './expansion-models.mjs';
export {PAT_LAB} from './pat-lab.mjs';
import { esc, renderFigure } from './visuals.mjs';

const WORLDS = ['bio', 'gc', 'oc', 'pat', 'rc', 'qr'];
export const QR_LAB = Object.freeze({a:8,b:12,fillTime:24/5,elapsed:Object.freeze([0,1.2,2.4,3.6,4.8,6])});
const DIFFUSION_OBJECTIVES = ['bio-diffusion', 'bio-transport'];
const DIFFUSION_PREDICTIONS = ['left', 'right', 'balanced', 'blocked'];
const diffusionMode = (worldId, objectiveId) => worldId === 'bio' && DIFFUSION_OBJECTIVES.includes(objectiveId);
const activeExpansion=(worldId,objectiveId)=>{const m=modelForObjective(objectiveId);return m?.world===worldId&&m.reviewStatus==='internal-reviewed'?m:null;};
const expansionState=(worldId,state)=>EXPANSION_MODELS.some(m=>m.world===worldId&&m.id===state?.mode&&m.reviewStatus==='internal-reviewed');
const LAB_OBJECTIVES = {
  bio: ['bio-osmosis', 'bio-tonicity', 'bio-animal'],
  gc: ['gc-barrier', 'gc-catalyst'],
  oc: ['oc-electrons'],
  pat: ['pat.one-fold'],
  rc: ['rc.evidence', 'rc.inference'],
  qr: ['qr.rates'],
};

export function labObjectiveIds(worldId, objectiveId) {
  if (!WORLDS.includes(worldId)) throw new RangeError('Unknown DAT field lab.');
  const expanded=activeExpansion(worldId,objectiveId);if(expanded)return [...expanded.objectiveIds];
  if (worldId==='gc'&&objectiveId==='gc-equilibrium') return ['gc-equilibrium'];
  if (worldId==='bio'&&objectiveId==='bio-cargo') return ['bio-cargo'];
  if (diffusionMode(worldId, objectiveId)) return ['bio-diffusion'];
  return [...LAB_OBJECTIVES[worldId]];
}
const initial = {
  bio: { outside: 100, prediction: null, revealed: false },
  gc: { prediction: null, revealed: false },
  oc: { prediction: null, revealed: false },
  rc: { claim: 'qualified', prediction: null, revealed: false },
  qr: { prediction: null, elapsed: 1.2, revealed: false },
};
const predictions = {
  bio: ['swell', 'stable', 'shrink'], gc: ['barrier', 'endpoints', 'both'],
  oc: ['oxygen', 'carbon', 'bromine'], rc: ['1', '2'], qr: ['4.8', '10', '20'],
};
const clone = value => JSON.parse(JSON.stringify(value));

export function defaultLabState(worldId, objectiveId) {
  if (!WORLDS.includes(worldId)) throw new RangeError('Unknown DAT field lab.');
  if(activeExpansion(worldId,objectiveId))return defaultExpansionModel(objectiveId);
  if (worldId==='pat') return defaultPatLab();
  if (worldId==='gc'&&objectiveId==='gc-equilibrium') return defaultEquilibriumLab();
  if (worldId==='bio'&&objectiveId==='bio-cargo') return defaultCargoLab();
  if (diffusionMode(worldId, objectiveId)) return { mode: 'diffusion', left: 2, gate: 'pass', prediction: null, revealed: false };
  return clone(initial[worldId]);
}

function normalized(worldId, state) {
  const clean = defaultLabState(worldId, state?.mode === 'diffusion' ? 'bio-diffusion' : undefined);
  if (!state || typeof state !== 'object') return clean;
  const options = clean.mode === 'diffusion' ? DIFFUSION_PREDICTIONS : predictions[worldId];
  if (options?.includes(state.prediction)) clean.prediction = state.prediction;
  if (worldId === 'bio') {
    if (clean.mode === 'diffusion') {
      if ([2, 6, 10].includes(state.left)) clean.left = state.left;
      if (['pass', 'block'].includes(state.gate)) clean.gate = state.gate;
    } else if ([100, 300, 500].includes(state.outside)) clean.outside = state.outside;
  }
  if (worldId === 'rc' && ['qualified', 'observation'].includes(state.claim)) clean.claim = state.claim;
  if (worldId === 'qr' && QR_LAB.elapsed.includes(state.elapsed)) clean.elapsed = state.elapsed;
  clean.revealed = state.revealed === true && clean.prediction !== null;
  return clean;
}

export function updateLab(worldId, state, action, value) {
  if(expansionState(worldId,state))return updateExpansionModel(state,action,value);
  if(worldId==='pat')return updatePatLab(state,action,value);
  if(worldId==='gc'&&state?.mode==='equilibrium')return updateEquilibriumLab(state,action,value);
  if(worldId==='bio'&&state?.mode==='cargo')return updateCargoLab(state,action,value);
  const next = normalized(worldId, state);
  if (action === 'reset') return defaultLabState(worldId, next.mode === 'diffusion' ? 'bio-diffusion' : undefined);
  const options = next.mode === 'diffusion' ? DIFFUSION_PREDICTIONS : predictions[worldId];
  if (action === 'predict' && !next.revealed && options?.includes(String(value))) {
    next.prediction = String(value);
  }
  if (action === 'observe' && next.prediction !== null) next.revealed = true;
  if (worldId === 'bio' && next.mode === 'diffusion') {
    if (action === 'left' && [2, 6, 10].includes(Number(value))) {
      next.left = Number(value); next.prediction = null; next.revealed = false;
    }
    if (action === 'gate' && ['pass', 'block'].includes(String(value))) {
      next.gate = String(value); next.prediction = null; next.revealed = false;
    }
  }
  if (worldId === 'bio' && next.mode !== 'diffusion' && action === 'outside' && [100, 300, 500].includes(Number(value))) {
    next.outside = Number(value); next.prediction = null; next.revealed = false;
  }
  if (worldId === 'rc' && action === 'claim' && ['qualified', 'observation'].includes(String(value))) {
    next.claim = String(value); next.prediction = null; next.revealed = false;
  }
  if (worldId === 'qr' && action === 'elapsed' && next.revealed && QR_LAB.elapsed.includes(Number(value))) {
    next.elapsed = Number(value);
  }
  return next;
}

const button = (label, action, value = '', { selected = false, disabled = false, primary = false } = {}) =>
  `<button type="button" class="btn${primary || selected ? '' : ' light'}${selected ? ' selected' : ''}" data-lab-action="${esc(action)}" data-value="${esc(value)}"${disabled ? ' disabled' : ''}${action === 'predict' ? ` aria-pressed="${selected}"` : ''}>${esc(label)}</button>`;
const choices = (worldId, state, options) => `<div class="lab-controls" role="group" aria-label="Your prediction">${options.map(([value, label]) => button(label, 'predict', value, { selected: state.prediction === value, disabled: state.revealed })).join('')}</div>`;
const select = (label, action, current, options) => `<label>${esc(label)}<select data-lab-change="${esc(action)}">${options.map(([value, text]) => `<option value="${esc(value)}"${String(current) === String(value) ? ' selected' : ''}>${esc(text)}</option>`).join('')}</select></label>`;
const reveal = (state, label = 'Observe the result') => `<div class="lab-controls">${button(label, 'observe', '', { disabled: state.revealed || (state.selected ? !state.selected.length : state.prediction === null), primary: true })}${button('Start this lab again', 'reset')}</div>`;
const result = (correct, text) => `<div class="lab-result" role="status"><strong>${correct ? 'Your prediction matches this model.' : 'A useful difference to notice.'}</strong><p>${text}</p></div>`;
const wrap = (title, content) => `<section class="lab-card" aria-label="${esc(title)}"><p class="eyebrow">Field lab</p><h3>${esc(title)}</h3>${content}<p class="subtle" style="margin-top:18px">Learning only. Exploring this lab records exposure to the topic. It does not record a scored answer, independent check, or mastery result.</p></section>`;

function diffusionLab(state) {
  const expected = state.gate === 'block' ? 'blocked' : state.left < 6 ? 'left' : state.left > 6 ? 'right' : 'balanced';
  const outcomes = {
    left: ['net dye movement from right to left', 'Dye starts more concentrated on the right. Particles cross both ways, but initially more cross from right to left. Net means the difference between these two amounts.'],
    right: ['net dye movement from left to right', 'Dye starts more concentrated on the left. Particles cross both ways, but initially more cross from left to right. Net means the difference between these two amounts.'],
    balanced: ['balanced crossing, with no net dye movement', 'The starting concentrations are equal. Particles still cross both ways, with equal amounts crossing in each direction on average. The particles have not stopped moving; the two flows balance.'],
    blocked: ['no dye crosses the membrane', 'The membrane blocks this dye. A concentration difference cannot make dye cross a barrier that does not let it through. Particles still move randomly within each side. This is a blocked path, not balanced crossing.'],
  };
  const [outcome, explanation] = outcomes[expected];
  return wrap('Portia follows the dye', `
    <p>Dye particles are dissolved in water on two sides of a thin barrier called a <strong>membrane</strong>. The dye is neutral: its particles have no electric charge. The liquid does not flow between the sides, and water cannot cross this membrane.</p>
    <p><strong>Concentration</strong> means how much dye is in a given volume of liquid. The unit mM, or millimoles per liter, measures that amount. A larger number means more dye in the same volume. The right side starts at <strong>6 mM</strong>.</p>
    <div class="lab-controls">${select('Left starting dye concentration', 'left', state.left, [[2, '2 mM'], [6, '6 mM'], [10, '10 mM']])}${select('Membrane gate for dye', 'gate', state.gate, [['pass', 'Lets dye cross'], ['block', 'Blocks dye']])}</div>
    ${renderFigure({ type: 'membrane', unit: 'mM', left: state.left, right: 6, solutePermeable: state.gate === 'pass', waterPermeable: false })}
    <p>The dots represent dye, the dissolved substance called a <strong>solute</strong>. They show relative concentration, not an exact count. First check whether the gate lets dye cross.</p>
    <p><strong>Predict the initial result.</strong> In which direction will more dye cross overall, if any?</p>
    ${choices('bio', state, [['left', 'More dye crosses to the left'], ['right', 'More dye crosses to the right'], ['balanced', 'Both directions balance'], ['blocked', 'Dye cannot cross']])}
    ${reveal(state, 'Observe the dye movement')}
    ${state.revealed ? `<p><strong>Model result: ${esc(outcome)}.</strong></p>${result(state.prediction === expected, `${explanation} Each particle keeps moving randomly. When dye can cross, this random movement spreads it from a region of higher concentration toward lower concentration overall; that process is diffusion. The diagram shows the starting concentrations and initial result, not the final distribution. Change the concentration or gate to make another prediction.`)}` : ''}
  `);
}

function bioLab(state) {
  if (state.mode === 'diffusion') return diffusionLab(state);
  const expected = state.outside < 300 ? 'swell' : state.outside > 300 ? 'shrink' : 'stable';
  const why = {
    swell: 'The outside starts with less trapped solute per liter. Water moves both ways, but the initial net movement is into the cell. Its volume tends to increase.',
    shrink: 'The outside starts with more trapped solute per liter. Water moves both ways, but the initial net movement is out of the cell. Its volume tends to decrease.',
    stable: 'The trapped-solute concentrations start equal. Water still moves both ways, but there is no initial net movement and no osmotic tendency to change the cell volume.',
  }[expected];
  const diameter = state.revealed ? { swell: 105, stable: 80, shrink: 56 }[expected] : 80;
  return wrap('Portia and the membrane gates', `
    <p>A flexible animal-cell membrane lets water cross but keeps this solute trapped. Temperature is the same on both sides, initial hydrostatic pressure is equal, and the cell has no active volume regulation. The cell starts at <strong>300 mOsm/L</strong>. Compare it with the surrounding solution. These are starting concentrations, not values held fixed as water moves.</p>
    <div class="lab-controls">${select('Outside starting concentration', 'outside', state.outside, [[100, '100 mOsm/L'], [300, '300 mOsm/L'], [500, '500 mOsm/L']])}</div>
    ${renderFigure({ type: 'membrane', unit: 'mOsm/L', left: 300, right: state.outside, solutePermeable: false, waterPermeable: true })}
    <p><strong>Left is the cell interior; right is the outside solution.</strong> Predict the cell's initial volume change.</p>
    ${choices('bio', state, [['swell', 'Swell'], ['stable', 'Stay about the same'], ['shrink', 'Shrink']])}
    ${reveal(state, 'Watch the initial water movement')}
    ${state.revealed ? `<div style="display:flex;gap:20px;align-items:center;flex-wrap:wrap;margin:15px 0"><div aria-hidden="true" style="height:115px;width:130px;display:grid;place-items:center"><div style="width:${diameter}px;height:${diameter}px;border-radius:50%;background:#bbdbbf;border:5px solid #568b67"></div></div><p><strong>Model result: ${esc(expected === 'stable' ? 'no initial net volume change' : expected === 'swell' ? 'initial swelling' : 'initial shrinking')}.</strong><br>The cell drawing shows direction only, not a calculated final size.</p></div>${result(state.prediction === expected, `${why} The solute does not cross or pull mechanically on water. Change the outside concentration to make a new prediction.`)}` : ''}
  `);
}

function gcLab(state) {
  return wrap('Molarion and the alternate pathway', `
    <p>The same reaction runs at the same temperature. Its reactants start at 20 kJ/mol, its uncatalyzed peak is 100 kJ/mol, and its products end at 0 kJ/mol on this schematic potential-energy diagram.</p>
    ${renderFigure({ type: 'energy', start: 20, peak: 100, end: 0, ...(state.revealed ? { catalystPeak: 60 } : {}) })}
    <p><strong>Predict:</strong> when a catalyst supplies an alternative pathway, what changes on this diagram?</p>
    ${choices('gc', state, [['barrier', 'The barrier; endpoints stay the same'], ['endpoints', 'The product energy only'], ['both', 'Both endpoint energies and the barrier']])}
    ${reveal(state, 'Add the catalyst')}
    ${state.revealed ? result(state.prediction === 'barrier', 'The alternate peak is 60 kJ/mol. The forward activation barrier changes from 100 - 20 = 80 to 60 - 20 = 40 kJ/mol. Reactants and products keep their original energies. A catalyst speeds approach to equilibrium without changing the equilibrium constant at this fixed temperature. This potential-energy diagram alone does not determine the reaction\'s Gibbs free-energy change or prove spontaneity. Team Entropy cannot turn "faster" into "more product at equilibrium."') : ''}
  `);
}

function sn2Figure(revealed) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 210" role="img" aria-label="Hydroxide oxygen beside the carbon of CH3-Br.${revealed ? ' A curved arrow goes from an oxygen electron pair to carbon; another goes from the carbon-bromine bond to bromine.' : ' No electron-flow arrows are shown yet.'}" style="font-family:system-ui,sans-serif">
    <defs><marker id="lab-electron-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="#6d5084"/></marker></defs>
    <rect x="20" y="20" width="460" height="175" rx="18" fill="#eee8f5"/>
    <g fill="#372a47" font-size="25" text-anchor="middle"><text x="65" y="117">H</text><text x="105" y="117">O</text><text x="122" y="91" font-size="18">-</text><text x="253" y="117">CH3</text><text x="382" y="117">Br</text></g>
    <path d="M78 109H92 M284 109H363" stroke="#51405f" stroke-width="3"/>
    <circle cx="124" cy="104" r="2.5" fill="#51405f"/><circle cx="124" cy="113" r="2.5" fill="#51405f"/>
    <text x="250" y="177" text-anchor="middle" font-size="12" fill="#51405f">Exact reactants: hydroxide and bromomethane</text>
    ${revealed ? '<path d="M126 101C154 45 218 46 238 94" stroke="#6d5084" stroke-width="3" fill="none" marker-end="url(#lab-electron-arrow)"/><path d="M324 107C329 50 389 51 388 88" stroke="#6d5084" stroke-width="3" fill="none" marker-end="url(#lab-electron-arrow)"/>' : ''}
  </svg>`;
}

function ocLab(state) {
  return wrap('Stereon follows the electrons', `
    <p>Hydroxide, OH<sup>-</sup>, attacks bromomethane, CH3Br, in a single SN2 substitution step. A curved arrow follows an <strong>electron pair</strong>, not an atom. The drawing shows one available oxygen pair; other lone pairs are omitted.</p>
    ${sn2Figure(state.revealed)}
    <p><strong>Predict:</strong> where does the arrow that forms the new carbon-oxygen bond begin?</p>
    ${choices('oc', state, [['oxygen', 'At an electron pair on oxygen'], ['carbon', 'At the methyl carbon atom'], ['bromine', 'At the bromine atom']])}
    ${reveal(state, 'Trace both electron-pair movements')}
    ${state.revealed ? result(state.prediction === 'oxygen', 'The oxygen pair goes to carbon and becomes the new C-O bond. At the same time, the pair in the C-Br bond goes to bromine, releasing Br-. The products are CH3OH and Br-. Both arrows describe one concerted step; there is no isolated methyl carbocation between them. This methyl carbon is not a stereocenter, so this example makes no R/S inversion claim.') : ''}
  `);
}

const paragraphs = [
  'In a small greenhouse trial, seedlings receiving a particular light schedule produced more leaves on average than seedlings under a comparison schedule. The trial used one species in one greenhouse.',
  'The investigators wrote that the schedule may help this species under similar greenhouse conditions. They did not test other species or outdoor conditions, and they called for further trials.',
];

function rcLab(state) {
  const target = state.claim === 'qualified' ? '2' : '1';
  const claim = state.claim === 'qualified'
    ? 'The investigators suggest a possible benefit within limited conditions, rather than a guaranteed benefit for all plants.'
    : 'The trial reported a difference in average leaf production between the two schedules.';
  return wrap('Skimmer checks the claim', `
    <p>This is an original hypothetical passage. Use its wording as evidence; no botany knowledge is needed.</p>
    ${paragraphs.map((paragraph, index) => `<div style="padding:13px 15px;margin:10px 0;border-radius:12px;border:1px solid ${state.revealed && target === String(index + 1) ? '#5f956f' : '#d0dcc7'};background:${state.revealed && target === String(index + 1) ? '#e2efd8' : '#fffef7'}"><p><strong>Paragraph ${index + 1}.</strong> ${esc(paragraph)}</p></div>`).join('')}
    <div class="lab-controls">${select('Claim to investigate', 'claim', state.claim, [['qualified', 'How cautious are the authors?'], ['observation', 'What did the trial observe?']])}</div>
    <p><strong>Claim:</strong> ${esc(claim)}</p>
    <p>Which paragraph most directly supports this claim?</p>
    ${choices('rc', state, [['1', 'Paragraph 1'], ['2', 'Paragraph 2']])}
    ${reveal(state, 'Show the supporting evidence')}
    ${state.revealed ? result(state.prediction === target, state.claim === 'qualified'
      ? 'Paragraph 2 says "may" and limits the suggestion to this species under similar conditions. "Always helps every plant" would go beyond the passage. A supported answer preserves both the claim and its qualifications; it does not make the author more certain.'
      : 'Paragraph 1 directly reports the measured difference in average leaf production. Paragraph 2 interprets how far that finding may extend. Separate an observation from the author\'s cautious interpretation. The word "may" still cannot become "always."') : ''}
  `);
}

function qrLab(state) {
  const fraction = Math.min(1, state.elapsed / QR_LAB.fillTime);
  const percent = Math.round(fraction * 100);
  return wrap('Ratior restarts the pumps', `
    <p>Pump A fills one empty reservoir in 8 hours. Pump B fills the same reservoir in 12 hours. Both flows stay constant, they can run together without changing each other's rate, and there is no outflow.</p>
    ${renderFigure({ type: 'rates', a: QR_LAB.a, b: QR_LAB.b, unit: 'hours alone' })}
    <p><strong>Predict:</strong> how long do both pumps need to fill the empty reservoir?</p>
    ${choices('qr', state, [['4.8', '4.8 hours'], ['10', '10 hours'], ['20', '20 hours']])}
    ${reveal(state, 'Run the pumps together')}
    ${state.revealed ? `${result(state.prediction === '4.8', 'A adds 1/8 reservoir per hour and B adds 1/12. Together they add 3/24 + 2/24 = 5/24 reservoir per hour. One reservoir divided by 5/24 reservoir per hour gives 24/5 = 4.8 hours. Adding or averaging the fill times combines the wrong quantities. Move the elapsed time below to see the combined rate.')}
      <div class="lab-controls">${select('Elapsed time with both pumps', 'elapsed', state.elapsed, QR_LAB.elapsed.map(hours=>[hours,`${hours} hours`]))}</div>
      <div role="img" aria-label="Reservoir ${percent} percent full after ${state.elapsed} hours. Pumps stop at capacity." style="position:relative;height:150px;border:3px solid #6c9689;border-top:0;border-radius:0 0 18px 18px;overflow:hidden;background:#fffef7;max-width:320px;margin:20px auto">
        <div style="position:absolute;inset:auto 0 0;height:${percent}%;background:#9fd0bf"></div><div style="position:relative;height:100%;display:grid;place-items:center;color:#203f35;font-weight:700">${percent}% full</div>
      </div><p style="text-align:center">${state.elapsed} hours: ${percent}% of one reservoir. ${state.elapsed > QR_LAB.fillTime ? 'It was full at 4.8 hours; the pumps stopped then.' : 'Volume = combined rate multiplied by elapsed time, until full.'}</p>` : ''}
  `);
}

export function renderLab(worldId, state) {
  if(expansionState(worldId,state))return renderExpansionModel(state);
  if(worldId==='pat')return renderPatLab(state);
  if(worldId==='gc'&&state?.mode==='equilibrium')return renderEquilibriumLab(state);
  if(worldId==='bio'&&state?.mode==='cargo')return renderCargoLab(state);
  const safe = normalized(worldId, state);
  return { bio: bioLab, gc: gcLab, oc: ocLab, rc: rcLab, qr: qrLab }[worldId](safe);
}
