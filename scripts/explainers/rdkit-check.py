"""RDKit checks for the explainer build and the render gates.

Usage: python3 -I scripts/explainers/rdkit-check.py in.json out.json

Ported from the pilot (question-system/pilot-scripts/rdkit-check.py and
drawn-cip.py). One output object per input job, in order.

Job shapes:
  {"smi": "..."}
      parse only. Returns ok, canonical SMILES, heavy atom count.
  {"smi": "...", "cip": [{"atom": i, "config": "R"}]}
      parse plus CIP labels (new CIP labeler) at the given atoms.
  {"same": ["smiA", "smiB"]}
      the two SMILES are the same molecule (canonical SMILES equal).
  {"stereo": {"smi": key SMILES, "centers": {"C2": 1, "C3": 3},
              "choices": [{"text": ..., "labels": {"C2": "S", "C3": "R"},
                           "relation": "diastereomer", "claimsMeso": false|null}]}}
      stereo relation of every labeled choice to the key isomer: same,
      enantiomer or diastereomer, and whether the isomer is meso.
  {"drawn": {"smi": "...", "atoms": [{"i", "el", "x", "y"}],
             "bonds": [{"a", "b", "wedge": "up"|"down"|"", "narrow": atom id}]}}
      what a 2D drawing depicts. The molecule is rebuilt from the SMILES (so
      bond orders and aromaticity come from the SMILES), its chiral tags are
      cleared, the drawn coordinates (screen y flipped to y up) and the drawn
      wedges (narrow end at "narrow") are put on it, and RDKit assigns the
      configuration from the drawing. Drawn H atoms are matched to their
      heavy atom. Heavy atom k of the drawing is atom k of the SMILES (the
      drawer keeps SMILES order). Returns whether the picture is the SMILES,
      and the CIP label of every stereocenter in the SMILES and in the picture.
"""
import json
import sys

from rdkit import Chem, RDLogger
from rdkit.Chem import rdCIPLabeler
from rdkit.Chem.EnumerateStereoisomers import EnumerateStereoisomers
from rdkit.Geometry import Point3D

RDLogger.DisableLog('rdApp.*')


def cip_map(m):
    rdCIPLabeler.AssignCIPLabels(m)
    return {a.GetIdx(): a.GetProp('_CIPCode') for a in m.GetAtoms() if a.HasProp('_CIPCode')}


def mirror(m):
    mm = Chem.Mol(m)
    for a in mm.GetAtoms():
        t = a.GetChiralTag()
        if t == Chem.ChiralType.CHI_TETRAHEDRAL_CW:
            a.SetChiralTag(Chem.ChiralType.CHI_TETRAHEDRAL_CCW)
        elif t == Chem.ChiralType.CHI_TETRAHEDRAL_CCW:
            a.SetChiralTag(Chem.ChiralType.CHI_TETRAHEDRAL_CW)
    return mm


def can(m):
    return Chem.MolToSmiles(m)


def stereo_job(j):
    key = Chem.MolFromSmiles(j['smi'])
    flat = Chem.Mol(key)
    for a in flat.GetAtoms():
        a.SetChiralTag(Chem.ChiralType.CHI_UNSPECIFIED)
    isomers = []
    for iso in EnumerateStereoisomers(flat):
        Chem.AssignStereochemistry(iso, cleanIt=True, force=True)
        isomers.append(iso)
    key_can = can(key)
    out = {'isomers': [], 'choices': [], 'ok': True}
    any_meso = False
    for iso in isomers:
        labels = cip_map(Chem.Mol(iso))
        meso = can(mirror(iso)) == can(iso)
        any_meso = any_meso or meso
        out['isomers'].append({'smi': can(iso), 'labels': labels, 'meso': meso})
    for c in j['choices']:
        want = {j['centers'][k]: v for k, v in c['labels'].items()}
        hit = [iso for iso in out['isomers'] if all(iso['labels'].get(i) == v for i, v in want.items())]
        r = {'text': c['text'], 'found': len(hit) == 1}
        if hit:
            smi = hit[0]['smi']
            m = Chem.MolFromSmiles(smi)
            if smi == key_can:
                rel = 'same'
            elif can(mirror(m)) == key_can:
                rel = 'enantiomer'
            else:
                rel = 'diastereomer'
            r['relation'] = rel
            r['isomerMeso'] = hit[0]['meso']
            r['relationOk'] = (c.get('relation') is None) or (c['relation'] == rel)
            if c.get('claimsMeso') is not None:
                r['mesoOk'] = (c['claimsMeso'] == hit[0]['meso'])
        else:
            r['relationOk'] = False
        out['ok'] = out['ok'] and r['found'] and r['relationOk'] and r.get('mesoOk', True)
        out['choices'].append(r)
    out['anyMeso'] = any_meso
    return out


def drawn_job(j):
    ref = Chem.MolFromSmiles(j['smi'])
    if ref is None:
        return {'ok': False, 'error': 'SMILES does not parse'}
    out = {'ok': True, 'smi': j['smi']}
    ref_labels = cip_map(Chem.Mol(ref))
    out['cipSmiles'] = {str(k): v for k, v in ref_labels.items() if v in ('R', 'S')}
    atoms = j['atoms']
    heavy = [a for a in atoms if a['el'] != 'H']
    if len(heavy) != ref.GetNumAtoms():
        return {'ok': False, 'error': 'drawing has %d heavy atoms, the SMILES %d' % (len(heavy), ref.GetNumAtoms()), 'cipSmiles': out['cipSmiles']}
    to_idx = {a['i']: k for k, a in enumerate(heavy)}
    by_id = {a['i']: a for a in atoms}
    # drawn H atoms: which heavy atom carries each one
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
    # match drawn H atoms to the added H atoms of the same heavy atom
    h_idx = {}
    pool = {}
    for a in m.GetAtoms():
        if a.GetSymbol() == 'H' and a.GetIdx() >= ref.GetNumAtoms():
            pool.setdefault(a.GetNeighbors()[0].GetIdx(), []).append(a.GetIdx())
    for hid, parent in sorted(h_parent.items()):
        if not pool.get(parent):
            return {'ok': False, 'error': 'the drawing shows more H on atom %d than the SMILES has' % parent, 'cipSmiles': out['cipSmiles']}
        h_idx[hid] = pool[parent].pop(0)
    rw = Chem.RWMol(m)
    conf = Chem.Conformer(rw.GetNumAtoms())
    placed = set()
    for a in atoms:
        idx = to_idx.get(a['i'], h_idx.get(a['i']))
        if idx is None:
            continue
        conf.SetAtomPosition(idx, Point3D(float(a['x']), -float(a['y']), 0.0))
        placed.add(idx)
    # any H the drawing does not show stays implicit; nothing else may lack a position
    for a in rw.GetAtoms():
        if a.GetIdx() not in placed:
            return {'ok': False, 'error': 'atom %d has no drawn position' % a.GetIdx(), 'cipSmiles': out['cipSmiles']}
    # wedges: begin atom at the narrow end
    for b in j['bonds']:
        if not b.get('wedge'):
            continue
        ia = to_idx.get(b['a'], h_idx.get(b['a']))
        ib = to_idx.get(b['b'], h_idx.get(b['b']))
        if ia is None or ib is None:
            continue
        narrow = to_idx.get(b.get('narrow'), h_idx.get(b.get('narrow')))
        begin, end = (ia, ib) if narrow == ia else (ib, ia)
        bond = rw.GetBondBetweenAtoms(begin, end)
        if bond is None:
            return {'ok': False, 'error': 'drawn bond %d-%d is not in the SMILES' % (begin, end), 'cipSmiles': out['cipSmiles']}
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
    out['same'] = can(plain) == can(ref)
    drawn_labels = cip_map(Chem.Mol(plain))
    out['cipDrawn'] = {str(k): v for k, v in drawn_labels.items() if v in ('R', 'S')}
    return out


def main():
    jobs = json.load(open(sys.argv[1]))
    out = []
    for j in jobs:
        if 'stereo' in j:
            out.append({'stereo': stereo_job(j['stereo'])})
            continue
        if 'drawn' in j:
            out.append({'drawn': drawn_job(j['drawn'])})
            continue
        if 'same' in j:
            a, b = (Chem.MolFromSmiles(s) for s in j['same'])
            out.append({'ok': a is not None and b is not None, 'same': a is not None and b is not None and can(a) == can(b)})
            continue
        m = Chem.MolFromSmiles(j['smi'])
        r = {'smi': j['smi'], 'ok': m is not None}
        if m is not None:
            r['canonical'] = can(m)
            r['heavy'] = m.GetNumAtoms()
        if m is not None and j.get('cip'):
            got = cip_map(m)
            r['cip'] = {str(k): v for k, v in got.items()}
            r['cipOk'] = all(got.get(c['atom']) == c['config'] for c in j['cip'])
        out.append(r)
    json.dump(out, open(sys.argv[2], 'w'))


if __name__ == '__main__':
    main()
