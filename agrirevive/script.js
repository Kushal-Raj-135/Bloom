// Initialize variables
let map = null;
let marker = null;
let selectedLocation = null;
let currentAQI = null;
let mapInitialized = false;  // Add flag to track map initialization

// API Configuration
const GROQ_API_KEY = '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';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Mock data for recommendations
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
                aqi: 18.0,
                carbon: 3.0,
                economic: 48000
            }
        },
        composting: {
            confidence: 0.80,
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
                aqi: 15.0,
                carbon: 2.2,
                economic: 35000
            }
        },
        recycling: {
            confidence: 0.70,
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
                aqi: 12.0,
                carbon: 1.5,
                economic: 28000
            }
        }
    }
};

// Mock AQI data
const mockAQIData = {
    aqi: 75,
    city: "Bangalore",
    time: new Date().toISOString(),
    health: "Moderate",
    recommendations: [
        "Limit outdoor activities",
        "Use air purifiers indoors",
        "Wear masks when outside"
    ]
};

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
        if (theme === 'dark') {
            themeIcon.className = 'fas fa-sun';
            themeText.textContent = 'Light Mode';
        } else {
            themeIcon.className = 'fas fa-moon';
            themeText.textContent = 'Dark Mode';
        }
    }
});

// Map Module
const MapModule = {
    map: null,
    marker: null,
    selectedLocation: null,
    isInitialized: false,
    modal: null,
    searchInput: null,
    confirmBtn: null,
    locationInput: null,
    locationDetails: null,

    // Initialize map module
    init() {
        this.modal = document.getElementById('mapModal');
        this.searchInput = document.getElementById('mapSearchInput');
        this.confirmBtn = document.getElementById('confirmLocation');
        this.locationInput = document.getElementById('location');
        this.locationDetails = document.getElementById('locationDetails');

        this.setupEventListeners();
    },

    // Setup all event listeners
    setupEventListeners() {
        // Open map modal
        document.getElementById('openMapBtn').addEventListener('click', () => this.openModal());
        this.locationInput.addEventListener('click', () => this.openModal());
        
        // Close map modal
        document.querySelector('.close-modal').addEventListener('click', () => this.closeModal());
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.closeModal();
        });

        // Current location button
        document.getElementById('currentLocationBtn').addEventListener('click', () => this.getCurrentLocation());

        // Location search
        this.searchInput.addEventListener('input', this.debounce((e) => this.handleSearch(e.target.value), 300));

        // Confirm location
        this.confirmBtn.addEventListener('click', () => this.confirmLocation());

        // Close search suggestions when clicking outside
        document.addEventListener('click', (e) => {
            const suggestions = document.getElementById('mapSearchSuggestions');
            if (suggestions && !this.searchInput.contains(e.target) && !suggestions.contains(e.target)) {
                suggestions.style.display = 'none';
            }
        });
    },

    // Open map modal
    openModal() {
        this.modal.classList.add('active');
        if (!this.isInitialized) {
            this.showLoadingState();
            // Initialize map after a small delay to allow modal animation
            requestAnimationFrame(() => this.initializeMap());
        }
    },

    // Close map modal
    closeModal() {
        this.modal.classList.remove('active');
    },

    // Show loading state
    showLoadingState() {
        const mapContainer = document.getElementById('locationMap');
        mapContainer.innerHTML = `
            <div class="map-loading">
                <div class="loading-spinner"></div>
                <p>Loading map...</p>
            </div>
        `;
    },

    // Initialize map
    initializeMap() {
        try {
            if (MapModule.map) {
                MapModule.map.remove();
                MapModule.map = null;
                document.getElementById('locationMap').innerHTML = '';
            }
            MapModule.map = L.map('locationMap', {
                center: [12.9716, 77.5946],
                zoom: 13,
                zoomControl: false,
                attributionControl: false,
                preferCanvas: true
            });
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                subdomains: 'abc',
                crossOrigin: true
            }).addTo(MapModule.map);
            MapModule.marker = L.marker([12.9716, 77.5946], {
                draggable: true
            }).addTo(MapModule.map);
            MapModule.marker.on('dragend', (e) => {
                const pos = e.target.getLatLng();
                MapModule.updateLocation(pos.lat, pos.lng);
            });
            MapModule.addMapControls();
            MapModule.isInitialized = true;
            return true;
        } catch (error) {
            console.error('Error initializing map:', error);
            this.showNotification('Error loading map. Please refresh the page.', 'error');
            return false;
        }
    },

    // Add map controls
    addMapControls() {
        // Add zoom control
        L.control.zoom({
            position: 'bottomright'
        }).addTo(MapModule.map);

        // Add attribution
        L.control.attribution({
            position: 'bottomleft'
        }).addTo(MapModule.map);

        // Add geocoder
        const geocoder = L.Control.geocoder({
            defaultMarkGeocode: false,
            placeholder: 'Search location...',
            errorMessage: 'Nothing found.',
            position: 'topleft'
        }).on('markgeocode', (e) => {
            const { center, bbox } = e.geocode;
            MapModule.map.fitBounds(bbox);
            MapModule.marker.setLatLng(center);
            MapModule.updateLocation(center.lat, center.lng);
        }).addTo(MapModule.map);
    },

    // Get current location
    getCurrentLocation() {
        const btn = document.getElementById('currentLocationBtn');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        if (!navigator.geolocation) {
            this.showNotification('Geolocation is not supported by your browser', 'error');
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-crosshairs"></i>';
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                if (MapModule.map && MapModule.marker) {
                    MapModule.map.setView([latitude, longitude], 15);
                    MapModule.marker.setLatLng([latitude, longitude]);
                    MapModule.updateLocation(latitude, longitude);
                }
                MapModule.showNotification('Current location set successfully', 'success');
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-crosshairs"></i>';
            },
            (error) => {
                MapModule.showNotification('Unable to retrieve your location', 'error');
                console.error('Geolocation error:', error);
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-crosshairs"></i>';
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    },

    // Handle location search
    async handleSearch(query) {
        if (!query.trim()) {
            this.hideSearchSuggestions();
            return;
        }

        try {
            const suggestions = document.getElementById('mapSearchSuggestions') || this.createSearchSuggestions();
            suggestions.innerHTML = '<div class="loading">Searching...</div>';
            suggestions.style.display = 'block';

            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
            );
            const data = await response.json();

            if (data.length > 0) {
                suggestions.innerHTML = data.map(place => `
                    <div class="location-suggestion" data-lat="${place.lat}" data-lon="${place.lon}">
                        <strong>${place.display_name.split(',')[0]}</strong>
                        <small>${place.display_name}</small>
                    </div>
                `).join('');

                this.addSuggestionClickHandlers(suggestions);
            } else {
                suggestions.innerHTML = '<div class="no-results">No locations found</div>';
            }
        } catch (error) {
            console.error('Search error:', error);
            this.hideSearchSuggestions();
            this.showNotification('Error searching location', 'error');
        }
    },

    // Create search suggestions container
    createSearchSuggestions() {
        const suggestions = document.createElement('div');
        suggestions.id = 'mapSearchSuggestions';
        suggestions.className = 'search-suggestions';
        document.querySelector('.map-search-container').appendChild(suggestions);
        return suggestions;
    },

    // Add click handlers to suggestions
    addSuggestionClickHandlers(suggestions) {
        suggestions.querySelectorAll('.location-suggestion').forEach(suggestion => {
            suggestion.addEventListener('click', () => {
                const lat = parseFloat(suggestion.dataset.lat);
                const lon = parseFloat(suggestion.dataset.lon);
                
                MapModule.map.setView([lat, lon], 15);
                MapModule.marker.setLatLng([lat, lon]);
                MapModule.updateLocation(lat, lon);
                
                this.hideSearchSuggestions();
                this.searchInput.value = suggestion.querySelector('strong').textContent;
            });
        });
    },

    // Hide search suggestions
    hideSearchSuggestions() {
        const suggestions = document.getElementById('mapSearchSuggestions');
        if (suggestions) {
            suggestions.style.display = 'none';
        }
    },

    // Update location
    async updateLocation(lat, lng) {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
            );
            const data = await response.json();
            
            MapModule.selectedLocation = {
                lat,
                lng,
                address: data.display_name
            };

            MapModule.locationInput.value = data.display_name;
            MapModule.locationDetails.textContent = `Latitude: ${lat.toFixed(4)}, Longitude: ${lng.toFixed(4)}`;
            MapModule.confirmBtn.disabled = false;
            
            // Update AQI display
            this.updateAQIDisplay(mockAQIData);
        } catch (error) {
            console.error('Location update error:', error);
            this.showNotification('Error getting location details', 'error');
        }
    },

    // Confirm location
    confirmLocation() {
        if (MapModule.selectedLocation) {
            MapModule.locationInput.value = MapModule.selectedLocation.address;
            MapModule.locationDetails.textContent = 
                `${MapModule.selectedLocation.lat.toFixed(6)}, ${MapModule.selectedLocation.lng.toFixed(6)}`;
            MapModule.closeModal();
            MapModule.showNotification('Location confirmed successfully', 'success');
        }
    },

    // Utility function for debouncing
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Show notification
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        requestAnimationFrame(() => notification.classList.add('show'));
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    },

    // Update AQI display
    updateAQIDisplay(aqiData) {
        const currentAqi = document.getElementById('currentAqi');
        if (currentAqi) {
            currentAqi.textContent = `${aqiData.aqi} (${aqiData.health})`;
        }
    }
};

// Initialize map module when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    MapModule.init();
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
        // Only initialize map when modal is opened
        if (!mapInitialized) {
            // Show loading state
            const mapContainer = document.getElementById('locationMap');
            mapContainer.innerHTML = `
                <div class="map-loading">
                    <div class="loading-spinner"></div>
                    <p>Loading map...</p>
                </div>
            `;
            
            // Initialize map with minimal features first
            setTimeout(() => {
                if (initializeMap()) {
                    mapInitialized = true;
                    // Add additional map features after initial load
                    addMapFeatures();
                }
            }, 100);
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

    // Add current location button logic
    currentLocationBtn.addEventListener('click', function() {
        if (!navigator.geolocation) {
            showNotification('Geolocation is not supported by your browser', 'error');
            return;
        }
        currentLocationBtn.disabled = true;
        currentLocationBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        navigator.geolocation.getCurrentPosition(
            async function(position) {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                map.setView([lat, lng], 15);
                marker.setLatLng([lat, lng]);
                await updateSelectedLocation(lat, lng);
                currentLocationBtn.disabled = false;
                currentLocationBtn.innerHTML = '<i class="fas fa-crosshairs"></i>';
                showNotification('Current location set successfully', 'success');
            },
            function(error) {
                showNotification('Unable to retrieve your location', 'error');
                currentLocationBtn.disabled = false;
                currentLocationBtn.innerHTML = '<i class="fas fa-crosshairs"></i>';
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    });

    // Close modal when clicking outside
    mapModal.addEventListener('click', function(e) {
        if (e.target === mapModal) {
            closeMapModal();
        }
    });

    // Function to initialize map with minimal features
    function initializeMap() {
        try {
            if (map) {
                map.remove();
            }

            // Initialize map with minimal options
            map = L.map('locationMap', {
                center: [12.9716, 77.5946],
                zoom: 13,
                zoomControl: false,  // Disable zoom control initially
                attributionControl: false  // Disable attribution initially
            });

            // Add base tile layer with minimal options
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                subdomains: 'abc'  // Use multiple subdomains for better performance
            }).addTo(map);

            // Add basic marker
            marker = L.marker([12.9716, 77.5946], {
                draggable: true
            }).addTo(map);

            marker.on('dragend', function(e) {
                const position = marker.getLatLng();
                updateSelectedLocation(position.lat, position.lng);
                });

            return true;
        } catch (error) {
            console.error('Error initializing map:', error);
            showNotification('Error loading map. Please refresh the page.', 'error');
            return false;
        }
    }

    // Function to add additional map features after initial load
    function addMapFeatures() {
        if (!map) return;

        // Add zoom control
        L.control.zoom({
            position: 'bottomright'
        }).addTo(map);

        // Add attribution
        L.control.attribution({
            position: 'bottomleft'
        }).addTo(map);

        // Add geocoder control
        const geocoder = L.Control.geocoder({
            defaultMarkGeocode: false,
            placeholder: 'Search location...',
            errorMessage: 'Nothing found.'
        }).on('markgeocode', function(e) {
            const bbox = e.geocode.bbox;
            const poly = L.polygon([
                bbox.getSouthEast(),
                bbox.getNorthEast(),
                bbox.getNorthWest(),
                bbox.getSouthWest()
            ]);
            map.fitBounds(poly.getBounds());
            marker.setLatLng(e.geocode.center);
            updateSelectedLocation(e.geocode.center.lat, e.geocode.center.lng);
        }).addTo(map);

        // Add minimap
        const osmUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
        const osm2 = new L.TileLayer(osmUrl, {maxZoom: 18});
        const miniMap = new L.Control.MiniMap(osm2, {
            toggleDisplay: true,
            minimized: true,
            position: 'bottomright'
        }).addTo(map);
    }

    // Update selected location
    async function updateSelectedLocation(lat, lng) {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await response.json();
            
            selectedLocation = {
                lat: lat,
                lng: lng,
                address: data.display_name
            };

            locationInput.value = data.display_name;
            locationDetails.textContent = `Latitude: ${lat.toFixed(4)}, Longitude: ${lng.toFixed(4)}`;
            confirmLocationBtn.disabled = false;
            
            // Update AQI display with mock data
            updateAQIDisplay(mockAQIData);
        } catch (error) {
            console.error('Error updating location:', error);
            showNotification('Error getting location details', 'error');
        }
    }

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

    // Function to get AI recommendations from Groq
    async function getGroqRecommendations(cropType, quantity, location) {
        try {
            const response = await fetch(GROQ_API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'llama3-70b-8192',
                    messages: [
                        {
                            role: 'system',
                            content: `You are an expert agricultural waste management AI system specializing in sustainable alternatives to crop burning. 
Your goal is to provide detailed, crop-specific recommendations for agricultural waste management.

For each crop type, provide recommendations in the following structured JSON format:
{
    "biofuel": {
        "confidence": number between 0.6 and 0.95,
        "description": "A detailed description of biofuel production for this specific crop",
        "steps": [
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
            "Equipment 4",
            "Equipment 5"
        ],
        "impact": {
            "aqi": number (positive percentage between 5-20),
            "carbon": number (positive tons between 1-5),
            "economic": number (positive INR value between 20000-50000)
        }
    },
    "composting": {
        // Same structure as biofuel with composting-specific details
    },
    "recycling": {
        // Same structure as biofuel with recycling-specific details
    }
}

Consider the following factors in your recommendations:
1. Crop type and its specific characteristics
2. Quantity of waste
3. Location and local environmental conditions
4. Available resources and infrastructure
5. Economic feasibility
6. Environmental impact

Ensure all numbers are realistic and within the specified ranges.`
                        },
                        {
                            role: 'user',
                            content: `Please provide detailed recommendations for managing ${quantity}kg of ${cropType} waste at location ${location.address} (${location.lat}, ${location.lng}). Consider local conditions and provide practical, implementable solutions.`
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 2000
                })
            });
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Groq API error details:', errorText);
                throw new Error(`Groq API error: ${response.status}`);
            }
            const data = await response.json();
            const content = data.choices[0].message.content;
            
            // Parse the JSON response
            try {
                const jsonMatch = content.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const recommendations = JSON.parse(jsonMatch[0]);
                    return validateAndNormalizeRecommendations(recommendations);
                }
            } catch (error) {
                console.warn('Failed to parse JSON response:', error);
                throw new Error('Invalid response format from AI');
            }

            throw new Error('No valid recommendations found in response');
        } catch (error) {
            console.error('Error getting Groq recommendations:', error);
            throw error;
        }
    }

    // Function to validate and normalize recommendations
    function validateAndNormalizeRecommendations(recommendations) {
        const methods = ['biofuel', 'composting', 'recycling'];
        const normalized = {};

        methods.forEach(method => {
            if (!recommendations[method]) {
                throw new Error(`Missing ${method} recommendations`);
            }

            const data = recommendations[method];

            // Validate and normalize confidence
            data.confidence = Math.max(0.6, Math.min(0.95, 
                typeof data.confidence === 'number' ? data.confidence : 0.7));

            // Validate and normalize description
            if (!data.description || typeof data.description !== 'string') {
                data.description = `Convert ${method} waste into valuable resources through advanced processing techniques.`;
            }

            // Validate and normalize steps
            if (!Array.isArray(data.steps) || data.steps.length < 3) {
                data.steps = [
                    "Waste collection and sorting",
                    "Initial processing setup",
                    "Main processing phase",
                    "Quality control",
                    "Final product distribution"
                ];
            }

            // Validate and normalize equipment
            if (!Array.isArray(data.equipment) || data.equipment.length < 3) {
                data.equipment = [
                    "Collection system",
                    "Processing equipment",
                    "Quality control tools",
                    "Storage facilities",
                    "Distribution system"
                ];
            }

            // Validate and normalize impact metrics
            data.impact = {
                aqi: Math.max(5, Math.min(20, 
                    typeof data.impact?.aqi === 'number' ? data.impact.aqi : 10)),
                carbon: Math.max(1, Math.min(5, 
                    typeof data.impact?.carbon === 'number' ? data.impact.carbon : 2)),
                economic: Math.max(20000, Math.min(50000, 
                    typeof data.impact?.economic === 'number' ? data.impact.economic : 30000))
            };

            normalized[method] = data;
        });

        return normalized;
    }

    // Modify the form submission handler
    wasteForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const cropType = document.getElementById('cropType').value.toLowerCase();
        const quantity = document.getElementById('wasteQuantity').value;
        
        // Use MapModule.selectedLocation instead of selectedLocation
        if (!MapModule.selectedLocation) {
            showNotification('Please select a location', 'error');
            return;
        }

        try {
            // Show loading state
            const submitBtn = document.querySelector('.submit-btn');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Getting AI Recommendations...';
            
            // Hide recommendations section while loading
            const recommendationsSection = document.getElementById('recommendations');
            recommendationsSection.style.display = 'none';
                        
            // Try to get AI recommendations
            const recommendations = await getGroqRecommendations(cropType, quantity, MapModule.selectedLocation);

            // Show recommendations section
            recommendationsSection.style.display = 'block';
            
            // Smooth scroll to recommendations
            recommendationsSection.scrollIntoView({ behavior: 'smooth' });

            // Display recommendations
            displayRecommendations(recommendations, cropType, quantity);
            updateImpactMetrics(recommendations);
            
            showNotification('AI recommendations generated successfully', 'success');
        } catch (error) {
            console.error('Error:', error);
            showNotification('Error getting AI recommendations. Using fallback data.', 'error');

            // Use mock data as fallback
            const fallbackRecommendations = getMockRecommendations(cropType, quantity);
            
            // Show recommendations section even for fallback data
            const recommendationsSection = document.getElementById('recommendations');
            recommendationsSection.style.display = 'block';
            recommendationsSection.scrollIntoView({ behavior: 'smooth' });
            
            displayRecommendations(fallbackRecommendations, cropType, quantity);
            updateImpactMetrics(fallbackRecommendations);
        } finally {
            // Reset button state
            const submitBtn = document.querySelector('.submit-btn');
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Get AI Recommendations';
        }
    });

    // Get mock recommendations
    function getMockRecommendations(cropType, quantity) {
        const cropData = mockRecommendations[cropType] || mockRecommendations.wheat;
        return {
            biofuel: cropData.biofuel,
            composting: cropData.composting,
            recycling: cropData.recycling
        };
    }

    // Function to display recommendations
    function displayRecommendations(recommendations, cropType, quantity) {
        const container = document.querySelector('.recommendations-container');
        const wasteSummary = document.getElementById('wasteSummary');
        
        wasteSummary.textContent = `${quantity}kg of ${cropType}`;

        // Update confidence meter
        const confidenceValue = document.getElementById('confidenceValue');
        const confidenceFill = document.getElementById('confidenceFill');
        const maxConfidence = Math.max(
            recommendations.biofuel.confidence,
            recommendations.composting.confidence,
            recommendations.recycling.confidence
        );

        confidenceValue.textContent = `${(maxConfidence * 100).toFixed(0)}%`;
        confidenceFill.style.width = `${maxConfidence * 100}%`;

        // Update recommendation cards
        updateRecommendationCard('biofuel', recommendations.biofuel);
        updateRecommendationCard('composting', recommendations.composting);
        updateRecommendationCard('recycling', recommendations.recycling);
    }

    // Function to update recommendation card
    function updateRecommendationCard(type, data) {
        const card = document.querySelector(`.recommendation-card:nth-child(${
            type === 'biofuel' ? 1 : type === 'composting' ? 2 : 3
        })`);

        if (!card) return;

        // Update description
        const description = card.querySelector('.description p');
        if (description) {
            description.textContent = data.description;
        }

        // Update steps
        const stepsList = card.querySelector('.steps-list');
        if (stepsList) {
            stepsList.innerHTML = data.steps.map(step => `<li>${step}</li>`).join('');
        }

        // Update equipment
        const equipmentList = card.querySelector('.equipment-list');
        if (equipmentList) {
            equipmentList.innerHTML = data.equipment.map(item => `<li>${item}</li>`).join('');
        }

        // Update impact metrics
        const impactMetrics = card.querySelector('.impact-metrics-grid');
        if (impactMetrics) {
            impactMetrics.innerHTML = `
                <div class="impact-metric">
                                <span class="metric-label">AQI Improvement</span>
                    <span class="metric-value">${data.impact.aqi}%</span>
                            </div>
                <div class="impact-metric">
                                <span class="metric-label">Carbon Reduction</span>
                    <span class="metric-value">${data.impact.carbon} tons</span>
                            </div>
                <div class="impact-metric">
                                <span class="metric-label">Economic Benefit</span>
                    <span class="metric-value">₹${data.impact.economic}</span>
                </div>
            `;
        }
    }

    // Update impact metrics
    function updateImpactMetrics(recommendations) {
        const maxImpact = {
            aqi: Math.max(
                recommendations.biofuel.impact.aqi,
                recommendations.composting.impact.aqi,
                recommendations.recycling.impact.aqi
            ),
            carbon: Math.max(
                recommendations.biofuel.impact.carbon,
                recommendations.composting.impact.carbon,
                recommendations.recycling.impact.carbon
            ),
            economic: Math.max(
                recommendations.biofuel.impact.economic,
                recommendations.composting.impact.economic,
                recommendations.recycling.impact.economic
            )
        };
        
        document.getElementById('aqiMetric').textContent = `${maxImpact.aqi}%`;
        document.getElementById('carbonMetric').textContent = `${maxImpact.carbon} tons`;
        document.getElementById('economicMetric').textContent = `₹${maxImpact.economic}`;
    }

    // Update AQI display
    function updateAQIDisplay(aqiData) {
        const currentAqi = document.getElementById('currentAqi');
        if (currentAqi) {
            currentAqi.textContent = `${aqiData.aqi} (${aqiData.health})`;
        }
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

    // Generate PDF Report for Recommendations
    function generatePDFReport() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Collect input details
        const cropType = document.getElementById('cropType').value;
        const quantity = document.getElementById('wasteQuantity').value;
        const location = document.getElementById('location').value;

        doc.setFontSize(18);
        doc.text('BioBloom - Sustainable Waste Management Report', 14, 16);
        doc.setFontSize(12);
        doc.text(`Crop Type: ${cropType}`, 14, 28);
        doc.text(`Waste Quantity: ${quantity} kg`, 14, 36);
        doc.text(`Location: ${location}`, 14, 44);

        // Recommendations
        const methods = [
            { key: 'biofuel', label: 'Biofuel Production', icon: '⚡' },
            { key: 'composting', label: 'Composting', icon: '🌱' },
            { key: 'recycling', label: 'Material Recycling', icon: '♻️' }
        ];

        let y = 54;
        methods.forEach((method, idx) => {
            const card = document.querySelector(`.recommendation-card:nth-child(${idx + 1})`);
            if (!card) return;
            const description = card.querySelector('.description p')?.textContent || '';
            const steps = Array.from(card.querySelectorAll('.steps-list li')).map(li => li.textContent);
            const equipment = Array.from(card.querySelectorAll('.equipment-list li')).map(li => li.textContent);
            const aqi = card.querySelector('.impact-metric .metric-value')?.textContent || '';
            const impactMetrics = card.querySelectorAll('.impact-metric .metric-value');
            const aqiVal = impactMetrics[0]?.textContent || '';
            const carbonVal = impactMetrics[1]?.textContent || '';
            const econVal = impactMetrics[2]?.textContent || '';

            doc.setFontSize(14);
            doc.text(`${method.icon} ${method.label}`, 14, y);
            y += 8;
            doc.setFontSize(11);
            doc.text(description, 16, y);
            y += 8;
            doc.text('Processing Steps:', 16, y);
            y += 6;
            steps.forEach(step => {
                doc.text(`- ${step}`, 18, y);
                y += 6;
            });
            doc.text('Required Equipment:', 16, y);
            y += 6;
            equipment.forEach(eq => {
                doc.text(`- ${eq}`, 18, y);
                y += 6;
            });
            doc.text('Environmental Impact:', 16, y);
            y += 6;
            doc.text(`AQI Improvement: ${aqiVal}`, 18, y);
            y += 6;
            doc.text(`Carbon Reduction: ${carbonVal}`, 18, y);
            y += 6;
            doc.text(`Economic Benefit: ${econVal}`, 18, y);
            y += 10;
            if (y > 260 && idx < methods.length - 1) {
                doc.addPage();
                y = 20;
            }
        });

        doc.save('BioBloom_Recommendations_Report.pdf');
    }

    // Expose generatePDFReport to the global window object
    window.generatePDFReport = generatePDFReport;
});

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