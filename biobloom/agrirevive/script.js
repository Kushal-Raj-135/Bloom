// Initialize variables
let map = null;
let marker = null;
let selectedLocation = null;
let currentAQI = null;

// API Configuration
const GROQ_API_KEY = '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';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const AQI_API_KEY = 'YOUR_AQI_API_KEY';
const AQI_API_URL = 'https://api.waqi.info/feed';

// Theme switching functionality
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return; // Exit if theme toggle doesn't exist

    const themeIcon = themeToggle.querySelector('i');
    const themeText = themeToggle.querySelector('span');
    if (!themeIcon || !themeText) return; // Exit if elements don't exist

    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeButton(savedTheme);

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeButton(newTheme);
    });

    function updateThemeButton(theme) {
        if (theme === 'light') {
            themeIcon.className = 'fas fa-sun';
            themeText.textContent = 'Light Mode';
        } else {
            themeIcon.className = 'fas fa-moon';
            themeText.textContent = 'Dark Mode';
        }
    }
});

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const mapModal = document.getElementById('mapModal');
    const openMapBtn = document.getElementById('openMapBtn');
    const closeModalBtn = document.querySelector('.close-modal');
    const confirmLocationBtn = document.getElementById('confirmLocation');
    const locationInput = document.getElementById('location');
    const locationDetails = document.getElementById('locationDetails');
    const currentLocationBtn = document.getElementById('currentLocationBtn');
    const mapSearchInput = document.getElementById('mapSearchInput');
    const mapSearchSuggestions = document.createElement('div');
    mapSearchSuggestions.id = 'mapSearchSuggestions';
    mapSearchSuggestions.className = 'search-suggestions';
    document.querySelector('.map-search-container').appendChild(mapSearchSuggestions);
    const wasteForm = document.getElementById('wasteForm');

    // Function to open map modal
    function openMapModal() {
        mapModal.classList.add('active');
        if (!map) {
            initializeMap();
        }
    }

    // Function to close map modal
    function closeMapModal() {
        mapModal.classList.remove('active');
    }

    // Add click event listeners
    openMapBtn.addEventListener('click', openMapModal);
    locationInput.addEventListener('click', openMapModal);
    closeModalBtn.addEventListener('click', closeMapModal);

    // Close modal when clicking outside
    mapModal.addEventListener('click', function(e) {
        if (e.target === mapModal) {
            closeMapModal();
        }
    });

    // Initialize map
    function initializeMap() {
        try {
            if (map) {
                map.remove(); // Clean up existing map instance
            }

            map = L.map('locationMap', {
                center: [20.5937, 78.9629],
                zoom: 5,
                minZoom: 2,
                maxZoom: 18,
                zoomControl: false
            });

            // Use a more reliable tile provider
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 18
            }).addTo(map);

            // Add zoom control in a better position
            L.control.zoom({
                position: 'bottomright'
            }).addTo(map);

            // Create marker with custom icon
            marker = L.marker([20.5937, 78.9629], {
                draggable: true
            }).addTo(map);

            // Get user's location immediately
            getCurrentPositionPrecise()
                .then(position => {
                    const { latitude, longitude } = position.coords;
                    map.setView([latitude, longitude], 13);
                    marker.setLatLng([latitude, longitude]);
                    updateSelectedLocation(latitude, longitude);
                })
                .catch(error => {
                    console.warn('Error getting initial location:', error);
                    // Continue with default view if location fails
                });

            return true;
        } catch (error) {
            console.error('Error initializing map:', error);
            showNotification('Error loading map. Please refresh the page.', 'error');
            return false;
        }
    }

    // Enhanced getCurrentPosition function with better reliability
    function getCurrentPositionPrecise() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                showNotification('Geolocation is not supported by your browser', 'error');
                reject(new Error('Geolocation not supported'));
                return;
            }

            // Show loading state
            const currentLocationBtn = document.getElementById('currentLocationBtn');
            if (currentLocationBtn) {
                currentLocationBtn.classList.add('loading');
            }

            // Options for better accuracy
            const options = {
                enableHighAccuracy: true,
                timeout: 5000, // Reduced timeout to 5 seconds
                maximumAge: 0
            };

            const locationTimeout = setTimeout(() => {
                if (currentLocationBtn) {
                    currentLocationBtn.classList.remove('loading');
                }
                showNotification('Location request timed out. Please try again.', 'error');
                reject(new Error('Timeout'));
            }, 6000);

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    clearTimeout(locationTimeout);
                    if (currentLocationBtn) {
                        currentLocationBtn.classList.remove('loading');
                    }
                    resolve(position);
                },
                (error) => {
                    clearTimeout(locationTimeout);
                    if (currentLocationBtn) {
                        currentLocationBtn.classList.remove('loading');
                    }

                    let errorMessage = 'Unable to get your location';
                    switch(error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage = 'Please enable location access in your browser settings';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage = 'Location information is unavailable';
                            break;
                        case error.TIMEOUT:
                            errorMessage = 'Location request timed out';
                            break;
                    }
                    showNotification(errorMessage, 'error');
                    reject(error);
                },
                options
            );
        });
    }

    // Update current location button handler
    document.getElementById('currentLocationBtn')?.addEventListener('click', async function() {
        try {
            const position = await getCurrentPositionPrecise();
            const { latitude, longitude } = position.coords;
            
            if (map && marker) {
                map.setView([latitude, longitude], 13);
                marker.setLatLng([latitude, longitude]);
                await updateSelectedLocation(latitude, longitude);
                showNotification('Location updated successfully', 'success');
            }
        } catch (error) {
            console.error('Error getting current location:', error);
            // Error handling is done in getCurrentPositionPrecise
        }
    });

    // Handle location search
    mapSearchInput.addEventListener('input', function() {
        clearTimeout(window.searchDebounceTimer);
        const query = this.value.trim();
        
        if (!query) {
            mapSearchSuggestions.style.display = 'none';
            return;
        }
        
        window.searchDebounceTimer = setTimeout(async () => {
            try {
                mapSearchSuggestions.innerHTML = '<div class="loading">Searching...</div>';
                mapSearchSuggestions.style.display = 'block';
                
                const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`);
                const data = await response.json();
                
                if (data.length > 0) {
                    mapSearchSuggestions.innerHTML = data.map(place => `
                        <div class="location-suggestion" data-lat="${place.lat}" data-lon="${place.lon}">
                            <strong>${place.display_name.split(',')[0]}</strong>
                            <small>${place.display_name}</small>
                        </div>
                    `).join('');
                    
                    // Add click handlers to suggestions
                    document.querySelectorAll('.location-suggestion').forEach(suggestion => {
                        suggestion.addEventListener('click', function() {
                            const lat = parseFloat(this.dataset.lat);
                            const lon = parseFloat(this.dataset.lon);
                            
                            map.setView([lat, lon], 15);
                            marker.setLatLng([lat, lon]);
                            updateSelectedLocation(lat, lon);
                            
                            mapSearchSuggestions.style.display = 'none';
                            mapSearchInput.value = this.querySelector('strong').textContent;
                        });
                    });
                } else {
                    mapSearchSuggestions.innerHTML = '<div class="no-results">No locations found</div>';
                }
            } catch (error) {
                console.error('Error searching location:', error);
                mapSearchSuggestions.innerHTML = '<div class="error">Error searching location</div>';
            }
        }, 300);
    });

    // Handle location confirmation
    confirmLocationBtn.addEventListener('click', function() {
        if (selectedLocation) {
            locationInput.value = selectedLocation.address;
            
            // Format location details with accuracy if available
            const details = [
                `${selectedLocation.lat.toFixed(6)}, ${selectedLocation.lng.toFixed(6)}`
            ];
            
            if (selectedLocation.accuracy) {
                details.push(`Accuracy: ±${Math.round(selectedLocation.accuracy)}m`);
            }
            
            locationDetails.textContent = details.join(' | ');
            closeMapModal();
            
            showNotification('Location confirmed successfully', 'success');
        }
    });

    // Close search suggestions when clicking outside
    document.addEventListener('click', function(e) {
        if (!mapSearchInput?.contains(e.target) && !mapSearchSuggestions?.contains(e.target)) {
            mapSearchSuggestions.style.display = 'none';
        }
    });

    // Handle form submission
    wasteForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const cropType = document.getElementById('cropType').value;
        const quantity = document.getElementById('wasteQuantity').value;
        
        if (!selectedLocation) {
            showNotification('Please select a location first', 'error');
            return;
        }

        try {
            // Show loading state
            document.querySelector('.submit-btn').disabled = true;
            document.querySelector('.submit-btn').textContent = 'Getting Recommendations...';

            // Get recommendations
            const recommendations = await getRecommendations(cropType, quantity, selectedLocation);
            
            // Display recommendations
            displayRecommendations(recommendations, cropType, quantity);
            
            // Update metrics
            updateImpactMetrics(recommendations);
            
            // Scroll to recommendations
            document.getElementById('recommendations').scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            console.error('Error:', error);
            showNotification('Error getting recommendations. Please try again.', 'error');
        } finally {
            // Reset button state
            document.querySelector('.submit-btn').disabled = false;
            document.querySelector('.submit-btn').textContent = 'Get AI Recommendations';
        }
    });

    // Get current location
    function getCurrentLocation() {
        if (navigator.geolocation) {
            currentLocationBtn.disabled = true;
            currentLocationBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            
            navigator.geolocation.getCurrentPosition(
                async function(position) {
                    const { latitude, longitude } = position.coords;
                    
                    // Update map and marker
                    map.setView([latitude, longitude], 15);
                    marker.setLatLng([latitude, longitude]);
                    
                    // Update selected location
                    await updateSelectedLocation(latitude, longitude);
                    
                    currentLocationBtn.disabled = false;
                    currentLocationBtn.innerHTML = '<i class="fas fa-crosshairs"></i>';
                },
                function(error) {
                    console.error('Error getting location:', error);
                    showNotification('Error getting your location. Please try again.', 'error');
                    currentLocationBtn.disabled = false;
                    currentLocationBtn.innerHTML = '<i class="fas fa-crosshairs"></i>';
                }
            );
        } else {
            showNotification('Geolocation is not supported by your browser', 'error');
        }
    }

    // Update selected location
    async function updateSelectedLocation(lat, lng, accuracy = null) {
        try {
            // Try OpenStreetMap Nominatim first
            const nominatimResponse = await fetch(
                `https://nominatim.openstreetmap.org/reverse?` +
                `format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
                {
                    headers: {
                        'Accept-Language': 'en'
                    }
                }
            );
            
            if (!nominatimResponse.ok) {
                throw new Error('Nominatim API error');
            }
            
            const data = await nominatimResponse.json();
            
            // Format address components
            const address = formatAddress(data.address);
            
            selectedLocation = {
                lat: parseFloat(lat),
                lng: parseFloat(lng),
                accuracy: accuracy,
                address: address,
                rawData: data
            };
            
            document.getElementById('confirmLocation').disabled = false;
            
            // Update marker popup with detailed information
            const popupContent = `
                <div class="location-popup">
                    <b>${address}</b><br>
                    <small>Latitude: ${lat.toFixed(6)}</small><br>
                    <small>Longitude: ${lng.toFixed(6)}</small>
                    ${accuracy ? `<br><small>Accuracy: ±${Math.round(accuracy)}m</small>` : ''}
                </div>
            `;
            
            marker.bindPopup(popupContent).openPopup();
            
            // Get and update AQI
            const aqi = await fetchCurrentAQI(lat, lng);
            if (aqi) {
                updateAQIDisplay(aqi);
            }
            
            return selectedLocation;
        } catch (error) {
            console.error('Error in reverse geocoding:', error);
            
            // Fallback to coordinates if geocoding fails
            selectedLocation = {
                lat: parseFloat(lat),
                lng: parseFloat(lng),
                accuracy: accuracy,
                address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
                rawData: null
            };
            
            document.getElementById('confirmLocation').disabled = false;
            
            marker.bindPopup(`
                <div class="location-popup">
                    <b>Selected Location</b><br>
                    <small>Latitude: ${lat.toFixed(6)}</small><br>
                    <small>Longitude: ${lng.toFixed(6)}</small>
                    ${accuracy ? `<br><small>Accuracy: ±${Math.round(accuracy)}m</small>` : ''}
                </div>
            `).openPopup();
            
            return selectedLocation;
        }
    }

    // Helper function to format address
    function formatAddress(addressData) {
        if (!addressData) return '';
        
        const components = [];
        
        // Add building/house number if available
        if (addressData.house_number) {
            components.push(addressData.house_number);
        }
        
        // Add road/street
        if (addressData.road) {
            components.push(addressData.road);
        }
        
        // Add suburb/neighborhood
        if (addressData.suburb) {
            components.push(addressData.suburb);
        }
        
        // Add city/town
        if (addressData.city || addressData.town || addressData.village) {
            components.push(addressData.city || addressData.town || addressData.village);
        }
        
        // Add state
        if (addressData.state) {
            components.push(addressData.state);
        }
        
        // Add country
        if (addressData.country) {
            components.push(addressData.country);
        }
        
        return components.join(', ');
    }

    // Get recommendations
    async function getRecommendations(cropType, quantity, location) {
        try {
            // Try to get AI recommendations first
            const aiRecommendations = await getGroqRecommendations(cropType, quantity, location);
            if (aiRecommendations) {
                return aiRecommendations;
            }
            
            // Fallback to mock data if AI fails
            return getFallbackRecommendations(cropType);
        } catch (error) {
            console.error('Error getting recommendations:', error);
            return getFallbackRecommendations(cropType);
        }
    }

    // Get recommendations using Groq AI
    async function getGroqRecommendations(cropType, quantity, location) {
        try {
            const response = await fetch(GROQ_API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'mixtral-8x7b-32768',
                    messages: [
                        {
                            role: 'system',
                            content: `You are an expert agricultural waste management AI system specializing in sustainable alternatives to crop burning. 
Your goal is to provide detailed, crop-specific recommendations for agricultural waste management.

For each crop type, provide recommendations in the following structured format:
{
    "biofuel": {
        "title": "Specific title for biofuel method",
        "description": "Detailed description of the process",
        "processingSteps": [
            "Step 1",
            "Step 2",
            "Step 3",
            "Step 4",
            "Step 5"
        ],
        "equipment": [
            "Equipment 1",
            "Equipment 2",
            "Equipment 3",
            "Equipment 4"
        ],
        "impact": {
            "aqi": number (positive percentage between 0-100),
            "carbon": number (positive tons of CO2 reduction),
            "economic": number (positive USD value)
        }
    },
    "composting": {
        // Same structure as biofuel
    },
    "recycling": {
        // Same structure as biofuel
    }
}`
                        },
                        {
                            role: 'user',
                            content: `Please provide detailed recommendations for managing ${quantity}kg of ${cropType} waste at location ${location.address} (${location.lat}, ${location.lng}).`
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 2000
                })
            });

            if (!response.ok) {
                throw new Error(`Groq API error: ${response.status}`);
            }

            const data = await response.json();
            const content = data.choices[0].message.content;
            
            // Parse the JSON response
            try {
                const jsonMatch = content.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const recommendations = JSON.parse(jsonMatch[0]);
                    // Validate impact values
                    Object.values(recommendations).forEach(method => {
                        method.impact.aqi = Math.max(0, method.impact.aqi);
                        method.impact.carbon = Math.max(0, method.impact.carbon);
                        method.impact.economic = Math.max(0, method.impact.economic);
                    });
                    return recommendations;
                }
            } catch (error) {
                console.warn('Failed to parse JSON response:', error);
            }

            return parseAIRecommendations(content);
        } catch (error) {
            console.error('Error getting Groq recommendations:', error);
            return null;
        }
    }

    // Parse AI recommendations from text
    function parseAIRecommendations(content) {
        try {
            // Default structure for recommendations
            const recommendations = {
                biofuel: { 
                    title: '', 
                    description: '', 
                    processingSteps: [],
                    equipment: [],
                    impact: {
                        aqi: 0,
                        carbon: 0,
                        economic: 0
                    }
                },
                composting: { 
                    title: '', 
                    description: '', 
                    processingSteps: [],
                    equipment: [],
                    impact: {
                        aqi: 0,
                        carbon: 0,
                        economic: 0
                    }
                },
                recycling: { 
                    title: '', 
                    description: '', 
                    processingSteps: [],
                    equipment: [],
                    impact: {
                        aqi: 0,
                        carbon: 0,
                        economic: 0
                    }
                }
            };

            // Split content into sections and parse
            const sections = content.split('\n\n');
            let currentMethod = null;

            for (const section of sections) {
                if (section.toLowerCase().includes('biofuel')) {
                    currentMethod = 'biofuel';
                } else if (section.toLowerCase().includes('compost')) {
                    currentMethod = 'composting';
                } else if (section.toLowerCase().includes('recycl')) {
                    currentMethod = 'recycling';
                }

                if (currentMethod) {
                    const lines = section.split('\n');
                    recommendations[currentMethod].title = lines[0].replace(/^[#\-*]\s*/, '');
                    
                    // Extract description
                    const descIndex = lines.findIndex(line => line.toLowerCase().includes('description'));
                    if (descIndex !== -1) {
                        recommendations[currentMethod].description = lines[descIndex + 1].trim();
                    }

                    // Extract processing steps
                    const stepsIndex = lines.findIndex(line => line.toLowerCase().includes('processing steps'));
                    if (stepsIndex !== -1) {
                        recommendations[currentMethod].processingSteps = lines
                            .slice(stepsIndex + 1)
                            .filter(line => line.trim().match(/^[-*•]\s/))
                            .map(line => line.replace(/^[-*•]\s*/, '').trim());
                    }

                    // Extract equipment
                    const equipIndex = lines.findIndex(line => line.toLowerCase().includes('equipment'));
                    if (equipIndex !== -1) {
                        recommendations[currentMethod].equipment = lines
                            .slice(equipIndex + 1)
                            .filter(line => line.trim().match(/^[-*•]\s/))
                            .map(line => line.replace(/^[-*•]\s*/, '').trim());
                    }

                    // Extract impact metrics
                    const impactIndex = lines.findIndex(line => line.toLowerCase().includes('impact'));
                    if (impactIndex !== -1) {
                        const impactLines = lines.slice(impactIndex + 1);
                        
                        // Extract AQI improvement
                        const aqiMatch = impactLines.join(' ').match(/aqi[^\d]*(\d+(?:\.\d+)?)/i);
                        recommendations[currentMethod].impact.aqi = aqiMatch ? 
                            Math.max(0, parseFloat(aqiMatch[1])) : 
                            Math.max(0, 20 + Math.random() * 10);

                        // Extract carbon reduction
                        const carbonMatch = impactLines.join(' ').match(/carbon[^\d]*(\d+(?:\.\d+)?)/i);
                        recommendations[currentMethod].impact.carbon = carbonMatch ? 
                            Math.max(0, parseFloat(carbonMatch[1])) : 
                            Math.max(0, 1.5 + Math.random() * 1);

                        // Extract economic benefit
                        const economicMatch = impactLines.join(' ').match(/economic[^\d]*(\d+(?:\.\d+)?)/i);
                        recommendations[currentMethod].impact.economic = economicMatch ? 
                            Math.max(0, parseFloat(economicMatch[1])) : 
                            Math.max(0, 200 + Math.random() * 100);
                    }
                }
            }

            return recommendations;
        } catch (error) {
            console.error('Error parsing AI recommendations:', error);
            return null;
        }
    }

    // Get fallback recommendations
    function getFallbackRecommendations(cropType) {
        return {
            biofuel: {
                title: "Biofuel Production",
                description: `Convert ${cropType} waste into biofuel through anaerobic digestion.`,
                processingSteps: [
                    "Collect and sort agricultural waste",
                    "Shred material into smaller pieces",
                    "Process in anaerobic digester",
                    "Extract and refine biogas",
                    "Store and distribute biofuel"
                ],
                equipment: [
                    "Waste collection bins",
                    "Industrial shredder",
                    "Anaerobic digester",
                    "Biogas purification system",
                    "Storage tanks"
                ],
                impact: {
                    aqi: 15,
                    carbon: 2.5,
                    economic: 500
                }
            },
            composting: {
                title: "Composting",
                description: `Transform ${cropType} waste into nutrient-rich compost.`,
                processingSteps: [
                    "Gather organic waste materials",
                    "Create compost pile with proper layering",
                    "Maintain moisture and temperature",
                    "Turn compost regularly",
                    "Harvest finished compost"
                ],
                equipment: [
                    "Composting bins",
                    "Temperature probes",
                    "Moisture meters",
                    "Turning equipment",
                    "Screening tools"
                ],
                impact: {
                    aqi: 10,
                    carbon: 1.5,
                    economic: 300
                }
            },
            recycling: {
                title: "Material Recycling",
                description: `Recycle ${cropType} waste into useful products.`,
                processingSteps: [
                    "Sort and clean waste materials",
                    "Process into raw material form",
                    "Create recycled products",
                    "Package and distribute",
                    "Track environmental impact"
                ],
                equipment: [
                    "Sorting equipment",
                    "Processing machinery",
                    "Manufacturing tools",
                    "Packaging system",
                    "Tracking software"
                ],
                impact: {
                    aqi: 8,
                    carbon: 1.0,
                    economic: 200
                }
            }
        };
    }

    // Display recommendations
    function displayRecommendations(recommendations, cropType, quantity) {
        const container = document.querySelector('.recommendations-container');
        
        if (!container) {
            console.error('Recommendations container not found');
            return;
        }

        // Store recommendations data for PDF generation
        container.setAttribute('data-recommendations', JSON.stringify(recommendations));

        container.innerHTML = ''; // Clear previous content

        // Add header section
        const header = document.createElement('div');
        header.className = 'recommendations-header';
        header.innerHTML = `
            <div class="header-content">
                <h2>🌿 Sustainable Waste Management Solutions</h2>
                <div class="waste-summary">
                    <p>Analysis for: <strong>${quantity}kg of ${cropType}</strong></p>
                    <p class="subtitle">AI-powered recommendations for eco-friendly waste management</p>
                </div>
            </div>
        `;
        container.appendChild(header);

        // Sort recommendations by confidence
        const sortedMethods = Object.entries(recommendations)
            .sort(([, a], [, b]) => (b.impact.economic || 0) - (a.impact.economic || 0));

        // Create recommendations grid
        const recommendationsGrid = document.createElement('div');
        recommendationsGrid.className = 'recommendations-grid';

        // Display each recommendation
        sortedMethods.forEach(([method, data], index) => {
            const card = document.createElement('div');
            card.className = 'recommendation-card';
            
            // Get method-specific icon
            const methodIcon = method === 'biofuel' ? '⚡' : 
                              method === 'composting' ? '🌱' : '♻️';

            card.innerHTML = `
                <div class="recommendation-header">
                    <div class="method-icon">${methodIcon}</div>
                    <h3>${data.title || `${cropType.charAt(0).toUpperCase() + cropType.slice(1)} ${method.charAt(0).toUpperCase() + method.slice(1)}`}</h3>
                </div>
                
                <div class="recommendation-content">
                    <div class="description">
                        <p>${data.description || `Standard ${method} process for ${cropType} waste`}</p>
                    </div>

                    <div class="processing-section">
                        <h4>📋 Processing Steps</h4>
                        <ul class="steps-list">
                            ${(data.processingSteps || []).map(step => `<li>${step}</li>`).join('')}
                        </ul>
                    </div>

                    <div class="equipment-section">
                        <h4>🔧 Required Equipment</h4>
                        <ul class="equipment-list">
                            ${(data.equipment || []).map(item => `<li>${item}</li>`).join('')}
                        </ul>
                    </div>

                    <div class="impact-section">
                        <h4>💫 Environmental Impact</h4>
                        <div class="impact-metrics">
                            <div class="metric">
                                <span class="metric-label">AQI Improvement</span>
                                <span class="metric-value">${data.impact.aqi.toFixed(1)}%</span>
                            </div>
                            <div class="metric">
                                <span class="metric-label">Carbon Reduction</span>
                                <span class="metric-value">${data.impact.carbon.toFixed(1)} tons</span>
                            </div>
                            <div class="metric">
                                <span class="metric-label">Economic Benefit</span>
                                <span class="metric-value">₹${(data.impact.economic * 83).toLocaleString('en-IN')}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            recommendationsGrid.appendChild(card);
        });

        container.appendChild(recommendationsGrid);

        // Add summary section
        const summarySection = document.createElement('div');
        summarySection.className = 'recommendations-summary';
        const totalImpact = sortedMethods.reduce((sum, [, data]) => ({
            aqi: sum.aqi + (data.impact?.aqi || 0),
            carbon: sum.carbon + (data.impact?.carbon || 0),
            economic: sum.economic + (data.impact?.economic || 0)
        }), { aqi: 0, carbon: 0, economic: 0 });

        summarySection.innerHTML = `
            <h3>📊 Total Environmental Impact</h3>
            <div class="summary-metrics">
                <div class="summary-metric">
                    <span class="metric-icon">🌬️</span>
                    <span class="metric-label">AQI Improvement</span>
                    <span class="metric-value">${totalImpact.aqi.toFixed(1)}%</span>
                </div>
                <div class="summary-metric">
                    <span class="metric-icon">🌍</span>
                    <span class="metric-label">Carbon Reduction</span>
                    <span class="metric-value">${totalImpact.carbon.toFixed(1)} tons</span>
                </div>
                <div class="summary-metric">
                    <span class="metric-icon">💰</span>
                    <span class="metric-label">Economic Benefit</span>
                    <span class="metric-value">₹${(totalImpact.economic * 83).toLocaleString('en-IN')}</span>
                </div>
            </div>
            <div class="environmental-note">
                <p>✨ By implementing these recommendations, you're contributing to cleaner air and sustainable agriculture.</p>
            </div>
        `;
        container.appendChild(summarySection);
    }

    // Update impact metrics
    function updateImpactMetrics(recommendations) {
        const metrics = calculateImpactMetrics(recommendations);
        
        document.getElementById('aqiMetric').textContent = `${metrics.aqiImprovement}%`;
        document.getElementById('carbonMetric').textContent = `${metrics.carbonReduction} kg`;
        document.getElementById('economicMetric').textContent = `$${metrics.economicBenefit}`;
    }

    // Calculate impact metrics
    function calculateImpactMetrics(recommendations) {
        return {
            aqiImprovement: Math.round(Math.random() * 30 + 10),
            carbonReduction: Math.round(Math.random() * 500 + 100),
            economicBenefit: Math.round(Math.random() * 1000 + 200)
        };
    }

    // Show notification
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
});

// Function to fetch current AQI
async function fetchCurrentAQI(lat, lng) {
    try {
        // Mock AQI data
        const mockAQIData = {
            aqi: Math.floor(Math.random() * (200 - 50) + 50),
            time: new Date(),
            station: 'Local Station',
            isReal: false,
            pollutants: {
                pm25: Math.floor(Math.random() * 100),
                pm10: Math.floor(Math.random() * 150),
                o3: Math.floor(Math.random() * 50),
                no2: Math.floor(Math.random() * 40),
                so2: Math.floor(Math.random() * 30),
                co: Math.floor(Math.random() * 10)
            }
        };

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        currentAQI = mockAQIData;
        updateAQIDisplay(mockAQIData);
        return mockAQIData;
    } catch (error) {
        console.error('Error fetching AQI:', error);
        // Provide fallback data
        const fallbackData = {
            aqi: 100,
            time: new Date(),
            station: 'Estimated',
            isReal: false,
            pollutants: null
        };
        currentAQI = fallbackData;
        updateAQIDisplay(fallbackData);
        return fallbackData;
    }
}

// Function to update AQI display with enhanced information
function updateAQIDisplay(aqiData) {
    const aqiElement = document.getElementById('currentAqi');
    if (!aqiElement) return;

    const value = Math.round(aqiData.aqi);
    let description = '';
    let color = '';

    // Remove existing color classes
    aqiElement.classList.remove('aqi-good', 'aqi-moderate', 'aqi-unhealthy', 'aqi-very-unhealthy', 'aqi-hazardous');

    // Add appropriate color class and description based on AQI value
    if (value <= 50) {
        aqiElement.classList.add('aqi-good');
        description = 'Good';
        color = '#00e400';
    } else if (value <= 100) {
        aqiElement.classList.add('aqi-moderate');
        description = 'Moderate';
        color = '#ffff00';
    } else if (value <= 150) {
        aqiElement.classList.add('aqi-unhealthy');
        description = 'Unhealthy for Sensitive Groups';
        color = '#ff7e00';
    } else if (value <= 200) {
        aqiElement.classList.add('aqi-very-unhealthy');
        description = 'Unhealthy';
        color = '#ff0000';
    } else {
        aqiElement.classList.add('aqi-hazardous');
        description = 'Hazardous';
        color = '#7e0023';
    }

    const timeString = new Date(aqiData.time).toLocaleString();
    
    aqiElement.innerHTML = `
        <div class="aqi-value" style="color: ${color}">${value}</div>
        <div class="aqi-description">${description}</div>
        <div class="aqi-details">
            <div class="aqi-source">${aqiData.isReal ? 'Real-time data' : 'Estimated data'}</div>
            <div class="aqi-station">Source: ${aqiData.station}</div>
            <div class="aqi-time">Last updated: ${timeString}</div>
        </div>
        ${aqiData.isReal && aqiData.pollutants ? `
        <div class="pollutants-grid">
            ${Object.entries(aqiData.pollutants)
                .filter(([_, value]) => value !== null)
                .map(([key, value]) => `
                    <div class="pollutant-item">
                        <div class="pollutant-name">${key.toUpperCase()}</div>
                        <div class="pollutant-value">${value}</div>
                    </div>
                `).join('')}
        </div>
        ` : ''}
        <div class="aqi-health-tips">
            <h4>Health Recommendations:</h4>
            <ul>
                ${getHealthRecommendations(value).map(tip => `<li>${tip}</li>`).join('')}
            </ul>
        </div>
    `;
}

// Get health recommendations based on AQI value
function getHealthRecommendations(aqi) {
    if (aqi <= 50) {
        return [
            'Air quality is satisfactory',
            'Ideal for outdoor activities'
        ];
    } else if (aqi <= 100) {
        return [
            'Acceptable air quality',
            'Sensitive individuals should limit prolonged outdoor exposure'
        ];
    } else if (aqi <= 150) {
        return [
            'Members of sensitive groups may experience health effects',
            'General public is less likely to be affected',
            'Consider reducing outdoor activities'
        ];
    } else if (aqi <= 200) {
        return [
            'Everyone may begin to experience health effects',
            'Avoid prolonged outdoor exposure',
            'Wear mask when outdoors'
        ];
    } else {
        return [
            'Health alert: everyone may experience serious health effects',
            'Avoid all outdoor activities',
            'Wear N95 mask if outdoors is necessary',
            'Keep windows closed'
        ];
    }
}

// Add notification styles
const style = document.createElement('style');
style.textContent = `
    .notification {
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        padding: 1rem 2rem;
        border-radius: 8px;
        background: white;
        color: var(--text-color);
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        transform: translateY(100%);
        opacity: 0;
        transition: all 0.3s ease;
        z-index: 1000;
        font-weight: 500;
    }

    .notification.show {
        transform: translateY(0);
        opacity: 1;
    }

    .notification.success {
        background: #4ade80;
        color: white;
    }

    .notification.error {
        background: #ef4444;
        color: white;
    }

    .notification.info {
        background: #3b82f6;
        color: white;
    }

    .download-pdf-btn.loading {
        opacity: 0.7;
        cursor: not-allowed;
    }
`;
document.head.appendChild(style); 
