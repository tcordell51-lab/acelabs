/* RET-G test harness: loads a Retold course page in jsdom with its own inline
   scripts and the real shared/ace-pulls.js (inlined in place of its tag). Other
   external scripts (the ledger, the shell) are left out; the pages guard for
   them. fetch is stubbed per URL: the snapshot and the live pull list answer
   what the test says, everything else (audio clips, the approvals function
   while REVIEW has not landed) answers 404. Canvas is a no-op 2D context. */
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM, VirtualConsole } = require('jsdom');

const ROOT = path.resolve(__dirname, '../..');
const PULLS_SRC = fs.readFileSync(path.join(ROOT, 'shared/ace-pulls.js'), 'utf8');
const KEY = 'acelabs.v1.pulls';
const SNAP = '/content/approvals/pulls-snapshot.json';
const LIVE = '/.netlify/functions/approvals?pulls=1';

/* dir -> the section key of shared/ace-index.js (the pull ids use it) */
const COURSES = {
  'bio-retold': { sec: 'bio', nights: 14 },
  gchem: { sec: 'gchem', nights: 14 },
  organic: { sec: 'ochem', nights: 13 },
  'pat-retold': { sec: 'pat', nights: 10 },
  'qr-retold': { sec: 'qr', nights: 14 },
  'rc-retold': { sec: 'rc', nights: 10 },
};
const PULLS_TAG = '<script src="/shared/ace-pulls.js?v=1"></script>';

const source = (dir) => fs.readFileSync(path.join(ROOT, 'tools', dir, 'index.html'), 'utf8');

const json = (body) => Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(body) });
const notFound = () => Promise.resolve({ ok: false, status: 404, json: () => Promise.resolve({}) });

/* o: { noPulls: leave ace-pulls out, local: stored pulls record, snap: snapshot body, live: live body, liveGate: Promise before the live answer } */
function load(dir, query = '', o = {}) {
  let html = source(dir);
  if (!html.includes(PULLS_TAG)) throw new Error(dir + ': no ace-pulls tag');
  html = html.replace(PULLS_TAG, () => (o.noPulls ? '' : '<script>' + PULLS_SRC.replace(/<\/script/gi, '<\\/script') + '</script>'))
    .replace(/<script src="[^"]*"( defer)?><\/script>/g, '');
  const errors = [];
  const calls = [];
  const vc = new VirtualConsole();
  vc.on('jsdomError', (e) => errors.push(String((e && e.message) || e).split('\n')[0]));
  vc.on('error', (e) => errors.push(String(e).split('\n')[0]));
  const dom = new JSDOM(html, {
    url: 'https://acelabs.netlify.app/tools/' + dir + '/' + query,
    runScripts: 'dangerously',
    pretendToBeVisual: true,
    virtualConsole: vc,
    beforeParse(w) {
      if (o.local) w.localStorage.setItem(KEY, JSON.stringify(o.local));
      w.fetch = (url) => {
        calls.push(String(url));
        if (url === SNAP) return o.snap ? json(o.snap) : notFound();
        if (url === LIVE) {
          if (!o.live) return notFound();
          return o.liveGate ? o.liveGate.then(() => json(o.live)) : json(o.live);
        }
        return notFound();
      };
      const ctx = new Proxy({}, {
        get: (t, k) => (k in t ? t[k] : k === 'measureText' ? () => ({ width: 10 }) : k === 'getImageData' ? () => ({ data: [] }) : () => {}),
        set: (t, k, v) => { t[k] = v; return true; },
      });
      w.HTMLCanvasElement.prototype.getContext = function () { return ctx; };
      w.scrollTo = () => {};
      w.scrollBy = () => {};
    },
  });
  const w = dom.window;
  const doc = w.document;
  return {
    dom, w, doc, errors, calls,
    ready: () => (w.AcePulls ? w.AcePulls.ready() : Promise.resolve(null)),
    /* night numbers in a list that a student can see */
    listed: (sel) => [...doc.querySelectorAll(sel + ' li[data-night]')].filter((li) => !li.hidden).map((li) => +li.getAttribute('data-night')),
    scenes: () => [...doc.querySelectorAll('#scenes .scene:not(.recall)')],
    close: () => { try { w.close(); } catch (e) { /* closed */ } },
  };
}

/* the night records as the page defines them */
function nights(dir) {
  const N = {};
  for (const line of source(dir).split('\n')) if (/^NIGHTS\[\d+\]=/.test(line)) new Function('N', line.replace(/^NIGHTS/, 'N'))(N);
  return N;
}

const tick = (ms = 0) => new Promise((r) => setTimeout(r, ms));

module.exports = { ROOT, COURSES, KEY, SNAP, LIVE, PULLS_TAG, source, load, nights, tick };
