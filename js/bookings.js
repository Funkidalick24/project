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
    }

    switchTab(tabId) {
        // Remove active class from all tabs and content
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.add('hidden'));
        
        // Add active class to selected tab and show content
        document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
        document.getElementById(tabId).classList.remove('hidden');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new BookingsManager();
}); 