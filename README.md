# The Reading Soundtrack

Integration service that connects Book Catalog API with Music Catalog API using Gemini AI as decision maker.

## 📖 Overview

The Reading Soundtrack adalah layanan integrasi yang menghubungkan API Katalog Buku (Service A - Rekan) dengan API Katalog Musik (Service B - Saya). Layanan ini menggunakan Gemini AI untuk menganalisis deskripsi buku dan menentukan profil musik yang cocok, kemudian memberikan rekomendasi musik yang sesuai dengan atmosfer buku.

**Project ini adalah bagian dari Tugas 3 (Integrasi Layanan) untuk proyek akhir TST.**

## 🎯 Features

- ✅ Integrasi otomatis Book API → Gemini AI → Music API
- ✅ AI-powered music recommendation berdasarkan analisis buku
- ✅ Web interface yang modern dan responsive
- ✅ Real-time music profile generation (genre, mood, energy)
- ✅ Error handling dan fallback strategy
- ✅ RESTful API dengan JSON response

## 🏗️ Architecture

```
┌──────────┐    ┌─────────────────────┐    ┌─────────────┐
│  User    │───▶│  Integration API    │───▶│  Book API   │
│ Browser  │◀───│  (Orchestration)    │    │ (Service A) │
└──────────┘    └─────────────────────┘    └─────────────┘
                         │      │
                         │      └──────────▶┌─────────────┐
                         │                  │  Gemini AI  │
                         │                  │  (Decision  │
                         │      ┌───────────│   Maker)    │
                         │      │           └─────────────┘
                         │      ▼
                         └──────────────────▶┌─────────────┐
                                             │  Music API  │
                                             │ (Service B) │
                                             └─────────────┘
```

## 🚫 Deployment Strategy

**Layanan ini TIDAK dideploy di STB** karena:
- Beban komputasi AI (Gemini API calls) dapat menyebabkan latency
- Resource intensif (memory & CPU)
- STB harus fokus pada core service (Music API)
- Orchestration layer harus terpisah untuk scalability

**Recommended**: Deploy di server terpisah (VPS/Cloud) atau local development machine.

## 🛠️ Tech Stack

**Backend:**
- Node.js 18+
- Express.js 4.x
- Axios (HTTP client)
- @google/generative-ai (Gemini SDK)
- dotenv, cors, helmet

**Frontend:**
- HTML5 + Vanilla CSS + Vanilla JavaScript
- Modern responsive design with animations

## 📦 Installation

### Prerequisites

- Node.js version 18 or higher
- npm (Node Package Manager)
- API Keys:
  - Gemini AI API Key (from [Google AI Studio](https://ai.google.dev/))
  - Book API credentials (from rekan)
  - Music API credentials (yours)

### Setup Steps

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   ```

3. **Edit `.env` file:**
   ```env
   PORT=3000
   GEMINI_API_KEY=your_actual_gemini_api_key
   BOOK_API_BASE_URL=http://book-api-url.com/api
   BOOK_API_KEY=your_book_api_key
   MUSIC_API_BASE_URL=http://music-api-url.com/api
   MUSIC_API_KEY=your_music_api_key
   ```

## 🚀 Usage

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

Application will run at: `http://localhost:3000`

### Web Interface

1. Open browser and navigate to `http://localhost:3000`
2. Enter a Book ID in the search box
3. Click "Find Soundtrack"
4. View book information and music recommendations

### API Endpoints

#### Get Soundtrack Recommendations
```
GET /api/soundtrack/:bookId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "book": {
      "id": "123",
      "title": "The Underground Detective",
      "genre": "Mystery/Noir",
      "description": "...",
      "tags": ["crime", "urban", "1940s"]
    },
    "musicProfile": {
      "primaryGenre": "jazz",
      "secondaryGenre": "blues",
      "mood": "dark",
      "energy": 4,
      "tempo": "slow",
      "reasoning": "..."
    },
    "recommendations": [
      {
        "id": "m456",
        "title": "Midnight Blues",
        "artist": "Miles Davis",
        "genre": "jazz",
        "duration": 240
      }
    ]
  }
}
```

#### Health Check
```
GET /api/health
```

**Response:**
```json
{
  "success": true,
  "status": "ok",
  "timestamp": "2025-12-27T00:00:00.000Z",
  "services": {
    "gemini": "connected"
  }
}
```

## 📁 Project Structure

```
integrated_service/
├── src/
│   ├── config/
│   │   └── config.js              # Configuration management
│   ├── controllers/
│   │   └── soundtrackController.js # Main orchestration logic
│   ├── services/
│   │   ├── bookService.js         # Book API integration
│   │   ├── musicService.js        # Music API integration
│   │   └── geminiService.js       # Gemini AI integration
│   ├── prompts/
│   │   └── musicMappingPrompt.js  # Gemini AI prompts
│   ├── routes/
│   │   └── soundtrackRoutes.js    # API routes
│   ├── middleware/
│   │   └── errorHandler.js        # Error handling
│   ├── app.js                     # Express setup
│   └── server.js                  # Server initialization
├── public/
│   ├── index.html                 # Web interface
│   ├── css/
│   │   └── styles.css             # Styling
│   └── js/
│       └── app.js                 # Client JavaScript
├── .env                           # Environment variables
├── .env.example                   # Template
├── package.json                   # Dependencies
└── README.md                      # This file
```

## 🧪 Testing

### Manual Testing

```bash
# Health check
curl http://localhost:3000/api/health

# Get soundtrack for book ID 1
curl http://localhost:3000/api/soundtrack/1
```

### Testing Checklist

- [ ] Application starts without errors
- [ ] Web interface accessible in browser
- [ ] Search with valid Book ID returns results
- [ ] Book information displays correctly
- [ ] Music recommendations display correctly
- [ ] Music profile matches book atmosphere
- [ ] Error handling works (invalid Book ID)
- [ ] Response time acceptable (< 10 seconds)

## 🔧 Troubleshooting

**Error: "GEMINI_API_KEY is not defined"**
- Ensure `.env` file exists and contains valid API key
- Restart application after editing `.env`

**Error: "Book not found"**
- Verify Book API is running
- Check `BOOK_API_BASE_URL` in `.env`
- Verify Book ID is valid

**Error: "Music API unavailable"**
- Verify Music API is running
- Check `MUSIC_API_BASE_URL` and `MUSIC_API_KEY` in `.env`

**Slow response time**
- Normal latency is 2-5 seconds (3 API calls)
- Check internet connection
- Consider implementing caching

## 📚 Documentation

For detailed documentation, see:
- `README.txt` - Comprehensive operational guide (Indonesia)
- `ARCHITECTURE.md` - Technical architecture details

## 🤝 Integration Details

This service integrates three components:

1. **Book Catalog API** (Service A - Rekan): Provides book information
2. **Gemini AI**: Analyzes books and generates music profiles
3. **Music Catalog API** (Service B - Yours): Provides music recommendations

## 📄 License

This project is created for academic purposes (TST - Tugas 3).

## 👥 Contact

For questions or issues:
- Book API: Contact your rekan
- Music API: Your documentation
- Gemini AI: [Google AI Documentation](https://ai.google.dev/docs)

---

**Version:** 1.0.0  
**Last Updated:** 2025-12-27  
**Powered by:** Gemini AI
