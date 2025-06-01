/**
 * Crop Routes
 * Handles all crop-related endpoints
 */

import express from "express";
import cropController from "../controllers/cropController.js";
import { verifyToken, optionalAuth } from "../middleware/auth.js";
import {
  validate,
  cropRecommendationsSchema,
  cropAnalysisSchema,
  addCropSchema,
  validatePagination,
} from "../middleware/validation.js";
import errorHandlers from "../middleware/errorHandler.js";

const router = express.Router();
const { catchAsync } = errorHandlers;

// Public routes (can work with optional authentication)
router.post(
  "/recommendations",
  optionalAuth,
  validate(cropRecommendationsSchema),
  catchAsync(cropController.getRecommendations)
);

router.post(
  "/analysis",
  optionalAuth,
  validate(cropAnalysisSchema),
  catchAsync(cropController.getCropAnalysis)
);

router.get("/varieties/:cropName", catchAsync(cropController.getCropVarieties));

router.get("/seasonal", catchAsync(cropController.getSeasonalRecommendations));

// Protected routes (require authentication)
router.use(verifyToken); // All routes below require authentication

router.get(
  "/history",
  validatePagination,
  catchAsync(cropController.getCropHistory)
);

router.post("/", validate(addCropSchema), catchAsync(cropController.addCrop));

router.put("/:cropId", catchAsync(cropController.updateCrop));

router.delete("/:cropId", catchAsync(cropController.deleteCrop));

export default router;
