import React, { useState, useEffect, useRef } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { getCropRecommendations } from '../../services/cropRotationService';
import AQIWidget from '../../components/widgets/AQIWidget';
import './Module.css';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

function CropRotation() {
  const [formData, setFormData] = useState({
    previousCrop: '',
    soilType: '',
    region: '',
    farmSize: ''
  });
  const [recommendations, setRecommendations] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Auto-fill soil type and region based on crop selection
    if (name === 'previousCrop' && value) {
      const cropDefaults = {
        rice: { soil: 'clay', region: 'tropical' },
        wheat: { soil: 'loamy', region: 'temperate' },
        sugarcane: { soil: 'loamy', region: 'tropical' },
        pulses: { soil: 'sandy', region: 'subtropical' },
        cotton: { soil: 'sandy', region: 'tropical' },
        groundnut: { soil: 'sandy', region: 'tropical' },
        maize: { soil: 'loamy', region: 'tropical' },
        sorghum: { soil: 'sandy', region: 'arid' },
        'pearl-millet': { soil: 'sandy', region: 'arid' },
        chickpea: { soil: 'sandy', region: 'subtropical' },
        mustard: { soil: 'loamy', region: 'temperate' },
        moong: { soil: 'sandy', region: 'subtropical' }
      };

      const defaults = cropDefaults[value];
      if (defaults) {
        setFormData(prev => ({
          ...prev,
          soilType: defaults.soil,
          region: defaults.region
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      
      const results = await getCropRecommendations(formData);
      console.log('Crop recommendations:', results);
      setRecommendations(results);
      setShowResults(true);
    } catch (error) {
      console.error('Error getting recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadReport = () => {
    if (!recommendations) return;
    console.log(recommendations)

    const reportContent = `
CROP ROTATION RECOMMENDATION REPORT
===================================

Farm Details:
- Previous Crop: ${recommendations.previousCrop}
- Soil Type: ${recommendations.soilType}
- Region: ${recommendations.region}
- Farm Size: ${recommendations.farmSize} acres

Recommended Next Crops:
${recommendations.recommendations.map((rec, index) => `
${index + 1}. ${rec.name}
   - Suitability: ${(rec.suitability || 85).toFixed(1)}%
   - Estimated Yield: ${rec.estimatedYield || 'N/A'} tons
   - Planting Time: ${rec.plantingTime || 'Season dependent'}
   - Harvest Time: ${rec.harvestTime || 'Season dependent'}
   - Benefit: ${rec.benefit || 'Beneficial for crop rotation'}
`).join('')}

Organic Fertilizer Recommendations:
${recommendations.organicFertilizers.map((fert, index) => `
${index + 1}. ${fert.name}: ${fert.description}
`).join('')}

Sustainability Impact:
- Soil Health Improvement: ${(recommendations.sustainability?.soilHealth || 25).toFixed(1)}%
- Water Conservation: ${(recommendations.sustainability?.waterConservation || 15).toFixed(1)}%
- Carbon Reduction: ${recommendations.sustainability?.carbonReduction || 'N/A'} tons CO₂
- Economic Benefit: ₹${(recommendations.sustainability?.economicBenefit || 0).toLocaleString()}

Generated on: ${new Date().toLocaleDateString()}
    `;

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crop-rotation-report-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Chart data for AQI impact analysis
  const chartData = recommendations ? {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Without Following Recommendations',
        data: recommendations.aqiImpactData.map(d => d.withoutRecommendations),
        borderColor: 'rgba(255, 99, 71, 1)',
        backgroundColor: 'rgba(255, 99, 71, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#fff',
        pointBorderColor: 'rgba(255, 99, 71, 1)',
        pointBorderWidth: 2,
        pointRadius: 5,
        borderWidth: 2.5
      },
      {
        label: 'Following Recommendations',
        data: recommendations.aqiImpactData.map(d => d.withRecommendations),
        borderColor: 'rgba(46, 204, 113, 1)',
        backgroundColor: 'rgba(46, 204, 113, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#fff',
        pointBorderColor: 'rgba(46, 204, 113, 1)',
        pointBorderWidth: 2,
        pointRadius: 5,
        borderWidth: 2.5
      }
    ]
  } : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            family: "'Inter', sans-serif"
          }
        }
      },
      title: {
        display: true,
        text: 'AQI Impact Throughout the Year',
        font: {
          size: 16,
          family: "'Inter', sans-serif",
          weight: 'bold'
        },
        padding: 20
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#ddd',
        borderWidth: 1
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'AQI Value',
          color: '#666',
          font: {
            size: 12,
            family: "'Inter', sans-serif"
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Months',
          color: '#666',
          font: {
            size: 12,
            family: "'Inter', sans-serif"
          }
        },
        grid: {
          display: false
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };

  return (
    <div className="module-container">
      <div className="module-header">
        <h1><i className="fas fa-sync-alt"></i> CropShift - Crop Rotation Assistant</h1>
        <p>Smart AI-Powered Crop Rotation Assistant for Sustainable Farming</p>
      </div>
      
      <div className="module-content">
        <div className="tool-container">
          <div className="input-section card">
            <h2><i className="fas fa-clipboard-list"></i> Enter Your Farm Details</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="previousCrop">Select Your Crop:</label>
                <select 
                  id="previousCrop" 
                  name="previousCrop" 
                  value={formData.previousCrop}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a crop</option>
                  <option value="rice">Rice (Dhan)</option>
                  <option value="wheat">Wheat (Gehun)</option>
                  <option value="sugarcane">Sugarcane (Ganna)</option>
                  <option value="pulses">Pulses (Dal)</option>
                  <option value="cotton">Cotton (Kapas)</option>
                  <option value="groundnut">Groundnut (Moongfali)</option>
                  <option value="maize">Maize (Makka)</option>
                  <option value="sorghum">Sorghum (Jowar)</option>
                  <option value="pearl-millet">Pearl Millet (Bajra)</option>
                  <option value="chickpea">Chickpea (Chana)</option>
                  <option value="mustard">Mustard (Sarson)</option>
                  <option value="moong">Green Gram (Moong)</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="soilType">Soil Type:</label>
                <select 
                  id="soilType" 
                  name="soilType" 
                  value={formData.soilType}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select soil type</option>
                  <option value="clay">Clay</option>
                  <option value="sandy">Sandy</option>
                  <option value="loamy">Loamy</option>
                  <option value="silty">Silty</option>
                  <option value="peaty">Peaty</option>
                </select>
                <small className="helper-text">This will be auto-filled based on your crop selection</small>
              </div>
              
              <div className="form-group">
                <label htmlFor="region">Region/Climate:</label>
                <select 
                  id="region" 
                  name="region" 
                  value={formData.region}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select region</option>
                  <option value="tropical">Tropical</option>
                  <option value="subtropical">Subtropical</option>
                  <option value="temperate">Temperate</option>
                  <option value="arid">Arid</option>
                  <option value="mediterranean">Mediterranean</option>
                </select>
                <small className="helper-text">This will be auto-filled based on your crop selection</small>
              </div>
              
              <div className="form-group">
                <label htmlFor="farmSize">Farm Size (acres):</label>
                <input 
                  type="number" 
                  id="farmSize" 
                  name="farmSize"
                  value={formData.farmSize}
                  onChange={handleInputChange}
                  min="1" 
                  required 
                />
              </div>
              
              <button type="submit" className="custom-btn" disabled={isLoading}>
                <i className="fas fa-check-circle"></i> 
                {isLoading ? 'Analyzing...' : 'Get Recommendations'}
              </button>
            </form>
          </div>

          <div className="results-section">
            <div className="card recommendation-card">
              <h2><i className="fas fa-lightbulb"></i> Your Recommendations</h2>
              
              {!showResults && (
                <div className="results-placeholder">
                  <i className="fas fa-seedling placeholder-icon"></i>
                  <p>Fill out the form to get personalized recommendations for your farm.</p>
                </div>
              )}

              {isLoading && (
                <div className="loading-state">
                  <i className="fas fa-spinner fa-spin"></i>
                  <p>Analyzing your farm data and generating recommendations...</p>
                </div>
              )}

              {showResults && recommendations && (
                <div className="results-content">
                  <div className="farm-summary">
                    <h3>Farm Summary</h3>
                    <div className="summary-grid">
                      <div className="summary-item">
                        <span className="label">Previous Crop:</span>
                        <span className="value">{recommendations.previousCrop}</span>
                      </div>
                      <div className="summary-item">
                        <span className="label">Soil Type:</span>
                        <span className="value">{recommendations.soilType}</span>
                      </div>
                      <div className="summary-item">
                        <span className="label">Region:</span>
                        <span className="value">{recommendations.region}</span>
                      </div>
                      <div className="summary-item">
                        <span className="label">Farm Size:</span>
                        <span className="value">{recommendations.farmSize} acres</span>
                      </div>
                    </div>
                  </div>

                  <div className="crop-recommendations">
                    <h3>Recommended Next Crops</h3>
                    {recommendations.recommendations.map((rec, index) => (
                      <div key={index} className={`recommendation-item ${index === 0 ? 'best-match' : ''}`}>
                        <div className="rec-header">
                          <h4>{rec.name}</h4>
                          {index === 0 && <span className="best-badge">Best Match</span>}
                          <span className="suitability">{(rec.suitability || 85).toFixed(1)}% suitable</span>
                        </div>
                        <p className="rec-benefit">{rec.benefit}</p>
                        <div className="rec-details">
                          <div className="detail-item">
                            <i className="fas fa-weight"></i>
                            <span>Est. Yield: {rec.estimatedYield || 'N/A'} tons</span>
                          </div>
                          <div className="detail-item">
                            <i className="fas fa-seedling"></i>
                            <span>Plant: {rec.plantingTime || 'Season dependent'}</span>
                          </div>
                          <div className="detail-item">
                            <i className="fas fa-harvest"></i>
                            <span>Harvest: {rec.harvestTime || 'Season dependent'}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="organic-fertilizers">
                    <h3>Organic Fertilizer Recommendations</h3>
                    <div className="fertilizer-grid">
                      {recommendations.organicFertilizers.map((fert, index) => (
                        <div key={index} className="fertilizer-item">
                          <h4>{fert.name}</h4>
                          <p>{fert.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="sustainability-impact">
                    <h3>Sustainability Impact</h3>
                    <div className="impact-grid">
                      <div className="impact-item">
                        <i className="fas fa-leaf"></i>
                        <span className="impact-value">{(recommendations.sustainability?.soilHealth || 25).toFixed(1)}%</span>
                        <span className="impact-label">Soil Health Improvement</span>
                      </div>
                      <div className="impact-item">
                        <i className="fas fa-tint"></i>
                        <span className="impact-value">{(recommendations.sustainability?.waterConservation || 15).toFixed(1)}%</span>
                        <span className="impact-label">Water Conservation</span>
                      </div>
                      <div className="impact-item">
                        <i className="fas fa-cloud"></i>
                        <span className="impact-value">{recommendations.sustainability?.carbonReduction || 'N/A'}</span>
                        <span className="impact-label">Tons CO₂ Reduced</span>
                      </div>
                      <div className="impact-item">
                        <i className="fas fa-rupee-sign"></i>
                        <span className="impact-value">₹{(recommendations.sustainability?.economicBenefit || 0).toLocaleString()}</span>
                        <span className="impact-label">Economic Benefit</span>
                      </div>
                    </div>
                  </div>

                  <button onClick={downloadReport} className="custom-btn">
                    <i className="fas fa-download"></i> Download Report
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        
          <AQIWidget />

        {/* AQI Impact Chart */}
        {showResults && recommendations && chartData && (
          <div className="chart-section">
            <div className="chart-container">
              <h2><i className="fas fa-chart-line"></i> AQI Impact Analysis</h2>
              <div className="chart-wrapper" style={{ height: '400px' }}>
                <Line data={chartData} options={chartOptions} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CropRotation;
