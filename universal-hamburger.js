
class UniversalHamburgerMenu {
    constructor() {
        // DOM Elements with universal IDs
        this.hamburgerBtn = document.getElementById('universal-hamburger-btn');
        this.mobileMenu = document.getElementById('universal-mobile-menu');
        this.mobileOverlay = document.getElementById('universal-mobile-overlay');
        this.mobileClose = document.getElementById('universal-mobile-close');
        this.productsDropdown = document.getElementById('universal-products-dropdown');
        this.userSection = document.getElementById('universal-user-section');
        this.authSection = document.getElementById('universal-auth-section');
        this.desktopLangDropdown = document.getElementById('universal-language-dropdown');
        this.mobileLangDropdown = document.getElementById('universal-mobile-language-dropdown');
        
        // State
        this.isOpen = false;
        this.currentUser = null;
        this.focusTrapHandler = null;
        this.previousFocusedElement = null;
        
        // Initialize
        this.init();
    }

    /**
     * Initialize the universal hamburger menu
     */
    init() {
        this.bindEvents();
        this.syncLanguageSelectors();
        this.loadUserData();
        this.setupUserAuthListeners();
        this.setupAccessibility();
        
        console.log('🍔 Universal Hamburger Menu initialized');
        
        // Debug info
        this.logDebugInfo();
    }

    /**
     * Bind all event listeners
     */
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
        if (this.mobileClose) {
            this.mobileClose.addEventListener('click', (e) => {
                e.stopPropagation();
                this.closeMenu();
            });

            this.mobileClose.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.closeMenu();
                }
            });
        }

        // Overlay click to close
        if (this.mobileOverlay) {
            this.mobileOverlay.addEventListener('click', () => {
                this.closeMenu();
            });
        }

        // Products dropdown toggle
        if (this.productsDropdown) {
            const dropdownToggle = this.productsDropdown.querySelector('.universal-dropdown-toggle');
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

        // User action events
        this.bindUserEvents();

        // Language selector sync
        this.bindLanguageEvents();

        // Global events
        this.bindGlobalEvents();
    }

    /**
     * Bind navigation link events
     */
    bindNavigationEvents() {
        const navLinks = document.querySelectorAll('.universal-mobile-nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                // Don't close menu if it's a dropdown item
                if (!link.closest('.universal-products-dropdown')) {
                    setTimeout(() => this.closeMenu(), 150);
                }
            });
        });

        // Auth action links
        const authActions = document.querySelectorAll('.universal-auth-action');
        authActions.forEach(action => {
            action.addEventListener('click', () => {
                setTimeout(() => this.closeMenu(), 150);
            });
        });
    }

    /**
     * Bind user-related events
     */
    bindUserEvents() {
        // User action links
        const userActions = document.querySelectorAll('.universal-user-action');
        userActions.forEach(action => {
            action.addEventListener('click', () => {
                // Don't close menu for logout (handled separately)
                if (!action.classList.contains('universal-logout-btn')) {
                    setTimeout(() => this.closeMenu(), 150);
                }
            });
        });

        // Logout button
        const logoutBtn = document.querySelector('.universal-logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogout();
            });
        }
    }

    /**
     * Bind language selector events
     */
    bindLanguageEvents() {
        // Mobile to desktop sync
        if (this.mobileLangDropdown && this.desktopLangDropdown) {
            this.mobileLangDropdown.addEventListener('change', (e) => {
                this.desktopLangDropdown.value = e.target.value;
                this.desktopLangDropdown.dispatchEvent(new Event('change'));
            });

            // Desktop to mobile sync
            this.desktopLangDropdown.addEventListener('change', (e) => {
                this.mobileLangDropdown.value = e.target.value;
            });
        }
    }

    /**
     * Bind global events
     */
    bindGlobalEvents() {
        // Escape key to close menu
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeMenu();
            }
        });

        // Window resize handling
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && this.isOpen) {
                this.closeMenu();
            }
        });

        // Prevent menu close when clicking inside menu
        if (this.mobileMenu) {
            this.mobileMenu.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }

        // Handle orientation change
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                if (window.innerWidth > 768 && this.isOpen) {
                    this.closeMenu();
                }
            }, 100);
        });
    }

    /**
     * Toggle menu open/close
     */
    toggleMenu() {
        if (this.isOpen) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }

    /**
     * Open the mobile menu
     */
    openMenu() {
        if (this.isOpen) return;

        // Store currently focused element
        this.previousFocusedElement = document.activeElement;

        // Add active classes
        this.mobileMenu?.classList.add('active');
        this.mobileOverlay?.classList.add('active');
        this.hamburgerBtn?.classList.add('active');

        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';

        // Update state
        this.isOpen = true;

        // Set up focus trap
        this.setupFocusTrap();

        // Update ARIA attributes
        this.hamburgerBtn?.setAttribute('aria-expanded', 'true');
        this.mobileMenu?.setAttribute('aria-hidden', 'false');

        // Focus the close button
        setTimeout(() => {
            this.mobileClose?.focus();
        }, 100);

        // Dispatch custom event
        this.dispatchEvent('universalMenuOpened');
    }

    /**
     * Close the mobile menu
     */
    closeMenu() {
        if (!this.isOpen) return;

        // Remove active classes
        this.mobileMenu?.classList.remove('active');
        this.mobileOverlay?.classList.remove('active');
        this.hamburgerBtn?.classList.remove('active');

        // Restore body scroll
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';

        // Update state
        this.isOpen = false;

        // Remove focus trap
        this.removeFocusTrap();

        // Update ARIA attributes
        this.hamburgerBtn?.setAttribute('aria-expanded', 'false');
        this.mobileMenu?.setAttribute('aria-hidden', 'true');

        // Restore focus to hamburger button
        if (this.previousFocusedElement) {
            this.previousFocusedElement.focus();
            this.previousFocusedElement = null;
        }

        // Close products dropdown if open
        this.closeProductsDropdown();

        // Dispatch custom event
        this.dispatchEvent('universalMenuClosed');
    }

    /**
     * Toggle products dropdown
     */
    toggleProductsDropdown() {
        if (this.productsDropdown) {
            this.productsDropdown.classList.toggle('open');
            
            const isOpen = this.productsDropdown.classList.contains('open');
            const toggle = this.productsDropdown.querySelector('.universal-dropdown-toggle');
            
            if (toggle) {
                toggle.setAttribute('aria-expanded', isOpen.toString());
            }
        }
    }

    /**
     * Close products dropdown
     */
    closeProductsDropdown() {
        if (this.productsDropdown) {
            this.productsDropdown.classList.remove('open');
            
            const toggle = this.productsDropdown.querySelector('.universal-dropdown-toggle');
            if (toggle) {
                toggle.setAttribute('aria-expanded', 'false');
            }
        }
    }

    /**
     * Sync language selectors
     */
    syncLanguageSelectors() {
        if (this.desktopLangDropdown && this.mobileLangDropdown) {
            // Sync initial values
            this.mobileLangDropdown.value = this.desktopLangDropdown.value;
        }
    }

    /**
     * Setup accessibility attributes
     */
    setupAccessibility() {
        // Hamburger button
        if (this.hamburgerBtn) {
            this.hamburgerBtn.setAttribute('aria-expanded', 'false');
            this.hamburgerBtn.setAttribute('aria-controls', 'universal-mobile-menu');
            this.hamburgerBtn.setAttribute('aria-label', 'Toggle navigation menu');
        }

        // Mobile menu
        if (this.mobileMenu) {
            this.mobileMenu.setAttribute('aria-hidden', 'true');
            this.mobileMenu.setAttribute('role', 'dialog');
            this.mobileMenu.setAttribute('aria-labelledby', 'universal-mobile-header');
        }

        // Products dropdown
        const productsToggle = this.productsDropdown?.querySelector('.universal-dropdown-toggle');
        if (productsToggle) {
            productsToggle.setAttribute('aria-expanded', 'false');
            productsToggle.setAttribute('aria-controls', 'universal-products-submenu');
        }

        const productsSubmenu = this.productsDropdown?.querySelector('.universal-products-submenu');
        if (productsSubmenu) {
            productsSubmenu.setAttribute('id', 'universal-products-submenu');
        }
    }

    /**
     * Setup focus trap within mobile menu
     */
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
                        // Shift + Tab
                        if (document.activeElement === firstElement) {
                            e.preventDefault();
                            lastElement.focus();
                        }
                    } else {
                        // Tab
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

    /**
     * Remove focus trap
     */
    removeFocusTrap() {
        if (this.focusTrapHandler) {
            document.removeEventListener('keydown', this.focusTrapHandler);
            this.focusTrapHandler = null;
        }
    }

    /* ===== USER MANAGEMENT METHODS ===== */

    /**
     * Load current user data from various sources
     */
    async loadUserData() {
        try {
            // Show loading state
            this.showLoadingState();

            // Try multiple sources to get user data
            let userData = this.getUserFromStorage() || 
                          this.getUserFromWindow() || 
                          this.getUserFromExistingMenu();
            
            // If no user data found locally, try API
            if (!userData) {
                userData = await this.getUserFromAPI();
            }
            
            // Update the mobile menu with user data
            this.updateUserSection(userData);
            
        } catch (error) {
            console.warn('Error loading user data:', error);
            this.updateUserSection(null);
        }
    }

    /**
     * Get user data from localStorage/sessionStorage
     */
    getUserFromStorage() {
        try {
            const storageKeys = ['userData', 'user', 'currentUser', 'loggedInUser'];
            
            for (const key of storageKeys) {
                // Try localStorage first
                let userStr = localStorage.getItem(key);
                if (!userStr) {
                    // Then try sessionStorage
                    userStr = sessionStorage.getItem(key);
                }
                
                if (userStr) {
                    const userData = JSON.parse(userStr);
                    console.log(`✅ User found in storage (${key}):`, userData);
                    return userData;
                }
            }
        } catch (error) {
            console.warn('Error reading user from storage:', error);
        }
        return null;
    }

    /**
     * Get user data from global window object
     */
    getUserFromWindow() {
        const globalUserKeys = ['currentUser', 'user', 'userData', 'authUser'];
        
        for (const key of globalUserKeys) {
            if (window[key]) {
                console.log(`✅ User found in window.${key}:`, window[key]);
                return window[key];
            }
        }
        return null;
    }

    /**
     * Get user data from existing desktop user menu
     */
    getUserFromExistingMenu() {
        try {
            // Look for user name in desktop menu
            const userNameSelectors = [
                '.user-name',
                '.nav-user-name', 
                '[data-user-name]',
                '.user-dropdown-toggle .user-name'
            ];
            
            let userNameElement = null;
            for (const selector of userNameSelectors) {
                userNameElement = document.querySelector(selector);
                if (userNameElement && userNameElement.textContent.trim() !== 'User') {
                    break;
                }
            }
            
            if (userNameElement && userNameElement.textContent.trim() !== 'User') {
                const userName = userNameElement.textContent.trim();
                
                // Try to find email or other user info
                const userEmailSelectors = [
                    '[data-user-email]',
                    '.user-email',
                    '.user-dropdown-menu [href*="profile"]'
                ];
                
                let userEmail = '';
                for (const selector of userEmailSelectors) {
                    const emailElement = document.querySelector(selector);
                    if (emailElement) {
                        userEmail = emailElement.textContent.trim();
                        break;
                    }
                }
                
                const userData = {
                    name: userName,
                    email: userEmail,
                    isLoggedIn: true
                };
                
                console.log('✅ User found from existing menu:', userData);
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
        const endpoints = [
            '/api/user/current',
            '/api/auth/me', 
            '/api/user/profile',
            '/user/current',
            '/auth/user',
            '/api/auth/status'
        ];

        for (const endpoint of endpoints) {
            try {
                const headers = {
                    'Content-Type': 'application/json'
                };

                // Add authorization header if token exists
                const token = localStorage.getItem('token') || 
                            localStorage.getItem('authToken') || 
                            localStorage.getItem('accessToken');
                
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }

                const response = await fetch(endpoint, {
                    method: 'GET',
                    credentials: 'include',
                    headers: headers
                });

                if (response.ok) {
                    const userData = await response.json();
                    console.log(`✅ User found from API (${endpoint}):`, userData);
                    return userData.user || userData; // Handle different response formats
                }
            } catch (error) {
                // Continue to next endpoint
                continue;
            }
        }
        
        console.log('ℹ️ No user data found from API endpoints');
        return null;
    }

    /**
     * Update mobile user section with user data
     */
    updateUserSection(userData) {
        this.currentUser = userData;
        this.hideLoadingState();

        if (userData && userData.isLoggedIn !== false) {
            // User is logged in - show user section
            this.showUserSection(userData);
        } else {
            // User is not logged in - show auth buttons
            this.showAuthSection();
        }
    }

    /**
     * Show loading state
     */
    showLoadingState() {
        if (this.userSection) {
            this.userSection.classList.add('loading');
            this.userSection.style.display = 'block';
        }
        if (this.authSection) {
            this.authSection.style.display = 'none';
        }
    }

    /**
     * Hide loading state
     */
    hideLoadingState() {
        if (this.userSection) {
            this.userSection.classList.remove('loading');
        }
    }

    /**
     * Show logged-in user section
     */
    showUserSection(userData) {
        // Show user section, hide auth section
        if (this.userSection) {
            this.userSection.style.display = 'block';
        }
        if (this.authSection) {
            this.authSection.style.display = 'none';
        }

        // Extract user info with fallbacks
        const userName = userData.name || 
                        userData.username || 
                        userData.displayName || 
                        userData.fullName || 
                        userData.first_name ||
                        'User';
        
        const userEmail = userData.email || 
                         userData.emailAddress || 
                         userData.mail || 
                         userData.email_address ||
                         '';
        
        const userAvatar = userData.avatar || 
                          userData.profilePicture || 
                          userData.image || 
                          userData.picture ||
                          userData.photo ||
                          null;

        // Update user details
        const nameElement = this.userSection?.querySelector('.universal-user-details h4');
        const emailElement = this.userSection?.querySelector('.universal-user-details p');

        if (nameElement) {
            nameElement.textContent = userName;
        }

        if (emailElement) {
            emailElement.textContent = userEmail;
        }

        // Update avatar
        const avatarElement = this.userSection?.querySelector('.universal-user-avatar');
        if (avatarElement) {
            if (userAvatar) {
                // Use user's avatar image
                avatarElement.innerHTML = `<img src="${userAvatar}" alt="${userName}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
            } else {
                // Use initials or default icon
                const initials = this.getInitials(userName);
                avatarElement.innerHTML = initials ? 
                    `<span>${initials}</span>` : 
                    '<i class="fas fa-user"></i>';
            }
        }

        console.log('👤 User section updated:', { userName, userEmail, userAvatar });
    }

    /**
     * Show authentication section for non-logged-in users
     */
    showAuthSection() {
        // Hide user section, show auth section
        if (this.userSection) {
            this.userSection.style.display = 'none';
        }
        if (this.authSection) {
            this.authSection.style.display = 'block';
        }

        console.log('🔐 Auth section displayed (user not logged in)');
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
     * Handle user logout
     */
    async handleLogout() {
        try {
            // Close mobile menu first
            this.closeMenu();

            // Show confirmation (optional)
            if (!confirm('Are you sure you want to logout?')) {
                return;
            }

            // Clear user data from storage
            const storageKeys = ['userData', 'user', 'currentUser', 'token', 'authToken', 'accessToken'];
            storageKeys.forEach(key => {
                localStorage.removeItem(key);
                sessionStorage.removeItem(key);
            });

            // Clear global user objects
            const globalKeys = ['currentUser', 'user', 'userData', 'authUser'];
            globalKeys.forEach(key => {
                if (window[key]) window[key] = null;
            });

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
            this.dispatchEvent('userLoggedOut');

            // Update UI
            this.updateUserSection(null);

            // Redirect or reload page
            const currentPath = window.location.pathname;
            if (currentPath.includes('profile') || 
                currentPath.includes('dashboard') ||
                currentPath.includes('account')) {
                window.location.href = '/index.html';
            } else {
                // Just reload current page
                window.location.reload();
            }

        } catch (error) {
            console.error('Error during logout:', error);
            alert('Logout failed. Please try again.');
        }
    }

    /**
     * Setup listeners for user authentication changes
     */
    setupUserAuthListeners() {
        // Listen for login events
        document.addEventListener('userLoggedIn', (event) => {
            const userData = event.detail?.user || event.detail?.userData;
            if (userData) {
                this.updateUserSection(userData);
            } else {
                this.loadUserData();
            }
        });

        // Listen for logout events
        document.addEventListener('userLoggedOut', () => {
            this.updateUserSection(null);
        });

        // Listen for user data updates
        document.addEventListener('userDataUpdated', (event) => {
            const userData = event.detail?.user || event.detail?.userData;
            if (userData) {
                this.updateUserSection(userData);
            } else {
                this.loadUserData();
            }
        });

        // Watch for changes in localStorage
        window.addEventListener('storage', (event) => {
            const userKeys = ['user', 'userData', 'currentUser'];
            if (userKeys.includes(event.key)) {
                this.loadUserData();
            }
        });
    }

    /* ===== UTILITY METHODS ===== */

    /**
     * Check if menu is currently open
     */
    isMenuOpen() {
        return this.isOpen;
    }

    /**
     * Dispatch custom events
     */
    dispatchEvent(eventName, detail = {}) {
        const event = new CustomEvent(eventName, {
            detail: { hamburgerMenu: this, ...detail }
        });
        document.dispatchEvent(event);
    }

    /**
     * Public method to programmatically open menu
     */
    open() {
        this.openMenu();
    }

    /**
     * Public method to programmatically close menu
     */
    close() {
        this.closeMenu();
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
        this.updateUserSection(userData);
    }

    /**
     * Debug information
     */
    logDebugInfo() {
        const elements = {
            'Hamburger Button': !!this.hamburgerBtn,
            'Mobile Menu': !!this.mobileMenu,
            'Mobile Overlay': !!this.mobileOverlay,
            'Mobile Close': !!this.mobileClose,
            'Products Dropdown': !!this.productsDropdown,
            'User Section': !!this.userSection,
            'Auth Section': !!this.authSection,
            'Desktop Language': !!this.desktopLangDropdown,
            'Mobile Language': !!this.mobileLangDropdown
        };

        console.log('🔍 Universal Hamburger Menu Elements:', elements);
        
        const missingElements = Object.entries(elements)
            .filter(([name, exists]) => !exists)
            .map(([name]) => name);
        
        if (missingElements.length > 0) {
            console.warn('⚠️ Missing elements:', missingElements);
        }
    }

    /**
     * Destroy the hamburger menu instance
     */
    destroy() {
        this.closeMenu();
        this.removeFocusTrap();
        this.isOpen = false;
        this.previousFocusedElement = null;
        this.currentUser = null;
    }
}

/* ===== HELPER FUNCTIONS FOR INTEGRATION ===== */

/**
 * Easy function to set user data (for your login system)
 */
function setUniversalUser(userData) {
    // Store in localStorage for persistence
    localStorage.setItem('userData', JSON.stringify(userData));
    
    // Set in global window object
    window.currentUser = userData;
    
    // Update hamburger menu if it exists
    if (window.universalHamburgerMenu) {
        window.universalHamburgerMenu.updateUserData(userData);
    }
    
    // Trigger event for other components
    document.dispatchEvent(new CustomEvent('userLoggedIn', {
        detail: { user: userData }
    }));
    
    console.log('✅ Universal user data set:', userData);
}

/**
 * Easy function to clear user data (for your logout system)
 */
function clearUniversalUser() {
    // Clear from storage
    localStorage.removeItem('userData');
    sessionStorage.removeItem('userData');
    
    // Clear global objects
    window.currentUser = null;
    
    // Update hamburger menu if it exists
    if (window.universalHamburgerMenu) {
        window.universalHamburgerMenu.updateUserData(null);
    }
    
    // Trigger event
    document.dispatchEvent(new CustomEvent('userLoggedOut'));
    
    console.log('✅ Universal user data cleared');
}

/**
 * Test function to set mock user (for testing)
 */
function setTestUser() {
    const testUser = {
        name: "John Doe",
        email: "john@biobloom.com",
        avatar: null, // Will show "JD" initials
        isLoggedIn: true
    };
    
    setUniversalUser(testUser);
    console.log('🧪 Test user set for debugging');
}

/**
 * Test function to clear user (for testing)
 */
function clearTestUser() {
    clearUniversalUser();
    console.log('🧪 Test user cleared');
}

/* ===== AUTO-INITIALIZATION ===== */

/**
 * Auto-initialize hamburger menu when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
    // Check if hamburger menu elements exist
    const hamburgerBtn = document.getElementById('universal-hamburger-btn');
    const mobileMenu = document.getElementById('universal-mobile-menu');
    
    if (hamburgerBtn && mobileMenu) {
        // Initialize hamburger menu
        window.universalHamburgerMenu = new UniversalHamburgerMenu();
        
        // Make classes globally accessible for debugging
        if (typeof window !== 'undefined') {
            window.UniversalHamburgerMenu = UniversalHamburgerMenu;
            window.setUniversalUser = setUniversalUser;
            window.clearUniversalUser = clearUniversalUser;
            window.setTestUser = setTestUser;
            window.clearTestUser = clearTestUser;
        }
        
        console.log('🎉 Universal Hamburger Menu system ready!');
        console.log('💡 Try: setTestUser() or clearTestUser() in console to test');
        
    } else {
        console.warn('⚠️ Universal Hamburger Menu elements not found.');
        console.warn('Make sure your HTML has the correct universal- IDs.');
    }
});

/**
 * Handle page visibility changes
 */
document.addEventListener('visibilitychange', () => {
    if (document.hidden && window.universalHamburgerMenu && window.universalHamburgerMenu.isMenuOpen()) {
        window.universalHamburgerMenu.close();
    }
});

/* ===== EXPORT FOR MODULE SYSTEMS ===== */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        UniversalHamburgerMenu,
        setUniversalUser,
        clearUniversalUser,
        setTestUser,
        clearTestUser
    };
}