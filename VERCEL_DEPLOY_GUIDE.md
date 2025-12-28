# Deploy ke Vercel - Panduan Lengkap

## 📋 Checklist Sebelum Deploy

### 1. File Konfigurasi yang Sudah Dibuat
- ✅ `vercel.json` - Konfigurasi Vercel
- ✅ `.vercelignore` - File yang diabaikan saat deploy
- ✅ `package.json` - Updated dengan vercel-build script

---

## 🚀 Langkah-langkah Deploy

### Step 1: Install Vercel CLI (Optional - bisa via Web UI)

```bash
npm install -g vercel
```

### Step 2: Push Code ke GitHub

Pastikan semua perubahan sudah di-commit dan push ke GitHub:

```bash
git add .
git commit -m "Add Vercel configuration"
git push origin main
```

### Step 3: Deploy via Vercel Dashboard (RECOMMENDED)

1. Buka https://vercel.com/
2. Login dengan GitHub account
3. Click **"Add New Project"**
4. Import repository: `UAS-TST-18223050`
5. **JANGAN KLIK DEPLOY DULU!** Setup environment variables dulu

### Step 4: Setup Environment Variables

Di Vercel Dashboard, buka **Settings → Environment Variables**, tambahkan:

```
PORT=3000
GEMINI_API_KEY=your-actual-gemini-api-key
GEMINI_MODEL=gemini-2.0-flash-exp
ENABLE_GEMINI=true
BOOK_API_BASE_URL=https://nafa.otwdochub.my.id
BOOK_API_KEY=your-book-api-key
MUSIC_API_BASE_URL=https://ibay.ibayderikfariqalghanzaka.my.id
MUSIC_API_KEY=your-music-api-key
```

**PENTING:** 
- Jangan gunakan nilai `your-*-here`, gunakan API key asli!
- Jika kuota Gemini habis, set `ENABLE_GEMINI=false`

### Step 5: Deploy!

Setelah environment variables diset, klik **Deploy**.

---

## 🔧 Deploy via CLI (Alternative)

Jika menggunakan Vercel CLI:

```bash
# Login ke Vercel
vercel login

# Deploy
vercel

# Set environment variables
vercel env add GEMINI_API_KEY
vercel env add BOOK_API_KEY
vercel env add MUSIC_API_KEY

# Deploy to production
vercel --prod
```

---

## ⚠️ Penting untuk Diketahui

### 1. **Cover Buku Lokal Tidak Akan Ter-deploy**

File di `public/images/covers/*.jpg` diabaikan oleh `.vercelignore` karena ukuran file.

**Solusi:**
- **Opsi A:** Upload gambar ke CDN gratis (Imgur, Cloudinary)
- **Opsi B:** Gunakan URL eksternal di `bookCovers.js`
- **Opsi C:** Hapus baris di `.vercelignore` jika ukuran total < 100MB

Contoh gunakan CDN:
```javascript
// src/config/bookCovers.js
const MANUAL_BOOK_COVERS = {
    'Harry Potter': 'https://i.imgur.com/XXXXX.jpg', // Upload ke Imgur
    '1984': 'https://res.cloudinary.com/YYY/ZZZ.jpg', // Upload ke Cloudinary
};
```

### 2. **Serverless Limits**

Vercel serverless functions punya batasan:
- **Timeout:** 10 detik (free plan)
- **Memory:** 1024 MB
- Gemini API call bisa lambat, pastikan `ENABLE_GEMINI=false` jika rate limited

### 3. **Cold Start**

Vercel serverless bisa mengalami "cold start" (delay pertama kali):
- Request pertama: ~2-5 detik
- Request selanjutnya: normal

---

## 🧪 Testing Setelah Deploy

Setelah deploy berhasil, Vercel akan memberikan URL seperti:
```
https://uas-tst-18223050-xxxxx.vercel.app
```

Test:
1. Buka URL di browser
2. Test search buku
3. Test generate soundtrack
4. Cek browser console untuk errors

---

## 🐛 Troubleshooting

### Error: "Function Timeout"
**Penyebab:** Gemini API terlalu lambat
**Solusi:** Set `ENABLE_GEMINI=false` di environment variables

### Error: "500 Internal Server Error"
**Penyebab:** Environment variables tidak diset
**Solusi:** Cek Settings → Environment Variables, pastikan semua terisi

### Cover Buku Tidak Muncul
**Penyebab:** File lokal tidak ter-deploy
**Solusi:** 
1. Upload gambar ke Imgur: https://imgur.com/upload
2. Copy image URL
3. Update `src/config/bookCovers.js`:
   ```javascript
   'Harry Potter': 'https://i.imgur.com/abc123.jpg'
   ```
4. Commit & push → Vercel auto-redeploy

### API Keys Tidak Bekerja
**Penyebab:** Environment variables typo
**Solusi:** Vercel Dashboard → Settings → Environment Variables → Edit

---

## 📦 Upload Cover ke Imgur (Recommended)

Untuk cover buku lokal, upload ke Imgur:

1. Buka https://imgur.com/upload
2. Upload semua file `.jpg` dari `public/images/covers/`
3. Klik kanan tiap gambar → Copy Image Address
4. Update `src/config/bookCovers.js`:

```javascript
const MANUAL_BOOK_COVERS = {
    'Harry Potter and the Sorcerer\'s Stone': 'https://i.imgur.com/abc123.jpg',
    'To Kill a Mockingbird': 'https://i.imgur.com/def456.jpg',
    '1984': 'https://i.imgur.com/ghi789.jpg',
    // ... dst
};
```

5. Commit & push ke GitHub
6. Vercel akan auto-redeploy

---

## ✅ Verifikasi Deploy Sukses

Cek di Vercel Dashboard:
- **Status:** Ready (hijau)
- **Logs:** Tidak ada error merah
- **Functions:** 1 function (src/server.js)

Test endpoints:
- `https://your-app.vercel.app/` → Home page
- `https://your-app.vercel.app/api/health` → Health check
- `https://your-app.vercel.app/api/search-books?name=harry` → Search

---

## 🎉 Selesai!

Aplikasi Anda sekarang live di internet! 

**Next Steps:**
1. Share URL ke teman/dosen
2. Monitor usage di Vercel Dashboard
3. Jika ada error, cek Logs di Vercel

**Custom Domain (Optional):**
- Vercel Settings → Domains → Add domain
- Bisa gunakan domain gratis dari Freenom atau beli di Namecheap
