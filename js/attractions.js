import TravelAPI from '../booking-api.js';
import { formatDate } from './utils.js';

class AttractionsExplorer {
    constructor() {
        this.travelAPI = new TravelAPI();
        this.setupEventListeners();
        this.initializeMap();
    }

    setupEventListeners() {
        document.getElementById('search-btn').addEventListener('click', () => this.searchAttractions());
        document.getElementById('attraction-type').addEventListener('change', () => this.filterAttractions());
        document.getElementById('location-search').addEventListener('input', (e) => this.handleLocationSearch(e));
    }

    async initializeMap() {
        // Initialize Google Maps
        try {
            const mapElement = document.getElementById('map');
            this.map = new google.maps.Map(mapElement, {
                center: { lat: 0, lng: 0 },
                zoom: 2
            });
        } catch (error) {
            console.error('Error initializing map:', error);
        }
    }

    async handleLocationSearch(event) {
        const query = event.target.value;
        // Add location search logic here
    }

    async searchAttractions() {
        const locationInput = document.getElementById('location-search');
        const location = locationInput.value;
        const type = document.getElementById('attraction-type').value;
        const attractionsList = document.getElementById('attractions-list');

        try {
            // Geocode the location
            const geocodeData = await this.geocodeAddress(location);

            if (!geocodeData || !geocodeData.results || geocodeData.results.length === 0) {
                throw new Error('Unable to geocode the location.');
            }

            const { lat, lng } = geocodeData.results[0].geometry.location;
            console.log('Coordinates:', lat, lng);

            // Search for nearby attractions using the Google Maps Places API
            const nearbyAttractions = await this.findNearbyAttractions(lat, lng, type);

            // Display the attractions
            this.displayAttractions(nearbyAttractions);

        } catch (error) {
            console.error('Error searching attractions:', error);
            attractionsList.innerHTML = `<p class="error">${error.message}</p>`;
        }
    }

    filterAttractions() {
        const type = document.getElementById('attraction-type').value;
        // Add filtering logic here
    }

    displayAttractions(attractions) {
        const attractionsList = document.getElementById('attractions-list');
        attractionsList.innerHTML = ''; // Clear previous results

        if (!attractions || attractions.length === 0) {
            attractionsList.innerHTML = '<p>No attractions found.</p>';
            return;
        }

        attractions.forEach(attraction => {
            const attractionElement = document.createElement('div');
            attractionElement.classList.add('attraction-item');
            attractionElement.innerHTML = `
                <h3>${attraction.name}</h3>
                <p>${attraction.vicinity}</p>
                <p>Rating: ${attraction.rating || 'Not rated'}</p>
            `;
            attractionsList.appendChild(attractionElement);
        });
    }

    async geocodeAddress(address) {
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        const geocoder = new google.maps.Geocoder();

        try {
            return new Promise((resolve, reject) => {
                geocoder.geocode({ 'address': address }, (results, status) => {
                    if (status === 'OK') {
                        resolve({ results });
                    } else {
                        reject(new Error('Geocode was not successful for the following reason: ' + status));
                    }
                });
            });
        } catch (error) {
            console.error('Geocoding error:', error);
            throw error;
        }
    }

    async findNearbyAttractions(latitude, longitude, type = 'tourist_attraction') {
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        let placesType = type === 'all' ? 'tourist_attraction' : type;
        const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=1500&type=${placesType}&key=${apiKey}`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data.results;
        } catch (error) {
            console.error('Places API error:', error);
            throw error;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new AttractionsExplorer();
});

async function fetchAttractionsAndSendData() {
    try {
        const apiKey = import.meta.env.VITE_TRIPADVISOR_API_KEY;
        const url = `/api/v1/location/search?key=${apiKey}&category=attractions&language=en&limit=10`; // Adjust URL as needed

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        // Send data to server-side endpoint
        await sendDataToServer(data);
    } catch (error) {
        console.error('Error fetching or sending attractions data:', error);
    }
}

async function sendDataToServer(data) {
    try {
        const response = await fetch('/api/save-attractions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        console.log('Attractions data sent to server successfully.');
    } catch (error) {
        console.error('Error sending attractions data to server:', error);
    }
}

// Call the function to fetch and send data
fetchAttractionsAndSendData(); 