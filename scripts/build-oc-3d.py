#!/usr/bin/env python3
"""Build data/oc-3d.json for the OChem 3D lab (/oc/3d/) with RDKit.

    python3 scripts/build-oc-3d.py

For every molecule: 3D coordinates (ETKDG, then MMFF94), the DAT-style skeleton drawing
(black and white, wedges and dashes from the same stereo), the same drawing with CIP
priorities, and the answer key computed by RDKit's CIP labeler, never typed by hand.
Chair items: both chairs are embedded, classified axial or equatorial from the geometry,
and the energy gap comes from MMFF94.
"""
import json
import math
import os

from rdkit import Chem
from rdkit.Chem import AllChem, rdCIPLabeler
from rdkit.Chem.Draw import rdMolDraw2D

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'data', 'oc-3d.json')

STEREO = [
    # id, name as written, condensed formula, SMILES with stereo
    ('butan-2-ol', '2-butanol', 'CH3CH(OH)CH2CH3', 'C[C@@H](O)CC'),
    ('alanine', 'alanine', 'CH3CH(NH2)COOH', 'C[C@H](N)C(=O)O'),
    ('glyceraldehyde', 'glyceraldehyde', 'HOCH2CH(OH)CHO', 'OC[C@@H](O)C=O'),
    ('bromobutane', '2-bromobutane', 'CH3CHBrCH2CH3', 'C[C@H](Br)CC'),
    ('lactic', 'lactic acid', 'CH3CH(OH)COOH', 'C[C@H](O)C(=O)O'),
    ('chlorofluoro', '1-chloro-1-fluoroethane', 'CH3CHFCl', 'C[C@@H](F)Cl'),
    ('propan-2-ol', '2-propanol', 'CH3CH(OH)CH3', 'CC(O)C'),
]
CHAIRS = [
    ('methylcyclohexane', 'methylcyclohexane', 'C6H11CH3', 'CC1CCCCC1', [0]),
    ('tbutylcyclohexane', 'tert-butylcyclohexane', 'C6H11C(CH3)3', 'CC(C)(C)C1CCCCC1', [1]),
]
COLORS = {'C': '#3d4440', 'H': '#ece8de', 'O': '#c4452f', 'N': '#2f5f9e', 'Br': '#8a3b1e', 'Cl': '#2f7d4f', 'F': '#7fae5a'}


def embed(mol, seed=11, n=1):
    mh = Chem.AddHs(mol)
    ps = AllChem.ETKDGv3()
    ps.randomSeed = seed
    cids = AllChem.EmbedMultipleConfs(mh, numConfs=n, params=ps)
    res = AllChem.MMFFOptimizeMoleculeConfs(mh, maxIters=2000)
    return mh, list(cids), [e for (_, e) in res]


def atoms_bonds(mh, cid):
    conf = mh.GetConformer(cid)
    pts = [conf.GetAtomPosition(i) for i in range(mh.GetNumAtoms())]
    cx = sum(p.x for p in pts) / len(pts); cy = sum(p.y for p in pts) / len(pts); cz = sum(p.z for p in pts) / len(pts)
    atoms = [{'el': a.GetSymbol(), 'x': round(pts[a.GetIdx()].x - cx, 3), 'y': round(pts[a.GetIdx()].y - cy, 3), 'z': round(pts[a.GetIdx()].z - cz, 3)} for a in mh.GetAtoms()]
    bonds = [[b.GetBeginAtomIdx(), b.GetEndAtomIdx(), int(b.GetBondTypeAsDouble())] for b in mh.GetBonds()]
    return atoms, bonds


def draw(mol, notes=None, highlight=None, size=(420, 300)):
    m = Chem.Mol(mol)
    AllChem.Compute2DCoords(m)
    if notes:
        for idx, txt in notes.items():
            m.GetAtomWithIdx(idx).SetProp('atomNote', txt)
    d = rdMolDraw2D.MolDraw2DSVG(*size)
    o = d.drawOptions()
    o.useBWAtomPalette()
    o.clearBackground = False
    o.bondLineWidth = 2
    o.annotationFontScale = 0.85
    o.addStereoAnnotation = False
    rdMolDraw2D.PrepareMolForDrawing(m)
    if highlight is not None:
        d.DrawMolecule(m, highlightAtoms=[highlight], highlightAtomColors={highlight: (0.95, 0.86, 0.55)}, highlightBonds=[])
    else:
        d.DrawMolecule(m)
    d.FinishDrawing()
    svg = d.GetDrawingText()
    return svg[svg.find('<svg'):].replace('\n', '')


def stereo_item(mid, name, condensed, smi):
    mol = Chem.MolFromSmiles(smi)
    rdCIPLabeler.AssignCIPLabels(mol)
    centers = [a.GetIdx() for a in mol.GetAtoms() if a.HasProp('_CIPCode')]
    potential = Chem.FindMolChiralCenters(mol, includeUnassigned=True, useLegacyImplementation=False)
    mh, cids, energies = embed(mol)
    atoms, bonds = atoms_bonds(mh, cids[0])
    item = {'id': mid, 'kind': 'stereo', 'name': name, 'condensed': condensed, 'smiles': smi, 'atoms': atoms, 'bonds': bonds}
    if centers:
        c = centers[0]
        label = mol.GetAtomWithIdx(c).GetProp('_CIPCode')
        # Priorities 1 to 4 from RDKit's CIP ranks (legacy ranker, which duplicates double bonds),
        # then checked against the 3D model: with priority 4 pointing away, 1-2-3 must turn the way the label says.
        mhr = Chem.AddHs(mol)
        Chem.AssignStereochemistry(mhr, cleanIt=True, force=True)
        nbrs = [n.GetIdx() for n in mhr.GetAtomWithIdx(c).GetNeighbors()]
        order = sorted(nbrs, key=lambda i: int(mhr.GetAtomWithIdx(i).GetProp('_CIPRank')), reverse=True)
        prio = {i: str(k + 1) for k, i in enumerate(order)}
        conf = mh.GetConformer(cids[0])
        P = lambda i: conf.GetAtomPosition(i)
        v = [[P(i).x - P(c).x, P(i).y - P(c).y, P(i).z - P(c).z] for i in order[:3]]
        cross = [v[0][1] * v[1][2] - v[0][2] * v[1][1], v[0][2] * v[1][0] - v[0][0] * v[1][2], v[0][0] * v[1][1] - v[0][1] * v[1][0]]
        trip = sum(cross[k] * v[2][k] for k in range(3))
        geo = 'R' if trip < 0 else 'S'
        assert geo == label, (mid, 'priorities disagree with the CIP label', geo, label)
        heavy_notes = {i: prio[i] for i in order if i < mol.GetNumAtoms()}
        item.update({'center': c, 'answer': label, 'priority': {str(i): int(prio[i]) for i in order},
                     'svg': draw(mol, highlight=c), 'svgReveal': draw(mol, notes=heavy_notes, highlight=c)})
    else:
        item.update({'center': None, 'answer': 'none', 'svg': draw(mol), 'svgReveal': draw(mol)})
    return item


def ring_normal(pos, ring):
    """Mean plane of the ring by least squares (SVD); returns its center and unit normal."""
    import numpy as np
    pts = np.array([pos[i] for i in ring])
    c = pts.mean(axis=0)
    _, _, vt = np.linalg.svd(pts - c)
    return list(c), list(vt[2])


def chair_item(mid, name, condensed, smi, sub_atoms):
    mol = Chem.MolFromSmiles(smi)
    mh, cids, energies = embed(mol, seed=3, n=60)
    ring = [list(r) for r in mol.GetRingInfo().AtomRings() if len(r) == 6][0]
    found = {}
    for cid, e in zip(cids, energies):
        conf = mh.GetConformer(cid)
        pos = [[conf.GetAtomPosition(i).x, conf.GetAtomPosition(i).y, conf.GetAtomPosition(i).z] for i in range(mh.GetNumAtoms())]
        # a chair: alternating signed distances from the mean plane
        c, n = ring_normal(pos, ring)
        d = [sum((pos[i][k] - c[k]) * n[k] for k in range(3)) for i in ring]
        if not all(d[k] * d[(k + 1) % 6] < 0 and abs(d[k]) > 0.15 for k in range(6)):
            continue
        sub = sub_atoms[0]
        ring_atom = [x.GetIdx() for x in mol.GetAtomWithIdx(sub).GetNeighbors() if x.GetIdx() in ring][0]
        v = [pos[sub][k] - pos[ring_atom][k] for k in range(3)]
        L = math.sqrt(sum(x * x for x in v))
        cosang = abs(sum(v[k] * n[k] for k in range(3)) / L)
        kind = 'axial' if cosang > 0.8 else ('equatorial' if cosang < 0.5 else None)
        if kind and (kind not in found or e < found[kind][1]):
            found[kind] = (cid, e)
    assert 'axial' in found and 'equatorial' in found, (mid, found)
    out = {'id': mid, 'kind': 'chair', 'name': name, 'condensed': condensed, 'smiles': smi, 'svg': draw(mol), 'svgReveal': draw(mol)}
    for kind in ('axial', 'equatorial'):
        atoms, bonds = atoms_bonds(mh, found[kind][0])
        out[kind] = {'atoms': atoms, 'bonds': bonds, 'energy': round(found[kind][1], 2)}
    out['gap'] = round(found['axial'][1] - found['equatorial'][1], 2)
    out['answer'] = 'equatorial' if out['gap'] > 0 else 'axial'
    return out


def main():
    items = [stereo_item(*s) for s in STEREO] + [chair_item(*c) for c in CHAIRS]
    data = {'format': 1, 'built': 'scripts/build-oc-3d.py with RDKit (ETKDG + MMFF94; CIP labels from rdCIPLabeler)', 'colors': COLORS, 'items': items}
    with open(OUT, 'w') as f:
        json.dump(data, f, separators=(',', ':'))
    for it in items:
        print('%-20s %-6s %s' % (it['id'], it.get('answer'), ('gap %.2f kcal/mol' % it['gap']) if it['kind'] == 'chair' else it['smiles']))
    print('wrote', OUT, os.path.getsize(OUT) // 1024, 'KB')


if __name__ == '__main__':
    main()
