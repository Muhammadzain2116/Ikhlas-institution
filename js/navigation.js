/* ==========================================================================
   navigation.js: active section tracking, header state and bottom-of-page
   handling. Smooth scrolling is handled by CSS (scroll-behavior) with a
   reduced-motion override in style.css.
   ========================================================================== */
(function (ns) {
  'use strict';

  var activeId = null;
  var sectionIds = [];
  var header = null;
  var ticking = false;

  function setActive(id) {
    if (!id || id === activeId) return;
    activeId = id;

    document.querySelectorAll('[data-nav]').forEach(function (link) {
      var on = link.getAttribute('data-nav') === id;
      link.classList.toggle('is-active', on);
      if (on) {
        link.setAttribute('aria-current', 'location');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  function onScroll() {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 12);

    // Short final sections never reach the middle line, so use page end.
    var atEnd = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
    if (atEnd && sectionIds.length) {
      setActive(sectionIds[sectionIds.length - 1]);
    } else if (window.scrollY < 120 && sectionIds.length) {
      setActive(sectionIds[0]);
    }
  }

  function handleScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      onScroll();
      ticking = false;
    });
  }

  function init() {
    header = document.querySelector('.site-header');

    var sections = Array.prototype.slice.call(document.querySelectorAll('main > section[id]'));
    sectionIds = sections.map(function (s) { return s.id; });

    window.addEventListener('scroll', handleScroll, { passive: true });
    onScroll();

    if (!('IntersectionObserver' in window)) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    sections.forEach(function (section) { observer.observe(section); });
  }

  ns.navigation = {
    init: init,
    getActive: function () { return activeId; }
  };
})(window.Ikhlas);
