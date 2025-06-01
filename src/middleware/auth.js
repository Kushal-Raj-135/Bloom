/**
 * Authentication Middleware
 * Handles JWT token verification and user authentication
 */

import jwt from "jwt-simple";
import User from "../models/User.js";
import config from "../config/index.js";

/**
 * Verify JWT token and attach user to request
 */
export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.decode(token, config.jwt.secret);

      // Check if token is expired
      if (decoded.exp < Math.floor(Date.now() / 1000)) {
        return res.status(401).json({
          success: false,
          message: "Token has expired",
        });
      }

      // Verify user still exists
      const user = await User.findById(decoded.userId);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not found",
        });
      } // Check if user changed password after token was issued
      // Note: passwordChangedAt field not implemented in User model yet
      // if (
      //   user.security.passwordChangedAt &&
      //   decoded.iat <
      //     Math.floor(user.security.passwordChangedAt.getTime() / 1000)
      // ) {
      //   return res.status(401).json({
      //     success: false,
      //     message: "Password changed recently. Please login again.",
      //   });
      // }

      // Attach user ID to request
      req.userId = decoded.userId;
      req.user = user;
      next();
    } catch (tokenError) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({
      success: false,
      message: "Authentication error",
    });
  }
};

/**
 * Optional authentication - doesn't fail if no token provided
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];

      try {
        const decoded = jwt.decode(token, config.jwt.secret);

        if (decoded.exp >= Math.floor(Date.now() / 1000)) {
          const user = await User.findById(decoded.userId);
          if (user) {
            req.userId = decoded.userId;
            req.user = user;
          }
        }
      } catch (tokenError) {
        // Ignore token errors in optional auth
        console.log("Optional auth token error (ignored):", tokenError.message);
      }
    }

    next();
  } catch (error) {
    console.error("Optional auth middleware error:", error);
    next(); // Continue even if there's an error
  }
};

/**
 * Check if user is admin
 */
export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin privileges required.",
    });
  }
  next();
};

/**
 * Check if user profile is complete
 */
export const requireCompleteProfile = (req, res, next) => {
  if (!req.user || !req.user.profile.isComplete) {
    return res.status(400).json({
      success: false,
      message: "Please complete your profile to access this feature.",
    });
  }
  next();
};
