import { esc, renderFigure, holesFigure } from './visuals.mjs';

// Six-by-six teaching geometry stays separate from the four-by-four item bank.
export const PAT_LAB = Object.freeze({
  size: 6,
  punches: Object.freeze(['3,0', '4,1', '5,4', '3,5']),
  horizontalPunches: Object.freeze(['0,1', '2,2', '4,0', '5,2']),
});
const AXES = ['vertical', 'horizontal'];
const choicesFor = axis => axis === 'horizontal' ? PAT_LAB.horizontalPunches : PAT_LAB.punches;
const initialFor = axis => ({ axis, punch: axis === 'horizontal' ? '2,2' : '4,1', selected: [], revealed: false });
const validCell = cell => typeof cell === 'string' && /^[0-5],[0-5]$/.test(cell);

export function defaultPatLab() {
  return initialFor('vertical');
}

function normalized(state) {
  if (!state || typeof state !== 'object') return defaultPatLab();
  // Missing axis accepts the earlier vertical teaching state. Unknown axes do
  // not preserve answers from an unrecognized problem configuration.
  if (state.axis !== undefined && !AXES.includes(state.axis)) return defaultPatLab();
  const axis = state.axis === 'horizontal' ? 'horizontal' : 'vertical';
  const clean = initialFor(axis);
  if (!choicesFor(axis).includes(state.punch)) return clean;
  clean.punch = state.punch;
  if (Array.isArray(state.selected)) clean.selected = [...new Set(state.selected.filter(validCell))].sort();
  clean.revealed = state.revealed === true && clean.selected.length > 0;
  return clean;
}

/** Immutable prediction/reveal transitions; no scored evidence or storage. */
export function updatePatLab(state, action, value) {
  const next = normalized(state);
  if (action === 'reset') return initialFor(next.axis);
  if (action === 'axis' && AXES.includes(value)) return initialFor(value);
  if (action === 'punch' && choicesFor(next.axis).includes(value)) {
    return { ...initialFor(next.axis), punch: value };
  }
  if (action === 'cell' && !next.revealed && validCell(value)) {
    next.selected = next.selected.includes(value)
      ? next.selected.filter(cell => cell !== value)
      : [...next.selected, value].sort();
  }
  if (action === 'observe' && next.selected.length > 0) next.revealed = true;
  return next;
}

const button = (label, action, disabled = false) => `<button type="button" class="btn${action === 'reset' ? ' light' : ''}" data-lab-action="${esc(action)}" style="min-height:44px;white-space:normal"${disabled ? ' disabled' : ''}>${esc(label)}</button>`;
const select = (label, action, current, options) => `<label>${esc(label)}<select data-lab-change="${esc(action)}" style="min-height:44px;width:100%">${options.map(([value, text]) => `<option value="${esc(value)}"${current === value ? ' selected' : ''}>${esc(text)}</option>`).join('')}</select></label>`;

export function renderPatLab(state) {
  const safe = normalized(state);
  const [px, py] = safe.punch.split(',').map(Number);
  const vertical = safe.axis === 'vertical';
  const mirror = vertical ? [PAT_LAB.size - 1 - px, py] : [px, PAT_LAB.size - 1 - py];
  const holes = [[px, py], mirror];
  const expected = holes.map(point => point.join(',')).sort();
  const correct = safe.selected.length === expected.length && expected.every((cell, i) => safe.selected[i] === cell);
  const folding = vertical ? 'Fold the left half onto the right half along the middle vertical crease.' : 'Fold the bottom half onto the top half along the middle horizontal crease.';
  const locations = vertical
    ? `The holes are in row ${py + 1}, columns ${mirror[0] + 1} and ${px + 1}.`
    : `The holes are in column ${px + 1}, rows ${py + 1} and ${mirror[1] + 1}.`;
  const explanation = vertical
    ? `The row stays the same. The column changes from ${px + 1} to ${mirror[0] + 1}: on this six-column sheet, the paired column numbers add to 7. No horizontal crease was used, so the row does not change.`
    : `The column stays the same. The row changes from ${py + 1} to ${mirror[1] + 1}: on this six-row sheet, the paired row numbers add to 7. No vertical crease was used, so the column does not change.`;
  const cells = Array.from({ length: PAT_LAB.size ** 2 }, (_, index) => {
    const x = index % PAT_LAB.size, y = Math.floor(index / PAT_LAB.size), id = `${x},${y}`;
    const selected = safe.selected.includes(id);
    return `<button type="button" data-lab-action="cell" data-value="${id}" aria-label="Row ${y + 1}, column ${x + 1}" aria-pressed="${selected}"${safe.revealed ? ' disabled' : ''} style="min-width:44px;min-height:44px;padding:2px;border:1px solid #8fa8b8;border-radius:5px;background:${selected ? '#36546d' : '#fffef8'};color:${selected ? '#fff' : '#36546d'};font-size:12px">${selected ? 'Hole' : `${y + 1},${x + 1}`}</button>`;
  }).join('');
  return `<section class="lab-card pat-lab" aria-label="Puncta and the mirrored holes">
    <style>.pat-lab p{font-size:14px}.pat-lab .eyebrow{font-size:10px}.pat-lab .subtle{font-size:12px}.pat-lab .lab-controls label{flex:1 1 220px;min-width:0}.pat-lab .pat-fold svg{display:block;width:100%;height:auto}.pat-lab .pat-grid{display:grid;grid-template-columns:repeat(6,minmax(44px,1fr));gap:3px;max-width:360px;margin:16px auto}.pat-lab .pat-grid-wrap{overflow-x:auto}.pat-lab .pat-answer svg{width:100%;height:auto}@media(max-width:380px){.pat-lab{padding:10px}.pat-lab .pat-grid{gap:2px}}</style>
    <p class="eyebrow">Field lab</p><h3>Puncta and the mirrored holes</h3>
    <p>A square sheet has six rows and six columns. Choose a fold, punch through both layers at the marked location, then predict the opened sheet. The sheet does not turn or twist.</p>
    <div class="lab-controls">
      ${select('Fold direction', 'axis', safe.axis, [['vertical', 'Vertical crease: left folds right'], ['horizontal', 'Horizontal crease: bottom folds up']])}
      ${select(vertical ? 'Punch through the folded right half' : 'Punch through the folded top half', 'punch', safe.punch, choicesFor(safe.axis).map(value => {
        const [x, y] = value.split(',').map(Number); return [value, `Row ${y + 1}, column ${x + 1}`];
      }))}
    </div>
    <p><strong>${esc(folding)}</strong> Start flat, make that fold, then punch. Solid outlines show the paper present; the dashed square marks the original sheet.</p>
    <div class="pat-fold">${renderFigure({ type: 'fold', axis: safe.axis, punch: [px, py], size: PAT_LAB.size })}</div>
    <p><strong>Predict the opened sheet.</strong> Select every square that will contain a hole. Select it again to remove it. Rows run top to bottom; columns run left to right. Each button reads row, column.</p>
    <div class="pat-grid-wrap"><div class="pat-grid" role="group" aria-label="Predicted unfolded hole pattern">${cells}</div></div>
    <div class="lab-controls">
      ${button('Commit the pattern and unfold', 'observe', !safe.selected.length || safe.revealed)}
      ${button('Start this fold again', 'reset')}
    </div>
    ${safe.revealed ? `<div class="lab-result" role="status"><strong>${correct ? 'Your prediction matches this model.' : 'A useful difference to notice.'}</strong>
      <div class="pat-answer" style="max-width:190px;margin:15px auto">${holesFigure({ holes, size: PAT_LAB.size })}</div>
      <p>${esc(locations)}</p><p>Opening the fold reflects the punch across the ${safe.axis} crease. Both holes lie the same distance from that crease. ${esc(explanation)}</p>
      <p>Two layers were punched, so this one-crease example opens to two holes. Change the fold direction or punch location to try another prediction.</p>
    </div>` : ''}
    <p class="subtle" style="margin-top:18px">Learning only. This guided lab is exposure and practice, not a scored answer, independent check, or mastery result.</p>
  </section>`;
}
