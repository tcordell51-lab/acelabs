'use strict';
/* Quantitative Comparison items. Fixed choices (shared/qr-formats.js choices.qc):
   A Quantity A is greater | B Quantity B is greater | C equal | D cannot be determined.
   Every key is recomputed by scripts/qr-formats/lib/check.js (check.qc). */
module.exports = [
  {
    id: 'qc-001', format: 'qc', topic: 'exponents', diff: 2,
    stem: 'x < 0',
    colA: 'x³', colB: 'x²',
    key: 'B',
    move: 'Sign first: an odd power keeps the negative, an even power makes it positive.',
    why: 'Do not calculate, read the signs. x is negative. Cubing a negative number keeps it negative (three negatives multiply to a negative), so x³ < 0. Squaring any nonzero number makes it positive, so x² > 0. A negative number is always less than a positive number, so Quantity B is greater for every allowed x. Quick test: x = -1/2 gives x³ = -1/8 and x² = 1/4.',
    diag: { A: 'Picturing a big positive x. The given says x is negative, and that flips the cube negative.', D: 'Fractions do not rescue this one: for x = -1/2 the cube is still negative and the square still positive.' },
    check: { qc: { A: 'x^3', B: 'x^2', vars: { x: 'rat:-10..10/4' }, given: 'x < 0' } }
  },
  {
    id: 'qc-002', format: 'qc', topic: 'statistics', diff: 2,
    stem: 'Five numbers have a mean of 12. A sixth number, 12, is added to the list.',
    colA: 'The mean of the six numbers', colB: '12',
    key: 'C',
    move: 'Adding a value equal to the mean never moves the mean.',
    why: 'Turn the mean back into a sum. Five numbers with mean 12 add to 5 × 12 = 60. Adding 12 makes the sum 72 across six numbers, and 72 / 6 = 12. The mean is still exactly 12, so the two quantities are equal. The picture: the mean is the pivot of a seesaw, and a new weight set right on the pivot does not tip it.',
    diag: { A: 'Adding a number does not automatically raise the mean; it only rises if the new number sits above the old mean.', D: 'You do not need the five individual numbers; their sum (60) is all the mean depends on.' },
    check: { qc: { A: '(5*12 + 12)/6', B: '12' } }
  },
  {
    id: 'qc-003', format: 'qc', topic: 'probability', diff: 3,
    stem: 'A fair coin is flipped 4 times.',
    colA: 'The probability of getting exactly 2 heads', colB: 'The probability of getting at least 3 heads',
    key: 'A',
    move: 'Count the arrangements: probability = (ways) / 2^n for fair flips.',
    why: 'Every sequence of 4 flips is equally likely, and there are 2^4 = 16 of them. Exactly 2 heads: choose which 2 of the 4 flips are heads, C(4,2) = 6 ways, so the probability is 6/16. At least 3 heads means exactly 3 or exactly 4: C(4,3) + C(4,4) = 4 + 1 = 5 ways, so 5/16. Since 6/16 > 5/16, Quantity A is greater.',
    diag: { B: '"At least" feels bigger because it covers two outcomes, but 3 heads and 4 heads together are only 5 of the 16 sequences.', C: 'Check the counts: exactly 2 heads has 6 arrangements, at least 3 has 5.' },
    check: { qc: { A: 'C(4,2)/2^4', B: '(C(4,3) + C(4,4))/2^4' } }
  },
  {
    id: 'qc-004', format: 'qc', topic: 'absolute-value', diff: 2,
    stem: '|x - 3| = 5',
    colA: 'x', colB: '0',
    key: 'D',
    move: 'Absolute value equations usually split into two answers; test both before you compare.',
    why: 'An absolute value of 5 means x is 5 units from 3 on the number line, in either direction. So x - 3 = 5 gives x = 8, and x - 3 = -5 gives x = -2. With x = 8, Quantity A is greater; with x = -2, Quantity B is greater. Two allowed values give two different relationships, so it cannot be determined.',
    diag: { A: 'You solved only x - 3 = 5. The negative branch, x = -2, is just as valid.' },
    check: { qc: { A: 'x', B: '0', vars: { x: 'int:-20..20' }, given: 'abs(x - 3) == 5' } }
  },
  {
    id: 'qc-005', format: 'qc', topic: 'exponents', diff: 2,
    stem: '0 < x < 1',
    colA: 'x²', colB: 'x',
    key: 'B',
    move: 'Squaring a number between 0 and 1 makes it smaller: a fraction of a fraction.',
    why: 'Picture x as a piece of a whole, say x = 1/2. Then x² = 1/4, which is half of a half, smaller than 1/2. In general x² = x · x, and multiplying x by a number less than 1 shrinks it. So for every x strictly between 0 and 1, x² < x, and Quantity B is greater. The trap is assuming squaring always makes a number bigger; that is only true for numbers greater than 1.',
    diag: { A: 'Squaring grows numbers bigger than 1. Here x is a fraction, so squaring shrinks it.', D: 'There is no exception inside 0 < x < 1; the endpoints 0 and 1, where they would be equal, are excluded.' },
    check: { qc: { A: 'x^2', B: 'x', vars: { x: 'rat:0..1/40' }, given: 'x > 0 and x < 1' } }
  },
  {
    id: 'qc-006', format: 'qc', topic: 'algebra', diff: 3,
    stem: 'x ≠ 0',
    colA: 'x + 1/x', colB: '2',
    key: 'D',
    move: 'When the given allows negatives, test a negative before you trust a pattern.',
    why: 'Test positive values first: x = 1 gives 1 + 1 = 2 (equal), x = 2 gives 2.5 (Quantity A greater). Positive x never drops below 2. Now test a negative: x = -1 gives -1 + (-1) = -2, and Quantity B is greater. Because x can be negative, two different relationships are possible, so it cannot be determined.',
    diag: { A: 'That holds only for positive x. The given allows x = -1, which makes Quantity A equal to -2.' },
    check: { qc: { A: 'x + 1/x', B: '2', vars: { x: 'rat:-6..6/4' }, given: 'x != 0' } }
  },
  {
    id: 'qc-007', format: 'qc', topic: 'algebra', diff: 1,
    stem: 'y > 0 and x = 3y',
    colA: 'x - y', colB: '2y',
    key: 'C',
    move: 'Substitute the given relationship so both columns speak the same variable.',
    why: 'Replace x with 3y in Quantity A: x - y = 3y - y = 2y. Quantity B is also 2y. The two quantities are the same expression, so they are equal for every allowed y.',
    check: { qc: { A: 'x - y', B: '2*y', vars: { x: 'rat:0..30/2', y: 'rat:0..10/2' }, given: 'y > 0 and x == 3*y' } }
  },
  {
    id: 'qc-008', format: 'qc', topic: 'percent', diff: 1,
    stem: '',
    colA: '40% of 65', colB: '65% of 40',
    key: 'C',
    move: 'a% of b always equals b% of a: both are (a × b) / 100.',
    why: 'Write each as a product over 100. 40% of 65 = (40 × 65) / 100 = 2600 / 100 = 26. 65% of 40 = (65 × 40) / 100 = 26. Multiplication does not care about order, so the quantities are equal. This swap is a real time-saver: 8% of 25 is the same as 25% of 8, which is 2.',
    check: { qc: { A: '40/100*65', B: '65/100*40' } }
  },
  {
    id: 'qc-009', format: 'qc', topic: 'percent', diff: 2,
    stem: 'A price is increased by 20%, and then the new price is decreased by 20%.',
    colA: 'The final price as a percent of the original price', colB: '100%',
    key: 'B',
    move: 'Successive percent changes multiply; they do not cancel.',
    why: 'Use multipliers. Up 20% means × 1.2; down 20% means × 0.8. Final = 1.2 × 0.8 = 0.96 of the original, which is 96%. The decrease is taken from a bigger number than the increase was, so it removes more than was added. Quantity B is greater.',
    diag: { C: 'Plus 20% and minus 20% only cancel if both are taken from the same base. The 20% decrease comes off the larger, increased price.' },
    check: { qc: { A: '100*1.2*0.8', B: '100' } }
  },
  {
    id: 'qc-010', format: 'qc', topic: 'statistics', diff: 2,
    stem: 'Data set: 3, 7, 7, 9, 14',
    colA: 'The mean of the data set', colB: 'The median of the data set',
    key: 'A',
    move: 'A high outlier pulls the mean toward it; the median only cares about the middle.',
    why: 'Median: the values are already in order, and the middle (third) value is 7. Mean: (3 + 7 + 7 + 9 + 14) / 5 = 40 / 5 = 8. The 14 sits far above the rest and drags the mean up past the median. Quantity A is greater.',
    diag: { B: 'The median is 7 and the mean is 40 / 5 = 8. Recount the sum if you got a smaller mean.' },
    check: { qc: { A: 'mean(3,7,7,9,14)', B: 'median(3,7,7,9,14)' } }
  },
  {
    id: 'qc-011', format: 'qc', topic: 'statistics', diff: 3,
    stem: 'Set S: 4, 8, 15, 16, 23, 42. Set T is formed by adding 10 to every value in S.',
    colA: 'The standard deviation of S', colB: 'The standard deviation of T',
    key: 'C',
    move: 'Adding the same number to every value slides the whole set; spread does not change.',
    why: 'Standard deviation measures how far values sit from their mean. Adding 10 to every value moves every value and the mean by exactly 10, so every distance from the mean is unchanged. The spread is identical, and the quantities are equal. You never need to compute the standard deviation here. (Multiplying every value by a number would scale the spread; adding does not.)',
    diag: { B: 'Bigger values do not mean bigger spread. Every value moved by the same 10, so the gaps between them did not change.' },
    check: { qc: { A: 'mean(4^2,8^2,15^2,16^2,23^2,42^2) - mean(4,8,15,16,23,42)^2', B: 'mean(14^2,18^2,25^2,26^2,33^2,52^2) - mean(14,18,25,26,33,52)^2' } }
  },
  {
    id: 'qc-012', format: 'qc', topic: 'statistics', diff: 3,
    stem: '',
    colA: 'The standard deviation of 12, 14, 16, 18', colB: 'The standard deviation of 2, 6, 10',
    key: 'B',
    move: 'Compare spread by distances from the mean, not by the size of the numbers.',
    why: 'Quantity A: mean 15; distances 3, 1, 1, 3; squared 9, 1, 1, 9; average squared distance 20 / 4 = 5. Quantity B: mean 6; distances 4, 0, 4; squared 16, 0, 16; average 32 / 3, about 10.7. The second set is more spread out even though its numbers are smaller, so Quantity B is greater. (The conclusion is the same whether you divide by n or by n - 1.)',
    diag: { A: 'The first set has larger numbers, but they are packed 2 apart. The second set is spread 4 apart.' },
    check: { qc: { A: 'mean(12^2,14^2,16^2,18^2) - mean(12,14,16,18)^2', B: 'mean(2^2,6^2,10^2) - mean(2,6,10)^2' } }
  },
  {
    id: 'qc-013', format: 'qc', topic: 'counting', diff: 3,
    stem: '',
    colA: 'The number of distinct arrangements of the letters in LEVEL', colB: 'The number of ways to choose 3 books from a shelf of 6 different books',
    key: 'A',
    move: 'Arrangements with repeats: n! divided by (repeat count)! for each repeated letter.',
    why: 'LEVEL has 5 letters with L twice and E twice. Arrangements = 5! / (2! × 2!) = 120 / 4 = 30. Choosing 3 of 6 books where order does not matter: C(6,3) = 6! / (3! × 3!) = 20. Since 30 > 20, Quantity A is greater.',
    diag: { B: 'If you got 120 or 60 for LEVEL, divide out both repeated letters: 120 / (2 × 2) = 30, which still beats 20.' },
    check: { qc: { A: 'fact(5)/(fact(2)*fact(2))', B: 'C(6,3)' } }
  },
  {
    id: 'qc-014', format: 'qc', topic: 'counting', diff: 2,
    stem: '',
    colA: 'The number of ways to award a gold, a silver, and a bronze medal among 7 runners', colB: 'The number of 4-person committees that can be formed from 10 people',
    key: 'C',
    move: 'Order matters (ranked spots) means permutation; order does not matter (a group) means combination.',
    why: 'Medals are ranked spots, so order matters: 7 × 6 × 5 = 210. A committee is just a group, so order does not matter: C(10,4) = (10 × 9 × 8 × 7) / (4 × 3 × 2 × 1) = 5040 / 24 = 210. The quantities are equal.',
    diag: { B: 'If you used 10 × 9 × 8 × 7 = 5040 for the committee, you counted order. A committee of the same four people is one committee.' },
    check: { qc: { A: 'P(7,3)', B: 'C(10,4)' } }
  },
  {
    id: 'qc-015', format: 'qc', topic: 'probability', diff: 2,
    stem: 'Two fair six-sided dice are rolled.',
    colA: 'The probability that the sum is 7', colB: 'The probability that the sum is 6 or 8',
    key: 'B',
    move: 'For two dice, count ordered pairs out of 36.',
    why: 'There are 6 × 6 = 36 equally likely ordered rolls. Sum 7: (1,6), (2,5), (3,4), (4,3), (5,2), (6,1) is 6 rolls, so 6/36. Sum 6 has 5 rolls and sum 8 has 5 rolls, so 6 or 8 is 10/36. Seven is the single most likely sum, but two neighboring sums together beat it. Quantity B is greater.',
    diag: { A: '7 is the most likely single sum, but the column asks about two sums together: 5 + 5 = 10 ways.' },
    check: { qc: { A: '6/36', B: '(5+5)/36' } }
  },
  {
    id: 'qc-016', format: 'qc', topic: 'exponents', diff: 2,
    stem: 'n is a positive integer.',
    colA: '2^(n+1)', colB: '2^n + 2^n',
    key: 'C',
    move: 'Two of the same power is one more power: 2^n + 2^n = 2 · 2^n = 2^(n+1).',
    why: 'Factor Quantity B: 2^n + 2^n = 2 × 2^n. Multiplying by one more 2 raises the exponent by 1, so 2 × 2^n = 2^(n+1). That is exactly Quantity A, so the quantities are equal for every n. Check with n = 3: 2^4 = 16 and 8 + 8 = 16.',
    diag: { B: 'Adding powers does not add exponents: 2^n + 2^n is 2^(n+1), not 2^(2n).' },
    check: { qc: { A: '2^(n+1)', B: '2^n + 2^n', vars: { n: 'int:1..30' } } }
  },
  {
    id: 'qc-017', format: 'qc', topic: 'exponents', diff: 3,
    stem: 'n is an integer greater than 1.',
    colA: '3^(2n)', colB: '2^(3n)',
    key: 'A',
    move: 'Rewrite both with the same exponent, then compare the bases.',
    why: '3^(2n) = (3²)^n = 9^n and 2^(3n) = (2³)^n = 8^n. With the same positive exponent n, the bigger base wins: 9^n > 8^n for every n ≥ 2. Quantity A is greater.',
    diag: { B: 'A bigger exponent on the outside (3n vs 2n) is not the whole story; regroup to 9^n vs 8^n.' },
    check: { qc: { A: '3^(2*n)', B: '2^(3*n)', vars: { n: 'int:2..30' } } }
  },
  {
    id: 'qc-018', format: 'qc', topic: 'exponents', diff: 3,
    stem: 'n is an integer.',
    colA: '3^(2n)', colB: '2^(3n)',
    key: 'D',
    move: 'Exponent of zero or below flips size comparisons; test n = 0 and a negative n.',
    why: 'Regroup: Quantity A is 9^n and Quantity B is 8^n. For n = 1, 9 > 8, so Quantity A is greater. For n = 0, both equal 1. For n = -1, 1/9 < 1/8, so Quantity B is greater. Because n can be any integer, the relationship cannot be determined.',
    diag: { A: 'True for positive n only. Here n can be 0 (equal) or negative (Quantity B greater).' },
    check: { qc: { A: '3^(2*n)', B: '2^(3*n)', vars: { n: 'int:-8..8' } } }
  },
  {
    id: 'qc-019', format: 'qc', topic: 'inequalities', diff: 2,
    stem: '3x - 7 ≥ 11',
    colA: 'x', colB: '6',
    key: 'D',
    move: 'Watch the equals bar: "greater than or equal to" leaves room for a tie.',
    why: 'Solve like an equation: add 7 to get 3x ≥ 18, then divide by 3 to get x ≥ 6. If x is greater than 6, Quantity A is greater. But x = 6 is allowed too, and then the quantities are equal. Two possible relationships, so it cannot be determined.',
    diag: { A: 'x ≥ 6 includes x = 6 exactly, where the quantities tie.' },
    check: { qc: { A: 'x', B: '6', vars: { x: 'rat:-10..20/4' }, given: '3*x - 7 >= 11' } }
  },
  {
    id: 'qc-020', format: 'qc', topic: 'inequalities', diff: 3,
    stem: '-2x + 5 ≥ 13',
    colA: 'x', colB: '-4',
    key: 'D',
    move: 'Dividing an inequality by a negative flips the sign.',
    why: 'Subtract 5: -2x ≥ 8. Divide by -2 and flip the sign: x ≤ -4. So x could be -4 (equal) or anything smaller, like -5 (Quantity B greater). Because a tie is possible, the relationship cannot be determined.',
    diag: { A: 'You forgot to flip the inequality when dividing by -2. The solution is x ≤ -4.', B: 'Close: x is never greater than -4, but it can equal -4, which makes them equal.' },
    check: { qc: { A: 'x', B: '-4', vars: { x: 'rat:-12..8/4' }, given: '-2*x + 5 >= 13' } }
  },
  {
    id: 'qc-021', format: 'qc', topic: 'absolute-value', diff: 2,
    stem: '|x| < 3',
    colA: 'x²', colB: '9',
    key: 'B',
    move: 'An absolute value bound is a distance from 0: squaring a smaller distance gives a smaller square.',
    why: '|x| < 3 means x is within 3 units of 0, so -3 < x < 3. Squaring removes the sign, and the square grows with the distance from 0. The largest distance is just under 3, so x² is always just under 9 or smaller. For example x = -2.5 gives 6.25. Quantity B is greater.',
    diag: { D: 'Negative x does not help Quantity A: (-2.9)² = 8.41, still below 9.' },
    check: { qc: { A: 'x^2', B: '9', vars: { x: 'rat:-5..5/8' }, given: 'abs(x) < 3' } }
  },
  {
    id: 'qc-022', format: 'qc', topic: 'ratios', diff: 2,
    stem: 'The ratio of a to b is 3 : 5, and a and b are positive.',
    colA: 'b - a', colB: 'a/2',
    key: 'A',
    move: 'Turn a ratio into parts: a = 3k and b = 5k for some positive k.',
    why: 'Write a = 3k and b = 5k with k > 0. Quantity A: b - a = 5k - 3k = 2k. Quantity B: a/2 = 3k/2 = 1.5k. For any positive k, 2k > 1.5k, so Quantity A is greater.',
    diag: { D: 'The actual sizes are unknown, but both columns scale with the same k, so the comparison is fixed.' },
    check: { qc: { A: 'b - a', B: 'a/2', vars: { a: 'rat:0..24/2', b: 'rat:0..40/2' }, given: 'a > 0 and 5*a == 3*b' } }
  },
  {
    id: 'qc-023', format: 'qc', topic: 'algebra', diff: 3,
    stem: 'x and y are positive numbers, and x + y = 10.',
    colA: 'xy', colB: '25',
    key: 'D',
    move: 'A fixed sum gives the biggest product when the two numbers are equal; check the tie.',
    why: 'With x + y = 10, the product is largest when x = y = 5, giving exactly 25. Any unequal split gives less, such as 4 × 6 = 24 or 1 × 9 = 9. So Quantity A is either equal to 25 or less than 25. Two relationships are possible, so it cannot be determined. Students who stop at "the max is 25" pick Quantity B; the equal case sinks that.',
    diag: { B: 'xy can reach 25 exactly when x = y = 5, so Quantity B is not always greater.', C: 'Only the split 5 and 5 gives 25; any other split gives a smaller product.' },
    check: { qc: { A: 'x*y', B: '25', vars: { x: 'rat:0..10/4', y: 'rat:0..10/4' }, given: 'x > 0 and y > 0 and x + y == 10' } }
  },
  {
    id: 'qc-024', format: 'qc', topic: 'ratios', diff: 3,
    stem: 'x > y > 0',
    colA: 'x/y', colB: '(x + 1)/(y + 1)',
    key: 'A',
    move: 'Adding the same amount to top and bottom pulls a fraction toward 1.',
    why: 'Since x > y, the fraction x/y is greater than 1. Adding 1 to both top and bottom pulls any fraction toward 1, so (x + 1)/(y + 1) is closer to 1 and smaller. Algebra check: compare x(y + 1) with y(x + 1), which is xy + x versus xy + y. Since x > y, the left side is bigger, so x/y > (x + 1)/(y + 1). Example: 4/2 = 2 but 5/3 is about 1.67. Quantity A is greater.',
    diag: { C: 'Adding the same number to top and bottom changes the value unless the fraction already equals 1.' },
    check: { qc: { A: 'x/y', B: '(x+1)/(y+1)', vars: { x: 'rat:0..10/4', y: 'rat:0..10/4' }, given: 'x > y and y > 0' } }
  },
  {
    id: 'qc-025', format: 'qc', topic: 'sequences', diff: 2,
    stem: 'In a sequence, the first term is 1, and each term after the first is 3 more than twice the term before it.',
    colA: 'The fifth term of the sequence', colB: '60',
    key: 'A',
    move: 'For a recursive rule, just walk the terms one at a time and write each one down.',
    why: 'Apply "double, then add 3" four times. Term 1 = 1. Term 2 = 2(1) + 3 = 5. Term 3 = 2(5) + 3 = 13. Term 4 = 2(13) + 3 = 29. Term 5 = 2(29) + 3 = 61. Since 61 > 60, Quantity A is greater.',
    diag: { B: 'Count the terms carefully: the fifth term needs four applications of the rule after the first term.' },
    check: { qc: { A: '2*(2*(2*(2*1+3)+3)+3)+3', B: '60' } }
  },
  {
    id: 'qc-026', format: 'qc', topic: 'number-properties', diff: 2,
    stem: '',
    colA: 'The number of prime numbers between 20 and 40', colB: 'The number of prime numbers between 40 and 60',
    key: 'B',
    move: 'List primes by checking divisibility by 2, 3, 5, and 7 only (enough for numbers under 121).',
    why: 'Between 20 and 40: 23, 29, 31, 37. That is 4 primes (21, 27, 33, 39 are multiples of 3; 25, 35 of 5). Between 40 and 60: 41, 43, 47, 53, 59. That is 5 primes (49 = 7 × 7, 51 = 3 × 17, 57 = 3 × 19). Quantity B is greater.',
    diag: { C: 'Check 51 and 57 carefully: both are multiples of 3. Even so, 40 to 60 has five primes.' },
    check: { qc: { A: 'countprimes(20,40)', B: 'countprimes(40,60)' } }
  },
  {
    id: 'qc-027', format: 'qc', topic: 'percent', diff: 2,
    stem: '',
    colA: '15% of 15% of 4,000', colB: '30% of 300',
    key: 'C',
    move: 'Percent of a percent multiplies the decimals: 0.15 × 0.15.',
    why: 'Quantity A: 15% of 4,000 is 600, and 15% of 600 is 90. Quantity B: 30% of 300 is 90. Both are 90, so the quantities are equal. The trap is turning "15% of 15%" into 30%.',
    diag: { A: '15% of 15% is 2.25%, not 30%. 2.25% of 4,000 is 90.' },
    check: { qc: { A: '0.15*0.15*4000', B: '0.30*300' } }
  },
  {
    id: 'qc-028', format: 'qc', topic: 'exponents', diff: 3,
    stem: 'x is a negative number.',
    colA: '-x', colB: 'x²',
    key: 'D',
    move: 'For a negative x, -x is positive; then the 0 to 1 versus above 1 split decides squares.',
    why: 'Both quantities are positive, so compare sizes. If x = -1/2: -x = 1/2 and x² = 1/4, so Quantity A is greater. If x = -2: -x = 2 and x² = 4, so Quantity B is greater. (At x = -1 they tie.) The relationship depends on x, so it cannot be determined.',
    diag: { B: 'Squares win only when the size of x is above 1. Try x = -1/2.' },
    check: { qc: { A: '-x', B: 'x^2', vars: { x: 'rat:-6..0/4' }, given: 'x < 0' } }
  },
  {
    id: 'qc-029', format: 'qc', topic: 'statistics', diff: 2,
    stem: 'Class X has 20 students with a mean score of 80. Class Y has 30 students with a mean score of 90.',
    colA: 'The mean score of all 50 students', colB: '85',
    key: 'A',
    move: 'A combined mean leans toward the bigger group.',
    why: 'Total points: 20 × 80 = 1,600 and 30 × 90 = 2,700, for 4,300 points across 50 students. Combined mean = 4,300 / 50 = 86. 85 would be right only if the classes were the same size; the larger class (mean 90) pulls the combined mean up. Quantity A is greater.',
    diag: { C: '85 is the simple average of 80 and 90, which ignores that Class Y has more students.' },
    check: { qc: { A: '(20*80 + 30*90)/50', B: '85' } }
  },
  {
    id: 'qc-030', format: 'qc', topic: 'statistics', diff: 2,
    stem: 'Seven consecutive integers have a sum of 91.',
    colA: 'The median of the seven integers', colB: 'The mean of the seven integers',
    key: 'C',
    move: 'Evenly spaced lists are symmetric: mean = median.',
    why: 'Consecutive integers are evenly spaced, so the list is balanced around its middle value. That makes the mean equal the median. Here the mean is 91 / 7 = 13, and the list is 10, 11, 12, 13, 14, 15, 16, whose middle value is also 13. The quantities are equal.',
    check: { qc: { A: 'median(10,11,12,13,14,15,16)', B: '91/7' } }
  },
  {
    id: 'qc-031', format: 'qc', topic: 'functions', diff: 2,
    stem: 'f(x) = x² - 4x',
    colA: 'f(5)', colB: 'f(-1)',
    key: 'C',
    move: 'Plug in carefully, and wrap negative inputs in parentheses.',
    why: 'f(5) = 25 - 20 = 5. f(-1) = (-1)² - 4(-1) = 1 + 4 = 5. The quantities are equal. (A graph explains why: this parabola is symmetric about x = 2, and 5 and -1 are both 3 units from 2.)',
    diag: { A: 'For f(-1), (-1)² is +1 and -4(-1) is +4, so f(-1) = 5, not -3.' },
    check: { qc: { A: '5^2 - 4*5', B: '(-1)^2 - 4*(-1)' } }
  },
  {
    id: 'qc-032', format: 'qc', topic: 'functions', diff: 2,
    stem: 'f(x) = 2x + 3 and g(x) = x²',
    colA: 'f(g(2))', colB: 'g(f(2))',
    key: 'B',
    move: 'Composite functions work inside out: evaluate the inner function first.',
    why: 'f(g(2)): first g(2) = 4, then f(4) = 2(4) + 3 = 11. g(f(2)): first f(2) = 7, then g(7) = 49. Quantity B is greater. Order matters in composition.',
    diag: { C: 'Composition is not commutative; f(g(2)) = 11 while g(f(2)) = 49.' },
    check: { qc: { A: '2*(2^2) + 3', B: '(2*2 + 3)^2' } }
  },
  {
    id: 'qc-033', format: 'qc', topic: 'graphical', diff: 2,
    stem: 'Line L passes through the points (2, 5) and (6, 17).',
    colA: 'The slope of line L', colB: 'The y-intercept of line L',
    key: 'A',
    move: 'Slope is rise over run; then back up from a known point to x = 0 for the intercept.',
    why: 'Slope = (17 - 5) / (6 - 2) = 12 / 4 = 3. To find the y-intercept, start at (2, 5) and move left 2 units to x = 0; the line drops 3 for each unit, so y = 5 - 6 = -1. Slope 3 is greater than intercept -1, so Quantity A is greater.',
    diag: { B: 'Check the intercept: y = 3x + b through (2, 5) gives 5 = 6 + b, so b = -1.' },
    check: { qc: { A: '(17-5)/(6-2)', B: '5 - 2*(17-5)/(6-2)' } }
  },
  {
    id: 'qc-034', format: 'qc', topic: 'graphical', diff: 2,
    stem: 'Line M has the equation 3x - 2y = 12.',
    colA: 'The x-intercept of line M', colB: 'The absolute value of the y-intercept of line M',
    key: 'B',
    move: 'Intercepts: set the other variable to 0.',
    why: 'x-intercept: set y = 0, so 3x = 12 and x = 4. y-intercept: set x = 0, so -2y = 12 and y = -6. Its absolute value is 6. Since 6 > 4, Quantity B is greater.',
    diag: { A: 'The y-intercept is -6, but the column asks for its absolute value, 6.' },
    check: { qc: { A: '12/3', B: 'abs(12/(-2))' } }
  },
  {
    id: 'qc-035', format: 'qc', topic: 'probability', diff: 3,
    stem: 'A drawer holds 5 black socks and 3 white socks. Two socks are pulled out at random, without replacement.',
    colA: 'The probability that the two socks match in color', colB: 'The probability that the two socks are different colors',
    key: 'B',
    move: 'Without replacement, count pairs with combinations: C(group, 2) over C(total, 2).',
    why: 'Total pairs: C(8,2) = 28. Matching: two black, C(5,2) = 10, or two white, C(3,2) = 3, for 13 pairs. Different: 5 × 3 = 15 pairs. Check: 13 + 15 = 28. So the matching probability is 13/28 and the different probability is 15/28. Quantity B is greater.',
    diag: { A: 'Black is the majority, but a match needs two of the same, and there are more mixed pairs (15) than matching pairs (13).' },
    check: { qc: { A: '(C(5,2) + C(3,2))/C(8,2)', B: '5*3/C(8,2)' } }
  },
  {
    id: 'qc-036', format: 'qc', topic: 'probability', diff: 3,
    stem: 'A fair coin is flipped.',
    colA: 'The probability of exactly 3 heads in 6 flips', colB: 'The probability of exactly 2 heads in 4 flips',
    key: 'B',
    move: 'Exactly k heads in n flips = C(n, k) / 2^n; do not assume "half heads" is equally likely at every n.',
    why: 'Exactly 3 of 6: C(6,3) / 2^6 = 20/64. Exactly 2 of 4: C(4,2) / 2^4 = 6/16 = 24/64. Getting exactly half heads gets less likely as the number of flips grows, because the outcomes spread over more possible counts. Quantity B is greater.',
    diag: { C: 'Both are "exactly half heads," but 20/64 is less than 24/64.' },
    check: { qc: { A: 'C(6,3)/2^6', B: 'C(4,2)/2^4' } }
  },
  {
    id: 'qc-037', format: 'qc', topic: 'exponents', diff: 3,
    stem: 'x² = 16 and y³ = -27',
    colA: 'x', colB: 'y',
    key: 'D',
    move: 'Even powers hide the sign; odd powers keep it.',
    why: 'y³ = -27 has exactly one real solution, y = -3, because a cube keeps the sign. x² = 16 has two: x = 4 or x = -4. If x = 4, Quantity A is greater (4 > -3). If x = -4, Quantity B is greater (-4 < -3). It cannot be determined.',
    diag: { A: 'x could also be -4, which is less than -3.' },
    check: { qc: { A: 'x', B: 'y', vars: { x: 'int:-10..10', y: 'int:-10..10' }, given: 'x^2 == 16 and y^3 == -27' } }
  },
  {
    id: 'qc-038', format: 'qc', topic: 'exponents', diff: 3,
    stem: 'x³ = 64 and y² = 9',
    colA: 'x', colB: 'y',
    key: 'A',
    move: 'Solve each power for every root it allows, then compare against all of them.',
    why: 'x³ = 64 gives exactly x = 4. y² = 9 gives y = 3 or y = -3. Compare 4 with both: 4 > 3 and 4 > -3. Quantity A is greater in every case, so the answer is fixed even though y has two values.',
    diag: { D: 'y has two values, but x beats both of them, so the comparison never changes.' },
    check: { qc: { A: 'x', B: 'y', vars: { x: 'int:-10..10', y: 'int:-10..10' }, given: 'x^3 == 64 and y^2 == 9' } }
  },
  {
    id: 'qc-039', format: 'qc', topic: 'equations', diff: 2,
    stem: 'a + b = 9 and a - b = 3',
    colA: 'a²', colB: 'b³',
    key: 'A',
    move: 'Two linear equations, two unknowns: add them to knock out a variable.',
    why: 'Add the equations: 2a = 12, so a = 6. Then b = 9 - 6 = 3. Quantity A: 6² = 36. Quantity B: 3³ = 27. Quantity A is greater.',
    check: { qc: { A: 'a^2', B: 'b^3', vars: { a: 'rat:-12..12/2', b: 'rat:-12..12/2' }, given: 'a + b == 9 and a - b == 3' } }
  },
  {
    id: 'qc-040', format: 'qc', topic: 'ratios', diff: 4,
    stem: 'p and q are positive integers, and p/q = 0.75.',
    colA: 'q - p', colB: '1',
    key: 'D',
    move: 'A ratio fixes the shape, not the size: p = 3k and q = 4k for any positive integer k.',
    why: '0.75 = 3/4, so p = 3k and q = 4k for some positive integer k. Then q - p = k. With k = 1 (p = 3, q = 4), q - p = 1 and the quantities are equal. With k = 2 (p = 6, q = 8), q - p = 2 and Quantity A is greater. It cannot be determined.',
    diag: { C: 'That assumes p = 3 and q = 4, the smallest pair. 6/8 is also 0.75.' },
    check: { qc: { A: 'q - p', B: '1', vars: { p: 'int:1..30', q: 'int:1..40' }, given: '4*p == 3*q' } }
  },
  {
    id: 'qc-041', format: 'qc', topic: 'exponents', diff: 3,
    stem: '',
    colA: '(2^10)(5^8)', colB: '10^9',
    key: 'B',
    move: 'Pair each 2 with a 5 to make tens, then compare what is left over.',
    why: 'Match eight 2s with the eight 5s: (2^10)(5^8) = (2^2)(2^8 × 5^8) = 4 × 10^8. Quantity B is 10^9 = 10 × 10^8. Since 4 × 10^8 < 10 × 10^8, Quantity B is greater.',
    diag: { A: 'Only eight 2s pair with the eight 5s; the extra 2^2 = 4 multiplies 10^8, giving 400,000,000.' },
    check: { qc: { A: '2^10*5^8', B: '10^9' } }
  },
  {
    id: 'qc-042', format: 'qc', topic: 'exponents', diff: 2,
    stem: '',
    colA: '(-0.5)³', colB: '(-0.5)^4',
    key: 'B',
    move: 'Sign before size: an odd power of a negative is negative, an even power is positive.',
    why: '(-0.5)³ has three negative factors, so it is negative: -0.125. (-0.5)^4 has four, so it is positive: 0.0625. Any positive number beats any negative number, so Quantity B is greater, even though 0.125 is bigger than 0.0625 in size.',
    diag: { A: 'You compared sizes and ignored the sign. -0.125 is less than 0.0625.' },
    check: { qc: { A: '(-0.5)^3', B: '(-0.5)^4' } }
  },
  {
    id: 'qc-043', format: 'qc', topic: 'exponents', diff: 2,
    stem: '',
    colA: '(3.2 × 10^5)(5 × 10^-3)', colB: '1.6 × 10^3',
    key: 'C',
    move: 'Scientific notation: multiply the fronts, add the exponents, then tidy up.',
    why: 'Fronts: 3.2 × 5 = 16. Powers: 10^5 × 10^-3 = 10^2. So Quantity A = 16 × 10^2 = 1,600. Quantity B = 1.6 × 10^3 = 1,600. They are equal.',
    diag: { A: '16 × 10^2 looks bigger than 1.6 × 10^3, but both are 1,600.' },
    check: { qc: { A: '3.2*10^5*5*10^(-3)', B: '1.6*10^3' } }
  },
  {
    id: 'qc-044', format: 'qc', topic: 'percent', diff: 2,
    stem: 'x > 0',
    colA: 'x% of 50', colB: '50% of x',
    key: 'C',
    move: 'Swap trick again: x% of 50 = (x × 50) / 100 = 50% of x.',
    why: 'x% of 50 = (x / 100) × 50 = x / 2. 50% of x = 0.5x = x / 2. Same expression, so they are equal for every positive x.',
    check: { qc: { A: 'x/100*50', B: '50/100*x', vars: { x: 'rat:0..100/2' }, given: 'x > 0' } }
  },
  {
    id: 'qc-045', format: 'qc', topic: 'ratios', diff: 1,
    stem: 'The ratio of boys to girls in a class of 36 students is 4 : 5.',
    colA: 'The number of girls in the class', colB: '20',
    key: 'C',
    move: 'Ratio to counts: add the parts, divide the total, multiply back out.',
    why: '4 + 5 = 9 parts. 36 / 9 = 4 students per part. Girls = 5 parts × 4 = 20. The quantities are equal.',
    check: { qc: { A: '36/(4+5)*5', B: '20' } }
  },
  {
    id: 'qc-046', format: 'qc', topic: 'inequalities', diff: 3,
    stem: 'x < y and y ≠ 0',
    colA: 'x/y', colB: '1',
    key: 'D',
    move: 'Dividing by an unknown sign is risky; test a negative divisor.',
    why: 'If y is positive, dividing x < y by y keeps the direction: x/y < 1, so Quantity B is greater (for example x = 1, y = 2 gives 0.5). If y is negative, the direction flips: x = -3, y = -1 gives x/y = 3, and Quantity A is greater. It cannot be determined.',
    diag: { B: 'That assumes y is positive. With x = -3 and y = -1, x/y = 3.' },
    check: { qc: { A: 'x/y', B: '1', vars: { x: 'rat:-8..8/2', y: 'rat:-8..8/2' }, given: 'x < y and y != 0' } }
  },
  {
    id: 'qc-047', format: 'qc', topic: 'number-properties', diff: 3,
    stem: 'k is an odd integer.',
    colA: 'The remainder when k² is divided by 4', colB: '1',
    key: 'C',
    move: 'Write odd as 2m + 1 and expand; the pattern shows up in one line.',
    why: 'Any odd integer is k = 2m + 1. Then k² = 4m² + 4m + 1 = 4(m² + m) + 1, which is a multiple of 4 plus 1. So the remainder is always 1. Check: 3² = 9 = 2 × 4 + 1; 5² = 25 = 6 × 4 + 1. The quantities are equal.',
    check: { qc: { A: 'mod(k^2, 4)', B: '1', vars: { k: 'int:-41..41' }, given: 'odd(k)' } }
  },
  {
    id: 'qc-048', format: 'qc', topic: 'number-properties', diff: 3,
    stem: 'n is a positive integer.',
    colA: 'The remainder when n² + n is divided by 2', colB: '0',
    key: 'C',
    move: 'Factor first: n² + n = n(n + 1), two consecutive integers, so one of them is even.',
    why: 'n² + n = n(n + 1). Of any two consecutive integers, one is even, so their product is even. The remainder on division by 2 is always 0, and the quantities are equal.',
    check: { qc: { A: 'mod(n^2 + n, 2)', B: '0', vars: { n: 'int:1..60' } } }
  },
  {
    id: 'qc-049', format: 'qc', topic: 'statistics', diff: 3,
    stem: 'Data set: 12, 15, 18, 20, 20, 22, 25, 30, 41. The largest value is then increased by 40.',
    colA: 'The increase in the mean', colB: 'The increase in the median',
    key: 'A',
    move: 'Changing an extreme value moves the mean but not the median.',
    why: 'The largest value goes from 41 to 81. The sum rises by 40 over 9 values, so the mean rises by 40 / 9, about 4.4. The median is the 5th value in order, which is still 20, so the median rises by 0. Quantity A is greater.',
    diag: { C: 'The mean feels every value, including the one that changed. Only the median ignores it.' },
    check: { qc: { A: 'mean(12,15,18,20,20,22,25,30,81) - mean(12,15,18,20,20,22,25,30,41)', B: 'median(12,15,18,20,20,22,25,30,81) - median(12,15,18,20,20,22,25,30,41)' } }
  },
  {
    id: 'qc-050', format: 'qc', topic: 'algebra', diff: 4,
    stem: 'a and b are positive, and a ≠ b.',
    colA: 'a/b + b/a', colB: '2',
    key: 'A',
    move: 'A number plus its reciprocal is at least 2 for positives, and exactly 2 only at 1.',
    why: 'Let t = a/b, which is positive and not 1 because a ≠ b. Quantity A is t + 1/t. Rewrite t + 1/t - 2 = (t² - 2t + 1)/t = (t - 1)²/t. The top is a square, positive since t ≠ 1, and the bottom is positive, so t + 1/t > 2. Example: a = 1, b = 2 gives 0.5 + 2 = 2.5. Quantity A is greater.',
    diag: { D: 'The tie at 2 needs a = b, which the given rules out.' },
    check: { qc: { A: 'a/b + b/a', B: '2', vars: { a: 'rat:0..8/2', b: 'rat:0..8/2' }, given: 'a > 0 and b > 0 and a != b' } }
  },
  {
    id: 'qc-051', format: 'qc', topic: 'equations', diff: 2,
    stem: 'x² - 5x + 6 = 0',
    colA: 'x', colB: '2.5',
    key: 'D',
    move: 'Factor the quadratic and keep both roots before comparing.',
    why: 'x² - 5x + 6 = (x - 2)(x - 3) = 0, so x = 2 or x = 3. Against 2.5: x = 2 makes Quantity B greater, and x = 3 makes Quantity A greater. It cannot be determined.',
    diag: { A: 'x = 3 is a root, but so is x = 2, which is less than 2.5.' },
    check: { qc: { A: 'x', B: '2.5', vars: { x: 'rat:-10..10/2' }, given: 'x^2 - 5*x + 6 == 0' } }
  },
  {
    id: 'qc-052', format: 'qc', topic: 'inequalities', diff: 4,
    stem: 'x² - 5x + 6 ≤ 0',
    colA: 'x', colB: '2',
    key: 'D',
    move: 'A quadratic at or below zero lives between its roots, endpoints included.',
    why: 'The quadratic factors as (x - 2)(x - 3), which is negative only between the roots and zero at the roots. So 2 ≤ x ≤ 3. At x = 2 the quantities are equal; for any x above 2 (up to 3), Quantity A is greater. Two relationships, so it cannot be determined.',
    diag: { A: 'x = 2 itself satisfies the inequality, giving a tie.' },
    check: { qc: { A: 'x', B: '2', vars: { x: 'rat:-5..8/8' }, given: 'x^2 - 5*x + 6 <= 0' } }
  },
  {
    id: 'qc-053', format: 'qc', topic: 'exponents', diff: 2,
    stem: '2^x = 16 and y² = 16',
    colA: 'x', colB: 'y',
    key: 'D',
    move: 'Solve each condition for all of its values before comparing.',
    why: '2^x = 16 means x = 4 (2 × 2 × 2 × 2 = 16). y² = 16 means y = 4 or y = -4. With y = 4 the quantities are equal; with y = -4, Quantity A is greater. It cannot be determined.',
    diag: { C: 'y could also be -4.' },
    check: { qc: { A: 'x', B: 'y', vars: { x: 'int:-10..10', y: 'int:-10..10' }, given: '2^x == 16 and y^2 == 16' } }
  },
  {
    id: 'qc-054', format: 'qc', topic: 'percent', diff: 2,
    stem: 'A population grows by 10% each year for 2 years.',
    colA: 'The total percent increase over the 2 years', colB: '20%',
    key: 'A',
    move: 'Growth compounds: the second 10% is taken from a bigger base.',
    why: 'Multiply: 1.10 × 1.10 = 1.21, so the population is 121% of where it started, a 21% total increase. The second year adds 10% of the already-grown number, which is a little more than 10% of the original. Quantity A is greater.',
    diag: { C: 'Adding 10% + 10% ignores compounding. The total is 21%.' },
    check: { qc: { A: '(1.1*1.1 - 1)*100', B: '20' } }
  },
  {
    id: 'qc-055', format: 'qc', topic: 'interest', diff: 4,
    stem: 'An account starts with 1,000 dollars and no withdrawals or deposits are made.',
    colA: 'Interest earned in 3 years at 10% per year, compounded annually', colB: 'Interest earned in 3 years at 11% per year, simple interest',
    key: 'A',
    move: 'Compound interest earns interest on interest; a slightly higher simple rate may not catch it.',
    why: 'Compound: 1,000 × 1.1³ = 1,000 × 1.331 = 1,331, so the interest is 331 dollars. Simple: 1,000 × 0.11 × 3 = 330 dollars. Quantity A is greater by 1 dollar. Compounding at 10% adds 0.1 + 0.11 + 0.121 = 0.331 of the start, edging out 3 × 0.11 = 0.33.',
    diag: { B: 'The higher rate is not enough: compounding at 10% gives 331 dollars of interest, simple at 11% gives 330.' },
    check: { qc: { A: '1000*1.1^3 - 1000', B: '1000*0.11*3' } }
  },
  {
    id: 'qc-056', format: 'qc', topic: 'ratios', diff: 3,
    stem: 'x is a positive integer.',
    colA: 'x/(x + 1)', colB: '(x + 1)/(x + 2)',
    key: 'B',
    move: 'Fractions of the form n/(n + 1) climb toward 1 as n grows.',
    why: 'Each column is a number over one more than itself, and Quantity B uses the bigger number. Think 1/2, 2/3, 3/4: they climb toward 1. Algebra check: cross-multiply x(x + 2) = x² + 2x versus (x + 1)² = x² + 2x + 1. The right side is always 1 bigger, so Quantity B is greater.',
    check: { qc: { A: 'x/(x+1)', B: '(x+1)/(x+2)', vars: { x: 'int:1..80' } } }
  },
  {
    id: 'qc-057', format: 'qc', topic: 'counting', diff: 3,
    stem: '',
    colA: 'The number of three-digit positive integers whose digits are all odd', colB: 'The number of three-digit positive integers that are multiples of 8',
    key: 'A',
    move: 'Counting with digit rules: slots times choices. Counting multiples: floor(top/k) - floor(below/k).',
    why: 'All digits odd: each of the three digits can be 1, 3, 5, 7, or 9, so 5 × 5 × 5 = 125. Multiples of 8 from 100 to 999: there are floor(999/8) = 124 multiples up to 999, minus floor(99/8) = 12 below 100, which is 112. Quantity A is greater.',
    diag: { B: 'If you got 900/8 = 112.5 and rounded up, list the ends: 104 is the first and 992 the last, giving (992 - 104)/8 + 1 = 112.' },
    check: { qc: { A: '5^3', B: 'floor(999/8) - floor(99/8)' } }
  },
  {
    id: 'qc-058', format: 'qc', topic: 'number-properties', diff: 3,
    stem: 'm and n are consecutive integers, and m < n.',
    colA: 'm²', colB: 'n²',
    key: 'D',
    move: 'Bigger number does not mean bigger square once negatives are allowed.',
    why: 'Since n = m + 1, compare m² with (m + 1)². For positive pairs, such as 2 and 3, n² is larger, so Quantity B is greater. For negative pairs, such as -3 and -2, m² = 9 and n² = 4, so Quantity A is greater. It cannot be determined.',
    diag: { B: 'Only for m ≥ 0. With m = -3 and n = -2, m² is larger.' },
    check: { qc: { A: 'm^2', B: 'n^2', vars: { m: 'int:-20..20', n: 'int:-20..20' }, given: 'n == m + 1' } }
  },
  {
    id: 'qc-059', format: 'qc', topic: 'ratios', diff: 4,
    stem: 'x and y are positive, and x/y = 3/4.',
    colA: '(x + 3)/(y + 4)', colB: '3/4',
    key: 'C',
    move: 'Adding numbers in the same ratio keeps the ratio: (3k + 3)/(4k + 4) = 3/4.',
    why: 'Write x = 3k and y = 4k with k > 0. Then (x + 3)/(y + 4) = (3k + 3)/(4k + 4) = 3(k + 1) / 4(k + 1) = 3/4. Adding 3 and 4, which are in the same 3 : 4 ratio, does not change the fraction. The quantities are equal.',
    diag: { B: 'Adding to top and bottom only moves a fraction when the added amounts are in a different ratio.' },
    check: { qc: { A: '(x+3)/(y+4)', B: '3/4', vars: { x: 'rat:0..12/4', y: 'rat:0..16/4' }, given: 'x > 0 and 4*x == 3*y' } }
  },
  {
    id: 'qc-060', format: 'qc', topic: 'statistics', diff: 1,
    stem: 'Test scores: 70, 80, 80, 90, 100',
    colA: 'The mode of the scores', colB: 'The mean of the scores',
    key: 'B',
    move: 'Mode is the most frequent value; mean is the sum over the count.',
    why: 'The mode is 80 because it appears twice. The mean is (70 + 80 + 80 + 90 + 100) / 5 = 420 / 5 = 84. Quantity B is greater.',
    check: { qc: { A: '80', B: 'mean(70,80,80,90,100)' } }
  }
];
