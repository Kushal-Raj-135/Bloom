/**
 * Authentication Routes
 * Handles all authentication-related endpoints
 */

import express from "express";
import passport from "passport";
import authController from "../controllers/authController.js";
import { verifyToken } from "../middleware/auth.js";
import {
  validate,
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
  validateImageUpload,
} from "../middleware/validation.js";
import errorHandlers from "../middleware/errorHandler.js";

const router = express.Router();
const { catchAsync } = errorHandlers;

// Public routes
router.post(
  "/register",
  validate(registerSchema),
  catchAsync(authController.register),
);

router.post("/login", validate(loginSchema), catchAsync(authController.login));

router.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  catchAsync(authController.forgotPassword),
);

router.post(
  "/reset-password/:token",
  validate(resetPasswordSchema),
  catchAsync(authController.resetPassword),
);

// Google OAuth routes
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  catchAsync(authController.googleCallback),
);

// Protected routes (require authentication)
router.use(verifyToken); // All routes below this middleware require authentication

router.get("/me", catchAsync(authController.getProfile));

router.put(
  "/profile",
  validate(updateProfileSchema),
  catchAsync(authController.updateProfile),
);

router.put("/profile/picture", catchAsync(authController.updateProfilePicture));

router.post("/change-password", catchAsync(authController.changePassword));

router.post("/logout", catchAsync(authController.logout));

export default router;
