import TravelAPI from './booking-api.js';
class App {
    constructor() {
        this.travelAPI = new TravelAPI();
        this.initializeApp();
        this.setupEventListeners();
    }

    async initializeApp() {
        await Promise.all([
            this.loadTopAttractions(),
            this.setupCurrencyConverter()
        ]);
    }

    setupEventListeners() {
        // CTA button
        const ctaButton = document.querySelector('.cta-button');
        if (ctaButton) {
            ctaButton.addEventListener('click', () => {
                window.location.href = 'itinerary.html';
            });
        }

        // Currency converter
        const convertBtn = document.getElementById('convert-btn');
        if (convertBtn) {
            convertBtn.addEventListener('click', this.handleCurrencyConversion.bind(this));
        }
    }

    async loadTopAttractions() {
        const container = document.getElementById('attractions-container');
        if (!container) return;

        try {
            // Show loading state
            container.innerHTML = '<div class="loading">Loading top attractions...</div>';

            // Fetch attractions from API
            const attractions = await this.travelAPI.getTopAttractions(4);

            if (!attractions || attractions.length === 0) {
                throw new Error('No attractions found');
            }

            container.innerHTML = attractions.map(attraction => `
                <div class="attraction-card">
                    <div class="attraction-image">
                        <img src="${attraction.image}" 
                            alt="${attraction.name}" 
                            onerror="this.src='/assets/images/placeholder.jpg'"
                            loading="lazy">
                    </div>
                    <div class="attraction-content">
                        <h3>${attraction.name}</h3>
                        <p class="location">${attraction.location.city}, ${attraction.location.country}</p>
                        <div class="rating">
                            <div class="stars">
                                ${'★'.repeat(Math.floor(attraction.rating))}${attraction.rating % 1 >= 0.5 ? '½' : ''}
                            </div>
                            <span class="review-count">${(attraction.reviews/1000).toFixed(0)}K reviews</span>
                        </div>
                        <p class="description">${attraction.description}</p>
                        <button class="explore-button" data-id="${attraction.id}">Explore</button>
                    </div>
                </div>
            `).join('');

            // Add click handlers for explore buttons
            container.querySelectorAll('.explore-button').forEach((button) => {
                button.addEventListener('click', () => {
                    const attractionId = button.dataset.id;
                    window.location.href = `attractions.html?id=${attractionId}`;
                });
            });

        } catch (error) {
            console.error('Error loading attractions:', error);
            container.innerHTML = `
                <div class="error">
                    <h3>Error Loading Attractions</h3>
                    <p>Please try refreshing the page</p>
                </div>`;
        }
    }

    showError(message) {
        const container = document.getElementById('attractions-container');
        if (container) {
            container.innerHTML = `
                <div class="error">
                    <h3>Error</h3>
                    <p>${message}</p>
                </div>
            `;
        }
    }

    async setupCurrencyConverter() {
        const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD'];
        const fromSelect = document.getElementById('from-currency');
        const toSelect = document.getElementById('to-currency');
        
        // Populate currency dropdowns
        currencies.forEach(currency => {
            fromSelect.innerHTML += `<option value="${currency}">${currency}</option>`;
            toSelect.innerHTML += `<option value="${currency}">${currency}</option>`;
        });

        // Convert button click handler
        document.getElementById('convert-btn').addEventListener('click', async () => {
            const amount = document.getElementById('amount').value;
            const from = fromSelect.value;
            const to = toSelect.value;
            
            try {
                // In a real application, you would call an actual API here
                const result = await mockConvertCurrency(amount, from, to);
                document.getElementById('result').textContent = 
                    `${amount} ${from} = ${result.toFixed(2)} ${to}`;
            } catch (error) {
                console.error('Conversion failed:', error);
            }
        });
    }

    async handleCurrencyConversion() {
        // Currency conversion handler
        // (Keep existing implementation if you have one)
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new App();
});

// Mock currency conversion function
function mockConvertCurrency(amount, from, to) {
    return new Promise((resolve) => {
        // Mock exchange rates
        const rates = {
            'USD': 1,
            'EUR': 0.85,
            'GBP': 0.73,
            'JPY': 110.5,
            'AUD': 1.35,
            'CAD': 1.25
        };
        
        const result = (amount / rates[from]) * rates[to];
        resolve(result);
    });
}

// Add smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Add this to your existing app.js
function addRippleEffect(event) {
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

// Add ripple effect to all buttons when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.primary-button, .secondary-button, .cta-button, .search-button');
    buttons.forEach(button => {
        button.addEventListener('click', addRippleEffect);
    });
}); 