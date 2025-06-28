import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getAgriReviveRecommendations, downloadAgriReviveReport } from '../../services/agriReviveService';
import './Module.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component for handling map clicks and location selection
function LocationMarker({ position, setPosition, setFormData }) {
  useMapEvents({
    click(e) {
      const newPosition = [e.latlng.lat, e.latlng.lng];
      setPosition(newPosition);
      
      // Reverse geocoding to get readable address
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${e.latlng.lat}&lon=${e.latlng.lng}`)
        .then(response => response.json())
        .then(data => {
          const address = data.display_name || `${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)}`;
          setFormData(prev => ({
            ...prev,
            location: address
          }));
        })
        .catch(error => {
          console.error('Error getting address:', error);
          setFormData(prev => ({
            ...prev,
            location: `${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)}`
          }));
        });
    }
  });

  return position === null ? null : (
    <Marker position={position}>
    </Marker>
  );
}

function AgriRevive() {
  const [formData, setFormData] = useState({
    cropType: '',
    wasteAmount: '',
    location: ''
  });
  const [recommendations, setRecommendations] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState(0);
  const [mapPosition, setMapPosition] = useState([20.5937, 78.9629]); // Default to center of India
  const [markerPosition, setMarkerPosition] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const results = await getAgriReviveRecommendations(
        formData.cropType, 
        parseInt(formData.wasteAmount),
        formData.location
      );
      
      if (results && results.recommendations && results.recommendations.length > 0) {
        setRecommendations(results);
        setShowResults(true);
        setSelectedMethod(0); // Reset to first method
      } else {
        console.error('Invalid response structure:', results);
        alert('Unable to generate recommendations. Please try again.');
      }
    } catch (error) {
      console.error('Error getting recommendations:', error);
      alert('Failed to get recommendations. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadReport = () => {
    downloadAgriReviveReport(recommendations);
  };

  const getMethodIcon = (method) => {
    switch(method) {
      case 'biofuel': return 'fas fa-gas-pump';
      case 'composting': return 'fas fa-leaf';
      case 'recycling': return 'fas fa-recycle';
      default: return 'fas fa-cog';
    }
  };

  const getMethodColor = (method) => {
    switch(method) {
      case 'biofuel': return '#e74c3c';
      case 'composting': return '#27ae60';
      case 'recycling': return '#3498db';
      default: return '#95a5a6';
    }
  };

  return (
    <div className="module-container">
      <div className="module-header">
        <h1><i className="fas fa-recycle"></i> AgriReVive - Waste Management Solutions</h1>
        <p>Transform agricultural waste into valuable resources with AI-powered recommendations</p>
      </div>
      
      <div className="module-content">
        <div className="tool-container">
          <div className="input-section card">
            <h2><i className="fas fa-clipboard-list"></i> Waste Analysis Input</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="cropType">Crop Type:</label>
                <select 
                  id="cropType" 
                  name="cropType" 
                  value={formData.cropType}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select crop type</option>
                  <option value="wheat">Wheat</option>
                  <option value="rice">Rice</option>
                  <option value="cotton">Cotton</option>
                  <option value="sugarcane">Sugarcane</option>
                  <option value="maize">Maize</option>
                  <option value="barley">Barley</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="wasteAmount">Waste Amount (tons):</label>
                <input 
                  type="number" 
                  id="wasteAmount" 
                  name="wasteAmount"
                  value={formData.wasteAmount}
                  onChange={handleInputChange}
                  min="1" 
                  max="10000"
                  placeholder="Enter waste amount in tons"
                  required 
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="location">Location:</label>
                <input 
                  type="text" 
                  id="location" 
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Click on map to select location or enter manually"
                />
                <small className="helper-text">Select a location on the map below or enter manually</small>
              </div>

              {/* Interactive Map for Location Selection */}
              <div className="form-group">
                <label>Select Location on Map:</label>
                <div className="location-hint">
                  <i className="fas fa-info-circle"></i>
                  Click anywhere on the map to select your location. The address will be automatically filled.
                </div>
                <div className="map-wrapper" style={{ height: '300px', marginBottom: '1rem', border: '2px solid #ddd', borderRadius: '8px' }}>
                  <MapContainer
                    center={mapPosition}
                    zoom={5}
                    style={{ height: '100%', width: '100%' }}
                    scrollWheelZoom={true}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <LocationMarker 
                      position={markerPosition} 
                      setPosition={setMarkerPosition}
                      setFormData={setFormData}
                    />
                  </MapContainer>
                </div>
              </div>
              
              <button type="submit" className="custom-btn" disabled={isLoading}>
                <i className="fas fa-search"></i> 
                {isLoading ? 'Analyzing Waste...' : 'Analyze Waste'}
              </button>
            </form>
          </div>

          <div className="results-section">
            <div className="card recommendation-card">
              <h2><i className="fas fa-lightbulb"></i> Processing Recommendations</h2>
              
              {!showResults && (
                <div className="results-placeholder">
                  <i className="fas fa-recycle placeholder-icon"></i>
                  <p>Enter your waste details to get AI-powered processing recommendations.</p>
                </div>
              )}

              {isLoading && (
                <div className="loading-state">
                  <i className="fas fa-spinner fa-spin"></i>
                  <p>Analyzing waste composition and generating optimal processing methods...</p>
                </div>
              )}

              {showResults && recommendations && (
                <div className="results-content">
                  <div className="waste-summary">
                    <h3>Waste Analysis Summary</h3>
                    <div className="summary-grid">
                      <div className="summary-item">
                        <span className="label">Crop Type:</span>
                        <span className="value">{recommendations.cropType}</span>
                      </div>
                      <div className="summary-item">
                        <span className="label">Waste Amount:</span>
                        <span className="value">{recommendations.wasteAmount} tons</span>
                      </div>
                      <div className="summary-item">
                        <span className="label">Location:</span>
                        <span className="value">{typeof recommendations.location === 'string' ? recommendations.location : recommendations.location?.name || 'Unknown'}</span>
                      </div>
                      <div className="summary-item">
                        <span className="label">Methods Found:</span>
                        <span className="value">{recommendations.recommendations?.length || 0}</span>
                      </div>
                    </div>
                  </div>

                  <div className="processing-methods">
                    <h3>Recommended Processing Methods</h3>
                    <div className="method-tabs">
                      {recommendations.recommendations?.map((rec, index) => (
                        <button
                          key={index}
                          className={`method-tab ${selectedMethod === index ? 'active' : ''}`}
                          onClick={() => setSelectedMethod(index)}
                          style={{ borderColor: getMethodColor(rec.method) }}
                        >
                          <i className={getMethodIcon(rec.method)}></i>
                          {rec.method.charAt(0).toUpperCase() + rec.method.slice(1)}
                          <span className="confidence">{(rec.confidence * 100).toFixed(1)}%</span>
                        </button>
                      ))}
                    </div>

                    {recommendations.recommendations[selectedMethod] && (
                      <div className="method-details">
                        <div className="method-header">
                          <h4>
                            <i className={getMethodIcon(recommendations.recommendations[selectedMethod]?.method)}></i>
                            {recommendations.recommendations[selectedMethod]?.method?.charAt(0)?.toUpperCase() + 
                             recommendations.recommendations[selectedMethod]?.method?.slice(1) || 'Unknown'} Processing
                          </h4>
                          <span className="confidence-badge">
                            {(recommendations.recommendations[selectedMethod]?.confidence * 100)?.toFixed(1) || '0.0'}% Confidence
                          </span>
                        </div>

                        <div className="method-impact">
                          <h5>Environmental & Economic Impact</h5>
                          <div className="impact-grid">
                            <div className="impact-item">
                              <i className="fas fa-wind"></i>
                              <span className="impact-value">{recommendations.recommendations[selectedMethod]?.impact?.aqi?.toFixed(2) || '0.00'}</span>
                              <span className="impact-label">AQI Improvement</span>
                            </div>
                            <div className="impact-item">
                              <i className="fas fa-leaf"></i>
                              <span className="impact-value">{recommendations.recommendations[selectedMethod]?.impact?.carbon?.toFixed(2) || '0.00'}</span>
                              <span className="impact-label">Tons CO₂ Reduced</span>
                            </div>
                            <div className="impact-item">
                              <i className="fas fa-rupee-sign"></i>
                              <span className="impact-value">₹{recommendations.recommendations[selectedMethod]?.impact?.economic?.toLocaleString() || '0'}</span>
                              <span className="impact-label">Economic Benefit</span>
                            </div>
                          </div>
                        </div>

                        <div className="processing-steps">
                          <h5>Processing Steps</h5>
                          <div className="steps-list">
                            {recommendations.recommendations[selectedMethod]?.steps?.map((step, index) => (
                              <div key={index} className="step-item">
                                <span className="step-number">{index + 1}</span>
                                <span className="step-text">{step}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="equipment-needed">
                          <h5>Required Equipment</h5>
                          <div className="equipment-grid">
                            {recommendations.recommendations[selectedMethod]?.equipment?.map((equipment, index) => (
                              <div key={index} className="equipment-item">
                                <i className="fas fa-tools"></i>
                                <span>{equipment}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="total-impact">
                    <h3>Total Project Impact</h3>
                    <div className="total-impact-grid">
                      <div className="total-impact-item">
                        <i className="fas fa-wind"></i>
                        <span className="total-value">{recommendations.totalImpact.aqiReduction}</span>
                        <span className="total-label">Total AQI Improvement</span>
                      </div>
                      <div className="total-impact-item">
                        <i className="fas fa-leaf"></i>
                        <span className="total-value">{recommendations.totalImpact.carbonReduction}</span>
                        <span className="total-label">Total CO₂ Reduction (tons)</span>
                      </div>
                      <div className="total-impact-item">
                        <i className="fas fa-rupee-sign"></i>
                        <span className="total-value">₹{recommendations.totalImpact.economicBenefit.toLocaleString()}</span>
                        <span className="total-label">Total Economic Benefit</span>
                      </div>
                    </div>
                  </div>

                  <div className="action-buttons">
                    <button onClick={handleDownloadReport} className="custom-btn">
                      <i className="fas fa-download"></i> Download Report
                    </button>
                    <button className="custom-btn secondary">
                      <i className="fas fa-share"></i> Share Results
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Interactive Map Section */}
        {showResults && recommendations && (
          <div className="map-section">
            <div className="map-container card">
              <h2><i className="fas fa-map-marker-alt"></i> Location Analysis</h2>
              <div className="location-info">
                <p><strong>Selected Location:</strong> {typeof recommendations.location === 'string' ? recommendations.location : recommendations.location?.name || 'Unknown'}</p>
                {typeof recommendations.location === 'object' && recommendations.location?.lat && recommendations.location?.lng && (
                  <>
                    <p><strong>Coordinates:</strong> {recommendations.location.lat.toFixed(4)}, {recommendations.location.lng.toFixed(4)}</p>
                    
                    <div className="results-map" style={{ height: '400px', marginTop: '1rem', border: '2px solid #ddd', borderRadius: '8px' }}>
                      <MapContainer
                        center={[recommendations.location.lat, recommendations.location.lng]}
                        zoom={10}
                        style={{ height: '100%', width: '100%' }}
                        scrollWheelZoom={true}
                      >
                        <TileLayer
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={[recommendations.location.lat, recommendations.location.lng]}>
                          <div>
                            <h4>{recommendations.location.name}</h4>
                            <p>Waste Processing Location</p>
                          </div>
                        </Marker>
                      </MapContainer>
                    </div>
                  </>
                )}
                {(typeof recommendations.location === 'string' || !recommendations.location?.lat || !recommendations.location?.lng) && (
                  <div className="location-note">
                    <p><em>Map coordinates not available for this location. Consider selecting a location from the map above for precise analysis.</em></p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AgriRevive;
