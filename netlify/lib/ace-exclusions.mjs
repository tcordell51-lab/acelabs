// Items that must never reach a student: outside the 2026 DAT outline, or defective.
// One list, scripts/bank/scope-exclusions.json (ids only, grouped by section, reason per id).
// Read by the private-bank functions (netlify/lib/ace-bank-store.mjs), scripts/build-ace-banks.mjs
// (data/*.json) and scripts/bank/build-private.mjs (forms and review queue).
//
// An id may be written with its bank prefix (qr:climb-1tb6pfn, oc:OC_lf003) or bare (qr-geo-0001,
// gc-0916). Both spellings match.

const PREFIXES = ['bio:', 'gc:', 'oc:', 'qr:', 'rc:'];

/** The exclusion file's contents -> a Set holding every id in both spellings. */
export function exclusionSet(json) {
  if (!json || typeof json !== 'object') throw new Error('scope exclusions missing');
  const set = new Set();
  for (const [key, group] of Object.entries(json)) {
    if (key === 'note' || !group || typeof group !== 'object') continue;
    for (const id of Object.keys(group)) { set.add(id); set.add(bare(id)); }
  }
  return set;
}

export function bare(id) {
  const s = String(id || '');
  for (const p of PREFIXES) if (s.startsWith(p)) return s.slice(p.length);
  return s;
}

export function isExcluded(id, set) {
  return !!id && (set.has(id) || set.has(bare(id)));
}
