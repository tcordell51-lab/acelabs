#!/usr/bin/env node
/* =====================================================================
   Bio Repair Lab · registry validation
   ---------------------------------------------------------------------
   Fails the npm script with a non-zero exit code when any of the
   following are wrong:

   - Duplicate registry node id
   - Registry references a route file that does not exist
   - Registry references an anchor that does not exist in its route
   - Hub count claim in tools/bio/index.html disagrees with registry
   - Diagnostic / mock card-source references a node id (or alias)
     that does not resolve in the registry
   - Any Bio HTML file contains an obvious placeholder Ace Card source
     ("(question)" / "(answer)" / "Review the explanation." /
      "The correct answer is: .")

   Run via: npm run validate:bio
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const ROOT     = path.resolve(__dirname, '..');
const BIO_DIR  = path.join(ROOT, 'tools', 'bio');
const REGISTRY = require(path.join(BIO_DIR, 'bio-registry.js'));
const INDEX_HTML = path.join(BIO_DIR, 'index.html');
const DIAGNOSTIC_HTML = path.join(BIO_DIR, 'bio-diagnostic.html');
const MOCK_HTML = path.join(BIO_DIR, 'bio-mock.html');

const errors = [];
const warnings = [];

function err(msg) { errors.push(msg); }
function warn(msg) { warnings.push(msg); }

function readText(p) {
  try { return fs.readFileSync(p, 'utf8'); }
  catch (e) { err('Cannot read ' + p + ': ' + e.message); return ''; }
}

/* ---- 1. Duplicate node ids ---------------------------------------- */
const idCounts = {};
REGISTRY.NODES.forEach(n => { idCounts[n.id] = (idCounts[n.id] || 0) + 1; });
Object.keys(idCounts).forEach(id => {
  if (idCounts[id] > 1) err('Duplicate registry node id: ' + id + ' (x' + idCounts[id] + ')');
});

/* ---- 2. Routes exist ---------------------------------------------- */
const hubRoutes = {};
REGISTRY.HUBS.forEach(h => {
  hubRoutes[h.id] = h.route;
  const p = path.join(BIO_DIR, h.route);
  if (!fs.existsSync(p)) err('Hub route missing on disk: ' + h.id + ' → ' + h.route);
});

/* ---- 3. Anchors exist in their hub HTML --------------------------- */
const hubHtml = {};
REGISTRY.HUBS.forEach(h => {
  hubHtml[h.id] = readText(path.join(BIO_DIR, h.route));
});
REGISTRY.NODES.forEach(n => {
  const html = hubHtml[n.hub];
  if (!html) return;
  const anchorPattern = new RegExp('id\\s*=\\s*["\']' + n.anchor.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&') + '["\']');
  if (!anchorPattern.test(html)) {
    if (n.status === 'planned') warn('Planned node has no anchor yet: ' + n.id + ' (' + n.anchor + ')');
    else err('Anchor missing in ' + hubRoutes[n.hub] + ': #' + n.anchor + ' (node ' + n.id + ')');
  }
});

/* ---- 4. Bio home count claims match registry --------------------- */
const indexHtml = readText(INDEX_HTML);
// Look for the "Active nodes" claim in the sidebar foot.
const activeMatch = indexHtml.match(/Active nodes[\s\S]{0,80}?<b>(\d+)/i);
if (activeMatch) {
  const claimed = parseInt(activeMatch[1], 10);
  const actual = REGISTRY.totalLive();
  if (claimed !== actual) {
    err('Bio home Active nodes claim mismatch: HTML says ' + claimed + ', registry has ' + actual + ' live');
  }
}
// Per-hub "n nodes live" claims.
REGISTRY.HUBS.forEach(h => {
  const live = REGISTRY.liveCount(h.id);
  // Lazy: just look for "<H title>...n nodes live"; tolerate &amp; etc.
  // We don't fail if the HTML doesn't mention the hub at all.
  const r = new RegExp(h.title.replace(/&/g,'(?:&|&amp;)') + '[\\s\\S]{0,200}?<b>(\\d+) nodes live<\\/b>', 'i');
  const m = indexHtml.match(r);
  if (m) {
    const c = parseInt(m[1],10);
    if (c !== live) err('Bio home "' + h.title + '" claim mismatch: HTML says ' + c + ', registry has ' + live + ' live');
  }
});

/* ---- 5. Diagnostic + mock node references resolve --------------- */
function checkBankNodeRefs(label, file) {
  const text = readText(file);
  const idMatches = text.match(/node\s*:\s*['"]([\w-]+)['"]/g) || [];
  idMatches.forEach(mr => {
    const id = mr.match(/['"]([\w-]+)['"]/)[1];
    if (!REGISTRY.resolve(id)) {
      err(label + ': unresolved node id "' + id + '" — not in registry, not an alias');
    }
  });
}
checkBankNodeRefs('bio-diagnostic.html', DIAGNOSTIC_HTML);
checkBankNodeRefs('bio-mock.html',       MOCK_HTML);

/* ---- 6. Placeholder Ace Card / retrieval leaks ------------------- */
// Allowed: markdown specs documenting the bug (which use the placeholder
// strings as examples). We only check Bio HTMLs that ship to users.
const placeholders = [
  '"(question)"',
  '"(answer)"',
  '"Review the explanation."',
  '"(question) The correct answer is: ."'
];
const bioHtmls = fs.readdirSync(BIO_DIR).filter(f => f.endsWith('.html')).map(f => path.join(BIO_DIR, f));
bioHtmls.forEach(p => {
  const text = readText(p);
  placeholders.forEach(needle => {
    if (text.includes(needle)) err('Placeholder card text in ' + path.basename(p) + ': ' + needle);
  });
});

/* ---- 7. org collision check -------------------------------------- */
// bio-cell.html organelles + bio-devo.html organogenesis both share
// data-node="org". Registry must distinguish them by hub.
const orgEntries = REGISTRY.NODES.filter(n => n.id === 'org' || n.legacyDataNode === 'org');
const orgHubs = new Set(orgEntries.map(n => n.hub));
if (orgEntries.length > 1 && orgHubs.size < 2) {
  err('org collision unresolved: multiple registry nodes share data-node="org" without hub disambiguation');
}

/* ---- Report ------------------------------------------------------- */
console.log('Bio registry validation');
console.log('  hubs:  ' + REGISTRY.HUBS.length);
console.log('  nodes: ' + REGISTRY.NODES.length + ' total, ' + REGISTRY.totalLive() + ' live');
console.log('');
if (warnings.length) {
  console.log('Warnings:');
  warnings.forEach(w => console.log('  - ' + w));
  console.log('');
}
if (errors.length) {
  console.log('FAIL — ' + errors.length + ' error' + (errors.length === 1 ? '' : 's') + ':');
  errors.forEach(e => console.log('  - ' + e));
  process.exit(1);
}
console.log('OK — registry consistent with HTML and bank data.');
