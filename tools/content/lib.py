"""Shared helpers for the content tools (stdlib only)."""
import json, os, subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
MOCK_REL = "shared/dat-mock-tests.js"
BANKS = {"qr": "games/qr.json", "bio": "games/bio.json", "gchem": "games/gchem.json"}


def load_bank(name):
    return json.load(open(os.path.join(ROOT, BANKS[name]), encoding="utf-8"))


def save_bank(name, data):
    # byte-compatible with the repo's existing serialization
    with open(os.path.join(ROOT, BANKS[name]), "w", encoding="utf-8") as f:
        f.write(json.dumps(data, ensure_ascii=False, separators=(",", ":")))


def split_mock(text):
    j = text.index("[", text.index("window.DAT_MOCK_TESTS"))
    data, end = json.JSONDecoder().raw_decode(text[j:])
    return text[:j], data, text[j + end:]


def load_mock():
    return split_mock(open(os.path.join(ROOT, MOCK_REL), encoding="utf-8").read())


def save_mock(head, data, tail):
    with open(os.path.join(ROOT, MOCK_REL), "w", encoding="utf-8") as f:
        f.write(head + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + tail)


def git_show(rel, ref="origin/main"):
    return subprocess.run(["git", "-C", ROOT, "show", "%s:%s" % (ref, rel)], capture_output=True, check=True).stdout.decode("utf-8")


def set_feedback(item, why, traps, trick, skill):
    """Attach the four feedback fields in a fixed key order."""
    item["why"] = why
    item["traps"] = traps
    item["trick"] = trick
    item["skill"] = skill
