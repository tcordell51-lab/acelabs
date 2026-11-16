"""Merge QR explanations (template-generated + hand-written) into games/qr.json.

Run qr_gen.py first. Hand-written entries override generated ones. Items listed in
a flag list never receive an explanation. Only items that had no `why` on
origin/main are touched.
"""
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import lib, qr_hand
from qr_gen import norm

gen = json.load(open(os.path.join(lib.DATA, "qr-generated.json"), encoding="utf-8"))
gen_flags = json.load(open(os.path.join(lib.DATA, "qr-generated-flags.json"), encoding="utf-8"))
base = {it["id"]: it for it in json.loads(lib.git_show("games/qr.json"))}
bank = lib.load_bank("qr")

flagged = {f["id"] for f in gen_flags} | set(qr_hand.FLAGS)
done = hand_n = gen_n = 0
problems = []
for it in bank:
    i = it["id"]
    if base[i].get("why") or i in flagged:
        continue
    opts, k = it["opts"], it["correct"]
    if i in qr_hand.H:
        why, tr, trick, skill = qr_hand.H[i]
        if isinstance(tr, dict):
            lut = {norm(a): b for a, b in tr.items()}
            traps = [None if j == k else lut.get(norm(o)) for j, o in enumerate(opts)]
        else:
            if len(tr) != len(opts) - 1:
                problems.append("%s: %d trap lines for %d wrong options" % (i, len(tr), len(opts) - 1))
                continue
            t = list(tr)
            traps = [None if j == k else t.pop(0) for j in range(len(opts))]
        if any(traps[j] is None for j in range(len(opts)) if j != k):
            problems.append("%s: missing trap line" % i)
            continue
        hand_n += 1
    elif i in gen:
        e = gen[i]
        why, traps, trick, skill = e["why"], e["traps"], e["trick"], e["skill"]
        gen_n += 1
    else:
        continue
    lib.set_feedback(it, why, traps, trick, skill)
    done += 1

if problems:
    print("\n".join(problems))
    sys.exit(1)
lib.save_bank("qr", bank)

flags = []
for f in gen_flags:
    flags.append({"id": f["id"], "kind": f["kind"], "q": f["q"], "opts": f["opts"], "correct": f["correct"], "problem": f["problem"], "reasoning": f["reasoning"]})
byid = {it["id"]: it for it in bank}
for i, (kind, problem, reasoning) in qr_hand.FLAGS.items():
    it = byid[i]
    flags.append({"id": i, "kind": kind, "q": it["q"], "opts": it["opts"], "correct": it["correct"], "problem": problem, "reasoning": reasoning})
json.dump(flags, open(os.path.join(lib.DATA, "qr-flags.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
left = [it["id"] for it in bank if not it.get("why")]
print("QR explained this run: %d (hand %d, template %d)" % (done, hand_n, gen_n))
print("QR flagged, no explanation: %d" % len(flags))
print("QR still without why: %d" % len(left))
unaccounted = [i for i in left if i not in flagged]
print("of those, not flagged:", len(unaccounted), unaccounted[:40])
