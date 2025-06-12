import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import path from 'path';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import session from 'express-session';
import { MongoClient } from 'mongodb';
import crypto from 'crypto';

// Import routes
import authRoutes from './routes/auth.js'; 
import dotenv from 'dotenv';
dotenv.config();
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


const app = express();
const PORT = process.env.PORT || 3000;
const mongoURI = process.env.MONGODB_URI;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname))); // Serve files from root directory
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    googleId: String,
    profilePicture: String,
    resetToken: String,
    resetTokenExpiry: Date
});

const User = mongoose.model('User', userSchema);

// Passport Google Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
},
async function(accessToken, refreshToken, profile, done) {
    try {
        // Check if user already exists
        let user = await User.findOne({ googleId: profile.id });
        
        if (!user) {
            // Check if user exists with same email
            user = await User.findOne({ email: profile.emails[0].value });
            
            if (user) {
                // Update existing user with Google ID
                user.googleId = profile.id;
                user.profilePicture = profile.photos[0].value;
                await user.save();
            } else {
                // Create new user
                user = await User.create({
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    googleId: profile.id,
                    profilePicture: profile.photos[0].value
                });
            }
        }
        
        return done(null, user);
    } catch (error) {
        return done(error, null);
    }
}));

//Passport Github
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL
},
async function(accessToken, refreshToken, profile, done) {
    try {
        let user = await User.findOne({ githubId: profile.id });

        if (!user) {
            user = await User.findOne({ email: profile.emails?.[0]?.value });

            if (user) {
                user.githubId = profile.id;
                user.profilePicture = profile.photos?.[0]?.value;
                await user.save();
            } else {
                user = await User.create({
                    name: profile.displayName || profile.username,
                    email: profile.emails?.[0]?.value || "",
                    githubId: profile.id,
                    profilePicture: profile.photos?.[0]?.value
                });
            }
        }

        return done(null, user);
    } catch (error) {
        return done(error, null);
    }
}));


// Passport serialization
passport.serializeUser((user, done) => {
    done(null, user.id);
});



passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});




// CropShift Content Fetching
import fetch from 'node-fetch';
const cropNameMap = {
    'rice': 'Rice (Dhan)',
    'wheat': 'Wheat (Gehun)',
    'sugarcane': 'Sugarcane (Ganna)',
    'pulses': 'Pulses (Dal)',
    'cotton': 'Cotton (Kapas)',
    'groundnut': 'Groundnut (Moongfali)',
    'maize': 'Maize (Makka)',
    'sorghum': 'Sorghum (Jowar)',
    'pearl-millet': 'Pearl Millet (Bajra)',
    'chickpea': 'Chickpea (Chana)',
    'mustard': 'Mustard (Sarson)',
    'moong': 'Green Gram (Moong)',
    'soybean': 'Soybean (Soya)',
    'potato': 'Potato (Aloo)',
    'corn': 'Corn (Makka)',
    'alfalfa': 'Alfalfa (Rijka)',
    'legumes': 'Legumes (Faliyan)',
    'jowar': 'Jowar (Sorghum)',
    'cowpea': 'Cowpea (Lobia/Chawli)',
    'mung bean': 'Mung Bean (Moong)',
    'pigeonpea': 'Pigeonpea (Arhar/Tur Dal)',
    'arhar': 'Pigeonpea (Arhar/Tur Dal)',
    'tur': 'Pigeonpea (Arhar/Tur Dal)',
    'lobia': 'Cowpea (Lobia/Chawli)',
    'chawli': 'Cowpea (Lobia/Chawli)',
    'tur dal': 'Pigeonpea (Arhar/Tur Dal)'
};


function getLocalCropName(cropName) {
    return cropNameMap[cropName.toLowerCase()] || cropName;
}

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

async function getGroqRecommendations(cropInfo) {
    const prompt= `As an agricultural expert in India, provide a detailed 3-year crop rotation plan for the following farm, using local crop names that farmers will understand. IMPORTANT: Do NOT recommend the same crop as the current crop in the rotation plan. Each year should have a different crop to maintain soil health and prevent pest cycles.

        Current Farm Details:
        - Current Crop: ${getLocalCropName(cropInfo.previousCrop)}
        - Soil Type: ${cropInfo.soilType}
        - Region/Climate: ${cropInfo.region}
        - Farm Size: ${cropInfo.farmSize} acres

        Rules for recommendations:
        1. NEVER recommend the current crop (${getLocalCropName(cropInfo.previousCrop)}) in the rotation plan
        2. Each year must have a different crop
        3. Consider crop families that complement each other
        4. Focus on crops that improve soil health after the current crop
        5. Consider local market demand and climate suitability

        Please provide recommendations using common local names for crops (e.g., use "Arhar/Tur Dal" instead of just "Pigeonpea", "Lobia/Chawli" instead of just "Cowpea") in the following format:

        3-YEAR ROTATION PLAN:

        Year 1:
        [Recommended crop with local name - MUST be different from current crop]
        - Benefits: [List specific benefits of this crop]
        - Reasoning: [Explain why this crop is recommended after the current crop]
        - Soil Impact: [How this crop affects soil health]
        - Management Tips: [Key cultivation practices]

        Year 2:
        [Recommended crop with local name - MUST be different from Year 1 crop]
        - Benefits: [List specific benefits of this crop]
        - Reasoning: [Explain why this crop follows Year 1's crop]
        - Soil Impact: [How this crop affects soil health]
        - Management Tips: [Key cultivation practices]

        Year 3:
        [Recommended crop with local name - MUST be different from Years 1 and 2 crops]
        - Benefits: [List specific benefits of this crop]
        - Reasoning: [Explain why this crop completes the rotation]
        - Soil Impact: [How this crop affects soil health]
        - Management Tips: [Key cultivation practices]

        ORGANIC FERTILIZER RECOMMENDATIONS:
        [List specific organic fertilizers for each crop in the rotation]
        [Include application timing and rates]
        [Traditional and modern organic alternatives]

        Additional Recommendations:
        1. Organic Fertilizer Strategy: [Specific recommendations]
        2. Soil Health Management: [Detailed practices]
        3. Climate-Specific Considerations: [Based on the region]
        4. Expected Outcomes: [Benefits of this rotation cycle];
        `
    try {
    const response = await fetch(GROQ_API_URL, {
         method: 'POST',
        headers: {
            'Authorization': `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
                {
                    role: "system",
                    content: "You are an expert agricultural advisor specializing in crop rotation..."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 2000
        })
    });const responseText = await response.text();
    if (!response.ok) {
        throw new Error(`Failed to get AI recommendations: ${response.status} ${responseText}`);
    }
    const data = JSON.parse(responseText);
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid response format from Groq AI');
    }
    return data.choices[0].message.content;
}catch(error){
     console.error('Error getting AI recommendations:', error);
    throw error;
}}

app.post('/recommendations', async (req, res) => {
const cropInfo = req.body;
console.log("crop "+ cropInfo);
try {
    const recommendations = await getGroqRecommendations(cropInfo);
    console.log("rec: "+recommendations);
    res.json({ "recommendation": recommendations });
} catch (error) {
     console.error('Error in /recommendations:', error);
    res.status(500).json({ error: 'Unable to get AI recommendations at the moment.' });
}});

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});


// Middleware
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve uploaded files

// Routes
app.use('/api/auth', authRoutes);


// Serve HTML files
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'register.html'));
});

app.get('/profile', (req, res) => {
    res.sendFile(path.join(__dirname, 'profile.html'));
});

app.get('/forgot-password', (req, res) => {
    res.sendFile(path.join(__dirname, 'forgot-password.html'));
});

app.get('/reset-password/:token', (req, res) => {
    res.sendFile(path.join(__dirname, 'reset-password.html'));
});

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

// Get current user data
app.get('/api/auth/me', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user data' });
    }
});

// Forgot Password Route
app.post('/api/auth/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        // Find user by email
        const user = await User.findOne({ email });
        
        if (!user) {
            // Return success even if user not found to prevent email enumeration
            return res.status(200).json({ 
                message: 'If an account exists with this email, you will receive password reset instructions.' 
            });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = Date.now() + 3600000; // 1 hour

        // Update user with reset token
        user.resetToken = resetToken;
        user.resetTokenExpiry = resetTokenExpiry;
        await user.save();

        // Create reset URL
        const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;

        // Send email (you'll need to implement email sending functionality)
        // For now, we'll just log the reset URL
        console.log('Password reset URL:', resetUrl);

        res.status(200).json({ 
            message: 'If an account exists with this email, you will receive password reset instructions.' 
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'An error occurred while processing your request.' });
    }
});

// Reset Password Route
app.post('/api/auth/reset-password/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        // Find user with valid reset token
        const user = await User.findOne({
            resetToken: token,
            resetTokenExpiry: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ 
                message: 'Password reset token is invalid or has expired.' 
            });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Update user password and clear reset token
        user.password = hashedPassword;
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;
        await user.save();

        res.status(200).json({ message: 'Password has been reset successfully.' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'An error occurred while resetting your password.' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});