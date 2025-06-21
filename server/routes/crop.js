import express from 'express';
import { getCropRotationRecommendations, saveCropRotationPlan } from '../controllers/cropController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();


// Get crop rotation recommendations
router.post('/rotation/recommendations', getCropRotationRecommendations);

// Save crop rotation plan - requires authentication
router.post('/rotation/save', saveCropRotationPlan);

export default router;
