const app = require('./app');
const config = require('./config/config');

const PORT = config.port;

const server = app.listen(PORT, () => {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║         THE READING SOUNDTRACK - Integration Service      ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📖 Web Interface: http://localhost:${PORT}`);
    console.log(`🔌 API Endpoint: http://localhost:${PORT}/api/soundtrack/:bookId`);
    console.log(`💚 Health Check: http://localhost:${PORT}/api/health`);
    console.log('\n📡 Connected Services:');
    console.log(`   - Book API: ${config.bookApi.baseUrl}`);
    console.log(`   - Music API: ${config.musicApi.baseUrl}`);
    console.log(`   - Gemini AI: ${config.gemini.apiKey ? '✓ Configured' : '✗ Not configured'}`);
    console.log('\n👉 Ready to process requests!\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('\nSIGINT signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});
