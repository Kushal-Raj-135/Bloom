// filepath: c:\Users\jai swrup\Desktop\code\Bloom\frontend\components\agrisensex\app.js
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
    showToast("Loading weather data...", "success");
    await fetchWeatherData();
    showToast("Weather data loaded successfully!", "success");
  } catch (error) {
    console.error("Error loading weather data:", error);
    showToast("Failed to load weather data", "error");
  }
}

// Load bioengineering - wrapper function
function loadBioengineering() {
  try {
    showToast("Initializing bioengineering system...", "success");
    initializeBioengineering();
    showToast("Bioengineering system ready!", "success");
  } catch (error) {
    console.error("Error loading bioengineering:", error);
    showToast("Failed to load bioengineering system", "error");
  }
}

// Edit field function
function editField(fieldName) {
  try {
    // Create a modal for editing field details
    const modalHTML = `
      <div class="field-edit-modal" id="fieldEditModal">
        <div class="modal-content">
          <div class="modal-header">
            <h3><i class="fas fa-edit"></i> Edit Field: ${fieldName}</h3>
            <button class="close-modal" onclick="closeFieldModal()">&times;</button>
          </div>
          <div class="modal-body">
            <form id="editFieldForm">
              <div class="form-group">
                <label for="fieldName">Field Name:</label>
                <input type="text" id="fieldName" value="${fieldName}" required>
              </div>
              <div class="form-group">
                <label for="cropType">Crop Type:</label>
                <select id="cropType" required>
                  <option value="">Select Crop</option>
                  <option value="Corn">Corn</option>
                  <option value="Soybeans">Soybeans</option>
                  <option value="Wheat">Wheat</option>
                  <option value="Rice">Rice</option>
                  <option value="Cotton">Cotton</option>
                  <option value="Sugarcane">Sugarcane</option>
                </select>
              </div>
              <div class="form-group">
                <label for="fieldArea">Area (acres):</label>
                <input type="number" id="fieldArea" min="0.1" step="0.1" required>
              </div>
              <div class="form-group">
                <label for="soilType">Soil Type:</label>
                <select id="soilType" required>
                  <option value="">Select Soil Type</option>
                  <option value="Clay">Clay</option>
                  <option value="Sandy">Sandy</option>
                  <option value="Loamy">Loamy</option>
                  <option value="Silty">Silty</option>
                </select>
              </div>
              <div class="form-actions">
                <button type="button" onclick="closeFieldModal()" class="btn-secondary">Cancel</button>
                <button type="submit" class="btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    // Add modal to page
    document.body.insertAdjacentHTML("beforeend", modalHTML);

    // Add modal styles
    if (!document.querySelector("#fieldModalStyles")) {
      const styles = document.createElement("style");
      styles.id = "fieldModalStyles";
      styles.textContent = `
        .field-edit-modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 10000;
        }
        .modal-content {
          background: var(--card-bg, #fff);
          border-radius: 12px;
          padding: 0;
          width: 90%;
          max-width: 500px;
          max-height: 90vh;
          overflow: auto;
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        .modal-header h3 {
          margin: 0;
          color: var(--text-color, #333);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .close-modal {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: var(--text-color, #333);
        }
        .modal-body {
          padding: 1.5rem;
        }
        .form-group {
          margin-bottom: 1rem;
        }
        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: bold;
          color: var(--text-color, #333);
        }
        .form-group input, .form-group select {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 6px;
          background: rgba(255, 255, 255, 0.1);
          color: var(--text-color, #333);
        }
        .form-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 1.5rem;
        }
        .btn-primary, .btn-secondary {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: bold;
        }
        .btn-primary {
          background: #2ecc71;
          color: white;
        }
        .btn-secondary {
          background: #6c757d;
          color: white;
        }
      `;
      document.head.appendChild(styles);
    }

    // Handle form submission
    document.getElementById("editFieldForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const updatedField = {
        name: document.getElementById("fieldName").value,
        cropType: document.getElementById("cropType").value,
        area: document.getElementById("fieldArea").value,
        soilType: document.getElementById("soilType").value,
      };

      showToast(
        `Field "${updatedField.name}" updated successfully!`,
        "success",
      );
      closeFieldModal();
    });
  } catch (error) {
    console.error("Error opening field editor:", error);
    showToast("Error opening field editor", "error");
  }
}

// View field details function
function viewFieldDetails(fieldName) {
  try {
    // Create a modal for viewing field details
    const modalHTML = `
      <div class="field-details-modal" id="fieldDetailsModal">
        <div class="modal-content">
          <div class="modal-header">
            <h3><i class="fas fa-info-circle"></i> Field Details: ${fieldName}</h3>
            <button class="close-modal" onclick="closeFieldDetailsModal()">&times;</button>
          </div>
          <div class="modal-body">
            <div class="field-info-grid">
              <div class="info-card">
                <i class="fas fa-seedling"></i>
                <h4>Crop Information</h4>
                <p><strong>Current Crop:</strong> ${
                  fieldName === "Field A" ? "Corn" : "Soybeans"
                }</p>
                <p><strong>Planting Date:</strong> ${new Date(
                  Date.now() - 30 * 24 * 60 * 60 * 1000,
                ).toDateString()}</p>
                <p><strong>Growth Stage:</strong> Vegetative</p>
              </div>
              <div class="info-card">
                <i class="fas fa-chart-line"></i>
                <h4>Performance Metrics</h4>
                <p><strong>Soil Health:</strong> <span class="metric-good">85%</span></p>
                <p><strong>Water Efficiency:</strong> <span class="metric-good">92%</span></p>
                <p><strong>Yield Prediction:</strong> <span class="metric-warning">78%</span></p>
              </div>
              <div class="info-card">
                <i class="fas fa-thermometer-half"></i>
                <h4>Environmental Data</h4>
                <p><strong>Soil Temperature:</strong> 22°C</p>
                <p><strong>Soil Moisture:</strong> 45%</p>
                <p><strong>pH Level:</strong> 6.8</p>
              </div>
              <div class="info-card">
                <i class="fas fa-calendar-alt"></i>
                <h4>Schedule</h4>
                <p><strong>Next Irrigation:</strong> In 2 days</p>
                <p><strong>Fertilizer Application:</strong> In 1 week</p>
                <p><strong>Expected Harvest:</strong> In 3 months</p>
              </div>
            </div>
            <div class="field-actions">
              <button onclick="editField('${fieldName}')" class="btn-primary">
                <i class="fas fa-edit"></i> Edit Field
              </button>
              <button onclick="generateFieldReport('${fieldName}')" class="btn-secondary">
                <i class="fas fa-file-alt"></i> Generate Report
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Add modal to page
    document.body.insertAdjacentHTML("beforeend", modalHTML);

    // Add modal styles if not already added
    if (!document.querySelector("#fieldDetailsStyles")) {
      const styles = document.createElement("style");
      styles.id = "fieldDetailsStyles";
      styles.textContent = `
        .field-details-modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 10000;
        }
        .field-details-modal .modal-content {
          background: var(--card-bg, #fff);
          border-radius: 12px;
          padding: 0;
          width: 90%;
          max-width: 800px;
          max-height: 90vh;
          overflow: auto;
        }
        .field-info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .info-card {
          background: rgba(255, 255, 255, 0.1);
          padding: 1.5rem;
          border-radius: 8px;
          text-align: center;
        }
        .info-card i {
          font-size: 2rem;
          color: #2ecc71;
          margin-bottom: 1rem;
        }
        .info-card h4 {
          margin-bottom: 1rem;
          color: var(--text-color, #333);
        }
        .info-card p {
          margin: 0.5rem 0;
          color: var(--text-color, #333);
        }
        .metric-good { color: #2ecc71; font-weight: bold; }
        .metric-warning { color: #f39c12; font-weight: bold; }
        .metric-danger { color: #e74c3c; font-weight: bold; }
        .field-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
        }
      `;
      document.head.appendChild(styles);
    }
  } catch (error) {
    console.error("Error viewing field details:", error);
    showToast("Error viewing field details", "error");
  }
}

// Close field edit modal
function closeFieldModal() {
  const modal = document.getElementById("fieldEditModal");
  if (modal) {
    modal.remove();
  }
}

// Close field details modal
function closeFieldDetailsModal() {
  const modal = document.getElementById("fieldDetailsModal");
  if (modal) {
    modal.remove();
  }
}

// Generate field report
function generateFieldReport(fieldName) {
  showToast(`Generating report for ${fieldName}...`, "success");
  setTimeout(() => {
    showToast(`Report for ${fieldName} generated successfully!`, "success");
    closeFieldDetailsModal();
  }, 2000);
}

// Map initialization with enhanced features
function initializeMap() {
  try {
    const mapElement = document.getElementById("farm-map");
    setLoading(mapElement, true);

    // Initialize map with Bangalore as default view
    const map = L.map("farm-map", {
      zoomControl: false,
    }).setView([12.9716, 77.5946], 13); // Bangalore coordinates

    // Add base layers
    const osmLayer = L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution: "© OpenStreetMap contributors",
      },
    );

    const satelliteLayer = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        attribution: "© Esri",
      },
    );

    // Set default layer
    osmLayer.addTo(map);

    // Initialize drawing controls
    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

    const drawControl = new L.Control.Draw({
      draw: {
        polygon: {
          allowIntersection: false,
          showArea: true,
        },
        circle: false,
        circlemarker: false,
        marker: false,
        polyline: false,
        rectangle: false,
      },
      edit: {
        featureGroup: drawnItems,
      },
    });

    // Add sample field boundaries with enhanced popups
    const field1 = L.polygon(
      [
        [51.509, -0.08],
        [51.503, -0.06],
        [51.51, -0.047],
      ],
      {
        color: "#2ecc71",
        fillOpacity: 0.5,
      },
    ).addTo(map);

    const field2 = L.polygon(
      [
        [51.503, -0.11],
        [51.499, -0.09],
        [51.497, -0.12],
      ],
      {
        color: "#3498db",
        fillOpacity: 0.5,
      },
    ).addTo(map);

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

    field1.bindPopup(createFieldPopup("Field A", "Corn", 25));
    field2.bindPopup(createFieldPopup("Field B", "Soybeans", 30));

    // Current location handling
    let currentLocationMarker = null;
    let currentLocationAccuracyCircle = null;

    document
      .getElementById("current-location")
      ?.addEventListener("click", () => {
        const button = document.getElementById("current-location");
        button.classList.add("active");

        if (!navigator.geolocation) {
          showToast("Geolocation is not supported by your browser.", "error");
          button.classList.remove("active");
          return;
        }

        showToast("Fetching your location...", "success");

        const options = {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
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
              className: "current-location-marker",
              html: '<i class="fas fa-crosshairs"></i>',
              iconSize: [20, 20],
            }),
          }).addTo(map);

          // Add accuracy circle
          currentLocationAccuracyCircle = L.circle([latitude, longitude], {
            radius: accuracy,
            color: "#2ecc71",
            fillColor: "rgba(46, 204, 113, 0.1)",
            fillOpacity: 0.3,
          }).addTo(map);

          // Pan to location with animation
          map.flyTo([latitude, longitude], 16, {
            duration: 1.5,
          });

          currentLocationMarker.bindPopup("Your current location").openPopup();
          showToast("Location found!", "success");
          button.classList.remove("active");
        };

        const onError = (error) => {
          let errorMessage = "Unable to get your location.";
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage =
                "Location access denied. Please enable location services.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information is unavailable.";
              break;
            case error.TIMEOUT:
              errorMessage = "Location request timed out.";
              break;
          }
          showToast(errorMessage, "error");
          button.classList.remove("active");
        };

        navigator.geolocation.getCurrentPosition(onSuccess, onError, options);
      });

    document
      .getElementById("toggle-satellite")
      ?.addEventListener("click", function () {
        if (map.hasLayer(osmLayer)) {
          map.removeLayer(osmLayer);
          map.addLayer(satelliteLayer);
          this.classList.add("active");
        } else {
          map.removeLayer(satelliteLayer);
          map.addLayer(osmLayer);
          this.classList.remove("active");
        }
      });

    // Location search functionality
    const searchInput = document.getElementById("location-search");
    const searchResults = document.querySelector(".search-results");

    let searchTimeout;
    searchInput?.addEventListener("input", (e) => {
      clearTimeout(searchTimeout);
      const query = e.target.value;

      if (query.length < 3) {
        searchResults.classList.remove("active");
        return;
      }

      searchTimeout = setTimeout(async () => {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
              query,
            )}`,
          );
          const data = await response.json();

          searchResults.innerHTML = data
            .map(
              (result) => `
                        <div class="search-result-item" data-lat="${result.lat}" data-lon="${result.lon}">
                            ${result.display_name}
                        </div>
                    `,
            )
            .join("");

          searchResults.classList.add("active");

          // Add click handlers to search results
          document.querySelectorAll(".search-result-item").forEach((item) => {
            item.addEventListener("click", () => {
              const lat = parseFloat(item.dataset.lat);
              const lon = parseFloat(item.dataset.lon);
              map.setView([lat, lon], 15);
              searchResults.classList.remove("active");
              searchInput.value = item.textContent.trim();
            });
          });
        } catch (error) {
          console.error("Error searching location:", error);
          showToast("Error searching location. Please try again.", "error");
        }
      }, 500);
    });

    // Area measurement tool
    let measureMode = false;
    let measurePolygon = null;
    let measurePoints = [];

    document.getElementById("measure-area")?.addEventListener("click", () => {
      if (!measureMode) {
        measureMode = true;
        measurePoints = [];
        showToast("Click on the map to start measuring area", "success");
        map.on("click", onMapClick);
      } else {
        measureMode = false;
        if (measurePolygon) {
          map.removeLayer(measurePolygon);
        }
        map.off("click", onMapClick);
        showToast("Area measurement cancelled", "success");
      }
    });

    function onMapClick(e) {
      measurePoints.push([e.latlng.lat, e.latlng.lng]);

      if (measurePolygon) {
        map.removeLayer(measurePolygon);
      }

      if (measurePoints.length > 2) {
        measurePolygon = L.polygon(measurePoints, {
          color: "#e74c3c",
          fillOpacity: 0.3,
        }).addTo(map);

        const area = L.GeometryUtil.geodesicArea(
          measurePolygon.getLatLngs()[0],
        );
        const areaAcres = (area / 4046.86).toFixed(2); // Convert square meters to acres

        measurePolygon.bindPopup(`Area: ${areaAcres} acres`).openPopup();
      }
    }

    // Add field functionality
    document.getElementById("add-field")?.addEventListener("click", () => {
      map.addControl(drawControl);
      showToast("Draw a polygon to add a new field", "success");
    });

    map.on("draw:created", function (e) {
      const layer = e.layer;
      drawnItems.addLayer(layer);

      // Calculate area
      const area = L.GeometryUtil.geodesicArea(layer.getLatLngs()[0]);
      const areaAcres = (area / 4046.86).toFixed(2);

      // Prompt for field details
      const fieldName = prompt("Enter field name:");
      const cropType = prompt("Enter crop type:");

      if (fieldName && cropType) {
        layer.bindPopup(createFieldPopup(fieldName, cropType, areaAcres));
      }

      map.removeControl(drawControl);
    });

    setLoading(mapElement, false);

    // Add fullscreen toggle functionality
    const toggleFullscreen = document.getElementById("toggle-fullscreen");
    const mapCard = document.querySelector(".map-card");

    toggleFullscreen.addEventListener("click", () => {
      mapCard.classList.toggle("fullscreen");
      map.invalidateSize(); // Ensure map renders correctly after resize

      // Update icon based on fullscreen state
      const icon = toggleFullscreen.querySelector("i");
      if (mapCard.classList.contains("fullscreen")) {
        icon.classList.remove("fa-expand");
        icon.classList.add("fa-compress");
      } else {
        icon.classList.remove("fa-compress");
        icon.classList.add("fa-expand");
      }
    });

    setLoading(mapElement, false);
  } catch (error) {
    console.error("Error initializing map:", error);
    showToast("Error loading map. Please refresh the page.", "error");
  }
}

// Weather API Configuration
const WEATHER_API_KEY = "731ee3473e67416aba412740250404";
const WEATHER_API_URL = "https://api.weatherapi.com/v1/forecast.json";

// Function to get weather icon based on weather code
function getWeatherIcon(condition) {
  const iconMap = {
    Sunny: "fa-sun",
    Clear: "fa-moon",
    "Partly cloudy": "fa-cloud-sun",
    Cloudy: "fa-cloud",
    Overcast: "fa-cloud",
    Mist: "fa-smog",
    "Patchy rain possible": "fa-cloud-rain",
    "Patchy snow possible": "fa-snowflake",
    "Patchy sleet possible": "fa-cloud-rain",
    "Patchy freezing drizzle possible": "fa-cloud-rain",
    "Thundery outbreaks possible": "fa-bolt",
    "Blowing snow": "fa-snowflake",
    Blizzard: "fa-snowflake",
    Fog: "fa-smog",
    "Freezing fog": "fa-smog",
    "Patchy light drizzle": "fa-cloud-rain",
    "Light drizzle": "fa-cloud-rain",
    "Freezing drizzle": "fa-cloud-rain",
    "Heavy freezing drizzle": "fa-cloud-rain",
    "Patchy light rain": "fa-cloud-rain",
    "Light rain": "fa-cloud-rain",
    "Moderate rain at times": "fa-cloud-rain",
    "Moderate rain": "fa-cloud-rain",
    "Heavy rain at times": "fa-cloud-showers-heavy",
    "Heavy rain": "fa-cloud-showers-heavy",
    "Light freezing rain": "fa-cloud-rain",
    "Moderate or heavy freezing rain": "fa-cloud-rain",
    "Light sleet": "fa-cloud-rain",
    "Moderate or heavy sleet": "fa-cloud-rain",
    "Patchy light snow": "fa-snowflake",
    "Light snow": "fa-snowflake",
    "Patchy moderate snow": "fa-snowflake",
    "Moderate snow": "fa-snowflake",
    "Patchy heavy snow": "fa-snowflake",
    "Heavy snow": "fa-snowflake",
    "Ice pellets": "fa-snowflake",
    "Light rain shower": "fa-cloud-rain",
    "Moderate or heavy rain shower": "fa-cloud-showers-heavy",
    "Torrential rain shower": "fa-cloud-showers-heavy",
    "Light sleet showers": "fa-cloud-rain",
    "Moderate or heavy sleet showers": "fa-cloud-rain",
    "Light snow showers": "fa-snowflake",
    "Moderate or heavy snow showers": "fa-snowflake",
    "Light showers of ice pellets": "fa-snowflake",
    "Moderate or heavy showers of ice pellets": "fa-snowflake",
    "Patchy light rain with thunder": "fa-bolt",
    "Moderate or heavy rain with thunder": "fa-bolt",
    "Patchy light snow with thunder": "fa-bolt",
    "Moderate or heavy snow with thunder": "fa-bolt",
  };
  return iconMap[condition] || "fa-cloud";
}

// Function to format date
function formatDate(dateString) {
  const date = new Date(dateString);
  return {
    date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    day: date.toLocaleDateString("en-US", { weekday: "long" }),
  };
}

// Function to fetch weather data
async function fetchWeatherData() {
  try {
    // For demo purposes, using Bangalore coordinates
    const q = "Bangalore";

    const response = await fetch(
      `${WEATHER_API_URL}?key=${WEATHER_API_KEY}&q=${q}&days=5&aqi=yes&alerts=yes`,
    );
    const data = await response.json();

    // Update the weather forecast display
    const forecastContainer = document.querySelector(".weather-forecast");
    if (forecastContainer) {
      forecastContainer.innerHTML = data.forecast.forecastday
        .map((day) => {
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
        })
        .join("");
    }

    // Update current weather
    const currentWeather = data.current;
    const currentCondition = currentWeather.condition.text;
    const currentIcon = getWeatherIcon(currentCondition);
    const currentTemp = Math.round(currentWeather.temp_c);
    const feelsLike = Math.round(currentWeather.feelslike_c);
    const humidity = currentWeather.humidity;
    const windSpeed = currentWeather.wind_kph;
    const aqi = data.current.air_quality["us-epa-index"];

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
              </div>
          `;
    }
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

// Charts initialization
async function initializeCharts() {
  // Initialize chart instances
  let aqiChart;
  let baseAQI = 50; // Starting with a moderate AQI value
  let aqiValues = []; // Array to store AQI values for average calculation

  try {
    // Create average AQI display element
    const aqiCard = document.querySelector(".aqi-card");
    if (aqiCard) {
      const averageDisplay = document.createElement("div");
      averageDisplay.className = "aqi-average";
      averageDisplay.innerHTML = `
              <div class="average-value">
                  <span>Average AQI: </span>
                  <span id="avgAQI">--</span>
              </div>
          `;
      aqiCard.insertBefore(averageDisplay, document.getElementById("aqiChart"));
    }

    // Add styles for average display
    const style = document.createElement("style");
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
    const aqiCtx = document.getElementById("aqiChart");
    if (aqiCtx) {
      aqiChart = new Chart(aqiCtx.getContext("2d"), {
        type: "line",
        data: {
          labels: [],
          datasets: [
            {
              label: "Air Quality Index",
              data: [],
              borderColor: "#2ecc71",
              tension: 0.4,
              fill: false,
            },
          ],
        },
        options: {
          responsive: true,
          animation: {
            duration: 0, // Disable animation for smoother updates
          },
          plugins: {
            legend: {
              position: "top",
            },
            tooltip: {
              mode: "index",
              intersect: false,
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              suggestedMax: 150,
              title: {
                display: true,
                text: "AQI Value",
              },
            },
            x: {
              title: {
                display: true,
                text: "Time",
              },
            },
          },
        },
      });
    }

    // Function to calculate average AQI
    function calculateAverageAQI() {
      if (aqiValues.length === 0) return "--";
      const sum = aqiValues.reduce((a, b) => a + b, 0);
      return (sum / aqiValues.length).toFixed(1);
    }

    // Function to simulate realistic AQI variations
    function simulateAQIValue() {
      // Add small random variations (-2 to +2)
      const variation = Math.random() * 4 - 2;

      // Gradually drift the base AQI
      baseAQI += Math.random() * 0.4 - 0.2;

      // Keep baseAQI within realistic bounds (0-300)
      baseAQI = Math.max(0, Math.min(300, baseAQI));

      // Return the current AQI with variation
      return Math.max(0, baseAQI + variation);
    }

    // Function to update AQI data every 10 seconds
    function updateAQIData() {
      const aqi = simulateAQIValue();
      const timestamp = new Date().toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
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
        const avgElement = document.getElementById("avgAQI");
        if (avgElement) {
          avgElement.textContent = calculateAverageAQI();
        }

        aqiChart.update("none"); // Update without animation
        checkAQILevel(aqi);
      }
    }

    // Start updating AQI data every 10 seconds
    const aqiUpdateInterval = setInterval(updateAQIData, 10000);

    // Cleanup interval when changing pages or components
    window.addEventListener("beforeunload", () => {
      clearInterval(aqiUpdateInterval);
    });
  } catch (error) {
    console.error("Error initializing charts:", error);
    showToast("Error initializing charts. Please refresh the page.", "error");
  }
}

function checkAQILevel(value) {
  const levels = [
    { max: 50, label: "Good", color: "#2ecc71" },
    { max: 100, label: "Moderate", color: "#f1c40f" },
    { max: 150, label: "Unhealthy for Sensitive Groups", color: "#e67e22" },
    { max: 200, label: "Unhealthy", color: "#e74c3c" },
    { max: 300, label: "Very Unhealthy", color: "#9b59b6" },
    { max: Infinity, label: "Hazardous", color: "#8e44ad" },
  ];

  for (const level of levels) {
    if (value <= level.max) {
      if (level.max < 100) {
        return; // Don't show toast for good levels
      }
      showToast(
        `Air Quality Alert: ${level.label} (AQI: ${value.toFixed(1)})`,
        "error",
      );
      break;
    }
  }
}

// AI Bioengineering System
function initializeBioengineering() {
  const bioContainer = document.getElementById("bioengineering-section");
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
  const phSlider = document.getElementById("ph-level");
  const phValue = document.querySelector(".ph-value");
  if (phSlider && phValue) {
    phSlider.addEventListener("input", (e) => {
      phValue.textContent = e.target.value;
    });
  }

  // Initialize AQI Impact Chart
  const ctx = document.getElementById("aqiImpactChart");
  if (ctx) {
    const aqiImpactChart = new Chart(ctx.getContext("2d"), {
      type: "line",
      data: {
        labels: ["Current", "3 Months", "6 Months", "9 Months", "12 Months"],
        datasets: [
          {
            label: "Projected AQI Reduction",
            data: [280, 220, 160, 100, 45],
            borderColor: "#2ecc71",
            borderWidth: 3,
            tension: 0.4,
            fill: true,
            backgroundColor: "rgba(46, 204, 113, 0.2)",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            max: 300,
            grid: {
              color: "rgba(46, 204, 113, 0.1)",
            },
          },
          x: {
            grid: {
              color: "rgba(46, 204, 113, 0.1)",
            },
          },
        },
      },
    });

    // Handle form submission
    const bioForm = document.getElementById("bioengineering-form");
    if (bioForm) {
      bioForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const cropType = document.getElementById("crop-type").value;
        const soilType = document.getElementById("soil-type").value;
        const phLevel = parseFloat(document.getElementById("ph-level").value);

        // Calculate metrics
        const metrics = calculateSustainabilityMetrics(
          cropType,
          soilType,
          phLevel,
        );

        // Update display
        updateSustainabilityDisplay(metrics);

        // Update AQI projection
        updateAQIProjection(aqiImpactChart);
      });
    }
  }
}

// Calculate sustainability metrics based on inputs
function calculateSustainabilityMetrics(cropType, soilType, phLevel) {
  // Base scores
  let soilHealth = 50;
  let carbonImpact = 50;
  let waterEfficiency = 50;
  let biodiversity = 50;

  // Crop type adjustments
  const cropAdjustments = {
    wheat: { soil: 10, carbon: 5, water: 5, bio: 5 },
    rice: { soil: 5, carbon: -5, water: -10, bio: 10 },
    corn: { soil: 15, carbon: 10, water: 0, bio: 0 },
    soybean: { soil: 20, carbon: 15, water: 10, bio: 15 },
    cotton: { soil: -5, carbon: -10, water: -15, bio: -5 },
  };

  // Soil type adjustments
  const soilAdjustments = {
    clay: { soil: 10, carbon: 5, water: -5, bio: 5 },
    loam: { soil: 20, carbon: 15, water: 15, bio: 15 },
    sandy: { soil: -5, carbon: -5, water: -10, bio: 0 },
    silt: { soil: 15, carbon: 10, water: 10, bio: 10 },
  };

  // pH level adjustments (optimal pH is around 6.5-7.0)
  const phOptimal = 6.75;
  const phDifference = Math.abs(phLevel - phOptimal);
  const phPenalty = phDifference * 10; // 10% penalty per pH unit away from optimal

  // Apply adjustments
  if (cropAdjustments[cropType]) {
    soilHealth += cropAdjustments[cropType].soil;
    carbonImpact += cropAdjustments[cropType].carbon;
    waterEfficiency += cropAdjustments[cropType].water;
    biodiversity += cropAdjustments[cropType].bio;
  }

  if (soilAdjustments[soilType]) {
    soilHealth += soilAdjustments[soilType].soil;
    carbonImpact += soilAdjustments[soilType].carbon;
    waterEfficiency += soilAdjustments[soilType].water;
    biodiversity += soilAdjustments[soilType].bio;
  }

  // Apply pH penalty
  soilHealth -= phPenalty;
  waterEfficiency -= phPenalty;

  // Ensure values are within 0-100 range
  soilHealth = Math.max(0, Math.min(100, soilHealth));
  carbonImpact = Math.max(0, Math.min(100, carbonImpact));
  waterEfficiency = Math.max(0, Math.min(100, waterEfficiency));
  biodiversity = Math.max(0, Math.min(100, biodiversity));

  // Calculate overall score
  const overallScore = Math.round(
    (soilHealth + carbonImpact + waterEfficiency + biodiversity) / 4,
  );

  return {
    soilHealth: Math.round(soilHealth),
    carbonImpact: Math.round(carbonImpact),
    waterEfficiency: Math.round(waterEfficiency),
    biodiversity: Math.round(biodiversity),
    overallScore: overallScore,
  };
}

// Update sustainability display with calculated metrics
function updateSustainabilityDisplay(metrics) {
  // Update score circle
  const scoreValue = document.querySelector(".score-value");
  const scoreLabel = document.querySelector(".score-label");
  const scoreProgress = document.querySelector(".score-progress");

  if (scoreValue && scoreLabel && scoreProgress) {
    scoreValue.textContent = metrics.overallScore;

    // Update label based on score
    let label = "Poor";
    let color = "#e74c3c";
    if (metrics.overallScore >= 80) {
      label = "Excellent";
      color = "#2ecc71";
    } else if (metrics.overallScore >= 60) {
      label = "Good";
      color = "#f1c40f";
    } else if (metrics.overallScore >= 40) {
      label = "Fair";
      color = "#e67e22";
    }

    scoreLabel.textContent = label;

    // Update progress circle
    const circumference = 2 * Math.PI * 54;
    const offset = circumference - (metrics.overallScore / 100) * circumference;
    scoreProgress.style.strokeDasharray = circumference;
    scoreProgress.style.strokeDashoffset = offset;
    scoreProgress.style.stroke = color;
  }

  // Update individual metrics
  const metricData = [
    {
      key: "soilHealth",
      value: metrics.soilHealth,
      icon: "fa-heart",
      label: "Soil Health",
    },
    {
      key: "carbonImpact",
      value: metrics.carbonImpact,
      icon: "fa-cloud",
      label: "Carbon Impact",
    },
    {
      key: "waterEfficiency",
      value: metrics.waterEfficiency,
      icon: "fa-tint",
      label: "Water Efficiency",
    },
    {
      key: "biodiversity",
      value: metrics.biodiversity,
      icon: "fa-leaf",
      label: "Biodiversity",
    },
  ];

  metricData.forEach((metric) => {
    // Try alternative selector approach
    const allMetrics = document.querySelectorAll(".metric");
    allMetrics.forEach((el) => {
      const label = el.querySelector(".metric-label");
      if (label && label.textContent.includes(metric.label)) {
        updateMetricElement(el, metric.value);
      }
    });
  });
}

// Helper function to update individual metric elements
function updateMetricElement(element, value) {
  const valueSpan = element.querySelector(".metric-value");
  const fillDiv = element.querySelector(".metric-fill");

  if (valueSpan) valueSpan.textContent = `${value}%`;
  if (fillDiv) {
    fillDiv.style.width = `${value}%`;

    // Color based on value
    let color = "#e74c3c";
    if (value >= 80) color = "#2ecc71";
    else if (value >= 60) color = "#f1c40f";
    else if (value >= 40) color = "#e67e22";

    fillDiv.style.backgroundColor = color;
  }
}

// Update AQI projection chart
function updateAQIProjection(chart) {
  if (!chart) return;

  // Generate realistic AQI projection data
  const currentAQI = 280;
  const projectionData = [currentAQI];

  // Simulate gradual improvement over 12 months
  for (let i = 1; i <= 4; i++) {
    const reduction = currentAQI * (0.15 + Math.random() * 0.1) * i;
    const projectedAQI = Math.max(30, currentAQI - reduction);
    projectionData.push(Math.round(projectedAQI));
  }

  chart.data.datasets[0].data = projectionData;
  chart.update();
}

// Real-time sensor data simulation
function updateSensorData() {
  const sensors = {
    temperature: {
      value: (25 + Math.random() * 5).toFixed(1),
      unit: "°C",
      icon: "fa-temperature-high",
    },
    humidity: {
      value: (60 + Math.random() * 10).toFixed(1),
      unit: "%",
      icon: "fa-tint",
    },
    soilMoisture: {
      value: (45 + Math.random() * 15).toFixed(1),
      unit: "%",
      icon: "fa-seedling",
    },
    lightIntensity: {
      value: (800 + Math.random() * 200).toFixed(0),
      unit: "lux",
      icon: "fa-sun",
    },
    windSpeed: {
      value: (5 + Math.random() * 3).toFixed(1),
      unit: "km/h",
      icon: "fa-wind",
    },
    rainfall: {
      value: (0 + Math.random() * 2).toFixed(1),
      unit: "mm",
      icon: "fa-cloud-rain",
    },
  };

  // Update sensor values in the UI
  Object.entries(sensors).forEach(([sensor, data]) => {
    const element = document.querySelector(`[data-sensor="${sensor}"]`);
    if (element) {
      element.innerHTML = `
                  <i class="fas ${data.icon}"></i>
                  <span>${sensor.replace(/([A-Z])/g, " $1").trim()}</span>
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
