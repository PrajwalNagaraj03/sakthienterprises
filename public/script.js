document.addEventListener('DOMContentLoaded', () => {
  // === YEARS OF EXPERIENCE ===
  const FOUNDED = 1997;
  const years = new Date().getFullYear() - FOUNDED;
  const yearsHeading = document.getElementById('yearsHeading');
  const yearsDesc = document.getElementById('yearsDesc');
  if (yearsHeading) yearsHeading.textContent = years + '+ Years';
  if (yearsDesc) yearsDesc.textContent = 'Over ' + years + ' years of manufacturing excellence in Bangalore.';

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

  // === ACTIVE NAV LINK ===
  const currentPage = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a[href]').forEach(a => {
    const href = a.getAttribute('href').split('#')[0] || 'index.html';
    if (href === currentPage) a.classList.add('active');
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

  document.querySelectorAll('.feature-card, .contact-item, .quicklink-card, .category-card, .gallery-item').forEach(el => {
    el.classList.add('reveal');
  });
  
  document.querySelectorAll('.reveal').forEach(el => {
    observer.observe(el);
  });

  if (counters.length) setTimeout(() => { if (!counted) { counted = true; animateCounters(); } }, 1200);

  // === FORM SUBMIT (contact) ===
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', async e => {
      e.preventDefault();
      const btn = contactForm.querySelector('button');
      const original = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = 'Sending...';

      const payload = {
        name: document.getElementById('formName').value.trim(),
        phone: document.getElementById('formPhone').value.trim(),
        product: document.getElementById('formService').value,
        message: document.getElementById('formMessage').value.trim()
      };

      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Something went wrong. Please try again later.');

        btn.innerHTML = '✓ Enquiry Sent!';
        btn.style.background = '#10b981';
        setTimeout(() => {
          contactForm.reset();
          btn.innerHTML = original;
          btn.style.background = '';
          btn.disabled = false;
        }, 3000);
      } catch (err) {
        btn.innerHTML = original;
        btn.disabled = false;
        alert(err.message);
      }
    });
  }

  // === CAREERS FORM (real submit to server) ===
  const careersForm = document.getElementById('careersForm');
  if (careersForm) {
    const statusEl = document.getElementById('careerStatus');
    careersForm.addEventListener('submit', async e => {
      e.preventDefault();
      const btn = careersForm.querySelector('button');
      const original = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = 'Sending...';
      statusEl.textContent = '';
      statusEl.className = 'form-status';

      try {
        const res = await fetch('/api/careers-application', {
          method: 'POST',
          body: new FormData(careersForm)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Something went wrong. Please try again later.');

        btn.innerHTML = '✓ Application Sent!';
        btn.style.background = '#10b981';
        statusEl.textContent = 'Thanks — we\'ll be in touch if there\'s a fit.';
        statusEl.classList.add('success');
        setTimeout(() => {
          careersForm.reset();
          btn.innerHTML = original;
          btn.style.background = '';
          btn.disabled = false;
          statusEl.textContent = '';
          statusEl.className = 'form-status';
        }, 4000);
      } catch (err) {
        btn.innerHTML = original;
        btn.disabled = false;
        statusEl.textContent = err.message;
        statusEl.classList.add('error');
      }
    });
  }
});
