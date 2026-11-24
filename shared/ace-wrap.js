/* ace-wrap.js : the way back for the older tool pages (2026-11-16).
   One line at the end of a tool's <body>, after ace-shell.js:
     <script src="/shared/ace-wrap.js?v=3" defer></script>
   Adds the way back inside the Ace Labs bar itself, beside the brand: "Back to Labs", or
   "Back to Review" / "Back to Repair" when the page was opened from a miss
   (?from=review|repair, set by the See it buttons). One bar, no second row.
   It changes nothing inside the tool. Skipped in frames and on ?embed. */
(function () {
  'use strict';
  if (window.AceWrap) return;
  window.AceWrap = { version: 2 };
  var qs; try { qs = new URLSearchParams(location.search); } catch (e) { qs = null; }
  function framed() { try { return window.top !== window.self; } catch (e) { return true; } }
  if (framed() || (qs && qs.get('embed'))) return;
  var from = qs ? (qs.get('from') || '') : '', student = qs ? (qs.get('student') || '').trim() : '';
  function href(u) { return student ? u + '?student=' + encodeURIComponent(student) : u; }
  var BACK = { review: ['/review/', 'Back to Review'], repair: ['/repair/', 'Back to Repair'], set: ['#back', 'Back to your set'] };
  var ARROW = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex-shrink:0"><path d="M19 12H5M11 6l-6 6 6 6"></path></svg>';
  var PILL = 'display:inline-flex;align-items:center;gap:6px;min-height:44px;padding:0 14px;white-space:nowrap;border-radius:999px;text-decoration:none;font:700 14px \'DM Sans\',system-ui,sans-serif;';

  function build() {
    var row = document.createElement('nav');
    row.id = 'ace-wrap'; row.setAttribute('aria-label', 'Back');
    row.style.cssText = 'display:flex;gap:8px;align-items:center;box-sizing:border-box;';
    var html = '';
    if (BACK[from]) html += '<a href="' + (BACK[from][0] === '#back' ? '#back' : href(BACK[from][0])) + '" style="' + PILL + 'background:#1B3A2D;color:#F5F0E8;">' + ARROW + BACK[from][1] + '</a>';
    html += '<a href="' + href('/labs/') + '" style="' + PILL + (BACK[from] ? 'background:transparent;color:#1B3A2D;border:1.5px solid rgba(27,58,45,.3);">All labs' : 'background:transparent;color:#1B3A2D;border:1.5px solid rgba(27,58,45,.3);">' + ARROW + 'Labs') + '</a>';
    row.innerHTML = html;
    // from a set: the browser's back keeps the student on the same question
    var b = row.querySelector('a[href="#back"]'); if (b) b.addEventListener('click', function (e) { e.preventDefault(); history.back(); });
    return row;
  }
  function place() {
    if (document.getElementById('ace-wrap') || !document.body) return;
    var shell = document.getElementById('ace-shell'), row = build();
    if (shell && shell.shadowRoot && !shell.hidden) {
      if (shell.shadowRoot.getElementById('ace-wrap')) return;
      var inner = shell.shadowRoot.querySelector('.inner'), brand = shell.shadowRoot.querySelector('.brand');
      if (inner && brand) {
        // inside the bar: after the brand on a desk, pushed right on a phone (the doors are in the tab bar there)
        row.style.cssText += 'margin-left:auto;';
        var st = document.createElement('style');
        st.textContent = '@media (min-width:760px){#ace-wrap{margin-left:4px!important}}@media (max-width:380px){#ace-wrap a+a{display:none!important}}';
        shell.shadowRoot.appendChild(st);
        inner.insertBefore(row, brand.nextSibling);
      } else shell.shadowRoot.appendChild(row);
      try { window.dispatchEvent(new Event('resize')); } catch (e) { /* old browsers: the next scroll re-measures */ }
    } else { row.style.cssText += 'flex-wrap:wrap;width:100%;padding:6px 16px;background:#F5F0E8;border-bottom:1px solid rgba(27,58,45,.16);'; document.body.insertBefore(row, document.body.firstChild); }
    // phone: keep a tool's own bottom-left chip clear of the tab bar
    var css = document.createElement('style');
    css.textContent = '@media (max-width:759px){body.has-ace-tabs #retoldHome,body.has-ace-tabs #coachFab{bottom:86px !important}}@media print{#ace-wrap{display:none}}' +
      /* molecule drawings made for the dark skin (tools/ochem/tree/draw.js): ink on cream */
      'html[data-cream] svg [stroke="#ece6d7"]{stroke:#0d2018}html[data-cream] svg [fill="#ece6d7"]{fill:#0d2018}html[data-cream] svg stop[stop-color="#ece6d7"]{stop-color:#0d2018}';
    document.head.appendChild(css);
  }
  function soon() { setTimeout(place, 0); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', soon); else soon();
})();
