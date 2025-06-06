/**
 * Weather Service
 * Handles weather data fetching from external APIs
 */

import fetch from "node-fetch";
import config from "../config/index.js";
import Weather from "../models/Weather.js";
import { AppError } from "../middleware/errorHandler.js";

class WeatherService {
  constructor() {
    this.apiKey = config.apis.weather.key;
    this.baseUrl = config.apis.weather.baseUrl;
  }

  /**
   * Get weather data by coordinates
   */
  async getWeatherByCoordinates(lat, lon) {
    try {
      // Just use the existing method
      return await this.getCurrentWeather(lat, lon);
    } catch (error) {
      console.error("Get weather by coordinates error:", error.message);
      throw new AppError("Failed to fetch weather data by coordinates", 500);
    }
  }

  /**
   * Get weather data by city
   */
  async getWeatherByCity(city) {
    try {
      // Fetch from external API
      const url = `${this.baseUrl}/current.json?key=${this.apiKey}&q=${encodeURIComponent(
        city
      )}&aqi=no`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data = await response.json();

      // Format the weather data
      const weatherData = {
        location: {
          city: data.location.name,
          coordinates: [data.location.lon, data.location.lat],
          country: data.location.country,
          region: data.location.region,
        },
        current: {
          temperature: data.current.temp_c,
          feelsLike: data.current.feelslike_c,
          humidity: data.current.humidity,
          pressure: data.current.pressure_mb,
          windSpeed: data.current.wind_kph,
          windDirection: data.current.wind_degree,
          visibility: data.current.vis_km,
          description: data.current.condition.text,
          icon: data.current.condition.icon,
        },
        timestamp: new Date(),
      };

      return weatherData;
    } catch (error) {
      console.error("Get weather by city error:", error.message);
      throw new AppError("Failed to fetch weather data by city", 500);
    }
  }

  /**
   * Get current weather data
   */
  async getCurrentWeather(lat, lon, city = null) {
    try {
      // Check if we have recent cached data
      const cachedWeather = await this.getCachedWeather(lat, lon, "current");
      if (cachedWeather) {
        return this.formatWeatherData(cachedWeather);
      }

      // Fetch from external API
      const url = `${this.baseUrl}/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data = await response.json();
      console.log(data);

      // Save to database
      const weatherData = await this.saveWeatherData(
        data,
        lat,
        lon,
        city,
        "current"
      );

      return this.formatWeatherData(weatherData);
    } catch (error) {
      console.error("Get current weather error:", error.message);
      throw new AppError("Failed to fetch current weather data", 500);
    }
  }

  /**
   * Get weather forecast
   */
  async getWeatherForecast(lat, lon, city = null, days = 5) {
    try {
      // Check cached forecast
      const cachedForecast = await this.getCachedWeather(lat, lon, "forecast");
      if (cachedForecast) {
        return this.formatForecastData(cachedForecast);
      }

      // Fetch from external API
      const url = `${this.baseUrl}/forecast?lat=${lat}&lon=${lon}&appid=${
        this.apiKey
      }&units=metric&cnt=${days * 8}`; // 8 forecasts per day (3-hour intervals)
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Weather forecast API error: ${response.status}`);
      }

      const data = await response.json();

      // Save forecast data
      const forecastData = await this.saveForecastData(data, lat, lon, city);

      return this.formatForecastData(forecastData);
    } catch (error) {
      console.error("Get weather forecast error:", error);
      throw new AppError("Failed to fetch weather forecast", 500);
    }
  }

  /**
   * Get weather forecast by city
   */
  async getForecastByCity(city, days = 5) {
    try {
      // Fetch from external API
      const url = `${this.baseUrl}/forecast.json?key=${this.apiKey}&q=${encodeURIComponent(
        city
      )}&days=${days}&aqi=yes&alerts=yes`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data = await response.json();

      // Format the forecast data
      return this.formatAPiForecastData(data);
    } catch (error) {
      console.error("Get forecast by city error:", error.message);
      throw new AppError("Failed to fetch forecast data by city", 500);
    }
  }

  /**
   * Get weather forecast by coordinates
   */
  async getForecastByCoordinates(lat, lon, days = 5) {
    try {
      // Fetch from external API
      const url = `${this.baseUrl}/forecast.json?key=${this.apiKey}&q=${lat},${lon}&days=${days}&aqi=yes&alerts=yes`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data = await response.json();

      // Format the forecast data
      return this.formatAPiForecastData(data);
    } catch (error) {
      console.error("Get forecast by coordinates error:", error.message);
      throw new AppError("Failed to fetch forecast data by coordinates", 500);
    }
  }

  /**
   * Format API forecast data
   */
  formatAPiForecastData(data) {
    return {
      location: {
        city: data.location.name,
        coordinates: [data.location.lon, data.location.lat],
        country: data.location.country,
        region: data.location.region,
      },
      current: {
        temperature: data.current.temp_c,
        feelsLike: data.current.feelslike_c,
        humidity: data.current.humidity,
        pressure: data.current.pressure_mb,
        windSpeed: data.current.wind_kph,
        windDirection: data.current.wind_degree,
        visibility: data.current.vis_km,
        description: data.current.condition.text,
        icon: data.current.condition.icon,
      },
      forecast: data.forecast.forecastday.map((day) => {
        return {
          date: day.date,
          maxTemp: day.day.maxtemp_c,
          minTemp: day.day.mintemp_c,
          avgTemp: day.day.avgtemp_c,
          condition: day.day.condition.text,
          icon: day.day.condition.icon,
          chanceOfRain: day.day.daily_chance_of_rain,
          humidity: day.day.avghumidity,
          windSpeed: day.day.maxwind_kph,
          sunrise: day.astro.sunrise,
          sunset: day.astro.sunset,
        };
      }),
      timestamp: new Date(),
    };
  }

  /**
   * Get agricultural weather analysis
   */
  async getAgriculturalWeatherAnalysis(lat, lon, cropName = null) {
    try {
      const currentWeather = await this.getCurrentWeather(lat, lon);
      const forecast = await this.getWeatherForecast(lat, lon);

      const analysis = {
        current: currentWeather,
        forecast: forecast,
        agricultural: {
          irrigationRecommendation: this.getIrrigationRecommendation(
            currentWeather,
            forecast
          ),
          pestRisk: this.assessPestRisk(currentWeather, forecast),
          plantingConditions: this.assessPlantingConditions(currentWeather),
          harvestConditions: this.assessHarvestConditions(
            currentWeather,
            forecast
          ),
          stressFactors: this.identifyStressFactors(currentWeather, forecast),
        },
      };

      if (cropName) {
        analysis.agricultural.cropSpecificAdvice = this.getCropSpecificAdvice(
          currentWeather,
          forecast,
          cropName
        );
      }

      return analysis;
    } catch (error) {
      console.error("Agricultural weather analysis error:", error);
      throw new AppError(
        "Failed to generate agricultural weather analysis",
        500
      );
    }
  }

  /**
   * Get cached weather data
   */
  async getCachedWeather(lat, lon, type) {
    try {
      const cacheExpiry = type === "current" ? 10 * 60 * 1000 : 60 * 60 * 1000; // 10 min for current, 1 hour for forecast
      const cutoffTime = new Date(Date.now() - cacheExpiry);

      const weather = await Weather.findOne({
        "location.coordinates": {
          $near: {
            $geometry: { type: "Point", coordinates: [lon, lat] },
            $maxDistance: 5000, // 5km radius
          },
        },
        type: type,
        timestamp: { $gte: cutoffTime },
      }).sort({ timestamp: -1 });

      return weather;
    } catch (error) {
      console.error("Get cached weather error:", error);
      return null;
    }
  }

  /**
   * Save weather data to database
   */
  async saveWeatherData(apiData, lat, lon, city, type) {
    try {
      const weatherData = new Weather({
        type: type,
        location: {
          city: city || apiData.name,
          coordinates: [lon, lat],
        },
        current: {
          temperature: apiData.main.temp,
          feelsLike: apiData.main.feels_like,
          humidity: apiData.main.humidity,
          pressure: apiData.main.pressure,
          windSpeed: apiData.wind?.speed || 0,
          windDirection: apiData.wind?.deg || 0,
          visibility: apiData.visibility / 1000, // Convert to km
          uvIndex: apiData.uvi || 0,
          description: apiData.weather[0].description,
          icon: apiData.weather[0].icon,
        },
        agricultural: {
          soilTemperature: this.estimateSoilTemperature(apiData.main.temp),
          evapotranspiration: this.calculateEvapotranspiration(
            apiData.main.temp,
            apiData.main.humidity,
            apiData.wind?.speed || 0
          ),
          growingDegreeDays: this.calculateGrowingDegreeDays(apiData.main.temp),
          stressIndex: this.calculateStressIndex(
            apiData.main.temp,
            apiData.main.humidity
          ),
        },
        timestamp: new Date(),
      });

      await weatherData.save();
      return weatherData;
    } catch (error) {
      console.error("Save weather data error:", error);
      throw error;
    }
  }

  /**
   * Save forecast data
   */
  async saveForecastData(apiData, lat, lon, city) {
    try {
      const forecastData = new Weather({
        type: "forecast",
        location: {
          city: city || apiData.city.name,
          coordinates: [lon, lat],
        },
        forecast: apiData.list.map((item) => ({
          datetime: new Date(item.dt * 1000),
          temperature: item.main.temp,
          feelsLike: item.main.feels_like,
          humidity: item.main.humidity,
          pressure: item.main.pressure,
          windSpeed: item.wind?.speed || 0,
          windDirection: item.wind?.deg || 0,
          precipitation: item.rain?.["3h"] || item.snow?.["3h"] || 0,
          description: item.weather[0].description,
          icon: item.weather[0].icon,
        })),
        timestamp: new Date(),
      });

      await forecastData.save();
      return forecastData;
    } catch (error) {
      console.error("Save forecast data error:", error);
      throw error;
    }
  }

  /**
   * Format weather data for response
   */
  formatWeatherData(weatherData) {
    return {
      location: weatherData.location,
      current: weatherData.current,
      agricultural: weatherData.agricultural,
      timestamp: weatherData.timestamp,
    };
  }

  /**
   * Format forecast data for response
   */
  formatForecastData(forecastData) {
    return {
      location: forecastData.location,
      forecast: forecastData.forecast,
      timestamp: forecastData.timestamp,
    };
  }

  /**
   * Agricultural analysis methods
   */

  getIrrigationRecommendation(current, forecast) {
    const humidity = current.current.humidity;
    const upcomingRain = forecast.forecast
      .slice(0, 8)
      .some((f) => f.precipitation > 0); // Next 24 hours

    if (humidity < 40 && !upcomingRain) {
      return {
        level: "high",
        message: "Low humidity and no rain expected. Increase irrigation.",
      };
    } else if (humidity < 60 && !upcomingRain) {
      return { level: "medium", message: "Moderate irrigation needed." };
    } else if (upcomingRain) {
      return {
        level: "low",
        message: "Rain expected. Reduce or postpone irrigation.",
      };
    }
    return { level: "normal", message: "Normal irrigation schedule." };
  }

  assessPestRisk(current, forecast) {
    const temp = current.current.temperature;
    const humidity = current.current.humidity;

    if (temp > 25 && temp < 30 && humidity > 70) {
      return {
        level: "high",
        message: "Optimal conditions for pest development. Monitor closely.",
      };
    } else if (temp > 20 && temp < 35 && humidity > 60) {
      return {
        level: "medium",
        message: "Moderate pest risk. Regular monitoring recommended.",
      };
    }
    return { level: "low", message: "Low pest risk under current conditions." };
  }

  assessPlantingConditions(current) {
    const temp = current.current.temperature;
    const humidity = current.current.humidity;

    if (temp >= 15 && temp <= 30 && humidity >= 50 && humidity <= 80) {
      return { suitable: true, message: "Good conditions for planting." };
    }
    return {
      suitable: false,
      message: "Consider waiting for better planting conditions.",
    };
  }

  assessHarvestConditions(current, forecast) {
    const nextDays = forecast.forecast.slice(0, 16); // Next 48 hours
    const rainExpected = nextDays.some((f) => f.precipitation > 2);

    if (!rainExpected && current.current.humidity < 70) {
      return { suitable: true, message: "Good harvest conditions." };
    }
    return {
      suitable: false,
      message: "Wait for drier conditions for harvesting.",
    };
  }

  identifyStressFactors(current, forecast) {
    const factors = [];
    const temp = current.current.temperature;
    const humidity = current.current.humidity;

    if (temp > 35) factors.push("High temperature stress");
    if (temp < 10) factors.push("Cold stress");
    if (humidity < 30) factors.push("Low humidity stress");
    if (humidity > 90) factors.push("High humidity stress");
    if (current.current.windSpeed > 15) factors.push("Wind stress");

    return factors;
  }

  getCropSpecificAdvice(current, forecast, cropName) {
    // Simplified crop-specific logic
    const temp = current.current.temperature;
    const humidity = current.current.humidity;

    const advice = [];

    if (cropName.toLowerCase().includes("rice")) {
      if (humidity < 70)
        advice.push("Rice requires high humidity. Increase irrigation.");
      if (temp > 32) advice.push("High temperature may affect rice flowering.");
    } else if (cropName.toLowerCase().includes("wheat")) {
      if (temp > 25) advice.push("High temperature may reduce wheat yield.");
      if (humidity > 80)
        advice.push("High humidity increases disease risk in wheat.");
    }

    return advice;
  }

  /**
   * Agricultural calculation methods
   */

  estimateSoilTemperature(airTemp) {
    // Simplified soil temperature estimation
    return airTemp - 2; // Soil is typically 2°C cooler than air
  }

  calculateEvapotranspiration(temp, humidity, windSpeed) {
    // Validate inputs
    if (
      temp < -50 ||
      temp > 60 ||
      humidity < 0 ||
      humidity > 100 ||
      windSpeed < 0
    ) {
      return 0; // Return default for invalid inputs
    }

    // Simplified Penman equation
    const delta =
      (4098 * (0.6108 * Math.exp((17.27 * temp) / (temp + 237.3)))) /
      Math.pow(temp + 237.3, 2);
    const gamma = 0.665;
    const u2 = (windSpeed * 4.87) / Math.log(67.8 * 10 - 5.42);

    const et0 =
      (0.408 * delta * temp +
        ((gamma * 900) / (temp + 273)) * u2 * (0.01 * (100 - humidity))) /
      (delta + gamma * (1 + 0.34 * u2));

    return isNaN(et0) || !isFinite(et0) ? 0 : Math.max(0, et0);
  }

  calculateGrowingDegreeDays(temp, baseTemp = 10) {
    return Math.max(0, temp - baseTemp);
  }

  calculateStressIndex(temp, humidity) {
    // Temperature-Humidity Index
    const thi = temp - (0.55 - 0.0055 * humidity) * (temp - 14.5);

    if (thi < 72) return "none";
    if (thi < 79) return "mild";
    if (thi < 89) return "moderate";
    return "severe";
  }

  /**
   * Get location name from coordinates
   */
  async getLocationName(lat, lon) {
    try {
      const url = `https://api.weatherapi.com/v1/search.json?key=${this.apiKey}&q=${lat},${lon}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.length > 0) {
        return {
          name: data[0].name,
          region: data[0].region,
          country: data[0].country,
        };
      } else {
        return {
          name: "Unknown Location",
          region: "",
          country: "",
        };
      }
    } catch (error) {
      console.error("Get location name error:", error.message);
      throw new AppError("Failed to get location name", 500);
    }
  }
}

export default new WeatherService();
