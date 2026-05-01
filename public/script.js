document.addEventListener('DOMContentLoaded', () => {
  // Particle Animation
  const canvas = document.getElementById('particleCanvas');
  const ctx = canvas.getContext('2d');
  
  let width, height;
  let particles = [];
  
  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
  }
  
  window.addEventListener('resize', resize);
  resize();
  
  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.5;
      this.vy = (Math.random() - 0.5) * 0.5;
      this.radius = Math.random() * 2 + 1;
      this.color = `rgba(255, 255, 255, ${Math.random() * 0.3})`;
    }
    
    update() {
      this.x += this.vx;
      this.y += this.vy;
      
      if (this.x < 0) this.x = width;
      if (this.x > width) this.x = 0;
      if (this.y < 0) this.y = height;
      if (this.y > height) this.y = 0;
    }
    
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
    }
  }
  
  for (let i = 0; i < 50; i++) {
    particles.push(new Particle());
  }
  
  function animate() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    requestAnimationFrame(animate);
  }
  animate();

  // Countdown Timer (Set to 30 days from now)
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + 30);
  
  function updateCountdown() {
    const now = new Date();
    const diff = targetDate - now;
    
    if (diff <= 0) return;
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    document.getElementById('days').textContent = days.toString().padStart(2, '0');
    document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
    document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
    document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
  }
  
  setInterval(updateCountdown, 1000);
  updateCountdown();

  // Form Submission
  const form = document.getElementById('signupForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('button');
    btn.innerHTML = 'Added! ✓';
    btn.style.background = '#10b981';
    setTimeout(() => {
      form.reset();
      btn.innerHTML = '<span class="btn-text">Notify Me</span><span class="btn-icon">→</span>';
      btn.style.background = 'var(--grad)';
    }, 3000);
  });
});
