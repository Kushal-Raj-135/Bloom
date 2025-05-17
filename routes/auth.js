const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { MongoClient } = require('mongodb');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const mongoURI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET;

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/profile-pictures';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

// Register endpoint
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Connect to MongoDB
        const client = await MongoClient.connect(mongoURI);
        const db = client.db('biobloom');
        const users = db.collection('users');

        // Check if user already exists
        const existingUser = await users.findOne({ email });
        if (existingUser) {
            client.close();
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = {
            name,
            email,
            password: hashedPassword,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        // Insert user into database
        await users.insertOne(newUser);

        // Close connection
        client.close();

        res.status(201).json({ message: 'Registration successful' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
});

// Login endpoint
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Connect to MongoDB
        const client = await MongoClient.connect(mongoURI);
        const db = client.db('biobloom');
        const users = db.collection('users');

        // Find user by email
        const user = await users.findOne({ email });
        
        if (!user) {
            client.close();
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            client.close();
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Create JWT token
        const token = jwt.sign(
            { id: user._id, email: user.email },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Remove password from user object
        const userResponse = {
            id: user._id,
            name: user.name,
            email: user.email
        };

        // Close connection
        client.close();

        res.json({
            token,
            user: userResponse,
            message: 'Login successful'
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

// Google OAuth endpoint
router.get('/google', (req, res) => {
    // Implement Google OAuth logic here
    res.status(501).json({ message: 'Google OAuth not implemented yet' });
});

// Upload profile picture endpoint
router.post('/upload-profile-picture', upload.single('profilePicture'), async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);

        // Connect to MongoDB
        const client = await MongoClient.connect(mongoURI);
        const db = client.db('biobloom');
        const users = db.collection('users');

        // Find user
        const user = await users.findOne({ email: decoded.email });
        
        if (!user) {
            // Delete uploaded file if user not found
            fs.unlinkSync(req.file.path);
            client.close();
            return res.status(404).json({ message: 'User not found' });
        }

        // Delete old profile picture if exists
        if (user.profilePicture) {
            const oldPicturePath = path.join(__dirname, '..', user.profilePicture);
            if (fs.existsSync(oldPicturePath)) {
                fs.unlinkSync(oldPicturePath);
            }
        }

        // Update user with new profile picture path
        const profilePictureUrl = `/uploads/profile-pictures/${req.file.filename}`;
        await users.updateOne(
            { email: decoded.email },
            { $set: { profilePicture: profilePictureUrl } }
        );

        client.close();
        res.json({ profilePictureUrl });
    } catch (error) {
        // Delete uploaded file if error occurs
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        console.error('Profile picture upload error:', error);
        res.status(500).json({ message: 'Server error during profile picture upload' });
    }
});

// Update profile endpoint
router.post('/update-profile', async (req, res) => {
    const { 
        name, 
        phone, 
        location, 
        bio, 
        currentPassword, 
        newPassword,
        notifications 
    } = req.body;
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);

        // Connect to MongoDB
        const client = await MongoClient.connect(mongoURI);
        const db = client.db('biobloom');
        const users = db.collection('users');

        // Find user
        const user = await users.findOne({ email: decoded.email });
        
        if (!user) {
            client.close();
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            client.close();
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        // Update user data
        const updateData = {
            name,
            phone,
            location,
            bio,
            notifications,
            updatedAt: new Date()
        };

        // If new password provided, hash it
        if (newPassword) {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(newPassword, salt);
        }

        // Update user in database
        await users.updateOne(
            { email: decoded.email },
            { $set: updateData }
        );

        client.close();
        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ message: 'Server error during profile update' });
    }
});

module.exports = router; 