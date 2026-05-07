# AceLabs Tutor Mode — Design Specification

**Status:** Design spec only. No production code in this document.
**Date:** 2026-05-06
**Author:** Thomas Cordell / AceTheDAT

---

## 1. Purpose

AceLabs is currently a self-study tool. Students open it, work through modules, and their progress lives in their own browser's localStorage. Tutors have no visibility, no way to assign work, and no feedback loop between sessions.

This spec defines the design for Tutor Mode: the layer that turns AceLabs into an actual tutoring tool — one where a tutor can assign content, monitor progress, and send guidance without requiring manual reporting from the student.

Stage 1 target: Thomas, Sarah, Tommy, Riya, Farwa, and Antonia using this inside their existing practices. Their combined roster is roughly 30–75 students on any given week. Stage 2 (passive income) is addressed in Section 7.

---

## 2. Personas

### 2.1 Tutor

Six tutors in Stage 1. Their needs are different from each other in subject (Sarah does PAT/QR only, Farwa is App-only, Riya handles Bio), but their workflow needs around student management are identical.

**What a tutor wants from Tutor Mode:**
- A roster of their students in one place, without having to ask students what they worked on
- The ability to say "do this before Tuesday" and have it show up for the student
- A quick view of where a student actually is — which modules are mastered, what the last mock looked like, where the score is sitting
- A way to send a light recommendation between sessions without texting or emailing ("hey work on QR Module 12 before we meet")
- No busy work. The tutor is already managing sessions, scheduling, and content delivery. This tool should reduce overhead, not add it.

**Frustrations to avoid:**
- Another thing to log into and keep updated
- Dashboards that require manual data entry to be useful
- Any system that requires the student to "report" back — the student already did the work, that should be enough

### 2.2 Student

An existing AceTheDAT tutoring student. Already enrolled. Has a real test date — usually 8–16 weeks out. Working with a tutor they trust. Anxious about the test in ways that a clean interface helps manage.

**What a student wants from Tutor Mode:**
- To know their tutor sees their work and cares — but not to feel watched
- Their tutor's assignment to be visible without hunting for it
- A calm, clear way to complete assigned work and move on
- No pressure language, no urgency theater, no countdown timers on assignments
- The ability to leave a quick note for their tutor ("I found this hard") without it feeling like a formal report

**What a student does not want:**
- To feel like every click is being logged
- To see anything that reminds them of money, their plan, what they've paid, or what they owe
- To manage their tutor relationship through a tool — the tool should feel like a light extension of the tutor's care, not a surveillance system

---

## 3. Core Workflows

### 3.1 Tutor: Assign Content

1. Tutor opens AceLabs at `/tutor/`
2. Tutor selects their identity from a pre-seeded list (v1: no auth — just name/email selection from a list; more on this in Section 5)
3. Tutor sees their student roster: name, test date, last-active timestamp
4. Tutor clicks a student to open their detail view
5. Student detail shows:
   - Diagnostic results (which sections were run, scores)
   - Last 5 mock attempts (date, score, subject breakdown)
   - Per-tool mastery: how many modules mastered / in progress / untouched in QR, Bio, GC, OChem
   - Weak topics (derived from mastery data — modules where mastery is 0 or partial after multiple attempts)
   - Recently completed pages (last 5–10 events, with timestamps)
6. Tutor clicks "Assign content"
7. Tutor picks content type: drill module (specific module in QR/Bio/GC/OChem), mock (cross-section or single-section), cheat sheet, or a specific page
8. Tutor optionally sets a due date
9. Tutor optionally adds a note (pre-written templates available; tutor can also free-type)
10. Assignment is saved. It will appear as a banner on the student's next AceLabs visit.

### 3.2 Tutor: Send a Nudge

A nudge is lighter than an assignment. It's a message that appears on the student's home screen without requiring content completion.

1. From the student detail view, tutor clicks "Send nudge"
2. Tutor picks from a template or writes a short note:
   - "Try the cheat sheets before our session [day]. — [Tutor name]"
   - "Good work this week. Keep going with [module]. — [Tutor name]"
   - "We'll pick up with [topic] on [day]. No need to push hard before then. — [Tutor name]"
3. Nudge saves. Student sees it on their home screen on next visit.
4. Nudges expire after the session date (or after 7 days if no date is set).

### 3.3 Tutor: Monitor Progress

The student detail view is the primary monitoring surface. Tutors do not need real-time alerts in v1 — they look before a session.

What the view surfaces:
- Assignment status: was the assigned content completed? When?
- Reflection note: did the student leave a note? Show it verbatim.
- Progress trend: mastery delta since the last session (how many new modules moved from partial to mastered)
- Mock trend: if multiple mocks are in history, show score trajectory (not just the last one)
- Cards due: how many spaced-rep cards are overdue across tools (a proxy for "is the student doing their reps?")

### 3.4 Student: Receive and Complete Assignments

1. Student opens AceLabs (ace-labs.html)
2. If there is an unread assignment, a calm banner appears on the home screen:
   - "[Tutor name] sent you something for [due date]."
   - "[Content title]" with a button to open it
   - If there's a note from the tutor, it appears below the title in the tutor's voice
3. Student can dismiss the banner temporarily ("I'll get to it") or open the content directly
4. Student completes the assigned module / mock / drill
5. On completion, the tool's normal completion flow runs (mastery update, ace card, reflect prompt)
6. An additional prompt appears: "Want to leave a note for [Tutor name]? (optional)" — free text, short
7. The reflection note and completion timestamp are stored. The tutor sees them on next view.
8. The assignment banner is cleared from the home screen.

### 3.5 Progress Sync

In v1, sync is one-directional pull: the tutor's view reads the student's data when the tutor opens the detail view. No push notifications, no real-time updates, no email alerts. The tutor looks before the session. That's enough for Stage 1.

The mechanism depends on which integration option is chosen (see Section 4). But the conceptual model is the same across all options: the student's localStorage (or backend record) is readable by the tutor without the student having to do anything extra.

---

## 4. Integration Options

Three viable paths. Each has honest pros and cons.

### Option A: Standalone /tutor/ Route (localStorage-Only)

**How it works:** Add a `/tutor/index.html` route inside AceLabs. The tutor "logs in" by selecting their name from a list. All student data is read from localStorage on the same device. Assignments are written to a shared localStorage key (`al:assignments`). Students open AceLabs on the same device, and the assignment banner reads from that key.

**Pros:**
- Fastest to build — no backend, no auth, no API
- Completely offline
- No new infrastructure

**Cons:**
- Does not work across devices. If the tutor assigns from their laptop, the student needs to open AceLabs on that same laptop (or export/import data). This is nearly useless in practice for any student who uses their own machine.
- No actual isolation between tutors — anyone can select any tutor name
- All student data lives on one device, which means if the tutor's machine dies, all student data is gone
- Doesn't scale beyond a demo or in-person session use case

**Effort estimate:** 1–2 weeks. The UI and routing are straightforward; the localStorage schema for assignments is simple. But the device coupling makes this a dead end, not a v1.

**Verdict:** Useful only for in-person tutoring where the student is sitting at the tutor's computer. Not a real product path.

### Option B: AceTheDAT Portal Integration (Bridge Approach)

**How it works:** The tutor-facing side lives in the AceTheDAT portal (acethedat-portal.netlify.app), which already has the student roster, scheduling, and session history. AceLabs publishes student progress events to a predictable localStorage key or URL endpoint that a lightweight bridge script in the portal can read. Assignments flow from the portal into AceLabs via a shared key or a small serverless function.

**Pros:**
- Tutor experience is in the portal where they already work (roster is already there, no new login)
- Portal already has student identity, test dates, and session records — no re-building that model
- AceLabs student experience stays in AceLabs; the bridge is invisible to the student
- Lower risk of breaking AceLabs (additive, not invasive)
- Portal safe-extension rules already defined — new routes and selectors only, provider is frozen

**Cons:**
- Requires work in two codebases (AceLabs + portal)
- Cross-device sync still requires the bridge to post data somewhere — localStorage alone doesn't cross devices, so a small backend (even just a serverless function writing to a KV store or Airtable) is needed to make the cross-device problem go away
- The portal is a separate repo with its own deploy cycle; changes there are independent of AceLabs

**Integration sketch:**
- AceLabs publishes a `al:tutor-sync` localStorage key (or POSTs to a lightweight endpoint) on every significant state change: module completion, mock attempt, mastery update
- Portal has a new `/students/:id/acelabs` route that reads this data and renders the student detail view
- Portal writes assignments to Airtable (already the source of truth for student records) or to a small KV store; AceLabs reads assignments from the same endpoint on load
- Authentication stays in the portal; students access AceLabs as-is (no login required on the student side in v1)

**Effort estimate:** 4–8 weeks end-to-end. The portal side (new route + Airtable reads) is 2–3 weeks. The AceLabs publishing side (progress events + assignment banner) is 1–2 weeks. The bridge endpoint (serverless function or Airtable API calls) is 1–2 weeks. Testing across devices is 1 week. This is realistic for a solo developer working part-time across the two repos.

**Verdict:** The right path for Stage 1. Builds on existing infrastructure, keeps AceLabs lean, and the portal already has everything the tutor side needs.

### Option C: Backend First (Firebase or Supabase)

**How it works:** Build auth, user records, and data storage from scratch using a cloud backend. Tutor and student each have accounts. All progress syncs to the backend in real time. True cross-device, multi-user, production-grade.

**Pros:**
- Real product. Cross-device, multi-user, secure, scalable.
- Unlocks Stage 2 (passive income, self-service students) without a major re-architecture
- Student can log in from any device; tutor can assign from anywhere
- Paves the way for push notifications, in-app messaging, and analytics

**Cons:**
- Minimum 6–10 weeks to do correctly — auth, data model, security rules, testing
- Requires maintaining a backend (cost, uptime, security updates)
- Changes the student experience: students currently need no login. Adding auth adds friction.
- AceLabs currently has zero backend dependencies; this changes the architecture fundamentally

**Effort estimate:** 6–10 weeks minimum for a production-ready v1. More if auth edge cases (password reset, device management, token expiry) need polish. If Firebase is chosen, $0–$50/month at Stage 1 scale; scales cost-linearly beyond that.

**Verdict:** The right architecture for Stage 2. Not the right starting point for Stage 1.

### Recommendation: Option B, with Option C as a planned upgrade path

Start with Option B: portal-side tutor view + AceLabs progress publishing + a thin Airtable or serverless bridge for cross-device sync. This uses existing infrastructure, respects the portal's safe-extension rules, and delivers a real tutor workflow within 6–8 weeks.

Plan the data model in Option B as if it will eventually be lifted into Option C. Specifically: design the `al:tutor-sync` event schema to match what a Supabase or Firebase document would look like (keyed by student email, timestamped events, typed payloads). When Stage 2 arrives, the migration is a backend swap, not a redesign.

---

## 5. Minimum Viable Tutor Mode (v1)

### 5.1 Tutor Login

No auth in v1. A pre-seeded list of tutor identities (name + email). The tutor selects their name, and the app remembers the selection in localStorage. This is not secure — it is intentionally lightweight for Stage 1 where all tutors are known individuals in a single practice.

Tutor identities to seed:
- Thomas Cordell
- Sarah (QR / PAT)
- Tommy (GC / OChem)
- Riya (Bio)
- Farwa (App)
- Antonia

When Option C is built, this list becomes a real auth flow. The tutor-side data model does not change.

### 5.2 Roster View

The tutor's home screen shows their student roster. Each student card shows:
- Full name
- Test date (days remaining if within 60 days)
- Last active in AceLabs (timestamp, relative: "2 days ago")
- Assignment status: any pending assignments, whether they've been completed
- Quick-glance mastery: a small 4-bar indicator showing rough mastery level across QR / Bio / GC / OChem (green = 75%+, yellow = 25–75%, red = under 25%, grey = no data)

Roster is sorted by: upcoming test date first, then by last active (most recently active first).

### 5.3 Student Detail View

Clicking a student opens their detail view. Sections:

**Summary bar:**
- Name, test date, days remaining
- Active tutor (which of the six tutors owns this student — relevant if Thomas assigns across multiple coaches)

**Diagnostic results:**
- Which diagnostic was run, when, raw score per section
- Flagged sections (any section below the 40th percentile threshold, derived from score tables in the system)

**Mock history (last 5):**
- Date, total score, per-section breakdown
- Score trend: if 2+ mocks, show delta from first to last

**Module mastery:**
- Per-tool breakdown: X of Y modules mastered, Z in progress, rest untouched
- Weak topics: any module attempted 2+ times without reaching mastered status — listed by name
- Recently completed: last 5 module completions with timestamps

**Assignments:**
- Any active assignments with status (pending / completed / overdue)
- Past completed assignments with completion date and student reflection note (if any)

**Actions:**
- "Assign content" button
- "Send nudge" button

### 5.4 Assignment Flow

Tutor clicks "Assign content":

1. Choose content type:
   - Drill module (pick a specific QR / Bio / GC / OChem module from a searchable list)
   - Mock (cross-section or specify which sections)
   - Cheat sheet (reference to a specific page in the tool)
   - Free URL (for any other AceLabs page)

2. Set optional due date (date picker, defaults to blank / no due date)

3. Add optional note (tutor's voice):
   - Free text (140 char limit to keep it conversational)
   - Or pick from a template:
     - "Work through this before our session [day]."
     - "This covers what we talked about — try it while it's fresh."
     - "Don't worry about the score, just get through it."
     - "Focus on understanding the pattern, not getting it right."

4. Confirm. Assignment writes to:
   - The portal's Airtable base (linked to student record) — if Option B
   - Or a `al:assignments` JSON array in the tutor's synced store — if Option A (not recommended)

5. AceLabs reads the assignment on the student's next load (polling the Airtable endpoint or reading from a cached fetch).

### 5.5 Student-Side Assignment Banner

On load, AceLabs checks for pending assignments for the current student identity (identified by a student ID stored in localStorage from their initial setup, or by email if they've opted into portal login).

If an assignment exists:

- A calm banner appears below the home dashboard header, above the tool tiles
- Banner text: "[Tutor name] has a recommendation for you."
- Below: the content name, with a direct link to open it
- Below that (if a note was included): the tutor's note, in plain text, attributed with "— [Tutor name]"
- If a due date was set: "Suggested by [due date]." (not "Due by" — avoid deadline pressure language)
- Two actions: "Open it" (primary) and "I'll come back to it" (secondary, collapses the banner but keeps the assignment active)

Banner styling: uses existing `al-` CSS variables, no new color tokens. Calm background (existing `--al-panel` or similar), no red, no urgency. Consistent with the anxiety-aware design principles already documented in `ANXIETY_AWARE_DESIGN.md`.

### 5.6 Completion and Reflection

When the student completes the assigned content (module / mock / cheat sheet), the normal tool completion flow runs first. After it, if the module was assigned by a tutor, an additional lightweight prompt appears:

> "Want to leave a note for [Tutor name]? This is optional."

Text area, max 280 characters. A "Send note" button and a "Skip" link. Both clear the prompt. The note (if submitted) is stored with the assignment record. The tutor sees it verbatim in the student detail view.

The completion timestamp is written automatically. The tutor does not need to ask "did you do it?" — the detail view shows it.

---

## 6. Student-Side Experience Principles

These govern every student-visible surface in Tutor Mode. They extend the existing principles in `ANXIETY_AWARE_DESIGN.md`.

**No surveillance language.** The banner and reflection prompt should never feel like check-ins or accountability tools. "Your tutor has a recommendation" — not "your tutor is watching your progress." The student knows their tutor sees their work. That's the deal. Don't narrate it.

**No payment or plan language.** Nothing student-visible mentions cost, package, installment, balance, remaining sessions, or anything adjacent to money. If the portal does payment tracking, that stays entirely on the tutor side.

**No pressure framing.** "Suggested by [date]" not "Due by [date]." "When you have time" framing in nudges. The tutor's note is the primary tone-setter; the UI should match the tutor's register, not override it with urgency.

**Calm completion acknowledgment.** When the student finishes an assigned module, acknowledge it simply: "Done. [Tutor name] will see this." No confetti, no score anxiety, no performance pressure. The student worked; that's enough.

**Reflection is genuinely optional.** The reflection prompt appears once. If the student skips it, it does not reappear, it does not log as a missed action, and the tutor does not see "student declined to reflect." It simply shows no note. Silence is fine.

**Tutor recommendations feel like a text from someone who knows you.** The nudge templates and note interface should produce messages that sound like the tutor wrote them — because in v1, they did. The UI adds no wrapper language that would make it feel more formal or institutional.

---

## 7. Future: Passive Income Mode

This section sketches the architecture path from Stage 1 (tutoring practice tool) to Stage 2 (passive income product). No pricing design here.

### 7.1 What Changes

Stage 1 is fully tutor-gated. A student uses AceLabs because their tutor uses it with them. There is no self-service path — no way for a student to sign up without a tutor.

Stage 2 opens a direct student path. A student can create an account, access AceLabs, and prepare for the DAT without a tutor. Tutors can still exist as an optional add-on.

### 7.2 Architecture Path

**Auth becomes real.** Option C (backend) is a prerequisite for Stage 2. Students need accounts to access their own data from any device. Tutors need verified identities (not a dropdown). The localStorage-only model does not survive Stage 2.

**Tiered access:**
- Free tier: limited mock attempts per month, basic drill access, no tutor assignment features
- Paid tier: full mock bank, all drills, AI explanation layer (if built), calibration tracking, full history
- Tutor-paired tier: everything in paid, plus the student is linked to a real tutor who can assign and monitor — the existing Stage 1 model, now wrapped in a self-service enrollment flow

The tutor-paired tier is a premium feature. Tutors can either be AceTheDAT tutors (Thomas, Sarah, etc.) or eventually external tutors who want to use the platform with their own students.

**Coach marketplace (long-term):** A student on the paid tier can browse and book a session with a real tutor through the platform. The platform handles booking; the tutor delivers sessions off-platform (Zoom, in-person). Revenue split at the platform's discretion. This is a classic marketplace model.

**Content stays the same.** The four tool engines (QR, Bio, GC, OChem) do not change architecture to support Stage 2. They get an auth-aware wrapper that checks entitlements before surfacing restricted content. The tool internals remain unchanged — this is an access layer, not a content redesign.

**Analytics layer.** Stage 2 needs aggregate analytics to understand conversion (free to paid), engagement, and diagnostic accuracy. This is a backend concern, not a tool concern. Design the event schema in Stage 1 (Option B bridge) so Stage 2 analytics can be applied retroactively to the same event stream.

**No PII in tool analytics.** Student identity stays in the auth layer (Supabase/Firebase). The event stream that drives analytics uses opaque student IDs — not names, emails, or test dates. Joining events to identity is a backend-only operation, not something embedded in the tool payloads.

---

## 8. Privacy and Data

### 8.1 Stage 1 (localStorage + Bridge)

- Student progress lives in the student's browser localStorage by default
- The bridge (Option B) reads this data and writes it to Airtable under the student's existing record
- No PII is written to the event payloads beyond what is already in the portal (student email as identifier)
- Students see a plain disclosure on first AceLabs load if they are portal-linked: "Your tutor can see your progress in AceLabs when you're working with them." No legalese, just plain English.
- Tutors can only see students on their own roster (enforced via Airtable row filtering by tutor field)

### 8.2 Stage 2 (Backend)

- Minimum data collection: email, test date, tool events (module completions, mock scores, timestamps)
- No behavioral tracking beyond what is pedagogically necessary (no cursor tracking, no time-on-page analytics beyond session duration)
- Encrypted transit (HTTPS only)
- Data deletion: a student can delete their account and all associated data. This should be a one-step action in settings.
- Student opt-out of tutor visibility: a student can revoke their tutor's access to their progress data at any time. The tutor is notified ("Student has opted out of progress sharing") but does not see why. This should be rare — the entire tutor relationship is consensual — but the option must exist.

### 8.3 What the Tutor Cannot See

Even with full access, a tutor should never see:
- The student's reflection notes from non-assigned sessions (if a student uses AceLabs outside of tutor assignments, those reflections are private unless the student explicitly shares them)
- The student's data from other tutors (if a student switches tutors, the new tutor starts fresh)
- Any financial data (that lives in the portal, not in AceLabs)

---

## 9. Build Plan and Effort Estimates

### v1 Scope (Option B Recommendation)

| Component | What it is | Effort |
|---|---|---|
| Tutor identity selector | Pre-seeded list, localStorage persistence | 0.5 days |
| Portal: new /students/:id/acelabs route | Read AceLabs data for a student, render detail view | 5–8 days |
| AceLabs: progress event publisher | On module/mock completion, write to `al:tutor-sync` key + POST to bridge endpoint | 3–5 days |
| Bridge endpoint | Serverless function (Netlify Function or Airtable script) that reads AceLabs events and writes to Airtable student record | 3–5 days |
| Assignment writer (portal-side) | Form in portal to create assignment, write to Airtable | 3–5 days |
| Assignment reader (AceLabs-side) | On load, fetch pending assignments for this student, render banner | 3–4 days |
| Nudge templates | Portal UI for selecting / writing nudges, student-side display | 2–3 days |
| Reflection prompt | Post-completion prompt, store with assignment record | 1–2 days |
| Student disclosure copy | One-time "your tutor can see your progress" message | 0.5 days |
| Testing across devices and tutors | End-to-end flows for all 6 tutors + sample students | 5–7 days |

**Total estimated effort:** 26–40 days of focused development. At part-time pace (3–4 days/week), this is 7–10 weeks. At full-time pace, 5–8 weeks.

### Prerequisites Before Building

1. Confirm which Airtable fields will store AceLabs events (extend existing student record or create linked Events table — recommended: linked Events table to keep student record clean)
2. Confirm student identity scheme: how does AceLabs know which student is using it? Options: (a) student selects their name on first open (same pre-seeded list approach as tutor), (b) student follows a magic link from the portal, (c) student is identified by a URL param set by the tutor. Option (b) is cleanest and scales to Option C later.
3. Confirm portal safe-extension rules apply: new route at `/students/:id/acelabs` is additive; reading from Airtable via existing PAT is already established. No provider changes required.

---

## 10. Open Questions

Before implementation begins, these need answers:

1. **Student identity in AceLabs (v1):** Pre-seeded name list, magic link from portal, or URL param? This decision affects the entire assignment delivery mechanism.
2. **Airtable schema:** New linked Events table or extend student record with JSON fields? Events table is cleaner and allows querying by type / date; JSON on student record is faster to build.
3. **Bridge endpoint host:** Netlify Functions (already used by portal) or a standalone worker? Netlify Functions are the path of least resistance given the portal is already there.
4. **Assignment expiry:** How long does an unread assignment stay active? Recommendation: until completed, or until tutor manually removes it. No automatic expiry except nudges (7 days).
5. **Multi-tutor students:** If a student works with both Sarah (QR/PAT) and Thomas (all sections), do both tutors see all of the student's AceLabs data, or only section-relevant data? Recommendation: tutors see all data but can only assign within their specialty sections. Thomas (covers all) sees everything.
6. **Roster ownership:** Which tutor "owns" a student for roster purposes? Recommendation: use the "Primary tutor" field already in the portal (or add it if not present). A student can appear on multiple tutors' rosters if they have multiple active coaches.
