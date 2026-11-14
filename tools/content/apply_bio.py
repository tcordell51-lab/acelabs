"""Merge hand-written Biology feedback and distractor rewrites into games/bio.json.

Reads every tools/content/bio_batch*.py. For each entry it may replace the four
choices (same count, key stays at the same index), then attaches why, traps,
trick and skill. Flagged items are left untouched and listed in data/bio-flags.json.
"""
import glob, importlib.util, json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import lib

here = os.path.dirname(os.path.abspath(__file__))
from bio_optfix import PATCH
B, FLAGS, NOTES = {}, {}, {}
for f in sorted(glob.glob(os.path.join(here, "bio_batch*.py"))):
    spec = importlib.util.spec_from_file_location(os.path.basename(f)[:-3], f)
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    dup = set(B) & set(m.B)
    if dup:
        sys.exit("duplicate ids across batches: %s" % sorted(dup))
    B.update(m.B)
    FLAGS.update(getattr(m, "FLAGS", {}))
    NOTES.update(getattr(m, "NOTES", {}))

base = {it["id"]: it for it in json.loads(lib.git_show("games/bio.json"))}
bank = lib.load_bank("bio")
problems, done, reworded = [], 0, 0
for it in bank:
    i = it["id"]
    if i in FLAGS:
        if i in B:
            problems.append("%s is both flagged and explained" % i)
        continue
    if i not in B:
        continue
    o = base[i]
    if o.get("why"):
        problems.append("%s already had an explanation on main" % i)
        continue
    opts, why, tr, trick, skill = B[i]
    k = o["correct"]
    new_opts = list(o["opts"]) if opts is None else list(opts)
    for j, text in PATCH.get(i, {}).items():
        new_opts[j] = text
    if len(new_opts) != len(o["opts"]):
        problems.append("%s: option count changed" % i)
        continue
    if len(tr) != len(new_opts) - 1:
        problems.append("%s: %d trap lines for %d wrong options" % (i, len(tr), len(new_opts) - 1))
        continue
    if len(set(x.strip().lower() for x in new_opts)) != len(new_opts):
        problems.append("%s: duplicate options" % i)
        continue
    t = list(tr)
    traps = [None if j == k else t.pop(0) for j in range(len(new_opts))]
    it["opts"] = new_opts
    lib.set_feedback(it, why, traps, trick, skill)
    done += 1
    if new_opts != o["opts"]:
        reworded += 1
unknown = [i for i in list(B) + list(FLAGS) if i not in base]
if unknown:
    problems.append("unknown ids: %s" % unknown)
if problems:
    print("\n".join(problems))
    sys.exit(1)
lib.save_bank("bio", bank)

byid = {it["id"]: it for it in bank}
flags = []
for i, (kind, problem, reasoning) in FLAGS.items():
    it = byid[i]
    flags.append({"id": i, "kind": kind, "q": it["q"], "opts": it["opts"], "correct": it["correct"], "problem": problem, "reasoning": reasoning})
json.dump(flags, open(os.path.join(lib.DATA, "bio-flags.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
notes = [{"id": i, "q": byid[i]["q"], "note": n} for i, n in NOTES.items()]
json.dump(notes, open(os.path.join(lib.DATA, "bio-notes.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
left = [it["id"] for it in bank if not it.get("why")]
print("Bio explained: %d (choices reworded in %d)" % (done, reworded))
print("Bio flagged, no explanation: %d" % len(flags))
print("Bio still without why: %d (of which flagged: %d)" % (len(left), sum(1 for i in left if i in FLAGS)))
