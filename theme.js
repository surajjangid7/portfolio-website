(function () {
  function getThemeFromURL() {
    var params = new URLSearchParams(window.location.search);
    return params.get('theme') === 'light' ? 'light' : 'dark';
  }

  var theme = getThemeFromURL();
  document.documentElement.setAttribute('data-theme', theme);

  function syncNavLinks() {
    document.querySelectorAll('a.js-navlink').forEach(function (a) {
      var url = new URL(a.getAttribute('href'), window.location.href);
      url.searchParams.set('theme', theme);
      a.setAttribute('href', url.pathname + url.search);
    });
  }

  function syncToggleLabel() {
    var toggle = document.getElementById('themeToggle');
    if (!toggle) return;
    toggle.setAttribute('aria-pressed', theme === 'light' ? 'true' : 'false');
    toggle.textContent = theme === 'dark' ? '\u263E dark' : '\u2600 light';
  }

  function applyTheme(next) {
    theme = next;
    document.documentElement.setAttribute('data-theme', theme);
    var url = new URL(window.location.href);
    url.searchParams.set('theme', theme);
    window.history.replaceState(null, '', url);
    syncNavLinks();
    syncToggleLabel();
  }

  document.addEventListener('DOMContentLoaded', function () {
    syncNavLinks();
    syncToggleLabel();
    var toggle = document.getElementById('themeToggle');
    if (toggle) {
      toggle.addEventListener('click', function () {
        applyTheme(theme === 'dark' ? 'light' : 'dark');
      });
    }
    var startBtn = document.getElementById('startBtn');
    if (startBtn) {
      var url = new URL(startBtn.getAttribute('href'), window.location.href);
      url.searchParams.set('theme', theme);
      startBtn.setAttribute('href', url.pathname + url.search);
    }

    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* Scroll progress bar */
    var bar = document.getElementById('scrollProgress');
    if (bar) {
      var updateBar = function () {
        var h = document.documentElement;
        var scrolled = h.scrollTop || document.body.scrollTop;
        var height = h.scrollHeight - h.clientHeight;
        var pct = height > 0 ? (scrolled / height) * 100 : 0;
        bar.style.width = pct + '%';
      };
      window.addEventListener('scroll', updateBar, { passive: true });
      updateBar();
    }

    /* Entrance animation for above-the-fold elements */
    var enterEls = document.querySelectorAll('.enter');
    enterEls.forEach(function (el, i) {
      if (reduceMotion) {
        el.classList.add('visible');
      } else {
        el.style.setProperty('--d', (i * 0.08) + 's');
        requestAnimationFrame(function () {
          setTimeout(function () { el.classList.add('visible'); }, 30);
        });
      }
    });

    /* Scroll-triggered reveal */
    var revealEls = document.querySelectorAll('.reveal');
    if (reduceMotion || !('IntersectionObserver' in window)) {
      revealEls.forEach(function (el) { el.classList.add('visible'); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
      revealEls.forEach(function (el, i) {
        el.style.setProperty('--d', Math.min(i * 0.06, 0.4) + 's');
        io.observe(el);
      });
    }
  });
})();
