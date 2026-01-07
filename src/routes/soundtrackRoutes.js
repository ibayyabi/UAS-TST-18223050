const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const soundtrackController = require('../controllers/soundtrackController');

// Strict rate limiting for recommendation endpoints (costs Gemini tokens)
const recommendLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MINUTES) * 60 * 1000 || 60 * 1000, // Default 1 minute
    max: parseInt(process.env.RATE_LIMIT_RECOMMEND) || 5,
    message: { success: false, error: 'Too many recommendation requests. Please wait before trying again.' },
    standardHeaders: true,
    legacyHeaders: false
});

// Moderate rate limiting for search endpoints
const searchLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MINUTES) * 60 * 1000 || 60 * 1000,
    max: 30,
    message: { success: false, error: 'Too many search requests. Please wait before trying again.' }
});

/**
 * @route   GET /api/search-books?search=judul
 * @desc    Get books detail
 * @access  Public
 */
router.get('/search-books', searchLimiter, soundtrackController.searchBooks.bind(soundtrackController));

/**
 * @route   GET /api/recommend/:bookId
 * @desc    Get music recommendations for a specific book by ID
 * @access  Public
 */
router.get('/recommend/:bookId', recommendLimiter, soundtrackController.getRecommendationsForBook.bind(soundtrackController));

/**
 * @route   GET /api/recommend-by-title?title=judul
 * @desc    Get music recommendations for a specific book by title
 * @access  Public
 */
router.get('/recommend-by-title', recommendLimiter, soundtrackController.getRecommendationsByTitle.bind(soundtrackController));

/**
 * @route   GET /api/health
 * @desc    Health check endpoint
 * @access  Public
 */
router.get('/health', soundtrackController.healthCheck.bind(soundtrackController));

/**
 * @route   GET /api/search-book/:bookId
 * @desc    Test Book API connection (untuk debugging)
 * @access  Public
 */
router.get('/search-book/:bookId', soundtrackController.testBookApi.bind(soundtrackController));

/**
 * @route   GET /api/book-by-title?title=judul
 * @desc    Get book details by title
 * @access  Public
 */
router.get('/book-by-title', soundtrackController.getBookByTitle.bind(soundtrackController));

/**
 * @route   GET /api/explore-music?genre=Jazz&mood=Relaxed&energy_max=5&limit=20
 * @desc    Explore music catalog with optional filters
 * @access  Public
 */
router.get('/explore-music', soundtrackController.exploreMusic.bind(soundtrackController));

module.exports = router;
