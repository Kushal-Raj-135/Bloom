import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import passport from 'passport';
import * as authController from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'public/uploads/profile-pictures';
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

// Auth routes
router.post('/register', authController.register);
// Login endpoint
router.post('/login', authController.login);

// Google OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', 
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        // Generate JWT token
        const token = jwt.sign(
            { id: req.user._id, email: req.user.email },
            authConfig.jwtSecret,
            { expiresIn: '1d' }
        );
        
        // Redirect to frontend with token
        res.redirect(`/?token=${token}`);
    }
);

// GitHub OAuth routes
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

router.get('/github/callback',
    passport.authenticate('github', { failureRedirect: '/login' }),
    (req, res) => {
        // Generate JWT token
        const token = jwt.sign(
            { id: req.user._id, email: req.user.email },
            authConfig.jwtSecret,
            { expiresIn: '1d' }
        );
        
        // Redirect to frontend with token
        res.redirect(`/?token=${token}`);
    }
);

// Profile update endpoint
router.put('/profile', upload.single('profilePicture'), async (req, res) => {
    const { name, email } = req.body;
    const userId = req.user.id; // Assuming authentication middleware sets req.user

    try {
        const updates = {
            name,
            email,
            updatedAt: new Date()
        };

        // Add profile picture if uploaded
        if (req.file) {
            updates.profilePicture = `/uploads/profile-pictures/${req.file.filename}`;
        }

        // Update user profile
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            message: 'Profile updated successfully',
            user: {
                id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                profilePicture: updatedUser.profilePicture
            }
        });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ message: 'Server error during profile update' });
    }
});

// Forgot password endpoint
router.post('/forgot-password', authController.forgotPassword);

// Reset password endpoint
router.post('/reset-password', authController.resetPassword);

export default router;
