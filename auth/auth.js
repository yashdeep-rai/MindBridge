/* ========================================
   AUTHENTICATION SYSTEM
======================================== */

class AuthSystem {
    constructor() {
        this.init();
    }

    init() {
        // Check if user is already logged in
        if (this.isLoggedIn()) {
            // If on login/signup page and already logged in, redirect to dashboard
            if (window.location.pathname.includes('login.html') || window.location.pathname.includes('signup.html')) {
                window.location.href = '../dashboard/dashboard.html';
                return;
            }
        }

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Signup form
        const signupForm = document.getElementById('signupForm');
        if (signupForm) {
            signupForm.addEventListener('submit', (e) => this.handleSignup(e));
        }

        // Password confirmation validation
        const confirmPassword = document.getElementById('confirmPassword');
        if (confirmPassword) {
            confirmPassword.addEventListener('input', () => this.validatePasswordMatch());
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const submitBtn = e.target.querySelector('.auth-btn');
        const originalText = submitBtn.textContent;
        
        // Show loading state
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;

        const formData = new FormData(e.target);
        const email = formData.get('email').toLowerCase().trim();
        const password = formData.get('password');
        const rememberMe = formData.get('rememberMe');

        try {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            const users = JSON.parse(localStorage.getItem('mindbridge_users') || '[]');
            const user = users.find(u => u.email === email && u.password === password);

            if (user) {
                // Update last login
                user.lastLogin = new Date().toISOString();
                user.loginCount = (user.loginCount || 0) + 1;
                
                // Update user in storage
                const userIndex = users.findIndex(u => u.id === user.id);
                users[userIndex] = user;
                localStorage.setItem('mindbridge_users', JSON.stringify(users));

                // Set session
                const sessionData = {
                    ...user,
                    sessionId: this.generateSessionId(),
                    loginTime: new Date().toISOString()
                };

                if (rememberMe) {
                    localStorage.setItem('mindbridge_session', JSON.stringify(sessionData));
                } else {
                    sessionStorage.setItem('mindbridge_session', JSON.stringify(sessionData));
                }

                this.showMessage('Login successful! Redirecting...', 'success');
                
                setTimeout(() => {
                    window.location.href = '../dashboard/dashboard.html';
                }, 1500);

            } else {
                this.showMessage('Invalid email or password. Please try again.', 'error');
            }

        } catch (error) {
            this.showMessage('Login failed. Please try again.', 'error');
        } finally {
            // Reset button
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }
    }

    async handleSignup(e) {
        e.preventDefault();
        
        const submitBtn = e.target.querySelector('.auth-btn');
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;

        const formData = new FormData(e.target);
        const userData = {
            fullName: formData.get('fullName').trim(),
            email: formData.get('email').toLowerCase().trim(),
            password: formData.get('password'),
            confirmPassword: formData.get('confirmPassword'),
            age: formData.get('age'),
            agreeTerms: formData.get('agreeTerms'),
            newsletter: formData.get('newsletter')
        };

        try {
            // Validate form
            const validation = this.validateSignupForm(userData);
            if (!validation.isValid) {
                this.showMessage(validation.message, 'error');
                return;
            }

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Check if user already exists
            const users = JSON.parse(localStorage.getItem('mindbridge_users') || '[]');
            if (users.find(u => u.email === userData.email)) {
                this.showMessage('An account with this email already exists.', 'error');
                return;
            }

            // Create new user
            const newUser = {
                id: this.generateUserId(),
                name: userData.fullName,
                email: userData.email,
                password: userData.password, // In production, this would be hashed
                age: userData.age,
                newsletter: !!userData.newsletter,
                joinDate: new Date().toISOString(),
                lastLogin: new Date().toISOString(),
                loginCount: 1,
                daysActive: 1,
                assessments: [],
                moodEntries: [],
                preferences: {
                    notifications: true,
                    darkMode: false,
                    publicProfile: false
                }
            };

            // Save user
            users.push(newUser);
            localStorage.setItem('mindbridge_users', JSON.stringify(users));

            // Auto-login after signup
            const sessionData = {
                ...newUser,
                sessionId: this.generateSessionId(),
                loginTime: new Date().toISOString()
            };
            
            localStorage.setItem('mindbridge_session', JSON.stringify(sessionData));

            this.showMessage('Account created successfully! Redirecting to your dashboard...', 'success');
            
            setTimeout(() => {
                window.location.href = '../dashboard/dashboard.html';
            }, 2000);

        } catch (error) {
            this.showMessage('Registration failed. Please try again.', 'error');
        } finally {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }
    }

    validateSignupForm(data) {
        if (!data.fullName || data.fullName.length < 2) {
            return { isValid: false, message: 'Please enter a valid full name.' };
        }

        if (!this.isValidEmail(data.email)) {
            return { isValid: false, message: 'Please enter a valid email address.' };
        }

        if (!data.password || data.password.length < 6) {
            return { isValid: false, message: 'Password must be at least 6 characters long.' };
        }

        if (data.password !== data.confirmPassword) {
            return { isValid: false, message: 'Passwords do not match.' };
        }

        if (!data.age) {
            return { isValid: false, message: 'Please select your age range.' };
        }

        if (!data.agreeTerms) {
            return { isValid: false, message: 'Please agree to the Terms of Service and Privacy Policy.' };
        }

        return { isValid: true };
    }

    validatePasswordMatch() {
        const password = document.getElementById('password');
        const confirmPassword = document.getElementById('confirmPassword');
        
        if (password && confirmPassword) {
            if (password.value !== confirmPassword.value) {
                confirmPassword.setCustomValidity('Passwords do not match');
            } else {
                confirmPassword.setCustomValidity('');
            }
        }
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    isLoggedIn() {
        const session = localStorage.getItem('mindbridge_session') || sessionStorage.getItem('mindbridge_session');
        if (!session) return false;

        try {
            const sessionData = JSON.parse(session);
            // Check if session is still valid (not older than 24 hours)
            const loginTime = new Date(sessionData.loginTime);
            const now = new Date();
            const hoursDiff = (now - loginTime) / (1000 * 60 * 60);
            
            return hoursDiff < 24;
        } catch {
            return false;
        }
    }

    getCurrentUser() {
        if (!this.isLoggedIn()) return null;
        
        const session = localStorage.getItem('mindbridge_session') || sessionStorage.getItem('mindbridge_session');
        try {
            return JSON.parse(session);
        } catch {
            return null;
        }
    }

    logout() {
        localStorage.removeItem('mindbridge_session');
        sessionStorage.removeItem('mindbridge_session');
        window.location.href = '../index.html';
    }

    generateUserId() {
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    showMessage(text, type) {
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.message');
        existingMessages.forEach(msg => msg.remove());

        // Create new message
        const message = document.createElement('div');
        message.className = `message ${type}`;
        message.textContent = text;

        // Insert at top of form
        const form = document.querySelector('.auth-form');
        if (form) {
            form.insertBefore(message, form.firstChild);
            
            // Auto-remove after 5 seconds for error messages
            if (type === 'error') {
                setTimeout(() => {
                    if (message.parentNode) {
                        message.remove();
                    }
                }, 5000);
            }
        }
    }
}

// Initialize authentication system
document.addEventListener('DOMContentLoaded', () => {
    window.authSystem = new AuthSystem();
});
