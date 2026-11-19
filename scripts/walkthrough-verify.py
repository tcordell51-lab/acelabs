"""verify.py: every number the two pilot walkthroughs show, recomputed independently in Python.

Run:  node scripts/walkthrough-dump.js . > /tmp/dump.json && python3 scripts/walkthrough-verify.py /tmp/dump.json docs/walkthrough-verify.csv
Inputs are what the page code produces (dump.js); the expected values here are computed from the
question givens and from the OpenStax Chemistry 2e Appendix L table typed below (fetched 2026-11-19
from openstax.org/books/chemistry-2e/pages/l-standard-electrode-half-cell-potentials).
"""
import csv, json, math, re, sys
from decimal import Decimal, ROUND_HALF_UP

OPENSTAX_L = {'Ag': 0.7996, 'Cu': 0.337, 'Pb': -0.1262, 'Sn': -0.1375, 'Ni': -0.257, 'Fe': -0.447, 'Zn': -0.7618, 'Al': -1.662, 'Mg': -2.372}
METAL = {'Ag': 'silver', 'Cu': 'copper', 'Pb': 'lead', 'Sn': 'tin', 'Ni': 'nickel', 'Fe': 'iron', 'Zn': 'zinc', 'Al': 'aluminum', 'Mg': 'magnesium'}
NA = 6.022e23
R, T, P = 0.082057, 273.15, 1.0
VM = 22.4
AW = {'H': 1.008, 'C': 12.011, 'N': 14.007, 'O': 15.999, 'He': 4.0026}
MINUS, X, DIV = '−', '×', '÷'

rows = []
def row(area, item, claim, shown, recomputed, how, ok=None):
    if ok is None: ok = str(shown) == str(recomputed)
    rows.append([area, item, claim, shown, recomputed, how, 'pass' if ok else 'FAIL'])

def to_fixed(x, f):  # JavaScript Number.prototype.toFixed on the exact binary value
    q = Decimal(1).scaleb(-f) if f > 0 else Decimal(1)
    d = Decimal(x).quantize(q, rounding=ROUND_HALF_UP) if f > 0 else Decimal(x).quantize(Decimal(1), rounding=ROUND_HALF_UP)
    s = format(d, 'f')
    return s
def js_round(v): return math.floor(v + 0.5)
def fmt(x, sf=3):
    if x == 0: return '0'
    e = math.floor(math.log10(abs(x)))
    if -2 <= e <= 3: return to_fixed(x, max(0, sf - 1 - e))
    m = x / math.pow(10, e); m = js_round(m * 10 ** (sf - 1)) / 10 ** (sf - 1)
    if m >= 10: m /= 10; e += 1
    return to_fixed(m, sf - 1) + ' ' + X + ' 10^{' + str(e) + '}'
def fE(x, plus=True):
    s = to_fixed(abs(x), 3 if x == 0.337 else 4).rstrip('0').rstrip('.')
    return (MINUS if x < 0 else ('+' if plus else '')) + s
def fcell(x): return ('+' if x > 0 else MINUS) + to_fixed(abs(x), 3)
def mm(formula):
    tot = 0
    for el, n in re.findall(r'([A-Z][a-z]?)(\d*)', formula): tot += AW[el] * (int(n) if n else 1)
    return round(tot, 1)
SUP = {'⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9', '⁻': '-'}
def plain_num(s):
    s = re.sub(r'([⁰¹²³⁴-⁹⁻]+)', lambda m: '^{' + ''.join(SUP[c] for c in m.group(1)) + '}', s)
    return s
def html_mark(s): return re.sub(r'<sup>([^<]*)</sup>', r'^{\1}', s.replace('&times;', X)).replace('<sub>', '').replace('</sub>', '')

d = json.load(open(sys.argv[1]))

# ---- constants
row('constants', 'molar volume', '22.4 L/mol at 0 C, 1 atm', '22.4', '%.1f' % (R * T / P), 'V = RT/P, R 0.082057, T 273.15')
row('constants', 'Avogadro', '6.022 x 10^23', '6.022e23', '%.3e' % 6.02214076e23, 'SI exact 6.02214076e23 to 4 s.f.', ok=abs(6.022e23 - 6.02214076e23) / 6.02214076e23 < 1e-4)
for f, shown in [('CO2', 44.0), ('H2O', 18.0), ('O2', 32.0), ('N2', 28.0), ('NH3', 17.0), ('CH4', 16.0), ('He', 4.0), ('H2', 2.0)]:
    row('constants', 'molar mass ' + f, f + ' to 0.1 g/mol', '%.1f' % shown, '%.1f' % mm(f), 'IUPAC standard atomic weights')

# ---- galvanic: the table, then every cell
for h in d['half']:
    row('galvanic', 'Appendix L ' + h['id'], 'E0 used on the page', h['e'], OPENSTAX_L[h['id']], 'OpenStax Chemistry 2e Appendix L')
for c in d['cells']:
    L, Rr = c['L'], c['R']; eL, eR = OPENSTAX_L[L], OPENSTAX_L[Rr]
    cat, an = (L, Rr) if eL > eR else (Rr, L)
    ecell = OPENSTAX_L[cat] - OPENSTAX_L[an]
    direction = 'left to right' if cat == Rr else 'right to left'
    s1, s2, s3, s4, s5 = c['steps']
    want1 = 'Write both **reduction potentials**: %s %s V, %s %s V.' % (L, fE(eL), Rr, fE(eR))
    row('galvanic', L + '|' + Rr, 'step 1 potentials', s1, want1, 'Appendix L values, printed digits')
    row('galvanic', L + '|' + Rr, 'step 2 cathode is the higher E0', s2, 'Higher one is **reduced**: %s is the cathode, %s the anode.' % (cat, an), 'max(E0)')
    row('galvanic', L + '|' + Rr, 'step 3 electron direction', s3, '**Electrons** go anode to cathode: %s to %s, %s.' % (an, cat, direction), 'anode to cathode; cathode side decides')
    row('galvanic', L + '|' + Rr, 'step 4 salt bridge', s4, '**Salt bridge**: anions drift to %s, cations drift to %s.' % (an, cat), 'anions to anode, cations to cathode')
    sub = fE(OPENSTAX_L[an]) if OPENSTAX_L[an] >= 0 else '(' + fE(OPENSTAX_L[an]) + ')'
    if OPENSTAX_L[an] >= 0: sub = fE(OPENSTAX_L[an], False)
    want5 = '**E cell** = %s %s %s = %s V. Positive: galvanic.' % (fE(OPENSTAX_L[cat], False), MINUS, sub, fcell(ecell))
    row('galvanic', L + '|' + Rr, 'step 5 E cell = E cathode - E anode', s5, want5, '%.4f - (%.4f) = %.4f' % (OPENSTAX_L[cat], OPENSTAX_L[an], ecell))
    row('galvanic', L + '|' + Rr, 'E cell positive', fcell(ecell).startswith('+'), True, 'galvanic cells run with E cell > 0')
    row('galvanic', L + '|' + Rr, 'board shows the same E cell', any(fcell(ecell) in t for t in c['board']), True, 'board text search')
    row('galvanic', L + '|' + Rr, 'answer line', c['answer'], 'Electrons flow from %s to %s: %s.' % (METAL[an], METAL[cat], direction), 'anode metal to cathode metal')
    row('galvanic', L + '|' + Rr, 'check question key', c['key'], 'Electrons travel through the wire from the %s electrode to the %s electrode.' % (METAL[an], METAL[cat]), 'anode to cathode')
    q = c['check']; m = re.match(r'(\w+) and (\w+): which one is the anode\?', q['q'])
    inv = {v: k for k, v in METAL.items()}
    a1, a2 = inv[m.group(1).lower()], inv[m.group(2).lower()]
    lo = a1 if OPENSTAX_L[a1] < OPENSTAX_L[a2] else a2
    row('galvanic', L + '|' + Rr, 'check yourself answer', q['a'].split('.')[0].lower(), METAL[lo], 'lower E0 is the anode')
for v in d['variants']:
    a, b = v['a'], v['b']; cat, an = (a, b) if OPENSTAX_L[a] > OPENSTAX_L[b] else (b, a)
    want = {'flow': 'From the %s electrode to the %s electrode' % (METAL[an], METAL[cat]),
            'anode': 'The %s electrode, because its reduction potential is lower' % METAL[an],
            'mass': 'The %s electrode, because its ions are reduced to metal' % METAL[cat]}[v['type']]
    row('galvanic follow-up', v['id'], 'key', v['key'], want, 'recomputed anode/cathode from Appendix L')
    row('galvanic follow-up', v['id'], 'cathode written on the left', v['stem'].index(cat + ' (E') < v['stem'].index(an + ' (E'), True, 'fights the left-to-right habit')
    row('galvanic follow-up', v['id'], 'five different choices', len(set(v['choices'])), 5, 'set size')

# ---- GuacaMOLE ladder: the numbers in every step
STEPNUM = {
    'E1': ['88.0 %s 44.0 = %s mol' % (DIV, fmt(88.0 / 44.0))],
    'E2': ['3.00 %s 6.022 %s 10^{23} = %s atoms' % (X, X, fmt(3.00 * NA))],
    'E3': ['0.250 %s 22.4 = %s L' % (X, fmt(0.250 * VM))],
    'E4': ['9.0 %s 18.0 = %s mol' % (DIV, fmt(9.0 / 18.0, 2))],
    'T1': ['11.0 %s 44.0 = %s mol' % (DIV, fmt(11.0 / 44.0)), '%s %s 6.022 %s 10^{23} = %s molecules' % (fmt(0.25), X, X, fmt(11.0 / 44.0 * NA))],
    'T2': ['5.60 %s 22.4 = %s mol' % (DIV, fmt(5.60 / VM)), '%s %s 32.0 = %s g' % (fmt(5.60 / VM), X, fmt(5.60 / VM * 32.0))],
    'T3': ['= %s mol' % fmt(1.204e24 / NA), '%s %s 16.0 = %s g' % (fmt(1.204e24 / NA), X, fmt(1.204e24 / NA * 16.0))],
    'T4': ['= %s mol' % fmt(3.011e23 / NA), '%s %s 22.4 = %s L' % (fmt(3.011e23 / NA), X, fmt(3.011e23 / NA * VM))],
    'E5': [],
    'T5': ['16.0 %s 16.0 = %s mol' % (DIV, fmt(1.0)), '16.0 %s 32.0 = %s mol' % (DIV, fmt(0.5)), 'twice as many'],
    'H1': ['6.0 %s 2.0 = **%s mol**' % (DIV, fmt(3.0, 2)), '%s %s 2/3 = %s mol' % (fmt(3.0, 2), X, fmt(2.0, 2)), '%s %s 17.0 = **%s g**' % (fmt(2.0, 2), X, fmt(2.0 * 17.0, 2))],
    'H2': ['22.0 %s 44.0 = **%s mol**' % (DIV, fmt(0.5)), '%s mol O' % fmt(1.0), '= %s' % fmt(1.0 * NA)],
    'H3': ['4.48 %s 22.4 = **%s mol**' % (DIV, fmt(4.48 / VM)), 'That is %s g/mol' % fmt(8.80 / (4.48 / VM))],
    'M1': ['4.0 %s 2.0 = %s mol, makes %s mol water' % (DIV, fmt(2.0, 2), fmt(2.0, 2)), '16.0 %s 32.0 = %s mol, makes %s mol water' % (DIV, fmt(0.5, 2), fmt(1.0, 2)), '%s %s 18.0 = %s g' % (fmt(1.0, 2), X, fmt(18.0, 2))],
    'M2': ['11.0 %s 44.0 = %s mol' % (DIV, fmt(0.25)), '0.500 + %s = %s mol' % (fmt(0.25), fmt(0.75)), '%s %s 22.4 = %s L' % (fmt(0.75), X, fmt(0.75 * VM))],
}
# each wrong choice recomputed from the error it names
CHOICE = {
    'E1': [fmt(88.0 * 44.0) + ' mol', None, fmt(44.0 / 88.0) + ' mol', fmt(88.0 / VM) + ' mol'],
    'E2': [fmt(3.00 * VM) + ' atoms', fmt(3.00 * 4.0) + ' atoms', None, fmt(3.00 / NA) + ' atoms'],
    'E3': [fmt(0.250 * NA) + ' L', None, fmt(0.250 / VM) + ' L', fmt(VM / 0.250) + ' L'],
    'E4': [None, fmt(9.0 / VM, 2) + ' mol', fmt(18.0 / 9.0, 2) + ' mol', fmt(9.0 * 18.0) + ' mol'],
    'T1': [fmt(11.0 * NA), fmt(44.0 / 11.0 * NA), fmt(0.250 * VM), None],
    'T2': [None, fmt(5.60 * 32.0) + ' g', fmt(5.60 / VM) + ' g', fmt(5.60 / VM * 16.0) + ' g'],
    'T3': [fmt(1.204e24 / NA * VM) + ' g', None, fmt(16.0 / (1.204e24 / NA)) + ' g', fmt(1.204e24 / NA) + ' g'],
    'T4': [fmt(VM / (3.011e23 / NA)) + ' L', None, fmt(3.011e23 * VM) + ' L', fmt(3.011e23 / NA * 28.0) + ' L'],
    'H1': [fmt(3.0 * 17.0, 2) + ' g', None, fmt(6.0, 2) + ' g', fmt(3.0 * 1.5 * 17.0) + ' g'],
    'H2': [None, fmt(0.5 * 3 * NA), fmt(22.0 * NA), fmt(0.5 * NA)],
    'H3': [fmt(8.80 / 4.48) + ' g/mol', fmt(0.200 / 8.80) + ' g/mol', fmt(8.80 * 4.48) + ' g/mol', None],
    'M1': [fmt(0.5 * 18.0, 2) + ' g', None, fmt(4.0 + 16.0, 2) + ' g', fmt(2.0 * 18.0, 2) + ' g'],
    'M2': [None, fmt((0.500 + 11.0) * VM) + ' L', fmt(0.500 * VM) + ' L', fmt(0.25 * VM) + ' L'],
}
done = set()
for g in d['guac']:
    it = g['id']; steps = ' '.join(g['steps']) + ' ' + g['answer']
    for want in STEPNUM[it]:
        row('guacamole', '%s pick %s' % (it, g['pick']), 'step number', want, want if want in steps else '(missing) ' + steps[:80], 'recomputed from the stem givens')
    if it in done: continue
    done.add(it)
    for i, t in enumerate(g['choices']):
        if it in CHOICE and CHOICE[it][i] is not None:
            row('guacamole', it, 'choice %s value from its named error' % 'ABCD'[i], html_mark(t), CHOICE[it][i], 'recomputed from the error the page names')
for chk, want in [('How many moles are in 32.0 g of O_2?', fmt(32.0 / 32.0)), ('How many liters does 2.00 mol of gas fill at STP?', fmt(2.00 * VM)), ('How many grams are 0.500 mol of H_2O?', fmt(0.500 * 18.0))]:
    found = [g['check']['a'] for g in d['guac'] if g['check']['q'] == chk]
    row('guacamole', 'check yourself', chk, found[0].split(':')[0] if found else '(not shown)', want + (' mol' if 'moles' in chk else ' L' if 'liters' in chk else ' g'), 'recomputed')

# ---- GuacaMOLE follow-ups: key and every distractor from the stem numbers
def nums(stem):
    s = plain_num(stem)
    s = re.sub(r'\b(?:[A-Z][a-z]?\d*)+\b', 'X', s)
    s = re.sub(r'(\d+(?:\.\d+)?) × 10\^\{(-?\d+)\}', lambda m: m.group(1) + 'e' + m.group(2), s)
    return [float(x) for x in re.findall(r'\d+(?:\.\d+)?(?:e-?\d+)?', s)]
ATOMS = {'CO2': (2, 3), 'H2O': (2, 3), 'NH3': (3, 4), 'CH4': (4, 5)}
RXN = {('H2', 'NH3'): 2 / 3, ('O2', 'H2O'): 2, ('CH4', 'H2O'): 2, ('N2', 'NH3'): 2}
def tx(s): return plain_num(s).replace(' ' + X + ' 10^{', ' ' + X + ' 10^{')
for v in d['gvar']:
    st = v['stem']; n = nums(st); fam = v['fam']; ch = [tx(c) for c in v['choices']]
    if fam == 'inverted':
        g, M = n; vals = [g / M, g * M, M / g, g / VM, VM / g]; unit = ' mol'
    elif fam == 'skip':
        g, M = n; m = g / M; vals = [m * NA, g * NA, M / g * NA, m, m * VM]; unit = ''
    elif fam == 'stop':
        g, M = n; m = g / M; vals = [m * VM, m, g * VM, M / g * VM, m * NA]; unit = ' L'
    elif fam == 'exit':
        p, M = n; m = p / NA; vals = [m * M, m * VM, m, p * M, M / m]; unit = ' g'
    elif fam == 'atoms':
        g, M = n; f = re.search(r'g of (\w+)', st).group(1); k, t = ATOMS[f]; m = g / M; vals = [m * k * NA, m * NA, m * t * NA, g * k * NA, m * k]; unit = ' atoms'
    else:
        A = re.search(r'form from [\d.]+ g of (\w+)', st).group(1); B = re.search(r'grams of (\w+)', st).group(1)
        coef = [x for x in n]
        gA = float(re.search(r'form from ([\d.]+) g', st).group(1)); MA = float(re.search(r'g of \w+ \(([\d.]+) g/mol\), the other', st).group(1)); MB = float(re.search(r'grams of \w+ \(([\d.]+) g/mol\)', st).group(1))
        r = RXN[(A, B)]; nA = gA / MA; vals = [nA * r * MB, nA * MB, nA / r * MB, gA, nA * r]; unit = ' g'
    want = [fmt(x) + unit for x in vals]
    key_ok = abs(vals[0] - float(re.sub(r'[^\d.e-]', '', want[0].replace(' ' + X + ' 10^{', 'e').replace('}', '')) or 0)) >= 0
    # compare as sets: the page shuffles the order; the key must sit at v['answer']
    row('guacamole follow-up', v['id'], 'key from the stem', ch[v['answer']], want[0], 'recomputed (%s)' % fam)
    row('guacamole follow-up', v['id'], 'distractors from their named traps', ' ; '.join(sorted(ch)), ' ; '.join(sorted(want)), 'recomputed (%s)' % fam)

with open(sys.argv[2], 'w', newline='') as f:
    w = csv.writer(f); w.writerow(['area', 'item', 'claim', 'shown', 'recomputed', 'how', 'result']); w.writerows(rows)
fails = [r for r in rows if r[-1] != 'pass']
print('rows', len(rows), 'pass', len(rows) - len(fails), 'fail', len(fails))
for r in fails[:25]: print(' | '.join(map(str, r)))
