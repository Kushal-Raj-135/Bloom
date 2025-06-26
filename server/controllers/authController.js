import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { authConfig } from '../config/config.js';
import User from '../models/User.js';

/**
 * Register a new user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const register = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = new User({
            name,
            email,
            password: hashedPassword
        });

        // Save user to database
        await newUser.save();

        res.status(201).json({ message: 'Registration successful' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

/**
 * Login a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, email: user.email },
            authConfig.jwtSecret,
            { expiresIn: '1d' }
        );

        res.status(200).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                profilePicture: user.profilePicture
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

/**
 * Google OAuth callback handler
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const googleCallback = (req, res) => {
    try {
        // Generate JWT token
        const token = jwt.sign(
            { id: req.user._id, email: req.user.email },
            authConfig.jwtSecret,
            { expiresIn: '1d' }
        );
        
        // Redirect to frontend with token
        res.redirect(`/?token=${token}`);
    } catch (error) {
        console.error('Google callback error:', error);
        res.redirect('/login?error=auth_failed');
    }
};

/**
 * GitHub OAuth callback handler
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const githubCallback = (req, res) => {
    try {
        // Generate JWT token
        const token = jwt.sign(
            { id: req.user._id, email: req.user.email },
            authConfig.jwtSecret,
            { expiresIn: '1d' }
        );
        
        // Redirect to frontend with token
        res.redirect(`/?token=${token}`);
    } catch (error) {
        console.error('GitHub callback error:', error);
        res.redirect('/login?error=auth_failed');
    }
};

/**
 * Verify JWT token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const verifyToken = async (req, res) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json({ valid: false });
    }
    
    try {
        const decoded = jwt.verify(token, authConfig.jwtSecret);
        const user = await User.findById(decoded.id);
        
        if (!user) {
            return res.status(401).json({ valid: false });
        }
        
        res.json({ 
            valid: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                profilePicture: user.profilePicture
            }
        });
    } catch (error) {
        console.error('Token verification error:', error);
        res.status(401).json({ valid: false });
    }
};

/**
 * Update user profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const updateProfile = async (req, res) => {
    const { name, email } = req.body;
    const userId = req.user.id;

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
};

/**
 * Request password reset
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(20).toString('hex');
        const resetTokenExpiry = Date.now() + 3600000; // Token valid for 1 hour

        // Update user with reset token
        user.resetToken = resetToken;
        user.resetTokenExpiry = resetTokenExpiry;
        await user.save();

        // TODO: Send email with reset link
        // For now, just return the token for testing purposes
        res.status(200).json({
            message: 'Password reset email sent',
            resetToken // In production, don't send this in the response
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Server error during password reset request' });
    }
};

/**
 * Reset password using token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const resetPassword = async (req, res) => {
    const { resetToken, newPassword } = req.body;

    try {
        const user = await User.findOne({
            resetToken,
            resetTokenExpiry: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update user password and clear reset token
        user.password = hashedPassword;
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;
        await user.save();

        res.status(200).json({ message: 'Password reset successful' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Server error during password reset' });
    }
};

/**
 * Request an API key for client-side API usage
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const requestApiKey = async (req, res) => {
    try {
        // Check if user is authenticated
        const userId = req.userId;
        let keyType = 'public'; // Default to public key for anonymous users
        
        if (userId) {
            // If user is authenticated, we can provide a user-specific key
            keyType = 'user';
        }
        
        // Generate an API key
        // In a production environment, this would be stored in a database
        // and associated with the user if authenticated
        const apiKey = generateApiKey(keyType);
        
        // In a real implementation, we would store this key with limits, expiration, etc.
        // For this example, we're just returning a key that's included in our valid keys list
        
        res.status(200).json({
            apiKey,
            expiresIn: '24h' // Key expires in 24 hours
        });
    } catch (error) {
        console.error('Error in requestApiKey:', error);
        res.status(500).json({ message: 'Server error generating API key' });
    }
};

/**
 * Verify if an API key is valid
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const verifyApiKey = async (req, res) => {
    try {
        const apiKey = req.header('X-API-Key');
        
        if (!apiKey) {
            return res.status(400).json({ message: 'No API key provided' });
        }
        
        // Check if the API key is valid
        // For this example, we're checking against environment variable
        const validKeys = process.env.VALID_API_KEYS ? process.env.VALID_API_KEYS.split(',') : [];
        
        if (validKeys.includes(apiKey)) {
            return res.status(200).json({ 
                valid: true,
                message: 'API key is valid'
            });
        }
        
        res.status(401).json({ 
            valid: false,
            message: 'Invalid API key'
        });
    } catch (error) {
        console.error('Error in verifyApiKey:', error);
        res.status(500).json({ message: 'Server error verifying API key' });
    }
};

/**
 * Generate an API key
 * @param {string} type - The type of key to generate ('public' or 'user')
 * @returns {string} - The generated API key
 */
function generateApiKey(type = 'public') {
    // In a real implementation, you would generate a secure random key
    // and store it in a database with appropriate limits, scope, etc.
    
    // For this example, we're returning one of the pre-configured valid keys
    const validKeys = process.env.VALID_API_KEYS ? process.env.VALID_API_KEYS.split(',') : [];
    
    // Use the first key for public and the second for users if available
    if (type === 'user' && validKeys.length > 1) {
        return validKeys[1];
    } else if (validKeys.length > 0) {
        return validKeys[0];
    }
    
    // Fallback - should never happen if environment is configured correctly
    return 'api_key_1';
}