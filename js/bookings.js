import TravelAPI from '../booking-api.js';
import { formatDate, formatTime, formatDuration } from './utils.js';

class BookingsManager {
    constructor() {
        this.travelAPI = new TravelAPI();
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', () => this.switchTab(button.dataset.tab));
        });

        document.querySelectorAll('.search-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const tabId = e.target.closest('.tab-content').id;
                if (tabId === 'hotels') {
                    this.searchHotels();
                } else if (tabId === 'flights') {
                    this.searchFlights();
                }
            });
        });
    }

    switchTab(tabId) {
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.add('hidden'));
        
        document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
        document.getElementById(tabId).classList.remove('hidden');
    }

    async searchHotels() {
        const destination = document.querySelector('#hotels input[placeholder="Destination"]').value;
        const checkIn = document.querySelector('#hotels input[type="date"]:first-of-type').value;
        const checkOut = document.querySelector('#hotels input[type="date"]:last-of-type').value;
        const priceRange = document.getElementById('price-range').value;
        const amenities = document.getElementById('amenities').value;

        const resultsContainer = document.getElementById('hotels-results');
    }

    async searchFlights() {
        const from = document.querySelector('#flights input[placeholder="From"]').value;
        const to = document.querySelector('#flights input[placeholder="To"]').value;
        const departure = document.querySelector('#flights input[placeholder="Departure"]').value;
        const returnDate = document.querySelector('#flights input[placeholder="Return"]').value;
        const cabinClass = document.getElementById('cabin-class').value;

        const resultsContainer = document.getElementById('flights-results');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new BookingsManager();
}); 