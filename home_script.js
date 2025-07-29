// Typing animation function with cursor
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

// Function to animate multiple elements in sequence
async function animateTexts() {
    
    const mindBridgeElement = document.querySelector('.design_text');
    const mentalHealthElements = document.querySelectorAll('.moto span');
    
    const mindBridgeText = 'MindBridge';
    const mentalText = 'Your Mental';
    const healthText = 'Health Matters';
    
    mindBridgeElement.innerHTML = '';
    mentalHealthElements[0].innerHTML = '';
    mentalHealthElements[1].innerHTML = '';
    
    // Adjust speed based on screen size
    const isMobile = window.innerWidth <= 768;
    const speed = isMobile ? 100 : 150;
    const fastSpeed = isMobile ? 80 : 120;
    
    await typeWriter(mindBridgeElement, mindBridgeText, speed);
    
    
    await new Promise(resolve => setTimeout(resolve, 500));
    await typeWriter(mentalHealthElements[0], mentalText, fastSpeed);
    
    
    await new Promise(resolve => setTimeout(resolve, 300));
    await typeWriter(mentalHealthElements[1], healthText, fastSpeed);
    
    // Show mobile button after typing animation completes (mobile only)
    if (isMobile) {
        await new Promise(resolve => setTimeout(resolve, 500)); // Wait a bit
        const mobileButton = document.querySelector('.mobile-get-started');
        if (mobileButton) {
            mobileButton.classList.add('show');
        }
    }
    // Show mobile button after typing animation completes (mobile only)
    if (isMobile) {
        await new Promise(resolve => setTimeout(resolve, 500)); // Wait a bit
        const mobileButton = document.querySelector('.mobile-get-started');
        if (mobileButton) {
            mobileButton.classList.add('show');
        }
    }
}

// Handle orientation changes on mobile
function handleOrientationChange() {
    // Small delay to allow for orientation change to complete
    setTimeout(() => {
        // Force a reflow to handle any layout issues
        document.body.style.height = '99vh';
        setTimeout(() => {
            document.body.style.height = '100vh';
        }, 50);
    }, 100);
}

// Hamburger menu functionality
function initHamburgerMenu() {
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    const navLinks = document.getElementById('navLinks');
    
    if (hamburgerMenu && navLinks) {
        hamburgerMenu.addEventListener('click', () => {
            hamburgerMenu.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (event) => {
            if (!hamburgerMenu.contains(event.target) && !navLinks.contains(event.target)) {
                hamburgerMenu.classList.remove('active');
                navLinks.classList.remove('active');
            }
        });
        
        // Close menu when clicking on a nav link
        const navLinkElements = navLinks.querySelectorAll('.nav-link');
        navLinkElements.forEach(link => {
            link.addEventListener('click', () => {
                hamburgerMenu.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
    }
}

// Function to show mobile button if on mobile screen
function showMobileButtonIfNeeded() {
    const isMobile = window.innerWidth <= 768;
    const mobileButton = document.querySelector('.mobile-get-started');
    
    if (isMobile && mobileButton && !mobileButton.classList.contains('show')) {
        setTimeout(() => {
            mobileButton.classList.add('show');
        }, 100);
    }
}

// Start animation when page loads
document.addEventListener('DOMContentLoaded', () => {
    animateTexts();
    initHamburgerMenu();
    
    // Fallback to ensure mobile button appears
    setTimeout(showMobileButtonIfNeeded, 4000);
});

// Handle orientation changes
window.addEventListener('orientationchange', handleOrientationChange);
window.addEventListener('resize', handleOrientationChange);