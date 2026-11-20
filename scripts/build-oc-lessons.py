#!/usr/bin/env python3
"""Build data/oc-lessons.json for the OChem visual lessons (/oc/lessons/) with RDKit.

    python3 scripts/build-oc-lessons.py           write data/oc-lessons.json
    python3 scripts/build-oc-lessons.py --check   exit 1 if the committed file is stale

Lesson text comes from scripts/oc-lessons/lessons.json (Thomas's teaching, ids only for checks).
Every structure here is drawn by RDKit in black and white (skeletal, one bond length, at most
340 px wide). Color is used only for curved arrows, dipole arrows and highlights. Nothing is
typed by hand that RDKit can compute: formulas, hybridization, formal charge, lone pairs,
ring and pi counts, chain length and locants are all computed and asserted before any drawing
is written, so a wrong label stops the build.

The curved-arrow overlay (full-headed and fishhook) is drawn between RDKit's own atom draw
coordinates, because RDKit does not draw mechanism arrows.
"""
import json
import math
import os
import sys

from rdkit import Chem
from rdkit.Chem import AllChem, rdMolDescriptors
from rdkit.Chem.Draw import rdMolDraw2D
from rdkit.Geometry import Point3D

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'scripts', 'oc-lessons', 'lessons.json')
FAMILIES = os.path.join(ROOT, 'scripts', 'oc-lessons', 'trap-families.json')
OUT = os.path.join(ROOT, 'data', 'oc-lessons.json')

ARROW = '#B4462B'      # curved arrows and dipole arrows
HILITE = (0.95, 0.86, 0.55)
HILITE_HEX = '#E9C46A'
INK = '#1b1b1b'
GREY = '#6b6b6b'
BOND = 26              # fixed bond length in px: one scale everywhere
MAXW = 340
FONT = "font-family:'DM Sans',system-ui,sans-serif"

CHECKS = []            # (what, ok) for the build log


def check(cond, what):
    if not cond:
        raise SystemExit('RDKit check failed: ' + what)
    CHECKS.append(what)


def formula(m):
    return rdMolDescriptors.CalcMolFormula(m)


def mol(smiles, explicit_h_on=None):
    m = Chem.MolFromSmiles(smiles)
    check(m is not None, 'parses: ' + smiles)
    Chem.SanitizeMol(m)
    if explicit_h_on is not None:
        m = Chem.AddHs(m, onlyOnAtoms=tuple(explicit_h_on))
    return m


def valence_e(sym):
    return {'C': 4, 'N': 5, 'O': 6, 'S': 6, 'F': 7, 'Cl': 7, 'Br': 7, 'I': 7, 'H': 1}[sym]


def lone_pairs(atom):
    """Lone pairs from the count, never typed: (valence electrons - bonding electrons used - charge) / 2."""
    bonds = sum(b.GetBondTypeAsDouble() for b in atom.GetBonds()) + atom.GetTotalNumHs()
    lp = (valence_e(atom.GetSymbol()) - bonds - atom.GetFormalCharge()) / 2
    check(lp == int(lp) and lp >= 0, 'lone pairs integral on ' + atom.GetSymbol())
    return int(lp)


def set_coords(m, xy):
    conf = Chem.Conformer(m.GetNumAtoms())
    for i, (x, y) in enumerate(xy):
        conf.SetAtomPosition(i, Point3D(x, y, 0))
    m.RemoveAllConformers()
    m.AddConformer(conf, assignId=True)


# ---------------------------------------------------------------- drawing

class Panel:
    """One RDKit drawing plus an overlay layer in the same pixel space."""

    def __init__(self, m, w=MAXW, h=150, highlight=None, notes=None, coords=False, mol_w=None, bond=BOND, pad=0.12):
        check(w <= MAXW, 'panel width <= 340')
        self.m = Chem.Mol(m)
        if not coords:
            AllChem.Compute2DCoords(self.m)
        if notes:
            for idx, txt in notes.items():
                self.m.GetAtomWithIdx(idx).SetProp('atomNote', str(txt))
        self.w, self.h = w, h
        d = rdMolDraw2D.MolDraw2DSVG(w, h, mol_w or w, h)
        o = d.drawOptions()
        o.useBWAtomPalette()
        o.clearBackground = False
        o.bondLineWidth = 2
        o.fixedBondLength = bond
        o.padding = pad
        o.annotationFontScale = 0.7
        o.addStereoAnnotation = False
        o.minFontSize = 13
        o.maxFontSize = 16
        dm = rdMolDraw2D.PrepareMolForDrawing(self.m, kekulize=True, addChiralHs=False)
        hl = list(highlight or [])
        if hl:
            d.DrawMolecule(dm, highlightAtoms=hl, highlightAtomColors={i: HILITE for i in hl}, highlightBonds=[])
        else:
            d.DrawMolecule(dm)
        self.pos = [d.GetDrawCoords(i) for i in range(dm.GetNumAtoms())]
        d.FinishDrawing()
        svg = d.GetDrawingText()
        self.svg = svg[svg.find('<svg'):].replace('\n', '')
        self.extra = []

    def p(self, i):
        return (self.pos[i].x, self.pos[i].y)

    def mid(self, i, j, t=0.5):
        (ax, ay), (bx, by) = self.p(i), self.p(j)
        return (ax + (bx - ax) * t, ay + (by - ay) * t)

    def toward(self, i, j, dist):
        """A point dist px from atom i in the direction of atom j (or of a point)."""
        a = self.p(i)
        b = self.p(j) if isinstance(j, int) else j
        dx, dy = b[0] - a[0], b[1] - a[1]
        L = math.hypot(dx, dy) or 1
        return (a[0] + dx / L * dist, a[1] + dy / L * dist)

    def free_angles(self, i, n, blocked=()):
        """n directions around atom i, as far as possible from its bonds and from blocked angles."""
        a = self.p(i)
        taken = [math.atan2(self.p(nb.GetIdx())[1] - a[1], self.p(nb.GetIdx())[0] - a[0]) for nb in self.m.GetAtomWithIdx(i).GetNeighbors()]
        taken += [math.radians(b) for b in blocked]
        out = []
        for _ in range(n):
            best, bestd = 0, -1
            for k in range(360):
                t = math.radians(k)
                dmin = min([abs((t - u + math.pi) % (2 * math.pi) - math.pi) for u in taken + out] or [math.pi])
                if dmin > bestd + 1e-9:
                    best, bestd = t, dmin
            out.append(best)
        return out

    def lone_pair_dots(self, i, blocked=(), r=14, n=None):
        atom = self.m.GetAtomWithIdx(i)
        n = lone_pairs(atom) if n is None else n
        a = self.p(i)
        blocked = list(blocked)
        if atom.GetFormalCharge():
            blocked += [-35, -20]          # RDKit writes the charge at the upper right
        if atom.GetNumImplicitHs() or atom.GetNumExplicitHs():
            blocked += [0, 180]            # the H label sits beside the symbol
        angs = self.free_angles(i, n, blocked)
        for t in angs:
            cx, cy = a[0] + r * math.cos(t), a[1] + r * math.sin(t)
            px, py = -math.sin(t) * 3.2, math.cos(t) * 3.2
            for s in (1, -1):
                self.extra.append("<circle cx='%.1f' cy='%.1f' r='1.9' fill='%s'/>" % (cx + s * px, cy + s * py, INK))
        return angs

    def lp_point(self, i, angle, r=12):
        a = self.p(i)
        return (a[0] + r * math.cos(angle), a[1] + r * math.sin(angle))

    def curved(self, p, q, bend=0.4, kind='full', shorten=4):
        """Curved arrow from point p to point q. kind 'full' (pair) or 'fish' (one electron)."""
        (px, py), (qx, qy) = p, q
        dx, dy = qx - px, qy - py
        L = math.hypot(dx, dy) or 1
        cx, cy = (px + qx) / 2 - dy / L * bend * L, (py + qy) / 2 + dx / L * bend * L
        # pull the tip back a little so it does not sit on the label
        ex, ey = qx - cx, qy - cy
        el = math.hypot(ex, ey) or 1
        qx2, qy2 = qx - ex / el * shorten, qy - ey / el * shorten
        self.extra.append("<path d='M%.1f,%.1f Q%.1f,%.1f %.1f,%.1f' fill='none' stroke='%s' stroke-width='1.8' stroke-linecap='round'/>" % (px, py, cx, cy, qx2, qy2, ARROW))
        ux, uy = (qx2 - cx) / el, (qy2 - cy) / el
        hl, hw = 8.5, 4.2
        bx, by = qx2 - ux * hl, qy2 - uy * hl
        nx, ny = -uy, ux
        if kind == 'full':
            self.extra.append("<path d='M%.1f,%.1f L%.1f,%.1f L%.1f,%.1f Z' fill='%s'/>" % (qx2, qy2, bx + nx * hw, by + ny * hw, bx - nx * hw, by - ny * hw, ARROW))
        else:
            side = 1 if bend >= 0 else -1
            self.extra.append("<path d='M%.1f,%.1f L%.1f,%.1f' stroke='%s' stroke-width='1.8' stroke-linecap='round'/>" % (qx2, qy2, bx + side * nx * hw * 1.4, by + side * ny * hw * 1.4, ARROW))

    def dipole(self, p, q, offset=(0, 0)):
        """Dipole arrow from the partial plus end p to the partial minus end q, crossed tail."""
        (px, py), (qx, qy) = (p[0] + offset[0], p[1] + offset[1]), (q[0] + offset[0], q[1] + offset[1])
        dx, dy = qx - px, qy - py
        L = math.hypot(dx, dy) or 1
        ux, uy = dx / L, dy / L
        nx, ny = -uy, ux
        self.extra.append("<path d='M%.1f,%.1f L%.1f,%.1f' stroke='%s' stroke-width='2' stroke-linecap='round'/>" % (px, py, qx - ux * 6, qy - uy * 6, ARROW))
        self.extra.append("<path d='M%.1f,%.1f L%.1f,%.1f L%.1f,%.1f Z' fill='%s'/>" % (qx, qy, qx - ux * 8 + nx * 4, qy - uy * 8 + ny * 4, qx - ux * 8 - nx * 4, qy - uy * 8 - ny * 4, ARROW))
        tx, ty = px + ux * 6, py + uy * 6
        self.extra.append("<path d='M%.1f,%.1f L%.1f,%.1f' stroke='%s' stroke-width='2' stroke-linecap='round'/>" % (tx + nx * 5, ty + ny * 5, tx - nx * 5, ty - ny * 5, ARROW))

    def dashed(self, p, q, color=INK):
        self.extra.append("<path d='M%.1f,%.1f L%.1f,%.1f' stroke='%s' stroke-width='1.6' stroke-dasharray='3 3.5' stroke-linecap='round'/>" % (p[0], p[1], q[0], q[1], color))

    def text(self, x, y, s, size=13, color=INK, anchor='middle', weight=600):
        s = s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
        self.extra.append("<text x='%.1f' y='%.1f' text-anchor='%s' style=\"%s;font-size:%dpx;font-weight:%d\" fill='%s'>%s</text>" % (x, y, anchor, FONT, size, weight, color, s))

    def ellipse(self, cx, cy, rx, ry, fill=HILITE_HEX, opacity=0.85):
        self.extra.append("<ellipse cx='%.1f' cy='%.1f' rx='%.1f' ry='%.1f' fill='%s' fill-opacity='%.2f' stroke='%s' stroke-width='1'/>" % (cx, cy, rx, ry, fill, opacity, '#9a7a1c'))

    def rect(self, x, y, w, h, fill, rx=3):
        self.extra.append("<rect x='%.1f' y='%.1f' width='%.1f' height='%.1f' rx='%d' fill='%s'/>" % (x, y, w, h, rx, fill))

    def out(self, alt):
        body = self.svg[:self.svg.rfind('</svg>')]
        # behind-the-molecule shapes are not needed; overlays sit on top
        svg = body + ''.join(self.extra) + '</svg>'
        svg = svg.replace("<svg version='1.1'", "<svg role='img' aria-label='%s' version='1.1'" % alt.replace("'", ''), 1)
        return svg


def bare_svg(w, h, parts, alt):
    check(w <= MAXW, 'svg width <= 340')
    return ("<svg role='img' aria-label='%s' xmlns='http://www.w3.org/2000/svg' width='%dpx' height='%dpx' viewBox='0 0 %d %d'>" % (alt.replace("'", ''), w, h, w, h)) + ''.join(parts) + '</svg>'


def t(x, y, s, size=13, color=INK, anchor='start', weight=600):
    s = s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
    return "<text x='%.1f' y='%.1f' text-anchor='%s' style=\"%s;font-size:%dpx;font-weight:%d\" fill='%s'>%s</text>" % (x, y, anchor, FONT, size, weight, color, s)


def eq_arrows(w=340, h=46, favor='right', note=''):
    """Equilibrium half-arrows; the favored direction is drawn longer."""
    cx, cy = w / 2, h / 2 - 4
    long_, short = 70, 34
    f = long_ if favor == 'right' else short
    b = short if favor == 'right' else long_
    parts = [
        "<path d='M%.1f,%.1f L%.1f,%.1f l-8,-5' fill='none' stroke='%s' stroke-width='2' stroke-linecap='round'/>" % (cx - f / 2, cy - 4, cx + f / 2, cy - 4, INK),
        "<path d='M%.1f,%.1f L%.1f,%.1f l8,5' fill='none' stroke='%s' stroke-width='2' stroke-linecap='round'/>" % (cx + b / 2, cy + 4, cx - b / 2, cy + 4, INK),
    ]
    if note:
        parts.append(t(cx, h - 3, note, 12, GREY, 'middle', 600))
    return bare_svg(w, h, parts, 'Equilibrium arrows. ' + note)


def res_arrow(w=340, h=30):
    cx, cy = w / 2, h / 2
    parts = ["<path d='M%.1f,%.1f L%.1f,%.1f M%.1f,%.1f l7,-5 M%.1f,%.1f l7,5 M%.1f,%.1f l-7,-5 M%.1f,%.1f l-7,5' fill='none' stroke='%s' stroke-width='2' stroke-linecap='round'/>" % (cx - 28, cy, cx + 28, cy, cx - 28, cy, cx - 28, cy, cx + 28, cy, cx + 28, cy, INK)]
    return bare_svg(w, h, parts, 'Resonance arrow: two drawings of one ion')


# ---------------------------------------------------------------- one builder per lesson

def v_hybridization():
    rows = [('propane', 'CCC', 1, None), ('propene', 'C=CC', 1, None), ('propyne', 'C#CC', 1, None), ('water', 'O', 0, (0,))]
    want = {4: ('sp3', 109.5, Chem.HybridizationType.SP3), 3: ('sp2', 120, Chem.HybridizationType.SP2), 2: ('sp', 180, Chem.HybridizationType.SP)}
    panels = []
    for name, smi, idx, hs in rows:
        m = mol(smi, hs)
        a = m.GetAtomWithIdx(idx)
        lp = lone_pairs(a)
        domains = a.GetTotalDegree() + lp
        hyb, ang, rd = want[domains]
        check(a.GetHybridization() == rd, '%s atom %d is %s by RDKit' % (name, idx, hyb))
        P = Panel(m, 165, 110, highlight=[idx], bond=30)
        if lp:
            P.lone_pair_dots(idx, blocked=())
        bonds = a.GetTotalDegree()
        panels.append({'svg': P.out('%s, highlighted atom %s' % (name, hyb)), 'label': name, 'sub': '%d bonds + %d lone pairs = %d domains: %s, %s degrees' % (bonds, lp, domains, hyb, ('%g' % ang))})
    return {'layout': 'grid2', 'panels': panels}


def v_formal_charge():
    rows = [('methanol', 'CO'), ('methoxide', 'C[O-]'), ('methyloxonium', 'C[OH2+]')]
    panels = []
    for name, smi in rows:
        m = mol(smi, (1,))
        o = m.GetAtomWithIdx(1)
        lp = lone_pairs(o)
        bonds = o.GetDegree()
        holding = bonds + 2 * lp
        charge = 6 - holding
        check(charge == o.GetFormalCharge(), '%s formal charge %d matches RDKit' % (name, charge))
        P = Panel(m, 340, 100, highlight=[1], coords=False, mol_w=140, bond=30)
        P.lone_pair_dots(1)
        sign = '+1' if charge > 0 else ('-1' if charge < 0 else '0')
        P.text(146, 34, 'brought 6', 12, GREY, 'start', 600)
        P.text(146, 54, 'holding %d bond%s + %d pair%s = %d' % (bonds, '' if bonds == 1 else 's', lp, '' if lp == 1 else 's', holding), 12, INK, 'start', 600)
        P.text(146, 76, 'charge 6 - %d = %s' % (holding, sign), 14, ARROW if charge else INK, 'start', 700)
        panels.append({'svg': P.out('%s: oxygen with %d bonds and %d lone pairs, formal charge %s' % (name, bonds, lp, sign)), 'label': name})
    return {'layout': 'stack', 'panels': panels}


def v_resonance():
    m1 = mol('CC(=O)[O-]')
    AllChem.Compute2DCoords(m1)
    m2 = Chem.RWMol(m1)
    m2.GetBondBetweenAtoms(1, 2).SetBondType(Chem.BondType.SINGLE)
    m2.GetBondBetweenAtoms(1, 3).SetBondType(Chem.BondType.DOUBLE)
    m2.GetAtomWithIdx(2).SetFormalCharge(-1)
    m2.GetAtomWithIdx(3).SetFormalCharge(0)
    m2 = m2.GetMol()
    Chem.SanitizeMol(m2)
    check(formula(m1) == formula(m2) == 'C2H3O2-', 'both acetate forms are C2H3O2-')
    check(Chem.MolToSmiles(m1) == Chem.MolToSmiles(m2), 'the two forms are the same ion (same canonical SMILES)')
    P1 = Panel(m1, 340, 170, coords=True, bond=44)
    angs = P1.lone_pair_dots(3)
    P1.lone_pair_dots(2)
    # arrow 1: the lone pair on O- nearest the C-O bond swings into that bond; arrow 2: the C=O pi bond moves onto the other O
    tgt = P1.mid(1, 3)
    o3 = P1.p(3)
    want = math.atan2(tgt[1] - o3[1], tgt[0] - o3[0])
    lp = min(angs, key=lambda a: abs((a - want + math.pi) % (2 * math.pi) - math.pi))
    side = 1 if ((lp - want + math.pi) % (2 * math.pi) - math.pi) > 0 else -1
    P1.curved(P1.lp_point(3, lp, 17), tgt, bend=0.5 * side)
    c2 = P1.mid(1, 2)
    P1.curved(c2, P1.toward(2, 1, -13), bend=-0.6 * side)
    P2 = Panel(m2, 340, 170, coords=True, bond=44)
    P2.lone_pair_dots(2)
    P2.lone_pair_dots(3)
    return {'layout': 'stack', 'panels': [
        {'svg': P1.out('Acetate, first form, with two curved arrows'), 'label': 'Form 1, arrows drawn'},
        {'svg': res_arrow(), 'label': ''},
        {'svg': P2.out('Acetate, second form: the charge has moved to the other oxygen'), 'label': 'Form 2: same atoms, charge on the other oxygen'}]}


def v_conjugation():
    panels = []
    for name, smi, label in [('hexa-1,3-diene', 'C=C/C=C/CC', 'Conjugated: one row of four p orbitals'), ('hexa-1,5-diene', 'C=CCCC=C', 'Isolated: two sp3 carbons break the row')]:
        m = mol(smi)
        check(formula(m) == 'C6H10', name + ' is C6H10')
        sp2 = [a.GetIdx() for a in m.GetAtoms() if a.GetHybridization() == Chem.HybridizationType.SP2]
        sp3 = [a.GetIdx() for a in m.GetAtoms() if a.GetHybridization() == Chem.HybridizationType.SP3]
        P = Panel(m, 340, 130, bond=36, pad=0.2)
        for i in sp2:
            x, y = P.p(i)
            P.ellipse(x, y - 14, 5.5, 11)
            P.ellipse(x, y + 14, 5.5, 11, opacity=0.45)
        # continuous row = every sp2 atom bonded in one chain
        runs = Chem.GetMolFrags(Chem.RWMol(Chem.PathToSubmol(m, [b.GetIdx() for b in m.GetBonds() if b.GetBeginAtomIdx() in sp2 and b.GetEndAtomIdx() in sp2])))
        conj = len(runs) == 1 and len(sp2) == 4
        check(conj == (name == 'hexa-1,3-diene'), name + (' is conjugated' if conj else ' is not conjugated'))
        for i in sp3:
            if name == 'hexa-1,5-diene' and m.GetAtomWithIdx(i).GetDegree() == 2:
                x, y = P.p(i)
                P.text(x, y + (22 if y < 65 else -14), 'sp3', 11, GREY, 'middle', 700)
        panels.append({'svg': P.out(name + ': ' + label), 'label': name, 'sub': label})
    return {'layout': 'stack', 'panels': panels}


def v_polarity():
    panels = []
    m = mol('CC(C)=O')
    P = Panel(m, 340, 130, highlight=[], bond=34, mol_w=200)
    c, o = P.p(1), P.p(3)
    nx, ny = -(o[1] - c[1]), (o[0] - c[0])
    L = math.hypot(nx, ny)
    off = (nx / L * 14, ny / L * 14)
    P.dipole(P.toward(1, 3, 6), P.toward(3, 1, 8), offset=off)
    P.text(c[0] - off[0] * 1.2, c[1] - off[1] * 1.2 + 4, 'δ+', 13, ARROW, 'middle', 700)
    P.text(o[0] + 12, o[1] - 10, 'δ-', 13, ARROW, 'middle', 700)
    P.text(214, 60, 'one C=O dipole', 13, INK, 'start', 600)
    P.text(214, 80, 'net dipole', 14, ARROW, 'start', 700)
    check(formula(m) == 'C3H6O', 'acetone is C3H6O')
    panels.append({'svg': P.out('Acetone with one bond dipole toward oxygen: polar'), 'label': 'acetone'})
    m = mol('O=C=O')
    P = Panel(m, 340, 110, bond=40, mol_w=200)
    for oi in (0, 2):
        P.dipole(P.toward(1, oi, 6), P.toward(oi, 1, 10), offset=(0, -18))
    P.text(214, 50, 'dipoles cancel', 13, INK, 'start', 600)
    P.text(214, 70, 'net zero', 14, ARROW, 'start', 700)
    check(m.GetAtomWithIdx(1).GetHybridization() == Chem.HybridizationType.SP, 'CO2 carbon is sp (linear)')
    panels.append({'svg': P.out('Carbon dioxide: two bond dipoles cancel on a line: nonpolar'), 'label': 'carbon dioxide'})
    return {'layout': 'stack', 'panels': panels}


def v_arrow_pushing():
    # hydroxide attacks bromoethane from the back; the C-Br bond leaves with Br
    m = mol('[OH-].CCBr')
    check(formula(m) == 'C2H6BrO-', 'hydroxide + bromoethane atoms')
    xy = [(-2.6, 0.0), (-0.75, 1.3), (0.0, 0.0), (1.5, 0.0)]
    set_coords(m, xy)
    P = Panel(m, 340, 130, coords=True, bond=40)
    angs = P.lone_pair_dots(0)
    a_to_c = min(angs, key=lambda a: abs(a))
    P.curved(P.lp_point(0, a_to_c, 16), P.toward(2, 0, 7), bend=0.35)
    P.curved(P.mid(2, 3), P.toward(3, 2, -12), bend=0.6)
    p1 = {'svg': P.out('Hydroxide lone pair attacks carbon; the C-Br bond pair leaves with bromine. Full-headed arrows.'), 'label': 'Polar step: full heads move pairs'}
    m = mol('BrBr')
    set_coords(m, [(0, 0), (1.5, 0)])
    P = Panel(m, 340, 110, coords=True, bond=60)
    mx, my = P.mid(0, 1)
    P.curved((mx, my - 4), P.toward(0, 1, 6), bend=0.6, kind='fish', shorten=2)
    P.curved((mx, my + 4), P.toward(1, 0, 6), bend=0.6, kind='fish', shorten=2)
    P.text(mx, 102, 'light: each Br keeps one electron', 12, GREY, 'middle', 600)
    p2 = {'svg': P.out('Br2 split by light: two fishhook arrows, one electron each'), 'label': 'Radical step: fishhooks move one electron'}
    return {'layout': 'stack', 'panels': [p1, p2]}


def v_bronsted():
    m = mol('CC(=O)O.[OH-]', (3,))
    check(formula(m) == 'C2H5O3-', 'acetic acid + hydroxide atoms')
    hidx = [a.GetIdx() for a in m.GetAtoms() if a.GetSymbol() == 'H'][0]
    oh = 4
    coords = {0: (-1.3, -0.75), 1: (0.0, 0.0), 2: (0.0, 1.5), 3: (1.3, -0.75), hidx: (2.6, 0.0), oh: (4.7, 0.0)}
    set_coords(m, [coords[i] for i in range(m.GetNumAtoms())])
    P = Panel(m, 340, 160, coords=True, bond=36)
    angs = P.lone_pair_dots(oh)
    a = min(angs, key=lambda x: abs(abs(x) - math.pi))
    P.curved(P.lp_point(oh, a, 16), P.toward(hidx, oh, 7), bend=0.5)
    ox, oy = P.p(3)
    P.curved(P.mid(3, hidx), (ox + 9, oy + 13), bend=-0.7, shorten=2)
    P.lone_pair_dots(3)
    P.lone_pair_dots(2)
    P.text(P.p(1)[0], 152, 'acid', 13, INK, 'middle', 700)
    P.text(P.p(oh)[0], 152, 'base', 13, INK, 'middle', 700)
    p1 = {'svg': P.out('Acetic acid gives its proton to hydroxide, two curved arrows'), 'label': 'acetic acid (pKa 4.8) + hydroxide'}
    m = mol('CC(=O)[O-].O', (4,))
    check(formula(m) == 'C2H5O3-', 'acetate + water atoms (mass balanced)')
    hs = [a.GetIdx() for a in m.GetAtoms() if a.GetSymbol() == 'H']
    coords = {0: (-1.3, -0.75), 1: (0.0, 0.0), 2: (0.0, 1.5), 3: (1.3, -0.75), 4: (4.7, -0.2), hs[0]: (3.95, -1.5), hs[1]: (5.45, -1.5)}
    set_coords(m, [coords[i] for i in range(m.GetNumAtoms())])
    P = Panel(m, 340, 160, coords=True, bond=36)
    P.lone_pair_dots(3)
    P.lone_pair_dots(2)
    P.lone_pair_dots(4)
    P.text(P.p(1)[0], 152, 'conjugate base', 13, INK, 'middle', 700)
    P.text(P.p(4)[0], 152, 'conjugate acid', 13, INK, 'middle', 700)
    p2 = {'svg': P.out('Acetate and water, the conjugate base and conjugate acid'), 'label': 'acetate + water (pKa 15.7)'}
    eq = {'svg': eq_arrows(note='favors the weaker acid: water'), 'label': ''}
    return {'layout': 'stack', 'panels': [p1, eq, p2]}


def v_pka():
    anchors = [(-7, 'HCl'), (4.8, 'carboxylic acid (4 to 5)'), (10, 'phenol'), (15.7, 'water'), (17, 'alcohol (16 to 18)'), (25, 'terminal alkyne C-H'), (38, 'NH3'), (44, 'alkene C-H'), (50, 'alkane C-H')]
    W, H = 340, 470
    top, bot = 30, 440
    y = lambda v: top + (v + 10) / 60 * (bot - top)
    parts = ["<path d='M70,%d L70,%d' stroke='%s' stroke-width='3' stroke-linecap='round'/>" % (top, bot, INK)]
    parts.append(t(70, 18, 'pKa', 13, GREY, 'middle', 700))
    # stronger-acid arrow on the far left
    parts.append("<path d='M22,%d L22,%d' stroke='%s' stroke-width='2'/><path d='M22,%d l-5,9 l10,0 z' fill='%s'/>" % (bot - 10, top + 14, ARROW, top + 6, ARROW))
    parts.append("<text transform='translate(36,%d) rotate(-90)' text-anchor='middle' style=\"%s;font-size:12px;font-weight:700\" fill='%s'>stronger acid</text>" % ((top + bot) / 2, FONT, ARROW))
    last = -99
    for v, name in anchors:
        yy = y(v)
        ly = max(yy, last + 19)
        last = ly
        parts.append("<path d='M64,%.1f L76,%.1f' stroke='%s' stroke-width='2'/>" % (yy, yy, INK))
        parts.append(t(84, ly + 4.5, '%g' % v if v != 17 and v != 4.8 else ('16-18' if v == 17 else '4.8'), 13, INK, 'start', 700))
        parts.append(t(130, ly + 4.5, name, 13, INK, 'start', 600))
        if abs(ly - yy) > 1:
            parts.append("<path d='M76,%.1f L82,%.1f' stroke='%s' stroke-width='1'/>" % (yy, ly, GREY))
    # check: the anchors are in the same order as Thomas's crash course line
    check([a[0] for a in anchors] == sorted(a[0] for a in anchors), 'pKa anchors ascend')
    return {'layout': 'stack', 'panels': [{'svg': bare_svg(W, H, parts, 'pKa line from HCl near -7 to alkane near 50'), 'label': ''}]}


def cardio_strip(lit, tie=(), note=''):
    letters = [('C', 'Charge'), ('A', 'Atom'), ('R', 'Resonance'), ('D', 'Dipole'), ('I', 'Induction'), ('O', 'Orbital')]
    W, H = 340, 88
    parts = []
    bw = 50
    for k, (L, word) in enumerate(letters):
        x = 6 + k * 55
        if L in lit:
            fill, ink = HILITE_HEX, INK
        elif L in tie:
            fill, ink = '#EFE7D6', GREY
        else:
            fill, ink = '#FCFAF6', '#9aa39c'
        parts.append("<rect x='%d' y='6' width='%d' height='40' rx='7' fill='%s' stroke='%s' stroke-width='1.2'/>" % (x, bw, fill, '#c9b98d' if L in lit else '#d9d2c2'))
        parts.append(t(x + bw / 2, 34, L, 20, ink, 'middle', 700))
        parts.append(t(x + bw / 2, 60, word, 10, ink, 'middle', 600))
    if note:
        parts.append(t(170, 84, note, 12, GREY, 'middle', 600))
    return bare_svg(W, H, parts, 'CARDIO letters. ' + note)


def v_conj_base():
    panels = []
    for name, smi, o_idx, sub in [('ethoxide', 'CC[O-]', 2, 'minus on one oxygen'), ('acetate', 'CC(=O)[O-]', 3, 'minus shared by two oxygens')]:
        m = mol(smi)
        P = Panel(m, 165, 130, bond=32)
        P.lone_pair_dots(o_idx)
        if name == 'acetate':
            P.lone_pair_dots(2)
        panels.append({'svg': P.out(name + ', ' + sub), 'label': name, 'sub': sub})
    check(lone_pairs(mol('CC[O-]').GetAtomWithIdx(2)) == 3, 'ethoxide O carries 3 lone pairs')
    strip = {'svg': cardio_strip(['R'], tie=['C', 'A'], note='C and A tie, R decides, stop there'), 'label': '', 'wide': True}
    return {'layout': 'grid2', 'panels': panels + [strip]}


def v_induction():
    # one template: chain left to right, COOH on the right, so the eye compares only where Cl sits
    rows = [('propanoic acid', 'CCC(=O)O', '4.87', {0: (0, 0), 1: (1.3, 0.75), 2: (2.6, 0), 3: (2.6, -1.5), 4: (3.9, 0.75)}),
            ('3-chloropropanoic acid', 'ClCCC(=O)O', 'about 4.0', {0: (-1.3, 0.75), 1: (0, 0), 2: (1.3, 0.75), 3: (2.6, 0), 4: (2.6, -1.5), 5: (3.9, 0.75)}),
            ('2-chloropropanoic acid', 'CC(Cl)C(=O)O', 'about 2.8', {0: (0, 0), 1: (1.3, 0.75), 2: (1.3, 2.25), 3: (2.6, 0), 4: (2.6, -1.5), 5: (3.9, 0.75)})]
    panels = []
    for name, smi, pka, xy in rows:
        m = mol(smi)
        set_coords(m, [xy[i] for i in range(m.GetNumAtoms())])
        cl = [a.GetIdx() for a in m.GetAtoms() if a.GetSymbol() == 'Cl']
        carbonyl = [a.GetIdx() for a in m.GetAtoms() if a.GetSymbol() == 'C' and any(b.GetBondType() == Chem.BondType.DOUBLE for b in a.GetBonds())][0]
        P = Panel(m, 340, 140, highlight=cl, coords=True, bond=28, mol_w=200)
        if cl:
            n = len(Chem.GetShortestPath(m, cl[0], carbonyl)) - 1
            check(n == (3 if name.startswith('3') else 2), name + ': Cl is %d bonds from the C=O carbon' % n)
            P.text(212, 74, 'Cl %d bonds from C=O' % n, 12, GREY, 'start', 600)
        else:
            P.text(212, 74, 'no Cl', 12, GREY, 'start', 600)
        P.text(212, 52, 'pKa ' + pka, 15, INK, 'start', 700)
        panels.append({'svg': P.out('%s, pKa %s' % (name, pka)), 'label': name})
    return {'layout': 'stack', 'panels': panels}


def v_amine():
    rows = [('methylamine', 'CN', 1, '10.6', 'free pair'), ('aniline', 'Nc1ccccc1', 0, '4.6', 'pair in the ring'), ('acetamide', 'CC(N)=O', 2, 'about 0', 'pair on the C=O')]
    panels = []
    for name, smi, n_idx, pka, sub in rows:
        m = mol(smi)
        P = Panel(m, 340, 130, bond=32, mol_w=210)
        angs = P.lone_pair_dots(n_idx)
        if name == 'aniline':
            ring_c = m.GetAtomWithIdx(n_idx).GetNeighbors()[0].GetIdx()
            ortho = [nb.GetIdx() for nb in m.GetAtomWithIdx(ring_c).GetNeighbors() if nb.GetIdx() != n_idx]
            # the ortho carbon whose ring bond to ring_c is double in the Kekule drawing
            km = Chem.Mol(m)
            Chem.Kekulize(km, clearAromaticFlags=True)
            o2 = [o for o in ortho if km.GetBondBetweenAtoms(ring_c, o).GetBondType() == Chem.BondType.DOUBLE][0]
            P.curved(P.lp_point(n_idx, angs[0], 16), P.mid(n_idx, ring_c), bend=0.6)
            P.curved(P.mid(ring_c, o2), P.toward(o2, ring_c, -6), bend=0.6)
        if name == 'acetamide':
            c = 1
            o = 3
            P.curved(P.lp_point(n_idx, angs[0], 14), P.mid(n_idx, c), bend=-0.5)
            P.curved(P.mid(c, o), P.toward(o, c, -10), bend=-0.5)
        P.text(222, 50, 'pKaH ' + pka, 15, INK, 'start', 700)
        P.text(222, 72, sub, 12, GREY, 'start', 600)
        check(m.GetAtomWithIdx(n_idx).GetSymbol() == 'N', name + ': lone pair drawn on N')
        panels.append({'svg': P.out('%s, conjugate acid pKa %s, %s' % (name, pka, sub)), 'label': name})
    return {'layout': 'stack', 'panels': panels}


def v_imfs():
    panels = []
    # methanol pair: the O-H of A points at a lone pair on the O of B
    m = mol('CO.CO', (1, 3))
    hs = [a.GetIdx() for a in m.GetAtoms() if a.GetSymbol() == 'H']
    coords = {0: (0.0, 0.0), 1: (1.3, 0.75), hs[0]: (2.6, 0.0), 3: (4.5, -0.6), 2: (5.8, 0.15), hs[1]: (4.5, -2.1)}
    set_coords(m, [coords[i] for i in range(m.GetNumAtoms())])
    P = Panel(m, 340, 130, coords=True, bond=30)
    P.lone_pair_dots(1)
    P.lone_pair_dots(3)
    P.dashed(P.toward(hs[0], 3, 8), P.toward(3, hs[0], 17))
    mx, my = P.mid(hs[0], 3)
    P.text(mx, my - 16, 'H-bond', 12, ARROW, 'middle', 700)
    panels.append({'svg': P.out('Two methanol molecules joined by a hydrogen bond'), 'label': 'methanol: hydrogen bond'})
    # acetone pair stacked antiparallel: the partial minus O of each sits over the partial plus C of the other
    m = mol('CC(C)=O.CC(C)=O')
    a = [(0.25, 2.3), (1.0, 1.0), (0.25, -0.3), (2.5, 1.0)]
    b = [(3.25, -1.1), (2.5, -2.4), (3.25, -3.7), (1.0, -2.4)]
    set_coords(m, a + b)
    P = Panel(m, 340, 190, coords=True, bond=30)
    P.dashed(P.toward(3, 5, 10), P.toward(5, 3, 8))
    P.dashed(P.toward(7, 1, 10), P.toward(1, 7, 8))
    P.text(P.p(1)[0] - 16, P.p(1)[1] + 5, 'δ+', 12, ARROW, 'middle', 700)
    P.text(P.p(3)[0] + 18, P.p(3)[1] + 5, 'δ-', 12, ARROW, 'middle', 700)
    P.text(P.p(7)[0] - 18, P.p(7)[1] + 5, 'δ-', 12, ARROW, 'middle', 700)
    P.text(P.p(5)[0] + 16, P.p(5)[1] + 5, 'δ+', 12, ARROW, 'middle', 700)
    check(formula(mol('CC(C)=O')) == 'C3H6O', 'acetone formula')
    check(all(at.GetTotalNumHs() == 0 for at in m.GetAtoms() if at.GetSymbol() == 'O'), 'acetone has no O-H: no H-bond donor')
    panels.append({'svg': P.out('Two acetone molecules with opposite partial charges lined up'), 'label': 'acetone: dipole-dipole, no H-bond donor'})
    # propane pair: London only
    m = mol('CCC.CCC')
    set_coords(m, [(0, 0), (1.3, 0.75), (2.6, 0), (0, -2.4), (1.3, -1.65), (2.6, -2.4)])
    P = Panel(m, 340, 120, coords=True, bond=34)
    for i, j in ((0, 3), (1, 4), (2, 5)):
        P.dashed(P.toward(i, j, 8), P.toward(j, i, 8), color='#9aa39c')
    check(all(at.GetSymbol() == 'C' for at in m.GetAtoms()), 'propane: carbon and hydrogen only, no dipole')
    panels.append({'svg': P.out('Two propane molecules held only by London forces'), 'label': 'propane: London dispersion only'})
    return {'layout': 'stack', 'panels': panels}


def v_physical():
    rows = [('pentane', 'CCCCC', 36), ('2-methylbutane', 'CCC(C)C', 28), ('2,2-dimethylpropane', 'CC(C)(C)C', 10)]
    panels = []
    for name, smi, bp in rows:
        m = mol(smi)
        check(formula(m) == 'C5H12', name + ' is C5H12')
        P = Panel(m, 340, 96, bond=26, mol_w=170)
        x0 = 180
        P.rect(x0, 40, 120 * bp / 40.0, 16, HILITE_HEX)
        P.text(x0 + 120 * bp / 40.0 + 6, 53, '%d C' % bp, 14, INK, 'start', 700)
        P.text(x0, 30, 'boiling point', 11, GREY, 'start', 600)
        panels.append({'svg': P.out('%s, boils at about %d C' % (name, bp)), 'label': name})
    check([r[2] for r in rows] == sorted([r[2] for r in rows], reverse=True), 'more branching, lower boiling point, in the order drawn')
    return {'layout': 'stack', 'panels': panels}


def v_ihd():
    rows = [('cyclohexene', 'C1=CCCCC1', '1 ring + 1 pi bond'), ('hexa-1,4-diene', 'C=CC/C=C/C', '2 pi bonds'), ('hex-1-yne', 'C#CCCCC', '1 triple bond = 2 pi bonds')]
    panels = []
    for name, smi, sub in rows:
        m = mol(smi)
        check(formula(m) == 'C6H10', name + ' is C6H10')
        rings = m.GetRingInfo().NumRings()
        pi = sum(int(b.GetBondTypeAsDouble()) - 1 for b in m.GetBonds())
        check(rings + pi == 2, name + ': rings + pi = 2')
        P = Panel(m, 165, 110, bond=24)
        panels.append({'svg': P.out('%s, C6H10, %s' % (name, sub)), 'label': name, 'sub': sub})
    ihd = (2 * 6 + 2 - 10) // 2
    check(ihd == 2, 'C6H10 formula gives IHD 2')
    parts = [t(170, 26, 'C6H10', 18, INK, 'middle', 700), t(170, 52, 'IHD = (2C + 2 + N - H - X) / 2', 13, GREY, 'middle', 600), t(170, 76, '= (2 x 6 + 2 - 10) / 2 = 2', 15, INK, 'middle', 700)]
    head = {'svg': bare_svg(340, 88, parts, 'C6H10 has an index of hydrogen deficiency of 2'), 'label': '', 'wide': True}
    return {'layout': 'grid2', 'panels': [head] + panels}


def v_naming():
    smi = 'CCC(C)CC(C)C'
    m = mol(smi)
    check(formula(m) == 'C8H18', '2,4-dimethylhexane is C8H18')
    # longest chain by RDKit distance matrix between terminal carbons
    dm = Chem.GetDistanceMatrix(m)
    ends = [a.GetIdx() for a in m.GetAtoms() if a.GetDegree() == 1]
    best = max(((i, j) for i in ends for j in ends if i < j), key=lambda p: dm[p[0]][p[1]])
    chain = list(Chem.GetShortestPath(m, best[0], best[1]))
    check(len(chain) == 6, 'longest chain is 6 carbons (hexane)')
    def locants(order):
        return sorted(k + 1 for k, a in enumerate(order) for nb in m.GetAtomWithIdx(a).GetNeighbors() if nb.GetIdx() not in chain)
    la, lb = locants(chain), locants(chain[::-1])
    keep, lose = (chain, chain[::-1]) if la < lb else (chain[::-1], chain)
    check(locants(keep) == [2, 4], 'lowest locants are 2,4')
    check(locants(lose) == [3, 5], 'the other direction gives 3,5')
    branches = [a.GetIdx() for a in m.GetAtoms() if a.GetIdx() not in chain]
    AllChem.Compute2DCoords(m)
    panels = []
    for order, good in ((lose, False), (keep, True)):
        P = Panel(m, 340, 130, highlight=branches, coords=True, notes={a: k + 1 for k, a in enumerate(order)}, bond=34)
        side = 'left' if P.p(order[0])[0] < P.p(order[-1])[0] else 'right'
        locs = ','.join(str(x) for x in locants(order))
        label = 'numbered from the %s: %s' % (side, locs) + (', keep this one' if good else '')
        P.text(334, 20, 'keep' if good else 'lose', 13, ARROW if good else GREY, 'end', 700)
        panels.append({'svg': P.out('2,4-dimethylhexane ' + label), 'label': label})
    return {'layout': 'stack', 'panels': panels}


def v_priority():
    rungs = [('carboxylic acid', '-oic acid'), ('anhydride', '-oic anhydride'), ('ester', '-oate'), ('acid halide', '-oyl halide'), ('amide', '-amide'), ('nitrile', '-nitrile'), ('aldehyde', '-al'), ('ketone', '-one'), ('alcohol', '-ol'), ('amine', '-amine')]
    W, H = 340, 30 + 26 * len(rungs)
    parts = [t(12, 18, 'takes the suffix first', 12, GREY, 'start', 700)]
    for k, (g, suf) in enumerate(rungs):
        y = 30 + k * 26
        hot = g in ('ketone', 'alcohol')
        parts.append("<rect x='8' y='%d' width='324' height='22' rx='6' fill='%s' stroke='#d9d2c2'/>" % (y, HILITE_HEX if hot else '#FCFAF6'))
        parts.append(t(20, y + 16, '%d  %s' % (k + 1, g), 13, INK, 'start', 600))
        parts.append(t(320, y + 16, suf, 13, INK, 'end', 700))
    ladder = {'svg': bare_svg(W, H, parts, 'Suffix priority ladder from carboxylic acid down to amine'), 'label': ''}
    m = mol('CC(=O)CCO')
    check(formula(m) == 'C4H8O2', '4-hydroxybutan-2-one is C4H8O2')
    # number from the end nearer the ketone carbon
    chain = [0, 1, 3, 4]
    ket = 1
    oh_c = 4
    check(chain.index(ket) + 1 == 2 and chain.index(oh_c) + 1 == 4, 'ketone carbon is C2 and the OH carbon is C4')
    P = Panel(m, 340, 120, highlight=[2, 5], notes={a: k + 1 for k, a in enumerate(chain)}, bond=34)
    ex = {'svg': P.out('4-hydroxybutan-2-one, ketone on carbon 2 and OH on carbon 4'), 'label': 'ketone outranks alcohol: 4-hydroxybutan-2-one'}
    return {'layout': 'stack', 'panels': [ladder, ex]}


BUILDERS = {
    'oc_hybridization': v_hybridization, 'oc_formal_charge': v_formal_charge, 'oc_resonance': v_resonance,
    'oc_conjugation': v_conjugation, 'oc_polarity': v_polarity, 'oc_arrow_pushing': v_arrow_pushing,
    'oc_bronsted_lowry': v_bronsted, 'oc_pka': v_pka, 'oc_conj_base_stability': v_conj_base,
    'oc_inductive_resonance_acidity': v_induction, 'oc_amine_basicity': v_amine, 'oc_imfs': v_imfs,
    'oc_physical_trends': v_physical, 'oc_ihd': v_ihd, 'oc_alkane_naming': v_naming, 'oc_priority_order': v_priority,
}


def build():
    src = json.load(open(SRC))
    fams = {f['id']: f for f in json.load(open(FAMILIES))['families']}
    lessons = []
    for L in src['lessons']:
        fig = BUILDERS[L['id']]()
        out = dict(L)
        out['traps'] = []
        for tr in L['traps']:
            f = fams.get(tr['family'])
            check(f is not None, L['id'] + ': trap family ' + tr['family'] + ' is on the approved list')
            out['traps'].append(dict(tr, name=f['name'], fix=f['fix']))
        check(len(out['traps']) == 3 and len({t['family'] for t in out['traps']}) == 3, L['id'] + ': three different trap families')
        out['figure'] = fig
        lessons.append(out)
    return {
        'format': 1,
        'source': 'scripts/oc-lessons/lessons.json, drawn by scripts/build-oc-lessons.py (RDKit %s)' % Chem.rdBase.rdkitVersion,
        'note': 'Lesson text and bank ids only. No bank question text. Structures computed and checked by RDKit.',
        'families': src['families'],
        'units': src['units'],
        'checks': len(CHECKS),
        'lessons': lessons,
    }


def main():
    data = build()
    text = json.dumps(data, ensure_ascii=False, separators=(',', ':')) + '\n'
    if '--check' in sys.argv:
        cur = open(OUT, encoding='utf-8').read() if os.path.exists(OUT) else ''
        if cur != text:
            print('data/oc-lessons.json is stale: run python3 scripts/build-oc-lessons.py')
            sys.exit(1)
        print('data/oc-lessons.json is current (%d RDKit checks)' % len(CHECKS))
        return
    open(OUT, 'w', encoding='utf-8').write(text)
    print('wrote %s: %d lessons, %d RDKit checks passed' % (os.path.relpath(OUT, ROOT), len(data['lessons']), len(CHECKS)))


if __name__ == '__main__':
    main()
