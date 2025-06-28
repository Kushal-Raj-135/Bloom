import rateLimit from 'express-rate-limit';
import { body, validationResult, param, query } from 'express-validator';

/**
 * API Security Middleware
 * Provides various security functions for API endpoints
 */

/**
 * Input validation middleware
 */
export const validateInput = (validations) => {
    return async (req, res, next) => {
        // Run all validations
        await Promise.all(validations.map(validation => validation.run(req)));

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        next();
    };
};

/**
 * Login validation rules
 */
export const loginValidation = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    body('password')
        .isLength({ min: 1 })
        .withMessage('Password is required')
];

/**
 * Registration validation rules
 */
export const registerValidation = [
    body('name')
        .isLength({ min: 2, max: 50 })
        .trim()
        .withMessage('Name must be between 2 and 50 characters'),
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    body('password')
        .isLength({ min: 8 })
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character')
];

/**
 * Password reset validation rules
 */
export const passwordResetValidation = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address')
];

/**
 * Reset password validation rules
 */
export const resetPasswordValidation = [
    body('resetToken')
        .isLength({ min: 1 })
        .withMessage('Reset token is required'),
    body('newPassword')
        .isLength({ min: 8 })
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character')
];

/**
 * Profile update validation rules
 */
export const profileUpdateValidation = [
    body('name')
        .optional()
        .isLength({ min: 2, max: 50 })
        .trim()
        .withMessage('Name must be between 2 and 50 characters'),
    body('email')
        .optional()
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address')
];

/**
 * Rate limiting configurations
 */
export const authRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window per IP
    message: {
        error: 'Too many authentication attempts',
        message: 'Please try again after 15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true
});

export const passwordResetRateLimit = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 attempts per hour per IP
    message: {
        error: 'Too many password reset attempts',
        message: 'Please try again after 1 hour'
    },
    standardHeaders: true,
    legacyHeaders: false
});

export const generalApiRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window per IP
    message: {
        error: 'Too many requests',
        message: 'Please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false
});

/**
 * CSRF protection for state-changing operations
 */
export const csrfProtection = (req, res, next) => {
    // Skip CSRF for GET, HEAD, OPTIONS requests
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return next();
    }

    const token = req.headers['x-csrf-token'] || req.body._csrf;
    const sessionToken = req.session?.csrfToken;

    if (!token || !sessionToken || token !== sessionToken) {
        return res.status(403).json({
            error: 'CSRF token validation failed',
            message: 'Invalid or missing CSRF token'
        });
    }

    next();
};

/**
 * Generate CSRF token
 */
export const generateCSRFToken = (req, res, next) => {
    if (!req.session.csrfToken) {
        req.session.csrfToken = require('crypto').randomBytes(32).toString('hex');
    }
    res.locals.csrfToken = req.session.csrfToken;
    next();
};

/**
 * Sanitize user input
 */
export const sanitizeInput = (req, res, next) => {
    const sanitizeString = (str) => {
        if (typeof str !== 'string') return str;
        return str.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    };

    const sanitizeObject = (obj) => {
        if (obj && typeof obj === 'object') {
            for (const key in obj) {
                if (typeof obj[key] === 'string') {
                    obj[key] = sanitizeString(obj[key]);
                } else if (typeof obj[key] === 'object') {
                    sanitizeObject(obj[key]);
                }
            }
        }
    };

    sanitizeObject(req.body);
    sanitizeObject(req.query);
    sanitizeObject(req.params);

    next();
};

/**
 * API Key validation middleware
 */
export const validateApiKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    
    if (!apiKey) {
        return res.status(401).json({
            error: 'API key required',
            message: 'Please provide a valid API key'
        });
    }

    // In production, validate against database
    const validKeys = process.env.VALID_API_KEYS?.split(',') || [];
    
    if (!validKeys.includes(apiKey)) {
        return res.status(401).json({
            error: 'Invalid API key',
            message: 'The provided API key is not valid'
        });
    }

    next();
};

/**
 * Request logging middleware
 */
export const logRequest = (req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
        const duration = Date.now() - start;
        const logData = {
            method: req.method,
            url: req.url,
            status: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            timestamp: new Date().toISOString()
        };
        
        if (req.user) {
            logData.userId = req.user.id;
        }
        
        console.log('API Request:', JSON.stringify(logData));
    });
    
    next();
};

/**
 * Error handling middleware
 */
export const handleApiError = (error, req, res, next) => {
    console.error('API Error:', error);

    // Mongoose validation error
    if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(err => ({
            field: err.path,
            message: err.message
        }));
        
        return res.status(400).json({
            error: 'Validation failed',
            message: 'Please check your input data',
            errors
        });
    }

    // Mongoose duplicate key error
    if (error.code === 11000) {
        const field = Object.keys(error.keyValue)[0];
        return res.status(400).json({
            error: 'Duplicate entry',
            message: `${field} already exists`
        });
    }

    // JWT errors
    if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
            error: 'Invalid token',
            message: 'Authentication token is invalid'
        });
    }

    if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
            error: 'Token expired',
            message: 'Authentication token has expired'
        });
    }

    // Default server error
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'production' 
            ? 'Something went wrong' 
            : error.message
    });
};
