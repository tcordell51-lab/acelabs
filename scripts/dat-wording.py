#!/usr/bin/env python3
"""Rewrite practice stems written as bare math into DAT wording, and check every key it touches.

    python3 scripts/dat-wording.py            dry run: counts, samples, key check
    python3 scripts/dat-wording.py --write    rewrite the files

Only the wording changes ("5/8 = ?" becomes "What is 5/8 written as a decimal?"). Choices,
keys and explanations are untouched. For every rewritten item the expression is evaluated
independently (exact fractions; linear equations solved exactly) and compared with the keyed
choice. Results go to scripts/dat-wording-report.json: verified, mismatch (for Thomas to
review, never auto-fixed), and not computable.
"""
import ast
import json
import math
import os
import re
import sys
from fractions import Fraction

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FILES = ['shared/dat-mock-tests.js', 'games/qr.json', 'tools/qr/index.html', 'tools/minitests/source/minitest-source.json']
WRITE = '--write' in sys.argv
SUP = {'²': '**2', '³': '**3', '⁴': '**4', '⁵': '**5', '⁶': '**6', '⁷': '**7', '⁸': '**8', '⁹': '**9', '⁰': '**0', '¹': '**1'}


# Word stems and two-equal-choice items, rewritten and checked by hand (2026-11-16). The key is unchanged.
MANUAL = {
    'Circle of area 49π. Radius = ?': 'A circle has an area of 49π square units. What is its radius?',
    'Mix 4 lbs of $3/lb candy with x lbs of $5/lb candy to get $4/lb mix. x = ?': 'A store mixes 4 pounds of candy that costs $3 per pound with x pounds of candy that costs $5 per pound. The mixture costs $4 per pound. What is x?',
    'pH = 8 means [H⁺] = ?': 'A solution has a pH of 8. What is its hydrogen ion concentration, [H⁺], in mol/L?',
    'Circle with radius 6. Area = ?': 'A circle has a radius of 6 units. What is its area?',
    'Square with perimeter 24. Area = ?': 'A square has a perimeter of 24 units. What is its area?',
    'Triangle with base 10 and height 7. Area = ?': 'A triangle has a base of 10 units and a height of 7 units. What is its area?',
    'Circle has diameter 10. Circumference = ?': 'A circle has a diameter of 10 units. What is its circumference?',
    'Rectangle 8 by 5. Area = ?': 'A rectangle measures 8 units by 5 units. What is its area?',
    'Triangle: base 12, area 30. Height = ?': 'A triangle has a base of 12 units and an area of 30 square units. What is its height?',
    "Square inscribed in a circle of radius 5. Square's diagonal = ?": "A square is inscribed in a circle of radius 5 units. What is the length of the square's diagonal?",
    '|A only| = 12, |B only| = 8, |A ∩ B| = 5. |A ∪ B| = ?': 'In a survey, 12 people chose only A, 8 chose only B, and 5 chose both A and B. How many people chose A, B, or both?',
    'Mean of [4, 6, 8, 10, 12] = ?': 'What is the mean of the data set 4, 6, 8, 10, 12?',
    'Median of [3, 7, 8, 5, 9] = ?': 'What is the median of the data set 3, 7, 8, 5, 9?',
    'Mode of [2, 5, 5, 7, 7, 7, 9] = ?': 'What is the mode of the data set 2, 5, 5, 7, 7, 7, 9?',
    'Dataset [2, 4, 6]. Mean is 4. σ = ?': 'The data set 2, 4, 6 has a mean of 4. What is its population standard deviation?',
    'Mean of [10, 20, 30, 40] = ?': 'What is the mean of the data set 10, 20, 30, 40?',
    'Median of [1, 3, 5, 7, 9, 11] = ?': 'What is the median of the data set 1, 3, 5, 7, 9, 11?',
    'Variance of [3, 3, 3, 3] = ?': 'What is the variance of the data set 3, 3, 3, 3?',
    '(3²)⁴ = ?': 'Which of the following is equivalent to (3²)⁴, written as a single power of 3?',
    '3/3 · 5/5 = ?': 'What is the value of 3/3 · 5/5, written in simplest form?',
    # two choices were equal (8/12 keyed, 2/3 also offered): the wording now asks for twelfths. Listed for Thomas.
    '5/12 + 1/4 = ?': 'What is 5/12 + 1/4, written with a denominator of 12?',
}

DEC = re.compile(r'^-?\d*\.\d+$|^-?\d+$')


def kind_of_opts(opts):
    s = [str(o).strip() for o in opts]
    if all(re.fullmatch(r'-?\d*\.\d+|-?\d+', o) for o in s) and any('.' in o for o in s):
        return 'decimal'
    if all(o.endswith('%') for o in s):
        return 'percent'
    if all(re.fullmatch(r'-?\d+\s*/\s*\d+|-?\d+(\s+\d+/\d+)?', o) for o in s):
        return 'fraction'
    return 'other'


def reword(q, opts):
    t = q.strip()
    m = re.match(r'^(Simplify|Evaluate|Compute|Calculate)\s*:\s*(.+?)\.?\s*$', t, re.I)
    if m:
        verb, e = m.group(1).lower(), m.group(2).strip()
        return ('Which of the following is equivalent to %s?' % e) if verb == 'simplify' else ('What is the value of %s?' % e), e, None
    m = re.match(r'^Solve(?:\s+for\s+([a-z]))?\s*:\s*(.+?)\.?\s*$', t, re.I)
    if m and re.search(r'[<>≤≥]', m.group(2)):
        ineq = m.group(2).strip()
        var = m.group(1) or (re.findall(r'(?<![a-z])([a-z])(?![a-z])', ineq) or ['x'])[0]
        return 'Which of the following gives every value of %s that satisfies %s?' % (var, ineq), ineq, 'ineq'
    if m and '=' in m.group(2) and '|' in m.group(2):
        eq = m.group(2).strip()
        var = m.group(1) or (re.findall(r'(?<![a-z])([a-z])(?![a-z])', eq) or ['x'])[0]
        return 'If %s, what are the possible values of %s?' % (eq, var), eq, 'abs'
    if m and '=' in m.group(2):
        eq = m.group(2).strip()
        var = m.group(1) or (re.findall(r'(?<![a-z])([a-z])(?![a-z])', eq) or ['x'])[0]
        return 'If %s, what is the value of %s?' % (eq, var), eq, var
    m = re.match(r'^(.+?)\s*=\s*\?\s*$', t)
    if m:
        e = m.group(1).strip()
        k = kind_of_opts(opts)
        if re.fullmatch(r'[\d.]+\s*%\s*of\s*[\d.,]+', e):
            return 'What is %s?' % e, e, None
        if re.fullmatch(r'\d+\s*/\s*\d+', e) and k == 'decimal':
            return 'What is %s written as a decimal?' % e, e, None
        if re.fullmatch(r'\d+\s*/\s*\d+', e) and k == 'percent':
            return 'What is %s written as a percent?' % e, e, None
        if re.fullmatch(r'\d*\.\d+', e) and k == 'fraction':
            return 'What is %s written as a fraction in lowest terms?' % e, e, None
        if re.fullmatch(r'[\d.]+\s*%', e) and k == 'decimal':
            return 'What is %s written as a decimal?' % e, e, None
        if re.fullmatch(r'[\d.]+\s*%', e) and k == 'fraction':
            return 'What is %s written as a fraction in lowest terms?' % e, e, None
        if re.search(r'[a-df-z]', re.sub(r'sqrt|log|of|abs', '', e)) and not re.search(r'[A-Za-z]{3,}', re.sub(r'sqrt|log|of|abs', '', e)):
            return 'Which of the following is equivalent to %s?' % e, e, 'expr'
        if re.search(r'[A-Za-z]{3,}', re.sub(r'sqrt|log|of|abs', '', e)):
            return None   # a word stem such as "Circle of area 49π. Radius = ?": left for a human rewrite (listed in the report)
        return 'What is the value of %s?' % e, e, None
    return None


def to_py(e):
    e = re.sub(r'(?<=\d),(?=\d{3}\b)', '', e.strip())          # thousands separators only
    e = re.sub(r'(?<![\d./])(\d+)\s+(\d+)\s*/\s*(\d+)(?![\d.])', r'(\1+\2/\3)', e)   # mixed numbers: 4 1/2
    e = re.sub(r'(?<![\d.+])(\d+)\s*/\s*(\d+)(?![\d.])', r'(\1/\2)', e)     # a written fraction is one number: 1/5 ÷ 4/7 = (1/5)/(4/7)
    e = re.sub(r'\|([^|]+)\|', r'abs(\1)', e)
    e = re.sub(r'log_?(\d+)\s*\(([^)]+)\)', r'logb(\2,\1)', e)
    e = re.sub(r'\blog\s*\(', 'logb10(', e)
    s = e.replace('×', '*').replace('·', '*').replace('÷', '/').replace('−', '-').replace('–', '-').replace('^', '**')
    for k, v in SUP.items():
        s = s.replace(k, v)
    s = re.sub(r'sqrt\s*\(', 'sqrt(', s)
    s = re.sub(r'√\s*(\d+)', r'sqrt(\1)', s)
    s = re.sub(r'([\d.]+)\s*%\s*of\s*', r'(\1/100)*', s)
    s = re.sub(r'([\d.]+)\s*%', r'(\1/100)', s)
    s = re.sub(r'\)\s*\(', ')*(', s)
    s = re.sub(r'(\d)\s*\(', r'\1*(', s)
    s = re.sub(r'(\d)\s*([a-z])', r'\1*\2', s)
    return s


def ev(node, env):
    if isinstance(node, ast.Expression):
        return ev(node.body, env)
    if isinstance(node, ast.Constant) and isinstance(node.value, (int, float)):
        return Fraction(str(node.value))
    if isinstance(node, ast.Name):
        if node.id in env:
            return env[node.id]
        raise ValueError('name ' + node.id)
    if isinstance(node, ast.UnaryOp) and isinstance(node.op, (ast.USub, ast.UAdd)):
        v = ev(node.operand, env)
        return -v if isinstance(node.op, ast.USub) else v
    if isinstance(node, ast.BinOp):
        a, b = ev(node.left, env), ev(node.right, env)
        if isinstance(node.op, ast.Add): return a + b
        if isinstance(node.op, ast.Sub): return a - b
        if isinstance(node.op, ast.Mult): return a * b
        if isinstance(node.op, ast.Div): return a / b
        if isinstance(node.op, ast.Pow):
            if isinstance(b, Fraction) and b.denominator == 1 and isinstance(a, Fraction):
                return a ** int(b)
            return float(a) ** float(b)
    if isinstance(node, ast.Call) and getattr(node.func, 'id', '') == 'abs' and len(node.args) == 1:
        return abs(ev(node.args[0], env))
    if isinstance(node, ast.Call) and getattr(node.func, 'id', '') in ('logb', 'logb10'):
        x = float(ev(node.args[0], env)); b = float(ev(node.args[1], env)) if len(node.args) > 1 else 10.0
        r = math.log(x, b)
        return Fraction(int(round(r))) if abs(r - round(r)) < 1e-12 else r
    if isinstance(node, ast.Call) and getattr(node.func, 'id', '') == 'sqrt' and len(node.args) == 1:
        v = float(ev(node.args[0], env))
        r = math.sqrt(v)
        return Fraction(int(round(r))) if abs(r - round(r)) < 1e-12 else r
    raise ValueError('unsupported')


def num(e, env=None):
    return ev(ast.parse(to_py(e), mode='eval'), env or {})


def opt_val(o):
    s = re.sub(r'^[a-z]\s*=\s*', '', str(o).strip().replace('−', '-'))
    m = re.fullmatch(r'(-?\d+)\s+(\d+)/(\d+)', s)
    if m:
        w, a, b = int(m.group(1)), int(m.group(2)), int(m.group(3))
        return Fraction(w) + (Fraction(a, b) if w >= 0 else -Fraction(a, b))
    if s.endswith('%'):
        return num(s[:-1]) / 100
    return num(s)


def close(a, b):
    try:
        return abs(float(a) - float(b)) <= 1e-9 * max(1.0, abs(float(b)))
    except Exception:
        return False


def check(expr, var, opts, key, kind_note=''):
    if var in ('ineq', 'abs'):
        return 'not computable', None
    try:
        if var == 'expr':
            vs = re.findall(r'(?<![a-z])([a-z])(?![a-z])', expr.replace('sqrt', '').replace('abs', ''))
            v = vs[0] if vs else 'x'
            def same(o):
                o2 = re.sub(r'^[a-z]\s*=\s*', '', str(o))
                return all(close(num(expr, {v: Fraction(t)}), num(o2, {v: Fraction(t)})) for t in (2, 3, 7))
            hits = []
            for i, o in enumerate(opts):
                try:
                    if same(o): hits.append(i)
                except Exception:
                    pass
            if hits == [key]: return 'verified', 'equivalent at x = 2, 3, 7'
            if not hits: return 'not computable', None
            return ('mismatch' if key not in hits else 'two choices match'), 'choice ' + ','.join(map(str, hits))
        if var:
            lhs, rhs = expr.split('=', 1)
            f = lambda v: num(lhs, {var: v}) - num(rhs, {var: v})
            f0, f1, f2 = f(Fraction(0)), f(Fraction(1)), f(Fraction(2))
            if not close((f2 - f1), (f1 - f0)):
                return 'not computable', None
            val = -f0 / (f1 - f0)
        else:
            val = num(expr)
        vals = [opt_val(o) for o in opts]
    except Exception:
        return 'not computable', None
    hits = [i for i, v in enumerate(vals) if close(v, val)]
    if hits == [key]:
        return 'verified', str(val)
    k = str(opts[key]).strip()
    if key in hits and len(hits) > 1:
        lowest = [i for i in hits if re.fullmatch(r'-?\d+/\d+', str(opts[i]).strip()) and Fraction(str(opts[i]).strip()).numerator == int(str(opts[i]).strip().split('/')[0])]
        if lowest == [key]:
            return 'verified|lowest', str(val)
    if not hits and re.fullmatch(r'-?\d*\.\d+', k):
        d = len(k.split('.')[1])
        others = [i for i, v in enumerate(vals) if i != key and close(round(float(v), d), round(float(val), d))]
        if close(round(float(val), d), float(k)) and not others:
            return 'verified|round%d' % d, str(val)
    return ('mismatch' if key not in hits else 'two choices match'), str(val)


def process_text(path, src):
    out, n, report = [], 0, []
    pos = 0
    # flat items: "q":"..." followed in the same object by "opts":[...] and "correct":N (or stem/choices/correct)
    pat = re.compile(r'"(q|stem)"\s*:\s*"((?:[^"\\]|\\.)*)"')
    for m in pat.finditer(src):
        field, raw = m.group(1), m.group(2)
        q = json.loads('"' + raw + '"')
        tail = src[m.end():m.end() + 1600]
        mo = re.search(r'"(opts|choices)"\s*:\s*(\[(?:[^\[\]"]|"(?:[^"\\]|\\.)*")*\])', tail)
        mk = re.search(r'"correct"\s*:\s*(\d+)', tail)
        if not mo or not mk:
            continue
        nxt = pat.search(tail)
        if nxt and nxt.start() < mo.start():
            continue
        opts = json.loads(mo.group(2)); key = int(mk.group(1))
        if q.strip() in MANUAL:
            new = MANUAL[q.strip()]
            report.append({'file': path, 'old': q, 'new': new, 'key': opts[key] if key < len(opts) else None, 'value': None, 'status': 'hand-written, checked by hand'})
            out.append(src[pos:m.start(2)]); out.append(json.dumps(new, ensure_ascii=False)[1:-1]); pos = m.end(2); n += 1
            continue
        r = reword(q, opts)
        if not r:
            if re.search(r'=\s*\?\s*$', q) or re.match(r'^(Simplify|Evaluate|Solve)\s*:', q):
                report.append({'file': path, 'old': q, 'new': None, 'key': opts[key] if key < len(opts) else None, 'value': None, 'status': 'word stem, needs a human rewrite'})
            continue
        new, expr, var = r
        status, val = check(expr, var, opts, key)
        if status.startswith('verified|'):
            how = status.split('|')[1]
            if how == 'lowest': new = new[:-1] + ', written as a fraction in lowest terms?' if 'lowest terms' not in new else new
            elif how.startswith('round'): new = new[:-1] + ', rounded to the nearest ' + {'1': 'tenth', '2': 'hundredth', '3': 'thousandth'}.get(how[5:], 'hundredth') + '?'
            status = 'verified (' + ('lowest terms added' if how == 'lowest' else 'rounding stated') + ')'
        report.append({'file': path, 'old': q, 'new': new, 'key': opts[key] if key < len(opts) else None, 'value': val, 'status': status})
        out.append(src[pos:m.start(2)]); out.append(json.dumps(new, ensure_ascii=False)[1:-1]); pos = m.end(2); n += 1
    out.append(src[pos:])
    src2 = ''.join(out)
    # second pass: single-quoted JS objects  { q:'...', opts:['..'], correct:N }
    out, pos = [], 0
    pat2 = re.compile(r"\bq\s*:\s*'((?:[^'\\]|\\.)*)'")
    for m in pat2.finditer(src2):
        q = m.group(1).replace("\\'", "'")
        tail = src2[m.end():m.end() + 1600]
        mo = re.search(r"\bopts\s*:\s*(\[(?:[^\[\]'\"]|'(?:[^'\\]|\\.)*'|\"(?:[^\"\\]|\\.)*\")*\])", tail)
        mk = re.search(r'\bcorrect\s*:\s*(\d+)', tail)
        if not mo or not mk:
            continue
        nxt = pat2.search(tail)
        if nxt and nxt.start() < mo.start():
            continue
        try:
            opts = ast.literal_eval(mo.group(1))
        except Exception:
            continue
        key = int(mk.group(1))
        if q.strip() in MANUAL:
            new, status, val = MANUAL[q.strip()], 'hand-written, checked by hand', None
        else:
            r = reword(q, opts)
            if not r:
                continue
            new, expr, var = r
            status, val = check(expr, var, opts, key)
            if status.startswith('verified|'):
                how = status.split('|')[1]
                if how == 'lowest': new = new[:-1] + ', written as a fraction in lowest terms?'
                elif how.startswith('round'): new = new[:-1] + ', rounded to the nearest ' + {'1': 'tenth', '2': 'hundredth', '3': 'thousandth'}.get(how[5:], 'hundredth') + '?'
                status = 'verified (' + ('lowest terms added' if how == 'lowest' else 'rounding stated') + ')'
        report.append({'file': path, 'old': q, 'new': new, 'key': opts[key] if key < len(opts) else None, 'value': val, 'status': status})
        out.append(src2[pos:m.start(1)]); out.append(new.replace("'", "\\'")); pos = m.end(1); n += 1
    out.append(src2[pos:])
    return ''.join(out), n, report


def main():
    allrep = []
    for rel in FILES:
        p = os.path.join(ROOT, rel)
        src = open(p, encoding='utf8').read()
        new, n, rep = process_text(rel, src)
        allrep += rep
        c = {}
        for r in rep:
            c[r['status']] = c.get(r['status'], 0) + 1
        print('%-48s %4d reworded  %s' % (rel, n, c))
        if WRITE and n:
            if rel.endswith('.json'):
                json.loads(new)
            open(p, 'w', encoding='utf8').write(new)
    for r in allrep[:6] + [r for r in allrep if r['status'] != 'verified'][:12]:
        print('  [%s] %s  ->  %s   (key %s, computed %s)' % (r['status'], r['old'], r['new'], r['key'], r['value']))
    rp = os.path.join(ROOT, 'scripts', 'dat-wording-report.json')
    prev = json.load(open(rp)) if (WRITE and os.path.exists(rp)) else []
    if WRITE:
        json.dump(prev + allrep, open(rp, 'w'), indent=1, ensure_ascii=False)
    tot = {}
    for r in allrep:
        tot[r['status']] = tot.get(r['status'], 0) + 1
    print('total', len(allrep), tot)


if __name__ == '__main__':
    main()
