import { apiConfig } from '../config/config.js';
import fetch from 'node-fetch';

// Crop name mapping for localization
const cropNameMap = {
    'rice': 'Rice (Dhan)',
    'wheat': 'Wheat (Gehun)',
    'sugarcane': 'Sugarcane (Ganna)',
    'pulses': 'Pulses (Dal)',
    'cotton': 'Cotton (Kapas)',
    'groundnut': 'Groundnut (Moongfali)',
    'maize': 'Maize (Makka)',
    'sorghum': 'Sorghum (Jowar)',
    'pearl-millet': 'Pearl Millet (Bajra)',
    'chickpea': 'Chickpea (Chana)',
    'mustard': 'Mustard (Sarson)',
    'moong': 'Green Gram (Moong)',
    'soybean': 'Soybean (Soya)',
    'potato': 'Potato (Aloo)',
    'corn': 'Corn (Makka)',
    'alfalfa': 'Alfalfa (Rijka)',
    'legumes': 'Legumes (Faliyan)',
    'jowar': 'Jowar (Sorghum)',
    'cowpea': 'Cowpea (Lobia/Chawli)',
    'mung bean': 'Mung Bean (Moong)',
    'pigeonpea': 'Pigeonpea (Arhar/Tur Dal)',
    'arhar': 'Pigeonpea (Arhar/Tur Dal)',
    'tur': 'Pigeonpea (Arhar/Tur Dal)',
    'lobia': 'Cowpea (Lobia/Chawli)',
    'chawli': 'Cowpea (Lobia/Chawli)',
    'tur dal': 'Pigeonpea (Arhar/Tur Dal)'
};

/**
 * Get localized crop name
 * @param {string} cropName - The English crop name
 * @returns {string} - The localized crop name
 */
export function getLocalCropName(cropName) {
    return cropNameMap[cropName.toLowerCase()] || cropName;
}

/**
 * Get crop rotation recommendations from Groq API
 * @param {Object} cropInfo - Crop information
 * @returns {Promise<Object>} - Recommendations from AI
 */
export async function getGroqRecommendations(cropInfo) {
    const prompt = `As an agricultural expert in India, provide a detailed 3-year crop rotation plan for the following farm, using local crop names that farmers will understand. IMPORTANT: Do NOT recommend the same crop as the current crop in the rotation plan. Each year should have a different crop to maintain soil health and prevent pest cycles.

    Current Farm Details:
    - Current Crop: ${getLocalCropName(cropInfo.previousCrop)}
    - Soil Type: ${cropInfo.soilType}
    - Region/Climate: ${cropInfo.region}
    - Field Size: ${cropInfo.fieldSize || 'Not specified'} acres
    - Irrigation Available: ${cropInfo.irrigation || 'Not specified'}

    Your response should include:
    1. A 3-year rotation plan with specific crops for each season (Kharif/Rabi)
    2. Brief explanation of why these crops work well in rotation (nitrogen fixing, pest cycles, market value, etc.)
    3. Key considerations for each transition between crops
    4. Expected benefits (soil health improvement, pest reduction, yield increase)

    Format the response with clear headings and bullet points for easy readability.`;

    try {
        const response = await fetch(apiConfig.groqApiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiConfig.groqApiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'llama3-8b-8192',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.5,
                max_tokens: 1200,
            }),
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('Error getting Groq recommendations:', error);
        throw error;
    }
}

export default {
    getLocalCropName,
    getGroqRecommendations
};
