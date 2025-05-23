const API_BASE_URL = 'http://localhost:3000/api';

// Helper function to get auth token
const getAuthToken = () => localStorage.getItem('token');

// Helper function to handle API responses
const handleResponse = async (response) => {
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'An error occurred');
    }
    return response.json();
};

// API functions
export const api = {
    // Authentication
    login: async (email, password) => {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        return handleResponse(response);
    },

    register: async (name, email, password) => {
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });
        return handleResponse(response);
    },

    // Crop Recommendations
    getRecommendations: async (formData) => {
        const response = await fetch(`${API_BASE_URL}/recommendations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify(formData)
        });
        return handleResponse(response);
    },

    // User Profile
    getProfile: async () => {
        const response = await fetch(`${API_BASE_URL}/profile`, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        return handleResponse(response);
    },

    updateProfile: async (data) => {
        const response = await fetch(`${API_BASE_URL}/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify(data)
        });
        return handleResponse(response);
    },

    // Search History
    getSearchHistory: async () => {
        const response = await fetch(`${API_BASE_URL}/search-history`, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        return handleResponse(response);
    },

    // Get AQI recommendations (mock logic)
    getAQIRecommendations: async (aqiValue) => {
        return {
            status: aqiValue <= 50 ? "Good" : 
                    aqiValue <= 100 ? "Moderate" : 
                    aqiValue <= 150 ? "Unhealthy for Sensitive Groups" : 
                    aqiValue <= 200 ? "Unhealthy" : "Very Unhealthy",
            recommendations: [
                "Consider using dust reduction techniques",
                "Monitor air quality regularly",
                "Plan activities based on AQI levels"
            ]
        };
    },

    // Fetch real AQI data
    getAQIData: async () => {
        const response = await fetch(`${API_BASE_URL}/aqi`);
        return handleResponse(response);
    }
};
