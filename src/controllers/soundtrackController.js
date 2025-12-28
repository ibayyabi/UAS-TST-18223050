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
     * Health check endpoint
     * @param {Object} req - Express request
     * @param {Object} res - Express response
     */
    async healthCheck(req, res) {
        try {
            const geminiStatus = await geminiService.testConnection();

            return res.status(200).json({
                success: true,
                status: 'ok',
                timestamp: new Date().toISOString(),
                services: {
                    gemini: geminiStatus ? 'connected' : 'disconnected'
                }
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

}

module.exports = new SoundtrackController();
