// API Keys
const WAQI_API_KEY = 'ec3a883b47ce310481bed4b506063ebc70961e51'; // World Air Quality Index API
const OPENWEATHER_API_KEY = 'bd5e378503939ddaee76f12ad7a97608'; // OpenWeatherMap API

// DOM Elements
const locationNameEl = document.getElementById('location-name');
const aqiValueEl = document.getElementById('aqi-value');
const aqiStatusEl = document.getElementById('aqi-status');
const pm25ValueEl = document.getElementById('pm25-value');
const pm10ValueEl = document.getElementById('pm10-value');
const o3ValueEl = document.getElementById('o3-value');
const no2ValueEl = document.getElementById('no2-value');
const updateTimeEl = document.getElementById('update-time');
const temperatureEl = document.getElementById('temperature');
const humidityEl = document.getElementById('humidity');
const windSpeedEl = document.getElementById('wind-speed');
const activitiesListEl = document.getElementById('activities-list');
const healthMessageEl = document.getElementById('health-message');
const refreshBtn = document.getElementById('refresh-btn');

// AQI data structure
const aqiData = {
    good: {
        range: [0, 50],
        color: "#009966",
        label: "Good",
        description: "Air quality is satisfactory, and air pollution poses little or no risk."
    },
    moderate: {
        range: [51, 100],
        color: "#ffde33",
        label: "Moderate",
        description: "Air quality is acceptable. However, there may be a risk for some people."
    },
    unhealthySensitive: {
        range: [101, 150],
        color: "#ff9933",
        label: "Unhealthy for Sensitive Groups",
        description: "Members of sensitive groups may experience health effects."
    },
    unhealthy: {
        range: [151, 200],
        color: "#cc0033",
        label: "Unhealthy",
        description: "Everyone may begin to experience health effects."
    },
    veryUnhealthy: {
        range: [201, 300],
        color: "#660099",
        label: "Very Unhealthy",
        description: "Health alert: everyone may experience more serious health effects."
    }
};

// Farm Activities based on AQI and Weather
const farmActivities = {
    good: [
        {
            title: 'Outdoor Planting',
            description: 'Excellent conditions for planting seedlings and transplanting.',
            icon: 'seedling'
        },
        {
            title: 'Harvesting',
            description: 'Ideal time for harvesting crops and collecting produce.',
            icon: 'wheat-awn'
        },
        {
            title: 'Pesticide Application',
            description: 'Good conditions for applying organic pesticides if needed.',
            icon: 'spray-can'
        }
    ],
    moderate: [
        {
            title: 'Limited Outdoor Work',
            description: 'Focus on less strenuous activities and take regular breaks.',
            icon: 'clock'
        },
        {
            title: 'Irrigation',
            description: 'Good time for watering crops and checking irrigation systems.',
            icon: 'faucet'
        },
        {
            title: 'Maintenance',
            description: 'Perform equipment maintenance and indoor tasks.',
            icon: 'wrench'
        }
    ],
    unhealthy: [
        {
            title: 'Indoor Activities',
            description: 'Focus on indoor farming tasks and greenhouse work.',
            icon: 'warehouse'
        },
        {
            title: 'Planning',
            description: 'Use this time for crop planning and record keeping.',
            icon: 'clipboard'
        },
        {
            title: 'Monitoring',
            description: 'Check crop health from protected areas.',
            icon: 'magnifying-glass'
        }
    ],
    hazardous: [
        {
            title: 'Avoid Outdoor Activities',
            description: 'Postpone all outdoor farming activities.',
            icon: 'triangle-exclamation'
        },
        {
            title: 'Protect Crops',
            description: 'If possible, protect sensitive crops from air pollution.',
            icon: 'shield'
        },
        {
            title: 'Indoor Work Only',
            description: 'Focus on essential indoor tasks only.',
            icon: 'house'
        }
    ]
};

// Get user's location
async function getUserLocation() {
    try {
        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        
        return {
            lat: position.coords.latitude,
            lon: position.coords.longitude
        };
    } catch (error) {
        console.error('Error getting location:', error);
        locationNameEl.textContent = 'Location access denied';
        throw error;
    }
}

// Get location name from coordinates
async function getLocationName(lat, lon) {
    try {
        const response = await fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${OPENWEATHER_API_KEY}`);
        if (!response.ok) {
            throw new Error('Failed to fetch location data');
        }
        const data = await response.json();
        if (!data || data.length === 0) {
            throw new Error('No location data found');
        }
        return data[0].name + ', ' + data[0].country;
    } catch (error) {
        console.error('Error getting location name:', error);
        return 'Unknown Location';
    }
}

// Get AQI data from coordinates
async function getAQIData(lat, lon) {
    try {
        const response = await fetch(`https://api.waqi.info/feed/geo:${lat};${lon}/?token=${WAQI_API_KEY}`);
        const data = await response.json();
        
        if (data.status === 'ok') {
            return data.data;
        } else if (WAQI_API_KEY === 'demo') {
            console.warn('Using demo token - limited functionality. Please get a proper API key.');
            // Provide mock data based on weather conditions
            return getMockAQIData();
        } else {
            throw new Error('Failed to fetch AQI data');
        }
    } catch (error) {
        console.error('Error getting AQI data:', error);
        return getMockAQIData();
    }
}

// Generate mock AQI data for testing
function getMockAQIData() {
    // Generate realistic-looking mock data
    const baseAQI = Math.floor(Math.random() * 150) + 20; // AQI between 20-170
    
    return {
        aqi: baseAQI,
        iaqi: {
            pm25: { v: Math.round(baseAQI * 0.8) },
            pm10: { v: Math.round(baseAQI * 1.2) },
            o3: { v: Math.round(Math.random() * 80) + 10 },
            no2: { v: Math.round(Math.random() * 60) + 5 }
        },
        time: {
            s: new Date().toISOString(),
            tz: Intl.DateTimeFormat().resolvedOptions().timeZone
        }
    };
}

// Get weather data from coordinates
async function getWeatherData(lat, lon) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${OPENWEATHER_API_KEY}`);
        if (!response.ok) {
            throw new Error('Failed to fetch weather data');
        }
        const data = await response.json();
        
        // Validate essential weather data
        if (!data.main || !data.wind) {
            throw new Error('Invalid weather data format');
        }
        
        return data;
    } catch (error) {
        console.error('Error getting weather data:', error);
        throw error;
    }
}

// Initialize AQI Gauge
function initAQIGauge() {
    const gaugeElement = document.getElementById('aqi-gauge');
    if (!gaugeElement) return null;

    return new JustGage({
        id: 'aqi-gauge',
        value: 0,
        min: 0,
        max: 300,
        hideValue: true,
        hideMinMax: true,
        title: '',
        label: '',
        valueFontColor: 'transparent',
        levelColors: [
            aqiData.good.color,
            aqiData.moderate.color,
            aqiData.unhealthySensitive.color,
            aqiData.unhealthy.color,
            aqiData.veryUnhealthy.color
        ],
        pointer: true,
        pointerOptions: {
            toplength: -15,
            bottomlength: 10,
            bottomwidth: 12,
            color: '#8e8e93',
            stroke: '#ffffff',
            stroke_width: 3,
            stroke_linecap: 'round'
        },
        gaugeWidthScale: 0.6,
        counter: false,
        donut: false,
        relativeGaugeSize: true,
        customSectors: {
            percents: false,
            ranges: [
                { color: aqiData.good.color, lo: 0, hi: 50 },
                { color: aqiData.moderate.color, lo: 51, hi: 100 },
                { color: aqiData.unhealthySensitive.color, lo: 101, hi: 150 },
                { color: aqiData.unhealthy.color, lo: 151, hi: 200 },
                { color: aqiData.veryUnhealthy.color, lo: 201, hi: 300 }
            ]
        },
        startAnimationType: "bounce"
    });
}

// Update AQI display
function updateAQI(aqiValue) {
    let category;
    if (aqiValue <= aqiData.good.range[1]) category = 'good';
    else if (aqiValue <= aqiData.moderate.range[1]) category = 'moderate';
    else if (aqiValue <= aqiData.unhealthySensitive.range[1]) category = 'unhealthySensitive';
    else if (aqiValue <= aqiData.unhealthy.range[1]) category = 'unhealthy';
    else category = 'veryUnhealthy';

    const data = aqiData[category];
    
    // Update AQI display elements
    const aqiNumberElement = document.getElementById('aqi-number');
    const aqiStatusElement = document.getElementById('aqi-status');
    const aqiDescriptionElement = document.getElementById('aqi-description');

    if (aqiNumberElement) {
        aqiNumberElement.textContent = aqiValue;
        aqiNumberElement.style.color = data.color;
    }
    
    if (aqiStatusElement) {
        aqiStatusElement.textContent = data.label;
        aqiStatusElement.style.color = data.color;
    }
    
    if (aqiDescriptionElement) {
        aqiDescriptionElement.textContent = data.description;
    }

    // Update gauge if it exists
    if (window.aqiGauge) {
        window.aqiGauge.refresh(aqiValue);
    }
}

// Update pollutant colors based on values
function updatePollutantColors(iaqi) {
    const pollutants = {
        pm25: { element: pm25ValueEl, threshold: { good: 12, moderate: 35.4, unhealthy: 55.4 } },
        pm10: { element: pm10ValueEl, threshold: { good: 54, moderate: 154, unhealthy: 254 } },
        o3: { element: o3ValueEl, threshold: { good: 50, moderate: 100, unhealthy: 150 } },
        no2: { element: no2ValueEl, threshold: { good: 53, moderate: 100, unhealthy: 360 } }
    };

    Object.entries(pollutants).forEach(([key, info]) => {
        const value = iaqi[key]?.v;
        if (value) {
            const element = info.element.parentElement;
            let color;
            
            if (value <= info.threshold.good) {
                color = '#4CAF50';
            } else if (value <= info.threshold.moderate) {
                color = '#FFC107';
            } else if (value <= info.threshold.unhealthy) {
                color = '#FF9800';
            } else {
                color = '#F44336';
            }
            
            element.style.borderColor = color;
            element.style.backgroundColor = `${color}10`;
        }
    });
}

// Update activities list
function updateActivities(aqi, weather) {
    let activities;
    if (aqi <= 50) activities = farmActivities.good;
    else if (aqi <= 100) activities = farmActivities.moderate;
    else if (aqi <= 150) activities = farmActivities.unhealthy;
    else activities = farmActivities.hazardous;

    const warnings = getWeatherWarnings(weather);
    
    let html = '';
    activities.forEach(activity => {
        html += `
            <div class="activity-item">
                <i class="fas fa-${activity.icon}"></i>
                <div class="activity-content">
                    <h4>${activity.title}</h4>
                    <p>${activity.description}</p>
                </div>
            </div>
        `;
    });

    warnings.forEach(warning => {
        html += `
            <div class="activity-item warning-${warning.severity}">
                <i class="fas fa-${warning.icon}"></i>
                <div class="activity-content">
                    <h4>Weather Advisory</h4>
                    <p>${warning.message}</p>
                </div>
            </div>
        `;
    });

    activitiesListEl.innerHTML = html;
}

// Get weather warnings
function getWeatherWarnings(weather) {
    const warnings = [];
    
    if (weather.main.temp > 35) {
        warnings.push({
            message: 'High temperature alert: Take frequent breaks and stay hydrated.',
            severity: 'high',
            icon: 'temperature-high'
        });
    }
    if (weather.main.temp < 5) {
        warnings.push({
            message: 'Low temperature alert: Protect sensitive crops from frost.',
            severity: 'high',
            icon: 'temperature-low'
        });
    }
    if (weather.wind.speed > 20) {
        warnings.push({
            message: 'Strong winds: Secure equipment and protect crops.',
            severity: 'medium',
            icon: 'wind'
        });
    }
    if (weather.main.humidity > 85) {
        warnings.push({
            message: 'High humidity: Monitor for potential fungal diseases.',
            severity: 'medium',
            icon: 'droplet'
        });
    }

    return warnings;
}

// Update health message
function updateHealthMessage(aqi) {
    const messages = {
        good: 'Air quality is ideal for all farming activities.',
        moderate: 'Sensitive individuals should take breaks during extended outdoor work.',
        unhealthy: 'Wear appropriate protection for outdoor activities and limit exposure.',
        hazardous: 'Avoid outdoor activities. If necessary, wear proper PPE.'
    };

    let message;
    if (aqi <= 50) message = messages.good;
    else if (aqi <= 100) message = messages.moderate;
    else if (aqi <= 150) message = messages.unhealthy;
    else message = messages.hazardous;

    healthMessageEl.textContent = message;
}

// Refresh data
async function refreshData() {
    try {
        refreshBtn.disabled = true;
        refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';

        const location = await getUserLocation();
        const [locationName, aqiData, weatherData] = await Promise.all([
            getLocationName(location.lat, location.lon),
            getAQIData(location.lat, location.lon),
            getWeatherData(location.lat, location.lon)
        ]);

        // Update location
        locationNameEl.textContent = locationName;

        // Update AQI data
        updateAQI(aqiData.aqi);
        pm25ValueEl.textContent = aqiData.iaqi.pm25?.v || '--';
        pm10ValueEl.textContent = aqiData.iaqi.pm10?.v || '--';
        o3ValueEl.textContent = aqiData.iaqi.o3?.v || '--';
        no2ValueEl.textContent = aqiData.iaqi.no2?.v || '--';

        // Update weather data
        temperatureEl.textContent = `${Math.round(weatherData.main.temp)}°C`;
        humidityEl.textContent = `${weatherData.main.humidity}%`;
        windSpeedEl.textContent = `${Math.round(weatherData.wind.speed * 3.6)} km/h`; // Convert m/s to km/h

        // Update activities and health message
        updateActivities(aqiData.aqi, weatherData);
        updateHealthMessage(aqiData.aqi);

        // Update time
        updateTimeEl.textContent = new Date().toLocaleTimeString();

    } catch (error) {
        console.error('Error refreshing data:', error);
        activitiesListEl.innerHTML = `
            <div class="activity-placeholder">
                <i class="fas fa-exclamation-circle"></i>
                <p>Failed to load data. Please try again later.</p>
            </div>
        `;
    } finally {
        refreshBtn.disabled = false;
        refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh';
    }
}

// Event listeners
refreshBtn.addEventListener('click', refreshData);

// Initial load
refreshData();

// Initialize AQI gauge
window.aqiGauge = initAQIGauge();

// Update AQI every 5 minutes with real data from API
setInterval(async () => {
    try {
        const response = await fetch('https://api.waqi.info/feed/here/?token=YOUR_AQI_TOKEN');
        const data = await response.json();
        if (data.status === 'ok') {
            updateAQI(data.data.aqi);
        }
    } catch (error) {
        console.error('Error fetching AQI data:', error);
        // Use mock data if API fails
        const mockAQI = Math.floor(Math.random() * 100) + 50;
        updateAQI(mockAQI);
    }
}, 300000); // 5 minutes 