/* ==========================================================================
   sector-page.js: fills one sector page (sectors/<id>.html).
   The sector id comes from <body data-sector="...">. Every public sector
   follows the same seven-part structure. Missing content shows "Coming soon".
   ========================================================================== */
(function (ns) {
  'use strict';

  var T = ns.text;
  var D = ns.data;
  var PLACEHOLDER = '<p class="placeholder">Coming soon</p>';

  function root() {
    return document.body.getAttribute('data-root') || '';
  }

  function icon(name) {
    return '<i data-lucide="' + name + '" aria-hidden="true"></i>';
  }

  function para(value) {
    return value ? '<p>' + T.fmt(value) + '</p>' : PLACEHOLDER;
  }

  function list(items) {
    if (!items || !items.length) return PLACEHOLDER;
    return '<ul class="detail-list">' + items.map(function (item) {
      return '<li>' + T.fmt(item) + '</li>';
    }).join('') + '</ul>';
  }

  function section(num, title, body) {
    return '<section class="doc-section">' +
      '<header class="doc-head"><span class="doc-num">' + num + '</span><h2>' + T.fmt(title) + '</h2></header>' +
      body + '</section>';
  }

  function sub(label, body) {
    return '<h3 class="sub-head">' + T.fmt(label) + '</h3>' + body;
  }

  function subSectors(items) {
    if (!items || !items.length) return PLACEHOLDER;
    return items.map(function (unit) {
      return '<div class="sub-item"><h3 class="sub-item__name">' + T.esc(unit.name) + '</h3>' +
        '<p>' + (unit.text ? T.fmt(unit.text) : 'Coming soon') + '</p></div>';
    }).join('');
  }

  function operational(op) {
    var o = op || {};
    return sub('A. Daily Operations', list(o.daily)) +
      sub('B. Weekly Operations (ሳምንታዊ አተገባበር)', list(o.weekly)) +
      sub('C. Monthly Operations (ወርሃዊ አተገባበር)', list(o.monthly)) +
      sub('D. Semester / Term Operations (መንፈቃዊ አተገባበር)', list(o.semester)) +
      sub('E. Annual Operations (ዓመታዊ አተገባበር)', list(o.annual));
  }

  function reviewCard() {
    return '<section class="review-card">' +
      '<span class="review-badge">UNDER REVIEW</span>' +
      '<h2>Under institutional review</h2>' +
      '<p>The information for this sector is currently being reviewed by the institution. ' +
      'The full content will be published once the review is complete.</p>' +
      '</section>';
  }

  function otherSectors(currentId) {
    return D.sectors.filter(function (s) { return s.id !== currentId; }).map(function (s) {
      return '<a class="card link-card" href="' + T.esc(s.id) + '.html">' +
        '<span class="icon-chip">' + icon(s.icon) + '</span>' +
        '<span class="link-card__body"><span class="card-title card-title--sm">' + T.esc(s.name) + '</span>' +
        (s.status === 'review' ? '<span class="link-card__status">Under review</span>' : '') + '</span>' +
        icon('arrow-up-right') + '</a>';
    }).join('');
  }

  function render() {
    var R = root();
    var id = document.body.getAttribute('data-sector');
    var s = D.sectors.find(function (x) { return x.id === id; });
    var container = document.getElementById('sector-root');
    var others = document.getElementById('other-sectors');

    if (!s) {
      container.innerHTML = '<p class="lead">This sector could not be found.</p>';
      others.innerHTML = otherSectors(null);
      return;
    }

    document.title = s.name + ' | Ikhlas Institution';

    var structure = s.status === 'review' ? reviewCard() :
      section('01', 'Introduction', para(s.intro)) +
      section('02', 'Core Purpose & Objectives',
        para(s.purpose) + sub('Target goals and unit objectives', list(s.objectives))) +
      section('03', 'Sub-Sectors', subSectors(s.subSectors)) +
      section('04', 'Policy & Strategy', list(s.policy)) +
      section('05', 'Operational Framework', operational(s.operational)) +
      section('06', 'Code of Conduct & Duties (ህግ፣ ደንብ እና ግዴታዎች)', para(s.conduct)) +
      section('07', 'Closing & Evaluation (ማጠቃለያ / መደምደሚያ)', para(s.closing));

    container.innerHTML =
      '<a class="back-link" href="' + R + 'index.html#sectors">' + icon('arrow-left') + '<span>Back to sectors</span></a>' +
      '<header class="sector-hero"><p class="eyebrow">Sector</p>' +
      '<h1 class="section-title">' + T.esc(s.name) + '</h1></header>' +
      '<figure class="media media--16x9 sector-hero__media">' +
      '<img src="' + R + T.esc(s.image) + '" alt="' + T.esc(s.name) + ' sector">' +
      '<span class="media__label">Image to be added</span></figure>' +
      structure;

    var img = container.querySelector('.sector-hero__media img');
    if (img) {
      var slot = img.closest('.media');
      var markMissing = function () { slot.classList.add('is-missing'); };
      if (img.complete && img.naturalWidth === 0) markMissing();
      img.addEventListener('error', markMissing, { once: true });
    }

    others.innerHTML = otherSectors(s.id);
  }

  function init() {
    ns.theme.init();
    render();
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
