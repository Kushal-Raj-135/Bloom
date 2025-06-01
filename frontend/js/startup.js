#!/usr/bin/env node

/**
 * BioBloom Application Startup Script
 * Performs initial checks and starts the server
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

const log = {
  info: (msg) => console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  header: (msg) =>
    console.log(`\n${colors.bright}${colors.blue}${msg}${colors.reset}\n`),
};

async function checkEnvironment() {
  log.header("🌱 BioBloom Pre-flight Check");

  // Check if .env file exists
  const envPath = path.join(__dirname, ".env");
  if (!fs.existsSync(envPath)) {
    log.warning(".env file not found");
    log.info("Creating .env file from template...");

    const envExamplePath = path.join(__dirname, ".env.example");
    if (fs.existsSync(envExamplePath)) {
      fs.copyFileSync(envExamplePath, envPath);
      log.success(".env file created from .env.example");
      log.warning("Please configure your environment variables in .env file");
    } else {
      log.error(".env.example template not found");
      return false;
    }
  } else {
    log.success(".env file found");
  }

  // Check required directories
  const requiredDirs = ["logs", "uploads"];
  for (const dir of requiredDirs) {
    const dirPath = path.join(__dirname, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      log.success(`Created ${dir} directory`);
    } else {
      log.success(`${dir} directory exists`);
    }
  }

  return true;
}

async function validateMVCStructure() {
  log.header("📁 Validating MVC Structure");

  const requiredPaths = [
    "src/config/index.js",
    "src/config/database.js",
    "src/config/passport.js",
    "src/models/User.js",
    "src/models/Crop.js",
    "src/controllers/authController.js",
    "src/controllers/cropController.js",
    "src/middleware/auth.js",
    "src/middleware/validation.js",
    "src/middleware/errorHandler.js",
    "src/routes/index.js",
    "src/routes/auth.js",
    "src/routes/crops.js",
    "src/services/groqService.js",
    "src/utils/logger.js",
  ];

  let missingFiles = [];

  for (const filePath of requiredPaths) {
    const fullPath = path.join(__dirname, filePath);
    if (fs.existsSync(fullPath)) {
      log.success(`${filePath}`);
    } else {
      log.error(`Missing: ${filePath}`);
      missingFiles.push(filePath);
    }
  }

  if (missingFiles.length > 0) {
    log.error(`Found ${missingFiles.length} missing files in MVC structure`);
    return false;
  }

  log.success("MVC structure validation complete");
  return true;
}

async function checkDependencies() {
  log.header("📦 Checking Dependencies");

  try {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(__dirname, "package.json"), "utf8"),
    );
    const requiredDeps = [
      "express",
      "mongoose",
      "bcryptjs",
      "jsonwebtoken",
      "joi",
      "winston",
      "cors",
      "dotenv",
      "passport",
      "passport-google-oauth20",
      "multer",
      "node-fetch",
    ];

    const missingDeps = requiredDeps.filter(
      (dep) => !packageJson.dependencies[dep],
    );

    if (missingDeps.length > 0) {
      log.error(`Missing dependencies: ${missingDeps.join(", ")}`);
      log.info("Run: npm install " + missingDeps.join(" "));
      return false;
    }

    log.success("All required dependencies are installed");
    return true;
  } catch (error) {
    log.error("Failed to read package.json");
    return false;
  }
}

async function startServer() {
  log.header("🚀 Starting BioBloom Server");

  try {
    // Import and start the server
    const { default: app } = await import("./server.js");
    log.success("Server started successfully!");
    log.info("API Documentation: http://localhost:3000/api/docs");
    log.info("Health Check: http://localhost:3000/api/health");
  } catch (error) {
    log.error("Failed to start server:");
    console.error(error);
    process.exit(1);
  }
}

async function main() {
  try {
    console.log(`${colors.bright}${colors.magenta}`);
    console.log("╔══════════════════════════════════════╗");
    console.log("║           🌱 BioBloom 🌱             ║");
    console.log("║     Sustainable Farming Solutions    ║");
    console.log("╚══════════════════════════════════════╝");
    console.log(colors.reset);

    const envCheck = await checkEnvironment();
    if (!envCheck) {
      log.error("Environment check failed");
      process.exit(1);
    }

    const structureCheck = await validateMVCStructure();
    if (!structureCheck) {
      log.error("MVC structure validation failed");
      process.exit(1);
    }

    const depsCheck = await checkDependencies();
    if (!depsCheck) {
      log.error("Dependencies check failed");
      process.exit(1);
    }

    log.success("All pre-flight checks passed!");

    await startServer();
  } catch (error) {
    log.error("Startup failed:");
    console.error(error);
    process.exit(1);
  }
}

// Run the startup script
main();
