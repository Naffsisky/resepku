# ResepKu Nusantara 🍳

Aplikasi web modern, ringan, dan responsif untuk mencari, membaca, dan memasak resep kuliner khas Nusantara. Terintegrasi langsung dengan API Cookpad Indonesia (**MealDB Indo v1**).

![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=flat&logo=next.js)
![React](https://img.shields.io/badge/React-19.2-blue?style=flat&logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat&logo=tailwind-css)
![CI/CD](https://img.shields.io/badge/GitHub_Actions-CI-2088FF?style=flat&logo=githubactions)
![Deploy](https://img.shields.io/badge/Deploy-Vercel-black?style=flat&logo=vercel)

---

## ✨ Fitur Unggulan

- ⚡ **Ultra-Ringan & Cepat**: Dibangun di atas Next.js 16 (App Router + Turbopack) dengan Incremental Static Regeneration (ISR) & Server-Side Rendering untuk First Contentful Paint yang instan.
- 🔒 **Bebas Mixed-Content & CORS**: Dilengkapi Route Handler Proxy (`/api/backend/...`) yang menjembatani browser HTTPS ke server API HTTP secara aman tanpa diblokir oleh browser di Vercel.
- 🔍 **Pencarian Cepat & Filter Kategori**: Cari berdasarkan bahan masakan, nama hidangan, atau filter kategori masakan (Ayam, Makan Siang, Masakan Tradisional).
- 🎲 **Inspirasi Masakan Acak**: Tombol *"Pilihkan Acak"* untuk membantu memilih menu harian ketika bingung mau masak apa.
- ⚖️ **Kalkulator Porsi Dinamis**: Otomatis menghitung dan mengalikan takaran bahan jika porsi dinaikkan atau diturunkan (misal 2 porsi menjadi 4 porsi).
- ✅ **Checklist Bahan Interaktif**: Koki dapat mengetuk bahan untuk menandai mana yang sudah siap di meja dapur.
- ⏱️ **Timer Masak Terintegrasi**: Pengatur waktu memasak langsung di dalam resep dengan preset 1, 3, 5, 10, 15 menit dan bunyi alarm pengingat.
- 📌 **Simpan Favorit Offline**: Simpan resep ke koleksi pribadi tanpa perlu login (sinkronisasi reaktif via LocalStorage).
- 📱 **Desain Responsif & Mobile-First**: Tampilan modern dengan bottom navigation bar untuk penggunaan satu tangan di smartphone.
- 🖨️ **Mode Cetak Bersih**: Siap dicetak langsung ke kertas atau PDF tanpa elemen antarmuka yang mengganggu.
- 🔗 **Rute Berbagi SEO**: Mendukung URL spesifik `/resep/:id` dengan metadata OpenGraph untuk dibagikan ke WhatsApp atau media sosial.

---

## 🛠️ Arsitektur & Teknologi

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, TypeScript)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **API Sumber**: [MealDB Indo v1](http://43.157.202.20/api/v1/docs) (Cookpad Indonesia dataset)
- **CI/CD**: GitHub Actions (`.github/workflows/ci.yml`)
- **Hosting**: [Vercel](https://vercel.com/)

---

## 🚀 Menjalankan Secara Lokal

1. **Clone repository:**
   ```bash
   git clone https://github.com/Naffsisky/resepku.git
   cd resepku
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Jalankan development server:**
   ```bash
   npm run dev
   ```

4. Buka [http://localhost:3000](http://localhost:3000) di browser.

---

## 🚢 Deploy ke Vercel (CI/CD Otomatis)

### Cara 1: Hubungkan Repository GitHub (Direkomendasikan)
1. Push kode ke GitHub:
   ```bash
   git push -u origin main
   ```
2. Buka dashboard [Vercel](https://vercel.com/new).
3. Pilih repository **`Naffsisky/resepku`**.
4. Vercel akan otomatis mendeteksi konfigurasi Next.js.
5. (Opsional) Tambahkan Environment Variable jika ingin mengarahkan API URL khusus:
   - `API_BASE_URL` = `http://43.157.202.20/api/v1`
6. Klik **Deploy**. Setiap kali ada push ke branch `main`, GitHub Actions CI akan memverifikasi build & lint, dan Vercel akan otomatis men-deploy versi terbaru!

### Cara 2: Deploy menggunakan Vercel CLI
```bash
npm i -g vercel
vercel
```

---

## 🧪 Pipeline CI / CD (`.github/workflows/ci.yml`)

Workflow GitHub Actions otomatis menjalankan:
- **Node.js 22** environment
- `npm ci` untuk instalasi dependency yang bersih dan deterministik
- `npm run lint` (ESLint 9 & TypeScript checks)
- `npm run build` (Turbopack production build)
- Memastikan tidak ada kode yang merusak build sebelum merge ke `main`.

---

## 📄 Lisensi

Dibuat untuk keperluan edukasi dan kuliner rumahan Indonesia. Data resep bersumber dari Cookpad Indonesia.
