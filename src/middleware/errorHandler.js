/**
 * Global error handling middleware
 */
function errorHandler(err, req, res, next) {
    console.error('Error Handler Caught:', err);

    // Default error
    let status = err.status || 500;
    let message = err.message || 'Internal Server Error';

    // Handle specific error types
    if (err.name === 'ValidationError') {
        status = 400;
        message = 'Validation Error: ' + err.message;
    }

    if (err.name === 'UnauthorizedError') {
        status = 401;
        message = 'Unauthorized';
    }

    // Send error response
    res.status(status).json({
        success: false,
        error: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
}

/**
 * 404 Not Found handler
 */
function notFoundHandler(req, res) {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found'
    });
}

module.exports = {
    errorHandler,
    notFoundHandler
};
