document.addEventListener("DOMContentLoaded", async () => {
  const authButtons = document.querySelector(".auth-buttons");
  const userMenu = document.querySelector(".user-menu");
  const userNameSpan = document.querySelector(".user-name");
  const logoutBtn = document.querySelector(".logout-btn");

  // Check for token in URL (for Google login)
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");
  if (token) {
    // Store the token
    localStorage.setItem("token", token);

    // Fetch user data using the API helper
    try {
      const response = await api.getProfile();
      const user = response.data.user;

      localStorage.setItem("user", JSON.stringify(user));
      updateUI(user);
    } catch (error) {
      console.error("Error fetching user data:", error);

      // If there's an error, clear the token and show login
      localStorage.removeItem("token");

      // Remove any existing dropdowns and show login buttons
      const existingDropdowns = document.querySelectorAll(
        ".user-dropdown, .user-menu"
      );
      existingDropdowns.forEach((dropdown) => dropdown.remove());

      if (authButtons) {
        authButtons.style.display = "flex";
      }
      if (userMenu) {
        userMenu.style.display = "none";
      }
    }

    // Remove token from URL
    window.history.replaceState({}, document.title, window.location.pathname);
  }

  // Check login status on page load
  checkLoginStatus();

  // Handle logout click
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      handleLogout();
    });
  }
  // Check if user is logged in
  async function checkLoginStatus() {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        // Fetch fresh user data from backend
        const response = await api.getProfile();
        const user = response.data.user;

        // Update localStorage with fresh data
        localStorage.setItem("user", JSON.stringify(user));

        updateUI(user);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        // If token is invalid, clear it and show login/register
        if (error.message.includes("token") || error.message.includes("401")) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }

        // Remove any existing dropdowns and show login buttons
        const existingDropdowns = document.querySelectorAll(
          ".user-dropdown, .user-menu"
        );
        existingDropdowns.forEach((dropdown) => dropdown.remove());

        // Show login/register buttons
        if (authButtons) {
          authButtons.style.display = "flex";
        }
        if (userMenu) {
          userMenu.style.display = "none";
        }
      }
    } else {
      // Remove any existing dropdowns and show login buttons
      const existingDropdowns = document.querySelectorAll(
        ".user-dropdown, .user-menu"
      );
      existingDropdowns.forEach((dropdown) => dropdown.remove());

      // Show login/register buttons
      if (authButtons) {
        authButtons.style.display = "flex";
      }
      if (userMenu) {
        userMenu.style.display = "none";
      }
    }
  } // Update UI based on user data
  function updateUI(user) {
    // Hide auth buttons
    if (authButtons) {
      authButtons.style.display = "none";
    }

    // Hide old user menu if it exists
    if (userMenu) {
      userMenu.style.display = "none";
    }

    // Remove any existing user dropdowns and old user menus to prevent duplicates
    const existingDropdowns = document.querySelectorAll(
      ".user-dropdown, .user-menu"
    );
    existingDropdowns.forEach((dropdown) => dropdown.remove());

    // Create or update user dropdown
    const nav =
      document.querySelector("nav ul") || document.querySelector("nav");
    if (nav) {
      const userDropdown = document.createElement("li");
      userDropdown.className = "user-dropdown";
      userDropdown.innerHTML = `
        <div class="user-dropdown-toggle">
          <div class="user-avatar">
            ${
              user.profilePicture
                ? `<img src="${user.profilePicture}" alt="Profile" class="avatar-img">`
                : `<i class="fas fa-user-circle"></i>`
            }
          </div>
          <span class="user-name">${user.name || "User"}</span>
          <i class="fas fa-chevron-down"></i>
        </div>
        <div class="user-dropdown-menu">
          <a href="javascript:void(0)" onclick="showProfile()" class="dropdown-item">
            <i class="fas fa-user"></i> Profile
          </a>
          <a href="/pages/profile.html" class="dropdown-item">
            <i class="fas fa-edit"></i> Edit Profile
          </a>
          <div class="dropdown-divider"></div>
          <a href="javascript:void(0)" onclick="handleLogout()" class="dropdown-item logout">
            <i class="fas fa-sign-out-alt"></i> Logout
          </a>
        </div>
      `;

      nav.appendChild(userDropdown);
    }
  }
});

// Show profile modal
async function showProfile() {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/pages/login.html";
    return;
  }

  try {
    // Show loading state
    const loadingModal = document.createElement("div");
    loadingModal.className = "profile-modal";
    loadingModal.innerHTML = `
      <div class="profile-modal-content">
        <div class="profile-header">
          <h2>Profile</h2>
          <div class="profile-avatar">
            <i class="fas fa-spinner fa-spin"></i>
          </div>
        </div>
        <div class="profile-content">
          <p>Loading profile...</p>
        </div>
      </div>
    `;
    document.body.appendChild(loadingModal);

    // Fetch user profile from backend
    const response = await api.getProfile();
    const user = response.data.user;

    // Update localStorage with fresh data
    localStorage.setItem("user", JSON.stringify(user));

    // Remove loading modal
    loadingModal.remove();

    // Create profile modal with fresh data
    const profileModal = document.createElement("div");
    profileModal.className = "profile-modal";
    profileModal.innerHTML = `
      <div class="profile-modal-content">
        <div class="profile-header">
          <h2>Profile</h2>
          <button class="close-btn" onclick="closeProfile()">
            <i class="fas fa-times"></i>
          </button>
          <div class="profile-avatar">
            ${
              user.profilePicture
                ? `<img src="${user.profilePicture}" alt="Profile Picture" class="profile-img">`
                : `<i class="fas fa-user-circle"></i>`
            }
          </div>
        </div>
        <div class="profile-content">
          <div class="profile-info">
            <h3>Personal Information</h3>
            <div class="info-grid">
              <div class="info-item">
                <i class="fas fa-user"></i>
                <div class="info-detail">
                  <label>Name</label>
                  <p>${user.name || "Not set"}</p>
                </div>
              </div>
              <div class="info-item">
                <i class="fas fa-envelope"></i>
                <div class="info-detail">
                  <label>Email</label>
                  <p>${user.email || "Not set"}</p>
                </div>
              </div>
              <div class="info-item">
                <i class="fas fa-phone"></i>
                <div class="info-detail">
                  <label>Phone</label>
                  <p>${user.profile?.phone || "Not set"}</p>
                </div>
              </div>
              <div class="info-item">
                <i class="fas fa-location-dot"></i>
                <div class="info-detail">
                  <label>Location</label>
                  <p>${user.profile?.location?.address || "Not set"}</p>
                </div>
              </div>
              <div class="info-item">
                <i class="fas fa-info-circle"></i>
                <div class="info-detail">
                  <label>Bio</label>
                  <p>${user.profile?.bio || "Not set"}</p>
                </div>
              </div>
            </div>
          </div>
          <div class="profile-stats">
            <h3>Account Information</h3>
            <div class="info-item">
              <i class="fas fa-calendar"></i>
              <div class="info-detail">
                <label>Member Since</label>
                <p>${new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            <div class="info-item">
              <i class="fas fa-clock"></i>
              <div class="info-detail">
                <label>Last Login</label>
                <p>${user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "Not available"}</p>
              </div>
            </div>
            <div class="info-item">
              <i class="fas fa-shield-alt"></i>
              <div class="info-detail">
                <label>Email Verified</label>
                <p>${user.isEmailVerified ? "Yes" : "No"}</p>
              </div>
            </div>
          </div>
        </div>
        <div class="profile-actions">
          <a href="/pages/profile.html" class="edit-btn">
            <i class="fas fa-edit"></i> Edit Profile
          </a>
          <button class="cancel-btn" onclick="closeProfile()">
            <i class="fas fa-times"></i> Close
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(profileModal);
  } catch (error) {
    console.error("Error fetching profile:", error);

    // Remove loading modal if it exists
    const loadingModal = document.querySelector(".profile-modal");
    if (loadingModal) {
      loadingModal.remove();
    }

    // Show error message
    showToast("Failed to load profile. Please try again.", "error");

    // If token is invalid, redirect to login
    if (error.message.includes("token") || error.message.includes("401")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/pages/login.html";
    }
  }
}

// Close profile modal
function closeProfile() {
  const profileModal = document.querySelector(".profile-modal");
  if (profileModal) {
    profileModal.remove();
  }
}

// Logout function
function handleLogout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  // Show a toast message
  showToast("Logged out successfully", "success");

  // Redirect to home page after a short delay
  setTimeout(() => {
    window.location.href = "/";
  }, 1000);
}

// Show toast notification
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

  // Add to document
  document.body.appendChild(toast);

  setTimeout(() => {
    if (toast.parentNode) {
      document.body.removeChild(toast);
    }
  }, 3000);
}

// Function to handle toggle of user dropdown menu
document.addEventListener("click", function (e) {
  const userDropdownToggle = document.querySelector(".user-dropdown-toggle");
  const userDropdownMenu = document.querySelector(".user-dropdown-menu");

  if (!userDropdownToggle || !userDropdownMenu) return;

  if (userDropdownToggle.contains(e.target)) {
    // Toggle dropdown when clicking on the toggle button
    e.preventDefault();
    userDropdownMenu.classList.toggle("show");
  } else if (!userDropdownMenu.contains(e.target)) {
    // Close dropdown when clicking outside
    userDropdownMenu.classList.remove("show");
  }
});

// Make functions globally available
window.showProfile = showProfile;
window.closeProfile = closeProfile;
window.handleLogout = handleLogout;
