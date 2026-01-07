const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
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

// Compression middleware (gzip/brotli) for bandwidth savings  
app.use(compression());

// Global rate limiting
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_GLOBAL) || 100, // Max 100 requests per window
    message: { success: false, error: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false
});
app.use(globalLimiter);

// Body parser middleware with size limits
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// Serve static files (frontend)
app.use(express.static('public'));

// Conditional request logging (only in development)
if (process.env.NODE_ENV !== 'production') {
    app.use((req, res, next) => {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
        next();
    });
}

// API Routes
app.use('/api', routes);

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

module.exports = app;
