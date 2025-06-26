import express from 'express';

const router = express.Router();

// Groq AI API proxy for recommendations
router.post('/recommendations', async (req, res) => {
    try {
        const { messages, model = 'llama3-8b-8192' } = req.body;
        
        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ 
                error: 'Invalid request format. Messages array is required.' 
            });
        }
        
        const requestBody = {
            messages,
            model,
            max_tokens: 1000,
            temperature: 0.7
        };
        
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Groq API responded with status: ${response.status}, ${errorText}`);
        }
        
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Groq AI API error:', error);
        res.status(500).json({ 
            error: 'AI recommendation failed',
            message: error.message 
        });
    }
});

// Groq AI API proxy for general chat completions
router.post('/chat', async (req, res) => {
    try {
        const { messages, model = 'llama3-8b-8192', max_tokens = 1000, temperature = 0.7 } = req.body;
        
        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ 
                error: 'Invalid request format. Messages array is required.' 
            });
        }
        
        const requestBody = {
            messages,
            model,
            max_tokens,
            temperature
        };
        
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Groq API responded with status: ${response.status}, ${errorText}`);
        }
        
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Groq AI API error:', error);
        res.status(500).json({ 
            error: 'AI chat completion failed',
            message: error.message 
        });
    }
});

export default router;
