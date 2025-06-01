// BioBloom Agricultural Application Server
// Main server file with MVC architecture

import express from "express";
import cors from "cors";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Import configuration and database
import config from "./src/config/index.js";
import connectDB from "./src/config/database.js";

// Import middleware
import errorHandlers from "./src/middleware/errorHandler.js";
import logger from "./src/utils/logger.js";

// Import passport configuration
import "./src/config/passport.js";
import passport from "passport";

// Import routes
import routes from "./src/routes/index.js";

// Set up ES module paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Express app
const app = express();
const PORT = config.server.port;

// Trust proxy (important for production)
app.set("trust proxy", 1);

// Connect to Database
connectDB.connect();

// CORS Configuration
app.use(cors(config.cors));

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Session middleware
app.use(
  session({
    secret: config.session.secret,
    name: config.session.name,
    resave: config.session.resave,
    saveUninitialized: config.session.saveUninitialized,
    cookie: config.session.cookie,
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Static file serving
app.use(express.static(path.join(__dirname, "frontend"))); // Serve files from frontend directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path} - ${req.ip}`);
  next();
});

// API Routes
app.use("/api", routes);

// Serve static HTML files
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend/pages/index.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend/pages/login.html"));
});

app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend/pages/register.html"));
});

app.get("/profile", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend/pages/profile.html"));
});

app.get("/forgot-password", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend/pages/forgot-password.html"));
});

app.get("/reset-password/:token", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend/pages/reset-password.html"));
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.server.env,
  });
});

// Handle 404 errors
app.use("*", errorHandlers.notFound);

// Global error handling middleware
app.use(errorHandlers.globalErrorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`🌱 BioBloom server running on port ${PORT}`);
  logger.info(`🌍 Environment: ${config.server.env}`);
  logger.info(`📍 Server URL: http://localhost:${PORT}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM received, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  logger.info("SIGINT received, shutting down gracefully");
  process.exit(0);
});
