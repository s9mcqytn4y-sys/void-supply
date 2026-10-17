# PRD - VOID Supply (E-Commerce Merchandise)

## 1. Ringkasan Produk & Sasaran

- **Tujuan Utama**: Menjual merchandise eksklusif secara online dengan pengalaman belanja yang cepat, responsif, berestetika streetwear brutalist utilitarian, dan terpercaya.
- **Target Pasar**: Usia 18 hingga 30 tahun (komunitas streetwear, merchandise kreatif, dan generasi digital).
- **Profil Persona Pengguna**: Terdokumentasi lengkap dalam [PERSONA.md](file:///c:/Projects/VOID%20Supply/PERSONA.md) dan [CUSTOMER_JOURNEY_MAP.md](file:///c:/Projects/VOID%20Supply/CUSTOMER_JOURNEY_MAP.md), mencakup Primary Buyer (Rian "The Trendsetter" Pratama) dan Secondary User (Dimas "Operations" Setyawan).
- **Riset Kompetitor & Celah Pasar**: Analisis benchmarking terhadap Erigo, Thanksinsomnia, dan Screamous terdokumentasi dalam [competitor-analysis.md](file:///c:/Projects/VOID%20Supply/docs/research/competitor-analysis.md), analisis celah peluang desain di [opportunity-gap.md](file:///c:/Projects/VOID%20Supply/docs/research/opportunity-gap.md), serta prinsip pengalaman pengguna di [ux-principles.md](file:///c:/Projects/VOID%20Supply/docs/research/ux-principles.md).
- **Arsitektur Informasi & Peta Situs**: Rancangan kanonikal dan navigasi mobile terdokumentasi dalam [SITE-MAP.md](file:///c:/Projects/VOID%20Supply/SITE-MAP.md) dan [advance_roadmap_void_supply.md](file:///c:/Projects/VOID%20Supply/docs/advance_roadmap_void_supply.md).
- **Perencanaan Wireframe & Desain UI/UX**: Spesifikasi tata letak, hierarki konten, komponen, interaksi, dan edge case terdokumentasi dalam [WIREFRAME.md](file:///c:/Projects/VOID%20Supply/WIREFRAME.md).
- **Aksi Utama Pengguna**: Menjelajah katalog Drop 04, menentukan ukuran dan varian warna, checkout dengan ongkir akurat terverifikasi server, membayar secara instan, dan melacak paket secara real-time.

---

## 2. Struktur Arsitektur 3 Pilar

VOID Supply dibangun menggunakan pemisahan arsitektur 3 pilar yang berbagi domain services terpadu:

### A. Public Storefront (Eksplorasi Bebas Tanpa Login)
1. **Home (`/`)**: Hero banner dinamis, koleksi merchandise unggulan, rilis terbaru, dan kategori produk.
2. **Katalog (`/katalog`)**: Katalog lengkap dengan filter kategori, ukuran, varian warna, rentang harga, dan sorting.
3. **Detail Produk (`/katalog/[slug]`)**: Galeri gambar resolusi tinggi, pemilih ukuran & warna, spesifikasi gramasi bahan riil, dan aksi keranjang.
4. **Keranjang (`/keranjang`)**: Ringkasan belanja, penyesuaian kuantitas, input voucher diskon, dan subtotal harga dengan persistensi Zustand.
5. **Checkout (`/checkout`)**: Formulir pengiriman, kalkulasi ongkos kirim server-authoritative via Biteship, dan pemanggilan Midtrans Snap SDK.
6. **Pelacakan Terbatas (`/lacak`)**: Halaman publik kanonikal untuk melacak posisi logistik paket via Biteship API tanpa membocorkan data pribadi pembeli.
7. **Halaman Brand & Legal**:
   - `/tentang`: Filosofi manufaktur, transparansi gramasi kain, studio Johar Baru.
   - `/kontak`: Formulir komunikasi studio dan informasi operasional.
   - `/syarat-ketentuan`: Ketentuan kontrak transaksi, reservasi stok 15 menit, dan hak kekayaan intelektual.
   - `/kebijakan-privasi`: Asas minimisasi data, enkripsi, dan proteksi IDOR SEC-02.
   - `/pengembalian`: Prosedur video unboxing, garansi cacat produksi, dan penukaran ukuran.

### B. Customer Account Center (Terautentikasi)
1. **Otentikasi & Sesi**: Guest dapat menyusun keranjang belanja; autentikasi diperlukan sebelum finalisasi checkout untuk mengikat pesanan ke akun permanen.
2. **Riwayat Pesanan (`/pesanan/[nomorPesanan]`)**: Status pembayaran live, countdown timer 15 menit, polling pembaruan status, dan trigger pembayaran gateway.
3. **Faktur Digital A4 (`/pesanan/[nomorPesanan]/faktur`)**: Bukti transaksi resmi dengan layout siap cetak (print stylesheet) terlindungi token akses.
4. **Label Resi Thermal (`/pesanan/[nomorPesanan]/resi`)**: Stiker pengiriman standar 100 x 150 mm terlindungi otorisasi IDOR SEC-02.
5. **Buku Alamat Tersimpan & Wishlist**: Preferensi pengiriman default dan artikel favorit.

### C. Admin Control Center (RBAC Internal)
1. **Order Management**: Pemantauan pesanan, verifikasi settlement, pembatalan, dan catatan internal.
2. **Katalog & Inventaris**: Pengaturan produk, varian multi-colorways, kontrol stok, dan peringatan batas minimum.
3. **Pengiriman & Fulfillment**: Penerbitan waybill, dispatch kurir, dan pemantauan delivery rate.
4. **Outbox Monitor & Exception Recovery**: Pemantauan antrean tugas asinkron, log pengiriman email, dan tombol retry manual untuk tugas gagal.
5. **Integrasi Gateway**: Audit notifikasi webhook Midtrans dan logistik Biteship.

---

## 3. Tech Stack Resmi & Spesifikasi Versi

| Kategori | Teknologi | Versi | Catatan Integrasi |
| :--- | :--- | :--- | :--- |
| **Framework** | Next.js | `16.3.8` | App Router, Turbopack, Server Actions |
| **UI Runtime** | React | `19.3.0` | React 19 Compiler ready, Server Components |
| **Bahasa** | TypeScript | `5.8.2` | Strict typing, generic constraints |
| **Build & Test** | Vite / Vitest | `6.2.0` / `3.0.7` | Vite 6 testing runner terintegrasi `@tailwindcss/vite`, 80/80 tests passing |
| **Styling** | Tailwind CSS | `4.0.0` | Tailwind CSS v4 native CSS engine (Zero IDE warnings) |
| **UI Primitives** | shadcn/ui | Latest | Radix primitives, Lucide React icons (`0.479.0`), Sonner Toaster (`closeButton: true`) |
| **Validasi Data** | Zod | `3.24.2` | Schema parsing & auto inference |
| **Formulir** | React Hook Form | `7.54.2` | `@hookform/resolvers` (`3.10.0`) |
| **State Klien** | Zustand | `5.0.3` | Store keranjang belanja lokal dengan hidrasi sinkron |
| **State Server** | TanStack Query | `5.67.1` | Client fetching & deduplication cache |
| **Database** | PostgreSQL | `18.6` | Instance lokal via `pg_ctl` port 5432 & Neon serverless driver ready |
| **ORM** | Drizzle ORM | `0.45.3` | Type-safe SQL schema & migrations (`drizzle-kit 0.30.5`), 6 file migrasi aktif |
| **Payment Gateway** | Midtrans Snap | `1.4.3` | Pembayaran QRIS, Virtual Account (BCA, Mandiri, BNI, BRI), GoPay |
| **Logistik & Kurir** | Biteship API | REST Official | Agregator JNE, SiCepat, J&T dengan server-authoritative rate quoting |
| **E2E Testing** | Playwright | `1.51.0` | Skenario checkout dan navigasi mobile |
| **Observabilitas** | Sentry | `11.4.0` | Error monitoring runtime & tunnel route `/monitoring` |
| **Hosting & CI** | Vercel | Production | Auto deploy via GitHub repository integration, GitHub Actions Staging Cron |

---

## 4. Integritas Transaksi & Keamanan (Modul 02.14 - 02.18)

1. **Two-Phase Reservation Pattern**: Pengurangan kuota stok atomik dengan window reservasi 15 menit. Jika pembayaran kedaluwarsa atau ditolak, stok dikembalikan ke database secara atomik.
2. **Proteksi IDOR via High-Entropy Token (SEC-02)**: Kolom `token_akses` (UUID v4) memproteksi halaman pesanan, faktur cetak A4, dan label resi thermal.
3. **Idempotensi Webhook & Signature SHA-512**: Webhook Midtrans diverifikasi menggunakan formula kriptografis SHA-512 `order_id + status_code + gross_amount + serverKey`. Webhook ganda dicegah memutasi stok berulang.
4. **Transactional Outbox Engine dengan Lease Recovery**: Tugas email notifikasi dan booking Biteship dieksekusi melalui antrean basis data atomik dengan *Lease Reaper* otomatis untuk memulihkan worker yang terhenti lebih dari 5 menit.
5. **Logistik Server-Authoritative**: Browser dilarang memanipulasi tarif ongkos kirim. Server menghitung gramasi riil dari database dan memvalidasi penawaran resmi Biteship.
6. **Isolasi Lingkungan Fail-Closed**: Simulator pembayaran dan logistik dikunci ketat hanya untuk lingkungan non-produksi dengan flag eksplisit `ALLOW_PAYMENT_MOCK=true`.

---

## 5. Standar Kualitas & Anti-Slop (Mode 1: DURING)

- **Bebas Em Dash**: Dilarang keras memakai karakter em dash (`—`) pada seluruh teks copywriting, UI, dan komentar kode.
- **Desain Mobile-First**: Seluruh tombol interaktif memiliki tap target minimal 44px (`min-h-11`) tanpa horizontal overflow.
- **Standar Aksesibilitas**: Rasio kontras teks minimal WCAG AA (4.5:1) dengan focus indicator terlihat jelas pada navigasi keyboard.
- **Asset Authenticity**: Seluruh logo metode pembayaran dan kurir menggunakan aset resmi transparan beresolusi tinggi, bukan file placeholder tiruan atau gambar arbitrer.
- **Data Kejujuran**: Spesifikasi berat gramasi kain (500 GSM French Terry, 24s Cotton Combed), status kurir, dan biaya transaksi disajikan secara faktual.
