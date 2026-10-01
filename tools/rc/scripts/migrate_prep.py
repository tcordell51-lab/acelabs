"""One-off migration: the prep app's original RC passages -> the Ace Labs schema.

Reads ~/code/acethedat-prep/build/rc/rc-NN-passage.json + rc-NN-questions.json
(passages written for AceTheDAT, nothing lifted from anywhere) and writes
tools/rc/data/passages/rc-pNN.json with sentence-split paragraphs. Proof lines are
added afterwards from the blind re-answer pass (see tools/rc/VERIFICATION.md);
a migrated passage only enters the bank once every key has a validated proof line.

Usage: python3 tools/rc/scripts/migrate_prep.py [--pack OUTDIR]
  --pack writes key-stripped examiner packs (no keys, no explanations) to OUTDIR.
"""
import json, os, sys, glob
sys.path.insert(0, os.path.dirname(__file__))
from split_sentences import split

SRC = os.path.expanduser('~/code/acethedat-prep/build/rc')
OUT = os.path.join(os.path.dirname(__file__), '..', 'data', 'passages')
TYPE_MAP = {'detail': 'detail', 'vocab': 'vocab', 'inference': 'inference', 'mainidea': 'mainidea',
            'purpose': 'function', 'structure': 'mainidea', 'tone': 'tone', 'except': 'except',
            'locate': 'detail'}
FIELD = {1: 'zoology', 2: 'materials chemistry', 3: 'marine biology', 4: 'microbiology', 5: 'geology',
         6: 'microbiology', 7: 'ocean chemistry', 8: 'neuroscience', 9: 'pharmacology', 10: 'ecology',
         11: 'molecular biology', 12: 'physiology', 13: 'chemistry', 14: 'animal behavior',
         15: 'history of science', 16: 'history of science', 17: 'earth science', 18: 'pharmacology',
         19: 'neuroscience'}


def load(n):
    p = json.load(open(f'{SRC}/rc-{n:02d}-passage.json'))
    q = json.load(open(f'{SRC}/rc-{n:02d}-questions.json'))
    return p, q['items']


def convert(n):
    p, items = load(n)
    paras = [split(x) for x in p['paragraphs']]
    pid = p['id']
    qs = []
    for i, it in enumerate(items, 1):
        q = {
            'id': f'{pid}-q{i:02d}',
            'type': TYPE_MAP[it['type']],
            'stem': it['q'],
            'choices': it['o'],
            'key': it['a'],
            'proof': [],
            'why': it['w'],
            'distractorNotes': [None if j == it['a'] else t for j, t in enumerate(it['t'])],
            'difficulty': it.get('d'),
            'srcParagraph': it.get('ref', 0),
        }
        if it['type'] in ('locate', 'purpose', 'structure'):
            q['subtype'] = it['type']
        qs.append(q)
    words = len(' '.join(' '.join(s) for s in paras).split())
    return {'id': pid, 'title': p['title'], 'topic': p['topic'], 'field': FIELD[n],
            'source': 'migrated:acethedat-prep', 'words': words, 'paragraphs': paras, 'questions': qs}


def pack(d):
    lines = [f"PASSAGE {d['id']}: {d['title']}", '']
    for i, para in enumerate(d['paragraphs'], 1):
        lines.append(f'Paragraph {i}')
        for j, s in enumerate(para, 1):
            lines.append(f'  [P{i} S{j}] {s}')
        lines.append('')
    lines.append('QUESTIONS')
    for q in d['questions']:
        lines.append(f"{q['id']}  {q['stem']}")
        for j, c in enumerate(q['choices']):
            lines.append(f"   {'ABCDE'[j]}. {c}")
        lines.append('')
    return '\n'.join(lines)


if __name__ == '__main__':
    packdir = sys.argv[sys.argv.index('--pack') + 1] if '--pack' in sys.argv else None
    nums = sorted(int(os.path.basename(f)[3:5]) for f in glob.glob(f'{SRC}/rc-*-passage.json'))
    for n in nums:
        d = convert(n)
        if packdir:
            os.makedirs(packdir, exist_ok=True)
            open(f"{packdir}/{d['id']}.txt", 'w').write(pack(d))
        else:
            os.makedirs(OUT, exist_ok=True)
            json.dump(d, open(f"{OUT}/{d['id']}.json", 'w'), indent=1, ensure_ascii=False)
        print(d['id'], d['words'], 'words', len(d['questions']), 'questions')
