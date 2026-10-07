# PRD - VOID Supply (E-Commerce Merchandise)

## 1. Ringkasan Produk & Sasaran

- **Tujuan Utama**: Menjual merchandise eksklusif secara online dengan pengalaman belanja yang cepat, responsif, dan terpercaya.
- **Target Pasar**: Usia 18 hingga 30 tahun (komunitas streetwear, merchandise kreatif, dan generasi digital).
- **Profil Persona Pengguna**: Terdokumentasi lengkap dalam [PERSONA.md](file:///c:/Projects/VOID%20Supply/PERSONA.md) dan [CUSTOMER_JOURNEY_MAP.md](file:///c:/Projects/VOID%20Supply/CUSTOMER_JOURNEY_MAP.md), mencakup Primary Buyer (Rian "The Trendsetter" Pratama) dan Secondary User (Dimas "Operations" Setyawan).
- **Riset Kompetitor & Celah Pasar**: Analisis benchmarking terhadap Erigo, Thanksinsomnia, dan Screamous terdokumentasi dalam [competitor-analysis.md](file:///c:/Projects/VOID%20Supply/docs/research/competitor-analysis.md).
- **Arsitektur Informasi & Peta Situs**: Rancangan 7 halaman utama dan navigasi mobile terdokumentasi dalam [SITE-MAP.md](file:///c:/Projects/VOID%20Supply/SITE-MAP.md).
- **Aksi Utama Pengguna**: Memilih produk merchandise, menentukan ukuran/varian, checkout dengan ongkir akurat, dan membayar secara instan.

---

## 2. Struktur Halaman & Fitur Utama

### A. Halaman Publik (Storefront)

1. **Home**: Hero banner dinamis, koleksi merchandise unggulan, rilis terbaru, dan kategori produk.
2. **Shop**: Katalog lengkap dengan filter kategori, ukuran, rentang harga, dan sorting popularitas/harga.
3. **Product Detail**: Galeri gambar resolusi tinggi, pemilih ukuran & stok real-time, deskripsi spesifikasi bahan, dan tombol aksi "Tambah ke Keranjang".
4. **Cart (Keranjang Belanja)**: Ringkasan belanja, penyesuaian kuantitas, input kupon diskon, dan subtotal harga.
5. **Checkout**: Input alamat pengiriman, kalkulasi ongkos kirim real-time via Biteship, pemilihan metode pembayaran Midtrans Snap.
6. **Order Result**: Status transaksi sukses/tertunda/gagal dari webhook Midtrans, ringkasan tagihan, dan nomor faktur pesanan.
7. **Order Tracking**: Lacak posisi paket dan status pengiriman kurir berdasarkan nomor resi.

### B. Modul Admin (Manajemen Internal)

1. **Products**: Manajemen katalog merchandise (tambah, edit, hapus, kelola varian & foto).
2. **Orders**: Pemantauan pesanan masuk, verifikasi status pembayaran Midtrans, dan update resi.
3. **Inventory**: Kontrol stok masuk/keluar secara real-time dan notifikasi stok menipis.
4. **Customers**: Data pelanggan terdaftar, riwayat transaksi, dan alamat pengiriman tersimpan.

---

## 3. Tech Stack Resmi & Spesifikasi Versi

| Kategori             | Teknologi       | Versi             | Catatan Integrasi                                        |
| :------------------- | :-------------- | :---------------- | :------------------------------------------------------- |
| **Framework**        | Next.js         | `16.3.8`          | App Router, Turbopack, Server Actions                    |
| **UI Runtime**       | React           | `19.3.0`          | React 19 Compiler ready, Server Components               |
| **Bahasa**           | TypeScript      | `5.8.2`           | Strict typing, generic constraints                       |
| **Build & Test**     | Vite / Vitest   | `6.2.0` / `3.0.7` | Vite 6 testing runner terintegrasi `@tailwindcss/vite`   |
| **Styling**          | Tailwind CSS    | `4.0.0`           | Tailwind CSS v4 native CSS engine                        |
| **UI Primitives**    | shadcn/ui       | Latest            | Radix primitives, Lucide React icons (`0.479.0`)         |
| **Validasi Data**    | Zod             | `3.24.2`          | Schema parsing & auto inference                          |
| **Formulir**         | React Hook Form | `7.54.2`          | `@hookform/resolvers` (`3.10.0`)                         |
| **State Klien**      | Zustand         | `5.0.3`           | Store keranjang belanja lokal                            |
| **State Server**     | TanStack Query  | `5.67.1`          | Client fetching & deduplication cache                    |
| **Database**         | PostgreSQL      | `18.6`            | Instance lokal via `pg_ctl` port 5432                    |
| **ORM**              | Drizzle ORM     | `0.45.3`          | Type-safe SQL schema & migrations (`drizzle-kit 0.30.5`) |
| **Payment Gateway**  | Midtrans Snap   | `1.4.3`           | Pembayaran QRIS, Virtual Account, & Kartu Kredit         |
| **Logistik & Kurir** | Biteship API    | Latest            | Agregator JNE, SiCepat, J&T, GoSend, Grab                |
| **E2E Testing**      | Playwright      | `1.51.0`          | Skenario checkout dan navigasi mobile                    |
| **Observabilitas**   | Sentry          | `11.4.0`          | Logging error runtime & performance tracking             |
| **Hosting & CI**     | Vercel          | Production        | Auto deploy via GitHub repository integration            |

---

## 4. Konvensi Penamaan Domain (Bahasa Indonesia)

- **Tabel Basis Data**: `produk`, `pesanan`, `item_pesanan`, `pelanggan`, `inventaris`, `pembayaran`, `pengiriman`.
- **Entitas TypeScript**: `Produk`, `Pesanan`, `ItemPesanan`, `Pelanggan`, `StatusPesanan`, `DetailPengiriman`.
- **Skema Zod**: `produkSkema`, `pesananSkema`, `checkoutSkema`.
- **Fungsi Server**: `buatPesanan()`, `ambilDaftarProduk()`, `prosesPembayaran()`, `hitungOngkir()`.

---

## 5. Standar Kualitas & Anti-Slop (Mode 1: DURING)

- Bebas dari karakter em dash (`—`) pada seluruh salinan teks antarmuka.
- Wajib mobile-first dengan batas minimum tombol 44px tap target dan tanpa overflow horizontal.
- Rasio kontras teks wajib memenuhi standar WCAG AA (4.5:1 untuk teks normal).
- Menampilkan data dan status secara jujur tanpa testimoni atau metrik fiktif.

---

## 6. Diferensiasi Lingkungan Repositori (Actual Local vs. GitHub Remote)

1. **Repositori Aktual (Lokal)**:
   - Berkas rahasia `.env` terkonfigurasi untuk integrasi lokal (Midtrans Sandbox, Biteship Test, RajaOngkir).
   - Berkas konfigurasi agen `.agents/` aktif lokal untuk orkestrasi panduan AI.
   - Basis data fisik PostgreSQL 18 berjalan lokal di port 5432.
2. **Repositori GitHub (`origin/main`)**:
   - Berkas `.env` dan `.agents/` diabaikan oleh `.gitignore` demi keamanan dan kebersihan repositori publik.
   - Berkas templat konfigurasi publik `.env.example` disediakan untuk kolaborator.
   - Berkas dokumentasi kurikulum bootcamp tersimpan di direktori `docs/bootcamp/module-01/`.
