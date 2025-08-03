/* ========================================
   COMMON FUNCTIONALITY
   Shared functions used across multiple pages
======================================== */

/* ========================================
   UTILITY FUNCTIONS
======================================== */

/**
 * Creates a typewriter effect for text elements
 * @param {HTMLElement} element - The element to type into
 * @param {string} text - The text to type
 * @param {number} speed - Typing speed in milliseconds
 * @returns {Promise} - Resolves when typing is complete
 */
async function typeWriter(element, text, speed = 100) {
    if (!element) {
        console.error("typeWriter: element is undefined or null");
        return;
    }

    if (!text || typeof text !== "string") {
        console.error("typeWriter received invalid text:", text);
        return;
    }

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
 * Check if current page is the home page
 * @returns {boolean} - True if on home page
 */
function isHomePage() {
    return window.location.pathname === '/' || 
           window.location.pathname === '/index.html' || 
           window.location.pathname.endsWith('/index.html') ||
           window.location.pathname === '';
}

/**
 * Check if device is mobile based on screen width
 * @returns {boolean} - True if mobile device
 */
function isMobile() {
    return window.innerWidth <= 768;
}

/* ========================================
   RESPONSIVE FUNCTIONALITY
======================================== */

/**
 * Handles orientation and resize changes
 */
function handleResponsiveChanges() {
    const isMobileDevice = isMobile();
    const mobileButton = document.querySelector('.mobile-get-started');
    
    if (mobileButton) {
        if (isMobileDevice) {
            mobileButton.classList.add('show');
        } else {
            mobileButton.classList.remove('show');
        }
    }
    
    console.log(`Responsive change detected. Mobile: ${isMobileDevice}`);
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
    
    if (!hamburgerMenu || !navLinks) {
        console.log('Hamburger menu elements not found, skipping initialization');
        return;
    }
    
    console.log('Initializing hamburger menu');
    
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
   PAGE UTILITY FUNCTIONS
======================================== */

/**
 * Wait for an element to appear in the DOM
 * @param {string} selector - CSS selector for the element
 * @param {number} timeout - Maximum time to wait in milliseconds
 * @returns {Promise<Element|null>} - The element or null if timeout
 */
function waitForElement(selector, timeout = 5000) {
    return new Promise((resolve) => {
        const element = document.querySelector(selector);
        if (element) {
            resolve(element);
            return;
        }
        
        const observer = new MutationObserver((mutations, obs) => {
            const element = document.querySelector(selector);
            if (element) {
                obs.disconnect();
                resolve(element);
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        // Timeout fallback
        setTimeout(() => {
            observer.disconnect();
            resolve(null);
        }, timeout);
    });
}

/**
 * Debounce function to limit how often a function can be called
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/* ========================================
   GLOBAL EXPORTS
======================================== */

// Make functions globally accessible
window.typeWriter = typeWriter;
window.isHomePage = isHomePage;
window.isMobile = isMobile;
window.handleResponsiveChanges = handleResponsiveChanges;
window.initHamburgerMenu = initHamburgerMenu;
window.waitForElement = waitForElement;
window.debounce = debounce;

/* ========================================
   COMMON INITIALIZATION
======================================== */

// Initialize common functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Common.js: Initializing common functionality');
    
    // Initialize hamburger menu
    initHamburgerMenu();
    
    // Handle initial responsive state
    handleResponsiveChanges();
    
    console.log('Common.js: Initialization complete');
});

// Handle responsive changes with debouncing
const debouncedResponsiveHandler = debounce(handleResponsiveChanges, 250);
window.addEventListener('orientationchange', debouncedResponsiveHandler);
window.addEventListener('resize', debouncedResponsiveHandler);

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        // Re-trigger responsive handling if page becomes visible
        handleResponsiveChanges();
    }
});

console.log('Common.js loaded successfully');
