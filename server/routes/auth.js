import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import * as authController from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { authConfig } from '../config/config.js';
import {
    validateInput,
    loginValidation,
    registerValidation,
    passwordResetValidation,
    resetPasswordValidation,
    profileUpdateValidation,
    authRateLimit,
    passwordResetRateLimit,
    sanitizeInput,
    logRequest
} from '../middleware/apiSecurity.js';

const router = express.Router();

// Apply logging to all auth routes
// router.use(logRequest);

// Apply input sanitization to all routes
router.use(sanitizeInput);

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
router.post('/register', authRateLimit, validateInput(registerValidation), authController.register);
router.post('/login', authRateLimit, validateInput(loginValidation), authController.login);
router.post('/logout', authenticate, authController.logout);
router.post('/refresh', authController.refreshToken);
router.get('/verify', authenticate, authController.verifyToken);

// Google OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', 
    passport.authenticate('google', { failureRedirect: '/login?error=oauth_failed' }),
    (req, res) => {
        try {
            // Generate secure tokens
            const { accessToken, refreshToken } = authController.generateTokens(req.user);
            
            // Set secure HTTP-only cookies
            res.cookie('auth-token', accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 15 * 60 * 1000 // 15 minutes
            });
            
            res.cookie('refresh-token', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });
            
            // Redirect to frontend with success indicator
            res.redirect('/?oauth=success');
        } catch (error) {
            console.error('Google OAuth callback error:', error);
            res.redirect('/login?error=oauth_failed');
        }
    }
);

// GitHub OAuth routes
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

router.get('/github/callback',
    passport.authenticate('github', { failureRedirect: '/login?error=oauth_failed' }),
    (req, res) => {
        try {
            // Generate secure tokens
            const { accessToken, refreshToken } = authController.generateTokens(req.user);
            
            // Set secure HTTP-only cookies
            res.cookie('auth-token', accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 15 * 60 * 1000 // 15 minutes
            });
            
            res.cookie('refresh-token', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });
            
            // Redirect to frontend with success indicator
            res.redirect('/?oauth=success');
        } catch (error) {
            console.error('GitHub OAuth callback error:', error);
            res.redirect('/login?error=oauth_failed');
        }
    }
);

// Profile update endpoint
router.put('/profile', authenticate, upload.single('profilePicture'), validateInput(profileUpdateValidation), authController.updateProfile);

// Password reset endpoints
router.post('/forgot-password', passwordResetRateLimit, validateInput(passwordResetValidation), authController.forgotPassword);
router.post('/reset-password', passwordResetRateLimit, validateInput(resetPasswordValidation), authController.resetPassword);

export default router;
