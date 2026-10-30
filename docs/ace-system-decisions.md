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
- Explainers are written in Thomas's coaching voice. The voice reference is built from his own words (Retold coach lines, trick scripts, acethedat.com copy, his emails to students: voice patterns only, no student details) and lives at docs/thomas-voice-codex.md once written.

## Sign-off

Thomas signs off every true-to-life view and every new batch of explainers with
a 10-minute checklist before students see it. Nothing new reaches students
without his approval.

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
