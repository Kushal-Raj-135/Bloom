// Crop name mapping for local names
const cropNameMap = {
    'rice': 'Rice (Dhan)',
    'wheat': 'Wheat (Gehun)',
    'sugarcane': 'Sugarcane (Ganna)',
    'pulses': 'Pulses (Dal)',
    'cotton': 'Cotton (Kapas)',
    'groundnut': 'Groundnut (Moongfali)',
    'maize': 'Maize (Makka)',
    'sorghum': 'Sorghum (Jowar)',
    'pearl-millet': 'Pearl Millet (Bajra)',
    'chickpea': 'Chickpea (Chana)',
    'mustard': 'Mustard (Sarson)',
    'moong': 'Green Gram (Moong)',
    'soybean': 'Soybean (Soya)',
    'potato': 'Potato (Aloo)',
    'corn': 'Corn (Makka)',
    'alfalfa': 'Alfalfa (Rijka)',
    'legumes': 'Legumes (Faliyan)',
    'jowar': 'Jowar (Sorghum)',
    'cowpea': 'Cowpea (Lobia/Chawli)',
    'mung bean': 'Mung Bean (Moong)',
    'pigeonpea': 'Pigeonpea (Arhar/Tur Dal)',
    'arhar': 'Pigeonpea (Arhar/Tur Dal)',
    'tur': 'Pigeonpea (Arhar/Tur Dal)',
    'lobia': 'Cowpea (Lobia/Chawli)',
    'chawli': 'Cowpea (Lobia/Chawli)',
    'tur dal': 'Pigeonpea (Arhar/Tur Dal)'
};

// Crop rotation database
const cropData = {
    wheat: {
        nextCrops: ["soybean", "corn", "potato"],
        benefits: {
            soybean: "Soybeans fix nitrogen in the soil, which wheat depletes.",
            corn: "Corn has different nutrient needs and pest profiles than wheat.",
            potato: "Potatoes break disease cycles and utilize different soil layers.",
        },
        organicFertilizers: [
            { name: "Compost", description: "Rich in nutrients and improves soil structure." },
            { name: "Green Manure", description: "Plant cover crops like clover to enrich soil." },
            { name: "Bone Meal", description: "High in phosphorus, good for root development." },
        ],
        soil: 'loamy',
        region: 'temperate',
        name: 'Wheat (Gehun)'
    },
    rice: {
        nextCrops: ["pulses", "wheat", "mustard"],
        benefits: {
            pulses: "Pulses (like moong or urad) fix nitrogen and improve soil fertility after rice.",
            wheat: "Wheat-rice is a traditional rotation in Indo-Gangetic plains, different water requirements help soil recovery.",
            mustard: "Mustard has deep roots that break hardpan and adds organic matter to soil.",
        },
        organicFertilizers: [
            { name: "Jeevamrut", description: "Traditional bio-fertilizer made from cow dung, urine, and local ingredients." },
            { name: "Green Manure", description: "Dhaincha or Sesbania for nitrogen fixation before rice transplanting." },
            { name: "Azolla", description: "Aquatic fern that fixes nitrogen in rice paddies." },
        ],
        soil: 'clay',
        region: 'tropical',
        name: 'Rice (Dhan)'
    },
    corn: {
        nextCrops: ["soybean", "wheat", "alfalfa"],
        benefits: {
            soybean: "Soybeans fix nitrogen depleted by corn.",
            wheat: "Wheat has different root structures and disease profiles.",
            alfalfa: "Deep roots break compaction and fix nitrogen.",
        },
        organicFertilizers: [
            { name: "Composted Manure", description: "High in nitrogen needed for corn growth." },
            { name: "Cover Crops", description: "Plant winter rye to prevent erosion and add organic matter." },
            { name: "Worm Castings", description: "Rich in microbes and nutrients for soil health." },
        ],
        soil: 'loamy',
        region: 'tropical',
        name: 'Maize (Makka)'
    },
    tea: {
        nextCrops: ["legumes", "maize", "potato"],
        benefits: {
            legumes: "Legumes fix nitrogen and improve soil structure.",
            maize: "Maize has different nutrient requirements and helps break pest cycles.",
            potato: "Potatoes utilize different soil layers and break disease cycles.",
        },
        organicFertilizers: [
            { name: "Vermicompost", description: "Rich in nutrients and beneficial microorganisms." },
            { name: "Neem Cake", description: "Natural pest deterrent and soil enricher." },
            { name: "Bone Meal", description: "Provides phosphorus for root development." },
        ],
    },
    sugarcane: {
        nextCrops: ["moong", "chickpea", "potato"],
        benefits: {
            moong: "Short duration crop that fixes nitrogen after sugarcane harvest.",
            chickpea: "Improves soil structure and adds nitrogen for next crop.",
            potato: "Different root system helps break pest cycles and utilize nutrients.",
        },
        organicFertilizers: [
            { name: "Press Mud Compost", description: "Sugarcane industry byproduct rich in nutrients." },
            { name: "Farm Manure", description: "Well-decomposed cow dung manure for sustained nutrition." },
            { name: "Bone Meal", description: "Rich in phosphorus for root development." },
        ],
        soil: 'loamy',
        region: 'tropical',
        name: 'Sugarcane (Ganna)'
    },
    pulses: {
        nextCrops: ["rice", "maize", "cotton"],
        benefits: {
            rice: "Rice benefits from nitrogen fixed by pulses.",
            maize: "Maize utilizes residual nitrogen and has different pest profile.",
            cotton: "Cotton benefits from improved soil structure after pulses.",
        },
        organicFertilizers: [
            { name: "Rhizobium Culture", description: "Enhances nitrogen fixation in pulse crops." },
            { name: "Rock Phosphate", description: "Natural source of phosphorus for better nodulation." },
            { name: "Ghanjeevamrut", description: "Solid form of Jeevamrut, rich in beneficial microbes." },
        ],
        soil: 'sandy',
        region: 'subtropical',
        name: 'Pulses (Dal)'
    },
    cotton: {
        nextCrops: ["chickpea", "wheat", "sorghum"],
        benefits: {
            chickpea: "Winter chickpea fixes nitrogen and uses residual moisture.",
            wheat: "Wheat utilizes different soil layers and breaks disease cycle.",
            sorghum: "Drought-resistant crop that helps manage soil moisture.",
        },
        organicFertilizers: [
            { name: "Neem Oil Cake", description: "Natural pest deterrent and nutrient source." },
            { name: "Composted Manure", description: "Well-rotted manure for slow release of nutrients." },
            { name: "Beejamrut", description: "Traditional seed treatment for better germination." },
        ],
        soil: 'sandy',
        region: 'tropical',
        name: 'Cotton (Kapas)'
    },
    groundnut: {
        nextCrops: ["jowar", "pearl-millet", "maize"],
        benefits: {
            jowar: "Sorghum/jowar is drought tolerant and uses residual fertility.",
            "pearl-millet": "Bajra/pearl-millet has deep roots and drought tolerance.",
            maize: "Maize benefits from nitrogen fixed by groundnut.",
        },
        organicFertilizers: [
            { name: "Phosphate Rich Organic Manure", description: "Enhances pod development and oil content." },
            { name: "Trichoderma Enriched FYM", description: "Protects from soil-borne diseases." },
            { name: "Karanj Cake", description: "Natural pest repellent and nutrient source." },
        ],
        soil: 'sandy',
        region: 'tropical',
        name: 'Groundnut (Moongfali)'
    },
    maize: {
        soil: 'loamy',
        region: 'tropical',
        name: 'Maize (Makka)'
    },
    sorghum: {
        soil: 'sandy',
        region: 'arid',
        name: 'Sorghum (Jowar)'
    },
    'pearl-millet': {
        soil: 'sandy',
        region: 'arid',
        name: 'Pearl Millet (Bajra)'
    },
    chickpea: {
        soil: 'sandy',
        region: 'subtropical',
        name: 'Chickpea (Chana)'
    },
    mustard: {
        soil: 'loamy',
        region: 'temperate',
        name: 'Mustard (Sarson)'
    },
    moong: {
        soil: 'sandy',
        region: 'subtropical',
        name: 'Green Gram (Moong)'
    }
};

// AQI data and recommendations
const aqiRecommendations = {
    good: {
        status: "Good",
        color: "#009966",
        activities: [
            "Ideal time for plowing and tilling to minimize dust",
            "Good conditions for harvesting crops",
            "Excellent time for planting and transplanting",
            "Optimal conditions for spraying organic pesticides",
        ],
    },
    moderate: {
        status: "Moderate",
        color: "#ffde33",
        activities: [
            "Good time for most farming activities",
            "Consider using dust reduction techniques when plowing",
            "Suitable for harvesting and field work",
            "Good conditions for irrigation and fertilization",
        ],
    },
    unhealthySensitive: {
        status: "Unhealthy for Sensitive Groups",
        color: "#ff9933",
        activities: [
            "Limit dust-generating activities like plowing",
            "Consider postponing burning of any agricultural waste",
            "Still suitable for harvesting and low-dust activities",
            "Good time for planning and maintenance work",
        ],
    },
    unhealthy: {
        status: "Unhealthy",
        color: "#cc0033",
        activities: [
            "Avoid plowing, tilling, and other dust-generating activities",
            "Postpone burning of agricultural waste",
            "Consider indoor farming activities and planning",
            "Use respiratory protection if outdoor work is necessary",
        ],
    },
    veryUnhealthy: {
        status: "Very Unhealthy",
        color: "#660099",
        activities: [
            "Avoid all outdoor farming activities if possible",
            "Focus on indoor tasks and planning",
            "Postpone all burning and dust-generating activities",
            "Ensure proper irrigation to prevent dust from dry soil",
        ],
    },
};

// Initialize AQI Chart
function initializeAQIChart() {
    const ctx = document.getElementById('aqiComparisonChart').getContext('2d');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Initialize with empty data - will be updated when recommendations are generated
    const emptyData = Array(12).fill(null);

    const gradientWithout = ctx.createLinearGradient(0, 0, 0, 400);
    gradientWithout.addColorStop(0, 'rgba(255, 99, 71, 0.6)');  // Red for not following
    gradientWithout.addColorStop(1, 'rgba(255, 99, 71, 0.1)');

    const gradientWith = ctx.createLinearGradient(0, 0, 0, 400);
    gradientWith.addColorStop(0, 'rgba(46, 204, 113, 0.6)');  // Green for following
    gradientWith.addColorStop(1, 'rgba(46, 204, 113, 0.1)');

    window.aqiChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: months,
            datasets: [
                {
                    label: 'Without Following Recommendations',
                    data: emptyData,
                    borderColor: 'rgba(255, 99, 71, 1)',
                    backgroundColor: gradientWithout,
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#fff',
                    pointBorderColor: 'rgba(255, 99, 71, 1)',
                    pointHoverBackgroundColor: '#fff',
                    pointBorderWidth: 2,
                    pointHoverBorderWidth: 2,
                    pointRadius: 5,
                    pointHoverRadius: 6,
                    borderWidth: 2.5,
                    order: 2
                },
                {
                    label: 'Following Recommendations',
                    data: emptyData,
                    borderColor: 'rgba(46, 204, 113, 1)',
                    backgroundColor: gradientWith,
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#fff',
                    pointBorderColor: 'rgba(46, 204, 113, 1)',
                    pointHoverBackgroundColor: '#fff',
                    pointBorderWidth: 2,
                    pointHoverBorderWidth: 2,
                    pointRadius: 5,
                    pointHoverRadius: 6,
                    borderWidth: 2.5,
                    order: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: {
                    top: 20,
                    right: 25,
                    bottom: 0,
                    left: 15
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Projected AQI Impact Analysis',
                    align: 'center',
                    font: {
                        size: 18,
                        weight: '500',
                        family: "'Arial', sans-serif"
                    },
                    padding: {
                        top: 0,
                        bottom: 20
                    },
                    color: '#555'
                },
                legend: {
                    display: true,
                    position: 'bottom',
                    align: 'center',
                    labels: {
                        usePointStyle: true,
                        pointStyle: 'circle',
                        padding: 15,
                        boxWidth: 8,
                        boxHeight: 8,
                        font: {
                            size: 12,
                            family: "'Arial', sans-serif"
                        },
                        color: '#666'
                    }
                },
                tooltip: {
                    enabled: true,
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    titleColor: '#666',
                    bodyColor: '#666',
                    bodyFont: {
                        size: 12,
                        family: "'Arial', sans-serif"
                    },
                    borderColor: '#ddd',
                    borderWidth: 1,
                    padding: 8,
                    displayColors: true,
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.parsed.y} AQI`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    min: 0,
                    max: 250,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)',
                        drawBorder: false,
                        lineWidth: 1
                    },
                    ticks: {
                        stepSize: 50,
                        font: {
                            size: 11,
                            family: "'Arial', sans-serif"
                        },
                        padding: 8,
                        color: '#999',
                        callback: function(value) {
                            return value + ' AQI';
                        }
                    },
                    title: {
                        display: true,
                        text: 'Air Quality Index (AQI)',
                        color: '#666',
                        font: {
                            size: 12,
                            family: "'Arial', sans-serif"
                        }
                    }
                },
                x: {
                    grid: {
                        display: false,
                        drawBorder: false
                    },
                    ticks: {
                        font: {
                            size: 11,
                            family: "'Arial', sans-serif"
                        },
                        padding: 5,
                        color: '#999'
                    },
                    title: {
                        display: true,
                        text: 'Months',
                        color: '#666',
                        font: {
                            size: 12,
                            family: "'Arial', sans-serif"
                        }
                    }
                }
            }
        }
    });
    return window.aqiChart;
}

// Initialize AQI Gauge
function initAQIGauge() {
    const gaugeElement = document.getElementById('aqi-gauge');
    if (!gaugeElement) return null;

    return new JustGage({
        id: 'aqi-gauge',
        value: 0,
        min: 0,
        max: 300,
        title: "Air Quality",
        label: "AQI",
        valueFontColor: "#2c3e50",
        valueFontFamily: "Inter",
        labelFontFamily: "Inter",
        titleFontFamily: "Inter",
        titleFontColor: "#2c3e50",
        labelFontColor: "#666",
        gaugeColor: "#f0f0f0",
        levelColors: [
            "#009966",  // Good (0-50)
            "#ffde33",  // Moderate (51-100)
            "#ff9933",  // Unhealthy for Sensitive Groups (101-150)
            "#cc0033",  // Unhealthy (151-200)
            "#660099"   // Very Unhealthy (201-300)
        ],
        pointer: true,
        pointerOptions: {
            toplength: 12,
            bottomlength: -15,
            bottomwidth: 2,
            stroke: 'none',
            stroke_width: 0,
            stroke_linecap: 'round',
            color: '#2c3e50'
        },
        gaugeWidthScale: 0.75,
        counter: true,
        donut: true,
        donutStartAngle: 90,
        startAnimationType: "bounce",
        startAnimationTime: 1500,
        refreshAnimationType: "bounce",
        refreshAnimationTime: 700,
        customSectors: {
            percents: false,
            ranges: [
                { color: "#009966", lo: 0, hi: 50 },
                { color: "#ffde33", lo: 51, hi: 100 },
                { color: "#ff9933", lo: 101, hi: 150 },
                { color: "#cc0033", lo: 151, hi: 200 },
                { color: "#660099", lo: 201, hi: 300 }
            ]
        },
        valueMinFontSize: 24,
        titleMinFontSize: 18,
        labelMinFontSize: 14,
        minLabelMinFontSize: 14,
        maxLabelMinFontSize: 14,
        showMinMax: true,
        humanFriendly: false,
        decimals: 0,
        noGradient: false,
        shadowOpacity: 0.3,
        shadowSize: 5,
        shadowVerticalOffset: 10
    });
}

// Update AQI display
function updateAQI(value) {
    const gaugeRing = document.querySelector('.gauge-ring');
    const aqiNumber = document.getElementById('aqi-number');
    const aqiStatus = document.querySelector('.gauge-status');
    const aqiDescription = document.querySelector('.aqi-description');

    // Add updating animation class
    gaugeRing.classList.add('updating');
    setTimeout(() => gaugeRing.classList.remove('updating'), 500);

    // Update AQI number with animation
    const startValue = parseInt(aqiNumber.textContent) || 0;
    const endValue = value;
    const duration = 1000;
    const steps = 60;
    const stepValue = (endValue - startValue) / steps;
    let currentStep = 0;

    const animate = () => {
        currentStep++;
        const currentValue = Math.round(startValue + (stepValue * currentStep));
        aqiNumber.textContent = currentValue;

        if (currentStep < steps) {
            requestAnimationFrame(animate);
        }
    };
    animate();

    // Determine AQI level and update styles
    let level, statusText, description;
    if (value <= 50) {
        level = 'good';
        statusText = 'Good Air Quality';
        description = 'Air quality is satisfactory, and air pollution poses little or no risk.';
    } else if (value <= 100) {
        level = 'moderate';
        statusText = 'Moderate';
        description = 'Air quality is acceptable. However, there may be a risk for some people, particularly those who are unusually sensitive to air pollution.';
    } else if (value <= 150) {
        level = 'unhealthy-sensitive';
        statusText = 'Unhealthy for Sensitive Groups';
        description = 'Members of sensitive groups may experience health effects. The general public is less likely to be affected.';
    } else if (value <= 200) {
        level = 'unhealthy';
        statusText = 'Unhealthy';
        description = 'Some members of the general public may experience health effects; members of sensitive groups may experience more serious health effects.';
    } else {
        level = 'very-unhealthy';
        statusText = 'Very Unhealthy';
        description = 'Health alert: The risk of health effects is increased for everyone.';
    }

    // Update gauge elements
    gaugeRing.dataset.level = level;
    aqiStatus.textContent = statusText;
    aqiDescription.textContent = description;

    // Update status color based on level
    const color = getComputedStyle(gaugeRing).getPropertyValue('--highlight-color');
    aqiStatus.style.color = color;
}

// Function to update chart with recommendation impact
function updateAQIChartWithRecommendations(cropInfo) {
    if (!window.aqiChart) return;

    // Base AQI values for different seasons
    const seasonalBaseAQI = {
        winter: 120,  // Oct-Feb
        summer: 150,  // Mar-Jun
        monsoon: 90   // Jul-Sep
    };

    // Calculate AQI impact based on crop type and rotation
    const getAQIImpact = (month, isFollowing) => {
        let baseAQI;
        
        // Determine season's base AQI
        if ([10, 11, 12, 1, 2].includes(month)) baseAQI = seasonalBaseAQI.winter;
        else if ([3, 4, 5, 6].includes(month)) baseAQI = seasonalBaseAQI.summer;
        else baseAQI = seasonalBaseAQI.monsoon;

        if (isFollowing) {
            // Reduction factors for following recommendations
            const reductionFactors = {
                rice: 0.3,    // 30% reduction
                wheat: 0.25,
                sugarcane: 0.35,
                pulses: 0.4,
                cotton: 0.3,
                groundnut: 0.35,
                maize: 0.3,
                sorghum: 0.35,
                'pearl-millet': 0.3,
                chickpea: 0.4,
                mustard: 0.25,
                moong: 0.4
            };

            const reductionFactor = reductionFactors[cropInfo.previousCrop] || 0.3;
            return baseAQI * (1 - reductionFactor);
        } else {
            // Increase factors for not following recommendations
            return baseAQI * (1 + 0.2 + (Math.random() * 0.2)); // 20-40% increase
        }
    };

    // Generate data for both scenarios
    const withoutFollowingData = [];
    const followingRecommendationsData = [];

    for (let month = 1; month <= 12; month++) {
        withoutFollowingData.push(getAQIImpact(month, false));
        followingRecommendationsData.push(getAQIImpact(month, true));
    }

    // Update chart data
    window.aqiChart.data.datasets[0].data = withoutFollowingData;
    window.aqiChart.data.datasets[1].data = followingRecommendationsData;
    window.aqiChart.update();
}

// Helper function to get local crop name
function getLocalCropName(cropName) {
    return cropNameMap[cropName.toLowerCase()] || cropName;
}

// Auto-fill soil type and region based on crop selection
function autoFillDetails() {
    const cropSelect = document.getElementById('previous-crop');
    const soilSelect = document.getElementById('soil-type');
    const regionSelect = document.getElementById('region');

    if (!cropSelect || !soilSelect || !regionSelect) return;

    cropSelect.addEventListener('change', function() {
        const selectedCrop = this.value;
        if (selectedCrop && cropData[selectedCrop]) {
            soilSelect.value = cropData[selectedCrop].soil;
            regionSelect.value = cropData[selectedCrop].region;
        } else {
            soilSelect.value = '';
            regionSelect.value = '';
        }
    });
}

// Form submission handler
async function handleFormSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = {
        previousCrop: form.querySelector('#previous-crop').value,
        soilType: form.querySelector('#soil-type').value,
        region: form.querySelector('#region').value,
        farmSize: form.querySelector('#farm-size').value
    };

    // Get the results elements
    const resultsPlaceholder = document.querySelector('.results-placeholder');
    const resultsContent = document.querySelector('.results-content');
    const recommendationDiv = document.querySelector('#next-crop-recommendation');

    try {
        // Hide placeholder, show content
        resultsPlaceholder.style.display = 'none';
        resultsContent.style.display = 'block';
        
        // Show loading state
        recommendationDiv.innerHTML = `
            <div class="loading-state">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Generating recommendations...</p>
            </div>
        `;

        // Get recommendations from Groq
        const recommendations = await getGroqRecommendations(formData);
        console.log('Received recommendations:', recommendations);
        
        // Display the recommendations
        recommendationDiv.innerHTML = formatRecommendations(recommendations);
        
        // Update AQI chart with recommendations
        updateAQIChartWithRecommendations(formData);
    } catch (error) {
        console.error('Error:', error);
        recommendationDiv.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-circle"></i>
                <p>Error generating recommendations. Please try again.</p>
                <small>${error.message}</small>
            </div>
        `;
    }
}

// Helper function to format recommendations
function formatRecommendations(data) {
    if (!data || typeof data !== 'string') {
        return '<p>No recommendations available.</p>';
    }

    // Split the data into sections
    const sections = data.split('\n\n');
    let formattedHtml = '<div class="recommendations-content">';
    
    // Add main content wrapper
    formattedHtml += '<div class="recommendations-main-content">';
    
    // Add the title first
    formattedHtml += `
        <div class="rotation-plan-title">
            <i class="fas fa-sync-alt"></i>
            3-Year Rotation Plan
        </div>
    `;
    
    sections.forEach(section => {
        if (section.trim()) {
            if (section.includes('Year')) {
                // Format year sections
                const lines = section.split('\n');
                const yearHeader = lines[0];
                
                formattedHtml += `
                    <div class="year-section">
                        <h3 class="year-header">
                            <i class="fas fa-seedling"></i>
                            ${yearHeader}
                        </h3>
                        <div class="year-details">
                `;

                let currentItem = '';
                lines.slice(1).forEach(line => {
                    if (line.trim()) {
                        if (line.trim().startsWith('-')) {
                            // If we have a previous item, close it
                            if (currentItem) {
                                formattedHtml += `<div class="detail-item">${currentItem}</div>`;
                                currentItem = '';
                            }
                            // Start new item
                            const [label, ...content] = line.substring(1).split(':');
                            currentItem = `
                                <strong>${label.trim()}</strong>
                                <span>${content.join(':').trim()}</span>
                            `;
                        } else {
                            // Add to current item
                            currentItem += `<span>${line.trim()}</span>`;
                        }
                    }
                });
                // Add last item if exists
                if (currentItem) {
                    formattedHtml += `<div class="detail-item">${currentItem}</div>`;
                }
                
                formattedHtml += '</div></div>';
            } else if (section.includes('ORGANIC FERTILIZER')) {
                formattedHtml += `
                    <div class="fertilizer-section">
                        <h3>
                            <i class="fas fa-leaf"></i>
                            Organic Fertilizer Recommendations
                        </h3>
                        <ul>
                            ${section.split('\n').slice(1).map(line => 
                                line.trim() ? `<li>${line.trim()}</li>` : ''
                            ).join('')}
                        </ul>
                    </div>
                `;
            } else if (section.includes('Additional Recommendations')) {
                formattedHtml += `
                    <div class="additional-section">
                        <h3>
                            <i class="fas fa-list-check"></i>
                            Additional Recommendations
                        </h3>
                        <ul>
                            ${section.split('\n').slice(1).map(line => 
                                line.trim() ? `<li>${line.trim()}</li>` : ''
                            ).join('')}
                        </ul>
                    </div>
                `;
            }
        }
    });

    // Close main content wrapper
    formattedHtml += '</div>';
    
    // Close recommendations content div
    formattedHtml += '</div>';
    return formattedHtml;
}

// Function to get recommendations from Groq AI
async function getGroqRecommendations(cropInfo) {
    // Use a constant API key for now - this should be replaced with your actual API key
    const GROQ_API_KEY = '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';
    const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

    const prompt = `As an agricultural expert in India, provide a detailed 3-year crop rotation plan for the following farm, using local crop names that farmers will understand. IMPORTANT: Do NOT recommend the same crop as the current crop in the rotation plan. Each year should have a different crop to maintain soil health and prevent pest cycles.

Current Farm Details:
- Current Crop: ${getLocalCropName(cropInfo.previousCrop)}
- Soil Type: ${cropInfo.soilType}
- Region/Climate: ${cropInfo.region}
- Farm Size: ${cropInfo.farmSize} acres

Rules for recommendations:
1. NEVER recommend the current crop (${getLocalCropName(cropInfo.previousCrop)}) in the rotation plan
2. Each year must have a different crop
3. Consider crop families that complement each other
4. Focus on crops that improve soil health after the current crop
5. Consider local market demand and climate suitability

Please provide recommendations using common local names for crops (e.g., use "Arhar/Tur Dal" instead of just "Pigeonpea", "Lobia/Chawli" instead of just "Cowpea") in the following format:

3-YEAR ROTATION PLAN:

Year 1:
[Recommended crop with local name - MUST be different from current crop]
- Benefits: [List specific benefits of this crop]
- Reasoning: [Explain why this crop is recommended after the current crop]
- Soil Impact: [How this crop affects soil health]
- Management Tips: [Key cultivation practices]

Year 2:
[Recommended crop with local name - MUST be different from Year 1 crop]
- Benefits: [List specific benefits of this crop]
- Reasoning: [Explain why this crop follows Year 1's crop]
- Soil Impact: [How this crop affects soil health]
- Management Tips: [Key cultivation practices]

Year 3:
[Recommended crop with local name - MUST be different from Years 1 and 2 crops]
- Benefits: [List specific benefits of this crop]
- Reasoning: [Explain why this crop completes the rotation]
- Soil Impact: [How this crop affects soil health]
- Management Tips: [Key cultivation practices]

ORGANIC FERTILIZER RECOMMENDATIONS:
[List specific organic fertilizers for each crop in the rotation]
[Include application timing and rates]
[Traditional and modern organic alternatives]

Additional Recommendations:
1. Organic Fertilizer Strategy: [Specific recommendations]
2. Soil Health Management: [Detailed practices]
3. Climate-Specific Considerations: [Based on the region]
4. Expected Outcomes: [Benefits of this rotation cycle]`;

    try {
        console.log("Sending request to Groq AI...");
        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    {
                        role: "system",
                        content: "You are an expert agricultural advisor specializing in crop rotation. Focus on sustainable farming methods and consider local climate, soil types, and traditional farming knowledge."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 2000
            })
        });

        console.log("Response status:", response.status);
        const responseText = await response.text();
        console.log("Raw response:", responseText);

        if (!response.ok) {
            throw new Error(`Failed to get AI recommendations: ${response.status} ${responseText}`);
        }

        const data = JSON.parse(responseText);
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            throw new Error('Invalid response format from Groq AI');
        }

        return data.choices[0].message.content;
    } catch (error) {
        console.error('Error getting AI recommendations:', error);
        return `Unable to get AI recommendations at the moment. Please try again later.`;
    }
}

// Function to download results as PDF
function downloadResults() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Get the recommendations content
    const recommendationsContent = document.querySelector('.recommendations-content');
    if (!recommendationsContent) return;

    // Set up the PDF styling
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    const contentWidth = pageWidth - (2 * margin);
    let yPos = margin;

    // Add decorative header background
    doc.setFillColor(76, 175, 80);
    doc.rect(0, 0, pageWidth, 45, 'F');
    
    // Add subtle pattern to header
    for (let i = 0; i < pageWidth; i += 4) {
        doc.setDrawColor(255, 255, 255, 0.1);
        doc.line(i, 0, i, 45);
    }

    // Add header content
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(26);
    doc.text('BioBloom Solutions', margin, 25);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(14);
    doc.text('Crop Rotation Recommendations Report', margin, 38);

    yPos = 65;

    // Add report summary box
    doc.setDrawColor(76, 175, 80);
    doc.setFillColor(242, 247, 242);
    doc.roundedRect(margin, yPos, contentWidth, 60, 3, 3, 'FD');
    
    // Farm Details Header with icon-like bullet
    doc.setTextColor(76, 175, 80);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.circle(margin + 5, yPos + 10, 1.5, 'F');
    doc.text('Farm Details Summary', margin + 12, yPos + 12);

    // Get form data
    const cropName = document.getElementById('previous-crop').value;
    const soilType = document.getElementById('soil-type').value;
    const region = document.getElementById('region').value;
    const farmSize = document.getElementById('farm-size').value;
    const date = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });

    // Add farm details in an organized grid
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(11);
    const col1X = margin + 15;
    const col2X = margin + contentWidth/2;
    const detailStyle = {
        label: { font: 'helvetica', style: 'bold', size: 11, color: [90, 90, 90] },
        value: { font: 'helvetica', style: 'normal', size: 11, color: [30, 30, 30] }
    };

    // Helper function for detail rows
    function addDetailRow(label, value, x, y) {
        doc.setFont(detailStyle.label.font, detailStyle.label.style);
        doc.setFontSize(detailStyle.label.size);
        doc.setTextColor(...detailStyle.label.color);
        doc.text(label + ':', x, y);
        
        doc.setFont(detailStyle.value.font, detailStyle.value.style);
        doc.setTextColor(...detailStyle.value.color);
        doc.text(value, x + 45, y);
    }

    // Add details in grid format with local names
    addDetailRow('Current Crop', getLocalCropName(cropName), col1X, yPos + 30);
    addDetailRow('Soil Type', soilType, col1X, yPos + 45);
    addDetailRow('Region', region, col2X, yPos + 30);
    addDetailRow('Farm Size', farmSize + ' acres', col2X, yPos + 45);

    // Add report date
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.setTextColor(120, 120, 120);
    doc.text(`Report Generated: ${date}`, margin + 15, yPos + 55);

    yPos += 80;

    // Process and format recommendations
    const recommendations = recommendationsContent.innerText;
    const sections = recommendations.split('\n\n');
    
    // Add main title for recommendations
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(76, 175, 80);
    doc.text('3-Year Crop Rotation Plan', margin, yPos);
    yPos += 15;
    
    sections.forEach(section => {
        if (section.trim()) {
            if (yPos > pageHeight - 50) {
                doc.addPage();
                yPos = margin;
            }

            if (section.includes('Year')) {
                // Year section header with background
                doc.setFillColor(76, 175, 80, 0.1);
                doc.rect(margin, yPos - 5, contentWidth, 35, 'F');
                
                // Year header
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(16);
                doc.setTextColor(76, 175, 80);
                
                const lines = section.split('\n');
                const yearLine = lines[0];
                let cropLine = lines.find(line => line.includes('Recommended crop') || line.includes('[Recommended crop'));
                
                doc.text(yearLine, margin + 10, yPos + 8);
                
                if (cropLine) {
                    cropLine = cropLine.replace('[Recommended crop name]', '').replace('Recommended crop:', '').trim();
                    if (cropLine) {
                        doc.setFontSize(13);
                        doc.setTextColor(60, 60, 60);
                        doc.text(`Recommended Crop: ${getLocalCropName(cropLine)}`, margin + 10, yPos + 25);
                    }
                }
                
                yPos += 45;

                // Process year details
                const details = lines.slice(1).filter(line => line.trim());
                details.forEach(detail => {
                    if (yPos > pageHeight - 50) {
                        doc.addPage();
                        yPos = margin;
                    }

                    if (detail.trim().startsWith('-')) {
                        // Bullet point
                        doc.setFillColor(76, 175, 80);
                        doc.circle(margin + 5, yPos - 2, 1, 'F');
                        
                        let modifiedLine = detail.substring(1).trim();
                        Object.keys(cropNameMap).forEach(crop => {
                            const regex = new RegExp(`\\b${crop}\\b`, 'gi');
                            modifiedLine = modifiedLine.replace(regex, getLocalCropName(crop));
                        });
                        
                        doc.setFont('helvetica', 'normal');
                        doc.setFontSize(11);
                        doc.setTextColor(60, 60, 60);
                        doc.text(modifiedLine, margin + 15, yPos);
                        yPos += 8;
                    } else if (detail.includes(':')) {
                        // Sub-header
                        const [header, content] = detail.split(':').map(s => s.trim());
                            doc.setFont('helvetica', 'bold');
                        doc.setFontSize(12);
                            doc.setTextColor(76, 175, 80);
                        doc.text(header + ':', margin + 5, yPos);
                        
                            doc.setFont('helvetica', 'normal');
                        doc.setFontSize(11);
                            doc.setTextColor(60, 60, 60);
                        doc.text(content, margin + 15, yPos);
                        yPos += 8;
                        } else {
                        // Regular text
                        doc.setFont('helvetica', 'normal');
                        doc.setFontSize(11);
                        doc.setTextColor(60, 60, 60);
                        doc.text(detail, margin + 5, yPos);
                        yPos += 8;
                    }
                });
                yPos += 10;
            } else if (section.includes('ORGANIC FERTILIZER')) {
                // Organic fertilizer section
                doc.addPage();
                yPos = margin;

                // Section header
        doc.setFillColor(242, 247, 242);
        doc.setDrawColor(76, 175, 80);
                doc.roundedRect(margin, yPos, contentWidth, 30, 2, 2, 'FD');
                
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(16);
                doc.setTextColor(76, 175, 80);
                doc.text('Organic Fertilizer Recommendations', margin + 10, yPos + 20);
                yPos += 40;

                // Process fertilizer content
                const fertilizerLines = section.split('\n').slice(1).filter(line => line.trim());
                fertilizerLines.forEach(line => {
                    if (yPos > pageHeight - 50) {
                        doc.addPage();
                        yPos = margin;
                    }

                    if (line.trim().startsWith('-')) {
                        doc.setFillColor(76, 175, 80);
                        doc.circle(margin + 5, yPos - 2, 1, 'F');
                        
                        let modifiedLine = line.substring(1).trim();
                        doc.setFont('helvetica', 'normal');
                        doc.setFontSize(11);
                        doc.setTextColor(60, 60, 60);
                        doc.text(modifiedLine, margin + 15, yPos);
                        yPos += 8;
                    } else {
                        doc.setFont('helvetica', 'normal');
                        doc.setFontSize(11);
                        doc.setTextColor(60, 60, 60);
                        doc.text(line, margin + 5, yPos);
                        yPos += 8;
                    }
                });
                yPos += 10;
            } else if (section.includes('Additional Recommendations')) {
                // Additional recommendations section
                doc.addPage();
                yPos = margin;

                // Section header
                doc.setFillColor(242, 247, 242);
                doc.setDrawColor(76, 175, 80);
                doc.roundedRect(margin, yPos, contentWidth, 30, 2, 2, 'FD');
                
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(16);
                doc.setTextColor(76, 175, 80);
                doc.text('Additional Recommendations', margin + 10, yPos + 20);
                yPos += 40;

                // Process additional recommendations
                const additionalLines = section.split('\n').slice(1).filter(line => line.trim());
                additionalLines.forEach(line => {
                    if (yPos > pageHeight - 50) {
                        doc.addPage();
                        yPos = margin;
                    }

                    if (line.trim().startsWith('-')) {
                        doc.setFillColor(76, 175, 80);
                        doc.circle(margin + 5, yPos - 2, 1, 'F');
                        
                        let modifiedLine = line.substring(1).trim();
                        doc.setFont('helvetica', 'normal');
                        doc.setFontSize(11);
                        doc.setTextColor(60, 60, 60);
                        doc.text(modifiedLine, margin + 15, yPos);
                        yPos += 8;
                    } else {
                        doc.setFont('helvetica', 'normal');
                        doc.setFontSize(11);
                        doc.setTextColor(60, 60, 60);
                        doc.text(line, margin + 5, yPos);
                        yPos += 8;
                    }
                });
                yPos += 10;
            }
        }
    });

    // Save PDF
    doc.save('crop-rotation-recommendations.pdf');
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize AQI chart and gauge
    initializeAQIChart();
    initAQIGauge();

    // Initial update
    const initialAQI = Math.floor(Math.random() * (150 - 50 + 1)) + 50;
    updateAQI(initialAQI);

    // Update every 5 minutes
    setInterval(() => {
        const newAQI = Math.floor(Math.random() * (150 - 50 + 1)) + 50;
        updateAQI(newAQI);
    }, 5 * 60 * 1000);

    // Add form submit handler
    const form = document.getElementById('crop-form');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }

    // Initialize auto-fill functionality
    autoFillDetails();
}); 