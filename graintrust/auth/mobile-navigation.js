// Mobile Navigation Functionality for GrainTrust

document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle functionality
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (mobileMenuToggle && navMenu) {
        mobileMenuToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Toggle active classes
            mobileMenuToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
            
            // Toggle aria attributes for accessibility
            const isActive = navMenu.classList.contains('active');
            mobileMenuToggle.setAttribute('aria-expanded', isActive);
            navMenu.setAttribute('aria-hidden', !isActive);
        });
    }
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        if (navMenu && mobileMenuToggle) {
            if (!navMenu.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
                navMenu.classList.remove('active');
                mobileMenuToggle.classList.remove('active');
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
                navMenu.setAttribute('aria-hidden', 'true');
            }
        }
    });
    
    // Close mobile menu when pressing Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (navMenu && mobileMenuToggle) {
                navMenu.classList.remove('active');
                mobileMenuToggle.classList.remove('active');
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
                navMenu.setAttribute('aria-hidden', 'true');
            }
        }
    });
    
    // Close mobile menu when clicking on nav links
    const navLinks = navMenu ? navMenu.querySelectorAll('a') : [];
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (navMenu && mobileMenuToggle) {
                navMenu.classList.remove('active');
                mobileMenuToggle.classList.remove('active');
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
                navMenu.setAttribute('aria-hidden', 'true');
            }
        });
    });
    
    // Handle window resize
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function() {
            // Close mobile menu on desktop view
            if (window.innerWidth > 768) {
                if (navMenu && mobileMenuToggle) {
                    navMenu.classList.remove('active');
                    mobileMenuToggle.classList.remove('active');
                    mobileMenuToggle.setAttribute('aria-expanded', 'false');
                    navMenu.setAttribute('aria-hidden', 'true');
                }
            }
        }, 250);
    });
    
    // Add accessibility attributes on load
    if (mobileMenuToggle && navMenu) {
        mobileMenuToggle.setAttribute('aria-label', 'Toggle navigation menu');
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
        mobileMenuToggle.setAttribute('aria-controls', 'navMenu');
        navMenu.setAttribute('aria-hidden', 'true');
    }
});

// Back button navigation function
function navigateToBloom() {
    try {
        // Navigate from graintrust/auth/ to root Bloom directory
        window.location.href = '../../index.html';
    } catch (error) {
        console.error('Navigation error:', error);
        // Fallback: try alternative paths
        const fallbackPaths = [
            '../../index.html',
            '/index.html',
            '../../../index.html',
            '/Bloom/index.html'
        ];
        
        // Try each fallback path
        let pathFound = false;
        fallbackPaths.forEach((path, index) => {
            if (!pathFound) {
                setTimeout(() => {
                    if (!pathFound) {
                        try {
                            window.location.href = path;
                            pathFound = true;
                        } catch (e) {
                            if (index === fallbackPaths.length - 1) {
                                // If all paths fail, show alert
                                alert('Could not navigate to Bloom index page. Please navigate manually.');
                            }
                        }
                    }
                }, index * 100);
            }
        });
    }
}

// Enhanced mobile experience functions
function initializeMobileEnhancements() {
    // Add touch event handlers for better mobile interaction
    const buttons = document.querySelectorAll('.btn, .back-btn, .register-btn');
    
    buttons.forEach(button => {
        // Add touch feedback
        button.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.98)';
        });
        
        button.addEventListener('touchend', function() {
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });
    
    // Optimize image loading for mobile
    const heroImage = document.getElementById('heroImage');
    if (heroImage && window.innerWidth <= 768) {
        // Add loading="lazy" for better mobile performance
        heroImage.setAttribute('loading', 'lazy');
        
        // Optimize image hover effect for touch devices
        heroImage.addEventListener('touchstart', function() {
            this.style.transform = 'scale(1.05)';
        });
        
        heroImage.addEventListener('touchend', function() {
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 200);
        });
    }
    
    // Improve overview container behavior on mobile
    const overviewContainer = document.getElementById('overviewContainer');
    if (overviewContainer && window.innerWidth <= 768) {
        // Add better scrolling behavior
        overviewContainer.addEventListener('scroll', function() {
            // Smooth scrolling for mobile
            this.style.scrollBehavior = 'smooth';
        });
    }
    
    // Add viewport height adjustment for mobile browsers
    adjustViewportHeight();
}

// Adjust viewport height for mobile browsers (addresses URL bar issues)
function adjustViewportHeight() {
    const setVH = () => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    setVH();
    window.addEventListener('resize', setVH);
    window.addEventListener('orientationchange', setVH);
}

// Initialize mobile enhancements when DOM is ready
document.addEventListener('DOMContentLoaded', initializeMobileEnhancements);

// Service Worker registration for better mobile performance (optional)
if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('./sw.js')
            .then(registration => {
                console.log('ServiceWorker registration successful');
            })
            .catch(error => {
                console.log('ServiceWorker registration failed');
            });
    });
}

// Export functions for potential external use
window.GrainTrustMobile = {
    navigateToBloom: navigateToBloom,
    initializeMobileEnhancements: initializeMobileEnhancements,
    adjustViewportHeight: adjustViewportHeight
};