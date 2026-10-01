'use strict';
/* Data interpretation items. Every item carries a `figure` (rendered by
   shared/qr-figures.js) and its key is recomputed from the figure data itself
   with cell()/val()/slice() lookups (scripts/qr-formats/lib/check.js). */
module.exports = [
  {
    id: 'di-001', format: 'di', topic: 'percent', diff: 2,
    figure: { type: 'table', title: 'Students enrolled in a summer science program', columns: ['Year', 'Biology', 'Chemistry', 'Physics'],
      rows: [['2021', 120, 80, 50], ['2022', 150, 90, 60], ['2023', 165, 72, 63]] },
    stem: 'According to the table, by what percent did total enrollment in the program increase from 2021 to 2023?',
    opts: ['10%', '16.7%', '20%', '25%', '37.5%'],
    answer: '20%',
    move: 'Percent change = (new - old) / old. The old value is always the denominator.',
    why: 'Add each row first. 2021: 120 + 80 + 50 = 250. 2023: 165 + 72 + 63 = 300. Change = 300 - 250 = 50. Percent change = 50 / 250 = 0.20 = 20%. The trap is dividing by the newer total: 50 / 300 is about 16.7%.',
    diag: { '16.7%': 'You divided the change by the 2023 total. Percent change always divides by the starting value.', '37.5%': 'That is the Biology change alone (45 / 120). The question asks about total enrollment.' },
    check: { num: '((cell("2023","Biology")+cell("2023","Chemistry")+cell("2023","Physics")) - (cell("2021","Biology")+cell("2021","Chemistry")+cell("2021","Physics"))) / (cell("2021","Biology")+cell("2021","Chemistry")+cell("2021","Physics")) * 100', round: 1 }
  },
  {
    id: 'di-002', format: 'di', topic: 'data', diff: 3,
    figure: { type: 'bar', title: 'Practice questions completed per month', categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      series: [{ name: 'Questions', values: [20, 30, 36, 48, 45, 60] }], yLabel: 'Questions' },
    stem: 'Based on the chart, which month showed the greatest percent increase in questions completed over the previous month?',
    opts: ['Feb', 'Mar', 'Apr', 'May', 'Jun'],
    answer: 'Feb',
    move: 'Biggest jump in raw count is not the biggest percent jump: divide each change by its own starting value.',
    why: 'Compute each change over the month before it. February: (30 - 20) / 20 = 50%. March: (36 - 30) / 30 = 20%. April: (48 - 36) / 36 = 33.3%. May: (45 - 48) / 48 is a decrease. June: (60 - 45) / 45 = 33.3%. February wins at 50%, even though June has the largest raw increase (15). A small starting value makes a small jump a big percent.',
    diag: { Jun: 'June has the largest raw increase (15), but from a base of 45 that is only 33.3%.', Apr: 'April is 12 / 36 = 33.3%, well below February.' },
    check: { pickMax: { Feb: '(val("","Feb")-val("","Jan"))/val("","Jan")', Mar: '(val("","Mar")-val("","Feb"))/val("","Feb")', Apr: '(val("","Apr")-val("","Mar"))/val("","Mar")', May: '(val("","May")-val("","Apr"))/val("","Apr")', Jun: '(val("","Jun")-val("","May"))/val("","May")' } }
  },
  {
    id: 'di-003', format: 'di', topic: 'percent', diff: 2,
    figure: { type: 'pie', title: 'Preferred study method of 400 surveyed students', show: 'value',
      slices: [{ label: 'Flashcards', value: 120 }, { label: 'Practice tests', value: 100 }, { label: 'Videos', value: 80 }, { label: 'Textbook', value: 60 }, { label: 'Group study', value: 40 }] },
    stem: 'According to the chart, what percent of the surveyed students chose neither flashcards nor practice tests?',
    opts: ['35%', '40%', '45%', '55%', '60%'],
    answer: '45%',
    move: '"Neither" means add up everything else, or take the total minus the named groups.',
    why: 'Students who chose neither: 400 - 120 - 100 = 180 (the same as 80 + 60 + 40). As a percent of everyone surveyed: 180 / 400 = 0.45 = 45%. The 55% choice is the share that did pick flashcards or practice tests, the complement of what was asked.',
    diag: { '55%': 'That is the percent who chose flashcards or practice tests. The question asks for neither.' },
    check: { num: '(pietotal() - slice("Flashcards") - slice("Practice tests")) / pietotal() * 100' }
  }
];
