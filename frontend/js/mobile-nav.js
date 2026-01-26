document.addEventListener('DOMContentLoaded', () => {
    // Select hamburger and nav
    // Note: Some pages might use different class names, but we'll standardized on .hamburger and .nav-links
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
                // If we are in mobile mode (drawer open or small screen)
                if (window.innerWidth <= 768 || navLinks.classList.contains('nav-active')) {
                    e.preventDefault();
                    e.stopPropagation(); // Prevent closing the menu immediately

                    const menu = trigger.nextElementSibling;
                    const icon = trigger.querySelector('.fa-chevron-down');

                    if (menu) {
                        // Toggle active class
                        menu.classList.toggle('active');

                        // Rotate icon
                        if (icon) {
                            icon.style.transform = menu.classList.contains('active') ? 'rotate(180deg)' : 'rotate(0deg)';
                            icon.style.transition = 'transform 0.3s ease';
                        }
                    }
                }
            });
        });

        // Close menu when a link is clicked (but not if it's a dropdown trigger)
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
