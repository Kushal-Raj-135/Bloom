function initializeMap() {
    // Initialize map with Bangalore as default view
    const map = L.map('farm-map', {
        zoomControl: false
    }).setView([12.9716, 77.5946], 13);
    
    // Add base layers
    const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    
    const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '© Esri'
    });

    // Drawing controls
    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

    const drawControl = new L.Control.Draw({
        draw: {
            polygon: {
                allowIntersection: false,
                showArea: true
            },
            circle: false,
            circlemarker: false,
            marker: false,
            polyline: false,
            rectangle: false
        },
        edit: {
            featureGroup: drawnItems
        }
    });
    map.addControl(drawControl);

    map.on(L.Draw.Event.CREATED, function (e) {
        drawnItems.addLayer(e.layer);
    });

    // Current location functionality (map controls)
    document.getElementById('current-location')?.addEventListener('click', () => {
        getAndCenterOnCurrentLocation(map);
    });

    // Current location functionality (search bar)
    document.getElementById('search-current-location')?.addEventListener('click', (e) => {
        e.preventDefault();
        getAndCenterOnCurrentLocation(map);
    });

    // Satellite toggle
    let satelliteOn = false;
    document.getElementById('toggle-satellite')?.addEventListener('click', () => {
        if (satelliteOn) {
            map.removeLayer(satelliteLayer);
            osmLayer.addTo(map);
        } else {
            map.removeLayer(osmLayer);
            satelliteLayer.addTo(map);
        }
        satelliteOn = !satelliteOn;
    });

    // Fullscreen toggle
    document.getElementById('toggle-fullscreen')?.addEventListener('click', () => {
        const mapContainer = document.getElementById('farm-map');
        if (!document.fullscreenElement) {
            mapContainer.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    });

    // Location search autocomplete
    const searchInput = document.getElementById('location-search');
    const searchResults = document.querySelector('.search-results');
    let searchTimeout;
    searchInput?.addEventListener('input', function () {
        const query = this.value.trim();
        if (searchTimeout) clearTimeout(searchTimeout);
        if (query.length < 2) {
            searchResults.innerHTML = '';
            return;
        }
        searchTimeout = setTimeout(() => {
            fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5&countrycodes=in`)
                .then(res => res.json())
                .then(data => {
                    searchResults.innerHTML = '';
                    if (data.length === 0) {
                        searchResults.innerHTML = '<div style="padding:5px;">No results found</div>';
                        return;
                    }
                    data.forEach(place => {
                        const div = document.createElement('div');
                        div.className = 'search-result-item';
                        div.textContent = place.display_name;
                        div.style.cursor = 'pointer';
                        div.style.padding = '5px';
                        div.addEventListener('click', () => {
                            map.setView([place.lat, place.lon], 15);
                            L.marker([place.lat, place.lon]).addTo(map).bindPopup(place.display_name).openPopup();
                            searchResults.innerHTML = '';
                            searchInput.value = place.display_name;
                        });
                        searchResults.appendChild(div);
                    });
                });
        }, 300);
    });
}

function getAndCenterOnCurrentLocation(map) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            map.setView([latitude, longitude], 16);
            L.marker([latitude, longitude]).addTo(map).bindPopup('Your location').openPopup();
        }, error => {
            alert('Unable to retrieve your location.');
        });
    } else {
        alert('Geolocation is not supported by your browser.');
    }
}

document.addEventListener('DOMContentLoaded', initializeMap); 