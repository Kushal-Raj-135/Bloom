/**
 * Authentication Controller
 * Handles all authentication-related operations including:
 * - User registration and login
 * - Google OAuth integration
 * - Password reset functionality
 * - Token management
 */

import bcrypt from "bcryptjs";
import jwt from "jwt-simple";
import crypto from "crypto";
import User from "../models/User.js";
import config from "../config/index.js";

class AuthController {
  /**
   * Register a new user
   */
  async register(req, res) {
    try {
      const { name, email, password } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "User already exists with this email",
        });
      }

      // Hash password
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create new user
      const user = new User({
        name,
        email,
        password: hashedPassword,
        profile: {
          isComplete: false,
        },
      });

      await user.save();

      // Generate JWT token
      const token = this.generateToken(user._id);

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: {
          user: user.getPublicProfile(),
          token,
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({
        success: false,
        message: "Registration failed",
        error: error.message,
      });
    }
  }

  /**
   * User login
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Find user by email
      const user = await User.findOne({ email }).select("+password");
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      // Check if account is locked
      if (user.security.isLocked && user.security.lockUntil > Date.now()) {
        const lockTimeRemaining = Math.ceil(
          (user.security.lockUntil - Date.now()) / 60000
        );
        return res.status(423).json({
          success: false,
          message: `Account is locked. Try again in ${lockTimeRemaining} minutes.`,
        });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        // Increment failed login attempts
        await user.incrementLoginAttempts();
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      // Reset failed login attempts on successful login
      await user.resetLoginAttempts();

      // Update last login
      user.security.lastLogin = new Date();
      await user.save();

      // Generate JWT token
      const token = this.generateToken(user._id);

      res.json({
        success: true,
        message: "Login successful",
        data: {
          user: user.getPublicProfile(),
          token,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        success: false,
        message: "Login failed",
        error: error.message,
      });
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(req, res) {
    try {
      const user = await User.findById(req.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      res.json({
        success: true,
        data: {
          user: user.getPublicProfile(),
        },
      });
    } catch (error) {
      console.error("Get profile error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch user profile",
        error: error.message,
      });
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(req, res) {
    try {
      const allowedUpdates = [
        "name",
        "profile.phone",
        "profile.location.address",
        "profile.location.city",
        "profile.location.state",
        "profile.location.country",
        "profile.location.pincode",
        "profile.bio",
        "preferences.language",
        "preferences.units",
        "preferences.notifications.email",
        "preferences.notifications.push",
      ];

      const updates = {};
      Object.keys(req.body).forEach((key) => {
        if (allowedUpdates.includes(key)) {
          this.setNestedProperty(updates, key, req.body[key]);
        }
      });

      const user = await User.findByIdAndUpdate(
        req.userId,
        { $set: updates },
        { new: true, runValidators: true }
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      res.json({
        success: true,
        message: "Profile updated successfully",
        data: {
          user: user.getPublicProfile(),
        },
      });
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update profile",
        error: error.message,
      });
    }
  }

  /**
   * Update profile picture
   */
  async updateProfilePicture(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No image file provided",
        });
      }

      const profilePictureUrl = `/uploads/profile-pictures/${req.file.filename}`;

      const user = await User.findByIdAndUpdate(
        req.userId,
        { profilePicture: profilePictureUrl },
        { new: true }
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      res.json({
        success: true,
        message: "Profile picture updated successfully",
        data: {
          profilePicture: profilePictureUrl,
        },
      });
    } catch (error) {
      console.error("Update profile picture error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update profile picture",
        error: error.message,
      });
    }
  }

  /**
   * Initiate password reset
   */
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        // Return success to prevent email enumeration
        return res.json({
          success: true,
          message:
            "If an account exists with this email, you will receive password reset instructions.",
        });
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenExpiry = Date.now() + 3600000; // 1 hour

      user.resetToken = resetToken;
      user.resetTokenExpiry = resetTokenExpiry;
      await user.save();

      // TODO: Send email with reset link
      // For now, log the reset URL
      const resetUrl = `${req.protocol}://${req.get(
        "host"
      )}/reset-password/${resetToken}`;
      console.log("Password reset URL:", resetUrl);

      res.json({
        success: true,
        message:
          "If an account exists with this email, you will receive password reset instructions.",
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to process password reset request",
        error: error.message,
      });
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(req, res) {
    try {
      const { token } = req.params;
      const { password } = req.body;

      const user = await User.findOne({
        resetToken: token,
        resetTokenExpiry: { $gt: Date.now() },
      });

      if (!user) {
        return res.status(400).json({
          success: false,
          message: "Password reset token is invalid or has expired",
        });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(password, salt);

      user.password = hashedPassword;
      user.resetToken = undefined;
      user.resetTokenExpiry = undefined;
      user.security.passwordChangedAt = new Date();
      await user.save();

      res.json({
        success: true,
        message: "Password has been reset successfully",
      });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to reset password",
        error: error.message,
      });
    }
  }

  /**
   * Change password for authenticated user
   */
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;

      const user = await User.findById(req.userId).select("+password");
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(
        currentPassword,
        user.password
      );
      if (!isValidPassword) {
        return res.status(400).json({
          success: false,
          message: "Current password is incorrect",
        });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      user.password = hashedPassword;
      user.security.passwordChangedAt = new Date();
      await user.save();

      res.json({
        success: true,
        message: "Password changed successfully",
      });
    } catch (error) {
      console.error("Change password error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to change password",
        error: error.message,
      });
    }
  }

  /**
   * Handle Google OAuth callback
   */
  async googleCallback(req, res) {
    try {
      // User is attached to req by passport
      const user = req.user;

      // Generate JWT token
      const token = this.generateToken(user._id);

      // Redirect to frontend with token
      res.redirect(`${config.frontend.url}/?token=${token}`);
    } catch (error) {
      console.error("Google OAuth callback error:", error);
      res.redirect(`${config.frontend.url}/login?error=oauth_failed`);
    }
  }

  /**
   * Logout user (client-side token invalidation)
   */
  async logout(req, res) {
    try {
      // In a more complex setup, you might want to blacklist the token
      // For now, we'll just send a success response
      res.json({
        success: true,
        message: "Logged out successfully",
      });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({
        success: false,
        message: "Logout failed",
        error: error.message,
      });
    }
  }

  /**
   * Generate JWT token
   */
  generateToken(userId) {
    const payload = {
      userId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
    };

    return jwt.encode(payload, config.jwt.secret);
  }

  /**
   * Helper method to set nested properties
   */
  setNestedProperty(obj, path, value) {
    const keys = path.split(".");
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
      if (!(keys[i] in current)) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = value;
  }
}

export default new AuthController();
