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

  function syncToggleIcon() {
    var toggle = document.getElementById('themeToggle');
    if (!toggle) return;
    var sunSVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>';
    var moonSVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z"/></svg>';
    toggle.setAttribute('aria-pressed', theme === 'light' ? 'true' : 'false');
    toggle.innerHTML = theme === 'dark' ? sunSVG : moonSVG;
    toggle.setAttribute('data-tip', theme === 'dark' ? 'Light mode' : 'Dark mode');
  }

  function applyTheme(next) {
    theme = next;
    document.documentElement.setAttribute('data-theme', theme);
    var url = new URL(window.location.href);
    url.searchParams.set('theme', theme);
    window.history.replaceState(null, '', url);
    syncNavLinks();
    syncToggleIcon();
  }

  document.addEventListener('DOMContentLoaded', function () {
    syncNavLinks();
    syncToggleIcon();
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
    var updateOnScroll = function () {
      if (!bar) return;
      var h = document.documentElement;
      var scrolled = h.scrollTop || document.body.scrollTop;
      var height = h.scrollHeight - h.clientHeight;
      var pct = height > 0 ? (scrolled / height) * 100 : 0;
      bar.style.width = pct + '%';
    };
    window.addEventListener('scroll', updateOnScroll, { passive: true });
    updateOnScroll();

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

    /* Back to top */
    var backToTop = document.getElementById('backToTop');
    if (backToTop) {
      backToTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
      });
    }

    initTechSphere(reduceMotion);
    initCursorEffect(reduceMotion);
  });

  /* ===== Rotating tech sphere ===== */
  function initTechSphere(reduceMotion) {
    var wrap = document.querySelector('.tech-sphere-wrap');
    var sphere = document.querySelector('.tech-sphere');
    if (!wrap || !sphere) return;

    var nodes = sphere.querySelectorAll('.tech-node');
    var n = nodes.length;
    var radius = sphere.offsetWidth / 2 || 130;
    var golden = Math.PI * (3 - Math.sqrt(5));

    nodes.forEach(function (node, i) {
      var y = n > 1 ? 1 - (i / (n - 1)) * 2 : 0;
      var r = Math.sqrt(Math.max(0, 1 - y * y));
      var theta = golden * i;
      var x = Math.cos(theta) * r;
      var z = Math.sin(theta) * r;
      node.style.transform =
        'translate3d(' + (x * radius).toFixed(1) + 'px,' +
        (y * radius).toFixed(1) + 'px,' +
        (z * radius).toFixed(1) + 'px)';
    });

    var rotY = 0;
    var rotX = -10;
    var targetTiltX = -10;
    var targetTiltY = 0;
    var autoSpeed = reduceMotion ? 0 : 0.18;

    function frame() {
      rotY += autoSpeed;
      rotX += (targetTiltX - rotX) * 0.06;
      sphere.style.transform = 'rotateX(' + rotX.toFixed(2) + 'deg) rotateY(' + (rotY + targetTiltY).toFixed(2) + 'deg)';
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);

    wrap.addEventListener('mousemove', function (e) {
      var rect = wrap.getBoundingClientRect();
      var relX = (e.clientX - rect.left) / rect.width - 0.5;
      var relY = (e.clientY - rect.top) / rect.height - 0.5;
      targetTiltY = relX * 50;
      targetTiltX = -10 - relY * 34;
    });
    wrap.addEventListener('mouseleave', function () {
      targetTiltX = -10;
      targetTiltY = 0;
    });
    wrap.addEventListener('touchmove', function (e) {
      if (!e.touches || !e.touches[0]) return;
      var rect = wrap.getBoundingClientRect();
      var relX = (e.touches[0].clientX - rect.left) / rect.width - 0.5;
      targetTiltY = relX * 50;
    }, { passive: true });
  }

  /* ===== Custom cursor glow ===== */
  function initCursorEffect(reduceMotion) {
    if (reduceMotion) return;
    if (window.matchMedia('(hover: none), (pointer: coarse)').matches) return;

    var ring = document.createElement('div');
    ring.className = 'cursor-ring';
    var dot = document.createElement('div');
    dot.className = 'cursor-dot';
    document.body.appendChild(ring);
    document.body.appendChild(dot);

    var mouseX = 0, mouseY = 0, ringX = 0, ringY = 0, started = false;

    document.addEventListener('mousemove', function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.left = mouseX + 'px';
      dot.style.top = mouseY + 'px';
      if (!started) {
        started = true;
        ringX = mouseX;
        ringY = mouseY;
      }
      ring.classList.add('active');
      dot.classList.add('active');
    });
    document.addEventListener('mouseleave', function () {
      ring.classList.remove('active');
      dot.classList.remove('active');
    });

    function raf() {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      ring.style.left = ringX + 'px';
      ring.style.top = ringY + 'px';
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    var hoverSelector = 'a, button, .tech-node, .dot-tag, .tag, .project-card, .focus-card, .contact-card';
    document.querySelectorAll(hoverSelector).forEach(function (el) {
      el.addEventListener('mouseenter', function () { ring.classList.add('grow'); });
      el.addEventListener('mouseleave', function () { ring.classList.remove('grow'); });
    });
  }
})();