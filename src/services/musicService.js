const axios = require('axios');
const config = require('../config/config');

/**
 * Service untuk berinteraksi dengan Music Catalog API
 */
class MusicService {
    constructor() {
        this.baseUrl = config.musicApi.baseUrl;
        this.apiKey = config.musicApi.apiKey;
    }

    /**
     * Search music tracks based on filters
     * @param {Object} params - Search parameters
     * @param {string} params.genre - Primary genre
     * @param {string} params.mood - Mood/atmosphere
     * @param {number} params.energyMax - Maximum energy level (0-10)
     * @param {number} params.limit - Number of results to return
     * @returns {Promise<Array>} Music tracks
     */
    async searchMusic({ genre, mood, energyMax, limit = 10 }) {
        try {
            // Use /music/recommendations endpoint based on API documentation
            const url = `${this.baseUrl}/music/recommendations`;

            const headers = {
                'X-API-Key': this.apiKey
            };

            // Build query parameters
            const params = {
                limit
            };

            if (genre) {
                params.genre = genre;
            }

            if (mood) {
                params.mood = mood;
            }

            if (energyMax !== undefined) {
                params.energy_max = energyMax;
            }

            console.log(`Searching music with params:`, params);

            const response = await axios.get(url, {
                headers,
                params,
                timeout: 10000 // 10 second timeout
            });

            if (!response.data) {
                throw new Error('No data received from Music API');
            }

            // Normalize response structure
            const tracks = response.data.data || response.data.tracks || response.data;

            // Ensure we have an array
            if (!Array.isArray(tracks)) {
                console.warn('Music API did not return an array, wrapping response');
                return [tracks];
            }

            return tracks;

        } catch (error) {
            if (error.response) {
                // API responded with error status
                throw new Error(`Music API error: ${error.response.status} - ${error.response.statusText}`);
            } else if (error.request) {
                // Request made but no response
                throw new Error('Music API is unavailable. Please check if the API is running.');
            } else {
                // Other errors
                throw new Error(`Error searching music: ${error.message}`);
            }
        }
    }

    /**
     * Get music track by ID
     * @param {string} trackId - Track ID
     * @returns {Promise<Object>} Track data
     */
    async getTrackById(trackId) {
        try {
            const url = `${this.baseUrl}/tracks/${trackId}`;

            const headers = {
                'X-API-Key': this.apiKey
            };

            const response = await axios.get(url, {
                headers,
                timeout: 10000
            });

            return response.data.data || response.data;

        } catch (error) {
            if (error.response && error.response.status === 404) {
                throw new Error(`Track with ID ${trackId} not found`);
            }
            throw new Error(`Error fetching track: ${error.message}`);
        }
    }
}

module.exports = new MusicService();
