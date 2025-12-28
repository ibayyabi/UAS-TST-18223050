const axios = require('axios');
const config = require('../config/config');

/**
 * Service untuk berinteraksi dengan Book Catalog API.
 * Mendukung fitur Pencarian, Filter Genre, Rating, dan Pagination.
 */
class BookService {
    constructor() {
        this.baseUrl = config.bookApi.baseUrl;
        this.apiKey = config.bookApi.apiKey;
    }

    /**
     * Mengambil daftar buku dengan berbagai kriteria filter.
     * * @param {Object} filters - Objek filter untuk query data.
     * @param {string} [filters.search] - Kata kunci pencarian (Judul, Author, atau Tags).
     * @param {string} [filters.genre] - Filter berdasarkan kategori genre tertentu.
     * @param {string} [filters.top_rated] - Gunakan 'true' untuk mengurutkan dari rating tertinggi.
     * @param {number} [filters.page=1] - Nomor halaman untuk pagination.
     * @returns {Promise<Array>} Array berisi objek buku yang sudah dinormalisasi.
     */
    async getBooks(filters = {}) {
        try {
            const response = await axios.get(`${this.baseUrl}/books`, {
                params: {
                    apiKey: this.apiKey,
                    search: filters.search,
                    genre: filters.genre,
                    top_rated: filters.top_rated,
                    page: filters.page || 1
                },
                timeout: 5000
            });

            const books = response.data.data || [];
            return books.map(book => this._normalizeBook(book));
        } catch (error) {
            this._handleError(error, "Fetching list");
        }
    }

    /**
     * Mengambil detail informasi lengkap satu buku berdasarkan ID.
     * * @param {number|string} bookId - ID unik buku dari database.
     * @returns {Promise<Object>} Data lengkap satu buku (SELECT *).
     */
    async getBookById(bookId) {
        try {
            const response = await axios.get(`${this.baseUrl}/books/${bookId}`, {
                params: {
                    apiKey: this.apiKey
                },
                timeout: 5000
            });

            return this._normalizeBook(response.data.data);
        } catch (error) {
            this._handleError(error, `ID ${bookId}`);
        }
    }

    /**
     * Mengambil detail buku berdasarkan judul (title).
     * Strategi baru: Search untuk dapat ID, kemudian fetch detail lengkap by ID
     * @param {string} title - Judul buku.
     * @returns {Promise<Object>} Data lengkap buku dengan description.
     */
    async getBookByTitle(title) {
        try {
            // Step 1: Search untuk mendapatkan ID
            console.log(`Searching for book: "${title}"`);
            const response = await axios.get(`${this.baseUrl}/books`, {
                params: {
                    apiKey: this.apiKey,
                    search: title
                },
                timeout: 5000
            });

            const books = response.data.data || [];

            // Cari exact match (case insensitive)
            const exactMatch = books.find(book =>
                book.title.toLowerCase() === title.toLowerCase()
            );

            if (!exactMatch) {
                throw new Error(`Buku dengan judul "${title}" tidak ditemukan`);
            }

            // Step 2: Jika punya ID, fetch detail lengkap (termasuk description)
            if (exactMatch.id) {
                console.log(`✓ Found book "${title}" with ID ${exactMatch.id}, fetching full details...`);
                return await this.getBookById(exactMatch.id);
            }

            // Fallback: return data terbatas jika ID tidak ada
            console.warn(`⚠ Book "${title}" found but no ID, returning limited data`);
            return this._normalizeBook(exactMatch);
        } catch (error) {
            this._handleError(error, `Title "${title}"`);
        }
    }

    /**
     * Normalisasi struktur data buku agar konsisten di sisi klien.
     * @private
     */
    _normalizeBook(book) {
        if (!book) return null;
        return {
            id: book.id,
            title: book.title,
            author: book.author || 'Unknown',
            genre: book.genre,
            language: book.language || 'N/A', // Tambahkan ini
            pub_year: book.pub_year || 'N/A',   // Tambahkan ini
            age_category: book.age_category || 'General', // Tambahkan ini
            rating: book.rating || '0.0',
            tags: typeof book.tags === 'string' ? book.tags.split(',').map(t => t.trim()) : (book.tags || []),
            description: book.description || 'No description available.',
            page_count: book.page_count || 'N/A' // Pastikan ini terisi
        };
    }

    /**
     * Standarisasi penanganan error dari API.
     * @private
     */
    _handleError(error, context) {
        console.error(`[BookService Error] ${context}:`, error.message);
        const message = error.response?.data?.message || `Gagal akses Book API (${context})`;
        throw new Error(message);
    }
}

module.exports = new BookService();