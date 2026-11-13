#!/usr/bin/env bash
# deploy-clean.sh <tag> : build a clean Study deploy folder from a tag (OS-64).
#
#   scripts/deploy-clean.sh r0-2026-11-04
#
# 1. git archive <tag> into a new, empty ~/ace-deploy/<tag> (never deploy --dir .
#    from a working copy: untracked files, node_modules and local junk would ship).
# 2. npm ci --omit=dev for the functions (the repo root package.json; a
#    netlify/functions/package.json too if one ever exists).
# 3. Strip every explainer sidecar without a matching stamp (rule 1.9): a sidecar
#    under content/explainers/<section>/ ships only if docs/explainers/approvals.json
#    holds a stamp for its qid whose checksum equals the sidecar's sha256 (16 or 64
#    hex), and whose listed source files (stamp.files: {path: sha256}) still match.
#    Draft, held, reviewer-blocked and unstamped sidecars go; their section index
#    entries go with them, so the player falls back to the bank explanation.
#    The rendered-SVG part of the stamp is checked by the build gate and at runtime,
#    not here (it needs the renderer).
# 4. Assert the folder holds only archive files (plus node_modules from step 2).
# 5. Print the one deploy command. This script never deploys.
#
# Env: ACE_DEPLOY_ROOT (default ~/ace-deploy), ACELABS_SITE_ID (printed in the command).
set -euo pipefail

TAG="${1:-}"
if [[ -z "$TAG" ]]; then echo "usage: $0 <tag>" >&2; exit 2; fi
REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ROOT="${ACE_DEPLOY_ROOT:-$HOME/ace-deploy}"
OUT="$ROOT/$TAG"
SITE="${ACELABS_SITE_ID:-<acelabs site id>}"

git -C "$REPO" rev-parse -q --verify "refs/tags/$TAG^{commit}" >/dev/null \
  || { echo "deploy-clean: no tag $TAG" >&2; exit 1; }
if [[ -e "$OUT" ]] && [[ -n "$(ls -A "$OUT" 2>/dev/null)" ]]; then
  echo "deploy-clean: $OUT exists and is not empty; remove it or pick a new tag" >&2; exit 1
fi
mkdir -p "$OUT"

# 1. archive
git -C "$REPO" archive --format=tar "$TAG" | tar -x -C "$OUT"
LIST="$(mktemp)"; trap 'rm -f "$LIST"' EXIT
(cd "$OUT" && find . -type f | sed 's|^\./||' | LC_ALL=C sort) > "$LIST"
echo "deploy-clean: archived $(wc -l < "$LIST" | tr -d ' ') files from $TAG ($(git -C "$REPO" rev-parse --short "$TAG^{commit}"))"

# 2. functions dependencies
for dir in "$OUT" "$OUT/netlify/functions"; do
  if [[ -f "$dir/package.json" ]]; then
    if [[ -f "$dir/package-lock.json" ]]; then (cd "$dir" && npm ci --omit=dev --ignore-scripts --no-audit --no-fund >/dev/null)
    else (cd "$dir" && npm install --omit=dev --ignore-scripts --no-audit --no-fund >/dev/null); fi
  fi
done

# 3. strip unstamped sidecars
node - "$OUT" "$OUT.stripped.txt" <<'NODE'
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const out = process.argv[2];
const dir = path.join(out, 'content/explainers');
if (!fs.existsSync(dir)) { console.log('deploy-clean: no content/explainers; nothing to strip'); process.exit(0); }
const readJson = (p, d) => { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return d; } };
const approvals = (readJson(path.join(out, 'docs/explainers/approvals.json'), {}).approvals) || {};
const sha = (buf) => crypto.createHash('sha256').update(buf).digest('hex');
const matches = (want, full) => !!want && (want === full || want === full.slice(0, 16));
const walk = (d, acc = []) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); e.isDirectory() ? walk(p, acc) : acc.push(p); } return acc; };
const stripped = [], kept = [];
for (const sec of fs.readdirSync(dir, { withFileTypes: true }).filter((e) => e.isDirectory())) {
  for (const f of walk(path.join(dir, sec.name)).filter((p) => p.endsWith('.json'))) {
    const rel = path.relative(out, f).split(path.sep).join('/');
    const sc = readJson(f, null);
    const qid = sc && sc.qid;
    const ap = qid && approvals[qid];
    let ok = !!(ap && typeof ap.stamp === 'string' && matches(ap.checksum, sha(fs.readFileSync(f))));
    if (ok && ap.files) for (const [p, h] of Object.entries(ap.files)) {
      const fp = path.join(out, p);
      if (!fs.existsSync(fp) || !matches(h, sha(fs.readFileSync(fp)))) { ok = false; break; }
    }
    if (ok) kept.push(rel); else { fs.unlinkSync(f); stripped.push(rel); }
  }
}
// drop index entries whose sidecar is gone
for (const ix of fs.readdirSync(dir).filter((n) => /^index-.+\.json$/.test(n))) {
  const p = path.join(dir, ix), j = readJson(p, null); if (!j || typeof j !== 'object') continue;
  const sec = ix.slice(6, -5); let n = 0;
  const prune = (o) => { for (const [k, v] of Object.entries(o)) if (v && typeof v === 'object' && typeof v.file === 'string' && !fs.existsSync(path.join(dir, sec, v.file)) && !fs.existsSync(path.join(dir, v.file))) { delete o[k]; n++; } };
  if (j.items && typeof j.items === 'object') prune(j.items); else prune(j);
  if (n) fs.writeFileSync(p, JSON.stringify(j) + '\n');
}
fs.writeFileSync(process.argv[3], stripped.join('\n') + (stripped.length ? '\n' : ''));
console.log('deploy-clean: sidecars kept ' + kept.length + ', stripped ' + stripped.length + ' (no matching stamp); list in ' + process.argv[3]);
NODE

# 4. only archive files (stripped sidecars removed, rewritten indexes, node_modules from step 2)
EXTRA="$(cd "$OUT" && find . -type f -not -path '*/node_modules/*' \
  | sed 's|^\./||' | LC_ALL=C sort | comm -23 - "$LIST")"
if [[ -n "$EXTRA" ]]; then echo "deploy-clean: files not from the archive:" >&2; echo "$EXTRA" >&2; exit 1; fi
echo "deploy-clean: OK, $OUT holds only archive files"

# 5. the command (never run here)
echo
echo "netlify deploy --prod --dir \"$OUT\" --site $SITE"
