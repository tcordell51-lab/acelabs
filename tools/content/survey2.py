"""Survey practice-test bank and other banks for schema and choice counts."""
import json, os, re, collections, subprocess
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
p = os.path.join(ROOT, "shared", "dat-mock-tests.js")
s = open(p).read()
print("dat-mock-tests.js size", len(s))
print(s[:1500])
print("....")
i = s.find("explanation")
print(s[i - 600:i + 600] if i > 0 else "no 'explanation'")
for f in ["scripts/dat-mock-bank.json"]:
    fp = os.path.join(ROOT, f)
    if os.path.exists(fp):
        d = json.load(open(fp))
        print(f, type(d).__name__, len(d), (list(d.keys())[:10] if isinstance(d, dict) else json.dumps(d[0])[:800]))
