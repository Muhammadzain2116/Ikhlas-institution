/* ==========================================================================
   theme.js: dark/light theme. Dark is the default.
   Saves the choice in localStorage and fades colours on manual change.
   The first paint is handled by the inline script in index.html.
   ========================================================================== */
(function (ns) {
  'use strict';

  var STORAGE_KEY = 'ikhlas-theme';
  var TRANSITION_CLASS = 'theme-transition';
  var TRANSITION_MS = 500;
  var timer = null;

  function readStored() {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'light' ? 'light' : 'dark';
    } catch (e) {
      return 'dark';
    }
  }

  function store(theme) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) { /* storage unavailable: the choice lasts this visit only */ }
  }

  function current() {
    return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  }

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function apply(theme, animate) {
    var root = document.documentElement;

    if (animate && !prefersReducedMotion()) {
      root.classList.add(TRANSITION_CLASS);
      window.clearTimeout(timer);
      timer = window.setTimeout(function () {
        root.classList.remove(TRANSITION_CLASS);
      }, TRANSITION_MS);
    }

    root.setAttribute('data-theme', theme);
    root.style.colorScheme = theme;

    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', theme === 'light' ? '#f6f4ee' : '#070a09');
    }
  }

  function toggle() {
    var next = current() === 'dark' ? 'light' : 'dark';
    apply(next, true);
    store(next);
  }

  function init() {
    apply(readStored(), false);
    document.querySelectorAll('[data-theme-toggle]').forEach(function (button) {
      button.addEventListener('click', toggle);
    });
  }

  ns.theme = { init: init, toggle: toggle, current: current };
})(window.Ikhlas);
