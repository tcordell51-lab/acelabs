/* Writes captions.vtt and transcript.md from the storyboard in boyle-model.js,
   so captions never drift from the exact narration. */
const fs = require('node:fs');
const path = require('node:path');
const M = require('../boyle-model.js');
const root = path.join(__dirname, '..');
fs.writeFileSync(path.join(root, 'captions.vtt'), M.toVTT());
const clock = (t) => Math.floor(t / 60) + ':' + String(Math.floor(t % 60)).padStart(2, '0');
const md = ['# Boyle\'s law: halve the volume - transcript', '',
  'Silent captioned animatic, 55 s. No voice track: captions are timed from the storyboard, not from measured audio.', '']
  .concat(M.SEGMENTS.flatMap((s, i) => ['## ' + (i + 1) + '. ' + clock(s.start) + '-' + clock(s.end), '', s.narration, '', '*On screen:* ' + s.visual, '']));
fs.writeFileSync(path.join(root, 'transcript.md'), md.join('\n'));
console.log('wrote captions.vtt (' + M.CUES.length + ' cues) and transcript.md');
