document.addEventListener('DOMContentLoaded', () => {
    const authButtons = document.querySelector('.auth-buttons');
    const userMenu = document.querySelector('.user-menu');
    const userNameSpan = document.querySelector('.user-name');
    const logoutBtn = document.querySelector('.logout-btn');

    // Check for token in URL (for Google login)
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token) {
        // Store the token
        localStorage.setItem('token', token);
        
        // Fetch user data
        fetch('/api/auth/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(user => {
            localStorage.setItem('user', JSON.stringify(user));
            updateUI(user);
        })
        .catch(error => {
            console.error('Error fetching user data:', error);
        });

        // Remove token from URL
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Check login status on page load
    checkLoginStatus();

    // Handle logout click
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            handleLogout();
        });
    }

    // Check if user is logged in
    function checkLoginStatus() {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));

        if (token && user) {
            updateUI(user);
        } else {
            // Show login/register buttons
            if (authButtons) {
                authButtons.style.display = 'flex';
            }
            if (userMenu) {
                userMenu.style.display = 'none';
            }
        }
    }

    // Update UI based on user data
    function updateUI(user) {
        // Hide auth buttons
        if (authButtons) {
            authButtons.style.display = 'none';
        }
        
        // Show user menu
        if (userMenu) {
            userMenu.style.display = 'block';
        }
        
        if (userNameSpan) {
            userNameSpan.textContent = user.name || 'User';
        }
    }
});

// Logout function
function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Show a toast message
    showToast('Logged out successfully', 'success');
    
    // Redirect to home page after a short delay
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Function to handle toggle of user dropdown menu
document.addEventListener('click', function(e) {
    const userDropdownToggle = document.querySelector('.user-dropdown-toggle');
    const userDropdownMenu = document.querySelector('.user-dropdown-menu');
    
    if (!userDropdownToggle || !userDropdownMenu) return;
    
    if (userDropdownToggle.contains(e.target)) {
        // Toggle dropdown when clicking on the toggle button
        e.preventDefault();
        userDropdownMenu.classList.toggle('show');
    } else if (!userDropdownMenu.contains(e.target)) {
        // Close dropdown when clicking outside
        userDropdownMenu.classList.remove('show');
    }
}); 