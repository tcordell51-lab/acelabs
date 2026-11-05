/* RET-G stamp: the Bio night 1 figure removals (B-16), auto-approved 2026-10-30,
   pending Thomas review (rule 1.9). Each item carries SHA-256 checksums over
   what a student is served for that scene:
     scene       the scene record as the page defines it (words, coach line,
                 question; no figure)
     rendered    the scene as drawn (teach mode, every scene open). It is
                 plain HTML with no figure, so the 390 and 1280 px renders are
                 the same markup; both are listed
     renderer    the page code that draws a scene's figure (sceneFig, figOff)
   A later change to any of them voids the stamp (tests/retold/bio-night1.test.js).

     node tests/retold/stamp.cjs           print the stamp file it would write
     node tests/retold/stamp.cjs --write   write content/approvals/stamps/RET-G.json */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { ROOT, source, load, nights } = require('./harness.cjs');

const OUT = path.join(ROOT, 'content/approvals/stamps/RET-G.json');
const STAMP = 'auto-approved 2026-10-30, pending Thomas review';
const sha = (s) => crypto.createHash('sha256').update(s, 'utf8').digest('hex');
const ITEMS = [
  { scene: 2, title: 'The ladder of scales: molecule to system', removedFigureSha256: '33b7a34dc30a9ca5eb739a09677c8f9fdfa552c14ee12e2755b25b329b95574d' },
  { scene: 7, title: 'The payoff: predict, do not memorize', removedFigureSha256: '86f85539500c51ce74925b24068056c781715f6ad30425869e8d771dd7b6524f' },
];

function rendererSource() {
  const src = source('bio-retold');
  const lines = src.split('\n').filter((l) => /^function (figOff|sceneFig)\(/.test(l));
  if (lines.length !== 2) throw new Error('renderer lines not found');
  return lines.join('\n');
}

async function compute() {
  const N = nights('bio-retold')[1];
  const p = load('bio-retold', '?night=1&mode=teach');
  let drawn;
  try {
    await p.ready();
    drawn = p.scenes().map((el) => el.outerHTML);
  } finally { p.close(); }
  const renderer = sha(rendererSource());
  const items = ITEMS.map((it) => {
    const sc = N.scenes[it.scene - 1];
    if (sc.t.indexOf(it.title.split(':')[0]) !== 0) throw new Error('scene title moved: ' + sc.t);
    const scene = sha(JSON.stringify(sc));
    const rendered = sha(drawn[it.scene - 1]);
    const checksum = { algo: 'sha256', scene, rendered390: rendered, rendered1280: rendered, renderer };
    checksum.all = sha([scene, rendered, rendered, renderer].join('\n'));
    return {
      id: 'retold:bio:1:' + it.scene,
      kind: 'retold-figure-removal',
      place: '/tools/bio-retold/?night=1',
      title: 'Bio, Retold night 1, scene ' + it.scene + ': ' + it.title,
      change: 'The figure is off; the words, the coach line and the question are unchanged. The scene shows "Pictures for this part are being redrawn." until night 1 is rebuilt on the explainer library from Dec 4.',
      decision: 'B-16 (OS-22)',
      stamp: STAMP,
      pull: 'Pulling this id keeps the figure off (it shows the same line). Bringing the old figure back is a code revert: restoreFrom.',
      restoreFrom: 'eb7c603:tools/bio-retold/index.html',
      removedFigureSha256: it.removedFigureSha256,
      checksum,
    };
  });
  return {
    schema: 'ace.approvals-stamps/1',
    batch: 'RET-G',
    note: 'Stamped items of batch RET-G. REVIEW merges this file into content/approvals/review-index.json. A stamp counts only while its checksums match what the page serves.',
    items,
  };
}

module.exports = { OUT, STAMP, compute, rendererSource };

if (require.main === module) {
  compute().then((j) => {
    const text = JSON.stringify(j, null, 2) + '\n';
    if (process.argv.includes('--write')) { fs.mkdirSync(path.dirname(OUT), { recursive: true }); fs.writeFileSync(OUT, text); console.log('wrote ' + path.relative(ROOT, OUT)); }
    else process.stdout.write(text);
  }, (e) => { console.error(e); process.exit(1); });
}
