"""Approximate choice counts for question banks written inline in pages.
Counts string literals inside each `opts: [...]` (or "opts":[...]) array. Pattern
based, so treat the numbers as close estimates, not exact."""
import os, re, sys, collections, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import lib

STR = re.compile(r"'(?:\\.|[^'\\])*'|\"(?:\\.|[^\"\\])*\"|`(?:\\.|[^`\\])*`")
files = ["tools/gc/index.html", "tools/qr/index.html", "tools/bio/bio-diagnostic.html", "tools/bio/bio-mock.html",
         "tools/bio/bio-ap-bootcamp.html", "tools/gc/recognition-lab.html", "tools/ochem/index.html"]
print("| Page (inline bank) | Items found | 2 | 3 | 4 | 5 | 6+ |")
print("|---|---|---|---|---|---|---|")
for f in files:
    p = os.path.join(lib.ROOT, f)
    if not os.path.exists(p):
        continue
    s = open(p, encoding="utf-8").read()
    c = collections.Counter()
    for m in re.finditer(r"[\"']?(?:opts|options|choices)[\"']?\s*:\s*\[", s):
        i = m.end()
        depth, j = 1, i
        while j < len(s) and depth:
            ch = s[j]
            if ch in "'\"`":
                mm = STR.match(s, j)
                if mm:
                    j = mm.end()
                    continue
            if ch == "[":
                depth += 1
            elif ch == "]":
                depth -= 1
            j += 1
        body = s[i:j - 1]
        n = len(STR.findall(body))
        if n >= 2:
            c[n] += 1
    tot = sum(c.values())
    print("| `%s` | %d | %d | %d | %d | %d | %d |" % (f, tot, c.get(2, 0), c.get(3, 0), c.get(4, 0), c.get(5, 0), sum(v for k, v in c.items() if k >= 6)))

s = open(os.path.join(lib.ROOT, "tools/mock/data/full-mocks.js"), encoding="utf-8").read()
print("full-mocks.js head:", s[:300].replace("\n", " "))
i = s.find('"correct"')
print("around first correct:", s[max(0, i - 500):i + 60].replace("\n", " "))
