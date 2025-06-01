/**
 * AQI Service
 * Handles Air Quality Index data fetching and analysis
 */

import fetch from "node-fetch";
import config from "../config/index.js";
import AQI from "../models/AQI.js";
import { AppError } from "../middleware/errorHandler.js";

class AQIService {
  constructor() {
    this.apiKey = config.apis.aqi.key;
    this.baseUrl = config.apis.aqi.baseUrl;
  }

  /**
   * Get current AQI data
   */
  async getCurrentAQI(lat, lon, city = null) {
    try {
      // Check if we have recent cached data
      const cachedAQI = await this.getCachedAQI(lat, lon);
      if (cachedAQI) {
        return this.formatAQIData(cachedAQI);
      }

      // Fetch from external API
      const url = `${this.baseUrl}/feed/geo:${lat};${lon}/?token=${this.apiKey}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`AQI API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.status !== "ok") {
        throw new Error("Failed to fetch AQI data");
      }

      // Save to database
      const aqiData = await this.saveAQIData(data, lat, lon, city);

      return this.formatAQIData(aqiData);
    } catch (error) {
      console.error("Get current AQI error:", error);
      throw new AppError("Failed to fetch current AQI data", 500);
    }
  }

  /**
   * Get AQI forecast (if available)
   */
  async getAQIForecast(lat, lon, city = null) {
    try {
      // Most AQI APIs don't provide forecasts, so we'll return current data
      // In a real implementation, you might use a different API for forecasts
      const currentAQI = await this.getCurrentAQI(lat, lon, city);

      return {
        ...currentAQI,
        forecast: this.generateSimpleForecast(currentAQI),
      };
    } catch (error) {
      console.error("Get AQI forecast error:", error);
      throw new AppError("Failed to fetch AQI forecast", 500);
    }
  }

  /**
   * Get agricultural AQI analysis
   */
  async getAgriculturalAQIAnalysis(lat, lon, cropName = null) {
    try {
      const currentAQI = await this.getCurrentAQI(lat, lon);

      const analysis = {
        current: currentAQI,
        agricultural: {
          cropImpact: this.assessCropImpact(currentAQI, cropName),
          workerSafety: this.assessWorkerSafety(currentAQI),
          recommendations: this.getAQIRecommendations(currentAQI),
          protectiveMeasures: this.getProtectiveMeasures(currentAQI),
          optimalActivities: this.getOptimalActivities(currentAQI),
        },
      };

      return analysis;
    } catch (error) {
      console.error("Agricultural AQI analysis error:", error);
      throw new AppError("Failed to generate agricultural AQI analysis", 500);
    }
  }

  /**
   * Get cached AQI data
   */
  async getCachedAQI(lat, lon) {
    try {
      const cacheExpiry = 60 * 60 * 1000; // 1 hour
      const cutoffTime = new Date(Date.now() - cacheExpiry);

      const aqi = await AQI.findOne({
        "location.coordinates": {
          $near: {
            $geometry: { type: "Point", coordinates: [lon, lat] },
            $maxDistance: 10000, // 10km radius
          },
        },
        timestamp: { $gte: cutoffTime },
      }).sort({ timestamp: -1 });

      return aqi;
    } catch (error) {
      console.error("Get cached AQI error:", error);
      return null;
    }
  }

  /**
   * Save AQI data to database
   */
  async saveAQIData(apiData, lat, lon, city) {
    try {
      const aqiData = new AQI({
        location: {
          city: city || apiData.data.city.name,
          coordinates: [lon, lat],
          station: apiData.data.city.name,
        },
        aqi: apiData.data.aqi,
        dominantPollutant: apiData.data.dominentpol || "unknown",
        pollutants: this.extractPollutants(apiData.data.iaqi),
        healthRecommendations: this.generateHealthRecommendations(
          apiData.data.aqi
        ),
        agriculturalImpact: this.assessAgriculturalImpact(apiData.data.aqi),
        timestamp: new Date(),
        source: "waqi",
        attribution: apiData.data.attributions,
      });

      await aqiData.save();
      return aqiData;
    } catch (error) {
      console.error("Save AQI data error:", error);
      throw error;
    }
  }

  /**
   * Extract pollutant data
   */
  extractPollutants(iaqi) {
    const pollutants = {};

    if (iaqi.pm25) pollutants.pm25 = iaqi.pm25.v;
    if (iaqi.pm10) pollutants.pm10 = iaqi.pm10.v;
    if (iaqi.o3) pollutants.o3 = iaqi.o3.v;
    if (iaqi.no2) pollutants.no2 = iaqi.no2.v;
    if (iaqi.so2) pollutants.so2 = iaqi.so2.v;
    if (iaqi.co) pollutants.co = iaqi.co.v;

    return pollutants;
  }

  /**
   * Format AQI data for response
   */
  formatAQIData(aqiData) {
    return {
      location: aqiData.location,
      aqi: aqiData.aqi,
      category: this.getAQICategory(aqiData.aqi),
      dominantPollutant: aqiData.dominantPollutant,
      pollutants: aqiData.pollutants,
      healthConcern: this.getHealthConcern(aqiData.aqi),
      healthRecommendations: aqiData.healthRecommendations,
      agriculturalImpact: aqiData.agriculturalImpact,
      timestamp: aqiData.timestamp,
    };
  }

  /**
   * Get AQI category
   */
  getAQICategory(aqi) {
    if (aqi <= 50) return "Good";
    if (aqi <= 100) return "Moderate";
    if (aqi <= 150) return "Unhealthy for Sensitive Groups";
    if (aqi <= 200) return "Unhealthy";
    if (aqi <= 300) return "Very Unhealthy";
    return "Hazardous";
  }

  /**
   * Get health concern level
   */
  getHealthConcern(aqi) {
    if (aqi <= 50) return "Little or no risk";
    if (aqi <= 100) return "Acceptable for most people";
    if (aqi <= 150) return "Sensitive groups may experience symptoms";
    if (aqi <= 200) return "Everyone may experience symptoms";
    if (aqi <= 300) return "Health warnings of emergency conditions";
    return "Health alert - everyone may experience serious symptoms";
  }

  /**
   * Generate health recommendations
   */
  generateHealthRecommendations(aqi) {
    const recommendations = [];

    if (aqi <= 50) {
      recommendations.push(
        "Air quality is satisfactory. Enjoy outdoor activities."
      );
    } else if (aqi <= 100) {
      recommendations.push("Air quality is acceptable for most people.");
      recommendations.push(
        "Sensitive individuals should consider limiting prolonged outdoor exertion."
      );
    } else if (aqi <= 150) {
      recommendations.push("Sensitive groups should limit outdoor activities.");
      recommendations.push(
        "Wear masks when outdoors if sensitive to air pollution."
      );
    } else if (aqi <= 200) {
      recommendations.push("Everyone should limit outdoor activities.");
      recommendations.push("Wear N95 masks when outdoors.");
      recommendations.push(
        "Keep windows closed and use air purifiers indoors."
      );
    } else if (aqi <= 300) {
      recommendations.push("Avoid outdoor activities.");
      recommendations.push("Stay indoors with air purifiers running.");
      recommendations.push("Seek medical attention if experiencing symptoms.");
    } else {
      recommendations.push("Health alert - stay indoors.");
      recommendations.push("Avoid all outdoor activities.");
      recommendations.push("Use high-quality air purifiers.");
    }

    return recommendations;
  }

  /**
   * Agricultural analysis methods
   */

  assessCropImpact(aqiData, cropName) {
    const aqi = aqiData.aqi;
    const impact = {
      level: "low",
      description: "",
      concerns: [],
    };

    if (aqi > 150) {
      impact.level = "high";
      impact.description =
        "High air pollution may significantly affect crop health and yield.";
      impact.concerns.push("Reduced photosynthesis efficiency");
      impact.concerns.push("Leaf damage from pollutants");
      impact.concerns.push("Stunted growth");
    } else if (aqi > 100) {
      impact.level = "medium";
      impact.description =
        "Moderate air pollution may have some impact on crop health.";
      impact.concerns.push("Potential reduction in growth rate");
      impact.concerns.push("Increased susceptibility to diseases");
    } else {
      impact.level = "low";
      impact.description = "Air quality is good for crop growth.";
    }

    return impact;
  }

  assessWorkerSafety(aqiData) {
    const aqi = aqiData.aqi;
    const safety = {
      level: "safe",
      recommendations: [],
    };

    if (aqi > 200) {
      safety.level = "dangerous";
      safety.recommendations.push("Avoid outdoor farm work");
      safety.recommendations.push(
        "If work is essential, use N95 or P100 masks"
      );
      safety.recommendations.push("Take frequent breaks indoors");
      safety.recommendations.push("Monitor health closely");
    } else if (aqi > 150) {
      safety.level = "caution";
      safety.recommendations.push("Limit outdoor work duration");
      safety.recommendations.push("Use appropriate masks");
      safety.recommendations.push("Stay hydrated");
    } else if (aqi > 100) {
      safety.level = "moderate";
      safety.recommendations.push("Consider using masks for extended work");
      safety.recommendations.push("Take regular breaks");
    } else {
      safety.level = "safe";
      safety.recommendations.push("Normal work activities can continue");
    }

    return safety;
  }

  getAQIRecommendations(aqiData) {
    const aqi = aqiData.aqi;
    const recommendations = [];

    if (aqi > 150) {
      recommendations.push("Postpone outdoor farming activities if possible");
      recommendations.push("Use covered machinery to reduce exposure");
      recommendations.push("Install air filtration in farm buildings");
      recommendations.push("Monitor crop health more frequently");
    } else if (aqi > 100) {
      recommendations.push("Limit duration of outdoor activities");
      recommendations.push("Use protective equipment when working outdoors");
      recommendations.push(
        "Consider early morning or evening work when air quality may be better"
      );
    } else {
      recommendations.push("Normal farming activities can continue");
      recommendations.push("Good time for outdoor crop maintenance");
    }

    return recommendations;
  }

  getProtectiveMeasures(aqiData) {
    const aqi = aqiData.aqi;
    const measures = [];

    if (aqi > 150) {
      measures.push("Install misting systems to reduce dust");
      measures.push("Use greenhouse cultivation when possible");
      measures.push("Apply foliar sprays to protect leaves");
      measures.push("Increase irrigation to help plants cope with stress");
    } else if (aqi > 100) {
      measures.push("Consider protective row covers");
      measures.push("Maintain adequate soil moisture");
      measures.push("Monitor for signs of plant stress");
    }

    return measures;
  }

  getOptimalActivities(aqiData) {
    const aqi = aqiData.aqi;
    const activities = [];

    if (aqi <= 50) {
      activities.push("Ideal for all outdoor farming activities");
      activities.push("Good time for spraying and fertilizing");
      activities.push("Optimal for harvesting");
    } else if (aqi <= 100) {
      activities.push("Suitable for most farming activities");
      activities.push("Good for planting and watering");
    } else if (aqi <= 150) {
      activities.push("Focus on essential activities only");
      activities.push("Indoor planning and administrative work");
    } else {
      activities.push("Indoor activities recommended");
      activities.push("Equipment maintenance");
      activities.push("Record keeping and planning");
    }

    return activities;
  }

  assessAgriculturalImpact(aqi) {
    return {
      overall: this.getAQICategory(aqi).toLowerCase(),
      cropHealth:
        aqi > 150 ? "at risk" : aqi > 100 ? "moderate concern" : "good",
      productivity:
        aqi > 150 ? "reduced" : aqi > 100 ? "slightly affected" : "normal",
      recommendations:
        aqi > 150
          ? "implement protective measures"
          : aqi > 100
          ? "monitor closely"
          : "maintain normal practices",
    };
  }

  generateSimpleForecast(currentAQI) {
    // Simple forecast generation - in reality, you'd use a more sophisticated model
    const baseForecast = [];
    const currentValue = currentAQI.aqi;

    for (let i = 1; i <= 3; i++) {
      const variation = (Math.random() - 0.5) * 20; // ±10 AQI points variation
      const forecastValue = Math.max(0, Math.round(currentValue + variation));

      baseForecast.push({
        time: new Date(Date.now() + i * 24 * 60 * 60 * 1000),
        aqi: forecastValue,
        category: this.getAQICategory(forecastValue),
      });
    }

    return baseForecast;
  }
}

export default new AQIService();
