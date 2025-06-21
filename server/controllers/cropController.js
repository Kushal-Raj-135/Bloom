import { getGroqRecommendations } from '../utils/cropUtils.js';

/**
 * Get crop rotation recommendations
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getCropRotationRecommendations = async (req, res) => {
    try {
        const cropInfo = req.body;
        
        // Validate request body
        if (!cropInfo.previousCrop || !cropInfo.soilType || !cropInfo.region) {
            return res.status(400).json({ 
                message: 'Missing required fields: previousCrop, soilType, and region are required'
            });
        }
        
        // Get recommendations from Groq AI
        const recommendations = await getGroqRecommendations(cropInfo);
        
        res.json({ recommendations });
    } catch (error) {
        console.error('Error in crop rotation recommendations:', error);
        res.status(500).json({ message: 'Error generating crop rotation recommendations' });
    }
};

/**
 * Save crop rotation plan
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const saveCropRotationPlan = async (req, res) => {
    try {
        // This would connect to a database model to save the plan
        // For now, we'll just return success
        res.json({ message: 'Plan saved successfully', success: true });
    } catch (error) {
        console.error('Error saving crop rotation plan:', error);
        res.status(500).json({ message: 'Error saving crop rotation plan' });
    }
};

export default {
    getCropRotationRecommendations,
    saveCropRotationPlan
};
