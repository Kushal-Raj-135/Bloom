import express from 'express';
import { getAQIData, getAQIRecommendations } from '../controllers/aqiController.js';

const router = express.Router();


// Get AQI data for a location
router.get('/data', getAQIData);

// Get AQI-based recommendations
router.get('/recommendations', getAQIRecommendations);


export default router;
