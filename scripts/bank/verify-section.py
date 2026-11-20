"""verify-section.py: checks every QR / OChem / Bio / RC explanation-standard rewrite in code.

  python3 scripts/bank/verify-section.py --section qr --public OUT.csv
  python3 scripts/bank/verify-section.py --section qr --private /home/claude OUT.csv

For every rewritten record (same checks as verify-rewrites.py for Gen Chem, plus calc):
  key        the sidecar key equals the bank key (a rewrite never changes the answer)
  arithmetic every "a op b = c" claim in the rewrite is recomputed; a miss is FLAGGED
  numbers    every number in the rewrite is in the item or comes out of a claim that recomputes
  calc       the record's own re-solve in Python: a number must match the keyed choice and no
             other choice (a second match is a two-answer item), True for an assertion, or the key
  key value  for a numeric key, the rewrite states the key's number in a step or the answer
The CSV holds ids, counts and flags only: no question text.
"""
import csv, glob, json, math, os, re, sys, warnings
from fractions import Fraction
warnings.filterwarnings('ignore')
import sympy as sp

L = 'ABCDE'
args = sys.argv[1:]
SECTION = args[args.index('--section') + 1]
PRIVATE = args[args.index('--private') + 1] if '--private' in args else None
OUT = args[-1]
NUMRE = re.compile(r'(?<![A-Za-z\d.])[-+−]?\d+(?:[.,]\d+)*(?:\.\d+)?')
def numbers(t):
    t = re.sub(r'(?<=\d)e[-+]?\d+', '', t or '')      # in 2.0e-14 the exponent belongs to the number
    return [m.group(0).replace('\u2212', '-').lstrip('+') for m in NUMRE.finditer(t)]
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
            fm = re.match(r'\s*([-+]?\d+)\s*/\s*(\d+)(?!\d|\.\d)', parts[i])
            if fm:
                rest = parts[i][fm.end():].lstrip()
                if not rest or not re.match(r'[-+*/(^]|\*\*', rest):
                    try: val = eval(ex, {'__builtins__': {}}, {})
                    except Exception: continue
                    yield ex, fm.group(1) + '/' + fm.group(2), float(val)
                continue
            rm = re.match(r'\s*([-+]?\d+(?:\.\d+)?(?:e[-+]?\d+)?)\s*(%|[-+*/(]|x\b)?', parts[i])
            if not rm or parts[i].lstrip().startswith('('): continue
            if rm.group(2) and rm.group(2) != '%': continue      # the right side keeps going: not a single number
            try: val = eval(ex.replace('e', 'e') , {'__builtins__': {}}, {})
            except Exception: continue
            shown = rm.group(1)
            if rm.group(2) == '%' and not re.search(r'\*\s*100\b', ex): val = val * 100
            yield ex, shown, float(val)
def close(shown, val):
    if '/' in shown:
        a, b = shown.split('/'); return float(b) != 0 and abs(float(a) / float(b) - val) <= 1e-9 * max(1, abs(val))
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


ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
def jsonl(f): return [json.loads(l) for l in open(f) if l.strip()]
bank = {}
if PRIVATE:
    B = os.path.join(PRIVATE, 'ace-bank-' + SECTION)
    for f in sorted(glob.glob(os.path.join(B, 'items', '*.jsonl'))):
        if 'passages' in f: continue
        for it in jsonl(f):
            if it.get('section') == SECTION and it.get('stem'):
                ex = it.get('explanation') or {}
                bank[it['id']] = {'key': it['answer'], 'choices': it['choices'], 'all': ' '.join([(it.get('image') or {}).get('alt', ''), it['stem'], ' '.join(it['choices']), ex.get('correct', ''), ex.get('fastest', ''), ' '.join((ex.get('wrong') or {}).values()), it.get('trick', '')])}
    side = json.load(open(os.path.join(B, 'explanations-standard.json')))
else:
    if SECTION == 'rc':
        for f in sorted(glob.glob(os.path.join(ROOT, 'tools/rc/data/passages/*.json'))):
            p = json.load(open(f))
            text = ' '.join(p.get('paragraphs') or []) if isinstance(p.get('paragraphs'), list) else ''
            for q in p['questions']:
                bank[q['id']] = {'key': L[q['key']], 'choices': q['choices'], 'all': ' '.join([text, q['stem'], ' '.join(q['choices']), q.get('why') or '', ' '.join(t for t in (q.get('distractorNotes') or []) if t)])}
    else:
        files = ['data/qr-climb.json', 'data/qr-dat.json'] if SECTION == 'qr' else ['data/%s.json' % SECTION]
        for f in files:
            for it in json.load(open(os.path.join(ROOT, f)))['items']:
                bank[it['id']] = {'key': L[it['answer']], 'choices': it['choices'], 'all': ' '.join([it['stem'], ' '.join(it['choices']), it['why']])}
    side = json.load(open(os.path.join(ROOT, 'scripts/bank/out/%s-explanations-standard.json' % SECTION)))

def choice_value(t):
    """the number a choice states, or None (expressions and words are not numbers)"""
    s = (t or '').strip().replace('−', '-').replace('×', 'x').replace(',', '')
    sign = 1
    m = re.match(r'^(up|increases?|rises?|down|decreases?|falls?)\s+(by\s+)?', s, re.I)
    if m: sign = -1 if re.match(r'down|decrease|fall', m.group(1), re.I) else 1; s = s[m.end():]
    if re.match(r'^no change', s, re.I): return 0.0
    s = re.sub(r'^[a-zA-Z]\s*=\s*', '', s)
    m2 = re.search(r'\s+(increase|decrease)$', s, re.I)
    if m2: sign = -1 if m2.group(1).lower() == 'decrease' else 1; s = s[:m2.start()]
    s = re.sub(r'\s*(percent|%)\s*$', '', s)
    s = re.sub(r'(\d(?:\.\d+)?)\s*x\s*10\^\s*\(?([-+]?\d+)\)?', r'(\1*10**(\2))', s)
    s = re.sub(r'^(-?\d+)\s+(\d+)/(\d+)', r'(\1+\2/\3)', s)          # mixed number 1 1/6
    if re.match(r'^[-\d(.]', s): s = re.sub(r'\s+(?:cm|mm|km|m|in|ft|mi|g|kg|mg|mL|L|h|s|min|hours?|minutes?|seconds?|days?|weeks?|years?|miles?|feet|inches|meters?|liters?|cups?|grams?|units?|people|students|mph|square|cubic|sq)\b.*$', '', s)
    s = s.replace('^', '**').replace('pi', '*pi').replace('sqrt', '*sqrt').replace('(*', '(').lstrip('*')
    s = re.sub(r'^\*', '', s.replace(' *', '*'))
    try:
        v = sp.sympify(s, locals={'pi': sp.pi, 'sqrt': sp.sqrt})
        if v.free_symbols: return None
        return sign * complex(sp.N(v)).real
    except Exception:
        return None
def near(a, b, rel=0.002):
    return abs(a - b) <= max(rel * abs(b), 1e-9)
ENV = {k: getattr(math, k) for k in dir(math) if not k.startswith('_')}
ENV.update(abs=abs, min=min, max=max, round=round, sum=sum, sorted=sorted, len=len, range=range, F=Fraction, Fraction=Fraction, sp=sp, math=math, comb=math.comb, perm=math.perm)
ENV['closest'] = lambda vals, x: 'ABCDE'[min(range(len(vals)), key=lambda i: abs(vals[i] - x))]
ENV['__builtins__'] = {}

rows, tot = [], {'items': 0, 'rewritten': 0, 'key_changed': 0, 'invented_numbers': 0, 'rewrite_claims': 0, 'rewrite_claim_flags': 0, 'calc': 0, 'calc_flags': 0, 'two_answer': 0, 'key_value_missing': 0}
recs = {r['id']: r for r in side['records']}
for iid, s in bank.items():
    r = recs.get(iid); tot['items'] += 1; flags = []; key_same = inv = kv = cs = ''; ncl = 0
    if r:
        key_same = 'yes' if r['key'] == s['key'] else 'NO'
        if key_same == 'NO': tot['key_changed'] += 1; flags.append('sidecar key differs from the bank key')
    if r and r['status'] == 'rewritten':
        tot['rewritten'] += 1
        e = r['explain']
        parts = [e['answer']] + e['steps'] + [t for t in e['traps'].values() if t] + [e['check']['q'], e['check'].get('a', '')]
        if e['trick'].get('draft'): parts.append(e['trick']['text'])
        have = set(numbers(norm(s['all']))) | set(numbers(s['all']))
        rtext = ' '.join(parts).replace('**', '').replace('^{', '^').replace('}', '')
        rcl = list(claims(rtext)); ncl = len(rcl)
        for c in rcl:
            if close(c[1], c[2]): have |= set(numbers(c[0])) | set(numbers(c[1])) | {c[1], c[1].lstrip('-')} | set(c[1].lstrip('-').split('/'))
            else: flags.append('REWRITE claims %s = %s, recomputed %.4g' % (c[0].strip(), c[1], c[2])); tot['rewrite_claim_flags'] += 1
        tot['rewrite_claims'] += len(rcl)
        calc_nums = set()
        if r.get('calc'):
            tot['calc'] += 1
            try:
                val = eval(r['calc'], dict(ENV))
                if isinstance(val, bool) or (hasattr(val, 'is_Boolean') and val.is_Boolean):
                    cs = 'pass' if bool(val) else 'FLAG'
                    if not bool(val): flags.append('calc assertion is False')
                elif isinstance(val, str):
                    cs = 'pass' if val in (s['key'], s['choices'][L.index(s['key'])]) else 'FLAG'
                    if cs == 'FLAG': flags.append('calc gives %r, key is %s' % (val, s['key']))
                else:
                    v = float(val); vals = [choice_value(c) for c in s['choices']]
                    kidx = L.index(s['key'])
                    rel = 1e-9 if vals[kidx] is not None and near(vals[kidx], v, 1e-9) else 0.002
                    hits = [L[i] for i, x in enumerate(vals) if x is not None and near(x, v, rel)]
                    if vals[kidx] is None: cs = 'FLAG'; flags.append('key choice is not a number; calc %.6g' % v)
                    elif s['key'] not in hits: cs = 'FLAG'; flags.append('calc %.6g does not match the key %r' % (v, s['choices'][kidx]))
                    elif len(hits) > 1: cs = 'TWO'; tot['two_answer'] += 1; flags.append('calc matches more than one choice: ' + ''.join(hits))
                    else: cs = 'pass'
                if cs != 'pass' and cs != 'TWO': tot['calc_flags'] += 1
            except Exception as ex:
                cs = 'error'; tot['calc_flags'] += 1; flags.append('calc did not run: %s' % ex)
        def canon(n):
            try: return '%.10g' % abs(float(n.replace(',', '')))
            except ValueError: return n
        haveC = {canon(h) for h in have}
        new = [n for n in numbers(norm(rtext)) if canon(n) not in haveC and n not in L]
        new = [n for n in new if not re.fullmatch(r'[-+]?\d', n)]
        inv = 'none' if not new else 'FLAG ' + ' '.join(new[:5])
        if new: tot['invented_numbers'] += 1; flags.append('number(s) not in the item: ' + ' '.join(new[:5]))
        k = s['choices'][L.index(s['key'])]
        if numbers(norm(k)) and re.match(r'^\s*[-+−]?\d', k):
            txt = ' '.join(e['steps'] + [e['answer']]).replace('**', '')
            kv = 'yes' if any(x in txt for x in numbers(k)[:1]) else 'MISSING'
            if kv == 'MISSING': tot['key_value_missing'] += 1
    rows.append([iid, r['status'] if r else 'not in sidecar', key_same, inv, ncl, cs, kv, (r or {}).get('flag') and 'SOURCE FLAG' or '', ' | '.join(flags)])
with open(OUT, 'w', newline='') as f:
    w = csv.writer(f); w.writerow(['id', 'status', 'key_unchanged', 'numbers_not_in_item', 'arithmetic_claims', 'calc', 'key_value_in_steps', 'source_flag', 'flags']); w.writerows(rows)
print(json.dumps(tot))
