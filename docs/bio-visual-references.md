# Bio true-to-life views: references and sign-off

The Biology Repair Lab has three views drawn to look like the real thing,
not like a cartoon:

- **Tonicity**: a light-microscope camera image of red blood cells (wet
  mount, 1000x oil) and of Elodea leaf cells (400x), in every solution.
- **Sarcomere**: the to-scale sliding filament model and, right under it,
  a strip that looks like a longitudinal electron micrograph (TEM).
- **Bone Layers**: an adult long bone cut lengthwise, and a zoom of a
  ground section of compact bone cut across.

Each one was rebuilt after a histology review. Before students lean on
them, a person who has looked at real slides should compare each view
with a real image and sign it off. This page tells you how. The record
for each view lives in `tools/bio/bio-visual-references.json`.

## What is in the record

One record per view and state (15 in all). Each one has:

- `open`: the page and the exact settings that show this view.
- `depicts`: what the drawing shows, in plain words.
- `mustMatch`: the real preparation it has to look like, for example
  "unstained wet mount of human red blood cells, brightfield, 1000x oil".
- `facts`: the measurable things the drawing encodes (sizes in um, band
  widths, counts, ratios). Each fact has `real` (what textbooks and
  micrographs show), `status` (how the two compare, below) and `code`
  (the file, the line, and a `match` text you can search for).
- `status` on each fact:
  - `matches`: inside the real range, or the same in kind.
  - `close`: a little outside the range, or right in kind but not in
    number. It carries a `reason`. Judge these first.
  - `deviates`: outside the range by enough to see side by side. It
    carries a `reason`. (No fact is marked this way today.)
- `simplified`: what was simplified on purpose. Do not mark a view down
  for these unless you think the simplification teaches something false.
- `references`: ids from the reference list at the top of the file.
- `signoff`: four empty fields (`reviewer`, `date`, `verdict`, `notes`)
  for you to fill in.

## Sign off one view in about ten minutes

You need the site open in one tab and one reference image in another.
A laptop is easiest; a phone works.

1. **Open the view (1 minute).** Go to the `open.page` address and follow
   `open.steps`. If a "Call it first" card covers the picture, tap
   "Skip for now and explore" (or answer it). The slider or buttons
   under the picture set the state.
2. **Open a reference (1 minute).** Pick a micrograph from the record's
   `references` before a diagram. Diagrams show the idea; micrographs
   show the look. Most links were found in a web search and not opened
   from the build machine, so if one does not load, try the next.
3. **Squint test (2 minutes).** Put the two side by side. At a glance,
   would a student who has seen the real slide recognize this one? Look
   at color, texture, what is visible and what should not be (for
   example: no nucleus in red cells, no vessels in a ground section,
   ghosts nearly invisible in brightfield).
4. **Check three facts (4 minutes).** Start with any fact marked `close`
   or `deviates` (the list below has them all), then pick two more from
   `facts` and check them against the reference. Useful tricks:
   - Tonicity has a scale bar (10 um for red cells, 50 um for Elodea).
     Hold a card edge to the screen and compare a cell with the bar.
   - The sarcomere readout under the model gives Z to Z, the I band and
     the H zone in um. The A band should be about two thirds of a
     relaxed sarcomere.
   - In the ground section, compare canal size with osteon size, count
     lamellae, and look at how the canaliculi run.
5. **Read the words (1 minute).** The caption and labels on the picture
   must say only what is true of the picture.
6. **Write it down (1 minute).** In `tools/bio/bio-visual-references.json`,
   fill the view's `signoff`:
   - `reviewer`: your initials or a role such as "coach". This file is
     published with the site, so do not put a full name or an email
     (the test refuses an `@`).
   - `date`: the date as YYYY-MM-DD, for example 2026-11-02.
   - `verdict`: exactly one of `approved`, `approved after the listed
     changes`, `not ready`.
   - `notes`: what to change, pointing at the fact by its text, for
     example "TEM: mitochondria look too pale against the I band".
   Then run `npm test` (or ask whoever maintains the code to). A filled
   sign-off passes as long as those four rules hold; a verdict also
   needs a reviewer and a date.

If editing JSON is a hassle, write the same four lines in a message and
whoever maintains the code fills them in.

The three red-cell solutions and the three Elodea solutions share one
screen, so doing a whole group at once (for example all four red-cell
states) takes about fifteen minutes, not forty.

## The views

| Record | Open | Settings | Must look like |
|---|---|---|---|
| tonicity-rbc-isotonic | /tools/bio/bio-cell.html#stick-tonicity | Animal cell (no wall), External solute 50 | Unstained wet mount of human red blood cells, brightfield, 1000x oil |
| tonicity-rbc-hypotonic | /tools/bio/bio-cell.html#stick-tonicity | Animal cell, solute 32 (cups), then 18 (spheres) | Same, in hypotonic saline |
| tonicity-rbc-lysed | /tools/bio/bio-cell.html#stick-tonicity | Animal cell, solute 4 (and 8 to 11 for two tougher cells) | Brightfield after hypotonic hemolysis |
| tonicity-rbc-hypertonic | /tools/bio/bio-cell.html#stick-tonicity | Animal cell, solute 92 | Same, in hypertonic saline (echinocytes) |
| tonicity-elodea-isotonic | /tools/bio/bio-cell.html#stick-tonicity | Plant cell (rigid wall), solute 50 | Wet mount of an Elodea leaf, brightfield, 400x |
| tonicity-elodea-turgid | /tools/bio/bio-cell.html#stick-tonicity | Plant cell, solute 20 | Elodea in pond or distilled water |
| tonicity-elodea-plasmolyzed | /tools/bio/bio-cell.html#stick-tonicity | Plant cell, solute 92 | Elodea in strong salt solution |
| sarcomere-model-relaxed | /tools/bio/bio-physiology.html#stick-sarcomere | Sliding Filament tab, Relaxed | To-scale sarcomere schematic |
| sarcomere-model-contracting | same | Contracting | same |
| sarcomere-model-contracted | same | Fully contracted | same |
| sarcomere-tem-relaxed | same (the strip under the model) | Relaxed | Longitudinal TEM of mammalian skeletal muscle |
| sarcomere-tem-contracting | same | Contracting | same |
| sarcomere-tem-contracted | same | Fully contracted | same |
| bone-long-gross | /tools/bio/bio-physiology.html#stick-bone-layers | Bone Layers tab, stops 1 to 6 | Gross lengthwise section of an adult femur |
| bone-ground-section | same | Stop 3, Osteon (zoom) | Ground section of compact bone, cross section, 40 to 100x |

## Facts already flagged

Eight facts are marked `close`. None is a reason to hold a view back on
its own, but each is where a sharp eye will look first:

- `tonicity-rbc-isotonic`: the edge-on cell is 2.7 um at the thickest
  and 1.0 um at the center, against a measured mean of 2.58 and 0.81 um.
  Inside the cell-to-cell spread.
- `tonicity-rbc-hypotonic`: the solute values where cells cup, round up
  and burst sit lower than in real cells (lysis below a quarter of the
  cell value, where real cells start near a half). The order of the
  states is right; the picture is not affected.
- `tonicity-rbc-lysed`: ghosts are drawn a little easier to see than in
  true brightfield, on purpose.
- `tonicity-elodea-isotonic`: two facts. The wall line is drawn about
  2 um so it shows on a phone; a real one usually looks thinner. And the
  cells are 30 um wide and 77 to 125 um long: inside the range one class
  exercise gives (20 to 30 by 60 to 130 um), but longer than the typical
  cell another guide gives (about 50 by 25 um), and both sources are
  classroom pages. Measure a real cell against the 50 um bar.
- `bone-long-gross`: the end shell is 21 percent of the shaft wall (a
  rough range of 15 to 20), and the shaft is 57 percent of the length
  (60 to 75 in a real long bone).
- `sarcomere-tem-contracted`: at full contraction the M line is drawn as a
  thin stripe slightly darker than the overlap (density 1.05 against 0.92)
  so its label still points at a visible line; in real micrographs the M
  line is at most as dark as the overlap.

## What a reviewer usually catches

These are the giveaways a histology eye spots first. The current views
were built to get them right; check that they still do.

- **Red cells**: round, not oval; pallor about a third of the cell;
  swollen cells get narrower, not wider (the membrane barely stretches);
  ghosts are faint and smooth, not torn; crenated cells have many short
  blunt bumps, not a few long spikes.
- **Elodea**: chloroplasts packed in every cell (onion skin has none);
  thin colorless walls; cytoplasm colorless; plasmolysis uneven from cell
  to cell, rounding off the end walls first, with thin strands to the wall.
- **Sarcomere**: thin filaments shorter than thick; actin beside myosin,
  not inside it; no heads at the center (bare zone); the I band runs from
  one A band to the next with the Z disc in its middle; the A band never
  changes length.
- **TEM strip**: Z darkest, I band lightest; the M line is darker than
  the H zone but never darker than the overlap; when fully contracted
  the thin filaments reach it and it takes the overlap gray. Triads at
  the A-I junctions; mitochondria in pairs by the Z disc. The strip is
  squashed top to bottom on purpose (see the record). Check the triads
  against `cil-10815`, `columbia-muscle-em` or `skm-2011-triad`, not
  `cil-10817`: that one is an osmium-ferrocyanide prep, so its T tubules
  are dark and its SR does not show.
- **Long bone**: spongy bone fills the ends and opens into the cavity;
  the shell over the ends is thin; the epiphyseal line runs across the
  spongy bone; red marrow only at the upper end in an adult.
- **Ground section**: canals and lacunae dark and empty (no vessels, no
  cells); osteons packed, with interstitial lamellae between them;
  circumferential lamellae under the surface; Volkmann canals linking
  canals.

## About the references

The references are for looking, not copying. Nothing from them is in the
site: every picture is drawn in code. Each reference says how far it was
checked:

- `seen-in-search`: the address came up in a web search on 2026-10-30.
  The page was not opened from the build machine (its network is
  limited), so check that it loads and read its license there.
- `not-verified`: the citation is from memory or the address follows the
  publisher's usual pattern. Check it before relying on it.

Prefer public domain, CC0 or CC BY sources (CDC PHIL, OpenStax, many
Wikimedia Commons files) if a picture is ever needed for a handout. The
Cell Image Library and Histology Guide entries are for viewing only.

## Keeping the record true

`tests/bio/stick-cards.test.js` checks the record on every `npm test`:

- the 15 records are there and every reference id resolves;
- every fact has a status, and every `close` or `deviates` fact has a
  reason and is named in the list above;
- every sign-off block has its four fields, empty or filled by the
  rules in step 6;
- the file is plain ASCII with no personal data;
- every code `match` still occurs in its file, exactly once.

The `line` in each code location is a hint. Other work moves code
around, so when a match is no longer on its cited line the test still
passes and prints the line it moved to (a `# ... moved from line ...`
note in the test output); refresh the record when convenient. If the
match is gone, or now occurs more than once, the test fails: someone
changed the drawing, and the fact needs a fresh look in the same
change.
