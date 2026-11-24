#!/usr/bin/env python3
"""Original science items for Full-Length Tests 1 to 4 that replace near-duplicate items in place, key for key
(written for this repo, not drawn from any bank). Each numeric key is recomputed here before the file is merged
into replacements.json:   python3 scripts/mock-content/build-qr-v3.py && python3 scripts/mock-content/build-sci-v3.py"""
import json, os
from math import sqrt, log10
here = os.path.dirname(os.path.abspath(__file__))
OUT = json.load(open(os.path.join(here, "replacements.json")))
IDS = []
def add(test, sec, old, id, stop, d, q, opts, correct, w, s, t, c):
    assert len(opts) == 5 and len(t) == 5 and t[correct] is None and all(x for i, x in enumerate(t) if i != correct), id
    OUT.setdefault(test, {}).setdefault(sec, {})[old] = {"id": "v3:" + id, "stop": stop, "d": d, "q": q, "opts": opts, "correct": correct, "w": w, "s": s, "t": t, "c": c}
    IDS.append("v3:" + id)

add("FULL_2", "gc", "gchem-a:lw-e10", "gc-f2-ionization", "gc-5", 3,
    "Which of these third-period elements has the highest first ionization energy?",
    ["Na", "Al", "P", "S", "Mg"], 2,
    "Phosphorus is highest. Ionization energy rises across a period, but sulfur dips below phosphorus because its fourth 3p electron is paired and easier to remove.",
    ["Ionization energy rises left to right across a **period**.", "That puts P and S above Na, Mg and Al.", "Sulfur's paired 3p electron feels extra repulsion, so S dips below P.", "Phosphorus, with a half-filled 3p subshell, is highest."],
    ["Sodium is farthest left, with one loosely held 3s electron. It is the lowest of the five.", "Aluminum's first 3p electron is shielded by the filled 3s, so it even dips below magnesium.", None, "Sulfur is farther right, but removing its paired 3p electron relieves repulsion, so it sits below phosphorus.", "Magnesium has a filled 3s subshell but a much lower nuclear charge than phosphorus."],
    ["Which is higher in first ionization energy, Mg or Al?", "Mg. Aluminum's lone 3p electron is easier to remove than magnesium's paired 3s electrons."])
add("FULL_2", "gc", "generated:gc-limiting#5o2mox", "gc-f2-propane-co2", "gc-2", 2,
    "Propane burns completely: C₃H₈ + 5 O₂ → 3 CO₂ + 4 H₂O. What mass of CO₂ forms when 11.0 g of propane (44.0 g/mol) burns in excess oxygen? (CO₂ = 44.0 g/mol)",
    ["11.0 g", "33.0 g", "44.0 g", "22.0 g", "132 g"], 1,
    "33.0 g of CO₂ forms. 11.0 g of propane is 0.250 mol, each mole gives 3 mol of CO₂, and 0.750 mol x 44.0 g/mol = 33.0 g.",
    ["Convert to **moles**: 11.0 / 44.0 = 0.250 mol propane.", "Use the 3 to 1 ratio: 0.750 mol CO₂.", "Convert back: 0.750 x 44.0 = 33.0 g."],
    ["This leaves out the mole ratio. Each propane gives three CO₂, not one.", None, "This is the mass of one mole of CO₂. Only 0.750 mol forms.", "This uses a 2 to 1 ratio. The balanced equation shows 3 CO₂ per propane.", "This is the mass of CO₂ from a full mole of propane. Only 0.250 mol burned."],
    ["How many moles of O₂ does the 11.0 g of propane consume?", "0.250 mol x 5 = 1.25 mol O₂."])
assert abs(11.0 / 44.0 * 3 * 44.0 - 33.0) < 1e-9
add("FULL_2", "gc", "gchem-a:lr5", "gc-f2-percent-yield", "gc-2", 3,
    "In the reaction N₂ + 3 H₂ → 2 NH₃, 4.0 g of H₂ (2.0 g/mol) reacts with excess N₂ and 17.0 g of NH₃ (17.0 g/mol) is collected. What is the percent yield?",
    ["50%", "75%", "67%", "133%", "85%"], 1,
    "The percent yield is 75%. 2.0 mol of H₂ can make 1.33 mol of NH₃, the theoretical yield, and 1.00 mol was collected.",
    ["Moles of H₂: 4.0 / 2.0 = 2.0 mol.", "**Theoretical** NH₃: 2.0 x (2/3) = 1.33 mol.", "Actual NH₃: 17.0 / 17.0 = 1.00 mol.", "Percent yield: 1.00 / 1.33 = 75%."],
    ["This compares 1 mol of NH₃ with 2 mol of H₂. Compare actual product with theoretical product.", None, "This is the mole ratio 2/3 itself, not actual over theoretical.", "This divides theoretical by actual. A yield above 100% is the signal that the ratio is upside down.", "This is a guess near the right size. The mole work gives exactly 75%."],
    ["What mass of NH₃ would a 100% yield give?", "1.33 mol x 17.0 g/mol = 22.7 g."])
assert abs((17.0 / 17.0) / (4.0 / 2.0 * 2 / 3) - 0.75) < 1e-9
add("FULL_3", "gc", "gchem-a:gb-q1", "gc-f3-entropy-sign", "gc-10", 2,
    "For which process is the entropy change of the system negative?",
    ["H₂O(s) melts to H₂O(l) at 0 °C", "NaCl(s) dissolves in water to give Na⁺(aq) and Cl⁻(aq)", "CaCO₃(s) decomposes to CaO(s) and CO₂(g)", "N₂(g) + 3 H₂(g) forms 2 NH₃(g)", "CO₂(s) sublimes to CO₂(g) at 1 atm"], 3,
    "Forming ammonia lowers entropy: four moles of gas become two, so the particles have fewer ways to spread out.",
    ["Entropy tracks **moles of gas** first.", "Ammonia synthesis: 4 mol gas become 2 mol gas.", "Fewer gas particles means lower entropy.", "The other four make a liquid, ions or a gas from a solid."],
    ["Melting frees molecules from a fixed lattice, so entropy rises.", "Dissolving spreads the ions through the solution, so entropy rises.", "A gas forms from a solid, so entropy rises sharply.", None, "A solid turns straight into a gas, so entropy rises sharply."],
    ["What is the sign of the entropy change when steam condenses?", "Negative. A gas becomes a liquid."])
add("FULL_3", "gc", "generated:gc-ph#1u8ztlk", "gc-f3-kb-from-ka", "gc-13", 3,
    "The Ka of HF is 6.8 × 10⁻⁴ at 25 °C. What is the Kb of its conjugate base, F⁻?",
    ["6.8 × 10⁻⁴", "1.5 × 10⁻³", "6.8 × 10⁻¹⁰", "3.2", "1.5 × 10⁻¹¹"], 4,
    "Kb is 1.5 × 10⁻¹¹. For a conjugate pair Ka x Kb = Kw, so Kb = 1.0 × 10⁻¹⁴ / 6.8 × 10⁻⁴.",
    ["For a **conjugate pair**, Ka x Kb = Kw.", "Kb = 1.0 × 10⁻¹⁴ / 6.8 × 10⁻⁴.", "Divide: 1.5 × 10⁻¹¹."],
    ["This repeats Ka. The conjugate base of a weak acid is a much weaker base than that.", "This takes 1 / Ka with the wrong power of ten. Kb comes from Kw / Ka.", "This shifts Ka by six powers of ten. Divide Kw by Ka instead.", "This is pKa, the negative log of Ka, not a Kb.", None],
    ["What is the pKb of F⁻?", "14.00 - 3.17 = 10.83."])
assert abs(1e-14 / 6.8e-4 - 1.47e-11) < 1e-13
add("FULL_3", "gc", "gchem-a:xx-e10", "gc-f3-diprotic-titration", "gc-2", 3,
    "What volume of 0.150 M NaOH is needed to completely neutralize 25.0 mL of 0.120 M H₂SO₄?",
    ["10.0 mL", "20.0 mL", "40.0 mL", "31.3 mL", "62.5 mL"], 2,
    "40.0 mL is needed. The acid supplies 2 x 0.00300 = 0.00600 mol of H⁺, and 0.00600 mol / 0.150 M = 0.0400 L.",
    ["Moles of acid: 0.0250 L x 0.120 M = 0.00300 mol.", "H₂SO₄ is **diprotic**: 0.00600 mol H⁺.", "Volume of base: 0.00600 / 0.150 = 0.0400 L."],
    ["This halves the acid instead of doubling it. Each H₂SO₄ gives two H⁺.", "This treats H₂SO₄ as giving one H⁺. It gives two.", None, "This inverts the concentration ratio: 25.0 x 0.150 / 0.120.", "This inverts the concentration ratio and then doubles it."],
    ["What volume of the same NaOH neutralizes 25.0 mL of 0.120 M HCl?", "0.00300 mol / 0.150 M = 20.0 mL."])
assert abs(2 * 0.025 * 0.120 / 0.150 - 0.040) < 1e-12
add("FULL_4", "gc", "gchem-a:ca5", "gc-f4-enthalpy-formation", "gc-9", 3,
    "Standard enthalpies of formation: CH₄(g) = -75 kJ/mol, CO₂(g) = -394 kJ/mol, H₂O(l) = -286 kJ/mol. What is ΔH° for CH₄(g) + 2 O₂(g) → CO₂(g) + 2 H₂O(l)?",
    ["-891 kJ", "-755 kJ", "-605 kJ", "+891 kJ", "-1041 kJ"], 0,
    "ΔH° is -891 kJ. Products minus reactants: [-394 + 2(-286)] - [-75 + 0] = -966 + 75.",
    ["Use **products minus reactants**.", "Products: -394 + 2(-286) = -966 kJ.", "Reactants: -75 kJ (O₂ is zero).", "-966 - (-75) = -891 kJ."],
    [None, "This adds the three values without doubling water or subtracting methane.", "This counts one water. The equation makes two.", "This is reactants minus products. Combustion releases heat, so the sign is negative.", "This adds methane's -75 instead of subtracting it."],
    ["Why is the formation enthalpy of O₂(g) zero?", "It is an element in its standard state."])
assert (-394 + 2 * -286) - (-75) == -891
add("FULL_4", "gc", "generated:gc-ph#1xvu5bk", "gc-f4-buffer-ph", "gc-13", 3,
    "A buffer contains 0.20 M acetic acid and 0.40 M sodium acetate. The pKa of acetic acid is 4.74. What is the pH of the buffer? (log 2 = 0.30)",
    ["4.44", "4.74", "9.26", "2.37", "5.04"], 4,
    "The pH is 5.04. Henderson-Hasselbalch gives pH = pKa + log(base/acid) = 4.74 + log 2.",
    ["Use pH = pKa + log(**base/acid**).", "Ratio: 0.40 / 0.20 = 2.", "pH = 4.74 + 0.30 = 5.04."],
    ["This inverts the ratio and subtracts 0.30. There is more base than acid, so pH is above pKa.", "This is pKa, the pH only when acid and base are equal.", "This is 14 - pKa, the pKb of acetate, not the buffer's pH.", "This is half of pKa, which belongs to no buffer formula.", None],
    ["What is the pH if the two concentrations are swapped?", "4.74 - 0.30 = 4.44."])
assert abs(4.74 + log10(0.40 / 0.20) - 5.04) < 0.002
add("FULL_4", "gc", "generated:gc-dilution#1quyu21", "gc-f4-molality", "gc-8", 2,
    "What is the molality of a solution made by dissolving 18.0 g of glucose (180 g/mol) in 250 g of water?",
    ["0.40 m", "0.10 m", "0.072 m", "0.025 m", "4.0 m"], 0,
    "The molality is 0.40 m. 18.0 g is 0.100 mol of glucose, and 0.100 mol / 0.250 kg of water = 0.40 mol/kg.",
    ["Moles of solute: 18.0 / 180 = 0.100 mol.", "**Kilograms of solvent**: 0.250 kg.", "Divide: 0.100 / 0.250 = 0.40 m."],
    [None, "This is the moles of glucose. Divide by the kilograms of water.", "This divides the grams of glucose by the grams of water.", "This multiplies moles by kilograms. Molality divides them.", "This slips a decimal place. 0.100 / 0.250 is 0.40."],
    ["How does molality differ from molarity?", "Molality divides by kilograms of solvent. Molarity divides by liters of solution."])
assert abs(18.0 / 180 / 0.250 - 0.40) < 1e-12
add("FULL_1", "bio", "bio:BIO_p044", "bio-f1-bohr-shift", "bio-15", 3,
    "Which change shifts the oxygen-hemoglobin dissociation curve to the right, so that hemoglobin releases more oxygen to the tissues?",
    ["A fall in body temperature", "A rise in blood pH", "A fall in 2,3-BPG inside red blood cells", "Binding of carbon monoxide to hemoglobin", "A rise in the partial pressure of CO₂"], 4,
    "A rise in CO₂ shifts the curve right. More CO₂ (and the acid it forms) lowers hemoglobin's affinity for oxygen, so more oxygen is unloaded in active tissue. This is the Bohr effect.",
    ["A right shift means **lower affinity** for oxygen.", "Active tissue makes CO₂, acid and heat.", "Each of those loosens hemoglobin's grip on oxygen.", "So higher CO₂ shifts the curve right."],
    ["Cooling raises hemoglobin's affinity and shifts the curve left.", "A higher pH raises affinity and shifts the curve left. A lower pH shifts it right.", "Less 2,3-BPG raises affinity and shifts the curve left.", "Carbon monoxide makes the remaining sites hold oxygen more tightly, a left shift.", None],
    ["Fetal hemoglobin sits to which side of adult hemoglobin on this curve?", "To the left. It binds oxygen more tightly, which lets it pull oxygen from maternal blood."])
json.dump(OUT, open(os.path.join(here, "replacements.json"), "w"), indent=1, ensure_ascii=False)
vp = os.path.join(here, "v3-verified.json")
ids = sorted(set(json.load(open(vp))) | set(IDS))
json.dump(ids, open(vp, "w"), indent=1)
print("merged", len(IDS), "science items")
