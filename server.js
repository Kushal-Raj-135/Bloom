import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import passport from 'passport';
import session from 'express-session';
import dotenv from 'dotenv';
import morgan from 'morgan';
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

// Middleware imports

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
app.use(express.json());
app.use(express.static(path.join(__dirname, 'client'))); // Serve files from client directory
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

// Serve static HTML pages directly
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'register.html'));
});

app.get('/profile', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'profile.html'));
});

app.get('/forgot-password', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'forgot-password.html'));
});

app.get('/reset-password/:token', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'reset-password.html'));
});

// Direct routes for feature pages
app.get('/crop/crop-rotation', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'modules', 'cropshift', 'html', 'crop-rotation.html'));
});

app.get('/crop', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'modules', 'cropshift', 'html', 'index.html'));
});

app.get('/crop/aqi-monitor', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'modules', 'cropshift', 'html', 'aqi-monitor.html'));
});

app.get('/agrirevive/biofuel', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'modules', 'agrirevive', 'html', 'biofuel.html'));
});

app.get('/agrirevive', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'modules', 'agrirevive', 'html', 'biofuel.html'));
});

app.get('/agrisensex/agri', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'modules', 'agrisensex', 'html', 'agri.html'));
});

app.get('/agrisensex', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'modules', 'agrisensex', 'html', 'agri.html'));
});

// Helper function to handle module-based routes
const serveFromModule = (moduleName, originalPath, req, res, next) => {
    const relativePath = req.path.replace(originalPath, '/');
    
    // Check assets first (CSS, JS, etc.)
    const assetPath = path.join(__dirname, 'client', 'modules', moduleName, 'assets', relativePath);
    if (fs.existsSync(assetPath) && fs.statSync(assetPath).isFile()) {
        return res.sendFile(assetPath);
    }
    
    // Check HTML files
    const htmlPath = path.join(__dirname, 'client', 'modules', moduleName, 'html', relativePath);
    if (fs.existsSync(htmlPath) && fs.statSync(htmlPath).isFile()) {
        return res.sendFile(htmlPath);
    }
    
    // Check JS files
    const jsPath = path.join(__dirname, 'client', 'modules', moduleName, 'js', relativePath);
    if (fs.existsSync(jsPath) && fs.statSync(jsPath).isFile()) {
        return res.sendFile(jsPath);
    }
    
    // If not found, go to next handler
    next();
};

// Serve feature module routes
app.get('/crop/*', (req, res, next) => {
    serveFromModule('cropshift', '/crop/', req, res, next);
});

app.get('/agrirevive/*', (req, res, next) => {
    serveFromModule('agrirevive', '/agrirevive/', req, res, next);
});

app.get('/agrisensex/*', (req, res, next) => {
    serveFromModule('agrisensex', '/agrisensex/', req, res, next);
});

// Gemini Chatbot API route
import fetch from 'node-fetch';
import { apiConfig } from './server/config/config.js';

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

// 404 handler - must be after all other routes
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'client', '404.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port http://localhost:${PORT}`);
});
