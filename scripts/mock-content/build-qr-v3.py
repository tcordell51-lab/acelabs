#!/usr/bin/env python3
"""Original QR items for Full-Length Tests 1 to 4 (written for this repo, not drawn from any bank).
Every numeric key is recomputed here with exact fractions before replacements.json is written:
    python3 scripts/mock-content/build-qr-v3.py
The items replace off-blueprint (trigonometry, geometry), duplicate and too-easy items in place, key for key."""
import json, os
from fractions import Fraction as F
from math import comb

QC = ["Quantity A is greater", "Quantity B is greater", "The two quantities are equal", "The relationship cannot be determined from the information given"]
DS = ["Statement (1) ALONE is sufficient, but statement (2) alone is not sufficient.", "Statement (2) ALONE is sufficient, but statement (1) alone is not sufficient.",
      "BOTH statements TOGETHER are sufficient, but NEITHER statement ALONE is sufficient.", "EACH statement ALONE is sufficient.", "Statements (1) and (2) TOGETHER are NOT sufficient."]
OUT = {}
KEYS = {}
LOOSE = {"qr-f1-estimate-quotient", "qr-f2-discriminant", "qr-f3-exponent-eq"}   # checked by their own assert above the item
def add(test, old, id, stop, d, q, opts, correct, w, s, t, c, fmt=None, val=None, key=None):
    if val is not None and id not in LOOSE: KEYS["v3:" + id] = val * 100 if "%" in opts[0] else val
    assert len(t) == len(opts) and t[correct] is None and all(x for i, x in enumerate(t) if i != correct), id
    if val is not None: assert val == key, (id, val, key)
    it = {"id": "v3:" + id, "stop": stop, "d": d, "q": q, "opts": opts, "correct": correct, "w": w, "s": s, "t": t, "c": c}
    if fmt: it["fmt"] = fmt
    OUT.setdefault(test, {}).setdefault("qr", {})[old] = it
def qc(test, old, id, d, a, b, correct, w, s, t, c, lead=""):
    add(test, old, id, "qr-qc", d, (lead + "\n\n" if lead else "") + "Quantity A: " + a + "\nQuantity B: " + b, QC, correct, w, s, t, c, fmt="qc")
def ds(test, old, id, d, q, s1, s2, correct, w, s, t, c):
    add(test, old, id, "qr-ds", d, q + "\n\n(1) " + s1 + "\n(2) " + s2, DS, correct, w, s, t, c, fmt="ds")

# ---------------------------------------------------------------- FULL_1
add("FULL_1", "written:qr-11-rn4znq", "qr-f1-marbles", "qr-12", 3,
    "A bag holds 5 red, 4 blue and 3 green marbles. Two marbles are drawn at random without replacement. What is the probability that both are the same color?",
    ["19/66", "1/3", "25/72", "1/2", "47/66"], 0,
    "The probability is 19/66. There are 10 + 6 + 3 = 19 same-color pairs out of 66 possible pairs.",
    ["Count all pairs: **12 choose 2** = 66.", "Same-color pairs: 10 red, 6 blue, 3 green.", "Add them: 19 pairs.", "Divide: 19/66."],
    [None, "This is only a rough guess of one in three colors. The colors are not equally common.", "This squares each color's share, which is drawing with replacement. The first marble is not put back.", "Half would need as many same-color pairs as mixed pairs. Only 19 of 66 match.", "This is the chance the two colors differ. The question asks for the same color."],
    ["Same bag: what is the probability that the two marbles are different colors?", "It is the complement: 1 - 19/66 = 47/66."],
    val=F(comb(5, 2) + comb(4, 2) + comb(3, 2), comb(12, 2)), key=F(19, 66))
add("FULL_1", "written:qr-11-1ntn2bl", "qr-f1-mean-removed", "qr-13", 3,
    "A class of 25 students has a mean exam score of 76. The 5 students who took the exam early had a mean of 92. What is the mean score of the other 20 students?",
    ["60", "68", "72", "74", "84"], 2,
    "The mean is 72. The class total is 25 x 76 = 1,900 points, the early group holds 5 x 92 = 460, and the remaining 1,440 points are shared by 20 students.",
    ["Find the class **total**: 25 x 76 = 1,900.", "Early group total: 5 x 92 = 460.", "Subtract: 1,900 - 460 = 1,440.", "Divide by 20 students: 72."],
    ["This subtracts the full 16-point gap from 76. The gap is diluted across 20 students.", "This takes off 8 points, twice the real drop. Work from totals instead.", None, "This is a guess just under 76. The totals give exactly 72.", "This averages 76 and 92. The other students must sit below the class mean, not above it."],
    ["If instead the 5 early students had a mean of 96, what is the mean of the other 20?", "(1,900 - 480) / 20 = 71."],
    val=F(25 * 76 - 5 * 92, 20), key=72)
add("FULL_1", "qr-a:men1234", "qr-f1-pipes-drain", "qr-7", 3,
    "Pipe A fills a tank in 6 hours and pipe B fills it in 9 hours. A drain empties the full tank in 18 hours. If the tank starts empty and all three are open, how many hours does it take to fill?",
    ["3.0", "3.6", "4.5", "6.0", "7.5"], 2,
    "It takes 4.5 hours. The net rate is 1/6 + 1/9 - 1/18 = 4/18 of the tank per hour, and the time is the reciprocal.",
    ["Write each **rate** per hour: 1/6, 1/9 and 1/18.", "Add the fills and subtract the drain: 4/18.", "Time = 18/4 = 4.5 hours."],
    ["This is half of pipe A's time. Pipe B is slower than A and the drain works against both.", "This is the time for the two pipes with no drain. The drain removes 1/18 of a tank each hour.", None, "This is pipe A alone. Pipe B adds more than the drain removes, so the job is faster than 6 hours.", "This averages 6 and 9. Times do not average; rates add."],
    ["With the drain closed, how long do the two pipes take together?", "1/6 + 1/9 = 5/18 per hour, so 18/5 = 3.6 hours."],
    val=1 / (F(1, 6) + F(1, 9) - F(1, 18)), key=F(9, 2))
add("FULL_1", "qr-a:uni1479", "qr-f1-clinic-visits", "qr-13", 2,
    "A clinic recorded these patient visits in one week.\n\nMonday: 48\nTuesday: 60\nWednesday: 54\nThursday: 72\nFriday: 66\n\nWhat is the percent increase from the day with the fewest visits to the day with the most visits?",
    ["20%", "24%", "25%", "33%", "50%"], 4,
    "The increase is 50%. The fewest visits were 48 and the most were 72, a rise of 24 on a base of 48.",
    ["Find the low and high: 48 and 72.", "Change: 72 - 48 = 24.", "Divide by the **starting value**: 24/48 = 0.50."],
    ["This is the rise from Tuesday to Thursday, 12/60. Tuesday is not the day with the fewest visits.", "This reports the change of 24 visits as if it were a percent.", "This is the rise from Monday to Tuesday, 12/48. Tuesday is not the highest day.", "This divides 24 by 72, the ending value. Percent increase uses the starting value.", None],
    ["What is the percent decrease from Thursday to Friday?", "(72 - 66)/72 = 8.3%, about 8%."],
    val=F(72 - 48, 48), key=F(1, 2))
add("FULL_1", "generated:qr-perm-vs-comb#y9j3s6", "qr-f1-system-product", "qr-5", 2,
    "If 3x + 2y = 24 and x - y = 3, what is the value of xy?",
    ["3", "6", "9", "18", "24"], 3,
    "The product is 18. Substituting x = y + 3 gives 5y + 9 = 24, so y = 3 and x = 6.",
    ["From the second equation, **x = y + 3**.", "Substitute: 3(y + 3) + 2y = 24.", "Solve: y = 3, then x = 6.", "Multiply: 6 x 3 = 18."],
    ["This is y alone. The question asks for the product of x and y.", "This is x alone. Multiply it by y.", "This is x + y. The question asks for xy.", None, "This is the right side of the first equation, not a product of the solution."],
    ["With the same equations, what is x + y?", "x = 6 and y = 3, so x + y = 9."],
    val=6 * 3, key=18)
add("FULL_1", "qr-b:QR_xp005", "qr-f1-estimate-quotient", "qr-2", 2,
    "Which of the following is closest to (0.0489 x 612) / 0.203?",
    ["150", "300", "600", "1,500", "15,000"], 0,
    "The value is closest to 150. Rounding gives (0.05 x 600) / 0.2 = 30 / 0.2 = 150, and the exact value is about 147.",
    ["Round each number: **0.05**, 600 and 0.2.", "Top: 0.05 x 600 = 30.", "Divide: 30 / 0.2 = 150."],
    [None, "This doubles the answer, as if dividing by 0.1 instead of 0.2.", "This is about 612 itself. The two decimals do not cancel: 0.0489 / 0.203 is about one quarter.", "This is off by a factor of ten: a decimal place slipped.", "This is off by a factor of one hundred: both small decimals were mishandled."],
    ["Estimate (0.0489 x 612) x 0.203.", "About 30 x 0.2 = 6."],
    val=round(0.0489 * 612 / 0.203), key=147)
qc("FULL_1", "qr-a:dec1107", "qr-f1-qc-powers", 3, "2^30", "3^20", 1,
   "Quantity B is greater. Write both with exponent 10: 2^30 = 8^10 and 3^20 = 9^10. Since 9 is larger than 8, 3^20 is larger.",
   ["Match the **exponents**: 2^30 = (2^3)^10 = 8^10.", "Likewise 3^20 = (3^2)^10 = 9^10.", "Compare the bases: 9 beats 8."],
   ["The larger exponent does not win here. With matching exponents the base 9 beats the base 8.", None, "8^10 and 9^10 are different numbers, so the quantities are not equal.", "Both quantities are fixed numbers, so the comparison can always be made."],
   ["Which is greater, 2^15 or 5^6?", "2^15 = 32^3 = 32,768 and 5^6 = 125^2 = 15,625, so 2^15 is greater."])
assert 2 ** 30 < 3 ** 20
qc("FULL_1", "qr-a:vol1676", "qr-f1-qc-square", 2, "x", "5", 3,
   "The relationship cannot be determined. x squared is 49, so x is 7 or -7. One value is above 5 and the other is below it.",
   ["Solve: x = 7 or x = **-7**.", "Test 7: greater than 5.", "Test -7: less than 5.", "Two different results, so no fixed relationship."],
   ["This uses only x = 7. The negative root, -7, is less than 5.", "This uses only x = -7. The positive root, 7, is greater than 5.", "Neither 7 nor -7 equals 5.", None],
   ["If the lead said x^2 = 49 and x > 0, what is the answer?", "Then x = 7 only, and Quantity A is greater."], lead="x^2 = 49")
ds("FULL_1", "qr-a:dec1108", "qr-f1-ds-value", 2, "What is the value of x?", "x^2 = 16", "3x + 5 = 17", 1,
   "Statement (2) alone is enough: 3x + 5 = 17 gives x = 4. Statement (1) allows 4 or -4, so it does not fix one value.",
   ["Statement (1): x is 4 or **-4**. Not enough.", "Statement (2): a linear equation, one solution, x = 4.", "Only the second statement works alone."],
   ["Statement (1) leaves two values, 4 and -4, so it is not sufficient alone.", None, "The second statement already gives one value. You do not need both.", "Statement (1) alone allows two values, so it is not true that each works.", "Statement (2) gives exactly one value, so the question can be answered."],
   ["Would x^3 = 64 be sufficient alone?", "Yes. A cube has one real root, x = 4."])
ds("FULL_1", "qr-a:dis1285", "qr-f1-ds-pens", 3, "A store sold only pens and notebooks one morning. How many pens did it sell?", "It sold 40 items in all.", "Pens cost $2 each, notebooks cost $5 each, and the morning's sales came to $125.", 2,
   "Both statements together are needed. Together p + n = 40 and 2p + 5n = 125 give n = 15 and p = 25. Alone, each leaves many possible pen counts.",
   ["Statement (1): p + n = 40. Many pairs fit.", "Statement (2): 2p + 5n = 125. Several pairs fit.", "Together: two equations, **two unknowns**, one answer.", "Solve: n = 15, p = 25."],
   ["A total of 40 items does not say how many were pens.", "The dollar total alone fits several pen counts, such as 60 pens with 1 notebook or 55 pens with 3.", None, "Neither statement alone fixes the number of pens.", "The two equations together have exactly one solution, 25 pens."],
   ["Using both statements, how many notebooks were sold?", "15 notebooks."])
for p in range(0, 63):
    pass
assert [(p, n) for p in range(0, 41) for n in [40 - p] if 2 * p + 5 * n == 125] == [(25, 15)]
assert len([(p, n) for p in range(0, 63) for n in range(0, 26) if 2 * p + 5 * n == 125]) > 1

# ---------------------------------------------------------------- FULL_2
qc("FULL_2", "generated:qr-sci-notation-product#bt630n", "qr-f2-qc-dice-coins", 3, "The probability that two fair dice show a sum of at least 4", "The probability that three fair coin flips show at least one head", 0,
   "Quantity A is greater. Only 3 of 36 dice rolls sum to less than 4, so A = 33/36 = 11/12. Only 1 of 8 flip outcomes has no head, so B = 7/8.",
   ["Use the **complement** for each quantity.", "Dice: 3 of 36 rolls sum below 4, so A = 11/12.", "Coins: no heads is 1 of 8, so B = 7/8.", "Compare: 11/12 is about 0.917, above 0.875."],
   [None, "7/8 is 0.875 and 11/12 is about 0.917, so the dice quantity is larger.", "11/12 and 7/8 are close but not equal.", "Both probabilities are fixed numbers, so they can be compared."],
   ["What is the probability that two fair dice show a sum of at least 11?", "Three rolls work (5 and 6, 6 and 5, 6 and 6), so 3/36 = 1/12."])
assert F(33, 36) > F(7, 8) and sum(1 for a in range(1, 7) for b in range(1, 7) if a + b >= 4) == 33
qc("FULL_2", "qr-a:pem1308", "qr-f2-qc-roots", 2, "(sqrt(50) + sqrt(18)) / sqrt(2)", "8", 2,
   "The two quantities are equal. Dividing each root by the square root of 2 gives sqrt(25) + sqrt(9) = 5 + 3 = 8.",
   ["Divide each term: sqrt(50)/sqrt(2) = **sqrt(25)** = 5.", "Likewise sqrt(18)/sqrt(2) = sqrt(9) = 3.", "Add: 5 + 3 = 8."],
   ["Estimating the roots loosely can overshoot. The exact value is 5 + 3 = 8.", "The expression simplifies to exactly 8, not less.", None, "The expression is a fixed number, so the comparison can be made."],
   ["Simplify (sqrt(48) - sqrt(12)) / sqrt(3).", "sqrt(16) - sqrt(4) = 4 - 2 = 2."])
assert abs((50 ** .5 + 18 ** .5) / 2 ** .5 - 8) < 1e-9
ds("FULL_2", "written:qr-11-znbg69", "qr-f2-ds-jacket", 2, "What was the price of a jacket before a 20 percent discount?", "After the discount, the jacket costs $68.", "The discount is $17.", 3,
   "Each statement alone is enough. From (1), 0.80 x price = 68, so the price is $85. From (2), 0.20 x price = 17, so the price is again $85.",
   ["Statement (1): 80 percent of the price is 68, so price = **85**.", "Statement (2): 20 percent of the price is 17, so price = 85.", "Each one works without the other."],
   ["Statement (2) also works alone: 17 / 0.20 = 85.", "Statement (1) also works alone: 68 / 0.80 = 85.", "You do not need both. Either statement fixes the price.", None, "Either statement gives $85, so the question can be answered."],
   ["A coat is 30 percent off and the discount is $36. What was the original price?", "36 / 0.30 = $120."])
assert F(68) / F(8, 10) == 85 and F(17) / F(2, 10) == 85
ds("FULL_2", "qr-a:g2d5", "qr-f2-ds-trip-speed", 3, "What was a driver's average speed for an entire trip?", "The driver covered the first half of the distance at 40 miles per hour.", "The entire trip took 3 hours.", 4,
   "The statements together are not enough. Average speed is total distance over total time, and no statement gives the distance or the speed on the second half.",
   ["Average speed needs **total distance** and total time.", "Statement (1) gives a speed for half the distance only.", "Statement (2) gives time but no distance.", "Together the distance is still unknown: 120 miles and 180 miles both fit."],
   ["The first-half speed says nothing about the second half or the total.", "Three hours with no distance gives no speed.", "Even together the distance is open. A 120 mile trip and a 180 mile trip both fit.", "Neither statement works alone, and they do not work together either.", None],
   ["Add a third fact: the trip was 150 miles. What is the average speed?", "150 miles / 3 hours = 50 miles per hour."])
add("FULL_2", "written:qr-11-1idv8g5", "qr-f2-discriminant", "qr-6", 3,
    "For what value of k does the equation kx^2 - 12x + 9 = 0 have exactly one real solution?",
    ["2", "3", "4", "6", "9"], 2,
    "k = 4. A quadratic has exactly one real solution when its discriminant is zero: 144 - 36k = 0.",
    ["One solution means the **discriminant** is zero.", "b^2 - 4ac = 144 - 36k.", "Set it to zero: k = 4.", "Check: 4x^2 - 12x + 9 = (2x - 3)^2."],
    ["With k = 2 the discriminant is 72, which gives two solutions.", "With k = 3 the discriminant is 36, which gives two solutions.", None, "With k = 6 the discriminant is negative, so there is no real solution.", "With k = 9 the discriminant is negative, so there is no real solution."],
    ["For what k does x^2 + kx + 25 = 0 have exactly one real solution, if k is positive?", "k^2 - 100 = 0, so k = 10."],
    val=144 - 36 * 4, key=0)
add("FULL_2", "qr-a:est1210", "qr-f2-acid-mix", "qr-8", 3,
    "How many liters of a 60 percent acid solution must be added to 30 liters of a 20 percent acid solution to make a 36 percent acid solution?",
    ["8", "12", "16", "20", "24"], 3,
    "Add 20 liters. Acid in equals acid out: 0.60x + 6 = 0.36(30 + x), so 0.24x = 4.8.",
    ["Track the **acid**: 0.60x from the new solution, 6 liters already there.", "Final acid: 0.36(30 + x).", "Solve 0.60x + 6 = 10.8 + 0.36x.", "0.24x = 4.8, so x = 20."],
    ["Adding 8 liters gives 10.8 / 38, about 28 percent. Too weak.", "Adding 12 liters gives 13.2 / 42, about 31 percent. Too weak.", "Adding 16 liters gives 15.6 / 46, about 34 percent. Still short of 36.", None, "Adding 24 liters gives 20.4 / 54, about 38 percent. Too strong."],
    ["How much pure water must be added to 30 liters of 20 percent acid to make it 15 percent?", "6 / (30 + x) = 0.15, so x = 10 liters."],
    val=F(48, 10) / F(24, 100), key=20)
add("FULL_2", "qr-a:dis1282", "qr-f2-abs-count", "qr-5", 3,
    "How many integers x satisfy |2x - 5| < 9?",
    ["5", "6", "7", "8", "9"], 3,
    "Eight integers work. The inequality means -9 < 2x - 5 < 9, so -2 < x < 7, which holds for the integers from -1 through 6.",
    ["Rewrite as a **double inequality**: -9 < 2x - 5 < 9.", "Add 5: -4 < 2x < 14.", "Divide by 2: -2 < x < 7.", "Count -1 through 6: eight integers."],
    ["This counts too few. All the integers from -1 through 6 work.", "This counts only 1 through 6 and drops -1 and 0.", "This drops one end value. Both -1 and 6 satisfy the inequality.", None, "This counts 7 or -2 as well. At those values the expression equals 9, which is not less than 9."],
    ["How many integers satisfy |2x - 5| <= 9?", "Now -2 and 7 count too, so ten integers."],
    val=sum(1 for x in range(-50, 50) if abs(2 * x - 5) < 9), key=8)
add("FULL_2", "qr-a:abs1735", "qr-f2-budget-shares", "qr-13", 3,
    "A lab's yearly budget is split as follows.\n\nSalaries: 45%\nEquipment: 25%\nSupplies: 15%\nTravel: 10%\nOther: 5%\n\nIf the lab spends $18,000 more on equipment than on supplies, what is the total budget?",
    ["$72,000", "$120,000", "$135,000", "$150,000", "$180,000"], 4,
    "The budget is $180,000. Equipment and supplies differ by 25% - 15% = 10% of the budget, and 10% equals $18,000.",
    ["Find the gap in **percent**: 25 - 15 = 10 points.", "So 10% of the budget is $18,000.", "Total = 18,000 / 0.10 = $180,000."],
    ["This divides $18,000 by 25%, treating it as all of equipment. It is only the gap.", "This divides $18,000 by 15%, treating it as all of supplies. It is only the gap.", "This guesses between the other values. The 10 point gap gives the total directly.", "This is too low: 10% of $150,000 is $15,000, not $18,000.", None],
    ["With that total, how much is spent on salaries?", "45% of $180,000 = $81,000."],
    val=F(18000) / F(10, 100), key=180000)
add("FULL_2", "qr-a:rat1377", "qr-f2-binomial-guess", "qr-12", 4,
    "A student guesses at random on 4 multiple-choice questions that each have 5 choices. What is the probability that exactly 2 of the 4 guesses are correct?",
    ["16/625", "24/625", "1/25", "96/625", "2/5"], 3,
    "The probability is 96/625. Choose which 2 questions are right (6 ways), then multiply by (1/5)^2 for the right ones and (4/5)^2 for the wrong ones.",
    ["Each guess is right with probability **1/5**.", "One pattern: (1/5)(1/5)(4/5)(4/5) = 16/625.", "Patterns: 4 choose 2 = 6.", "Multiply: 6 x 16/625 = 96/625."],
    ["This is the chance of one specific pattern. Six patterns have exactly two right.", "This counts the 6 patterns but uses 4/5 once. Both wrong guesses need a factor of 4/5.", "This is the chance of getting two given questions right, ignoring the other two.", None, "This adds 1/5 twice. Probabilities of separate guesses multiply."],
    ["Same setup: what is the probability that all 4 guesses are wrong?", "(4/5)^4 = 256/625."],
    val=comb(4, 2) * F(1, 5) ** 2 * F(4, 5) ** 2, key=F(96, 625))

# ---------------------------------------------------------------- FULL_3
ds("FULL_3", "qr-a:ds3", "qr-f3-ds-median", 2, "What is the median of a list of five different integers?", "When the integers are listed from least to greatest, the third integer is 12.", "The mean of the five integers is 12.", 0,
   "Statement (1) alone is enough: the median of five numbers is the third one in order, which is 12. A mean of 12 does not fix the middle value.",
   ["The **median** of five numbers is the third in order.", "Statement (1) names that number: 12.", "Statement (2): 1, 2, 3, 4, 50 has mean 12 and median 3.", "So only the first statement works."],
   [None, "A mean of 12 fits many lists with different middle values, such as 1, 2, 3, 4, 50.", "The first statement already gives the median. You do not need both.", "The mean alone does not fix the median, so it is not true that each works.", "Statement (1) states the middle value directly, so the question can be answered."],
   ["A list of six numbers in order is 2, 5, 9, 13, 20, 41. What is the median?", "The mean of the two middle values: (9 + 13)/2 = 11."])
qc("FULL_3", "qr-a:ds1694", "qr-f3-qc-spread", 2, "The standard deviation of 10, 12, 14, 16, 18", "The standard deviation of 6, 10, 14, 18, 22", 1,
   "Quantity B is greater. Both lists have a mean of 14, but the second list's values sit twice as far from the mean, so its standard deviation is twice as large.",
   ["Both lists center on 14.", "First list: steps of 2 from the mean.", "Second list: steps of 4, twice the **spread**.", "More spread means a larger standard deviation."],
   ["The first list is packed more tightly around 14, so its standard deviation is smaller.", None, "Equal means do not make equal spreads. The second list is twice as spread out.", "Both lists are fully given, so both standard deviations are fixed."],
   ["If 5 is added to every value in a list, what happens to its standard deviation?", "Nothing. Shifting every value leaves the spread unchanged."])
def sd(v):
    m = sum(v) / len(v); return (sum((x - m) ** 2 for x in v) / len(v)) ** .5
assert sd([10, 12, 14, 16, 18]) < sd([6, 10, 14, 18, 22])
ds("FULL_3", "qr-a:coo1453", "qr-f3-ds-tank", 3, "A tank is being filled with water at a constant rate. How many more minutes will it take to fill the tank?", "Water enters at 12 liters per minute.", "The tank holds 300 liters and is now 40 percent full.", 2,
   "Both statements together are needed. Statement (2) gives the 180 liters still to add, and statement (1) gives the rate, so the time is 180 / 12 = 15 minutes.",
   ["Time = **volume left** divided by rate.", "Statement (1) gives the rate only.", "Statement (2) gives 60% of 300 = 180 liters left, but no rate.", "Together: 180 / 12 = 15 minutes."],
   ["A rate with no volume left gives no time.", "The volume left with no rate gives no time.", None, "Neither statement alone gives both the volume and the rate.", "Together they give 180 liters at 12 liters per minute, exactly 15 minutes."],
   ["If the tank were 70 percent full instead, how long would it take?", "90 liters / 12 = 7.5 minutes."])
qc("FULL_3", "qr-a:uni1474", "qr-f3-qc-ratio-sum", 3, "x + y", "14", 3,
   "The relationship cannot be determined. With x = 3k and y = 4k, the sum is 7k. It is below 14 when k is under 2 and above 14 when k is over 2.",
   ["Write x = 3k and y = 4k, so x + y = **7k**.", "Try k = 1: sum is 7, less than 14.", "Try k = 3: sum is 21, more than 14.", "The result changes, so it cannot be determined."],
   ["This holds only when k is above 2, such as x = 9 and y = 12.", "This holds only when k is below 2, such as x = 3 and y = 4.", "This holds only for x = 6 and y = 8. Other pairs in the same ratio give other sums.", None],
   ["If also x = 6, which quantity is greater?", "Then y = 8 and x + y = 14, so the two quantities are equal."], lead="x and y are positive numbers, and x/y = 3/4.")
add("FULL_3", "written:qr-11-1oihzm9", "qr-f3-doubling", "qr-6", 2,
    "A bacterial culture doubles every 20 minutes. If it starts with 500 cells, how many cells are present after 2 hours?",
    ["3,000", "6,000", "16,000", "30,000", "32,000"], 4,
    "There are 32,000 cells. Two hours is six 20-minute periods, so the count is 500 x 2^6 = 500 x 64.",
    ["Count the **doublings**: 120 / 20 = 6.", "Growth factor: 2^6 = 64.", "Multiply: 500 x 64 = 32,000."],
    ["This multiplies 500 by 6. Doubling six times multiplies by 64, not 6.", "This multiplies 500 by 12, doubling the count of periods instead of the cells.", "This uses 2^5, one doubling short.", "This adds growth in a straight line. Doubling compounds.", None],
    ["How many cells are there after 1 hour?", "Three doublings: 500 x 8 = 4,000."],
    val=500 * 2 ** (120 // 20), key=32000)
add("FULL_3", "written:qr-11-q46gn4", "qr-f3-percent-chain", "qr-4", 3,
    "A store raises the price of a chair by 25 percent, then marks the new price down by 20 percent for a sale. A 10 percent tax is added to the sale price. The final cost is what percent of the original price?",
    ["95%", "105%", "110%", "115%", "137.5%"], 2,
    "The final cost is 110% of the original. The multipliers are 1.25 x 0.80 = 1.00, so the sale price equals the original, and the tax multiplies it by 1.10.",
    ["Turn each change into a **multiplier**: 1.25, 0.80, 1.10.", "1.25 x 0.80 = 1.00.", "1.00 x 1.10 = 1.10.", "That is 110% of the original."],
    ["This subtracts more than it adds. The 25 percent rise and 20 percent cut cancel exactly.", "This treats the markup and markdown as a net 5 point loss before tax. They cancel exactly.", None, "This adds and subtracts the percents: 25 - 20 + 10. Percent changes multiply.", "This leaves out the 20 percent markdown: 1.25 x 1.10."],
    ["A price rises 20 percent and then falls 20 percent. What percent of the original is it?", "1.20 x 0.80 = 0.96, so 96%."],
    val=F(125, 100) * F(80, 100) * F(110, 100), key=F(110, 100))
add("FULL_3", "qr-a:vs3", "qr-f3-round-trip", "qr-7", 3,
    "A cyclist rides from home to a lake at 12 miles per hour and returns by the same route at 8 miles per hour. The riding time for the whole trip is 5 hours. What is the total distance of the round trip, in miles?",
    ["9.6", "20", "24", "40", "48"], 4,
    "The round trip is 48 miles. With one-way distance d, d/12 + d/8 = 5, so 5d/24 = 5 and d = 24 miles each way.",
    ["Let d be the **one-way** distance.", "Time out plus time back: d/12 + d/8 = 5.", "Combine: 5d/24 = 5, so d = 24.", "Round trip: 2 x 24 = 48 miles."],
    ["This is the average speed for the trip in miles per hour, not a distance.", "This is 5 hours times the 4 mile per hour gap between the speeds, which is not a distance traveled.", "This is the one-way distance. The question asks for the round trip.", "This is 8 miles per hour for all 5 hours. Part of the trip was ridden at 12.", None],
    ["What is the cyclist's average speed for the whole trip?", "48 miles / 5 hours = 9.6 miles per hour."],
    val=2 * (5 / (F(1, 12) + F(1, 8))), key=48)
add("FULL_3", "qr-a:uni1477", "qr-f3-fraction-quotient", "qr-2", 2,
    "What is the value of (3/4 - 2/3) / (1/6 - 1/8)?",
    ["1/288", "1/24", "1/2", "1", "2"], 4,
    "The value is 2. The top is 9/12 - 8/12 = 1/12, the bottom is 4/24 - 3/24 = 1/24, and 1/12 divided by 1/24 is 2.",
    ["Top: common denominator 12 gives **1/12**.", "Bottom: common denominator 24 gives 1/24.", "Divide: 1/12 x 24 = 2."],
    ["This multiplies 1/12 by 1/24. Dividing by a fraction means multiplying by its reciprocal.", "This is the bottom alone. Divide the top by it.", "This flips the wrong fraction: 1/24 divided by 1/12.", "This treats the top and bottom as equal. They are 1/12 and 1/24.", None],
    ["What is (1/2 - 1/3) / (1/4 - 1/6)?", "(1/6) / (1/12) = 2."],
    val=(F(3, 4) - F(2, 3)) / (F(1, 6) - F(1, 8)), key=2)
add("FULL_3", "qr-a:exp1718", "qr-f3-exponent-eq", "qr-6", 3,
    "If 9^(x + 1) = 27^(x - 1), what is the value of x?",
    ["5", "6", "8", "9", "12"], 0,
    "x = 5. Write both sides as powers of 3: 3^(2x + 2) = 3^(3x - 3), so 2x + 2 = 3x - 3.",
    ["Use a **common base**: 9 = 3^2 and 27 = 3^3.", "Left: 3^(2x + 2). Right: 3^(3x - 3).", "Set exponents equal: 2x + 2 = 3x - 3.", "Solve: x = 5."],
    [None, "At x = 6 the left side is 3^14 and the right is 3^15. They do not match.", "At x = 8 the left side is 3^18 and the right is 3^21. They do not match.", "At x = 9 the left side is 3^20 and the right is 3^24. They do not match.", "At x = 12 the left side is 3^26 and the right is 3^33. They do not match."],
    ["If 4^x = 8^(x - 1), what is x?", "2x = 3x - 3, so x = 3."],
    val=9 ** 6 - 27 ** 4, key=0)
add("FULL_3", "qr-a:wor1502", "qr-f3-gloves-masks", "qr-1", 3,
    "A dental office buys gloves at $7.50 a box and masks at $12.00 a box. It buys 40 boxes in all and pays $372. How many boxes of masks does it buy?",
    ["12", "16", "20", "24", "28"], 1,
    "It buys 16 boxes of masks. If all 40 boxes were gloves the bill would be $300, and each mask box adds $4.50, so the extra $72 means 16 mask boxes.",
    ["Write g + m = 40 and 7.5g + 12m = 372.", "Substitute g = 40 - m: 300 + **4.5m** = 372.", "Solve: m = 72 / 4.5 = 16."],
    ["With 12 mask boxes the bill is 300 + 54 = $354, too low.", None, "With 20 mask boxes the bill is 300 + 90 = $390, too high.", "This is the number of glove boxes. The question asks for masks.", "With 28 mask boxes the bill is 300 + 126 = $426, too high."],
    ["How much of the $372 was spent on gloves?", "24 boxes x $7.50 = $180."],
    val=F(372 - 300) / F(45, 10), key=16)
add("FULL_3", "generated:qr-sci-notation-product#8hauoz", "qr-f3-mean-drop-value", "qr-13", 3,
    "A data set of 8 values has a mean of 15. One value, 29, is found to be an error and is removed. What is the mean of the remaining 7 values?",
    ["10.5", "11.4", "12", "12.6", "13"], 4,
    "The new mean is 13. The total was 8 x 15 = 120. Removing 29 leaves 91, and 91 / 7 = 13.",
    ["Find the **total**: 8 x 15 = 120.", "Remove the error: 120 - 29 = 91.", "Divide by the 7 values left: 13."],
    ["This is too low. Check with totals: 91 points shared by 7 values is 13.", "This divides 91 by 8. Only 7 values remain.", "This subtracts a flat 3 from the mean. Work from the total instead.", "This is a near miss from rounding. The division is exact: 91 / 7 = 13.", None],
    ["If instead the 29 is corrected to 21 and kept, what is the new mean?", "(120 - 8) / 8 = 14."],
    val=F(120 - 29, 7), key=13)

# ---------------------------------------------------------------- FULL_4
qc("FULL_4", "written:qr-11-1gxpf2c", "qr-f4-qc-avg-speed", 3, "The average of 30 miles per hour and 60 miles per hour", "The average speed, in miles per hour, for a trip of 60 miles at 30 miles per hour followed by 60 miles at 60 miles per hour", 0,
   "Quantity A is greater. The plain average is 45. The trip covers 120 miles in 2 + 1 = 3 hours, an average speed of 40, because more time is spent at the slower speed.",
   ["Quantity A: (30 + 60)/2 = 45.", "Trip time: 60/30 + 60/60 = **3 hours**.", "Average speed: 120 / 3 = 40.", "Compare: 45 is greater than 40."],
   [None, "The trip's average speed is 40, which is below 45, not above it.", "Average speed over equal distances is not the plain average of the speeds.", "Both quantities are fixed numbers, 45 and 40."],
   ["What is the average speed for 2 hours at 30 miles per hour and then 2 hours at 60?", "Equal times this time: 180 miles / 4 hours = 45 miles per hour."])
assert F(30 + 60, 2) > F(120) / (F(60, 30) + F(60, 60))
ds("FULL_4", "written:qr-11-1nphbtr", "qr-f4-ds-prime-root", 3, "What is the value of x?", "x^2 - 5x + 6 = 0", "x is a prime number.", 4,
   "The statements together are not enough. Statement (1) factors to (x - 2)(x - 3) = 0, so x is 2 or 3, and both of those are prime.",
   ["Factor statement (1): x = 2 or x = 3.", "Statement (2): many **primes** exist.", "Together: 2 and 3 are both prime.", "Two values remain, so not sufficient."],
   ["Statement (1) leaves two values, 2 and 3.", "Being prime leaves endless values.", "Both roots, 2 and 3, are prime, so the second statement removes neither.", "Neither statement alone fixes x, and together they still leave two values.", None],
   ["If statement (2) said x is an odd number, what would the answer be?", "Then x = 3, and both statements together would be sufficient."])
ds("FULL_4", "qr-a:g2dm4", "qr-f4-ds-pass-rate", 2, "What percent of the students in a class passed an exam?", "18 of the 24 students in the class passed.", "The ratio of students who passed to students who failed is 3 to 1.", 3,
   "Each statement alone is enough. Statement (1) gives 18/24 = 75 percent. Statement (2) gives 3 of every 4 students, which is also 75 percent.",
   ["Statement (1): 18/24 = **75 percent**.", "Statement (2): 3 passed for every 4 students, 75 percent.", "A percent needs only a ratio, so each works."],
   ["Statement (2) also works alone: 3 parts of 4 is 75 percent.", "Statement (1) also works alone: 18/24 is 75 percent.", "You do not need both. Either one gives 75 percent.", None, "Either statement gives 75 percent, so the question can be answered."],
   ["Would statement (2) alone tell you how many students passed?", "No. A ratio gives the percent but not the count."])
qc("FULL_4", "qr-a:coo1452", "qr-f4-qc-choose", 2, "The number of ways to choose 3 people from a group of 8", "The number of ways to choose 5 people from a group of 8", 2,
   "The two quantities are equal. Choosing 3 people to include is the same as choosing the 5 to leave out, and both counts are 56.",
   ["Choosing 3 of 8 leaves a **group of 5** behind.", "So each choice of 3 pairs with one choice of 5.", "Both counts are 8 x 7 x 6 / 6 = 56."],
   ["Picking fewer people does not give more ways here. Both counts are 56.", "Picking more people does not give more ways here. Both counts are 56.", None, "Both counts are fixed numbers and can be compared."],
   ["How many ways are there to choose 2 people from 8?", "8 x 7 / 2 = 28, the same as choosing 6 from 8."])
assert comb(8, 3) == comb(8, 5) == 56
add("FULL_4", "qr-a:pem1310", "qr-f4-compound-interest", "qr-8", 2,
    "$4,000 is invested at 5 percent annual interest, compounded once a year. How much interest is earned in 2 years?",
    ["$200", "$400", "$405", "$410", "$441"], 3,
    "The interest is $410. Year one earns $200, and year two earns 5 percent of $4,200, which is $210.",
    ["Year 1: 5% of 4,000 = $200.", "Year 2: 5% of the **new balance**, 4,200, = $210.", "Add: 200 + 210 = $410."],
    ["This is one year of interest. The question asks for two years.", "This is simple interest, $200 twice. The second year earns interest on $4,200.", "This adds only $5 for compounding. Interest on the first year's $200 is $10.", None, "This misplaces a decimal in the final balance of $4,410. The interest is 4,410 - 4,000."],
    ["What is the balance after 3 years?", "4,410 x 1.05 = $4,630.50."],
    val=F(4000) * F(105, 100) ** 2 - 4000, key=410)
add("FULL_4", "qr-a:uni1478", "qr-f4-nut-ratio", "qr-3", 2,
    "A nut mix contains almonds, cashews and peanuts in a ratio of 2 to 3 to 5 by weight. If the mix has 18 more ounces of peanuts than almonds, what is the total weight of the mix, in ounces?",
    ["30", "36", "54", "60", "90"], 3,
    "The mix weighs 60 ounces. Peanuts exceed almonds by 5 - 2 = 3 parts, so one part is 6 ounces and the 10 parts total 60.",
    ["Peanuts minus almonds: **3 parts** = 18 ounces.", "One part = 6 ounces.", "Total parts: 2 + 3 + 5 = 10.", "Total weight: 10 x 6 = 60 ounces."],
    ["This is the peanuts alone, 5 parts. The question asks for the whole mix.", "This is 6 parts. The mix has 10 parts.", "This is 9 parts, or 18 x 3. The mix has 10 parts of 6 ounces.", None, "This treats 18 ounces as 2 parts. The gap between peanuts and almonds is 3 parts."],
    ["How many ounces of cashews are in the mix?", "3 parts x 6 = 18 ounces."],
    val=F(18, 3) * 10, key=60)
add("FULL_4", "qr-a:uni1476", "qr-f4-infusion", "qr-3", 2,
    "A fluid is infused at a steady 2.5 milliliters per minute. How many liters are infused in 1 day?",
    ["0.15", "0.36", "1.5", "3.0", "3.6"], 4,
    "The answer is 3.6 liters. One day is 1,440 minutes, 2.5 x 1,440 = 3,600 milliliters, and 1,000 milliliters make a liter.",
    ["Minutes in a day: 24 x 60 = **1,440**.", "Volume: 2.5 x 1,440 = 3,600 mL.", "Convert: 3,600 / 1,000 = 3.6 L."],
    ["This is the volume in one hour, 150 mL. A day has 24 hours.", "This slips a decimal place: 3,600 mL is 3.6 L, not 0.36 L.", "This uses 10 hours instead of 24.", "This uses 20 hours. A day has 24.", None],
    ["At the same rate, how many minutes does it take to infuse 500 mL?", "500 / 2.5 = 200 minutes."],
    val=F(25, 10) * 1440 / 1000, key=F(36, 10))
add("FULL_4", "qr-a:wor1500", "qr-f4-function-diff", "qr-5", 2,
    "If f(x) = 2x^2 - 3x + 1, what is the value of f(3) - f(-1)?",
    ["2", "4", "10", "14", "16"], 1,
    "The value is 4. f(3) = 18 - 9 + 1 = 10 and f(-1) = 2 + 3 + 1 = 6.",
    ["f(3) = 2(9) - 9 + 1 = 10.", "f(-1) = 2(1) **+ 3** + 1 = 6.", "Subtract: 10 - 6 = 4."],
    ["This subtracts 8 from 10. f(-1) is 6, because the middle term becomes +3.", None, "This is f(3) alone. Subtract f(-1), which is 6.", "This uses f(-1) = -4. Squaring -1 gives +1 and -3(-1) gives +3.", "This adds f(3) and f(-1). The question asks for the difference."],
    ["For the same function, what is f(2)?", "8 - 6 + 1 = 3."],
    val=(2 * 9 - 9 + 1) - (2 * 1 + 3 + 1), key=4)
add("FULL_4", "qr-a:exp1719", "qr-f4-committee", "qr-12", 4,
    "A committee of 3 is chosen at random from 5 dentists and 4 hygienists. What is the probability that the committee has exactly 2 dentists?",
    ["10/21", "1/2", "5/9", "25/42", "5/7"], 0,
    "The probability is 10/21. There are 10 ways to pick 2 dentists and 4 ways to pick 1 hygienist, 40 committees out of 84.",
    ["All committees: **9 choose 3** = 84.", "Two dentists: 5 choose 2 = 10.", "One hygienist: 4 ways.", "40/84 = 10/21."],
    [None, "This is a guess of one half. Counting gives 40 of 84, a little less.", "This is the share of dentists in the group, 5 of 9, not the chance of exactly two.", "This adds the 10 all-dentist committees: 50/84. Those have 3 dentists, not 2.", "This is far too high. Only 40 of the 84 committees have exactly two dentists."],
    ["What is the probability that the committee has no dentists?", "4 choose 3 = 4 committees, so 4/84 = 1/21."],
    val=F(comb(5, 2) * comb(4, 1), comb(9, 3)), key=F(10, 21))

# numeric choices must be in ascending order and the keyed choice must equal the worked value
def num(o):
    o = o.replace("$", "").replace(",", "").replace("%", "")
    return F(o) if "/" in o else F(o)
n = 0
for test, secs in OUT.items():
    for old, it in secs["qr"].items():
        n += 1
        if it.get("fmt"): continue
        vals = [num(o) for o in it["opts"]]
        k = KEYS.get(it["id"])
        if k is not None: assert vals[it["correct"]] == k, (it["id"], vals[it["correct"]], k)
        assert vals == sorted(vals) and len(set(vals)) == 5, it["id"]
here = os.path.dirname(os.path.abspath(__file__))
json.dump(OUT, open(os.path.join(here, "replacements.json"), "w"), indent=1, ensure_ascii=False)
# ids whose keys were worked a second time here (exact arithmetic or the asserts beside each item);
# scripts/compose-full-mocks.mjs --check accepts these alongside the blind re-solve list
vp = os.path.join(here, "v3-verified.json")
ids = set(json.load(open(vp))) if os.path.exists(vp) else set()
ids = sorted({i for i in ids if not i.startswith("v3:qr-")} | {it["id"] for secs in OUT.values() for it in secs["qr"].values()})
json.dump(ids, open(vp, "w"), indent=1)
print("wrote", n, "items", {t: len(s["qr"]) for t, s in OUT.items()})
