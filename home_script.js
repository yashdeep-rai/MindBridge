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
    // Get DOM elements
    const mindBridgeElement = document.querySelector('.logo-text');
    const mottoElements = document.querySelectorAll('.motto-line');
    
    // Text content
    const texts = {
        mindBridge: 'MindBridge',
        mental: 'Your Mental',
        health: 'Health Matters'
    };
    
    // Clear existing content
    mindBridgeElement.innerHTML = '';
    mottoElements.forEach(el => el.innerHTML = '');
    
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
        
        // Animate motto text
        await typeWriter(mottoElements[0], texts.mental, speeds.fast);
        await new Promise(resolve => setTimeout(resolve, 300));
        await typeWriter(mottoElements[1], texts.health, speeds.fast);
        
    } catch (error) {
        console.error('Animation error:', error);
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
    animateTexts();
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