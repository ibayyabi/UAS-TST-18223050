const express = require('express');
const router = express.Router();
const soundtrackController = require('../controllers/soundtrackController');

/**
 * @route   GET /api/search-books?search=judul
 * @desc    Get books detail
 * @access  Public
 */
router.get('/search-books', soundtrackController.searchBooks.bind(soundtrackController));

/**
 * @route   GET /api/recommend/:bookId
 * @desc    Get music recommendations for a specific book by ID
 * @access  Public
 */
router.get('/recommend/:bookId', soundtrackController.getRecommendationsForBook.bind(soundtrackController));

/**
 * @route   GET /api/recommend-by-title?title=judul
 * @desc    Get music recommendations for a specific book by title
 * @access  Public
 */
router.get('/recommend-by-title', soundtrackController.getRecommendationsByTitle.bind(soundtrackController));

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

module.exports = router;
