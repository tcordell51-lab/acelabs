'use strict';
/* Applied word problems at real DAT difficulty (multi-step, calculator allowed).
   Keys recomputed exactly by scripts/qr-formats/lib/check.js (check.num). */
module.exports = [
  {
    id: 'aw-001', format: 'aw', topic: 'work', diff: 3,
    stem: 'Pump P can fill an empty tank in 6 hours, and pump Q can fill the same tank in 9 hours. Pump P runs alone for 2 hours, and then pump Q is turned on as well. How many hours after pump P started will the tank be full?',
    opts: ['2.4 hours', '3.6 hours', '4.4 hours', '4.8 hours', '5.6 hours'],
    answer: '4.4 hours',
    move: 'Work in rates (tanks per hour); rates add, times do not.',
    why: 'Pump P fills 1/6 of the tank per hour, so in 2 hours it fills 2/6 = 1/3. Two thirds remain. Together the pumps fill 1/6 + 1/9 = 3/18 + 2/18 = 5/18 of the tank per hour. Time for the rest: (2/3) / (5/18) = (2/3) × (18/5) = 12/5 = 2.4 hours. Add the first 2 hours: 2 + 2.4 = 4.4 hours after pump P started.',
    diag: { '2.4 hours': 'That is only the time both pumps run together. Add the 2 hours pump P ran alone.', '3.6 hours': 'That is how long both pumps would need for a full empty tank (18/5). Part of the tank was already filled.' },
    check: { num: '2 + (1 - 2/6) / (1/6 + 1/9)' }
  },
  {
    id: 'aw-002', format: 'aw', topic: 'mixture', diff: 2,
    stem: 'A lab has 30 liters of a 10% saline solution. How many liters of a 40% saline solution must be added to produce a mixture that is 20% saline?',
    opts: ['10 liters', '12 liters', '15 liters', '18 liters', '20 liters'],
    answer: '15 liters',
    move: 'Track the pure stuff: amount of salt before = amount of salt after.',
    why: 'Let x be the liters of 40% solution. Salt in: 0.10(30) + 0.40x = 3 + 0.4x. Salt out: 0.20(30 + x) = 6 + 0.2x. Set them equal: 3 + 0.4x = 6 + 0.2x, so 0.2x = 3 and x = 15 liters. Check: 3 + 6 = 9 liters of salt in 45 liters is 20%.',
    diag: { '10 liters': 'Splitting the difference evenly ignores how far each solution sits from 20%. The 40% solution is twice as far, so you need half as much as the 30 liters.' },
    check: { num: '(30*20 - 30*10) / (40 - 20)' }
  },
  {
    id: 'aw-003', format: 'aw', topic: 'percent', diff: 3,
    stem: 'A store sets the list price of a jacket 60% above its cost. During a sale the jacket sells for 25% off the list price, and the store makes a profit of 18 dollars on the sale. What was the store\'s cost for the jacket?',
    opts: ['51.43 dollars', '72 dollars', '75 dollars', '90 dollars', '100 dollars'],
    answer: '90 dollars',
    move: 'Chain percent changes as multipliers: up 60% is × 1.6, down 25% is × 0.75.',
    why: 'Let the cost be c. List price = 1.6c. Sale price = 0.75 × 1.6c = 1.2c. Profit = 1.2c - c = 0.2c. So 0.2c = 18 and c = 90 dollars. The shortcut trap: +60% then -25% is not +35%; multiplied, it is +20%.',
    diag: { '51.43 dollars': 'You added the percents (+60% - 25% = +35%) and solved 0.35c = 18. Percent changes multiply: 1.6 × 0.75 = 1.2, a 20% gain.', '72 dollars': 'Check by plugging in: 72 × 1.2 = 86.4, a profit of 14.4, not 18.' },
    check: { num: '18 / (1.6*0.75 - 1)' }
  }
];
