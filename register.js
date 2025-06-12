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
    const githubRegisterBtn = document.querySelector('.social-btn.github');
    const termsCheckbox = document.getElementById('terms');
    
    // Add validation event listeners
    if (nameInput) {
        nameInput.addEventListener('blur', () => validateField(nameInput, validateName, true));
        nameInput.addEventListener('input', () => validateField(nameInput, validateName, true));
    }
    
    if (emailInput) {
        emailInput.addEventListener('blur', () => validateField(emailInput, validateEmail, true));
        emailInput.addEventListener('input', () => validateField(emailInput, validateEmail, true));
    }
    
    if (passwordInput) {
        passwordInput.addEventListener('blur', () => validateField(passwordInput, validatePassword, true));
        passwordInput.addEventListener('input', () => validateField(passwordInput, validatePassword, true));
        
        // Also revalidate confirm password when the main password changes
        passwordInput.addEventListener('input', () => {
            if (confirmPasswordInput && confirmPasswordInput.value) {
                validateField(confirmPasswordInput, 
                    value => validatePasswordMatch(passwordInput.value, value), 
                    true);
            }
        });
    }
    
    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('blur', () => 
            validateField(confirmPasswordInput, 
                value => validatePasswordMatch(passwordInput.value, value), 
                true));
        confirmPasswordInput.addEventListener('input', () => 
            validateField(confirmPasswordInput, 
                value => validatePasswordMatch(passwordInput.value, value), 
                true));
    }
    
    if (termsCheckbox) {
        termsCheckbox.addEventListener('change', () => {
            if (!termsCheckbox.checked) {
                showError(termsCheckbox, document.getElementById('terms-error') || termsCheckbox, 'You must agree to the Terms and Conditions');
            } else {
                clearError(termsCheckbox, document.getElementById('terms-error') || termsCheckbox);
            }
        });
    }

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

    // Handle form submission
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            let isValid = true;
            
            // Validate all fields
            if (nameInput) {
                isValid = validateField(nameInput, validateName, true) && isValid;
            }
            
            if (emailInput) {
                isValid = validateField(emailInput, validateEmail, true) && isValid;
            }
            
            if (passwordInput) {
                isValid = validateField(passwordInput, validatePassword, true) && isValid;
            }
            
            if (confirmPasswordInput && passwordInput) {
                isValid = validateField(
                    confirmPasswordInput, 
                    value => validatePasswordMatch(passwordInput.value, value), 
                    true
                ) && isValid;
            }
            
            // Validate terms checkbox
            if (termsCheckbox && !termsCheckbox.checked) {
                showError(termsCheckbox, document.getElementById('terms-error') || termsCheckbox, 'You must agree to the Terms and Conditions');
                isValid = false;
            } else if (termsCheckbox) {
                clearError(termsCheckbox, document.getElementById('terms-error') || termsCheckbox);
            }
            
            // If validation fails, stop form submission
            if (!isValid) {
                showToast('Please fix the errors in the form', 'error');
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

    
    // Google login button click handler
    if (googleRegisterBtn) {
        googleRegisterBtn.addEventListener('click', () => {
             window.location.href = 'http://localhost:3000/api/auth/google';
        });
    }

    // Handle GitHub login
    if (githubRegisterBtn) {
        githubRegisterBtn.addEventListener('click', () => {
            window.location.href = 'http://localhost:3000/api/auth/github';
        });
    }
});