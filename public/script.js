document.addEventListener('DOMContentLoaded', () => {
  // === THEME TOGGLE ===
  const toggle = document.getElementById('themeToggle');
  const saved = localStorage.getItem('theme');
  if (saved) document.documentElement.setAttribute('data-theme', saved);

  toggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    if (next === 'light') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
    localStorage.setItem('theme', next);
  });

  // === NAVBAR SCROLL ===
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  });

  // === MOBILE MENU ===
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
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

  // === SMOOTH SCROLL ===
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(a.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // === STAT COUNTER ===
  const counters = document.querySelectorAll('.stat-num[data-count]');
  let counted = false;
  function animateCounters() {
    counters.forEach(el => {
      const target = parseInt(el.dataset.count);
      const duration = 1500;
      const step = target / (duration / 16);
      let current = 0;
      function tick() {
        current += step;
        if (current >= target) { el.textContent = target; }
        else { el.textContent = Math.floor(current); requestAnimationFrame(tick); }
      }
      tick();
    });
  }

  // === SCROLL REVEAL ===
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.product-card, .feature-card, .contact-item').forEach(el => {
    el.classList.add('reveal');
    observer.observe(el);
  });

  setTimeout(() => { if (!counted) { counted = true; animateCounters(); } }, 1200);

  // === FORM SUBMIT ===
  document.getElementById('contactForm').addEventListener('submit', e => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    const original = btn.innerHTML;
    btn.innerHTML = '✓ Enquiry Sent! We\'ll contact you soon.';
    btn.style.background = '#10b981';
    setTimeout(() => { e.target.reset(); btn.innerHTML = original; btn.style.background = ''; }, 3000);
  });
});
