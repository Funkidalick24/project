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

    async searchAttractions() {
        // Add your attraction search logic here
    }

    filterAttractions() {
        // Add your filtering logic here
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new AttractionsExplorer();
}); 