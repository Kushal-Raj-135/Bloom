// API service for backend communication
const API_BASE_URL = 'http://localhost:3000/api';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('token') || localStorage.getItem('auth-token');
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || error.error || 'An error occurred');
  }
  return response.json();
};

// Helper function to make authenticated requests
const makeRequest = async (url, options = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers
  });

  return handleResponse(response);
};

export const apiService = {
  // Authentication
  login: async (email, password) => {
    return makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },

  register: async (name, email, password) => {
    return makeRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    });
  },

  forgotPassword: async (email) => {
    return makeRequest('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  },

  resetPassword: async (token, password) => {
    return makeRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password })
    });
  },

  // Profile
  getProfile: async () => {
    return makeRequest('/auth/profile');
  },

  updateProfile: async (profileData) => {
    return makeRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  },

  // Crop Rotation
  getCropRecommendations: async (formData) => {
    return makeRequest('/crop/rotation/recommendations', {
      method: 'POST',
      body: JSON.stringify(formData)
    });
  },

  saveCropPlan: async (planData) => {
    return makeRequest('/crop/rotation/save', {
      method: 'POST',
      body: JSON.stringify(planData)
    });
  },

  // AQI Data
  getAQIData: async (lat, lon) => {
    const params = new URLSearchParams();
    if (lat && lon) {
      params.append('lat', lat);
      params.append('lon', lon);
    }
    return makeRequest(`/aqi/data?${params.toString()}`);
  },

  getAQIRecommendations: async (aqi) => {
    const params = new URLSearchParams();
    if (aqi) {
      params.append('aqi', aqi);
    }
    return makeRequest(`/aqi/recommendations?${params.toString()}`);
  },

  // Weather Data
  getWeatherData: async (lat, lon) => {
    const params = new URLSearchParams();
    if (lat && lon) {
      params.append('lat', lat);
      params.append('lon', lon);
    }
    return makeRequest(`/weather?${params.toString()}`);
  },

  // AI Recommendations (for AgriRevive and AgriSenseX)
  getAIRecommendations: async (messages, model = 'llama3-8b-8192') => {
    return makeRequest('/ai/recommendations', {
      method: 'POST',
      body: JSON.stringify({ messages, model })
    });
  },

  // Geocoding
  geocode: async (address) => {
    const params = new URLSearchParams({ address });
    return makeRequest(`/geocoding?${params.toString()}`);
  }
};

export default apiService;
