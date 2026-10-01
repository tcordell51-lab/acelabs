"""Write a key-stripped examiner pack (passage with [P# S#] labels + questions, no keys,
no explanations) for each passage JSON given. Usage: make_pack.py OUTDIR file.json ..."""
import json, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from migrate_prep import pack

out = sys.argv[1]
os.makedirs(out, exist_ok=True)
for f in sys.argv[2:]:
    d = json.load(open(f))
    open(os.path.join(out, d['id'] + '.txt'), 'w').write(pack(d))
    print(d['id'])
