// Original DATQUEST preview content. Internal authoring/review, not SME certification.
// No copied questions or passages. References establish scope and task conventions.
const ADA = 'https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/dat_candidate_guide.pdf';
const PAT = 'https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/perceptual_ability_test_section_instructions.pdf';
const reviewed = { reviewStatus: 'internal-review', sourceUrls: [ADA] };

export const objectives = [
  { id: 'pat.one-fold', world: 'pat', name: 'Hole punching: one crease', lesson: 'Track which layers lie under the punch. When a fold opens, the hole in the moved layer returns to the opposite side of that crease at the same distance. Our practice sheet uses four rows and four columns. Coordinates used by the figure start at the upper left. These introductory single-crease tasks teach a building block of the more complex DAT task.', ...reviewed, sourceUrls: [PAT] },
  { id: 'pat.two-folds', world: 'pat', name: 'Hole punching: two creases', lesson: 'Undo the last fold first. In this chapter the left half folds onto the right, then the bottom half folds upward. A punch through the resulting quarter passes through four layers. Reflect the holes across the horizontal crease, then the vertical crease. The sheet never turns or twists.', ...reviewed, sourceUrls: [PAT] },
  { id: 'qr.rates', world: 'qr', name: 'Build a rate model', lesson: 'A rate states how much work or distance is completed per unit time. Add simultaneous contributions in matching units; subtract an opposing flow. For successive trips, find each segment time and add those times. State constant-rate assumptions before calculating.', ...reviewed },
  { id: 'qr.algebra', world: 'qr', name: 'Translate a linear relationship', lesson: 'Choose a variable with a stated meaning. Translate each quantity and fixed contribution into an equation, then apply the same operation to both sides. Check the result in the original situation, including its units.', ...reviewed },
  { id: 'qr.compare', world: 'qr', name: 'Compare quantities under stated conditions', lesson: 'Compare using the given restrictions, rather than a convenient example that may not represent every allowed case. Squaring can make a positive number between zero and one smaller. Adding a negative number makes a real number smaller.', ...reviewed },
  { id: 'qr.sufficiency', world: 'qr', name: 'Decide whether information is sufficient', lesson: 'Ask whether the requested quantity or yes/no result is uniquely determined. Evaluate each statement by itself, then combine them if neither alone is enough. You do not need more arithmetic once uniqueness is established.', ...reviewed },
  { id: 'rc.purpose', world: 'rc', name: 'Identify purpose and passage structure', lesson: 'Use the whole passage to identify the author\'s purpose. Notice what job each paragraph performs: introducing a question, describing a method, reporting observations, qualifying a conclusion, or proposing a next step. A vivid detail is not necessarily the main point.', ...reviewed },
  { id: 'rc.evidence', world: 'rc', name: 'Locate and integrate passage evidence', lesson: 'Keep the passage available. Check a proposed answer against the exact observation, comparison, and conditions described. An answer may require linking two parts of the passage. A familiar scientific fact cannot replace the evidence in this text.', ...reviewed },
  { id: 'rc.inference', world: 'rc', name: 'Make a bounded inference', lesson: 'An inference must follow from the passage without adding an unsupported assumption. Distinguish a measured result from a proposed explanation. Words such as may, only, always, and because can change the strength of a claim.', ...reviewed },
  { id: 'rc.tone', world: 'rc', name: 'Read the author\'s stance', lesson: 'Judge the author\'s position from the discussion as a whole. Reporting a limitation does not mean dismissing a study. A cautious author can regard a result as useful while withholding a stronger conclusion.', ...reviewed },
];

function item(data) {
  return { ...reviewed, ...data };
}

// PAT authoring geometry. x increases rightward; y increases downward.
// Vertical: left half onto right. Horizontal: bottom half onto top.
// Both: vertical first, horizontal second. The punch uses original-sheet coordinates.
function normalize(points) {
  return [...new Map(points.map(([x, y]) => [`${x},${y}`, [x, y]])).values()]
    .sort((a, b) => a[1] - b[1] || a[0] - b[0]);
}
function reflect(points, axis) {
  return normalize(points.flatMap(([x, y]) => axis === 'vertical' ? [[x, y], [3 - x, y]] : [[x, y], [x, 3 - y]]));
}
function unfolded(axis, punch) {
  let result = [punch];
  if (axis === 'horizontal' || axis === 'both') result = reflect(result, 'horizontal');
  if (axis === 'vertical' || axis === 'both') result = reflect(result, 'vertical');
  return normalize(result);
}
function locationText(points) {
  return normalize(points).map(([x, y]) => `row ${y + 1}, column ${x + 1}`).join('; ');
}
function patItem(id, pool, axis, punch, answer) {
  const correct = unfolded(axis, punch);
  const partial = [punch];
  const wrongMirror = axis === 'both' ? reflect([punch], 'vertical') : reflect([punch], axis === 'vertical' ? 'horizontal' : 'vertical');
  const shift = normalize(correct.map(([x, y]) => axis === 'vertical' ? [x, (y + 1) % 4] : [(x + 1) % 4, y]));
  const entries = [
    { holes: correct, feedback: `This preserves the layer positions. The opened sheet has holes at ${locationText(correct)}.` },
    { holes: partial, feedback: 'This keeps only the marked punch. It omits the holes made in the other folded layers.' },
    { holes: wrongMirror, feedback: axis === 'both' ? 'This accounts for the vertical fold but omits the additional layers from the horizontal fold.' : 'This mirrors the punch across a crease that was not used. Reflect across the actual crease.' },
    { holes: shift, feedback: 'This pattern shifts the holes. Opening a crease reflects a layer at the same distance; it does not slide the punch to the next row or column.' },
  ];
  const ordered = entries.slice(1);
  ordered.splice(answer, 0, entries[0]);
  const instructions = axis === 'vertical' ? 'The left half folds onto the right half.' : axis === 'horizontal' ? 'The bottom half folds onto the top half.' : 'First the left half folds onto the right. Then the bottom half folds onto the top.';
  return item({
    id, world: 'pat', objectiveId: axis === 'both' ? 'pat.two-folds' : 'pat.one-fold', familyId: `pat.fold.${axis}`, pool,
    prompt: `${instructions} A hole is punched through every layer at the marked point. Which pattern shows the fully opened sheet?`,
    choices: ['Pattern A', 'Pattern B', 'Pattern C', 'Pattern D'], answer,
    hint: axis === 'both' ? 'Undo the horizontal fold first, then the vertical fold. Each fold brings another layer under the punch.' : 'Imagine returning the folded layer across its crease. Keep each hole the same distance from that crease.',
    explanation: `${instructions} Opening the folds gives ${correct.length} holes: ${locationText(correct)}. The paper has not been rotated.`,
    feedback: ordered.map((entry) => entry.feedback), sourceUrls: [PAT],
    figure: { type: 'fold', axis, punch, size: 4 },
    choiceFigures: ordered.map((entry) => ({ type: 'holes', size: 4, holes: normalize(entry.holes) })),
    actionLabel: 'Open the bridge',
  });
}

const patItems = [
  patItem('pat-p1', 'practice', 'vertical', [2, 0], 1),
  patItem('pat-p2', 'practice', 'horizontal', [0, 1], 3),
  patItem('pat-p3', 'practice', 'vertical', [3, 2], 0),
  patItem('pat-p4', 'practice', 'horizontal', [2, 0], 2),
  patItem('pat-p5', 'practice', 'both', [2, 0], 1),
  patItem('pat-p6', 'practice', 'both', [3, 1], 3),
  patItem('pat-c1', 'check', 'vertical', [3, 1], 2),
  patItem('pat-c2', 'check', 'horizontal', [1, 0], 0),
  patItem('pat-c3', 'check', 'horizontal', [3, 1], 3),
  patItem('pat-c4', 'check', 'both', [2, 1], 1),
  patItem('pat-l1', 'later', 'vertical', [2, 3], 3),
  patItem('pat-l2', 'later', 'vertical', [3, 3], 1),
  patItem('pat-l3', 'later', 'horizontal', [3, 0], 0),
  patItem('pat-l4', 'later', 'both', [3, 0], 2),
];

const qrItems = [
  item({ id: 'qr-p1', world: 'qr', objectiveId: 'qr.rates', familyId: 'qr.rates.combine', pool: 'practice',
    prompt: 'Pump A fills an empty reservoir in 6 hours; Pump B fills it in 3 hours. Both have constant, independent flow rates. With both running and no outflow, how long does one empty reservoir take to fill?',
    choices: ['4.5 hours', '2 hours', '9 hours', '3 hours'], answer: 1,
    hint: 'Write each rate in reservoirs per hour, then add the rates.',
    explanation: 'The combined rate is 1/6 + 1/3 = 1/2 reservoir per hour. One reservoir takes 1 divided by 1/2, or 2 hours.',
    feedback: ['Averaging the separate completion times does not add the simultaneous flow rates.', 'Correct. The two rates add to one-half reservoir per hour.', 'Adding the times would describe doing two whole jobs successively, not filling one reservoir together.', 'Three hours is Pump B alone. Pump A adds a positive flow.'],
    figure: { type: 'rates', a: 6, b: 3, unit: 'hours for one reservoir' }, actionLabel: 'Restart the pumps' }),
  item({ id: 'qr-p2', world: 'qr', objectiveId: 'qr.rates', familyId: 'qr.rates.net', pool: 'practice',
    prompt: 'A pump fills a reservoir in 8 hours. An outlet empties a full reservoir in 12 hours. Assume both rates remain constant whenever they operate. Starting empty, the pump and outlet operate together. How long until the reservoir is full?',
    choices: ['4 hours', '10 hours', '20 hours', '24 hours'], answer: 3,
    hint: 'The outlet opposes the pump. Subtract rates expressed in reservoirs per hour.',
    explanation: 'Net flow is 1/8 - 1/12 = 1/24 reservoir per hour. Filling one reservoir therefore takes 24 hours under the stated constant-rate model.',
    feedback: ['Subtracting completion times does not subtract the flows.', 'Averaging the times does not model an opposing flow.', 'Adding completion times does not give the net fill time.', 'Correct. The net inflow is one twenty-fourth of a reservoir per hour.'], actionLabel: 'Set the valve' }),
  item({ id: 'qr-p3', world: 'qr', objectiveId: 'qr.rates', familyId: 'qr.rates.segments', pool: 'practice',
    prompt: 'Ratior travels 60 km at a constant 40 km/h, then another 60 km at a constant 60 km/h. There are no stops. What is the total travel time?',
    choices: ['2.5 hours', '2.4 hours', '2 hours', '3 hours'], answer: 0,
    hint: 'Find time = distance / speed for each segment separately.',
    explanation: 'The first segment takes 60/40 = 1.5 hours; the second takes 60/60 = 1 hour. The total is 2.5 hours.',
    feedback: ['Correct. Add 1.5 hours and 1 hour.', 'This uses an arithmetic mean speed of 50 km/h. The slower equal-distance segment takes more time.', 'This treats both segments as if they were traveled at 60 km/h.', 'This treats both segments as if they were traveled at 40 km/h.'], actionLabel: 'Route the courier' }),
  item({ id: 'qr-p4', world: 'qr', objectiveId: 'qr.algebra', familyId: 'qr.algebra.linear', pool: 'practice',
    prompt: 'A machine processes x crates on each of two identical runs. It also processes 3 additional crates during setup. The total is 17 crates. What is x?',
    choices: ['10', '8.5', '7', '14'], answer: 2,
    hint: 'The two equal runs contribute 2x crates; setup contributes 3.',
    explanation: 'The model is 2x + 3 = 17. Subtracting 3 gives 2x = 14, so x = 7 crates per run.',
    feedback: ['Adding the setup crates to the total counts them twice.', 'Dividing 17 by 2 leaves the setup crates inside the two-run total.', 'Correct. Substitution gives 2(7) + 3 = 17.', 'Fourteen is the total from both runs, not the crates in one run.'], actionLabel: 'Balance the assembly line' }),
  item({ id: 'qr-p5', world: 'qr', objectiveId: 'qr.compare', familyId: 'qr.compare.fraction-power', pool: 'practice',
    prompt: 'The real number x satisfies 0 < x < 1. Compare Quantity A: x and Quantity B: x squared.',
    choices: ['Quantity B is greater', 'Quantity A is greater', 'The quantities are equal', 'The relationship cannot be determined'], answer: 1,
    hint: 'Multiplying a positive number by a factor less than one makes it smaller.',
    explanation: 'Because x is positive and less than 1, x times x is less than x. Quantity A is greater for every allowed value.',
    feedback: ['Squaring a positive fraction below one makes it smaller, not larger.', 'Correct. x squared < x throughout the given interval.', 'Equality would require x = 0 or x = 1, both excluded.', 'The stated interval fixes the relationship; one quantity is always greater.'], actionLabel: 'Choose the larger supply' }),
  item({ id: 'qr-p6', world: 'qr', objectiveId: 'qr.sufficiency', familyId: 'qr.sufficiency.distance-speed', pool: 'practice',
    prompt: 'A courier moves at a constant positive speed with no stops. Can its travel time be determined? Statement I: the route is 120 km long. Statement II: the speed is 40 km/h.',
    choices: ['I alone is sufficient; II alone is not', 'II alone is sufficient; I alone is not', 'Together sufficient; neither alone is sufficient', 'Even together the statements are insufficient'], answer: 2,
    hint: 'Time requires both distance and speed. Test each statement without borrowing the other.',
    explanation: 'I alone leaves speed unknown, and II alone leaves distance unknown. Together, time = 120/40 = 3 hours, a unique value.',
    feedback: ['Knowing only distance does not fix time when speed is unknown.', 'Knowing only speed does not fix time when distance is unknown.', 'Correct. Each statement supplies a different required quantity.', 'Together the distance and constant speed uniquely determine the time.'], actionLabel: 'Audit the dispatch' }),
  item({ id: 'qr-c1', world: 'qr', objectiveId: 'qr.rates', familyId: 'qr.rates.combine', pool: 'check',
    prompt: 'Two independent machines complete one order in 9 hours and 6 hours, respectively. Their work rates are constant and add without interference. Working together from the start, how many hours do they need for one order?',
    choices: ['3.6', '7.5', '15', '3'], answer: 0,
    hint: 'Add the fractions of one order completed per hour.',
    explanation: 'Their rate is 1/9 + 1/6 = 5/18 order per hour. Time is 18/5 = 3.6 hours.',
    feedback: ['Correct. One order divided by 5/18 order per hour gives 18/5 hours.', 'The mean of the separate completion times is not the combined time.', 'Adding times describes two successive separate orders.', 'Subtracting the separate times does not model the combined rate.'] }),
  item({ id: 'qr-c2', world: 'qr', objectiveId: 'qr.algebra', familyId: 'qr.algebra.linear', pool: 'check',
    prompt: 'A shipment contains four identical notebooks. The cost of the notebooks plus a fixed 3-credit delivery charge is 23 credits. What is the cost of one notebook?',
    choices: ['6.5 credits', '5.75 credits', '5 credits', '20 credits'], answer: 2,
    hint: 'Remove the fixed delivery charge before dividing among four notebooks.',
    explanation: 'Four notebooks cost 23 - 3 = 20 credits. Each costs 20/4 = 5 credits.',
    feedback: ['This adds the delivery charge rather than removing it.', 'This divides the delivery charge among the notebooks and mistakes total cost per notebook for notebook price.', 'Correct. Four times five plus three equals twenty-three.', 'Twenty credits is the cost of all four notebooks.'] }),
  item({ id: 'qr-c3', world: 'qr', objectiveId: 'qr.compare', familyId: 'qr.compare.fixed-negative-power', pool: 'check',
    prompt: 'Let x = -2. Compare Quantity A: x squared and Quantity B: x.',
    choices: ['Quantity B is greater', 'The quantities are equal', 'The relationship cannot be determined', 'Quantity A is greater'], answer: 3,
    hint: 'Evaluate the square with parentheses: (-2) times (-2).',
    explanation: 'Quantity A is 4, whereas Quantity B is -2. Four is greater than negative two.',
    feedback: ['The square of -2 is positive 4, not -4.', 'The two values are 4 and -2, so they are unequal.', 'A specific value of x is supplied; both quantities can be evaluated.', 'Correct. 4 > -2.'] }),
  item({ id: 'qr-c4', world: 'qr', objectiveId: 'qr.sufficiency', familyId: 'qr.sufficiency.area', pool: 'check',
    prompt: 'Can the area of a rectangle be determined? Statement I: its length is 8 cm. Statement II: its width is 5 cm.',
    choices: ['I alone is sufficient; II alone is not', 'Together sufficient; neither alone is sufficient', 'II alone is sufficient; I alone is not', 'Each statement alone is sufficient'], answer: 1,
    hint: 'The area is length times width. Assess what remains unknown with each statement alone.',
    explanation: 'Either statement alone leaves the other dimension unknown. Together they determine the area as 8 times 5 = 40 square centimeters.',
    feedback: ['Rectangles of length 8 cm can have different widths and areas.', 'Correct. Both dimensions together fix the area.', 'Rectangles of width 5 cm can have different lengths and areas.', 'Neither single dimension fixes a rectangle\'s area.'] }),
  item({ id: 'qr-l1', world: 'qr', objectiveId: 'qr.rates', familyId: 'qr.rates.net', pool: 'later',
    prompt: 'A constant-rate pump fills a tank in 20 minutes. A constant-rate drain empties a full tank in 30 minutes. Assuming these rates remain constant, how long will both operating together take to fill an initially empty tank?',
    choices: ['10 minutes', '25 minutes', '60 minutes', '50 minutes'], answer: 2,
    hint: 'Subtract the draining rate from the filling rate, using tanks per minute.',
    explanation: 'The net rate is 1/20 - 1/30 = 1/60 tank per minute. One tank takes 60 minutes.',
    feedback: ['Subtracting times does not subtract rates.', 'Averaging times does not account for opposing flow.', 'Correct. The net inflow is one-sixtieth of a tank per minute.', 'Adding the separate times is not the net-fill model.'] }),
  item({ id: 'qr-l2', world: 'qr', objectiveId: 'qr.rates', familyId: 'qr.rates.segments', pool: 'later',
    prompt: 'A courier travels 60 km at a constant 60 km/h and then 60 km at a constant 80 km/h, with no stops. What is the total time?',
    choices: ['1.75 hours', 'About 1.71 hours', '2 hours', '1.5 hours'], answer: 0,
    hint: 'Add 60/60 and 60/80 hours.',
    explanation: 'The segment times are 1 hour and 0.75 hour, totaling 1.75 hours. An arithmetic mean of the speeds is not the mean speed over equal distances.',
    feedback: ['Correct. The total is 1 + 0.75 hours.', 'This uses 120/70 after averaging speeds, which ignores unequal segment times.', 'This treats both segments as if they were traveled at the slower speed.', 'This treats both segments as if they were traveled at the faster speed.'] }),
  item({ id: 'qr-l3', world: 'qr', objectiveId: 'qr.compare', familyId: 'qr.compare.negative-addend', pool: 'later',
    prompt: 'a is a positive real number and b is a negative real number. Compare Quantity A: a + b and Quantity B: a.',
    choices: ['The quantities are equal', 'The relationship cannot be determined', 'Quantity A is greater', 'Quantity B is greater'], answer: 3,
    hint: 'Consider the difference between Quantity A and Quantity B.',
    explanation: '(a + b) - a = b, which is negative. Therefore a + b is always less than a, even if the sign of a + b itself is unknown.',
    feedback: ['Equality would require b = 0, which is excluded.', 'The sign of the sum may vary, but its comparison with a does not.', 'Adding a negative number reduces the value.', 'Correct. The difference A - B is negative.'] }),
  item({ id: 'qr-l4', world: 'qr', objectiveId: 'qr.sufficiency', familyId: 'qr.sufficiency.parity', pool: 'later',
    prompt: 'n is an integer. Can the answer to "Is n even?" be determined? Statement I: n is divisible by 4. Statement II: n is greater than 10.',
    choices: ['II alone is sufficient; I alone is not', 'I alone is sufficient; II alone is not', 'Together sufficient; neither alone is sufficient', 'Even together the statements are insufficient'], answer: 1,
    hint: 'A sufficient statement must force one yes/no answer. Test the second statement with different allowed integers.',
    explanation: 'Every integer divisible by 4 is even, so I alone answers yes. II allows 11 and 12, so it does not fix parity.',
    feedback: ['Numbers greater than 10 can be odd or even, while divisibility by 4 fixes evenness.', 'Correct. I fixes parity; II does not.', 'Combining is unnecessary because I alone already answers the question.', 'I alone is sufficient, so together they are also sufficient.'] }),
  item({ id: 'qr-l5', world: 'qr', objectiveId: 'qr.algebra', familyId: 'qr.algebra.inventory', pool: 'later',
    prompt: 'A warehouse sends out four loads of 6 supply boxes each. No boxes arrive. There are 38 boxes left afterward. How many boxes were in the warehouse before the loads departed?',
    choices: ['14', '44', '62', '228'], answer: 2,
    hint: 'Let x be the initial count. The initial count minus the boxes shipped equals the remaining count.',
    explanation: 'The warehouse ships 4 times 6 = 24 boxes. The model is x - 24 = 38, so x = 62 boxes initially.',
    feedback: ['This subtracts the outgoing boxes from the remaining count instead of recovering the initial count.', 'This adds only one load instead of all four loads.', 'Correct. Sixty-two minus twenty-four leaves thirty-eight.', 'Multiplying the remaining count by a load size does not represent the inventory change.'] }),
];

const lampPassage = {
  title: 'The taller seedlings: an original hypothetical research report',
  paragraphs: [
    'A seed bank was considering amber lamps for its indoor nursery. The manager hoped that six extra hours of light each night would produce sturdier seedlings for transport. Previous observations had been informal: the brightest corner usually contained the tallest plants, but staff members also placed their most promising seedlings there. To replace this comparison with a more controlled one, a research team selected forty-eight seedlings of a single species and recorded their initial height. The question was whether the proposed lighting arrangement improved the nursery\'s product, not merely whether it changed the appearance of the plants.',
    'The team randomly assigned twenty-four seedlings to the added-lamp group and twenty-four to the ordinary-daylight group. Both groups received the same soil mixture and watering schedule. Staff rotated tray positions within each group daily, reducing the chance that one permanent location would dominate the result. The two groups nevertheless occupied separate enclosed benches so that the added light would not reach the comparison plants. Small instruments recorded conditions near the trays. No seedlings were lost during the four-week trial, and all were measured at its end.',
    'The added-lamp seedlings were, on average, eighteen percent taller after four weeks. Their average dry mass and leaf count, however, were similar to those of the comparison group. The instruments also revealed that the lamp bench had been about 0.8 degrees Celsius warmer during the added-light period. The team did not change either light or temperature independently. Consequently, the trial could show an effect associated with the complete lamp arrangement, but it could not isolate the contribution of illumination from the contribution of the accompanying warmth.',
    'For the manager, height was not sufficient evidence of an improvement. The nursery shipped plants in low containers, and compact seedlings sometimes suffered less stem damage in transit. The study had not measured transport damage, so it could establish neither an advantage nor a disadvantage on that outcome. Similar dry mass also made it inappropriate to describe the taller plants as having demonstrated greater biomass production. These qualifications narrowed what the results could support without making the height measurement uninformative.',
    'The team recommended a second experiment that varied illumination while holding temperature comparable, followed by a direct transport test. It also proposed repeating the work with another species before extending the finding beyond the one studied. The manager postponed purchasing more lamps. The trial had supplied a useful observation and a better question; it had not yet supplied a general rule that taller seedlings were better seedlings.',
  ],
};

const soundPassage = {
  title: 'Calls behind the traffic: an original hypothetical research report',
  paragraphs: [
    'A city research group used short audio recordings to survey birds near a busy road. Software counted recognizable calls in each recording, and planners treated those counts as an inexpensive indicator of activity. A low count could arise because few birds were calling, but it could also arise because traffic obscured calls that were actually present. This distinction mattered to a proposed roadside planting project: the planners wanted to know where birds used the corridor, not simply where a microphone happened to hear them most clearly.',
    'For three mornings, the group recorded ten-minute samples at twelve stations. At six stations, technicians installed temporary acoustic screens between the microphone and the road for the second sample. The other six stations remained unchanged. Samples at a station were collected at the same planned morning times on successive days. The screens were placed around the recording equipment, not around the trees, and were removed after the short trial. Researchers also logged traffic levels and asked a trained listener, unaware of the screen assignment, to review selected recordings.',
    'The software detected more calls in recordings made with screens. The listener confirmed that several faint call sequences could be distinguished in the screened recordings but not confidently identified in corresponding unscreened recordings. Traffic noise was also lower behind the screens. The unchanged stations did not show a comparable increase over the observation period. These results were consistent with improved detection. The team had not counted individual birds, and the screen installation did not by itself provide evidence that the number of birds had risen.',
    'The reference stations strengthened the comparison by showing that a general increase across all monitored locations was not apparent. They did not remove every uncertainty. Traffic varied from morning to morning, and twelve stations along one road could not represent every urban setting. In addition, call counts could change if the same birds altered how often they called. Even perfect recognition of a call would therefore not turn the software output into a direct census of individuals without additional information.',
    'The group recommended reporting noise conditions alongside future call detections and keeping some independent observations of birds. It did not propose abandoning audio surveys. Their low cost and repeatability were still valuable, provided the resulting measure was described accurately. A statement such as "more detectable calls" fit this trial better than "more birds." The screens had helped reveal a measurement problem that the planting decision would need to address rather than supplying a final answer about which habitat was best.',
  ],
};

const filterPassage = {
  title: 'Clear water and a changing filter: an original hypothetical research report',
  paragraphs: [
    'In a teaching laboratory, students compared two materials that could remove a blue dye from water. The demonstration concerned dye removal only; no sample was intended for drinking. Each material was packed into an identical column, and the students passed the same volume of prepared dye solution through each column at the same rate. The class initially favored Material A because the liquid emerging from it appeared nearly colorless, while Material B allowed a faint blue color to remain. The instructor asked whether this first observation answered the question of which material would perform better over repeated use.',
    'To investigate, the class completed five identical cycles. Each cycle used a fresh batch of dye solution with the same starting concentration. Between cycles, students rinsed each column with an equal volume of dye-free water according to a fixed procedure. An instrument measured dye concentration in the collected liquid rather than relying only on visual judgments. The mass of material, column dimensions, solution volume, and flow rate were kept the same for A and B. Each setup was repeated with three independently packed columns.',
    'Material A removed more dye during the first cycle, but its measured removal fell sharply over the next four cycles. Material B removed slightly less dye initially and then maintained a similar level across all five cycles. The rinse procedure did not restore A to its first-cycle performance. These measurements established a difference in performance under the tested reuse procedure. They did not establish whether a different rinse, a longer interval, or another chemical treatment would restore either material. Those possibilities were outside the experiment.',
    'The instructor separated two practical decisions. For a single-use display, the first-cycle result might be the relevant measure. For repeated demonstrations with the same column, performance across several cycles would matter. The material judged preferable could therefore depend on the intended use even when everyone agreed on the measurements. The instructor also cautioned that low dye concentration said nothing about substances the class had not measured. A nearly colorless sample could not, on this evidence alone, be described as free of all dissolved substances.',
    'For a follow-up, the class proposed varying the rinse procedure while retaining the same dye and measurement method. Another possible study would compare materials on total dye removed over a specified number of cycles. Neither proposal required changing the earlier measurements or calling the initial observation mistaken. The lesson was that a valid observation can answer a narrower question than an observer first assumes. The useful comparison begins by specifying what performance means and over what period it will be assessed.',
  ],
};

function rcItem(data, passage, passageId) {
  return item({ world: 'rc', ...data, passage, passageId, actionLabel: 'Test the claim' });
}
const rcItems = [
  rcItem({ id: 'rc-p1', objectiveId: 'rc.purpose', familyId: 'rc.lamps.purpose', pool: 'practice',
    prompt: 'Which statement best describes the passage\'s main purpose?',
    choices: ['To show that all additional nursery lighting is harmful', 'To explain a proven mechanism by which amber light increases biomass', 'To evaluate a nursery trial, its limits, and useful next steps', 'To argue that height measurements should never be collected'], answer: 2,
    hint: 'Consider how the description of the trial connects to the final two paragraphs.',
    explanation: 'The passage describes the trial, distinguishes supported observations from stronger claims, and proposes further tests. It neither dismisses all lighting nor establishes a biological mechanism.',
    feedback: ['The passage does not establish harm or generalize to all lighting.', 'Dry mass was similar, and illumination was not separated from warmth.', 'Correct. This includes both the evidence and the limits emphasized throughout.', 'The author calls the height observation useful, while limiting its interpretation.'] }, lampPassage, 'rc.lamps'),
  rcItem({ id: 'rc-p2', objectiveId: 'rc.evidence', familyId: 'rc.lamps.observations', pool: 'practice',
    prompt: 'Which result was reported for the added-lamp seedlings?',
    choices: ['They were taller on average, with similar dry mass and leaf count', 'They had greater dry mass but unchanged average height', 'They experienced less measured transport damage', 'They were exposed to exactly the same nighttime temperature as the comparison group'], answer: 0,
    hint: 'Locate the paragraph that reports measurements after four weeks.',
    explanation: 'Paragraph 3 reports eighteen percent greater average height with similar average dry mass and leaf count. Transport damage was not measured, and the lamp bench was warmer.',
    feedback: ['Correct. All three comparisons are stated in the results paragraph.', 'This reverses the reported pattern of height and dry mass.', 'The transport outcome was explicitly not measured.', 'The instruments found about 0.8 degrees Celsius of additional warmth near the lamp bench.'] }, lampPassage, 'rc.lamps'),
  rcItem({ id: 'rc-p3', objectiveId: 'rc.evidence', familyId: 'rc.lamps.method', pool: 'practice',
    prompt: 'According to the passage, why were tray positions rotated within each group?',
    choices: ['To make the added light reach both groups', 'To identify the exact mechanism of stem growth', 'To increase the average temperature of both benches', 'To reduce the influence of a single permanent location'], answer: 3,
    hint: 'Find the stated reason immediately after the rotation procedure.',
    explanation: 'Paragraph 2 states that rotation reduced the chance that one permanent location would dominate the result. It did not make the two benches share identical light or temperature.',
    feedback: ['The groups were enclosed separately to prevent the added light reaching the comparison group.', 'Rotating trays does not by itself establish a growth mechanism.', 'The passage does not give warming as the reason for rotation.', 'Correct. Rotation addressed position effects within each group.'] }, lampPassage, 'rc.lamps'),
  rcItem({ id: 'rc-p4', objectiveId: 'rc.inference', familyId: 'rc.lamps.limit', pool: 'practice',
    prompt: 'Which conclusion is best supported by the passage?',
    choices: ['The additional warmth was definitely the sole cause of taller plants', 'The tested arrangement was associated with taller seedlings, but the light-only effect was unresolved', 'The added lamps necessarily improved the nursery\'s shipping performance', 'The unchanged leaf count proves that the seedlings experienced no biological change'], answer: 1,
    hint: 'Distinguish the measured difference from the unseparated possible causes.',
    explanation: 'The complete lamp arrangement differed in both illumination and temperature. The trial observed height differences but did not isolate the light contribution or assess shipping outcomes.',
    feedback: ['Warmth is a possible contributor, not a cause isolated by this trial.', 'Correct. This preserves both the observation and the stated causal limit.', 'Shipping damage was not measured, and taller growth was not automatically desirable.', 'The measured height difference itself is a change; unchanged leaf count does not negate it.'] }, lampPassage, 'rc.lamps'),
  rcItem({ id: 'rc-p5', objectiveId: 'rc.tone', familyId: 'rc.lamps.tone', pool: 'practice',
    prompt: 'The author\'s overall attitude toward the trial is best described as:',
    choices: ['Unreservedly enthusiastic about immediate adoption', 'Dismissive of any result from a small experiment', 'Cautiously positive about its value while limiting its conclusions', 'Certain that the researchers deliberately distorted the data'], answer: 2,
    hint: 'The final sentence calls the observation useful. What does it withhold?',
    explanation: 'The passage values the observation and the next research question, while explaining why a general recommendation is premature. It alleges neither uselessness nor misconduct.',
    feedback: ['The manager postponed purchasing more lamps, and the author explains why.', 'The author explicitly regards the observation as useful.', 'Correct. The discussion combines usefulness with carefully stated limits.', 'There is no claim of deliberate deception by the research team.'] }, lampPassage, 'rc.lamps'),
  rcItem({ id: 'rc-p6', objectiveId: 'rc.inference', familyId: 'rc.lamps.next-study', pool: 'practice',
    prompt: 'Which follow-up most directly addresses the uncertainty about illumination itself?',
    choices: ['Vary illumination while keeping temperature comparable', 'Place the tallest seedlings only under brighter lamps', 'Measure height again without recording any environmental conditions', 'Assume that similar dry mass rules out every effect of light'], answer: 0,
    hint: 'Identify the two conditions that changed together in the original trial.',
    explanation: 'Holding temperature comparable while varying illumination separates the factors that were combined. This directly addresses the stated uncertainty about the light-only effect.',
    feedback: ['Correct. It separates illumination from accompanying warmth.', 'Selecting seedlings by initial promise recreates a bias described in the opening paragraph.', 'That would not separate illumination from warmth.', 'A similar dry mass outcome does not eliminate every possible effect on other measures.'] }, lampPassage, 'rc.lamps'),
  rcItem({ id: 'rc-c1', objectiveId: 'rc.purpose', familyId: 'rc.traffic.purpose', pool: 'check',
    prompt: 'What is the central issue examined by this passage?',
    choices: ['Whether every city should install permanent road screens', 'How a measurement can change without demonstrating a population change', 'Why audio recordings are always inferior to direct observation', 'Which tree species the city should plant next'], answer: 1,
    hint: 'Contrast "more detectable calls" with "more birds" in the final paragraph.',
    explanation: 'The passage distinguishes a change in call detection from a change in bird numbers. The screen experiment is used to examine that measurement distinction.',
    feedback: ['The trial involved temporary equipment screens and makes no universal installation recommendation.', 'Correct. Detection and underlying population are the key distinction.', 'The author explicitly retains the value of audio surveys.', 'The study does not settle which habitat or tree species is best.'] }, soundPassage, 'rc.traffic'),
  rcItem({ id: 'rc-c2', objectiveId: 'rc.evidence', familyId: 'rc.traffic.evidence', pool: 'check',
    prompt: 'Which observation most directly supports improved detection as an explanation?',
    choices: ['The planners wanted an inexpensive survey', 'There were twelve recording stations', 'Screens were removed after the trial', 'A listener distinguished faint calls in screened recordings that could not be confidently identified in corresponding unscreened recordings'], answer: 3,
    hint: 'Look for an observation about whether an existing signal could be recognized.',
    explanation: 'The listener\'s comparison directly concerns recognizability of calls under different noise conditions. The other details describe purpose or design, not the detection finding.',
    feedback: ['Cost explains the appeal of the method, not why detections increased.', 'The number of stations alone says nothing about detection quality.', 'Removal limits the trial duration but does not itself demonstrate improved detection.', 'Correct. The reviewed call sequences provide direct evidence about detectability.'] }, soundPassage, 'rc.traffic'),
  rcItem({ id: 'rc-c3', objectiveId: 'rc.inference', familyId: 'rc.traffic.limit', pool: 'check',
    prompt: 'Why would even perfect call recognition not, by itself, establish the number of individual birds?',
    choices: ['The same birds could produce different numbers of calls', 'A microphone cannot record any bird calls near a road', 'Reference stations always have fewer birds', 'The software intentionally deletes repeated calls'], answer: 0,
    hint: 'Locate the distinction between a call count and a census in paragraph 4.',
    explanation: 'Paragraph 4 notes that the same birds may alter calling frequency. A number of calls therefore does not uniquely specify a number of individuals without additional information.',
    feedback: ['Correct. Different call rates can yield different counts without different numbers of birds.', 'The passage reports detected calls, so this absolute claim conflicts with it.', 'No such population relationship is stated for reference stations.', 'The passage does not describe deletion of repeat calls.'] }, soundPassage, 'rc.traffic'),
  rcItem({ id: 'rc-c4', objectiveId: 'rc.tone', familyId: 'rc.traffic.tone', pool: 'check',
    prompt: 'Which statement best reflects the author\'s stance toward audio surveys?',
    choices: ['They should be abandoned because any uncertainty makes them useless', 'Their counts may be reported as bird populations without qualification', 'They remain useful when their measure and limitations are described accurately', 'Their low cost proves that they answer the planting question correctly'], answer: 2,
    hint: 'Read the final paragraph\'s recommendation and the sentence beginning "It did not propose."',
    explanation: 'The author retains the method\'s low cost and repeatability, but asks that the output be described as detections with noise conditions and independent observations where appropriate.',
    feedback: ['The passage explicitly rejects abandoning audio surveys.', 'The central argument is that call detections are not automatically population counts.', 'Correct. The author supports qualified use rather than rejection or overstatement.', 'Low cost is a practical benefit, not proof that a measurement answers a particular question.'] }, soundPassage, 'rc.traffic'),
  rcItem({ id: 'rc-l1', objectiveId: 'rc.purpose', familyId: 'rc.filter.purpose', pool: 'later',
    prompt: 'Which statement best captures the passage\'s main point?',
    choices: ['A material\'s preferred use depends on the performance measure and time period being considered', 'Any filter that produces colorless water removes all dissolved substances', 'The first measurement must have been wrong because later measurements differed', 'Material B is superior under every possible condition'], answer: 0,
    hint: 'Connect the single-use versus repeated-use comparison to the closing sentences.',
    explanation: 'The passage distinguishes first-cycle and repeated-use performance, then emphasizes specifying the outcome and period. It does not invalidate the first measurement or make universal claims.',
    feedback: ['Correct. This links the experimental results to the author\'s broader lesson.', 'The author specifically warns against that inference.', 'A valid first-cycle result can differ from later-cycle performance.', 'Untested conditions and alternative procedures remain unresolved.'] }, filterPassage, 'rc.filter'),
  rcItem({ id: 'rc-l2', objectiveId: 'rc.evidence', familyId: 'rc.filter.evidence', pool: 'later',
    prompt: 'Which finding was reported under the tested reuse procedure?',
    choices: ['Material A maintained its first-cycle removal through all five cycles', 'Material B removed more dye during the first cycle than Material A', 'The rinse procedure restored A to its original performance after every cycle', 'Material B began with slightly lower removal but maintained a similar level across the five cycles'], answer: 3,
    hint: 'Compare the two materials in the results paragraph.',
    explanation: 'Paragraph 3 states that B initially removed slightly less dye, then maintained a similar removal level; A began stronger but declined sharply.',
    feedback: ['A\'s removal fell sharply after the first cycle.', 'A removed more dye in the first cycle.', 'The passage explicitly states that the rinse did not restore A\'s first-cycle performance.', 'Correct. This accurately preserves both the initial comparison and the later pattern.'] }, filterPassage, 'rc.filter'),
  rcItem({ id: 'rc-l3', objectiveId: 'rc.inference', familyId: 'rc.filter.limit', pool: 'later',
    prompt: 'Which conclusion would go beyond the evidence described?',
    choices: ['The tested rinse did not restore A to its first-cycle performance', 'The liquid from A in the first cycle was free of every dissolved substance', 'The materials differed across the tested cycles', 'A different rinse procedure would require another experiment'], answer: 1,
    hint: 'What substance did the students actually measure?',
    explanation: 'The experiment measured one dye. Low dye concentration cannot establish absence of all dissolved substances. The other statements remain within the reported observations or acknowledged limits.',
    feedback: ['This is explicitly stated in the results.', 'Correct. This generalizes from one measured dye to every dissolved substance.', 'The measured patterns differed for A and B.', 'The passage identifies different rinse procedures as untested.'] }, filterPassage, 'rc.filter'),
  rcItem({ id: 'rc-l4', objectiveId: 'rc.tone', familyId: 'rc.filter.tone', pool: 'later',
    prompt: 'The instructor\'s approach to the initial observation is best described as:',
    choices: ['Accusing the students of falsifying their measurements', 'Accepting an unlimited conclusion from the visible color', 'Preserving the observation while narrowing the claim it can support', 'Rejecting measurement in favor of the class\'s first impression'], answer: 2,
    hint: 'The final paragraph says the earlier measurements need not be changed.',
    explanation: 'The instructor keeps the first-cycle result but distinguishes the questions it can answer from broader claims about repeated use or unmeasured substances.',
    feedback: ['The passage contains no accusation of falsification.', 'The instructor explicitly limits what visual clarity and dye measurement can establish.', 'Correct. The emphasis is on accurate interpretation, not denial of the observation.', 'The experiment adds instrumental measurements and repeated cycles rather than relying only on appearance.'] }, filterPassage, 'rc.filter'),
];

export const items = [...patItems, ...qrItems, ...rcItems];

export const missions = [
  { id: 'pat.first-crease', world: 'pat', title: 'The First Crease', subtitle: 'Learn how a folded layer returns', kind: 'lesson', objectiveIds: ['pat.one-fold'], itemIds: ['pat-p1', 'pat-p2', 'pat-p3'], requires: [],
    intro: { speaker: 'The Gatekeeper', text: 'The bridge is folded into its own map. Trace the layers before you open it. You can ask for help at any lock.' },
    outro: { speaker: 'The Gatekeeper', text: 'The first bridge is open. A hole follows the layer it was punched through.' }, restoration: 'pat.bridge' },
  { id: 'pat.foldsmith', world: 'pat', title: 'The Foldsmith\'s Vault', subtitle: 'Rescue Cubit behind the paper locks', kind: 'rescue', objectiveIds: ['pat.one-fold', 'pat.two-folds'], itemIds: ['pat-p4', 'pat-p5', 'pat-p6'], requires: ['pat.first-crease'],
    intro: { speaker: 'Entropy Foldsmith', text: 'One marked dot, one hole. Why bother remembering the layers?' },
    outro: { speaker: 'Cubit', text: 'I kept counting doors. You counted layers. Can I come along?' }, reward: { creature: 'cubit' }, restoration: 'pat.vault' },
  { id: 'pat.chapter-check', world: 'pat', title: 'Daedalus: The Opened Map', subtitle: 'Four new diagrams from this chapter', kind: 'checkpoint', objectiveIds: ['pat.one-fold', 'pat.two-folds'], itemIds: ['pat-c1', 'pat-c2', 'pat-c3', 'pat-c4'], requires: ['pat.foldsmith'],
    intro: { speaker: 'Daedalus', text: 'These diagrams are a check of this hole-punching chapter. They do not cover the other five PAT task types. Help is available and will be recorded.' },
    outro: { speaker: 'Daedalus', text: 'Your route through the Fold Caverns is recorded. The larger Labyrinth still has other kinds of spatial gates.' }, restoration: 'pat.guardian' },
  { id: 'qr.waterworks', world: 'qr', title: 'Restart the Waterworks', subtitle: 'Rates determine what the city can do', kind: 'lesson', objectiveIds: ['qr.rates'], itemIds: ['qr-p1', 'qr-p2', 'qr-p3'], requires: [],
    intro: { speaker: 'The Waterkeeper', text: 'The city has enough pumps. It needs a model of how they work together. Match your units and keep the assumptions in view.' },
    outro: { speaker: 'The Waterkeeper', text: 'The canals move again. A rate tells you what happens in each unit of time.' }, restoration: 'qr.canals' },
  { id: 'qr.dispatch', world: 'qr', title: 'The False Dispatch', subtitle: 'Rescue Ratior by testing the instructions', kind: 'rescue', objectiveIds: ['qr.algebra', 'qr.compare', 'qr.sufficiency'], itemIds: ['qr-p4', 'qr-p5', 'qr-p6'], requires: ['qr.waterworks'],
    intro: { speaker: 'Entropy Dispatcher', text: 'A number on every form. That is all a courier needs.' },
    outro: { speaker: 'Ratior', text: 'Sometimes the right answer is that the instructions need more information. I am taking your route from now on.' }, reward: { creature: 'ratior' }, restoration: 'qr.dispatch' },
  { id: 'qr.chapter-check', world: 'qr', title: 'The Clockmaker\'s Inspection', subtitle: 'Four focused checks, no countdown', kind: 'checkpoint', objectiveIds: ['qr.rates', 'qr.algebra', 'qr.compare', 'qr.sufficiency'], itemIds: ['qr-c1', 'qr-c2', 'qr-c3', 'qr-c4'], requires: ['qr.dispatch'],
    intro: { speaker: 'The Clockmaker', text: 'Show what these quantities mean. This is an untimed check of the introductory chapter, not a complete QR exam.' },
    outro: { speaker: 'The Clockmaker', text: 'The city can use those models. Probability, statistics, graphs, and deeper algebra are still ahead.' }, restoration: 'qr.guardian' },
  { id: 'rc.recovered-report', world: 'rc', title: 'The Recovered Report', subtitle: 'Read the evidence before confronting the claim', kind: 'lesson', objectiveIds: ['rc.purpose', 'rc.evidence'], itemIds: ['rc-p1', 'rc-p2', 'rc-p3'], requires: [],
    intro: { speaker: 'The Archivist', text: 'This original practice report stays open while you investigate it. Everything needed for its questions is in the text.' },
    outro: { speaker: 'The Archivist', text: 'You have the observations and the method. Now see what Gloss has changed in his summary.' }, restoration: 'rc.archive' },
  { id: 'rc.forged-conclusion', world: 'rc', title: 'The Forged Conclusion', subtitle: 'Rescue Skimmer from an exaggerated claim', kind: 'rescue', objectiveIds: ['rc.inference', 'rc.tone'], itemIds: ['rc-p4', 'rc-p5', 'rc-p6'], requires: ['rc.recovered-report'],
    intro: { speaker: 'Lieutenant Gloss', text: 'I removed a few qualifications. The conclusion is so much cleaner now.' },
    outro: { speaker: 'Skimmer', text: 'Those little words were holding the argument together. I will help you keep them in sight.' }, reward: { creature: 'skimmer' }, restoration: 'rc.report' },
  { id: 'rc.chapter-check', world: 'rc', title: 'The Curator\'s New Archive', subtitle: 'A different passage and four questions', kind: 'checkpoint', objectiveIds: ['rc.purpose', 'rc.evidence', 'rc.inference', 'rc.tone'], itemIds: ['rc-c1', 'rc-c2', 'rc-c3', 'rc-c4'], requires: ['rc.forged-conclusion'],
    intro: { speaker: 'The Curator', text: 'Use this new report rather than remembering the previous one. These shortened practice passages do not simulate the full RC section.' },
    outro: { speaker: 'The Curator', text: 'The report is restored with its limits intact. Longer passage sets and further reading skills remain ahead.' }, restoration: 'rc.guardian' },
];

export const coverageNotes = {
  pat: 'Partial: single- and two-crease hole punching only. Apertures, view recognition, angle discrimination, cube counting, form development, and more complex folds are not implemented here.',
  qr: 'Partial: introductory rates, linear equations, quantitative comparison, and data sufficiency. This chapter is not a complete algebra, probability, statistics, graph, or applied-problem curriculum.',
  rc: 'Partial: three original shortened passages support purpose, evidence, inference and tone. Full-length passage sets, exam pacing, and broader reading coverage are not implemented here.',
};
