document.addEventListener('DOMContentLoaded', function() {
    const ctx = document.getElementById('myChart').getContext('2d');

    // Create gradient fills
    const traditionalGradient = ctx.createLinearGradient(0, 0, 0, 400);
    traditionalGradient.addColorStop(0, 'rgba(0, 229, 190, 0.8)');
    traditionalGradient.addColorStop(1, 'rgba(0, 229, 190, 0.2)');

    const bioBloomGradient = ctx.createLinearGradient(0, 0, 0, 400);
    bioBloomGradient.addColorStop(0, 'rgba(77, 166, 255, 0.8)');
    bioBloomGradient.addColorStop(1, 'rgba(77, 166, 255, 0.2)');

    // Comparison metrics
    const metrics = [
        'Crop Yield',
        'Water Efficiency',
        'Soil Health',
        'Pest Resistance',
        'Growth Rate',
        'Resource Optimization'
    ];

    // Data for both solutions
    const traditionalData = [50, 75, 25, 77, 53, 65];
    const bioBloomData = [100, 92, 48, 78, 95, 88];

    // Create custom horizontal bar chart
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: metrics,
            datasets: [
                {
                    label: 'Traditional Farming',
                    data: traditionalData,
                    backgroundColor: traditionalGradient,
                    borderRadius: 20,
                    barPercentage: 0.8,
                    hoverBackgroundColor: '#00e5be',
                    borderWidth: 2,
                    borderColor: 'rgba(0, 229, 190, 0.6)',
                },
                {
                    label: 'BioBloom Solutions',
                    data: bioBloomData,
                    backgroundColor: bioBloomGradient,
                    borderRadius: 20,
                    barPercentage: 0.8,
                    hoverBackgroundColor: '#4da6ff',
                    borderWidth: 2,
                    borderColor: 'rgba(77, 166, 255, 0.6)',
                }
            ]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: {
                    left: 20,
                    right: 20
                }
            },
            animation: {
                duration: 2000,
                easing: 'easeInOutQuart',
                delay: (context) => context.dataIndex * 100
            },
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'COMPARISON PRODUCTS',
                    color: '#333',
                    font: {
                        size: 20,
                        weight: 'bold',
                        family: "'Poppins', sans-serif"
                    },
                    padding: {
                        bottom: 30
                    }
                },
                tooltip: {
                    enabled: true,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    titleColor: '#333',
                    bodyColor: '#666',
                    titleFont: {
                        size: 14,
                        weight: 'bold',
                        family: "'Poppins', sans-serif"
                    },
                    bodyFont: {
                        size: 13,
                        family: "'Poppins', sans-serif"
                    },
                    padding: 12,
                    boxPadding: 6,
                    borderColor: 'rgba(0,0,0,0.1)',
                    borderWidth: 1,
                    displayColors: true,
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.parsed.x}%`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    max: 100,
                    grid: {
                        display: false
                    },
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        },
                        font: {
                            family: "'Poppins', sans-serif"
                        }
                    }
                },
                y: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            family: "'Poppins', sans-serif",
                            weight: '500'
                        }
                    }
                }
            },
            transitions: {
                active: {
                    animation: {
                        duration: 400
                    }
                }
            },
            hover: {
                mode: 'nearest',
                intersect: false,
                animationDuration: 400
            }
        }
    });

    // Add custom legend with animation
    const legendContainer = document.createElement('div');
    legendContainer.className = 'comparison-legend';
    legendContainer.innerHTML = `
        <div class="legend-item">
            <div class="legend-color" style="background: linear-gradient(to right, rgba(0, 229, 190, 0.8), rgba(0, 229, 190, 0.2))"></div>
            <div class="legend-label">Traditional Farming</div>
        </div>
        <div class="legend-item">
            <div class="legend-color" style="background: linear-gradient(to right, rgba(77, 166, 255, 0.8), rgba(77, 166, 255, 0.2))"></div>
            <div class="legend-label">BioBloom Solutions</div>
        </div>
    `;
    document.querySelector('.graph-container').appendChild(legendContainer);
}); 