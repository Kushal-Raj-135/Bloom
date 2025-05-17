document.addEventListener('DOMContentLoaded', () => {
    // Get form elements
    const registerForm = document.getElementById('register-form');
    const nameInput = document.getElementById('fullname');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const togglePassword = document.querySelector('.toggle-password');
    const toggleConfirmPassword = document.querySelectorAll('.toggle-password')[1];
    const googleRegisterBtn = document.querySelector('.social-btn.google');
    const githubRegisterBtn = document.getElementById('github-register');
    const termsCheckbox = document.getElementById('terms');
    
    // Get error elements
    const fullnameError = document.getElementById('fullname-error');
    const emailError = document.getElementById('email-error');
    const passwordError = document.getElementById('password-error');
    const confirmPasswordError = document.getElementById('confirm-password-error');

    // Check if user is already logged in
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
        window.location.href = 'index.html';
        return;
    }

    // Toggle password visibility
    function togglePasswordVisibility(inputElement, toggleButton) {
        if (!inputElement || !toggleButton) return;
        const type = inputElement.type === 'password' ? 'text' : 'password';
        inputElement.type = type;
        toggleButton.innerHTML = type === 'password' 
            ? '<i class="fas fa-eye"></i>' 
            : '<i class="fas fa-eye-slash"></i>';
    }

    // Add event listeners only if elements exist
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', () => 
            togglePasswordVisibility(passwordInput, togglePassword));
    }
    
    if (toggleConfirmPassword && confirmPasswordInput) {
        toggleConfirmPassword.addEventListener('click', () => 
            togglePasswordVisibility(confirmPasswordInput, toggleConfirmPassword));
    }

    // Input validation functions
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function validatePassword(password) {
        // Password must be at least 8 characters long and contain at least one number and one letter
        const re = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
        return re.test(password);
    }

    function validateFullname(name) {
        return name.trim().length >= 2 && /^[a-zA-Z\s]*$/.test(name);
    }

    function showError(element, message) {
        if (!element) return;
        element.textContent = message;
        element.style.display = 'block';
    }

    function hideError(element) {
        if (!element) return;
        element.style.display = 'none';
    }

    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    // Real-time validation
    if (nameInput) {
        nameInput.addEventListener('input', () => {
            if (!validateFullname(nameInput.value)) {
                showError(fullnameError, 'Please enter a valid name (letters and spaces only)');
            } else {
                hideError(fullnameError);
            }
        });
    }

    if (emailInput) {
        emailInput.addEventListener('input', () => {
            if (!validateEmail(emailInput.value)) {
                showError(emailError, 'Please enter a valid email address');
            } else {
                hideError(emailError);
            }
        });
    }

    if (passwordInput) {
        passwordInput.addEventListener('input', () => {
            if (!validatePassword(passwordInput.value)) {
                showError(passwordError, 'Password must be at least 8 characters with letters and numbers');
            } else {
                hideError(passwordError);
            }
            
            if (confirmPasswordInput && confirmPasswordInput.value && 
                confirmPasswordInput.value !== passwordInput.value) {
                showError(confirmPasswordError, 'Passwords do not match');
            } else {
                hideError(confirmPasswordError);
            }
        });
    }

    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', () => {
            if (confirmPasswordInput.value !== passwordInput.value) {
                showError(confirmPasswordError, 'Passwords do not match');
            } else {
                hideError(confirmPasswordError);
            }
        });
    }

    // Handle form submission
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (passwordInput.value !== confirmPasswordInput.value) {
                showError(confirmPasswordError, 'Passwords do not match');
                return;
            }

            const submitButton = registerForm.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registering...';

            try {
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name: nameInput.value,
                        email: emailInput.value,
                        password: passwordInput.value
                    })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Registration failed');
                }

                showToast('Registration successful! Please login.', 'success');

                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);

            } catch (error) {
                showToast(error.message, 'error');
            } finally {
                submitButton.disabled = false;
                submitButton.innerHTML = 'Register';
            }
        });
    }

    // Handle Google registration
    if (googleRegisterBtn) {
        googleRegisterBtn.addEventListener('click', () => {
            try {
                const clientId = '819077799545-ajlsrnaenlg5ajbjutm02mu77rejh7v8.apps.googleusercontent.com';
                const redirectUri = 'http://localhost:3000/api/auth/google/callback';
                const scope = 'email profile';
                
                const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
                    `client_id=${clientId}&` +
                    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
                    `response_type=code&` +
                    `scope=${encodeURIComponent(scope)}&` +
                    `access_type=offline&` +
                    `prompt=consent`;
                
                console.log('Redirecting to Google OAuth:', authUrl);
                window.location.href = authUrl;
            } catch (error) {
                console.error('Error in Google registration:', error);
                showToast('Error initiating Google registration. Please try again.', 'error');
            }
        });
    }

    // Handle GitHub registration
    if (githubRegisterBtn) {
        githubRegisterBtn.addEventListener('click', () => {
            showToast('GitHub registration coming soon!', 'info');
        });
    }

    // Check terms and conditions
    if (termsCheckbox) {
        termsCheckbox.addEventListener('change', () => {
            if (!termsCheckbox.checked) {
                showError(confirmPasswordError, 'Please accept the Terms & Conditions');
            } else {
                hideError(confirmPasswordError);
            }
        });
    }
}); 