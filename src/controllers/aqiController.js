import aqiService from "../services/aqiService.js";
import logger from "../utils/logger.js";
import { AppError } from "../middleware/errorHandler.js";

class AQIController {
  constructor() {
    this.aqiService = aqiService;
  }

  // Get current AQI data
  getCurrentAQI = async (req, res, next) => {
    try {
      const { lat, lon, city } = req.query;

      if (!lat && !lon && !city) {
        throw new AppError(
          "Location parameters are required (lat & lon or city)",
          400
        );
      }

      let aqiData;
      if (city) {
        aqiData = await this.aqiService.getAQIByCity(city);
      } else {
        aqiData = await this.aqiService.getAQIByCoordinates(lat, lon);
      }

      // Add agricultural impact analysis
      const agriculturalImpact = this.analyzeAgriculturalImpact(aqiData);

      logger.info(`AQI data fetched for ${city || `${lat},${lon}`}`);

      res.status(200).json({
        success: true,
        data: {
          ...aqiData,
          agriculturalImpact,
        },
      });
    } catch (error) {
      logger.error("Error fetching current AQI:", error);
      next(error);
    }
  };

  // Get AQI forecast
  getAQIForecast = async (req, res, next) => {
    try {
      const { lat, lon, city } = req.query;

      if (!lat && !lon && !city) {
        throw new AppError(
          "Location parameters are required (lat & lon or city)",
          400
        );
      }

      let forecastData;
      if (city) {
        forecastData = await this.aqiService.getAQIForecast(city);
      } else {
        forecastData = await this.aqiService.getAQIForecast({ lat, lon });
      }

      logger.info(`AQI forecast fetched for ${city || `${lat},${lon}`}`);

      res.status(200).json({
        success: true,
        data: forecastData,
      });
    } catch (error) {
      logger.error("Error fetching AQI forecast:", error);
      next(error);
    }
  };

  // Get AQI history
  getAQIHistory = async (req, res, next) => {
    try {
      const { lat, lon, city, days = 7 } = req.query;

      if (!lat && !lon && !city) {
        throw new AppError(
          "Location parameters are required (lat & lon or city)",
          400
        );
      }

      const historyData = await this.aqiService.getAQIHistory(
        city || { lat, lon },
        parseInt(days)
      );

      logger.info(
        `AQI history fetched for ${city || `${lat},${lon}`} - ${days} days`
      );

      res.status(200).json({
        success: true,
        data: historyData,
      });
    } catch (error) {
      logger.error("Error fetching AQI history:", error);
      next(error);
    }
  };

  // Get AQI stations near location
  getNearbyStations = async (req, res, next) => {
    try {
      const { lat, lon, radius = 50 } = req.query;

      if (!lat || !lon) {
        throw new AppError("Latitude and longitude are required", 400);
      }

      const stations = await this.aqiService.getNearbyStations(
        lat,
        lon,
        radius
      );

      logger.info(
        `Nearby AQI stations fetched for ${lat},${lon} within ${radius}km`
      );

      res.status(200).json({
        success: true,
        data: stations,
      });
    } catch (error) {
      logger.error("Error fetching nearby AQI stations:", error);
      next(error);
    }
  };

  // Get agricultural AQI recommendations
  getAgriculturalRecommendations = async (req, res, next) => {
    try {
      const { lat, lon, city, cropType } = req.query;

      if (!lat && !lon && !city) {
        throw new AppError(
          "Location parameters are required (lat & lon or city)",
          400
        );
      }

      let aqiData;
      if (city) {
        aqiData = await this.aqiService.getAQIByCity(city);
      } else {
        aqiData = await this.aqiService.getAQIByCoordinates(lat, lon);
      }

      const recommendations = this.generateAgriculturalRecommendations(
        aqiData,
        cropType
      );

      logger.info(
        `Agricultural AQI recommendations generated for ${
          city || `${lat},${lon}`
        }`
      );

      res.status(200).json({
        success: true,
        data: {
          aqi: aqiData,
          recommendations,
        },
      });
    } catch (error) {
      logger.error("Error generating agricultural AQI recommendations:", error);
      next(error);
    }
  };

  // Get AQI alerts for agriculture
  getAQIAlerts = async (req, res, next) => {
    try {
      const { lat, lon, city } = req.query;

      if (!lat && !lon && !city) {
        throw new AppError(
          "Location parameters are required (lat & lon or city)",
          400
        );
      }

      let aqiData;
      if (city) {
        aqiData = await this.aqiService.getAQIByCity(city);
      } else {
        aqiData = await this.aqiService.getAQIByCoordinates(lat, lon);
      }

      const alerts = this.generateAQIAlerts(aqiData);

      res.status(200).json({
        success: true,
        data: {
          aqi: aqiData,
          alerts,
        },
      });
    } catch (error) {
      logger.error("Error fetching AQI alerts:", error);
      next(error);
    }
  };

  // Get comprehensive air quality report
  getAirQualityReport = async (req, res, next) => {
    try {
      const { lat, lon, city } = req.query;

      if (!lat && !lon && !city) {
        throw new AppError(
          "Location parameters are required (lat & lon or city)",
          400
        );
      }

      // Get current AQI
      let currentAQI;
      if (city) {
        currentAQI = await this.aqiService.getAQIByCity(city);
      } else {
        currentAQI = await this.aqiService.getAQIByCoordinates(lat, lon);
      }

      // Get forecast if available
      let forecast;
      try {
        forecast = await this.aqiService.getAQIForecast(city || { lat, lon });
      } catch (error) {
        logger.warn("AQI forecast not available");
        forecast = null;
      }

      // Generate comprehensive analysis
      const analysis = this.generateComprehensiveAnalysis(currentAQI, forecast);
      const healthImpact = this.analyzeHealthImpact(currentAQI);
      const agriculturalImpact = this.analyzeAgriculturalImpact(currentAQI);

      logger.info(
        `Comprehensive air quality report generated for ${
          city || `${lat},${lon}`
        }`
      );

      res.status(200).json({
        success: true,
        data: {
          current: currentAQI,
          forecast,
          analysis,
          healthImpact,
          agriculturalImpact,
        },
      });
    } catch (error) {
      logger.error("Error generating air quality report:", error);
      next(error);
    }
  };

  // Private method to analyze agricultural impact
  analyzeAgriculturalImpact(aqiData) {
    const aqi = aqiData.aqi || aqiData.data?.aqi;
    const pm25 = aqiData.iaqi?.pm25?.v || 0;
    const pm10 = aqiData.iaqi?.pm10?.v || 0;
    const o3 = aqiData.iaqi?.o3?.v || 0;
    const no2 = aqiData.iaqi?.no2?.v || 0;
    const so2 = aqiData.iaqi?.so2?.v || 0;

    const impact = {
      overall: this.getAQILevel(aqi),
      details: [],
    };

    // PM2.5 impact on agriculture
    if (pm25 > 75) {
      impact.details.push({
        pollutant: "PM2.5",
        level: "high",
        impact: "May reduce photosynthesis and clog plant stomata",
        recommendations: [
          "Increase irrigation to wash dust off leaves",
          "Provide physical barriers",
        ],
      });
    }

    // PM10 impact
    if (pm10 > 150) {
      impact.details.push({
        pollutant: "PM10",
        level: "high",
        impact: "Dust accumulation on leaves reduces light absorption",
        recommendations: ["Regular leaf washing", "Install dust barriers"],
      });
    }

    // Ozone impact
    if (o3 > 100) {
      impact.details.push({
        pollutant: "Ozone",
        level: "high",
        impact: "Can damage plant tissues and reduce crop yields",
        recommendations: [
          "Avoid peak ozone hours for field work",
          "Select ozone-resistant varieties",
        ],
      });
    }

    // SO2 impact
    if (so2 > 50) {
      impact.details.push({
        pollutant: "SO2",
        level: "moderate",
        impact: "May cause leaf discoloration and growth reduction",
        recommendations: [
          "Monitor leaf health",
          "Apply soil amendments to neutralize acidity",
        ],
      });
    }

    return impact;
  }

  // Private method to generate agricultural recommendations
  generateAgriculturalRecommendations(aqiData, cropType) {
    const aqi = aqiData.aqi || aqiData.data?.aqi;
    const recommendations = [];

    if (aqi > 200) {
      recommendations.push({
        priority: "critical",
        category: "general",
        message:
          "Air quality is hazardous. Avoid all outdoor agricultural activities.",
        actions: [
          "Postpone planting",
          "Delay harvesting",
          "Protect stored crops",
        ],
      });
    } else if (aqi > 150) {
      recommendations.push({
        priority: "high",
        category: "timing",
        message:
          "Poor air quality. Limit outdoor work to essential activities only.",
        actions: [
          "Work during early morning",
          "Use protective equipment",
          "Reduce exposure time",
        ],
      });
    } else if (aqi > 100) {
      recommendations.push({
        priority: "moderate",
        category: "protection",
        message:
          "Moderate air pollution. Take precautions for sensitive crops.",
        actions: [
          "Monitor crop health",
          "Increase watering frequency",
          "Consider protective covers",
        ],
      });
    }

    // Crop-specific recommendations
    if (cropType) {
      const cropSpecific = this.getCropSpecificRecommendations(
        aqiData,
        cropType
      );
      recommendations.push(...cropSpecific);
    }

    return recommendations;
  }

  // Private method to get crop-specific recommendations
  getCropSpecificRecommendations(aqiData, cropType) {
    const aqi = aqiData.aqi || aqiData.data?.aqi;
    const recommendations = [];

    const sensitiveToOzone = ["wheat", "rice", "soybean", "cotton"];
    const sensitiveToPM = ["leafy vegetables", "lettuce", "spinach", "cabbage"];

    if (
      sensitiveToOzone.includes(cropType.toLowerCase()) &&
      aqiData.iaqi?.o3?.v > 80
    ) {
      recommendations.push({
        priority: "high",
        category: "crop-specific",
        crop: cropType,
        message: `${cropType} is sensitive to ozone levels. Current levels may affect yield.`,
        actions: [
          "Monitor leaf burn symptoms",
          "Consider early harvest",
          "Apply antioxidant foliar spray",
        ],
      });
    }

    if (
      sensitiveToPM.includes(cropType.toLowerCase()) &&
      (aqiData.iaqi?.pm25?.v > 50 || aqiData.iaqi?.pm10?.v > 100)
    ) {
      recommendations.push({
        priority: "moderate",
        category: "crop-specific",
        crop: cropType,
        message: `${cropType} leaves may accumulate particulate matter, affecting quality.`,
        actions: [
          "Wash leaves before harvest",
          "Use drip irrigation",
          "Install windbreaks",
        ],
      });
    }

    return recommendations;
  }

  // Private method to generate AQI alerts
  generateAQIAlerts(aqiData) {
    const aqi = aqiData.aqi || aqiData.data?.aqi;
    const alerts = [];

    if (aqi > 300) {
      alerts.push({
        type: "hazardous",
        severity: "critical",
        message:
          "Hazardous air quality! Suspend all agricultural activities immediately.",
        timestamp: new Date().toISOString(),
        duration: "24+ hours",
      });
    } else if (aqi > 200) {
      alerts.push({
        type: "very_unhealthy",
        severity: "high",
        message: "Very unhealthy air quality. Avoid prolonged outdoor work.",
        timestamp: new Date().toISOString(),
        duration: "12-24 hours",
      });
    } else if (aqi > 150) {
      alerts.push({
        type: "unhealthy",
        severity: "moderate",
        message:
          "Unhealthy air quality for sensitive activities. Take precautions.",
        timestamp: new Date().toISOString(),
        duration: "6-12 hours",
      });
    }

    return alerts;
  }

  // Private method to analyze health impact
  analyzeHealthImpact(aqiData) {
    const aqi = aqiData.aqi || aqiData.data?.aqi;
    const level = this.getAQILevel(aqi);

    const healthImpact = {
      level,
      generalPublic: this.getHealthAdvice(aqi, "general"),
      sensitiveGroups: this.getHealthAdvice(aqi, "sensitive"),
      workersAdvice: this.getHealthAdvice(aqi, "workers"),
    };

    return healthImpact;
  }

  // Private method to generate comprehensive analysis
  generateComprehensiveAnalysis(currentAQI, forecast) {
    const aqi = currentAQI.aqi || currentAQI.data?.aqi;

    const analysis = {
      currentStatus: this.getAQILevel(aqi),
      trend: forecast
        ? this.analyzeTrend(currentAQI, forecast)
        : "Data not available",
      primaryPollutants: this.identifyPrimaryPollutants(currentAQI),
      recommendations: this.getGeneralRecommendations(aqi),
    };

    return analysis;
  }

  // Helper methods
  getAQILevel(aqi) {
    if (aqi <= 50) return "Good";
    if (aqi <= 100) return "Moderate";
    if (aqi <= 150) return "Unhealthy for Sensitive Groups";
    if (aqi <= 200) return "Unhealthy";
    if (aqi <= 300) return "Very Unhealthy";
    return "Hazardous";
  }

  getHealthAdvice(aqi, group) {
    const advice = {
      general: {
        good: "Air quality is acceptable for most people.",
        moderate:
          "Unusually sensitive people should consider reducing prolonged outdoor exertion.",
        unhealthySensitive:
          "People in sensitive groups should reduce prolonged outdoor exertion.",
        unhealthy: "Everyone should reduce prolonged outdoor exertion.",
        veryUnhealthy: "Everyone should avoid prolonged outdoor exertion.",
        hazardous: "Everyone should avoid all outdoor exertion.",
      },
      sensitive: {
        good: "No precautions needed.",
        moderate: "Consider reducing prolonged outdoor activities.",
        unhealthySensitive: "Reduce prolonged outdoor activities.",
        unhealthy: "Avoid prolonged outdoor activities.",
        veryUnhealthy: "Avoid all outdoor activities.",
        hazardous: "Remain indoors and keep activity levels low.",
      },
      workers: {
        good: "Normal outdoor work activities.",
        moderate:
          "Consider reducing heavy outdoor work for sensitive individuals.",
        unhealthySensitive:
          "Reduce heavy outdoor work, especially for sensitive workers.",
        unhealthy: "Reduce outdoor work time and intensity.",
        veryUnhealthy: "Minimize outdoor work, use protective equipment.",
        hazardous: "Postpone non-essential outdoor work.",
      },
    };

    if (aqi <= 50) return advice[group].good;
    if (aqi <= 100) return advice[group].moderate;
    if (aqi <= 150) return advice[group].unhealthySensitive;
    if (aqi <= 200) return advice[group].unhealthy;
    if (aqi <= 300) return advice[group].veryUnhealthy;
    return advice[group].hazardous;
  }

  identifyPrimaryPollutants(aqiData) {
    const pollutants = [];
    const iaqi = aqiData.iaqi || {};

    Object.keys(iaqi).forEach((pollutant) => {
      if (iaqi[pollutant] && iaqi[pollutant].v) {
        pollutants.push({
          name: pollutant.toUpperCase(),
          value: iaqi[pollutant].v,
          level: this.getPollutantLevel(pollutant, iaqi[pollutant].v),
        });
      }
    });

    return pollutants.sort((a, b) => b.value - a.value);
  }

  getPollutantLevel(pollutant, value) {
    // Simplified pollutant level determination
    const thresholds = {
      pm25: [15, 35, 55, 150],
      pm10: [55, 155, 255, 355],
      o3: [60, 120, 170, 210],
      no2: [100, 200, 700, 1200],
      so2: [80, 365, 800, 1600],
      co: [5000, 10000, 17000, 34000],
    };

    const levels = [
      "Good",
      "Moderate",
      "Unhealthy for Sensitive",
      "Unhealthy",
      "Very Unhealthy",
    ];
    const threshold = thresholds[pollutant.toLowerCase()] || [
      50, 100, 150, 200,
    ];

    for (let i = 0; i < threshold.length; i++) {
      if (value <= threshold[i]) return levels[i];
    }
    return "Hazardous";
  }

  analyzeTrend(current, forecast) {
    // Simple trend analysis based on forecast data
    const currentAQI = current.aqi || current.data?.aqi;
    if (forecast && forecast.data && forecast.data.length > 0) {
      const futureAQI = forecast.data[0].aqi;
      if (futureAQI > currentAQI + 20) return "Worsening";
      if (futureAQI < currentAQI - 20) return "Improving";
      return "Stable";
    }
    return "Unknown";
  }

  getGeneralRecommendations(aqi) {
    if (aqi <= 50) return ["Enjoy outdoor activities"];
    if (aqi <= 100)
      return ["Sensitive individuals should limit outdoor exposure"];
    if (aqi <= 150)
      return ["Limit outdoor activities", "Close windows", "Use air purifiers"];
    if (aqi <= 200)
      return [
        "Avoid outdoor activities",
        "Stay indoors",
        "Use masks when outside",
      ];
    return [
      "Stay indoors",
      "Seal windows and doors",
      "Use air purifiers",
      "Seek medical attention if needed",
    ];
  }
}

export default new AQIController();
