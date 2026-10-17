# Rencana Lanjutan Fase 3: Transaction & Logistics Simulation Engine

> **Proyek**: VOID Supply (E-Commerce Merchandise)  
> **Fase**: Fase 3 (Simulation Engine, In-App Payment UX & Logistics)  
> **Tanggal**: 17 Oktober 2026  
> **Status**: Disetujui melalui Konsensus Grill-Me & Siap Eksekusi  

---

## 1. Ringkasan Eksekutif & Tujuan Utama

Fase 3 mentransformasi VOID Supply dari sistem transaksi transisional menjadi mesin transaksi dan logistik penuh yang mandiri (*self-contained*), terpercaya, dan siap diuji secara end-to-end oleh reviewer, investor, maupun penguji portofolio.

### Tiga Pilar Utama Fase 3:
1. **In-App Native Payment UX**: Melepaskan ketergantungan pada modal popup iframe Snap pihak ketiga, beralih ke pengalaman pembayaran resmi di dalam VOID Supply (Direct Virtual Account BCA, Mandiri, BNI, BRI dan QRIS dinamis dengan hitung mundur 15 menit).
2. **End-to-End Logistics & Commercial Output**: Alur pelacakan kurir bertahap di `/lacak`, pencetakan label resi thermal 100x150 mm dengan barcode Code128 presisi 203 DPI yang dapat dipindai laser scanner fisik, serta faktur komersial proporsional yang diarsipkan secara imutabel.
3. **Interactive Sandbox DevTools Drawer**: Panel terapung di mode staging/testing untuk menyimulasikan seluruh siklus transaksi dalam hitungan detik (pelunasan instan, pembatalan stok, trigger pergerakan kurir, dan deep-link Midtrans simulator).

---

## 2. Evaluasi Rinci 13 Poin Kebutuhan

### Poin 1: Penyesuaian Konfigurasi Workspace (.vscode, .prettierrc, .editorconfig, .git*)
- **Status Aktual**: Konfigurasi telah disinkronkan. Berkas `.gitattributes` telah dibuat untuk mengunci normalisasi baris teks `eol=lf` dan memperlakukan file media/aset sebagai binary.
- **Tindakan**: Pertahankan aturan pemformatan Prettier `singleQuote: false`, `tabWidth: 2`, `endOfLine: "lf"`. Pastikan VS Code mengeksekusi format on save tanpa konflik ekstensi.

### Poin 2: Arsitektur Transaction & Logistics Simulation Engine
- **DevTools Drawer**: Disediakan tombol mengambang (*floating pill*) `⚡ DevTools Sandbox` di pojok kanan bawah halaman `/pesanan/[nomorPesanan]` dan `/lacak` saat environment non-production atau `ALLOW_PAYMENT_MOCK=true`.
- **Fitur Drawer**:
  - Simulasi Pelunasan Instan (memicu webhook Midtrans settlement secara atomik).
  - Simulasi Pembatalan / Kedaluwarsa (menguji Compare-and-Set auto-release stok).
  - Simulasi Kurir Biteship (Pickup -> In Transit -> Delivered).
  - Deep-link Midtrans Simulator dengan nomor VA dan nominal terisi otomatis.

### Poin 3: Matriks Sasaran (Goals) dan Hasil Nyata (Outputs)
| Modul | Sasaran (Goals) | Output Nyata (Deliverables) |
| :--- | :--- | :--- |
| **Pembayaran** | Transisi dari modal Snap ke antarmuka native VOID Supply | Komponen `InAppPaymentViewer.tsx`, nomor VA resmi, QRIS SVG dinamis, copy-to-clipboard |
| **Logistik** | Resi thermal standar ekspedisi & pelacakan live | Rute `/resi/[nomorPesanan]`, Barcode Code128 vector 203 DPI, rute `/lacak` |
| **After-Sales** | Kepastian barang sampai & proteksi garansi | Tombol 'Konfirmasi Pesanan Diterima', garansi unboxing 2x24 jam, auto-selesai 5 hari |
| **Faktur** | Faktur legal komersial & audit trail | Rute `/faktur/[nomorPesanan]`, tabel `arsip_faktur` dengan hash integritas SHA-256 |
| **Integrasi** | Webhook Biteship aman & checklist production | Handler `/api/biteship/webhook` dengan HMAC SHA-256, panduan dashboard Biteship |
| **Developer DX** | Pengujian portofolio tanpa friksi pembayaran nyata | Drawer terapung devtools interaktif dengan reset dan simulasi instan |

### Poin 4: Modularisasi & Refactoring Rute Checkout dan Pesanan
- **Dekomposisi**: Memisahkan rute `/pesanan/[nomorPesanan]` menjadi komponen modular:
  - `PesananHeader.tsx` (Status badge, nomor pesanan, copy link).
  - `InAppPaymentViewer.tsx` (VA, QRIS, panduan transfer ATM/m-Banking).
  - `RincianBarangPesanan.tsx` (Thumbnail, artikel, varian, harga).
  - `AlamatDanKurirInfo.tsx` (Detail pengiriman, nomor resi, tombol lacak).
  - `AksiPesananBar.tsx` (Cetak faktur, cetak resi thermal, konfirmasi pesanan diterima).
  - `DevToolsSandboxDrawer.tsx` (Panel simulasi terisolasi).
- **Integritas DB & Rollback**: Setiap mutasi status pesanan dan saldo inventaris menggunakan transaksi atomik Drizzle `db.transaction()` dengan Compare-and-Set bersyarat.

### Poin 5: Konfirmasi Penerimaan Konsumen & Alur Purna Jual (After-Sales)
- **Status Saat Ini**: Alur pesanan berhenti di status `dikirim` tanpa konfirmasi tiba.
- **Solusi Dual-State Progressive**:
  1. Kurir mengubah status menjadi `terkirim` (Delivered) via Webhook Biteship.
  2. Pembeli melihat banner di rute `/pesanan` dan `/lacak`: *"Paket telah tiba di alamat tujuan. Harap periksa kelengkapan paket."*
  3. Pembeli menekan tombol **"Konfirmasi Pesanan Diterima"**.
  4. Status pesanan berubah menjadi `selesai`.
  5. Sistem mencatat `diterimaPada` dan menghitung `garansiBerakhirPada` (+48 jam).
  6. Masa garansi 2x24 jam ditampilkan dengan hitung mundur untuk hak retur/tukar bila terdapat cacat produksi dengan syarat video unboxing.
  7. **Auto-Selesai Fail-Safe**: Jika pembeli tidak menekan tombol dalam 5x24 jam sejak waktu `terkirim`, scheduler cron otomatis mengubah status menjadi `selesai`.

### Poin 6: Pemisahan Concern (Separation of Concerns)
- `/katalog`: Khusus penjelajahan produk, filter kategori, PDP, dan rekomendasi koleksi.
- `/lacak`: Rute kanonikal publik untuk cek resi mandiri tanpa memerlukan autentikasi login (hanya butuh nomor pesanan / nomor resi).
- `/checkout` & `/pesanan`: Wilayah transaksi privat yang diproteksi IDOR Access Token UUID v4.

### Poin 7: Barcode Resi Thermal Standar Ekspedisi (Code128 203 DPI)
- Menggunakan generator barcode Code128 berbasis pure vector SVG yang menghitung pola garis tipis dan tebal secara presisi matematis tanpa kompresi bitmap.
- Rasio lebar bar minimum 2.5 modul (memenuhi standar scanner optik 203 DPI milik JNE, SiCepat, dan J&T).
- Dilengkapi QR Code cadangan yang merujuk langsung ke URL pelacakan kanonikal: `https://void-supply.../lacak?resi={nomorResi}`.

### Poin 8: Faktur Legal & Pengarsipan Imutabel
- Layout faktur komersial proporsional standar A4 dengan kop resmi VOID Supply Jakarta Pusat, nomor faktur legal `INV/YYYYMMDD/8HEX`, rincian DPP dan PPN (bila berlaku), serta tanda tangan digital/stempel lunas.
- **Tabel `arsip_faktur`**: Menyimpan snapshot dokumen transaksi dalam format JSON imutabel dan SHA-256 hash saat pesanan berstatus `dibayar`, memastikan faktur tidak berubah meski harga master produk di masa depan diperbarui.

### Poin 9: Webhook Biteship Resmi & Dokumen Kepatuhan Produksi
- **Signature Security**: Header `x-biteship-signature` diverifikasi menggunakan HMAC SHA-256 dengan secret key `BITESHIP_WEBHOOK_SECRET`.
- **Event yang Ditangani**:
  - `order.status`: Memperbarui titik pelacakan dan status pengiriman (`allocated`, `picking_up`, `dropping_off`, `delivered`, `rejected`).
  - `order.waybill_id`: Menyimpan nomor resi aktual dari kurir ke tabel `pengiriman` dan menerbitkan label resi.
  - `order.price`: Merekonsiliasi selisih biaya ongkir aktual kurir dengan biaya yang dibayarkan pelanggan.

### Poin 10: Pengaturan Advance URLs Midtrans
Konfigurasi terdaftar di Portal Midtrans (Production & Sandbox):
- **Finish Redirect URL**: `${NEXT_PUBLIC_APP_URL}/pesanan/{order_id}?status=finish&token={token_akses}`
- **Unfinish Redirect URL**: `${NEXT_PUBLIC_APP_URL}/pesanan/{order_id}?status=unfinish&token={token_akses}`
- **Error Redirect URL**: `${NEXT_PUBLIC_APP_URL}/pesanan/{order_id}?status=error&token={token_akses}`
- **Payment Notification URL**: `${NEXT_PUBLIC_APP_URL}/api/midtrans/webhook`
- **Recurring & Account Linking URL**: Disiapkan untuk ekspansi langganan membership Drop di masa depan.

### Poin 11: Standarisasi Format ID Sistem
| Entitas | Pola Format ID | Contoh Nilai | Karakteristik |
| :--- | :--- | :--- | :--- |
| **Pesanan** | `VOID-YYYYMMDD-8HEX` | `VOID-20261017-A9F3C18E` | Unik, tahan tebakan, ramah baca |
| **Faktur** | `INV/YYYYMMDD/8HEX` | `INV/20261017/A9F3C18E` | Standar akuntansi komersial |
| **Resi Pengiriman** | `RESI-{KURIR}-{TIMESTAMP}` | `RESI-JNE-1792248383` | Format alfanumerik ekspedisi |
| **Token Akses Privasi**| UUID v4 | `9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d` | Entropi tinggi 122-bit (Anti-IDOR) |
| **SKU Varian** | `VOID-{DROP}-{KAT}-{WARNA}-{SIZE}` | `VOID-D04-CRG-BLK-M` | Hirarkis, terbaca logistik gudang |

### Poin 12: Interactive Sandbox DevTools Drawer
- Tombol mengambang elegan di pojok kanan bawah.
- Drawer geser dari kanan (*slide-over panel*) dengan fitur:
  - Tombol **"Bayar Instan (Simulasi Settlement)"**: Mengeksekusi server action pelunasan langsung.
  - Tombol **"Biteship: Kurir Mengambil Paket"**: Transisi status ke `dalam_pengiriman`.
  - Tombol **"Biteship: Paket Tiba (Delivered)"**: Transisi status ke `terkirim`.
  - Tombol **"Buka Midtrans Simulator"**: Deep link ke `https://simulator.sandbox.midtrans.com/` sekaligus menyalin nomor Virtual Account ke clipboard pengguna.
  - Tombol **"Kedaluwarsa / Batal"**: Uji pemulihan stok seketika.

### Poin 13: Transisi Penuh ke Native Payment UX
- Alur tanpa popup:
  1. Pada halaman checkout, pembeli memilih metode: BCA Virtual Account, Mandiri Bill, BNI VA, BRI VA, atau QRIS.
  2. Server membuat charge request ke Midtrans Core API.
  3. Nomor Virtual Account atau String QRIS dikembalikan dan disimpan di tabel `pembayaran`.
  4. Halaman `/pesanan/[nomorPesanan]` secara langsung merender QRIS dinamis atau kartu rekening VA lengkap dengan logo bank, nominal tagihan tepat, tombol salin satu-klik, dan panduan transfer mobile banking/ATM.

---

## 3. Penyesuaian Skema Basis Data (Database Schema Refinements)

### A. Kolom Tambahan pada Tabel `pesanan`:
- `diterimaPada`: `timestamp with time zone` (Waktu pembeli atau webhook menandai pesanan tiba).
- `garansiBerakhirPada`: `timestamp with time zone` (Batas akhir pengajuan retur/komplain 2x24 jam).
- `catatanPenerima`: `text` (Komentar atau konfirmasi kondisi paket saat diterima).

### B. Tabel Baru `arsip_faktur`:
- `id`: UUID (Primary Key).
- `fakturId`: UUID (Relasi ke tabel `faktur`).
- `nomorFaktur`: Varchar(60) (Unik).
- `snapshotPayload`: JSONB (Seluruh data faktur, item, nominal, tanggal, dan data pembeli saat diterbitkan).
- `hashIntegrity`: Varchar(64) (Hash SHA-256 dari payload untuk verifikasi keaslian dokumen hukum).
- `dibuatPada`: Timestamp with time zone.

### C. Kolom Tambahan pada Tabel `pembayaran`:
- `nomorVa`: Varchar(60) (Nomor Virtual Account yang diterbitkan gateway).
- `bankVa`: Varchar(30) (BCA, Mandiri, BNI, BRI, Permata).
- `qrString`: Text (String QRIS mentah untuk dirender ke SVG QR code).
- `instruksiPembayaran`: JSONB (Langkah-langkah transfer via ATM, M-Banking, dan Internet Banking).

---

## 4. Tahapan Rencana Aksi (Implementation Tasks)

- [ ] **Task 3.1: Skema Database & Migrasi Drizzle**:
  - Tambahkan kolom `diterimaPada`, `garansiBerakhirPada`, `nomorVa`, `bankVa`, `qrString`, dan tabel `arsip_faktur` pada `src/lib/db/schema.ts`.
  - Update interface TypeScript dan query builder.
- [ ] **Task 3.2: Generator Barcode Code128 Vector Standar Ekspedisi**:
  - Implementasikan helper mandiri `src/lib/barcode/code128.ts` yang merender SVG barcode Code128 tajam rasio 203 DPI.
  - Pasang di halaman cetak label thermal `/resi/[nomorPesanan]`.
- [ ] **Task 3.3: Komponen Cetak Faktur Legal & Snapshot Imutabel**:
  - Perbaiki rute cetak `/faktur/[nomorPesanan]` dengan tata letak komersial proporsional A4.
  - Buat Server Action untuk menyimpan snapshot faktur ke `arsip_faktur` saat pesanan berstatus dibayar.
- [ ] **Task 3.4: In-App Native Payment UX (Core API)**:
  - Bangun komponen `InAppPaymentViewer.tsx` di rute `/pesanan/[nomorPesanan]`.
  - Integrasikan rendering nomor VA bank lokal dan QRIS dinamis dengan countdown timer 15 menit.
- [ ] **Task 3.5: Webhook Handler Biteship & Verifikasi HMAC**:
  - Bangun route handler `/api/biteship/webhook` dengan validasi signature header `x-biteship-signature`.
  - Dukung update timeline `pelacakan_pengiriman` dan event penerbitan nomor resi.
- [ ] **Task 3.6: Sistem Konfirmasi Pembeli & After-Sales 2x24 Jam**:
  - Buat Server Action `konfirmasiPesananDiterimaAction`.
  - Tambahkan kartu status garansi purna jual unboxing di rute `/pesanan` dan `/lacak`.
- [ ] **Task 3.7: Interactive Sandbox DevTools Drawer**:
  - Bangun `DevToolsSandboxDrawer.tsx` terapung untuk kemudahan pengujian simulasi pelunasan, pergerakan kurir, dan deep link ke simulator Midtrans.
- [ ] **Task 3.8: Pengujian Menyeluruh (Vitest, REPL & Playwright)**:
  - Jalankan rangkaian unit test Vitest untuk memvalidasi state machine.
  - Perbarui skenario Playwright E2E untuk menguji seluruh siklus transaksi.
  - Verifikasi build lokal Next.js 16 (`npm run build`).
