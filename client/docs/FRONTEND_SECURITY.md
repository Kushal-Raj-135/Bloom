# BioBloom Frontend Security Updates

## Frontend Security Changes

We've updated the frontend code to ensure no hardcoded API keys are present in client-side code. This addresses a critical security vulnerability where sensitive keys were previously exposed to users.

## Key Changes

### 1. Removed Hardcoded API Keys

API keys have been removed from these files:
- `crop/aqi-monitor.js` - Removed WAQI_API_KEY and OPENWEATHER_API_KEY
- Other frontend files have been checked to ensure no API keys remain

### 2. Created Secure Service Layer

New service files have been created that act as proxies to the backend:

#### AQI Service
```javascript
// crop/services/aqiService.js
export const fetchAQIData = async (coordinates) => {
    const response = await fetch('/api/aqi/data?lat=...&lon=...', {
        headers: { 'X-API-Key': localStorage.getItem('apiKey') || '' }
    });
    // Process response...
};

export const getRecommendations = async (aqiValue) => {
    // Similar implementation...
};
```

#### Crop Rotation Service
```javascript
// crop/services/cropRotationService.js
export const fetchCropRotationRecommendations = async (formData) => {
    const response = await fetch('/api/crop/rotation/recommendations', {
        method: 'POST', 
        headers: {
            'Content-Type': 'application/json',
            'X-API-Key': localStorage.getItem('apiKey') || ''
        },
        body: JSON.stringify(formData)
    });
    // Process response...
};
```

### 3. Updated Frontend Components

- `aqi-monitor.js` - Now uses the AQI service for data fetching
- `crop-rotation.js` - Now uses the crop rotation service for recommendations

### 4. Security Best Practices

The service layer implements these security features:
- API keys are never hardcoded in client code
- All sensitive operations are proxied through the backend
- Authentication tokens are securely managed
- API key validation happens on server side

## How It Works

1. Frontend components make requests to our own backend API endpoints
2. Backend handles API key management and authentication
3. Backend makes requests to external services using securely stored API keys
4. Data is sanitized before being returned to the client

## For Developers

- Never add API keys directly to frontend code
- Always use the service layer for external API calls 
- If you need to add new external APIs:
   1. Add the key to .env
   2. Update the config.js file
   3. Create a controller function
   4. Create/update route files
   5. Create a frontend service file
