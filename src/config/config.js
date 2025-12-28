require('dotenv').config();

const config = {
    port: process.env.PORT || 3000,

    gemini: {
        apiKey: process.env.GEMINI_API_KEY,
        model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp', // Default model
    },

    bookApi: {
        baseUrl: process.env.BOOK_API_BASE_URL,
        apiKey: process.env.BOOK_API_KEY,
    },

    musicApi: {
        baseUrl: process.env.MUSIC_API_BASE_URL,
        apiKey: process.env.MUSIC_API_KEY,
    },
};

// Validation
if (!config.gemini.apiKey) {
    console.error('ERROR: GEMINI_API_KEY is not defined in .env file');
    process.exit(1);
}

if (!config.bookApi.baseUrl) {
    console.error('ERROR: BOOK_API_BASE_URL is not defined in .env file');
    process.exit(1);
}

if (!config.bookApi.apiKey) {
    console.error('ERROR: BOOK_API_KEY is not defined in .env file');
    process.exit(1);
}

if (!config.musicApi.baseUrl) {
    console.error('ERROR: MUSIC_API_BASE_URL is not defined in .env file');
    process.exit(1);
}

if (!config.musicApi.apiKey) {
    console.error('ERROR: MUSIC_API_KEY is not defined in .env file');
    process.exit(1);
}

module.exports = config;
