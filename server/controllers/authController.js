import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { authConfig } from '../config/config.js';
import User from '../models/User.js';

// Token blacklist for logout (in production, use Redis)
const tokenBlacklist = new Set();

/**
 * Generate access and refresh tokens
 */
export const generateTokens = (user) => {
    const payload = {
        id: user._id,
        email: user.email,
        role: user.role || 'user'
    };

    const accessToken = jwt.sign(payload, authConfig.jwtSecret, { expiresIn: '15m' });
    const refreshToken = jwt.sign(payload, authConfig.jwtSecret, { expiresIn: '7d' });

    return { accessToken, refreshToken };
};

/**
 * Register a new user
 */
export const register = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        if (password.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters long' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        // Hash password with higher salt rounds
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = new User({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            role: 'user'
        });

        // Save user to database
        await newUser.save();

        res.status(201).json({ 
            message: 'Registration successful',
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

/**
 * Login a user
 */
export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Validate input
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Find user by email (case insensitive)
        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check if account is locked
        if (user.lockUntil && user.lockUntil > Date.now()) {
            return res.status(423).json({ message: 'Account temporarily locked due to too many failed login attempts' });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            // Increment failed login attempts
            await User.findByIdAndUpdate(user._id, {
                $inc: { loginAttempts: 1 },
                $set: { 
                    lockUntil: user.loginAttempts >= 4 ? Date.now() + 30 * 60 * 1000 : undefined // Lock for 30 minutes after 5 attempts
                }
            });
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Reset login attempts on successful login
        if (user.loginAttempts > 0) {
            await User.findByIdAndUpdate(user._id, {
                $set: { 
                    loginAttempts: 0,
                    lockUntil: undefined,
                    lastLogin: new Date()
                }
            });
        }

        // Generate tokens
        const { accessToken, refreshToken } = generateTokens(user);

        // Set secure cookies
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

        res.status(200).json({
            message: 'Login successful',
            token: accessToken, // For backward compatibility
            refreshToken: refreshToken, // For backward compatibility
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                profilePicture: user.profilePicture,
                role: user.role || 'user'
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

/**
 * Logout a user
 */
export const logout = async (req, res) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '') || req.cookies['auth-token'];
        
        if (token) {
            // Add token to blacklist
            tokenBlacklist.add(token);
        }

        // Clear cookies
        res.clearCookie('auth-token');
        res.clearCookie('refresh-token');

        res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ message: 'Server error during logout' });
    }
};

/**
 * Refresh authentication token
 */
export const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        const cookieRefreshToken = req.cookies['refresh-token'];
        
        const token = refreshToken || cookieRefreshToken;
        
        if (!token) {
            return res.status(401).json({ message: 'Refresh token required' });
        }

        // Check if token is blacklisted
        if (tokenBlacklist.has(token)) {
            return res.status(401).json({ message: 'Token has been revoked' });
        }

        // Verify refresh token
        const decoded = jwt.verify(token, authConfig.jwtSecret);
        
        // Find user
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        // Generate new tokens
        const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

        // Set new cookies
        res.cookie('auth-token', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 15 * 60 * 1000
        });

        res.cookie('refresh-token', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        // Blacklist old refresh token
        tokenBlacklist.add(token);

        res.status(200).json({
            token: accessToken,
            refreshToken: newRefreshToken
        });
    } catch (error) {
        console.error('Token refresh error:', error);
        res.status(401).json({ message: 'Invalid or expired refresh token' });
    }
};

/**
 * Verify JWT token
 */
export const verifyToken = async (req, res) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '') || req.cookies['auth-token'];
        
        if (!token) {
            return res.status(401).json({ valid: false, message: 'No token provided' });
        }

        // Check if token is blacklisted
        if (tokenBlacklist.has(token)) {
            return res.status(401).json({ valid: false, message: 'Token has been revoked' });
        }

        // Verify token
        const decoded = jwt.verify(token, authConfig.jwtSecret);
        
        // Find user
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ valid: false, message: 'User not found' });
        }
        
        res.json({ 
            valid: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                profilePicture: user.profilePicture,
                role: user.role || 'user'
            }
        });
    } catch (error) {
        console.error('Token verification error:', error);
        res.status(401).json({ valid: false, message: 'Invalid or expired token' });
    }
};

/**
 * Update user profile
 */
export const updateProfile = async (req, res) => {
    const { name, email } = req.body;
    const userId = req.user.id;

    try {
        const updates = {
            name,
            email: email?.toLowerCase(),
            updatedAt: new Date()
        };

        // Check if email is already taken by another user
        if (email) {
            const existingUser = await User.findOne({ 
                email: email.toLowerCase(), 
                _id: { $ne: userId } 
            });
            if (existingUser) {
                return res.status(400).json({ message: 'Email is already taken by another user' });
            }
        }

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
                email: updatedUser.email,                profilePicture: updatedUser.profilePicture,
                role: updatedUser.role
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