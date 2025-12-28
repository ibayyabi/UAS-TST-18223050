/**
 * THE READING SOUNDTRACK - Frontend Application
 * Single Page Application with 6 Screen Flow
 */

const API_BASE_URL = '/api';

// Application State
const appState = {
    currentScreen: 'home',
    selectedBook: null,
    searchResults: [],
    currentPage: 1,
    trendingBooks: [],
    exploreResults: []
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
    loadTrendingBooks();
});

function initializeApp() {
    showScreen('home');
}

// Navigation & Screen Management
function showScreen(screenName) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
        screen.classList.add('hidden');
    });

    // Show selected screenshot
    const targetScreen = document.getElementById(`${screenName}-screen`);
    if (targetScreen) {
        targetScreen.classList.remove('hidden');
        targetScreen.classList.add('active');
        appState.currentScreen = screenName;
    }
}

// Event Listeners
function setupEventListeners() {
    // Navigation buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const screen = e.target.getAttribute('data-screen');
            showScreen(screen);
        });
    });

    // Back buttons
    document.querySelectorAll('.back-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const backTo = e.target.getAttribute('data-back');
            showScreen(backTo);
        });
    });

    // Home screen search
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');

    searchBtn.addEventListener('click', () => performSearch());
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });

    // Book detail - generate button
    const generateBtn = document.getElementById('generateBtn');
    if (generateBtn) {
        generateBtn.addEventListener('click', generateRecommendations);
    }

    // Explore music - apply filters
    const applyFiltersBtn = document.getElementById('applyFilters');
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', applyMusicFilters);
    }

    // Pagination
    const prevPage = document.getElementById('prevPage');
    const nextPage = document.getElementById('nextPage');

    if (prevPage) prevPage.addEventListener('click', () => changePage(-1)
    );
    if (nextPage) nextPage.addEventListener('click', () => changePage(1));
}

// Screen 1: Home / Trending Books
let trendingPage = 1;
const BOOKS_PER_PAGE = 8; // 2 rows x 4 columns

async function loadTrendingBooks() {
    try {
        const response = await fetch(`${API_BASE_URL}/search-books?name=&page=${trendingPage}`);
        const result = await response.json();

        if (result.success) {
            appState.trendingBooks = result.data;
            renderTrendingBooks();
        }
    } catch (error) {
        console.error('Error loading trending books:', error);
    }
}

function renderTrendingBooks() {
    const container = document.getElementById('trendingBooks');
    if (!container) return;

    container.innerHTML = '';

    // Show only 8 books (2 rows × 4 columns)
    const booksToShow = appState.trendingBooks.slice(0, BOOKS_PER_PAGE);

    booksToShow.forEach(book => {
        const card = document.createElement('div');
        card.className = 'book-card-small';
        card.onclick = () => selectBookForDetail(book);

        // Check if book has cover image
        const coverHtml = book.cover_url
            ? `<img src="${book.cover_url}" alt="${book.title}" class="book-cover-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
               <div class="book-icon" style="display:none;">📖</div>`
            : `<div class="book-icon">📖</div>`;

        card.innerHTML = `
            ${coverHtml}
            <h4 class="book-card-title">${book.title}</h4>
            <p class="book-card-author">${book.author}</p>
        `;

        container.appendChild(card);
    });

    // Add pagination controls
    renderTrendingPagination();
}

function renderTrendingPagination() {
    const section = document.getElementById('trendingSection');
    if (!section) return;

    // Remove existing pagination if any
    const existingPag = section.querySelector('.trending-pagination');
    if (existingPag) existingPag.remove();

    const pagination = document.createElement('div');
    pagination.className = 'trending-pagination';

    pagination.innerHTML = `
        <button id="trendingPrev" ${trendingPage === 1 ? 'disabled' : ''}>← Prev</button>
        <span class="page-indicator">Halaman ${trendingPage}</span>
        <button id="trendingNext">Next →</button>
    `;

    section.appendChild(pagination);

    // Add event listeners
    document.getElementById('trendingPrev')?.addEventListener('click', () => {
        if (trendingPage > 1) {
            trendingPage--;
            loadTrendingBooks();
        }
    });

    document.getElementById('trendingNext')?.addEventListener('click', () => {
        trendingPage++;
        loadTrendingBooks();
    });
}

// Screen 2: Search Results
async function performSearch() {
    const searchInput = document.getElementById('searchInput');
    const query = searchInput.value.trim();

    if (!query) {
        alert('Masukkan kata kunci pencarian');
        return;
    }

    showScreen('loading');
    updateLoadingText('Mencari buku...');

    try {
        const response = await fetch(`${API_BASE_URL}/search-books?name=${encodeURIComponent(query)}&page=1`);
        const result = await response.json();

        if (result.success) {
            appState.searchResults = result.data;
            appState.currentPage = 1;
            document.getElementById('searchQuery').textContent = `"${query}"`;
            renderSearchResults();
            showScreen('search-results');
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        alert('Error: ' + error.message);
        showScreen('home');
    }
}

function renderSearchResults() {
    const container = document.getElementById('searchResults');
    if (!container) return;

    container.innerHTML = '';

    if (appState.searchResults.length === 0) {
        container.innerHTML = '<p style="text-align:center; color: var(--text-secondary); padding: 2rem;">Tidak ada hasil ditemukan</p>';
        return;
    }

    appState.searchResults.forEach(book => {
        const card = document.createElement('div');
        card.className = 'book-card-small';
        card.onclick = () => selectBookForDetail(book);

        // Check if book has cover image
        const coverHtml = book.cover_url
            ? `<img src="${book.cover_url}" alt="${book.title}" class="book-cover-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
               <div class="book-icon" style="display:none;">📖</div>`
            : `<div class="book-icon">📖</div>`;

        card.innerHTML = `
            ${coverHtml}
            <h4 class="book-card-title">${book.title}</h4>
            <p class="book-card-author">${book.author}</p>
        `;

        container.appendChild(card);
    });
}

function changePage(step) {
    appState.currentPage += step;
    // Would need to re-fetch with new page number
    // For now, just prevent going below page 1
    if (appState.currentPage < 1) appState.currentPage = 1;

    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    const pageInfo = document.getElementById('pageInfo');

    if (prevBtn) prevBtn.disabled = (appState.currentPage === 1);
    if (pageInfo) pageInfo.textContent = `Halaman ${appState.currentPage}`;
}

// Screen 3: Book Detail
async function selectBookForDetail(book) {
    appState.selectedBook = book;

    showScreen('loading');
    updateLoadingText('Memuat detail buku...');

    try {
        // Fetch full book details
        let fullBook;
        if (book.id) {
            const response = await fetch(`${API_BASE_URL}/search-book/${book.id}`);
            const result = await response.json();
            fullBook = result.data;
        } else {
            fullBook = book; // Use what we have
        }

        appState.selectedBook = fullBook;
        renderBookDetail(fullBook);
        showScreen('book-detail');
    } catch (error) {
        alert('Error loading book details: ' + error.message);
        showScreen('home');
    }
}

function renderBookDetail(book) {
    // Render book cover
    const coverContainer = document.getElementById('detailCover');
    if (book.cover_url) {
        coverContainer.innerHTML = `<img src="${book.cover_url}" alt="${book.title}" class="book-cover-large-img" onerror="this.style.display='none'; this.parentElement.textContent='📖';">`;
    } else {
        coverContainer.textContent = '📖';
    }

    document.getElementById('detailTitle').textContent = book.title;
    document.getElementById('detailAuthor').textContent = book.author;
    document.getElementById('detailGenre').textContent = book.genre || 'General';
    document.getElementById('detailLanguage').textContent = book.language || 'N/A';
    document.getElementById('detailYear').textContent = book.pub_year || 'N/A';
    document.getElementById('detailPages').textContent = book.page_count || 'N/A';
    document.getElementById('detailRating').textContent = `⭐ ${book.rating || '0.0'}`;
    document.getElementById('detailDescription').textContent = book.description || 'Tidak ada deskripsi tersedia.';

    // Tags
    const tagsContainer = document.getElementById('detailTags');
    tagsContainer.innerHTML = '';
    if (book.tags && book.tags.length > 0) {
        book.tags.forEach(tag => {
            const tagEl = document.createElement('span');
            tagEl.className = 'tag';
            tagEl.textContent = tag;
            tagsContainer.appendChild(tagEl);
        });
    }
}

// Screen 4: AI Processing & Screen 5: Recommendations
async function generateRecommendations() {
    if (!appState.selectedBook) {
        alert('Tidak ada buku yang dipilih');
        return;
    }

    showScreen('loading');
    updateLoadingText('Menganalisis suasana buku...');

    try {
        // Use ID if available, otherwise use title
        let response;
        if (appState.selectedBook.id) {
            setTimeout(() => updateLoadingText('Mencocokkan dengan ritme yang tepat...'), 1500);
            response = await fetch(`${API_BASE_URL}/recommend/${appState.selectedBook.id}`);
        } else {
            setTimeout(() => updateLoadingText('Mencocokkan dengan ritme yang tepat...'), 1500);
            response = await fetch(`${API_BASE_URL}/recommend-by-title?title=${encodeURIComponent(appState.selectedBook.title)}`);
        }

        const result = await response.json();

        if (result.success) {
            renderRecommendations(result.data);
            showScreen('recommendation');
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        alert('Error generating recommendations: ' + error.message);
        showScreen('book-detail');
    }
}

function renderRecommendations(data) {
    const { book, musicProfile, recommendations } = data;

    // Selected book context with cover
    const selectedCover = document.getElementById('selectedCover');
    if (book.cover_url) {
        selectedCover.innerHTML = `<img src="${book.cover_url}" alt="${book.title}" class="selected-cover-img" onerror="this.style.display='none'; this.parentElement.textContent='📖';">`;
    } else {
        selectedCover.textContent = '📖';
    }

    document.getElementById('selectedTitle').textContent = book.title;
    document.getElementById('selectedAuthor').textContent = book.author;

    // Music profile
    document.getElementById('recGenre').textContent = musicProfile.primaryGenre;
    document.getElementById('recMood').textContent = musicProfile.mood;

    const energyPercent = (musicProfile.energy / 10) * 100;
    document.getElementById('recEnergy').style.width = `${energyPercent}%`;
    document.getElementById('recEnergyValue').textContent = `${musicProfile.energy}/10`;

    document.getElementById('recReasoning').textContent = musicProfile.reasoning;

    // Track count
    document.getElementById('trackCount').textContent = `${recommendations.length} lagu`;

    // Music tracks
    const tracksContainer = document.getElementById('musicTracks');
    tracksContainer.innerHTML = '';

    recommendations.forEach(track => {
        const trackEl = document.createElement('div');
        trackEl.className = 'track-item';

        trackEl.innerHTML = `
            <div class="track-artwork">🎵</div>
            <div class="track-info">
                <div class="track-title">${track.track_name || track.name}</div>
                <div class="track-artist">${track.artists || 'Unknown Artist'}</div>
            </div>
            <div class="track-meta">
                <span>🎼 ${track.track_genre || 'General'}</span>
            </div>
        `;

        tracksContainer.appendChild(trackEl);
    });
}

// Screen 6: Explore Music
async function applyMusicFilters() {
    const genre = document.getElementById('genreFilter').value;
    const mood = document.getElementById('moodFilter').value;

    showScreen('loading');
    updateLoadingText('Mencari musik...');

    try {
        let url = `${API_BASE_URL}/explore-music?limit=20`;
        if (genre) url += `&genre=${encodeURIComponent(genre)}`;
        if (mood) url += `&mood=${encodeURIComponent(mood)}`;

        const response = await fetch(url);
        const result = await response.json();

        if (result.success) {
            appState.exploreResults = result.data;
            renderExploreResults();
            showScreen('explore');
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        alert('Error exploring music: ' + error.message);
        showScreen('explore');
    }
}

function renderExploreResults() {
    const container = document.getElementById('exploreResults');
    if (!container) return;

    container.innerHTML = '';

    if (appState.exploreResults.length === 0) {
        container.innerHTML = '<p style="text-align:center; color: var(--text-secondary); padding: 2rem;">Tidak ada hasil ditemukan</p>';
        return;
    }

    appState.exploreResults.forEach(track => {
        const trackEl = document.createElement('div');
        trackEl.className = 'track-item';

        trackEl.innerHTML = `
            <div class="track-artwork">🎵</div>
            <div class="track-info">
                <div class="track-title">${track.track_name || track.name}</div>
                <div class="track-artist">${track.artists || 'Unknown Artist'}</div>
            </div>
            <div class="track-meta">
                <span>🎼 ${track.track_genre || 'General'}</span>
            </div>
        `;

        container.appendChild(trackEl);
    });
}

// Utility Functions
function updateLoadingText(text) {
    const loadingTextEl = document.getElementById('loadingSubtext');
    if (loadingTextEl) {
        loadingTextEl.textContent = text;
    }
}