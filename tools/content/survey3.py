"""Which practice-test items lack `why`, and do their ids exist in game banks?"""
import json, os, collections, glob
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def load_mock():
    s = open(os.path.join(ROOT, "shared", "dat-mock-tests.js")).read()
    i = s.index("window.DAT_MOCK_TESTS")
    j = s.index("[", i)
    body = s[j:].rstrip().rstrip(";")
    return json.JSONDecoder().raw_decode(body)[0], s[:j], s[j:]


tests, head, tail = load_mock()
games = {}
for n in ["gchem", "qr", "bio"]:
    for it in json.load(open(os.path.join(ROOT, "games", n + ".json"))):
        games[it["id"]] = it
tot = 0
missing = []
for t in tests:
    for sec, items in t["sections"].items():
        tot += len(items)
        c = collections.Counter(len(it["opts"]) for it in items)
        m = [it for it in items if not it.get("why")]
        print(t["id"], sec, len(items), "missing", len(m), "nopts", dict(c))
        missing += [(t["id"], sec, it) for it in m]
print("total", tot, "missing", len(missing))
ing = [x for x in missing if x[2]["id"] in games]
print("missing ids found in game banks", len(ing))
same = [x for x in ing if games[x[2]["id"]]["q"] == x[2]["q"] and games[x[2]["id"]]["opts"] == x[2]["opts"] and games[x[2]["id"]]["correct"] == x[2]["correct"]]
print("identical q/opts/key", len(same))
print("game copies already have why:", sum(1 for x in ing if games[x[2]["id"]].get("why")))
print(collections.Counter(x[2]["topic"] for x in missing).most_common())
print("keys in mock items", collections.Counter(k for t in tests for items in t["sections"].values() for it in items for k in it))
print("tail end:", repr(tail[-200:]))
# other banks
for f in glob.glob(os.path.join(ROOT, "tools/mock/data/*")):
    print(f, os.path.getsize(f))
