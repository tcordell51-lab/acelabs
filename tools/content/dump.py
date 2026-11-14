"""Dump items lacking `why` from a game bank, compactly, for review.
usage: dump.py <bank> [topic,topic,...|-] [start] [count] [idprefix-regex]
"""
import json, sys, os, re
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
bank = sys.argv[1]
topics = sys.argv[2].split(",") if len(sys.argv) > 2 and sys.argv[2] != "-" else None
start = int(sys.argv[3]) if len(sys.argv) > 3 else 0
count = int(sys.argv[4]) if len(sys.argv) > 4 else 10000
rx = re.compile(sys.argv[5]) if len(sys.argv) > 5 else None
d = json.load(open(os.path.join(ROOT, "games", bank + ".json")))
miss = [it for it in d if not it.get("why") and (topics is None or it["topic"] in topics)
        and (rx is None or rx.search(it["id"]))]
for it in miss[start:start + count]:
    opts = " | ".join("%d) %s" % (i, o) for i, o in enumerate(it["opts"]))
    print("%s [%s d%s] %s || %s  KEY=%d" % (it["id"], it["topic"], it["difficulty"], it["q"], opts, it["correct"]))
