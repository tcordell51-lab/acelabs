"""Measure the longest-choice tell in a game bank.

An item has the tell when the keyed choice is strictly longer (in characters)
than every other choice. With no tell, the key would be the single longest
choice about 1/n of the time (20 to 25 percent for 4 or 5 choices).

usage: tell.py <bank> [origin]     'origin' measures origin/main instead of the working file
"""
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import lib


def is_tell(it):
    L = [len(o) for o in it["opts"]]
    k = it["correct"]
    return all(L[k] > L[j] for j in range(len(L)) if j != k)


def is_shortest(it):
    L = [len(o) for o in it["opts"]]
    k = it["correct"]
    return all(L[k] < L[j] for j in range(len(L)) if j != k)


def stats(items, label):
    n = len(items)
    if not n:
        return
    t = sum(1 for it in items if is_tell(it))
    s = sum(1 for it in items if is_shortest(it))
    ratio = sum(len(it["opts"][it["correct"]]) / (sum(len(o) for i, o in enumerate(it["opts"]) if i != it["correct"]) / (len(it["opts"]) - 1)) for it in items) / n
    print("%-34s n=%4d | key is the single longest: %3d (%.1f%%) | key is the single shortest: %3d (%.1f%%) | mean key length / mean distractor length: %.2f"
          % (label, n, t, 100 * t / n, s, 100 * s / n, ratio))


if __name__ == "__main__":
    name = sys.argv[1]
    cur = lib.load_bank(name)
    old = json.loads(lib.git_show(lib.BANKS[name]))
    data = old if len(sys.argv) > 2 and sys.argv[2] == "origin" else cur
    oldby = {it["id"]: it for it in old}
    short = [it for it in data if not oldby[it["id"]].get("why")]
    longf = [it for it in data if oldby[it["id"]].get("why")]
    stats(data, name + " all items")
    stats(short, name + " short-form (no why on main)")
    stats(longf, name + " long-form (had why on main)")
    stats([it for it in data if len(it["opts"]) == 4], name + " 4-choice items")
    stats([it for it in data if len(it["opts"]) == 5], name + " 5-choice items")
