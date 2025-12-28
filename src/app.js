const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const routes = require('./routes/soundtrackRoutes');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();

// Security middleware with custom CSP for book covers
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            scriptSrcAttr: ["'unsafe-inline'"], // Allow inline event handlers (onclick, onerror)
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: [
                "'self'",
                "data:",
                "https://covers.openlibrary.org", // Open Library covers
                "https://*.archive.org",           // Archive.org subdomains (ia*.us.archive.org)
                "https://books.google.com",        // Google Books covers
                "https://images-na.ssl-images-amazon.com", // Amazon covers
                "https://i.gr-assets.com",         // Goodreads covers
                "https://m.media-amazon.com",      // Amazon media
                "https://*.imgur.com",              // Imgur uploads
                "https://*.cloudinary.com"          // Cloudinary uploads
            ],
            connectSrc: ["'self'"]
        }
    }
}));

// CORS middleware
app.use(cors());

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (frontend)
app.use(express.static('public'));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// API Routes
app.use('/api', routes);

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

module.exports = app;
