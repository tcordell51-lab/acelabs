# Author brief: one original DAT Reading Comprehension passage (Ace Labs)

You are writing ONE original science passage with 17 questions for AceTheDAT's Ace Labs
Reading Comprehension player. Real DAT RC: 3 science passages, about 50 questions, 60
minutes; no prior science knowledge is needed to answer.

Schema (read it first): /Users/thomascordell/code/acelabs-rc/tools/rc/SCHEMA.md
Write your file to: /Users/thomascordell/code/acelabs-rc/tools/rc/data/passages/<ID>.json
Validate until it prints PASS:
  node /Users/thomascordell/code/acelabs-rc/scripts/validate-rc.mjs /Users/thomascordell/code/acelabs-rc/tools/rc/data/passages/<ID>.json
Do NOT git add or commit; do not touch any other file.

## The passage
- 1,100 to 1,400 words (aim for about 1,250), 9 to 13 paragraphs. "source": "original".
- paragraphs is an array of paragraphs, each an array of single sentences. Every element
  is exactly one sentence. "words" must equal the real word count (the validator tells you).
- DAT register: an expository science article in the voice of a thoughtful science
  writer. Concrete details a question can be asked about: named people, dates, places,
  numbers, mechanisms, a defined term or two, at least one list, a contrast or debate,
  and a few sentences where the AUTHOR shows a measured stance (cautious, skeptical,
  appreciative, critical) so a tone question has real judging words to stand on.
- ACCURACY IS NON-NEGOTIABLE. Every fact, name, date and number must be correct. Use only
  well-established facts you are certain of; if unsure of a figure, write it less
  precisely or leave it out. Never invent researchers, studies, or quotations.
- ORIGINALITY: write from your own knowledge in your own words. Never reproduce or closely
  paraphrase any test-prep company's passages or questions (Booster, Kaplan, Princeton
  Review, DAT Bootcamp, etc.), any textbook, Wikipedia, or any published article.
- Characters: NO em dashes or en dashes anywhere (use commas, colons, parentheses, or
  "to" for ranges). No emojis or decorative symbols. Plain ASCII quotes are fine.

## The 17 questions (exact mix)
detail 6, inference 3, mainidea 1, function 2, except 2, tone 1, application 1, vocab 1.
- Order them roughly in passage order, the way the DAT does; put the main idea item last.
- Stems in DAT style: "According to the passage, ...", "The passage suggests that ...",
  "The author mentions X in paragraph 5 primarily to ...", "All of the following are
  stated in the passage EXCEPT:", "Which of the following is NOT ...", "As used in
  paragraph 6, the word 'X' most nearly means", "The author's attitude toward X is best
  described as", "Which new situation best illustrates the principle described in
  paragraph 8?", "Which of the following best expresses the main idea of the passage?"
- Five choices (A to E), parallel in grammar and similar in length. Exactly ONE is
  defensible from the passage. Distractors should be the passage's own near misses: true
  but answers a different question, the wrong paragraph's fact, reversed cause and
  effect, too extreme (always/never/only), half right, or outside the passage.
- THE KEY IS NEVER THE LONGEST CHOICE (strictly shorter than the longest; the validator
  enforces this). Spread keys across A to E: every letter is the key 2 to 5 times.
- Every key is tied to a proof line: {"paragraph", "sentence", "quote"} with the quote an
  EXACT substring of that sentence. EXCEPT items list one proof line per TRUE choice
  (with "choice": index) plus the contradicting line if one exists. Main idea items cite
  2 to 4 topic/thesis lines. Inference and application keys cite the line(s) they rest on.
- No "all of the above" / "none of the above". EXCEPT/NOT items carry EXCEPT or NOT in
  capitals. Vocab: the word must have a common meaning that is wrong in context.
- "why": 1 to 3 sentences in a warm coaching voice that points at the proof line
  ("Paragraph 4 says ..."). "distractorNotes": five slots, null at the key, otherwise one
  sentence naming exactly why that choice fails (wrong paragraph, reversed, too strong...).
- Question ids: <ID>-q01 ... <ID>-q17.

## Before you finish: be your own skeptical examiner
Cover the keys and re-answer all 17 from the passage alone. For each, try hard to defend
a second choice; if you can, rewrite the choice or the passage until you cannot. Check
every fact once more. Then run the validator to PASS.

Reply (short): ID, word count, type counts, key letter counts, and any fact you are less
than fully certain of (with what you did about it).
