document.addEventListener('DOMContentLoaded', function() {
    const aqiNumber = document.getElementById('aqi-number');
    const aqiStatus = document.getElementById('aqi-status');
    const recommendationsList = document.getElementById('aqi-recommendations');
    const gaugeRing = document.querySelector('.gauge-ring');

    // AQI categories and their colors
    const aqiCategories = {
        good: { min: 0, max: 50, color: '#00e400', label: 'Good' },
        moderate: { min: 51, max: 100, color: '#ffff00', label: 'Moderate' },
        unhealthySensitive: { min: 101, max: 150, color: '#ff7e00', label: 'Unhealthy for Sensitive Groups' },
        unhealthy: { min: 151, max: 200, color: '#ff0000', label: 'Unhealthy' },
        veryUnhealthy: { min: 201, max: 300, color: '#8f3f97', label: 'Very Unhealthy' },
        hazardous: { min: 301, max: 500, color: '#7e0023', label: 'Hazardous' }
    };

    // Updated recommendations based on AQI levels for daily life
    const recommendations = {
        good: [
            "Perfect air quality for outdoor activities and exercise",
            "Ideal conditions for walking, cycling, or jogging",
            "Great time for children to play outdoors",
            "Enjoy outdoor dining and recreational activities"
        ],
        moderate: [
            "Consider reducing prolonged outdoor activities if you're sensitive to air pollution",
            "Keep windows open for ventilation when indoors",
            "Good conditions for most outdoor activities, but take breaks if needed",
            "Monitor any unusual respiratory symptoms"
        ],
        unhealthySensitive: [
            "Sensitive groups (elderly, children, those with respiratory issues) should limit outdoor activities",
            "Consider wearing a mask when outdoors",
            "Keep indoor air clean using air purifiers",
            "Keep windows closed during peak pollution hours"
        ],
        unhealthy: [
            "Avoid prolonged outdoor activities",
            "Wear N95 masks when outdoors",
            "Keep all windows closed and use air purifiers",
            "Consider working/studying from home if possible"
        ],
        veryUnhealthy: [
            "Stay indoors as much as possible",
            "Avoid all outdoor physical activities",
            "Use air purifiers at maximum settings",
            "Seek medical attention if experiencing respiratory symptoms"
        ],
        hazardous: [
            "Remain indoors and keep all windows tightly closed",
            "Wear masks even indoors if air filtration is inadequate",
            "Avoid any outdoor activities",
            "Contact authorities or seek medical help if experiencing severe symptoms"
        ]
    };

    // Function to get AQI category
    function getAQICategory(aqi) {
        for (const [category, range] of Object.entries(aqiCategories)) {
            if (aqi >= range.min && aqi <= range.max) {
                return category;
            }
        }
        return 'hazardous';
    }

    // Function to update gauge color with animation
    function updateGaugeColor(aqi) {
        const category = getAQICategory(aqi);
        const color = aqiCategories[category].color;
        gaugeRing.style.transition = 'border-color 0.5s ease';
        gaugeRing.style.borderColor = color;
        return color;
    }

    // Function to update recommendations with animation
    function updateRecommendations(aqi) {
        const category = getAQICategory(aqi);
        const categoryRecommendations = recommendations[category];
        
        recommendationsList.style.opacity = '0';
        setTimeout(() => {
            recommendationsList.innerHTML = categoryRecommendations
                .map(rec => `<li class="recommendation-item">${rec}</li>`)
                .join('');
            recommendationsList.style.opacity = '1';
        }, 300);
    }

    // Function to update AQI display with animations
    function updateAQIDisplay(aqi) {
        // Animate number change
        const currentAQI = parseInt(aqiNumber.textContent) || 0;
        animateNumber(currentAQI, aqi, 1000);

        const category = getAQICategory(aqi);
        aqiStatus.textContent = aqiCategories[category].label;
        updateGaugeColor(aqi);
        updateRecommendations(aqi);
    }

    // Smooth number animation
    function animateNumber(start, end, duration) {
        const startTime = performance.now();
        const difference = end - start;

        function updateNumber(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            const value = Math.round(start + difference * progress);
            aqiNumber.textContent = value;

            if (progress < 1) {
                requestAnimationFrame(updateNumber);
            }
        }

        requestAnimationFrame(updateNumber);
    }

    // Function to simulate AQI data
    function simulateAQIData() {
        // Generate a random AQI value between 0 and 500
        // with a bias towards more realistic values
        const rand = Math.random();
        let aqi;
        
        if (rand < 0.4) { // 40% chance of good AQI
            aqi = Math.floor(Math.random() * 51); // 0-50
        } else if (rand < 0.7) { // 30% chance of moderate AQI
            aqi = Math.floor(Math.random() * 50) + 51; // 51-100
        } else if (rand < 0.85) { // 15% chance of unhealthy for sensitive groups
            aqi = Math.floor(Math.random() * 50) + 101; // 101-150
        } else if (rand < 0.95) { // 10% chance of unhealthy
            aqi = Math.floor(Math.random() * 50) + 151; // 151-200
        } else { // 5% chance of very unhealthy or hazardous
            aqi = Math.floor(Math.random() * 300) + 201; // 201-500
        }
        
        return aqi;
    }

    // Initialize AQI monitoring with simulated data
    async function initializeAQIMonitoring() {
        try {
            aqiStatus.textContent = 'Initializing...';
            
            // Get initial simulated AQI
            const aqi = simulateAQIData();
            updateAQIDisplay(aqi);
            
            // Update every 10 seconds with new simulated data
            setInterval(() => {
                const newAQI = simulateAQIData();
                updateAQIDisplay(newAQI);
            }, 10000);
            
        } catch (error) {
            console.error('Error initializing AQI monitoring:', error);
            aqiStatus.textContent = 'Unable to load AQI data';
            recommendationsList.innerHTML = `
                <li class="error-message">Unable to access AQI data.</li>
                <li class="error-message">Using simulated data for demonstration.</li>
                <li class="error-message">Check your internet connection.</li>
                <li class="error-message">Try refreshing the page.</li>
            `;
        }
    }

    // Start AQI monitoring
    initializeAQIMonitoring();
}); 