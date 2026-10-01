/* Retired. Ace Labs has ONE navigation now: /shared/ace-shell.js (six doors:
   Today, Learn, Practice, Tests, Review, Canon). This file stays only so any
   page or cached copy that still includes it gets the shell instead. */
(function () {
  if (window.AceShell || document.querySelector('script[src*="/shared/ace-shell.js"]')) return;
  var s = document.createElement('script');
  s.src = '/shared/ace-shell.js?v=1';
  s.defer = true;
  (document.head || document.documentElement).appendChild(s);
})();
