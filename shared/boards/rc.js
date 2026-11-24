/* boards/rc.js : Reading Comprehension whiteboards (shared/ace-board.js draws them).
   DAT Reading: 3 passages, 50 questions, 60 minutes. */
(function (B) {
  'use strict';
  if (!B) return;
  var K = B.kit, t = K.t, line = K.line, arrow = K.arrow, box = K.box, circ = K.circ, step = K.step, hi = K.hi, dot = K.dot, curve = K.curve, rect = K.rect;

  /* ---------- Passage map ---------- */
  function para(y) { var s = ''; for (var i = 0; i < 4; i++) s += line([[50, y + i * 20], [i === 3 ? 250 : 370, y + i * 20]], { w: 3.5, c: 'mute' }); return s; }
  B.add({
    id: 'rc-map', section: 'rc', title: 'Map the passage first',
    sub: 'A few words per paragraph. You are building a table of contents.',
    svg: K.svg(
      para(60), para(170), para(280), para(390),
      step(1, t(410, 92, 'P1: what it is', { size: 28, c: 'blue', a: 's' }), t(410, 202, 'P2: how it works', { size: 28, c: 'blue', a: 's' })),
      step(2, t(410, 312, 'P3: the study', { size: 28, c: 'purple', a: 's' }), t(410, 422, 'P4: limits, next', { size: 28, c: 'purple', a: 's' })),
      step(3, hi(120, 72, 70, 16, { c: 'gold', op: 0.7 }), hi(250, 182, 60, 16, { c: 'gold', op: 0.7 }), hi(90, 312, 80, 16, { c: 'gold', op: 0.7 }), hi(200, 292, 50, 16, { c: 'gold', op: 0.7 }), t(410, 132, 'mark names, numbers', { size: 26, c: 'goldInk', a: 's' })),
      step(4, hi(50, 382, 90, 18, { c: 'rose', op: 0.5 }), t(410, 462, '"however": the turn', { size: 26, c: 'rose', a: 's' })),
      step(5, line([[30, 60], [30, 450]], { w: 6, c: 'green' }), t(360, 524, 'main idea: the thread through all four', { size: 28, c: 'green' }))
    ),
    predict: { q: 'On your first pass through a DAT passage, what are you trying to come away with?', choices: ['Every detail memorized', 'What each paragraph is for', 'The answer to question 1'], answer: 1, why: 'You cannot hold 1,500 words of detail. You can hold a map, and the map tells you where to look when a question asks.' },
    steps: [
      'Read each paragraph for its job, and jot three to five words. First paragraphs usually introduce the topic, then explain how it works.',
      'Later paragraphs often report evidence, then limits, exceptions or what comes next. Your notes are a table of contents, not a summary.',
      'Mark landmarks as you go: names, numbers, dates, defined terms. Do not memorize them. Just know where they live.',
      'Circle the turn words: however, but, although, therefore. They show where the author changes direction or draws a conclusion, and questions love those spots.',
      'The main idea is the thread that connects all your paragraph notes. If a choice only fits one paragraph, it is too narrow.'
    ],
    tryIt: [
      { q: 'A question asks for a specific number from the passage. With a good map, you:', choices: ['Answer from memory', 'Go back to the paragraph where numbers live and find it', 'Reread the whole passage'], answer: 1, why: 'The map tells you which paragraph to scan. Look it up. Do not trust memory for details.' },
      { q: 'A main idea choice describes only what paragraph 3 says. It is most likely:', choices: ['Correct', 'Too narrow', 'Too extreme'], answer: 1, why: 'The main idea has to cover the whole passage, not one part of it.' },
      { q: 'Which word most often signals that the author is about to change direction?', choices: ['Furthermore', 'However', 'For example'], answer: 1, why: '"However" marks a turn. "Furthermore" continues, and "for example" illustrates.' }
    ],
    path: { title: 'First pass through a passage', steps: ['Read paragraph 1 for the topic', 'Jot a few words on its job', 'Mark names, numbers and terms as you go', 'Circle turn words', 'Repeat for each paragraph', 'State the main idea in one line'] },
    more: [{ label: 'The question types', href: '/see/?b=rc-question-types' }, { label: 'Pacing the section', href: '/see/?b=rc-pacing' }, { label: 'Map a real passage', href: '/rc/map/' }]
  });

  /* ---------- Question types ---------- */
  function card(x, y, title, col) { return box(x, y, 310, 196, { w: 5, c: col }) + t(x + 20, y + 48, title, { size: 31, c: col, a: 's' }); }
  B.add({
    id: 'rc-question-types', section: 'rc', title: 'Four question types, four moves',
    sub: 'Name the type before you look at the choices.',
    svg: K.svg(
      card(36, 30, 'Detail', 'blue'), card(374, 30, 'Inference', 'purple'), card(36, 252, 'Tone, purpose', 'rose'), card(374, 252, 'Except, not', 'green'),
      circ(294, 70, 17, { w: 4, c: 'blue' }), line([[306, 83], [322, 100]], { w: 5, c: 'blue' }),
      dot(596, 78, 7, { c: 'purple' }), dot(626, 78, 7, { c: 'purple' }), arrow(636, 78, 668, 78, { w: 3.5, c: 'purple', head: 9 }),
      circ(304, 294, 18, { w: 4, c: 'rose' }), curve([[294, 298], [304, 305], [314, 298]], { w: 3, c: 'rose' }),
      line([[620, 284], [640, 304]], { w: 5, c: 'green' }), line([[640, 284], [620, 304]], { w: 5, c: 'green' }),
      step(1, t(56, 126, 'find the line', { size: 28, a: 's' }), t(56, 166, 'match the paraphrase', { size: 27, a: 's' })),
      step(2, t(394, 126, 'what must be true', { size: 28, a: 's' }), t(394, 166, 'one small step', { size: 27, a: 's' })),
      step(3, t(56, 348, 'read the author words', { size: 27, a: 's' }), t(56, 388, 'pick the mild choice', { size: 27, a: 's' })),
      step(4, t(394, 348, 'find the three', { size: 28, a: 's' }), t(394, 388, 'that are there', { size: 27, a: 's' })),
      step(5, hi(60, 494, 600, 36, { c: 'gold' }), t(360, 520, 'traps: too extreme, true but not asked', { size: 28 }))
    ),
    predict: { q: '"According to the passage, the enzyme is produced in the..." What type of question is this?', choices: ['Detail', 'Inference', 'Tone'], answer: 0, why: '"According to the passage" asks for something stated directly. Find the sentence and match it.' },
    steps: [
      'Detail ("according to the passage", "the author states"): the answer is written in the text. Use your map to find the line. The right choice is usually a paraphrase, not a word for word copy.',
      'Inference ("suggests", "implies", "can be concluded"): the answer is not stated, but it must be true if the passage is true. Take the smallest possible step from the text.',
      'Tone and purpose ("the author\'s attitude", "the primary purpose"): look at the author\'s adjectives and how the passage is built. Scientific passages are usually measured, so mild beats dramatic.',
      'Except and not ("all of the following EXCEPT"): three choices are in the passage and one is not. Find the three, cross them off, and the leftover is the answer.',
      'Wrong answers repeat: too extreme (always, never, proves), true but not what was asked, mentioned in the wrong paragraph, or never in the passage at all.'
    ],
    tryIt: [
      { q: '"The passage suggests that early treatment..." is what type?', choices: ['Detail', 'Inference', 'Except'], answer: 1, why: '"Suggests" signals an inference: not stated outright, but it must follow from the text.' },
      { q: 'On an EXCEPT question, the correct answer is the choice that:', choices: ['Appears in the passage', 'Does not appear in the passage', 'Is the main idea'], answer: 1, why: 'Three choices are supported by the passage. The exception is the one you cannot find.' },
      { q: 'A passage calmly reports a study and notes its limits. The author\'s tone is best described as:', choices: ['Outraged', 'Objective', 'Sarcastic'], answer: 1, why: 'Measured reporting with stated limits is objective. Extreme tone words are rarely right on science passages.' }
    ],
    path: { title: 'Answer a reading question', steps: ['Read the question stem and name its type', 'Predict where in the passage the answer lives', 'Go back and reread those lines', 'Say the answer in your own words', 'Match it to a choice', 'Cross out extremes and off-topic choices'] },
    more: [{ label: 'Map the passage first', href: '/see/?b=rc-map' }]
  });

  /* ---------- Pacing ---------- */
  B.add({
    id: 'rc-pacing', section: 'rc', title: 'Pacing: 60 minutes, three passages',
    sub: 'Twenty minutes each. Know what the clock should say.',
    svg: K.svg(
      t(360, 68, '3 passages   50 questions   60 minutes', { size: 28 }),
      rect(60, 150, 600, 64, { w: 5 }), t(60, 256, '60', { size: 28, c: 'mute' }), t(660, 256, '0', { size: 28, c: 'mute' }),
      step(1, line([[260, 150], [260, 214]], { w: 5 }), line([[460, 150], [460, 214]], { w: 5 }), t(160, 132, 'passage 1', { size: 27, c: 'blue' }), t(360, 132, 'passage 2', { size: 27, c: 'blue' }), t(560, 132, 'passage 3', { size: 27, c: 'blue' })),
      step(2, [60, 260, 460].map(function (x) { return rect(x + 3, 153, 57, 58, { w: 1.5, c: 'goldInk', fill: 'gold', op: 0.5 }); }).join(''), t(100, 300, 'map: 6', { size: 27, c: 'goldInk' }), t(350, 300, 'answer: 14', { size: 27, c: 'blue' })),
      step(3, arrow(260, 326, 260, 222, { c: 'rose', w: 4 }), arrow(460, 326, 460, 222, { c: 'rose', w: 4 }), t(300, 354, 'clock: 40', { size: 28, c: 'rose' }), t(486, 354, 'clock: 20', { size: 28, c: 'rose' })),
      step(4, t(360, 428, 'stuck for a minute? mark, guess, move', { size: 28, c: 'purple' })),
      step(5, hi(130, 480, 460, 38, { c: 'gold' }), t(360, 508, 'no penalty: answer all 50', { size: 29 }))
    ),
    predict: { q: 'The Reading section gives 60 minutes for 3 passages. When you finish passage 1, about how much time should be left on the clock?', choices: ['50 minutes', '40 minutes', '30 minutes'], answer: 1, why: 'Sixty minutes over three passages is 20 minutes each. After the first, the clock should read about 40.' },
    steps: [
      'Three passages in 60 minutes is 20 minutes per passage, with about 16 or 17 questions each.',
      'Inside each 20: about 6 minutes to read and map, about 14 to answer. That leaves a little under a minute per question.',
      'Use two checkpoints. Start passage 2 with about 40 minutes left and passage 3 with about 20 left. If you are behind, speed up now, not at the end.',
      'One question is never worth three. If you have spent a minute and are not close, mark it, pick your best guess and move on.',
      'There is no penalty for a wrong answer on the DAT, so never leave a blank. In the last minute, fill in everything that is left.'
    ],
    tryIt: [
      { q: 'You start passage 3 with 12 minutes left. The best plan is to:', choices: ['Read it as carefully as the first two', 'Map it fast, answer detail questions first, guess the rest', 'Skip the passage'], answer: 1, why: 'Detail questions can be looked up quickly. Bank those, then guess on whatever is left. Blanks earn nothing.' },
      { q: 'How many questions are in the DAT Reading section?', choices: ['40', '50', '60'], answer: 1, why: '50 questions across 3 passages in 60 minutes.' },
      { q: 'With one minute left and five questions unanswered, you should:', choices: ['Leave them blank', 'Fill in an answer for each', 'Work only the first one'], answer: 1, why: 'Wrong answers cost nothing. A guess has a chance. A blank has none.' }
    ],
    path: { title: 'One passage in 20 minutes', steps: ['Map the passage: about 6 minutes', 'Answer detail questions by looking them up', 'Answer inference and tone questions', 'Mark and guess anything over a minute', 'Check the clock against the checkpoint', 'Move to the next passage on time'] },
    more: [{ label: 'Map the passage first', href: '/see/?b=rc-map' }]
  });
})(typeof window !== 'undefined' ? window.AceBoard : (typeof require === 'function' ? require('../ace-board.js') : null));
