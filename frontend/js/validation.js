// validation.js
function validateName(name) {
  if (!name || name.trim() === "") {
    return {
      valid: false,
      message: "Name is required",
    };
  }
  if (name.trim().length < 2) {
    return {
      valid: false,
      message: "Name should be at least 2 characters long",
    };
  }
  return { valid: true };
}

function validateEmail(email) {
  if (!email || email.trim() === "") {
    return {
      valid: false,
      message: "Email is required",
    };
  }

  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  if (!emailRegex.test(email)) {
    return {
      valid: false,
      message: "Please enter a valid email address",
    };
  }

  return { valid: true };
}

function validatePhone(phone) {
  if (!phone || phone.trim() === "") {
    return { valid: true };
  }

  const phoneRegex = /^(\+\d{1,3}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;
  if (!phoneRegex.test(phone)) {
    return {
      valid: false,
      message: "Please enter a valid phone number (e.g., +1 123-456-7890)",
    };
  }

  return { valid: true };
}

function validateLocation(location) {
  if (!location || location.trim() === "") {
    return { valid: true };
  }

  if (location.trim().length < 3) {
    return {
      valid: false,
      message: "Location should be at least 3 characters long",
    };
  }

  return { valid: true };
}

function validateBio(bio) {
  if (!bio || bio.trim() === "") {
    return { valid: true };
  }

  if (bio.trim().length > 200) {
    return {
      valid: false,
      message: "Bio should not exceed 200 characters",
    };
  }

  return { valid: true };
}

function validatePassword(password, isRequired = false) {
  if (!password || password.trim() === "") {
    if (isRequired) {
      return {
        valid: false,
        message: "Password is required",
      };
    }
    return { valid: true };
  }

  if (password.length < 8) {
    return {
      valid: false,
      message: "Password should be at least 8 characters long",
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
      message:
        "Password should include at least 3 of the following: lowercase letters, uppercase letters, numbers, special characters",
    };
  }

  return { valid: true };
}

// Function to validate password confirmation
function validatePasswordMatch(password, confirmPassword) {
  if (!confirmPassword || confirmPassword.trim() === "") {
    return {
      valid: false,
      message: "Please confirm your password",
    };
  }

  if (password !== confirmPassword) {
    return {
      valid: false,
      message: "Passwords do not match",
    };
  }

  return { valid: true };
}

// Function to show error message
function showError(inputElement, errorMessage) {
  if (!inputElement) return;

  const errorElement = document.getElementById(`${inputElement.id}-error`);
  if (errorElement) {
    errorElement.textContent = errorMessage;
    errorElement.style.display = "block";

    inputElement.classList.add("invalid");
    inputElement.classList.remove("valid");
  }
}

// Function to clear error message
function clearError(inputElement) {
  if (!inputElement) return;

  const errorElement = document.getElementById(`${inputElement.id}-error`);
  if (errorElement) {
    errorElement.textContent = "";
    errorElement.style.display = "none";

    inputElement.classList.add("valid");
    inputElement.classList.remove("invalid");
  }
}

function validateField(inputElement, validationFunction, isRequired = false) {
  if (!inputElement) return false;

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

// Simple toast notification
function showToast(message, type = "success") {
  // Create toast element
  const toast = document.createElement("div");
  toast.textContent = message;

  // Apply inline styles directly
  toast.style.position = "fixed";
  toast.style.top = "20px";
  toast.style.right = "20px";
  toast.style.padding = "12px 24px";
  toast.style.borderRadius = "4px";
  toast.style.color = "white";
  toast.style.fontSize = "14px";
  toast.style.maxWidth = "300px";
  toast.style.zIndex = "9999";
  toast.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";

  // Set color based on type
  if (type === "success") {
    toast.style.backgroundColor = "#28a745";
  } else if (type === "error") {
    toast.style.backgroundColor = "#dc3545";
  } else if (type === "info") {
    toast.style.backgroundColor = "#17a2b8";
  }

  // Add to document
  document.body.appendChild(toast);

  // Remove after 3 seconds
  setTimeout(() => {
    document.body.removeChild(toast);
  }, 3000);
}
