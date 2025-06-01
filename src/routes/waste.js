/**
 * Waste Management Routes
 * Routes for agricultural waste management recommendations
 */

import express from "express";
import {
  getWasteRecommendations,
  getMockRecommendations,
} from "../controllers/wasteController.js";
import { validateWasteRequest } from "../middleware/validation.js";

const router = express.Router();

/**
 * @route   POST /api/waste/recommendations
 * @desc    Get AI-powered waste management recommendations
 * @access  Public
 */
router.post("/recommendations", validateWasteRequest, getWasteRecommendations);

/**
 * @route   GET /api/waste/mock/:cropType
 * @desc    Get mock waste management recommendations for fallback
 * @access  Public
 */
router.get("/mock/:cropType", getMockRecommendations);

export default router;
