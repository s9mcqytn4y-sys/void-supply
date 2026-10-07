# VOID Supply Environment & Configuration Guide

Dokumen ini mendefinisikan konsep, tata kelola, dan standarisasi konfigurasi lingkungan (_Environment Configuration_) untuk platform e-commerce VOID Supply.

---

## 1. Apa itu Environment?

Environment adalah **kondisi dan konteks sistem tempat aplikasi dijalankan dengan konfigurasi, kredensial, dan layanan pihak ketiga yang berbeda**.

Dalam rekayasa perangkat lunak modern, kode sumber (_source code_) aplikasi harus identik di semua tingkatan, tetapi perilakunya dikendalikan secara dinamis melalui konfigurasi lingkungan (_The Twelve-Factor App : Config_).

Aplikasi VOID Supply beroperasi dalam 3 tingkatan lingkungan:

```text
               [ Development ]                     [ Staging ]                     [ Production ]
Tujuan:       Pembangunan Fitur Lokal             Pengujian Menyeluruh (QA)        Penggunaan Pelanggan Riil
Lokasi:       Laptop Pengembang (localhost)       staging.voidsupply.com           voidsupply.com
Database:     PostgreSQL 18 Lokal (Port 5432)     PostgreSQL Managed Staging       PostgreSQL High-Availability
Payment:      Midtrans Sandbox (Snap Simulator)   Midtrans Sandbox                 Midtrans Production (Dana Riil)
Kurir:        Biteship Test API                   Biteship Sandbox                 Biteship Live Courier
Log/Monitor:  Terminal Console                    Sentry Staging Environment       Sentry Production Alerting
```

---

## 2. Perbedaan Rinci Antar Tingkatan Environment

### A. Development Environment (Lokal Pengembang)

- **Fokus Utama:** Kecepatan iterasi, kemudahan debugging, dan isolasi eksperimen kode.
- **Karakteristik:**
  - Berjalan pada URL lokal `http://localhost:3000`.
  - Database berjalan di mesin lokal pengembang (`127.0.0.1:5432/void_supply`).
  - Menggunakan kunci sandbox Midtrans (`SB-Mid-server-xxxx`). Pembayaran dapat disimulasikan menggunakan simulator Snap resmi tanpa uang riil.
  - Kesalahan (_errors_) ditampilkan secara mendalam pada layar peramban untuk mempercepat investigasi.

### B. Staging Environment (Pra-Produksi)

- **Fokus Utama:** Validasi integrasi sistem end-to-end dalam kondisi menyerupai lingkungan produksi sebelum rilis ke publik.
- **Karakteristik:**
  - Berjalan pada domain pratinjau seperti `staging.voidsupply.com` atau Vercel Preview Deployments.
  - Memiliki database terisolasi dari data produksi, sehingga pengujian beban dan penghapusan data aman dilakukan.
  - Tetap menggunakan Midtrans Sandbox dan Biteship Test API untuk mencegah tagihan kartu kredit atau pemanggilan kurir fisik secara tidak sengaja.
  - Menjalankan suite pengujian Playwright E2E secara otomatis.

### C. Production Environment (Produksi Publik)

- **Fokus Utama:** Ketersediaan tinggi (_High Availability_), keamanan data sensitif pelanggan, dan integritas finansial.
- **Karakteristik:**
  - Berjalan pada domain resmi `https://voidsupply.com`.
  - Terhubung ke kluster database produksi terenkripsi dengan replikasi otomatis dan backup berkala.
  - Menggunakan kunci produksi resmi Midtrans (`Mid-server-xxxx`). Transaksi QRIS dan Virtual Account memotong dana riil dari rekening pembeli.
  - Log galat dikirim secara terenkripsi ke Sentry tanpa menampilkan rincian teknis basis data kepada pengguna akhir.

---

## 3. Alur Pengelolaan Berkas Lingkungan (.env)

Kredensial rahasia tidak boleh tersimpan di dalam repositori Git. Kami menerapkan alur pengelolaan berkas standar industri:

```text
       .env.example
  (Templat Tanpa Nilai Rahasia)
  (Terdokumentasi & Terlacak di Git)
               │
               ▼ Developer melakukan salin berkas (copy)
        .env.local / .env
    (Kredensial Sandbox Lokal)
 (Dilindungi oleh aturan .gitignore)
               │
               ▼ Deployment ke Server Cloud
     Vercel Dashboard Settings
  (Environment Variables Terenkripsi)
```

### Mengapa .env Tidak Boleh Masuk ke Git?

1. **Pencegahan Kebocoran Kredensial (_Secret Leakage_):** Repositori publik atau privat yang diretas dapat mengekspos `DATABASE_URL` atau `MIDTRANS_SERVER_KEY`, yang memungkinkan pihak tidak bertanggung jawab memanipulasi transaksi atau mencuri data pembeli.
2. **Pemisahan Konfigurasi dan Kode Sumber:** Kode program yang bersih bersifat portabel dan dapat dijalankan di mesin developer mana pun tanpa perlu mengubah baris kode, hanya dengan menyediakan berkas `.env` lokal masing-masing.

---

## 4. Matriks Kontrak Variabel Lingkungan VOID Supply

| Nama Variabel                     | Batas Akses      | Tingkat Kritis | Deskripsi & Tujuan                                                                             |
| :-------------------------------- | :--------------- | :------------- | :--------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_APP_NAME`            | Klien & Server   | Rendah         | Nama resmi aplikasi untuk metadata HTML dan judul halaman (`VOID Supply`).                     |
| `NEXT_PUBLIC_APP_URL`             | Klien & Server   | Rendah         | URL dasar aplikasi untuk pembuatan link absolut dan canonical URL (`http://localhost:3000`).   |
| `DATABASE_URL`                    | **Hanya Server** | **Kritis**     | String koneksi terenkripsi ke PostgreSQL 18 untuk Drizzle ORM. Dilarang diekspos ke klien!     |
| `MIDTRANS_SERVER_KEY`             | **Hanya Server** | **Kritis**     | Kunci otentikasi server untuk membuat transaksi Snap token dan memverifikasi webhook Midtrans. |
| `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` | Klien & Server   | Sedang         | Kunci publik untuk inisialisasi pop-up Snap JS di browser pelanggan.                           |
| `MIDTRANS_IS_PRODUCTION`          | **Hanya Server** | Tinggi         | Penentu mode transaksi Midtrans (`false` untuk sandbox, `true` untuk produksi).                |
| `BITESHIP_API_KEY`                | **Hanya Server** | **Kritis**     | Kunci akses API resmi Biteship untuk cek tarif ongkir dan order kurir penjemputan.             |
| `BITESHIP_ORIGIN_POSTAL_CODE`     | **Hanya Server** | Sedang         | Kode pos gudang asal pengiriman barang VOID Supply (`55281` Sleman, D.I. Yogyakarta).          |
| `NEXT_PUBLIC_SENTRY_DSN`          | Klien & Server   | Rendah         | Alamat pengiriman laporan galat aplikasi ke dasbor monitoring Sentry.                          |

---

## 5. Validasi Runtime Variabel Lingkungan dengan Zod

Untuk mencegah aplikasi mengalami _crash_ mendadak di tengah transaksi akibat variabel lingkungan yang lupa dikonfigurasi, sistem memvalidasi seluruh variabel saat inisialisasi aplikasi menggunakan Zod:

```typescript
// Konsep Validasi Skema Environment (src/lib/env.ts)
import { z } from "zod";

export const envSkema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().url("DATABASE_URL harus berupa URL database yang valid"),
  MIDTRANS_SERVER_KEY: z.string().min(1, "MIDTRANS_SERVER_KEY wajib diisi"),
  NEXT_PUBLIC_MIDTRANS_CLIENT_KEY: z.string().min(1, "NEXT_PUBLIC_MIDTRANS_CLIENT_KEY wajib diisi"),
  MIDTRANS_IS_PRODUCTION: z.string().transform((val) => val === "true"),
  BITESHIP_API_KEY: z.string().min(1, "BITESHIP_API_KEY wajib diisi"),
  BITESHIP_ORIGIN_POSTAL_CODE: z.string().length(5, "Kode pos gudang asal harus 5 digit numerik"),
});
```

Jika ada variabel kritis yang kosong atau salah format, proses _build_ atau _startup_ server akan langsung berhenti dengan pesan galat yang jelas, mencegah kegagalan diam-diam (_silent failure_) di lingkungan produksi.
