#!/usr/bin/env python3
"""scripts/ochem2026/verify.py : the RDKit gate for the 2026 organic item set.

Input: a JSON list of items (written by build.mjs). Output: a JSON report on stdout,
{ "ok": bool, "items": { id: [problems...] }, "stats": {...} }.

What it proves, per item:
  * every SMILES anywhere in the item parses and sanitizes;
  * curved arrows are pushed for real: each arrow moves two electrons (a fishhook moves
    one) out of a lone pair, a bond or a radical and into a bond or onto an atom, the
    formal charges and radicals are recomputed from the electron count, and the result
    must sanitize with no second-row atom over an octet;
  * arrows-forward items: the keyed choice is exactly what the arrows make, and no
    other choice is;
  * arrows-reverse items: the keyed arrow set makes the shown product, and no other
    arrow set does;
  * chain items: every step's arrows turn that step's species into the next step's,
    and the keyed answer equals the state the item asks about;
  * counting claims (13C and 1H signal counts, degrees of unsaturation, formulas) are
    recomputed from the structure;
  * equilibrium claims use the reference pKa table below, never the author's numbers.

Atom references are "s.a": species s (0-based, in the order listed), atom a (0-based,
in SMILES order, explicit [H] atoms counted). That is the same order SmilesDrawer
numbers its vertices, so the picture and the proof point at the same atoms.
"""
import json
import sys
from fractions import Fraction as F

from rdkit import Chem, RDLogger
from rdkit.Chem import rdMolDescriptors

RDLogger.DisableLog('rdApp.*')

VAL = {'H': 1, 'B': 3, 'C': 4, 'N': 5, 'O': 6, 'F': 7, 'Si': 4, 'P': 5, 'S': 6, 'Cl': 7, 'Br': 7, 'I': 7, 'Mg': 2, 'Li': 1, 'Na': 1, 'K': 1}
SECOND_ROW = {'B', 'C', 'N', 'O', 'F'}

# Reference pKa values (water scale, the numbers a DAT student is taught).
# Keyed by canonical SMILES of the ACID form.
PKA = {
    'Cl': -7, 'Br': -9, 'I': -10, 'F': 3.2, '[OH3+]': -1.7, 'O=S(=O)(O)O': -3,
    'CC(=O)O': 4.8, 'O=C(O)c1ccccc1': 4.2, 'O=CO': 3.8, 'O=C(O)C(F)(F)F': 0.2,
    'Oc1ccccc1': 10, 'O=C(O)O': 6.4, 'O=C([O-])O': 10.3, '[NH4+]': 9.2, 'C[NH3+]': 10.6,
    'CC[NH3+]': 10.7, 'O': 15.7, 'CO': 15.5, 'CCO': 16, 'CC(C)(C)O': 18, 'CC(C)=O': 19,
    'CC(=O)OCC': 25, 'C#C': 25, 'CC#C': 25, 'CCC#C': 25, 'N': 38, '[HH]': 35, 'C=C': 44, 'CC': 50, 'C': 50,
    'CC(=O)CC(C)=O': 9, 'CCOC(=O)CC(C)=O': 11, 'CCOC(=O)CC(=O)OCC': 13, 'C#N': 9.2,
    'S': 7, 'CS': 10.4, 'C[N+](=O)[O-]': 10.2, 'c1cc[nH+]cc1': 5.2, '[NH3+]c1ccccc1': 4.6,
    'C[OH2+]': -2.5, 'CC[OH2+]': -2.4, 'CC(C)=[OH+]': -7, 'CC(=O)[OH2+]': -6,
    'CC(C)O': 17, 'OO': 11.6, 'CC=O': 17, 'O=C1CCCCC1': 17, 'CC(=O)N': 17,
    'CN': 40, 'CNC': 36, 'CC(C)NC(C)C': 36,
}


def _canon_table(t):
    out = {}
    for k, v in t.items():
        m = Chem.MolFromSmiles(k)
        out[Chem.MolToSmiles(m) if m else k] = v
    return out


def canon(smi):
    m = Chem.MolFromSmiles(smi)
    return None if m is None else Chem.MolToSmiles(m)


def parse_keep_h(smi):
    p = Chem.SmilesParserParams()
    p.removeHs = False
    return Chem.MolFromSmiles(smi, p)


class Electrons:
    """Bond orders and nonbonding electron counts for a set of species, atoms addressed s.a."""

    def __init__(self, species):
        self.atoms = []          # (symbol, explicitH count)
        self.index = {}          # "s.a" -> global index
        self.nonb = []           # nonbonding electrons
        self.bonds = {}          # frozenset(i, j) -> Fraction order
        for s, smi in enumerate(species):
            m = parse_keep_h(smi)
            if m is None:
                raise ValueError('species %d does not parse: %s' % (s, smi))
            Chem.Kekulize(m, clearAromaticFlags=True)   # count electrons on one Kekule structure
            base = len(self.atoms)
            for a in m.GetAtoms():
                sym = a.GetSymbol()
                if sym not in VAL:
                    raise ValueError('no valence table entry for ' + sym)
                h = a.GetTotalNumHs()
                self.atoms.append((sym, h))
                self.index['%d.%d' % (s, a.GetIdx())] = base + a.GetIdx()
            for b in m.GetBonds():
                order = b.GetBondTypeAsDouble()
                if order == 1.5:
                    raise ValueError('write aromatic rings in Kekule form for arrow items: ' + smi)
                self.bonds[frozenset((base + b.GetBeginAtomIdx(), base + b.GetEndAtomIdx()))] = F(int(order))
            for a in m.GetAtoms():
                i = base + a.GetIdx()
                sym, h = self.atoms[i]
                bsum = self.bond_sum(i) + h
                n = VAL[sym] - a.GetFormalCharge() - bsum
                if n < 0 or n != int(n):
                    raise ValueError('bad electron count on %s in %s' % (sym, smi))
                if a.GetNumRadicalElectrons() and n % 2 == 0:
                    raise ValueError('radical bookkeeping mismatch in ' + smi)
                self.nonb.append(F(int(n)))

    def bond_sum(self, i):
        return sum(o for k, o in self.bonds.items() if i in k)

    def ref(self, r):
        if r not in self.index:
            raise ValueError('atom ref %s does not exist' % r)
        return self.index[r]

    def push(self, arrow):
        e = F(1) if arrow.get('fish') else F(2)
        src, dst = arrow['from'], arrow['to']
        # out of
        if 'lp' in src:
            i = self.ref(src['lp'])
            if self.nonb[i] < e:
                raise ValueError('arrow starts at a lone pair that is not there (%s)' % src['lp'])
            self.nonb[i] -= e
        elif 'e' in src:
            i = self.ref(src['e'])
            if self.nonb[i] % 2 != 1:
                raise ValueError('fishhook starts at %s but that atom has no unpaired electron' % src['e'])
            if e != 1:
                raise ValueError('a single electron can only move by a fishhook')
            self.nonb[i] -= e
        elif 'bond' in src:
            a, b = [self.ref(x) for x in src['bond']]
            k = frozenset((a, b))
            if self.bonds.get(k, 0) < e / 2:
                raise ValueError('arrow starts at a bond that is not there (%s)' % src['bond'])
            self.bonds[k] = self.bonds[k] - e / 2
            # electrons leave a bond: both atoms lose a share. Bookkeeping lands in charges.
        else:
            raise ValueError('arrow has no source')
        # into
        if 'atom' in dst:
            j = self.ref(dst['atom'])
            self.nonb[j] += e
        elif 'bond' in dst:
            a, b = [self.ref(x) for x in dst['bond']]
            if a == b:
                raise ValueError('bond to itself')
            k = frozenset((a, b))
            self.bonds[k] = self.bonds.get(k, F(0)) + e / 2
        else:
            raise ValueError('arrow has no target')

    def molecule(self):
        rw = Chem.RWMol()
        for idx, (sym, h) in enumerate(self.atoms):
            a = Chem.Atom(sym)
            a.SetNoImplicit(True)
            a.SetNumExplicitHs(h)
            rw.AddAtom(a)
        for k, o in self.bonds.items():
            if o == 0:
                continue
            if o.denominator != 1:
                raise ValueError('a half bond is left over: the fishhooks do not pair up')
            if o < 0:
                raise ValueError('a bond order went negative')
            a, b = sorted(k)
            bt = {1: Chem.BondType.SINGLE, 2: Chem.BondType.DOUBLE, 3: Chem.BondType.TRIPLE}.get(int(o))
            if bt is None:
                raise ValueError('bond order %s' % o)
            rw.AddBond(a, b, bt)
        for idx, (sym, h) in enumerate(self.atoms):
            n = self.nonb[idx]
            if n.denominator != 1:
                raise ValueError('fractional electrons')
            bsum = self.bond_sum(idx) + h
            q = VAL[sym] - int(n) - bsum
            if q.denominator != 1:
                raise ValueError('fractional charge')
            at = rw.GetAtomWithIdx(idx)
            at.SetFormalCharge(int(q))
            at.SetNumRadicalElectrons(int(n) % 2)
            if sym in SECOND_ROW and int(n) + 2 * bsum > 8:
                raise ValueError('%s ends with more than an octet' % sym)
            if sym == 'H' and int(n) + 2 * bsum > 2:
                raise ValueError('H ends with more than two electrons')
        m = rw.GetMol()
        Chem.SanitizeMol(m)
        return m


def fragments(m):
    return sorted(Chem.MolToSmiles(f) for f in Chem.GetMolFrags(Chem.RemoveHs(m, sanitize=True), asMols=True))


def frag_set(smis):
    out = []
    for s in smis:
        for part in s.split('.'):
            c = canon(part)
            if c is None:
                raise ValueError('does not parse: ' + part)
            out.append(c)
    return sorted(out)


def apply(species, arrows):
    E = Electrons(species)
    for ar in arrows:
        E.push(ar)
    return fragments(E.molecule())


def try_apply(species, arrows):
    try:
        return apply(species, arrows), None
    except Exception as ex:   # an illegal arrow set is a legal distractor
        return None, str(ex)


def look(species, arrows):
    """What a student SEES for an arrow set, the way mechdraw.js draws it: where each tail
    sits and where each head lands. Two sets with the same look are the same picture."""
    E = Electrons(species)
    out = []
    for ar in arrows:
        f, t = ar['from'], ar['to']
        if 'lp' in f:
            tail = ('lp', E.ref(f['lp'])); src = {E.ref(f['lp'])}
        elif 'e' in f:
            tail = ('e', E.ref(f['e'])); src = {E.ref(f['e'])}
        else:
            a, b = sorted(E.ref(x) for x in f['bond']); src = {a, b}; tail = ('bond', a, b, None)
        if 'atom' in t:
            head = ('at', E.ref(t['atom']))
        else:
            a, b = (E.ref(x) for x in t['bond'])
            if frozenset((a, b)) in E.bonds:
                head = ('mid',) + tuple(sorted((a, b)))
            elif a in src or b in src:
                far = b if a in src else a
                near = a if a in src else b
                head = ('at', far)
                if tail[0] == 'bond':
                    tail = tail[:3] + (near,)       # the tail leans toward the atom that makes the new bond
            else:
                head = ('mid',) + tuple(sorted((a, b)))
        out.append((tail, head, bool(ar.get('fish'))))
    return tuple(sorted(out))


def c13(smi):
    m = Chem.MolFromSmiles(smi)
    ranks = list(Chem.CanonicalRankAtoms(m, breakTies=False))
    return len({ranks[a.GetIdx()] for a in m.GetAtoms() if a.GetSymbol() == 'C'})


def h1(smi):
    """Chemically distinct H environments by topological symmetry (no diastereotopic split)."""
    m = Chem.AddHs(Chem.MolFromSmiles(smi))
    ranks = list(Chem.CanonicalRankAtoms(m, breakTies=False))
    return len({ranks[a.GetIdx()] for a in m.GetAtoms() if a.GetSymbol() == 'H'})


def dou_formula(formula):
    import re
    c = h = n = x = 0
    for el, k in re.findall(r'([A-Z][a-z]?)(\d*)', formula):
        k = int(k) if k else 1
        if el == 'C':
            c += k
        elif el == 'H':
            h += k
        elif el == 'N':
            n += k
        elif el in ('F', 'Cl', 'Br', 'I'):
            x += k
    return (2 * c + 2 + n - h - x) / 2


PKA = _canon_table(PKA)


def all_smiles(it):
    out = []
    def walk(o):
        if isinstance(o, dict):
            for k, v in o.items():
                if k in ('smi', 'sub', 'prod', 'smiles') and isinstance(v, str) and v:
                    out.append(v)
                elif k in ('species', 'product', 'gives') and isinstance(v, list):
                    for s in v:
                        if isinstance(s, str):
                            out.append(s)
                        else:
                            walk(s)
                else:
                    walk(v)
        elif isinstance(o, list):
            for v in o:
                walk(v)
    walk(it)
    return out


def spec_smiles(lst):
    return [s if isinstance(s, str) else s['smi'] for s in lst]


def check(it):
    P = []
    for s in all_smiles(it):
        for part in s.split('.'):
            if parse_keep_h(part) is None or Chem.MolFromSmiles(part) is None:
                P.append('SMILES does not parse: ' + part)
    if P:
        return P
    # drawn radical dots must sit on the atoms RDKit says carry the unpaired electron
    def rad_check(lst, where):
        for sp in lst or []:
            if isinstance(sp, dict):
                m = parse_keep_h(sp['smi'])
                real = sorted(a.GetIdx() for a in m.GetAtoms() if a.GetNumRadicalElectrons())
                if sorted(sp.get('rad', [])) != real:
                    P.append('%s: rad dots %s but RDKit radicals at %s in %s' % (where, sp.get('rad', []), real, sp['smi']))
    def walk_figs(o, where):
        if isinstance(o, dict):
            if o.get('kind') in ('mech',) or 'species' in o:
                rad_check(o.get('species'), where); rad_check(o.get('product'), where)
            for k, v in o.items():
                if k in ('fig', 'steps', 'choices') or isinstance(v, (dict, list)):
                    walk_figs(v, where)
        elif isinstance(o, list):
            for v in o:
                walk_figs(v, where)
    walk_figs(it.get('fig'), 'figure')
    for i, c in enumerate(it.get('choices', [])):
        walk_figs(c.get('fig'), 'choice %d' % i)
    t = it.get('type')
    fig = it.get('fig') or {}
    ch = it['choices']
    k = it['correct']
    V = it.get('verify') or {}
    try:
        if fig.get('kind') == 'mech' and fig.get('arrows') and fig.get('product'):
            got, err = try_apply(spec_smiles(fig['species']), fig['arrows'])
            if err:
                P.append('the figure arrows do not push: ' + err)
            elif got != frag_set(spec_smiles(fig['product'])):
                P.append('figure arrows give %s, figure product says %s' % (got, frag_set(spec_smiles(fig['product']))))
        if fig.get('kind') == 'mech' and fig.get('arrows') and t in ('arrows-forward', 'fishhook-forward'):
            got, err = try_apply(spec_smiles(fig['species']), fig['arrows'])
            if err:
                P.append('the shown arrows are not legal: ' + err)
            else:
                key = frag_set([ch[k]['smiles']])
                if got != key:
                    P.append('arrows give %s but key is %s' % (got, key))
                for i, c in enumerate(ch):
                    if i != k and c.get('smiles') and frag_set([c['smiles']]) == got:
                        P.append('choice %d is also what the arrows give' % i)
        if t in ('arrows-reverse', 'fishhook-reverse'):
            seen = {}
            for i, c in enumerate(ch):
                arrows = (c.get('fig') or {}).get('arrows')
                if arrows:
                    try:
                        sig = look(spec_smiles(fig['species']), arrows)
                        if sig in seen:
                            P.append('choices %d and %d draw the same picture' % (seen[sig], i))
                        seen[sig] = i
                    except Exception:
                        pass
            want = frag_set(spec_smiles(fig['product']))
            for i, c in enumerate(ch):
                arrows = (c.get('fig') or {}).get('arrows')
                if arrows is None:
                    P.append('choice %d has no arrows' % i)
                    continue
                got, err = try_apply(spec_smiles(fig['species']), arrows)
                if i == k:
                    if err:
                        P.append('keyed arrows are not legal: ' + err)
                    elif got != want:
                        P.append('keyed arrows give %s, product is %s' % (got, want))
                else:
                    if got == want:
                        P.append('distractor %d also makes the product' % i)
        if fig.get('kind') == 'chain':
            states = [frag_set(spec_smiles(fig['steps'][0]['species']))]
            for si, st in enumerate(fig['steps']):
                got, err = try_apply(spec_smiles(st['species']), st['arrows'])
                if err:
                    P.append('step %d arrows: %s' % (si + 1, err))
                    break
                nxt = fig['steps'][si + 1]['species'] if si + 1 < len(fig['steps']) else fig['product']
                adds = frag_set(fig['steps'][si + 1].get('adds', [])) if si + 1 < len(fig['steps']) else []
                drops = frag_set(st.get('drops', []))
                expect = list(got)
                for d in drops:
                    if d in expect:
                        expect.remove(d)
                    else:
                        P.append('step %d drops %s but it was never made' % (si + 1, d))
                expect = sorted(expect + adds)
                if expect != frag_set(spec_smiles(nxt)):
                    P.append('step %d gives %s (after drops/adds %s), next shows %s' % (si + 1, got, expect, frag_set(spec_smiles(nxt))))
                states.append(got)
            if 'stateAfter' in V and not P:
                want = states[V['stateAfter']]
                key = frag_set([ch[k]['smiles']])
                keep = V.get('only')
                if keep:
                    want = [x for x in want if x in frag_set([keep])]
                if not set(key) <= set(want) and key != want:
                    P.append('key %s is not in the state after step %d %s' % (key, V['stateAfter'], want))
                for i, c in enumerate(ch):
                    if i != k and c.get('smiles') and frag_set([c['smiles']]) == key:
                        P.append('choice %d duplicates the key' % i)
        if 'c13' in V:
            n = c13(V['c13'])
            if str(n) != str(ch[k]['text']).split()[0]:
                P.append('13C count is %d, key says %s' % (n, ch[k]['text']))
        if 'h1' in V:
            n = h1(V['h1'])
            if str(n) != str(ch[k]['text']).split()[0]:
                P.append('1H count is %d, key says %s' % (n, ch[k]['text']))
        if 'c13Each' in V:
            for i, c in enumerate(ch):
                n = c13(c['smiles'])
                if (n == V['c13Each']) != (i == k):
                    P.append('choice %d has %d carbon signals (want only the key at %d)' % (i, n, V['c13Each']))
        if 'h1Each' in V:
            for i, c in enumerate(ch):
                n = h1(c['smiles'])
                if (n == V['h1Each']) != (i == k):
                    P.append('choice %d has %d H signals (want only the key at %d)' % (i, n, V['h1Each']))
        if 'formula' in V:
            for smi, f in V['formula']:
                got = rdMolDescriptors.CalcMolFormula(Chem.MolFromSmiles(smi))
                if got != f:
                    P.append('formula of %s is %s not %s' % (smi, got, f))
        if 'formulaEach' in V:
            for i, c in enumerate(ch):
                got = rdMolDescriptors.CalcMolFormula(Chem.MolFromSmiles(c['smiles']))
                if got != V['formulaEach']:
                    P.append('choice %d formula %s, not %s' % (i, got, V['formulaEach']))
        if 'dou' in V:
            d = dou_formula(V['dou'])
            if str(int(d)) != str(ch[k]['text']).split()[0]:
                P.append('DoU of %s is %s, key says %s' % (V['dou'], d, ch[k]['text']))
        if 'eq' in V:
            la, ra = canon(V['eq']['leftAcid']), canon(V['eq']['rightAcid'])
            if la not in PKA or ra not in PKA:
                P.append('acid not in the reference table: %s / %s' % (la, ra))
            else:
                favored = 'right' if PKA[la] < PKA[ra] else 'left'
                if abs(PKA[la] - PKA[ra]) < 2:
                    P.append('pKa gap under 2 units, the side is not clear-cut')
                if favored != V['eq']['favors']:
                    P.append('reference pKa favors the %s side (%s vs %s), item says %s' % (favored, PKA[la], PKA[ra], V['eq']['favors']))
        if 'distinct' in V:
            seen = set()
            for i, c in enumerate(ch):
                if c.get('smiles'):
                    cs = tuple(frag_set([c['smiles']]))
                    if cs in seen:
                        P.append('choice %d repeats a structure' % i)
                    seen.add(cs)
    except Exception as ex:
        P.append('verifier error: %s' % ex)
    return P


def main():
    items = json.load(open(sys.argv[1]))
    rep = {}
    for it in items:
        p = check(it)
        if p:
            rep[it['id']] = p
    print(json.dumps({'ok': not rep, 'items': rep, 'checked': len(items)}, indent=1))
    sys.exit(0 if not rep else 1)


if __name__ == '__main__':
    main()
