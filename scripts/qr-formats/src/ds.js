'use strict';
/* Data Sufficiency items in the standard five-option format (choices.ds).
   Every key is recomputed by scripts/qr-formats/lib/check.js (check.ds):
   the checker enumerates the variable domain and tests whether each statement
   pins the asked value to exactly one answer. */
module.exports = [
  {
    id: 'ds-001', format: 'ds', topic: 'equations', diff: 2,
    stem: 'What is the value of the integer x?',
    s1: 'x² = 49', s2: 'x < 0',
    key: 'C',
    move: 'A squared variable hides two signs; look for the statement that picks one.',
    why: 'Statement (1): x² = 49 allows x = 7 or x = -7. Two values, not sufficient. Statement (2): x < 0 allows any negative integer. Not sufficient. Together: the only value with x² = 49 that is negative is x = -7. One value, so both statements together are sufficient, but neither alone is.',
    diag: { A: 'x² = 49 has two roots, 7 and -7. That is two answers, so (1) alone is not enough.' },
    check: { ds: { vars: { x: 'int:-30..30' }, ask: 'x', s1: 'x^2 == 49', s2: 'x < 0' } }
  },
  {
    id: 'ds-002', format: 'ds', topic: 'number-properties', diff: 2,
    stem: 'Is the integer n even?',
    s1: '3n is even.', s2: 'n + 4 is even.',
    key: 'D',
    move: 'For a yes/no question, sufficient means the answer is always yes or always no.',
    why: 'Statement (1): 3 is odd, and odd × n is even only when n itself is even. So the answer is always yes. Sufficient. Statement (2): adding 4 (an even number) does not change whether n is even or odd, so n + 4 even means n is even. Always yes. Sufficient. Each statement alone answers the question.',
    diag: { C: 'Each statement already forces n to be even by itself; you do not need to combine them.' },
    check: { ds: { vars: { n: 'int:-40..40' }, askYes: 'even(n)', s1: 'even(3*n)', s2: 'even(n + 4)' } }
  },
  {
    id: 'ds-003', format: 'ds', topic: 'equations', diff: 3,
    stem: 'What is the value of x + y?',
    s1: '3x + 3y = 21', s2: 'x - y = 1',
    key: 'A',
    move: 'You only need the value asked for, not each variable: factor and look for the asked expression.',
    why: 'Statement (1): factor out the 3 to get 3(x + y) = 21, so x + y = 7. You never learn x or y separately, and you do not need to. Sufficient. Statement (2): x - y = 1 allows x = 1, y = 0 (sum 1) and x = 2, y = 1 (sum 3). Not sufficient. Statement (1) alone is sufficient; statement (2) alone is not.',
    diag: { C: 'Combining would let you solve for x and y, but the question only asks for x + y, which (1) gives directly.', E: 'One equation with two unknowns can still fix a combination like x + y.' },
    check: { ds: { vars: { x: 'rat:-10..10/2', y: 'rat:-10..10/2' }, ask: 'x + y', s1: '3*x + 3*y == 21', s2: 'x - y == 1' } }
  },
  {
    id: 'ds-004', format: 'ds', topic: 'number-properties', diff: 2,
    stem: 'n is a positive integer. What is the value of n?',
    s1: 'n² < 10', s2: 'n is the only prime factor of 27.',
    key: 'B',
    move: 'Sufficient means exactly one possible answer; list the candidates each statement allows.',
    why: 'Statement (1): n² < 10 allows n = 1, 2, or 3. Three values, not sufficient. Statement (2): 27 = 3 × 3 × 3, so its only prime factor is 3, and n = 3. Sufficient. Statement (2) alone is sufficient; statement (1) alone is not.',
    diag: { C: 'Statement (2) already names a single value, so you do not need statement (1).' },
    check: { ds: { vars: { n: 'int:1..40' }, ask: 'n', s1: 'n^2 < 10', s2: 'isprime(n) and mod(27, n) == 0' } }
  },
  {
    id: 'ds-005', format: 'ds', topic: 'ratios', diff: 3,
    stem: 'A bag contains only red and blue marbles. How many red marbles are in the bag?',
    s1: 'The ratio of red marbles to blue marbles is 2 : 3.', s2: 'Red marbles make up 40% of the marbles in the bag.',
    key: 'E',
    move: 'Two statements that say the same thing in different words count as one statement.',
    why: 'Statement (1): red : blue = 2 : 3 gives the shape but not the size; 2 red and 3 blue fits, so does 20 red and 30 blue. Not sufficient. Statement (2): red is 40% of the bag, which is 2 parts out of 5, the exact same ratio as statement (1). Not sufficient. Together you still only know the ratio, never a count, so the statements together are not sufficient.',
    diag: { C: 'Statement (2) is statement (1) in disguise: 2 out of 5 is 40%. Combining them adds no new information.' },
    check: { ds: { vars: { r: 'int:1..60', b: 'int:1..60' }, ask: 'r', s1: '3*r == 2*b', s2: '100*r == 40*(r + b)' } }
  },
  {
    id: 'ds-006', format: 'ds', topic: 'ratios', diff: 2,
    stem: 'A lab colony contains only mice and rats. How many rats are in the colony?',
    s1: 'The ratio of mice to rats is 5 : 3.', s2: 'There are 12 more mice than rats.',
    key: 'C',
    move: 'A ratio plus one actual count or difference pins the whole picture.',
    why: 'Statement (1): mice = 5k and rats = 3k for some k; the size is unknown. Not sufficient. Statement (2): a difference of 12 fits 13 and 1, 20 and 8, and many more. Not sufficient. Together: 5k - 3k = 2k = 12, so k = 6 and there are 3 × 6 = 18 rats. Both together are sufficient, but neither alone is.',
    diag: { E: 'The ratio turns the difference into a number of parts: 2 parts = 12, so 1 part = 6.' },
    check: { ds: { vars: { m: 'int:1..60', r: 'int:1..60' }, ask: 'r', s1: '3*m == 5*r', s2: 'm - r == 12' } }
  },
  {
    id: 'ds-007', format: 'ds', topic: 'inequalities', diff: 2,
    stem: 'Is x > 5?',
    s1: 'x - 3 > 4', s2: 'x² > 25',
    key: 'A',
    move: 'Solve each statement into a range, then ask: is the whole range on one side of the question?',
    why: 'Statement (1): x > 7, and every number above 7 is above 5. The answer is always yes. Sufficient. Statement (2): x² > 25 means x > 5 or x < -5. x = 6 says yes; x = -6 says no. Not sufficient. Statement (1) alone is sufficient; statement (2) alone is not.',
    diag: { D: 'x² > 25 also allows x = -6, which is not greater than 5.' },
    check: { ds: { vars: { x: 'rat:-15..15/2' }, askYes: 'x > 5', s1: 'x - 3 > 4', s2: 'x^2 > 25' } }
  },
  {
    id: 'ds-008', format: 'ds', topic: 'number-properties', diff: 2,
    stem: 'k is an integer. Is k divisible by 6?',
    s1: 'k is divisible by 3.', s2: 'k is divisible by 12.',
    key: 'B',
    move: 'Divisible by a bigger multiple means divisible by every factor of it.',
    why: 'Statement (1): 3 and 9 are both divisible by 3, but 6 is a multiple of 6 and 9 is not. Not sufficient. Statement (2): 12 = 6 × 2, so any multiple of 12 is a multiple of 6. Always yes. Sufficient. Statement (2) alone is sufficient; statement (1) alone is not.',
    diag: { A: 'Divisible by 3 is only half of divisible by 6; k also has to be even. Try k = 9.' },
    check: { ds: { vars: { k: 'int:-72..72' }, askYes: 'mod(k, 6) == 0', s1: 'mod(k, 3) == 0', s2: 'mod(k, 12) == 0' } }
  },
  {
    id: 'ds-009', format: 'ds', topic: 'number-properties', diff: 2,
    stem: 'k is an integer. Is k divisible by 10?',
    s1: 'k is divisible by 5.', s2: 'k is even.',
    key: 'C',
    move: 'To be divisible by 10, k needs both prime pieces: a 2 and a 5.',
    why: 'Statement (1): 15 and 20 are both divisible by 5; only 20 is divisible by 10. Not sufficient. Statement (2): 4 and 20 are both even; only 20 is divisible by 10. Not sufficient. Together, k has a factor of 2 and a factor of 5, so it has a factor of 10. Always yes. Both together are sufficient, but neither alone is.',
    check: { ds: { vars: { k: 'int:-60..60' }, askYes: 'mod(k, 10) == 0', s1: 'mod(k, 5) == 0', s2: 'even(k)' } }
  },
  {
    id: 'ds-010', format: 'ds', topic: 'equations', diff: 1,
    stem: 'What is the value of x?',
    s1: '4x - 7 = 2x + 5', s2: 'x/3 = 2',
    key: 'D',
    move: 'One linear equation in one unknown is always enough on its own.',
    why: 'Statement (1): subtract 2x and add 7 to get 2x = 12, so x = 6. Sufficient. Statement (2): multiply by 3 to get x = 6. Sufficient. Each statement alone is sufficient. On data sufficiency you can stop as soon as you know an equation has one solution; you do not need to finish the arithmetic.',
    check: { ds: { vars: { x: 'rat:-20..20/2' }, ask: 'x', s1: '4*x - 7 == 2*x + 5', s2: 'x/3 == 2' } }
  },
  {
    id: 'ds-011', format: 'ds', topic: 'equations', diff: 3,
    stem: 'What is the value of x?',
    s1: 'x² - 7x + 12 = 0', s2: 'x > 2',
    key: 'E',
    move: 'A range only helps if it cuts all but one root.',
    why: 'Statement (1): (x - 3)(x - 4) = 0, so x = 3 or x = 4. Not sufficient. Statement (2): any number above 2. Not sufficient. Together: both 3 and 4 are greater than 2, so both survive. Still two values, so the statements together are not sufficient.',
    diag: { C: 'Combining only helps if the range removes a root; here 3 and 4 both exceed 2.' },
    check: { ds: { vars: { x: 'rat:-10..10/2' }, ask: 'x', s1: 'x^2 - 7*x + 12 == 0', s2: 'x > 2' } }
  },
  {
    id: 'ds-012', format: 'ds', topic: 'equations', diff: 3,
    stem: 'What is the value of x?',
    s1: 'x² - 7x + 12 = 0', s2: 'x² - 9 = 0',
    key: 'C',
    move: 'Two quadratics together: keep only the root they share.',
    why: 'Statement (1): (x - 3)(x - 4) = 0 gives x = 3 or 4. Not sufficient. Statement (2): x² = 9 gives x = 3 or -3. Not sufficient. Together, x must be on both lists, and the only shared value is 3. Both together are sufficient, but neither alone is.',
    check: { ds: { vars: { x: 'rat:-10..10/2' }, ask: 'x', s1: 'x^2 - 7*x + 12 == 0', s2: 'x^2 - 9 == 0' } }
  },
  {
    id: 'ds-013', format: 'ds', topic: 'statistics', diff: 2,
    stem: 'x, y, and z are integers. What is the mean of x, y, and z?',
    s1: 'x + y + z = 24', s2: 'x + y = 2z',
    key: 'A',
    move: 'A mean only needs the sum and the count; you rarely need the individual values.',
    why: 'Statement (1): the mean is the sum over the count, 24 / 3 = 8. Sufficient, even though x, y, and z themselves are unknown. Statement (2): x = 1, y = 1, z = 1 gives a mean of 1; x = 2, y = 2, z = 2 gives 2. Not sufficient. Statement (1) alone is sufficient; statement (2) alone is not.',
    diag: { C: 'Together you could find z = 8, but statement (1) already gives the mean by itself.' },
    check: { ds: { vars: { x: 'int:-12..20', y: 'int:-12..20', z: 'int:-12..20' }, ask: '(x + y + z)/3', s1: 'x + y + z == 24', s2: 'x + y == 2*z' } }
  },
  {
    id: 'ds-014', format: 'ds', topic: 'statistics', diff: 2,
    stem: 'The mean of the integers a, b, and c is 9. What is the value of c?',
    s1: 'a = 3b', s2: 'a + b = 20',
    key: 'B',
    move: 'Turn a given mean into a sum right away: mean 9 of three numbers means a total of 27.',
    why: 'The stem gives a + b + c = 27. Statement (1): a = 3b gives 4b + c = 27, which still has many solutions (b = 1, c = 23; b = 2, c = 19). Not sufficient. Statement (2): a + b = 20, so c = 27 - 20 = 7. Sufficient. Statement (2) alone is sufficient; statement (1) alone is not.',
    check: { ds: { vars: { a: 'int:-10..30', b: 'int:-10..30', c: 'int:-10..30' }, given: 'a + b + c == 27', ask: 'c', s1: 'a == 3*b', s2: 'a + b == 20' } }
  },
  {
    id: 'ds-015', format: 'ds', topic: 'inequalities', diff: 3,
    stem: 'x and y are nonzero numbers. Is xy > 0?',
    s1: 'x/y > 0', s2: 'y = x³',
    key: 'D',
    move: 'A product and a quotient share their sign rule: positive means same signs.',
    why: 'Statement (1): a positive quotient means x and y have the same sign, and same signs give a positive product. Always yes. Sufficient. Statement (2): xy = x · x³ = x^4, an even power of a nonzero number, so it is positive. Always yes. Sufficient. Each statement alone is sufficient.',
    diag: { A: 'Statement (2) works too: y = x³ always has the same sign as x.' },
    check: { ds: { vars: { x: 'rat:-2..2/2', y: 'rat:-8..8/8' }, given: 'x != 0 and y != 0', askYes: 'x*y > 0', s1: 'x/y > 0', s2: 'y == x^3' } }
  },
  {
    id: 'ds-016', format: 'ds', topic: 'inequalities', diff: 3,
    stem: 'Is x > y?',
    s1: 'x² > y²', s2: 'xy > 0',
    key: 'E',
    move: 'Squares erase signs; test a negative pair before trusting a square comparison.',
    why: 'Statement (1): x = 3, y = 2 says yes; x = -3, y = 2 says no. Not sufficient. Statement (2): same signs, but either order is possible. Not sufficient. Together: x = 3, y = 2 works (yes), and x = -3, y = -2 also works (9 > 4 and the product is positive) but -3 < -2 (no). The statements together are not sufficient.',
    diag: { C: 'Try both negative: x = -3, y = -2 satisfies both statements, and then x < y.' },
    check: { ds: { vars: { x: 'rat:-6..6/2', y: 'rat:-6..6/2' }, askYes: 'x > y', s1: 'x^2 > y^2', s2: 'x*y > 0' } }
  },
  {
    id: 'ds-017', format: 'ds', topic: 'inequalities', diff: 4,
    stem: 'Is x > y?',
    s1: 'x² > y²', s2: 'x + y > 0',
    key: 'C',
    move: 'Factor a difference of squares: x² - y² = (x - y)(x + y).',
    why: 'Statement (1): x = 3, y = 2 says yes; x = -3, y = 2 says no. Not sufficient. Statement (2): x + y > 0 allows x = 5, y = 1 (yes) and x = 1, y = 5 (no). Not sufficient. Together: x² - y² > 0 means (x - y)(x + y) > 0. Since x + y is positive, x - y must be positive too, so x > y. Always yes. Both together are sufficient, but neither alone is.',
    diag: { E: 'The factoring move connects them: a positive product with one positive factor forces the other factor positive.' },
    check: { ds: { vars: { x: 'rat:-6..6/2', y: 'rat:-6..6/2' }, askYes: 'x > y', s1: 'x^2 > y^2', s2: 'x + y > 0' } }
  },
  {
    id: 'ds-018', format: 'ds', topic: 'statistics', diff: 2,
    stem: 'Class P has 20 students and class Q has 30 students. What is the mean score of all 50 students on a quiz?',
    s1: 'The mean score is 80 in class P and 90 in class Q.', s2: 'The total of all 50 scores is 4,300.',
    key: 'D',
    move: 'A combined mean needs the combined total; anything that gives the total is enough.',
    why: 'Statement (1): totals are 20 × 80 = 1,600 and 30 × 90 = 2,700, so 4,300 in all, and the mean is 4,300 / 50 = 86. Sufficient. Statement (2): the combined total is given directly, so the mean is 4,300 / 50 = 86. Sufficient. Each statement alone is sufficient.',
    check: { ds: { vars: { a: 'int:50..100', b: 'int:50..100' }, ask: '(20*a + 30*b)/50', s1: 'a == 80 and b == 90', s2: '20*a + 30*b == 4300' } }
  },
  {
    id: 'ds-019', format: 'ds', topic: 'statistics', diff: 2,
    stem: 'Group X has a mean age of 70 and group Y has a mean age of 90. What is the mean age of the two groups combined?',
    s1: 'Group X has 15 people.', s2: 'Group Y has twice as many people as group X.',
    key: 'B',
    move: 'A weighted average depends only on the ratio of the group sizes, not the sizes themselves.',
    why: 'Statement (1): with 15 in group X, the mean depends on the size of group Y (15 and 15 gives 80; 15 and 45 gives 85). Not sufficient. Statement (2): sizes x and 2x give (70x + 90 · 2x) / 3x = 250x / 3x = 250/3, about 83.3, no matter what x is. Sufficient. Statement (2) alone is sufficient; statement (1) alone is not.',
    diag: { C: 'The x cancels: only the 1 : 2 ratio matters, so statement (1) is not needed.' },
    check: { ds: { vars: { x: 'int:1..40', y: 'int:1..80' }, ask: '(70*x + 90*y)/(x + y)', s1: 'x == 15', s2: 'y == 2*x' } }
  },
  {
    id: 'ds-020', format: 'ds', topic: 'statistics', diff: 4,
    stem: 'v, w, x, y, and z are integers with v ≤ w ≤ x ≤ y ≤ z. What is the median of the five integers?',
    s1: 'v + z = 20', s2: 'w + y = 20',
    key: 'E',
    move: 'The median of five ordered values is the middle one; check whether the statements ever touch it.',
    why: 'The median is x. Statement (1) is about the two ends and says nothing about x. Not sufficient. Statement (2) traps x between w and y but does not fix it. Not sufficient. Together: 8, 8, 9, 12, 12 and 8, 8, 11, 12, 12 both satisfy v + z = 20 and w + y = 20, with medians 9 and 11. The statements together are not sufficient.',
    diag: { C: 'Sums of the outside pairs leave the middle value free between w and y.' },
    check: { ds: { vars: { v: 'int:0..12', w: 'int:0..12', x: 'int:0..12', y: 'int:0..12', z: 'int:0..12' }, given: 'v <= w and w <= x and x <= y and y <= z', ask: 'x', s1: 'v + z == 20', s2: 'w + y == 20' } }
  },
  {
    id: 'ds-021', format: 'ds', topic: 'rates', diff: 2,
    stem: 'A car traveled from town P to town Q in two legs. What was the car\'s average speed, in miles per hour, for the whole trip?',
    s1: 'The first leg was 60 miles and took 1.5 hours.', s2: 'The second leg was 90 miles and took 1.5 hours.',
    key: 'C',
    move: 'Average speed = total distance / total time; you need every leg.',
    why: 'Statement (1) gives the first leg only; the second leg could be anything. Not sufficient. Statement (2) gives the second leg only. Not sufficient. Together: total distance 150 miles over 3 hours, so 50 miles per hour. Both together are sufficient, but neither alone is.',
    check: { ds: { vars: { d1: [40, 60, 80], t1: [1, 1.5, 2], d2: [60, 90, 120], t2: [1, 1.5, 2] }, ask: '(d1 + d2)/(t1 + t2)', s1: 'd1 == 60 and t1 == 1.5', s2: 'd2 == 90 and t2 == 1.5' } }
  },
  {
    id: 'ds-022', format: 'ds', topic: 'number-properties', diff: 1,
    stem: 'n is an integer. Is n odd?',
    s1: 'n + 6 is odd.', s2: '2n + 1 is odd.',
    key: 'A',
    move: 'A statement that is true for every integer tells you nothing.',
    why: 'Statement (1): adding the even number 6 does not change odd or even, so n is odd. Always yes. Sufficient. Statement (2): 2n is even for every integer, so 2n + 1 is always odd, whether n is odd or even. Not sufficient. Statement (1) alone is sufficient; statement (2) alone is not.',
    diag: { D: '2n + 1 is odd for n = 2 as well as n = 3, so statement (2) cannot tell them apart.' },
    check: { ds: { vars: { n: 'int:-40..40' }, askYes: 'odd(n)', s1: 'odd(n + 6)', s2: 'odd(2*n + 1)' } }
  },
  {
    id: 'ds-023', format: 'ds', topic: 'number-properties', diff: 3,
    stem: 'p is a positive integer. Is p a prime number?',
    s1: 'p is odd.', s2: 'p is a factor of 21, and p > 7.',
    key: 'B',
    move: 'A definite "no" is just as sufficient as a definite "yes."',
    why: 'Statement (1): 3 is odd and prime, 9 is odd and not prime. Not sufficient. Statement (2): the factors of 21 are 1, 3, 7, 21, and the only one above 7 is 21 = 3 × 7, which is not prime. The answer is always no, and a definite no is sufficient. Statement (2) alone is sufficient; statement (1) alone is not.',
    diag: { E: 'Sufficient does not mean the answer is yes. Statement (2) always gives no, which settles the question.' },
    check: { ds: { vars: { p: 'int:1..60' }, askYes: 'isprime(p)', s1: 'odd(p)', s2: 'mod(21, p) == 0 and p > 7' } }
  },
  {
    id: 'ds-024', format: 'ds', topic: 'work', diff: 2,
    stem: 'Pumps A and B each work at a constant rate. How many hours do they take to fill a tank working together?',
    s1: 'Pump A alone fills the tank in 6 hours.', s2: 'Pump B fills the tank twice as fast as pump A.',
    key: 'C',
    move: 'Together time = 1 / (rate A + rate B); you need both rates as numbers.',
    why: 'Statement (1) gives pump A only. Not sufficient. Statement (2) gives a relationship but no actual rate. Not sufficient. Together: A takes 6 hours, so B takes 3 hours. Rates 1/6 + 1/3 = 1/2 tank per hour, so together they take 2 hours. Both together are sufficient, but neither alone is.',
    check: { ds: { vars: { a: 'rat:1..12/2', b: 'rat:1..12/2' }, ask: '1/(1/a + 1/b)', s1: 'a == 6', s2: 'a == 2*b' } }
  },
  {
    id: 'ds-025', format: 'ds', topic: 'percent', diff: 2,
    stem: 'What was the original price of a jacket?',
    s1: 'After a 25% discount, the jacket sold for 60 dollars.', s2: 'A 10% increase on the original price would have made it 88 dollars.',
    key: 'D',
    move: 'Any single percent equation with one unknown price is enough.',
    why: 'Statement (1): 75% of the price is 60, so the price is 60 / 0.75 = 80 dollars. Sufficient. Statement (2): 110% of the price is 88, so the price is 88 / 1.1 = 80 dollars. Sufficient. Each statement alone is sufficient.',
    check: { ds: { vars: { p: 'int:1..200' }, ask: 'p', s1: '0.75*p == 60', s2: '1.1*p == 88' } }
  },
  {
    id: 'ds-026', format: 'ds', topic: 'percent', diff: 3,
    stem: 'A club has seniors, juniors, and other members. What percent of the club\'s members are seniors?',
    s1: 'There are 12 seniors in the club.', s2: 'There are 8 more juniors than seniors.',
    key: 'E',
    move: 'A percent needs a part and a whole; check that the whole is actually pinned down.',
    why: 'Statement (1) gives the part but not the whole. Not sufficient. Statement (2) relates two groups but gives neither the part nor the whole. Not sufficient. Together: 12 seniors and 20 juniors, but the number of other members is unknown, so the total could be 32, 40, or anything larger. The statements together are not sufficient.',
    diag: { C: 'Seniors plus juniors is not the whole club; the stem says there are other members too.' },
    check: { ds: { vars: { s: 'int:0..30', j: 'int:0..40', o: 'int:0..30' }, given: 's + j + o > 0', ask: '100*s/(s + j + o)', s1: 's == 12', s2: 'j == s + 8' } }
  },
  {
    id: 'ds-027', format: 'ds', topic: 'number-properties', diff: 2,
    stem: 'n is a nonnegative integer. What is the remainder when n is divided by 6?',
    s1: 'When n is divided by 12, the remainder is 5.', s2: 'When n is divided by 3, the remainder is 2.',
    key: 'A',
    move: 'Write the remainder statement as n = (divisor)k + r and divide that form by the new divisor.',
    why: 'Statement (1): n = 12k + 5 = 6(2k) + 5, so dividing by 6 always leaves 5. Sufficient. Statement (2): n = 3k + 2 allows n = 2 (remainder 2 on division by 6) and n = 5 (remainder 5). Not sufficient. Statement (1) alone is sufficient; statement (2) alone is not.',
    diag: { D: 'Because 3 is smaller than 6, a remainder on 3 does not decide the remainder on 6. Test n = 2 and n = 5.' },
    check: { ds: { vars: { n: 'int:0..200' }, ask: 'mod(n, 6)', s1: 'mod(n, 12) == 5', s2: 'mod(n, 3) == 2' } }
  },
  {
    id: 'ds-028', format: 'ds', topic: 'number-properties', diff: 2,
    stem: 'n is a nonnegative integer. What is the remainder when n is divided by 4?',
    s1: 'When n is divided by 6, the remainder is 3.', s2: 'When n is divided by 8, the remainder is 7.',
    key: 'B',
    move: 'A remainder on a multiple of 4 decides the remainder on 4; a remainder on 6 does not.',
    why: 'Statement (1): n could be 3 (remainder 3 on division by 4) or 9 (remainder 1). Not sufficient. Statement (2): n = 8k + 7 = 4(2k + 1) + 3, so the remainder on 4 is always 3. Sufficient. Statement (2) alone is sufficient; statement (1) alone is not.',
    check: { ds: { vars: { n: 'int:0..200' }, ask: 'mod(n, 4)', s1: 'mod(n, 6) == 3', s2: 'mod(n, 8) == 7' } }
  },
  {
    id: 'ds-029', format: 'ds', topic: 'number-properties', diff: 4,
    stem: 'n is a nonnegative integer. What is the remainder when n is divided by 15?',
    s1: 'When n is divided by 3, the remainder is 2.', s2: 'When n is divided by 5, the remainder is 4.',
    key: 'C',
    move: 'Remainders on 3 and on 5 together fix the remainder on 15; list the numbers that fit both.',
    why: 'Statement (1) allows 2, 5, 8, 11, 14 as remainders on 15. Not sufficient. Statement (2) allows 4, 9, 14. Not sufficient. Together: list numbers that leave 4 on division by 5 (4, 9, 14, 19, 24, 29...) and keep those that leave 2 on division by 3: 14, 29, 44. Each is 15k + 14, so the remainder is always 14. Both together are sufficient, but neither alone is.',
    check: { ds: { vars: { n: 'int:0..300' }, ask: 'mod(n, 15)', s1: 'mod(n, 3) == 2', s2: 'mod(n, 5) == 4' } }
  },
  {
    id: 'ds-030', format: 'ds', topic: 'inequalities', diff: 1,
    stem: 'Is x negative?',
    s1: 'x³ < 0', s2: '-5x > 10',
    key: 'D',
    move: 'Odd powers keep the sign, and dividing by a negative flips the inequality.',
    why: 'Statement (1): a cube is negative only when the number is negative. Always yes. Sufficient. Statement (2): divide by -5 and flip: x < -2, so x is negative. Always yes. Sufficient. Each statement alone is sufficient.',
    check: { ds: { vars: { x: 'rat:-10..10/2' }, askYes: 'x < 0', s1: 'x^3 < 0', s2: '-5*x > 10' } }
  },
  {
    id: 'ds-031', format: 'ds', topic: 'absolute-value', diff: 2,
    stem: 'Is x > 0?',
    s1: 'x² > 4', s2: '|x| > 3',
    key: 'E',
    move: 'Squares and absolute values both throw away the sign, so neither can answer a sign question.',
    why: 'Statement (1): x = 3 and x = -3 both satisfy x² > 4. Not sufficient. Statement (2): x = 4 and x = -4 both satisfy |x| > 3. Not sufficient. Together: x = 4 and x = -4 satisfy both. The statements together are not sufficient.',
    check: { ds: { vars: { x: 'rat:-10..10/2' }, askYes: 'x > 0', s1: 'x^2 > 4', s2: 'abs(x) > 3' } }
  },
  {
    id: 'ds-032', format: 'ds', topic: 'exponents', diff: 1,
    stem: 'n is an integer. What is the value of n?',
    s1: '2^n = 64', s2: 'n² = 36',
    key: 'A',
    move: 'A positive base raised to a power has one exponent for each result; a square has two roots.',
    why: 'Statement (1): 2^6 = 64, and no other exponent gives 64, so n = 6. Sufficient. Statement (2): n = 6 or n = -6. Not sufficient. Statement (1) alone is sufficient; statement (2) alone is not.',
    check: { ds: { vars: { n: 'int:-10..10' }, ask: 'n', s1: '2^n == 64', s2: 'n^2 == 36' } }
  },
  {
    id: 'ds-033', format: 'ds', topic: 'exponents', diff: 2,
    stem: 'x is an integer. What is the value of x?',
    s1: 'x² = 4³', s2: 'x³ = 512',
    key: 'B',
    move: 'Even power: two roots. Odd power: one root.',
    why: 'Statement (1): x² = 64 gives x = 8 or x = -8. Not sufficient. Statement (2): a cube has a single real root, and 8³ = 512, so x = 8. Sufficient. Statement (2) alone is sufficient; statement (1) alone is not.',
    check: { ds: { vars: { x: 'int:-20..20' }, ask: 'x', s1: 'x^2 == 4^3', s2: 'x^3 == 512' } }
  },
  {
    id: 'ds-034', format: 'ds', topic: 'ratios', diff: 1,
    stem: 'A basket holds 30 pieces of fruit, all apples or oranges. How many apples are in the basket?',
    s1: 'The ratio of apples to oranges is 2 : 3.', s2: 'There are 6 more oranges than apples.',
    key: 'D',
    move: 'When the stem gives the total, a ratio or a difference alone is enough.',
    why: 'Statement (1): 2 + 3 = 5 parts make 30, so one part is 6 and apples = 12. Sufficient. Statement (2): a + o = 30 and o - a = 6, so 2a = 24 and a = 12. Sufficient. Each statement alone is sufficient, because the stem already supplies the total.',
    diag: { C: 'The total of 30 is in the stem, so each statement can work with it alone.' },
    check: { ds: { vars: { a: 'int:0..30', o: 'int:0..30' }, given: 'a + o == 30', ask: 'a', s1: '3*a == 2*o', s2: 'o - a == 6' } }
  },
  {
    id: 'ds-035', format: 'ds', topic: 'equations', diff: 2,
    stem: 'A theater sold adult tickets for 12 dollars each and child tickets for 7 dollars each. How many adult tickets were sold?',
    s1: 'A total of 50 tickets were sold.', s2: 'Ticket sales totaled 470 dollars.',
    key: 'C',
    move: 'Two unknowns need two independent equations; check whether one alone has several whole-number answers.',
    why: 'Statement (1): a + c = 50 allows any split. Not sufficient. Statement (2): 12a + 7c = 470 has several whole-number solutions, such as a = 24, c = 26 and a = 31, c = 14. Not sufficient. Together: substitute c = 50 - a to get 12a + 350 - 7a = 470, so 5a = 120 and a = 24. Both together are sufficient, but neither alone is.',
    diag: { B: 'A money equation can have more than one whole-number solution: 12(31) + 7(14) = 470 too.' },
    check: { ds: { vars: { a: 'int:0..70', c: 'int:0..70' }, ask: 'a', s1: 'a + c == 50', s2: '12*a + 7*c == 470' } }
  },
  {
    id: 'ds-036', format: 'ds', topic: 'equations', diff: 3,
    stem: 'Pens cost 2 dollars each and notebooks cost 4 dollars each. Maya bought p pens and n notebooks. What is the value of p?',
    s1: 'Maya spent 40 dollars in all.', s2: 'p + 2n = 20',
    key: 'E',
    move: 'Before combining, check whether the second equation is just the first one rescaled.',
    why: 'Statement (1): 2p + 4n = 40 allows p = 20, n = 0 or p = 10, n = 5. Not sufficient. Statement (2): p + 2n = 20 allows the same pairs. Not sufficient. Together: divide statement (1) by 2 and you get p + 2n = 20, the same equation. One equation, two unknowns, still many solutions. The statements together are not sufficient.',
    diag: { C: 'Divide 2p + 4n = 40 by 2: it is identical to statement (2), so combining adds nothing.' },
    check: { ds: { vars: { p: 'int:0..20', n: 'int:0..20' }, ask: 'p', s1: '2*p + 4*n == 40', s2: 'p + 2*n == 20' } }
  },
  {
    id: 'ds-037', format: 'ds', topic: 'absolute-value', diff: 3,
    stem: 'Is |x - 2| < 3?',
    s1: '0 < x < 4', s2: 'x > -1',
    key: 'A',
    move: 'Turn the absolute value into a range first: |x - 2| < 3 means -1 < x < 5.',
    why: 'The question asks whether -1 < x < 5. Statement (1): every x between 0 and 4 is inside that range. Always yes. Sufficient. Statement (2): x = 1 is inside (yes) but x = 6 is not (no). Not sufficient. Statement (1) alone is sufficient; statement (2) alone is not.',
    check: { ds: { vars: { x: 'rat:-10..10/4' }, askYes: 'abs(x - 2) < 3', s1: 'x > 0 and x < 4', s2: 'x > -1' } }
  },
  {
    id: 'ds-038', format: 'ds', topic: 'inequalities', diff: 4,
    stem: 'Is x² > x?',
    s1: 'x > -1', s2: 'x < 0',
    key: 'B',
    move: 'x² > x fails only from 0 to 1; locate x relative to 0 and 1.',
    why: 'x² > x is false exactly when 0 ≤ x ≤ 1. Statement (1): x = 2 gives yes, x = 1/2 gives no. Not sufficient. Statement (2): for negative x, x² is positive and x is negative, so x² > x. Always yes. Sufficient. Statement (2) alone is sufficient; statement (1) alone is not.',
    diag: { C: 'Statement (2) already settles it: any negative x makes x² positive and bigger than x.' },
    check: { ds: { vars: { x: 'rat:-5..5/4' }, askYes: 'x^2 > x', s1: 'x > -1', s2: 'x < 0' } }
  },
  {
    id: 'ds-039', format: 'ds', topic: 'inequalities', diff: 3,
    stem: 'Is a > b?',
    s1: 'a = 2b', s2: 'b > 0',
    key: 'C',
    move: 'Doubling only makes a number bigger when the number is positive.',
    why: 'Statement (1): b = 3 gives a = 6 (yes), but b = -3 gives a = -6 (no). Not sufficient. Statement (2) says nothing about a. Not sufficient. Together: a = 2b with b positive means a is b plus another positive b, so a > b. Always yes. Both together are sufficient, but neither alone is.',
    diag: { A: 'Doubling a negative makes it smaller: 2(-3) = -6 < -3.' },
    check: { ds: { vars: { a: 'rat:-12..12/2', b: 'rat:-6..6/2' }, askYes: 'a > b', s1: 'a == 2*b', s2: 'b > 0' } }
  },
  {
    id: 'ds-040', format: 'ds', topic: 'functions', diff: 2,
    stem: 'f(x) = ax + 5, where a is a constant. What is the value of f(3)?',
    s1: 'f(1) = 9', s2: 'f(2) - f(0) = 8',
    key: 'D',
    move: 'A function with one unknown constant needs one equation that involves that constant.',
    why: 'f(3) = 3a + 5, so the question is really "what is a?" Statement (1): a + 5 = 9, so a = 4 and f(3) = 17. Sufficient. Statement (2): (2a + 5) - 5 = 2a = 8, so a = 4. Sufficient. Each statement alone is sufficient.',
    check: { ds: { vars: { a: 'rat:-10..10/2' }, ask: '3*a + 5', s1: 'a + 5 == 9', s2: '(2*a + 5) - 5 == 8' } }
  },
  {
    id: 'ds-041', format: 'ds', topic: 'functions', diff: 3,
    stem: 'f(x) = ax² + b, where a and b are constants. What is the value of f(2)?',
    s1: 'f(0) = 3', s2: 'f(-1) = f(1)',
    key: 'E',
    move: 'A statement that is automatically true for the given form carries no information.',
    why: 'f(2) = 4a + b, so you need both constants. Statement (1): f(0) = b = 3, but a is unknown. Not sufficient. Statement (2): f(-1) = a + b and f(1) = a + b, so this is true for every a and b. It tells you nothing. Not sufficient. Together you know only b = 3. The statements together are not sufficient.',
    diag: { C: 'Statement (2) is true for every function of this form because (-1)² = 1², so it adds nothing.' },
    check: { ds: { vars: { a: 'rat:-6..6/2', b: 'rat:-6..6/2' }, ask: '4*a + b', s1: 'b == 3', s2: 'a*(-1)^2 + b == a*1^2 + b' } }
  },
  {
    id: 'ds-042', format: 'ds', topic: 'functions', diff: 3,
    stem: 'f(x) = ax + b, where a and b are constants. What is the value of a?',
    s1: 'f(0) = 4', s2: 'f(5) - f(2) = 12',
    key: 'B',
    move: 'Slope comes from a change in output over a change in input; the intercept is irrelevant.',
    why: 'Statement (1): f(0) = b = 4 gives the intercept only. Not sufficient. Statement (2): f(5) - f(2) = (5a + b) - (2a + b) = 3a = 12, so a = 4. The b cancels. Sufficient. Statement (2) alone is sufficient; statement (1) alone is not.',
    check: { ds: { vars: { a: 'rat:-10..10/2', b: 'rat:-10..10/2' }, ask: 'a', s1: 'b == 4', s2: '(5*a + b) - (2*a + b) == 12' } }
  },
  {
    id: 'ds-043', format: 'ds', topic: 'sequences', diff: 2,
    stem: 'In an arithmetic sequence, what is the 10th term?',
    s1: 'The 4th term is 13 and the 7th term is 22.', s2: 'The common difference is 3.',
    key: 'A',
    move: 'An arithmetic sequence is fixed by any two of its terms.',
    why: 'Statement (1): from the 4th to the 7th term is 3 steps and the value rises by 9, so the difference is 3. The 10th term is 3 more steps past the 7th: 22 + 9 = 31. Sufficient. Statement (2): the difference alone does not anchor the sequence (start at 1 or at 100, same difference). Not sufficient. Statement (1) alone is sufficient; statement (2) alone is not.',
    check: { ds: { vars: { t: 'int:-20..20', d: 'int:-10..10' }, ask: 't + 9*d', s1: 't + 3*d == 13 and t + 6*d == 22', s2: 'd == 3' } }
  },
  {
    id: 'ds-044', format: 'ds', topic: 'sequences', diff: 2,
    stem: 'In an arithmetic sequence, what is the 10th term?',
    s1: 'The 4th term is 13.', s2: 'The common difference is 3.',
    key: 'C',
    move: 'One anchor term plus the step size builds the whole sequence.',
    why: 'Statement (1) gives one term but no step size. Not sufficient. Statement (2) gives the step size but no anchor. Not sufficient. Together: the 10th term is 6 steps after the 4th, so 13 + 6 × 3 = 31. Both together are sufficient, but neither alone is.',
    check: { ds: { vars: { t: 'int:-20..20', d: 'int:-10..10' }, ask: 't + 9*d', s1: 't + 3*d == 13', s2: 'd == 3' } }
  },
  {
    id: 'ds-045', format: 'ds', topic: 'probability', diff: 2,
    stem: 'A box contains only red chips and green chips. If one chip is drawn at random, what is the probability that it is red?',
    s1: 'There are 3 green chips for every 2 red chips.', s2: 'The number of green chips is 50% greater than the number of red chips.',
    key: 'D',
    move: 'A probability is a ratio, so a ratio alone can be enough.',
    why: 'Statement (1): red : green = 2 : 3, so red is 2 out of every 5 chips, probability 2/5. Sufficient. Statement (2): green = 1.5 × red, which is the same 2 : 3 ratio, so again 2/5. Sufficient. Each statement alone is sufficient. You never need the actual number of chips.',
    diag: { E: 'Unlike a count, a probability only needs the ratio, and each statement gives it.' },
    check: { ds: { vars: { r: 'int:0..40', g: 'int:0..60' }, given: 'r + g > 0', ask: 'r/(r + g)', s1: '2*g == 3*r and r > 0', s2: 'g == 1.5*r and r > 0' } }
  },
  {
    id: 'ds-046', format: 'ds', topic: 'probability', diff: 3,
    stem: 'A club has n members, some of whom play chess and some of whom play checkers. If a member is chosen at random, what is the probability that the member plays chess?',
    s1: '12 members play chess.', s2: '8 members do not play checkers.',
    key: 'E',
    move: 'Check that each statement is about the group in the question, not a neighboring group.',
    why: 'The probability is (chess players) / n. Statement (1) gives the top but not n. Not sufficient. Statement (2) is about checkers, which says nothing about chess, and it does not give n either. Not sufficient. Together: 12 chess players, but n is still unknown (it could be 20 or 30). The statements together are not sufficient.',
    diag: { C: 'Statement (2) describes checkers players. It does not fix n or the chess count.' },
    check: { ds: { vars: { c: 'int:0..30', n: 'int:1..30', k: 'int:0..30' }, given: 'c <= n and k <= n', ask: 'c/n', s1: 'c == 12', s2: 'n - k == 8' } }
  },
  {
    id: 'ds-047', format: 'ds', topic: 'statistics', diff: 2,
    stem: 'Is the mean of 4, 7, and x greater than 6?',
    s1: 'x > 8', s2: 'x > 6',
    key: 'A',
    move: 'Convert "mean greater than 6" into "sum greater than 18," then solve for x.',
    why: 'The mean is greater than 6 exactly when 4 + 7 + x > 18, that is, x > 7. Statement (1): x > 8 guarantees x > 7. Always yes. Sufficient. Statement (2): x = 6.5 gives no; x = 10 gives yes. Not sufficient. Statement (1) alone is sufficient; statement (2) alone is not.',
    check: { ds: { vars: { x: 'rat:-10..20/2' }, askYes: '(4 + 7 + x)/3 > 6', s1: 'x > 8', s2: 'x > 6' } }
  },
  {
    id: 'ds-048', format: 'ds', topic: 'statistics', diff: 3,
    stem: 'What is the range of the four numbers 3, 9, x, and y?',
    s1: 'x and y are both between 3 and 9, inclusive.', s2: 'x = y',
    key: 'A',
    move: 'Range = largest minus smallest; ask whether the new values could become an end.',
    why: 'Statement (1): if x and y sit between 3 and 9, then 3 is still the smallest and 9 is still the largest, so the range is 9 - 3 = 6 whatever x and y are. Sufficient. Statement (2): x = y = 5 gives range 6, but x = y = 20 gives range 17. Not sufficient. Statement (1) alone is sufficient; statement (2) alone is not.',
    diag: { E: 'You do not need x and y themselves, only that they stay inside the existing ends.' },
    check: { ds: { vars: { x: 'rat:-5..20/2', y: 'rat:-5..20/2' }, ask: 'max(3, 9, x, y) - min(3, 9, x, y)', s1: 'x >= 3 and x <= 9 and y >= 3 and y <= 9', s2: 'x == y' } }
  },
  {
    id: 'ds-049', format: 'ds', topic: 'statistics', diff: 2,
    stem: 'What is the median of the four numbers 2, 5, 8, and x?',
    s1: 'x > 2', s2: 'x > 8',
    key: 'B',
    move: 'With four values, the median is the average of the middle two; find which two are in the middle.',
    why: 'Statement (1): if x = 3, the middle two are 3 and 5 (median 4); if x = 6, they are 5 and 6 (median 5.5). Not sufficient. Statement (2): if x > 8, the order is 2, 5, 8, x, so the middle two are always 5 and 8 and the median is 6.5. Sufficient. Statement (2) alone is sufficient; statement (1) alone is not.',
    check: { ds: { vars: { x: 'rat:-5..20/2' }, ask: 'median(2, 5, 8, x)', s1: 'x > 2', s2: 'x > 8' } }
  },
  {
    id: 'ds-050', format: 'ds', topic: 'statistics', diff: 2,
    stem: 'What is the mean of x and y?',
    s1: 'x - y = 6', s2: '2x - 2y = 12',
    key: 'E',
    move: 'A difference never tells you a sum; and a doubled equation is the same equation.',
    why: 'The mean is (x + y) / 2, so you need x + y. Statement (1): x = 6, y = 0 (mean 3) and x = 10, y = 4 (mean 7) both work. Not sufficient. Statement (2) is statement (1) multiplied by 2. Not sufficient. Together it is still one equation. The statements together are not sufficient.',
    check: { ds: { vars: { x: 'rat:-15..15/2', y: 'rat:-15..15/2' }, ask: '(x + y)/2', s1: 'x - y == 6', s2: '2*x - 2*y == 12' } }
  },
  {
    id: 'ds-051', format: 'ds', topic: 'algebra', diff: 4,
    stem: 'What is the mean of x and y?',
    s1: 'x - y = 6', s2: 'x² - y² = 48',
    key: 'C',
    move: 'Spot the difference of squares: x² - y² = (x - y)(x + y).',
    why: 'You need x + y. Statement (1) gives only the difference. Not sufficient. Statement (2): x = 7, y = 1 gives 48 (mean 4), and x = -7, y = -1 also gives 48 (mean -4). Not sufficient. Together: (x - y)(x + y) = 48 and x - y = 6, so 6(x + y) = 48 and x + y = 8. The mean is 4. Both together are sufficient, but neither alone is.',
    diag: { B: 'x² - y² = 48 fits both (7, 1) and (-7, -1), which have different means.' },
    check: { ds: { vars: { x: 'rat:-15..15/2', y: 'rat:-15..15/2' }, ask: '(x + y)/2', s1: 'x - y == 6', s2: 'x^2 - y^2 == 48' } }
  },
  {
    id: 'ds-052', format: 'ds', topic: 'absolute-value', diff: 3,
    stem: 'Is |x| > 4?',
    s1: 'x² > 20', s2: 'x < -5',
    key: 'D',
    move: '|x| is the distance from 0; compare each statement against "more than 4 away."',
    why: 'Statement (1): x² > 20 means |x| > √20, which is about 4.47, more than 4. Always yes. Sufficient. Statement (2): any x below -5 is more than 5 away from 0. Always yes. Sufficient. Each statement alone is sufficient.',
    check: { ds: { vars: { x: 'rat:-10..10/4' }, askYes: 'abs(x) > 4', s1: 'x^2 > 20', s2: 'x < -5' } }
  },
  {
    id: 'ds-053', format: 'ds', topic: 'absolute-value', diff: 2,
    stem: 'Is |x + 1| > 3?',
    s1: 'x < 3', s2: 'x > 2.5',
    key: 'B',
    move: 'Rewrite the question as a range: |x + 1| > 3 means x > 2 or x < -4.',
    why: 'Statement (1): x = 0 gives |1| = 1 (no), and x = -5 gives |-4| = 4 (yes). Not sufficient. Statement (2): every x above 2.5 is above 2, so |x + 1| > 3. Always yes. Sufficient. Statement (2) alone is sufficient; statement (1) alone is not.',
    check: { ds: { vars: { x: 'rat:-10..10/4' }, askYes: 'abs(x + 1) > 3', s1: 'x < 3', s2: 'x > 2.5' } }
  },
  {
    id: 'ds-054', format: 'ds', topic: 'interest', diff: 4,
    stem: 'A deposit earns simple interest at a constant annual rate, with no withdrawals. What is the annual interest rate, in percent?',
    s1: 'After 4 years the account holds 1,200 dollars.', s2: 'The interest earned in the first year was 50 dollars.',
    key: 'C',
    move: 'Simple interest: amount in the account = principal + years × (yearly interest). Two unknowns need two facts.',
    why: 'Let P be the deposit and I the yearly interest. Statement (1): P + 4I = 1,200 fits P = 1,000 at 5% and P = 960 at 6.25%. Not sufficient. Statement (2): I = 50 fits P = 1,000 at 5% and P = 500 at 10%. Not sufficient. Together: P + 200 = 1,200, so P = 1,000 and the rate is 50 / 1,000 = 5%. Both together are sufficient, but neither alone is.',
    check: { ds: { vars: { P: 'int:1..1200', r: 'rat:1..10/4' }, ask: 'r', s1: 'P*(1 + 4*r/100) == 1200', s2: 'P*r/100 == 50' } }
  },
  {
    id: 'ds-055', format: 'ds', topic: 'mixture', diff: 3,
    stem: 'A container holds 10 liters of a salt solution. How many liters of pure water must be added to make the solution exactly 20% salt?',
    s1: 'The solution is currently 30% salt.', s2: 'The solution currently contains more than 2 liters of salt.',
    key: 'A',
    move: 'Adding water never changes the amount of salt; fix the salt, then find the new total.',
    why: 'Statement (1): 30% of 10 liters is 3 liters of salt. For that to be 20%, the total must be 3 / 0.2 = 15 liters, so add 5 liters of water. Sufficient. Statement (2): more than 2 liters of salt allows 3 liters (add 5) or 4 liters (add 10). Not sufficient. Statement (1) alone is sufficient; statement (2) alone is not.',
    check: { ds: { vars: { c: 'int:20..100' }, ask: '10*c/20 - 10', s1: 'c == 30', s2: '10*c/100 > 2' } }
  },
  {
    id: 'ds-056', format: 'ds', topic: 'work', diff: 3,
    stem: 'Machine M works at a constant rate. How many hours does machine M alone take to fill an order?',
    s1: 'Machine M fills one third of the order in 2 hours.', s2: 'Machines M and N together fill the order in 4 hours, and machine N alone takes 12 hours.',
    key: 'D',
    move: 'Rates subtract cleanly: rate of M = (together rate) - (rate of N).',
    why: 'Statement (1): one third in 2 hours means the whole order in 6 hours. Sufficient. Statement (2): together rate 1/4, N rate 1/12, so M rate = 1/4 - 1/12 = 3/12 - 1/12 = 1/6, which is 6 hours. Sufficient. Each statement alone is sufficient.',
    check: { ds: { vars: { m: 'rat:1..20/2', n: 'rat:1..20/2' }, ask: 'm', s1: '2/m == 1/3', s2: '1/m + 1/n == 1/4 and n == 12' } }
  },
  {
    id: 'ds-057', format: 'ds', topic: 'rates', diff: 3,
    stem: 'Car A and car B each drove at a constant speed. Did car A travel farther than car B?',
    s1: 'Car A drove faster than car B.', s2: 'Car A drove 60 miles per hour for 3 hours, and car B drove 50 miles per hour for 3.5 hours.',
    key: 'B',
    move: 'Distance = speed × time; faster is not farther unless the times are known.',
    why: 'Statement (1): faster helps, but car B could have driven much longer. A at 60 for 2 hours (120 miles) loses to B at 50 for 3 hours (150 miles). Not sufficient. Statement (2): A covers 60 × 3 = 180 miles and B covers 50 × 3.5 = 175 miles. Yes. Sufficient. Statement (2) alone is sufficient; statement (1) alone is not.',
    check: { ds: { vars: { va: [40, 50, 60], ta: [2, 3, 3.5, 4], vb: [40, 50, 60], tb: [2, 3, 3.5, 4] }, askYes: 'va*ta > vb*tb', s1: 'va > vb', s2: 'va == 60 and ta == 3 and vb == 50 and tb == 3.5' } }
  },
  {
    id: 'ds-058', format: 'ds', topic: 'percent', diff: 1,
    stem: 'Every employee at a company works either full time or part time. How many employees work part time?',
    s1: '40% of the employees work part time.', s2: 'There are 90 full-time employees.',
    key: 'C',
    move: 'A percent plus one real count unlocks every count.',
    why: 'Statement (1) gives the split but no size. Not sufficient. Statement (2) gives the full-time count but not the part-time count. Not sufficient. Together: full time is 60%, so 0.6 × total = 90, total = 150, and part time = 150 - 90 = 60. Both together are sufficient, but neither alone is.',
    check: { ds: { vars: { p: 'int:0..200', f: 'int:0..200' }, given: 'p + f > 0', ask: 'p', s1: '100*p == 40*(p + f)', s2: 'f == 90' } }
  },
  {
    id: 'ds-059', format: 'ds', topic: 'number-properties', diff: 3,
    stem: 'n is an integer. Is n divisible by 4?',
    s1: 'n is even.', s2: 'n is divisible by 6.',
    key: 'E',
    move: 'Count the factors of 2: divisible by 4 needs two of them.',
    why: 'Statement (1): 2 is even but not divisible by 4; 8 is both. Not sufficient. Statement (2): 6 is not divisible by 4; 12 is. Not sufficient. Together: multiples of 6 are already even, so statement (1) adds nothing, and 6 (no) and 12 (yes) still both fit. The statements together are not sufficient.',
    diag: { C: 'Even and divisible by 6 guarantees only one factor of 2. n = 6 is not divisible by 4.' },
    check: { ds: { vars: { n: 'int:-60..60' }, askYes: 'mod(n, 4) == 0', s1: 'even(n)', s2: 'mod(n, 6) == 0' } }
  },
  {
    id: 'ds-060', format: 'ds', topic: 'exponents', diff: 4,
    stem: 'x is an integer. What is the value of 3^x?',
    s1: '9^x = 81', s2: '3^(2x) - 2 · 3^x = 63',
    key: 'D',
    move: 'Spot the hidden quadratic: let u = 3^x, and remember u must be positive.',
    why: 'Statement (1): 9^x = 81 = 9², so x = 2 and 3^x = 9. Sufficient. Statement (2): let u = 3^x. Then u² - 2u - 63 = 0 factors as (u - 9)(u + 7) = 0, so u = 9 or u = -7. A power of 3 is always positive, so u = 9. Sufficient. Each statement alone is sufficient.',
    diag: { A: 'Statement (2) looks like it has two answers, but 3^x can never be -7.' },
    check: { ds: { vars: { x: 'int:-6..6' }, ask: '3^x', s1: '9^x == 81', s2: '3^(2*x) - 2*3^x == 63' } }
  }
];
