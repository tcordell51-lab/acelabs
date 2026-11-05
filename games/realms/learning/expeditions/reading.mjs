// Original, instruction-only evidence investigations. No assessment-bank imports.
import { esc, button, group } from './shared.mjs';

const freeze = value => {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
};
const ADA = 'https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/dat_candidate_guide.pdf';
const MANUAL = 'https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/dat_users_manual.pdf';

function sentence(id, role, text, phrases) {
  const spans = phrases.map((phrase, index) => {
    const start = text.indexOf(phrase);
    if (start < 0 || text.indexOf(phrase, start + 1) !== -1) throw new Error(`Ambiguous authored span: ${id}`);
    return { id: `${id}.${index + 1}`, text: phrase, start, end: start + phrase.length };
  });
  return { id, role, text, spans };
}

export const READING_REPORTS = freeze([
  {
    id: 'discovery-rc-evaporation', title: 'The lamp and the missing water', scope: 'Original miniature report with hypothetical data',
    sentences: [
      sentence('s1', 'Question', 'A laboratory team asked whether a warming lamp changed water loss from a shallow tray during a four-hour trial.', ['whether a warming lamp changed water loss', 'during a four-hour trial']),
      sentence('s2', 'Method', 'Two identical trays began with equal amounts of water; one received a lamp and a fan, while the comparison tray received neither.', ['Two identical trays began with equal amounts of water', 'one received a lamp and a fan', 'the comparison tray received neither']),
      sentence('s3', 'Observation', 'During the four-hour trial, the lamp-and-fan tray lost 12 g of mass and the comparison tray lost 7 g.', ['During the four-hour trial', 'the lamp-and-fan tray lost 12 g of mass', 'the comparison tray lost 7 g']),
      sentence('s4', 'Limit', 'Because light and air movement changed together, the trial did not isolate the effect of the lamp alone.', ['light and air movement changed together', 'did not isolate the effect of the lamp alone']),
      sentence('s5', 'Next step', 'The team proposed another trial that would vary the lamp while keeping air movement the same at both trays.', ['vary the lamp', 'keeping air movement the same at both trays']),
      sentence('s6', 'Conclusion', 'The first result described the combined arrangement under the tested conditions, rather than a universal rule about lamps.', ['the combined arrangement under the tested conditions', 'rather than a universal rule about lamps']),
    ],
  },
  {
    id: 'discovery-rc-coatings', title: 'A coating that starts ahead', scope: 'Original miniature report with hypothetical data',
    sentences: [
      sentence('s1', 'Question', 'Researchers compared how two window coatings transmitted light before and after repeated cleaning.', ['two window coatings', 'before and after repeated cleaning']),
      sentence('s2', 'Method', 'They tested six identical glass panels per coating with the same instrument, coating thickness, and cleaning procedure.', ['six identical glass panels per coating', 'the same instrument, coating thickness, and cleaning procedure']),
      sentence('s3', 'Observation', 'Before cleaning, Coating A transmitted an average of 85 light units out of 100, while Coating B transmitted 80.', ['Before cleaning', 'Coating A transmitted an average of 85 light units out of 100', 'Coating B transmitted 80']),
      sentence('s4', 'Observation', 'After five cleanings, Coating A transmitted an average of 70 units, while Coating B transmitted 79.', ['After five cleanings', 'Coating A transmitted an average of 70 units', 'Coating B transmitted 79']),
      sentence('s5', 'Limit', 'The coatings were assessed only with this cleaning fluid; other cleaners and other kinds of durability were not tested.', ['only with this cleaning fluid', 'other cleaners and other kinds of durability were not tested']),
      sentence('s6', 'Conclusion', 'The report recommends comparing first-use and repeated-cleaning performance separately instead of naming one coating universally better.', ['first-use and repeated-cleaning performance separately', 'instead of naming one coating universally better']),
    ],
  },
  {
    id: 'discovery-rc-dunes', title: 'Two colors of dune', scope: 'Original miniature report with hypothetical data',
    sentences: [
      sentence('s1', 'Question', 'A field team compared surface temperatures in a dark-sand zone and a light-sand zone during one clear afternoon.', ['surface temperatures in a dark-sand zone and a light-sand zone', 'during one clear afternoon']),
      sentence('s2', 'Method', 'The team sampled four locations per zone using the same instrument during the same hour.', ['four locations per zone', 'the same instrument during the same hour']),
      sentence('s3', 'Observation', 'The dark-sand locations averaged 7 degrees Celsius warmer than the light-sand locations in those measurements.', ['averaged 7 degrees Celsius warmer', 'in those measurements']),
      sentence('s4', 'Limit', 'Moisture and wind were not recorded, and there were no measurements from other seasons.', ['Moisture and wind were not recorded', 'no measurements from other seasons']),
      sentence('s5', 'Interpretation', 'The authors said several unmeasured conditions could have contributed to the observed difference.', ['several unmeasured conditions', 'could have contributed to the observed difference']),
      sentence('s6', 'Next step', 'They called the finding a useful starting point and proposed matched-condition comparisons before claiming that sand color caused the temperature difference.', ['a useful starting point', 'before claiming that sand color caused the temperature difference']),
    ],
  },
]);

const CLAIM_CHOICES = [
  ['reported', 'Directly reported observation'],
  ['inference', 'Reasonable, bounded inference'],
  ['overreach', 'Goes beyond the report'],
];

export const READING_STEPS = freeze([
  {
    id: 'rc-discovery-measurement', report: 0, support: 'Guided', objectiveIds: ['rc.evidence', 'rc.inference'],
    title: 'Pin what was actually observed',
    claim: 'The lamp-and-fan tray lost more mass during this four-hour trial.', choices: CLAIM_CHOICES,
    expected: 'reported', sentences: ['s3'], spans: ['s3.1'],
    prompt: 'Classify the claim. Pin the sentence reporting the two mass losses, then the phrase that bounds its time period.',
    help: 'Start with the Observation sentence. The comparison is measured; the claim also says when that comparison applies.',
    explanation: 'The two measured losses support the comparison. The phrase "During the four-hour trial" keeps the claim within the actual observation period.',
    feedback: {
      reported: 'This is the measured comparison, with the trial period preserved.',
      inference: 'No extra inference is needed here: the report explicitly gives the two losses during this trial.',
      overreach: 'This claim keeps both the combined arrangement and the observation period. It does not yet claim an isolated cause or universal rule.',
    },
    evidenceFeedback: 'Pin sentence 3 and its time phrase. The method explains the setup; the result supplies the actual comparison.',
    thread: ['12 g compared with 7 g', 'Four-hour observation', 'A bounded report of a result'],
    next: 'Change the claim, keep the evidence',
  },
  {
    id: 'rc-discovery-cause', report: 0, support: 'Guided', objectiveIds: ['rc.evidence', 'rc.inference', 'rc-bounded-inference'],
    title: 'Catch the stronger claim',
    beforeClaim: 'The lamp-and-fan tray lost more mass during this four-hour trial.',
    claim: 'The lamp alone caused the additional mass loss.', choices: CLAIM_CHOICES,
    expected: 'overreach', sentences: ['s4'], spans: ['s4.1'],
    prompt: 'The report stays unchanged. Classify the stronger claim, then pin the sentence and phrase explaining why the lamp-only effect was not isolated.',
    help: 'The new claim singles out the lamp. Find the condition that changed along with it.',
    explanation: 'Light and air movement changed together. The trial compared two arrangements, so it did not isolate which change contributed what. It also does not show that the lamp had no effect.',
    feedback: {
      reported: 'The losses were reported, but a lamp-only cause was not. The sentence about changing two conditions limits that conclusion.',
      inference: 'A bounded inference cannot separate the effects of two conditions changed together. More information would be needed.',
      overreach: 'The word "alone" asks the evidence to isolate a cause that this design did not isolate.',
    },
    evidenceFeedback: 'Sentence 4 names the limitation; "light and air movement changed together" explains it. The larger loss alone is not evidence for a lamp-only cause.',
    thread: ['Light and air changed', 'Effects were not isolated', 'Lamp-only cause is unproven'],
    next: 'Open the coating report',
  },
  {
    id: 'rc-discovery-purpose', report: 1, support: 'Less guidance', objectiveIds: ['rc.purpose', 'rc.evidence', 'rc-passage-structure'],
    title: 'Find the purpose of the comparison', claim: 'What is this report mainly doing?',
    choices: [
      ['cost', 'Showing which coating is cheapest to make'],
      ['compare', 'Comparing first-use and repeated-cleaning performance'],
      ['universal', 'Establishing one coating as better under every condition'],
    ],
    expected: 'compare', sentences: ['s3', 's4'], spans: ['s3.1', 's4.1'],
    prompt: 'Choose the purpose. Pin both measurement sentences, then the phrase in each that says when the measurement was made.',
    help: 'The two sets of measurements belong to different stages. Compare the words introducing each set.',
    explanation: 'The report contrasts the initial measurement with the measurement after repeated cleaning. Its conclusion therefore depends on which period of use matters.',
    feedback: {
      cost: 'The passage supplies no manufacturing costs. Its comparisons concern transmitted light at two stages.',
      compare: 'This accounts for the two result sentences and the recommendation at the end.',
      universal: 'The report limits the cleaners tested and explicitly avoids a universally better coating.',
    },
    evidenceFeedback: 'Sentences 3 and 4 are the measured comparisons. Their timing phrases, "Before cleaning" and "After five cleanings," make the organizing contrast visible.',
    thread: ['Before cleaning', 'After five cleanings', 'Compare two periods of use'],
    next: 'Inspect what the limit does',
  },
  {
    id: 'rc-discovery-structure', report: 1, support: 'Less guidance', objectiveIds: ['rc-passage-structure', 'rc.evidence'],
    title: 'Map the job of a sentence', claim: 'What job does sentence 5 perform in the report?',
    choices: [
      ['reverse', 'It replaces the measured result with its opposite'],
      ['boundary', 'It bounds the conditions to which the comparison applies'],
      ['cause', 'It identifies the exact chemical cause of the change'],
    ],
    expected: 'boundary', sentences: ['s5'], spans: ['s5.1'],
    prompt: 'Choose the sentence\'s job. Pin sentence 5 and the phrase that restricts the tested cleaning condition.',
    help: 'A statement about what was not tested can narrow a conclusion without changing a measured result.',
    explanation: '"Only with this cleaning fluid" limits the tested conditions. It neither reverses the observations nor establishes a chemical mechanism.',
    feedback: {
      reverse: 'The observations remain unchanged. This sentence identifies a boundary on extending them.',
      boundary: 'The statement identifies which cleaning condition was tested and leaves other conditions unresolved.',
      cause: 'A limit on the procedure does not explain the chemical mechanism that produced the measurements.',
    },
    evidenceFeedback: 'The exact condition is "only with this cleaning fluid" in sentence 5. Keep this boundary attached to any broader recommendation.',
    thread: ['Only this cleaning fluid', 'Untested cases stay open', 'The scope is bounded'],
    next: 'Investigate a different report',
  },
  {
    id: 'rc-discovery-inference', report: 2, support: 'Try with less support', objectiveIds: ['rc.inference', 'rc-bounded-inference', 'rc.evidence'],
    title: 'Make an inference without adding a fact',
    claim: 'A different seasonal temperature difference would not, by itself, contradict these afternoon measurements.', choices: CLAIM_CHOICES,
    expected: 'inference', sentences: ['s4'], spans: ['s4.2'],
    prompt: 'Classify the claim. Pin the sentence and phrase that explain the seasonal boundary. Outside facts are not needed.',
    help: 'A result from one sampled period does not report the unmeasured periods. Find where the report states that sampling limit.',
    explanation: 'No other seasons were measured. A different result in another season could coexist with these measurements. That does not predict that a seasonal difference will occur.',
    feedback: {
      reported: 'The passage reports a sampling limit, not an actual different-season measurement. The claim draws a cautious implication from that limit.',
      inference: 'This conclusion stays within the sampling limit without claiming what another season will show.',
      overreach: 'The claim says a different result would not automatically contradict this sample. It does not assert that any such result has occurred.',
    },
    evidenceFeedback: 'Sentence 4 states "no measurements from other seasons." That scope limit supports the inference without an outside theory about sand.',
    thread: ['Other seasons unmeasured', 'No seasonal result asserted', 'A limited inference is allowed'],
    next: 'Read the authors\' stance',
  },
  {
    id: 'rc-discovery-tone', report: 2, support: 'Try with less support', objectiveIds: ['rc.tone', 'rc.evidence'],
    title: 'Keep both halves of the authors\' stance', claim: 'How do the authors treat their finding?',
    choices: [
      ['certain', 'As proof of an isolated sand-color cause'],
      ['useless', 'As worthless because it has limitations'],
      ['cautious', 'As useful, while withholding a stronger causal conclusion'],
    ],
    expected: 'cautious', sentences: ['s6'], spans: ['s6.1', 's6.2'],
    prompt: 'Choose the stance. Pin the concluding sentence and both phrases that show its value and its withheld conclusion.',
    help: 'One phrase values the observation. The other explains what must happen before a stronger causal claim.',
    explanation: '"A useful starting point" values the result; "before claiming" withholds the causal conclusion. A limitation can coexist with a positive view of a study\'s usefulness.',
    feedback: {
      certain: 'The authors propose another comparison before making that causal claim.',
      useless: 'They explicitly call the finding useful. Uncertainty does not make every observation worthless.',
      cautious: 'This preserves both their positive judgment and their causal caution.',
    },
    evidenceFeedback: 'Pin both phrases in sentence 6. Selecting only the positive phrase or only the caution would omit part of the stance.',
    thread: ['A useful starting point', 'Before claiming a cause', 'Useful and cautious together'],
    next: 'Finish the investigation',
  },
]);

const stageValues = new Set(['predict', 'observed', 'complete']);
const unique = list => [...new Set(list)];
const sameSet = (a, b) => a.length === b.length && a.every(value => b.includes(value));
const reportFor = step => READING_REPORTS[READING_STEPS[step].report];
const allowedChoices = step => READING_STEPS[step].choices.map(choice => choice[0]);

function cleanSelection(candidate, step, requireReady = false) {
  if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) return null;
  const report = reportFor(step), task = READING_STEPS[step];
  const knownSentences = new Set(report.sentences.map(entry => entry.id));
  const sentenceIds = unique(Array.isArray(candidate.sentenceIds) ? candidate.sentenceIds.filter(id => typeof id === 'string' && knownSentences.has(id)) : []).slice(0, task.sentences.length);
  const knownSpans = new Set(report.sentences.filter(entry => sentenceIds.includes(entry.id)).flatMap(entry => entry.spans.map(span => span.id)));
  const spanIds = unique(Array.isArray(candidate.spanIds) ? candidate.spanIds.filter(id => typeof id === 'string' && knownSpans.has(id)) : []).slice(0, task.spans.length);
  const choice = typeof candidate.choice === 'string' && [...allowedChoices(step), 'unsure'].includes(candidate.choice) ? candidate.choice : null;
  const result = { choice, sentenceIds, spanIds, help: candidate.help === true || choice === 'unsure' };
  if (requireReady && !ready(result, step)) return null;
  return result;
}
function ready(state, step) {
  const task = READING_STEPS[step];
  return state.choice === 'unsure' || Boolean(state.choice && state.sentenceIds.length === task.sentences.length && state.spanIds.length === task.spans.length);
}
function blank(step = 0, history = []) {
  return { step, stage: step === READING_STEPS.length ? 'complete' : 'predict', choice: null, sentenceIds: [], spanIds: [], help: false, history };
}
function normalize(candidate) {
  const history = [];
  const source = candidate && typeof candidate === 'object' && !Array.isArray(candidate) ? candidate : {};
  if (Array.isArray(source.history)) {
    for (let index = 0; index < Math.min(source.history.length, READING_STEPS.length); index++) {
      const entry = source.history[index];
      if (!entry || entry.step !== index) break;
      const selection = cleanSelection(entry, index, true);
      if (!selection) break;
      history.push({ step: index, ...selection });
    }
  }
  const step = history.length;
  if (step === READING_STEPS.length) return blank(step, history);
  const next = blank(step, history);
  if (source.step !== step) return next;
  const selection = cleanSelection(source, step);
  if (!selection) return next;
  Object.assign(next, selection);
  next.stage = stageValues.has(source.stage) && source.stage === 'observed' && ready(next, step) ? 'observed' : 'predict';
  return next;
}

function reduce(candidate, action, value = '') {
  const state = normalize(candidate);
  if (action === 'reading-reset') return blank();
  if (state.stage === 'complete') return state;
  const task = READING_STEPS[state.step], report = reportFor(state.step);
  if (action === 'reading-help') return { ...state, help: true };
  if (action === 'reading-next' && state.stage === 'observed') {
    const record = { step: state.step, choice: state.choice, sentenceIds: [...state.sentenceIds], spanIds: [...state.spanIds], help: state.help };
    return blank(state.step + 1, [...state.history, record]);
  }
  if (action === 'reading-retry' && state.stage === 'observed') return { ...blank(state.step, state.history), help: state.help };
  if (state.stage !== 'predict') return state;
  if (action === 'reading-unsure') return { ...state, choice: 'unsure', help: true };
  if (action === 'reading-choice' && typeof value === 'string' && allowedChoices(state.step).includes(value)) return { ...state, choice: value };
  if (action === 'reading-sentence' && typeof value === 'string' && report.sentences.some(entry => entry.id === value)) {
    let sentenceIds;
    if (state.sentenceIds.includes(value)) sentenceIds = state.sentenceIds.filter(id => id !== value);
    else if (task.sentences.length === 1) sentenceIds = [value];
    else if (state.sentenceIds.length < task.sentences.length) sentenceIds = [...state.sentenceIds, value];
    else return state;
    const knownSpans = new Set(report.sentences.filter(entry => sentenceIds.includes(entry.id)).flatMap(entry => entry.spans.map(span => span.id)));
    return { ...state, sentenceIds, spanIds: state.spanIds.filter(id => knownSpans.has(id)) };
  }
  if (action === 'reading-span' && typeof value === 'string') {
    const knownSpans = new Set(report.sentences.filter(entry => state.sentenceIds.includes(entry.id)).flatMap(entry => entry.spans.map(span => span.id)));
    if (!knownSpans.has(value)) return state;
    if (state.spanIds.includes(value)) return { ...state, spanIds: state.spanIds.filter(id => id !== value) };
    if (state.spanIds.length < task.spans.length) return { ...state, spanIds: [...state.spanIds, value] };
    return state;
  }
  if (action === 'reading-undo') {
    if (state.spanIds.length) return { ...state, spanIds: state.spanIds.slice(0, -1) };
    if (state.sentenceIds.length) return { ...state, sentenceIds: state.sentenceIds.slice(0, -1) };
    return { ...state, choice: null };
  }
  if (action === 'reading-pin' && ready(state, state.step)) return { ...state, stage: 'observed' };
  return state;
}

function toggle(label, action, value, options = {}) {
  const html = button(label, action, value, options);
  return options.selected ? html : html.replace('<button ', '<button aria-pressed="false" ');
}
function thread(state, task) {
  const revealed = state.stage === 'observed';
  const labels = revealed ? task.thread : [state.sentenceIds.length ? `Pinned: ${state.sentenceIds.map(id => id.toUpperCase()).join(', ')}` : 'Pin the relevant sentence', state.spanIds.length ? `${state.spanIds.length} phrase${state.spanIds.length === 1 ? '' : 's'} selected` : 'Mark the exact words', state.choice ? 'Interpretation selected' : 'Choose an interpretation'];
  const headings = revealed ? ['Evidence', 'Meaning', 'Bounded interpretation'] : ['Sentence', 'Exact words', 'Interpretation'];
  return `<ol class="exp-evidence-thread${revealed ? ' is-reviewed' : ''}" aria-label="${revealed ? 'Reviewed evidence thread' : 'Your evidence thread'}">${labels.map((label, index) => `<li class="exp-thread-step"><strong class="exp-thread-label">${esc(headings[index])}</strong><span class="exp-thread-text">${esc(label)}</span></li>`).join('')}</ol>`;
}
function reportScene(state, task, report) {
  const revealed = state.stage === 'observed';
  return `<section class="exp-report" aria-label="${esc(report.title)}"><p class="exp-report-kicker">${esc(report.scope)}</p><h3>${esc(report.title)}</h3><p class="exp-report-instruction">${revealed ? 'Your pins remain visible. Reviewed evidence is identified below.' : `Pin ${task.sentences.length === 1 ? 'one sentence' : 'two sentences'} by selecting the report text.`}</p><div class="exp-report-sentences" role="group" aria-label="Passage sentences">${report.sentences.map(entry => {
    const selected = state.sentenceIds.includes(entry.id);
    const roleLabel = task.support === 'Guided' || revealed ? ` ${entry.role}.` : '';
    const reviewedLabel = revealed && task.sentences.includes(entry.id) ? '<span class="exp-evidence-label">Reviewed evidence</span>' : '';
    return `<div class="exp-report-row${selected ? ' is-pinned' : ''}${revealed && task.sentences.includes(entry.id) ? ' is-evidence' : ''}">${toggle(`${entry.id.toUpperCase()}.${roleLabel} ${entry.text}`, 'reading-sentence', entry.id, { selected, disabled: revealed || (!selected && task.sentences.length > 1 && state.sentenceIds.length >= task.sentences.length), kind: 'exp-report-sentence' })}${reviewedLabel}</div>`;
  }).join('')}</div></section>`;
}
function evidenceResult(state, task) {
  if (state.stage !== 'observed') return '';
  const report = reportFor(state.step);
  return `<div class="exp-reviewed-spans"><strong>Exact words to keep with the claim</strong>${task.sentences.map(id => {
    const entry = report.sentences.find(sentence => sentence.id === id);
    return `<p><span>${esc(id.toUpperCase())}</span> ${entry.spans.filter(span => task.spans.includes(span.id)).map(span => `<mark>${esc(span.text)}</mark>`).join(' + ')}</p>`;
  }).join('')}</div>`;
}
function view(candidate) {
  const state = normalize(candidate);
  if (state.stage === 'complete') {
    return {
      activeObjectiveIds: [],
      scene: '<section class="exp-report exp-investigation-complete"><h3>The reports are restored</h3><p>You connected observations, limits, purpose, and tone to exact words in three original reports.</p><p>A stronger claim needs stronger evidence. A useful finding can still have a narrow scope.</p><p>This investigation is supported practice. A separate fresh question is needed for an independent check.</p></section>',
      prompt: 'Keep the evidence attached to the claim.', coach: 'Skimmer: "A few small words can hold an entire argument together."',
      controls: '', primary: { action: 'reading-reset', label: 'Restart this investigation' },
      progress: { current: READING_STEPS.length, total: READING_STEPS.length, label: 'Three reports investigated' }, complete: true,
    };
  }
  const task = READING_STEPS[state.step], report = reportFor(state.step), revealed = state.stage === 'observed';
  const matches = state.choice === task.expected && sameSet(state.sentenceIds, task.sentences) && sameSet(state.spanIds, task.spans);
  const coach = revealed
    ? `${state.choice === 'unsure' ? 'Walk through the evidence.' : matches ? 'Your interpretation and pins fit this report.' : 'Compare the claim with the reviewed evidence.'} ${task.feedback[state.choice] || ''} ${task.explanation}${matches ? '' : ` ${task.evidenceFeedback}`}`
    : state.help ? task.help : task.support === 'Guided' ? 'Skimmer: "First pin a sentence. Then keep the words that limit or support the claim."' : '';
  const wordingChange = task.beforeClaim ? `<div class="exp-wording-change"><p><strong>Earlier wording</strong><br>${esc(task.beforeClaim)}</p><p><strong>Changed wording</strong><br>${esc(task.claim)}</p></div>` : `<blockquote class="exp-claim">${esc(task.claim)}</blockquote>`;
  const scene = `<section class="exp-reading-case"><p class="exp-case-stage">Report ${task.report + 1} of ${READING_REPORTS.length} / ${esc(task.support)}</p><h3>${esc(task.title)}</h3>${wordingChange}${reportScene(state, task, report)}${thread(state, task)}${evidenceResult(state, task)}</section>`;
  let controls = '';
  if (!revealed) {
    controls += group('Your interpretation', task.choices.map(([value, label]) => toggle(label, 'reading-choice', value, { selected: state.choice === value })).join(''));
    const selectedSentences = report.sentences.filter(entry => state.sentenceIds.includes(entry.id));
    controls += `<div class="exp-span-picker"><p>Mark ${task.spans.length === 1 ? 'one exact phrase' : 'two exact phrases'}. ${state.spanIds.length} of ${task.spans.length} selected.</p>${selectedSentences.length ? selectedSentences.map(entry => group(`Exact phrases in ${entry.id.toUpperCase()}`, `<span class="exp-span-source">${esc(entry.id.toUpperCase())}</span>` + entry.spans.map(span => toggle(span.text, 'reading-span', span.id, { selected: state.spanIds.includes(span.id), disabled: !state.spanIds.includes(span.id) && state.spanIds.length >= task.spans.length, kind: 'exp-span' })).join(''))).join('') : '<p>Sentence selection opens its phrase choices here.</p>'}</div>`;
    controls += group('Practice support', button('I am not sure yet', 'reading-unsure', '', { selected: state.choice === 'unsure' }) + button('Ask Skimmer for a hint', 'reading-help') + button('Clear a selection', 'reading-undo', '', { disabled: !state.choice && !state.sentenceIds.length && !state.spanIds.length }));
  } else {
    controls = group('Review this case', button('Try the same case again', 'reading-retry') + button('Start this investigation again', 'reading-reset'));
  }
  return {
    activeObjectiveIds: [...task.objectiveIds],
    scene, prompt: revealed ? 'Follow the evidence thread, then continue when you are ready.' : task.prompt, coach, controls,
    primary: revealed ? { action: 'reading-next', label: task.next } : { action: 'reading-pin', label: state.choice === 'unsure' ? 'Show me the evidence' : 'Pin the evidence', disabled: !ready(state, state.step) },
    progress: { current: state.step + 1, total: READING_STEPS.length, label: `${state.step + 1} of ${READING_STEPS.length} investigations` }, complete: false,
  };
}

export const READING_ACTIVITIES = freeze([{
  id: 'reading-evidence-detective', title: 'Reading Evidence Detective', world: 'rc', version: 1,
  objectiveIds: ['rc.purpose', 'rc.evidence', 'rc.inference', 'rc.tone', 'rc-passage-structure', 'rc-bounded-inference'],
  sourceUrls: [ADA, MANUAL],
  instructionFamilies: [
    { objectiveId: 'rc.purpose', familyId: 'discovery-rc-coating-report-purpose' },
    { objectiveId: 'rc.evidence', familyId: 'discovery-rc-exact-sentence-and-qualifier' },
    { objectiveId: 'rc.inference', familyId: 'discovery-rc-measured-versus-causal-claim' },
    { objectiveId: 'rc.tone', familyId: 'discovery-rc-value-with-causal-caution' },
    { objectiveId: 'rc-passage-structure', familyId: 'discovery-rc-observation-and-scope-map' },
    { objectiveId: 'rc-bounded-inference', familyId: 'discovery-rc-unmeasured-period-boundary' },
  ],
  initial: () => blank(), normalize, reduce, view,
}]);
