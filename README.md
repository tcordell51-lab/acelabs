# Ace Labs · DAT Mastery System

The unified DAT prep system from AceTheDAT. Four standalone engines (Quantitative Reasoning, Biology, Gen Chem, Organic Chem) under one shell with cross-tool dashboard, unified Survey-of-Natural-Sciences mock, and (eventually) portal weekly-plan integration.

## Quick start

```
open ace-labs.html
```

Or via local server (faster cache invalidation when iterating):

```
npx serve . -l 4000
# then open http://localhost:4000/ace-labs.html
```

## Layout

```
AceDAT-AceLabs/
├── ace-labs.html              # Home page (the shell)
├── shared/
│   ├── ace-labs-shell.css     # Brand vars + home-page layout
│   └── ace-labs-shell.js      # Cross-tool localStorage aggregator
├── tools/
│   ├── qr/                    # QR Remediation (Sarah · 31 visuals · 963 problems)
│   │   ├── index.html
│   │   └── tiktoks/           # TikTok library + bespoke + voiceover studio
│   ├── bio/                   # Bio Engine (Riya · 6 hubs · 500-Q mock bank)
│   │   ├── index.html         # bio-engine.html → hub
│   │   ├── bio-cell.html
│   │   ├── bio-genetics.html
│   │   ├── bio-physiology.html
│   │   ├── bio-diversity.html
│   │   ├── bio-devo.html
│   │   ├── bio-evolution.html
│   │   ├── bio-shared.css
│   │   └── bio-shared.js
│   ├── gc/                    # GC Remediation (Tommy · 38 visualTypes · 605 problems)
│   │   ├── index.html
│   │   └── tiktoks/
│   └── ochem/                 # OChem Reaction Maps (Tommy · 10 hubs · 27 animations)
│       └── index.html
├── unified-mock.html          # (Phase 2) cross-tool Survey of Natural Sciences mock
└── README.md
```

## Source-of-truth projects

The 4 tools are **copies** snapshotted from their source projects. To re-sync after upstream changes:

| Tool | Source project |
|---|---|
| QR | `~/Documents/Claude/Projects/AceDAT-QR-Remediation/` |
| GC | `~/Documents/Claude/Projects/AceDAT-GC-Remediation/` |
| Bio | `~/Documents/Claude/Projects/ACEDAT CONTENT/bio-*.html` + `bio-shared.{css,js}` |
| OChem | `~/Documents/AceDatPortal/public/ochem-reaction-maps.html` |

Re-sync command (overwrites local copies):

```bash
cd ~/Documents/Claude/Projects/AceDAT-AceLabs
cp ~/Documents/Claude/Projects/AceDAT-QR-Remediation/qr-remediation-system-v2.html tools/qr/index.html
cp -r ~/Documents/Claude/Projects/AceDAT-QR-Remediation/tiktoks tools/qr/
cp ~/Documents/Claude/Projects/AceDAT-GC-Remediation/gc-remediation-system-v1.html tools/gc/index.html
cp -r ~/Documents/Claude/Projects/AceDAT-GC-Remediation/tiktoks tools/gc/
for f in bio-engine bio-cell bio-genetics bio-physiology bio-diversity bio-devo bio-evolution bio-shared.css bio-shared.js; do
  cp "$HOME/Documents/Claude/Projects/ACEDAT CONTENT/${f%.css}${f%.js}.html" "tools/bio/" 2>/dev/null
done
cp ~/Documents/Claude/Projects/ACEDAT\ CONTENT/bio-engine.html tools/bio/index.html
cp ~/Documents/AceDatPortal/public/ochem-reaction-maps.html tools/ochem/index.html
# then re-strip ochem portal-script tag (see CHANGES below)
```

## Standalone-build modifications

- **OChem:** the portal `<script src="/study/student-scope.js"></script>` was removed (it's portal-only). Re-add it if hosting under the portal.

## Cross-tool localStorage aggregation

`shared/ace-labs-shell.js` reads each tool's namespace and rolls up to the dashboard:

| Tool | localStorage prefix | What's read |
|---|---|---|
| QR | `qr-rem-v2:` | `mastery` (per-skill state), `lastSession`, `sr-due` |
| GC | `gc-rem-v1:` | same shape |
| Bio | `bio-engine:` | (placeholder — bio-engine writes its own keys; shell reads what it can) |
| OChem | `ochem:` | (placeholder — actual prefix may vary) |

If a tool hasn't been opened yet, it shows fallback totals (37 / 37 / 40 / 30 modules respectively).

The cross-tool mock writes its own key `al:lastMock` for the home dashboard.

## Phases

- **Phase 1 (this commit):** scaffold + home page + 4 tool tiles + dashboard.
- **Phase 2:** `unified-mock.html` — 100Q SoNS mock (40 Bio + 30 GC + 30 OChem) with composite score predictor.
- **Phase 3:** OChem content buffs — lab techniques hub, acid/base hub, enolate deep dive, Hofmann/Cope animations, +300 MCQs, 40Q OChem mock.
- **Phase 4:** Cross-tool spaced-repetition queue + portal weekly-plan integration.

## What lives where

The home page (`ace-labs.html`) is the only "Ace Labs"-specific surface. Each tool retains its own internal pedagogy, sidebar, and state; Ace Labs is the meta-shell that links them, surfaces aggregate progress, and provides the cross-tool mock + (future) cross-tool spaced-rep queue.

This means: **internal changes to QR, Bio, GC, OChem can be made in their source projects and copied in.** Ace Labs doesn't fork or re-invent any of them.
