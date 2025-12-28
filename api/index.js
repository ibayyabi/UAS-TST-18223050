// Vercel serverless function entry point
require('dotenv').config({ path: '../.env' });

const app = require('../src/app');

module.exports = app;
