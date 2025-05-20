// Language options with their native names
const languageOptions = {
    'en': 'English',
    'hi': 'हिन्दी',
    'ta': 'தமிழ்',
    'te': 'తెలుగు',
    'kn': 'ಕನ್ನಡ',
    'ml': 'മലയാളം',
    'mr': 'मराठी',
    'gu': 'ગુજરાતી',
    'pa': 'ਪੰਜਾਬੀ',
    'bn': 'বাংলা'
};

// Current selected language
let currentLanguage = localStorage.getItem('selectedLanguage') || 'en';

// Translation cache
const translationCache = {};

// Function to translate text using the translator.py backend
async function translateText(text, targetLanguage, toEnglish = false) {
    if (targetLanguage === 'en' && !toEnglish) return text;
    
    const cacheKey = `${text}_${targetLanguage}_${toEnglish}`;
    if (translationCache[cacheKey]) {
        return translationCache[cacheKey];
    }

    try {
        console.log(`Translating text ${toEnglish ? 'to English' : 'from English'}:`, text.substring(0, 50) + '...');
        
        const response = await fetch('/api/translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: text,
                target_language: targetLanguage,
                to_english: toEnglish
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Translation API error:', errorData);
            throw new Error(`Translation failed: ${errorData.error}`);
        }

        const data = await response.json();
        console.log('Translation successful:', data.translated_text.substring(0, 50) + '...');
        
        if (data.translated_text) {
            translationCache[cacheKey] = data.translated_text;
            return data.translated_text;
        } else {
            throw new Error('No translation returned');
        }
    } catch (error) {
        console.error('Translation error:', error);
        return text;
    }
}

// Function to update all text content
async function updateLanguage(newLanguage) {
    console.log('Updating language to:', newLanguage);
    currentLanguage = newLanguage;
    localStorage.setItem('selectedLanguage', newLanguage);

    try {
        // Translate all visible text elements
        const textElements = document.querySelectorAll('[data-translate]');
        for (const element of textElements) {
            const originalText = element.getAttribute('data-original-text') || element.textContent;
            element.setAttribute('data-original-text', originalText);
            
            const translatedText = await translateText(originalText, newLanguage);
            element.textContent = translatedText;
        }

        // Translate form labels and options
        const labels = document.querySelectorAll('label');
        for (const label of labels) {
            const originalText = label.getAttribute('data-original-text') || label.textContent;
            label.setAttribute('data-original-text', originalText);
            label.textContent = await translateText(originalText, newLanguage);
        }

        // Translate select options
        const selects = document.querySelectorAll('select');
        for (const select of selects) {
            for (const option of select.options) {
                const originalText = option.getAttribute('data-original-text') || option.text;
                option.setAttribute('data-original-text', originalText);
                option.text = await translateText(originalText, newLanguage);
            }
        }
    } catch (error) {
        console.error('Error updating language:', error);
    }
}

// Import API functions
import { api } from './api.js';

// Function to handle crop recommendations form submission
async function handleRecommendationsSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitButton = form.querySelector('button[type="submit"]');
    const resultsContainer = document.getElementById('recommendations-results');
    
    try {
        // Show loading state
        submitButton.disabled = true;
        submitButton.textContent = 'Getting Recommendations...';
        resultsContainer.innerHTML = '<div class="loading">Loading recommendations...</div>';

        // Get form data
        const formData = {
            previousCrop: form.previousCrop.value,
            soilType: form.soilType.value,
            region: form.region.value,
            farmSize: parseFloat(form.farmSize.value)
        };

        // Get recommendations from API
        const recommendations = await api.getRecommendations(formData);

        // Display results
        displayRecommendations(recommendations);
    } catch (error) {
        console.error('Error getting recommendations:', error);
        resultsContainer.innerHTML = `
            <div class="error-message">
                Failed to get recommendations. Please try again.
            </div>
        `;
    } finally {
        // Reset button state
        submitButton.disabled = false;
        submitButton.textContent = 'Get Recommendations';
    }
}

// Function to display recommendations
function displayRecommendations(data) {
    const resultsContainer = document.getElementById('recommendations-results');
    
    const recommendationsHTML = `
        <div class="recommendations-container">
            <h3>Recommended Crops</h3>
            <div class="crops-grid">
                ${data.recommendedCrops.map(crop => `
                    <div class="crop-card">
                        <h4>${crop.name}</h4>
                        <div class="confidence">Confidence: ${(crop.confidence * 100).toFixed(1)}%</div>
                        <ul class="reasons">
                            ${crop.reasons.map(reason => `<li>${reason}</li>`).join('')}
                        </ul>
                    </div>
                `).join('')}
            </div>

            <div class="soil-health">
                <h3>Soil Health Analysis</h3>
                <div class="soil-grid">
                    <div class="soil-item">
                        <span class="label">pH Level:</span>
                        <span class="value">${data.soilHealth.pH}</span>
                    </div>
                    <div class="soil-item">
                        <span class="label">Nitrogen:</span>
                        <span class="value">${data.soilHealth.nitrogen}</span>
                    </div>
                    <div class="soil-item">
                        <span class="label">Phosphorus:</span>
                        <span class="value">${data.soilHealth.phosphorus}</span>
                    </div>
                    <div class="soil-item">
                        <span class="label">Potassium:</span>
                        <span class="value">${data.soilHealth.potassium}</span>
                    </div>
                </div>
            </div>

            <div class="weather-forecast">
                <h3>Weather Forecast</h3>
                <div class="weather-grid">
                    <div class="weather-item">
                        <span class="label">Temperature:</span>
                        <span class="value">${data.weatherForecast.temperature}</span>
                    </div>
                    <div class="weather-item">
                        <span class="label">Rainfall:</span>
                        <span class="value">${data.weatherForecast.rainfall}</span>
                    </div>
                    <div class="weather-item">
                        <span class="label">Humidity:</span>
                        <span class="value">${data.weatherForecast.humidity}</span>
                    </div>
                </div>
            </div>
        </div>
    `;

    resultsContainer.innerHTML = recommendationsHTML;
}

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
    const ctx = document.getElementById('myChart');
    
    if (!ctx) {
        console.error('Could not find chart canvas');
        return;
    }

    // Data for the chart
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const withoutBioBloom = [175, 180, 170, 185, 165, 175, 180, 170, 175, 180, 170, 175];
    const withBioBloom = [85, 90, 80, 95, 75, 85, 90, 80, 85, 90, 80, 85];

    // Create the chart
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: months,
            datasets: [
                {
                    label: 'Without BioBloom',
                    data: withoutBioBloom,
                    borderColor: '#ff6b6b',
                    backgroundColor: 'rgba(255, 107, 107, 0.1)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 3
                },
                {
                    label: 'With BioBloom',
                    data: withBioBloom,
                    borderColor: '#51cf66',
                    backgroundColor: 'rgba(81, 207, 102, 0.1)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 3
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        padding: 20,
                        font: {
                            size: 14
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 200,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    title: {
                        display: true,
                        text: 'AQI Level'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
}

// Initialize AQI Gauge
function initAQIGauge() {
    const gaugeElement = document.getElementById('aqi-gauge');
    if (!gaugeElement) return null;

    // Check if JustGage is available
    if (typeof JustGage === 'undefined') {
        console.warn('JustGage library not loaded. AQI gauge will not be displayed.');
        return null;
    }

    try {
        return new JustGage({
            id: 'aqi-gauge',
            value: 0,
            min: 0,
            max: 300,
            title: 'Current AQI',
            label: 'AQI Value',
            levelColors: ['#009966', '#ffde33', '#ff9933', '#cc0033', '#660099'],
            customSectors: {
                percents: false,
                ranges: [
                    { color: '#009966', lo: 0, hi: 50 },
                    { color: '#ffde33', lo: 51, hi: 100 },
                    { color: '#ff9933', lo: 101, hi: 150 },
                    { color: '#cc0033', lo: 151, hi: 200 },
                    { color: '#660099', lo: 201, hi: 300 }
                ]
            },
            counter: true,
            pointer: true,
            pointerOptions: {
                toplength: -15,
                bottomlength: 10,
                bottomwidth: 12,
                color: '#8e8e93',
                stroke: '#ffffff',
                stroke_width: 3,
                stroke_linecap: 'round'
            }
        });
    } catch (error) {
        console.error('Error initializing AQI gauge:', error);
        return null;
    }
}

// Update AQI display
function updateAQI(aqiValue) {
    let category;
    if (aqiValue <= 50) category = 'good';
    else if (aqiValue <= 100) category = 'moderate';
    else if (aqiValue <= 150) category = 'unhealthySensitive';
    else if (aqiValue <= 200) category = 'unhealthy';
    else category = 'veryUnhealthy';

    const recommendations = aqiRecommendations[category];
    
    // Update AQI display
    const aqiNumberElement = document.getElementById('aqi-number');
    const aqiStatusElement = document.getElementById('aqi-status');
    const aqiValueElement = document.getElementById('aqi-value');
    const aqiRecommendationsElement = document.getElementById('aqi-recommendations');

    if (aqiNumberElement) {
        aqiNumberElement.textContent = aqiValue;
    }
    
    if (aqiStatusElement) {
        aqiStatusElement.textContent = recommendations.status;
        aqiStatusElement.style.color = recommendations.color;
    }
    
    if (aqiValueElement) {
        aqiValueElement.style.background = recommendations.color;
    }

    // Update gauge if it exists
    if (window.aqiGauge) {
        try {
            if (typeof window.aqiGauge.refresh === 'function') {
                window.aqiGauge.refresh(aqiValue);
            } else if (typeof window.aqiGauge.setValue === 'function') {
                window.aqiGauge.setValue(aqiValue);
            }
        } catch (error) {
            console.warn('Error updating AQI gauge:', error);
        }
    }

    // Update recommendations
    if (aqiRecommendationsElement) {
        aqiRecommendationsElement.innerHTML = recommendations.activities
            .map(activity => `<li>${activity}</li>`)
            .join('');
    }
}

document.addEventListener("DOMContentLoaded", () => {
    console.log('DOM loaded, initializing chart...');
    // Initialize AQI Chart
    initializeAQIChart();

    // Initialize AQI Gauge
    const aqiGaugeElement = document.getElementById('aqi-gauge');
    if (aqiGaugeElement) {
        window.aqiGauge = initAQIGauge();
    }

    // Set initial AQI value
    const initialAQI = Math.floor(Math.random() * (150 - 50 + 1)) + 50;
    updateAQI(initialAQI);

    // Update AQI every 5 minutes
    setInterval(() => {
        const newAQI = Math.floor(Math.random() * (150 - 50 + 1)) + 50;
        updateAQI(newAQI);
    }, 5 * 60 * 1000);

    // Update UI based on login status
    function updateUIForLoginStatus() {
        const nav = document.querySelector('nav ul');
        
        // Clear all authentication-related elements
        Array.from(nav.children).forEach(child => {
            if (child.classList.contains('user-menu') || 
                child.querySelector('a[href="login.html"]') ||
                child.querySelector('a[href="register.html"]')) {
                child.remove();
            }
        });

        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));

        if (token && user) {
            // Add user menu with profile and logout
            const userMenu = document.createElement('li');
            userMenu.className = 'user-menu';
            userMenu.innerHTML = `
                <span class="user-greeting">Welcome, ${user.name}</span>
                <div class="dropdown-content">
                    <a href="javascript:void(0)" onclick="showProfile()">Profile</a>
                    <a href="javascript:void(0)" onclick="handleLogout()">Logout</a>
                </div>
            `;
            nav.appendChild(userMenu);

            // Toggle dropdown on user greeting click
            const userGreeting = userMenu.querySelector('.user-greeting');
            userGreeting.onclick = function(e) {
                e.stopPropagation();
                const dropdown = userMenu.querySelector('.dropdown-content');
                dropdown.classList.toggle('show');
            };

            // Close dropdown when clicking outside
            document.addEventListener('click', function(e) {
                const dropdowns = document.querySelectorAll('.dropdown-content');
                dropdowns.forEach(dropdown => {
                    if (dropdown.classList.contains('show')) {
                        dropdown.classList.remove('show');
                    }
                });
            });

            // Prevent dropdown from closing when clicking inside
            const dropdown = userMenu.querySelector('.dropdown-content');
            dropdown.onclick = function(e) {
                e.stopPropagation();
            };
        } else {
            // Add login/register links
            const loginLink = document.createElement('li');
            loginLink.innerHTML = '<a href="login.html">Login</a>';
            const registerLink = document.createElement('li');
            registerLink.innerHTML = '<a href="register.html">Register</a>';
            nav.appendChild(loginLink);
            nav.appendChild(registerLink);
        }
    }

    // Handle logout
    function handleLogout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    }

    // Show profile
    function showProfile() {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) {
            window.location.href = 'login.html';
            return;
        }

        const profileModal = document.createElement('div');
        profileModal.className = 'profile-section';
        profileModal.innerHTML = `
            <div class="profile-header">
                <h2>Profile</h2>
                <div class="profile-avatar">
                    <i class="fas fa-user-circle"></i>
                </div>
            </div>
            <div class="profile-content">
                <div class="profile-info">
                    <h3>Personal Information</h3>
                    <div class="info-grid">
                        <div class="info-item">
                            <i class="fas fa-user"></i>
                            <div class="info-detail">
                                <label>Name</label>
                                <p>${user.name || 'Not set'}</p>
                            </div>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-envelope"></i>
                            <div class="info-detail">
                                <label>Email</label>
                                <p>${user.email || 'Not set'}</p>
                            </div>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-phone"></i>
                            <div class="info-detail">
                                <label>Phone</label>
                                <p>${user.phone || 'Not set'}</p>
                            </div>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-location-dot"></i>
                            <div class="info-detail">
                                <label>Location</label>
                                <p>${user.location || 'Not set'}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="profile-stats">
                    <h3>Account Information</h3>
                    <div class="info-item">
                        <i class="fas fa-calendar"></i>
                        <div class="info-detail">
                            <label>Member Since</label>
                            <p>${new Date(user.id).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="profile-actions">
                <button class="edit-btn" onclick="openEditProfile()">
                    <i class="fas fa-edit"></i> Edit Profile
                </button>
                <button class="cancel-btn" onclick="closeProfile()">
                    <i class="fas fa-times"></i> Close
                </button>
            </div>
        `;

        document.body.appendChild(profileModal);
    }

    function openEditProfile() {
        closeProfile(); // Close the profile modal
        window.location.href = 'edit-profile.html';
    }

    // Close profile
    function closeProfile() {
        const profileModal = document.querySelector('.profile-section');
        if (profileModal) {
            profileModal.remove();
        }
    }

    // Make functions globally available
    window.handleLogout = handleLogout;
    window.showProfile = showProfile;
    window.closeProfile = closeProfile;
    window.openEditProfile = openEditProfile;
    window.saveProfileChanges = function() {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            if (!user) {
                window.location.href = 'login.html';
                return;
            }

            const newName = document.getElementById('edit-name').value.trim();
            const newEmail = document.getElementById('edit-email').value.trim();
            const newPhone = document.getElementById('edit-phone').value.trim();
            const newLocation = document.getElementById('edit-location').value.trim();

            // Validate required fields
            if (!newName || !newEmail) {
                alert('Name and Email are required fields.');
                return;
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(newEmail)) {
                alert('Please enter a valid email address.');
                return;
            }

            // Update user object
            user.name = newName;
            user.email = newEmail;
            user.phone = newPhone;
            user.location = newLocation;

            // Save to localStorage
            localStorage.setItem('user', JSON.stringify(user));

            // Show success message
            showSuccessMessage('Profile updated successfully!');
            
            // Redirect back to main page after a short delay
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        } catch (error) {
            console.error('Error saving profile changes:', error);
            alert('An error occurred while saving your changes. Please try again.');
        }
    };

    window.showSuccessMessage = function(message) {
        const successPopup = document.createElement('div');
        successPopup.className = 'success-popup';
        successPopup.innerHTML = `
            <div class="success-content">
                <i class="fas fa-check-circle"></i>
                <p>${message}</p>
            </div>
        `;
        document.body.appendChild(successPopup);

        // Remove popup after 2 seconds
        setTimeout(() => {
            successPopup.remove();
        }, 2000);
    };

    // Initialize the app
    function initApp() {
        // Add language selector
        const header = document.querySelector('header .container');
        const languageSelector = document.createElement('div');
        languageSelector.className = 'language-selector';
        languageSelector.innerHTML = `
            <select id="language-select">
                ${Object.entries(languageOptions).map(([code, name]) => 
                    `<option value="${code}" ${code === currentLanguage ? 'selected' : ''}>${name}</option>`
                ).join('')}
            </select>
        `;
        header.appendChild(languageSelector);

        // Add language change listener
        document.getElementById('language-select').addEventListener('change', (e) => {
            updateLanguage(e.target.value);
        });

        // Add smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
            anchor.addEventListener("click", function (e) {
                const targetId = this.getAttribute("href");
                if (targetId === '#') return;
                
                e.preventDefault();
                const targetElement = document.querySelector(targetId);

                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 80,
                        behavior: "smooth",
                    });
                }
            });
        });

        // Initialize AQI display if elements exist
        if (document.getElementById('aqi-number')) {
            updateAQI(initialAQI);
        }

        // Update UI based on login status
        updateUIForLoginStatus();
    }

    // Initialize the app
    initApp();
});