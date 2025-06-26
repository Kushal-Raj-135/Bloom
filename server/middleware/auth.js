import jwt from 'jsonwebtoken';
import { authConfig } from '../config/config.js';
import User from '../models/User.js';

/**
 * Authentication middleware to verify JWT token
 */
export const authenticate = async (req, res, next) => {
    try {
        // Get token from header
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        // Verify token
        const decoded = jwt.verify(token, authConfig.jwtSecret);
        
        // Find user by id
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        // Attach user to request
        req.user = {
            id: user._id,
            name: user.name,
            email: user.email
        };

        next();
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(401).json({ message: 'Invalid or expired token' });
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
            return res.status(403).json({ message: 'Access forbidden' });
        }

        next();
    };
};
