# Ace Labs Reading Comprehension: passage schema

One JSON file per passage in `tools/rc/data/passages/<id>.json`. Sections live in
`tools/rc/data/sections.json`. `node scripts/build-rc-bank.mjs` validates everything
and writes `tools/rc/data/bank.js`, the only file the player loads (a script, not a
fetch, so the player also works from `file://`).

## Passage

```json
{
  "id": "rc-o01",
  "title": "Thin Air and the Body's Slow Answer",
  "topic": "high-altitude acclimatization",
  "field": "physiology",
  "source": "original",
  "words": 1284,
  "paragraphs": [
    ["First sentence of paragraph 1.", "Second sentence of paragraph 1."],
    ["First sentence of paragraph 2.", "..."]
  ],
  "questions": [ ... ]
}
```

- `paragraphs` is an array of paragraphs, each an array of sentences. Text is stored
  pre-split so a proof line is an exact address that never drifts.
- `words` must equal the real word count of the paragraphs.
- `source` is `original` (written for Ace Labs) or `migrated:acethedat-prep` (from the
  prep app's own original passages, re-verified line by line).

## Question

```json
{
  "id": "rc-o01-q07",
  "type": "inference",
  "stem": "The passage most strongly suggests that ...",
  "choices": ["A text", "B text", "C text", "D text", "E text"],
  "key": 2,
  "proof": [
    { "paragraph": 4, "sentence": 2, "quote": "exact words from that sentence" }
  ],
  "why": "Why the key is right, pointing at the proof line.",
  "distractorNotes": ["why A is wrong", "why B is wrong", null, "why D is wrong", "why E is wrong"]
}
```

- `paragraph` and `sentence` are 1-based, the way a student says "paragraph 4".
- `quote` must be an exact substring of that sentence. The validator checks it, so a
  proof cannot point at the wrong line without failing the build.
- `proof` is an array. Most questions have one line. EXCEPT/NOT items list the lines that
  confirm the four true choices (each with `"choice": <index>`) and, when the passage
  contradicts the key, that line too. Main idea items cite the thesis line(s).
- `distractorNotes` has five slots; the key's slot is `null`.

## Question types (`type`)

| key | label | where the answer lives |
|---|---|---|
| `detail` | Detail | one line, found by search |
| `inference` | Inference | one step past a line |
| `mainidea` | Main idea / purpose | the topic sentences, read in order |
| `function` | Function of a paragraph or detail | why that paragraph or detail is there |
| `except` | EXCEPT / NOT | confirm four lines; the one you cannot confirm |
| `tone` | Tone / attitude | the author's judging words |
| `application` | Application | a new case run through the passage's rule |
| `vocab` | Vocabulary in context | the word's own sentence |

Migrated items keep their original label in `subtype` (`locate`, `purpose`, `structure`).

## Rules the validator enforces

- Exactly five distinct choices; `key` 0 to 4.
- The keyed choice is never the longest choice: strictly shorter than the longest, except
  that short labels of 20 characters or fewer ("Paragraph 12") may tie.
- Every proof line exists and its quote is found in it.
- `type` is one of the eight above; EXCEPT items carry EXCEPT, NOT or LEAST in capitals.
- No em dashes, en dashes, or emoji anywhere in the text.
- Every passage: 1,100 to 1,400 words (the ADA length; the migrated passages were trimmed to it
  on 2026-10-01). Migrated passages: 15 to 17 questions.
- Original passages: 16 or 17 questions, and the DAT mix
  (at least 5 detail, 2 inference, 1 each of the other six types).
- Key letters do not follow a rotation, and explanations never name an answer letter
  (choices may be reordered by `tools/rc/scripts/shuffle_choices.py`).
- Sections: three distinct passages, 48 to 50 questions.
