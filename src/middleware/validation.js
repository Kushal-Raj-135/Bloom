/**
 * Validation Middleware
 * Handles request data validation using joi
 */

import Joi from "joi";

/**
 * Generic validation middleware factory
 */
export const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.details.map((detail) => ({
          field: detail.path.join("."),
          message: detail.message,
        })),
      });
    }
    next();
  };
};

/**
 * Validation schemas
 */

// User registration validation
export const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string()
    .min(8)
    .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])"))
    .required()
    .messages({
      "string.pattern.base":
        "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character",
    }),
});

// User login validation
export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// Password reset validation
export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

export const resetPasswordSchema = Joi.object({
  password: Joi.string()
    .min(8)
    .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])"))
    .required()
    .messages({
      "string.pattern.base":
        "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character",
    }),
});

// Profile update validation
export const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(50),
  "profile.phone": Joi.string().pattern(/^[0-9+\-\s()]+$/),
  "profile.location.address": Joi.string().max(200),
  "profile.location.city": Joi.string().max(50),
  "profile.location.state": Joi.string().max(50),
  "profile.location.country": Joi.string().max(50),
  "profile.location.pincode": Joi.string().max(10),
  "profile.bio": Joi.string().max(500),
  "preferences.language": Joi.string().valid("en", "hi", "kn"),
  "preferences.units": Joi.string().valid("metric", "imperial"),
  "preferences.notifications.email": Joi.boolean(),
  "preferences.notifications.push": Joi.boolean(),
});

// Crop recommendations validation
export const cropRecommendationsSchema = Joi.object({
  previousCrop: Joi.string().min(2).max(50).required(),
  soilType: Joi.string()
    .valid(
      "sandy",
      "clay",
      "loam",
      "silt",
      "peat",
      "chalk",
      "red",
      "black",
      "alluvial"
    )
    .required(),
  region: Joi.string().min(2).max(100).required(),
  farmSize: Joi.number().positive().required(),
});

// Crop analysis validation
export const cropAnalysisSchema = Joi.object({
  cropName: Joi.string().min(2).max(50).required(),
  location: Joi.string().min(2).max(100).required(),
  coordinates: Joi.object({
    lat: Joi.number().min(-90).max(90),
    lon: Joi.number().min(-180).max(180),
  }),
});

// Add crop validation
export const addCropSchema = Joi.object({
  cropName: Joi.string().min(2).max(50).required(),
  soilType: Joi.string()
    .valid(
      "sandy",
      "clay",
      "loam",
      "silt",
      "peat",
      "chalk",
      "red",
      "black",
      "alluvial"
    )
    .required(),
  region: Joi.string().min(2).max(100).required(),
  farmSize: Joi.number().positive(),
  plantingDate: Joi.date(),
  expectedHarvestDate: Joi.date().greater(Joi.ref("plantingDate")),
  variety: Joi.string().max(50),
  notes: Joi.string().max(500),
});

// Weather query validation
export const weatherQuerySchema = Joi.object({
  lat: Joi.number().min(-90).max(90).required(),
  lon: Joi.number().min(-180).max(180).required(),
  city: Joi.string().max(50),
});

// AQI query validation
export const aqiQuerySchema = Joi.object({
  lat: Joi.number().min(-90).max(90).required(),
  lon: Joi.number().min(-180).max(180).required(),
  city: Joi.string().max(50),
});

// Weather validation schemas
export const weatherValidation = {
  locationParams: Joi.object({
    lat: Joi.number().min(-90).max(90),
    lon: Joi.number().min(-180).max(180),
    city: Joi.string().min(1).max(100),
  })
    .or("lat", "city")
    .with("lat", "lon"),

  agricultureParams: Joi.object({
    lat: Joi.number().min(-90).max(90),
    lon: Joi.number().min(-180).max(180),
    city: Joi.string().min(1).max(100),
    cropType: Joi.string().min(2).max(50),
  })
    .or("lat", "city")
    .with("lat", "lon"),

  historyParams: Joi.object({
    lat: Joi.number().min(-90).max(90),
    lon: Joi.number().min(-180).max(180),
    city: Joi.string().min(1).max(100),
    days: Joi.number().integer().min(1).max(30).default(7),
  })
    .or("lat", "city")
    .with("lat", "lon"),
};

// AQI validation schemas
export const aqiValidation = {
  locationParams: Joi.object({
    lat: Joi.number().min(-90).max(90),
    lon: Joi.number().min(-180).max(180),
    city: Joi.string().min(1).max(100),
  })
    .or("lat", "city")
    .with("lat", "lon"),

  agricultureParams: Joi.object({
    lat: Joi.number().min(-90).max(90),
    lon: Joi.number().min(-180).max(180),
    city: Joi.string().min(1).max(100),
    cropType: Joi.string().min(2).max(50),
  })
    .or("lat", "city")
    .with("lat", "lon"),

  historyParams: Joi.object({
    lat: Joi.number().min(-90).max(90),
    lon: Joi.number().min(-180).max(180),
    city: Joi.string().min(1).max(100),
    days: Joi.number().integer().min(1).max(30).default(7),
  })
    .or("lat", "city")
    .with("lat", "lon"),

  stationsParams: Joi.object({
    lat: Joi.number().min(-90).max(90).required(),
    lon: Joi.number().min(-180).max(180).required(),
    radius: Joi.number().min(1).max(200).default(50),
  }),
};

/**
 * File upload validation
 */
export const validateImageUpload = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No image file provided",
    });
  }

  // Check file type
  if (!req.file.mimetype.startsWith("image/")) {
    return res.status(400).json({
      success: false,
      message: "Only image files are allowed",
    });
  }

  // Check file size (5MB limit)
  if (req.file.size > 5 * 1024 * 1024) {
    return res.status(400).json({
      success: false,
      message: "File size must be less than 5MB",
    });
  }

  next();
};

/**
 * Query parameter validation
 */
export const validatePagination = (req, res, next) => {
  const schema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  });

  const { error, value } = schema.validate(req.query);
  if (error) {
    return res.status(400).json({
      success: false,
      message: "Invalid pagination parameters",
      errors: error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
      })),
    });
  }

  req.query = { ...req.query, ...value };
  next();
};

/**
 * Enhanced validation middleware that supports query, body, and params
 */
export const validateRequest = (schema, target = "body") => {
  return (req, res, next) => {
    const data =
      target === "query"
        ? req.query
        : target === "params"
        ? req.params
        : req.body;

    const { error, value } = schema.validate(data, { abortEarly: false });

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.details.map((detail) => ({
          field: detail.path.join("."),
          message: detail.message,
        })),
      });
    }

    // Update the request object with validated and transformed values
    if (target === "query") req.query = value;
    else if (target === "params") req.params = value;
    else req.body = value;

    next();
  };
};

// Waste management validation
export const wasteRecommendationSchema = Joi.object({
  cropType: Joi.string().min(2).max(50).required().messages({
    "string.empty": "Crop type is required",
    "string.min": "Crop type must be at least 2 characters",
    "string.max": "Crop type cannot exceed 50 characters",
  }),
  quantity: Joi.number().integer().min(1).max(1000000).required().messages({
    "number.base": "Quantity must be a number",
    "number.integer": "Quantity must be a whole number",
    "number.min": "Quantity must be at least 1 kg",
    "number.max": "Quantity cannot exceed 1,000,000 kg",
  }),
  location: Joi.object({
    lat: Joi.number().min(-90).max(90).required().messages({
      "number.base": "Latitude must be a number",
      "number.min": "Latitude must be between -90 and 90",
      "number.max": "Latitude must be between -90 and 90",
    }),
    lng: Joi.number().min(-180).max(180).required().messages({
      "number.base": "Longitude must be a number",
      "number.min": "Longitude must be between -180 and 180",
      "number.max": "Longitude must be between -180 and 180",
    }),
    address: Joi.string().min(5).max(200).required().messages({
      "string.empty": "Address is required",
      "string.min": "Address must be at least 5 characters",
      "string.max": "Address cannot exceed 200 characters",
    }),
    accuracy: Joi.number().min(0).optional(),
  })
    .required()
    .messages({
      "object.base": "Location information is required",
    }),
});

// Waste validation middleware
export const validateWasteRequest = validateRequest(
  wasteRecommendationSchema,
  "body"
);
