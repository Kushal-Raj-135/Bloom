import express from 'express';

const router = express.Router();

// Weather API proxy
router.get('/weather/:location', async (req, res) => {
    try {
        const { location } = req.params;
        const { days = 5, aqi = 'yes', alerts = 'yes' } = req.query;
        
        const response = await fetch(
            `https://api.weatherapi.com/v1/forecast.json?key=${process.env.WEATHER_API_KEY}&q=${encodeURIComponent(location)}&days=${days}&aqi=${aqi}&alerts=${alerts}`
        );
        
        if (!response.ok) {
            throw new Error(`Weather API responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Weather API error:', error);
        res.status(500).json({ 
            error: 'Weather data fetch failed',
            message: error.message 
        });
    }
});

// OpenWeatherMap API proxy
router.get('/openweather/:lat/:lon', async (req, res) => {
    try {
        const { lat, lon } = req.params;
        const { units = 'metric' } = req.query;
        
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_API_KEY}&units=${units}`
        );
        
        if (!response.ok) {
            throw new Error(`OpenWeather API responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('OpenWeather API error:', error);
        res.status(500).json({ 
            error: 'OpenWeather data fetch failed',
            message: error.message 
        });
    }
});

// World Air Quality Index API proxy
router.get('/aqi/:lat/:lon', async (req, res) => {
    try {
        const { lat, lon } = req.params;
        
        const response = await fetch(
            `https://api.waqi.info/feed/geo:${lat};${lon}/?token=${process.env.WAQI_API_KEY}`
        );
        
        if (!response.ok) {
            throw new Error(`WAQI API responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('WAQI API error:', error);
        res.status(500).json({ 
            error: 'AQI data fetch failed',
            message: error.message 
        });
    }
});

// AQI by city name
router.get('/aqi/city/:city', async (req, res) => {
    try {
        const { city } = req.params;
        
        const response = await fetch(
            `https://api.waqi.info/feed/${encodeURIComponent(city)}/?token=${process.env.WAQI_API_KEY}`
        );
        
        if (!response.ok) {
            throw new Error(`WAQI API responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('WAQI API error:', error);
        res.status(500).json({ 
            error: 'AQI data fetch failed',
            message: error.message 
        });
    }
});

export default router;
