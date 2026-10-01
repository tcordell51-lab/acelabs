"""Merge a blind re-answer pass into staged passages.

For every question: if the blind examiner's answer matches the stored key, the
examiner's cited proof line(s) become the question's proof (letters -> indexes).
Disagreements, alsoDefensible flags, notes, and fact flags are printed and the
question is left without a proof, so the validator blocks it until a human (or a
fix) settles it.

Usage: python3 reconcile_exam.py STAGING_DIR EXAM_DIR OUT_DIR
"""
import json, os, sys, glob

stage, exam, out = sys.argv[1:4]
L = 'ABCDE'
tot = agree = 0
problems = []
for ef in sorted(glob.glob(os.path.join(exam, '*.json'))):
    e = json.load(open(ef))
    pid = e['passage']
    sp = os.path.join(stage, pid + '.json')
    if not os.path.exists(sp):
        continue
    d = json.load(open(sp))
    ans = {a['id']: a for a in e['answers']}
    for q in d['questions']:
        tot += 1
        a = ans.get(q['id'])
        if not a:
            problems.append(f"{q['id']}: no blind answer")
            continue
        k = L[q['key']]
        if a['answer'] == k:
            agree += 1
            q['proof'] = [dict({'paragraph': p['paragraph'], 'sentence': p['sentence'], 'quote': p['quote']},
                               **({'choice': L.index(p['choice'])} if p.get('choice') in list(L) and q['type'] == 'except' else {}))
                          for p in a['proof']]
        else:
            problems.append(f"{q['id']}: KEY {k} but blind {a['answer']} ({a.get('confidence')}) {a.get('note','')}")
        if a.get('alsoDefensible') or a.get('note'):
            problems.append(f"{q['id']}: flag alsoDefensible={a.get('alsoDefensible')} note={a.get('note')}")
    for f in e.get('facts', []):
        problems.append(f"{pid} FACT P{f['paragraph']} S{f['sentence']}: {f['claim']} -> {f['problem']}")
    json.dump(d, open(os.path.join(out, pid + '.json'), 'w'), indent=1, ensure_ascii=False)
print(f'{agree}/{tot} blind answers match the key')
for p in problems:
    print(' -', p)
