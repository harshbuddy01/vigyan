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

// =========================================
// MOBILE NAVIGATION LOGIC
// =========================================
document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            // Toggle Nav
            navLinks.classList.toggle('nav-active');
            // Burger Animation
            hamburger.classList.toggle('active');
        });

        // Dropdown Toggle Logic for Mobile
        const dropdowns = document.querySelectorAll('.dropdown-trigger');
        dropdowns.forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                if (window.innerWidth <= 768 || navLinks.classList.contains('nav-active')) {
                    e.preventDefault();
                    e.stopPropagation();

                    const menu = trigger.nextElementSibling;
                    const icon = trigger.querySelector('.fa-chevron-down');

                    if (menu) {
                        menu.classList.toggle('active');
                        if (icon) {
                            icon.style.transform = menu.classList.contains('active') ? 'rotate(180deg)' : 'rotate(0deg)';
                            icon.style.transition = 'transform 0.3s ease';
                        }
                    }
                }
            });
        });

        // Close menu when a link is clicked
        const links = navLinks.querySelectorAll('a:not(.dropdown-trigger)');
        links.forEach(link => {
            link.addEventListener('click', () => {
                // Only if we are in mobile mode and menu is open
                if (navLinks.classList.contains('nav-active')) {
                    navLinks.classList.remove('nav-active');
                    hamburger.classList.remove('active');
                }
            });
        });
    }
});