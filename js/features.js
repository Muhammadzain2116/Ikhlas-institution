/* ==========================================================================
   features.js: runs on every page.
   - Logo and hero image paths (respects the page's data-root)
   - Official links and footer channel visibility
   - Total visits counter (only shows a number once a counter is configured)
   - Share Your Ideas form (validation, then the visitor's email app)
   - Article page rendering (journey posts and announcements)
   ========================================================================== */
(function (ns) {
  'use strict';

  var T = ns.text;
  var D = ns.data;

  function root() {
    return document.body.getAttribute('data-root') || '';
  }

  function applyAssets() {
    var R = root();
    document.querySelectorAll('[data-asset]').forEach(function (img) {
      var src = D.assets[img.getAttribute('data-asset')];
      if (src) img.setAttribute('src', R + src);
    });
  }

  function renderLinks() {
    var links = D.links;
    document.querySelectorAll('[data-link]').forEach(function (el) {
      var key = el.getAttribute('data-link');
      var href = (links[key] || '').trim();
      var status = el.querySelector('[data-link-status]');
      var inFooter = Boolean(el.closest('.site-footer'));

      if (href) {
        if (key === 'email' && href.indexOf('@') !== -1 && !/^mailto:/i.test(href)) {
          href = 'mailto:' + href;
        }
        el.setAttribute('href', href);
        if (key !== 'email') {
          el.setAttribute('target', '_blank');
          el.setAttribute('rel', 'noopener noreferrer');
        }
        el.removeAttribute('aria-disabled');
        el.classList.remove('is-disabled');
        el.hidden = false;
        if (status) status.textContent = 'Official channel';
      } else {
        el.removeAttribute('href');
        el.removeAttribute('target');
        el.removeAttribute('rel');
        el.setAttribute('aria-disabled', 'true');
        el.classList.add('is-disabled');
        if (inFooter) {
          el.hidden = true;
        } else if (status) {
          status.textContent = 'Not yet available';
        }
      }
    });

    var channels = document.querySelector('[data-footer-channels]');
    if (channels) {
      channels.hidden = !Object.keys(links).some(function (k) {
        return (links[k] || '').trim() !== '';
      });
    }
  }

  function initVisits() {
    var el = document.getElementById('visits-count');
    if (!el) return;

    var url = (D.visits && D.visits.countUrl) || '';
    if (!url) {
      el.textContent = '—';
      el.parentNode.setAttribute('title', 'Visitor counter not connected yet (see js/data.js)');
      return;
    }

    var cached = null;
    try { cached = sessionStorage.getItem('ikhlas-visits'); } catch (e) { cached = null; }
    if (cached) {
      el.textContent = Number(cached).toLocaleString('en-US');
      return;
    }

    fetch(url)
      .then(function (r) {
        if (!r.ok) throw new Error('counter response');
        return r.json();
      })
      .then(function (d) {
        var n = d.count != null ? d.count : d.value;
        if (n == null) throw new Error('no count in response');
        el.textContent = Number(n).toLocaleString('en-US');
        try { sessionStorage.setItem('ikhlas-visits', String(n)); } catch (e) { /* ignore */ }
      })
      .catch(function () {
        el.textContent = '—';
      });
  }

  function initFeedback() {
    var form = document.getElementById('idea-form');
    if (!form) return;

    var nameInput = document.getElementById('idea-name');
    var select = document.getElementById('idea-category');
    var text = document.getElementById('idea-text');
    var count = document.getElementById('idea-count');
    var status = document.getElementById('idea-status');

    D.feedback.categories.forEach(function (c) {
      var option = document.createElement('option');
      option.value = c;
      option.textContent = c;
      select.appendChild(option);
    });

    text.addEventListener('input', function () {
      count.textContent = String(text.value.length);
    });

    function show(message, kind) {
      status.textContent = message;
      status.className = 'form-status is-' + kind;
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var name = nameInput.value.trim();
      var category = select.value;
      var idea = text.value.trim();

      if (!category) return show('Please choose a feedback category.', 'error');
      if (idea.length < 10) return show('Please write at least 10 characters so your suggestion is clear.', 'error');
      if (idea.length > 1000) return show('Please keep your suggestion under 1000 characters.', 'error');

      var subject = D.feedback.subjectPrefix + ' - ' + category;
      var body = 'Category: ' + category + '\n' +
        (name ? 'Name (optional): ' + name + '\n' : '') +
        '\nSuggestion:\n' + idea + '\n';
      var href = 'mailto:' + D.feedback.email +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(body);

      show('Your email app should open with your suggestion ready to send. This website does not store it. ' +
        'If nothing opens, email ' + D.feedback.email + ' directly.', 'success');
      window.location.href = href;
    });
  }

  function initArticle() {
    var container = document.getElementById('article-root');
    if (!container) return;

    var params = new URLSearchParams(window.location.search);
    var isAnnouncement = params.get('type') === 'announcement';
    var list = isAnnouncement ? D.announcements : D.journey;
    var backAnchor = isAnnouncement ? 'announcements' : 'journey';
    var item = list.find(function (x) { return x.id === params.get('id'); });

    if (!item) {
      container.innerHTML = '<p class="lead">This article could not be found.</p>' +
        '<a class="back-link" href="index.html#' + backAnchor + '"><span>Back to home</span></a>';
      return;
    }

    document.title = item.title + ' | Ikhlas Institution';
    var paragraphs = item.body && item.body.length
      ? item.body.map(function (p) { return '<p>' + T.fmt(p) + '</p>'; }).join('')
      : '<p class="placeholder">Article content to be added.</p>';
    var image = item.video
      ? '<video controls playsinline preload="metadata"' + (item.image ? ' poster="' + T.esc(item.image) + '"' : '') + '>' +
        '<source src="' + T.esc(item.video) + '" type="video/mp4">Your browser cannot play this video.</video>'
      : (item.image ? '<img src="' + T.esc(item.image) + '" alt="' + T.esc(item.title) + '">' : '');

    container.innerHTML =
      '<a class="back-link" href="index.html#' + backAnchor + '"><span>Back</span></a>' +
      '<article class="article">' +
      '<figure class="media ' + (item.video ? 'media--video' : 'media--16x9') + (item.image || item.video ? '' : ' is-missing') + '">' + image +
      '<span class="media__label">Image to be added</span></figure>' +
      '<p class="article__meta"><span class="tag">' + T.esc(item.category) + '</span>' +
      '<span>' + (item.date ? T.esc(item.date) : 'Date to be announced') + '</span></p>' +
      '<h1 class="section-title">' + T.fmt(item.title) + '</h1>' +
      '<p class="lead">' + T.fmt(item.description) + '</p>' +
      '<div class="article__body">' + paragraphs + '</div>' +
      '</article>';
  }

  function init() {
    applyAssets();
    renderLinks();
    initVisits();
    initFeedback();
    initArticle();
    var year = document.getElementById('year');
    if (year) year.textContent = String(new Date().getFullYear());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  ns.features = { init: init };
})(window.Ikhlas);
/* ---- Navigation language switch (nav names only) ---- */
(function () {
  'use strict';
  var NAV_AM = {
    'Home': 'መነሻ',
    'About': 'ስለ እኛ',
    'Sectors': 'ዘርፎች',
    'Journey': 'ጉዞ',
    'Announcements': 'ማስታወቂያዎች',
    'Contact': 'መገናኛ'
  };
  var KEY = 'ikhlas-nav-lang';

  function readLang() {
    try { return localStorage.getItem(KEY) === 'am' ? 'am' : 'en'; } catch (e) { return 'en'; }
  }

  function applyNav(lang) {
    var am = lang === 'am';
    document.querySelectorAll('.nav-link span').forEach(function (el) {
      if (!el.getAttribute('data-en')) el.setAttribute('data-en', el.textContent.trim());
      var en = el.getAttribute('data-en');
      el.textContent = am ? (NAV_AM[en] || en) : en;
    });
    var btn = document.getElementById('nav-lang-btn');
    if (btn) btn.textContent = am ? 'EN' : 'አማ';
  }

  function initNavLang() {
    var controls = document.querySelector('.header-controls');
    if (!controls) return;

    var btn = document.createElement('button');
    btn.id = 'nav-lang-btn';
    btn.type = 'button';
    btn.className = 'control-btn lang-switch';
    btn.setAttribute('aria-label', 'Switch navigation language');

    var visits = controls.querySelector('.visits');
    if (visits) {
      controls.replaceChild(btn, visits);
    } else {
      controls.insertBefore(btn, controls.firstChild);
    }

    btn.addEventListener('click', function () {
      var next = readLang() === 'am' ? 'en' : 'am';
      try { localStorage.setItem(KEY, next); } catch (e) {}
      applyNav(next);
    });

    applyNav(readLang());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavLang);
  } else {
    initNavLang();
  }
})();
/* Videos play one at a time: starting one pauses the others,
   and when one ends, the next video in the list starts. */
(function () {
  'use strict';

  function allVideos() {
    return Array.prototype.slice.call(document.querySelectorAll('video'));
  }

  document.addEventListener('play', function (event) {
    var current = event.target;
    if (!current || current.tagName !== 'VIDEO') return;
    allVideos().forEach(function (video) {
      if (video !== current) video.pause();
    });
  }, true);

  document.addEventListener('ended', function (event) {
    var current = event.target;
    if (!current || current.tagName !== 'VIDEO') return;
    var list = allVideos();
    var next = list[list.indexOf(current) + 1];
    if (next) {
      next.currentTime = 0;
      var started = next.play();
      if (started && started.catch) started.catch(function () {});
    }
  }, true);
})();