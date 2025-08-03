/* ========================================
   LANGUAGE MANAGEMENT SYSTEM
======================================== */

class LanguageManager {
    constructor() {
        this.currentLanguage = 'en';
        this.translations = {};
        this.supportedLanguages = ['en', 'hi', 'bho', 'mr', 'te'];
        this.languageNames = {
            'en': 'English',
            'hi': 'हिंदी', 
            'bho': 'भोजपुरी',
            'mr': 'मराठी',
            'te': 'తెలుగు'
        };
        this.init();
    }

    /**
     * Initialize the language manager
     */
    async init() {
        // Get saved language from localStorage or default to 'en'
        this.currentLanguage = localStorage.getItem('selectedLanguage') || 'en';
        
        // Load the current language
        await this.loadLanguage(this.currentLanguage);
        
        // Apply translations to the page
        this.applyTranslations();
        
        // Set up language icon if it exists
        this.setupLanguageIcon();
    }

    /**
     * Load language file
     * @param {string} languageCode - Language code (e.g., 'en', 'hi', 'bho', 'mr', 'te')
     */
    async loadLanguage(languageCode) {
        try {
            // Determine the correct path based on current location
            const isInSubfolder = window.location.pathname.includes('/about/') || 
                                 window.location.pathname.includes('/work/') || 
                                 window.location.pathname.includes('/events/') || 
                                 window.location.pathname.includes('/contact/') ||
                                 window.location.pathname.includes('/get-started/');
            
            const basePath = isInSubfolder ? '../languages/' : './languages/';
            
            const response = await fetch(`${basePath}${languageCode}.json`);
            
            if (!response.ok) {
                throw new Error(`Failed to load language: ${languageCode}`);
            }
            this.translations = await response.json();
            this.currentLanguage = languageCode;
            
            // Save to localStorage
            localStorage.setItem('selectedLanguage', languageCode);
            
            // Update language icon
            this.updateLanguageIcon();
            
            return this.translations;
        } catch (error) {
            console.error('Error loading language:', error);
            // Fallback to English if loading fails
            if (languageCode !== 'en') {
                return this.loadLanguage('en');
            }
        }
    }

    /**
     * Update language logo based on current theme
     */
    updateLanguageIcon() {
        const languageBtn = document.getElementById('languageDropdownBtn');
        if (languageBtn) {
            const icon = languageBtn.querySelector('img');
            if (icon) {
                const isInSubfolder = window.location.pathname.includes('/about/') || 
                                     window.location.pathname.includes('/work/') || 
                                     window.location.pathname.includes('/events/') || 
                                     window.location.pathname.includes('/contact/') ||
                                     window.location.pathname.includes('/get-started/');
                const basePath = isInSubfolder ? '../assets/' : './assets/';
                
                const currentTheme = document.body.getAttribute('data-theme') || 'light';
                const iconFile = currentTheme === 'dark' ? 'language_dark.svg' : 'language_light.svg';
                
                icon.src = `${basePath}${iconFile}`;
                icon.alt = 'Language selector';
            }
        }
    }

    /**
     * Get translation for a key
     * @param {string} key - Translation key (e.g., 'navbar.aboutUs')
     * @returns {string} - Translated text
     */
    getText(key) {
        const keys = key.split('.');
        let result = this.translations;
        
        for (const k of keys) {
            if (result && result[k]) {
                result = result[k];
            } else {
                console.warn(`Translation key not found: ${key}`);
                return key; // Return key if translation not found
            }
        }
        
        return result;
    }

    /**
     * Apply translations to elements with data-translate attribute
     */
    applyTranslations() {
        const elements = document.querySelectorAll('[data-translate]');
        
        elements.forEach(element => {
            const key = element.getAttribute('data-translate');
            const translation = this.getText(key);
            
            if (element.hasAttribute('data-translate-html')) {
                element.innerHTML = translation;
            } else {
                element.textContent = translation;
            }
            
            // Apply language-specific font for stylized Hindi, Bhojpuri, and Marathi text
            if (['hi', 'bho', 'mr'].includes(this.currentLanguage) && 
                (element.classList.contains('design_text') || element.classList.contains('motto-line'))) {
                element.setAttribute('lang', this.currentLanguage);
            } else {
                element.removeAttribute('lang');
            }
        });
    }

    /**
     * Change language
     * @param {string} languageCode - New language code
     */
    async changeLanguage(languageCode) {
        if (this.supportedLanguages.includes(languageCode)) {
            await this.loadLanguage(languageCode);
            this.applyTranslations();
            this.updateSelectedLanguage();
            
            // Trigger custom event for other components to react
            document.dispatchEvent(new CustomEvent('languageChanged', {
                detail: { language: languageCode, translations: this.translations }
            }));
        }
    }

    /**
     * Cycle to next language
     */
    async cycleLanguage() {
        const currentIndex = this.supportedLanguages.indexOf(this.currentLanguage);
        const nextIndex = (currentIndex + 1) % this.supportedLanguages.length;
        const nextLanguage = this.supportedLanguages[nextIndex];
        await this.changeLanguage(nextLanguage);
    }

    /**
     * Set up language dropdown functionality
     */
    setupLanguageIcon() {
        const languageBtn = document.getElementById('languageDropdownBtn');
        const languageMenu = document.getElementById('languageDropdownMenu');
        
        if (languageBtn && languageMenu) {
            // Toggle dropdown on button click
            languageBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                languageMenu.classList.toggle('show');
                this.updateSelectedLanguage();
            });

            // Handle language option clicks
            const languageOptions = languageMenu.querySelectorAll('.language-option');
            languageOptions.forEach(option => {
                option.addEventListener('click', (e) => {
                    const selectedLang = option.getAttribute('data-lang');
                    this.changeLanguage(selectedLang);
                    languageMenu.classList.remove('show');
                });
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!languageBtn.contains(e.target) && !languageMenu.contains(e.target)) {
                    languageMenu.classList.remove('show');
                }
            });

            // Update icon based on current theme
            this.updateLanguageIcon();
        }
    }

    /**
     * Update selected language in dropdown
     */
    updateSelectedLanguage() {
        const languageMenu = document.getElementById('languageDropdownMenu');
        if (languageMenu) {
            const options = languageMenu.querySelectorAll('.language-option');
            options.forEach(option => {
                option.classList.remove('selected');
                if (option.getAttribute('data-lang') === this.currentLanguage) {
                    option.classList.add('selected');
                }
            });
        }
    }

    /**
     * Get current language
     * @returns {string} Current language code
     */
    getCurrentLanguage() {
        return this.currentLanguage;
    }

    /**
     * Get all supported languages
     * @returns {Array} Array of supported language codes
     */
    getSupportedLanguages() {
        return this.supportedLanguages;
    }
}

/* ========================================
   THEME MANAGEMENT SYSTEM
======================================== */

class ThemeManager {
    constructor() {
        this.currentTheme = localStorage.getItem('selectedTheme') || 'light';
        this.init();
    }

    init() {
        this.applyTheme(this.currentTheme);
        this.setupThemeToggle();
    }

    async applyTheme(theme) {
        document.body.setAttribute('data-theme', theme);
        this.currentTheme = theme;
        localStorage.setItem('selectedTheme', theme);
        
        // Update theme toggle icon
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            const icon = themeToggle.querySelector('img');
            if (icon) {
                const isInSubfolder = window.location.pathname.includes('/about/') || 
                                     window.location.pathname.includes('/work/') || 
                                     window.location.pathname.includes('/events/') || 
                                     window.location.pathname.includes('/contact/') ||
                                     window.location.pathname.includes('/get-started/');
                const basePath = isInSubfolder ? '../assets/' : './assets/';
                
                icon.src = theme === 'light' ? 
                    `${basePath}dark-mode.svg` : `${basePath}light-mode.svg`;
                icon.alt = theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode';
            }
        }
        
        // Update language icon based on new theme
        if (window.languageManager) {
            window.languageManager.updateLanguageIcon();
            await window.languageManager.loadLanguage(window.languageManager.currentLanguage);
            window.languageManager.applyTranslations();
        }
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
    }

    setupThemeToggle() {
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }
    }
}

// Create global instances
window.languageManager = new LanguageManager();
window.themeManager = new ThemeManager();

/* ========================================
   LANGUAGE-AWARE COMPONENTS
======================================== */

/**
 * Update the random quote function to be language-aware
 */
async function getRandomQuote() {
    try {
        const currentLang = window.languageManager.getCurrentLanguage();
        const quotesFile = `./text/quotes_${currentLang}.json`;
        
        // Try to load language-specific quotes, fallback to English
        let response;
        try {
            response = await fetch(quotesFile);
            if (!response.ok) throw new Error('Language quotes not found');
        } catch {
            response = await fetch('./text/quotes_db.json');
        }
        
        const quotes = await response.json();
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        return randomQuote;
    } catch (error) {
        console.error('Error loading quotes:', error);
        return window.languageManager.getText('home.motto');
    }
}

// Listen for language changes to update dynamic content
document.addEventListener('languageChanged', async (event) => {
    // Re-run animations with new language if on home page
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
        // Update the random quote in the animation
        const mottoElements = document.querySelectorAll('.motto-line');
        if (mottoElements.length > 0) {
            const newQuote = await getRandomQuote();
            mottoElements[0].textContent = newQuote;
        }
    }
});
