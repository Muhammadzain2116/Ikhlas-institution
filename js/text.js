/* ==========================================================================
   text.js: escaping and script-aware formatting.
   Amharic runs get the Amharic font class and Arabic runs the Arabic class.
   ========================================================================== */
(function (ns) {
  'use strict';

  var ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  var AMHARIC = /[\u1200-\u139F\u2D80-\u2DDF]+/g;
  var ARABIC = /[\u0600-\u06FF\u0750-\u077F]+/g;

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) { return ESC[c]; });
  }

  function fmt(value) {
    return esc(value)
      .replace(AMHARIC, '<span class="am">$&</span>')
      .replace(ARABIC, '<span class="ar">$&</span>');
  }

  ns.text = { esc: esc, fmt: fmt };
})(window.Ikhlas = window.Ikhlas || {});
