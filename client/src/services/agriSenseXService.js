import { apiService } from './apiService';

// AgriSenseX service for precision agriculture and farm monitoring

export const getAgriSenseXData = async (location) => {
    try {
        // Get current location coordinates
        let coordinates = { lat: null, lon: null };
        
        if (location) {
            // Try to geocode the location
            try {
                const geocodeResponse = await apiService.geocode(location);
                if (geocodeResponse && geocodeResponse.lat && geocodeResponse.lon) {
                    coordinates = { lat: geocodeResponse.lat, lon: geocodeResponse.lon };
                }
            } catch (geocodeError) {
                console.warn('Geocoding failed:', geocodeError);
            }
        }
        
        // Get weather data
        const weatherPromise = coordinates.lat ? 
            apiService.getWeatherData(coordinates.lat, coordinates.lon) : 
            getDefaultWeatherData();
            
        // Get AQI data
        const aqiPromise = coordinates.lat ? 
            apiService.getAQIData(coordinates.lat, coordinates.lon) : 
            getDefaultAQIData();
        
        // Get AI-powered farm analysis
        const aiAnalysisPromise = getAIFarmAnalysis(location, coordinates);
        
        // Wait for all data
        const [weatherData, aqiData, aiAnalysis] = await Promise.allSettled([
            weatherPromise,
            aqiPromise,
            aiAnalysisPromise
        ]);
        
        return {
            location: location || 'Current Location',
            coordinates,
            weather: weatherData.status === 'fulfilled' ? weatherData.value : getDefaultWeatherData(),
            aqi: aqiData.status === 'fulfilled' ? aqiData.value : getDefaultAQIData(),
            analysis: aiAnalysis.status === 'fulfilled' ? aiAnalysis.value : getDefaultAnalysis(),
            sensors: generateMockSensorData(),
            recommendations: generateFarmRecommendations(),
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error('Error fetching AgriSenseX data:', error);
        return getDefaultAgriSenseXData(location);
    }
};

// Get AI-powered farm analysis
const getAIFarmAnalysis = async (location, coordinates) => {
    try {
        const messages = [
            {
                role: "system",
                content: "You are an expert in precision agriculture and farm monitoring. Provide specific insights about current farming conditions and actionable recommendations."
            },
            {
                role: "user",
                content: `Analyze current farming conditions for location: ${location || 'Bengaluru, Karnataka'}. Consider factors like seasonal patterns, optimal planting times, soil health recommendations, irrigation needs, and pest management. Provide specific, actionable insights for farmers in this region.`
            }
        ];

        const aiResponse = await apiService.getAIRecommendations(messages);
        
        if (aiResponse && aiResponse.choices && aiResponse.choices[0]) {
            const analysisText = aiResponse.choices[0].message.content;
            return parseAIAnalysis(analysisText);
        }
        
        return getDefaultAnalysis();
    } catch (error) {
        console.warn('AI analysis failed:', error);
        return getDefaultAnalysis();
    }
};

// Parse AI analysis into structured format
const parseAIAnalysis = (analysisText) => {
    const insights = extractInsights(analysisText);
    const recommendations = extractRecommendations(analysisText);
    const alerts = extractAlerts(analysisText);
    
    return {
        summary: analysisText.substring(0, 200) + '...',
        insights,
        recommendations,
        alerts,
        confidence: 0.85 + Math.random() * 0.1,
        aiGenerated: true
    };
};

// Extract insights from AI text
const extractInsights = (text) => {
    const insightPatterns = [
        /insight:?\s*([^.\n]+)/gi,
        /current:?\s*([^.\n]+)/gi,
        /condition:?\s*([^.\n]+)/gi
    ];
    
    let insights = [];
    for (const pattern of insightPatterns) {
        const matches = [...text.matchAll(pattern)];
        insights = insights.concat(matches.map(match => match[1].trim()));
    }
    
    return insights.slice(0, 3).length > 0 ? insights.slice(0, 3) : [
        "Soil moisture levels are optimal for current season",
        "Temperature conditions favor crop growth",
        "Moderate pest activity detected in the region"
    ];
};

// Extract recommendations from AI text
const extractRecommendations = (text) => {
    const recPatterns = [
        /recommend:?\s*([^.\n]+)/gi,
        /suggest:?\s*([^.\n]+)/gi,
        /advice:?\s*([^.\n]+)/gi
    ];
    
    let recommendations = [];
    for (const pattern of recPatterns) {
        const matches = [...text.matchAll(pattern)];
        recommendations = recommendations.concat(matches.map(match => match[1].trim()));
    }
    
    return recommendations.slice(0, 3).length > 0 ? recommendations.slice(0, 3) : [
        "Increase irrigation frequency due to rising temperatures",
        "Apply organic fertilizer for optimal nutrient balance",
        "Monitor for early signs of common seasonal pests"
    ];
};

// Extract alerts from AI text
const extractAlerts = (text) => {
    const alertPatterns = [
        /alert:?\s*([^.\n]+)/gi,
        /warning:?\s*([^.\n]+)/gi,
        /caution:?\s*([^.\n]+)/gi
    ];
    
    let alerts = [];
    for (const pattern of alertPatterns) {
        const matches = [...text.matchAll(pattern)];
        alerts = alerts.concat(matches.map(match => match[1].trim()));
    }
    
    return alerts.slice(0, 2).length > 0 ? alerts.slice(0, 2) : [
        "Monitor weather patterns for potential storm activity"
    ];
};

const generateMockSensorData = () => {
  const baseTemp = 25 + Math.random() * 10; // 25-35°C
  const baseHumidity = 60 + Math.random() * 30; // 60-90%
  const baseSoilMoisture = 40 + Math.random() * 40; // 40-80%
  const basePH = 6.5 + Math.random() * 1; // 6.5-7.5
  const baseNitrogen = 200 + Math.random() * 100; // 200-300 ppm
  const basePhosphorus = 50 + Math.random() * 50; // 50-100 ppm
  const basePotassium = 150 + Math.random() * 100; // 150-250 ppm

  return {
    temperature: baseTemp.toFixed(1),
    humidity: baseHumidity.toFixed(1),
    soilMoisture: baseSoilMoisture.toFixed(1),
    soilPH: basePH.toFixed(1),
    nitrogen: baseNitrogen.toFixed(0),
    phosphorus: basePhosphorus.toFixed(0),
    potassium: basePotassium.toFixed(0),
    lightIntensity: (20000 + Math.random() * 30000).toFixed(0),
    timestamp: new Date().toISOString()
  };
};

const generateWeatherData = () => {
  return {
    current: {
      temperature: (20 + Math.random() * 15).toFixed(1),
      humidity: (50 + Math.random() * 40).toFixed(0),
      windSpeed: (5 + Math.random() * 15).toFixed(1),
      precipitation: (Math.random() * 5).toFixed(1),
      condition: ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain'][Math.floor(Math.random() * 4)],
      uvIndex: Math.floor(Math.random() * 11)
    },
    forecast: Array.from({length: 7}, (_, i) => ({
      day: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
      high: (18 + Math.random() * 20).toFixed(0),
      low: (8 + Math.random() * 15).toFixed(0),
      condition: ['Sunny', 'Partly Cloudy', 'Cloudy', 'Rainy'][Math.floor(Math.random() * 4)],
      precipitation: (Math.random() * 40).toFixed(0)
    }))
  };
};

const generateFieldAnalysis = () => {
  return {
    fieldHealth: (70 + Math.random() * 25).toFixed(1),
    irrigationNeeds: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
    pestRisk: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
    diseaseRisk: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
    yieldPrediction: (85 + Math.random() * 15).toFixed(1),
    recommendations: [
      'Increase irrigation frequency in Zone 2',
      'Monitor for pest activity in northern section',
      'Apply nitrogen fertilizer to areas with low readings',
      'Harvest window optimal in 2-3 weeks'
    ],
    zones: Array.from({length: 4}, (_, i) => ({
      id: i + 1,
      name: `Zone ${i + 1}`,
      health: (60 + Math.random() * 35).toFixed(1),
      soilMoisture: (30 + Math.random() * 50).toFixed(1),
      needsAttention: Math.random() > 0.7
    }))
  };
};

const generateHistoricalData = (days = 30) => {
  return Array.from({length: days}, (_, i) => {
    const date = new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000);
    return {
      date: date.toISOString().split('T')[0],
      temperature: (20 + Math.random() * 15).toFixed(1),
      humidity: (40 + Math.random() * 40).toFixed(1),
      soilMoisture: (30 + Math.random() * 50).toFixed(1),
      yieldIndex: (70 + Math.random() * 25).toFixed(1)
    };
  });
};

const generateIrrigationSchedule = () => {
  const schedule = [];
  const today = new Date();
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today.getTime() + i * 24 * 60 * 60 * 1000);
    const zones = [];
    
    // Generate random irrigation needs for different zones
    for (let j = 1; j <= 4; j++) {
      if (Math.random() > 0.4) { // 60% chance a zone needs irrigation
        zones.push({
          zone: j,
          duration: Math.floor(15 + Math.random() * 45), // 15-60 minutes
          time: `${Math.floor(6 + Math.random() * 4)}:${Math.floor(Math.random() * 6)}0` // 6-10 AM
        });
      }
    }
    
    schedule.push({
      date: date.toLocaleDateString(),
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      zones
    });
  }
  
  return schedule;
};

export const getAgriSenseXDashboard = async () => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  return {
    sensors: generateMockSensorData(),
    weather: generateWeatherData(),
    fieldAnalysis: generateFieldAnalysis(),
    historicalData: generateHistoricalData(),
    irrigationSchedule: generateIrrigationSchedule(),
    alerts: [
      {
        id: 1,
        type: 'warning',
        title: 'Low Soil Moisture Detected',
        message: 'Zone 3 showing critically low soil moisture levels',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        priority: 'high'
      },
      {
        id: 2,
        type: 'info',
        title: 'Optimal Harvest Window',
        message: 'Weather conditions favorable for harvesting next week',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        priority: 'medium'
      },
      {
        id: 3,
        type: 'success',
        title: 'Irrigation Completed',
        message: 'Automated irrigation cycle completed successfully',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        priority: 'low'
      }
    ],
    systemStatus: {
      sensorsOnline: Math.floor(15 + Math.random() * 5),
      totalSensors: 18,
      lastUpdate: new Date().toISOString(),
      batteryLevels: Array.from({length: 6}, () => Math.floor(60 + Math.random() * 40))
    }
  };
};

export const toggleIrrigation = async (zoneId, duration) => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return {
    success: true,
    message: `Irrigation activated for Zone ${zoneId} for ${duration} minutes`,
    estimatedCompletion: new Date(Date.now() + duration * 60 * 1000).toISOString()
  };
};

export const updateIrrigationSchedule = async (schedule) => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    success: true,
    message: 'Irrigation schedule updated successfully',
    updatedSchedule: schedule
  };
};

export const downloadAgriSenseXReport = (dashboardData) => {
  if (!dashboardData) return;

  const reportContent = `
AGRISENSEX FARM MONITORING REPORT
================================

Report Generated: ${new Date().toLocaleDateString()}

CURRENT SENSOR READINGS:
- Temperature: ${dashboardData.sensors.temperature}°C
- Humidity: ${dashboardData.sensors.humidity}%
- Soil Moisture: ${dashboardData.sensors.soilMoisture}%
- Soil pH: ${dashboardData.sensors.soilPH}
- Nitrogen: ${dashboardData.sensors.nitrogen} ppm
- Phosphorus: ${dashboardData.sensors.phosphorus} ppm
- Potassium: ${dashboardData.sensors.potassium} ppm
- Light Intensity: ${dashboardData.sensors.lightIntensity} lux

WEATHER CONDITIONS:
- Current Temperature: ${dashboardData.weather.current.temperature}°C
- Humidity: ${dashboardData.weather.current.humidity}%
- Wind Speed: ${dashboardData.weather.current.windSpeed} km/h
- Precipitation: ${dashboardData.weather.current.precipitation} mm
- Condition: ${dashboardData.weather.current.condition}
- UV Index: ${dashboardData.weather.current.uvIndex}

FIELD ANALYSIS:
- Overall Field Health: ${dashboardData.fieldAnalysis.fieldHealth}%
- Irrigation Needs: ${dashboardData.fieldAnalysis.irrigationNeeds}
- Pest Risk Level: ${dashboardData.fieldAnalysis.pestRisk}
- Disease Risk Level: ${dashboardData.fieldAnalysis.diseaseRisk}
- Yield Prediction: ${dashboardData.fieldAnalysis.yieldPrediction}%

ZONE STATUS:
${dashboardData.fieldAnalysis.zones.map(zone => `
Zone ${zone.id} (${zone.name}):
- Health Score: ${zone.health}%
- Soil Moisture: ${zone.soilMoisture}%
- Attention Needed: ${zone.needsAttention ? 'Yes' : 'No'}
`).join('')}

RECOMMENDATIONS:
${dashboardData.fieldAnalysis.recommendations.map((rec, index) => `${index + 1}. ${rec}`).join('\n')}

SYSTEM STATUS:
- Sensors Online: ${dashboardData.systemStatus.sensorsOnline}/${dashboardData.systemStatus.totalSensors}
- Last Update: ${new Date(dashboardData.systemStatus.lastUpdate).toLocaleString()}

ACTIVE ALERTS:
${dashboardData.alerts.map(alert => `
- ${alert.title} (${alert.priority} priority)
  ${alert.message}
  Time: ${new Date(alert.timestamp).toLocaleString()}
`).join('')}

7-DAY WEATHER FORECAST:
${dashboardData.weather.forecast.map(day => `
${day.day}: ${day.condition}, High: ${day.high}°C, Low: ${day.low}°C, Rain: ${day.precipitation}%
`).join('')}

IRRIGATION SCHEDULE (Next 7 Days):
${dashboardData.irrigationSchedule.map(day => `
${day.day} (${day.date}):
${day.zones.length > 0 ? 
  day.zones.map(zone => `  Zone ${zone.zone}: ${zone.duration} min at ${zone.time}`).join('\n') : 
  '  No irrigation scheduled'
}
`).join('')}
  `;

  const blob = new Blob([reportContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `agrisensex-report-${Date.now()}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export default {
  getAgriSenseXDashboard,
  toggleIrrigation,
  updateIrrigationSchedule,
  downloadAgriSenseXReport
};
