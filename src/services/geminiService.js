const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../config/config');
const { SYSTEM_PROMPT, createUserPrompt, getFallbackProfile } = require('../prompts/musicMappingPrompt');

/**
 * Service untuk berinteraksi dengan Gemini AI
 */
class GeminiService {
    constructor() {
        this.genAI = new GoogleGenerativeAI(config.gemini.apiKey);
        this.model = this.genAI.getGenerativeModel({
            model: config.gemini.model, // Configurable via GEMINI_MODEL env
            systemInstruction: SYSTEM_PROMPT,
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 1000,
            }
        });
        console.log(`Gemini AI initialized with model: ${config.gemini.model}`);
    }

    /**
     * Analyze book and get music profile recommendation
     * @param {Object} bookData - Book information
     * @returns {Promise<Object>} Music profile
     */
    async analyzeBooksForMusic(bookData) {
        try {
            console.log(`Analyzing book "${bookData.title}" with Gemini AI...`);

            const userPrompt = createUserPrompt(bookData);

            const result = await this.model.generateContent(userPrompt);
            const response = await result.response;
            let text = response.text();

            console.log('Raw Gemini response:', text.substring(0, 200)); // Log first 200 chars

            // Clean up response - remove markdown code blocks if present
            text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

            console.log('Cleaned response:', text.substring(0, 200)); // Log after cleanup

            // Parse JSON response
            const musicProfile = JSON.parse(text);

            // Validate response structure
            if (!musicProfile.primaryGenre || !musicProfile.mood || musicProfile.energy === undefined) {
                throw new Error('Invalid response format from Gemini - missing required fields');
            }

            // Validate energy is a number between 0-10
            if (typeof musicProfile.energy !== 'number' || musicProfile.energy < 0 || musicProfile.energy > 10) {
                throw new Error('Invalid energy value from Gemini');
            }

            console.log(`✓ Gemini recommendation: ${musicProfile.primaryGenre} / ${musicProfile.mood} (energy: ${musicProfile.energy})`);

            return musicProfile;

        } catch (error) {
            console.error('Gemini AI error:', error.message);

            // Log detailed error untuk debugging
            if (error.response) {
                console.error('Gemini response error:', error.response);
            }
            if (error.name === 'SyntaxError') {
                console.error('JSON Parse Error - Raw text might be malformed');
            }

            console.log('Falling back to rule-based mapping...');

            // Fallback to rule-based mapping
            return getFallbackProfile(bookData.genre);
        }
    }

    /**
     * Test Gemini connection
     * @returns {Promise<boolean>} Connection status
     */
    async testConnection() {
        try {
            const result = await this.model.generateContent('Test');
            await result.response;
            return true;
        } catch (error) {
            console.error('Gemini connection test failed:', error.message);
            return false;
        }
    }
}

module.exports = new GeminiService();
