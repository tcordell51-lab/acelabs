// content/explainers-src/G1/B007.js: batch B007 of group G1 (Full-Length
// Test 1, the free practice test), Reading Comprehension: 28 items in the batch
// plan (docs/release-2026-10-30/questions/batches.json), 25 written here. The
// other three, rc:rc-o15-q01 (detail), rc:rc-o15-q05 (EXCEPT) and
// rc:rc-o15-q07 (inference), are pilot RC-1 to RC-3 and live in
// content/explainers-src/pilot/pilot.js.
//
// Served as FULL_1 Reading Comprehension: passage 1 is rc-o15 "What Photo 51
// Could Say" (questions 1 to 17), passage 2 is rc-p10 "The Trade Beneath the
// Forest Floor" (questions 18 to 28 here; its last five and passage 3 are B008).
//
// Written in Thomas's coaching voice (docs/release-2026-10-30/questions/voice-codex.md)
// from the independent expert's blind solve (docs/explainers/solves/B007.json:
// 28 of 28 keys agree, every expert proof line among the bank's proof lines,
// no key or picture dispute). The expert's families were weighed and kept unless
// CHANGES says otherwise. The bank's own distractor labels ("Wrong detail",
// "Reversed" and the rest) are mapped by meaning, never by label, and never
// lifted: a person or number swap is rc-misplaced, not read-backward.
//
// Authoring source, never published: /content/explainers-src/* is
// force-redirected like /docs/*. The build (scripts/explainers/build.mjs) checks
// every entry against tools/rc/data/bank.js (key text, every choice text, stem
// hash), runs the copy rules, finds every span quote verbatim in its sentence,
// checks every key span is a bank proof line, finds every quoted phrase in a
// step in the passage, and copies the student fields to content/explainers/ and
// the coach fields (flags, changes, demo pick, gate results) to
// docs/explainers/ only.
//
// Rules this file keeps: plain ASCII, no em dashes, never "wrong", "incorrect"
// or "failed" (passage sentences 11.5 and 12.3 of rc-o15 hold "wrong", so no
// span quotes that far; bank text such as a choice that says "wronged" is
// exempt and is never echoed in a note), never a choice letter, and no lone
// capital letters for the bases (adenine, not A), so nothing reads as a served
// letter. Step 1 opens with a move.
//
// Pictures: rc.evidence for every item, as the batch row names. Each card is a
// whole passage sentence with its marks: the proof line (a bank proof line;
// the build checks), where a tempting choice was borrowed from (tagged with
// the served letter), checked-off lines on EXCEPT items, and, new in this
// batch, a "Read with it" line (role context) for the sentence a proof line
// needs beside it: the sentence that shows what a vocabulary word means, the
// date a stated rule meets, the story a tone question judges. Cards are kept
// to three or four short sentences so a phone panel stays under 600 px.
'use strict';

const BANK = 'tools/rc/data/bank.js';
const src = (passage, id, pNo, n) => ({ bank: BANK, global: 'ACE_RC_BANK', locator: { passage, id }, servedAs: 'Full-Length Test 1, Reading Comprehension, passage ' + pNo + ', question ' + n });
const O15 = (id, n) => src('rc-o15', 'rc-o15-' + id, 1, n);
const P10 = (id, n) => src('rc-p10', 'rc-p10-' + id, 2, n);
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
const BANK_LABEL = (notes) => ({ kind: 'bank-copy', text: 'Bank distractor notes for this item open with the label "Wrong ..." (' + notes + '), a house-banned word. The explainer maps each label to a family by meaning and does not lift the wording.' });
const WRONG_IN_PASSAGE = { kind: 'bank-copy', text: 'Passage sentences 11.5 ("a harder wrong to put right") and 12.3 ("kept building wrong models") of rc-o15 hold a house-banned word. The evidence picture shows whole sentences as passage text (bank text, exempt), and no span quote or note here reaches the word.' };

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
  /* ===================== Passage 1: rc-o15, What Photo 51 Could Say ===================== */
  {
    qid: 'rc:rc-o15-q02',
    servesAlso: [],
    section: 'rc',
    subtopic: sub('detail'),
    difficulty: band(1, 'detail'),
    source: O15('q02', 2),
    keyText: 'the amount of adenine in a sample closely matched the amount of thymine',
    answer: { line: 'Paragraph 3 gives two findings. The second: in every sample, adenine closely matched thymine and guanine matched cytosine.' },
    steps: [
      'Find Chargaff in paragraph 3. He has two findings, marked First and Second. Hold both.',
      'The second finding is the answer: inside each sample, adenine matched thymine.',
      'Use the first finding as a filter. The proportions differed from species to species, so any choice that makes every species alike is out.'
    ],
    choices: [
      { text: 'the amount of adenine in a sample closely matched the amount of thymine', role: 'key', note: 'Paragraph 3, sentence 4, nearly word for word.' },
      { text: 'the four bases were present in equal amounts in the DNA of every species', role: 'trap', family: 'rc-too-strong', trap: 'Stretched the match', note: 'The match is in pairs: adenine with thymine, guanine with cytosine. All four equal goes further, and sentence 3 says the mix differed between species.' },
      { text: 'the DNA of all species contained the same proportions of the four bases', role: 'trap', family: 'rc-contradicted', note: 'Paragraph 3 says the opposite: the proportions differed from one species to another. That first finding is what brought down the fixed-repeat idea.' },
      { text: 'adenine and thymine together made up a fixed fraction of every sample', role: 'trap', family: 'rc-half-supported', note: 'Adenine and thymine are paired, but no fixed share holds in every sample: the mix changed from species to species.' },
      { text: 'the bases could be separated only after the sugar had been removed', role: 'trap', family: 'rc-outside', note: 'Nothing in paragraph 3 says the sugar had to come off first. Paper chromatography simply separated the bases.' }
    ],
    lockIt: 'When a paragraph lists findings, check every choice against all of them, not just the one you found.',
    hook: null,
    playWith: play('rc-o15'),
    video: VID.detail,
    visual: {
      type: 'rc.evidence',
      passage: 'rc-o15',
      focus: '3.4',
      spans: [
        { p: 3, s: 4, quote: 'in every sample the amount of adenine closely matched the amount of thymine, and guanine matched cytosine', role: 'key', note: 'the second finding: the match is inside one sample' },
        { p: 3, s: 3, quote: 'the proportions of the bases differed from one species to another', role: 'trap', choice: 'the DNA of all species contained the same proportions of the four bases', note: 'the first finding, which one choice turns around' }
      ],
      reuse: REUSE,
      alt: 'Two sentences from paragraph 3. Sentence 4 is highlighted as the answer: in every sample adenine matched thymine and guanine matched cytosine. Sentence 3 is marked as the source of a trap: the proportions of the bases differed from one species to another.',
      caption: 'Two findings, one paragraph. The match holds inside one sample; the mix changes between species.'
    },
    demoPick: 'the four bases were present in equal amounts in the DNA of every species',
    flags: [PLAY_FLAG]
  },
  {
    qid: 'rc:rc-o15-q03',
    servesAlso: [],
    section: 'rc',
    subtopic: sub('function'),
    difficulty: band(2, 'function of a paragraph'),
    source: O15('q03', 3),
    keyText: 'establish that a diffraction pattern must be interpreted rather than simply viewed',
    answer: { line: 'Paragraph 4 says the pattern is not an image of the molecule. Turning it into a structure takes mathematics and judgment.' },
    steps: [
      'Ask why the paragraph is there, not what it says. Function questions want the job.',
      'Find the claim the paragraph exists to make: sentence 2. The pattern is a map of repeating distances, not a picture.',
      'See where that pays off. In paragraph 6, Photo 51 speaks only "To anyone trained in the new diffraction theory of helices".'
    ],
    choices: [
      { text: 'argue that Astbury\'s photographs were more accurate than those taken later at King\'s', role: 'trap', family: 'rc-contradicted', note: 'Astbury is named in this very paragraph, which makes him feel like the point, but paragraph 5 says King\'s got sharper patterns than his.' },
      { text: 'show that the technique was invented specifically to study the shape of DNA', role: 'trap', family: 'rc-outside', note: 'Sentence 1 describes the method for any fiber of long molecules. Nothing says it was invented for DNA.' },
      { text: 'explain why Franklin preferred to study the A form rather than the B form', role: 'trap', family: 'rc-other-paragraph', note: 'Her reason for the A form, more exact numbers, is in paragraph 7. Paragraph 4 never mentions either form.' },
      { text: 'establish that a diffraction pattern must be interpreted rather than simply viewed', role: 'key', note: 'Sentence 2: a map of distances that takes mathematics and judgment to turn back into a structure.' },
      { text: 'demonstrate that Astbury\'s fibers were too poorly ordered to reveal the structure', role: 'trap', family: 'rc-off-question', trap: 'A detail, not the job', note: 'Sentence 3 does say it, but one detail inside the paragraph is not the reason the author stops to explain how diffraction works.' }
    ],
    lockIt: 'Function questions: ask what the paragraph is for, then find the line that does the job.',
    hook: null,
    playWith: play('rc-o15'),
    video: VID.function,
    visual: {
      type: 'rc.evidence',
      passage: 'rc-o15',
      focus: '4.2',
      spans: [
        { p: 4, s: 2, quote: 'The pattern is not an image of the molecule; it is a map of the distances that repeat inside it, and turning it back into a structure takes mathematics and judgment', role: 'key', note: 'the job: a pattern has to be read, not just looked at' },
        { p: 4, s: 3, quote: 'their fibers were too poorly ordered to say more', role: 'trap', choice: 'demonstrate that Astbury\'s fibers were too poorly ordered to reveal the structure', note: 'a true detail, but not why the paragraph is there' }
      ],
      reuse: REUSE,
      alt: 'Paragraph 4, sentence 2 is highlighted whole as the answer: the pattern is not an image but a map of repeating distances that takes mathematics and judgment to read. Sentence 3 is marked lighter: Astbury\'s fibers were too poorly ordered, a true detail that is not the paragraph\'s purpose.',
      caption: 'The highlighted line is the paragraph\'s job. The lighter mark is a true detail that answers a different question.'
    },
    demoPick: 'demonstrate that Astbury\'s fibers were too poorly ordered to reveal the structure',
    flags: [PLAY_FLAG, BANK_LABEL('note2, note4')]
  },
  {
    qid: 'rc:rc-o15-q04',
    servesAlso: [],
    section: 'rc',
    subtopic: sub('detail'),
    difficulty: band(1, 'detail'),
    source: O15('q04', 4),
    keyText: 'each of them understood a different person to be in charge of the DNA work',
    answer: { line: 'Wilkins expected an assistant. Franklin read Randall\'s letter as making the problem hers. Two readings of one job.' },
    steps: [
      'Find Franklin\'s arrival: paragraph 5. The friction sits in sentence 5.',
      'Read both halves of that sentence. Wilkins expected an assistant; she understood the problem was now hers.',
      'Sentence 6 closes it: the misunderstanding was never repaired. Two people, two readings.'
    ],
    choices: [
      { text: 'Randall had removed Wilkins from the biophysics unit before Franklin arrived', role: 'trap', family: 'rc-outside', note: 'Nothing removes Wilkins: paragraph 5 calls him Randall\'s deputy, and in paragraph 9 he is still there to show Watson Photo 51.' },
      { text: 'each of them understood a different person to be in charge of the DNA work', role: 'key', note: 'Paragraph 5, sentence 5: his assistant, in his reading; her problem, in hers.' },
      { text: 'Franklin refused to share Gosling\'s earlier photographs with Wilkins', role: 'trap', family: 'rc-outside', note: 'No refusal to share photographs appears anywhere. It sounds like a reason for friction, which is the pull.' },
      { text: 'Wilkins had been trained in Paris and distrusted her Cambridge methods', role: 'trap', family: 'rc-misplaced', trap: 'Her training, his name', note: 'Cambridge and Paris are Franklin\'s own training, paragraph 5, sentence 4. The choice pins her background on Wilkins.' },
      { text: 'Franklin had publicly criticized the quality of Wilkins\'s diffraction patterns', role: 'trap', family: 'rc-outside', note: 'Franklin criticizes the Cambridge model in paragraph 8, never Wilkins\'s patterns.' }
    ],
    lockIt: 'Cause questions: find the event, then read the sentence that says why it happened.',
    hook: null,
    playWith: play('rc-o15'),
    video: VID.detail,
    visual: {
      type: 'rc.evidence',
      passage: 'rc-o15',
      focus: '5.5',
      spans: [
        { p: 5, s: 5, quote: 'Wilkins seems to have expected her to work as his assistant; she understood from Randall\'s letter that the problem was now hers', role: 'key', note: 'two people, two readings of who was in charge' },
        { p: 5, s: 4, quote: 'Trained as a physical chemist at Cambridge, she had spent three years in Paris learning to apply X-ray methods', role: 'trap', choice: 'Wilkins had been trained in Paris and distrusted her Cambridge methods', note: 'Franklin\'s training, which one choice hands to Wilkins' }
      ],
      reuse: REUSE,
      alt: 'Paragraph 5, sentence 5 is highlighted as the answer: Wilkins expected an assistant, while Franklin understood from Randall\'s letter that the problem was hers. Sentence 4 is marked lighter as the source of a trap: Franklin\'s own training at Cambridge and in Paris.',
      caption: 'One sentence, two readings of who was in charge. The lighter mark is Franklin\'s training, borrowed by a trap.'
    },
    demoPick: 'Wilkins had been trained in Paris and distrusted her Cambridge methods',
    flags: [PLAY_FLAG]
  },
  {
    qid: 'rc:rc-o15-q06',
    servesAlso: [],
    section: 'rc',
    subtopic: sub('vocab'),
    difficulty: band(1, 'vocabulary in context'),
    source: O15('q06', 6),
    keyText: 'full of meaning',
    answer: { line: 'A photograph cannot speak, so eloquent here means it said a lot. The next sentence lists what it told a trained eye.' },
    steps: [
      'Read the word\'s own sentence: to a trained eye, "the picture was eloquent."',
      'Read the next sentence. It lists a helix, the climb per turn, the spacing between bases and the diameter.',
      'Put each choice in the slot. A photo does not talk. A photo that tells you four things is full of meaning.'
    ],
    choices: [
      { text: 'fluently spoken', role: 'trap', family: 'rc-misplaced', trap: 'The everyday sense', note: 'That is the usual meaning, about speech. A photograph does not speak, so the sense has to fit a picture.' },
      { text: 'full of meaning', role: 'key', note: 'Sentence 4 spells out how much the picture meant to a trained eye.' },
      { text: 'forcefully argued', role: 'trap', family: 'rc-misplaced', trap: 'Another speech sense', note: 'Persuasion is another speech meaning, and the picture is not arguing anything. It hands information to a trained reader.' },
      { text: 'pleasing to look at', role: 'trap', family: 'rc-outside', note: 'Beauty is never the point: paragraph 1 says the photo could pass for a flaw in the film.' },
      { text: 'hard to interpret', role: 'trap', family: 'read-backward', note: 'To a trained eye the picture was clear, so this runs the sentence in reverse. Hard to read is how an untrained eye saw it in paragraph 1.' }
    ],
    lockIt: 'Vocabulary in context: the passage\'s sense beats the dictionary\'s first sense. Test each choice in the sentence.',
    hook: null,
    playWith: play('rc-o15'),
    video: VID.vocab,
    visual: {
      type: 'rc.evidence',
      passage: 'rc-o15',
      focus: '6.3',
      spans: [
        { p: 6, s: 3, quote: 'the picture was eloquent', role: 'key', note: 'the word, describing a picture' },
        { p: 6, s: 4, quote: 'The X of dashes meant a helix', role: 'context', note: 'what the picture said: a helix, then three numbers' }
      ],
      reuse: REUSE,
      alt: 'Paragraph 6, sentence 3 is highlighted as the answer\'s place: to a trained eye, the picture was eloquent. Below it, sentence 4 is marked as the line to read with it: the X of dashes meant a helix, and the pattern gave the climb per turn, the base spacing and the diameter.',
      caption: 'Eloquent sits in sentence 3. Sentence 4 shows how much the picture said, so it means full of meaning.'
    },
    demoPick: 'fluently spoken',
    flags: [PLAY_FLAG, { kind: 'stem-style', text: 'The stem sets the word in single quotes (\'eloquent\'); the rc-p10 vocabulary stems use double quotes ("purchase", "sink"). Suggested, not applied: double quotes for consistency across the section.' }]
  },
  {
    qid: 'rc:rc-o15-q08',
    servesAlso: [],
    section: 'rc',
    subtopic: sub('detail'),
    difficulty: band(1, 'detail'),
    source: O15('q08', 8),
    keyText: 'allowed for far less water than her measurements showed',
    answer: { line: 'Paragraph 8 says the model allowed for only a fraction of the water her measurements showed, and it was abandoned.' },
    steps: [
      'Find the first Cambridge model: paragraph 8, sentence 3, November 1951.',
      'Read the next sentence for her objection. Her objection was water.',
      'Use the model\'s own description as a filter. Three chains, phosphates inside: a choice that flips either one is out.'
    ],
    choices: [
      { text: 'put the phosphate groups on the outside of the helix', role: 'trap', family: 'read-backward', trap: 'Flipped inside and out', note: 'The first model had the phosphates on the inside. Outside is where the 1953 model put the backbones, which is why it sounds familiar.' },
      { text: 'contained two chains when her data pointed to three', role: 'trap', family: 'rc-contradicted', note: 'The model had three chains, not two, and nothing says her data pointed to three. The choice swaps the counts.' },
      { text: 'copied the three-chain structure that Pauling had already published', role: 'trap', family: 'rc-timeline', note: 'Pauling\'s three-chain model came in early 1953, so a model built in November 1951 could not copy it.' },
      { text: 'allowed for far less water than her measurements showed', role: 'key', note: 'Sentence 4: only a fraction of the water the fibers held.' },
      { text: 'placed the bases ten to a turn instead of eleven', role: 'trap', family: 'rc-outside', note: 'Bases per turn never come up in her objection. This one needs outside knowledge.' }
    ],
    lockIt: 'Detail questions: the objection, reason or result usually sits in the sentence right after the name.',
    hook: null,
    playWith: play('rc-o15'),
    video: VID.detail,
    visual: {
      type: 'rc.evidence',
      passage: 'rc-o15',
      focus: '8.4',
      spans: [
        { p: 8, s: 4, quote: 'it allowed for only a fraction of the water her measurements showed the fibers to contain', role: 'key' },
        { p: 8, s: 3, quote: 'a three-chain helix with the phosphates on the inside', role: 'trap', choice: 'put the phosphate groups on the outside of the helix', note: 'the model as built: three chains, phosphates inside' },
        { p: 8, s: 6, quote: 'after Pauling produced a three-chain model with the same flaw', role: 'trap', choice: 'copied the three-chain structure that Pauling had already published', note: 'early 1953, after the model of 1951' }
      ],
      reuse: REUSE,
      alt: 'Paragraph 8, sentence 4 is highlighted as the answer: the model allowed for only a fraction of the water in the fibers. Lighter marks show where traps come from: sentence 3, three chains with phosphates inside, and sentence 6, Pauling\'s model of early 1953.',
      caption: 'Her objection is in sentence 4. Sentences 3 and 6 hold the model\'s facts and the date that traps scramble.'
    },
    demoPick: 'put the phosphate groups on the outside of the helix',
    flags: [PLAY_FLAG, BANK_LABEL('note2')]
  },
  {
    qid: 'rc:rc-o15-q09',
    servesAlso: [],
    section: 'rc',
    subtopic: sub('function'),
    difficulty: band(2, 'function of a detail'),
    source: O15('q09', 9),
    keyText: 'identify the method of model building that Watson and Crick were imitating',
    answer: { line: 'Sentence 2 opens "Following the example of Linus Pauling." He found a helix by building models, and Watson and Crick did the same.' },
    steps: [
      'Read the sentence the name sits in. It opens with "Following the example of Linus Pauling".',
      'Pauling found the alpha helix by building models. Watson and Crick guessed first and tested after: the same method.',
      'Why name Pauling? For his method. The helix is not being compared with anything.'
    ],
    choices: [
      { text: 'show that proteins had already been proven to be the true carriers of heredity', role: 'trap', family: 'rc-contradicted', note: 'Proteins only looked like the better candidate, paragraph 2, and Avery\'s 1944 work pointed to DNA. Nothing proves proteins carry heredity.' },
      { text: 'explain why Bragg ordered Watson and Crick to stop working on DNA', role: 'trap', family: 'rc-swapped-cause', trap: 'Pauling and Bragg, mixed up', note: 'Pauling does come into Bragg\'s story, but at the other end: his three-chain model got the pair let back in, sentence 6. The order itself followed their dropped model.' },
      { text: 'identify the method of model building that Watson and Crick were imitating', role: 'key', note: 'Following the example of: build the model first, test it against the data after.' },
      { text: 'suggest that Pauling had already solved the structure of DNA by 1951', role: 'trap', family: 'rc-contradicted', note: 'Pauling\'s DNA model of early 1953 had the same flaw as their first one. He had not solved it.' },
      { text: 'contrast the alpha helix of proteins with the double helix of DNA', role: 'trap', family: 'rc-off-question', trap: 'Two helices, no comparison', note: 'Both are helices, but the sentence cites Pauling for how he worked, not to compare the two shapes.' }
    ],
    lockIt: 'Function questions about a name: read the sentence it sits in and ask what the name is doing there.',
    hook: null,
    playWith: play('rc-o15'),
    video: VID.function,
    visual: {
      type: 'rc.evidence',
      passage: 'rc-o15',
      focus: '8.2',
      spans: [
        { p: 8, s: 2, quote: 'Following the example of Linus Pauling, who had found the alpha helix of proteins in 1951 by building models', role: 'key' },
        { p: 8, s: 2, quote: 'they guessed the structure first and tested it against the X-ray data afterward', role: 'key', note: 'one method in both marks: build the model first, test it after' },
        { p: 8, s: 5, quote: 'Lawrence Bragg, the laboratory\'s director, ordered the pair to leave DNA to King\'s', role: 'trap', choice: 'explain why Bragg ordered Watson and Crick to stop working on DNA', note: 'the order followed the dropped model, not Pauling' }
      ],
      reuse: REUSE,
      alt: 'Paragraph 8, sentence 2 carries two highlights as the answer: following the example of Linus Pauling, who found the alpha helix by building models, they guessed the structure first and tested it afterward. Sentence 5, Bragg\'s order to leave DNA to King\'s, is marked lighter as the source of a trap.',
      caption: 'Both marks in sentence 2 describe one method: build the model first, test it after. Bragg\'s order has its own cause.'
    },
    demoPick: 'contrast the alpha helix of proteins with the double helix of DNA',
    flags: [PLAY_FLAG, BANK_LABEL('note1')]
  },
  {
    qid: 'rc:rc-o15-q10',
    servesAlso: [],
    section: 'rc',
    subtopic: sub('detail'),
    difficulty: band(2, 'detail with several sources'),
    source: O15('q10', 10),
    keyText: 'the crystal symmetry recorded in Franklin\'s report',
    answer: { line: 'Paragraph 9, sentence 3: from the symmetry of the A form crystals in Franklin\'s report, Crick deduced the chains ran opposite ways.' },
    steps: [
      'Find "opposite directions" in paragraph 9, sentence 3.',
      'Trace "from which" back. It points to the symmetry of the A form crystals, in the report Perutz passed on.',
      'Match each clue to its conclusion. Photo 51 gave the helix, Donohue fixed the bases, equal pair widths let any sequence fit.'
    ],
    choices: [
      { text: 'the X-shaped pattern of dashes in Photo 51', role: 'trap', family: 'rc-contradicted', trap: 'The famous clue', note: 'The X told Watson it was a helix, and paragraph 12 says the photo did not show which way the chains ran.' },
      { text: 'the equal widths of the two kinds of base pair', role: 'trap', family: 'rc-misplaced', note: 'Equal pair widths, sentence 5, explain why any sequence fits between two even backbones. They say nothing about direction.' },
      { text: 'Chargaff\'s finding that adenine always matched thymine', role: 'trap', family: 'rc-misplaced', note: 'Chargaff\'s ratios were explained by the pairing, sentence 6. The model accounted for them; they did not set the direction.' },
      { text: 'Donohue\'s correction of the forms of the bases', role: 'trap', family: 'rc-misplaced', note: 'Donohue fixed the base forms, sentence 4, which led Watson to the pairing. The direction came from the crystal symmetry.' },
      { text: 'the crystal symmetry recorded in Franklin\'s report', role: 'key', note: 'Sentence 3: from which Crick deduced the chains ran in opposite directions.' }
    ],
    lockIt: 'When a paragraph lists several clues, match each clue to the one conclusion it supports.',
    hook: null,
    playWith: play('rc-o15'),
    video: VID.detail,
    visual: {
      type: 'rc.evidence',
      passage: 'rc-o15',
      focus: '9.3',
      spans: [
        { p: 9, s: 3, quote: 'the symmetry of the A form crystals, from which Crick deduced that the two chains ran in opposite directions', role: 'key', note: 'the clue and its conclusion in one line' },
        { p: 12, s: 2, quote: 'it did not say how many chains there were, which way they ran', role: 'trap', choice: 'the X-shaped pattern of dashes in Photo 51', note: 'the photo could not show direction' }
      ],
      reuse: REUSE,
      alt: 'Paragraph 9, sentence 3 is highlighted as the answer: the symmetry of the A form crystals, from which Crick deduced the chains ran in opposite directions. Paragraph 12, sentence 2 is marked as the source of a trap: Photo 51 did not say which way the chains ran.',
      caption: 'Each clue in paragraph 9 proved one thing. Direction came from the crystal symmetry, and paragraph 12 rules out the photo.'
    },
    demoPick: 'the X-shaped pattern of dashes in Photo 51',
    flags: [PLAY_FLAG, BANK_LABEL('note0, note1, note2, note3')]
  },
  {
    qid: 'rc:rc-o15-q11',
    servesAlso: [],
    section: 'rc',
    subtopic: sub('inference'),
    difficulty: band(3, 'inference: a new case run through a stated rule'),
    source: O15('q11', 11),
    keyText: 'conflict with the base pairing in the Watson and Crick model',
    answer: { line: 'If adenine always faces thymine, the two must be equal. Extra adenine would leave some of it with no partner.' },
    steps: [
      'Find the rule first. Paragraph 9, sentence 6: "if adenine always faces thymine, the two must be equally abundant."',
      'Run the new case through it. Noticeably more adenine than thymine means some adenine has no thymine to face.',
      'That breaks the pairing in the Watson and Crick model. Rule first, then the case.'
    ],
    choices: [
      { text: 'have a correspondingly lower proportion of guanine than of cytosine', role: 'trap', family: 'rc-outside', trap: 'Invented a balance', note: 'Nothing ties an adenine surplus to guanine and cytosine. That pairing is separate, and the choice invents a trade-off between the two.' },
      { text: 'confirm the tetranucleotide hypothesis proposed by Levene', role: 'trap', family: 'rc-contradicted', note: 'Levene\'s fixed repeat of four bases means equal amounts of each. Extra adenine cuts against that too, and paragraph 3 already retired the idea.' },
      { text: 'conflict with the base pairing in the Watson and Crick model', role: 'key', note: 'One adenine faces one thymine, so a surplus of adenine has nowhere to go.' },
      { text: 'have a double helix whose diameter is wider than 20 angstroms', role: 'trap', family: 'rc-outside', note: 'Diameter came from Photo 51 and is never tied to base counts. The equal pair widths in paragraph 9 point the other way.' },
      { text: 'support Pauling\'s three-chain structure for the molecule', role: 'trap', family: 'rc-outside', note: 'Pauling\'s model appears only as a flawed three-chain attempt. Nothing links it to base ratios.' }
    ],
    lockIt: 'Inference with a new case: find the passage\'s rule, run the case through it, keep only what follows.',
    hook: null,
    playWith: play('rc-o15'),
    video: VID.inference,
    visual: {
      type: 'rc.evidence',
      passage: 'rc-o15',
      focus: '9.6',
      spans: [
        { p: 9, s: 6, quote: 'if adenine always faces thymine, the two must be equally abundant', role: 'key', note: 'the rule; extra adenine breaks it' },
        { p: 3, s: 4, quote: 'the amount of adenine closely matched the amount of thymine', role: 'context', note: 'the measured match behind the rule' }
      ],
      reuse: REUSE,
      alt: 'Paragraph 9, sentence 6 is highlighted as the answer\'s rule: if adenine always faces thymine, the two must be equally abundant. Paragraph 3, sentence 4 is marked as the line to read with it: Chargaff measured adenine matching thymine.',
      caption: 'The rule in paragraph 9 is the whole tool. A species with extra adenine breaks it.'
    },
    demoPick: 'have a correspondingly lower proportion of guanine than of cytosine',
    flags: [PLAY_FLAG, BANK_LABEL('note1'), { kind: 'note', text: 'The bank types this item inference; the expert read it as application (a new species run through the 9.6 rule). Same proof line. Filed under rc.inference to match the bank type.' }]
  },
  {
    qid: 'rc:rc-o15-q12',
    servesAlso: [],
    section: 'rc',
    subtopic: sub('detail'),
    difficulty: band(1, 'detail'),
    source: O15('q12', 12),
    keyText: 'acknowledged unpublished King\'s results without saying how much had been seen',
    answer: { line: 'Paragraph 10, sentence 3: they acknowledged a general knowledge of unpublished King\'s results and did not say how much they had seen.' },
    steps: [
      'Find the paper: paragraph 10 covers it in three sentences. Three sentences, five claims.',
      'Check each choice against those lines. Sentence 3 matches one almost word for word.',
      'The rest break on a detail: the King\'s papers ran alongside, the bonds joined the bases, about nine hundred words, and a copying mechanism was suggested.'
    ],
    choices: [
      { text: 'acknowledged unpublished King\'s results without saying how much had been seen', role: 'key', note: 'Sentence 3, close to word for word.' },
      { text: 'was published several months before the papers from King\'s College London', role: 'trap', family: 'rc-timeline', note: 'Sentence 1 puts the King\'s papers alongside it, not months later.' },
      { text: 'described two chains held together by bonds between the sugar and phosphate backbones', role: 'trap', family: 'rc-misplaced', note: 'The hydrogen bonds join the paired bases inside, with the backbones on the outside, sentence 2.' },
      { text: 'ran to several thousand words and included Franklin\'s measurements in full', role: 'trap', family: 'rc-misplaced', trap: 'Number swapped', note: 'The paper ran about nine hundred words, and sentence 3 says they never said how much they had seen. Neither half holds.' },
      { text: 'made no mention of any possible mechanism for copying the genetic material', role: 'trap', family: 'rc-contradicted', note: 'Sentence 2 quotes their famous line: the pairing suggested a possible copying mechanism. The paper did mention one.' }
    ],
    lockIt: 'Detail questions about one event: check every choice against the same paragraph, line by line.',
    hook: null,
    playWith: play('rc-o15'),
    video: VID.detail,
    visual: {
      type: 'rc.evidence',
      passage: 'rc-o15',
      focus: '10.3',
      spans: [
        { p: 10, s: 3, quote: 'They acknowledged being stimulated by a general knowledge of unpublished results from King\'s; they did not say how much they had seen', role: 'key' },
        { p: 10, s: 1, quote: 'in about nine hundred words', role: 'trap', choice: 'ran to several thousand words and included Franklin\'s measurements in full' },
        { p: 10, s: 1, quote: 'alongside papers from Wilkins\'s group and from Franklin and Gosling', role: 'trap', choice: 'was published several months before the papers from King\'s College London' },
        { p: 10, s: 2, quote: 'joined by hydrogen bonds between the bases', role: 'trap', choice: 'described two chains held together by bonds between the sugar and phosphate backbones' },
        { p: 10, s: 2, quote: 'the specific pairing immediately suggested a possible copying mechanism for the genetic material', role: 'trap', choice: 'made no mention of any possible mechanism for copying the genetic material' }
      ],
      reuse: REUSE,
      alt: 'Paragraph 10, sentence 3 is highlighted as the answer: they acknowledged unpublished King\'s results and did not say how much they had seen. Sentences 1 and 2 carry four lighter marks, one per trap: about nine hundred words, alongside the King\'s papers, hydrogen bonds between the bases, and the copying mechanism.',
      caption: 'One paragraph checks all five choices. Each lighter mark is the detail a trap changes.'
    },
    demoPick: 'made no mention of any possible mechanism for copying the genetic material',
    flags: [PLAY_FLAG, BANK_LABEL('note2')]
  },
  {
    qid: 'rc:rc-o15-q13',
    servesAlso: [],
    section: 'rc',
    subtopic: sub('inference'),
    difficulty: band(3, 'inference: a stated rule joined to a date'),
    source: O15('q13', 13),
    keyText: 'would have been blocked by the standing rules of the prize itself',
    answer: { line: 'Paragraph 10: no prize goes to anyone who died before being nominated. Franklin died in 1958; the prize came in 1962.' },
    steps: [
      'Find the 1962 prize: paragraph 10, sentence 6 states two rules.',
      'One rule settles it. A prize "is not given to anyone who died before being nominated," and sentence 5 says she died in April 1958.',
      'Join the two. Rule plus date. Whatever the committee wished, the prize\'s own rules stood in the way, so the question "was never put."'
    ],
    choices: [
      { text: 'would have had to remove Wilkins from the list to make room for her', role: 'trap', family: 'rc-half-supported', trap: 'Saw one rule only', note: 'The three-person cap is real, but she had died before nomination, so making room on the list would not have helped.' },
      { text: 'would have been blocked by the standing rules of the prize itself', role: 'key', note: 'Sentence 6 gives the rules; sentence 5 gives the date that trips them.' },
      { text: 'would have needed the consent of Watson and Crick to do so', role: 'trap', family: 'rc-outside', note: 'No one\'s consent appears anywhere. The passage names only the prize\'s own rules.' },
      { text: 'would have waited until her notebooks had been examined by Klug', role: 'trap', family: 'rc-other-paragraph', note: 'Klug\'s reading of her notebooks is in paragraph 11, part of the later debate over credit. It is not a prize rule.' },
      { text: 'would have awarded the prize in chemistry instead of in medicine', role: 'trap', family: 'rc-outside', note: 'The field of the prize never comes up. The rules in sentence 6 apply whatever the field.' }
    ],
    lockIt: 'Inference: join a stated rule to a stated fact, and add nothing the passage does not give you.',
    hook: null,
    playWith: play('rc-o15'),
    video: VID.inference,
    visual: {
      type: 'rc.evidence',
      passage: 'rc-o15',
      focus: '10.6',
      spans: [
        { p: 10, s: 6, quote: 'a prize is shared by at most three people and is not given to anyone who died before being nominated', role: 'key', tag: '1' },
        { p: 10, s: 5, quote: 'She died of ovarian cancer in April 1958', role: 'context', tag: '2' }
      ],
      link: { from: '1', to: '2', label: 'died in 1958, before any 1962 nomination' },
      reuse: REUSE,
      alt: 'Line 1, paragraph 10, sentence 6, is highlighted as the answer: a prize goes to at most three people and is not given to anyone who died before being nominated. A connector joins it to line 2, sentence 5: she died in April 1958.',
      caption: 'Line 1 is the rule, line 2 the date. Together they block any committee, willing or not.'
    },
    demoPick: 'would have had to remove Wilkins from the list to make room for her',
    flags: [PLAY_FLAG, BANK_LABEL('note3')]
  },
  {
    qid: 'rc:rc-o15-q14',
    servesAlso: [],
    section: 'rc',
    subtopic: sub('except'),
    difficulty: band(2, 'EXCEPT'),
    source: O15('q14', 14),
    keyText: 'She shared the 1962 Nobel Prize with Wilkins.',
    answer: { line: 'Paragraph 10 says the 1962 prize went to Watson, Crick and Wilkins. Franklin had died in 1958.' },
    steps: [
      'Flip the job. Four choices are in the passage; you are hunting the one that is not.',
      'Check off two in paragraph 5, sentence 4: a physical chemist trained at Cambridge, three years in Paris.',
      'Check off two in paragraph 10: Birkbeck and viruses, then her death in 1958 at thirty-seven.',
      'The one left standing is the prize. Sentence 6 gives it to Watson, Crick and Wilkins.'
    ],
    choices: [
      { text: 'She trained as a physical chemist at Cambridge.', role: 'stated', family: 'rc-stated', note: 'Paragraph 5, sentence 4: trained as a physical chemist at Cambridge.' },
      { text: 'She spent three years in Paris learning X-ray methods.', role: 'stated', family: 'rc-stated', note: 'Paragraph 5, sentence 4: three years in Paris learning to apply X-ray methods.' },
      { text: 'She moved to Birkbeck College and worked on viruses.', role: 'stated', family: 'rc-stated', note: 'Paragraph 10, sentence 4: she left for Birkbeck and turned to the structure of viruses.' },
      { text: 'She died in 1958 at the age of thirty-seven.', role: 'stated', family: 'rc-stated', note: 'Paragraph 10, sentence 5: April 1958, at the age of thirty-seven.' },
      { text: 'She shared the 1962 Nobel Prize with Wilkins.', role: 'key', note: 'Paragraph 10, sentence 6: the prize went to Watson, Crick and Wilkins. She had died four years before.' }
    ],
    lockIt: 'EXCEPT: check off the four the passage supports. The one left standing is the answer.',
    hook: null,
    playWith: play('rc-o15'),
    video: VID.except,
    visual: {
      type: 'stack',
      focus: '10.6',
      panels: [
        {
          type: 'rc.evidence',
          passage: 'rc-o15',
          spans: [
            { p: 5, s: 4, quote: 'Trained as a physical chemist at Cambridge', role: 'stated', choice: 'She trained as a physical chemist at Cambridge.' },
            { p: 5, s: 4, quote: 'she had spent three years in Paris learning to apply X-ray methods', role: 'stated', choice: 'She spent three years in Paris learning X-ray methods.' }
          ],
          reuse: REUSE
        },
        {
          type: 'rc.evidence',
          passage: 'rc-o15',
          focus: '10.6',
          spans: [
            { p: 10, s: 4, quote: 'left for Birkbeck College in London, where she turned to the structure of viruses', role: 'stated', choice: 'She moved to Birkbeck College and worked on viruses.' },
            { p: 10, s: 5, quote: 'She died of ovarian cancer in April 1958, at the age of thirty-seven.', role: 'stated', choice: 'She died in 1958 at the age of thirty-seven.' },
            { p: 10, s: 6, quote: 'the Nobel Prize in Physiology or Medicine went to Watson, Crick, and Wilkins', role: 'key', choice: 'She shared the 1962 Nobel Prize with Wilkins.' }
          ],
          reuse: REUSE
        }
      ],
      alt: 'Five marks, paragraph 5 above and paragraph 10 below, each tagged with the served letter of its choice. Four check off: Cambridge and Paris, then Birkbeck and viruses, and her death in 1958. Paragraph 10, sentence 6 is highlighted as the answer: the 1962 prize went to Watson, Crick and Wilkins.',
      caption: 'Four choices check off in paragraphs 5 and 10. She died in 1958; the prize sentence names three winners without her.'
    },
    demoPick: 'She died in 1958 at the age of thirty-seven.',
    flags: [PLAY_FLAG]
  },
  {
    qid: 'rc:rc-o15-q15',
    servesAlso: [],
    section: 'rc',
    subtopic: sub('tone'),
    difficulty: band(2, 'tone'),
    source: O15('q15', 15),
    keyText: 'unconvinced',
    answer: { line: 'The author calls the theft story too simple and a disservice to her, then prefers a less satisfying story. That is unconvinced.' },
    steps: [
      'Find the story first: paragraph 11, sentence 2, a photograph stolen and a discovery taken.',
      'Read the author\'s verdict right after it: "That story is too simple, and I think it does her a disservice."',
      'Check the temperature. Calm, but not buying it: no anger, no joke, no shrug.'
    ],
    choices: [
      { text: 'amused', role: 'trap', family: 'rc-tone', note: 'Nothing in paragraphs 11 and 12 is light or joking. The author takes the question of credit seriously.' },
      { text: 'unconvinced', role: 'key', note: 'Too simple, a disservice, and probably not the true story: the author does not accept it.' },
      { text: 'outraged', role: 'trap', family: 'rc-tone', trap: 'The story\'s own anger', note: 'Outrage is the feeling of the theft story itself. The author steps back from that story and calls it too simple.' },
      { text: 'uninterested', role: 'trap', family: 'rc-tone', note: 'Two full paragraphs on the question of credit is engagement, not indifference.' },
      { text: 'approving', role: 'trap', family: 'read-backward', note: 'Too simple and a disservice is a rejection, so approving runs the author\'s verdict backward.' }
    ],
    lockIt: 'Tone questions: find the author\'s own judging words, then match their strength, not the topic\'s mood.',
    hook: null,
    playWith: play('rc-o15'),
    video: VID.tone,
    visual: {
      type: 'rc.evidence',
      passage: 'rc-o15',
      focus: '11.3',
      spans: [
        { p: 11, s: 2, quote: 'a story took shape in which Franklin\'s photograph was stolen and her discovery taken from her', role: 'context', note: 'the story being judged' },
        { p: 11, s: 3, quote: 'That story is too simple, and I think it does her a disservice', role: 'key', note: 'the author\'s own verdict' },
        { p: 12, s: 5, quote: 'That is a less satisfying story than a theft or a triumph, but I suspect it is the true one', role: 'key', note: 'the story the author prefers' }
      ],
      reuse: REUSE,
      alt: 'Three lines. Paragraph 11, sentence 2 is marked as the story being judged: a photograph stolen and a discovery taken. Sentence 3 and paragraph 12, sentence 5 are highlighted as the answer: the story is too simple and a disservice, and the less satisfying story is probably the true one.',
      caption: 'Skip the story\'s feelings. Read the author\'s own verdict on it, in the two highlighted lines.'
    },
    demoPick: 'outraged',
    flags: [PLAY_FLAG, BANK_LABEL('note0'), WRONG_IN_PASSAGE]
  },
  {
    qid: 'rc:rc-o15-q16',
    servesAlso: [],
    section: 'rc',
    subtopic: sub('application'),
    difficulty: band(3, 'application'),
    source: O15('q16', 16),
    keyText: 'A search team finds a wreck where a careful sonar survey and a historian\'s bold guess overlap',
    answer: { line: 'Paragraph 12: the double helix came where patient measurement met bold guessing, and neither would have finished alone. The wreck has both.' },
    steps: [
      'Name the principle before reading the choices. Paragraph 12, sentence 4: two methods, patient measurement and bold guessing, neither enough alone.',
      'Look for the case that needs both at once. A careful survey and a bold guess meeting is that case.',
      'Cross off the halves. Measurement alone and guessing alone each leave the job unfinished.'
    ],
    choices: [
      { text: 'A detective solves a case from a single photograph that happens to show the culprit\'s face clearly', role: 'trap', family: 'read-backward', trap: 'One image settles all', note: 'Paragraph 12 opens on how little a single image could settle. This case runs the principle backward.' },
      { text: 'Two rival laboratories race toward the same result, and only the faster one is remembered', role: 'trap', family: 'rc-other-paragraph', note: 'A race for credit echoes the debate in paragraphs 10 and 11, not the two methods meeting in paragraph 12.' },
      { text: 'A surveyor refuses to publish a map until every hill has been measured twice', role: 'trap', family: 'rc-half-supported', trap: 'Measurement alone', note: 'Measurement alone is only half the principle. Paragraph 12 says patient measurement would not have finished the job alone.' },
      { text: 'A search team finds a wreck where a careful sonar survey and a historian\'s bold guess overlap', role: 'key', note: 'Careful survey plus bold guess, and the find comes where they meet.' },
      { text: 'A theorist\'s guess about a planet\'s orbit is accepted without any measurement', role: 'trap', family: 'rc-half-supported', trap: 'Guessing alone', note: 'Guessing with no measurement is only the other half. The passage says bold guessing alone would not finish the job either.' }
    ],
    lockIt: 'Application: say the passage\'s principle in your own words first, then find the case built the same way.',
    hook: null,
    playWith: play('rc-o15'),
    video: VID.application,
    visual: {
      type: 'rc.evidence',
      passage: 'rc-o15',
      focus: '12.4',
      spans: [
        { p: 12, s: 4, quote: 'the meeting point of two methods, the patient measurement that Franklin practiced and the bold guessing that she distrusted, and neither would have finished the job alone', role: 'key', note: 'the principle: two methods meet, neither enough alone' },
        { p: 12, s: 1, quote: 'how little a single image could settle', role: 'trap', choice: 'A detective solves a case from a single photograph that happens to show the culprit\'s face clearly', note: 'the line the single-photograph case runs against' }
      ],
      reuse: REUSE,
      alt: 'Paragraph 12, sentence 4 is highlighted as the principle: the double helix was the meeting point of patient measurement and bold guessing, and neither would have finished alone. Sentence 1 is marked as the source of a trap: how little a single image could settle.',
      caption: 'The highlighted line is the principle to carry over: two methods meet, and neither is enough alone.'
    },
    demoPick: 'A surveyor refuses to publish a map until every hill has been measured twice',
    flags: [PLAY_FLAG, BANK_LABEL('note1'), WRONG_IN_PASSAGE]
  },
  {
    qid: 'rc:rc-o15-q17',
    servesAlso: [],
    section: 'rc',
    subtopic: sub('mainidea'),
    difficulty: band(2, 'main idea'),
    source: O15('q17', 17),
    keyText: 'The structure of DNA emerged from several people\'s evidence and from two methods that each needed the other',
    answer: { line: 'Paragraph 1 says the model rested on other people\'s measurements; paragraph 12 names them and says two methods needed each other.' },
    steps: [
      'Read the frame and the close. Paragraph 1 sets up the question; paragraph 12 answers it.',
      'The frame: the model "rested on measurements made by other people."',
      'The close: answers from Franklin\'s report, Chargaff\'s ratios and Donohue\'s chemistry, then two methods, neither enough alone. Pick both halves.'
    ],
    choices: [
      { text: 'Watson and Crick deserve sole credit for the double helix because they alone were willing to build and test models', role: 'trap', family: 'rc-too-strong', trap: 'Sole credit', note: 'Sole credit goes too far: paragraph 1 says their model rested on other people\'s measurements.' },
      { text: 'Rosalind Franklin solved the structure of DNA on her own, and her photograph was simply stolen by her Cambridge rivals', role: 'trap', family: 'rc-contradicted', note: 'This is the theft story paragraph 11 calls too simple. Klug judged her close to the full structure, not finished.' },
      { text: 'The structure of DNA emerged from several people\'s evidence and from two methods that each needed the other', role: 'key', note: 'Many hands from paragraph 1, two methods from paragraph 12.' },
      { text: 'X-ray diffraction alone settled the shape of DNA once the technique had been perfected at King\'s', role: 'trap', family: 'rc-contradicted', note: 'Paragraph 12 opens on how little a single image could settle. Chemistry and model building were needed too.' },
      { text: 'The Nobel committee of 1962 wronged Franklin by applying its rules too strictly to a case that deserved an exception', role: 'trap', family: 'rc-outside', trap: 'Blame never assigned', note: 'The author states the prize rules without blaming anyone. And one paragraph\'s detail cannot be the main idea of the whole passage.' }
    ],
    lockIt: 'Main idea: read the first paragraph\'s frame and the last paragraph\'s answer. The choice must hold both.',
    hook: null,
    playWith: play('rc-o15'),
    video: VID.mainidea,
    visual: {
      type: 'rc.evidence',
      passage: 'rc-o15',
      focus: '12.4',
      spans: [
        { p: 1, s: 4, quote: 'But the model rested on measurements made by other people', role: 'key' },
        { p: 12, s: 3, quote: 'Those answers came from the symmetry in Franklin\'s crystallographic report, from Chargaff\'s ratios, from Donohue\'s chemistry', role: 'key' },
        { p: 12, s: 4, quote: 'neither would have finished the job alone', role: 'key' }
      ],
      reuse: REUSE,
      alt: 'Three highlighted lines make the main idea. Paragraph 1, sentence 4: the model rested on measurements made by other people; paragraph 12, sentences 3 and 4: the answers came from Franklin\'s report, Chargaff\'s ratios and Donohue\'s chemistry, and neither method would have finished the job alone.',
      caption: 'The opening frame and the closing two lines say the same thing: many hands, two methods.'
    },
    demoPick: 'Rosalind Franklin solved the structure of DNA on her own, and her photograph was simply stolen by her Cambridge rivals',
    flags: [PLAY_FLAG, WRONG_IN_PASSAGE, { kind: 'bank-copy', text: 'The last choice says the committee "wronged" Franklin. It is bank text (exempt); the explainer\'s note on it never repeats the word.' }]
  },

  /* ============== Passage 2: rc-p10, The Trade Beneath the Forest Floor ============== */
  {
    qid: 'rc:rc-p10-q01',
    servesAlso: [],
    section: 'rc',
    subtopic: sub('detail'),
    difficulty: band(1, 'detail'),
    source: P10('q01', 18),
    keyText: 'folds its membrane inward around every fungal branch',
    answer: { line: 'Paragraph 3 says the plant cell does not simply give way: its own membrane stretches inward around every branch.' },
    steps: [
      'Find the arbuscule: paragraph 3, sentences 2 to 5.',
      'Read what the plant cell does. The cell does not give way; its membrane stretches inward around every branch.',
      'That keeps two membranes between them. The fungus gets inside the wall, never into the cytoplasm.'
    ],
    choices: [
      { text: 'dissolves its own wall so the two organisms can mix freely', role: 'trap', family: 'rc-contradicted', note: 'The fungus breaches the wall, but sentence 5 says the two never share cytoplasm. Nothing mixes freely.' },
      { text: 'wraps the fungus in a dense sheath of its own tissue', role: 'trap', family: 'rc-other-paragraph', trap: 'The mantle, moved', note: 'A dense sheath is the mantle from paragraph 4: fungal tissue around a root tip, not plant tissue around the fungus.' },
      { text: 'folds its membrane inward around every fungal branch', role: 'key', note: 'Sentence 5: its own membrane stretches inward around every branch.' },
      { text: 'fills with stored lipid that the fungus later draws on', role: 'trap', family: 'rc-misplaced', note: 'Lipid is stored in vesicles, sentence 6, which are swollen fungal hyphae. The plant cell is not the store.' },
      { text: 'dies off, leaving a cavity that the fungus then occupies', role: 'trap', family: 'rc-contradicted', note: 'Sentence 4 says the plant cell does not simply give way. A dead cell could not stretch its membrane around the branches.' }
    ],
    lockIt: 'Detail questions with several structures: tie each action to the structure the passage gives it.',
    hook: null,
    playWith: play('rc-p10'),
    video: VID.detail,
    visual: {
      type: 'rc.evidence',
      passage: 'rc-p10',
      focus: '3.5',
      spans: [
        { p: 3, s: 4, quote: 'The plant cell does not simply give way', role: 'key' },
        { p: 3, s: 5, quote: 'Its own membrane stretches inward around every branch', role: 'key' },
        { p: 3, s: 6, quote: 'Other hyphae swell into vesicles that store lipid', role: 'trap', choice: 'fills with stored lipid that the fungus later draws on' },
        { p: 4, s: 2, quote: 'sheathes the root tip in a dense mantle of hyphae', role: 'trap', choice: 'wraps the fungus in a dense sheath of its own tissue', note: 'the mantle, from the other partnership' }
      ],
      reuse: REUSE,
      alt: 'Paragraph 3, sentences 4 and 5 are highlighted as the answer: the plant cell does not simply give way, and its own membrane stretches inward around every branch. Lighter marks show where two traps come from: lipid vesicles in sentence 6 and the dense mantle in paragraph 4.',
      caption: 'Two highlighted lines say what the plant cell does. The lighter marks belong to other structures.'
    },
    demoPick: 'wraps the fungus in a dense sheath of its own tissue',
    flags: [PLAY_FLAG]
  },
  {
    qid: 'rc:rc-p10-q02',
    servesAlso: [],
    section: 'rc',
    subtopic: sub('detail'),
    difficulty: band(1, 'detail'),
    source: P10('q02', 19),
    keyText: 'a lattice of flattened hyphae between the outer root cells',
    answer: { line: 'Paragraph 4 names it: the fungus pushes a lattice of flattened hyphae between the outer root cells, and that lattice is the Hartig net.' },
    steps: [
      'Find the name: "That lattice is the Hartig net." Paragraph 4, sentence 3.',
      'Trace the word lattice back one sentence. Name, then trace back. Sentence 2 says it is flattened hyphae pushed between the outer root cells.',
      'Keep the neighbors apart. The mantle is the sheath outside, the arbuscule grows inside a cell, vesicles store lipid.'
    ],
    choices: [
      { text: 'a lattice of flattened hyphae between the outer root cells', role: 'key', note: 'Sentences 2 and 3: the lattice between the outer root cells is the Hartig net.' },
      { text: 'a strand of hyphae running from a root tip out into open soil', role: 'trap', family: 'rc-other-paragraph', note: 'Hyphae reaching past the depleted shell into soil are paragraph 5. The passage never calls that reach the Hartig net.' },
      { text: 'a dense fungal sheath covering the outside of a short root tip', role: 'trap', family: 'rc-misplaced', trap: 'The mantle, renamed', note: 'That is the mantle, named in the same sentence just before the lattice. Same sentence, other structure.' },
      { text: 'a swollen hypha that stores lipid on behalf of the fungus', role: 'trap', family: 'rc-other-paragraph', note: 'Swollen lipid-storing hyphae are the vesicles of arbuscular fungi, paragraph 3.' },
      { text: 'a branched fungal organ that grows inside a cortex cell', role: 'trap', family: 'rc-other-paragraph', note: 'A branched organ inside a cortex cell is the arbuscule, paragraph 3. Paragraph 4 opens by saying an ectomycorrhiza never enters a living cell.' }
    ],
    lockIt: 'Definition details: when a name points back with this or that, read the sentence before it.',
    hook: null,
    playWith: play('rc-p10'),
    video: VID.detail,
    visual: {
      type: 'rc.evidence',
      passage: 'rc-p10',
      focus: '4.3',
      spans: [
        { p: 4, s: 3, quote: 'That lattice is the Hartig net', role: 'key', tag: '1' },
        { p: 4, s: 2, quote: 'pushes a lattice of flattened hyphae between the outer root cells', role: 'key', tag: '2' },
        { p: 4, s: 2, quote: 'sheathes the root tip in a dense mantle of hyphae', role: 'trap', choice: 'a dense fungal sheath covering the outside of a short root tip', note: 'the mantle: the same sentence, a different structure' }
      ],
      link: { from: '1', to: '2', label: 'that lattice = flattened hyphae between root cells' },
      reuse: REUSE,
      alt: 'Line 1, paragraph 4, sentence 3, names the Hartig net, and a connector joins it to line 2, sentence 2: a lattice of flattened hyphae between the outer root cells. In the same sentence a lighter mark shows the dense mantle, where one trap comes from.',
      caption: 'Line 1 names it; line 2 says what that lattice is. The mantle in the same sentence is a different structure.'
    },
    demoPick: 'a dense fungal sheath covering the outside of a short root tip',
    flags: [PLAY_FLAG]
  },
  {
    qid: 'rc:rc-p10-q03',
    servesAlso: [],
    section: 'rc',
    subtopic: sub('detail'),
    difficulty: band(1, 'detail: a number lookup'),
    source: P10('q03', 20),
    keyText: '2 to 10 micrometres',
    answer: { line: 'Paragraph 5, sentence 5: a fungal hypha is two to ten micrometres across. Each number in that paragraph belongs to its own noun.' },
    steps: [
      'Find the noun first: hypha, paragraph 5, sentence 5. It gives two to ten micrometres.',
      'Keep the neighbors apart. A fine root is 200 to 500 micrometres, a root hair 10 to 20, the depletion zone a millimetre or two.',
      'Notice the order: root, root hair, hypha, each smaller. That size gap is the paragraph\'s point.'
    ],
    choices: [
      { text: '20 to 100 micrometres', role: 'trap', family: 'rc-outside', note: 'No structure in paragraph 5 is given this width. It sits between the root hair and the fine root, so it feels plausible.' },
      { text: '10 to 20 micrometres', role: 'trap', family: 'rc-misplaced', trap: 'The root hair', note: 'Ten to twenty micrometres is the root hair, one sentence earlier. Right paragraph, other noun.' },
      { text: '2 to 10 micrometres', role: 'key', note: 'Sentence 5: two to ten micrometres across.' },
      { text: '1 to 2 millimetres', role: 'trap', family: 'rc-misplaced', note: 'A millimetre or two is the depletion zone around a root, sentence 3. It is a distance in soil, not a width.' },
      { text: '200 to 500 micrometres', role: 'trap', family: 'rc-misplaced', note: 'Two to five hundred micrometres, written 200 to 500, is the fine root in sentence 4.' }
    ],
    lockIt: 'Number lookups: find the noun first, then take the number in its own clause.',
    hook: null,
    playWith: play('rc-p10'),
    video: VID.detail,
    visual: {
      type: 'rc.evidence',
      passage: 'rc-p10',
      focus: '5.5',
      spans: [
        { p: 5, s: 5, quote: 'A fungal hypha is two to ten micrometres across', role: 'key', note: 'the hypha\'s own number' },
        { p: 5, s: 4, quote: 'A fine root is perhaps two to five hundred micrometres across', role: 'trap', choice: '200 to 500 micrometres', note: 'two to five hundred means 200 to 500' },
        { p: 5, s: 4, quote: 'a root hair ten to twenty', role: 'trap', choice: '10 to 20 micrometres' },
        { p: 5, s: 3, quote: 'a root strips the millimetre or two around itself', role: 'trap', choice: '1 to 2 millimetres', note: 'a zone of soil, not a width' }
      ],
      reuse: REUSE,
      alt: 'Paragraph 5, sentence 5 is highlighted as the answer: a fungal hypha is two to ten micrometres across. Lighter marks show the neighboring numbers traps borrow: the fine root at two to five hundred and the root hair at ten to twenty in sentence 4, and the millimetre or two in sentence 3.',
      caption: 'Four numbers in three sentences. Each mark ties one number to its own noun.'
    },
    demoPick: '10 to 20 micrometres',
    flags: [PLAY_FLAG, { kind: 'note', text: 'Weak distractor: "20 to 100 micrometres" matches no structure in the passage, so it has no real pull (the bank and the expert say the same). Concept-first rule: a candidate for a sharper distractor in a later revision. Key unchanged.' }]
  },
  {
    qid: 'rc:rc-p10-q04',
    servesAlso: [],
    section: 'rc',
    subtopic: sub('detail'),
    difficulty: band(1, 'detail'),
    source: P10('q04', 21),
    keyText: 'release enzymes that break down protein in leaf litter',
    answer: { line: 'Paragraph 6, sentence 3: many ectomycorrhizal fungi secrete enzymes that break down protein in leaf litter, freeing nitrogen locked in dead tissue.' },
    steps: [
      'Find ectomycorrhizal next to nitrogen: paragraph 6, sentence 3.',
      'Read the means in the same sentence. Enzymes do the unlocking: they break down protein in leaf litter.',
      'Note the contrast that follows. Arbuscular fungi rely on nitrogen already freed into the soil.'
    ],
    choices: [
      { text: 'release enzymes that break down protein in leaf litter', role: 'key', note: 'Sentence 3, nearly word for word: secrete enzymes that break down protein in leaf litter.' },
      { text: 'capture nitrogen from air trapped inside the root mantle', role: 'trap', family: 'rc-outside', note: 'Nitrogen from air never comes up. That is outside knowledge about other partnerships.' },
      { text: 'take up ammonium faster than a root hair can take it up', role: 'trap', family: 'rc-outside', note: 'Ammonium is named in sentence 2, but no speed comparison with root hairs appears.' },
      { text: 'move nitrogen along the hypha as chains of polyphosphate', role: 'trap', family: 'rc-misplaced', trap: 'Phosphate\'s ride', note: 'Polyphosphate chains carry phosphate, sentence 1, not nitrogen. The choice puts nitrogen on phosphate\'s transport.' },
      { text: 'trade nitrogen with arbuscular fungi on neighbouring roots', role: 'trap', family: 'rc-outside', note: 'The two fungal types are contrasted in sentence 3, never shown trading.' }
    ],
    lockIt: 'How and why details: the means usually sits in the same sentence as the result.',
    hook: null,
    playWith: play('rc-p10'),
    video: VID.detail,
    visual: {
      type: 'rc.evidence',
      passage: 'rc-p10',
      focus: '6.3',
      spans: [
        { p: 6, s: 3, quote: 'secrete enzymes that break down protein in leaf litter, which lets their trees tap nitrogen locked inside dead tissue', role: 'key', note: 'the means: enzymes on dead protein' },
        { p: 6, s: 1, quote: 'strung into chains called polyphosphate', role: 'trap', choice: 'move nitrogen along the hypha as chains of polyphosphate', note: 'how phosphate travels' },
        { p: 6, s: 2, quote: 'as ammonium and as amino acids', role: 'trap', choice: 'take up ammonium faster than a root hair can take it up', note: 'the form nitrogen travels in, not how it is freed' }
      ],
      reuse: REUSE,
      alt: 'Paragraph 6, sentence 3 is highlighted as the answer: many ectomycorrhizal fungi secrete enzymes that break down protein in leaf litter. Lighter marks show where two traps come from: polyphosphate chains in sentence 1, how phosphate travels, and ammonium in sentence 2, the form nitrogen travels in.',
      caption: 'The highlighted line is the means: enzymes on dead protein. The lighter marks say how cargo travels, not how nitrogen is unlocked.'
    },
    demoPick: 'move nitrogen along the hypha as chains of polyphosphate',
    flags: [PLAY_FLAG]
  },
  {
    qid: 'rc:rc-p10-q05',
    servesAlso: [],
    section: 'rc',
    subtopic: sub('detail'),
    difficulty: band(2, 'detail: a stated cause'),
    source: P10('q05', 22),
    keyText: 'cannot make fatty acids and must be handed them',
    answer: { line: 'Paragraph 7: arbuscular fungi cannot make their own fatty acids and must be handed them by a host. That is largely why.' },
    steps: [
      'Find the plate: paragraph 7, sentence 4.',
      'Read the start of that sentence. They "cannot manufacture their own fatty acids and must be handed them by a host."',
      'The word which ties that gap to the plate result. The gap is making, not storing.'
    ],
    choices: [
      { text: 'can store lipid only while it is attached to a living root', role: 'trap', family: 'rc-misplaced', trap: 'Storing, not making', note: 'Vesicles store lipid, paragraph 3, but storage is not the problem. The gap is making fatty acids at all.' },
      { text: 'loses the ability to take up phosphate when no root is present', role: 'trap', family: 'rc-outside', note: 'Nothing ties phosphate uptake to a root being present.' },
      { text: 'needs a mantle of root tissue in order to produce its spores', role: 'trap', family: 'rc-misplaced', note: 'A mantle belongs to the other partnership, paragraph 4, and it is fungal tissue, not root tissue. Spores appear only in paragraph 13.' },
      { text: 'cannot make fatty acids and must be handed them', role: 'key', note: 'Sentence 4: cannot manufacture their own fatty acids and must be handed them by a host.' },
      { text: 'depends on carbon dioxide that living roots release into soil', role: 'trap', family: 'rc-other-paragraph', note: 'Respired carbon dioxide is in paragraph 12, as a route a label can take. It is never something a fungus must be fed.' }
    ],
    lockIt: 'Cause questions: find the result, then follow the word that links it back to its cause.',
    hook: null,
    playWith: play('rc-p10'),
    video: VID.detail,
    visual: {
      type: 'rc.evidence',
      passage: 'rc-p10',
      focus: '7.4',
      spans: [
        { p: 7, s: 4, quote: 'cannot manufacture their own fatty acids and must be handed them by a host', role: 'key', note: 'the cause' },
        { p: 7, s: 4, quote: 'which is largely why no one could grow one to completion on a plate without a plant until a fatty acid was supplied directly', role: 'key', note: 'the plate result, tied on by which' },
        { p: 3, s: 6, quote: 'Other hyphae swell into vesicles that store lipid', role: 'trap', choice: 'can store lipid only while it is attached to a living root', note: 'storing lipid, a different job' }
      ],
      reuse: REUSE,
      alt: 'Paragraph 7, sentence 4 carries two highlights: arbuscular fungi cannot manufacture their own fatty acids and must be handed them, which is largely why none grew on a plate until a fatty acid was supplied. Paragraph 3, sentence 6, lipid-storing vesicles, is marked lighter as a trap\'s source.',
      caption: 'The cause and the plate result sit in one sentence, joined by which. Storing lipid is a different job.'
    },
    demoPick: 'can store lipid only while it is attached to a living root',
    flags: [PLAY_FLAG, { kind: 'note', text: 'The passage says "largely why"; the answer line keeps the claim that strong and no stronger (expert note).' }]
  },
  {
    qid: 'rc:rc-p10-q06',
    servesAlso: [],
    section: 'rc',
    subtopic: sub('vocab'),
    difficulty: band(1, 'vocabulary in context'),
    source: P10('q06', 23),
    keyText: 'a secure physical hold',
    answer: { line: 'The hypha finds purchase in pores too narrow for a root hair to enter. In a pore, purchase means a grip.' },
    steps: [
      'Read the word\'s own sentence: the hypha "finds purchase in pores far too narrow for a root hair to enter."',
      'Put each choice in the slot. In a pore, think grip. Only a hold makes sense there.',
      'Do not let the trade story pull you. The passage talks money elsewhere; this sentence is about size and reach.'
    ],
    choices: [
      { text: 'a payment made for a service', role: 'trap', family: 'rc-misplaced', trap: 'The money sense', note: 'The passage talks about paying in carbon, but a hypha does not pay a pore.' },
      { text: 'a claim on a shared resource', role: 'trap', family: 'rc-misplaced', trap: 'Borrowed the trade theme', note: 'A claim fits the trade story elsewhere in the passage, not a hypha wedged into a pore.' },
      { text: 'an advantage won by bargaining', role: 'trap', family: 'rc-misplaced', trap: 'Bargaining, not grip', note: 'Bargaining belongs to the partnership as a whole, not to a sentence about which openings a hypha can reach.' },
      { text: 'something acquired by buying', role: 'trap', family: 'rc-misplaced', trap: 'The dictionary sense', note: 'Buying is the first sense, and sentence 6 says hyphae buy surface. But purchase sits in sentence 5, about getting into pores.' },
      { text: 'a secure physical hold', role: 'key', note: 'A hypha gets a hold in pores a root hair cannot enter.' }
    ],
    lockIt: 'Vocabulary in context: put each choice in the word\'s own sentence; keep the one that fits that sentence.',
    hook: null,
    playWith: play('rc-p10'),
    video: VID.vocab,
    visual: {
      type: 'rc.evidence',
      passage: 'rc-p10',
      focus: '5.5',
      spans: [
        { p: 5, s: 5, quote: 'finds purchase in pores far too narrow for a root hair to enter', role: 'key', note: 'the word, inside a pore: a grip' },
        { p: 5, s: 6, quote: 'Per unit of carbon spent, hyphae buy far more absorbing surface than roots do', role: 'trap', choice: 'something acquired by buying', note: 'the money language one sentence later' }
      ],
      reuse: REUSE,
      alt: 'Paragraph 5, sentence 5 is highlighted as the answer\'s place: a hypha finds purchase in pores far too narrow for a root hair to enter. Sentence 6 is marked lighter as the source of a trap: hyphae buy more absorbing surface per unit of carbon.',
      caption: 'Purchase sits in a sentence about fitting into pores. The buying language one line later is the trap.'
    },
    demoPick: 'something acquired by buying',
    flags: [PLAY_FLAG, { kind: 'note', text: 'Weak distractors: "a claim on a shared resource" and "an advantage won by bargaining" pull only through the passage\'s trade theme, not through any sense of "purchase" (expert note). Key unchanged.' }]
  },
  {
    qid: 'rc:rc-p10-q07',
    servesAlso: [],
    section: 'rc',
    subtopic: sub('vocab'),
    difficulty: band(1, 'vocabulary in context'),
    source: P10('q07', 24),
    keyText: 'a destination that draws supply in',
    answer: { line: 'Paragraph 8: sugar made in the leaves is drawn down to the colonised root. A sink is where supply is pulled to.' },
    steps: [
      'Read the word\'s own sentence. The root system is "a powerful sink, and sugar made up in the leaves is drawn down to it."',
      'Drawn down to it tells you the sink pulls. A sink pulls supply in.',
      'Check the extras in each choice. Lost, decline, soil and unwanted each add a meaning the sentence lacks.'
    ],
    choices: [
      { text: 'a basin into which a liquid drains away and is lost', role: 'trap', family: 'rc-half-supported', trap: 'Drains, but not lost', note: 'Draining fits the flow, but lost does not: the sugar pays fungal partners that send nutrients back.' },
      { text: 'a steady decline in value over a long period', role: 'trap', family: 'rc-misplaced', note: 'That is the sinking-value sense, and nothing in paragraph 8 loses value. Sugar is being pulled to the root.' },
      { text: 'a destination that draws supply in', role: 'key', note: 'Sugar made in the leaves is drawn down to it.' },
      { text: 'a slow settling downward through soil', role: 'trap', family: 'rc-misplaced', trap: 'Took drawn down literally', note: 'This reads drawn down as sinking through soil, but the flow runs inside the plant, from leaves to roots.' },
      { text: 'a place where unwanted material collects', role: 'trap', family: 'rc-tone', note: 'Unwanted adds a judgment the passage never makes. The sugar is the tree\'s payment in a trade, not waste.' }
    ],
    lockIt: 'Vocabulary in context: let the rest of the sentence define the word, then drop choices that add meaning.',
    hook: null,
    playWith: play('rc-p10'),
    video: VID.vocab,
    visual: {
      type: 'rc.evidence',
      passage: 'rc-p10',
      focus: '8.4',
      spans: [
        { p: 8, s: 4, quote: 'A colonised root system is a powerful sink, and sugar made up in the leaves is drawn down to it', role: 'key', note: 'the meaning: the place supply is pulled to' },
        { p: 8, s: 2, quote: 'the share of a plant\'s photosynthetic output that ends up in fungal partners', role: 'context', note: 'where the sugar goes: to partners, not away' }
      ],
      reuse: REUSE,
      alt: 'Paragraph 8, sentence 4 is highlighted as the answer\'s place: the colonised root system is a powerful sink, and sugar made in the leaves is drawn down to it. Sentence 2 is marked as the line to read with it: part of the plant\'s output ends up in fungal partners.',
      caption: 'Drawn down to it is the clue. A sink is the place that pulls supply toward itself.'
    },
    demoPick: 'a basin into which a liquid drains away and is lost',
    flags: [PLAY_FLAG]
  },
  {
    qid: 'rc:rc-p10-q08',
    servesAlso: [],
    section: 'rc',
    subtopic: sub('inference'),
    difficulty: band(3, 'inference about evidence'),
    source: P10('q08', 25),
    keyText: 'a root carries fungal tissue that may hold the tag itself',
    answer: { line: 'Much of the tag found in a receiving root sits in hyphae wrapped around and through it: fungal tissue, not plant tissue.' },
    steps: [
      'Find the caution: paragraph 11, sentence 1, "a tag in a neighbour is not automatically carbon in a neighbour."',
      'Read the reason in sentence 2. Whose tissue holds the tag? Much of it sits in hyphae wrapped around and through the root.',
      'Join it to sentence 3. A stem or leaf has no such wrapping, so a tag there is the stricter test.'
    ],
    choices: [
      { text: 'a root carries fungal tissue that may hold the tag itself', role: 'key', note: 'Sentence 2: what the instruments detect in a root may be fungal tissue, not plant tissue.' },
      { text: 'the tag breaks down before it can travel up into a shoot', role: 'trap', family: 'rc-outside', note: 'Nothing says the tag breaks down. Paragraph 9 says instruments detect it at very low concentrations.' },
      { text: 'the fungus strips the tag out of a root before it is harvested', role: 'trap', family: 'read-backward', note: 'The fungus holds the tag in the root, which inflates the reading. Stripping it out runs the problem the other way.' },
      { text: 'leaves are the only tissue instruments can measure accurately', role: 'trap', family: 'rc-too-strong', note: 'Only tissue goes too far: leaves are the stricter test because no fungus wraps them, not because instruments read nothing else.' },
      { text: 'a root holds far less carbon overall than a leaf holds', role: 'trap', family: 'rc-outside', note: 'Root and leaf carbon totals are never compared. And a total would not tell you whose tissue the tag is in.' }
    ],
    lockIt: 'Evidence inferences: ask what else could explain the finding. The stricter test rules that out.',
    hook: null,
    playWith: play('rc-p10'),
    video: VID.inference,
    visual: {
      type: 'rc.evidence',
      passage: 'rc-p10',
      focus: '11.2',
      spans: [
        { p: 11, s: 2, quote: 'Much of what the instruments detect sits in hyphae wrapped around and threaded through the receiving root, which is fungal tissue, not plant tissue', role: 'key', tag: '1' },
        { p: 11, s: 3, quote: 'The stricter tests look for the tag above ground, in stem and leaves', role: 'key', tag: '2' }
      ],
      link: { from: '1', to: '2', label: 'fungus in the root, so test the leaves' },
      reuse: REUSE,
      alt: 'Line 1, paragraph 11, sentence 2, is highlighted: much of the tag sits in hyphae wrapped around and through the receiving root, fungal tissue, not plant tissue. A connector joins it to line 2, sentence 3: the stricter tests look for the tag in stem and leaves.',
      caption: 'Line 1 is the problem with roots, line 2 the fix. Leaves carry no fungal wrapping.'
    },
    demoPick: 'the fungus strips the tag out of a root before it is harvested',
    flags: [PLAY_FLAG]
  },
  {
    qid: 'rc:rc-p10-q09',
    servesAlso: [],
    section: 'rc',
    subtopic: sub('inference'),
    difficulty: band(2, 'inference from an example'),
    source: P10('q09', 26),
    keyText: 'A plant can take from a network without giving back',
    answer: { line: 'Ghost pipe makes no sugar and lives on carbon from fungi joined to trees. Paragraph 15 adds: these plants return nothing.' },
    steps: [
      'Find the example: paragraph 15. The author says it proves two things: "It also cuts the other way."',
      'First, carbon can cross a fungus into another plant. Second, these plants return nothing.',
      'Match the second point. A plant that takes and never gives back is what the example most strongly supports.'
    ],
    choices: [
      { text: 'Chlorophyll turns out to be unnecessary for the majority of land plants', role: 'trap', family: 'rc-too-strong', note: 'Ghost pipe and a number of orchids are one small group, sentence 2. Nothing stretches that to most land plants.' },
      { text: 'Fungi favour hosts that have given up photosynthesis', role: 'trap', family: 'rc-outside', note: 'No fungal preference is described. The same fungi are attached to photosynthetic trees at the same time.' },
      { text: 'Trees raise their sugar output when a network drains carbon from them', role: 'trap', family: 'rc-outside', note: 'Trees raising their output never comes up. This invents a response the passage does not describe.' },
      { text: 'A plant can take from a network without giving back', role: 'key', note: 'Sentence 5: these plants return nothing.' },
      { text: 'Most plants in a forest obtain their carbon from other plants', role: 'trap', family: 'rc-too-strong', note: 'One unusual group cannot carry a claim about most plants. The forest trees in the passage make their own sugar.' }
    ],
    lockIt: 'Examples in a passage: ask what the author says the example shows, and how far it reaches.',
    hook: null,
    playWith: play('rc-p10'),
    video: VID.inference,
    visual: {
      type: 'rc.evidence',
      passage: 'rc-p10',
      focus: '15.5',
      spans: [
        { p: 15, s: 2, quote: 'Ghost pipe and a number of orchids carry no usable chlorophyll and make no sugar at all', role: 'trap', choice: 'Chlorophyll turns out to be unnecessary for the majority of land plants', note: 'one named group, not most plants' },
        { p: 15, s: 5, quote: 'These plants return nothing', role: 'key' },
        { p: 15, s: 6, quote: 'The route says nothing about generosity at either end', role: 'key', note: 'the half that cuts the other way' }
      ],
      reuse: REUSE,
      alt: 'Paragraph 15, sentences 5 and 6 are highlighted as the answer: these plants return nothing, and the route says nothing about generosity at either end. Sentence 2 is marked lighter as a trap\'s source: only ghost pipe and some orchids lack usable chlorophyll.',
      caption: 'The highlighted lines are the half of the example that cuts the other way: taking with no return.'
    },
    demoPick: 'Most plants in a forest obtain their carbon from other plants',
    flags: [PLAY_FLAG]
  },
  {
    qid: 'rc:rc-p10-q10',
    servesAlso: [],
    section: 'rc',
    subtopic: sub('mainidea'),
    difficulty: band(2, 'main idea'),
    source: P10('q10', 27),
    keyText: 'The trade is well documented, the sharing between trees far less so',
    answer: { line: 'Paragraph 17 states the split: the trade is measured and quantified, while how much the sharing matters stays open.' },
    steps: [
      'Read the close first. Paragraph 17 sorts what is settled from what stays open.',
      'Settled: "The trade of mineral nutrients for sugar and fat is measured and quantified."',
      'Open: how much carbon movement matters, and whether provisioning happens at all. Paragraph 16 adds that the popular language ran ahead of the measurements.',
      'Pick the choice that holds both halves.'
    ],
    choices: [
      { text: 'Ectomycorrhizal and arbuscular partners differ mainly in their fungal lineages', role: 'trap', family: 'rc-too-weak', trap: 'One detail, not the point', note: 'The two types fill paragraphs 3 and 4, and the passage contrasts their structures, not lineages. Too narrow for the main idea.' },
      { text: 'The trade is well documented, the sharing between trees far less so', role: 'key', note: 'Settled trade, open sharing: paragraph 17 in one line.' },
      { text: 'Isotope labelling has settled the question of how carbon moves between trees', role: 'trap', family: 'rc-contradicted', note: 'Paragraphs 11 to 13 list what labelling cannot settle, and paragraph 17 says the question stays open.' },
      { text: 'Fungal networks join the trees of a forest into a single system of mutual care', role: 'trap', family: 'rc-contradicted', trap: 'The popular story', note: 'This is the web of nurture image that paragraph 16 says has run well ahead of the measurements.' },
      { text: 'Phosphate scarcity is the one force that has shaped the evolution of land plants', role: 'trap', family: 'rc-too-strong', note: 'The one force behind all of plant evolution goes far beyond paragraph 5, which uses phosphate to explain why a tree pays.' }
    ],
    lockIt: 'Main idea: the answer covers the whole passage, often a settled half and an open half.',
    hook: null,
    playWith: play('rc-p10'),
    video: VID.mainidea,
    visual: {
      type: 'rc.evidence',
      passage: 'rc-p10',
      focus: '17.3',
      spans: [
        { p: 17, s: 3, quote: 'The trade of mineral nutrients for sugar and fat is measured and quantified', role: 'key', note: 'settled' },
        { p: 17, s: 5, quote: 'What stays open is how much of that movement matters to a growing forest', role: 'key', note: 'open' },
        { p: 16, s: 4, quote: 'the confident language of intention has run well ahead of the measurements', role: 'key', note: 'why the sharing story is the weaker half' }
      ],
      reuse: REUSE,
      alt: 'Three highlighted lines: paragraph 17, sentence 3, the trade is measured and quantified; sentence 5, how much the movement matters stays open; and paragraph 16, sentence 4, the language of intention has run well ahead of the measurements.',
      caption: 'Settled on top, open below. The main idea keeps both halves, the split paragraph 17 draws.'
    },
    demoPick: 'Fungal networks join the trees of a forest into a single system of mutual care',
    flags: [PLAY_FLAG]
  },
  {
    qid: 'rc:rc-p10-q11',
    servesAlso: [],
    section: 'rc',
    subtopic: sub('function'),
    difficulty: band(2, 'function of a paragraph'),
    source: P10('q11', 28),
    keyText: 'point out other ways a tag could reach a neighbouring plant',
    answer: { line: 'Paragraph 12 says the network is not the only road, lists other routes, then says none requires a fungal conduit.' },
    steps: [
      'Read the paragraph\'s first line. It names the job: the network is not the only road.',
      'List the other roads in sentence 2: soil water, carbon dioxide breathed out and fixed again, fallen litter, root grafts.',
      'Sentence 3 lands it: "none requires a fungal conduit." So a tag in a neighbour may not be network traffic. The list is support, not the topic.'
    ],
    choices: [
      { text: 'argue that soil water supplies most of the nutrients in a forest', role: 'trap', family: 'rc-too-strong', note: 'Soil water is one road a tag can take, not the forest\'s main nutrient supply.' },
      { text: 'point out other ways a tag could reach a neighbouring plant', role: 'key', note: 'Sentence 1 sets the job and sentence 3 closes it: other roads, none fungal.' },
      { text: 'explain why root grafts form between trees of the same species', role: 'trap', family: 'rc-outside', note: 'Grafts are one item on the list, and why they form is never explained.' },
      { text: 'describe the way fallen leaves decompose on a forest floor', role: 'trap', family: 'rc-too-weak', note: 'Litter is one item on the list; the paragraph never describes how leaves decay.' },
      { text: 'show that the fungal route carries more carbon than the soil route does', role: 'trap', family: 'rc-outside', trap: 'Ranked the roads', note: 'No amounts are compared: sentence 3 says pulling the routes apart is genuinely difficult, the opposite of ranking them.' }
    ],
    lockIt: 'Function of a paragraph: its first and last lines usually state its job; the middle is support.',
    hook: null,
    playWith: play('rc-p10'),
    video: VID.function,
    visual: {
      type: 'rc.evidence',
      passage: 'rc-p10',
      focus: '12.1',
      spans: [
        { p: 12, s: 1, quote: 'The network is also not the only road', role: 'key', note: 'the job, in the first line' },
        { p: 12, s: 2, quote: 'leak from roots into soil water', role: 'trap', choice: 'argue that soil water supplies most of the nutrients in a forest' },
        { p: 12, s: 2, quote: 'travel in fallen litter', role: 'trap', choice: 'describe the way fallen leaves decompose on a forest floor' },
        { p: 12, s: 2, quote: 'cross a graft where two roots have fused', role: 'trap', choice: 'explain why root grafts form between trees of the same species', note: 'items on a list, each taken for the topic by a trap' },
        { p: 12, s: 3, quote: 'none requires a fungal conduit', role: 'key', note: 'the point, in the last line' }
      ],
      reuse: REUSE,
      alt: 'Paragraph 12 in three cards. Sentence 1 is highlighted: the network is not the only road. Sentence 2 marks three routes that traps borrow, soil water, fallen litter and root grafts, and sentence 3 is highlighted: none requires a fungal conduit.',
      caption: 'The first and last lines give the job. The marked middle line is a list, not three topics.'
    },
    demoPick: 'show that the fungal route carries more carbon than the soil route does',
    flags: [PLAY_FLAG]
  }
];

// Where this batch departs from the expert's suggested family (coach record only).
const CHANGES = {
  'rc:rc-o15-q10': ['Photo 51 choice: family rc-contradicted (the expert suggested rc-misplaced), because paragraph 12, sentence 2 says the photo did not say which way the chains ran; that line is the picture\'s second card'],
  'rc:rc-o15-q13': ['Klug choice: family rc-other-paragraph (the expert suggested rc-outside; the bank says Wrong timing): a real detail from paragraph 11 placed where it does not belong'],
  'rc:rc-p10-q05': ['Carbon dioxide choice: family rc-other-paragraph (the expert suggested rc-outside): respired carbon dioxide is a real line in paragraph 12, as a route for a label'],
  'rc:rc-o15-q06': ['New span role context ("Read with it") for sentence 6.4, the sentence that shows what eloquent means; renderer tools/explain/visuals/rc.js and the build accept it, never as a proof line'],
  // expert review of B007 (verdict needs-work): one blocked item, three optional notes taken
  'rc:rc-p10-q04': ['Expert review (blocked): the caption called the ammonium mark (6.2) "other cargo", but that mark is the nitrogen itself. Caption now: the lighter marks say how cargo travels, not how nitrogen is unlocked. The 6.2 span gets the note "the form nitrogen travels in, not how it is freed", and the alt names what each lighter mark shows'],
  'rc:rc-o15-q14': ['Expert review (optional): the picture checked off three of the four stated choices and left out Birkbeck and viruses (10.4). It is now a two-panel stack so each panel stays under the phone height cap (one panel with all five marks drew 610 px): paragraph 5 with Cambridge and Paris, then paragraph 10 with Birkbeck and viruses, her death and the prize line. Alt and caption say four check off. The build now asks a stack of passage cards for one key span across its panels, not one per panel'],
  'rc:rc-o15-q09': ['Expert review (optional): the Bragg choice\'s label is "Pauling and Bragg, mixed up" (was "Borrowed the next cause"), and its note names the real pull: Pauling\'s three-chain model is what got the pair let back in (8.6), not what sent them away'],
  'rc:rc-o15-q03': ['Expert review (optional): step 2 and Lock it in no longer say the paragraph "builds to" sentence 2, since sentence 3 comes after it; the Astbury choice\'s note gives its pull (Astbury is named in paragraph 4 itself) and the refutation in one sentence, so the phone shows both']
};

module.exports = { group: 'G1', batch: 'B007', title: 'Full-Length Test 1, Reading Comprehension, passages 1 and 2 (25 items; 3 more in the pilot)', entries: ENTRIES, changes: CHANGES };
