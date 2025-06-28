import { apiService } from './apiService';

// Crop rotation database and service
const cropNameMap = {
    'rice': 'Rice (Dhan)',
    'wheat': 'Wheat (Gehun)',
    'sugarcane': 'Sugarcane (Ganna)',
    'pulses': 'Pulses (Dal)',
    'cotton': 'Cotton (Kapas)',
    'groundnut': 'Groundnut (Moongfali)',
    'maize': 'Maize (Makka)',
    'sorghum': 'Sorghum (Jowar)',
    'pearl-millet': 'Pearl Millet (Bajra)',
    'chickpea': 'Chickpea (Chana)',
    'mustard': 'Mustard (Sarson)',
    'moong': 'Green Gram (Moong)',
};

const cropData = {
    wheat: {
        nextCrops: ["soybean", "corn", "potato"],
        benefits: {
            soybean: "Soybeans fix nitrogen in the soil, which wheat depletes.",
            corn: "Corn has different nutrient needs and pest profiles than wheat.",
            potato: "Potatoes break disease cycles and utilize different soil layers.",
        },
        organicFertilizers: [
            { name: "Compost", description: "Rich in nutrients and improves soil structure." },
            { name: "Green Manure", description: "Plant cover crops like clover to enrich soil." },
            { name: "Bone Meal", description: "High in phosphorus, good for root development." },
        ],
        soil: 'loamy',
        region: 'temperate',
        name: 'Wheat (Gehun)'
    },
    rice: {
        nextCrops: ["pulses", "wheat", "mustard"],
        benefits: {
            pulses: "Pulses (like moong or urad) fix nitrogen and improve soil fertility after rice.",
            wheat: "Wheat-rice is a traditional rotation in Indo-Gangetic plains, different water requirements help soil recovery.",
            mustard: "Mustard has deep roots that break hardpan and adds organic matter to soil.",
        },
        organicFertilizers: [
            { name: "Jeevamrut", description: "Traditional bio-fertilizer made from cow dung, urine, and local ingredients." },
            { name: "Green Manure", description: "Dhaincha or Sesbania for nitrogen fixation before rice transplanting." },
            { name: "Azolla", description: "Aquatic fern that fixes nitrogen in rice paddies." },
        ],
        soil: 'clay',
        region: 'tropical',
        name: 'Rice (Dhan)'
    },
    corn: {
        nextCrops: ["soybean", "wheat", "alfalfa"],
        benefits: {
            soybean: "Soybeans fix nitrogen depleted by corn.",
            wheat: "Wheat has different root structures and disease profiles.",
            alfalfa: "Deep roots break compaction and fix nitrogen.",
        },
        organicFertilizers: [
            { name: "Composted Manure", description: "High in nitrogen needed for corn growth." },
            { name: "Cover Crops", description: "Plant winter rye to prevent erosion and add organic matter." },
            { name: "Worm Castings", description: "Rich in microbes and nutrients for soil health." },
        ],
        soil: 'loamy',
        region: 'tropical',
        name: 'Maize (Makka)'
    },
    sugarcane: {
        nextCrops: ["moong", "chickpea", "potato"],
        benefits: {
            moong: "Short duration crop that fixes nitrogen after sugarcane harvest.",
            chickpea: "Improves soil structure and adds nitrogen for next crop.",
            potato: "Different root system helps break pest cycles and utilize nutrients.",
        },
        organicFertilizers: [
            { name: "Press Mud Compost", description: "Sugarcane industry byproduct rich in nutrients." },
            { name: "Farm Manure", description: "Well-decomposed cow dung manure for sustained nutrition." },
            { name: "Bone Meal", description: "Rich in phosphorus for root development." },
        ],
        soil: 'loamy',
        region: 'tropical',
        name: 'Sugarcane (Ganna)'
    },
    pulses: {
        nextCrops: ["rice", "maize", "cotton"],
        benefits: {
            rice: "Rice benefits from nitrogen fixed by pulses.",
            maize: "Maize utilizes residual nitrogen and has different pest profile.",
            cotton: "Cotton benefits from improved soil structure after pulses.",
        },
        organicFertilizers: [
            { name: "Rhizobium Culture", description: "Enhances nitrogen fixation in pulse crops." },
            { name: "Rock Phosphate", description: "Natural source of phosphorus for better nodulation." },
            { name: "Ghanjeevamrut", description: "Solid form of Jeevamrut, rich in beneficial microbes." },
        ],
        soil: 'sandy',
        region: 'subtropical',
        name: 'Pulses (Dal)'
    },
    cotton: {
        nextCrops: ["chickpea", "wheat", "sorghum"],
        benefits: {
            chickpea: "Winter chickpea fixes nitrogen and uses residual moisture.",
            wheat: "Wheat utilizes different soil layers and breaks disease cycle.",
            sorghum: "Drought-resistant crop that helps manage soil moisture.",
        },
        organicFertilizers: [
            { name: "Neem Oil Cake", description: "Natural pest deterrent and nutrient source." },
            { name: "Composted Manure", description: "Well-rotted manure for slow release of nutrients." },
            { name: "Beejamrut", description: "Traditional seed treatment for better germination." },
        ],
        soil: 'sandy',
        region: 'tropical',
        name: 'Cotton (Kapas)'
    },
    groundnut: {
        nextCrops: ["jowar", "pearl-millet", "maize"],
        benefits: {
            jowar: "Sorghum/jowar is drought tolerant and uses residual fertility.",
            "pearl-millet": "Bajra/pearl-millet has deep roots and drought tolerance.",
            maize: "Maize benefits from nitrogen fixed by groundnut.",
        },
        organicFertilizers: [
            { name: "Phosphate Rich Organic Manure", description: "Enhances pod development and oil content." },
            { name: "Trichoderma Enriched FYM", description: "Protects from soil-borne diseases." },
            { name: "Karanj Cake", description: "Natural pest repellent and nutrient source." },
        ],
        soil: 'sandy',
        region: 'tropical',
        name: 'Groundnut (Moongfali)'
    },
    maize: {
        nextCrops: ["soybean", "wheat", "alfalfa"],
        benefits: {
            soybean: "Soybeans fix nitrogen depleted by maize.",
            wheat: "Wheat has different root structures and disease profiles.",
            alfalfa: "Deep roots break compaction and fix nitrogen.",
        },
        organicFertilizers: [
            { name: "Composted Manure", description: "High in nitrogen needed for maize growth." },
            { name: "Cover Crops", description: "Plant winter rye to prevent erosion and add organic matter." },
            { name: "Worm Castings", description: "Rich in microbes and nutrients for soil health." },
        ],
        soil: 'loamy',
        region: 'tropical',
        name: 'Maize (Makka)'
    },
    sorghum: {
        nextCrops: ["chickpea", "wheat", "groundnut"],
        benefits: {
            chickpea: "Chickpea fixes nitrogen and utilizes winter season effectively.",
            wheat: "Wheat has different nutrient requirements and root structure.",
            groundnut: "Groundnut improves soil fertility through nitrogen fixation.",
        },
        organicFertilizers: [
            { name: "Farm Yard Manure", description: "Provides organic matter and slow-release nutrients." },
            { name: "Vermicompost", description: "Improves soil structure and water retention." },
            { name: "Neem Cake", description: "Natural pest deterrent and nutrient source." },
        ],
        soil: 'sandy',
        region: 'arid',
        name: 'Sorghum (Jowar)'
    },
    'pearl-millet': {
        nextCrops: ["chickpea", "mustard", "groundnut"],
        benefits: {
            chickpea: "Winter legume that fixes nitrogen for improved soil health.",
            mustard: "Deep-rooted crop that improves soil structure.",
            groundnut: "Nitrogen-fixing crop that enhances soil fertility.",
        },
        organicFertilizers: [
            { name: "Gobar Khad", description: "Traditional cow dung manure for sustained nutrition." },
            { name: "Crop Residue Compost", description: "Made from previous crop residues." },
            { name: "Rock Phosphate", description: "Natural phosphorus source for better root development." },
        ],
        soil: 'sandy',
        region: 'arid',
        name: 'Pearl Millet (Bajra)'
    },
    chickpea: {
        nextCrops: ["wheat", "rice", "maize"],
        benefits: {
            wheat: "Wheat benefits from nitrogen fixed by chickpea.",
            rice: "Rice utilizes the improved soil structure and nitrogen availability.",
            maize: "Maize benefits from enhanced soil fertility and structure.",
        },
        organicFertilizers: [
            { name: "Rhizobium Inoculant", description: "Enhances nitrogen fixation in chickpea." },
            { name: "Phosphate Solubilizing Bacteria", description: "Improves phosphorus availability." },
            { name: "Vermicompost", description: "Provides balanced nutrition and improves soil health." },
        ],
        soil: 'sandy',
        region: 'subtropical',
        name: 'Chickpea (Chana)'
    },
    mustard: {
        nextCrops: ["rice", "cotton", "sugarcane"],
        benefits: {
            rice: "Rice benefits from improved soil structure after mustard.",
            cotton: "Cotton utilizes the deep-rooted benefits of mustard cultivation.",
            sugarcane: "Sugarcane benefits from improved soil organic matter.",
        },
        organicFertilizers: [
            { name: "Mustard Cake", description: "Own crop residue as organic fertilizer." },
            { name: "Compost", description: "Balanced nutrient source for sustainable growth." },
            { name: "Sulphur Rich Manure", description: "Important for mustard oil quality and yield." },
        ],
        soil: 'loamy',
        region: 'temperate',
        name: 'Mustard (Sarson)'
    },
    moong: {
        nextCrops: ["wheat", "rice", "maize"],
        benefits: {
            wheat: "Wheat benefits significantly from nitrogen fixed by moong.",
            rice: "Rice utilizes the improved soil fertility and structure.",
            maize: "Maize benefits from enhanced soil nitrogen and organic matter.",
        },
        organicFertilizers: [
            { name: "Rhizobium Culture", description: "Specific for green gram nitrogen fixation." },
            { name: "Jeevamrut", description: "Traditional microbial fertilizer for enhanced growth." },
            { name: "Compost Tea", description: "Liquid organic fertilizer for quick nutrient uptake." },
        ],
        soil: 'sandy',
        region: 'subtropical',
        name: 'Green Gram (Moong)'
    }
};

// Generate AQI impact data for different months
const generateAQIImpactData = (previousCrop) => {
    const seasonalBaseAQI = {
        winter: 120,  // Oct-Feb
        summer: 150,  // Mar-Jun
        monsoon: 90   // Jul-Sep
    };

    const reductionFactors = {
        rice: 0.3,
        wheat: 0.25,
        sugarcane: 0.35,
        pulses: 0.4,
        cotton: 0.3,
        groundnut: 0.35,
        maize: 0.3,
        sorghum: 0.35,
        'pearl-millet': 0.3,
        chickpea: 0.4,
        mustard: 0.25,
        moong: 0.4
    };

    const reductionFactor = reductionFactors[previousCrop] || 0.3;
    
    return Array.from({length: 12}, (_, month) => {
        let baseAQI;
        if ([9, 10, 11, 0, 1].includes(month)) baseAQI = seasonalBaseAQI.winter;
        else if ([2, 3, 4, 5].includes(month)) baseAQI = seasonalBaseAQI.summer;
        else baseAQI = seasonalBaseAQI.monsoon;

        return {
            withoutRecommendations: baseAQI + Math.random() * 20 - 10,
            withRecommendations: baseAQI * (1 - reductionFactor) + Math.random() * 10 - 5
        };
    });
};

export const getCropRecommendations = async (formData) => {
    try {
        // Call the backend API
        const response = await apiService.getCropRecommendations(formData);
        
        // If backend returns recommendations, use them
        if (response && response.recommendations) {
            return parseBackendRecommendations(response.recommendations, formData);
        }
        
        // Fallback to local data if backend fails
        return getLocalRecommendations(formData);
    } catch (error) {
        console.warn('Backend API failed, falling back to local recommendations:', error);
        // Fallback to local data
        return getLocalRecommendations(formData);
    }
};

// Function to parse backend AI recommendations
const parseBackendRecommendations = (aiResponse, formData) => {
    try {
        // The AI response should contain structured crop rotation data
        // Parse the AI response and format it according to our frontend needs
        const { previousCrop, soilType, region, farmSize } = formData;
        
        // If aiResponse is already a structured object (as shown in the example)
        if (typeof aiResponse === 'object') {
            // Check if response has recommendations array directly or nested
            const recommendations = (aiResponse.recommendations || []).map((rec, index) => ({
                crop: rec.crop || `crop-${index}`,
                name: rec.name || rec.crop || 'Unknown Crop',
                benefit: rec.benefit || `Recommended for your farm conditions.`,
                suitability: typeof rec.suitability === 'number' ? rec.suitability : (95 - (index * 5) + Math.random() * 10),
                estimatedYield: rec.estimatedYield || calculateEstimatedYield(rec.crop || 'wheat', farmSize),
                plantingTime: rec.plantingTime || getPlantingTime(rec.crop || 'wheat'),
                harvestTime: rec.harvestTime || getHarvestTime(rec.crop || 'wheat')
            }));

            // Ensure we have at least some recommendations
            if (recommendations.length === 0) {
                const defaultRecs = getDefaultRecommendations(previousCrop);
                defaultRecs.forEach((rec, index) => {
                    recommendations.push({
                        crop: rec.crop || `crop-${index}`,
                        name: rec.name || 'Unknown Crop',
                        benefit: rec.benefit || 'Beneficial for crop rotation',
                        suitability: 95 - (index * 5) + Math.random() * 10,
                        estimatedYield: calculateEstimatedYield(rec.crop || 'wheat', farmSize),
                        plantingTime: getPlantingTime(rec.crop || 'wheat'),
                        harvestTime: getHarvestTime(rec.crop || 'wheat')
                    });
                });
            }

            return {
                previousCrop: aiResponse.previousCrop || cropNameMap[previousCrop] || previousCrop,
                soilType: aiResponse.soilType || soilType,
                region: aiResponse.region || region,
                farmSize: aiResponse.farmSize || farmSize,
                recommendations,
                organicFertilizers: aiResponse.organicFertilizers || getDefaultFertilizers(previousCrop),
                aqiImpactData: aiResponse.aqiImpactData || generateAQIImpactData(previousCrop),
                sustainability: aiResponse.sustainability || {
                    soilHealth: 25 + Math.random() * 20,
                    waterConservation: 15 + Math.random() * 15,
                    carbonReduction: calculateCarbonReduction(farmSize),
                    economicBenefit: 20000 + Math.random() * 30000
                },
                source: aiResponse.source || 'ai-backend'
            };
        }
        
        // Extract recommendations from AI response
        let recommendations = [];
        let organicFertilizers = [];
        let sustainability = {
            soilHealth: 25 + Math.random() * 20,
            waterConservation: 15 + Math.random() * 15,
            carbonReduction: calculateCarbonReduction(farmSize),
            economicBenefit: 20000 + Math.random() * 30000
        };
        
        // Parse AI response (assuming it's a structured text response)
        if (typeof aiResponse === 'string') {
            // Extract crop recommendations from AI response
            const cropMatches = aiResponse.match(/recommended crops?:?\s*([^\n]+)/i);
            if (cropMatches) {
                const crops = cropMatches[1].split(/[,;]/).map(crop => crop.trim());
                recommendations = crops.slice(0, 3).map((crop, index) => ({
                    crop: crop.toLowerCase().replace(/\s+/g, '-'),
                    name: crop,
                    benefit: `AI-recommended: ${crop} is optimal for your farm conditions.`,
                    suitability: 95 - (index * 5) + Math.random() * 10,
                    estimatedYield: calculateEstimatedYield(crop.toLowerCase(), farmSize),
                    plantingTime: getPlantingTime(crop.toLowerCase()),
                    harvestTime: getHarvestTime(crop.toLowerCase())
                }));
            }
            
            // Extract fertilizer recommendations
            const fertilizerMatches = aiResponse.match(/fertilizers?:?\s*([^\n]+)/i);
            if (fertilizerMatches) {
                const fertilizers = fertilizerMatches[1].split(/[,;]/).map(fert => fert.trim());
                organicFertilizers = fertilizers.slice(0, 3).map(fert => ({
                    name: fert,
                    description: `AI-recommended organic fertilizer for optimal crop growth.`
                }));
            }
        } else if (typeof aiResponse === 'object') {
            // Handle other structured object responses
            recommendations = aiResponse.crops || [];
            organicFertilizers = aiResponse.fertilizers || [];
            sustainability = { ...sustainability, ...aiResponse.sustainability };
        }
        
        // Ensure we have fallback recommendations if AI doesn't provide enough
        if (recommendations.length === 0) {
            recommendations = getDefaultRecommendations(previousCrop);
        }
        
        if (organicFertilizers.length === 0) {
            organicFertilizers = getDefaultFertilizers(previousCrop);
        }
        
        return {
            previousCrop: cropNameMap[previousCrop] || previousCrop,
            soilType,
            region,
            farmSize,
            recommendations,
            organicFertilizers,
            aqiImpactData: generateAQIImpactData(previousCrop),
            sustainability,
            source: 'ai-backend'
        };
    } catch (error) {
        console.warn('Error parsing backend recommendations:', error);
        return getLocalRecommendations(formData);
    }
};

// Fallback function using local data
const getLocalRecommendations = (formData) => {
    const { previousCrop, soilType, region, farmSize } = formData;
    
    const crop = cropData[previousCrop];
    if (!crop) {
        throw new Error('Crop data not found');
    }

    // Auto-fill soil type and region based on crop if not provided
    const autoFilledSoilType = soilType || crop.soil;
    const autoFilledRegion = region || crop.region;

    // Generate recommendations
    const recommendations = crop.nextCrops.map(nextCrop => {
        const nextCropData = cropData[nextCrop] || { name: cropNameMap[nextCrop] || nextCrop };
        return {
            crop: nextCrop,
            name: nextCropData.name,
            benefit: crop.benefits[nextCrop],
            suitability: calculateSuitability(nextCrop, autoFilledSoilType, autoFilledRegion),
            estimatedYield: calculateEstimatedYield(nextCrop, farmSize),
            plantingTime: getPlantingTime(nextCrop),
            harvestTime: getHarvestTime(nextCrop)
        };
    });

    // Sort by suitability
    recommendations.sort((a, b) => b.suitability - a.suitability);

    // Generate AQI impact data
    const aqiImpactData = generateAQIImpactData(previousCrop);

    return {
        previousCrop: crop.name,
        soilType: autoFilledSoilType,
        region: autoFilledRegion,
        farmSize,
        recommendations,
        organicFertilizers: crop.organicFertilizers,
        aqiImpactData,
        sustainability: {
            soilHealth: calculateSoilHealthImprovement(previousCrop, recommendations[0]?.crop),
            waterConservation: calculateWaterConservation(previousCrop, recommendations[0]?.crop),
            carbonReduction: calculateCarbonReduction(farmSize),
            economicBenefit: calculateEconomicBenefit(farmSize, recommendations[0]?.crop)
        },
        source: 'local-fallback'
    };
};

// Helper functions for AI response parsing
const getDefaultRecommendations = (previousCrop) => {
    const defaults = {
        rice: [
            { crop: 'pulses', name: 'Pulses (Dal)', benefit: 'Nitrogen fixation improves soil fertility' },
            { crop: 'wheat', name: 'Wheat (Gehun)', benefit: 'Different water requirements help soil recovery' },
            { crop: 'mustard', name: 'Mustard (Sarson)', benefit: 'Deep roots break hardpan layer' }
        ],
        wheat: [
            { crop: 'soybean', name: 'Soybean', benefit: 'Fixes nitrogen depleted by wheat' },
            { crop: 'corn', name: 'Corn', benefit: 'Different nutrient needs and pest profiles' },
            { crop: 'potato', name: 'Potato', benefit: 'Breaks disease cycles' }
        ],
        cotton: [
            { crop: 'chickpea', name: 'Chickpea (Chana)', benefit: 'Winter legume fixes nitrogen' },
            { crop: 'wheat', name: 'Wheat (Gehun)', benefit: 'Utilizes different soil layers' },
            { crop: 'sorghum', name: 'Sorghum (Jowar)', benefit: 'Drought-resistant crop' }
        ]
    };
    
    return defaults[previousCrop] || defaults.wheat;
};

const getDefaultFertilizers = (previousCrop) => {
    const defaults = {
        rice: [
            { name: "Jeevamrut", description: "Traditional bio-fertilizer made from cow dung and urine." },
            { name: "Green Manure", description: "Nitrogen fixation before rice transplanting." },
            { name: "Azolla", description: "Aquatic fern that fixes nitrogen in paddies." }
        ],
        wheat: [
            { name: "Compost", description: "Rich in nutrients and improves soil structure." },
            { name: "Green Manure", description: "Cover crops like clover to enrich soil." },
            { name: "Bone Meal", description: "High in phosphorus for root development." }
        ],
        cotton: [
            { name: "Neem Oil Cake", description: "Natural pest deterrent and nutrient source." },
            { name: "Composted Manure", description: "Slow release of nutrients." },
            { name: "Beejamrut", description: "Traditional seed treatment." }
        ]
    };
    
    return defaults[previousCrop] || defaults.wheat;
};

const calculateSuitability = (crop, soilType, region) => {
    const cropInfo = cropData[crop];
    if (!cropInfo) return Math.random() * 40 + 60; // Random between 60-100

    let score = 80; // Base score
    
    // Soil type compatibility
    if (cropInfo.soil === soilType) score += 15;
    else score -= 5;
    
    // Region compatibility
    if (cropInfo.region === region) score += 10;
    else score -= 3;
    
    // Add some randomness for realism
    score += Math.random() * 10 - 5;
    
    return Math.max(50, Math.min(100, score));
};

const calculateEstimatedYield = (crop, farmSize) => {
    const baseYields = {
        soybean: 1.5,
        corn: 3.5,
        potato: 25,
        pulses: 1.2,
        wheat: 3.2,
        mustard: 1.1,
        moong: 0.8,
        chickpea: 1.3,
        cotton: 1.8,
        maize: 3.5,
        jowar: 2.1,
        'pearl-millet': 1.9,
        sugarcane: 75,
        rice: 4.2,
        groundnut: 2.3,
        sorghum: 2.1,
        alfalfa: 8.5,
        // Additional crops for backend responses
        'green gram': 0.8,
        'black gram': 0.9,
        'field pea': 1.1,
        'lentil': 1.0,
        'sesame': 0.8,
        'sunflower': 1.6,
        'safflower': 1.2,
        'millet': 1.8,
        'finger millet': 1.5
    };
    
    // Normalize crop name
    const normalizedCrop = crop.toLowerCase().replace(/\s+/g, '-');
    const baseYield = baseYields[normalizedCrop] || baseYields[crop] || 2.0;
    return (baseYield * farmSize * (0.9 + Math.random() * 0.2)).toFixed(1);
};

const getPlantingTime = (crop) => {
    const plantingTimes = {
        soybean: "June-July",
        corn: "April-June",
        potato: "October-December",
        pulses: "October-November",
        wheat: "November-December",
        mustard: "October-November",
        moong: "March-April / June-July",
        chickpea: "October-November",
        cotton: "April-May",
        maize: "June-July",
        jowar: "June-July",
        'pearl-millet': "June-July",
        sugarcane: "February-March",
        rice: "June-July",
        groundnut: "June-July",
        sorghum: "June-July",
        alfalfa: "October-November",
        // Additional crops
        'green gram': "March-April / June-July",
        'black gram': "June-July",
        'field pea': "October-November",
        'lentil': "October-November",
        'sesame': "June-July",
        'sunflower': "January-February / June-July",
        'safflower': "October-November",
        'millet': "June-July",
        'finger millet': "June-July"
    };
    
    const normalizedCrop = crop.toLowerCase().replace(/\s+/g, '-');
    return plantingTimes[normalizedCrop] || plantingTimes[crop] || "Season dependent";
};

const getHarvestTime = (crop) => {
    const harvestTimes = {
        soybean: "October-November",
        corn: "September-October",
        potato: "February-March",
        pulses: "February-March",
        wheat: "April-May",
        mustard: "February-March",
        moong: "June-July / September-October",
        chickpea: "March-April",
        cotton: "October-December",
        maize: "September-October",
        jowar: "October-November",
        'pearl-millet': "September-October",
        sugarcane: "December-March",
        rice: "October-November",
        groundnut: "October-November",
        sorghum: "October-November",
        alfalfa: "Multiple cuts per year",
        // Additional crops
        'green gram': "June-July / September-October",
        'black gram': "September-October",
        'field pea': "February-March",
        'lentil': "March-April",
        'sesame': "September-October",
        'sunflower': "April-May / October-November",
        'safflower': "February-March",
        'millet': "September-October",
        'finger millet': "September-October"
    };
    
    const normalizedCrop = crop.toLowerCase().replace(/\s+/g, '-');
    return harvestTimes[normalizedCrop] || harvestTimes[crop] || "Season dependent";
};

const calculateSoilHealthImprovement = (fromCrop, toCrop) => {
    const improvements = {
        'rice-pulses': 35,
        'wheat-soybean': 40,
        'cotton-chickpea': 45,
        'sugarcane-moong': 30,
        'maize-soybean': 35
    };
    
    const key = `${fromCrop}-${toCrop}`;
    return improvements[key] || (25 + Math.random() * 20);
};

const calculateWaterConservation = (fromCrop, toCrop) => {
    const waterIntensive = ['rice', 'sugarcane'];
    const waterEfficient = ['pulses', 'sorghum', 'pearl-millet', 'chickpea'];
    
    if (waterIntensive.includes(fromCrop) && waterEfficient.includes(toCrop)) {
        return 25 + Math.random() * 15;
    }
    return 10 + Math.random() * 10;
};

const calculateCarbonReduction = (farmSize) => {
    return (farmSize * 0.8 * (0.9 + Math.random() * 0.2)).toFixed(1);
};

const calculateEconomicBenefit = (farmSize, crop) => {
    const profitMargins = {
        soybean: 15000,
        corn: 25000,
        potato: 45000,
        pulses: 20000,
        wheat: 18000,
        mustard: 16000,
        moong: 22000,
        chickpea: 24000,
        cotton: 30000,
        maize: 25000
    };
    
    const baseProfit = profitMargins[crop] || 20000;
    return Math.round(baseProfit * farmSize * (0.9 + Math.random() * 0.2));
};

export default {
    getCropRecommendations,
    cropData,
    cropNameMap
};
