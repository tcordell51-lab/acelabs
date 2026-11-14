"""Tell rate among Bio items that received feedback on this branch, and the list
of those where the key is still the single longest choice (with the margin)."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import lib
from tell import is_tell, stats

bank = lib.load_bank("bio")
done = [it for it in bank if it.get("traps")]
stats(done, "bio items repaired on this branch")
if "-v" in sys.argv:
    for it in done:
        if is_tell(it):
            L = sorted((len(o) for i, o in enumerate(it["opts"]) if i != it["correct"]), reverse=True)
            k = len(it["opts"][it["correct"]])
            print("%s  key %d vs next %d  | %s" % (it["id"], k, L[0], " / ".join(it["opts"])))
