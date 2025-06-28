import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import passport from 'passport';
import session from 'express-session';
import dotenv from 'dotenv';
import morgan from 'morgan';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Import configurations
import { serverConfig, dbConfig, authConfig } from './server/config/config.js';

// Import routes
import authRoutes from './server/routes/auth.js';
import cropRoutes from './server/routes/crop.js';
import aqiRoutes from './server/routes/aqi.js';
import weatherRoutes from './server/routes/weather.js';
import aiRoutes from './server/routes/ai.js';
import geocodingRoutes from './server/routes/geocoding.js';

// Import middleware
import { handleApiError } from './server/middleware/apiSecurity.js';

// Initialize environment variables
dotenv.config();

// ES Module file path setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Express app
const app = express();
const PORT = serverConfig.port;

// Middleware
app.use(cors());
app.use(morgan('dev')); // Logging middleware

// Configure Helmet with CSP settings
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: [
                "'self'",
                "'unsafe-inline'",
                "https://cdnjs.cloudflare.com",
                "https://cdn.jsdelivr.net",
                "https://fonts.googleapis.com"
            ],
            styleSrc: [
                "'self'",
                "'unsafe-inline'",
                "https://fonts.googleapis.com",
                "https://cdnjs.cloudflare.com"
            ],
            fontSrc: [
                "'self'",
                "https://fonts.gstatic.com",
                "https://cdnjs.cloudflare.com"
            ],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"]
        }
    }
}));

app.use(express.json());
app.use(session({
    secret: authConfig.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: serverConfig.nodeEnv === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// MongoDB Connection
mongoose.connect(dbConfig.mongoUri)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/crop', cropRoutes);
app.use('/api/aqi', aqiRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/geocoding', geocodingRoutes);

// Serve static directories
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Global error handler
app.use(handleApiError);

app.post('/api/chatbot', async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ reply: 'No message provided.' });
        }
        // Gemini API endpoint and key
        const geminiApiKey = process.env.GEMINI_API_KEY;
        const geminiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + geminiApiKey;
        const geminiBody = {
            contents: [{ parts: [{ text: message }] }]
        };
        const geminiRes = await fetch(geminiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(geminiBody)
        });
        if (!geminiRes.ok) {
            return res.status(500).json({ reply: 'Gemini API error.' });
        }
        const geminiData = await geminiRes.json();
        const reply = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not answer that.';
        res.json({ reply });
    } catch (err) {
        console.error('Gemini chatbot error:', err);
        res.status(500).json({ reply: 'Internal server error.' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port http://localhost:${PORT}`);
});
