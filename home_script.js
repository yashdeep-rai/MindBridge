import { getRandomQuote } from './js/languageManager.js'

/* ========================================
   HOME PAGE SPECIFIC FUNCTIONALITY
======================================== */

/**
 * Orchestrates the typing animation sequence for the home page
 */
async function animateTexts() {
    // Only run animations on the home page
    if (!window.isHomePage || !window.isHomePage()) {
        console.log('Not on home page, skipping animations');
        return;
    }
    
    // Get DOM elements
    const mindBridgeElement = document.querySelector('.logo-text');
    const mottoElements = document.querySelectorAll('.motto-line');
    
    // Check if required elements exist
    if (!mindBridgeElement || !mottoElements.length) {
        console.log('Required animation elements not found, skipping animations');
        return;
    }
    
    console.log('Starting home page animations');
    
    // Clear existing content
    mindBridgeElement.innerHTML = '';
    mottoElements.forEach(el => el.innerHTML = '');
    
    // Adjust speed based on screen size
    const isMobileDevice = window.isMobile ? window.isMobile() : window.innerWidth <= 768;
    const speeds = {
        normal: isMobileDevice ? 100 : 150,
        fast: isMobileDevice ? 80 : 120
    };
    
    // Show mobile button if on mobile
    const mobileButton = document.querySelector('.mobile-get-started');
    if (isMobileDevice && mobileButton) {
        mobileButton.classList.add('show');
    }
    
    try {
        // Animate logo text
        await window.typeWriter(mindBridgeElement, 'MindBridge', speeds.normal);
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Animate motto text
        const quote = await getRandomQuote();
        await window.typeWriter(mottoElements[0], quote, speeds.fast);
        await new Promise(resolve => setTimeout(resolve, 300));
        
        console.log('Home page animations completed successfully');
        
    } catch (error) {
        console.error('Animation error:', error);
    }
}

/* ========================================
   HOME PAGE INITIALIZATION
======================================== */

// Initialize home page specific functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize home page functionality if we're on the home page
    if (!window.isHomePage || !window.isHomePage()) {
        console.log('Not on home page, skipping home page initialization');
        return;
    }
    
    console.log('Initializing home page functionality');
    
    let animationStarted = false;
    
    const startAnimation = () => {
        if (animationStarted) {
            console.log('Animation already started, skipping');
            return;
        }
        animationStarted = true;
        console.log('Starting home page text animation');
        animateTexts();
    };
    
    // Wait for language manager to be ready before starting animations
    if (window.languageManager && window.languageManager.isReady) {
        console.log('Language manager already ready, starting animations');
        startAnimation();
    } else {
        console.log('Waiting for language manager to be ready...');
        document.addEventListener('languageManagerReady', () => {
            console.log('Language manager ready event received, starting animations');
            startAnimation();
        }, { once: true });
        
        // Fallback timeout in case language manager takes too long
        setTimeout(() => {
            if (!animationStarted) {
                console.log('Timeout reached, starting animations anyway');
                startAnimation();
            }
        }, 3000);
    }
});

console.log('Home script loaded successfully');