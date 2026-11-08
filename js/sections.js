/* ==========================================================================
   sections.js: renders the homepage card grids (sectors, journey posts,
   announcements, values). Images use one fixed 16:9 frame; missing images
   show a labelled placeholder.
   ========================================================================== */
(function (ns) {
  'use strict';

  var T = ns.text;
  var D = ns.data;

  function icon(name) {
    return '<i data-lucide="' + name + '" aria-hidden="true"></i>';
  }

  function refreshIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  function media(src, alt) {
    var label = '<span class="media__label">Image to be added</span>';
    if (!src) {
      return '<figure class="media media--16x9 is-missing">' + label + '</figure>';
    }
    return '<figure class="media media--16x9"><img src="' + T.esc(src) + '" alt="' + T.esc(alt) +
      '" loading="lazy" decoding="async">' + label + '</figure>';
  }

  function bindFallbacks() {
    document.querySelectorAll('.media img').forEach(function (img) {
      var slot = img.closest('.media');
      var markMissing = function () { slot.classList.add('is-missing'); };
      if (img.complete && img.naturalWidth === 0) markMissing();
      img.addEventListener('error', markMissing, { once: true });
    });
  }

  function sectorCards() {
    return D.sectors.map(function (s) {
      var badge = s.status === 'review' ? '<span class="tag tag--gold">Under review</span>' : '';
      return '<article class="card sector-card reveal">' +
        media(s.image, s.name) +
        '<div class="sector-card__body">' +
        '<div class="sector-card__top"><span class="icon-chip">' + icon(s.icon) + '</span>' + badge + '</div>' +
        '<h3 class="card-title">' + T.esc(s.name) + '</h3>' +
        '<p class="card-text">' + T.fmt(s.intro) + '</p>' +
        '<a class="btn btn--ghost" href="sectors/' + T.esc(s.id) + '.html"><span>View sector</span>' +
        icon('arrow-up-right') + '</a>' +
        '</div></article>';
    }).join('');
  }
  function videoBlock(p) {
    return '<figure class="media media--video">' +
      '<video controls playsinline preload="metadata"' +
      (p.image ? ' poster="' + T.esc(p.image) + '"' : '') + '>' +
      '<source src="' + T.esc(p.video) + '" type="video/mp4">' +
      'Your browser cannot play this video.</video></figure>';
  }

  function postCards(items, type) {
    return items.map(function (p) {
      return '<article class="card post-card reveal">' +
        (p.video ? videoBlock(p) : media(p.image, p.title)) +
        '<div class="post-card__body">' +
        '<p class="post-card__meta"><span class="tag">' + T.esc(p.category) + '</span>' +
        '<span>' + (p.date ? T.esc(p.date) : 'Date to be announced') + '</span></p>' +
        '<h3 class="card-title card-title--sm">' + T.esc(p.title) + '</h3>' +
        '<p class="card-text">' + T.fmt(p.description) + '</p>' +
        '<a class="link-arrow" href="article.html?type=' + type + '&amp;id=' + T.esc(p.id) + '">Read more</a>' +
        '</div></article>';
    }).join('');
  }

  function valueCards() {
    return D.values.map(function (v) {
      return '<article class="card value-card reveal">' +
        '<span class="icon-chip">' + icon(v.icon) + '</span>' +
        '<h3 class="card-title card-title--sm">' + T.esc(v.title) + '</h3>' +
        '<p class="card-text">' + T.fmt(v.text) + '</p>' +
        '</article>';
    }).join('');
  }

  function init() {
    document.getElementById('sector-grid').innerHTML = sectorCards();
    document.getElementById('journey-grid').innerHTML = postCards(D.journey, 'journey');
    document.getElementById('announcement-grid').innerHTML = postCards(D.announcements, 'announcement');
    document.getElementById('values-grid').innerHTML = valueCards();
    bindFallbacks();
    refreshIcons();
    ns.animations.reveal(document, false);
  }

  ns.sections = { init: init };
})(window.Ikhlas);
