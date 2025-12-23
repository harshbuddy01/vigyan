// Navbar scroll effect
const navbar = document.getElementById('navbar');
let lastY = 0;

window.addEventListener('scroll', () => {
    const y = window.pageYOffset;
    if (Math.abs(y - lastY) > 20) {
        navbar.classList.toggle('scrolled', y > 50);
        lastY = y;
    }
}, { passive: true });

// Smooth scroll for indicators
document.querySelectorAll('.scroll-indicator, .section-scroll-indicator').forEach(indicator => {
    indicator.addEventListener('click', () => {
        const currentSection = indicator.closest('section, .institute-section');
        const nextSection = currentSection.nextElementSibling;
        if (nextSection) {
            nextSection.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// OPTIMIZED Pendulum Animation - Instant Start on Scroll
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
                // Immediate start with minimal delay between pendulums
                setTimeout(() => {
                    pendulum.classList.add('swinging');
                }, index * 50); // Reduced from 80ms to 50ms
            });
        }
    });
}, observerOptions);

// Observe all pendulum containers
document.querySelectorAll('.pendulum-container').forEach(container => {
    pendulumObserver.observe(container);
});

// Pre-activate pendulums that are already visible on page load
document.addEventListener('DOMContentLoaded', () => {
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
});