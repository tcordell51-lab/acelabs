"""verify-rewrites.py: checks every explanation-standard rewrite against its bank item, in code.

  python3 scripts/bank/verify-rewrites.py --private /home/claude OUT.csv
  python3 scripts/bank/verify-rewrites.py --public OUT.csv

For every item (rewritten or not):
  key        the sidecar key equals the bank key (a rewrite never changes the answer)
  numbers    every number in the rewrite already appears in the item's own text (nothing invented);
             Thomas's recorded lines are skipped (they come from the playbook, not the item)
  arithmetic every "a op b = c" claim in the item's explanation is recomputed; a miss beyond
             rounding is FLAGGED (an existing explanation error), never changed
  calc       (private bank) the bank's own recompute expression, checks/batch-NN.calc.json, run again
             and compared with the key choice
  key value  for a numeric key, the rewrite states the key's number in a step
The CSV holds ids, counts and numbers only: no question text.
"""
import csv, glob, json, math, os, re, sys, warnings
warnings.filterwarnings('ignore')

L = 'ABCDE'
args = sys.argv[1:]
PRIVATE = args[args.index('--private') + 1] if '--private' in args else None
OUT = args[-1]

NUMRE = re.compile(r'(?<![A-Za-z\d.])[-+−]?\d+(?:[.,]\d+)*(?:\.\d+)?')
def numbers(t):
    return [m.group(0).replace('−', '-').lstrip('+') for m in NUMRE.finditer(t or '')]
def norm(t):
    t = (t or '').replace('−', '-').replace('×', '*').replace('÷', '/').replace(' ', ' ')
    t = re.sub(r'(\d(?:\.\d+)?)\s*[x*]\s*10\^\s*\(?([-+]?\d+)\)?', r'\1e\2', t)   # 2.0 x 10^-2 -> 2.0e-2
    t = re.sub(r'(?<=[\d)])\s+x\s+(?=[\d(])', ' * ', t)
    t = re.sub(r'(\d)\(', r'\1*(', t)
    t = t.replace('^', '**')
    t = re.sub(r'(?<=\d),(?=\d{3}\b)', '', t)          # 90,000 -> 90000
    t = re.sub(r'(\d)\s*percent\b', r'\1%', t)
    return t
EXPR = re.compile(r'[\d.()+\-*/ e]+$')
def claims(text):
    """yield (lhs, shown, value) for every a op b = c in the text"""
    for sent in re.split(r'(?<=[.;?!])\s+|,\s+(?=so\b)', norm(text)):
        parts = sent.split('=')
        for i in range(1, len(parts)):
            lhs = parts[i - 1]
            m = re.search(r'[\d.()+\-*/ e]+$', lhs)
            if not m: continue
            before = lhs[:m.start()].rstrip()
            # the expression must stand alone: not the tail of a formula (NH3 x 4) or a unit (L x (400/300))
            if before and not re.search(r'(^|[:;,=(])$', before): continue
            ex = re.sub(r'^[\s+*/)]*', '', m.group(0)).strip()
            if not ex or not re.search(r'\d\s*[-+*/]\s*[\d(]|\)\s*[-+*/]', ex) or ex.count('(') != ex.count(')'): continue
            if re.search(r'[a-df-zA-Z]', ex): continue
            rm = re.match(r'\s*([-+]?\d+(?:\.\d+)?(?:e[-+]?\d+)?)\s*(%|[-+*/(]|x\b)?', parts[i])
            if not rm or parts[i].lstrip().startswith('('): continue
            if rm.group(2) and rm.group(2) != '%': continue      # the right side keeps going: not a single number
            try: val = eval(ex.replace('e', 'e') , {'__builtins__': {}}, {})
            except Exception: continue
            shown = rm.group(1)
            if rm.group(2) == '%' and not re.search(r'\*\s*100\b', ex): val = val * 100
            yield ex, shown, float(val)
def close(shown, val):
    s = float(shown)
    dec = len(shown.split('e')[0].split('.')[1]) if '.' in shown.split('e')[0] else 0
    exp = int(shown.split('e')[1]) if 'e' in shown else 0
    half = 0.5 * 10 ** (exp - dec)
    return abs(s - val) <= max(half * 1.05, 0.021 * abs(val), 1e-12)

def first_num(t):
    t = norm(t)
    m = re.search(r'[-+]?\d[\d,]*\.?\d*(?:e[-+]?\d+)?', t)
    if not m: return None
    try: return float(m.group(0).replace(',', ''))
    except ValueError: return None

# ---- load
if PRIVATE:
    B = os.path.join(PRIVATE, 'ace-bank-gchem')
    bank = {}
    for f in sorted(glob.glob(os.path.join(B, 'items', '*.jsonl'))):
        for line in open(f):
            if line.strip():
                it = json.loads(line); bank[it['id']] = it
    calc = {}
    for f in sorted(glob.glob(os.path.join(B, 'checks', 'batch-*.calc.json'))): calc.update(json.load(open(f)))
    side = json.load(open(os.path.join(B, 'explanations-standard.json')))
    def src(it):
        ex = it.get('explanation') or {}
        return {'key': it['answer'], 'choices': it['choices'], 'expl': ' '.join([ex.get('correct', ''), ex.get('fastest', '')]),
                'all': ' '.join([it['stem'], ' '.join(it['choices']), ex.get('correct', ''), ex.get('fastest', ''), ' '.join((ex.get('wrong') or {}).values()), it.get('trick', '')])}
else:
    ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    bank = {it['id']: it for it in json.load(open(os.path.join(ROOT, 'data/gchem.json')))['items']}
    calc = {}
    side = json.load(open(os.path.join(ROOT, 'scripts/bank/out/gchem-explanations-standard.json')))
    def src(it):
        return {'key': L[it['answer']], 'choices': it['choices'], 'expl': it['why'] + ' ' + ' '.join(it.get('steps') or []),
                'all': ' '.join([it['stem'], ' '.join(it['choices']), it['why'], ' '.join(it.get('steps') or []), ' '.join(t for t in (it.get('traps') or []) if t), it.get('trick', '')])}

ENV = {k: getattr(math, k) for k in dir(math) if not k.startswith('_')}
ENV.update(abs=abs, min=min, max=max, round=round, sum=sum)
rows, tot = [], {'items': 0, 'rewritten': 0, 'key_changed': 0, 'invented_numbers': 0, 'claims': 0, 'claim_flags': 0, 'calc': 0, 'calc_flags': 0, 'key_value_missing': 0}
recs = {r['id']: r for r in side['records']}
for iid, it in bank.items():
    s = src(it); r = recs.get(iid); tot['items'] += 1
    flags = []
    # existing explanation: arithmetic claims
    cl = list(claims(s['expl'])); bad = [c for c in cl if not close(c[1], c[2])]
    tot['claims'] += len(cl); tot['claim_flags'] += len(bad)
    for c in bad: flags.append('explanation claims %s = %s, recomputed %.4g' % (c[0].strip(), c[1], c[2]))
    # bank recompute expression
    cs = ''
    if iid in calc:
        tot['calc'] += 1
        try:
            val = float(eval(calc[iid]['expr'], {'__builtins__': {}}, ENV)); key = s['choices'][L.index(s['key'])]; k = first_num(key)
            ok = k is not None and abs(k - val) <= calc[iid].get('tol', 0.02) * abs(val)
            cs = 'pass' if ok else 'FLAG'
            if not ok: tot['calc_flags'] += 1; flags.append('recompute %.4g does not match the key %r' % (val, key))
        except Exception as e:
            cs = 'error'; flags.append('recompute did not run: %s' % e)
    key_same = inv = kv = ''
    if r:
        key_same = 'yes' if r['key'] == s['key'] else 'NO'
        if key_same == 'NO': tot['key_changed'] += 1; flags.append('sidecar key differs from the bank key')
        if r['status'] == 'rewritten':
            tot['rewritten'] += 1
            e = r['explain']
            parts = [e['answer']] + e['steps'] + [t for t in e['traps'].values() if t] + [e['check']['q'], e['check'].get('a', '')]
            if e['trick'].get('draft'): parts.append(e['trick']['text'])
            have = set(numbers(norm(s['all']))) | set(numbers(s['all']))
            # new wording may add a number only through arithmetic that recomputes
            rtext = ' '.join(parts).replace('**', '').replace('^{', '^').replace('}', '')
            rcl = list(claims(rtext))
            for c in rcl:
                if close(c[1], c[2]): have |= set(numbers(c[0])) | set(numbers(c[1])) | {c[1], c[1].lstrip('-')}
                else: flags.append('REWRITE claims %s = %s, recomputed %.4g' % (c[0].strip(), c[1], c[2])); tot['rewrite_claim_flags'] = tot.get('rewrite_claim_flags', 0) + 1
            tot['rewrite_claims'] = tot.get('rewrite_claims', 0) + len(rcl)
            new = [n for n in numbers(' '.join(parts).replace('**', '').replace('^{', '^').replace('}', '')) if n not in have and n.lstrip('-') not in have and n not in L]
            # numbers that are only a list index or step count are not claims; letters A-E are choice names
            new = [n for n in new if not re.fullmatch(r'[-+]?\d', n)]   # single digits: counts, charges, oxidation numbers
            inv = 'none' if not new else 'FLAG ' + ' '.join(new[:5])
            if new: tot['invented_numbers'] += 1; flags.append('number(s) not in the item: ' + ' '.join(new[:5]))
            k = s['choices'][L.index(s['key'])]; kn = numbers(norm(k))
            if kn and re.match(r'^\s*[-+−]?\d', k):
                txt = ' '.join(e['steps'] + [e['answer']]).replace('**', '')
                kv = 'yes' if any(x in txt for x in numbers(k)[:1]) else 'MISSING'
                if kv == 'MISSING': tot['key_value_missing'] += 1
    rows.append([iid, r['status'] if r else 'not in sidecar', key_same, inv, len(cl), len(bad), cs, kv, ' | '.join(flags)])
with open(OUT, 'w', newline='') as f:
    w = csv.writer(f); w.writerow(['id', 'status', 'key_unchanged', 'numbers_not_in_item', 'arithmetic_claims', 'claims_off', 'bank_recompute', 'key_value_in_steps', 'flags']); w.writerows(rows)
print(json.dumps(tot))
