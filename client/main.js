/**
 * BioBloom - Main Application Entry Point
 * 
 * This file initializes the application and loads the required modules.
 */

import { initializeI18n } from './utils/i18n.js';
import * as authUtils from './assets/js/validation.js';

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing BioBloom application...');
    
    // Initialize internationalization
    initializeI18n().then(() => {
        console.log('Internationalization initialized.');
    }).catch(error => {
        console.error('Failed to initialize internationalization:', error);
    });
    
    // Check authentication state
    checkAuthState();
    
    // Initialize menu functionality
    initializeMenu();
});

/**
 * Check if the user is authenticated
 */
function checkAuthState() {
    const token = localStorage.getItem('auth-token');
    
    if (token) {
        // Verify token with backend
        fetch('/api/auth/verify', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.valid) {
                // User is authenticated
                updateUIForAuthenticatedUser(data.user);
            } else {
                // Token is invalid or expired
                localStorage.removeItem('auth-token');
                updateUIForUnauthenticatedUser();
            }
        })
        .catch(error => {
            console.error('Error verifying authentication:', error);
            updateUIForUnauthenticatedUser();
        });
    } else {
        // No token found
        updateUIForUnauthenticatedUser();
    }
}

/**
 * Update UI for authenticated user
 * @param {Object} user - User information
 */
function updateUIForAuthenticatedUser(user) {
    document.querySelectorAll('.auth-only').forEach(el => el.style.display = 'block');
    document.querySelectorAll('.guest-only').forEach(el => el.style.display = 'none');
    
    document.querySelectorAll('.user-name').forEach(el => el.textContent = user.name);
    document.querySelectorAll('.user-email').forEach(el => el.textContent = user.email);
    
    if (user.profilePicture) {
        document.querySelectorAll('.user-profile-picture').forEach(el => {
            el.src = user.profilePicture;
            el.alt = user.name;
        });
    }
}

/**
 * Update UI for unauthenticated user
 */
function updateUIForUnauthenticatedUser() {
    document.querySelectorAll('.auth-only').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.guest-only').forEach(el => el.style.display = 'block');
}

/**
 * Initialize mobile menu functionality
 */
function initializeMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navbar = document.querySelector('.navbar');
    
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navbar.classList.toggle('active');
        });
    }
    
    // Setup logout functionality
    document.querySelectorAll('.logout-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('auth-token');
            window.location.href = '/';
        });
    });
}

// Export functions that might be needed by other modules
export {
    checkAuthState,
    updateUIForAuthenticatedUser,
    updateUIForUnauthenticatedUser
};
