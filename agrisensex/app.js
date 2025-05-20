// Utility functions
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // Trigger reflow
    toast.offsetHeight;
    
    // Show toast
    toast.classList.add('show');
    
    // Remove toast after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function setLoading(element, isLoading) {
    if (isLoading) {
        element.classList.add('loading');
    } else {
        element.classList.remove('loading');
    }
}

// Initialize main functionality
document.addEventListener('DOMContentLoaded', () => {
    initializeMap();
    initializeCharts();
    loadWeatherData();
    loadBioengineering();
    initializeRealTimeUpdates();
});

// Map initialization with enhanced features
function initializeMap() {
    try {
        const mapElement = document.getElementById('farm-map');
        setLoading(mapElement, true);

        // Initialize map with Bangalore as default view
        const map = L.map('farm-map', {
            zoomControl: false
        }).setView([12.9716, 77.5946], 13); // Bangalore coordinates
        
        // Add base layers
        const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        });
        
        const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: '© Esri'
        });

        // Set default layer
        osmLayer.addTo(map);

        // Initialize drawing controls
        const drawnItems = new L.FeatureGroup();
        map.addLayer(drawnItems);

        const drawControl = new L.Control.Draw({
            draw: {
                polygon: {
                    allowIntersection: false,
                    showArea: true
                },
                circle: false,
                circlemarker: false,
                marker: false,
                polyline: false,
                rectangle: false
            },
            edit: {
                featureGroup: drawnItems
            }
        });

        // Add sample field boundaries with enhanced popups
        const field1 = L.polygon([
            [51.509, -0.08],
            [51.503, -0.06],
            [51.51, -0.047]
        ], {
            color: '#2ecc71',
            fillOpacity: 0.5
        }).addTo(map);

        const field2 = L.polygon([
            [51.503, -0.11],
            [51.499, -0.09],
            [51.497, -0.12]
        ], {
            color: '#3498db',
            fillOpacity: 0.5
        }).addTo(map);

        // Enhanced field popups
        function createFieldPopup(fieldName, cropType, area) {
            return `
                <div class="field-popup">
                    <h3>${fieldName}</h3>
                    <p><strong>Crop:</strong> ${cropType}</p>
                    <p><strong>Area:</strong> ${area} acres</p>
                    <div class="field-actions">
                        <button onclick="editField('${fieldName}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button onclick="viewFieldDetails('${fieldName}')">
                            <i class="fas fa-info-circle"></i> Details
                        </button>
                    </div>
                </div>
            `;
        }

        field1.bindPopup(createFieldPopup('Field A', 'Corn', 25));
        field2.bindPopup(createFieldPopup('Field B', 'Soybeans', 30));

        // Current location handling
        let currentLocationMarker = null;
        let currentLocationAccuracyCircle = null;

        document.getElementById('current-location')?.addEventListener('click', () => {
            const button = document.getElementById('current-location');
            button.classList.add('active');
            
            if (!navigator.geolocation) {
                showToast('Geolocation is not supported by your browser.', 'error');
                button.classList.remove('active');
                return;
            }

            showToast('Fetching your location...', 'success');

            const options = {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            };

            const onSuccess = (position) => {
                const { latitude, longitude, accuracy } = position.coords;
                
                // Remove existing marker and accuracy circle if any
                if (currentLocationMarker) {
                    map.removeLayer(currentLocationMarker);
                }
                if (currentLocationAccuracyCircle) {
                    map.removeLayer(currentLocationAccuracyCircle);
                }

                // Add new marker
                currentLocationMarker = L.marker([latitude, longitude], {
                    icon: L.divIcon({
                        className: 'current-location-marker',
                        html: '<i class="fas fa-crosshairs"></i>',
                        iconSize: [20, 20]
                    })
                }).addTo(map);

                // Add accuracy circle
                currentLocationAccuracyCircle = L.circle([latitude, longitude], {
                    radius: accuracy,
                    color: '#2ecc71',
                    fillColor: 'rgba(46, 204, 113, 0.1)',
                    fillOpacity: 0.3
                }).addTo(map);

                // Pan to location with animation
                map.flyTo([latitude, longitude], 16, {
                    duration: 1.5
                });

                currentLocationMarker.bindPopup('Your current location').openPopup();
                showToast('Location found!', 'success');
                button.classList.remove('active');
            };

            const onError = (error) => {
                let errorMessage = 'Unable to get your location.';
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = 'Location access denied. Please enable location services.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = 'Location information is unavailable.';
                        break;
                    case error.TIMEOUT:
                        errorMessage = 'Location request timed out.';
                        break;
                }
                showToast(errorMessage, 'error');
                button.classList.remove('active');
            };

            navigator.geolocation.getCurrentPosition(onSuccess, onError, options);
        });

        document.getElementById('toggle-satellite')?.addEventListener('click', function() {
            if (map.hasLayer(osmLayer)) {
                map.removeLayer(osmLayer);
                map.addLayer(satelliteLayer);
                this.classList.add('active');
            } else {
                map.removeLayer(satelliteLayer);
                map.addLayer(osmLayer);
                this.classList.remove('active');
            }
        });

        // Location search functionality
        const searchInput = document.getElementById('location-search');
        const searchResults = document.querySelector('.search-results');

        let searchTimeout;
        searchInput?.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            const query = e.target.value;

            if (query.length < 3) {
                searchResults.classList.remove('active');
                return;
            }

            searchTimeout = setTimeout(async () => {
                try {
                    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
                    const data = await response.json();

                    searchResults.innerHTML = data.map(result => `
                        <div class="search-result-item" data-lat="${result.lat}" data-lon="${result.lon}">
                            ${result.display_name}
                        </div>
                    `).join('');

                    searchResults.classList.add('active');

                    // Add click handlers to search results
                    document.querySelectorAll('.search-result-item').forEach(item => {
                        item.addEventListener('click', () => {
                            const lat = parseFloat(item.dataset.lat);
                            const lon = parseFloat(item.dataset.lon);
                            map.setView([lat, lon], 15);
                            searchResults.classList.remove('active');
                            searchInput.value = item.textContent.trim();
                        });
                    });
                } catch (error) {
                    console.error('Error searching location:', error);
                    showToast('Error searching location. Please try again.', 'error');
                }
            }, 500);
        });

        // Area measurement tool
        let measureMode = false;
        let measurePolygon = null;
        let measurePoints = [];

        document.getElementById('measure-area')?.addEventListener('click', () => {
            if (!measureMode) {
                measureMode = true;
                measurePoints = [];
                showToast('Click on the map to start measuring area', 'success');
                map.on('click', onMapClick);
            } else {
                measureMode = false;
                if (measurePolygon) {
                    map.removeLayer(measurePolygon);
                }
                map.off('click', onMapClick);
                showToast('Area measurement cancelled', 'success');
            }
        });

        function onMapClick(e) {
            measurePoints.push([e.latlng.lat, e.latlng.lng]);
            
            if (measurePolygon) {
                map.removeLayer(measurePolygon);
            }
            
            if (measurePoints.length > 2) {
                measurePolygon = L.polygon(measurePoints, {
                    color: '#e74c3c',
                    fillOpacity: 0.3
                }).addTo(map);
                
                const area = L.GeometryUtil.geodesicArea(measurePolygon.getLatLngs()[0]);
                const areaAcres = (area / 4046.86).toFixed(2); // Convert square meters to acres
                
                measurePolygon.bindPopup(`Area: ${areaAcres} acres`).openPopup();
            }
        }

        // Add field functionality
        document.getElementById('add-field')?.addEventListener('click', () => {
            map.addControl(drawControl);
            showToast('Draw a polygon to add a new field', 'success');
        });

        map.on('draw:created', function(e) {
            const layer = e.layer;
            drawnItems.addLayer(layer);
            
            // Calculate area
            const area = L.GeometryUtil.geodesicArea(layer.getLatLngs()[0]);
            const areaAcres = (area / 4046.86).toFixed(2);
            
            // Prompt for field details
            const fieldName = prompt('Enter field name:');
            const cropType = prompt('Enter crop type:');
            
            if (fieldName && cropType) {
                layer.bindPopup(createFieldPopup(fieldName, cropType, areaAcres));
            }
            
            map.removeControl(drawControl);
        });

        setLoading(mapElement, false);

        // Add fullscreen toggle functionality
        const toggleFullscreen = document.getElementById('toggle-fullscreen');
        const mapCard = document.querySelector('.map-card');

        toggleFullscreen.addEventListener('click', () => {
            mapCard.classList.toggle('fullscreen');
            map.invalidateSize(); // Ensure map renders correctly after resize
            
            // Update icon based on fullscreen state
            const icon = toggleFullscreen.querySelector('i');
            if (mapCard.classList.contains('fullscreen')) {
                icon.classList.remove('fa-expand');
                icon.classList.add('fa-compress');
            } else {
                icon.classList.remove('fa-compress');
                icon.classList.add('fa-expand');
            }
        });

        // Add solution benefits section
        const benefitsSection = document.createElement('div');
        benefitsSection.className = 'benefits-section glass-morphism';
        benefitsSection.innerHTML = `
            <div class="benefits-container">
                <h3><i class="fas fa-star"></i> Our Solution Benefits</h3>
                <div class="benefits-grid">
                    <div class="benefit-card">
                        <i class="fas fa-leaf"></i>
                        <h4>Smart Crop Rotation</h4>
                        <p>AI-driven recommendations for optimal crop sequences that improve soil health and reduce environmental impact.</p>
                    </div>
                    <div class="benefit-card">
                        <i class="fas fa-cloud"></i>
                        <h4>AQI Improvement</h4>
                        <p>Our system helps reduce air pollution through better farming practices, potentially improving local AQI by 20-30%.</p>
                    </div>
                    <div class="benefit-card">
                        <i class="fas fa-tint"></i>
                        <h4>Water Conservation</h4>
                        <p>Smart irrigation recommendations and soil moisture monitoring reduce water usage by up to 40%.</p>
                    </div>
                    <div class="benefit-card">
                        <i class="fas fa-seedling"></i>
                        <h4>Soil Health</h4>
                        <p>Continuous monitoring and recommendations for maintaining optimal soil conditions and biodiversity.</p>
                    </div>
                </div>
                <div class="aqi-impact-section">
                    <h3><i class="fas fa-chart-line"></i> AQI Impact Analysis</h3>
                    <div class="aqi-benefits">
                        <div class="aqi-benefit-item">
                            <i class="fas fa-check-circle"></i>
                            <p><strong>Reduced Emissions:</strong> Smart farming practices minimize the need for harmful pesticides and reduce agricultural emissions.</p>
                        </div>
                        <div class="aqi-benefit-item">
                            <i class="fas fa-check-circle"></i>
                            <p><strong>Carbon Sequestration:</strong> Optimal crop rotation increases soil carbon storage, helping combat air pollution.</p>
                        </div>
                        <div class="aqi-benefit-item">
                            <i class="fas fa-check-circle"></i>
                            <p><strong>Dust Mitigation:</strong> Better soil management reduces dust particles in the air, improving local air quality.</p>
                        </div>
                        <div class="aqi-benefit-item">
                            <i class="fas fa-check-circle"></i>
                            <p><strong>Sustainable Agriculture:</strong> Long-term improvements in air quality through sustainable farming practices.</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add styles for the benefits section
        const benefitsStyle = document.createElement('style');
        benefitsStyle.textContent = `
            .benefits-section {
                margin: 2rem 0;
                padding: 2rem;
                border-radius: 15px;
            }

            .benefits-container h3 {
                color: var(--text-color);
                margin-bottom: 1.5rem;
                font-size: 1.5rem;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }

            .benefits-container h3 i {
                color: #2ecc71;
            }

            .benefits-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 1.5rem;
                margin-bottom: 2rem;
            }

            .benefit-card {
                background: rgba(255, 255, 255, 0.1);
                padding: 1.5rem;
                border-radius: 12px;
                text-align: center;
                transition: transform 0.3s ease, box-shadow 0.3s ease;
            }

            .benefit-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 10px 20px rgba(46, 204, 113, 0.1);
            }

            .benefit-card i {
                font-size: 2rem;
                color: #2ecc71;
                margin-bottom: 1rem;
            }

            .benefit-card h4 {
                color: var(--text-color);
                margin-bottom: 0.5rem;
                font-size: 1.2rem;
            }

            .benefit-card p {
                color: var(--text-color);
                opacity: 0.8;
                line-height: 1.5;
            }

            .aqi-impact-section {
                margin-top: 3rem;
            }

            .aqi-benefits {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 1.5rem;
                margin-top: 1.5rem;
            }

            .aqi-benefit-item {
                display: flex;
                align-items: flex-start;
                gap: 1rem;
                padding: 1rem;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 10px;
                transition: transform 0.3s ease;
            }

            .aqi-benefit-item:hover {
                transform: translateX(5px);
            }

            .aqi-benefit-item i {
                color: #2ecc71;
                font-size: 1.2rem;
                margin-top: 0.2rem;
            }

            .aqi-benefit-item p {
                margin: 0;
                line-height: 1.5;
            }

            .aqi-benefit-item strong {
                color: var(--text-color);
            }

            @media (max-width: 768px) {
                .benefits-grid {
                    grid-template-columns: 1fr;
                }

                .aqi-benefits {
                    grid-template-columns: 1fr;
                }
            }
        `;
        document.head.appendChild(benefitsStyle);

        // Insert the benefits section after the map
        mapElement.parentNode.insertBefore(benefitsSection, mapElement.nextSibling);

        // Handle escape key to exit fullscreen
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && mapCard.classList.contains('fullscreen')) {
                mapCard.classList.remove('fullscreen');
                const icon = toggleFullscreen.querySelector('i');
                icon.classList.remove('fa-compress');
                icon.classList.add('fa-expand');
                map.invalidateSize();
            }
        });
    } catch (error) {
        console.error('Error initializing map:', error);
        showToast('Error loading map. Please refresh the page.', 'error');
    }
}

// Charts initialization
async function initializeCharts() {
    // Initialize chart instances
    let aqiChart;
    let baseAQI = 50; // Starting with a moderate AQI value
    let aqiValues = []; // Array to store AQI values for average calculation
    
    try {
        // Create average AQI display element
        const aqiCard = document.querySelector('.aqi-card');
        const averageDisplay = document.createElement('div');
        averageDisplay.className = 'aqi-average';
        averageDisplay.innerHTML = `
            <div class="average-value">
                <span>Average AQI: </span>
                <span id="avgAQI">--</span>
            </div>
        `;
        aqiCard.insertBefore(averageDisplay, document.getElementById('aqiChart'));

        // Add styles for average display
        const style = document.createElement('style');
        style.textContent = `
            .aqi-average {
                text-align: center;
                padding: 10px;
                margin-bottom: 15px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 5px;
            }
            .average-value {
                font-size: 1.2rem;
                font-weight: bold;
            }
            #avgAQI {
                color: var(--primary-color);
            }
        `;
        document.head.appendChild(style);

        // AQI Chart with real-time data
        const aqiCtx = document.getElementById('aqiChart').getContext('2d');
        aqiChart = new Chart(aqiCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Air Quality Index',
                    data: [],
                    borderColor: '#2ecc71',
                    tension: 0.4,
                    fill: false
                }]
            },
            options: {
                responsive: true,
                animation: {
                    duration: 0 // Disable animation for smoother updates
                },
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        suggestedMax: 150,
                        title: {
                            display: true,
                            text: 'AQI Value'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Time'
                        }
                    }
                }
            }
        });

        // Function to calculate average AQI
        function calculateAverageAQI() {
            if (aqiValues.length === 0) return '--';
            const sum = aqiValues.reduce((a, b) => a + b, 0);
            return (sum / aqiValues.length).toFixed(1);
        }

        // Function to simulate realistic AQI variations
        function simulateAQIValue() {
            // Add small random variations (-2 to +2)
            const variation = (Math.random() * 4) - 2;
            
            // Gradually drift the base AQI
            baseAQI += (Math.random() * 0.4) - 0.2;
            
            // Keep baseAQI within realistic bounds (0-300)
            baseAQI = Math.max(0, Math.min(300, baseAQI));
            
            // Return the current AQI with variation
            return Math.max(0, baseAQI + variation);
        }

        // Function to update AQI data every 10 seconds
        function updateAQIData() {
            const aqi = simulateAQIValue();
            const timestamp = new Date().toLocaleTimeString('en-US', { 
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            
            // Update chart data
            if (aqiChart) {
                aqiChart.data.labels.push(timestamp);
                aqiChart.data.datasets[0].data.push(aqi);
                
                // Keep only last 30 readings (5 minutes of data)
                if (aqiChart.data.labels.length > 30) {
                    aqiChart.data.labels.shift();
                    aqiChart.data.datasets[0].data.shift();
                }

                // Update AQI values array for average calculation
                aqiValues.push(aqi);
                if (aqiValues.length > 30) {
                    aqiValues.shift();
                }
                
                // Update average display
                document.getElementById('avgAQI').textContent = calculateAverageAQI();
                
                aqiChart.update('none'); // Update without animation
                checkAQILevel(aqi);
            }
        }

        // Start updating AQI data every 10 seconds
        const aqiUpdateInterval = setInterval(updateAQIData, 10000);

        // Cleanup interval when changing pages or components
        window.addEventListener('beforeunload', () => {
            clearInterval(aqiUpdateInterval);
        });

    } catch (error) {
        console.error('Error initializing charts:', error);
        showToast('Error initializing charts. Please refresh the page.', 'error');
    }
}

function checkAQILevel(value) {
    const levels = [
        { max: 50, label: 'Good', color: '#2ecc71' },
        { max: 100, label: 'Moderate', color: '#f1c40f' },
        { max: 150, label: 'Unhealthy for Sensitive Groups', color: '#e67e22' },
        { max: 200, label: 'Unhealthy', color: '#e74c3c' },
        { max: 300, label: 'Very Unhealthy', color: '#9b59b6' },
        { max: Infinity, label: 'Hazardous', color: '#8e44ad' }
    ];

    for (const level of levels) {
        if (value <= level.max) {
            if (level.max < 100) {
                return; // Don't show toast for good levels
            }
            showToast(`Air Quality Alert: ${level.label} (AQI: ${value})`, 'error');
            break;
        }
    }
}

// Weather API Configuration
const WEATHER_API_KEY = '731ee3473e67416aba412740250404';
const WEATHER_API_URL = 'https://api.weatherapi.com/v1/forecast.json';

// Function to get weather icon based on weather code
function getWeatherIcon(condition) {
    const iconMap = {
        'Sunny': 'fa-sun',
        'Clear': 'fa-moon',
        'Partly cloudy': 'fa-cloud-sun',
        'Cloudy': 'fa-cloud',
        'Overcast': 'fa-cloud',
        'Mist': 'fa-smog',
        'Patchy rain possible': 'fa-cloud-rain',
        'Patchy snow possible': 'fa-snowflake',
        'Patchy sleet possible': 'fa-cloud-rain',
        'Patchy freezing drizzle possible': 'fa-cloud-rain',
        'Thundery outbreaks possible': 'fa-bolt',
        'Blowing snow': 'fa-snowflake',
        'Blizzard': 'fa-snowflake',
        'Fog': 'fa-smog',
        'Freezing fog': 'fa-smog',
        'Patchy light drizzle': 'fa-cloud-rain',
        'Light drizzle': 'fa-cloud-rain',
        'Freezing drizzle': 'fa-cloud-rain',
        'Heavy freezing drizzle': 'fa-cloud-rain',
        'Patchy light rain': 'fa-cloud-rain',
        'Light rain': 'fa-cloud-rain',
        'Moderate rain at times': 'fa-cloud-rain',
        'Moderate rain': 'fa-cloud-rain',
        'Heavy rain at times': 'fa-cloud-showers-heavy',
        'Heavy rain': 'fa-cloud-showers-heavy',
        'Light freezing rain': 'fa-cloud-rain',
        'Moderate or heavy freezing rain': 'fa-cloud-rain',
        'Light sleet': 'fa-cloud-rain',
        'Moderate or heavy sleet': 'fa-cloud-rain',
        'Patchy light snow': 'fa-snowflake',
        'Light snow': 'fa-snowflake',
        'Patchy moderate snow': 'fa-snowflake',
        'Moderate snow': 'fa-snowflake',
        'Patchy heavy snow': 'fa-snowflake',
        'Heavy snow': 'fa-snowflake',
        'Ice pellets': 'fa-snowflake',
        'Light rain shower': 'fa-cloud-rain',
        'Moderate or heavy rain shower': 'fa-cloud-showers-heavy',
        'Torrential rain shower': 'fa-cloud-showers-heavy',
        'Light sleet showers': 'fa-cloud-rain',
        'Moderate or heavy sleet showers': 'fa-cloud-rain',
        'Light snow showers': 'fa-snowflake',
        'Moderate or heavy snow showers': 'fa-snowflake',
        'Light showers of ice pellets': 'fa-snowflake',
        'Moderate or heavy showers of ice pellets': 'fa-snowflake',
        'Patchy light rain with thunder': 'fa-bolt',
        'Moderate or heavy rain with thunder': 'fa-bolt',
        'Patchy light snow with thunder': 'fa-bolt',
        'Moderate or heavy snow with thunder': 'fa-bolt'
    };
    return iconMap[condition] || 'fa-cloud';
}

// Function to format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        day: date.toLocaleDateString('en-US', { weekday: 'long' })
    };
}

// Function to fetch weather data
async function fetchWeatherData() {
    try {
        // For demo purposes, using Bangalore coordinates
        const q = 'Bangalore';
        
        const response = await fetch(`${WEATHER_API_URL}?key=${WEATHER_API_KEY}&q=${q}&days=5&aqi=yes&alerts=yes`);
        const data = await response.json();
        
        // Update the weather forecast display
        const forecastContainer = document.querySelector('.weather-forecast');
        forecastContainer.innerHTML = data.forecast.forecastday.map(day => {
            const { date, day: dayName } = formatDate(day.date);
            const condition = day.day.condition.text;
            const weatherIcon = getWeatherIcon(condition);
            const temp = Math.round(day.day.avgtemp_c);
            const maxTemp = Math.round(day.day.maxtemp_c);
            const minTemp = Math.round(day.day.mintemp_c);
            
            return `
                <div class="forecast-day">
                    <div class="day-info">
                        <span class="date">${date}</span>
                        <span class="day">${dayName}</span>
                    </div>
                    <div class="weather-info">
                        <i class="fas ${weatherIcon}"></i>
                        <span class="temp">${temp}°C</span>
                        <span class="condition">${condition}</span>
                        <div class="temp-range">
                            <span class="max-temp">H: ${maxTemp}°</span>
                            <span class="min-temp">L: ${minTemp}°</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Update current weather
        const currentWeather = data.current;
        const currentCondition = currentWeather.condition.text;
        const currentIcon = getWeatherIcon(currentCondition);
        const currentTemp = Math.round(currentWeather.temp_c);
        const feelsLike = Math.round(currentWeather.feelslike_c);
        const humidity = currentWeather.humidity;
        const windSpeed = currentWeather.wind_kph;
        const aqi = data.current.air_quality['us-epa-index'];
            
        const currentWeatherHTML = `
            <div class="current-weather">
                <div class="current-temp">
                    <i class="fas ${currentIcon}"></i>
                    <span>${currentTemp}°C</span>
                    </div>
                <div class="current-details">
                    <p>Feels like: ${feelsLike}°C</p>
                    <p>Humidity: ${humidity}%</p>
                    <p>Wind: ${windSpeed} km/h</p>
                    <p>Air Quality: ${getAQILevel(aqi)}</p>
                </div>
                </div>
            `;

        const weatherData = document.getElementById('weather-data');
        weatherData.insertAdjacentHTML('afterbegin', currentWeatherHTML);

    } catch (error) {
        console.error('Error fetching weather data:', error);
        // Show error message in the weather card
        const weatherData = document.getElementById('weather-data');
        weatherData.innerHTML = `
            <div class="weather-error">
                <i class="fas fa-exclamation-circle"></i>
                <p>Unable to fetch weather data. Please try again later.</p>
            </div>
        `;
    }
}

// Function to get AQI level description
function getAQILevel(aqi) {
    const levels = {
        1: 'Good',
        2: 'Moderate',
        3: 'Unhealthy for Sensitive Groups',
        4: 'Unhealthy',
        5: 'Very Unhealthy',
        6: 'Hazardous'
    };
    return levels[aqi] || 'Unknown';
}

// Call the function when the page loads
document.addEventListener('DOMContentLoaded', fetchWeatherData);

// AI Bioengineering System
function initializeBioengineering() {
    const bioContainer = document.getElementById('bioengineering-section');
    if (!bioContainer) return;

    // Add bioengineering form
        bioContainer.innerHTML = `
        <div class="bioengineering-form">
            <h3>AI Microbial Mix Calculator</h3>
            <form id="bioengineering-form">
                        <div class="form-group">
                    <label for="crop-type">Crop Type</label>
                    <select id="crop-type" required>
                        <option value="">Select crop type</option>
                        <option value="wheat">Wheat</option>
                        <option value="rice">Rice</option>
                        <option value="corn">Corn</option>
                        <option value="soybean">Soybean</option>
                        <option value="cotton">Cotton</option>
                            </select>
                        </div>
                        <div class="form-group">
                    <label for="soil-type">Soil Type</label>
                    <select id="soil-type" required>
                        <option value="">Select soil type</option>
                        <option value="clay">Clay</option>
                        <option value="loam">Loam</option>
                        <option value="sandy">Sandy</option>
                        <option value="silt">Silt</option>
                            </select>
                        </div>
                        <div class="form-group">
                    <label for="ph-level">Soil pH Level</label>
                    <input type="range" id="ph-level" min="0" max="14" step="0.1" value="7" required>
                    <span class="ph-value">7.0</span>
                            </div>
                <button type="submit" class="calculate-btn">Calculate Optimal Mix</button>
                    </form>
                </div>
        <div class="bioengineering-results">
                    <div class="sustainability-score">
                        <h4>Sustainability Analysis</h4>
                        <div class="score-container">
                    <div class="score-circle">
                                <svg class="score-svg">
                                    <circle class="score-background" cx="60" cy="60" r="54"></circle>
                            <circle class="score-progress" cx="60" cy="60" r="54"></circle>
                                </svg>
                                <div class="score-content">
                            <span class="score-value">0</span>
                            <span class="score-label">Not Calculated</span>
                            </div>
                        </div>
                    </div>
                    <div class="metrics-breakdown">
                        <div class="metric">
                            <div class="metric-header">
                                <span class="metric-label"><i class="fas fa-heart"></i> Soil Health</span>
                            <span class="metric-value">0%</span>
                            </div>
                            <div class="metric-bar">
                            <div class="metric-fill" style="width: 0%"></div>
                            </div>
                        </div>
                        <div class="metric">
                            <div class="metric-header">
                                <span class="metric-label"><i class="fas fa-cloud"></i> Carbon Impact</span>
                            <span class="metric-value">0%</span>
                            </div>
                            <div class="metric-bar">
                            <div class="metric-fill" style="width: 0%"></div>
                            </div>
                        </div>
                        <div class="metric">
                            <div class="metric-header">
                                <span class="metric-label"><i class="fas fa-tint"></i> Water Efficiency</span>
                            <span class="metric-value">0%</span>
                            </div>
                            <div class="metric-bar">
                            <div class="metric-fill" style="width: 0%"></div>
                            </div>
                        </div>
                        <div class="metric">
                            <div class="metric-header">
                                <span class="metric-label"><i class="fas fa-leaf"></i> Biodiversity</span>
                            <span class="metric-value">0%</span>
                            </div>
                            <div class="metric-bar">
                            <div class="metric-fill" style="width: 0%"></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="aqi-impact">
                    <h4>Projected AQI Impact</h4>
                    <div class="impact-chart">
                        <canvas id="aqiImpactChart"></canvas>
                </div>
                    </div>
                </div>
            `;

    // Initialize pH slider
    const phSlider = document.getElementById('ph-level');
    const phValue = document.querySelector('.ph-value');
    phSlider.addEventListener('input', (e) => {
        phValue.textContent = e.target.value;
    });

            // Initialize AQI Impact Chart
            const ctx = document.getElementById('aqiImpactChart').getContext('2d');
            const aqiImpactChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['Current', '3 Months', '6 Months', '9 Months', '12 Months'],
                    datasets: [{
                        label: 'Projected AQI Reduction',
                        data: [280, 220, 160, 100, 45],
                        borderColor: '#2ecc71',
                        borderWidth: 3,
                        tension: 0.4,
                        fill: true,
                        backgroundColor: 'rgba(46, 204, 113, 0.2)'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 300,
                            grid: {
                                color: 'rgba(46, 204, 113, 0.1)'
                            }
                        },
                        x: {
                            grid: {
                                color: 'rgba(46, 204, 113, 0.1)'
                            }
                        }
                    }
                }
            });

    // Handle form submission
    document.getElementById('bioengineering-form').addEventListener('submit', (e) => {
            e.preventDefault();
        const cropType = document.getElementById('crop-type').value;
        const soilType = document.getElementById('soil-type').value;
        const phLevel = parseFloat(document.getElementById('ph-level').value);

        // Calculate metrics
            const metrics = calculateSustainabilityMetrics(cropType, soilType, phLevel);
            
        // Update display
            updateSustainabilityDisplay(metrics);
            
            // Update AQI projection
        updateAQIProjection(aqiImpactChart);
        });
}

// Initialize bioengineering system when the page loads
document.addEventListener('DOMContentLoaded', () => {
    initializeBioengineering();
});

// Real-time sensor data simulation
function updateSensorData() {
    const sensors = {
        temperature: {
            value: (25 + Math.random() * 5).toFixed(1),
            unit: '°C',
            icon: 'fa-temperature-high'
        },
        humidity: {
            value: (60 + Math.random() * 10).toFixed(1),
            unit: '%',
            icon: 'fa-tint'
        },
        soilMoisture: {
            value: (45 + Math.random() * 15).toFixed(1),
            unit: '%',
            icon: 'fa-seedling'
        },
        lightIntensity: {
            value: (800 + Math.random() * 200).toFixed(0),
            unit: 'lux',
            icon: 'fa-sun'
        },
        windSpeed: {
            value: (5 + Math.random() * 3).toFixed(1),
            unit: 'km/h',
            icon: 'fa-wind'
        },
        rainfall: {
            value: (0 + Math.random() * 2).toFixed(1),
            unit: 'mm',
            icon: 'fa-cloud-rain'
        }
    };

    // Update sensor values in the UI
    Object.entries(sensors).forEach(([sensor, data]) => {
        const element = document.querySelector(`[data-sensor="${sensor}"]`);
        if (element) {
            element.innerHTML = `
                <i class="fas ${data.icon}"></i>
                <span>${sensor.replace(/([A-Z])/g, ' $1').trim()}</span>
                <span class="sensor-value">${data.value}${data.unit}</span>
            `;
        }
    });
        }

// Update sensor data every 5 seconds
setInterval(updateSensorData, 5000);
updateSensorData(); // Initial update

// Real-time updates initialization
function initializeRealTimeUpdates() {
    let updateInterval;
    const UPDATE_INTERVAL = 10000; // 10 seconds

    function startUpdates() {
        // Initial update
        updateSensorData();
        
        // Set interval for subsequent updates
        updateInterval = setInterval(updateSensorData, UPDATE_INTERVAL);
    }

    function stopUpdates() {
        if (updateInterval) {
            clearInterval(updateInterval);
            updateInterval = null;
        }
    }

    // Start updates
    startUpdates();

    // Cleanup function
    return () => {
        stopUpdates();
    };
} 