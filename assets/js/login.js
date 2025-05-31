document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const togglePasswordBtn = document.querySelector('.toggle-password');
    const rememberMe = document.getElementById('remember');
    const loginBtn = document.querySelector('.login-btn');
    const googleLoginBtn = document.getElementById('google-login');
    const githubLoginBtn = document.getElementById('github-login');

    // Add validation event listeners
    if (emailInput) {
        emailInput.addEventListener('blur', () => validateField(emailInput, validateEmail, true));
        emailInput.addEventListener('input', () => validateField(emailInput, validateEmail, true));
    }
    
    if (passwordInput) {
        passwordInput.addEventListener('blur', () => {
            // For login, we just need to check if password is not empty
            if (!passwordInput.value.trim()) {
                showError(passwordInput, 'Password is required');
                return false;
            } else {
                clearError(passwordInput);
                return true;
            }
        });
        
        passwordInput.addEventListener('input', () => {
            if (!passwordInput.value.trim()) {
                showError(passwordInput, 'Password is required');
                return false;
            } else {
                clearError(passwordInput);
                return true;
            }
        });
    }

    // Check for remembered credentials
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
        emailInput.value = rememberedEmail;
        rememberMe.checked = true;
    }

    // Check for token in URL (from Google OAuth redirect)
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (token) {
        // Store token and redirect to home
        localStorage.setItem('token', token);
        window.location.href = '../';
        return;
    }

    // Check if user is already logged in
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
        window.location.href = '../';
        return;
    }

    // Toggle password visibility
    if (togglePasswordBtn) {
        togglePasswordBtn.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            togglePasswordBtn.querySelector('i').classList.toggle('fa-eye');
            togglePasswordBtn.querySelector('i').classList.toggle('fa-eye-slash');
        });
    }

    // Form submission
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            let isValid = true;
            
            // Validate email
            if (emailInput) {
                isValid = validateField(emailInput, validateEmail, true) && isValid;
            }
            
            // Validate password (just check if not empty for login)
            if (passwordInput) {
                if (!passwordInput.value.trim()) {
                    showError(passwordInput, 'Password is required');
                    isValid = false;
                } else {
                    clearError(passwordInput);
                }
            }
            
            if (!isValid) {
                showToast('Please fix the errors in the form', 'error');
                return;
            }

            // Show loading state
            loginBtn.classList.add('loading');
            loginBtn.disabled = true;

            mockLogin(emailInput.value, passwordInput.value);
        });
    }

    // Mock login function for demo purposes
    function mockLogin(email, password) {
        setTimeout(() => {
            const mockUser = {
                id: '12345',
                name: 'Demo User',
                email: email,
                role: 'user'
            };
            
            const mockToken = 'mock-jwt-token-for-demo-purposes';
            
            // Store token and user data
            localStorage.setItem('token', mockToken);
            localStorage.setItem('user', JSON.stringify(mockUser));
            
            // Handle remember me
            if (rememberMe && rememberMe.checked) {
                localStorage.setItem('rememberedEmail', email);
            } else if (rememberMe) {
                localStorage.removeItem('rememberedEmail');
            }
            
            // Show success message
            showToast('Login successful! Redirecting...', 'success');
            
            // Redirect after a short delay
            setTimeout(() => {
                window.location.href = '../';
            }, 1500);
        }, 1000);
    }

    // Google login button click handler
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', () => {
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
            
            window.location.href = authUrl;
        });
    }

    // Handle GitHub login
    if (githubLoginBtn) {
        githubLoginBtn.addEventListener('click', () => {
            showToast('GitHub login coming soon!', 'info');
        });
    }
});