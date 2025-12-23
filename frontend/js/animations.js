// Animation Scripts - Particles, Pendulum Observers, etc.

// Navbar scroll effect
document.addEventListener('DOMContentLoaded', function() {
  const navbar = document.getElementById('navbar');
  if (navbar) {
    let lastY = 0;
    window.addEventListener('scroll', () => {
      const y = window.pageYOffset;
      if (Math.abs(y - lastY) > 20) {
        navbar.classList.toggle('scrolled', y > 50);
        lastY = y;
      }
    }, { passive: true });
  }

  // Initialize particle animation if canvas exists
  const canvas = document.getElementById('canvas');
  if (canvas) {
    initParticles();
  }

  // Initialize pendulum observers
  initPendulumObservers();

  // Smooth scroll for indicators
  initSmoothScroll();
});

// Particle Animation (for signin page)
function initParticles() {
  const canvas = document.getElementById("canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let w, h, particles = [];

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }

  window.addEventListener('resize', resize);
  resize();

  class Particle {
    constructor() {
      this.init();
    }

    init() {
      this.x = Math.random() * w;
      this.y = h + Math.random() * 100;
      this.size = Math.random() * 50 + 10;
      this.speed = Math.random() * 0.5 + 0.2;
      this.opacity = Math.random() * 0.1 + 0.05;
    }

    update() {
      this.y -= this.speed;
      if (this.y < -50) this.init();
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(99, 102, 241, ${this.opacity})`;
      ctx.fill();
    }
  }

  // Create particles
  for (let i = 0; i < 30; i++) {
    particles.push(new Particle());
  }

  // Animation loop
  function animate() {
    ctx.clearRect(0, 0, w, h);
    for (let p of particles) {
      p.update();
      p.draw();
    }
    requestAnimationFrame(animate);
  }

  animate();
}

// OPTIMIZED Pendulum Intersection Observer - Instant Animation
function initPendulumObservers() {
  const observerOptions = {
    threshold: 0.05, // Trigger immediately when section starts appearing
    rootMargin: '50px 0px' // Start before section fully in view
  };

  const pendulumObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.classList.contains('active')) {
        // Mark as active immediately
        entry.target.classList.add('active');
        
        const pendulums = entry.target.querySelectorAll('.pendulum');
        
        // Start animation INSTANTLY with very short stagger
        pendulums.forEach((pendulum, index) => {
          setTimeout(() => {
            pendulum.classList.add('swinging');
          }, index * 50); // Reduced to 50ms for instant feel
        });
      }
    });
  }, observerOptions);

  // Observe all pendulum containers
  document.querySelectorAll('.pendulum-container').forEach(container => {
    pendulumObserver.observe(container);
  });
  
  // Pre-activate pendulums that are already visible on page load
  const containers = document.querySelectorAll('.pendulum-container');
  
  containers.forEach(container => {
    const rect = container.getBoundingClientRect();
    const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
    
    if (isVisible && !container.classList.contains('active')) {
      container.classList.add('active');
      
      const pendulums = container.querySelectorAll('.pendulum');
      pendulums.forEach((pendulum, index) => {
        setTimeout(() => {
          pendulum.classList.add('swinging');
        }, index * 50);
      });
    }
  });
}

// Smooth scroll for indicators
function initSmoothScroll() {
  document.querySelectorAll('.scroll-indicator, .section-scroll-indicator').forEach(indicator => {
    indicator.addEventListener('click', () => {
      const currentSection = indicator.closest('section, .institute-section');
      const nextSection = currentSection?.nextElementSibling;
      if (nextSection) {
        nextSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

// Loading spinner helpers
function showSpinner(elementId) {
  const spinner = document.getElementById(elementId);
  if (spinner) spinner.style.display = 'block';
}

function hideSpinner(elementId) {
  const spinner = document.getElementById(elementId);
  if (spinner) spinner.style.display = 'none';
}

// Modal helpers
function showModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.style.display = 'flex';
}

function hideModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.style.display = 'none';
}

// Add shake animation to element
function shakeElement(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.classList.add('shake');
    setTimeout(() => {
      element.classList.remove('shake');
    }, 400);
  }
}

// Export for global access
window.ANIMATIONS = {
  showSpinner,
  hideSpinner,
  showModal,
  hideModal,
  shakeElement
};