// Crop rotation service - Secure client-side service that doesn't expose API keys
const API_BASE_URL = '/api';

/**
 * Fetch crop rotation recommendations from the server
 * @param {Object} formData - Object containing previous crop, soil type, region data
 * @returns {Promise} - Promise containing recommendations
 */
export const fetchCropRotationRecommendations = async (formData) => {
    try {
        // Call our backend API endpoint
        const response = await fetch(`${API_BASE_URL}/crop/rotation/recommendations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': localStorage.getItem('apiKey') || ''
            },
            body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server error: ${response.status} - ${errorText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error fetching crop rotation recommendations:', error);
        throw error;
    }
};

/**
 * Save a crop rotation plan
 * @param {Object} planData - The plan data to save
 * @returns {Promise} - Promise with save result
 */
export const saveCropRotationPlan = async (planData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/crop/rotation/save`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'X-API-Key': localStorage.getItem('apiKey') || ''
            },
            body: JSON.stringify(planData)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server error: ${response.status} - ${errorText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error saving crop rotation plan:', error);
        throw error;
    }
};

export default {
    fetchCropRotationRecommendations,
    saveCropRotationPlan
};
