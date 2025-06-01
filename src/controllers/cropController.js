/**
 * Crop Controller
 * Handles all crop-related operations including:
 * - Crop recommendations and rotation planning
 * - AI-powered agricultural advice
 * - Crop data management
 * - Historical data tracking
 */

import Crop from "../models/Crop.js";
import SearchHistory from "../models/SearchHistory.js";
import GroqService from "../services/groqService.js";
import WeatherService from "../services/weatherService.js";
import AQIService from "../services/aqiService.js";

class CropController {
  /**
   * Get crop recommendations based on farm details
   */
  async getRecommendations(req, res) {
    try {
      const { previousCrop, soilType, region, farmSize } = req.body;
      const userId = req.userId;

      // Validate required fields
      if (!previousCrop || !soilType || !region || !farmSize) {
        return res.status(400).json({
          success: false,
          message:
            "Missing required fields: previousCrop, soilType, region, farmSize",
        });
      }

      // Save search to history
      if (userId) {
        await this.saveSearchHistory(userId, {
          type: "crop_recommendation",
          query: { previousCrop, soilType, region, farmSize },
          location: region,
        });
      }

      // Get AI recommendations from Groq
      const cropInfo = { previousCrop, soilType, region, farmSize };
      const recommendations = await GroqService.getCropRecommendations(
        cropInfo
      );

      // Save crop data for future reference
      // const cropData = new Crop({
      //   userId: userId || null,
      //   cropName: previousCrop,
      //   soilType,
      //   region,
      //   farmSize,
      //   recommendations: {
      //     aiGenerated: recommendations,
      //     generatedAt: new Date(),
      //   },
      //   growingConditions: {
      //     soilType,
      //     climateZone: region,
      //   },
      // });

      // await cropData.save();

      res.json({
        success: true,
        message: "Crop recommendations generated successfully",
        data: {
          recommendations,
          // cropId: cropData._id,
          timestamp: new Date(),
        },
      });
    } catch (error) {
      console.error("Get recommendations error:", error);
      res.status(500).json({
        success: false,
        message: "Unable to get crop recommendations",
        error: error.message,
      });
    }
  }

  /**
   * Get comprehensive crop analysis including weather and AQI data
   */
  async getCropAnalysis(req, res) {
    try {
      const { cropName, location, coordinates } = req.body;
      const userId = req.userId;

      if (!cropName || !location) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields: cropName, location",
        });
      }

      // Get crop information
      const cropData = await Crop.findOne({
        cropName: new RegExp(cropName, "i"),
        userId: userId || null,
      }).sort({ createdAt: -1 });

      // Get weather data for the location
      let weatherData = null;
      if (coordinates) {
        weatherData = await WeatherService.getCurrentWeather(
          coordinates.lat,
          coordinates.lon
        );
      }

      // Get AQI data for the location
      let aqiData = null;
      if (coordinates) {
        aqiData = await AQIService.getCurrentAQI(
          coordinates.lat,
          coordinates.lon
        );
      }

      // Generate crop-specific advice based on current conditions
      const analysisPrompt = this.buildAnalysisPrompt(
        cropName,
        location,
        weatherData,
        aqiData
      );
      const analysis = await GroqService.getCropAnalysis(analysisPrompt);

      // Save search history
      if (userId) {
        await this.saveSearchHistory(userId, {
          type: "crop_analysis",
          query: { cropName, location },
          location,
        });
      }

      res.json({
        success: true,
        message: "Crop analysis completed successfully",
        data: {
          crop: cropData,
          weather: weatherData,
          aqi: aqiData,
          analysis,
          timestamp: new Date(),
        },
      });
    } catch (error) {
      console.error("Crop analysis error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to generate crop analysis",
        error: error.message,
      });
    }
  }

  /**
   * Get user's crop history
   */
  async getCropHistory(req, res) {
    try {
      const userId = req.userId;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const crops = await Crop.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("cultivationData.plantingDate")
        .populate("cultivationData.harvestDate");

      const total = await Crop.countDocuments({ userId });

      res.json({
        success: true,
        data: {
          crops,
          pagination: {
            current: page,
            pages: Math.ceil(total / limit),
            total,
            limit,
          },
        },
      });
    } catch (error) {
      console.error("Get crop history error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch crop history",
        error: error.message,
      });
    }
  }

  /**
   * Add new crop to user's farm
   */
  async addCrop(req, res) {
    try {
      const userId = req.userId;
      const {
        cropName,
        soilType,
        region,
        farmSize,
        plantingDate,
        expectedHarvestDate,
        variety,
        notes,
      } = req.body;

      if (!cropName || !soilType || !region) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields: cropName, soilType, region",
        });
      }

      const crop = new Crop({
        userId,
        cropName,
        soilType,
        region,
        farmSize,
        variety,
        cultivationData: {
          plantingDate: plantingDate ? new Date(plantingDate) : undefined,
          expectedHarvestDate: expectedHarvestDate
            ? new Date(expectedHarvestDate)
            : undefined,
          notes,
        },
        growingConditions: {
          soilType,
          climateZone: region,
        },
      });

      await crop.save();

      res.status(201).json({
        success: true,
        message: "Crop added successfully",
        data: { crop },
      });
    } catch (error) {
      console.error("Add crop error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to add crop",
        error: error.message,
      });
    }
  }

  /**
   * Update crop information
   */
  async updateCrop(req, res) {
    try {
      const { cropId } = req.params;
      const userId = req.userId;
      const updateData = req.body;

      const crop = await Crop.findOneAndUpdate(
        { _id: cropId, userId },
        { $set: updateData },
        { new: true, runValidators: true }
      );

      if (!crop) {
        return res.status(404).json({
          success: false,
          message: "Crop not found",
        });
      }

      res.json({
        success: true,
        message: "Crop updated successfully",
        data: { crop },
      });
    } catch (error) {
      console.error("Update crop error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update crop",
        error: error.message,
      });
    }
  }

  /**
   * Delete crop
   */
  async deleteCrop(req, res) {
    try {
      const { cropId } = req.params;
      const userId = req.userId;

      const crop = await Crop.findOneAndDelete({ _id: cropId, userId });

      if (!crop) {
        return res.status(404).json({
          success: false,
          message: "Crop not found",
        });
      }

      res.json({
        success: true,
        message: "Crop deleted successfully",
      });
    } catch (error) {
      console.error("Delete crop error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete crop",
        error: error.message,
      });
    }
  }

  /**
   * Get crop varieties for a specific crop type
   */
  async getCropVarieties(req, res) {
    try {
      const { cropName } = req.params;

      const varieties = await Crop.getVarietiesByCrop(cropName);

      res.json({
        success: true,
        data: {
          cropName,
          varieties,
        },
      });
    } catch (error) {
      console.error("Get crop varieties error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch crop varieties",
        error: error.message,
      });
    }
  }

  /**
   * Get seasonal crop recommendations
   */
  async getSeasonalRecommendations(req, res) {
    try {
      const { region, season } = req.query;

      if (!region) {
        return res.status(400).json({
          success: false,
          message: "Region parameter is required",
        });
      }

      const seasonalCrops = await Crop.getSeasonalCrops(region, season);

      res.json({
        success: true,
        data: {
          region,
          season: season || "current",
          recommendations: seasonalCrops,
        },
      });
    } catch (error) {
      console.error("Get seasonal recommendations error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch seasonal recommendations",
        error: error.message,
      });
    }
  }

  /**
   * Save search history helper method
   */
  async saveSearchHistory(userId, searchData) {
    try {
      const searchHistory = new SearchHistory({
        userId,
        searchType: searchData.type,
        query: searchData.query,
        location: searchData.location,
        timestamp: new Date(),
      });

      await searchHistory.save();
    } catch (error) {
      console.error("Save search history error:", error);
      // Don't throw error as this is not critical
    }
  }

  /**
   * Build analysis prompt for AI service
   */
  buildAnalysisPrompt(cropName, location, weatherData, aqiData) {
    let prompt = `Provide detailed agricultural analysis for ${cropName} crop in ${location}.\n\n`;

    if (weatherData) {
      prompt += `Current Weather Conditions:
- Temperature: ${weatherData.temperature}°C
- Humidity: ${weatherData.humidity}%
- Wind Speed: ${weatherData.windSpeed} km/h
- Conditions: ${weatherData.description}\n\n`;
    }

    if (aqiData) {
      prompt += `Air Quality Information:
- AQI Level: ${aqiData.aqi}
- Primary Pollutant: ${aqiData.dominantPollutant}
- Health Concern: ${aqiData.healthConcern}\n\n`;
    }

    prompt += `Please provide:
1. Current growing conditions assessment
2. Immediate care recommendations
3. Potential risks and mitigation strategies
4. Optimal farming practices for current conditions
5. Expected yield predictions
6. Best practices for sustainable farming`;

    return prompt;
  }
}

export default new CropController();
