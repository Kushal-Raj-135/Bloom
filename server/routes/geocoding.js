import express from 'express';

const router = express.Router();

// Nominatim geocoding proxy (for consistency and rate limiting)
router.get('/search/:query', async (req, res) => {
    try {
        const { query } = req.params;
        const { limit = 5, format = 'json' } = req.query;
        
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=${format}&limit=${limit}&addressdetails=1`
        );
        
        if (!response.ok) {
            throw new Error(`Nominatim API responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Nominatim API error:', error);
        res.status(500).json({ 
            error: 'Geocoding search failed',
            message: error.message 
        });
    }
});

// Reverse geocoding
router.get('/reverse/:lat/:lon', async (req, res) => {
    try {
        const { lat, lon } = req.params;
        const { format = 'json' } = req.query;
        
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=${format}&addressdetails=1`
        );
        
        if (!response.ok) {
            throw new Error(`Nominatim API responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Nominatim API error:', error);
        res.status(500).json({ 
            error: 'Reverse geocoding failed',
            message: error.message 
        });
    }
});

export default router;
