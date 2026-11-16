"""Quality gate for the content branch. Exit 1 on any failure.

Checks, against origin/main:
  1. every bank parses
  2. no answer key changed (correct index; and for QR/GChem the option text too)
  3. no stem changed
  4. every item that carries feedback has: why, one trap line per wrong option
     (null at the key), trick, skill
  5. nothing written on this branch contains an em dash, en dash, emoji or icon
     glyph, payment language, or a reference to a choice by letter
  6. reports how many items still lack an explanation
"""
import json, os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import lib

fails = []
BAD_GLYPH = re.compile("[‒–—―−\U0001F000-\U0001FAFF☀-➿⬀-⯿←-⇿️]")
PAY = re.compile(r"\b(subscribe|subscription|upgrade|premium|unlock|paywall|checkout|free trial|buy now|purchase a|paid plan|pro plan|membership)\b", re.I)
# same tests games/play.html uses to decide a why names a fixed choice
NAMES1 = re.compile(r"(?:option|choice|answer|letter)s?\s+\(?[a-f]\b|\bopts?\s*\[?\s*\d\]?|\((?:option\s*)?[a-f]\)|\[\d\]", re.I)
NAMES2 = re.compile(r"\b[A-E](?:/[A-E])+\b|\b[A-E]\s+(?:is|are|was|were|has|have|drops|adds|puts|gives|lists|shows|names|keeps|lacks|uses|reports|would|miscounts?)\b")
SKILL = re.compile(r"^[a-z]+(\.[a-z0-9]+(-[a-z0-9]+)*)+$")
FIELDS = ("why", "traps", "trick", "skill")


def text_of(it):
    out = [it.get("why") or "", it.get("trick") or "", it.get("skill") or ""]
    out += [t for t in (it.get("traps") or []) if t]
    return out


def check_written(tag, it, old):
    """Scan text that differs from origin/main."""
    new_texts = text_of(it)
    old_texts = set(text_of(old)) if old else set()
    for t in new_texts:
        if t in old_texts:
            continue
        if BAD_GLYPH.search(t):
            fails.append("%s %s: banned glyph in %r" % (tag, it["id"], t[:70]))
        if PAY.search(t):
            fails.append("%s %s: payment language in %r" % (tag, it["id"], t[:70]))
        if NAMES1.search(t) or NAMES2.search(t):
            fails.append("%s %s: names a choice by letter or index in %r" % (tag, it["id"], t[:70]))
    if old is not None:
        for o_new, o_old in zip(it["opts"], old["opts"]):
            if o_new != o_old and BAD_GLYPH.search(o_new.replace("−", "")):
                fails.append("%s %s: banned glyph in rewritten option %r" % (tag, it["id"], o_new[:70]))


def check_shape(tag, it):
    if not any(f in it for f in ("traps", "trick", "skill")):
        return False
    k, n = it["correct"], len(it["opts"])
    if not (isinstance(it.get("why"), str) and it["why"].strip()):
        fails.append("%s %s: empty why" % (tag, it["id"]))
    tr = it.get("traps")
    if not isinstance(tr, list) or len(tr) != n:
        fails.append("%s %s: traps must be a list of %d" % (tag, it["id"], n))
    else:
        if tr[k] is not None:
            fails.append("%s %s: traps[key] must be null" % (tag, it["id"]))
        for j, t in enumerate(tr):
            if j != k and not (isinstance(t, str) and len(t.strip()) >= 12):
                fails.append("%s %s: missing trap line for option %d" % (tag, it["id"], j))
    if not (isinstance(it.get("trick"), str) and it["trick"].strip()):
        fails.append("%s %s: empty trick" % (tag, it["id"]))
    if not (isinstance(it.get("skill"), str) and SKILL.match(it["skill"])):
        fails.append("%s %s: bad skill tag %r" % (tag, it["id"], it.get("skill")))
    return True


summary = []
for name in ("qr", "bio", "gchem"):
    try:
        new = lib.load_bank(name)
    except Exception as e:
        fails.append("%s: does not parse: %s" % (name, e))
        continue
    old = {it["id"]: it for it in json.loads(lib.git_show(lib.BANKS[name]))}
    if len(new) != len(old) or {it["id"] for it in new} != set(old):
        fails.append("%s: item set changed" % name)
    key_changes = stem_changes = opt_changes = keytext_changes = fb = 0
    for it in new:
        o = old.get(it["id"])
        if o is None:
            continue
        if it["correct"] != o["correct"]:
            key_changes += 1
            fails.append("%s %s: key index changed" % (name, it["id"]))
        if it["q"] != o["q"]:
            stem_changes += 1
            fails.append("%s %s: stem changed" % (name, it["id"]))
        if len(it["opts"]) != len(o["opts"]):
            fails.append("%s %s: option count changed" % (name, it["id"]))
        elif it["opts"] != o["opts"]:
            opt_changes += 1
            if name != "bio":
                fails.append("%s %s: options changed" % (name, it["id"]))
            if it["opts"][it["correct"]] != o["opts"][o["correct"]]:
                keytext_changes += 1
        if len(set(x.strip().lower() for x in it["opts"])) != len(it["opts"]):
            fails.append("%s %s: duplicate options" % (name, it["id"]))
        if check_shape(name, it):
            fb += 1
        check_written(name, it, o)
        extra = set(it) - set(o) - set(FIELDS)
        if extra:
            fails.append("%s %s: unexpected new fields %s" % (name, it["id"], sorted(extra)))
    nowhy = sum(1 for it in new if not it.get("why"))
    summary.append("%-5s items %4d | key index changes %d | stem changes %d | items with reworded options %d (key text reworded in %d) | full feedback %4d | no explanation %4d"
                   % (name, len(new), key_changes, stem_changes, opt_changes, keytext_changes, fb, nowhy))

# practice tests
try:
    head, tests, tail = lib.load_mock()
    _, otests, _ = lib.split_mock(lib.git_show(lib.MOCK_REL))
    tot = nowhy = fb = kc = 0
    for t, ot in zip(tests, otests):
        for sec in ot["sections"]:
            a, b = t["sections"][sec], ot["sections"][sec]
            if [x["id"] for x in a] != [x["id"] for x in b]:
                fails.append("mock %s %s: item order or set changed" % (t["id"], sec))
                continue
            for it, o in zip(a, b):
                tot += 1
                if it["correct"] != o["correct"] or it["opts"] != o["opts"] or it["q"] != o["q"]:
                    kc += 1
                    fails.append("mock %s %s: stem, options or key changed" % (t["id"], it["id"]))
                if not it.get("why"):
                    nowhy += 1
                if check_shape("mock", it):
                    fb += 1
                check_written("mock", it, o)
    summary.append("mock  items %4d | stem/option/key changes %d | full feedback %4d | no explanation %4d" % (tot, kc, fb, nowhy))
except Exception as e:
    fails.append("practice tests: does not parse: %s" % e)

print("\n".join(summary))
if fails:
    print("\nFAIL (%d)" % len(fails))
    print("\n".join(fails[:60]))
    sys.exit(1)
print("\nOK: all banks parse, 0 key changes, 0 stem changes, feedback complete on every explained item, no banned glyphs or payment language, no choice named by letter.")
