"""Print items with their feedback as a student would see them.
usage: show.py <bank> <id> [<id> ...]   |   show.py <bank> --random N [seed] [idregex]
"""
import sys, os, random, re
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import lib

bank = lib.load_bank(sys.argv[1])
byid = {it["id"]: it for it in bank}
if sys.argv[2] == "--random":
    random.seed(int(sys.argv[4]) if len(sys.argv) > 4 else 0)
    rx = re.compile(sys.argv[5]) if len(sys.argv) > 5 else None
    pool = [it["id"] for it in bank if it.get("traps") and (rx is None or rx.search(it["id"]))]
    ids = random.sample(pool, min(int(sys.argv[3]), len(pool)))
else:
    ids = sys.argv[2:]
for i in ids:
    it = byid[i]
    print("## %s [%s] %s" % (i, it["topic"], it["q"]))
    for j, o in enumerate(it["opts"]):
        mark = "KEY " if j == it["correct"] else "    "
        t = (it.get("traps") or [None] * len(it["opts"]))[j]
        print("  %s%s%s" % (mark, o, "  <-- " + t if t else ""))
    print("  why:", it.get("why"))
    print("  trick:", it.get("trick"), "| skill:", it.get("skill"))
