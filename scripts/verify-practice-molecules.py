"""RDKit check of every molecule the Sciences + QR practice tests draw.

Usage: python3 -I scripts/verify-practice-molecules.py in.json out.json
(run by scripts/verify-practice-molecules.mjs, which collects the drawings)

Two kinds of job, one output object per job, in order:

  {"drawn": {"smi": "...", "atoms": [{"i", "el", "x", "y", "stereo"}],
             "bonds": [{"a", "b", "wedge": "up"|"down"|"", "narrow": atom id}]}}
      A SmilesDrawer drawing, read back from the positions and wedges it was
      drawn with (the method of scripts/explainers/rdkit-check.py on the
      explainer branch). The molecule is rebuilt from the SMILES (bond orders
      and aromaticity), its chiral tags cleared, the drawn coordinates (screen
      y flipped to y up) and drawn wedges (narrow end at "narrow") put on it,
      and RDKit assigns the configuration from the drawing alone. Heavy atom k
      of the drawing is atom k of the SMILES (the drawer keeps SMILES order).
      Returns whether the picture is the SMILES (stereo included) and the CIP
      label of every stereocenter in the SMILES and in the picture.

  {"figure": {"expect": "SMILES", "atoms": [{"id", "label", "x", "y", "charge"}],
              "bonds": [{"a", "b", "order"}], "aromatic": [[ids...]]}}
      A hand-built question figure (an inline SVG of text labels and lines),
      read back as a graph by the collector. Labels are expanded (CH3 is C
      with three H, EtO is an ethoxy whose O carries the bonds, FeBr3 is Fe
      with three Br), unlabeled line ends are carbons, rings drawn with a
      circle are aromatic. Returns the SMILES the figure depicts and whether
      it is the molecule set the question stem names (expect).
"""
import json
import sys

from rdkit import Chem, RDLogger
from rdkit.Chem import rdCIPLabeler
from rdkit.Geometry import Point3D

RDLogger.DisableLog('rdApp.*')


def can(m):
    return Chem.MolToSmiles(m)


def cip_map(m):
    rdCIPLabeler.AssignCIPLabels(m)
    return {a.GetIdx(): a.GetProp('_CIPCode') for a in m.GetAtoms() if a.HasProp('_CIPCode')}


def drawn_job(j):
    ref = Chem.MolFromSmiles(j['smi'])
    if ref is None:
        return {'ok': False, 'error': 'SMILES does not parse'}
    out = {'smi': j['smi']}
    out['cipSmiles'] = {str(k): v for k, v in cip_map(Chem.Mol(ref)).items() if v in ('R', 'S')}
    atoms = j['atoms']
    heavy = [a for a in atoms if a['el'] != 'H']
    if len(heavy) != ref.GetNumAtoms():
        return {'ok': False, 'error': 'drawing has %d heavy atoms, the SMILES %d' % (len(heavy), ref.GetNumAtoms()), 'cipSmiles': out['cipSmiles']}
    for k, a in enumerate(heavy):
        if a['el'].lower() != ref.GetAtomWithIdx(k).GetSymbol().lower():
            return {'ok': False, 'error': 'drawn atom %d is %s, the SMILES has %s' % (k, a['el'], ref.GetAtomWithIdx(k).GetSymbol()), 'cipSmiles': out['cipSmiles']}
    to_idx = {a['i']: k for k, a in enumerate(heavy)}
    by_id = {a['i']: a for a in atoms}
    h_parent = {}
    for b in j['bonds']:
        for x, y in ((b['a'], b['b']), (b['b'], b['a'])):
            if by_id.get(x, {}).get('el') == 'H' and y in to_idx:
                h_parent[x] = to_idx[y]
    only_on = sorted(set(h_parent.values()))
    m = Chem.Mol(ref)
    for a in m.GetAtoms():
        a.SetChiralTag(Chem.ChiralType.CHI_UNSPECIFIED)
    if only_on:
        m = Chem.AddHs(m, onlyOnAtoms=only_on)
    pool = {}
    for a in m.GetAtoms():
        if a.GetSymbol() == 'H' and a.GetIdx() >= ref.GetNumAtoms():
            pool.setdefault(a.GetNeighbors()[0].GetIdx(), []).append(a.GetIdx())
    h_idx = {}
    for hid, parent in sorted(h_parent.items()):
        if not pool.get(parent):
            return {'ok': False, 'error': 'the drawing shows more H on atom %d than the SMILES has' % parent, 'cipSmiles': out['cipSmiles']}
        h_idx[hid] = pool[parent].pop(0)
    # every drawn bond between heavy atoms must be a bond of the SMILES, and every SMILES bond drawn
    drawn_pairs = set()
    for b in j['bonds']:
        ia, ib = to_idx.get(b['a']), to_idx.get(b['b'])
        if ia is None or ib is None:
            continue
        if ref.GetBondBetweenAtoms(ia, ib) is None:
            return {'ok': False, 'error': 'drawn bond %d-%d is not in the SMILES' % (ia, ib), 'cipSmiles': out['cipSmiles']}
        drawn_pairs.add(tuple(sorted((ia, ib))))
    if len(drawn_pairs) != ref.GetNumBonds():
        return {'ok': False, 'error': 'the drawing has %d bonds between heavy atoms, the SMILES %d' % (len(drawn_pairs), ref.GetNumBonds()), 'cipSmiles': out['cipSmiles']}
    rw = Chem.RWMol(m)
    conf = Chem.Conformer(rw.GetNumAtoms())
    placed = set()
    for a in atoms:
        idx = to_idx.get(a['i'], h_idx.get(a['i']))
        if idx is None:
            continue
        conf.SetAtomPosition(idx, Point3D(float(a['x']), -float(a['y']), 0.0))
        placed.add(idx)
    for a in rw.GetAtoms():
        if a.GetIdx() not in placed:
            return {'ok': False, 'error': 'atom %d has no drawn position' % a.GetIdx(), 'cipSmiles': out['cipSmiles']}
    wedges = 0
    for b in j['bonds']:
        if not b.get('wedge'):
            continue
        wedges += 1
        ia = to_idx.get(b['a'], h_idx.get(b['a']))
        ib = to_idx.get(b['b'], h_idx.get(b['b']))
        if ia is None or ib is None:
            continue
        narrow = to_idx.get(b.get('narrow'), h_idx.get(b.get('narrow')))
        begin, end = (ia, ib) if narrow == ia else (ib, ia)
        bond = rw.GetBondBetweenAtoms(begin, end)
        if bond.GetBeginAtomIdx() != begin:
            bt, arom = bond.GetBondType(), bond.GetIsAromatic()
            rw.RemoveBond(begin, end)
            rw.AddBond(begin, end, bt)
            bond = rw.GetBondBetweenAtoms(begin, end)
            bond.SetIsAromatic(arom)
        bond.SetBondDir(Chem.BondDir.BEGINWEDGE if b['wedge'] == 'up' else Chem.BondDir.BEGINDASH)
    dm = rw.GetMol()
    dm.RemoveAllConformers()
    dm.AddConformer(conf, assignId=True)
    try:
        Chem.SanitizeMol(dm)
    except Exception as e:  # noqa: BLE001
        return {'ok': False, 'error': 'sanitize: %s' % e, 'cipSmiles': out['cipSmiles']}
    Chem.AssignChiralTypesFromBondDirs(dm)
    Chem.AssignStereochemistry(dm, cleanIt=True, force=True)
    plain = Chem.RemoveHs(dm)
    out['drawnSmiles'] = can(plain)
    out['wedges'] = wedges
    out['same'] = can(plain) == can(ref)
    out['cipDrawn'] = {str(k): v for k, v in cip_map(Chem.Mol(plain)).items() if v in ('R', 'S')}
    out['ok'] = out['same'] and out['cipDrawn'] == out['cipSmiles']
    return out


# condensed labels: (element of the atom the bonds reach, [(element, bonded to) ...] for the rest)
LABELS = {
    'C': ('C', []), 'O': ('O', []), 'N': ('N', []), 'H': ('H', []), 'Cl': ('Cl', []), 'Br': ('Br', []), 'I': ('I', []), 'F': ('F', []),
    'CH3': ('C', [('H', 0)] * 3), 'H3C': ('C', [('H', 0)] * 3), 'CH2': ('C', [('H', 0)] * 2), 'CH': ('C', [('H', 0)]),
    'OH': ('O', [('H', 0)]), 'HO': ('O', [('H', 0)]), 'NH2': ('N', [('H', 0)] * 2), 'SH': ('S', [('H', 0)]),
    'EtO': ('O', [('C', 0), ('C', 1)]),
    'FeBr3': ('Fe', [('Br', 0)] * 3),
}


def figure_job(j):
    rw = Chem.RWMol()
    ids = {}
    for a in j['atoms']:
        if a.get('skeletal'):
            # a bare line end: a carbon with as many H as it needs
            ids[a['id']] = rw.AddAtom(Chem.Atom('C'))
            continue
        lab = a['label']
        if lab not in LABELS:
            return {'ok': False, 'error': 'unknown label %r' % lab}
        el, rest = LABELS[lab]
        at = Chem.Atom(el)
        at.SetFormalCharge(int(a.get('charge') or 0))
        at.SetNoImplicit(True)          # a written label shows every H it has
        k = rw.AddAtom(at)
        ids[a['id']] = k
        made = [k]
        for el2, on in rest:
            k2 = rw.AddAtom(Chem.Atom(el2))
            rw.AddBond(made[on], k2, Chem.BondType.SINGLE)
            made.append(k2)
    for b in j['bonds']:
        bt = {1: Chem.BondType.SINGLE, 2: Chem.BondType.DOUBLE, 3: Chem.BondType.TRIPLE}[b['order']]
        rw.AddBond(ids[b['a']], ids[b['b']], bt)
    for ring in j.get('aromatic', []):
        ks = [ids[x] for x in ring]
        for x in ks:
            rw.GetAtomWithIdx(x).SetIsAromatic(True)
        for p in range(len(ks)):
            bd = rw.GetBondBetweenAtoms(ks[p], ks[(p + 1) % len(ks)])
            if bd is None:
                return {'ok': False, 'error': 'aromatic ring is not closed'}
            bd.SetBondType(Chem.BondType.AROMATIC)
            bd.SetIsAromatic(True)
    m = rw.GetMol()
    try:
        Chem.SanitizeMol(m)
    except Exception as e:  # noqa: BLE001
        return {'ok': False, 'error': 'sanitize: %s' % e}
    drawn = can(Chem.RemoveHs(m))
    exp = Chem.MolFromSmiles(j['expect'])
    want = can(exp) if exp is not None else None
    return {'ok': drawn == want, 'drawnSmiles': drawn, 'expect': want, 'same': drawn == want}


def main():
    jobs = json.load(open(sys.argv[1]))
    out = []
    for j in jobs:
        try:
            if 'drawn' in j:
                out.append({'drawn': drawn_job(j['drawn'])})
            elif 'figure' in j:
                out.append({'figure': figure_job(j['figure'])})
            else:
                out.append({'error': 'unknown job'})
        except Exception as e:  # noqa: BLE001
            out.append({'error': repr(e)})
    json.dump(out, open(sys.argv[2], 'w'), indent=1)


if __name__ == '__main__':
    main()
