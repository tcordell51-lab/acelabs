import { esc } from './visuals.mjs';

// Original DATQUEST guided model. No scored-answer or storage API is used here.
// Principles checked against OpenStax Biology 2e 4.3/4.4 and the NCBI-hosted
// Molecular Biology of the Cell section on ER targeting; no source art is reused.
const SOURCES = [
  ['OpenStax Biology 2e: endomembrane system', 'https://openstax.org/books/biology-2e/pages/4-4-the-endomembrane-system-and-proteins'],
  ['OpenStax Biology 2e: ribosomes and the nucleus', 'https://openstax.org/books/biology-2e/pages/4-3-eukaryotic-cells'],
  ['Molecular Biology of the Cell: ER targeting', 'https://www.ncbi.nlm.nih.gov/books/NBK26841/'],
];

const ROUTES = {
  secreted: [
    {
      title: 'ER-associated translation and entry', diagram: 'er',
      why: 'Targeting information in the growing protein brings the translating ribosome to the cytosolic face of the rough ER. In this example, the protein enters the ER interior, called the lumen, as it is made.',
      alt: 'A ribosome on the cytosolic surface of the ER feeds a growing protein through a membrane channel into the ER lumen.',
    },
    {
      title: 'Transport vesicle', diagram: 'transport',
      why: 'A transport vesicle buds from the ER with this soluble protein inside. The carrier delivers it to the receiving side of the Golgi.',
      alt: 'The protein is enclosed inside a membrane-bound transport vesicle.',
    },
    {
      title: 'Golgi modification and sorting', diagram: 'golgi',
      why: 'The Golgi processes and sorts the cargo. Appropriate modifications and sorting help prepare this protein for its destination; the Golgi does not translate it from mRNA.',
      alt: 'A schematic stack of Golgi compartments contains the protein cargo.',
    },
    {
      title: 'Secretory vesicle', diagram: 'secretory',
      why: 'The cargo leaves the Golgi in a secretory vesicle headed to the plasma membrane. It remains inside the carrier until fusion releases it.',
      alt: 'The protein is enclosed inside a secretory vesicle on its way to the plasma membrane.',
    },
    {
      title: 'Plasma membrane and exocytosis', diagram: 'fusion',
      why: 'The vesicle membrane fuses with the plasma membrane. Its interior opens to the outside, releasing the soluble protein by exocytosis. The protein does not cross the lipid bilayer to escape.',
      alt: 'A vesicle has fused with the plasma membrane. Its open interior connects to the outside, where the soluble protein is released.',
    },
  ],
  cytosolic: [
    {
      title: 'Translation on a free cytosolic ribosome', diagram: 'free',
      why: 'For this target, translation continues on a ribosome that is free in the cytosol. No ER-targeting step is needed for the selected protein.',
      alt: 'A free ribosome makes the selected protein in the cytosol, without an ER membrane around it.',
    },
    {
      title: 'Protein remains in the cytosol', diagram: 'cytosol',
      why: 'This protein is released and works in the cytosol. Its selected destination does not require the ER/Golgi route. Other proteins made on free ribosomes can have other destinations.',
      alt: 'The completed selected protein remains in the cytosol, outside membrane-bound organelles.',
    },
  ],
};
const TARGETS = ['secreted', 'cytosolic'];
const PREDICTIONS = ['er', 'free'];

export function defaultCargoLab() {
  return { mode: 'cargo', target: 'secreted', prediction: null, revealed: false, step: 0 };
}

function normalized(state) {
  const clean = defaultCargoLab();
  if (!state || typeof state !== 'object') return clean;
  if (TARGETS.includes(state.target)) clean.target = state.target;
  if (PREDICTIONS.includes(state.prediction)) clean.prediction = state.prediction;
  clean.revealed = state.revealed === true && clean.prediction !== null;
  if (clean.revealed && Number.isInteger(state.step)) {
    clean.step = Math.max(0, Math.min(ROUTES[clean.target].length - 1, state.step));
  }
  return clean;
}

/** Immutable state transitions; reset keeps the chosen target for another try. */
export function updateCargoLab(state, action, value) {
  const next = normalized(state);
  if (action === 'reset') return { ...defaultCargoLab(), target: next.target };
  if (action === 'target' && TARGETS.includes(value)) {
    return { ...defaultCargoLab(), target: value };
  }
  if (action === 'predict' && !next.revealed && PREDICTIONS.includes(value)) next.prediction = value;
  if (action === 'observe' && next.prediction !== null && !next.revealed) {
    next.revealed = true;
    next.step = 0;
  }
  if (next.revealed && action === 'next') next.step = Math.min(ROUTES[next.target].length - 1, next.step + 1);
  if (next.revealed && action === 'back') next.step = Math.max(0, next.step - 1);
  return next;
}

const button = (label, action, value = '', { selected = false, disabled = false, primary = false } = {}) =>
  `<button type="button" class="btn${primary || selected ? '' : ' light'}${selected ? ' selected' : ''}" style="min-height:44px;max-width:100%;white-space:normal" data-lab-action="${esc(action)}" data-value="${esc(value)}"${disabled ? ' disabled' : ''}${action === 'predict' ? ` aria-pressed="${selected}"` : ''}>${esc(label)}</button>`;
const svgText = (x, y, text, size = 14) => `<text x="${x}" y="${y}" text-anchor="middle" font-size="${size}" fill="#234139">${esc(text)}</text>`;
const protein = (x, y, scale = 1) => `<path d="M-23 0Q-13 -20 -3 -6T16 -9Q31 -1 17 10T-4 13Q-20 20 -23 0Z" transform="translate(${x} ${y}) scale(${scale})" fill="none" stroke="#b87143" stroke-width="5" stroke-linecap="round"/>`;
const ribosome = (x, y) => `<g transform="translate(${x} ${y})"><ellipse cy="-24" rx="25" ry="10" fill="#cd9e93" stroke="#805e5a" stroke-width="2"/><ellipse cy="0" rx="32" ry="17" fill="#e8bca8" stroke="#805e5a" stroke-width="2"/><path d="M-48 -14H46" stroke="#6c8b76" stroke-width="3" stroke-linecap="round"/></g>`;

function diagram(step) {
  let drawing = '';
  switch (step.diagram) {
    case 'er':
      drawing = `<rect x="38" y="98" width="284" height="72" rx="19" fill="#d4e6d3" stroke="#6d9b8e" stroke-width="4"/>
        <rect x="128" y="91" width="20" height="18" fill="#f6f2e4"/>
        <path d="M128 95v16M148 95v16" stroke="#789e95" stroke-width="4"/>
        ${ribosome(138, 80)}<path d="M138 96v20q-13 10 0 16t0 16" fill="none" stroke="#b87143" stroke-width="5" stroke-linecap="round"/>
        ${svgText(138, 35, 'Ribosome')}${svgText(275, 74, 'Cytosol')}${svgText(250, 140, 'ER lumen')}${svgText(180, 196, 'Protein enters the ER as it is made', 13)}`;
      break;
    case 'transport':
    case 'secretory':
      drawing = `<ellipse cx="180" cy="106" rx="58" ry="55" fill="#dfebd7" stroke="${step.diagram === 'transport' ? '#709e95' : '#a68e81'}" stroke-width="5"/>
        <ellipse cx="180" cy="106" rx="50" ry="47" fill="none" stroke="#b8ceb6" stroke-width="2"/>${protein(180, 106)}
        ${svgText(180, 30, step.diagram === 'transport' ? 'Transport vesicle' : 'Secretory vesicle')}${svgText(180, 189, 'Protein inside a membrane-bound carrier', 13)}`;
      break;
    case 'golgi':
      drawing = [0, 1, 2, 3].map(i => `<path d="M100 ${65 + i * 25}Q180 ${43 + i * 25} 260 ${65 + i * 25}Q272 ${76 + i * 25} 255 ${80 + i * 25}Q180 ${60 + i * 25} 105 ${80 + i * 25}Q88 ${77 + i * 25} 100 ${65 + i * 25}Z" fill="${i % 2 ? '#e8c6ad' : '#c5dac5'}" stroke="#8c9d89" stroke-width="2"/>`).join('');
      drawing += protein(180, 112, .3) + svgText(180, 28, 'Golgi apparatus') + svgText(180, 195, 'Processing and sorting the cargo', 13);
      break;
    case 'fusion':
      drawing = `<path d="M20 40H246V73C192 67 192 153 246 147V182H20Z" fill="#deebd7"/>
        <path d="M246 40V73C192 67 192 153 246 147V182" fill="none" stroke="#70998c" stroke-width="6"/>
        <path d="M225 110H275l-8-7m8 7-8 7" fill="none" stroke="#8b7650" stroke-width="3" stroke-linecap="round"/>${protein(309, 109, .65)}
        ${svgText(88, 28, 'Cytosol')}${svgText(301, 28, 'Outside')}${svgText(180, 204, 'Fusion opens the vesicle to the outside', 13)}`;
      break;
    case 'free':
      drawing = `${svgText(180, 31, 'Cytosol')}${ribosome(180, 85)}<path d="M180 101v19q-15 9 0 19t0 18" fill="none" stroke="#b87143" stroke-width="5" stroke-linecap="round"/>${svgText(180, 192, 'Free ribosome and growing protein', 13)}`;
      break;
    case 'cytosol':
      drawing = `${svgText(180, 31, 'Cytosol')}${protein(180, 105, 1.65)}${svgText(180, 192, 'The selected protein remains here', 13)}`;
      break;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 222" role="img" aria-label="${esc(step.alt)}" style="display:block;width:100%;max-width:440px;height:auto;margin:12px auto;font-family:system-ui,sans-serif"><rect x="1" y="1" width="358" height="220" rx="18" fill="#f6f2e4" stroke="#cbd7c2"/>${drawing}</svg>`;
}

export function renderCargoLab(state) {
  const safe = normalized(state);
  const route = ROUTES[safe.target];
  const current = route[safe.step];
  const correct = safe.prediction === (safe.target === 'secreted' ? 'er' : 'free');
  return `<section class="lab-card cargo-lab" aria-label="Parcelot's cargo route">
    <style>.cargo-lab p{font-size:14px}.cargo-lab .eyebrow{font-size:10px}.cargo-lab .subtle{font-size:12px}.cargo-lab h4{font-size:17px}</style>
    <p class="eyebrow">Organelle Quarter field lab</p><h3>Parcelot's cargo route</h3>
    <p>Choose a soluble protein target in a representative eukaryotic cell. For secretion, use its conventional pathway. This model does not cover every protein or transport route.</p>
    <label style="display:block;max-width:100%">Protein target
      <select data-lab-change="target" style="display:block;width:100%;min-height:44px;margin-top:6px;padding:10px;border:1px solid #bccbac;border-radius:8px;background:#fffef6;color:#19372d">
        <option value="secreted"${safe.target === 'secreted' ? ' selected' : ''}>Protein for secretion outside the cell</option>
        <option value="cytosolic"${safe.target === 'cytosolic' ? ' selected' : ''}>Protein that stays in the cytosol</option>
      </select>
    </label>
    <p><strong>Predict:</strong> where will the ribosome work during translation, after any targeting step for this protein? This asks about the location after targeting, not where translation first begins.</p>
    <div class="lab-controls" role="group" aria-label="Predict the translation site" style="display:flex;flex-wrap:wrap;gap:8px">
      ${button('Associated with the rough ER', 'predict', 'er', { selected: safe.prediction === 'er', disabled: safe.revealed })}
      ${button('Free in the cytosol', 'predict', 'free', { selected: safe.prediction === 'free', disabled: safe.revealed })}
    </div>
    <div class="lab-controls" style="display:flex;flex-wrap:wrap;gap:8px;margin-top:12px">
      ${button('Observe the route', 'observe', '', { disabled: safe.prediction === null || safe.revealed, primary: true })}
      ${button('Predict this target again', 'reset')}
    </div>
    ${safe.revealed ? `<div class="lab-result" aria-live="polite" aria-atomic="true">
      <p><strong>${correct ? 'Your prediction fits this target.' : 'A useful difference to notice.'}</strong> ${safe.target === 'secreted' ? 'For this secreted target, the ribosome becomes ER-associated.' : 'For this cytosolic target, the ribosome stays free in the cytosol.'} Follow each stop to see why.</p>
      <p class="eyebrow">Step ${safe.step + 1} of ${route.length}</p><h4>${esc(current.title)}</h4>
      ${diagram(current)}<p>${esc(current.why)}</p>
      <p class="subtle">Schematic locations and shapes; not a scale drawing.</p>
    </div>
    <nav class="lab-controls" aria-label="Cargo route steps" style="display:flex;flex-wrap:wrap;gap:8px">
      ${button('Back', 'back', '', { disabled: safe.step === 0 })}
      ${button('Next stop', 'next', '', { disabled: safe.step === route.length - 1, primary: true })}
    </nav>
    <p><strong>Same ribosome kind, different targeting.</strong> Free and ER-associated ribosomes are not permanent classes. In this model, translation begins in the cytosol; the growing protein's targeting information determines whether the ribosome associates with the ER.</p>
    <p>The nucleus produces mRNA from DNA; ribosomes make protein. This newly made cargo does not pass through the nucleus first.</p>
    <details><summary>Sources for this model</summary><ul>${SOURCES.map(([title, url]) => `<li><a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(title)}</a></li>`).join('')}</ul></details>` : ''}
    <p class="subtle" style="margin-top:18px">Learning only. This guided lab is exposure and practice, not a scored answer, independent check, or mastery result.</p>
  </section>`;
}
