/**
 * Logika Frontend - THE READING SOUNDTRACK
 */
const API_BASE_URL = '/api';

const state = {
    currentPage: 1,
    currentSearch: '',
    currentBook: null
};

document.addEventListener('DOMContentLoaded', () => {
    // Jalankan loadBooks pertama kali
    loadBooks();

    const searchBtn = document.getElementById('searchBtn');
    const bookIdInput = document.getElementById('bookIdInput');

    searchBtn.addEventListener('click', () => {
        state.currentSearch = bookIdInput.value.trim();
        state.currentPage = 1;
        loadBooks();
    });

    bookIdInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            state.currentSearch = bookIdInput.value.trim();
            state.currentPage = 1;
            loadBooks();
        }
    });

    // Ganti bagian listener klik Anda menjadi seperti ini:
    document.getElementById('musicTracks').addEventListener('click', (e) => {
        const target = e.target;

        // 1. Handle tombol Pilih Buku
        const btnPilih = target.closest('.btn-pilih');
        if (btnPilih) {
            const bookId = btnPilih.getAttribute('data-id');
            const bookTitle = btnPilih.getAttribute('data-title');
            if (bookId) showBookDetail(bookId);
            else if (bookTitle) showBookDetailByTitle(bookTitle);
            return; // Keluar agar tidak mengecek logika di bawah
        }

        // 2. Handle tombol AI
        const btnAi = target.closest('.btn-ai');
        if (btnAi) {
            const bookId = btnAi.getAttribute('data-id');
            const bookTitle = btnAi.getAttribute('data-title');
            if (bookId) getFinalAiSoundtrack(bookId);
            else if (bookTitle) getFinalAiSoundtrackByTitle(bookTitle);
            return;
        }

        // 3. Handle Navigasi (Prev/Next/Back) - INI PERBAIKANNYA
        if (target.closest('.btn-prev')) {
            state.currentPage--;
            loadBooks();
        } 
        else if (target.closest('.btn-next')) {
            state.currentPage++;
            loadBooks();
        } 
        else if (target.closest('.btn-back')) {
            loadBooks();
        }
    });
});

async function loadBooks() {
    toggleLoading(true, "Memuat katalog buku...");
    const resultsSection = document.getElementById('resultsSection');
    const musicTracks = document.getElementById('musicTracks');

    // Pastikan area hasil bersih sebelum load
    resultsSection.classList.add('hidden');

    try {
        // Gunakan parameter 'search' atau 'name' sesuai controller kamu
        const response = await fetch(`${API_BASE_URL}/search-books?name=${encodeURIComponent(state.currentSearch)}&page=${state.currentPage}`);
        const result = await response.json();

        if (!result.success) throw new Error(result.error);

        document.querySelector('.book-card').classList.add('hidden');
        document.querySelector('.music-card').classList.remove('hidden');
        document.querySelector('.music-card .card-header h2').textContent = "📚 Katalog Buku";

        renderBookList(result.data, musicTracks);
        resultsSection.classList.remove('hidden');
    } catch (error) {
        displayError(error.message);
    } finally {
        toggleLoading(false);
    }
}

function renderBookList(books, container) {
    container.innerHTML = (books && books.length > 0) ? '' : '<p style="color:white; text-align:center;">Buku tidak ditemukan.</p>';

    if (books) {
        books.forEach(book => {
            const div = document.createElement('div');
            div.className = 'track-item';
            div.style.marginBottom = "12px";

            // Prioritaskan ID jika ada, fallback ke title
            const identifier = book.id
                ? `data-id="${book.id}"`
                : `data-title="${book.title}"`;

            div.innerHTML = `
                <div class="track-info">
                    <div class="track-title">${book.title}</div>
                    <div class="track-artist">${book.author} | ⭐ ${book.rating || '0.0'}</div>
                </div>
                <button class="retry-btn btn-pilih" style="background:#4F46E5" ${identifier}>Detail</button>
            `;
            container.appendChild(div);
        });
    }

    const nav = document.createElement('div');
    nav.style.cssText = "display:flex; justify-content:center; gap:10px; margin-top:20px;";
    nav.innerHTML = `
        <button class="retry-btn btn-prev" ${state.currentPage === 1 ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : ''}>Prev</button>
        <span style="color:white; align-self:center">Halaman ${state.currentPage}</span>
        <button class="retry-btn btn-next">Next</button>
    `;
    container.appendChild(nav);
}

/**
 * TAHAP 2: Menampilkan Detail Buku (Termasuk Rating)
 */
async function showBookDetail(id) {
    toggleLoading(true, "Mengambil detail buku...");
    try {
        const response = await fetch(`${API_BASE_URL}/search-book/${id}`);
        const result = await response.json();

        if (!result.success) throw new Error(result.error);
        state.currentBook = result.data;

        // Tampilkan Detail di Card Kiri
        updateBookInfoUI(state.currentBook);
        document.querySelector('.book-card').classList.remove('hidden');

        // Ganti Card Kanan jadi tombol konfirmasi AI
        const musicTracks = document.getElementById('musicTracks');
        document.querySelector('.music-card .card-header h2').textContent = "✨ Rekomendasi Soundtrack";
        musicTracks.innerHTML = `
            <div style="text-align:center; padding: 2rem;">
                <p style="color:white; margin-bottom:20px;">Sukai buku ini? Gemini AI akan menganalisis suasananya untuk mencari lagu yang pas.</p>
                <button class="search-btn btn-ai" style="width:100%; justify-content:center;" data-id="${id}">
                    🔍 Dapatkan Soundtrack AI
                </button>
                <button class="retry-btn btn-back" style="margin-top:15px; width:100%; background:transparent; border:1px solid white;">
                    🔙 Kembali ke Katalog
                </button>
            </div>
        `;
    } catch (error) {
        displayError(error.message);
    } finally {
        toggleLoading(false);
    }
}

/**
 * TAHAP 2b: Menampilkan Detail Buku by Title
 */
async function showBookDetailByTitle(title) {
    toggleLoading(true, "Mengambil detail buku...");
    try {
        const response = await fetch(`${API_BASE_URL}/book-by-title?title=${encodeURIComponent(title)}`);
        const result = await response.json();

        if (!result.success) throw new Error(result.error);
        state.currentBook = result.data;

        // Tampilkan Detail di Card Kiri
        updateBookInfoUI(state.currentBook);
        document.querySelector('.book-card').classList.remove('hidden');

        // Ganti Card Kanan jadi tombol konfirmasi AI
        const musicTracks = document.getElementById('musicTracks');
        document.querySelector('.music-card .card-header h2').textContent = "✨ Rekomendasi Soundtrack";

        // Prioritaskan ID jika ada, fallback ke title
        const identifier = state.currentBook.id
            ? `data-id="${state.currentBook.id}"`
            : `data-title="${title}"`;

        musicTracks.innerHTML = `
            <div style="text-align:center; padding: 2rem;">
                <p style="color:white; margin-bottom:20px;">Sukai buku ini? Gemini AI akan menganalisis suasananya untuk mencari lagu yang pas.</p>
                <button class="search-btn btn-ai" style="width:100%; justify-content:center;" ${identifier}>
                    🔍 Dapatkan Soundtrack AI
                </button>
                <button class="retry-btn btn-back" style="margin-top:15px; width:100%; background:transparent; border:1px solid white;">
                    🔙 Kembali ke Katalog
                </button>
            </div>
        `;
    } catch (error) {
        displayError(error.message);
    } finally {
        toggleLoading(false);
    }
}

/**
 * TAHAP 3: Proses Gemini AI & Musik
 */
async function getFinalAiSoundtrack(id) {
    toggleLoading(true, "Gemini AI sedang menganalisis buku...");
    try {
        const response = await fetch(`${API_BASE_URL}/recommend/${id}`);
        const result = await response.json();

        if (!result.success) throw new Error(result.error);

        renderFinalResults(result.data);
    } catch (error) {
        displayError(error.message);
    } finally {
        toggleLoading(false);
    }
}

/**
 * TAHAP 3b: Proses Gemini AI & Musik by Title
 */
async function getFinalAiSoundtrackByTitle(title) {
    toggleLoading(true, "Gemini AI sedang menganalisis buku...");
    try {
        const response = await fetch(`${API_BASE_URL}/recommend-by-title?title=${encodeURIComponent(title)}`);
        const result = await response.json();

        if (!result.success) throw new Error(result.error);

        renderFinalResults(result.data);
    } catch (error) {
        displayError(error.message);
    } finally {
        toggleLoading(false);
    }
}

/**
 * Helper UI Functions
 */
function changePage(step) {
    state.currentPage += step;
    loadBooks();
}

function updateBookInfoUI(book) {
    document.getElementById('bookTitle').innerHTML = `${book.title} <span style="font-size:0.9rem; color:gold; margin-left:10px;">⭐ ${book.rating || '0.0'}</span>`;
    document.getElementById('bookGenre').textContent = book.genre;
    document.getElementById('bookDescription').textContent = book.description || 'Tidak ada deskripsi.';
    document.getElementById('bookTags').innerHTML = (book.tags || []).map(t => `<span class="tag">${t}</span>`).join('');
    document.getElementById('bookAuthor').textContent = book.author;
    document.getElementById('bookLanguage').textContent = book.language;
    document.getElementById('bookYear').textContent = book.pub_year;
    document.getElementById('bookPages').textContent = book.page_count;
    document.getElementById('bookAge').textContent = book.age_category;
}

function renderFinalResults(data) {
    const { musicProfile, recommendations } = data;
    const musicTracks = document.getElementById('musicTracks');

    document.querySelector('.music-card .card-header h2').textContent = "🎵 Your Reading Soundtrack";

    // Update Profile AI
    document.getElementById('primaryGenre').textContent = musicProfile.primaryGenre;
    document.getElementById('mood').textContent = musicProfile.mood;
    document.getElementById('energyLevel').style.width = `${(musicProfile.energy / 10) * 100}%`;
    document.getElementById('energyValue').textContent = `${musicProfile.energy}/10`;
    document.getElementById('reasoning').textContent = musicProfile.reasoning;

    // Render Lagu
    musicTracks.innerHTML = '';
    document.getElementById('trackCount').textContent = recommendations.length;

    recommendations.forEach(track => {
        const div = document.createElement('div');
        div.className = 'track-item';
        div.innerHTML = `
            <div class="track-artwork">🎵</div>
            <div class="track-info">
                <div class="track-title">${track.track_name || track.name}</div>
                <div class="track-artist">${track.artists || 'Unknown Artist'}</div>
            </div>
            <div class="track-meta">
                <span>🎼 ${track.track_genre || 'General'}</span>
            </div>
        `;
        musicTracks.appendChild(div);
    });
}

function toggleLoading(isLoading, text = "") {
    const loadingState = document.getElementById('loadingState');
    if (isLoading) {
        loadingState.querySelector('.loading-text').textContent = text;
        loadingState.classList.remove('hidden');
    } else {
        loadingState.classList.add('hidden');
    }
}

function displayError(msg) {
    const errorState = document.getElementById('errorState');
    document.getElementById('errorMessage').textContent = msg;
    errorState.classList.remove('hidden');
    document.getElementById('resultsSection').classList.add('hidden');
}