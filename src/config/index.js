import dotenv from "dotenv";

dotenv.config();

const config = {
  // Server Configuration
  server: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || "development",
    host: process.env.HOST || "localhost",
  },

  // Database Configuration
  database: {
    uri: process.env.MONGODB_URI,
    options: {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,
    },
  },

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || "24h",
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  },

  // Session Configuration
  session: {
    secret: process.env.SESSION_SECRET,
    name: "biobloom_session",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  },

  // OAuth Configuration
  oauth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackUrl:
        process.env.GOOGLE_CALLBACK_URL ||
        "http://localhost:3000/api/auth/google/callback",
    },
  },

  // External APIs
  apis: {
    weather: {
      key: process.env.WEATHER_API_KEY || "731ee3473e67416aba412740250404",
      baseUrl: "https://api.weatherapi.com/v1",
    },
    groq: {
      key: process.env.GROQ_API_KEY,
      baseUrl: "https://api.groq.com/openai/v1/chat/completions",
    },
    aqi: {
      key: process.env.AQI_API_KEY,
      baseUrl: "https://api.waqi.info",
    },
  },

  // File Upload Configuration
  upload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedImageTypes: ["jpeg", "jpg", "png", "gif", "webp"],
    profilePictureMaxSize: 5 * 1024 * 1024, // 5MB
    paths: {
      profilePictures: "uploads/profile-pictures",
      cropImages: "uploads/crop-images",
      documents: "uploads/documents",
      temp: "uploads/temp",
    },
  },

  // Email Configuration
  email: {
    service: process.env.EMAIL_SERVICE || "gmail",
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
    from: process.env.EMAIL_FROM || "noreply@biobloom.com",
  },

  // CORS Configuration
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
    optionsSuccessStatus: 200,
  },

  // Rate Limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again later.",
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || "info",
    file: process.env.LOG_FILE || "logs/app.log",
  },

  // Cache Configuration
  cache: {
    ttl: process.env.CACHE_TTL || 300, // 5 minutes default
    max: process.env.CACHE_MAX || 100,
  },
};

// Validation function to ensure required environment variables are set
export const validateConfig = () => {
  const required = ["MONGODB_URI", "JWT_SECRET", "SESSION_SECRET"];

  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }

  console.log("✅ Configuration validation passed");
};

export default config;
