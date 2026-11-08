/* ==========================================================================
   animations.js: scroll reveals (IntersectionObserver) and back-to-top.
   Reveals are skipped entirely under prefers-reduced-motion.
   ========================================================================== */
(function (ns) {
  'use strict';

  var observer = null;

  function reducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function getObserver() {
    if (!observer) {
      observer = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    }
    return observer;
  }

  /* Reveal every .reveal element under root that is not yet visible.
     immediate = true shows them without animation (used after re-rendering
     on a language change so content does not disappear and reappear). */
  function reveal(root, immediate) {
    var items = root.querySelectorAll('.reveal:not(.is-visible)');
    if (!items.length) return;

    if (immediate || reducedMotion() || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    var io = getObserver();
    items.forEach(function (el) { io.observe(el); });
  }

  function initBackToTop() {
    var button = document.querySelector('[data-back-top]');
    if (!button) return;

    var ticking = false;
    function update() {
      button.classList.toggle('is-visible', window.scrollY > 480);
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    }, { passive: true });

    button.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reducedMotion() ? 'auto' : 'smooth' });
    });

    update();
  }

  function init() {
    reveal(document, false);
    initBackToTop();
  }

  ns.animations = {
    init: init,
    reveal: reveal
  };
})(window.Ikhlas);
