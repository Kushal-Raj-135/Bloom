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
    const profilePictureInput = document.getElementById('profile-picture-input');
    const strengthBar = document.querySelector('.strength-bar');
    const strengthValue = document.querySelector('.strength-value');

    // Check if user is logged in
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    if (!token || !user) {
        window.location.href = '/login';
        return;
    }

    // Populate form with user data
    nameInput.value = user.name || '';
    emailInput.value = user.email || '';
    emailInput.readOnly = true;
    phoneInput.value = user.phone || '';
    locationInput.value = user.location || '';
    bioInput.value = user.bio || '';
    if (user.profilePicture) {
        profilePicture.src = user.profilePicture;
    }

    // Update character count for bio
    bioInput.addEventListener('input', () => {
        const count = bioInput.value.length;
        charCount.textContent = `${count}/200`;
        if (count > 200) {
            bioInput.value = bioInput.value.substring(0, 200);
        }
    });

    // Handle profile picture upload
    profilePictureInput.addEventListener('change', async (e) => {
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

        // Show loading state
        profilePicture.style.opacity = '0.5';
        profilePicture.style.filter = 'blur(2px)';

        try {
            const formData = new FormData();
            formData.append('profilePicture', file);

            const response = await fetch('/api/auth/upload-profile-picture', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to upload profile picture');
            }

            // Update profile picture
            profilePicture.src = data.profilePictureUrl;
            
            // Update user data in localStorage
            const updatedUser = { ...user, profilePicture: data.profilePictureUrl };
            localStorage.setItem('user', JSON.stringify(updatedUser));

            showToast('Profile picture updated successfully!', 'success');
        } catch (error) {
            showToast(error.message, 'error');
        } finally {
            profilePicture.style.opacity = '1';
            profilePicture.style.filter = 'none';
        }
    });

    // Password strength checker
    newPasswordInput.addEventListener('input', () => {
        const password = newPasswordInput.value;
        const strength = calculatePasswordStrength(password);
        updatePasswordStrengthIndicator(strength);
    });

    function calculatePasswordStrength(password) {
        let strength = 0;
        if (password.length >= 8) strength += 1;
        if (password.match(/[a-z]/)) strength += 1;
        if (password.match(/[A-Z]/)) strength += 1;
        if (password.match(/[0-9]/)) strength += 1;
        if (password.match(/[^a-zA-Z0-9]/)) strength += 1;
        return strength;
    }

    function updatePasswordStrengthIndicator(strength) {
        const strengthTexts = ['Very Weak', 'Weak', 'Medium', 'Strong', 'Very Strong'];
        const strengthColors = ['#ff4444', '#ffbb33', '#ffeb3b', '#00C851', '#007E33'];
        const strengthPercentages = ['20%', '40%', '60%', '80%', '100%'];

        strengthValue.textContent = strengthTexts[strength - 1] || 'Very Weak';
        strengthBar.style.width = strengthPercentages[strength - 1] || '20%';
        strengthBar.style.backgroundColor = strengthColors[strength - 1] || '#ff4444';
    }

    // Toggle password visibility
    function togglePasswordVisibility(inputElement, toggleButton) {
        const type = inputElement.type === 'password' ? 'text' : 'password';
        inputElement.type = type;
        toggleButton.innerHTML = type === 'password' 
            ? '<i class="fas fa-eye"></i>' 
            : '<i class="fas fa-eye-slash"></i>';
    }

    toggleCurrentPassword.addEventListener('click', () => 
        togglePasswordVisibility(currentPasswordInput, toggleCurrentPassword));
    
    toggleNewPassword.addEventListener('click', () => 
        togglePasswordVisibility(newPasswordInput, toggleNewPassword));

    // Handle form submission
    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitButton = profileForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';

        try {
            const response = await fetch('/api/auth/update-profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: nameInput.value,
                    phone: phoneInput.value,
                    location: locationInput.value,
                    bio: bioInput.value,
                    currentPassword: currentPasswordInput.value,
                    newPassword: newPasswordInput.value || undefined,
                    notifications: {
                        updates: document.querySelector('input[name="notifications"][value="updates"]').checked,
                        newsletter: document.querySelector('input[name="notifications"][value="newsletter"]').checked
                    }
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update profile');
            }

            // Update stored user data
            const updatedUser = {
                ...user,
                name: nameInput.value,
                phone: phoneInput.value,
                location: locationInput.value,
                bio: bioInput.value
            };
            localStorage.setItem('user', JSON.stringify(updatedUser));

            showToast('Profile updated successfully!', 'success');

            // Redirect after a short delay
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);

        } catch (error) {
            showToast(error.message, 'error');
        } finally {
            submitButton.disabled = false;
            submitButton.innerHTML = 'Save Changes';
        }
    });

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