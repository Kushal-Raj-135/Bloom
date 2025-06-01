/**
 * Waste Management Controller
 * Handles agricultural waste management recommendations and analysis
 */

import groqService from "../services/groqService.js";
import { AppError } from "../middleware/errorHandler.js";

/**
 * Get AI-powered waste management recommendations
 */
export const getWasteRecommendations = async (req, res, next) => {
  try {
    const { cropType, quantity, location } = req.body;
    // Validate input
    if (!cropType || !quantity || !location) {
      return next(
        new AppError("Crop type, quantity, and location are required", 400),
      );
    }

    if (!location.lat || !location.lng || !location.address) {
      return next(
        new AppError("Complete location information is required", 400),
      );
    }

    // Validate quantity
    const wasteQuantity = parseInt(quantity);
    if (isNaN(wasteQuantity) || wasteQuantity <= 0) {
      return next(new AppError("Valid waste quantity is required", 400));
    }

    // Get recommendations from Groq AI
    const recommendations = await groqService.getWasteManagementRecommendations(
      cropType.toLowerCase(),
      wasteQuantity,
      location,
    );

    res.status(200).json({
      success: true,
      data: {
        recommendations,
        inputData: {
          cropType,
          quantity: wasteQuantity,
          location,
        },
      },
      message: "Waste management recommendations generated successfully",
    });
  } catch (error) {
    console.error("Waste recommendations error:", error);
    next(error);
  }
};

/**
 * Get mock recommendations for fallback
 */
export const getMockRecommendations = async (req, res, next) => {
  try {
    let { cropType } = req.params;
    if (!cropType) cropType = "wheat"; // default

    // Mock data for different crops
    const mockRecommendations = {
      wheat: {
        biofuel: {
          confidence: 0.85,
          description:
            "Convert wheat straw into bioethanol through advanced fermentation processes.",
          steps: [
            "Waste collection and sorting",
            "Pre-treatment and size reduction",
            "Enzymatic hydrolysis process",
            "Fermentation to bioethanol",
            "Distillation and purification",
          ],
          equipment: [
            "Wheat straw collection system",
            "Shredding equipment",
            "Hydrolysis reactor",
            "Fermentation tanks",
            "Distillation unit",
          ],
          impact: {
            aqi: 15.0,
            carbon: 2.5,
            economic: 41500,
          },
        },
        composting: {
          confidence: 0.75,
          description:
            "Transform wheat residues into nutrient-rich organic compost for soil enhancement.",
          steps: [
            "Waste collection and sorting",
            "Initial composting setup",
            "Regular turning and monitoring",
            "Maturation period",
            "Compost screening and packaging",
          ],
          equipment: [
            "Composting bins",
            "Temperature probes",
            "Turning equipment",
            "Screening machine",
            "Packaging system",
          ],
          impact: {
            aqi: 12.5,
            carbon: 1.8,
            economic: 28750,
          },
        },
        recycling: {
          confidence: 0.65,
          description:
            "Process wheat straw into biodegradable packaging materials and paper products.",
          steps: [
            "Waste collection and sorting",
            "Material separation",
            "Cleaning and processing",
            "Quality control",
            "Distribution to industries",
          ],
          equipment: [
            "Sorting conveyor",
            "Cleaning system",
            "Processing machinery",
            "Quality control tools",
            "Packaging equipment",
          ],
          impact: {
            aqi: 10.0,
            carbon: 1.2,
            economic: 22500,
          },
        },
      },
      rice: {
        biofuel: {
          confidence: 0.9,
          description:
            "Convert rice straw and husk into biogas through anaerobic digestion processes.",
          steps: [
            "Waste collection and sorting",
            "Pre-treatment and size reduction",
            "Anaerobic digestion process",
            "Biogas purification",
            "Energy generation and storage",
          ],
          equipment: [
            "Rice waste collection system",
            "Shredding equipment",
            "Anaerobic digester",
            "Biogas purification unit",
            "Power generation system",
          ],
          impact: {
            aqi: 18.0,
            carbon: 3.0,
            economic: 45000,
          },
        },
        composting: {
          confidence: 0.8,
          description:
            "Transform rice residues into high-quality organic fertilizer through controlled composting.",
          steps: [
            "Waste collection and preparation",
            "Composting pile formation",
            "Moisture and temperature control",
            "Regular monitoring and turning",
            "Final screening and packaging",
          ],
          equipment: [
            "Collection and transport system",
            "Composting bins and structures",
            "Monitoring equipment",
            "Turning machinery",
            "Screening and packaging unit",
          ],
          impact: {
            aqi: 14.0,
            carbon: 2.2,
            economic: 32000,
          },
        },
        recycling: {
          confidence: 0.7,
          description:
            "Process rice straw into construction materials and biodegradable products.",
          steps: [
            "Waste collection and sorting",
            "Material processing",
            "Product manufacturing",
            "Quality testing",
            "Market distribution",
          ],
          equipment: [
            "Sorting and cleaning system",
            "Processing machinery",
            "Manufacturing equipment",
            "Testing laboratory",
            "Distribution network",
          ],
          impact: {
            aqi: 11.5,
            carbon: 1.5,
            economic: 26000,
          },
        },
      },
    };

    const cropData =
      mockRecommendations[cropType.toLowerCase()] || mockRecommendations.wheat;

    res.status(200).json({
      success: true,
      data: {
        recommendations: cropData,
        inputData: {
          cropType,
          source: "mock_data",
        },
      },
      message: "Mock waste management recommendations retrieved successfully",
    });
  } catch (error) {
    console.error("Mock recommendations error:", error);
    next(error);
  }
};
