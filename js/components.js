/**
 * Shared HTML components for the MindBridge application
 */

export class ComponentManager {
    /**
     * Generate the navigation bar HTML
     */
    static getNavbarHTML(currentPage = '') {
        return `
            <nav class="navbar">
                <div class="navbar-logo">
                    <img src="assets/logo.png" alt="MindBridge Logo" class="logo-image">
                    <a href="index.html" class="design_text logo-text" data-translate="navbar.logo">MindBridge</a>
                </div>

                <div class="navbar-content">
                    <!-- Language Dropdown -->
                    <div class="language-dropdown">
                        <button id="languageDropdownBtn" class="language-toggle" aria-label="Select language">
                            <img src="assets/language_light.svg" alt="Language" class="language-icon">
                        </button>
                        <div id="languageDropdownMenu" class="language-dropdown-menu">
                            <div class="language-option" data-lang="en">English</div>
                            <div class="language-option" data-lang="hi">हिंदी</div>
                            <div class="language-option" data-lang="bho">भोजपुरी</div>
                            <div class="language-option" data-lang="mr">मराठी</div>
                            <div class="language-option" data-lang="te">తెలుగు</div>
                        </div>
                    </div>

                    <!-- Theme Toggle -->
                    <button id="themeToggle" class="theme-toggle" aria-label="Toggle theme">
                        <img src="assets/dark-mode.svg" alt="Switch to dark mode" class="theme-icon">
                    </button>

                    <!-- Hamburger Menu (Mobile Only) -->
                    <button class="hamburger-menu" id="hamburgerMenu" aria-label="Toggle navigation">
                        <span class="hamburger-line"></span>
                        <span class="hamburger-line"></span>
                        <span class="hamburger-line"></span>
                    </button>

                    <!-- Navigation Links -->
                    <div class="nav-links" id="navLinks">
                        <a href="about.html" class="regular_text nav-link ${currentPage === 'about' ? 'active' : ''}" data-translate="navbar.aboutUs">ABOUT US</a>
                        <a href="work.html" class="regular_text nav-link ${currentPage === 'work' ? 'active' : ''}" data-translate="navbar.workWithUs">WORK WITH US</a>
                        <a href="events.html" class="regular_text nav-link ${currentPage === 'events' ? 'active' : ''}" data-translate="navbar.events">EVENTS</a>
                        <a href="contact.html" class="regular_text nav-link contact-link ${currentPage === 'contact' ? 'active' : ''}" data-translate="navbar.contactUs">CONTACT US</a>
                    </div>

                    <!-- Desktop Get Started Button -->
                    <a href="get-started.html" class="regular_text nav-link login_button desktop-get-started" data-translate="navbar.getStarted">
                        GET STARTED ➜
                    </a>
                </div>
            </nav>
        `;
    }

    /**
     * Generate the HTML head section
     */
    static getHeadHTML(title = 'MindBridge', additionalCSS = []) {
        const cssLinks = additionalCSS.map(css => `    <link rel="stylesheet" href="${css}">`).join('\n');
        
        return `    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>

    <!-- Stylesheets -->
    <link rel="stylesheet" href="home_style.css">
${cssLinks}

    <!-- Favicon -->
    <link rel="icon" type="image/x-icon" href="assets/logo.png">

    <!-- Fonts -->
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Playwrite+HU:wght@100..400&family=Playwrite+PL:wght@100..400&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Kalam:wght@300;400;700&family=Playwrite+HU:wght@100..400&family=Playwrite+PL:wght@100..400&display=swap');
    </style>

    <!-- Scripts -->
    <script src="home_script.js" type="module"></script>
    <script src="js/languageManager.js" type="module"></script>
    <script src="js/components.js" type="module"></script>`;
    }

    /**
     * Generate the footer HTML
     */
    static getFooterHTML() {
        return `
            <footer class="bottom-section regular_text">
                <!-- Footer content can be added here -->
            </footer>

            <!-- Scripts -->
            <script src="js/languageManager.js"></script>
        `;
    }

    /**
     * Generate mobile get started button
     */
    static getMobileGetStartedHTML() {
        return `
            <div class="mobile-get-started">
                <a href="get-started.html" class="regular_text nav-link login_button" data-translate="navbar.getStarted">
                    GET STARTED ➜
                </a>
            </div>
        `;
    }

    /**
     * Initialize components on page load
     */
    static initializePage(currentPage = '') {
        console.log(`ComponentManager: Initializing page "${currentPage}"`);
        
        // Insert navbar only if container exists and is empty
        const navbarContainer = document.getElementById('navbar-container');
        if (navbarContainer && !navbarContainer.hasChildNodes()) {
            console.log('ComponentManager: Loading navbar');
            navbarContainer.innerHTML = this.getNavbarHTML(currentPage);
            
            // Initialize theme toggle after navbar is loaded
            setTimeout(() => {
                if (window.themeManager) {
                    window.themeManager.setupThemeToggle();
                }
            }, 50);
        } else if (navbarContainer && navbarContainer.hasChildNodes()) {
            console.log('ComponentManager: Navbar already loaded');
        }

        // Insert footer for non-home pages only if container exists and is empty
        const footerContainer = document.getElementById('footer-container');
        if (footerContainer && !footerContainer.hasChildNodes()) {
            console.log('ComponentManager: Loading footer');
            footerContainer.innerHTML = this.getFooterHTML();
        } else if (footerContainer && footerContainer.hasChildNodes()) {
            console.log('ComponentManager: Footer already loaded');
        }

        // Insert mobile button for non-home pages only if container exists and is empty
        const mobileButtonContainer = document.getElementById('mobile-button-container');
        if (mobileButtonContainer && !mobileButtonContainer.hasChildNodes()) {
            console.log('ComponentManager: Loading mobile button');
            mobileButtonContainer.innerHTML = this.getMobileGetStartedHTML();
        } else if (mobileButtonContainer && mobileButtonContainer.hasChildNodes()) {
            console.log('ComponentManager: Mobile button already loaded');
        }
        
        console.log('ComponentManager: Page initialization complete');
    }
}

// Auto-initialize when module is loaded
document.addEventListener('DOMContentLoaded', () => {
    const currentPage = document.body.getAttribute('data-page');
    if (currentPage) {
        // Check if navbar already exists to prevent duplicate loading
        if (!document.querySelector('.navbar')) {
            console.log(`Initializing components for page: ${currentPage}`);
            ComponentManager.initializePage(currentPage);
        } else {
            console.log(`Components already loaded for page: ${currentPage}`);
        }
    }
});
