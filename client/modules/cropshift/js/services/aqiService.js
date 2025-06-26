// AQI Service - Secure client-side service that doesn't expose API keys
const API_BASE_URL = '/api';

/**
 * Fetch AQI data from the server
 * @param {Object} coordinates - Object containing lat and lon
 * @returns {Promise} - Promise containing AQI and weather data
 */
export const fetchAQIData = async (coordinates = {}) => {
    try {
        let url = `${API_BASE_URL}/aqi/data`;
        
        // Add coordinates if provided
        if (coordinates.lat && coordinates.lon) {
            url += `?lat=${coordinates.lat}&lon=${coordinates.lon}`;
        }
        
        const response = await fetch(url, {
            headers: {
                'X-API-Key': localStorage.getItem('apiKey') || ''
            }
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to fetch AQI data');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error fetching AQI data:', error);
        throw error;
    }
};

/**
 * Get recommendations based on AQI value
 * @param {Number} aqiValue - AQI value
 * @returns {Promise} - Promise containing recommendations
 */
export const getRecommendations = async (aqiValue) => {
    try {
        const response = await fetch(`${API_BASE_URL}/aqi/recommendations?aqi=${aqiValue}`, {
            headers: {
                'X-API-Key': localStorage.getItem('apiKey') || ''
            }
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to get recommendations');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error getting recommendations:', error);
        throw error;
    }
};

export default {
    fetchAQIData,
    getRecommendations
};
