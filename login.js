document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const emailError = document.getElementById('email-error');
    const passwordError = document.getElementById('password-error');
    const togglePasswordBtn = document.querySelector('.toggle-password');
    const rememberMe = document.getElementById('remember');
    const loginBtn = document.querySelector('.login-btn');
    const googleLoginBtn = document.getElementById('google-login');
    const githubLoginBtn = document.getElementById('github-login');

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
        window.location.href = 'index.html';
        return;
    }

    // Check if user is already logged in
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
        window.location.href = 'index.html';
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

    // Input validation
    function validateEmail(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    function validatePassword(password) {
        return password.length >= 6;
    }

    function showError(element, message) {
        element.textContent = message;
        element.style.display = 'block';
    }

    function hideError(element) {
        element.style.display = 'none';
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
                showError(passwordError, 'Password must be at least 6 characters long');
            } else {
                hideError(passwordError);
            }
        });
    }

    // Form submission
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = emailInput.value;
            const password = passwordInput.value;

            // Validate inputs
            if (!validateEmail(email)) {
                showError(emailError, 'Please enter a valid email address');
                return;
            }

            if (!validatePassword(password)) {
                showError(passwordError, 'Password must be at least 6 characters long');
                return;
            }

            // Show loading state
            loginBtn.classList.add('loading');
            loginBtn.disabled = true;

            // For demo purposes, use mock login instead of API call
            mockLogin(email, password);
        });
    }

    // Mock login function for demo purposes
    function mockLogin(email, password) {
        // In a real app, this would be an API call
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
                window.location.href = 'index.html';
            }, 1500);
        }, 1000); // Simulate network delay
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

    // Toast notification helper
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
});