/* ============================================================
   ALTIRA AI — main.js
   - Scroll reveal (IntersectionObserver)
   - Proof bar counter animation
   - Nav scroll state
   - Hero mouse parallax (subtle)
   - Smooth anchor scroll
   ============================================================ */

(() => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- SCROLL REVEAL ----------
  const revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !prefersReduced) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  // ---------- COUNTERS (count-up + live session tick) ----------
  const counters = document.querySelectorAll('[data-counter]');

  const revealPlus = (el) => {
    // When the counter lands, fade in the adjacent "+" sibling.
    // CSS transitions on max-width + opacity handle the push.
    const plus = el.parentElement && el.parentElement.querySelector('.hero__counter__plus');
    if (plus) setTimeout(() => plus.classList.add('is-visible'), 250);
  };

  const animateCounter = (el) => {
    // 22-second gradual climb to target with gentle smoothstep easing
    // (3t^2 - 2t^3). Soft taper at both ends, steady middle so the
    // count visibly progresses the whole way. Stops at the target —
    // no live tick afterward; the "+" reveals instead to signal "and counting."
    const target = parseFloat(el.dataset.counter);
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    const duration = 22000;
    const startTime = performance.now();
    const smoothstep = (t) => t * t * (3 - 2 * t);

    const isFloat = !Number.isInteger(target);
    const step = (now) => {
      const t = Math.min((now - startTime) / duration, 1);
      const eased = smoothstep(t);
      const val = target * eased;
      el.textContent = prefix + (isFloat ? val.toFixed(1) : Math.round(val).toLocaleString()) + suffix;
      if (t < 1) requestAnimationFrame(step);
      else revealPlus(el);
    };
    requestAnimationFrame(step);
  };

  if ('IntersectionObserver' in window && !prefersReduced) {
    const counterIO = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach((el) => counterIO.observe(el));
  } else {
    counters.forEach((el) => {
      const target = parseFloat(el.dataset.counter);
      const suffix = el.dataset.suffix || '';
      const prefix = el.dataset.prefix || '';
      el.textContent = prefix + target.toLocaleString() + suffix;
    });
  }

  // ---------- NAV SCROLL STATE ----------
  const nav = document.querySelector('.nav');
  if (nav) {
    const onScroll = () => {
      nav.classList.toggle('is-scrolled', window.scrollY > 24);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // ---------- SMOOTH ANCHOR SCROLL (with nav offset) ----------
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      const offset = 80;
      const y = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top: y, behavior: prefersReduced ? 'auto' : 'smooth' });
    });
  });

  // ---------- MAGNETIC CTA BUTTONS ----------
  const magnets = document.querySelectorAll('.btn--primary, .btn--ghost');
  if (!prefersReduced && !('ontouchstart' in window)) {
    magnets.forEach((el) => {
      const pull = 0.25;   // how hard the button follows the cursor (0..1)
      const radius = 120;  // how close cursor must be for the effect
      let raf = null;

      const reset = () => {
        el.style.transform = '';
      };

      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > radius) { reset(); return; }
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          el.style.transform = `translate(${dx * pull}px, ${dy * pull}px)`;
        });
      });
      el.addEventListener('mouseleave', reset);
    });
  }

  // ---------- TILT ON CASE COVERS ----------
  const cases = document.querySelectorAll('.case');
  if (!prefersReduced && !('ontouchstart' in window)) {
    cases.forEach((card) => {
      const cover = card.querySelector('.case__cover img');
      if (!cover) return;
      const max = 6; // max rotation in degrees
      let raf = null;

      card.addEventListener('mouseenter', () => {
        cover.style.transition = 'transform 120ms var(--ease-out)';
      });
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const px = ((e.clientX - rect.left) / rect.width) - 0.5;
        const py = ((e.clientY - rect.top) / rect.height) - 0.5;
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          cover.style.transform =
            `scale(1.04) rotateX(${-py * max}deg) rotateY(${px * max}deg)`;
        });
      });
      card.addEventListener('mouseleave', () => {
        cover.style.transition = '';
        cover.style.transform = '';
      });
    });
  }
})();
