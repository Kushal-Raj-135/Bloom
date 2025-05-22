// Page navigation and utility functions - Corrected Version
document.addEventListener('DOMContentLoaded', () => {
    // Initialize smooth scrolling for anchor links
    initSmoothScrolling();
    
    // Initialize mobile menu
    initMobileMenu();
    
    // Initialize dropdowns with perfect centering
    initDropdowns();
    
    // Don't automatically show user menu - let existing auth system handle it
    // The existing userMenu.js, login.js, register.js will manage authentication state
});

// Initialize smooth scrolling for anchor links
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
                
                // Update active state in navigation
                document.querySelectorAll('.nav-link').forEach(link => {
                    link.classList.remove('active');
                });
                this.classList.add('active');
            }
        });
    });
}

// Initialize mobile menu
function initMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.getElementById('mainNav');
    const menuOverlay = document.getElementById('menuOverlay');
    
    if (menuToggle && mainNav && menuOverlay) {
        // Toggle menu
        menuToggle.addEventListener('click', () => {
            toggleMenu();
        });

        // Close menu when clicking overlay
        menuOverlay.addEventListener('click', () => {
            closeMenu();
        });

        // Close menu when clicking menu items
        mainNav.querySelectorAll('a:not(.dropdown-toggle)').forEach(item => {
            item.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    closeMenu();
                }
            });
        });

        // Handle resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                closeMenu();
                menuToggle.style.display = 'none';
            } else {
                menuToggle.style.display = 'flex';
            }
        });
    }

    // Helper functions
    function toggleMenu() {
        mainNav.classList.toggle('active');
        menuOverlay.classList.toggle('active');
        document.body.style.overflow = mainNav.classList.contains('active') ? 'hidden' : '';
        menuToggle.textContent = mainNav.classList.contains('active') ? '✕' : '☰';
    }

    function closeMenu() {
        mainNav.classList.remove('active');
        menuOverlay.classList.remove('active');
        document.body.style.overflow = '';
        menuToggle.textContent = '☰';
        closeAllDropdowns();
    }
}

// Initialize dropdowns with perfect centering
function initDropdowns() {
    const dropdowns = document.querySelectorAll('.dropdown');
    
    dropdowns.forEach(dropdown => {
        const dropdownToggle = dropdown.querySelector('.dropdown-toggle, .user-dropdown-toggle');
        const dropdownMenu = dropdown.querySelector('.dropdown-menu, .user-dropdown-menu');
        
        if (dropdownToggle && dropdownMenu) {
            // Click behavior for both mobile and desktop
            dropdownToggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                if (window.innerWidth <= 768) {
                    // Mobile behavior
                    closeAllDropdowns();
                    dropdownMenu.classList.toggle('show');
                } else {
                    // Desktop behavior - perfectly centered
                    const isShown = dropdownMenu.classList.contains('show');
                    closeAllDropdowns();
                    
                    if (!isShown) {
                        dropdownMenu.classList.add('show');
                        // CSS handles the centering automatically with transform: translateX(-50%)
                    }
                }
            });
            
            // Desktop hover behavior for Products dropdown only (not user dropdown)
            if (dropdownToggle.classList.contains('dropdown-toggle')) {
                dropdown.addEventListener('mouseenter', () => {
                    if (window.innerWidth > 768) {
                        closeAllDropdowns();
                        dropdownMenu.classList.add('show');
                        // CSS handles the centering automatically
                    }
                });
                
                dropdown.addEventListener('mouseleave', () => {
                    if (window.innerWidth > 768) {
                        dropdownMenu.classList.remove('show');
                    }
                });
            }
        }
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.dropdown')) {
            closeAllDropdowns();
        }
    });
}

// Helper function to close all dropdowns
function closeAllDropdowns() {
    document.querySelectorAll('.dropdown-menu.show, .user-dropdown-menu.show').forEach(menu => {
        menu.classList.remove('show');
    });
}

// Handle window resize for responsive behavior
window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
        closeAllDropdowns();
    }
});

// Additional utility functions for smooth user experience
function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.getBoundingClientRect().top;
        if (sectionTop <= 100) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
}

// Update active nav link on scroll
window.addEventListener('scroll', updateActiveNavLink);

// Keyboard navigation support
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeAllDropdowns();
        if (document.getElementById('mainNav').classList.contains('active')) {
            document.getElementById('menuToggle').click();
        }
    }
});

// Integration with existing authentication system
// This function can be called by your existing userMenu.js to show user menu
window.showUserMenu = function(userData) {
    const authButtons = document.querySelector('.auth-buttons');
    const userMenu = document.querySelector('.user-menu');
    const userName = document.querySelector('.user-name');
    
    if (authButtons && userMenu) {
        authButtons.style.display = 'none';
        userMenu.style.display = 'block';
        
        if (userName && userData && userData.name) {
            userName.textContent = userData.name;
        }
    }
};

// This function can be called by your existing auth system to hide user menu
window.hideUserMenu = function() {
    const authButtons = document.querySelector('.auth-buttons');
    const userMenu = document.querySelector('.user-menu');
    
    if (authButtons && userMenu) {
        authButtons.style.display = 'flex';
        userMenu.style.display = 'none';
    }
};

// Enhanced logout functionality that works with your existing system
window.performLogout = function() {
    // This will be called when user clicks logout
    // Your existing logout logic in userMenu.js or other files can call this
    
    // Hide user menu and show auth buttons
    hideUserMenu();
    
    // Clear any stored authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    
    // Redirect to home page or login page
    if (window.location.pathname !== '/index.html' && window.location.pathname !== '/') {
        window.location.href = 'index.html';
    }
    
    // Close any open dropdowns
    closeAllDropdowns();
    
    // Optional: Show a logout success message
    // You can customize this based on your existing notification system
    console.log('User logged out successfully');
};

// Make functions available globally for integration with existing scripts
window.closeAllDropdowns = closeAllDropdowns;
window.updateActiveNavLink = updateActiveNavLink;