// lite-harness.js: a jsdom copy of tools/mock/full.html for the G1-LITE tests
// (tests/player/lite.test.js). Not a test file itself: run-node-tests.mjs only
// runs *.test.js.
//
//   const page = await openPage({ full, files, live, pulls, pat, lite, configure, attempts, active })
//     full       the full.js source to run (default: the working copy)
//     files      { '<site path>': string | Buffer | null }: served instead of the repo
//                file (null answers 404)
//     live       the live pull list the approvals function answers (default: 404)
//     pulls      false: shared/ace-pulls.js is not on the page
//     pat        true: load the PAT engine (about 6 s to build a 90-item test)
//     lite       false: explainer-lite.js is not on the page
//     configure  passed to AceExplainerLite.configure (base, loadVisuals, disputes, ...)
//     attempts / active   localStorage acelabs.fullmock.v1.attempts / .active
//   page.window, page.doc, page.openSaved(id), page.openSection(sec), page.settle(ms), page.close()
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { webcrypto } = require('node:crypto');
const { JSDOM } = require('jsdom');

const ROOT = path.resolve(__dirname, '..', '..');
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const PAT_FILES = ['pat-core.js', 'pat-solid.js', 'pat-keyholes.js', 'pat-keyholes-csg.js', 'pat-tfe.js', 'pat-tfe-csg.js', 'pat-angles.js', 'pat-holepunch.js', 'pat-cubes.js', 'pat-patternfold.js', 'pat-patternfold-poly.js', 'pat-test.js'];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// every page still open (a failed assertion skips its close): closed after the file's tests
const OPEN = new Set();
function closeAll() { for (const w of OPEN) { try { w.close(); } catch (e) { /* gone */ } } OPEN.clear(); }

// a stand-in for tools/explain/visuals/index.js (an ES module jsdom cannot import):
// draws one figure the way core.js render() wraps it
function stubVisuals(w, opts = {}) {
  return {
    render: async (spec, host) => {
      const fig = w.document.createElement('figure');
      fig.className = 'vis';
      fig.setAttribute('role', 'img');
      fig.setAttribute('aria-label', spec.alt || '');
      const body = w.document.createElement('div');
      body.className = 'vis-body';
      if (opts.fail) { const p = w.document.createElement('p'); p.className = 'vis-err'; p.textContent = 'This picture did not draw'; body.append(p); }
      else body.textContent = 'picture ' + spec.type;
      fig.append(body);
      host.append(fig);
      return fig;
    }
  };
}

function siteFetch(files, live, log) {
  return async (u) => {
    const url = new URL(String(u), 'http://localhost/');
    const rel = decodeURIComponent(url.pathname).replace(/^\//, '');
    log.push(rel + url.search);
    const respond = (body) => {
      if (body == null) return { ok: false, status: 404, text: async () => 'not found', json: async () => { throw new Error('404'); }, arrayBuffer: async () => new ArrayBuffer(0) };
      const buf = Buffer.isBuffer(body) ? body : Buffer.from(String(body), 'utf8');
      return { ok: true, status: 200, text: async () => buf.toString('utf8'), json: async () => JSON.parse(buf.toString('utf8')), arrayBuffer: async () => buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) };
    };
    if (rel === '.netlify/functions/approvals') return respond(live == null ? null : JSON.stringify({ pulls: live }));
    if (Object.prototype.hasOwnProperty.call(files, rel)) return respond(files[rel]);
    const fp = path.join(ROOT, rel);
    if (!fp.startsWith(ROOT + path.sep) || !fs.existsSync(fp) || !fs.statSync(fp).isFile()) return respond(null);
    return respond(fs.readFileSync(fp));
  };
}

async function openPage(o = {}) {
  const html = read('tools/mock/full.html').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
  const dom = new JSDOM(html, { url: 'http://localhost/tools/mock/full.html', runScripts: 'outside-only', pretendToBeVisual: true });
  const w = dom.window;
  OPEN.add(w);
  const log = [];
  Object.defineProperty(w, 'crypto', { value: webcrypto, configurable: true });
  w.TextEncoder = TextEncoder; w.TextDecoder = TextDecoder;
  w.fetch = siteFetch(o.files || {}, o.live, log);
  w.scrollTo = () => {};
  if (o.attempts) w.localStorage.setItem('acelabs.fullmock.v1.attempts', JSON.stringify(o.attempts));
  if (o.active) w.localStorage.setItem('acelabs.fullmock.v1.active', JSON.stringify(o.active));
  w.eval(read('tools/mock/data/full-mocks.js'));
  w.eval(read('tools/rc/data/bank.js'));
  if (o.pat) PAT_FILES.forEach((f) => w.eval(read('tools/pat/engine/' + f)));
  if (o.pulls !== false) w.eval(read('shared/ace-pulls.js'));
  w.eval(read('tools/mock/why-overrides.js'));
  if (o.lite !== false) {
    w.eval(read('tools/mock/explainer-lite.js'));
    w.AceExplainerLite.configure(Object.assign({ base: 'http://localhost/', pullsTimeoutMs: 400, loadVisuals: () => stubVisuals(w) }, o.configure || {}));
  }
  w.eval(o.full || read('tools/mock/full.js'));
  if (w.ACE_WHY_OVERRIDES && w.ACE_WHY_OVERRIDES.ready) await w.ACE_WHY_OVERRIDES.ready;
  const doc = w.document;
  const page = {
    window: w, doc, log,
    settle: (ms = 60) => sleep(ms),
    async openSaved(id, waitMs = 50) {
      const a = doc.querySelector('[data-att="' + id + '"]');
      if (!a) throw new Error('no saved report ' + id);
      a.dispatchEvent(new w.MouseEvent('click', { bubbles: true, cancelable: true }));
      for (let i = 0; i < 400 && !doc.querySelector('#report .report'); i++) await sleep(25);
      await sleep(waitMs);
    },
    async openSection(sec) {
      const d = doc.querySelector('details[data-sec="' + sec + '"]');
      if (!d) return null;
      d.open = true; d.dispatchEvent(new w.Event('toggle'));
      return d;
    },
    // wait until every card in an opened section has an explainer or a fallback reason
    async decided(sec, ms = 4000) {
      const d = doc.querySelector('details[data-sec="' + sec + '"]');
      const t0 = Date.now();
      for (;;) {
        const cards = [...d.querySelectorAll('.miss')];
        if (cards.every((c) => c.hasAttribute('data-lite') || c.hasAttribute('data-lite-fallback'))) return cards;
        if (Date.now() - t0 > ms) return cards;
        await sleep(20);
      }
    },
    close() { OPEN.delete(w); w.close(); }
  };
  return page;
}

module.exports = { openPage, closeAll, stubVisuals, ROOT, read, sleep };
