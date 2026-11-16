"""Copy feedback from the game banks into the practice tests (shared/dat-mock-tests.js).

A practice-test item receives the game item's why/traps/trick/skill only when the
two copies have the same id, stem, options and key. Nothing else in the file
changes (item order, topic, difficulty, page behavior).
"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import lib

games = {}
for n in ("qr", "bio", "gchem"):
    for it in lib.load_bank(n):
        games[it["id"]] = it
head, tests, tail = lib.load_mock()
filled = full = still = mismatch = 0
for t in tests:
    for sec, items in t["sections"].items():
        for it in items:
            g = games.get(it["id"])
            same = g is not None and g["q"] == it["q"] and g["opts"] == it["opts"] and g["correct"] == it["correct"]
            if g is not None and not same:
                mismatch += 1
            if same and g.get("why"):
                had = bool(it.get("why"))
                if not had:
                    it["why"] = g["why"]
                    filled += 1
                if g.get("traps") and (not had or it["why"] == g["why"]):
                    it["traps"], it["trick"], it["skill"] = g["traps"], g["trick"], g["skill"]
                    full += 1
            if not it.get("why"):
                still += 1
lib.save_mock(head, tests, tail)
print("practice-test items given an explanation: %d" % filled)
print("practice-test items now carrying full feedback (why, traps, trick, skill): %d" % full)
print("practice-test items still without an explanation: %d" % still)
print("items whose game copy differs (left alone): %d" % mismatch)
