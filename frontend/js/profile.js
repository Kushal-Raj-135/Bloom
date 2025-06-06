document.addEventListener("DOMContentLoaded", async () => {
  const profileForm = document.getElementById("profile-form");
  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const phoneInput = document.getElementById("phone");
  const locationInput = document.getElementById("location");
  const bioInput = document.getElementById("bio");
  const charCount = document.querySelector(".char-count");
  const currentPasswordInput = document.getElementById("current-password");
  const newPasswordInput = document.getElementById("new-password");
  const toggleCurrentPassword = document.getElementById(
    "toggle-current-password"
  );
  const toggleNewPassword = document.getElementById("toggle-new-password");
  const profilePicture = document.getElementById("profile-picture");
  const pictureInput = document.getElementById("picture-input");

  if (nameInput) {
    nameInput.addEventListener("blur", () =>
      validateField(nameInput, validateName, true)
    );
    nameInput.addEventListener("input", () =>
      validateField(nameInput, validateName, true)
    );
  }

  if (emailInput) {
    emailInput.addEventListener("blur", () =>
      validateField(emailInput, validateEmail, true)
    );
    emailInput.addEventListener("input", () =>
      validateField(emailInput, validateEmail, true)
    );
  }

  if (phoneInput) {
    phoneInput.addEventListener("blur", () =>
      validateField(phoneInput, validatePhone)
    );
    phoneInput.addEventListener("input", () =>
      validateField(phoneInput, validatePhone)
    );
  }

  if (locationInput) {
    locationInput.addEventListener("blur", () =>
      validateField(locationInput, validateLocation)
    );
    locationInput.addEventListener("input", () =>
      validateField(locationInput, validateLocation)
    );
  }

  if (bioInput) {
    bioInput.addEventListener("blur", () =>
      validateField(bioInput, validateBio)
    );
    bioInput.addEventListener("input", () =>
      validateField(bioInput, validateBio)
    );
  }

  if (newPasswordInput) {
    newPasswordInput.addEventListener("blur", () =>
      validateField(newPasswordInput, validatePassword)
    );
    newPasswordInput.addEventListener("input", () =>
      validateField(newPasswordInput, validatePassword)
    );
  }

  if (currentPasswordInput) {
    currentPasswordInput.addEventListener("blur", () => {
      if (newPasswordInput && newPasswordInput.value.trim() !== "") {
        validateField(currentPasswordInput, validatePassword, true);
      }
    });
  }
  let token, user;
  try {
    token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    // Fetch fresh user data from backend
    try {
      const response = await api.getProfile();
      user = response.data.user;

      // Update localStorage with fresh data
      localStorage.setItem("user", JSON.stringify(user));
    } catch (error) {
      console.error("Error fetching user profile:", error);

      // If there's an auth error, redirect to login
      if (error.message.includes("token") || error.message.includes("401")) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return;
      }

      // Fallback to localStorage if API fails
      user = JSON.parse(localStorage.getItem("user") || "{}");
    }
  } catch (error) {
    console.error("Error reading user data:", error);
    window.location.href = "/login";
    return;
  }

  // // For local testing without login
  // if (!token || !user || Object.keys(user).length === 0) {
  //     console.log('No user logged in, using demo data for testing');
  //     // Create dummy user for testing
  //     user = {
  //         name: 'Demo User',
  //         email: 'test@example.com',
  //         phone: '',
  //         location: '',
  //         bio: ''
  //     };
  // }
  // Populate form with user data
  if (nameInput) nameInput.value = user.name || "";
  if (emailInput) {
    emailInput.value = user.email || "";
    emailInput.readOnly = true;
  }
  if (phoneInput) phoneInput.value = user.profile?.phone || "";
  if (locationInput)
    locationInput.value = user.profile?.location?.address || "";
  if (bioInput) bioInput.value = user.profile?.bio || "";
  if (profilePicture && user.profilePicture) {
    profilePicture.src = user.profilePicture;
  }

  // Update character count for bio
  if (bioInput && charCount) {
    bioInput.addEventListener("input", () => {
      const count = bioInput.value.length;
      charCount.textContent = `${count}/200`;
      if (count > 200) {
        bioInput.value = bioInput.value.substring(0, 200);
      }
    });

    charCount.textContent = `${bioInput.value.length}/200`;
  }

  if (pictureInput && profilePicture) {
    pictureInput.addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      // Validate file type and size
      if (!file.type.startsWith("image/")) {
        showToast("Please select an image file", "error");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        showToast("Image size should be less than 5MB", "error");
        return;
      }

      const reader = new FileReader();
      reader.onload = function (e) {
        profilePicture.src = e.target.result;
        showToast(
          "Profile picture updated for preview (not saved to server)",
          "success"
        );
      };
      reader.readAsDataURL(file);
    });
  }

  // Toggle password visibility
  function togglePasswordVisibility(inputElement, toggleButton) {
    if (!inputElement || !toggleButton) return;

    const type = inputElement.type === "password" ? "text" : "password";
    inputElement.type = type;
    toggleButton.innerHTML =
      type === "password"
        ? '<i class="fas fa-eye"></i>'
        : '<i class="fas fa-eye-slash"></i>';
  }

  if (toggleCurrentPassword && currentPasswordInput) {
    toggleCurrentPassword.addEventListener("click", () =>
      togglePasswordVisibility(currentPasswordInput, toggleCurrentPassword)
    );
  }

  if (toggleNewPassword && newPasswordInput) {
    toggleNewPassword.addEventListener("click", () =>
      togglePasswordVisibility(newPasswordInput, toggleNewPassword)
    );
  }

  if (profileForm) {
    profileForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      let isValid = true;

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
      if (
        newPasswordInput &&
        newPasswordInput.value.trim() !== "" &&
        currentPasswordInput
      ) {
        isValid =
          validateField(currentPasswordInput, validatePassword, true) &&
          isValid;
        isValid = validateField(newPasswordInput, validatePassword) && isValid;
      }

      // If validation fails, stop form submission
      if (!isValid) {
        showToast("Please fix the errors in the form", "error");
        return;
      }

      const submitButton = profileForm.querySelector('button[type="submit"]');
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.innerHTML =
          '<i class="fas fa-spinner fa-spin"></i> Updating...';
      }

      try {
        // For local testing, simulate a successful update
        // console.log('Form is valid, would submit to server in production');
        // console.log({
        //     name: nameInput ? nameInput.value : '',
        //     phone: phoneInput ? phoneInput.value : '',
        //     location: locationInput ? locationInput.value : '',
        //     bio: bioInput ? bioInput.value : '',
        //     currentPassword: currentPasswordInput ? currentPasswordInput.value : '',
        //     newPassword: (newPasswordInput && newPasswordInput.value) || undefined
        // });        // Create update data object based on backend API structure
        const updateData = {
          name: nameInput ? nameInput.value : undefined,
          "profile.phone": phoneInput ? phoneInput.value : undefined,
          "profile.location.address": locationInput
            ? locationInput.value
            : undefined,
          "profile.bio": bioInput ? bioInput.value : undefined,
        };

        // Add password fields if they are provided
        if (currentPasswordInput && currentPasswordInput.value.trim()) {
          updateData.currentPassword = currentPasswordInput.value;
        }
        if (newPasswordInput && newPasswordInput.value.trim()) {
          updateData.newPassword = newPasswordInput.value;
        }

        // Remove undefined values
        Object.keys(updateData).forEach((key) => {
          if (updateData[key] === undefined || updateData[key] === "") {
            delete updateData[key];
          }
        });

        // Real API call for production
        const response = await api.updateProfile(updateData);

        // Update stored user data with fresh profile data
        const freshProfile = await api.getProfile();
        localStorage.setItem("user", JSON.stringify(freshProfile.data.user));

        showToast("Profile updated successfully!", "success");

        // Redirect after a short delay
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      } catch (error) {
        showToast(
          error.message || "An error occurred while updating profile",
          "error"
        );
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.innerHTML =
            '<i class="fas fa-save"></i><span class="btn-text">Save Changes</span>';
        }
      }
    });
  }

  // Toast notification helper
  // Override toast notification for profile page
  function showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.textContent = message;

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

    if (type === "success") {
      toast.style.backgroundColor = "#28a745";
    } else if (type === "error") {
      toast.style.backgroundColor = "#dc3545";
    } else if (type === "info") {
      toast.style.backgroundColor = "#17a2b8";
    }

    document.body.appendChild(toast);

    setTimeout(() => {
      if (toast.parentNode) {
        document.body.removeChild(toast);
      }
    }, 3000);
  }
});
