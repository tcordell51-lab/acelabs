"""Deterministic sentence splitter used once, at authoring/migration time.

Passages are stored as paragraphs of sentences, so the player and the
validator never re-split text at runtime. This splitter only runs when a
prose paragraph is converted into that shape.
"""
import re

ABBREV = {"e.g.", "i.e.", "dr.", "mr.", "mrs.", "ms.", "st.", "vs.", "etc.", "approx.",
          "no.", "fig.", "al.", "u.s.", "ca.", "jr.", "sr.", "prof.", "mt."}

_BOUNDARY = re.compile(r'(?<=[.!?])(["”\')]*)\s+(?=["“(]?[A-Z0-9])')


def split(text):
    text = " ".join(text.split())
    out, start = [], 0
    for m in _BOUNDARY.finditer(text):
        end = m.end(1)
        cand = text[start:end]
        last = cand.split()[-1].lower() if cand.split() else ""
        last = last.strip('"”\')(')
        if last in ABBREV or re.fullmatch(r"[a-z]\.", last) or re.fullmatch(r"(?:[a-z]\.){2,}", last):
            continue  # abbreviation or an initial, not a sentence end
        out.append(cand.strip())
        start = m.end()
    tail = text[start:].strip()
    if tail:
        out.append(tail)
    return out
