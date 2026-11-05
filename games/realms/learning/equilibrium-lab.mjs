// Original DATQUEST implementation of a reviewed, narrow Visual Canon concept.
// Provenance is data only: no source HTML, theme, storage or question-bank imports.
import { esc } from './visuals.mjs';

export const EQUILIBRIUM_PRESETS = Object.freeze([
  Object.freeze({ id: 'reactants', label: 'Mixture 1', a0: 1.5, b0: 0.75, c0: 0.6 }),
  Object.freeze({ id: 'product', label: 'Mixture 2', a0: 0.6, b0: 0.4, c0: 1.8 }),
  Object.freeze({ id: 'balanced', label: 'Mixture 3', a0: 0.4, b0: 0.9, c0: 1.2 }),
]);
const K = 4;
const RELATIVE_TOLERANCE = 0.001;
const EDGE_MARGIN = 0.0001;
const STEP = 0.05;
// Native range controls may serialize the same endpoint with a shorter decimal.
// This UI tolerance does not change model concentrations or equilibrium tolerance.
const AT_ENDPOINT = 1e-12;
const PREDICTIONS = ['forward', 'reverse', 'balanced'];
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const presetFor = id => EQUILIBRIUM_PRESETS.find(preset => preset.id === id) || EQUILIBRIUM_PRESETS[0];
const boundsFor = preset => ({ min: -preset.c0 / 2 + EDGE_MARGIN, max: Math.min(preset.a0, preset.b0) - EDGE_MARGIN });
const direction = quotient => Math.abs(quotient / K - 1) <= RELATIVE_TOLERANCE ? 'balanced' : quotient < K ? 'forward' : 'reverse';
const concentrationAt = (preset, extent) => ({ a: preset.a0 - extent, b: preset.b0 - extent, c: preset.c0 + 2 * extent });
const quotientAt = (preset, extent) => {
  const { a, b, c } = concentrationAt(preset, extent);
  return c * c / (a * b);
};

export function defaultEquilibriumLab() {
  return { mode: 'equilibrium', preset: 'reactants', prediction: null, revealed: false, extent: 0 };
}

function normalize(state) {
  const next = defaultEquilibriumLab();
  if (!state || typeof state !== 'object') return next;
  next.preset = presetFor(state.preset).id;
  if (PREDICTIONS.includes(state.prediction)) next.prediction = state.prediction;
  next.revealed = state.revealed === true && next.prediction !== null;
  if (next.revealed && typeof state.extent === 'number' && Number.isFinite(state.extent)) {
    const { min, max } = boundsFor(presetFor(next.preset));
    next.extent = clamp(state.extent, min, max);
  }
  return next;
}

// This is a composition coordinate, not elapsed time or a reaction-rate model.
export function equilibriumModel(state) {
  const safe = normalize(state);
  const preset = presetFor(safe.preset);
  const concentrations = concentrationAt(preset, safe.extent);
  const Q = quotientAt(preset, safe.extent);
  const initialQ = quotientAt(preset, 0);
  return {
    ...preset, ...concentrations, x: safe.extent, K, Q, initialQ,
    initialDirection: direction(initialQ), currentDirection: direction(Q),
    atEquilibrium: direction(Q) === 'balanced',
    bounds: boundsFor(preset), relativeTolerance: RELATIVE_TOLERANCE,
  };
}

function equilibriumExtent(preset) {
  let { min: lo, max: hi } = boundsFor(preset);
  for (let index = 0; index < 70; index += 1) {
    const middle = (lo + hi) / 2;
    if (quotientAt(preset, middle) < K) lo = middle;
    else hi = middle;
  }
  return (lo + hi) / 2;
}

export function updateEquilibriumLab(state, action, value) {
  const next = normalize(state);
  if (action === 'eq-reset') return defaultEquilibriumLab();
  if (action === 'eq-preset' && EQUILIBRIUM_PRESETS.some(preset => preset.id === value)) {
    return { ...defaultEquilibriumLab(), preset: value };
  }
  if (action === 'eq-predict' && !next.revealed && PREDICTIONS.includes(value)) next.prediction = value;
  if (action === 'eq-observe' && next.prediction !== null) next.revealed = true;
  if (!next.revealed) return next;
  const preset = presetFor(next.preset);
  const { min, max } = boundsFor(preset);
  if (action === 'eq-extent' && (typeof value === 'number' || typeof value === 'string') && String(value).trim() !== '' && Number.isFinite(Number(value))) {
    next.extent = clamp(Number(value), min, max);
  }
  if (action === 'eq-step-back') next.extent = clamp(next.extent - STEP, min, max);
  if (action === 'eq-step-forward') next.extent = clamp(next.extent + STEP, min, max);
  if (action === 'eq-equilibrate') next.extent = equilibriumExtent(preset);
  return next;
}

function number(value) {
  if (value !== 0 && (Math.abs(value) < 0.001 || Math.abs(value) >= 10000)) return value.toExponential(2);
  return String(Number(value.toFixed(4)));
}
const button = (label, action, value = '', selected = false, disabled = false) => `<button type="button" class="btn${selected ? '' : ' light'}" style="min-height:44px" data-lab-action="${action}" data-value="${esc(value)}"${action === 'eq-predict' ? ` aria-pressed="${selected}"` : ''}${disabled ? ' disabled' : ''}>${label}</button>`;
const directionText = value => ({ forward: 'net forward reaction: A and B decrease; C increases', reverse: 'net reverse reaction: C decreases; A and B increase', balanced: 'no net reaction at equilibrium' })[value];

function mixtureFigure(model) {
  const ceiling = Math.max(model.a0 + model.c0 / 2, model.b0 + model.c0 / 2, model.c0 + 2 * Math.min(model.a0, model.b0));
  const entries = [['A', model.a, '#dcad7e'], ['B', model.b, '#8bb6b1'], ['C', model.c, '#b4a1ca']];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 450 195" role="img" aria-label="Model concentrations in mol per liter: A ${number(model.a)}, B ${number(model.b)}, C ${number(model.c)}. Bars show concentration, not particle counts." style="display:block;width:100%;max-width:480px;margin:12px auto;font-family:system-ui,sans-serif">
    <rect width="450" height="195" rx="15" fill="#f6f0e3"/>
    ${entries.map(([name, amount, color], index) => {
      const left = 48 + index * 133;
      const height = Math.max(0.3, amount / ceiling * 110);
      return `<rect x="${left}" y="28" width="88" height="110" rx="8" fill="#fffdf6" stroke="#bdb2a0"/><rect x="${left + 2}" y="${138 - height}" width="84" height="${height}" fill="${color}"/><text x="${left + 44}" y="158" text-anchor="middle" fill="#3a3934" font-size="17">${name}</text><text x="${left + 44}" y="180" text-anchor="middle" fill="#3a3934" font-size="14">${number(amount)} M</text>`;
    }).join('')}
  </svg>`;
}

export function renderEquilibriumLab(state) {
  const safe = normalize(state);
  const model = equilibriumModel(safe);
  const predictedCorrectly = safe.prediction === model.initialDirection;
  const controls = [['forward', 'Forward: make more C'], ['reverse', 'Reverse: make more A and B'], ['balanced', 'No net reaction']];
  const comparison = model.currentDirection === 'balanced' ? 'Q is within 0.1% of K' : model.Q < K ? 'Q is less than K' : 'Q is greater than K';
  const currentResult = model.currentDirection === 'balanced'
    ? 'The composition is approximately at equilibrium within this lab’s 0.1% tolerance.'
    : `${comparison}, so the model predicts ${directionText(model.currentDirection)}.`;
  return `<section class="lab-card" aria-label="Chatelle balances the reaction">
    <p class="eyebrow">Field lab</p><h3>Chatelle balances the reaction</h3>
    <p>The forge uses a reversible model reaction: <strong>A + B &lt;=&gt; 2 C</strong>. One A and one B form two C; the reverse reaction undoes that change.</p>
    <p><strong>K = 4</strong> describes the equilibrium ratio at this temperature. The current ratio is <strong>Q = [C]<sup>2</sup> / ([A][B])</strong>. Square C because its reaction coefficient is 2.</p>
    <p class="subtle">Closed ideal solution, fixed temperature and volume. Concentrations use M (mol/L), relative to the 1 M standard state; Q and K are dimensionless.</p>
    <label for="eq-preset">Choose a starting mixture</label><select id="eq-preset" data-lab-change="eq-preset" style="min-height:44px;max-width:100%">${EQUILIBRIUM_PRESETS.map(preset => `<option value="${preset.id}"${preset.id === safe.preset ? ' selected' : ''}>${preset.label}: A ${preset.a0}, B ${preset.b0}, C ${preset.c0} M</option>`).join('')}</select>
    ${mixtureFigure(model)}
    <p><strong>Predict the starting net direction.</strong> Which change will bring this mixture toward equilibrium?</p>
    <div class="lab-controls" role="group" aria-label="Initial reaction direction">${controls.map(([value, label]) => button(label, 'eq-predict', value, safe.prediction === value, safe.revealed)).join('')}</div>
    <div class="lab-controls">${button('Reveal the comparison', 'eq-observe', '', false, safe.prediction === null || safe.revealed)}${button('Start again', 'eq-reset')}</div>
    ${safe.revealed ? `<div class="lab-result" role="status"><strong>${predictedCorrectly ? 'Your prediction matches this model.' : 'Compare the ratio with your prediction.'}</strong><p>The starting Q is ${number(model.initialQ)}, with K = 4. The starting result is ${directionText(model.initialDirection)}.</p></div>
      <h4>Explore reaction progress</h4><p>You choose a possible composition along this reaction coordinate. The direction below says which way that mixture would now react. This control is <strong>reaction progress, not time</strong>; it does not simulate speed or spontaneous overshooting.</p>
      <label for="eq-extent">Extent x: ${number(model.x)} M</label><input id="eq-extent" type="range" data-lab-change="eq-extent" min="${model.bounds.min}" max="${model.bounds.max}" step="any" value="${model.x}" aria-describedby="eq-extent-help" style="width:100%;min-height:44px"/>
      <p id="eq-extent-help" class="subtle">Positive x uses A and B; negative x uses C. Use the slider or the step buttons. This lab uses the positive-concentration interval greater than ${number(-model.c0 / 2)} M and less than ${number(Math.min(model.a0, model.b0))} M. Zero-concentration endpoints are excluded so Q stays finite and positive.</p>
      <div class="lab-controls">${button('Decrease x by 0.05 M', 'eq-step-back', '', false, model.x - model.bounds.min <= AT_ENDPOINT)}${button('Increase x by 0.05 M', 'eq-step-forward', '', false, model.bounds.max - model.x <= AT_ENDPOINT)}${button('Find the equilibrium composition', 'eq-equilibrate')}</div>
      <p><strong>[A] = [A]<sub>0</sub> - x; [B] = [B]<sub>0</sub> - x; [C] = [C]<sub>0</sub> + 2x.</strong> Subscript 0 means the starting concentration.</p>
      <div style="overflow-x:auto"><table style="width:100%;text-align:left"><caption>Stoichiometric changes in mol/L</caption><thead><tr><th scope="col">Species</th><th scope="col">Start</th><th scope="col">Change</th><th scope="col">Now</th></tr></thead><tbody>
        <tr><th scope="row">A</th><td>${number(model.a0)}</td><td>-x</td><td>${number(model.a)}</td></tr><tr><th scope="row">B</th><td>${number(model.b0)}</td><td>-x</td><td>${number(model.b)}</td></tr><tr><th scope="row">C</th><td>${number(model.c0)}</td><td>+2x</td><td>${number(model.c)}</td></tr>
      </tbody></table></div>
      <div class="lab-result" role="status"><p><strong>Q = ${number(model.c)}<sup>2</sup> / (${number(model.a)} x ${number(model.b)}) = ${number(model.Q)}.</strong> ${currentResult}</p><p>Lab comparison tolerance: |Q/K - 1| &lt;= 0.001, or 0.1%. This numerical tolerance is not a physical interval of equilibrium. Exactly at Q = K, forward and reverse rates match and there is no net reaction. Molecules keep reacting; concentrations do not have to be equal. Calculations use full precision; displayed values are rounded.</p></div>` : ''}
    <p class="subtle" style="margin-top:18px">Learning only. Exploring this lab records exposure to the topic. It does not record a scored answer, independent check, or mastery result.</p>
  </section>`;
}
