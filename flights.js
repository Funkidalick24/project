import TravelAPI from './booking-api.js';

class FlightSearch {
    constructor() {
        this.travelAPI = new TravelAPI();
        this.setupEventListeners();
        this.setupDateConstraints();
        this.setupDefaultValues();
    }

    setupEventListeners() {
        const form = document.getElementById('flight-search-form');
        const originInput = document.getElementById('origin-display');
        const destinationInput = document.getElementById('destination-display');

        form.addEventListener('submit', this.handleSearch.bind(this));
        originInput.addEventListener('input', this.handleAirportSearch.bind(this, 'origin'));
        destinationInput.addEventListener('input', this.handleAirportSearch.bind(this, 'destination'));
    }

    setupDateConstraints() {
        const departureDate = document.getElementById('departure-date');
        const returnDate = document.getElementById('return-date');
        
        // Set minimum date to today
        const today = new Date().toISOString().split('T')[0];
        departureDate.min = today;
        returnDate.min = today;

        // Update return date min when departure date changes
        departureDate.addEventListener('change', () => {
            returnDate.min = departureDate.value;
            if (returnDate.value && returnDate.value < departureDate.value) {
                returnDate.value = departureDate.value;
            }
        });
    }

    setupDefaultValues() {
        // Set default values for testing
        document.getElementById('origin').value = 'SYD';
        document.getElementById('origin-display').value = 'Sydney Airport';
        document.getElementById('destination').value = 'BKK';
        document.getElementById('destination-display').value = 'Suvarnabhumi Airport';
        
        // Set tomorrow's date as default
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        document.getElementById('departure-date').value = tomorrow.toISOString().split('T')[0];
    }

    async handleAirportSearch(type, event) {
        const input = event.target;
        const suggestionsContainer = document.getElementById(`${type}-suggestions`);
        
        if (input.value.length < 2) {
            suggestionsContainer.classList.remove('active');
            return;
        }

        try {
            const airports = await this.travelAPI.searchAirports(input.value);
            this.displayAirportSuggestions(airports, type);
        } catch (error) {
            console.error('Error searching airports:', error);
        }
    }

    displayAirportSuggestions(airports, type) {
        const container = document.getElementById(`${type}-suggestions`);
        if (!airports || !airports.groups || airports.total === 0) {
            container.classList.remove('active');
            return;
        }

        container.innerHTML = Object.entries(airports.groups)
            .map(([groupType, groupAirports]) => `
                <div class="suggestion-group">
                    <div class="suggestion-group-header">
                        <span class="group-icon">${this.getAirportIcon(groupType)}</span>
                        <span class="group-name">${this.formatAirportType(groupType)}</span>
                        <span class="group-count">${groupAirports.length}</span>
                    </div>
                    ${groupAirports.map(airport => `
                        <div class="suggestion-item" data-code="${airport.code}" data-name="${airport.name}">
                            <div class="suggestion-main">
                                <span class="airport-name">${airport.name}</span>
                                <span class="airport-code">${airport.code}</span>
                            </div>
                            <div class="suggestion-sub">
                                <span class="airport-location">${airport.location.city}, ${airport.location.country}</span>
                                ${airport.elevation ? `<span class="airport-elevation">${airport.elevation}ft</span>` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            `).join('');

        container.classList.add('active');

        // Add click handlers
        container.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                const input = document.getElementById(type);
                const displayInput = document.getElementById(`${type}-display`);
                
                // Store the code in a hidden input
                input.value = item.dataset.code;
                // Show the full name in the visible input
                displayInput.value = item.dataset.name;
                
                input.dataset.selected = 'true';
                container.classList.remove('active');
            });
        });

        // Add keyboard navigation
        this.setupKeyboardNavigation(container, type);
    }

    setupKeyboardNavigation(container, inputType) {
        const input = document.getElementById(inputType);
        let selectedIndex = -1;

        input.addEventListener('keydown', (e) => {
            const items = container.querySelectorAll('.suggestion-item');
            
            switch(e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
                    this.updateSelection(items, selectedIndex);
                    break;
                    
                case 'ArrowUp':
                    e.preventDefault();
                    selectedIndex = Math.max(selectedIndex - 1, -1);
                    this.updateSelection(items, selectedIndex);
                    break;
                    
                case 'Enter':
                    e.preventDefault();
                    if (selectedIndex >= 0) {
                        items[selectedIndex].click();
                    }
                    break;
                    
                case 'Escape':
                    container.classList.remove('active');
                    input.blur();
                    break;
            }
        });
    }

    updateSelection(items, index) {
        items.forEach(item => item.classList.remove('selected'));
        if (index >= 0) {
            items[index].classList.add('selected');
            items[index].scrollIntoView({ block: 'nearest' });
        }
    }

    validateForm() {
        const origin = document.getElementById('origin');
        const originDisplay = document.getElementById('origin-display');
        const destination = document.getElementById('destination');
        const destinationDisplay = document.getElementById('destination-display');
        const departureDate = document.getElementById('departure-date');

        if (!originDisplay.value || !destinationDisplay.value || !departureDate.value) {
            throw new Error('Please fill in all required fields');
        }

        if (origin.value === destination.value) {
            throw new Error('Origin and destination cannot be the same');
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const selectedDate = new Date(departureDate.value);
        if (selectedDate < today) {
            throw new Error('Departure date cannot be in the past');
        }
    }

    async handleSearch(event) {
        event.preventDefault();
        
        try {
            this.validateForm();
            
            const searchParams = {
                origin: document.getElementById('origin').value.toUpperCase(),
                destination: document.getElementById('destination').value.toUpperCase(),
                departureDate: document.getElementById('departure-date').value,
                returnDate: document.getElementById('return-date').value,
                adults: document.getElementById('passengers').value,
                nonStop: document.getElementById('non-stop')?.checked || false,
                max: 250
            };

            const resultsContainer = document.querySelector('.results-container');
            const loadingSpinner = document.querySelector('.loading-spinner');

            loadingSpinner.classList.remove('hidden');
            resultsContainer.innerHTML = '';

            const flights = await this.travelAPI.searchFlights(searchParams);
            this.displayFlightResults(flights);
        } catch (error) {
            console.error('Error searching flights:', error);
            document.querySelector('.results-container').innerHTML = `
                <div class="error-message">
                    <h3>Error Finding Flights</h3>
                    <p>${error.message}</p>
                </div>`;
        } finally {
            document.querySelector('.loading-spinner').classList.add('hidden');
        }
    }

    displayFlightResults(flights) {
        const container = document.querySelector('.results-container');
        
        if (!flights.data || flights.data.length === 0) {
            container.innerHTML = '<div class="no-results">No flights found for your search criteria</div>';
            return;
        }

        container.innerHTML = flights.data.map(flight => `
            <div class="flight-card">
                <div class="flight-details">
                    ${flight.itineraries.map(itinerary => `
                        <div class="itinerary">
                            <div class="itinerary-header">
                                ${flight.itineraries.length > 1 ? (itinerary === flight.itineraries[0] ? 'Outbound' : 'Return') : 'Flight'} · ${this.formatDuration(itinerary.duration)}
                            </div>
                            ${itinerary.segments.map(segment => `
                                <div class="segment">
                                    <div class="segment-header">
                                        <span class="carrier">${flight.carriers[segment.carrier] || segment.carrier}</span>
                                        <span class="flight-number">Flight ${segment.flightNumber}</span>
                                    </div>
                                    <div class="segment-details">
                                        <div class="departure">
                                            <div class="time">
                                                ${this.formatTime(segment.departure.time)}
                                            </div>
                                            <div class="airport">
                                                ${segment.departure.airport}
                                                ${segment.departure.terminal ? ` · Terminal ${segment.departure.terminal}` : ''}
                                            </div>
                                            <div class="date">${this.formatDate(segment.departure.time)}</div>
                                        </div>
                                        <div class="flight-duration">
                                            <div class="duration-line"></div>
                                            <div class="duration-text">${this.formatDuration(segment.duration)}</div>
                                            ${segment.stops ? `<div class="stops">${segment.stops} stop${segment.stops > 1 ? 's' : ''}</div>` : ''}
                                        </div>
                                        <div class="arrival">
                                            <div class="time">
                                                ${this.formatTime(segment.arrival.time)}
                                            </div>
                                            <div class="airport">
                                                ${segment.arrival.airport}
                                                ${segment.arrival.terminal ? ` · Terminal ${segment.arrival.terminal}` : ''}
                                            </div>
                                            <div class="date">${this.formatDate(segment.arrival.time)}</div>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    `).join('')}
                </div>
                <div class="price-section">
                    <div class="seats-available">${flight.numberOfBookableSeats} seats left</div>
                    <div class="price">${flight.price.currency} ${flight.price.amount}</div>
                    <button class="book-button" data-flight-id="${flight.id}">Book Now</button>
                    <div class="valid-until">Valid until ${this.formatDate(flight.validUntil)}</div>
                </div>
            </div>
        `).join('');

        // Add click handlers for book buttons
        container.querySelectorAll('.book-button').forEach(button => {
            button.addEventListener('click', () => {
                const flightId = button.dataset.flightId;
                this.handleBooking(flightId);
            });
        });
    }

    async handleBooking(flightId) {
        try {
            const bookingResult = await this.travelAPI.bookFlight(flightId);
            alert(`Booking successful! Confirmation code: ${bookingResult.confirmationCode}`);
        } catch (error) {
            console.error('Booking failed:', error);
            alert(`Booking failed: ${error.message}`);
        }
    }

    // Helper methods for formatting
    formatTime(dateString) {
        return new Date(dateString).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit'
        });
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString([], {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    }

    formatDuration(duration) {
        return duration.replace('PT', '')
            .replace('H', 'h ')
            .replace('M', 'm')
            .toLowerCase();
    }

    // Helper method to get appropriate icon for airport type
    getAirportIcon(type) {
        const icons = {
            'airport': '✈️',
            'heliport': '🚁',
            'seaplane_base': '🛥️',
            'balloonport': '🎈',
            'closed': '⛔'
        };
        return icons[type] || '✈️';
    }

    formatAirportType(type) {
        const formats = {
            'airport': 'Airports',
            'heliport': 'Heliports',
            'seaplane_base': 'Seaplane Bases',
            'balloonport': 'Balloon Ports',
            'closed': 'Closed Airports'
        };
        return formats[type] || type;
    }
}

// Initialize the flight search when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new FlightSearch();
}); 