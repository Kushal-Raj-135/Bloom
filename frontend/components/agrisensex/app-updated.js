// Utility functions
function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  // Trigger reflow
  toast.offsetHeight;

  // Show toast
  toast.classList.add("show");

  // Remove toast after 3 seconds
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function setLoading(element, isLoading) {
  if (!element) return;
  element.classList.toggle("loading", isLoading);
}

// Initialize main functionality
document.addEventListener("DOMContentLoaded", () => {
  initializeMap();
  initializeCharts();
  loadWeatherData();
  loadBioengineering();
  initializeRealTimeUpdates();
});

// Load weather data - wrapper function
async function loadWeatherData() {
  try {
    // Check if API is available
    if (!window.api || !window.api.getWeatherForecast) {
      console.error("API not loaded or getWeatherForecast function not available");
      showToast("Weather service unavailable. Please try again later.", "error");
      return;
    }
    
    showToast("Loading weather data...", "success");
    await fetchWeatherData();
    showToast("Weather data loaded successfully!", "success");
  } catch (error) {
    console.error("Error loading weather data:", error);
    showToast("Failed to load weather data: " + (error.message || "Unknown error"), "error");
  }
}

// Function to fetch weather data
async function fetchWeatherData() {
  try {
    // For demo purposes, using Bangalore coordinates
    const location = "Bangalore";
    
    // Use the API function from frontend/js/api.js which calls our backend
    const response = await window.api.getWeatherForecast(location, 5);
    const data = response.data;

    // Update the weather forecast display
    const forecastContainer = document.querySelector(".weather-forecast");
    if (forecastContainer) {
      forecastContainer.innerHTML = data.forecast
        .map((day) => {
          const { date, day: dayName } = formatDate(day.date);
          const condition = day.condition;
          const weatherIcon = getWeatherIcon(condition);
          const temp = Math.round(day.avgTemp);
          const maxTemp = Math.round(day.maxTemp);
          const minTemp = Math.round(day.minTemp);

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
        })
        .join("");
    }    
    
    // Update current weather
    const currentWeather = data.current;
    const currentCondition = currentWeather.description;
    const currentIcon = getWeatherIcon(currentCondition);
    const currentTemp = Math.round(currentWeather.temperature);
    const feelsLike = Math.round(currentWeather.feelsLike);
    const humidity = currentWeather.humidity;
    const windSpeed = currentWeather.windSpeed;
    
    // Try to get AQI data from backend if available
    let aqi = 2; // Default to moderate
    try {
      if (window.api && window.api.getAQIByCoords && currentWeather.coordinates) {
        const { lat, lon } = currentWeather.coordinates;
        const aqiData = await window.api.getAQIByCoords(lat, lon);
        if (aqiData && aqiData.aqi) {
          // Convert AQI value to our 1-6 scale
          if (aqiData.aqi <= 50) aqi = 1;
          else if (aqiData.aqi <= 100) aqi = 2;
          else if (aqiData.aqi <= 150) aqi = 3;
          else if (aqiData.aqi <= 200) aqi = 4;
          else if (aqiData.aqi <= 300) aqi = 5;
          else aqi = 6;
        }
      }
    } catch (aqiError) {
      console.warn("Could not fetch AQI data:", aqiError);
      // Continue with default AQI
    }

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

    const weatherData = document.getElementById("weather-data");
    if (weatherData) {
      weatherData.insertAdjacentHTML("afterbegin", currentWeatherHTML);
    } 
  } catch (error) {
    console.error("Error fetching weather data:", error);
    // Show error message in the weather card
    const weatherData = document.getElementById("weather-data");
    if (weatherData) {
      weatherData.innerHTML = `
              <div class="weather-error">
                  <i class="fas fa-exclamation-circle"></i>
                  <p>Unable to fetch weather data. Please try again later.</p>
                  <p class="error-details">${error.message || 'Network error'}</p>
              </div>
          `;
    }
    
    // Also show a toast for better visibility
    showToast("Failed to load weather data: " + (error.message || "Network error"), "error");
  }
}

// Function to get AQI level description
function getAQILevel(aqi) {
  const levels = {
    1: "Good",
    2: "Moderate",
    3: "Unhealthy for Sensitive Groups",
    4: "Unhealthy",
    5: "Very Unhealthy",
    6: "Hazardous",
  };
  return levels[aqi] || "Unknown";
}
