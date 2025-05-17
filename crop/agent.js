// Dynamically populate the crop dropdown with unique crops and their region/climate
window.addEventListener('DOMContentLoaded', () => {
    const cropDropdown = document.getElementById('previous-crop');
    if (cropDropdown && typeof cropData === 'object') {
        const uniqueCrops = {};
        for (const [key, value] of Object.entries(cropData)) {
            if (!uniqueCrops[value.name]) {
                uniqueCrops[value.name] = { key, region: value.region };
            }
        }
        Object.entries(uniqueCrops).forEach(([name, { key, region }]) => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = `${name} (${region ? region : 'Region N/A'})`;
            cropDropdown.appendChild(option);
        });
    }
});

document.getElementById('previous-crop').addEventListener('change', function() {
    const selectedCrop = this.value;
    const cropInfo = cropData[selectedCrop];
    
    if (cropInfo) {
        document.getElementById('soil-type').value = cropInfo.soil;
        document.getElementById('region').value = cropInfo.region;
    }
});

document.getElementById('crop-form').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const previousCrop = document.getElementById('previous-crop').value;
    const soilType = document.getElementById('soil-type').value;
    const region = document.getElementById('region').value;
    const farmSize = document.getElementById('farm-size').value;
    
    if (!previousCrop || !soilType || !region || !farmSize) {
        alert('Please fill out all fields.');
        return;
    }
    
    const recommendations = generateRecommendations(previousCrop, soilType, region, farmSize);
    displayRecommendations(recommendations);
});

function generateRecommendations(previousCrop, soilType, region, farmSize) {
    const cropInfo = cropData[previousCrop];
    if (!cropInfo) {
        return { error: 'Crop not found in database.' };
    }
    
    return {
        nextCrops: cropInfo.nextCrops,
        benefits: cropInfo.benefits,
        organicFertilizers: cropInfo.organicFertilizers,
        soil: cropInfo.soil,
        region: cropInfo.region,
        name: cropInfo.name
    };
}

function displayRecommendations(recommendations) {
    const recommendationsDiv = document.getElementById('recommendations');
    if (recommendations.error) {
        recommendationsDiv.innerHTML = `<p class="error">${recommendations.error}</p>`;
        return;
    }
    
    let html = `
        <h3>Next Crops:</h3>
        <ul>
            ${recommendations.nextCrops.map(crop => `<li>${crop}</li>`).join('')}
        </ul>
        <h3>Benefits:</h3>
        <ul>
            ${Object.entries(recommendations.benefits).map(([crop, benefit]) => `<li><strong>${crop}:</strong> ${benefit}</li>`).join('')}
        </ul>
        <h3>Organic Fertilizers:</h3>
        <ul>
            ${recommendations.organicFertilizers.map(fertilizer => `<li><strong>${fertilizer.name}:</strong> ${fertilizer.description}</li>`).join('')}
        </ul>
    `;
    
    recommendationsDiv.innerHTML = html;
}

// Defensive check for Leaflet
if (typeof L !== 'undefined') {
    let map = L.map('map').setView([0, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    document.getElementById('get-current-location').addEventListener('click', () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                const { latitude, longitude } = position.coords;
                map.setView([latitude, longitude], 13);
                L.marker([latitude, longitude]).addTo(map).bindPopup('Your location').openPopup();
                fetchWeatherByCoords(latitude, longitude);
            }, error => {
                console.error('Error getting location:', error);
                alert('Failed to get your location. Please enter it manually.');
            });
        } else {
            alert('Geolocation is not supported by your browser.');
        }
    });

    async function fetchWeatherByCoords(lat, lon) {
        const apiKey = 'f25d3ac49c4968e364e44af7592b45c9';
        const url = `http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            const weatherInfo = document.getElementById('weather-info');
            weatherInfo.innerHTML = `
                <p>Temperature: ${data.main.temp}°C</p>
                <p>Weather: ${data.weather[0].description}</p>
                <p>Humidity: ${data.main.humidity}%</p>
            `;
        } catch (error) {
            console.error('Error fetching weather data:', error);
            alert('Failed to fetch weather data. Please try again.');
        }
    }
}

// Defensive check for AQI monitor event listeners
if (document.getElementById('aqi-value')) {
    // Place your AQI monitor event listeners here if needed
} 