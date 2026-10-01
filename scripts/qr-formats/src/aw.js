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
  },
  {
    id: 'aw-004', format: 'aw', topic: 'rates', diff: 3,
    stem: 'A cyclist rides 30 miles from home to a lake at an average speed of 15 miles per hour and returns home along the same route at an average speed of 10 miles per hour. What is the cyclist\'s average speed for the entire round trip, in miles per hour?',
    opts: ['12', '12.5', '13', '14', '15'],
    answer: '12',
    move: 'Average speed is total distance over total time, never the average of the two speeds.',
    why: 'Time out: 30 / 15 = 2 hours. Time back: 30 / 10 = 3 hours. Total: 60 miles in 5 hours, so 60 / 5 = 12 miles per hour. Averaging the speeds gives 12.5, which is too high because the cyclist spends more time at the slower speed.',
    diag: { '12.5': 'That averages 15 and 10. The slow leg takes longer, so it counts for more of the trip.' },
    check: { num: '(30 + 30)/(30/15 + 30/10)' }
  },
  {
    id: 'aw-005', format: 'aw', topic: 'rates', diff: 3,
    stem: 'Train A leaves a station at 1:00 p.m. traveling at 60 miles per hour. Train B leaves the same station at 2:30 p.m. on a parallel track in the same direction, traveling at 80 miles per hour. How many hours after Train B departs will it catch up to Train A?',
    opts: ['1.5', '2.25', '3', '3.75', '4.5'],
    answer: '4.5',
    move: 'Catch-up: head start distance / difference in speeds.',
    why: 'By 2:30 Train A has run 1.5 hours at 60 mph, a 90-mile head start. Train B closes the gap at 80 - 60 = 20 miles per hour. Time to close 90 miles: 90 / 20 = 4.5 hours after Train B leaves, at 7:00 p.m.',
    diag: { '1.5': 'That is the head start in time. The gap closes at only 20 miles per hour.' },
    check: { num: '(60*1.5)/(80 - 60)' }
  },
  {
    id: 'aw-006', format: 'aw', topic: 'rates', diff: 2,
    stem: 'Two runners start at opposite ends of a 12-mile trail at the same time and run toward each other. One runs at 7 miles per hour and the other at 5 miles per hour. How many miles from the faster runner\'s starting point do they meet?',
    opts: ['5', '6', '6.5', '7', '8.4'],
    answer: '7',
    move: 'Moving toward each other: speeds add. Find the meeting time, then one runner\'s distance.',
    why: 'They close the gap at 7 + 5 = 12 miles per hour, so they meet after 12 / 12 = 1 hour. In 1 hour the faster runner covers 7 miles. Check: the slower runner covers 5, and 7 + 5 = 12.',
    diag: { '6': 'Halfway assumes equal speeds. The faster runner covers more of the trail.', '5': 'That is the slower runner\'s distance.' },
    check: { num: '7*12/(7 + 5)' }
  },
  {
    id: 'aw-007', format: 'aw', topic: 'rates', diff: 4,
    stem: 'A delivery van drives 120 miles at 40 miles per hour, stops for half an hour, and then drives another 90 miles at 60 miles per hour. What is the van\'s average speed for the whole trip, including the stop, in miles per hour?',
    opts: ['42', '45', '46.67', '50', '52.5'],
    answer: '42',
    move: 'Every minute on the clock counts toward total time, including stops.',
    why: 'Leg 1: 120 / 40 = 3 hours. Stop: 0.5 hours. Leg 2: 90 / 60 = 1.5 hours. Total time: 5 hours for 210 miles, so 210 / 5 = 42 miles per hour. Leaving out the stop gives 210 / 4.5 = 46.67; averaging 40 and 60 gives 50.',
    diag: { '46.67': 'The question says including the stop, so add the half hour to the total time.', '50': 'That averages the two speeds; use total distance over total time.' },
    check: { num: '(120 + 90)/(120/40 + 1/2 + 90/60)', round: 2 }
  },
  {
    id: 'aw-008', format: 'aw', topic: 'rates', diff: 2,
    stem: 'A boat travels 36 miles downstream in 2 hours. The return trip upstream along the same route takes 3 hours. Assuming the boat\'s speed in still water and the speed of the current are constant, what is the speed of the current, in miles per hour?',
    opts: ['2', '3', '5', '6', '15'],
    answer: '3',
    move: 'Downstream = boat + current, upstream = boat - current; half the difference is the current.',
    why: 'Downstream speed: 36 / 2 = 18 mph. Upstream speed: 36 / 3 = 12 mph. Boat + current = 18 and boat - current = 12. Subtract: 2 × current = 6, so the current is 3 mph (and the boat is 15 mph).',
    diag: { '6': 'That is the difference between the two speeds, which equals twice the current.', '15': 'That is the boat\'s speed in still water.' },
    check: { num: '(36/2 - 36/3)/2' }
  },
  {
    id: 'aw-009', format: 'aw', topic: 'rates', diff: 3,
    stem: 'Two cars leave the same point at the same time and drive in opposite directions. One car is 15 miles per hour faster than the other. After 2.5 hours they are 275 miles apart. What is the speed of the slower car, in miles per hour?',
    opts: ['40', '47.5', '55', '62.5', '110'],
    answer: '47.5',
    move: 'Opposite directions: the distance apart grows at the sum of the speeds.',
    why: 'Let v be the slower speed; the faster is v + 15. Together they separate at 2v + 15 mph. In 2.5 hours: 2.5(2v + 15) = 275, so 2v + 15 = 110, 2v = 95, and v = 47.5. The faster car goes 62.5.',
    diag: { '62.5': 'That is the faster car. The slower one is 15 mph less.', '110': 'That is the combined speed, 275 / 2.5.' },
    check: { num: '(275/2.5 - 15)/2' }
  },
  {
    id: 'aw-010', format: 'aw', topic: 'work', diff: 3,
    stem: 'An inlet pipe can fill an empty tank in 4 hours, and a drain can empty a full tank in 6 hours. If the tank starts empty and both the inlet and the drain are open, how many hours will it take to fill the tank?',
    opts: ['2.4', '5', '10', '12', '24'],
    answer: '12',
    move: 'A drain is a negative rate: subtract it.',
    why: 'Inlet: +1/4 tank per hour. Drain: -1/6 tank per hour. Net: 1/4 - 1/6 = 3/12 - 2/12 = 1/12 tank per hour. Filling one tank takes 12 hours. Adding the rates as if both helped gives 2.4 hours.',
    diag: { '2.4': 'The drain works against the inlet; subtract its rate instead of adding it.' },
    check: { num: '1/(1/4 - 1/6)' }
  },
  {
    id: 'aw-011', format: 'aw', topic: 'work', diff: 3,
    stem: 'Six painters, all working at the same rate, can paint a building in 10 days. After the six painters have worked for 4 days, 3 more painters who work at the same rate join them. In total, how many days does the job take from the start?',
    opts: ['6', '7', '8', '8.5', '9'],
    answer: '8',
    move: 'Count work in worker-days: total job = workers × days.',
    why: 'The job is 6 × 10 = 60 painter-days. In 4 days, 6 painters do 24 painter-days, leaving 36. Nine painters finish 36 painter-days in 36 / 9 = 4 days. Total: 4 + 4 = 8 days.',
    check: { num: '4 + (6*10 - 6*4)/9' }
  },
  {
    id: 'aw-012', format: 'aw', topic: 'work', diff: 4,
    stem: 'Machine A can complete an order in 12 hours and machine B can complete the same order in 8 hours. Both machines start together, but after 3 hours machine A breaks down and machine B finishes the order alone. How many hours does the whole order take?',
    opts: ['4.8', '6', '7.5', '8', '9'],
    answer: '6',
    move: 'Split the job into phases: work done = rate × time in each phase, and the phases add to 1.',
    why: 'Together for 3 hours: 3(1/12 + 1/8) = 3(2/24 + 3/24) = 15/24 = 5/8 of the order. Remaining: 3/8. Machine B alone does 1/8 per hour, so it needs 3 more hours. Total: 3 + 3 = 6 hours. 4.8 hours is the time if both machines worked the whole way.',
    diag: { '4.8': 'That is the together time with no breakdown. Machine A stopped after 3 hours.' },
    check: { num: '3 + (1 - 3*(1/12 + 1/8))/(1/8)' }
  },
  {
    id: 'aw-013', format: 'aw', topic: 'work', diff: 2,
    stem: 'Pat can sort a shipment alone in 5 hours. Working together, Pat and Sam can sort the same shipment in 3 hours. How many hours would Sam take to sort the shipment alone?',
    opts: ['2', '4', '6.5', '7.5', '8'],
    answer: '7.5',
    move: 'Together rate minus one worker\'s rate leaves the other worker\'s rate.',
    why: 'Together: 1/3 shipment per hour. Pat: 1/5. Sam: 1/3 - 1/5 = 5/15 - 3/15 = 2/15 shipment per hour. Time alone: 15/2 = 7.5 hours. Subtracting the times (5 - 3 = 2) is a common slip.',
    diag: { '2': 'Times do not subtract; rates do. 1/3 - 1/5 = 2/15.' },
    check: { num: '1/(1/3 - 1/5)' }
  },
  {
    id: 'aw-014', format: 'aw', topic: 'work', diff: 2,
    stem: 'One printer can print 1,800 pages in 45 minutes, and a second printer can print 1,800 pages in 30 minutes. Working together at these rates, how many minutes will the two printers take to print 3,000 pages?',
    opts: ['25', '30', '37.5', '45', '75'],
    answer: '30',
    move: 'Turn each machine into pages per minute, add, then divide the job by the combined rate.',
    why: 'First printer: 1,800 / 45 = 40 pages per minute. Second: 1,800 / 30 = 60 pages per minute. Together: 100 pages per minute. 3,000 pages take 3,000 / 100 = 30 minutes. Averaging the times (37.5) is a trap.',
    diag: { '37.5': 'Averaging 45 and 30 does not combine two machines; add their rates.' },
    check: { num: '3000/(1800/45 + 1800/30)' }
  },
  {
    id: 'aw-015', format: 'aw', topic: 'work', diff: 4,
    stem: 'Pipe A can fill an empty tank in 6 hours and pipe B can fill it in 9 hours, while drain C can empty a full tank in 12 hours. If the tank is empty and all three are opened at once, how many hours will it take to fill the tank, to the nearest hundredth?',
    opts: ['2.77', '3.27', '3.6', '4.5', '5.14'],
    answer: '5.14',
    move: 'Fillers add, drains subtract, then invert the net rate.',
    why: 'Rates: A = 1/6, B = 1/9, C = -1/12 tank per hour. Common denominator 36: 6/36 + 4/36 - 3/36 = 7/36. Time = 36/7 = 5.142..., about 5.14 hours. Treating the drain as a filler gives 36/13, about 2.77; A and B alone give 3.6.',
    diag: { '2.77': 'The drain removes water. Subtract 1/12 instead of adding it.', '3.6': 'That is A and B without the drain.' },
    check: { num: '1/(1/6 + 1/9 - 1/12)', round: 2 }
  },
  {
    id: 'aw-016', format: 'aw', topic: 'mixture', diff: 3,
    stem: 'A technician has 50 liters of a 12% sugar solution. How many liters of water must be evaporated so that the remaining solution is 20% sugar?',
    opts: ['8', '10', '20', '24', '30'],
    answer: '20',
    move: 'Evaporation removes water only; hold the sugar fixed and solve for the new total.',
    why: 'Sugar: 12% of 50 = 6 liters, and it stays 6 liters. For 6 liters to be 20% of the solution, the total must be 6 / 0.20 = 30 liters. So 50 - 30 = 20 liters of water must evaporate. 30 is the remaining volume, not the amount removed.',
    diag: { '30': 'That is the volume left after evaporating. The question asks how much water leaves.', '8': 'Subtracting percentages (20 - 12 = 8) does not track the sugar.' },
    check: { num: '50 - 50*12/20' }
  },
  {
    id: 'aw-017', format: 'aw', topic: 'mixture', diff: 3,
    stem: 'A 30-kilogram metal alloy is 20% copper by weight. How many kilograms of pure copper must be melted into it so that the new alloy is 40% copper?',
    opts: ['10', '12', '15', '18', '20'],
    answer: '10',
    move: 'Adding a pure ingredient raises both the part and the whole; set (part + x) / (whole + x) equal to the target.',
    why: 'Copper now: 20% of 30 = 6 kg. Add x kg of copper: (6 + x) / (30 + x) = 0.40. Then 6 + x = 12 + 0.4x, so 0.6x = 6 and x = 10 kg. Check: 16 kg of copper in 40 kg is 40%.',
    diag: { '12': 'Doubling the copper from 6 to 12 does not double the percent, because the total grows to 36 kg.' },
    check: { num: '(0.40*30 - 0.20*30)/(1 - 0.40)' }
  },
  {
    id: 'aw-018', format: 'aw', topic: 'mixture', diff: 4,
    stem: 'A coffee shop blends beans that cost 8 dollars per pound with beans that cost 14 dollars per pound to make 60 pounds of a blend that costs 10 dollars per pound. How many pounds of the 8-dollar beans are in the blend?',
    opts: ['20', '24', '30', '36', '40'],
    answer: '40',
    move: 'Weighted average: the blend sits closer to the ingredient you use more of.',
    why: 'Let x be the pounds of 8-dollar beans; the rest, 60 - x, are 14-dollar beans. Cost: 8x + 14(60 - x) = 10(60). So 840 - 6x = 600, 6x = 240, and x = 40 pounds. Distance check: 10 is 2 above 8 and 4 below 14, so the cheaper beans get twice the weight, 40 to 20.',
    diag: { '20': 'That is the amount of 14-dollar beans. The blend price is closer to 8, so the cheap beans dominate.', '30': 'An even split would cost 11 dollars per pound, not 10.' },
    check: { num: '60*(14 - 10)/(14 - 8)' }
  },
  {
    id: 'aw-019', format: 'aw', topic: 'mixture', diff: 3,
    stem: 'Solution P is 25% alcohol and solution Q is 60% alcohol. In what ratio, by volume, should P and Q be mixed (P to Q) to produce a solution that is 40% alcohol?',
    opts: ['1/2', '3/5', '3/4', '1', '4/3'],
    answer: '4/3',
    move: 'Mixing ratio = (distance of the other ingredient from the target) : (distance of this one).',
    why: 'Let the mix have p liters of P and q liters of Q: 0.25p + 0.60q = 0.40(p + q). So 0.20q = 0.15p, and p / q = 0.20 / 0.15 = 4/3. Shortcut: Q is 20 points from 40 and P is 15 points from 40, so P : Q = 20 : 15 = 4 : 3. More of P is needed because P is closer to the target.',
    diag: { '3/4': 'That is the ratio flipped. The ingredient closer to the target gets the larger share, and P (15 away) is closer than Q (20 away).' },
    check: { num: '(60 - 40)/(40 - 25)' }
  },
  {
    id: 'aw-020', format: 'aw', topic: 'mixture', diff: 4,
    stem: 'A 40-liter tank holds a 30% acid solution. Some of the solution is drained and replaced with the same volume of pure acid, and the result is a 45% acid solution. How many liters were drained, to the nearest tenth?',
    opts: ['8.6', '9.2', '10.0', '12.0', '15.0'],
    answer: '8.6',
    move: 'Drain-and-replace: acid lost is 30% of x, acid gained is 100% of x; the volume stays 40.',
    why: 'Acid at the start: 0.30 × 40 = 12 liters. Draining x liters removes 0.3x liters of acid; adding x liters of pure acid adds x. New acid: 12 + 0.7x, still in 40 liters. Set 12 + 0.7x = 0.45 × 40 = 18, so 0.7x = 6 and x = 60/7, about 8.6 liters. Forgetting that the drained liquid carries acid away gives 12 + x = 18, or x = 6, which is too small.',
    diag: { '10.0': 'Draining removes acid as well as water: each liter drained takes 0.3 liters of acid with it.' },
    check: { num: '(0.45*40 - 0.30*40)/(1 - 0.30)', round: 1 }
  },
  {
    id: 'aw-021', format: 'aw', topic: 'percent', diff: 2,
    stem: 'The price of a textbook rises by 25%. Later the price is cut so that it returns to exactly its original value. By what percent was the higher price cut?',
    opts: ['15%', '20%', '25%', '30%', '33.3%'],
    answer: '20%',
    move: 'Undoing a percent change uses the new price as the base: divide by the multiplier.',
    why: 'Say the price was 100. After a 25% rise it is 125. To get back to 100, cut 25 from 125: 25 / 125 = 20%. The cut is a smaller percent than the rise because it is taken from a larger base.',
    diag: { '25%': 'A 25% cut from 125 would leave 93.75, not 100. The base is now 125.' },
    check: { num: '(1 - 1/1.25)*100' }
  },
  {
    id: 'aw-022', format: 'aw', topic: 'percent', diff: 4,
    stem: 'A town\'s population increased by 20% in one year and then decreased by 15% the following year, ending at 30,600. What was the population at the start of the two years?',
    opts: ['28,800', '30,000', '31,212', '32,000', '36,000'],
    answer: '30,000',
    move: 'Work backward by dividing by the combined multiplier: 1.20 × 0.85 = 1.02.',
    why: 'Two changes multiply: start × 1.20 × 0.85 = start × 1.02. So start = 30,600 / 1.02 = 30,000. Check: 30,000 rises to 36,000, then falls to 30,600. Multiplying by 1.02 instead of dividing gives 31,212.',
    diag: { '31,212': 'You applied the changes forward to the ending number. Divide by 1.02 to go back.', '36,000': 'That is the population after the first year, not the start.' },
    check: { num: '30600/(1.2*0.85)' }
  },
  {
    id: 'aw-023', format: 'aw', topic: 'percent', diff: 3,
    stem: 'In a study, 40% of the mice are placed in group X and the rest in group Y. In group X, 25% of the mice show a response, and in group Y, 50% show a response. What percent of all the mice show a response?',
    opts: ['25%', '30%', '37.5%', '40%', '75%'],
    answer: '40%',
    move: 'Percent of a percent: weight each group\'s rate by the group\'s share.',
    why: 'Responders from X: 25% of 40% = 10% of all mice. Responders from Y: 50% of 60% = 30% of all mice. Total: 10% + 30% = 40%. Averaging 25% and 50% gives 37.5%, which ignores that Y is the bigger group.',
    diag: { '37.5%': 'The groups are not the same size; Y holds 60% of the mice, so its rate counts more.' },
    check: { num: '(0.40*0.25 + 0.60*0.50)*100' }
  },
  {
    id: 'aw-024', format: 'aw', topic: 'percent', diff: 4,
    stem: 'A store marks up the cost of a lamp by 40% to set its list price, then sells it at 15% off the list price. A customer also uses a coupon for 10 dollars off the sale price and pays 109 dollars. What did the lamp cost the store?',
    opts: ['80 dollars', '84 dollars', '91.6 dollars', '95 dollars', '100 dollars'],
    answer: '100 dollars',
    move: 'Undo the steps in reverse order: add back the coupon first, then divide by the percent multipliers.',
    why: 'Before the coupon the sale price was 109 + 10 = 119 dollars. The markup and discount multiply: 1.40 × 0.85 = 1.19. So cost = 119 / 1.19 = 100 dollars. Dividing 109 by 1.19 (forgetting the coupon) gives about 91.6.',
    diag: { '91.6 dollars': 'Add the 10-dollar coupon back first: the sale price was 119.', '84 dollars': 'That treats the changes as +40% - 15% - 10 dollars in the wrong order. Multiply 1.4 × 0.85 = 1.19.' },
    check: { num: '(109 + 10)/(1.4*0.85)' }
  },
  {
    id: 'aw-025', format: 'aw', topic: 'percent', diff: 3,
    stem: 'A student\'s score rose from 72 on the first practice test to 90 on the second. The third score was 10% lower than the second. By what percent is the third score higher than the first?',
    opts: ['12.5%', '15%', '22.5%', '25%', '35%'],
    answer: '12.5%',
    move: 'Get the actual third score first, then compare it to the first score.',
    why: 'Third score: 90 × 0.90 = 81. Change from the first: 81 - 72 = 9. Percent of the first: 9 / 72 = 12.5%. Subtracting percents (+25% then -10%) to get 15% does not work, because the 10% is taken from 90, not 72.',
    diag: { '15%': 'The 25% rise and the 10% drop use different bases; multiply 1.25 × 0.9 = 1.125.', '25%': 'That is the rise from the first test to the second only.' },
    check: { num: '(90*0.9 - 72)/72*100' }
  },
  {
    id: 'aw-026', format: 'aw', topic: 'interest', diff: 3,
    stem: 'A student deposits 5,000 dollars in an account that pays 4% interest per year, compounded annually. If no other deposits or withdrawals are made, how much interest will the account earn in 3 years?',
    opts: ['600 dollars', '624.32 dollars', '630 dollars', '648.92 dollars', '5,624.32 dollars'],
    answer: '624.32 dollars',
    move: 'Compound growth: multiply by (1 + rate) once per year, then subtract the starting amount for interest only.',
    why: 'After 3 years: 5,000 × 1.04³ = 5,000 × 1.124864 = 5,624.32 dollars. Interest earned: 5,624.32 - 5,000 = 624.32 dollars. Simple interest would be 600, and 5,624.32 is the full account value, not the interest.',
    diag: { '600 dollars': 'That is simple interest. Compounding earns interest on earlier interest too.', '5,624.32 dollars': 'That is the account total. Subtract the 5,000 dollar deposit.' },
    check: { num: '5000*(1 + 0.04)^3 - 5000' }
  },
  {
    id: 'aw-027', format: 'aw', topic: 'interest', diff: 3,
    stem: 'A bacterial population grows by 50% every hour. If a sample starts with 800 bacteria, how many bacteria will it contain after 4 hours?',
    opts: ['2,400', '3,200', '3,600', '4,050', '6,075'],
    answer: '4,050',
    move: 'Growth by a fixed percent multiplies each step: 800 × 1.5^4.',
    why: 'Each hour multiplies by 1.5: 800, then 1,200, 1,800, 2,700, and 4,050. Adding 400 each hour (50% of the starting amount) gives the straight-line 2,400, which misses the compounding.',
    diag: { '2,400': 'The 50% is of the current amount, not the original 800, so the hourly increase grows.', '6,075': 'That is 5 hours of growth.' },
    check: { num: '800*1.5^4' }
  },
  {
    id: 'aw-028', format: 'aw', topic: 'interest', diff: 3,
    stem: 'How much more interest does 2,000 dollars earn in 2 years at 10% per year compounded annually than at 10% per year simple interest?',
    opts: ['20 dollars', '22 dollars', '40 dollars', '200 dollars', '420 dollars'],
    answer: '20 dollars',
    move: 'The compound-simple gap in year 2 is the interest on the first year\'s interest.',
    why: 'Simple: 2,000 × 0.10 × 2 = 400 dollars. Compound: 2,000 × 1.1² = 2,420, so 420 dollars of interest. Difference: 20 dollars, which is exactly 10% of the first year\'s 200 dollars of interest.',
    diag: { '420 dollars': 'That is the compound interest itself. Subtract the 400 dollars of simple interest.' },
    check: { num: '(2000*1.1^2 - 2000) - 2000*0.10*2' }
  },
  {
    id: 'aw-029', format: 'aw', topic: 'interest', diff: 4,
    stem: 'The amount of a medication in a patient\'s body decreases by 20% every hour. A patient takes a 250-milligram dose. How many milligrams remain after 3 hours?',
    opts: ['50', '100', '102.4', '120', '128'],
    answer: '128',
    move: 'Decay by a percent keeps (1 - rate) each step: multiply by 0.8 per hour.',
    why: 'Each hour keeps 80%: 250 × 0.8 = 200, then 160, then 128 milligrams. Taking 20% of 250 off three times (60% total) gives 100, which overstates the loss because each later 20% comes from a smaller amount.',
    diag: { '100': 'Each hour removes 20% of what is left, not 20% of the original dose.', '102.4': 'That is after 4 hours.' },
    check: { num: '250*(1 - 0.20)^3' }
  },
  {
    id: 'aw-030', format: 'aw', topic: 'interest', diff: 2,
    stem: 'An account pays 6% simple interest per year on the original deposit. How many years will it take for a deposit of 4,000 dollars to grow to 5,200 dollars?',
    opts: ['2', '3', '4', '5', '30'],
    answer: '5',
    move: 'Simple interest earns the same dollar amount every year: divide the total interest by one year\'s interest.',
    why: 'Interest needed: 5,200 - 4,000 = 1,200 dollars. One year earns 6% of 4,000 = 240 dollars. Years: 1,200 / 240 = 5.',
    diag: { '30': 'That divides 1,200 by 40. One year of interest is 6% of 4,000, which is 240.' },
    check: { num: '(5200 - 4000)/(0.06*4000)' }
  },
  {
    id: 'aw-031', format: 'aw', topic: 'ratios', diff: 3,
    stem: 'Maria is now 3 times as old as her son. In 12 years, she will be twice as old as her son will be then. How old is Maria now?',
    opts: ['36', '39', '42', '45', '48'],
    answer: '36',
    move: 'Ages: write both people now, add the same years to both, then set up the later relationship.',
    why: 'Let the son be s; Maria is 3s. In 12 years: 3s + 12 = 2(s + 12) = 2s + 24, so s = 12 and Maria is 36. Check: in 12 years they are 48 and 24, and 48 is twice 24.',
    diag: { '48': 'That is Maria\'s age in 12 years.' },
    check: { num: '3*(24 - 12)/(3 - 2)' }
  },
  {
    id: 'aw-032', format: 'aw', topic: 'ratios', diff: 3,
    stem: 'In a class, the ratio of boys to girls is 3 : 4. After 6 more boys join the class and no one leaves, the ratio of boys to girls becomes 1 : 1. How many students are in the class now?',
    opts: ['24', '30', '36', '42', '48'],
    answer: '48',
    move: 'Write the ratio with a multiplier (3k and 4k), apply the change, then solve for k.',
    why: 'Boys 3k, girls 4k. After 6 boys join: 3k + 6 = 4k, so k = 6. Originally 18 boys and 24 girls (42 students). Now 24 boys and 24 girls, so 48 students. 42 is the class before the new boys arrived.',
    diag: { '42': 'That is the class before the 6 boys joined. The question asks about now.' },
    check: { num: '7*6/(4 - 3) + 6' }
  },
  {
    id: 'aw-033', format: 'aw', topic: 'ratios', diff: 4,
    stem: 'Three partners share a prize in the ratio 2 : 3 : 5. The partner with the largest share receives 1,200 dollars more than the partner with the smallest share. How much does the middle partner receive?',
    opts: ['600 dollars', '800 dollars', '1,000 dollars', '1,200 dollars', '2,000 dollars'],
    answer: '1,200 dollars',
    move: 'A difference between shares equals the difference in parts: find the value of one part.',
    why: 'The largest and smallest shares differ by 5 - 2 = 3 parts, and that is 1,200 dollars, so one part is 400 dollars. The middle partner has 3 parts: 3 × 400 = 1,200 dollars. The whole prize is 10 parts, or 4,000 dollars.',
    diag: { '800 dollars': 'That is the smallest share (2 parts). The middle partner has 3 parts.', '2,000 dollars': 'That is the largest share (5 parts).' },
    check: { num: '3*1200/(5 - 2)' }
  },
  {
    id: 'aw-034', format: 'aw', topic: 'ratios', diff: 2,
    stem: 'Eight identical pumps working together can drain a pool in 15 hours. At the same rate per pump, how many hours would 12 of these pumps take to drain the pool?',
    opts: ['10', '12', '18', '20', '22.5'],
    answer: '10',
    move: 'More workers, less time: workers × time stays constant (inverse proportion).',
    why: 'The job is 8 × 15 = 120 pump-hours. With 12 pumps: 120 / 12 = 10 hours. Setting up a direct proportion (8 is to 15 as 12 is to x) gives 22.5, which wrongly makes more pumps take longer.',
    diag: { '22.5': 'More pumps finish faster. Pump-hours stay fixed at 120, so divide by 12.' },
    check: { num: '8*15/12' }
  },
  {
    id: 'aw-035', format: 'aw', topic: 'probability', diff: 3,
    stem: 'A committee of 3 students is chosen at random from a group of 5 biology majors and 4 chemistry majors. What is the probability that the committee contains exactly 2 biology majors?',
    opts: ['5/21', '20/63', '10/21', '5/9', '2/3'],
    answer: '10/21',
    move: 'Count favorable groups by choosing from each pool, then divide by all possible groups.',
    why: 'All committees: C(9,3) = 84. Exactly 2 biology and 1 chemistry: C(5,2) × C(4,1) = 10 × 4 = 40. Probability: 40 / 84 = 10/21. Forgetting to choose the chemistry member gives 10/84 = 5/42.',
    diag: { '5/21': 'Choose the chemistry member too: 10 biology pairs times 4 chemistry choices is 40, not 20.' },
    check: { num: 'C(5,2)*C(4,1)/C(9,3)' }
  },
  {
    id: 'aw-036', format: 'aw', topic: 'counting', diff: 3,
    stem: 'A lab access code consists of 2 letters followed by 3 digits. The letters are chosen from the 26 letters of the alphabet and may not repeat, while the digits (0 through 9) may repeat. How many different codes are possible?',
    opts: ['468,000', '585,000', '650,000', '676,000', '1,000,000'],
    answer: '650,000',
    move: 'Fill slots left to right and multiply the choices; a no-repeat slot loses one option.',
    why: 'Letters: 26 choices, then 25 (no repeat). Digits: 10 × 10 × 10 = 1,000. Total: 26 × 25 × 1,000 = 650,000. Letting the letters repeat gives 676,000; forbidding repeated digits gives 26 × 25 × 720 = 468,000.',
    diag: { '676,000': 'The letters may not repeat, so the second letter has 25 choices.', '468,000': 'The digits may repeat, so each digit has 10 choices.' },
    check: { num: 'P(26,2)*10^3' }
  },
  {
    id: 'aw-037', format: 'aw', topic: 'probability', diff: 4,
    stem: 'Three fair six-sided dice are rolled. What is the probability that at least one of the dice shows a 6?',
    opts: ['91/216', '1/2', '125/216', '2/3', '5/6'],
    answer: '91/216',
    move: '"At least one": compute the chance of none, then subtract from 1.',
    why: 'No 6 on one die: 5/6. No 6 on all three: (5/6)³ = 125/216. At least one 6: 1 - 125/216 = 91/216, about 42%. Adding 1/6 three times gives 1/2, which double-counts rolls with two or three 6s.',
    diag: { '1/2': 'Adding 1/6 + 1/6 + 1/6 counts rolls with more than one 6 more than once.', '125/216': 'That is the probability of no 6 at all, the complement.' },
    check: { num: '1 - (5/6)^3' }
  },
  {
    id: 'aw-038', format: 'aw', topic: 'probability', diff: 3,
    stem: 'A bag contains 3 red, 5 green, and 2 blue chips. Two chips are drawn at random without replacement. What is the probability that both chips are the same color?',
    opts: ['1/4', '14/45', '1/3', '19/50', '7/15'],
    answer: '14/45',
    move: 'Without replacement, count same-color pairs with C(n,2) for each color over C(total,2).',
    why: 'All pairs: C(10,2) = 45. Same color: red C(3,2) = 3, green C(5,2) = 10, blue C(2,2) = 1, total 14. Probability: 14/45. Treating the draws as with replacement gives 0.09 + 0.25 + 0.04 = 0.38 = 19/50.',
    diag: { '19/50': 'That treats the draws as independent with replacement. After one chip is drawn, the bag has one fewer of that color.' },
    check: { num: '(C(3,2) + C(5,2) + C(2,2))/C(10,2)' }
  },
  {
    id: 'aw-039', format: 'aw', topic: 'statistics', diff: 3,
    stem: 'The mean of a student\'s 8 quiz scores is 82. When the lowest score is dropped, the mean of the remaining 7 scores is 85. What was the lowest score?',
    opts: ['55', '58', '61', '64', '79'],
    answer: '61',
    move: 'Turn every mean into a total; the removed value is the difference of totals.',
    why: 'Total of 8 scores: 8 × 82 = 656. Total of 7 scores: 7 × 85 = 595. Dropped score: 656 - 595 = 61. A quick subtraction of means (85 - 82 = 3) tells you nothing directly; the totals do.',
    diag: { '79': 'That subtracts the mean change from 82. Work with totals: 656 - 595.' },
    check: { num: '8*82 - 7*85' }
  },
  {
    id: 'aw-040', format: 'aw', topic: 'statistics', diff: 4,
    stem: 'A course grade is weighted 30% homework, 30% midterm, and 40% final exam. A student has a homework average of 90 and a midterm score of 70. What final exam score does the student need to earn an overall grade of exactly 80?',
    opts: ['70', '72', '75', '78', '80'],
    answer: '80',
    move: 'Weighted average: sum of (weight × score) equals the target, then solve for the one unknown.',
    why: 'Points so far: 0.30 × 90 + 0.30 × 70 = 27 + 21 = 48. Needed overall: 80. The final must supply 80 - 48 = 32 weighted points, so 0.40 × final = 32 and the final = 80.',
    diag: { '70': 'That treats the three parts as equally weighted. The final counts 40%.' },
    check: { num: '(80 - 0.30*90 - 0.30*70)/0.40' }
  }
];
