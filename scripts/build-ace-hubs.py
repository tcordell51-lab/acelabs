"""Write the section hub pages from one template so they cannot drift apart."""
import io, sys
ROOT = sys.argv[1]
TPL = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title} · Ace Labs</title>
<link rel="icon" type="image/svg+xml" href="/shared/ace-dat-mark.svg">
<link rel="stylesheet" href="/shared/ace-ui.css?v=7">
</head>
<body class="aui">
<main class="aui-wrap aui-stack" id="main">

  <div id="hub" class="aui-stack">
    <header class="aui-hubhead">
      <div class="aui-stack">
        <p class="aui-kicker">Section</p>
        <h1 class="aui-h1">{title}</h1>
        <p class="aui-lede" id="lede">Loading the question bank.</p>
        <div class="aui-row">
          <a class="aui-btn" href="?run=daily" data-run="daily">Start today's set</a>
          <a class="aui-btn aui-btn--quiet" href="?run=misses" data-run="misses" id="btn-miss">Review misses</a>
          <a class="aui-btn aui-btn--quiet" href="?run=due" data-run="due" id="btn-due">Spaced repeats</a>
        </div>{note}
      </div>
      <img src="{art}" alt="" width="900" height="678">
    </header>

    <section class="aui-card aui-card--flat" aria-label="Your {short} numbers">
      <div class="aui-stats">
        <div class="aui-stat"><b id="s-answers">0</b><span>answers</span></div>
        <div class="aui-stat"><b id="s-right">0</b><span>right</span></div>
        <div class="aui-stat"><b id="s-due">0</b><span>due for a repeat</span></div>
        <div class="aui-stat"><b id="s-miss">0</b><span>misses open</span></div>
      </div>
    </section>

    <section class="aui-stack" aria-labelledby="t-title">
      <h2 class="aui-h2" id="t-title">Topics</h2>
      <div class="aui-card aui-card--flat"><ul class="aui-list" id="topics"></ul></div>
    </section>

    <section class="aui-stack" aria-labelledby="m-title">
      <h2 class="aui-h2" id="m-title">Learn and explore</h2>
      <div class="aui-grid">
{cards}
      </div>
    </section>
  </div>

  <div id="run" class="aui-stack" hidden>
    <div class="aui-row" style="justify-content:space-between">
      <p class="aui-kicker" id="run-title">{short} set</p>
      <a class="aui-btn aui-btn--quiet aui-btn--sm" href="{home}" id="leave">Leave set</a>
    </div>
    <div id="stage"></div>
  </div>

</main>
<script src="/shared/ace-record.js?v=4"></script>
<script src="/shared/ace-question.js?v=4"></script>
<script src="/shared/ace-set.js?v=3"></script>
<script src="/shared/ace-hub.js?v=1"></script>
<script src="/shared/ace-ui.js?v=3" defer></script>
<script>
AceHub.init({{ section: '{section}', name: '{short}', bank: '{bank}', home: '{home}', setSize: 10, topicSize: 8, src: '{src}',
  lede: function (count, topics) {{ return count + ' {lede}'.replace('TOPICS', topics); }} }});
</script>
<script src="/shared/ace-tabs.js?v=2" defer></script>
</body>
</html>
"""
def card(href, title, text): return '        <a class="aui-card aui-card--flat" href="%s"><h3 class="aui-h3">%s</h3><p class="aui-small">%s</p></a>' % (href, title, text)
HUBS = {
 'gc/index.html': dict(title='General Chemistry', short='Gen Chem', section='gchem', bank='/data/gchem.json', home='/gc/', src='gc-hub', art='/shared/art/gchem.webp', note='',
   lede='questions across TOPICS topics. Every question has five choices and a worked reason.',
   cards=[('/tools/gchem/', 'Gen Chem Chalk Talks', 'The course: fourteen nights, each with checks.'), ('/tools/gc/', 'Skill lessons', 'Worked examples and faded practice for each skill.'),
          ('/tools/gc/trends.html', 'Periodic trends', 'Every trend on one table.'), ('/tools/gc/lewis-sandbox.html', 'Lewis sandbox', 'Build the structure, then the shape.'),
          ('/tools/gc/recognition-lab.html', 'Recognition lab', 'Read curves, diagrams and graphs at a glance.'), ('/tools/gc/traps.html', 'Trap library', 'The mistake behind each wrong choice.')]),
 'bio/index.html': dict(title='Biology', short='Biology', section='bio', bank='/data/bio.json', home='/bio/', src='bio-hub', art='/shared/art/bio.webp',
   note='\n        <p class="aui-small">These sets cover cell and molecular biology. For genetics, body systems, diversity, development and evolution, use the labs below.</p>',
   lede='questions across TOPICS topics in cell and molecular biology. Every question has five choices and a worked reason.',
   cards=[('/tools/bio-retold/', 'Bio Chalk Talks', 'The course: fourteen nights, each with checks.'), ('/tools/bio/bio-cell.html', 'Cell and molecular lab', 'Thirteen interactive tabs, from membranes to the central dogma.'),
          ('/tools/bio/bio-genetics.html', 'Genetics lab', 'Punnett squares, pedigrees, Hardy-Weinberg and linkage.'), ('/tools/bio/bio-physiology.html', 'Body systems lab', 'Each organ system as a working model.'),
          ('/tools/bio/bio-diversity.html', 'Diversity of life', 'The tree of life, plants, phyla and cladograms.'), ('/tools/bio/bio-devo.html', 'Development', 'Embryo timeline, germ layers and cleavage.'),
          ('/tools/bio/bio-evolution.html', 'Evolution and ecology', 'Drift and selection simulators, biomes and cycles.'), ('/tools/bio/bio-ap-bootcamp.html', 'Anatomy and physiology review', 'Twelve sections and a sixty-question quiz.'),
          ('/tools/bio/bio-osmosis.html', 'Osmosis lab', 'Move the solute and watch the cell respond.')]),
}
for rel, h in HUBS.items():
    h = dict(h); h['cards'] = '\n'.join(card(*c) for c in h['cards'])
    import os; os.makedirs(os.path.dirname(ROOT + '/' + rel), exist_ok=True)
    io.open(ROOT + '/' + rel, 'w', encoding='utf-8').write(TPL.format(**h))
    print('wrote', rel)
