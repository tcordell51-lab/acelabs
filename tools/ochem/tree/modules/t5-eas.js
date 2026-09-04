// The Tree of Organic, Level 5, Branch 5: The ring attacks, then gives the proton back.
// Electrophilic aromatic substitution and where the arenium ion puts its plus. No imports (contract).
//
// Mechanism stage: every state is a list of species (SMILES drawn by api.drawSmiles, one inner
// <svg> each, placed at one shared scale inside one outer <svg>), curved gold arrows anchored to
// the rendered atom labels and to vertices rebuilt from the bond lines. Arenium ions are written
// as explicit Kekule structures so the drawer renders them, and the plus badge and the explicit
// hydrogen are drawn here, because the drawer will not show a charge on carbon. Same engine as
// t5-proton and t5-acyl.

export const meta = {
  id: 't5-eas',
  level: 5,
  order: 5,
  needs3D: false,
  title: 'The ring attacks, then gives the proton back',
  concept: 'Electrophilic aromatic substitution',
  tagline: 'Make the electrophile, form the arenium ion, take the proton, get the ring back.',
  story: 'Aromatic rings are rich but they are not eager, so first you build an electrophile hungry enough to be worth it. FeBr3 pulls on Br2, sulfuric acid strips water out of nitric acid to make the nitronium ion, AlCl3 pulls the chloride off an acyl chloride to make the acylium. Then the ring attacks, and for one moment the ring is not aromatic: that is the arenium ion, and its plus is spread over the two ortho carbons and the para carbon in three resonance forms. Then a base takes the proton off the carbon that was attacked and aromaticity comes right back. That is why it substitutes instead of adding. Directing falls straight out of the arenium: a donor is happy when the plus lands next to it, and a withdrawer is not. Rule of thumb: draw the three forms and see where the plus goes.',
  moveName: 'Make the electrophile, attack, draw the three forms, give the proton back',
  move: [
    'Name the electrophile the reagent pair makes: Br+ from Br2 with FeBr3, the nitronium ion from HNO3 with H2SO4, an acylium from an acyl chloride with AlCl3, a carbocation from an alkyl halide with AlCl3.',
    'The ring pi bond attacks it. Draw the arenium ion: one sp3 carbon carrying both an H and the new group, and a plus on the ring.',
    'Draw all three resonance forms. The plus sits on the two carbons ortho to the sp3 carbon and on the one para to it, and never on the sp3 carbon itself.',
    'A base takes the proton off that sp3 carbon, the C-H electrons swing back in as a pi bond, and the ring is aromatic again.',
    'For directing, run step three on the substituted ring: if a plus lands on the carbon holding the group, ask whether that group is happy to hold it.'
  ],
  trap: 'Careful: aromatic rings substitute, they do not add, so the halogen never ends up with a partner on the next carbon the way it would on an alkene. And the arenium ion is not aromatic for that one step, which is the whole reason the ring is willing to hand the proton back.',
  holdsUp: ['Bromination, nitration, sulfonation', 'Friedel-Crafts alkylation and acylation', 'Ortho, para and meta directing', 'Activating versus deactivating', 'Planning a disubstituted benzene'],
  drill: 'Booster OChem: Aromaticity & Benzene Reactions'
};

// Every SMILES this module draws. Arenium ions are explicit Kekule forms.
export const SMILES = [
  'C1=CC=CC=C1', 'BrBr', 'BrC1[CH+]C=CC=C1', 'BrC1C=C[CH+]C=C1', 'BrC1C=CC=C[CH+]1', '[Br-]', 'Brc1ccccc1', 'Br',
  'COC1=CC=CC=C1', 'O=[N+]=O', 'O', '[OH3+]',
  'COC1=C[CH+]C([N+](=O)[O-])C=C1', 'CO[C+]1C=CC([N+](=O)[O-])C=C1', 'C1=CC([N+](=O)[O-])[CH+]C=C1OC', 'C[O+]=C1C=CC([N+](=O)[O-])C=C1',
  'COc1ccc([N+](=O)[O-])cc1',
  '[O-][N+](=O)C1=CC=CC=C1', '[O-][N+](=O)C1=CC=CC([N+](=O)[O-])[CH+]1', '[O-][N+](=O)C1=CC([N+](=O)[O-])[CH+]C=C1', '[O-][N+](=O)C1=CC([N+](=O)[O-])C=C[CH+]1',
  '[O-][N+](=O)c1cccc([N+](=O)[O-])c1',
  '[Br+]', 'CC#[O+]', 'C[CH+]C', 'CC(=O)Cl', 'CCCCl', 'CC(=O)c1ccccc1', 'CC(C)c1ccccc1', 'Cc1ccccc1', 'Clc1ccccc1', 'Nc1ccccc1'
];

/* ------------------------------------------------------------------ */
/* Species: names plus the marks the drawer cannot show.                */
/* The cation carbon of an arenium ion is found by its shape: it is the  */
/* only ring carbon with two neighbors and no double bond. The sp3       */
/* carbon is the only one with three neighbors and no double bond.       */
/* ------------------------------------------------------------------ */
const PLUS_C = { v: { deg: 2, order: 'single' } };
const SP3_C = { v: { deg: 3, order: 'single' } };
const plusMark = at => ({ id: 'plus', kind: '+', at: at || PLUS_C });
const hMark = at => ({ id: 'H', kind: 'H', at: at || SP3_C });

const SPECIES = {
  'C1=CC=CC=C1': { name: 'benzene', marks: [] },
  'BrBr': { name: 'Br2, polarized by FeBr3', marks: [] },
  'BrC1[CH+]C=CC=C1': { name: 'the arenium ion', marks: [plusMark(), hMark()] },
  'BrC1C=C[CH+]C=C1': { name: 'the arenium ion, second form', marks: [plusMark()] },
  'BrC1C=CC=C[CH+]1': { name: 'the arenium ion, third form', marks: [plusMark()] },
  '[Br-]': { name: 'bromide', marks: [{ id: 'lpBr', kind: 'lp', at: { t: 'Br' } }] },
  'Brc1ccccc1': { name: 'bromobenzene', marks: [] },
  'Br': { name: 'HBr', marks: [] },
  'COC1=CC=CC=C1': { name: 'anisole', marks: [] },
  'O=[N+]=O': { name: 'the nitronium ion, NO2+', marks: [] },
  'O': { name: 'water', marks: [{ id: 'lpO', kind: 'lp', at: { t: 'O' } }] },
  '[OH3+]': { name: 'hydronium, H3O+', marks: [] },
  'COC1=C[CH+]C([N+](=O)[O-])C=C1': { name: 'the arenium ion', marks: [plusMark(), hMark({ v: { deg: 3, order: 'single', notnb: 'O' } })] },
  'CO[C+]1C=CC([N+](=O)[O-])C=C1': { name: 'the arenium ion, plus on the carbon holding the methoxy', marks: [plusMark({ v: { deg: 3, order: 'single', nb: 'O' } })] },
  'C1=CC([N+](=O)[O-])[CH+]C=C1OC': { name: 'the arenium ion, third form', marks: [plusMark()] },
  'C[O+]=C1C=CC([N+](=O)[O-])C=C1': { name: 'the extra form: the oxygen carries the plus', marks: [] },
  'COc1ccc([N+](=O)[O-])cc1': { name: 'para-nitroanisole', marks: [] },
  '[O-][N+](=O)C1=CC=CC=C1': { name: 'nitrobenzene', marks: [] },
  '[O-][N+](=O)C1=CC=CC([N+](=O)[O-])[CH+]1': { name: 'the arenium ion', marks: [plusMark(), hMark()] },
  '[O-][N+](=O)C1=CC([N+](=O)[O-])[CH+]C=C1': { name: 'the arenium ion, second form', marks: [plusMark()] },
  '[O-][N+](=O)C1=CC([N+](=O)[O-])C=C[CH+]1': { name: 'the arenium ion, third form', marks: [plusMark()] },
  '[O-][N+](=O)c1cccc([N+](=O)[O-])c1': { name: 'meta-dinitrobenzene', marks: [] },
  '[Br+]': { name: 'Br+, the working electrophile', marks: [] },
  'CC#[O+]': { name: 'the acylium ion', marks: [] },
  'C[CH+]C': { name: 'the isopropyl cation', marks: [plusMark({ v: { deg: 2 } })] },
  'CC(=O)Cl': { name: 'acetyl chloride', marks: [] },
  'CCCCl': { name: '1-chloropropane', marks: [] },
  'CC(=O)c1ccccc1': { name: 'acetophenone', marks: [] },
  'CC(C)c1ccccc1': { name: 'isopropylbenzene, after a hydride shift', marks: [] },
  'Cc1ccccc1': { name: 'toluene', marks: [] },
  'Clc1ccccc1': { name: 'chlorobenzene', marks: [] },
  'Nc1ccccc1': { name: 'aniline', marks: [] }
};
const nameOf = smi => (SPECIES[smi] && SPECIES[smi].name) || smi;

/* ------------------------------------------------------------------ */
/* The arenium ions and their resonance forms.                          */
/* ------------------------------------------------------------------ */
const ARENIUM = {
  bromination: [
    { smi: 'BrC1[CH+]C=CC=C1', label: 'plus next door', kind: 'ortho' },
    { smi: 'BrC1C=C[CH+]C=C1', label: 'plus across the ring', kind: 'para' },
    { smi: 'BrC1C=CC=C[CH+]1', label: 'plus on the other side', kind: 'ortho' }
  ],
  anisole: [
    { smi: 'COC1=C[CH+]C([N+](=O)[O-])C=C1', label: 'plus next door', kind: 'ortho' },
    { smi: 'CO[C+]1C=CC([N+](=O)[O-])C=C1', label: 'plus on the carbon holding the methoxy', kind: 'para' },
    { smi: 'C1=CC([N+](=O)[O-])[CH+]C=C1OC', label: 'plus on the other side', kind: 'ortho' },
    { smi: 'C[O+]=C1C=CC([N+](=O)[O-])C=C1', label: 'the oxygen takes the plus itself', kind: 'donor', extra: true }
  ],
  nitrobenzene: [
    { smi: '[O-][N+](=O)C1=CC=CC([N+](=O)[O-])[CH+]1', label: 'plus next door', kind: 'ortho' },
    { smi: '[O-][N+](=O)C1=CC([N+](=O)[O-])[CH+]C=C1', label: 'plus on the other side', kind: 'ortho' },
    { smi: '[O-][N+](=O)C1=CC([N+](=O)[O-])C=C[CH+]1', label: 'plus across the ring', kind: 'para' }
  ]
};
function areniumState(key, withs, side, label){
  return { main: ARENIUM[key].map(f => f.smi), mainLabels: ARENIUM[key].map(f => f.label), with: withs, side, label, arenium: key };
}

/* ------------------------------------------------------------------ */
/* The three curated mechanisms.                                        */
/* ------------------------------------------------------------------ */
const RING_PI = { b: 'cc2', pick: 'right' };
const MECHANISMS = [
  {
    id: 'bromination', chip: 'Bromination of benzene', name: 'bromination of benzene', reagent: 'Br2, FeBr3',
    roots: ['l2-resonance', 'l2-arrows', 'l1-unsat'],
    after: 'Two steps, and the middle picture is the whole thing. The arenium ion is not aromatic, so the ring is desperate to get back, and the cheapest way back is to hand over the proton on that sp3 carbon. That is why the ring substitutes instead of adding: adding would cost it aromaticity forever.',
    states: [
      { main: 'C1=CC=CC=C1', with: ['BrBr'], side: 'right', label: 'benzene + Br2 with FeBr3' },
      areniumState('bromination', ['[Br-]'], 'right', 'the arenium ion, all three resonance forms, plus bromide'),
      { main: 'Brc1ccccc1', with: ['Br'], side: 'right', label: 'bromobenzene + HBr. The circle is back.' }
    ],
    steps: [
      {
        name: 'the ring attacks', nuc: 'a pi bond of the ring', ele: 'the near bromine of the polarized Br2',
        say: 'Br2 by itself is not electrophilic enough for a lazy ring. FeBr3 grabs one bromine and pulls, leaving the other one very electron poor. Now the ring pi bond attacks it, and the Br-Br electrons fall onto the leaving bromine. The ring just gave up its aromaticity to do that, which is why it needed a good electrophile.',
        arrows: [
          { from: RING_PI, to: { in: 'w0', t: 'Br', pick: 'left' }, bend: 1, fromName: 'a pi bond of the ring', toName: 'the near bromine of Br2', say: 'The ring attacks. Aromaticity is gone for one step.' },
          { from: { in: 'w0', b: [{ t: 'Br', pick: 'left' }, { t: 'Br', pick: 'right' }] }, to: { in: 'w0', t: 'Br', pick: 'right' }, bend: 1, fromName: 'the Br-Br bond', toName: 'the far bromine', say: 'The far bromine leaves as bromide.' }
        ]
      },
      {
        name: 'give the proton back', nuc: 'bromide', ele: 'the proton on the sp3 carbon',
        say: 'Bromide, or FeBr4 minus, takes the proton off the one sp3 carbon, and those C-H electrons swing back into the ring as a pi bond. Six pi electrons again. Aromatic again. Notice what did not happen: nothing added to the next carbon.',
        arrows: [
          { from: { in: 'w0', m: 'lpBr' }, to: { m: 'H' }, bend: -1, fromName: 'a lone pair on bromide', toName: 'the proton on the sp3 carbon', say: 'Lone pair to proton.' },
          { from: { mb: 'H' }, to: { b: [SP3_C, PLUS_C] }, bend: -1, fromName: 'the C-H bond', toName: 'the bond to the carbon carrying the plus', say: 'The C-H electrons become the pi bond that puts the ring back together.' }
        ]
      }
    ]
  },
  {
    id: 'anisole', chip: 'Nitration of anisole (para)', name: 'nitration of anisole', reagent: 'HNO3, H2SO4',
    roots: ['l2-resonance', 'l2-arrows', 'l2-induction'],
    after: 'Count the forms: four, not three. The methoxy oxygen has lone pairs, so when the plus lands on the carbon holding it, the oxygen can push a pair in and take the plus itself, and every atom has a full octet. That extra form only exists when you attack ortho or para. That is the whole story of why a donor is an ortho-para director, and para wins over ortho here because the methoxy is in the way.',
    states: [
      { main: 'COC1=CC=CC=C1', with: ['O=[N+]=O', 'O'], side: 'right', label: 'anisole + the nitronium ion' },
      areniumState('anisole', ['O'], 'right', 'the arenium ion: four resonance forms, and the fourth is the payoff'),
      { main: 'COc1ccc([N+](=O)[O-])cc1', with: ['[OH3+]'], side: 'right', label: 'para-nitroanisole. Aromatic again.' }
    ],
    steps: [
      {
        name: 'the ring attacks the nitronium', nuc: 'a pi bond of the ring', ele: 'the nitrogen of NO2+',
        say: 'Sulfuric acid protonates nitric acid and squeezes water out of it, and what is left is the nitronium ion, a linear O=N+=O with a very hungry nitrogen. The ring attacks that nitrogen, and one N=O pi bond has to fold up onto its oxygen so nitrogen does not exceed an octet.',
        arrows: [
          { from: RING_PI, to: { in: 'w0', t: 'N' }, bend: 1, fromName: 'a pi bond of the ring', toName: 'the nitrogen of the nitronium ion', say: 'The ring attacks the nitrogen.' },
          { from: { in: 'w0', b: [{ t: 'N' }, { t: 'O', pick: 'right' }] }, to: { in: 'w0', t: 'O', pick: 'right' }, bend: 1, fromName: 'one of the N=O pi bonds', toName: 'that oxygen', say: 'Nitrogen keeps its octet.' }
        ]
      },
      {
        name: 'give the proton back', nuc: 'water', ele: 'the proton on the sp3 carbon',
        say: 'Water, or bisulfate, takes the proton and the ring comes back. But look at the four forms first. Three of them are the usual ortho, para, ortho. The fourth is the one benzene could never draw.',
        arrows: [
          { from: { in: 'w0', m: 'lpO' }, to: { m: 'H' }, bend: -1, fromName: 'a lone pair on water', toName: 'the proton on the sp3 carbon', say: 'Lone pair to proton.' },
          { from: { mb: 'H' }, to: { b: [{ v: { deg: 3, order: 'single', notnb: 'O' } }, PLUS_C] }, bend: -1, fromName: 'the C-H bond', toName: 'the bond to the carbon carrying the plus', say: 'Aromatic again.' }
        ]
      }
    ]
  },
  {
    id: 'nitrobenzene', chip: 'Nitration of nitrobenzene (meta)', name: 'nitration of nitrobenzene', reagent: 'HNO3, H2SO4, heat',
    roots: ['l2-resonance', 'l2-induction', 'l2-arrows'],
    after: 'Look at where the plus can sit: on the two carbons next to the new bond and on the one across from it, and never on the carbon holding the old nitro group. That is the point. Attack ortho or para instead and one of the three forms would drop the plus right onto the carbon that a nitro group is already draining, and nobody wants a plus next to a plus. Meta is not preferred, it is simply the least punished.',
    states: [
      { main: '[O-][N+](=O)C1=CC=CC=C1', with: ['O=[N+]=O', 'O'], side: 'right', label: 'nitrobenzene + the nitronium ion' },
      areniumState('nitrobenzene', ['O'], 'right', 'the arenium ion from meta attack: the plus never touches the nitro carbon'),
      { main: '[O-][N+](=O)c1cccc([N+](=O)[O-])c1', with: ['[OH3+]'], side: 'right', label: 'meta-dinitrobenzene. Aromatic again.' }
    ],
    steps: [
      {
        name: 'the ring attacks, at the meta carbon', nuc: 'a pi bond of the ring', ele: 'the nitrogen of NO2+',
        say: 'The ring is much poorer than benzene, so this one needs heat. It attacks with the carbon that keeps the coming plus away from the nitro group, which is the meta carbon.',
        arrows: [
          { from: RING_PI, to: { in: 'w0', t: 'N' }, bend: 1, fromName: 'a pi bond of the ring', toName: 'the nitrogen of the nitronium ion', say: 'The ring attacks the nitrogen.' },
          { from: { in: 'w0', b: [{ t: 'N' }, { t: 'O', pick: 'right' }] }, to: { in: 'w0', t: 'O', pick: 'right' }, bend: 1, fromName: 'one of the N=O pi bonds', toName: 'that oxygen', say: 'Nitrogen keeps its octet.' }
        ]
      },
      {
        name: 'give the proton back', nuc: 'water', ele: 'the proton on the sp3 carbon',
        say: 'Water takes the proton and the ring is aromatic again. Walk the three forms and notice the carbon that never carries the plus: the one holding the first nitro group. That is what meta buys you.',
        arrows: [
          { from: { in: 'w0', m: 'lpO' }, to: { m: 'H' }, bend: -1, fromName: 'a lone pair on water', toName: 'the proton on the sp3 carbon', say: 'Lone pair to proton.' },
          { from: { mb: 'H' }, to: { b: [SP3_C, PLUS_C] }, bend: -1, fromName: 'the C-H bond', toName: 'the bond to the carbon carrying the plus', say: 'Aromatic again.' }
        ]
      }
    ]
  }
];

/* ------------------------------------------------------------------ */
/* The electrophile factory and the directing table.                    */
/* ------------------------------------------------------------------ */
const FACTORY = [
  { chip: 'Br2 + FeBr3', from: 'BrBr', reagent: 'FeBr3', to: '[Br+]', name: 'a bromine cation', line: 'FeBr3 has an empty orbital on iron, so it grabs one bromine and pulls hard. The other bromine is left starving. Same story with AlCl3 and Cl2.' },
  { chip: 'HNO3 + H2SO4', from: 'O', reagent: 'HNO3, H2SO4', to: 'O=[N+]=O', name: 'the nitronium ion', line: 'Sulfuric acid is the stronger acid, so it protonates nitric acid and squeezes out a water. What is left is O=N+=O, linear, with a nitrogen that wants electrons badly. If a question hands you HNO3 and H2SO4, write NO2+ before you read the choices.' },
  { chip: 'CH3COCl + AlCl3', from: 'CC(=O)Cl', reagent: 'AlCl3', to: 'CC#[O+]', name: 'the acylium ion', line: 'AlCl3 pulls the chloride off and leaves an acylium, which is stabilized by resonance with the oxygen. That is why acylation never rearranges, and why acylation then reduction is the safe way to hang an alkyl group on a ring.' },
  { chip: 'CH3CH2CH2Cl + AlCl3', from: 'CCCCl', reagent: 'AlCl3', to: 'C[CH+]C', name: 'a rearranged carbocation', line: 'AlCl3 pulls the chloride off and you get a primary carbocation, which does not stay primary for even an instant: a hydride slides over and you get the isopropyl cation. So propyl chloride gives isopropylbenzene, not propylbenzene. That is the classic Friedel-Crafts alkylation trap.' }
];
const DIRECTORS = [
  { label: 'OCH3, a methoxy', example: 'anisole', kind: 'donor', sends: 'ortho and para', strength: 'strongly activating', why: 'The oxygen lone pair reaches into the ring. When the plus lands on the carbon holding it, the oxygen takes the plus itself and everyone has an octet: a fourth resonance form that only ortho and para attack can give you.' },
  { label: 'NH2, an amine', example: 'aniline', kind: 'donor', sends: 'ortho and para', strength: 'strongly activating', why: 'Same as the methoxy but stronger, because nitrogen is less greedy with its lone pair than oxygen. Careful in acid though: protonate the nitrogen and you have made an ammonium, which is a meta director.' },
  { label: 'CH3, an alkyl group', example: 'toluene', kind: 'weak donor', sends: 'ortho and para', strength: 'activating', why: 'An alkyl group has no lone pair, so there is no fourth form. It just pushes a little electron density in by induction and hyperconjugation, and that push helps most when the plus is right next to it.' },
  { label: 'Cl or Br, a halogen', example: 'chlorobenzene', kind: 'halogen', sends: 'ortho and para', strength: 'deactivating', why: 'The odd one out, and a favorite question. A halogen pulls electrons by induction, so the whole ring is slower than benzene. But it still has lone pairs, so when the plus lands next door it can hand one over. Deactivating and still ortho-para.' },
  { label: 'NO2, a nitro group', example: 'nitrobenzene', kind: 'withdrawer', sends: 'meta', strength: 'strongly deactivating', why: 'The nitrogen already carries a plus and the group drains the ring. Ortho or para attack drops the arenium plus right onto the carbon holding it, a plus next to a plus. Meta is the one route that never does that.' },
  { label: 'C=O, a ketone, aldehyde, acid or ester', example: 'acetophenone', kind: 'withdrawer', sends: 'meta', strength: 'deactivating', why: 'The carbonyl carbon is electron poor and pulls on the ring through the pi system. Same argument as the nitro group: keep the arenium plus away from the carbon that holds it.' },
  { label: 'SO3H, a sulfonic acid', example: 'benzenesulfonic acid', kind: 'withdrawer', sends: 'meta', strength: 'strongly deactivating', why: 'Sulfur is surrounded by oxygens pulling on it, so it pulls on the ring. Meta, like every other withdrawer.' },
  { label: 'C(=O)NH2 or CN', example: 'benzamide or benzonitrile', kind: 'withdrawer', sends: 'meta', strength: 'deactivating', why: 'Both are pi acceptors on the ring, so both keep the arenium plus away from themselves and send the newcomer meta.' }
];
// Attack at ring position p (1 through 6, the substituent sits at 1) puts the plus on these carbons.
function plusPositions(p){ const w = n => ((n - 1 + 6) % 6) + 1; return [w(p - 1), w(p + 1), w(p + 3)]; }
const ATTACKS = [{ p: 2, name: 'ortho' }, { p: 3, name: 'meta' }, { p: 4, name: 'para' }];

/* ------------------------------------------------------------------ */
/* Node-safe helpers                                                    */
/* ------------------------------------------------------------------ */
function mulberry(seed){ let s = seed | 0; return function(){ s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function heavy(smi){ const s = smi.replace(/\[([A-Z][a-z]?|[a-z])[^\]]*\]/g, (m, g) => g); return (s.match(/Cl|Br|[BCNOSPFI]|[cnos]/g) || []).length; }
function charge(smi){ let q = 0; for (const b of smi.match(/\[[^\]]*\]/g) || []){ const p = /([+-])(\d?)/.exec(b); if (p) q += (p[1] === '+' ? 1 : -1) * (p[2] ? +p[2] : 1); } return q; }
function smilesSane(smi){
  if (typeof smi !== 'string' || !smi) return false;
  let d = 0; for (const ch of smi){ if (ch === '(') d++; if (ch === ')') d--; if (d < 0) return false; }
  if (d) return false;
  const ring = {}; for (const m of smi.replace(/\[[^\]]*\]/g, 'X').match(/\d/g) || []) ring[m] = (ring[m] || 0) + 1;
  return Object.values(ring).every(n => n % 2 === 0);
}
function mainsOf(st){ return Array.isArray(st.main) ? st.main : [st.main]; }
function stateSmiles(st){ return mainsOf(st).concat(st.with || []); }
function matterOf(st){ return [mainsOf(st)[0]].concat(st.with || []); }

/* ------------------------------------------------------------------ */
/* Item generators (pure). Every answer is computed from the tables.    */
/* ------------------------------------------------------------------ */
const KINDS = ['next', 'start', 'draw', 'extra', 'meta', 'where'];
function allMains(){ const s = new Set(); for (const M of MECHANISMS) for (const st of M.states) for (const m of mainsOf(st)) s.add(m); return [...s]; }
function pickN(rng, arr, n, not){ const pool = arr.filter(x => !not.includes(x)); const out = []; while (out.length < n && pool.length){ const i = Math.floor(rng() * pool.length); out.push(pool.splice(i, 1)[0]); } return out; }
function shuffled(rng, a){ const b = a.slice(); for (let i = b.length - 1; i > 0; i--){ const j = Math.floor(rng() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; }
function stepOf(rng){ const M = MECHANISMS[Math.floor(rng() * MECHANISMS.length)]; const i = Math.floor(rng() * M.steps.length); return { M, i, step: M.steps[i], state: M.states[i], nextState: M.states[i + 1] }; }

const WHERE_OPTS = ['ortho and para', 'meta', 'only para, never ortho', 'it does not react at all'];
const META_WRONG = [
  'The nitro group is bulky, so it physically blocks the two carbons beside it',
  'Meta attack gives four resonance forms while ortho and para give only three',
  'The nitro group pushes electron density into the meta carbon by resonance',
  'The nitronium ion is too big to reach the ortho or para carbons'
];

function genItem(rng, kind){
  kind = kind || KINDS[Math.floor(rng() * KINDS.length)];
  if (kind === 'next'){
    const pick = stepOf(rng);
    const ans = mainsOf(pick.nextState)[0], h = heavy(ans);
    const family = mainsOf(pick.nextState).concat(mainsOf(pick.state));
    const others = allMains().filter(s => !family.includes(s));
    const same = others.filter(s => Math.abs(heavy(s) - h) <= 2), rest = others.filter(s => Math.abs(heavy(s) - h) > 2);
    let d = pickN(rng, same, 3, []); if (d.length < 3) d = d.concat(pickN(rng, rest, 3 - d.length, d));
    if (d.length < 3) d = d.concat(pickN(rng, SMILES.filter(s => !family.includes(s) && !d.includes(s)), 3 - d.length, []));
    const choices = shuffled(rng, [ans].concat(d));
    return { kind, drawn: true, M: pick.M, i: pick.i, stem: 'Here is ' + pick.state.label + '. The step is: ' + pick.step.name + '. Which species comes next?', choices: choices.map(s => ({ text: nameOf(s), smiles: s })), correct: choices.indexOf(ans), coach: 'Push the arrows on the drawing: ' + pick.step.arrows.map(a => a.fromName + ' to ' + a.toName).join(', then ') + '. That gives ' + nameOf(ans) + '.', roots: pick.M.roots };
  }
  if (kind === 'start' || kind === 'draw'){
    const pick = stepOf(rng), ar = pick.step.arrows[0];
    const otherFrom = []; for (const M of MECHANISMS) for (const s of M.steps) for (const a of s.arrows) if (a.fromName !== ar.fromName && !otherFrom.includes(a.fromName)) otherFrom.push(a.fromName);
    if (kind === 'start'){
      const pool = []; for (const t of otherFrom.concat(['the plus on the ring', 'the sp3 carbon itself', 'the hydrogen atom itself'])) if (t !== ar.fromName && !pool.includes(t)) pool.push(t);
      const d = pickN(rng, pool, 3, []);
      const choices = shuffled(rng, [ar.fromName].concat(d));
      return { kind, tap: true, M: pick.M, i: pick.i, arrow: 0, stem: 'Here is ' + pick.state.label + '. Where does the FIRST arrow of this step (' + pick.step.name + ') start?', choices: choices.map(t => ({ text: t, smiles: null })), correct: choices.indexOf(ar.fromName), coach: 'Arrows start at electrons. The electron-rich partner here is ' + pick.step.nuc + ', so the arrow starts at ' + ar.fromName + ' and lands on ' + ar.toName + '.', roots: pick.M.roots };
    }
    const right = 'from ' + ar.fromName + ' to ' + ar.toName;
    const all = []; for (const M of MECHANISMS) for (const s of M.steps) for (const a of s.arrows) all.push(a);
    const cands = [], push = t => { if (t !== right && !cands.includes(t)) cands.push(t); };
    push('from ' + ar.toName + ' to ' + ar.fromName);
    for (const alt of shuffled(rng, all)){ push('from ' + ar.fromName + ' to ' + alt.toName); push('from ' + alt.fromName + ' to ' + ar.toName); push('from ' + alt.fromName + ' to ' + alt.toName); if (cands.length >= 9) break; }
    const d = pickN(rng, cands, 3, []);
    const choices = shuffled(rng, [right].concat(d));
    return { kind, M: pick.M, i: pick.i, arrow: 0, stem: 'Here is ' + pick.state.label + '. Draw the first arrow of the step (' + pick.step.name + '): where does it start, and where does it land?', choices: choices.map(t => ({ text: t, smiles: null })), correct: choices.indexOf(right), coach: 'Rich attacks poor. The electrons sit on ' + pick.step.nuc + '; they go to ' + pick.step.ele + '. So: ' + right + '.', roots: pick.M.roots };
  }
  if (kind === 'extra'){
    const forms = ARENIUM.anisole, ans = forms.find(f => f.extra);
    const choices = shuffled(rng, forms.slice());
    return { kind, drawn: true, M: MECHANISMS[1], i: 1, noState: true, stem: 'These are the resonance forms of the arenium ion from nitrating anisole. Which one is the extra form that a plain benzene ring could never draw?', choices: choices.map(f => ({ text: f.label, smiles: f.smi })), correct: choices.indexOf(ans), coach: 'Three of them just walk the plus around the ring: two ortho carbons and the para carbon. The extra one is different: the methoxy oxygen pushes a lone pair in and takes the plus itself, so every atom has a full octet. That form only exists when the plus reaches the carbon holding the methoxy, which only ortho and para attack can do. That is why a donor is an ortho-para director.', roots: ['l2-resonance', 'l2-induction'] };
  }
  if (kind === 'meta'){
    const good = ATTACKS.filter(a => !plusPositions(a.p).includes(1));
    const ans = 'Attack at the ' + good.map(a => a.name).join(' or ') + ' carbon, because that is the only one whose three resonance forms never put the plus on the carbon holding the nitro group';
    const d = pickN(rng, META_WRONG, 3, []);
    const choices = shuffled(rng, [ans].concat(d));
    return { kind, stem: 'Nitrobenzene is nitrated again. Why does the second nitro group land meta?', choices: choices.map(t => ({ text: t, smiles: null })), correct: choices.indexOf(ans), coach: 'Number the ring with the nitro group at carbon one. Attack at carbon two puts the plus on carbons ' + plusPositions(2).join(', ') + '. Attack at carbon four puts it on ' + plusPositions(4).join(', ') + '. Both of those lists contain carbon one, the carbon already carrying a group that is draining the ring. Attack at carbon three puts the plus on ' + plusPositions(3).join(', ') + ', and carbon one is not in that list. Meta is not preferred, it is the least punished.', roots: ['l2-resonance', 'l2-induction'] };
  }
  // where: the directing call
  const D = DIRECTORS[Math.floor(rng() * DIRECTORS.length)];
  const choices = shuffled(rng, WHERE_OPTS.slice());
  return { kind: 'where', stem: 'A ring carrying ' + D.label + ' (for example ' + D.example + ') is treated with Br2 and FeBr3. Where does the new bromine go?', choices: choices.map(t => ({ text: t, smiles: null })), correct: choices.indexOf(D.sends), coach: D.why + ' So: ' + D.sends + ', and the group is ' + D.strength + '.', roots: ['l2-resonance', 'l2-induction'] };
}

export function makeItem(api){
  const it = genItem(api.rng);
  const st = it.M && !it.noState ? it.M.states[it.i] : null;
  return { stem: it.stem, sub: st ? mainsOf(st)[0] : null, reagent: st ? (st.with || []).map(nameOf).join(' + ') || null : null, prod: null, choices: it.choices, correct: it.correct, coach: it.coach, home: meta.id, roots: it.roots || ['l2-resonance', 'l2-arrows'] };
}

export function selfTest(deps){
  let tried = 0;
  try {
    const rng = mulberry(83);
    const api = { rng, pick: a => a[Math.floor(rng() * a.length)], shuffle: a => shuffled(rng, a), reactions: deps && deps.reactions, bank: deps && deps.bank };
    for (const M of MECHANISMS){
      if (M.steps.length !== M.states.length - 1) throw new Error(M.id + ': steps must be states minus one');
      for (const st of M.states) for (const s of stateSmiles(st)){
        if (!SMILES.includes(s)) throw new Error(M.id + ': ' + s + ' missing from SMILES');
        if (!SPECIES[s]) throw new Error(M.id + ': ' + s + ' missing from SPECIES');
        if (!smilesSane(s)) throw new Error(s + ' has unmatched parentheses or ring digits');
      }
      for (let i = 0; i < M.steps.length; i++){
        const a = M.states[i], b = M.states[i + 1];
        const hv = st => matterOf(st).reduce((n, s) => n + heavy(s), 0);
        const qv = st => matterOf(st).reduce((n, s) => n + charge(s), 0);
        if (hv(a) !== hv(b)) throw new Error(M.id + ' step ' + i + ': heavy atoms not conserved (' + hv(a) + ' then ' + hv(b) + ')');
        if (qv(a) !== qv(b)) throw new Error(M.id + ' step ' + i + ': charge not conserved (' + qv(a) + ' then ' + qv(b) + ')');
        const step = M.steps[i];
        if (!step.arrows.length || !step.nuc || !step.ele || !step.say) throw new Error(M.id + ' step ' + i + ': incomplete');
        for (const ar of step.arrows){
          const f = ar.from;
          const fromElectrons = f.m != null || f.mb != null || f.b != null || (f.t && (f.part === 'HB' || !f.part));
          if (!fromElectrons) throw new Error(M.id + ' step ' + i + ': an arrow starts at something that is not electrons');
          if (!ar.fromName || !ar.toName) throw new Error(M.id + ': every arrow needs names');
        }
      }
      // every arenium state carries every resonance form of the same formula and charge
      for (const st of M.states) if (Array.isArray(st.main)){
        const h0 = heavy(st.main[0]), q0 = charge(st.main[0]);
        for (const s of st.main){ if (heavy(s) !== h0) throw new Error(M.id + ': a resonance form has a different formula'); if (charge(s) !== q0) throw new Error(M.id + ': a resonance form has a different charge'); }
        if (st.mainLabels.length !== st.main.length) throw new Error(M.id + ': every form needs a label');
      }
    }
    for (const s of SMILES) if (!smilesSane(s)) throw new Error('bad SMILES ' + s);
    for (const key of Object.keys(ARENIUM)){
      const forms = ARENIUM[key];
      if (forms.filter(f => f.kind === 'ortho').length !== 2) throw new Error(key + ': an arenium ion has exactly two ortho forms');
      if (forms.filter(f => f.kind === 'para').length !== 1) throw new Error(key + ': an arenium ion has exactly one para form');
      for (const f of forms) if (!SMILES.includes(f.smi) || !SPECIES[f.smi]) throw new Error(key + ': form ' + f.smi + ' is not declared');
    }
    if (ARENIUM.anisole.filter(f => f.extra).length !== 1) throw new Error('a donor gives exactly one extra form');
    if (ARENIUM.bromination.some(f => f.extra) || ARENIUM.nitrobenzene.some(f => f.extra)) throw new Error('only a donor gets the extra form');
    // the position math: only meta attack keeps the plus off carbon one
    for (const A of ATTACKS){
      const has = plusPositions(A.p).includes(1);
      if ((A.name === 'meta') === has) throw new Error('the plus-position math disagrees with ' + A.name);
      if (new Set(plusPositions(A.p)).size !== 3) throw new Error(A.name + ': three distinct carbons expected');
    }
    for (const D of DIRECTORS){ if (!WHERE_OPTS.includes(D.sends)) throw new Error(D.label + ': unknown directing answer'); if (!D.why || !D.strength) throw new Error(D.label + ': incomplete'); }
    for (const F of FACTORY){ if (!SMILES.includes(F.from) || !SMILES.includes(F.to)) throw new Error(F.chip + ': undeclared SMILES'); if (!SPECIES[F.to]) throw new Error(F.chip + ': the electrophile needs a name'); }
    const kinds = {};
    for (let n = 0; n < 320; n++){
      const it = makeItem(api); tried++;
      if (!it.choices || it.choices.length !== 4) throw new Error('four choices required');
      const keys = it.choices.map(c => (c.smiles || '') + '|' + (c.text || ''));
      if (new Set(keys).size !== 4) throw new Error('choices not distinct: ' + keys.join(' / '));
      if (!(it.correct >= 0 && it.correct < 4)) throw new Error('bad correct index');
      for (const c of it.choices) if (c.smiles && !smilesSane(c.smiles)) throw new Error('bad SMILES ' + c.smiles);
      if (it.sub && !smilesSane(it.sub)) throw new Error('bad sub SMILES');
      if (!it.coach || !it.stem) throw new Error('coach or stem empty');
      if (it.home !== meta.id) throw new Error('home');
      if (!Array.isArray(it.roots) || !it.roots.length) throw new Error('roots');
    }
    for (const k of KINDS){ const it = genItem(mulberry(13), k); if (!it || it.correct < 0) throw new Error(k + ' failed'); kinds[k] = 1; }
    for (let n = 0; n < 200; n++){
      const it = genItem(rng, 'where');
      const D = DIRECTORS.find(x => it.stem.includes(x.label));
      if (!D || it.choices[it.correct].text !== D.sends) throw new Error('a directing item marked the wrong choice');
    }
    for (let n = 0; n < 100; n++){ const it = genItem(rng, 'extra'); if (!/oxygen takes the plus/.test(it.choices[it.correct].text)) throw new Error('the extra-form item marked the wrong choice'); }
    const a = genItem(mulberry(9)), b = genItem(mulberry(9));
    if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error('not reproducible');
    return { ok: true, tried, notes: MECHANISMS.length + ' mechanisms, ' + Object.keys(ARENIUM).length + ' arenium ions, ' + DIRECTORS.length + ' directors, ' + KINDS.length + ' item kinds' };
  } catch (e){ return { ok: false, tried, notes: e.message }; }
}

/* ================================================================== */
/* Browser side: the mechanism engine.                                  */
/* ================================================================== */
const SUBS = {}; for (let d = 0; d < 10; d++) SUBS[String.fromCharCode(0x2080 + d)] = String(d);
SUBS[String.fromCharCode(0x207A)] = '+'; SUBS[String.fromCharCode(0x207B)] = '-'; SUBS[String.fromCharCode(0x2212)] = '-';
function norm(s){ let o = ''; for (const ch of s) o += SUBS[ch] || ch; return o; }
const GW = { H: 8.7, O: 9.3, N: 8.7, C: 8.7, S: 8, F: 7.3, I: 3.3, Br: 12.2, Cl: 11.4, P: 8.7, B: 8.7 };
function gw(tok){ if (/\d/.test(tok)) return 4.8; if (tok === '+' || tok === '-') return 3.5; return GW[tok] || 8.7; }
const ORD = { single: 1, dbl: 2, tpl: 3 };
let uid = 0;

// Read one drawn species: heteroatom labels (position from the mask circles, H glyph position from
// the tspans), vertices and bonds from the lines (the short inner line of a double bond merges).
function analyze(node){
  const vb = (node.getAttribute('viewBox') || '0 0 240 160').trim().split(/[\s,]+/).map(Number);
  const circles = [...node.querySelectorAll('mask circle')].map(c => ({ x: +c.getAttribute('cx'), y: +c.getAttribute('cy') }));
  const texts = [...node.querySelectorAll('text')].map((t, i) => {
    const st = (t.parentNode && t.parentNode.getAttribute('style')) || '';
    const mx = /translateX\(([-\d.e]+)px\)/.exec(st), my = /translateY\(([-\d.e]+)px\)/.exec(st);
    const tx = mx ? +mx[1] : 0, ty = my ? +my[1] : 0;
    const raw = norm(t.textContent || ''), toks = raw.match(/Cl|Br|[A-Z]|\d|[+-]/g) || [];
    const el = toks.find(k => /^[A-Z]/.test(k) && k !== 'H') || 'H';
    const dir = t.getAttribute('data-direction') || 'right';
    const total = toks.reduce((s, k) => s + gw(k), 0);
    let hx = null;
    for (const sp of t.querySelectorAll('tspan')){
      let bb = null; try { bb = sp.getBBox(); } catch (e){ bb = null; }
      if (!bb || !bb.width) continue;
      const s = norm(sp.textContent || ''), k = s.indexOf('H');
      if (k >= 0){ const pre = (s.slice(0, k).match(/Cl|Br|[A-Z]|\d|[+-]/g) || []).reduce((a, b) => a + gw(b), 0); hx = tx + bb.x + pre + gw('H') / 2; break; }
    }
    if (hx == null){ let x = dir === 'left' ? tx - total : tx; for (const k of toks){ if (k === 'H'){ hx = x + gw('H') / 2; break; } x += gw(k); } }
    const pos = circles[i] || { x: tx + (dir === 'left' ? -gw(el) / 2 : gw(el) / 2), y: ty };
    const x0 = dir === 'left' ? tx - total : tx;
    return { el, raw, x: pos.x, y: pos.y, hx, hy: ty, hasH: hx != null, dir, x0, x1: x0 + total, charge: raw.includes('+') ? 1 : raw.includes('-') ? -1 : 0 };
  });
  const raw = [...node.querySelectorAll('line')].map(l => [+l.getAttribute('x1'), +l.getAttribute('y1'), +l.getAttribute('x2'), +l.getAttribute('y2')]).map(a => ({ a, len: Math.hypot(a[2] - a[0], a[3] - a[1]) })).filter(l => l.len >= 12).sort((p, q) => q.len - p.len);
  const V = [];
  const cluster = (x, y) => { for (let i = 0; i < V.length; i++) if (Math.hypot(V[i].x - x, V[i].y - y) < 7) return i; V.push({ x, y, pts: [], el: 'C', nb: [], text: null }); return V.length - 1; };
  const E = new Map(), key = (a, b) => a < b ? a + '-' + b : b + '-' + a;
  for (const l of raw){ const a = cluster(l.a[0], l.a[1]), b = cluster(l.a[2], l.a[3]); if (a === b) continue; V[a].pts.push({ x: l.a[0], y: l.a[1], len: l.len }); V[b].pts.push({ x: l.a[2], y: l.a[3], len: l.len }); E.set(key(a, b), (E.get(key(a, b)) || 0) + 1); }
  for (const v of V){ const mx = Math.max(...v.pts.map(p => p.len)); const top = v.pts.filter(p => p.len > mx - 0.6); v.x = top.reduce((s, p) => s + p.x, 0) / top.length; v.y = top.reduce((s, p) => s + p.y, 0) / top.length; }
  for (const t of texts){
    let i = -1, bd = 4.5; V.forEach((v, j) => { const d = Math.hypot(v.x - t.x, v.y - t.y); if (d < bd){ bd = d; i = j; } });
    if (i < 0){ V.push({ x: t.x, y: t.y, pts: [], el: t.el, nb: [], text: t }); i = V.length - 1; let best = -1, dd = 27; V.forEach((v, j) => { if (j !== i){ const d = Math.hypot(v.x - t.x, v.y - t.y); if (d < dd){ dd = d; best = j; } } }); if (best >= 0 && !E.has(key(i, best))) E.set(key(i, best), 1); }
    else { V[i].el = t.el; V[i].text = t; V[i].x = t.x; V[i].y = t.y; }
  }
  const edges = [...E.entries()].map(([k, n]) => { const [a, b] = k.split('-').map(Number); return { a, b, order: Math.min(3, n) }; });
  for (const e of edges){ V[e.a].nb.push(e.b); V[e.b].nb.push(e.a); e.mid = { x: (V[e.a].x + V[e.b].x) / 2, y: (V[e.a].y + V[e.b].y) / 2 }; }
  V.forEach((v, i) => { v.i = i; v.deg = v.nb.length; v.order = Math.max(1, ...edges.filter(e => e.a === i || e.b === i).map(e => e.order)); });
  return { vb, texts, V, edges, marks: {} };
}
function freeDir(G, p, extra){
  let v = null, bd = 4; for (const w of G.V){ const d = Math.hypot(w.x - p.x, w.y - p.y); if (d < bd){ bd = d; v = w; } }
  const taken = (extra || []).slice();
  if (v){ for (const j of v.nb) taken.push(Math.atan2(-(G.V[j].y - v.y), G.V[j].x - v.x) * 180 / Math.PI); if (v.text && v.text.hasH) taken.push(v.text.hx < v.x ? 180 : 0); if (v.text && v.text.charge) taken.push(v.text.dir === 'left' ? 180 : 0); }
  const gap = deg => taken.reduce((m, t) => Math.min(m, Math.abs(((deg - t) % 360 + 540) % 360 - 180)), 999);
  let best = 90, bg = -1; for (const c of [90, 270, 180, 0, 135, 45, 225, 315]){ const g = gap(c); if (g > bg + 0.01){ bg = g; best = c; } }
  return best;
}
function pickOne(list, c){
  if (!list.length) return null;
  if (c && c.pick){ const k = c.pick; return list.reduce((b, v) => (k === 'left' ? v.x < b.x : k === 'right' ? v.x > b.x : k === 'top' ? v.y < b.y : v.y > b.y) ? v : b, list[0]); }
  return list[(c && c.n) || 0];
}
// Resolve an anchor spec to a point in the species' drawer units.
function resolve(G, spec){
  let p = null;
  if (spec.m != null){ const m = G.marks[spec.m]; p = m ? { x: m.x, y: m.y } : null; }
  else if (spec.mb != null){ const m = G.marks[spec.mb]; p = m ? { x: (m.x + m.bx) / 2, y: (m.y + m.by) / 2 } : null; }
  else if (spec.ringc){ const list = G.V.filter(v => v.el === 'C' && v.deg >= 2); if (list.length) p = { x: list.reduce((s, v) => s + v.x, 0) / list.length, y: list.reduce((s, v) => s + v.y, 0) / list.length }; }
  else if (spec.t){ const list = G.texts.filter(t => t.el === spec.t && (!spec.q || t.raw.includes(spec.q)) && (!spec.nq || !t.raw.includes(spec.nq))); const t = pickOne(list, spec); if (t) p = spec.part === 'H' ? { x: t.hx, y: t.hy } : spec.part === 'HB' ? { x: (t.x + t.hx) / 2, y: (t.y + t.hy) / 2 } : { x: t.x, y: t.y }; }
  else if (spec.v){ const c = spec.v; const list = G.V.filter(v => (c.deg == null || v.deg === c.deg) && (c.order == null || v.order === ORD[c.order]) && (c.el == null ? v.el === 'C' : v.el === c.el) && (c.nb == null || v.nb.some(j => G.V[j].el === c.nb)) && (c.notnb == null || !v.nb.some(j => G.V[j].el === c.notnb))); const v = pickOne(list, c); if (v) p = { x: v.x, y: v.y }; }
  else if (spec.b){
    const b = spec.b;
    if (Array.isArray(b)){ const a = resolve(G, b[0]), c = resolve(G, b[1]); if (a && c) p = { x: (a.x + c.x) / 2, y: (a.y + c.y) / 2 }; }
    else if (b === 'dbl' || b === 'tpl'){ const list = G.edges.filter(e => e.order === ORD[b]).map(e => ({ x: e.mid.x, y: e.mid.y })); const e = pickOne(list, spec); if (e) p = { x: e.x, y: e.y }; }
    else if (b === 'cc2'){ const list = G.edges.filter(e => e.order === 2 && G.V[e.a].el === 'C' && G.V[e.b].el === 'C').map(e => ({ x: e.mid.x, y: e.mid.y })); const e = pickOne(list, spec); if (e) p = { x: e.x, y: e.y }; }
    else if (b.t){ const t = pickOne(G.texts.filter(t => t.el === b.t && (!b.q || t.raw.includes(b.q)) && (!b.nq || !t.raw.includes(b.nq))), b); const v = t && G.V.find(v => v.text === t); const e = v && G.edges.filter(e => e.a === v.i || e.b === v.i)[b.n || 0]; if (e) p = { x: e.mid.x, y: e.mid.y }; }
    else if (b.v){ const v0 = resolve(G, { v: b.v }); if (v0){ let vv = null, bd = 3; for (const w of G.V) { const d = Math.hypot(w.x - v0.x, w.y - v0.y); if (d < bd){ bd = d; vv = w; } } const e = vv && G.edges.filter(e => e.a === vv.i || e.b === vv.i)[b.n || 0]; if (e) p = { x: e.mid.x, y: e.mid.y }; } }
  }
  else if (spec.f){ p = { x: G.vb[0] + spec.f[0] * G.vb[2], y: G.vb[1] + spec.f[1] * G.vb[3] }; }
  if (p && spec.off) p = { x: p.x + spec.off[0], y: p.y + spec.off[1] };
  return p;
}
// Draw one species into an outer svg group at scale k. Returns geometry with T() into outer units.
function prepareSpecies(api, layer, smi, k){
  const sp = SPECIES[smi] || { name: smi, marks: [] };
  const node = api.drawSmiles(layer, smi, { width: 240, height: 160, label: sp.name });
  const G = analyze(node);
  const placed = [];
  for (const mk of sp.marks){
    const base = resolve(G, mk.at); if (!base) continue;
    const dir = mk.dir != null ? mk.dir : freeDir(G, base, placed.filter(m => Math.hypot(m.bx - base.x, m.by - base.y) < 1).map(m => m.dir));
    const dist = mk.kind === 'lp' ? 11 : mk.kind === 'H' ? 13 : 12;
    const t = dir * Math.PI / 180;
    const m = { kind: mk.kind, x: base.x + Math.cos(t) * dist, y: base.y - Math.sin(t) * dist, bx: base.x, by: base.y, dir };
    if (mk.id) G.marks[mk.id] = m; placed.push(m);
  }
  G.placed = placed;
  const xs = [], ys = [];
  for (const v of G.V){ xs.push(v.x); ys.push(v.y); }
  for (const t of G.texts){ xs.push(t.x0, t.x1); ys.push(t.y - 8, t.y + 8); }
  for (const m of placed){ xs.push(m.x - 8, m.x + 8); ys.push(m.y - 8, m.y + 8); }
  if (!xs.length){ xs.push(G.vb[0], G.vb[0] + G.vb[2]); ys.push(G.vb[1], G.vb[1] + G.vb[3]); }
  const pad = 9, bx0 = Math.min(...xs) - pad, by0 = Math.min(...ys) - pad, bw = Math.max(...xs) - Math.min(...xs) + 2 * pad, bh = Math.max(...ys) - Math.min(...ys) + 2 * pad;
  node.setAttribute('viewBox', bx0 + ' ' + by0 + ' ' + bw + ' ' + bh);
  node.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  const out = { smi, name: sp.name, node, G, w: bw * k, h: bh * k, k, X: 0, Y: 0, marksG: api.svg('g', {}) };
  layer.append(out.marksG);
  out.T = p => ({ x: out.X + (p.x - bx0) * k, y: out.Y + (p.y - by0) * k });
  out.place = (X, Y) => {
    out.X = X; out.Y = Y;
    node.setAttribute('x', X); node.setAttribute('y', Y); node.setAttribute('width', out.w); node.setAttribute('height', out.h);
    Object.assign(node.style, { width: out.w + 'px', height: out.h + 'px', maxWidth: 'none', display: '' });
    out.marksG.replaceChildren();
    const C = api.colors;
    for (const m of placed){
      const q = out.T(m), t = m.dir * Math.PI / 180;
      if (m.kind === 'lp'){ const px = -Math.sin(t) * 3.2 * k, py = -Math.cos(t) * 3.2 * k; out.marksG.append(api.svg('circle', { cx: q.x + px, cy: q.y + py, r: 2.1 * k, fill: C.blue }), api.svg('circle', { cx: q.x - px, cy: q.y - py, r: 2.1 * k, fill: C.blue })); }
      else if (m.kind === '+' || m.kind === '-'){ const col = m.kind === '+' ? C.coral : C.blue, R = 5.2 * k; const g = api.svg('g', {}); g.append(api.svg('circle', { cx: q.x, cy: q.y, r: R, fill: C.panel, stroke: col, 'stroke-width': String(1.3 * k) }), api.svg('line', { x1: q.x - R * 0.55, y1: q.y, x2: q.x + R * 0.55, y2: q.y, stroke: col, 'stroke-width': String(1.5 * k), 'stroke-linecap': 'round' })); if (m.kind === '+') g.append(api.svg('line', { x1: q.x, y1: q.y - R * 0.55, x2: q.x, y2: q.y + R * 0.55, stroke: col, 'stroke-width': String(1.5 * k), 'stroke-linecap': 'round' })); out.marksG.append(g); }
      else if (m.kind === 'H'){ const b = out.T({ x: m.bx, y: m.by }); const ux = (q.x - b.x) / Math.hypot(q.x - b.x, q.y - b.y), uy = (q.y - b.y) / Math.hypot(q.x - b.x, q.y - b.y); out.marksG.append(api.svg('line', { x1: b.x + ux * 2 * k, y1: b.y + uy * 2 * k, x2: q.x - ux * 6 * k, y2: q.y - uy * 6 * k, stroke: C.ink2, 'stroke-width': String(1.5 * k), 'stroke-linecap': 'round' }), api.svg('text', { x: q.x, y: q.y + 4.2 * k, 'text-anchor': 'middle', 'font-family': 'Arial, Helvetica, sans-serif', 'font-size': String(12 * k), fill: C.ink, text: 'H' })); }
    }
  };
  out.hits = () => {
    const h = [];
    for (const m of placed){
      if (m.kind === 'lp') h.push({ kind: 'lp', p: out.T(m), name: 'the lone pair on ' + (G.V.find(v => Math.hypot(v.x - m.bx, v.y - m.by) < 2) || { el: 'the atom' }).el });
      if (m.kind === 'H'){ h.push({ kind: 'atom', p: out.T(m), name: 'a hydrogen' }); h.push({ kind: 'sigma', p: out.T({ x: (m.x + m.bx) / 2, y: (m.y + m.by) / 2 }), name: 'the C-H bond' }); }
      if (m.kind === '+') h.push({ kind: 'plus', p: out.T(m), name: 'the plus sign' });
      if (m.kind === '-') h.push({ kind: 'lp', p: out.T(m), name: 'the minus, a lone pair' });
    }
    for (const e of G.edges) h.push({ kind: e.order > 1 ? 'pi' : 'sigma', p: out.T(e.mid), name: e.order > 1 ? 'the pi bond' : 'a sigma bond' });
    for (const v of G.V) h.push({ kind: 'atom', p: out.T(v), name: v.text ? 'the ' + v.el + ' atom' : 'a carbon' });
    for (const t of G.texts) if (t.hasH){ h.push({ kind: 'atom', p: out.T({ x: t.hx, y: t.hy }), name: 'a hydrogen on ' + t.el }); h.push({ kind: 'sigma', p: out.T({ x: (t.x + t.hx) / 2, y: (t.y + t.hy) / 2 }), name: 'the ' + t.el + '-H bond' }); }
    return h;
  };
  return out;
}
// Build one state box (partners beside the main species) into a layer.
function buildState(api, layer, st, k, X, Y, opts){
  const kp = k * 0.92, gap = 12 * k / 1.5, padX = 12, padY = 10;
  const mains = mainsOf(st).map(s => prepareSpecies(api, layer, s, k));
  const withs = (st.with || []).map(s => prepareSpecies(api, layer, s, kp));
  const mainW = mains.reduce((s, m) => s + m.w, 0) + (mains.length - 1) * gap, mainH = Math.max(...mains.map(m => m.h));
  const withW = withs.length ? Math.max(...withs.map(w => w.w)) : 0, withH = withs.reduce((s, w) => s + w.h, 0) + Math.max(0, withs.length - 1) * 6;
  const innerW = mainW + (withs.length ? withW + gap : 0), innerH = Math.max(mainH, withH);
  const w = innerW + 2 * padX, h = innerH + 2 * padY + (opts && opts.noLabel ? 0 : 20) + (st.mainLabels ? 13 : 0);
  const box = { st, x: X, y: Y, w, h, parts: {}, mains, withs, layer };
  box.place = (X2, Y2) => {
    box.x = X2; box.y = Y2;
    const left = st.side === 'right';
    let x = X2 + padX + (left ? 0 : (withs.length ? withW + gap : 0));
    const yMid = Y2 + padY + innerH / 2;
    mains.forEach((m, i) => { m.place(x, yMid - m.h / 2); box.parts[i === 0 ? 'main' : 'main' + i] = m; x += m.w + gap; });
    let wx = left ? x : X2 + padX, wy = yMid - withH / 2;
    withs.forEach((wv, i) => { wv.place(wx + (withW - wv.w) / 2, wy); box.parts['w' + i] = wv; wy += wv.h + 6; });
    return box;
  };
  return box;
}
function curved(api, from, to, bend, markerId, k){
  const dx = to.x - from.x, dy = to.y - from.y, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
  const t0 = Math.min(3 * k, L * 0.12), t1 = Math.min(9 * k, L * 0.3);
  const fx = from.x + dx / L * t0, fy = from.y + dy / L * t0, tx = to.x - dx / L * t1, ty = to.y - dy / L * t1;
  const amp = Math.min(Math.max(10 * k, L * 0.34), 60 * k);
  const cx = (fx + tx) / 2 + nx * bend * amp, cy = (fy + ty) / 2 + ny * bend * amp;
  return api.svg('path', { d: 'M' + fx.toFixed(1) + ' ' + fy.toFixed(1) + ' Q' + cx.toFixed(1) + ' ' + cy.toFixed(1) + ' ' + tx.toFixed(1) + ' ' + ty.toFixed(1), fill: 'none', stroke: api.colors.goldhi, 'stroke-width': String(1.9 * k), 'stroke-linecap': 'round', 'marker-end': 'url(#' + markerId + ')' });
}
function markerDefs(api, id, color){ return api.svg('defs', {}, api.svg('marker', { id, viewBox: '0 0 10 10', refX: '8', refY: '5', markerWidth: '5', markerHeight: '5', orient: 'auto' }, api.svg('path', { d: 'M0 0 L10 5 L0 10 z', fill: color }))); }
function arrowPath(api, box, ar, markerId, k){
  const partOf = spec => box.parts[spec.in || 'main'];
  const pf = partOf(ar.from), pt = partOf(ar.to); if (!pf || !pt) return null;
  const a = resolve(pf.G, ar.from), b = resolve(pt.G, ar.to); if (!a || !b) return null;
  return curved(api, pf.T(a), pt.T(b), ar.bend || 1, markerId, k);
}

// The stage: chips pick a mechanism, Next arrow / Play / Reset walk it, a caption speaks each step.
function mountStage(slots, api, opts){
  const { el, svg } = api, C = api.colors, MECHS = opts.mechanisms;
  let mech = MECHS[0], cur = { step: 0, arrow: 0, done: false }, busy = false, playing = false, timers = [];
  const wrap = el('div', { style: { position: 'relative' } });
  const stage = svg('svg', { role: 'img', 'aria-label': 'arrow-pushing stage', style: { display: 'block', width: '100%', height: 'auto' } });
  wrap.append(stage);
  const cap = el('div', { style: { marginTop: '10px', minHeight: '4.6em' } });
  const capHead = el('div', { style: { fontFamily: 'Georgia, serif', color: C.goldhi, fontSize: '18px' } });
  const capBody = el('p', { style: { margin: '4px 0 0', color: C.ink2, fontSize: '15px', maxWidth: '70ch' } });
  cap.append(capHead, capBody);
  const nextBtn = el('button', { class: 'primary', type: 'button', text: 'Next arrow', onClick: () => step(true) });
  const playBtn = el('button', { class: 'secondary', type: 'button', text: 'Play', onClick: play });
  const resetBtn = el('button', { class: 'secondary', type: 'button', text: 'Reset', onClick: () => { stopPlay(); cur = { step: 0, arrow: 0, done: false }; render(); speak(); } });
  const chips = el('div', { class: 'controls', role: 'group', 'aria-label': 'Pick a mechanism' });
  const chipEls = MECHS.map(M => el('button', { class: 'chip', type: 'button', 'aria-pressed': M === mech ? 'true' : 'false', text: M.chip, onClick: () => { stopPlay(); mech = M; cur = { step: 0, arrow: 0, done: false }; chipEls.forEach((c, i) => c.setAttribute('aria-pressed', MECHS[i] === M ? 'true' : 'false')); render(); speak(); } }));
  chips.append(...chipEls);
  const legend = el('div', { style: { display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', marginTop: '10px', fontSize: '12px', color: C.ink3, fontFamily: 'ui-monospace, Menlo, monospace', letterSpacing: '.04em' } });
  const legendItem = (draw, text) => { const s = svg('svg', { viewBox: '0 0 26 16', width: '26', height: '16', style: { display: 'inline-block', width: '26px', height: '16px', verticalAlign: 'middle', marginRight: '4px' } }); draw(s); return el('span', {}, s, text); };
  legend.append(
    legendItem(s => s.append(svg('circle', { cx: 9, cy: 8, r: 2.4, fill: C.blue }), svg('circle', { cx: 16, cy: 8, r: 2.4, fill: C.blue })), 'lone pair, electrons ready to attack'),
    legendItem(s => s.append(svg('path', { d: 'M3 13 Q13 -2 23 9', fill: 'none', stroke: C.goldhi, 'stroke-width': '2', 'stroke-linecap': 'round' }), svg('path', { d: 'M19 5 L23.5 9.5 L17.5 10.5 z', fill: C.goldhi })), 'gold arrow: two electrons moving'),
    legendItem(s => s.append(svg('rect', { x: 3, y: 3, width: 20, height: 10, rx: 3, fill: 'none', stroke: C.gold, 'stroke-width': '1.6' })), 'the state being built right now')
  );
  slots.visual.append(wrap, el('div', { class: 'controls' }, nextBtn, playBtn, resetBtn), cap, chips, legend);

  let boxes = [], mid = '', layers = null, W = 960, k = 1.5, laidHidden = false;
  function layout(){
    W = Math.max(300, Math.round(wrap.clientWidth || 0)) || 960; laidHidden = !wrap.clientWidth;
    k = W < 560 ? 1.15 : W < 800 ? 1.3 : 1.45;
    stage.replaceChildren(); mid = 'mk' + (++uid);
    stage.append(markerDefs(api, mid, C.goldhi), markerDefs(api, mid + 'f', C.gold));
    layers = { boxes: svg('g', {}), species: svg('g', {}), labels: svg('g', {}), arrows: svg('g', {}) };
    stage.append(layers.boxes, layers.species, layers.labels, layers.arrows);
    boxes = mech.states.map(st => buildState(api, layers.species, st, k, 0, 0));
    const conn = Math.max(54 * k / 1.5, Math.max(...mech.steps.map(s => s.name.length)) * 6.3 + 18), rows = [[]]; let x = 0;
    for (const b of boxes){ const need = (rows[rows.length - 1].length ? conn : 0) + b.w; if (x + need > W && rows[rows.length - 1].length){ rows.push([]); x = 0; } if (rows[rows.length - 1].length) x += conn; rows[rows.length - 1].push(b); x += b.w; }
    let y = 8; const rowGap = 46;
    for (const row of rows){
      const rowW = row.reduce((s, b) => s + b.w, 0) + (row.length - 1) * conn, rowH = Math.max(...row.map(b => b.h));
      let rx = Math.max(0, (W - rowW) / 2);
      for (const b of row){ b.place(rx, y + (rowH - b.h) / 2); b.row = rows.indexOf(row); rx += b.w + conn; }
      y += rowH + rowGap;
    }
    const H = y - rowGap + 8;
    stage.setAttribute('viewBox', '0 0 ' + W + ' ' + H); stage.style.aspectRatio = W + ' / ' + H;
    boxes.forEach((b, i) => {
      b.rect = svg('rect', { x: b.x, y: b.y, width: b.w, height: b.h, rx: 10, fill: 'rgba(255,255,255,.02)', stroke: C.line, 'stroke-width': '1' });
      layers.boxes.append(b.rect);
      b.label = svg('text', { x: b.x + b.w / 2, y: b.y + b.h - 7, 'text-anchor': 'middle', 'font-family': 'Georgia, serif', 'font-size': String(12.5 * k / 1.5), fill: C.ink2, text: b.st.label });
      layers.labels.append(b.label);
      if (Array.isArray(b.st.main) && b.st.mainLabels) b.mains.forEach((m, j) => layers.labels.append(svg('text', { x: m.X + m.w / 2, y: m.Y + m.h + 2, 'text-anchor': 'middle', 'font-family': 'ui-monospace, Menlo, monospace', 'font-size': String(9.5 * k / 1.5), fill: C.gold, text: b.st.mainLabels[j] })));
      if (i < boxes.length - 1){
        const n = boxes[i + 1], name = mech.steps[i].name, g = svg('g', {});
        if (n.row === b.row){
          const x1 = b.x + b.w + 6, x2 = n.x - 6, ym = b.y + b.h / 2;
          g.append(svg('line', { x1, y1: ym, x2: x2 - 4, y2: ym, stroke: C.gold, 'stroke-width': '1.6', 'marker-end': 'url(#' + mid + 'f)' }));
          g.append(svg('text', { x: (x1 + x2) / 2, y: ym - 7, 'text-anchor': 'middle', 'font-family': 'ui-monospace, Menlo, monospace', 'font-size': '10', 'letter-spacing': '.08em', fill: C.gold, text: name.toUpperCase() }));
        } else {
          const x1 = b.x + b.w + 6, ym = b.y + b.h / 2, yg = n.y - rowGap / 2, x2 = n.x + 26;
          g.append(svg('path', { d: 'M' + x1 + ' ' + ym + ' H' + (x1 + 14) + ' V' + yg + ' H' + x2 + ' V' + (n.y - 5), fill: 'none', stroke: C.gold, 'stroke-width': '1.6', 'marker-end': 'url(#' + mid + 'f)' }));
          g.append(svg('text', { x: (x1 + 14 + x2) / 2, y: yg - 6, 'text-anchor': 'middle', 'font-family': 'ui-monospace, Menlo, monospace', 'font-size': '10', 'letter-spacing': '.08em', fill: C.gold, text: name.toUpperCase() }));
        }
        b.conn = g; layers.labels.append(g);
      }
    });
    paint(false);
  }
  function paint(animateReveal){
    boxes.forEach((b, i) => {
      const vis = i <= cur.step ? 1 : 0.22;
      for (const p of Object.values(b.parts)){ p.node.style.opacity = String(vis); p.marksG.style.opacity = String(vis); }
      b.rect.setAttribute('stroke', i === cur.step && !cur.done ? C.gold : C.line);
      b.rect.setAttribute('opacity', String(vis));
      b.label.setAttribute('opacity', String(i <= cur.step ? 1 : 0.35));
      if (b.conn) b.conn.setAttribute('opacity', String(i < cur.step ? 0.55 : i === cur.step ? 1 : 0.28));
    });
    layers.arrows.replaceChildren();
    for (let s = 0; s < cur.step; s++) for (const ar of mech.steps[s].arrows){ const p = arrowPath(api, boxes[s], ar, mid, k); if (p){ p.setAttribute('opacity', '0.3'); layers.arrows.append(p); } }
    if (!cur.done && cur.step < mech.steps.length) for (let a = 0; a < cur.arrow; a++){ const p = arrowPath(api, boxes[cur.step], mech.steps[cur.step].arrows[a], mid, k); if (p) layers.arrows.append(p); }
    if (animateReveal && cur.step < boxes.length){ const b = boxes[cur.step]; const D = api.reduced ? 0 : 320; for (const p of Object.values(b.parts)){ p.node.style.transition = 'opacity ' + D + 'ms'; p.marksG.style.transition = 'opacity ' + D + 'ms'; } b.rect.style.transition = 'opacity ' + D + 'ms'; }
    nextBtn.disabled = cur.done; nextBtn.textContent = cur.done ? 'Done' : 'Next arrow';
  }
  function render(){ layout(); }
  function speak(){
    const N = mech.steps.length;
    if (cur.done){ capHead.textContent = 'Done: ' + mech.states[mech.states.length - 1].label; capBody.textContent = mech.after || 'That is the whole mechanism. Reset to push it again, or pick another one.'; return; }
    const st = mech.steps[cur.step];
    capHead.textContent = 'Step ' + (cur.step + 1) + ' of ' + N + ': ' + st.name + '.';
    capBody.textContent = cur.arrow === 0 ? st.say : (st.arrows[cur.arrow - 1].say || st.say);
  }
  function step(){
    if (busy || cur.done) return;
    if (laidHidden && wrap.clientWidth) layout();
    const st = mech.steps[cur.step];
    if (cur.arrow >= st.arrows.length){ reveal(); return; }
    busy = true;
    const p = arrowPath(api, boxes[cur.step], st.arrows[cur.arrow], mid, k);
    cur.arrow++;
    if (p){
      layers.arrows.append(p);
      const D = api.reduced ? 0 : 520;
      let len = 200; try { len = p.getTotalLength(); } catch (e){ len = 200; }
      if (D){ p.setAttribute('stroke-dasharray', String(len)); p.style.strokeDashoffset = String(len); void p.getBoundingClientRect(); p.style.transition = 'stroke-dashoffset ' + D + 'ms ease-out'; p.style.strokeDashoffset = '0'; }
      capHead.textContent = 'Step ' + (cur.step + 1) + ' of ' + mech.steps.length + ': ' + st.name + ', arrow ' + cur.arrow + ' of ' + st.arrows.length + '.';
      capBody.textContent = st.arrows[cur.arrow - 1].say || st.say;
      timers.push(setTimeout(() => { busy = false; if (cur.arrow === st.arrows.length) reveal(); else if (playing) timers.push(setTimeout(() => step(), api.reduced ? 0 : 380)); }, D + 40));
    } else { busy = false; if (cur.arrow === st.arrows.length) reveal(); }
  }
  function reveal(){
    cur.step++; cur.arrow = 0;
    if (cur.step >= mech.steps.length) cur.done = true;
    paint(true); speak();
    if (playing && !cur.done) timers.push(setTimeout(() => step(), api.reduced ? 0 : 900)); else if (cur.done) stopPlay();
  }
  function play(){ if (playing){ stopPlay(); return; } if (cur.done){ cur = { step: 0, arrow: 0, done: false }; render(); } playing = true; playBtn.textContent = 'Pause'; step(); }
  function stopPlay(){ playing = false; playBtn.textContent = 'Play'; timers.forEach(clearTimeout); timers = []; busy = false; }
  let lastW = 0;
  const onResize = () => { const w = wrap.clientWidth; if (w && w !== lastW){ lastW = w; render(); } };
  window.addEventListener('resize', onResize);
  if (typeof ResizeObserver !== 'undefined'){ try { new ResizeObserver(onResize).observe(wrap); } catch (e){} }
  render(); speak();
  return { get mech(){ return mech; }, render, show(id){ const M = MECHS.find(x => x.id === id); if (!M) return; stopPlay(); mech = M; cur = { step: 0, arrow: 0, done: false }; chipEls.forEach((c, i) => c.setAttribute('aria-pressed', MECHS[i] === M ? 'true' : 'false')); render(); speak(); } };
}

/* ------------------------------------------------------------------ */
/* You try: generated items (drawn states, tap targets) alternating     */
/* with bank items.                                                     */
/* ------------------------------------------------------------------ */
function stateSvg(api, st, k){
  const s = api.svg('svg', { role: 'img', 'aria-label': st.label, style: { display: 'block', maxWidth: '100%', height: 'auto' } });
  const id = 'tr' + (++uid); s.append(markerDefs(api, id, api.colors.goldhi));
  const species = api.svg('g', {}); s.append(species);
  const holder = api.el('div', { style: { margin: '0 auto' } }); holder.append(s);
  return { svg: s, holder, id, build(){ const box = buildState(api, species, st, k, 0, 0, { noLabel: true }); box.place(0, 0); s.setAttribute('viewBox', '0 0 ' + box.w + ' ' + box.h); s.style.width = Math.min(box.w, 660) + 'px'; s.style.aspectRatio = box.w + ' / ' + box.h; return box; } };
}
function speciesSvg(api, smi, k, maxW){
  const s = api.svg('svg', { role: 'img', 'aria-label': nameOf(smi), style: { display: 'block', maxWidth: '100%', height: 'auto' } });
  const g = api.svg('g', {}); s.append(g);
  return { svg: s, build(){ const p = prepareSpecies(api, g, smi, k); p.place(0, 0); s.setAttribute('viewBox', '0 0 ' + p.w + ' ' + p.h); s.style.width = Math.min(p.w, maxW || 220) + 'px'; s.style.aspectRatio = p.w + ' / ' + p.h; return p; } };
}
function shortWhy(t){
  const parts = String(t || '').split(/(?<=\.)\s+/);
  let out = '';
  for (const p of parts){ if (/RDKit|\bopt\d|keyed|SMILES/i.test(p)) break; out += (out ? ' ' : '') + p; if (out.length > 190) break; }
  return out || String(t || '');
}
function mountTry(slots, api, opts){
  const { el, svg } = api, C = api.colors;
  const bank = (api.bank && api.bank.items) ? opts.groups.flatMap(g => api.bank.items(g)) : [];
  let item = null, firstTry = true, done = false, turn = 0;
  const box = el('div', { class: 'item' }); slots.try.append(box);
  function verdictGood(){ box.append(el('div', { class: 'verdict good', text: 'You can read it.' }), el('div', { class: 'controls' }, el('button', { class: 'primary', type: 'button', text: 'Another one', onClick: next }))); }
  function commit(ok, coachText){
    if (done) return;
    if (ok){ done = true; api.report(firstTry); api.clearCoach(); verdictGood(); }
    else { if (firstTry) api.report(false); firstTry = false; if (!box.querySelector('.verdict')) box.append(el('div', { class: 'verdict notyet', text: 'Not yet.' })); api.coach(coachText); }
  }
  function optionGrid(choices, correct, coachText, drawn){
    const grid = el('div', { class: 'opts' }), btns = [];
    choices.forEach((c, i) => {
      const b = el('button', { class: 'opt', type: 'button', 'aria-label': c.text || ('choice ' + (i + 1)) });
      b.append(el('span', { class: 'k', text: String.fromCharCode(65 + i) }));
      if (drawn && c.smiles){ const holder = el('div', {}); if (c.text) holder.append(el('div', { style: { fontSize: '13px', color: C.ink2, marginBottom: '2px' }, text: c.text })); const sp = speciesSvg(api, c.smiles, 1.15, 200); holder.append(sp.svg); b.append(holder); b._draw = sp; }
      else b.append(el('span', { text: c.text }));
      b.addEventListener('click', () => { if (done) return; btns.forEach(x => x.classList.remove('picked')); b.classList.add('picked'); if (i === correct){ b.classList.add('ok'); btns.forEach(x => { x.disabled = true; }); commit(true); } else commit(false, coachText); });
      btns.push(b); grid.append(b);
    });
    box.append(grid);
    for (const b of btns) if (b._draw) b._draw.build();
  }
  function solo(st){ return { main: mainsOf(st)[0], with: st.with, side: st.side, label: st.label }; }
  function showState(st){ const sv = stateSvg(api, st, 1.3); box.append(sv.holder); const bx = sv.build(); return { sv, bx }; }
  function renderGenerated(it){
    box.append(el('p', { class: 'prompt', text: it.stem }));
    if (it.M && it.tap){
      const st = solo(it.M.states[it.i]), step = it.M.steps[it.i], ar = step.arrows[it.arrow || 0];
      const { sv, bx } = showState(st);
      const hitLayer = svg('g', {}), marks = svg('g', {}); sv.svg.append(marks, hitLayer);
      const partOf = spec => bx.parts[spec.in || 'main'];
      const pf = partOf(ar.from), pt = partOf(ar.to);
      const fromP = pf && resolve(pf.G, ar.from), toP = pt && resolve(pt.G, ar.to);
      if (!fromP || !toP){ hitLayer.remove(); optionGrid(it.choices, it.correct, it.coach, false); return; }
      const F = pf.T(fromP);
      const hits = [];
      for (const part of Object.values(bx.parts)) for (const h of part.hits()) hits.push(h);
      const near = (h, P) => Math.hypot(h.p.x - P.x, h.p.y - P.y) < 9;
      if (!hits.some(h => near(h, F))) hits.push({ kind: 'lp', p: F, name: ar.fromName });
      const order = { lp: 0, pi: 1, sigma: 2, plus: 3, atom: 4 };
      hits.sort((a, b) => order[a.kind] - order[b.kind]);
      const uniq = []; for (const h of hits) if (!uniq.some(u => Math.hypot(u.p.x - h.p.x, u.p.y - h.p.y) < 7)) uniq.push(h);
      const kk = bx.mains[0].k;
      const prompt = box.querySelector('.prompt');
      prompt.textContent = it.stem + ' Tap it on the drawing.';
      const choose = h => {
        if (done) return;
        if (near(h, F)){ marks.append(svg('circle', { cx: h.p.x, cy: h.p.y, r: 9 * kk / 1.5, fill: 'none', stroke: C.goldhi, 'stroke-width': '2' })); hitLayer.replaceChildren(); commit(true); return; }
        const why = h.kind === 'plus' ? 'A plus has nothing to give. Arrows start at electrons: here ' + ar.fromName + '.'
          : h.kind === 'atom' ? 'The arrow starts at electrons, not at an atom. Here that is ' + ar.fromName + '.'
          : h.kind === 'sigma' && ar.from.mb == null && !(ar.from.t && ar.from.part === 'HB') && ar.from.b == null ? 'That is a plain sigma bond, and sigma electrons do not attack. Start at ' + ar.fromName + '.'
          : 'Rich attacks poor. The electrons that move first are ' + ar.fromName + '.';
        commit(false, why);
      };
      for (const h of uniq){
        const g = svg('g', { role: 'button', tabindex: '0', 'aria-label': h.name, style: { cursor: 'pointer' } });
        g.append(svg('circle', { cx: h.p.x, cy: h.p.y, r: 11 * kk / 1.5, fill: 'transparent' }));
        g.addEventListener('click', () => choose(h));
        g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); choose(h); } });
        hitLayer.append(g);
      }
      return;
    }
    if (it.M && !it.noState) showState(it.M.states[it.i]);
    optionGrid(it.choices, it.correct, it.coach, !!it.drawn);
  }
  function renderBank(b){
    box.append(el('p', { class: 'prompt', text: b.q }));
    if (b.q_smiles){ const holder = el('div', { style: { margin: '0 auto 6px', maxWidth: '340px' } }); api.drawSmiles(holder, b.q_smiles, { width: 300, height: 190, label: 'the structure in the question' }); box.append(holder); }
    box.append(el('p', { class: 'eyebrow', style: { margin: '6px 0 0' }, text: 'From the verified bank, DAT phrasing' }));
    const structural = !!b.opts_are_structures;
    optionGrid(b.opts.map(o => structural ? { text: '', smiles: o } : { text: String(o), smiles: null }), b.correct, shortWhy(b.why), structural);
  }
  function next(){
    box.replaceChildren(); api.clearCoach(); firstTry = true; done = false; turn++;
    const useBank = bank.length && turn % 2 === 0;
    if (useBank){ item = api.pick(bank); renderBank(item); }
    else { item = genItem(api.rng); renderGenerated(item); }
  }
  next();
}

/* ------------------------------------------------------------------ */
/* Panel one: the electrophile factory.                                 */
/* ------------------------------------------------------------------ */
function mountFactory(container, api){
  const { el } = api, C = api.colors;
  let cur = FACTORY[0];
  const holder = el('div', { style: { marginTop: '18px', paddingTop: '14px', borderTop: '1px solid ' + C.line } });
  holder.append(el('div', { class: 'eyebrow', text: 'First make the electrophile. The reagent pair tells you which one.' }));
  const chips = el('div', { class: 'controls', role: 'group', 'aria-label': 'Pick a reagent pair' });
  const stage = el('div', { style: { marginTop: '12px' } });
  const line = el('p', { style: { margin: '10px 0 0', color: C.ink2, fontSize: '15px', maxWidth: '72ch' } });
  const chipEls = FACTORY.map(F => el('button', { class: 'chip', type: 'button', 'aria-pressed': F === cur ? 'true' : 'false', text: F.chip, onClick: () => { cur = F; chipEls.forEach((c, i) => c.setAttribute('aria-pressed', FACTORY[i] === F ? 'true' : 'false')); draw(); } }));
  chips.append(...chipEls);
  holder.append(chips, stage, line);
  container.append(holder);
  function molBox(smi, caption, gold){
    const box = el('div', { class: 'box', style: { borderColor: gold ? C.gold : C.line } });
    const inner = el('div', { style: { maxWidth: '210px', margin: '0 auto' } });
    api.drawSmiles(inner, smi, { width: 200, height: 130, label: caption });
    box.append(inner, el('div', { style: { textAlign: 'center', fontFamily: 'Georgia, serif', fontSize: '14px', color: gold ? C.goldhi : C.ink2, marginTop: '2px' }, text: caption }));
    return box;
  }
  function draw(){
    stage.replaceChildren();
    const row = el('div', { class: 'rxn' });
    row.append(molBox(cur.from, nameOf(cur.from), false));
    row.append(el('div', { class: 'arrow' }, el('span', { class: 'reagent', text: cur.reagent }), el('div', { class: 'line' }), el('span', { text: 'makes the electrophile' })));
    row.append(molBox(cur.to, cur.name, true));
    stage.append(row);
    if (!api.reduced){ const p = row.lastChild; p.style.opacity = '0'; p.style.transition = 'opacity .45s ease'; requestAnimationFrame(() => requestAnimationFrame(() => { p.style.opacity = '1'; })); }
    line.textContent = cur.line;
  }
  draw();
  return { draw };
}

/* ------------------------------------------------------------------ */
/* Panel two: where the plus lands. A hexagon you can attack anywhere.  */
/* ------------------------------------------------------------------ */
function mountDirecting(container, api){
  const { el, svg } = api, C = api.colors;
  let dir = DIRECTORS[0], atk = ATTACKS[2];
  const holder = el('div', { style: { marginTop: '18px', paddingTop: '14px', borderTop: '1px solid ' + C.line } });
  holder.append(el('div', { class: 'eyebrow', text: 'Directing falls out of the arenium ion. Attack somewhere and see where the plus lands.' }));
  const chips = el('div', { class: 'controls', role: 'group', 'aria-label': 'Pick the group already on the ring' });
  const chipEls = DIRECTORS.map(D => el('button', { class: 'chip', type: 'button', 'aria-pressed': D === dir ? 'true' : 'false', title: D.example, text: D.label.split(',')[0], onClick: () => { dir = D; chipEls.forEach((c, i) => c.setAttribute('aria-pressed', DIRECTORS[i] === D ? 'true' : 'false')); draw(); } }));
  chips.append(...chipEls);
  const tabs = el('div', { class: 'controls', role: 'group', 'aria-label': 'Pick where the electrophile attacks' });
  const tabEls = ATTACKS.map(A => el('button', { class: 'chip', type: 'button', 'aria-pressed': A === atk ? 'true' : 'false', text: 'attack ' + A.name, onClick: () => { atk = A; tabEls.forEach((c, i) => c.setAttribute('aria-pressed', ATTACKS[i] === A ? 'true' : 'false')); draw(); } }));
  tabs.append(...tabEls);
  const row = el('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '18px', alignItems: 'flex-start', marginTop: '12px' } });
  const art = el('div', { style: { flex: '0 0 340px', maxWidth: '100%' } });
  const side = el('div', { style: { flex: '1 1 340px', minWidth: '0' } });
  row.append(art, side);
  holder.append(chips, tabs, row);
  container.append(holder);

  const W = 340, H = 300, cx = 170, cy = 156, R = 70;
  const pt = i => { const a = (-90 + (i - 1) * 60) * Math.PI / 180; return { x: cx + R * Math.cos(a), y: cy + R * Math.sin(a) }; };
  const out = (i, d) => { const a = (-90 + (i - 1) * 60) * Math.PI / 180; return { x: cx + (R + d) * Math.cos(a), y: cy + (R + d) * Math.sin(a) }; };
  function draw(){
    art.replaceChildren(); side.replaceChildren();
    const s = svg('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': 'a benzene ring with the arenium plus marked', style: { display: 'block', width: '100%', maxWidth: '340px', height: 'auto', margin: '0 auto' } });
    const pluses = plusPositions(atk.p), hitsGroup = pluses.includes(1);
    const donor = dir.kind === 'donor' || dir.kind === 'halogen';
    // ring skeleton, with the attacked carbon broken out of the circuit
    for (let i = 1; i <= 6; i++){
      const a = pt(i), b = pt(i === 6 ? 1 : i + 1);
      const dead = i === atk.p || (i === 6 ? 1 : i + 1) === atk.p;
      s.append(svg('line', { x1: a.x, y1: a.y, x2: b.x, y2: b.y, stroke: dead ? C.ink3 : C.grey, 'stroke-width': '2', 'stroke-linecap': 'round' }));
    }
    for (let i = 1; i <= 6; i++){
      const a = pt(i);
      const isAtk = i === atk.p, isPlus = pluses.includes(i), isSub = i === 1;
      const col = isAtk ? C.gold : isPlus ? (isSub ? (donor ? C.green : C.amber) : C.coral) : C.line;
      s.append(svg('circle', { cx: a.x, cy: a.y, r: isAtk || isPlus ? 13 : 9, fill: isAtk ? 'rgba(201,168,76,.18)' : isPlus ? 'rgba(224,112,90,.14)' : 'rgba(255,255,255,.03)', stroke: col, 'stroke-width': isAtk || isPlus ? '2' : '1' }));
      if (isPlus){
        s.append(svg('line', { x1: a.x - 4.5, y1: a.y, x2: a.x + 4.5, y2: a.y, stroke: col, 'stroke-width': '2', 'stroke-linecap': 'round' }));
        s.append(svg('line', { x1: a.x, y1: a.y - 4.5, x2: a.x, y2: a.y + 4.5, stroke: col, 'stroke-width': '2', 'stroke-linecap': 'round' }));
      }
      const o = out(i, 28);
      if (isSub) s.append(svg('text', { x: o.x, y: o.y + 4, 'text-anchor': 'middle', 'font-family': 'ui-monospace, Menlo, monospace', 'font-size': '13', fill: donor ? C.blue : C.coral, text: dir.label.split(',')[0] }));
      else if (isAtk) s.append(svg('text', { x: o.x, y: o.y + 4, 'text-anchor': 'middle', 'font-family': 'ui-monospace, Menlo, monospace', 'font-size': '12', fill: C.goldhi, text: 'H and E' }));
      const n = out(i, -20);
      s.append(svg('text', { x: n.x, y: n.y + 3.5, 'text-anchor': 'middle', 'font-family': 'ui-monospace, Menlo, monospace', 'font-size': '10', fill: C.ink3, text: String(i) }));
    }
    s.append(svg('text', { x: cx, y: 17, 'text-anchor': 'middle', 'font-family': 'Georgia, serif', 'font-size': '15', fill: C.goldhi, text: 'attack at carbon ' + atk.p + ', the ' + atk.name + ' position' }));
    s.append(svg('text', { x: cx, y: H - 10, 'text-anchor': 'middle', 'font-family': 'ui-monospace, Menlo, monospace', 'font-size': '10.5', 'letter-spacing': '.06em', fill: C.ink3, text: 'PLUS SITS ON CARBONS ' + pluses.join(', ') }));
    art.append(s);

    const verdict = el('div', { style: { fontFamily: 'Georgia, serif', fontSize: '19px', color: hitsGroup ? (donor ? C.green : C.amber) : C.goldhi, marginBottom: '4px' } });
    const detail = el('p', { style: { margin: '0 0 8px', color: C.ink2, fontSize: '15px', maxWidth: '62ch' } });
    if (!hitsGroup){
      verdict.textContent = 'The plus never touches carbon one.';
      detail.textContent = 'Three ordinary resonance forms and none of them asks the group on carbon one for anything. For a withdrawer that is exactly what you want, so ' + atk.name + ' is the safe route. For a donor it is a wasted opportunity: the donor has help to give and this route never lets it help.';
    } else if (donor){
      verdict.textContent = 'The plus lands on carbon one, and the group is happy to take it.';
      detail.textContent = dir.why;
    } else {
      verdict.textContent = 'The plus lands on carbon one, right where the group is already pulling.';
      detail.textContent = dir.why;
    }
    side.append(verdict, detail);
    const verd = el('div', { style: { borderTop: '1px solid ' + C.line, paddingTop: '10px', marginTop: '4px' } });
    verd.append(el('div', { class: 'eyebrow', text: 'So ' + dir.label.split(',')[0] + ' is' }));
    verd.append(el('div', { style: { fontFamily: 'Georgia, serif', fontSize: '20px', color: C.goldhi, margin: '2px 0 2px' }, text: dir.sends }));
    verd.append(el('div', { style: { fontFamily: 'ui-monospace, Menlo, monospace', fontSize: '12px', letterSpacing: '.06em', color: dir.strength.includes('deactivating') ? C.amber : C.green }, text: dir.strength.toUpperCase() }));
    verd.append(el('p', { style: { margin: '8px 0 0', fontSize: '14px', color: C.ink3, maxWidth: '62ch' }, text: 'Halogens are the one pair that splits: deactivating (induction pulls) and still ortho-para (a lone pair helps when the plus lands next door). Everything else lines up.' }));
    side.append(verd);
  }
  draw();
  return { draw };
}

export function mount(slots, api){
  mountStage(slots, api, { mechanisms: MECHANISMS });
  mountFactory(slots.visual, api);
  mountDirecting(slots.visual, api);
  mountTry(slots, api, { groups: ['eas-reactions', 'eas-directing'] });
}
