document.addEventListener('DOMContentLoaded', () => {
    const profileForm = document.getElementById('profile-form');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const locationInput = document.getElementById('location');
    const bioInput = document.getElementById('bio');
    const charCount = document.querySelector('.char-count');
    const currentPasswordInput = document.getElementById('current-password');
    const newPasswordInput = document.getElementById('new-password');
    const toggleCurrentPassword = document.getElementById('toggle-current-password');
    const toggleNewPassword = document.getElementById('toggle-new-password');
    const profilePicture = document.getElementById('profile-picture');
    const pictureInput = document.getElementById('picture-input'); 
    
    // Field validation event listeners
    if (nameInput) {
        nameInput.addEventListener('blur', () => validateField(nameInput, validateName, true));
        nameInput.addEventListener('input', () => validateField(nameInput, validateName, true));
    }

    if (emailInput) {
        emailInput.addEventListener('blur', () => validateField(emailInput, validateEmail, true));
        emailInput.addEventListener('input', () => validateField(emailInput, validateEmail, true));
    }

    if (phoneInput) {
        phoneInput.addEventListener('blur', () => validateField(phoneInput, validatePhone));
        phoneInput.addEventListener('input', () => validateField(phoneInput, validatePhone));
    }

    if (locationInput) {
        locationInput.addEventListener('blur', () => validateField(locationInput, validateLocation));
        locationInput.addEventListener('input', () => validateField(locationInput, validateLocation));
    }

    if (bioInput) {
        bioInput.addEventListener('blur', () => validateField(bioInput, validateBio));
        bioInput.addEventListener('input', () => validateField(bioInput, validateBio));
    }

    if (newPasswordInput) {
        newPasswordInput.addEventListener('blur', () => validateField(newPasswordInput, validatePassword));
        newPasswordInput.addEventListener('input', () => validateField(newPasswordInput, validatePassword));
    }

    if (currentPasswordInput) {
        currentPasswordInput.addEventListener('blur', () => {
            if (newPasswordInput && newPasswordInput.value.trim() !== '') {
                validateField(currentPasswordInput, validatePassword, true);
            }
        });
    }

    // Load real user data from localStorage/session
    let token, user;
    try {
        token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const userString = localStorage.getItem('user') || sessionStorage.getItem('user');
        user = userString ? JSON.parse(userString) : {};
    } catch (error) {
        console.error('Error reading user data:', error);
        token = null;
        user = {};
    }

    // Check if user is logged in
    if (!token || !user || Object.keys(user).length === 0) {
        // User not logged in, redirect to login page
        showToast('Please log in to access your profile', 'error');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
        return;
    }

    // Populate form with real user data
    if (nameInput) nameInput.value = user.name || '';
    if (emailInput) {
        emailInput.value = user.email || '';
        emailInput.readOnly = true; // Email should not be editable
    }
    if (phoneInput) phoneInput.value = user.phone || '';
    if (locationInput) locationInput.value = user.location || '';
    if (bioInput) bioInput.value = user.bio || '';
    if (profilePicture && user.profilePicture) {
        profilePicture.src = user.profilePicture;
    }

    // Update character count for bio
    if (bioInput && charCount) {
        const updateCharCount = () => {
            const count = bioInput.value.length;
            charCount.textContent = `${count}/200`;
            if (count > 200) {
                bioInput.value = bioInput.value.substring(0, 200);
                charCount.textContent = '200/200';
            }
        };

        bioInput.addEventListener('input', updateCharCount);
        updateCharCount(); // Initial count
    }

    // Profile picture upload handling
    if (pictureInput && profilePicture) {
        pictureInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            // Validate file type and size
            if (!file.type.startsWith('image/')) {
                showToast('Please select an image file', 'error');
                return;
            }

            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                showToast('Image size should be less than 5MB', 'error');
                return;
            }

            const reader = new FileReader();
            reader.onload = function(e) {
                profilePicture.src = e.target.result;
                showToast('Profile picture updated (preview only)', 'info');
            };
            reader.readAsDataURL(file);
        });
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

    if (toggleCurrentPassword && currentPasswordInput) {
        toggleCurrentPassword.addEventListener('click', () => 
            togglePasswordVisibility(currentPasswordInput, toggleCurrentPassword));
    }
    
    if (toggleNewPassword && newPasswordInput) {
        toggleNewPassword.addEventListener('click', () => 
            togglePasswordVisibility(newPasswordInput, toggleNewPassword));
    }

    // Form submission handling
    if (profileForm) {
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            let isValid = true;
            
            // Validate all fields
            if (nameInput) {
                isValid = validateField(nameInput, validateName, true) && isValid;
            }
            if (emailInput) {
                isValid = validateField(emailInput, validateEmail, true) && isValid;
            }
            if (phoneInput) {
                isValid = validateField(phoneInput, validatePhone) && isValid;
            }
            if (locationInput) {
                isValid = validateField(locationInput, validateLocation) && isValid;
            }
            if (bioInput) {
                isValid = validateField(bioInput, validateBio) && isValid;
            }
            
            // Password validation
            if (newPasswordInput && newPasswordInput.value.trim() !== '' && currentPasswordInput) {
                isValid = validateField(currentPasswordInput, validatePassword, true) && isValid;
                isValid = validateField(newPasswordInput, validatePassword) && isValid;
            }
           
            // If validation fails, stop form submission
            if (!isValid) {
                showToast('Please fix the errors in the form', 'error');
                return;
            }

            const submitButton = profileForm.querySelector('button[type="submit"]');
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.innerHTML = '<div class="spinner"></div> Updating...';
                submitButton.querySelector('.spinner').style.display = 'block';
            }

            try {
                // Prepare form data
                const formData = {
                    name: nameInput ? nameInput.value.trim() : '',
                    phone: phoneInput ? phoneInput.value.trim() : '',
                    location: locationInput ? locationInput.value.trim() : '',
                    bio: bioInput ? bioInput.value.trim() : '',
                };

                // Add password fields if new password is provided
                if (newPasswordInput && newPasswordInput.value.trim() !== '') {
                    formData.currentPassword = currentPasswordInput ? currentPasswordInput.value : '';
                    formData.newPassword = newPasswordInput.value;
                }

                // For production: Real API call
                /*
                const response = await fetch('/api/auth/update-profile', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(formData)
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Failed to update profile');
                }

                // Update stored user data
                const updatedUser = {
                    ...user,
                    name: formData.name,
                    phone: formData.phone,
                    location: formData.location,
                    bio: formData.bio
                };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                */

                // For demo/testing: Simulate successful update
                console.log('Profile update data:', formData);
                
                // Update local storage for demo
                const updatedUser = {
                    ...user,
                    name: formData.name,
                    phone: formData.phone,
                    location: formData.location,
                    bio: formData.bio
                };
                
                try {
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                    // Also update session storage if it exists
                    if (sessionStorage.getItem('user')) {
                        sessionStorage.setItem('user', JSON.stringify(updatedUser));
                    }
                } catch (error) {
                    console.error('Error saving user data:', error);
                }

                showToast('Profile updated successfully!', 'success');

                // Clear password fields
                if (currentPasswordInput) currentPasswordInput.value = '';
                if (newPasswordInput) newPasswordInput.value = '';

                // Redirect after delay
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);

            } catch (error) {
                console.error('Profile update error:', error);
                showToast(error.message || 'An error occurred while updating profile', 'error');
            } finally {
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.innerHTML = '<i class="fas fa-save"></i><span class="btn-text">Save Changes</span>';
                    const spinner = submitButton.querySelector('.spinner');
                    if (spinner) spinner.style.display = 'none';
                }
            }
        });
    }

    // Simple and working toast notification function
    function showToast(message, type = 'success') {
        console.log('showToast called with:', message, type); // Debug log
        
        // Remove existing toasts
        const existingToasts = document.querySelectorAll('.toast');
        existingToasts.forEach(toast => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        });

        // Create main toast element
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        // Create message element
        const messageElement = document.createElement('span');
        messageElement.className = 'toast-message';
        messageElement.textContent = message;
        
        // Create close button
        const closeButton = document.createElement('button');
        closeButton.className = 'toast-close';
        closeButton.innerHTML = '×';
        closeButton.setAttribute('aria-label', 'Close notification');
        
        // Close button functionality
        closeButton.addEventListener('click', function() {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        });
        
        // Assemble toast
        toast.appendChild(messageElement);
        toast.appendChild(closeButton);
        
        // Add to page
        document.body.appendChild(toast);
        
        console.log('Toast added to DOM'); // Debug log
        
        // Show toast with animation
        setTimeout(() => {
            toast.classList.add('show');
            console.log('Toast show class added'); // Debug log
        }, 50);
        
        // Auto-remove after 4 seconds
        setTimeout(() => {
            if (toast.classList.contains('show')) {
                toast.classList.remove('show');
                setTimeout(() => {
                    if (toast.parentNode) {
                        toast.parentNode.removeChild(toast);
                    }
                }, 300);
            }
        }, 4000);
    }

    // Make showToast globally available
    window.showToast = showToast;

    // Back button functionality (additional to HTML href)
    const backButton = document.querySelector('.back-button');
    if (backButton) {
        backButton.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Check if there's history to go back to
            if (document.referrer && document.referrer.includes(window.location.origin)) {
                window.history.back();
            } else {
                window.location.href = 'index.html';
            }
        });
    }

    // Initialize user menu with current user data
    if (window.showUserMenu && user.name) {
        window.showUserMenu({
            name: user.name,
            email: user.email
        });
    }
});