"""Fixes applied to migrated prep-app passages after the blind re-answer pass.

Each fix is a sentence replacement (exact old text -> new text) or a question
patch, with the reason. Applied to the reconciled passages before they enter
tools/rc/data/passages. Word counts are recomputed.

Usage: python3 prep_fixups.py DIR
"""
import json, os, sys

SENT = [
    # (passage, paragraph, sentence, old, new, reason)
    ('rc-p14', 9, 8, 'Reverse the horizontal part alone and it carries on.',
     'Reverse both parts at once, flipping the whole field, and it carries on as before.',
     'Fact: an inclination compass reverses when the horizontal component alone is flipped; flipping the whole field leaves it unchanged (Wiltschko).'),
    ('rc-p19', 10, 3, None,
     'In classic animal preparations where the blood supply to the brain and to the rest of the body could be separated, delivering the agent to the brain alone took far more of it to stop movement, and animals whose cords had been cut off from the brain needed about the same concentration as intact ones.',
     'Fact: in the goat bypass work, brain-only delivery RAISED the concentration needed to prevent movement; the passage had it as hardly changed.'),
    ('rc-p10', 7, 4, None,
     'Arbuscular fungi cannot manufacture their own fatty acids and must be handed them by a host, which is a large part of why for decades no one could grow one to completion on a laboratory plate without a plant, until researchers supplied a fatty acid directly.',
     'Fact: since 2019 Rhizophagus irregularis has been grown without a plant when fed myristate; softened and made current.'),
    ('rc-p05', 9, 1, None,
     'The institutional answer took shape from the late 1980s into the 1990s as the International Airways Volcano Watch, run under the International Civil Aviation Organization.',
     'Fact: ICAO began the IAVW in the late 1980s; the advisory centres were designated in the 1990s.'),
    ('rc-p02', 12, 5, None,
     'Roman builders made durable marine mortar from lime and volcanic ash two thousand years ago on much the same principle, with no steel inside it, and some of their harbor works still stand.',
     'Item rc-p02-q09 needed outside knowledge that Roman mortar held no steel; the passage now says so.'),
    ('rc-p15', 2, 5, 'Within hours it is oxidized to carbon dioxide, and within a few years mixing has carried it worldwide.',
     'It is soon oxidized, first to carbon monoxide and then, over weeks to months, to carbon dioxide, and within a few years mixing has carried it worldwide.',
     'Fact: new carbon-14 becomes CO within hours; the step to CO2 takes weeks to months.'),
]

Q = [
    ('rc-p14-q03', {'choices': {3: 'reverses when the whole field is flipped at once'},
                    'distractorNotes': {3: 'Paragraph 9 says the bird carries on when the whole field is flipped; it is the vertical part alone that turns it around.'}},
     'Distractor D followed the corrected sentence in P9.'),
]


def apply(d):
    log = []
    for pid, p, s, old, new, why in SENT:
        if d['id'] != pid:
            continue
        cur = d['paragraphs'][p - 1][s - 1]
        if old is not None and cur != old:
            raise SystemExit(f'{pid} P{p} S{s} does not match the expected text: {cur}')
        d['paragraphs'][p - 1][s - 1] = new
        log.append(f'{pid} P{p} S{s}: {why}')
    for qid, patch, why in Q:
        for q in d['questions']:
            if q['id'] != qid:
                continue
            for field, repl in patch.items():
                for i, v in repl.items():
                    q[field][i] = v
            log.append(f'{qid}: {why}')
    d['words'] = len(' '.join(' '.join(x) for x in d['paragraphs']).split())
    return log


if __name__ == '__main__':
    root = sys.argv[1]
    for f in sorted(os.listdir(root)):
        if not f.endswith('.json'):
            continue
        path = os.path.join(root, f)
        d = json.load(open(path))
        for line in apply(d):
            print(line)
        json.dump(d, open(path, 'w'), indent=1, ensure_ascii=False)
