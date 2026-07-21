/*
  acelabs-nav.js — one consistent "back to Ace Labs home" control for every tool.
  Drop <script src="/shared/acelabs-nav.js" defer></script> before </body>.
  - links to the Ace Labs home (/), preserving ?student
  - self-hides on the home page itself and inside embedded iframes (engine modals)
  - pure overlay: never shifts a tool's layout
  - opt out per page with <html data-acelabs-nav="off">
*/
(function () {
  try {
    if (window.top !== window.self) return; // embedded in an iframe (e.g. engine "Watch" modal)
  } catch (e) { return; }
  var html = document.documentElement;
  if (html.getAttribute('data-acelabs-nav') === 'off') return;
  var path = location.pathname;
  if (path === '/' || /\/ace-labs\.html$/.test(path)) return; // already home

  var stu = new URLSearchParams(location.search).get('student');
  var home = '/' + (stu ? '?student=' + encodeURIComponent(stu) : '');

  function mount() {
    if (document.getElementById('al-home')) return;
    var css = document.createElement('style');
    css.textContent =
      '#al-home{position:fixed;top:11px;left:11px;z-index:2147483000;display:inline-flex;align-items:center;gap:7px;' +
      'font-family:ui-monospace,"JetBrains Mono",Menlo,monospace;font-size:11px;font-weight:700;letter-spacing:.13em;text-transform:uppercase;' +
      'color:#e9dfc0;text-decoration:none;background:rgba(18,16,11,.8);border:1px solid rgba(201,168,76,.42);' +
      'padding:7px 13px 7px 11px;border-radius:22px;-webkit-backdrop-filter:blur(7px);backdrop-filter:blur(7px);' +
      'box-shadow:0 2px 12px rgba(0,0,0,.32);transition:background .15s,border-color .15s,transform .15s,box-shadow .15s;line-height:1}' +
      '#al-home:hover{background:rgba(30,26,17,.96);border-color:rgba(201,168,76,.85);transform:translateY(-1px);box-shadow:0 4px 16px rgba(0,0,0,.4)}' +
      '#al-home:focus-visible{outline:2px solid #c9a84c;outline-offset:2px}' +
      '#al-home .al-chev{width:6px;height:6px;border-left:2px solid #c9a84c;border-bottom:2px solid #c9a84c;transform:rotate(45deg);display:inline-block;margin-right:1px}' +
      '@media (max-width:640px){#al-home{top:8px;left:8px;font-size:10px;letter-spacing:.1em;padding:6px 11px 6px 9px}}' +
      '@media (prefers-reduced-motion:reduce){#al-home{transition:none}}' +
      '@media print{#al-home{display:none}}';
    document.head.appendChild(css);
    var a = document.createElement('a');
    a.id = 'al-home';
    a.href = home;
    a.setAttribute('aria-label', 'Back to Ace Labs home');
    a.innerHTML = '<span class="al-chev" aria-hidden="true"></span><span>Ace Labs</span>';
    (document.body || html).appendChild(a);
    // Auto-nudge: if a tool has a top bar the chip would overlap, give that bar a
    // left gutter so its brand clears the chip. Pure padding on a wide top element.
    function nudge() {
      var cr = a.getBoundingClientRect();
      var vw = window.innerWidth, need = cr.right + 12;
      var cands = document.querySelectorAll('body > *, body > * > *, body > * > * > *');
      for (var i = 0; i < cands.length; i++) {
        var el = cands[i]; if (el === a) continue;
        var r = el.getBoundingClientRect();
        if (r.top <= 16 && r.width > vw * 0.6 && r.height >= 26 && r.height < 170) {
          var padL = parseFloat(getComputedStyle(el).paddingLeft) || 0;
          if (padL < need) el.style.paddingLeft = need + 'px';
          return;
        }
      }
    }
    requestAnimationFrame(function () { requestAnimationFrame(nudge); });
    var t = 0, iv = setInterval(function () { nudge(); if (++t >= 4) clearInterval(iv); }, 220);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
