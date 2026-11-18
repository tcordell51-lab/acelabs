# AceTheDAT — Social Launch system

The repeatable system behind the **DAT in 60 Seconds** launch. Everything here is
single-file, static, and brand-true (forest green `#1f3d2e`, brass gold `#b8923d`,
cream `#f3eee1`, deep pine `#15291d`, ink `#243b30`; Playfair Display + DM Sans;
no em dashes; wordmark = "Ace The" cream + "DAT" gold).

No auto-posting is built. Posting is always a human action (Meta Graph API was
intentionally skipped).

## What's here

| File | What it is |
|---|---|
| `caption-tool.html` | **Caption Studio.** Concept + hook + link in → on-screen hook, keyword-rich caption, lowercase hashtags, pinned comment out. Copy-each or copy-whole-package. Persists inputs to localStorage. |
| `calendar.html` | **Content Calendar.** Pre-seeded with the four-week plan. Log saves + shares per post; surfaces the top-performing pillar. Persists to localStorage. |
| `posts/01..10-*.md` | The first 10 post packages. One file per post: format, hook, beat sheet, visual note, caption, hashtags, pinned comment, production checklist. Grab one and shoot it. |
| `DESIGN-SPECS.md` | Brief for **Claude Design** (Tommy): series bumper, score-win graphic, team spotlight, soft-offer graphic. Dimensions, copy, colors, type, layout. |
| `MANUAL-CHECKLIST.md` | Tommy's `[MANUAL]` actions: launch-day posting, headshots, Meta Business Suite, per-video CapCut workflow, caption proofing watchlist. |
| `stills/*.png` | Rendered 9:16 (1080×1920) hook visuals for the V-ONLY episodes. |
| `stills/src/*.html` | Source for each still. Edit, then re-render (below). |

## Free-tool links used in posts
- Orgo reaction maps (roadmap) → https://acelabs.netlify.app/tools/ochem/
- Orgo · CARDIO acidity ladder → https://acelabs.netlify.app/tools/ochem/#acid-base-cardio
- Orgo · EAS directing breakdown → https://acelabs.netlify.app/tools/ochem/#aromatic
- Gen Chem periodic trends → https://acelabs.netlify.app/tools/gc/trends.html
- QR pattern system → https://acelabs.netlify.app/tools/qr/qr-pattern-system-v1.html
- Strategy call / contact → https://acethedat.com/contact.html
- Team → https://acethedat.com/team.html

The O Chem and Gen Chem posts (1, 5, 7, 9) and their stills are grounded in the
actual Ace Labs tool content: the **CARDIO** acidity framework (Charge, Atom,
Resonance, inDuction, Orbital), the EAS "4-word rule" + halogen exception, and the
ionization-energy anomalies (Be > B, N > O) the trends tool drills.

> Note: there is no dedicated PAT keyhole tool in Ace Labs yet. Post 2 points to
> the Ace Labs home until one exists.

## Re-rendering the stills

The PNGs are committed, but if you edit a `stills/src/*.html`, re-render with the
headless Chromium that ships in the web environment:

```bash
cd labs/social/stills
/opt/pw-browsers/chromium --headless --no-sandbox --disable-gpu \
  --force-device-scale-factor=1 --window-size=1080,1920 \
  --default-background-color=00000000 \
  --screenshot=NAME.png src/NAME.html
```

(Locally, any headless Chrome works: `chrome --headless --screenshot=...`.)

## Workflow

1. Pick a post in `posts/`. Record per the beat sheet (`[MANUAL]`).
2. Use `caption-tool.html` to finalize the caption/hashtags/pinned comment, or
   take them straight from the post file.
3. Edit in CapCut, drop in the matching `stills/*.png` as the hook frame, proof
   the science terms, export clean 9:16.
4. Post natively to FB + IG Reels + TikTok. Paste the pinned comment.
5. Log saves + shares in `calendar.html`. Double down on the top pillar.

Grounded in the launch brief: saves/shares are the #1 signal, original native
uploads only, 80% value / 20% promo, captions mandatory (proof the science terms).
