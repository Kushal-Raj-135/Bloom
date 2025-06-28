import { apiService } from './apiService';

// AgriRevive service for agricultural waste management and biofuel production

const mockRecommendations = {
    wheat: {
        biofuel: {
            confidence: 0.85,
            steps: [
                "Waste collection and sorting",
                "Pre-treatment and size reduction",
                "Anaerobic digestion process",
                "Biogas purification",
                "Biofuel storage and distribution"
            ],
            equipment: [
                "Waste collection system",
                "Shredding equipment",
                "Anaerobic digester",
                "Biogas purification unit",
                "Storage tanks"
            ],
            impact: {
                aqi: 15.0,
                carbon: 2.5,
                economic: 41500
            }
        },
        composting: {
            confidence: 0.75,
            steps: [
                "Waste collection and sorting",
                "Initial composting setup",
                "Regular turning and monitoring",
                "Maturation period",
                "Compost screening and packaging"
            ],
            equipment: [
                "Composting bins",
                "Temperature probes",
                "Turning equipment",
                "Screening machine",
                "Packaging system"
            ],
            impact: {
                aqi: 12.5,
                carbon: 1.8,
                economic: 28750
            }
        },
        recycling: {
            confidence: 0.65,
            steps: [
                "Waste collection and sorting",
                "Material separation",
                "Cleaning and processing",
                "Quality control",
                "Distribution to industries"
            ],
            equipment: [
                "Sorting conveyor",
                "Cleaning system",
                "Processing machinery",
                "Quality control tools",
                "Packaging equipment"
            ],
            impact: {
                aqi: 10.0,
                carbon: 1.2,
                economic: 22500
            }
        }
    },
    rice: {
        biofuel: {
            confidence: 0.90,
            steps: [
                "Rice straw collection",
                "Mechanical shredding",
                "Anaerobic digestion",
                "Biogas capture and purification",
                "Energy conversion and storage"
            ],
            equipment: [
                "Straw collection machinery",
                "Industrial shredders",
                "Anaerobic digesters",
                "Gas purification systems",
                "Power generation units"
            ],
            impact: {
                aqi: 18.0,
                carbon: 3.0,
                economic: 52000
            }
        },
        composting: {
            confidence: 0.80,
            steps: [
                "Straw collection and preparation",
                "Carbon-nitrogen balancing",
                "Aerobic composting process",
                "Maturation and curing",
                "Quality testing and packaging"
            ],
            equipment: [
                "Collection vehicles",
                "Mixing equipment",
                "Aeration systems",
                "Temperature monitoring",
                "Testing equipment"
            ],
            impact: {
                aqi: 14.0,
                carbon: 2.2,
                economic: 35000
            }
        },
        recycling: {
            confidence: 0.70,
            steps: [
                "Straw collection and cleaning",
                "Fiber separation",
                "Pulp processing",
                "Paper/board manufacturing",
                "Product distribution"
            ],
            equipment: [
                "Cleaning systems",
                "Fiber separation units",
                "Pulping machinery",
                "Manufacturing equipment",
                "Quality control systems"
            ],
            impact: {
                aqi: 12.0,
                carbon: 1.8,
                economic: 28000
            }
        }
    },
    cotton: {
        biofuel: {
            confidence: 0.75,
            steps: [
                "Cotton stalk collection",
                "Size reduction and preparation",
                "Gasification process",
                "Syngas cleaning and conditioning",
                "Fuel synthesis and storage"
            ],
            equipment: [
                "Stalk collection equipment",
                "Chopping machinery",
                "Gasification units",
                "Gas cleaning systems",
                "Synthesis reactors"
            ],
            impact: {
                aqi: 16.5,
                carbon: 2.8,
                economic: 45000
            }
        },
        composting: {
            confidence: 0.85,
            steps: [
                "Stalk collection and chopping",
                "Composting mixture preparation",
                "Windrow formation",
                "Regular turning and monitoring",
                "Finished compost screening"
            ],
            equipment: [
                "Collection vehicles",
                "Chopping equipment",
                "Turning machinery",
                "Monitoring tools",
                "Screening equipment"
            ],
            impact: {
                aqi: 13.5,
                carbon: 2.0,
                economic: 32000
            }
        },
        recycling: {
            confidence: 0.60,
            steps: [
                "Stalk processing",
                "Fiber extraction",
                "Material refinement",
                "Product manufacturing",
                "Market distribution"
            ],
            equipment: [
                "Processing machinery",
                "Extraction equipment",
                "Refinement systems",
                "Manufacturing tools",
                "Packaging equipment"
            ],
            impact: {
                aqi: 11.0,
                carbon: 1.5,
                economic: 26000
            }
        }
    },
    sugarcane: {
        biofuel: {
            confidence: 0.95,
            steps: [
                "Bagasse collection",
                "Moisture content adjustment",
                "Fermentation process",
                "Ethanol distillation",
                "Fuel grade purification"
            ],
            equipment: [
                "Bagasse handling systems",
                "Drying equipment",
                "Fermentation tanks",
                "Distillation columns",
                "Purification units"
            ],
            impact: {
                aqi: 20.0,
                carbon: 3.5,
                economic: 65000
            }
        },
        composting: {
            confidence: 0.70,
            steps: [
                "Bagasse preparation",
                "Moisture and nutrient balancing",
                "Composting process management",
                "Maturation monitoring",
                "Final product processing"
            ],
            equipment: [
                "Preparation machinery",
                "Mixing systems",
                "Monitoring equipment",
                "Turning machinery",
                "Processing tools"
            ],
            impact: {
                aqi: 15.0,
                carbon: 2.3,
                economic: 38000
            }
        },
        recycling: {
            confidence: 0.80,
            steps: [
                "Bagasse processing",
                "Pulp production",
                "Paper manufacturing",
                "Quality control",
                "Product distribution"
            ],
            equipment: [
                "Processing equipment",
                "Pulping machinery",
                "Paper machines",
                "Testing equipment",
                "Packaging systems"
            ],
            impact: {
                aqi: 13.0,
                carbon: 1.9,
                economic: 42000
            }
        }
    }
};

const getRandomLocation = () => {
    const locations = [
        { lat: 12.9716, lng: 77.5946, name: "Bengaluru, Karnataka" },
        { lat: 28.6139, lng: 77.2090, name: "New Delhi" },
        { lat: 19.0760, lng: 72.8777, name: "Mumbai, Maharashtra" },
        { lat: 22.5726, lng: 88.3639, name: "Kolkata, West Bengal" },
        { lat: 13.0827, lng: 80.2707, name: "Chennai, Tamil Nadu" },
        { lat: 26.9124, lng: 75.7873, name: "Jaipur, Rajasthan" },
        { lat: 23.0225, lng: 72.5714, name: "Ahmedabad, Gujarat" },
        { lat: 21.1458, lng: 79.0882, name: "Nagpur, Maharashtra" }
    ];
    return locations[Math.floor(Math.random() * locations.length)];
};

export const getAgriReviveRecommendations = async (cropType, wasteAmount, location) => {
    try {
        // Prepare AI prompt for waste management recommendations
        const messages = [
            {
                role: "system",
                content: "You are an expert in agricultural waste management and biofuel production. Provide specific recommendations for converting agricultural waste into valuable resources."
            },
            {
                role: "user",
                content: `I have ${wasteAmount} tons of ${cropType} agricultural waste. Please provide detailed recommendations for processing this waste into biofuel, compost, or other valuable products. Include processing steps, required equipment, environmental impact (AQI improvement, carbon reduction), and economic benefits. Location: ${location || 'India'}.`
            }
        ];

        // Call the backend AI service
        const aiResponse = await apiService.getAIRecommendations(messages);
        
        if (aiResponse && aiResponse.choices && aiResponse.choices[0]) {
            const recommendation = aiResponse.choices[0].message.content;
            return parseAIRecommendations(recommendation, cropType, wasteAmount, location);
        }
        
        // Fallback to mock data
        return getMockRecommendations(cropType, wasteAmount, location);
    } catch (error) {
        console.warn('AI service failed, using fallback recommendations:', error);
        return getMockRecommendations(cropType, wasteAmount, location);
    }
};

// Parse AI recommendations into structured format
const parseAIRecommendations = (aiText, cropType, wasteAmount, location) => {
    // Handle location consistently - if it's a string, try to create an object
    let processedLocation;
    if (typeof location === 'string' && location) {
        processedLocation = location; // Keep as string if user provided one
    } else {
        processedLocation = getRandomLocation(); // Get random location object
    }
    
    const scaleFactor = wasteAmount / 100;
    
    // Try to extract structured information from AI response
    const methods = ['biofuel', 'composting', 'recycling'];
    const recommendations = methods.map((method, index) => {
        // Extract method-specific information from AI text
        const methodSection = extractMethodSection(aiText, method);
        
        return {
            method,
            confidence: 0.85 - (index * 0.05) + (Math.random() * 0.1 - 0.05),
            steps: extractSteps(methodSection, method),
            equipment: extractEquipment(methodSection, method),
            impact: {
                aqi: (15 - index * 2 + Math.random() * 5) * scaleFactor,
                carbon: (2.5 - index * 0.3 + Math.random() * 0.5) * scaleFactor,
                economic: Math.round((40000 - index * 5000 + Math.random() * 10000) * scaleFactor)
            }
        };
    });

    return {
        cropType,
        wasteAmount,
        location: processedLocation,
        recommendations,
        totalImpact: {
            aqiReduction: recommendations.reduce((sum, rec) => sum + parseFloat(rec.impact.aqi), 0).toFixed(1),
            carbonReduction: recommendations.reduce((sum, rec) => sum + parseFloat(rec.impact.carbon), 0).toFixed(1),
            economicBenefit: recommendations.reduce((sum, rec) => sum + rec.impact.economic, 0)
        },
        aiGenerated: true
    };
};

// Extract method-specific sections from AI text
const extractMethodSection = (text, method) => {
    const methodRegex = new RegExp(`${method}[^]*?(?=${method}|$)`, 'i');
    const match = text.match(methodRegex);
    return match ? match[0] : '';
};

// Extract processing steps from text
const extractSteps = (text, method) => {
    const stepPatterns = [
        /\d+\.\s*([^.\n]+)/g,
        /step\s*\d+:?\s*([^.\n]+)/gi,
        /process:?\s*([^.\n]+)/gi
    ];
    
    let steps = [];
    for (const pattern of stepPatterns) {
        const matches = [...text.matchAll(pattern)];
        if (matches.length > 0) {
            steps = matches.map(match => match[1].trim()).slice(0, 5);
            break;
        }
    }
    
    // Fallback to default steps if none found
    if (steps.length === 0) {
        steps = getDefaultSteps(method);
    }
    
    return steps;
};

// Extract equipment from text
const extractEquipment = (text, method) => {
    const equipmentPatterns = [
        /equipment:?\s*([^.\n]+)/gi,
        /tools?:?\s*([^.\n]+)/gi,
        /machinery:?\s*([^.\n]+)/gi
    ];
    
    let equipment = [];
    for (const pattern of equipmentPatterns) {
        const matches = [...text.matchAll(pattern)];
        if (matches.length > 0) {
            equipment = matches[0][1].split(',').map(item => item.trim()).slice(0, 5);
            break;
        }
    }
    
    // Fallback to default equipment if none found
    if (equipment.length === 0) {
        equipment = getDefaultEquipment(method);
    }
    
    return equipment;
};

// Default steps for each method
const getDefaultSteps = (method) => {
    const defaults = {
        biofuel: [
            "Waste collection and sorting",
            "Pre-treatment and size reduction",
            "Anaerobic digestion process",
            "Biogas purification",
            "Biofuel storage and distribution"
        ],
        composting: [
            "Waste collection and sorting",
            "Initial composting setup",
            "Regular turning and monitoring",
            "Maturation period",
            "Compost screening and packaging"
        ],
        recycling: [
            "Waste collection and sorting",
            "Material separation",
            "Cleaning and processing",
            "Quality control",
            "Distribution to industries"
        ]
    };
    return defaults[method] || defaults.biofuel;
};

// Default equipment for each method
const getDefaultEquipment = (method) => {
    const defaults = {
        biofuel: [
            "Waste collection system",
            "Shredding equipment",
            "Anaerobic digester",
            "Biogas purification unit",
            "Storage tanks"
        ],
        composting: [
            "Composting bins",
            "Temperature probes",
            "Turning equipment",
            "Screening machine",
            "Packaging system"
        ],
        recycling: [
            "Sorting conveyor",
            "Cleaning system",
            "Processing machinery",
            "Quality control tools",
            "Packaging equipment"
        ]
    };
    return defaults[method] || defaults.biofuel;
};

// Fallback function with mock data
const getMockRecommendations = async (cropType, wasteAmount, location) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const cropData = mockRecommendations[cropType] || mockRecommendations.wheat;
    
    // Handle location consistently - if it's a string, keep it; otherwise get random location
    let processedLocation;
    if (typeof location === 'string' && location) {
        processedLocation = location; // Keep as string if user provided one
    } else {
        processedLocation = getRandomLocation(); // Get random location object
    }
    
    // Calculate scaled impacts based on waste amount
    const scaleFactor = wasteAmount / 100; // Base calculation for 100 units
    
    const recommendations = Object.keys(cropData).map(method => {
        const data = cropData[method];
        return {
            method,
            confidence: data.confidence,
            steps: data.steps,
            equipment: data.equipment,
            impact: {
                aqi: (data.impact.aqi * scaleFactor).toFixed(1),
                carbon: (data.impact.carbon * scaleFactor).toFixed(1),
                economic: Math.round(data.impact.economic * scaleFactor)
            }
        };
    });

    // Sort by confidence
    recommendations.sort((a, b) => b.confidence - a.confidence);

    return {
        cropType,
        wasteAmount,
        location: processedLocation,
        recommendations,
        totalImpact: {
            aqiReduction: recommendations.reduce((sum, rec) => sum + parseFloat(rec.impact.aqi), 0).toFixed(1),
            carbonReduction: recommendations.reduce((sum, rec) => sum + parseFloat(rec.impact.carbon), 0).toFixed(1),
            economicBenefit: recommendations.reduce((sum, rec) => sum + rec.impact.economic, 0)
        },
        aiGenerated: false
    };
};

export const downloadAgriReviveReport = (recommendations) => {
    if (!recommendations) return;

    const locationText = typeof recommendations.location === 'string' 
        ? recommendations.location 
        : recommendations.location?.name || 'Unknown';

    const reportContent = `
AGRIREVIVE WASTE MANAGEMENT REPORT
=================================

Farm Details:
- Crop Type: ${recommendations.cropType}
- Waste Amount: ${recommendations.wasteAmount} tons
- Location: ${locationText}

Recommended Processing Methods:
${recommendations.recommendations.map((rec, index) => `
${index + 1}. ${rec.method.toUpperCase()}
   - Confidence: ${(rec.confidence * 100).toFixed(1)}%
   - AQI Improvement: ${rec.impact.aqi} points
   - Carbon Reduction: ${rec.impact.carbon} tons CO₂
   - Economic Benefit: ₹${rec.impact.economic.toLocaleString()}
   
   Processing Steps:
${rec.steps.map((step, i) => `   ${i + 1}. ${step}`).join('\n')}
   
   Required Equipment:
${rec.equipment.map((eq, i) => `   - ${eq}`).join('\n')}
`).join('')}

Total Impact Summary:
- Total AQI Improvement: ${recommendations.totalImpact.aqiReduction} points
- Total Carbon Reduction: ${recommendations.totalImpact.carbonReduction} tons CO₂
- Total Economic Benefit: ₹${recommendations.totalImpact.economicBenefit.toLocaleString()}

Generated on: ${new Date().toLocaleDateString()}
Location: ${recommendations.location.lat}, ${recommendations.location.lng}
    `;

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agrirevive-report-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

export default {
    getAgriReviveRecommendations,
    downloadAgriReviveReport
};
