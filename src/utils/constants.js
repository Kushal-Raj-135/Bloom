/**
 * Application Constants
 * Centralized constants used throughout the application
 */

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
};

// User Roles
export const USER_ROLES = {
  ADMIN: "admin",
  FARMER: "farmer",
  EXPERT: "expert",
  USER: "user",
};

// Crop Types
export const CROP_TYPES = {
  CEREALS: "cereals",
  PULSES: "pulses",
  OILSEEDS: "oilseeds",
  CASH_CROPS: "cash_crops",
  VEGETABLES: "vegetables",
  FRUITS: "fruits",
  SPICES: "spices",
  FODDER: "fodder",
};

// Soil Types
export const SOIL_TYPES = {
  SANDY: "sandy",
  CLAY: "clay",
  LOAM: "loam",
  SILT: "silt",
  PEAT: "peat",
  CHALK: "chalk",
  RED: "red",
  BLACK: "black",
  ALLUVIAL: "alluvial",
};

// Weather Conditions
export const WEATHER_CONDITIONS = {
  CLEAR: "clear",
  CLOUDY: "cloudy",
  RAINY: "rainy",
  STORMY: "stormy",
  SNOWY: "snowy",
  FOGGY: "foggy",
  WINDY: "windy",
};

// AQI Categories
export const AQI_CATEGORIES = {
  GOOD: { min: 0, max: 50, label: "Good", color: "#00E400" },
  MODERATE: { min: 51, max: 100, label: "Moderate", color: "#FFFF00" },
  UNHEALTHY_SENSITIVE: {
    min: 101,
    max: 150,
    label: "Unhealthy for Sensitive Groups",
    color: "#FF7E00",
  },
  UNHEALTHY: { min: 151, max: 200, label: "Unhealthy", color: "#FF0000" },
  VERY_UNHEALTHY: {
    min: 201,
    max: 300,
    label: "Very Unhealthy",
    color: "#8F3F97",
  },
  HAZARDOUS: { min: 301, max: 500, label: "Hazardous", color: "#7E0023" },
};

// Pollutants
export const POLLUTANTS = {
  PM2_5: "pm2.5",
  PM10: "pm10",
  O3: "o3",
  NO2: "no2",
  SO2: "so2",
  CO: "co",
};

// Search Types
export const SEARCH_TYPES = {
  CROP_RECOMMENDATION: "crop_recommendation",
  CROP_ANALYSIS: "crop_analysis",
  WEATHER_QUERY: "weather_query",
  AQI_QUERY: "aqi_query",
  GENERAL_SEARCH: "general_search",
};

// Notification Types
export const NOTIFICATION_TYPES = {
  EMAIL: "email",
  PUSH: "push",
  SMS: "sms",
  IN_APP: "in_app",
};

// File Types
export const FILE_TYPES = {
  IMAGE: "image",
  DOCUMENT: "document",
  VIDEO: "video",
  AUDIO: "audio",
};

// Allowed Image Extensions
export const ALLOWED_IMAGE_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".webp",
  ".svg",
];

// Allowed Document Extensions
export const ALLOWED_DOCUMENT_EXTENSIONS = [
  ".pdf",
  ".doc",
  ".docx",
  ".txt",
  ".csv",
  ".xlsx",
];

// Language Codes
export const LANGUAGES = {
  ENGLISH: "en",
  HINDI: "hi",
  KANNADA: "kn",
  TAMIL: "ta",
  TELUGU: "te",
  MARATHI: "mr",
  GUJARATI: "gu",
  BENGALI: "bn",
  PUNJABI: "pa",
};

// Seasons
export const SEASONS = {
  KHARIF: "kharif", // Monsoon season (June-October)
  RABI: "rabi", // Winter season (November-April)
  ZAID: "zaid", // Summer season (March-June)
};

// Irrigation Methods
export const IRRIGATION_METHODS = {
  FLOOD: "flood",
  SPRINKLER: "sprinkler",
  DRIP: "drip",
  FURROW: "furrow",
  SURFACE: "surface",
};

// Farm Activities
export const FARM_ACTIVITIES = {
  PLANTING: "planting",
  WATERING: "watering",
  FERTILIZING: "fertilizing",
  PEST_CONTROL: "pest_control",
  HARVESTING: "harvesting",
  SOIL_PREPARATION: "soil_preparation",
  PRUNING: "pruning",
  WEEDING: "weeding",
};

// Growth Stages
export const GROWTH_STAGES = {
  SEED: "seed",
  GERMINATION: "germination",
  SEEDLING: "seedling",
  VEGETATIVE: "vegetative",
  FLOWERING: "flowering",
  FRUITING: "fruiting",
  MATURITY: "maturity",
  HARVEST: "harvest",
};

// Cache Keys
export const CACHE_KEYS = {
  WEATHER: "weather",
  AQI: "aqi",
  CROP_DATA: "crop_data",
  USER_PROFILE: "user_profile",
  SEARCH_RESULTS: "search_results",
};

// API Limits
export const API_LIMITS = {
  MAX_REQUESTS_PER_MINUTE: 60,
  MAX_REQUESTS_PER_HOUR: 1000,
  MAX_REQUESTS_PER_DAY: 10000,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_SEARCH_RESULTS: 100,
};

// Validation Patterns
export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[+]?[0-9]{10,15}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])/,
  COORDINATES: {
    LATITUDE: /^(-?[1-8]?\d(?:\.\d{1,18})?|90(?:\.0{1,18})?)$/,
    LONGITUDE: /^(-?(?:1[0-7]|[1-9])?\d(?:\.\d{1,18})?|180(?:\.0{1,18})?)$/,
  },
};

// Error Messages
export const ERROR_MESSAGES = {
  UNAUTHORIZED: "Access denied. Please login to continue.",
  FORBIDDEN: "You do not have permission to access this resource.",
  NOT_FOUND: "The requested resource was not found.",
  VALIDATION_ERROR: "Please check your input and try again.",
  SERVER_ERROR: "An internal server error occurred. Please try again later.",
  RATE_LIMIT_EXCEEDED: "Too many requests. Please try again later.",
  FILE_TOO_LARGE: "File size exceeds the maximum allowed limit.",
  INVALID_FILE_TYPE:
    "Invalid file type. Please upload a supported file format.",
  NETWORK_ERROR: "Network error. Please check your connection and try again.",
};

// Success Messages
export const SUCCESS_MESSAGES = {
  USER_REGISTERED: "User registered successfully.",
  USER_LOGGED_IN: "Logged in successfully.",
  PROFILE_UPDATED: "Profile updated successfully.",
  PASSWORD_CHANGED: "Password changed successfully.",
  EMAIL_SENT: "Email sent successfully.",
  DATA_SAVED: "Data saved successfully.",
  FILE_UPLOADED: "File uploaded successfully.",
  OPERATION_COMPLETED: "Operation completed successfully.",
};

// Default Values
export const DEFAULTS = {
  PAGE_SIZE: 10,
  CACHE_TTL: 300, // 5 minutes
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
  PASSWORD_RESET_EXPIRY: 60 * 60 * 1000, // 1 hour
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 30 * 60 * 1000, // 30 minutes
  DEFAULT_LANGUAGE: "en",
  DEFAULT_TIMEZONE: "Asia/Kolkata",
};

export default {
  HTTP_STATUS,
  USER_ROLES,
  CROP_TYPES,
  SOIL_TYPES,
  WEATHER_CONDITIONS,
  AQI_CATEGORIES,
  POLLUTANTS,
  SEARCH_TYPES,
  NOTIFICATION_TYPES,
  FILE_TYPES,
  ALLOWED_IMAGE_EXTENSIONS,
  ALLOWED_DOCUMENT_EXTENSIONS,
  LANGUAGES,
  SEASONS,
  IRRIGATION_METHODS,
  FARM_ACTIVITIES,
  GROWTH_STAGES,
  CACHE_KEYS,
  API_LIMITS,
  VALIDATION_PATTERNS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  DEFAULTS,
};
