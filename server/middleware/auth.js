import jwt from 'jsonwebtoken';
import { authConfig } from '../config/config.js';
import User from '../models/User.js';

// Token blacklist (in production, use Redis)
const tokenBlacklist = new Set();

/**
 * Authentication middleware to verify JWT token
 */
export const authenticate = async (req, res, next) => {
    try {
        // Get token from header or cookies
        const authHeader = req.header('Authorization');
        const headerToken = authHeader?.replace('Bearer ', '');
        const cookieToken = req.cookies?.['auth-token'];
        
        const token = headerToken || cookieToken;
        
        if (!token) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        // Check if token is blacklisted
        if (tokenBlacklist.has(token)) {
            return res.status(401).json({ message: 'Token has been revoked' });
        }

        // Verify token
        const decoded = jwt.verify(token, authConfig.jwtSecret);
        
        // Find user by id
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        // Check if account is locked
        if (user.lockUntil && user.lockUntil > Date.now()) {
            return res.status(423).json({ message: 'Account is temporarily locked' });
        }

        // Attach user to request
        req.user = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role || 'user'
        };

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token has expired' });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token' });
        }
        
        console.error('Authentication error:', error);
        res.status(401).json({ message: 'Authentication failed' });
    }
};

/**
 * Role-based authorization middleware
 */
export const authorize = (roles = []) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        if (roles.length && !roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Access forbidden - insufficient permissions' });
        }

        next();
    };
};

/**
 * Optional authentication middleware - doesn't fail if no token
 */
export const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        const headerToken = authHeader?.replace('Bearer ', '');
        const cookieToken = req.cookies?.['auth-token'];
        
        const token = headerToken || cookieToken;
        
        if (token && !tokenBlacklist.has(token)) {
            const decoded = jwt.verify(token, authConfig.jwtSecret);
            const user = await User.findById(decoded.id);
            
            if (user && (!user.lockUntil || user.lockUntil <= Date.now())) {
                req.user = {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role || 'user'
                };
            }
        }
        
        next();
    } catch (error) {
        // Continue without authentication for optional auth
        next();
    }
};

/**
 * Middleware to add token to blacklist
 */
export const addToBlacklist = (token) => {
    tokenBlacklist.add(token);
};

/**
 * Check if token is blacklisted
 */
export const isBlacklisted = (token) => {
    return tokenBlacklist.has(token);
};
