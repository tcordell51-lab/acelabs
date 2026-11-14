"""Build content-review/FLAGS.md from the flag data files.
usage: write_flags.py <output path>
"""
import json, os, sys, glob
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import lib

out = sys.argv[1]
ORDER = ["key", "two", "stem", "precision", "giveaway", "house"]
TITLE = {
    "key": "1. Key looks wrong or is debatable",
    "two": "2. Two choices are defensible",
    "stem": "3. Stem is under-specified",
    "precision": "4. Rounding or precision makes the key doubtful",
    "giveaway": "5. Stem gives the answer away",
    "house": "6. Key rests on a coaching rule only you can confirm",
}
flags = []
for f in sorted(glob.glob(os.path.join(lib.DATA, "*-flags.json"))):
    if os.path.basename(f) == "qr-generated-flags.json":
        continue
    bank = os.path.basename(f).split("-")[0]
    for x in json.load(open(f, encoding="utf-8")):
        x["bank"] = bank
        flags.append(x)
L = ["ABCDEFGH"[i] for i in range(8)]
lines = ["# Content review flags for Thomas", "",
         "Every item here was solved before any explanation was written. Where my answer disagreed with the key, where two choices could both be defended, or where the stem did not pin down one answer, I wrote no explanation and listed the item here instead. Nothing in the banks was changed for these items: stems, choices and keys are exactly as on main.",
         "",
         "Total flagged: %d. Letters below follow the order the choices are stored in the bank (the game shuffles them on screen)." % len(flags), "",
         "| Group | Count |", "|---|---|"]
for k in ORDER:
    n = sum(1 for x in flags if x["kind"] == k)
    if n:
        lines.append("| %s | %d |" % (TITLE[k][3:], n))
lines.append("")
for k in ORDER:
    grp = [x for x in flags if x["kind"] == k]
    if not grp:
        continue
    lines += ["## " + TITLE[k], ""]
    for x in grp:
        lines.append("### %s (%s)" % (x["id"], lib.BANKS[x["bank"]]))
        lines.append("")
        lines.append("Stem: %s" % x["q"].replace("—", "-").replace("–", "-"))
        lines.append("")
        for j, o in enumerate(x["opts"]):
            lines.append("- %s. %s%s" % (L[j], o.replace("—", "-").replace("–", "-"), "  (keyed)" if j == x["correct"] else ""))
        lines.append("")
        lines.append("Problem: %s." % x["problem"].rstrip("."))
        lines.append("")
        lines.append("Reasoning: %s" % x["reasoning"])
        if x.get("fix"):
            lines.append("")
            lines.append("Suggested fix: %s" % x["fix"])
        lines.append("")
os.makedirs(os.path.dirname(out), exist_ok=True)
open(out, "w", encoding="utf-8").write("\n".join(lines).replace("—", "-").replace("–", "-") + "\n")
print("wrote", out, "flags:", len(flags), {k: sum(1 for x in flags if x["kind"] == k) for k in ORDER})
