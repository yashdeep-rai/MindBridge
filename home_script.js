/* ========================================
   TYPING ANIMATION FUNCTIONALITY
======================================== */

/**
 * Creates a typewriter effect for text elements
 * @param {HTMLElement} element - The element to type into
 * @param {string} text - The text to type
 * @param {number} speed - Typing speed in milliseconds
 * @returns {Promise} - Resolves when typing is complete
 */
function typeWriter(element, text, speed = 100) {
    return new Promise((resolve) => {
        let i = 0;
        element.innerHTML = '';
        element.classList.add('typing-cursor');
        element.style.opacity = '1'; // Make visible when typing starts

        function type() {
            if (i < text.length) {
                element.innerHTML = text.substring(0, i + 1);
                i++;
                setTimeout(type, speed);
            } else {
                // Remove cursor after typing is complete
                setTimeout(() => {
                    element.classList.remove('typing-cursor');
                    resolve();
                }, 500);
            }
        }

        type();
    });
}

/**
 * Orchestrates the typing animation sequence
 */
async function animateTexts() {
    // Get DOM elements - check if they exist first
    const mindBridgeElement = document.querySelector('.logo-text');
    const mottoElements = document.querySelectorAll('.motto-line');

    // Only run animations if elements exist (for home route)
    if (!mindBridgeElement || mottoElements.length === 0) {
        return;
    }

    // Text content
    const texts = {
        mindBridge: 'MindBridge',
        fallback_text: 'Your Mental Health Matters',
    };

    let randomQuote;

    // Clear existing content and set initial state
    mindBridgeElement.innerHTML = '';
    mottoElements.forEach(el => {
        el.innerHTML = '';
        el.style.opacity = '0'; // Start invisible
    });

    // Adjust speed based on screen size
    const isMobile = window.innerWidth <= 768;
    const speeds = {
        normal: isMobile ? 100 : 150,
        fast: isMobile ? 80 : 120
    };

    // Show mobile button if on mobile
    const mobileButton = document.querySelector('.mobile-get-started');
    if (isMobile && mobileButton) {
        mobileButton.classList.add('show');
    }

    try {
        // Animate logo text
        await typeWriter(mindBridgeElement, texts.mindBridge, speeds.normal);
        await new Promise(resolve => setTimeout(resolve, 500));

        // Load quote only once to prevent changes
        try {
            const response = await fetch('./text/quotes_db.json');
            const data = await response.json();
            // Use a fixed seed based on date to get same quote per day
            const dateStr = new Date().toDateString();
            const seedIndex = dateStr.split('').reduce((a, b) => {
                a = ((a << 5) - a) + b.charCodeAt(0);
                return a & a;
            }, 0);
            randomQuote = data[Math.abs(seedIndex) % data.length];
            console.log('Daily quote:', randomQuote);
        } catch (error) {
            randomQuote = texts.fallback_text;
            console.error('Error loading quotes:', error);
        }
        
        // Animate motto text - only use first element for single line display
        if (mottoElements[0] && randomQuote) {
            await typeWriter(mottoElements[0], randomQuote, speeds.fast);
        }

    } catch (error) {
        console.error('Animation error:', error);
        // Fallback animation
        if (mottoElements[0]) {
            mottoElements[0].style.opacity = '1';
            mottoElements[0].textContent = texts.fallback_text;
        }
    }
}



/* ========================================
   RESPONSIVE FUNCTIONALITY
======================================== */

/**
 * Handles orientation and resize changes
 */
function handleResponsiveChanges() {
    const isMobile = window.innerWidth <= 768;
    const mobileButton = document.querySelector('.mobile-get-started');

    if (mobileButton) {
        if (isMobile) {
            mobileButton.classList.add('show');
        } else {
            mobileButton.classList.remove('show');
        }
    }
}

/* ========================================
   HAMBURGER MENU FUNCTIONALITY
======================================== */

/**
 * Initializes hamburger menu functionality
 */
function initHamburgerMenu() {
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    const navLinks = document.getElementById('navLinks');

    if (!hamburgerMenu || !navLinks) return;

    // Toggle menu on hamburger click
    hamburgerMenu.addEventListener('click', () => {
        hamburgerMenu.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    // Close menu when clicking outside
    document.addEventListener('click', (event) => {
        if (!hamburgerMenu.contains(event.target) && !navLinks.contains(event.target)) {
            closeHamburgerMenu();
        }
    });

    // Close menu when clicking on nav links
    const navLinkElements = navLinks.querySelectorAll('.nav-link');
    navLinkElements.forEach(link => {
        link.addEventListener('click', () => {
            closeHamburgerMenu();
        });
    });

    /**
     * Closes the hamburger menu
     */
    function closeHamburgerMenu() {
        hamburgerMenu.classList.remove('active');
        navLinks.classList.remove('active');
    }
}

/* ========================================
   EVENT LISTENERS & INITIALIZATION
======================================== */

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Only run initial animations if we're on home route
    const currentHash = window.location.hash.slice(1) || 'home';
    if (currentHash === 'home') {
        // Delay to ensure SPA content is loaded
        setTimeout(() => {
            animateTexts();
        }, 300);
    }
    initHamburgerMenu();
});

// Handle responsive changes
window.addEventListener('orientationchange', handleResponsiveChanges);
window.addEventListener('resize', handleResponsiveChanges);

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        // Re-trigger animations if page becomes visible
        handleResponsiveChanges();
    }
});

// Prevent navigation conflicts
window.addEventListener('hashchange', () => {
    const currentHash = window.location.hash.slice(1) || 'home';
    console.log('Hash changed to:', currentHash);
    
    // If navigating to get-started, ensure it doesn't redirect
    if (currentHash === 'get-started') {
        console.log('Navigating to Get Started page');
    }
});