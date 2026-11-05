/* ace-places-v1.js : <ace-places>, the three AceTheDAT places in one strip (B1.2t).

   AceTheDAT is one product in three places: Study (this site), Coaching (the
   portal) and Apply (the application workbench). Every place shows the same
   strip, so a student always sees one logo and the same three words.

     <link rel="stylesheet" href="/shared/places/ace-places-v1.css">
     <script src="/shared/places/ace-places-v1.js" defer></script>
     <ace-places current="coaching" show="study coaching" home="/student/dashboard"></ace-places>

   Attributes (all optional):
     current   study | coaching | apply: that link is drawn in mint, weight 700,
               with a mint tick under it, and carries aria-current="page"
     show      which places to list, space or comma separated, in any order
               (they always show in the order Study, Coaching, Apply). Default:
               all three. The current place is always listed. (The portal lists
               Apply only for a student holding an application package.)
     home      makes the logo a link to this URL; without it the logo is a
               picture named AceTheDAT
     theme     light | dark; without it the strip follows the device
               (prefers-color-scheme). The strip has no fill of its own: it sits
               on the host page's bar
     href-study, href-coaching, href-apply   another URL for one place (a
               preview or a local build); the defaults are the live logins

   Drawn in a shadow root: the ACE DAT lockup on desktop (760 px and up) and
   the AD mark on phones, both inline (the same paths as
   shared/brand/ace-dat-lockup-v1.svg, tests/shell/ace-places.test.js checks
   it), the links at least 44 x 44 px, DM Sans from the host page when it has
   it. No network: no stylesheet, font, image or script is fetched.

   The portal, Apply and the site carry byte-identical copies of this file and
   ace-places-v1.css, checked against shared/kit-manifest.json (SHA-256 per
   file). A change here is a new file name (ace-places-v2.js) and a new
   manifest entry, never an edit in place.

   window.AcePlaces: { version, places }. ES5 apart from the element class. */
(function () {
  'use strict';
  if (typeof window === 'undefined' || !window.customElements || !window.HTMLElement) return;
  if (window.customElements.get('ace-places')) return;

  var VERSION = '1';
  var PLACES = [
    { id: 'study', label: 'Study', href: 'https://acelabs.netlify.app/' },
    { id: 'coaching', label: 'Coaching', href: 'https://acethedat-portal.netlify.app/login' },
    { id: 'apply', label: 'Apply', href: 'https://acethedat-aadsas-workbench.netlify.app/login.html' }
  ];
  /* the ACE DAT lockup: the AD monogram and the letters (ink), the gold bar */
  var INK = 'M315.5 517.5 316.0 518.5 428.0 518.5 429.5 516.5 429.5 463.0 428.5 462.0 355.5 462.0 354.0 463.0ZM1249.5 288.5 1249.5 495.0 1398.0 495.0 1398.5 455.0 1397.5 454.0 1294.0 454.0 1292.5 452.5 1292.0 437.0 1292.5 413.5 1294.0 412.0 1384.5 412.0 1385.5 411.0 1385.5 371.0 1294.0 370.5 1292.5 369.5 1292.0 357.5 1292.5 330.5 1294.0 329.0 1396.0 329.0 1396.5 288.5ZM928.5 288.5 886.0 373.5 883.0 381.5 854.0 439.5 852.0 445.5 837.5 474.0 828.0 495.0 873.5 495.5 891.5 458.0 893.0 456.5 938.0 456.0 991.0 456.5 993.0 458.5 1011.5 495.5 1056.5 495.5 1056.5 494.0 1017.5 414.5 1007.0 391.0 1001.0 380.0 998.5 373.0 957.5 289.5 956.0 288.0ZM942.0 354.5 944.0 356.5 971.0 413.5 970.5 415.5 919.0 416.0 913.5 415.0 913.5 413.0 939.5 358.0ZM1863.5 285.5 1862.5 327.0 1863.5 328.5 1926.5 328.5 1929.5 329.0 1930.5 330.0 1931.0 495.5 1976.5 495.5 1977.0 330.0 1979.0 328.5 2045.0 328.5 2045.0 285.5ZM1769.5 285.5 1728.0 366.5 1724.5 372.0 1721.0 380.5 1709.5 402.0 1694.5 433.0 1691.5 437.5 1688.0 446.0 1663.5 494.0 1663.5 495.5 1712.5 495.5 1732.0 457.5 1735.0 456.0 1836.0 456.5 1840.5 464.0 1856.0 495.5 1906.0 495.5 1905.0 491.5 1881.0 444.5 1879.5 440.0 1875.0 432.5 1862.0 405.0 1858.0 398.5 1836.5 354.5 1802.0 287.5 1800.5 285.5ZM1785.0 353.0 1810.0 402.0 1815.0 413.5 1814.0 414.5 1801.0 415.0 1755.0 414.5 1754.5 412.5 1783.0 355.0ZM1474.5 285.5 1473.5 329.0 1473.5 493.5 1474.5 495.0 1583.5 495.0 1592.0 494.0 1608.0 490.5 1629.5 482.0 1643.5 473.5 1655.5 463.0 1662.5 455.0 1670.5 443.5 1677.5 429.0 1683.0 407.5 1684.5 385.5 1683.5 373.0 1681.5 363.0 1678.0 352.0 1673.5 341.5 1664.0 326.5 1650.0 312.0 1637.5 303.0 1621.0 294.5 1606.5 289.5 1582.5 285.5ZM1521.5 329.0 1581.0 329.0 1590.0 330.5 1600.0 334.0 1609.0 338.5 1615.5 343.0 1622.5 350.0 1630.0 361.5 1634.0 371.0 1636.0 380.0 1636.5 394.0 1634.5 407.0 1631.0 417.0 1623.0 430.0 1611.0 440.5 1601.0 446.0 1591.0 449.5 1585.5 450.5 1521.5 451.0 1520.0 449.5 1520.0 332.0ZM1131.5 281.0 1112.5 284.5 1090.5 293.0 1081.5 298.5 1070.0 307.5 1063.0 314.5 1055.0 324.5 1046.0 340.0 1040.5 355.0 1038.0 365.0 1036.0 382.5 1036.0 399.5 1037.0 409.5 1041.0 427.5 1046.0 441.0 1050.0 449.0 1056.0 458.5 1062.0 466.0 1071.0 475.0 1079.0 481.5 1097.5 492.0 1115.5 498.0 1132.0 500.5 1160.0 500.0 1171.5 498.0 1186.5 493.5 1203.0 485.0 1217.0 475.0 1229.5 462.0 1232.5 458.0 1233.0 455.5 1215.0 439.0 1201.0 427.5 1187.5 441.5 1177.0 449.0 1164.5 455.0 1155.5 457.5 1131.5 457.5 1120.0 454.0 1110.5 449.5 1102.0 443.5 1094.5 435.5 1088.0 426.0 1083.0 413.5 1080.0 399.0 1080.0 384.0 1081.5 373.0 1085.5 360.5 1094.0 346.0 1099.5 340.0 1113.5 330.0 1123.0 326.0 1139.5 323.0 1153.0 323.5 1162.5 325.5 1172.5 329.5 1182.0 335.5 1199.5 351.5 1200.5 351.5 1221.5 332.0 1231.5 321.5 1227.0 315.5 1217.0 306.0 1203.0 296.0 1190.0 289.5 1176.5 285.0 1160.5 281.5 1148.0 280.5ZM537.0 173.0 535.5 174.5 536.0 236.0 625.0 236.5 647.0 240.0 669.5 247.0 688.5 257.0 703.0 267.5 714.5 279.0 722.5 289.0 733.0 306.5 738.5 319.0 745.0 341.0 747.5 359.5 748.0 378.0 746.5 395.5 744.0 409.5 736.5 432.5 730.0 446.0 718.5 463.5 707.5 476.0 700.5 482.5 688.0 492.0 669.0 502.5 651.5 509.0 639.5 512.0 618.0 515.0 518.5 515.0 517.0 514.0 517.0 467.5 505.0 456.0 504.5 454.5 486.0 436.0 485.5 434.5 482.0 432.0 481.5 430.5 449.0 397.0 448.5 572.5 620.5 573.0 647.0 570.5 658.5 568.5 686.0 561.5 704.5 554.5 722.5 545.5 737.5 536.0 752.5 524.5 769.5 507.5 780.5 493.5 789.5 480.0 799.0 462.5 805.0 448.5 812.0 426.5 816.0 408.0 818.5 386.5 818.5 361.5 817.5 348.0 814.0 327.5 809.0 309.0 801.5 289.0 796.5 278.5 786.0 260.5 768.0 237.0 752.5 221.5 737.5 209.5 721.0 199.0 707.0 192.0 695.0 187.0 676.0 181.0 658.0 177.0 643.5 175.0 625.0 173.5ZM516.0 173.5 456.5 173.5 454.5 175.5 400.0 256.0 393.0 265.0 379.0 286.0 372.5 294.0 366.5 304.0 338.5 341.5 335.5 347.0 327.5 357.0 264.0 447.0 258.5 453.5 253.0 462.5 212.0 518.5 206.5 527.5 179.0 565.0 174.5 572.0 175.0 573.0 252.0 573.0 254.0 571.0 292.0 516.0 318.0 480.0 322.5 472.5 340.5 448.5 403.5 358.5 447.5 298.0 448.5 298.5 449.0 302.0 472.5 325.0 515.5 370.0 516.5 370.0 517.0 196.5Z';
  var GOLD = 'M435.5 315.0 412.5 348.0 410.0 350.5 408.5 354.0 481.5 429.5 482.0 431.0 504.5 453.5 505.0 455.0 516.5 466.0 516.5 396.5 438.0 315.5Z';

  var CSS =
    ':host{all:initial;display:block;contain:layout style;' +
      '--ap-ink:#3a4a42;--ap-ink-hi:#0d2018;--ap-cur:#096E4F;--ap-tick:#096E4F;--ap-logo:#1B3A2D;--ap-gold:#C9A84C;' +
      'font-family:"DM Sans",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}' +
    ':host([hidden]){display:none}' +
    ':host([theme="dark"]){--ap-ink:#c9c3b4;--ap-ink-hi:#ece6d7;--ap-cur:#6FF0C3;--ap-tick:#33C993;--ap-logo:#F5F0E8}' +
    '@media (prefers-color-scheme:dark){:host(:not([theme="light"])){--ap-ink:#c9c3b4;--ap-ink-hi:#ece6d7;--ap-cur:#6FF0C3;--ap-tick:#33C993;--ap-logo:#F5F0E8}}' +
    '*{box-sizing:border-box;margin:0;padding:0}' +
    '.strip{display:flex;align-items:center;gap:16px;min-height:44px}' +
    '.brand{display:inline-flex;align-items:center;justify-content:center;flex:0 0 auto;min-height:44px;min-width:44px;border-radius:8px;color:var(--ap-logo);text-decoration:none}' +
    '.brand .lockup{display:block;width:auto;height:24px}' +
    '.brand .mark{display:none;width:26px;height:26px}' +
    '.ink{fill:var(--ap-logo)}.gold{fill:var(--ap-gold)}' +
    'nav{display:flex;min-width:0}' +
    'ul{display:flex;align-items:center;list-style:none;gap:2px}' +
    'li{display:flex}' +
    'a.place{position:relative;display:flex;align-items:center;justify-content:center;min-width:44px;min-height:44px;padding:0 12px;' +
      'color:var(--ap-ink);text-decoration:none;font-family:inherit;font-weight:600;font-size:14px;line-height:1;letter-spacing:.01em;white-space:nowrap;border-radius:10px}' +
    'a.place:hover{color:var(--ap-ink-hi)}' +
    'a.place[aria-current="page"]{color:var(--ap-cur);font-weight:700}' +
    'a.place[aria-current="page"]::after{content:"";position:absolute;left:calc(50% - 12px);bottom:6px;width:24px;height:3px;border-radius:3px;background:var(--ap-tick)}' +
    'a:focus-visible{outline:3px solid var(--ap-cur);outline-offset:-3px}' +
    '@media (max-width:759px){.strip{gap:4px}.brand .lockup{display:none}.brand .mark{display:block}a.place{padding:0 8px;font-size:13px}}';

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  /* only http(s) or a path on this site: never javascript: or data: */
  function safeHref(u) {
    u = String(u || '').trim();
    return /^(https?:\/\/|\/(?!\/))/i.test(u) ? u : '';
  }
  function logo(cls, box) {
    return '<svg class="' + cls + '" viewBox="' + box + '" aria-hidden="true" focusable="false">' +
      '<path class="ink" fill-rule="evenodd" d="' + INK + '"/><path class="gold" d="' + GOLD + '"/></svg>';
  }

  class AcePlacesElement extends HTMLElement {
    static get observedAttributes() { return ['current', 'show', 'home', 'theme', 'href-study', 'href-coaching', 'href-apply']; }
    connectedCallback() { this.render(); }
    attributeChangedCallback() { if (this.shadowRoot) this.render(); }
    render() {
      var sr = this.shadowRoot || this.attachShadow({ mode: 'open' });
      var current = String(this.getAttribute('current') || '').trim().toLowerCase();
      var showAttr = this.getAttribute('show');
      var want = showAttr == null ? null : String(showAttr).toLowerCase().split(/[\s,]+/).filter(Boolean);
      var self = this;
      var links = PLACES.filter(function (p) { return !want || want.indexOf(p.id) >= 0 || p.id === current; }).map(function (p) {
        var href = safeHref(self.getAttribute('href-' + p.id)) || p.href;
        var cur = p.id === current ? ' aria-current="page"' : '';
        return '<li><a class="place" data-place="' + p.id + '" href="' + esc(href) + '"' + cur + '>' + p.label + '</a></li>';
      }).join('');
      var home = safeHref(this.getAttribute('home'));
      var art = logo('lockup', '174 173 1872 400') + logo('mark', '174 51 644 644');
      var brand = home
        ? '<a class="brand" href="' + esc(home) + '" aria-label="AceTheDAT">' + art + '</a>'
        : '<span class="brand" role="img" aria-label="AceTheDAT">' + art + '</span>';
      sr.innerHTML = '<style>' + CSS + '</style><div class="strip" part="strip">' + brand +
        '<nav aria-label="AceTheDAT places"><ul>' + links + '</ul></nav></div>';
    }
  }

  window.AcePlaces = { version: VERSION, places: PLACES.map(function (p) { return { id: p.id, label: p.label, href: p.href }; }) };
  window.customElements.define('ace-places', AcePlacesElement);
})();
