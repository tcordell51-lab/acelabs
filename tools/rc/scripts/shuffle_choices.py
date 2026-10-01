"""Re-order answer choices so keys do not follow a rotation (a pattern a student can
exploit). Seeded and deterministic. Moves each choice together with its distractor
note, and remaps proof-line choice indexes. Choices that are naturally ordered (all
"Paragraph N", or all numbers) are sorted ascending instead of shuffled.
Explanations must not mention answer letters (the validator checks this).

Usage: python3 shuffle_choices.py passage.json [seed]
"""
import json, random, re, sys

L = 'ABCDE'
f = sys.argv[1]
seed = sys.argv[2] if len(sys.argv) > 2 else 'acelabs-rc'
d = json.load(open(f))
rng = random.Random(seed + d['id'])
n = len(d['questions'])


def periodic(keys):
    for per in range(2, 7):
        m = sum(keys[i] == keys[i + per] for i in range(n - per)) / max(1, n - per)
        if m >= 0.45:
            return True
    return any(keys[i] == keys[i + 1] == keys[i + 2] for i in range(n - 2))


def natural(choices):
    if all(re.fullmatch(r'Paragraphs? [\d ,and]+', c) for c in choices):
        return lambda c: int(re.findall(r'\d+', c)[0])
    if all(re.fullmatch(r'[\d,.]+', c) for c in choices):
        return lambda c: float(c.replace(',', ''))
    return None


for _ in range(500):
    pool = [i % 5 for i in range(n)]
    rng.shuffle(pool)
    if not periodic(pool):
        break

keys = []
for q, target in zip(d['questions'], pool):
    order = list(range(5))
    nat = natural(q['choices'])
    if nat:
        order.sort(key=lambda i: nat(q['choices'][i]))
    else:
        others = [i for i in range(5) if i != q['key']]
        rng.shuffle(others)
        others.insert(target, q['key'])
        order = others
    q['choices'] = [q['choices'][i] for i in order]
    q['distractorNotes'] = [q['distractorNotes'][i] for i in order]
    for pr in q['proof']:
        if 'choice' in pr:
            pr['choice'] = order.index(pr['choice'])
    q['key'] = order.index(q['key'])
    keys.append(q['key'])
json.dump(d, open(f, 'w'), indent=1, ensure_ascii=False)
print(d['id'], ''.join(L[k] for k in keys))
