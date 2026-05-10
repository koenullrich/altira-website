/* ============================================================
   ALTIRA AI — main.js
   - Autonomous massive constellation (extends beyond viewport,
     drifts and pulses on its own — NO cursor reactivity)
   - Scroll reveal
   - Hero counter
   - Nav scroll state
   - Smooth anchor scroll
   ============================================================ */

(() => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ───────── AUTONOMOUS CONSTELLATION ─────────
     Canvas extends 25% beyond the viewport on every side, so the
     network feels bigger than the page. Particles drift on their own.
     Lines connect particles based on their proximity to each other.
     Periodic "pulses" travel through the network, briefly lighting
     up nearby nodes — suggests the system is working in the
     background. NO cursor reactivity. */
  const canvas = document.getElementById('constellation');
  if (canvas && !prefersReduced) {
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    /* Canvas spans 150% of viewport in each axis (positioned at -25%) */
    const SCALE_X = 1.5, SCALE_Y = 1.5;
    let W = 0, H = 0;

    function resize() {
      W = window.innerWidth * SCALE_X;
      H = window.innerHeight * SCALE_Y;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    }
    resize();
    window.addEventListener('resize', resize);

    /* Density scales with area */
    const N = Math.max(120, Math.min(280, Math.round((W * H) / 12000)));
    const points = Array.from({ length: N }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      phase: Math.random() * Math.PI * 2,
      speed: 0.4 + Math.random() * 0.6,
    }));

    const LINK_DIST = 130;

    /* Pulses — periodic energy bursts */
    const pulses = [];
    function spawnPulse() {
      const seed = points[Math.floor(Math.random() * points.length)];
      pulses.push({
        x: seed.x, y: seed.y,
        r: 0,
        maxR: 240 + Math.random() * 220,
        life: 0,
        maxLife: 1100 + Math.random() * 700,
      });
      setTimeout(spawnPulse, 1600 + Math.random() * 4400);
    }
    setTimeout(spawnPulse, 1000);

    let last = performance.now();
    function tick(now) {
      const dt = Math.min(40, now - last);
      last = now;
      ctx.clearRect(0, 0, W, H);

      /* drift */
      for (const p of points) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
      }

      /* pulses */
      for (let i = pulses.length - 1; i >= 0; i--) {
        const pl = pulses[i];
        pl.life += dt;
        pl.r = (pl.life / pl.maxLife) * pl.maxR;
        if (pl.life > pl.maxLife) pulses.splice(i, 1);
      }

      /* links */
      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const a = points[i], b = points[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < LINK_DIST) {
            let alpha = (1 - d / LINK_DIST) * 0.20;
            let glow = 0;
            const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
            for (const pl of pulses) {
              const pd = Math.hypot(mx - pl.x, my - pl.y);
              if (pd < pl.r && pd > pl.r - 60) {
                const ring = 1 - Math.abs(pd - pl.r + 30) / 30;
                const fade = 1 - pl.life / pl.maxLife;
                glow = Math.max(glow, ring * fade * 0.85);
              }
            }
            const finalA = Math.min(0.85, alpha + glow);
            if (finalA > 0.02) {
              ctx.strokeStyle = glow > 0.05
                ? `rgba(201, 177, 127, ${finalA})`
                : `rgba(255, 255, 255, ${finalA * 0.55})`;
              ctx.lineWidth = 0.55;
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.stroke();
            }
          }
        }
      }

      /* nodes */
      const t = now / 1000;
      for (const p of points) {
        const breath = 0.3 + 0.25 * Math.sin(t * p.speed + p.phase);
        let nodeBoost = 0;
        for (const pl of pulses) {
          const pd = Math.hypot(p.x - pl.x, p.y - pl.y);
          if (pd < pl.r && pd > pl.r - 50) {
            const ring = 1 - Math.abs(pd - pl.r + 25) / 25;
            const fade = 1 - pl.life / pl.maxLife;
            nodeBoost = Math.max(nodeBoost, ring * fade);
          }
        }
        const radius = 0.7 + breath * 0.4 + nodeBoost * 1.6;
        if (nodeBoost > 0.1) {
          ctx.fillStyle = `rgba(201, 177, 127, ${0.6 + nodeBoost * 0.35})`;
        } else {
          ctx.fillStyle = `rgba(255, 255, 255, ${0.10 + breath * 0.18})`;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ───────── SCROLL REVEAL ───────── */
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

  /* ───────── HERO COUNTER ───────── */
  const counters = document.querySelectorAll('[data-counter]');
  const revealPlus = (el) => {
    const plus = el.parentElement && el.parentElement.querySelector('.hero__counter__plus');
    if (plus) setTimeout(() => plus.classList.add('is-visible'), 200);
  };
  const animateCounter = (el) => {
    const target = parseFloat(el.dataset.counter);
    const duration = 2400;
    const startTime = performance.now();
    const ease = (t) => 1 - Math.pow(1 - t, 3);
    const isFloat = !Number.isInteger(target);
    const step = (now) => {
      const t = Math.min((now - startTime) / duration, 1);
      const eased = ease(t);
      const val = target * eased;
      el.textContent = isFloat ? val.toFixed(1) : Math.round(val).toLocaleString();
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
    }, { threshold: 0.5 });
    counters.forEach((el) => counterIO.observe(el));
  } else {
    counters.forEach((el) => {
      el.textContent = parseFloat(el.dataset.counter).toLocaleString();
    });
  }

  /* ───────── NAV SCROLL STATE ───────── */
  const nav = document.querySelector('.nav');
  if (nav) {
    const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ───────── SMOOTH ANCHOR ───────── */
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const offset = 80;
      const y = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top: y, behavior: prefersReduced ? 'auto' : 'smooth' });
    });
  });
})();
