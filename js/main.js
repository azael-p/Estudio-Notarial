/* ═══════════════════════════════════════════════════════════
   ESCRIBANA MACÍAS — Main JS v2
   ═══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  // ── Inicializar Lucide Icons ──────────────────────────────
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // ── Referencias DOM ────────────────────────────────────────
  const navbar    = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navMenu   = document.getElementById('navMenu');
  const navLinks  = navMenu.querySelectorAll('a');

  // ── Reviews Carousel ──────────────────────────────────────
  const reviewsCarousel = document.getElementById('reviewsCarousel');
  const reviewsWindow   = reviewsCarousel.querySelector('.reviews-carousel__window');
  const reviewsTrack    = document.getElementById('reviewsTrack');
  const reviewsPrev     = document.getElementById('reviewsPrev');
  const reviewsNext     = document.getElementById('reviewsNext');
  const reviewCards     = reviewsTrack.querySelectorAll('.review-card');
  const totalReviews    = reviewCards.length;

  let reviewIndex       = 0;
  let reviewCardStep    = 0;
  let reviewsPerView    = 3;
  let reviewAutoplay    = null;
  let reviewResizeTimer = null;

  // ──────────────────────────────────────────────────────────
  // 1. HERO PARTICLES
  // ──────────────────────────────────────────────────────────
  const particleContainer = document.getElementById('heroParticles');
  if (particleContainer) {
    const particleData = [
      { size: 6,  x: 8,  y: 15, dur: 7,  delay: 0,   opMin: 0.10, opMax: 0.35 },
      { size: 4,  x: 22, y: 72, dur: 9,  delay: 1,   opMin: 0.12, opMax: 0.30 },
      { size: 8,  x: 38, y: 28, dur: 11, delay: 0.5, opMin: 0.08, opMax: 0.25 },
      { size: 5,  x: 55, y: 85, dur: 8,  delay: 2,   opMin: 0.15, opMax: 0.40 },
      { size: 10, x: 70, y: 20, dur: 13, delay: 0.8, opMin: 0.06, opMax: 0.22 },
      { size: 4,  x: 82, y: 60, dur: 7,  delay: 1.5, opMin: 0.12, opMax: 0.35 },
      { size: 6,  x: 92, y: 40, dur: 10, delay: 3,   opMin: 0.10, opMax: 0.30 },
      { size: 3,  x: 15, y: 50, dur: 6,  delay: 0.3, opMin: 0.18, opMax: 0.45 },
      { size: 7,  x: 48, y: 65, dur: 12, delay: 2.2, opMin: 0.08, opMax: 0.28 },
      { size: 5,  x: 63, y: 45, dur: 8,  delay: 1.8, opMin: 0.14, opMax: 0.38 },
      { size: 9,  x: 30, y: 88, dur: 14, delay: 0.7, opMin: 0.07, opMax: 0.20 },
      { size: 4,  x: 78, y: 78, dur: 9,  delay: 2.5, opMin: 0.13, opMax: 0.32 },
      { size: 6,  x: 5,  y: 90, dur: 7,  delay: 1.2, opMin: 0.10, opMax: 0.28 },
      { size: 3,  x: 90, y: 10, dur: 8,  delay: 3.5, opMin: 0.16, opMax: 0.42 },
    ];

    particleData.forEach(p => {
      const el = document.createElement('div');
      el.className = 'hero__particle';
      el.style.cssText = `
        width: ${p.size}px;
        height: ${p.size}px;
        left: ${p.x}%;
        top: ${p.y}%;
        --dur: ${p.dur}s;
        --delay: ${p.delay}s;
        --op-min: ${p.opMin};
        --op-max: ${p.opMax};
      `;
      particleContainer.appendChild(el);
    });
  }

  // ──────────────────────────────────────────────────────────
  // 2. NAVBAR — sticky + scroll effect
  // ──────────────────────────────────────────────────────────
  function handleNavbarScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  }

  window.addEventListener('scroll', handleNavbarScroll, { passive: true });
  handleNavbarScroll();

  // ──────────────────────────────────────────────────────────
  // 3. MOBILE MENU — hamburger toggle
  // ──────────────────────────────────────────────────────────
  function openMenu() {
    hamburger.classList.add('open');
    navMenu.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    hamburger.classList.remove('open');
    navMenu.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', () => {
    hamburger.classList.contains('open') ? closeMenu() : openMenu();
  });

  navLinks.forEach(link => link.addEventListener('click', closeMenu));

  document.addEventListener('click', (e) => {
    if (
      navMenu.classList.contains('open') &&
      !navMenu.contains(e.target) &&
      !hamburger.contains(e.target)
    ) {
      closeMenu();
    }
  });

  // ──────────────────────────────────────────────────────────
  // 4. SMOOTH SCROLL (fallback)
  // ──────────────────────────────────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - navbar.offsetHeight;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  // ──────────────────────────────────────────────────────────
  // 5. REVIEWS CAROUSEL — multi-card, responsive, autoplay
  // ──────────────────────────────────────────────────────────
  function getReviewsPerView() {
    const w = window.innerWidth;
    if (w <= 640) return 1;
    if (w <= 900) return 2;
    return 3;
  }

  function initReviewsCarousel() {
    reviewsPerView = getReviewsPerView();
    const gap = 20;
    const containerWidth = reviewsWindow.offsetWidth;
    const cardWidth = Math.floor((containerWidth - gap * (reviewsPerView - 1)) / reviewsPerView);

    reviewCardStep = cardWidth + gap;

    reviewCards.forEach(card => {
      card.style.width = cardWidth + 'px';
    });

    const maxIdx = Math.max(0, totalReviews - reviewsPerView);
    if (reviewIndex > maxIdx) reviewIndex = maxIdx;

    reviewsTrack.style.transition = 'none';
    reviewsTrack.style.transform = `translateX(-${reviewIndex * reviewCardStep}px)`;

    requestAnimationFrame(() => {
      reviewsTrack.style.transition = '';
    });

    updateReviewButtons();
    updateReviewCounter();

    if (reviewsPerView === 1) {
      requestAnimationFrame(() => {
        const h = reviewCards[reviewIndex] ? reviewCards[reviewIndex].offsetHeight : 0;
        if (h > 0) reviewsWindow.style.height = h + 'px';
      });
    } else {
      reviewsWindow.style.height = '';
    }
  }

  function updateReviewButtons() {
    const maxIdx = Math.max(0, totalReviews - reviewsPerView);
    reviewsPrev.style.opacity = reviewIndex <= 0 ? '0.35' : '1';
    reviewsPrev.style.pointerEvents = reviewIndex <= 0 ? 'none' : 'auto';
    reviewsNext.style.opacity = reviewIndex >= maxIdx ? '0.35' : '1';
    reviewsNext.style.pointerEvents = reviewIndex >= maxIdx ? 'none' : 'auto';
  }

  function updateReviewCounter() {
    const counter = document.getElementById('reviewsCounter');
    if (counter) {
      counter.textContent = `${reviewIndex + 1} / ${totalReviews}`;
    }
  }

  function updateReviewWindowHeight() {
    if (reviewsPerView !== 1) {
      reviewsWindow.style.height = '';
      return;
    }
    requestAnimationFrame(() => {
      const h = reviewCards[reviewIndex] ? reviewCards[reviewIndex].offsetHeight : 0;
      if (h > 0) reviewsWindow.style.height = h + 'px';
    });
  }

  function goToReview(index) {
    const maxIdx = Math.max(0, totalReviews - reviewsPerView);
    reviewIndex = Math.max(0, Math.min(index, maxIdx));
    reviewsTrack.style.transform = `translateX(-${reviewIndex * reviewCardStep}px)`;
    updateReviewButtons();
    updateReviewCounter();
    updateReviewWindowHeight();
  }

  function nextReview() { goToReview(reviewIndex + 1); }
  function prevReview() { goToReview(reviewIndex - 1); }

  reviewsNext.addEventListener('click', () => { nextReview(); resetReviewAutoplay(); });
  reviewsPrev.addEventListener('click', () => { prevReview(); resetReviewAutoplay(); });

  function startReviewAutoplay() {
    stopReviewAutoplay();
    reviewAutoplay = setInterval(() => {
      const maxIdx = Math.max(0, totalReviews - reviewsPerView);
      if (reviewIndex >= maxIdx) {
        goToReview(0);
      } else {
        nextReview();
      }
    }, 4500);
  }

  function stopReviewAutoplay()  { clearInterval(reviewAutoplay); }
  function resetReviewAutoplay() { startReviewAutoplay(); }

  // Touch swipe support
  let touchStartX = 0;

  reviewsTrack.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  reviewsTrack.addEventListener('touchend', (e) => {
    const delta = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 50) {
      delta > 0 ? nextReview() : prevReview();
      resetReviewAutoplay();
    }
  }, { passive: true });

  reviewsCarousel.addEventListener('mouseenter', stopReviewAutoplay);
  reviewsCarousel.addEventListener('mouseleave', startReviewAutoplay);

  window.addEventListener('resize', () => {
    clearTimeout(reviewResizeTimer);
    reviewResizeTimer = setTimeout(initReviewsCarousel, 150);
  });

  initReviewsCarousel();
  startReviewAutoplay();

  // ──────────────────────────────────────────────────────────
  // 6. REVEAL ANIMATIONS — enhanced IntersectionObserver
  // ──────────────────────────────────────────────────────────
  const ANIM_CLASSES = ['reveal', 'reveal-left', 'reveal-scale', 'fade-in'];

  // Gather all animated elements
  const animatedEls = document.querySelectorAll(ANIM_CLASSES.map(c => '.' + c).join(', '));

  // Apply staggered delays within sibling groups
  const serviceCards   = document.querySelectorAll('.services__grid .service-card');
  const contactCards   = document.querySelectorAll('.contact__actions .contact-card');

  serviceCards.forEach((el, i) => {
    el.style.transitionDelay = `${i * 0.08}s`;
  });

  contactCards.forEach((el, i) => {
    el.style.transitionDelay = `${i * 0.10}s`;
  });

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target); // one-shot
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );

  animatedEls.forEach(el => revealObserver.observe(el));

});
