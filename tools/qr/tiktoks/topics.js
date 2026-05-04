/* ============================================================
   TOPICS — config for every QR TikTok rendered by topic-tiktok.html
   Usage: tiktoks/topic-tiktok.html?topic=<key>
   Brand: Sarah · DAT Quantitative Reasoning
   Each topic: tag, title, hookTag, hookWord, hookSub, formula, formulaSub,
               bulletsHead, bullets[], caption, trapH, trapSub, lockWord, lockDecode, speak{}
   ============================================================ */
window.TOPICS = {

  /* ===== TIER 0 — FOUNDATIONS (13) ===== */

  'frac-add': {
    tag:'Tier 0 · Fractions', title:'Adding Fractions',
    hookTag:'Fractions · Common Denominator',
    hookWord:'Same<br/><em>bottoms.</em>',
    hookSub:'Can\'t add until denominators match.',
    formula:'a/b + c/d = <span class="gold">(ad + bc)</span> / <span class="teal">(bd)</span>',
    formulaSub:'Always reduce at the end.',
    bulletsHead:'The 3 steps',
    bullets:[
      'Find the <em>LCD</em> (lowest common multiple)',
      'Convert each fraction by multiplying top + bottom',
      'Add numerators, keep denominator, <span class="gold">reduce</span>'
    ],
    caption:'Match bottoms · add tops · reduce',
    trapH:'<em>Adding</em><br/>denominators.',
    trapSub:'1/2 + 1/3 is NOT 2/5. Always convert to a common denominator first.',
    lockWord:'common bottoms.<br/><em>add the tops.</em>',
    lockDecode:'LCD first. Convert both. Add numerators. Reduce.',
    speak:{ hook:"Adding fractions. Same bottoms. Can't add until denominators match.", formula:"A over B plus C over D equals A D plus B C, all over B D.", trap:"Trap. Adding denominators. One half plus one third is not two fifths.", lock:"Lock it in. Common bottoms. Add the tops. Reduce." }
  },

  'frac-mul': {
    tag:'Tier 0 · Fractions', title:'Multiplying Fractions',
    hookTag:'Fractions · Multiply Across',
    hookWord:'Multiply<br/><em>across.</em>',
    hookSub:'No common denominator needed.',
    formula:'a/b · c/d = <span class="gold">(a·c)</span> / <span class="teal">(b·d)</span>',
    formulaSub:'Division? Flip the second fraction and multiply.',
    bulletsHead:'The shortcuts',
    bullets:[
      'Numerators multiply, denominators multiply',
      'Cancel common factors <em>before</em> multiplying (less reduction later)',
      'Division: <em>a/b ÷ c/d = a/b · d/c</em> (flip and multiply)',
      'Mixed numbers: convert to improper first'
    ],
    caption:'Top × top, bottom × bottom',
    trapH:'<em>Common</em><br/>denominator.',
    trapSub:'You don\'t need one for multiplication. Only addition/subtraction needs matching bottoms.',
    lockWord:'just<br/><em>multiply across.</em>',
    lockDecode:'Cancel common factors first. Multiply tops. Multiply bottoms. Reduce.',
    speak:{ hook:"Multiplying fractions. Multiply across. No common denominator needed.", formula:"A over B times C over D equals A C over B D.", trap:"Trap. Looking for a common denominator. You don't need one for multiplication.", lock:"Lock it in. Just multiply across. Cancel first to save work." }
  },

  'frac-dec': {
    tag:'Tier 0 · Fractions', title:'Fraction to Decimal',
    hookTag:'Fractions · Decimal Strip',
    hookWord:'Memorize<br/><em>the strip.</em>',
    hookSub:'Eighths and fifths come up every test.',
    formula:'<span class="gold">1/8=.125</span> · 1/4=.25 · 3/8=.375 · 1/2=.5 · 5/8=.625 · 3/4=.75 · 7/8=.875',
    formulaSub:'Fifths: 1/5=.2, 2/5=.4, 3/5=.6, 4/5=.8',
    bulletsHead:'The patterns',
    bullets:[
      'Eighths step by <em>0.125</em> each',
      'Fifths step by <em>0.2</em> each',
      'Thirds repeat: <em>1/3 = 0.333…</em>, 2/3 = 0.666…',
      'Long-divide if you don\'t recognize it'
    ],
    caption:'Eighths + fifths cover 80% of the test',
    trapH:'<em>Long-dividing</em><br/>memorized fractions.',
    trapSub:'You waste 30 seconds finding 0.625 by hand. Memorize them — bank the points.',
    lockWord:'know<br/><em>the strip.</em>',
    lockDecode:'Eighths: 0, .125, .25, .375, .5, .625, .75, .875, 1. Done.',
    speak:{ hook:"Fraction to decimal. Memorize the strip. Eighths and fifths come up every test.", formula:"One eighth is point one two five. One quarter is point two five. Three eighths is point three seven five.", trap:"Trap. Long-dividing memorized fractions. Wastes thirty seconds.", lock:"Lock it in. Know the strip. Eighths step by zero point one two five." }
  },

  'dec-arith': {
    tag:'Tier 0 · Decimals', title:'Decimal Arithmetic',
    hookTag:'Decimals · Place Values Stack',
    hookWord:'Line up<br/><em>the dots.</em>',
    hookSub:'Add and subtract place by place.',
    formula:'<span class="gold">+, −</span>: align decimals, pad zeros · <span class="teal">×</span>: count decimal places · <span class="warm">÷</span>: shift both',
    formulaSub:'Multiplication: total decimal places in answer = sum of inputs.',
    bulletsHead:'The four ops',
    bullets:[
      'Add/subtract: <em>line up the decimal point</em>, pad zeros',
      'Multiply: ignore decimals, multiply, then place the decimal',
      'Divide: shift both decimals so divisor is whole',
      'Estimate first to catch order-of-magnitude errors'
    ],
    caption:'Align for + −, count places for × ÷',
    trapH:'<em>Off-by-one</em><br/>decimal place.',
    trapSub:'0.05 × 0.2 = 0.01, not 0.1 or 0.001. Two places times one place is three places.',
    lockWord:'place<br/><em>matters.</em>',
    lockDecode:'+ − align dots. × count places. ÷ shift both. Estimate first.',
    speak:{ hook:"Decimal arithmetic. Line up the dots. Add and subtract place by place.", formula:"Plus minus, align decimals. Times, count decimal places. Divide, shift both.", trap:"Trap. Off by one decimal place. Always estimate first.", lock:"Lock it in. Place matters. Estimate before computing." }
  },

  'pct-of': {
    tag:'Tier 0 · Percent', title:'Percent of a Number',
    hookTag:'Percent · Of Means Times',
    hookWord:'\"of\" =<br/><em>multiply.</em>',
    hookSub:'Convert percent to decimal, then multiply.',
    formula:'p% of N = <span class="gold">(p/100)</span> · N',
    formulaSub:'10% = ÷10. 25% = ÷4. 50% = ÷2. Memorize the shortcuts.',
    bulletsHead:'The shortcuts',
    bullets:[
      '<em>10%</em> of N: drop the decimal one place',
      '<em>5%</em> of N: half of 10%',
      '<em>1%</em> of N: drop two decimal places',
      'Combine: 15% = 10% + 5%. 18% = 20% − 2%.'
    ],
    caption:'Find 10% first, then build from there',
    trapH:'<em>Forgetting</em><br/>to divide by 100.',
    trapSub:'25% of 80 is 20, not 2000. Convert percent to decimal first: 0.25 × 80 = 20.',
    lockWord:'<em>of</em> means<br/>times.',
    lockDecode:'10% of N is N divided by 10. Build all percents from there.',
    speak:{ hook:"Percent of a number. Of means multiply. Convert percent to decimal first.", formula:"P percent of N equals P over one hundred times N.", trap:"Trap. Forgetting to divide by one hundred.", lock:"Lock it in. Of means times. Find ten percent, then build." }
  },

  'pct-chg': {
    sarahFile:'sarah-pretend-100-tiktok.html',
    tag:'Tier 0 · Percent', title:'Percent Change',
    hookTag:'Percent · Increase or Decrease',
    hookWord:'Multiply<br/><em>by 1 ± p.</em>',
    hookSub:'Don\'t add the percent — multiply by a factor.',
    formula:'New = <span class="gold">Old · (1 + p/100)</span> for an increase · <span class="teal">Old · (1 − p/100)</span> for a decrease',
    formulaSub:'Percent change = (New − Old) / Old × 100.',
    bulletsHead:'The plays',
    bullets:[
      '+20% means <em>multiply by 1.20</em>',
      '−35% means <em>multiply by 0.65</em>',
      'Reverse: $96 after −20% means original = 96 / 0.80 = $120',
      'Tax + tip stack: × 1.07 × 1.18 (compound)'
    ],
    caption:'Increase × 1+p · decrease × 1−p',
    trapH:'<em>Adding</em><br/>the percent.',
    trapSub:'$50 + 20% is $60, not $50.20. Always multiply by (1 + p/100).',
    lockWord:'1 ± p<br/><em>is the factor.</em>',
    lockDecode:'+20% = ×1.20. −20% = ×0.80. Reverse: divide by the factor.',
    speak:{ hook:"Percent change. Multiply by one plus or minus P. Don't add the percent.", formula:"New equals old times one plus P over one hundred for an increase.", trap:"Trap. Adding the percent. Fifty plus twenty percent is sixty, not fifty point two zero.", lock:"Lock it in. One plus or minus P is the factor." }
  },

  'pct-seq': {
    tag:'Tier 0 · Percent', title:'Sequential Percent Changes',
    hookTag:'Percent · Multiply Factors',
    hookWord:'Factors<br/><em>multiply.</em>',
    hookSub:'+20% then −20% is NOT zero.',
    formula:'Final = Start · <span class="gold">(1+p₁/100)</span> · <span class="teal">(1+p₂/100)</span>',
    formulaSub:'Each change multiplies what came before.',
    bulletsHead:'The math',
    bullets:[
      '$100 +20% then −20% = 100 · 1.20 · 0.80 = <em>$96</em>',
      'Net is always negative when you go up then down (or vice versa)',
      'Order doesn\'t matter for two factors',
      'Don\'t naively add: +20 then −20 ≠ 0'
    ],
    caption:'+20% × −20% = ×0.96 (4% loss)',
    trapH:'<em>Adding</em><br/>percent changes.',
    trapSub:'Up 20 down 20 is NOT back to start. It\'s a 4% net loss. Multiply factors, never add.',
    lockWord:'multiply<br/><em>factors.</em>',
    lockDecode:'(1+p₁) · (1+p₂) — never (p₁+p₂).',
    speak:{ hook:"Sequential percent changes. Factors multiply. Plus twenty then minus twenty is not zero.", formula:"Final equals start times one plus P one over one hundred, times one plus P two over one hundred.", trap:"Trap. Adding percent changes. Up twenty then down twenty leaves a four percent loss.", lock:"Lock it in. Multiply factors. Never add the percents." }
  },

  'estim': {
    tag:'Tier 0 · Estimation', title:'Estimating to One Digit',
    hookTag:'Estimation · One Digit',
    hookWord:'Round<br/><em>to one digit.</em>',
    hookSub:'Land within an order of magnitude.',
    formula:'4823 × 19 ≈ <span class="gold">5000 · 20</span> = 100,000 (exact: 91,637)',
    formulaSub:'Within ~10% — close enough to pick the right answer.',
    bulletsHead:'The plays',
    bullets:[
      'Round each input to its leading digit',
      'Compute mentally',
      'Use to <em>eliminate</em> wildly off answer choices',
      'When two choices are close, do the exact math'
    ],
    caption:'Round, compute, eliminate',
    trapH:'<em>Computing</em><br/>by hand.',
    trapSub:'You waste 90 seconds on a problem an estimate could solve in 10. Estimate first; compute only when needed.',
    lockWord:'round<br/><em>then check.</em>',
    lockDecode:'Round inputs. Compute. Match to the closest choice. Refine only if two are close.',
    speak:{ hook:"Estimation. Round to one digit. Land within an order of magnitude.", formula:"Forty eight twenty three times nineteen rounds to five thousand times twenty equals one hundred thousand.", trap:"Trap. Computing by hand. Wastes ninety seconds when an estimate would do.", lock:"Lock it in. Round, then check. Eliminate before computing." }
  },

  'mental': {
    tag:'Tier 0 · Mental Math', title:'Mental Math Tricks',
    hookTag:'Mental · Decompose First',
    hookWord:'Break<br/><em>it apart.</em>',
    hookSub:'Hard problems are sums of easy ones.',
    formula:'17 × 8 = <span class="gold">(10 + 7) · 8</span> = 80 + 56 = 136',
    formulaSub:'Distribute, double-halve, or round-and-correct.',
    bulletsHead:'The tricks',
    bullets:[
      '<em>Distribute:</em> 17 · 8 = 10·8 + 7·8',
      '<em>Double + halve:</em> 25 · 16 = 50 · 8 = 100 · 4 = 400',
      '<em>Round + correct:</em> 99 · 7 = 700 − 7 = 693',
      '<em>Factor pair:</em> 24 · 25 = 6 · 100 = 600'
    ],
    caption:'Decompose to easier pieces',
    trapH:'<em>Computing</em><br/>linearly.',
    trapSub:'Carrying digit by digit eats your time. Reshape the problem first.',
    lockWord:'decompose<br/><em>first.</em>',
    lockDecode:'Distribute. Double-halve. Round-correct. Factor-pair. Pick the easiest path.',
    speak:{ hook:"Mental math. Break it apart. Hard problems are sums of easy ones.", formula:"Seventeen times eight equals ten plus seven times eight equals eighty plus fifty six equals one thirty six.", trap:"Trap. Computing linearly. Carrying digits eats your time.", lock:"Lock it in. Decompose first. Distribute, double-halve, round-correct, factor-pair." }
  },

  'lin-eq': {
    tag:'Tier 0 · Algebra', title:'Linear Equations',
    hookTag:'Algebra · Inverse PEMDAS',
    hookWord:'Peel<br/><em>from outside in.</em>',
    hookSub:'Reverse PEMDAS to isolate x.',
    formula:'<span class="gold">2x + 3 = 11</span> · subtract 3 · <span class="teal">2x = 8</span> · divide 2 · <span class="warm">x = 4</span>',
    formulaSub:'Whatever you do to one side, do to the other.',
    bulletsHead:'The order',
    bullets:[
      'Combine like terms first (each side separately)',
      'Move <em>variables</em> to one side, <em>constants</em> to the other',
      'Inverse the surrounding operation last (divide / multiply)',
      'Substitute back to verify'
    ],
    caption:'Combine. Move. Divide. Verify.',
    trapH:'<em>Forgetting</em><br/>to do both sides.',
    trapSub:'Subtract 3 from one side, you must subtract 3 from the other. Equality requires symmetry.',
    lockWord:'both sides<br/><em>always.</em>',
    lockDecode:'Combine like terms. Move x to one side. Constants to the other. Divide.',
    speak:{ hook:"Linear equations. Peel from the outside in. Reverse PEMDAS to isolate X.", formula:"Two X plus three equals eleven. Subtract three. Two X equals eight. Divide by two. X equals four.", trap:"Trap. Forgetting to do both sides. Equality requires symmetry.", lock:"Lock it in. Both sides always. Combine, move, divide, verify." }
  },

  'distrib': {
    tag:'Tier 0 · Algebra', title:'Distributive Property',
    hookTag:'Algebra · One Factor, Every Term',
    hookWord:'Touch<br/><em>every term.</em>',
    hookSub:'a(b + c) = ab + ac. No exceptions.',
    formula:'<span class="gold">3(x + 2)</span> = 3x + 6',
    formulaSub:'And in reverse: factor out the GCF.',
    bulletsHead:'The patterns',
    bullets:[
      '<em>3(x + 2)</em> = 3x + 6 — multiply both terms inside',
      '<em>−(x − 5)</em> = −x + 5 — sign flips both',
      'FOIL: <em>(a+b)(c+d)</em> = ac + ad + bc + bd',
      'Reverse: <em>4x + 12 = 4(x + 3)</em>'
    ],
    caption:'Multiply through every term',
    trapH:'<em>Distributing</em><br/>only the first.',
    trapSub:'3(x + 2) is 3x + 6, not 3x + 2. The 3 hits both terms.',
    lockWord:'every<br/><em>term.</em>',
    lockDecode:'a(b + c) = ab + ac. Sign flip when negative. FOIL for binomials.',
    speak:{ hook:"Distributive property. Touch every term. A times B plus C equals A B plus A C.", formula:"Three times X plus two equals three X plus six.", trap:"Trap. Distributing only the first term. Three times X plus two is three X plus six, not three X plus two.", lock:"Lock it in. Every term. No exceptions." }
  },

  'pemdas': {
    tag:'Tier 0 · Algebra', title:'PEMDAS Order',
    hookTag:'Algebra · Order of Operations',
    hookWord:'Order<br/><em>matters.</em>',
    hookSub:'Parens, Exponents, then × ÷, then + −.',
    formula:'<span class="gold">P</span>arens · <span class="teal">E</span>xponents · <span class="warm">M</span>ult/<span class="warm">D</span>iv (left → right) · <span class="gold">A</span>dd/<span class="gold">S</span>ub (left → right)',
    formulaSub:'Same priority? Go left to right.',
    bulletsHead:'The traps',
    bullets:[
      'M and D are <em>same priority</em> — left to right',
      'A and S are <em>same priority</em> — left to right',
      '<em>2 + 3 · 4</em> = 2 + 12 = 14, not 20',
      '<em>10 − 4 + 2</em> = 8, not 4 (left to right!)'
    ],
    caption:'P, E, then × ÷ (L→R), then + − (L→R)',
    trapH:'<em>Multiply</em><br/>before divide.',
    trapSub:'M and D have equal priority. Go left to right. 8 ÷ 4 · 2 = 4, not 1.',
    lockWord:'left<br/><em>to right.</em>',
    lockDecode:'Same priority? Left to right. Always. P, E, then ×÷, then +−.',
    speak:{ hook:"PEMDAS. Order matters. Parens, exponents, times divide, plus minus.", formula:"Parens, exponents, then multiply divide left to right, then add subtract left to right.", trap:"Trap. Multiplying before dividing. Same priority means left to right.", lock:"Lock it in. Left to right within each priority level." }
  },

  'neg-ineq': {
    tag:'Tier 0 · Algebra', title:'Negative & Inequality',
    hookTag:'Inequalities · Flip on Negative',
    hookWord:'Flip<br/><em>the symbol.</em>',
    hookSub:'When you × or ÷ both sides by a negative.',
    formula:'<span class="gold">−2x &lt; 6</span> · ÷ −1 · <span class="teal">2x &gt; −6</span> · ÷ 2 · <span class="warm">x &gt; −3</span>',
    formulaSub:'Add/subtract never flips. Only × ÷ by negative.',
    bulletsHead:'The rules',
    bullets:[
      'Add/subtract any value: <em>symbol stays</em>',
      'Multiply/divide by <em>positive</em>: symbol stays',
      'Multiply/divide by <em>negative</em>: <span class="warm">flip the symbol</span>',
      'Multiply by zero: undefined (don\'t)'
    ],
    caption:'× ÷ by negative? Flip.',
    trapH:'<em>Forgetting</em><br/>to flip.',
    trapSub:'−2x < 6 divided by −1 is x > −3, not x < −3. Always flip when you negate.',
    lockWord:'negate<br/><em>flip.</em>',
    lockDecode:'+ − never flip. × ÷ by + never flip. × ÷ by − ALWAYS flip.',
    speak:{ hook:"Negative and inequality. Flip the symbol when you multiply or divide both sides by a negative.", formula:"Negative two X is less than six. Divide by negative one and flip. Two X is greater than negative six.", trap:"Trap. Forgetting to flip. The whole problem hinges on this one move.", lock:"Lock it in. Negate, flip. Always." }
  },

  /* ===== TIER 1 — BUILDING BLOCKS (8) ===== */

  'ratios': {
    tag:'Tier 1 · Ratios', title:'Ratios & Proportions',
    hookTag:'Ratios · Scale All Parts',
    hookWord:'Parts<br/><em>scale together.</em>',
    hookSub:'The ratio is the proportion, not the magnitude.',
    formula:'a:b in total T means each part = <span class="gold">a · T/(a+b)</span> and <span class="teal">b · T/(a+b)</span>',
    formulaSub:'Total parts = sum of ratio terms.',
    bulletsHead:'The plays',
    bullets:[
      'Add the parts to get the divisor (3:5 → 8 parts)',
      'Each part = total / sum-of-parts',
      'Multiply by ratio number to get each share',
      'Verify shares add to total'
    ],
    caption:'Sum parts. Divide. Multiply.',
    trapH:'<em>3:5</em><br/>doesn\'t mean 3 + 5 = total.',
    trapSub:'A 3:5 ratio with total 80 means 30:50, not 3:5 of 80. Always divide by sum-of-parts first.',
    lockWord:'sum first.<br/><em>then split.</em>',
    lockDecode:'Sum the ratio. Divide total. Multiply each ratio number.',
    speak:{ hook:"Ratios. Parts scale together. The ratio is the proportion, not the magnitude.", formula:"A to B in total T means each part is A times T over A plus B.", trap:"Trap. Three to five doesn't mean three plus five equals total. Sum the parts first.", lock:"Lock it in. Sum first. Then split." }
  },

  'rate-time': {
    tag:'Tier 1 · Rates', title:'Distance, Rate, Time',
    hookTag:'Rates · d = rt',
    hookWord:'d =<br/><em>r·t.</em>',
    hookSub:'Three variables. Solve for the missing one.',
    formula:'<span class="gold">d = r · t</span> · r = d/t · t = d/r',
    formulaSub:'Two movers? Lines on a d-vs-t graph meet where they meet.',
    bulletsHead:'The setups',
    bullets:[
      'One mover: just plug into d = rt',
      'Two toward each other: rates <em>add</em>',
      'Catch-up: rates <em>subtract</em>',
      'Round trip: total time = each leg\'s time, NOT one leg doubled'
    ],
    caption:'Same direction subtract; opposite add',
    trapH:'<em>Round-trip</em><br/>average speed.',
    trapSub:'60 mph out + 40 mph back is NOT 50 mph average. It\'s 48 mph (harmonic mean).',
    lockWord:'rates add<br/><em>or subtract.</em>',
    lockDecode:'Same direction: subtract rates. Opposite: add rates. d = rt always.',
    speak:{ hook:"Distance, rate, time. D equals R times T. Three variables. Solve for the missing one.", formula:"D equals R T. Two movers toward each other, rates add. Same direction, rates subtract.", trap:"Trap. Round trip average speed. Sixty out and forty back is not fifty.", lock:"Lock it in. Rates add or subtract. D equals R T always." }
  },

  'work-rate': {
    sarahFile:'sarah-work-rate-trap-tiktok.html',
    tag:'Tier 1 · Rates', title:'Work-Rate Problems',
    hookTag:'Work-rate · Rates Add',
    hookWord:'Rates<br/><em>add. Times don\'t.</em>',
    hookSub:'1/T = 1/tA + 1/tB.',
    formula:'<span class="gold">1/T</span> = 1/t<sub>A</sub> + 1/t<sub>B</sub> · <span class="teal">T = t<sub>A</sub>·t<sub>B</sub> / (t<sub>A</sub>+t<sub>B</sub>)</span>',
    formulaSub:'Combined time always faster than either alone.',
    bulletsHead:'The plays',
    bullets:[
      'A: 4 hr · B: 6 hr · together = <em>2.4 hr</em> (not 5)',
      'Always less than the faster worker alone',
      'Three workers: 1/T = 1/tA + 1/tB + 1/tC',
      'One slows the other? Subtract rates'
    ],
    caption:'1/T = 1/tA + 1/tB',
    trapH:'<em>Averaging</em><br/>the times.',
    trapSub:'4 hr + 6 hr together is NOT 5 hr. It\'s 2.4 hr. Add rates, not times.',
    lockWord:'rates<br/><em>add.</em>',
    lockDecode:'1/T = 1/tA + 1/tB. Times never average for work-rate.',
    speak:{ hook:"Work-rate. Rates add. Times don't. One over T equals one over T A plus one over T B.", formula:"One over T equals one over T A plus one over T B. T equals T A times T B over T A plus T B.", trap:"Trap. Averaging the times. Four plus six divided by two is not the answer.", lock:"Lock it in. Rates add. Combined is faster than either." }
  },

  'mixture': {
    tag:'Tier 1 · Mixtures', title:'Mixture Problems',
    hookTag:'Mixtures · Volume-Weighted',
    hookWord:'Volume<br/><em>weighted.</em>',
    hookSub:'The midpoint isn\'t the answer unless volumes are equal.',
    formula:'C<sub>mix</sub> = <span class="gold">(C₁V₁ + C₂V₂)</span> / <span class="teal">(V₁ + V₂)</span>',
    formulaSub:'Solute totals add. Volumes add.',
    bulletsHead:'The plays',
    bullets:[
      'Solute amount = <em>concentration · volume</em>',
      'Total solute / total volume = mixture concentration',
      'Equal volumes: just average the concentrations',
      'Diluting with water: C₂ = 0, only V₂ matters'
    ],
    caption:'Solute adds; volume adds; ratio = mix',
    trapH:'<em>Averaging</em><br/>concentrations.',
    trapSub:'Mixing 100mL of 30% with 50mL of 10% is NOT 20%. It\'s 23.3% — weighted by volume.',
    lockWord:'weight by<br/><em>volume.</em>',
    lockDecode:'Solute = concentration × volume. Add solute amounts. Add volumes. Divide.',
    speak:{ hook:"Mixture problems. Volume weighted. The midpoint isn't the answer unless volumes are equal.", formula:"C mix equals C one V one plus C two V two, all over V one plus V two.", trap:"Trap. Averaging the concentrations. One hundred mL of thirty percent plus fifty mL of ten percent is twenty three point three percent, not twenty.", lock:"Lock it in. Weight by volume. Solute amounts add." }
  },

  'interest': {
    tag:'Tier 1 · Interest', title:'Compound Interest',
    hookTag:'Interest · Exponential Growth',
    hookWord:'It<br/><em>compounds.</em>',
    hookSub:'Doubling time ≈ 70 ÷ r%.',
    formula:'A = P·<span class="gold">(1 + r/n)</span><sup>n·t</sup> · simple: <span class="teal">A = P(1 + r·t)</span>',
    formulaSub:'Continuous: A = P·e^(r·t).',
    bulletsHead:'The plays',
    bullets:[
      '<em>Simple</em>: linear growth (A = P + Prt)',
      '<em>Compound</em>: exponential (factor multiplies each period)',
      'Doubling rule: <em>70 ÷ r%</em> ≈ years to double',
      'More frequent compounding (n bigger) = slightly more growth'
    ],
    caption:'Compound > simple, always',
    trapH:'<em>Multiplying</em><br/>r·t for compound.',
    trapSub:'Compound is NOT P(1 + r·t). It\'s P(1 + r/n)^(nt). The exponent matters.',
    lockWord:'exponent<br/><em>matters.</em>',
    lockDecode:'Simple: P(1 + rt). Compound: P(1 + r/n)^(nt). Continuous: P·e^(rt).',
    speak:{ hook:"Compound interest. It compounds. Doubling time is roughly seventy divided by R percent.", formula:"A equals P times one plus R over N to the N T power.", trap:"Trap. Multiplying R times T for compound. The exponent matters.", lock:"Lock it in. Exponent matters. Compound always beats simple." }
  },

  'coord': {
    tag:'Tier 1 · Coordinates', title:'Coordinate Geometry',
    hookTag:'Coords · Pythagoras on a Grid',
    hookWord:'d = √(<br/><em>Δx² + Δy²</em>)',
    hookSub:'Distance is just the hypotenuse.',
    formula:'d = <span class="gold">√(Δx² + Δy²)</span> · midpoint = <span class="teal">((x₁+x₂)/2, (y₁+y₂)/2)</span>',
    formulaSub:'Slope: m = Δy/Δx.',
    bulletsHead:'The plays',
    bullets:[
      'Distance: <em>Pythagoras on the legs</em>',
      'Midpoint: average each coordinate',
      'Slope: rise over run, sign matters',
      'Look for 3-4-5, 5-12-13 triples to skip the sqrt'
    ],
    caption:'Distance = legs² + legs², take √',
    trapH:'<em>Adding</em><br/>without squaring.',
    trapSub:'Distance is √(Δx² + Δy²), not Δx + Δy. Pythagoras, not arithmetic.',
    lockWord:'pythagoras<br/><em>on a grid.</em>',
    lockDecode:'d = √(Δx² + Δy²). Mid = average. Slope = Δy/Δx. Triples save time.',
    speak:{ hook:"Coordinate geometry. D equals square root of delta X squared plus delta Y squared. Distance is just the hypotenuse.", formula:"D equals square root of delta X squared plus delta Y squared. Midpoint is the average of each coordinate.", trap:"Trap. Adding without squaring. Distance is not delta X plus delta Y.", lock:"Lock it in. Pythagoras on a grid." }
  },

  'units': {
    tag:'Tier 1 · Units', title:'Unit Conversion',
    hookTag:'Units · Multiply by 1',
    hookWord:'Multiply<br/><em>by 1.</em>',
    hookSub:'The conversion factor equals one.',
    formula:'5 km · <span class="gold">(1000 m / 1 km)</span> = 5000 m',
    formulaSub:'Matching units cancel like algebra.',
    bulletsHead:'The plays',
    bullets:[
      'Write the value with its unit',
      'Multiply by a fraction = 1 (e.g., 60 sec/1 min)',
      'Cancel matching units (km cancels km)',
      'Stack multiple conversions in one chain'
    ],
    caption:'Pick the fraction so units cancel',
    trapH:'<em>Wrong</em><br/>direction.',
    trapSub:'Going km to m? Multiply by 1000, not divide. The conversion factor must put the wanted unit on top.',
    lockWord:'cancel<br/><em>units.</em>',
    lockDecode:'Multiply by a fraction equal to 1. Wanted unit on top. Cancel matching units.',
    speak:{ hook:"Unit conversion. Multiply by one. The conversion factor equals one.", formula:"Five km times one thousand m over one km equals five thousand m.", trap:"Trap. Wrong direction. Wanted unit must end up on top.", lock:"Lock it in. Cancel units. Multiply by one." }
  },

  'word-decode': {
    tag:'Tier 1 · Word Problems', title:'Word Problem Translation',
    hookTag:'Word Problems · One Phrase at a Time',
    hookWord:'Translate<br/><em>phrase by phrase.</em>',
    hookSub:'Each English phrase becomes a math symbol.',
    formula:'\"is\" = <span class="gold">=</span> · \"of\" = <span class="teal">·</span> · \"more than X\" = <span class="warm">X + ___</span> · \"less than X\" = <span class="warm">X − ___</span>',
    formulaSub:'\"more/less than X\" reverses order — be careful.',
    bulletsHead:'The dictionary',
    bullets:[
      '\"is/equals\" → <em>=</em>',
      '\"of\" → <em>×</em>',
      '\"more than X\" → <em>X + ___</em> (X first!)',
      '\"twice/half\" → <em>×2 / ÷2</em>'
    ],
    caption:'\"more than X\" puts X first',
    trapH:'<em>Order</em><br/>reversed.',
    trapSub:'\"3 more than 2x\" is 2x + 3, NOT 3 + 2x with the variable. \"More than X\" means X comes first.',
    lockWord:'one phrase<br/><em>at a time.</em>',
    lockDecode:'is = equals. of = times. more than X = X first. less than X = X first.',
    speak:{ hook:"Word problem translation. Translate phrase by phrase. Each English phrase becomes a math symbol.", formula:"Is equals. Of equals times. More than X means X plus blank. Less than X means X minus blank.", trap:"Trap. Order reversed. Three more than two X is two X plus three.", lock:"Lock it in. One phrase at a time." }
  },

  /* ===== TIER 2 — DAT PATTERNS (13) ===== */

  'p-flip': {
    tag:'Tier 2 · Probability', title:'Independent Probability',
    hookTag:'Probability · Multiply Independents',
    hookWord:'Independent?<br/><em>Multiply.</em>',
    hookSub:'P(A and B) = P(A) · P(B). No conditioning.',
    formula:'<span class="gold">P(A ∩ B)</span> = P(A) · P(B) · only when independent',
    formulaSub:'Coin flips, dice rolls — classic independent events.',
    bulletsHead:'The plays',
    bullets:[
      'All heads on N flips: <em>(1/2)^N</em>',
      'Exactly one head on N flips: <em>N · (1/2)^N</em>',
      'At least one: <em>1 − P(none)</em>',
      'Independent means P(B) doesn\'t change knowing A'
    ],
    caption:'Multiply when independent',
    trapH:'<em>Adding</em><br/>independent probabilities.',
    trapSub:'Two heads in a row is (1/2)·(1/2) = 1/4, not 1/2 + 1/2 = 1.',
    lockWord:'independent<br/><em>multiply.</em>',
    lockDecode:'P(A and B) = P(A) · P(B) when independent. \"At least one\" = 1 − P(none).',
    speak:{ hook:"Independent probability. Multiply. P A and B equals P A times P B.", formula:"P A intersect B equals P A times P B when independent.", trap:"Trap. Adding independent probabilities. Two heads in a row is one fourth, not one.", lock:"Lock it in. Independent, multiply. At least one is one minus none." }
  },

  'p-andor': {
    sarahFile:'sarah-dice-pyramid-tiktok.html',
    tag:'Tier 2 · Probability', title:'AND / OR Rules',
    hookTag:'Probability · OR Adds, Overlap Subtracts',
    hookWord:'Or adds.<br/><em>Overlap subtracts.</em>',
    hookSub:'P(A or B) = P(A) + P(B) − P(A and B).',
    formula:'<span class="gold">P(A ∪ B)</span> = P(A) + P(B) − <span class="teal">P(A ∩ B)</span>',
    formulaSub:'Subtract overlap so you don\'t double-count.',
    bulletsHead:'The plays',
    bullets:[
      'OR: <em>add</em> probabilities, <em>subtract</em> overlap',
      'AND (independent): multiply',
      'Mutually exclusive: P(A and B) = 0, so OR = P(A) + P(B)',
      'Complement: P(not A) = 1 − P(A)'
    ],
    caption:'OR: add, subtract overlap',
    trapH:'<em>Forgetting</em><br/>the overlap.',
    trapSub:'P(red OR face card) is NOT 26/52 + 12/52 = 38/52. Subtract the 6 red face cards: 32/52.',
    lockWord:'add minus<br/><em>overlap.</em>',
    lockDecode:'OR = P(A) + P(B) − P(A and B). Mutually exclusive: overlap is 0.',
    speak:{ hook:"AND OR rules. Or adds. Overlap subtracts.", formula:"P A union B equals P A plus P B minus P A intersect B.", trap:"Trap. Forgetting the overlap. Double counts the events that satisfy both.", lock:"Lock it in. Add minus overlap." }
  },

  'p-cond': {
    customFile:'p-cond-bayes-tiktok.html',
    tag:'Tier 2 · Probability', title:'Conditional Probability',
    hookTag:'Probability · Bayes Inverts',
    hookWord:'Bayes<br/><em>inverts.</em>',
    hookSub:'P(A|B) ≠ P(B|A). Sensitivity ≠ disease prob.',
    formula:'<span class="gold">P(A|B)</span> = P(A ∩ B) / <span class="teal">P(B)</span> = P(B|A) · P(A) / P(B)',
    formulaSub:'Disease test: P(D|+) ≠ sensitivity.',
    bulletsHead:'The plays',
    bullets:[
      'P(A|B) reads \"P of A given B\"',
      'It\'s P(A and B) divided by P(B)',
      'Disease ex: prevalence 1%, sens 99%, spec 95% → P(D|+) ≈ 17%',
      'Update probability when you learn new info'
    ],
    caption:'Conditional inverts the focus',
    trapH:'<em>Test positive</em><br/>= disease.',
    trapSub:'A 99% sensitive test on a 1% prevalent disease still has only ~17% positive predictive value.',
    lockWord:'condition<br/><em>changes prob.</em>',
    lockDecode:'P(A|B) = P(A∩B) / P(B). Bayes: P(A|B) = P(B|A)·P(A) / P(B).',
    speak:{ hook:"Conditional probability. Bayes inverts. P A given B is not P B given A.", formula:"P A given B equals P A intersect B over P B. Bayes: equals P B given A times P A over P B.", trap:"Trap. Test positive equals disease. A ninety nine percent sensitive test on a one percent prevalent disease still has only seventeen percent positive predictive value.", lock:"Lock it in. Condition changes the probability." }
  },

  'count-pc': {
    customFile:'count-pc-collapse-tiktok.html',
    sarahFile:'sarah-c-method-tiktok.html',
    tag:'Tier 2 · Counting', title:'Permutations & Combinations',
    hookTag:'Counting · Order Matters or Not',
    hookWord:'Order matters?<br/><em>Permutation.</em>',
    hookSub:'Doesn\'t matter? Combination = nPr ÷ r!.',
    formula:'<span class="gold">nPr</span> = n!/(n−r)! · <span class="teal">nCr</span> = n!/(r!·(n−r)!)',
    formulaSub:'÷ r! removes the orderings inside each group.',
    bulletsHead:'The plays',
    bullets:[
      'Lined up / ranked → <em>permutation</em>',
      'Selected / chosen → <em>combination</em>',
      'nP3 of 5 = 60 · nC3 of 5 = 10',
      'Repetition allowed? n^r (different formula)'
    ],
    caption:'Order matters → P. Order doesn\'t → C.',
    trapH:'<em>Treating</em><br/>P like C.',
    trapSub:'\"How many ways to choose 3 of 5 students for a committee?\" = C(5,3) = 10. Order doesn\'t matter for committees.',
    lockWord:'P or C?<br/><em>ask order.</em>',
    lockDecode:'nPr = n!/(n−r)!. nCr = nPr / r!. Order matters? P. Doesn\'t? C.',
    speak:{ hook:"Permutations and combinations. Order matters means permutation. Doesn't matter means combination.", formula:"N P R equals N factorial over N minus R factorial. N C R equals that over R factorial.", trap:"Trap. Treating P like C. Always ask if order matters.", lock:"Lock it in. P or C? Ask order." }
  },

  'discr': {
    tag:'Tier 2 · Quadratics', title:'The Discriminant',
    hookTag:'Quadratic · Sign of Δ',
    hookWord:'Δ tells<br/><em>you everything.</em>',
    hookSub:'b² − 4ac. Sign = root count.',
    formula:'Δ = <span class="gold">b² − 4ac</span> · &gt; 0: two roots · = 0: one · &lt; 0: none',
    formulaSub:'Roots: x = (−b ± √Δ) / 2a.',
    bulletsHead:'The plays',
    bullets:[
      'Δ &gt; 0: <em>two distinct real roots</em>',
      'Δ = 0: one repeated root (parabola touches axis)',
      'Δ &lt; 0: no real roots (parabola misses axis)',
      'Quadratic formula gives both: x = (−b ± √Δ) / 2a'
    ],
    caption:'Δ sign reveals root count',
    trapH:'<em>Sign error</em><br/>on b² − 4ac.',
    trapSub:'b² is always non-negative. 4ac sign depends on a and c. Watch the negatives.',
    lockWord:'Δ sign<br/><em>= root count.</em>',
    lockDecode:'b² − 4ac. > 0 two. = 0 one. < 0 none. Quadratic: x = (−b ± √Δ)/2a.',
    speak:{ hook:"The discriminant. Delta tells you everything. B squared minus four A C.", formula:"Delta equals B squared minus four A C. Greater than zero, two roots. Equals zero, one. Less than zero, none.", trap:"Trap. Sign error on B squared minus four A C. Watch the negatives.", lock:"Lock it in. Delta sign equals root count." }
  },

  'harm': {
    customFile:'harm-distance-tiktok.html',
    tag:'Tier 2 · Means', title:'Harmonic Mean',
    hookTag:'Means · Equal Distance',
    hookWord:'Equal distance?<br/><em>Harmonic.</em>',
    hookSub:'2ab/(a+b). Always less than arithmetic.',
    formula:'<span class="gold">H = 2ab / (a+b)</span> · arithmetic = (a+b)/2',
    formulaSub:'Use when two rates split equal distance, not equal time.',
    bulletsHead:'The plays',
    bullets:[
      '60 mph there, 40 mph back: <em>H = 48 mph</em>, not 50',
      'Always <em>less</em> than arithmetic mean',
      'For three+ rates: H = n / (1/a + 1/b + 1/c + …)',
      'Equal time → arithmetic. Equal distance → harmonic.'
    ],
    caption:'2ab/(a+b) — never the average',
    trapH:'<em>Averaging</em><br/>the rates.',
    trapSub:'60 + 40 over 2 = 50, but 50 is wrong. Equal-distance trips spend more time at the slower rate.',
    lockWord:'distance ≠<br/><em>arithmetic.</em>',
    lockDecode:'Equal time? Arithmetic. Equal distance? Harmonic = 2ab/(a+b). Always lower.',
    speak:{ hook:"Harmonic mean. Equal distance, harmonic. Two A B over A plus B. Always less than arithmetic.", formula:"H equals two A B over A plus B. Arithmetic is A plus B over two.", trap:"Trap. Averaging the rates. Equal distance trips spend more time at the slower rate.", lock:"Lock it in. Distance is not arithmetic." }
  },

  'zscore': {
    customFile:'zscore-bell-tiktok.html',
    tag:'Tier 2 · Statistics', title:'Z-scores & Normal',
    hookTag:'Stats · Standard Deviations Out',
    hookWord:'z = (x−μ)<br/><em>÷ σ.</em>',
    hookSub:'68 / 95 / 99.7 within ±1, ±2, ±3σ.',
    formula:'<span class="gold">z = (x − μ) / σ</span> · empirical: 68% / 95% / 99.7%',
    formulaSub:'Symmetric about the mean.',
    bulletsHead:'The plays',
    bullets:[
      'z counts <em>how many σ above (or below) the mean</em>',
      'Within ±1σ: <em>68.27%</em>',
      'Within ±2σ: <em>95.45%</em>',
      'Within ±3σ: <em>99.73%</em>'
    ],
    caption:'68 / 95 / 99.7 — memorize',
    trapH:'<em>Sign</em><br/>flipped on z.',
    trapSub:'z = (x − μ) / σ. If x < μ, z is negative. Sign matters for the percentile.',
    lockWord:'standardize<br/><em>then look up.</em>',
    lockDecode:'z = (x − μ)/σ. ±1σ = 68%. ±2σ = 95%. ±3σ = 99.7%.',
    speak:{ hook:"Z scores and normal. Z equals X minus mu over sigma. Sixty eight, ninety five, ninety nine point seven within plus minus one, two, three sigma.", formula:"Z equals X minus mu over sigma.", trap:"Trap. Sign flipped. If X less than mu, Z is negative.", lock:"Lock it in. Standardize then look up." }
  },

  'tri-inv': {
    tag:'Tier 2 · Geometry', title:'Triangle Inequality',
    hookTag:'Geometry · |a−b| < c < a+b',
    hookWord:'Sides<br/><em>bound sides.</em>',
    hookSub:'Each side is between |a−b| and a+b.',
    formula:'<span class="gold">|a − b|</span> &lt; c &lt; <span class="teal">a + b</span>',
    formulaSub:'Violate it and the triangle collapses.',
    bulletsHead:'The plays',
    bullets:[
      'Two sides 5 and 8 → third must be <em>between 3 and 13</em>',
      'Equality (a + b = c) means degenerate (collinear)',
      'Use to check if a triangle is even possible',
      'Larger angles oppose longer sides'
    ],
    caption:'|a−b| < c < a+b',
    trapH:'<em>Equality</em><br/>allowed.',
    trapSub:'a + b > c (strictly), not ≥. Equal means a flat line, not a triangle.',
    lockWord:'strict<br/><em>inequality.</em>',
    lockDecode:'|a − b| < c < a + b. Strict on both sides. Equality = collapsed.',
    speak:{ hook:"Triangle inequality. Sides bound sides. Each side is between absolute value of A minus B and A plus B.", formula:"Absolute value of A minus B is less than C, which is less than A plus B.", trap:"Trap. Equality allowed. A plus B greater than C, not greater equal.", lock:"Lock it in. Strict inequality both sides." }
  },

  'vol-sa': {
    tag:'Tier 2 · Geometry', title:'Volume & Surface Area',
    hookTag:'Geometry · Cube Scales, Square Scales',
    hookWord:'V scales as L³.<br/><em>SA as L².</em>',
    hookSub:'Double the side: V × 8, SA × 4.',
    formula:'Cube: <span class="gold">V = s³</span>, SA = 6s² · Sphere: <span class="teal">V = (4/3)πr³</span>, SA = 4πr²',
    formulaSub:'Cylinder: V = πr²h, SA = 2πr² + 2πrh.',
    bulletsHead:'The shapes',
    bullets:[
      'Cube: V = s³, SA = 6s²',
      'Rect prism: V = lwh, SA = 2(lw + wh + lh)',
      'Cylinder: V = πr²h, SA = 2πr(r + h)',
      'Sphere: V = (4/3)πr³, SA = 4πr²'
    ],
    caption:'V cubes, SA squares',
    trapH:'<em>Confusing</em><br/>V and SA.',
    trapSub:'Volume is amount inside (units³). Surface area is skin (units²). Doubling the side: V × 8, SA × 4.',
    lockWord:'V cubes.<br/><em>SA squares.</em>',
    lockDecode:'Cube: V = s³, SA = 6s². Sphere: V = (4/3)πr³, SA = 4πr². Cylinder: πr²h.',
    speak:{ hook:"Volume and surface area. V scales as L cubed. SA as L squared.", formula:"Cube V equals S cubed. SA equals six S squared. Sphere V equals four thirds pi R cubed.", trap:"Trap. Confusing V and SA. Different units, different scaling.", lock:"Lock it in. V cubes. SA squares." }
  },

  'ds': {
    tag:'Tier 2 · Geometry', title:'Distance & Slope',
    hookTag:'Coords · Slope = Δy/Δx',
    hookWord:'Slope =<br/><em>Δy / Δx.</em>',
    hookSub:'Vertical: undefined. Horizontal: zero.',
    formula:'<span class="gold">m = Δy/Δx</span> · parallel: same m · perpendicular: <span class="teal">m₁·m₂ = −1</span>',
    formulaSub:'Distance: √(Δx² + Δy²).',
    bulletsHead:'The plays',
    bullets:[
      'Positive slope: line goes <em>up</em> left-to-right',
      'Negative slope: line goes <em>down</em>',
      'Vertical line: slope undefined (Δx = 0)',
      'Perpendicular slopes <em>multiply to −1</em>'
    ],
    caption:'Rise over run — sign matters',
    trapH:'<em>Δx/Δy</em><br/>flipped.',
    trapSub:'Slope is Δy over Δx, NOT Δx over Δy. Rise comes first.',
    lockWord:'rise<br/><em>over run.</em>',
    lockDecode:'m = Δy/Δx. Vertical = undefined. Horizontal = zero. Perpendicular: m₁·m₂ = −1.',
    speak:{ hook:"Distance and slope. Slope equals delta Y over delta X. Vertical undefined. Horizontal zero.", formula:"M equals delta Y over delta X. Parallel lines same slope. Perpendicular slopes multiply to negative one.", trap:"Trap. Delta X over delta Y flipped.", lock:"Lock it in. Rise over run." }
  },

  'exps': {
    tag:'Tier 2 · Exponents', title:'Exponent Rules',
    hookTag:'Exponents · Same Base, Add or Subtract',
    hookWord:'Same base?<br/><em>Add or subtract.</em>',
    hookSub:'Multiply: add. Divide: subtract.',
    formula:'<span class="gold">a^m · a^n = a^(m+n)</span> · a^m / a^n = a^(m−n) · <span class="teal">(a^m)^n = a^(mn)</span>',
    formulaSub:'Negative exponent: 1/a^n. Zero exponent: 1.',
    bulletsHead:'The rules',
    bullets:[
      '<em>a^m · a^n = a^(m+n)</em> (multiply, add exponents)',
      '<em>a^m / a^n = a^(m−n)</em> (divide, subtract)',
      '<em>(a^m)^n = a^(m·n)</em> (power of power, multiply)',
      '<em>a^0 = 1, a^(−n) = 1/a^n</em>'
    ],
    caption:'Multiply: add. Divide: subtract. Power: multiply.',
    trapH:'<em>Multiplying</em><br/>exponents on multiply.',
    trapSub:'a² · a³ is a⁵, not a⁶. ADD exponents on multiplication. MULTIPLY exponents only on power-of-power.',
    lockWord:'add<br/><em>on multiply.</em>',
    lockDecode:'Multiply: add exp. Divide: subtract. Power of power: multiply. Negative: reciprocal.',
    speak:{ hook:"Exponent rules. Same base. Multiply: add. Divide: subtract.", formula:"A to the M times A to the N equals A to the M plus N.", trap:"Trap. Multiplying exponents on multiplication. A squared times A cubed is A to the fifth.", lock:"Lock it in. Add on multiply." }
  },

  'absval': {
    sarahFile:'sarah-shield-tornado-tiktok.html',
    tag:'Tier 2 · Algebra', title:'Absolute Value',
    hookTag:'|x| · Distance from Zero',
    hookWord:'|x| =<br/><em>distance from 0.</em>',
    hookSub:'Always non-negative. The V-graph reflects.',
    formula:'<span class="gold">|x| = x if x ≥ 0</span>, <span class="teal">−x if x &lt; 0</span> · |x − a| = N → x = a ± N',
    formulaSub:'Solving |...| = N gives two cases.',
    bulletsHead:'The plays',
    bullets:[
      '|−5| = 5, |0| = 0, |5| = 5',
      '|x − a| = N: x = a + N OR x = a − N',
      '|x| < N: <em>−N < x < N</em>',
      '|x| > N: <em>x < −N OR x > N</em>'
    ],
    caption:'Always two cases when solving',
    trapH:'<em>One</em><br/>solution only.',
    trapSub:'|x − 3| = 5 has TWO answers: x = 8 OR x = −2. Always check both.',
    lockWord:'two<br/><em>cases.</em>',
    lockDecode:'|x| = distance from zero. Solving |...| = N: split into ± cases.',
    speak:{ hook:"Absolute value. Distance from zero. Always non-negative.", formula:"Absolute value of X equals X if X is at least zero. Negative X if X is less than zero.", trap:"Trap. One solution only. Absolute value equations always give two.", lock:"Lock it in. Two cases. Always." }
  },

  'logs': {
    sarahFile:'sarah-baseball-tiktok.html',
    tag:'Tier 2 · Logarithms', title:'Logarithms',
    hookTag:'Logs · Inverse of Exponentials',
    hookWord:'log_b(x) =<br/><em>\"b to what?\"</em>',
    hookSub:'Logs ask for the exponent.',
    formula:'<span class="gold">log_b(x) = y</span> ⟺ b^y = x · log(ab) = log a + log b',
    formulaSub:'log(a/b) = log a − log b. log(a^n) = n·log a.',
    bulletsHead:'The rules',
    bullets:[
      '<em>log(ab) = log a + log b</em> (product becomes sum)',
      '<em>log(a/b) = log a − log b</em> (quotient becomes diff)',
      '<em>log(a^n) = n · log a</em> (power becomes coefficient)',
      'Change of base: log_b(x) = log(x) / log(b)'
    ],
    caption:'Logs convert × to + and powers to ×',
    trapH:'<em>Log of</em><br/>a sum.',
    trapSub:'log(a + b) is NOT log a + log b. The sum rule applies to log of a PRODUCT.',
    lockWord:'logs ask<br/><em>the exponent.</em>',
    lockDecode:'log(ab) = log a + log b. log(a/b) = log a − log b. log(a^n) = n · log a.',
    speak:{ hook:"Logarithms. Log base B of X means B to what power equals X.", formula:"Log base B of X equals Y is the same as B to the Y equals X.", trap:"Trap. Log of a sum. Log of A plus B is not log A plus log B.", lock:"Lock it in. Logs ask the exponent." }
  },

  /* ===== TIER 3 — TEST DAY (3) ===== */

  'untimed': {
    tag:'Tier 3 · Strategy', title:'Untimed Knowledge Gate',
    hookTag:'Strategy · Knowledge First',
    hookWord:'Knowledge<br/><em>before speed.</em>',
    hookSub:'24 / 30 untimed unlocks timed.',
    formula:'80% accuracy untimed = <span class="gold">gate to timed practice</span>',
    formulaSub:'Below 80%? Drill the misses. Don\'t timer-train weakness.',
    bulletsHead:'The plays',
    bullets:[
      'Take 30 problems untimed in a single sitting',
      'Aim for <em>24+ correct (80%)</em>',
      'Below 24? Drill the missed pattern, retake',
      'Above 24? Drop to 90s/Q timed practice'
    ],
    caption:'Knowledge first, speed second',
    trapH:'<em>Timing</em><br/>before knowing.',
    trapSub:'Timer-training a skill you don\'t know just drills bad shortcuts. Reach 80% untimed first.',
    lockWord:'know it<br/><em>then time it.</em>',
    lockDecode:'30 untimed. 24+ correct. Then add the timer. Not before.',
    speak:{ hook:"Untimed knowledge gate. Knowledge before speed. Twenty four out of thirty unlocks timed.", formula:"Eighty percent accuracy untimed is the gate to timed practice.", trap:"Trap. Timing before knowing. Drills bad shortcuts.", lock:"Lock it in. Know it, then time it." }
  },

  'skip-ret': {
    tag:'Tier 3 · Strategy', title:'Skip & Return',
    hookTag:'Strategy · Skip After 90s',
    hookWord:'Skip<br/><em>after 90s.</em>',
    hookSub:'Don\'t let one problem swallow your section.',
    formula:'<span class="gold">90s threshold</span> · pass 1 + pass 2 · time used must stay under <span class="teal">45 min</span>',
    formulaSub:'~67 sec/Q average to finish all 40.',
    bulletsHead:'The plays',
    bullets:[
      'First pass: solve fast, mark hard ones to skip',
      'Skip threshold: <em>~90 sec</em> per problem',
      'Pass 2: drain the skip pile with remaining time',
      'Always answer something — no blanks (no penalty)'
    ],
    caption:'Skip after 90s · two passes · no blanks',
    trapH:'<em>Sunk cost</em><br/>on one problem.',
    trapSub:'A 4-minute problem costs you THREE other problems you could have solved. Skip and return.',
    lockWord:'two passes.<br/><em>no blanks.</em>',
    lockDecode:'Skip if &gt; 90s. Pass 2 drains the skips. Guess everything by time-up.',
    speak:{ hook:"Skip and return. Skip after ninety seconds. Don't let one problem swallow your section.", formula:"Ninety seconds threshold. Pass one and pass two. Time used must stay under forty five minutes.", trap:"Trap. Sunk cost on one problem. A four minute problem costs you three others.", lock:"Lock it in. Two passes. No blanks." }
  },

  'guess': {
    tag:'Tier 3 · Strategy', title:'Educated Guessing',
    hookTag:'Strategy · Eliminate First',
    hookWord:'5 to 2<br/><em>doubles your odds.</em>',
    hookSub:'Eliminate before guessing.',
    formula:'5 choices: <span class="gold">20% random</span> · 2 choices: <span class="teal">50% random</span> · always answer',
    formulaSub:'Use units, magnitude, sign, and trap-pattern heuristics.',
    bulletsHead:'The filters',
    bullets:[
      '<em>Units match</em> the question? Drop wrong-unit choices',
      '<em>Magnitude</em> reasonable? Drop wildly off ones',
      '<em>Sign</em> matches the question? Drop wrong-signed',
      '<em>Suspiciously specific</em>? Probably a trap'
    ],
    caption:'5 → 2 doubles your odds (20% → 50%)',
    trapH:'<em>Skipping</em><br/>elimination.',
    trapSub:'Random guess from 5 = 20%. Eliminate to 2 = 50%. Eliminate to 3 = 33%. Always eliminate first.',
    lockWord:'eliminate<br/><em>then guess.</em>',
    lockDecode:'Units. Magnitude. Sign. Trap pattern. Get to 2 — guess wins half the time.',
    speak:{ hook:"Educated guessing. Five to two doubles your odds. Eliminate before guessing.", formula:"Five choices is twenty percent random. Two choices is fifty percent. Always answer.", trap:"Trap. Skipping elimination. Random guess wastes a doubled odds.", lock:"Lock it in. Eliminate then guess." }
  }

};
