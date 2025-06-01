/**
 * Main Routes Index
 * Centralizes all route definitions
 */

import express from "express";
import authRoutes from "./auth.js";
import cropRoutes from "./crops.js";
import weatherRoutes from "./weather.js";
import aqiRoutes from "./aqi.js";
import wasteRoutes from "./waste.js";

const router = express.Router();

// Health check route
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "BioBloom API is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// API routes
router.use("/auth", authRoutes);
router.use("/crops", cropRoutes);
router.use("/weather", weatherRoutes);
router.use("/aqi", aqiRoutes);
router.use("/waste", wasteRoutes);

// API documentation route
router.get("/docs", (req, res) => {
  res.json({
    success: true,
    message: "BioBloom API Documentation",
    endpoints: {
      auth: {
        "POST /api/auth/register": "Register a new user",
        "POST /api/auth/login": "Login user",
        "GET /api/auth/me": "Get current user profile",
        "PUT /api/auth/profile": "Update user profile",
        "POST /api/auth/forgot-password": "Request password reset",
        "POST /api/auth/reset-password/:token": "Reset password",
        "GET /api/auth/google": "Google OAuth login",
        "POST /api/auth/logout": "Logout user",
      },
      crops: {
        "POST /api/crops/recommendations": "Get crop rotation recommendations",
        "POST /api/crops/analysis": "Get comprehensive crop analysis",
        "GET /api/crops/history": "Get user crop history",
        "POST /api/crops": "Add new crop",
        "PUT /api/crops/:id": "Update crop information",
        "DELETE /api/crops/:id": "Delete crop",
        "GET /api/crops/varieties/:cropName": "Get crop varieties",
        "GET /api/crops/seasonal": "Get seasonal recommendations",
      },
      weather: {
        "GET /api/weather/current": "Get current weather data",
        "GET /api/weather/forecast": "Get weather forecast",
        "GET /api/weather/agriculture":
          "Get agricultural weather recommendations",
        "GET /api/weather/history": "Get weather history",
        "GET /api/weather/alerts": "Get weather alerts for agriculture",
      },
      aqi: {
        "GET /api/aqi/current": "Get current AQI data",
        "GET /api/aqi/forecast": "Get AQI forecast",
        "GET /api/aqi/history": "Get AQI history",
        "GET /api/aqi/stations": "Get nearby AQI monitoring stations",
        "GET /api/aqi/agriculture": "Get agricultural AQI recommendations",
        "GET /api/aqi/alerts": "Get AQI alerts",
        "GET /api/aqi/report": "Get comprehensive air quality report",
      },
      waste: {
        "POST /api/waste/recommendations":
          "Get AI-powered waste management recommendations",
        "GET /api/waste/mock/:cropType":
          "Get mock waste management recommendations for fallback",
      },
    },
  });
});

export default router;
