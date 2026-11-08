/* ==========================================================================
   main.js: homepage entry point. Starts each module once.
   ========================================================================== */
(function (ns) {
  'use strict';

  function init() {
    document.documentElement.classList.add('js');
    ns.theme.init();
    ns.sections.init();
    ns.navigation.init();
    ns.animations.init();
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(window.Ikhlas);
