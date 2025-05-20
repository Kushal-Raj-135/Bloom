let aqiChart;

function initializeAQIChart() {
    const ctx = document.getElementById('aqiComparisonChart');
    if (!ctx) {
        console.error('Chart canvas element not found');
        return;
    }

    // Destroy existing chart if it exists
    if (aqiChart) {
        aqiChart.destroy();
    }

    const gradientWithRecommendations = ctx.getContext('2d').createLinearGradient(0, 0, 0, 400);
    gradientWithRecommendations.addColorStop(0, 'rgba(75, 192, 192, 0.6)');
    gradientWithRecommendations.addColorStop(1, 'rgba(75, 192, 192, 0.1)');

    const gradientWithoutRecommendations = ctx.getContext('2d').createLinearGradient(0, 0, 0, 400);
    gradientWithoutRecommendations.addColorStop(0, 'rgba(255, 99, 132, 0.6)');
    gradientWithoutRecommendations.addColorStop(1, 'rgba(255, 99, 132, 0.1)');

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const withRecommendationsData = generateSampleData(true);
    const withoutRecommendationsData = generateSampleData(false);

    aqiChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: months,
            datasets: [
                {
                    label: 'Following Recommendations',
                    data: withRecommendationsData,
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: gradientWithRecommendations,
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Without Recommendations',
                    data: withoutRecommendationsData,
                    borderColor: 'rgb(255, 99, 132)',
                    backgroundColor: gradientWithoutRecommendations,
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: {
                            size: 14
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    titleColor: '#333',
                    bodyColor: '#666',
                    borderColor: '#ddd',
                    borderWidth: 1,
                    padding: 12,
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
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        callback: function(value) {
                            return value + ' AQI';
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

function generateSampleData(isWithRecommendations) {
    const baseValue = isWithRecommendations ? 80 : 120;
    const variance = isWithRecommendations ? 20 : 30;
    const seasonalEffect = isWithRecommendations ? 10 : 25;
    
    return Array.from({ length: 12 }, (_, i) => {
        const seasonal = Math.sin((i / 11) * Math.PI * 2) * seasonalEffect;
        const random = (Math.random() - 0.5) * variance;
        return Math.max(30, Math.min(200, baseValue + seasonal + random));
    });
}

function updateChartData(formData) {
    if (!aqiChart) {
        console.error('Chart not initialized');
        return;
    }

    const followingRecommendations = formData.get('followRecommendations') === 'yes';
    const cropType = formData.get('cropType');
    
    // Generate new data based on form inputs
    const newData = generateSampleData(followingRecommendations);
    
    // Update the first dataset (Following Recommendations)
    aqiChart.data.datasets[0].data = followingRecommendations ? newData : generateSampleData(true);
    
    // Update the second dataset (Without Recommendations)
    aqiChart.data.datasets[1].data = !followingRecommendations ? newData : generateSampleData(false);
    
    aqiChart.update('active');
}

// Initialize the chart when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Wait for a short delay to ensure all elements are properly loaded
    setTimeout(initializeAQIChart, 100);
});

// Handle form submission
document.getElementById('cropForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const formData = new FormData(this);
    updateChartData(formData);
});