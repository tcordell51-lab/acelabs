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
  }
];
