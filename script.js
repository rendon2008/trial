/**
 * ═══════════════════════════════════════════════════════════
 * PITLANE EATS — script.js
 * Animations, interactions, and micro-behaviors
 * ═══════════════════════════════════════════════════════════
 */

'use strict';

/* ─── 1. LOADER ──────────────────────────────────────────── */
const Loader = (() => {
  const el = document.getElementById('loader');
  if (!el) return;

  /**
   * Hide the loader once the page is ready.
   * We wait for the bar animation (≈2s) plus a small buffer.
   */
  const hide = () => {
    el.classList.add('hidden');
    // Remove from DOM after transition
    el.addEventListener('transitionend', () => el.remove(), { once: true });
  };

  if (document.readyState === 'complete') {
    setTimeout(hide, 2200);
  } else {
    window.addEventListener('load', () => setTimeout(hide, 2200));
  }
})();


/* ─── 2. CUSTOM CURSOR ───────────────────────────────────── */
const Cursor = (() => {
  const glow = document.getElementById('cursor-glow');
  const dot  = document.getElementById('cursor-dot');
  if (!glow || !dot) return;

  let mx = 0, my = 0;
  let gx = 0, gy = 0;

  // Dot follows instantly
  document.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });

  // Glow follows with lerp (laggy, luxurious)
  const lerp = (a, b, t) => a + (b - a) * t;

  const animateGlow = () => {
    gx = lerp(gx, mx, 0.08);
    gy = lerp(gy, my, 0.08);
    glow.style.left = gx + 'px';
    glow.style.top  = gy + 'px';
    requestAnimationFrame(animateGlow);
  };
  animateGlow();

  // Hover effect on interactive elements
  const interactiveSelectors = 'a, button, .menu__filter, .reviews__dot, .menu__card, .why__card, .bs__item';
  document.querySelectorAll(interactiveSelectors).forEach(el => {
    el.addEventListener('mouseenter', () => dot.classList.add('hover'));
    el.addEventListener('mouseleave', () => dot.classList.remove('hover'));
  });

  // Hide on leave
  document.addEventListener('mouseleave', () => {
    glow.style.opacity = '0';
    dot.style.opacity  = '0';
  });
  document.addEventListener('mouseenter', () => {
    glow.style.opacity = '1';
    dot.style.opacity  = '1';
  });
})();


/* ─── 3. NAVBAR ──────────────────────────────────────────── */
const Navbar = (() => {
  const nav       = document.getElementById('navbar');
  const burger    = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  const links     = document.querySelectorAll('.navbar__link');
  const sections  = document.querySelectorAll('section[id]');
  if (!nav) return;

  // Scroll class
  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);

    // Active link based on scroll position
    let current = '';
    sections.forEach(sec => {
      const top = sec.offsetTop - 120;
      if (window.scrollY >= top) current = sec.id;
    });
    links.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Hamburger toggle
  if (burger && mobileMenu) {
    burger.addEventListener('click', () => {
      const open = burger.classList.toggle('open');
      mobileMenu.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', open.toString());
    });

    // Close on mobile link click
    mobileMenu.querySelectorAll('.navbar__mobile-link').forEach(link => {
      link.addEventListener('click', () => {
        burger.classList.remove('open');
        mobileMenu.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
  }
})();


/* ─── 4. CUSTOM SMOOTH SCROLL ────────────────────────────── */
const SmoothScroll = (() => {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();

      const navH   = document.getElementById('navbar')?.offsetHeight || 0;
      const top    = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();


/* ─── 5. HERO CANVAS — PARTICLES ─────────────────────────── */
const HeroCanvas = (() => {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, particles = [];
  const COUNT = 80;

  const resize = () => {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  };
  window.addEventListener('resize', resize, { passive: true });
  resize();

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x    = Math.random() * W;
      this.y    = Math.random() * H;
      this.r    = Math.random() * 1.5 + 0.3;
      this.vx   = (Math.random() - 0.5) * 0.4;
      this.vy   = -Math.random() * 0.6 - 0.1;
      this.life = 0;
      this.maxLife = Math.random() * 300 + 200;
      this.red  = Math.random() > 0.85; // 15% are red
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.life++;
      if (this.life > this.maxLife || this.y < -10) this.reset();
    }
    draw() {
      const progress = this.life / this.maxLife;
      const alpha    = Math.sin(progress * Math.PI) * 0.7;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = this.red
        ? `rgba(225, 6, 0, ${alpha})`
        : `rgba(255, 255, 255, ${alpha * 0.4})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < COUNT; i++) {
    const p = new Particle();
    p.life = Math.floor(Math.random() * p.maxLife); // stagger initial state
    particles.push(p);
  }

  // Subtle grid lines — speed / data aesthetic
  const drawGrid = () => {
    ctx.strokeStyle = 'rgba(255,255,255,0.02)';
    ctx.lineWidth   = 1;
    const step      = 80;
    for (let x = 0; x < W; x += step) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += step) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
  };

  const animate = () => {
    ctx.clearRect(0, 0, W, H);
    drawGrid();
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animate);
  };
  animate();
})();


/* ─── 6. SCROLL REVEAL ───────────────────────────────────── */
const ScrollReveal = (() => {
  const targets = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
  if (!targets.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target); // fire once
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  targets.forEach(t => obs.observe(t));
})();


/* ─── 7. NUMBER COUNTING ANIMATION ──────────────────────── */
const CountUp = (() => {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const format = (n) => {
    if (n >= 1000) return n.toLocaleString('en-US');
    return n;
  };

  const animateCount = (el) => {
    const target   = parseInt(el.dataset.count, 10);
    const duration = 1800;
    const start    = performance.now();

    const step = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = format(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => obs.observe(c));
})();


/* ─── 8. CARD TILT EFFECT ────────────────────────────────── */
const CardTilt = (() => {
  const cards = document.querySelectorAll('.card-tilt');
  const MAX_TILT = 8; // degrees

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const cx   = rect.left + rect.width  / 2;
      const cy   = rect.top  + rect.height / 2;
      const dx   = (e.clientX - cx) / (rect.width  / 2);
      const dy   = (e.clientY - cy) / (rect.height / 2);

      card.style.transform =
        `perspective(800px) rotateX(${-dy * MAX_TILT}deg) rotateY(${dx * MAX_TILT}deg) scale3d(1.02,1.02,1.02)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale3d(1,1,1)';
    });
  });
})();


/* ─── 9. MENU CATEGORY FILTER ────────────────────────────── */
const MenuFilter = (() => {
  const filters = document.querySelectorAll('.menu__filter');
  const cards   = document.querySelectorAll('.menu__card');
  if (!filters.length || !cards.length) return;

  const filter = (category) => {
    cards.forEach(card => {
      const cat  = card.dataset.category;
      const show = category === 'all' || cat === category;

      if (show) {
        card.classList.remove('hidden');
        // Stagger re-entry
        card.style.animation = 'none';
        card.offsetHeight; // reflow
        card.style.animation = '';
      } else {
        card.classList.add('hidden');
      }
    });
  };

  filters.forEach(btn => {
    btn.addEventListener('click', () => {
      filters.forEach(f => {
        f.classList.remove('active');
        f.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      filter(btn.dataset.filter);
    });
  });
})();


/* ─── 10. REVIEWS CAROUSEL ───────────────────────────────── */
const ReviewsCarousel = (() => {
  const track  = document.getElementById('reviews-track');
  const dots   = document.querySelectorAll('.reviews__dot');
  if (!track || !dots.length) return;

  const cards     = track.querySelectorAll('.reviews__card');
  const cardCount = cards.length;
  let current     = 0;
  let autoTimer   = null;
  let perView     = 3;

  const getPerView = () => {
    if (window.innerWidth <= 640)  return 1;
    if (window.innerWidth <= 1024) return 2;
    return 3;
  };

  const maxIndex = () => Math.max(0, cardCount - perView);

  const go = (index) => {
    perView   = getPerView();
    const max = maxIndex();
    current   = Math.max(0, Math.min(index, max));

    // Card width + gap
    const cardEl  = cards[0];
    const gap     = 16; // --gap-sm
    const offset  = current * (cardEl.offsetWidth + gap);
    track.style.transform = `translateX(-${offset}px)`;

    // Update dots (map to 3 states proportionally)
    const dotIndex = Math.round((current / max) * (dots.length - 1));
    dots.forEach((d, i) => {
      d.classList.toggle('active', i === dotIndex);
      d.setAttribute('aria-selected', (i === dotIndex).toString());
    });
  };

  // Dots
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      const max    = maxIndex();
      const target = Math.round((i / (dots.length - 1)) * max);
      go(target);
      resetAuto();
    });
  });

  // Auto-advance
  const advance = () => {
    const max = maxIndex();
    go(current >= max ? 0 : current + 1);
  };

  const startAuto = () => { autoTimer = setInterval(advance, 4000); };
  const resetAuto = () => { clearInterval(autoTimer); startAuto(); };
  startAuto();

  // Touch/drag
  let startX = 0, dragging = false;
  track.addEventListener('touchstart', (e) => {
    startX   = e.touches[0].clientX;
    dragging = true;
  }, { passive: true });
  track.addEventListener('touchend', (e) => {
    if (!dragging) return;
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 50) {
      go(dx < 0 ? current + 1 : current - 1);
      resetAuto();
    }
    dragging = false;
  }, { passive: true });

  // Recalculate on resize
  window.addEventListener('resize', () => go(current), { passive: true });
  go(0);
})();


/* ─── 11. PARALLAX (HERO IMAGE) ──────────────────────────── */
const Parallax = (() => {
  const img = document.querySelector('.hero__image');
  if (!img) return;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      img.style.transform = `translateY(${y * 0.12}px)`;
      ticking = false;
    });
    ticking = true;
  }, { passive: true });
})();


/* ─── 12. SECTION TRANSITION ACCENT LINE ─────────────────── */
const AccentLine = (() => {
  /**
   * As the user scrolls past section boundaries,
   * a brief red flash appears at the top of the viewport.
   */
  const indicator = document.createElement('div');
  indicator.style.cssText = `
    position: fixed;
    top: 0; left: 0;
    width: 0;
    height: 2px;
    background: #E10600;
    box-shadow: 0 0 12px rgba(225,6,0,0.8);
    z-index: 9998;
    transition: width 0.4s cubic-bezier(0.23,1,0.32,1), opacity 0.4s;
    opacity: 0;
    pointer-events: none;
  `;
  document.body.appendChild(indicator);

  const docH    = () => document.documentElement.scrollHeight - window.innerHeight;
  const onScroll = () => {
    const pct = (window.scrollY / docH()) * 100;
    indicator.style.width   = pct + '%';
    indicator.style.opacity = '1';
  };
  window.addEventListener('scroll', onScroll, { passive: true });
})();


/* ─── 13. BUTTON RIPPLE ──────────────────────────────────── */
const Ripple = (() => {
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const rect   = btn.getBoundingClientRect();
      const x      = e.clientX - rect.left;
      const y      = e.clientY - rect.top;
      const ripple = document.createElement('span');

      ripple.style.cssText = `
        position: absolute;
        left: ${x}px; top: ${y}px;
        transform: translate(-50%, -50%) scale(0);
        width: 200px; height: 200px;
        border-radius: 50%;
        background: rgba(255,255,255,0.15);
        pointer-events: none;
        animation: ripple-anim 0.5s ease forwards;
      `;
      btn.style.position = 'relative';
      btn.style.overflow = 'hidden';
      btn.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    });
  });

  // Inject ripple keyframes once
  const style = document.createElement('style');
  style.textContent = `
    @keyframes ripple-anim {
      to { transform: translate(-50%,-50%) scale(3); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
})();


/* ─── 14. FLOATING FOOD IMAGE STAGGER ───────────────────── */
const FloatStagger = (() => {
  /**
   * Give each floating image a different animation offset
   * so they don't all move in sync (looks cheap).
   */
  document.querySelectorAll('.float-anim').forEach((el, i) => {
    el.style.animationDelay    = `${i * 0.4}s`;
    el.style.animationDuration = `${3.5 + (i % 4) * 0.5}s`;
  });
})();


/* ─── 15. MICRO-INTERACTION: PRICE HOVER HIGHLIGHT ─────── */
const PriceHover = (() => {
  document.querySelectorAll('.menu__card').forEach(card => {
    const price = card.querySelector('.menu__card-price');
    card.addEventListener('mouseenter', () => {
      if (price) price.style.textShadow = '0 0 20px rgba(225,6,0,0.6)';
    });
    card.addEventListener('mouseleave', () => {
      if (price) price.style.textShadow = 'none';
    });
  });
})();


/* ─── 16. ACTIVE NAV HIGHLIGHT ON SECTION ENTER ─────────── */
// Already handled in Navbar scroll listener above.
// This ensures sections marked `id` show correct nav link.


/* ─── 17. HERO BADGE ENTRANCE ───────────────────────────── */
const BadgeEntrance = (() => {
  const badge = document.querySelector('.hero__image-badge');
  if (!badge) return;

  // Animate in after loader hides
  setTimeout(() => {
    badge.style.transition = 'transform 0.6s cubic-bezier(0.34,1.56,0.64,1), opacity 0.4s';
    badge.style.opacity    = '1';
    badge.style.transform  = 'scale(1)';
  }, 2600);

  badge.style.opacity   = '0';
  badge.style.transform = 'scale(0.5)';
})();


/* ─── 18. PERFORMANCE: PAUSE ANIMATIONS OFFSCREEN ──────── */
const VisibilityPause = (() => {
  document.addEventListener('visibilitychange', () => {
    const floaters = document.querySelectorAll('.float-anim');
    floaters.forEach(el => {
      el.style.animationPlayState = document.hidden ? 'paused' : 'running';
    });
  });
})();


/* ─── INIT LOG ───────────────────────────────────────────── */
console.log('%c PITLANE EATS ', 'background:#E10600;color:#fff;font-size:14px;font-weight:900;letter-spacing:4px;padding:6px 12px;');
console.log('%c All systems go. ', 'color:#888;font-size:11px;');
