import mongoose from "mongoose";

const cropSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Crop name is required"],
      trim: true,
    },
    scientificName: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Crop category is required"],
      enum: [
        "cereal",
        "pulse",
        "oilseed",
        "vegetable",
        "fruit",
        "spice",
        "cash_crop",
        "fodder",
      ],
      trim: true,
    },
    variety: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    images: [
      {
        url: String,
        caption: String,
        isPrimary: {
          type: Boolean,
          default: false,
        },
      },
    ],
    growingConditions: {
      climate: {
        type: String,
        enum: ["tropical", "subtropical", "temperate", "arid", "semi-arid"],
        required: true,
      },
      soilType: [
        {
          type: String,
          enum: ["clay", "sandy", "loamy", "silty", "peaty", "chalky"],
        },
      ],
      soilPH: {
        min: {
          type: Number,
          min: 0,
          max: 14,
        },
        max: {
          type: Number,
          min: 0,
          max: 14,
        },
      },
      temperature: {
        min: Number, // in Celsius
        max: Number,
        optimal: Number,
      },
      rainfall: {
        min: Number, // in mm
        max: Number,
        optimal: Number,
      },
      humidity: {
        min: Number, // percentage
        max: Number,
        optimal: Number,
      },
      sunlight: {
        type: String,
        enum: ["full_sun", "partial_sun", "partial_shade", "full_shade"],
        default: "full_sun",
      },
    },
    cultivation: {
      season: {
        planting: {
          type: String,
          enum: ["kharif", "rabi", "zaid", "year_round"],
        },
        months: [
          {
            type: String,
            enum: [
              "jan",
              "feb",
              "mar",
              "apr",
              "may",
              "jun",
              "jul",
              "aug",
              "sep",
              "oct",
              "nov",
              "dec",
            ],
          },
        ],
      },
      seedRate: {
        value: Number,
        unit: {
          type: String,
          enum: ["kg_per_hectare", "grams_per_square_meter", "seeds_per_hill"],
          default: "kg_per_hectare",
        },
      },
      spacing: {
        rowToRow: Number, // in cm
        plantToPlant: Number, // in cm
      },
      depth: {
        value: Number, // in cm
        description: String,
      },
      growthDuration: {
        min: Number, // in days
        max: Number,
        typical: Number,
      },
      irrigationSchedule: [
        {
          stage: String,
          frequency: String,
          amount: Number, // in mm or liters
        },
      ],
      fertilizer: {
        organic: [
          {
            name: String,
            quantity: String,
            timing: String,
          },
        ],
        chemical: [
          {
            name: String,
            npk: String,
            quantity: String,
            timing: String,
          },
        ],
      },
      pestManagement: {
        commonPests: [
          {
            name: String,
            symptoms: String,
            organicControl: [String],
            chemicalControl: [String],
          },
        ],
        commonDiseases: [
          {
            name: String,
            symptoms: String,
            prevention: [String],
            treatment: [String],
          },
        ],
      },
    },
    harvest: {
      indicators: [String],
      method: String,
      timing: String,
      expectedYield: {
        min: Number,
        max: Number,
        unit: {
          type: String,
          enum: ["tons_per_hectare", "kg_per_plant", "quintals_per_acre"],
          default: "tons_per_hectare",
        },
      },
      postHarvest: {
        storage: [String],
        processing: [String],
        marketPreparation: [String],
      },
    },
    nutrition: {
      soilBenefits: [String],
      cropRotation: {
        goodPredecessors: [String],
        goodSuccessors: [String],
        avoidAfter: [String],
      },
      companionPlants: [String],
      nitrogenFixing: {
        type: Boolean,
        default: false,
      },
    },
    economics: {
      costOfCultivation: {
        seeds: Number,
        fertilizers: Number,
        pesticides: Number,
        labor: Number,
        irrigation: Number,
        machinery: Number,
        total: Number,
        currency: {
          type: String,
          default: "INR",
        },
      },
      marketPrice: {
        min: Number,
        max: Number,
        average: Number,
        currency: {
          type: String,
          default: "INR",
        },
        unit: String,
        lastUpdated: {
          type: Date,
          default: Date.now,
        },
      },
      profitability: {
        roi: Number, // Return on Investment percentage
        breakeven: Number, // in days or quantity
      },
    },
    sustainability: {
      carbonFootprint: {
        value: Number,
        unit: String,
      },
      waterUsage: {
        value: Number,
        unit: String,
      },
      biodiversityImpact: {
        type: String,
        enum: ["positive", "neutral", "negative"],
      },
      soilHealth: {
        type: String,
        enum: ["improves", "maintains", "degrades"],
      },
    },
    regions: [
      {
        country: String,
        states: [String],
        districts: [String],
      },
    ],
    certifications: [
      {
        type: String,
        authority: String,
        validUntil: Date,
      },
    ],
    metadata: {
      source: String,
      lastVerified: {
        type: Date,
        default: Date.now,
      },
      verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      reliability: {
        type: Number,
        min: 0,
        max: 100,
        default: 50,
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
cropSchema.index({ name: 1 });
cropSchema.index({ category: 1 });
cropSchema.index({ "cultivation.season.planting": 1 });
cropSchema.index({ "growingConditions.climate": 1 });
cropSchema.index({ "regions.country": 1, "regions.states": 1 });
cropSchema.index({ isActive: 1 });

// Virtual for full name with variety
cropSchema.virtual("fullName").get(function () {
  return this.variety ? `${this.name} (${this.variety})` : this.name;
});

// Static method to find crops by region
cropSchema.statics.findByRegion = function (
  country,
  state = null,
  district = null
) {
  const query = { "regions.country": country };
  if (state) query["regions.states"] = state;
  if (district) query["regions.districts"] = district;
  return this.find(query);
};

// Static method to find crops by season
cropSchema.statics.findBySeason = function (season, month = null) {
  const query = { "cultivation.season.planting": season };
  if (month) query["cultivation.season.months"] = month;
  return this.find(query);
};

// Static method to find compatible crops for rotation
cropSchema.statics.findRotationPartners = function (cropId) {
  return this.findById(cropId).then((crop) => {
    if (!crop) return [];
    const successors = crop?.nutrition?.cropRotation?.goodSuccessors || [];
    if (successors.length === 0) return [];
    return this.find({ name: { $in: successors } });
  });
};

// Static method to get crop recommendations based on conditions
cropSchema.statics.getRecommendations = function (conditions) {
  const query = { isActive: true };

  if (conditions.climate) {
    query["growingConditions.climate"] = conditions.climate;
  }

  if (conditions.soilType) {
    query["growingConditions.soilType"] = { $in: [conditions.soilType] };
  }

  if (conditions.season) {
    query["cultivation.season.planting"] = conditions.season;
  }

  if (conditions.month) {
    query["cultivation.season.months"] = { $in: [conditions.month] };
  }

  return this.find(query).sort({ "metadata.reliability": -1 }).limit(10);
};

// Instance method to check if crop is suitable for conditions
cropSchema.methods.isSuitableFor = function (conditions) {
  const suitable = {
    climate: false,
    soil: false,
    season: false,
    overall: false,
  };

  // Check climate suitability
  if (this.growingConditions.climate === conditions.climate) {
    suitable.climate = true;
  }

  // Check soil suitability
  if (this.growingConditions.soilType.includes(conditions.soilType)) {
    suitable.soil = true;
  }

  // Check season suitability
  if (
    this.cultivation.season.planting === conditions.season ||
    this.cultivation.season.months.includes(conditions.month)
  ) {
    suitable.season = true;
  }

  // Overall suitability (at least 2 out of 3 conditions should match)
  const score = [suitable.climate, suitable.soil, suitable.season].filter(
    Boolean
  ).length;
  suitable.overall = score >= 2;

  return suitable;
};

export default mongoose.model("Crop", cropSchema);
