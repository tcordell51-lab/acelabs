// Selected instructional adaptations, not a second Canon or an assessment bank.
// Sources are pinned to the actual ace-system bytes, also present unchanged in
// producer checkpoint D. Source corrections are explicit; authoring is untouched.
// Importing this module does not register content, render, fetch, or record progress.
const freeze = value => {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
};

export const CANON_DISCOVERY_SOURCES = freeze([
  {id:'bio-membrane-transport',version:'0.2.1',sourceRelativePath:'visuals/sheets/bio/bio-membrane-transport.json',sourceSha256:'11666ab830c65c0e37d6bc90b14613b0138e3aa8be9a16c2631c5557a2dcca9d'},
  {id:'bio-cell-organelles',version:'0.1.0',sourceRelativePath:'visuals/sheets/bio/bio-cell-organelles.json',sourceSha256:'2f90108a1bf7474133bdc5a9d750e842dca97f1962db1aaf2d7370d3e48e2abd'},
  {id:'bio-enzyme-kinetics',version:'0.2.1',sourceRelativePath:'visuals/sheets/bio/bio-enzyme-kinetics.json',sourceSha256:'d75fd5c08479e175ab9eb8f247375f46df13cc552f17bb64f787b89b87985ae9'},
  {id:'gc-equilibrium-q-k',version:'0.2.1',sourceRelativePath:'visuals/sheets/gchem/gc-equilibrium-q-k.json',sourceSha256:'8e4eb3534293a1c0e833fbc86e27725bf9fcdc5c3ec1dd01c366e5a487217551'},
  {id:'qr-percent-change',version:'0.3.0',sourceRelativePath:'visuals/sheets/qr/qr-percent-change.json',sourceSha256:'9c71ba5ff21ea0d44a69da28b195b165c14ed02154c9df6975e9c7c7b12db1b8'},
  {id:'rc-passage-map',version:'0.2.0',sourceRelativePath:'visuals/sheets/rc/rc-passage-map.json',sourceSha256:'74c7f73d36759c4e6b19626fa3dca2ae5f9c550806fa6da708b7dc9dd8405b17'},
  {id:'pat-hole-punching',version:'0.2.1',sourceRelativePath:'visuals/sheets/pat/pat-hole-punching.json',sourceSha256:'7f306aeef2863a4ab5a7430a9b22c598704ec45ac674c8b38ba95c232ea6bf3a'},
  {id:'pat-angle-ranking',version:'0.1.1',sourceRelativePath:'visuals/sheets/pat/pat-angle-ranking.json',sourceSha256:'bf50f34064e03bdc6734e97d9aa2372a3521b350dc53c1dc94da3c8e54308d6d'}
]);
const sourceById = Object.fromEntries(CANON_DISCOVERY_SOURCES.map(source => [source.id, source]));
const BIO_PASSIVE='https://openstax.org/books/biology-2e/pages/5-2-passive-transport';
const BIO_ACTIVE='https://openstax.org/books/biology-2e/pages/5-3-active-transport';
const BIO_CARGO='https://openstax.org/books/biology-2e/pages/4-4-the-endomembrane-system-and-proteins';
const ENZYMES='https://iubmb.qmul.ac.uk/kinetics/ek4t6.html';
const EQUILIBRIUM='https://openstax.org/books/chemistry-2e/pages/13-2-equilibrium-constants';
const PERCENT='https://openstax.org/books/prealgebra-2e/pages/6-2-solve-general-applications-of-percent';
const PAT='https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/perceptual_ability_test_section_instructions.pdf';

const card = (id, sourceId, details) => ({
  id, adaptationVersion:1, source:{repository:'ace-system',schema:'ace-visual-canon/1',...sourceById[sourceId]},
  reviewStatus:'internal-reviewed-selected-explanation',
  reviewScope:'Only the explanation and qualifications in this card; not the complete source, its checks, or its visualizer.',
  integrationStatus:'candidate-not-registered',
  displayPolicy:'after-guided-commit-or-explicit-help',
  evidenceKind:'instruction-exposure',
  progressGradingEligible:false, storyUnlockEligible:false,
  importsSourceAssessments:false, importsSourceRuntime:false,
  familyNovelty:'unestablished',
  ...details
});

export const CANON_DISCOVERY_LINKS = freeze([
  card('canon-discovery-membrane-path','bio-membrane-transport',{
    title:'A path and a driving difference',world:'bio',objectiveIds:['bio-diffusion','bio-transport'],
    activityIds:['bio-selective-gate-repair'],modelIds:['diffusion'],
    canonicalPointers:['/key/0','/key/1','/traps/1'],
    assumptions:['The activity follows a neutral solute: the open-path comparison permits passage and the sealed contrast blocks it.','Electrical effects, active coupling and membrane damage are outside this model.'],
    beforeCommit:'Name the particle being tracked and inspect whether its path is open.',
    afterCommit:{explanation:'For this neutral solute, a concentration difference supports net passive movement toward the less concentrated side only when the membrane provides a path. Individual particles still move both ways. A channel or carrier can provide the path without directly consuming ATP.',misconception:'The presence of a transport protein does not by itself establish active transport.',nextAction:'Compare the same starting mixture with the path closed and open.'},
    corrections:[{canonicalPointer:'/key/2',qualification:'Moving against an electrochemical gradient requires coupled energy; direct ATP use is not the definition of every active transporter. This card teaches only the neutral passive case.'}],
    sourceUrls:[BIO_PASSIVE,BIO_ACTIVE]
  }),
  card('canon-discovery-water-path','bio-membrane-transport',{
    title:'Water movement depends on the membrane',world:'bio',objectiveIds:['bio-osmosis','bio-tonicity','bio-animal'],
    activityIds:['bio-cell-dock-repair'],modelIds:[],
    canonicalPointers:['/key/4','/traps/0','/worked/steps/0','/worked/steps/2'],
    assumptions:['Water can cross in the open-path comparisons; the sealed contrast blocks it. All compared solutes remain nonpenetrating.','Initial pressure is equal, the bath is large, and the intact animal-cell model has no wall or active volume regulation.'],
    beforeCommit:'Check water permeability and identify which solutes are trapped before comparing the two sides.',
    afterCommit:{explanation:'Under these conditions, a more dilute outside solution favors net water entry; a more concentrated outside solution favors net exit. Equal effective concentrations produce no net volume change, although water molecules can still cross. With the water path sealed, this model has no osmotic flow.',misconception:'Total solute concentration alone is insufficient when some solutes can cross. Tonicity is relative to this cell and its membrane.',nextAction:'Keep the cell unchanged and compare the consequences of changing only the bath.'},
    corrections:[{canonicalPointer:'/key/4',qualification:'Replace the unqualified water-follows-solute shortcut with explicit permeability, nonpenetrating-solute and pressure assumptions.'},{canonicalPointer:'/worked/prompt',qualification:'Do not teach the source shorthand 0.9% solute as a universal intracellular composition. No numerical version of that example is imported.'}],
    sourceUrls:[BIO_PASSIVE]
  }),
  card('canon-discovery-cargo','bio-cell-organelles',{
    title:'Separate the message from the protein',world:'bio',objectiveIds:['bio-cargo'],
    activityIds:[],modelIds:['cargo'],
    canonicalPointers:['/key/0','/key/1','/traps/0','/worked/steps'],
    assumptions:['A nuclear-encoded protein in a nucleated animal cell.','The secreted example uses conventional ER/Golgi transport; the contrasting soluble cytosolic protein has no organelle-targeting signal.'],
    beforeCommit:'Identify the protein destination, then distinguish its instructions from the protein itself.',
    afterCommit:{explanation:'The nucleus supplies an RNA message; the protein does not begin its shipping journey inside the nucleus. Translation starts on a ribosome. Targeting of a conventionally secreted protein brings its growing chain into rough ER, followed by Golgi processing and vesicle delivery. A soluble cytosolic protein remains outside that route.',misconception:'The Golgi processes and sorts cargo; it does not translate the message. Free and ER-associated ribosomes are not permanently different ribosome species.',nextAction:'Trace the message and cargo as separate paths and name the final destination.'},
    corrections:[{canonicalPointer:'/key/0',qualification:'Distinguish nuclear information from the location of the synthesized protein; do not draw a protein moving nucleus→ER.'},{canonicalPointer:'/worked',qualification:'Insulin is initially synthesized as a precursor and processed before secretion; this card stays at compartment level.'}],
    sourceUrls:[BIO_CARGO]
  }),
  card('canon-discovery-enzyme-rate','bio-enzyme-kinetics',{
    title:'Read the saturation curve',world:'bio',objectiveIds:['bio-enzyme-rate'],
    activityIds:[],modelIds:['enzyme'],
    canonicalPointers:['/key/0','/traps/2'],
    assumptions:['Single-substrate Michaelis–Menten initial rates, fixed active-enzyme amount and fixed temperature/pH.','No cooperativity, substrate depletion or enzyme damage.'],
    beforeCommit:'Inspect which axis shows substrate concentration and which shows initial rate.',
    afterCommit:{explanation:'In this model v = Vmax[S]/(Km + [S]). Increasing substrate approaches the limiting rate Vmax. At [S] = Km, the rate is one-half of that curve’s own Vmax. Km is a kinetic parameter; it is not universally a substrate-binding dissociation constant.',misconception:'A curve can approach its limiting rate without reaching an exact ceiling at a finite substrate concentration.',nextAction:'Locate half of the displayed limiting rate, then read its substrate concentration.'},
    corrections:[{canonicalPointer:'/key/0',qualification:'Remove the unconditional low-Km-means-tight-binding shortcut.'},{canonicalPointer:'/traps/2',qualification:'Interpret Km through the specified rate equation rather than universal binding affinity.'}],
    sourceUrls:[ENZYMES]
  }),
  card('canon-discovery-enzyme-inhibition','bio-enzyme-kinetics',{
    title:'Compare specified inhibition patterns',world:'bio',objectiveIds:['bio-enzyme-inhibition'],
    activityIds:[],modelIds:['enzyme'],
    canonicalPointers:['/key/2','/key/3','/traps/0'],
    assumptions:['Reversible competitive or explicitly pure noncompetitive inhibition in the stated single-substrate model.','Compare the same active-enzyme amount and fixed conditions; the curves represent separate initial-rate assays.'],
    beforeCommit:'Compare the selected curve with its enzyme-alone reference under the same conditions.',
    afterCommit:{explanation:'The simple competitive pattern preserves Vmax while increasing apparent Km. Pure noncompetitive inhibition lowers Vmax without changing Km. A rate decrease at one substrate concentration cannot distinguish these patterns; compare how the whole curve changes.',misconception:'Binding away from the active site does not by itself establish pure noncompetitive kinetics. Mixed inhibition is also possible.',nextAction:'Compare the limiting rates first, then each curve’s half-limiting-rate concentration.'},
    corrections:[{canonicalPointer:'/key/3',qualification:'Use pure noncompetitive, the equal-inhibitor-constant special case; do not equate any remote binding site with unchanged Km.'}],
    sourceUrls:[ENZYMES]
  }),
  card('canon-discovery-qk','gc-equilibrium-q-k',{
    title:'Compare the mixture now with equilibrium',world:'gc',objectiveIds:['gc-equilibrium'],
    activityIds:[],modelIds:['equilibrium'],
    canonicalPointers:['/key/0','/key/1','/key/2','/key/3','/key/4','/traps/0'],
    assumptions:['Ideal concentration model for A + B ⇌ 2 C at fixed temperature and volume.','Positive concentrations, a specified reaction and standard states, and no competing reactions.'],
    beforeCommit:'Identify the balanced reaction and the concentrations used in the current mixture.',
    afterCommit:{explanation:'For this model Q = [C]²/([A][B]). Compare Q with K: below K favors net formation of C; above K favors net consumption of C. At exact equality the opposing rates are equal. Reaction progress changes A and B by −x and C by +2x; those linked changes come from the balanced coefficients.',misconception:'Equal opposing rates do not require equal concentrations or stopped reactions. A numerical tolerance is an approximate display rule, not a physical interval of equilibrium.',nextAction:'Track all three concentration changes together and recompute Q.'},
    corrections:[{canonicalPointer:'/key/0',qualification:'Only pure solids and pure liquids have constant activity omitted in the usual equilibrium expression; dissolved species and liquid mixtures are not excluded wholesale.'},{canonicalPointer:'/key/4',qualification:'Temperature dependence refers to a fixed reaction and standard-state definition. This activity holds both fixed.'}],
    sourceUrls:[EQUILIBRIUM]
  }),
  card('canon-discovery-percent-base','qr-percent-change',{
    title:'Keep the starting amount visible',world:'qr',objectiveIds:['qr-percent-base'],
    activityIds:['qr-strategy-detective'],modelIds:['percent'],
    canonicalPointers:['/key/4','/traps/2'],
    assumptions:['A positive, nonzero starting amount and quantities in matching units.','Percent change and percentage-point change are different requests.'],
    beforeCommit:'Name the starting amount and state what the question asks you to compare.',
    afterCommit:{explanation:'Percent change compares the difference with the starting amount: 100 × (new − old)/old. The ending amount is not the denominator for this forward comparison. Reversing the direction changes the starting amount, so the return percentage generally differs.',misconception:'An amount can be a stated percent of the original without having increased by that percent.',nextAction:'Mark the denominator before calculating or interpreting a displayed percentage.'},
    corrections:[],sourceUrls:[PERCENT]
  }),
  card('canon-discovery-percent-chain','qr-percent-change',{
    title:'Carry the amount into the next change',world:'qr',objectiveIds:['qr-percent-chain'],
    activityIds:['qr-strategy-detective'],modelIds:['percent'],
    canonicalPointers:['/key/0','/key/1','/traps/0'],
    assumptions:['Each stated percentage acts on the amount immediately before that change.','No intermediate rounding, fixed additions, caps or changing percentage rules in the pure multiplier comparison.'],
    beforeCommit:'Locate the amount that each successive percentage acts on.',
    afterCommit:{explanation:'Represent an increase of p percent by 1 + p/100 and a decrease by 1 − p/100. Multiply the current amount by each factor in sequence. Adding the signed percentages ignores the changing base. Constant percentage factors commute under these assumptions; mixed fixed-amount operations need their stated order.',misconception:'Equal percentage increases and decreases do not usually cancel because they act on different amounts.',nextAction:'Keep the intermediate amount visible and use it as the next step’s base.'},
    corrections:[{canonicalPointer:'/key/1',qualification:'The order claim is restricted to fixed multiplicative factors without intervening operations or rounding.'}],
    sourceUrls:[PERCENT]
  }),
  card('canon-discovery-passage-map','rc-passage-map',{
    title:'Map a paragraph’s job',world:'rc',objectiveIds:['rc.purpose','rc-passage-structure'],
    activityIds:['reading-evidence-detective'],modelIds:['evidence'],
    canonicalPointers:['/key/0','/traps/0','/traps/1'],
    assumptions:['Use only the supplied original passage and its stated limits.','This is an optional short-passage navigation method, not a validated full-section pacing prescription.'],
    beforeCommit:'Read the passage and distinguish each paragraph’s topic from what it does for the explanation.',
    afterCommit:{explanation:'A short paragraph label helps you return to evidence. Its topic says what it discusses; its role says what it contributes, such as a question, observation, comparison or limitation. Connect the roles to explain the passage’s organization and overall purpose.',misconception:'A highlighted keyword or a single interesting detail does not establish the whole passage purpose.',nextAction:'Check that the proposed purpose fits the beginning, middle and ending rather than one sentence.'},
    corrections:[{canonicalPointer:'/key/0',qualification:'Do not assume every paragraph begins with an explicit topic sentence.'},{canonicalPointer:'/key/4',qualification:'A search cue locates text; it does not replace reading its relevant context.'}],
    sourceUrls:[]
  }),
  card('canon-discovery-passage-evidence','rc-passage-map',{
    title:'A flag locates evidence; the text supports the claim',world:'rc',objectiveIds:['rc.evidence'],
    activityIds:['reading-evidence-detective'],modelIds:['evidence'],
    canonicalPointers:['/key/1','/key/2','/key/3','/key/4','/traps/2','/worked/steps/1'],
    assumptions:['The current passage is the evidence source; no outside subject knowledge is required.','Some claims require several sentences or paragraphs.'],
    beforeCommit:'Identify the group, condition and claim named in the question, then locate the relevant text.',
    afterCommit:{explanation:'Use a distinctive word or paragraph map to find a possible evidence location. Reread enough context to identify the correct group, condition and qualification. Restate what that text supports before choosing a claim; nearby facts about a different group are not interchangeable.',misconception:'A keyword match is a navigation clue, not proof. An observation does not automatically establish its cause.',nextAction:'Point to the supporting words and explain how they justify the proposed claim.'},
    corrections:[{canonicalPointer:'/key/4',qualification:'Replace the nearest-sentence shortcut with the amount of context the claim actually requires.'}],
    sourceUrls:[]
  }),
  card('canon-discovery-paper-layers','pat-hole-punching',{
    title:'Reverse one fold at a time',world:'pat',objectiveIds:['pat.one-fold','pat.two-folds'],
    activityIds:['pat-mirror-ferry','pat-layer-lock'],modelIds:['paper'],
    canonicalPointers:['/key/0','/key/1','/key/2','/traps/0','/traps/1','/traps/2'],
    assumptions:['The current activities use a six-by-six grid and full half-folds, with punches away from creases.','Track actual paper coverage; these activities do not teach the source’s quarter-flap or diagonal extensions.'],
    beforeCommit:'Locate the punch and identify the last piece that crossed a crease.',
    afterCommit:{explanation:'Undo the most recent fold first. Reflect a hole only where the moved paper actually covered that position. Then undo the earlier fold using its own crease. The grid tracks positions; it is not a rule to double every visible hole regardless of paper coverage.',misconception:'A two-fold packet still contains a hidden fold after the first unfolding. Reading its intermediate pattern as the final sheet stops too early.',nextAction:'Name the moving piece and crease before adding each reflected position.'},
    corrections:[{canonicalPointer:'/key/3',qualification:'Do not turn holes-equal-layers into an unrestricted counting rule at creases or for arbitrary partial folds.'}],
    sourceUrls:[PAT]
  }),
  card('canon-discovery-angle-opening','pat-angle-ranking',{
    title:'Compare the opening at the vertex',world:'pat',objectiveIds:['pat-angle-opening','pat-angle-order'],
    activityIds:['pat-angle-switchyard','pat-angle-ordering'],modelIds:['angle'],
    canonicalPointers:['/key/0','/key/2','/traps/0','/traps/2'],
    assumptions:['Compare minor interior angles at the same isotropic display scale.','After commitment, rigidly rotate or reflect the teaching drawings without changing their openings.'],
    beforeCommit:'Locate each vertex and the two rays that define the opening.',
    afterCommit:{explanation:'Changing ray length changes the distance between tips without changing the angle. Rotation and reflection also preserve its opening. For an ordered set, use consistent pairwise comparisons and confirm that the final list runs from the smallest opening to the largest.',misconception:'A wider gap between distant ray tips can come from longer rays rather than a larger angle.',nextAction:'After your commitment, align the teaching rays for inspection and then return to an unaligned comparison.'},
    corrections:[{canonicalPointer:'/key/3',qualification:'No timed answer requirement, target score or performance promise is imported.'}],
    sourceUrls:[PAT]
  })
]);

// This helper is a lookup only. The caller must select a relevant card and persist
// exposure for exactly its displayed objectiveIds before revealing its content.
// Do not show cards over an unanswered independent check unless help was requested.
export function canonDiscoveryLinksForObjective(objectiveId) {
  return CANON_DISCOVERY_LINKS.filter(card => card.objectiveIds.includes(objectiveId));
}
