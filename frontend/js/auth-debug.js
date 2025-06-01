// Test script to debug authentication issues
document.addEventListener("DOMContentLoaded", () => {
  console.log("=== AUTHENTICATION DEBUG TEST ===");

  // Test 1: Check localStorage content
  function testLocalStorage() {
    console.log("\n1. LocalStorage Test:");
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    console.log("Token:", token);
    console.log("User string:", userStr);

    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        console.log("Parsed user:", user);
      } catch (error) {
        console.error("Error parsing user:", error);
      }
    }
  }

  // Test 2: Check API connectivity
  async function testAPIConnectivity() {
    console.log("\n2. API Connectivity Test:");
    try {
      const response = await fetch("http://localhost:3000/api/auth/me", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      console.log("API Response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("API Response data:", data);
      } else {
        const errorText = await response.text();
        console.log("API Error response:", errorText);
      }
    } catch (error) {
      console.error("API connectivity error:", error);
    }
  }

  // Test 3: Check navbar elements
  function testNavbarElements() {
    console.log("\n3. Navbar Elements Test:");
    const nav = document.querySelector("nav ul");
    console.log("Navigation element found:", !!nav);

    if (nav) {
      console.log("Navigation children count:", nav.children.length);
      Array.from(nav.children).forEach((child, index) => {
        console.log(`Child ${index}:`, child.innerHTML);
      });
    }
  }

  // Test 4: Check if updateUIForLoginStatus function exists
  function testUpdateFunction() {
    console.log("\n4. Update Function Test:");
    console.log(
      "updateUIForLoginStatus exists:",
      typeof window.updateUIForLoginStatus
    );

    if (typeof window.updateUIForLoginStatus === "function") {
      console.log("Calling updateUIForLoginStatus...");
      window.updateUIForLoginStatus();
    }
  }

  // Test 5: Try manual login
  async function testManualLogin() {
    console.log("\n5. Manual Login Test:");

    // Create a test user
    const testUser = {
      id: "test-123",
      name: "Test User",
      email: "test@example.com",
      phone: "123-456-7890",
      location: "Test Location",
    };

    localStorage.setItem("token", "test-token-123");
    localStorage.setItem("user", JSON.stringify(testUser));

    console.log("Test user and token set");

    // Try to update UI
    if (typeof window.updateUIForLoginStatus === "function") {
      window.updateUIForLoginStatus();
    }
  }

  // Run all tests
  function runAllTests() {
    testLocalStorage();
    testAPIConnectivity();
    testNavbarElements();
    testUpdateFunction();

    // Add buttons for manual testing
    const testContainer = document.createElement("div");
    testContainer.style.position = "fixed";
    testContainer.style.bottom = "10px";
    testContainer.style.right = "10px";
    testContainer.style.zIndex = "9999";
    testContainer.style.background = "white";
    testContainer.style.border = "1px solid #ccc";
    testContainer.style.padding = "10px";
    testContainer.style.borderRadius = "5px";

    testContainer.innerHTML = `
            <h4>Auth Debug</h4>
            <button onclick="window.authDebug.clearAuth()">Clear Auth</button>
            <button onclick="window.authDebug.setTestUser()">Set Test User</button>
            <button onclick="window.authDebug.updateUI()">Update UI</button>
            <button onclick="window.authDebug.checkStatus()">Check Status</button>
        `;

    document.body.appendChild(testContainer);
  }

  // Global debug functions
  window.authDebug = {
    clearAuth: () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      console.log("Auth cleared");
      if (typeof window.updateUIForLoginStatus === "function") {
        window.updateUIForLoginStatus();
      }
    },

    setTestUser: () => {
      testManualLogin();
    },

    updateUI: () => {
      if (typeof window.updateUIForLoginStatus === "function") {
        window.updateUIForLoginStatus();
      } else {
        console.error("updateUIForLoginStatus function not found");
      }
    },

    checkStatus: () => {
      testLocalStorage();
      testNavbarElements();
    },
  };

  // Run tests after a short delay to ensure all scripts are loaded
  setTimeout(runAllTests, 1000);
});
