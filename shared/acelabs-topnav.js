/* acelabs-topnav.js — the ONE canonical Ace Labs top-nav.
   Every entry page hand-rolled its own .al-nav with different link sets and
   relabelled the same destinations ("Prometric mocks" vs "Practice tests" vs
   "Mocks"). This normalizes them: on load it finds the page's .al-nav and
   replaces its contents with a single canonical link set (one label per
   destination), marking the current page active. Non-destructive — if there is
   no .al-nav or the script fails, the page's own nav is left untouched.
   Absolute (/) hrefs so the same nav works from any page depth. */
(function () {
  var LINKS = [
    { l: 'Home',              h: '/ace-labs.html' },
    { l: 'Retold · Learn',    h: '/retold/' },
    { l: 'Engines · Review',  h: '/ace-labs.html#tools' },
    { l: 'Prometric mocks',   h: '/prometric-mock.html' },
    { l: 'Mock catalog',      h: '/mocks-catalog.html' },
    { l: 'The Climb',         h: '/tools/minitests/' },
    { l: 'PAT',               h: '/tools/pat/' },
    { l: 'Trick sheets',      h: '/tricks/' },
    { l: 'Trick videos',      h: '/tricks/videos/' },
    { l: 'This week',         h: '/ace-labs.html#plan' },
    { l: 'Test day',          h: '/test-day-readiness.html' }
  ];
  function norm(p) { p = String(p || '/').replace(/index\.html$/, ''); if (p.length > 1) p = p.replace(/\/$/, ''); return p || '/'; }
  function render() {
    var nav = document.querySelector('header .al-nav') || document.querySelector('.al-nav');
    if (!nav) return;
    var here = norm(location.pathname);
    nav.innerHTML = LINKS.map(function (x) {
      var isAnchor = x.h.indexOf('#') !== -1;
      var active = !isAnchor && norm(x.h.split('#')[0]) === here;
      return '<a href="' + x.h + '" class="al-nav-link' + (active ? ' active' : '') + '">' + x.l + '</a>';
    }).join('');
  }
  if (document.readyState !== 'loading') render();
  else document.addEventListener('DOMContentLoaded', render);
})();
