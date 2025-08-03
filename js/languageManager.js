/* ========================================
   LANGUAGE MANAGEMENT SYSTEM
======================================== */

class LanguageManager {
    constructor() {
        // Get saved language FIRST, before any initialization
        this.currentLanguage = localStorage.getItem('selectedLanguage') || 'en';
        console.log(`LanguageManager constructor: Starting with language ${this.currentLanguage}`);
        
        this.translations = {};
        this.quotes = {}; // Cache for quotes
        this.isReady = false; // Track if initialization is complete
        this.supportedLanguages = ['en', 'hi', 'bho', 'mr', 'te'];
        this.languageNames = {
            'en': 'English',
            'hi': 'हिंदी', 
            'bho': 'भोजपुरी',
            'mr': 'मराठी',
            'te': 'తెలుగు'
        };
        
        // Initialize asynchronously
        this.init();
    }

    /**
     * Initialize the language manager
     */
    async init() {
        console.log('LanguageManager: Starting initialization...');
        
        // Debug localStorage
        const savedLang = localStorage.getItem('selectedLanguage');
        console.log('LanguageManager: localStorage selectedLanguage:', savedLang);
        console.log('LanguageManager: currentLanguage set to:', this.currentLanguage);
        
        // Wait for components to load if they exist
        await this.waitForComponents();
        
        // Load the current language and quotes FIRST
        await this.loadLanguage(this.currentLanguage);
        
        // Preload quotes for all languages to prevent GitHub Pages loading issues
        await this.preloadAllQuotes();
        
        // Apply translations to the page
        this.applyTranslations();
        
        // Set up language icon
        this.setupLanguageIcon();
        
        // Set up language dropdown
        setTimeout(() => {
            this.setupLanguageDropdown();
        }, 200);
        
        // Mark language manager as ready
        this.isReady = true;
        
        // Dispatch ready event
        document.dispatchEvent(new CustomEvent('languageManagerReady', {
            detail: { language: this.currentLanguage, quotes: this.quotes[this.currentLanguage] }
        }));
        
        console.log(`LanguageManager: Initialization complete with language: ${this.currentLanguage}`);
    }

    /**
     * Preload quotes for all supported languages
     */
    async preloadAllQuotes() {
        console.log('Preloading quotes for all languages...');
        const loadPromises = this.supportedLanguages.map(lang => 
            this.loadQuotes(lang).catch(error => {
                console.warn(`Failed to preload quotes for ${lang}:`, error);
                // Return empty array as fallback
                this.quotes[lang] = [this.getText('home.motto') || "Welcome to MindBridge!"];
                return this.quotes[lang];
            })
        );
        
        try {
            await Promise.all(loadPromises);
            console.log('All quotes preloaded successfully');
            console.log('Quotes cache:', Object.keys(this.quotes));
        } catch (error) {
            console.warn('Some quotes failed to preload:', error);
        }
    }

    /**
     * Wait for components to be loaded
     */
    async waitForComponents() {
        return new Promise(resolve => {
            const checkComponents = () => {
                const languageBtn = document.getElementById('languageDropdownBtn');
                const languageMenu = document.getElementById('languageDropdownMenu');
                const navbar = document.querySelector('.navbar');
                
                // Check if components are loaded or if there's no navbar container
                if ((languageBtn && languageMenu) || !document.getElementById('navbar-container')) {
                    console.log('Components are ready');
                    resolve();
                } else {
                    console.log('Waiting for components to load...');
                    setTimeout(checkComponents, 100);
                }
            };
            checkComponents();
        });
    }

    /**
     * Load language file
     * @param {string} languageCode - Language code (e.g., 'en', 'hi', 'bho', 'mr', 'te')
     * @param {boolean} isUserInitiated - Whether this is a user-initiated change
     */
    async loadLanguage(languageCode, isUserInitiated = false) {
        try {
            console.log(`Loading language: ${languageCode} (user initiated: ${isUserInitiated})`);
            
            // Since all HTML files are now in root, we don't need to check for subfolders
            const basePath = './languages/';
            
            const response = await fetch(`${basePath}${languageCode}.json`);
            
            if (!response.ok) {
                throw new Error(`Failed to load language: ${languageCode}`);
            }
            this.translations = await response.json();
            this.currentLanguage = languageCode;
            
            // Load quotes for this language
            await this.loadQuotes(languageCode);
            
            // Save to localStorage
            localStorage.setItem('selectedLanguage', languageCode);
            console.log(`Language ${languageCode} saved to localStorage`);
            
            // Update language icon
            this.updateLanguageIcon();
            
            // Only dispatch language change event for user-initiated changes
            if (isUserInitiated) {
                document.dispatchEvent(new CustomEvent('languageChanged', { 
                    detail: { language: languageCode, quotes: this.quotes[languageCode] } 
                }));
            }
            
            console.log(`Successfully loaded language: ${languageCode}`);
            return this.translations;
        } catch (error) {
            console.error('Error loading language:', error);
            // Fallback to English if loading fails
            if (languageCode !== 'en') {
                console.log('Falling back to English');
                return this.loadLanguage('en', isUserInitiated);
            }
        }
    }

    /**
     * Load quotes for a specific language
     * @param {string} languageCode - Language code
     */
    async loadQuotes(languageCode) {
        try {
            if (this.quotes[languageCode]) {
                // Quotes already cached
                return this.quotes[languageCode];
            }

            const quotesPath = `./text/quotes_${languageCode}.json`;
            let response;
            
            try {
                response = await fetch(quotesPath);
                if (!response.ok) throw new Error('Language quotes not found');
            } catch {
                // Fallback to English quotes
                response = await fetch('./text/quotes_en.json');
                console.log(`Quotes not found for ${languageCode}, using English fallback`);
            }

            const quotes = await response.json();
            this.quotes[languageCode] = quotes;
            
            console.log(`Loaded ${quotes.length} quotes for language: ${languageCode}`);
            return quotes;
        } catch (error) {
            console.error('Error loading quotes:', error);
            // Return default quote if all else fails
            this.quotes[languageCode] = [this.getText('home.motto') || "Welcome to MindBridge!"];
            return this.quotes[languageCode];
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
                // Since all files are in root, use simple path
                const basePath = './assets/';
                
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
            await this.loadLanguage(languageCode, true); // Mark as user-initiated
            this.applyTranslations();
            this.updateSelectedLanguage();
            
            console.log(`Language changed to: ${languageCode}`);
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
     * Set up language icon based on theme
     */
    setupLanguageIcon() {
        // Update icon based on current theme
        this.updateLanguageIcon();
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
            console.log(`Updated dropdown selection to: ${this.currentLanguage}`);
        } else {
            console.log('Language dropdown menu not found, will retry later');
            // Retry after a short delay if elements aren't ready
            setTimeout(() => {
                if (document.getElementById('languageDropdownMenu')) {
                    this.updateSelectedLanguage();
                }
            }, 500);
        }
    }

    /**
     * Force update language selection - use this to ensure persistence
     */
    forceUpdateLanguageSelection() {
        // Get the current language from localStorage to ensure accuracy
        const savedLanguage = localStorage.getItem('selectedLanguage');
        if (savedLanguage && savedLanguage !== this.currentLanguage) {
            console.log(`Language mismatch detected. Saved: ${savedLanguage}, Current: ${this.currentLanguage}`);
            this.currentLanguage = savedLanguage;
        }
        
        // Apply translations for the correct language
        this.applyTranslations();
        
        // Update dropdown selection
        this.updateSelectedLanguage();
        
        console.log(`Forced language update to: ${this.currentLanguage}`);
    }

    /**
     * Get current language
     * @returns {string} Current language code
     */
    getCurrentLanguage() {
        return this.currentLanguage;
    }

    /**
     * Get a random quote for the current language
     */
    getRandomQuote() {
        const currentQuotes = this.quotes[this.currentLanguage];
        if (currentQuotes && currentQuotes.length > 0) {
            const randomIndex = Math.floor(Math.random() * currentQuotes.length);
            const quote = currentQuotes[randomIndex];
            console.log(`Selected quote for ${this.currentLanguage}:`, quote);
            return quote;
        }
        
        console.log(`No quotes available for ${this.currentLanguage}, using fallback`);
        // Fallback to motto from translations
        return this.getText('home.motto') || "Welcome to MindBridge!";
    }

    /**
     * Get all quotes for the current language
     */
    getAllQuotes() {
        return this.quotes[this.currentLanguage] || [];
    }

    /**
     * Set up language dropdown functionality
     */
    setupLanguageDropdown() {
        // Use a more robust element finder with retries
        const findAndSetupDropdown = (attempts = 0) => {
            const languageBtn = document.getElementById('languageDropdownBtn');
            const languageMenu = document.getElementById('languageDropdownMenu');

            if (languageBtn && languageMenu) {
                console.log('Setting up language dropdown...');
                
                // Check if already set up to prevent duplicates
                if (languageBtn.hasAttribute('data-dropdown-setup')) {
                    console.log('Language dropdown already set up');
                    return;
                }
                
                // Mark as set up
                languageBtn.setAttribute('data-dropdown-setup', 'true');
                
                // Toggle dropdown on button click
                languageBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Language button clicked - toggling dropdown');
                    
                    const isShown = languageMenu.classList.contains('show');
                    console.log('Dropdown currently shown:', isShown);
                    
                    languageMenu.classList.toggle('show');
                    
                    console.log('Dropdown now shown:', languageMenu.classList.contains('show'));
                    this.updateSelectedLanguage();
                });

                // Close dropdown when clicking outside
                document.addEventListener('click', (e) => {
                    if (!languageBtn.contains(e.target) && !languageMenu.contains(e.target)) {
                        languageMenu.classList.remove('show');
                    }
                });

                // Handle language selection
                const languageOptions = languageMenu.querySelectorAll('.language-option');
                languageOptions.forEach(option => {
                    option.addEventListener('click', async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const selectedLang = option.getAttribute('data-lang');
                        
                        console.log('Language option clicked:', selectedLang);
                        
                        if (selectedLang && selectedLang !== this.currentLanguage) {
                            console.log(`User switching language to: ${selectedLang}`);
                            
                            // Remove previous selected state
                            languageOptions.forEach(opt => opt.classList.remove('selected'));
                            // Add selected state to clicked option
                            option.classList.add('selected');
                            
                            // Use changeLanguage method which marks as user-initiated
                            await this.changeLanguage(selectedLang);
                            
                            // Close dropdown
                            languageMenu.classList.remove('show');
                        }
                    });
                });

                // Set initial selected state
                this.updateSelectedLanguage();
                
                console.log('Language dropdown setup complete');
            } else {
                console.warn('Language dropdown elements not found (attempt', attempts + 1, '):', { 
                    languageBtn: !!languageBtn, 
                    languageMenu: !!languageMenu 
                });
                
                // Retry up to 10 times
                if (attempts < 10) {
                    setTimeout(() => findAndSetupDropdown(attempts + 1), 200);
                } else {
                    console.error('Failed to find language dropdown elements after 10 attempts');
                }
            }
        };
        
        findAndSetupDropdown();
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
        // Delay theme toggle setup to allow for component loading
        setTimeout(() => {
            this.setupThemeToggle();
        }, 100);
    }

    async applyTheme(theme) {
        document.body.setAttribute('data-theme', theme);
        this.currentTheme = theme;
        localStorage.setItem('selectedTheme', theme);
        
        // Update theme toggle icon - wait for it to be available
        setTimeout(() => {
            this.updateThemeIcon(theme);
        }, 50);
        
        // Update language icon based on new theme
        if (window.languageManager) {
            window.languageManager.updateLanguageIcon();
            await window.languageManager.loadLanguage(window.languageManager.currentLanguage);
            window.languageManager.applyTranslations();
        }
    }

    updateThemeIcon(theme) {
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            const icon = themeToggle.querySelector('img');
            if (icon) {
                const basePath = './assets/';
                icon.src = theme === 'light' ? 
                    `${basePath}dark-mode.svg` : `${basePath}light-mode.svg`;
                icon.alt = theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode';
            }
        }
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
    }

    setupThemeToggle() {
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle && !themeToggle.hasAttribute('data-theme-listener')) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
            themeToggle.setAttribute('data-theme-listener', 'true');
            // Update icon on setup
            this.updateThemeIcon(this.currentTheme);
        } else if (!themeToggle) {
            // Retry setup if theme toggle not found yet
            setTimeout(() => {
                this.setupThemeToggle();
            }, 100);
        }
    }
}

// Create global instances (only if they don't exist)
if (!window.languageManager) {
    window.languageManager = new LanguageManager();
}
if (!window.themeManager) {
    window.themeManager = new ThemeManager();
}

// Ensure language persistence across page navigation
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, ensuring language persistence...');
    
    setTimeout(() => {
        if (window.languageManager) {
            // Force restore language from localStorage
            const savedLang = localStorage.getItem('selectedLanguage');
            if (savedLang && savedLang !== window.languageManager.currentLanguage) {
                console.log(`Restoring language from localStorage: ${savedLang}`);
                window.languageManager.currentLanguage = savedLang;
                window.languageManager.applyTranslations();
            }
            
            // Setup dropdown if it exists
            if (typeof window.languageManager.setupLanguageDropdown === 'function') {
                window.languageManager.setupLanguageDropdown();
            }
            
            // Update selection
            if (typeof window.languageManager.updateSelectedLanguage === 'function') {
                window.languageManager.updateSelectedLanguage();
            }
        }
    }, 300);
});

// Final fallback on window load
window.addEventListener('load', () => {
    setTimeout(() => {
        if (window.languageManager && window.languageManager.updateSelectedLanguage) {
            window.languageManager.updateSelectedLanguage();
            console.log('Final language state update on window load');
        }
    }, 500);
});

/* ========================================
   LANGUAGE-AWARE COMPONENTS
======================================== */

/**
 * Update the random quote function to be language-aware
 */
export async function getRandomQuote() {
    try {
        // Wait for language manager to be ready
        if (window.languageManager) {
            if (!window.languageManager.isReady) {
                console.log('Waiting for language manager to be ready...');
                // Wait for the ready event
                await new Promise(resolve => {
                    const handleReady = () => {
                        document.removeEventListener('languageManagerReady', handleReady);
                        resolve();
                    };
                    document.addEventListener('languageManagerReady', handleReady);
                    
                    // Fallback timeout in case event doesn't fire
                    setTimeout(() => {
                        document.removeEventListener('languageManagerReady', handleReady);
                        resolve();
                    }, 3000);
                });
            }
            
            // Now use the language manager's cached quotes
            const quote = window.languageManager.getRandomQuote();
            console.log('Got quote from language manager:', quote);
            return quote;
        }
        
        // Fallback if language manager is not available
        console.log('Language manager not available, using fallback');
        const currentLang = localStorage.getItem('selectedLanguage') || 'en';
        const quotesFile = `./text/quotes_${currentLang}.json`;

        let response;
        try {
            response = await fetch(quotesFile);
            if (!response.ok) throw new Error('Language quotes not found');
        } catch {
            response = await fetch('./text/quotes_en.json');
        }

        const quotes = await response.json();
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

        return randomQuote || "Welcome to MindBridge!";
    } catch (error) {
        console.error('Error loading quotes:', error);
        return window.languageManager?.getText?.('home.motto') || "Welcome to MindBridge!";
    }
}


// Listen for language changes to update dynamic content
document.addEventListener('languageChanged', async (event) => {
    console.log('Language changed event received:', event.detail);
    
    // Only update quotes if this is a user-initiated language change (not initial load)
    if (event.detail.language && window.languageManager && window.languageManager.isReady) {
        // Check if we're on the home page before trying to re-animate
        const isHomePage = window.location.pathname === '/' || 
                          window.location.pathname === '/index.html' || 
                          window.location.pathname.endsWith('/index.html') ||
                          window.location.pathname === '';
        
        // Re-run animations with new language if on home page
        if (isHomePage) {
            const mottoElements = document.querySelectorAll('.motto-line');
            if (mottoElements.length > 0) {
                // Clear existing content first
                mottoElements.forEach(el => el.textContent = '');
                
                // Get new quote and update
                const newQuote = window.languageManager.getRandomQuote();
                console.log('Updating quote to:', newQuote);
                
                // Re-animate with new quote
                if (window.typeWriter && typeof window.typeWriter === 'function') {
                    await window.typeWriter(mottoElements[0], newQuote, 50);
                } else {
                    mottoElements[0].textContent = newQuote;
                }
            }
        }
        
        // Update any other quote displays on the page
        const quoteElements = document.querySelectorAll('[data-quote]');
        quoteElements.forEach(element => {
            const newQuote = window.languageManager.getRandomQuote();
            element.textContent = newQuote;
        });
    }
});
