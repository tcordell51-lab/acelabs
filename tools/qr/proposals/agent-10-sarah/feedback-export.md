# Feature 4 — Feedback flow → backlog file

## Current state (audit)

- `#fbPill` (line 1645 of master) opens `#fbModal` (lines 1648-1675).
- `FEEDBACK` controller (lines 10153-10223) writes notes to `localStorage` under the key `qr-rem-v2:feedback-log` as `[{t, tag, text, ctx}]`.
- `FEEDBACK.exportLog()` (line 10199) **already produces a markdown file**: it builds a `.md` document, copies it to the clipboard, and triggers a download named `sarah-feedback-YYYY-MM-DD.md`.
- The export button is **openly visible** in the modal as `Export & email log`.
- The pill icon is `<span>💬</span>` — **violates Thomas's no-emoji rule**, flag for cleanup.

## Proposed change — hidden admin gesture

Drop the visible "Export & email log" button. Replace it with a hidden gesture so a casual student opening the modal sees only a quiet log of their own notes (not a power-user export tool).

### Gesture options (pick one)

1. **Triple-tap the modal's `<h3>` title** within 1.2 seconds — reveals an admin row.
2. **Hold the feedback pill for 1.5s** before the modal opens — reveals the admin row inside the modal.
3. **URL hash `#admin`** — if `location.hash === '#admin'` on load, the export controls are visible from the start. (Simplest; recommended.)

### Recommended: hash gesture + keyboard shortcut

```js
function isAdminMode(){
  return location.hash === '#admin' || ST.get('adminUnlocked', false);
}
// Keyboard: Shift+? then E (within 600ms) to unlock for the session
document.addEventListener('keydown', e => {
  if (e.shiftKey && e.key === '?') window._fbWaitE = Date.now();
  if (e.key === 'e' && window._fbWaitE && Date.now() - window._fbWaitE < 600){
    ST.set('adminUnlocked', true);
    NOTICE.show('Admin gestures unlocked for this session');
    window._fbWaitE = null;
  }
});
```

In `FEEDBACK.open()`, check `isAdminMode()` and only render the export/clear row if true.

## Export format

The current export is fine but let's tighten it for backlog grooming:

```markdown
# QR tool feedback backlog

Exported 2026-05-07 14:32 · 7 notes from 2 sessions

---

## 1. [trap] · 2026-05-06 10:14
**Page:** Percent change
**Body:**
Students keep dividing by the new value. The current trap card is too short — it
needs a worked example showing the exact mistake side-by-side with the right move.

---

## 2. [bug] · 2026-05-06 10:21
**Page:** Rate × time
**Body:**
The "play worked example" button on rate-time doesn't scroll the page — you click
it and nothing visible happens. Probably a missing scrollIntoView.

---
```

### Schema additions to consider

When backlogging notes, two extra fields would help Thomas triage:

| Field | Source | Reason |
|---|---|---|
| `triaged` | bool, defaults false | Lets Thomas mark a note as read/handled without deleting it |
| `priority` | 'now' \| 'soon' \| 'later' | Set in the modal when admin mode is on |

Backwards-compatible: any existing `feedback-log` entries without these fields just default to `triaged:false, priority:null`.

## Auto-export option

Optional next-pass behavior: when the count reaches 10 unread notes, surface a soft inline prompt at the top of the modal: "10 notes saved. [Export to markdown]". No alert, no nag. Just a one-line cue Thomas can dismiss.

## File naming

Current naming `sarah-feedback-YYYY-MM-DD.md` is good but the source isn't always Sarah — students leave notes too. Rename to:

- `qr-feedback-YYYY-MM-DD.md` (default)
- Or `qr-feedback-YYYY-MM-DD--N-notes.md` if note count is meaningful for diff'ing successive exports

## TL;DR

1. Hide the export button behind `#admin` URL hash or a keyboard combo.
2. Add `triaged` + `priority` fields, backwards-compatible.
3. Rename the file to drop "sarah-" since both tutor and students can author notes.
4. Replace the pill emoji with the existing speech-bubble SVG used elsewhere in the app — Thomas's rule.
