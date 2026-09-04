// route.js - which root is a missed question standing on?
//
// Pure, no imports, runs in node and the browser. Given whatever a caller
// knows about a miss (a Booster bank name, a content-library atom id, a portal
// subtopic, the question or correction text) it returns the roots the miss is
// most likely standing on, best first, each with a one-line reason in
// Thomas's framing. The map is deliberately small and readable: a root only
// appears where a coach would actually send the student.

export const ROOT_INFO = {
  'l1-skeletal':   { level: 1, concept: 'Reading skeletal structures' },
  'l1-charge':     { level: 1, concept: 'Formal charge and lone pairs' },
  'l1-geometry':   { level: 1, concept: 'Hybridization and geometry' },
  'l1-unsat':      { level: 1, concept: 'Sigma, pi and degrees of unsaturation' },
  'l1-groups':     { level: 1, concept: 'Functional groups' },
  'l1-naming':     { level: 1, concept: 'IUPAC naming basics' },
  'l2-bully':      { level: 2, concept: 'Electronegativity and partial charge' },
  'l2-resonance':  { level: 2, concept: 'Resonance' },
  'l2-induction':  { level: 2, concept: 'Inductive effect' },
  'l2-carbocation':{ level: 2, concept: 'Carbocation stability' },
  'l2-acidity':    { level: 2, concept: 'Acidity and CARDIO' },
  'l2-arrows':     { level: 2, concept: 'Nucleophiles, electrophiles and curved arrows' },
  'l3-wedge':      { level: 3, concept: 'Wedge and dash, R and S' },
  'l3-newman':     { level: 3, concept: 'Newman projections and conformations' },
  'l3-chair':      { level: 3, concept: 'Chair conformations' },
  'l3-fischer':    { level: 3, concept: 'Fischer projections' },
  'l3-isomers':    { level: 3, concept: 'Enantiomers, diastereomers, meso' },
  'l3-ez':         { level: 3, concept: 'E and Z' }
};

// Topic-level routes: a bank, atom, or subtopic name maps to roots in priority
// order. Keys are matched case-insensitively as substrings of the normalized
// topic string, so "Booster OChem: Conformations & Stereochemistry" hits
// "conformations" and "stereochem".
const TOPIC_ROUTES = [
  { keys: ['fundamentals', 'bonding', 'structure and bonding', 'oc-fundamentals'], roots: ['l1-skeletal', 'l1-charge', 'l1-geometry', 'l1-unsat', 'l2-bully', 'l2-resonance'], why: 'Fundamentals questions are the roots themselves: reading the drawing, the electron ledger, and shape.' },
  { keys: ['nomenclature', 'iupac', 'naming'], roots: ['l1-naming', 'l1-skeletal', 'l1-groups'], why: 'A naming miss is usually a counting miss: the chain, the carbons, or the face the suffix comes from.' },
  { keys: ['conformation', 'newman', 'chair', 'cyclohexane'], roots: ['l3-newman', 'l3-chair', 'l1-geometry'], why: 'Conformation questions stand on the Newman view and the chair, and both stand on tetrahedral shape.' },
  { keys: ['stereochem', 'oc-09', 'chirality', 'isomer'], roots: ['l3-wedge', 'l3-isomers', 'l3-fischer', 'l3-ez'], why: 'Every stereochemistry miss is one of four moves: read the wedge, count the flips, read the cross, or compare the sides.' },
  { keys: ['acid', 'base', 'oc-10', 'cardio', 'pka'], roots: ['l2-acidity', 'l2-induction', 'l2-resonance', 'l1-charge'], why: 'Acid-base questions are conjugate-base comfort: CARDIO, and the two things that make a base comfortable, induction and resonance.' },
  { keys: ['resonance', 'oc-12', 'carbocation', 'stability'], roots: ['l2-carbocation', 'l2-resonance'], why: 'Stability questions are the staircase and the couch.' },
  { keys: ['substitution', 'elimination', 'sn1', 'sn2', 'e1', 'e2', 'oc-08'], roots: ['l2-carbocation', 'l2-arrows', 'l3-wedge', 'l3-newman', 'l3-chair'], why: 'Substitution and elimination stand on the carbocation, the arrow, and the 3D picture of inversion and anti-periplanar geometry.' },
  { keys: ['alkene', 'alkyne', 'addition', 'markovnikov', 'oc-14', 'hydroboration', 'ozonolysis'], roots: ['l2-carbocation', 'l2-arrows', 'l3-ez', 'l1-geometry'], why: 'Addition outcomes are decided by where the carbocation is happiest, and the product geometry is E/Z.' },
  { keys: ['aromatic', 'eas', 'oc-15', 'oc-11', 'huckel', 'directing'], roots: ['l2-resonance', 'l2-induction', 'l1-unsat', 'l2-bully'], why: 'Aromatic questions are resonance questions wearing a ring: who donates, who withdraws, how many pi electrons.' },
  { keys: ['alcohol', 'ether', 'epoxide', 'oc-13', 'reagent', 'oxidation', 'reduction', 'redox'], roots: ['l1-groups', 'l2-arrows', 'l2-bully', 'l2-carbocation'], why: 'Reagent questions start with naming the face and knowing which atom is poor.' },
  { keys: ['carbonyl', 'aldehyde', 'ketone', 'carboxylic', 'ester', 'amide', 'oc-16', 'grignard', 'enolate', 'alpha'], roots: ['l2-bully', 'l2-arrows', 'l1-groups', 'l2-resonance', 'l2-acidity'], why: 'Carbonyl chemistry is one fact three chapters lean on: the oxygen is the bully, so the carbon is the target.' },
  { keys: ['spectroscopy', 'nmr', 'infrared', 'ir ', 'oc-17', 'spectra'], roots: ['l1-unsat', 'l1-skeletal', 'l1-groups'], why: 'Spectroscopy triage begins with unsaturation and counting hydrogens on the drawing.' },
  { keys: ['lab', 'separation', 'distillation', 'extraction', 'chromatography', 'intermolecular', 'boiling', 'solubility', 'polarity'], roots: ['l2-bully', 'l1-groups'], why: 'Physical property questions are polarity questions: find the electronegative atoms and the faces that hydrogen bond.' },
  { keys: ['mechanism', 'curved arrow', 'arrow pushing', 'reaction coordinate'], roots: ['l2-arrows', 'l2-bully', 'l2-carbocation'], why: 'A mechanism is attack, kick it off, attach, done with the right atoms.' },
  { keys: ['synthesis', 'roadmap', 'multi-step', 'multistep'], roots: ['l1-groups', 'l2-arrows', 'l2-carbocation', 'l2-bully'], why: 'Synthesis is reagent recognition chained: it starts with naming the face, then knowing who attacks whom.' },
  { keys: ['radical', 'halogenation'], roots: ['l2-carbocation', 'l2-resonance'], why: 'Radical stability is carbocation stability with one fewer electron.' }
];

// Text-level rules: a phrase in the question, the "what I missed" line, or the
// correction points at a root directly. Weight is how sure that phrase is.
const TEXT_RULES = [
  { root: 'l3-fischer', w: 5, re: /\bfischer\b/i },
  { root: 'l3-chair', w: 5, re: /\b(chair|axial|equatorial|ring[- ]?flip|1,3[- ]diaxial|cyclohexane)\b/i },
  { root: 'l3-newman', w: 5, re: /\b(newman|staggered|eclipsed|gauche|anti[- ]?periplanar|dihedral|conformer|conformation)/i },
  { root: 'l3-isomers', w: 5, re: /\b(enantiomer|diastereomer|meso|optically (in)?active|racemic|superimposable|mirror image|stereoisomer)/i },
  { root: 'l3-ez', w: 6, re: /(\bE\/Z\b|\(E\)|\(Z\)|\bE or Z\b|\bcis[- ]?trans\b|\bgeometric isomer|\bzusammen\b|\bentgegen\b)/i },
  { root: 'l3-ez', w: 3, re: /\b(cis|trans)\b.*\b(alkene|double bond)\b|\b(alkene|double bond)\b.*\b(cis|trans)\b/i },
  { root: 'l3-wedge', w: 5, re: /\b(wedge|dash|stereocenter|chiral cent|chirality|configuration|\(R\)|\(S\)|R or S|R\/S|CIP|priority)/i },
  { root: 'l3-wedge', w: 4, re: /\bassign\b.*\b(R|S)\b/i },
  { root: 'l2-carbocation', w: 5, re: /\b(carbocation|hydride shift|methyl shift|rearrang|most stable (cation|carbocation|radical)|tertiary|benzylic|allylic)\b/i },
  { root: 'l2-carbocation', w: 3, re: /\b(markovnikov|SN1|E1)\b/i },
  { root: 'l2-resonance', w: 5, re: /\b(resonance|contributor|delocaliz|conjugat)/i },
  { root: 'l2-induction', w: 7, re: /\b(inductive|induction|electron[- ]withdrawing|electron[- ]donating|EWG|EDG)\b/i },
  { root: 'l2-acidity', w: 5, re: /\b(pKa|acidity|acidic|stronger acid|weaker acid|most acidic|least acidic|basicity|most basic|conjugate base|deprotonat|protonat)/i },
  { root: 'l2-acidity', w: 1, re: /\b(acid|base)\b/i },
  { root: 'l2-arrows', w: 5, re: /\b(nucleophil|electrophil|curved arrow|arrow[- ]pushing|leaving group|backside|mechanism|attack)/i },
  { root: 'l2-bully', w: 5, re: /\b(electronegativ|dipole|partial (positive|negative)|delta (plus|minus)|polar bond|polarity|grignard|organolithium)/i },
  { root: 'l1-geometry', w: 5, re: /\b(hybridi|sp3|sp2|\bsp\b|bond angle|tetrahedral|trigonal|linear|geometry|orbital|VSEPR)/i },
  { root: 'l1-charge', w: 5, re: /\b(formal charge|lone pair|octet|valence electron|electron count)/i },
  { root: 'l1-unsat', w: 5, re: /\b(degrees? of unsaturation|unsaturation|hydrogen deficiency|DoU|IHD|sigma bond|pi bond|how many (pi|sigma))/i },
  { root: 'l1-groups', w: 5, re: /\b(functional group|ester|amide|anhydride|acid chloride|acyl|nitrile|ether|amine|aldehyde|ketone|carboxylic acid|alcohol)\b/i },
  { root: 'l1-naming', w: 5, re: /\b(IUPAC|nomenclature|name (the|this|of)|correct name|longest chain|numbering|locant|substituent|prefix|suffix)/i },
  { root: 'l1-skeletal', w: 5, re: /\b(skeletal|line[- ]angle|bond[- ]line|how many (carbons|hydrogens)|implicit hydrogen|molecular formula|condensed formula)/i },
  { root: 'l1-skeletal', w: 2, re: /\b(count(ed|ing)? (the )?carbons?|miscount)/i }
];

function norm(s){ return String(s == null ? '' : s).toLowerCase().replace(/&/g, ' and ').replace(/\s+/g, ' ').trim(); }

/**
 * rootsFor(miss) -> [{ id, level, concept, score, reason }] best first, at most `limit`.
 * miss: { topic, subtopic, atom, bank, text, whatIMissed, theCorrection, subject }
 * Anything missing is fine. Returns [] when nothing matches, or when the
 * subject is clearly not organic.
 */
export function rootsFor(miss, limit = 3){
  miss = miss || {};
  const subject = norm(miss.subject);
  if (subject && !/org|ochem|o\.?chem|organic/.test(subject) && /bio|gen|gchem|qr|quant|read|pat|percept/.test(subject)) return [];
  const topicStr = [miss.topic, miss.subtopic, miss.atom, miss.bank].map(norm).filter(Boolean).join(' | ');
  // what the student wrote about the miss (what I missed, the correction) is a
  // stronger signal than the question text, so it is weighed higher
  const qStr = [miss.text, miss.subtopic].map(s => String(s == null ? '' : s)).filter(Boolean).join(' \n ');
  const selfStr = [miss.whatIMissed, miss.theCorrection].map(s => String(s == null ? '' : s)).filter(Boolean).join(' \n ');
  const score = {}, reason = {};
  const bump = (id, w, why) => { score[id] = (score[id] || 0) + w; if (!reason[id] || w >= (reason[id].w || 0)) reason[id] = { w, why }; };
  // topic routes: earlier roots in a route score higher
  if (topicStr){
    for (const r of TOPIC_ROUTES){
      if (!r.keys.some(k => topicStr.includes(k))) continue;
      r.roots.forEach((id, i) => bump(id, Math.max(1, 4 - i), r.why));
    }
  }
  // text rules
  for (const [str, mult] of [[qStr, 1], [selfStr, 1.6]]){
    if (!str) continue;
    for (const r of TEXT_RULES){
      const m = str.match(r.re);
      if (m) bump(r.root, r.w * mult, 'The miss mentions "' + m[0].trim() + '", and that idea stands on ' + ROOT_INFO[r.root].concept.toLowerCase() + '.');
    }
  }
  return Object.keys(score)
    .map(id => ({ id, level: ROOT_INFO[id].level, concept: ROOT_INFO[id].concept, score: score[id], reason: reason[id].why }))
    .sort((a, b) => b.score - a.score || a.level - b.level)
    .slice(0, limit);
}

/** A URL into the Roots page that opens on the best root for this miss. */
export function rootsUrl(miss, base = ''){
  const hits = rootsFor(miss, 3);
  if (!hits.length) return base || './';
  const q = new URLSearchParams();
  if (miss.topic || miss.bank || miss.atom) q.set('from', [miss.bank, miss.topic, miss.atom].filter(Boolean).join(' · '));
  if (miss.subtopic) q.set('subtopic', miss.subtopic);
  const t = [miss.whatIMissed, miss.text].filter(Boolean).join(' ').slice(0, 240);
  if (t) q.set('miss', t);
  q.set('root', hits[0].id);
  return (base || './') + '?' + q.toString() + '#' + hits[0].id;
}
