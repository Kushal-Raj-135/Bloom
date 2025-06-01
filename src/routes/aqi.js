import express from "express";
import aqiController from "../controllers/aqiController.js";
import { verifyToken } from "../middleware/auth.js";
import { validateRequest } from "../middleware/validation.js";
import { aqiValidation } from "../middleware/validation.js";

const router = express.Router();

// Apply authentication middleware to all AQI routes
router.use(verifyToken);

/**
 * @route   GET /api/aqi/current
 * @desc    Get current AQI data
 * @access  Private
 * @params  lat, lon OR city (query parameters)
 */
router.get(
  "/current",
  validateRequest(aqiValidation.locationParams, "query"),
  aqiController.getCurrentAQI,
);

/**
 * @route   GET /api/aqi/forecast
 * @desc    Get AQI forecast
 * @access  Private
 * @params  lat, lon OR city (query parameters)
 */
router.get(
  "/forecast",
  validateRequest(aqiValidation.locationParams, "query"),
  aqiController.getAQIForecast,
);

/**
 * @route   GET /api/aqi/history
 * @desc    Get AQI history for a location
 * @access  Private
 * @params  lat, lon OR city, days (query parameters)
 */
router.get(
  "/history",
  validateRequest(aqiValidation.historyParams, "query"),
  aqiController.getAQIHistory,
);

/**
 * @route   GET /api/aqi/stations
 * @desc    Get nearby AQI monitoring stations
 * @access  Private
 * @params  lat, lon, radius (query parameters)
 */
router.get(
  "/stations",
  validateRequest(aqiValidation.stationsParams, "query"),
  aqiController.getNearbyStations,
);

/**
 * @route   GET /api/aqi/agriculture
 * @desc    Get agricultural AQI recommendations
 * @access  Private
 * @params  lat, lon OR city, cropType (query parameters)
 */
router.get(
  "/agriculture",
  validateRequest(aqiValidation.agricultureParams, "query"),
  aqiController.getAgriculturalRecommendations,
);

/**
 * @route   GET /api/aqi/alerts
 * @desc    Get AQI alerts for agriculture
 * @access  Private
 * @params  lat, lon OR city (query parameters)
 */
router.get(
  "/alerts",
  validateRequest(aqiValidation.locationParams, "query"),
  aqiController.getAQIAlerts,
);

/**
 * @route   GET /api/aqi/report
 * @desc    Get comprehensive air quality report
 * @access  Private
 * @params  lat, lon OR city (query parameters)
 */
router.get(
  "/report",
  validateRequest(aqiValidation.locationParams, "query"),
  aqiController.getAirQualityReport,
);

export default router;
