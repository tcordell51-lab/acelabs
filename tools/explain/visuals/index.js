// index.js: one import for every explainer renderer. A page that shows
// explainers imports this module (and loads the classic scripts the renderers
// read: shared/smiles-drawer.min.js, shared/qr-figures.js,
// tools/bio/bio-real.js, the PAT engine and tools/explain/vendor/gc/lewis-layout.js).
import { render, has, types, resolvePanel, DRAWN } from './core.js';
import './bio.js';
import './bio-diagrams.js';
import './bio-tree.js';
import './bio-chart.js';
import './bio-schematics.js';
import './bio-punnett.js';
import { drawChoiceStructure } from './chem.js';
import './chem-oc.js';
import './chem-gc.js';
import { highlightBars } from './qr.js';
import { patQuestion } from './pat.js';
import './rc.js';
import { CATALOG, BUILT_TYPES } from './catalog.js';

// Every type the catalog calls built must have registered a renderer.
export function catalogGaps() { return BUILT_TYPES.filter((t) => !has(t)); }

export { render, has, types, resolvePanel, DRAWN, drawChoiceStructure, highlightBars, patQuestion, CATALOG };
