import express from "express";
import weatherController from "../controllers/weatherController.js";
import { verifyToken } from "../middleware/auth.js";
import { validateRequest } from "../middleware/validation.js";
import { weatherValidation } from "../middleware/validation.js";

const router = express.Router();

/**
 * @route   GET /api/weather/location
 * @desc    Get location name from coordinates
 * @access  Public
 * @params  lat, lon (query parameters)
 */
router.get(
  "/location",
  validateRequest(weatherValidation.coordinatesParams, "query"),
  weatherController.getLocation,
);

/**
 * @route   GET /api/weather/current
 * @desc    Get current weather data
 * @access  Public
 * @params  lat, lon OR city (query parameters)
 */
router.get(
  "/current",
  validateRequest(weatherValidation.locationParams, "query"),
  weatherController.getCurrentWeather,
);

/**
 * @route   GET /api/weather/forecast
 * @desc    Get 5-day weather forecast
 * @access  Private
 * @params  lat, lon OR city (query parameters)
 */
// router.use(verifyToken); // Apply authentication middleware to all routes below
router.get(
  "/forecast",
  validateRequest(weatherValidation.locationParams, "query"),
  weatherController.getWeatherForecast,
);

/**
 * @route   GET /api/weather/agriculture
 * @desc    Get agricultural weather recommendations
 * @access  Private
 * @params  lat, lon OR city, cropType (query parameters)
 */
router.get(
  "/agriculture",
  validateRequest(weatherValidation.agricultureParams, "query"),
  weatherController.getAgricultureWeather,
);

/**
 * @route   GET /api/weather/history
 * @desc    Get weather history for a location
 * @access  Private
 * @params  lat, lon OR city, days (query parameters)
 */
router.get(
  "/history",
  validateRequest(weatherValidation.historyParams, "query"),
  weatherController.getWeatherHistory,
);

/**
 * @route   GET /api/weather/alerts
 * @desc    Get weather alerts for agriculture
 * @access  Private
 * @params  lat, lon OR city (query parameters)
 */
router.get(
  "/alerts",
  validateRequest(weatherValidation.locationParams, "query"),
  weatherController.getWeatherAlerts,
);

export default router;
