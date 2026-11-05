// Original, authored offline teaching. No network requests or generated tutor replies.
// Examples are separate teaching cases, not answers copied from reserved item banks.
// Internal content review is not independent SME certification or evidence of efficacy.
import { objectives as bioObjectives } from './bio.mjs';
import { objectives as scienceObjectives } from './science.mjs';
import { objectives as skillObjectives } from './skills.mjs';

const objectiveIndex = new Map([...bioObjectives, ...scienceObjectives, ...skillObjectives].map(o => [o.id, o]));
const revisedGuides = new Set(['bio-diffusion', 'bio-transport', 'gc-barrier', 'gc-catalyst', 'gc-equilibrium', 'qr.rates']);
function teach(objectiveId, core, terms, assumptions, prompt, steps, answer, commonMistake, nextAction) {
  const objective = objectiveIndex.get(objectiveId);
  if (!objective) throw new Error(`Teaching refers to an unknown objective: ${objectiveId}`);
  return {
    objectiveId, version: revisedGuides.has(objectiveId) ? 2 : 1, core,
    terms: terms.map(([term, meaning]) => ({ term, meaning })),
    assumptions, workedExample: { prompt, steps, answer }, commonMistake, nextAction,
    sourceUrls: [...objective.sourceUrls], reviewStatus: 'internal-review'
  };
}

const teaching = [
  teach('bio-diffusion',
    'Particles in these solutions move randomly because of thermal energy; this is thermal motion. They do not need an ATP-powered pump to keep moving. If an uncharged substance can pass through a membrane, more of it tends to cross from its higher concentration toward its lower concentration than the other way. That overall difference is net diffusion. Equal concentrations can balance the crossings without stopping individual particles.',
    [
      ['Membrane', 'A thin boundary. Check which substances this particular boundary lets through.'],
      ['Concentration', 'The amount of a substance per volume of solution, not the total amount in the whole container.'],
      ['Gradient', 'A difference between two places; here, a difference in concentration.'],
      ['Net', 'The overall result after subtracting movement in the opposite direction.'],
      ['Thermal motion', 'Random molecular movement associated with temperature. Passive diffusion uses this ongoing motion; passive does not mean that particles have no energy.'],
      ['ATP', 'Adenosine triphosphate, a molecule whose breakdown reaction can supply energy for cellular work. The passive dye movement here does not require an ATP-powered pump.'],
      ['mM', 'Millimoles per liter, a concentration unit. In these comparisons, a larger number means more of the same substance per liter.']
    ],
    ['The substance has no electrical charge and can cross.', 'Temperature and pressure match. There is no powered pump, linkage to another solute\'s movement, or imposed bulk flow of liquid.'],
    'Two chambers contain the same neutral dye: left 6 mM, right 18 mM. The dividing membrane passes the dye. Which way is its initial net movement?',
    [
      'Name the substance being tracked: the dye, not water.',
      'Check the path: the membrane allows that dye to cross.',
      'Compare concentrations of this same dye: 18 on the right is greater than 6 on the left.',
      'Predict net right-to-left movement. Some individual dye particles can still move left to right.'
    ],
    'The initial net dye movement is from right to left.',
    'Do not compare container sizes or total particle counts when the question supplies concentrations. Do not interpret net movement as every particle moving one way.',
    'Identify the moving substance, check permeability, then compare its concentrations.'),

  teach('bio-transport',
    'Simple and facilitated diffusion are both passive movement down a gradient. The difference is the path. Simple diffusion goes directly through the membrane material; facilitated diffusion uses a membrane protein such as a channel or carrier. A protein is not automatically an energy-powered pump. Energy coupling means linking transport to an energy-releasing process, such as ATP breakdown or another substance moving downhill, that can drive transport uphill.',
    [
      ['Lipid bilayer', 'The two-layer fatty material that forms the main body of a cell membrane.'],
      ['Channel', 'A membrane protein that provides a passage for particular substances.'],
      ['Carrier', 'A membrane protein that binds a substance and changes shape to move it across.'],
      ['Downhill and uphill', 'For the neutral substance here, downhill means from higher toward lower concentration; uphill means against that concentration gradient.'],
      ['Energy coupling', 'Linking processes so a favorable process can drive another one. A transporter can use ATP breakdown or another substance\'s downhill movement to drive uphill transport.'],
      ['Passive', 'Movement down the relevant gradient without being driven by an ATP-powered pump or another coupled energy source. Using a protein alone does not make movement active.'],
      ['ATP', 'Adenosine triphosphate. Its breakdown reaction can supply energy for cellular work. No direct ATP use does not by itself prove transport is passive: another substance\'s gradient can supply the drive.']
    ],
    ['The example follows a neutral substance, so there is no electrical gradient to include.', 'The protein is not coupled to ATP or a second substance moving down another gradient.'],
    'An uncharged nutrient is 12 mM outside and 4 mM inside. It enters only through a carrier, with no energy coupling. Is the described entry simple diffusion, facilitated diffusion, or active transport?',
    [
      'Check direction: entry goes from 12 outside toward 4 inside, so it is downhill.',
      'Check the route: the nutrient uses a carrier rather than crossing directly through lipid.',
      'Check energy coupling: the carrier is not using ATP breakdown or another substance\'s downhill movement to drive this transport.',
      'Combine these facts: a protein facilitates passive downhill movement.'
    ],
    'Facilitated diffusion.',
    'Using a protein does not by itself make transport active. A passive carrier also does not have to carry material permanently in just one direction.',
    'Separate the question into direction, physical route, and energy coupling.'),

  teach('bio-osmosis',
    'Osmosis concerns water crossing a selective membrane. First check that water can cross. With equal starting pressure and solutes that cannot cross, water initially moves net toward the side with more dissolved particles per volume. Water can still move both ways. Pressure differences can oppose this tendency.',
    [
      ['Solute', 'A substance dissolved in a liquid, such as dissolved sugar in water.'],
      ['Permeable', 'Able to let the named substance cross. A membrane can pass water but block a solute.'],
      ['Nonpenetrating solute', 'A solute that cannot cross this membrane over the time being considered.'],
      ['mOsm/L', 'A unit counting dissolved-particle concentration. Compare these numbers only after checking which particles can cross.'],
      ['Initial', 'At the beginning, before movement has significantly changed the concentrations or pressures.']
    ],
    ['Water crosses; all specified solute particles are trapped.', 'The two sides begin at equal temperature and pressure.'],
    'A membrane separates 75 mOsm/L on the left from 125 mOsm/L on the right. Water crosses but solute does not. Starting pressure is equal. Predict the initial net water direction.',
    [
      'Confirm that the moving substance in this question is water.',
      'Confirm that water has a path through the membrane and the solute is trapped.',
      'Compare the trapped-particle concentrations: 125 on the right is greater than 75 on the left.',
      'Predict net water movement to the right. Do not claim a final volume without considering later concentration and pressure changes.'
    ],
    'Water initially moves net from left to right.',
    'A concentration difference cannot make water cross a water-impermeable boundary. Also, this trapped-solute rule does not replace checking pressure or solute permeability.',
    'State what crosses and what stays trapped before predicting water movement.'),

  teach('bio-tonicity',
    'Tonicity describes a surrounding solution by its lasting effect on a particular cell volume. Osmolarity counts all dissolved particles, including ones that can cross. In this simple model, freely permeant solute eventually becomes equally concentrated inside and outside; the nonpenetrating solute determines the lasting volume comparison. Early shrinkage or swelling can differ from the later result.',
    [
      ['Bath', 'The solution surrounding the cell.'],
      ['Osmolarity', 'Total dissolved-particle concentration, whether or not those particles can cross the membrane.'],
      ['Tonicity', 'The bath\'s effect on this cell\'s volume after permeant solute has equilibrated.'],
      ['Permeant', 'Able to cross the membrane during the stated observation time.'],
      ['Equilibrates', 'Reaches the stated balance; here, the freely permeant solute reaches equal concentrations across the membrane.'],
      ['Isotonic', 'Producing no lasting change in this cell\'s volume under the stated model.']
    ],
    ['Water and solute P cross; solute N does not.', 'The bath is large, the cell remains intact, and there is no active volume regulation or meaningful pressure difference.', 'Compare the later state after P equilibrates, not an unspecified early instant.'],
    'A cell initially contains 150 mOsm/L of trapped N and no P. Its bath contains 150 mOsm/L N plus 50 mOsm/L freely permeant P. In the stated model, does its later volume differ from its original volume?',
    [
      'The bath total is 150 + 50 = 200 mOsm/L, but total osmolarity alone does not answer the later-volume question.',
      'P can cross. At the later balance, P contributes equally to particle concentration inside and outside.',
      'Compare N, which cannot cross: bath N is 150 and initial cell N is also 150 mOsm/L.',
      'No lasting volume change is required to balance N. A transient change may occur depending on the relative crossing speeds, but that is not the requested later result.'
    ],
    'The later cell volume returns to its original value in this ideal model; the bath is isotonic to this cell.',
    'Do not automatically call a bath hypertonic just because its total particle concentration is higher. Identify the nonpenetrating particles and the observation time.',
    'Sort each solute into can-cross or cannot-cross, then decide whether the question asks about early movement or later volume.'),

  teach('bio-animal',
    'An animal cell has a flexible membrane and no supporting cell wall. When water crosses but the stated solutes stay trapped, a more concentrated bath makes water move out and the cell shrink; a less concentrated bath makes it swell. Very large swelling can rupture the membrane, but a small increase does not prove rupture.',
    [
      ['Hypertonic', 'A bath that makes this cell lose water and shrink in the stated model.'],
      ['Hypotonic', 'A bath that makes this cell gain water and swell in the stated model.'],
      ['Isotonic', 'A bath that maintains the cell\'s average volume, even though water still crosses both ways.'],
      ['Lysis', 'Rupture of the cell membrane; it can follow excessive swelling.']
    ],
    ['Water crosses and every stated solute is nonpenetrating.', 'The bath is large; initial pressure is equal; no active volume regulation occurs.'],
    'An animal cell starts with 250 mOsm/L of trapped particles and enters a 200 mOsm/L bath of nonpenetrating particles. What initial change is expected, and is immediate rupture guaranteed?',
    [
      'Compare trapped-particle concentrations: the cell starts higher than the bath.',
      'Water initially moves net into the cell under these assumptions.',
      'Water entry increases volume, so the cell swells.',
      'The information predicts swelling, not its exact size or an inevitable immediate rupture.'
    ],
    'Initial swelling is expected. Immediate rupture is not guaranteed.',
    'A direction-of-change prediction is not a measurement of the final volume or membrane failure. The same bath can affect different starting cells differently.',
    'Predict water direction first, then translate entry into swelling or exit into shrinking.'),

  teach('bio-plant',
    'A plant cell has both a selective membrane and a supporting wall outside it. The wall is not a seal against water. As water enters, the cell contents press against the wall and pressure builds. That pressure can balance the osmotic tendency, stopping net entry while water molecules keep crossing.',
    [
      ['Cell wall', 'A supporting layer outside the membrane that resists excessive expansion.'],
      ['Turgor pressure', 'The internal pressure associated with cell contents pressing against the supporting wall.'],
      ['Turgid', 'Firm from turgor pressure.'],
      ['Flaccid', 'Lacking substantial turgor pressure.'],
      ['Plasmolysis', 'Withdrawal of the membrane and contents from the wall after enough water is lost.']
    ],
    ['The plant cell is alive with an intact wall and water-permeable membrane.', 'The stated solutes cannot cross; initial pressure does not already block water entry.'],
    'A plant cell initially contains 250 mOsm/L of trapped particles and is placed in a 100 mOsm/L bath. Water initially enters. Why need it not keep swelling without limit?',
    [
      'The initial trapped-solute comparison favors water entry.',
      'Entry expands the cell contents against the wall.',
      'The wall resists expansion, allowing opposing internal pressure to rise.',
      'The pressure contribution can balance the osmotic tendency. No net entry does not mean water stopped crossing.'
    ],
    'The wall supports pressure buildup that can oppose further net water entry.',
    'Do not say the cell wall blocks all water. Mechanical support and membrane permeability are different properties.',
    'Ask separately whether water can cross and whether pressure resists its net entry.'),

  teach('gc-barrier',
    'A reaction-energy diagram shows a starting level, a high point along a pathway, and an ending level. The activation barrier is the climb from the relevant starting level to the high point. It is not the entire height above zero or the start-to-end difference. The actual reaction Gibbs energy change tells which net direction is favored for the current mixture at fixed temperature and pressure, not how fast the reaction runs.',
    [
      ['Reactants', 'The chemicals on the starting side of the reaction as written.'],
      ['Products', 'The chemicals on the ending side of the reaction as written.'],
      ['Activation energy', 'The energy barrier associated with reaching the transition region from the starting reactants in this simple profile.'],
      ['kJ/mol', 'Kilojoules per mole: an energy quantity per chemical amount. A mole is a counting unit for particles.'],
      ['Thermodynamic direction', 'Whether net forward or reverse change is favored under the stated conditions. This is separate from kinetics, which concerns how fast change occurs.'],
      ['Gibbs energy change', 'The energy-change measure used here to judge net direction for the current mixture. At fixed temperature and pressure, a negative actual value favors forward change, a positive value favors reverse change, and zero corresponds to reaction equilibrium. It is not the activation barrier.'],
      ['Actual versus standard', 'Actual reaction Gibbs energy uses the current mixture. A standard-state value refers to specified reference conditions and cannot automatically replace the actual value.']
    ],
    ['This worked diagram represents one barrier on a potential-energy profile.', 'Potential energy is not being treated as the actual reaction Gibbs energy.'],
    'A pathway starts at 12 kJ/mol, rises to 62 kJ/mol, and ends at 22 kJ/mol. Find the forward barrier, reverse barrier, and endpoint difference.',
    [
      'Forward means starting from reactants: subtract 12 from 62 to get 50 kJ/mol.',
      'Reverse means starting from the original products: subtract 22 from 62 to get 40 kJ/mol.',
      'The endpoint difference is end minus start: 22 - 12 = +10 kJ/mol.',
      'These are three different quantities. The potential-energy endpoint difference alone does not supply the actual reaction Gibbs energy or prove spontaneity.'
    ],
    'Forward barrier: 50 kJ/mol. Reverse barrier: 40 kJ/mol. Endpoint difference: +10 kJ/mol.',
    'Using the peak value alone forgets the starting level. Using the endpoint difference answers a different question.',
    'Circle the requested starting state, then measure the climb to the peak.'),

  teach('gc-catalyst',
    'A catalyst offers another reaction pathway with a lower effective barrier: a smaller energy hurdle for the reaction to proceed along that pathway. It is regenerated overall, meaning it may change during individual steps but is restored by the end of the complete catalytic cycle. For the same reaction at the same temperature, it does not change the reactant or product energy levels or the equilibrium constant. It can help the reaction approach its equilibrium composition sooner; it does not choose a new equilibrium destination.',
    [
      ['Catalyst', 'A substance that speeds a reaction through an alternative pathway and is restored in the complete catalytic cycle.'],
      ['Pathway', 'The sequence of chemical steps connecting reactants to products.'],
      ['Effective barrier', 'The energy hurdle relevant to the reaction rate. In this simplified one-peak model, measure it from the starting level to the peak, not from zero.'],
      ['Regenerated overall', 'The catalyst may be changed or used in an early step, then restored in later steps. It is not used up by the complete reaction as written.'],
      ['Equilibrium', 'A balance of opposing reaction rates that leaves composition unchanged overall.'],
      ['Equilibrium expression', 'A reaction-specific calculation based on its balanced equation and the specified forms of the substances. For a supplied A <=> B example, it can be [B]/[A], meaning B concentration divided by A concentration; other reactions need their own expression.'],
      ['Equilibrium constant K', 'The value of that reaction-specific calculation when the mixture is at equilibrium at the stated temperature. A catalyst changes how quickly that balance is approached, not the value of K.'],
      ['Endpoint', 'The starting reactant state or ending product state, rather than an intermediate point along the pathway.']
    ],
    ['Compare the same reaction at the same temperature.', 'The one-peak drawings are simplified teaching profiles, not the structure of every real catalytic mechanism.'],
    'Reactants are at 8 kJ/mol and products at 18 kJ/mol. An original peak of 88 becomes an alternative peak of 48 kJ/mol. What changes and what stays fixed?',
    [
      'The original forward barrier is 88 - 8 = 80 kJ/mol.',
      'The alternative forward barrier is 48 - 8 = 40 kJ/mol.',
      'The endpoint difference stays 18 - 8 = +10 kJ/mol.',
      'At the same temperature, K stays fixed. A faster pathway does not by itself mean a greater equilibrium yield.'
    ],
    'The forward barrier falls from 80 to 40 kJ/mol. The +10 kJ/mol endpoint difference and K remain unchanged.',
    'Do not replace "reaches equilibrium sooner" with "has more product at equilibrium." They describe time and final composition respectively.',
    'Check the pathway height separately from the endpoints and the equilibrium target.'),

  teach('gc-equilibrium',
    'At dynamic equilibrium, forward and reverse reactions continue at equal rates. Concentrations can be unequal. An equilibrium expression is a reaction-specific calculation based on the balanced equation and specified forms of the substances. Use the expression supplied here. Q is its value for the current mixture; K is its value at equilibrium at the stated temperature. Compare Q with K to determine the net direction toward equilibrium.',
    [
      ['A <=> B', 'The written reaction can proceed from A to B and from B to A.'],
      ['[A]', 'The concentration of A; the square brackets mean concentration, not multiplication.'],
      ['M', 'Moles per liter, a concentration unit.'],
      ['Ratio', 'A comparison made by division. Here [B]/[A] compares B concentration with A concentration: B is the top value, or numerator, and A is the bottom value, or denominator.'],
      ['Equilibrium expression', 'The particular calculation used for this reaction. Other balanced reactions can require different substances or powers, so do not assume that every expression is [B]/[A].'],
      ['Reaction quotient Q', 'The result of that calculation using the mixture as it is now, whether or not it has reached equilibrium.'],
      ['K', 'The target value of that expression at equilibrium at the stated temperature.'],
      ['Endothermic', 'Absorbing heat in the direction written. Raising temperature increases K for an endothermic forward reaction.']
    ],
    ['For this example only, the given expression is Q = [B]/[A] for A <=> B.', 'Temperature and volume remain fixed during equilibration.'],
    'The current mixture has [A] = 0.30 M and [B] = 0.60 M. At this temperature K = 6. With Q = [B]/[A], which net direction leads toward equilibrium?',
    [
      'Read the supplied ratio as B concentration divided by A concentration. Calculate Q = 0.60 / 0.30 = 2.',
      'Compare current and target: 2 is less than 6.',
      'The B-to-A ratio needs to rise. Net conversion of A into B raises B concentration, the top value, and lowers A concentration, the bottom value.',
      'The mixture approaches Q = K. At that point opposing rates balance; the concentrations do not have to match each other.'
    ],
    'Net forward reaction, from A to B.',
    'Compare Q with K, not each value with 1. Do not assume every reaction has the simple [B]/[A] expression used in this example.',
    'Write the supplied Q expression, calculate it, then compare it with the same-temperature K.'),

  teach('oc-electrons',
    'A full curved arrow tracks an electron pair, not an atom moving through space. Begin at an existing pair in a lone pair or bond and end where that pair will go. In a substitution, the incoming donor pair forms a bond to carbon while the old carbon-leaving-group bond pair moves onto the leaving group. In carbonyl addition, a new bond to carbon is accompanied by moving the C=O pi pair to oxygen.',
    [
      ['Lone pair', 'Two outer electrons on an atom that are not currently being shared in a bond.'],
      ['Nucleophile', 'An electron-pair donor that forms a bond to an electron-poor site.'],
      ['Electrophile', 'A site that accepts an electron pair to form a bond.'],
      ['Leaving group', 'The group that departs with the old bond\'s electron pair in the substitution considered here.'],
      ['CH3', 'A carbon with three attached hydrogens. C, H, O, and Br mean carbon, hydrogen, oxygen, and bromine.'],
      ['Carbonyl and octet', 'A carbonyl contains C=O. An ordinary carbon in these reactions has at most eight electrons around it; adding a bond cannot simply leave five bonds on that carbon.']
    ],
    ['The example is explicitly a concerted substitution, not a request to choose between competing mechanisms.', 'The negative oxygen has a donating lone pair; other unshown lone pairs still exist.'],
    'Ethoxide, CH3CH2O-, substitutes for Br in CH3Br. Trace both electron pairs and identify the products of this step.',
    [
      'Find the donor: the negatively charged ethoxide oxygen has a lone pair available for the new bond.',
      'Draw that pair toward the carbon in CH3Br, making a new O-C bond.',
      'Move the old C-Br bond pair onto Br at the same time.',
      'Oxygen now connects the ethyl group to the methyl group. Bromine leaves with a negative charge.'
    ],
    'The products are CH3CH2OCH3 and Br-. The arrows start at the oxygen lone pair and the C-Br bond.',
    'An arrow cannot begin at an electron-poor carbon simply because that is the atom being attacked. Begin at the electrons being donated.',
    'For each arrow, name its electron-pair source first and its destination second.'),

  teach('oc-sn2-conditions',
    'SN2 is a substitution in which a nucleophile reaches the side of carbon opposite the leaving group. Crowding can block that approach. Evaluate the substrate, nucleophile, leaving group, and solvent together. An unhindered primary alkyl site often supports SN2; a tertiary site blocks ordinary SN2 even in a favorable solvent.',
    [
      ['Substrate', 'The molecule being attacked in the reaction.'],
      ['Primary alkyl carbon', 'A saturated reacting carbon attached to one other carbon. Methyl has no carbon neighbors.'],
      ['Tertiary alkyl carbon', 'A saturated reacting carbon attached to three other carbons.'],
      ['Steric hindrance', 'Crowding that makes the required approach difficult. Nearby branching matters too.'],
      ['Polar aprotic solvent', 'A polar solvent without an O-H or N-H group that donates hydrogen bonds in this comparison, such as DMSO.'],
      ['Protic solvent', 'A solvent with a hydrogen-bond-donating O-H or N-H group, such as methanol; it can strongly stabilize an anionic nucleophile.']
    ],
    ['Compare the same suitable anionic nucleophile, leaving group, solvent, and temperature.', 'This is a substrate comparison, not a claim that SN2 is the only possible outcome under unspecified conditions.'],
    'Compare 1-bromopentane, CH3CH2CH2CH2CH2Br, with 2-bromo-2-methylbutane, (CH3)2C(Br)CH2CH3. Which provides the more accessible site for ordinary SN2?',
    [
      'Locate the carbon bonded directly to Br in each structure.',
      'In 1-bromopentane, that carbon is CH2 attached to one other carbon: primary and unbranched nearby.',
      'In the other substrate, the Br-bearing carbon is attached to two methyl groups and an ethyl group: tertiary.',
      'Prefer the accessible primary site for this SN2 comparison. A polar aprotic solvent cannot remove the tertiary crowding.'
    ],
    '1-Bromopentane offers the more accessible ordinary SN2 site.',
    'Do not decide mechanism from solvent alone or assume every primary substrate reacts equally fast. An adjacent bulky group can strongly hinder a primary center.',
    'Locate the reacting carbon and check crowding before using solvent or nucleophile clues.'),

  teach('oc-sn2-path',
    'In SN2, a new bond forms as the leaving-group bond breaks in one concerted step. There is no separately existing carbocation between those events. Backside attack inverts the arrangement at a reacting stereogenic carbon. Its final R/S label must be assigned using the product priorities. The simple rate law is rate = k[substrate][nucleophile].',
    [
      ['Concerted', 'Bond changes occur within the same reaction step, without a discrete intermediate between them.'],
      ['Backside attack', 'Approach toward the reacting carbon from opposite its bond to the leaving group.'],
      ['Stereogenic carbon', 'A carbon whose substituent arrangement can give distinct stereoisomers; here it has four different groups.'],
      ['Inversion', 'The characteristic reversal of spatial arrangement at that reacting center.'],
      ['R/S', 'Configuration labels assigned from the geometry and priority ranking of the actual attached groups.'],
      ['Rate law', 'An expression connecting reaction rate to concentrations. k is constant only under the specified fixed conditions.']
    ],
    ['The mechanism is established as SN2, and the reacting center remains stereogenic.', 'Temperature and solvent stay fixed for the rate comparison.'],
    'A known SN2 reaction occurs at a stereogenic carbon. Separately, its nucleophile concentration is tripled while substrate concentration stays fixed. What happens to the geometry and the initial rate?',
    [
      'Use the specified mechanism: the nucleophile approaches opposite the leaving group.',
      'Bond formation and departure occur in one step, producing geometric inversion at the reacting center.',
      'Do not automatically swap R and S: rank the product groups before assigning its label.',
      'For rate = k[substrate][nucleophile], the multiplier is 1 for substrate times 3 for nucleophile, giving 3.'
    ],
    'The geometry inverts, and the initial rate becomes three times as large. The product R/S label needs its own priority assignment.',
    'A transition state is not a carbocation intermediate. Geometric inversion is not a universal rule to change every R letter into S.',
    'Keep three questions separate: the sequence of bond changes, the spatial result, and any rate-law calculation.'),

  teach('pat.one-fold',
    'A punch goes through every paper layer beneath it. Opening a fold returns the moved layer across its crease. The hole on that layer appears the same distance on the opposite side. This is reflection, not sliding the hole along a row or turning the whole sheet.',
    [
      ['Crease', 'The line along which the paper was folded.'],
      ['Layer', 'One thickness of paper underneath the punch.'],
      ['Reflect', 'Place a matching point at the same distance on the other side of a line.'],
      ['Row and column', 'Rows run horizontally and are numbered from the top; columns run vertically and are numbered from the left in these examples.']
    ],
    ['The punch is away from the crease and edges and passes through both layers.', 'The sheet is not rotated; numbered locations refer to the original flat sheet.'],
    'Use a six-row, six-column sheet for this teaching example. Fold its left half onto its right half. Punch at row 2, column 5 of the original grid. Where are the holes after opening it?',
    [
      'The vertical crease is between columns 3 and 4.',
      'One hole is in the stationary right half at row 2, column 5.',
      'Reflect column 5 across that crease: columns 1 and 6 pair, 2 and 5 pair, and 3 and 4 pair.',
      'The reflected hole is row 2, column 2. A vertical reflection does not change the row.'
    ],
    'Two holes: row 2, column 2 and row 2, column 5.',
    'Do not reflect across a horizontal crease when the paper was folded vertically. Do not move the hole into the next row.',
    'Find the actual crease and pair locations equally far from its two sides.'),

  teach('pat.two-folds',
    'Undo folds in reverse order. Each opening returns a layer across its own crease. With the two full half-folds used here, a punch away from creases passes through four layers. Work one reflection at a time rather than guessing a symmetric-looking pattern.',
    [
      ['Reverse order', 'Undo the most recent fold first, then the earlier fold.'],
      ['Vertical crease', 'A top-to-bottom fold line; reflection changes columns while preserving rows.'],
      ['Horizontal crease', 'A left-to-right fold line; reflection changes rows while preserving columns.'],
      ['Original coordinates', 'Locations numbered on the full flat sheet, even while part of it is folded over.']
    ],
    ['For this worked example the sheet has six rows and six columns.', 'The left half folds right, then the bottom half folds up. The punch misses both creases and the sheet does not rotate.'],
    'After those two folds, punch at original row 2, column 5. List the holes after completely opening the sheet.',
    [
      'Start with the punch at row 2, column 5.',
      'Undo the horizontal fold first. Row 2 reflects to row 5, leaving column 5 unchanged.',
      'Now undo the vertical fold. Each column-5 hole reflects to column 2, preserving its row.',
      'The two row positions combine with the two column positions to make four distinct holes.'
    ],
    'Holes at (row 2, column 2), (row 2, column 5), (row 5, column 2), and (row 5, column 5).',
    'Accounting for only one crease misses layers. Four holes are not a universal rule for every possible fold; they follow from the specific folds and off-crease punch here.',
    'Write the fold order, reverse it, and reflect the current set of holes at each step.'),

  teach('qr.rates',
    'A rate tells how much work happens per unit of time. If two independent workers help on the same job simultaneously, add matching rates, not their separate completion times. An opposing flow is subtracted. For trips done one after another, calculate each time and then add the times.',
    [
      ['Rate', 'Work or distance divided by time, such as orders per hour or kilometers per hour.'],
      ['Fraction', 'A fraction a/b means a divided by b, with b not zero. In this parts-of-an-order example, 1/12 means one of twelve equal parts of one order.'],
      ['Numerator and denominator', 'The numerator is the top number and the denominator is the bottom number. In 1/12, 1 counts one part and 12 tells how many equal parts make the whole order.'],
      ['Common denominator', 'A shared bottom number that lets fractions count equal-sized parts. Multiplying both top and bottom by the same nonzero number changes the notation, not the fraction\'s value.'],
      ['Reciprocal', 'For a nonzero fraction, swap its top and bottom: the reciprocal of 1/3 is 3/1. Inverting a rate also inverts its units: orders per hour becomes hours per order.'],
      ['1/12 order per hour', 'One twelfth of a whole order is completed in each hour.'],
      ['Simultaneous', 'Operating at the same time.'],
      ['Constant rate', 'The contribution per unit time does not change during the calculation.'],
      ['Time = work / rate', 'Divide the amount needed by how much is completed per time unit.']
    ],
    ['Each machine works at a constant rate, and their contributions add without interference.', 'They work on one shared order from the start, with no opposing process.'],
    'Machine A finishes one order in 12 hours; B finishes one in 4 hours. How long do they need together?',
    [
      'Convert times to rates by dividing work by time: A completes 1 order / 12 hours = 1/12 order per hour; B completes 1 order / 4 hours = 1/4 order per hour.',
      'Make the parts the same size before adding. Multiply both top and bottom of 1/4 by 3: (1 x 3)/(4 x 3) = 3/12. One quarter is three twelfths.',
      'Add the counts of twelfths: 1/12 + 3/12 = (1 + 3)/12 = 4/12 order per hour. Keep the denominator 12 because the size of each part has not changed.',
      'Simplify by dividing top and bottom by 4: 4/12 = 1/3 order per hour. Together they finish one third of the order each hour.',
      'Find time = work / rate. Dividing by a nonzero fraction means multiplying by its reciprocal: 1 order / (1/3 order per hour) = 1 order x 3 hours per order = 3 hours. The order units cancel.',
      'Check: 3 hours is less than either machine\'s solo time. At one third of an order each hour, three hours complete one whole order.'
    ],
    'They finish one order in 3 hours.',
    'Averaging or adding the solo times combines the wrong quantities. Write units beside each number before combining them.',
    'Convert every contribution to work per unit time before deciding whether to add or subtract.'),

  teach('qr.algebra',
    'Choose a letter for the unknown and say what it means. Translate each part of the story into an expression. Keep an equation balanced by performing the same operation on both sides, then substitute your answer back into the original story.',
    [
      ['Variable', 'A symbol such as x standing for a quantity whose value is not yet known.'],
      ['3x', 'Three times x, not x plus three.'],
      ['Equation', 'A statement that two expressions have the same value.'],
      ['Fixed charge', 'An amount added once, regardless of the number of purchased items.'],
      ['Substitute', 'Replace a variable with a proposed number to check the statement.']
    ],
    ['The three packets have the same individual price.', 'The fixed delivery charge applies once, not once per packet.'],
    'Three identical packets plus one 4-credit delivery charge cost 31 credits. What is the price of one packet?',
    [
      'Let x be the price of one packet in credits.',
      'Three packets cost 3x, so 3x + 4 = 31.',
      'Subtract 4 from both sides: 3x = 27.',
      'Divide both sides by 3: x = 9.',
      'Check the story: three packets at 9 each plus 4 delivery cost 27 + 4 = 31.'
    ],
    'One packet costs 9 credits.',
    'Dividing the full bill by three would spread the one-time delivery charge into the packet price. Remove the fixed charge first.',
    'Name the unknown and write one equation before calculating.'),

  teach('qr.compare',
    'A quantitative comparison asks which quantity is larger, whether they are equal, or whether the given conditions leave more than one possible relationship. Your conclusion must hold for every permitted value. A single convenient example can suggest an answer but does not always prove it.',
    [
      ['Quantity', 'A number or expression whose size you are comparing.'],
      ['Positive', 'Greater than zero; zero itself is not positive.'],
      ['Restriction', 'A condition limiting which values a variable can have.'],
      ['Cannot be determined', 'Different allowed values can produce different comparison results.'],
      ['Squared', 'Multiplied by itself: x squared means x times x.']
    ],
    ['The worked example explicitly restricts x to positive real numbers.', 'Use the stated restriction, not an unstated guess about x.'],
    'x is positive. Compare Quantity A = 2x with Quantity B = x.',
    [
      'Find their difference: A - B = 2x - x = x.',
      'The given restriction says x > 0, so A - B is positive.',
      'Therefore A is greater for every allowed x.',
      'Notice why the restriction matters: if negative x were allowed, multiplying it by two would make it more negative instead.'
    ],
    'Quantity A is greater under the stated positive-x condition.',
    'Do not import rules like "multiplication always makes bigger." The sign and size of the factor matter; positive fractions below one behave differently.',
    'List the restrictions, then compare by subtraction, a valid inequality, or counterexamples.'),

  teach('qr.sufficiency',
    'Information is sufficient when it fixes the requested value or yes/no answer uniquely. Test each statement alone without borrowing facts from the other. If neither alone is sufficient, test their combination. The goal is deciding whether an answer is determined, not doing unnecessary arithmetic.',
    [
      ['Sufficient', 'Enough to determine one definite answer to the specific question.'],
      ['Statement alone', 'Use that statement and the question setup, but not the other statement.'],
      ['Unique', 'Only one value or yes/no outcome fits all the information being used.'],
      ['Counterexample', 'Another allowed case that produces a different answer and shows the information is insufficient.']
    ],
    ['All containers have equal mass and the target is their combined mass.', 'No count or individual mass is known except through the two statements.'],
    'Can the combined mass of identical containers be determined? Statement I: there are 5 containers. Statement II: each container has mass 4 kg.',
    [
      'Use I alone: five containers could be light or heavy, so their total mass is not fixed.',
      'Use II alone: each is 4 kg, but the number of containers is unknown.',
      'Combine I and II: five times 4 kg gives one total, 20 kg.',
      'The classification is together sufficient, neither alone sufficient.'
    ],
    'Together sufficient; neither statement alone is sufficient.',
    'Do not use Statement II while claiming to test Statement I alone. Also, a yes/no question can be sufficient even when the answer is definitely no.',
    'Mark I alone, II alone, then together, always checking the exact quantity or decision asked.'),

  teach('rc.purpose',
    'The main purpose describes what the whole passage is trying to do, not just its most memorable detail. Ask what each part contributes: posing a question, explaining a test, reporting results, limiting a claim, or suggesting future work. Choose a purpose broad enough to cover the passage without adding a new argument.',
    [
      ['Purpose', 'The job the author is accomplishing with the passage.'],
      ['Main point', 'The central idea connecting the important parts of the passage.'],
      ['Structure', 'How parts of the passage are arranged and what role each plays.'],
      ['Qualification', 'Language that limits how broadly or confidently a claim applies.']
    ],
    ['The following miniature passage is original and hypothetical, not a report of a real experiment.', 'Answer from the passage; no outside knowledge of sensors is needed.'],
    'Passage: A team compared two temperature sensors in one chamber. Their readings agreed near room temperature but diverged near freezing. The authors recommended testing a wider range before treating the sensors as interchangeable. What is the main purpose?',
    [
      'The opening introduces a comparison of two sensors.',
      'The middle reports where they agree and disagree.',
      'The ending limits the conclusion and recommends more testing.',
      'A matching purpose combines the comparison with its limitation, rather than claiming either sensor is always wrong.'
    ],
    'To describe a sensor comparison and explain why broader testing is needed before claiming interchangeability.',
    'Do not choose a broad claim such as "prove all sensors are inaccurate" from a limited comparison. A detail about freezing is not the whole purpose.',
    'Summarize each paragraph\'s job in a few words, then connect those jobs.'),

  teach('rc.evidence',
    'Evidence is the information the passage actually supplies to support a proposed answer. Locate the relevant statement, preserve its conditions, and connect multiple parts when needed. A fact you remember from science cannot replace evidence in the given passage.',
    [
      ['Evidence', 'An observation or statement in the passage that supports a claim.'],
      ['Claim', 'A proposed conclusion or assertion to check.'],
      ['Condition', 'A restriction such as the tested sample, temperature, place, or time.'],
      ['Integrate', 'Combine relevant information from more than one part of the text.']
    ],
    ['The mini-passage is original and hypothetical.', 'Use only what it says; do not invent missing measurements.'],
    'Passage: Two identical boxes received equal starting volumes of water. After one hour in the same room, the uncovered box had lost 6 mL and the covered box 2 mL. Neither box leaked. Which observation supports lower water loss in the covered condition?',
    [
      'Find the comparison the question asks about: measured water loss in covered versus uncovered boxes.',
      'Locate the two amounts: covered lost 2 mL; uncovered lost 6 mL.',
      'Check the conditions: equal starting volumes, one hour, same room, and no leaks.',
      'State the supported comparison without claiming every possible cover works in every environment.'
    ],
    'In the stated trial, the covered box lost 2 mL while the uncovered box lost 6 mL over the same hour.',
    'Do not substitute a familiar explanation for the measured evidence when the question asks what was observed.',
    'Point to the passage information that makes your proposed answer true, including its limits.'),

  teach('rc.inference',
    'An inference goes beyond repeating one sentence but must still follow from the supplied information. Link what the passage establishes and stop before adding an unsupported cause, certainty, population, or time period. A possible explanation is not automatically a demonstrated explanation.',
    [
      ['Inference', 'A conclusion justified by combining or interpreting the passage information.'],
      ['Observation', 'What the passage reports was measured or noticed.'],
      ['Assumption', 'An extra statement treated as true without being established in the passage.'],
      ['Association', 'Two things occurring together; this alone need not show that one caused the other.']
    ],
    ['The mini-passage is original and hypothetical.', 'No random assignment or control of the stated temperature difference is supplied.'],
    'Passage: In an observational comparison, trays given a new nutrient mixture sprouted earlier. Those trays were also kept in a warmer room. Temperature was not controlled separately. What is a justified conclusion about the mixture?',
    [
      'Identify the observation: earlier sprouting occurred in the trays receiving the mixture.',
      'Identify the second difference: those trays also had a warmer room.',
      'Because temperature was not separately controlled, the comparison does not isolate the mixture as the cause.',
      'This does not prove the mixture is ineffective either; it identifies a limit in what the evidence determines.'
    ],
    'The comparison does not establish that the nutrient mixture alone caused earlier sprouting.',
    'Do not turn "the study does not prove an effect" into "the effect is impossible." Lack of isolation limits the conclusion in both directions.',
    'List what is established, identify any extra assumption your answer needs, and remove unsupported certainty.'),

  teach('rc.tone',
    'Tone and stance describe how the author treats the subject. Use the complete discussion: enthusiasm can coexist with caution, and a limitation does not automatically mean rejection. Match the degree of confidence and approval rather than choosing from one emotional-sounding word.',
    [
      ['Tone', 'The attitude conveyed by the author\'s language and treatment of the subject.'],
      ['Stance', 'The author\'s position toward a claim, method, or interpretation.'],
      ['Cautious', 'Avoiding conclusions stronger than the evidence permits.'],
      ['Dismissive', 'Treating something as unworthy of serious consideration.'],
      ['Tentative', 'Provisional and open to revision with further evidence.']
    ],
    ['The mini-passage is original and hypothetical.', 'Judge the stated evaluation, not your own opinion of the device.'],
    'Passage: The prototype measured room noise consistently in the initial trial. This promising result merits further testing, although performance in a busy street has not yet been evaluated. Which stance fits?',
    [
      'Notice the positive evaluation: consistent results are called promising.',
      'Notice the limit: street performance has not been evaluated.',
      'Combine them: the author favors further investigation without claiming universal success.',
      'Reject both extremes: complete rejection and unconditional endorsement.'
    ],
    'Cautiously favorable toward the prototype and supportive of further testing.',
    'The word "although" introduces a limit; it does not erase every positive statement before it.',
    'Pair the author\'s positive or negative evaluation with the level of certainty actually expressed.')
];

export const teachingByObjective = Object.freeze(Object.fromEntries(teaching.map(entry => [entry.objectiveId, entry])));
