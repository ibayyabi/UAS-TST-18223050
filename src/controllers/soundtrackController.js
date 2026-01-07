const bookService = require('../services/bookService');
const geminiService = require('../services/geminiService');
const musicService = require('../services/musicService');

/**
 * Controller utama untuk mengorkestrasi integrasi antara Book API, Gemini AI, dan Music API.
 */
class SoundtrackController {

    /**
     * Seacrh books by title or keyword
     * Fetches book data from Book API
     * @param {Object} req - Express Request Object (query: name).
     * @param {Object} res - Express Response Object.
     */
    async searchBooks(req, res) {
        try {
            const { name, page } = req.query;
            // Jika name kosong, bookService harus tetap bisa fetch (biasanya list all)
            const books = await bookService.getBooks({
                search: name || '',
                page: page || 1
            });

            return res.status(200).json({ success: true, data: books });
        } catch (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
    }

    /**
     * Generate music recommendations for a specific book
     * @param {Object} req - Express Request Object (params: bookId).
     * @param {Object} res - Express Response Object.
     */
    async getRecommendationsForBook(req, res) {
        try {
            const { bookId } = req.params;

            // Fetch book details
            const bookData = await bookService.getBookById(bookId);

            // Analyze book characteristics using Gemini AI
            const musicProfile = await geminiService.analyzeBooksForMusic(bookData);

            // Retrieve music recommendations based on analysis
            const musicTracks = await musicService.searchMusic({
                genre: musicProfile.primaryGenre,
                mood: musicProfile.mood,
                energyMax: musicProfile.energy + 2,
                limit: 10
            });

            return res.status(200).json({
                success: true,
                data: {
                    book: bookData,
                    musicProfile: musicProfile,
                    recommendations: musicTracks
                }
            });
        } catch (error) {
            console.error('Error in Orchestration:', error.message);
            return res.status(500).json({ success: false, error: error.message });
        }
    }

    /**
     * Generate music recommendations for a specific book by title
     * @param {Object} req - Express Request Object (query: title).
     * @param {Object} res - Express Response Object.
     */
    async getRecommendationsByTitle(req, res) {
        try {
            const { title } = req.query;

            if (!title) {
                return res.status(400).json({
                    success: false,
                    error: 'Title parameter is required'
                });
            }

            // Fetch book details by title
            const bookData = await bookService.getBookByTitle(title);

            // Analyze book characteristics using Gemini AI
            const musicProfile = await geminiService.analyzeBooksForMusic(bookData);

            // Retrieve music recommendations based on analysis
            const musicTracks = await musicService.searchMusic({
                genre: musicProfile.primaryGenre,
                mood: musicProfile.mood,
                energyMax: musicProfile.energy + 2,
                limit: 10
            });

            return res.status(200).json({
                success: true,
                data: {
                    book: bookData,
                    musicProfile: musicProfile,
                    recommendations: musicTracks
                }
            });
        } catch (error) {
            console.error('Error in Orchestration (by title):', error.message);
            return res.status(500).json({ success: false, error: error.message });
        }
    }

    /**
     * Comprehensive health check endpoint - checks all services
     * @param {Object} req - Express request
     * @param {Object} res - Express response
     */
    async healthCheck(req, res) {
        try {
            // Check all services concurrently
            const checks = await Promise.allSettled([
                // Gemini AI check
                geminiService.testConnection(),
                
                // Book API check
                bookService.getBooks({ page: 1 }).then(() => true).catch(() => false),
                
                // Music API check
                musicService.searchMusic({ limit: 1 }).then(() => true).catch(() => false)
            ]);

            const [geminiCheck, bookCheck, musicCheck] = checks;

            const services = {
                gemini: geminiCheck.status === 'fulfilled' && geminiCheck.value ? 'connected' : 'disconnected',
                bookApi: bookCheck.status === 'fulfilled' && bookCheck.value ? 'connected' : 'disconnected',
                musicApi: musicCheck.status === 'fulfilled' && musicCheck.value ? 'connected' : 'disconnected'
            };

            const allConnected = Object.values(services).every(status => status === 'connected');

            return res.status(allConnected ? 200 : 503).json({
                success: true,
                status: allConnected ? 'ok' : 'degraded',
                timestamp: new Date().toISOString(),
                services
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                status: 'error',
                error: error.message
            });
        }
    }

    /**
     * Test Book API endpoint (untuk debugging)
     * @param {Object} req - Express request
     * @param {Object} res - Express response
     */
    async testBookApi(req, res) {
        try {
            const { bookId } = req.params;

            console.log(`Testing Book API with ID: ${bookId}`);

            const bookData = await bookService.getBookById(bookId);

            return res.status(200).json({
                success: true,
                message: `Book API connection successful`,
                data: bookData
            });

        } catch (error) {
            console.error('Book API test error:', error.message);

            return res.status(500).json({
                success: false,
                error: error.message,
                hint: 'Check if Book API is running and the Book ID exists'
            });
        }
    }

    /**
     * Get book detail by title
     * @param {Object} req - Express request (query: title)
     * @param {Object} res - Express response
     */
    async getBookByTitle(req, res) {
        try {
            const { title } = req.query;

            if (!title) {
                return res.status(400).json({
                    success: false,
                    error: 'Title parameter is required'
                });
            }

            console.log(`Fetching book by title: ${title}`);

            const bookData = await bookService.getBookByTitle(title);

            return res.status(200).json({
                success: true,
                data: bookData
            });

        } catch (error) {
            console.error('Get book by title error:', error.message);

            return res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Explore music catalog with filters
     * Allows browsing music by genre, mood, energy level
     * @param {Object} req - Express request (query: genre, mood, energy_max, limit)
     * @param {Object} res - Express response
     */
    async exploreMusic(req, res) {
        try {
            const { genre, mood, energy_max, limit } = req.query;

            console.log(`Exploring music with filters:`, { genre, mood, energy_max, limit });

            const musicTracks = await musicService.searchMusic({
                genre: genre || undefined,
                mood: mood || undefined,
                energyMax: energy_max ? parseInt(energy_max) : undefined,
                limit: limit ? parseInt(limit) : 20
            });

            return res.status(200).json({
                success: true,
                data: musicTracks
            });

        } catch (error) {
            console.error('Explore music error:', error.message);

            return res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

}

module.exports = new SoundtrackController();
