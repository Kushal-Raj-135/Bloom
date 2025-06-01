import mongoose from "mongoose";

const weatherSchema = new mongoose.Schema(
  {
    location: {
      name: {
        type: String,
        required: true,
      },
      coordinates: {
        latitude: {
          type: Number,
          required: true,
          min: -90,
          max: 90,
        },
        longitude: {
          type: Number,
          required: true,
          min: -180,
          max: 180,
        },
      },
      country: String,
      region: String,
    },
    current: {
      temperature: {
        celsius: Number,
        fahrenheit: Number,
      },
      humidity: {
        type: Number,
        min: 0,
        max: 100,
      },
      pressure: Number, // in hPa
      windSpeed: Number, // in km/h
      windDirection: Number, // in degrees
      windGust: Number,
      visibility: Number, // in km
      uvIndex: {
        type: Number,
        min: 0,
        max: 11,
      },
      condition: {
        text: String,
        icon: String,
        code: Number,
      },
      feelsLike: {
        celsius: Number,
        fahrenheit: Number,
      },
      cloudCover: {
        type: Number,
        min: 0,
        max: 100,
      },
      precipitation: {
        mm: Number,
        inches: Number,
      },
      dewPoint: Number,
      heatIndex: Number,
      windChill: Number,
    },
    forecast: [
      {
        date: {
          type: Date,
          required: true,
        },
        day: {
          maxTemp: {
            celsius: Number,
            fahrenheit: Number,
          },
          minTemp: {
            celsius: Number,
            fahrenheit: Number,
          },
          avgTemp: {
            celsius: Number,
            fahrenheit: Number,
          },
          maxWind: Number,
          totalPrecipitation: {
            mm: Number,
            inches: Number,
          },
          avgHumidity: Number,
          condition: {
            text: String,
            icon: String,
            code: Number,
          },
          uvIndex: Number,
          sunrise: String,
          sunset: String,
          moonPhase: String,
          moonIllumination: Number,
        },
        hourly: [
          {
            time: String,
            temperature: {
              celsius: Number,
              fahrenheit: Number,
            },
            condition: {
              text: String,
              icon: String,
              code: Number,
            },
            humidity: Number,
            windSpeed: Number,
            windDirection: Number,
            pressure: Number,
            precipitation: {
              mm: Number,
              inches: Number,
            },
            cloudCover: Number,
            feelsLike: {
              celsius: Number,
              fahrenheit: Number,
            },
            uvIndex: Number,
            visibility: Number,
          },
        ],
      },
    ],
    alerts: [
      {
        type: {
          type: String,
          enum: ["warning", "watch", "advisory"],
          required: true,
        },
        severity: {
          type: String,
          enum: ["minor", "moderate", "severe", "extreme"],
          required: true,
        },
        event: String,
        headline: String,
        description: String,
        instruction: String,
        areas: [String],
        effective: Date,
        expires: Date,
        certainty: {
          type: String,
          enum: ["observed", "likely", "possible", "unlikely"],
        },
      },
    ],
    agriculture: {
      soilTemperature: {
        surface: Number,
        depth10cm: Number,
        depth50cm: Number,
        depth100cm: Number,
      },
      soilMoisture: {
        surface: Number,
        depth10cm: Number,
        depth50cm: Number,
        depth100cm: Number,
      },
      evapotranspiration: Number,
      growingDegreeDays: Number,
      frost: {
        risk: {
          type: String,
          enum: ["none", "low", "moderate", "high"],
        },
        temperature: Number,
        probability: Number,
      },
      cropStress: {
        heat: {
          type: String,
          enum: ["none", "low", "moderate", "high", "extreme"],
        },
        moisture: {
          type: String,
          enum: ["none", "low", "moderate", "high", "extreme"],
        },
      },
    },
    airQuality: {
      aqi: Number,
      pollutants: {
        pm25: Number,
        pm10: Number,
        o3: Number,
        no2: Number,
        so2: Number,
        co: Number,
      },
      healthIndex: {
        type: String,
        enum: [
          "good",
          "moderate",
          "unhealthy_sensitive",
          "unhealthy",
          "very_unhealthy",
          "hazardous",
        ],
      },
      recommendations: [String],
    },
    dataSource: {
      provider: {
        type: String,
        required: true,
      },
      apiVersion: String,
      lastUpdated: {
        type: Date,
        default: Date.now,
      },
      refreshInterval: {
        type: Number,
        default: 3600, // in seconds
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
weatherSchema.index({ "location.coordinates": "2dsphere" });
weatherSchema.index({ "location.name": 1 });
weatherSchema.index({ "forecast.date": 1 });
weatherSchema.index({ "dataSource.lastUpdated": 1 });

// TTL index to automatically delete old weather data after 7 days
weatherSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7 * 24 * 60 * 60 });

// Virtual for weather summary
weatherSchema.virtual("summary").get(function () {
  if (!this.current) return "No data available";

  const temp = this.current.temperature.celsius;
  const condition = this.current.condition.text;
  return `${temp}°C, ${condition}`;
});

// Static method to find weather by location
weatherSchema.statics.findByLocation = function (coordinates, radius = 5) {
  return this.findOne({
    "location.coordinates": {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [coordinates.longitude, coordinates.latitude],
        },
        $maxDistance: radius * 1000, // Convert km to meters
      },
    },
    isActive: true,
  }).sort({ "dataSource.lastUpdated": -1 });
};

// Static method to find recent weather data
weatherSchema.statics.findRecent = function (locationName, hours = 24) {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);
  return this.find({
    "location.name": locationName,
    createdAt: { $gte: since },
    isActive: true,
  }).sort({ createdAt: -1 });
};

// Static method to get weather alerts for region
weatherSchema.statics.getActiveAlerts = function (region) {
  const now = new Date();
  return this.find({
    "location.region": region,
    "alerts.effective": { $lte: now },
    "alerts.expires": { $gte: now },
    isActive: true,
  }).select("location alerts");
};

// Instance method to check if data is stale
weatherSchema.methods.isStale = function (maxAgeMinutes = 60) {
  const maxAge = maxAgeMinutes * 60 * 1000; // Convert to milliseconds
  const dataAge = Date.now() - this.dataSource.lastUpdated.getTime();
  return dataAge > maxAge;
};

// Instance method to get forecast for specific date
weatherSchema.methods.getForecastForDate = function (date) {
  const targetDate = new Date(date).toDateString();
  return this.forecast.find(
    (f) => new Date(f.date).toDateString() === targetDate
  );
};

// Instance method to get agricultural recommendations
weatherSchema.methods.getAgriculturalAdvice = function () {
  const advice = [];

  if (!this.current) return advice;

  // Temperature advice
  if (this.current.temperature.celsius > 35) {
    advice.push({
      type: "warning",
      category: "temperature",
      message:
        "High temperature detected. Increase irrigation frequency and provide shade for sensitive crops.",
    });
  } else if (this.current.temperature.celsius < 5) {
    advice.push({
      type: "warning",
      category: "temperature",
      message: "Low temperature alert. Protect crops from frost damage.",
    });
  }

  // Precipitation advice
  if (this.current.precipitation && this.current.precipitation.mm > 50) {
    advice.push({
      type: "info",
      category: "precipitation",
      message:
        "Heavy rainfall detected. Monitor for waterlogging and adjust irrigation schedule.",
    });
  }

  // Wind advice
  if (this.current.windSpeed > 25) {
    advice.push({
      type: "warning",
      category: "wind",
      message:
        "Strong winds detected. Secure tall crops and greenhouse structures.",
    });
  }

  // Humidity advice
  if (this.current.humidity > 85) {
    advice.push({
      type: "warning",
      category: "humidity",
      message:
        "High humidity may increase disease risk. Monitor crops for fungal infections.",
    });
  }

  // UV advice
  if (this.current.uvIndex > 8) {
    advice.push({
      type: "info",
      category: "uv",
      message: "High UV index. Consider protective measures for field workers.",
    });
  }

  return advice;
};

// Instance method to calculate crop stress levels
weatherSchema.methods.calculateCropStress = function () {
  if (!this.current) return null;

  const stress = {
    overall: "low",
    factors: [],
  };

  let stressScore = 0;

  // Temperature stress
  const temp = this.current.temperature.celsius;
  if (temp > 40 || temp < 0) {
    stressScore += 3;
    stress.factors.push("extreme_temperature");
  } else if (temp > 35 || temp < 5) {
    stressScore += 2;
    stress.factors.push("high_temperature");
  }

  // Moisture stress
  if (this.current.humidity < 30) {
    stressScore += 2;
    stress.factors.push("low_humidity");
  } else if (this.current.humidity > 85) {
    stressScore += 1;
    stress.factors.push("high_humidity");
  }

  // Wind stress
  if (this.current.windSpeed > 30) {
    stressScore += 2;
    stress.factors.push("strong_winds");
  }

  // Overall stress level
  if (stressScore >= 5) stress.overall = "extreme";
  else if (stressScore >= 3) stress.overall = "high";
  else if (stressScore >= 1) stress.overall = "moderate";

  return stress;
};

export default mongoose.model("Weather", weatherSchema);
