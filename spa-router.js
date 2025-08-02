/* ========================================
   SPA ROUTER SYSTEM
======================================== */

class SPARouter {
    constructor() {
        this.routes = {};
        this.currentRoute = null;
        this.contentContainer = null;
        this.loadingIndicator = null;
        
        console.log('SPARouter: Constructor called');
        this.init();
    }

    init() {
        console.log('SPARouter: Init called, readyState:', document.readyState);
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        console.log('SPARouter: Setup called');
        this.contentContainer = document.getElementById('app-content');
        this.loadingIndicator = document.getElementById('loading-indicator');
        
        console.log('Content container found:', !!this.contentContainer);
        console.log('Loading indicator found:', !!this.loadingIndicator);
        
        if (!this.contentContainer) {
            console.error('app-content container not found!');
            return;
        }
        
        // Define routes
        this.defineRoutes();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Load initial route
        this.handleRouteChange();
    }

    defineRoutes() {
        this.routes = {
            'home': {
                title: 'MindBridge - Home',
                content: this.getHomeContent
            },
            'about': {
                title: 'MindBridge - About Us',
                content: this.getAboutContent
            },
            'work': {
                title: 'MindBridge - Work With Us',
                content: this.getWorkContent
            },
            'events': {
                title: 'MindBridge - Events',
                content: this.getEventsContent
            },
            'contact': {
                title: 'MindBridge - Contact Us',
                content: this.getContactContent
            },
            'get-started': {
                title: 'MindBridge - Get Started',
                content: this.getGetStartedContent
            },
            'dashboard': {
                title: 'MindBridge - Dashboard',
                content: this.getDashboardContent
            }
        };
        console.log('Routes defined:', Object.keys(this.routes));
    }

    setupEventListeners() {
        // Listen for hash changes
        window.addEventListener('hashchange', () => this.handleRouteChange());
        
        // Handle navigation clicks
        document.addEventListener('click', (e) => {
            if (e.target.matches('a[href^="#"]')) {
                e.preventDefault();
                const hash = e.target.getAttribute('href');
                window.location.hash = hash;
            }
        });
    }

    async handleRouteChange() {
        const hash = window.location.hash.slice(1); // Remove #
        const route = hash || 'home'; // Default to home
        
        console.log('Handling route change to:', route);
        
        if (this.routes[route]) {
            await this.loadRoute(route);
        } else {
            console.log('Route not found, loading home');
            await this.loadRoute('home'); // Fallback to home
        }
    }

    async loadRoute(routeName) {
        if (this.currentRoute === routeName) return;
        
        console.log('Loading route:', routeName);
        this.showLoading();
        
        try {
            const route = this.routes[routeName];
            
            // Update page title
            document.title = route.title;
            
            // Get content
            const content = await route.content.call(this);
            
            // Update content
            if (this.contentContainer) {
                this.contentContainer.innerHTML = content;
                console.log('Content loaded successfully');
            } else {
                console.error('Content container not available!');
            }
            
            // Update current route
            this.currentRoute = routeName;
            
            // Update navigation active state
            this.updateNavigationState(routeName);
            
            // Execute route-specific scripts
            this.executeRouteScripts(routeName);
            
        } catch (error) {
            console.error('Error loading route:', error);
            if (this.contentContainer) {
                this.contentContainer.innerHTML = this.getErrorContent();
            }
        } finally {
            this.hideLoading();
        }
    }

    updateNavigationState(routeName) {
        // Remove active class from all nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        // Add active class to current route
        const activeLink = document.querySelector(`a[href="#${routeName}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }

    showLoading() {
        if (this.loadingIndicator) {
            this.loadingIndicator.style.display = 'flex';
        }
    }

    hideLoading() {
        if (this.loadingIndicator) {
            this.loadingIndicator.style.display = 'none';
        }
    }

    // Route Content Methods
    getHomeContent() {
        return `
            <main class="main-container">
                <section class="hero-section">
                    <div class="motto design_text">
                        <span class="motto-line"></span>
                        <img src="assets/star.svg" alt="Decorative star" class="star-icon" id="star">
                    </div>

                    <div class="mobile-get-started">
                        <a href="#get-started" class="regular_text nav-link login_button">
                            GET STARTED ➜
                        </a>
                    </div>
                </section>
            </main>

            <footer class="bottom-section regular_text">
                <div class="support-message">
                    <span class="support-text">
                        You <strong>don't</strong> have<br>
                        to <strong>struggle</strong> in<br>
                        silence!<br><br>
                        We are here just for you 😁
                    </span>
                </div>

                <div class="meditation-image">
                    <img src="assets/mediating.svg" alt="Person meditating" class="meditation-icon">
                </div>

                <div class="grief-content">
                    <h2 class="design_text grief-title">Grief</h2>
                    <p class="grief-description">
                        Each day we learn of the griefs and tribulations<br>
                        which affect our constituents or ourselves.
                    </p>
                </div>
            </footer>
        `;
    }

    getAboutContent() {
        return `
            <main class="main-container">
                <section class="content-section">
                    <h1 class="design_text">About MindBridge</h1>
                    <div class="content-wrapper">
                        <p class="regular_text">
                            MindBridge is dedicated to supporting mental health and well-being in our community. 
                            We believe that everyone deserves access to mental health resources and support.
                        </p>
                        <div class="feature-grid">
                            <div class="feature-card">
                                <h3>Our Mission</h3>
                                <p>To bridge the gap between mental health struggles and accessible support.</p>
                            </div>
                            <div class="feature-card">
                                <h3>Our Vision</h3>
                                <p>A world where mental health is prioritized and supported without stigma.</p>
                            </div>
                            <div class="feature-card">
                                <h3>Our Values</h3>
                                <p>Compassion, understanding, accessibility, and community support.</p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        `;
    }

    getWorkContent() {
        return `
            <main class="main-container">
                <section class="content-section">
                    <h1 class="design_text">Work With Us</h1>
                    <div class="content-wrapper">
                        <p class="regular_text">
                            Join our mission to support mental health in the community. We're always looking for 
                            passionate individuals who want to make a difference.
                        </p>
                        <div class="opportunities-grid">
                            <div class="opportunity-card">
                                <h3>Volunteer Counselor</h3>
                                <p>Provide peer support and guidance to community members.</p>
                                <a href="#contact" class="regular_text apply-btn">Apply Now</a>
                            </div>
                            <div class="opportunity-card">
                                <h3>Event Coordinator</h3>
                                <p>Help organize mental health awareness events and workshops.</p>
                                <a href="#contact" class="regular_text apply-btn">Apply Now</a>
                            </div>
                            <div class="opportunity-card">
                                <h3>Content Creator</h3>
                                <p>Create educational content about mental health topics.</p>
                                <a href="#contact" class="regular_text apply-btn">Apply Now</a>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        `;
    }

    getEventsContent() {
        return `
            <main class="main-container">
                <section class="content-section">
                    <h1 class="design_text">Upcoming Events</h1>
                    <div class="content-wrapper">
                        <p class="regular_text">
                            Join us for workshops, support groups, and community events focused on mental health and wellness.
                        </p>
                        <div class="events-grid">
                            <div class="event-card">
                                <h3>Mental Health First Aid Workshop</h3>
                                <p class="event-date">March 15, 2024</p>
                                <p>Learn essential skills to help someone experiencing a mental health crisis.</p>
                            </div>
                            <div class="event-card">
                                <h3>Mindfulness Meditation Session</h3>
                                <p class="event-date">March 22, 2024</p>
                                <p>Join our guided meditation session for stress relief and mental clarity.</p>
                            </div>
                            <div class="event-card">
                                <h3>Support Group Meeting</h3>
                                <p class="event-date">Every Thursday</p>
                                <p>Weekly support group for individuals dealing with anxiety and depression.</p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        `;
    }

    getContactContent() {
        return `
            <main class="main-container">
                <section class="content-section">
                    <h1 class="design_text">Contact Us</h1>
                    <div class="content-wrapper">
                        <div class="contact-grid">
                            <div class="contact-info">
                                <h3>Get in Touch</h3>
                                <p class="regular_text">
                                    We're here to help and would love to hear from you. 
                                    Reach out to us with any questions or concerns.
                                </p>
                                <div class="contact-details">
                                    <p><strong>Email:</strong> support@mindbridge.com</p>
                                    <p><strong>Phone:</strong> (555) 123-4567</p>
                                    <p><strong>Hours:</strong> Monday - Friday, 9AM - 6PM</p>
                                </div>
                            </div>
                            <div class="contact-form">
                                <form id="contactForm">
                                    <div class="form-group">
                                        <label for="name">Name</label>
                                        <input type="text" id="name" name="name" required>
                                    </div>
                                    <div class="form-group">
                                        <label for="email">Email</label>
                                        <input type="email" id="email" name="email" required>
                                    </div>
                                    <div class="form-group">
                                        <label for="message">Message</label>
                                        <textarea id="message" name="message" rows="5" required></textarea>
                                    </div>
                                    <button type="submit" class="submit-btn">Send Message</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        `;
    }

    getGetStartedContent() {
        // Check if user is already logged in
        const isLoggedIn = this.checkUserLogin();
        
        if (isLoggedIn) {
            // Show message that user is already logged in
            return `
                <main class="main-container">
                    <section class="content-section">
                        <h1 class="design_text">Already Logged In</h1>
                        <div class="content-wrapper">
                            <p class="regular_text">
                                You are already logged in! Would you like to go to your dashboard?
                            </p>
                            <div style="text-align: center; margin: 2rem 0;">
                                <a href="#dashboard" class="regular_text nav-link login_button">Go to Dashboard</a>
                                <button onclick="window.router.logout()" class="logout-btn" style="margin-left: 1rem;">Logout</button>
                            </div>
                        </div>
                    </section>
                </main>
            `;
        }

        return `
            <main class="main-container auth-main-container">
                <section class="content-section auth-content-section">
                    <h1 class="design_text">Get Started</h1>
                    <div class="content-wrapper">
                        <p class="regular_text">
                            Join MindBridge to access personalized mental health resources, track your progress, and connect with support.
                        </p>
                        
                        <!-- Auth Toggle Buttons -->
                        <div class="auth-toggle">
                            <button id="showLogin" class="auth-toggle-btn active">Login</button>
                            <button id="showRegister" class="auth-toggle-btn">Sign Up</button>
                        </div>

                        <!-- Login Form -->
                        <div id="loginForm" class="auth-form active">
                            <div class="form-card">
                                <h3>Welcome Back</h3>
                                <form id="userLoginForm">
                                    <div class="form-group">
                                        <label for="loginEmail">Email</label>
                                        <input type="email" id="loginEmail" name="email" required>
                                    </div>
                                    <div class="form-group">
                                        <label for="loginPassword">Password</label>
                                        <input type="password" id="loginPassword" name="password" required>
                                    </div>
                                    <button type="submit" class="submit-btn">Sign In</button>
                                </form>
                                <p class="form-footer">
                                    Don't have an account? <a href="#" id="switchToRegister">Sign up here</a>
                                </p>
                            </div>
                        </div>

                        <!-- Registration Form -->
                        <div id="registerForm" class="auth-form">
                            <div class="form-card">
                                <h3>Create Your Account</h3>
                                <form id="userRegisterForm">
                                    <div class="form-group">
                                        <label for="registerName">Full Name</label>
                                        <input type="text" id="registerName" name="name" required>
                                    </div>
                                    <div class="form-group">
                                        <label for="registerEmail">Email</label>
                                        <input type="email" id="registerEmail" name="email" required>
                                    </div>
                                    <div class="form-group">
                                        <label for="registerPassword">Password</label>
                                        <input type="password" id="registerPassword" name="password" required minlength="6">
                                        <small>Must be at least 6 characters long</small>
                                    </div>
                                    <div class="form-group">
                                        <label for="confirmPassword">Confirm Password</label>
                                        <input type="password" id="confirmPassword" name="confirmPassword" required>
                                    </div>
                                    <div class="form-group checkbox-group">
                                        <input type="checkbox" id="agreeTerms" name="agreeTerms" required>
                                        <label for="agreeTerms">I agree to the Terms of Service and Privacy Policy</label>
                                    </div>
                                    <button type="submit" class="submit-btn">Create Account</button>
                                </form>
                                <p class="form-footer">
                                    Already have an account? <a href="#" id="switchToLogin">Sign in here</a>
                                </p>
                            </div>
                        </div>

                        <!-- Quick Access (for non-logged in users) -->
                        <div class="quick-access">
                            <h3>Quick Access</h3>
                            <div class="quick-access-grid">
                                <div class="quick-card">
                                    <h4>Daily Quote</h4>
                                    <p>Get inspired with mental health quotes</p>
                                    <button class="resource-btn" onclick="window.router.showQuickQuote()">View Quote</button>
                                </div>
                                <div class="quick-card">
                                    <h4>Crisis Support</h4>
                                    <p>Immediate support resources</p>
                                    <button class="resource-btn emergency" onclick="window.router.showCrisisSupport()">Get Help Now</button>
                                </div>
                            </div>
                        </div>

                        <div id="quick-quote-container" class="daily-quote-container">
                            <div id="quick-quote-card" class="quote-card">
                                <p id="quick-quote-text" class="quote-text"></p>
                                <button onclick="window.router.showQuickQuote()" class="refresh-quote-btn">New Quote</button>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        `;
    }

    getDashboardContent() {
        const user = this.getCurrentUser();
        if (!user) {
            window.location.hash = '#get-started';
            return '';
        }

        return `
            <main class="main-container dashboard-container">
                <section class="content-section">
                    <div class="dashboard-header">
                        <h1 class="design_text">Welcome back, ${user.name}!</h1>
                        <button onclick="window.router.logout()" class="logout-btn">Logout</button>
                    </div>
                    
                    <div class="dashboard-content">
                        <!-- Dashboard Stats -->
                        <div class="dashboard-stats">
                            <div class="stat-card">
                                <h3>Days Active</h3>
                                <span class="stat-number">${user.daysActive || 0}</span>
                            </div>
                            <div class="stat-card">
                                <h3>Assessments Taken</h3>
                                <span class="stat-number">${user.assessments?.length || 0}</span>
                            </div>
                            <div class="stat-card">
                                <h3>Mood Entries</h3>
                                <span class="stat-number">${user.moodEntries?.length || 0}</span>
                            </div>
                        </div>

                        <!-- Quick Actions -->
                        <div class="quick-actions">
                            <h3>Quick Actions</h3>
                            <div class="actions-grid">
                                <div class="action-card">
                                    <h4>Daily Mood Check</h4>
                                    <p>Track how you're feeling today</p>
                                    <button class="action-btn" onclick="window.router.showMoodTracker()">Log Mood</button>
                                </div>
                                <div class="action-card">
                                    <h4>Self-Assessment</h4>
                                    <p>Take a mental health assessment</p>
                                    <button class="action-btn" onclick="window.router.showAssessment()">Start Assessment</button>
                                </div>
                                <div class="action-card">
                                    <h4>Daily Quote</h4>
                                    <p>Get your daily inspiration</p>
                                    <button class="action-btn" onclick="window.router.loadDailyQuote()">View Quote</button>
                                </div>
                                <div class="action-card">
                                    <h4>Find Counselor</h4>
                                    <p>Connect with professionals</p>
                                    <button class="action-btn">Find Help</button>
                                </div>
                            </div>
                        </div>

                        <!-- Recent Activity -->
                        <div class="recent-activity">
                            <h3>Recent Activity</h3>
                            <div class="activity-list">
                                ${this.getRecentActivity(user)}
                            </div>
                        </div>

                        <!-- Daily Quote Section -->
                        <div id="daily-quote-container" class="daily-quote-container">
                            <div id="quote-card" class="quote-card">
                                <p id="daily-quote-text" class="quote-text">Click "View Quote" above to see your daily inspiration!</p>
                                <button onclick="window.router.loadDailyQuote()" class="refresh-quote-btn">New Quote</button>
                            </div>
                        </div>

                        <!-- Mood Tracker Modal -->
                        <div id="mood-modal" class="modal" style="display: none;">
                            <div class="modal-content">
                                <span class="close" onclick="window.router.closeMoodModal()">&times;</span>
                                <h3>How are you feeling today?</h3>
                                <div class="mood-options">
                                    <button class="mood-btn" data-mood="5" onclick="window.router.logMood(5)">😊 Great</button>
                                    <button class="mood-btn" data-mood="4" onclick="window.router.logMood(4)">🙂 Good</button>
                                    <button class="mood-btn" data-mood="3" onclick="window.router.logMood(3)">😐 Okay</button>
                                    <button class="mood-btn" data-mood="2" onclick="window.router.logMood(2)">😔 Not Great</button>
                                    <button class="mood-btn" data-mood="1" onclick="window.router.logMood(1)">😢 Poor</button>
                                </div>
                                <textarea id="mood-notes" placeholder="Any notes about your mood today? (optional)"></textarea>
                                <button onclick="window.router.saveMoodEntry()" class="submit-btn">Save Entry</button>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        `;
    }

    setupContactForm() {
        const form = document.getElementById('contactForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                alert('Thank you for your message! We\'ll get back to you soon.');
                form.reset();
            });
        }
    }

    getErrorContent() {
        return `
            <main class="main-container">
                <section class="content-section">
                    <h1 class="design_text">Oops! Something went wrong</h1>
                    <div class="content-wrapper">
                        <p class="regular_text">We're sorry, but there was an error loading this content.</p>
                        <div style="text-align: center; margin-top: 2rem;">
                            <a href="#home" class="regular_text nav-link login_button">Go Home</a>
                        </div>
                    </div>
                </section>
            </main>
        `;
    }

    executeRouteScripts(routeName) {
        switch (routeName) {
            case 'home':
                if (typeof animateTexts === 'function') {
                    setTimeout(() => animateTexts(), 100);
                }
                break;
            case 'contact':
                this.setupContactForm();
                break;
            case 'get-started':
                this.setupAuthForms();
                break;
            case 'dashboard':
                this.setupDashboard();
                break;
        }
    }

    // Authentication Methods
    setupAuthForms() {
        const showLogin = document.getElementById('showLogin');
        const showRegister = document.getElementById('showRegister');
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const switchToRegister = document.getElementById('switchToRegister');
        const switchToLogin = document.getElementById('switchToLogin');

        // Toggle between login and register
        const toggleForms = (showLoginForm) => {
            if (showLoginForm) {
                loginForm?.classList.add('active');
                registerForm?.classList.remove('active');
                showLogin?.classList.add('active');
                showRegister?.classList.remove('active');
            } else {
                loginForm?.classList.remove('active');
                registerForm?.classList.add('active');
                showLogin?.classList.remove('active');
                showRegister?.classList.add('active');
            }
        };

        showLogin?.addEventListener('click', () => toggleForms(true));
        showRegister?.addEventListener('click', () => toggleForms(false));
        switchToRegister?.addEventListener('click', (e) => {
            e.preventDefault();
            toggleForms(false);
        });
        switchToLogin?.addEventListener('click', (e) => {
            e.preventDefault();
            toggleForms(true);
        });

        // Handle form submissions
        document.getElementById('userLoginForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin(e);
        });

        document.getElementById('userRegisterForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister(e);
        });
    }

    handleLogin(e) {
        const formData = new FormData(e.target);
        const email = formData.get('email');
        const password = formData.get('password');

        // Simple validation (in real app, this would be server-side)
        const users = JSON.parse(localStorage.getItem('mindbridge_users') || '[]');
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            localStorage.setItem('mindbridge_current_user', JSON.stringify(user));
            alert('Login successful!');
            window.location.hash = '#dashboard';
        } else {
            alert('Invalid email or password');
        }
    }

    handleRegister(e) {
        const formData = new FormData(e.target);
        const name = formData.get('name');
        const email = formData.get('email');
        const password = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');
        const agreeTerms = formData.get('agreeTerms');

        // Validation
        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        if (!agreeTerms) {
            alert('Please agree to the terms and conditions');
            return;
        }

        // Check if user already exists
        const users = JSON.parse(localStorage.getItem('mindbridge_users') || '[]');
        if (users.find(u => u.email === email)) {
            alert('User with this email already exists');
            return;
        }

        // Create new user
        const newUser = {
            id: Date.now(),
            name,
            email,
            password,
            joinDate: new Date().toISOString(),
            daysActive: 1,
            assessments: [],
            moodEntries: []
        };

        users.push(newUser);
        localStorage.setItem('mindbridge_users', JSON.stringify(users));
        localStorage.setItem('mindbridge_current_user', JSON.stringify(newUser));

        alert('Registration successful! Welcome to MindBridge!');
        window.location.hash = '#dashboard';
    }

    checkUserLogin() {
        return !!localStorage.getItem('mindbridge_current_user');
    }

    getCurrentUser() {
        const userStr = localStorage.getItem('mindbridge_current_user');
        return userStr ? JSON.parse(userStr) : null;
    }

    logout() {
        localStorage.removeItem('mindbridge_current_user');
        alert('Logged out successfully');
        window.location.hash = '#home';
    }

    // Dashboard Methods
    setupDashboard() {
        // Dashboard-specific initialization
    }

    getRecentActivity(user) {
        const activities = [];
        
        if (user.moodEntries?.length > 0) {
            const lastMood = user.moodEntries[user.moodEntries.length - 1];
            activities.push(`<div class="activity-item">📊 Logged mood: ${this.getMoodEmoji(lastMood.mood)} (${new Date(lastMood.date).toLocaleDateString()})</div>`);
        }
        
        if (user.assessments?.length > 0) {
            const lastAssessment = user.assessments[user.assessments.length - 1];
            activities.push(`<div class="activity-item">📝 Completed assessment (${new Date(lastAssessment.date).toLocaleDateString()})</div>`);
        }

        activities.push(`<div class="activity-item">🎯 Joined MindBridge (${new Date(user.joinDate).toLocaleDateString()})</div>`);

        return activities.length > 0 ? activities.join('') : '<div class="activity-item">No recent activity</div>';
    }

    getMoodEmoji(mood) {
        const moodEmojis = { 1: '😢', 2: '😔', 3: '😐', 4: '🙂', 5: '😊' };
        return moodEmojis[mood] || '😐';
    }

    showMoodTracker() {
        document.getElementById('mood-modal').style.display = 'block';
    }

    closeMoodModal() {
        document.getElementById('mood-modal').style.display = 'none';
    }

    logMood(mood) {
        this.selectedMood = mood;
        // Highlight selected mood
        document.querySelectorAll('.mood-btn').forEach(btn => btn.classList.remove('selected'));
        document.querySelector(`[data-mood="${mood}"]`).classList.add('selected');
    }

    saveMoodEntry() {
        if (!this.selectedMood) {
            alert('Please select a mood');
            return;
        }

        const user = this.getCurrentUser();
        const notes = document.getElementById('mood-notes').value;
        
        const moodEntry = {
            mood: this.selectedMood,
            notes,
            date: new Date().toISOString()
        };

        user.moodEntries = user.moodEntries || [];
        user.moodEntries.push(moodEntry);

        // Update user data
        this.updateUserData(user);
        
        alert('Mood logged successfully!');
        this.closeMoodModal();
        
        // Refresh dashboard
        window.location.hash = '#dashboard';
    }

    updateUserData(updatedUser) {
        localStorage.setItem('mindbridge_current_user', JSON.stringify(updatedUser));
        
        const users = JSON.parse(localStorage.getItem('mindbridge_users') || '[]');
        const userIndex = users.findIndex(u => u.id === updatedUser.id);
        if (userIndex !== -1) {
            users[userIndex] = updatedUser;
            localStorage.setItem('mindbridge_users', JSON.stringify(users));
        }
    }

    showAssessment() {
        alert('Assessment feature coming soon!');
    }

    showQuickQuote() {
        this.loadQuoteToContainer('quick-quote-text', 'quick-quote-card');
    }

    async loadDailyQuote() {
        this.loadQuoteToContainer('daily-quote-text', 'quote-card');
    }

    async loadQuoteToContainer(textId, cardId) {
        try {
            const response = await fetch('./text/quotes_db.json');
            const quotes = await response.json();
            const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
            
            const quoteCard = document.getElementById(cardId);
            const quoteText = document.getElementById(textId);
            
            if (quoteCard && quoteText) {
                quoteText.textContent = `"${randomQuote}"`;
                quoteCard.classList.add('show');
            }
        } catch (error) {
            console.error('Error loading quote:', error);
            
            const quoteCard = document.getElementById(cardId);
            const quoteText = document.getElementById(textId);
            
            if (quoteCard && quoteText) {
                quoteText.textContent = '"Your mental health matters just as much as your physical health."';
                quoteCard.classList.add('show');
            }
        }
    }

    showCrisisSupport() {
        alert('Crisis Support Resources:\n\n' +
              'Mental Health Crisis Line: 14416\n' +
              'National Suicide Prevention Lifeline: 988\n' +
              'Crisis Text Line: Text HOME to 741741\n' +
              'SAMHSA National Helpline: 1-800-662-4357\n\n' +
              'If you are in immediate danger, please call 100.\n\n' +
              'Remember: You are not alone, and help is available 24/7.');
    }
}

// Initialize router when script loads
console.log('Creating SPARouter instance');
window.router = new SPARouter();
