#!/usr/bin/env python3
"""Build tools/ochem/wheel/wheel-structures.json for the Reaction Wheel cards.

    python3 tools/ochem/wheel/build-wheel-structures.py

Every starting material and every product on the 23 wheels is written here
once as SMILES with its written name. RDKit then makes, for each molecule:
  * the DAT-style skeleton drawing (black and white, same options as
    scripts/build-oc-3d.py), and
  * 3D coordinates (ETKDGv3, then MMFF94) when the molecule has no generic
    R group, so the card can offer a 3D model beside the drawing.
Formulas come from RDKit, never typed by hand. The build also checks each
product against its starting material (atoms that cannot appear from nowhere)
and fails loudly if a SMILES does not parse.

Why this exists: an audit on 2026-11-16 found hand-drawn wheel structures
whose carbon count disagreed with their own names (butane drawn with five
carbons, 2-propanol drawn as 2-butanol, 2-butyne drawn as 3-hexyne). The
card now draws from this file instead.
"""
import json
import os
import re

from rdkit import Chem
from rdkit.Chem import AllChem
from rdkit.Chem.Draw import rdMolDraw2D
from rdkit.Chem.rdMolDescriptors import CalcMolFormula

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'wheel-structures.json')

# Starting material for each wheel: the representative molecule the products
# below are worked from.
SUBSTRATES = {
    'alkene_terminal': ('C=CC', 'propene'),
    'alkene_internal': ('CC=CC', '2-butene'),
    'alkyne_terminal': ('C#CCC', '1-butyne'),
    'alkyne_internal': ('CC#CC', '2-butyne'),
    'halide_primary': ('CCCBr', '1-bromopropane'),
    'halide_secondary': ('CC(C)Br', '2-bromopropane'),
    'halide_tertiary': ('CC(C)(C)Br', '2-bromo-2-methylpropane (tert-butyl bromide)'),
    'alcohol_primary': ('CCCO', '1-propanol'),
    'alcohol_secondary': ('CC(C)O', '2-propanol (isopropyl alcohol)'),
    'alcohol_tertiary': ('CC(C)(C)O', '2-methyl-2-propanol (tert-butanol)'),
    'epoxide': ('CC1CO1', '2-methyloxirane (propylene oxide)'),
    'benzene': ('c1ccccc1', 'benzene'),
    'aniline': ('Nc1ccccc1', 'aniline'),
    'aldehyde': ('CCC=O', 'propanal'),
    'ketone': ('CCC(C)=O', '2-butanone'),
    'ester': ('CC(=O)OC', 'methyl acetate'),
    'acid': ('CC(=O)O', 'acetic acid (ethanoic acid)'),
    'amide': ('CC(N)=O', 'acetamide'),
    'nitrile': ('CCC#N', 'propanenitrile'),
    'acid_chloride': ('CC(=O)Cl', 'acetyl chloride'),
    'toluene': ('Cc1ccccc1', 'toluene (methylbenzene)'),
    'alkane': ('CC(C)C', '2-methylpropane (isobutane)'),
    'diene': ('C=CC=C', '1,3-butadiene'),
}

# Products, keyed exactly like RXN_DB. A list means more than one product
# (cleavage or a mixture); '*' is a generic group whose label is given in
# LABELS (default R).
P = {
    'alkene_terminal__hbr': ('CC(C)Br', '2-bromopropane'),
    'alkene_terminal__hbr_peroxide': ('CCCBr', '1-bromopropane'),
    'alkene_terminal__h3o': ('CC(C)O', '2-propanol'),
    'alkene_terminal__hg_h2o': ('CC(C)O', '2-propanol'),
    'alkene_terminal__bh3_h2o2': ('CCCO', '1-propanol'),
    'alkene_terminal__h2_pt': ('CCC', 'propane'),
    'alkene_terminal__br2': ('CC(Br)CBr', '1,2-dibromopropane'),
    'alkene_terminal__br2_h2o': ('CC(O)CBr', '1-bromo-2-propanol'),
    'alkene_terminal__mcpba': ('CC1CO1', '2-methyloxirane'),
    'alkene_terminal__oso4': ('CC(O)CO', '1,2-propanediol'),
    'alkene_terminal__o3_zn': (['CC=O', 'C=O'], 'acetaldehyde + formaldehyde'),
    'alkene_terminal__o3_h2o2': (['CC(=O)O', 'O=C=O'], 'acetic acid + CO\u2082'),
    'alkene_terminal__kmno4_hot': (['CC(=O)O', 'O=C=O'], 'acetic acid + CO\u2082'),
    'alkene_internal__h2_pt': ('CCCC', 'butane'),
    'alkene_internal__hbr': ('CCC(C)Br', '2-bromobutane'),
    'alkene_internal__br2': ('CC(Br)C(C)Br', '2,3-dibromobutane'),
    'alkene_internal__o3_zn': (['CC=O', 'CC=O'], 'two acetaldehyde'),
    'alkene_internal__oso4': ('CC(O)C(C)O', '2,3-butanediol'),
    'alkyne_terminal__h2_lindlar': ('C=CCC', '1-butene'),
    'alkyne_terminal__na_nh3': ('C=CCC', '1-butene'),
    'alkyne_terminal__h2_pt': ('CCCC', 'butane'),
    'alkyne_terminal__hg_h2o': ('CCC(C)=O', '2-butanone'),
    'alkyne_terminal__bh3_h2o2': ('CCCC=O', 'butanal'),
    'alkyne_terminal__hx_once': ('C=C(Br)CC', '2-bromo-1-butene'),
    'alkyne_terminal__hx_twice': ('CCC(C)(Br)Br', '2,2-dibromobutane'),
    'alkyne_terminal__nanh2': ('[C-]#CCC', 'butynide (acetylide) anion'),
    'alkyne_internal__h2_lindlar': ('C/C=C\\C', 'cis-2-butene'),
    'alkyne_internal__na_nh3': ('C/C=C/C', 'trans-2-butene'),
    'alkyne_internal__o3_zn': (['CC(=O)O', 'CC(=O)O'], 'two acetic acid'),
    'alcohol_primary__pcc': ('CCC=O', 'propanal'),
    'alcohol_primary__jones': ('CCC(=O)O', 'propanoic acid'),
    'alcohol_secondary__pcc': ('CC(C)=O', 'acetone (propanone)'),
    'alcohol_secondary__jones': ('CC(C)=O', 'acetone (propanone)'),
    'alcohol_tertiary__jones': ('CC(C)(C)O', 'no reaction: tert-butanol stays'),
    'alcohol_primary__socl2': ('CCCCl', '1-chloropropane'),
    'alcohol_secondary__socl2': ('CC(C)Cl', '2-chloropropane'),
    'alcohol_primary__pbr3': ('CCCBr', '1-bromopropane'),
    'alcohol_secondary__pbr3': ('CC(C)Br', '2-bromopropane'),
    'alcohol_tertiary__socl2': ('CC(C)(C)Cl', '2-chloro-2-methylpropane (tert-butyl chloride)'),
    'alcohol_tertiary__h2so4_heat': ('C=C(C)C', '2-methylpropene (isobutylene)'),
    'alcohol_secondary__h2so4_heat': ('C=CC', 'propene'),
    'alcohol_primary__tscl_py': ('CCCO*', 'propyl tosylate'),
    'alcohol_primary__nah_rx': ('CCCOCCC', 'dipropyl ether (with 1-bromopropane as R-X)'),
    'alcohol_primary__rcooh_h': ('CCCOC(C)=O', 'propyl acetate (with acetic acid)'),
    'halide_primary__nai_acetone': ('CCCI', '1-iodopropane'),
    'halide_primary__nacn': ('CCCC#N', 'butanenitrile'),
    'halide_primary__naoh': ('CCCO', '1-propanol'),
    'halide_secondary__nai_acetone': ('CC(C)I', '2-iodopropane'),
    'halide_secondary__naoet': ('C=CC', 'propene'),
    'halide_tertiary__h3o': (['CC(C)(C)O', 'C=C(C)C'], 'tert-butanol + 2-methylpropene'),
    'halide_tertiary__tbuok': ('C=C(C)C', '2-methylpropene (the only alkene possible here)'),
    'halide_tertiary__naoet': ('C=C(C)C', '2-methylpropene'),
    'halide_primary__nan3_lah': ('CCCN', '1-propanamine (propylamine)'),
    'halide_primary__phthal_hydr': ('CCCN', '1-propanamine (propylamine)'),
    'aldehyde__nabh4': ('CCCO', '1-propanol'),
    'aldehyde__lah': ('CCCO', '1-propanol'),
    'aldehyde__rmgbr_h': ('CCC(O)*', 'secondary alcohol, R from the Grignard'),
    'aldehyde__hcn': ('CCC(O)C#N', '2-hydroxybutanenitrile (cyanohydrin)'),
    'aldehyde__primary_amine': ('CCC=N*', 'imine (N-R propan-1-imine)'),
    'aldehyde__sec_amine': ('CC=CN(*)*', 'enamine'),
    'aldehyde__2_roh_h': ('CCC(OC)OC', '1,1-dimethoxypropane (acetal, with methanol)'),
    'aldehyde__wittig_ch2': ('C=CCC', '1-butene'),
    'aldehyde__clemmensen': ('CCC', 'propane'),
    'aldehyde__wolff_kishner': ('CCC', 'propane'),
    'aldehyde__jones': ('CCC(=O)O', 'propanoic acid'),
    'ketone__nabh4': ('CCC(C)O', '2-butanol'),
    'ketone__rmgbr_h': ('CCC(C)(O)*', 'tertiary alcohol, R from the Grignard'),
    'ketone__2_roh_h': ('CCC(C)(OC)OC', '2,2-dimethoxybutane (ketal, with methanol)'),
    'ketone__primary_amine': ('CCC(C)=N*', 'imine (ketimine)'),
    'ketone__wittig_ch2': ('C=C(C)CC', '2-methyl-1-butene'),
    'ketone__hcn': ('CCC(C)(O)C#N', '2-hydroxy-2-methylbutanenitrile (cyanohydrin)'),
    'ketone__nh3_nabh3cn': ('CCC(C)N*', 'secondary amine (N-R 2-butanamine)'),
    'acid__socl2': ('CC(=O)Cl', 'acetyl chloride'),
    'acid__rcooh_h': ('CC(=O)O', 'no useful change: it is already the acid'),
    'acid__lah': ('CCO', 'ethanol'),
    'ester__naoh': (['CC(=O)[O-].[Na+]', 'CO'], 'sodium acetate + methanol'),
    'ester__lah': (['CCO', 'CO'], 'ethanol + methanol'),
    'ester__dibal_cold': ('CC=O', 'acetaldehyde (ethanal)'),
    'amide__lah': ('CCN', 'ethanamine (ethylamine)'),
    'nitrile__lah': ('CCCN', '1-propanamine (propylamine)'),
    'nitrile__dibal_cold': ('CCC=O', 'propanal'),
    'benzene__x2_fe': ('Brc1ccccc1', 'bromobenzene (with Br2/FeBr3)'),
    'benzene__hno3_h2so4': ('O=[N+]([O-])c1ccccc1', 'nitrobenzene'),
    'benzene__so3_h2so4': ('O=S(=O)(O)c1ccccc1', 'benzenesulfonic acid'),
    'benzene__rx_alcl3': ('*c1ccccc1', 'alkylbenzene (R may rearrange)'),
    'benzene__rcocl_alcl3': ('*C(=O)c1ccccc1', 'aryl ketone'),
    'aniline__nano2_hcl_cubr': ('Brc1ccccc1', 'bromobenzene'),
    'aniline__nano2_hcl_cucl': ('Clc1ccccc1', 'chlorobenzene'),
    'aniline__nano2_hcl_h3po2': ('c1ccccc1', 'benzene'),
    'epoxide__h2o_acid': ('CC(O)CO', '1,2-propanediol'),
    'epoxide__nu_base': ('CC(O)COC', '1-methoxy-2-propanol (with methoxide)'),
    'epoxide__rmgbr_h': ('CC(O)C*', 'secondary alcohol, R adds at the less hindered carbon'),
    'acid_chloride__h2o_plain': ('CC(=O)O', 'acetic acid'),
    'acid_chloride__roh_py': ('CC(=O)O*', 'acetate ester'),
    'acid_chloride__amine_2eq': ('CC(=O)N*', 'N-substituted acetamide'),
    'acid_chloride__lialh_otbu3': ('CC=O', 'acetaldehyde (ethanal)'),
    'acid_chloride__gilman': ('CC(=O)*', 'methyl ketone'),
    'acid_chloride__rmgbr_xs': ('CC(O)(*)*', 'tertiary alcohol, two R groups from the Grignard'),
    'alkane__br2_hv': ('CC(C)(C)Br', '2-bromo-2-methylpropane'),
    'alkane__cl2_hv': (['CC(C)(C)Cl', 'CC(C)CCl'], 'mixture: 2-chloro- and 1-chloro-2-methylpropane'),
    'diene__dienophile_d': ('*C1CC=CCC1', 'cyclohexene ring (Diels-Alder adduct)'),
    'diene__h2_pt': ('CCCC', 'butane'),
    'toluene__nbs_hv': ('BrCc1ccccc1', 'benzyl bromide'),
    'toluene__kmno4_ar': ('O=C(O)c1ccccc1', 'benzoic acid'),
    'toluene__x2_fe': (['Cc1ccc(Br)cc1', 'Cc1ccccc1Br'], 'p-bromotoluene + o-bromotoluene'),
}

# Label for the generic '*' atom when it is not R.
LABELS = {
    'alcohol_primary__tscl_py': 'Ts',
    'diene__dienophile_d': 'EWG',
    'aldehyde__primary_amine': 'R', 'aldehyde__sec_amine': 'R',
    'acid_chloride__roh_py': "R'", 'acid_chloride__gilman': "R'", 'acid_chloride__rmgbr_xs': "R'",
    'aldehyde__rmgbr_h': "R'",
}


def mol_of(smi, label='R'):
    m = Chem.MolFromSmiles(smi)
    if m is None:
        raise SystemExit('bad SMILES: ' + smi)
    for a in m.GetAtoms():
        if a.GetAtomicNum() == 0:
            a.SetProp('atomLabel', label)
    return m


def draw(m, size=(300, 200)):
    m = Chem.Mol(m)
    AllChem.Compute2DCoords(m)
    d = rdMolDraw2D.MolDraw2DSVG(*size)
    o = d.drawOptions()
    o.useBWAtomPalette()
    o.clearBackground = False
    o.bondLineWidth = 2
    o.addStereoAnnotation = False
    o.fixedBondLength = 34
    o.padding = 0.08
    rdMolDraw2D.PrepareMolForDrawing(m)
    d.DrawMolecule(m)
    d.FinishDrawing()
    svg = d.GetDrawingText()
    svg = svg[svg.find('<svg'):].replace('\n', '')
    # Compact: drop the XML header attributes RDKit adds, round coordinates,
    # let colour follow CSS (black on cream, cream on dark).
    svg = re.sub(r"(\d+\.\d)\d+", r"\1", svg)
    svg = svg.replace('#000000', 'currentColor').replace('#000', 'currentColor')
    svg = re.sub(r"<!--.*?-->", '', svg)
    svg = re.sub(r"<rect[^>]*/>", '', svg, count=1)
    svg = re.sub(r" xmlns:rdkit='[^']*'| xmlns:xlink='[^']*'| xml:space='preserve'", '', svg)
    svg = re.sub(r"style='fill:none;fill-rule:evenodd;stroke:currentColor;stroke-width:2.0px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1'", "", svg)
    svg = re.sub(r" class='(bond|atom)-[^']*'", '', svg)
    svg = re.sub(r"\s+", ' ', svg).replace(' />', '/>')
    # Crop the viewBox to the drawing so small molecules are not lost in white space.
    nums = re.findall(r"[ML ,Q]\s?(-?\d+\.?\d*)[ ,](-?\d+\.?\d*)", ' '.join(re.findall(r" d='([^']*)'", svg)))
    xs = [float(a) for a, b in nums]; ys = [float(b) for a, b in nums]
    pad = 8
    x0, y0, x1, y1 = min(xs) - pad, min(ys) - pad, max(xs) + pad, max(ys) + pad
    # width/height give every drawing the same bond length on screen (about
    # 29 px), so a small molecule is not blown up to fill its card.
    k = 0.85
    head = "<svg xmlns='http://www.w3.org/2000/svg' class='wh-mol' width='%d' height='%d' viewBox='%.1f %.1f %.1f %.1f' fill='none' stroke='currentColor' stroke-width='2' role='img'>" % (round((x1 - x0) * k), round((y1 - y0) * k), x0, y0, x1 - x0, y1 - y0)
    body = svg[svg.find('>') + 1:].replace("fill='currentColor'", "fill='currentColor' stroke='none'")
    return head + body


def embed3d(m):
    if any(a.GetAtomicNum() == 0 for a in m.GetAtoms()):
        return None
    frags = Chem.GetMolFrags(m, asMols=True)
    if len(frags) != 1:
        return None
    mh = Chem.AddHs(m)
    ps = AllChem.ETKDGv3()
    ps.randomSeed = 11
    if AllChem.EmbedMolecule(mh, ps) != 0:
        return None
    if AllChem.MMFFHasAllMoleculeParams(mh):
        AllChem.MMFFOptimizeMolecule(mh, maxIters=2000)
    conf = mh.GetConformer()
    pts = [conf.GetAtomPosition(i) for i in range(mh.GetNumAtoms())]
    cx = sum(p.x for p in pts) / len(pts); cy = sum(p.y for p in pts) / len(pts); cz = sum(p.z for p in pts) / len(pts)
    atoms = [[a.GetSymbol(), round(pts[a.GetIdx()].x - cx, 3), round(pts[a.GetIdx()].y - cy, 3), round(pts[a.GetIdx()].z - cz, 3)] for a in mh.GetAtoms()]
    bonds = [[b.GetBeginAtomIdx(), b.GetEndAtomIdx(), int(b.GetBondTypeAsDouble())] for b in mh.GetBonds()]
    return {'atoms': atoms, 'bonds': bonds}


def entry(smiles, name, label='R'):
    parts = smiles if isinstance(smiles, list) else [smiles]
    mols = [mol_of(s, label) for s in parts]
    return {
        'name': name,
        'smiles': parts,
        'formula': [CalcMolFormula(m) if not any(a.GetAtomicNum() == 0 for a in m.GetAtoms()) else None for m in mols],
        'svg': [draw(m) for m in mols],
        'd3': [embed3d(m) for m in mols],
    }


def heavy(m):
    out = {}
    for a in m.GetAtoms():
        if a.GetAtomicNum() > 1:
            out[a.GetSymbol()] = out.get(a.GetSymbol(), 0) + 1
    return out


def main():
    out = {'built': 'RDKit ' + Chem.rdBase.rdkitVersion, 'substrates': {}, 'products': {}}
    for k, (smi, name) in SUBSTRATES.items():
        out['substrates'][k] = entry(smi, name)
    problems = []
    for k, (smi, name) in P.items():
        out['products'][k] = entry(smi, name, LABELS.get(k, 'R'))
        # Sanity: a product with no generic group and no reagent carbon source
        # should not have more carbons than its starting material.
        sub = k.split('__')[0]
        sc = heavy(mol_of(SUBSTRATES[sub][0])).get('C', 0)
        parts = smi if isinstance(smi, list) else [smi]
        for s in parts:
            m = mol_of(s)
            if any(a.GetAtomicNum() == 0 for a in m.GetAtoms()):
                continue
            pc = heavy(m).get('C', 0)
            grows = k.split('__')[1] in ('nacn', 'hcn', 'wittig_ch2', 'nah_rx', 'rcooh_h', '2_roh_h', 'nu_base', 'tscl_py')
            if pc > sc and not grows:
                problems.append('%s: product has %d C, start has %d' % (k, pc, sc))
    if problems:
        raise SystemExit('carbon check failed:\n' + '\n'.join(problems))
    with open(OUT, 'w') as f:
        json.dump(out, f, ensure_ascii=False, separators=(',', ':'))
    print('wrote', OUT, os.path.getsize(OUT), 'bytes,', len(out['substrates']), 'substrates,', len(out['products']), 'products')


if __name__ == '__main__':
    main()
