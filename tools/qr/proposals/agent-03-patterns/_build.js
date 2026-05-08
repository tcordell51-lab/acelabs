#!/usr/bin/env node
// Generates 13 standalone pattern-comparator HTML files (mixture is hand-authored).
const fs = require('fs');
const path = require('path');
const OUT = __dirname;

const SHELL = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{TITLE} &middot; Pattern Comparator &middot; AceTheDAT QR</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/animejs@3.2.2/lib/anime.min.js"></script>
<style>
:root{
  --bg:#f5f0e8; --paper:#fffdf7; --paper-2:#f9f3e6; --paper-3:#f3ecdb;
  --sb:#0d2018; --sb-2:#15301f;
  --ink:#0f1814; --ink-2:#3a4a42; --ink-mute:#6e7c74;
  --gold:#C9A84C; --gold-m:#E2C97A; --gold-d:#8C7235; --gold-glow:rgba(201,168,76,0.35);
  --teal:#1B3A2D; --teal-2:#2A5240; --teal-3:#3A6B54;
  --line:rgba(13,32,24,0.12); --line-2:rgba(13,32,24,0.06);
  --trap:#C25B3F; --trap-bg:#fbe7df; --trap-d:#8a3d28;
  --good:#5FA874; --good-bg:#e3efe6; --good-d:#3e7c54;
  --info:#6A8AA8; --info-bg:#e6edf4;
  --shadow:0 1px 3px rgba(13,32,24,0.06), 0 8px 24px rgba(13,32,24,0.04);
  --shadow-md:0 2px 6px rgba(13,32,24,0.08), 0 16px 40px rgba(13,32,24,0.06);
}
*{box-sizing:border-box} html,body{margin:0;padding:0}
body{font-family:'DM Sans',system-ui,sans-serif;background:var(--bg);color:var(--ink);line-height:1.55;-webkit-font-smoothing:antialiased;
  background-image:radial-gradient(1200px 600px at 15% -10%,rgba(201,168,76,0.07),transparent 60%),radial-gradient(900px 500px at 85% 110%,rgba(27,58,45,0.06),transparent 60%);}
.sec{padding:36px 40px;max-width:1080px;margin:0 auto}
.sec-head{display:flex;align-items:flex-end;gap:14px;margin-bottom:20px;padding-bottom:14px;border-bottom:1px solid var(--line)}
.sec-head .num{font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--gold-d);letter-spacing:0.18em}
.sec-head h2{font-family:'Playfair Display',serif;font-size:34px;font-weight:700;line-height:1;margin:6px 0 0;letter-spacing:-0.01em}
.sec-head h2 em{font-style:italic;color:var(--gold-d);font-weight:400}
.sec-head .grow{flex:1}
.sec-head p.s{margin:6px 0 0;color:var(--ink-mute);font-size:14px;max-width:680px}
.tag{display:inline-block;padding:2px 8px;border-radius:6px;font-size:10px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase}
.tag.trap{background:var(--trap-bg);color:var(--trap-d)}
.card{background:var(--paper);border:1px solid var(--line);border-radius:16px;padding:24px 28px;margin-bottom:18px;box-shadow:var(--shadow)}
.card-h{display:flex;gap:14px;align-items:flex-start;margin-bottom:14px}
.card-h .mark{width:42px;height:42px;flex-shrink:0;border-radius:11px;background:linear-gradient(135deg,var(--gold) 0%, var(--gold-d) 100%);display:flex;align-items:center;justify-content:center;color:#fff;font-family:'Playfair Display',serif;font-size:20px;font-weight:700}
.card-h h3{font-family:'Playfair Display',serif;font-size:24px;font-weight:700;line-height:1.15;margin:0 0 4px}
.card-h h3 em{font-style:italic;color:var(--gold-d);font-weight:400}
.card-h .sub{font-size:13px;color:var(--ink-mute)}
.prob{background:var(--paper-2);border-left:4px solid var(--gold);border-radius:0 10px 10px 0;padding:14px 18px;font-size:15.5px;line-height:1.6;margin:8px 0 18px}
.prob .lbl{font-size:10px;letter-spacing:0.18em;text-transform:uppercase;font-weight:700;color:var(--gold-d);margin-bottom:6px}
.compare{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:8px}
@media (max-width:780px){.compare{grid-template-columns:1fr}}
.setup{background:var(--paper);border:2px solid var(--line);border-radius:12px;padding:18px 20px;cursor:pointer;transition:all 0.18s;position:relative;text-align:left;font-family:inherit;color:var(--ink)}
.setup:hover{border-color:var(--gold);transform:translateY(-2px);box-shadow:var(--shadow-md)}
.setup.picked{border-color:var(--gold-d);box-shadow:0 0 0 3px rgba(201,168,76,0.18)}
.setup.reveal-correct{border-color:var(--good);background:var(--good-bg)}
.setup.reveal-wrong{border-color:var(--trap);background:var(--trap-bg)}
.setup.locked{cursor:default;pointer-events:none}
.setup .pill{display:inline-flex;align-items:center;gap:6px;font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.16em;font-weight:700;padding:3px 9px;border-radius:5px;background:var(--paper-2);color:var(--ink-mute);text-transform:uppercase;margin-bottom:10px}
.setup .pill.a{background:var(--info-bg);color:var(--info)}
.setup .pill.b{background:rgba(201,168,76,0.18);color:var(--gold-d)}
.setup h4{font-family:'Playfair Display',serif;font-size:17px;margin:0 0 8px;font-weight:700;line-height:1.3}
.setup .formula{font-family:'JetBrains Mono',monospace;font-size:14px;background:var(--paper-2);border-radius:7px;padding:10px 12px;margin:8px 0;color:var(--ink);line-height:1.7;border:1px solid var(--line)}
.setup.reveal-correct .formula{background:rgba(95,168,116,0.10)}
.setup.reveal-wrong .formula{background:rgba(194,91,63,0.10)}
.setup .formula b.gold{color:var(--gold-d);font-weight:700}
.setup .formula b.trap{color:var(--trap-d);font-weight:700}
.setup .formula b.good{color:var(--good-d);font-weight:700}
.setup .answer{font-family:'JetBrains Mono',monospace;font-size:13px;color:var(--ink-2);margin-top:8px}
.setup .answer b{color:var(--ink);font-weight:700}
.setup .verdict{display:none;margin-top:10px;padding:8px 10px;border-radius:7px;font-size:12.5px;font-weight:600}
.setup.reveal-correct .verdict{display:block;background:var(--good);color:#fff}
.setup.reveal-wrong .verdict{display:block;background:var(--trap);color:#fff}
.expl{display:none;margin-top:18px;padding:18px 20px;border-radius:12px;background:var(--paper-2);border-left:4px solid var(--trap)}
.expl.show{display:block}
.expl .lbl{font-size:10px;letter-spacing:0.18em;font-weight:700;text-transform:uppercase;color:var(--trap-d);margin-bottom:8px}
.expl h5{font-family:'Playfair Display',serif;font-size:18px;margin:0 0 8px;font-weight:700}
.expl p{margin:0 0 8px;font-size:14px;line-height:1.6;color:var(--ink-2)}
.expl .key{padding:10px 12px;background:var(--paper);border-radius:8px;border:1px dashed var(--gold-d);font-size:13.5px;margin-top:10px;line-height:1.55}
.expl .key b{color:var(--gold-d)}
.drill{margin-top:18px}
.drill-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}
.drill-head h4{font-family:'Playfair Display',serif;font-size:18px;margin:0;font-weight:700}
.drill-head .count{font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--ink-mute);letter-spacing:0.12em}
.dq{background:var(--paper);border:1px solid var(--line);border-radius:10px;padding:14px 16px;margin-bottom:10px}
.dq .q{font-size:14.5px;line-height:1.55;margin-bottom:10px}
.dq .opts{display:grid;grid-template-columns:1fr 1fr;gap:8px}
@media (max-width:520px){.dq .opts{grid-template-columns:1fr}}
.dq .opt{padding:9px 11px;border:1px solid var(--line);border-radius:8px;background:var(--paper-2);cursor:pointer;font-family:'JetBrains Mono',monospace;font-size:13px;transition:all 0.12s;text-align:left;color:var(--ink)}
.dq .opt:hover{border-color:var(--gold);transform:translateX(2px)}
.dq .opt.right{border-color:var(--good);background:var(--good-bg);color:var(--good-d);font-weight:600}
.dq .opt.bad{border-color:var(--trap);background:var(--trap-bg);color:var(--trap-d)}
.dq .opt.locked{pointer-events:none}
.dq .why{display:none;margin-top:10px;padding:9px 11px;border-radius:7px;font-size:12.5px;line-height:1.5;background:var(--paper-2);border-left:3px solid var(--gold);color:var(--ink-2)}
.dq .why.show{display:block}
.btn{display:inline-flex;align-items:center;gap:6px;padding:8px 14px;border-radius:8px;border:1px solid var(--line);background:var(--paper);color:var(--ink);font-size:13px;font-weight:500;cursor:pointer;font-family:inherit}
.btn:hover{border-color:var(--gold)}
.btn.ghost{background:transparent}
</style>
</head>
<body>
<section class="sec">
  <div class="sec-head">
    <div class="grow">
      <div class="num">{NUM}</div>
      <h2>{H2}</h2>
      <p class="s">{SUB}</p>
    </div>
    <span class="tag trap">Canonical Trap</span>
  </div>

  <div class="card">
    <div class="card-h">
      <div class="mark">{CARD_MARK}</div>
      <div>
        <h3>{CARD_H3}</h3>
        <div class="sub">{CARD_SUB}</div>
      </div>
    </div>

    <div class="prob">
      <div class="lbl">DAT-style problem</div>
      {PROBLEM}
    </div>

    <div class="compare" id="cmp">
      <button class="setup" data-correct="{SETUP_A_CORRECT}">
        <span class="pill a">Setup A</span>
        <h4>{SETUP_A_TITLE}</h4>
        <div class="formula">{SETUP_A_BODY}</div>
        <div class="answer">Result: <b>{SETUP_A_ANS}</b></div>
        <div class="verdict">{SETUP_A_VERDICT}</div>
      </button>
      <button class="setup" data-correct="{SETUP_B_CORRECT}">
        <span class="pill b">Setup B</span>
        <h4>{SETUP_B_TITLE}</h4>
        <div class="formula">{SETUP_B_BODY}</div>
        <div class="answer">Result: <b>{SETUP_B_ANS}</b></div>
        <div class="verdict">{SETUP_B_VERDICT}</div>
      </button>
    </div>

    <div class="expl" id="expl">
      <div class="lbl">The trap pattern</div>
      <h5>{EXPL_HEAD}</h5>
      {EXPL_BODY}
      <div class="key"><b>Lock-line:</b> {EXPL_KEY}</div>
    </div>

    <div class="drill" id="drill" style="display:none">
      <div class="drill-head">
        <h4>Drill the recognition</h4>
        <span class="count">3 problems &middot; same trap, different numbers</span>
      </div>
      {DRILL_HTML}
    </div>

    <div style="margin-top:14px;display:flex;gap:8px">
      <button class="btn ghost" id="resetBtn" style="display:none">Reset comparator</button>
    </div>
  </div>
</section>

<script>
(function(){
  const cmp = document.getElementById('cmp');
  const expl = document.getElementById('expl');
  const drill = document.getElementById('drill');
  const resetBtn = document.getElementById('resetBtn');
  let answered = false;
  cmp.querySelectorAll('.setup').forEach(btn => {
    btn.addEventListener('click', () => {
      if (answered) return; answered = true;
      cmp.querySelectorAll('.setup').forEach(s => {
        s.classList.add('locked');
        s.classList.add(s.dataset.correct === 'true' ? 'reveal-correct' : 'reveal-wrong');
      });
      btn.classList.add('picked');
      expl.classList.add('show');
      drill.style.display = 'block';
      resetBtn.style.display = 'inline-flex';
      if (window.anime) {
        anime({targets:'#expl', opacity:[0,1], translateY:[8,0], duration:420, easing:'easeOutQuad'});
        anime({targets:'#drill', opacity:[0,1], translateY:[10,0], duration:520, delay:120, easing:'easeOutQuad'});
      }
    });
  });
  document.querySelectorAll('.dq').forEach(dq => {
    const why = dq.querySelector('.why');
    dq.querySelectorAll('.opt').forEach(opt => {
      opt.addEventListener('click', () => {
        if (dq.dataset.done) return; dq.dataset.done = '1';
        dq.querySelectorAll('.opt').forEach(o => {
          o.classList.add('locked');
          if (o.dataset.correct === 'true') o.classList.add('right');
          else if (o === opt) o.classList.add('bad');
        });
        why.classList.add('show');
      });
    });
  });
  resetBtn.addEventListener('click', () => {
    answered = false;
    cmp.querySelectorAll('.setup').forEach(s => s.classList.remove('locked','reveal-correct','reveal-wrong','picked'));
    expl.classList.remove('show');
    drill.style.display = 'none';
    resetBtn.style.display = 'none';
    document.querySelectorAll('.dq').forEach(dq => {
      delete dq.dataset.done;
      dq.querySelector('.why').classList.remove('show');
      dq.querySelectorAll('.opt').forEach(o => o.classList.remove('locked','right','bad'));
    });
  });
})();
</script>
</body>
</html>`;

function dq(q, opts, why){
  return `      <div class="dq">
        <div class="q">${q}</div>
        <div class="opts">
${opts.map(o => `          <button class="opt" data-correct="${o.c?'true':'false'}">${o.t}</button>`).join('\n')}
        </div>
        <div class="why">${why}</div>
      </div>`;
}

const modules = {
  distrib: {
    TITLE: 'Distribution',
    NUM: 'PATTERN PATH &middot; DISTRIB',
    H2: 'Distribution &mdash; <em>every term, every time</em>',
    SUB: 'The trap: distributing the multiplier to only the first term inside the parentheses, or forgetting the sign on the second term when there is a minus out front.',
    CARD_MARK: 'D',
    CARD_H3: 'Pick the <em>setup</em>, not the answer',
    CARD_SUB: 'One option distributes to every term. The other distributes to one and skips the rest.',
    PROBLEM: 'Simplify: <b>3(2x &minus; 5) &minus; 2(x + 4)</b>',
    SETUP_A_TITLE: 'Distribute to the first term only, drop the rest',
    SETUP_A_BODY: '<b class="trap">3&middot;2x</b> &minus; 5 &minus; <b class="trap">2&middot;x</b> + 4 <br>= 6x &minus; 5 &minus; 2x + 4 = <b class="trap">4x &minus; 1</b>',
    SETUP_A_ANS: '4x &minus; 1',
    SETUP_A_CORRECT: false,
    SETUP_A_VERDICT: 'Trap setup &mdash; multiplier skipped the second term',
    SETUP_B_TITLE: 'Distribute to every term, keep the signs',
    SETUP_B_BODY: '<b class="good">3&middot;2x</b> + <b class="good">3&middot;(&minus;5)</b> + <b class="good">(&minus;2)&middot;x</b> + <b class="good">(&minus;2)&middot;4</b><br>= 6x &minus; 15 &minus; 2x &minus; 8 = <b class="good">4x &minus; 23</b>',
    SETUP_B_ANS: '4x &minus; 23',
    SETUP_B_CORRECT: true,
    SETUP_B_VERDICT: 'Correct &mdash; full distribution with signs',
    EXPL_HEAD: 'Distribution is plural. The multiplier hits every term.',
    EXPL_BODY: '<p>The trap setup pretends only the first term inside the parentheses gets multiplied. On the DAT, the answer choices will include the partial-distribution result so it feels right.</p>'+
      '<p>Even worse with a leading minus: <b>&minus;2(x+4)</b> means <b>&minus;2x &minus; 8</b>, not <b>&minus;2x + 4</b>. The minus is part of the multiplier &mdash; it travels with the 2.</p>',
    EXPL_KEY: 'Write the multiplier on the outside, draw arrows to <em>every</em> term, then collect.',
    DRILL: [
      {q:'Simplify <b>4(x &minus; 3) &minus; (2x + 1)</b>', opts:[{t:'2x &minus; 13', c:true},{t:'2x &minus; 11', c:false},{t:'4x &minus; 13', c:false},{t:'2x + 11', c:false}], why:'4x &minus; 12 &minus; 2x &minus; 1 = 2x &minus; 13. The lone minus on the second group flips both terms.'},
      {q:'Expand <b>&minus;3(2y + 5) + 2(y &minus; 1)</b>', opts:[{t:'&minus;4y + 13', c:false},{t:'&minus;4y &minus; 17', c:true},{t:'&minus;6y &minus; 13', c:false},{t:'&minus;4y &minus; 7', c:false}], why:'&minus;6y &minus; 15 + 2y &minus; 2 = &minus;4y &minus; 17. The &minus;3 multiplies both 2y and +5.'},
      {q:'Simplify <b>5 &minus; 2(3x &minus; 4)</b>', opts:[{t:'&minus;6x &minus; 3', c:false},{t:'&minus;6x + 13', c:true},{t:'&minus;6x + 1', c:false},{t:'&minus;6x &minus; 8', c:false}], why:'5 &minus; 6x + 8 = &minus;6x + 13. The &minus;2 turns &minus;4 into +8 because two negatives multiply to a positive.'}
    ]
  },

  pemdas: {
    TITLE: 'PEMDAS',
    NUM: 'PATTERN PATH &middot; PEMDAS',
    H2: 'Order of ops &mdash; <em>left-to-right inside the tier</em>',
    SUB: 'The trap: treating M before D and A before S, instead of left-to-right within each tier. Multiplication and division are equals; addition and subtraction are equals.',
    CARD_MARK: 'O',
    CARD_H3: 'Pick the <em>setup</em>, not the answer',
    CARD_SUB: 'Same expression. One reads left-to-right within tiers. The other forces M before D.',
    PROBLEM: 'Evaluate: <b>24 &divide; 4 &middot; 2 + 3</b>',
    SETUP_A_TITLE: 'Multiplication before division',
    SETUP_A_BODY: '<b class="trap">4 &middot; 2</b> first &rarr; 24 &divide; <b class="trap">8</b> + 3 <br>= 3 + 3 = <b class="trap">6</b>',
    SETUP_A_ANS: '6',
    SETUP_A_CORRECT: false,
    SETUP_A_VERDICT: 'Trap setup &mdash; M and D are tied, go left-to-right',
    SETUP_B_TITLE: 'Left-to-right inside the multiply/divide tier',
    SETUP_B_BODY: '<b class="good">24 &divide; 4</b> first &rarr; <b class="good">6 &middot; 2</b> + 3 <br>= 12 + 3 = <b class="good">15</b>',
    SETUP_B_ANS: '15',
    SETUP_B_CORRECT: true,
    SETUP_B_VERDICT: 'Correct &mdash; left-to-right within the tier',
    EXPL_HEAD: 'PEMDAS is two tiers, not six steps.',
    EXPL_BODY: '<p>The acronym makes M look like it beats D, and A look like it beats S. It does not. Multiplication and division are the same tier &mdash; whichever appears first as you read left-to-right wins. Same for addition and subtraction.</p>'+
      '<p>The DAT loves this trap because the wrong answer (6) sits right next to the right answer (15) in the choices.</p>',
    EXPL_KEY: 'PE &middot; <em>MD</em> &middot; <em>AS</em>. Two letters per tier. Left-to-right inside the tier.',
    DRILL: [
      {q:'Evaluate <b>20 &minus; 6 + 4</b>', opts:[{t:'10 (do addition first)', c:false},{t:'18 (left-to-right)', c:true},{t:'22 (subtract last)', c:false},{t:'14', c:false}], why:'20 &minus; 6 = 14, then 14 + 4 = 18. Subtraction is left-to-right with addition.'},
      {q:'Evaluate <b>36 &divide; 6 &divide; 2</b>', opts:[{t:'12 (group from right)', c:false},{t:'3 (left-to-right)', c:true},{t:'6', c:false},{t:'1', c:false}], why:'36 &divide; 6 = 6, then 6 &divide; 2 = 3. Going right-to-left would give 12 &mdash; the textbook trap.'},
      {q:'Evaluate <b>2 + 3 &middot; 4 &minus; 6 &divide; 2</b>', opts:[{t:'14', c:false},{t:'11', c:true},{t:'7', c:false},{t:'17', c:false}], why:'M and D first (still left-to-right): 12 and 3. Then 2 + 12 &minus; 3 = 11.'}
    ]
  },

  'neg-ineq': {
    TITLE: 'Negative Inequalities',
    NUM: 'PATTERN PATH &middot; NEG-INEQ',
    H2: 'Negatives &amp; inequalities &mdash; <em>flip the sign</em>',
    SUB: 'The trap: dividing or multiplying both sides of an inequality by a negative number and forgetting to flip the inequality direction.',
    CARD_MARK: 'N',
    CARD_H3: 'Pick the <em>setup</em>, not the answer',
    CARD_SUB: 'Same step, different attention to the sign-flip rule.',
    PROBLEM: 'Solve for x: <b>&minus;3x + 7 &gt; 19</b>',
    SETUP_A_TITLE: 'Divide by &minus;3, keep the inequality the same',
    SETUP_A_BODY: '&minus;3x &gt; 12<br>x <b class="trap">&gt;</b> 12 / (&minus;3)<br>x <b class="trap">&gt;</b> &minus;4',
    SETUP_A_ANS: 'x &gt; &minus;4',
    SETUP_A_CORRECT: false,
    SETUP_A_VERDICT: 'Trap setup &mdash; sign was not flipped',
    SETUP_B_TITLE: 'Divide by &minus;3 and flip the inequality',
    SETUP_B_BODY: '&minus;3x &gt; 12<br>x <b class="good">&lt;</b> 12 / (&minus;3)<br>x <b class="good">&lt;</b> &minus;4',
    SETUP_B_ANS: 'x &lt; &minus;4',
    SETUP_B_CORRECT: true,
    SETUP_B_VERDICT: 'Correct &mdash; flipped because we divided by a negative',
    EXPL_HEAD: 'Multiplying or dividing by a negative reverses the order of the number line.',
    EXPL_BODY: '<p>If 6 &gt; 2, then &minus;6 &lt; &minus;2. Negatives invert the order. Inequalities track <em>order</em>, so the symbol must flip when you scale by a negative.</p>'+
      '<p>This rule does <b>not</b> apply to addition and subtraction &mdash; only to multiply and divide by a negative number. The DAT mixes these so students apply the flip at the wrong step.</p>',
    EXPL_KEY: 'Divide by negative &rArr; flip. Subtract a negative &rArr; do <em>not</em> flip.',
    DRILL: [
      {q:'Solve <b>&minus;2x &le; 8</b>', opts:[{t:'x &le; &minus;4', c:false},{t:'x &ge; &minus;4', c:true},{t:'x &le; 4', c:false},{t:'x &ge; 4', c:false}], why:'Divide by &minus;2 and flip &le; to &ge;. x &ge; &minus;4.'},
      {q:'Solve <b>5 &minus; x &gt; 2</b>', opts:[{t:'x &gt; 3', c:false},{t:'x &lt; 3', c:true},{t:'x &gt; &minus;3', c:false},{t:'x &lt; &minus;3', c:false}], why:'&minus;x &gt; &minus;3, then divide by &minus;1 and flip: x &lt; 3.'},
      {q:'Solve <b>&minus;4(x &minus; 1) &ge; 12</b>', opts:[{t:'x &ge; &minus;2', c:false},{t:'x &le; &minus;2', c:true},{t:'x &ge; 4', c:false},{t:'x &le; 4', c:false}], why:'&minus;4x + 4 &ge; 12 &rarr; &minus;4x &ge; 8 &rarr; flip: x &le; &minus;2.'}
    ]
  },

  'work-rate': {
    TITLE: 'Work-Rate',
    NUM: 'PATTERN PATH &middot; WORK-RATE',
    H2: 'Work-rate &mdash; <em>add rates, not times</em>',
    SUB: 'The trap: averaging the two completion times instead of adding the rates. Time is what you get back at the end &mdash; the workers add their work-per-hour, not their hours.',
    CARD_MARK: 'W',
    CARD_H3: 'Pick the <em>setup</em>, not the answer',
    CARD_SUB: 'One averages the times. The other adds the rates and inverts at the end.',
    PROBLEM: 'Pump A fills a tank in <b>4 hours</b>. Pump B fills the same tank in <b>6 hours</b>. Working together, how long do they take?',
    SETUP_A_TITLE: 'Average the times',
    SETUP_A_BODY: 't = (<b class="trap">4 + 6</b>) / 2<br>t = <b class="trap">5 hours</b>',
    SETUP_A_ANS: '5 hours',
    SETUP_A_CORRECT: false,
    SETUP_A_VERDICT: 'Trap &mdash; this is slower than Pump A alone',
    SETUP_B_TITLE: 'Add the rates, then invert',
    SETUP_B_BODY: '1/t = <b class="good">1/4 + 1/6</b><br>1/t = 3/12 + 2/12 = <b class="good">5/12</b><br>t = <b class="good">12/5 = 2.4 h</b>',
    SETUP_B_ANS: '2.4 hours',
    SETUP_B_CORRECT: true,
    SETUP_B_VERDICT: 'Correct &mdash; rates add, time is the inverse',
    EXPL_HEAD: 'Two pumps together must be <em>faster</em> than either alone.',
    EXPL_BODY: '<p>Sanity check: Pump A alone is 4 hours. Adding a second pump should take <b>less</b> than 4 hours, never more. The averaged-time setup gives 5 hours &mdash; impossible.</p>'+
      '<p>Rates are work-per-hour. They add directly because both pumps are pouring at the same time. Then invert: time = 1 / (sum of rates).</p>',
    EXPL_KEY: 't<sub>together</sub> = 1 &divide; (1/t<sub>A</sub> + 1/t<sub>B</sub>). Or shortcut for two: <em>(t<sub>A</sub>&middot;t<sub>B</sub>) / (t<sub>A</sub> + t<sub>B</sub>)</em>.',
    DRILL: [
      {q:'A bakes in 3 h, B bakes in 6 h. Together?', opts:[{t:'4.5 h (average)', c:false},{t:'2 h (rates add: 1/2)', c:true},{t:'9 h (sum)', c:false},{t:'1.5 h', c:false}], why:'1/3 + 1/6 = 1/2, so t = 2 h. The shortcut: (3&middot;6)/(3+6) = 18/9 = 2.'},
      {q:'Hose 1 in 10 min, Hose 2 in 15 min. Together?', opts:[{t:'12.5 min', c:false},{t:'25 min', c:false},{t:'6 min', c:true},{t:'5 min', c:false}], why:'1/10 + 1/15 = 5/30 = 1/6, so t = 6 min.'},
      {q:'Worker A in 8 h, identical worker B. Together?', opts:[{t:'8 h', c:false},{t:'4 h', c:true},{t:'16 h', c:false},{t:'6 h', c:false}], why:'1/8 + 1/8 = 1/4, so 4 h. Two identical workers always halve the time.'}
    ]
  },

  interest: {
    TITLE: 'Compound Interest',
    NUM: 'PATTERN PATH &middot; INTEREST',
    H2: 'Compound interest &mdash; <em>multiply, do not add</em>',
    SUB: 'The trap: computing simple-interest (P&middot;r&middot;t added on) when the problem says <em>compounded</em>. Or compounding the rate but forgetting to subtract the principal at the end if the question asks for interest earned.',
    CARD_MARK: 'I',
    CARD_H3: 'Pick the <em>setup</em>, not the answer',
    CARD_SUB: 'One uses the simple-interest formula. The other compounds correctly.',
    PROBLEM: '$1,000 invested for <b>3 years</b> at <b>10% compounded annually</b>. Final balance?',
    SETUP_A_TITLE: 'Simple interest: P + P&middot;r&middot;t',
    SETUP_A_BODY: 'Final = 1000 + <b class="trap">1000 &middot; 0.10 &middot; 3</b><br>= 1000 + 300 = <b class="trap">$1,300</b>',
    SETUP_A_ANS: '$1,300',
    SETUP_A_CORRECT: false,
    SETUP_A_VERDICT: 'Trap &mdash; this is simple interest, not compound',
    SETUP_B_TITLE: 'Compound: P &middot; (1 + r)<sup>t</sup>',
    SETUP_B_BODY: 'Final = 1000 &middot; <b class="good">1.10<sup>3</sup></b><br>= 1000 &middot; 1.331 = <b class="good">$1,331</b>',
    SETUP_B_ANS: '$1,331',
    SETUP_B_CORRECT: true,
    SETUP_B_VERDICT: 'Correct &mdash; growth on growth',
    EXPL_HEAD: 'Compounding means each year&rsquo;s interest earns interest the next year.',
    EXPL_BODY: '<p>Year 1: 1000 &rarr; 1100. Year 2: 1100 &rarr; 1210 (the extra $10 is interest <em>on</em> the first year&rsquo;s interest). Year 3: 1210 &rarr; 1331.</p>'+
      '<p>Simple interest skips this and just adds 100 per year. The DAT difference between $1,300 and $1,331 looks small for 3 years &mdash; the gap explodes for longer terms, which is why the formula matters.</p>',
    EXPL_KEY: 'Final = P &middot; (1 + r)<sup>t</sup>. Multiply, do not add. Subtract P at the end if asked for <em>interest earned</em>.',
    DRILL: [
      {q:'$500 at 8% compounded annually for 2 years &mdash; final balance?', opts:[{t:'$580 (simple)', c:false},{t:'$583.20 (compound)', c:true},{t:'$540', c:false},{t:'$640', c:false}], why:'500 &middot; 1.08&sup2; = 500 &middot; 1.1664 = $583.20. Year 2 interest is on $540, not $500.'},
      {q:'$2,000 at 5% compounded annually for 3 years. Interest earned?', opts:[{t:'$300 (simple)', c:false},{t:'$315.25 (compound &minus; P)', c:true},{t:'$2,315.25', c:false},{t:'$330', c:false}], why:'2000 &middot; 1.05&sup3; = $2,315.25. Subtract principal: $315.25.'},
      {q:'$1,000 at 20% compounded annually for 2 years &mdash; final?', opts:[{t:'$1,400 (simple)', c:false},{t:'$1,440 (compound)', c:true},{t:'$1,200', c:false},{t:'$1,210', c:false}], why:'1000 &middot; 1.20&sup2; = 1000 &middot; 1.44 = $1,440.'}
    ]
  },

  coord: {
    TITLE: 'Coordinate Geometry',
    NUM: 'PATTERN PATH &middot; COORD',
    H2: 'Coordinate geometry &mdash; <em>perpendicular slopes are negative reciprocals</em>',
    SUB: 'The trap: thinking the negative reciprocal means just adding a minus sign, or computing slope by reversing y and x in the difference (run-over-rise instead of rise-over-run).',
    CARD_MARK: 'C',
    CARD_H3: 'Pick the <em>setup</em>, not the answer',
    CARD_SUB: 'One inverts the slope correctly. The other only flips the sign.',
    PROBLEM: 'Line L has slope <b>2/3</b>. What is the slope of any line perpendicular to L?',
    SETUP_A_TITLE: 'Just flip the sign',
    SETUP_A_BODY: 'm<sub>&perp;</sub> = <b class="trap">&minus;2/3</b>',
    SETUP_A_ANS: '&minus;2/3',
    SETUP_A_CORRECT: false,
    SETUP_A_VERDICT: 'Trap &mdash; that is not a perpendicular line',
    SETUP_B_TITLE: 'Negative reciprocal: flip and negate',
    SETUP_B_BODY: 'm &middot; m<sub>&perp;</sub> = &minus;1<br>m<sub>&perp;</sub> = &minus;1 &divide; (2/3) = <b class="good">&minus;3/2</b>',
    SETUP_B_ANS: '&minus;3/2',
    SETUP_B_CORRECT: true,
    SETUP_B_VERDICT: 'Correct &mdash; reciprocal then negative',
    EXPL_HEAD: 'Perpendicular slopes multiply to &minus;1.',
    EXPL_BODY: '<p>If you only flip the sign of 2/3 to &minus;2/3, the two lines are not perpendicular &mdash; they cross at an angle, but not 90&deg;. Check: (2/3)(&minus;2/3) = &minus;4/9, not &minus;1.</p>'+
      '<p>The product rule is the safe one: m&middot;m<sub>&perp;</sub> = &minus;1. So m<sub>&perp;</sub> = &minus;1/m. For m = 2/3, that is &minus;3/2. For m = &minus;5, that is 1/5.</p>',
    EXPL_KEY: 'Perpendicular slope = <em>negative reciprocal</em>. Flip the fraction <em>and</em> swap the sign.',
    DRILL: [
      {q:'A line has slope &minus;1/4. Slope of perpendicular line?', opts:[{t:'1/4', c:false},{t:'4', c:true},{t:'&minus;4', c:false},{t:'&minus;1/4', c:false}], why:'Negative reciprocal of &minus;1/4 is +4. Check: (&minus;1/4)(4) = &minus;1.'},
      {q:'A line passes through (1,2) and (5,10). Slope of perpendicular?', opts:[{t:'2', c:false},{t:'&minus;2', c:false},{t:'1/2', c:false},{t:'&minus;1/2', c:true}], why:'Slope = (10&minus;2)/(5&minus;1) = 2. Negative reciprocal: &minus;1/2.'},
      {q:'A line has slope 0 (horizontal). Perpendicular slope?', opts:[{t:'0', c:false},{t:'1', c:false},{t:'undefined (vertical)', c:true},{t:'&minus;1', c:false}], why:'Horizontal and vertical are perpendicular. Reciprocal of 0 is undefined &mdash; that is the vertical line.'}
    ]
  },

  units: {
    TITLE: 'Unit Conversion',
    NUM: 'PATTERN PATH &middot; UNITS',
    H2: 'Units &mdash; <em>cancel them like variables</em>',
    SUB: 'The trap: dividing when you should multiply (or vice versa) because the conversion factor is upside-down. Always set up so the unit you are leaving is on the bottom of the conversion fraction.',
    CARD_MARK: 'U',
    CARD_H3: 'Pick the <em>setup</em>, not the answer',
    CARD_SUB: 'One sets up so units cancel. The other multiplies the wrong direction.',
    PROBLEM: 'Convert <b>540 inches</b> to feet. (12 inches = 1 foot)',
    SETUP_A_TITLE: 'Multiply by 12',
    SETUP_A_BODY: '540 in &middot; <b class="trap">(12 in / 1 ft)</b><br>= <b class="trap">6,480</b> in&sup2;/ft &mdash; units do not cancel',
    SETUP_A_ANS: '6,480 (wrong units)',
    SETUP_A_CORRECT: false,
    SETUP_A_VERDICT: 'Trap &mdash; units multiply instead of cancel',
    SETUP_B_TITLE: 'Multiply by the fraction that cancels inches',
    SETUP_B_BODY: '540 in &middot; <b class="good">(1 ft / 12 in)</b><br>= 540 / 12 = <b class="good">45 ft</b>',
    SETUP_B_ANS: '45 ft',
    SETUP_B_CORRECT: true,
    SETUP_B_VERDICT: 'Correct &mdash; inches cancel diagonally',
    EXPL_HEAD: 'Treat units as variables. They have to cancel.',
    EXPL_BODY: '<p>Write the starting quantity (540 in) and the conversion as a fraction. The unit you want to <em>get rid of</em> goes on the <em>bottom</em> of the fraction so it cancels diagonally with the unit on top of the starting quantity.</p>'+
      '<p>If your final units do not simplify to what was asked, the conversion fraction is upside-down. Flip it.</p>',
    EXPL_KEY: 'Stack units. Cancel diagonally. The unit you are <em>leaving</em> goes on the bottom.',
    DRILL: [
      {q:'Convert 5,000 mL to L. (1 L = 1,000 mL)', opts:[{t:'5 L', c:true},{t:'5,000,000 L', c:false},{t:'0.005 L', c:false},{t:'500 L', c:false}], why:'5,000 mL &middot; (1 L / 1,000 mL) = 5 L. mL cancels, L stays.'},
      {q:'Convert 90 km/h to m/s. (1 km = 1,000 m, 1 h = 3,600 s)', opts:[{t:'25 m/s', c:true},{t:'2,500 m/s', c:false},{t:'0.025 m/s', c:false},{t:'324,000 m/s', c:false}], why:'90 &middot; 1000 / 3600 = 25. Multiply by 1000 m/km, divide by 3600 s/h.'},
      {q:'Convert 4 ft&sup2; to in&sup2;. (12 in = 1 ft)', opts:[{t:'48 in&sup2;', c:false},{t:'576 in&sup2;', c:true},{t:'144 in&sup2;', c:false},{t:'288 in&sup2;', c:false}], why:'Square the conversion: (12 in / 1 ft)&sup2; = 144 in&sup2;/ft&sup2;. 4 &middot; 144 = 576.'}
    ]
  },

  'p-flip': {
    TITLE: 'At-Least-One Flip',
    NUM: 'PATTERN PATH &middot; P-FLIP',
    H2: 'At-least-one &mdash; <em>flip to the complement</em>',
    SUB: 'The trap: computing P(at least one success) by adding individual probabilities. The right move is 1 &minus; P(none).',
    CARD_MARK: 'F',
    CARD_H3: 'Pick the <em>setup</em>, not the answer',
    CARD_SUB: 'One adds the success probabilities. The other flips to the complement.',
    PROBLEM: 'A coin is flipped <b>3 times</b>. What is the probability of getting <b>at least one head</b>?',
    SETUP_A_TITLE: 'Add P(head) for each flip',
    SETUP_A_BODY: 'P(at least 1 H) = <b class="trap">1/2 + 1/2 + 1/2</b><br>= <b class="trap">3/2</b>',
    SETUP_A_ANS: '3/2 (impossible)',
    SETUP_A_CORRECT: false,
    SETUP_A_VERDICT: 'Trap &mdash; probabilities cannot exceed 1',
    SETUP_B_TITLE: '1 &minus; P(none)',
    SETUP_B_BODY: 'P(no heads) = <b class="good">(1/2)<sup>3</sup></b> = 1/8<br>P(at least 1 H) = <b class="good">1 &minus; 1/8 = 7/8</b>',
    SETUP_B_ANS: '7/8',
    SETUP_B_CORRECT: true,
    SETUP_B_VERDICT: 'Correct &mdash; complement is one chunk, not many',
    EXPL_HEAD: 'At-least-one is the complement of zero.',
    EXPL_BODY: '<p>Adding 1/2 three times double-counts every case where two heads happen. The complement-flip avoids that overlap entirely. P(none) is one clean number, and 1 &minus; that is the answer.</p>'+
      '<p>Sanity check: any time the answer to a probability problem is greater than 1, you set up wrong. Stop and flip.</p>',
    EXPL_KEY: 'P(at least one) = 1 &minus; P(none). The opposite of <em>zero</em> wins is <em>any</em>.',
    DRILL: [
      {q:'Roll a die 2 times. P(at least one 6)?', opts:[{t:'1/3 (1/6 + 1/6)', c:false},{t:'11/36 (1 &minus; 25/36)', c:true},{t:'1/36', c:false},{t:'2/6', c:false}], why:'P(no 6 in two rolls) = (5/6)&sup2; = 25/36. Complement: 11/36.'},
      {q:'4 free throws at 70%. P(at least one miss)?', opts:[{t:'0.4 (4 &middot; 0.1)', c:false},{t:'0.7599 (1 &minus; 0.7^4)', c:true},{t:'0.3', c:false},{t:'1.2', c:false}], why:'P(all 4 made) = 0.7^4 &asymp; 0.2401. Complement: &asymp; 0.7599.'},
      {q:'5 cards drawn with replacement. P(at least one ace)?', opts:[{t:'5/52', c:false},{t:'1 &minus; (48/52)<sup>5</sup>', c:true},{t:'5 &middot; 1/13', c:false},{t:'1/13<sup>5</sup>', c:false}], why:'P(no ace per draw) = 12/13. Complement of (12/13)<sup>5</sup>.'}
    ]
  },

  'p-andor': {
    TITLE: 'AND vs OR',
    NUM: 'PATTERN PATH &middot; P-ANDOR',
    H2: 'AND vs OR &mdash; <em>multiply for AND, add for OR</em>',
    SUB: 'The trap: flipping the operations. Students use + for AND (intersection) and &middot; for OR (union). Independent AND multiplies; mutually-exclusive OR adds.',
    CARD_MARK: 'A',
    CARD_H3: 'Pick the <em>setup</em>, not the answer',
    CARD_SUB: 'One uses + for AND. The other multiplies for AND.',
    PROBLEM: 'Roll a fair die. P(rolling an <b>even number AND a number greater than 4</b>)?',
    SETUP_A_TITLE: 'Add the probabilities',
    SETUP_A_BODY: 'P(even) = 3/6, P(&gt;4) = 2/6<br>P(even AND &gt;4) = <b class="trap">3/6 + 2/6 = 5/6</b>',
    SETUP_A_ANS: '5/6',
    SETUP_A_CORRECT: false,
    SETUP_A_VERDICT: 'Trap &mdash; AND uses multiplication, not addition',
    SETUP_B_TITLE: 'Count the overlap directly',
    SETUP_B_BODY: 'Even AND &gt;4 &rarr; just <b class="good">{6}</b><br>P = <b class="good">1/6</b>',
    SETUP_B_ANS: '1/6',
    SETUP_B_CORRECT: true,
    SETUP_B_VERDICT: 'Correct &mdash; AND is intersection',
    EXPL_HEAD: 'AND narrows. OR widens. The operations match.',
    EXPL_BODY: '<p>AND means <em>both must happen</em> &mdash; that is a smaller set, so the math is multiplicative (or count the overlap). OR means <em>either one</em> &mdash; that is a bigger set, so we add (subtracting any double-counted overlap).</p>'+
      '<p>Memory hook: multiplying makes things smaller; adding makes them bigger. AND wants smaller; OR wants bigger.</p>',
    EXPL_KEY: 'AND = multiply (independent) or count overlap. OR = add (subtract overlap if not exclusive).',
    DRILL: [
      {q:'Two coins flipped. P(both heads)?', opts:[{t:'1 (1/2 + 1/2)', c:false},{t:'1/4 (1/2 &middot; 1/2)', c:true},{t:'1/2', c:false},{t:'3/4', c:false}], why:'AND of two independent events: multiply. (1/2)(1/2) = 1/4.'},
      {q:'Draw a card. P(heart OR queen)?', opts:[{t:'17/52 (13 + 4)', c:false},{t:'16/52 (13 + 4 &minus; 1)', c:true},{t:'13/52 &middot; 4/52', c:false},{t:'4/52', c:false}], why:'OR adds, but the queen of hearts is in both groups, so subtract once. 13 + 4 &minus; 1 = 16.'},
      {q:'Roll two dice. P(first is 6 AND second is even)?', opts:[{t:'2/3 (1/6 + 1/2)', c:false},{t:'1/12 (1/6 &middot; 1/2)', c:true},{t:'1/4', c:false},{t:'4/12', c:false}], why:'Independent AND: multiply. 1/6 &middot; 1/2 = 1/12.'}
    ]
  },

  'p-cond': {
    TITLE: 'Conditional Probability',
    NUM: 'PATTERN PATH &middot; P-COND',
    H2: 'Conditional &mdash; <em>shrink the denominator</em>',
    SUB: 'The trap: using the original total when the problem says <em>given</em>. The condition cuts the sample space; the new denominator is only the conditioning event.',
    CARD_MARK: 'C',
    CARD_H3: 'Pick the <em>setup</em>, not the answer',
    CARD_SUB: 'One keeps the full denominator. The other shrinks to the condition.',
    PROBLEM: 'A class of <b>30 students</b> has <b>18 girls</b>. <b>12 students</b> wear glasses, of whom <b>8 are girls</b>. <b>Given that a student is a girl</b>, what is the probability she wears glasses?',
    SETUP_A_TITLE: 'Use the full class as the denominator',
    SETUP_A_BODY: 'P = <b class="trap">8 / 30</b><br>= <b class="trap">4/15 &asymp; 0.267</b>',
    SETUP_A_ANS: '4/15',
    SETUP_A_CORRECT: false,
    SETUP_A_VERDICT: 'Trap &mdash; that is the unconditional probability',
    SETUP_B_TITLE: 'Restrict to girls only',
    SETUP_B_BODY: 'Given girl, denominator = <b class="good">18</b><br>P = <b class="good">8 / 18 = 4/9 &asymp; 0.444</b>',
    SETUP_B_ANS: '4/9',
    SETUP_B_CORRECT: true,
    SETUP_B_VERDICT: 'Correct &mdash; denominator is the condition',
    EXPL_HEAD: '"Given" is a sample-space cut.',
    EXPL_BODY: '<p>The word <em>given</em> tells you to throw out everyone who does not satisfy the condition before computing. Now we are only looking at the 18 girls &mdash; the boys are gone.</p>'+
      '<p>Formal version: P(A | B) = P(A &cap; B) / P(B). The denominator is P(B), not P(everything).</p>',
    EXPL_KEY: 'P(A | B) = P(A and B) / P(B). The given event becomes the new total.',
    DRILL: [
      {q:'Of 50 cars, 20 are red, 30 blue. Of red cars, 15 are convertibles. P(convertible | red)?', opts:[{t:'15/50', c:false},{t:'15/20', c:true},{t:'15/30', c:false},{t:'20/50', c:false}], why:'Given red, denominator is 20.'},
      {q:'Two dice rolled. P(sum is 8 | first die is 5)?', opts:[{t:'5/36', c:false},{t:'1/6', c:true},{t:'1/36', c:false},{t:'5/6', c:false}], why:'Given first = 5, second must be 3. 1 of 6 outcomes for the second die.'},
      {q:'Deck of 52. P(king | face card)?', opts:[{t:'4/52', c:false},{t:'12/52', c:false},{t:'4/12', c:true},{t:'1/13', c:false}], why:'Given face card, denominator is 12. 4/12 = 1/3.'}
    ]
  },

  'count-pc': {
    TITLE: 'Permutations vs Combinations',
    NUM: 'PATTERN PATH &middot; COUNT-PC',
    H2: 'Permutations vs combinations &mdash; <em>does order matter?</em>',
    SUB: 'The trap: using P(n,k) when the problem only asks who is selected (order irrelevant), or using C(n,k) when arrangement matters (podium, lineup, password).',
    CARD_MARK: 'P',
    CARD_H3: 'Pick the <em>setup</em>, not the answer',
    CARD_SUB: 'Same problem, two formulas. One counts orderings, the other counts groups.',
    PROBLEM: 'From a club of <b>10 people</b>, a <b>president</b>, <b>vice-president</b>, and <b>treasurer</b> are chosen. How many ways?',
    SETUP_A_TITLE: 'Combination C(10,3)',
    SETUP_A_BODY: 'C(10,3) = 10! / (3! &middot; 7!)<br>= <b class="trap">120</b>',
    SETUP_A_ANS: '120',
    SETUP_A_CORRECT: false,
    SETUP_A_VERDICT: 'Trap &mdash; the three roles are distinct, so order matters',
    SETUP_B_TITLE: 'Permutation P(10,3) (order matters)',
    SETUP_B_BODY: 'P(10,3) = 10 &middot; 9 &middot; 8<br>= <b class="good">720</b>',
    SETUP_B_ANS: '720',
    SETUP_B_CORRECT: true,
    SETUP_B_VERDICT: 'Correct &mdash; distinct roles = arrangement',
    EXPL_HEAD: 'Distinct labels mean order matters.',
    EXPL_BODY: '<p>If the question said "choose a 3-person committee" with no titles, that is a combination &mdash; {Alice, Bob, Carol} is the same group regardless of order. Once the slots have <em>names</em> (president vs treasurer), the same three people fill 6 different officer arrangements.</p>'+
      '<p>P(n,k) = n!/(n&minus;k)! is C(n,k) multiplied by k! &mdash; exactly the orderings within each group.</p>',
    EXPL_KEY: 'Order matters &rArr; permutation. Group only &rArr; combination. P = C &middot; k!',
    DRILL: [
      {q:'How many 3-person committees from 8 people?', opts:[{t:'P(8,3) = 336', c:false},{t:'C(8,3) = 56', c:true},{t:'8&sup3; = 512', c:false},{t:'8! = 40,320', c:false}], why:'Committee = unordered. C(8,3) = 56.'},
      {q:'How many 4-letter passwords using A-Z (no repeats)?', opts:[{t:'C(26,4) = 14,950', c:false},{t:'P(26,4) = 358,800', c:true},{t:'4! = 24', c:false},{t:'26<sup>4</sup>', c:false}], why:'Password order matters. P(26,4) = 26&middot;25&middot;24&middot;23 = 358,800.'},
      {q:'A line of 5 distinct books &mdash; arrangements?', opts:[{t:'C(5,5) = 1', c:false},{t:'5&sup2; = 25', c:false},{t:'5! = 120', c:true},{t:'P(5,1) = 5', c:false}], why:'Arranging all 5 in a line: 5! = 120.'}
    ]
  },

  discr: {
    TITLE: 'Discriminant',
    NUM: 'PATTERN PATH &middot; DISCR',
    H2: 'Discriminant &mdash; <em>sign over count</em>',
    SUB: 'The trap: solving the whole quadratic when the question only wants the <em>number</em> of real roots. Check b&sup2; &minus; 4ac. The sign tells you the count.',
    CARD_MARK: 'D',
    CARD_H3: 'Pick the <em>setup</em>, not the answer',
    CARD_SUB: 'One runs the full quadratic formula. The other inspects the sign of b&sup2; &minus; 4ac.',
    PROBLEM: 'How many <b>real solutions</b> does <b>2x&sup2; &minus; 4x + 5 = 0</b> have?',
    SETUP_A_TITLE: 'Run the full quadratic formula',
    SETUP_A_BODY: 'x = (4 &plusmn; &radic;(16 &minus; 40)) / 4<br>= (4 &plusmn; &radic;(<b class="trap">&minus;24</b>)) / 4<br>two complex values <b class="trap">computed in full</b>',
    SETUP_A_ANS: '"two solutions" (wasted time)',
    SETUP_A_CORRECT: false,
    SETUP_A_VERDICT: 'Trap &mdash; you do not need x, just the count',
    SETUP_B_TITLE: 'Inspect b&sup2; &minus; 4ac only',
    SETUP_B_BODY: '&Delta; = (&minus;4)&sup2; &minus; 4(2)(5)<br>= 16 &minus; 40 = <b class="good">&minus;24</b><br>&Delta; &lt; 0 &rarr; <b class="good">0 real roots</b>',
    SETUP_B_ANS: '0 real solutions',
    SETUP_B_CORRECT: true,
    SETUP_B_VERDICT: 'Correct &mdash; sign of &Delta; gives the count',
    EXPL_HEAD: 'The discriminant&rsquo;s <em>sign</em> answers count questions.',
    EXPL_BODY: '<p>&Delta; &gt; 0: two distinct real roots. &Delta; = 0: one (repeated) real root. &Delta; &lt; 0: no real roots (two complex). That is it &mdash; you do not need to compute square roots, fractions, or signs of x.</p>'+
      '<p>If the DAT only asks "how many," "does the parabola cross the x-axis," or "is it tangent," that is a discriminant problem in disguise.</p>',
    EXPL_KEY: '&Delta; = b&sup2; &minus; 4ac. Sign &gt; 0, = 0, &lt; 0 &rarr; 2, 1, 0 real roots.',
    DRILL: [
      {q:'Real roots of <b>x&sup2; &minus; 6x + 9 = 0</b>?', opts:[{t:'2 distinct', c:false},{t:'1 (repeated)', c:true},{t:'0', c:false},{t:'cannot tell', c:false}], why:'&Delta; = 36 &minus; 36 = 0. One repeated real root.'},
      {q:'How many real roots does <b>3x&sup2; + 2x &minus; 1 = 0</b> have?', opts:[{t:'0', c:false},{t:'1', c:false},{t:'2', c:true},{t:'depends on x', c:false}], why:'&Delta; = 4 &minus; 4(3)(&minus;1) = 4 + 12 = 16 &gt; 0. Two distinct real roots.'},
      {q:'For <b>x&sup2; + kx + 9 = 0</b>, what k makes one repeated root?', opts:[{t:'k = 0', c:false},{t:'k = &plusmn;3', c:false},{t:'k = &plusmn;6', c:true},{t:'k = 9', c:false}], why:'&Delta; = 0 &rarr; k&sup2; &minus; 36 = 0 &rarr; k = &plusmn;6.'}
    ]
  },

  harm: {
    TITLE: 'Harmonic Mean',
    NUM: 'PATTERN PATH &middot; HARM',
    H2: 'Harmonic mean &mdash; <em>average speed for equal distance</em>',
    SUB: 'The trap: averaging two speeds arithmetically when the trip covers equal <em>distances</em>. Equal distances &rArr; harmonic mean. Equal times &rArr; arithmetic mean.',
    CARD_MARK: 'H',
    CARD_H3: 'Pick the <em>setup</em>, not the answer',
    CARD_SUB: 'One averages the speeds. The other applies the harmonic-mean formula.',
    PROBLEM: 'You drive <b>60 mph</b> there and <b>40 mph</b> back, same route. Average speed for the round trip?',
    SETUP_A_TITLE: 'Arithmetic average of the speeds',
    SETUP_A_BODY: 'avg = (<b class="trap">60 + 40</b>) / 2<br>= <b class="trap">50 mph</b>',
    SETUP_A_ANS: '50 mph',
    SETUP_A_CORRECT: false,
    SETUP_A_VERDICT: 'Trap &mdash; ignores time spent at each speed',
    SETUP_B_TITLE: 'Harmonic mean (equal distance)',
    SETUP_B_BODY: 'avg = <b class="good">2 &middot; 60 &middot; 40 / (60 + 40)</b><br>= 4,800 / 100 = <b class="good">48 mph</b>',
    SETUP_B_ANS: '48 mph',
    SETUP_B_CORRECT: true,
    SETUP_B_VERDICT: 'Correct &mdash; harmonic mean for equal-distance legs',
    EXPL_HEAD: 'You spend <em>more time</em> at the slower speed.',
    EXPL_BODY: '<p>If the route is 120 miles each way: 2 hours at 60 there, 3 hours at 40 back. 240 miles total in 5 hours = 48 mph. The slow leg eats more clock-time, so it pulls the average toward the slow speed.</p>'+
      '<p>The arithmetic average is only correct when you spend equal <em>time</em> at each speed. Equal <em>distance</em> requires the harmonic formula.</p>',
    EXPL_KEY: 'Equal distance &rArr; <em>2v&#8321;v&#8322; / (v&#8321; + v&#8322;)</em>. Equal time &rArr; (v&#8321; + v&#8322;)/2.',
    DRILL: [
      {q:'Walk to school at 4 mph, run home at 12 mph. Average speed?', opts:[{t:'8 mph', c:false},{t:'6 mph (2&middot;4&middot;12 / 16)', c:true},{t:'4 mph', c:false},{t:'10 mph', c:false}], why:'Harmonic: 96/16 = 6 mph. You spend 3&times; more time walking.'},
      {q:'Bike at 20 km/h there, 30 km/h back. Average speed?', opts:[{t:'25 km/h', c:false},{t:'24 km/h', c:true},{t:'10 km/h', c:false},{t:'50 km/h', c:false}], why:'2&middot;20&middot;30/(20+30) = 1200/50 = 24 km/h.'},
      {q:'Drive 1 hour at 30 mph, 1 hour at 50 mph. Average speed?', opts:[{t:'40 mph (arithmetic)', c:true},{t:'37.5 mph (harmonic)', c:false},{t:'30 mph', c:false},{t:'50 mph', c:false}], why:'Equal <em>time</em> at each speed = arithmetic mean. (30 + 50)/2 = 40.'}
    ]
  }
};

function fillTemplate(m){
  const drill = m.DRILL.map(d => dq(d.q, d.opts, d.why)).join('\n');
  let html = SHELL;
  const fields = {...m, DRILL_HTML: drill};
  for (const k of Object.keys(fields)){
    html = html.split('{'+k+'}').join(fields[k]);
  }
  return html;
}

for (const [slug, m] of Object.entries(modules)){
  const html = fillTemplate(m);
  fs.writeFileSync(path.join(OUT, slug + '.html'), html);
  console.log('wrote', slug + '.html');
}
