class TravelAPI {
    constructor() {
        // Move API keys to environment variables
        this.TRIPADVISOR_API_KEY = import.meta.env.VITE_TRIPADVISOR_API_KEY;
        this.TRIPADVISOR_API_HOST = 'api.content.tripadvisor.com';
        this.AIRPORT_API_KEY = import.meta.env.VITE_RAPIDAPI_KEY;
        this.AIRPORT_API_HOST = 'airport-info.p.rapidapi.com';
        this.USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'false';
        this.AMADEUS_CLIENT_ID = import.meta.env.VITE_AMADEUS_CLIENT_ID;
        this.AMADEUS_CLIENT_SECRET = import.meta.env.VITE_AMADEUS_CLIENT_SECRET;
        this.amadeusToken = null;
        this.amadeusTokenExpiry = null;
    }

    async getAmadeusToken() {
        if (this.amadeusToken && this.amadeusTokenExpiry > Date.now()) {
            return this.amadeusToken;
        }

        const apiKey = this.AMADEUS_CLIENT_ID;
        const apiSecret = this.AMADEUS_CLIENT_SECRET;
        const tokenEndpoint = 'https://test.api.amadeus.com/v1/security/oauth2/token';

        try {
            const response = await fetch(tokenEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: `grant_type=client_credentials&client_id=${apiKey}&client_secret=${apiSecret}`
            });

            if (!response.ok) {
                throw new Error('Failed to get Amadeus token');
            }

            const data = await response.json();
            this.amadeusToken = data.access_token;
            this.amadeusTokenExpiry = Date.now() + (data.expires_in * 1000);
            return this.amadeusToken;
        } catch (error) {
            console.error('Error getting Amadeus token:', error);
            throw error;
        }
    }

    // City/Location Search
    async getCitySuggestions(searchQuery, options = {}) {
        if (!searchQuery && !options.latLong) {
            throw new Error('Either searchQuery or latLong is required');
        }

        const url = `https://${this.TRIPADVISOR_API_HOST}/api/v1/location/search`;
        
        // Build query parameters
        const params = new URLSearchParams({
            key: this.TRIPADVISOR_API_KEY,
            language: options.language || 'en'
        });

        // Add required searchQuery if provided
        if (searchQuery) {
            params.append('searchQuery', searchQuery);
        }

        // Add optional parameters
        if (options.category) {
            // Validate category
            const validCategories = ['hotels', 'attractions', 'restaurants', 'geos'];
            if (!validCategories.includes(options.category)) {
                throw new Error(`Invalid category. Must be one of: ${validCategories.join(', ')}`);
            }
            params.append('category', options.category);
        }

        if (options.phone) {
            // Remove '+' from phone number if present
            const cleanPhone = options.phone.replace(/^\+/, '');
            params.append('phone', cleanPhone);
        }

        if (options.address) {
            params.append('address', options.address);
        }

        if (options.latLong) {
            // Validate latLong format
            const latLongRegex = /^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/;
            if (!latLongRegex.test(options.latLong)) {
                throw new Error('Invalid latLong format. Must be "latitude,longitude"');
            }
            params.append('latLong', options.latLong);
        }

        if (options.radius) {
            // Validate radius is positive number
            if (typeof options.radius !== 'number' || options.radius <= 0) {
                throw new Error('Radius must be a positive number');
            }
            params.append('radius', options.radius.toString());
        }

        if (options.radiusUnit) {
            // Validate radiusUnit
            const validUnits = ['km', 'mi', 'm'];
            if (!validUnits.includes(options.radiusUnit)) {
                throw new Error(`Invalid radiusUnit. Must be one of: ${validUnits.join(', ')}`);
            }
            params.append('radiusUnit', options.radiusUnit);
        }

        const requestOptions = {
            method: 'GET',
            headers: {
                'accept': 'application/json',
                'X-API-KEY': this.TRIPADVISOR_API_KEY
            }
        };

        try {
            console.log('Location search parameters:', Object.fromEntries(params));
            const result = await this.makeAPIRequest(`${url}?${params}`, requestOptions);

            if (!result.data) {
                console.log('No locations found');
                return [];
            }

            return result.data.map(location => ({
                id: location.location_id,
                name: location.name,
                type: location.location_type,
                address: {
                    street: location.address_obj?.street1,
                    city: location.address_obj?.city,
                    state: location.address_obj?.state,
                    country: location.address_obj?.country,
                    postalCode: location.address_obj?.postalcode,
                    addressString: location.address_obj?.address_string
                },
                coordinates: {
                    latitude: location.latitude,
                    longitude: location.longitude
                },
                category: {
                    name: location.category?.name,
                    subcategories: location.subcategory?.map(sub => sub.name) || []
                },
                rating: location.rating,
                numberOfReviews: location.num_reviews,
                rankingPosition: location.ranking_position,
                rankingCategory: location.ranking_category,
                phone: location.phone,
                website: location.website,
                email: location.email,
                priceLevel: location.price_level,
                distance: location.distance,
                bearing: location.bearing
            }));
        } catch (error) {
            console.error('Error in location search:', error);
            throw new Error(`Failed to search locations: ${error.message}`);
        }
    }

    // Update the searchNearby method
    async searchNearby(latitude, longitude, options = {}) {
        const url = `https://${this.TRIPADVISOR_API_HOST}/api/v1/location/nearby`;
        
        const params = new URLSearchParams({
            key: this.TRIPADVISOR_API_KEY,
            latLong: `${latitude},${longitude}`,
            language: options.language || 'en',
            radius: options.radius?.toString() || '5',
            radiusUnit: options.radiusUnit || 'km',
            category: options.category || 'hotels,restaurants,attractions',
            limit: options.limit?.toString() || '10'
        });

        const requestOptions = {
            method: 'GET',
            headers: {
                'accept': 'application/json',
                'X-API-KEY': this.TRIPADVISOR_API_KEY
            }
        };

        try {
            console.log('Searching nearby locations:', { latitude, longitude, ...options });
            const result = await this.makeAPIRequest(`${url}?${params}`, requestOptions);

            if (!result.data) {
                console.log('No nearby locations found');
                return [];
            }

            return result.data.map(location => ({
                id: location.location_id,
                name: location.name,
                type: location.location_type,
                distance: location.distance,
                bearing: location.bearing,
                address: {
                    street: location.address_obj?.street1,
                    city: location.address_obj?.city,
                    state: location.address_obj?.state,
                    country: location.address_obj?.country,
                    postalCode: location.address_obj?.postalcode
                },
                coordinates: {
                    latitude: location.latitude,
                    longitude: location.longitude
                },
                rating: location.rating,
                numberOfReviews: location.num_reviews,
                category: {
                    name: location.category?.name,
                    subcategories: location.subcategory?.map(sub => sub.name) || []
                },
                priceLevel: location.price_level,
                phone: location.phone,
                website: location.website,
                openNow: location.open_now_text
            }));
        } catch (error) {
            console.error('Error searching nearby locations:', error);
            throw new Error(`Failed to search nearby locations: ${error.message}`);
        }
    }

    // Add method to search by category
    async searchByCategory(query, category, options = {}) {
        return this.getCitySuggestions(query, {
            ...options,
            category: category // 'hotels', 'attractions', 'restaurants', or 'geos'
        });
    }

    // Hotel Search
    async searchHotels(cityName, rating = '') {
        try {
            console.log('Hotel Search Parameters:', { cityName, rating });
            
            // First get the location ID
            const locationData = await this.getCitySuggestions(cityName);
            const locationId = locationData[0]?.id;
            
            if (!locationId) {
                throw new Error(`Location not found for city: ${cityName}`);
            }

            const url = `https://${this.TRIPADVISOR_API_HOST}/api/v1/location/${locationId}/hotels`;
            const options = {
                method: 'GET',
                headers: {
                    'accept': 'application/json',
                    'X-API-KEY': this.TRIPADVISOR_API_KEY
                }
            };

            const result = await this.makeAPIRequest(url, options);
            return this.formatHotelResults(result, rating);
        } catch (error) {
            console.error('Detailed Hotel Search Error:', error);
            throw error;
        }
    }

    // Hotel Reviews
    async getLocationReviews(locationId, options = {}) {
        if (!locationId) {
            throw new Error('Location ID is required');
        }

        const url = `https://${this.TRIPADVISOR_API_HOST}/api/v1/location/${locationId}/reviews`;
        
        // Build query parameters
        const params = new URLSearchParams({
            key: this.TRIPADVISOR_API_KEY,
            language: options.language || 'en',
            limit: options.limit?.toString() || '10',
            offset: options.offset?.toString() || '0'
        });

        const requestOptions = {
            method: 'GET',
            headers: {
                'accept': 'application/json',
                'X-API-KEY': this.TRIPADVISOR_API_KEY
            }
        };

        try {
            console.log(`Fetching reviews for location ${locationId}`, {
                language: options.language,
                limit: options.limit,
                offset: options.offset
            });

            const result = await this.makeAPIRequest(`${url}?${params}`, requestOptions);

            if (!result.data) {
                console.log('No reviews found');
                return [];
            }

            return this.formatLocationReviews(result);
        } catch (error) {
            console.error('Error fetching location reviews:', error);
            throw new Error(`Failed to fetch location reviews: ${error.message}`);
        }
    }

    // Add helper method for paginated reviews
    async getLocationReviewsPaginated(locationId, page = 1, pageSize = 10, language = 'en') {
        return this.getLocationReviews(locationId, {
            language,
            limit: pageSize,
            offset: (page - 1) * pageSize
        });
    }

    // Hotel Photos
    async getLocationPhotos(locationId, options = {}) {
        if (!locationId) {
            throw new Error('Location ID is required');
        }

        const url = `https://${this.TRIPADVISOR_API_HOST}/api/v1/location/${locationId}/photos`;
        
        // Build query parameters
        const params = new URLSearchParams({
            key: this.TRIPADVISOR_API_KEY,
            language: options.language || 'en',
            limit: options.limit?.toString() || '10',
            offset: options.offset?.toString() || '0'
        });

        // Add source parameter if specified
        if (options.source) {
            // Validate source values
            const validSources = ['Expert', 'Management', 'Traveler'];
            const sources = options.source.split(',').map(s => s.trim());
            const invalidSources = sources.filter(s => !validSources.includes(s));
            
            if (invalidSources.length > 0) {
                throw new Error(`Invalid photo sources: ${invalidSources.join(', ')}`);
            }
            
            params.append('source', options.source);
        }

        const requestOptions = {
            method: 'GET',
            headers: {
                'accept': 'application/json',
                'X-API-KEY': this.TRIPADVISOR_API_KEY
            }
        };

        try {
            console.log(`Fetching photos for location ${locationId}`, {
                limit: options.limit,
                offset: options.offset,
                source: options.source
            });

            const result = await this.makeAPIRequest(`${url}?${params}`, requestOptions);

            if (!result.data) {
                console.log('No photos found');
                return [];
            }

            return result.data.map(photo => ({
                id: photo.id,
                caption: photo.caption,
                source: {
                    type: photo.source?.type || 'Unknown',
                    name: photo.source?.name,
                    url: photo.source?.url
                },
                images: {
                    thumbnail: photo.images.thumbnail.url,
                    small: photo.images.small.url,
                    medium: photo.images.medium.url,
                    large: photo.images.large.url,
                    original: photo.images.original.url
                },
                uploadDate: photo.uploaded_date,
                user: {
                    username: photo.user?.username || 'Anonymous',
                    userUrl: photo.user?.url,
                    avatar: photo.user?.avatar?.small?.url
                },
                helpfulVotes: photo.helpful_votes || 0,
                categories: photo.categories || [],
                tags: photo.tags || []
            }));
        } catch (error) {
            console.error('Error fetching location photos:', error);
            throw new Error(`Failed to fetch location photos: ${error.message}`);
        }
    }

    // Add a method to fetch photos by source
    async getLocationPhotosBySource(locationId, source, limit = 10) {
        return this.getLocationPhotos(locationId, {
            source,
            limit
        });
    }

    // Add a method to fetch photos with pagination
    async getLocationPhotosPaginated(locationId, page = 1, pageSize = 10) {
        return this.getLocationPhotos(locationId, {
            limit: pageSize,
            offset: (page - 1) * pageSize
        });
    }

    // Location Details
    async getLocationDetails(locationId, options = {}) {
        if (!locationId) {
            throw new Error('Location ID is required');
        }

        const url = `https://${this.TRIPADVISOR_API_HOST}/api/v1/location/${locationId}/details`;
        
        // Build query parameters
        const params = new URLSearchParams({
            key: this.TRIPADVISOR_API_KEY,
            language: options.language || 'en',
            currency: options.currency || 'USD'
        });

        const requestOptions = {
            method: 'GET',
            headers: {
                'accept': 'application/json',
                'X-API-KEY': this.TRIPADVISOR_API_KEY
            }
        };

        try {
            console.log(`Fetching details for location ${locationId}`);
            const result = await this.makeAPIRequest(`${url}?${params}`, requestOptions);

            if (!result) {
                throw new Error('No location details found');
            }

            return this.formatLocationDetails(result);
        } catch (error) {
            console.error('Error fetching location details:', error);
            throw new Error(`Failed to fetch location details: ${error.message}`);
        }
    }

    // Helper Methods
    formatHotelResults(apiResponse, minRating = '') {
        if (!apiResponse.data) {
            return [];
        }

        let hotels = apiResponse.data.map(hotel => ({
            id: hotel.location_id,
            name: hotel.name,
            rating: hotel.rating,
            price: {
                amount: hotel.price_level || '$$',
                currency: 'USD'
            },
            address: hotel.address_obj ? `${hotel.address_obj.street1}, ${hotel.address_obj.city}` : '',
            amenities: hotel.amenities || [],
            images: hotel.photo ? [hotel.photo.images.large.url] : [],
            reviews: {
                count: hotel.num_reviews || 0,
                score: hotel.rating || 0
            }
        }));

        if (minRating) {
            hotels = hotels.filter(hotel => hotel.rating >= parseInt(minRating));
        }

        return hotels;
    }

    formatLocationReviews(apiResponse) {
        if (!apiResponse || !apiResponse.data) {
            return [];
        }

        return apiResponse.data.map(review => ({
            id: review.review_id,
            title: review.title,
            text: review.text,
            rating: review.rating,
            subRatings: review.subratings || {},
            publishedDate: review.published_date,
            tripType: review.trip_type,
            travelDate: review.travel_date,
            language: review.language,
            user: {
                username: review.user?.username || 'Anonymous',
                userLocation: review.user?.user_location || '',
                contributions: review.user?.contributions || 0,
                memberLevel: review.user?.level || null,
                memberSince: review.user?.created_time || null
            },
            helpful: {
                votes: review.helpful_votes || 0,
                thanked: review.thank_count || 0
            },
            photos: review.photos?.map(photo => ({
                id: photo.id,
                url: photo.images.large.url,
                thumbnailUrl: photo.images.thumbnail.url,
                caption: photo.caption,
                uploadDate: photo.uploaded_date
            })) || [],
            roomTip: review.room_tip || '',
            tripOrigin: review.trip_origin || '',
            visitDate: review.visit_date || '',
            managementResponse: review.management_response ? {
                text: review.management_response.text,
                date: review.management_response.published_date,
                username: review.management_response.username,
                title: review.management_response.title || ''
            } : null,
            ratings: {
                overall: review.rating,
                sleep: review.subratings?.sleep_quality,
                location: review.subratings?.location,
                rooms: review.subratings?.rooms,
                service: review.subratings?.service,
                value: review.subratings?.value,
                cleanliness: review.subratings?.cleanliness
            }
        }));
    }

    formatLocationDetails(apiResponse) {
        if (!apiResponse) {
            throw new Error('No location details found');
        }

        return {
            id: apiResponse.location_id,
            name: apiResponse.name,
            description: apiResponse.description,
            webUrl: apiResponse.web_url,
            address: {
                street1: apiResponse.address_obj?.street1,
                street2: apiResponse.address_obj?.street2,
                city: apiResponse.address_obj?.city,
                state: apiResponse.address_obj?.state,
                country: apiResponse.address_obj?.country,
                postalCode: apiResponse.address_obj?.postalcode,
                addressString: apiResponse.address_obj?.address_string
            },
            coordinates: {
                latitude: apiResponse.latitude,
                longitude: apiResponse.longitude
            },
            rating: apiResponse.rating,
            numberOfReviews: apiResponse.num_reviews,
            rankingData: {
                geoLocation: apiResponse.ranking_geo,
                ranking: apiResponse.ranking,
                category: apiResponse.ranking_category
            },
            photos: apiResponse.photos?.map(photo => ({
                id: photo.id,
                caption: photo.caption,
                url: photo.images.large.url,
                thumbnailUrl: photo.images.small.url,
                uploadDate: photo.uploaded_date,
                source: {
                    name: photo.source?.name,
                    url: photo.source?.url
                }
            })) || [],
            amenities: apiResponse.amenities || [],
            priceLevel: apiResponse.price_level,
            price: apiResponse.price,
            phone: apiResponse.phone,
            email: apiResponse.email,
            website: apiResponse.website,
            hours: {
                openNow: apiResponse.open_now_text,
                weekRanges: apiResponse.hours?.week_ranges,
                timeZone: apiResponse.timezone
            },
            category: {
                name: apiResponse.category?.name,
                subcategories: apiResponse.subcategory?.map(sub => sub.name) || []
            }
        };
    }

    async makeAPIRequest(url, options, retries = 3) {
        let lastError;

        for (let i = 0; i < retries; i++) {
            try {
                const response = await fetch(url, options);
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
                }
                return await response.json();
            } catch (error) {
                console.log(`Attempt ${i + 1} failed:`, error);
                lastError = error;
                // Wait before retrying (exponential backoff)
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
            }
        }
        throw lastError;
    }

    // Add a method to format distance display
    formatDistance(distance, unit = 'km') {
        if (unit === 'mi') {
            return `${(distance * 0.621371).toFixed(1)} miles`;
        }
        return `${distance.toFixed(1)} km`;
    }

    // Update formatLocationForDisplay to include distance
    formatLocationForDisplay(location) {
        const parts = [];
        
        // Name and type
        parts.push(location.name);
        if (location.type) {
            parts.push(`(${location.type})`);
        }

        // Distance if available
        if (location.distance) {
            parts.push(this.formatDistance(location.distance));
        }

        // Category
        if (location.category?.name) {
            const categoryPart = [location.category.name];
            if (location.category.subcategories?.length > 0) {
                categoryPart.push(location.category.subcategories.join(', '));
            }
            parts.push(categoryPart.join(' - '));
        }

        // Address
        const address = [];
        if (location.address.street) address.push(location.address.street);
        if (location.address.city) address.push(location.address.city);
        if (location.address.state) address.push(location.address.state);
        if (location.address.country) address.push(location.address.country);
        
        if (address.length > 0) {
            parts.push(address.join(', '));
        }

        // Rating and reviews
        if (location.rating) {
            parts.push(`${location.rating}★ (${location.numberOfReviews} reviews)`);
        }

        // Opening hours if available
        if (location.openNow) {
            parts.push(location.openNow);
        }

        return parts.join(' | ');
    }

    // Add this new method for airport search
    async searchAirports(query) {
        if (query.length < 2) return [];
        
        try {
            // Load the local airport data
            const response = await fetch('./data/airports.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const airports = await response.json();
            if (!airports || !Array.isArray(airports.airports)) {
                throw new Error('Invalid airport data format');
            }

            // Case-insensitive search
            const searchTerm = query.toLowerCase();
            
            // Filter airports
            return airports.airports
                .filter(airport => {
                    if (!airport.ident) return false;
                    
                    return (
                        airport.name.toLowerCase().includes(searchTerm) ||
                        airport.municipality?.toLowerCase().includes(searchTerm) ||
                        airport.ident.toLowerCase().includes(searchTerm) ||
                        airport.iso_country.toLowerCase().includes(searchTerm)
                    );
                })
                .map(airport => ({
                    code: airport.ident,
                    name: airport.name,
                    type: airport.type,
                    location: {
                        city: airport.municipality || 'Unknown',
                        country: airport.iso_country,
                        coordinates: {
                            latitude: airport.latitude_deg,
                            longitude: airport.longitude_deg
                        }
                    },
                    elevation: airport.elevation_ft,
                    details: `${airport.name} (${airport.ident})`
                }))
                .slice(0, 10);
        } catch (error) {
            console.error('Error searching airports:', error.message);
            throw new Error(`Failed to load airport data: ${error.message}`);
            return [];
        }
    }

    // Format airport data
    formatAirportData(data) {
        if (!data) return null;

        return {
            id: data.iata,
            name: data.name,
            location: {
                city: data.city,
                state: data.state,
                country: data.country,
                latitude: data.latitude,
                longitude: data.longitude
            },
            code: data.iata,
            timezone: data.timezone,
            type: data.type,
            website: data.website,
            phone: data.phone
        };
    }

    async getLocationSearch(options = {}) {
        try {
            // Use proxy path instead of direct API URL
            const url = '/api/v1/location/search';
            const params = new URLSearchParams({
                key: this.TRIPADVISOR_API_KEY,
                searchQuery: options.searchQuery || '',
                category: options.category || 'attractions',
                language: options.language || 'en',
                limit: options.limit || 4
            });

            const response = await this.makeRequest(`${url}?${params}`);
            return response.data || [];
        } catch (error) {
            console.error('Location search failed:', error);
            return [];
        }
    }

    async getLocationDetails(locationId) {
        try {
            const url = `/api/v1/location/${locationId}/details`;
            const params = new URLSearchParams({
                key: this.TRIPADVISOR_API_KEY
            });

            const response = await this.makeRequest(`${url}?${params}`);
            return response.data || null;
        } catch (error) {
            console.error('Error getting location details:', error);
            return null;
        }
    }

    async getLocationPhotos(locationId, options = {}) {
        try {
            const url = `/api/v1/location/${locationId}/photos`;
            const params = new URLSearchParams({
                key: this.TRIPADVISOR_API_KEY,
                limit: options.limit || 1
            });

            const response = await this.makeRequest(`${url}?${params}`);
            return response.data || [];
        } catch (error) {
            console.error('Error getting location photos:', error);
            return [];
        }
    }

    // Helper method for making API requests
    async makeRequest(url, options = {}) {
        const defaultOptions = {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'X-TripAdvisor-API-Key': this.TRIPADVISOR_API_KEY,
                'User-Agent': 'TravelBuddy/1.0'
            }
        };

        const finalOptions = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers
            }
        };

        try {
            const response = await fetch(url, finalOptions);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Response:', errorText);
                if (response.status === 401) {
                    throw new Error('API Authentication failed. Please check your API key.');
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    async getTopAttractions(limit = 4) {
        try {
            if (this.USE_MOCK_DATA) {
                const response = await fetch('/data/attractions.json');
                const mockData = await response.json();
                return mockData.data.slice(0, limit);
            }

            // Real API call implementation
            const url = '/api/v1/location/search';
            const params = new URLSearchParams({
                key: this.TRIPADVISOR_API_KEY,
                category: 'attractions',
                language: 'en',
                limit: limit,
                sort: 'rating'
            });

            const response = await this.makeRequest(`${url}?${params}`);
            return response.data || [];
        } catch (error) {
            console.error('Error fetching top attractions:', error);
            return [];
        }
    }

    // Search flights
    async searchFlights(originCode, destinationCode, departureDate) {
        try {
            const token = await this.getAmadeusToken();
            const url = `/amadeus/v2/shopping/flight-offers?originLocationCode=${originCode}&destinationLocationCode=${destinationCode}&departureDate=${departureDate}&adults=1`;
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Flight search error:', errorData);
                throw new Error(errorData.errors?.[0]?.detail || 'Flight search failed');
            }

            const data = await response.json();
            return {
                data: data.data.map(offer => ({
                    id: offer.id,
                    price: {
                        amount: offer.price.total,
                        currency: offer.price.currency
                    },
                    itineraries: offer.itineraries.map(itinerary => ({
                        duration: itinerary.duration,
                        segments: itinerary.segments.map(segment => ({
                            departure: {
                                airport: segment.departure.iataCode,
                                terminal: segment.departure.terminal,
                                time: segment.departure.at
                            },
                            arrival: {
                                airport: segment.arrival.iataCode,
                                terminal: segment.arrival.terminal,
                                time: segment.arrival.at
                            },
                            carrier: segment.carrierCode,
                            flightNumber: segment.number,
                            duration: segment.duration,
                            stops: segment.numberOfStops || 0
                        }))
                    })),
                    validUntil: offer.lastTicketingDate,
                    numberOfBookableSeats: offer.numberOfBookableSeats,
                    carriers: data.dictionaries?.carriers || {}
                }))
            };
        } catch (error) {
            console.error('Error searching flights:', error);
            throw error;
        }
    }

    async bookFlight(flightId) {
        try {
            const token = await this.getAmadeusToken();
            const url = `/amadeus/v1/booking/flight-orders`;

            const payload = {
                'data': {
                    'type': 'flight-order',
                    'flightOffers': [
                        {
                            'id': flightId
                        }
                    ]
                }
            };

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Flight booking error:', errorData);
                throw new Error(errorData.errors?.[0]?.detail || 'Flight booking failed');
            }

            const data = await response.json();
            return {
                confirmationCode: data.data.bookingConfirmationCode,
                flightOrderId: data.data.id
            };
        } catch (error) {
            console.error('Error booking flight:', error);
            throw error;
        }
    }
}

export default TravelAPI; 