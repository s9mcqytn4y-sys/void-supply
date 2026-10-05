# GEMINI.md - Panduan Arsitektur, Aturan Sistem & Konvensi Proyek

> **Proyek**: VOID Supply (E-Commerce Merchandise)  
> **Agen Utama**: Antigravity (Google DeepMind)  
> **Status GitHub Copilot**: Dinonaktifkan Permanen (Disabled)  
> **Bahasa Konvensi Penamaan**: Bahasa Indonesia (Domain & Business Logic)

---

## 1. Peran & Instruksi Agen Utama (Antigravity)

- **Agen Tunggal**: Antigravity adalah autonomous AI pair programmer utama untuk repositori VOID Supply.
- **Bebas Bloatware / Anti-Slop**: Jangan menambahkan komentar tidak berguna atau file boilerplate yang tidak diminta. Terapkan prinsip *Fix Terkecil yang Aman*.
- **Prioritas Referensi Dokumentasi**: Selalu gunakan dokumentasi resmi dan termutakhir (via Context7) untuk setiap library / framework.

---

## 2. Status Lingkungan & Versi Tools Terinstal

Berdasarkan audit sistem lokal per Oktober 2026:

| Tool / Runtime | Versi Terinstal | Lokasi / Eksekusi | Status Aktivasi |
| :--- | :--- | :--- | :--- |
| **Node.js** | `v22.23.2` | System PATH | Aktif |
| **npm** | `10.9.8` | System PATH | Aktif |
| **PostgreSQL** | `18.6` | `C:\Users\Acer\scoop\apps\postgresql\current\bin\pg_ctl.exe` | Cluster Aktif (`localhost:5432`) |
| **PHP CLI** | `8.5.10` | `C:\Users\Acer\scoop\apps\php\current\php.exe` | Aktif (`pdo_pgsql`, `curl`, `openssl`) |
| **Git** | `2.55.0.windows.5` | System PATH | Aktif |
| **GitHub CLI (`gh`)**| `2.101.0` | System PATH | Terotentikasi (`s9mcqytn4y-sys`) |

### Perintah Aktivasi PostgreSQL (`pg_ctl`)
Jika PostgreSQL belum berjalan, jalankan perintah berikut di terminal:
```powershell
pg_ctl -D "C:\Users\Acer\scoop\persist\postgresql\data" -l "C:\Users\Acer\scoop\persist\postgresql\data\server.log" start
```
Untuk memeriksa status server:
```powershell
pg_ctl -D "C:\Users\Acer\scoop\persist\postgresql\data" status
```
Untuk mematikan server:
```powershell
pg_ctl -D "C:\Users\Acer\scoop\persist\postgresql\data" stop
```

### Konfigurasi PHP (`php.ini`)
- Lokasi file: `C:\Users\Acer\scoop\persist\php\cli\php.ini`
- Modul pendukung aktif: `pdo_pgsql`, `pgsql`, `openssl`, `curl`, `mbstring`, `zip`, `zlib`.

---

## 3. Tech Stack Resmi

- **Bahasa**: TypeScript 5.8+ (Strict Mode aktif)
- **Framework**: Next.js 16 (App Router, Turbopack)
- **UI Runtime**: React 19.3
- **Styling**: Tailwind CSS v4 & Native CSS
- **Komponen UI**: shadcn/ui primitives (`clsx`, `tailwind-merge`, `cva`, `lucide-react`)
- **Validasi**: Zod (Type inference otomatis)
- **Formulir**: React Hook Form (`@hookform/resolvers/zod`)
- **State Klien**: React State, Context, & Zustand (bila diperlukan)
- **State Server**: TanStack Query v5 (bila diperlukan untuk client-side fetching/caching)
- **Database & ORM**: PostgreSQL 18 + Drizzle ORM (`drizzle-kit`)
- **Payment Gateway**: Midtrans Snap (`midtrans-client`)
- **Pengiriman / Logistik**: Biteship API
- **Pengujian**: Vitest + React Testing Library (Unit/Integration) & Playwright (E2E)
- **Observabilitas**: Sentry (`@sentry/nextjs`)
- **Deployment**: Vercel

---

## 4. Konvensi Penamaan (Bahasa Indonesia)

Seluruh entitas domain bisnis, skema database, dan alur aplikasi wajib mengikuti konvensi penamaan berbasis Bahasa Indonesia yang konsisten:

### A. Tabel Database & Kolom (Drizzle ORM)
- Format tabel: Jamak / Tunggal baku, `snake_case` huruf kecil.
- Contoh nama tabel:
  - `produk` (bukan *products*)
  - `pesanan` (bukan *orders*)
  - `item_pesanan` (bukan *order_items*)
  - `pelanggan` (bukan *customers*)
  - `inventaris` (bukan *inventories*)
  - `pembayaran` (bukan *payments*)
  - `pengiriman` (bukan *shipments*)
- Kolom timestamp standar: `dibuat_pada`, `diperbarui_pada`.

### B. Tipe TypeScript & Interface
- Format: `PascalCase` dengan bahasa Indonesia untuk entitas domain.
- Contoh:
  - `Produk`, `KategoriProduk`, `StatusPesanan`, `Pelanggan`, `DetailPengiriman`.

### C. Zod Schema
- Format: `camelCase` diakhiri dengan akhiran `Skema` atau `Schema`.
- Contoh:
  - `produkSkema`, `pesananSkema`, `alamatPengirimanSkema`.

### D. Server Actions & API Routes
- Format fungsi action: Kata kerja aktif bahasa Indonesia.
  - `buatPesanan()`, `ambilDaftarProduk()`, `perbaruiStatusPembayaran()`, `cekOngkirBiteship()`.

---

## 5. Aturan Struktur Folder & Batasan Kode

Struktur folder terstandarisasi di `src/`:
```text
src/
├── app/          # Next.js App Router (Halaman & API Routes)
├── components/   # UI Primitives & Reusable Components (shadcn/ui)
├── features/     # Feature-sliced modules (keranjang, checkout, produk, pesanan)
├── lib/          # Integrasi pihak ketiga (db/drizzle, midtrans, biteship, sentry)
├── types/        # Definisi type TypeScript global & domain
└── data/         # Mock data / seed data
    └── products.ts  # File data produk awal
```

### Constraints Ketat:
1. **Tidak Ada File Tambahan Tanpa Izin**: Di dalam `src/`, jangan menambahkan file dummy atau placeholder selain yang diinstruksikan.
2. **Keamanan Kredensial**: Dilarang keras melakukan commit terhadap file `.env` atau `.env.local` yang berisi secret asli. Selalu gunakan `.env.example`.
3. **Optimasi Performa Next.js 16 / React 19**:
   - Manfaatkan Server Components secara default.
   - Gunakan `"use client"` hanya pada interaktivitas tingkat daun (leaf component).
   - Hindari waterfall fetch dengan `Promise.all` paralel jika data independen.
