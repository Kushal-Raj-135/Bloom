import fetch from 'node-fetch';
import { apiConfig } from '../config/config.js';

/**
 * Get AQI data from WAQI API
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getAQIData = async (req, res) => {
    try {
        const { lat, lon } = req.query;
        
        // Use coordinates if provided, otherwise default to a general location
        const latitude = lat || '28.6139'; // Default to Delhi
        const longitude = lon || '77.2090';
        
        const waqiResponse = await fetch(
            `https://api.waqi.info/feed/geo:${latitude};${longitude}/?token=${apiConfig.waqiApiKey}`
        );
        
        if (!waqiResponse.ok) {
            throw new Error('Failed to fetch AQI data');
        }
        
        const waqiData = await waqiResponse.json();
        
        // Get weather data as well
        const weatherResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiConfig.openWeatherApiKey}`
        );
        
        if (!weatherResponse.ok) {
            throw new Error('Failed to fetch weather data');
        }
        
        const weatherData = await weatherResponse.json();
        
        // Combine the data
        const combinedData = {
            aqi: waqiData.data.aqi,
            location: waqiData.data.city.name,
            pollutants: {
                pm25: waqiData.data.iaqi.pm25?.v || 'N/A',
                pm10: waqiData.data.iaqi.pm10?.v || 'N/A',
                o3: waqiData.data.iaqi.o3?.v || 'N/A',
                no2: waqiData.data.iaqi.no2?.v || 'N/A',
            },
            time: waqiData.data.time.iso,
            weather: {
                temperature: weatherData.main.temp,
                humidity: weatherData.main.humidity,
                windSpeed: weatherData.wind.speed
            }
        };
        
        res.json(combinedData);
    } catch (error) {
        console.error('AQI Controller Error:', error);
        res.status(500).json({ error: 'Failed to fetch AQI and weather data' });
    }
};

/**
 * Get recommendations based on AQI values
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getAQIRecommendations = async (req, res) => {
    try {
        const { aqi } = req.query;
        const aqiValue = parseInt(aqi);
        
        if (isNaN(aqiValue)) {
            return res.status(400).json({ error: 'Valid AQI value required' });
        }
        
        // Determine AQI category and recommendations
        let status, recommendations, color;
        
        if (aqiValue <= 50) {
            status = "Good";
            color = "#009966";
            recommendations = [
                "Perfect conditions for all outdoor farm activities",
                "Ideal for planting and harvesting",
                "Good time for pesticide application if needed"
            ];
        } else if (aqiValue <= 100) {
            status = "Moderate";
            color = "#ffde33";
            recommendations = [
                "Good for most farm activities, but take breaks",
                "Consider irrigating crops",
                "Good time for equipment maintenance"
            ];
        } else if (aqiValue <= 150) {
            status = "Unhealthy for Sensitive Groups";
            color = "#ff9933"; 
            recommendations = [
                "Limit prolonged outdoor activities",
                "Workers with respiratory issues should reduce exposure",
                "Focus on less strenuous tasks"
            ];
        } else if (aqiValue <= 200) {
            status = "Unhealthy";
            color = "#cc0033";
            recommendations = [
                "Minimize outdoor farm activities",
                "Use protective masks if outdoor work is necessary",
                "Consider indoor tasks and planning"
            ];
        } else {
            status = "Very Unhealthy";
            color = "#660099";
            recommendations = [
                "Avoid outdoor farm activities if possible",
                "Essential outdoor work should be brief with protection",
                "Focus on indoor planning and maintenance"
            ];
        }
        
        res.json({
            aqi: aqiValue,
            status,
            color,
            recommendations
        });
    } catch (error) {
        console.error('AQI Recommendations Error:', error);
        res.status(500).json({ error: 'Failed to generate AQI recommendations' });
    }
};

export default {
    getAQIData,
    getAQIRecommendations
};
