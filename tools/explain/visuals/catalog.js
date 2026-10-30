// catalog.js: every visual type an explainer spec may name, which module
// renders it, and the fields a spec of that type must carry
// (explainer-standard.md, section 4.2; production-plan.md, section 4).
// Pure data, read by the browser (to check every built type registered a
// renderer) and by scripts/explainers/build.mjs (to refuse a spec whose type
// has no renderer yet). A type with built: false is planned, not drawable:
// a record that needs it waits, and the build names the gap.

export const CATALOG = {
  'bio.punnett': { module: 'bio', built: true, required: ['cross'], variants: { mode: ['xlinked', 'testcross'] } },
  'bio.hardy-weinberg': { module: 'bio', built: true, required: ['q2'] },
  'bio.osmolarity': { module: 'bio', built: true, required: ['solute', 'inside', 'units'] },
  'bio.real': { module: 'bio', built: true, required: ['view', 'params'], trueToLife: true },
  'bio.diagram': { module: 'bio', built: true, required: ['diagram', 'labels', 'focus'], variants: { diagram: ['mitochondrion', 'pathway', 'chromosomes', 'amniote-egg', 'junctions', 'thylakoid', 'codon', 'step-ladder', 'compare-table', 'acid-base', 'gland-density', 'gastric-gland', 'nephron-budget', 'glomerulus', 'etc-chain', 'ap-trace', 'collecting-duct'] } },
  'bio.tree': { module: 'bio', built: true, required: ['root'] },
  'bio.chart': { module: 'bio', built: true, required: ['kind'], variants: { kind: ['selection', 'levels', 'saturation'] } },
  'chem.molecule': { module: 'chem', built: true, required: ['smi'] },
  'chem.reaction': { module: 'chem', built: true, required: ['reactants', 'reagent', 'products'] },
  'chem.mechanism': { module: 'chem', built: true, required: ['ref'] },
  'chem.energy': { module: 'chem', built: true, required: ['points', 'names'] },
  'chem.lewis': { module: 'chem', built: true, required: ['molecule', 'ledger'] },
  'chem.trend': { module: 'chem', built: true, required: ['property', 'series', 'highlight'] },
  'chem.curve': { module: 'chem', built: true, required: ['kind'], variants: { kind: ['titration', 'gibbs', 'decay', 'half-lives', 'ph-scale', 'buffer', 'phase'] } },   // titration in chem.js; the rest in chem-gc.js
  'chem.ledger': { module: 'chem-gc', built: true, required: [] },   // blocks: tokens, shift, ice, chain, beakers, bars, rows, rules, sigfigs, formulas, scale, imf
  'chem.gas': { module: 'chem-gc', built: true, required: [] },   // states (cylinders) or mixture
  'chem.cell': { module: 'chem-gc', built: true, required: ['view'], variants: { view: ['concentration', 'e-to-k'] } },
  'chem.orbital': { module: 'chem-gc', built: true, required: ['config'] },
  'qr.figure': { module: 'qr', built: true, required: ['highlight'] },
  'qr.partwhole': { module: 'qr', built: true, required: ['total', 'parts', 'rest'] },
  'qr.triangle': { module: 'qr', built: true, required: ['a', 'b', 'angleDeg'] },
  'qr.tree': { module: 'qr', built: true, required: ['root', 'branches', 'result'] },
  'qr.numberline': { module: 'qr', built: true, required: ['min', 'max', 'step'] },
  'pat.angles': { module: 'pat', built: true, required: ['item'] },
  'pat.unfold': { module: 'pat', built: true, required: ['item'] },
  'pat.cubes': { module: 'pat', built: true, required: ['item'] },
  'rc.evidence': { module: 'rc', built: true, required: ['passage', 'spans'] },
  stack: { module: 'core', built: true, required: ['panels'] },

  // planned (production-plan.md, section 4): no renderer yet
  'bio.pedigree': { module: 'bio', built: false },
  'chem.spectrum': { module: 'chem', built: false },
  'chem.lab': { module: 'chem', built: false },
  'qr.work': { module: 'qr', built: false },
  'qr.dataset': { module: 'qr', built: false },
  'qr.plane': { module: 'qr', built: false },
  'qr.geometry': { module: 'qr', built: false },
  'qr.venn': { module: 'qr', built: false },
  'pat.keyhole': { module: 'pat', built: false },
  'pat.tfe': { module: 'pat', built: false },
  'pat.fold': { module: 'pat', built: false }
};

export const BUILT_TYPES = Object.keys(CATALOG).filter((k) => CATALOG[k].built && k !== 'stack');
