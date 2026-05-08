# Agent W8 — Tutor-in-the-Loop Products

Lane: how other education + coaching products integrate human tutors into a student-facing tool. Reference target: AceLabs QR tool with Sarah as named QR tutor.

## Surveyed: 7 products

### Schoolhouse.world (Sal Khan's free peer tutoring)
- Tutor dashboard organized by program/subject. No rich per-student record.
- Live Zoom drop-in; no per-student note system that follows the learner.
- No assignment-push; curriculum is external (College Board).
- Notable: certification gate (can't tutor until you pass) + post-session learner rating loop.

### Yup (yup.com) — text-based on-demand math tutoring (shut down Feb 2025)
- Session begins when student photos a problem; tutor receives photo and asks probing questions.
- Two-way whiteboard with annotation/draw on the problem image.
- **Classroom teacher loop is the novel part:** real-time usage, per-session transcripts, AI tutor summaries, weekly reports. Teacher can give "instructional guidance to students AND tutors" inside the platform.
- Tutors rubric-graded after each session (Socratic method enforced).
- **Transferable:** per-session AI summary as the unit of communication, not raw transcript. Published rubric keeps pedagogy consistent.

### Brainly Tutor
- Live tutor matched in <11 sec. Unit of context = the problem the student brings.
- Async + sync: free community Q&A (~24 subjects) → paid live tutoring with whiteboard.
- 2M+ live sessions by 2022.
- **Transferable:** async-first → sync-on-demand funnel. Sarah should be the **escalation lane**, not the default.

### Khanmigo (richest tutor-loop dataset)
- **Full chat history per student** in teacher dashboard.
- **Summarize Student Chat History** — generative AI tool: teacher asks "what has Maya been struggling with?" → synthesized digest across all student's chats.
- **Class Snapshot** — aggregated class-level view.
- **Recommended Assignments** — AI proposes targeted assignments based on observed gaps; teacher approves and pushes.
- Two-tier moderation: safety-flagged → teacher email; severe → admin.
- **Most transferable feature in entire survey:** AI-generated per-student summary on demand. Sarah should not have to read every QR session. Plus: AI-proposes-assignment, tutor-approves push.

### Eureka Math² Digital
- "Analyze" workspace: classroom reports + individual reports (per-student misconceptions, family-communication notes).
- **Per-item teacher comments** anchored to specific student work, follow into year-long portfolio.
- Students see comments inside their to-do list view.
- **Transferable:** anchored notes (note attached to *specific question/attempt*, not module) is stronger than module-level notes.

### Newsela
- **Annotation conversation** is the standout pattern.
- Both teacher and student can highlight passages and leave annotations.
- Teacher can reply to student's annotation → back-and-forth thread anchored to specific paragraph.
- Students see teacher's annotations alongside their own as they read.
- Teacher inserts annotations *before* student reads (priming) and replies *after* (feedback). Both interventions live inside student's reading view.
- **Cleanest "teacher visible inside student tool" pattern in the survey.**

### Future / Tempo / Tonal (embedded fitness coaching)
- **Future:** named coach, $199/mo. Coach pushes weekly plan + audio messages playing at start of each workout + post-workout video recaps + scheduled FaceTime check-ins. Daily check-in messages.
- **Tempo:** CV-based. Trainer sees 3D-tracked form per rep. Async escalation for form review.
- **Tonal:** algorithmic, recorded coach personas. Cautionary tale — removing human entirely loses relationship even if product is excellent.
- **Transferable from Future:** rich pre-session and in-session messages from named coach (audio at start, post-session recap) — high-leverage intervention points, not the dashboard.

## Common patterns across all 7

1. **Two-tier context model:** "now" view (current session/problem) + "longitudinal" view (across sessions). Tutors live in now-view; longitudinal is summarized.
2. **Anchored notes.** Best-in-class teacher notes are anchored to specific artifact (paragraph, problem, exercise) — not module/course.
3. **AI summarization between AI/student and tutor.** Tutor never reads raw stream.
4. **Async escalation lane.** Human is escalation, not default.
5. **Pre-session priming + post-session recap.** Bracket the work with named-coach voice; middle is mostly machine-driven.
6. **Rubric-evaluated tutoring.** Yup and Schoolhouse publish rubric tutors are graded on. Keeps pedagogy consistent at scale.
7. **Tutor identity is named and persistent.**

## Anti-patterns

1. Raw transcript dumping — Khanmigo's full history is unusable without summary.
2. Module-level notes — Newsela/Eureka show unit is the question, not module.
3. Live-only tutoring with no async artifacts (Schoolhouse).
4. Over-automating coach away (Tonal).
5. Symmetric rich-text editor for tutor and student (Newsela's annotation thread is constrained).
6. No moderation/escalation surface (Khanmigo's two-tier alerts are part of why districts trust it).

## 6 concrete Sarah-mode features for AceLabs

1. **Per-student summary view, AI-generated, on-demand.** Sarah opens "Maya" → 6-line digest: items struggled this week, items mastered, recurring misconception themes, last attempt timestamp, last Sarah note. Modeled on Khanmigo's *Summarize Student Chat History*.

2. **Item-anchored Sarah notes (not module-anchored).** Sarah leaves a note on QR question #47 (or specific attempt). Student sees Sarah's note inline when re-encountering. Modeled on Newsela + Eureka. Upgrade of current "per-module Sarah notes" proposal.

3. **Tutor-approved assignment push.** AceLabs proposes next-week QR plan based on student gaps; Sarah approves/edits/rejects in one screen and pushes. She does not author from scratch. Modeled on Khanmigo Recommended Assignments.

4. **Pre-session voice memo + post-session recap.** Sarah records 30-sec voice memo that plays when student opens next QR session, plus auto-drafted recap (AI-written, Sarah-approves) after each session. Modeled on Future + Tempo.

5. **Stuck-signal escalation lane.** Student spends >X minutes on item / retries N times / self-flags confused → item-level alert in Sarah's queue with artifact attached. Sarah responds async (annotation reply) or schedules 10-min sync. Modeled on Khanmigo two-tier alerts + Brainly escalation funnel.

6. **Sarah-rubric, visible.** Publish what "good QR tutoring" looks like (e.g., "asks probing questions before showing the worked solution"). Anchors Sarah's behavior, brand asset for students. Modeled on Yup + Schoolhouse.

## Critique of current AceLabs Sarah-mode

- *Sarah-mode toggle*: good, matches named-coach pattern. Keep.
- *Edit mode*: underspecified. If it lets Sarah reshape question content = content authorship not tutoring. If it lets her annotate / override / add a hint to a specific question for a specific student = tutoring. **Latter is higher-leverage** per Newsela/Eureka.
- *Per-module Sarah notes*: too coarse. Evidence consistently favors item-anchored. Keep module-level as fallback for general advice; primary unit should be item-level.
- *Missing*: per-student summary, tutor-approved assignment push, pre/post voice memo, stuck-signal queue, published Sarah rubric.

## Sources

- Schoolhouse Help Center: https://intercom.schoolhouse.world/en/articles/9961273-your-schoolhouse-journey
- Schoolhouse Tutor Certification: https://schoolhouse.world/certification/about
- Yup Wikipedia: https://en.wikipedia.org/wiki/Yup_Technologies
- Yup Two-way whiteboard: https://yup.com/teacher-announcements/two-way-whiteboard/
- Brainly Tutor: https://brainly.com/online-tutoring
- Khanmigo View Student Chat History: https://support.khanacademy.org/hc/en-us/articles/15127248640525
- Khanmigo Teacher Reports: https://support.khanacademy.org/hc/en-us/articles/29473549307277
- Khanmigo Flagged Conversation Handling: https://support.khanacademy.org/hc/en-us/articles/14394569357069
- Eureka Math² Digital Platform: https://greatminds.org/math/eurekamathsquared/digital-platform
- Newsela Annotations: https://support.newsela.com/article/annotations/
- Newsela Working with Student Annotations: https://support.newsela.com/article/working-with-student-annotations/
- Future: https://future.co/
- Tempo Fit: https://tempo.fit/
- Tonal: https://tonal.com/
- Tutor.com Socratic Method: https://www.tutor.com/articles/socratic-method-tutoring

## Executive summary

Across 7 products spanning peer tutoring (Schoolhouse), on-demand homework help (Yup, Brainly), AI tutoring (Khanmigo), school curriculum (Eureka, Newsela), and embedded fitness coaching (Future, Tempo, Tonal), the dominant pattern is the same: the human tutor lives in a **summarized, anchored, async** surface, and shows up **named and synchronously** only at high-leverage moments. The best products do not ask the tutor to read everything; they pre-digest student state into a tutor-readable view and let the tutor act on it with one click.

The single most underrated feature is **Khanmigo's Summarize Student Chat History** — AI-generated, on-demand digest of what a specific student has been doing and struggling with, written for the tutor. It is the unsexy connective tissue that makes tutor-in-the-loop tractable at scale. Without it the tutor either skims raw transcripts or guesses. **For AceLabs, building a Sarah-readable per-student summary should outrank Sarah-mode toggle polish, item-level annotations, and even the assignment-push loop, because it is the foundation every other Sarah feature stands on.** Build that first; the rest compounds on top.
