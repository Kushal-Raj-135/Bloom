let comparisonChart; // ✅ Declare globally

document.addEventListener('DOMContentLoaded', function () {
    const ctx = document.getElementById('myChart').getContext('2d');

    // ✅ Destroy previous chart if it exists
    if (comparisonChart) {
        comparisonChart.destroy();
    }

    const traditionalGradient = ctx.createLinearGradient(0, 0, 0, 400);
    traditionalGradient.addColorStop(0, 'rgba(0, 229, 190, 0.8)');
    traditionalGradient.addColorStop(1, 'rgba(0, 229, 190, 0.2)');

    const bioBloomGradient = ctx.createLinearGradient(0, 0, 0, 400);
    bioBloomGradient.addColorStop(0, 'rgba(77, 166, 255, 0.8)');
    bioBloomGradient.addColorStop(1, 'rgba(77, 166, 255, 0.2)');

    const metrics = [
        'Crop Yield', 'Water Efficiency', 'Soil Health',
        'Pest Resistance', 'Growth Rate', 'Resource Optimization'
    ];
    const traditionalData = [50, 75, 25, 77, 53, 65];
    const bioBloomData = [100, 92, 48, 78, 95, 88];

    // ✅ Save chart instance to variable
    comparisonChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: metrics,
            datasets: [
                {
                    label: 'Traditional Farming',
                    data: traditionalData,
                    backgroundColor: traditionalGradient,
                    borderRadius: 20,
                    borderWidth: 2,
                    borderColor: 'rgba(0, 229, 190, 0.6)',
                    hoverBackgroundColor: '#00e5be'
                },
                {
                    label: 'BioBloom Solutions',
                    data: bioBloomData,
                    backgroundColor: bioBloomGradient,
                    borderRadius: 20,
                    borderWidth: 2,
                    borderColor: 'rgba(77, 166, 255, 0.6)',
                    hoverBackgroundColor: '#4da6ff'
                }
            ]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                title: {
                    display: true,
                    text: 'COMPARISON PRODUCTS',
                    font: {
                        size: 20,
                        weight: 'bold',
                        family: "'Poppins', sans-serif"
                    },
                    padding: { bottom: 30 },
                    color: '#333'
                },
                tooltip: {
                    enabled: true,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    titleColor: '#333',
                    bodyColor: '#666',
                    borderColor: 'rgba(0,0,0,0.1)',
                    borderWidth: 1,
                    callbacks: {
                        label: function (context) {
                            return `${context.dataset.label}: ${context.parsed.x}%`;
                        }
                    }
                }
            },
            animation: {
                duration: 2000,
                easing: 'easeInOutQuart',
                delay: (ctx) => ctx.dataIndex * 100
            },
            scales: {
                x: {
                    beginAtZero: true,
                    max: 100,
                    grid: { display: false },
                    ticks: {
                        callback: value => value + '%',
                        font: { family: "'Poppins', sans-serif" }
                    }
                },
                y: {
                    grid: { display: false },
                    ticks: {
                        font: {
                            family: "'Poppins', sans-serif",
                            weight: '500'
                        }
                    }
                }
            }
        }
    });

    // Custom legend (only add once to avoid duplicates)
    const legendExists = document.querySelector('.comparison-legend');
    if (!legendExists) {
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
    }
});
