// validation.js
function validateName(name) {
    if (!name || name.trim() === '') {
        return {
            valid: false,
            message: 'Name is required'
        };
    }
    if (name.trim().length < 2) {
        return {
            valid: false,
            message: 'Name should be at least 2 characters long'
        };
    }
    return { valid: true };
}

function validateEmail(email) {
    if (!email || email.trim() === '') {
        return {
            valid: false,
            message: 'Email is required'
        };
    }
    
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    if (!emailRegex.test(email)) {
        return {
            valid: false,
            message: 'Please enter a valid email address'
        };
    }
    
    return { valid: true };
}

function validatePhone(phone) {
    if (!phone || phone.trim() === '') {
        return { valid: true }; // Phone is optional
    }
    
    const phoneRegex = /^(\+\d{1,3}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;
    if (!phoneRegex.test(phone)) {
        return {
            valid: false,
            message: 'Please enter a valid phone number (e.g., +1 123-456-7890)'
        };
    }
    
    return { valid: true };
}

function validateLocation(location) {
    if (!location || location.trim() === '') {
        return { valid: true }; // Location is optional
    }
    
    if (location.trim().length < 3) {
        return {
            valid: false,
            message: 'Location should be at least 3 characters long'
        };
    }
    
    return { valid: true };
}

function validateBio(bio) {
    if (!bio || bio.trim() === '') {
        return { valid: true }; // Bio is optional
    }
    
    if (bio.trim().length > 200) {
        return {
            valid: false,
            message: 'Bio should not exceed 200 characters'
        };
    }
    
    return { valid: true };
}

function validatePassword(password, isRequired = false) {
    if (!password || password.trim() === '') {
        if (isRequired) {
            return {
                valid: false,
                message: 'Password is required'
            };
        }
        return { valid: true }; // Password is optional for profile update
    }
    
    if (password.length < 8) {
        return {
            valid: false,
            message: 'Password should be at least 8 characters long'
        };
    }
    
    let strength = 0;
    if (password.match(/[a-z]/)) strength++;
    if (password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;
    
    if (strength < 3) {
        return {
            valid: false,
            message: 'Password should include at least 3 of the following: lowercase letters, uppercase letters, numbers, special characters'
        };
    }
    
    return { valid: true };
}

// Function to show error message
function showError(inputElement, errorMessage) {
    const errorElement = document.getElementById(`${inputElement.id}-error`);
    if (errorElement) {
        errorElement.textContent = errorMessage;
        errorElement.style.display = 'block';
        
        // Add invalid class to input
        inputElement.classList.add('invalid');
        inputElement.classList.remove('valid');
    }
}

// Function to clear error message
function clearError(inputElement) {
    const errorElement = document.getElementById(`${inputElement.id}-error`);
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.style.display = 'none';
        
        // Add valid class to input
        inputElement.classList.add('valid');
        inputElement.classList.remove('invalid');
    }
}

// Function to validate a form field
function validateField(inputElement, validationFunction, isRequired = false) {
    const value = inputElement.value.trim();
    const validation = validationFunction(value, isRequired);
    
    if (!validation.valid) {
        showError(inputElement, validation.message);
        return false;
    } else {
        clearError(inputElement);
        return true;
    }
}