document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('reset-password-form');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const passwordError = document.getElementById('password-error');
    const confirmPasswordError = document.getElementById('confirm-password-error');
    const submitButton = form.querySelector('button[type="submit"]');
    const btnText = submitButton.querySelector('.btn-text');
    const spinner = submitButton.querySelector('.spinner');
    const togglePasswordBtn = document.getElementById('toggle-password');
    const toggleConfirmPasswordBtn = document.getElementById('toggle-confirm-password');

    // Get reset token from URL
    const resetToken = window.location.pathname.split('/').pop();

    // Password validation function
    function validatePassword(password) {
        // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
        return passwordRegex.test(password);
    }

    // Show error message
    function showError(element, message) {
        element.textContent = message;
        element.style.display = 'block';
    }

    // Hide error message
    function hideError(element) {
        element.textContent = '';
        element.style.display = 'none';
    }

    // Show loading state
    function setLoading(isLoading) {
        submitButton.disabled = isLoading;
        btnText.style.display = isLoading ? 'none' : 'block';
        spinner.style.display = isLoading ? 'block' : 'none';
    }

    // Show toast message
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        // Remove toast after 3 seconds
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    // Toggle password visibility
    function togglePasswordVisibility(input, button) {
        const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
        input.setAttribute('type', type);
        button.querySelector('i').classList.toggle('fa-eye');
        button.querySelector('i').classList.toggle('fa-eye-slash');
    }

    // Handle form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Reset error messages
        hideError(passwordError);
        hideError(confirmPasswordError);
        
        // Get form values
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        
        // Validate password
        if (!validatePassword(password)) {
            showError(passwordError, 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number');
            return;
        }
        
        // Check if passwords match
        if (password !== confirmPassword) {
            showError(confirmPasswordError, 'Passwords do not match');
            return;
        }

        // Show loading state
        setLoading(true);

        try {
            const response = await fetch(`/api/auth/reset-password/${resetToken}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ password })
            });

            const data = await response.json();

            if (response.ok) {
                // Show success message
                showToast('Password has been reset successfully');
                
                // Redirect to login page after 3 seconds
                setTimeout(() => {
                    window.location.href = '/login';
                }, 3000);
            } else {
                // Show error message
                showToast(data.message || 'Failed to reset password', 'error');
            }
        } catch (error) {
            showToast('An error occurred. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    });

    // Real-time password validation
    passwordInput.addEventListener('input', () => {
        const password = passwordInput.value;
        if (!validatePassword(password)) {
            showError(passwordError, 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number');
        } else {
            hideError(passwordError);
        }
    });

    confirmPasswordInput.addEventListener('input', () => {
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        if (password !== confirmPassword) {
            showError(confirmPasswordError, 'Passwords do not match');
        } else {
            hideError(confirmPasswordError);
        }
    });

    // Toggle password visibility
    togglePasswordBtn.addEventListener('click', () => {
        togglePasswordVisibility(passwordInput, togglePasswordBtn);
    });

    toggleConfirmPasswordBtn.addEventListener('click', () => {
        togglePasswordVisibility(confirmPasswordInput, toggleConfirmPasswordBtn);
    });
}); 