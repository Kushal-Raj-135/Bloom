// Simple test script to verify MVC components
import dotenv from "dotenv";
dotenv.config();

console.log("🧪 Testing BioBloom MVC Components...\n");

// Test 1: Configuration
try {
  const config = await import("./src/config/index.js");
  console.log("✅ Configuration module loaded");
  console.log(`   Port: ${config.default.server.port}`);
  console.log(`   Environment: ${config.default.server.nodeEnv}`);
} catch (error) {
  console.log("❌ Configuration module failed:", error.message);
}

// Test 2: Database connection (without actually connecting)
try {
  const database = await import("./src/config/database.js");
  console.log("✅ Database module loaded");
} catch (error) {
  console.log("❌ Database module failed:", error.message);
}

// Test 3: Controllers
try {
  const authController = await import("./src/controllers/authController.js");
  const cropController = await import("./src/controllers/cropController.js");
  console.log("✅ Controllers loaded");
} catch (error) {
  console.log("❌ Controllers failed:", error.message);
}

// Test 4: Routes
try {
  const routes = await import("./src/routes/index.js");
  console.log("✅ Routes loaded");
} catch (error) {
  console.log("❌ Routes failed:", error.message);
}

// Test 5: Middleware
try {
  const auth = await import("./src/middleware/auth.js");
  const validation = await import("./src/middleware/validation.js");
  const errorHandler = await import("./src/middleware/errorHandler.js");
  console.log("✅ Middleware loaded");
} catch (error) {
  console.log("❌ Middleware failed:", error.message);
}

// Test 6: Services
try {
  const groqService = await import("./src/services/groqService.js");
  const weatherService = await import("./src/services/weatherService.js");
  const aqiService = await import("./src/services/aqiService.js");
  console.log("✅ Services loaded");
} catch (error) {
  console.log("❌ Services failed:", error.message);
}

// Test 7: Models
try {
  const User = await import("./src/models/User.js");
  const Crop = await import("./src/models/Crop.js");
  console.log("✅ Models loaded");
} catch (error) {
  console.log("❌ Models failed:", error.message);
}

// Test 8: Utils
try {
  const logger = await import("./src/utils/logger.js");
  const helpers = await import("./src/utils/helpers.js");
  console.log("✅ Utils loaded");
} catch (error) {
  console.log("❌ Utils failed:", error.message);
}

console.log("\n🎉 MVC component test completed!");
console.log(
  "\n📝 Note: Some components may require environment variables to be properly configured.",
);
console.log("   Please ensure your .env file has all required variables set.");
