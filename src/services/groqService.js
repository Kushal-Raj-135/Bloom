/**
 * Groq AI Service
 * Handles all AI-powered recommendations and analysis using Groq API
 */

import fetch from "node-fetch";
import config from "../config/index.js";
import { AppError } from "../middleware/errorHandler.js";

class GroqService {
  constructor() {
    this.apiKey = config.apis.groq.key;
    this.apiUrl = config.apis.groq.baseUrl;
    this.model = "llama3-8b-8192"; // Default model
  }

  /**
   * Generate crop rotation recommendations
   */
  async getCropRecommendations(cropInfo) {
    const prompt = this.buildCropRecommendationPrompt(cropInfo);

    try {
      const response = await this.makeGroqRequest(
        prompt,
        "agricultural advisor",
      );
      return response;
    } catch (error) {
      console.error("Groq crop recommendations error:", error);
      throw new AppError("Failed to generate crop recommendations", 500);
    }
  }

  /**
   * Generate comprehensive crop analysis
   */
  async getCropAnalysis(prompt) {
    try {
      const response = await this.makeGroqRequest(
        prompt,
        "agricultural analysis expert",
      );
      return response;
    } catch (error) {
      console.error("Groq crop analysis error:", error);
      throw new AppError("Failed to generate crop analysis", 500);
    }
  }

  /**
   * Generate weather-based farming advice
   */
  async getWeatherBasedAdvice(cropName, location, weatherData) {
    const prompt = this.buildWeatherAdvicePrompt(
      cropName,
      location,
      weatherData,
    );

    try {
      const response = await this.makeGroqRequest(
        prompt,
        "agricultural meteorologist",
      );
      return response;
    } catch (error) {
      console.error("Groq weather advice error:", error);
      throw new AppError("Failed to generate weather-based advice", 500);
    }
  }

  /**
   * Generate AQI-based farming recommendations
   */
  async getAQIBasedAdvice(cropName, location, aqiData) {
    const prompt = this.buildAQIAdvicePrompt(cropName, location, aqiData);

    try {
      const response = await this.makeGroqRequest(
        prompt,
        "environmental agricultural specialist",
      );
      return response;
    } catch (error) {
      console.error("Groq AQI advice error:", error);
      throw new AppError("Failed to generate AQI-based advice", 500);
    }
  }
  /**
   * Generate agricultural waste management recommendations
   */
  async getWasteManagementRecommendations(cropType, quantity, location) {
    const prompt = this.buildWasteManagementPrompt(
      cropType,
      quantity,
      location,
    );

    try {
      const response = await this.makeGroqRequest(
        prompt,
        "agricultural waste management specialist",
      );

      // Try multiple JSON extraction methods
      const recommendations = this.extractAndParseJSON(response);
      return this.validateAndNormalizeRecommendations(recommendations);
    } catch (error) {
      console.error("Groq waste management error:", error);

      // If JSON parsing fails, generate fallback recommendations
      console.log(
        "Falling back to generated recommendations based on crop type and quantity",
      );
      return this.generateFallbackRecommendations(cropType, quantity, location);
    }
  }

  /**
   * Generate fallback recommendations when AI fails
   */
  generateFallbackRecommendations(cropType, quantity, location) {
    const baseRecommendations = {
      biofuel: {
        confidence: 0.8,
        description: `Convert ${cropType} waste into renewable biofuel through modern processing techniques. This sustainable approach reduces greenhouse gas emissions while creating valuable energy resources.`,
        steps: [
          "Collection and transportation of crop residue",
          "Pre-treatment and size reduction of biomass",
          "Conversion process (pyrolysis/gasification)",
          "Purification and quality control",
          "Storage and distribution of biofuel",
        ],
        equipment: [
          "Biomass collection system",
          "Shredding and grinding equipment",
          "Biofuel conversion reactor",
          "Purification and filtration unit",
          "Storage and distribution system",
        ],
        impact: {
          aqi: Math.min(20, Math.max(5, 12 + quantity / 10000)),
          carbon: Math.min(5, Math.max(1, 2 + quantity / 50000)),
          economic: Math.min(50000, Math.max(20000, 30000 + quantity * 10)),
        },
      },
      composting: {
        confidence: 0.75,
        description: `Transform ${cropType} residue into nutrient-rich organic compost through controlled decomposition. This method improves soil health and reduces dependence on chemical fertilizers.`,
        steps: [
          "Collection and preparation of organic waste",
          "Composting pile setup with proper ratios",
          "Regular monitoring and turning",
          "Maturation and curing process",
          "Screening and packaging of finished compost",
        ],
        equipment: [
          "Collection and transport vehicles",
          "Composting bins or windrow system",
          "Temperature and moisture monitoring tools",
          "Turning and mixing equipment",
          "Screening and packaging machinery",
        ],
        impact: {
          aqi: Math.min(20, Math.max(5, 10 + quantity / 15000)),
          carbon: Math.min(5, Math.max(1, 1.5 + quantity / 60000)),
          economic: Math.min(50000, Math.max(20000, 25000 + quantity * 8)),
        },
      },
      recycling: {
        confidence: 0.7,
        description: `Process ${cropType} waste into valuable products like biodegradable packaging, paper products, or construction materials. This approach creates circular economy opportunities.`,
        steps: [
          "Sorting and cleaning of crop residue",
          "Material processing and preparation",
          "Manufacturing of recycled products",
          "Quality testing and certification",
          "Marketing and distribution to end users",
        ],
        equipment: [
          "Sorting and cleaning machinery",
          "Processing and manufacturing equipment",
          "Quality testing laboratory",
          "Packaging and labeling system",
          "Distribution and logistics network",
        ],
        impact: {
          aqi: Math.min(20, Math.max(5, 8 + quantity / 20000)),
          carbon: Math.min(5, Math.max(1, 1.2 + quantity / 80000)),
          economic: Math.min(50000, Math.max(20000, 22000 + quantity * 6)),
        },
      },
    };

    return this.validateAndNormalizeRecommendations(baseRecommendations);
  }
  /**
   * Extract and parse JSON from Groq response with multiple fallback methods
   */
  extractAndParseJSON(response) {
    // Method 1: Try to find complete JSON object with balanced braces
    try {
      const jsonMatch = this.extractCompleteJSON(response);
      if (jsonMatch) {
        console.log(
          "Method 1 succeeded, extracted JSON:",
          jsonMatch.substring(0, 200) + "...",
        );
        return JSON.parse(jsonMatch);
      }
    } catch (error) {
      console.warn("Method 1 JSON parsing failed:", error.message);
    }

    // Method 2: Try simple regex match
    try {
      const simpleMatch = response.match(/\{[\s\S]*\}/);
      if (simpleMatch) {
        console.log(
          "Method 2 attempting with:",
          simpleMatch[0].substring(0, 200) + "...",
        );
        return JSON.parse(simpleMatch[0]);
      }
    } catch (error) {
      console.warn("Method 2 JSON parsing failed:", error.message);
    }

    // Method 3: Try to clean and parse
    try {
      const cleanedResponse = this.cleanJSONResponse(response);
      console.log(
        "Method 3 attempting with cleaned:",
        cleanedResponse.substring(0, 200) + "...",
      );
      return JSON.parse(cleanedResponse);
    } catch (error) {
      console.warn("Method 3 JSON parsing failed:", error.message);
    }

    throw new Error("No valid JSON found in response");
  }

  /**
   * Extract complete JSON object with balanced braces
   */
  extractCompleteJSON(text) {
    const start = text.indexOf("{");
    if (start === -1) return null;

    let braceCount = 0;
    let inString = false;
    let escaped = false;

    for (let i = start; i < text.length; i++) {
      const char = text[i];

      if (escaped) {
        escaped = false;
        continue;
      }

      if (char === "\\") {
        escaped = true;
        continue;
      }

      if (char === '"') {
        inString = !inString;
        continue;
      }

      if (!inString) {
        if (char === "{") {
          braceCount++;
        } else if (char === "}") {
          braceCount--;
          if (braceCount === 0) {
            return text.substring(start, i + 1);
          }
        }
      }
    }

    return null;
  }

  /**
   * Clean JSON response by removing common issues
   */
  cleanJSONResponse(response) {
    // Remove markdown code blocks
    let cleaned = response.replace(/```json\s*/g, "").replace(/```\s*/g, "");

    // Remove any text before the first {
    const firstBrace = cleaned.indexOf("{");
    if (firstBrace > 0) {
      cleaned = cleaned.substring(firstBrace);
    }

    // Remove any text after the last }
    const lastBrace = cleaned.lastIndexOf("}");
    if (lastBrace > 0) {
      cleaned = cleaned.substring(0, lastBrace + 1);
    }

    // Fix common JSON issues
    cleaned = cleaned
      .replace(/,\s*}/g, "}") // Remove trailing commas before }
      .replace(/,\s*]/g, "]") // Remove trailing commas before ]
      .replace(/'/g, '"') // Replace single quotes with double quotes
      .replace(/(\w+):/g, '"$1":'); // Add quotes around unquoted keys

    return cleaned;
  }

  /**
   * Make request to Groq API
   */
  async makeGroqRequest(prompt, systemRole) {
    const response = await fetch(this.apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          {
            role: "system",
            content: `You are an expert ${systemRole} specializing in sustainable agriculture in India. Provide practical, actionable advice using local crop names and farming practices that Indian farmers can understand and implement.`,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Groq API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error("Invalid response format from Groq AI");
    }

    return data.choices[0].message.content;
  }

  /**
   * Build crop recommendation prompt
   */
  buildCropRecommendationPrompt(cropInfo) {
    const { previousCrop, soilType, region, farmSize } = cropInfo;

    return `As an agricultural expert in India, provide a detailed 3-year crop rotation plan for the following farm, using local crop names that farmers will understand. IMPORTANT: Do NOT recommend the same crop as the current crop in the rotation plan. Each year should have a different crop to maintain soil health and prevent pest cycles.

Current Farm Details:
- Current Crop: ${this.getLocalCropName(previousCrop)}
- Soil Type: ${soilType}
- Region/Climate: ${region}
- Farm Size: ${farmSize} acres

Rules for recommendations:
1. NEVER recommend the current crop (${this.getLocalCropName(
      previousCrop,
    )}) in the rotation plan
2. Each year must have a different crop
3. Consider crop families that complement each other
4. Focus on crops that improve soil health after the current crop
5. Consider local market demand and climate suitability

Please provide recommendations using common local names for crops (e.g., use "Arhar/Tur Dal" instead of just "Pigeonpea", "Lobia/Chawli" instead of just "Cowpea") in the following format:

3-YEAR ROTATION PLAN:

Year 1:
[Recommended crop with local name - MUST be different from current crop]
- Benefits: [List specific benefits of this crop]
- Reasoning: [Explain why this crop is recommended after the current crop]
- Soil Impact: [How this crop affects soil health]
- Management Tips: [Key cultivation practices]

Year 2:
[Recommended crop with local name - MUST be different from Year 1 crop]
- Benefits: [List specific benefits of this crop]
- Reasoning: [Explain why this crop follows Year 1's crop]
- Soil Impact: [How this crop affects soil health]
- Management Tips: [Key cultivation practices]

Year 3:
[Recommended crop with local name - MUST be different from Years 1 and 2 crops]
- Benefits: [List specific benefits of this crop]
- Reasoning: [Explain why this crop completes the rotation]
- Soil Impact: [How this crop affects soil health]
- Management Tips: [Key cultivation practices]

ORGANIC FERTILIZER RECOMMENDATIONS:
[List specific organic fertilizers for each crop in the rotation]
[Include application timing and rates]
[Traditional and modern organic alternatives]

Additional Recommendations:
1. Organic Fertilizer Strategy: [Specific recommendations]
2. Soil Health Management: [Detailed practices]
3. Climate-Specific Considerations: [Based on the region]
4. Expected Outcomes: [Benefits of this rotation cycle]`;
  }

  /**
   * Build weather-based advice prompt
   */
  buildWeatherAdvicePrompt(cropName, location, weatherData) {
    return `Provide immediate farming recommendations for ${this.getLocalCropName(
      cropName,
    )} crop in ${location} based on current weather conditions:

Current Weather:
- Temperature: ${weatherData.temperature}°C
- Humidity: ${weatherData.humidity}%
- Wind Speed: ${weatherData.windSpeed} km/h
- Conditions: ${weatherData.description}
- Pressure: ${weatherData.pressure} hPa

Please provide:
1. Immediate actions needed based on current weather
2. Irrigation recommendations
3. Pest and disease risk assessment
4. Protection measures if needed
5. Optimal farming activities for today
6. 3-day outlook and preparations needed`;
  }

  /**
   * Build AQI-based advice prompt
   */
  buildAQIAdvicePrompt(cropName, location, aqiData) {
    return `Provide agricultural recommendations for ${this.getLocalCropName(
      cropName,
    )} crop in ${location} based on current air quality:

Air Quality Data:
- AQI Level: ${aqiData.aqi}
- Quality Category: ${aqiData.category}
- Primary Pollutant: ${aqiData.dominantPollutant}
- Health Concern Level: ${aqiData.healthConcern}

Please provide:
1. Impact of current air quality on crop health
2. Protective measures for crops
3. Worker safety recommendations
4. Optimal timing for field activities
5. Long-term strategies for air pollution adaptation
6. Crop protection and treatment recommendations`;
  }

  /**
   * Build waste management prompt
   */ buildWasteManagementPrompt(cropType, quantity, location) {
    return `You are an expert agricultural waste management AI system specializing in sustainable alternatives to crop burning. 
Your goal is to provide detailed, crop-specific recommendations for agricultural waste management.

IMPORTANT: Your response must be ONLY a valid JSON object, no additional text or explanations outside the JSON.

For ${quantity}kg of ${cropType} waste at location ${location.address} (${location.lat}, ${location.lng}), provide recommendations in the following structured JSON format:

{
    "biofuel": {
        "confidence": 0.85,
        "description": "A detailed description of biofuel production for this specific crop",
        "steps": [
            "Step 1 description",
            "Step 2 description", 
            "Step 3 description",
            "Step 4 description",
            "Step 5 description"
        ],
        "equipment": [
            "Equipment 1 name",
            "Equipment 2 name",
            "Equipment 3 name", 
            "Equipment 4 name",
            "Equipment 5 name"
        ],
        "impact": {
            "aqi": 15.0,
            "carbon": 2.5,
            "economic": 35000
        }
    },
    "composting": {
        "confidence": 0.75,
        "description": "A detailed description of composting process for this specific crop",
        "steps": [
            "Step 1 description",
            "Step 2 description",
            "Step 3 description", 
            "Step 4 description",
            "Step 5 description"
        ],
        "equipment": [
            "Equipment 1 name",
            "Equipment 2 name",
            "Equipment 3 name",
            "Equipment 4 name", 
            "Equipment 5 name"
        ],
        "impact": {
            "aqi": 12.0,
            "carbon": 1.8,
            "economic": 28000
        }
    },
    "recycling": {
        "confidence": 0.65,
        "description": "A detailed description of material recycling for this specific crop",
        "steps": [
            "Step 1 description",
            "Step 2 description",
            "Step 3 description",
            "Step 4 description", 
            "Step 5 description"
        ],
        "equipment": [
            "Equipment 1 name",
            "Equipment 2 name",
            "Equipment 3 name",
            "Equipment 4 name",
            "Equipment 5 name"
        ],
        "impact": {
            "aqi": 10.0,
            "carbon": 1.2,
            "economic": 22000
        }
    }
}

Guidelines:
- Confidence values must be between 0.6 and 0.95
- AQI impact must be between 5-20 (positive percentage)
- Carbon impact must be between 1-5 (positive tons)
- Economic impact must be between 20000-50000 (positive INR value)
- All descriptions must be specific to ${cropType} waste
- Steps must be practical and implementable
- Equipment must be realistic and available in India

Return ONLY the JSON object, no other text.`;
  }

  /**
   * Validate and normalize waste management recommendations
   */
  validateAndNormalizeRecommendations(recommendations) {
    const methods = ["biofuel", "composting", "recycling"];
    const normalized = {};

    methods.forEach((method) => {
      if (!recommendations[method]) {
        throw new Error(`Missing ${method} recommendations`);
      }

      const data = recommendations[method];

      // Validate and normalize confidence
      data.confidence = Math.max(
        0.6,
        Math.min(
          0.95,
          typeof data.confidence === "number" ? data.confidence : 0.7,
        ),
      );

      // Validate and normalize description
      if (!data.description || typeof data.description !== "string") {
        data.description = `Convert ${method} waste into valuable resources through advanced processing techniques.`;
      }

      // Validate and normalize steps
      if (!Array.isArray(data.steps) || data.steps.length < 3) {
        data.steps = [
          "Waste collection and sorting",
          "Initial processing setup",
          "Main processing phase",
          "Quality control",
          "Final product distribution",
        ];
      }

      // Validate and normalize equipment
      if (!Array.isArray(data.equipment) || data.equipment.length < 3) {
        data.equipment = [
          "Collection system",
          "Processing equipment",
          "Quality control tools",
          "Storage facilities",
          "Distribution system",
        ];
      }

      // Validate and normalize impact metrics
      data.impact = {
        aqi: Math.max(
          5,
          Math.min(
            20,
            typeof data.impact?.aqi === "number" ? data.impact.aqi : 10,
          ),
        ),
        carbon: Math.max(
          1,
          Math.min(
            5,
            typeof data.impact?.carbon === "number" ? data.impact.carbon : 2,
          ),
        ),
        economic: Math.max(
          20000,
          Math.min(
            50000,
            typeof data.impact?.economic === "number"
              ? data.impact.economic
              : 30000,
          ),
        ),
      };

      normalized[method] = data;
    });

    return normalized;
  }
  getLocalCropName(cropName) {
    if (!cropName || typeof cropName !== "string") {
      return cropName ?? "";
    }

    const cropNameMap = {
      rice: "Rice (Dhan)",
      wheat: "Wheat (Gehun)",
      sugarcane: "Sugarcane (Ganna)",
      pulses: "Pulses (Dal)",
      cotton: "Cotton (Kapas)",
      groundnut: "Groundnut (Moongfali)",
      maize: "Maize (Makka)",
      sorghum: "Sorghum (Jowar)",
      "pearl-millet": "Pearl Millet (Bajra)",
      chickpea: "Chickpea (Chana)",
      mustard: "Mustard (Sarson)",
      moong: "Green Gram (Moong)",
      soybean: "Soybean (Soya)",
      potato: "Potato (Aloo)",
      corn: "Corn (Makka)",
      alfalfa: "Alfalfa (Rijka)",
      legumes: "Legumes (Faliyan)",
      jowar: "Jowar (Sorghum)",
      cowpea: "Cowpea (Lobia/Chawli)",
      "mung bean": "Mung Bean (Moong)",
      pigeonpea: "Pigeonpea (Arhar/Tur Dal)",
      arhar: "Pigeonpea (Arhar/Tur Dal)",
      tur: "Pigeonpea (Arhar/Tur Dal)",
      lobia: "Cowpea (Lobia/Chawli)",
      chawli: "Cowpea (Lobia/Chawli)",
      "tur dal": "Pigeonpea (Arhar/Tur Dal)",
    };

    return cropNameMap[cropName.toLowerCase()] || cropName;
  }
}

export default new GroqService();
