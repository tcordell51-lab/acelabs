# Thomas's coaching voice: a codex for explainers

Draft for Thomas to approve. Once approved it moves to `docs/thomas-voice-codex.md`
in the acelabs repo (see docs/ace-system-decisions.md, "Questions"). It records
voice patterns only. It holds no student names, scores, schools, dates or any
other student detail, and every quote below is Thomas's own wording (or his
course scripts), kept short.

## 1. Where this comes from, and how much each source counts

| Source | What it is | Weight | Notes |
|---|---|---|---|
| Sent email, thomas@acethedat.com | 8 threads sampled from 317 sent (June to October 2026): consult follow-ups, check-ins, a first-week note, crash-course notes, a plan reply | Highest for tone | Read through the Gmail connector. The older notes are plainly typed by hand; the October ones are templated but sent and signed by him. Only patterns are recorded here. |
| acethedat.com copy | index, about, pricing, team, tools, crash-course pages in the acethedat-com repo | High for stance and claims | First person ("I'm Thomas. You work with me directly"). Marketing register, so sentences run longer than his coaching. |
| Retold courses | `walk` (narration) and `teach` (coach line) fields, 500 scenes across tools/bio-retold, gchem, organic, qr-retold, rc-retold, pat-retold | High for teaching moves | His course scripts. They break house rules in places ("wrong" 59 times, em dashes), so they are a source of moves, never of wording to paste. |
| Trick scripts | tricks/videos/vo-scripts.js (13 videos, the "Thomas Coach" voice-over), tricks/shorts/shorts-data.js, tools/gc/tiktoks/topics.js and tools/qr/tiktoks/topics.js | Medium | Short-form register: punchy, social ("Comment your pick"). Good for hooks and trap lines, too clipped for a full explainer. Clips by Sarah (the sarah-* QR TikToks) are excluded. |

Measured (script: question-system/voice-scripts/stats.js):

| Register | Median sentence | Sentences of 6 words or fewer |
|---|---|---|
| His email to students | 9 words | about half are 8 words or fewer |
| Retold narration (4,678 sentences) | 14 words (90th percentile 28) | 15 percent |
| Trick voice-over (557 sentences) | 5 words | 62 percent |
| Site copy (248 sentences) | 15 words | 24 percent |

The explainer register sits between email and Retold narration: a median of
about 10 to 14 words, with at least one short line (6 words or fewer) per
explainer to land the point.

## 2. The voice in one paragraph

Direct, warm, unhurried, and practical. He talks to one student, in second
person, present tense. He goes straight to the move ("Count first."), says why
in plain words, names the trap the way a coach calls a play, and closes on one
line the student can carry out of the room. He normalizes misses instead of
praising or scolding: a miss is information, "the same mistake in different
clothes." He sounds like someone who just took the test and remembers which
parts were noise.

## 3. Patterns, with his words

### 3.1 How he opens

- **Straight to the move, no recap of the question.** "Count first." / "Kick the H off. Judge the conjugate base." / "Start with the questions."
- **A secret or a reframe, then the rule.** "Here is the secret about QR that nobody tells you: it is not really a math test." / "Here's the whole game in one line." (Retold openers: "Here is" 76 times, "Here's the" 55.)
- **A question he then answers himself.** "Why pinch the middle? Because pinching adds surface." / "Why pp? Because pp only ever hands down a little p."
- **"Do not X yet."** "Do not multiply yet." / "Now do not memorize that. Read it."
- In email: first name, then the reason for writing in one line. "Quick check-in so your portal and weekly plan match exactly where you are."

### 3.2 Sentence shape

- Short declaratives, often in threes: "Rates add. Times don't." / "Of means multiply." / "Two rules. Two operations." / "Smaller wins."
- One longer sentence when he gives a recipe, joined with commas and a semicolon: "write the balanced equation, convert the given quantity to moles, use the mole ratio, and convert to the requested units; check units at every step."
- Imperatives for steps: "Draw the bag and dump everything on the table." / "Check it going forward." / "Step one, throw out the two that are obviously wide."
- Spoken rhythm: "Three sodium out, two potassium in." / "Revenue in, cost out, profit is the gap."

### 3.3 How he names traps

- He names the trap before he removes it: "Name the trap, then cross it out." / "Say the word: mirror. Gone."
- He says why it is tempting, in the student's own head: "Your gut screams X is bigger." / "The tempting thing is to add 20% back onto 60. Don't." / "This is the trap that sinks people."
- Trap callouts are short and labeled: "Trap. Mixing the rules." / "Trap. Double bonds count as one group, not two." / "Here's the trap students fall into."
- Recurring trap families (RC and beyond): extreme, out of scope, half right, true but off-question; and in the sciences, "right number, other question" (handing back q squared when q was asked, the slice size instead of the head count).
- He sorts misses by kind: "Note whether the issue was content, applying a concept, misreading, or timing." On the site: "tell a knowledge gap apart from a conceptual misfire apart from a strategy failure, then fixing each one its own way."

### 3.4 Pictures and cues

- Everyday objects carry the idea: a cell as a city, a bouncer paid to shove ions out, a turbine, a sweater for the Gram stain, scissors for ozone, "groups want elbow room", the IR "tongue and dagger".
- Short mnemonics, said once and reused: LPOP, CARDIO, Red Cat An Ox, "smaller wins", "corner 3, edge 2, face 1, buried 0".
- He draws first. "Draw" opens 109 Retold sentences ("Draw the", "Draw a"). In an explainer, the visual plays that role.

### 3.5 How he closes

- One line to keep: "Lock it in. Count first. Octet second. Formal charge last." / "Lock it in. Product. Smaller wins."
- Hand the work back: "Your turn." (Retold 81 times) / "Read it, then answer."
- In email: an open question and an invitation to send unfinished work. "Which question or topic still feels least clear? Send me your work, even if it's unfinished." Sign-off: "Thomas" (sometimes "Talk soon, Thomas" or "Best, Thomas Cordell").

### 3.6 How he encourages

- Through the process, not praise. "Unfamiliar material is expected." / "The diagnostic gives us a starting point." / "Week two is where it starts to feel like a system."
- He takes the blame off the student and puts it on the method: "It's almost never an effort problem. The system they're following just doesn't work." / "Talent feels good; method scores."
- He states progress plainly, once: "It's good that stoichiometry is starting to click."
- Low-pressure asks: "No need to watch it all in one sitting." / "Work untimed so you can focus on the setups, then review any misses and try them again."
- Not hype. No "Great job!", no "You got this!", no exclamation chains. One "Great!" in a quick logistics reply is the most he uses.

### 3.7 Words he reaches for

miss, misses (not "mistakes", never "wrong answers"); setup; the move; the tell;
trap; check; lock it in; the whole game, the whole trick; free points; bank;
read it; count; "same mistake in different clothes"; "what moves your score";
"why the right answer is right."

## 4. What not to carry over

| Seen in the sources | Why it stays out of explainers | Use instead |
|---|---|---|
| "wrong" (Retold 59 times, RC distractor labels, PAT trap names) | House rule: never wrong, incorrect or failed | "the trap", "lands somewhere else", "answers a different question", "does not fit", "Needs review" |
| Em dashes (throughout Retold and the VO scripts) | House rule: plain ASCII, no em dashes | a period, a comma, or a colon |
| ALL-CAPS trap labels ("SIZE-BACKWARDS") | Shouting on a phone screen | Title-style trap name: "Size backwards" |
| "Comment your pick", "Ace the DAT." sign-off | Social-video only | Nothing, or "Your turn." where a retry follows |
| Clock talk in practice ("the clock eats her alive", "under time pressure") | Practice is untimed; timers live only in full timed tests | Talk about the setup, not the seconds |
| Absolutes ("you'll never miss one of these again") | Over-promises; reads as hype | "This setup works on every one of these." |
| Scores, percentiles, prices, school names | Not explainer content; scores-as-grades are out | Nothing |
| Any competitor or other prep product named in an email | House rule: no competitor names | Nothing |
| Student names, results, dates | Privacy | Never copied |

## 5. Rules for writing an explainer in his voice

1. **Open with the move.** Step 1 starts with a verb or with "Here is" and names the first thing a strong student does. No restating the stem.
2. **Talk to one student.** "You", present tense. "I" appears at most once per explainer ("The slip I see most is...").
3. **Keep it short.** Steps are 1 to 2 sentences each, 10 to 14 words on average. Each explainer has at least one line of 6 words or fewer ("Stop where the stem stops.").
4. **Give the why in plain words.** Where a step needs a reason, use his question-then-answer move: "Why the inner membrane? Because..."
5. **Name every trap.** Every non-key choice gets a 2 to 5 word trap name from the closed family list (explainer-standard.md, section 3), with an optional label in his words, then one or two sentences: why it pulls you in, then what it actually answers.
6. **Never cite a choice letter.** Choices are referred to by their content; the player adds letters from the served order.
7. **One signature phrase at most.** "Here's the whole trick", "Lock it in", "Do not X yet", "Check it" or "Your turn" can each appear, but not stacked, so it reads like him and not like an impression of him.
8. **Close on "Lock it in."** One sentence, 20 words or fewer, that would still be true on the next question of this kind.
9. **Encourage through the method.** If the explainer needs a reassuring line, it is about the setup ("This is a reading step, not a math step."), never praise and never a grade.
10. **House rules always win.** Plain ASCII, no em dashes, no emojis, never wrong / incorrect / failed, no timers, scores or percentages as grades, no competitor names.

## 6. Two before-and-after samples

Bank explanation (tools/mock/data/full-mocks.js, a Hardy-Weinberg item):

> "This is a Hardy-Weinberg question wearing a sentence as a disguise. For a recessive condition, the word affected describes homozygous recessive individuals, so the number you are handed is q squared, not q."

In the codex voice (pilot BIO-1):

> "Read the word affected first. A recessive trait only shows in aa, so 1 in 10,000 is q squared. Not q."
> Trap, Right number, other question: "0.0001 is the share of people who are affected. It is tempting because it is the number the stem hands you. The stem asks for the allele."
> "Lock it in: affected people are q squared; the allele is the square root."

Bank explanation (shared/dat-mock-tests.js, a conditional probability item): none.
In the codex voice (pilot QR-3):

> "Turn the percents into people. Picture 1,000 of them."
> Trap, Flipped the condition: "0.99 is the chance a sick person tests positive. The question runs the other way: given a positive test, how likely is the disease?"

## 7. Open questions for Thomas

- Is "Lock it in" the closing label you want on every explainer, or would you rather a plain "The one line"?
- Do you want the first-person line ("The slip I see most is...") in explainers at all, or only in videos?
- The Retold scripts and trick voice-overs read as drafted with help. If any of them are not in your voice, say which and they come out of the source set.
