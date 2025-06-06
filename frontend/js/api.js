const API_BASE_URL = "http://localhost:3000/api";

// Helper function to get auth token
const getAuthToken = () => localStorage.getItem("token");

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    let errorMessage = "An error occurred";
    try {
      const error = await response.json();
      errorMessage = error.error || error.message || errorMessage;
    } catch (parseError) {
      errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }
  return response.json();
};

// API functions
const api = {
  // Authentication
  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(response);
  },

  register: async (name, email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    return handleResponse(response);
  },

  // Crop Recommendations
  getRecommendations: async (formData) => {
    const response = await fetch(`${API_BASE_URL}/crops/recommendations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(formData),
    });
    return handleResponse(response);
  },
  // User Profile
  getProfile: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return handleResponse(response);
  },

  updateProfile: async (data) => {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // Search History
  getSearchHistory: async () => {
    const response = await fetch(`${API_BASE_URL}/search-history`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return handleResponse(response);
  },

  // Get AQI recommendations (mock logic)
  getAQIRecommendations: async (aqiValue) => {
    return {
      status:
        aqiValue <= 50
          ? "Good"
          : aqiValue <= 100
            ? "Moderate"
            : aqiValue <= 150
              ? "Unhealthy for Sensitive Groups"
              : aqiValue <= 200
                ? "Unhealthy"
                : "Very Unhealthy",
      recommendations: [
        "Consider using dust reduction techniques",
        "Monitor air quality regularly",
        "Plan activities based on AQI levels",
      ],
    };
  },

  // Fetch real AQI data
  getAQIData: async () => {
    const response = await fetch(`${API_BASE_URL}/aqi`);
    return handleResponse(response);
  },

  // Get weather data by coordinates
  getWeatherByCoords: async (lat, lon) => {
    const response = await fetch(
      `${API_BASE_URL}/weather/current?lat=${lat}&lon=${lon}`
    );
    return handleResponse(response);
  },

  // Get weather forecast data by location name
  getWeatherForecast: async (location, days = 5) => {
    const response = await fetch(
      `${API_BASE_URL}/weather/forecast?city=${encodeURIComponent(location)}&days=${days}`
    );
    return handleResponse(response);
  },

  // Get AQI data by coordinates
  getAQIByCoords: async (lat, lon) => {
    const response = await fetch(
      `${API_BASE_URL}/aqi/current?lat=${lat}&lon=${lon}`
    );
    return handleResponse(response);
  },

  // Get location name from coordinates
  getLocationName: async (lat, lon) => {
    const response = await fetch(
      `${API_BASE_URL}/weather/location?lat=${lat}&lon=${lon}`
    );
    return handleResponse(response);
  },
};

window.api = api;
