import TravelAPI from './booking-api.js';

// Itinerary Management System
class ItineraryManager {
    constructor() {
        this.currentItinerary = null;
        this.savedItineraries = [];
        this.travelAPI = new TravelAPI();
        this.initializeEventListeners();
        this.loadSavedItineraries();
        this.addRippleEffectToButtons();
        this.initializeBookingListeners();
        this.setupAutocomplete();
    }

    initializeEventListeners() {
        // New Itinerary Button
        document.getElementById('new-itinerary').addEventListener('click', () => this.createNewItinerary());
        
        // Save Itinerary Button
        document.getElementById('save-itinerary').addEventListener('click', () => this.saveItinerary());
        
        // Share Itinerary Button
        document.getElementById('share-itinerary').addEventListener('click', () => this.shareItinerary());
        
        // Date Change Listeners
        document.getElementById('trip-start').addEventListener('change', () => this.updateDays());
        document.getElementById('trip-end').addEventListener('change', () => this.updateDays());
    }

    initializeBookingListeners() {
        document.getElementById('search-flights').addEventListener('click', () => this.searchFlights());
        document.getElementById('search-everywhere').addEventListener('click', () => this.searchEverywhereFromCity());
        document.getElementById('search-hotels').addEventListener('click', () => this.searchHotels());
    }

    createNewItinerary() {
        this.currentItinerary = {
            name: '',
            startDate: null,
            endDate: null,
            days: []
        };
        
        // Reset form
        document.getElementById('trip-name').value = '';
        document.getElementById('trip-start').value = '';
        document.getElementById('trip-end').value = '';
        document.getElementById('itinerary-days').innerHTML = '';
    }

    updateDays() {
        const startDate = new Date(document.getElementById('trip-start').value);
        const endDate = new Date(document.getElementById('trip-end').value);
        
        if (startDate && endDate && startDate <= endDate) {
            const daysContainer = document.getElementById('itinerary-days');
            daysContainer.innerHTML = '';
            
            let currentDate = new Date(startDate);
            while (currentDate <= endDate) {
                this.addDayToItinerary(currentDate);
                currentDate.setDate(currentDate.getDate() + 1);
            }
        }
    }

    addDayToItinerary(date) {
        const dayElement = document.createElement('div');
        dayElement.className = 'itinerary-day';
        dayElement.innerHTML = `
            <h3>${date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h3>
            <div class="activities">
                <button class="add-activity" data-date="${date.toISOString()}">+ Add Activity</button>
            </div>
        `;
        
        document.getElementById('itinerary-days').appendChild(dayElement);
        
        // Add Activity Button Listener
        dayElement.querySelector('.add-activity').addEventListener('click', (e) => {
            this.addActivity(e.target.dataset.date);
        });
    }

    addActivity(date) {
        const activityElement = document.createElement('div');
        activityElement.className = 'activity';
        activityElement.innerHTML = `
            <input type="time" class="activity-time">
            <input type="text" class="activity-description" placeholder="Enter activity description">
            <button class="remove-activity">×</button>
        `;
        
        const activitiesContainer = document.querySelector(`[data-date="${date}"]`).parentElement;
        activitiesContainer.insertBefore(activityElement, activitiesContainer.lastElementChild);
        
        // Remove Activity Button Listener
        activityElement.querySelector('.remove-activity').addEventListener('click', () => {
            activityElement.remove();
        });
    }

    saveItinerary() {
        const name = document.getElementById('trip-name').value;
        if (!name) {
            alert('Please enter a trip name');
            return;
        }

        const itinerary = {
            name: name,
            startDate: document.getElementById('trip-start').value,
            endDate: document.getElementById('trip-end').value,
            days: this.collectActivities()
        };

        // Save to localStorage
        const savedItineraries = JSON.parse(localStorage.getItem('itineraries') || '[]');
        savedItineraries.push(itinerary);
        localStorage.setItem('itineraries', JSON.stringify(savedItineraries));
        
        this.loadSavedItineraries();
        alert('Itinerary saved successfully!');
    }

    collectActivities() {
        const days = [];
        document.querySelectorAll('.itinerary-day').forEach(dayElement => {
            const activities = [];
            dayElement.querySelectorAll('.activity').forEach(activity => {
                activities.push({
                    time: activity.querySelector('.activity-time').value,
                    description: activity.querySelector('.activity-description').value
                });
            });
            days.push({
                date: dayElement.querySelector('h3').textContent,
                activities: activities
            });
        });
        return days;
    }

    loadSavedItineraries() {
        const savedItineraries = JSON.parse(localStorage.getItem('itineraries') || '[]');
        const listElement = document.getElementById('itinerary-list');
        listElement.innerHTML = '';
        
        savedItineraries.forEach(itinerary => {
            const li = document.createElement('li');
            li.textContent = itinerary.name;
            li.addEventListener('click', () => this.loadItinerary(itinerary));
            listElement.appendChild(li);
        });
    }

    loadItinerary(itinerary) {
        document.getElementById('trip-name').value = itinerary.name;
        document.getElementById('trip-start').value = itinerary.startDate;
        document.getElementById('trip-end').value = itinerary.endDate;
        this.updateDays();
        // TODO: Load activities for each day
    }

    shareItinerary() {
        // Implement sharing functionality (e.g., generate shareable link or export to PDF)
        alert('Sharing functionality coming soon!');
    }

    addRippleEffectToButtons() {
        const buttons = document.querySelectorAll('.primary-button, .secondary-button, .add-activity');
        buttons.forEach(button => {
            button.addEventListener('click', this.addRippleEffect);
        });
    }

    addRippleEffect(event) {
        const button = event.currentTarget;
        
        // Remove any existing ripple elements
        const ripples = button.getElementsByClassName('ripple');
        while (ripples.length > 0) {
            ripples[0].remove();
        }

        // Create new ripple element
        const ripple = document.createElement('span');
        ripple.classList.add('ripple');
        button.appendChild(ripple);

        // Get position
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = event.clientX - rect.left - size/2 + 'px';
        ripple.style.top = event.clientY - rect.top - size/2 + 'px';

        // Remove ripple after animation
        ripple.addEventListener('animationend', () => {
            ripple.remove();
        });
    }

    setupAutocomplete() {
        const fromInput = document.getElementById('flight-from');
        const toInput = document.getElementById('flight-to');
        
        this.setupCityAutocomplete(fromInput, 'from');
        this.setupCityAutocomplete(toInput, 'to');
    }

    setupCityAutocomplete(input, type) {
        let debounceTimer;
        const suggestionsContainer = document.getElementById(`${type}-suggestions`);
        const codeInput = document.getElementById(`flight-${type}-code`);

        // Wrap input in container if not already wrapped
        if (!input.parentElement.classList.contains('location-input-container')) {
            const container = document.createElement('div');
            container.className = 'location-input-container';
            input.parentNode.insertBefore(container, input);
            container.appendChild(input);
        }

        input.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            suggestionsContainer.classList.remove('active');

            const query = input.value.trim();
            if (query.length < 2) return;

            debounceTimer = setTimeout(async () => {
                try {
                    const suggestions = await this.travelAPI.getCitySuggestions(query, {
                        category: 'geos',
                        language: 'en'
                    });

                    if (!suggestions || suggestions.length === 0) {
                        suggestionsContainer.innerHTML = '<div class="no-results">No locations found</div>';
                        suggestionsContainer.classList.add('active');
                        return;
                    }

                    suggestionsContainer.innerHTML = suggestions.map(location => `
                        <div class="suggestion-item" data-id="${location.id}">
                            <div class="suggestion-main">
                                <div class="suggestion-name">
                                    ${location.name}
                                    ${location.code ? `<span class="airport-code">(${location.code})</span>` : ''}
                                </div>
                                <div class="suggestion-details">
                                    ${location.type === 'airport' ? '✈️ Airport in ' : ''}
                                    ${location.address.city ? `<span>${location.address.city}</span>` : ''}
                                    ${location.address.state ? `<span>${location.address.state}</span>` : ''}
                                    ${location.address.country ? `<span>${location.address.country}</span>` : ''}
                                </div>
                            </div>
                        </div>
                    `).join('');

                    suggestionsContainer.classList.add('active');

                    // Add click handlers for suggestions
                    suggestionsContainer.querySelectorAll('.suggestion-item').forEach(item => {
                        item.addEventListener('click', () => {
                            const selectedLocation = suggestions.find(loc => loc.id === item.dataset.id);
                            input.value = this.formatLocationName(selectedLocation);
                            codeInput.value = selectedLocation.id;
                            suggestionsContainer.classList.remove('active');
                        });
                    });

                } catch (error) {
                    console.error('Error fetching suggestions:', error);
                    suggestionsContainer.innerHTML = '<div class="error">Error fetching locations</div>';
                    suggestionsContainer.classList.add('active');
                }
            }, 300);
        });

        // Close suggestions when clicking outside
        document.addEventListener('click', (e) => {
            if (!input.contains(e.target) && !suggestionsContainer.contains(e.target)) {
                suggestionsContainer.classList.remove('active');
            }
        });
    }

    // Helper method to format location name
    formatLocationName(location) {
        const parts = [];
        
        parts.push(location.name);
        
        if (location.address.city && location.name !== location.address.city) {
            parts.push(location.address.city);
        }
        if (location.address.state) {
            parts.push(location.address.state);
        }
        if (location.address.country) {
            parts.push(location.address.country);
        }
        
        return parts.join(', ');
    }

    async searchFlights() {
        const fromCode = document.getElementById('flight-from-code').value;
        const toCode = document.getElementById('flight-to-code').value;
        const date = document.getElementById('trip-start').value;

        // Validate inputs
        if (!fromCode || fromCode.length !== 3) {
            alert('Please select a valid departure airport');
            return;
        }
        if (!toCode || toCode.length !== 3) {
            alert('Please select a valid arrival airport');
            return;
        }
        if (!date || new Date(date) < new Date()) {
            alert('Please select a valid future date');
            return;
        }

        const container = document.getElementById('flight-results');
        container.innerHTML = '<div class="loading">Searching for flights...</div>';

        try {
            const results = await this.travelAPI.searchFlights(fromCode, toCode, date);
            this.displayFlightResults(results.data);
        } catch (error) {
            console.error('Error searching flights:', error);
            container.innerHTML = `
                <div class="error">
                    <h3>No Flights Found</h3>
                    <p>${error.message || 'No flights available for this route and date.'}</p>
                    <p>Try:</p>
                    <ul>
                        <li>Different dates</li>
                        <li>Nearby airports</li>
                        <li>Different route combinations</li>
                    </ul>
                </div>`;
        }
    }

    displayFlightResults(flights) {
        const container = document.getElementById('flight-results');
        container.innerHTML = '';

        if (!flights || flights.length === 0) {
            container.innerHTML = '<div class="error">No flights found for this route and date.</div>';
            return;
        }

        flights.forEach(flight => {
            const departureTime = new Date(flight.itineraries[0].segments[0].departure.at);
            const arrivalTime = new Date(flight.itineraries[0].segments[0].arrival.at);
            
            const card = document.createElement('div');
            card.className = 'result-card';
            card.innerHTML = `
                <h4>${flight.itineraries[0].segments[0].departure.iataCode} → 
                    ${flight.itineraries[0].segments[0].arrival.iataCode}</h4>
                <p class="carrier">${flight.carrier}</p>
                <p>Departure: ${departureTime.toLocaleTimeString()}</p>
                <p>Arrival: ${arrivalTime.toLocaleTimeString()}</p>
                <p class="price">$${flight.price.total}</p>
                <button class="book-button" data-flight-id="${flight.id}">Book Flight</button>
            `;
            container.appendChild(card);
        });
    }

    async searchHotels() {
        const city = document.getElementById('hotel-city').value;
        const rating = document.getElementById('hotel-rating').value;

        if (!city) {
            alert('Please enter a city');
            return;
        }

        const container = document.getElementById('hotel-results');
        container.innerHTML = '<div class="loading">Searching for hotels...</div>';

        try {
            const results = await this.travelAPI.searchHotels(city, rating);
            this.displayHotelResults(results.data);
        } catch (error) {
            console.error('Error searching hotels:', error);
            container.innerHTML = '<div class="error">Error searching hotels. Please try again.</div>';
        }
    }

    async displayHotelResults(hotels) {
        const container = document.getElementById('hotel-results');
        container.innerHTML = '';

        if (!hotels || hotels.length === 0) {
            container.innerHTML = '<div class="error">No hotels found for this location.</div>';
            return;
        }

        hotels.forEach(hotel => {
            const card = document.createElement('div');
            card.className = 'result-card hotel-card';
            card.innerHTML = `
                <h4>${hotel.name}</h4>
                <div class="hotel-rating">
                    <span class="stars">${'★'.repeat(Math.floor(hotel.rating))}</span>
                    <span class="review-count">(${hotel.reviews.count} reviews)</span>
                </div>
                <p class="address">${hotel.address}</p>
                <div class="hotel-images">
                    ${hotel.images.slice(0, 3).map(img => 
                        `<img src="${img}" alt="${hotel.name}">`
                    ).join('')}
                </div>
                <p class="price">${hotel.price.currency} ${hotel.price.amount} per night</p>
                <div class="hotel-actions">
                    <button class="book-button" data-hotel-id="${hotel.id}">Book Now</button>
                    <button class="review-button" data-hotel-id="${hotel.id}">See Reviews</button>
                </div>
                <div class="reviews-container" id="reviews-${hotel.id}"></div>
            `;

            // Add event listeners
            const reviewButton = card.querySelector('.review-button');
            reviewButton.addEventListener('click', () => this.toggleHotelReviews(hotel.id));

            card.querySelector('.book-button').addEventListener('click', () => {
                this.showLocationDetails(hotel.id);
            });

            container.appendChild(card);
        });
    }

    async toggleHotelReviews(hotelId) {
        const reviewsContainer = document.getElementById(`reviews-${hotelId}`);
        const isHidden = !reviewsContainer.classList.contains('active');

        if (isHidden) {
            reviewsContainer.innerHTML = '<div class="loading">Loading reviews...</div>';
            reviewsContainer.classList.add('active');

            try {
                const reviews = await this.travelAPI.getLocationReviews(hotelId);
                this.displayHotelReviews(reviews, reviewsContainer);
            } catch (error) {
                reviewsContainer.innerHTML = '<div class="error">Failed to load reviews.</div>';
            }
        } else {
            reviewsContainer.classList.remove('active');
            reviewsContainer.innerHTML = '';
        }
    }

    displayHotelReviews(reviews, container) {
        if (!reviews || reviews.length === 0) {
            container.innerHTML = '<div class="no-reviews">No reviews yet.</div>';
            return;
        }

        container.innerHTML = `
            <div class="reviews-list">
                ${reviews.map(review => `
                    <div class="review-item">
                        <div class="review-header">
                            <div class="review-meta">
                                <span class="review-stars">${'★'.repeat(review.rating)}</span>
                                <span class="review-title">${review.title}</span>
                                <span class="review-date">
                                    Traveled ${review.tripType || ''} - ${new Date(review.travelDate).toLocaleDateString()}
                                </span>
                            </div>
                            <div class="reviewer-info">
                                <span class="reviewer-name">${review.user.username}</span>
                                ${review.user.userLocation ? 
                                    `<span class="reviewer-location">${review.user.userLocation}</span>` : ''}
                                <span class="reviewer-contributions">
                                    ${review.user.contributions} contributions
                                </span>
                            </div>
                        </div>

                        <p class="review-text">${review.text}</p>
                        
                        ${review.photos.length > 0 ? `
                            <div class="review-photos">
                                ${review.photos.map(photo => `
                                    <img src="${photo.url}" alt="${photo.caption || 'Review photo'}" 
                                         title="${photo.caption || ''}"
                                `).join('')}
                            </div>
                        ` : ''}

                        ${review.roomTip ? `
                            <div class="room-tip">
                                <strong>Room Tip:</strong> ${review.roomTip}
                            </div>
                        ` : ''}

                        <div class="review-footer">
                            <span class="review-date">
                                Reviewed: ${new Date(review.publishedDate).toLocaleDateString()}
                            </span>
                            <span class="helpful-votes">👍 ${review.helpful.votes}</span>
                            <span class="thanked">❤️ ${review.helpful.thanked}</span>
                        </div>

                        ${review.managementResponse ? `
                            <div class="management-response">
                                <div class="response-header">
                                    <strong>Response from management:</strong>
                                    <span class="response-date">
                                        ${new Date(review.managementResponse.date).toLocaleDateString()}
                                    </span>
                                </div>
                                <p>${review.managementResponse.text}</p>
                            </div>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
            <button class="write-review-button">Write a Review</button>
        `;

        container.querySelector('.write-review-button').addEventListener('click', () => 
            this.showReviewForm(container.closest('.hotel-card').querySelector('.book-button').dataset.hotelId)
        );
    }

    showReviewForm(hotelId) {
        const modal = document.createElement('div');
        modal.className = 'review-modal';
        modal.innerHTML = `
            <div class="review-form">
                <h3>Write a Review</h3>
                <div class="rating-input">
                    <label>Rating:</label>
                    <div class="stars-input">
                        ${[1,2,3,4,5].map(num => 
                            `<span class="star" data-rating="${num}">★</span>`
                        ).join('')}
                    </div>
                </div>
                <input type="text" placeholder="Review Title" id="review-title">
                <textarea placeholder="Your Review" id="review-text"></textarea>
                <input type="text" placeholder="Your Name" id="review-name">
                <div class="form-actions">
                    <button class="submit-review">Submit</button>
                    <button class="cancel-review">Cancel</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Add event listeners
        modal.querySelector('.cancel-review').addEventListener('click', () => modal.remove());
        
        let selectedRating = 0;
        const stars = modal.querySelectorAll('.star');
        stars.forEach(star => {
            star.addEventListener('click', (e) => {
                selectedRating = parseInt(e.target.dataset.rating);
                stars.forEach(s => s.classList.toggle('selected', 
                    parseInt(s.dataset.rating) <= selectedRating));
            });
        });

        modal.querySelector('.submit-review').addEventListener('click', async () => {
            const reviewData = {
                rating: selectedRating,
                title: modal.querySelector('#review-title').value,
                text: modal.querySelector('#review-text').value,
                userNickname: modal.querySelector('#review-name').value
            };

            try {
                await this.travelAPI.submitReview(hotelId, reviewData);
                modal.remove();
                this.toggleHotelReviews(hotelId); // Refresh reviews
            } catch (error) {
                alert('Failed to submit review. Please try again.');
            }
        });
    }

    async searchEverywhereFromCity() {
        const fromCode = document.getElementById('flight-from-code').value;
        const date = document.getElementById('trip-start').value;

        if (!fromCode || !date) {
            alert('Please select a departure city and date');
            return;
        }

        const container = document.getElementById('flight-results');
        container.innerHTML = '<div class="loading">Searching for destinations...</div>';

        try {
            const [year, month] = date.split('-');
            const results = await this.travelAPI.searchEverywhereFromCity(fromCode, parseInt(month), parseInt(year));
            this.displayEverywhereResults(results);
        } catch (error) {
            console.error('Error searching destinations:', error);
            container.innerHTML = `
                <div class="error">
                    <h3>No Destinations Found</h3>
                    <p>${error.message || 'Unable to find destinations from this city.'}</p>
                    <p>Try:</p>
                    <ul>
                        <li>Different departure dates</li>
                        <li>A different departure city</li>
                        <li>Checking back later for updated prices</li>
                    </ul>
                </div>`;
        }
    }

    displayEverywhereResults(destinations) {
        const container = document.getElementById('flight-results');
        container.innerHTML = '';

        if (!destinations || destinations.length === 0) {
            container.innerHTML = '<div class="error">No destinations found.</div>';
            return;
        }

        destinations.forEach(destination => {
            const card = document.createElement('div');
            card.className = 'result-card';
            card.innerHTML = `
                <h4>${destination.destination.city}, ${destination.destination.country}</h4>
                <p class="carrier">${destination.airlines.join(', ')}</p>
                <p>Departure: ${new Date(destination.departureDate).toLocaleDateString()}</p>
                <p>Return: ${new Date(destination.returnDate).toLocaleDateString()}</p>
                <p class="price">${destination.price.currency} ${destination.price.amount}</p>
                <button class="book-button" data-destination-code="${destination.destination.code}">
                    View Flights
                </button>
            `;

            // Add click handler for the View Flights button
            card.querySelector('.book-button').addEventListener('click', () => {
                document.getElementById('flight-to').value = destination.destination.city;
                document.getElementById('flight-to-code').value = destination.destination.code;
                this.searchFlights(); // Search for specific flights to this destination
            });

            container.appendChild(card);
        });
    }

    async showLocationDetails(locationId) {
        const modal = document.createElement('div');
        modal.className = 'location-modal';
        modal.innerHTML = '<div class="loading">Loading location details...</div>';
        document.body.appendChild(modal);

        try {
            const details = await this.travelAPI.getLocationDetails(locationId);
            modal.innerHTML = `
                <div class="location-details">
                    <button class="close-button">&times;</button>
                    <h2>${details.name}</h2>
                    
                    <div class="location-photos">
                        ${details.photos?.slice(0, 5).map(photo => `
                            <img src="${photo.url}" alt="${photo.caption || details.name}">
                        `).join('') || ''}
                    </div>

                    <div class="rating-info">
                        <span class="stars">${'★'.repeat(Math.floor(details.rating))}</span>
                        <span class="review-count">(${details.numberOfReviews} reviews)</span>
                        ${details.priceLevel ? `<span class="price-level">${'$'.repeat(details.priceLevel)}</span>` : ''}
                    </div>

                    <div class="location-description">
                        ${details.description || 'No description available'}
                    </div>

                    <div class="contact-info">
                        <p><strong>Address:</strong> ${[
                            details.address.street1,
                            details.address.street2,
                            details.address.city,
                            details.address.state,
                            details.address.country,
                            details.address.postalCode
                        ].filter(Boolean).join(', ')}</p>
                        ${details.phone ? `<p><strong>Phone:</strong> ${details.phone}</p>` : ''}
                        ${details.email ? `<p><strong>Email:</strong> ${details.email}</p>` : ''}
                        ${details.website ? `<p><strong>Website:</strong> <a href="${details.website}" target="_blank">Visit Website</a></p>` : ''}
                    </div>

                    ${details.amenities ? `
                        <div class="amenities">
                            <h3>Amenities</h3>
                            <ul>
                                ${details.amenities.map(amenity => `<li>${amenity}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}

                    <div class="map-container">
                        <iframe
                            width="100%"
                            height="300"
                            frameborder="0"
                            style="border:0"
                            src="https://www.google.com/maps/embed/v1/place?key=YOUR_GOOGLE_MAPS_API_KEY&q=${details.coordinates.latitude},${details.coordinates.longitude}"
                            allowfullscreen>
                        </iframe>
                    </div>

                    <a href="${details.webUrl}" target="_blank" class="tripadvisor-link">
                        View on TripAdvisor
                    </a>
                </div>
            `;

            // Add close button functionality
            modal.querySelector('.close-button').addEventListener('click', () => modal.remove());

            // Add photo gallery button
            modal.querySelector('.location-photos').insertAdjacentHTML('afterend', `
                <button class="view-all-photos" data-location-id="${locationId}">
                    View All Photos
                </button>
            `);

            modal.querySelector('.view-all-photos').addEventListener('click', (e) => {
                this.showPhotoGallery(e.target.dataset.locationId);
            });

        } catch (error) {
            modal.innerHTML = `
                <div class="error">
                    <h3>Error Loading Details</h3>
                    <p>${error.message}</p>
                    <button class="close-button">Close</button>
                </div>
            `;
            modal.querySelector('.close-button').addEventListener('click', () => modal.remove());
        }
    }

    async showPhotoGallery(locationId) {
        const modal = document.createElement('div');
        modal.className = 'photo-gallery-modal';
        modal.innerHTML = '<div class="loading">Loading photos...</div>';
        document.body.appendChild(modal);

        try {
            const photos = await this.travelAPI.getLocationPhotos(locationId);
            modal.innerHTML = `
                <div class="photo-gallery">
                    <button class="close-button">&times;</button>
                    <div class="gallery-grid">
                        ${photos.map(photo => `
                            <div class="gallery-item" data-photo-id="${photo.id}">
                                <img src="${photo.thumbnailUrl}" 
                                     data-large-url="${photo.largeUrl}"
                                     alt="${photo.caption || 'Location photo'}"
                                     loading="lazy">
                                ${photo.caption ? `<div class="photo-caption">${photo.caption}</div>` : ''}
                            </div>
                        `).join('')}
                    </div>
                    <div class="photo-viewer">
                        <button class="prev-photo">&lt;</button>
                        <div class="current-photo"></div>
                        <button class="next-photo">&gt;</button>
                    </div>
                </div>
            `;

            // Add event listeners for gallery interaction
            this.setupGalleryInteraction(modal, photos);

        } catch (error) {
            modal.innerHTML = `
                <div class="error">
                    <h3>Error Loading Photos</h3>
                    <p>${error.message}</p>
                    <button class="close-button">Close</button>
                </div>
            `;
        }

        modal.querySelector('.close-button').addEventListener('click', () => modal.remove());
    }

    setupGalleryInteraction(modal, photos) {
        const galleryItems = modal.querySelectorAll('.gallery-item');
        const photoViewer = modal.querySelector('.photo-viewer');
        const currentPhoto = photoViewer.querySelector('.current-photo');
        let currentIndex = 0;

        // Show first photo by default
        if (photos.length > 0) {
            showPhoto(0);
        }

        // Add click handlers to thumbnails
        galleryItems.forEach((item, index) => {
            item.addEventListener('click', () => {
                currentIndex = index;
                showPhoto(currentIndex);
            });
        });

        // Navigation buttons
        modal.querySelector('.prev-photo').addEventListener('click', () => {
            currentIndex = (currentIndex - 1 + photos.length) % photos.length;
            showPhoto(currentIndex);
        });

        modal.querySelector('.next-photo').addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % photos.length;
            showPhoto(currentIndex);
        });

        function showPhoto(index) {
            const photo = photos[index];
            currentPhoto.innerHTML = `
                <img src="${photo.largeUrl}" alt="${photo.caption || 'Location photo'}">
                <div class="photo-info">
                    <p class="caption">${photo.caption || ''}</p>
                    <p class="meta">
                        <span>By ${photo.user}</span>
                        <span>Uploaded: ${new Date(photo.uploadDate).toLocaleDateString()}</span>
                        <span>👍 ${photo.helpfulVotes}</span>
                    </p>
                </div>
            `;

            // Update active thumbnail
            galleryItems.forEach(item => item.classList.remove('active'));
            galleryItems[index].classList.add('active');
        }
    }
}

// Initialize the Itinerary Manager when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ItineraryManager();
}); 