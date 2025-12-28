/**
 * Manual Book Cover URL Mapping
 * 
 * Tambahkan URL cover untuk buku-buku tertentu di sini.
 * Format: 'Book Title' (case-insensitive) : 'Cover Image URL'
 * 
 * Tips:
 * - Gunakan URL gambar dari Google Books, Amazon, atau Goodreads
 * - Pastikan URL adalah direct link ke gambar (jpg/png)
 * - Ukuran ideal: minimal 300x400px (aspek ratio 2:3)
 */

const MANUAL_BOOK_COVERS = {
    // Local covers (offline) - No CSP issues!
    'Harry Potter and the Sorcerer\'s Stone': '/images/covers/harry-potter.jpg',
    'To Kill a Mockingbird': '/images/covers/to-kill-mockingbird.jpg',
    '1984': '/images/covers/1984.jpg',
    'The Great Gatsby': '/images/covers/great-gatsby.jpg',
    'The Catcher in the Rye': '/images/covers/the-catcher.jpg',
    'Pride and Prejudice': '/images/covers/pride-and-prejudice.jpg',
    'The Hobbit': '/images/covers/the-hobbit.jpg',
    'The Da Vinci Code': '/images/covers/davinci-code.jpg',





    // Tambahkan cover buku Anda di sini:
    // 'Judul Buku': '/images/covers/nama-file.jpg',
};

module.exports = MANUAL_BOOK_COVERS;
