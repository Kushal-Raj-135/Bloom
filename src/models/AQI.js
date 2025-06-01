import mongoose from "mongoose";

const aqiSchema = new mongoose.Schema(
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
      state: String,
      city: String,
      station: {
        name: String,
        code: String,
        type: {
          type: String,
          enum: ["government", "private", "mobile"],
        },
      },
    },
    aqi: {
      value: {
        type: Number,
        required: true,
        min: 0,
        max: 500,
      },
      category: {
        type: String,
        enum: [
          "good",
          "moderate",
          "unhealthy_sensitive",
          "unhealthy",
          "very_unhealthy",
          "hazardous",
        ],
        required: true,
      },
      color: {
        type: String,
        enum: ["green", "yellow", "orange", "red", "purple", "maroon"],
      },
      description: String,
    },
    pollutants: {
      pm25: {
        value: Number,
        unit: {
          type: String,
          default: "µg/m³",
        },
        aqi: Number,
      },
      pm10: {
        value: Number,
        unit: {
          type: String,
          default: "µg/m³",
        },
        aqi: Number,
      },
      o3: {
        value: Number,
        unit: {
          type: String,
          default: "µg/m³",
        },
        aqi: Number,
      },
      no2: {
        value: Number,
        unit: {
          type: String,
          default: "µg/m³",
        },
        aqi: Number,
      },
      so2: {
        value: Number,
        unit: {
          type: String,
          default: "µg/m³",
        },
        aqi: Number,
      },
      co: {
        value: Number,
        unit: {
          type: String,
          default: "mg/m³",
        },
        aqi: Number,
      },
      dominantPollutant: {
        type: String,
        enum: ["pm25", "pm10", "o3", "no2", "so2", "co"],
      },
    },
    healthRecommendations: {
      general: [String],
      sensitive: [String],
      outdoor: [String],
      agricultural: [String],
    },
    forecast: [
      {
        date: {
          type: Date,
          required: true,
        },
        aqi: {
          min: Number,
          max: Number,
          avg: Number,
        },
        category: {
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
        dominantPollutant: {
          type: String,
          enum: ["pm25", "pm10", "o3", "no2", "so2", "co"],
        },
      },
    ],
    historical: {
      lastWeek: {
        avg: Number,
        min: Number,
        max: Number,
      },
      lastMonth: {
        avg: Number,
        min: Number,
        max: Number,
      },
      lastYear: {
        avg: Number,
        min: Number,
        max: Number,
      },
    },
    trends: {
      hourly: [
        {
          time: Date,
          aqi: Number,
          trend: {
            type: String,
            enum: ["improving", "stable", "worsening"],
          },
        },
      ],
      daily: [
        {
          date: Date,
          aqi: Number,
          trend: {
            type: String,
            enum: ["improving", "stable", "worsening"],
          },
        },
      ],
    },
    meteorology: {
      temperature: Number,
      humidity: Number,
      windSpeed: Number,
      windDirection: Number,
      pressure: Number,
      visibility: Number,
    },
    agriculture: {
      cropImpact: {
        level: {
          type: String,
          enum: ["minimal", "low", "moderate", "high", "severe"],
        },
        affectedCrops: [String],
        recommendations: [String],
      },
      soilImpact: {
        acidification: {
          type: String,
          enum: ["none", "low", "moderate", "high"],
        },
        nutrientDepletion: {
          type: String,
          enum: ["none", "low", "moderate", "high"],
        },
        recommendations: [String],
      },
      irrigation: {
        adjustments: [String],
        timing: [String],
      },
    },
    alerts: [
      {
        type: {
          type: String,
          enum: ["health", "agricultural", "environmental"],
          required: true,
        },
        severity: {
          type: String,
          enum: ["low", "moderate", "high", "critical"],
          required: true,
        },
        message: {
          type: String,
          required: true,
        },
        actions: [String],
        validUntil: Date,
        isActive: {
          type: Boolean,
          default: true,
        },
      },
    ],
    dataSource: {
      provider: {
        type: String,
        required: true,
        enum: ["government", "waqi", "iqair", "openweather", "manual"],
      },
      stationId: String,
      dataQuality: {
        type: String,
        enum: ["excellent", "good", "fair", "poor"],
        default: "good",
      },
      lastUpdated: {
        type: Date,
        default: Date.now,
      },
      updateFrequency: {
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
  },
);

// Indexes for better performance
aqiSchema.index({ "location.coordinates": "2dsphere" });
aqiSchema.index({ "location.city": 1 });
aqiSchema.index({ "aqi.value": 1 });
aqiSchema.index({ "aqi.category": 1 });
aqiSchema.index({ "dataSource.lastUpdated": 1 });

// TTL index to automatically delete old AQI data after 30 days
aqiSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

// Virtual for AQI status summary
aqiSchema.virtual("status").get(function () {
  return {
    value: this.aqi.value,
    category: this.aqi.category,
    color: this.aqi.color,
    description: this.aqi.description,
  };
});

// Static method to get AQI category from value
aqiSchema.statics.getAQICategory = function (aqiValue) {
  if (aqiValue <= 50) return { category: "good", color: "green" };
  if (aqiValue <= 100) return { category: "moderate", color: "yellow" };
  if (aqiValue <= 150)
    return { category: "unhealthy_sensitive", color: "orange" };
  if (aqiValue <= 200) return { category: "unhealthy", color: "red" };
  if (aqiValue <= 300) return { category: "very_unhealthy", color: "purple" };
  return { category: "hazardous", color: "maroon" };
};

// Static method to find AQI by location
aqiSchema.statics.findByLocation = function (coordinates, radius = 10) {
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

// Static method to get recent AQI data
aqiSchema.statics.findRecent = function (city, hours = 24) {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);
  return this.find({
    "location.city": city,
    createdAt: { $gte: since },
    isActive: true,
  }).sort({ createdAt: -1 });
};

// Static method to get active alerts
aqiSchema.statics.getActiveAlerts = function (city) {
  const now = new Date();
  return this.find({
    "location.city": city,
    "alerts.validUntil": { $gte: now },
    "alerts.isActive": true,
    isActive: true,
  }).select("location alerts");
};

// Instance method to check if data is stale
aqiSchema.methods.isStale = function (maxAgeMinutes = 60) {
  const maxAge = maxAgeMinutes * 60 * 1000;
  const dataAge = Date.now() - this.dataSource.lastUpdated.getTime();
  return dataAge > maxAge;
};

// Instance method to get health recommendations based on AQI
aqiSchema.methods.getHealthRecommendations = function (userProfile = {}) {
  const recommendations = [];
  const aqiValue = this.aqi.value;
  const isSensitive = userProfile.isSensitive || false;

  if (aqiValue <= 50) {
    recommendations.push("Air quality is good. Enjoy outdoor activities!");
  } else if (aqiValue <= 100) {
    recommendations.push(
      "Air quality is moderate. Sensitive individuals should consider limiting prolonged outdoor exertion.",
    );
    if (isSensitive) {
      recommendations.push(
        "Consider wearing a mask during outdoor activities.",
      );
    }
  } else if (aqiValue <= 150) {
    recommendations.push(
      "Unhealthy for sensitive groups. Everyone should limit prolonged outdoor exertion.",
    );
    recommendations.push("Wear N95 masks when outdoors.");
    if (isSensitive) {
      recommendations.push(
        "Avoid outdoor activities or limit them significantly.",
      );
    }
  } else if (aqiValue <= 200) {
    recommendations.push(
      "Unhealthy air quality. Everyone should limit outdoor activities.",
    );
    recommendations.push("Wear N95 or equivalent masks when outdoors.");
    recommendations.push("Keep windows closed and use air purifiers indoors.");
  } else if (aqiValue <= 300) {
    recommendations.push(
      "Very unhealthy air quality. Avoid all outdoor activities.",
    );
    recommendations.push("Stay indoors with air purifiers running.");
    recommendations.push("Wear N95 masks even for brief outdoor exposure.");
  } else {
    recommendations.push(
      "Hazardous air quality. Emergency conditions - avoid all outdoor exposure.",
    );
    recommendations.push("Stay indoors with air purifiers and sealed windows.");
    recommendations.push("Consider evacuation if possible.");
  }

  return recommendations;
};

// Instance method to get agricultural impact assessment
aqiSchema.methods.getAgriculturalImpact = function () {
  const aqiValue = this.aqi.value;
  const impact = {
    level: "minimal",
    effects: [],
    recommendations: [],
  };

  if (aqiValue > 150) {
    impact.level = "high";
    impact.effects.push("Reduced photosynthesis due to air pollution");
    impact.effects.push("Potential leaf damage from particulate matter");
    impact.recommendations.push(
      "Increase irrigation to help plants cope with stress",
    );
    impact.recommendations.push(
      "Consider protective measures for sensitive crops",
    );

    if (
      this.pollutants &&
      this.pollutants.so2 &&
      this.pollutants.so2.value > 80
    ) {
      impact.effects.push("Soil acidification risk");
      impact.recommendations.push("Monitor soil pH levels regularly");
    }

    if (
      this.pollutants &&
      this.pollutants.o3 &&
      this.pollutants.o3.value > 100
    ) {
      impact.effects.push("Ozone damage to plant leaves");
      impact.recommendations.push(
        "Avoid working in fields during peak ozone hours (midday)",
      );
    }
  } else if (aqiValue > 100) {
    impact.level = "moderate";
    impact.effects.push("Slight reduction in plant growth rate");
    impact.recommendations.push("Monitor crops for signs of stress");
    impact.recommendations.push("Adjust irrigation schedule if needed");
  } else if (aqiValue > 50) {
    impact.level = "low";
    impact.recommendations.push("Continue normal farming practices");
    impact.recommendations.push("Monitor air quality trends");
  }

  return impact;
};

// Instance method to calculate trend
aqiSchema.methods.calculateTrend = function (hours = 24) {
  if (!this.trends.hourly || this.trends.hourly.length < 2) {
    return "stable";
  }

  const recentData = this.trends.hourly
    .filter((t) => t.time >= new Date(Date.now() - hours * 60 * 60 * 1000))
    .sort((a, b) => a.time - b.time);

  if (recentData.length < 2) return "stable";

  const first = recentData[0].aqi;
  const last = recentData[recentData.length - 1].aqi;
  const change = last - first;
  const percentChange = (change / first) * 100;

  if (percentChange > 10) return "worsening";
  if (percentChange < -10) return "improving";
  return "stable";
};

export default mongoose.model("AQI", aqiSchema);
