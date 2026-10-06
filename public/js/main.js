document.addEventListener('DOMContentLoaded', function () {
  // ===== Mobile slide menu =====
  const hamb = document.getElementById('hamb');
  const slideMenu = document.getElementById('slideMenu');
  const slideOverlay = document.getElementById('slideOverlay');
  const slideClose = document.getElementById('slideClose');
  const body = document.body;

  function openMenu() {
    if (!slideMenu) return;
    slideMenu.classList.add('open');
    slideOverlay.classList.add('open');
    hamb.classList.add('active');
    hamb.setAttribute('aria-expanded', 'true');
    body.classList.add('menu-open');
  }

  function closeMenu() {
    if (!slideMenu) return;
    slideMenu.classList.remove('open');
    slideOverlay.classList.remove('open');
    hamb.classList.remove('active');
    hamb.setAttribute('aria-expanded', 'false');
    body.classList.remove('menu-open');
  }

  if (hamb && slideMenu) {
    hamb.addEventListener('click', openMenu);
  }

  if (slideClose) {
    slideClose.addEventListener('click', closeMenu);
  }

  if (slideOverlay) {
    slideOverlay.addEventListener('click', closeMenu);
  }

  if (slideMenu) {
    slideMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });
  }

  // Close menu on Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && slideMenu && slideMenu.classList.contains('open')) {
      closeMenu();
    }
  });

  // ===== Header scroll shadow =====
  const header = document.getElementById('siteHeader');
  const backToTop = document.getElementById('backToTop');

  window.addEventListener('scroll', function () {
    const scrolled = window.scrollY > 10;
    if (header) {
      header.classList.toggle('scrolled', scrolled);
    }
    if (backToTop) {
      backToTop.classList.toggle('show', window.scrollY > 500);
    }
  });

  // ===== Back to top =====
  if (backToTop) {
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ===== Services carousel =====
  const track = document.getElementById('track');
  const prev = document.getElementById('prev');
  const next = document.getElementById('next');

  if (track && prev && next) {
    prev.addEventListener('click', function () {
      track.scrollBy({ left: -330, behavior: 'smooth' });
    });
    next.addEventListener('click', function () {
      track.scrollBy({ left: 330, behavior: 'smooth' });
    });
  }

  // ===== Scroll reveal animations =====
  const revealElements = document.querySelectorAll('[data-reveal]');

  if ('IntersectionObserver' in window && revealElements.length > 0) {
    const revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

    revealElements.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    // Fallback: just reveal everything
    revealElements.forEach(function (el) {
      el.classList.add('revealed');
    });
  }

  // ===== Animated stat counters =====
  const counters = document.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window && counters.length > 0) {
    const counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(function (el) {
      counterObserver.observe(el);
    });
  }

  function animateCounter(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var suffix = el.getAttribute('data-suffix') || '';
    var duration = 1800;
    var startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      var easeOut = 1 - Math.pow(1 - progress, 3);
      var current = target * easeOut;

      if (target % 1 !== 0) {
        el.textContent = current.toFixed(1) + suffix;
      } else {
        el.textContent = Math.floor(current) + suffix;
      }

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target + suffix;
      }
    }

    requestAnimationFrame(step);
  }

  // ===== Smooth anchor scrolling =====
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href');
      if (targetId === '#' || targetId === '#contact' && this.closest('.footer-cta')) return;
      var target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        var headerHeight = header ? header.offsetHeight : 0;
        var top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 20;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });

  // ===== FAQ Accordion =====
  var faqButtons = document.querySelectorAll('.faq-q');
  if (faqButtons.length > 0) {
    faqButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var item = this.parentElement;
        var isActive = item.classList.contains('active');

        // Close all other items and reset their height
        document.querySelectorAll('.faq-item').forEach(function (other) {
          if (other === item) return;
          other.classList.remove('active');
          var otherBtn = other.querySelector('.faq-q');
          var otherAns = other.querySelector('.faq-a');
          if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
          if (otherAns) otherAns.style.maxHeight = '';
        });

        var answer = item.querySelector('.faq-a');

        // Toggle current item with an accurate, animated height
        if (!isActive) {
          item.classList.add('active');
          this.setAttribute('aria-expanded', 'true');
          if (answer) answer.style.maxHeight = answer.scrollHeight + 'px';
        } else {
          item.classList.remove('active');
          this.setAttribute('aria-expanded', 'false');
          if (answer) answer.style.maxHeight = '';
        }
      });
    });

    // Keep an open answer correctly sized when the viewport changes
    window.addEventListener('resize', function () {
      var open = document.querySelector('.faq-item.active .faq-a');
      if (open) open.style.maxHeight = open.scrollHeight + 'px';
    });
  }

  // ===== Contact form result state =====
  // On static hosting the POST is handled by a Pages Function which redirects
  // back with ?submitted=1 (success) or ?error=1 (failure).
  var contactSuccess = document.getElementById('contactSuccess');
  var contactError = document.getElementById('contactError');
  var contactFormWrap = document.getElementById('contactFormWrap');

  if (contactSuccess && contactFormWrap) {
    var params = new URLSearchParams(window.location.search);
    if (params.has('submitted') || params.has('error')) {
      contactFormWrap.hidden = true;
      if (params.has('error') && contactError) {
        contactError.hidden = false;
      } else {
        contactSuccess.hidden = false;
      }
      if (window.history.replaceState) {
        window.history.replaceState(null, '', window.location.pathname);
      }
    }
  }
});
