# Master Plan & Spesifikasi Rilis Final VOID Supply (Audit 8 Poin)

> **Proyek**: VOID Supply (Curated Heavyweight Technical Streetwear)  
> **Target Release**: Final Production Release  
> **Akun Verifikasi Demo**: `abdulaziz543333@gmail.com` (Abdul Aziz / `Password123!`)  
> **Domain Live Staging**: `https://void-supply-lemon.vercel.app`  
> **Database Production**: Neon Serverless PostgreSQL 18 (`void-supply-demo`)  
> **Kepatuhan Sistem**: Mode Anti-Slop (Mode 1: DURING), Konvensi Penamaan Bahasa Indonesia, WCAG 2.2 AA

---

## 1. Poin 0: Evaluasi Akun Demo, Integrasi Notifikasi & Nodemailer SMTP

### A. Reset & Status Akun Demo

- Akun demo utama telah berhasil direset dan dihubungkan ke email pengguna:
  - **Email**: `abdulaziz543333@gmail.com`
  - **Nama Lengkap**: `Abdul Aziz`
  - **Kata Sandi**: `Password123!`
  - **Alamat Terdaftar**: `Jl. Kramat Jaya Baru No. 12, RT 05 / RW 01, Johar Baru, Jakarta Pusat 10560`
  - **Status Database**: Entitas `pengguna` (BetterAuth) dan entitas `pelanggan` (Domain Transaksi) telah tersinkronisasi 100% pada Neon PostgreSQL.
  - **Hasil Uji Sesi Live**: Endpoint otentikasi `POST /api/auth/sign-in/email` menghasilkan status HTTP 200 dengan penerbitan token sesi aman `__Secure-better-auth.session_token`.

### B. Evaluasi Penggunaan Nodemailer Gmail SMTP vs Provider Eksternal

1. **Keunggulan Implementasi Saat Ini**:
   - Berjalan dengan transport Gmail SMTP resmi (`smtp.gmail.com:465` dengan SSL/TLS aktif).
   - Pengujian pengiriman email riil melalui helper `kirimEmailNotifikasi()` berhasil terkirim ke `abdulaziz543333@gmail.com` (Message ID: `526d19f8-10da-45ca-b8a2-64a672db262b`).
   - Menyertakan fallback transparan ke `resend` jika `GMAIL_APP_PASSWORD` tidak terdefinisi.
2. **Batasan & Rekomendasi Hardening**:
   - Kuota harian Gmail Personal SMTP dibatasi Google hingga 500 email per 24 jam. Ini ideal untuk fase staging, testing, dan rilis tertutup.
   - Untuk volume produksi tinggi (Drop Day), arsitektur disiapkan untuk beralih otomatis ke AWS SES atau Resend via transactional outbox worker tanpa mengubah kode template email.

---

## 2. Poin 1: Riset Kompetitor Streetwear Lokal (Erigo, Thanksinsomnia, Screamous)

Berdasarkan audit scraping langsung pada website resmi:

| Parameter Evaluasi | Erigo Store (`erigostore.co.id`) | Thanksinsomnia (`shopthanksinsomnia.com`) | Screamous (`screamous.com`) | Rekomendasi Implementasi VOID Supply |
| :--- | :--- | :--- | :--- | :--- |
| **Brand Identity** | Pop-streetwear mass market, warna cerah, visual komersial luas. | Edgy skate/streetwear, editorial gelap, monokromatik, kultur sub-urban. | Casual streetwear, fokus variasi fit (Boxy, Oversize 16s), grafis retro. | **Cyber-Brutalist Technical Streetwear**: Palet hitam pekat, tipografi mono industri, transparansi material GSM. |
| **Struktur Katalog** | Grid 3-4 kolom padat, tab kategori horizontal, sorting harga & terlaris. | Grid 2-3 kolom lapang (aspek rasio 4:5), visual lookbook besar, badge keterbatasan stok. | Filter multi-dimensi (kategori, ukuran, warna, harga), sorting standar e-commerce. | **Katalog Explorer Responsif**: Live search debounce 300ms, filter kategori, sakelar ready stock, query param URL langsung. |
| **Product Detail (PDP)** | Deskripsi singkat, seleksi varian cepat, upsell bundling, sticky checkout bar. | Foto editorial detail tekstur garmen, fit recommendation, panduan pencucian, limited counter. | Panduan ukuran visual terperinci, deskripsi bahan spesifik, opsi tukar size. | **Technical Garment Spec**: Tabel komposisi serat, gramasi GSM terverifikasi, detail double chainstitch, size chart cm presisi. |
| **Penerapan SEO** | Meta deskripsi dinamis, OpenGraph tag lengkap, breadcrumbs Schema.org. | Minimalis, judul artikel deskriptif, alt text gambar otomatis dari handle produk. | JSON-LD Product & Offer, sitemap otomatis, pengindeksan varian. | **SEO Tingkat Lanjut**: JSON-LD Organization + Product + BreadcrumbList lengkap, OpenGraph dinamis, sitemap terotomasi. |
| **Strategi Marketing** | Bundling promo otomatis, diskon bertingkat, notifikasi pop-up penawaran. | Rilis drop terbatas bertanggal, lookbook editorial per musim, akses eksklusif subscriber. | Diskon musiman, voucher cashback pertama, promo bundling atasan dan bawahan. | **Editorial Drop Model**: Countdown drop timer, bundling eksklusif diskon 18%, pendaftaran newsletter akses awal VIP. |

---

## 3. Poin 2: Evaluasi Arsitektur State Management & Komponen Klien

### A. Evaluasi Zustand Store (`useKeranjangStore`)

- **Kondisi Aktual**: Store keranjang belanja mengelola item, kuantitas, catatan, dan status drawer menggunakan middleware `persist` (Local Storage).
- **Proteksi Hidrasi**: Didukung oleh `CartHydrationProvider` yang mencegah rendering tidak sinkron (*hydration mismatch*) dengan menunggu sinyal hidrasi tuntas sebelum mengizinkan drawer membuka.
- **Penyempurnaan Module 03**: Batasan kuota item per SKU dibatasi maksimal 10 unit secara otomatis pada layer store dan disinkronkan ke server action.

### B. Evaluasi TanStack Query v5 vs Next.js Server Components

- **Pola Hibrida Efisien**:
  - Halaman katalog (`/katalog`) dan PDP (`/katalog/[slug]`) memanfaatkan **Server Components** murni dengan caching native Next.js untuk initial load berkecepatan tinggi dan indeksasi SEO sempurna.
  - Sisi interaktif (search, filter, sort) dikelola via state lokal reaktif dengan sinkronisasi ke URL search parameters melalui `useTransition()`.
  - Polling status pembayaran pada `/pesanan/[nomorPesanan]` dikelola via custom hook `usePollingStatusPesanan` dengan siklus back-off eksponensial (5 detik hingga 2 menit) tanpa membebani pool database.

---

## 4. Poin 3: Spesifikasi Komprehensif Sistem E-Commerce Lanjutan

### A. Product Management & Inventory Ledger

```sql
-- Skema Tabel Mutasi Inventaris (Stock Ledger)
CREATE TABLE mutasi_inventaris (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  varian_id VARCHAR(64) NOT NULL REFERENCES varian_produk(id),
  tipe_mutasi VARCHAR(32) NOT NULL, -- 'masuk_produksi', 'reservasi_checkout', 'rilis_kadaluwarsa', 'penjualan_selesai'
  perubahan_kuantitas INT NOT NULL,
  stok_sebelumnya INT NOT NULL,
  stok_setelahnya INT NOT NULL,
  referensi_id VARCHAR(64), -- Nomor pesanan atau ID faktur
  dibuat_pada TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### B. Promo, Pricing, Discounts & Voucher Engine

- **Model Diskon Fleksibel**:
  1. *Diskon Persentase* (contoh: 18% untuk Paket Bundling Cybernetic Division).
  2. *Potongan Tetap IDR* (contoh: Potongan Rp 50.000 untuk minimal belanja Rp 500.000).
  3. *Gratis Ongkos Kirim* (dengan batas maksimal subsidi).
- **Aturan Idempotensi & Kuota Penggunaan**:
  - Kolom `maksimal_penggunaan` dan `jumlah_terpakai`.
  - Pemeriksaan `penggunaan_per_pengguna` untuk mencegah eksploitasi kode promo berulang dari satu akun.
  - Perhitungan diskon dievaluasi secara server-authoritative sebelum pembentukan transaksi Midtrans Snap.

### C. CRM & Segmentasi Pelanggan

- Kategori Pelanggan:
  - `FIRST_TIME_BUYER`: Mendapatkan sambutan otomatis dan kode aktivasi selamat datang.
  - `RETURNING_COLLECTOR`: Pelanggan dengan akumulasi pesanan > 2 kali.
  - `VIP_NOCTURNE`: Pelanggan dengan total transaksi > Rp 2.500.000 (Mendapatkan akses 1 jam lebih awal pada tiap drop).

---

## 5. Poin 4: Kampanye Pre-Order & Bundling "CYBERNETIC DIVISION"

### A. Konsep Visual & Aset Kampanye

- **Visual Utama**: Foto editorial lookbook cyber-brutalist dengan pencahayaan neon ambient industrial dan tekstur garmen teknikal berbobot tinggi.
- **Aset Web-Ready**: Disimpan di `public/images/lookbook/cybernetic-division-campaign.jpg` dengan format terkompresi optimal, atribut `loading="lazy"`, dan responsive sizing Next.js Image.
- **Komponen Interaktif**: `src/features/landing/components/KampanyePreOrderBundling.tsx`.
- **Elemen Fitur**:
  - Countdown timer interaktif dengan status hidrasi aman.
  - Kartu spesifikasi 3 artikel bundling: Heavy Hoodie 420 GSM, Modular Cargo Pants, dan Storm Balaclava.
  - Skema harga transparan: Rp 1.199.000 (dari Rp 1.467.000, hemat Rp 268.000 / Diskon 18%).
  - Navigasi instan ke `/katalog?koleksi=cybernetic` dengan filter otomatis.

---

## 6. Poin 5: Fitur Wishlist, Cookie Tracking & Preferensi Pengguna

### A. Bilah Persetujuan Cookie (`BilahPersetujuanCookie.tsx`)

- Mematuhi prinsip privasi data dan regulasi internasional (GDPR / PDP Indonesia).
- Menyediakan 2 opsi jelas tanpa dark patterns:
  - **HANYA ESENSIAL**: Menyimpan cookie sesi dan proteksi IDOR checkout.
  - **TERIMA SEMUA**: Mengaktifkan analitik performa dan penyimpanan preferensi lokal.
- Terintegrasi di Root Layout tanpa mengganggu elemen Sonner Toaster.

### B. Desain Skema Database Wishlist & Preferensi

```sql
CREATE TABLE wishlist_pengguna (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pengguna_id VARCHAR(64) NOT NULL REFERENCES pengguna(id) ON DELETE CASCADE,
  produk_id VARCHAR(64) NOT NULL REFERENCES produk(id) ON DELETE CASCADE,
  dibuat_pada TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT uq_wishlist_pengguna_produk UNIQUE (pengguna_id, produk_id)
);

CREATE TABLE preferensi_pengguna (
  pengguna_id VARCHAR(64) PRIMARY KEY REFERENCES pengguna(id) ON DELETE CASCADE,
  bahasa VARCHAR(5) DEFAULT 'id',
  notifikasi_email_drop BOOLEAN DEFAULT TRUE,
  notifikasi_whatsapp_status BOOLEAN DEFAULT FALSE,
  diperbarui_pada TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 7. Poin 6: Arsitektur & Referensi Admin Interfaces

1. **Prinsip Tampilan Brutalist Streetwear Operator**:
   - Layout monitor gelap (dark canvas) dengan kontras tinggi untuk efisiensi visual operator gudang.
   - Tanpa animasi berlebihan yang memperlambat alur kerja fisik.
2. **Batch Fulfillment & Label Thermal 100x150mm**:
   - Komponen cetak resi batch yang langsung menghasilkan layout CSS print 100mm x 150mm tanpa margin berlebih.
   - Barcode Code128 untuk nomor pesanan dan kode pelacakan ekspedisi (JNE, SiCepat, J&T).
3. **Papan Kendali Status**:
   - Monitor status pesanan real-time: `menunggu_pembayaran`, `dibayar`, `sedang_dikemas`, `dikirim`, `selesai`.
   - Tindakan satu klik untuk generate airway bill (AWB) Biteship langsung dari antarmuka operator.

---

## 8. Poin 7: Audit Siklus Hidup Komponen, EventListener, Polling & Webhook

1. **EventListener Hygiene**:
   - Seluruh event listener pada countdown timer, scroll drawer, dan keyboard accessibility (Escape key) dilengkapi fungsi pembersih `return () => clearTimeout/removeEventListener` di dalam `useEffect`.
2. **Polling Back-off & Idempotensi**:
   - Hook polling status pesanan berhenti secara otomatis saat status mencapai kondisi terminal (`dibayar`, `dibatalkan`, `kadaluwarsa`).
3. **Compare-and-Set Webhook**:
   - Endpoint webhook Midtrans memvalidasi tanda tangan SHA-512 dan nominal `gross_amount` sebelum mengeksekusi update status atomik bersyarat di PostgreSQL.
4. **Sonner Toaster Refinement**:
   - Ditetapkan di posisi kanonikal `bottom-left` dengan offset yang aman dari navigasi mobile (`bottom: 5.5rem, left: 1rem`).

---

## 9. Poin 8: Audit Efisiensi Search, Filtering & Sorting

1. **Debounce 300ms**: Mencegah re-render berlebihan saat pengguna mengetik nama artikel busana.
2. **Sinkronisasi URL Search Params**: URL browser merefleksikan filter aktif (`/katalog?kategori=outerwear&q=hoodie&sort=harga-rendah`) sehingga tautan dapat dibagikan langsung.
3. **Penyaringan Ter-memoize**: `useMemo()` memproses filter kategori, stok, kata kunci, dan pengurutan harga secara instan di memori klien tanpa *round-trip* jaringan berulang.
4. **Empty State Informatif**: Dilengkapi tombol aksi langsung `RESET SEMUA FILTER` jika kueri pencarian tidak menghasilkan artikel.
