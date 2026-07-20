document.addEventListener('DOMContentLoaded', () => {

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ============================================================
  //  YEARS OF EXPERIENCE
  // ============================================================
  const FOUNDED = 1997;
  const years = new Date().getFullYear() - FOUNDED;
  const yearsHeading = document.getElementById('yearsHeading');
  const yearsDesc    = document.getElementById('yearsDesc');
  if (yearsHeading) yearsHeading.textContent = years + '+ Years';
  if (yearsDesc)    yearsDesc.textContent    = 'Over ' + years + ' years of manufacturing excellence in Bangalore.';

  // ============================================================
  //  THEME — dark is default
  // ============================================================
  const saved = localStorage.getItem('se-theme') || localStorage.getItem('theme');
  if (saved === 'light') document.documentElement.setAttribute('data-theme', 'light');

  const toggle = document.getElementById('themeToggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
      if (isLight) {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('se-theme', 'dark');
      } else {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('se-theme', 'light');
      }
      if (typeof window._updateParticleColor === 'function') window._updateParticleColor();
    });
  }

  // ============================================================
  //  ACTIVE NAV + NAVBAR SCROLL
  // ============================================================
  const currentPage = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a[href]').forEach(a => {
    const href = a.getAttribute('href').split('#')[0] || 'index.html';
    if (href === currentPage) a.classList.add('active');
  });

  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 50);
    }, { passive: true });
  }

  // ============================================================
  //  MOBILE MENU
  // ============================================================
  const navToggle = document.getElementById('navToggle');
  const navLinks  = document.getElementById('navLinks');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('active');
      navLinks.classList.toggle('open');
    });
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navLinks.classList.remove('open');
      });
    });
  }

  // ============================================================
  //  SMOOTH SCROLL
  // ============================================================
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(a.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // ============================================================
  //  STAT COUNTER — spring easing
  // ============================================================
  const counters = document.querySelectorAll('.stat-num[data-count]');
  let counted = false;

  function easeOutExpo(t) { return t === 1 ? 1 : 1 - Math.pow(2, -10 * t); }

  function animateCounters() {
    if (counted) return;
    counted = true;
    counters.forEach(el => {
      const target   = parseInt(el.dataset.count);
      const duration = 2200;
      const start    = performance.now();
      (function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        el.textContent = Math.floor(easeOutExpo(progress) * target);
        if (progress < 1) requestAnimationFrame(tick);
        else el.textContent = target;
      })(start);
    });
  }
  if (counters.length) setTimeout(animateCounters, 1000);

  // ============================================================
  //  SCROLL REVEAL — with stagger per section
  // ============================================================
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  function initReveal() {
    document.querySelectorAll(
      '.feature-card, .contact-item, .quicklink-card, .category-card, .gallery-item'
    ).forEach(el => el.classList.add('reveal'));
    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
  }
  window.initReveal = initReveal;
  initReveal();

  // ============================================================
  //  HIDDEN ADMIN ACCESS
  // ============================================================
  const footerBottom = document.querySelector('.footer-bottom');
  if (footerBottom) {
    let clicks = 0, clickTimer = null;
    footerBottom.addEventListener('click', () => {
      clicks++;
      clearTimeout(clickTimer);
      if (clicks >= 5) { clicks = 0; window.location.href = 'admin.html'; return; }
      clickTimer = setTimeout(() => { clicks = 0; }, 3000);
    });
  }

  // ============================================================
  //  FLOATING GRADIENT ORBS (background mesh)
  // ============================================================
  function initBackgroundMesh() {
    if (document.querySelector('.bg-mesh')) return;
    const mesh = document.createElement('div');
    mesh.className = 'bg-mesh';
    mesh.setAttribute('aria-hidden', 'true');
    for (let i = 1; i <= 3; i++) {
      const orb = document.createElement('div');
      orb.className = 'bg-orb bg-orb-' + i;
      mesh.appendChild(orb);
    }
    document.body.prepend(mesh);
  }
  initBackgroundMesh();

  // ============================================================
  //  SCROLL PROGRESS BAR
  // ============================================================
  function initScrollProgress() {
    const bar = document.createElement('div');
    bar.className = 'scroll-progress';
    bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);

    function update() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = docHeight > 0 ? (scrollTop / docHeight * 100) + '%' : '0%';
    }
    window.addEventListener('scroll', update, { passive: true });
    update();
  }
  initScrollProgress();

  // ============================================================
  //  HERO PARTICLE NETWORK
  // ============================================================
  function initHeroParticles() {
    const hero = document.querySelector('.hero');
    if (!hero || prefersReducedMotion) return;

    const canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:2;';
    hero.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouse = { x: -9999, y: -9999 };

    function getColor() {
      return document.documentElement.getAttribute('data-theme') === 'light' ? '37,99,235' : '6,182,212';
    }
    let pColor = getColor();
    window._updateParticleColor = () => { pColor = getColor(); };

    function resize() {
      canvas.width  = hero.offsetWidth;
      canvas.height = hero.offsetHeight;
      buildParticles();
    }

    function buildParticles() {
      particles = [];
      const density = window.innerWidth < 768 ? 22000 : 14000;
      const count = Math.max(25, Math.min(80, Math.floor((canvas.width * canvas.height) / density)));
      for (let i = 0; i < count; i++) {
        particles.push({
          x:    Math.random() * canvas.width,
          y:    Math.random() * canvas.height,
          vx:   (Math.random() - 0.5) * 0.35,
          vy:   (Math.random() - 0.5) * 0.35,
          size: Math.random() * 1.8 + 0.5,
        });
      }
    }

    hero.addEventListener('mousemove', e => {
      const rect = hero.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    }, { passive: true });
    hero.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const maxDist = 140;
      const mouseRadius = 180;

      // Lines between particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx   = particles[i].x - particles[j].x;
          const dy   = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxDist) {
            const alpha = 0.2 * (1 - dist / maxDist);
            ctx.beginPath();
            ctx.strokeStyle = `rgba(${pColor},${alpha})`;
            ctx.lineWidth   = 0.6;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Lines from particles to cursor
      particles.forEach(p => {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouseRadius) {
          const alpha = 0.35 * (1 - dist / mouseRadius);
          ctx.beginPath();
          ctx.strokeStyle = `rgba(${pColor},${alpha})`;
          ctx.lineWidth   = 0.8;
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      });

      // Draw + move particles
      particles.forEach(p => {
        // Mouse repulsion
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouseRadius && dist > 0) {
          const force = (mouseRadius - dist) / mouseRadius * 0.02;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }
        // Damping
        p.vx *= 0.998;
        p.vy *= 0.998;

        ctx.beginPath();
        ctx.fillStyle = `rgba(${pColor},0.6)`;
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Glow on larger particles
        if (p.size > 1.2) {
          ctx.beginPath();
          ctx.fillStyle = `rgba(${pColor},0.15)`;
          ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
          ctx.fill();
        }

        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;
        if (p.y < -10) p.y = canvas.height + 10;
        if (p.y > canvas.height + 10) p.y = -10;
      });

      requestAnimationFrame(draw);
    }

    resize();
    draw();
    if (typeof ResizeObserver !== 'undefined') new ResizeObserver(resize).observe(hero);
    else window.addEventListener('resize', resize, { passive: true });
  }
  initHeroParticles();

  // ============================================================
  //  CURSOR GLOW — desktop only, follows mouse
  // ============================================================
  function initCursorGlow() {
    if (window.innerWidth < 1024 || prefersReducedMotion) return;

    const glow = document.createElement('div');
    glow.setAttribute('aria-hidden', 'true');
    glow.style.cssText =
      'position:fixed;width:600px;height:600px;border-radius:50%;pointer-events:none;z-index:0;' +
      'background:radial-gradient(circle,rgba(6,182,212,.055) 0%,transparent 60%);' +
      'will-change:transform;transform:translate(-9999px,-9999px);' +
      'mix-blend-mode:screen;';
    document.body.appendChild(glow);

    let cx = -9999, cy = -9999;
    let tx = cx, ty = cy;

    document.addEventListener('mousemove', e => {
      tx = e.clientX - 300;
      ty = e.clientY - 300;
    }, { passive: true });

    // Lerp for smooth follow
    function animate() {
      cx += (tx - cx) * 0.12;
      cy += (ty - cy) * 0.12;
      glow.style.transform = `translate(${cx}px,${cy}px)`;
      requestAnimationFrame(animate);
    }
    animate();
  }
  initCursorGlow();

  // ============================================================
  //  CARD TILT — 3D perspective on desktop
  // ============================================================
  function initCardTilt() {
    if (window.innerWidth < 1024 || prefersReducedMotion) return;

    const cards = document.querySelectorAll('.feature-card, .quicklink-card');
    cards.forEach(card => {
      card.style.willChange = 'transform';
      card.addEventListener('mousemove', e => {
        const r  = card.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width  / 2)) / (r.width  / 2);
        const dy = (e.clientY - (r.top  + r.height / 2)) / (r.height / 2);
        card.style.transform =
          `translateY(-8px) perspective(800px) rotateX(${-dy * 5}deg) rotateY(${dx * 5}deg) scale(1.02)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }
  initCardTilt();

  // ============================================================
  //  MAGNETIC BUTTONS — slight pull toward cursor
  // ============================================================
  function initMagneticButtons() {
    if (window.innerWidth < 1024 || prefersReducedMotion) return;

    document.querySelectorAll('.btn-primary, .nav-cta').forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const r  = btn.getBoundingClientRect();
        const cx = r.left + r.width  / 2;
        const cy = r.top  + r.height / 2;
        const dx = (e.clientX - cx) * 0.25;
        const dy = (e.clientY - cy) * 0.25;
        btn.style.transform = `translate(${dx}px, ${dy}px) scale(1.04)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }
  initMagneticButtons();

  // ============================================================
  //  CONTACT FORM
  // ============================================================
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', async e => {
      e.preventDefault();
      const btn      = contactForm.querySelector('button');
      const original = btn.innerHTML;
      btn.disabled   = true;
      btn.innerHTML  = 'Sending...';

      const payload = {
        name:    document.getElementById('formName').value.trim(),
        phone:   document.getElementById('formPhone').value.trim(),
        product: document.getElementById('formService').value,
        message: document.getElementById('formMessage').value.trim(),
      };

      try {
        const res  = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Something went wrong. Please try again later.');
        btn.innerHTML        = '✓ Enquiry Sent!';
        btn.style.background = '#10b981';
        setTimeout(() => {
          contactForm.reset();
          btn.innerHTML        = original;
          btn.style.background = '';
          btn.disabled         = false;
        }, 3000);
      } catch (err) {
        btn.innerHTML = original;
        btn.disabled  = false;
        alert(err.message);
      }
    });
  }

  // ============================================================
  //  CAREERS FORM
  // ============================================================
  const careersForm = document.getElementById('careersForm');
  if (careersForm) {
    const statusEl = document.getElementById('careerStatus');
    careersForm.addEventListener('submit', async e => {
      e.preventDefault();
      const btn      = careersForm.querySelector('button');
      const original = btn.innerHTML;
      btn.disabled   = true;
      btn.innerHTML  = 'Sending...';
      statusEl.textContent = '';
      statusEl.className   = 'form-status';

      try {
        const res  = await fetch('/api/careers-application', {
          method: 'POST',
          body: new FormData(careersForm),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Something went wrong. Please try again later.');
        btn.innerHTML        = '✓ Application Sent!';
        btn.style.background = '#10b981';
        statusEl.textContent = "Thanks — we'll be in touch if there's a fit.";
        statusEl.classList.add('success');
        setTimeout(() => {
          careersForm.reset();
          btn.innerHTML        = original;
          btn.style.background = '';
          btn.disabled         = false;
          statusEl.textContent = '';
          statusEl.className   = 'form-status';
        }, 4000);
      } catch (err) {
        btn.innerHTML = original;
        btn.disabled  = false;
        statusEl.textContent = err.message;
        statusEl.classList.add('error');
      }
    });
  }

});
