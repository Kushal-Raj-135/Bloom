/**
 * Enhanced Hamburger Menu Class with Dynamic User Integration
 * Fetches actual logged-in user data instead of hardcoded demo data
 */
class HamburgerMenu {
    constructor() {
        // DOM elements
        this.hamburgerBtn = document.getElementById('hamburger-btn');
        this.mobileMenu = document.getElementById('mobile-menu');
        this.mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
        this.mobileMenuClose = document.getElementById('mobile-menu-close');
        this.productsDropdown = document.getElementById('mobile-products-dropdown');
        this.mobileLanguageDropdown = document.getElementById('mobile-language-dropdown');
        this.desktopLanguageDropdown = document.getElementById('languageDropdown');
        
        // User-related elements
        this.mobileUserSection = document.querySelector('.mobile-user-section');
        this.mobileUserInfo = document.querySelector('.mobile-user-info');
        this.mobileUserDetails = document.querySelector('.mobile-user-details');
        this.mobileUserActions = document.querySelector('.mobile-user-actions');
        this.mobileAuthSection = document.querySelector('.mobile-auth-section');
        
        // State
        this.isOpen = false;
        this.focusTrapHandler = null;
        this.previousFocusedElement = null;
        this.currentUser = null;
        
        // Initialize
        this.init();
    }

    /**
     * Initialize the hamburger menu
     */
    init() {
        this.bindEvents();
        this.syncLanguageSelectors();
        this.setupAccessibility();
        this.loadUserData();
        
        // Listen for user authentication changes
        this.setupUserAuthListeners();
        
        console.log('Hamburger menu initialized with dynamic user data');
    }

    /**
     * Load current user data from various sources
     */
    async loadUserData() {
        try {
            // Method 1: Try to get user from localStorage (if your app stores it there)
            let userData = this.getUserFromLocalStorage();
            
            // Method 2: Try to get user from global window object (if set by your app)
            if (!userData) {
                userData = this.getUserFromWindow();
            }
            
            // Method 3: Try to get user from existing user menu (if available)
            if (!userData) {
                userData = this.getUserFromExistingMenu();
            }
            
            // Method 4: Try to fetch from API/server (if endpoint available)
            if (!userData) {
                userData = await this.getUserFromAPI();
            }
            
            // Method 5: Check session storage
            if (!userData) {
                userData = this.getUserFromSessionStorage();
            }
            
            // Update the mobile menu with user data
            this.updateMobileUserSection(userData);
            
        } catch (error) {
            console.warn('Error loading user data:', error);
            this.updateMobileUserSection(null);
        }
    }

    /**
     * Get user data from localStorage
     */
    getUserFromLocalStorage() {
        try {
            const userStr = localStorage.getItem('user') || 
                           localStorage.getItem('userData') || 
                           localStorage.getItem('currentUser') ||
                           localStorage.getItem('loggedInUser');
            
            if (userStr) {
                const userData = JSON.parse(userStr);
                console.log('User found in localStorage:', userData);
                return userData;
            }
        } catch (error) {
            console.warn('Error reading user from localStorage:', error);
        }
        return null;
    }

    /**
     * Get user data from sessionStorage
     */
    getUserFromSessionStorage() {
        try {
            const userStr = sessionStorage.getItem('user') || 
                           sessionStorage.getItem('userData') || 
                           sessionStorage.getItem('currentUser');
            
            if (userStr) {
                const userData = JSON.parse(userStr);
                console.log('User found in sessionStorage:', userData);
                return userData;
            }
        } catch (error) {
            console.warn('Error reading user from sessionStorage:', error);
        }
        return null;
    }

    /**
     * Get user data from global window object
     */
    getUserFromWindow() {
        if (window.currentUser || window.user || window.userData) {
            const userData = window.currentUser || window.user || window.userData;
            console.log('User found in window object:', userData);
            return userData;
        }
        return null;
    }

    /**
     * Get user data from existing desktop user menu
     */
    getUserFromExistingMenu() {
        try {
            // Look for user name in desktop menu
            const userNameElement = document.querySelector('.user-name') || 
                                  document.querySelector('.nav-user-name') ||
                                  document.querySelector('[data-user-name]');
            
            if (userNameElement && userNameElement.textContent.trim() !== 'User') {
                const userName = userNameElement.textContent.trim();
                
                // Try to find email or other user info
                const userEmailElement = document.querySelector('[data-user-email]') ||
                                       document.querySelector('.user-email');
                
                const userData = {
                    name: userName,
                    email: userEmailElement ? userEmailElement.textContent.trim() : null,
                    isLoggedIn: true
                };
                
                console.log('User found from existing menu:', userData);
                return userData;
            }
        } catch (error) {
            console.warn('Error reading user from existing menu:', error);
        }
        return null;
    }

    /**
     * Fetch user data from API endpoint
     */
    async getUserFromAPI() {
        try {
            // Try common API endpoints
            const endpoints = [
                '/api/user/current',
                '/api/auth/me',
                '/api/user/profile',
                '/user/current',
                '/auth/user'
            ];

            for (const endpoint of endpoints) {
                try {
                    const response = await fetch(endpoint, {
                        method: 'GET',
                        credentials: 'include', // Include cookies for session-based auth
                        headers: {
                            'Content-Type': 'application/json',
                            // Add authorization header if token exists
                            ...(localStorage.getItem('token') && {
                                'Authorization': `Bearer ${localStorage.getItem('token')}`
                            })
                        }
                    });

                    if (response.ok) {
                        const userData = await response.json();
                        console.log('User found from API:', userData);
                        return userData;
                    }
                } catch (error) {
                    // Continue to next endpoint
                    continue;
                }
            }
        } catch (error) {
            console.warn('Error fetching user from API:', error);
        }
        return null;
    }

    /**
     * Update mobile user section with user data
     */
    updateMobileUserSection(userData) {
        if (!this.mobileUserSection) return;

        this.currentUser = userData;

        if (userData && userData.isLoggedIn !== false) {
            // User is logged in - show user section
            this.showLoggedInUserSection(userData);
        } else {
            // User is not logged in - show auth buttons
            this.showAuthSection();
        }
    }

    /**
     * Show logged-in user section
     */
    showLoggedInUserSection(userData) {
        // Hide auth section if exists
        if (this.mobileAuthSection) {
            this.mobileAuthSection.style.display = 'none';
        }

        // Show user section
        if (this.mobileUserSection) {
            this.mobileUserSection.style.display = 'block';
        }

        // Update user info
        const userName = userData.name || userData.username || userData.displayName || userData.fullName || 'User';
        const userEmail = userData.email || userData.emailAddress || userData.mail || '';
        const userAvatar = userData.avatar || userData.profilePicture || userData.image || null;

        // Update user details
        const userNameElement = this.mobileUserDetails?.querySelector('h4');
        const userEmailElement = this.mobileUserDetails?.querySelector('p');

        if (userNameElement) {
            userNameElement.textContent = userName;
        }

        if (userEmailElement) {
            userEmailElement.textContent = userEmail;
        }

        // Update avatar
        const avatarElement = this.mobileUserInfo?.querySelector('.mobile-user-avatar');
        if (avatarElement) {
            if (userAvatar) {
                // Use user's avatar image
                avatarElement.innerHTML = `<img src="${userAvatar}" alt="${userName}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
            } else {
                // Use initials or default icon
                const initials = this.getInitials(userName);
                avatarElement.innerHTML = initials ? `<span style="font-size: 16px; font-weight: bold;">${initials}</span>` : '<i class="fas fa-user"></i>';
            }
        }

        // Update user actions with proper links
        this.updateUserActions(userData);
    }

    /**
     * Show authentication section for non-logged-in users
     */
    showAuthSection() {
        // Hide user section
        if (this.mobileUserSection) {
            this.mobileUserSection.style.display = 'none';
        }

        // Create or show auth section
        if (!this.mobileAuthSection) {
            this.createMobileAuthSection();
        } else {
            this.mobileAuthSection.style.display = 'block';
        }
    }

    /**
     * Create mobile auth section for non-logged-in users
     */
    createMobileAuthSection() {
        const authHTML = `
            <div class="mobile-auth-section">
                <div class="mobile-auth-actions">
                    <a href="../login.html" class="mobile-auth-action">
                        <i class="fas fa-sign-in-alt"></i>
                        Login
                    </a>
                    <a href="../register.html" class="mobile-auth-action">
                        <i class="fas fa-user-plus"></i>
                        Register
                    </a>
                </div>
            </div>
        `;

        // Insert auth section before language section
        const languageSection = document.querySelector('.mobile-language-section');
        if (languageSection) {
            languageSection.insertAdjacentHTML('beforebegin', authHTML);
            this.mobileAuthSection = document.querySelector('.mobile-auth-section');
        }
    }

    /**
     * Update user actions with proper functionality
     */
    updateUserActions(userData) {
        const userActions = this.mobileUserActions?.querySelectorAll('.mobile-user-action');
        
        if (userActions) {
            userActions.forEach(action => {
                const icon = action.querySelector('i');
                const text = action.textContent.trim();

                if (text.includes('Profile') || icon?.classList.contains('fa-user-circle')) {
                    // Update profile link
                    action.href = '../profile.html';
                    action.onclick = null; // Remove any existing onclick
                } else if (text.includes('Logout') || icon?.classList.contains('fa-sign-out-alt')) {
                    // Update logout functionality
                    action.href = '#';
                    action.onclick = (e) => {
                        e.preventDefault();
                        this.handleLogout();
                    };
                }
            });
        }
    }

    /**
     * Handle user logout
     */
    async handleLogout() {
        try {
            // Close mobile menu first
            this.closeMenu();

            // Clear user data from storage
            localStorage.removeItem('user');
            localStorage.removeItem('userData');
            localStorage.removeItem('currentUser');
            localStorage.removeItem('token');
            sessionStorage.removeItem('user');
            sessionStorage.removeItem('userData');
            sessionStorage.removeItem('currentUser');

            // Clear global user object
            if (window.currentUser) window.currentUser = null;
            if (window.user) window.user = null;
            if (window.userData) window.userData = null;

            // Call API logout if available
            try {
                await fetch('/api/auth/logout', {
                    method: 'POST',
                    credentials: 'include'
                });
            } catch (error) {
                // Logout API might not exist, continue
            }

            // Trigger logout event for other components
            const logoutEvent = new CustomEvent('userLoggedOut');
            document.dispatchEvent(logoutEvent);

            // Update UI
            this.updateMobileUserSection(null);

            // Redirect or reload page
            if (window.location.pathname.includes('profile') || 
                window.location.pathname.includes('dashboard')) {
                window.location.href = '../index.html';
            } else {
                window.location.reload();
            }

        } catch (error) {
            console.error('Error during logout:', error);
            alert('Logout failed. Please try again.');
        }
    }

    /**
     * Get user initials for avatar
     */
    getInitials(name) {
        if (!name) return '';
        
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return parts[0][0].toUpperCase();
    }

    /**
     * Setup listeners for user authentication changes
     */
    setupUserAuthListeners() {
        // Listen for login events
        document.addEventListener('userLoggedIn', (event) => {
            this.loadUserData();
        });

        // Listen for logout events
        document.addEventListener('userLoggedOut', (event) => {
            this.updateMobileUserSection(null);
        });

        // Listen for user data updates
        document.addEventListener('userDataUpdated', (event) => {
            this.loadUserData();
        });

        // Watch for changes in localStorage
        window.addEventListener('storage', (event) => {
            if (event.key === 'user' || event.key === 'userData' || event.key === 'currentUser') {
                this.loadUserData();
            }
        });
    }

    /**
     * Public method to refresh user data
     */
    refreshUserData() {
        this.loadUserData();
    }

    /**
     * Public method to update user data
     */
    updateUserData(userData) {
        this.updateMobileUserSection(userData);
    }

    // ... Rest of the existing methods (bindEvents, toggleMenu, etc.) remain the same ...

    bindEvents() {
        // Hamburger button events
        if (this.hamburgerBtn) {
            this.hamburgerBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleMenu();
            });

            this.hamburgerBtn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.toggleMenu();
                }
            });
        }

        // Close button events
        if (this.mobileMenuClose) {
            this.mobileMenuClose.addEventListener('click', (e) => {
                e.stopPropagation();
                this.closeMenu();
            });

            this.mobileMenuClose.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.closeMenu();
                }
            });
        }

        // Overlay click to close
        if (this.mobileMenuOverlay) {
            this.mobileMenuOverlay.addEventListener('click', () => {
                this.closeMenu();
            });
        }

        // Products dropdown toggle
        if (this.productsDropdown) {
            const dropdownToggle = this.productsDropdown.querySelector('.mobile-dropdown-toggle');
            if (dropdownToggle) {
                dropdownToggle.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.toggleProductsDropdown();
                });

                dropdownToggle.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.toggleProductsDropdown();
                    }
                });
            }
        }

        // Navigation link events
        this.bindNavigationEvents();

        // Language selector sync
        this.bindLanguageEvents();

        // Global events
        this.bindGlobalEvents();
    }

    bindNavigationEvents() {
        const navLinks = document.querySelectorAll('.mobile-nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                if (!link.closest('.mobile-products-dropdown')) {
                    setTimeout(() => this.closeMenu(), 150);
                }
            });
        });

        // Auth action links
        const authActions = document.querySelectorAll('.mobile-auth-action');
        authActions.forEach(action => {
            action.addEventListener('click', () => {
                setTimeout(() => this.closeMenu(), 150);
            });
        });
    }

    bindLanguageEvents() {
        if (this.mobileLanguageDropdown && this.desktopLanguageDropdown) {
            this.mobileLanguageDropdown.addEventListener('change', (e) => {
                this.desktopLanguageDropdown.value = e.target.value;
                this.desktopLanguageDropdown.dispatchEvent(new Event('change'));
            });

            this.desktopLanguageDropdown.addEventListener('change', (e) => {
                this.mobileLanguageDropdown.value = e.target.value;
            });
        }
    }

    bindGlobalEvents() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeMenu();
            }
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && this.isOpen) {
                this.closeMenu();
            }
        });

        if (this.mobileMenu) {
            this.mobileMenu.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }

        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                if (window.innerWidth > 768 && this.isOpen) {
                    this.closeMenu();
                }
            }, 100);
        });
    }

    toggleMenu() {
        if (this.isOpen) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }

    openMenu() {
        if (this.isOpen) return;

        this.previousFocusedElement = document.activeElement;

        this.mobileMenu?.classList.add('active');
        this.mobileMenuOverlay?.classList.add('active');
        this.hamburgerBtn?.classList.add('active');

        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';

        this.isOpen = true;

        this.setupFocusTrap();

        this.hamburgerBtn?.setAttribute('aria-expanded', 'true');
        this.mobileMenu?.setAttribute('aria-hidden', 'false');

        setTimeout(() => {
            this.mobileMenuClose?.focus();
        }, 100);

        this.dispatchEvent('menuOpened');
    }

    closeMenu() {
        if (!this.isOpen) return;

        this.mobileMenu?.classList.remove('active');
        this.mobileMenuOverlay?.classList.remove('active');
        this.hamburgerBtn?.classList.remove('active');

        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';

        this.isOpen = false;

        this.removeFocusTrap();

        this.hamburgerBtn?.setAttribute('aria-expanded', 'false');
        this.mobileMenu?.setAttribute('aria-hidden', 'true');

        if (this.previousFocusedElement) {
            this.previousFocusedElement.focus();
            this.previousFocusedElement = null;
        }

        this.closeProductsDropdown();

        this.dispatchEvent('menuClosed');
    }

    toggleProductsDropdown() {
        if (this.productsDropdown) {
            this.productsDropdown.classList.toggle('open');
            
            const isOpen = this.productsDropdown.classList.contains('open');
            const toggle = this.productsDropdown.querySelector('.mobile-dropdown-toggle');
            
            if (toggle) {
                toggle.setAttribute('aria-expanded', isOpen.toString());
            }
        }
    }

    closeProductsDropdown() {
        if (this.productsDropdown) {
            this.productsDropdown.classList.remove('open');
            
            const toggle = this.productsDropdown.querySelector('.mobile-dropdown-toggle');
            if (toggle) {
                toggle.setAttribute('aria-expanded', 'false');
            }
        }
    }

    syncLanguageSelectors() {
        if (this.desktopLanguageDropdown && this.mobileLanguageDropdown) {
            this.mobileLanguageDropdown.value = this.desktopLanguageDropdown.value;
        }
    }

    setupAccessibility() {
        if (this.hamburgerBtn) {
            this.hamburgerBtn.setAttribute('aria-expanded', 'false');
            this.hamburgerBtn.setAttribute('aria-controls', 'mobile-menu');
            this.hamburgerBtn.setAttribute('aria-label', 'Toggle navigation menu');
        }

        if (this.mobileMenu) {
            this.mobileMenu.setAttribute('aria-hidden', 'true');
            this.mobileMenu.setAttribute('role', 'dialog');
            this.mobileMenu.setAttribute('aria-labelledby', 'mobile-menu-header');
        }

        const productsToggle = this.productsDropdown?.querySelector('.mobile-dropdown-toggle');
        if (productsToggle) {
            productsToggle.setAttribute('aria-expanded', 'false');
            productsToggle.setAttribute('aria-controls', 'mobile-products-dropdown-menu');
        }

        const productsMenu = this.productsDropdown?.querySelector('.mobile-dropdown-menu');
        if (productsMenu) {
            productsMenu.setAttribute('id', 'mobile-products-dropdown-menu');
        }
    }

    setupFocusTrap() {
        const focusableElements = this.mobileMenu?.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements && focusableElements.length > 0) {
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            this.focusTrapHandler = (e) => {
                if (e.key === 'Tab') {
                    if (e.shiftKey) {
                        if (document.activeElement === firstElement) {
                            e.preventDefault();
                            lastElement.focus();
                        }
                    } else {
                        if (document.activeElement === lastElement) {
                            e.preventDefault();
                            firstElement.focus();
                        }
                    }
                }
            };

            document.addEventListener('keydown', this.focusTrapHandler);
        }
    }

    removeFocusTrap() {
        if (this.focusTrapHandler) {
            document.removeEventListener('keydown', this.focusTrapHandler);
            this.focusTrapHandler = null;
        }
    }

    isMenuOpen() {
        return this.isOpen;
    }

    dispatchEvent(eventName) {
        const event = new CustomEvent(eventName, {
            detail: { hamburgerMenu: this }
        });
        document.dispatchEvent(event);
    }

    open() {
        this.openMenu();
    }

    close() {
        this.closeMenu();
    }

    destroy() {
        this.closeMenu();
        this.removeFocusTrap();
        this.isOpen = false;
        this.previousFocusedElement = null;
    }
}

// Auto-initialize hamburger menu when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (hamburgerBtn && mobileMenu) {
        window.hamburgerMenu = new HamburgerMenu();
        
        if (typeof window !== 'undefined') {
            window.HamburgerMenu = HamburgerMenu;
        }
    } else {
        console.warn('Hamburger menu elements not found. Make sure you have the required HTML structure.');
    }
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden && window.hamburgerMenu && window.hamburgerMenu.isMenuOpen()) {
        window.hamburgerMenu.close();
    }
});

// Export for use in other modules if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HamburgerMenu;
}