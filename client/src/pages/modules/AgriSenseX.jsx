import React, { useState, useEffect, useRef } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { getAgriSenseXData } from '../../services/agriSenseXService';
import { useEnhancedTranslation } from '../../hooks/useTranslation';
import './Module.css';
import AQIWidget from '../../components/widgets/AQIWidget';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

function AgriSenseX() {
  // Use enhanced translation hook
  const { t, tNS, formatNumber } = useEnhancedTranslation('agri-sensex');
  
  const [sensorData, setSensorData] = useState({
    temperature: { value: 25.0, unit: '°C', icon: 'fa-temperature-high' },
    humidity: { value: 65.0, unit: '%', icon: 'fa-tint' },
    soilMoisture: { value: 55.0, unit: '%', icon: 'fa-seedling' },
    lightIntensity: { value: 850, unit: 'lux', icon: 'fa-sun' },
    windSpeed: { value: 6.5, unit: 'km/h', icon: 'fa-wind' },
    rainfall: { value: 0.5, unit: 'mm', icon: 'fa-cloud-rain' }
  });
  
  const [weatherData, setWeatherData] = useState([
    { date: 'Today', day: 'Monday', temp: '28°C', condition: 'Sunny', icon: 'fa-sun' },
    { date: 'Apr 4', day: 'Tuesday', temp: '26°C', condition: 'Partly Cloudy', icon: 'fa-cloud-sun' },
    { date: 'Apr 5', day: 'Wednesday', temp: '24°C', condition: 'Cloudy', icon: 'fa-cloud' },
    { date: 'Apr 6', day: 'Thursday', temp: '22°C', condition: 'Light Rain', icon: 'fa-cloud-rain' },
    { date: 'Apr 7', day: 'Friday', temp: '25°C', condition: 'Partly Cloudy', icon: 'fa-cloud-sun' }
  ]);

  const [bioengineeringForm, setBioengineeringForm] = useState({
    cropType: '',
    soilType: ''
  });

  const [bioengineeringResults, setBioengineeringResults] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [aqiData, setAqiData] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isOnline, setIsOnline] = useState(true);
  const mapRef = useRef(null);

  // Real-time sensor updates with smooth animations
  useEffect(() => {
    const updateSensors = () => {
      setSensorData(prev => ({
        temperature: { 
          ...prev.temperature, 
          value: (25 + Math.random() * 5).toFixed(1),
          trend: Math.random() > 0.5 ? 'up' : 'down'
        },
        humidity: { 
          ...prev.humidity, 
          value: (60 + Math.random() * 10).toFixed(1),
          trend: Math.random() > 0.5 ? 'up' : 'down'
        },
        soilMoisture: { 
          ...prev.soilMoisture, 
          value: (45 + Math.random() * 15).toFixed(1),
          trend: Math.random() > 0.5 ? 'up' : 'down'
        },
        lightIntensity: { 
          ...prev.lightIntensity, 
          value: (800 + Math.random() * 200).toFixed(0),
          trend: Math.random() > 0.5 ? 'up' : 'down'
        },
        windSpeed: { 
          ...prev.windSpeed, 
          value: (5 + Math.random() * 3).toFixed(1),
          trend: Math.random() > 0.5 ? 'up' : 'down'
        },
        rainfall: { 
          ...prev.rainfall, 
          value: (0 + Math.random() * 2).toFixed(1),
          trend: Math.random() > 0.5 ? 'up' : 'down'
        }
      }));
    };

    // Initial AQI data with dynamic updates
    const updateAQI = () => {
      const aqiValue = Math.floor(Math.random() * 100) + 50;
      let status, color;
      
      if (aqiValue <= 50) {
        status = 'Good';
        color = '#27ae60';
      } else if (aqiValue <= 100) {
        status = 'Moderate';
        color = '#f39c12';
      } else if (aqiValue <= 150) {
        status = 'Unhealthy';
        color = '#e74c3c';
      } else {
        status = 'Hazardous';
        color = '#8e44ad';
      }
      
      setAqiData({
        current: aqiValue,
        status,
        color
      });
    };

    // Initial calls
    updateAQI();
    
    // Update sensors every 5 seconds
    const sensorInterval = setInterval(() => {
      updateSensors();
      setLastUpdate(new Date());
    }, 5000);
    // Update AQI every 30 seconds
    const aqiInterval = setInterval(updateAQI, 30000);
    
    return () => {
      clearInterval(sensorInterval);
      clearInterval(aqiInterval);
    };
  }, []);

  const handleBioengineeringSubmit = async (e) => {
    e.preventDefault();
    if (!bioengineeringForm.cropType || !bioengineeringForm.soilType) {
      alert('Please fill in all required fields');
      return;
    }

    setIsCalculating(true);
    
    // Simulate calculation
    setTimeout(() => {
      const results = {
        carbonSequestration: (Math.random() * 5 + 2).toFixed(2),
        waterEfficiency: (Math.random() * 20 + 75).toFixed(1),
        biodiversityIndex: (Math.random() * 0.3 + 0.7).toFixed(2),
        soilHealth: (Math.random() * 15 + 80).toFixed(1),
        aqiImprovement: (Math.random() * 25 + 15).toFixed(1),
        recommendations: [
          'Implement precision irrigation scheduling',
          'Use organic cover crops during off-season',
          'Apply biochar for soil carbon enhancement',
          'Monitor soil pH levels regularly'
        ]
      };
      setBioengineeringResults(results);
      setIsCalculating(false);
    }, 2000);
  };

  // Enhanced AQI Chart data with dynamic updates
  const aqiChartData = {
    labels: ['Good (0-50)', 'Moderate (51-100)', 'Unhealthy (101-150)', 'Hazardous (151+)'],
    datasets: [{
      data: [25, 35, 25, 15],
      backgroundColor: [
        '#27ae60',
        '#f39c12', 
        '#e74c3c',
        '#8e44ad'
      ],
      borderWidth: 0,
      hoverOffset: 4,
      cutout: '60%'
    }]
  };

  const aqiChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 15,
          color: 'white',
          font: {
            size: 11
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return context.label + ': ' + context.parsed + '%';
          }
        }
      }
    },
    animation: {
      animateRotate: true,
      animateScale: true
    }
  };

  return (
    <div className="module-container">
      <div className="module-header">
        <h1><i className="fas fa-tachometer-alt"></i> {t('sections.farm_dashboard')}</h1>
        <p>{t('description')}</p>
      </div>
      
      <div className="module-content">
        {/* System Status Bar */}
        <div className="system-status-bar">
          <div className="status-indicator">
            <div className={`status-dot ${isOnline ? 'online' : 'offline'}`}></div>
            <span>System {isOnline ? 'Online' : 'Offline'}</span>
          </div>
          <div className="last-update">
            <i className="fas fa-clock"></i>
            <span>Last Update: {lastUpdate.toLocaleTimeString()}</span>
          </div>
          <div className="sensor-count">
            <i className="fas fa-microchip"></i>
            <span>6 Sensors Active</span>
          </div>
        </div>

        <div className="dashboard-grid">
          {/* Weather Forecast Card */}
          <div className="card weather-card">
            <h2><i className="fas fa-cloud-sun"></i> Weather Forecast</h2>
            <div className="weather-forecast">
              {weatherData.map((day, index) => (
                <div key={index} className="forecast-day">
                  <div className="day-info">
                    <span className="date">{day.date}</span>
                    <span className="day">{day.day}</span>
                  </div>
                  <div className="weather-info">
                    <i className={`fas ${day.icon}`}></i>
                    <span className="temp">{day.temp}</span>
                    <span className="condition">{day.condition}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Real-time Sensors Card */}
          <div className="card sensor-card">
            <h2><i className="fas fa-microchip"></i> Real-time Sensors</h2>
            <div className="sensor-grid">
              {Object.entries(sensorData).map(([key, sensor]) => (
                <div key={key} className="sensor-item" data-sensor={key}>
                  <i className={`fas ${sensor.icon}`}></i>
                  <span>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                  <span className="sensor-value">{sensor.value} {sensor.unit}</span>
                </div>
              ))}
            </div>
          </div>

            <AQIWidget data={aqiData} />

          {/* AI Bioengineering Calculator */}
          <div className="card recommendations-card">
            <h2><i className="fas fa-dna"></i> AI Bioengineering</h2>
            <div className="bioengineering-section">
              <form onSubmit={handleBioengineeringSubmit} className="bioengineering-form">
                <div className="form-group">
                  <label htmlFor="crop-type">Crop Type:</label>
                  <select 
                    id="crop-type"
                    value={bioengineeringForm.cropType}
                    onChange={(e) => setBioengineeringForm({...bioengineeringForm, cropType: e.target.value})}
                    required
                  >
                    <option value="">Select crop type</option>
                    <option value="corn">Corn</option>
                    <option value="soybean">Soybean</option>
                    <option value="wheat">Wheat</option>
                    <option value="rice">Rice</option>
                    <option value="cotton">Cotton</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="soil-type">Soil Type *</label>
                  <select 
                    id="soil-type"
                    value={bioengineeringForm.soilType}
                    onChange={(e) => setBioengineeringForm({...bioengineeringForm, soilType: e.target.value})}
                    required
                  >
                    <option value="">Select soil type</option>
                    <option value="clay">Clay</option>
                    <option value="sandy">Sandy</option>
                    <option value="loam">Loam</option>
                    <option value="silt">Silt</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="ph-level">pH Level:</label>
                  <input 
                    type="number" 
                    id="ph-level"
                    min="0" 
                    max="14" 
                    step="0.1"
                    value={bioengineeringForm.phLevel}
                    onChange={(e) => setBioengineeringForm({...bioengineeringForm, phLevel: parseFloat(e.target.value)})}
                  />
                </div>
                
                <button type="submit" className="calculate-btn" disabled={isCalculating}>
                  {isCalculating ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Calculating...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-calculator"></i>
                      Calculate Impact
                    </>
                  )}
                </button>
              </form>

              {bioengineeringResults && (
                <div className="sustainability-results">
                  <h3>Sustainability Metrics</h3>
                  <div className="metrics-grid">
                    <div className="metric-item">
                      <i className="fas fa-leaf"></i>
                      <span>Carbon Sequestration</span>
                      <span className="metric-value">{bioengineeringResults.carbonSequestration} tons/acre</span>
                    </div>
                    <div className="metric-item">
                      <i className="fas fa-tint"></i>
                      <span>Water Efficiency</span>
                      <span className="metric-value">{bioengineeringResults.waterEfficiency}%</span>
                    </div>
                    <div className="metric-item">
                      <i className="fas fa-seedling"></i>
                      <span>Biodiversity Index</span>
                      <span className="metric-value">{bioengineeringResults.biodiversityIndex}</span>
                    </div>
                    <div className="metric-item">
                      <i className="fas fa-heart"></i>
                      <span>Soil Health</span>
                      <span className="metric-value">{bioengineeringResults.soilHealth}%</span>
                    </div>
                    <div className="metric-item">
                      <i className="fas fa-wind"></i>
                      <span>AQI Improvement</span>
                      <span className="metric-value">{bioengineeringResults.aqiImprovement}%</span>
                    </div>
                  </div>
                  
                  <div className="recommendations">
                    <h4>AI Recommendations</h4>
                    <ul>
                      {bioengineeringResults.recommendations.map((rec, index) => (
                        <li key={index}>
                          <i className="fas fa-check-circle"></i>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Farm Map */}
        <div className="map-section">
          <div className="card map-card">
            <h2><i className="fas fa-map-marked-alt"></i> Farm Location Map</h2>
            <div className="map-container">
              <div className="farm-map-placeholder" ref={mapRef}>
                <div className="map-placeholder-content">
                  <i className="fas fa-map"></i>
                  <p>Interactive Farm Map</p>
                  <p className="small-text">Click to view field boundaries and sensor locations</p>
                </div>
              </div>
              <div className="map-legend">
                <div className="legend-item">
                  <div className="legend-color" style={{backgroundColor: '#2ecc71'}}></div>
                  <span>Active Fields</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color" style={{backgroundColor: '#3498db'}}></div>
                  <span>Sensor Locations</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color" style={{backgroundColor: '#f1c40f'}}></div>
                  <span>Weather Stations</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Benefits Section */}
        <div className="solution-benefits-section">
          <div className="card benefits-card">
            <h2><i className="fas fa-leaf"></i> Sustainability Benefits</h2>
            <div className="benefits-grid">
              <div className="benefit-item">
                <i className="fas fa-seedling"></i>
                <h3>Smart Agriculture</h3>
                <p>AI-powered crop recommendations that optimize yield while protecting the environment.</p>
              </div>
              <div className="benefit-item">
                <i className="fas fa-wind"></i>
                <h3>Air Quality Improvement</h3>
                <p>Reduce agricultural emissions and improve local AQI by up to 30%.</p>
              </div>
              <div className="benefit-item">
                <i className="fas fa-tint"></i>
                <h3>Water Conservation</h3>
                <p>Smart monitoring reduces water usage by 40% through precision agriculture.</p>
              </div>
              <div className="benefit-item">
                <i className="fas fa-chart-line"></i>
                <h3>Data-Driven Insights</h3>
                <p>Real-time analytics help make informed decisions for sustainable farming.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AgriSenseX;

