require('dotenv').config();

const config = {
    port: process.env.PORT || 3000,

    gemini: {
        apiKey: process.env.GEMINI_API_KEY || '',
        model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp'
    },

    bookApi: {
        baseUrl: process.env.BOOK_API_BASE_URL || 'https://nafa.otwdochub.my.id',
        apiKey: process.env.BOOK_API_KEY || ''
    },

    musicApi: {
        baseUrl: process.env.MUSIC_API_BASE_URL || 'https://ibay.ibayderikfariqalghanzaka.my.id',
        apiKey: process.env.MUSIC_API_KEY || ''
    }
};

// Warn if critical keys are missing (but don't crash)
if (!config.gemini.apiKey && process.env.ENABLE_GEMINI !== 'false') {
    console.warn('⚠ WARNING: GEMINI_API_KEY not set. AI recommendations will use fallback.');
}

if (!config.bookApi.apiKey) {
    console.warn('⚠ WARNING: BOOK_API_KEY not set. Book API calls may fail.');
}

if (!config.musicApi.apiKey) {
    console.error('ERROR: MUSIC_API_KEY is not defined in .env file');
    process.exit(1);
}

module.exports = config;
