// content/explainers-src/G1/B008.js: batch B008 of group G1 (Full-Length
// Test 1, the free practice test), Reading Comprehension: 22 items, the last
// six questions on passage 2 and all sixteen on passage 3.
//
// Served as FULL_1 Reading Comprehension: passage 2 is rc-p10 "The Trade
// Beneath the Forest Floor" (its questions 12 to 17 are questions 29 to 34 of
// the section; questions 18 to 28 are batch B007) and passage 3 is rc-p19 "Why
// Anaesthesia Still Lacks an Explanation" (questions 35 to 50).
//
// Written in Thomas's coaching voice (docs/release-2026-10-30/questions/voice-codex.md)
// from the independent expert's blind solve (docs/explainers/solves/B008.json:
// 22 of 22 keys agree, every expert answer shares a proof line with the bank,
// no key or picture dispute, so nothing is held). The expert's families were
// weighed and kept unless CHANGES says otherwise. The bank's own distractor
// notes are read for routes, never lifted: one opens with the label "Half
// right." (rc-p19-q10) and one asserts physiology the passage never states
// (rc-p19-q09); both are flagged.
//
// Authoring source, never published: /content/explainers-src/* is
// force-redirected like /docs/*. The build (scripts/explainers/build.mjs)
// checks every entry against tools/rc/data/bank.js (key text, every choice
// text, stem hash), runs the copy rules, finds every span quote verbatim in its
// sentence, checks every key span is a bank proof line, finds every quoted
// phrase in a step in the passage, and copies the student fields to
// content/explainers/ and the coach fields (flags, changes, demo pick, gate
// results) to docs/explainers/ only.
//
// Rules this file keeps: plain ASCII, no em dashes, never "wrong", "incorrect"
// or "failed" (rc-p19 sentence 4.1 says "began to fail", which is not a banned
// word; a bank choice on rc-p19-q15 says "fail to keep", bank text, exempt and
// never echoed), never a choice letter (the locator items' choices are
// paragraph numbers, which are bank text), and step 1 opens with a move.
// Numbers from the passage are written the way a student says them (desflurane
// is "about 6 percent", so no one reads six atmospheres).
//
// Pictures: rc.evidence for every item, as the batch row names. Each card is a
// whole passage sentence with its marks: the proof line (a bank proof line; the
// build checks), where a tempting choice was borrowed from (tagged with the
// served letter), checked-off lines on EXCEPT items, and "Read with it" lines
// (span role context, from batch B007) for a sentence the proof line needs
// beside it: the figures a tone question judges, the definition a vocabulary
// word leans on, the dose ladder's next rung. Ladders and maps are laid out in
// order (rc-p19-q05 low dose to high; the two organization items block by
// block), and the one cross-paragraph inference (rc-p19-q09) is drawn as two
// numbered lines with a connector, like the pilot's RC-3. EXCEPT items show the
// key line and the shortest sentence that checks off each other choice, so a
// phone panel stays under 600 px.
//
// Expert review (needs-work, 22 of 22 keys agree, no key disputes): the three
// blocked items and the four optional notes are fixed here, item by item in
// CHANGES (each coach record lists its own). Two pictures had marked a line
// that rules a choice out as "Where a trap comes from" (rc-p10-q14 17.2,
// rc-p19-q13 15.5); a trap span marks only where a choice's pull was borrowed
// from, so both are context lines now ("Read with it").
'use strict';

const BANK = 'tools/rc/data/bank.js';
const src = (passage, id, pNo, n) => ({ bank: BANK, global: 'ACE_RC_BANK', locator: { passage, id }, servedAs: 'Full-Length Test 1, Reading Comprehension, passage ' + pNo + ', question ' + n });
const P10 = (id, n) => src('rc-p10', 'rc-p10-' + id, 2, n);
const P19 = (id, n) => src('rc-p19', 'rc-p19-' + id, 3, n);
const band = (b, type) => ({ band: b, from: 'question type (' + type + '); the RC bank has no difficulty field' });

// Play with it: the RC player opens one passage from the URL (tools/rc/rc.js boot(): #start/passage/<id>).
const play = (passage) => ({
  label: 'Reading player: this passage on its own, with highlighting and cross-out',
  href: 'tools/rc/index.html#start/passage/' + passage,
  state: { passage },
  expect: ['rc.js', 'Highlight', 'Cross out'],
  routing: 'Works today: the hash opens this passage alone in the RC player, with highlighting and cross-out. The player shows an elapsed clock, a pace bar and a correct-count headline; see flags.'
});
const PLAY_FLAG = { kind: 'play-target', text: 'The RC player (tools/rc/rc.js) shows an elapsed clock, a per-passage pace bar, 10 and 12 minute cues, and an "N of M correct" results headline, even for a single passage. House rule: no timers or scores outside full timed tests. A calm mode is needed before explainers link students there.' };
const WEAK = (choices) => ({ kind: 'note', text: 'Thin distractor' + (choices.length > 1 ? 's' : '') + ' (expert solve): ' + choices.map((c) => '"' + c + '"').join(' and ') + (choices.length > 1 ? ' have' : ' has') + ' no hook in the passage and will be crossed off on sight. A rewrite that borrows a real detail would test the skill harder; the key is unchanged.' });
const LOCATOR = { kind: 'note', text: 'Paragraph locator: the choices are paragraph numbers, so the item works only while the served page numbers every paragraph (tools/mock/full.js does). If a player or tutorial view drops the numbers, this item stops making sense.' };
const THEY = { kind: 'bank-copy', text: 'Passage copy for Thomas (bank text, not edited): rc-p19 sentence 6.5 opens "They are small, greasy and weakly sticky" right after a sentence about the correlation, so "They" has no clear antecedent (it means the anaesthetics). The evidence card shows the whole sentence; the span starts at "lodge in any oily pocket". A one-word fix in the bank ("Anaesthetics are small...") is Thomas\'s call.' };

const VID = {
  detail: { slot: 'rc.detail', title: 'Detail questions: find, read whole, match', id: null, start: null },
  inference: { slot: 'rc.inference', title: 'Inference questions: join two lines', id: null, start: null },
  except: { slot: 'rc.except', title: 'EXCEPT questions: check off four', id: null, start: null },
  function: { slot: 'rc.function', title: 'Function questions: ask what the part is for', id: null, start: null },
  vocab: { slot: 'rc.vocab', title: 'Vocabulary in context: let the sentence decide', id: null, start: null },
  tone: { slot: 'rc.tone', title: 'Tone questions: find the author\'s own verdict', id: null, start: null },
  application: { slot: 'rc.application', title: 'Application questions: carry the principle over', id: null, start: null },
  mainidea: { slot: 'rc.main-idea', title: 'Main idea questions: the frame and the close', id: null, start: null }
};
const sub = (type) => VID[type].slot;
const REUSE = 'Passage text and proof lines from tools/rc/data/bank.js; highlight style matches the highlighter in tools/rc/rc.js';

const ENTRIES = [
  /* ===================== Passage 2: rc-p10, The Trade Beneath the Forest Floor (questions 29 to 34) ===================== */
  {
    qid: 'rc:rc-p10-q12',
    servesAlso: [],
    section: 'rc',
    subtopic: sub('mainidea'),
    difficulty: band(2, 'main idea: organization'),
    source: P10('q12', 29),
    keyText: 'an account of a partnership, then a limit on what it shows',
    answer: { line: 'Paragraphs 1 to 8 build the fungus-root trade. From paragraph 11 on, the author tests how far the sharing story can go.' },
    steps: [
      'Split the passage into blocks before you read the choices. Paragraphs 1 to 8 build the trade: what a mycorrhiza is, and what each side pays.',
      'Find the turn. Paragraph 11 opens "This is the point where care is required", and from there the author tests the carbon-sharing claim.',
      'Read the close. Paragraph 17 leaves the big question open.',
      'Match two blocks to two halves: a partnership, then a limit on what it shows.'
    ],
    choices: [
      { text: 'a problem raised in the opening and fully solved by the closing paragraph', role: 'trap', family: 'rc-contradicted', trap: 'Nothing is fully solved', note: 'Paragraph 17 says what stays open: how much the carbon movement matters, and whether provisioning happens at all. The close leaves the question open.' },
      { text: 'a comparison of two fungal groups, followed by a defence of one of them', role: 'trap', family: 'rc-half-supported', trap: 'Two paragraphs, stretched', note: 'Paragraphs 3 and 4 do compare the two kinds of partner. But that is two paragraphs, and the author never defends one over the other.' },
      { text: 'a series of experiments presented in the order they were carried out', role: 'trap', family: 'rc-outside', trap: 'No run of experiments', note: 'Girdling and labelled carbon do appear, but most of the passage is not experiments, and nothing is arranged by when it was run.' },
      { text: 'a chronological history of research into the fungi of forest soils', role: 'trap', family: 'rc-too-weak', trap: 'One paragraph of history', note: 'Only paragraph 2 is history: the 1880s and the ancient fossils. The rest is ordered by argument, not by date.' },
      { text: 'an account of a partnership, then a limit on what it shows', role: 'key', note: 'The trade first, then the limits on the sharing claim: both blocks, in order.' }
    ],
    lockIt: 'Organization: name what each block does, then pick the choice that covers every block in order.',
    hook: null,
    playWith: play('rc-p10'),
    video: VID.mainidea,
    visual: {
      type: 'rc.evidence',
      passage: 'rc-p10',
      focus: '11.1',
      spans: [
        { p: 1, s: 5, quote: 'It is a partnership.', role: 'key', note: 'block 1: the trade' },
        { p: 11, s: 1, quote: 'This is the point where care is required', role: 'key', note: 'block 2 opens: the limits' },
        { p: 17, s: 5, quote: 'What stays open is how much of that movement matters to a growing forest', role: 'key', note: 'the close leaves it open' }
      ],
      reuse: REUSE,
      alt: 'Three highlighted lines mark the blocks: paragraph 1, sentence 5, it is a partnership; paragraph 11, sentence 1, the point where care is required; and paragraph 17, sentence 5, what stays open.',
      caption: 'The partnership opens the passage, the limits start at paragraph 11, and the close leaves the question open.'
    },
    demoPick: 'a problem raised in the opening and fully solved by the closing paragraph',
    flags: [PLAY_FLAG, { kind: 'note', text: 'Overlaps rc-p10-q10 (batch B007, served two questions earlier, main idea: the trade is documented, the sharing is not). Both reward the same two-block map of the passage; Thomas may want one of them swapped for a different skill. Key unchanged.' }]
  },
  {
    qid: 'rc:rc-p10-q13',
    servesAlso: [],
    section: 'rc',
    subtopic: sub('tone'),
    difficulty: band(2, 'tone'),
    source: P10('q13', 30),
    keyText: 'alert to its appeal but unconvinced by it',
    answer: { line: 'Paragraph 16 grants the image its appeal, then says the language of intention has run well ahead of the measurements.' },
    steps: [
      'Find where the author names the image: paragraph 16, the web of nurture.',
      'Collect both halves of the verdict. Warm: "the appeal is easy to see", and some of it is defensible as metaphor. Cool: the claims ran ahead of the measurements.',
      'Keep both halves. Appeal granted, belief withheld.'
    ],
    choices: [
      { text: 'alert to its appeal but unconvinced by it', role: 'key', note: 'Appeal granted in sentence 2, belief withheld in sentence 4: both halves, at the author\'s strength.' },
      { text: 'indifferent to whether the image is accurate', role: 'trap', family: 'rc-tone', trap: 'Too flat', note: 'The author cares about accuracy: sentence 4 sets the claims against the measurements and the sources cited for them.' },
      { text: 'fully persuaded by the case that has been made for it', role: 'trap', family: 'rc-contradicted', note: 'Paragraph 16 says the opposite: the confident language has run well ahead of the measurements.' },
      { text: 'openly contemptuous of everyone who repeats it', role: 'trap', family: 'rc-too-strong', trap: 'Contempt is too strong', note: 'The author grants the appeal and calls some of it defensible as metaphor. That is measured doubt about claims, not scorn for people.' },
      { text: 'amused that researchers have allowed the phrase to spread so widely', role: 'trap', family: 'rc-tone', trap: 'No joke here', note: 'Nothing in paragraph 16 is played for laughs. The author treats the overreach as a real problem with the claims.' }
    ],
    lockIt: 'Tone: when the author grants one thing and doubts another, the answer keeps both halves.',
    hook: null,
    playWith: play('rc-p10'),
    video: VID.tone,
    visual: {
      type: 'rc.evidence',
      passage: 'rc-p10',
      focus: '16.4',
      spans: [
        { p: 16, s: 2, quote: 'the appeal is easy to see', role: 'key', note: 'the warm half: appeal granted' },
        { p: 16, s: 3, quote: 'Some of it is defensible as metaphor.', role: 'context', note: 'why contempt is too strong' },
        { p: 16, s: 4, quote: 'the confident language of intention has run well ahead of the measurements', role: 'key', note: 'the cool half: not convinced' }
      ],
      reuse: REUSE,
      alt: 'Paragraph 16 in three cards. Sentence 2 is highlighted: the appeal is easy to see. Sentence 3 is marked to read with it, some of it is defensible as metaphor, and sentence 4 is highlighted: the confident language of intention has run well ahead of the measurements.',
      caption: 'Two highlights, two halves: appeal granted, then the doubt. Hold both.'
    },
    demoPick: 'openly contemptuous of everyone who repeats it',
    flags: [PLAY_FLAG, WEAK(['amused that researchers have allowed the phrase to spread so widely'])]
  },
  {
    qid: 'rc:rc-p10-q14',
    servesAlso: [],
    section: 'rc',
    subtopic: sub('tone'),
    difficulty: band(2, 'tone of a closing paragraph'),
    source: P10('q14', 31),
    keyText: 'an opening for further work rather than a flaw',
    answer: { line: 'Paragraph 17 says none of this diminishes the science, and ends: the gap is where the interesting work sits.' },
    steps: [
      'Read the first and last lines of paragraph 17. The author\'s verdict sits there.',
      'First line: "None of this diminishes the science." So the open questions are not a flaw.',
      'Last line: "The gap is where the interesting work sits." An opening, not a stop sign.'
    ],
    choices: [
      { text: 'a sign that the whole field has been oversold', role: 'trap', family: 'rc-too-strong', trap: 'The story, not the field', note: 'Paragraph 16 says the popular telling outran the data. Paragraph 17 then opens: none of this diminishes the science. The field itself is not oversold.' },
      { text: 'evidence that the symbiosis itself has been misdescribed', role: 'trap', family: 'rc-contradicted', trap: 'The partnership is settled', note: 'Paragraph 17 lists the symbiosis as what is not in doubt: ancient, nearly universal and structurally elegant. The open question is the sharing.' },
      { text: 'a reason to set the subject aside for the time being', role: 'trap', family: 'read-backward', trap: 'A start, not a stop', note: 'The author calls the gap where the interesting work sits, a reason to keep going. Setting the subject aside runs that line backward.' },
      { text: 'a problem that no instrument will ever be able to settle', role: 'trap', family: 'rc-too-strong', trap: 'Never is too strong', note: 'The author calls the questions open, not unanswerable. Nothing in paragraph 17 says no instrument could ever settle them.' },
      { text: 'an opening for further work rather than a flaw', role: 'key', note: 'The gap is where the interesting work sits: open questions as the next step, not damage.' }
    ],
    lockIt: 'A closing tone question: read the last paragraph\'s first and last lines, then match their strength.',
    hook: null,
    playWith: play('rc-p10'),
    video: VID.tone,
    visual: {
      type: 'rc.evidence',
      passage: 'rc-p10',
      focus: '17.6',
      spans: [
        { p: 17, s: 1, quote: 'None of this diminishes the science.', role: 'key', note: 'not a flaw' },
        { p: 17, s: 2, quote: 'the symbiosis is ancient, nearly universal, and structurally elegant', role: 'context', note: 'the settled part: the partnership itself' },
        { p: 17, s: 6, quote: 'The gap is where the interesting work sits', role: 'key', note: 'an opening' }
      ],
      reuse: REUSE,
      alt: 'Paragraph 17 in three cards. Sentences 1 and 6 are highlighted: none of this diminishes the science, and the gap is where the interesting work sits. Sentence 2 is marked to read with them: the symbiosis is ancient, nearly universal and structurally elegant.',
      caption: 'The first and last lines carry the verdict. The middle card is what is settled, so the partnership is not in doubt.'
    },
    demoPick: 'a reason to set the subject aside for the time being',
    flags: [PLAY_FLAG]
  },
  {
    qid: 'rc:rc-p10-q15',
    servesAlso: [],
    section: 'rc',
    subtopic: sub('except'),
    difficulty: band(2, 'EXCEPT'),
    source: P10('q15', 32),
    keyText: 'Fungi steer carbon toward the seedlings most closely related to the donor',
    answer: { line: 'Relatives come up once, in paragraph 14, as a payback evolution would need. No line says fungi steer carbon by kinship.' },
    steps: [
      'Flip the job. Four choices have a line behind them; you are hunting the one that does not.',
      'Check off four: mushrooms in paragraph 4, slow phosphate in paragraph 5, sugar made that week in paragraph 8, plants that make no sugar in paragraph 15.',
      'Look hard at the one left. A relative appears only in paragraph 14, as one thing a donor would need back. A condition, not a finding.',
      'Paragraph 13 even says flow may be set by the fungus, or simply by which end is hungrier.'
    ],
    choices: [
      { text: 'Some of the fungi that form mycorrhizas produce mushrooms on a forest floor', role: 'stated', family: 'rc-stated', note: 'Paragraph 4, sentence 4: many ectomycorrhizal fungi are the familiar mushrooms of forest floors.' },
      { text: 'Fungi steer carbon toward the seedlings most closely related to the donor', role: 'key', note: 'Kin appears only as a possible payback in paragraph 14. No line reports fungi routing carbon to relatives.' },
      { text: 'Phosphate moves through soil slowly enough to leave a root short of it', role: 'stated', family: 'rc-stated', note: 'Paragraph 5: phosphate barely moves, so a root strips the soil around itself within days and sits in its own depletion zone.' },
      { text: 'There are plants that live without making any sugar of their own', role: 'stated', family: 'rc-stated', note: 'Paragraph 15, sentence 2: ghost pipe and some orchids make no sugar at all. It sounds impossible for a plant, which is the pull.' },
      { text: 'A share of what a tree makes in a given week ends up in fungal tissue', role: 'stated', family: 'rc-stated', note: 'Paragraph 8: part of a plant\'s output goes to its fungal partners, and the fungi live on sugar made that week.' }
    ],
    lockIt: 'EXCEPT: a word that appears in the passage is not a claim it supports. Check what the line says.',
    hook: null,
    playWith: play('rc-p10'),
    video: VID.except,
    visual: {
      type: 'rc.evidence',
      passage: 'rc-p10',
      focus: '13.4',
      spans: [
        { p: 5, s: 2, quote: 'Phosphate barely moves in soil.', role: 'stated', choice: 'Phosphate moves through soil slowly enough to leave a root short of it' },
        { p: 8, s: 3, quote: 'the fungi live on sugar made that week', role: 'stated', choice: 'A share of what a tree makes in a given week ends up in fungal tissue' },
        { p: 15, s: 2, quote: 'make no sugar at all', role: 'stated', choice: 'There are plants that live without making any sugar of their own' },
        { p: 13, s: 4, quote: 'Flow may be set by the fungus, or simply by which end of the connection is hungrier.', role: 'key', choice: 'Fungi steer carbon toward the seedlings most closely related to the donor', note: 'the fungus or hunger may set the flow; kinship is not named' }
      ],
      reuse: REUSE,
      alt: 'Three lines check off, each tagged with the served letter of its choice: phosphate barely moving in paragraph 5, sugar made that week in paragraph 8, and no sugar at all in paragraph 15. Paragraph 13, sentence 4 is highlighted: flow may be set by the fungus or by which end is hungrier.',
      caption: 'Three lines check off here; the mushrooms are in paragraph 4. The highlight says what may set the flow, and kinship is not on it.'
    },
    demoPick: 'There are plants that live without making any sugar of their own',
    flags: [PLAY_FLAG]
  },
  {
    qid: 'rc:rc-p10-q16',
    servesAlso: [],
    section: 'rc',
    subtopic: sub('detail'),
    difficulty: band(1, 'detail: locate a paragraph'),
    source: P10('q16', 33),
    keyText: 'Paragraph 10',
    answer: { line: 'Paragraph 10 describes the mesh whose pores admit hyphae but exclude roots.' },
    steps: [
      'Name what you are hunting: a set-up that lets hyphae through and stops roots.',
      'Find it in paragraph 10, sentence 2: compartments divided by "a mesh whose pores admit hyphae but exclude roots".',
      'Check the neighbour. Paragraph 9 labels the carbon; paragraph 10 calls the mesh "a second trick".'
    ],
    choices: [
      { text: 'Paragraph 5', role: 'trap', family: 'rc-other-paragraph', trap: 'Narrow pores, no barrier', note: 'Paragraph 5 has hyphae reaching pores too narrow for a root hair. The same size idea, but in soil, with no experiment between two plants.' },
      { text: 'Paragraph 8', role: 'trap', family: 'rc-other-paragraph', trap: 'The girdling experiment', note: 'Paragraph 8 cuts the phloem to see how fast the carbon flow stops. Nothing there separates hyphae from roots.' },
      { text: 'Paragraph 9', role: 'trap', family: 'rc-other-paragraph', trap: 'The first trick', note: 'Paragraph 9 labels the carbon with an isotope. That is step one; the barrier that splits the routes comes next, in paragraph 10.' },
      { text: 'Paragraph 10', role: 'key', note: 'Sentence 2: donor and receiver grow in compartments split by a mesh that admits hyphae and excludes roots.' },
      { text: 'Paragraph 12', role: 'trap', family: 'rc-other-paragraph', trap: 'The other roads', note: 'Paragraph 12 lists routes that need no fungus: soil water, respired carbon dioxide, litter, root grafts. A list of roads, not a barrier design.' }
    ],
    lockIt: 'Locate questions: turn the stem into a short search phrase, then find the paragraph that does that job.',
    hook: null,
    playWith: play('rc-p10'),
    video: VID.detail,
    visual: {
      type: 'rc.evidence',
      passage: 'rc-p10',
      focus: '10.2',
      spans: [
        { p: 10, s: 2, quote: 'a mesh whose pores admit hyphae but exclude roots', role: 'key', note: 'the barrier the stem describes' },
        { p: 9, s: 2, quote: 'feed it carbon dioxide built from an uncommon isotope', role: 'trap', choice: 'Paragraph 9', note: 'the first trick: label the carbon' }
      ],
      reuse: REUSE,
      alt: 'Paragraph 10, sentence 2 is highlighted: donor and receiver grow in compartments split by a mesh whose pores admit hyphae but exclude roots. Paragraph 9, sentence 2 is marked as the source of a trap: labelling the carbon with an isotope, the step before the barrier.',
      caption: 'The highlight is the barrier the stem describes. The marked line in paragraph 9 is the step before it.'
    },
    demoPick: 'Paragraph 9',
    flags: [PLAY_FLAG, LOCATOR]
  },
  {
    qid: 'rc:rc-p10-q17',
    servesAlso: [],
    section: 'rc',
    subtopic: sub('application'),
    difficulty: band(3, 'application'),
    source: P10('q17', 34),
    keyText: 'fall away within days, long before the ten days are up',
    answer: { line: 'Girdling shows the flow to the fungi falls within days, because they live on sugar made that week. No new sugar, same result.' },
    steps: [
      'Find the passage case that matches. No new sugar reaching the roots is exactly what girdling does in paragraph 8.',
      'Read its result: the flow falls "within days", because "the fungi live on sugar made that week, not on stored reserves".',
      'Carry it over. A seedling in the dark makes no sugar, so the flow drops within days, well before day ten.'
    ],
    choices: [
      { text: 'continue unchanged, since the phosphate trade is unaffected', role: 'trap', family: 'rc-swapped-cause', trap: 'Phosphate does not pay', note: 'Phosphate is the fungus\'s side of the trade. The plant pays in carbon, and that flow runs on fresh sugar, so phosphate cannot keep it going.' },
      { text: 'fall away within days, long before the ten days are up', role: 'key', note: 'Same as girdling: no new sugar, so the flow falls within days.' },
      { text: 'reverse, with the fungus now supplying sugar to the seedling', role: 'trap', family: 'rc-misplaced', trap: 'Borrowed from ghost pipe', note: 'Fungi feed ghost pipe with carbon drawn from green trees they are also joined to. A seedling potted alone has no other host to draw from.' },
      { text: 'rise, as the seedling leans harder on its partner for nutrients', role: 'trap', family: 'read-backward', trap: 'Need is not payment', note: 'Needing nutrients does not make sugar to pay with. Paragraph 8 says the flow falls when new sugar stops; rise turns that around.' },
      { text: 'taper off slowly over weeks as stored reserves are drawn down', role: 'trap', family: 'rc-contradicted', trap: 'Not on stored reserves', note: 'Paragraph 8 rules this out in so many words: the fungi live on sugar made that week, not on stored reserves. Days, not weeks.' }
    ],
    lockIt: 'Application: find the passage case that matches the new one, then carry its result over unchanged.',
    hook: null,
    playWith: play('rc-p10'),
    video: VID.application,
    visual: {
      type: 'rc.evidence',
      passage: 'rc-p10',
      focus: '8.3',
      spans: [
        { p: 8, s: 3, quote: 'show the flow falling away within days', role: 'key', note: 'the result: within days' },
        { p: 8, s: 3, quote: 'the fungi live on sugar made that week, not on stored reserves', role: 'key', note: 'the reason, which also rules out a slow taper' },
        { p: 15, s: 3, quote: 'They live on carbon drawn from fungi attached at the same time to photosynthetic trees', role: 'trap', choice: 'reverse, with the fungus now supplying sugar to the seedling', note: 'ghost pipe gets carbon only through other, green hosts' }
      ],
      reuse: REUSE,
      alt: 'Paragraph 8, sentence 3 has two highlights: the flow falls away within days, and the fungi live on sugar made that week, not on stored reserves. Paragraph 15, sentence 3 is marked as the source of a trap: ghost pipe gets carbon only through fungi tied to green trees.',
      caption: 'Girdling is the matching case. The two highlights give the result and the reason, and both carry over to the dark room.'
    },
    demoPick: 'taper off slowly over weeks as stored reserves are drawn down',
    flags: [PLAY_FLAG]
  },

  /* ===================== Passage 3: rc-p19, Why Anaesthesia Still Lacks an Explanation (questions 35 to 50) ===================== */
  {
    qid: 'rc:rc-p19-q01',
    servesAlso: [],
    section: 'rc',
    subtopic: sub('detail'),
    difficulty: band(1, 'detail'),
    source: P19('q01', 35),
    keyText: 'How readily an agent dissolved in olive oil predicted how little of it was needed to anaesthetize an animal',
    answer: { line: 'Paragraph 2: rank the agents by how readily each dissolves in olive oil, and that ranking predicts how little of each is needed.' },
    steps: [
      'Find the names. Meyer and Overton open paragraph 2.',
      'Read the whole finding. They ranked agents by how readily each dissolves in olive oil, and the ranking predicted how little of each puts an animal under.',
      'Use sentence 2 as a filter: one ranking held across more than four orders of magnitude. Any choice where no order holds is out.'
    ],
    choices: [
      { text: 'Agents that dissolved most readily in water were the ones that could be given to an animal in the smallest doses', role: 'trap', family: 'read-backward', trap: 'Oil, not water', note: 'The ranking was by oil. The potent agents dissolve greedily in oil, and paragraph 8 calls them reluctant to stay dissolved in water.' },
      { text: 'How readily an agent dissolved in olive oil predicted how little of it was needed to anaesthetize an animal', role: 'key', note: 'Paragraph 2, sentence 1, nearly word for word: oil solubility predicts the dose needed.' },
      { text: 'Heavier molecules were consistently more potent than lighter ones', role: 'trap', family: 'rc-outside', trap: 'Weight never measured', note: 'Molecular weight never enters paragraph 2. The one property measured was how readily each agent dissolves in oil.' },
      { text: 'Every agent worked by binding the same receptor in the nerve membrane', role: 'trap', family: 'rc-contradicted', trap: 'No receptors required', note: 'Their finding was read as pointing at the oily membrane. The account built on it ends: one site, one mechanism, no receptors required.' },
      { text: 'The agents varied so widely that no single ordering of them could be found', role: 'trap', family: 'rc-contradicted', trap: 'One ranking held', note: 'Sentence 2 says the opposite: one ranking held across more than four orders of magnitude of potency.' }
    ],
    lockIt: 'Detail: find the name, read the whole sentence, then match what was measured and what it predicted.',
    hook: null,
    playWith: play('rc-p19'),
    video: VID.detail,
    visual: {
      type: 'rc.evidence',
      passage: 'rc-p19',
      focus: '2.1',
      spans: [
        { p: 2, s: 1, quote: 'how readily each dissolves in olive oil, that ranking predicts almost exactly how little of each is needed to put an animal under', role: 'key', note: 'what was measured, and what it predicted' },
        { p: 2, s: 2, quote: 'The relationship held across more than four orders of magnitude of potency.', role: 'trap', choice: 'The agents varied so widely that no single ordering of them could be found', note: 'the line one choice turns around' }
      ],
      reuse: REUSE,
      alt: 'Paragraph 2, sentence 1 is highlighted: ranking agents by how readily each dissolves in olive oil predicts how little of each is needed. Sentence 2 is marked as the source of a trap: the relationship held across more than four orders of magnitude.',
      caption: 'Oil solubility in, dose out. The marked line shows one ranking held, so no choice can say there was no order.'
    },
    demoPick: 'Agents that dissolved most readily in water were the ones that could be given to an animal in the smallest doses',
    flags: [PLAY_FLAG]
  },
  {
    qid: 'rc:rc-p19-q02',
    servesAlso: [],
    section: 'rc',
    subtopic: sub('detail'),
    difficulty: band(1, 'detail'),
    source: P19('q02', 36),
    keyText: 'began to move again, which was read as pressure restoring the membrane\'s volume',
    answer: { line: 'Paragraph 3: under helium at about a hundred atmospheres, the animals begin to move again, read as pressure squeezing the membrane back.' },
    steps: [
      'Find the helium: paragraph 3, sentence 4.',
      'Read both parts: what happened (the animals moved again) and how it was read (pressure squeezing the membrane back to its original volume).',
      'Match the choice that has both. Sentence 3 says why it mattered: it "appeared to seal the case."'
    ],
    choices: [
      { text: 'stopped breathing and had to be supported by a ventilator', role: 'trap', family: 'rc-outside', trap: 'Never mentioned', note: 'Breathing and ventilators never come up. The change the passage reports is movement coming back.' },
      { text: 'needed a far larger dose of agent for the rest of the experiment', role: 'trap', family: 'rc-outside', trap: 'Sounds right, not said', note: 'Pressure undoing the drug might suggest a bigger dose, but no later dosing is described. The passage reports only that the animals moved again.' },
      { text: 'showed no measurable change of any kind', role: 'trap', family: 'rc-contradicted', trap: 'They moved', note: 'The animals began to move again, a clear change. That change is why the result looked like proof.' },
      { text: 'began to move again, which was read as pressure restoring the membrane\'s volume', role: 'key', note: 'Both halves of sentence 4: the animals moved again, read as the membrane squeezed back.' },
      { text: 'lost the response to a surgical stimulus that they had still shown a moment earlier', role: 'trap', family: 'read-backward', trap: 'Lost for regained', note: 'Pressure brought movement back; this choice has a response taken away. The surgical stimulus belongs to the compounds in paragraph 5.' }
    ],
    lockIt: 'When a passage reports an experiment, the answer usually holds both the result and how it was read.',
    hook: null,
    playWith: play('rc-p19'),
    video: VID.detail,
    visual: {
      type: 'rc.evidence',
      passage: 'rc-p19',
      focus: '3.4',
      spans: [
        { p: 3, s: 3, quote: 'One observation appeared to seal the case.', role: 'context', note: 'why it mattered to the lipid account' },
        { p: 3, s: 4, quote: 'begin to move again, as though the pressure were squeezing the membrane back to its original volume', role: 'key', note: 'the result, then how it was read' }
      ],
      reuse: REUSE,
      alt: 'Two cards from paragraph 3. Sentence 3 is marked to read with the answer: one observation appeared to seal the case. Sentence 4 is highlighted: under helium the animals begin to move again, as though pressure squeezed the membrane back to its original volume.',
      caption: 'The highlight holds the result and the reading. The line above it says why the lipid camp prized it.'
    },
    demoPick: 'lost the response to a surgical stimulus that they had still shown a moment earlier',
    flags: [PLAY_FLAG, WEAK(['stopped breathing and had to be supported by a ventilator'])]
  },
  {
    qid: 'rc:rc-p19-q03',
    servesAlso: [],
    section: 'rc',
    subtopic: sub('detail'),
    difficulty: band(1, 'detail: a number lookup'),
    source: P19('q03', 37),
    keyText: 'nitrous oxide',
    answer: { line: 'Paragraph 9, sentence 4: the MAC of nitrous oxide is slightly more than a whole atmosphere, so it cannot carry an anaesthetic alone.' },
    steps: [
      'Put each number next to its agent. Paragraph 9, sentences 3 and 4.',
      'Isoflurane a little over 1 percent, sevoflurane about 2 percent, desflurane about 6 percent, xenon about two thirds of a breath. All under one atmosphere.',
      'Only nitrous oxide passes the line: slightly more than a whole atmosphere.'
    ],
    choices: [
      { text: 'isoflurane', role: 'trap', family: 'rc-misplaced', trap: 'A little over 1 percent', note: 'Isoflurane is a little over 1 percent of the breath, the smallest figure in the list.' },
      { text: 'sevoflurane', role: 'trap', family: 'rc-misplaced', trap: 'About 2 percent', note: 'Sevoflurane is about 2 percent, far below a whole atmosphere.' },
      { text: 'desflurane', role: 'trap', family: 'rc-misplaced', trap: 'Six percent, not six atmospheres', note: 'Desflurane has the biggest number among the volatile agents, about six. The unit carries over from the list: about 6 percent, not six atmospheres.' },
      { text: 'the noble gas xenon', role: 'trap', family: 'close-second', trap: 'Big, but under one', note: 'Xenon is the real runner-up: about two thirds of the breath. Large, and still less than a whole atmosphere.' },
      { text: 'nitrous oxide', role: 'key', note: 'Slightly more than a whole atmosphere: the only MAC in the paragraph above one.' }
    ],
    lockIt: 'Number lookups: pin each number to its own agent and its unit before you compare.',
    hook: null,
    playWith: play('rc-p19'),
    video: VID.detail,
    visual: {
      type: 'rc.evidence',
      passage: 'rc-p19',
      focus: '9.4',
      spans: [
        { p: 9, s: 4, quote: 'For nitrous oxide it is slightly more than a whole atmosphere', role: 'key', note: 'the only one past an atmosphere' },
        { p: 9, s: 3, quote: 'For isoflurane that is a little over one percent', role: 'trap', choice: 'isoflurane' },
        { p: 9, s: 3, quote: 'for sevoflurane about two percent', role: 'trap', choice: 'sevoflurane' },
        { p: 9, s: 3, quote: 'for desflurane about six', role: 'trap', choice: 'desflurane' },
        { p: 9, s: 3, quote: 'for xenon roughly two thirds of the breath', role: 'trap', choice: 'the noble gas xenon', note: 'four values, all under one atmosphere' }
      ],
      reuse: REUSE,
      alt: 'Paragraph 9, sentence 4 is highlighted: for nitrous oxide the MAC is slightly more than a whole atmosphere. Sentence 3 marks four values, each tagged with the served letter of its agent: isoflurane a little over 1 percent, sevoflurane about 2, desflurane about 6, and xenon about two thirds of a breath.',
      caption: 'Four values sit under one atmosphere. Only the highlighted line goes past it.'
    },
    demoPick: 'the noble gas xenon',
    flags: [PLAY_FLAG]
  },
  {
    qid: 'rc:rc-p19-q04',
    servesAlso: [],
    section: 'rc',
    subtopic: sub('detail'),
    difficulty: band(1, 'detail'),
    source: P19('q04', 38),
    keyText: 'block a glutamate receptor instead of strengthening inhibition',
    answer: { line: 'Paragraph 7, sentence 4: these three leave GABA largely alone and block the NMDA glutamate receptor, cutting excitation instead.' },
    steps: [
      'Find the three names together: paragraph 7, sentence 4.',
      'Read what they share: they leave GABA largely alone and block the NMDA glutamate receptor, "cutting excitation rather than boosting inhibition".',
      'Sort the rest by group. Three other choices belong to the other drugs in paragraph 7; no line makes the relaxant claim.'
    ],
    choices: [
      { text: 'block a glutamate receptor instead of strengthening inhibition', role: 'key', note: 'Glutamate blocked, GABA left alone: excitation cut, not inhibition boosted.' },
      { text: 'make each pulse of the brain\'s inhibition last longer than it should', role: 'trap', family: 'rc-misplaced', trap: 'That is the GABA group', note: 'Longer inhibitory pulses belong to propofol, etomidate, the barbiturates and the ethers in sentence 2. These three leave GABA largely alone.' },
      { text: 'act on the glycine receptors of the spinal cord', role: 'trap', family: 'rc-misplaced', trap: 'The cord receptors', note: 'Glycine receptors come up in sentence 3, enhanced too, which ties them to the GABA group, not to these three.' },
      { text: 'open potassium channels that make a neuron harder to fire', role: 'trap', family: 'rc-misplaced', trap: 'The volatile agents', note: 'Sentence 5 gives the two pore domain potassium channels to the volatile agents, not to ketamine, nitrous oxide and xenon.' },
      { text: 'are the only agents that can be used without a muscle relaxant', role: 'trap', family: 'rc-outside', trap: 'Never claimed', note: 'No line links any drug to doing without a relaxant. Paragraph 9 even says nitrous oxide cannot carry an anaesthetic alone.' }
    ],
    lockIt: 'When a paragraph sorts drugs into groups, match each choice to its own group before you pick.',
    hook: null,
    playWith: play('rc-p19'),
    video: VID.detail,
    visual: {
      type: 'rc.evidence',
      passage: 'rc-p19',
      focus: '7.4',
      spans: [
        { p: 7, s: 4, quote: 'leave GABA largely alone and instead block the NMDA glutamate receptor, cutting excitation rather than boosting inhibition', role: 'key' },
        { p: 7, s: 2, quote: 'so each pulse lasts longer than it should', role: 'trap', choice: 'make each pulse of the brain\'s inhibition last longer than it should', note: 'the GABA group' },
        { p: 7, s: 5, quote: 'open two pore domain potassium channels, which make a neuron harder to fire', role: 'trap', choice: 'open potassium channels that make a neuron harder to fire', note: 'the volatile agents' }
      ],
      reuse: REUSE,
      alt: 'Paragraph 7, sentence 4 is highlighted: ketamine, nitrous oxide and xenon leave GABA alone and block the NMDA glutamate receptor. Sentences 2 and 5 are marked as trap sources, each tagged with its served letter: longer inhibitory pulses for the GABA group, and potassium channels for the volatile agents.',
      caption: 'One highlight for the named group. The marked lines describe other groups that traps borrow from.'
    },
    demoPick: 'make each pulse of the brain\'s inhibition last longer than it should',
    flags: [PLAY_FLAG]
  },
  {
    qid: 'rc:rc-p19-q05',
    servesAlso: [],
    section: 'rc',
    subtopic: sub('detail'),
    difficulty: band(1, 'detail: a number lookup'),
    source: P19('q05', 39),
    keyText: 'somewhere between a third and a half',
    answer: { line: 'Paragraph 10, sentence 4: unresponsiveness to speech appears at perhaps a third to a half of MAC.' },
    steps: [
      'Find the effect the stem names: unresponsiveness to speech, paragraph 10, sentence 4.',
      'Read its dose: "perhaps a third to a half of MAC".',
      'Keep the ladder straight. Amnesia at about a quarter, speech at a third to a half, stillness at full MAC.'
    ],
    choices: [
      { text: 'about a quarter', role: 'trap', family: 'rc-misplaced', trap: 'That is amnesia', note: 'About a quarter of MAC is where amnesia appears, one rung lower on the same ladder in sentence 5.' },
      { text: 'about one tenth', role: 'trap', family: 'rc-outside', trap: 'No such dose', note: 'No effect in the passage is tied to a tenth of MAC.' },
      { text: 'somewhere between a third and a half', role: 'key', note: 'Above amnesia at a quarter, below stillness at full MAC: a third to a half.' },
      { text: 'the full value of MAC and nothing less', role: 'trap', family: 'rc-misplaced', trap: 'That is stillness', note: 'Full MAC is defined by movement: half of patients do not move when the skin is cut. Unresponsiveness to speech comes well before that.' },
      { text: 'roughly twice the value of MAC', role: 'trap', family: 'rc-outside', trap: 'Not a number given', note: 'No effect is placed at twice MAC. The brain alone needing far more agent to stop movement is a different measurement.' }
    ],
    lockIt: 'Close numbers: match the effect to its own dose. The trap is usually the neighbour\'s number.',
    hook: null,
    playWith: play('rc-p19'),
    video: VID.detail,
    visual: {
      type: 'rc.evidence',
      passage: 'rc-p19',
      focus: '10.4',
      spans: [
        { p: 10, s: 5, quote: 'at something like a quarter of MAC', role: 'trap', choice: 'about a quarter', note: 'lowest rung: amnesia' },
        { p: 10, s: 4, quote: 'appears at perhaps a third to a half of MAC', role: 'key', note: 'middle rung: speech, the dose asked for' },
        { p: 9, s: 6, quote: 'the only thing it measures is whether a body moves', role: 'trap', choice: 'the full value of MAC and nothing less', note: 'top rung: full MAC, read by movement' }
      ],
      reuse: REUSE,
      alt: 'Three cards in dose order. Paragraph 10, sentence 5 is marked as a trap source, amnesia at about a quarter of MAC, and sentence 4 is highlighted: unresponsiveness to speech at a third to a half. Paragraph 9, sentence 6, also a trap source, says full MAC measures only movement.',
      caption: 'Read the cards as a ladder, low dose to high. The highlight is the middle rung.'
    },
    demoPick: 'about a quarter',
    flags: [PLAY_FLAG]
  },
  {
    qid: 'rc:rc-p19-q06',
    servesAlso: [],
    section: 'rc',
    subtopic: sub('vocab'),
    difficulty: band(1, 'vocabulary in context'),
    source: P19('q06', 40),
    keyText: 'power to explain what the evidence showed',
    answer: { line: 'Paragraph 6 shows the correlation never pointed at lipid. So the theory lost its hold on the evidence: its power to explain.' },
    steps: [
      'Read the lines before the word. A lone protein reproduces the old correlation, so "the correlation never pointed at lipid in particular".',
      'So purchase here is a hold, the grip an idea has on the evidence. Not buying, and not a literal grip.',
      'Swap the key into the sentence: the theory lost its power to explain what the evidence showed. It fits.'
    ],
    choices: [
      { text: 'commercial backing from the companies that made the drugs', role: 'trap', family: 'rc-outside', trap: 'Purchase as buying', note: 'Reads purchase as buying. No companies or money appear anywhere in the passage.' },
      { text: 'physical grip on the membranes it described', role: 'trap', family: 'rc-misplaced', trap: 'The literal grip', note: 'Purchase can mean a physical grip, but a theory holds no membrane. What slipped was its hold on the evidence.' },
      { text: 'place in the historical record of the field', role: 'trap', family: 'rc-too-strong', trap: 'Not erased from history', note: 'Too far. The theory lost its standing as an explanation, not its place in the story: the passage itself tells that story at length.' },
      { text: 'power to explain what the evidence showed', role: 'key', note: 'Purchase as hold: after luciferase, the lipid theory no longer explained the evidence.' },
      { text: 'supporters among the chemists who first proposed it', role: 'trap', family: 'rc-misplaced', trap: 'Not who proposed it', note: 'Chemists do appear, in paragraph 5, but they built the compounds that challenged the theory. The paragraph is about what the theory explains, not who backed it.' }
    ],
    lockIt: 'Vocabulary in context: read the sentences around the word, then swap each choice in. Keep the one that fits.',
    hook: null,
    playWith: play('rc-p19'),
    video: VID.vocab,
    visual: {
      type: 'rc.evidence',
      passage: 'rc-p19',
      focus: '6.6',
      spans: [
        { p: 6, s: 4, quote: 'the correlation never pointed at lipid in particular', role: 'key', note: 'what the evidence now showed' },
        { p: 6, s: 5, quote: 'lodge in any oily pocket, whether in a bilayer or in the folded interior of a protein', role: 'context', note: 'any oily pocket, protein included' },
        { p: 6, s: 6, quote: 'After that, the lipid theory lost its purchase.', role: 'key', note: 'so the theory lost its hold' }
      ],
      reuse: REUSE,
      alt: 'Three lines from paragraph 6. Sentence 4 is highlighted: the correlation never pointed at lipid in particular. Sentence 5 is marked to read with it, the agents lodge in any oily pocket, and sentence 6 is highlighted: after that, the lipid theory lost its purchase.',
      caption: 'Read down the cards: the evidence stops pointing at lipid, so the theory loses its hold. That is purchase here.'
    },
    demoPick: 'physical grip on the membranes it described',
    flags: [PLAY_FLAG, THEY]
  },
  {
    qid: 'rc:rc-p19-q07',
    servesAlso: [],
    section: 'rc',
    subtopic: sub('vocab'),
    difficulty: band(1, 'vocabulary in context'),
    source: P19('q07', 41),
    keyText: 'incapable of fine distinctions',
    answer: { line: 'The next sentence defines it: MAC describes a population, not the patient on the table, and measures only whether a body moves.' },
    steps: [
      'Read the sentence after the word. That is where the author explains "blunt".',
      'Sentence 6: MAC "describes a population rather than the patient on the table", and it measures only whether a body moves.',
      'So blunt means coarse. It cannot draw fine lines between patients, or between effects.'
    ],
    choices: [
      { text: 'worn down by repeated use', role: 'trap', family: 'rc-misplaced', trap: 'Dull from wear', note: 'A real sense of blunt, like a knife dulled by use. But nothing says MAC wore down; it was coarse from the start.' },
      { text: 'incapable of fine distinctions', role: 'key', note: 'A population, and only movement: a measure too coarse for fine distinctions.' },
      { text: 'plainly and even harshly worded', role: 'trap', family: 'rc-misplaced', trap: 'Blunt as in frank', note: 'Blunt speech is a real sense, but MAC is a measure, not a remark.' },
      { text: 'slow to take effect in the body', role: 'trap', family: 'rc-outside', trap: 'Not about speed', note: 'Nothing in paragraph 9 is about how fast anything acts. The sentence after the word is about what MAC can tell you.' },
      { text: 'not sharp enough to cut tissue', role: 'trap', family: 'rc-misplaced', trap: 'The literal blade', note: 'The skin being cut in sentence 2 pulls toward a literal blade, but MAC is a number, not an instrument.' }
    ],
    lockIt: 'Vocabulary in context: the sentence right after the word often defines it. Use that, not the dictionary sense.',
    hook: null,
    playWith: play('rc-p19'),
    video: VID.vocab,
    visual: {
      type: 'rc.evidence',
      passage: 'rc-p19',
      focus: '9.6',
      spans: [
        { p: 9, s: 5, quote: 'MAC is both useful and blunt.', role: 'context', note: 'the word' },
        { p: 9, s: 6, quote: 'It describes a population rather than the patient on the table', role: 'key' },
        { p: 9, s: 6, quote: 'the only thing it measures is whether a body moves', role: 'key', note: 'the definition: a coarse measure' },
        { p: 9, s: 2, quote: 'when the skin is cut', role: 'trap', choice: 'not sharp enough to cut tissue', note: 'where the blade idea comes from' }
      ],
      reuse: REUSE,
      alt: 'Paragraph 9, sentence 5 is marked to read with the answer: MAC is both useful and blunt. Sentence 6 is highlighted twice: it describes a population, and it measures only whether a body moves. Sentence 2 is marked as a trap source: the skin is cut.',
      caption: 'The word, then the sentence that defines it. The marked line about cut skin is where the blade trap comes from.'
    },
    demoPick: 'worn down by repeated use',
    flags: [PLAY_FLAG]
  },
  {
    qid: 'rc:rc-p19-q08',
    servesAlso: [],
    section: 'rc',
    subtopic: sub('inference'),
    difficulty: band(3, 'inference about evidence'),
    source: P19('q08', 42),
    keyText: 'It fits protein binding just as well, so it cannot single out lipid',
    answer: { line: 'Paragraph 6: if a lone protein reproduces the correlation, the correlation never pointed at lipid in particular.' },
    steps: [
      'Find the luciferase result in paragraph 6. A soluble protein with no membrane near it is switched off in nearly the order of clinical potency.',
      'Read the author\'s own conclusion in sentence 4: "the correlation never pointed at lipid in particular".',
      'Sentence 5 gives the why: these agents lodge in any oily pocket, in a bilayer or inside a protein.',
      'Match the choice at that strength. Protein fits too.'
    ],
    choices: [
      { text: 'It rested on measurements that later turned out to be mistaken', role: 'trap', family: 'rc-contradicted', trap: 'The data held up', note: 'Luciferase reproduces the correlation. What gave way was the reading that it pointed at lipid, not the measurements behind it.' },
      { text: 'It applies only to agents that are gases at room temperature', role: 'trap', family: 'rc-outside', trap: 'Gases not singled out', note: 'Nothing in the passage limits the correlation to gases. Paragraph 2 ranks the available agents, whatever their form.' },
      { text: 'It shows that enzymes rather than ion channels are the real targets', role: 'trap', family: 'rc-too-strong', trap: 'One enzyme, overread', note: 'Luciferase is a test case, not a target in the brain. Paragraph 7 names receptors and ion channels as the targets the field found.' },
      { text: 'It holds for proteins in a test tube but breaks down in the tissue of a living animal', role: 'trap', family: 'rc-contradicted', trap: 'Found in animals first', note: 'The correlation was first found in animals, in paragraph 2. Luciferase shows it also holds in a test tube, not that it breaks down in the body.' },
      { text: 'It fits protein binding just as well, so it cannot single out lipid', role: 'key', note: 'Membrane and protein both fit the correlation, so it cannot point at lipid alone.' }
    ],
    lockIt: 'Evidence questions: find the author\'s own conclusion from the result, and pick the choice at that strength.',
    hook: null,
    playWith: play('rc-p19'),
    video: VID.inference,
    visual: {
      type: 'rc.evidence',
      passage: 'rc-p19',
      focus: '6.4',
      spans: [
        { p: 6, s: 3, quote: 'they do so in nearly the order of their clinical potency', role: 'context', note: 'the result: a lone protein, the same order' },
        { p: 6, s: 4, quote: 'the correlation never pointed at lipid in particular', role: 'key', note: 'the conclusion' },
        { p: 6, s: 5, quote: 'lodge in any oily pocket, whether in a bilayer or in the folded interior of a protein', role: 'key', note: 'the reason' }
      ],
      reuse: REUSE,
      alt: 'Three lines from paragraph 6. Sentence 3 is marked to read with the answer: anaesthetics switch off luciferase in nearly the order of their clinical potency. Sentences 4 and 5 are highlighted: the correlation never pointed at lipid, since these agents lodge in any oily pocket, bilayer or protein.',
      caption: 'Result on top, then the author\'s conclusion and its reason. A protein fits the old pattern too.'
    },
    demoPick: 'It shows that enzymes rather than ion channels are the real targets',
    flags: [PLAY_FLAG, THEY]
  },
  {
    qid: 'rc:rc-p19-q09',
    servesAlso: [],
    section: 'rc',
    subtopic: sub('inference'),
    difficulty: band(2, 'inference: two lines joined'),
    source: P19('q09', 43),
    keyText: 'the sign that the standard measure of depth depends on can no longer be seen',
    answer: { line: 'The relaxant removes movement, and movement is the sign the standard measure of depth, MAC, was built on.' },
    steps: [
      'Find the relaxant: paragraph 11, sentence 2. It "removes the very sign, movement, on which the standard measure of depth was built".',
      'Chase "standard measure" back to paragraph 9. MAC is defined by whether patients move when the skin is cut.',
      'Join the two. A paralyzed patient cannot move, so the measure has nothing left to read.'
    ],
    choices: [
      { text: 'the sign that the standard measure of depth depends on can no longer be seen', role: 'key', note: 'Movement is the sign, the relaxant takes it away, and the measure is left with nothing to read.' },
      { text: 'muscle relaxants lower the concentration of agent that a patient turns out to need', role: 'trap', family: 'rc-outside', trap: 'Never said', note: 'No line says a relaxant changes how much agent a patient needs.' },
      { text: 'relaxants are known to erase the memory of the procedure', role: 'trap', family: 'rc-misplaced', trap: 'Memory belongs elsewhere', note: 'Memory loss is tied to the non-immobilizers in paragraph 5 and to low doses of agent in paragraph 10, never to relaxants.' },
      { text: 'the opioid in the mixture becomes unnecessary once movement has stopped', role: 'trap', family: 'rc-outside', trap: 'The opioid has a job', note: 'Sentence 1 gives the opioid its own job, the reflex responses to injury. Nothing says stillness makes it unnecessary.' },
      { text: 'paralysis makes the electroencephalogram impossible to record', role: 'trap', family: 'rc-outside', trap: 'EEG never ruled out', note: 'Paragraph 12 has monitors reading the electroencephalogram from forehead electrodes. The passage never says paralysis stops the recording.' }
    ],
    lockIt: 'Inference: join two stated lines. Here, what the drug removes and what the measure needs.',
    hook: null,
    playWith: play('rc-p19'),
    video: VID.inference,
    visual: {
      type: 'rc.evidence',
      passage: 'rc-p19',
      focus: '11.2',
      spans: [
        { p: 11, s: 2, quote: 'removes the very sign, movement, on which the standard measure of depth was built', role: 'key', tag: '1' },
        { p: 9, s: 2, quote: 'the concentration of inhaled agent at which half of patients will not move when the skin is cut', role: 'context', tag: '2' }
      ],
      link: { from: '1', to: '2', label: 'standard measure = MAC, read by movement' },
      reuse: REUSE,
      alt: 'Two lines joined by a connector labeled standard measure equals MAC, read by movement. Line 1, highlighted, paragraph 11, sentence 2: the relaxant removes the very sign, movement, on which the standard measure was built. Line 2, paragraph 9, sentence 2: MAC is where half of patients will not move when the skin is cut.',
      caption: 'Line 1 says what the relaxant removes. Line 2 says what MAC reads. The same thing: movement.'
    },
    demoPick: 'paralysis makes the electroencephalogram impossible to record',
    flags: [PLAY_FLAG, { kind: 'bank-copy', text: 'Bank distractor note on the electroencephalogram choice says the monitors read a signal "which paralysis does not silence". True physiology, but the passage never states it; the explainer says only that the passage never claims paralysis stops the recording.' }]
  },
  {
    qid: 'rc:rc-p19-q10',
    servesAlso: [],
    section: 'rc',
    subtopic: sub('mainidea'),
    difficulty: band(2, 'main idea'),
    source: P19('q10', 44),
    keyText: 'Anaesthesia works safely at scale yet is not fully understood, with many targets and effects that come apart',
    answer: { line: 'The passage opens on a safe drug no one can explain and closes on a condition the field cannot yet define.' },
    steps: [
      'Read the frame first. Paragraph 1: remarkably safe, yet no one can say what anaesthesia is at the level of molecules.',
      'Then the close: the field produces, on demand, "a condition it cannot yet define".',
      'Check the middle: too many protein targets in paragraph 7, and effects that come apart, "Three effects, three doses, three places."',
      'Only one choice holds all of it.'
    ],
    choices: [
      { text: 'The lipid membrane theory has been replaced by a settled account built on one protein target', role: 'trap', family: 'rc-half-supported', trap: 'Fell, but nothing settled', note: 'Half of it holds: the lipid theory did fall. But the field found too many protein targets, and the one clean result holds for one drug, not the state.' },
      { text: 'Anaesthesia carries hidden dangers that patients are never told about, and the profession has been slow to admit it', role: 'trap', family: 'rc-tone', trap: 'Too alarmed', note: 'The passage calls anaesthesia remarkably safe and the gap a research program rather than a warning. Alarm is not its register.' },
      { text: 'Anaesthesia works safely at scale yet is not fully understood, with many targets and effects that come apart', role: 'key', note: 'Safe at scale, not understood, many targets, effects that come apart: the opening, middle and close in one line.' },
      { text: 'The main obstacle to understanding anaesthesia is that operating room monitors are not accurate enough', role: 'trap', family: 'rc-too-weak', trap: 'One paragraph as the point', note: 'Monitors fill one paragraph. Paragraph 14 blames the slow progress partly on redundant targets, not on instruments, and the main idea covers far more.' },
      { text: 'Because different drugs act at different sites, anaesthetists ought to give only one agent at a time', role: 'trap', family: 'rc-outside', trap: 'No advice given', note: 'The passage never recommends one agent at a time. It describes practice as several drugs together and says the practice should not be unsettled.' }
    ],
    lockIt: 'Main idea: the answer covers the opening puzzle and the closing verdict, at the author\'s strength.',
    hook: null,
    playWith: play('rc-p19'),
    video: VID.mainidea,
    visual: {
      type: 'rc.evidence',
      passage: 'rc-p19',
      focus: '15.5',
      spans: [
        { p: 1, s: 3, quote: 'what general anaesthesia is at the level of molecules', role: 'key' },
        { p: 7, s: 1, quote: 'The field turned to proteins and found too many of them.', role: 'key' },
        { p: 10, s: 6, quote: 'Three effects, three doses, three places.', role: 'key' },
        { p: 15, s: 5, quote: 'a condition it cannot yet define', role: 'key' }
      ],
      reuse: REUSE,
      alt: 'Four highlighted lines from start to finish: paragraph 1, no one can say what anaesthesia is at the level of molecules; paragraph 7, too many protein targets; paragraph 10, three effects, three doses, three places; and paragraph 15, a condition the field cannot yet define.',
      caption: 'Top to bottom: the puzzle, the crowd of targets, effects that split apart, still undefined. The key holds all four.'
    },
    demoPick: 'The lipid membrane theory has been replaced by a settled account built on one protein target',
    flags: [PLAY_FLAG, { kind: 'bank-copy', text: 'Bank distractor note on the lipid-replaced choice opens with the label "Half right." The explainer maps the label to a family (rc-half-supported) and does not lift it as note text.' }]
  },
  {
    qid: 'rc:rc-p19-q11',
    servesAlso: [],
    section: 'rc',
    subtopic: sub('function'),
    difficulty: band(2, 'function of a detail'),
    source: P19('q11', 45),
    keyText: 'show that molecules with nothing structurally in common produce the same state',
    answer: { line: 'Right after the list, the author says these molecules share almost nothing, though drugs at one receptor usually share a shape.' },
    steps: [
      'Ask why the list is there, not what is on it.',
      'Read the line after the list: in any other drug class "the list would be absurd", since drugs at one receptor share a shape.',
      'Sentence 7 lands it: "These share almost nothing beyond a mild reluctance to stay dissolved in water". Unlike molecules, one state.'
    ],
    choices: [
      { text: 'rank the agents by how safe each one is in practice', role: 'trap', family: 'rc-outside', trap: 'No safety ranking', note: 'Paragraph 8 describes shapes only. Safety comes up in paragraph 1, and no agent is ranked against another.' },
      { text: 'show that molecules with nothing structurally in common produce the same state', role: 'key', note: 'Unlike shapes, one state: the list makes the chemical variety impossible to miss.' },
      { text: 'explain why the volatile agents became the most widely used members of the group', role: 'trap', family: 'rc-outside', trap: 'Popularity never discussed', note: 'No line says which agents are used most, or why.' },
      { text: 'argue that only one drug on the list is a true anaesthetic', role: 'trap', family: 'rc-contradicted', trap: 'They all count', note: 'Sentence 2 calls xenon a complete anaesthetic, and nothing in paragraph 8 rules a drug out. The list shows variety, not a disqualification.' },
      { text: 'demonstrate that every agent named acts at the GABA type A receptor', role: 'trap', family: 'rc-contradicted', trap: 'Not all at GABA', note: 'Paragraph 7 says ketamine, nitrous oxide and xenon leave GABA largely alone. The list crosses the target groups of paragraph 7.' }
    ],
    lockIt: 'Function of a list: read the line right after it. The author says there why the list is there.',
    hook: null,
    playWith: play('rc-p19'),
    video: VID.function,
    visual: {
      type: 'rc.evidence',
      passage: 'rc-p19',
      focus: '8.7',
      spans: [
        { p: 8, s: 6, quote: 'molecules that act at one receptor usually share a recognizable shape', role: 'key', note: 'what you would expect' },
        { p: 8, s: 7, quote: 'These share almost nothing beyond a mild reluctance to stay dissolved in water.', role: 'key', note: 'what the list shows' },
        { p: 8, s: 2, quote: 'it is a complete anaesthetic', role: 'trap', choice: 'argue that only one drug on the list is a true anaesthetic', note: 'one item on the list, and complete' }
      ],
      reuse: REUSE,
      alt: 'Paragraph 8, sentences 6 and 7 are highlighted: drugs at one receptor usually share a recognizable shape, yet these share almost nothing. Sentence 2 is marked as a trap source: xenon is a single atom and a complete anaesthetic.',
      caption: 'The two highlights come right after the list and say why it is there. Unlike molecules, one state.'
    },
    demoPick: 'demonstrate that every agent named acts at the GABA type A receptor',
    flags: [PLAY_FLAG]
  },
  {
    qid: 'rc:rc-p19-q12',
    servesAlso: [],
    section: 'rc',
    subtopic: sub('mainidea'),
    difficulty: band(2, 'main idea: organization'),
    source: P19('q12', 46),
    keyText: 'A puzzle is posed, one explanation rises and collapses, a messier replacement is laid out, and the consequences are weighed',
    answer: { line: 'Paragraph 1 poses the puzzle, the lipid account rises and falls, a crowded protein picture replaces it, and the close weighs what that means.' },
    steps: [
      'Split the passage into blocks before you read the choices.',
      'Puzzle in paragraph 1. The lipid account rises in paragraphs 2 and 3, then "began to fail on its own terms" in paragraphs 4 to 6.',
      'From paragraph 7, the field "found too many" protein targets. Paragraphs 14 and 15 weigh what the gap means.',
      'Match the moves in order. Only one choice has them all.'
    ],
    choices: [
      { text: 'A puzzle is posed, one explanation rises and collapses, a messier replacement is laid out, and the consequences are weighed', role: 'key', note: 'Puzzle, rise and fall, a messier replacement, consequences: four clauses, four blocks, in order.' },
      { text: 'Two rival drugs are compared point by point and one is judged the better choice', role: 'trap', family: 'rc-outside', trap: 'No head to head', note: 'Many drugs appear, grouped by target and by shape. None are compared point by point or judged better.' },
      { text: 'A single patient\'s case is described and then generalized to the whole of surgery', role: 'trap', family: 'rc-outside', trap: 'No single patient', note: 'The opening is about tens of millions of patients. No case history appears anywhere.' },
      { text: 'A chronological list of discoveries is given with no argument running through it', role: 'trap', family: 'rc-half-supported', trap: 'Dates, minus the argument', note: 'The history does run roughly forward in time. But an argument runs through it: a theory rises, breaks down, and is replaced.' },
      { text: 'A problem in the operating room is described in detail and then a particular piece of monitoring equipment is recommended to solve it', role: 'trap', family: 'rc-outside', trap: 'Nothing recommended', note: 'Monitoring is one paragraph, and it says no instrument reads experience. No device is recommended.' }
    ],
    lockIt: 'Organization: name each block\'s job in order, then pick the choice with the same moves in the same order.',
    hook: null,
    playWith: play('rc-p19'),
    video: VID.mainidea,
    visual: {
      type: 'rc.evidence',
      passage: 'rc-p19',
      focus: '4.1',
      spans: [
        { p: 1, s: 3, quote: 'What is strange about this success', role: 'key', tag: '1', note: 'the puzzle' },
        { p: 4, s: 1, quote: 'The account began to fail on its own terms.', role: 'key', tag: '2', note: 'the explanation built in paragraphs 2 and 3 collapses' },
        { p: 7, s: 1, quote: 'The field turned to proteins and found too many of them.', role: 'key', tag: '3', note: 'a messier replacement' },
        { p: 15, s: 3, quote: 'The incompleteness is a research program rather than a warning.', role: 'context', tag: '4', note: 'the consequences weighed' }
      ],
      reuse: REUSE,
      alt: 'Four numbered lines in passage order, one per move: paragraph 1, what is strange about this success; paragraph 4, the account began to fail; paragraph 7, too many protein targets; and paragraph 15, a research program rather than a warning.',
      caption: 'Read the numbered cards in order: the puzzle, the theory rising and falling, a messier picture, the verdict. That is the key, clause by clause.'
    },
    demoPick: 'A chronological list of discoveries is given with no argument running through it',
    flags: [PLAY_FLAG, WEAK(['Two rival drugs are compared point by point and one is judged the better choice', 'A single patient\'s case is described and then generalized to the whole of surgery'])]
  },
  {
    qid: 'rc:rc-p19-q13',
    servesAlso: [],
    section: 'rc',
    subtopic: sub('tone'),
    difficulty: band(2, 'tone of a closing paragraph'),
    source: P19('q13', 47),
    keyText: 'untroubled by it and curious about what remains',
    answer: { line: 'Paragraph 15: none of this unsettles the practice, and the incompleteness is a research program rather than a warning.' },
    steps: [
      'Read paragraph 15 for the author\'s judging words.',
      'Calm about practice: "None of this unsettles the practice, and it should not."',
      'Curious about the gap: it is "a research program rather than a warning", and the situation "does have a particular flavor".',
      'Untroubled and curious. Both halves.'
    ],
    choices: [
      { text: 'alarmed at what the gap means for patients', role: 'trap', family: 'read-backward', trap: 'Warning for research program', note: 'The author says the gap is a research program rather than a warning. Alarm reads that line backward.' },
      { text: 'dismissive of the research that seeks to close it', role: 'trap', family: 'rc-contradicted', trap: 'Research is the point', note: 'Calling the gap a research program values the work. Nothing in paragraph 15 waves the research off.' },
      { text: 'indifferent to whether patients are safe', role: 'trap', family: 'rc-tone', trap: 'Calm is not cold', note: 'The author is calm because the practice works, refined by watching patients. That is care about safety, not indifference.' },
      { text: 'untroubled by it and curious about what remains', role: 'key', note: 'Practice not unsettled, the gap a research program: calm, and interested in what remains.' },
      { text: 'triumphant about how much has been settled', role: 'trap', family: 'rc-half-supported', trap: 'Proud of the practice only', note: 'The author does praise the practice. But the paragraph ends on a condition the field cannot yet define, so little is settled.' }
    ],
    lockIt: 'Tone: collect the author\'s judging words in the paragraph, and keep the choice that fits all of them.',
    hook: null,
    playWith: play('rc-p19'),
    video: VID.tone,
    visual: {
      type: 'rc.evidence',
      passage: 'rc-p19',
      focus: '15.3',
      spans: [
        { p: 15, s: 1, quote: 'None of this unsettles the practice, and it should not.', role: 'key', note: 'untroubled' },
        { p: 15, s: 3, quote: 'The incompleteness is a research program rather than a warning.', role: 'key', note: 'curious, not alarmed' },
        { p: 15, s: 5, quote: 'a condition it cannot yet define', role: 'context', note: 'still open, so no victory lap' }
      ],
      reuse: REUSE,
      alt: 'Paragraph 15 in three cards. Sentences 1 and 3 are highlighted: none of this unsettles the practice, and the incompleteness is a research program rather than a warning. Sentence 5 is marked to read with them: a condition the field cannot yet define.',
      caption: 'Two highlights, two halves: calm about practice, curious about the gap. The last card rules out triumph.'
    },
    demoPick: 'alarmed at what the gap means for patients',
    flags: [PLAY_FLAG, WEAK(['indifferent to whether patients are safe'])]
  },
  {
    qid: 'rc:rc-p19-q14',
    servesAlso: [],
    section: 'rc',
    subtopic: sub('tone'),
    difficulty: band(2, 'tone: handling of evidence'),
    source: P19('q14', 48),
    keyText: 'deliberate about leaving the disagreement open and treating the gap as informative',
    answer: { line: 'Paragraph 13 gives both figures, calls the disagreement honest, and says the distance between them is itself a finding.' },
    steps: [
      'Find the two figures: paragraph 13, sentence 4. One in twenty thousand when patients volunteer it, twenty or thirty times higher when every patient is asked.',
      'Read what the author does with them: "The distance between those two figures is itself a finding."',
      'Sentence 3 calls the debate over whether a patient who squeezes on command is conscious an "honest disagreement". No side is picked.'
    ],
    choices: [
      { text: 'confident that the lower figure is the accurate one', role: 'trap', family: 'rc-too-strong', trap: 'No side picked', note: 'The author endorses neither number. The gap between them is the point.' },
      { text: 'convinced that the higher figure proves patients are routinely awake and aware during surgery', role: 'trap', family: 'rc-too-strong', trap: 'Routinely is too strong', note: 'Even the higher figure is a small minority, and almost none of the patients who squeeze on command remember anything.' },
      { text: 'impatient with colleagues who keep raising the question', role: 'trap', family: 'rc-tone', trap: 'No impatience', note: 'The author calls the disagreement honest. That is respect for the question, not irritation.' },
      { text: 'certain that the difference is a simple error of record keeping', role: 'trap', family: 'rc-contradicted', trap: 'A finding, not a slip', note: 'Sentence 5 calls the distance between the figures a finding. A finding is information, not a record-keeping slip.' },
      { text: 'deliberate about leaving the disagreement open and treating the gap as informative', role: 'key', note: 'Both figures kept, the disagreement called honest, the gap called a finding: open on purpose.' }
    ],
    lockIt: 'When an author refuses to pick a side and says why, that refusal is the attitude.',
    hook: null,
    playWith: play('rc-p19'),
    video: VID.tone,
    visual: {
      type: 'rc.evidence',
      passage: 'rc-p19',
      focus: '13.5',
      spans: [
        { p: 13, s: 3, quote: 'honest disagreement about it runs through the literature', role: 'key', note: 'no side picked' },
        { p: 13, s: 4, quote: 'about one in twenty thousand when patients must volunteer the experience, and twenty or thirty times higher when every patient is asked directly', role: 'context', note: 'the two figures' },
        { p: 13, s: 5, quote: 'The distance between those two figures is itself a finding.', role: 'key', note: 'the gap read as information' }
      ],
      reuse: REUSE,
      alt: 'Three lines from paragraph 13. Sentence 3 is highlighted: honest disagreement runs through the literature. Sentence 4 is marked to read with it, one in twenty thousand when volunteered and twenty or thirty times higher when asked, and sentence 5 is highlighted: the distance between those figures is itself a finding.',
      caption: 'The middle card holds the two figures. The highlights show the author keeping both and reading the gap as information.'
    },
    demoPick: 'certain that the difference is a simple error of record keeping',
    flags: [PLAY_FLAG]
  },
  {
    qid: 'rc:rc-p19-q15',
    servesAlso: [],
    section: 'rc',
    subtopic: sub('except'),
    difficulty: band(3, 'EXCEPT about the role of evidence'),
    source: P19('q15', 49),
    keyText: 'pressure restores movement in an animal that has been anaesthetized',
    answer: { line: 'Pressure reversal is the one piece the passage offers as support for the lipid theory: the observation that seemed to seal the case.' },
    steps: [
      'Flip the job. All five are in the passage; you are hunting the one that is not trouble for the lipid theory.',
      'Check off the trouble in paragraphs 4 to 6: warming, the mirror-image forms, the compounds that leave animals moving, luciferase.',
      'Look where pressure sits: paragraph 3, as the observation that "appeared to seal the case". Support, not trouble.'
    ],
    choices: [
      { text: 'a single degree of warming disorders a bilayer more than a clinical dose does', role: 'stated', family: 'rc-stated', note: 'Paragraph 4: a degree of warming disorders the bilayer more than a dose does, yet a mildly feverish patient stays awake.' },
      { text: 'two mirror image forms of one agent differ in potency', role: 'stated', family: 'rc-stated', note: 'Paragraph 4: oil cannot tell left from right, yet the two forms of isoflurane differ in potency.' },
      { text: 'pressure restores movement in an animal that has been anaesthetized', role: 'key', note: 'Paragraph 3 offers pressure reversal as support. It sits before the trouble starts in paragraph 4.' },
      { text: 'a soluble enzyme with no membrane is switched off in the order of clinical potency', role: 'stated', family: 'rc-stated', note: 'Paragraph 6: luciferase reproduces the old correlation with no membrane near it.' },
      { text: 'some highly oil soluble compounds fail to keep an animal from moving', role: 'stated', family: 'rc-stated', note: 'Paragraph 5: compounds that oil solubility says should be strong leave an animal still withdrawing from a surgical stimulus.' }
    ],
    lockIt: 'EXCEPT questions about evidence: sort each piece by the job the passage gives it, not by whether it appears.',
    hook: null,
    playWith: play('rc-p19'),
    video: VID.except,
    visual: {
      type: 'rc.evidence',
      passage: 'rc-p19',
      focus: '3.3',
      spans: [
        { p: 3, s: 3, quote: 'One observation appeared to seal the case.', role: 'key', choice: 'pressure restores movement in an animal that has been anaesthetized', note: 'the support side: pressure reversal' },
        { p: 4, s: 2, quote: 'Warming a membrane by a single degree disorders the bilayer more than a clinical dose of anaesthetic does', role: 'stated', choice: 'a single degree of warming disorders a bilayer more than a clinical dose does' },
        { p: 4, s: 4, quote: 'the two differ in potency', role: 'stated', choice: 'two mirror image forms of one agent differ in potency' },
        { p: 5, s: 2, quote: 'An animal breathing one still withdraws from a surgical stimulus.', role: 'stated', choice: 'some highly oil soluble compounds fail to keep an animal from moving' },
        { p: 6, s: 3, quote: 'they do so in nearly the order of their clinical potency', role: 'stated', choice: 'a soluble enzyme with no membrane is switched off in the order of clinical potency' }
      ],
      reuse: REUSE,
      alt: 'Paragraph 3, sentence 3 is highlighted as the answer: one observation appeared to seal the case, the pressure result offered as support. Four lines from paragraphs 4 to 6 check off as trouble, each tagged with its served letter: warming, the two mirror forms, an animal still withdrawing, and luciferase.',
      caption: 'The highlight sits on the support side, before the trouble starts. The four checked lines all count against the theory.'
    },
    demoPick: 'two mirror image forms of one agent differ in potency',
    flags: [PLAY_FLAG]
  },
  {
    qid: 'rc:rc-p19-q16',
    servesAlso: [],
    section: 'rc',
    subtopic: sub('detail'),
    difficulty: band(1, 'detail: locate a paragraph'),
    source: P19('q16', 50),
    keyText: 'paragraph 10',
    answer: { line: 'Paragraph 10: whether a body moves is decided largely below the neck. Immobility is mostly a spinal effect.' },
    steps: [
      'Name what you are hunting: a place in the nervous system that decides movement.',
      'Find it in paragraph 10: "Whether a body moves is decided largely below the neck." Sentence 3: "Immobility is mostly a spinal effect."',
      'Check the neighbour. Paragraph 9 defines MAC by movement but never says where movement is decided.'
    ],
    choices: [
      { text: 'paragraph 3', role: 'trap', family: 'rc-other-paragraph', trap: 'Movement, not where', note: 'Paragraph 3 has helium animals moving again. That is a membrane argument, not a place in the nervous system.' },
      { text: 'paragraph 7', role: 'trap', family: 'rc-other-paragraph', trap: 'Receptors in the cord', note: 'Paragraph 7 mentions glycine receptors in the cord, but as a drug target, not as what decides movement.' },
      { text: 'paragraph 9', role: 'trap', family: 'rc-other-paragraph', trap: 'Defines MAC only', note: 'Paragraph 9 defines MAC by whether a body moves, but says nothing about where that is decided.' },
      { text: 'paragraph 10', role: 'key', note: 'Sentences 1 and 3: movement is decided below the neck, a spinal effect.' },
      { text: 'paragraph 14', role: 'trap', family: 'rc-other-paragraph', trap: 'One drug, one pocket', note: 'Paragraph 14 has mice that etomidate can no longer keep still: one receptor result, not a place in the nervous system.' }
    ],
    lockIt: 'Locate: hunt for the paragraph that answers the stem, not one that only shares its words.',
    hook: null,
    playWith: play('rc-p19'),
    video: VID.detail,
    visual: {
      type: 'rc.evidence',
      passage: 'rc-p19',
      focus: '10.3',
      spans: [
        { p: 10, s: 1, quote: 'Whether a body moves is decided largely below the neck.', role: 'key', note: 'a place: below the neck' },
        { p: 10, s: 3, quote: 'Immobility is mostly a spinal effect.', role: 'key', note: 'the spinal cord' },
        { p: 9, s: 6, quote: 'the only thing it measures is whether a body moves', role: 'trap', choice: 'paragraph 9', note: 'about movement, but not where' }
      ],
      reuse: REUSE,
      alt: 'Paragraph 10, sentences 1 and 3 are highlighted: whether a body moves is decided largely below the neck, and immobility is mostly a spinal effect. Paragraph 9, sentence 6 is marked as a trap source: MAC measures whether a body moves, but not where.',
      caption: 'The highlights name a place: below the neck. The marked line is about movement too, but never says where.'
    },
    demoPick: 'paragraph 9',
    flags: [PLAY_FLAG, LOCATOR]
  }
];

// Where this batch departs from the expert's suggested family, and what the
// expert review changed, per item (coach record only).
const CHANGES = {
  'rc:rc-p10-q14': ['Expert review: the 17.2 card (the symbiosis is ancient, nearly universal and structurally elegant) is a context line, "Read with it", not a trap source. It is the line that rules the misdescribed choice out; that choice\'s pull comes from the skepticism of paragraphs 11 to 16. The card\'s note reads "the settled part: the partnership itself" and the alt says sentence 2 is marked to read with them; the caption is unchanged'],
  'rc:rc-p19-q13': ['Expert review: the 15.5 card (a condition it cannot yet define) is a context line, "Read with it", not a trap source. It rules triumph out, as the caption says; the pull of the triumphant choice is the praise in 15.2. The alt says sentence 5 is marked to read with them; note and caption unchanged'],
  'rc:rc-p19-q04': ['Expert review: step 3 says three other choices belong to the other drugs in paragraph 7 and no line makes the relaxant claim (it said each other choice describes a group in paragraph 7, which the relaxant choice does not)'],
  'rc:rc-p10-q12': ['Optional note taken: the experiments trap note ends "nothing is arranged by when it was run" (the passage gives no run order to check against), and the 1.5 note reads "block 1: the trade" (1.5 is the last sentence of paragraph 1, not where the block opens); the alt says the lines mark the blocks'],
  'rc:rc-p19-q11': ['Optional note taken: the GABA trap note ends "The list crosses the target groups of paragraph 7." (it said the list mixes targets on purpose, an intent the passage never states)'],
  'rc:rc-p19-q14': ['Optional note taken: step 3 says sentence 3 calls the debate over whether a patient who squeezes on command is conscious an "honest disagreement", then "No side is picked." (it said "it", which read as the two figures)'],
  'rc:rc-p19-q03': ['Xenon choice: family close-second (the expert suggested rc-misplaced): xenon has the largest MAC under an atmosphere, a real runner-up that loses to nitrous oxide, not a value pinned to the wrong agent'],
  'rc:rc-p19-q10': ['Lipid-replaced choice: family rc-half-supported (the expert stamped rc-contradicted, then recommended rc-half-supported in its notes after reading the bank label "Half right"): the lipid theory did fall; no settled single target replaced it'],
  'rc:rc-p19-q09': ['Picture: line 2 (paragraph 9, sentence 2, the definition of MAC) is a context line, since the bank proof is 11.2 only; the connector joins "standard measure" to its definition, as the expert asked'],
  'rc:rc-p10-q15': ['Picture: four cards, not five. All four check-offs plus the key line run 704 px on a 390 px phone (the gate allows 600), so the mushrooms line (4.4), the least tempting stated choice, is left to its trap card and the caption; the phosphate choice checks off on 5.2 ("Phosphate barely moves in soil.") instead of the bank\'s 5.3, the same claim in a shorter line; stated spans are not proof lines', 'Optional note taken: the key span note reads "the fungus or hunger may set the flow; kinship is not named" and the caption says what may set the flow, keeping the passage\'s hedge in 13.4 (both had dropped the "may")'],
  'rc:rc-p19-q12': ['Picture: four numbered cards, one per clause of the key (puzzle 1.3, rise and collapse 4.1, replacement 7.1, verdict 15.3). Bank proof 3.5 (the rise) is folded into the note on 4.1 so the phone panel stays under 600 px; 15.3 is a context line, since the bank proof has no line from paragraphs 14 and 15'],
  'rc:rc-p19-q05': ['Picture: the top rung (full MAC) is sentence 9.6, "the only thing it measures is whether a body moves", the shorter of the two lines that tie MAC to movement, so the ladder fits a phone panel'],
  'rc:rc-p19-q15': ['Picture: the non-immobilizer choice checks off on sentence 5.2 (an animal still withdraws) instead of the bank\'s 5.1, the shorter line that says what the choice says, so five cards fit a phone panel']
};

module.exports = { group: 'G1', batch: 'B008', title: 'Full-Length Test 1, Reading Comprehension, passage 2 (last six) and passage 3 (22 items)', entries: ENTRIES, changes: CHANGES };
