"""Compare a blind exam file with the stored keys. Usage: compare_exam.py passage.json exam.json"""
import json, sys
d = json.load(open(sys.argv[1])); e = json.load(open(sys.argv[2]))
ans = {a['id']: a for a in e['answers']}
mism = [(q['id'], 'ABCDE'[q['key']], ans[q['id']]['answer']) for q in d['questions'] if 'ABCDE'[q['key']] != ans[q['id']]['answer']]
flags = [(a['id'], a['alsoDefensible'], a['note']) for a in e['answers'] if a.get('alsoDefensible')]
print(f"{d['id']}: {len(d['questions']) - len(mism)}/{len(d['questions'])} match; mismatches {mism}; two-answer flags {flags}; facts {len(e.get('facts', []))}")
