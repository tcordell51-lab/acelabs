"""Count answer choices per item in every data bank that can be parsed as data."""
import json, os, re, sys, collections
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import lib

rows = []


def add(label, items, key="opts"):
    c = collections.Counter(len(it.get("opts") or it.get("choices") or it.get("options") or []) for it in items)
    rows.append((label, len(items), c))


for n in ("qr", "bio", "gchem"):
    add(lib.BANKS[n], lib.load_bank(n))
s = open(os.path.join(lib.ROOT, "games/ochem-bank-1000.js"), encoding="utf-8").read()
add("games/ochem-bank-1000.js", json.JSONDecoder().raw_decode(s[s.index("["):])[0])
_, tests, _ = lib.load_mock()
add("shared/dat-mock-tests.js (practice tests 1-3)", [it for t in tests for sec in t["sections"].values() for it in sec])
s = open(os.path.join(lib.ROOT, "tools/minitests/bank.js"), encoding="utf-8").read()
mt = json.JSONDecoder().raw_decode(s[s.index("{", s.index("window.MINITEST_BANK")):])[0]
add("tools/minitests/bank.js (the Climb)", [q for t in mt["tests"] for q in t["questions"]], key="choices")
s = open(os.path.join(lib.ROOT, "tools/mock/data/full-mocks.js"), encoding="utf-8").read()
try:
    i = s.index("=") + 1
    fm = json.JSONDecoder().raw_decode(s[i:].lstrip())[0]
    items = []

    def walk(x):
        if isinstance(x, dict):
            if ("choices" in x or "opts" in x or "options" in x) and ("correct" in x or "answer" in x):
                items.append(x)
            for v in x.values():
                walk(v)
        elif isinstance(x, list):
            for v in x:
                walk(v)
    walk(fm)
    add("tools/mock/data/full-mocks.js (full-length DAT 1-4)", items, key="choices")
except Exception as e:
    print("full-mocks.js not parsed:", e)

print("| Bank | Items | 3 choices | 4 choices | 5 choices | other |")
print("|---|---|---|---|---|---|")
for label, n, c in rows:
    other = sum(v for k, v in c.items() if k not in (3, 4, 5))
    print("| `%s` | %d | %d | %d | %d | %d |" % (label, n, c.get(3, 0), c.get(4, 0), c.get(5, 0), other))
# per-topic detail for QR
qr = lib.load_bank("qr")
t = collections.defaultdict(collections.Counter)
for it in qr:
    t[it["topic"]][len(it["opts"])] += 1
print()
print("QR game bank by topic (3 / 4 / 5):")
print(", ".join("%s %d/%d/%d" % (k, v.get(3, 0), v.get(4, 0), v.get(5, 0)) for k, v in sorted(t.items())))
