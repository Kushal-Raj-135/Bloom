# API Security Best Practices in BioBloom Project

## Overview

This document outlines the API security measures implemented in the BioBloom project to ensure sensitive information is protected and API access is properly controlled.

## Key Security Features

### 1. Environment Variables for Sensitive Data

- All API keys, secret tokens, and credentials have been moved to `.env` file
- No hardcoded credentials in source code
- Environment variables are loaded through a centralized config module

### 2. Backend Proxy Pattern for API Requests

- Frontend code never directly accesses external APIs with API keys
- All external API calls route through our backend proxy services
- API keys are stored and used only on the server side

### 3. API Key Management System

- Multiple API keys supported for different environments and rotation purposes
- Keys specified in `VALID_API_KEYS` environment variable 
- Rate limiting applied to prevent abuse
- API key validation middleware for protected endpoints

### 4. Request & Response Security

- Input sanitization to prevent injection attacks
- Response sanitization to prevent data leakage
- No sensitive information returned to clients
- Proper error handling that doesn't expose system details

### 5. File Structure

```
server/
├── config/
│   └── config.js           # Centralized secure configuration
├── controllers/
│   ├── authController.js   # Auth-related functionality
│   ├── aqiController.js    # AQI data proxy controller
│   └── cropController.js   # Crop recommendations
├── middleware/
│   ├── apiSecurity.js      # API security features
│   └── auth.js             # Authentication middleware
├── utils/
│   └── cropUtils.js        # Secure utility functions
└── routes/
    ├── auth.js             # Auth routes
    ├── aqi.js              # AQI routes
    └── crop.js             # Crop routes
```

## Implemented Changes

1. **Moved API keys to environment variables:**
   - WAQI_API_KEY
   - OPENWEATHER_API_KEY
   - GROQ_API_KEY
   - Other sensitive tokens

2. **Created backend proxy services:**
   - `/api/aqi/data` - Securely proxies requests to WAQI and OpenWeather APIs
   - `/api/aqi/recommendations` - Provides recommendations based on AQI values

3. **Created frontend service layers:**
   - `aqiService.js` - Provides secure client-side API for AQI functionality

4. **Updated frontend components:**
   - Modified `aqi-monitor.js` to use secure service instead of direct API calls

5. **Added API security middleware:**
   - API key validation
   - Rate limiting
   - Input/output sanitization

## Security Best Practices for Development

1. **Never commit sensitive information:**
   - Keep `.env` files out of version control
   - Use `.env.example` as a template with fake credentials

2. **API key rotation:**
   - Regularly rotate API keys
   - Support multiple valid keys during rotation periods

3. **Rate limiting:**
   - Implement appropriate rate limits to prevent abuse
   - Different limits for different endpoints based on sensitivity

4. **Input validation:**
   - Always validate and sanitize user input
   - Use parameterized queries to prevent injection attacks

5. **Response security:**
   - Strip sensitive information from responses
   - Use appropriate HTTP status codes
   - Implement proper error handling

6. **HTTPS in production:**
   - Always use HTTPS in production environments
   - Configure secure cookies
