import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Server configuration
const serverConfig = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
};

// Database configuration
const dbConfig = {
  mongoUri: process.env.MONGODB_URI,
};

// JWT configuration
const authConfig = {
  jwtSecret: process.env.JWT_SECRET,
  sessionSecret: process.env.SESSION_SECRET,
};

// OAuth configuration
const oauthConfig = {
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackUrl: process.env.GOOGLE_CALLBACK_URL,
  },
  github: {
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackUrl: process.env.GITHUB_CALLBACK_URL,
  },
};

// API keys configuration
const apiConfig = {
  groqApiKey: process.env.GROQ_API_KEY,
  groqApiUrl: 'https://api.groq.com/openai/v1/chat/completions',
  waqiApiKey: process.env.WAQI_API_KEY,
  openWeatherApiKey: process.env.OPENWEATHER_API_KEY,
};

// Localization configuration
const i18nConfig = {
  defaultLocale: 'en',
  supportedLocales: ['en', 'hi', 'kn'],
};

export {
  serverConfig,
  dbConfig,
  authConfig, 
  oauthConfig,
  apiConfig,
  i18nConfig
};
