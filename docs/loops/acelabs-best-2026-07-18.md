# Ace Labs autonomous loop — 2026-07-18 16:35 to ~17:35 CDT

Mission (Thomas: "go on auto mode and a loop for the next hour doing what's
best for Ace Labs"): an hour of shipped, verified increments that raise the
quality of the live Ace Labs site. Fixes and safe polish, not risky new
features. Ship complete or not at all.

Rules: one item per iteration. Build → parse-check → screenshot/curl-verify →
commit → push → confirm live marker on acelabs.netlify.app → ledger line →
next. House rules: no emojis/glyphs, no payment language student-visible,
encouraging tone, restate engine-verified chemistry only. Stop at the hour;
finish the in-flight item, write the final ledger entry, report.

## Candidate backlog (pick highest-value each iteration)
1. Map polish: deep-link stations to the exact night that teaches them (not
   just the wheel); hover/tap tooltip naming the reactions in that group.
2. Map: also light stations from Retold scene commits (not only wheel spokes)
   so walking a night alone starts lifting the fog.
3. Live-tool QA sweep: load each acelabs tool headless, catch console errors /
   broken links / 404 assets, fix.
4. ace-labs.html shelf: verify every tile target resolves; fix stale copy.
5. Game Central: keyboard support (1-5 / A-E to answer, Enter for next),
   a11y focus states.
6. OChem research backlog still open: worked-example fading on a night;
   non-reaction spine scene (acidity ranking).
7. Cross-tool: confirm no tool emits console errors on load.

## Ledger
- 16:35 loop opened. Map + PAT system layer shipped just before (81fb673).
- SHIPPED 1 (9654caf): map warms from walking nights (pale-gold started fill +
  gold edges), native tooltips.
- SHIPPED 2 (QA): all 9 shelf tiles resolve 200; 7 tools load with ZERO JS
  errors headless. Clean.
- SHIPPED 3 (a0b9868): Game Central keyboard - 1-6/A-F answer, Enter/Space next.
- SHIPPED 4 (22ace11): map progress headline (N of 105 earned).
- SHIPPED 5 (43f272c): wheel done-screen -> "See it on your reaction map".
- SHIPPED 6 (238ff96): FIX - OChem game structures were dark-on-dark (nearly
  invisible); now white paper cards. Real legibility defect.
- Iteration 7 (game done-screen subject switch) starting.
