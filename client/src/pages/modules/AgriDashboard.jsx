import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { getAgriSenseXDashboard, toggleIrrigation, downloadAgriSenseXReport } from '../../services/agriSenseXService';
import './Module.css';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

function AgriDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [irrigationZone, setIrrigationZone] = useState('');
  const [irrigationDuration, setIrrigationDuration] = useState(30);
  const [isIrrigating, setIsIrrigating] = useState(false);

  useEffect(() => {
    loadDashboard();
    
    // Set up real-time updates every 30 seconds
    const interval = setInterval(loadDashboard, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboard = async () => {
    try {
      const data = await getAgriSenseXDashboard();
      setDashboardData(data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleIrrigation = async () => {
    if (!irrigationZone) return;
    
    setIsIrrigating(true);
    try {
      const result = await toggleIrrigation(irrigationZone, irrigationDuration);
      alert(result.message);
      // Refresh dashboard to show updated status
      loadDashboard();
    } catch (error) {
      console.error('Error toggling irrigation:', error);
    } finally {
      setIsIrrigating(false);
    }
  };

  const handleDownloadReport = () => {
    downloadAgriSenseXReport(dashboardData);
  };

  const getStatusColor = (status) => {
    switch(status.toLowerCase()) {
      case 'low': return '#27ae60';
      case 'medium': return '#f39c12';
      case 'high': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  const getAlertIcon = (type) => {
    switch(type) {
      case 'warning': return 'fas fa-exclamation-triangle';
      case 'info': return 'fas fa-info-circle';
      case 'success': return 'fas fa-check-circle';
      case 'error': return 'fas fa-times-circle';
      default: return 'fas fa-bell';
    }
  };

  // Chart data for historical trends
  const chartData = dashboardData ? {
    labels: dashboardData.historicalData.map(d => new Date(d.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Temperature (°C)',
        data: dashboardData.historicalData.map(d => parseFloat(d.temperature)),
        borderColor: '#e74c3c',
        backgroundColor: 'rgba(231, 76, 60, 0.1)',
        yAxisID: 'y'
      },
      {
        label: 'Humidity (%)',
        data: dashboardData.historicalData.map(d => parseFloat(d.humidity)),
        borderColor: '#3498db',
        backgroundColor: 'rgba(52, 152, 219, 0.1)',
        yAxisID: 'y'
      },
      {
        label: 'Soil Moisture (%)',
        data: dashboardData.historicalData.map(d => parseFloat(d.soilMoisture)),
        borderColor: '#27ae60',
        backgroundColor: 'rgba(39, 174, 96, 0.1)',
        yAxisID: 'y'
      },
      {
        label: 'Yield Index',
        data: dashboardData.historicalData.map(d => parseFloat(d.yieldIndex)),
        borderColor: '#f39c12',
        backgroundColor: 'rgba(243, 156, 18, 0.1)',
        yAxisID: 'y1'
      }
    ]
  } : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      title: {
        display: true,
        text: 'Farm Monitoring Trends (Last 30 Days)',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      legend: {
        position: 'top',
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Date'
        }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Temperature (°C) / Humidity (%) / Soil Moisture (%)'
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Yield Index'
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  if (isLoading) {
    return (
      <div className="module-container">
        <div className="module-header">
          <h1><i className="fas fa-chart-line"></i> AgriDashboard - Precision Agriculture</h1>
          <p>Real-time monitoring and analytics for smart farming</p>
        </div>
        <div className="loading-state">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading farm monitoring dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="module-container">
      <div className="module-header">
        <h1><i className="fas fa-chart-line"></i> AgriDashboard - Precision Agriculture</h1>
        <p>Real-time monitoring and analytics for smart farming</p>
      </div>
      
      <div className="module-content">
        {/* Dashboard Tabs */}
        <div className="dashboard-tabs">
          <button 
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <i className="fas fa-tachometer-alt"></i> Overview
          </button>
          <button 
            className={`tab-btn ${activeTab === 'sensors' ? 'active' : ''}`}
            onClick={() => setActiveTab('sensors')}
          >
            <i className="fas fa-microchip"></i> Sensors
          </button>
          <button 
            className={`tab-btn ${activeTab === 'weather' ? 'active' : ''}`}
            onClick={() => setActiveTab('weather')}
          >
            <i className="fas fa-cloud-sun"></i> Weather
          </button>
          <button 
            className={`tab-btn ${activeTab === 'irrigation' ? 'active' : ''}`}
            onClick={() => setActiveTab('irrigation')}
          >
            <i className="fas fa-tint"></i> Irrigation
          </button>
          <button 
            className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <i className="fas fa-chart-area"></i> Analytics
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="tab-content">
            <div className="dashboard-grid">
              {/* System Status */}
              <div className="card system-status">
                <h3><i className="fas fa-server"></i> System Status</h3>
                <div className="status-items">
                  <div className="status-item">
                    <span className="label">Sensors Online:</span>
                    <span className="value">{dashboardData.systemStatus.sensorsOnline}/{dashboardData.systemStatus.totalSensors}</span>
                  </div>
                  <div className="status-item">
                    <span className="label">Last Update:</span>
                    <span className="value">{new Date(dashboardData.systemStatus.lastUpdate).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Field Health */}
              <div className="card field-health">
                <h3><i className="fas fa-leaf"></i> Field Health</h3>
                <div className="health-score">
                  <div className="score-circle">
                    <span className="score">{dashboardData.fieldAnalysis.fieldHealth}%</span>
                  </div>
                  <div className="health-details">
                    <div className="detail-item">
                      <span>Irrigation Needs:</span>
                      <span className="status" style={{color: getStatusColor(dashboardData.fieldAnalysis.irrigationNeeds)}}>
                        {dashboardData.fieldAnalysis.irrigationNeeds}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span>Pest Risk:</span>
                      <span className="status" style={{color: getStatusColor(dashboardData.fieldAnalysis.pestRisk)}}>
                        {dashboardData.fieldAnalysis.pestRisk}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span>Disease Risk:</span>
                      <span className="status" style={{color: getStatusColor(dashboardData.fieldAnalysis.diseaseRisk)}}>
                        {dashboardData.fieldAnalysis.diseaseRisk}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="card quick-actions">
                <h3><i className="fas fa-bolt"></i> Quick Actions</h3>
                <div className="action-buttons">
                  <button className="action-btn" onClick={handleDownloadReport}>
                    <i className="fas fa-download"></i>
                    Download Report
                  </button>
                  <button className="action-btn" onClick={loadDashboard}>
                    <i className="fas fa-sync"></i>
                    Refresh Data
                  </button>
                </div>
              </div>
            </div>

            {/* Field Zones */}
            <div className="field-zones">
              <h3><i className="fas fa-map"></i> Field Zones Status</h3>
              <div className="zones-grid">
                {dashboardData.fieldAnalysis.zones.map(zone => (
                  <div key={zone.id} className={`zone-card ${zone.needsAttention ? 'attention' : ''}`}>
                    <h4>{zone.name}</h4>
                    <div className="zone-stats">
                      <div className="stat">
                        <span className="label">Health:</span>
                        <span className="value">{zone.health}%</span>
                      </div>
                      <div className="stat">
                        <span className="label">Soil Moisture:</span>
                        <span className="value">{zone.soilMoisture}%</span>
                      </div>
                    </div>
                    {zone.needsAttention && (
                      <div className="attention-badge">
                        <i className="fas fa-exclamation-triangle"></i>
                        Needs Attention
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Alerts */}
            <div className="alerts-section">
              <h3><i className="fas fa-bell"></i> Recent Alerts</h3>
              <div className="alerts-list">
                {dashboardData.alerts.map(alert => (
                  <div key={alert.id} className={`alert-item ${alert.type}`}>
                    <i className={getAlertIcon(alert.type)}></i>
                    <div className="alert-content">
                      <h4>{alert.title}</h4>
                      <p>{alert.message}</p>
                      <span className="timestamp">{new Date(alert.timestamp).toLocaleString()}</span>
                    </div>
                    <span className={`priority ${alert.priority}`}>{alert.priority}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Sensors Tab */}
        {activeTab === 'sensors' && (
          <div className="tab-content">
            <div className="sensors-grid">
              <div className="sensor-card">
                <h4><i className="fas fa-thermometer-half"></i> Temperature</h4>
                <div className="sensor-value">{dashboardData.sensors.temperature}°C</div>
              </div>
              <div className="sensor-card">
                <h4><i className="fas fa-tint"></i> Humidity</h4>
                <div className="sensor-value">{dashboardData.sensors.humidity}%</div>
              </div>
              <div className="sensor-card">
                <h4><i className="fas fa-seedling"></i> Soil Moisture</h4>
                <div className="sensor-value">{dashboardData.sensors.soilMoisture}%</div>
              </div>
              <div className="sensor-card">
                <h4><i className="fas fa-flask"></i> Soil pH</h4>
                <div className="sensor-value">{dashboardData.sensors.soilPH}</div>
              </div>
              <div className="sensor-card">
                <h4><i className="fas fa-leaf"></i> Nitrogen</h4>
                <div className="sensor-value">{dashboardData.sensors.nitrogen} ppm</div>
              </div>
              <div className="sensor-card">
                <h4><i className="fas fa-atom"></i> Phosphorus</h4>
                <div className="sensor-value">{dashboardData.sensors.phosphorus} ppm</div>
              </div>
              <div className="sensor-card">
                <h4><i className="fas fa-fire"></i> Potassium</h4>
                <div className="sensor-value">{dashboardData.sensors.potassium} ppm</div>
              </div>
              <div className="sensor-card">
                <h4><i className="fas fa-sun"></i> Light Intensity</h4>
                <div className="sensor-value">{dashboardData.sensors.lightIntensity} lux</div>
              </div>
            </div>
          </div>
        )}

        {/* Weather Tab */}
        {activeTab === 'weather' && (
          <div className="tab-content">
            <div className="weather-section">
              <div className="current-weather">
                <h3>Current Weather</h3>
                <div className="weather-main">
                  <div className="weather-icon">
                    <i className="fas fa-sun"></i>
                  </div>
                  <div className="weather-info">
                    <div className="temperature">{dashboardData.weather.current.temperature}°C</div>
                    <div className="condition">{dashboardData.weather.current.condition}</div>
                  </div>
                </div>
                <div className="weather-details">
                  <div className="detail">
                    <span>Humidity:</span>
                    <span>{dashboardData.weather.current.humidity}%</span>
                  </div>
                  <div className="detail">
                    <span>Wind Speed:</span>
                    <span>{dashboardData.weather.current.windSpeed} km/h</span>
                  </div>
                  <div className="detail">
                    <span>Precipitation:</span>
                    <span>{dashboardData.weather.current.precipitation} mm</span>
                  </div>
                  <div className="detail">
                    <span>UV Index:</span>
                    <span>{dashboardData.weather.current.uvIndex}</span>
                  </div>
                </div>
              </div>

              <div className="weather-forecast">
                <h3>7-Day Forecast</h3>
                <div className="forecast-list">
                  {dashboardData.weather.forecast.map((day, index) => (
                    <div key={index} className="forecast-item">
                      <span className="day">{day.day}</span>
                      <span className="condition">{day.condition}</span>
                      <span className="temp">{day.high}°/{day.low}°</span>
                      <span className="rain">{day.precipitation}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Irrigation Tab */}
        {activeTab === 'irrigation' && (
          <div className="tab-content">
            <div className="irrigation-section">
              <div className="irrigation-control">
                <h3><i className="fas fa-tint"></i> Manual Irrigation Control</h3>
                <div className="control-form">
                  <div className="form-group">
                    <label>Zone:</label>
                    <select value={irrigationZone} onChange={(e) => setIrrigationZone(e.target.value)}>
                      <option value="">Select Zone</option>
                      {[1, 2, 3, 4].map(zone => (
                        <option key={zone} value={zone}>Zone {zone}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Duration (minutes):</label>
                    <input 
                      type="number" 
                      value={irrigationDuration}
                      onChange={(e) => setIrrigationDuration(e.target.value)}
                      min="5"
                      max="120"
                    />
                  </div>
                  <button 
                    className="custom-btn"
                    onClick={handleIrrigation}
                    disabled={!irrigationZone || isIrrigating}
                  >
                    {isIrrigating ? 'Starting...' : 'Start Irrigation'}
                  </button>
                </div>
              </div>

              <div className="irrigation-schedule">
                <h3><i className="fas fa-calendar"></i> Scheduled Irrigation</h3>
                <div className="schedule-list">
                  {dashboardData.irrigationSchedule.map((day, index) => (
                    <div key={index} className="schedule-day">
                      <h4>{day.day} - {day.date}</h4>
                      {day.zones.length > 0 ? (
                        <div className="scheduled-zones">
                          {day.zones.map((zone, zIndex) => (
                            <div key={zIndex} className="zone-schedule">
                              <span>Zone {zone.zone}:</span>
                              <span>{zone.duration} min at {zone.time}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="no-irrigation">No irrigation scheduled</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && chartData && (
          <div className="tab-content">
            <div className="analytics-section">
              <div className="chart-container" style={{ height: '400px' }}>
                <Line data={chartData} options={chartOptions} />
              </div>
              
              <div className="analytics-summary">
                <h3>Key Insights</h3>
                <div className="insights-grid">
                  <div className="insight-card">
                    <h4>Yield Prediction</h4>
                    <div className="insight-value">{dashboardData.fieldAnalysis.yieldPrediction}%</div>
                    <p>of expected yield based on current conditions</p>
                  </div>
                  <div className="insight-card">
                    <h4>Water Efficiency</h4>
                    <div className="insight-value">85%</div>
                    <p>irrigation efficiency this month</p>
                  </div>
                  <div className="insight-card">
                    <h4>Cost Savings</h4>
                    <div className="insight-value">₹15,000</div>
                    <p>saved through optimized resource usage</p>
                  </div>
                </div>
              </div>

              <div className="recommendations">
                <h3>AI Recommendations</h3>
                <div className="recommendations-list">
                  {dashboardData.fieldAnalysis.recommendations.map((rec, index) => (
                    <div key={index} className="recommendation-item">
                      <i className="fas fa-lightbulb"></i>
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AgriDashboard;
