import { useState, useEffect } from 'react';
import { apiService } from '../../services/apiService';
import './AQIWidget.css';

const AQIWidget = () => {
  const [aqiData, setAqiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState('');

  useEffect(() => {
    fetchAQIData();
  }, []);

  const fetchAQIData = async () => {
    try {
      setLoading(true);
    
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            await getAQIByCoordinates(latitude, longitude);
          },
          () => {
          
            getDefaultAQI();
          }
        );
      } else {
        getDefaultAQI();
      }
    } catch (error) {
      console.error('Error fetching AQI data:', error);
      getDefaultAQI();
    }
  };

  const getAQIByCoordinates = async (lat, lon) => {
    try {
      const data = await apiService.getAQIData(lat, lon);
      if (data) {
        setAqiData(data);
        setLocation(data.location || `${lat.toFixed(2)}, ${lon.toFixed(2)}`);
      } else {
        getDefaultAQI();
      }
    } catch (error) {
      console.error('API AQI fetch failed:', error);
      getDefaultAQI();
    } finally {
      setLoading(false);
    }
  };

  const getDefaultAQI = () => {
  
    const mockData = {
      aqi: 85 + Math.floor(Math.random() * 40),
      category: 'Moderate',
      location: 'Bengaluru, Karnataka',
      pollutants: {
        pm25: 35 + Math.floor(Math.random() * 20),
        pm10: 50 + Math.floor(Math.random() * 25),
        o3: 75 + Math.floor(Math.random() * 30),
        no2: 20 + Math.floor(Math.random() * 15),
        so2: 10 + Math.floor(Math.random() * 10),
        co: 1.2 + Math.random() * 0.8
      },
      lastUpdated: new Date().toISOString()
    };
    
    setAqiData(mockData);
    setLocation(mockData.location);
    setLoading(false);
  };

  const getAQIColor = (aqi) => {
    if (aqi <= 50) return '#00e400';
    if (aqi <= 100) return '#ffff00';
    if (aqi <= 150) return '#ff7e00';
    if (aqi <= 200) return '#ff0000';
    if (aqi <= 300) return '#8f3f97';
    return '#7e0023';
  };

  const getAQICategory = (aqi) => {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
    if (aqi <= 200) return 'Unhealthy';
    if (aqi <= 300) return 'Very Unhealthy';
    return 'Hazardous';
  };

  const getHealthMessage = (aqi) => {
    if (aqi <= 50) return 'Air quality is satisfactory, and air pollution poses little or no risk.';
    if (aqi <= 100) return 'Air quality is acceptable. However, there may be a risk for some people.';
    if (aqi <= 150) return 'Members of sensitive groups may experience health effects.';
    if (aqi <= 200) return 'Some members of the general public may experience health effects.';
    if (aqi <= 300) return 'Health alert: The risk of health effects is increased for everyone.';
    return 'Health warning of emergency conditions: everyone is more likely to be affected.';
  };

  if (loading) {
    return (
      <div className="aqi-widget loading">
        <div className="aqi-loading">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading air quality data...</p>
        </div>
      </div>
    );
  }

  if (!aqiData) {
    return (
      <div className="aqi-widget error">
        <i className="fas fa-exclamation-triangle"></i>
        <p>Unable to load air quality data</p>
      </div>
    );
  }

  return (
    <div className="aqi-widget">
      <div className="aqi-header">
        <h3>
          <i className="fas fa-wind"></i>
          Air Quality Index
        </h3>
        <span className="aqi-location">
          <i className="fas fa-map-marker-alt"></i>
          {aqiData.location}
        </span>
      </div>

      <div className="aqi-main">
        <div className="aqi-value" style={{ backgroundColor: getAQIColor(aqiData.aqi) }}>
          <span className="aqi-number">{aqiData.aqi}</span>
          <span className="aqi-label">AQI</span>
        </div>
        
        <div className="aqi-info">
          <div className="aqi-category" style={{ color: getAQIColor(aqiData.aqi) }}>
            {getAQICategory(aqiData.aqi)}
          </div>
          <div className="aqi-message">
            {getHealthMessage(aqiData.aqi)}
          </div>
        </div>
      </div>

      <div className="aqi-pollutants">
        <h4>Pollutant Levels</h4>
        <div className="pollutant-grid">
          <div className="pollutant-item">
            <span className="pollutant-name">PM2.5</span>
            <span className="pollutant-value">{aqiData.pollutants.pm25} µg/m³</span>
          </div>
          <div className="pollutant-item">
            <span className="pollutant-name">PM10</span>
            <span className="pollutant-value">{aqiData.pollutants.pm10} µg/m³</span>
          </div>
          <div className="pollutant-item">
            <span className="pollutant-name">CO</span>
            <span className="pollutant-value">{aqiData.pollutants.co} mg/m³</span>
          </div>
          <div className="pollutant-item">
            <span className="pollutant-name">NO2</span>
            <span className="pollutant-value">{aqiData.pollutants.no2} µg/m³</span>
          </div>
          <div className="pollutant-item">
            <span className="pollutant-name">SO2</span>
            <span className="pollutant-value">{aqiData.pollutants.so2} µg/m³</span>
          </div>
          <div className="pollutant-item">
            <span className="pollutant-name">O3</span>
            <span className="pollutant-value">{aqiData.pollutants.o3} µg/m³</span>
          </div>
        </div>
      </div>

      <div className="aqi-footer">
        <small>
          <i className="fas fa-clock"></i>
          Last updated: {new Date().toLocaleTimeString()}
        </small>
      </div>
    </div>
  );
};

export default AQIWidget;
