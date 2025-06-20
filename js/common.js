// script.js

// Fetching the header HTML
const fetchHeader = fetch('/hortimed/header.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('header-placeholder').innerHTML = data;
    })
    .catch(error => console.error('Error loading header:', error));

// Fetching the footer HTML
const fetchFooter = fetch('/hortimed/footer.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('footer-placeholder').innerHTML = data;
    })
    .catch(error => console.error('Error loading footer:', error));

// Wait for both header and footer to be loaded
Promise.all([fetchHeader, fetchFooter])
    .then(() => {
        // --- IMPORTANT: Initialize mobile-nav.js functions AFTER both header AND footer are loaded ---
        initializeMobileNav(); // Call a function to initialize mobile nav
    })
    .catch(error => {
        console.error('One or both fetches failed:', error);
    });


// Hero slider and objective animations
document.addEventListener('DOMContentLoaded', () => {
    // Hero slider
    const heroSlider = () => {
        const images = document.querySelectorAll('.hero-bg-image');
        if (!images.length) return;

        let current = 0;
        images[0].classList.add('active');

        const nextImage = () => {
            images[current].classList.remove('active');
            current = (current + 1) % images.length;
            images[current].classList.add('active');
        };

        return setInterval(nextImage, 5000);
    };

    // Objective animations
    const animateObjectives = () => {
        const items = document.querySelectorAll('.objective-item');
        if (!items.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => entry.isIntersecting &&
                entry.target.classList.add('is-visible'));
        }, { threshold: 0.1 });

        items.forEach(item => observer.observe(item));
    };

    heroSlider();
    animateObjectives();
});

// --- New function for mobile navigation initialization ---
// (This function should contain the entire content of your mobile-nav.js file)
function initializeMobileNav() {
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    const navContainer = document.querySelector('.nav-container');
    const navItems = document.querySelectorAll('.nav-item');
    const dropdowns = document.querySelectorAll('.main-nav .nav-item.dropdown');

    // Function to check if navigation items fit within the container
    function checkNavFit() {
        if (!navContainer || !mobileToggle || !mainNav) return;

        const navWidth = navContainer.offsetWidth;
        let requiredWidth = 0;

        navItems.forEach(item => {
            requiredWidth += item.offsetWidth;
        });

        const logoWidth = document.querySelector('.logo img')?.offsetWidth || 0;
        requiredWidth += logoWidth + 100; // 100px buffer for spacing

        if (requiredWidth > navWidth) {
            mobileToggle.style.display = 'flex';
            mainNav.classList.remove('active');
            document.body.classList.remove('mobile-menu-open');
            mobileToggle.setAttribute('aria-expanded', 'false');
        } else {
            mobileToggle.style.display = 'none';
            mainNav.classList.add('active'); // Show regular nav
            document.body.classList.remove('mobile-menu-open');
            mobileToggle.setAttribute('aria-expanded', 'false');
        }
    }

    // --- Initial setup and Event Listeners ---

    // Initial check for navigation fit on page load
    checkNavFit();

    // Mobile menu toggle functionality
    if (mobileToggle && mainNav) {
        mobileToggle.addEventListener('click', () => {
            const isActive = mainNav.classList.toggle('active');
            document.body.classList.toggle('mobile-menu-open', isActive);
            mobileToggle.setAttribute('aria-expanded', isActive.toString());

            // When main mobile menu is toggled, close all sub-dropdowns
            dropdowns.forEach(d => {
                d.classList.remove('active');
                const toggleBtn = d.querySelector('.dropdown-toggle-btn');
                if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // Close mobile menu panel when a navigating link inside it is clicked (on mobile)
    if (mainNav) {
        mainNav.addEventListener('click', (e) => {
            if (window.innerWidth <= 768 && mainNav.classList.contains('active')) {
                let targetElement = e.target;
                let isNavLinkAction = false;

                while (targetElement && targetElement !== mainNav) {
                    if (targetElement.tagName === 'A' && targetElement.href && !targetElement.classList.contains('dropdown-toggle-btn')) {
                        isNavLinkAction = true;
                        break;
                    }
                    if (targetElement.classList && targetElement.classList.contains('dropdown-toggle-btn')) {
                        return; // Exit if a dropdown toggle was clicked
                    }
                    targetElement = targetElement.parentElement;
                }

                if (isNavLinkAction) {
                    mainNav.classList.remove('active');
                    document.body.classList.remove('mobile-menu-open');
                    if (mobileToggle) mobileToggle.setAttribute('aria-expanded', 'false');
                    // Close all sub-dropdowns when the main menu closes
                    dropdowns.forEach(d => {
                        d.classList.remove('active');
                        const btn = d.querySelector('.dropdown-toggle-btn');
                        if (btn) btn.setAttribute('aria-expanded', 'false');
                    });
                }
            }
        });
    }

    // Dropdown behavior for both mobile (click) and desktop (hover)
    dropdowns.forEach(dropdown => {
        const toggleButton = dropdown.querySelector('.dropdown-toggle-btn');
        const navLink = dropdown.querySelector('.nav-link'); // The main link for the dropdown

        // Mobile: Click on toggleButton to open/close submenu
        if (toggleButton) {
            toggleButton.addEventListener('click', (e) => {
                // Only proceed if in mobile view
                if (window.innerWidth <= 768) {
                    e.stopPropagation(); // Prevent the click from propagating to document or parent elements
                    const isActive = dropdown.classList.toggle('active');
                    toggleButton.setAttribute('aria-expanded', isActive.toString());

                    // Close other open dropdowns
                    dropdowns.forEach(otherDropdown => {
                        if (otherDropdown !== dropdown && otherDropdown.classList.contains('active')) {
                            otherDropdown.classList.remove('active');
                            const otherToggleButton = otherDropdown.querySelector('.dropdown-toggle-btn');
                            if (otherToggleButton) {
                                otherToggleButton.setAttribute('aria-expanded', 'false');
                            }
                        }
                    });
                }
            });
        }

        // Desktop: Hover on the dropdown item (.nav-item.dropdown) to open/close submenu
        // No direct JS manipulation of 'active' class for desktop hover.
        // CSS :hover will handle display for desktop.
        // This part ensures ARIA attributes are consistent when switching between mobile/desktop modes or if JS previously set 'active'
        const handleDesktopEnter = () => {
            if (window.innerWidth > 768) {
                // dropdown.classList.add('active'); // Remove as CSS :hover handles display
                if (toggleButton) toggleButton.setAttribute('aria-expanded', 'true');
            }
        };
        const handleDesktopLeave = () => {
            if (window.innerWidth > 768) {
                // dropdown.classList.remove('active'); // Remove as CSS :hover handles display
                if (toggleButton) toggleButton.setAttribute('aria-expanded', 'false');
            }
        };

        dropdown.addEventListener('mouseenter', handleDesktopEnter);
        dropdown.addEventListener('mouseleave', handleDesktopLeave);

        // Main dropdown link (e.g., "Projects") will now navigate directly on all screen sizes
        // as per its href attribute. The toggleButton's click listener (defined above)
        // handles submenu toggling specifically on mobile.
        if (navLink && toggleButton) {
            // The event listener that previously made navLink trigger toggleButton.click() on mobile
            // (and prevented default navigation) has been removed.
        }
    });

    // Close mobile menu and dropdowns when clicking outside the navigation area
    document.addEventListener('click', (e) => {
        const isClickInsideNav = mainNav ? mainNav.contains(e.target) : false;
        const isClickOnMobileToggle = mobileToggle ? mobileToggle.contains(e.target) : false;

        if (!isClickInsideNav && !isClickOnMobileToggle) {
            mainNav?.classList.remove('active');
            document.body.classList.remove('mobile-menu-open');
            mobileToggle?.setAttribute('aria-expanded', 'false');

            dropdowns.forEach(d => {
                d.classList.remove('active');
                const toggleBtn = d.querySelector('.dropdown-toggle-btn');
                if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
            });
        }
    });

    // Reset navigation state on window resize (debounced)
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            checkNavFit();

            // When resizing to desktop, ensure the mobile menu panel is closed
            const isDesktop = window.innerWidth > 768;
            if (isDesktop) {
                if (mainNav && mainNav.classList.contains('active')) {
                    mainNav.classList.remove('active');
                    document.body.classList.remove('mobile-menu-open');
                    if (mobileToggle) mobileToggle.setAttribute('aria-expanded', 'false');
                }
            }

            // Always close all dropdowns on resize to reset their state
            dropdowns.forEach(d => {
                d.classList.remove('active');
                const btn = d.querySelector('.dropdown-toggle-btn');
                if (btn) btn.setAttribute('aria-expanded', 'false');
            });
        }, 100);
    });
}