"""Survey the Game Central banks: counts, schema, missing explanations."""
import json, sys, collections, os
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
for name in ["gchem", "qr", "bio"]:
    d = json.load(open(os.path.join(ROOT, "games", name + ".json")))
    print("==", name, type(d).__name__, (list(d.keys()) if isinstance(d, dict) else len(d)))
    items = d if isinstance(d, list) else d.get("items") or d.get("questions")
    print("items", len(items))
    keys = collections.Counter()
    for it in items:
        keys.update(it.keys())
    print(dict(keys))
    miss = [it for it in items if not it.get("why")]
    print("missing why", len(miss))
    print("nchoices", collections.Counter(len(it.get("choices", it.get("options", []))) for it in items))
    print("nchoices missing", collections.Counter(len(it.get("choices", it.get("options", []))) for it in miss))
    print("topics missing", collections.Counter(it.get("topic") for it in miss).most_common(40))
    print("sample with", json.dumps(next((it for it in items if it.get("why")), None))[:900])
    print("sample without", json.dumps(miss[0] if miss else None)[:900])
