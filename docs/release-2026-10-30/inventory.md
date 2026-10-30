## Biology: tools/bio/ (17 pages) and tools/bio-retold/ (1 page, 14 nights by ?night=N)

I inventoried 18 HTML pages: the Bio Repair Lab home, six topic hubs, two Bio checks, the 3-hour A&P review, the Immune Cells map, Micrographs, Bonus Topics, the Repair Sheet, Analytics, the 60-day plan, a TikTok render and Bio Retold. Each page got a 390x844 phone screenshot, and the two Bio checks were run through to their results screen.

What works:
- Every page returns 200 and none logs a console error on load. Bio Retold night pages log 15 audio 404s each: they look for narration that does not exist yet (OChem and GChem have audio folders, Bio does not).
- The Pulse check (25 questions) and the Weakness scan (40 questions) both run start to finish on a phone and send misses into Ace Cards.

Pages broken or awkward on a phone:
- The TikTok render (sliding-filament-tiktok) forces a 1080px viewport, so a phone sees a cropped corner. It has no nav, and the Structure & Function hub links to it.
- The A&P review scrolls sideways (page is 994px wide on a 390px screen) because its tables do not fit.
- The 60-day plan scrolls sideways (825px wide) because its 7-column calendar does not fit; only 3 days show.

Content bug: the Genetics Punnett Solver shows every genotype in the ratio panel as "AA". The CSS rule `.gen-ratio-row .lbl{text-transform:uppercase}` in bio-shared.css turns Aa and aa into AA.

Shared problems on the hub pages (bio-shared.js and the sidebar):
- On a phone the dark sidebar (brand plus build-progress bars) fills the top 40% of every hub before any content.
- A student-visible "Coach mode" toggle sits next to a "Restart" button that wipes all Ace Cards. Its confirm text still says "Restart all 20 nodes".
- A floating gold "C" coach-tips button covers the right edge of text and buttons.
- Build counters are stale and disagree with each other. The source list (bio-registry.js) has 57 topics, 51 finished and 6 partly built, but hub headers say "0 / 7 live" (Diversity, Evolution), "0 / 4" (Development), "2 / 9" (Genetics) and "11 / 11" (Structure & Function, which has 13).
- Genetics and Structure & Function still say "flagship coming".

Labels that are wrong or inconsistent:
- The Today page (ace-labs.html, lines 725-726) has the two Bio check labels swapped: the 40-question scan is labelled "Bio pulse check" and the 25-question check is labelled "Bio weakness scan".
- The sidebar calls the Pulse check 24 questions; the page says 25.
- The Repair Lab home says the scan is "40 questions in 30 minutes", but the scan is untimed by default.

Pages no door links to: the 3-hour A&P review, Analytics and the 60-day plan are reachable only from the Repair Lab sidebar. The shell lights Learn for the A&P review, but the Learn page never lists it.

Bio Retold works well on a phone but has gaps:
- Its intro tells students to "watch the videos", and there are none.
- A Teach mode button is visible to students. It unlocks every scene and shows the "Coach line" notes.
- It links only to the Repair Lab home, not to the hub topic that matches each night.

Screenshots: /tmp/claude-0/-home-user/d13d0ec6-4383-5048-8c7c-ddae9950f2ae/scratchpad/inventory/shots/
Scripts: /tmp/claude-0/-home-user/d13d0ec6-4383-5048-8c7c-ddae9950f2ae/scratchpad/inventory/bio/
Scrolled and results-screen shots (Retold night 1, the two checks, Genetics Punnett) are in the bio scripts folder.

### Organization notes

How a student should meet Biology, by door:

LEARN (first time through a topic). The entry point for a new student is "Bio, Retold". It is already built into the Learn page from shared/ace-index.js. Put two things beside it:
- "A&P Test-Week Review (3 hours)". Fix its tables first. It is the natural partner to Retold nights 13-14.
- The two one-page sheets, "Bio Repair Sheet" and "Bonus Topics". They belong with Cheat sheets and Quick refreshers in Learn, not in Practice.
- Each Retold night should end with a deep link to its matching hub topic. The registry already has the topic IDs, for example night 4 goes to bio-cell.html#node-glycolysis. Today every night links only to the Repair Lab home.

PRACTICE (repair what you missed). Use one front page, the Bio Repair Lab (/tools/bio/), with the six hubs as cards in DAT order. Give each hub one plain name and use it everywhere:
- Cell and Molecular
- Genetics
- Body Systems: today it is called "Structure & Function", "Physiology" and "Body Systems Lab" on different screens. Pick one.
- Diversity of Life
- Development
- Evolution and Ecology

Drop the nicknames (Cell Lab, Cell Atlas, Genetics Studio, Field Guide, Embryo Atlas, Selection Simulator) or keep them only as subtitles. Nest the small tools under their hub:
- Immune Cells goes under Body Systems, next to its Immune tab.
- Micrographs goes under Cell and Molecular.

The Practice card's "More" row has 10 bio links today. Cut it to the six hubs.

On a phone, collapse the dark sidebar into a drawer so hub content comes first. Hide from students:
- the Coach mode toggle
- the Restart button: move it into a settings menu, because it wipes all Ace Cards
- the "live / partial / planned" counters and the Coverage matrix
- the floating "C" button, or make it smaller

TESTS. Merge the 25-question Pulse check and the 40-question Weakness scan into one "Bio check" with a Short or Full choice. They do the same job: a fixed set of questions across the six hubs that ends in a list of topics to repair. Fix the swapped labels on Today. Drop "30 minutes" from the Repair Lab home.

REVIEW. Bio misses already reach Review through Ace Cards (the bio-engine adapter in ace-progress.js). Fold Bio Analytics into /performance/ rather than keeping a separate bio-only dashboard.

HIDE OR RETIRE:
- sliding-filament-tiktok.html is a 1080x1920 TikTok render. Remove the "See also" link in the Structure & Function hub, or move the file out of the student tree.
- bio-calendar.html is a bio-only 60-day plan that ignores the other five sections and overflows on a phone. Hide it, or fold its pacing into the cross-section plan on Today and onboarding.
- Bio Retold's "Teach mode" button should appear only on a coach link, for example ?coach=1.

Fix before showing Thomas: the Punnett genotype labels (AA, Aa and aa all display as AA), the stale "flagship coming" copy, and the stale "0 / 7 live" counters.

| url | title | door | status | for the student | problems |
|---|---|---|---|---|---|
| /tools/bio/ | Bio Repair Lab · AceTheDAT | practice | rough | The Bio home base: Ace Cards due today, log a miss from your question bank and get sent to the right repair topic, and jump into the six topic hubs, the checks and the sheets. | On a phone the sidebar of build-progress bars fills the first screen; student-visible Coach mode toggle; Restart button next to Ace Cards wipes everything (confirm says '20 nodes'); dev 'live/partial/planned' Coverage matrix; says scan is '40 q in 30 min' but it is untimed; floating C button covers text |
| /tools/bio/bio-cell.html | Cell & Molecular Biology · AceTheDAT Bio | practice | ready | The Cell and Molecular hub: 13 interactive tabs (cell atlas, bioenergetics, enzyme kinetics, DNA fork, transcription and translation, transport, signaling and more) plus 19 repair topics with traps and retrieval. | Shared hub problems: sidebar comes first on a phone, Coach mode toggle, Restart, floating C; page is very long (about 118,000px on a phone); sidebar counts disagree with the home page (17 nodes live vs 17/19) |
| /tools/bio/bio-genetics.html | Genetics · AceTheDAT Bio | practice | rough | The Genetics hub: Punnett solver, pedigree analyzer, Hardy-Weinberg, linkage, operon, karyotype, chi-square, epistasis and more, plus 9 repair topics. | Punnett ratio panel shows every genotype as 'AA' (text-transform uppercase on .gen-ratio-row .lbl); hero still says 'Punnett Lab flagship coming' and '2 / 9 live'; shared hub problems |
| /tools/bio/bio-physiology.html | Structure & Function · AceTheDAT Bio | practice | rough | The body-systems hub: 18 tabs (body map, cardiac cycle, oxygen curve, nephron, sliding filament, endocrine, action potential, immune, bone and more) plus 13 repair topics. | Hero still says 'Body Systems Map flagship coming' and '11 / 11 live' (the registry has 13); three names for one hub (Structure & Function, Physiology, Body Systems Lab); about 88,000px long on a phone; links the TikTok render; shared hub problems |
| /tools/bio/bio-diversity.html | Diversity of Life · AceTheDAT Bio | practice | rough | The Diversity hub: tree of life, plant evolution, animal phyla, cladogram builder, viruses, bacteria, fungi, protists and body plans, plus 6 repair topics. | Hero counter reads '0 / 7 live' although all 6 topics are live; shared hub problems |
| /tools/bio/bio-devo.html | Developmental Biology · AceTheDAT Bio | practice | rough | The Development hub: embryo timeline, germ-layer tracker, fertilization, cleavage types, Hox genes, extra-embryonic membranes and twins, plus 5 repair topics. | Hero counter reads '0 / 4 live'; 1 of 5 topics only partly built; shared hub problems |
| /tools/bio/bio-evolution.html | Evolution & Ecology · AceTheDAT Bio | practice | rough | The Evolution and Ecology hub: allele and drift simulators, selection modes, speciation, biomes, cycles, population growth, predator-prey and Hardy-Weinberg word problems, plus 5 repair topics. | Hero counter reads '0 / 7 live'; 2 of 5 topics only partly built; sidebar says '5 nodes live' but the home page says 3/5; shared hub problems |
| /tools/bio/bio-immune-cells.html | Innate vs Adaptive Immunity · AceTheDAT Bio | practice | ready | A tap-any-cell map of innate and adaptive immune cells, with filters and a card per cell giving origin, function, markers and the test trap. | Own header nav (Home, Bio hub, Physiology, Mock, Cheat sheets) unlike the other bio pages; 'Hover to highlight' copy on a touch screen; washed-out 'Stuck? Take a beat' button; missing from the Repair Lab sidebar |
| /tools/bio/bio-micrographs.html | Micrograph ID-style practice · AceTheDAT Bio | practice | rough | Eight flip cards: name the organelle from a drawn micrograph-style picture and mark the ones you know cold. | Pictures are crude line sketches, not micrographs (a wave in an ellipse for a mitochondrion); only 8 cards; narrow column on a phone; misses do not feed Ace Cards |
| /tools/bio/bio-bonus.html | Bonus Topics · AceTheDAT Bio | practice | ready | Nine short cards on rare but tested topics (CRISPR, aneuploidy and more), each with why it matters and key bullets, for skimming in test week. | A reading page sitting under Practice; on a phone the sidebar comes first and the column is narrow |
| /tools/bio/bio-repair-sheet.html | Bio Repair Sheet · AceTheDAT | practice | ready | Twelve 'if the stem says X, think Y, avoid Z' trap cards, each linked to its repair topic, with a compact cram view for test week. | A cram sheet sitting under Practice; on a phone the sidebar comes first |
| /tools/bio/bio-diagnostic.html | Bio Pulse Check · AceTheDAT | tests | rough | A 25-question untimed check across the six hubs that ends with a per-hub breakdown and the list of topics to repair first; misses become Ace Cards. | Two Bio checks that do the same job; the sidebar says 24q, the page says 25; label swapped on Today; results jargon ('covered-section signal') |
| /tools/bio/bio-mock.html | Bio Weakness Scan · AceTheDAT | tests | ready | A 40-question bio scan with confidence marks, flags and a question jump bar; the results list missed, fragile and flagged questions, each with a repair link, and feed Ace Cards. | Label swapped on Today; Repair Lab home says '40 questions in 30 minutes' but the scan is untimed; file is called bio-mock but it is not a mock |
| /tools/bio/bio-ap-bootcamp.html | Ace The DAT — A&P 3-Hour Review Session | learn (shell rule only; no door page lists it) | rough | A self-paced 3-hour anatomy and physiology review: 12 timed sections with diagrams, mnemonics and fill-in-the-blank, ending in a scored quiz that flags weak systems. | Page scrolls sideways on a phone (994px wide; tables and bold text overflow); no h1; the shell lights Learn but the Learn page never links it; only reachable from the Repair Lab sidebar |
| /tools/bio/bio-calendar.html | 60-day Plan · AceTheDAT Bio | practice | rough | Pick a test date and get a bio-only 60-day calendar of which hub topic to study each day, with review days and mock days. | 7-column grid overflows on a phone (825px wide, only 3 days visible); a bio-only plan that ignores the other five sections; reachable only from bio sidebars |
| /tools/bio/bio-analytics.html | Analytics · AceTheDAT Bio | practice | rough | Bio progress from this device: topics mastered by hub, stalled topics, 14-day activity and Ace Card stats. | Separate bio-only dashboard; jargon ('place enzymes', 'partial nodes'); narrow column on a phone; reachable only from bio sidebars |
| /tools/bio/sliding-filament-tiktok.html | Ace The DAT — Sliding Filament | none | internal | A 1080x1920 auto-playing vertical animation of one cross-bridge cycle, made to record for TikTok. | The 1080px viewport crops it on a phone (shows only a corner, no scrolling); no shared nav or back link; a marketing asset linked from a student hub |
| /tools/bio-retold/ | Bio, Retold — Night 1 · The Structure-Function Contract | learn | ready | The 14-night Biology course in Thomas's voice, built on 'structure tells you function': each night walks scenes with drawings and a question you must answer to move on, plus spaced mixed review. | Each ?night=N page logs about 15 audio 404s (no Bio narration, unlike OChem and GChem); intro says 'watch the videos' but there are none; Teach mode button visible to students (unlocks every scene, shows coach lines); links only to the Repair Lab home, not the hub topic for each night |

## Chemistry: tools/gc/ (Gen Chem engine, companion drills, TikTok players), tools/gchem/ (GChem, Retold), tools/organic/ (OChem, Retold), tools/ochem/ (Reaction Maps, decide/, roots/, tree/, summit/, v2/), chem games (games/chirality/, Game Central gchem and ochem rounds), and all of tricks/ (all 14 tricks are chemistry)

52 chemistry URLs inventoried, each with a phone screenshot (390x844 at 2x). Counts: 16 ready, 25 rough, 3 legacy, 8 internal. No student page is broken. The two dev harnesses throw errors, but they are internal.

The best-built material is the OChem ladder (Roots, Tree, Summit), plus OChem, Retold, GChem, Retold, Recognition Lab, Periodic Trends, Common Traps, Chirality Bench and the trick shorts and sheets. All of these work well on a phone.

The weak spots:
- **Gen Chem engine (/tools/gc/)** is the main Gen Chem practice tool, and it is rough on a phone:
  - two onboarding modals stack on the first visit;
  - skipping them jumps the page about 33,000 px down to a blank area;
  - the floating "Menu" and "Note" buttons cover text;
  - students can see the coach "Edit Mode" and "Coach-Mode" toggles.
- **Lewis Sandbox** overflows to 489 px after a molecule is picked.
- **OChem Reaction Maps** opens behind a welcome modal, and its floating buttons overlap headings. It also overlaps heavily with the Tree, but it is still the "review" target in mini-test remediation.
- **v2 course engine** is half "IN DEVELOPMENT", its header overflows, and the Tree plus OChem, Retold replace it. It is still linked from Practice and Today as "Classic course engine".
- **The 13 trick videos** play silent: every page 404s on /tricks/videos/voiceover/<tip>/manifest.json. They also show the TikTok prompt "comment your pick, answer at the end" to students.
- **The Trick Library landing page (/tricks/)** is a marketing email-capture page ("Free. No login"). Learn and Today label it "All sections", but it is chemistry only.
- **GChem, Retold** has coach narration only for nights 1 to 6 and part of 7. Nights 8 to 14 have none, and each of those nights logs about 14 audio 404s. OChem, Retold has narration for all 13 nights.
- **TikTok players**: the hand-crafted Gen Chem TikToks and topic-tiktok are 1080x1920 recording canvases. They work inside the engine's Watch modal and the mini-test iframe, but opened directly on a phone they are cropped.
- **Duplicates**: the two topic-tiktok players are copies of each other, and there are three separate voiceover studios.
- **Internal files served publicly**: specs, research and coach guides under tools/gc/*.md, tools/gc/research/, tools/ochem/*.md and the audio generator scripts are all served (HTTP 200). The netlify.toml blocklist does not cover them.

### Organization notes

Organize chemistry as two subject rooms, General Chemistry and Organic Chemistry. In each room the same four steps appear in the same order: Learn it, Practice it, Prove it, Quick refreshers.

ORGANIC CHEMISTRY (the strongest set; present it as one climb)
- Best entry point: OChem, Retold night 1 (/tools/organic/). Then the ladder: The Roots of Organic (Learn), The Tree of Organic (Practice), The Summit (Tests). These three already cross-link and share one design. Name the whole thing "The Climb: Roots, Tree, Summit".
- The Two Decisions is a static reading page with no interactive check. Show it as a chapter inside Learn, next to Roots. Today, Learn links it while the shell highlights Practice. The Tree has the same mismatch: it is linked from Learn but highlights Practice. Pick one door per page: Retold, Roots and Decisions under Learn; Tree, Chirality Bench and the OChem Game Central round under Practice; Summit under Tests.
- Chirality Bench should be linked from the stereochemistry modules of the Tree and Roots level 3, not only from Game Central.
- OChem Reaction Maps (/tools/ochem/): rename it to "Reaction Map (reference)", drop the welcome modal and keep it as a lookup page. It should stop being called an engine. Before demoting it, repoint the mini-test remediation "review" link (tools/minitests/remediation-map.js and tools/mock/full.js) to the Tree or Roots.
- Hide the v2 course engine and its EAS TikTok. Remove the "Classic course engine (v2)" chips on Practice and Today.

GENERAL CHEMISTRY
- Best entry point: GChem, Retold night 1 (/tools/gchem/), then the Gen Chem engine (/tools/gc/).
- Fix the engine on phones before showcasing it:
  - one setup step, not two stacked modals;
  - no scroll jump after the setup is skipped;
  - hide Edit Mode and Coach-Mode from students;
  - stop the Menu and Note buttons from covering text.
- Fold its four companion tools into the engine as tabs, named plainly: Lewis and VSEPR Sandbox, Recognition Lab, Periodic Trends, Common Traps. Common Traps is a misconception reference and also fits under Review.
- Fix the Lewis Sandbox overflow.
- Record narration for GChem, Retold nights 8 to 14 to match OChem.
- Keep the TikTok players only as embedded videos inside the engine and the mini-test fixes. Never link them as standalone pages, and merge the two duplicate topic-tiktok players into one.

CHEM TRICKS (Learn, Quick refreshers)
- Rename "The trick library, All sections" to "The 14 Chem Tricks".
- For enrolled students, replace the marketing landing page (email form, "Free, no login") with a plain index. Show each trick once, with its three formats side by side: 40-second short, full video, one-page sheet. Today the formats sit in three separate galleries (shorts/, videos/, sheets.html), with the old TikTok series player on top.
- Before release:
  - add voiceover to the trick videos or label them silent;
  - hide the "comment your pick" social prompt by default, not only with ?embed=review;
  - fix sheets.html, which still links to the retired series/ redirect.

HIDE FROM STUDENTS
- /tools/gc/tiktoks/ (index, scripts.html, voiceover-studio.html)
- tricks/series/voiceover-studio.html and tricks/videos/voiceover-studio.html
- tools/ochem/roots/dev.html, tools/ochem/tree/dev.html and tools/ochem/tree/smiles.html
- tricks/series/ (keep the redirect only)
- tools/ochem/v2/
- Add tools/gc/*.md, tools/gc/research/, tools/ochem/**/*.md and tools/*/audio/*.mjs to the netlify.toml blocklist.

NAMES
- Use "General Chemistry" or "Gen Chem" and "Organic Chemistry" or "OChem" everywhere. Retire "GC tool", "GChem engine", "Orgo" and "Classic course engine".
- Keep the brand names that already work: Retold, Roots, Tree, Summit, Chirality Bench, Recognition Lab.

| url | title | door | status | for the student | problems |
|---|---|---|---|---|---|
| /tools/gc/ | Gen Chem engine · Ace Labs | Practice (main Gen Chem card; Today files it under Learn > Engines that teach) | rough | The Gen Chem skill tree from sig figs to electrochemistry: diagnostic, daily set, weekly plan, module lessons with embedded TikTok explainers, drills and a diagnosis for every miss. | Two stacked onboarding modals on first visit; skipping jumps the page ~33,000px to a blank area; Menu/Note floating buttons cover text; coach-only Edit Mode and Coach-Mode toggles visible to students; 1.4 MB page; 80 placeholder coach-trick entries |
| /tools/gc/lewis-sandbox.html | Lewis Sandbox · Gen Chem · Ace Labs | Practice (More chips; also engine Companion tools) | rough | Build Lewis structures for 18 molecules in five checked stages (valence electrons, bonds, lone pairs, geometry, polarity), with tiers that unlock. | After picking a molecule the tier list overflows to 489px on a phone (cards cut off at right) |
| /tools/gc/recognition-lab.html | Recognition Lab · Gen Chem · Ace Labs | Practice (More chips; engine Companion tools) | ready | A timed visual speed drill on the diagrams the DAT reuses (reaction coordinates, titration curves, phase diagrams, VSEPR shapes), with mixed, topic and weakness modes. | Start Drill button sits below the mode cards (easy to miss); legacy inner al-nav still in markup |
| /tools/gc/traps.html | Common Traps · Gen Chem · Ace Labs | Practice (More chips; engine Companion tools) | ready | A searchable reference of 1,815 wrong-answer explanations from the Gen Chem bank, grouped into 74 misconception clusters. | Trap cards overflow 18px (page width 408 at 390), slight sideways scroll; very long page (205k px); fits Review better than Practice |
| /tools/gc/trends.html | Periodic Trends · Gen Chem · Ace Labs | Practice (More chips; engine Companion tools) | ready | A periodic-table heatmap of every trend plus a five-second speed drill on the anomalies and an iso-electronic ranker. | Heatmap shows only about six groups at phone width; copy says hover, which a phone cannot do |
| /tools/gc/tiktoks/ | Ace The DAT — TikTok Library | none (URL only; linked from scripts.html) | internal | Production library of all 34 Gen Chem TikToks with Watch and Record VO buttons for making social videos. | Production tooling (Record VO, ?face= overlay); uses an emoji; no shell; served publicly |
| /tools/gc/tiktoks/buffers-hh-tiktok.html | Ace The DAT — Buffers Are Ratios (HH) | none (embedded in Gen Chem engine Watch modal) | rough | A 75-second animated explainer on Henderson-Hasselbalch: buffers are ratios. | 1080x1920 recording canvas meant for an iframe; opened directly on a phone it is cropped (viewport width=1080, initial-scale=1); voice is browser TTS behind 'Click to enable voice' |
| /tools/gc/tiktoks/gibbs-quadrant-tiktok.html | Ace The DAT — Gibbs ΔG 4-Quadrant Map | none (embedded in Gen Chem engine Watch modal) | rough | An 80-second animated explainer reading the sign of delta G from the signs of delta H and delta S. | Embed-only 1080x1920 canvas, cropped when opened directly on a phone; TTS voice |
| /tools/gc/tiktoks/ksp-common-ion-tiktok.html | Ace The DAT — Common-Ion Kills Solubility | none (embedded in Gen Chem engine Watch modal) | rough | A 70-second animated explainer on the common-ion effect and Ksp. | Embed-only 1080x1920 canvas, cropped when opened directly on a phone; TTS voice |
| /tools/gc/tiktoks/lewis-five-steps-tiktok.html | Ace The DAT — Lewis in 5 Steps | none (embedded in Gen Chem engine Watch modal) | rough | An 85-second animated walk-through building CO2's Lewis structure in five steps. | Embed-only 1080x1920 canvas, cropped when opened directly on a phone; TTS voice |
| /tools/gc/tiktoks/q-vs-k-tiktok.html | Ace The DAT — Q vs K Direction | none (embedded in Gen Chem engine Watch modal) | rough | A 73-second animated explainer: Q tells the direction, K tells the destination. | Embed-only 1080x1920 canvas, cropped when opened directly on a phone; TTS voice |
| /tools/gc/tiktoks/weak-acid-sqrt-tiktok.html | Ace The DAT — Weak = Square Root | none (embedded in Gen Chem engine Watch modal) | rough | A 73-second animated shortcut for weak-acid pH using the square root of Ka times C. | Embed-only 1080x1920 canvas, cropped when opened directly on a phone; TTS voice |
| /tools/gc/tiktoks/scripts.html | Ace The DAT — TikTok Voiceover Scripts (all 34) | none (URL only) | internal | Voiceover script sheet for recording the 34 Gen Chem TikToks. | Production material; words run together ('arefree', 'Twoforces'); 16px horizontal overflow; no shell |
| /tools/gc/tiktoks/topic-tiktok.html | Ace The DAT — Topic TikTok | none (embedded: Gen Chem engine Watch modal for 29 templated modules, mini-test remediation) | rough | A templated animated explainer for any Gen Chem skill, chosen with ?topic=<skill>. | Blank 'No topic loaded' without ?topic=; embed-only 1080x1920 canvas, cropped when opened directly on a phone; TTS voice |
| /tools/gc/tiktoks/voiceover-studio.html | Ace The DAT — Voiceover Studio | none (URL only) | internal | Production studio for recording voiceover scene by scene on the Gen Chem TikToks. | Production tool with no 'crew only' banner, unlike the other two studios |
| /tools/gchem/ | GChem, Retold — Night 1 · The Two Questions | Learn (course card built in JS from shared/ace-index.js; also Today) | ready | The 14-night Gen Chem course in Thomas's voice, one chapter set per night, built on two questions: how much, and which way. | Coach narration only for nights 1 to 6 and part of 7; nights 8 to 14 have none and log ~14 audio 404s per night; not linked from the Practice door |
| /tools/organic/ | OChem, Retold — Night 1 · The Only Reaction | Learn (course card built in JS; also Practice More chip and Today) | ready | The 13-night Organic course in Thomas's voice, every reaction told as electron-rich attacks electron-poor, with narrated scenes. | Also linked from Practice as 'OChem, Retold (the course)', which blurs the doors |
| /tools/ochem/ | Ace The DAT — Organic Chemistry Reaction Maps | Practice (More chip 'Reaction maps'; Today lists it under Learn > Engines that teach) | rough | A single-page reaction map of every functional group, with hubs, step-through mechanisms, a Stereo Lab, a reagent predictor and a 30-question timed block. | Welcome modal on open; hamburger button and floating 'OChem, Retold' pill overlap headings; 2.4 MB page; still the mini-test 'review' target although the Tree is the main OChem practice engine |
| /tools/ochem/decide/ | The Two Decisions · Ace Labs | Learn (OChem foundations card; shell highlights Practice; also Practice More chip and Today) | ready | Two decision trees you can run on any question: how two stereo drawings are related, and SN1, SN2, E1 or E2. | Door mismatch (Learn card, Practice highlight); header nav wraps into ragged columns on a phone; reading-only despite 'run the decisions' copy |
| /tools/ochem/roots/ | The Roots of Organic · Ace Labs | Learn (OChem foundations; also Practice More chip, Today, mini-test 'Fix the root') | ready | Eighteen foundation roots (skeletal structures, charge, acidity, resonance, stereo) in three levels, each with a drawing you manipulate, a trap and a check. | Long first-screen intro before the first interaction |
| /tools/ochem/roots/dev.html | Root dev harness | none (URL only) | internal | Developer harness that renders a single root module. | Blank without a root param: 404 on roots/null.js plus a dynamic-import page error |
| /tools/ochem/tree/ | The Tree of Organic · Ace Labs | Practice (main OChem card; also linked from Learn and Today; ace-route.js OChem drill target) | ready | The OChem practice engine: 31 modules (trunk reagents, arrow-pushing branches, synthesis canopy, spectroscopy evidence) where you predict, draw and check. | Also listed on Learn while the shell highlights Practice; very long single page (149k px) |
| /tools/ochem/tree/dev.html | Tree module dev harness | none (URL only) | internal | Developer harness that renders a single Tree module. | Blank without a module param: 404 on modules/null.js plus a dynamic-import page error |
| /tools/ochem/tree/smiles.html | smiles probe | none (URL only) | internal | Developer probe that draws a few SMILES structures. | Dev test page; 980px wide; no shell |
| /tools/ochem/summit/ | The Summit · Ace Labs | Tests (also Practice More chip and Today > Prove) | ready | A fresh 30-question organic section weighted like the 2026 DAT: untimed first, then timed; every miss points to its move and its root. |  |
| /tools/ochem/v2/ | Ace Labs · Organic Chemistry (v2 course engine) | Practice (More chip 'Classic course engine (v2)'; Today drawer chip) | legacy | An older 20-module OChem course on a prerequisite tree; about half the modules are marked 'In development' or 'Soon'. | Many modules unfinished; header overflows to 413px and cuts off the Reset button; still promoted to students |
| /tools/ochem/v2/tiktoks/eas-directors-tiktok.html | Ace The DAT — EAS Directors (who aims where) | none (linked only from v2) | legacy | An animated LPOP explainer on which EAS substituents direct ortho/para versus meta. | 1080x1920 canvas, cropped on a phone; no shell |
| /games/chirality/ | Chirality Bench · Ace Labs | Practice (own card; Today > Play) | ready | Ten quick items: spot the stereocenter, call R or S, rate your confidence, then turn a 3D model to see why. | Auto-scrolls past the nav and title on load; 3D bench labels overlap the hint text |
| /games/play.html?subject=gchem | Ace Game Central — Play | Practice (via Game Central /games/) | ready | A 12-question timed Gen Chem round with a streak and a personal best. | Formulas written without subscripts (CH3COOH, CH3COO-) |
| /games/play.html?subject=ochem | Ace Game Central — Play | Practice (via Game Central /games/) | ready | A 12-question timed OChem round with drawn structures, from the 1,000-question OChem bank. | Large white structure tiles push the answer choices far below the fold on a phone |
| /tricks/ | The 14 DAT Tricks — Ace the DAT | Learn (Quick refreshers 'The trick library'; Today > Refreshers) | rough | Landing page for the 14 chemistry tricks (10 OChem, 4 Gen Chem), with buttons to the shorts, videos and sheets. | Marketing lead magnet with an email-capture form and 'Free, no login' copy; Learn and Today label it 'All sections' but every trick is chemistry |
| /tricks/sheets.html | The 14 Trick Sheets — Ace the DAT | Learn (via the trick library) | ready | One screenshot-ready card per trick, in test-day order, covering OChem and Gen Chem. | 'Rather watch?' link goes to the retired series/ redirect |
| /tricks/shorts/ | Ace the DAT — Trick Shorts | Learn (via the trick library) | ready | Gallery of 40-second question-first shorts, one per trick. |  |
| /tricks/shorts/short.html | Ace the DAT — Short | Learn (via Trick Shorts gallery, ?topic=<slug>) | ready | One 40-second short: a DAT question, the trick, the worked answer. | Without ?topic= it silently shows the acidity trick; much empty space below the card |
| /tricks/series/ | Moved to Trick Shorts — Ace the DAT | Learn (shell); redirect only | legacy | Redirects to the Trick Shorts gallery. | Still linked from sheets.html |
| /tricks/series/topic-tiktok.html | Ace The DAT — Topic TikTok | none (embedded in mini-test remediation as the 15-second fix) | rough | A templated animated explainer for one trick or topic (OChem, Gen Chem, and some Bio and QR), chosen with ?topic=<key>. | Blank without ?topic=; 1080x1920 canvas, cropped when opened directly on a phone; no shell; TTS voice |
| /tricks/series/voiceover-studio.html | Ace The DAT — Voiceover Studio | none (URL only) | internal | Production studio for recording voiceover on the trick-series TikToks. | 'Crew only' banner text is low-contrast and hard to read |
| /tricks/videos/ | Ace The DAT — Trick Videos | Learn (via the trick library; mini-test remediation) | ready | Gallery of 13 full trick videos (9 OChem, 4 Gen Chem), each under two minutes. | Copy references 'The Climb'; trick 01 video still missing |
| /tricks/videos/acidity-ranking.html | Ace The DAT — Acidity Ranking | Learn (via Trick Videos gallery, JS-built link) | rough | A 1:48 animated video: rank acids by their conjugate bases using CARDIO. | Silent: voiceover/acidity/manifest.json 404; shows the TikTok prompt 'comment your pick, answer at the end' to students |
| /tricks/videos/alkene-map.html | Ace The DAT — Alkene Map | Learn (via Trick Videos gallery, JS-built link) | rough | A 1:48 animated video mapping every alkene reagent by regiochemistry and stereochemistry. | Silent: voiceover/tip07/manifest.json 404; TikTok comment prompt shown |
| /tricks/videos/eas-directing.html | Ace The DAT — EAS Directing | Learn (via Trick Videos gallery, JS-built link) | rough | A 2:30 animated video on EAS directing: activators go ortho/para, withdrawers go meta, halogens are the exception. | Silent: voiceover/manifest.json 404; TikTok comment prompt shown |
| /tricks/videos/ir-peaks.html | Ace The DAT — IR Peaks | Learn (via Trick Videos gallery, JS-built link) | rough | A 1:48 animated video reading IR from two peaks: the broad O-H and the sharp carbonyl. | Silent: voiceover/tip08/manifest.json 404; TikTok comment prompt shown |
| /tricks/videos/limiting-reagent.html | Ace The DAT — Limiting Reagent | Learn (via Trick Videos gallery, JS-built link) | rough | A 1:48 animated video: race each reactant to product, and the smaller yield wins. | Silent: voiceover/tip13/manifest.json 404; TikTok comment prompt shown |
| /tricks/videos/newman.html | Ace The DAT — Newman | Learn (via Trick Videos gallery, JS-built link) | rough | A 1:48 animated video ranking Newman conformations: anti beats gauche beats eclipsed. | Silent: voiceover/tip09/manifest.json 404; TikTok comment prompt shown |
| /tricks/videos/nmr-two-steps.html | Ace The DAT — NMR Two Steps | Learn (via Trick Videos gallery, JS-built link) | rough | A 1:48 animated video on H-NMR in two steps: count the peaks, then split by n+1. | Silent: voiceover/tip06/manifest.json 404; TikTok comment prompt shown |
| /tricks/videos/ozonolysis.html | Ace The DAT — Ozonolysis | Learn (via Trick Videos gallery, JS-built link) | rough | A 1:48 animated video on ozonolysis cleavage and how the workup decides aldehyde or acid. | Silent: voiceover/tip10/manifest.json 404; TikTok comment prompt shown |
| /tricks/videos/periodic-trends.html | Ace The DAT — Periodic Trends | Learn (via Trick Videos gallery, JS-built link) | rough | A 1:48 animated video explaining every periodic trend from one idea: atoms want a noble-gas configuration. | Silent: voiceover/tip14/manifest.json 404; TikTok comment prompt shown |
| /tricks/videos/red-cat-an-ox.html | Ace The DAT — Red Cat An Ox | Learn (via Trick Videos gallery, JS-built link) | rough | A 1:48 animated video on electrochemistry: reduction at the cathode, E cell = cathode minus anode. | Silent: voiceover/tip12/manifest.json 404; TikTok comment prompt shown |
| /tricks/videos/redox-balancing.html | Ace The DAT — Redox Balancing | Learn (via Trick Videos gallery, JS-built link) | rough | A 1:48 animated video balancing redox with half-reactions in four steps. | Silent: voiceover/tip11/manifest.json 404; TikTok comment prompt shown |
| /tricks/videos/rs-configuration.html | Ace The DAT — RS Configuration | Learn (via Trick Videos gallery, JS-built link) | rough | A 1:48 animated video assigning R/S: number the groups, trace, and flip if H is on a wedge. | Silent: voiceover/tip05/manifest.json 404; TikTok comment prompt shown |
| /tricks/videos/sn1-vs-sn2.html | Ace The DAT — SN1 vs SN2 | Learn (via Trick Videos gallery, JS-built link) | rough | A 1:48 animated video picking SN1, SN2, E1 or E2 from four questions: substrate, nucleophile, solvent, temperature. | Silent: voiceover/tip04/manifest.json 404; TikTok comment prompt shown |
| /tricks/videos/voiceover-studio.html | Ace The DAT — Video Voiceover Studio | none (URL only) | internal | Production studio for recording voiceover on the 13 bespoke trick videos. | Production tool (0 of every video recorded, which is why the videos are silent); has a 'crew only' banner |

## Quantitative Reasoning and Reading Comprehension: tools/qr/ (including proposals/, research/ and tiktoks/), tools/qr-retold/, tools/rc/, tools/rc-retold/

This area has 90 URLs: 63 HTML pages and 27 Markdown docs. All 90 loaded with zero console errors on a 390 x 844 phone. The two Retold courses do log 13 to 15 missing narration-audio 404s on every night (?night=N), because only GChem and Organic ship an audio/ folder.

Students need four pages, and all four are finished and work on a phone:
- the QR engine (/tools/qr/): diagnostic, 44-skill tree, Pattern Library, the current DAT formats and a 40-question Test-Day Simulation
- QR, Retold (/tools/qr-retold/): 14 nights
- the RC player (/tools/rc/): 15 timed sections and 45 single passages, all with proof-line review
- RC, Retold (/tools/rc-retold/): 10 nights

Around them sit 45 'proposal' pages under /tools/qr/proposals/, built by numbered agents in a May sprint:
- **42 student-usable QR widgets:** 13 foundation drills, 14 trap comparators, a probability sandbox, a stats lab, a mean-vs-median widget, 4 geometry canvases, 5 word-problem decoders, a pacing simulator, a guessing calculator and a Friday mini-mock.
- **3 Sarah-mode mocks** built on fake student data.

How students reach the 42 widgets:
- Only 7 are linked from a door page.
- 10 are embedded as iframes inside the QR engine, under headers that visibly read 'AGENT 02/03/06/08'.
- 23 are reachable only through Review's Drill links, which JS builds from qrModules in shared/ace-index.js.
- 7 are orphans: the 5 agent-07 decoders, agent-06 coord and mean-vs-median-trap. The 3 Sarah mocks and the TikTok library page are also unlinked.

The widgets overlap a lot:
- Two versions each for rate-time, word translation, work-rate, mixture, interest and coordinate slopes.
- The four probability comparators are consolidated by the probability sandbox.
- The Pattern System v1 overlaps the engine's own Pattern Library.

None of the widgets link back to the QR engine (stats-lab is the one exception), and none log results to Review or Performance.

Specific problems:
- The Friday mini-mock is on the Tests door and Today, but it calls its own questions 'placeholder-grade beta' and saves nothing.
- The 13 TikTok pages are Sarah's 1080 x 1920 video-production canvases. Yet every QR engine module has a 'Watch' button that opens one, and on a phone that page is blank at the top and cut off on the left.
- The 5 agent-07 decoders need mouse drag-and-drop in step 2, with no tap alternative.
- Stats Lab and Pattern System v1 scroll sideways on a phone.
- The 27 internal Markdown docs ship publicly in production: build plans, agent audits, research reports and RC authoring briefs. One of them contains Thomas's local file path. netlify.toml only redirects the root /docs, /specs and /research folders.

Content conflict for Thomas to decide: the QR engine files geometry and trig under 'Optional review · not on the current DAT'. QR Retold spends nights 9 to 11 on them, and the repo's own W1 research report lists geometry and trig at 10% each.

RC is the cleanest section: one player and one course. But RC Retold never links to the player.

### Organization notes

BEST ENTRY POINTS
- QR: the QR engine's diagnostic at /tools/qr/. It maps the student to a skill-tree path and its misses feed Review.
- RC: RC, Retold night 1 for the method, then the RC player at /tools/rc/.

LEARN (courses)
- 'QR, Retold' (14 nights) and 'RC, Retold' (10 nights) belong together under Learn, as they are today.
- Each night should end with one 'Practice this' link:
  - QR nights: to the matching engine module. QR Retold has only one generic 'Open the full QR engine' link.
  - RC nights: to a matching practice passage in the RC player. There are none today.
- Fix the intro copy that promises 'videos', and decide on narration audio. Every night currently 404s on 13 to 15 missing mp3 files.

PRACTICE: QR
One QR card: the QR engine. Keep 'QR engine', or name it 'QR Practice'. Under it, add a 'Skill tools' shelf of the widgets, grouped and renamed with the plain skill names already in AceIndex.skills.qr:
- **Number sense:** Fractions add and subtract (frac-add), Fractions multiply (frac-mul), Fraction to decimal anchors (frac-dec), Decimal places (dec-arith), Percent of a number, Percent change, Successive percents, Estimation, Mental math speed drill, Solving linear equations (lin-eq).
- **Word problems:** keep ONE tool per skill. Rate-time, work-rate, mixture, interest and word translation each exist twice: agent-02/03 versions vs agent-07 decoders.
  - The agent-07 decoders teach the fuller routine (highlight, build the equation, check, over five problems). They are the better choice once step 2 gets a tap alternative to drag-and-drop.
  - Until then, keep the agent-02/03 versions that Review routes to, and hide agent-07.
- **Algebra traps:** the agent-03 comparators for distribution, PEMDAS, negatives and inequalities, units, discriminant and perpendicular slopes. Keep one coordinate tool and retire agent-06 coord or agent-03 coord.
- **Probability and statistics:**
  - Probability Sandbox should replace the four agent-03 probability and counting comparators in qrModules.
  - Stats Lab should absorb the mean-vs-median trap and the harmonic-mean and discriminant comparators. Fix its sideways scroll first.
- **Geometry:** geo-2d, triangles and volume. Show these only after Thomas settles whether geometry and trig are on the DAT. The engine says no; QR Retold and the W1 report say yes.
- **Test-day strategy:** Pacing simulator and Guess vs blank. Fix their 45-versus-40 question count.
- **Pattern System v1:** finish its 5 stubs and drop 'v1', or fold it into the engine's Pattern Library and retire it.

PRACTICE: RC
One RC card: the RC player, named 'Reading Comprehension' everywhere. Today the Practice door says 'Reading', the Tests door says 'Reading sections' and Learn says 'RC'.

TESTS
- Add a QR card that opens the engine's 40-question Test-Day Simulation. The Tests door has no QR entry today.
- Keep RC's timed sections.
- Remove the Friday mini-mock from Tests and Today until it uses real items and logs results to Performance.

REVIEW
Review's Drill links already send QR misses to these widgets. Keep that routing, but every widget then needs:
- a 'Back to QR engine' link
- a plain title
- a saved result

HIDE FROM STUDENTS
Add forced 301s in netlify.toml, the same way /docs, /specs and /research are handled:
- all 27 .md files in tools/qr and tools/rc
- tools/qr/research/
- tools/qr/proposals/agent-10-sarah/ (fake student data)
- tools/qr/tiktoks/: the library, the voiceover studio and the 10 named recording canvases
- tools/rc/scripts/ (Python)
- tools/rc/verification/

Then either make topic-tiktok.html fit a phone, or remove the 'Watch' button from every QR engine module.

NAMES AND URLS
- Move the kept widgets out of /tools/qr/proposals/agent-NN-*/ to /tools/qr/drills/<skill>.html. Add redirects from the old paths and update qrModules and the engine's embed map.
- Strip student-visible dev labels: 'AGENT 02' in the engine's enhancement drills, 'Pattern Path · code', 'Tier 600', 'Module 35/36', 'W2/W9', 'beta'.
- Retitle file-name-style titles like 'frac-add · Common Floor Bars' with the plain skill name.

| url | title | door | status | for the student | problems |
|---|---|---|---|---|---|
| /tools/qr/ | QR engine · Ace Labs | Practice (shell highlights Practice; card on the Practice door and Today; fallback target of Review Drill links; deep-linked from the diagnostic, cheat sheets, Prometric mock and test week) | ready | The main QR study engine: an adaptive diagnostic, a 44-skill tree where each skill is taught in six stages from concept to mastery check, a spaced Pattern Library, practice sets in the current DAT formats (quantitative comparison, data sufficiency, figures, applied problems) and a 40-question timed Test-Day Simulation. | Opens behind a 5-step tour modal; embedded drills show dev tags 'AGENT 02/03/06/08'; sidebar files geometry and trig under 'not on the current DAT' while QR Retold teaches them; diagnostic.html deep links (#algebra, #geometry, #rate, #probability, #logarithms) target anchors that do not exist; 'Watch' button on every module opens a phone-broken TikTok canvas; one 1 MB page; no Tests-door card for its Test-Day Simulation. |
| /tools/qr-retold/ | QR, Retold — the front door | Learn (shell highlights Learn; Learn door builds its card in JS from shared/ace-index.js; also on Today and /retold/) | ready | A 14-night guided QR course (setup mindset, fractions, ratios, percents, algebra, word problems, geometry, trig, probability, statistics, test-day execution), walked alone or in Teach mode with a coach, with nights-walked progress. | No narration audio: each night requests about 13 missing mp3 and cues.json files (404); intro promises 'videos that go with it' that do not exist; nights 9-11 teach geometry and trig that the QR engine labels not on the current DAT; only one generic link to the QR engine, no per-night drill links; file title always says Night 1. |
| /tools/rc/ | Reading Comprehension / Ace Labs | Practice (shell highlights Practice; listed on Practice as 'Reading', on Tests as 'Reading sections', and on Today) | ready | The RC player: 15 full timed sections (3 passages, 50 questions, 60 minutes) and 45 single practice passages with a 10-and-10 pace bar, highlighter, proof-line-first mode, time-and-a-half option, and a review that shows the sentence that settles every answer. | Home is one long list of 15 sections and 45 passages with no next-up or done marks; its own 'Ace Labs' header sits under the shell bar; named 'Reading', 'Reading sections' and 'Reading Comprehension' in different places; RC Retold never links here. |
| /tools/rc-retold/ | RC, Retold — the front door | Learn (shell highlights Learn; Learn door builds its card in JS from shared/ace-index.js; also on Today, /retold/ and /scope.html) | ready | A 10-night RC strategy course (search, don't study; passage mapping; search-and-destroy; detail, main idea, inference, tone and trap questions; timing and test-day rhythm), walked alone or with a coach. | No narration audio (about 15 missing mp3 and cues.json 404s per night); no link from any night to the RC player or a practice passage; file title always says Night 1. |
| /tools/qr/qr-pattern-system-v1.html | QR Pattern System · AceTheDAT | Practice (shell highlights Practice; 'Pattern system' link on Practice and Today; 'Open Pattern System v1' in the QR engine sidebar) | rough | Fourteen QR speed-shortcut and trap patterns, each opening to a worked example, the formula and the most common trap, with a got-it tracker. | 5 of 14 patterns are stubs (badge says '9 full walkthroughs · 5 stubs'); 'v1' in the name; page scrolls sideways on a phone (450 px). |
| /tools/qr/proposals/agent-02-foundation/dec-arith.html | dec-arith · Decimal Place Tracker | Practice (shell highlights Practice; embedded as an Enhancement drill in the QR engine's Decimal Arithmetic module; Review Drill links for dec-arith misses) | ready | Decimal multiply and divide rounds that count decimal places and show the off-by-10 and off-by-100 traps. | File-name style title; under /proposals/; no link back to the QR engine; results not saved to Review or Performance. |
| /tools/qr/proposals/agent-02-foundation/estim.html | estim · Order-of-Magnitude Bracket | Practice (shell highlights Practice; 'Estimation' link on Practice and Today; embedded in the QR engine; Review Drill links) | ready | Five rounds of round to nice numbers, bracket the order of magnitude, then eliminate impossible answer choices. | File-name style title; under /proposals/; no link back to the QR engine; results not saved. |
| /tools/qr/proposals/agent-02-foundation/frac-add.html | frac-add · Common Floor Bars | Practice (shell highlights Practice; reached only through Review Drill links built in JS from qrModules) | ready | Drag two fraction bars together to find the common denominator and see why adding denominators is the trap. | Not linked from any door; file-name style title; no link back to the QR engine; results not saved. |
| /tools/qr/proposals/agent-02-foundation/frac-dec.html | frac-dec · Eight Anchors Number Line | Practice (shell highlights Practice; reached only through Review Drill links) | ready | Drag a marker onto a number line to lock in the eight fraction-to-decimal anchors under a 3-second goal. | Not linked from any door; file-name style title; no back link; results not saved. |
| /tools/qr/proposals/agent-02-foundation/frac-mul.html | frac-mul · Area Overlap | Practice (shell highlights Practice; reached only through Review Drill links) | ready | Shows fraction multiplication as the overlap of two slicings of a square, with no common denominator needed. | Not linked from any door; file-name style title; no back link; results not saved. |
| /tools/qr/proposals/agent-02-foundation/lin-eq.html | lin-eq · Balance Scale | Practice (shell highlights Practice; reached only through Review Drill links) | ready | Solve linear equations by applying the same inverse operation to both sides of a balance scale. | Not linked from any door; file-name style title; no back link; results not saved. |
| /tools/qr/proposals/agent-02-foundation/mental.html | mental · Speed Drill | Practice (shell highlights Practice; 'Mental math' link on Practice and Today; embedded in the QR engine; Review Drill links) | ready | A 12-card no-calculator speed drill (mixed, decimals, fractions, percent of) at 8 seconds a card, reporting hits, average time and accuracy. | File-name style title; under /proposals/; no back link; results not saved. |
| /tools/qr/proposals/agent-02-foundation/pct-chg.html | pct-chg · Original-Anchor Stretch Bar | Practice (shell highlights Practice; reached only through Review Drill links) | ready | Percent change with the original value as the anchor bar; pick the right denominator before computing. | Not linked from any door; file-name style title; no back link; results not saved. |
| /tools/qr/proposals/agent-02-foundation/pct-of.html | pct-of · Hundred-Grid Painter | Practice (shell highlights Practice; reached only through Review Drill links) | ready | Paint cells on a 100-grid to see percent of a number and watch the formula assemble. | Not linked from any door; file-name style title; no back link; results not saved. |
| /tools/qr/proposals/agent-02-foundation/pct-seq.html | pct-seq · Multiplier Chain | Practice (shell highlights Practice; reached only through Review Drill links) | ready | Builds successive percent changes as a chain of multipliers, with the add-the-percents trap shown as a ghost. | Not linked from any door; file-name style title; no back link; results not saved. |
| /tools/qr/proposals/agent-02-foundation/rate-time.html | rate-time · Scrub Timeline | Practice (shell highlights Practice; embedded in the QR engine's Rate x Time module; Review Drill links) | ready | Scrub a timeline to watch distance pile up at changing speeds, showing distance as the area under the rate curve. | File-name style title; no back link; results not saved. |
| /tools/qr/proposals/agent-02-foundation/ratios.html | ratios · Cross-Multiply Bowtie | Practice (shell highlights Practice; embedded in the QR engine's Ratios module; Review Drill links) | ready | Set up proportions with matched units on each fraction, then cross-multiply along the bowtie to solve. | Bowtie diagram labels are tiny on a phone; file-name style title; no back link; results not saved. |
| /tools/qr/proposals/agent-02-foundation/word-decode.html | word-decode · Phrase Translator | Practice (shell highlights Practice; reached only through Review Drill links) | ready | Tap each chunk of a word problem in order and pick its math translation, with a phrase dictionary on screen. | Not linked from any door; file-name style title; no back link; results not saved. |
| /tools/qr/proposals/agent-03-patterns/coord.html | Coordinate Geometry · Pattern Comparator · AceTheDAT QR | Practice (shell highlights Practice; reached only through Review Drill links) | ready | Two setups for a perpendicular-slope problem side by side: pick the right one, see the negative-reciprocal trap named, then drill. | Hero squeezed into a narrow column on a phone; dev label 'Pattern Path · COORD'; no back link; results not saved. |
| /tools/qr/proposals/agent-03-patterns/count-pc.html | Permutations vs Combinations · Pattern Comparator · AceTheDAT QR | Practice (shell highlights Practice; reached only through Review Drill links) | ready | Two setups for one counting problem: decide whether order matters, see the P vs C trap named, then drill. | Hero squeezed into a narrow column on a phone; dev label; no back link; results not saved. |
| /tools/qr/proposals/agent-03-patterns/discr.html | Discriminant · Pattern Comparator · AceTheDAT QR | Practice (shell highlights Practice; reached only through Review Drill links) | ready | Two setups for counting a quadratic's real roots: check the sign of b squared minus 4ac instead of solving the whole formula. | Hero squeezed into a narrow column on a phone; dev label; no back link; results not saved. |
| /tools/qr/proposals/agent-03-patterns/distrib.html | Distribution · Pattern Comparator · AceTheDAT QR | Practice (shell highlights Practice; reached only through Review Drill links) | ready | Two ways to simplify a distribution problem: distribute to every term, including across a leading minus, and see the skipped-term trap. | Hero squeezed into a narrow column on a phone; dev label; no back link; results not saved. |
| /tools/qr/proposals/agent-03-patterns/harm.html | Harmonic Mean · Pattern Comparator · AceTheDAT QR | Practice (shell highlights Practice; reached only through Review Drill links) | ready | Two setups for round-trip average speed: harmonic mean for equal distances versus the arithmetic-average trap. | Hero squeezed into a narrow column on a phone; dev label; no back link; results not saved. |
| /tools/qr/proposals/agent-03-patterns/interest.html | Compound Interest · Pattern Comparator · AceTheDAT QR | Practice (shell highlights Practice; reached only through Review Drill links) | ready | Two setups for a compound-interest problem: multiply each period rather than adding simple interest. | Hero squeezed into a narrow column on a phone; dev label; no back link; results not saved. |
| /tools/qr/proposals/agent-03-patterns/mixture.html | Mixture · Pattern Comparator · AceTheDAT QR | Practice (shell highlights Practice; reached only through Review Drill links) | ready | Two setups for mixing solutions: weight each concentration by its volume instead of averaging the percents. | Hero squeezed into a narrow column on a phone; '600-tier' jargon; no back link; results not saved. |
| /tools/qr/proposals/agent-03-patterns/neg-ineq.html | Negative Inequalities · Pattern Comparator · AceTheDAT QR | Practice (shell highlights Practice; reached only through Review Drill links) | ready | Two setups for an inequality divided by a negative: flip the sign versus the keep-it trap. | Hero squeezed into a narrow column on a phone; dev label; no back link; results not saved. |
| /tools/qr/proposals/agent-03-patterns/p-andor.html | AND vs OR · Pattern Comparator · AceTheDAT QR | Practice (shell highlights Practice; reached only through Review Drill links) | ready | Two setups for a dice probability: multiply for AND, add for OR, and see the swapped-operation trap. | Hero squeezed into a narrow column on a phone; dev label; no back link; results not saved. |
| /tools/qr/proposals/agent-03-patterns/p-cond.html | Conditional Probability · Pattern Comparator · AceTheDAT QR | Practice (shell highlights Practice; reached only through Review Drill links) | ready | Two setups for a 'given' problem: shrink the denominator to the conditioning group instead of keeping the full total. | Hero squeezed into a narrow column on a phone; dev label; no back link; results not saved. |
| /tools/qr/proposals/agent-03-patterns/p-flip.html | At-Least-One Flip · Pattern Comparator · AceTheDAT QR | Practice (shell highlights Practice; reached only through Review Drill links) | ready | Two setups for 'at least one': use 1 minus P(none) instead of adding the single probabilities. | Hero squeezed into a narrow column on a phone; dev label; no back link; results not saved. |
| /tools/qr/proposals/agent-03-patterns/pemdas.html | PEMDAS · Pattern Comparator · AceTheDAT QR | Practice (shell highlights Practice; embedded in the QR engine's PEMDAS module; Review Drill links) | ready | Two readings of one expression: left to right within multiply/divide and add/subtract versus the M-before-D trap. | Hero squeezed into a narrow column on a phone; dev label; no back link; results not saved. |
| /tools/qr/proposals/agent-03-patterns/units.html | Unit Conversion · Pattern Comparator · AceTheDAT QR | Practice (shell highlights Practice; reached only through Review Drill links) | ready | Two setups for a unit conversion: set up the fraction so units cancel instead of multiplying the wrong way. | Hero squeezed into a narrow column on a phone; dev label; no back link; results not saved. |
| /tools/qr/proposals/agent-03-patterns/work-rate.html | Work-Rate · Pattern Comparator · AceTheDAT QR | Practice (shell highlights Practice; reached only through Review Drill links) | ready | Two setups for two pumps working together: add the rates and invert instead of averaging the times. | Hero squeezed into a narrow column on a phone; dev label; no back link; results not saved. |
| /tools/qr/proposals/agent-04-prob-tree/probability-sandbox.html | AceTheDAT QR · Probability Sandbox (unified tree) | Practice (shell highlights Practice; 'Probability sandbox' link on Practice and Today) | ready | Build a probability tree by adding events and sliding their probabilities; joint, union, conditional and counting views update together, with eight preset DAT trap shapes (coin flips, drawing without replacement, a Bayes test and more). | Hero text squeezed into a narrow column on a phone; no back link to the QR engine; Review never routes here (its qrModules key is not a skill id); results not saved. |
| /tools/qr/proposals/agent-05-stats/stats-lab.html | AceTheDAT QR · Stats Lab | Practice (shell highlights Practice; 'Stats lab' link on Practice and Today) | rough | Drag points on a number line and watch mean, median, mode, SD and range update; load preset distributions and use z-score and harmonic-mean panels to see why one outlier moves the mean but not the median. | Number-line canvas overflows a phone (page scrolls sideways, 413 px); 'Tier 600' jargon; tells students to Shift+click to remove a point, which a phone cannot do; Review never routes here. |
| /tools/qr/proposals/agent-05-stats/mean-vs-median-trap.html | AceTheDAT QR · Mean vs Median Trap | none (URL only; shell would highlight Practice) | ready | One scenario: drag a single outlier score and watch the mean swing while the median barely moves. | Orphan: no page links to it; 'Tier 600' jargon; chart labels tiny on a phone; no back link. |
| /tools/qr/proposals/agent-06-geometry/coord.html | Coordinate Plane Canvas — AceTheDAT QR | none (URL only; shell would highlight Practice) | ready | Drag two points to see slope, midpoint, distance and the line equation update; drop a test point to check whether it lies on the line. | Orphan: no page links to it; 'QR · Tier 2' label; no back link; results not saved. |
| /tools/qr/proposals/agent-06-geometry/geo-2d.html | 2D Geometry Canvas — AceTheDAT QR | Practice (shell highlights Practice; embedded in the QR engine's 2D Geometry module; Review Drill links) | ready | Pick a shape and drag its corners; side lengths, angles, perimeter and area update live, with the parallelogram-height and trapezoid traps called out. | The QR engine files geometry under 'not on the current DAT'; no back link; results not saved. |
| /tools/qr/proposals/agent-06-geometry/tri-inv.html | Triangle Invariance Canvas — AceTheDAT QR | Practice (shell highlights Practice; reached only through Review Drill links) | ready | Drag a triangle's vertices to explore side and angle relationships, 30-60-90 and 45-45-90 ratios, similar triangles and a live triangle-inequality check. | Geometry marked not on the current DAT by the engine; not linked from any door; no back link; results not saved. |
| /tools/qr/proposals/agent-06-geometry/vol-sa.html | Volume / Surface Area Canvas — AceTheDAT QR | Practice (shell highlights Practice; reached only through Review Drill links) | ready | Resize and rotate solids (cube, prism, cylinder, cone, sphere) to see volume scale with the cube of length and surface area with the square; toggle the net. | Geometry marked not on the current DAT by the engine; not linked from any door; no back link; results not saved. |
| /tools/qr/proposals/agent-07-decoder/interest.html | Interest Decoder · AceTheDAT QR | none (URL only; shell would highlight Practice) | rough | Five simple and compound interest word problems worked in three steps: tap P, r, t and n, drag them into the right formula skeleton, then solve and sanity-check. | Orphan; the build-skeleton step needs mouse drag-and-drop with no tap alternative, so it is unreliable on phones; no back link; results not saved. |
| /tools/qr/proposals/agent-07-decoder/mixture.html | Mixture Decoder · AceTheDAT QR | none (URL only; shell would highlight Practice) | rough | Five mixture problems worked in three steps: tap each concentration and volume, drag them into C1V1 + C2V2 = CfVf, then solve and check. | Orphan; drag-only skeleton step with no tap alternative; no back link; results not saved. |
| /tools/qr/proposals/agent-07-decoder/rate-time.html | Rate × Time = Distance · AceTheDAT QR | none (URL only; shell would highlight Practice) | rough | Five distance-rate-time problems (single leg, two legs, meeting, catch-up, unit conversion) worked as highlight, build d = r x t, solve. | Orphan; drag-only skeleton step with no tap alternative; no back link; results not saved. |
| /tools/qr/proposals/agent-07-decoder/word-decode.html | Word Problem Decoder · AceTheDAT QR | none (URL only; shell would highlight Practice) | rough | Five general word problems: tap the numbers and unknowns, drag them into an equation skeleton, then solve and sanity-check. | Orphan; drag-only skeleton step with no tap alternative; '500-tier' jargon; no back link; results not saved. |
| /tools/qr/proposals/agent-07-decoder/work-rate.html | Work / Rate Decoder · AceTheDAT QR | none (URL only; shell would highlight Practice) | rough | Five work-rate problems: tap each solo time, drag into 1/t = 1/a + 1/b, then flip back to the combined time. | Orphan; drag-only skeleton step with no tap alternative; no back link; results not saved. |
| /tools/qr/proposals/agent-08-pacing/friday-mini-mock.html | Friday Mini-Mock · AceTheDAT QR · 22 Q / 22 min | Tests (shell rule maps it to Tests; 'QR Friday mini mock' chip on the Tests door and Today's Tests room; embedded in the QR engine's Friday Mini-Mock module) | rough | A 22-question, 22-minute interleaved QR set with the calculator off by default and skip-and-return. | Page says its question content is placeholder-grade beta; one fixed 22-question set that never changes; research jargon (W2, W9, effect size) in the intro; results not saved to Performance or Review; lives under /proposals/. |
| /tools/qr/proposals/agent-08-pacing/guess-ev.html | Guess vs Blank EV · AceTheDAT QR · Tier 3 | Practice (shell highlights Practice; 'Guessing math' link on Practice and Today; embedded in the QR engine's Educated Guessing module) | ready | Sliders show the expected points from guessing versus leaving questions blank, proving a guess always beats a blank. | 'Tier 3 · Meta-strategy' and 'Module 36' labels; scenario says a 45-question section though DAT QR is 40; no back link. |
| /tools/qr/proposals/agent-08-pacing/pacing-sim.html | Pacing Simulator · AceTheDAT QR · Tier 3 | Practice (shell highlights Practice; 'Pacing simulator' link on Practice and Today; embedded in the QR engine's Skip and Return module and linked as 'Open the Two-Pass Drill') | ready | Timed QR sets (Sprint 10, Standard 15, Half 22, Two-Pass Drill) to practice skip-and-return and guess-versus-blank under the clock, with coach cues and a debrief. | Intro says a 45-question section, then says the real section is 40 in 45; 'Module 35 · 36' labels; results kept in its own storage key, not in Performance; no back link. |
| /tools/qr/proposals/agent-10-sarah/module-notes.html | Per-module Sarah note — proposal mock | none (URL only; no shell nav) | internal | Not for students: a mock of a per-module 'note from Sarah' banner and the Sarah-mode note editor. | Proposal mock with a 'Mock · Agent 10 proposal' banner; served publicly by URL. |
| /tools/qr/proposals/agent-10-sarah/sarah-dashboard.html | Sarah Dashboard — proposal mock | none (URL only; no shell nav) | internal | Not for students: a mock coach dashboard with a roster picker, a student's weakest three skills and coach notes, on fake data. | Fake student data ('Marcus L.'); overflows a phone (414 px); served publicly by URL. |
| /tools/qr/proposals/agent-10-sarah/stuck-to-acecard.html | Stuck → Ace Card — proposal mock | none (URL only; no shell nav) | internal | Not for students: a mock of an 'I need a sec' stuck button that saves the problem as a flagged Ace Card for Sarah to review. | Proposal mock banner; served publicly by URL. |
| /tools/qr/tiktoks/ | Ace The DAT — QR TikTok Library (Sarah) | none (URL only; no shell nav) | internal | Not for students: Sarah's library of 37 QR TikTok scripts by tier, each with Watch, QR-module and Voiceover Studio links for recording. | Coach video-production page ('branded for Sarah', '?face=URL' overlay instructions); served publicly by URL. |
| /tools/qr/tiktoks/topic-tiktok.html | Ace The DAT — QR TikTok (Sarah) | none (no shell nav; opened in a new tab by the 'Watch' button on every QR engine module) | broken | A 75-second animated explainer for one QR skill (hook, three steps, the DAT trap, lock-in), narrated by the browser's text-to-speech. | Built as a 1080 x 1920 recording canvas (viewport width=1080): on a phone the first screen is blank and the canvas is cut off on the left; robotic browser TTS that needs a tap to start; '(Sarah)' in the title. |
| /tools/qr/tiktoks/count-pc-collapse-tiktok.html | Ace The DAT — nPr ÷ r! = nCr | none (URL only; linked from the TikTok library) | internal | Not for students: a 1080 x 1920 TikTok recording canvas showing permutations collapsing into combinations. | Video-production canvas: blank and cropped on a phone; served publicly. |
| /tools/qr/tiktoks/harm-distance-tiktok.html | Ace The DAT — Harmonic Mean (Equal Distance) | none (URL only; linked from the TikTok library) | internal | Not for students: a TikTok recording canvas on the equal-distance harmonic-mean trap. | Video-production canvas: blank and cropped on a phone; served publicly. |
| /tools/qr/tiktoks/p-cond-bayes-tiktok.html | Ace The DAT — Bayes Inverts (P(D/+)) | none (URL only; linked from the TikTok library) | internal | Not for students: a TikTok recording canvas on Bayes and the disease-test inversion. | Video-production canvas: blank and cropped on a phone; served publicly. |
| /tools/qr/tiktoks/sarah-baseball-tiktok.html | Ace The DAT — Sarah's Baseball Trick (Logs) | none (URL only; linked from the TikTok library) | internal | Not for students: Sarah's TikTok recording canvas for her baseball trick for logarithms. | Video-production canvas: blank and cropped on a phone; served publicly. |
| /tools/qr/tiktoks/sarah-c-method-tiktok.html | Ace The DAT — Sarah's C-Method (Combinations) | none (URL only; linked from the TikTok library) | internal | Not for students: Sarah's TikTok recording canvas for her C-method for combinations. | Video-production canvas: blank and cropped on a phone; served publicly. |
| /tools/qr/tiktoks/sarah-dice-pyramid-tiktok.html | Ace The DAT — Sarah's Dice Pyramid (Probability) | none (URL only; linked from the TikTok library) | internal | Not for students: Sarah's TikTok recording canvas for the two-dice sum pyramid. | Video-production canvas: blank and cropped on a phone; served publicly. |
| /tools/qr/tiktoks/sarah-pretend-100-tiktok.html | Ace The DAT — Sarah's Pretend $100 (Percent Change) | none (URL only; linked from the TikTok library) | internal | Not for students: Sarah's TikTok recording canvas for the pretend-100-dollars percent-change trick. | Video-production canvas: blank and cropped on a phone; served publicly. |
| /tools/qr/tiktoks/sarah-shield-tornado-tiktok.html | Ace The DAT — Sarah's Shield + Tornado (Absolute Value) | none (URL only; linked from the TikTok library) | internal | Not for students: Sarah's TikTok recording canvas for her shield and tornado picture of absolute-value inequalities. | Video-production canvas: blank and cropped on a phone; served publicly. |
| /tools/qr/tiktoks/sarah-work-rate-trap-tiktok.html | Ace The DAT — Sarah's "If Together" vs "Work Together For" (Work-Rate) | none (URL only; linked from the TikTok library) | internal | Not for students: Sarah's TikTok recording canvas on the two work-rate wordings. | Video-production canvas: blank and cropped on a phone; served publicly. |
| /tools/qr/tiktoks/zscore-bell-tiktok.html | Ace The DAT — z & the Empirical Rule | none (URL only; linked from the TikTok library) | internal | Not for students: a TikTok recording canvas on z-scores and the 68/95/99.7 rule. | Video-production canvas: blank and cropped on a phone; served publicly. |
| /tools/qr/tiktoks/voiceover-studio.html | Ace The DAT — Sarah's Voiceover Studio (QR) | none (URL only; linked from the TikTok library) | internal | Not for students: Sarah's recording tool that lists each TikTok's scenes and tracks voiceover takes. | Coach production tool; served publicly by URL. |
| /tools/qr/MASTER_GAMEPLAN.md | QR Tool Master Gameplan — Evidence-Grounded Build Plan (Markdown) | none (URL only; raw Markdown, no shell) | internal | Not for students: the May 2026 evidence-grounded build plan for the QR tool. | Raw Markdown served publicly in production; netlify.toml hides only root /docs, /specs and /research. |
| /tools/qr/proposals/agent-01-audit/SCORECARD.md | Agent 01 Audit: SCORECARD (Markdown) | none (URL only; raw Markdown) | internal | Not for students: Agent 01's audit scoring all 41 QR engine modules. | Served publicly in production. |
| /tools/qr/proposals/agent-02-foundation/INTEGRATION.md | Agent 02 — Foundation Tier Widget Integration (Markdown) | none (URL only; raw Markdown) | internal | Not for students: integration notes for the 13 foundation widgets. | Served publicly in production. |
| /tools/qr/proposals/agent-03-patterns/INTEGRATION.md | Agent 03 — Pattern Path comparator widgets (Markdown) | none (URL only; raw Markdown) | internal | Not for students: integration notes for the 14 pattern comparators. | Served publicly in production; the folder also ships _build.js and _shell.css. |
| /tools/qr/proposals/agent-04-prob-tree/INTEGRATION.md | Integration plan — Probability Sandbox (Markdown) | none (URL only; raw Markdown) | internal | Not for students: integration plan for the probability sandbox. | Served publicly in production. |
| /tools/qr/proposals/agent-05-stats/INTEGRATION.md | Stats Lab — Integration Map (Markdown) | none (URL only; raw Markdown) | internal | Not for students: integration map for the stats lab and mean-vs-median widget. | Served publicly in production. |
| /tools/qr/proposals/agent-06-geometry/INTEGRATION.md | Agent 06 — Geometry Canvases (Markdown) | none (URL only; raw Markdown) | internal | Not for students: integration notes for the four geometry canvases. | Served publicly in production. |
| /tools/qr/proposals/agent-07-decoder/INTEGRATION.md | Agent 07 — Word Problem Decoder modules (Markdown) | none (URL only; raw Markdown) | internal | Not for students: integration notes for the five word-problem decoders. | Served publicly in production. |
| /tools/qr/proposals/agent-08-pacing/INTEGRATION.md | Agent 08 — Pacing & Meta-Strategy Integration (Markdown) | none (URL only; raw Markdown) | internal | Not for students: integration notes for the pacing simulator, guess calculator and mini-mock. | Served publicly in production. |
| /tools/qr/proposals/agent-09-diagnostic/AUDIT.md | Diagnostic + Skill Tree + Routing Audit (Markdown) | none (URL only; raw Markdown) | internal | Not for students: audit of the QR diagnostic, skill tree and routing. | Served publicly in production; contains Thomas's local file path (/Users/thomascordell/...). |
| /tools/qr/proposals/agent-09-diagnostic/ROUTING_PROPOSAL.md | Routing Proposal — diagnostic -> module + spaced review (Markdown) | none (URL only; raw Markdown) | internal | Not for students: proposal for diagnostic-to-module routing and spaced review. | Served publicly in production. |
| /tools/qr/proposals/agent-09-diagnostic/WEAK_3_SPEC.md | "Your Weak 3" — Output Spec (Markdown) | none (URL only; raw Markdown) | internal | Not for students: spec for the 'Your Weak 3' diagnostic result panel. | Served publicly in production. |
| /tools/qr/proposals/agent-10-sarah/AUDIT.md | Agent 10 audit — Sarah-mode operational state (Markdown) | none (URL only; raw Markdown) | internal | Not for students: audit of Sarah-mode inside the QR engine. | Served publicly in production. |
| /tools/qr/proposals/agent-10-sarah/feedback-export.md | Feature 4 — Feedback flow → backlog file (Markdown) | none (URL only; raw Markdown) | internal | Not for students: design for routing student feedback into a backlog file. | Served publicly in production. |
| /tools/qr/proposals/sprint-c-beta-audit/BETA_LAUNCH_FIXES.md | Sprint C — Beta launch readiness audit (Markdown) | none (URL only; raw Markdown) | internal | Not for students: Sprint C beta launch readiness audit of the QR engine, by severity. | Served publicly in production. |
| /tools/qr/research/agent-w1-dat-specs/REPORT.md | Agent W1 — Official DAT QR Specs and 600-Tier Realities (Markdown) | none (URL only; raw Markdown) | internal | Not for students: research report on the official DAT QR specs. | Served publicly in production (/tools/qr/research/ is not covered by the root /research redirect); its table lists geometry and trig at 10% each, which conflicts with the engine's 'not on the current DAT' label. |
| /tools/qr/research/agent-w10-mobile-ux/REPORT.md | Agent W10 — Mobile-First Study Tool UX + Session Design (Markdown) | none (URL only; raw Markdown) | internal | Not for students: research report on mobile-first study UX. | Served publicly in production. |
| /tools/qr/research/agent-w4-anxiety/REPORT.md | Agent W4 — Test Anxiety + High-Stakes Test Prep UX (Markdown) | none (URL only; raw Markdown) | internal | Not for students: research report on test-anxiety-aware design. | Served publicly in production. |
| /tools/qr/research/agent-w5-math-viz/REPORT.md | Agent W5 — Interactive Math Visualization (Markdown) | none (URL only; raw Markdown) | internal | Not for students: research report on interactive math visualization. | Served publicly in production. |
| /tools/qr/research/agent-w6-adaptive/REPORT.md | Agent W6 — Adaptive Testing & Diagnostic Measurement (Markdown) | none (URL only; raw Markdown) | internal | Not for students: research report on adaptive testing for the QR diagnostic. | Served publicly in production. |
| /tools/qr/research/agent-w7-mastery-diag/REPORT.md | Agent W7 — Mastery Learning + Diagnostic Assessment (Markdown) | none (URL only; raw Markdown) | internal | Not for students: research report on mastery learning and diagnostic assessment. | Served publicly in production. |
| /tools/qr/research/agent-w8-tutor-loop/REPORT.md | Agent W8 — Tutor-in-the-Loop Products (Markdown) | none (URL only; raw Markdown) | internal | Not for students: research report on tutor-in-the-loop products. | Served publicly in production. |
| /tools/qr/research/agent-w9-speed-math/REPORT.md | Agent W9 — Speed Math + Fluency Training (Markdown) | none (URL only; raw Markdown) | internal | Not for students: research report on speed math and fluency. | Served publicly in production. |
| /tools/rc/SCHEMA.md | Ace Labs Reading Comprehension: passage schema (Markdown) | none (URL only; raw Markdown) | internal | Not for students: the RC passage JSON schema and validator rules. | Served publicly in production, along with tools/rc/scripts/*.py and data/passages/*.json. |
| /tools/rc/VERIFICATION.md | How the RC bank was verified (Markdown) | none (URL only; raw Markdown) | internal | Not for students: how the 45-passage RC bank passed its two verification gates. | Served publicly in production. |
| /tools/rc/verification/AUTHOR.md | Author brief: one original DAT Reading Comprehension passage (Markdown) | none (URL only; raw Markdown) | internal | Not for students: the brief used to write each original RC passage. | Served publicly in production, along with the 45 blind-exam JSON copies in verification/blind/. |
| /tools/rc/verification/EXAMINER.md | Blind examiner brief (Ace Labs RC) (Markdown) | none (URL only; raw Markdown) | internal | Not for students: the brief for the blind second examiner of RC items. | Served publicly in production. |

## Perceptual Ability (PAT), games and Casper: tools/pat/, tools/pat-retold/, games/ (all), guides/ (all), tools/casper/

The area has 21 student-reachable entries: 16 HTML files, the grids PDF, and the 4 Game Central subjects (play.html?subject=bio/gchem/ochem/qr), which are listed separately because each belongs to a different DAT section. No landing page throws a JS error, and none scrolls sideways at 390px. Every night of PAT Retold logs 13 to 15 404s from missing narration audio. GChem and OChem Retold ship audio; PAT does not.

Status: 12 ready, 9 rough, 0 broken. Nothing in the area is internal or legacy as a whole page. The coach-facing parts are features inside student pages: CSV export, seed numbers, 'Coach teaching studio' copy and Retold Teach mode.

The PAT core is strong:
- The full test (tools/pat/test.html) works well on a phone. I ran it through all six sections; it loads in about 4s and has 15 fixed tests plus fresh ones, all from the audited engine.
- The six studio trainers all work and all teach their method.
- PAT Retold is a complete 10-night course.

The weak spots:
- **Retold Night 7 is wrong for the DAT.** It teaches the sliced painted-cube puzzle (corner 3, edge 2, face 1, buried 0, every face painted). The DAT rule that the face sitting on the table is never painted appears nowhere in Retold.
- **Every Retold night links to the Studio hub,** not to its matching trainer.
- **Keyholes on a phone.** The five answer panels sit in a sideways-scrolling strip, and the hints are keyboard-only.
- **Older trainer generators.** The studio trainers use older generators than the test engine. Pattern Folding has only 4 of the 11 cube nets and no non-cube shapes; Hole Punching has no diagonal folds; Angles defaults to an even 5-degree gap.
- **Bio and QR game rounds.** Only 158 of 508 Bio items and 114 of 1,017 QR items have an explanation, though the hub promises 'the why behind every answer'. In 307 of 508 Bio items the correct option is the single longest one. Bio and QR stems are mostly one-line flashcards. GChem (517 of 517) and OChem (1,194 of 1,194) are fully explained.
- **Six Views and Chirality Bench.** Both work end to end and save a round summary, but they scroll the shared nav off screen on load. On a phone their 3D reveal is cramped: labels overlap, and the hints say to use WASD keys.
- **Results that never reach Review.** Six Views, Chirality Bench and the six studio trainers keep only private localStorage records. Only the PAT test and Game Central feed Review and Today.
- **The grids guide.** guides/pat-grids.html has no viewport meta, so a phone shows it shrunk to desktop width. The PDF of the same sheet is linked from nowhere.
- **Casper.** The console is polished and complete: 26 scenarios, a full 11-station mock, video rehearsal, typing trainer and progress. It is reachable only from a footnote on Practice, wears its own header, and its Decision Arcade has 5 items whose correct answer is always the longest.

Screenshots are in /tmp/claude-0/-home-user/d13d0ec6-4383-5048-8c7c-ddae9950f2ae/scratchpad/inventory/shots/. Interaction shots (test sections, game reveals, Retold nights, Casper modes) and the probe scripts are in /tmp/claude-0/-home-user/d13d0ec6-4383-5048-8c7c-ddae9950f2ae/scratchpad/inventory/pat-games-casper/.

### Organization notes

BEST ENTRY POINT: rebuild PAT Studio (/tools/pat/) as the one home for Perceptual Ability. Order it by the six question types in test order: Keyholes, Top-Front-End, Angle Ranking, Hole Punching, Cube Counting, Pattern Folding. Give each type one row with four steps:
- **Learn it:** the matching PAT Retold night (nights 2 to 7).
- **Train it:** the studio trainer.
- **Speed it:** Six Views for Top-Front-End and Cube Counting. Nothing yet for the other four.
- **Prove it:** that section of the PAT test.

Put a 'Start here' strip above the rows: Retold Night 1 (the mindset) and the Playbook, renamed 'PAT at a glance' (format, clock, traps). Put two things below them: the full PAT test (15 fixed tests plus fresh) and the 'Grids and T-charts' printable, linked as the PDF. Retold Nights 8 to 10 (traps, hard cases, test-day pacing) sit next to the test.

Wire the Learn, Train and Test doors to the same six-type order. Change each Retold night's 'Train it' button to point at its own trainer (Night 2 to keyholes.html, and so on) instead of the hub.

NAMES: title every trainer by its DAT question type and use the method as the subtitle:
- Keyholes: the silhouette method
- Top-Front-End: solid means seen
- Angle Ranking: trim the arms
- Hole Punching: the grid method
- Cube Counting: the T-chart
- Pattern Folding: anchor one face

Today the titles mix 'Aperture Trainer', 'The Calibrated Angle Trainer', 'Stay 2D' and 'Solid Means Seen'. Rename 'Thomas order' on the PAT test to something a student understands, such as 'Angles-first order'. Pick one T-chart convention: the guide uses rows 0 to 5, the test scratch pad 1 to 5. Give the whole studio one visual theme; TFE (dark) and Keyholes (own palette, no back link) do not match their siblings.

HIDE FROM STUDENTS (or move behind a coach flag such as ?coach=1):
- Seed numbers and 'Export log (CSV)' on every trainer.
- 'Coach teaching studio' and 'For Thomas + Sarah: pose it on screen' on the Studio hub.
- 'Sarah's playbook' and 'Sarah's line' in Pattern Folding. Keep the content, drop the personal attribution.
- Retold's 'Teach mode' toggle.
- The bare /games/play.html, which silently starts a Bio round.
- /guides/pat-grids.html: link the PDF instead, or add a viewport and a download button.

GAMES: Game Central mixes all sections. A student will find a game more easily under its own section:
- The Bio, GChem, OChem and QR rounds become 'Quick rounds' inside each section's Practice card.
- Chirality Bench sits under Organic Chemistry (stereochemistry).
- Six Views sits under PAT.

Keep one 'Games' strip on Practice and Today that lists them all, but drop Game Central's separate hub copy, which overlaps with Practice. Before release, either add explanations to the Bio and QR rounds and fix the Bio longest-answer tell, or relabel those two as 'flash rounds' and remove the promise of a why behind every answer. Make the studio trainers, Chirality Bench and Six Views write misses into Review, as the PAT test and Game Central already do. Also settle the copy conflict: Practice and Today say games are 'kept separate from your test misses on purpose', while Review says game misses land there.

CASPER: Casper is not a DAT section, so do not mix it into the DAT doors. Give it one clearly separate card, 'Beyond the DAT: Casper practice', in the Practice footer or on Today during application season. Keep the console as is; it is the most finished tool in this area. Drop its duplicate header ('AceTheDAT Casper Practice Console' plus an 'Ace Labs' button to /ace-labs.html) in favor of the shared nav. Hide or expand the 5-item Decision Arcade. Note that AI feedback needs an access code from the coach.

FIX BEFORE THE SHOWCASE:
1. Retold Night 7: add the DAT painted-face rule (the face on the table is never painted) and stop teaching the sliced-cube puzzle as if it were the DAT format.
2. Keyholes phone layout: wrap the answer panels into a grid instead of a sideways strip.
3. Six Views and Chirality on a phone: stop the auto-scroll past the nav, make the reveal panel larger, and replace the WASD hint with touch wording.
4. Consider powering each trainer's drill mode from tools/pat/engine, so the trainers get all 11 nets, polyhedra, diagonal folds and mixed 2 to 6 degree angle gaps like the test.

| url | title | door | status | for the student | problems |
|---|---|---|---|---|---|
| /tools/pat/ | Ace PAT Studio | Practice | rough | The PAT home: one card for each of the six question-type trainers, plus buttons to the Playbook and the full PAT test, with your accuracy shown on each card. | Coach-facing copy ('Coach teaching studio', 'For Thomas + Sarah', 'export the log'); 'LIVE · the standard' dev chips; no Learn or Speed links. |
| /tools/pat/keyholes.html | Ace PAT Studio — Aperture Trainer (Keyholes) | Practice | rough | Generates keyhole (aperture) items at four difficulty levels, scores your pick, names the trap you fell for, and has a final-two twin-pair drill. | On a phone only the object plus one option shows; options sit in a sideways-scrolling strip; keyboard-only hints (A–E, Shift); seed number shown; no link back to the Studio; own palette. |
| /tools/pat/tfe.html | Ace PAT Studio — Top Front End: Solid Means Seen | Practice | ready | Teaches top-front-end views in three tabs (Learn walkthrough, Guided, Drill at 3 levels), focused on the solid-versus-dashed line decision. | Dark theme unlike the other cream Studio pages; drill always asks for the End view (the DAT rotates the missing view); given views render small on a phone. |
| /tools/pat/angles.html | Ace PAT Studio — Angle Discrimination Trainer | Practice | ready | Rank four angles smallest to largest with an adjustable gap from 10 down to 2 degrees, an optional arm-length trap and a step-by-step reveal. | Default gap is an even 5 degrees, easier than the DAT; seed and gap shown in the header; CSV export button; page title differs from the hub name. |
| /tools/pat/holepunch.html | Ace PAT Studio — Hole Punching: The Grid Method | Practice | ready | Steps through each fold on a 4x4 grid, mirrors the punch back out one crease at a time, then has you pick the matching unfolded sheet. | Vertical and horizontal folds only, no diagonal folds (the test engine has them); seed shown; CSV export. |
| /tools/pat/cubes.html | Ace PAT Studio — Cube Counting: The T-Chart | Practice | ready | Numbers each cube bottom to top, front to back, left to right, tallies painted faces into a T-chart, then switches to a timed drill mode. | Opens in Teach mode with the timer idle; seed shown; CSV export. |
| /tools/pat/patternfold.html | Ace PAT Studio — Pattern Folding: Stay 2D | Practice | rough | Folds a cube net one face at a time around an anchored face, then drills spotting the mirror, rotation and wrong-neighbor traps. | Only 4 of 11 cube nets and cubes only (no pyramids or prisms the DAT uses); 'Sarah's playbook' and 'Sarah's line' coach names; seed shown. |
| /tools/pat/playbook.html | Ace PAT Studio — The Playbook | Practice | ready | The whole PAT on one page: format, the clock budget for each section, the method and the exact traps for each of the six types, and two section orders. | Not on Today; 7 small tap targets; its 'strugglers' order is the PAT test's 'Thomas order' under a different name. |
| /tools/pat/test.html | PAT Full Test | Tests | ready | Full 90-question, 60-minute PAT in test order: a scratch-paper setup step, mark-and-review navigator, 15 fixed retakable tests plus fresh ones, and a section-by-section review. | 'Thomas order' label is opaque to students; scratch pad says T-chart rows 1–5 while the grids guide says 0–5; 'Desktop recommended' banner (works fine on a phone). |
| /tools/pat-retold/ | PAT, Retold — Night 1 · The PAT Method Mindset | Learn | rough | Ten procedure-first nights (?night=1..10): mindset, one night for each question type, traps, hard cases and test-day pacing, with scenes, check questions and a progress bar. | Night 7 teaches the sliced painted-cube puzzle, not the DAT rule that the face on the table is unpainted; every night links to the Studio hub, not its trainer; no narration audio (13–15 404s per night; landing logs none); Teach mode toggle exposed. |
| /games/ | Ace Game Central | Practice | ready | Hub for 12-question timed rounds in Bio, GChem, QR and OChem plus the Chirality Bench and Six Views games, showing your best scores. | Promises 'the why behind every answer' but most Bio and QR items have none; mixes all sections; odd footer pointing to OChem Retold. |
| /games/play.html | Ace Game Central — Play | Practice | ready | With no subject in the URL it silently starts a 12-question Biology round. | Reachable only by URL; no subject choice; the page background ends partway down the screen. |
| /games/play.html?subject=bio | Ace Game Central — Play (Biology) | Practice | rough | 12-question timed Biology round from 508 items that leans toward topics you miss and brings misses back on a growing interval. | Only 158/508 items have an explanation; correct option is uniquely the longest in 307/508; terse flashcard stems ('Ten percent rule:'); raw topic codes ('ECO', 'TECH'). |
| /games/play.html?subject=gchem | Ace Game Central — Play (General Chemistry) | Practice | ready | 12-question timed General Chemistry round from 517 DAT-style items, each with an explanation. | Raw topic codes shown ('EQ-ICE'); small typo in an option ('x/[A]0' should be [HA]0). |
| /games/play.html?subject=ochem | Ace Game Central — Play (Organic Chemistry) | Practice | ready | 12-question timed Organic round with drawn structures from the verified 1,194-item bank, every item explained. | Large structure images mean long scrolling per item on a phone; atom labels drawn large and offset. |
| /games/play.html?subject=qr | Ace Game Central — Play (QR) | Practice | rough | 12-question timed QR round from 1,017 items across algebra, rates, probability and word problems. | Only 114/1017 items have an explanation (a miss shows only 'The answer is B'); many are bare arithmetic, not DAT-style; raw topic codes ('DEC-ARITH'). |
| /games/chirality/ | Chirality Bench · Ace Labs | Practice | ready | Ten-item rounds: rate your confidence, call R or S (or achiral), then turn a 3D model until H points away to see why, with a gallery of traps you have beaten. | Scrolls past the shared nav on load; 3D bench cramped on a phone with overlapping labels; 'Chirality Bench' heading plus 'ACE LABS' crowd one header line; grammar ('1 centers', '1 sessions'); results never reach Review. |
| /games/six-views/ | Six Views · Ace Labs | Practice | rough | Ten-item rounds of end-view and painted-cube-count questions: rate your confidence, pick, then walk a 3D room of the object to see the edge that ruled your choice out. | Views are full-width, so the choices sit about two screens down on a phone; tiny 3D room with 'WASD' keyboard hints; scrolls past the nav on load; always asks for the End view; results never reach Review. |
| /guides/pat-grids.html | PAT Grids and T Charts | Practice | rough | A printable method sheet for hole punching (grid method) and cube counting (T-chart), with pages of blank grids and T-charts to write on. | No viewport meta, so a phone shows it at desktop width with tiny text; shared nav injected into a print page; says 'open it in GoodNotes' but never links the PDF. |
| /guides/pat-grids.pdf | PAT Grids and T Charts (PDF) | none (URL only) | ready | A 4-page PDF of the same method sheet, ready to open in GoodNotes or print, with 15 hole-punch grids and blank T-charts. | Not linked anywhere; the file students are told to open in GoodNotes cannot be found from the site. |
| /tools/casper/ | Casper Practice Console · Ace Labs | Practice | ready | Casper (admissions situational-judgment test) practice: 26 timed scenarios with a self-score and quartile answer ladder, a full 11-station mock, on-camera video rehearsal, a typing trainer, progress tracking and a guide. | Not a DAT section and only a footnote link; own header plus 'Ace Labs' button duplicating the nav; coach-facing copy ('Coaching a student?', 'coach toward this'); AI feedback needs a coach code; Decision Arcade has only 5 items, correct always longest. |

## Tests and mocks: tests/ (all), prometric-mock.html, unified-mock.html, mocks-catalog.html, diagnostic.html, tools/mock/, tools/minitests/, performance/

I checked 10 HTML pages and 4 dev or QA files in this area that anyone can open by URL. Every page was captured at 390x844, and I ran each test from start to finish on a phone viewport (diagnostic, practice tests, full-length, Climb rung 1, the legacy OChem sampler), then checked Performance with real results in it.

What already works:
- **Full-length DAT** (/tools/mock/full.html) is the best thing in this area. It has 4 complete 280-question tests: sciences, PAT with real drawn figures, the break, Reading with a Passage/Question toggle, and QR. It shows no console errors and gives a polished report.
- **The Climb** (/tools/minitests/) is finished and works on a phone: 10 rungs of 40 questions, plus a spaced queue that brings misses back.
- **The Tests door** (/tests/) is a clean, well-ordered hub.

Main defects:
1. **Full-length results are invisible to the rest of the app.** The full-length mock saves results under `al:mockHistory`, and `shared/ace-progress.js` never reads that key. So full-length results never appear on Performance, the misses never reach Review, and the Today plan (`nextTest`) only ever suggests the diagnostic, then practice tests 1 to 3, then PAT tests. It never suggests the full-length.
2. **Practice tests (/prometric-mock.html) draw blank molecules.** The page calls `SmiDrawer.draw(smi, canvasElement)`, but this version of the library needs a `'#id'` selector. It throws a console SyntaxError, and 21 OChem items across the 3 tests show an empty white box where the structure should be. `full.js` passes the selector correctly.
3. **Practice tests have more problems:**
   - Every question shows its topic, difficulty and internal tags while the test runs (for example "ITEM 74 · AB-OCHEM · DIFF 3").
   - The report is pushed about 80px right on a phone, and its topic table runs 32px off screen.
   - The copy contradicts itself: "PAT and Reading not built yet" next to "PAT and Reading are in the full-length". The rules say a refresh ends the section, but the code actually resumes.
4. **The diagnostic reuses practice-test questions.** It draws from `scripts/dat-mock-bank.json` without removing practice-test items: 120 of its 150 Bio questions and 14 of its 21 QR questions are also in the 3 practice tests. It also shows mismatched counts: the intro text says 15 QR, the pill says 8 and the code comments say 53. It is called "short" but runs 45 minutes. It has no PAT or Reading. It loads a 1 MB file.
5. **Dev and QA files are public.** /tests/ is both the student Tests door and the dev test folder, and everything in the repo gets published. Anyone can open:
   - the 10 test scripts (*.test.js and *.mjs under tests/)
   - an OChem 2026 gallery that prints every answer key
   - a QR figure harness
   - the full-length QA files (`tools/mock/verification/*.json`)
   - the Climb's build script and source questions
6. **Legacy pages.** mocks-catalog.html and unified-mock.html are already 301-redirected in `netlify.toml`, but the files still ship, with stale copy ("prototype", "Bio/GC bank extraction not yet wired").

Smaller items:
- **The Summit name collision.** "The Summit" is both the OChem 30-question test and the name of Climb rung 10.
- **The Today name collision.** The Climb's own "Today" tab duplicates the site-wide Today door.
- **Full-length has no site nav.** It does not load `shared/ace-shell.js`. If it did, the nav's rules would put it under Practice, because only the `/tools/` catch-all matches it.
- **Performance sits under the wrong door.** The nav highlights Review on Performance, but students reach it mainly from the Tests page.
- **Wrong wording on results.** "You answered 244 of 280" actually means 244 correct.

### Organization notes

Suggested setup for students:

**1. One entry point: the Tests door (/tests/).** Keep its current order and give each card a status line ("Test 2 of 4 next", "Rung 3", "Taken Oct 30"). The order:
- **Start here:** the Diagnostic, re-labelled honestly as about 45 minutes across Bio, GC, OChem and QR.
- **Every day:** The Climb.
- **Full-length DAT:** make this the hero card. Say "4 tests" on it and have it open the test picker.
- **Section tests:** Sciences + QR (the current practice tests), PAT tests, Reading sections, OChem 30. Fold the "Section checks" links in here as small cards.
- **Test week:** test-week mode and the test-day briefing.

**2. Names.** Use "Full-length DAT 1 to 4" and "Sciences + QR test 1 to 3". Drop "Full practice tests", "Prometric mocks", "pacing simulation" and "mock catalog". Two collisions to fix:
- Rename the OChem test (for example "OChem 30") or rename Climb rung 10 so "The Summit" means one thing.
- Rename the Climb's inner "Today" tab to "Queue" so it doesn't duplicate the Today door.

Use the title pattern "<Name> · Ace Labs" everywhere. The practice tests currently say "Ace The DAT · Practice Tests", and the run header says "AceTheDAT.com".

**3. Ranking, and what to say about the practice tests.**
- Full-length DAT goes first in every recommendation. It is the best tool, it already covers what the practice tests cover, and it adds PAT and Reading.
- Keep the 3 practice tests only as "Sciences + QR, 2h 15m". Fix the molecule drawing, hide the topic and difficulty labels during the test, fix the report layout on phones, and remove the contradictory copy. Or retire them once the full-length is wired in.
- The diagnostic should exclude practice-test and full-length items, and say its real length.

**4. Wire results into one place (`shared/ace-progress.js`).**
- Add result and miss adapters for full-length results (`al:mockHistory` / `acelabs.fullmock.v1.*`), so Performance and Review show them.
- Make `nextTest()` recommend full-length 1 to 4.
- Add a "Full-length" filter on Performance.
- Either move Performance under the Tests door (add `/performance` to the Tests rule in `shared/ace-shell.js`), or keep it as Review's tab and put a "Your results" card on /tests/. Students should see it as "results of tests".

**5. Shared nav.** Add `shared/ace-shell.js` to `tools/mock/full.html`, and add `tools/mock` to the Tests rule in `shared/ace-shell.js`. The nav already hides itself while a timed section runs.

**6. Hide.**
- Delete or leave redirected: mocks-catalog.html and unified-mock.html.
- Move the dev tests out of the student-facing /tests/ path, for example to /dev-tests/. Or add forced redirects for /tests/bio/*, /tests/pat/*, /tests/shell/*, /tests/ochem2026/* and /tests/qr-formats/*. Redirect only those subfolders, not /tests/ itself.
- Also redirect `/tools/mock/verification/*`, `/tools/minitests/source/*` and `/tools/minitests/assemble-minitests.mjs`.
- The OChem 2026 gallery prints answer keys, so it should not be public.

**7. For the showcase for Thomas**, show this flow: Diagnostic, then The Climb daily, then Full-length DAT 1 at the start, 2 at mid-prep, 3 and 4 in the last two weeks, then Test-week mode. Results go to Performance and misses go to Review.

| url | title | door | status | for the student | problems |
|---|---|---|---|---|---|
| /tests/ | Tests · Ace Labs | Tests (this is the Tests door itself; shell nav on every page; also linked from /ace-labs.html, /review/ (JS empty state), /test-day-readiness.html, /scope.html, /tools/mock/full.html 'All tests'; JS-built in shared/ace-progress.js) | ready | The hub that lists every timed thing: diagnostic, Climb, full-length DAT, practice tests, PAT, Reading, the OChem Summit, section checks and test week. | Static: shows no progress (which tests are taken or next). Calls the diagnostic 'short' (it is 45 min). 'Full-length DAT' and 'Full practice tests' sound alike. 'The Summit' collides with Climb rung 10. Promises that Review fixes every miss, but full-length misses never reach Review. Its folder also holds the publicly served dev test scripts. |
| /tools/mock/full.html | Full-Length DAT / Ace Labs | Tests (linked from /tests/ and the Today 'Prove' room); does not load the shell nav, and the shell rules would put it under Practice | ready | Four complete 280-question DATs in test-day order (Sciences, PAT, optional break, Reading, QR), with section clocks, exhibit and calculator, resume, and a raw-score report that links each miss to its fix. | Results go to al:mockHistory, which shared/ace-progress.js never reads: not on Performance, misses not in Review, never suggested by the Today plan. No six-door nav. The report says 'You answered 244 of 280' when it means correct. 520 KB data file plus PAT engine to load on a phone. |
| /tools/minitests/ | The Climb — Ace Labs Mini Tests | Tests (linked from /tests/ and /ace-labs.html; JS-built in the shared/ace-progress.js daily plan; shell rule maps it to Tests) | ready | Ten timed 40-question mini tests that get harder rung by rung, plus a daily queue that brings each miss back as a fresh question until it sticks. | Its inner 'Today' tab duplicates the site-wide Today door. Rung 10 is named 'The Summit', the same as the OChem test. The tab bar wraps to two lines on a phone once counts appear. Brands itself 'AceTheDAT' instead of Ace Labs. Sciences and QR only. |
| /diagnostic.html | Ace Labs · Cross-Section Diagnostic | Tests (linked from /tests/, /ace-labs.html, /review/ and /performance/ empty states, /onboarding.html, /test-week.html, /404.html, Bio hub pages; first step of nextTest in shared/ace-progress.js) | rough | A 60-question, 45-minute check across Bio, Gen Chem, OChem and QR that shows accuracy per section and the three weakest topics, with links to start studying. | Practice-test questions reused, which spoils those tests later. Counts disagree: intro says 15 QR, the pill still says 8, the code says 53. Called 'short' but runs 45 min. No PAT or Reading. Loads a 1 MB bank on a phone. Old light theme with a second brand bar under the dark site nav. Results page suggests the Sciences+QR practice test instead of the full-length. |
| /prometric-mock.html | Ace The DAT · Practice Tests | Tests (linked from /tests/, /ace-labs.html, /test-week.html, /test-day-readiness.html, /for-retakers.html, /scope.html, /404.html, /retold/, /calendar.html, diagnostic results; JS-built by nextTest in shared/ace-progress.js and by tools/rc-retold) | rough | Three Sciences + QR practice tests (100 questions in 90 min, optional break, 40 QR in 45 min) with exhibit, calculator, mark and review, and a raw-score report. | OChem structures draw as blank boxes on 21 items: SmilesDrawer is given a canvas element instead of a '#id', which throws a SyntaxError during the test (0 errors on the landing page). Shows topic, difficulty and internal tags on every question. Report is offset about 80px on a phone and its topic table runs 32px off screen. Contradictory copy: 'PAT/RC not built yet' versus 'in the full-length'; 'refresh ends the section' versus the actual resume. Old light theme and 'AceTheDAT.com' header. |
| /performance/ | Performance · Ace Labs | Review (shell rule highlights Review) but linked from the /tests/ intro, the Today page and the footers of every door page | rough | Every timed result over time: percent correct by section, seat time against the test-day clock, top missed topics (each linking into Review), and a table of every attempt. | Never shows Full-length DAT results (no adapter for al:mockHistory) and has no 'Full-length' filter, so the flagship test is missing. The nav lights Review although students reach it from Tests. Works well on a phone otherwise, with a good empty state. |
| /mocks-catalog.html | Ace Labs · Mock catalog | none (301 to /tests/ in netlify.toml and _redirects; only linked from /unified-mock.html) | legacy | Old catalog explaining the 3 practice tests (take Test 1 early, Test 2 at the midpoint, Test 3 near the date) with a link to the full-length. | Stale claim that PAT and Reading 'need banks Ace Labs does not yet ship' next to a full-length card that includes them. Calls Test 1 'Diagnostic', which clashes with /diagnostic.html. Old light theme. The file still ships even though the URL redirects; delete it. |
| /unified-mock.html | Ace Labs · Survey of Natural Sciences Mock | none (301 to /prometric-mock.html in netlify.toml and _redirects; no inbound links) | legacy | Old prototype that samples 30 OChem questions by difficulty mix under a 90-minute clock. | Labelled 'prototype'. A 90-minute clock for 30 questions. Shows difficulty during the test. Disabled Bio and GC checkboxes plus an alert that bank extraction is 'not yet wired'. Its nav points to the retired mock catalog. Delete it. |
| /tests/ochem2026/gallery.html | 2026 set gallery | none (reachable by URL only; no shell) | internal | Dev visual check that renders every 2026 OChem item with its figure and all five choices. | Publicly served, and prints the answer key for every item ('af-01 (key A)'), leaking keys for the OChem 2026 set. A 141,000px-tall page. Sits inside the student Tests folder. Needs a forced redirect or a move out of /tests/. |
| /tests/qr-formats/figures.html | QR Figures Harness | none (reachable by URL only; used by tests/qr-formats/render-figures.mjs) | internal | Dev harness that draws QR data-interpretation figures by id; it is a blank page without ?ids=. | Blank cream page when opened plainly. Publicly served under the student /tests/ path. Hide it. |
| /tests/pat/pat.test.js | (dev test script; also tests/pat/helpers.js, tests/bio/bio-stick.test.js, tests/shell/ace-progress.test.js, tests/qr-formats/qr-formats.test.js, tests/qr-formats/render-figures.mjs, tests/ochem2026/run.mjs, browser.mjs, render.mjs, shoot.mjs) | none (reachable by URL only) | internal | Nothing for students: Node/Vitest test scripts that are published because the repo root is the publish directory. | 10 dev files are served under the same /tests/ path as the student Tests door. Move them (for example to /dev-tests/) or add forced redirects for /tests/{bio,pat,shell,ochem2026,qr-formats}/*. |
| /tools/mock/verification/rejected.json | (QA data: full-length items rejected in review) | none (reachable by URL only) | internal | Nothing for students: the reviewer's notes on why candidate full-length items were rejected. | Coach and dev QA notes are publicly served. Redirect /tools/mock/verification/*. |
| /tools/mock/verification/verified.json | (QA data: full-length items verified) | none (reachable by URL only) | internal | Nothing for students: the list of item ids verified for each full-length test. | Publicly served QA data. Redirect it with rejected.json. |
| /tools/minitests/source/minitest-source.json | (build source for The Climb bank; with tools/minitests/assemble-minitests.mjs) | none (reachable by URL only) | internal | Nothing for students: the authoring source the Climb's bank.js is built from (376 KB). | The build source and build script (assemble-minitests.mjs) are publicly served. Redirect /tools/minitests/source/* and the .mjs file. |

## Shell and support pages: Today (ace-labs.html), the Learn, Practice and Review door pages, onboarding, test week, test-day briefing, calendar, cheat sheets, retakers, scope, Booster map, 404, the Retold hub, the whole tricks/ folder, and the internal docs at the root and in docs/, specs/, research/, test-screenshots/ (no tutor/ folder exists)

I inventoried 46 entries: 22 pages plus 13 trick videos in tricks/, 2 internal studio pages, and 9 internal doc entries. I took a phone screenshot of each (390x844 at 2x) and also ran flows: onboarding, Today for a returning student, Review with misses, Test week with a date set. Six pages of this list are ready (Today, Learn, Practice, Review, 404, trick sheets), and so is the videos gallery. 19 are rough, 3 are legacy, and 15 are internal or dev material. Only one page is truly broken for students, the Topic TikTok renderer, which I counted as internal because no student page links to it on purpose (the Climb does, by mistake).

I left out pages that other area agents screenshotted: diagnostic.html, prometric-mock.html, mocks-catalog.html, unified-mock.html, performance/, tests/*, guides/ and games/. They are mentioned below only where my pages link to them.

The only console errors are on the 13 trick videos. Each one asks for tricks/videos/voiceover/<tip>/manifest.json, gets a 404, and plays without narration because that folder does not exist. No page in this area scrolls sideways at 390 px. The Topic TikTok renderer draws a fixed 1320 px frame that gets cropped on a phone.

THE SHELL (shared/ace-shell.js) is a dark-and-gold bar with six doors: Today (/), Learn (/learn/), Practice (/practice/), Tests (/tests/), Review (/review/), and Canon. Canon is an outside page on the portal that opens in a new tab. All six fit in one row at 390 px. Which door lights up comes from rules in the script:
- Today: /, ace-labs, onboarding, for-retakers.
- Tests: tests, diagnostic, prometric-mock, unified-mock, mocks-catalog, calendar, test-week, test-day-readiness, plus some timed tools.
- Learn: learn, retold, tricks, cheat-sheets, plus the Retold course folders, ochem/roots and the Bio AP bootcamp.
- Review: review, performance.
- Practice: everything else under tools, games, guides.
- No door: scope, booster-map, 404.

TODAY (/ = ace-labs.html, "Ace Labs | Today"), top to bottom:
1. Hero card. AceTheDAT logo, a "DAT in N days" pill (once a date is saved), a greeting, the heading "Time to get in the lab.", and three numbered steps with times.
   - First visit: (1) Set your test date and shakiest sections, /onboarding.html, 2 min. (2) Take the diagnostic, /diagnostic.html, 45 min. (3) Open your first lesson night, /learn/, 30 min.
   - Returning student: steps come from AceProgress.today(). They are "Retry N misses in Review" (/review/?due=1), The Climb (/tools/minitests/), a Retold night for the weakest section (course ?night=n), and the next test (diagnostic, then Practice tests 1 to 3, then PAT tests).
   - Coach plan: replaces the steps only after a portal handoff, via /api/tutor, which is not in this repo.
   - Below the steps: a gold "Start the next step" button, the total time, and "Stuck on something? Talk to a coach", which goes to acethedat.com/contact.html (portal students get Message your coach instead).
2. Status row, three panels.
   - Readiness by section, "Right answers so far": raw-count bars for Bio, GChem, OChem, PAT, RC, QR, with a link to Take the diagnostic or See Performance.
   - Next test: title, detail, minutes and test date, with an Open button.
   - Repair queue: counts plus the top 3 misses, each with Sheet (Canon) / Learn / Drill, and an "Open Review" link.
3. Jump chips: Learn 14, Practice 6, Repair 2, Prove 5, Play 3, Test week 5.
4. Room 1 of 5, Learn.
   - The six Retold courses: Bio /tools/bio-retold/, GChem /tools/gchem/, OChem /tools/organic/, QR /tools/qr-retold/, PAT /tools/pat-retold/, RC /tools/rc-retold/.
   - Engines that teach: Bio Repair Lab /tools/bio/, Gen Chem engine /tools/gc/, OChem Reaction Maps /tools/ochem/, QR engine /tools/qr/, The Roots of Organic /tools/ochem/roots/, The Two Decisions /tools/ochem/decide/.
   - Refreshers: The trick library /tricks/, Cheat sheets /cheat-sheets.html.
5. Room 2, Practice.
   - Tiles: The Climb /tools/minitests/, Game Central /games/, Reading /tools/rc/, PAT Studio /tools/pat/, The Tree of Organic /tools/ochem/tree/, The diagnostic /diagnostic.html.
   - Drawer "Every drill, by section (29 more)":
     - Bio, 10 chips: bio-cell, genetics, physiology, evolution, diversity, devo, immune-cells, micrographs, bonus, repair-sheet.
     - GC, 4: traps, recognition-lab, trends, lewis-sandbox.
     - OChem, 1: Classic course engine /tools/ochem/v2/.
     - QR, 7: qr-pattern-system-v1, then pacing-sim, guess-ev, mental, estim, probability-sandbox, stats-lab under /tools/qr/proposals/agent-0X/.
     - PAT, 7: keyholes, tfe, angles, holepunch, cubes, patternfold, /guides/pat-grids.html.
6. Room 3, Repair: Review /review/, Ace Cards /tools/bio/#aceCardsSection.
7. Room 4, Prove.
   - Tiles: Full-length DAT /tools/mock/full.html, Practice tests /prometric-mock.html, PAT tests /tools/pat/test.html, The Summit /tools/ochem/summit/, All tests /tests/.
   - "Section checks" chips: Bio pulse check, Bio weakness scan, QR Friday mini mock.
8. Room 5, Play: Chirality Bench /games/chirality/, Six Views /games/six-views/, and "Mnemon: Biology, coming soon", which is not a link.
9. "The last stretch" shelf: Performance, Set up your path, Test-week mode, Test-day briefing, Going again.
10. Footer: Scope and evidence, the scope strip and disclaimer from scope.js, and the line "not affiliated with ADA or Prometric".
On a phone the page is about 8,200 px tall.

LEARN (/learn/, "Learn · Ace Labs"):
- Header: eyebrow Learn, "Learn it once, the right way.", lede about Retold and Canon sheets.
- "The six Retold courses", built in JS from shared/ace-index.js. In order: Bio (14 nights), GChem (14), OChem (13), QR (14), PAT (10), RC (10). Each card has a blurb, a "Start night 1" or "Continue with night n" button (course ?night=n), and an "All N nights" disclosure. Each night links to the course and has a "Sheet" link to its Canon sheet on the portal (new tab), with a Walked tag once done.
- "OChem foundations": The Roots of Organic /tools/ochem/roots/, The Tree of Organic /tools/ochem/tree/, The Two Decisions /tools/ochem/decide/.
- "Quick refreshers": The trick library /tricks/, Cheat sheets /cheat-sheets.html, The Canon (portal, new tab).
- Footer "More": Set up your path, Performance, Test week, Test-day briefing, Going again, Scope and evidence, then the not-affiliated line.

PRACTICE (/practice/, "Practice · Ace Labs"):
- Header: "One engine per section." and "every engine sends misses to Review".
- "Section engines", one card each with an Open button and a "More" row:
  1. Bio Repair Lab /tools/bio/. More: Cell and molecular, Genetics, Structure and function, Evolution and ecology, Diversity, Development, Immune cells, Micrographs, Bonus topics, Repair sheet.
  2. Gen Chem engine /tools/gc/. More: Common traps, Recognition lab, Periodic trends, Lewis and VSEPR sandbox.
  3. The Tree of Organic /tools/ochem/tree/. More: OChem, Retold (the course) /tools/organic/, The Summit (timed), Roots, Reaction maps /tools/ochem/, The Two Decisions, Classic course engine (v2) /tools/ochem/v2/.
  4. QR engine /tools/qr/. More: Pattern system, Pacing simulator, Guessing math, Mental math, Estimation, Probability sandbox, Stats lab.
  5. PAT Studio /tools/pat/. More: Keyholes, Top front end, Angle ranking, Hole punching, Cube counting, Pattern folding, The Playbook, Grids and T charts guide.
  6. Reading /tools/rc/, with no More row.
- "Games": Game Central /games/, Chirality Bench /games/chirality/, Six Views /games/six-views/.
- A note line, "Also here: Casper practice" /tools/casper/.
- The same footer as Learn.

REVIEW (/review/, "Review · Ace Labs"):
- Header: "Every miss, one list."
- Status tabs: Due now / All open (the default) / Learning / Reviewing / Mastered, with counts (due, open, mastered).
- Section tabs: All sections, Bio, GChem, OChem, QR, PAT, RC. They only appear when misses span more than one section.
- Miss rows: concept, section, status tag, source and when the next retry is due. Links: Sheet (Canon, new tab), Learn (Retold night), Drill (section engine), and an "Ask Ace" link to /tutor/?miss=. That link only shows if ace-button.js is loaded, which never happens, and /tutor/ does not exist. Buttons: Got it / Missed again, or "Back to review" for mastered items.
- Empty state links the diagnostic and /tests/.
- Then the ladder explainer (1, 3, 7 days), "Performance has every timed result", and the same footer.
- Flow check: diagnostic misses showed up with live Sheet, Learn and Drill links. The Today hero then put "Retry 3 misses in Review" first.

TESTS (/tests/) belongs to another area. It links into this area: test-week, test-day-readiness (three times each), onboarding, for-retakers, scope.

Problems that cut across the area:
- Two visual systems. Today and the four door pages use the new dark green and gold look. Onboarding, test week, test-day briefing, calendar, cheat sheets, retakers, scope, 404 and the Retold hub still use the older cream design, each with its legacy header hidden by the shell.
- Placeholder and developer text that students can see:
  - Test week heading "Test in N days." before a date is saved.
  - Retakers footer: "Eventually wired to acethedat-portal.netlify.app for tutor sync".
  - Scope: "Reviewer credentials: not yet published".
- PAT and RC are missing from onboarding, cheat sheets, the Test week drill chips and the calendar.
- The Climb sends OChem misses to the internal Topic TikTok renderer (tools/minitests/remediation-map.js, seriesBase), which does not work on a phone.
- Trick videos have no narration, and the shorts and videos carry TikTok calls to action ("comment your pick", "follow for one trick a day").
- The trick library is the public lead-magnet page, with an email form.
- Every Retold course's title link goes to the older /retold/ hub instead of /learn/.
- Production 301-redirects (netlify.toml) already hide the root .md files, docs/, specs/ and research/. /scripts/ and the node test files under /tests/ are still served.

### Organization notes

Best entry point: Today (/). It already does the right job: three timed steps, raw counts, the next test, the top misses. Make it the only home and slim it.
- Keep the hero, the status row and one strip with the five doors.
- Cut the five catalogue rooms that repeat the door pages (Learn, Practice, Repair, Prove, Play), or fold them into a short "All tools" link.
- If any rooms stay, name them after the doors. Today says Repair, Prove and Play; the doors say Review, Tests and Practice.
- Remove the "Mnemon, coming soon" tile.
- Change "Talk to a coach" so it does not point enrolled students at the public contact page.

First run should be one path: Setup, then the diagnostic, then the first Retold night.
- Rebuild onboarding in the dark look and add PAT and RC to the weak-section step.
- Make "Going again" (for-retakers) a branch of setup, not a separate brochure. Let the student enter real section scores, and delete the developer footer.

Learn (spine: the six Retold courses):
- Under each course, put that section's foundations (OChem Roots and Two Decisions today) and its sheets.
- Merge the three overlapping sheet products into one "Sheets" shelf with a section filter: cheat-sheets.html (4 sections, cream), tricks/sheets.html (14 OChem and GC cards) and the Canon on the portal (all 6 sections). The Canon is the most complete; keep it as the source.
- Merge shorts and videos into one "Tricks" gallery: one card per trick with Short, Full video and Sheet.
- Give enrolled students a trick page without the "Free, no login" email form. Keep the lead-magnet version at a separate marketing URL.
- Redirect /retold/ to /learn/ and repoint every Retold course's title link and the 404 page to /learn/.
- Consider making Canon part of Learn rather than a sixth top-level door that leaves the app.

Practice: one engine card per section in DAT order (Bio, GChem, OChem, PAT, RC, QR, the order Today's readiness list uses).
- Put the Climb (the daily mixed drill) at the top. It is on Today and Tests but missing here.
- Move the OChem Retold course and the Summit out of the OChem "More" row (they are Learn and Tests items).
- Drop the legacy v2 engine.
- Give the QR extras clean URLs instead of /tools/qr/proposals/agent-0X/.
- Keep games as their own row. Move Casper out of DAT practice (or label it "Beyond the DAT").

Tests:
- Keep test week and the test-day briefing grouped as "Test week".
- Fix the "Test in N days" placeholder and the stale "calm calendar" copy.
- Add a visible link from test week to the test-day briefing.
- Fact-check the briefing's interface claims against the current ADA and Prometric tutorial before release.
- calendar.html is already redirected in production; delete it.

Review: Review plus Performance (as a tab or second view).
- The Ace Cards tile on Today is a preview of the same list; drop it.
- Remove the dead "Ask Ace" /tutor/ wiring until the tutor page ships.

Keep outside the doors:
- Scope and evidence, as "About Ace Labs" in the footer. Rewrite it so it does not call Ace Labs "supplemental, not a primary course", and refresh the stale known-gaps list.
- 404. Point it at the five doors.

Hide or delete before release:
- booster-map.html: names a competitor and is unlinked; coach-shared only, or delete.
- tricks/series/ (redirect stub).
- tricks/series/topic-tiktok.html. Repoint the Climb's seriesBase to /tricks/shorts/short.html?topic= or the matching video.
- Both voiceover studios.
- The root .md docs and docs/, specs/, research/, test-screenshots/ (empty). The .md docs and docs/, specs/, research/ are already redirected in production.
- Add redirects for /scripts/* and the node test files under /tests/. ACELABS_STUDENT_FAQ.md is badly stale (says no PAT or RC, names competitors and old coaches); keep it hidden.

Names to use everywhere:
- Doors: Today, Learn, Practice, Tests, Review.
- Sections: Biology, General Chemistry, Organic Chemistry, Perceptual Ability, Reading Comprehension, Quantitative Reasoning, with short forms Bio, GChem, OChem, PAT, RC, QR. Today the pages mix GC, Gen Chem, GChem, Organic, Orgo, Reading.
- "X, Retold" for courses, "engine" for each section's drill tool, "Sheets" for all one-pagers, "Tricks" for shorts and videos, "Practice tests" and "Full-length DAT" for timed tests.
- "Ace Labs" (not "AceLabs"). "Going again" works for retakes.

| url | title | door | status | for the student | problems |
|---|---|---|---|---|---|
| /ace-labs.html | Ace Labs / Today | Today (it is the Today door; production rewrites / to this file) | ready | The home dashboard: three timed steps for today, right-answer counts by section, the next test, the top open misses with Sheet, Learn and Drill links, then a catalogue of every tool in five rooms. | About 8,200 px long on a phone (ten screens). Room names (Learn, Practice, Repair, Prove, Play) do not match the doors. Engines appear under both Learn and Practice. Dead 'Mnemon: Biology, coming soon' tile. 'Talk to a coach' goes to the public contact page. Coach plan depends on /api/tutor, which is not in this repo. Jump-chip counts are hard-coded. |
| /learn/ | Learn · Ace Labs | Learn (door page) | ready | Lists the six Retold courses with a Start or Continue button and every night paired with its Canon sheet, then the OChem foundations and the quick refreshers. | Sheet links and the Canon card leave the app for the portal in a new tab. Three overlapping sheet products sit side by side (trick library, cheat sheets, Canon). Foundations exist for OChem only. The course list is built in JS, so it is blank without JS. |
| /practice/ | Practice · Ace Labs | Practice (door page) | ready | One card per section engine (Bio Repair Lab, Gen Chem engine, Tree of Organic, QR engine, PAT Studio, Reading) with its extra tools underneath, then three games and a Casper link. | The Climb and the diagnostic are missing here though Today shows them under Practice. The OChem card has six 'More' links, including the Retold course, the timed Summit and the legacy v2 engine. QR extras live at /tools/qr/proposals/agent-0X/ URLs. Casper, not a DAT section, sits in a one-line footnote. QR says 'forty-four skills' while scope says 45. |
| /review/ | Review · Ace Labs | Review (door page) | ready | Every miss from tests, drills, engines and games in one list on a 1, 3 and 7 day retry ladder, each with Sheet, Learn and Drill links and Got it / Missed again buttons. | Empty for a new student until a diagnostic or test is taken. An 'Ask Ace' link to /tutor/ is wired, but that page does not exist (the link stays hidden because ace-button.js never loads). Sheet links leave for the portal. Performance has no door of its own. |
| /onboarding.html | Get Started · Ace Labs | Today (shell rule); linked from Today hero step 1 and the Today shelf, the door-page footers, the Tests page and Going again | rough | Three-step setup (test date, first attempt or retake, shakiest sections) that saves in this browser and sends you to the diagnostic, the retake page, or test week if the DAT is 14 days out or less. | The weak-section step offers only Bio, Gen Chem, OChem and QR (no PAT, RC). Old light cream design, unlike the dark Today. Setup lives only in this browser. The legacy header is hidden, so the 'Skip setup' footer is the only exit besides the shell. Em dash in the copy. |
| /test-week.html | Test Week · Ace Labs | Tests (shell rule); linked from the Tests page, the Today shelf, the door-page footers, the 404 page, and onboarding when the DAT is 14 days out or less | rough | A last-14-days plan: set your DAT date, then four steps (diagnostic, cheat sheets, one pacing practice test, the daily plan on Today), plus a 'Stuck? Take a beat' calm-down panel. | New visitors see the literal heading 'Test in N days.' until they save a date. The lede still promises a 'calm calendar' that no longer exists. Drill chips cover Bio, QR, OChem and GC only, and the OChem chip opens the Retold course instead of a drill. No visible link to the test-day briefing (only in the hidden legacy header). Recommends the 140-question test, not the full-length. Cream design, em dashes, arrow glyph. |
| /test-day-readiness.html | Test-Day Readiness · Ace Labs | Tests (shell rule); linked from the Tests page, the Today shelf, the door-page footers, the 404 page and the Retold hub | rough | Eight short briefings on what real test day feels like (navigation lag, marking, RC scroll reset, break timing, the QR calculator, keyboard shortcuts, center rules, asking the proctor), with small click demos and a get-ready checklist. | Several claims are hearsay or dated and need a fact check against the current ADA and Prometric tutorial: it says there is no mid-section navigation, it lists 'reported' keyboard shortcuts, and it cites mask rules. Very long on a phone (about 13,300 px). Redundant 'Back to Ace Labs' link under the shell. Cream design, em dashes. |
| /calendar.html | Ace Labs · Test Week Calendar | Tests by shell rule, but no page links it; production 301-redirects it to /test-week.html | legacy | The old seven-day countdown calendar built from your test date and the diagnostic's weak topics. | Unreachable in production because of the redirect. Its plans name Bio, GC, OChem and QR only. Safe to delete. |
| /cheat-sheets.html | Cheat Sheet Hub · AceLabs | Learn (Quick refreshers on Learn, Refreshers room on Today, Test week step 2) | rough | Printable expandable shortcut cards for OChem, QR, Gen Chem and Bio (patterns, coach tricks, GC shortcuts, micrographs, bonus topics), each linking into its engine. | Covers four sections only (no PAT, RC) despite the heading 'Everything you need'. Says 'all four engines'. Spelled 'AceLabs'. Has its own sticky sub-nav under the shell. Cream design. About 10,400 px long. |
| /for-retakers.html | Going Again · Ace Labs | Today (shell rule); linked from the Today shelf ('Going again'), the door-page footers, the Tests page, and onboarding for retakes | rough | Encouragement and a three-step path for a retake: open your weakest engine, take a practice test, then follow Today. | Visible developer note in the footer: 'Eventually wired to acethedat-portal.netlify.app for tutor sync'. No way to enter real section scores despite telling you to work from your real attempt. The copy predates PAT, RC and the full-length, and names only the 140-question test. Claims engines are reordered by weak areas. Cream design, em dashes. |
| /scope.html | Ace Labs · Scope & evidence | None (the shell highlights no door); footer link on Today, Learn, Practice, Review, Performance and the 404 page | rough | Explains what Ace Labs covers, bank sizes, practice-test limits, the no-score-prediction rule, known gaps, non-affiliation, and how to report a content error. | Calls Ace Labs 'a supplemental repair lab, not a primary DAT prep course', which works against releasing it as the one tool. Shows 'Reviewer credentials: not yet published'. The Known gaps list is stale (Review, the unified queue and the mobile pass have shipped). OChem is described as 11 hubs and 388 questions while other copy says 18 hubs. Arrow glyph, em dashes. |
| /booster-map.html | Booster Bank Map / AceTheDAT | None (no page links it; reachable by URL only; no shell) | internal | Maps every chapter of a third-party question bank to the Canon sheet that teaches it, with a search box, so a student can open the right picture after a miss. | Names a competitor product, against the house rule; the name gate exempts it as 'legacy unlinked page held for a keep-or-delete decision'. No Ace Labs shell. Asks students not to share the link. About 42,000 px long. Decide before release whether a coach shares it or it is deleted. |
| /404.html | Ace Labs · Page not found | None (Netlify serves it for any missing URL) | ready | A friendly not-found page with eight shortcuts: home, Retold courses, diagnostic, practice tests, trick library, test week, test day, scope. | Points at the legacy /retold/ hub instead of /learn/. Shortcuts do not follow the five doors. Cream design. |
| /retold/ | Retold · Learn the subject / Ace Labs | Learn by shell rule; no door page links it, but every Retold course's title link, the 404 page and the Climb's fallback do | legacy | Older landing page that explains the Retold learn-then-drill idea and lists the six courses. | Still the target of every course's title link, so students bounce between two course hubs. Cream design, em dashes. |
| /tricks/ | The 14 DAT Tricks — Ace the DAT | Learn (Learn 'Quick refreshers', Today 'Refreshers', and the 404 page) | rough | Index of the 14 OChem and Gen Chem tricks, with buttons to the 40-second shorts, the full videos and the one-page trick sheets. | This is the public TikTok lead-magnet page, shown to enrolled students: 'Free. No login, no catch' plus an email sign-up form posting to Netlify Forms. Only OChem (10) and Gen Chem (4) though titled 'Every DAT trick'. The 14-trick list is not linked. Em dashes. |
| /tricks/sheets.html | The 14 Trick Sheets — Ace the DAT | Learn (shell rule); reachable only through the trick library and the trick videos page | ready | Fourteen dark one-skill cards in test-day order (rich attacks poor, EAS, CARDIO, SN/E, R/S, NMR, alkenes, IR, Newman, ozonolysis, redox, electrochem, limiting reagent, periodic trends), made to screenshot. | The 'Rather watch?' link goes to the /tricks/series/ redirect stub. Hard to find. Em dashes. |
| /tricks/series/ | Moved to Trick Shorts — Ace the DAT | Learn (shell rule); linked only from the trick sheets' 'Rather watch?' link | legacy | Redirect stub that forwards to Trick shorts. | An extra hop. Repoint the sheets link, then delete. |
| /tricks/series/topic-tiktok.html | Ace The DAT — Topic TikTok | None (no shell); the Climb sends OChem misses here through tools/minitests/remediation-map.js (seriesBase) | internal | A 1080 px TikTok frame renderer for recording the Trick Series (?topic=key); not a study page. | On a phone it shows a cropped 1080 px frame (blank without ?topic=), yet the Climb links students to it after a miss. Repoint the Climb to the short or the video, then hide this page. |
| /tricks/series/voiceover-studio.html | Ace The DAT — Voiceover Studio | None (URL only, no shell) | internal | Crew-only tool for recording narration for the Trick Series TikToks. | Publicly reachable by URL. The 'Crew only' banner text is nearly invisible (light on light). |
| /tricks/shorts/ | Ace the DAT — Trick Shorts | Learn (shell rule; from the trick library button and the series stub) | ready | A grid of the 14 question-first 40-second shorts; tap a card to try the question, then see the trick. | 'Full breakdowns live in Trick videos' is plain text, not a link. Only reachable through the trick library. |
| /tricks/shorts/short.html | Ace the DAT — Short | Learn (shell rule; opened from each card on Trick shorts with ?topic=) | rough | Plays one 40-second short: the question, a pause, the trick, a worked step, then the answer. | Plays once on load with no pause or replay control on a phone (replay is the '0' key). Silent. Ends on a social call to action ('follow for one trick a day', acethedat.com). Defaults to the acidity short without ?topic=. |
| /tricks/videos/ | Ace The DAT — Trick Videos | Learn (shell rule; from the trick library's 'Full trick videos') | ready | Gallery of the 13 trick videos, OChem then Gen Chem, each with its scene count and length. | Says 'Thirteen' under a 'The 14 tricks' button (trick 01 has no video). Inline link in default browser blue. Em dashes in the taglines. |
| /tricks/videos/eas-directing.html | Ace The DAT — EAS Directing | Learn (shell rule; card on /tricks/videos/; the Climb links it after an 'Aromaticity & EAS' miss) | rough | Trick 02 animated video (20 scenes, about 2:30): activators point ortho-para (LPOP), withdrawers flip the W to meta, halogens are the exception. | No narration: voiceover/manifest.json returns 404, so it plays silent. TikTok copy ('comment your pick'). Caption line slightly wider than the phone screen. |
| /tricks/videos/acidity-ranking.html | Ace The DAT — Acidity Ranking | Learn (shell rule; card on /tricks/videos/; the Climb links it after an 'Acidity & pKa' miss) | rough | Trick 03 animated video (16 scenes, 1:48): rank acids by the conjugate base, running CARDIO in order. | No narration (voiceover/acidity/manifest.json returns 404). TikTok call to action. Caption line slightly wider than the screen. |
| /tricks/videos/sn1-vs-sn2.html | Ace The DAT — SN1 vs SN2 | Learn (shell rule; card on /tricks/videos/; the Climb links it after an 'SN1/SN2/E1/E2' miss) | rough | Trick 04 animated video (15 scenes, 1:48): four questions in order (substrate, nucleophile, solvent, temperature) pick SN1, SN2, E1 or E2. | No narration (voiceover/tip04/manifest.json returns 404). Small on-screen text. The caption row is cut off at both edges on a phone. |
| /tricks/videos/rs-configuration.html | Ace The DAT — RS Configuration | Learn (shell rule; card on /tricks/videos/; the Climb links it after a stereochemistry miss) | rough | Trick 05 animated video (13 scenes, 1:48): number the priorities, trace 1-2-3, read it on a dash, flip it on a wedge. | No narration (voiceover/tip05/manifest.json returns 404). TikTok call to action. |
| /tricks/videos/nmr-two-steps.html | Ace The DAT — NMR Two Steps | Learn (shell rule; card on /tricks/videos/; the Climb links it after an 'IR & H-NMR' miss) | rough | Trick 06 animated video (13 scenes, 1:48): count the peaks, split by n+1, and the OH that stands alone. | No narration (voiceover/tip06/manifest.json returns 404). TikTok call to action. |
| /tricks/videos/alkene-map.html | Ace The DAT — Alkene Map | Learn (shell rule; card on /tricks/videos/; the Climb links it after an 'Alkene addition' miss) | rough | Trick 07 animated video (15 scenes, 1:48): every alkene reagent on one map, Markovnikov or flipped, with the stereo outcome. | No narration (voiceover/tip07/manifest.json returns 404). TikTok call to action. |
| /tricks/videos/ir-peaks.html | Ace The DAT — IR Peaks | Learn (shell rule; card on /tricks/videos/ only) | rough | Trick 08 animated video (13 scenes, 1:48): read IR by two peaks, the broad O-H 'tongue' and the sharp carbonyl 'dagger'. | No narration (voiceover/tip08/manifest.json returns 404). TikTok call to action. Not mapped from Climb misses. |
| /tricks/videos/newman.html | Ace The DAT — Newman | Learn (shell rule; card on /tricks/videos/ only) | rough | Trick 09 animated video (13 scenes, 1:48): give the groups elbow room, so anti beats gauche beats eclipsed. | No narration (voiceover/tip09/manifest.json returns 404). Opens with 'comment your pick'. The headline spans edge to edge. Not mapped from Climb misses. |
| /tricks/videos/ozonolysis.html | Ace The DAT — Ozonolysis | Learn (shell rule; card on /tricks/videos/; the Climb links it after a 'Synthesis / roadmap' miss) | rough | Trick 10 animated video (13 scenes, 1:48): O3 cuts the double bond, and the workup decides aldehyde or acid. | No narration (voiceover/tip10/manifest.json returns 404). TikTok call to action. Mapped to 'Synthesis / roadmap', which is a loose fit. |
| /tricks/videos/redox-balancing.html | Ace The DAT — Redox Balancing | Learn (shell rule; card on /tricks/videos/ only) | rough | Trick 11 animated video (15 scenes, 1:48): balance redox with half-reactions in four steps, where the LCM is the electron count. | No narration (voiceover/tip11/manifest.json returns 404). TikTok call to action. Not mapped from Climb misses. |
| /tricks/videos/red-cat-an-ox.html | Ace The DAT — Red Cat An Ox | Learn (shell rule; card on /tricks/videos/; the Climb links it after an 'Electrochemistry' miss) | rough | Trick 12 animated video (13 scenes, 1:48): reduction at the cathode, oxidation at the anode, E cell is cathode minus anode, and 'agent' means flip. | No narration (voiceover/tip12/manifest.json returns 404). TikTok call to action. |
| /tricks/videos/limiting-reagent.html | Ace The DAT — Limiting Reagent | Learn (shell rule; card on /tricks/videos/; the Climb links it after a 'Moles & stoichiometry' miss) | rough | Trick 13 animated video (14 scenes, 1:48): race each reactant to product, and the smaller amount wins. | No narration (voiceover/tip13/manifest.json returns 404). TikTok call to action. |
| /tricks/videos/periodic-trends.html | Ace The DAT — Periodic Trends | Learn (shell rule; card on /tricks/videos/; the Climb links it after a 'Periodic trends' miss) | rough | Trick 14 animated video (13 scenes, 1:48): every atom wants a noble-gas shell, and two arrows explain every periodic trend. | No narration (voiceover/tip14/manifest.json returns 404). Opens with 'comment your answer, reveal at the end'. |
| /tricks/videos/voiceover-studio.html | Ace The DAT — Video Voiceover Studio | None (URL only, no shell) | internal | Crew-only tool for recording narration scene by scene for the 13 trick videos (all show 0 recorded). | Publicly reachable by URL. Shows every video at 0 recorded, which explains the silent videos. |
| /README.md | Ace Labs · DAT prep companion (README) | None; production 301-redirects it to /ace-labs.html | internal | Developer readme (layout, storage keys, ship gates, deploy). | Stale in places (says mocks cover four sections, PAT and RC out of scope). Correctly hidden in production. |
| /ACELABS_STUDENT_FAQ.md | Ace Labs · Student FAQ | None; production 301-redirects it to /ace-labs.html | internal | Old pre-signup FAQ. | Badly stale: says Ace Labs does not cover PAT or RC, names competitors, lists old coach names, uses the old 1 to 30 score scale. Keep hidden or rewrite into scope or an FAQ page. |
| /ACELABS_COACH_GUIDE.md | Ace Labs · Coach Guide | None; production 301-redirects it to /ace-labs.html | internal | Coach-facing guide to the four original engines. | Stale (four engines, old coach names). Correctly hidden in production. |
| /ACELABS_RECOMMENDED_STACK.md | Ace Labs · Recommended DAT Prep Stack | None; production 301-redirects it to /ace-labs.html | internal | Coach notes on which outside resources to pair with Ace Labs per section. | Stale (says PAT and RC are not covered). Correctly hidden in production. |
| /ANXIETY_AWARE_DESIGN.md | Ace Labs · Anxiety-Aware Design | None; production 301-redirects it to /ace-labs.html | internal | Design spec for the 'stuck' moments across tools. | Internal spec; correctly hidden in production. |
| /docs/*.md (PAT-GENERATOR-AUDIT.md, QR-FORMATS-POOL.md) | PAT generator correctness audit; QR formats pool | None; production 301-redirects /docs/* to /ace-labs.html | internal | Developer audit notes for the PAT generators and the QR formats pool. | The README's list of docs/ HTML audits is out of date: only these two .md files remain. QR-FORMATS-POOL.md names competitors. |
| /specs/*.md (8 specs incl. tutor-mode-spec.md, test-week-ux-teardown.md, calibrated-predictor-spec.md) | Ace Labs product specs | None; production 301-redirects /specs/* to /ace-labs.html | internal | Product and design specs (tutor mode, test-week teardown, brand unification, Bio retrieval, OChem analysis, predictor). | Internal; correctly hidden in production. tutor-mode-spec describes the /tutor/ page that Review half-wires. |
| /specs/research/*.md (00-INDEX.md, SUMMARY.md) | AceLabs Research Reports — May 2026 | None; production 301-redirects /specs/* to /ace-labs.html | internal | Index and summary of a May 2026 research sweep. | The index lists 10 reports but only the index and summary are present. |
| /research/*.md (10 RC_*.md files) | Reading Comprehension research notes | None; production 301-redirects /research/* to /ace-labs.html | internal | Planning research behind the RC tools (methods, pacing, question types, stamina, ESL, tool audit). | Internal; correctly hidden in production. |
| /test-screenshots/ | (empty folder) | None; no index, so production returns 404 | internal | Nothing; the folder is empty. | Empty leftover folder (the screenshot shows only the local server's directory listing). Delete it. |

