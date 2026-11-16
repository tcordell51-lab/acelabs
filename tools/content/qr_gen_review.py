"""Review helper: list options that only got a generic check line, and sample outputs.
usage: qr_gen_review.py fallbacks | sample <n> | show <id>...
"""
import json, os, sys, random, re
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import qr_gen as g

bank = json.load(open(os.path.join(g.ROOT, "games", "qr.json")))
mode = sys.argv[1]
if mode == "fallbacks":
    for it in bank:
        if it.get("why"):
            continue
        try:
            res = g.solve(it)
        except g.Flag:
            continue
        if res is None or res.val is None:
            continue
        k = it["correct"]
        bad = []
        for i, o in enumerate(it["opts"]):
            if i == k:
                continue
            ov = g.parse_num(o)
            if ov is None or not any(mv is not None and (ov == mv or g.same(o, mv)) for mv, _ in res.models):
                bad.append(o)
        if bad:
            print(it["id"], "|", it["q"], "| key", it["opts"][k], "| unmatched", bad)
elif mode == "sample":
    random.seed(int(sys.argv[3]) if len(sys.argv) > 3 else 1)
    out = json.load(open(os.path.join(g.DATA, "qr-generated.json")))
    byid = {it["id"]: it for it in bank}
    fams = {}
    for i in out:
        fams.setdefault(re.sub(r"\d+$", "", i) + byid[i]["topic"], []).append(i)
    for f in sorted(fams):
        for i in random.sample(fams[f], min(int(sys.argv[2]), len(fams[f]))):
            it, e = byid[i], out[i]
            print("##", i, it["q"], it["opts"], "KEY", it["opts"][it["correct"]])
            print("  why:", e["why"])
            for o, t in zip(it["opts"], e["traps"]):
                if t:
                    print("  [%s] %s" % (o, t))
            print("  trick:", e["trick"], "| skill:", e["skill"])
else:
    out = json.load(open(os.path.join(g.DATA, "qr-generated.json")))
    byid = {it["id"]: it for it in bank}
    for i in sys.argv[2:]:
        it, e = byid[i], out[i]
        print("##", i, it["q"], it["opts"], "KEY", it["opts"][it["correct"]])
        print(json.dumps(e, indent=1, ensure_ascii=False))
