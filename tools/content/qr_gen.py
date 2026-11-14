"""Template solvers for the generated QR game items (ids like QR_fra1000).

Each family parses the stem, recomputes the answer from scratch, and checks it
against the keyed option. Nothing is written for an item unless the recomputed
answer equals the key and no other option equals it. Each wrong option is then
matched against a list of named mistakes (computed, not guessed); when no named
mistake reproduces the option, a factual check line is written instead.

Output: tools/content/data/qr-generated.json  {id: {why, traps[], trick, skill}}
        tools/content/data/qr-generated-flags.json  [{id, kind, problem, reasoning}]
"""
import json, os, re, sys, math
from fractions import Fraction as F

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")


class Flag(Exception):
    def __init__(self, kind, problem, reasoning):
        self.kind, self.problem, self.reasoning = kind, problem, reasoning


# ---------- number helpers ----------
def norm(s):
    return s.replace("−", "-").replace("×", "x").replace("·", "x").replace("÷", "/div/").strip()


def parse_num(s):
    """Parse an option string to a Fraction, or None."""
    t = norm(s).replace("$", "").replace(",", "").replace("%", "").strip()
    t = re.sub(r"^x\s*=\s*", "", t)
    t = re.sub(r"\s*(mph|mi|hr|mL|g|L|oz|lb|cups?|hours?|miles?|km/h|ft/s)$", "", t)
    m = re.fullmatch(r"(-?\d+)\s+(\d+)/(\d+)", t)
    if m:
        w = int(m.group(1))
        return F(w) + F(int(m.group(2)), int(m.group(3))) * (1 if w >= 0 else -1)
    m = re.fullmatch(r"(-?\d+)/(\d+)", t)
    if m:
        if int(m.group(2)) == 0:
            return None
        return F(int(m.group(1)), int(m.group(2)))
    m = re.fullmatch(r"-?\d+(\.\d+)?", t)
    if m:
        return F(t)
    return None


def decimals(s):
    t = norm(s).replace("$", "").replace("%", "")
    m = re.search(r"\.(\d+)", t)
    return len(m.group(1)) if m else 0


def same(optstr, val):
    """Does the printed option equal val (exactly, or after rounding to the
    option's printed decimals)?"""
    o = parse_num(optstr)
    if o is None or val is None:
        return False
    if o == val:
        return True
    if "/" in optstr:
        return False
    d = max(decimals(optstr), 0)
    q = F(1, 10 ** d)
    # round half up on magnitude
    r = F(math.floor(abs(val) / q + F(1, 2))) * q * (1 if val >= 0 else -1)
    if r == o and d >= 1:
        return True
    if d >= 1 and abs(val - o) == q / 2:
        return True  # exact half: either rounding direction is acceptable
    return False


def fmt(x):
    """Plain decimal or integer text for a Fraction/number."""
    x = F(x)
    if x.denominator == 1:
        return str(x.numerator)
    v = float(x)
    for d in (1, 2, 3, 4):
        if abs(round(v, d) - v) < 1e-9:
            return ("%." + str(d) + "f") % v
    return "%.2f" % v


def frac(x):
    x = F(x)
    return str(x.numerator) if x.denominator == 1 else "%d/%d" % (x.numerator, x.denominator)


def money(x):
    x = F(x)
    return "$" + (str(x.numerator) if x.denominator == 1 else "%.2f" % float(x))


# ---------- result container ----------
class R:
    def __init__(self, val, why, trick, skill, models=None, fallback=None, strkey=None, strmodels=None):
        self.val = val            # Fraction, or None when the key is a string
        self.why, self.trick, self.skill = why, trick, skill
        self.models = models or []        # [(Fraction, line)] in priority order
        self.fallback = fallback          # fn(optstr, optval) -> line
        self.strkey = strkey              # exact option text for string keys
        self.strmodels = strmodels or {}  # {option text: line}


FAMILIES = []


def family(rx):
    def deco(fn):
        FAMILIES.append((re.compile(rx), fn))
        return fn
    return deco


# ---------- fractions: add / subtract ----------
@family(r"^(\d+)/(\d+) ([+-]) (\d+)/(\d+) = \?$")
def fam_frac_add(m, it):
    a, b, op, c, d = int(m[1]), int(m[2]), m[3], int(m[4]), int(m[5])
    sgn = 1 if op == "+" else -1
    val = F(a, b) + sgn * F(c, d)
    L = b * d // math.gcd(b, d)
    a2, c2 = a * L // b, c * L // d
    n = a2 + sgn * c2
    verb = "Add" if sgn > 0 else "Subtract"
    conv = []
    for (p_, q_, p2_) in ((a, b, a2), (c, d, c2)):
        conv.append("%d/%d stays as it is" % (p_, q_) if q_ == L else "%d/%d = %d/%d" % (p_, q_, p2_, L))
    why = ("Fractions can only be combined when the pieces are the same size, so put both over %d: "
           "%s and %s. %s the tops: %d %s %d = %d, giving %d/%d"
           % (L, conv[0], conv[1], verb, a2, op, c2, n, n, L))
    why += "." if F(n, L).denominator == L else ", which reduces to %s." % frac(val)
    models = []
    if b + sgn * d != 0:
        models.append((F(a + sgn * c, b + sgn * d) if (b + sgn * d) else None,
                       "%s the tops and the bottoms straight across. Denominators are piece sizes; they never get %s."
                       % ("Added" if sgn > 0 else "Subtracted", "added" if sgn > 0 else "subtracted")))
    if sgn < 0:
        models.append((F(a + c, b + d), "Added tops and bottoms straight across, and the problem is a subtraction."))
    models.append((F(a * c, b * d), "Multiplied the two fractions (tops times tops, bottoms times bottoms) when the sign says to %s." % ("add" if sgn > 0 else "subtract")))
    models.append((F(a, b) - sgn * F(c, d), "%s the fractions when the sign says to %s." % ("Subtracted" if sgn > 0 else "Added", "add" if sgn > 0 else "subtract")))
    models.append((F(a + sgn * c, L), "Put both over %d but kept the old tops. When the bottom is scaled up, the top has to be scaled by the same factor." % L))
    if L != b * d:
        models.append((F(a + sgn * c, b * d), "Used %d as the denominator but kept the old tops. Each top must be scaled along with its bottom." % (b * d)))
    if val != 0:
        models.append((1 / val, "This is the correct value turned upside down. Keep the common denominator on the bottom."))
    models.append((val + F(1, d), "Too big by 1/%d. This is what %d/%d %s %d/%d would give, so one numerator slipped by one during the conversion." % (d, a, b, op, c + sgn, d)))
    models.append((val + F(c, d), "Counts %d/%d twice. Estimate first: the result has to sit near %s." % (c, d, fmt(val))))

    def fb(s, o):
        diff = o - val
        return "%s by %s compared with the true value %s. Redo the conversion to a denominator of %d and combine only the tops." % (
            "Too big" if diff > 0 else "Too small", frac(abs(diff)), frac(val), L)
    return R(val, why, "Same-size pieces first: convert to a common denominator, then combine only the numerators.",
             "qr.fractions.add-subtract", models, fb)


# ---------- fractions: multiply / divide ----------
@family(r"^(\d+)/(\d+) (x|/div/) (\d+)/(\d+) = \?$")
def fam_frac_mul(m, it):
    a, b, op, c, d = int(m[1]), int(m[2]), m[3], int(m[4]), int(m[5])
    if op == "x":
        val = F(a * c, b * d)
        why = "Multiply straight across: tops %d x %d = %d, bottoms %d x %d = %d, so the product is %d/%d" % (a, c, a * c, b, d, b * d, a * c, b * d)
        why += "." if val.denominator == b * d else ", which reduces to %s." % frac(val)
        why += " No common denominator is needed for multiplication."
        models = [
            (F(a * d, b * c), "Flipped the second fraction before multiplying. Flipping is the rule for division, not multiplication."),
            (F(a * d + b * c, b * d), "Added the fractions with a common denominator. The dot means multiply."),
            (F(a + c, b + d), "Added tops and bottoms. Multiplication uses products: tops times tops, bottoms times bottoms."),
            (F(a + c, b * d), "Multiplied the bottoms but added the tops. Both parts get multiplied."),
            (F(a * c, b + d), "Multiplied the tops but added the bottoms. Both parts get multiplied."),
            (F(b * c, a * d), "Flipped the first fraction. Nothing gets flipped in a multiplication."),
            (F(b * d, a * c), "This is the product turned upside down."),
            (F(a * c + 1, b * d), "Top is one too big: %d x %d is %d." % (a, c, a * c)),
            (F(a + c, b * d), "Added the tops instead of multiplying them."),
        ]
        trick = "Multiplying fractions: top times top over bottom times bottom, then reduce. Cancel common factors first to keep numbers small."
        skill = "qr.fractions.multiply"
    else:
        val = F(a * d, b * c)
        why = ("Dividing by a fraction means multiplying by its flip: %d/%d x %d/%d. Tops %d x %d = %d, bottoms %d x %d = %d, so the quotient is %d/%d"
               % (a, b, d, c, a, d, a * d, b, c, b * c, a * d, b * c))
        why += "." if val.denominator == b * c else ", which reduces to %s." % frac(val)
        models = [
            (F(a * c, b * d), "Multiplied without flipping the second fraction. Division needs the flip."),
            (F(b * c, a * d), "Flipped the first fraction instead of the second. Only the divisor gets flipped."),
            (F(a + c, b + d), "Added tops and bottoms. Division means multiply by the flipped second fraction."),
            (F(a * d + b * c, b * d), "Added the fractions. The sign says divide."),
            (F(a + d, b * c), "Flipped correctly, then added the tops instead of multiplying them."),
            (F(a * d, b + c), "Flipped correctly, then added the bottoms instead of multiplying them."),
            (F(a + d, b + c), "Flipped the second fraction, then added straight across instead of multiplying."),
            (F(d, c), "This is only the flipped second fraction. It still has to be multiplied by %d/%d." % (a, b)),
        ]
        trick = "Keep, change, flip: keep the first fraction, change divide to multiply, flip the second."
        skill = "qr.fractions.divide"

    def fb(s, o):
        first, second = F(a, b), F(c, d)
        if op == "x" and second < 1 and o > first:
            return "Too big. Multiplying %s by a fraction below 1 must shrink it, and this is larger than %s." % (frac(first), frac(first))
        if op == "x" and second > 1 and o < first:
            return "Too small. Multiplying %s by a fraction above 1 must grow it, and this is smaller than %s." % (frac(first), frac(first))
        if op != "x" and second < 1 and o < first:
            return "Too small. Dividing %s by a fraction below 1 must make it bigger, and this is smaller than %s." % (frac(first), frac(first))
        if op != "x" and second > 1 and o > first:
            return "Too big. Dividing %s by a fraction above 1 must shrink it, and this is larger than %s." % (frac(first), frac(first))
        if op == "x":
            return "Not %d/%d. Tops multiply to %d and bottoms multiply to %d." % (a * c, b * d, a * c, b * d)
        return "Not %d/%d. After flipping the second fraction, tops multiply to %d and bottoms to %d." % (a * d, b * c, a * d, b * c)
    return R(val, why, trick, skill, models, fb)


# ---------- fraction to decimal ----------
BENCH = {F(1, 2): "1/2", F(1, 4): "1/4", F(3, 4): "3/4", F(1, 8): "1/8", F(1, 5): "1/5", F(2, 5): "2/5",
         F(333, 1000): "1/3", F(167, 1000): "1/6", F(3, 8): "3/8", F(5, 8): "5/8", F(7, 8): "7/8",
         F(4, 5): "4/5", F(3, 5): "3/5", F(833, 1000): "5/6", F(83, 1000): "1/12", F(111, 1000): "1/9"}


@family(r"^Convert (\d+)/(\d+) to a decimal(?: \(3 dp\))?\.$")
def fam_frac_dec(m, it):
    a, b = int(m[1]), int(m[2])
    val = F(a, b)
    keytxt = it["opts"][it["correct"]]
    unit = F(1, b)
    unit_txt = {2: "0.5", 4: "0.25", 5: "0.2", 8: "0.125", 6: "0.1666...", 12: "0.0833...", 9: "0.111..."}[b]
    if a == 1:
        why = "A fraction is a division: %d divided by %d is %s%s." % (a, b, unit_txt, "" if unit.denominator in (2, 4, 5, 8, 10) and b in (2, 4, 5, 8) else ", which rounds to " + keytxt)
    else:
        why = "Start from the unit fraction: 1/%d = %s. Then %d/%d is %d of those, which is %s." % (b, unit_txt, a, b, a, keytxt)
    models = [(F(b, 10), "Copies the denominator %d after the decimal point. The decimal comes from dividing %d by %d." % (b, a, b))]

    def fb(s, o):
        if o in BENCH:
            return "%s is the decimal for %s, a different fraction." % (s, BENCH[o])
        if b == 6 and o == F(161, 1000):
            return "0.161 misreads the repeating digits: 1/6 = 0.1666..., which rounds to 0.167."
        if o == F(857, 1000):
            return "0.857 is 6/7. Eighths go up in steps of 0.125, so 7/8 is 0.875."
        return "%s is not %d divided by %d. Anchor on 1/%d = %s." % (s, a, b, b, unit_txt)
    return R(val, why, "Memorize the unit fractions (1/4 = 0.25, 1/5 = 0.2, 1/6 = 0.167, 1/8 = 0.125) and build the rest by multiplying.",
             "qr.fractions.to-decimal", models, fb)


# ---------- percent of ----------
@family(r"^(\d+(?:\.\d+)?)% of (\d+) = \?$")
def fam_pct_of(m, it):
    p, n = F(m[1]), F(m[2])
    val = p * n / 100
    ten = n / 10
    if p in (50, 25, 75, 10, 20):
        easy = {50: "half", 25: "a quarter", 75: "three quarters", 10: "one tenth", 20: "one fifth"}[int(p)]
        why = "%s%% means %s. %s of %s is %s." % (fmt(p), easy, easy.capitalize(), fmt(n), fmt(val))
    else:
        why = "Percent means per hundred, so %s%% of %s is %s x %s = %s. Mental route: 10%% of %s is %s, and 1%% is %s; build %s%% from those." % (
            fmt(p), fmt(n), fmt(p / 100), fmt(n), fmt(val), fmt(n), fmt(ten), fmt(n / 100), fmt(p))
    models = [
        (p * n, "Multiplied %s by %s and never divided by 100. %s%% is %s as a decimal." % (fmt(p), fmt(n), fmt(p), fmt(p / 100))),
        (p + n, "Added the percent to the number. A percent of a number is found by multiplying."),
        (val / 10, "Decimal point one place too far left. Check: 10%% of %s is already %s." % (fmt(n), fmt(ten))),
        (val * 10, "Decimal point one place too far right. Check: 10%% of %s is only %s." % (fmt(n), fmt(ten))),
        ((100 - p) * n / 100, "This is %s%% of %s, the part left over, not the %s%% asked for." % (fmt(100 - p), fmt(n), fmt(p))),
        (n - p, "Subtracted the percent from the number as if it were a plain amount."),
        (p, "Just repeats the percent. It still has to be applied to %s." % fmt(n)),
    ]

    def fb(s, o):
        return "%s is %s%% of %s, not %s%%. Anchor on 10%% of %s = %s." % (s, fmt(o / n * 100), fmt(n), fmt(p), fmt(n), fmt(ten))
    return R(val, why, "Find 10% (move the decimal one place) and 1% (two places), then build any percent from those.",
             "qr.percent.of-a-number", models, fb)


# ---------- percent change ----------
@family(r"^A \$(\d+) item is (increased|decreased) by (\d+)%\. New price\?$")
def fam_pct_chg(m, it):
    n, up, p = F(m[1]), m[2] == "increased", F(m[3])
    sgn = 1 if up else -1
    chg = n * p / 100
    val = n + sgn * chg
    mult = 1 + sgn * p / 100
    why = "%s%% of $%s is %s. %s it: %s %s %s = %s. One step: multiply by %s." % (
        fmt(p), fmt(n), money(chg), "Add" if up else "Subtract", money(n), "+" if up else "-", money(chg), money(val), fmt(mult))
    models = [
        (chg, "This is only the amount of the change (%s%% of $%s). The question asks for the new price." % (fmt(p), fmt(n))),
        (n + sgn * p, "Treated %s%% as %s dollars. The percent has to be taken of $%s first." % (fmt(p), fmt(p), fmt(n))),
        (n - sgn * chg, "Went the wrong direction: this is the price after a %s%% %s." % (fmt(p), "decrease" if up else "increase")),
        (n - sgn * p, "Treated %s%% as %s dollars and also moved the wrong direction." % (fmt(p), fmt(p))),
    ]

    def fb(s, o):
        pc = (o - n) / n * 100
        return "This price would be a %s%% %s from $%s. The change asked for is %s%%, which is %s." % (fmt(abs(pc)), "increase" if pc > 0 else "decrease", fmt(n), fmt(p), money(chg))
    return R(val, why, "Turn the change into one multiplier: up 30% is x 1.30, down 30% is x 0.70.",
             "qr.percent.change", models, fb)


# ---------- successive percents ----------
@family(r"^\$(\d+) → ([+-])(\d+)% → ([+-])(\d+)%\. Final\?$")
def fam_pct_seq(m, it):
    n, s1, p, s2, q = F(m[1]), (1 if m[2] == "+" else -1), F(m[3]), (1 if m[4] == "+" else -1), F(m[5])
    m1, m2 = 1 + s1 * p / 100, 1 + s2 * q / 100
    mid = n * m1
    val = mid * m2
    why = "Apply the changes one at a time, each to the current amount. $%s x %s = %s. Then %s x %s = %s. The second percent is taken of %s, not of the original $%s." % (
        fmt(n), fmt(m1), money(mid), money(mid), fmt(m2), money(val), money(mid), fmt(n))
    models = [
        (n * (1 + (s1 * p + s2 * q) / 100), "Combined the two percents into one (%s%s%% net) and applied it to the original. The second change acts on the new amount." % ("+" if s1 * p + s2 * q >= 0 else "-", fmt(abs(s1 * p + s2 * q)))),
        (mid, "Stopped after the first change. The second change still has to be applied."),
        (n * m2, "Applied only the second change to the original amount and skipped the first."),
        (n * (1 - s1 * p / 100) * (1 - s2 * q / 100), "Both changes went the wrong direction."),
        (n * m1 * (1 - s2 * q / 100), "Second change went the wrong direction."),
        (n * (1 - s1 * p / 100) * m2, "First change went the wrong direction."),
        (n * (1 - s1 * p / 100), "First change in the wrong direction, and the second change never applied."),
        (n * (1 - s2 * q / 100), "Only the second change, and in the wrong direction."),
    ]

    def fb(s, o):
        return "Not $%s x %s x %s. After the first change the amount is %s; apply the second percent to that to get %s." % (fmt(n), fmt(m1), fmt(m2), money(mid), money(val))
    return R(val, why, "Successive percents multiply. Write each as a multiplier and chain them; never add the percents.",
             "qr.percent.successive", models, fb)


# ---------- linear equations ----------
def term(coef, var="x"):
    return ("%dx" % coef)


@family(r"^Solve: (-?\d+)x ([+-]) (\d+) = (-?\d+)\.?$")
def fam_lin1(m, it):
    a, sg, b, c = int(m[1]), (1 if m[2] == "+" else -1), int(m[3]), int(m[4])
    b = sg * b
    val = F(c - b, a)
    undo = "subtract %d from" % b if b > 0 else ("add %d to" % -b if b < 0 else "leave")
    why = "Undo the operations in reverse order. First %s both sides: %dx = %d. Then divide by %d: x = %s." % (undo, a, c - b, a, fmt(val))
    if b == 0:
        why = "Nothing is added or subtracted, so just divide both sides by %d: x = %s." % (a, fmt(val))
    models = [
        (F(c + b, a), "Moved %d across the equals sign without changing its sign." % abs(b)),
        (F(c - b), "Stopped at %dx = %d and never divided by %d." % (a, c - b, a)),
        (-val, "Sign error."),
        (F(c, a) - b, "Divided only the right side by %d before dealing with the constant." % a),
    ]

    def fb(s, o):
        lhs = a * o + b
        return "Substitute it: %d(%s) %s %d = %s, not %d." % (a, fmt(o), "+" if b >= 0 else "-", abs(b), fmt(lhs), c)
    models = [(v, line + " " + fb(None, v) if line == "Sign error." else line) for v, line in models]
    return R(val, why, "Solve by undoing: clear the added or subtracted number first, then divide. Substitute your answer to check in five seconds.",
             "qr.algebra.linear-one-step-two-step", models, fb)


@family(r"^Solve: (-?\d+)x ([+-]) (\d+) = (-?\d+)x ([+-]) (\d+)$")
def fam_lin2(m, it):
    a, b, c, d = int(m[1]), (1 if m[2] == "+" else -1) * int(m[3]), int(m[4]), (1 if m[5] == "+" else -1) * int(m[6])
    val = F(d - b, a - c)
    why = "Collect x on one side and plain numbers on the other. Subtract %dx from both sides: %dx %s %d = %d. Then move %d across: %dx = %d. Divide by %d: x = %s." % (
        c, a - c, "+" if b >= 0 else "-", abs(b), d, b, a - c, d - b, a - c, fmt(val))
    models = [
        (-val, "Sign error when moving terms across the equals sign."),
        (F(d - b, a + c) if a + c else None, "Added the x terms (%d and %d) instead of subtracting one from the other." % (a, c)),
        (F(d + b, a - c), "Moved the constant across without changing its sign."),
    ]

    def fb(s, o):
        return "Substitute it: left side gives %s, right side gives %s. They must match." % (fmt(a * o + b), fmt(c * o + d))
    models = [(v, line + " " + fb(None, v)) for v, line in models if v is not None]
    return R(val, why, "Variables to one side, numbers to the other, changing the sign of anything that crosses the equals sign.",
             "qr.algebra.linear-both-sides", models, fb)


# ---------- distribution ----------
@family(r"^Solve: (\d+)\(x ([+-]) (\d+)\) = (-?\d+)$")
def fam_dis_solve(m, it):
    a, b, c = int(m[1]), (1 if m[2] == "+" else -1) * int(m[3]), int(m[4])
    val = F(c, a) - b
    why = "Divide both sides by %d first: x %s %d = %s. Then %s: x = %s. Distributing works too: %dx %s %d = %d leads to the same place." % (
        a, "+" if b > 0 else "-", abs(b), fmt(F(c, a)), "subtract %d" % b if b > 0 else "add %d" % -b, fmt(val), a, "+" if a * b > 0 else "-", abs(a * b), c)
    models = [
        (F(c - b, a), "Multiplied only the x by %d and left the %d alone. The %d multiplies everything inside the parentheses." % (a, abs(b), a)),
        (F(c, a), "This is the value of the whole parenthesis (x %s %d), not x." % ("+" if b > 0 else "-", abs(b))),
        (F(c, a) + b, "Moved %d the wrong way after dividing." % abs(b)),
        (-val, "Sign error. Substitute to check: %d(%s %s %d) = %s, not %d." % (a, fmt(-val), "+" if b > 0 else "-", abs(b), fmt(a * (-val + b)), c)),
    ]

    def fb(s, o):
        return "Substitute it: %d(%s %s %d) = %s, not %d." % (a, fmt(o), "+" if b > 0 else "-", abs(b), fmt(a * (o + b)), c)
    return R(val, why, "When a number multiplies a parenthesis, either divide it away first or distribute it to every term inside.",
             "qr.algebra.distribute-solve", models, fb)


@family(r"^Expand and evaluate (\d+)\((\d+) ([+-]) (\d+)\)\.$")
def fam_dis_eval(m, it):
    a, b, sg, c = int(m[1]), int(m[2]), (1 if m[3] == "+" else -1), int(m[4])
    val = F(a * (b + sg * c))
    why = "Distribute the %d to both terms: %d x %d = %d and %d x %d = %d. Then %d %s %d = %s. Check by doing the parenthesis first: %d x %d = %s." % (
        a, a, b, a * b, a, c, a * c, a * b, m[3], a * c, fmt(val), a, b + sg * c, fmt(val))
    models = [
        (F(a * b + sg * c), "Multiplied only the first term by %d. The second term gets multiplied too." % a),
        (F(b + sg * c), "This is just the parenthesis. It still has to be multiplied by %d." % a),
        (F(a * (b - sg * c)), "Used the wrong sign inside the parenthesis."),
        (F(a + b + sg * c), "Added %d to the parenthesis instead of multiplying." % a),
        (F(a * b), "Multiplied %d by the first term and dropped the second term." % a),
        (F(a * c * sg), "Multiplied %d by the second term only." % a),
        (F(b + sg * a * c), "Multiplied only the second term by %d." % a),
        (val + a, "One group of %d too many: this is %d x %d." % (a, a, b + sg * c + 1)),
        (val - a, "One group of %d short: this is %d x %d." % (a, a, b + sg * c - 1)),
    ]

    def fb(s, o):
        return "Not %d x %d. The parenthesis equals %d, and %d groups of it make %s." % (a, b + sg * c, b + sg * c, a, fmt(val))
    return R(val, why, "A number outside a parenthesis multiplies every term inside.", "qr.algebra.distribute", models, fb)


# ---------- order of operations ----------
@family(r"^Evaluate: \((\d+) \+ (\d+)\) x (\d+)$")
def fam_pem_paren(m, it):
    a, b, c = int(m[1]), int(m[2]), int(m[3])
    val = F((a + b) * c)
    why = "Parentheses come first: %d + %d = %d. Then multiply: %d x %d = %s." % (a, b, a + b, a + b, c, fmt(val))
    models = [
        (F(a + b * c), "Ignored the parentheses and multiplied %d x %d first." % (b, c)),
        (F(a * c + b), "Multiplied only the first number in the parentheses by %d." % c),
        (F(a * b * c), "Multiplied all three numbers. Inside the parentheses the sign is plus."),
        (F(a + b + c), "Added all three numbers. Outside the parentheses the sign is times."),
        (F(a * b + c), "Multiplied inside the parentheses and added outside: the two signs got swapped."),
    ]

    def fb(s, o):
        return "Not %d x %d. Do the parenthesis first to get %d, then multiply by %d." % (a + b, c, a + b, c)
    return R(val, why, "Order: parentheses, exponents, multiply and divide, then add and subtract.", "qr.arithmetic.order-of-operations", models, fb)


@family(r"^Evaluate: (\d+) \+ (\d+) x (\d+)$")
def fam_pem_plain(m, it):
    a, b, c = int(m[1]), int(m[2]), int(m[3])
    val = F(a + b * c)
    why = "Multiplication comes before addition even though the plus sign is written first: %d x %d = %d. Then %d + %d = %s." % (b, c, b * c, a, b * c, fmt(val))
    models = [
        (F((a + b) * c), "Worked left to right: added %d + %d first, then multiplied. Multiplication outranks addition." % (a, b)),
        (F(a * b + c), "Multiplied the first pair and added the last number. The times sign sits between %d and %d." % (b, c)),
        (F(a * b * c), "Multiplied all three numbers."),
        (F(a + b + c), "Added all three numbers and ignored the times sign."),
        (F(b * c), "Did the multiplication and forgot to add the %d." % a),
        (F(a + b * c + c), "One extra group of %d: this is %d + %d x %d." % (c, a, b + 1, c)),
        (F(a + b * c - c), "One group of %d short: this is %d + %d x %d." % (c, a, b - 1, c)),
        (F(a + b * c + b), "One extra group of %d: this is %d + %d x %d." % (b, a, b, c + 1)),
        (F(a + b * c - b), "One group of %d short: this is %d + %d x %d." % (b, a, b, c - 1)),
        (F(abs(a - b * c)), "Subtracted instead of adding after the multiplication."),
    ]

    def fb(s, o):
        return "Not %d + %d. The product %d x %d = %d goes first, then add %d." % (a, b * c, b, c, b * c, a)
    return R(val, why, "Scan for times and divide signs first; do those, then add and subtract left to right.", "qr.arithmetic.order-of-operations", models, fb)


@family(r"^Evaluate: (\d+) x (\d+) - (\d+) x (\d+)$")
def fam_pem_two(m, it):
    a, b, c, d = int(m[1]), int(m[2]), int(m[3]), int(m[4])
    val = F(a * b - c * d)
    why = "Do both multiplications before the subtraction: %d x %d = %d and %d x %d = %d. Then %d - %d = %s." % (a, b, a * b, c, d, c * d, a * b, c * d, fmt(val))
    models = [
        (F((a * b - c) * d), "Worked strictly left to right: %d x %d, minus %d, then times %d. Both products come before the minus." % (a, b, c, d)),
        (F(a * (b - c) * d), "Subtracted %d - %d in the middle first. Subtraction waits until both products are done." % (b, c)),
        (F(a * b + c * d), "Added the two products. The sign between them is minus."),
        (F(a * (b - c)), "Did %d - %d first and then dropped the last factor." % (b, c)),
        (F(a * b - c), "Forgot to multiply %d by %d before subtracting." % (c, d)),
    ]

    def fb(s, o):
        return "Not %d - %d. Each product is finished before anything is subtracted." % (a * b, c * d)
    return R(val, why, "Treat each product as one block. Finish the blocks, then combine them.", "qr.arithmetic.order-of-operations", models, fb)


@family(r"^Evaluate: (\d+)² \+ (\d+) x (\d+)$")
def fam_pem_sq(m, it):
    a, b, c = int(m[1]), int(m[2]), int(m[3])
    val = F(a * a + b * c)
    why = "Exponent first: %d squared is %d. Multiplication next: %d x %d = %d. Addition last: %d + %d = %s." % (a, a * a, b, c, b * c, a * a, b * c, fmt(val))
    models = [
        (F((a * a + b) * c), "Added %d + %d before multiplying. The product %d x %d comes before the addition." % (a * a, b, b, c)),
        (F(2 * a + b * c), "Doubled %d instead of squaring it. %d squared is %d x %d = %d." % (a, a, a, a, a * a)),
        (F((2 * a + b) * c), "Doubled %d instead of squaring it, then worked left to right." % a),
        (F(a * a + b + c), "Added %d and %d instead of multiplying them." % (b, c)),
        (F(a + b * c), "Left the %d unsquared." % a),
        (F((a + b) * c), "Left the %d unsquared and added before multiplying." % a),
        (F(a * a * b * c), "Multiplied everything together. The plus sign splits this into two blocks."),
    ]

    def fb(s, o):
        return "Not %d + %d. Square first, multiply second, add last." % (a * a, b * c)
    return R(val, why, "Exponents outrank multiplication, and multiplication outranks addition.", "qr.arithmetic.order-of-operations", models, fb)


# ---------- negative coefficient inequality ----------
@family(r"^Solve: -(\d+)x < (\d+)\.?$")
def fam_neg_ineq(m, it):
    a, b = int(m[1]), int(m[2])
    v = F(b, a)
    vt = fmt(v) if (v.denominator in (1, 2, 4, 5, 10)) else "%.2f" % float(v)
    key = "x > -%s" % vt
    why = "Divide both sides by -%d to isolate x. Dividing an inequality by a negative number reverses the direction, so less than becomes greater than: x > -%s. Test x = 0: -%d(0) = 0, which is less than %d, and 0 is in the answer." % (a, vt, a, b)
    sm = {
        "x < -%s" % vt: "Divided by -%d but kept the sign pointing the same way. Dividing by a negative flips it. Test x = 0: it satisfies the original but not this." % a,
        "x > %s" % vt: "Flipped the sign but lost the negative on the number: %d divided by -%d is negative." % (b, a),
        "x = -%s" % vt: "An inequality describes a range of values. -%s is only the boundary, and it is not even included." % vt,
        "x < %s" % vt: "Two slips at once: the sign was not flipped and the negative on the number was lost. %d divided by -%d is -%s, and dividing by a negative reverses the direction." % (b, a, vt),
    }
    return R(None, why, "Any time you multiply or divide an inequality by a negative, flip the sign. Then test one easy number such as 0.",
             "qr.algebra.inequality-negative-coefficient", strkey=key, strmodels=sm)


# ---------- distance = rate x time ----------
@family(r"^A car drives (\d+) mph for (\d+(?:\.\d+)?) hr\. Distance\?$")
def fam_rate(m, it):
    r, t = F(m[1]), F(m[2])
    val = r * t
    why = "Distance = rate x time. %s miles each hour for %s hours is %s x %s = %s miles." % (fmt(r), fmt(t), fmt(r), fmt(t), fmt(val))
    if t.denominator != 1:
        whole = F(int(t))
        why += " Split the time to do it mentally: %s x %s = %s, plus %s x %s = %s." % (fmt(r), fmt(whole), fmt(r * whole), fmt(r), fmt(t - whole), fmt(r * (t - whole)))
    models = [
        (r / t, "Divided the speed by the time. Miles per hour times hours gives miles; dividing gives nothing useful here."),
        (r + t, "Added the speed and the time. They have different units and cannot be added."),
        (r * (t - 1), "Counts only %s hours of driving, one hour short." % fmt(t - 1)),
        (r * (t + 1), "Counts %s hours of driving, one hour too many." % fmt(t + 1)),
        (r * (t + F(1, 2)), "Counts %s hours of driving, half an hour too many." % fmt(t + F(1, 2))),
        (r * (t - F(1, 2)), "Counts %s hours of driving, half an hour short." % fmt(t - F(1, 2))),
        (r / 2 * t, "Used half the speed."),
        (r, "This is just the speed. After %s hours the car has gone farther than one hour's worth." % fmt(t)),
    ]

    def fb(s, o):
        return "Not %s x %s. The units guide you: mph x hr = miles, which gives %s." % (fmt(r), fmt(t), fmt(val))
    return R(val, why, "Let the units steer: miles per hour times hours leaves miles.", "qr.rates.distance-rate-time", models, fb)


# ---------- word decode ----------
@family(r"^Half a number plus (\d+) equals (\d+(?:\.\d+)?)\. The number\?$")
def fam_wd_half(m, it):
    b, c = F(m[1]), F(m[2])
    val = 2 * (c - b)
    why = "Translate: n/2 + %s = %s. Subtract %s: n/2 = %s. Double it: n = %s." % (fmt(b), fmt(c), fmt(b), fmt(c - b), fmt(val))
    models = [
        (c - b, "Stopped at half the number. %s is n/2; the number itself is twice that." % fmt(c - b)),
        ((c - b) / 2, "Halved %s instead of doubling it. Undoing a half means multiplying by 2." % fmt(c - b)),
        (2 * c - b, "Doubled before subtracting %s, so the %s was not doubled with it." % (fmt(b), fmt(b))),
        (2 * (c + b), "Added %s instead of subtracting it." % fmt(b)),
        (2 * c, "Ignored the plus %s." % fmt(b)),
    ]

    def fb(s, o):
        return "Check it: half of %s is %s, plus %s is %s, not %s." % (fmt(o), fmt(o / 2), fmt(b), fmt(o / 2 + b), fmt(c))
    return R(val, why, "Translate the sentence into an equation word by word, then undo the steps in reverse.", "qr.algebra.translate-words", models, fb)


@family(r"^The sum of a number and (\d+) times the number is (\d+)\. Find the number\.$")
def fam_wd_sum(m, it):
    k, s = F(m[1]), F(m[2])
    val = s / (k + 1)
    why = "Translate: n + %sn = %s. One n plus %s more n is %sn, so %sn = %s and n = %s." % (fmt(k), fmt(s), fmt(k), fmt(k + 1), fmt(k + 1), fmt(s), fmt(val))
    models = [
        (s / k, "Divided by %s and forgot the number itself counts once more: n + %sn is %sn." % (fmt(k), fmt(k), fmt(k + 1))),
        (s - k, "Subtracted %s instead of dividing by %s." % (fmt(k), fmt(k + 1))),
    ]

    def fb(s2, o):
        return "Check it: %s + %s x %s = %s, not %s." % (fmt(o), fmt(k), fmt(o), fmt(o + k * o), fmt(s))
    return R(val, why, "Count the copies of the unknown: a number plus k times the number is (k + 1) copies.", "qr.algebra.translate-words", models, fb)


@family(r"^Five less than (\d+) times a number is (\d+)\. The number\?$")
def fam_wd_less(m, it):
    k, c = F(m[1]), F(m[2])
    val = (c + 5) / k
    why = "Translate: %sn - 5 = %s. 'Five less than' means 5 is taken away from %sn. Add 5: %sn = %s. Divide by %s: n = %s." % (fmt(k), fmt(c), fmt(k), fmt(k), fmt(c + 5), fmt(k), fmt(val))
    models = [
        ((c - 5) / k, "Subtracted 5 again instead of adding it back. To undo 'minus 5' you add 5."),
        (c + 5, "Stopped at %sn = %s and never divided by %s." % (fmt(k), fmt(c + 5), fmt(k))),
        (c / k + 5, "Divided by %s before adding the 5 back, so the 5 was never divided." % fmt(k)),
        (k * c - 5, "Multiplied instead of solving backward."),
        (k * 5, "Multiplied %s by 5; the sentence never does that." % fmt(k)),
    ]

    def fb(s, o):
        return "Check it: %s x %s - 5 = %s, not %s." % (fmt(k), fmt(o), fmt(k * o - 5), fmt(c))
    return R(val, why, "'Less than' reverses the order: five less than 3n is 3n - 5, never 5 - 3n.", "qr.algebra.translate-words", models, fb)


@family(r"^Three more than twice a number is (\d+)\. The number\?$")
def fam_wd_more(m, it):
    c = F(m[1])
    val = (c - 3) / 2
    why = "Translate: 2n + 3 = %s. Subtract 3: 2n = %s. Divide by 2: n = %s." % (fmt(c), fmt(c - 3), fmt(val))
    models = [
        ((c + 3) / 2, "Added 3 instead of subtracting it. To undo 'plus 3' you subtract 3."),
        (c - 3, "Stopped at 2n = %s and never divided by 2." % fmt(c - 3)),
        (c / 2 - 3, "Halved first and then subtracted the full 3, so the 3 was never halved."),
    ]

    def fb(s, o):
        return "Check it: 2 x %s + 3 = %s, not %s." % (fmt(o), fmt(2 * o + 3), fmt(c))
    return R(val, why, "Write the equation first, then undo addition before division. Plug the answer back in to confirm.", "qr.algebra.translate-words", models, fb)


# ---------- logs ----------
@family(r"^log(?:_(\d+))?\((\d+)\) = \?$")
def fam_log(m, it):
    base = int(m[1]) if m[1] else 10
    n = int(m[2])
    k = round(math.log(n, base))
    if base ** k != n:
        raise Flag("check", "log argument is not an exact power", "%d is not a whole power of %d" % (n, base))
    val = F(k)
    q = "%d to what power gives %s?" % (base, n)
    if k == 0:
        why = "A logarithm asks: %s Any base to the power 0 equals 1, so the answer is 0." % q
    elif k == 1:
        why = "A logarithm asks: %s %d to the first power is %d itself, so the answer is 1." % (q, base, base)
    elif base == 10:
        why = "A logarithm asks: %s With base 10 (no base written means 10), count the zeros: %s has %d, so 10^%d = %s and the log is %d." % (q, n, k, k, n, k)
    else:
        chain = " x ".join([str(base)] * k)
        why = "A logarithm asks: %s %s = %s, which is %d factors of %d, so the log is %d." % (q, chain if k <= 9 else "%d^%d" % (base, k), n, k, base, k)
    models = [(F(k * base), "Multiplied the exponent by the base (%d x %d). The log is only the exponent, %d." % (k, base, k))]
    if n != base:
        models.append((F(n), "Repeats the number inside the log. The log is the exponent that produces %d, not %d itself." % (n, n)))
    if base != n and k != 1:
        models.append((F(base), "This is the base. The log is the exponent on that base."))
    models.append((F(n, base) if n % base == 0 else None, "Divided %d by %d. A log counts how many times the base is multiplied, not a single division." % (n, base)))
    models.append((F(2 * k), "Doubled the exponent. Count the factors once: %d of them." % k))

    def fb(s, o):
        if o.denominator == 1 and -3 <= o <= 40:
            p = F(base) ** int(o)
            pt = fmt(p) if p.denominator == 1 or p.denominator in (2, 4, 5, 8, 10, 100, 1000) else frac(p)
            return "Test it: %d^%s = %s, not %d." % (base, fmt(o), pt, n)
        if o == F(1, 2):
            return "Test it: %d^0.5 is the square root of %d, not %d." % (base, base, n)
        if o == F(1, 10):
            return "Test it: %d^0.1 is the tenth root of %d, a number a little above 1, not exactly %d." % (base, base, n)
        return "Raising %d to %s does not give %d." % (base, s, n)
    models = [(v, l) for v, l in models if v is not None]
    return R(val, why, "Rewrite every log as an exponent question: log base b of N = k means b^k = N.", "qr.exponents.logarithm-evaluate", models, fb)


# ---------- decimal arithmetic ----------
@family(r"^(\d+(?:\.\d+)?) (\+|-|x|/div/) (\d+(?:\.\d+)?) = \?$")
def fam_dec(m, it):
    a, op, b = F(m[1]), m[2], F(m[3])
    val = {"+": a + b, "-": a - b, "x": a * b, "/div/": a / b}[op]
    sym = {"+": "+", "-": "-", "x": "x", "/div/": "divided by"}[op]
    keytxt = norm(it["opts"][it["correct"]])
    if op == "/div/" and not same(it["opts"][it["correct"]], val):
        raise Flag("precision", "key does not match the quotient at the precision the other options use",
                   "%s / %s = %.4f; keyed option is %s" % (fmt(a), fmt(b), float(val), keytxt))
    if op == "/div/" and decimals(it["opts"][it["correct"]]) < 2 and val.denominator not in (1, 2, 5, 10):
        raise Flag("precision", "Stem states no rounding rule and the key is rounded to fewer places than the other options",
                   "%s / %s = %.4f; key %s is rounded to one place while distractors show two places" % (fmt(a), fmt(b), float(val), keytxt))
    if op == "+":
        why = "Line up the decimal points and add column by column: %s + %s = %s. Estimate check: about %d + %d = %d." % (fmt(a), fmt(b), fmt(val), round(a), round(b), round(a) + round(b))
    elif op == "-":
        if val < 0:
            why = "The number being taken away is larger, so the answer is negative. Find the gap, %s - %s = %s, and attach the minus sign: %s." % (fmt(b), fmt(a), fmt(b - a), fmt(val))
        else:
            why = "Line up the decimal points and subtract: %s - %s = %s. Estimate check: about %d - %d = %d." % (fmt(a), fmt(b), fmt(val), round(a), round(b), round(a) - round(b))
    elif op == "x":
        da, db = decimals(m[1]), decimals(m[3])
        ai, bi = a * 10 ** da, b * 10 ** db
        if da + db:
            why = "Multiply as whole numbers, %s x %s = %s, then put back %d decimal place%s (one for each digit after a decimal point in the factors): %s." % (
                fmt(ai), fmt(bi), fmt(ai * bi), da + db, "" if da + db == 1 else "s", fmt(val))
            if a >= 2 and b >= 2:
                why += " Estimate check: about %d x %d = %d." % (round(a), round(b), round(a) * round(b))
            elif a < 1 and b < 1:
                why += " Size check: multiplying two numbers below 1 gives something smaller than both."
            elif a < 1 or b < 1:
                why += " Size check: multiplying %s by a number below 1 must shrink it." % fmt(max(a, b))
        else:
            why = "%s x %s: multiply %s x %s = %s and attach the zero from the %s, giving %s." % (fmt(a), fmt(b), fmt(a / 10 if a % 10 == 0 else a), fmt(b if a % 10 == 0 else b / 10), fmt(a * b / 10), fmt(a if a % 10 == 0 else b), fmt(val)) if (a % 10 == 0 or b % 10 == 0) else "%s x %s = %s." % (fmt(a), fmt(b), fmt(val))
    else:
        why = "%s divided by %s is about %s. Estimate first: %s is %s %s, so the quotient is %s 1." % (
            fmt(a), fmt(b), keytxt, fmt(a), "smaller than" if a < b else "larger than", fmt(b), "less than" if a < b else "more than")
        if a > b:
            why = "%s divided by %s is about %s. Estimate first: %s goes into %s roughly %d times, so only an answer near %d makes sense." % (
                fmt(a), fmt(b), keytxt, fmt(b), fmt(a), round(a / b), round(a / b))
    other = {"+": (a - b, "Subtracted instead of adding."), "-": (a + b, "Added instead of subtracting."),
             "x": (a + b, "Added instead of multiplying."), "/div/": (a * b, "Multiplied instead of dividing.")}[op]
    est = " A rough estimate (about %d) rules it out." % round(val) if abs(val) >= 2 else " Check the size against the numbers you started with."
    models = [
        (val * 10, "Decimal point one place too far right." + est),
        (val / 10, "Decimal point one place too far left." + est),
        (val * 100, "Decimal point two places too far right."),
        (val / 100, "Decimal point two places too far left."),
        other,
        (-val, "Right size, wrong sign."),
    ]
    if op in "+-":
        models += [(val + F(1, 10), "One tenth too high. Recheck the tenths column: the digits there give %s." % fmt(val)),
                   (val - F(1, 10), "One tenth too low. Recheck the tenths column: the digits there give %s." % fmt(val)),
                   (val + 1, "One whole too high. Recheck the ones column and any carry."),
                   (val - 1, "One whole too low. Recheck the ones column and any carry or borrow.")]
    if op == "x":
        models += [(val + F(1, 10), "Close, but the last digits are off. The exact product is %s." % fmt(val)),
                   (val - F(1, 10), "Close, but the last digits are off. The exact product is %s." % fmt(val))]
    if op == "/div/":
        models += [(b / a, "Divided the wrong way round: this is %s divided by %s." % (fmt(b), fmt(a)))]

    def fb(s, o):
        return "Not %s %s %s. The exact value is %s; this is off by %s." % (fmt(a), sym, fmt(b), keytxt if op == "/div/" else fmt(val), fmt(abs(o - val)))
    models2 = []
    for v, l in models:
        models2.append((v, l))
    return R(val, why, "Estimate with rounded numbers before you compute. The estimate catches a misplaced decimal point every time.",
             "qr.arithmetic.decimals", models2, fb)


# ---------- mental multiplication ----------
@family(r"^Mentally compute (\d+) x (\d+)\.$")
def fam_mental(m, it):
    a, b = int(m[1]), int(m[2])
    val = F(a * b)
    big, small = (a, b) if a >= b else (b, a)
    ones = big % 10
    if ones >= 8 and big > 10:
        up = big + (10 - ones)
        why = "Round %d up to %d and fix it afterward: %d x %d = %d, then take away %d x %d = %d. %d - %d = %d." % (big, up, up, small, up * small, 10 - ones, small, (10 - ones) * small, up * small, (10 - ones) * small, a * b)
        anchor = (up * small, "%d x %d" % (up, small))
    elif big >= 10 and ones != 0:
        tens = big - ones
        why = "Split %d into %d + %d: %d x %d = %d and %d x %d = %d. Add them: %d + %d = %d." % (big, tens, ones, tens, small, tens * small, ones, small, ones * small, tens * small, ones * small, a * b)
        anchor = (tens * small, "%d x %d" % (tens, small))
    else:
        why = "%d x %d = %d." % (a, b, a * b)
        anchor = (a * b, "%d x %d" % (a, b))
    models = [
        (val + 100, "One hundred too high. Anchor on %s = %d; the answer has to sit close to that." % (anchor[1], anchor[0])),
        (val - 100, "One hundred too low. Anchor on %s = %d; the answer has to sit close to that." % (anchor[1], anchor[0])),
        (val + 10, "Ten too high: the tens digit is off by one. Anchor on %s = %d and add the small piece carefully." % (anchor[1], anchor[0])),
        (val - 10, "Ten too low: the tens digit is off by one. Anchor on %s = %d and add the small piece carefully." % (anchor[1], anchor[0])),
    ]

    def fb(s, o):
        return "Off by %s. Anchor on %s = %d." % (fmt(abs(o - val)), anchor[1], anchor[0])
    return R(val, why, "Break one factor into a round number plus or minus a small piece, multiply each part, then combine.",
             "qr.arithmetic.mental-multiplication", models, fb)


# ---------- work rate ----------
@family(r"^A finishes a job in (\d+) hr, B in (\d+) hr\. Together\?$")
def fam_work(m, it):
    a, b = F(m[1]), F(m[2])
    val = a * b / (a + b)
    rate = 1 / a + 1 / b
    why = "Add rates, not times. In one hour the first worker does 1/%s of the job and the second does 1/%s, so together they do %s of it per hour. Time is the flip of that: %s hours, about %s." % (
        fmt(a), fmt(b), frac(rate), frac(val), norm(it["opts"][it["correct"]]))
    if val.denominator == 1:
        why = why.replace(", about %s." % norm(it["opts"][it["correct"]]), ".")
    lo, hi = min(a, b), max(a, b)
    models = [
        (a + b, "Added the two times. Working together has to be faster than either worker alone, so the answer must be under %s hours." % fmt(lo)),
        ((a + b) / 2, "Averaged the two times. Help can only shorten the job, so the answer must be under %s hours, the faster worker's solo time." % fmt(lo)),
        (lo, "This is the faster worker alone. A second worker makes it shorter than %s hours." % fmt(lo)),
        (hi, "This is the slower worker alone. Together they must beat even the faster worker's %s hours." % fmt(lo)),
        (rate, "This is the combined rate (jobs per hour), not the time. Flip it to get hours."),
        (hi - lo, "Subtracted the times. Rates get added: 1/%s + 1/%s." % (fmt(a), fmt(b))),
        (val / 2, "Half the true time. The combined rate is %s job per hour, so the time is %s hours." % (frac(rate), frac(val))),
        (lo / 2, "Halved the faster time, which would only be right if both workers were equally fast."),
    ]

    def fb(s, o):
        return "Not the flip of 1/%s + 1/%s. The combined rate is %s job per hour, so the time is %s hours." % (fmt(a), fmt(b), frac(rate), frac(val))
    return R(val, why, "Shortcut for two workers: time together = product over sum of the solo times. Sanity check: it must be less than the faster solo time.",
             "qr.rates.combined-work", models, fb)


# ---------- mixtures ----------
@family(r"^Mix (\d+)mL of (\d+)% with (\d+)mL of (\d+)%\. Final concentration\?$")
def fam_mix(m, it):
    v1, p1, v2, p2 = F(m[1]), F(m[2]), F(m[3]), F(m[4])
    sol = v1 * p1 / 100 + v2 * p2 / 100
    val = sol / (v1 + v2) * 100
    lo, hi = min(p1, p2), max(p1, p2)
    why = "Track the pure solute. %s mL at %s%% holds %s mL of it, and %s mL at %s%% holds %s mL: %s mL in all. Total volume is %s mL, so the concentration is %s / %s = %s%%. It lands closer to %s%% because there is more of that solution." % (
        fmt(v1), fmt(p1), fmt(v1 * p1 / 100), fmt(v2), fmt(p2), fmt(v2 * p2 / 100), fmt(sol), fmt(v1 + v2), fmt(sol), fmt(v1 + v2),
        norm(it["opts"][it["correct"]]), fmt(p1 if v1 > v2 else p2))
    models = [
        ((p1 + p2) / 2, "Plain average of the two percents. That only works for equal volumes; here the volumes are %s and %s mL." % (fmt(v1), fmt(v2))),
        (sol, "This is the mL of solute, not a percent. Divide by the total volume, %s mL." % fmt(v1 + v2)),
        (p1 + p2, "Added the two percents. A blend always lands between its two starting concentrations."),
        ((v2 * p1 + v1 * p2) / (v1 + v2), "Weights swapped: each percent was paired with the other solution's volume."),
    ]

    def fb(s, o):
        if o > hi or o < lo:
            return "Outside the possible range. A blend of %s%% and %s%% has to land between them." % (fmt(lo), fmt(hi))
        return "In range, but not weighted by volume: %s mL of solute in %s mL total is %s%%." % (fmt(sol), fmt(v1 + v2), norm(it["opts"][it["correct"]]))
    return R(val, why, "Mixtures are weighted averages: total solute over total volume. The answer must fall between the two starting percents, nearer the larger volume.",
             "qr.mixtures.weighted-average", models, fb)


# ---------- interest ----------
@family(r"^\$(\d+) at (\d+(?:\.\d+)?)% (simple|compound) for (\d+) years\. Final\?$")
def fam_int(m, it):
    P, r, kind, t = F(m[1]), F(m[2]) / 100, m[3], int(m[4])
    simple_final = P * (1 + r * t)
    comp_final = P * (1 + r) ** t
    rt = fmt(r * 100)
    if kind == "simple":
        val = simple_final
        why = "Simple interest pays the same amount every year, always on the original $%s. One year earns %s x %s = %s. Over %d years that is %s. Add the principal back: %s." % (
            fmt(P), fmt(P), fmt(r), money(P * r), t, money(P * r * t), money(val))
        models = [
            (P * r * t, "This is only the interest earned. The final balance adds the original $%s back." % fmt(P)),
            (P * (1 + r), "One year of interest only. The money sits for %d years." % t),
            (P + r * 100 * t / 100, "Added rate x time as a bare number. The interest is a percent of the $%s principal." % fmt(P)),
            (P + r * t, "Added rate x time as a bare number. The interest is a percent of the $%s principal." % fmt(P)),
            (P, "Unchanged principal: no interest was added at all."),
            (comp_final, "This is the compound-interest balance. Simple interest never earns interest on interest."),
        ]
        trick = "Simple interest: final = principal x (1 + rate x years). Check whether the question wants the interest or the final balance."
        skill = "qr.interest.simple"
    else:
        val = comp_final
        y1 = P * (1 + r)
        why = "Compound interest multiplies the balance by %s every year, so interest earns interest. After %d years: %s x %s^%d = %s. It must come out above the simple-interest figure of %s." % (
            fmt(1 + r), t, fmt(P), fmt(1 + r), t, norm(it["opts"][it["correct"]]), money(simple_final))
        models = [
            (simple_final, "This is simple interest: %s%% of the original, %d times. Compounding also pays interest on earlier interest, so the true balance is higher." % (rt, t)),
            (y1, "One year of growth only. The balance is multiplied by %s once per year for %d years." % (fmt(1 + r), t)),
            (P * r * t, "Interest only, and simple interest at that. The question asks for the final balance."),
            (P + r * 100 * t / 100, "Added rate x time as a bare number. Growth is a percent of the balance."),
            (P + r * t, "Added rate x time as a bare number. Growth is a percent of the balance."),
        ]
        trick = "Compound: multiply by (1 + rate) once per period. Simple interest is the floor; the compound answer is always a bit above it."
        skill = "qr.interest.compound"

    def fb(s, o):
        return "Does not match either interest formula. Expected %s." % norm(it["opts"][it["correct"]])
    return R(val, why, trick, skill, models, fb)


# ---------- unit conversion ----------
UNITS = {("kg", "g"): 1000, ("cm", "mm"): 10, ("L", "mL"): 1000, ("km", "m"): 1000, ("m", "cm"): 100, ("hr", "min"): 60, ("min", "sec"): 60}
UNAME = {"kg": "kilogram", "g": "gram", "cm": "centimeter", "mm": "millimeter", "L": "liter", "mL": "milliliter", "km": "kilometer", "m": "meter", "hr": "hour", "min": "minute", "sec": "second"}


@family(r"^(\d+(?:\.\d+)?) (kg|cm|L|km|m|hr|min) in (g|mm|mL|m|cm|min|sec)\?$")
def fam_units(m, it):
    x, u, v = F(m[1]), m[2], m[3]
    f = UNITS[(u, v)]
    val = x * f
    why = "One %s is %d %ss. Going to a smaller unit means more of them, so multiply: %s x %d = %s %s." % (UNAME[u], f, UNAME[v], fmt(x), f, fmt(val), v)
    models = [
        (x / f, "Divided by %d, which converts the other way. Smaller units mean a bigger number." % f),
        (x + f, "Added the conversion factor. Conversions multiply: %s x %d." % (fmt(x), f)),
        (x, "The number was copied without converting."),
    ]
    if f in (10, 100, 1000):
        models += [(val / 10, "Wrong power of ten: this uses %d per %s. The factor is %d." % (f // 10, UNAME[u], f)),
                   (val * 10, "Wrong power of ten: this uses %d per %s. The factor is %d." % (f * 10, UNAME[u], f)),
                   (val / 100, "Wrong power of ten. One %s is %d %ss." % (UNAME[u], f, UNAME[v]))]
    else:
        models += [(val / 10, "Used 6 instead of 60. There are 60 %ss in one %s." % (UNAME[v], UNAME[u])),
                   (x * 100, "Used 100 instead of 60. Time is not metric: 60 %ss per %s." % (UNAME[v], UNAME[u]))]

    def fb(s, o):
        if o == 0:
            return "A positive amount cannot convert to zero. Multiply %s by %d." % (fmt(x), f)
        if same(s, x / f):
            return "Divided by %d, which converts the other way. Smaller units mean a bigger number." % f
        return "Not %s x %d. One %s is %d %ss." % (fmt(x), f, UNAME[u], f, UNAME[v])
    return R(val, why, "Ask first: is the new unit smaller or bigger? Smaller unit, bigger number, so multiply.", "qr.units.conversion", models, fb)


# ---------- coin flips ----------
@family(r"^(\d+) fair coin flips\. P\((exactly one head|heads on every flip|at least one head)\)\?$")
def fam_flip(m, it):
    n, kind = int(m[1]), m[2]
    tot = 2 ** n
    all_h = F(1, tot)
    if kind == "exactly one head":
        val = F(n, tot)
        why = "There are 2^%d = %d equally likely sequences. Exactly one head means choosing which of the %d flips is the head: %d sequences. %d/%d = %s." % (n, tot, n, n, n, tot, norm(it["opts"][it["correct"]]))
        models = [
            (all_h, "This is the chance of one specific sequence. The single head can sit in any of %d positions, so multiply by %d." % (n, n)),
            (1 - val, "This is the complement: the chance of anything except exactly one head."),
            (1 - all_h, "This is the chance of at least one head, which also counts two or more heads."),
            (F(1, 2), "This is the chance of a head on a single flip, not exactly one head in %d flips." % n),
            (val / 2, "Half the true value: %d favorable sequences out of %d, not out of %d." % (n, tot, 2 * tot)),
            (val * 2, "Double the true value: %d favorable sequences out of %d." % (n, tot)),
            (F(n + 1, tot), "This counts %d favorable sequences; only %d have exactly one head." % (n + 1, n)),
        ]
        trick = "Exactly k heads: count the sequences that work, then divide by 2^n total."
    elif kind == "heads on every flip":
        val = all_h
        if not same(it["opts"][it["correct"]], val) or parse_num(it["opts"][it["correct"]]) == 0:
            raise Flag("precision", "Keyed answer is 0 for an event that can happen",
                       "P(all heads in %d flips) = 1/%d = %.4f. The key rounds it to 0, which states the event is impossible; a second option (0.01) is the nearest nonzero value." % (n, tot, float(val)))
        why = "Each flip is heads with probability 1/2, and the flips are independent, so multiply: (1/2)^%d = 1/%d = %s." % (n, tot, norm(it["opts"][it["correct"]]))
        models = [
            (1 - val, "This is the complement, the chance of at least one tail."),
            (F(1, 2 ** (n - 1)), "One factor of 1/2 short: this is the chance for %d flips, not %d." % (n - 1, n)),
            (F(1, 2 ** (n + 1)), "One factor of 1/2 too many: this is the chance for %d flips, not %d." % (n + 1, n)),
            (F(1, 2), "This is one flip. Every extra flip halves the chance again."),
            (F(n, tot), "This is the chance of exactly one head (there are %d ways to place it), not all heads." % n),
        ]
        trick = "A run of independent events: multiply the single-event probability once per event."
    else:
        val = 1 - all_h
        why = "At least one head is everything except all tails. P(all tails) = (1/2)^%d = 1/%d, so the answer is 1 - 1/%d = %d/%d = %s." % (n, tot, tot, tot - 1, tot, norm(it["opts"][it["correct"]]))
        models = [
            (all_h, "This is the chance of all tails (or all heads). Subtract it from 1."),
            (val / 2, "Half the true value. The complement is 1 - 1/%d, with nothing left to halve." % tot),
            (val * 2, "A probability can never be more than 1."),
            (F(1, 2), "This is one flip. More flips make at least one head far more likely."),
        ]
        trick = "At least one = 1 minus none. Compute the single 'none' case and subtract."

    def fb(s, o):
        if o > 1:
            return "A probability can never be more than 1."
        if o < 0:
            return "A probability can never be negative."
        return "Does not match the count over %d total sequences." % tot
    return R(val, why, trick, "qr.probability.coin-flips", models, fb)


# ---------- and / or ----------
@family(r"^(?:Independent )?events: P\(A\) = ([\d.]+), P\(B\) = ([\d.]+)(?:, P\(A and B\) = ([\d.]+))?\. P\(A (and|or) B\)\?$")
def fam_andor(m, it):
    a, b, kind = F(m[1]), F(m[2]), m[4]
    given = F(m[3]) if m[3] else None
    if given is not None and kind == "and":
        raise Flag("giveaway", "The stem states the answer", "P(A and B) = %s is given in the stem and then asked for. Nothing is tested." % fmt(given))
    if kind == "and":
        val = a * b
        why = "For independent events, 'and' means multiply: %s x %s = %s. Both must happen, so the result has to be smaller than either probability alone." % (fmt(a), fmt(b), fmt(val))
        models = [
            (a + b, "Added the probabilities. Adding is for 'or'; 'and' multiplies, and the result must be smaller than each one."),
            (a + b - a * b, "This is the 'or' probability. 'And' is just the product."),
            (abs(a - b), "Subtracted the probabilities. For independent events, 'and' means multiply."),
            (a - b, "Subtracted the probabilities. For independent events, 'and' means multiply."),
            (a, "This is the first event alone. Requiring the second event too can only shrink it."),
            (b, "This is the second event alone. Requiring the first event too can only shrink it."),
        ]
        trick = "And (independent) = multiply, and the answer shrinks. Or = add, then subtract the overlap."
        skill = "qr.probability.and-independent"
    else:
        ov = given if given is not None else a * b
        val = a + b - ov
        src = "given as %s" % fmt(ov) if given is not None else "%s x %s = %s for independent events" % (fmt(a), fmt(b), fmt(ov))
        why = "Add the two probabilities, then subtract the overlap so outcomes where both happen are not counted twice. The overlap is %s. So %s + %s - %s = %s." % (src, fmt(a), fmt(b), fmt(ov), fmt(val))
        models = [
            (a + b, "Added without subtracting the overlap, so outcomes where both happen were counted twice."),
            (a * b, "This is the product, the 'and' probability for independent events. 'Or' is larger than either event alone."),
            (ov, "This is the overlap, P(both). 'Or' is larger than either event alone."),
            (a + b + ov, "Added the overlap instead of subtracting it."),
            (abs(a - b), "Subtracted one probability from the other. 'Or' adds them and removes the overlap once."),
            (a - b, "Subtracted one probability from the other. 'Or' adds them and removes the overlap once."),
            (a, "This is the first event alone. 'Or' also includes outcomes where only the second happens."),
            (b, "This is the second event alone. 'Or' also includes outcomes where only the first happens."),
        ]
        trick = "Or: P(first) + P(second) - P(both). Skipping the subtraction double counts the overlap."
        skill = "qr.probability.or-inclusion-exclusion"

    def fb(s, o):
        if o < 0:
            return "A probability can never be negative."
        return "Does not follow from the two probabilities by the %s rule." % kind
    return R(val, why, trick, skill, models, fb)


# ---------- counting ----------
def nPr(n, r):
    return math.factorial(n) // math.factorial(n - r)


def nCr(n, r):
    return math.comb(n, r)


@family(r"^How many ways to (arrange|choose) (\d+) of (\d+) items (?:in order|\(no order\))\?$")
def fam_count(m, it):
    kind, r, n = m[1], int(m[2]), int(m[3])
    P, C = nPr(n, r), nCr(n, r)
    chain = " x ".join(str(n - i) for i in range(r))
    if kind == "arrange":
        val = F(P)
        why = "Order matters, so fill the %d positions one at a time: %s = %d. Each pick leaves one fewer item for the next position." % (r, chain, P)
        models = [(F(C), "This is the count when order does not matter. Here every ordering counts separately, so nothing gets divided out.")]
        trick = "Arrangement (order matters): multiply a falling chain, n x (n - 1) x ..., one factor per position."
        skill = "qr.counting.permutations"
    else:
        val = F(C)
        why = "Order does not matter. Start with the ordered count, %s = %d, then divide by the %d! = %d orderings of each group: %d / %d = %d." % (chain, P, r, math.factorial(r), P, math.factorial(r), C)
        models = [(F(P), "This counts ordered arrangements. A group is the same in any order, so divide by %d! = %d." % (r, math.factorial(r)))]
        trick = "Choosing (no order): ordered count divided by r!. Ask yourself whether swapping two picks makes a new outcome."
        skill = "qr.counting.combinations"
    models += [
        (F(n * r), "Multiplied %d by %d. Counting uses a falling chain of choices: %s." % (n, r, chain)),
        (F(n + r), "Added %d and %d. Counting stages multiply." % (n, r)),
        (F(n ** r), "This allows the same item to be picked again (%d choices every time). Without repeats the choices shrink: %s." % (n, chain)),
        (F(math.factorial(r)), "This is %d!, the number of ways to order %d items already chosen. It ignores that there are %d items to draw from." % (r, r, n)),
        (F(math.factorial(n)), "This is %d!, arranging all %d items. Only %d are used." % (n, n, r)),
    ]
    if r >= 2:
        models.append((F(nCr(n, r - 1)), "This is the number of ways to choose %d of %d, one item short." % (r - 1, n)))
        models.append((F(nPr(n, r - 1)), "This arranges only %d of the %d items, one position short." % (r - 1, n)))

    def fb(s, o):
        return "Does not come from the chain %s%s." % (chain, "" if kind == "arrange" else " divided by %d" % math.factorial(r))
    return R(val, why, trick, skill, models, fb)


# ---------- average speed, equal distances ----------
@family(r"^Driving 60 mi at (\d+) mph then 60 mi at (\d+) mph\. Average speed\?$")
def fam_harm(m, it):
    v1, v2 = F(m[1]), F(m[2])
    t1, t2 = 60 / v1, 60 / v2
    val = 120 / (t1 + t2)
    why = "Average speed is total distance over total time. The first 60 miles take 60/%s = %s hr and the second take 60/%s = %s hr. That is 120 miles in %s hr: 120 / %s = %s mph. It sits below %s because more time is spent at the slower speed." % (
        fmt(v1), fmt(t1), fmt(v2), fmt(t2), fmt(t1 + t2), fmt(t1 + t2), norm(it["opts"][it["correct"]]), fmt((v1 + v2) / 2))
    models = [
        ((v1 + v2) / 2, "Averaged the two speeds. That only works when equal time is spent at each; here the distances are equal, so the slow leg lasts longer and drags the average down."),
        (v1 + v2, "Added the speeds. An average must fall between %s and %s mph." % (fmt(min(v1, v2)), fmt(max(v1, v2)))),
        (v1 * v2, "Multiplied the speeds. An average must fall between %s and %s mph." % (fmt(min(v1, v2)), fmt(max(v1, v2)))),
        (min(v1, v2), "This is just the slower speed. The faster leg pulls the average above it."),
        (max(v1, v2), "This is just the faster speed. The slower leg pulls the average below it."),
    ]

    def fb(s, o):
        return "Not 120 miles divided by %s hours. Total distance over total time gives %s mph." % (fmt(t1 + t2), norm(it["opts"][it["correct"]]))
    return R(val, why, "Equal distances at two speeds: never average the speeds. Use total distance over total time (or 2ab / (a + b)).",
             "qr.rates.average-speed", models, fb)


# ---------- z-score ----------
@family(r"^μ = (\d+), σ = (\d+), x = (\d+)\. z\?$")
def fam_z(m, it):
    mu, sd, x = F(m[1]), F(m[2]), F(m[3])
    val = (x - mu) / sd
    side = "above" if x > mu else "below"
    why = "A z-score counts how many standard deviations a value sits from the mean. Distance from the mean: %s - %s = %s. Divide by the standard deviation: %s / %s = %s. The value is %s the mean, so z is %s." % (
        fmt(x), fmt(mu), fmt(x - mu), fmt(x - mu), fmt(sd), norm(it["opts"][it["correct"]]), side, "positive" if x > mu else "negative")
    models = [
        (x - mu, "This is the raw distance from the mean. Divide it by the standard deviation, %s." % fmt(sd)),
        (-val, "Sign flipped. The value is %s the mean, so z must be %s. Always compute value minus mean." % (side, "positive" if x > mu else "negative")),
        ((x - mu) / mu, "Divided by the mean (%s) instead of the standard deviation (%s)." % (fmt(mu), fmt(sd))),
        (sd / (x - mu), "Fraction upside down: this is the standard deviation over the distance."),
        ((x - mu) / 100, "Divided the distance by 100 instead of by the standard deviation, %s." % fmt(sd)),
        ((x - mu) / sd / 10, "Decimal point one place off. %s / %s = %s." % (fmt(x - mu), fmt(sd), norm(it["opts"][it["correct"]]))),
        (-(x - mu), "Raw distance with the sign flipped. Divide value minus mean by the standard deviation."),
    ]

    def fb(s, o):
        return "Not (%s - %s) / %s." % (fmt(x), fmt(mu), fmt(sd))
    return R(val, why, "z = (value - mean) / standard deviation. Check the sign against the picture: above the mean is positive.",
             "qr.statistics.z-score", models, fb)


# ---------- triangle inequality ----------
@family(r"^Sides (\d+), (\d+), (\d+): valid triangle\?$")
def fam_tri(m, it):
    s = sorted([int(m[1]), int(m[2]), int(m[3])])
    a, b, c = s
    ok = a + b > c and a > 0
    if a == 0:
        why = "A side of length 0 is not a side at all, and the test fails too: the two shorter sides must add to more than the longest, and 0 + %d = %d is only equal to %d." % (b, a + b, c)
    elif ok:
        why = "Three lengths close into a triangle only if the two shorter sides add to more than the longest. %d + %d = %d, which is greater than %d, so the triangle closes." % (a, b, a + b, c)
    elif a + b == c:
        why = "The two shorter sides must add to more than the longest. %d + %d = %d, exactly equal to the longest side, so the two short sides lie flat along it and never rise into a triangle." % (a, b, a + b)
    else:
        why = "The two shorter sides must add to more than the longest. %d + %d = %d, which falls short of %d, so the short sides cannot reach each other." % (a, b, a + b, c)
    key = "Yes" if ok else "No"
    if ok:
        wrong = "The test passes: %d + %d = %d is greater than %d. Only the two shortest sides against the longest need checking." % (a, b, a + b, c)
    elif a + b == c:
        wrong = "Equal is not enough. %d + %d = %d only ties the longest side, which gives a flat line, not a triangle." % (a, b, c)
    else:
        wrong = "Checked the wrong pair. Adding the longest side to anything always passes; the real test is the two shortest: %d + %d = %d, less than %d." % (a, b, a + b, c)
    sm = {
        "Yes": wrong, "No": wrong,
        "Only if right triangle": "Angle type is not the issue. Three lengths either close into a triangle or they do not, and the sum test decides it.",
        "Only if obtuse": "Angle type is not the issue. Three lengths either close into a triangle or they do not, and the sum test decides it.",
        "Cannot determine": "Three side lengths are all the information the test needs: compare the two shortest against the longest.",
    }
    return R(None, why, "Triangle test: add the two shortest sides. The sum must be strictly greater than the longest side.",
             "qr.geometry.triangle-inequality", strkey=key, strmodels=sm)


# ---------- volume / surface area ----------
PI = F(355, 113)  # only used for matching printed 2-dp options


def near(optstr, x):
    o = parse_num(optstr)
    return o is not None and abs(float(o) - x) < 0.006 + 1e-9


@family(r"^Cube with side (\d+)\. Find (volume|surface area)\.$")
def fam_cube(m, it):
    s, kind = int(m[1]), m[2]
    V, SA = s ** 3, 6 * s * s
    if kind == "volume":
        val = F(V)
        why = "Volume of a cube is side x side x side: %d x %d x %d = %d." % (s, s, s, V)
        models = [(F(SA), "This is the surface area, 6 faces of %d each. Volume is the side cubed." % (s * s)),
                  (F(s * s), "This is the area of one face. Volume needs a third factor of %d." % s),
                  (F(3 * s), "Multiplied the side by 3 instead of cubing it. Cubing means %d x %d x %d." % (s, s, s)),
                  (F(4 * s * s), "This is four faces' worth of area, not a volume."),
                  (F(V + 6), "Six more than the true volume. %d cubed is exactly %d." % (s, V)),
                  (F(V + SA), "Added the surface area to the volume."),
                  (F(s * s * (s - 1)), "This is %d x %d x %d, one unit short on the last factor." % (s, s, s - 1)),
                  (F(s * s * (s + 1)), "This is %d x %d x %d, one unit long on the last factor." % (s, s, s + 1))]
        trick, skill = "Volume fills space, so it uses three lengths multiplied. Area uses two.", "qr.geometry.volume-cube"
    else:
        val = F(SA)
        why = "A cube has 6 identical square faces. One face is %d x %d = %d, so the surface area is 6 x %d = %d." % (s, s, s * s, s * s, SA)
        models = [(F(V), "This is the volume, the side cubed. Surface area is 6 faces of %d each." % (s * s)),
                  (F(s * s), "This is one face. A cube has 6 of them."),
                  (F(4 * s * s), "Counted only 4 faces. Include the top and bottom: 6 in all."),
                  (F(V + 6), "This is the volume plus 6. Surface area is 6 x %d." % (s * s)),
                  (F(SA - 10), "Ten short of 6 x %d = %d." % (s * s, SA)),
                  (F(V + SA - s * s * s + s ** 3 - 19) if False else None, ""),
                  (F(2 * s * s), "Counted only 2 faces. A cube has 6."),
                  (F(12 * s), "This is the total edge length (12 edges of %d), not an area." % s)]
        trick, skill = "Surface area of a cube: one face squared, times 6.", "qr.geometry.surface-area-cube"

    def fb(st, o):
        return "Not %s. One face is %d, and the %s is %d." % ("%d cubed" % s if kind == "volume" else "6 x %d" % (s * s), s * s, kind, int(val))
    return R(val, why, trick, skill, [(v, l) for v, l in models if v is not None], fb)


@family(r"^Box: (\d+)x(\d+)x(\d+)\. Volume\?$")
def fam_box(m, it):
    l, w, h = int(m[1]), int(m[2]), int(m[3])
    val = F(l * w * h)
    why = "Volume of a box is length x width x height: %d x %d = %d, then x %d = %d." % (l, w, l * w, h, l * w * h)
    models = [(F(l + w + h), "Added the three sides. Volume multiplies them."),
              (F(2 * (l + w + h)), "Doubled the sum of the sides. Volume is the product %d x %d x %d." % (l, w, h)),
              (F(2 * (l * w + l * h + w * h)), "This is the surface area (all six faces). Volume is the product of the three sides."),
              (val / 2, "Half the true volume. Nothing gets halved for a box; that belongs to triangles."),
              (F(l * w), "Multiplied only two sides. This is one face's area."), (F(l * h), "Multiplied only two sides. This is one face's area."), (F(w * h), "Multiplied only two sides. This is one face's area.")]

    def fb(s, o):
        return "Not %d x %d x %d. Off by %s from the true volume, %d." % (l, w, h, fmt(abs(o - val)), int(val))
    return R(val, why, "Box volume: multiply all three dimensions. Multiply the two friendliest numbers first.", "qr.geometry.volume-box", models, fb)


@family(r"^(Sphere|Cylinder) r=(\d+)(?:, h=(\d+))?\. Volume\?$")
def fam_round(m, it):
    r = int(m[2])
    keytxt = norm(it["opts"][it["correct"]])
    if m[1] == "Sphere":
        v = 4 / 3 * math.pi * r ** 3
        why = "Volume of a sphere is (4/3) x pi x r cubed. r cubed is %d, times 4/3 is %s, times pi (about 3.14) is about %s." % (r ** 3, fmt(F(4 * r ** 3, 3)) if (4 * r ** 3) % 3 == 0 else "%.2f" % (4 * r ** 3 / 3), keytxt)
        cands = [(math.pi * r ** 3, "Left out the 4/3: this is pi x r cubed."),
                 (4 * math.pi * r * r, "This is the surface area formula, 4 x pi x r squared."),
                 (4 / 3 * math.pi * r * r, "Squared the radius instead of cubing it. Volume needs r cubed."),
                 (4 / 3 * r ** 3, "Left out pi."), (math.pi * r * r, "This is the area of a circle of radius %d." % r)]
        trick, skill = "Sphere volume is (4/3) pi r cubed. Cube the radius first, then deal with 4/3 and pi.", "qr.geometry.volume-sphere"
    else:
        h = int(m[3])
        v = math.pi * r * r * h
        why = "A cylinder is a circle stacked through a height: volume = pi x r squared x h. r squared is %d, times h = %d gives %d, times pi (about 3.14) is about %s." % (r * r, h, r * r * h, keytxt)
        cands = [(2 * math.pi * r * h, "This is the side (lateral) area, 2 x pi x r x h. Volume uses pi x r squared x h."),
                 (math.pi * r * h, "The radius was not squared: this is pi x r x h."),
                 (r * r * h, "Left out pi: this is just r squared x h."),
                 (math.pi * r * h * h, "Squared the height instead of the radius."),
                 (math.pi * r * r, "This is the area of the circular base only. Multiply by the height."),
                 (2 * math.pi * r * r * h, "Double the true volume.")]
        trick, skill = "Cylinder volume = base area x height = pi r squared h. Square only the radius.", "qr.geometry.volume-cylinder"
    if not near(it["opts"][it["correct"]], v):
        raise Flag("key", "computed volume does not match key", "computed %.2f" % v)
    res = R(None, why, trick, skill)
    res.near = (v, cands)
    return res


# ---------- slope ----------
@family(r"^Slope from \((-?\d+),(-?\d+)\) to \((-?\d+),(-?\d+)\)\?$")
def fam_slope(m, it):
    x1, y1, x2, y2 = int(m[1]), int(m[2]), int(m[3]), int(m[4])
    rise, run = y2 - y1, x2 - x1
    val = F(rise, run)
    why = "Slope is rise over run: change in y divided by change in x, subtracting in the same order. Rise: %d - (%d) = %d. Run: %d - (%d) = %d. Slope = %d / %d = %s." % (
        y2, y1, rise, x2, x1, run, rise, run, norm(it["opts"][it["correct"]]))
    models = [
        (-val, "Sign error. Subtract in the same order on top and bottom: rise %d, run %d. The line goes %s from left to right." % (rise, run, "up" if val > 0 else "down")),
        (F(run, rise) if rise else None, "Upside down: this is run over rise. Slope puts the change in y on top."),
        (-F(run, rise) if rise else None, "Upside down and wrong sign: this is the slope of a perpendicular line."),
        (F(rise), "This is only the rise. Divide it by the run, %d." % run),
        (F(run), "This is only the run. Slope is rise (%d) over run." % rise),
        (F(-rise), "This is the rise with the wrong sign, and it was never divided by the run."),
        (F(-run), "This is the run with the wrong sign. Slope is rise over run."),
        (F(y2 + y1, x2 + x1) if x2 + x1 else None, "Added the coordinates instead of subtracting them."),
        (F(y2 + y1, run), "Added the y values instead of subtracting them."),
        (F(rise + run), "Added the rise and the run. Slope divides them: %d / %d." % (rise, run)),
        (F(rise - run), "Subtracted the run from the rise. Slope divides them: %d / %d." % (rise, run)),
        (F(rise * run), "Multiplied the rise by the run. Slope divides them: %d / %d." % (rise, run)),
        (F(y2), "This is just a y coordinate, not a slope."), (F(y1), "This is just a y coordinate, not a slope."),
        (F(x2), "This is just an x coordinate, not a slope."), (F(x1), "This is just an x coordinate, not a slope."),
    ]

    def fb(s, o):
        return "Not %d / %d. Rise is %d and run is %d." % (rise, run, rise, run)
    return R(val, why, "Slope = (y2 - y1) / (x2 - x1). Keep the same point first on top and bottom, and y always goes on top.",
             "qr.coordinate.slope", [(v, l) for v, l in models if v is not None], fb)


# ---------- Bayes ----------
@family(r"^Disease prevalence (\d+)%, test sensitivity (\d+)%, specificity (\d+)%\. P\(disease \| positive test\)\?$")
def fam_bayes(m, it):
    prev, sens, spec = F(m[1]) / 100, F(m[2]) / 100, F(m[3]) / 100
    tp = prev * sens
    fp = (1 - prev) * (1 - spec)
    val = tp / (tp + fp)
    N = 10000
    why = ("Picture %d people. %s have the disease and %s of them test positive (sensitivity). %s are healthy, and %s of those test positive anyway (1 minus specificity). "
           "Positives total %s, and only %s are real: %s / %s = %s. Healthy people so outnumber sick ones that false positives pile up." % (
               N, fmt(prev * N), fmt(tp * N), fmt((1 - prev) * N), fmt(fp * N), fmt((tp + fp) * N), fmt(tp * N), fmt(tp * N), fmt((tp + fp) * N), norm(it["opts"][it["correct"]])))
    models = [
        (sens, "This is the sensitivity, P(positive given disease). The question asks the reverse: P(disease given positive)."),
        (spec, "This is the specificity, P(negative given healthy). It is an input, not the answer."),
        (prev, "This is the prevalence, the chance before any test. A positive result has to raise it."),
        (1 - spec, "This is the false positive rate among healthy people, not the chance a positive is real."),
        (tp, "This is the share of all people who are true positives. Divide by all positives, true and false."),
    ]

    def fb(s, o):
        return "Not true positives over all positives. Out of %d people that is %s / %s." % (N, fmt(tp * N), fmt((tp + fp) * N))
    return R(val, why, "For 'given a positive test' questions, imagine 10,000 people, count true positives and false positives, and divide true by total.",
             "qr.probability.conditional-bayes", models, fb)


# ---------- discriminant ----------
@family(r"^For (-?\d+)x² ([+-]) (\d+)x ([+-]) (\d+) = 0, how many real roots\?$")
def fam_discr(m, it):
    a, b, c = int(m[1]), (1 if m[2] == "+" else -1) * int(m[3]), (1 if m[4] == "+" else -1) * int(m[5])
    D = b * b - 4 * a * c
    if D < 0:
        raise Flag("two", "Two options describe the same situation",
                   "Discriminant = %d, which is negative. 'no real roots' (keyed) and 'two imaginary roots' are both true descriptions of a negative discriminant, so a student who knows the material can defend either." % D)
    calc = "(%d)^2 - 4(%d)(%d) = %d %s %d = %d" % (b, a, c, b * b, "-" if a * c >= 0 else "+", abs(4 * a * c), D)
    if D > 0:
        key = "two real roots"
        why = "The discriminant b^2 - 4ac tells you how many real roots a quadratic has. Here a = %d, b = %d, c = %d: %s. A positive discriminant means the parabola crosses the x-axis twice." % (a, b, c, calc)
    else:
        key = "one real root"
        why = "The discriminant b^2 - 4ac tells you how many real roots a quadratic has. Here a = %d, b = %d, c = %d: %s. A discriminant of exactly 0 means the parabola just touches the x-axis at one point." % (a, b, c, calc)
    sm = {
        "two real roots": "That needs a positive discriminant. Here it is exactly %d." % D,
        "one real root": "That needs a discriminant of exactly 0. Here it is %d." % D,
        "no real roots": "That needs a negative discriminant. Here it is %d%s." % (D, ". Watch the sign of -4ac when a and c have opposite signs" if a * c < 0 else ""),
        "two imaginary roots": "Imaginary roots appear only when the discriminant is negative. Here it is %d." % D,
    }
    return R(None, why, "Compute b^2 - 4ac before anything else: positive means 2 real roots, zero means 1, negative means none.",
             "qr.algebra.discriminant", strkey=key, strmodels=sm)


# ---------- exponent rules ----------
@family(r"^Simplify: (\d+)\^(\d+) (x|/div/) (\d+)\^(\d+)\.$")
def fam_exp(m, it):
    b, e1, op, b2, e2 = int(m[1]), int(m[2]), m[3], int(m[4]), int(m[5])
    assert b == b2
    k = e1 + e2 if op == "x" else e1 - e2
    val = F(b) ** k
    keytxt = norm(it["opts"][it["correct"]])
    if op == "x":
        why = "Same base, multiplying: add the exponents. %d^%d x %d^%d = %d^%d = %s. It works because you are just counting factors of %d: %d of them, then %d more." % (b, e1, b, e2, b, k, keytxt, b, e1, e2)
        models = [(F(b) ** (e1 * e2), "Multiplied the exponents (%d x %d). That rule is for a power raised to a power. Multiplying same bases adds exponents." % (e1, e2)),
                  (F(b) ** (e1 - e2), "Subtracted the exponents. That is the rule for dividing same bases."),
                  (F(b ** e1 + b ** e2), "Added the two values (%d + %d). The sign between them is times." % (b ** e1, b ** e2))]
    else:
        why = "Same base, dividing: subtract the exponents. %d^%d / %d^%d = %d^%d = %s." % (b, e1, b, e2, b, k, keytxt)
        if k < 0:
            why += " A negative exponent means one over: 1/%d." % (b ** -k)
        if k == 0:
            why += " Anything nonzero divided by itself is 1, which is why a zero exponent gives 1."
        models = [(F(b) ** (e1 + e2), "Added the exponents. That is the rule for multiplying same bases; dividing subtracts."),
                  (F(b) ** (e1 * e2), "Multiplied the exponents (%d x %d). That rule is for a power raised to a power." % (e1, e2)),
                  (F(b ** e1 + b ** e2), "Added the two values (%d + %d). The sign between them is divide." % (b ** e1, b ** e2)),
                  (F(b) ** (e2 - e1), "Subtracted the exponents in the wrong order: top exponent minus bottom exponent.")]
        if k == 0:
            models.append((F(0), "The exponents cancel to 0, but %d^0 is 1, not 0." % b))
    models += [(F(b) ** (k - 1), "One factor of %d short: this is %d^%d." % (b, b, k - 1)),
               (F(b) ** (k + 1), "One factor of %d too many: this is %d^%d." % (b, b, k + 1)),
               (F(1), "This would be %d^0. The combined exponent here is %d." % (b, k)),
               (F(b), "This is %d^1. The combined exponent here is %d." % (b, k)),
               (F(b * k), "Multiplied the base by the exponent (%d x %d). An exponent means repeated multiplication." % (b, k))]

    def fb(s, o):
        return "Not %d^%d. The combined exponent is %d, which gives %s." % (b, k, k, keytxt)
    return R(val, why, "Same base: multiply means add exponents, divide means subtract exponents.", "qr.exponents.product-quotient-rules", models, fb)


# ---------- absolute value ----------
@family(r"^\|(\d+)\| = \?$")
def fam_abs(m, it):
    n = int(m[1])
    val = F(n)
    why = "Absolute value is distance from zero on the number line. %d is %d units from zero, so |%d| = %d. For a positive number nothing changes." % (n, n, n, n)
    models = [(F(-n), "Absolute value is a distance, so it is never negative. The bars do not flip a positive number."),
              (F(2 * n), "Doubled the number. The bars only strip a negative sign; they never change the size.")]

    def fb(s, o):
        return "The bars leave a positive number exactly as it is: %d, not %s." % (n, s)
    return R(val, why, "Absolute value = distance from zero. Positive stays, negative loses its sign.", "qr.algebra.absolute-value", models, fb)


@family(r"^Solve: \|x - (\d+)\| = (\d+)$")
def fam_abs_solve(m, it):
    a, b = int(m[1]), int(m[2])
    for o in it["opts"]:
        if "±" in o:
            raise Flag("two", "Two options state the same solution set",
                       "|x - %d| = %d gives x = %d or x = %d. The keyed option lists those two values and another option writes the same pair as '%d ± %d'." % (a, b, a + b, a - b, a, b))
    key = "%d or %d" % (a + b, a - b)
    why = "|x - %d| = %d says x is %d units away from %d on the number line. Go %d to the right: %d. Go %d to the left: %d. Both work." % (a, b, b, a, b, a + b, b, a - b)
    sm = {
        "%d" % (a + b): "Only the positive case. The expression inside the bars can also equal -%d, which gives x = %d." % (b, a - b),
        "-%d or %d" % (a + b, a - b): "Sign slip on the first solution: x - %d = %d gives x = %d, not -%d." % (a, b, a + b, a + b),
        "-%d or %d" % (a - b, a - b): "These are the solutions of |x| = %d. The center here is %d, not 0." % (abs(a - b), a),
        "%d or -%d" % (a + b, a - b): "Sign slip on the second solution: x - %d = -%d gives x = %d, not -%d." % (a, b, a - b, a - b),
    }
    return R(None, why, "Read |x - a| = b as 'x is b away from a': the answers are a + b and a - b.", "qr.algebra.absolute-value-equation", strkey=key, strmodels=sm)


@family(r"^In a (\d+):(\d+) ratio totaling (\d+), what's the smaller part\?$")
def fam_ratio_equal(m, it):
    a, b = int(m[1]), int(m[2])
    if a == b:
        raise Flag("stem", "Stem asks for 'the smaller part' of two equal parts",
                   "A %d:%d ratio splits the total into two equal parts, so there is no smaller part. The keyed value (half the total) is the size of each part, but the question as worded has no answer." % (a, b))
    return None


# ---------- driver ----------
def solve(it):
    q = norm(it["q"])
    for rx, fn in FAMILIES:
        m = rx.match(q)
        if m:
            return fn(m, it)
    return None


def build(it):
    """Return dict(why, traps, trick, skill) or raise Flag, or None if no family."""
    res = solve(it)
    if res is None:
        return None
    opts, k = it["opts"], it["correct"]
    traps = [None] * len(opts)
    unmatched = []
    if getattr(res, "near", None):
        v, cands = res.near
        for i, o in enumerate(opts):
            if i == k:
                continue
            if near(o, v):
                raise Flag("two", "Two options equal the computed answer", "%s and %s" % (opts[k], o))
            for cv, line in cands:
                if near(o, cv):
                    traps[i] = line
                    break
            else:
                unmatched.append(o)
                traps[i] = "Does not come from the formula. The correct setup gives about %s." % norm(opts[k])
    elif res.val is None:
        if norm(opts[k]) != res.strkey:
            raise Flag("key", "Recomputed answer disagrees with the key", "computed '%s', keyed '%s'" % (res.strkey, opts[k]))
        for i, o in enumerate(opts):
            if i == k:
                continue
            line = res.strmodels.get(norm(o))
            if line is None:
                unmatched.append(o)
                continue
            traps[i] = line
    else:
        if not same(opts[k], res.val):
            raise Flag("key", "Recomputed answer disagrees with the key", "computed %s, keyed '%s'" % (frac(res.val), opts[k]))
        for i, o in enumerate(opts):
            if i == k:
                continue
            ov = parse_num(o)
            if ov is None:
                unmatched.append(o)
                continue
            if ov == res.val:
                raise Flag("two", "Two options have the same value as the answer",
                           "Keyed '%s' and option '%s' are equal in value (the second is just not reduced). A student who does not reduce is marked wrong for a correct result." % (opts[k], o))
            line = None
            for mv, ml in res.models:
                if mv is not None and (ov == mv or same(o, mv)):
                    line = ml
                    break
            if line is None:
                line = res.fallback(norm(o), ov)
                unmatched.append(o)
            traps[i] = line
    if any(traps[i] is None for i in range(len(opts)) if i != k):
        raise Flag("internal", "unmatched string option", repr(unmatched))
    return {"why": res.why, "traps": traps, "trick": res.trick, "skill": res.skill, "_fallbacks": len(unmatched)}


def main():
    # Work from origin/main so the run is repeatable after explanations are applied.
    import subprocess
    raw = subprocess.run(["git", "-C", ROOT, "show", "origin/main:games/qr.json"], capture_output=True, check=True).stdout.decode("utf-8")
    bank = json.loads(raw)
    out, flags, nofam = {}, [], []
    fb_total = trap_total = 0
    for it in bank:
        if it.get("why"):
            continue
        try:
            r = build(it)
        except Flag as f:
            flags.append({"id": it["id"], "kind": f.kind, "q": it["q"], "opts": it["opts"], "correct": it["correct"], "problem": f.problem, "reasoning": f.reasoning})
            continue
        if r is None:
            nofam.append(it["id"])
            continue
        fb_total += r.pop("_fallbacks")
        trap_total += len(it["opts"]) - 1
        out[it["id"]] = r
    os.makedirs(DATA, exist_ok=True)
    json.dump(out, open(os.path.join(DATA, "qr-generated.json"), "w"), ensure_ascii=False, indent=1)
    json.dump(flags, open(os.path.join(DATA, "qr-generated-flags.json"), "w"), ensure_ascii=False, indent=1)
    json.dump(nofam, open(os.path.join(DATA, "qr-no-family.json"), "w"), indent=0)
    print("generated", len(out), "flags", len(flags), "no family", len(nofam))
    print("trap lines", trap_total, "of which generic check lines", fb_total)
    from collections import Counter
    print(Counter(f["kind"] for f in flags))
    if "-v" in sys.argv:
        for f in flags:
            print(f["id"], f["kind"], f["q"], f["opts"], f["correct"], "|", f["reasoning"])


if __name__ == "__main__":
    main()
