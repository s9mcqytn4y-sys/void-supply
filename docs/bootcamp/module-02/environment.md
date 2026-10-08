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

Aplikasi mengadopsi arsitektur _Dual-Slot Credentials_ yang memisahkan slot Sandbox (pengujian) dan slot Production (transaksi riil) secara berdampingan di `.env` dan `.env.example`:

| Nama Variabel                                | Batas Akses      | Tingkat Kritis | Lingkungan / Peran | Deskripsi & Tujuan                                                        |
| :------------------------------------------- | :--------------- | :------------- | :----------------- | :------------------------------------------------------------------------ |
| `NEXT_PUBLIC_APP_NAME`                       | Klien & Server   | Rendah         | Global             | Nama resmi aplikasi untuk metadata HTML (`VOID Supply`).                  |
| `NEXT_PUBLIC_APP_URL`                        | Klien & Server   | Rendah         | Global             | URL dasar aplikasi untuk canonical URL (`http://localhost:3000`).         |
| `DATABASE_URL`                               | **Hanya Server** | **Kritis**     | Dev Lokal          | String koneksi PostgreSQL 18 lokal Drizzle ORM.                           |
| `DATABASE_URL_STAGING`                       | **Hanya Server** | **Kritis**     | Staging            | String koneksi basis data pengujian pra-produksi.                         |
| `DATABASE_URL_PRODUCTION`                    | **Hanya Server** | **Kritis**     | Production         | String koneksi basis data rilis publik utama.                             |
| `MIDTRANS_IS_PRODUCTION`                     | **Hanya Server** | Tinggi         | Kontrol            | Penentu mode transaksi Midtrans (`false` = Sandbox, `true` = Production). |
| `MIDTRANS_SERVER_KEY_SANDBOX`                | **Hanya Server** | Kritis         | Sandbox            | Kunci server pengujian Midtrans Snap.                                     |
| `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY_SANDBOX`    | Klien & Server   | Sedang         | Sandbox            | Kunci klien pengujian pop-up Snap browser.                                |
| `MIDTRANS_MERCHANT_ID_SANDBOX`               | **Hanya Server** | Sedang         | Sandbox            | Merchant ID sandbox (`G357841497`).                                       |
| `MIDTRANS_SERVER_KEY_PRODUCTION`             | **Hanya Server** | **Kritis**     | Production         | Kunci server transaksi dana riil Midtrans.                                |
| `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY_PRODUCTION` | Klien & Server   | Sedang         | Production         | Kunci klien transaksi dana riil peramban.                                 |
| `MIDTRANS_MERCHANT_ID_PRODUCTION`            | **Hanya Server** | Sedang         | Production         | Merchant ID resmi produksi toko.                                          |
| `BITESHIP_ORIGIN_POSTAL_CODE`                | **Hanya Server** | Sedang         | Global             | Kode pos gudang asal VOID Supply (`55281` Sleman).                        |
| `BITESHIP_API_KEY_SANDBOX`                   | **Hanya Server** | Kritis         | Sandbox            | Kunci API pengujian tarif dan kurir Biteship.                             |
| `BITESHIP_API_KEY_PRODUCTION`                | **Hanya Server** | **Kritis**     | Production         | Kunci API resmi pengiriman dan penjemputan kurir riil.                    |
| `NEXT_PUBLIC_SENTRY_DSN`                     | Klien & Server   | Rendah         | Global             | Alamat pengiriman pemantauan galat Sentry.                                |

---

## 5. Validasi Runtime Variabel Lingkungan dengan Zod & Resolusi Dinamis

Sistem menyelesaikan kredensial aktif secara dinamis di runtime berdasarkan nilai flag `MIDTRANS_IS_PRODUCTION`:

```typescript
// Konsep Resolusi Kredensial Dinamis (src/lib/env.ts)
import { z } from "zod";

export const envSkema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().url("DATABASE_URL harus berupa URL database yang valid"),

  // Kontrol Lingkungan
  MIDTRANS_IS_PRODUCTION: z.string().transform((val) => val === "true"),

  // Midtrans Dual-Slot
  MIDTRANS_SERVER_KEY_SANDBOX: z.string().optional(),
  MIDTRANS_SERVER_KEY_PRODUCTION: z.string().optional(),
  NEXT_PUBLIC_MIDTRANS_CLIENT_KEY_SANDBOX: z.string().optional(),
  NEXT_PUBLIC_MIDTRANS_CLIENT_KEY_PRODUCTION: z.string().optional(),

  // Biteship Dual-Slot
  BITESHIP_API_KEY_SANDBOX: z.string().optional(),
  BITESHIP_API_KEY_PRODUCTION: z.string().optional(),
  BITESHIP_ORIGIN_POSTAL_CODE: z.string().length(5, "Kode pos gudang asal harus 5 digit numerik"),
});

// Helper Resolusi Kunci Aktif
export function getMidtransServerKey(): string {
  const isProd = process.env.MIDTRANS_IS_PRODUCTION === "true";
  const key = isProd
    ? process.env.MIDTRANS_SERVER_KEY_PRODUCTION
    : process.env.MIDTRANS_SERVER_KEY_SANDBOX || process.env.MIDTRANS_SERVER_KEY;
  if (!key) throw new Error("Kunci Midtrans Server aktif tidak ditemukan");
  return key;
}

export function getBiteshipApiKey(): string {
  const isProd = process.env.MIDTRANS_IS_PRODUCTION === "true";
  const key = isProd
    ? process.env.BITESHIP_API_KEY_PRODUCTION
    : process.env.BITESHIP_API_KEY_SANDBOX || process.env.BITESHIP_API_KEY;
  if (!key) throw new Error("Kunci Biteship API aktif tidak ditemukan");
  return key;
}
```

Jika aplikasi dijalankan dalam mode produksi (`MIDTRANS_IS_PRODUCTION=true`), sistem secara otomatis memvalidasi keberadaan `MIDTRANS_SERVER_KEY_PRODUCTION` dan `BITESHIP_API_KEY_PRODUCTION` saat proses startup, mencegah kegagalan fatal saat pembeli bertransaksi.
