# Ace System: decisions (Thomas, 2026-10-30)

Internal. /docs is redirected away on the live site. Every build agent reads
this before touching Ace Labs.

## What we are building

One Ace Labs: every subject fully fleshed out as a lesson map where knowledge
builds, every question looks like the real DAT and has a detailed explainer and
a visual, and students learn by playing. Order of work: Biology, then General
Chemistry, Organic Chemistry, Quantitative Reasoning, PAT, Reading
Comprehension.

## The learning system

- Map, not chapters: subject > units > lessons (about 30 minutes, one DAT
  subtopic each), linked by prerequisites. The map recommends an order and
  never locks content.
- Every lesson, every subject, the same five steps:
  1. Warm-up: REQUIRED, 3 to 5 DAT-style questions from earlier lessons chosen
     by the scheduler (one from the previous lesson, one from 3 to 7 days ago,
     one older, misses first, one from another subject). No pass mark; a miss
     becomes an Ace Card. The new lesson opens after the warm-up.
  2. Call it first: one prediction before any teaching.
  3. Learn and play: explainer, visual, something to manipulate, optional video.
  4. Check: about 5 DAT-style questions, each followed by its explainer and
     visual; misses retried later in the session with a different item on the
     same skill.
  5. Keep: misses become Ace Cards; every item enters the review schedule.
- Spacing: correct items return at about 1, 3, 7, 16, 35 days; misses the same
  session and the next day. Reviews use a different item on the same skill
  where the bank allows. Solid means correct across at least 3 separate days.
- Mixing: new material blocked; warm-ups mixed across past lessons; unit
  checkpoints (about 15 mixed, 20 percent from earlier units); weekly mixed set
  across subjects; late phase section sets and full practice tests.
- Phases from the test date: Build, Blend, Test, Taper. Today orders the day:
  capped reviews, one new lesson, one play.
- Daily load: asked at onboarding (hours per day plus test date).
- Status in words, never points: New, Learning, Confirmed, Strong, Keep,
  Needs review.
- Repair: the same skill missed twice routes back to its lesson.

## Questions

- One DAT-style question screen everywhere (layout per the real DAT interface
  study). Practice is untimed with the explainer after each answer. Full
  practice tests are timed like the real test.
- Timer: OPTIONAL, OFF by default, offered for section sets only in the Test
  phase (last 3 weeks). Full practice tests stay timed. No other timers.
- Every question gets a detailed explainer and a visual, stored as sidecar
  files keyed by question id. Answer keys are never changed silently: suspected
  bad keys go to a key-disputes list for Thomas.
- Concepts over math (Thomas, 2026-10-30): questions and explainers exist to
  instill concepts, not to test arithmetic. In the science sections, any math
  is light: one or two clean steps with friendly numbers a student can do in
  their head (the real DAT science sections allow no calculator). Prefer
  "what happens / why / which is true" items; every distractor comes from a
  real misconception, never from an arithmetic slip. Explainers teach the idea
  first and the math second. QR keeps its math but explains the concept behind
  each setup before the computation. New items, warm-ups, reviews and anything
  Ace generates follow this; existing bank items with heavy arithmetic are
  flagged for a concept-first rewrite or a lighter variant, keys unchanged
  unless Thomas approves.
- Never a block of text (Thomas, 2026-10-30): every explanation leads with a
  visual or a simpler format, then words. The visual comes right under the
  answer, before the steps ("see it first"). Words are short steps (one or
  two sentences each), traps are small labeled cards, and the explainer ends
  on one "lock it in" line. Every Ace reply is a short line, then a visual
  (a flow of steps, a side-by-side compare, numbered step cards, an analogy
  map, a number line, or a drawn diagram), then a one-line takeaway; never a
  paragraph. Questions Ace writes carry a visual in their explanation too.
- Explainers are written in Thomas's coaching voice. The voice reference is built from his own words (Retold coach lines, trick scripts, acethedat.com copy, his emails to students: voice patterns only, no student details) and lives at docs/thomas-voice-codex.md once written.

## Sign-off

Thomas signs off every true-to-life view and every new batch of explainers with
a 10-minute checklist before students see it. Nothing new reaches students
without his approval.

Explainer sign-off (Thomas, 2026-10-30): groups G1 to G4 (the free full test,
the diagnostics, full tests 2 to 4, practice tests 1 to 3) get item-by-item
sign-off. From G5 on, one 10-minute sitting per batch covers every flagged
item, every item the expert changed and a random sample of 8; if the sample
passes the rest of the batch is approved, and any Hold sends the whole batch
back.

## Release

- Free public tier: the visualizers and play, one full practice test, the first
  lesson of each subject, and the diagnostic.
- Full system for coached students.
- Progress syncs through the portal login (one record per student), so it
  follows students across devices.
- Coaches see each student's lesson map and can assign lessons and sets from
  the portal: Thomas sees everyone; Sarah and Chapman see their students for
  their subjects.

## Look

Use the new ACEDAT logo (the AD monogram with the gold bar and the ACE DAT
wordmark; vector files in the acethedat-com repo: ace-dat-mark.svg,
ace-dat-mark-reversed.svg, ace-dat-logo.png, og-brand.png). Make it fresh and
evolve it toward a direction that includes MINT GREEN, and make it look sharp.
Keep the deep green and gold of the logo as anchors.

## Videos

Voice-over screen recordings of Ace Labs' own visuals for the subtopic
explainers (one per subtopic, 60 to 120 seconds); Thomas on camera only for
short welcome and section-intro videos. Record after the redesign settles.

## House rules that still hold

No streaks, points, XP, leaderboards, scores or percentages as grades, or
confidence gating before feedback. Plain ASCII copy, no emojis, no em dashes.
Never wrong / incorrect / failed (Confirmed / Needs review). No competitor
names. Original content only. Motion explains and respects reduced motion.
Phone first.

## Design (One Loop, chosen 2026-10-30)

The design round picked One Loop (Predict, Play, Prove, Keep), ranked first
by all three judges, with grafts from the other two designs. Spec, build plan
and working mockups: docs/release-2026-10-30/one-loop/. Defaults taken for the
spec's open decisions (Thomas can override any):

1. Canon becomes "Sheets" inside Learn; the nav has five doors (Today, Learn,
   Practice, Tests, Review), a bottom tab bar on phones.
2. Look: the new ACEDAT logo, fresh and sharp with mint green. Fonts are Sora
   (display, matches the geometric wordmark), DM Sans (body) and JetBrains
   Mono (labels), all self-hosted. This replaces the spec's Playfair Display.
3. The Climb, Recognition Lab and quick rounds are untimed with no best
   scores; the Climb's internal threshold is never shown.
4. The 1 to 5 confidence rating before feedback is removed everywhere.
5. QR geometry and trigonometry follow the official ADA outline as confirmed
   by the coverage audit (docs/release-2026-10-30/coverage/ when it lands).
6. Coach lines: about 40 lines drafted from Thomas's voice reference, marked
   for his approval before students see them.
7. Push the piston (new GChem tool) is not in this release; GChem's proof of
   the loop is Titration curves.
8. The Review dot and the due counts tell one story (B1.1): Today, Review and
   the dot all read `AceProgress.dueState`. A scheduled card (a review date or
   the engine's own date) is due once its date comes. A legacy miss with no
   date of its own counts as due only on its next day, the day after it was
   made, and otherwise as Open: it waits in Review, never holds the dot on by
   itself, and is scheduled once it is reviewed.
9. Coach line drafts never reach students (B1.1): unapproved lines render only
   with `?drafts=1` on a preview host (localhost, 127.0.0.1 or a Netlify deploy
   preview), never on the production host. Students see the plain fallback
   until Thomas approves a line.
10. The dark-mode primary button stays gold (`--s-primary` #C9A84C with ink
    #16120A, 8.17:1), as the spec has it; deep green stays the light-mode
    primary.

## One product (Thomas, 2026-10-30)

Thomas: "Make sure everything has the new logo. Same logo everywhere, same
thing, same format everywhere. It should feel like one product. Make sure it's
interactive. Above and beyond perfect." These rules extend the build plan and
win over any "tokens only" or "no layout surgery" line in it. Engine internals
(banks, keys, generators, scene logic, bio-real.js, bio-bone.js) stay as the
plan says; the frame around them does not.

1. **One logo.** Every student page shows the new ACE DAT logo exactly one
   way: through shell v2 (the lockup and LABS in the bar on desktop, the mark
   on phones). Pages that hide the shell (timed test screens) show the mark in
   their own top bar from `/shared/brand/`. No other logo file, no old
   wordmark, no "AceTheDAT" text set as a heading or brand line, no old icon.
   The old copies `shared/ace-dat-lockup-reversed.svg` and
   `shared/ace-dat-mark-reversed.svg` go once nothing includes them.
2. **One frame.** Every student page loads `al-tokens.css`, `al-fonts.css`,
   `al-kit.css` and shell v2, and opens with the kit's door header (eyebrow,
   Sora title, DM Sans lede) or, for an engine, the kit's tool header (section
   eyebrow, tool title, one-line method, the same controls in the same place).
   Buttons, chips, cards, tabs, toggles, fields, toasts and sheets come from the
   kit. Engines may keep their own canvases and diagrams, drawn in token colors.
   Light and dark both work on every page through `html[data-theme]` and
   `prefers-color-scheme`; no page forces its own dark mode.
3. **One type and color system.** Text is Sora (display), DM Sans (body) or
   JetBrains Mono (labels); the DAT-style exam screen keeps its test-day face.
   Colors come from tokens v2. Mint marks where you are; gold marks your next
   move; Confirmed and Needs review keep their colors and words.
4. **One question screen.** Every question a student answers (practice sets,
   warm-ups, checks, the diagnostic, section tests, full-length tests, the
   Climb, Retold checks, Which one is this? word questions) runs on the
   DAT-style player with the same explainer layout after each answer.
5. **One play pattern.** Each section has at least one Call it first loop on
   `AceLoop` and one Which one is this? set, and every Retold night opens with
   a call and closes with Play this, Sheet and Prove it. A miss anywhere makes
   the same Ace Card and lands in the same Review.
6. **One set of names.** Spec 1.4 names everywhere: page titles, headers, nav,
   cards, links.
7. **Proven by a gate.** `scripts/gate-one-product.mjs` loads every served
   student page at 390 and 1280 in light and dark and fails when a page: lacks
   the shell or the logo; shows another logo or the old wordmark; renders text
   in a family outside the three (exam screen and drawn figures excepted by
   list); paints a page or card background, heading or button outside the
   token palette; has a button or link target under 44 px; lacks the door or
   tool header; scrolls sideways; or logs a console error. It ratchets per
   page in waves 1 and 2 and runs strict in the release sweep, where every
   student page must pass.

Default taken for an open explainer call (Thomas can override): when a
question draws a molecule without hydrogens, its explainer picture matches the
question's drawing and adds the implied hydrogens as labeled marks, so the
student sees the same molecule in both places (pilot item OC-3).

## Auto-approve (Thomas, 2026-10-30)

Thomas: "Auto approve everything if it helps and then I'll go through it and
have my friend go through it as well." For the one-shot build (Nov 2026) every
plan decision takes the recommended default, and content does not wait for
item-by-item sign-off: free-test explainers, true-to-life Bio views, coach
lines, planner defaults and the Retold redraws. Thomas and a reviewer he
chooses go through everything afterward on a review page. This changes the
timing of "Sign-off" above, not its rails, which stay and are not his to waive
implicitly:

- **Independent review and gates on every served item, no samples.** Each
  explainer, figure change, override and correction passes the build and
  render gates and a separate review agent that solves the item blind from the
  served question alone. An item the reviewer finds uncertain or in error is held, never shipped; at most two
  fix rounds, then hold.
- **Answer keys never change silently.** A suspected bad key goes to
  `docs/explainers/key-disputes.json` with both answers and the reasoning; the
  item shows "Key under review" and its explainer is held. Only Thomas edits a
  bank key, in its own commit.
- **The stamp.** Every auto-approved item carries
  `"stamp": "auto-approved 2026-10-30, pending Thomas review"` and a SHA-256
  checksum over the sidecar file, its rendered SVG at 390 and 1280 px, and the
  source of each renderer it draws with. A later change to any of them voids
  the stamp, so a picture cannot drift after review.
- **Only a matching stamp renders.** The player checks the stamp at runtime,
  the build gate fails a release tree that serves a sidecar without one, and
  `scripts/deploy-clean.sh` strips draft, held, reviewer-blocked and unstamped
  sidecars from the deploy folder.
- **One-tap Pull.** Every stamped item is listed on the review page with a
  comment box and a Pull (a correction of a known factual error gets a comment
  box only, because a pull would restore the error). A pull never fails open:
  if the pull list cannot be read, the item falls back to the bank's own
  explanation. No student data appears on the review page.

## Shared header (2026-11)

- AceTheDAT is one product under one login: Study (this repo), Coaching (the
  portal) and Apply share one logo, one look and one header.
- The portal header may link to Study and to Apply. The Apply link shows only
  for a student who holds an application package. The portal still never
  fetches or shows application data; Apply keeps its own data.
- Release order: Study ships its student-visible changes in one release (Wed
  Nov 11, a fix deploy allowed until Fri Nov 13, 22:00 ET); after that Study
  takes only corrections and pulls until Dec 4. Coaching takes security first,
  then the look; Apply and the site follow once their deploy path is confirmed.
- Test-window rule: a student is in window from 14 days before the test to 3
  days after. Inside it nothing the student uses moves, hides or changes
  behavior (no login, route, navigation entry, default, test screen, form,
  list, weekly plan or Retold night change). Look changes (logo, colors, fonts,
  header style), a label renamed in its own slot, and corrections of mistaken
  content may land. Nothing in the November release reads the device test date
  to decide a default.
