import weatherService from "../services/weatherService.js";
import logger from "../utils/logger.js";
import { AppError } from "../middleware/errorHandler.js";

class WeatherController {
  constructor() {
    this.weatherService = weatherService;
  }

  // Get current weather data
  getCurrentWeather = async (req, res, next) => {
    try {
      const { lat, lon, city } = req.query;

      if (!lat && !lon && !city) {
        throw new AppError(
          "Location parameters are required (lat & lon or city)",
          400,
        );
      }

      let weatherData;
      if (city) {
        weatherData = await this.weatherService.getWeatherByCity(city);
      } else {
        weatherData = await this.weatherService.getWeatherByCoordinates(
          lat,
          lon,
        );
      }

      logger.info(`Weather data fetched for ${city || `${lat},${lon}`}`);

      res.status(200).json({
        success: true,
        data: weatherData,
      });
    } catch (error) {
      logger.error("Error fetching current weather:", error);
      next(error);
    }
  };

  // Get weather forecast (5-day)
  getWeatherForecast = async (req, res, next) => {
    try {
      const { lat, lon, city } = req.query;

      if (!lat && !lon && !city) {
        throw new AppError(
          "Location parameters are required (lat & lon or city)",
          400,
        );
      }

      let forecastData;
      if (city) {
        forecastData = await this.weatherService.getForecastByCity(city);
      } else {
        forecastData = await this.weatherService.getForecastByCoordinates(
          lat,
          lon,
        );
      }

      logger.info(`Weather forecast fetched for ${city || `${lat},${lon}`}`);

      res.status(200).json({
        success: true,
        data: forecastData,
      });
    } catch (error) {
      logger.error("Error fetching weather forecast:", error);
      next(error);
    }
  };

  // Get agricultural weather recommendations
  getAgricultureWeather = async (req, res, next) => {
    try {
      const { lat, lon, city, cropType } = req.query;

      if (!lat && !lon && !city) {
        throw new AppError(
          "Location parameters are required (lat & lon or city)",
          400,
        );
      }

      let currentWeather;
      let forecast;

      if (city) {
        currentWeather = await this.weatherService.getWeatherByCity(city);
        forecast = await this.weatherService.getForecastByCity(city);
      } else {
        currentWeather = await this.weatherService.getWeatherByCoordinates(
          lat,
          lon,
        );
        forecast = await this.weatherService.getForecastByCoordinates(lat, lon);
      }

      // Generate agricultural recommendations based on weather
      const recommendations = this.generateAgricultureRecommendations(
        currentWeather,
        forecast,
        cropType,
      );

      logger.info(
        `Agricultural weather recommendations generated for ${
          city || `${lat},${lon}`
        }`,
      );

      res.status(200).json({
        success: true,
        data: {
          currentWeather,
          forecast,
          recommendations,
        },
      });
    } catch (error) {
      logger.error("Error fetching agricultural weather data:", error);
      next(error);
    }
  };

  // Get weather history for a location
  getWeatherHistory = async (req, res, next) => {
    try {
      const { lat, lon, city, days = 7 } = req.query;

      if (!lat && !lon && !city) {
        throw new AppError(
          "Location parameters are required (lat & lon or city)",
          400,
        );
      }

      const historyData = await this.weatherService.getWeatherHistory(
        city || { lat, lon },
        parseInt(days),
      );

      logger.info(
        `Weather history fetched for ${city || `${lat},${lon}`} - ${days} days`,
      );

      res.status(200).json({
        success: true,
        data: historyData,
      });
    } catch (error) {
      logger.error("Error fetching weather history:", error);
      next(error);
    }
  };

  // Get weather alerts for agriculture
  getWeatherAlerts = async (req, res, next) => {
    try {
      const { lat, lon, city } = req.query;

      if (!lat && !lon && !city) {
        throw new AppError(
          "Location parameters are required (lat & lon or city)",
          400,
        );
      }

      let weatherData;
      if (city) {
        weatherData = await this.weatherService.getWeatherByCity(city);
      } else {
        weatherData = await this.weatherService.getWeatherByCoordinates(
          lat,
          lon,
        );
      }

      const alerts = this.generateWeatherAlerts(weatherData);

      res.status(200).json({
        success: true,
        data: {
          weather: weatherData,
          alerts,
        },
      });
    } catch (error) {
      logger.error("Error fetching weather alerts:", error);
      next(error);
    }
  };

  // Private method to generate agriculture recommendations
  generateAgricultureRecommendations(currentWeather, forecast, cropType) {
    const recommendations = [];

    // Temperature recommendations
    if (currentWeather.temperature > 35) {
      recommendations.push({
        type: "temperature",
        severity: "high",
        message:
          "High temperature detected. Increase irrigation frequency and provide shade for sensitive crops.",
        actions: [
          "Increase watering",
          "Provide shade cover",
          "Harvest early morning",
        ],
      });
    } else if (currentWeather.temperature < 10) {
      recommendations.push({
        type: "temperature",
        severity: "moderate",
        message: "Low temperature warning. Protect crops from frost damage.",
        actions: ["Cover crops", "Use frost protection", "Delay planting"],
      });
    }

    // Humidity recommendations
    if (currentWeather.humidity > 80) {
      recommendations.push({
        type: "humidity",
        severity: "moderate",
        message:
          "High humidity may promote fungal diseases. Monitor crops closely.",
        actions: [
          "Improve ventilation",
          "Apply fungicide",
          "Reduce irrigation",
        ],
      });
    }

    // Wind recommendations
    if (currentWeather.windSpeed > 20) {
      recommendations.push({
        type: "wind",
        severity: "moderate",
        message:
          "Strong winds detected. Secure plant supports and protect young plants.",
        actions: ["Install windbreaks", "Stake tall plants", "Delay spraying"],
      });
    }

    // Precipitation recommendations
    const forecastRain = forecast.list
      ?.slice(0, 3)
      .some((item) => item.weather[0]?.main === "Rain");
    if (forecastRain) {
      recommendations.push({
        type: "precipitation",
        severity: "low",
        message:
          "Rain expected in the next 3 days. Adjust irrigation schedule accordingly.",
        actions: [
          "Reduce watering",
          "Improve drainage",
          "Delay fertilizer application",
        ],
      });
    }

    return recommendations;
  }

  // Private method to generate weather alerts
  generateWeatherAlerts(weatherData) {
    const alerts = [];

    // Extreme temperature alerts
    if (weatherData.temperature > 40) {
      alerts.push({
        type: "extreme_heat",
        severity: "critical",
        message:
          "Extreme heat warning! Immediate action required to protect crops.",
        timestamp: new Date().toISOString(),
      });
    }

    if (weatherData.temperature < 5) {
      alerts.push({
        type: "frost_warning",
        severity: "critical",
        message: "Frost warning! Protect sensitive crops immediately.",
        timestamp: new Date().toISOString(),
      });
    }

    // Storm alerts
    if (weatherData.windSpeed > 30) {
      alerts.push({
        type: "storm_warning",
        severity: "high",
        message: "Strong winds detected! Secure equipment and protect crops.",
        timestamp: new Date().toISOString(),
      });
    }

    return alerts;
  }
}

export default new WeatherController();
